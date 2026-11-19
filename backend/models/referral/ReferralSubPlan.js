import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  What the admin sells besides credit packs:
    kind "unlimited"  billing "monthly"  : unlimited chats and requests while the subscription is active (e.g. ₹99 / month)
    kind "priority"   billing "monthly"  : priority every month, renewed automatically
    kind "priority"   billing "once"     : priority for `days` days, paid one time (e.g. 10 days for ₹99)
  Prices are in paise. A subscription copies the price when it starts, so editing a plan never changes what someone already pays.
*/
const referralSubPlanSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9-]{2,40}$/ },
    kind: { type: String, enum: ["unlimited", "priority"], required: true, index: true },
    billing: { type: String, enum: ["monthly", "once"], required: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    tagline: { type: String, default: "", trim: true, maxlength: 160 },
    pricePaise: { type: Number, required: true, min: 100, max: 100000000 },
    days: { type: Number, default: 0, min: 0, max: 3650 }, // billing "once": how long the pass lasts
    badge: { type: String, default: "", trim: true, maxlength: 30 },
    features: { type: [{ type: String, trim: true, maxlength: 120 }], default: [] },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
    // the gateway's own plan id, made the first time someone subscribes at this price (one per gateway, mode and price)
    gatewayPlans: { type: [{ _id: false, gateway: String, mode: String, pricePaise: Number, id: String }], default: [] },
  },
  { timestamps: true }
);

referralSubPlanSchema.pre("validate", function (next) {
  if (this.kind === "unlimited" && this.billing !== "monthly") return next(new Error("The unlimited plan is billed monthly."));
  if (this.billing === "once" && !(this.days > 0)) return next(new Error("A one-time plan needs a number of days."));
  next();
});

export default mongoose.models.ReferralSubPlan || mongoose.model("ReferralSubPlan", referralSubPlanSchema);
