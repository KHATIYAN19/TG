import crypto from "crypto";
import mongoose from "mongoose";

import MemoryReferral from "../../models/memory/MemoryReferral.js";
import MemoryReferralWallet from "../../models/memory/MemoryReferralWallet.js";
import MemoryPayout from "../../models/memory/MemoryPayout.js";
import MemoryOrder from "../../models/memory/MemoryOrder.js";
import User from "../../models/User.js";
import { MemoryError, getSettings, grantCredits } from "./memoryService.js";

/*
  REFER & EARN
    - A user shares their link (?mref=CODE). A friend who signs up (email or Google) and then PAYS for a page counts as one referral.
    - Every `referralsPerCredit` paid friends = 1 page credit.
    - A credit is spent ONCE: as a page, or (when the admin allows it) as cash at `referralCashPerCredit` rupees.
      available = earned - usedAsPage - cashedOut, and both counters only move with an atomic conditional update.
*/

const oid = (id) => new mongoose.Types.ObjectId(String(id));
const NEW_ACCOUNT_DAYS = 7; // a link only counts for a brand-new account
const UPI_RE = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z][a-zA-Z0-9]{1,63}$/;
const isDup = (e) => e?.code === 11000;

const makeCode = () => crypto.randomBytes(5).toString("base64url").replace(/[^a-zA-Z0-9]/g, "").slice(0, 7).toUpperCase().padEnd(7, "X");

/** The user's wallet (and so their referral code), made the first time it is needed. */
export const getWallet = async (userId) => {
  const user = oid(userId);
  const found = await MemoryReferralWallet.findOne({ user }).lean();
  if (found) return found;
  for (let i = 0; i < 6; i += 1) {
    try {
      const w = await MemoryReferralWallet.create({ user, code: makeCode() });
      return w.toObject();
    } catch (e) {
      if (!isDup(e)) throw e;
      const again = await MemoryReferralWallet.findOne({ user }).lean(); // made by a parallel request
      if (again) return again;
    }
  }
  throw new MemoryError(500, "Could not create your referral code. Please try again.", "REFERRAL_CODE");
};

const availableOf = (w) => Math.max(0, (w.earned || 0) - (w.usedAsPage || 0) - (w.cashedOut || 0));

const requireOn = (s) => {
  if (!s.referralEnabled) throw new MemoryError(400, "Refer & earn is not available right now.", "REFERRAL_OFF");
};

/**
 * Right after a friend logs in with the link's code: remember who referred them.
 * Quietly does nothing (returns { linked:false }) when it does not apply: the program is off, a bad code, their own code,
 * already referred, an account that is not new, or someone who has already paid.
 */
export const claimReferral = async (userId, rawCode) => {
  const s = await getSettings();
  if (!s.referralEnabled) return { linked: false, reason: "off" };
  const code = String(rawCode || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{4,12}$/.test(code)) return { linked: false, reason: "invalid" };

  const wallet = await MemoryReferralWallet.findOne({ code }).select("user").lean();
  if (!wallet) return { linked: false, reason: "invalid" };
  if (String(wallet.user) === String(userId)) return { linked: false, reason: "self" };

  if (await MemoryReferral.exists({ referee: oid(userId) })) return { linked: false, reason: "already" };

  const me = await User.findById(userId).select("createdAt").lean();
  if (!me || Date.now() - new Date(me.createdAt).getTime() > NEW_ACCOUNT_DAYS * 86400000) return { linked: false, reason: "not_new" };
  if (await MemoryOrder.exists({ user: oid(userId), status: "paid", kind: "page" })) return { linked: false, reason: "already_paid" };

  try {
    await MemoryReferral.create({ referrer: wallet.user, referee: oid(userId), code });
  } catch (e) {
    if (isDup(e)) return { linked: false, reason: "already" };
    throw e;
  }
  return { linked: true };
};

/** A paid page order: if the buyer was referred, the referral becomes "qualified" and the referrer may earn a credit. Safe to repeat. */
export const qualifyReferral = async (order) => {
  if (!order || order.kind !== "page" || !(Number(order.amount) > 0)) return;
  const row = await MemoryReferral.findOneAndUpdate(
    { referee: order.user, status: "pending" },
    { status: "qualified", qualifiedAt: new Date(), qualifyingOrder: order._id },
    { new: true }
  );
  if (!row) return;
  await recomputeEarned(row.referrer);
};

/** earned = paid friends / friends-per-credit, rounded down. It never goes down (changing the setting later cannot take credits away). */
export const recomputeEarned = async (referrerId) => {
  const s = await getSettings();
  const per = Math.max(1, Number(s.referralsPerCredit) || 5);
  const qualified = await MemoryReferral.countDocuments({ referrer: referrerId, status: "qualified" });
  const target = Math.floor(qualified / per);
  await getWallet(referrerId);
  await MemoryReferralWallet.updateOne({ user: referrerId, earned: { $lt: target } }, { $set: { earned: target } });
};

/** Everything the "Refer & earn" screen shows. Friends appear by name and status only. */
export const summaryFor = async (userId) => {
  const s = await getSettings();
  const wallet = await getWallet(userId);
  await recomputeEarned(userId); // picks up a changed "friends per credit"
  const w = await MemoryReferralWallet.findOne({ user: oid(userId) }).lean();
  const per = Math.max(1, Number(s.referralsPerCredit) || 5);
  const friends = await MemoryReferral.find({ referrer: oid(userId), status: { $ne: "rejected" } })
    .sort({ createdAt: -1 }).limit(200).populate("referee", "name").lean();
  const qualified = friends.filter((f) => f.status === "qualified").length;
  const payouts = await MemoryPayout.find({ user: oid(userId) }).sort({ createdAt: -1 }).limit(50).lean();
  return {
    enabled: Boolean(s.referralEnabled),
    code: wallet.code,
    perCredit: per,
    cashEnabled: Boolean(s.referralEnabled && s.referralCashEnabled),
    cashPerCredit: s.referralCashPerCredit,
    minPayoutCredits: s.referralMinPayoutCredits || 1,
    qualified,
    toNext: per - (qualified % per),
    earned: w.earned,
    usedAsPage: w.usedAsPage,
    cashedOut: w.cashedOut,
    available: availableOf(w),
    friends: friends.map((f) => ({ id: String(f._id), name: f.referee?.name || "A friend", status: f.status === "qualified" ? "paid" : "signed_up", at: f.status === "qualified" ? f.qualifiedAt : f.createdAt })),
    payouts: payouts.map(payoutForUser),
  };
};

const payoutForUser = (p) => ({ id: String(p._id), credits: p.credits, amount: p.amount, upiId: p.upiId, status: p.status, note: p.status === "cancelled" ? p.adminNote : "", txnRef: p.status === "paid" ? p.txnRef : "", createdAt: p.createdAt, handledAt: p.handledAt });

/* take `n` credits from the wallet in ONE conditional update (null when there are not that many left) */
const takeCredits = (userId, n, field) =>
  MemoryReferralWallet.findOneAndUpdate(
    { user: oid(userId), $expr: { $gte: [{ $subtract: ["$earned", { $add: ["$usedAsPage", "$cashedOut"] }] }, n] } },
    { $inc: { [field]: n } },
    { new: true }
  );
const giveBack = (userId, n, field) => MemoryReferralWallet.updateOne({ user: oid(userId) }, { $inc: { [field]: -n } });

/** Turn referral credits into page credits. */
export const useCreditsAsPage = async (userId, count = 1) => {
  const s = await getSettings();
  requireOn(s);
  const n = Math.floor(Number(count));
  if (!(n >= 1 && n <= 100)) throw new MemoryError(400, "Choose how many credits to use.", "BAD_COUNT");
  await getWallet(userId);
  if (!(await takeCredits(userId, n, "usedAsPage"))) throw new MemoryError(400, "You do not have that many referral credits left.", "NO_CREDITS");
  try {
    await grantCredits(userId, { source: "referral", count: n });
  } catch (e) {
    await giveBack(userId, n, "usedAsPage"); // could not make the pages: put the credits back
    throw e;
  }
  return summaryFor(userId);
};

/** Ask to be paid cash for referral credits (only when the admin has switched cash on). The credits are locked straight away. */
export const requestCashOut = async (userId, { credits, upiId }) => {
  const s = await getSettings();
  requireOn(s);
  if (!s.referralCashEnabled) throw new MemoryError(400, "Cash payouts are not available right now.", "CASH_OFF");
  const n = Math.floor(Number(credits));
  const min = s.referralMinPayoutCredits || 1;
  if (!(n >= 1)) throw new MemoryError(400, "Choose how many credits to cash out.", "BAD_COUNT");
  if (n < min) throw new MemoryError(400, `You can cash out at least ${min} credit${min === 1 ? "" : "s"} at a time.`, "BELOW_MIN");
  const upi = String(upiId || "").trim();
  if (!UPI_RE.test(upi)) throw new MemoryError(400, "Enter a valid UPI ID, like name@bank.", "BAD_UPI");
  await getWallet(userId);
  if (!(await takeCredits(userId, n, "cashedOut"))) throw new MemoryError(400, "You do not have that many referral credits left. A credit already used for a page cannot be cashed.", "NO_CREDITS");
  const rate = Number(s.referralCashPerCredit);
  try {
    await MemoryPayout.create({ user: oid(userId), credits: n, ratePerCredit: rate, amount: Math.round(n * rate * 100) / 100, upiId: upi });
  } catch (e) {
    await giveBack(userId, n, "cashedOut");
    throw e;
  }
  return summaryFor(userId);
};

/* ---------------- admin ---------------- */

/** Mark a request paid or cancelled. Only a "requested" one can change, once (a cancel gives the credits back). */
export const settlePayout = async (id, adminId, { status, txnRef = "", note = "" }) => {
  if (!["paid", "cancelled"].includes(status)) throw new MemoryError(400, "Status must be paid or cancelled.", "BAD_STATUS");
  if (status === "paid" && !String(txnRef).trim()) throw new MemoryError(400, "Add the UPI transaction reference before marking it paid.", "TXN_REQUIRED");
  if (status === "cancelled" && !String(note).trim()) throw new MemoryError(400, "Tell the user why it was cancelled.", "NOTE_REQUIRED");
  const p = await MemoryPayout.findOneAndUpdate(
    { _id: id, status: "requested" },
    { status, txnRef: String(txnRef).trim().slice(0, 100), adminNote: String(note).trim().slice(0, 500), handledBy: oid(adminId), handledAt: new Date() },
    { new: true }
  );
  if (!p) throw new MemoryError(409, "This request was already handled.", "ALREADY_HANDLED");
  if (status === "cancelled") await giveBack(p.user, p.credits, "cashedOut");
  return p;
};
