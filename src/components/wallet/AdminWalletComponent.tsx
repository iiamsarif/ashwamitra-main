import React, { useState } from "react";
import { Wallet, Plus, Users, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useAllWallets, useAdminAddMoney, useAdminUsers } from "@/hooks/useApi";

const AdminWalletComponent: React.FC = () => {
  const { data: wallets, isLoading: walletsLoading } = useAllWallets();
  const { data: usersData } = useAdminUsers();
  const addMoney = useAdminAddMoney();

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const users = usersData?.users || [];

  const handleAddMoney = async () => {
    if (!selectedUserId) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    await addMoney.mutateAsync({ userId: selectedUserId, amount: amountNum, description: description || "Admin wallet credit" });
    setShowAddMoney(false);
    setSelectedUserId("");
    setAmount("");
    setDescription("");
  };

  if (walletsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading wallets...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Wallet Management</h3>
            <p className="text-sm text-gray-600">Add money to user wallets</p>
          </div>
        </div>
        <button onClick={() => setShowAddMoney(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Money
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">User Wallet Balances</h4>
        {(wallets || []).map((w: any) => (
          <div key={w._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{w.userId?.name || "User"}</p>
                <p className="text-xs text-gray-500">{w.userId?.email} · {w.userId?.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">₹{w.balance?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{w.transactions?.length || 0} txns</p>
            </div>
          </div>
        ))}
        {(!wallets || wallets.length === 0) && (
          <div className="text-center py-6 text-gray-400">No wallets found yet.</div>
        )}
      </div>

      {showAddMoney && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Add Money to Wallet</h3>
              <button onClick={() => setShowAddMoney(false)} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                <Plus className="w-3 h-3 text-gray-600 rotate-45" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Choose a user...</option>
                  {users.map((u: any) => (
                    <option key={u._id} value={u._id}>{u.name} - {u.email} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="Enter amount" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-lg" rows={2} placeholder="Reason for adding money" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddMoney(false)} className="flex-1 px-4 py-2 border text-gray-700 rounded-lg hover:bg-gray-50">Cancel</button>
                <button onClick={handleAddMoney} disabled={addMoney.isPending || !selectedUserId || !amount} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                  {addMoney.isPending ? "Adding..." : "Add Money"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWalletComponent;
