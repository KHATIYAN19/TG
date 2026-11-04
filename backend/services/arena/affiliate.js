import mongoose from "mongoose";

import User from "../../models/User.js";

/*
  Affiliate commission for arena entries.

  The affiliate's code/rate is snapshotted on the entry at checkout
  (`entry.affiliate`). Everything after that is derived from the entry itself:

    gross commission = snapshot.commissionPaise (computed on what the member paid)
    net commission   = gross × (paid − refunded) / paid      (refunds claw back proportionally)
    status           = pending | earned | partially_refunded | refunded | void

  Because it is derived, refunds and cancellations never need a second write.
*/

const DIRECT_CODES = new Set(["tt"]); // Target Trek's own code: not an affiliate

/** Returns the snapshot to store on the entry, or null when no commission applies. */
export const resolveAffiliate = async ({ code, paidPaise, buyerId }) => {
  const clean = typeof code === "string" ? code.trim().toLowerCase() : "";
  if (!clean || DIRECT_CODES.has(clean) || !(paidPaise > 0)) return null;

  const user = await User.findOne({
    role: "affiliate",
    status: "active",
    isDeleted: { $ne: true },
    "affiliate.code": clean.toUpperCase(),
    "affiliate.status": "active",
  })
    .select("_id affiliate.code affiliate.commissionType affiliate.commissionValue")
    .lean();

  if (!user?.affiliate) return null;
  if (buyerId && String(user._id) === String(buyerId)) return null; // no commission on your own purchase

  const { commissionType: type, commissionValue: value } = user.affiliate;
  if (!["percentage", "fixed"].includes(type) || !Number.isFinite(value) || value <= 0) return null;
  if (type === "percentage" && value > 100) return null;

  // Fixed commissions are configured in rupees; percentage applies to the amount actually paid.
  const raw = type === "percentage" ? (paidPaise * value) / 100 : value * 100;
  const commissionPaise = Math.min(paidPaise, Math.max(0, Math.round(raw)));
  if (commissionPaise <= 0) return null;

  return { user: user._id, code: user.affiliate.code, type, value, commissionPaise };
};

const refundedOf = (e) => (e.cancel?.refundPaise || 0) + (e.refundedPaise || 0);

/** Read-side view of one entry's commission, or null if it has no affiliate. */
export const commissionOf = (entry) => {
  const a = entry?.affiliate;
  if (!a?.user || !(a.commissionPaise > 0)) return null;

  const paid = entry.paidPaise || 0;
  const refunded = Math.min(paid, refundedOf(entry));
  const net = paid > 0 ? Math.round((a.commissionPaise * (paid - refunded)) / paid) : 0;

  let status;
  if (entry.status === "pending_payment") status = "pending";
  else if (entry.status === "expired") status = "void";
  else if (refunded >= paid && paid > 0) status = "refunded";
  else if (refunded > 0) status = "partially_refunded";
  else status = "earned";

  return {
    code: a.code,
    type: a.type,
    value: a.value,
    grossPaise: a.commissionPaise,
    // only money actually received earns commission
    netPaise: status === "pending" || status === "void" ? 0 : net,
    status,
  };
};

/* Mongo expression equivalent of commissionOf().netPaise, for totals. */
export const NET_COMMISSION_EXPR = {
  $cond: [
    { $and: [{ $gt: ["$paidPaise", 0] }, { $in: ["$status", ["paid", "in_match", "consumed", "cancelling", "cancelled"]] }] },
    {
      $round: [
        {
          $divide: [
            {
              $multiply: [
                { $ifNull: ["$affiliate.commissionPaise", 0] },
                { $max: [0, { $subtract: ["$paidPaise", { $add: [{ $ifNull: ["$cancel.refundPaise", 0] }, { $ifNull: ["$refundedPaise", 0] }] }] }] },
              ],
            },
            "$paidPaise",
          ],
        },
        0,
      ],
    },
    0,
  ],
};

export const toObjectId = (id) => new mongoose.Types.ObjectId(String(id));
