import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One document (key "global"): the ceiling for every partner. See services/partner/permissions.js.
  Flags are stored as plain objects so adding a product / field later needs no migration.
*/
const partnerSettingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true },
    enabled: { type: Boolean, default: true },
    products: { type: Schema.Types.Mixed, default: {} },
    sections: { type: Schema.Types.Mixed, default: {} },
    fields: { type: Schema.Types.Mixed, default: {} },
    statuses: { type: Schema.Types.Mixed, default: {} },
    gateways: { type: [String], default: [] },
    window: { type: Schema.Types.Mixed, default: {} }, // { from: "YYYY-MM-DD", to: "YYYY-MM-DD" } IST, inclusive
    delayDays: { type: Number, default: 0, min: 0 },
    maxHistoryDays: { type: Number, default: 0, min: 0 },
    maskTransactionIds: { type: Boolean, default: false },
    hiddenTxns: { type: [String], default: [] }, // never shown to any partner
    includeUnpaid: { type: Boolean, default: undefined }, // legacy: replaced by statuses
    notice: { type: String, default: "", maxlength: 500 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, minimize: false }
);

export default mongoose.models.PartnerSettings || mongoose.model("PartnerSettings", partnerSettingsSchema);
