import React from "react";
import { Wallet, Plus, Minus, Clock, TrendingUp, TrendingDown, RefreshCw, Loader2 } from "lucide-react";
import { useMyWallet } from "@/hooks/useApi";

interface WalletComponentProps {
  userId: string;
  userName?: string;
}

const WalletComponent: React.FC<WalletComponentProps> = ({ userId, userName }) => {
  const { data: walletData, isLoading, refetch, isRefetching } = useMyWallet();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          <span className="ml-2">Loading wallet...</span>
        </div>
      </div>
    );
  }

  const balance = walletData?.balance || 0;
  const transactions = walletData?.transactions || [];
  const totalCredits = transactions.filter((t: any) => t.type === "credit").reduce((s: number, t: any) => s + t.amount, 0);
  const totalDebits = transactions.filter((t: any) => t.type === "debit").reduce((s: number, t: any) => s + t.amount, 0);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">My Wallet</h3>
            <p className="text-sm text-gray-600">Manage your wallet balance</p>
          </div>
        </div>
        <button onClick={() => refetch()} disabled={isRefetching} className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
          <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefetching ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 mb-6 border border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-700 font-medium">Available Balance</p>
            <p className="text-2xl font-bold text-green-900">₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
          <TrendingUp className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <p className="text-xs text-blue-700">Credits</p>
          <p className="text-sm font-bold text-blue-900">₹{totalCredits.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center border border-red-100">
          <TrendingDown className="w-4 h-4 text-red-600 mx-auto mb-1" />
          <p className="text-xs text-red-700">Debits</p>
          <p className="text-sm font-bold text-red-900">₹{totalDebits.toLocaleString()}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-100">
          <Clock className="w-4 h-4 text-purple-600 mx-auto mb-1" />
          <p className="text-xs text-purple-700">Transactions</p>
          <p className="text-sm font-bold text-purple-900">{transactions.length}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Transactions</h4>
        {transactions.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border">
            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {transactions.slice(0, 10).map((t: any, i: number) => (
              <div key={t._id || i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                    {t.type === "credit" ? <Plus className="w-4 h-4 text-green-600" /> : <Minus className="w-4 h-4 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.description}</p>
                    <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${t.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                  {t.type === "credit" ? "+" : "-"}₹{t.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletComponent;
