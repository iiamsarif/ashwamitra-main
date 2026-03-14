require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");
const path = require("path");

const authRoutes = require("./routes/auth");
const farmerRoutes = require("./routes/farmers");
const businessRoutes = require("./routes/businesses");
const customerRoutes = require("./routes/customers");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
const adminRoutes = require("./routes/admin");
const deliveryRoutes = require("./routes/delivery");
const walletRoutes = require("./routes/wallet");
const notificationRoutes = require("./routes/notifications");
const razorpayRoutes = require("./routes/razorpay");
const contactMessageRoutes = require("./routes/contactMessages");

const app = express();
const httpServer = http.createServer(app);
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const getCorsOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) {
    return callback(null, true);
  }
  return callback(new Error("CORS origin not allowed"));
};
const apiLimiter = rateLimit({
  windowMs: Number(process.env.API_RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.API_RATE_LIMIT_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: getCorsOrigin,
    credentials: true,
  })
);
app.use("/api", apiLimiter);
app.use(express.json({ limit: "1mb" }));

const uploadsRoot = path.join(__dirname, "uploads");
const productUploadsDir = path.join(uploadsRoot, "products");
fs.mkdirSync(productUploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsRoot));

const io = new Server(httpServer, {
  cors: {
    origin: getCorsOrigin,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const { userId, userRole } = socket.handshake?.auth || {};
  if (userId) socket.join(`user-${userId}`);
  if (userRole) socket.join(`role-${userRole}`);

  socket.on("join-room", ({ userId: joinUserId, userRole: joinUserRole }) => {
    if (joinUserId) socket.join(`user-${joinUserId}`);
    if (joinUserRole) socket.join(`role-${joinUserRole}`);
  });
});

app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/razorpay", razorpayRoutes);
app.use("/api/contact-messages", contactMessageRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });
