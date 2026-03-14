import React, { useState } from "react";
import { useAuth, UserRole } from "@/context/AuthContext";
import { Eye, EyeOff, Phone, Mail, Lock, User, ArrowLeft, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authApi } from "@/lib/api";

interface AuthFormProps {
  role: UserRole;
  onBack: () => void;
}

const roleConfig = {
  farmer: {
    label: "Farmer",
    color: "hsl(var(--primary))",
    lightColor: "hsl(var(--primary) / 0.08)",
    emoji: "🌾",
    description: "List your produce and connect with buyers directly",
  },
  b2b: {
    label: "B2B Business",
    color: "hsl(var(--info))",
    lightColor: "hsl(var(--info) / 0.08)",
    emoji: "🏢",
    description: "Source fresh agricultural produce in bulk",
  },
  customer: {
    label: "Customer",
    color: "hsl(var(--success))",
    lightColor: "hsl(var(--success) / 0.08)",
    emoji: "🛒",
    description: "Buy fresh farm produce at fair prices",
  },
  admin: {
    label: "Admin",
    color: "hsl(var(--destructive))",
    lightColor: "hsl(var(--destructive) / 0.08)",
    emoji: "🛡️",
    description: "Manage the ASWAMITHRA platform",
  },
};

type AuthMode = "login" | "register" | "forgot" | "verify_otp" | "reset_password";

const AuthForm: React.FC<AuthFormProps> = ({ role, onBack }) => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    otp: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const config = roleConfig[role!] || roleConfig.farmer;
  const isResetFlow = mode === "forgot" || mode === "verify_otp" || mode === "reset_password";

  const modeTitle =
    mode === "register"
      ? "Create Account"
      : mode === "forgot"
      ? "Forgot Password"
      : mode === "verify_otp"
      ? "Verify OTP"
      : mode === "reset_password"
      ? "Set New Password"
      : "Welcome back";

  const modeDescription =
    mode === "forgot"
      ? "Enter your registered email to receive OTP"
      : mode === "verify_otp"
      ? "Enter the OTP sent to your email"
      : mode === "reset_password"
      ? "Create a new password and login again"
      : `${config.label} Portal — ${config.description}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (mode === "register") {
        await register({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: role,
        });
        toast.success("Registration successful!");
        navigate(`/${role}/dashboard`);
      } else if (mode === "login") {
        const isFarmerLogin = role === "farmer";
        await login(isFarmerLogin ? "" : form.email, form.password, role || undefined, isFarmerLogin ? form.phone : undefined);
        toast.success("Login successful!");
        navigate(`/${role}/dashboard`);
      } else if (mode === "forgot") {
        await authApi.requestPasswordResetOtpPhone(form.phone, role || undefined);
        toast.success("OTP sent to your phone number.");
        setMode("verify_otp");
      } else if (mode === "verify_otp") {
        await authApi.verifyPasswordResetOtpPhone(form.phone, form.otp, role || undefined);
        toast.success("OTP verified. Set your new password.");
        setMode("reset_password");
      } else if (mode === "reset_password") {
        if (form.password.length < 6) {
          throw new Error("Password must be at least 6 characters");
        }
        if (form.password !== form.confirmPassword) {
          throw new Error("Passwords do not match");
        }
        await authApi.resetPasswordWithOtpPhone(form.phone, form.otp, form.password, role || undefined);
        toast.success("Password reset successful. Please login.");
        setMode("login");
        setForm((prev) => ({
          ...prev,
          password: "",
          confirmPassword: "",
          otp: "",
        }));
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      toast.error(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const backToLogin = () => {
    setMode("login");
    setError("");
    setForm((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
      otp: "",
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: "hsl(var(--background))" }}>
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to role selection
        </button>

        <div className="bg-card rounded-2xl border border-border float-shadow p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4"
              style={{ background: config.lightColor }}
            >
              {isResetFlow ? <KeyRound className="w-8 h-8" style={{ color: config.color }} /> : config.emoji}
            </div>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground">{modeTitle}</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">{modeDescription}</p>
          </div>

          {role === "customer" && (mode === "login" || mode === "register") && (
            <div className="flex rounded-lg p-1 mb-4 sm:mb-6" style={{ background: "hsl(var(--muted))" }}>
              {(["login", "register"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 py-2 text-xs sm:text-sm font-medium rounded-md transition-all"
                  style={
                    mode === m
                      ? { background: "hsl(var(--card))", color: config.color, boxShadow: "var(--shadow-card)" }
                      : { color: "hsl(var(--muted-foreground))" }
                  }
                >
                  {m === "login" ? "Sign In" : "Register"}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter your full name"
                    className="pl-10"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {mode === "register" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="+91 98765 43210"
                    className="pl-10"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {!isResetFlow && (role !== "farmer" || mode === "register") && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {!isResetFlow && role === "farmer" && mode === "login" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="pl-10"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {isResetFlow && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="pl-10"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    readOnly={mode === "verify_otp" || mode === "reset_password"}
                    required
                  />
                </div>
              </div>
            )}

            {(mode === "login" || mode === "register" || mode === "reset_password") && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">
                  {mode === "reset_password" ? "New Password" : "Password"}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={mode === "reset_password" ? "Enter new password" : "Enter your password"}
                    className="pl-10 pr-10"
                    value={form.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {mode === "verify_otp" && (
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-foreground">OTP</Label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={form.otp}
                  onChange={(e) => handleChange("otp", e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            )}

            {mode === "reset_password" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">OTP</Label>
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={form.otp}
                    onChange={(e) => handleChange("otp", e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-foreground">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      className="pl-10 pr-10"
                      value={form.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === "login" && role !== "admin" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: config.color }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 font-semibold mt-2"
              style={{ background: config.color, color: "hsl(var(--primary-foreground))" }}
              disabled={isLoading}
            >
              {isLoading
                ? "Please wait..."
                : mode === "login"
                ? "Sign In"
                : mode === "register"
                ? "Create Account"
                : mode === "forgot"
                ? "Send OTP"
                : mode === "verify_otp"
                ? "Verify OTP"
                : "Reset Password"}
            </Button>
          </form>

          {mode === "login" && (
            <p className="text-center text-xs text-muted-foreground mt-4">
              {role === "b2b" ? (
                <>
                  New to ASWAMITHRA?{" "}
                  <button onClick={() => navigate("/b2b/register")} className="font-medium" style={{ color: config.color }}>
                    Register Business
                  </button>
                </>
              ) : role === "farmer" ? (
                <>
                  New to ASWAMITHRA?{" "}
                  <button onClick={() => navigate("/farmer/register")} className="font-medium" style={{ color: config.color }}>
                    Register Farmer
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => setMode("register")} className="font-medium" style={{ color: config.color }}>
                    Register now
                  </button>
                </>
              )}
            </p>
          )}

          {(mode === "forgot" || mode === "verify_otp" || mode === "reset_password") && (
            <div className="text-center text-xs sm:text-sm text-muted-foreground mt-4">
              <button onClick={backToLogin} className="font-medium" style={{ color: config.color }}>
                Back to login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
