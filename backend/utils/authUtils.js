
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

/*
  The site (targettrek.in) and the API (*.run.app) are different SITES, so every API call is a cross-site
  request. Browsers refuse to store or send SameSite=Strict/Lax cookies on cross-site requests, which made
  the refresh cookie and the remembered-device cookie vanish: a page reload showed "Login" again and staff
  got an OTP every time. Default is therefore SameSite=None + Partitioned (CHIPS): the cookie is only ever
  sent when the top-level page is our own site, so other sites still cannot ride it (CSRF), and CORS plus
  the origin check keep doing their job. COOKIE_SAMESITE overrides it (e.g. "strict" once the API is
  served from a same-site domain like api.targettrek.in). Plain-http local dev falls back to Lax, since
  SameSite=None requires Secure.
*/
const cookieSameSite = (() => {
  const configured = String(process.env.COOKIE_SAMESITE || "").trim().toLowerCase();
  if (["strict", "lax", "none"].includes(configured)) {
    return configured === "none" && !authConfig.secureCookies ? "lax" : configured;
  }
  return authConfig.secureCookies ? "none" : "lax";
})();

const cookiePartitioned =
  cookieSameSite === "none" && process.env.COOKIE_PARTITIONED !== "false";

// Attributes shared by setting AND clearing: a cookie is only removed when these match.
export const authCookieBase = () => ({
  httpOnly: true,
  secure: authConfig.secureCookies,
  sameSite: cookieSameSite,
  path: "/",
  ...(cookiePartitioned ? { partitioned: true } : {}),
});

const cookieOptions = maxAge => ({
  ...authCookieBase(),
  maxAge,
});

export const clearAuthCookie = (res, name) => {
  res.clearCookie(name, authCookieBase());
  // Also drop a leftover SameSite=Strict copy written by the old setting.
  if (cookiePartitioned) {
    res.clearCookie(name, { httpOnly: true, secure: authConfig.secureCookies, sameSite: "strict", path: "/" });
  }
};

export const clearAuthCookies = res => {
  for (const name of Object.values(cookieNames)) {
    clearAuthCookie(res, name);
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

/*
  REMEMBERED (TRUSTED) DEVICES
  A remembered browser is identified by its device-token hash, and that same hash can sit on more than one
  session row: logging out keeps the row (so the next password login can skip the OTP), and the next login
  copies the trust onto its new session. Removing trust therefore has to clear EVERY row holding the hash,
  otherwise a "forgotten" or revoked device keeps skipping the OTP.

    untrustDevices(userId)                          every remembered device of the user
    untrustDevices(userId, { hashes })              only these devices
    untrustDevices(userId, { exceptHash })          all but this device (log out other devices)
    untrustDevices(userId, { hashes, exceptSessionId })  move trust: clear the copies, keep one row
*/
export const untrustDevices = async (
  userId,
  { hashes = null, exceptHash = null, exceptSessionId = null } = {}
) => {
  const filter = {
    user: userId,
    $or: [{ isTrusted: true }, { deviceTokenHash: { $ne: null } }],
  };

  if (hashes) {
    const list = hashes.filter(Boolean);
    if (!list.length) return 0;
    filter.deviceTokenHash = { $in: list };
  } else if (exceptHash) {
    filter.deviceTokenHash = { $ne: exceptHash };
  }

  if (exceptSessionId) filter.sessionId = { $ne: exceptSessionId };

  const result = await UserSession.updateMany(filter, {
    $set: {
      isTrusted: false,
      trustedUntil: null,
      deviceTokenHash: null,
    },
  });

  return result.modifiedCount || 0;
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

  // Logged-out rows were skipped above but can still remember a device: clear those too.
  await untrustDevices(userId);
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
