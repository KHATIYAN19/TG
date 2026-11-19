import mongoose from "mongoose";

const { Schema } = mongoose;

/* Every money movement of a subscription: the first charge, each renewal, each failed attempt, each refund. One row per attempt. */
const referralSubChargeSchema = new Schema(
  {
    subscription: { type: Schema.Types.ObjectId, ref: "ReferralSubscription", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: ["initial", "renewal"], default: "renewal" },
    status: { type: String, enum: ["paid", "failed", "refunded"], required: true },
    amountPaise: { type: Number, default: 0 },
    attempt: { type: Number, default: 1 }, // 1 = first try of this cycle, 2+ = a retry
    gatewayPaymentId: { type: String, default: "" },
    gatewayInvoiceId: { type: String, default: "" },
    method: { type: String, default: "" },
    reason: { type: String, default: "", maxlength: 300 },
    periodStart: { type: Date, default: null },
    periodEnd: { type: Date, default: null },
    at: { type: Date, default: Date.now },
    eventId: { type: String, default: "" },
  },
  { timestamps: true }
);

// a payment is recorded once per outcome, however many times the gateway repeats the news
referralSubChargeSchema.index({ subscription: 1, gatewayPaymentId: 1, status: 1 }, { unique: true, partialFilterExpression: { gatewayPaymentId: { $gt: "" } } });
referralSubChargeSchema.index({ eventId: 1 }, { sparse: true });

export default mongoose.models.ReferralSubCharge || mongoose.model("ReferralSubCharge", referralSubChargeSchema);
