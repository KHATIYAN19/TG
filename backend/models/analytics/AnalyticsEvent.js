
import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    eventId: {
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

    pageVisitId: String,

    page: String,

    eventType: {
      type: String,
      required: true,
      index: true,
    },

    referralCode: String,

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

analyticsEventSchema.index({
  eventType: 1,
  createdAt: -1,
});

analyticsEventSchema.index({
  createdAt: 1,
}, {
  expireAfterSeconds: 90 * 24 * 60 * 60,
});

export default mongoose.model(
  "AnalyticsEvent",
  analyticsEventSchema
);
