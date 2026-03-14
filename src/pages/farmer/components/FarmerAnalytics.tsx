import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useFarmerOrders, useFarmerPayments, useFarmerDashboard } from "@/hooks/useApi";
import { Loader2, TrendingUp, ShoppingCart, CreditCard } from "lucide-react";

const FarmerAnalytics = () => {
  const { data: orders, isLoading: ordersLoading } = useFarmerOrders();
  const { data: payments, isLoading: paymentsLoading } = useFarmerPayments();
  const { data: dashboard, isLoading: dashLoading } = useFarmerDashboard();

  if (ordersLoading || paymentsLoading || dashLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  const totalEarnings = dashboard?.totalEarnings || 0;
  const totalSold = dashboard?.totalSold || 0;
  const totalPaid = (payments || []).filter((p: any) => p.status === "completed").reduce((s: number, p: any) => s + (p.amount || 0), 0);

  // Build monthly revenue data from orders
  const monthMap: Record<string, { revenue: number; orders: number; qty: number }> = {};
  (orders || []).forEach((order: any) => {
    if (!order.createdAt) return;
    const month = new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    if (!monthMap[month]) monthMap[month] = { revenue: 0, orders: 0, qty: 0 };
    monthMap[month].revenue += order.totalAmount || 0;
    monthMap[month].orders += 1;
    (order.items || []).forEach((i: any) => { monthMap[month].qty += i.quantity || 0; });
  });
  const monthlyData = Object.entries(monthMap).map(([month, d]) => ({ month, ...d }));

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-4 sm:p-6 rounded-2xl text-white shadow">
        <h1 className="text-xl sm:text-2xl font-bold">Sales Analytics</h1>
        <p className="text-sm opacity-90">Real-time insights from your sales data</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-80">Total Earnings</p>
            <TrendingUp className="w-5 h-5 opacity-80" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">₹{totalEarnings.toLocaleString()}</h2>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-80">Total Sold</p>
            <ShoppingCart className="w-5 h-5 opacity-80" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{totalSold} kg</h2>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-4 sm:p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm opacity-80">Payments Received</p>
            <CreditCard className="w-5 h-5 opacity-80" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">₹{totalPaid.toLocaleString()}</h2>
        </div>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm">
        <h2 className="font-semibold mb-4 text-gray-700">Monthly Revenue</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              <Bar dataKey="revenue" name="Revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-400">No order data yet. Sales will appear here once you receive orders.</div>
        )}
      </div>

      <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm">
        <h2 className="font-semibold mb-4 text-gray-700">Quantity Sold Trend</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="qty" name="Qty Sold" stroke="#16a34a" fill="#bbf7d0" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-400">No data available yet.</div>
        )}
      </div>
    </div>
  );
};

export default FarmerAnalytics;
