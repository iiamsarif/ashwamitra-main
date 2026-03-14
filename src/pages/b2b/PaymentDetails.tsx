import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  FileText,
  Loader2,
  Package,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { usePaymentById } from "@/hooks/useApi";

const statusStyle: Record<string, string> = {
  completed: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-purple-100 text-purple-700 border-purple-200",
};

const statusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-5 h-5" />;
    case "pending":
      return <Clock className="w-5 h-5" />;
    case "processing":
      return <RefreshCw className="w-5 h-5" />;
    case "failed":
      return <XCircle className="w-5 h-5" />;
    default:
      return <AlertCircle className="w-5 h-5" />;
  }
};

const PaymentDetailsPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const { data: payment, isLoading, isError } = usePaymentById(paymentId || "");

  const handleDownloadReceipt = () => {
    if (!payment) return;
    const payload = {
      id: payment._id,
      orderId: typeof payment.orderId === "object" ? payment.orderId?._id : payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      providerOrderId: payment.providerOrderId,
      providerPaymentId: payment.providerPaymentId,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      settledAt: payment.settledAt,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `payment-receipt-${payment._id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-700">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (isError || !payment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Payment Not Found</h1>
          <p className="text-gray-600 mb-6">This payment does not exist or you do not have access.</p>
          <button
            onClick={() => navigate("/b2b/dashboard?tab=payments")}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const order = typeof payment.orderId === "object" ? payment.orderId : null;
  const status = String(payment.status || "pending").toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate("/b2b/dashboard?tab=payments")} className="p-2 rounded-xl hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Payment Details</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border ${statusStyle[status] || statusStyle.pending}`}>
                {statusIcon(status)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">₹{Number(payment.amount || 0).toLocaleString()}</h2>
                <p className="text-sm text-gray-500">Payment Amount</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${statusStyle[status] || statusStyle.pending}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4"><span className="text-gray-600">Payment ID</span><span className="font-mono text-right">{payment._id}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-600">Method</span><span className="font-semibold">{String(payment.method || "N/A").toUpperCase()}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-600">Transaction ID</span><span className="font-mono text-right">{payment.transactionId || payment.providerPaymentId || "N/A"}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-600">Provider Order</span><span className="font-mono text-right">{payment.providerOrderId || "N/A"}</span></div>
                <div className="flex justify-between gap-4"><span className="text-gray-600">Created</span><span>{new Date(payment.createdAt).toLocaleString()}</span></div>
                {payment.settledAt && (
                  <div className="flex justify-between gap-4"><span className="text-gray-600">Settled</span><span>{new Date(payment.settledAt).toLocaleString()}</span></div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Order Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-mono text-right">{order?._id || String(payment.orderId || "N/A")}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Items</span>
                  <span className="text-right">{order?.items?.length || 0}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Payment Status</span>
                  <span className="text-right">{order?.paymentStatus || "N/A"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Order Status</span>
                  <span className="text-right">{order?.status || "N/A"}</span>
                </div>
                {order?.createdAt && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Order Date</span>
                    <span className="text-right">{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {order?.items?.length > 0 && (
            <div className="mt-6 bg-white border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Ordered Items
              </h3>
              <div className="space-y-2">
                {order.items.map((item: any, index: number) => (
                  <div key={`${item.productId}-${index}`} className="flex justify-between text-sm">
                    <span className="text-gray-700">{item.productName} × {item.quantity}</span>
                    <span className="font-medium">₹{Number(item.total || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleDownloadReceipt}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:opacity-90"
            >
              <Download className="w-4 h-4" />
              Download Receipt
            </button>
            <button
              onClick={() => navigate("/b2b/dashboard?tab=payments")}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
            >
              <Calendar className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;
