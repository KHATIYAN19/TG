import mongoose from "mongoose";

import User from "../../models/User.js";
import UserSession from "../../models/UserSession.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";
import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaRequest from "../../models/arena/ArenaRequest.js";
import ArenaMatch from "../../models/arena/ArenaMatch.js";
import ArenaMessage from "../../models/arena/ArenaMessage.js";
import ArenaBlock from "../../models/arena/ArenaBlock.js";
import ArenaReport from "../../models/arena/ArenaReport.js";
import ArenaBugReport from "../../models/arena/ArenaBugReport.js";
import ArenaCoupon from "../../models/arena/ArenaCoupon.js";
import ArenaCouponRedemption from "../../models/arena/ArenaCouponRedemption.js";

import { hashPassword, randomToken } from "../../utils/authUtils.js";
import { invalidateUserAuth, revokeAllRedisSessions } from "../authStateService.js";
import { ArenaError } from "./errors.js";
import { emitToUser, disconnectUser } from "./hub.js";
import { endMatch } from "./matchService.js";
import { runInTransaction } from "./transaction.js";

/*
  PERMANENT DELETION (admin only)
  -------------------------------
  Hard deletes. Nothing here can be undone, and nothing here talks to the
  payment gateway: deleting a payment record does NOT refund the member.
  Every function returns counts so the audit log says exactly what went.
*/

const opts = (session) => (session ? { session } : {});
const ids = (list) => list.map((x) => x._id ?? x);

/* Give back coupon uses held by these redemptions, then delete them. */
const dropRedemptions = async (filter, session) => {
  const rows = await ArenaCouponRedemption.find(filter).session(session || null).lean();
  for (const r of rows) {
    if (r.status !== "released") {
      await ArenaCoupon.updateOne({ _id: r.coupon, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }, opts(session));
    }
  }
  const out = await ArenaCouponRedemption.deleteMany(filter, opts(session));
  return out.deletedCount;
};

/* ------------------------------------------------------------ chat */
export const purgeChat = async (matchId) => {
  const match = await ArenaMatch.findById(matchId).select("users status").lean();
  if (!match) throw new ArenaError(404, "NOT_FOUND", "Match not found");

  const out = await ArenaMessage.deleteMany({ match: match._id });

  // Open chat windows empty themselves right away.
  for (const uid of match.users) emitToUser(uid, { type: "chat_cleared", matchId: String(match._id) });

  return { messages: out.deletedCount, match };
};

export const purgeMessage = async (messageId) => {
  const message = await ArenaMessage.findByIdAndDelete(messageId).lean();
  if (!message) throw new ArenaError(404, "NOT_FOUND", "Message not found");

  const match = await ArenaMatch.findById(message.match).select("users").lean();
  for (const uid of match?.users ?? []) emitToUser(uid, { type: "message_removed", id: String(message._id) });

  return message;
};

/* --------------------------------------------------------- request */
export const purgeRequest = async (requestId) => {
  const request = await ArenaRequest.findByIdAndDelete(requestId).lean();
  if (!request) throw new ArenaError(404, "NOT_FOUND", "Request not found");

  // Their lists refresh.
  emitToUser(request.toUser, { type: "request_updated" });
  emitToUser(request.fromUser, { type: "request_updated" });

  return request;
};

/* ----------------------------------------------------------- match */
/* An active match is dissolved first (members go back to the arena or lose the
   used match, exactly like an admin dissolve), then all of its data is deleted. */
export const purgeMatch = async (matchId, { restoreProfileIds = [] } = {}) => {
  let match = await ArenaMatch.findById(matchId).lean();
  if (!match) throw new ArenaError(404, "NOT_FOUND", "Match not found");

  if (match.status === "active") {
    // Deleting is the admin's decision, not the members' fault: by default
    // the partnership doesn't count against either of them.
    const restore = restoreProfileIds.length ? restoreProfileIds : match.profiles.map(String);
    await endMatch({ matchId, byUserId: null, reason: "admin_dissolved", restoreProfileIds: restore });
    match = await ArenaMatch.findById(matchId).lean();
  }

  const counts = await runInTransaction(async (session) => {
    const messages = await ArenaMessage.deleteMany({ match: match._id }, opts(session));
    await ArenaRequest.updateMany({ match: match._id }, { $set: { match: null } }, opts(session));
    await ArenaEntry.updateMany({ match: match._id }, { $set: { match: null } }, opts(session));
    await ArenaProfile.updateMany({ match: match._id }, { $set: { match: null } }, opts(session));
    await ArenaMatch.deleteOne({ _id: match._id }, opts(session));
    return { messages: messages.deletedCount };
  });

  return { ...counts, match };
};

/* --------------------------------------------------------- payment */
/* Deletes one entry (payment record). Refuses while it is powering a live match. */
export const purgeEntry = async (entryId) => {
  const entry = await ArenaEntry.findById(entryId).lean();
  if (!entry) throw new ArenaError(404, "NOT_FOUND", "Payment not found");

  if (entry.status === "in_match" && entry.match) {
    const live = await ArenaMatch.exists({ _id: entry.match, status: "active" });
    if (live) {
      throw new ArenaError(409, "ACTIVE_MATCH", "This payment is in use by an active match. Dissolve or delete that match first.");
    }
  }

  const counts = await runInTransaction(async (session) => {
    const redemptions = await dropRedemptions({ entry: entry._id }, session);
    await ArenaEntry.deleteOne({ _id: entry._id }, opts(session));

    // The profile no longer points at a payment that doesn't exist.
    await ArenaProfile.updateOne({ _id: entry.profile, entry: entry._id }, { $set: { entry: null } }, opts(session));

    // No other usable payment? An active profile would be "free", so send it back to payment.
    const stillPaid = await ArenaEntry.exists({ user: entry.user, status: { $in: ["paid", "in_match"] } }).session(session || null);
    let profileReset = false;
    if (!stillPaid) {
      const reset = await ArenaProfile.updateOne(
        { user: entry.user, status: "active" },
        { $set: { status: "draft", entry: null } },
        opts(session)
      );
      profileReset = reset.modifiedCount > 0;
    }

    return { redemptions, profileReset };
  });

  emitToUser(entry.user, { type: "entry_updated" });
  return { entry, ...counts };
};

/* ---------------------------------------------------------- member */
/*
  Deletes a member's arena data AND their account.

  mode "hard"      (admin)  the User document is removed from the database.
  mode "anonymize" (member deleting their own account) the User row is kept
                   only as an empty shell (name, email, mobile and password
                   wiped, marked deleted) so records that point at it elsewhere
                   on the site (orders, invoices) stay intact. Email and mobile
                   are FREED, so the person can sign up again with the same details.
*/
export const purgeUser = async (userId, { mode = "hard", actorId = null } = {}) => {
  const user = await User.findById(userId).select("name email role").lean();
  if (!user) throw new ArenaError(404, "NOT_FOUND", "User not found");

  // Hash outside the transaction (slow); the old password hash is replaced
  // with a random one nobody knows.
  const lockedPassword = mode === "anonymize" ? await hashPassword(randomToken()) : null;

  const profiles = await ArenaProfile.find({ user: user._id }).select("_id alias").lean();
  const profileIds = ids(profiles);

  // 1) A live partnership ends first so the buddy is restored and told.
  const live = await ArenaMatch.findOne({ users: user._id, status: "active" }).lean();
  if (live) {
    const buddyProfileId = live.profiles.find((pid) => !profileIds.some((mine) => String(mine) === String(pid)));
    await endMatch({
      matchId: live._id,
      byUserId: null,
      reason: "admin_dissolved",
      restoreProfileIds: buddyProfileId ? [String(buddyProfileId)] : [],
    });
  }

  // 2) Everything else, atomically.
  const counts = await runInTransaction(async (session) => {
    const matches = await ArenaMatch.find({ users: user._id }).select("_id").session(session || null).lean();
    const matchIds = ids(matches);

    const messages = await ArenaMessage.deleteMany({ $or: [{ match: { $in: matchIds } }, { sender: user._id }] }, opts(session));
    await ArenaRequest.updateMany({ match: { $in: matchIds } }, { $set: { match: null } }, opts(session));
    const requests = await ArenaRequest.deleteMany({ $or: [{ fromUser: user._id }, { toUser: user._id }] }, opts(session));
    const matchesDeleted = await ArenaMatch.deleteMany({ _id: { $in: matchIds } }, opts(session));
    const blocks = await ArenaBlock.deleteMany({ $or: [{ blocker: user._id }, { blocked: user._id }] }, opts(session));
    const reports = await ArenaReport.deleteMany({ $or: [{ reporter: user._id }, { reportedProfile: { $in: profileIds } }] }, opts(session));
    const bugs = await ArenaBugReport.deleteMany({ user: user._id }, opts(session));
    const redemptions = await dropRedemptions({ user: user._id }, session);
    const entries = await ArenaEntry.deleteMany({ user: user._id }, opts(session));
    const profilesDeleted = await ArenaProfile.deleteMany({ user: user._id }, opts(session));
    const sessions = await UserSession.deleteMany({ user: user._id }, opts(session));

    if (mode === "anonymize") {
      await User.collection.updateOne(
        { _id: user._id },
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            deletedBy: actorId ? new mongoose.Types.ObjectId(String(actorId)) : null,
            status: "inactive",
            name: "Deleted user",
            email: `deleted-${user._id}@deleted.invalid`,
            password: lockedPassword,
            passwordChangedAt: new Date(),
            emailVerifiedAt: null,
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
          $unset: { mobile: "" },
          $inc: { tokenVersion: 1 },
        },
        opts(session)
      );
    } else {
      await User.deleteOne({ _id: user._id }, opts(session));
    }

    return {
      messages: messages.deletedCount,
      requests: requests.deletedCount,
      matches: matchesDeleted.deletedCount,
      blocks: blocks.deletedCount,
      reports: reports.deletedCount,
      bugs: bugs.deletedCount,
      redemptions,
      payments: entries.deletedCount,
      profiles: profilesDeleted.deletedCount,
      sessions: sessions.deletedCount,
    };
  });

  // 3) Cut off anything still open for this person.
  await revokeAllRedisSessions(user._id).catch(() => {});
  await invalidateUserAuth(user._id).catch(() => {});
  disconnectUser(user._id, 4003, "Account deleted");

  return { user, profiles, counts };
};

export const isObjectId = (v) => mongoose.Types.ObjectId.isValid(String(v));
