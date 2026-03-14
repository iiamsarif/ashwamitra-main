import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useFarmerPayments } from "@/hooks/useApi";

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    completed: "bg-green-100 text-green-700",
    processing: "bg-blue-100 text-blue-700",
    failed: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status?.toLowerCase()] || styles.pending}`}>
      {status}
    </span>
  );
};

const FarmerPayments = () => {
  const { data: payments, isLoading } = useFarmerPayments();
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState<string>("All");

  const filteredPayments = filter === "All"
    ? (payments || [])
    : (payments || []).filter((p: any) => p.status?.toLowerCase() === filter.toLowerCase());

  const total = (payments || []).length;
  const completed = (payments || []).filter((p: any) => p.status === "completed").length;
  const pending = (payments || []).filter((p: any) => p.status === "pending").length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2">Loading payments...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-6 rounded-2xl text-white shadow">
        <h1 className="text-2xl font-bold">Farmer Payments</h1>
        <p className="text-sm opacity-90">Track all incoming transactions and payment status</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-white border border-green-100 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <h2 className="text-2xl font-bold text-green-700">{total}</h2>
        </div>
        <div className="bg-white border border-green-100 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Completed</p>
          <h2 className="text-2xl font-bold text-green-600">{completed}</h2>
        </div>
        <div className="bg-white border border-green-100 p-5 rounded-xl shadow-sm">
          <p className="text-sm text-gray-500">Pending</p>
          <h2 className="text-2xl font-bold text-yellow-600">{pending}</h2>
        </div>
      </div>

      <div className="flex gap-3">
        {["All", "Pending", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm rounded-lg border transition ${
              filter === tab ? "bg-green-600 text-white" : "bg-white hover:bg-green-50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border border-green-100 rounded-xl shadow-sm overflow-x-auto w-full">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-green-50">
            <tr>
              {["Transaction", "Order", "Amount", "Method", "Date", "Status", "Action"].map((h) => (
                <th key={h} className="text-left px-5 py-3 font-semibold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p: any) => (
              <tr key={p._id} className="border-t hover:bg-green-50/40">
                <td className="px-5 py-3 font-medium whitespace-nowrap">#{p._id?.slice(-6)}</td>
                <td className="px-5 py-3 whitespace-nowrap">#{p.orderId?._id?.slice(-6) || p.orderId}</td>
                <td className="px-5 py-3 font-semibold whitespace-nowrap">₹{p.amount?.toLocaleString()}</td>
                <td className="px-5 py-3 whitespace-nowrap">{p.method?.toUpperCase()}</td>
                <td className="px-5 py-3 whitespace-nowrap">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ""}</td>
                <td className="px-5 py-3 whitespace-nowrap">{statusBadge(p.status)}</td>
                <td className="px-5 py-3">
                  <button onClick={() => setSelected(p)} className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded-md whitespace-nowrap">View</button>
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-400">No payments found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-green-700 mb-4">Transaction Details</h3>
            <div className="space-y-3 text-sm">
              <p><b>ID:</b> #{selected._id?.slice(-6)}</p>
              <p><b>Amount:</b> ₹{selected.amount?.toLocaleString()}</p>
              <p><b>Method:</b> {selected.method?.toUpperCase()}</p>
              <p><b>Date:</b> {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : ""}</p>
              <p><b>Status:</b> {selected.status}</p>
              {selected.upiTransactionId && <p><b>UPI Txn ID:</b> {selected.upiTransactionId}</p>}
              {selected.bankReference && <p><b>Bank Ref:</b> {selected.bankReference}</p>}
            </div>
            <button onClick={() => setSelected(null)} className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerPayments;
