
import mongoose from "mongoose";

const { Schema } = mongoose;

const userSessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      unique: true,
    },

    state: {
      type: String,
      enum: [
        "pending_otp",
        "pending_setup",
        "active",
        "revoked",
      ],
      required: true,
    },

    // Store hashes, never raw tokens.
    refreshTokenHash: {
      type: String,
      select: false,
      default: null,
    },

    deviceTokenHash: {
      type: String,
      select: false,
      default: null,
    },

    isTrusted: {
      type: Boolean,
      default: false,
    },

    trustedUntil: {
      type: Date,
      default: null,
    },

    // Pending OTP and setup/reset challenges.
    challengeHash: {
      type: String,
      select: false,
      default: null,
    },

    challengeExpiresAt: {
      type: Date,
      default: null,
    },

    challengeAttempts: {
      type: Number,
      default: 0,
    },

    challengeLastSentAt: {
      type: Date,
      default: null,
    },

    purpose: {
      type: String,
      enum: ["login", "setup", "reset"],
      default: "login",
    },

    device: {
      browser: String,
      os: String,
      type: {
        type: String,
        enum: [
          "desktop",
          "mobile",
          "tablet",
          "unknown",
        ],
        default: "unknown",
      },
      userAgent: String,
    },

    ipAddress: String,

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    refreshExpiresAt: {
      type: Date,
      default: null,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    revokeReason: {
      type: String,
      default: null,
    },

    // MongoDB TTL cleanup.
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

userSessionSchema.index({
  user: 1,
  state: 1,
  createdAt: -1,
});

userSessionSchema.index({
  user: 1,
  deviceTokenHash: 1,
});

userSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.models.UserSession ||
  mongoose.model("UserSession", userSessionSchema);
