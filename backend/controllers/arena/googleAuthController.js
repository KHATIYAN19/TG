import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";

import User from "../../models/User.js";
import redis from "../../utils/redis.js";

import { hashPassword, logActivity } from "../../utils/authUtils.js";
import { provisionUserAuth } from "../../services/authStateService.js";
import { createPendingSession, completeLogin } from "../authController.js";

import { ArenaError, handle } from "../../services/arena/errors.js";
import { countryCodeField, mobileField, checkMobile } from "./schemas.js";

/*
  GOOGLE SIGN-IN / SIGN-UP
  ------------------------
  The browser gets a Google ID token (JWT) from Google Identity Services and
  sends it here. We verify its signature, audience and expiry with Google's
  public keys; nothing the client says about the user is trusted except what
  is inside that verified token.

  Google and email+password are two equal ways into the SAME account:
    - Known Google id            -> log in.
    - Known email, no Google yet -> link Google to that account, log in.
    - Unknown email              -> ask for a mobile number (the rest of the
                                    platform requires one), then create it.
  A Google-created account gets a random, unguessable password hash, so the
  member can later set a real password with "Forgot password" and use both.
  Only ordinary member accounts can use Google (like password reset), so a
  privileged admin/affiliate/employee account can never be taken over this way.
*/

const MEMBER_ROLES = new Set(["normal"]);
const PENDING_TTL = 15 * 60;
const pendingKey = (token) => `arena:google:${token}`;

let client = null;
const googleClient = () => {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) {
    throw new ArenaError(503, "GOOGLE_DISABLED", "Google sign-in is not available right now.");
  }
  client ||= new OAuth2Client(id);
  return client;
};

const credentialSchema = z.object({
  credential: z.string().min(20).max(4096),
});

const completeSchema = z
  .object({
    signupToken: z.string().regex(/^[a-f0-9]{48}$/, "Invalid signup session"),
    countryCode: countryCodeField,
    mobile: mobileField,
    name: z.string().trim().min(2, "Enter your name").max(80).optional(),
  })
  .superRefine(checkMobile);

const verifyGoogleToken = async (credential) => {
  let payload;
  try {
    const ticket = await googleClient().verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (error) {
    if (error instanceof ArenaError) throw error;
    throw new ArenaError(401, "GOOGLE_TOKEN_INVALID", "Google sign-in failed. Please try again.");
  }

  if (!payload?.sub || !payload.email || payload.email_verified !== true) {
    throw new ArenaError(401, "GOOGLE_EMAIL_UNVERIFIED", "Your Google email address is not verified.");
  }

  return {
    sub: payload.sub,
    email: payload.email.trim().toLowerCase(),
    name: (payload.name || payload.email.split("@")[0]).trim().slice(0, 80),
  };
};

const AUTH_FIELDS = "+tokenVersion +googleId";

const assertCanLogin = (user) => {
  if (user.isDeleted || user.status !== "active") {
    throw new ArenaError(403, "ACCOUNT_DISABLED", "This account is not active. Please contact support.");
  }
  if (!MEMBER_ROLES.has(user.role)) {
    throw new ArenaError(403, "GOOGLE_NOT_ALLOWED", "This account type must log in with email and password.");
  }
  if (user.mustChangePassword) {
    throw new ArenaError(403, "PASSWORD_SETUP_PENDING", "Finish setting your password from the link we emailed you, then log in.");
  }
};

const signIn = async (req, res, user) => {
  const session = await createPendingSession(user, req);
  // Google already proved who this is, so no login OTP (same as a verified signup).
  return completeLogin({ req, res, user, session });
};

/* POST /google  { credential } */
export const googleAuth = handle(async (req, res) => {
  const { credential } = credentialSchema.parse(req.body);
  const g = await verifyGoogleToken(credential);

  // 1. Already linked to a Google account.
  let user = await User.findOne({ googleId: g.sub }).select(AUTH_FIELDS);

  // 2. Same email registered with a password: link, so both methods work.
  if (!user) {
    user = await User.findOne({ email: g.email }).select(AUTH_FIELDS);

    if (user) {
      assertCanLogin(user);

      if (user.googleId && user.googleId !== g.sub) {
        throw new ArenaError(409, "GOOGLE_MISMATCH", "A different Google account is already linked to this email.");
      }

      const set = { googleId: g.sub, googleLinkedAt: new Date() };
      if (!user.emailVerifiedAt) set.emailVerifiedAt = new Date();

      try {
        await User.updateOne({ _id: user._id }, { $set: set });
      } catch (error) {
        if (error?.code === 11000) {
          throw new ArenaError(409, "GOOGLE_MISMATCH", "This Google account is already linked to another user.");
        }
        throw error;
      }

      user.googleId = set.googleId;
      await logActivity({
        req, user: user._id, actor: user._id,
        action: "GOOGLE_LINKED",
        metadata: { source: "prep-buddy-arena" },
      });
    }
  }

  if (user) {
    assertCanLogin(user);
    return signIn(req, res, user);
  }

  // 3. Brand-new person: collect the mobile number before creating the account.
  const signupToken = crypto.randomBytes(24).toString("hex");
  await redis.set(
    pendingKey(signupToken),
    { sub: g.sub, email: g.email, name: g.name },
    { ex: PENDING_TTL }
  );

  res.json({
    success: true,
    needsMobile: true,
    signupToken,
    email: g.email,
    name: g.name,
    expiresInSeconds: PENDING_TTL,
  });
}, "Unable to sign in with Google");

/* POST /google/complete  { signupToken, mobile, name? } */
export const googleComplete = handle(async (req, res) => {
  const { signupToken, countryCode, mobile, name } = completeSchema.parse(req.body);

  const pending = await redis.get(pendingKey(signupToken));
  if (!pending) {
    throw new ArenaError(404, "SIGNUP_EXPIRED", "Your sign-up session expired. Please continue with Google again.");
  }

  const existing = await User.findOne({ $or: [{ email: pending.email }, { mobile }] })
    .select("email")
    .lean();
  if (existing) {
    // Token stays valid when only the mobile clashes, so they can fix it.
    if (existing.email === pending.email) {
      await redis.del(pendingKey(signupToken));
      throw new ArenaError(409, "ACCOUNT_EXISTS", "An account with this email already exists. Please continue with Google again.");
    }
    throw new ArenaError(409, "MOBILE_EXISTS", "This mobile number is already registered.");
  }

  // Claim the token so a replay can't create two accounts.
  const claimed = await redis.del(pendingKey(signupToken));
  if (!claimed) {
    throw new ArenaError(409, "SIGNUP_ALREADY_USED", "This sign-up was already completed.");
  }

  let created;
  try {
    created = await User.create({
      name: name || pending.name,
      email: pending.email,
      countryCode,
      mobile,
      // Random, unguessable. The member can set a real one via "Forgot password".
      password: await hashPassword(crypto.randomBytes(32).toString("hex")),
      role: "normal",
      status: "active",
      mustChangePassword: false,
      passwordChangedAt: new Date(),
      emailVerifiedAt: new Date(),
      googleId: pending.sub,
      googleLinkedAt: new Date(),
    });
  } catch (error) {
    if (error?.code === 11000) {
      throw new ArenaError(409, "ACCOUNT_EXISTS", "An account with these details already exists. Please log in.");
    }
    throw error;
  }

  const user = await User.findById(created._id).select(AUTH_FIELDS);
  await provisionUserAuth(user);

  await logActivity({
    req, user: user._id, actor: user._id,
    action: "SIGNUP_GOOGLE",
    metadata: { source: "prep-buddy-arena" },
  });

  return signIn(req, res, user);
}, "Unable to finish Google sign-up");
