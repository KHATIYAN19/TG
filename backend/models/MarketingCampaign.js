import mongoose from "mongoose";

const { Schema } = mongoose;

export const CAMPAIGN_STATUSES = [
  "DRAFT",
  "SCHEDULED",
  "QUEUEING",
  "SENDING",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
];

/*
  An admin-built marketing campaign. The audience is described by `audience`
  (filters) and frozen into MarketingRecipient rows when the campaign is sent;
  each recipient is then one message on the SQS email queue.
*/
const marketingCampaignSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    subject: { type: String, required: true, trim: true, maxlength: 300 },
    preheader: { type: String, default: "", trim: true, maxlength: 200 },

    // Final HTML with {{placeholders}}; rendered per recipient by the worker.
    html: { type: String, required: true },
    templateKey: { type: String, default: "" },

    // Values for the {{placeholders}} (coupon, button, featured books ...).
    content: {
      headline: { type: String, default: "" },
      body: { type: String, default: "" },
      couponCode: { type: String, default: "", uppercase: true, trim: true },
      ctaText: { type: String, default: "" },
      ctaUrl: { type: String, default: "" },
      featuredBookIds: { type: [Schema.Types.ObjectId], default: [] },
    },

    // Audience filters (see services/campaign/audience.js).
    audience: { type: Schema.Types.Mixed, default: {} },

    replyTo: { type: String, default: "", trim: true },

    status: { type: String, enum: CAMPAIGN_STATUSES, default: "DRAFT", index: true },
    scheduledAt: { type: Date, default: null, index: true },

    counts: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 }, // permanent failures
      dead: { type: Number, default: 0 }, // gave up -> dead-letter queue
      skipped: { type: Number, default: 0 },
    },

    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    createdByName: { type: String, default: "" },
    lastError: { type: String, default: "" },
  },
  { timestamps: true }
);

marketingCampaignSchema.index({ createdAt: -1 });

export default mongoose.models.MarketingCampaign ||
  mongoose.model("MarketingCampaign", marketingCampaignSchema);
