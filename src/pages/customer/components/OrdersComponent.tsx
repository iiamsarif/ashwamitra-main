import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Package, Calendar, Truck, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";
import { useCustomerOrders, useCancelOrder } from "@/hooks/useApi";
import { razorpayApi } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { toast } from "sonner";

const OrdersComponent = () => {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useCustomerOrders();
  const cancelOrder = useCancelOrder();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  const canRetryRazorpayPayment = (order: any) =>
    order?.paymentMethod === "razorpay" &&
    order?.paymentStatus !== "paid" &&
    order?.status !== "cancelled";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3">Loading orders...</span>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
        <p className="text-gray-500">Start shopping to see your orders here!</p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      confirmed: "bg-blue-100 text-blue-700",
      processing: "bg-indigo-100 text-indigo-700",
      shipped: "bg-purple-100 text-purple-700",
      in_transit: "bg-cyan-100 text-cyan-700",
      delivered: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {status?.replace("_", " ").charAt(0).toUpperCase() + status?.replace("_", " ").slice(1)}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-4 h-4 text-yellow-600" />,
      confirmed: <CheckCircle className="w-4 h-4 text-blue-600" />,
      processing: <Package className="w-4 h-4 text-indigo-600" />,
      shipped: <Truck className="w-4 h-4 text-purple-600" />,
      in_transit: <Truck className="w-4 h-4 text-cyan-600" />,
      delivered: <CheckCircle className="w-4 h-4 text-green-600" />,
      cancelled: <XCircle className="w-4 h-4 text-red-600" />,
    };
    return icons[status] || <Clock className="w-4 h-4 text-gray-400" />;
  };

  const handleCancel = async (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      await cancelOrder.mutateAsync(orderId);
      setSelectedOrder(null);
    }
  };

  const handleRetryRazorpayPayment = async (order: any) => {
    if (!canRetryRazorpayPayment(order)) return;
    setRetryingOrderId(order._id);

    try {
      const config = await razorpayApi.getConfig();
      const razorpayOrder = await razorpayApi.createOrder(order._id);

      const response = await openRazorpayCheckout({
        key: config.keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: razorpayOrder.orderId,
        name: "ASWAMITHRA",
        description: `Order #${order._id?.slice(-8) || ""}`,
      });

      await razorpayApi.verify({
        orderId: order._id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["customerOrders"] }),
        queryClient.invalidateQueries({ queryKey: ["customerDashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["myOrders"] }),
        queryClient.invalidateQueries({ queryKey: ["myPayments"] }),
      ]);
      toast.success("Payment completed.");
      setSelectedOrder(null);
    } catch (error: any) {
      const message = String(error?.message || "");
      if (message.toLowerCase().includes("cancel")) {
        toast.error("Payment is still pending. Retry anytime from Orders.");
      } else {
        toast.error(message || "Failed to complete Razorpay payment.");
      }
    } finally {
      setRetryingOrderId(null);
    }
  };

  const statusFlow = ["pending", "confirmed", "processing", "shipped", "in_transit", "delivered"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
      <h2 className="text-xl font-bold text-green-800">My Orders</h2>

      {orders.map((order: any) => (
        <div key={order._id} onClick={() => setSelectedOrder(order)}
          className="bg-white border border-green-100 rounded-xl p-5 shadow-sm hover:shadow-md transition cursor-pointer hover:border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-green-800">
                {order.items?.map((i: any) => i.productName).join(", ") || "Order"}
              </p>
              <p className="text-sm text-gray-500">
                {order.items?.length} item(s) • {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Order #{order._id?.slice(-8)}</p>
              <p className="text-xs text-gray-500 mt-1">
                Payment: {order.paymentMethod?.toUpperCase()} · {order.paymentStatus || "pending"}
              </p>
              {/* Show estimated delivery date */}
              {order.estimatedDelivery && (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-700 font-medium">
                  <Calendar className="w-3 h-3" />
                  Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString()}
                </div>
              )}
              {order.status === "delivered" && order.actualDelivery && (
                <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                  <CheckCircle className="w-3 h-3" />
                  Delivered: {new Date(order.actualDelivery).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-green-700">₹{order.totalAmount?.toLocaleString()}</p>
              <div className="flex items-center gap-1 justify-end mt-1">
                {getStatusIcon(order.status)}
                {getStatusBadge(order.status)}
              </div>
              {canRetryRazorpayPayment(order) && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handleRetryRazorpayPayment(order);
                  }}
                  disabled={retryingOrderId === order._id}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {retryingOrderId === order._id ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Retry Payment"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Order Details</h3>
                  <p className="text-green-100 text-xs">#{selectedOrder._id?.slice(-8)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white text-lg">×</span>
                </button>
              </div>
              <div className="mt-2">{getStatusBadge(selectedOrder.status)}</div>
            </div>
            <div className="p-5 space-y-4">
              {/* Items */}
              <div className="bg-gray-50 rounded-xl p-4 border">
                <h4 className="text-sm font-bold mb-2">📦 Items</h4>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>{item.productName} × {item.quantity}</span>
                    <span className="font-semibold">₹{item.total?.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-green-700">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h4 className="text-sm font-bold mb-2">📍 Delivery</h4>
                <p className="text-sm text-gray-700">{selectedOrder.deliveryAddress || "N/A"}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Payment: {selectedOrder.paymentMethod?.toUpperCase()} · {selectedOrder.paymentStatus || "pending"}
                </p>
                {selectedOrder.estimatedDelivery && (
                  <div className="mt-2 bg-green-100 rounded-lg p-2 border border-green-200">
                    <p className="text-xs font-medium text-green-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Estimated Delivery: {new Date(selectedOrder.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                )}
                {selectedOrder.trackingNumber && (
                  <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                    <Truck className="w-3 h-3" /> Tracking: {selectedOrder.trackingNumber}
                  </p>
                )}
              </div>

              {/* Order Progress */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="text-sm font-bold mb-3">📊 Order Progress</h4>
                <div className="space-y-2">
                  {statusFlow.map((step, idx) => {
                    const currentIdx = statusFlow.indexOf(selectedOrder.status?.toLowerCase());
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                        } ${isCurrent ? "ring-2 ring-green-400" : ""}`}>
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <span className={`text-xs ${isCompleted ? "font-medium text-green-800" : "text-gray-400"}`}>
                          {step.replace("_", " ").charAt(0).toUpperCase() + step.replace("_", " ").slice(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                {canRetryRazorpayPayment(selectedOrder) && (
                  <button
                    onClick={() => handleRetryRazorpayPayment(selectedOrder)}
                    disabled={retryingOrderId === selectedOrder._id}
                    className="flex-1 py-2.5 rounded-xl border-2 border-amber-300 text-amber-700 font-bold hover:bg-amber-50 disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    {retryingOrderId === selectedOrder._id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Retry Razorpay Payment"
                    )}
                  </button>
                )}
                {["pending", "confirmed"].includes(selectedOrder.status) && (
                  <button onClick={() => handleCancel(selectedOrder._id)}
                    disabled={cancelOrder.isPending}
                    className="flex-1 py-2.5 rounded-xl border-2 border-red-300 text-red-600 font-bold hover:bg-red-50 disabled:opacity-50">
                    {cancelOrder.isPending ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
                <button onClick={() => setSelectedOrder(null)} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersComponent;
