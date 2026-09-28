import mongoose from "mongoose";

const recipientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
    },

    sentAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    error: {
      type: String,
      default: "",
    },

    messageId: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);

const emailCampaignSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    html: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      default: "",
    },

    recipients: {
      type: [recipientSchema],
      default: [],
    },

    totalEmails: {
      type: Number,
      default: 0,
    },

    successCount: {
      type: Number,
      default: 0,
    },

    failedCount: {
      type: Number,
      default: 0,
    },

    pendingCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "PROCESSING",
        "COMPLETED",
        "PARTIAL_SUCCESS",
        "FAILED",
      ],
      default: "PROCESSING",
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

emailCampaignSchema.index({
  createdAt: -1,
});

emailCampaignSchema.index({
  status: 1,
});

const EmailCampaign = mongoose.model(
  "EmailCampaign",
  emailCampaignSchema
);

export default EmailCampaign;