
import User from "../models/User.js";
import UserSession from "../models/UserSession.js";

import {
  hashToken,
  hashPassword,
  revokeUserSessions,
  logActivity,
} from "../utils/authUtils.js";

import {
  changeAccountSecurityState,
} from "../services/authStateService.js";

const validPassword = password =>
  typeof password === "string" &&
  password.length >= 8 &&
  password.length <= 128 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

export const completePasswordSetup = async (
  req, res
) => {
  try {
    const {
      token,
      password,
      confirmPassword,
    } = req.body;

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/.test(token) ||
      !validPassword(password) ||
      password !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid setup token, password, or confirmation",
      });
    }

    const tokenHash = hashToken(token);

    const challenge = await UserSession.findOne({
      challengeHash: tokenHash,
      state: "pending_setup",
      purpose: { $in: ["setup", "reset"] },
      challengeExpiresAt: { $gt: new Date() },
    }).select("+challengeHash");

    if (!challenge) {
      return res.status(401).json({
        success: false,
        message: "Link invalid, expired, or already used",
      });
    }

    const user = await User.findById(
      challenge.user
    );

    if (!user || user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "Account unavailable",
      });
    }

    // Claim the link once, atomically.
    const consumed = await UserSession.findOneAndUpdate(
      {
        _id: challenge._id,
        state: "pending_setup",
        challengeHash: tokenHash,
        challengeExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          state: "revoked",
          revokedAt: new Date(),
          challengeHash: null,
          challengeExpiresAt: null,
        },
      },
      { new: true }
    );

    if (!consumed) {
      return res.status(401).json({
        success: false,
        message: "Link already used",
      });
    }

    const hashedPassword =
      await hashPassword(password);

    await changeAccountSecurityState({
      userId: user._id,
      actorId: user._id,
      update: {
        password: hashedPassword,
        mustChangePassword: false,
        passwordChangedAt: new Date(),
      },
      reason: "Password setup/reset completed",
    });

    await logActivity({
      req,
      user: user._id,
      actor: user._id,
      action: "PASSWORD_SETUP_COMPLETED",
      metadata: { purpose: challenge.purpose },
    });

    return res.json({
      success: true,
      message:
        "Password saved successfully. Please log in.",
    });
  } catch (error) {
    console.error("Password setup error:", error);

    return res.status(503).json({
      success: false,
      message: "Unable to complete password setup",
    });
  }
};
