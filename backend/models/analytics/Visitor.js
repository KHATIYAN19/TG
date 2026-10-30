
import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    type: { type: String, default: "desktop" },
    vendor: String,
    model: String,
    browser: String,
    browserVersion: String,
    os: String,
    osVersion: String,
    screenWidth: Number,
    screenHeight: Number,
    language: String,
    timezone: String,
  },
  { _id: false }
);

const visitorSchema = new mongoose.Schema(
  {
    visitorId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    firstSeenAt: {
      type: Date,
      default: Date.now,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now,
    },

    firstReferralCode: {
      type: String,
      default: null,
    },

    firstLandingPage: String,

    device: deviceSchema,
  },
  { timestamps: true }
);

export default mongoose.model("Visitor", visitorSchema);
