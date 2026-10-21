
import redis from "../utils/redis.js";

import User from "../models/User.js";
import UserSession from "../models/UserSession.js";

export const authKeys = {
  user: id => `auth:user:${String(id)}`,
  session: id => `auth:session:${id}`,
};

export const toAuthState = user => ({
  role: user.role,
  status: user.status,
  tokenVersion: user.tokenVersion,
  isDeleted: user.isDeleted === true,
  mustChangePassword: user.mustChangePassword === true,
  lockedUntil: user.lockedUntil
    ? new Date(user.lockedUntil).getTime()
    : null,
});

const requireVersion = user => {
  if (!Number.isSafeInteger(user.tokenVersion)) {
    throw new Error(
      "User must be loaded with +tokenVersion"
    );
  }
};

// Populate authorization state after admin creates a user.
// Do not use this as a generic fallback on missing cache keys.
export const provisionUserAuth = async user => {
  requireVersion(user);

  await redis.set(
    authKeys.user(user._id),
    toAuthState(user)
  );
};

export const getUserAuth = async userId =>
  redis.get(authKeys.user(userId));

export const assertUserAuthMatches = async user => {
  requireVersion(user);

  const current = await getUserAuth(user._id);

  if (
    !current ||
    current.tokenVersion !== user.tokenVersion ||
    current.role !== user.role ||
    current.status !== user.status ||
    current.isDeleted !== (user.isDeleted === true) ||
    current.mustChangePassword !==
      (user.mustChangePassword === true)
  ) {
    throw new Error("AUTH_STATE_NOT_READY");
  }

  if (
    user.status !== "active" ||
    user.isDeleted ||
    user.mustChangePassword
  ) {
    throw new Error("ACCOUNT_NOT_ACTIVE");
  }

  return current;
};

// Keep session TTL limited to the refresh expiry.
export const sessionPayload = (user, session) => ({
  userId: String(user._id),
  tokenVersion: user.tokenVersion,
  state: "active",
  expiresAt: new Date(
    session.refreshExpiresAt
  ).getTime(),
});

export const registerSessionAuth = async (
  user,
  session
) => {
  await assertUserAuthMatches(user);

  if (
    session.state !== "active" ||
    !session.refreshExpiresAt ||
    session.refreshExpiresAt <= new Date()
  ) {
    throw new Error("SESSION_NOT_ACTIVE");
  }

  const ttlSeconds = Math.ceil(
    (
      new Date(session.refreshExpiresAt).getTime() -
      Date.now()
    ) / 1000
  );

  if (ttlSeconds <= 0) {
    throw new Error("SESSION_EXPIRED");
  }

  await redis.set(
    authKeys.session(session.sessionId),
    sessionPayload(user, session),
    { ex: ttlSeconds }
  );

  // Verify user state again before issuing a JWT.
  try {
    await assertUserAuthMatches(user);
  } catch (error) {
    await redis.del(
      authKeys.session(session.sessionId)
    );
    throw error;
  }
};

export const revokeSessionAuth = async sessionId => {
  await redis.del(authKeys.session(sessionId));
};

// Synchronize one user's state from MongoDB.
export const syncUserAuth = async userId => {
  const user = await User.findById(userId)
    .select("+tokenVersion");

  if (!user) {
    await redis.del(authKeys.user(userId));
    return null;
  }

  requireVersion(user);

  await provisionUserAuth(user);
  return user;
};

// Used before high-risk admin changes to prevent
// existing authorization state being treated as valid.
export const invalidateUserAuth = async userId => {
  await redis.del(authKeys.user(userId));
};

// Revoke all Redis sessions belonging to a user.
// Avoid Redis KEYS or SCAN across the entire database;
// query the user's session records instead.
export const revokeAllRedisSessions = async userId => {
  const sessions = await UserSession.find({
    user: userId,
    state: "active",
  }).select("sessionId").lean();

  if (!sessions.length) return 0;

  const keys = sessions.map(session =>
    authKeys.session(session.sessionId)
  );

  // Chunk commands to avoid large requests.
  for (let i = 0; i < keys.length; i += 100) {
    await redis.del(...keys.slice(i, i + 100));
  }

  return keys.length;
};

/*
  HIGH-SECURITY OPERATION

  Blocks Redis authorization before writing to MongoDB,
  then increments tokenVersion and revokes sessions.

  Missing Redis keys are rejected by auth middleware.
*/
export const changeAccountSecurityState = async ({
  userId,
  actorId,
  update = {},
  reason = "Administrative update",
}) => {
  await invalidateUserAuth(userId);

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: update,
      $inc: { tokenVersion: 1 },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("+tokenVersion");

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  await revokeAllRedisSessions(userId);

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
        challengeHash: null,
      },
    }
  );

  await provisionUserAuth(user);

  return user;
};
