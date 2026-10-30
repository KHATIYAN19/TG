
import mongoose from "mongoose";

const visitorSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    visitorId: {
      type: String,
      required: true,
      index: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
    },

    endedAt: Date,

    status: {
      type: String,
      enum: ["ACTIVE", "ENDED"],
      default: "ACTIVE",
    },

    landingPage: String,

    referralCode: {
      type: String,
      default: null,
      index: true,
    },

    source: String,

    device: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

visitorSessionSchema.index({
  visitorId: 1,
  startedAt: -1,
});

visitorSessionSchema.index({
  lastSeenAt: -1,
});

export default mongoose.model(
  "VisitorSession",
  visitorSessionSchema
);
