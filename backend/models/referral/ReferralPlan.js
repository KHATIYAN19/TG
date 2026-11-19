import mongoose from "mongoose";

const { Schema } = mongoose;

/* A plan the admin sells: "5 chat unlocks for ₹100". Prices are in paise and copied onto every order. */
const referralPlanSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9-]{2,40}$/ },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    tagline: { type: String, default: "", trim: true, maxlength: 160 },
    pricePaise: { type: Number, required: true, min: 100, max: 100000000 },
    compareAtPaise: { type: Number, default: 0, min: 0 },
    unlocks: { type: Number, required: true, min: 1, max: 100000 }, // chats this plan can open
    validityDays: { type: Number, default: 0, min: 0, max: 3650 }, // 0 = never expires
    badge: { type: String, default: "", trim: true, maxlength: 30 },
    features: { type: [{ type: String, trim: true, maxlength: 120 }], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.ReferralPlan || mongoose.model("ReferralPlan", referralPlanSchema);
