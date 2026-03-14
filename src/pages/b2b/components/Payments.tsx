import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBusinessPayments } from "@/hooks/useApi";
import { CreditCard, Wallet, CheckCircle, Clock, AlertCircle, Loader2, TrendingUp } from "lucide-react";

type PaymentRecord = {
  _id: string;
  orderId: string | { _id: string };
  amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  method: string;
  createdAt: string;
  updatedAt: string;
  transactionId?: string;
};

const Payments: React.FC = () => {
  const navigate = useNavigate();
  const { data: payments, isLoading, error } = useBusinessPayments();
  const [filter, setFilter] = useState<string>("All");

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border border-yellow-300",
      processing: "bg-blue-100 text-blue-700 border border-blue-300",
      completed: "bg-green-100 text-green-700 border border-green-300",
      failed: "bg-red-100 text-red-700 border border-red-300",
      refunded: "bg-purple-100 text-purple-700 border border-purple-300",
    };

    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-3 h-3" />,
      processing: <Loader2 className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      failed: <AlertCircle className="w-3 h-3" />,
      refunded: <AlertCircle className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${styles[status] || styles.pending}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentIcon = (method: string) => {
    const icons: Record<string, React.ReactNode> = {
      upi: <Wallet className="w-4 h-4" />,
      bank_transfer: <CreditCard className="w-4 h-4" />,
      card: <CreditCard className="w-4 h-4" />,
      razorpay: <CreditCard className="w-4 h-4" />,
      cod: <CreditCard className="w-4 h-4" />,
    };
    return icons[method?.toLowerCase()] || <CreditCard className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading payments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load payments</h3>
          <p className="text-gray-500">Please check your connection and try again.</p>
        </div>
      </div>
    );
  }

  const paymentList = (payments || []) as PaymentRecord[];

  if (paymentList.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Yet</h3>
          <p className="text-gray-500">You haven't made any payments yet.</p>
        </div>
      </div>
    );
  }

  const filteredPayments = filter === "All"
    ? paymentList
    : paymentList.filter((p) => p.status === filter);

  const totalPaid = paymentList
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = paymentList
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Paid</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">₹{totalPaid.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Pending</span>
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">₹{pendingPayments.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-sm">Total Transactions</span>
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-600">{paymentList.length}</div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
        <div className="flex gap-2 flex-wrap">
          {["All", "pending", "processing", "completed", "failed", "refunded"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPayments.map((payment) => {
          const orderRef = typeof payment.orderId === "string"
            ? payment.orderId
            : payment.orderId?._id || "";

          return (
            <div
              key={payment._id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payment #{payment._id.slice(-8)}
                    </h3>
                    {getStatusBadge(payment.status)}
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="text-gray-600">
                      Order ID: #{orderRef.slice(-8)}
                    </div>
                    <div className="text-gray-600">
                      Method: <span className="font-medium">{payment.method?.replace("_", " ").toUpperCase()}</span>
                    </div>
                    {payment.transactionId && (
                      <div className="text-gray-600">
                        Transaction ID: {payment.transactionId}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    ₹{payment.amount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  {getPaymentIcon(payment.method || "card")}
                  <span>{payment.method?.replace("_", " ").toUpperCase()}</span>
                </div>
                <button
                  onClick={() => navigate(`/payments/${payment._id}`)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Payments;
