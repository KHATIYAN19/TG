
import crypto, { randomUUID } from "crypto";

import User from "../models/User.js";
import UserSession from "../models/UserSession.js";

import redis from "../utils/redis.js";
import sendMail from "../utils/MailSender.js";

import {
  authConfig,
  daysFromNow,
  minutesFromNow,
} from "../config/auth.js";

import {
  randomToken,
  hashToken,
  verifyPassword,
  secureEqual,
  cookieNames,
  clearAuthCookies,
  setDeviceCookie,
  setRefreshCookie,
  issueAccessToken,
  deviceInfo,
  getIp,
  logActivity,
} from "../utils/authUtils.js";

import {
  authKeys,
  assertUserAuthMatches,
  registerSessionAuth,
  revokeSessionAuth,
  invalidateUserAuth,
  provisionUserAuth,
  revokeAllRedisSessions,
} from "../services/authStateService.js";

const fail = (res, status, message, code) =>
  res.status(status).json({
    success: false,
    message,
    ...(code ? { code } : {}),
  });

const safeUser = user => {
  const obj = user.toObject
    ? user.toObject()
    : { ...user };

  delete obj.password;
  delete obj.tokenVersion;
  delete obj.failedLoginAttempts;
  delete obj.lockedUntil;
  return obj;
};

const generateOtp = () =>
  crypto.randomInt(100000, 1000000).toString();

const otpHash = (sessionId, otp) =>
  hashToken(
    `${sessionId}:${otp}:${authConfig.jwtSecret}`
  );

const findLoginUser = identifier => {
  const value = identifier.trim();

  return User.findOne({
    $or: [
      { email: value.toLowerCase() },
      { mobile: value },
    ],
  }).select(
    "+password +tokenVersion " +
    "+failedLoginAttempts +lockedUntil"
  );
};

const eligible = user =>
  user &&
  !user.isDeleted &&
  user.status === "active" &&
  !user.mustChangePassword;

const sendLoginOtp = async (user, code) => {
  const subject = "Target Trek Login OTP";

  const text =
    `Your Target Trek login OTP is ${code}. ` +
    `It expires in ${authConfig.otpMinutes} minutes.`;

  const html = `
    <div style="font-family:Arial,sans-serif;padding:24px">
      <h2>Target Trek Login Verification</h2>
      <p>Your one-time verification code is:</p>
      <h1 style="letter-spacing:6px">${code}</h1>
      <p>Expires in ${authConfig.otpMinutes} minutes.</p>
      <p>If you did not attempt to log in,
      you can ignore this email.</p>
    </div>
  `;

  await sendMail(user.email, subject, text, html);
};

const createPendingSession = async (
  user,
  req
) => UserSession.create({
  user: user._id,
  sessionId: randomUUID(),
  purpose: "login",
  state: "pending_otp",
  device: deviceInfo(req),
  ipAddress: getIp(req),
  expiresAt: minutesFromNow(
    authConfig.otpMinutes
  ),
});

// Use a shared request-lock key for a pending OTP.
// This is an additional guard against concurrent attempts.
const lockOtp = async (sessionId) => {
  const key = `auth:otp-lock:${sessionId}`;
  const value = randomToken(12);

  const result = await redis.set(
    key,
    value,
    { nx: true, ex: 15 }
  );

  return result === "OK"
    ? { key, value }
    : null;
};

// Safe ownership check using Lua so an expired lock
// cannot accidentally remove another request's lock.
const unlockOtp = async lock => {
  if (!lock) return;

  await redis.eval(
    `if redis.call("GET", KEYS[1]) == ARGV[1]
     then return redis.call("DEL", KEYS[1])
     else return 0 end`,
    [lock.key],
    [lock.value]
  );
};

const completeLogin = async ({
  req,
  res,
  user,
  session,
  trusted = false,
  deviceToken = null,
}) => {
  await assertUserAuthMatches(user);

  const refreshToken = randomToken();

  const refreshExpiresAt = daysFromNow(
    authConfig.refreshDays
  );

  let finalDeviceToken = null;

  if (trusted) {
    finalDeviceToken = deviceToken || randomToken();
  }

  session.state = "active";
  session.purpose = "login";
  session.refreshTokenHash = hashToken(refreshToken);
  session.refreshExpiresAt = refreshExpiresAt;
  session.lastActiveAt = new Date();

  session.challengeHash = null;
  session.challengeExpiresAt = null;

  session.isTrusted = trusted;

  session.deviceTokenHash = finalDeviceToken
    ? hashToken(finalDeviceToken)
    : null;

  session.trustedUntil = trusted
    ? daysFromNow(authConfig.trustedDays)
    : null;

  session.expiresAt = daysFromNow(
    Math.max(
      authConfig.refreshDays,
      trusted ? authConfig.trustedDays : 0
    )
  );

  await session.save();

  try {
    await registerSessionAuth(user, session);
  } catch (error) {
    await UserSession.updateOne(
      { _id: session._id },
      {
        $set: {
          state: "revoked",
          revokedAt: new Date(),
          refreshTokenHash: null,
        },
      }
    );

    throw error;
  }

  setRefreshCookie(res, refreshToken);

  if (finalDeviceToken) {
    setDeviceCookie(res, finalDeviceToken);
  }

  await User.updateOne(
    { _id: user._id },
    { $set: { lastLoginAt: new Date() } }
  );

  await logActivity({
    req,
    user: user._id,
    actor: user._id,
    sessionId: session.sessionId,
    action: "LOGIN_SUCCESS",
    metadata: { trustedDevice: trusted },
  });

  return res.json({
    success: true,
    requiresOtp: false,
    token: issueAccessToken(
      user,
      session.sessionId
    ),
    expiresIn: authConfig.accessTtl,
    user: safeUser(user),
  });
};

/* =========================================
   LOGIN
========================================= */

export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (
      typeof identifier !== "string" ||
      typeof password !== "string" ||
      !identifier.trim() ||
      password.length > 128
    ) {
      return fail(res, 400, "Invalid login request");
    }

    const user = await findLoginUser(identifier);

    if (!user) {
      return fail(res, 401, "Invalid credentials");
    }

    if (
      user.lockedUntil &&
      user.lockedUntil > new Date()
    ) {
      return fail(res, 429, "Account temporarily locked");
    }

    if (!eligible(user)) {
      return fail(res, 403, "Account unavailable");
    }

    const matched = await verifyPassword(
      password,
      user.password
    );

    if (!matched) {
      const attempts =
        (user.failedLoginAttempts || 0) + 1;

      const shouldLock =
        attempts >= authConfig.maxLoginAttempts;

      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            failedLoginAttempts: shouldLock
              ? 0
              : attempts,
            lockedUntil: shouldLock
              ? minutesFromNow(authConfig.lockMinutes)
              : null,
          },
        }
      );

      if (shouldLock) {
        await invalidateUserAuth(user._id);
      }

      await logActivity({
        req,
        user: user._id,
        action: "LOGIN_FAILED",
        result: "failure",
      });

      return fail(res, 401, "Invalid credentials");
    }

    await assertUserAuthMatches(user);

    // Clear lockout after valid authentication.
    if (user.failedLoginAttempts || user.lockedUntil) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        }
      );
    }

    // Admin is exempted from OTP as requested.
    // if (user.role === "admin") {
    //   const session = await createPendingSession(
    //     user, req
    //   );

    //   return completeLogin({
    //     req,
    //     res,
    //     user,
    //     session,
    //   });
    // }
    if (
      user.role === "admin" ||
      user.role === "affiliate"
    ) {
      const session = await createPendingSession(user, req);

      return completeLogin({
        req,
        res,
        user,
        session,
      });
    }

    /* ===== TRUSTED DEVICE CHECK ===== */

    const rawDeviceToken =
      req.cookies?.[cookieNames.device];

    let trustedSession = null;

    if (typeof rawDeviceToken === "string") {
      trustedSession = await UserSession.findOne({
        user: user._id,
        isTrusted: true,
        deviceTokenHash: hashToken(rawDeviceToken),
        trustedUntil: { $gt: new Date() },
        // Revoked login sessions can retain their
        // explicit device trust after normal logout.
      }).select("+deviceTokenHash");
    }

    const session = await createPendingSession(
      user, req
    );

    if (trustedSession) {
      return completeLogin({
        req,
        res,
        user,
        session,
        trusted: true,
        deviceToken: rawDeviceToken,
      });
    }

    /* ===== NEW DEVICE: SEND OTP ===== */

    const code = generateOtp();

    session.challengeHash = otpHash(
      session.sessionId,
      code
    );

    session.challengeExpiresAt =
      minutesFromNow(authConfig.otpMinutes);

    session.challengeLastSentAt = new Date();

    await session.save();

    try {
      await sendLoginOtp(user, code);
    } catch (error) {
      await UserSession.deleteOne({
        _id: session._id,
      });
      throw error;
    }

    await logActivity({
      req,
      user: user._id,
      action: "LOGIN_OTP_SENT",
      sessionId: session.sessionId,
    });

    return res.json({
      success: true,
      requiresOtp: true,
      challengeId: session.sessionId,
      message: "OTP sent to registered email",
    });
  } catch (error) {
    console.error("Login error:", error);

    if (
      error.message === "AUTH_STATE_NOT_READY" ||
      error.message === "ACCOUNT_NOT_ACTIVE"
    ) {
      return fail(
        res, 403,
        "Account authorization unavailable"
      );
    }

    return fail(res, 503, "Unable to process login");
  }
};

/* =========================================
   VERIFY OTP
========================================= */

export const verifyOtp = async (req, res) => {
  const { challengeId, otp, rememberDevice } =
    req.body;

  if (
    typeof challengeId !== "string" ||
    !/^\d{6}$/.test(String(otp)) ||
    typeof rememberDevice !== "boolean"
  ) {
    return fail(res, 400, "Invalid OTP request");
  }

  let lock = null;

  try {
    lock = await lockOtp(challengeId);

    if (!lock) {
      return fail(
        res, 429,
        "Verification already in progress"
      );
    }

    // Attempts are incremented atomically, before
    // checking the code.
    const session = await UserSession.findOneAndUpdate(
      {
        sessionId: challengeId,
        state: "pending_otp",
        purpose: "login",
        challengeExpiresAt: { $gt: new Date() },
        challengeAttempts: {
          $lt: authConfig.maxOtpAttempts,
        },
      },
      {
        $inc: { challengeAttempts: 1 },
      },
      { new: true }
    ).select("+challengeHash");

    if (!session) {
      return fail(
        res, 401,
        "OTP expired or maximum attempts reached"
      );
    }

    const receivedHash = otpHash(
      challengeId,
      String(otp)
    );

    if (
      !secureEqual(
        receivedHash,
        session.challengeHash
      )
    ) {
      if (
        session.challengeAttempts >=
        authConfig.maxOtpAttempts
      ) {
        await UserSession.updateOne(
          {
            _id: session._id,
            state: "pending_otp",
          },
          {
            $set: {
              state: "revoked",
              revokedAt: new Date(),
              challengeHash: null,
            },
          }
        );
      }

      await logActivity({
        req,
        user: session.user,
        action: "LOGIN_OTP_FAILED",
        result: "failure",
        sessionId: session.sessionId,
      });

      return fail(res, 401, "Invalid OTP");
    }

    const user = await User.findById(
      session.user
    ).select("+tokenVersion");

    if (!eligible(user)) {
      return fail(res, 403, "Account unavailable");
    }

    await assertUserAuthMatches(user);

    // Consume challenge exactly once.
    const consumed =
      await UserSession.findOneAndUpdate(
        {
          _id: session._id,
          state: "pending_otp",
          challengeHash: session.challengeHash,
          challengeExpiresAt: {
            $gt: new Date(),
          },
        },
        {
          $set: {
            state: "active",
            challengeHash: null,
            challengeExpiresAt: null,
          },
        },
        { new: true }
      );

    if (!consumed) {
      return fail(res, 401, "OTP already used");
    }

    return await completeLogin({
      req,
      res,
      user,
      session: consumed,
      trusted: rememberDevice,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return fail(res, 503, "OTP verification unavailable");
  } finally {
    try {
      await unlockOtp(lock);
    } catch (error) {
      console.error("OTP lock release:", error);
    }
  }
};

/* =========================================
   RESEND OTP
========================================= */

export const resendOtp = async (req, res) => {
  try {
    const { challengeId } = req.body;

    if (typeof challengeId !== "string") {
      return fail(res, 400, "Invalid challenge");
    }

    const now = new Date();

    const session = await UserSession.findOneAndUpdate(
      {
        sessionId: challengeId,
        state: "pending_otp",
        purpose: "login",
        challengeExpiresAt: { $gt: now },
        challengeAttempts: {
          $lt: authConfig.maxOtpAttempts,
        },
        challengeLastSentAt: {
          $lte: new Date(Date.now() - 60000),
        },
      },
      {
        $set: {
          challengeLastSentAt: now,
        },
      },
      { new: true }
    );

    if (!session) {
      return fail(
        res, 429,
        "Challenge invalid or resend not yet allowed"
      );
    }

    const user = await User.findById(
      session.user
    ).select("+tokenVersion");

    if (!eligible(user)) {
      return fail(res, 403, "Account unavailable");
    }

    await assertUserAuthMatches(user);

    const code = generateOtp();

    await UserSession.updateOne(
      {
        _id: session._id,
        state: "pending_otp",
      },
      {
        $set: {
          challengeHash: otpHash(
            session.sessionId,
            code
          ),
          challengeExpiresAt:
            minutesFromNow(authConfig.otpMinutes),
        },
      }
    );

    await sendLoginOtp(user, code);

    await logActivity({
      req,
      user: user._id,
      action: "LOGIN_OTP_RESENT",
      sessionId: session.sessionId,
    });

    return res.json({
      success: true,
      message: "New OTP sent",
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return fail(res, 503, "Unable to resend OTP");
  }
};

/* =========================================
   REFRESH ACCESS TOKEN
========================================= */

export const refreshToken = async (req, res) => {
  try {
    const raw = req.cookies?.[cookieNames.refresh];

    if (typeof raw !== "string") {
      return fail(res, 401, "Refresh token missing");
    }

    const oldHash = hashToken(raw);

    const session = await UserSession.findOne({
      refreshTokenHash: oldHash,
      state: "active",
      refreshExpiresAt: { $gt: new Date() },
    }).select("+refreshTokenHash");

    if (!session) {
      clearAuthCookies(res);
      return fail(res, 401, "Invalid refresh token");
    }

    const user = await User.findById(
      session.user
    ).select("+tokenVersion");

    if (!eligible(user)) {
      clearAuthCookies(res);
      return fail(res, 403, "Account unavailable");
    }

    await assertUserAuthMatches(user);

    const nextToken = randomToken();
    const nextExpiry = daysFromNow(
      authConfig.refreshDays
    );

    const updated =
      await UserSession.findOneAndUpdate(
        {
          _id: session._id,
          state: "active",
          refreshTokenHash: oldHash,
          refreshExpiresAt: { $gt: new Date() },
        },
        {
          $set: {
            refreshTokenHash: hashToken(nextToken),
            refreshExpiresAt: nextExpiry,
            lastActiveAt: new Date(),
            expiresAt: daysFromNow(
              Math.max(
                authConfig.refreshDays,
                session.isTrusted
                  ? authConfig.trustedDays
                  : 0
              )
            ),
          },
        },
        { new: true }
      );

    if (!updated) {
      clearAuthCookies(res);
      return fail(res, 401, "Refresh token used");
    }

    await registerSessionAuth(user, updated);

    setRefreshCookie(res, nextToken);

    return res.json({
      success: true,
      token: issueAccessToken(
        user,
        session.sessionId
      ),
      expiresIn: authConfig.accessTtl,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return fail(res, 503, "Unable to refresh session");
  }
};

/* =========================================
   LOGOUT CURRENT DEVICE
========================================= */

export const logout = async (req, res) => {
  try {
    const sessionId = req.sessionId;

    // Fail closed on Redis before committing MongoDB.
    await revokeSessionAuth(sessionId);

    await UserSession.updateOne(
      {
        user: req.user.userId,
        sessionId,
        state: "active",
      },
      {
        $set: {
          state: "revoked",
          revokedAt: new Date(),
          revokedBy: req.user.userId,
          revokeReason: "User logout",
          refreshTokenHash: null,
          // Keep trusted device data until expiry.
        },
      }
    );

    // Clear refresh cookie, retain remembered-device
    // cookie so future password login can skip OTP.
    res.clearCookie(cookieNames.refresh, {
      httpOnly: true,
      secure: authConfig.secureCookies,
      sameSite: "strict",
      path: "/",
    });

    await logActivity({
      req,
      user: req.user.userId,
      actor: req.user.userId,
      action: "LOGOUT",
      sessionId,
    });

    return res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return fail(res, 503, "Unable to log out");
  }
};

/* =========================================
   LOGOUT ALL DEVICES
========================================= */

export const logoutAll = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Immediately block authorization in Redis.
    await invalidateUserAuth(userId);

    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { tokenVersion: 1 } },
      { new: true }
    ).select("+tokenVersion");

    if (!user) {
      return fail(res, 404, "User not found");
    }

    await revokeAllRedisSessions(userId);

    await UserSession.updateMany(
      { user: userId },
      {
        $set: {
          state: "revoked",
          revokedAt: new Date(),
          revokedBy: userId,
          revokeReason: "Logout all devices",
          refreshTokenHash: null,
          deviceTokenHash: null,
          isTrusted: false,
          trustedUntil: null,
          challengeHash: null,
        },
      }
    );

    await provisionUserAuth(user);

    clearAuthCookies(res);

    await logActivity({
      req,
      user: userId,
      actor: userId,
      action: "ALL_SESSIONS_REVOKED",
    });

    return res.json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    return fail(res, 503, "Unable to revoke sessions");
  }
};

/* =========================================
   CURRENT USER
========================================= */

export const me = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    );

    if (!user || user.isDeleted) {
      return fail(res, 404, "User not found");
    }

    return res.json({
      success: true,
      user: safeUser(user),
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return fail(res, 500, "Unable to fetch profile");
  }
};
