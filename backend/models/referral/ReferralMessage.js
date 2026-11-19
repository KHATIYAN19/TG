import mongoose from "mongoose";

const { Schema } = mongoose;

const referralMessageSchema = new Schema(
  {
    request: { type: Schema.Types.ObjectId, ref: "ReferralRequest", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", default: null }, // null = a system line ("Chat opened", "Chat ended")
    text: { type: String, default: "", maxlength: 2000 },
    system: { type: Boolean, default: false },
    replyTo: { type: Schema.Types.ObjectId, ref: "ReferralMessage", default: null },
    replyText: { type: String, default: "", maxlength: 160 }, // a short copy, so the quote still shows after the original is deleted
    replySender: { type: Schema.Types.ObjectId, ref: "User", default: null },
    reactions: { type: [{ _id: false, user: { type: Schema.Types.ObjectId, ref: "User" }, emoji: { type: String, maxlength: 8 } }], default: [] },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

referralMessageSchema.index({ request: 1, createdAt: 1 });

export default mongoose.models.ReferralMessage || mongoose.model("ReferralMessage", referralMessageSchema);
