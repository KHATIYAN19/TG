import mongoose from "mongoose";

const { Schema } = mongoose;

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      match: /^[A-Z0-9_-]{3,30}$/,
    },
    description: { type: String, trim: true, maxlength: 200, default: "" },

    discountType: { type: String, enum: ["PERCENTAGE", "FIXED"], required: true },
    // PERCENTAGE: 1–100.  FIXED: paise.
    discountValue: { type: Number, required: true, min: 1 },
    maxDiscountPaise: { type: Number, default: null, min: 0 },

    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },

    usageLimit: { type: Number, default: null, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 1 },

    active: { type: Boolean, default: true, index: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ArenaCoupon ||
  mongoose.model("ArenaCoupon", couponSchema);
