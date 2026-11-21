
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

    // When the current refresh token was issued. A token younger than REFRESH_ROTATE_MIN_SECONDS
    // is not rotated again, so rapid reloads reuse it instead of replacing it.
    refreshRotatedAt: {
      type: Date,
      default: null,
    },

    // Refresh tokens replaced in the last REFRESH_REUSE_GRACE_SECONDS. Each keeps working until its
    // validUntil, so refreshes whose responses never reached the browser (reload mid-request, several
    // in a row, two tabs at once) do not sign the user out. Capped at the 50 most recent.
    recentRefreshHashes: {
      type: [
        {
          _id: false,
          hash: String,
          validUntil: Date,
        },
      ],
      select: false,
      default: [],
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
      // Human-readable label, e.g. "Chrome on Windows PC".
      name: String,
      model: String,
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

    // Approximate sign-in location (from the IP), e.g. Agra, Uttar Pradesh, India.
    location: {
      city: String,
      region: String,
      country: String,
      text: String,
    },

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

// Refresh looks sessions up by token hash on every page load.
userSessionSchema.index({ refreshTokenHash: 1 }, { sparse: true });
userSessionSchema.index({ "recentRefreshHashes.hash": 1 }, { sparse: true });

userSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

export default mongoose.models.UserSession ||
  mongoose.model("UserSession", userSessionSchema);
