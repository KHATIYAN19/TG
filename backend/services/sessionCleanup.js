import UserSession from "../models/UserSession.js";

/*
  Keeps the device list honest. A device is only "active" while its session is
  state=active AND its refresh token has not expired. Everything else is removed:

    1. active but refresh token expired        -> marked revoked ("Session expired")
    2. revoked / abandoned OTP / setup         -> deleted
       ...unless it is a remembered ("trusted") device that is still within its
       trust window: that row is the only record that lets the owner skip the
       OTP next time, so it is kept (and never shown as an active device).

  Logout, admin/user revoke, password change and logout-all already mark sessions
  revoked immediately; this finishes the job by deleting them. MongoDB's TTL index
  on expiresAt is the final safety net.
*/
export const sweepSessions = async (userId = null) => {
  const now = new Date();
  const scope = userId ? { user: userId } : {};

  const expired = await UserSession.updateMany(
    { ...scope, state: "active", refreshExpiresAt: { $lte: now } },
    {
      $set: {
        state: "revoked",
        revokedAt: now,
        revokeReason: "Session expired",
        refreshTokenHash: null,
      },
    }
  );

  const removed = await UserSession.deleteMany({
    ...scope,
    state: { $ne: "active" },
    $or: [
      { isTrusted: { $ne: true } },
      { trustedUntil: null },
      { trustedUntil: { $lte: now } },
    ],
  });

  return { expired: expired.modifiedCount, removed: removed.deletedCount };
};
