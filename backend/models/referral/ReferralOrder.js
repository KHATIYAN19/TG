import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  Everything a member paid for (or was given):
    kind "unlock"  one chat opened with one payment (request is set)
    kind "plan"    a bucket of chat unlocks (allowed / used / expiresAt)
    kind "grant"   a bucket an admin gave for free
    kind "priority" a one-time priority pass (validityDays from payment; `plan` is a ReferralSubPlan)
*/
const referralOrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: ["unlock", "plan", "grant", "priority"], required: true },
    request: { type: Schema.Types.ObjectId, ref: "ReferralRequest", default: null, index: true },
    plan: { type: Schema.Types.ObjectId, ref: "ReferralPlan", default: null },
    subPlan: { type: Schema.Types.ObjectId, ref: "ReferralSubPlan", default: null },
    title: { type: String, default: "", maxlength: 120 },
    allowed: { type: Number, default: 0, min: 0 },
    used: { type: Number, default: 0, min: 0 },
    validityDays: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    grantedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    note: { type: String, default: "", maxlength: 300 },
    // Why a free bucket exists ("signup" = the admin's free credits on first login). One per member per source.
    source: { type: String, default: "", maxlength: 20 },
    // the member closed the "you got free credits" message (signup grants); until then the app keeps showing it
    noticeClosedAt: { type: Date, default: null },
    payment: {
      amount: { type: Number, default: 0 }, // paise
      currency: { type: String, default: "INR" },
      gateway: { type: String, default: "" },
      gatewayOrderId: { type: String, default: "" },
      gatewayPaymentId: { type: String, default: null },
      attempts: { type: [{ _id: false, gateway: String, gatewayOrderId: String }], default: [] },
      status: { type: String, enum: ["none", "created", "paid", "failed"], default: "none" },
      failureReason: { type: String, default: null },
      paidAt: { type: Date, default: null },
      returnOrigin: { type: String, default: "", maxlength: 120 },
    },
  },
  { timestamps: true }
);

referralOrderSchema.index({ "payment.gateway": 1, "payment.gatewayOrderId": 1 });
referralOrderSchema.index({ "payment.status": 1, createdAt: -1 });

referralOrderSchema.index({ user: 1, source: 1 }, { name: "one_signup_grant", unique: true, partialFilterExpression: { source: "signup" } });

export default mongoose.models.ReferralOrder || mongoose.model("ReferralOrder", referralOrderSchema);
