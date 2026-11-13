import { FRONTEND_URL } from "../../config/urls.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { z } from "zod";

import MemoryOrder from "../../models/memory/MemoryOrder.js";
import MemoryOccasion from "../../models/memory/MemoryOccasion.js";
import MemoryPage from "../../models/memory/MemoryPage.js";
import User from "../../models/User.js";
import { MemoryError, assertId, availableCredits, getSettings, isExpired, parse, sendError } from "../../services/memory/memoryService.js";
import { buildQuote, findCoveringCredit, findUpgradeCredit, priceOf, resolveTheme, toRupees } from "../../services/memory/catalog.js";
import { activeGateways, getGateway, pickGateway, publicUrls } from "../../services/memory/payments/index.js";
import { refreshOrder, settleOrder } from "../../services/memory/payments/settle.js";
import { buildAttribution } from "../../utils/attribution.js";
import { captureRequestContext } from "../../services/memory/metaCapi.js";
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

const FRONTEND = () => FRONTEND_URL;
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

/* ---------- what is being bought ---------- */

const packsField = z.record(z.string().max(30), z.number().int().min(0).max(100)).optional();
const buyBody = {
  kind: z.enum(["page", "addon", "upgrade"]).default("page"),
  occasionId: z.string().optional(), // kind "page": the template being bought
  theme: z.string().max(30).optional(), // kind "page": the look
  pageId: z.string().optional(), // kind "addon" / "upgrade": the page that gets the room / the better look
  packs: packsField, // { addonKey: number of packs }
};

/**
 * Works out what a request is buying and what it costs. Used by the quote (what the screen shows) and by the payment itself,
 * so the number on the screen and the number charged can never differ. Nothing the browser says about money is trusted.
 */
const priceRequest = async (req, b, s) => {
  if (!s.enabled) throw new MemoryError(503, "Memory pages are paused right now.", "DISABLED");
  if (b.kind === "addon") {
    assertId(b.pageId, "page id");
    const page = await MemoryPage.findOne({ _id: b.pageId, user: uid(req) }).select("extra status expiresAt occasion");
    if (!page) throw new MemoryError(404, "Page not found.", "PAGE_NOT_FOUND");
    if (isExpired(page)) throw new MemoryError(404, "This page has expired.", "PAGE_EXPIRED");
    if (page.status === "blocked") throw new MemoryError(403, "This page was blocked by an admin.", "PAGE_BLOCKED");
    const quote = await buildQuote({ settings: s, packs: b.packs, forPage: page });
    if (!quote.addons.length) throw new MemoryError(400, "Pick at least one add-on.", "NOTHING_TO_BUY");
    return { kind: "addon", page, quote, occasion: null, themeId: "" };
  }
  if (b.kind === "upgrade") {
    // an existing page moves to a dearer look: the user pays only what is still missing from what they paid for it
    assertId(b.pageId, "page id");
    const page = await MemoryPage.findOne({ _id: b.pageId, user: uid(req) }).select("extra status expiresAt occasion paidPricePaise");
    if (!page) throw new MemoryError(404, "Page not found.", "PAGE_NOT_FOUND");
    if (isExpired(page)) throw new MemoryError(404, "This page has expired.", "PAGE_EXPIRED");
    if (page.status === "blocked") throw new MemoryError(403, "This page was blocked by an admin.", "PAGE_BLOCKED");
    if (b.occasionId) assertId(b.occasionId, "template");
    const occasion = await MemoryOccasion.findOne({ _id: b.occasionId || page.occasion, isActive: true }).lean();
    if (!occasion) throw new MemoryError(400, "This template isn't available right now.", "INVALID_OCCASION");
    const themeId = resolveTheme(occasion, b.theme);
    const full = priceOf(occasion, themeId, s);
    const paid = page.paidPricePaise;
    if (paid == null || full <= paid) throw new MemoryError(409, "This page can already use that look. No payment needed.", "ALREADY_COVERED");
    const quote = await buildQuote({ settings: s, packs: b.packs, forPage: page, baseOverride: full - paid }); // forPage: packs the page already has count towards the most it may hold
    return { kind: "upgrade", page, quote, occasion, themeId, upgrade: { fromPaise: paid, fullPaise: full }, credit: null };
  }
  assertId(b.occasionId, "template");
  const occasion = await MemoryOccasion.findOne({ _id: b.occasionId, isActive: true }).lean();
  if (!occasion) throw new MemoryError(400, "This template isn't available right now.", "INVALID_OCCASION");
  const themeId = resolveTheme(occasion, b.theme);
  const full = priceOf(occasion, themeId, s);
  // a paid page the user has not used yet, worth less: they pay only the difference (Rs 199 held, look at Rs 209 = Rs 10) instead of buying again
  const cover = await findCoveringCredit(uid(req), full);
  if (cover) {
    // A pass (paid, code, Gumroad or admin) already covers this look: the page itself costs nothing. Only extra room is paid for, and it goes onto that pass.
    const quote = await buildQuote({ settings: s, occasion, themeId, packs: b.packs, forPage: { extra: cover.extra || {} }, baseOverride: 0 });
    return { kind: "page", page: null, quote, occasion, themeId, covered: !quote.addons.length, credit: quote.addons.length ? cover : null, passRoom: true, upgrade: null };
  }
  const credit = await findUpgradeCredit(uid(req), full);
  const quote = await buildQuote({ settings: s, occasion, themeId, packs: b.packs, forPage: credit ? { extra: credit.extra || {} } : null, baseOverride: credit ? full - credit.maxPricePaise : null });
  return { kind: "page", page: null, quote, occasion, themeId, covered: false, credit, upgrade: credit ? { fromPaise: credit.maxPricePaise, fullPaise: full } : null };
};

const quoteOut = (r) => ({
  kind: r.kind, currency: "INR",
  base: toRupees(r.quote.basePaise),
  addons: r.quote.addons.map((l) => ({ key: l.key, name: l.name, packs: l.packs, grant: l.grant, price: toRupees(l.pricePaise) })),
  addonsTotal: toRupees(r.quote.addonsPaise),
  upgrade: r.upgrade ? { from: toRupees(r.upgrade.fromPaise), full: toRupees(r.upgrade.fullPaise) } : null, // base is then only the difference
  total: toRupees(r.quote.totalPaise),
});

/* ---------- quote: the price of a selection, no order is made ---------- */
export const quote = handler(async (req, res) => {
  const b = parse(z.object(buyBody), req.body);
  const s = await getSettings();
  const r = await priceRequest(req, b, s);
  ok(res, { ...quoteOut(r), covered: Boolean(r.covered) });
});

/* ---------- create ---------- */
export const createPayment = handler(async (req, res) => {
  const b = parse(z.object({ gateway: z.string().max(30).optional(), returnOrigin: z.string().max(120).optional(), attribution: z.any().optional(), ...buyBody }), req.body);
  const s = await getSettings();
  const r = await priceRequest(req, b, s);
  const amountPaise = r.quote.totalPaise;
  // Never charge twice for a page the user can already create: they use the pass they hold, and buy add-ons on the page itself.
  if (r.covered) {
    throw new MemoryError(409, "You already have a pass for this. Create your page first, then add extras to it any time.", "ALREADY_COVERED");
  }
  if (!(amountPaise > 0)) throw new MemoryError(400, "This is free. No payment needed.", "FREE");

  const adapter = pickGateway(s, b.gateway);
  if (!adapter) {
    throw new MemoryError(b.gateway ? 400 : 503, b.gateway ? "That payment method is not available." : "No payment method is available right now.", "NO_GATEWAY");
  }

  const orderId = new mongoose.Types.ObjectId();
  const urls = publicUrls(orderId);
  if (adapter.needsPublicUrl && !urls.base) throw new MemoryError(500, "BACKEND_URL is not configured on the server.", "BACKEND_URL_MISSING");

  const user = await User.findById(uid(req)).select("name email mobile countryCode").lean();
  if (!user) throw new MemoryError(404, "User not found.", "USER_NOT_FOUND");

  let gatewayOrderId;
  let checkout;
  try {
    ({ gatewayOrderId, checkout } = await adapter.createCheckout({
      order: { _id: orderId, user: uid(req), amount: amountPaise },
      user, // name, email and mobile all come from the saved account
      amountPaise,
      urls,
    }));
  } catch (e) {
    if (e instanceof MemoryError) throw e;
    // A gateway's own error (bad keys, outage, rate limit...) is OUR 502. Never relay its status: a gateway "401 Unauthorized" would look like the user's session ended.
    console.error(`[memory] ${adapter.id} could not create the order:`, e?.error?.description || e?.message || e);
    throw new MemoryError(502, "The payment provider couldn't start the payment. Please try again in a moment.", "GATEWAY_ERROR");
  }
  const doc = {
    _id: orderId, user: uid(req), amount: amountPaise, gateway: adapter.id, gatewayOrderId, returnOrigin: b.returnOrigin ? allowedReturnOrigin(b.returnOrigin) : "",
    kind: r.kind, occasion: r.occasion?._id || null, theme: r.themeId || "", page: r.page?._id || null, basePaise: r.quote.basePaise, addons: r.quote.addons,
    upgradeCredit: r.credit?._id || null, fullPricePaise: r.upgrade?.fullPaise || 0, // (a room-only order on a pass has no look price to add)
  };
  try { // Meta tracking data is best effort: it must never stop a checkout
    doc.attribution = buildAttribution(b.attribution);
    Object.assign(doc, captureRequestContext(req, doc.returnOrigin));
  } catch (e) {
    console.error("[memory] could not save ad attribution:", e?.message || e);
  }
  try {
    await MemoryOrder.create(doc);
  } catch (e) {
    if (!isLegacyIndexError(e)) throw e;
    await dropLegacyMemoryIndexes(); // heals itself: remove the leftover unique index and save the order again
    await MemoryOrder.create(doc);
  }
  ok(res, { orderId: String(orderId), gateway: adapter.id, amount: amountPaise, currency: "INR", kind: r.kind, pageId: r.page ? String(r.page._id) : null, checkout }, 201);
});

/* what the screen needs to continue after a payment: back to the template that was bought, or to the page that got the room */
const orderInfo = async (order) => {
  const occ = order.occasion ? await MemoryOccasion.findById(order.occasion).select("theme").lean() : null;
  return { kind: order.kind, pageId: order.page ? String(order.page) : null, template: occ?.theme || null, theme: order.theme || "" };
};

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
    const v = await adapter.verifyClient(order, req.body?.payload || {});
    if (v.pending) {
      result = await refreshOrder(order, adapter); // signed, but not captured yet (or the gateway is slow): ask the gateway again
    } else if (!v.paid) {
      await MemoryOrder.updateOne({ _id: order._id, status: "created" }, { status: "failed", failureReason: v.reason || "VERIFY_FAILED" });
      throw new MemoryError(400, "Payment verification failed.", v.reason || "VERIFY_FAILED");
    } else {
      result = await settleOrder(order, v);
    }
  } else {
    result = await refreshOrder(order, adapter); // gateways without a signed browser callback: ask the gateway
  }
  ok(res, { status: result, credits: await availableCredits(uid(req)), ...(await orderInfo(order)) });
});

/* ---------- reconcile (also the recovery path when the browser closed after paying) ---------- */
export const paymentStatus = handler(async (req, res) => {
  const order = await ownOrder(req);
  const adapter = getGateway(order.gateway);
  const state = adapter && order.status !== "paid" ? await refreshOrder(order, adapter) : order.status === "paid" ? "paid" : order.status;
  ok(res, { status: state === "pending" ? "created" : state, credits: await availableCredits(uid(req)), ...(await orderInfo(order)) });
});

export const myPayments = handler(async (req, res) => {
  const rows = await MemoryOrder.find({ user: uid(req) }).sort({ createdAt: -1 }).limit(50).select("amount currency gateway status kind theme addons createdAt paidAt").lean();
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
