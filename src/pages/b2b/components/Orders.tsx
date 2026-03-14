import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useBusinessOrders } from "@/hooks/useApi";
import { razorpayApi } from "@/lib/api";
import { openRazorpayCheckout } from "@/lib/razorpay";
import { toast } from "sonner";
import { Package, MapPin, Calendar, Truck, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react";

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { data: orders, isLoading, error } = useBusinessOrders();
  const [filter, setFilter] = useState<string>("All");
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  const canRetryRazorpayPayment = (order: any) =>
    order?.paymentMethod === "razorpay" &&
    order?.paymentStatus !== "paid" &&
    order?.status !== "cancelled";

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
        description: `B2B Order #${order._id?.slice(-8) || ""}`,
      });

      await razorpayApi.verify({
        orderId: order._id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["businessOrders"] }),
        queryClient.invalidateQueries({ queryKey: ["businessDashboard"] }),
        queryClient.invalidateQueries({ queryKey: ["myOrders"] }),
        queryClient.invalidateQueries({ queryKey: ["businessPayments"] }),
        queryClient.invalidateQueries({ queryKey: ["myPayments"] }),
      ]);
      toast.success("Payment completed.");
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

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
      confirmed: "bg-blue-100 text-blue-700 border border-blue-300",
      processing: "bg-indigo-100 text-indigo-700 border border-indigo-300",
      shipped: "bg-purple-100 text-purple-700 border border-purple-300",
      in_transit: "bg-cyan-100 text-cyan-700 border border-cyan-300",
      delivered: "bg-green-100 text-green-700 border border-green-300",
      cancelled: "bg-red-100 text-red-700 border border-red-300",
    };
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      processing: <Package className="w-3 h-3" />,
      shipped: <Truck className="w-3 h-3" />,
      in_transit: <Truck className="w-3 h-3" />,
      delivered: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${styles[status] || styles.pending}`}>
        {icons[status]}
        {status?.replace("_", " ").charAt(0).toUpperCase() + status?.replace("_", " ").slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load orders</h3>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h3>
          <p className="text-gray-500">Browse products and place bulk orders!</p>
        </div>
      </div>
    );
  }

  const filteredOrders = filter === "All" ? orders : orders.filter((o: any) => o.status === filter.toLowerCase());
  const isStandaloneOrdersPage = location.pathname === "/b2b/orders";

  return (
    <div className="space-y-6">
      {isStandaloneOrdersPage && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4">
          <button
            onClick={() => navigate("/b2b/dashboard?tab=dashboard")}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            ← Back to Dashboard
          </button>
          <button
            onClick={() => navigate("/b2b/dashboard?tab=products")}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white"
          >
            Browse Products
          </button>
        </div>
      )}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bulk Orders</h2>
        <div className="flex gap-2 flex-wrap">
          {["All", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
            <button key={status} onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrders.map((order: any) => (
          <div key={order._id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Order #{order._id?.slice(-8)}</h3>
                  {getStatusBadge(order.status)}
                </div>
                <div className="space-y-2">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-4 text-sm">
                      <span className="font-medium text-gray-900">{item.productName}</span>
                      <span className="text-gray-500">{item.quantity} units</span>
                      <span className="text-gray-500">₹{item.pricePerUnit}/unit</span>
                      <span className="font-medium text-blue-600">₹{item.total}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mb-1">₹{order.totalAmount?.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Payment: {order.paymentMethod?.toUpperCase() || "N/A"} · {order.paymentStatus || "pending"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                <span>{order.deliveryAddress}</span>
              </div>
              <div className="flex items-center gap-4">
                {order.estimatedDelivery && (
                  <div className="flex items-center gap-1 text-sm text-green-700 font-medium">
                    <Calendar className="w-4 h-4" />
                    Est: {new Date(order.estimatedDelivery).toLocaleDateString()}
                  </div>
                )}
                {order.trackingNumber && (
                  <div className="flex items-center gap-1 text-sm text-blue-600">
                    <Truck className="w-4 h-4" />
                    Tracking: {order.trackingNumber}
                  </div>
                )}
                {canRetryRazorpayPayment(order) && (
                  <button
                    onClick={() => handleRetryRazorpayPayment(order)}
                    disabled={retryingOrderId === order._id}
                    className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {retryingOrderId === order._id ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Retry Razorpay Payment"
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
