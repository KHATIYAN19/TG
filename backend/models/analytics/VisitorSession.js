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
    endReason: String,

    status: {
      type: String,
      enum: ["ACTIVE", "ENDED"],
      default: "ACTIVE",
    },

    isNewVisitor: { type: Boolean, default: false },

    landingPage: String,
    exitPage: String,

    referralCode: {
      type: String,
      default: null,
      index: true,
    },

    source: String,

    // External referrer (google.com, instagram.com ...)
    referrer: String,
    referrerHost: String,

    utm: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Query params of the landing URL
    query: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    country: String,
    ipHash: String,

    pageCount: { type: Number, default: 0 },
    eventCount: { type: Number, default: 0 },
    activeSeconds: { type: Number, default: 0 },
    durationSeconds: Number,
    isBounce: Boolean,

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

visitorSessionSchema.index({ startedAt: -1 });
visitorSessionSchema.index({ lastSeenAt: -1 });
visitorSessionSchema.index({
  status: 1,
  lastSeenAt: 1,
});

export default mongoose.model(
  "VisitorSession",
  visitorSessionSchema
);
