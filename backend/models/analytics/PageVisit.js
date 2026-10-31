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

    // Route path without query string, e.g. /books/dsa
    page: {
      type: String,
      required: true,
      index: true,
    },

    // Sanitised query params, e.g. { ref: "ASH" }
    query: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    title: String,

    referralCode: String,

    // External referrer on the first page of a session,
    // internal previous route afterwards.
    referrerHost: String,
    previousPage: String,

    isEntry: { type: Boolean, default: false },
    isNewVisitor: { type: Boolean, default: false },

    // Denormalised so page reports need no joins.
    deviceType: String,
    browser: String,
    os: String,
    country: String,

    enteredAt: {
      type: Date,
      default: Date.now,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
    },

    exitedAt: Date,
    durationSeconds: Number,

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

pageVisitSchema.index({ page: 1, enteredAt: -1 });
pageVisitSchema.index({ sessionId: 1, enteredAt: 1 });
pageVisitSchema.index({ enteredAt: -1 });
pageVisitSchema.index({ referralCode: 1, enteredAt: -1 });
pageVisitSchema.index({ exitedAt: 1, lastSeenAt: 1 });

export default mongoose.model(
  "PageVisit",
  pageVisitSchema
);
