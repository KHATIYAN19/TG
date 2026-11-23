
import crypto, { randomUUID } from "crypto";

import User from "../models/User.js";
import UserSession from "../models/UserSession.js";
import { locationFromRequest } from "../utils/geoLocation.js";

import redis from "../utils/redis.js";
import { deliverMail } from "../utils/MailSender.js";

import {
  authConfig,
  daysFromNow,
  minutesFromNow,
} from "../config/auth.js";

import {
  randomToken,
  hashToken,
  untrustDevices,
  hashPassword,
  verifyPassword,
  secureEqual,
  cookieNames,
  clearAuthCookie,
  clearAuthCookies,
  setDeviceCookie,
  setRefreshCookie,
  issueAccessToken,
  deviceInfo,
  getIp,
  logActivity,
} from "../utils/authUtils.js";

import { ArenaError } from "../services/arena/errors.js";
import { otpEmail, supportEmail } from "../services/mail/templates.js";
import { resumeOtpEmail } from "../services/resume/otpMail.js";
import { assertNotLocked, recordAttempt } from "../services/authLocks.js";

import {
  authKeys,
  assertUserAuthMatches,
  getUserAuth,
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

const PRIVILEGED_ROLES = new Set([
  "admin",
  "affiliate",
  "Employee",
  "partner",
]);

/*
  LOGIN OTP
  LOGIN_OTP_ROLES (comma-separated, case-insensitive, e.g. "admin,partner,employee") lists the roles that
  need an emailed code at login, and only on a browser that is not remembered yet. Every other role signs
  straight in with the password. Unset or empty = nobody gets a code; "*" = every role.
  After a correct code the browser is remembered for TRUSTED_DEVICE_TTL_DAYS (default 30), renewed on
  each login from it; logout keeps it remembered, while "forget this device", revoking it, logging out
  other devices / all devices, and a password reset make it ask again.
  LOGIN_OTP_ENABLED=true (legacy switch) still turns the code on for every role.
  Signing UP is a separate flow: new members still confirm their email with a code.
*/
const loginOtpRoles = () =>
  new Set(
    String(process.env.LOGIN_OTP_ROLES || "")
      .split(",")
      .map(role => role.trim().toLowerCase())
      .filter(Boolean)
  );

export const needsLoginOtp = user => {
  if (process.env.LOGIN_OTP_ENABLED === "true") return true;
  const roles = loginOtpRoles();
  return roles.has("*") || roles.has(String(user?.role || "").toLowerCase());
};

const lockMinutesFor = user =>
  PRIVILEGED_ROLES.has(user.role)
    ? authConfig.lockMinutes
    : authConfig.userLockMinutes;

const lockLabel = minutes =>
  minutes >= 60 && minutes % 60 === 0
    ? `${minutes / 60} hour${minutes === 60 ? "" : "s"}`
    : `${minutes} minute${minutes === 1 ? "" : "s"}`;

// 429 with a machine code and the exact unlock time so the UI can
// show a live countdown. The lock lifts by itself at lockedUntil.
const lockedResponse = (res, lockedUntil) => {
  const retryAfter = Math.max(
    1,
    Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000)
  );

  res.set("Retry-After", String(retryAfter));

  return res.status(429).json({
    success: false,
    code: "ACCOUNT_LOCKED",
    message:
      "Too many wrong passwords. Your account is locked for security and will unlock automatically. You can also reset your password with an email code.",
    lockedUntil: new Date(lockedUntil).toISOString(),
    retryAfter,
  });
};

/*
  NETWORK-WIDE LOGIN LOCK
  Besides the per-account lock (5 wrong passwords = 24 h), a network (IP) that
  racks up too many failed logins across ANY accounts is locked for 24 h
  (LOGIN_IP_FAIL_LIMIT, default 30/day). Stops password spraying.
*/
const sendIpLock = (res, error) => {
  res.set("Retry-After", String(error.extra?.retryAfter || 86400));
  return res.status(error.status).json({
    success: false,
    code: error.code,
    message: error.message,
    ...error.extra,
  });
};

// Count one failed login for this IP. Returns the lock error if THIS failure
// tipped the IP over the limit, otherwise null.
const countIpFailure = async req => {
  try {
    await recordAttempt("login_ip", { ip: req.ip });
    return null;
  } catch (error) {
    if (error instanceof ArenaError && error.code === "LOGIN_IP_LOCKED") return error;
    throw error;
  }
};

const safeUser = user => {
  const obj = user.toObject
    ? user.toObject()
    : { ...user };

  delete obj.password;
  delete obj.tokenVersion;
  delete obj.failedLoginAttempts;
  delete obj.lockedUntil;
  delete obj.googleId;
  return obj;
};

/* ---------------------------------------------------------------------------
   ACCOUNT ENUMERATION DEFENCE
   A wrong password and an unknown email must be indistinguishable: same JSON,
   same "N attempts left" countdown, same 24 h lock after 5 tries, and the same
   bcrypt cost (an unknown email used to answer ~250 ms faster).
   Unknown identifiers are tracked in Redis by a SHA-256 of the identifier only.
--------------------------------------------------------------------------- */

const invalidCredentials = (res, attempts, lockMinutes) => {
  const attemptsLeft = Math.max(0, authConfig.maxLoginAttempts - attempts);
  return res.status(401).json({
    success: false,
    code: "INVALID_CREDENTIALS",
    message:
      attemptsLeft <= 2
        ? `Invalid credentials. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} left before your account is locked for ${lockLabel(lockMinutes)}.`
        : "Invalid credentials",
    attemptsLeft,
  });
};

let dummyHashPromise = null;
const dummyPasswordHash = () => {
  if (!dummyHashPromise) dummyHashPromise = hashPassword(randomToken());
  return dummyHashPromise;
};

const unknownLoginKey = (identifier) =>
  `tt:login-unknown:${hashToken(String(identifier).trim().toLowerCase())}`;

const unknownLoginLockedUntil = async (identifier) => {
  const until = Number(await redis.get(`${unknownLoginKey(identifier)}:lock`));
  return Number.isFinite(until) && until > Date.now() ? new Date(until) : null;
};

const recordUnknownLoginFailure = async (identifier) => {
  const key = unknownLoginKey(identifier);
  const windowSeconds = authConfig.userLockMinutes * 60;
  const attempts = Number(await redis.incr(key)) || 1;
  if (attempts === 1) await redis.expire(key, windowSeconds);

  if (attempts < authConfig.maxLoginAttempts) return { attempts, lockedUntil: null };

  const lockedUntil = minutesFromNow(authConfig.userLockMinutes);
  await redis.set(`${key}:lock`, String(lockedUntil.getTime()), { ex: windowSeconds });
  await redis.del(key);
  return { attempts, lockedUntil };
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

const sendLoginOtp = async (user, code, source) => {
  // `source: "resume"` comes from the Resume Lab login screen and gets the Resume Lab email.
  const build = source === "resume" ? resumeOtpEmail : otpEmail;
  const { subject, text, html } = build({
    purpose: "login",
    name: user.name,
    otp: code,
    minutes: authConfig.otpMinutes,
  });

  // OTP: send live and directly (never through the queue).
  await deliverMail(user.email, subject, text, html, {
    replyTo: supportEmail(),
  });
};

export const createPendingSession = async (
  user,
  req
) => UserSession.create({
  user: user._id,
  sessionId: randomUUID(),
  purpose: "login",
  state: "pending_otp",
  device: deviceInfo(req),
  ipAddress: getIp(req),
  location: locationFromRequest(req),
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

/*
  Logging in again on the same browser must not leave the old session behind as a
  phantom "active device". The browser's previous session is identified by its
  refresh cookie and, for remembered devices, by its device token. The one being
  replaced is revoked straight away.
*/
const retireReplacedSessions = async ({ req, user, session, deviceToken }) => {
  try {
    const clauses = [];

    const oldRefresh = req.cookies?.[cookieNames.refresh];
    if (typeof oldRefresh === "string") {
      clauses.push({ refreshTokenHash: hashToken(oldRefresh) });
    }
    if (deviceToken) {
      clauses.push({ deviceTokenHash: hashToken(deviceToken) });
    }

    // Abandoned ghosts: same browser fingerprint and network that has been quiet for
    // an hour is almost certainly this same device whose old login was never closed
    // (cookies cleared, storage wiped). A different device that is in use is untouched.
    if (session.device?.userAgent && session.ipAddress) {
      clauses.push({
        "device.userAgent": session.device.userAgent,
        ipAddress: session.ipAddress,
        lastActiveAt: { $lt: new Date(Date.now() - 3600000) },
      });
    }
    if (!clauses.length) return;

    const old = await UserSession.find({
      user: user._id,
      state: "active",
      purpose: "login",
      _id: { $ne: session._id },
      $or: clauses,
    }).select("sessionId").lean();

    if (!old.length) return;

    await Promise.all(old.map(o => revokeSessionAuth(o.sessionId)));

    await UserSession.updateMany(
      { _id: { $in: old.map(o => o._id) }, state: "active" },
      {
        $set: {
          state: "revoked",
          revokedAt: new Date(),
          revokedBy: user._id,
          revokeReason: "Replaced by a new login on the same device",
          refreshTokenHash: null,
          // The trust record moves to the new session.
          deviceTokenHash: null,
          isTrusted: false,
          trustedUntil: null,
        },
      }
    );
  } catch (error) {
    // Never block a login over housekeeping; the sweeper catches leftovers.
    console.error("Retire replaced sessions:", error.message);
  }
};

export const completeLogin = async ({
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
  session.refreshRotatedAt = new Date();
  session.recentRefreshHashes = [];
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

  await retireReplacedSessions({ req, user, session, deviceToken: finalDeviceToken });

  // The trust now lives on this session. Clear the copies left on older (logged-out) rows of the same
  // browser, so there is exactly one record to remove when the device is forgotten or revoked.
  if (finalDeviceToken) {
    try {
      await untrustDevices(user._id, {
        hashes: [hashToken(finalDeviceToken)],
        exceptSessionId: session.sessionId,
      });
    } catch (error) {
      console.error("Move device trust:", error.message);
    }
  }

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

    try {
      await assertNotLocked("login_ip", { ip: req.ip });
    } catch (error) {
      if (error instanceof ArenaError) return sendIpLock(res, error);
      throw error;
    }

    const user = await findLoginUser(identifier);

    if (!user) {
      // Answer exactly like a member account with a wrong password (same timing, same JSON, same
      // countdown and lock), so the login form cannot be used to test whether an email is registered.
      await verifyPassword(password, await dummyPasswordHash());

      const phantomUntil = await unknownLoginLockedUntil(identifier);
      if (phantomUntil) return lockedResponse(res, phantomUntil);

      const { attempts, lockedUntil } = await recordUnknownLoginFailure(identifier);
      const tipped = await countIpFailure(req);

      if (lockedUntil) return lockedResponse(res, lockedUntil);
      if (tipped) return sendIpLock(res, tipped);
      return invalidCredentials(res, attempts, authConfig.userLockMinutes);
    }

    if (
      user.lockedUntil &&
      user.lockedUntil > new Date()
    ) {
      return lockedResponse(res, user.lockedUntil);
    }

    if (!eligible(user)) {
      // Invite never completed: the stored password is a random value
      // nobody knows, so say what to do. Reveals only "pending setup".
      if (
        !user.isDeleted &&
        user.status === "active" &&
        user.mustChangePassword
      ) {
        return fail(
          res,
          403,
          "Your account setup is not complete. Use the password setup link emailed to you, or ask your administrator to resend it.",
          "PASSWORD_SETUP_PENDING"
        );
      }

      // Disabled / deleted: only tell someone who proves they own it.
      if (
        user.password &&
        (await verifyPassword(password, user.password))
      ) {
        return fail(
          res,
          403,
          user.isDeleted
            ? "This account has been removed. Please contact your administrator."
            : `This account is ${user.status}. Please contact your administrator.`,
          user.isDeleted ? "ACCOUNT_DELETED" : "ACCOUNT_DISABLED"
        );
      }

      return fail(res, 403, "Account unavailable");
    }

    const matched = await verifyPassword(
      password,
      user.password
    );

    if (!matched) {
      // Atomic increment so parallel guesses cannot slip past the limit.
      const updated = await User.findOneAndUpdate(
        { _id: user._id },
        { $inc: { failedLoginAttempts: 1 } },
        { new: true }
      ).select("+failedLoginAttempts");

      const attempts =
        updated?.failedLoginAttempts ?? 1;

      const shouldLock =
        attempts >= authConfig.maxLoginAttempts;

      let lockedUntil = null;

      if (shouldLock) {
        lockedUntil = minutesFromNow(lockMinutesFor(user));

        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              failedLoginAttempts: 0,
              lockedUntil,
            },
          }
        );

        await invalidateUserAuth(user._id);
      }

      await logActivity({
        req,
        user: user._id,
        action: shouldLock
          ? "ACCOUNT_LOCKED"
          : "LOGIN_FAILED",
        result: "failure",
      });

      const ipTipped = await countIpFailure(req);

      if (shouldLock) {
        return lockedResponse(res, lockedUntil);
      }

      if (ipTipped) {
        return sendIpLock(res, ipTipped);
      }

      return invalidCredentials(res, attempts, lockMinutesFor(user));
    }

    // A lock deletes the cached auth state so no session can be used
    // while locked. Once the lock has expired and the password is right,
    // rebuild it from MongoDB, otherwise the member could never sign in
    // again after the automatic unlock.
    if (
      user.lockedUntil &&
      !(await getUserAuth(user._id))
    ) {
      await provisionUserAuth(user);
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

    // Roles not in LOGIN_OTP_ROLES: password only (see LOGIN OTP above). Listed roles need the emailed
    // code on any browser that is not remembered, so one phished or reused password cannot open the
    // admin console on its own.
    if (!needsLoginOtp(user)) {
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

    if (
      typeof rawDeviceToken === "string" &&
      /^[a-f0-9]{64}$/.test(rawDeviceToken)
    ) {
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
      await sendLoginOtp(user, code, req.body?.source === "resume" ? "resume" : undefined);
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

    await sendLoginOtp(user, code, req.body?.source === "resume" ? "resume" : undefined);

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

/*
  Every refresh cookie value the browser sent. A browser can hold two cookies with the same name (an
  older copy with different attributes) and send both; cookie-parser keeps only the first, which may be
  the stale one. Trying each value means a leftover cookie can never mask the live one.
*/
const refreshCookieValues = req => {
  const name = cookieNames.refresh;
  const values = new Set();

  if (typeof req.cookies?.[name] === "string") values.add(req.cookies[name]);

  for (const part of String(req.headers?.cookie || "").split(";")) {
    const eq = part.indexOf("=");
    if (eq < 0 || part.slice(0, eq).trim() !== name) continue;
    let value = part.slice(eq + 1).trim();
    try { value = decodeURIComponent(value); } catch { /* keep raw */ }
    values.add(value);
  }

  return [...values].filter(v => /^[a-f0-9]{64}$/.test(v)).slice(0, 5);
};

export const refreshToken = async (req, res) => {
  try {
    const raws = refreshCookieValues(req);

    if (!raws.length) {
      return fail(res, 401, "Refresh token missing", "REFRESH_TOKEN_MISSING");
    }

    const hashes = raws.map(hashToken);

    /*
      RELOAD-SAFE ROTATION
      A refresh used to replace the token every time. When the response never reached the browser
      (page reloaded while the request was in flight, several quick reloads, two tabs at once) the
      browser kept an older cookie, the server rejected it and the user was signed out although the
      session was fine. Now:
        1. A token younger than REFRESH_ROTATE_MIN_SECONDS (60) is reused, not rotated, so quick
           reloads never replace it at all.
        2. Every token replaced in the last REFRESH_REUSE_GRACE_SECONDS (60) keeps working until its
           own deadline (last 50 kept), however many refreshes were lost in between. Using one
           rotates to a fresh token.
      Logout / revoke set the session to "revoked", which ends every one of these at once.
    */
    const findSession = () => {
      const now = new Date();
      return UserSession.findOne({
        state: "active",
        refreshExpiresAt: { $gt: now },
        $or: [
          { refreshTokenHash: { $in: hashes } },
          {
            recentRefreshHashes: {
              $elemMatch: { hash: { $in: hashes }, validUntil: { $gt: now } },
            },
          },
        ],
      }).select("+refreshTokenHash");
    };

    let session = await findSession();

    /*
      No cookie clearing on a failed rotation. Two tabs (or a retried request) can send the same refresh
      cookie at once: the first rotates it and receives a fresh cookie, the second lands here. Clearing
      cookies in this response would delete the winner's fresh cookie and sign the user out everywhere.
      An invalid refresh cookie is useless on its own, so leaving it in place is safe.
    */
    if (!session) {
      return fail(res, 401, "Invalid refresh token", "REFRESH_TOKEN_INVALID");
    }

    const user = await User.findById(
      session.user
    ).select("+tokenVersion");

    if (!eligible(user)) {
      clearAuthCookies(res);
      return fail(res, 403, "Account unavailable");
    }

    await assertUserAuthMatches(user);

    const issue = async (current) => {
      await registerSessionAuth(user, current);
      return res.json({
        success: true,
        token: issueAccessToken(user, current.sessionId),
        expiresIn: authConfig.accessTtl,
      });
    };

    // A few tries: a parallel request (another tab, an overlapping reload) may rotate first. Our
    // token then sits in the recent list, so re-reading and trying again succeeds.
    for (let attempt = 0; attempt < 3 && session; attempt += 1) {
      const presentedIsCurrent = hashes.includes(session.refreshTokenHash);
      const ageMs = session.refreshRotatedAt
        ? Date.now() - new Date(session.refreshRotatedAt).getTime()
        : Infinity;

      // 1. Young current token: keep it (no new cookie, nothing for a lost response to break).
      if (presentedIsCurrent && ageMs < authConfig.refreshRotateMinSeconds * 1000) {
        const touched = await UserSession.findOneAndUpdate(
          { _id: session._id, state: "active", refreshTokenHash: session.refreshTokenHash },
          { $set: { lastActiveAt: new Date() } },
          { new: true }
        );
        if (touched) return await issue(touched);
        session = await findSession();
        continue;
      }

      // 2. Rotate. Compare-and-swap on the token as read, so two parallel rotations cannot both win;
      //    the replaced token stays valid for the grace period.
      const nextToken = randomToken();
      const now = Date.now();
      const updated = await UserSession.findOneAndUpdate(
        {
          _id: session._id,
          state: "active",
          refreshTokenHash: session.refreshTokenHash,
          refreshExpiresAt: { $gt: new Date(now) },
        },
        {
          $set: {
            refreshTokenHash: hashToken(nextToken),
            refreshRotatedAt: new Date(now),
            refreshExpiresAt: daysFromNow(authConfig.refreshDays),
            lastActiveAt: new Date(now),
            expiresAt: daysFromNow(
              Math.max(
                authConfig.refreshDays,
                session.isTrusted ? authConfig.trustedDays : 0
              )
            ),
          },
          $push: {
            recentRefreshHashes: {
              $each: [{
                hash: session.refreshTokenHash,
                validUntil: new Date(now + authConfig.refreshGraceSeconds * 1000),
              }],
              $slice: -50,
            },
          },
        },
        { new: true }
      );

      if (updated) {
        setRefreshCookie(res, nextToken);
        return await issue(updated);
      }

      session = await findSession();
    }

    // Lost every race, or the session ended meanwhile. Never clear cookies here (see above).
    return fail(res, 401, "Invalid refresh token", "REFRESH_TOKEN_INVALID");
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
    clearAuthCookie(res, cookieNames.refresh);

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
