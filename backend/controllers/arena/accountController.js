import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaMatch from "../../models/arena/ArenaMatch.js";
import User from "../../models/User.js";
import { getArenaSettings, isAccountDeletionEnabled } from "../../models/arena/ArenaSettings.js";
import redis from "../../utils/redis.js";

import { clearAuthCookies, logActivity, verifyPassword } from "../../utils/authUtils.js";
import { ArenaError, handle } from "../../services/arena/errors.js";
import { purgeUser } from "../../services/arena/purge.js";
import { deleteAccountSchema } from "./schemas.js";

/*
  DELETE MY ACCOUNT  (member, from Settings)
  ------------------------------------------
  Rules, all enforced here on the server:
    - only ordinary member accounts (admin / employee / affiliate accounts are
      managed by the team);
    - the member must re-enter their PASSWORD, so a stolen or left-open session
      can't wipe an account;
    - an ACTIVE partnership must be ended first (nothing is unmatched for them);
    - no payment may be mid-flight (a checkout being paid, or a refund running);
    - NO REFUND: whatever was paid stays paid.
  Then every arena record is deleted for good and the account is emptied
  (see purgeUser "anonymize"). The same email and mobile can sign up again.
*/

const MAX_WRONG = 5;
const WRONG_WINDOW_S = 15 * 60;
const PAYMENT_GRACE_MS = 30 * 60 * 1000;
const wrongKey = (userId) => `arena:delete-account:wrong:${userId}`;

export const deleteMyAccount = handle(async (req, res) => {
  if (!isAccountDeletionEnabled(await getArenaSettings({ fresh: true }))) {
    throw new ArenaError(403, "FEATURE_DISABLED", "Account deletion is not available right now. Please contact support.");
  }
  const { password } = deleteAccountSchema.parse(req.body);

  const user = await User.findById(req.user.id).select("+password role isDeleted").lean();
  if (!user || user.isDeleted) throw new ArenaError(404, "NOT_FOUND", "Account not found");

  if (user.role !== "normal") {
    throw new ArenaError(403, "PROTECTED_ACCOUNT", "This account can't be deleted here. Please contact the Target Trek team.");
  }

  // 1) A live partnership has to be ended by the member first.
  const live = await ArenaMatch.exists({ users: user._id, status: "active" });
  if (live) {
    throw new ArenaError(
      409,
      "ACTIVE_MATCH",
      "You're currently matched. End your partnership from the \"My buddy\" tab first, then you can delete your account."
    );
  }

  // 2) Never delete while money is in flight.
  const inFlight = await ArenaEntry.exists({
    user: user._id,
    $or: [
      { status: "cancelling" },
      { status: "pending_payment", createdAt: { $gt: new Date(Date.now() - PAYMENT_GRACE_MS) } },
    ],
  });
  if (inFlight) {
    throw new ArenaError(409, "PAYMENT_IN_PROGRESS", "A payment or refund is still being processed. Please try again in a few minutes.");
  }

  // 3) Password check, with a per-account limit on wrong guesses.
  const wrong = Number((await redis.get(wrongKey(user._id))) || 0);
  if (wrong >= MAX_WRONG) {
    throw new ArenaError(429, "TOO_MANY_ATTEMPTS", "Too many wrong passwords. Please try again in 15 minutes.", { retryAfter: WRONG_WINDOW_S });
  }

  if (!(await verifyPassword(password, user.password))) {
    await redis.set(wrongKey(user._id), wrong + 1, { ex: WRONG_WINDOW_S });
    throw new ArenaError(403, "WRONG_PASSWORD", "That password isn't correct.", { attemptsLeft: Math.max(0, MAX_WRONG - wrong - 1) });
  }

  await redis.del(wrongKey(user._id));

  const { counts } = await purgeUser(user._id, { mode: "anonymize", actorId: user._id });

  await logActivity({
    req,
    user: user._id,
    actor: user._id,
    action: "ACCOUNT_SELF_DELETED",
    metadata: { source: "prep-buddy-arena", ...counts },
  });

  clearAuthCookies(res);

  res.json({
    success: true,
    message: "Your account has been deleted. You can sign up again any time with the same details.",
  });
}, "Unable to delete your account");
