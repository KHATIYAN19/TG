import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  What one partner may see, inside the PartnerSettings ceiling. One per user with role "partner".
  Missing document = DEFAULT_ACCESS (no products), so a fresh partner sees nothing until an admin opens it.
*/
const partnerAccessSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    enabled: { type: Boolean, default: true },
    products: { type: Schema.Types.Mixed, default: {} },
    sections: { type: Schema.Types.Mixed, default: {} },
    fields: { type: Schema.Types.Mixed, default: {} },
    statuses: { type: Schema.Types.Mixed, default: {} },
    gateways: { type: [String], default: [] },
    window: { type: Schema.Types.Mixed, default: {} }, // { from, to } IST days, inclusive
    delayDays: { type: Number, default: 0, min: 0 },
    historyDays: { type: Number, default: 0, min: 0 },
    minAmount: { type: Number, default: null, min: 0 }, // paise
    maxAmount: { type: Number, default: null, min: 0 }, // paise
    codes: { type: [String], default: [] },
    books: { type: [Schema.Types.ObjectId], ref: "Book", default: [] },
    hiddenTxns: { type: [String], default: [] }, // transaction / order IDs never shown to this partner
    hiddenDays: { type: [Schema.Types.Mixed], default: [] }, // [{ from, to }] IST days whose payments are never shown to this partner
    refShow: { type: [String], default: [] }, // only payments through these referral codes (empty = no limit)
    refHide: { type: [String], default: [] }, // payments through these referral codes are never shown
    expiresAt: { type: String, default: "" }, // "YYYY-MM-DD": access ends after this IST day
    maskTransactionIds: { type: Boolean, default: false },
    includeUnpaid: { type: Boolean, default: undefined }, // legacy: replaced by statuses
    note: { type: String, default: "", maxlength: 300 },
    lastSeenAt: { type: Date, default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.models.PartnerAccess || mongoose.model("PartnerAccess", partnerAccessSchema);
