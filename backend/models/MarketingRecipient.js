import mongoose from "mongoose";

const { Schema } = mongoose;

export const RECIPIENT_STATUSES = [
  "PENDING", // created, not on the queue yet (or paused)
  "QUEUED", // on the SQS queue
  "SENDING", // claimed by a worker
  "SENT",
  "FAILED", // permanent failure (bad address ...)
  "DEAD", // retries exhausted -> AWS moves it to the dead-letter queue
  "SKIPPED", // unsubscribed / cancelled
];

const marketingRecipientSchema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "MarketingCampaign", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, default: "", trim: true },

    // Small facts used for personalisation / the audit trail.
    books: { type: [String], default: [] },
    orders: { type: Number, default: 0 },

    status: { type: String, enum: RECIPIENT_STATUSES, default: "PENDING" },
    attempts: { type: Number, default: 0 },
    error: { type: String, default: "" },
    messageId: { type: String, default: "" },

    queuedAt: { type: Date, default: null },
    claimedAt: { type: Date, default: null },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

marketingRecipientSchema.index({ campaignId: 1, email: 1 }, { unique: true });
marketingRecipientSchema.index({ campaignId: 1, status: 1 });

export default mongoose.models.MarketingRecipient ||
  mongoose.model("MarketingRecipient", marketingRecipientSchema);
