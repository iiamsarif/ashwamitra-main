import React, { useState } from "react";
import { Package, MapPin, CreditCard, User, Phone, Calendar, Truck, X, CheckCircle, AlertCircle, Plus, Minus, ShoppingCart, Trash2 } from "lucide-react";
import { useBusinessOrders, useCreateOrder } from "@/hooks/useApi";
import { razorpayApi } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { toast } from "sonner";
import MapboxLocationPicker, { LocationData } from "@/components/map/MapboxLocationPicker";

type Product = {
  _id: string;
  name: string;
  farmerName?: string;
  village?: string;
  pricePerUnit: number;
  unit: string;
  minimumOrder?: number;
  imageUrl?: string;
};

type B2BCartProps = {
  cart: Map<string, number>;
  products: any[];
  onUpdateCart?: (cart: Map<string, number>) => void;
  onGoToOrders?: () => void;
};

const getInitialDeliveryInfo = () => ({
  businessName: "", contactPerson: "", phone: "", email: "",
  deliveryAddress: "", city: "", state: "", pincode: "",
  deliveryDate: "", deliveryTime: "", paymentMethod: "bank_transfer",
  specialInstructions: "",
});

const B2BCart: React.FC<B2BCartProps> = ({ cart, products, onUpdateCart, onGoToOrders }) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const createOrder = useCreateOrder();
  const { data: orders } = useBusinessOrders();

  const [deliveryInfo, setDeliveryInfo] = useState(getInitialDeliveryInfo);

  const cartItems = Array.from(cart.entries()).map(([productId, quantity]) => {
    const product = (products || []).find((p: any) => p._id === productId);
    if (!product) return null;
    return {
      _id: productId,
      name: product.name,
      farmerName: product.farmerName || "Farmer",
      pricePerUnit: product.pricePerUnit,
      quantity,
      unit: product.unit || "kg",
      minimumOrder: product.minimumOrder || 1,
      imageUrl: product.imageUrl,
    };
  }).filter(Boolean) as any[];

  const total = cartItems.reduce((sum, item) => sum + item.pricePerUnit * item.quantity, 0);
  const deliveryCharge = total > 10000 ? 0 : 500;
  const tax = Math.round(total * 0.05);
  const finalTotal = total + deliveryCharge + tax;
  const pendingRazorpayOrder = (orders || []).find(
    (order: any) =>
      order.paymentMethod === "razorpay" &&
      order.paymentStatus !== "paid" &&
      order.status !== "cancelled"
  );
  const hasPendingRazorpayOrder = Boolean(pendingRazorpayOrder);

  const updateQuantity = (productId: string, newQuantity: number) => {
    const newCart = new Map(cart);
    if (newQuantity <= 0) newCart.delete(productId);
    else newCart.set(productId, newQuantity);
    onUpdateCart?.(newCart);
  };

  const removeItem = (productId: string) => {
    const newCart = new Map(cart);
    newCart.delete(productId);
    onUpdateCart?.(newCart);
    toast.success("Item removed from cart");
  };

  const handlePlaceOrder = async () => {
    if (!deliveryInfo.businessName || !deliveryInfo.contactPerson || !deliveryInfo.phone || !deliveryInfo.deliveryAddress) {
      toast.error("Please fill in all required delivery information");
      return;
    }
    if (deliveryInfo.paymentMethod === "razorpay" && hasPendingRazorpayOrder) {
      toast.error("You already have a pending Razorpay payment. Complete it from Orders.");
      onGoToOrders?.();
      return;
    }

    try {
      const createdOrder = await createOrder.mutateAsync({
        items: cartItems.map(item => ({
          productId: item._id, productName: item.name, quantity: item.quantity,
          pricePerUnit: item.pricePerUnit, total: item.pricePerUnit * item.quantity
        })),
        deliveryAddress: `${deliveryInfo.deliveryAddress}, ${deliveryInfo.city}, ${deliveryInfo.state} - ${deliveryInfo.pincode}`,
        paymentMethod: deliveryInfo.paymentMethod,
        notes: `Business: ${deliveryInfo.businessName} | Contact: ${deliveryInfo.contactPerson} | ${deliveryInfo.specialInstructions}`
      });

      if (deliveryInfo.paymentMethod === "razorpay") {
        try {
          const config = await razorpayApi.getConfig();
          const razorpayOrder = await razorpayApi.createOrder(createdOrder._id);

          const response = await openRazorpayCheckout({
            key: config.keyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            orderId: razorpayOrder.orderId,
            name: "ASWAMITHRA",
            description: `B2B Order #${createdOrder._id?.slice(-8) || ""}`,
            prefill: {
              name: deliveryInfo.contactPerson,
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
          toast.error("Order created but payment is pending. Retry it from Orders.");
          onGoToOrders?.();
          return;
        }
      }

      onUpdateCart?.(new Map());
      setOrderPlaced(true);
      setTimeout(() => {
        setOrderPlaced(false);
        setShowCheckout(false);
        setDeliveryInfo(getInitialDeliveryInfo());
      }, 3000);
    } catch (error: any) {
      toast.error(error.message || "Failed to place order");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" /> B2B Shopping Cart
        {cartItems.length > 0 && <span className="text-sm font-normal text-gray-500">({cartItems.length} items)</span>}
      </h2>
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
        <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">Your cart is empty</h3>
          <p className="text-gray-500">Browse products to add bulk items!</p>
        </div>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-lg" /> : <Package className="w-6 h-6 text-blue-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base sm:text-lg">{item.name}</h3>
                    <p className="text-sm text-gray-500">Farmer: {item.farmerName}</p>
                    <p className="text-xs text-gray-400">₹{item.pricePerUnit}/{item.unit} • Min: {item.minimumOrder} {item.unit}</p>
                  </div>
                </div>
                <div className="text-right flex items-start gap-2">
                  <div>
                    <p className="font-bold text-blue-700 text-base sm:text-lg">₹{(item.pricePerUnit * item.quantity).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                  </div>
                  <button onClick={() => removeItem(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Remove item">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                <span className="text-sm font-medium text-gray-700">Quantity:</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= item.minimumOrder}
                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center disabled:opacity-50">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span>₹{total.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Delivery</span><span>{deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryCharge}`}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Tax (5%)</span><span>₹{tax}</span></div>
              {total <= 10000 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                  <AlertCircle className="w-4 h-4 inline mr-1" /> Add ₹{(10001 - total).toLocaleString()} more for FREE delivery!
                </div>
              )}
              <div className="border-t border-blue-200 pt-3 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl font-bold text-blue-700">₹{finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button onClick={() => setShowCheckout(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 sm:py-4 rounded-xl font-semibold transition-all shadow-lg hover:scale-[1.02]">
            Proceed to Checkout
          </button>
        </>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCheckout(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5" />
                  <div><h3 className="text-lg sm:text-xl font-bold">B2B Checkout</h3><p className="text-blue-100 text-sm">Complete your bulk order</p></div>
                </div>
                <button onClick={() => setShowCheckout(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><span className="text-white text-lg">×</span></button>
              </div>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {orderPlaced ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Order Placed!</h3>
                  <p className="text-gray-600">Your bulk order has been sent to the farmer.</p>
                  <p className="text-2xl font-bold text-green-700 mt-4">₹{finalTotal.toLocaleString()}</p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 rounded-xl p-4 border">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Business Information</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div><label className="text-xs font-medium block mb-1">Business Name *</label>
                        <input type="text" value={deliveryInfo.businessName} onChange={(e) => setDeliveryInfo({...deliveryInfo, businessName: e.target.value})}
                          className="w-full p-2 border rounded-lg text-sm" /></div>
                      <div><label className="text-xs font-medium block mb-1">Contact Person *</label>
                        <input type="text" value={deliveryInfo.contactPerson} onChange={(e) => setDeliveryInfo({...deliveryInfo, contactPerson: e.target.value})}
                          className="w-full p-2 border rounded-lg text-sm" /></div>
                      <div><label className="text-xs font-medium block mb-1">Phone *</label>
                        <input type="tel" value={deliveryInfo.phone} onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                          className="w-full p-2 border rounded-lg text-sm" /></div>
                      <div><label className="text-xs font-medium block mb-1">Email</label>
                        <input type="email" value={deliveryInfo.email} onChange={(e) => setDeliveryInfo({...deliveryInfo, email: e.target.value})}
                          className="w-full p-2 border rounded-lg text-sm" /></div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4 border">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Delivery Address</h4>
                    <textarea value={deliveryInfo.deliveryAddress} onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryAddress: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm h-16 resize-none mb-3" placeholder="Full address" />
                    
                    {/* Map for delivery location */}
                    <MapboxLocationPicker
                      label="Pin Delivery Location"
                      height="200px"
                      onLocationSelect={(loc: LocationData) => {
                        setDeliveryInfo(prev => ({
                          ...prev,
                          deliveryAddress: loc.fullAddress || loc.address || prev.deliveryAddress,
                          city: loc.city || prev.city,
                          state: loc.state || prev.state,
                          pincode: loc.pincode || prev.pincode,
                        }));
                      }}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                      <input type="text" value={deliveryInfo.city} onChange={(e) => setDeliveryInfo({...deliveryInfo, city: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm" placeholder="City" />
                      <input type="text" value={deliveryInfo.state} onChange={(e) => setDeliveryInfo({...deliveryInfo, state: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm" placeholder="State" />
                      <input type="text" value={deliveryInfo.pincode} onChange={(e) => setDeliveryInfo({...deliveryInfo, pincode: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm" placeholder="Pincode" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Preferred Delivery</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="date" value={deliveryInfo.deliveryDate} onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryDate: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm" />
                      <select value={deliveryInfo.deliveryTime} onChange={(e) => setDeliveryInfo({...deliveryInfo, deliveryTime: e.target.value})}
                        className="w-full p-2 border rounded-lg text-sm">
                        <option value="">Select Time</option>
                        <option value="6am-9am">6 AM - 9 AM</option>
                        <option value="9am-12pm">9 AM - 12 PM</option>
                        <option value="12pm-3pm">12 PM - 3 PM</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-4 border">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment</h4>
                    {[
                      { value: "bank_transfer", label: "Bank Transfer", desc: "NEFT/RTGS" },
                      { value: "upi", label: "UPI", desc: "Pay via UPI" },
                      { value: "razorpay", label: "Pay with Razorpay", desc: "Secure online payment" },
                      { value: "cod", label: "Cash on Delivery", desc: "Pay on receipt" },
                    ].map(opt => (
                      <label key={opt.value} className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-gray-50 mb-2">
                        <input type="radio" name="payment" value={opt.value}
                          checked={deliveryInfo.paymentMethod === opt.value}
                          onChange={(e) => setDeliveryInfo({...deliveryInfo, paymentMethod: e.target.value})} />
                        <div><p className="text-sm font-medium">{opt.label}</p><p className="text-xs text-gray-500">{opt.desc}</p></div>
                      </label>
                    ))}
                    {deliveryInfo.paymentMethod === "razorpay" && hasPendingRazorpayOrder && (
                      <p className="text-xs text-amber-700 bg-amber-100 border border-amber-200 rounded-lg p-2">
                        Complete pending Razorpay payment from Orders before starting a new Razorpay checkout.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium block mb-1">Special Instructions</label>
                    <textarea value={deliveryInfo.specialInstructions} onChange={(e) => setDeliveryInfo({...deliveryInfo, specialInstructions: e.target.value})}
                      className="w-full p-2 border rounded-lg text-sm h-16 resize-none" placeholder="Any special requirements..." />
                  </div>

                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm mb-2"><span>Delivery</span><span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span></div>
                    <div className="flex justify-between text-sm mb-2"><span>Tax</span><span>₹{tax}</span></div>
                    <div className="border-t pt-2 flex justify-between font-bold text-lg"><span>Total</span><span className="text-blue-700">₹{finalTotal.toLocaleString()}</span></div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={createOrder.isPending || (deliveryInfo.paymentMethod === "razorpay" && hasPendingRazorpayOrder)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg disabled:opacity-50">
                    {createOrder.isPending
                      ? "Processing..."
                      : deliveryInfo.paymentMethod === "razorpay" && hasPendingRazorpayOrder
                      ? "Complete Pending Razorpay Order First"
                      : `Place Bulk Order • ₹${finalTotal.toLocaleString()}`}
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

export default B2BCart;
