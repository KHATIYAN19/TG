
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import UserSession from "../models/UserSession.js";
import UserActivity from "../models/UserActivity.js";

import {
  authConfig,
  daysFromNow,
} from "../config/auth.js";

export const randomToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const hashToken = value =>
  crypto.createHash("sha256")
    .update(value)
    .digest("hex");

export const hashPassword = password =>
  bcrypt.hash(password, authConfig.bcryptRounds);

export const verifyPassword = (password, hash) =>
  bcrypt.compare(password, hash);

export const secureEqual = (a, b) => {
  if (!a || !b) return false;
  const x = Buffer.from(a);
  const y = Buffer.from(b);

  return x.length === y.length &&
    crypto.timingSafeEqual(x, y);
};

export const cookieNames = {
  refresh: authConfig.secureCookies
    ? "__Host-tt_refresh"
    : "tt_refresh",

  device: authConfig.secureCookies
    ? "__Host-tt_device"
    : "tt_device",
};

const cookieOptions = maxAge => ({
  httpOnly: true,
  secure: authConfig.secureCookies,
  sameSite: "strict",
  path: "/",
  maxAge,
});

export const clearAuthCookies = res => {
  for (const name of Object.values(cookieNames)) {
    res.clearCookie(name, {
      httpOnly: true,
      secure: authConfig.secureCookies,
      sameSite: "strict",
      path: "/",
    });
  }
};

export const setDeviceCookie = (res, token) => {
  res.cookie(
    cookieNames.device,
    token,
    cookieOptions(authConfig.trustedDays * 86400000)
  );
};

export const setRefreshCookie = (res, token) => {
  res.cookie(
    cookieNames.refresh,
    token,
    cookieOptions(authConfig.refreshDays * 86400000)
  );
};

export const issueAccessToken = (user, sessionId) =>
  jwt.sign(
    {
      sub: String(user._id),
      sid: sessionId,
      tv: user.tokenVersion,
    },
    authConfig.jwtSecret,
    {
      expiresIn: authConfig.accessTtl,
      algorithm: "HS256",
    }
  );

export const getIp = req => req.ip;

export const deviceInfo = req => {
  const ua = String(req.get("user-agent") || "")
    .slice(0, 500);

  let type = "desktop";
  if (/tablet|ipad/i.test(ua)) type = "tablet";
  else if (/mobile|android|iphone/i.test(ua)) type = "mobile";

  // Informational only; never use this to trust a device.
  return {
    userAgent: ua,
    type,
    browser: /Edg\//.test(ua) ? "Edge" :
      /Chrome\//.test(ua) ? "Chrome" :
      /Firefox\//.test(ua) ? "Firefox" :
      /Safari\//.test(ua) ? "Safari" : "Other",
    os: /Windows/i.test(ua) ? "Windows" :
      /Mac OS/i.test(ua) ? "macOS" :
      /Android/i.test(ua) ? "Android" :
      /iPhone|iPad/i.test(ua) ? "iOS" :
      /Linux/i.test(ua) ? "Linux" : "Other",
  };
};

export const logActivity = async ({
  req,
  user,
  actor = null,
  action,
  result = "success",
  metadata = {},
  sessionId = null,
}) => {
  // Never put tokens, OTPs, or passwords in metadata.
  try {
    await UserActivity.create({
      user,
      actor,
      action,
      result,
      sessionId,
      ipAddress: req ? getIp(req) : undefined,
      userAgent: req?.get("user-agent")?.slice(0, 500),
      metadata,
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};

export const revokeUserSessions = async (
  userId,
  actorId = null,
  reason = "Security revocation"
) => {
  await UserSession.updateMany(
    {
      user: userId,
      state: { $ne: "revoked" },
    },
    {
      $set: {
        state: "revoked",
        revokedAt: new Date(),
        revokedBy: actorId,
        revokeReason: reason,
        refreshTokenHash: null,
        deviceTokenHash: null,
        isTrusted: false,
        trustedUntil: null,
      },
    }
  );
};

// Session activation after password-only or OTP login.
export const activateSession = async ({
  user,
  session,
  res,
  trustDevice = false,
  existingDeviceToken = null,
}) => {
  const refresh = randomToken();
  const deviceToken = trustDevice
    ? existingDeviceToken || randomToken()
    : null;

  session.state = "active";
  session.purpose = "login";
  session.refreshTokenHash = hashToken(refresh);
  session.refreshExpiresAt =
    daysFromNow(authConfig.refreshDays);

  session.challengeHash = null;
  session.challengeExpiresAt = null;
  session.challengeAttempts = 0;

  session.isTrusted = trustDevice;
  session.deviceTokenHash = deviceToken
    ? hashToken(deviceToken)
    : null;
  session.trustedUntil = trustDevice
    ? daysFromNow(authConfig.trustedDays)
    : null;

  session.expiresAt = daysFromNow(
    Math.max(
      authConfig.refreshDays,
      trustDevice ? authConfig.trustedDays : 0
    )
  );

  session.lastActiveAt = new Date();
  await session.save();

  setRefreshCookie(res, refresh);

  if (deviceToken) {
    setDeviceCookie(res, deviceToken);
  }

  const token = issueAccessToken(
    user,
    session.sessionId
  );

  return {
    token,
    expiresIn: authConfig.accessTtl,
    user: user.toSafeObject(),
  };
};
