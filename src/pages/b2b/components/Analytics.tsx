import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from "recharts";
import { useBusinessDashboard, useBusinessOrders, useBusinessPayments } from "@/hooks/useApi";
import { Loader2, TrendingUp, ShoppingCart, CreditCard } from "lucide-react";

const Analytics = () => {
  const { data: dashboard, isLoading: dashLoading } = useBusinessDashboard();
  const { data: orders, isLoading: ordersLoading } = useBusinessOrders();
  const { data: payments, isLoading: paymentsLoading } = useBusinessPayments();

  if (dashLoading || ordersLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  const totalSpend = dashboard?.totalPurchases || 0;
  const totalOrders = dashboard?.totalOrders || 0;
  const totalPaid = payments?.filter((p: any) => p.status === "completed").reduce((s: number, p: any) => s + p.amount, 0) || 0;

  const monthlyData = dashboard?.monthlyData || [];
  const now = new Date();
  const thisMonthSpend = (orders || []).reduce((sum: number, order: any) => {
    if (!order?.createdAt) return sum;
    const orderDate = new Date(order.createdAt);
    if (orderDate.getMonth() !== now.getMonth() || orderDate.getFullYear() !== now.getFullYear()) return sum;
    return sum + Number(order.totalAmount || 0);
  }, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
          Procurement Analytics
        </h1>
        <p className="text-gray-500 text-sm">Real-time spending insights from your orders</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-80">Total Spend</p>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <h2 className="text-2xl font-bold">₹{totalSpend.toLocaleString()}</h2>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-80">Total Orders</p>
            <ShoppingCart className="w-5 h-5 opacity-80" />
          </div>
          <h2 className="text-2xl font-bold">{totalOrders}</h2>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-80">Total Paid</p>
            <CreditCard className="w-5 h-5 opacity-80" />
          </div>
          <h2 className="text-2xl font-bold">₹{totalPaid.toLocaleString()}</h2>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-80">This Month Spend</p>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <h2 className="text-2xl font-bold">₹{thisMonthSpend.toLocaleString()}</h2>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-gray-700">Monthly Procurement Spend</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="spend" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-400">No order data to display yet. Place orders to see analytics.</div>
        )}
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-gray-700">Order Trend</h3>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#22c55e" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-400">No data available yet.</div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
