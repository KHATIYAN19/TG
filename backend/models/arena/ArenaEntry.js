import mongoose from "mongoose";
import { GATEWAY_IDS } from "../../services/payments/config.js";

const { Schema } = mongoose;

/*
  One ticket = one match. A member who wants to connect again
  after a partnership ends must buy a new entry.

  pending_payment → paid ⇄ in_match → consumed   (all included matches used)
                       ↘ cancelling → cancelled  (refund minus fee; only if no match was used)
  pending_payment → expired                  (abandoned checkout)
*/
export const ENTRY_STATUSES = [
  "pending_payment",
  "paid",
  "in_match",
  "consumed",
  "cancelling",
  "cancelled",
  "expired",
];

const entrySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Pay-first flow: a member pays BEFORE filling in their details, so a paid entry can
    // exist without a profile. It is linked (and the profile activated) when they save
    // their details. See attachPaidEntry() in services/arena/activation.js.
    profile: { type: Schema.Types.ObjectId, ref: "ArenaProfile", default: null },

    status: { type: String, enum: ENTRY_STATUSES, default: "pending_payment", index: true },

    // Immutable pricing snapshot taken at checkout.
    listPricePaise: { type: Number, required: true, min: 0 },
    discountPaise: { type: Number, default: 0, min: 0 },
    paidPaise: { type: Number, required: true, min: 0 },
    cancellationFeePercent: { type: Number, required: true, min: 0, max: 100 },

    // Snapshot taken at checkout, so later admin changes never alter a paid entry.
    matchesAllowed: { type: Number, default: 1, min: 0, max: 100 },
    matchesUsed: { type: Number, default: 0, min: 0 },

    // Given by an admin, not bought. Nothing was paid, so there is nothing to refund.
    complimentary: { type: Boolean, default: false },
    grantedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    // Every admin change to matchesAllowed (newest last, bounded).
    adjustments: [
      {
        _id: false,
        at: { type: Date, default: Date.now },
        by: { type: Schema.Types.ObjectId, ref: "User" },
        action: { type: String, enum: ["grant", "add", "remove", "set", "reopen"] },
        from: { type: Number },
        to: { type: Number },
        reason: { type: String, maxlength: 300, default: "" },
      },
    ],

    coupon: {
      _id: false,
      id: { type: Schema.Types.ObjectId, ref: "ArenaCoupon", default: null },
      code: { type: String, default: null },
    },

    payment: {
      _id: false,
      // "admin" = a complimentary entry granted by the team; "pass" = matches that came with a purchased book/pack (nothing paid in the arena)
      // every gateway the payment processor knows (so a new gateway needs no change here), plus the two non-gateway sources
      gateway: { type: String, enum: [...GATEWAY_IDS, "admin", "pass"] },
      orderId: { type: String },
      paymentId: { type: String, default: null },
    },

    // Affiliate attribution, snapshotted at checkout so later rate changes never
    // alter it. The commission is derived from paidPaise (see services/arena/affiliate.js);
    // refunds reduce it proportionally at read time, so nothing here needs syncing.
    affiliate: {
      _id: false,
      user: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
      code: { type: String, default: undefined },
      type: { type: String, enum: ["percentage", "fixed"], default: undefined },
      value: { type: Number, default: undefined },
      commissionPaise: { type: Number, min: 0, default: undefined },
    },

    paidAt: { type: Date, default: null },
    match: { type: Schema.Types.ObjectId, ref: "ArenaMatch", default: null },

    cancel: {
      _id: false,
      at: { type: Date, default: null },
      feePaise: { type: Number, default: 0 },
      refundPaise: { type: Number, default: 0 },
      refundId: { type: String, default: null },
    },

    // Partial/full refunds started by an admin against the SAME gateway payment
    // (money goes back to the original payer). Separate from the cancellation
    // refund above; both together can never exceed paidPaise.
    refundedPaise: { type: Number, default: 0, min: 0 },
    refunds: [
      {
        _id: false,
        at: { type: Date, default: Date.now },
        by: { type: String },
        amountPaise: { type: Number, required: true },
        refundId: { type: String, default: null },
        gateway: { type: String },
        paymentId: { type: String },
        note: { type: String, maxlength: 200, default: "" },
      },
    ],
  },
  { timestamps: true }
);

// Partial (not sparse): sparse indexes still index explicit nulls.
entrySchema.index(
  { "payment.orderId": 1 },
  { unique: true, partialFilterExpression: { "payment.orderId": { $type: "string" } } }
);
// A user can only ever have one open (unmatched, un-cancelled) entry.
entrySchema.index({ user: 1, createdAt: -1 });
entrySchema.index({ "affiliate.user": 1, createdAt: -1 }, { partialFilterExpression: { "affiliate.user": { $exists: true } } });
entrySchema.index(
  { user: 1 },
  {
    name: "one_open_entry_per_user",
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending_payment", "paid", "in_match", "cancelling"] },
    },
  }
);

export default mongoose.models.ArenaEntry ||
  mongoose.model("ArenaEntry", entrySchema);
