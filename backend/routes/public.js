const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");

const router = express.Router();

// ========== PUBLIC STATS ==========
router.get("/stats", async (req, res) => {
  try {
    const totalFarmers = await User.countDocuments({ role: "farmer" });
    const totalBusinesses = await User.countDocuments({ role: "b2b" });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalOrders = await Order.countDocuments();

    const totalRevenueAgg = await Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    res.json({
      totalFarmers,
      totalBusinesses,
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenueAgg[0]?.total || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
