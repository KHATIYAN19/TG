import { z } from "zod";

import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaProfile from "../../models/arena/ArenaProfile.js";
import { audit } from "../../models/arena/ArenaAuditLog.js";
import { ArenaError, handle } from "../../services/arena/errors.js";
import { gateway } from "../../services/arena/gateway.js";
import { objectId } from "./schemas.js";

/*
  Admin-initiated refund for a SUCCESSFUL payment.

  - Always refunds against the payment id stored on the entry (the same gateway
    payment the member made), so the money goes back to the same account.
  - The amount is reserved atomically BEFORE the gateway call, so two clicks or
    two admins can never refund more than was paid. A gateway failure releases it.
  - Cancellation refunds (cancel.refundPaise) and admin refunds count together.
*/

const REFUNDABLE_STATUSES = ["paid", "in_match", "consumed", "cancelled"];

const refundSchema = z.object({
  amountPaise: z.number().int().min(100, "Minimum refund is ₹1").max(100_000_000),
  paymentId: z.string().min(1).max(100), // must match the entry's stored payment id
  note: z.string().trim().max(200).optional().default(""),
  confirm: z.literal(true, { errorMap: () => ({ message: "Refund must be confirmed" }) }),
});

export const refundPayment = handle(async (req, res) => {
  objectId.parse(req.params.id);
  const input = refundSchema.parse(req.body);

  const entry = await ArenaEntry.findById(req.params.id).lean();
  if (!entry) throw new ArenaError(404, "NOT_FOUND", "Payment not found");
  if (entry.complimentary || entry.payment?.gateway === "admin") {
    throw new ArenaError(400, "NOT_REFUNDABLE", "Free (admin-granted) entries have nothing to refund");
  }
  if (!REFUNDABLE_STATUSES.includes(entry.status)) {
    throw new ArenaError(400, "NOT_REFUNDABLE", "Only successfully paid entries can be refunded");
  }
  if (!entry.payment?.paymentId || !entry.payment?.gateway) {
    throw new ArenaError(400, "NOT_REFUNDABLE", "This entry has no recorded gateway payment ID");
  }
  if (entry.payment.paymentId !== input.paymentId) {
    throw new ArenaError(409, "STALE", "The payment changed. Reload the page and try again.");
  }

  const { amountPaise } = input;

  // Reserve the amount atomically; only succeeds while the total stays within what was paid.
  const reserved = await ArenaEntry.findOneAndUpdate(
    {
      _id: entry._id,
      status: { $in: REFUNDABLE_STATUSES },
      "payment.paymentId": entry.payment.paymentId,
      $expr: {
        $lte: [
          { $add: [{ $ifNull: ["$refundedPaise", 0] }, { $ifNull: ["$cancel.refundPaise", 0] }, amountPaise] },
          "$paidPaise",
        ],
      },
    },
    { $inc: { refundedPaise: amountPaise } },
    { new: true }
  ).lean();

  if (!reserved) {
    const already = (entry.refundedPaise || 0) + (entry.cancel?.refundPaise || 0);
    const left = Math.max(0, entry.paidPaise - already);
    throw new ArenaError(400, "AMOUNT_TOO_HIGH", `Only ₹${(left / 100).toFixed(2)} is still refundable on this payment`);
  }

  const attemptId = `RFA${String(entry._id)}${Date.now().toString(36)}`.slice(0, 40);

  let refundId;
  try {
    refundId = await gateway.adminRefund({ entry, amountPaise, attemptId, note: input.note });
  } catch (error) {
    await ArenaEntry.updateOne({ _id: entry._id }, { $inc: { refundedPaise: -amountPaise } });
    throw error;
  }

  try {
    await ArenaEntry.updateOne(
      { _id: entry._id },
      {
        $push: {
          refunds: {
            at: new Date(),
            by: String(req.user.id),
            amountPaise,
            refundId,
            gateway: entry.payment.gateway,
            paymentId: entry.payment.paymentId,
            note: input.note,
          },
        },
      }
    );
  } catch (error) {
    // Money already left; never lose the trail.
    console.error(`[arena:refund] REFUND ISSUED BUT NOT RECORDED entry=${entry._id} refundId=${refundId} amountPaise=${amountPaise}`, error);
  }

  const profile = await ArenaProfile.findById(entry.profile).select("alias").lean().catch(() => null);
  await audit(req.user.id, "payment_refunded", {
    targetType: "payment",
    targetId: entry._id,
    summary: `Refunded ₹${(amountPaise / 100).toFixed(2)} of ₹${(entry.paidPaise / 100).toFixed(2)} via ${entry.payment.gateway}${profile?.alias ? ` (${profile.alias})` : ""}`,
    meta: { refundId, paymentId: entry.payment.paymentId, orderId: entry.payment.orderId, gateway: entry.payment.gateway, amountPaise, note: input.note },
  });

  res.json({
    success: true,
    message: `₹${(amountPaise / 100).toFixed(2)} refund started. It returns to the original payment method.`,
    data: { refundId, refundedPaise: reserved.refundedPaise },
  });
}, "Unable to start the refund");
