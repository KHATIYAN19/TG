import ArenaProfile from "../../models/arena/ArenaProfile.js";
import ArenaRequest from "../../models/arena/ArenaRequest.js";
import ArenaMatch from "../../models/arena/ArenaMatch.js";
import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaBlock from "../../models/arena/ArenaBlock.js";
import User from "../../models/User.js";

import { ArenaError } from "./errors.js";
import { runInTransaction } from "./transaction.js";
import { emitToUser, disconnectUser } from "./hub.js";
import { sendMatchedMail } from "./mail.js";

const opts = (session) => (session ? { session } : {});

const emailsFor = async (userIds) => {
  const users = await User.find({ _id: { $in: userIds } }).select("email").lean();
  return users.map((u) => u.email);
};

/**
 * Accept a request and create the match.
 *
 * Everything happens in one transaction so that:
 *  - the request can only be accepted once,
 *  - both profiles must still be `active` (nobody is double-booked),
 *  - both entries spend one included match together,
 *  - every other pending request of either member is cancelled.
 * The partial unique index on ArenaMatch.users is the final safety net.
 */
export const acceptRequest = async ({ requestId, userId }) => {
  const match = await runInTransaction(async (session) => {
    const request = await ArenaRequest.findOneAndUpdate(
      { _id: requestId, toUser: userId, status: "pending", expiresAt: { $gt: new Date() } },
      { $set: { status: "accepted", respondedAt: new Date() } },
      { new: true, ...opts(session) }
    );

    if (!request) {
      throw new ArenaError(409, "REQUEST_UNAVAILABLE", "This request is no longer available");
    }

    const blocked = await ArenaBlock.exists({
      $or: [
        { blocker: request.fromUser, blocked: request.toUser },
        { blocker: request.toUser, blocked: request.fromUser },
      ],
    }).session(session || null);

    if (blocked) {
      throw new ArenaError(403, "BLOCKED", "You can't match with this member");
    }

    // With multi-match entries the same two people must not be re-paired.
    const pairedBefore = await ArenaMatch.exists({ users: { $all: [request.fromUser, request.toUser] } }).session(session || null);
    if (pairedBefore) {
      throw new ArenaError(409, "PREVIOUS_BUDDY", "You've already been matched with this member");
    }

    // Claim both profiles; fails if either is no longer `active`.
    for (const profileId of [request.from, request.to]) {
      const claimed = await ArenaProfile.updateOne(
        { _id: profileId, status: "active" },
        { $set: { status: "matched" } },
        opts(session)
      );
      if (claimed.modifiedCount !== 1) {
        throw new ArenaError(409, "NOT_AVAILABLE", "One of you is no longer available for matching");
      }
    }

    const profiles = await ArenaProfile.find({ _id: { $in: [request.from, request.to] } })
      .select("user entry")
      .session(session || null);

    const [created] = await ArenaMatch.create(
      [
        {
          profiles: profiles.map((p) => p._id),
          users: profiles.map((p) => p.user),
          entries: profiles.map((p) => p.entry),
        },
      ],
      opts(session)
    );

    // Each entry moves paid -> in_match and spends one of its included matches.
    const consumed = await ArenaEntry.updateMany(
      { _id: { $in: profiles.map((p) => p.entry) }, status: "paid", $expr: { $lt: ["$matchesUsed", "$matchesAllowed"] } },
      { $set: { match: created._id, status: "in_match" }, $inc: { matchesUsed: 1 } },
      opts(session)
    );
    if (consumed.modifiedCount !== 2) {
      throw new ArenaError(409, "ENTRY_INVALID", "A paid entry is required to match");
    }

    await ArenaProfile.updateMany(
      { _id: { $in: profiles.map((p) => p._id) } },
      { $set: { match: created._id } },
      opts(session)
    );

    await ArenaRequest.updateOne({ _id: request._id }, { $set: { match: created._id } }, opts(session));

    await ArenaRequest.updateMany(
      {
        _id: { $ne: request._id },
        status: "pending",
        $or: [
          { from: { $in: [request.from, request.to] } },
          { to: { $in: [request.from, request.to] } },
        ],
      },
      { $set: { status: "cancelled", respondedAt: new Date() } },
      opts(session)
    );

    return created;
  });

  // Side effects only after the transaction commits.
  for (const uid of match.users) {
    emitToUser(uid, { type: "matched", matchId: String(match._id) });
  }
  emailsFor(match.users).then((list) => list.forEach(sendMatchedMail));

  return match;
};

/**
 * End a partnership.
 *
 * `restoreProfileIds` are members who did nothing wrong (e.g. their buddy
 * was suspended): the match doesn't count against their entry.
 * Everyone returns to the arena if their entry still has matches left,
 * otherwise to `draft` (a new entry is needed to connect again).
 */
export const endMatch = async ({ matchId, byUserId = null, reason, restoreProfileIds = [] }) => {
  const restore = new Set(restoreProfileIds.map(String));

  const ended = await runInTransaction(async (session) => {
    const match = await ArenaMatch.findOneAndUpdate(
      { _id: matchId, status: "active" },
      {
        $set: {
          status: reason === "admin_dissolved" || reason === "suspended" ? "dissolved" : "ended",
          endedAt: new Date(),
          endedBy: byUserId,
          endReason: reason,
        },
      },
      { new: true, ...opts(session) }
    );

    if (!match) return null;

    for (const [i, profileId] of match.profiles.entries()) {
      const entry = await ArenaEntry.findById(match.entries[i]).session(session || null);
      if (!entry) continue;

      const innocent = restore.has(String(profileId));

      // The partnership didn't count against an innocent member.
      const used = innocent ? Math.max(0, entry.matchesUsed - 1) : entry.matchesUsed;
      const hasMatchesLeft = used < entry.matchesAllowed;

      if (hasMatchesLeft) {
        // Entry stays alive: back to the arena for their next partnership.
        await ArenaEntry.updateOne(
          { _id: entry._id, status: "in_match" },
          { $set: { status: "paid", match: null, matchesUsed: used } },
          opts(session)
        );
        await ArenaProfile.updateOne(
          { _id: profileId, status: "matched" },
          { $set: { status: "active", match: null, activatedAt: new Date() } },
          opts(session)
        );
      } else {
        // All included matches used: they'd need a new entry to continue.
        await ArenaEntry.updateOne(
          { _id: entry._id, status: "in_match" },
          { $set: { status: "consumed", matchesUsed: used } },
          opts(session)
        );
        await ArenaProfile.updateOne(
          { _id: profileId, status: "matched" },
          { $set: { status: "draft", match: null, entry: null } },
          opts(session)
        );
      }
    }

    return match;
  });

  if (!ended) return null;

  for (const uid of ended.users) {
    emitToUser(uid, { type: "match_ended", matchId: String(ended._id), reason });
    disconnectUser(uid, 4004, "Match ended");
  }

  return ended;
};

/** Close every pending request involving these profiles. */
export const closePendingRequests = (profileIds, status = "cancelled", session = null) =>
  ArenaRequest.updateMany(
    {
      status: "pending",
      $or: [{ from: { $in: profileIds } }, { to: { $in: profileIds } }],
    },
    { $set: { status, respondedAt: new Date() } },
    opts(session)
  );

/** Lazily expire stale requests. Cheap, idempotent, indexed. */
export const expireStaleRequests = () =>
  ArenaRequest.updateMany(
    { status: "pending", expiresAt: { $lte: new Date() } },
    { $set: { status: "expired", respondedAt: new Date() } }
  );

export const findActiveMatchForUser = (userId) =>
  ArenaMatch.findOne({ users: userId, status: "active" });
