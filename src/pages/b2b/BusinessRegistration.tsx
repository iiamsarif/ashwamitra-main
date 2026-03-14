import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Phone, Mail, Lock, User, ArrowLeft, Building2, MapPin, CreditCard, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MapboxLocationPicker, { LocationData } from "@/components/map/MapboxLocationPicker";
import { toast } from "sonner";

interface BusinessRegistrationForm {
  businessName: string;
  ownerName: string;
  mobile: string;
  email: string;
  aadhaar: string;
  gst: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  password: string;
  confirmPassword: string;
}

const BusinessRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [form, setForm] = useState<BusinessRegistrationForm>({
    businessName: "",
    ownerName: "",
    mobile: "",
    email: "",
    aadhaar: "",
    gst: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<BusinessRegistrationForm>>({});

  const validateForm = () => {
    const newErrors: Partial<BusinessRegistrationForm> = {};

    if (!form.businessName.trim()) newErrors.businessName = "Business name is required";
    if (!form.ownerName.trim()) newErrors.ownerName = "Owner name is required";
    if (!form.mobile.trim() || !/^\+91\s?\d{5}\s?\d{5}$/.test(form.mobile)) {
      newErrors.mobile = "Valid mobile number is required";
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!form.aadhaar.trim() || !/^\d{12}$/.test(form.aadhaar)) {
      newErrors.aadhaar = "Valid 12-digit Aadhaar number is required";
    }
    if (form.gst && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/.test(form.gst)) {
      newErrors.gst = "Valid GST number format required";
    }
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.state.trim()) newErrors.state = "State is required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) {
      newErrors.pincode = "Valid 6-digit pincode is required";
    }
    if (!form.accountHolderName.trim()) newErrors.accountHolderName = "Account holder name is required";
    if (!form.accountNumber.trim() || !/^\d{9,18}$/.test(form.accountNumber)) {
      newErrors.accountNumber = "Valid account number is required";
    }
    if (!form.ifscCode.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifscCode)) {
      newErrors.ifscCode = "Valid IFSC code is required";
    }
    if (!form.bankName.trim()) newErrors.bankName = "Bank name is required";
    if (!form.password.trim() || form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const { authApi } = await import("@/lib/api");
      await authApi.register({
        name: form.ownerName,
        email: form.email,
        phone: form.mobile,
        password: form.password,
        role: "b2b",
        businessName: form.businessName,
        gstin: form.gst,
        contactPerson: form.ownerName,
        officialEmail: form.email,
        officeAddress: `${form.address}, ${form.city}, ${form.state} ${form.pincode}`,
        bankAccountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        panNumber: form.aadhaar,
      });
      setIsSubmitting(false);
      setShowSuccessMessage(true);
      setTimeout(() => { navigate("/b2b"); }, 3000);
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.message || "Registration failed");
    }
  };

  const handleChange = (field: keyof BusinessRegistrationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Registration Submitted!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Your business account is under admin approval. You will be notified once your account is approved.
            </p>
            <div className="bg-blue-50 rounded-xl p-3 sm:p-4 border border-blue-200">
              <p className="text-sm font-medium text-blue-800 mb-2">Next Steps:</p>
              <ul className="text-xs sm:text-sm text-blue-700 space-y-1 text-left">
                <li>• Admin will review your documents</li>
                <li>• Approval typically takes 24-48 hours</li>
                <li>• You'll receive an email confirmation</li>
                <li>• Login will be enabled after approval</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4">
            🏢
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Business Registration</h1>
          <p className="text-sm sm:text-base text-gray-600">Register your business to start sourcing fresh agricultural produce</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Business Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              Business Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Business Name *</Label>
                <Input
                  placeholder="Enter your business name"
                  value={form.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                  className={errors.businessName ? "border-red-500" : ""}
                />
                {errors.businessName && <p className="text-sm text-red-500">{errors.businessName}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Owner Name *</Label>
                <Input
                  placeholder="Enter owner name"
                  value={form.ownerName}
                  onChange={(e) => handleChange("ownerName", e.target.value)}
                  className={errors.ownerName ? "border-red-500" : ""}
                />
                {errors.ownerName && <p className="text-sm text-red-500">{errors.ownerName}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Mobile Number *</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={form.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  className={errors.mobile ? "border-red-500" : ""}
                />
                {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Email Address *</Label>
                <Input
                  type="email"
                  placeholder="business@email.com"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Aadhaar Number *</Label>
                <Input
                  placeholder="1234 5678 9012"
                  value={form.aadhaar}
                  onChange={(e) => handleChange("aadhaar", e.target.value.replace(/\s/g, ""))}
                  className={errors.aadhaar ? "border-red-500" : ""}
                  maxLength={12}
                />
                {errors.aadhaar && <p className="text-sm text-red-500">{errors.aadhaar}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">GST Number (Optional)</Label>
                <Input
                  placeholder="22AAAAA0000A1Z5"
                  value={form.gst}
                  onChange={(e) => handleChange("gst", e.target.value)}
                  className={errors.gst ? "border-red-500" : ""}
                />
                {errors.gst && <p className="text-sm text-red-500">{errors.gst}</p>}
              </div>
            </div>
          </div>

          {/* Business Location Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Business Location
            </h2>
            
            <div className="space-y-4">
              {/* Mapbox Location Picker */}
              <MapboxLocationPicker
                label="Pin Your Business Location"
                height="280px"
                onLocationSelect={(loc: LocationData) => {
                  setForm(prev => ({
                    ...prev,
                    address: loc.fullAddress || loc.address || prev.address,
                    city: loc.city || prev.city,
                    state: loc.state || prev.state,
                    pincode: loc.pincode || prev.pincode,
                  }));
                }}
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Address *</Label>
                <textarea
                  placeholder="Enter complete business address"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className={`w-full p-3 border rounded-lg resize-none h-20 ${errors.address ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">City *</Label>
                  <Input placeholder="City" value={form.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    className={errors.city ? "border-red-500" : ""} />
                  {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">State *</Label>
                  <Input placeholder="State" value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className={errors.state ? "border-red-500" : ""} />
                  {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Pincode *</Label>
                  <Input
                    placeholder="500001"
                    value={form.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    className={errors.pincode ? "border-red-500" : ""}
                    maxLength={6}
                  />
                  {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Bank Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Account Holder Name *</Label>
                <Input
                  placeholder="Name as per bank account"
                  value={form.accountHolderName}
                  onChange={(e) => handleChange("accountHolderName", e.target.value)}
                  className={errors.accountHolderName ? "border-red-500" : ""}
                />
                {errors.accountHolderName && <p className="text-sm text-red-500">{errors.accountHolderName}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Account Number *</Label>
                <Input
                  placeholder="Bank account number"
                  value={form.accountNumber}
                  onChange={(e) => handleChange("accountNumber", e.target.value)}
                  className={errors.accountNumber ? "border-red-500" : ""}
                />
                {errors.accountNumber && <p className="text-sm text-red-500">{errors.accountNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">IFSC Code *</Label>
                <Input
                  placeholder="HDFC0001234"
                  value={form.ifscCode}
                  onChange={(e) => handleChange("ifscCode", e.target.value.toUpperCase())}
                  className={errors.ifscCode ? "border-red-500" : ""}
                />
                {errors.ifscCode && <p className="text-sm text-red-500">{errors.ifscCode}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Bank Name *</Label>
                <Input
                  placeholder="Bank name"
                  value={form.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  className={errors.bankName ? "border-red-500" : ""}
                />
                {errors.bankName && <p className="text-sm text-red-500">{errors.bankName}</p>}
              </div>
            </div>
          </div>

          {/* Password Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Account Security
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create password"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Register Business Account"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BusinessRegistration;
