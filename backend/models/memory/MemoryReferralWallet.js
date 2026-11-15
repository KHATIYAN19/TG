import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One row per user: their referral code and the referral credits they have earned.
    available = earned - usedAsPage - cashedOut
  Every credit is spent exactly once: as a page, or as a cash request. Both counters are only ever moved with an atomic
  conditional update, so a credit can never be used as a page AND cashed.
*/
const memoryReferralWalletSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    code: { type: String, required: true, unique: true },
    earned: { type: Number, default: 0, min: 0 },
    usedAsPage: { type: Number, default: 0, min: 0 },
    cashedOut: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.MemoryReferralWallet || mongoose.model("MemoryReferralWallet", memoryReferralWalletSchema);
