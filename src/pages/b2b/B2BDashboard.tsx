import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBusinessDashboard, useBusinessOrders, useProducts } from "@/hooks/useApi";
import {
  ShoppingCart, CreditCard, TrendingUp, Package, Building2, ArrowUpRight, BarChart3, Loader2,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import Products from "./components/B2BProducts";
import B2BCart from "./components/B2BCart";
import Orders from "./components/Orders";
import Payments from "./components/Payments";
import Delivery from "./components/Delivery";
import Analytics from "./components/Analytics";
import Settings from "./components/Settings";

const B2B_ALLOWED_TABS = new Set(["dashboard", "products", "cart", "orders", "payments", "delivery", "analytics", "settings"]);

const orderStatus = (status: string) => {
  const normalized = String(status || "").toLowerCase();
  const styles: Record<string, string> = {
    delivered: "bg-green-100 text-green-700",
    in_transit: "bg-blue-100 text-blue-700",
    shipped: "bg-blue-100 text-blue-700",
    confirmed: "bg-yellow-100 text-yellow-700",
    processing: "bg-indigo-100 text-indigo-700",
    pending: "bg-yellow-100 text-yellow-700",
  };
  const label = normalized.replace("_", " ");
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${styles[normalized] || "bg-gray-100 text-gray-600"}`}>
      {label.charAt(0).toUpperCase() + label.slice(1)}
    </span>
  );
};

const B2BDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const { data: dashboardData, isLoading: dashboardLoading } = useBusinessDashboard();
  const { data: orders, isLoading: ordersLoading } = useBusinessOrders();
  const { data: allProducts } = useProducts();

  const tabFromUrl = searchParams.get("tab");

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && B2B_ALLOWED_TABS.has(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const next = new URLSearchParams(searchParams);
    next.set("tab", newTab);
    setSearchParams(next, { replace: true });
  };

  const stats = dashboardData ? {
    totalPurchases: dashboardData.totalPurchases || 0,
    paymentsMade: dashboardData.totalPaid || 0,
    activeOrders: dashboardData.activeOrders || 0,
    totalOrders: dashboardData.totalOrders || 0,
  } : { totalPurchases: 0, paymentsMade: 0, activeOrders: 0, totalOrders: 0 };

  const recentOrdersData = (orders && Array.isArray(orders)) ? orders.slice(0, 5) : [];

  const handleCartUpdate = (newCart: Map<string, number>) => {
    setCart(newCart);
    if (newCart.size === 0 && cart.size > 0) {
      handleTabChange("orders");
    }
  };

  if (dashboardLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {activeTab === "dashboard" && (
        <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">B2B Procurement Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-500">Real-time farmer products and orders</p>
            </div>
            <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-green-100 text-green-700 font-medium shadow-sm">
              <Building2 className="w-4 h-4" /> Live Data
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {[
                { label: "Total Purchases", value: `₹${(stats.totalPurchases / 1000).toFixed(1)}L`, icon: ShoppingCart, color: "from-blue-500 to-indigo-600" },
                { label: "Payments Made", value: `₹${(stats.paymentsMade / 1000).toFixed(1)}L`, icon: CreditCard, color: "from-emerald-500 to-green-600" },
                { label: "Active Orders", value: stats.activeOrders.toString(), icon: Package, color: "from-orange-400 to-orange-600" },
                { label: "Total Orders", value: stats.totalOrders.toString(), icon: TrendingUp, color: "from-purple-500 to-violet-600" },
              ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={`p-4 sm:p-6 rounded-xl text-white shadow-xl bg-gradient-to-br ${stat.color} hover:scale-[1.02] transition`}>
                  <div className="flex justify-between mb-4"><Icon className="w-5 h-5" /><ArrowUpRight className="w-4 h-4 opacity-70" /></div>
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs opacity-90 mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border shadow-xl rounded-xl p-4 sm:p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Recent Procurement</h3>
              <div className="h-48 sm:h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={recentOrdersData?.map((order: any) => ({
                    month: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' }),
                    spend: order.totalAmount,
                  })) || []}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip />
                    <Bar dataKey="spend" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-md border shadow-xl rounded-xl p-4 sm:p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-blue-600" /> Quick Actions</h3>
              <div className="space-y-3">
                <button onClick={() => handleTabChange("products")} className="w-full p-3 bg-blue-50 rounded-lg text-left hover:bg-blue-100 transition">
                  <div className="text-sm font-medium">Browse Products</div>
                  <div className="text-xs text-gray-500">Find farmer produce</div>
                </button>
                <button onClick={() => handleTabChange("cart")} className="w-full p-3 bg-green-50 rounded-lg text-left hover:bg-green-100 transition">
                  <div className="text-sm font-medium flex items-center gap-2">
                    Cart {cart.size > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{cart.size}</span>}
                  </div>
                  <div className="text-xs text-gray-500">View your bulk cart</div>
                </button>
                <button onClick={() => handleTabChange("orders")} className="w-full p-3 bg-purple-50 rounded-lg text-left hover:bg-purple-100 transition">
                  <div className="text-sm font-medium">My Orders</div>
                  <div className="text-xs text-gray-500">Track deliveries</div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white/80 backdrop-blur-md border shadow-xl rounded-xl">
            <div className="p-4 sm:p-5 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Recent Orders</h3>
              <button onClick={() => handleTabChange("orders")} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    {["Order ID", "Product", "Amount", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left px-3 sm:px-5 py-3 text-gray-500 font-medium text-xs">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrdersData.map((order: any) => (
                    <tr key={order._id} className="border-t hover:bg-blue-50/60 transition">
                      <td className="px-3 sm:px-5 py-3 text-xs font-mono">{order._id?.slice(-8)}</td>
                      <td className="px-3 sm:px-5 py-3 font-medium">{order.items?.[0]?.productName || "Product"}</td>
                      <td className="px-3 sm:px-5 py-3 font-semibold">₹{order.totalAmount}</td>
                      <td className="px-3 sm:px-5 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 sm:px-5 py-3">{orderStatus(order.status || "Pending")}</td>
                    </tr>
                  ))}
                  {recentOrdersData.length === 0 && (
                    <tr><td colSpan={5} className="px-3 sm:px-5 py-8 text-center text-gray-400">No orders yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "orders" && <Orders />}
      {activeTab === "products" && <Products cart={cart} onUpdateCart={setCart} onGoToCart={() => handleTabChange("cart")} />}
      {activeTab === "cart" && (
        <B2BCart
          cart={cart}
          products={allProducts || []}
          onUpdateCart={handleCartUpdate}
          onGoToOrders={() => handleTabChange("orders")}
        />
      )}
      {activeTab === "payments" && <Payments />}
      {activeTab === "delivery" && <Delivery />}
      {activeTab === "analytics" && <Analytics />}
      {activeTab === "settings" && <Settings />}
    </DashboardLayout>
  );
};

export default B2BDashboard;
