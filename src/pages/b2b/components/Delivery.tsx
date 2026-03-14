import React, { useState } from "react";
import { useBusinessOrders } from "@/hooks/useApi";
import { Loader2, Truck, Package, CheckCircle, Clock, MapPin } from "lucide-react";

const Delivery = () => {
  const { data: orders, isLoading } = useBusinessOrders();
  const [selected, setSelected] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3">Loading deliveries...</span>
      </div>
    );
  }

  // Filter orders that are in delivery stages
  const deliveries = (orders || []).filter((o: any) =>
    ["confirmed", "processing", "shipped", "in_transit", "delivered"].includes(o.status)
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-blue-100 text-blue-700",
      processing: "bg-yellow-100 text-yellow-700",
      shipped: "bg-purple-100 text-purple-700",
      in_transit: "bg-indigo-100 text-indigo-700",
      delivered: "bg-green-100 text-green-700",
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status] || "bg-gray-100 text-gray-700"}`}>
        {status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Delivery Tracking</h1>
        <p className="text-blue-100 text-sm">Monitor your order shipments in real-time</p>
      </div>

      {deliveries.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deliveries Yet</h3>
          <p className="text-gray-500">Your order deliveries will appear here once orders are confirmed.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Order ID</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Product</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Amount</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Date</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Tracking</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-xs text-left font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((d: any) => (
                <tr key={d._id} className="border-b hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-sm">#{d._id?.slice(-8)}</td>
                  <td className="px-5 py-3 font-medium">{d.items?.[0]?.productName || "Product"}</td>
                  <td className="px-5 py-3 font-semibold">₹{d.totalAmount?.toLocaleString()}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-sm">{d.trackingNumber || "—"}</td>
                  <td className="px-5 py-3">{getStatusBadge(d.status)}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => setSelected(d)} className="px-4 py-1 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Delivery Details</h3>
                  <p className="text-blue-100 text-xs">Order #{selected._id?.slice(-8)}</p>
                </div>
                <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                  <span className="text-white text-lg">×</span>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="text-sm font-bold mb-2">📦 Order Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Items:</span> {selected.items?.map((i: any) => `${i.productName} (${i.quantity})`).join(", ")}</p>
                  <p><span className="text-gray-500">Amount:</span> <span className="font-bold">₹{selected.totalAmount?.toLocaleString()}</span></p>
                  <p><span className="text-gray-500">Status:</span> {getStatusBadge(selected.status)}</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                <h4 className="text-sm font-bold mb-2">📍 Delivery Info</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500">Address:</span> {selected.deliveryAddress || "N/A"}</p>
                  <p><span className="text-gray-500">Tracking:</span> {selected.trackingNumber || "Not assigned yet"}</p>
                  <p><span className="text-gray-500">Partner:</span> {selected.deliveryPartner || "Not assigned"}</p>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <h4 className="text-sm font-bold mb-2">⏰ Timeline</h4>
                <div className="space-y-2">
                  {["Order Placed", "Confirmed", "Processing", "Shipped", "Delivered"].map((step, i) => {
                    const statusOrder = ["pending", "confirmed", "processing", "shipped", "delivered"];
                    const currentIdx = statusOrder.indexOf(selected.status);
                    const completed = i <= currentIdx;
                    return (
                      <div key={step} className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${completed ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"}`}>
                          {i + 1}
                        </div>
                        <span className={`text-xs ${completed ? "font-bold text-gray-900" : "text-gray-500"}`}>{step}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-full py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Delivery;
