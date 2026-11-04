
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
import { sweepSessions } from "../services/sessionCleanup.js";
import { describeDevice } from "../utils/authUtils.js";
import { locationFromIp } from "../utils/geoLocation.js";
import redis from "../utils/redis.js";
import { authKeys } from "../services/authStateService.js";

const fail = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const safeSession = session => {
  // Sessions created before device names were stored: derive the label now.
  const described = describeDevice(session.device?.userAgent);
  const device = {
    ...described,
    ...(session.device || {}),
    name: session.device?.name || described.name,
    model: session.device?.model || described.model,
  };
  delete device.userAgent; // raw UA is not needed by any client

  // Sessions created before locations were stored: look the IP up now.
  const location =
    session.location?.text
      ? session.location
      : locationFromIp(session.ipAddress);

  return {
    ...baseSession(session),
    device,
    location: location?.text ? location : null,
  };
};

const baseSession = session => ({
  sessionId: session.sessionId,
  state: session.state,
  ipAddress: session.ipAddress,
  isTrusted: session.isTrusted,
  trustedUntil: session.trustedUntil,
  lastActiveAt: session.lastActiveAt,
  refreshExpiresAt: session.refreshExpiresAt,
  expiresAt: session.refreshExpiresAt,
  createdAt: session.createdAt,
  revokedAt: session.revokedAt,
  revokeReason: session.revokeReason,
});

/*
  Only genuinely active devices are listed: state=active and refresh token not
  expired. Revoked, logged-out, expired and half-finished (OTP/setup) sessions
  are never shown, and are cleaned out of the database here and by the sweeper.
*/
const listSessions = async (
  req, res, userId
) => {
  await sweepSessions(userId).catch(error =>
    console.error("Session sweep:", error.message)
  );

  const sessions = await UserSession.find({
    user: userId,
    purpose: "login",
    state: "active",
    refreshExpiresAt: { $gt: new Date() },
  })
    .sort({ lastActiveAt: -1 })
    .limit(50)
    .lean();

  const list = sessions.map(session => ({
    ...safeSession(session),
    isCurrent: session.sessionId === req.sessionId,
  }));

  // Current device first.
  list.sort((a, b) => Number(b.isCurrent) - Number(a.isCurrent));

  return res.json({
    success: true,
    sessions: list,
    total: list.length,
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
   USER: LOG OUT EVERY OTHER DEVICE
   (keeps the device making the request)
========================================== */

export const revokeMyOtherSessions = async (
  req, res
) => {
  try {
    const userId = req.user.userId;

    const others = await UserSession.find({
      user: userId,
      purpose: "login",
      state: "active",
      sessionId: { $ne: req.sessionId },
    }).select("sessionId").lean();

    if (!others.length) {
      return res.json({
        success: true,
        message: "There are no other devices to log out.",
        count: 0,
      });
    }

    const ids = others.map(s => s.sessionId);

    // Block them immediately in Redis first (fail closed).
    for (let i = 0; i < ids.length; i += 100) {
      await redis.del(
        ...ids.slice(i, i + 100).map(authKeys.session)
      );
    }

    await UserSession.updateMany(
      {
        user: userId,
        sessionId: { $in: ids },
        state: "active",
      },
      {
        $set: {
          state: "revoked",
          revokedAt: new Date(),
          revokedBy: userId,
          revokeReason: "Logged out other devices",
          refreshTokenHash: null,
          deviceTokenHash: null,
          isTrusted: false,
          trustedUntil: null,
        },
      }
    );

    await logActivity({
      req,
      user: userId,
      actor: userId,
      action: "OTHER_SESSIONS_REVOKED",
      metadata: { count: ids.length },
    });

    return res.json({
      success: true,
      message: `Logged out ${ids.length} other device${ids.length === 1 ? "" : "s"}.`,
      count: ids.length,
    });
  } catch (error) {
    console.error("Revoke other sessions:", error);
    return fail(res, 503, "Unable to log out other devices");
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

/* ==========================================
   USER: RENAME OWN DEVICE
   (browsers can't reveal e.g. "iPhone 15",
   so the owner can name it themselves)
========================================== */

export const renameMySession = async (req, res) => {
  try {
    const name = String(req.body?.name ?? "")
      .replace(/[^\p{L}\p{N} .,'()\-+/]/gu, "")
      .trim()
      .slice(0, 50);

    if (name.length < 2) {
      return fail(res, 400, "Enter a name of at least 2 characters");
    }

    const session = await UserSession.findOneAndUpdate(
      {
        user: req.user.userId,
        sessionId: req.params.sessionId,
        purpose: "login",
        state: "active",
      },
      { $set: { "device.name": name } },
      { new: true }
    ).lean();

    if (!session) {
      return fail(res, 404, "Active device not found");
    }

    return res.json({
      success: true,
      message: "Device renamed",
      name,
    });
  } catch (error) {
    console.error("Rename session:", error);
    return fail(res, 500, "Unable to rename device");
  }
};
