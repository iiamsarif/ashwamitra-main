import React, { useState } from "react";
import { Eye, X, Loader2, Truck, CheckCircle, Clock, Package, Calendar, MapPin, User } from "lucide-react";
import { useFarmerOrders, useUpdateOrderStatus } from "@/hooks/useApi";
import { toast } from "sonner";

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow",
    confirmed: "bg-gradient-to-r from-blue-400 to-blue-600 text-white shadow",
    processing: "bg-gradient-to-r from-indigo-400 to-indigo-600 text-white shadow",
    shipped: "bg-gradient-to-r from-purple-400 to-purple-600 text-white shadow",
    in_transit: "bg-gradient-to-r from-cyan-400 to-cyan-600 text-white shadow",
    delivered: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow",
    cancelled: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow",
  };
  return (
    <span className={`px-3 py-1 text-xs rounded-full font-semibold ${styles[status?.toLowerCase()] || styles.pending}`}>
      {status?.replace("_", " ").charAt(0).toUpperCase() + status?.replace("_", " ").slice(1)}
    </span>
  );
};

const statusFlow = ["pending", "confirmed", "processing", "shipped", "in_transit", "delivered"];

const FarmerOrders = () => {
  const { data: orders, isLoading } = useFarmerOrders();
  const updateStatus = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [filter, setFilter] = useState<string>("All");
  const [deliveryDate, setDeliveryDate] = useState("");

  const filteredOrders = filter === "All"
    ? (orders || [])
    : (orders || []).filter((o: any) => o.status?.toLowerCase() === filter.toLowerCase());

  const getNextStatus = (currentStatus: string) => {
    const idx = statusFlow.indexOf(currentStatus?.toLowerCase());
    if (idx >= 0 && idx < statusFlow.length - 1) return statusFlow[idx + 1];
    return null;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
      toast.success(`Order updated to ${newStatus.replace("_", " ")}`);
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update order");
    }
  };

  const getActionButton = (order: any) => {
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return null;
    const labels: Record<string, string> = {
      confirmed: "✅ Confirm Order",
      processing: "🔄 Start Processing",
      shipped: "📦 Mark Shipped",
      in_transit: "🚚 In Transit",
      delivered: "✅ Mark Delivered",
    };
    const colors: Record<string, string> = {
      confirmed: "from-blue-500 to-blue-600",
      processing: "from-indigo-500 to-indigo-600",
      shipped: "from-purple-500 to-purple-600",
      in_transit: "from-cyan-500 to-cyan-600",
      delivered: "from-green-500 to-green-600",
    };
    return (
      <button onClick={() => handleStatusUpdate(order._id, nextStatus)}
        disabled={updateStatus.isPending}
        className={`px-3 py-1.5 text-xs text-white rounded-lg bg-gradient-to-r ${colors[nextStatus]} hover:scale-105 transition disabled:opacity-50`}>
        {updateStatus.isPending ? "Updating..." : labels[nextStatus]}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 rounded-2xl text-white shadow">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <p className="text-sm opacity-90">Track & process incoming orders from customers and businesses</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: (orders || []).length, icon: Package, color: "bg-blue-100 text-blue-700" },
          { label: "Pending", value: (orders || []).filter((o: any) => o.status === "pending").length, icon: Clock, color: "bg-yellow-100 text-yellow-700" },
          { label: "In Progress", value: (orders || []).filter((o: any) => ["confirmed", "processing", "shipped", "in_transit"].includes(o.status)).length, icon: Truck, color: "bg-purple-100 text-purple-700" },
          { label: "Delivered", value: (orders || []).filter((o: any) => o.status === "delivered").length, icon: CheckCircle, color: "bg-green-100 text-green-700" },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border shadow-sm">
            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap">
        {["All", "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"].map((tab) => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm rounded-lg transition font-medium ${
              filter === tab ? "text-white bg-gradient-to-r from-green-600 to-emerald-500 shadow-md" : "bg-white border hover:bg-green-50"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
            <tr>
              {["Order ID", "Buyer", "Type", "Items", "Amount", "Date", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-gray-600 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order: any) => (
              <tr key={order._id} className="border-t hover:bg-green-50 transition">
                <td className="px-5 py-4 font-medium text-sm">#{order._id?.slice(-6)}</td>
                <td className="px-5 py-4 text-sm">{order.buyerId?.name || "Customer"}</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    order.buyerRole === "b2b" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                  }`}>
                    {order.buyerRole === "b2b" ? "🏢 B2B" : "👤 Customer"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm">{order.items?.map((i: any) => `${i.productName}(${i.quantity})`).join(", ")}</td>
                <td className="px-5 py-4 font-semibold text-green-700">₹{order.totalAmount?.toLocaleString()}</td>
                <td className="px-5 py-4 text-sm">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ""}</td>
                <td className="px-5 py-4">{statusBadge(order.status || "pending")}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelectedOrder(order)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-white rounded-md bg-gradient-to-r from-blue-500 to-indigo-600 hover:scale-105 transition">
                      <Eye size={12} /> View
                    </button>
                    {getActionButton(order)}
                  </div>
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr><td colSpan={8} className="px-6 py-8 text-center text-gray-400">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button onClick={() => setSelectedOrder(null)} className="absolute right-4 top-4 text-gray-500 hover:text-black z-10"><X size={18} /></button>
            
            <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-5 text-white rounded-t-xl">
              <h3 className="text-lg font-bold">Order #{selectedOrder._id?.slice(-6)}</h3>
              <div className="flex items-center gap-2 mt-2">
                {statusBadge(selectedOrder.status)}
                <span className={`text-xs px-2 py-1 rounded-full ${
                  selectedOrder.buyerRole === "b2b" ? "bg-white/20" : "bg-white/20"
                }`}>
                  {selectedOrder.buyerRole === "b2b" ? "🏢 Bulk Order" : "👤 Retail Order"}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Buyer Info */}
              <div className="bg-blue-50 rounded-xl p-4 border">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><User className="w-4 h-4" /> Buyer</h4>
                <p className="text-sm">{selectedOrder.buyerId?.name || "Customer"}</p>
                <p className="text-xs text-gray-500">{selectedOrder.buyerId?.email}</p>
                <p className="text-xs text-gray-500">{selectedOrder.buyerId?.phone}</p>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-xl p-4 border">
                <h4 className="text-sm font-bold mb-2">📦 Items</h4>
                {selectedOrder.items?.map((i: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                    <span>{i.productName} × {i.quantity}</span>
                    <span className="font-semibold">₹{i.total?.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-green-700">₹{selectedOrder.totalAmount?.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" /> Delivery</h4>
                <p className="text-sm">{selectedOrder.deliveryAddress || "N/A"}</p>
                <p className="text-xs text-gray-500 mt-1">Payment: {selectedOrder.paymentMethod?.toUpperCase()} • {selectedOrder.paymentStatus}</p>
                {selectedOrder.estimatedDelivery && (
                  <p className="text-xs text-green-700 mt-1 font-medium">
                    📅 Est. Delivery: {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
                  </p>
                )}
                {selectedOrder.notes && (
                  <p className="text-xs text-gray-600 mt-2 italic">Notes: {selectedOrder.notes}</p>
                )}
              </div>

              {/* Status Timeline */}
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <h4 className="text-sm font-bold mb-3">📊 Order Progress</h4>
                <div className="space-y-2">
                  {statusFlow.map((step, idx) => {
                    const currentIdx = statusFlow.indexOf(selectedOrder.status?.toLowerCase());
                    const isCompleted = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    return (
                      <div key={step} className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted ? "bg-green-600 text-white" : "bg-gray-200 text-gray-500"
                        } ${isCurrent ? "ring-2 ring-green-400" : ""}`}>
                          {isCompleted ? "✓" : idx + 1}
                        </div>
                        <span className={`text-sm ${isCompleted ? "font-medium text-green-800" : "text-gray-400"}`}>
                          {step.replace("_", " ").charAt(0).toUpperCase() + step.replace("_", " ").slice(1)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedOrder.status !== "delivered" && selectedOrder.status !== "cancelled" && (
                <div className="space-y-2">
                  {getActionButton(selectedOrder) && (
                    <div className="flex justify-center">{getActionButton(selectedOrder)}</div>
                  )}
                </div>
              )}

              <button onClick={() => setSelectedOrder(null)}
                className="w-full py-2 rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:scale-105 transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerOrders;
