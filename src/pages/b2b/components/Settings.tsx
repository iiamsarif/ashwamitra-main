import React, { useState, useEffect } from "react";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/hooks/useApi";
import { useAuth } from "@/context/AuthContext";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

const Settings = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useBusinessProfile();
  const updateProfile = useUpdateBusinessProfile();

  const [form, setForm] = useState({
    businessName: "", ownerName: "", email: "", phone: "", gstin: "",
    officeAddress: "", warehouseAddress: "", bankAccountNumber: "",
    ifscCode: "", upiId: "", panNumber: "",
  });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (profile && user) {
      setForm({
        businessName: profile.businessName || "",
        ownerName: profile.contactPerson || user.name || "",
        email: profile.officialEmail || user.email || "",
        phone: user.phone || "",
        gstin: profile.gstin || "",
        officeAddress: profile.officeAddress || "",
        warehouseAddress: profile.warehouseAddress || "",
        bankAccountNumber: profile.bankAccountNumber || "",
        ifscCode: profile.ifscCode || "",
        upiId: profile.upiId || "",
        panNumber: profile.panNumber || "",
      });
    }
  }, [profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await updateProfile.mutateAsync({
      businessName: form.businessName, contactPerson: form.ownerName,
      officialEmail: form.email, gstin: form.gstin,
      officeAddress: form.officeAddress, warehouseAddress: form.warehouseAddress,
      bankAccountNumber: form.bankAccountNumber, ifscCode: form.ifscCode,
      upiId: form.upiId, panNumber: form.panNumber,
    });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading settings...</span>
      </div>
    );
  }

  const Field = ({ label, name, value, readOnly = false }: { label: string; name: string; value: string; readOnly?: boolean }) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input name={name} value={value} onChange={handleChange} readOnly={readOnly}
        className={`border px-3 py-2.5 rounded-lg w-full text-sm ${readOnly ? "bg-gray-50 text-gray-500" : "focus:ring-2 focus:ring-blue-400"}`} />
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-2xl p-4 sm:p-6 shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold">Business Settings</h1>
        <p className="text-blue-100 text-sm">Manage your business profile, payment details and password</p>
      </div>

      <div className="bg-white shadow-sm border rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-lg">Business Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Business Name" name="businessName" value={form.businessName} />
          <Field label="Contact Person" name="ownerName" value={form.ownerName} />
          <Field label="Official Email" name="email" value={form.email} />
          <Field label="Phone Number" name="phone" value={form.phone} readOnly />
          <Field label="GSTIN" name="gstin" value={form.gstin} />
          <Field label="PAN Number" name="panNumber" value={form.panNumber} />
        </div>
      </div>

      <div className="bg-white shadow-sm border rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-lg">Address</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Office Address" name="officeAddress" value={form.officeAddress} />
          <Field label="Warehouse Address" name="warehouseAddress" value={form.warehouseAddress} />
        </div>
      </div>

      <div className="bg-white shadow-sm border rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-lg">Payment Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Bank Account Number" name="bankAccountNumber" value={form.bankAccountNumber} />
          <Field label="IFSC Code" name="ifscCode" value={form.ifscCode} />
          <Field label="UPI ID" name="upiId" value={form.upiId} />
        </div>
      </div>

      <div className="bg-white shadow-sm border rounded-xl p-4 sm:p-6 space-y-4">
        <h2 className="font-semibold text-lg">Change Password</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
        <button onClick={handleChangePassword} disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
          className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50 text-sm font-medium">
          {changingPassword ? "Changing..." : "Change Password"}
        </button>
      </div>

      <div className="bg-white shadow-sm border rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-semibold">Verification Status</h2>
          <p className="text-sm text-gray-500">
            Status:
            <span className={`ml-2 px-3 py-1 text-xs rounded ${profile?.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
              {profile?.isVerified ? "Verified" : "Pending"}
            </span>
          </p>
        </div>
        <button onClick={handleSave} disabled={updateProfile.isPending}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg disabled:opacity-50 font-medium">
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
