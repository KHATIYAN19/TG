import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  A member's post on the board.
    kind "hiring"    "our company is hiring SDE-1, apply here"
    kind "referral"  "I can refer for these roles"
*/
const referralPostSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    kind: { type: String, enum: ["hiring", "referral"], required: true, index: true },
    company: { type: String, required: true, trim: true, maxlength: 100 },
    companyKey: { type: String, default: "", index: true },
    title: { type: String, required: true, trim: true, maxlength: 140 },
    roles: { type: [{ type: String, trim: true, maxlength: 80 }], default: [] },
    location: { type: String, default: "", trim: true, maxlength: 80 },
    experience: { type: String, default: "", trim: true, maxlength: 60 }, // e.g. "0-2 years"
    description: { type: String, default: "", trim: true, maxlength: 3000 },
    applyLink: { type: String, default: "", trim: true, maxlength: 500 },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    hidden: { type: Boolean, default: false, index: true }, // an admin took it down
    hiddenReason: { type: String, default: "", maxlength: 300 },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 60 * 86400000), index: true },
  },
  { timestamps: true }
);

referralPostSchema.index({ status: 1, hidden: 1, createdAt: -1 });

export default mongoose.models.ReferralPost || mongoose.model("ReferralPost", referralPostSchema);
