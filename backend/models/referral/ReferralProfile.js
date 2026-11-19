import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  One per member: where they work and whether they are open to giving referrals.
    canRefer   "I can refer people at my company": only these members appear in the directory.
    hideName   the member's name is hidden from everyone else (they appear as "Anonymous"); company, role and experience stay visible.
    status     an admin can hide or block a profile.
*/
const referralProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    displayName: { type: String, default: "", trim: true, maxlength: 80 },
    headline: { type: String, default: "", trim: true, maxlength: 120 },
    company: { type: String, default: "", trim: true, maxlength: 100 },
    companyKey: { type: String, default: "", index: true }, // lower-case company, for searching
    role: { type: String, default: "", trim: true, maxlength: 100 },
    yearsExp: { type: Number, default: 0, min: 0, max: 60 },
    location: { type: String, default: "", trim: true, maxlength: 80 },
    skills: { type: [{ type: String, trim: true, maxlength: 40 }], default: [] },
    bio: { type: String, default: "", trim: true, maxlength: 600 },
    linkedin: { type: String, default: "", trim: true, maxlength: 200 },
    canRefer: { type: Boolean, default: false, index: true },
    hideName: { type: Boolean, default: false },
    resume: { key: { type: String, default: "" }, filename: { type: String, default: "" }, size: { type: Number, default: 0 } }, // the resume used when asking for a referral
    status: { type: String, enum: ["active", "hidden", "blocked"], default: "active", index: true },
    statusReason: { type: String, default: "", maxlength: 300 },
  },
  { timestamps: true }
);

referralProfileSchema.index({ canRefer: 1, status: 1, companyKey: 1, yearsExp: -1 });

export const keyOf = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();

export default mongoose.models.ReferralProfile || mongoose.model("ReferralProfile", referralProfileSchema);
