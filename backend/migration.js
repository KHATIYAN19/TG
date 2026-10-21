
import "dotenv/config";
import mongoose from "mongoose";

import User from "./models/User.js";
import UserSession from "./models/UserSession.js";
import redis from "./utils/redis.js";
import connectDB from "./utils/dbConnection.js";
/* =====================================================
   CONFIGURATION — CHANGE ONLY THIS EMAIL
===================================================== */

const USER_EMAIL = "lavikhatiyan43177@gmail.com";

/* =====================================================
   MIGRATE SINGLE USER
===================================================== */

const migrateSingleUser = async () => {
  try {
   await connectDB();

    console.log("MongoDB connected");

    const email = USER_EMAIL.trim().toLowerCase();

    /* ===== FIND EXISTING USER ===== */

    const user = await User.findOne({
      email,
    }).select("+password +tokenVersion");

    if (!user) {
      throw new Error(`User not found: ${email}`);
    }

    if (user.role !== "admin") {
      throw new Error(
        "Selected user is not an admin. Migration cancelled."
      );
    }

    if (
      typeof user.password !== "string" ||
      !/^\$2[aby]\$\d{2}\$/.test(user.password)
    ) {
      throw new Error(
        "User does not have a valid-looking bcrypt password hash."
      );
    }

    console.log("User found:", user.email);

    /* ===== PREVENT OLD TOKEN ACCESS ===== */

    const userId = String(user._id);

    await redis.del(`auth:user:${userId}`);

    /* ===== UPDATE USER ===== */

    user.status = "active";
    user.isDeleted = false;

    user.mustChangePassword = false;

    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    user.statusReason = null;
    user.statusChangedAt = new Date();

    user.tokenVersion =
      (user.tokenVersion ?? 0) + 1;

    // Password is intentionally not changed.
    await user.save();

    /* ===== REVOKE EXISTING SESSIONS ===== */

    const sessions = await UserSession.find({
      user: user._id,
    }).select("sessionId");

    // Invalidate Redis session authorization.
    for (const session of sessions) {
      await redis.del(
        `auth:session:${session.sessionId}`
      );
    }

    await UserSession.updateMany(
      { user: user._id },
      {
        $set: {
          state: "revoked",
          revokedAt: new Date(),
          revokeReason: "Authentication migration",
          refreshTokenHash: null,
          deviceTokenHash: null,
          isTrusted: false,
          trustedUntil: null,
          challengeHash: null,
        },
      }
    );

    /* ===== SYNC UPSTASH REDIS ===== */

    await redis.set(
      `auth:user:${userId}`,
      {
        role: user.role,
        status: user.status,
        tokenVersion: user.tokenVersion,
        isDeleted: user.isDeleted,
        mustChangePassword: user.mustChangePassword,
        lockedUntil: null,
      }
    );

    console.log("--------------------------------");
    console.log("User migrated successfully");
    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Status:", user.status);
    console.log("Token version:", user.tokenVersion);
    console.log("Existing password: Preserved");
    console.log("Previous sessions: Revoked");
    console.log("Redis authorization: Updated");
    console.log("--------------------------------");

  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

migrateSingleUser();
