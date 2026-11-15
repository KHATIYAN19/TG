import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One row per referred friend. `referee` is unique: a person can only ever be referred once.
    pending   = signed up with the link, has not paid yet
    qualified = paid for a page (this is what counts towards a referral credit)
*/
const memoryReferralSchema = new Schema(
  {
    referrer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    referee: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    code: { type: String, required: true },
    status: { type: String, enum: ["pending", "qualified", "rejected"], default: "pending", index: true },
    qualifiedAt: { type: Date, default: null },
    qualifyingOrder: { type: Schema.Types.ObjectId, ref: "MemoryOrder", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.MemoryReferral || mongoose.model("MemoryReferral", memoryReferralSchema);
