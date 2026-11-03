import mongoose from "mongoose";

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
    profile: { type: Schema.Types.ObjectId, ref: "ArenaProfile", required: true },

    status: { type: String, enum: ENTRY_STATUSES, default: "pending_payment", index: true },

    // Immutable pricing snapshot taken at checkout.
    listPricePaise: { type: Number, required: true, min: 0 },
    discountPaise: { type: Number, default: 0, min: 0 },
    paidPaise: { type: Number, required: true, min: 0 },
    cancellationFeePercent: { type: Number, required: true, min: 0, max: 100 },

    // Snapshot taken at checkout, so later admin changes never alter a paid entry.
    matchesAllowed: { type: Number, default: 1, min: 0, max: 20 },
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
      // "admin" = a complimentary entry granted by the team (nothing was paid)
      gateway: { type: String, enum: ["cashfree", "razorpay", "admin"] },
      orderId: { type: String },
      paymentId: { type: String, default: null },
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
