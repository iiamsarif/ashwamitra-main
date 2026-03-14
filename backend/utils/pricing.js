const jwt = require("jsonwebtoken");
const PricingAdjustment = require("../models/PricingAdjustment");

const VALID_ROLES = ["farmer", "b2b", "customer"];
const DEFAULT_ADJUSTMENTS = {
  farmer: 0,
  b2b: 0,
  customer: 0,
};

const normalizeRole = (value) => {
  const role = typeof value === "string" ? value.trim().toLowerCase() : "";
  return VALID_ROLES.includes(role) ? role : "customer";
};

const toNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Number(Math.max(-100000, Math.min(100000, n)).toFixed(2));
};

const getPricingAdjustments = async () => {
  const doc = await PricingAdjustment.findOne({ key: "global" }).lean();
  return {
    farmer: toNumber(doc?.farmer),
    b2b: toNumber(doc?.b2b),
    customer: toNumber(doc?.customer),
    updatedAt: doc?.updatedAt || null,
  };
};

const upsertPricingAdjustments = async (input = {}, updatedBy = null) => {
  const payload = {
    farmer: toNumber(input.farmer),
    b2b: toNumber(input.b2b),
    customer: toNumber(input.customer),
    updatedBy: updatedBy || null,
  };

  const doc = await PricingAdjustment.findOneAndUpdate(
    { key: "global" },
    { $set: payload, $setOnInsert: { key: "global" } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return {
    farmer: toNumber(doc.farmer),
    b2b: toNumber(doc.b2b),
    customer: toNumber(doc.customer),
    updatedAt: doc.updatedAt || null,
  };
};

const applyPricingAdjustment = (basePrice, role, adjustments = DEFAULT_ADJUSTMENTS) => {
  const normalizedRole = normalizeRole(role);
  const base = Number(basePrice || 0);
  const delta = toNumber(adjustments?.[normalizedRole] ?? 0);
  return Math.max(0, Number((base + delta).toFixed(2)));
};

const resolveViewerRole = (req) => {
  if (req?.user?.role && VALID_ROLES.includes(req.user.role)) {
    return req.user.role;
  }

  const authHeader = req?.header?.("Authorization") || req?.headers?.authorization || "";
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded?.role && VALID_ROLES.includes(decoded.role)) {
        return decoded.role;
      }
    } catch {
      // Ignore token parsing failure and fallback to query/header role.
    }
  }

  const queryRole = req?.query?.viewerRole;
  const headerRole = req?.headers?.["x-viewer-role"];
  return normalizeRole(queryRole || headerRole || "customer");
};

const decorateProductForViewer = (product, role, adjustments = DEFAULT_ADJUSTMENTS) => {
  const normalizedRole = normalizeRole(role);
  const plain = typeof product?.toObject === "function" ? product.toObject() : { ...product };
  const basePrice = Number(plain.pricePerUnit || 0);
  const priceAdjustment = toNumber(adjustments?.[normalizedRole] ?? 0);
  const adjustedPrice = applyPricingAdjustment(basePrice, normalizedRole, adjustments);

  return {
    ...plain,
    basePricePerUnit: Number(basePrice.toFixed(2)),
    priceAdjustment,
    roleAdjustedPricePerUnit: adjustedPrice,
    pricePerUnit: adjustedPrice,
  };
};

const decorateProductsForViewer = (products = [], role, adjustments = DEFAULT_ADJUSTMENTS) =>
  products.map((product) => decorateProductForViewer(product, role, adjustments));

module.exports = {
  getPricingAdjustments,
  upsertPricingAdjustments,
  applyPricingAdjustment,
  resolveViewerRole,
  decorateProductForViewer,
  decorateProductsForViewer,
};
