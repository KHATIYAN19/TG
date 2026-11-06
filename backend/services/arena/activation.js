import mongoose from "mongoose";

import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";

/*
  ACTIVATION INVARIANT
  --------------------
  A member with a PAID entry must be in the arena (profile.status "active").
  Payment marks the entry paid and activates the profile together, in one
  transaction. These helpers are the safety net for any record that ever
  ends up "paid but not active" (a crash between writes, older data, a
  dropped connection), so a paying member is never left locked out.
*/

/**
 * Activate any profile whose user has a paid entry but whose profile is still
 * "draft". Cheap and idempotent. Pass a userId to heal one member (used on
 * every /me and browse call); omit it to sweep everyone.
 */
export const healPaidMembers = async ({ userId = null, limit = 500 } = {}) => {
  const match = { status: "paid" };
  // Aggregation pipelines do NOT cast ids like find() does: a string id would
  // silently match nothing, so convert explicitly.
  if (userId) match.user = new mongoose.Types.ObjectId(String(userId));

  const stuck = await ArenaEntry.aggregate([
    { $match: match },
    { $lookup: { from: ArenaProfile.collection.name, localField: "profile", foreignField: "_id", as: "p" } },
    { $unwind: "$p" },
    { $match: { "p.status": "draft" } },
    { $project: { _id: 1, profile: 1 } },
    { $limit: limit },
  ]);

  let healed = 0;
  for (const entry of stuck) {
    const result = await ArenaProfile.updateOne(
      { _id: entry.profile, status: "draft" },
      { $set: { status: "active", entry: entry._id, activatedAt: new Date() } }
    );
    if (result.modifiedCount) healed += 1;
  }

  if (healed) console.warn(`[arena] healed ${healed} paid member(s) that were not active`);
  return healed;
};

/** How many members are paid but not active right now (for the admin dashboard). */
export const countNeedingAttention = async () => {
  const rows = await ArenaEntry.aggregate([
    { $match: { status: "paid" } },
    { $lookup: { from: ArenaProfile.collection.name, localField: "profile", foreignField: "_id", as: "p" } },
    { $unwind: "$p" },
    { $match: { "p.status": "draft" } },
    { $count: "n" },
  ]);
  return rows[0]?.n ?? 0;
};

/**
 * Pay-first flow. Called after a member saves their details: if they already hold a
 * paid entry that is not linked to a profile yet, link it and put the profile in the arena.
 * Idempotent. Returns true when an entry was attached.
 */
export const attachPaidEntry = async ({ userId, profile }) => {
  if (!profile || profile.status === "suspended") return false;

  const entry = await ArenaEntry.findOneAndUpdate(
    { user: userId, status: "paid", profile: null },
    { $set: { profile: profile._id } },
    { new: true }
  );
  if (!entry) return false;

  await ArenaProfile.updateOne(
    { _id: profile._id, status: "draft" },
    { $set: { status: "active", entry: entry._id, activatedAt: new Date() } }
  );
  return true;
};

/** Does this member hold a paid entry (any state that grants arena access)? */
export const hasPaidEntry = (userId) =>
  ArenaEntry.exists({ user: userId, status: { $in: ["paid", "in_match", "consumed"] } }).then(Boolean);
