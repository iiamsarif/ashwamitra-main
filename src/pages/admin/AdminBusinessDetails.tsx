import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Building2,
  CheckCircle,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  User,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminBusinessById, useVerifyBusiness } from "@/hooks/useApi";

const maskValue = (value?: string) => {
  if (!value) return "Not provided";
  if (value.length <= 4) return value;
  return `${"*".repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
};

const AdminBusinessDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: business, isLoading, isError } = useAdminBusinessById(id || "");
  const verifyBusiness = useVerifyBusiness();

  const user = business?.userId || {};
  const verificationState = business?.isVerified
    ? "verified"
    : user?.status === "inactive"
      ? "rejected"
      : "pending";

  const handleVerify = async () => {
    if (!business?._id) return;
    await verifyBusiness.mutateAsync({ id: business._id, verified: true });
  };

  const handleReject = async () => {
    if (!business?._id) return;
    await verifyBusiness.mutateAsync({ id: business._id, verified: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (isError || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Business Not Found</h1>
          <p className="text-gray-600 mb-6">The requested business record was not found.</p>
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
            <h1 className="text-xl font-bold text-gray-900">Business Details</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                verificationState === "verified"
                  ? "bg-green-100 text-green-700"
                  : verificationState === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {verificationState.charAt(0).toUpperCase() + verificationState.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Profile
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Business Name</span><span className="font-medium">{business.businessName || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Owner/Contact</span><span className="font-medium">{business.contactPerson || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">User Name</span><span className="font-medium">{user.name || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Email</span><span className="font-medium">{business.officialEmail || user.email || "N/A"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Phone</span><span className="font-medium">{user.phone || "N/A"}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Registered</span><span className="font-medium">{new Date(business.createdAt).toLocaleDateString()}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Address
            </h2>
            <div className="space-y-3 text-sm">
              <div className="border-b pb-2">
                <p className="text-gray-600">Office Address</p>
                <p className="font-medium text-gray-900 mt-1">{business.officeAddress || "Not provided"}</p>
              </div>
              <div className="border-b pb-2">
                <p className="text-gray-600">Warehouse Address</p>
                <p className="font-medium text-gray-900 mt-1">{business.warehouseAddress || "Not provided"}</p>
              </div>
              <div className="text-xs text-gray-500">
                Geo: {business.latitude ?? "N/A"}, {business.longitude ?? "N/A"}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Payment Details
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Bank Account</span><span className="font-medium">{maskValue(business.bankAccountNumber)}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">IFSC</span><span className="font-medium">{business.ifscCode || "Not provided"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">UPI ID</span><span className="font-medium">{business.upiId || "Not provided"}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">PAN</span><span className="font-medium">{maskValue(business.panNumber)}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Compliance & Stats
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">GSTIN</span><span className="font-medium">{business.gstin || "Not provided"}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Total Orders</span><span className="font-medium">{business.totalOrders || 0}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Total Purchases</span><span className="font-medium">{business.totalPurchases || 0}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Total Spent</span><span className="font-medium">₹{(business.totalSpent || 0).toLocaleString()}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Action</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleVerify} disabled={verifyBusiness.isPending} className="sm:flex-1 bg-green-600 hover:bg-green-700">
              {verifyBusiness.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify
                </>
              )}
            </Button>
            <Button onClick={handleReject} disabled={verifyBusiness.isPending} variant="destructive" className="sm:flex-1">
              {verifyBusiness.isPending ? (
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
            {verificationState === "verified" ? <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" /> : <Building2 className="w-4 h-4 text-blue-600 mt-0.5" />}
            <span>
              Current account state is <strong>{verificationState}</strong>. Use verify/reject to update access for this business.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBusinessDetails;
