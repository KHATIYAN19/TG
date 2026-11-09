import crypto from "crypto";

import User from "../../models/User.js";
import redis from "../../utils/redis.js";

import { authConfig } from "../../config/auth.js";
import { hashPassword, verifyPassword, hashToken, secureEqual, logActivity } from "../../utils/authUtils.js";
import { provisionUserAuth, changeAccountSecurityState } from "../../services/authStateService.js";
import { createPendingSession, completeLogin } from "../authController.js";

import { ArenaError, handle } from "../../services/arena/errors.js";
import { sendSignupOtp, sendPasswordResetOtp } from "../../services/arena/mail.js";
import { enforceOtpLimit } from "../../services/arena/otpLimit.js";
import { assertNotLocked, recordAttempt, clearEmailCounter } from "../../services/authLocks.js";
import { signupSchema, verifySignupSchema, resendSignupSchema, forgotPasswordSchema, resetPasswordSchema } from "./schemas.js";

/*
  SELF SIGNUP WITH EMAIL VERIFICATION
  -----------------------------------
  Nothing is written to MongoDB until the email is verified.
  The pending registration (with a bcrypt password hash and a
  hashed OTP) lives in Redis for PENDING_TTL seconds, so abandoned
  signups never create accounts or squat on emails/mobiles.
*/

const PENDING_TTL = 15 * 60;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_RESENDS = 5;

const pendingKey = (email) => `arena:signup:${email}`;
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();
const otpHash = (email, otp) => hashToken(`${email}:${otp}:${authConfig.jwtSecret}`);

const cooldownLeft = (record) =>
  Math.max(1, Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - (record?.sentAt ?? 0))) / 1000));

const assertNotRegistered = async ({ email, mobile }) => {
  const existing = await User.findOne({ $or: [{ email }, { mobile }] })
    .select("email mobile")
    .lean();

  if (!existing) return;

  if (existing.email === email) {
    throw new ArenaError(409, "ACCOUNT_EXISTS", "An account with this email already exists. Please log in.");
  }
  throw new ArenaError(409, "MOBILE_EXISTS", "This mobile number is already registered.");
};

export const signup = handle(async (req, res) => {
  const data = signupSchema.parse(req.body);

  // 10 wrong codes / resends per 24 h locks this email and this IP for 24 h.
  const who = { email: data.email, ip: req.ip };
  await assertNotLocked("signup", who);

  await assertNotRegistered(data);

  const existing = await redis.get(pendingKey(data.email));
  if (existing && Date.now() - existing.sentAt < RESEND_COOLDOWN_MS) {
    throw new ArenaError(429, "OTP_COOLDOWN", "Please wait a minute before requesting another code.", { retryAfter: cooldownLeft(existing) });
  }

  // Submitting the form again while a code is already pending is a resend.
  if (existing) await recordAttempt("signup", who);

  // 5 codes / 24 h per IP, email and mobile. Counted only when we really send.
  await enforceOtpLimit({ ip: req.ip, email: data.email, mobile: data.mobile });

  const otp = generateOtp();

  await redis.set(
    pendingKey(data.email),
    {
      name: data.name,
      email: data.email,
      countryCode: data.countryCode,
      mobile: data.mobile,
      passwordHash: await hashPassword(data.password),
      otpHash: otpHash(data.email, otp),
      attempts: 0,
      resends: existing?.resends ?? 0,
      sentAt: Date.now(),
    },
    { ex: PENDING_TTL }
  );

  await sendSignupOtp(data.email, data.name, otp, Math.round(PENDING_TTL / 60));

  res.status(201).json({
    success: true,
    message: "We sent a 6-digit code to your email.",
    expiresInSeconds: PENDING_TTL,
    resendInSeconds: RESEND_COOLDOWN_MS / 1000,
  });
}, "Unable to start signup");

export const resendSignupOtp = handle(async (req, res) => {
  const { email } = resendSignupSchema.parse(req.body);

  const who = { email, ip: req.ip };
  await assertNotLocked("signup", who);

  const pending = await redis.get(pendingKey(email));
  if (!pending) {
    await recordAttempt("signup", who);
    throw new ArenaError(404, "SIGNUP_EXPIRED", "Your signup session expired. Please start again.");
  }

  // Too-early clicks are answered with the timer and are not counted.
  if (Date.now() - pending.sentAt < RESEND_COOLDOWN_MS) {
    throw new ArenaError(429, "OTP_COOLDOWN", "Please wait a minute before requesting another code.", { retryAfter: cooldownLeft(pending) });
  }

  await recordAttempt("signup", who);
  if (pending.resends >= MAX_RESENDS) {
    await redis.del(pendingKey(email));
    throw new ArenaError(429, "OTP_RESEND_LIMIT", "Too many codes requested. Please start again.");
  }

  await enforceOtpLimit({ ip: req.ip, email, mobile: pending.mobile });

  const otp = generateOtp();
  await redis.set(
    pendingKey(email),
    { ...pending, otpHash: otpHash(email, otp), attempts: 0, resends: pending.resends + 1, sentAt: Date.now() },
    { ex: PENDING_TTL }
  );

  await sendSignupOtp(email, pending.name, otp, Math.round(PENDING_TTL / 60));

  res.json({ success: true, message: "A new code is on its way.", resendInSeconds: RESEND_COOLDOWN_MS / 1000 });
}, "Unable to resend code");

export const verifySignup = handle(async (req, res) => {
  const { email, otp } = verifySignupSchema.parse(req.body);

  const who = { email, ip: req.ip };
  await assertNotLocked("signup", who);

  // Every failed check below counts toward the 24-hour lock (10 per day).
  const pending = await redis.get(pendingKey(email));
  if (!pending) {
    await recordAttempt("signup", who);
    throw new ArenaError(404, "SIGNUP_EXPIRED", "Your code expired. Please sign up again.");
  }

  if (pending.attempts >= authConfig.maxOtpAttempts) {
    await redis.del(pendingKey(email));
    await recordAttempt("signup", who);
    throw new ArenaError(429, "OTP_ATTEMPTS", "Too many wrong attempts. Please sign up again.");
  }

  if (!secureEqual(otpHash(email, otp), pending.otpHash)) {
    await redis.set(pendingKey(email), { ...pending, attempts: pending.attempts + 1 }, { ex: PENDING_TTL });
    await recordAttempt("signup", who);
    throw new ArenaError(400, "OTP_INVALID", "That code isn't correct.");
  }

  // Claim the pending record so a replayed OTP can't create two accounts.
  const claimed = await redis.del(pendingKey(email));
  if (!claimed) {
    throw new ArenaError(409, "SIGNUP_ALREADY_USED", "This code was already used.");
  }

  let created;
  try {
    created = await User.create({
      name: pending.name,
      email: pending.email,
      countryCode: pending.countryCode || "+91", // codes sent before this change had no country code
      mobile: pending.mobile,
      password: pending.passwordHash, // already bcrypt-hashed
      role: "normal",
      status: "active",
      mustChangePassword: false,
      passwordChangedAt: new Date(),
      emailVerifiedAt: new Date(),
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ArenaError(409, "ACCOUNT_EXISTS", "An account with these details already exists. Please log in.");
    }
    throw error;
  }

  await clearEmailCounter("signup", email);

  const user = await User.findById(created._id).select("+tokenVersion");
  await provisionUserAuth(user);

  await logActivity({
    req,
    user: user._id,
    actor: user._id,
    action: "SIGNUP_EMAIL_VERIFIED",
    metadata: { source: "prep-buddy-arena" },
  });

  // Email ownership was just proven, so skip the login OTP and
  // sign the member in exactly like a normal login would.
  const session = await createPendingSession(user, req);
  return completeLogin({ req, res, user, session });
}, "Unable to verify signup");

/*
  FORGOT PASSWORD
  ---------------
  1. POST /password/forgot  { email }
       Always answers the same way whether or not the email has an account
       (no account enumeration). The code is only emailed when it does.
       Limits: 60 s between codes per email, 5 codes / 24 h per IP and per
       email (separate bucket from signup), plus a per-IP route limiter.
  2. POST /password/reset   { email, otp, password, confirmPassword }
       5 wrong codes burns the code. On success the password changes, every
       session is revoked, and any wrong-password lock is lifted: the member
       just proved they own the mailbox.
  Only ordinary member accounts can use this. Admin, affiliate and employee
  passwords are reset by an admin.
*/

const RESET_TTL = 10 * 60;
const resetKey = (email) => `arena:reset:${email}`;
const RESET_ROLES = new Set(["normal"]);
const GENERIC_SENT = "If an account exists for this email, we've sent a 6-digit code to it.";
const BAD_CODE = "That code is invalid or has expired. Request a new one.";

export const forgotPassword = handle(async (req, res) => {
  const { email } = forgotPasswordSchema.parse(req.body);

  // 5 wrong codes / resends per 24 h locks this email and this IP for 24 h.
  const who = { email, ip: req.ip };
  await assertNotLocked("reset", who);

  const existing = await redis.get(resetKey(email));
  if (existing && Date.now() - existing.sentAt < RESEND_COOLDOWN_MS) {
    throw new ArenaError(429, "OTP_COOLDOWN", "Please wait a minute before requesting another code.", {
      retryAfter: cooldownLeft(existing),
    });
  }

  // A code already exists for this email, so this request is a RESEND (counted).
  if (existing) await recordAttempt("reset", who);

  // 5 codes / 24 h per IP and per email, counted whether or not the account exists.
  await enforceOtpLimit({ ip: req.ip, email, scope: "reset" });

  const user = await User.findOne({ email, isDeleted: { $ne: true }, status: "active" }).select("name email role").lean();
  const eligible = Boolean(user && RESET_ROLES.has(user.role));

  const otp = generateOtp();

  // A record is stored even for unknown emails so the cooldown, timing and
  // response are identical either way. That record can never be redeemed.
  await redis.set(
    resetKey(email),
    {
      userId: eligible ? String(user._id) : null,
      otpHash: eligible ? otpHash(`reset:${email}`, otp) : null,
      attempts: 0,
      sentAt: Date.now(),
    },
    { ex: RESET_TTL }
  );

  if (eligible) {
    // Not awaited: mail latency must not reveal that the account exists.
    void sendPasswordResetOtp(user.email, user.name, otp, Math.round(RESET_TTL / 60));
  }

  res.json({
    success: true,
    message: GENERIC_SENT,
    expiresInSeconds: RESET_TTL,
    resendInSeconds: RESEND_COOLDOWN_MS / 1000,
  });
}, "Unable to send the code");

export const resetPassword = handle(async (req, res) => {
  const { email, otp, password } = resetPasswordSchema.parse(req.body);

  const who = { email, ip: req.ip };
  await assertNotLocked("reset", who);

  // Every failed code check counts toward the 24-hour lock (5 per day).
  const record = await redis.get(resetKey(email));
  if (!record || !record.userId) {
    await recordAttempt("reset", who);
    throw new ArenaError(400, "OTP_INVALID", BAD_CODE);
  }

  if (record.attempts >= authConfig.maxOtpAttempts) {
    await redis.del(resetKey(email));
    await recordAttempt("reset", who);
    throw new ArenaError(429, "OTP_ATTEMPTS", "Too many wrong attempts. Please request a new code.");
  }

  if (!secureEqual(otpHash(`reset:${email}`, otp), record.otpHash)) {
    await redis.set(resetKey(email), { ...record, attempts: record.attempts + 1 }, { ex: RESET_TTL });
    await recordAttempt("reset", who);
    throw new ArenaError(400, "OTP_INVALID", "That code isn't correct.", {
      attemptsLeft: Math.max(0, authConfig.maxOtpAttempts - record.attempts - 1),
    });
  }

  const user = await User.findById(record.userId).select("+password");
  if (!user || user.isDeleted || user.status !== "active" || user.email !== email) {
    await redis.del(resetKey(email));
    throw new ArenaError(400, "OTP_INVALID", BAD_CODE);
  }

  if (await verifyPassword(password, user.password)) {
    // The code stays valid so they can simply pick another password.
    throw new ArenaError(400, "PASSWORD_REUSED", "Choose a password different from your current one.");
  }

  // Claim the code so a replay (or two parallel requests) can only win once.
  const claimed = await redis.del(resetKey(email));
  if (!claimed) {
    throw new ArenaError(400, "OTP_INVALID", BAD_CODE);
  }

  await changeAccountSecurityState({
    userId: user._id,
    actorId: user._id,
    reason: "Password reset",
    update: {
      password: await hashPassword(password),
      passwordChangedAt: new Date(),
      mustChangePassword: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  await clearEmailCounter("reset", email);

  await logActivity({
    req,
    user: user._id,
    actor: user._id,
    action: "PASSWORD_RESET_VIA_EMAIL_OTP",
    metadata: { source: "prep-buddy-arena" },
  });

  res.json({ success: true, message: "Your password was changed. Please log in with it." });
}, "Unable to reset password");
