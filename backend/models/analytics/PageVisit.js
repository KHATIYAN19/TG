
import mongoose from "mongoose";

const pageVisitSchema = new mongoose.Schema(
  {
    pageVisitId: {
      type: String,
      required: true,
      unique: true,
    },

    visitorId: {
      type: String,
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      index: true,
    },

    page: {
      type: String,
      required: true,
      index: true,
    },

    referralCode: String,

    enteredAt: {
      type: Date,
      default: Date.now,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
    },

    exitedAt: Date,

    maxScrollPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    maxScrollPixels: {
      type: Number,
      default: 0,
    },

    activeTimeSeconds: {
      type: Number,
      default: 0,
    },

    exitReason: String,

    clickCounts: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  { timestamps: true }
);

pageVisitSchema.index({
  page: 1,
  enteredAt: -1,
});

pageVisitSchema.index({
  sessionId: 1,
  enteredAt: 1,
});

pageVisitSchema.index({
  enteredAt: -1,
});

export default mongoose.model(
  "PageVisit",
  pageVisitSchema
);
