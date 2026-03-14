const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Farmer = require("../models/Farmer");
const Business = require("../models/Business");
const Customer = require("../models/Customer");
const { hasEmailConfig, sendResetOtpEmail } = require("../services/emailService");
const { auth } = require("../middleware/auth");
const { emitRealtimeEvent, EVENT_TYPES } = require("../utils/realtime");

const router = express.Router();
const PUBLIC_ROLES = ["farmer", "b2b", "customer"];
const RESET_PASSWORD_ROLES = [...PUBLIC_ROLES, "admin"];
const OTP_EXPIRY_MINUTES = Number(process.env.RESET_OTP_EXPIRY_MINUTES || 10);
const OTP_REQUEST_LIMIT_WINDOW_MS = Number(process.env.RESET_OTP_REQUEST_WINDOW_MS || 15 * 60 * 1000);
const OTP_REQUEST_LIMIT_MAX = Number(process.env.RESET_OTP_REQUEST_MAX || 5);
const OTP_VERIFY_LIMIT_WINDOW_MS = Number(process.env.RESET_OTP_VERIFY_WINDOW_MS || 15 * 60 * 1000);
const OTP_VERIFY_LIMIT_MAX = Number(process.env.RESET_OTP_VERIFY_MAX || 10);
const OTP_RESET_LIMIT_WINDOW_MS = Number(process.env.RESET_OTP_RESET_WINDOW_MS || 15 * 60 * 1000);
const OTP_RESET_LIMIT_MAX = Number(process.env.RESET_OTP_RESET_MAX || 5);

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const normalizeString = (value) => (typeof value === "string" ? value.trim() : "");
const normalizeRole = (value) => normalizeString(value).toLowerCase();

const createOtpCode = () => `${Math.floor(100000 + Math.random() * 900000)}`;
const hashOtp = (otp, userId) =>
  crypto.createHash("sha256").update(`${otp}:${userId}:${process.env.JWT_SECRET}`).digest("hex");
const isValidOtp = (otp) => /^\d{6}$/.test(normalizeString(otp));
const includeDevOtp = process.env.NODE_ENV !== "production";
const genericOtpResponseMessage = "If this account exists, an OTP has been sent to the registered email.";
const otpRateLimitStore = new Map();

const buildRateLimitKey = (req, scope, email = "", role = "") => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.connection?.remoteAddress || "unknown";
  return `${scope}:${String(ip)}:${normalizeString(email).toLowerCase()}:${normalizeRole(role) || "all"}`;
};

const consumeRateLimit = (key, max, windowMs) => {
  const now = Date.now();
  const current = otpRateLimitStore.get(key);
  if (!current || current.resetAt <= now) {
    otpRateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= max) return false;
  current.count += 1;
  otpRateLimitStore.set(key, current);
  return true;
};

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ========== REGISTER ==========
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password, role, ...profileData } = req.body;
    const normalizedRole = normalizeString(role).toLowerCase();
    const normalizedName = normalizeString(name);
    const normalizedEmail = normalizeString(email).toLowerCase();
    const normalizedPhone = normalizeString(phone);

    if (!PUBLIC_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ error: "Invalid role selected for self-registration." });
    }
    if (!normalizedName || !normalizedEmail || !normalizedPhone || !password) {
      return res.status(400).json({ error: "Name, email, phone and password are required." });
    }
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    if (normalizedRole === "b2b") {
      const requiredB2BFields = ["businessName", "contactPerson", "officeAddress", "bankAccountNumber", "ifscCode", "panNumber"];
      const missing = requiredB2BFields.filter((field) => !normalizeString(profileData[field]));
      if (missing.length) {
        return res.status(400).json({ error: `Missing required business fields: ${missing.join(", ")}` });
      }
    }

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { phone: normalizedPhone }] });
    if (existingUser) {
      return res.status(400).json({ error: "Email or phone already registered." });
    }

    // Create user
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password,
      role: normalizedRole,
      status: normalizedRole === "customer" ? "active" : "pending",
    });

    // Create role-specific profile
    try {
      if (normalizedRole === "farmer") {
        await Farmer.create({
          userId: user._id,
          village: profileData.village || "",
          district: profileData.district || "",
          state: profileData.state || "",
          pinCode: profileData.pinCode || "",
          fullAddress: profileData.fullAddress || "",
          upiId: profileData.upiId || "",
          bankAccountNumber: profileData.bankAccountNumber || "",
          ifscCode: profileData.ifscCode || "",
          panNumber: profileData.panNumber || "",
          category: profileData.bankAccountNumber ? "bulk" : "smallholder",
          transactionMode: profileData.bankAccountNumber ? "bank" : "upi",
        });
      } else if (normalizedRole === "b2b") {
        await Business.create({
          userId: user._id,
          businessName: profileData.businessName || "",
          gstin: profileData.gstin || "",
          contactPerson: profileData.contactPerson || normalizedName,
          officialEmail: profileData.officialEmail || normalizedEmail,
          officeAddress: profileData.officeAddress || "",
          warehouseAddress: profileData.warehouseAddress || "",
          bankAccountNumber: profileData.bankAccountNumber || "",
          ifscCode: profileData.ifscCode || "",
          upiId: profileData.upiId || "",
          panNumber: profileData.panNumber || "",
        });
      } else if (normalizedRole === "customer") {
        await Customer.create({
          userId: user._id,
          deliveryAddress: profileData.deliveryAddress || "",
          paymentPreference: profileData.paymentPreference || "upi",
        });
      }
    } catch (profileError) {
      await User.deleteOne({ _id: user._id });
      throw profileError;
    }

    const token = generateToken(user);
    const io = req.app.get("io");
    if (io) {
      emitRealtimeEvent(io, EVENT_TYPES.NEW_REGISTRATION, {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        status: user.status,
      }, "admin");
    }
    res.status(201).json({
      message: "Registration successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== LOGIN ==========
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = normalizeString(email).toLowerCase();
    const normalizedRole = normalizeString(role).toLowerCase();
    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ error: "Invalid email or password." });
    if (normalizedRole && user.role !== normalizedRole) return res.status(401).json({ error: `This account is not a ${normalizedRole} account.` });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: "Invalid email or password." });

    if (user.status === "suspended") return res.status(403).json({ error: "Account suspended. Contact admin." });
    if (["inactive", "pending"].includes(user.status) && user.role !== "customer") {
      return res.status(403).json({ error: "Account is pending approval. Please contact support." });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save();

    const token = generateToken(user);
    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, status: user.status },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GET CURRENT USER ==========
router.get("/me", auth, async (req, res) => {
  try {
    let profile = null;
    if (req.user.role === "farmer") {
      profile = await Farmer.findOne({ userId: req.user._id });
    }
    else if (req.user.role === "b2b") {
      profile = await Business.findOne({ userId: req.user._id });
    }
    else if (req.user.role === "customer") {
      profile = await Customer.findOne({ userId: req.user._id });
    }

    res.json({ user: req.user, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== CHANGE PASSWORD ==========
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "Both passwords are required." });
    if (newPassword.length < 6) return res.status(400).json({ error: "New password must be at least 6 characters long." });

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ error: "Current password is incorrect." });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== REQUEST RESET OTP ==========
const requestResetOtpHandler = async (req, res) => {
  try {
    const email = normalizeString(req.body.email).toLowerCase();
    const role = normalizeRole(req.body.role);

    const requestLimitKey = buildRateLimitKey(req, "reset_otp_request", email, role);
    if (!consumeRateLimit(requestLimitKey, OTP_REQUEST_LIMIT_MAX, OTP_REQUEST_LIMIT_WINDOW_MS)) {
      return res.status(429).json({ error: "Too many OTP requests. Please try again later." });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (role && !RESET_PASSWORD_ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role provided." });
    }

    const userFilter = role ? { email, role } : { email };
    const user = await User.findOne(userFilter);

    if (!user) {
      return res.json({ message: genericOtpResponseMessage });
    }

    const otp = createOtpCode();
    const otpHash = hashOtp(otp, user._id.toString());
    const now = new Date();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.resetPasswordOtpHash = otpHash;
    user.resetPasswordOtpExpiresAt = expiresAt;
    user.resetPasswordOtpVerifiedAt = null;
    user.resetPasswordOtpRequestedAt = now;
    await user.save();

    const deliveryResult = await sendResetOtpEmail({
      to: user.email,
      name: user.name,
      otp,
      expiryMinutes: OTP_EXPIRY_MINUTES,
    });

    if (!deliveryResult.sent) {
      if (process.env.NODE_ENV === "production") {
        console.error(
          `[RESET_OTP] delivery failed for user=${user.email} role=${user.role} reason=${deliveryResult.reason || "unknown"}`
        );
        return res.status(503).json({ error: "OTP delivery service is unavailable. Please try again later." });
      }
      if (!hasEmailConfig()) {
        console.warn("[RESET_OTP] SMTP config not found. Falling back to dev OTP response.");
      }
    } else {
      console.log(`[RESET_OTP] email sent to user=${user.email} role=${user.role} messageId=${deliveryResult.messageId}`);
    }

    if (includeDevOtp) {
      console.log(
        `[RESET_OTP] user=${user.email} role=${user.role} otp=${otp} expiresAt=${expiresAt.toISOString()}`
      );
    } else {
      console.log(
        `[RESET_OTP] generated for user=${user.email} role=${user.role} expiresAt=${expiresAt.toISOString()}`
      );
    }

    return res.json({
      message: genericOtpResponseMessage,
      ...(includeDevOtp ? { otp } : {}),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

router.post("/forgot-password", requestResetOtpHandler);
router.post("/request-reset-otp", requestResetOtpHandler);
router.post("/forgot-password-otp", requestResetOtpHandler);

// ========== VERIFY RESET OTP ==========
const verifyResetOtpHandler = async (req, res) => {
  try {
    const email = normalizeString(req.body.email).toLowerCase();
    const otp = normalizeString(req.body.otp);
    const role = normalizeRole(req.body.role);

    const verifyLimitKey = buildRateLimitKey(req, "reset_otp_verify", email, role);
    if (!consumeRateLimit(verifyLimitKey, OTP_VERIFY_LIMIT_MAX, OTP_VERIFY_LIMIT_WINDOW_MS)) {
      return res.status(429).json({ error: "Too many OTP verification attempts. Please try again later." });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (!isValidOtp(otp)) {
      return res.status(400).json({ error: "OTP must be 6 digits." });
    }
    if (role && !RESET_PASSWORD_ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role provided." });
    }

    const userFilter = role ? { email, role } : { email };
    const user = await User.findOne(userFilter);

    if (
      !user ||
      !user.resetPasswordOtpHash ||
      !user.resetPasswordOtpExpiresAt ||
      new Date(user.resetPasswordOtpExpiresAt).getTime() < Date.now()
    ) {
      return res.status(400).json({ error: "OTP is invalid or expired." });
    }

    const inputHash = hashOtp(otp, user._id.toString());
    if (inputHash !== user.resetPasswordOtpHash) {
      return res.status(400).json({ error: "OTP is invalid or expired." });
    }

    user.resetPasswordOtpVerifiedAt = new Date();
    await user.save();

    return res.json({ message: "OTP verified successfully." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

router.post("/verify-reset-otp", verifyResetOtpHandler);
router.post("/verify-otp", verifyResetOtpHandler);

// ========== RESET PASSWORD WITH OTP ==========
const resetPasswordWithOtpHandler = async (req, res) => {
  try {
    const email = normalizeString(req.body.email).toLowerCase();
    const otp = normalizeString(req.body.otp);
    const newPassword = normalizeString(req.body.newPassword);
    const role = normalizeRole(req.body.role);

    const resetLimitKey = buildRateLimitKey(req, "reset_password_with_otp", email, role);
    if (!consumeRateLimit(resetLimitKey, OTP_RESET_LIMIT_MAX, OTP_RESET_LIMIT_WINDOW_MS)) {
      return res.status(429).json({ error: "Too many reset attempts. Please try again later." });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Please provide a valid email address." });
    }
    if (!isValidOtp(otp)) {
      return res.status(400).json({ error: "OTP must be 6 digits." });
    }
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }
    if (role && !RESET_PASSWORD_ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role provided." });
    }

    const userFilter = role ? { email, role } : { email };
    const user = await User.findOne(userFilter);
    if (
      !user ||
      !user.resetPasswordOtpHash ||
      !user.resetPasswordOtpExpiresAt ||
      new Date(user.resetPasswordOtpExpiresAt).getTime() < Date.now()
    ) {
      return res.status(400).json({ error: "OTP is invalid or expired." });
    }

    const inputHash = hashOtp(otp, user._id.toString());
    if (inputHash !== user.resetPasswordOtpHash) {
      return res.status(400).json({ error: "OTP is invalid or expired." });
    }

    user.password = newPassword;
    user.resetPasswordOtpHash = "";
    user.resetPasswordOtpExpiresAt = null;
    user.resetPasswordOtpVerifiedAt = null;
    user.resetPasswordOtpRequestedAt = null;
    await user.save();

    return res.json({ message: "Password reset successful." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

router.post("/reset-password", resetPasswordWithOtpHandler);
router.post("/reset-password-with-otp", resetPasswordWithOtpHandler);

module.exports = router;
