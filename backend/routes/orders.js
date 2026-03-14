const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Farmer = require("../models/Farmer");
const Notification = require("../models/Notification");
const Wallet = require("../models/Wallet");
const { auth, requireRole } = require("../middleware/auth");
const { getPricingAdjustments, applyPricingAdjustment } = require("../utils/pricing");
const { emitRealtimeEvent, EVENT_TYPES } = require("../utils/realtime");

const router = express.Router();

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "in_transit", "delivered", "cancelled"];
const ORDER_PAYMENT_METHODS = ["upi", "bank_transfer", "card", "cod", "wallet", "razorpay"];

const roundCurrency = (value) => Number((Math.round((Number(value) + Number.EPSILON) * 100) / 100).toFixed(2));
const normalizeSubscriptionPlan = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (["daily", "monthly"].includes(normalized)) return normalized;
  return "none";
};

const extractSubscriptionPlan = (rawPlan, notes) => {
  const explicit = normalizeSubscriptionPlan(rawPlan);
  if (explicit !== "none") return explicit;
  if (typeof notes !== "string") return "none";
  const match = notes.match(/subscription:\s*([a-zA-Z]+)/i);
  return normalizeSubscriptionPlan(match?.[1] || "none");
};

const computeOrderCharges = ({ buyerRole, subtotalAmount, subscriptionPlan }) => {
  const subtotal = roundCurrency(subtotalAmount);
  const taxAmount = roundCurrency(subtotal * 0.05);
  let deliveryCharge = 0;
  let discountAmount = 0;

  if (buyerRole === "customer") {
    deliveryCharge = subtotal > 500 ? 0 : 40;
    if (subscriptionPlan === "monthly") discountAmount = roundCurrency(subtotal * 0.1);
    if (subscriptionPlan === "daily") discountAmount = roundCurrency(subtotal * 0.05);
  } else if (buyerRole === "b2b") {
    deliveryCharge = subtotal > 10000 ? 0 : 500;
  }

  const totalAmount = roundCurrency(Math.max(0, subtotal + deliveryCharge + taxAmount - discountAmount));
  return { subtotalAmount: subtotal, deliveryCharge, taxAmount, discountAmount, totalAmount };
};

const aggregateItems = (items = []) => {
  const map = new Map();
  for (const rawItem of items) {
    const productId = String(rawItem?.productId || "").trim();
    const quantity = Number(rawItem?.quantity);
    if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("Each order item must include a valid productId and positive quantity.");
    }
    map.set(productId, (map.get(productId) || 0) + quantity);
  }
  return Array.from(map.entries()).map(([productId, quantity]) => ({ productId, quantity }));
};

const isBuyerOrAdmin = (user, order) => {
  return user.role === "admin" || String(order.buyerId) === String(user._id);
};

const isFarmerParticipant = async (user, order) => {
  if (user.role !== "farmer") return false;

  const farmer = await Farmer.findOne({ userId: user._id }).select("_id");
  if (!farmer) return false;

  const productIds = order.items.map((item) => item.productId);
  const product = await Product.findOne({ _id: { $in: productIds }, farmerId: farmer._id }).select("_id");
  return !!product;
};

const ensureOrderAccess = async (user, order) => {
  if (user.role === "admin") return true;
  if (String(order.buyerId) === String(user._id)) return true;
  return isFarmerParticipant(user, order);
};

const ensureOrderUpdateAccess = async (user, order) => {
  if (user.role === "admin") return true;
  return isFarmerParticipant(user, order);
};

// ========== CREATE ORDER ==========
router.post("/", auth, requireRole("b2b", "customer"), async (req, res) => {
  let session;
  try {
    const { items, deliveryAddress, paymentMethod, notes, walletAmount = 0, subscriptionPlan } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order items are required." });
    }
    if (!deliveryAddress || typeof deliveryAddress !== "string") {
      return res.status(400).json({ error: "Delivery address is required." });
    }
    if (paymentMethod && !ORDER_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method." });
    }
    if (paymentMethod === "razorpay") {
      const pendingRazorpayOrder = await Order.findOne({
        buyerId: req.user._id,
        paymentMethod: "razorpay",
        paymentStatus: { $ne: "paid" },
        status: { $ne: "cancelled" },
      }).select("_id");

      if (pendingRazorpayOrder) {
        return res.status(409).json({
          error: "You already have a pending Razorpay order. Complete it before placing another Razorpay order.",
          pendingOrderId: pendingRazorpayOrder._id,
        });
      }
    }

    const aggregatedItems = aggregateItems(items);
    const productIds = aggregatedItems.map((item) => item.productId);
    session = await mongoose.startSession();
    session.startTransaction();

    // Fetch all products up front for validation and pricing.
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productsById = new Map(products.map((product) => [String(product._id), product]));

    for (const item of aggregatedItems) {
      const product = productsById.get(item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found.`);
      }
      if (!product.isAvailable) {
        throw new Error(`${product.name} is not available.`);
      }
      if (product.availableQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.availableQuantity}`);
      }
      if (product.minimumOrder && item.quantity < product.minimumOrder) {
        throw new Error(`${product.name} minimum order is ${product.minimumOrder}.`);
      }
    }

    const pricingAdjustments = await getPricingAdjustments();
    const orderItems = [];
    let subtotalAmount = 0;

    // Atomically decrement each product to reduce oversell under concurrency.
    for (const item of aggregatedItems) {
      const updated = await Product.findOneAndUpdate(
        {
          _id: item.productId,
          isAvailable: true,
          availableQuantity: { $gte: item.quantity },
        },
        {
          $inc: { availableQuantity: -item.quantity, totalSold: item.quantity },
        },
        { new: true, session }
      );

      if (!updated) {
        throw new Error("One or more products went out of stock while placing this order. Please try again.");
      }

      if (updated.availableQuantity === 0) {
        updated.isAvailable = false;
        await updated.save({ session });
      }

      const effectivePricePerUnit = applyPricingAdjustment(
        updated.pricePerUnit,
        req.user.role,
        pricingAdjustments
      );
      const itemTotal = roundCurrency(effectivePricePerUnit * item.quantity);
      subtotalAmount += itemTotal;

      orderItems.push({
        productId: updated._id,
        productName: updated.name,
        quantity: item.quantity,
        pricePerUnit: effectivePricePerUnit,
        total: itemTotal,
      });
    }

    const resolvedSubscriptionPlan = extractSubscriptionPlan(subscriptionPlan, notes);
    const chargeBreakdown = computeOrderCharges({
      buyerRole: req.user.role,
      subtotalAmount,
      subscriptionPlan: resolvedSubscriptionPlan,
    });

    const requestedWalletAmount = roundCurrency(Number(walletAmount || 0));
    if (!Number.isFinite(requestedWalletAmount) || requestedWalletAmount < 0) {
      throw new Error("Wallet amount must be a valid non-negative number.");
    }

    let walletUsedAmount = 0;
    if (requestedWalletAmount > 0) {
      const wallet = await Wallet.findOne({ userId: req.user._id }).session(session);
      if (!wallet || wallet.balance < requestedWalletAmount) {
        throw new Error("Insufficient wallet balance.");
      }
      walletUsedAmount = Math.min(requestedWalletAmount, chargeBreakdown.totalAmount);
      wallet.balance = roundCurrency(wallet.balance - walletUsedAmount);
      wallet.transactions.unshift({
        amount: walletUsedAmount,
        type: "debit",
        description: `Order payment (pending confirmation)`,
      });
      await wallet.save({ session });
    }

    const payableAmount = roundCurrency(Math.max(0, chargeBreakdown.totalAmount - walletUsedAmount));
    if (payableAmount > 0 && paymentMethod === "wallet") {
      throw new Error("Select a valid payment method for the remaining payable amount.");
    }
    const resolvedPaymentMethod = payableAmount === 0 ? "wallet" : (paymentMethod || "upi");

    const order = new Order({
      buyerId: req.user._id,
      buyerRole: req.user.role,
      items: orderItems,
      subtotalAmount: chargeBreakdown.subtotalAmount,
      deliveryCharge: chargeBreakdown.deliveryCharge,
      taxAmount: chargeBreakdown.taxAmount,
      discountAmount: chargeBreakdown.discountAmount,
      walletUsedAmount,
      payableAmount,
      subscriptionPlan: resolvedSubscriptionPlan,
      totalAmount: chargeBreakdown.totalAmount,
      deliveryAddress: deliveryAddress.trim(),
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: payableAmount === 0 ? "paid" : "pending",
      status: payableAmount === 0 ? "confirmed" : "pending",
      notes: notes || "",
    });

    await order.save({ session });
    await session.commitTransaction();
    session.endSession();
    session = null;

    // Notify farmers
    const farmerProductIds = [...new Set(orderItems.map((i) => i.productId))];
    for (const pid of farmerProductIds) {
      const product = await Product.findById(pid).populate("farmerId");
      if (product && product.farmerId) {
        await new Notification({
          userId: product.farmerId.userId,
          type: "product_sold",
          title: "New Order Received!",
          message: `${product.name} ordered by a ${req.user.role === "b2b" ? "business" : "customer"}.`,
          data: { orderId: order._id },
        }).save();
      }
    }

    const io = req.app.get("io");
    if (io) {
      emitRealtimeEvent(io, EVENT_TYPES.NEW_ORDER, {
        orderId: order._id,
        buyerId: order.buyerId,
        buyerRole: order.buyerRole,
        totalAmount: order.totalAmount,
        payableAmount: order.payableAmount,
        status: order.status,
      });
    }

    res.status(201).json(order);
  } catch (err) {
    if (session) {
      try {
        await session.abortTransaction();
      } catch {}
      session.endSession();
    }
    if (String(err?.message || "").includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    if (
      String(err?.message || "").includes("Insufficient")
      || String(err?.message || "").includes("minimum order")
      || String(err?.message || "").includes("not available")
      || String(err?.message || "").includes("valid non-negative")
      || String(err?.message || "").includes("Select a valid payment method")
    ) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// ========== GET MY ORDERS ==========
router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate("items.productId")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GET ORDER BY ID ==========
router.get("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid order id." });
    }

    const order = await Order.findById(req.params.id)
      .populate("buyerId", "name email phone")
      .populate("items.productId");

    if (!order) return res.status(404).json({ error: "Order not found." });

    const canAccess = await ensureOrderAccess(req.user, order);
    if (!canAccess) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== UPDATE ORDER STATUS ==========
router.put("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid order status." });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    const canUpdate = await ensureOrderUpdateAccess(req.user, order);
    if (!canUpdate) {
      return res.status(403).json({ error: "Access denied." });
    }

    order.status = status;
    order.updatedAt = new Date();
    if (status === "delivered") {
      order.actualDelivery = new Date();
    }
    await order.save();

    // Notify buyer
    await new Notification({
      userId: order.buyerId,
      type: "order_update",
      title: "Order Status Updated",
      message: `Order #${order._id.toString().slice(-6)} is now ${status}.`,
      data: { orderId: order._id },
    }).save();

    const io = req.app.get("io");
    if (io) {
      emitRealtimeEvent(io, EVENT_TYPES.ORDER_STATUS_UPDATE, {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      }, null, String(order.buyerId));
      emitRealtimeEvent(io, EVENT_TYPES.ORDER_STATUS_UPDATE, {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      }, "admin");
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== CANCEL ORDER ==========
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found." });

    if (!isBuyerOrAdmin(req.user, order)) {
      return res.status(403).json({ error: "Access denied." });
    }
    if (["shipped", "in_transit", "delivered"].includes(order.status)) {
      return res.status(400).json({ error: "Cannot cancel order after shipping." });
    }
    if (order.status === "cancelled") {
      return res.json({ message: "Order already cancelled.", order });
    }

    // Restore product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { availableQuantity: item.quantity, totalSold: -item.quantity },
        isAvailable: true,
      });
    }

    order.status = "cancelled";
    order.updatedAt = new Date();
    await order.save();

    if (Number(order.walletUsedAmount || 0) > 0) {
      let wallet = await Wallet.findOne({ userId: order.buyerId });
      if (!wallet) {
        wallet = new Wallet({ userId: order.buyerId, balance: 0, transactions: [] });
      }
      wallet.balance = roundCurrency(wallet.balance + Number(order.walletUsedAmount || 0));
      wallet.transactions.unshift({
        amount: Number(order.walletUsedAmount || 0),
        type: "credit",
        description: `Wallet refund for cancelled order #${order._id.toString().slice(-8)}`,
      });
      await wallet.save();
    }

    const io = req.app.get("io");
    if (io) {
      emitRealtimeEvent(io, EVENT_TYPES.ORDER_STATUS_UPDATE, {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      }, null, String(order.buyerId));
      emitRealtimeEvent(io, EVENT_TYPES.ORDER_STATUS_UPDATE, {
        orderId: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      }, "admin");
    }

    res.json({ message: "Order cancelled.", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
