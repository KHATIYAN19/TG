import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One recurring subscription (monthly unlimited, or monthly priority).
    created    checkout started, nothing charged yet
    active     paid, renewing every period
    past_due   a renewal failed. The gateway retries; access continues until the period already paid for ends
    cancelled  no more charges. `currentPeriodEnd` is when access stops (the member keeps what they paid for until then)
    expired    the paid period ended and nothing renewed it (cancelled, or retries ran out)
    failed     the first payment never went through
  Access is: status in (active, past_due, cancelled) AND currentPeriodEnd is in the future. See services/referral/subscriptions.js.
*/
const referralSubscriptionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: Schema.Types.ObjectId, ref: "ReferralSubPlan", required: true },
    kind: { type: String, enum: ["unlimited", "priority"], required: true },
    planName: { type: String, default: "", maxlength: 80 },
    pricePaise: { type: Number, required: true },
    status: { type: String, enum: ["created", "active", "past_due", "cancelled", "expired", "failed"], default: "created", index: true },
    gateway: { type: String, default: "" },
    mode: { type: String, default: "" },
    gatewaySubscriptionId: { type: String, default: "", index: true },
    gatewayPlanId: { type: String, default: "" },
    gatewayStatus: { type: String, default: "" }, // the gateway's own word, for support
    returnOrigin: { type: String, default: "", maxlength: 120 },
    startedAt: { type: Date, default: null }, // first successful charge
    currentPeriodStart: { type: Date, default: null },
    currentPeriodEnd: { type: Date, default: null },
    nextChargeAt: { type: Date, default: null },
    paidCount: { type: Number, default: 0 },
    paidTotalPaise: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 }, // failed renewal attempts since the last successful charge
    lastFailureReason: { type: String, default: "" },
    cancelledAt: { type: Date, default: null },
    cancelledBy: { type: String, enum: ["", "member", "admin", "gateway"], default: "" },
    cancelReason: { type: String, default: "", maxlength: 300 },
    // lifecycle log (newest last, capped) + ids of gateway events already applied, so a repeated webhook changes nothing
    // a field literally called "type" must be declared as { type: String }, or Mongoose reads it as the schema type of the whole sub-document
    // a renewal failed and the member started a fresh payment: this new subscription replaces the failing one once it's paid
    replaces: { type: Schema.Types.ObjectId, ref: "ReferralSubscription", default: null },
    // the member closed the "payment failed" message; cleared again on the next failure
    failNoticeClosedAt: { type: Date, default: null },
    events: { type: [new Schema({ at: Date, type: { type: String }, note: String }, { _id: false })], default: [] },
    seenEvents: { type: [String], default: [] },
  },
  { timestamps: true }
);

referralSubscriptionSchema.index({ user: 1, kind: 1, status: 1 });
referralSubscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

export default mongoose.models.ReferralSubscription || mongoose.model("ReferralSubscription", referralSubscriptionSchema);
