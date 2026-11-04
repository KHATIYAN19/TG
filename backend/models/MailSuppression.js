import mongoose from "mongoose";

const { Schema } = mongoose;

// Addresses that must never receive marketing email.
const mailSuppressionSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    reason: { type: String, enum: ["UNSUBSCRIBED", "ADMIN", "BOUNCE"], default: "UNSUBSCRIBED" },
    campaignId: { type: Schema.Types.ObjectId, ref: "MarketingCampaign", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.MailSuppression ||
  mongoose.model("MailSuppression", mailSuppressionSchema);
