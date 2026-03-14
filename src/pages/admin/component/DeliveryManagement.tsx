"use client"

import { useState } from "react"
import { 
  Package, Truck, MapPin, CheckCircle, Clock, User, Phone, 
  Calendar, CreditCard, AlertCircle, RefreshCw, Eye, 
  ChevronRight, Home, Box, ArrowRight, Check, X, Loader2
} from "lucide-react"
import { useInTransitOrders, useUpdateDelivery, useAdminOrders } from "@/hooks/useApi"

const statusMap: Record<string, string> = {
  pending: "Pending Approval",
  confirmed: "Processing",
  processing: "Processing",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  shipped: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

const reverseStatusMap: Record<string, string> = {
  "Processing": "processing",
  "Picked Up": "picked_up",
  "In Transit": "in_transit",
  "Out for Delivery": "out_for_delivery",
  "Delivered": "delivered",
  "Cancelled": "cancelled",
}

const getStatusColor = (status: string) => {
  switch(status) {
    case "Delivered": return "text-green-600 bg-green-100 border-green-200"
    case "Out for Delivery": return "text-blue-600 bg-blue-100 border-blue-200"
    case "In Transit": return "text-purple-600 bg-purple-100 border-purple-200"
    case "Picked Up": return "text-orange-600 bg-orange-100 border-orange-200"
    case "Processing": return "text-yellow-600 bg-yellow-100 border-yellow-200"
    case "Pending Approval": return "text-gray-600 bg-gray-100 border-gray-200"
    case "Cancelled": return "text-red-600 bg-red-100 border-red-200"
    default: return "text-gray-600 bg-gray-100 border-gray-200"
  }
}

const getStatusIcon = (status: string) => {
  switch(status) {
    case "Delivered": return <CheckCircle className="w-4 h-4" />
    case "Out for Delivery": return <Truck className="w-4 h-4" />
    case "In Transit": return <Package className="w-4 h-4" />
    case "Picked Up": return <Box className="w-4 h-4" />
    case "Processing": return <RefreshCw className="w-4 h-4" />
    case "Pending Approval": return <Clock className="w-4 h-4" />
    case "Cancelled": return <X className="w-4 h-4" />
    default: return <Clock className="w-4 h-4" />
  }
}

const getDeliveryTimeline = (order: any) => {
  const steps = ["Order Placed", "Confirmed", "Processing", "Picked Up", "In Transit", "Out for Delivery", "Delivered"]
  const statusOrder = ["pending", "confirmed", "processing", "picked_up", "in_transit", "out_for_delivery", "delivered"]
  const currentIdx = statusOrder.indexOf(order.status || "pending")

  return steps.map((step, i) => ({
    status: step,
    time: i === 0 ? new Date(order.createdAt).toLocaleString() : i <= currentIdx ? new Date(order.updatedAt).toLocaleString() : "—",
    description: i <= currentIdx ? `${step} completed` : `Waiting for ${step.toLowerCase()}`,
    completed: i <= currentIdx,
  }))
}

export default function DeliveryManagement() {
  const { data: inTransitOrders, isLoading: transitLoading } = useInTransitOrders()
  const { data: allOrders, isLoading: ordersLoading } = useAdminOrders()
  const updateDelivery = useUpdateDelivery()
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [showTimeline, setShowTimeline] = useState(false)

  const isLoading = transitLoading || ordersLoading

  // Combine: show all orders that are in delivery-relevant stages
  const deliveryOrders = (allOrders || []).filter((o: any) =>
    ["pending", "confirmed", "processing", "picked_up", "in_transit", "out_for_delivery", "shipped", "delivered", "cancelled"].includes(o.status)
  )

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    const backendStatus = reverseStatusMap[newStatus] || newStatus.toLowerCase()
    updateDelivery.mutate({
      orderId,
      data: { status: backendStatus }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3">Loading deliveries...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold">Delivery Management</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Total: {deliveryOrders.length}
          </span>
          <span className="text-sm text-green-600">
            Active: {deliveryOrders.filter((d: any) => !["delivered", "cancelled"].includes(d.status)).length}
          </span>
        </div>
      </div>

      {deliveryOrders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deliveries</h3>
          <p className="text-gray-500">No orders in delivery pipeline yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliveryOrders.map((order: any) => {
            const displayStatus = statusMap[order.status] || order.status
            return (
              <div
                key={order._id}
                className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">#{order._id?.slice(-8)}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(displayStatus)}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(displayStatus)}
                      <span>{displayStatus}</span>
                    </div>
                  </span>
                </div>

                {/* Customer Info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                      {(order.buyerId?.name || "C")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.buyerId?.name || "Customer"}</p>
                      <p className="text-xs text-muted-foreground">{order.buyerId?.email || ""}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <p className="text-xs text-muted-foreground line-clamp-2">{order.deliveryAddress || "No address"}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.productName} × {item.quantity}</span>
                      <span className="font-medium">₹{item.total?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                {/* Order Details */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-bold text-lg">₹{order.totalAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Payment:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {order.paymentStatus || order.paymentMethod || "Pending"}
                    </span>
                  </div>
                  {order.trackingNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Tracking:</span>
                      <span className="font-mono text-xs">{order.trackingNumber}</span>
                    </div>
                  )}
                </div>

                {/* Timeline Button */}
                <button
                  onClick={() => { setSelectedOrder(order); setShowTimeline(true) }}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span className="text-sm font-medium">View Timeline</span>
                </button>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {order.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(order._id, "Processing")}
                        disabled={updateDelivery.isPending}
                        className="flex-1 px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order._id, "Cancelled")}
                        disabled={updateDelivery.isPending}
                        className="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {(order.status === "confirmed" || order.status === "processing") && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, "Picked Up")}
                      disabled={updateDelivery.isPending}
                      className="w-full px-3 py-2 text-xs bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      Mark Picked Up
                    </button>
                  )}

                  {order.status === "picked_up" && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, "In Transit")}
                      disabled={updateDelivery.isPending}
                      className="w-full px-3 py-2 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      Mark In Transit
                    </button>
                  )}

                  {(order.status === "in_transit" || order.status === "shipped") && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, "Out for Delivery")}
                      disabled={updateDelivery.isPending}
                      className="w-full px-3 py-2 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Out for Delivery
                    </button>
                  )}

                  {order.status === "out_for_delivery" && (
                    <button
                      onClick={() => handleUpdateStatus(order._id, "Delivered")}
                      disabled={updateDelivery.isPending}
                      className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Mark Delivered
                    </button>
                  )}

                  {order.status === "delivered" && (
                    <div className="w-full text-center px-3 py-2 text-xs bg-green-100 text-green-700 rounded-md font-medium">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Delivered Successfully
                    </div>
                  )}

                  {order.status === "cancelled" && (
                    <div className="w-full text-center px-3 py-2 text-xs bg-red-100 text-red-700 rounded-md font-medium">
                      <X className="w-4 h-4 inline mr-1" />
                      Order Cancelled
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Timeline Modal */}
      {showTimeline && selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowTimeline(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">Order #{selectedOrder._id?.slice(-8)}</h3>
                  <p className="text-blue-100">Delivery Timeline</p>
                </div>
                <button
                  onClick={() => setShowTimeline(false)}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-3">Order Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Customer:</p>
                    <p className="font-medium text-gray-900">{selectedOrder.buyerId?.name || "Customer"}</p>
                    <p className="text-gray-500">{selectedOrder.buyerId?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Address:</p>
                    <p className="font-medium text-gray-900">{selectedOrder.deliveryAddress || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Amount:</p>
                    <p className="font-bold text-lg text-gray-900">₹{selectedOrder.totalAmount?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment:</p>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedOrder.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {selectedOrder.paymentStatus || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white rounded-xl p-4 border">
                <h4 className="font-bold text-gray-900 mb-3">📦 Items</h4>
                {selectedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm py-1">
                    <span>{item.productName} × {item.quantity}</span>
                    <span className="font-semibold">₹{item.total?.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Timeline */}
              <div>
                <h4 className="font-bold text-gray-900 mb-4">Delivery Timeline</h4>
                <div className="space-y-4">
                  {getDeliveryTimeline(selectedOrder).map((step, index, arr) => (
                    <div key={step.status} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-green-600' : 'bg-gray-300'
                        }`}>
                          {step.completed ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <Clock className="w-4 h-4 text-white" />
                          )}
                        </div>
                        {index < arr.length - 1 && (
                          <div className={`w-0.5 h-12 ${step.completed ? 'bg-green-600' : 'bg-gray-300'}`} />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                            {step.status}
                          </h5>
                          <span className={`text-xs ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                            {step.time}
                          </span>
                        </div>
                        <p className={`text-sm ${step.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
