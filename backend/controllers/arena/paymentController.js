import ArenaProfile from "../../models/arena/ArenaProfile.js";
import ArenaEntry from "../../models/arena/ArenaEntry.js";
import ArenaRequest from "../../models/arena/ArenaRequest.js";
import User from "../../models/User.js";
import { getArenaSettings, isCancelRefundEnabled } from "../../models/arena/ArenaSettings.js";

import { ArenaError, handle } from "../../services/arena/errors.js";
import { gateway } from "../../services/arena/gateway.js";
import { computePricing, computeCancellation } from "../../services/arena/pricing.js";
import { findValidCoupon, reserveCoupon } from "../../services/arena/coupons.js";
import { markEntryPaid, expireEntry } from "../../services/arena/entryService.js";
import { resolveAffiliate } from "../../services/arena/affiliate.js";
import { healPaidMembers } from "../../services/arena/activation.js";
import { emitToUser } from "../../services/arena/hub.js";
import { FRONTEND_URL } from "../../config/urls.js";
import { couponCodeSchema, checkoutSchema, verifyPaymentSchema } from "./schemas.js";

/* Pay-first: the profile is optional at checkout (details come after payment). */
const findProfile = async (userId) => {
  const profile = await ArenaProfile.findOne({ user: userId });
  if (profile?.status === "suspended") throw new ArenaError(403, "SUSPENDED", "Your arena access has been suspended");
  return profile;
};

const previewPayload = (pricing, coupon) => ({
  listPricePaise: pricing.listPricePaise,
  discountPaise: pricing.discountPaise,
  finalPaise: pricing.finalPaise,
  coupon: coupon ? { code: coupon.code, description: coupon.description } : null,
});

/* POST /coupon/validate – price preview, no side effects */
export const validateCoupon = handle(async (req, res) => {
  const { code } = couponCodeSchema.parse(req.body);
  const settings = await getArenaSettings();
  const coupon = await findValidCoupon(code, req.user.id);

  res.json({ success: true, data: previewPayload(computePricing(settings.entryPricePaise, coupon), coupon) });
}, "Unable to check the coupon");

/*
  An earlier checkout may actually have been paid (browser closed, slow
  redirect). Honour it instead of charging twice; otherwise release it.
*/
const settleExistingPending = async (userId) => {
  const pending = await ArenaEntry.findOne({ user: userId, status: "pending_payment" });
  if (!pending) return;

  if (pending.payment?.orderId) {
    let paid = null;
    try {
      paid = await gateway.findPaidPayment(pending);
    } catch (error) {
      console.error("[arena] settle pending failed:", error.message);
    }
    if (paid) {
      await markEntryPaid({ entryId: pending._id, paymentId: paid.paymentId });
      throw new ArenaError(409, "ALREADY_IN_ARENA", "Your earlier payment went through. You're in the arena.");
    }
  }

  await expireEntry(pending._id);
};

/* POST /entry/checkout */
export const checkout = handle(async (req, res) => {
  const { couponCode, affiliateCode, gateway: preferredGateway } = checkoutSchema.parse(req.body);
  const settings = await getArenaSettings();

  if (!settings.enabled) throw new ArenaError(503, "ARENA_PAUSED", "The arena is temporarily paused");

  const profile = await findProfile(req.user.id);
  if (profile?.status === "active") throw new ArenaError(409, "ALREADY_IN_ARENA", "You're already in the arena");
  if (profile?.status === "matched") throw new ArenaError(409, "ALREADY_MATCHED", "You already have a buddy");

  // Paid already, details still to fill in: never charge twice.
  if (!profile && (await ArenaEntry.exists({ user: req.user.id, status: { $in: ["paid", "in_match"] } }))) {
    throw new ArenaError(409, "ALREADY_PAID", "Your payment was already received. Add your details to enter the arena.");
  }

  // Already paid but somehow not active? Fix it instead of charging again.
  if (await healPaidMembers({ userId: req.user.id })) {
    throw new ArenaError(409, "ALREADY_IN_ARENA", "Your payment was already received. You're in the arena.");
  }

  await settleExistingPending(req.user.id);

  const coupon = couponCode ? await findValidCoupon(couponCode, req.user.id) : null;
  const pricing = computePricing(settings.entryPricePaise, coupon);
  const affiliate = settings.affiliateEnabled === false ? null : await resolveAffiliate({ code: affiliateCode, paidPaise: pricing.finalPaise, buyerId: req.user.id });

  let entry;
  try {
    entry = await ArenaEntry.create({
      user: req.user.id,
      profile: profile?._id ?? null,
      listPricePaise: pricing.listPricePaise,
      discountPaise: pricing.discountPaise,
      paidPaise: pricing.finalPaise,
      cancellationFeePercent: settings.cancellationFeePercent,
      matchesAllowed: settings.matchesPerEntry,
      coupon: coupon ? { id: coupon._id, code: coupon.code } : {},
      ...(affiliate ? { affiliate } : {}),
    });
  } catch (error) {
    if (error?.code === 11000) {
      if (await ArenaEntry.exists({ user: req.user.id, status: { $in: ["paid", "in_match"] } })) {
        await healPaidMembers({ userId: req.user.id });
        throw new ArenaError(409, "ALREADY_IN_ARENA", "Your payment was already received. You're in the arena.");
      }
      throw new ArenaError(409, "CHECKOUT_IN_PROGRESS", "A checkout is already in progress");
    }
    throw error;
  }

  try {
    if (coupon) {
      await reserveCoupon({ coupon, userId: req.user.id, entryId: entry._id, discountPaise: pricing.discountPaise });
    }

    // Fully discounted: no gateway involved.
    if (pricing.finalPaise === 0) {
      await markEntryPaid({ entryId: entry._id, paymentId: null });
      return res.json({ success: true, data: { free: true, pricing: previewPayload(pricing, coupon) } });
    }

    const user = await User.findById(req.user.id).select("name email mobile").lean();
    const { orderId, checkout: checkoutPayload } = await gateway.createOrder({ entry, user: { ...user, _id: req.user.id }, gateway: preferredGateway });

    entry.payment = { gateway: checkoutPayload.gateway, orderId };
    await entry.save();

    return res.json({
      success: true,
      data: { free: false, orderId, pricing: previewPayload(pricing, coupon), checkout: checkoutPayload },
    });
  } catch (error) {
    await expireEntry(entry._id); // releases the coupon too
    throw error;
  }
}, "Unable to start payment");

/*
  POST /entry/verify
  Called after the gateway returns the member to us (Cashfree redirect) or
  after the Razorpay popup succeeds. The server re-checks with the gateway;
  nothing the browser says is trusted.
*/
export const verifyPayment = handle(async (req, res) => {
  const body = verifyPaymentSchema.parse(req.body);

  const entry = await ArenaEntry.findOne({ "payment.orderId": body.orderId, user: req.user.id });
  if (!entry) throw new ArenaError(404, "ENTRY_NOT_FOUND", "Order not found");

  if (["paid", "in_match", "consumed"].includes(entry.status)) {
    await healPaidMembers({ userId: req.user.id }); // make sure a paid member is really active
    return res.json({ success: true, data: { status: entry.status } }); // idempotent
  }
  if (entry.status !== "pending_payment") {
    throw new ArenaError(409, "ENTRY_CLOSED", "This checkout is no longer active");
  }

  const result = await gateway.confirmPayment({ entry, paymentId: body.paymentId, signature: body.signature });

  if (result.status !== "paid") {
    return res.status(202).json({
      success: true,
      data: { status: "processing" },
      message: "Your payment hasn't been confirmed yet. If you were charged, it will activate automatically.",
    });
  }

  const { entry: updated } = await markEntryPaid({ entryId: entry._id, paymentId: result.paymentId });
  res.json({ success: true, data: { status: updated.status } });
}, "Unable to verify payment");

/* POST /entry/reconcile – recovers payments whose browser closed early */
export const reconcile = handle(async (req, res) => {
  const entry = await ArenaEntry.findOne({ user: req.user.id, status: "pending_payment" });

  if (!entry?.payment?.orderId) {
    const current = await ArenaEntry.findOne({ user: req.user.id, status: { $in: ["paid", "in_match", "consumed"] } }).lean();
    return res.json({ success: true, data: { status: current?.status ?? "none" } });
  }

  const paid = await gateway.findPaidPayment(entry);
  if (paid) {
    const { entry: updated } = await markEntryPaid({ entryId: entry._id, paymentId: paid.paymentId });
    return res.json({ success: true, data: { status: updated.status } });
  }

  res.json({ success: true, data: { status: "pending_payment" } });
}, "Unable to check payment");

const assertCancelRefundEnabled = async () => {
  const settings = await getArenaSettings({ fresh: true });
  if (!isCancelRefundEnabled(settings)) {
    throw new ArenaError(403, "FEATURE_DISABLED", "Cancelling an entry is not available right now.");
  }
};

/* POST /entry/cancel – only before a match; keeps the configured fee */
export const cancelEntry = handle(async (req, res) => {
  await assertCancelRefundEnabled();
  // Pay-first: a paid member who has not added their details yet has no profile, and may cancel too.
  const profile = await findProfile(req.user.id);

  if (profile?.status === "matched") throw new ArenaError(409, "ALREADY_MATCHED", "You can't cancel after you're matched");
  if (profile && profile.status !== "active") throw new ArenaError(409, "NOTHING_TO_CANCEL", "You don't have an active entry");

  // Claim the cancellation atomically so a double-click can't refund twice.
  // Only an entry that hasn't spent any match can be cancelled.
  const entry = await ArenaEntry.findOneAndUpdate(
    { user: req.user.id, status: "paid", matchesUsed: 0, complimentary: { $ne: true } },
    { $set: { status: "cancelling" } },
    { new: true }
  );
  if (!entry) {
    const used = await ArenaEntry.exists({ user: req.user.id, status: "paid", matchesUsed: { $gt: 0 } });
    if (used) throw new ArenaError(409, "MATCH_ALREADY_USED", "You've already used a match from this entry, so it can't be cancelled or refunded.");
    if (await ArenaEntry.exists({ user: req.user.id, status: "paid", complimentary: true })) {
      throw new ArenaError(409, "COMPLIMENTARY_ENTRY", "This entry was given to you by our team, so there is nothing to refund.");
    }
    throw new ArenaError(409, "NOTHING_TO_CANCEL", "You don't have an active entry");
  }

  const { feePaise, refundPaise } = computeCancellation(entry.paidPaise, entry.cancellationFeePercent);

  let refundId = null;
  try {
    if (refundPaise > 0 && entry.payment?.orderId) {
      refundId = await gateway.refund({ entry, amountPaise: refundPaise });
    }
  } catch (error) {
    // Gateway failed: put the entry back so the member can retry.
    await ArenaEntry.updateOne({ _id: entry._id, status: "cancelling" }, { $set: { status: "paid" } });
    console.error("[arena] refund failed:", error.message);
    throw new ArenaError(502, "REFUND_FAILED", "We couldn't process the refund right now. Please try again shortly.");
  }

  await ArenaEntry.updateOne(
    { _id: entry._id },
    { $set: { status: "cancelled", cancel: { at: new Date(), feePaise, refundPaise, refundId } } }
  );

  if (profile) {
    await ArenaProfile.updateOne(
      { _id: profile._id, status: "active" },
      { $set: { status: "draft", entry: null, activatedAt: null } }
    );
  }

  const affected = profile
    ? await ArenaRequest.find({
        status: "pending",
        $or: [{ from: profile._id }, { to: profile._id }],
      }).select("fromUser toUser")
    : [];

  await ArenaRequest.updateMany(
    { _id: { $in: affected.map((r) => r._id) } },
    { $set: { status: "cancelled", respondedAt: new Date() } }
  );
  for (const r of affected) {
    emitToUser(r.fromUser, { type: "request_updated" });
    emitToUser(r.toUser, { type: "request_updated" });
  }

  res.json({
    success: true,
    message: "Entry cancelled",
    data: { feePaise, refundPaise, cancellationFeePercent: entry.cancellationFeePercent },
  });
}, "Unable to cancel");

/* GET /entry/cancel-preview – what a cancellation would cost right now */
export const cancelPreview = handle(async (req, res) => {
  await assertCancelRefundEnabled();
  const entry = await ArenaEntry.findOne({ user: req.user.id, status: "paid" }).lean();
  if (!entry) throw new ArenaError(404, "NOTHING_TO_CANCEL", "You don't have an active entry");
  if (entry.complimentary) {
    throw new ArenaError(409, "COMPLIMENTARY_ENTRY", "This entry was given to you by our team, so there is nothing to refund.");
  }
  if (entry.matchesUsed > 0) {
    throw new ArenaError(409, "MATCH_ALREADY_USED", "You've already used a match from this entry, so it can't be cancelled or refunded.");
  }

  res.json({
    success: true,
    data: {
      paidPaise: entry.paidPaise,
      cancellationFeePercent: entry.cancellationFeePercent,
      ...computeCancellation(entry.paidPaise, entry.cancellationFeePercent),
    },
  });
}, "Unable to preview cancellation");

/*
  ALL /payments/return  (public)
  Redirect gateways send the buyer back here (Cashfree with GET, PayU with POST). Nothing is trusted or settled here:
  the buyer is forwarded to the join page, which calls /entry/verify (signed in, asks the gateway) exactly like before.
*/
export const paymentReturn = (req, res) => {
  const id = String(req.query.order_id || req.body?.txnid || "").trim();
  const safe = /^[A-Za-z0-9_-]{5,64}$/.test(id) ? `?order_id=${encodeURIComponent(id)}` : "";
  res.redirect(303, `${FRONTEND_URL}/prep-buddy/app/join${safe}`);
};
