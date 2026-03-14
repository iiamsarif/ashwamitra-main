import React, { useState } from "react";
import { Package, MapPin, CreditCard, User, Phone, Mail, Calendar, Truck, X, CheckCircle, AlertCircle, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react";
import WalletCheckoutIntegration from "../../../components/wallet/WalletCheckoutIntegration";
import MapboxLocationPicker, { LocationData } from "@/components/map/MapboxLocationPicker";
import { razorpayApi } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { useCreateOrder, useCustomerOrders } from "@/hooks/useApi";
import { toast } from "sonner";

type CartItem = {
  _id: string;
  name: string;
  farmerName?: string;
  village?: string;
  pricePerUnit: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
  quality?: string;
  isOrganic?: boolean;
};

type Product = {
  _id: string;
  name: string;
  farmerName?: string;
  village?: string;
  district?: string;
  state?: string;
  category: string;
  pricePerUnit: number;
  price?: number;
  marketPrice?: number;
  availableQuantity: number;
  minimumOrder: number;
  unit: string;
  imageUrl?: string;
  quality?: string;
  isOrganic?: boolean;
};

type CartComponentProps = {
  cart: Map<string, number>;
  products: Product[];
  onUpdateCart?: (cart: Map<string, number>) => void;
  onGoToOrders?: () => void;
};

const getInitialDeliveryInfo = () => ({
  name: "",
  phone: "",
  email: "",
  address: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  deliveryDate: "",
  deliveryTime: "",
  paymentMethod: "cod",
  subscription: "none",
});

const CartComponent: React.FC<CartComponentProps> = ({ cart, products, onUpdateCart, onGoToOrders }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [useWallet, setUseWallet] = useState(false);
  const [walletAmount, setWalletAmount] = useState(0);
  const [deliveryInfo, setDeliveryInfo] = useState(getInitialDeliveryInfo);

  const createOrder = useCreateOrder();
  const { data: orders } = useCustomerOrders();

  const updateQuantity = (productId: string, newQuantity: number) => {
    const newCart = new Map(cart);
    if (newQuantity <= 0) {
      newCart.delete(productId);
    } else {
      newCart.set(productId, newQuantity);
    }
    onUpdateCart?.(newCart);
  };

  const cartItems: CartItem[] = Array.from(cart.entries()).map(([productId, quantity]) => {
    const product = products.find(p => p._id === productId);
    if (!product) return null;
    return {
      _id: productId,
      name: product.name,
      farmerName: product.farmerName || "Local Farmer",
      village: product.village,
      pricePerUnit: product.pricePerUnit,
      quantity,
      unit: product.unit || "kg",
      imageUrl: product.imageUrl,
      quality: product.quality,
      isOrganic: product.isOrganic
    };
  }).filter(Boolean) as CartItem[];

  const total = cartItems.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  const deliveryCharge = total > 500 ? 0 : 40;
  const tax = Math.round(total * 0.05);
  const subscriptionDiscount = deliveryInfo.subscription === "monthly"
    ? Math.round(total * 0.10)
    : deliveryInfo.subscription === "daily"
    ? Math.round(total * 0.05)
    : 0;
  const finalTotal = total + deliveryCharge + tax - subscriptionDiscount;
  const monthlyTotal = deliveryInfo.subscription === "daily" ? finalTotal * 30 : finalTotal;
  const remainingAmount = useWallet ? monthlyTotal - walletAmount : monthlyTotal;
  const pendingRazorpayOrder = (orders || []).find(
    (order: any) =>
      order.paymentMethod === "razorpay" &&
      order.paymentStatus !== "paid" &&
      order.status !== "cancelled"
  );
  const hasPendingRazorpayOrder = Boolean(pendingRazorpayOrder);
  const isRazorpayBlocked = deliveryInfo.paymentMethod === "razorpay" && remainingAmount > 0 && hasPendingRazorpayOrder;

  const handlePlaceOrder = async () => {
    if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
      toast.error("Please fill in all required delivery information");
      return;
    }
    if (isRazorpayBlocked) {
      toast.error("You already have a pending Razorpay payment. Complete it from Orders.");
      onGoToOrders?.();
      return;
    }

    try {
      // 1. Create order via backend (includes wallet deduction atomically).
      const orderData: any = {
        items: cartItems.map(item => ({
          productId: item._id,
          productName: item.name,
          quantity: item.quantity,
          pricePerUnit: item.pricePerUnit,
          total: item.pricePerUnit * item.quantity
        })),
        deliveryAddress: `${deliveryInfo.address}, ${deliveryInfo.city}, ${deliveryInfo.state} - ${deliveryInfo.pincode}`,
        paymentMethod: useWallet && remainingAmount === 0 ? "wallet" : deliveryInfo.paymentMethod,
        walletAmount: useWallet ? walletAmount : 0,
        subscriptionPlan: deliveryInfo.subscription,
        notes: deliveryInfo.subscription !== "none"
          ? `Subscription: ${deliveryInfo.subscription} | Wallet used: ₹${walletAmount}`
          : useWallet ? `Wallet used: ₹${walletAmount}` : ""
      };

      const createdOrder = await createOrder.mutateAsync(orderData);

      // 2. Collect remaining amount through Razorpay when selected.
      if (orderData.paymentMethod === "razorpay" && remainingAmount > 0) {
        try {
          const config = await razorpayApi.getConfig();
          const razorpayOrder = await razorpayApi.createOrder(createdOrder._id);

          const response = await openRazorpayCheckout({
            key: config.keyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: razorpayOrder.orderId,
            name: "ASWAMITHRA",
            description: `Order #${createdOrder._id?.slice(-8) || ""}`,
            prefill: {
              name: deliveryInfo.name,
              email: deliveryInfo.email,
              contact: deliveryInfo.phone,
            },
            notes: { marketplaceOrderId: createdOrder._id },
          });

          await razorpayApi.verify({
            orderId: createdOrder._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        } catch {
          onUpdateCart?.(new Map());
          setShowCheckout(false);
          setDeliveryInfo(getInitialDeliveryInfo());
          setUseWallet(false);
          setWalletAmount(0);
          toast.error("Order created but payment is pending. Retry it from Orders.");
          onGoToOrders?.();
          return;
        }
      }

      // 3. Emit subscription event if applicable
      if (deliveryInfo.subscription !== "none") {
        const today = new Date();
        const startDate = today.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        const endDate = new Date(new Date().setMonth(new Date().getMonth() + 12)).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

        window.dispatchEvent(new CustomEvent("subscriptionUpdate", {
          detail: {
            subscription: {
              type: deliveryInfo.subscription,
              status: "active",
              startDate,
              endDate,
              discount: deliveryInfo.subscription === "monthly" ? 10 : 5,
              deliveryFrequency: deliveryInfo.subscription === "daily" ? "daily" : "monthly"
            }
          }
        }));
      }

      // 4. Clear cart
      onUpdateCart?.(new Map());
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
        setShowCheckout(false);
        setDeliveryInfo(getInitialDeliveryInfo());
        setUseWallet(false);
        setWalletAmount(0);
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <h2 className="text-xl font-bold text-green-800">Shopping Cart</h2>
      {hasPendingRazorpayOrder && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-amber-900">Pending Razorpay payment detected</p>
            <p className="text-xs text-amber-700">
              Order #{pendingRazorpayOrder?._id?.slice(-8)} is awaiting payment. Complete it from Orders before starting another Razorpay payment.
            </p>
          </div>
          {onGoToOrders && (
            <button
              onClick={onGoToOrders}
              className="px-3 py-2 text-sm font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700"
            >
              Go to Orders
            </button>
          )}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="bg-white border border-green-100 rounded-xl p-12 text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-3">Your cart is empty</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Start shopping to add some delicious farm-fresh items!
          </p>
        </div>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item._id} className="bg-white border border-green-100 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <Package className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Farmer: {item.farmerName}</p>
                    <p className="text-xs text-gray-400">₹{item.pricePerUnit}/{item.unit}</p>
                  </div>
                </div>
                <div className="text-right flex items-start gap-2">
                  <div>
                    <p className="font-bold text-green-700">₹{item.pricePerUnit * item.quantity}</p>
                    <p className="text-xs text-gray-500">{item.quantity} {item.unit}</p>
                  </div>
                  <button onClick={() => updateQuantity(item._id, 0)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition" title="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1}
                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center disabled:opacity-50">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-gray-800">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Cart Summary */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">₹{total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Charge</span>
                <span className="font-medium">{deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryCharge}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax (5%)</span>
                <span className="font-medium">₹{tax}</span>
              </div>
              {total <= 500 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Add ₹{501 - total} more for FREE delivery!
                </div>
              )}
              <div className="border-t border-green-200 pt-3 flex justify-between">
                <span className="text-lg font-bold text-green-800">Total Amount</span>
                <span className="text-xl font-bold text-green-700">₹{finalTotal}</span>
              </div>
            </div>
          </div>

          <button onClick={() => setShowCheckout(true)}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg">
            Proceed to Checkout
          </button>
        </>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setShowCheckout(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] shadow-xl border border-gray-100 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold">Checkout</h3>
                    <p className="text-green-100 text-xs">Complete your order</p>
                  </div>
                </div>
                <button onClick={() => setShowCheckout(false)}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30">
                  <span className="text-white text-lg">×</span>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
              {orderPlaced ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-2">Order Placed Successfully!</h3>
                  <p className="text-gray-600 mb-4">Your order has been placed and will be delivered soon.</p>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-2">Order Total</p>
                    <p className="text-2xl font-bold text-green-700">₹{remainingAmount}</p>
                    {useWallet && walletAmount > 0 && (
                      <p className="text-sm text-green-600 mt-1">₹{walletAmount} paid from wallet</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Delivery Information */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Delivery Information
                    </h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Full Name *</label>
                          <input type="text" value={deliveryInfo.name}
                            onChange={(e) => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm"
                            placeholder="John Doe" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Phone *</label>
                          <input type="tel" value={deliveryInfo.phone}
                            onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm"
                            placeholder="+91 98765 43210" />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Email</label>
                        <input type="email" value={deliveryInfo.email}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, email: e.target.value})}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm"
                          placeholder="john@example.com" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Address *</label>
                        <textarea value={deliveryInfo.address}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none resize-none h-16 text-sm"
                          placeholder="123 Main Street, Area Name" />
                      </div>

                      {/* Map for delivery location */}
                      <MapboxLocationPicker
                        label="Pin Delivery Location"
                        height="200px"
                        onLocationSelect={(loc: LocationData) => {
                          setDeliveryInfo(prev => ({
                            ...prev,
                            address: loc.fullAddress || loc.address || prev.address,
                            city: loc.city || prev.city,
                            state: loc.state || prev.state,
                            pincode: loc.pincode || prev.pincode,
                          }));
                        }}
                      />

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">City</label>
                          <input type="text" value={deliveryInfo.city}
                            onChange={(e) => setDeliveryInfo({...deliveryInfo, city: e.target.value})}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm"
                            placeholder="Hyderabad" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">State</label>
                          <input type="text" value={deliveryInfo.state}
                            onChange={(e) => setDeliveryInfo({...deliveryInfo, state: e.target.value})}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm"
                            placeholder="Telangana" />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Pincode</label>
                          <input type="text" value={deliveryInfo.pincode}
                            onChange={(e) => setDeliveryInfo({...deliveryInfo, pincode: e.target.value})}
                            className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm"
                            placeholder="500001" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Schedule */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Delivery Schedule
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Delivery Date</label>
                        <input type="date" value={deliveryInfo.deliveryDate}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryDate: e.target.value})}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 mb-1 block">Delivery Time</label>
                        <select value={deliveryInfo.deliveryTime}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryTime: e.target.value})}
                          className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none text-sm">
                          <option value="">Select Time</option>
                          <option value="9am-12pm">9 AM - 12 PM</option>
                          <option value="12pm-3pm">12 PM - 3 PM</option>
                          <option value="3pm-6pm">3 PM - 6 PM</option>
                          <option value="6pm-9pm">6 PM - 9 PM</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Option */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-purple-600" /> Subscription (Optional)
                    </h4>
                    <div className="space-y-3">
                      {[
                        { value: "none", label: "No Subscription", desc: "One-time purchase only" },
                        { value: "daily", label: "Daily Subscription", desc: "5% off · Daily delivery · Free delivery" },
                        { value: "monthly", label: "Monthly Subscription", desc: "10% off · Priority delivery · Seasonal products" },
                      ].map(opt => (
                        <label key={opt.value} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="subscription" value={opt.value}
                            checked={deliveryInfo.subscription === opt.value}
                            onChange={(e) => setDeliveryInfo({...deliveryInfo, subscription: e.target.value})}
                            className="text-purple-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.desc}</p>
                          </div>
                        </label>
                      ))}

                      {deliveryInfo.subscription !== "none" && (
                        <div className="bg-purple-100 rounded-lg p-3 border border-purple-200">
                          <p className="text-xs font-medium text-purple-800 mb-1">
                            {deliveryInfo.subscription === "daily" ? "Daily" : "Monthly"} Benefits:
                          </p>
                          <ul className="text-xs text-purple-700 space-y-1">
                            {deliveryInfo.subscription === "daily" ? (
                              <>
                                <li>• 5% discount on all orders</li>
                                <li>• Daily delivery to your home</li>
                                <li>• Free delivery on all orders</li>
                                <li>• Fresh products every day</li>
                              </>
                            ) : (
                              <>
                                <li>• 10% discount on all orders</li>
                                <li>• Priority delivery</li>
                                <li>• Free delivery on orders above ₹500</li>
                                <li>• Exclusive seasonal products</li>
                              </>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" /> Payment Method
                    </h4>
                    <div className="space-y-2">
                      {[
                        { value: "cod", label: "Cash on Delivery", desc: "Pay when you receive" },
                        { value: "upi", label: "UPI Payment", desc: "Pay via UPI instantly" },
                        { value: "razorpay", label: "Pay with Razorpay", desc: "Secure online payment via Razorpay" },
                      ].map(opt => (
                        <label key={opt.value} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input type="radio" name="payment" value={opt.value}
                            checked={deliveryInfo.paymentMethod === opt.value}
                            onChange={(e) => setDeliveryInfo({...deliveryInfo, paymentMethod: e.target.value})}
                            className="text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{opt.label}</p>
                            <p className="text-xs text-gray-500">{opt.desc}</p>
                          </div>
                        </label>
                      ))}
                      {deliveryInfo.paymentMethod === "razorpay" && hasPendingRazorpayOrder && (
                        <p className="text-xs text-amber-700 bg-amber-100 border border-amber-200 rounded-lg p-2">
                          Complete pending Razorpay payment from Orders before starting a new Razorpay checkout.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Wallet Integration - connected to backend */}
                  <WalletCheckoutIntegration
                    orderTotal={monthlyTotal}
                    onWalletAmountChange={setWalletAmount}
                    onUseWalletChange={setUseWallet}
                  />

                  {/* Order Summary */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Order Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₹{total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium">{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Tax</span>
                        <span className="font-medium">₹{tax}</span>
                      </div>
                      {subscriptionDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-purple-600">
                            Subscription Discount ({deliveryInfo.subscription === "monthly" ? "10%" : "5%"})
                          </span>
                          <span className="font-medium text-purple-600">-₹{subscriptionDiscount}</span>
                        </div>
                      )}
                      {useWallet && walletAmount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">Wallet Deduction</span>
                          <span className="font-medium text-green-600">-₹{walletAmount}</span>
                        </div>
                      )}
                      <div className="border-t border-green-200 pt-2 flex justify-between">
                        <div>
                          <span className="text-lg font-bold text-green-800">
                            {deliveryInfo.subscription === "daily" ? "Monthly Total (30 days)" : "Total"}
                          </span>
                          {deliveryInfo.subscription === "daily" && (
                            <p className="text-xs text-gray-500">Daily: ₹{finalTotal} × 30 days</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-green-700">
                            ₹{useWallet && walletAmount > 0 ? remainingAmount : monthlyTotal}
                          </span>
                          {useWallet && walletAmount > 0 && (
                            <p className="text-xs text-green-600">Wallet: -₹{walletAmount}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Place Order Button */}
                  <button onClick={handlePlaceOrder}
                    disabled={createOrder.isPending || isRazorpayBlocked}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:opacity-90 transition-opacity shadow-lg disabled:opacity-50">
                    {createOrder.isPending
                      ? "Processing..."
                      : isRazorpayBlocked
                      ? "Complete Pending Razorpay Order First"
                      : `Place Order • ₹${useWallet && walletAmount > 0 ? remainingAmount : monthlyTotal}${
                          useWallet && remainingAmount === 0 ? " (Paid with Wallet)" : ""
                        }`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartComponent;
