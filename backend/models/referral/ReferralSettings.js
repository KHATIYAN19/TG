import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  Singleton: the admin's switches.
    enabled         the whole referral program (off = hidden, nothing new can be sent)
    paywall         the sender pays to open a chat once the referrer accepts. Off = chats open free, straight away.
    unlockFeePaise  the price of one chat when there is no plan credit to use
    postsEnabled    members can post "we are hiring" / "I can refer" notes
*/
const referralSettingsSchema = new Schema(
  {
    key: { type: String, default: "global", unique: true, immutable: true },
    enabled: { type: Boolean, default: true },
    paywall: { type: Boolean, default: true },
    unlockFeePaise: { type: Number, default: 4900, min: 100, max: 10000000 },
    postsEnabled: { type: Boolean, default: true },
    maxPendingRequests: { type: Number, default: 10, min: 1, max: 100 },
    // Free chat credits every member gets once, the first time they open the referral app. 0 = none.
    signupCredits: { type: Number, default: 0, min: 0, max: 20 },
    // What is on sale. Credit packs, the monthly unlimited subscription and priority can each be switched on or off.
    plansEnabled: { type: Boolean, default: true },
    subscriptionEnabled: { type: Boolean, default: false },
    priorityEnabled: { type: Boolean, default: false },
    seededPlans: { type: Boolean, default: false },
    seededSubPlans: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.ReferralSettings || mongoose.model("ReferralSettings", referralSettingsSchema);
