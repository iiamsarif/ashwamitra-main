import React, { useState, useEffect } from "react";
import { User, Phone, Mail, MapPin, Edit3, Save, Shield, Award, Package, Wallet, Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCustomerProfile, useUpdateCustomerProfile, useCustomerOrders, useMyWallet } from "@/hooks/useApi";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import WalletComponent from "../../../components/wallet/WalletComponent";

const ProfileComponent: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCustomerProfile();
  const { data: orders } = useCustomerOrders();
  const { data: wallet } = useMyWallet();
  const updateProfile = useUpdateCustomerProfile();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const [form, setForm] = useState({ deliveryAddress: "", paymentPreference: "upi" });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({ deliveryAddress: profile.deliveryAddress || "", paymentPreference: profile.paymentPreference || "upi" });
    }
  }, [profile]);

  const handleSave = async () => {
    await updateProfile.mutateAsync(form);
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error("Passwords do not match"); return; }
    if (passwordForm.newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setChangingPassword(true);
    try {
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
        <span className="ml-3">Loading profile...</span>
      </div>
    );
  }

  const totalOrders = orders?.length || 0;
  const totalSpent = orders?.filter((o: any) => o.status === "delivered").reduce((s: number, o: any) => s + o.totalAmount, 0) || 0;
  const walletBalance = wallet?.balance || 0;
  const subscriptionOrders = (orders || [])
    .filter((o: any) => typeof o?.notes === "string" && o.notes.toLowerCase().includes("subscription:"))
    .sort((a: any, b: any) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
  const latestSubscriptionOrder = subscriptionOrders[0];
  const planMatch = latestSubscriptionOrder?.notes?.match(/subscription:\s*([a-zA-Z]+)/i);
  const membershipPlan = (planMatch?.[1] || "none").toLowerCase();
  const isSubscriber = membershipPlan !== "none";
  const membershipStatusEn = isSubscriber ? "Subscriber" : "Not Subscriber";
  const membershipStatusTe = isSubscriber ? "సభ్యుడు" : "సభ్యుడు కాదు";
  const membershipPlanLabel = isSubscriber
    ? membershipPlan.charAt(0).toUpperCase() + membershipPlan.slice(1)
    : "None";

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <span className="text-3xl sm:text-4xl">👨‍🌾</span>
              </div>
              <div className="flex-1 text-white min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold mb-1 truncate">{user?.name || "Customer"}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-green-100">
                  <span className="flex items-center gap-1 truncate"><Mail className="w-4 h-4 flex-shrink-0" />{user?.email}</span>
                  {user?.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4 flex-shrink-0" />{user.phone}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm text-center">
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">{totalOrders}</p>
            <p className="text-xs sm:text-sm text-gray-500">Orders</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm text-center">
            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500">Total Spent</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm text-center">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-gray-900">₹{walletBalance.toLocaleString()}</p>
            <p className="text-xs sm:text-sm text-gray-500">Wallet</p>
          </div>
          <div className="bg-white rounded-xl p-3 sm:p-4 border shadow-sm text-center">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-sm sm:text-lg font-bold text-gray-900">{membershipStatusEn}</p>
            <p className="text-xs sm:text-sm text-gray-500">{membershipStatusTe}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border mb-6 p-1.5 sm:p-2">
          <div className="flex gap-1 sm:gap-2">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "address", label: "Address", icon: MapPin },
              { id: "password", label: "Password", icon: Lock },
              { id: "wallet", label: "Wallet", icon: Wallet },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition ${
                  activeTab === tab.id ? "bg-green-600 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}>
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.slice(0, 4)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-2xl shadow-lg border p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-4">Personal Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Name</span><span className="font-medium">{user?.name}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Email</span><span className="font-medium truncate ml-4">{user?.email}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Phone</span><span className="font-medium">{user?.phone || "N/A"}</span></div>
              <div className="flex justify-between py-2 border-b"><span className="text-gray-500">Payment</span><span className="font-medium">{form.paymentPreference?.toUpperCase()}</span></div>
              <div className="flex justify-between py-2"><span className="text-gray-500">Status</span><span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">{user?.status || "Active"}</span></div>
            </div>

            <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <h4 className="font-semibold text-sm text-emerald-800 mb-2">Membership / సభ్యత్వం</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status / స్థితి</span>
                  <span className="font-medium">{membershipStatusEn} / {membershipStatusTe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan / ప్లాన్</span>
                  <span className="font-medium">{membershipPlanLabel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated / నవీకరించిన తేదీ</span>
                  <span className="font-medium">
                    {latestSubscriptionOrder?.createdAt
                      ? new Date(latestSubscriptionOrder.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <button onClick={logout} className="mt-6 px-6 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100">Logout</button>
          </div>
        )}

        {/* Address */}
        {activeTab === "address" && (
          <div className="bg-white rounded-2xl shadow-lg border p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Delivery Address</h3>
              <button onClick={() => setEditing(!editing)} className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                {editing ? "Cancel" : "Edit"}
              </button>
            </div>
            {editing ? (
              <div className="space-y-4">
                <textarea value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500/20" rows={3} placeholder="Enter your delivery address" />
                <select value={form.paymentPreference} onChange={(e) => setForm({ ...form, paymentPreference: e.target.value })}
                  className="w-full p-3 border rounded-lg">
                  <option value="upi">UPI</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="card">Card</option>
                </select>
                <button onClick={handleSave} disabled={updateProfile.isPending}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold disabled:opacity-50">
                  {updateProfile.isPending ? "Saving..." : "Save Address"}
                </button>
              </div>
            ) : (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-gray-700">{form.deliveryAddress || "No address saved. Click edit to add."}</p>
              </div>
            )}
          </div>
        )}

        {/* Password */}
        {activeTab === "password" && (
          <div className="bg-white rounded-2xl shadow-lg border p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-4">Change Password</h3>
            <div className="space-y-4 max-w-md">
              {[
                { key: "current" as const, label: "Current Password", field: "currentPassword" as const },
                { key: "new" as const, label: "New Password", field: "newPassword" as const },
                { key: "confirm" as const, label: "Confirm New Password", field: "confirmPassword" as const },
              ].map(({ key, label, field }) => (
                <div key={key} className="relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input type={showPasswords[key] ? "text" : "password"} value={passwordForm[field]}
                    onChange={e => setPasswordForm({ ...passwordForm, [field]: e.target.value })}
                    className="border rounded-lg px-4 py-2.5 w-full text-sm pr-10" placeholder={label} />
                  <button type="button" onClick={() => setShowPasswords({ ...showPasswords, [key]: !showPasswords[key] })}
                    className="absolute right-3 top-7 text-gray-400">
                    {showPasswords[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              ))}
              <button onClick={handleChangePassword} disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 font-medium">
                {changingPassword ? "Changing..." : "Change Password"}
              </button>
            </div>
          </div>
        )}

        {/* Wallet */}
        {activeTab === "wallet" && (
          <WalletComponent userId={user?.id || ""} userName={user?.name} />
        )}
      </div>
    </div>
  );
};

export default ProfileComponent;
