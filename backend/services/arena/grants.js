import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";
import { audit } from "../../models/arena/ArenaAuditLog.js";

import { ArenaError } from "./errors.js";
import { runInTransaction } from "./transaction.js";
import { emitToUser } from "./hub.js";

/*
  ADMIN: GIVE OR TAKE MATCHES
  ---------------------------
  An admin can change how many partnerships a member may have.

    • Member has a live entry (paid / in a match): change its `matchesAllowed`.
      It can never go below the matches already used.
    • Member has used everything (entry "consumed"): raising the number
      re-opens that entry and puts them back in the arena.
    • Member has NO entry (never paid, cancelled, expired): granting creates a
      COMPLIMENTARY entry. Nothing was paid, so paidPaise is 0 and there is
      nothing to refund. They are activated straight away.

  This never moves money. Reducing a paying member's matches does not refund
  them; the admin handles any goodwill refund outside the system.
*/

export const MAX_MATCHES = 100;

const opts = (session) => (session ? { session } : {});

// adminId is null and source is "pass" when matches come from a purchased book/pack (no admin involved).
export const adjustMemberMatches = async ({ profileId, adminId = null, action, amount, reason = "", source = "admin" }) => {
  const result = await runInTransaction(async (session) => {
    const profile = await ArenaProfile.findById(profileId).session(session || null);
    if (!profile) throw new ArenaError(404, "NOT_FOUND", "Member not found");

    let entry = await ArenaEntry.findOne({ user: profile.user, status: { $in: ["paid", "in_match"] } }).session(session || null);
    let reopened = false;

    // A fully-used entry can be re-opened by raising its number.
    if (!entry) {
      entry = await ArenaEntry.findOne({ user: profile.user, status: "consumed" }).sort({ createdAt: -1 }).session(session || null);
      reopened = Boolean(entry);
    }

    const current = entry?.matchesAllowed ?? 0;
    const target =
      action === "add" ? current + amount : action === "remove" ? current - amount : amount;

    if (!Number.isInteger(target) || target < 0) {
      throw new ArenaError(400, "INVALID_AMOUNT", `This member only has ${current} match${current === 1 ? "" : "es"}; you can't remove ${amount}.`);
    }
    if (target > MAX_MATCHES) {
      throw new ArenaError(400, "TOO_MANY", `A member can have at most ${MAX_MATCHES} matches.`);
    }

    /* ---------- no entry at all: create a complimentary one ---------- */
    if (!entry) {
      if (target < 1) throw new ArenaError(400, "NOTHING_TO_REMOVE", "This member has no matches to remove.");

      const [created] = await ArenaEntry.create(
        [
          {
            user: profile.user,
            profile: profile._id,
            status: "paid",
            paidAt: new Date(),
            listPricePaise: 0,
            discountPaise: 0,
            paidPaise: 0,
            cancellationFeePercent: 0,
            matchesAllowed: target,
            matchesUsed: 0,
            complimentary: true,
            grantedBy: adminId,
            payment: { gateway: source === "pass" ? "pass" : "admin" },
            adjustments: [{ at: new Date(), by: adminId, action: "grant", from: 0, to: target, reason }],
          },
        ],
        opts(session)
      );

      await activate(profile, created, session);
      return { entry: created, action: "grant", from: 0, to: target };
    }

    /* ---------- existing entry ---------- */
    if (target < entry.matchesUsed) {
      throw new ArenaError(
        400,
        "BELOW_USED",
        `This member has already used ${entry.matchesUsed} match${entry.matchesUsed === 1 ? "" : "es"}, so the lowest you can set is ${entry.matchesUsed}.`
      );
    }
    if (target === current && !reopened) throw new ArenaError(400, "NO_CHANGE", "That's already the number of matches this member has.");

    const used = entry.matchesUsed;
    const hasLeft = target > used;
    const inMatch = entry.status === "in_match";

    let status = entry.status;
    if (reopened && hasLeft) status = "paid";
    else if (!inMatch && !hasLeft) status = "consumed";

    const adjustment = { at: new Date(), by: adminId, action: reopened ? "reopen" : action, from: current, to: target, reason };
    await ArenaEntry.updateOne(
      { _id: entry._id },
      { $set: { matchesAllowed: target, status }, $push: { adjustments: { $each: [adjustment], $slice: -50 } } },
      opts(session)
    );

    const updated = await ArenaEntry.findById(entry._id).session(session || null);

    if (status === "paid") await activate(profile, updated, session);
    else if (status === "consumed" && profile.status === "active") {
      // Nothing left and not in a match: they'd need a new entry (or another grant).
      await ArenaProfile.updateOne({ _id: profile._id, status: "active" }, { $set: { status: "draft", entry: null, activatedAt: null } }, opts(session));
    }

    return { entry: updated, action: adjustment.action, from: current, to: target };
  });

  if (adminId) await audit(adminId, "matches_adjusted", {
    targetType: "profile",
    targetId: profileId,
    summary: `${result.action}: ${result.from} → ${result.to} match(es)${reason ? ` (${reason})` : ""}`,
    meta: { entryId: String(result.entry._id), complimentary: result.entry.complimentary, ...result },
  });

  const profile = await ArenaProfile.findById(profileId).select("user status").lean();
  if (profile) emitToUser(profile.user, { type: "request_updated" }); // nudge their UI to refresh

  return {
    entryId: String(result.entry._id),
    status: result.entry.status,
    matchesAllowed: result.entry.matchesAllowed,
    matchesUsed: result.entry.matchesUsed,
    matchesLeft: Math.max(0, result.entry.matchesAllowed - result.entry.matchesUsed),
    complimentary: result.entry.complimentary,
    profileStatus: profile?.status,
    from: result.from,
    to: result.to,
  };
};

/* Put the member in the arena with this entry (suspended members stay suspended). */
const activate = async (profile, entry, session) => {
  if (profile.status === "draft") {
    await ArenaProfile.updateOne(
      { _id: profile._id, status: "draft" },
      { $set: { status: "active", entry: entry._id, activatedAt: new Date() } },
      opts(session)
    );
  } else if (profile.status === "suspended") {
    await ArenaProfile.updateOne(
      { _id: profile._id },
      { $set: { entry: entry._id, statusBeforeSuspend: "active" } },
      opts(session)
    );
  }
  // "active" / "matched": already in the arena with an entry; nothing to change.
};
