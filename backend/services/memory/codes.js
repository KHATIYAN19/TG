import mongoose from "mongoose";

import MemoryCode from "../../models/memory/MemoryCode.js";
import User from "../../models/User.js";
import { MemoryError, grantCredits } from "./memoryService.js";

/*
  Redeeming a code = one page credit for the user. Used by the "Use this code" box and by the automatic
  claim that runs when a Lifetime pack buyer signs up / logs in.
*/

/**
 * Redeem one code for one user. Atomic: valid + active + not expired + not used up + not already used by this user, all in ONE update,
 * so two taps (or two tabs) can never spend a code twice. Throws a MemoryError a person can read.
 */
export const redeemCodeForUser = async (userId, rawCode) => {
  const now = new Date();
  const normalized = String(rawCode || "").trim().toUpperCase();
  const uid = new mongoose.Types.ObjectId(String(userId));

  const claimed = await MemoryCode.findOneAndUpdate(
    {
      code: normalized,
      isActive: true,
      redeemedBy: { $ne: uid },
      $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }, { $expr: { $lt: ["$usedCount", "$maxUses"] } }],
    },
    { $inc: { usedCount: 1 }, $push: { redeemedBy: uid } },
    { new: true }
  );

  if (!claimed) {
    const c = await MemoryCode.findOne({ code: normalized }).lean();
    if (!c || !c.isActive) throw new MemoryError(400, "Invalid code.", "CODE_INVALID");
    if (c.expiresAt && c.expiresAt < now) throw new MemoryError(400, "This code has expired.", "CODE_EXPIRED");
    if (c.redeemedBy.some((id) => String(id) === String(userId))) throw new MemoryError(400, "You have already used this code.", "CODE_ALREADY_USED_BY_YOU");
    throw new MemoryError(400, "This code has already been used.", "CODE_USED_UP");
  }

  try {
    await grantCredits(userId, { source: "code", ref: claimed.code });
  } catch (e) {
    await MemoryCode.updateOne({ _id: claimed._id }, { $inc: { usedCount: -1 }, $pull: { redeemedBy: uid } });
    throw e;
  }
  return claimed;
};

/**
 * Add the Lifetime-pack codes bought with this account's email to the account (one page credit each).
 * Sign-up and login both verify the email (one-time code or Google), so "the email on the account" is the buyer.
 * Safe to call on every visit: a code that is already added is skipped, and the claim itself is atomic.
 * Returns how many pages were added.
 */
export const claimPackCodesForUser = async (userId) => {
  const user = await User.findById(userId).select("email").lean();
  const email = String(user?.email || "").toLowerCase().trim();
  if (!email) return 0;

  const now = new Date();
  const pending = await MemoryCode.find({
    source: "lifetime_pack",
    ownerEmail: email,
    isActive: true,
    redeemedBy: { $ne: new mongoose.Types.ObjectId(String(userId)) },
    $and: [{ $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] }, { $expr: { $lt: ["$usedCount", "$maxUses"] } }],
  })
    .select("code")
    .limit(20)
    .lean();

  let added = 0;
  for (const { code } of pending) {
    try {
      await redeemCodeForUser(userId, code);
      added += 1;
    } catch (e) {
      if (!(e instanceof MemoryError)) throw e; // someone else got there first, or it just expired: skip it
    }
  }
  return added;
};
