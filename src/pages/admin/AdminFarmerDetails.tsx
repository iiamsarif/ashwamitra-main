import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Tractor,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminFarmerById, useApproveFarmer } from "@/hooks/useApi";

const maskValue = (value?: string) => {
  if (!value) return "Not provided";
  if (value.length <= 4) return value;
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
};

const AdminFarmerDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: farmer, isLoading, isError } = useAdminFarmerById(id || "");
  const approveFarmer = useApproveFarmer();

  const user = farmer?.userId || {};
  const approvalState = farmer?.isApproved
    ? "approved"
    : user?.status === "inactive"
      ? "rejected"
      : "pending";

  const handleApprove = async () => {
    if (!farmer?._id) return;
    await approveFarmer.mutateAsync({ id: farmer._id, approved: true });
  };

  const handleReject = async () => {
    if (!farmer?._id) return;
    await approveFarmer.mutateAsync({ id: farmer._id, approved: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading farmer details...</p>
        </div>
      </div>
    );
  }

  if (isError || !farmer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Farmer Not Found</h1>
          <p className="text-gray-600 mb-6">The requested farmer record was not found.</p>
          <Button onClick={() => navigate("/admin/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin/dashboard")} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Farmer Details</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                approvalState === "approved"
                  ? "bg-green-100 text-green-700"
                  : approvalState === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {approvalState.charAt(0).toUpperCase() + approvalState.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-green-600" />
              Profile
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Name</span><span className="font-medium">{user.name || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Email</span><span className="font-medium">{user.email || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Phone</span><span className="font-medium">{user.phone || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Category</span><span className="font-medium">{farmer.category || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Transaction Mode</span><span className="font-medium">{(farmer.transactionMode || "N/A").toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Registered</span><span className="font-medium">{new Date(farmer.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Address
            </h2>
            <div className="space-y-3 text-sm">
              <div className="border-b pb-2">
                <p className="text-gray-600">Full Address</p>
                <p className="font-medium text-gray-900 mt-1">{farmer.fullAddress || "Not provided"}</p>
              </div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Village</span><span className="font-medium">{farmer.village || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">District</span><span className="font-medium">{farmer.district || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">State</span><span className="font-medium">{farmer.state || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">PIN</span><span className="font-medium">{farmer.pinCode || "N/A"}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              Payment Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">UPI ID</span><span className="font-medium">{farmer.upiId || "Not provided"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Bank Account</span><span className="font-medium">{maskValue(farmer.bankAccountNumber)}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">IFSC</span><span className="font-medium">{farmer.ifscCode || "Not provided"}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">PAN</span><span className="font-medium">{maskValue(farmer.panNumber)}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tractor className="w-5 h-5 text-green-600" />
              Performance
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Products</p>
                <p className="text-lg font-bold">{farmer.totalProducts || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Units Sold</p>
                <p className="text-lg font-bold">{farmer.totalSold || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Earnings</p>
                <p className="text-lg font-bold">₹{(farmer.totalEarnings || 0).toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600">Rating</p>
                <p className="text-lg font-bold">{Number(farmer.rating || 0).toFixed(1)} / 5</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Action</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleApprove} disabled={approveFarmer.isPending} className="sm:flex-1 bg-green-600 hover:bg-green-700">
              {approveFarmer.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </>
              )}
            </Button>
            <Button onClick={handleReject} disabled={approveFarmer.isPending} variant="destructive" className="sm:flex-1">
              {approveFarmer.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </div>
          <div className="mt-4 text-sm text-gray-600 flex items-start gap-2">
            {approvalState === "approved" ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" /> : <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />}
            <span>
              Current account state is <strong>{approvalState}</strong>. Use approve/reject to update access for this farmer.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFarmerDetails;
