import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";

import { redeemCoupon, releaseCoupon } from "./coupons.js";
import { runInTransaction } from "./transaction.js";
import { ArenaError } from "./errors.js";

/**
 * Idempotently turns a pending entry into a paid one and puts the
 * member into the arena. Safe to call from verify, reconcile and
 * any future webhook: only the first caller performs the transition.
 */
export const markEntryPaid = async ({ entryId, paymentId = null }) => {
  /*
    One transaction: the entry becomes `paid` AND the member becomes `active`,
    or neither happens. (Before, these were two separate writes, so a failure
    between them left a paid entry attached to an inactive member.)
  */
  const result = await runInTransaction(async (session) => {
    const entry = await ArenaEntry.findOneAndUpdate(
      { _id: entryId, status: "pending_payment" },
      { $set: { status: "paid", paidAt: new Date(), "payment.paymentId": paymentId } },
      { new: true, ...(session ? { session } : {}) }
    );

    if (!entry) {
      return { entry: await ArenaEntry.findById(entryId).session(session || null), transitioned: false };
    }

    const activated = await ArenaProfile.updateOne(
      { _id: entry.profile, status: "draft" },
      { $set: { status: "active", entry: entry._id, activatedAt: new Date() } },
      session ? { session } : {}
    );

    if (activated.matchedCount === 0) {
      const profile = await ArenaProfile.findById(entry.profile).select("status").session(session || null);

      if (!profile) throw new ArenaError(409, "PROFILE_MISSING", "Your profile could not be found");

      // Suspended mid-payment: money received, access stays suspended until an admin reinstates.
      if (profile.status === "suspended") {
        await ArenaProfile.updateOne(
          { _id: profile._id },
          { $set: { entry: entry._id, statusBeforeSuspend: "active" } },
          session ? { session } : {}
        );
      } else if (!["active", "matched"].includes(profile.status)) {
        console.error(`[arena] entry ${entry._id} paid but profile ${profile._id} is "${profile.status}"`);
      }
    }

    return { entry, transitioned: true };
  });

  if (result.transitioned) await redeemCoupon(result.entry._id);
  return result;
};

/** Abandoned checkout: free the slot and give the coupon use back. */
export const expireEntry = async (entryId) => {
  const entry = await ArenaEntry.findOneAndUpdate(
    { _id: entryId, status: "pending_payment" },
    { $set: { status: "expired" } },
    { new: true }
  );
  if (entry) await releaseCoupon(entry._id);
  return entry;
};

/** Housekeeping sweep for checkouts abandoned for over 45 minutes. */
export const sweepAbandonedEntries = async () => {
  const cutoff = new Date(Date.now() - 45 * 60 * 1000);
  const stale = await ArenaEntry.find({ status: "pending_payment", createdAt: { $lt: cutoff } })
    .select("_id")
    .limit(200)
    .lean();

  for (const { _id } of stale) await expireEntry(_id);
  return stale.length;
};
