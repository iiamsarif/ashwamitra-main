import React, { useState, useEffect } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useFarmerProfile, useUpdateFarmerProfile } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

const FarmerSettings = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useFarmerProfile();
  const updateProfile = useUpdateFarmerProfile();

  const [form, setForm] = useState({
    farmerName: "", phone: "", email: "", village: "", district: "", state: "", pinCode: "",
    fullAddress: "", upiId: "", bankAccountNumber: "", ifscCode: "", panNumber: "",
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (profile && user) {
      setForm({
        farmerName: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        village: profile.village || "",
        district: profile.district || "",
        state: profile.state || "",
        pinCode: profile.pinCode || "",
        fullAddress: profile.fullAddress || "",
        upiId: profile.upiId || "",
        bankAccountNumber: profile.bankAccountNumber || "",
        ifscCode: profile.ifscCode || "",
        panNumber: profile.panNumber || "",
      });
    }
  }, [profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      village: form.village, district: form.district, state: form.state,
      pinCode: form.pinCode, fullAddress: form.fullAddress,
      upiId: form.upiId, bankAccountNumber: form.bankAccountNumber,
      ifscCode: form.ifscCode, panNumber: form.panNumber,
    });
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        <span className="ml-2">Loading profile...</span>
      </div>
    );
  }

  const Field = ({ label, name, value, readOnly = false }: { label: string; name: string; value: string; readOnly?: boolean }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input name={name} value={value} onChange={handleChange} readOnly={readOnly}
        className={`border rounded-lg px-4 py-2.5 w-full text-sm ${readOnly ? "bg-gray-50 text-gray-500" : "focus:ring-2 focus:ring-green-400"}`} />
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 p-4 sm:p-6 rounded-2xl text-white shadow">
        <h1 className="text-xl sm:text-2xl font-bold">Farmer Profile & Settings</h1>
        <p className="text-sm opacity-90">Manage your profile, bank details and password</p>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-lg text-gray-700">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Farmer Name" name="farmerName" value={form.farmerName} readOnly />
          <Field label="Phone Number" name="phone" value={form.phone} readOnly />
          <Field label="Email Address" name="email" value={form.email} readOnly />
        </div>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-lg text-gray-700">Farm Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Village" name="village" value={form.village} />
          <Field label="District" name="district" value={form.district} />
          <Field label="State" name="state" value={form.state} />
          <Field label="Pin Code" name="pinCode" value={form.pinCode} />
          <div className="sm:col-span-2">
            <Field label="Full Address" name="fullAddress" value={form.fullAddress} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-lg text-gray-700">Bank & Payment Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="UPI ID" name="upiId" value={form.upiId} />
          <Field label="Bank Account Number" name="bankAccountNumber" value={form.bankAccountNumber} />
          <Field label="IFSC Code" name="ifscCode" value={form.ifscCode} />
          <Field label="PAN Number" name="panNumber" value={form.panNumber} />
        </div>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
        <h2 className="font-semibold text-lg text-gray-700">Change Password</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
            <input type={showPasswords.current ? "text" : "password"} value={passwordForm.currentPassword}
              onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="border rounded-lg px-4 py-2.5 w-full text-sm pr-10" placeholder="Enter current password" />
            <button type="button" onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
              className="absolute right-3 top-7 text-gray-400">
              {showPasswords.current ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div />
          <div className="relative">
            <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
            <input type={showPasswords.new ? "text" : "password"} value={passwordForm.newPassword}
              onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="border rounded-lg px-4 py-2.5 w-full text-sm pr-10" placeholder="Enter new password" />
            <button type="button" onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
              className="absolute right-3 top-7 text-gray-400">
              {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
            <input type={showPasswords.confirm ? "text" : "password"} value={passwordForm.confirmPassword}
              onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="border rounded-lg px-4 py-2.5 w-full text-sm pr-10" placeholder="Confirm new password" />
            <button type="button" onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
              className="absolute right-3 top-7 text-gray-400">
              {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button onClick={handleChangePassword} disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 text-sm font-medium">
          {changingPassword ? "Changing..." : "Change Password"}
        </button>
      </div>

      <div className="bg-white border border-green-100 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-semibold">Verification Status</h2>
          <p className="text-sm text-gray-500">
            Status: 
            <span className={`ml-2 px-3 py-1 text-xs rounded ${
              profile?.isApproved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {profile?.isApproved ? "Approved" : "Pending"}
            </span>
          </p>
        </div>
        <button onClick={handleSave} disabled={updateProfile.isPending}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50 font-medium">
          {updateProfile.isPending ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
};

export default FarmerSettings;
