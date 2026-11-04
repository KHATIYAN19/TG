
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

/*
  Turns a User-Agent into something a person recognises ("Chrome on Windows PC",
  "Safari on iPhone"). Informational only; never use this to trust a device.
*/
export const describeDevice = (rawUa) => {
  const ua = String(rawUa || "").slice(0, 500);

  let type = "desktop";
  if (/tablet|ipad/i.test(ua) || (/android/i.test(ua) && !/mobile/i.test(ua))) type = "tablet";
  else if (/mobile|android|iphone|ipod/i.test(ua)) type = "mobile";
  if (!ua) type = "unknown";

  const browser =
    /Edg(e|A|iOS)?\//.test(ua) ? "Edge" :
    /OPR\/|Opera/.test(ua) ? "Opera" :
    /SamsungBrowser\//.test(ua) ? "Samsung Internet" :
    /Firefox\/|FxiOS\//.test(ua) ? "Firefox" :
    /Chrome\/|CriOS\//.test(ua) ? "Chrome" :
    /Safari\//.test(ua) ? "Safari" : "Browser";

  const os =
    /Windows/i.test(ua) ? "Windows" :
    /iPhone|iPad|iPod/i.test(ua) ? "iOS" :
    /Android/i.test(ua) ? "Android" :
    /Mac OS|Macintosh/i.test(ua) ? "macOS" :
    /CrOS/i.test(ua) ? "ChromeOS" :
    /Linux/i.test(ua) ? "Linux" : "Unknown OS";

  // Hardware label: phone/tablet model where the UA reveals it.
  let model = "";
  if (/iPhone/i.test(ua)) model = "iPhone";
  else if (/iPad/i.test(ua)) model = "iPad";
  else if (os === "Android") {
    const m = ua.match(/Android[^;)]*;\s*([^;)]+?)\s*(?:Build\/[^;)]*)?[;)]/i);
    const found = m?.[1]?.trim();
    // Chrome's reduced UA reports a bare "K": not a real model.
    model = found && found.length > 1 && !/^(k|mobile|wv)$/i.test(found) ? found : "Android device";
  } else if (os === "macOS") model = "Mac";
  else if (os === "Windows") model = "Windows PC";
  else if (os === "Linux") model = "Linux PC";
  else if (os === "ChromeOS") model = "Chromebook";

  const name = ua ? `${browser} on ${model || os}` : "Unknown device";

  return { userAgent: ua, type, browser, os, model, name };
};

/*
  The browser cannot reveal an iPhone/Android model to the server, so the web app
  sends what it can detect in a small cookie (tt_dhint = JSON {model}). It is
  untrusted display text only: sanitised, length-capped, never used for security.
*/
const cleanHint = v =>
  typeof v === "string"
    ? v.replace(/[^\w .\-()/+]/g, "").trim().slice(0, 50)
    : "";

const readHint = req => {
  try {
    const raw = req.cookies?.tt_dhint;
    if (typeof raw !== "string" || raw.length > 400) return {};
    const parsed = JSON.parse(decodeURIComponent(raw));
    return { model: cleanHint(parsed?.model), label: cleanHint(parsed?.label) };
  } catch {
    return {};
  }
};

export const deviceInfo = req => {
  const info = describeDevice(req.get("user-agent"));
  const { model, label } = readHint(req);

  if (label) {
    // The owner named this browser themselves (e.g. "MacBook Air M5").
    info.model = label;
    info.name = label;
  } else if (model) {
    info.model = model;
    info.name = `${info.browser} on ${model}`;
  }

  return info;
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
