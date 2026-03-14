import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Phone, Mail, Lock, User, ArrowLeft, MapPin, CreditCard, AlertCircle, Tractor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MapboxLocationPicker, { LocationData } from "@/components/map/MapboxLocationPicker";
import { toast } from "sonner";

interface FarmerRegistrationForm {
  farmerName: string;
  mobile: string;
  email: string;
  aadhaar: string;
  address: string;
  village: string;
  district: string;
  state: string;
  pincode: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  password: string;
  confirmPassword: string;
}

const FarmerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const [form, setForm] = useState<FarmerRegistrationForm>({
    farmerName: "",
    mobile: "",
    email: "",
    aadhaar: "",
    address: "",
    village: "",
    district: "",
    state: "",
    pincode: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<FarmerRegistrationForm>>({});

  const validateForm = () => {
    const newErrors: Partial<FarmerRegistrationForm> = {};

    if (!form.farmerName.trim()) newErrors.farmerName = "Farmer name is required";
    if (!form.mobile.trim() || !/^\+91\s?\d{5}\s?\d{5}$/.test(form.mobile)) {
      newErrors.mobile = "Valid mobile number is required";
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Valid email is required";
    }
    if (!form.aadhaar.trim() || !/^\d{12}$/.test(form.aadhaar)) {
      newErrors.aadhaar = "Valid 12-digit Aadhaar number is required";
    }
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.village.trim()) newErrors.village = "Village is required";
    if (!form.district.trim()) newErrors.district = "District is required";
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
        name: form.farmerName,
        email: form.email,
        phone: form.mobile,
        password: form.password,
        role: "farmer",
        village: form.village,
        district: form.district,
        state: form.state,
        pinCode: form.pincode,
        fullAddress: form.address,
        bankAccountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        panNumber: form.aadhaar,
      });
      setIsSubmitting(false);
      setShowSuccessMessage(true);
      setTimeout(() => { navigate("/farmer"); }, 3000);
    } catch (err: any) {
      setIsSubmitting(false);
      toast.error(err.message || "Registration failed");
    }
  };

  const handleChange = (field: keyof FarmerRegistrationForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Registration Submitted!</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
              Your farmer account is under admin approval. You will be notified once your account is approved.
            </p>
            <div className="bg-green-50 rounded-xl p-3 sm:p-4 border border-green-200">
              <p className="text-sm font-medium text-green-800 mb-2">Next Steps:</p>
              <ul className="text-xs sm:text-sm text-green-700 space-y-1 text-left">
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-4 sm:py-8">
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
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4">
            🌾
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Farmer Registration</h1>
          <p className="text-sm sm:text-base text-gray-600">Register as a farmer to sell your produce directly to businesses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Personal Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              Personal Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Farmer Name *</Label>
                <Input
                  placeholder="Enter your full name"
                  value={form.farmerName}
                  onChange={(e) => handleChange("farmerName", e.target.value)}
                  className={errors.farmerName ? "border-red-500" : ""}
                />
                {errors.farmerName && <p className="text-sm text-red-500">{errors.farmerName}</p>}
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
                  placeholder="farmer@email.com"
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
            </div>
          </div>

          {/* Location & Address Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Farm Location
            </h2>
            
            <div className="space-y-4">
              {/* Mapbox Location Picker */}
              <MapboxLocationPicker
                label="Pin Your Farm Location"
                height="280px"
                onLocationSelect={(loc: LocationData) => {
                  setForm(prev => ({
                    ...prev,
                    address: loc.fullAddress || loc.address || prev.address,
                    village: loc.village || prev.village,
                    district: loc.district || prev.district,
                    state: loc.state || prev.state,
                    pincode: loc.pincode || prev.pincode,
                  }));
                }}
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Address *</Label>
                <textarea
                  placeholder="Enter complete farm address"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  className={`w-full p-3 border rounded-lg resize-none h-20 ${errors.address ? "border-red-500" : "border-gray-200"}`}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Village *</Label>
                  <Input placeholder="Village name" value={form.village}
                    onChange={(e) => handleChange("village", e.target.value)}
                    className={errors.village ? "border-red-500" : ""} />
                  {errors.village && <p className="text-sm text-red-500">{errors.village}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">District *</Label>
                  <Input placeholder="District name" value={form.district}
                    onChange={(e) => handleChange("district", e.target.value)}
                    className={errors.district ? "border-red-500" : ""} />
                  {errors.district && <p className="text-sm text-red-500">{errors.district}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">State *</Label>
                  <Input placeholder="State name" value={form.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    className={errors.state ? "border-red-500" : ""} />
                  {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Pincode *</Label>
                  <Input placeholder="500001" value={form.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    className={errors.pincode ? "border-red-500" : ""} maxLength={6} />
                  {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
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
              <Lock className="w-5 h-5 text-green-600" />
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
            className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Register Farmer Account"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default FarmerRegistration;
