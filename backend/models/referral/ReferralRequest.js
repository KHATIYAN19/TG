import mongoose from "mongoose";

const { Schema } = mongoose;

/*
  "Please refer me": the seeker sends it to a member who works at a company, with their resume and the job.
    pending   waiting for the referrer
    accepted  the referrer said yes. The chat opens once the seeker has unlocked it (a small fee, unless the admin switched it off)
    rejected  the referrer said no
    cancelled the seeker withdrew it before an answer
    ended     either person (or an admin) closed the chat
*/
const referralRequestSchema = new Schema(
  {
    seeker: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    referrer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: "ReferralPost", default: null },
    company: { type: String, default: "", maxlength: 100 },
    referrerRole: { type: String, default: "", maxlength: 100 },
    job: { title: { type: String, default: "", maxlength: 140 }, jobId: { type: String, default: "", maxlength: 80 }, link: { type: String, default: "", maxlength: 500 } },
    message: { type: String, required: true, trim: true, maxlength: 1500 },
    seekerInfo: {
      name: { type: String, default: "", maxlength: 80 },
      currentRole: { type: String, default: "", maxlength: 100 },
      currentCompany: { type: String, default: "", maxlength: 100 },
      yearsExp: { type: Number, default: 0 },
      noticePeriod: { type: String, default: "", maxlength: 40 },
      linkedin: { type: String, default: "", maxlength: 200 },
      portfolio: { type: String, default: "", maxlength: 200 },
    },
    resume: { key: { type: String, default: "" }, filename: { type: String, default: "" }, size: { type: Number, default: 0 } },
    status: { type: String, enum: ["pending", "accepted", "rejected", "cancelled", "ended"], default: "pending", index: true },
    decidedAt: { type: Date, default: null },
    rejectReason: { type: String, default: "", maxlength: 300 },
    chat: {
      unlocked: { type: Boolean, default: false },
      unlockedAt: { type: Date, default: null },
      unlockedVia: { type: String, enum: ["", "payment", "credit", "free", "admin", "subscription"], default: "" },
      endedAt: { type: Date, default: null },
      endedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
      endedByAdmin: { type: Boolean, default: false },
      endReason: { type: String, default: "", maxlength: 300 },
    },
    last: { text: { type: String, default: "" }, at: { type: Date, default: null }, sender: { type: Schema.Types.ObjectId, ref: "User", default: null } },
    unread: { seeker: { type: Number, default: 0 }, referrer: { type: Number, default: 0 } },
    priority: { type: Boolean, default: false }, // the sender had a priority pass when sending: pending requests like this are listed first
    referrerSeen: { type: Boolean, default: false }, // the referrer opened a pending request
  },
  { timestamps: true }
);

referralRequestSchema.index({ seeker: 1, createdAt: -1 });
referralRequestSchema.index({ referrer: 1, status: 1, createdAt: -1 });
referralRequestSchema.index({ status: 1, updatedAt: -1 });

export default mongoose.models.ReferralRequest || mongoose.model("ReferralRequest", referralRequestSchema);
