import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { z } from "zod";

import MemoryOrder from "../../models/memory/MemoryOrder.js";
import User from "../../models/User.js";
import { amountToPaise } from "../../utils/razorpay.js";
import { MemoryError, assertId, availableCredits, getSettings, parse, sendError } from "../../services/memory/memoryService.js";
import { activeGateways, getGateway, pickGateway, publicUrls } from "../../services/memory/payments/index.js";
import { refreshOrder, settleOrder } from "../../services/memory/payments/settle.js";
import { dropLegacyMemoryIndexes, isLegacyIndexError } from "../../services/memory/migrate.js";

const uid = (req) => String(req.user?.id || req.user?._id);
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const handler = (fn) =>
  asyncHandler(async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      return sendError(res, err);
    }
  });

const FRONTEND = () => String(process.env.FRONTEND_URL || "https://www.targettrek.in").replace(/\/+$/, "");
const resultUrl = (orderId, status, origin) => `${origin || FRONTEND()}/memories/payment-result?order=${encodeURIComponent(orderId)}&status=${status}`;

/* Where the buyer may be sent back to: the site's own address, its www / non-www twin, and localhost while developing. Anything else is ignored. */
const allowedReturnOrigin = (raw) => {
  let o;
  try { o = new URL(String(raw)).origin; } catch { return ""; }
  const site = new URL(FRONTEND()).origin;
  const twin = site.includes("//www.") ? site.replace("//www.", "//") : site.replace("//", "//www.");
  if (o === site || o === twin) return o;
  if (process.env.NODE_ENV !== "production" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)) return o;
  return "";
};

/* ---------- create ---------- */
export const createPayment = handler(async (req, res) => {
  const b = parse(z.object({ gateway: z.string().max(30).optional(), returnOrigin: z.string().max(120).optional() }), req.body);
  const s = await getSettings();
  if (!s.enabled) throw new MemoryError(503, "Memory pages are paused right now.", "DISABLED");
  if (!(s.price > 0)) throw new MemoryError(400, "Pages are free right now. No payment needed.", "FREE");

  const adapter = pickGateway(s, b.gateway);
  if (!adapter) {
    throw new MemoryError(b.gateway ? 400 : 503, b.gateway ? "That payment method is not available." : "No payment method is available right now.", "NO_GATEWAY");
  }

  const orderId = new mongoose.Types.ObjectId();
  const urls = publicUrls(orderId);
  if (adapter.needsPublicUrl && !urls.base) throw new MemoryError(500, "BACKEND_URL is not configured on the server.", "BACKEND_URL_MISSING");

  const user = await User.findById(uid(req)).select("name email mobile").lean();
  if (!user) throw new MemoryError(404, "User not found.", "USER_NOT_FOUND");

  const amountPaise = amountToPaise(s.price);
  let gatewayOrderId;
  let checkout;
  try {
    ({ gatewayOrderId, checkout } = await adapter.createCheckout({
      order: { _id: orderId, user: uid(req), amount: amountPaise },
      user: { ...user, mobile: user.mobile || req.body?.phone },
      amountPaise,
      urls,
    }));
  } catch (e) {
    if (e instanceof MemoryError) throw e;
    // A gateway's own error (bad keys, outage, rate limit...) is OUR 502. Never relay its status: a gateway "401 Unauthorized" would look like the user's session ended.
    console.error(`[memory] ${adapter.id} could not create the order:`, e?.error?.description || e?.message || e);
    throw new MemoryError(502, "The payment provider couldn't start the payment. Please try again in a moment.", "GATEWAY_ERROR");
  }
  const doc = { _id: orderId, user: uid(req), amount: amountPaise, gateway: adapter.id, gatewayOrderId, returnOrigin: b.returnOrigin ? allowedReturnOrigin(b.returnOrigin) : "" };
  try {
    await MemoryOrder.create(doc);
  } catch (e) {
    if (!isLegacyIndexError(e)) throw e;
    await dropLegacyMemoryIndexes(); // heals itself: remove the leftover unique index and save the order again
    await MemoryOrder.create(doc);
  }
  ok(res, { orderId: String(orderId), gateway: adapter.id, amount: amountPaise, currency: "INR", checkout }, 201);
});

const ownOrder = async (req) => {
  assertId(req.params.orderId || req.body?.orderId, "order id");
  const order = await MemoryOrder.findOne({ _id: req.params.orderId || req.body.orderId, user: uid(req) });
  if (!order) throw new MemoryError(404, "Order not found.", "ORDER_NOT_FOUND");
  return order;
};

/* ---------- browser says "I paid" (signed callback for Razorpay-style gateways) ---------- */
export const verifyPayment = handler(async (req, res) => {
  const order = await ownOrder(req);
  const adapter = getGateway(order.gateway);
  if (!adapter) throw new MemoryError(400, "Unsupported payment method.", "NO_GATEWAY");

  let result;
  if (adapter.verifyClient) {
    const v = adapter.verifyClient(order, req.body?.payload || {});
    if (!v.paid) {
      await MemoryOrder.updateOne({ _id: order._id, status: "created" }, { status: "failed", failureReason: v.reason || "VERIFY_FAILED" });
      throw new MemoryError(400, "Payment verification failed.", v.reason || "VERIFY_FAILED");
    }
    result = await settleOrder(order, v);
  } else {
    result = await refreshOrder(order, adapter); // gateways without a signed browser callback: ask the gateway
  }
  ok(res, { status: result, credits: await availableCredits(uid(req)) });
});

/* ---------- reconcile (also the recovery path when the browser closed after paying) ---------- */
export const paymentStatus = handler(async (req, res) => {
  const order = await ownOrder(req);
  const adapter = getGateway(order.gateway);
  const state = adapter && order.status !== "paid" ? await refreshOrder(order, adapter) : order.status === "paid" ? "paid" : order.status;
  ok(res, { status: state === "pending" ? "created" : state, credits: await availableCredits(uid(req)) });
});

export const myPayments = handler(async (req, res) => {
  const rows = await MemoryOrder.find({ user: uid(req) }).sort({ createdAt: -1 }).limit(50).select("amount currency gateway status createdAt paidAt").lean();
  ok(res, rows);
});

/* ---------- browser returns from a redirect gateway (public, no login) ---------- */
export const gatewayCallback = asyncHandler(async (req, res) => {
  const ref = String(req.query.ref || "");
  const adapter = getGateway(req.params.gateway);
  try {
    if (!adapter || !mongoose.isValidObjectId(ref)) return res.redirect(303, resultUrl("", "failed"));
    const order = await MemoryOrder.findOne({ _id: ref, gateway: adapter.id });
    if (!order) return res.redirect(303, resultUrl("", "failed"));

    // The query/body is only a hint. The gateway is asked directly, and the amount must match.
    const claimed = adapter.parseCallback?.({ ...req.query, ...req.body })?.gatewayOrderId;
    if (claimed && claimed !== order.gatewayOrderId) return res.redirect(303, resultUrl(order._id, "failed", order.returnOrigin));

    const state = await refreshOrder(order, adapter);
    return res.redirect(303, resultUrl(order._id, state === "paid" ? "paid" : state === "failed" ? "failed" : "pending", order.returnOrigin));
  } catch (e) {
    console.error("[memory] callback error:", e.message);
    return res.redirect(303, resultUrl(ref, "pending")); // user can still be reconciled by the status endpoint
  }
});

/* ---------- gateway -> server webhook (raw body, signature verified by the adapter) ---------- */
export const gatewayWebhook = asyncHandler(async (req, res) => {
  const adapter = getGateway(req.params.gateway);
  if (!adapter?.parseWebhook || !Buffer.isBuffer(req.body)) return res.status(404).json({ success: false });

  const parsed = adapter.parseWebhook({ rawBody: req.body.toString("utf8"), headers: req.headers });
  if (!parsed.valid) return res.status(400).json({ success: false, message: "Invalid signature" });
  if (parsed.ignore) return res.json({ success: true });

  try {
    const order = await MemoryOrder.findOne({ gateway: adapter.id, gatewayOrderId: parsed.gatewayOrderId });
    if (order) await refreshOrder(order, adapter); // re-checked with the gateway, not taken from the webhook body
    return res.json({ success: true });
  } catch (e) {
    console.error("[memory] webhook error:", e.message);
    return res.status(500).json({ success: false }); // gateway will retry
  }
});

/** Exposed for the config endpoint. */
export const gatewaysForUsers = (settings) => activeGateways(settings).map((a) => ({ id: a.id, label: a.label }));
