
import mongoose from "mongoose";

import User from "../models/User.js";
import UserSession from "../models/UserSession.js";

import {
  revokeSessionAuth,
} from "../services/authStateService.js";

import {
  logActivity,
  cookieNames,
} from "../utils/authUtils.js";

import { authConfig } from "../config/auth.js";

const fail = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const safeSession = session => ({
  sessionId: session.sessionId,
  state: session.state,
  device: session.device,
  ipAddress: session.ipAddress,
  isTrusted: session.isTrusted,
  trustedUntil: session.trustedUntil,
  lastActiveAt: session.lastActiveAt,
  refreshExpiresAt: session.refreshExpiresAt,
  createdAt: session.createdAt,
  revokedAt: session.revokedAt,
  revokeReason: session.revokeReason,
});

const listSessions = async (
  req, res, userId
) => {
  const page = Math.max(
    1,
    parseInt(req.query.page, 10) || 1
  );

  const limit = Math.min(
    100,
    Math.max(
      1,
      parseInt(req.query.limit, 10) || 20
    )
  );

  const query = {
    user: userId,
    purpose: "login",
  };

  const [sessions, total] = await Promise.all([
    UserSession.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    UserSession.countDocuments(query),
  ]);

  return res.json({
    success: true,
    sessions: sessions.map(session => ({
      ...safeSession(session),
      isCurrent:
        session.sessionId === req.sessionId,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

/* ==========================================
   CURRENT USER'S SESSIONS
========================================== */

export const getMySessions = async (
  req, res
) => {
  try {
    return await listSessions(
      req,
      res,
      req.user.userId
    );
  } catch (error) {
    console.error("Get sessions:", error);
    return fail(res, 500, "Unable to fetch sessions");
  }
};

/* ==========================================
   ADMIN: SPECIFIC USER'S SESSIONS
========================================== */

export const getUserSessions = async (
  req, res
) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return fail(res, 400, "Invalid user ID");
    }

    const exists = await User.exists({
      _id: userId,
    });

    if (!exists) {
      return fail(res, 404, "User not found");
    }

    return await listSessions(req, res, userId);
  } catch (error) {
    console.error("Get user sessions:", error);
    return fail(res, 500, "Unable to fetch sessions");
  }
};

/* ==========================================
   SHARED REVOKE FUNCTION
========================================== */

const revokeDevice = async ({
  req,
  res,
  userId,
  sessionId,
}) => {
  const session = await UserSession.findOne({
    user: userId,
    sessionId,
    purpose: "login",
    state: "active",
  });

  if (!session) {
    return fail(res, 404, "Active session not found");
  }

  // Reject requests immediately.
  await revokeSessionAuth(sessionId);

  await UserSession.updateOne(
    {
      _id: session._id,
      state: "active",
    },
    {
      $set: {
        state: "revoked",
        revokedAt: new Date(),
        revokedBy: req.user.userId,
        revokeReason: "Device session revoked",
        refreshTokenHash: null,
        deviceTokenHash: null,
        isTrusted: false,
        trustedUntil: null,
      },
    }
  );

  if (req.sessionId === sessionId) {
    for (const name of Object.values(cookieNames)) {
      res.clearCookie(name, {
        httpOnly: true,
        secure: authConfig.secureCookies,
        sameSite: "strict",
        path: "/",
      });
    }
  }

  await logActivity({
    req,
    user: userId,
    actor: req.user.userId,
    action: "SESSION_REVOKED",
    sessionId,
  });

  return res.json({
    success: true,
    message: "Session revoked successfully",
  });
};

/* ==========================================
   USER REVOKE OWN SESSION
========================================== */

export const revokeMySession = async (
  req, res
) => {
  try {
    return await revokeDevice({
      req,
      res,
      userId: req.user.userId,
      sessionId: req.params.sessionId,
    });
  } catch (error) {
    console.error("Revoke own session:", error);
    return fail(res, 503, "Unable to revoke session");
  }
};

/* ==========================================
   ADMIN REVOKE SPECIFIC SESSION
========================================== */

export const adminRevokeSession = async (
  req, res
) => {
  try {
    if (!mongoose.isValidObjectId(
      req.params.userId
    )) {
      return fail(res, 400, "Invalid user ID");
    }

    return await revokeDevice({
      req,
      res,
      userId: req.params.userId,
      sessionId: req.params.sessionId,
    });
  } catch (error) {
    console.error("Admin revoke session:", error);
    return fail(res, 503, "Unable to revoke session");
  }
};

/* ==========================================
   FORGET REMEMBERED DEVICE
========================================== */

export const forgetMyDevice = async (
  req, res
) => {
  try {
    const session = await UserSession.findOneAndUpdate(
      {
        user: req.user.userId,
        sessionId: req.params.sessionId,
        isTrusted: true,
      },
      {
        $set: {
          isTrusted: false,
          trustedUntil: null,
          deviceTokenHash: null,
        },
      },
      { new: true }
    );

    if (!session) {
      return fail(res, 404, "Trusted device not found");
    }

    if (session.sessionId === req.sessionId) {
      res.clearCookie(cookieNames.device, {
        httpOnly: true,
        secure: authConfig.secureCookies,
        sameSite: "strict",
        path: "/",
      });
    }

    await logActivity({
      req,
      user: req.user.userId,
      actor: req.user.userId,
      action: "DEVICE_TRUST_REMOVED",
      sessionId: session.sessionId,
    });

    return res.json({
      success: true,
      message: "Device trust removed",
    });
  } catch (error) {
    console.error("Forget device:", error);
    return fail(res, 500, "Unable to forget device");
  }
};
