const express = require("express");
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const Farmer = require("../models/Farmer");
const { auth, requireRole } = require("../middleware/auth");
const {
  getPricingAdjustments,
  resolveViewerRole,
  decorateProductForViewer,
  decorateProductsForViewer,
} = require("../utils/pricing");
const { emitRealtimeEvent, EVENT_TYPES } = require("../utils/realtime");

const router = express.Router();

// File upload config
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

const sanitizeBaseFilename = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 80) || "product-image";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/products"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const safeExt = ALLOWED_IMAGE_EXTENSIONS.has(ext) ? ext : ".jpg";
    const base = sanitizeBaseFilename(path.basename(file.originalname || "", ext));
    cb(null, `${Date.now()}-${base}${safeExt}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype) && ALLOWED_IMAGE_EXTENSIONS.has(ext)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only JPG, PNG, WEBP, and GIF image files are allowed."));
  },
});

const toAbsoluteUploadUrl = (req, value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  return `${req.protocol}://${req.get("host")}${normalized}`;
};

// ========== CREATE PRODUCT (Farmer only) ==========
router.post("/", auth, requireRole("farmer"), upload.array("images", 5), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user._id });
    if (!farmer) return res.status(404).json({ error: "Farmer profile not found." });

    // Map frontend field names to backend schema
    const { name, category, quantity, unit, price, description, minimumOrder, marketPrice, quality, imageUrl, isOrganic } = req.body;
    
    // Validate required fields with frontend field names
    if (!name || !category || !price || !unit || !quantity) {
      return res.status(400).json({ 
        error: "Missing required fields",
        required: { name, category, price, unit, quantity },
        message: "Please provide name, category, price, unit, and quantity"
      });
    }

    // Convert and validate numeric values
    const pricePerUnit = Number(price);
    const availableQuantity = Number(quantity);
    const minOrder = Number(minimumOrder) || 1;
    const marketPriceValue = Number(marketPrice) || 0;

    if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
      return res.status(400).json({ error: "Price must be a valid positive number" });
    }
    
    if (isNaN(availableQuantity) || availableQuantity <= 0) {
      return res.status(400).json({ error: "Quantity must be a valid positive number" });
    }

    const uploadedImages = Array.isArray(req.files)
      ? req.files.map((f) => toAbsoluteUploadUrl(req, `/uploads/products/${f.filename}`))
      : [];
    const normalizedImageUrl = imageUrl ? toAbsoluteUploadUrl(req, imageUrl) : "";
    const product = new Product({
      farmerId: farmer._id,
      name: name,
      category: category,
      description: description || "",
      pricePerUnit: pricePerUnit,
      unit: unit,
      availableQuantity: availableQuantity,
      minimumOrder: minOrder,
      village: farmer.village,
      district: farmer.district,
      state: farmer.state,
      marketPrice: marketPriceValue,
      quality: quality || "Standard",
      imageUrl: uploadedImages[0] || normalizedImageUrl || "",
      isOrganic: isOrganic === "true" || isOrganic === true,
      images: uploadedImages,
    });

    await product.save();

    // Update farmer stats
    farmer.totalProducts += 1;
    await farmer.save();

    const adjustments = await getPricingAdjustments();
    const productForViewer = decorateProductForViewer(product, req.user.role, adjustments);
    const io = req.app.get("io");
    if (io) {
      emitRealtimeEvent(io, EVENT_TYPES.NEW_PRODUCT, {
        productId: product._id,
        farmerId: farmer._id,
        name: product.name,
        category: product.category,
        pricePerUnit: product.pricePerUnit,
      });
    }

    res.status(201).json(productForViewer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GET ALL PRODUCTS (with filters) ==========
router.get("/", async (req, res) => {
  try {
    const viewerRole = resolveViewerRole(req);
    const adjustments = await getPricingAdjustments();
    const { category, state, district, village, search, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;

    const filter = { isAvailable: true };
    if (category) filter.category = category;
    if (state) filter.state = { $regex: state, $options: "i" };
    if (district) filter.district = { $regex: district, $options: "i" };
    if (village) filter.village = { $regex: village, $options: "i" };
    if (search) filter.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      filter.pricePerUnit = {};
      if (minPrice) filter.pricePerUnit.$gte = Number(minPrice);
      if (maxPrice) filter.pricePerUnit.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { pricePerUnit: 1 };
    if (sort === "price_desc") sortOption = { pricePerUnit: -1 };
    if (sort === "popular") sortOption = { totalSold: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const productsRaw = await Product.find(filter)
      .populate("farmerId", "village district state rating")
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    const products = decorateProductsForViewer(productsRaw, viewerRole, adjustments);

    const total = await Product.countDocuments(filter);

    res.json({ products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GET FARMER'S PRODUCTS ==========
router.get("/farmer/my-products", auth, requireRole("farmer"), async (req, res) => {
  try {
    let farmer = await Farmer.findOne({ userId: req.user._id });

    if (!farmer) {
      farmer = new Farmer({
        userId: req.user._id,
        village: "",
        district: "",
        state: "",
        pinCode: "",
        fullAddress: "",
        upiId: "",
        bankAccountNumber: "",
        ifscCode: "",
        panNumber: "",
        category: "smallholder",
        transactionMode: "upi",
      });
      await farmer.save();
    }

    const productsRaw = await Product.find({ farmerId: farmer._id }).sort({ createdAt: -1 });
    const adjustments = await getPricingAdjustments();
    const products = decorateProductsForViewer(productsRaw, req.user.role, adjustments);
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== GET SINGLE PRODUCT ==========
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("farmerId");
    if (!product) return res.status(404).json({ error: "Product not found." });
    const viewerRole = resolveViewerRole(req);
    const adjustments = await getPricingAdjustments();
    res.json(decorateProductForViewer(product, viewerRole, adjustments));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== UPDATE PRODUCT (Farmer only) ==========
router.put("/:id", auth, requireRole("farmer"), upload.array("images", 5), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user._id });
    if (!farmer) return res.status(404).json({ error: "Farmer profile not found." });
    const product = await Product.findOne({ _id: req.params.id, farmerId: farmer._id });
    if (!product) return res.status(404).json({ error: "Product not found or not yours." });

    // Map frontend field names and update fields
    const { name, category, quantity, unit, price, description, minimumOrder, marketPrice, quality, imageUrl, isOrganic } = req.body;
    
    // Update basic fields
    if (name) product.name = name;
    if (category) product.category = category;
    if (description !== undefined) product.description = description;
    
    // Update numeric fields with validation
    if (price !== undefined) {
      const pricePerUnit = Number(price);
      if (isNaN(pricePerUnit) || pricePerUnit <= 0) {
        return res.status(400).json({ error: "Price must be a valid positive number" });
      }
      product.pricePerUnit = pricePerUnit;
    }
    
    if (quantity !== undefined) {
      const availableQuantity = Number(quantity);
      if (isNaN(availableQuantity) || availableQuantity <= 0) {
        return res.status(400).json({ error: "Quantity must be a valid positive number" });
      }
      product.availableQuantity = availableQuantity;
    }
    
    if (unit) product.unit = unit;
    if (minimumOrder !== undefined) product.minimumOrder = Number(minimumOrder) || 1;
    if (marketPrice !== undefined) product.marketPrice = Number(marketPrice) || 0;
    
    // Update new fields
    if (quality) product.quality = quality;
    const uploadedImages = Array.isArray(req.files)
      ? req.files.map((f) => toAbsoluteUploadUrl(req, `/uploads/products/${f.filename}`))
      : [];
    if (uploadedImages.length > 0) {
      product.images = uploadedImages;
      product.imageUrl = uploadedImages[0];
    } else if (imageUrl !== undefined) {
      product.imageUrl = toAbsoluteUploadUrl(req, imageUrl);
    }
    if (isOrganic !== undefined) product.isOrganic = isOrganic === "true" || isOrganic === true;
    
    product.updatedAt = new Date();
    await product.save();
    const adjustments = await getPricingAdjustments();
    const io = req.app.get("io");
    if (io) {
      emitRealtimeEvent(io, EVENT_TYPES.PRODUCT_UPDATE, {
        productId: product._id,
        name: product.name,
        category: product.category,
        pricePerUnit: product.pricePerUnit,
      });
    }
    res.json(decorateProductForViewer(product, req.user.role, adjustments));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== DELETE PRODUCT (Farmer only) ==========
router.delete("/:id", auth, requireRole("farmer"), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ userId: req.user._id });
    if (!farmer) return res.status(404).json({ error: "Farmer profile not found." });
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmerId: farmer._id });
    if (!product) return res.status(404).json({ error: "Product not found or not yours." });

    farmer.totalProducts = Math.max(0, farmer.totalProducts - 1);
    await farmer.save();

    res.json({ message: "Product deleted." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
