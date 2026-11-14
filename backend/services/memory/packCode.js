import mongoose from "mongoose";
import MemoryCode from "../../models/memory/MemoryCode.js";
import MemorySettings from "../../models/memory/MemorySettings.js";
import Order from "../../models/Order.js";
import Book from "../../models/Book.js";
import sendMail from "../../utils/MailSender.js";
import { MemoryError, lifetimeDays, newPackCode } from "./memoryService.js";
import { SUPPORT_EMAIL, buildPackCodeMail } from "./packCodeMail.js";

/*
  LIFETIME PACK  ->  ONE MEMORIES PAGE CODE, BY EMAIL
  ---------------------------------------------------
  The moment a Lifetime-pack order is paid:
    1. one unique code is made (one per order: a unique index on orderId stops a repeated payment callback from making a second);
    2. the "Memories page code" email is put on the mail queue (Amazon SQS) and the call returns at once. The mail worker sends it
       and retries; when the queue is not configured the mail goes out directly, so a purchase is never left without its email;
    3. when the buyer signs up / logs in to Memories with that email, the page is added to their account by itself (services/memory/codes.js).

  This job is separate from the ebook-PDF mail and the Prep Arena mail: it has its own state (MemoryCode.mail), its own retries and
  its own admin "resend", so a failure in one never holds back the others. Every step is safe to repeat.
*/

const RETRY_DELAYS_MS = [0, 10_000, 60_000, 5 * 60_000];
const CLAIM_LEASE_MS = 2 * 60_000;

const log = (...a) => console.log("[memory-pack-code]", ...a);

const isDup = (e) => e?.code === 11000 || e?.writeErrors?.some((w) => w.code === 11000);
const cleanEmail = (v) => String(v || "").toLowerCase().trim();
const looksLikeEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/** Is this paid order a Lifetime pack? Returns the product (or null). */
const lifetimeProduct = async (order) => {
  const product = await Book.findById(order.bookId).select("title membership").lean();
  return product?.membership?.plan === "lifetime" ? product : null;
};

/** The code of an order, made on first use. Idempotent. */
export const ensurePackCode = async ({ order, product, email }) => {
  const existing = await MemoryCode.findOne({ orderId: order.orderId });
  if (existing) return existing;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      return await MemoryCode.create({
        code: newPackCode(),
        maxUses: 1,
        source: "lifetime_pack",
        ownerEmail: email,
        ownerName: order.customer?.name || "",
        orderId: order.orderId,
        bookTitle: product.title || "",
        note: `Lifetime pack, order ${order.orderId}`,
      });
    } catch (e) {
      if (!isDup(e)) throw e;
      const again = await MemoryCode.findOne({ orderId: order.orderId }); // another callback won the race
      if (again) return again;
      // otherwise the random code collided with an existing one: draw another
    }
  }
  throw new Error("Could not make a unique code");
};

/**
 * Send (or re-send) the email for a code. With `force` (admin resend) it ignores whether it was already sent.
 * Claims the job first, so two callbacks at the same moment send one email. Throws when it could not be handed to the mail system.
 */
export const sendPackCodeMail = async (codeDoc, { to, force = false } = {}) => {
  const address = cleanEmail(to || codeDoc.ownerEmail);
  if (!looksLikeEmail(address)) throw new MemoryError(400, "This order has no valid email address.", "NO_EMAIL");

  const lease = new Date(Date.now() - CLAIM_LEASE_MS);
  const claimed = await MemoryCode.findOneAndUpdate(
    {
      _id: codeDoc._id,
      $or: [
        { "mail.status": { $in: force ? ["none", "failed", "queued", "sent", "sending"] : ["none", "failed"] } },
        { "mail.status": "sending", "mail.claimedAt": { $lt: lease } }, // a crashed attempt: take it over
      ],
    },
    { $set: { "mail.status": "sending", "mail.claimedAt": new Date() } },
    { new: true }
  );
  if (!claimed) {
    // an admin resend must never report success when nothing was sent
    if (force) throw new MemoryError(409, "This email is being sent right now. Try again in a moment.", "MAIL_IN_PROGRESS");
    return { skipped: true, status: codeDoc.mail?.status };
  }

  try {
    const settings = await MemorySettings.findOne({ key: "main" }).lean();
    const mail = buildPackCodeMail({
      name: claimed.ownerName,
      email: address,
      code: claimed.code,
      orderId: claimed.orderId || "",
      bookTitle: claimed.bookTitle || "your Lifetime pack",
      onlineDays: lifetimeDays(settings),
      expiresAt: claimed.expiresAt,
    });

    // no `sync`: when the queue is configured this returns as soon as the message is on it
    const result = await sendMail(address, mail.subject, mail.text, mail.html, {
      replyTo: SUPPORT_EMAIL,
      headers: { "X-Entity-Ref-ID": `memory-code-${claimed._id}` },
    });

    const queued = Boolean(result?.queued);
    await MemoryCode.updateOne(
      { _id: claimed._id },
      {
        $set: {
          "mail.status": queued ? "queued" : "sent",
          ...(queued ? { "mail.queuedAt": new Date() } : { "mail.sentAt": new Date() }),
          "mail.lastTo": address,
          "mail.lastError": "",
          "mail.messageId": String(result?.messageId || ""),
          ...(address !== claimed.ownerEmail && force ? { ownerEmail: address } : {}), // an admin sent it to a different address: the page is claimed by that one
        },
        $inc: { "mail.sends": 1 },
      }
    );
    log(`${queued ? "queued" : "sent"} ${claimed.code} -> ${address}`);
    return { status: queued ? "queued" : "sent", to: address };
  } catch (error) {
    await MemoryCode.updateOne({ _id: claimed._id }, { $set: { "mail.status": "failed", "mail.lastError": String(error?.message || error).slice(0, 300), "mail.lastTo": address } });
    throw error;
  }
};

/** Paid order -> code -> email. Not a Lifetime pack: does nothing (returns null). */
export const deliverPackCodeForOrder = async (orderOrId, { force = false, to } = {}) => {
  const ref = orderOrId?._id || orderOrId;
  // accepts the order's database id or its public order number (what the Members page has)
  const order = mongoose.isValidObjectId(ref) ? await Order.findById(ref).lean() : await Order.findOne({ orderId: String(ref) }).lean();
  if (!order) throw new MemoryError(404, "Order not found.", "ORDER_NOT_FOUND");
  if (order.orderStatus !== "PAID") {
    if (force) throw new MemoryError(400, "Only paid orders can be emailed.", "ORDER_NOT_PAID");
    return null;
  }

  const product = await lifetimeProduct(order);
  if (!product) {
    if (force) throw new MemoryError(400, "This order is not a Lifetime pack, so it has no Memories code.", "NOT_LIFETIME");
    return null;
  }

  const email = cleanEmail(order.customer?.email);
  if (!looksLikeEmail(email) && !to) throw new MemoryError(400, "This order has no valid customer email.", "NO_EMAIL");

  const code = await ensurePackCode({ order, product, email });
  if (force) assertResendable(code);
  const outcome = await sendPackCodeMail(code, { to, force });
  return { code, ...outcome };
};

/** The admin should not re-send a code nobody can use any more. */
export const assertResendable = (code) => {
  if (!code.isActive) throw new MemoryError(409, "This code is switched off. Enable it first.", "CODE_DISABLED");
  if (code.usedCount >= code.maxUses) throw new MemoryError(409, "This code has already been used to make a page.", "CODE_USED");
  if (code.expiresAt && code.expiresAt < new Date()) throw new MemoryError(409, "This code has expired.", "CODE_EXPIRED");
};

/**
 * Fire-and-forget, called the moment a payment is confirmed. Starts immediately (setImmediate) and, if the database or the mail
 * system hiccups, tries again after 10s, 1 min and 5 min. Never throws, never blocks the payment response.
 */
export const schedulePackCodeMail = (order) => {
  if (!order?._id) return;
  const attempt = (n) => {
    const run = () =>
      deliverPackCodeForOrder(order)
        .catch((error) => {
          console.error(`[memory-pack-code] order ${order.orderId || order._id} failed (try ${n + 1}/${RETRY_DELAYS_MS.length}):`, error.message);
          if (n + 1 < RETRY_DELAYS_MS.length) attempt(n + 1);
        });
    if (RETRY_DELAYS_MS[n] === 0) setImmediate(run);
    else setTimeout(run, RETRY_DELAYS_MS[n]).unref?.();
  };
  attempt(0);
};

/* ------------------------------------------------------------------ safety net */

const SWEEP_EVERY_MS = 5 * 60_000;
const SWEEP_LOOKBACK_MS = 48 * 60 * 60_000;
const SWEEP_MIN_AGE_MS = 90_000;

/** Picks up what a restart or an outage lost: paid Lifetime orders with no code yet, and codes whose email never got out. */
export const sweepPackCodes = async () => {
  const since = new Date(Date.now() - SWEEP_LOOKBACK_MS);
  const settled = new Date(Date.now() - SWEEP_MIN_AGE_MS);

  const lifetimeBooks = await Book.find({ "membership.plan": "lifetime" }).select("_id").lean();
  if (lifetimeBooks.length) {
    const orders = await Order.find({
      bookId: { $in: lifetimeBooks.map((b) => b._id) },
      orderStatus: "PAID",
      "payment.paidAt": { $gte: since, $lte: settled },
    })
      .select("_id orderId")
      .limit(200)
      .lean();

    if (orders.length) {
      const have = new Set((await MemoryCode.find({ orderId: { $in: orders.map((o) => o.orderId) }, "mail.status": { $in: ["queued", "sent"] } }).select("orderId").lean()).map((c) => c.orderId));
      for (const order of orders) {
        if (have.has(order.orderId)) continue;
        await deliverPackCodeForOrder(order._id).catch((e) => console.error(`[memory-pack-code] sweep ${order.orderId}:`, e.message));
      }
    }
  }
};

export const startPackCodeSweeper = () => {
  const run = () => sweepPackCodes().catch((e) => console.error("[memory-pack-code] sweep failed:", e.message));
  setTimeout(run, 45_000).unref?.();
  setInterval(run, SWEEP_EVERY_MS).unref?.();
};
