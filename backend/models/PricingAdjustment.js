const mongoose = require("mongoose");

const pricingAdjustmentSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true, index: true },
    farmer: { type: Number, default: 0 },
    b2b: { type: Number, default: 0 },
    customer: { type: Number, default: 0 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PricingAdjustment", pricingAdjustmentSchema);
