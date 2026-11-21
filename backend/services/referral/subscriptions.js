import ReferralSubPlan from "../../models/referral/ReferralSubPlan.js";
import ReferralSubscription from "../../models/referral/ReferralSubscription.js";
import ReferralSubCharge from "../../models/referral/ReferralSubCharge.js";
import ReferralRequest from "../../models/referral/ReferralRequest.js";
import User from "../../models/User.js";
import ReferralOrder from "../../models/referral/ReferralOrder.js";
import { createSubscription, fetchSubscription, listSubscriptionCharges, cancelSubscription, verifySubscriptionPayment, pickSubscriptionGateway, resolvePayment, PaymentError } from "../payments/index.js";
import { BACKEND_URL } from "../../config/urls.js";
import { gatewayPhone } from "../../utils/phone.js";
import { cleanReferralCode } from "../../utils/referralCode.js";
import { ResumeError, toRupees } from "../resume/service.js";
import { autoUnlockFor, getSettings, hasPriority, liveSubFilter, GRACE_MS } from "./core.js";
import { emitToUser } from "./hub.js";

/*
  REFERRAL SUBSCRIPTIONS  (monthly "unlimited" and monthly "priority")
  ====================================================================
  The gateway does the billing (services/payments/subscriptions.js). This file keeps OUR record of it and decides access:
    start      -> a `created` row + the gateway subscription; the buyer authorises in the checkout and is charged straight away
    confirm    -> the browser's signed proof, or a gateway webhook, turns it `active` (the SAME function, safe to repeat)
    renewals   -> arrive as `charged` webhooks; failures as `pending` (retrying) then `halted` (given up)
    cancel     -> future charges stop at once; access stays until the period already paid for ends
  Every charge (and failed attempt) is a ReferralSubCharge row, and every change is noted on the subscription's event log.
*/
const PRODUCT = "REFERRAL";
const DAY = 86400000;
const money = toRupees;
const addMonth = (d) => { const x = new Date(d); x.setMonth(x.getMonth() + 1); return x; };
const note = (sub, type, text) => { sub.events.push({ at: new Date(), type, note: String(text || "").slice(0, 200) }); if (sub.events.length > 80) sub.events = sub.events.slice(-80); };
const gwError = (e) => { if (e instanceof PaymentError) return new ResumeError(e.status >= 500 ? 502 : e.status, e.message, e.code); return e; };

export const isLive = (sub, now = new Date()) => {
  const end = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).getTime() : 0;
  if (sub.status === "cancelled") return end > now.getTime();
  if (sub.status === "active" || sub.status === "past_due") return end > now.getTime() - GRACE_MS;
  return false;
};

/* ---------- views ---------- */
export const chargeOut = (c) => ({ id: String(c._id), kind: c.kind, status: c.status, amount: money(c.amountPaise), attempt: c.attempt, method: c.method, reason: c.reason, at: c.at, periodStart: c.periodStart, periodEnd: c.periodEnd, paymentId: c.gatewayPaymentId });
export const subOut = (s, { admin = false } = {}) => {
  const live = isLive(s);
  const end = s.currentPeriodEnd ? new Date(s.currentPeriodEnd) : null;
  const cancelling = s.status === "cancelled" && live;
  return {
    id: String(s._id), kind: s.kind, planName: s.planName, price: money(s.pricePaise), status: s.status === "cancelled" && !live ? "expired" : s.status,
    live, cancelling, accessUntil: end, daysLeft: end && live ? Math.max(0, Math.ceil((end.getTime() - Date.now()) / DAY)) : 0,
    nextChargeAt: ["active", "past_due"].includes(s.status) ? s.nextChargeAt : null,
    startedAt: s.startedAt, paidCount: s.paidCount, paidTotal: money(s.paidTotalPaise), failedCount: s.failedCount, lastFailureReason: s.lastFailureReason,
    cancelledAt: s.cancelledAt, cancelReason: s.cancelReason, cancelledBy: s.cancelledBy, canCancel: ["active", "past_due"].includes(s.status), canRetry: s.status === "past_due", createdAt: s.createdAt,
    ...(admin ? { gateway: s.gateway, mode: s.mode, gatewaySubscriptionId: s.gatewaySubscriptionId, gatewayStatus: s.gatewayStatus, events: s.events } : {}),
  };
};
export const subPlanOut = (p, { admin = false } = {}) => ({ id: String(p._id), key: p.key, kind: p.kind, billing: p.billing, name: p.name, tagline: p.tagline, price: money(p.pricePaise), days: p.days, badge: p.badge, features: p.features, ...(admin ? { isActive: p.isActive, sortOrder: p.sortOrder } : {}) });

/* what a member can do right now, for the UI */
export const livePass = (userId) => ReferralOrder.findOne({ user: userId, kind: "priority", "payment.status": "paid", revokedAt: null, expiresAt: { $gt: new Date() } }).sort({ expiresAt: -1 }).select("expiresAt").lean();
/* what the member can do now, from rows already in hand (no queries) */
export const accessFrom = (subs, pass) => {
  const live = subs.filter((s) => isLive(s));
  const unlimited = live.find((s) => s.kind === "unlimited");
  const priSub = live.find((s) => s.kind === "priority");
  const until = [priSub?.currentPeriodEnd, pass?.expiresAt].filter(Boolean).sort((a, b) => b - a)[0] || null;
  return { unlimited: Boolean(unlimited), unlimitedUntil: unlimited?.currentPeriodEnd || null, priority: Boolean(priSub || pass), priorityUntil: until };
};
export const accessOf = async (userId) => {
  const [subs, pass] = await Promise.all([ReferralSubscription.find({ user: userId, ...liveSubFilter() }).lean(), livePass(userId)]);
  return accessFrom(subs, pass);
};

/* after anything that grants access: open waiting chats, and put the member's pending requests in the priority lane */
export const accessChanged = async (userId) => {
  try {
    await autoUnlockFor(userId);
    if (await hasPriority(userId)) await ReferralRequest.updateMany({ seeker: userId, status: "pending", priority: { $ne: true } }, { $set: { priority: true } });
    emitToUser(String(userId), { type: "access_updated" });
  } catch (e) { console.error("[referral] access refresh failed:", e?.message || e); }
};

/* ---------- start ---------- */
/*
  `replace`: a subscription whose renewal failed. Paying again starts a fresh subscription at the SAME price, charged now; the failing one
  is cancelled only after this one is paid (so walking away from the checkout loses nothing, and the gateway keeps retrying meanwhile).
*/
export const startSubscription = async ({ userId, planId, returnOrigin = "", replace = null, referralCode = "" }) => {
  const s = await getSettings();
  const plan = replace ? await ReferralSubPlan.findOne({ _id: replace.plan }) : await ReferralSubPlan.findOne({ _id: planId, isActive: true, billing: "monthly" });
  if (!plan) throw new ResumeError(404, "This plan isn't available right now.", "PLAN_UNAVAILABLE");
  if (!replace && ((plan.kind === "unlimited" && !s.subscriptionEnabled) || (plan.kind === "priority" && !s.priorityEnabled))) throw new ResumeError(409, "This plan isn't on sale right now.", "PLAN_OFF");
  if (replace) plan.pricePaise = replace.pricePaise; // keep the price they signed up at (not saved: only used for this checkout)
  const have = await ReferralSubscription.findOne({ user: userId, kind: plan.kind, ...liveSubFilter(), ...(replace ? { _id: { $ne: replace._id } } : {}) }).lean();
  if (have) throw new ResumeError(409, have.status === "cancelled" ? `Your current plan ends on ${new Date(have.currentPeriodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. You can subscribe again after that.` : "You already have this subscription.", "ALREADY_SUBSCRIBED");
  const user = await User.findById(userId).select("name email mobile countryCode").lean();
  if (!user) throw new ResumeError(404, "User not found.", "USER_NOT_FOUND");

  // an earlier checkout that was never finished is abandoned, not left dangling
  await ReferralSubscription.updateMany({ user: userId, kind: plan.kind, status: "created" }, { $set: { status: "failed", lastFailureReason: "Checkout not completed" } });
  const sub = await ReferralSubscription.create({ user: userId, plan: plan._id, kind: plan.kind, planName: replace?.planName || plan.name, pricePaise: plan.pricePaise, returnOrigin, referralCode: cleanReferralCode(referralCode) || replace?.referralCode || "", replaces: replace?._id || null, events: [{ at: new Date(), type: "created", note: replace ? "Paying again after a failed renewal" : "Checkout started" }] });
  try {
    const gateway = pickSubscriptionGateway(PRODUCT);
    const mode = resolvePayment(PRODUCT, { gateway }).mode;
    const known = (plan.gatewayPlans || []).find((g) => g.gateway === gateway && g.mode === mode && g.pricePaise === plan.pricePaise);
    const made = await createSubscription({
      product: PRODUCT, gateway, ref: `RSUB_${sub._id}`,
      // Redirect-style gateways (Cashfree) send the buyer back here, sometimes as a POST. Our server checks with the gateway and then
      // redirects the browser (GET) to the Credits page, so the web app never has to accept a POST.
      returnUrl: `${BACKEND_URL}/api/referral/payments/callback/${gateway}?sub=${sub._id}`,
      plan: { key: plan.key, name: plan.name, amountPaise: plan.pricePaise, period: "monthly", interval: 1, gatewayPlanId: known?.id || "" },
      customer: { id: String(userId), name: user.name, email: user.email, phone: gatewayPhone(user), rawPhone: user.mobile },
      description: `Referrals: ${plan.name}`.slice(0, 100), notes: { type: `referral_sub_${plan.kind}`, userId: String(userId), subscription: String(sub._id) },
    });
    if (!known && made.gatewayPlanId) await ReferralSubPlan.updateOne({ _id: plan._id }, { $push: { gatewayPlans: { gateway: made.gateway, mode: made.mode, pricePaise: plan.pricePaise, id: made.gatewayPlanId } } });
    sub.gateway = made.gateway; sub.mode = made.mode; sub.gatewaySubscriptionId = made.gatewaySubscriptionId; sub.gatewayPlanId = made.gatewayPlanId;
    await sub.save();
    return { subscriptionId: String(sub._id), gateway: made.gateway, checkout: made.checkout, planName: plan.name };
  } catch (e) {
    sub.status = "failed"; sub.lastFailureReason = "Could not start checkout"; await sub.save().catch(() => {});
    throw gwError(e);
  }
};

/* ---------- the one place a gateway fact changes our record (idempotent) ---------- */
/*
  type: authenticated | activated | charged | pending | halted | cancelled | completed | paused | resumed | updated | synced
  state: { status, paidCount, currentStart, currentEnd, chargeAt }   payment: { paymentId, invoiceId, amountPaise, method, reason }
*/
export const applyGatewayEvent = async (sub, { type, state = {}, payment = null, eventId = "", source = "webhook" }) => {
  if (eventId && sub.seenEvents.includes(eventId)) return sub;
  if (eventId) { sub.seenEvents.push(eventId); if (sub.seenEvents.length > 200) sub.seenEvents = sub.seenEvents.slice(-200); }
  if (state.status) sub.gatewayStatus = state.status;
  const now = new Date();
  let grew = false;

  const setPeriod = (paidFresh) => {
    const start = state.currentStart || (paidFresh ? now : sub.currentPeriodStart) || now;
    const end = state.currentEnd || (paidFresh ? addMonth(start) : sub.currentPeriodEnd) || addMonth(start);
    if (!sub.currentPeriodEnd || end > sub.currentPeriodEnd || paidFresh) { sub.currentPeriodStart = start; sub.currentPeriodEnd = end; }
    if (state.chargeAt) sub.nextChargeAt = state.chargeAt; else if (paidFresh) sub.nextChargeAt = sub.currentPeriodEnd;
  };

  if (type === "charged" || (type === "activated" && payment?.paymentId)) {
    const kind = sub.paidCount === 0 ? "initial" : "renewal";
    let fresh = true;
    if (payment?.paymentId) {
      try {
        await ReferralSubCharge.create({ subscription: sub._id, user: sub.user, kind, status: "paid", amountPaise: payment.amountPaise || sub.pricePaise, attempt: (sub.failedCount || 0) + 1, gatewayPaymentId: payment.paymentId, gatewayInvoiceId: payment.invoiceId || "", method: payment.method || "", periodStart: state.currentStart || now, periodEnd: state.currentEnd || addMonth(now), at: now, eventId });
      } catch (e) { if (e?.code === 11000) fresh = false; else throw e; } // this payment was already recorded
    }
    if (fresh) {
      sub.paidCount += 1; sub.paidTotalPaise += payment?.amountPaise || sub.pricePaise;
      sub.failedCount = 0; sub.lastFailureReason = ""; sub.status = "active";
      if (!sub.startedAt) sub.startedAt = now;
      setPeriod(true);
      note(sub, "charged", `${kind === "initial" ? "First payment" : "Renewal"} of ₹${money(payment?.amountPaise || sub.pricePaise)} received`);
      grew = true;
    }
  } else if (type === "activated" || type === "authenticated" || type === "resumed" || type === "synced" || type === "updated") {
    if (["active"].includes(state.status) && sub.paidCount > 0) { if (sub.status === "past_due") sub.status = "active"; setPeriod(false); }
    if (type === "activated" && sub.status === "created" && sub.paidCount === 0) note(sub, "authorised", "Payment method authorised");
  } else if (type === "pending") {
    if (sub.status !== "cancelled") sub.status = sub.paidCount > 0 ? "past_due" : sub.status;
    const reason = payment?.reason || "The renewal payment didn't go through";
    if (source !== "sync") {
      sub.failedCount += 1; sub.lastFailureReason = reason; sub.failNoticeClosedAt = null; // a new failure shows the message again
      await ReferralSubCharge.create({ subscription: sub._id, user: sub.user, kind: "renewal", status: "failed", amountPaise: sub.pricePaise, attempt: sub.failedCount, gatewayPaymentId: payment?.paymentId || "", gatewayInvoiceId: payment?.invoiceId || "", reason, at: now, eventId }).catch((e) => { if (e?.code !== 11000) throw e; });
    }
    if (state.chargeAt) sub.nextChargeAt = state.chargeAt;
    note(sub, "payment_failed", `${reason}${state.chargeAt ? `. Next try ${new Date(state.chargeAt).toLocaleDateString("en-IN")}` : ""}`);
  } else if (["halted", "cancelled", "completed"].includes(type)) {
    if (sub.status === "created") { sub.status = "failed"; sub.lastFailureReason = "The first payment didn't go through"; }
    else if (sub.status !== "cancelled" && sub.status !== "expired") {
      sub.status = "cancelled"; sub.cancelledAt = now; sub.cancelledBy = sub.cancelledBy || "gateway";
      sub.cancelReason = sub.cancelReason || (type === "halted" ? "Payments kept failing, so billing stopped" : type === "completed" ? "All billing cycles finished" : "Cancelled at the payment provider");
      sub.nextChargeAt = null;
    }
    note(sub, type, sub.cancelReason || type);
  } else if (type === "paused") note(sub, "paused", "Paused at the payment provider");
  await sub.save();
  if (grew && sub.replaces) {
    // the fresh payment went through: stop the failing subscription for good, so it can never charge again
    const old = await ReferralSubscription.findById(sub.replaces);
    if (old && ["active", "past_due"].includes(old.status)) await cancelOwn(old, { by: "member", reason: "Replaced by a new payment", endNow: true }).catch((e) => console.error("[referral] could not stop the replaced subscription:", e?.message || e));
  }
  if (grew) await accessChanged(sub.user);
  return sub;
};

/* ---------- confirm from the browser, then trust only the gateway ---------- */
export const confirmSubscription = async (sub, proof) => {
  if (sub.status === "active" && sub.paidCount > 0) return sub;
  let v;
  try { v = await verifySubscriptionPayment({ product: PRODUCT, gateway: sub.gateway, mode: sub.mode, gatewaySubscriptionId: sub.gatewaySubscriptionId, proof }); } catch (e) { throw gwError(e); }
  if (!v?.valid) throw new ResumeError(400, "We couldn't confirm this payment. If money was taken, it will show up here shortly.", "VERIFY_FAILED");
  let state = {};
  try { state = await fetchSubscription({ product: PRODUCT, gateway: sub.gateway, mode: sub.mode, gatewaySubscriptionId: sub.gatewaySubscriptionId }); } catch (e) { console.error("[referral] subscription fetch after payment failed:", e?.message || e); }
  return applyGatewayEvent(sub, { type: "charged", state, payment: { paymentId: v.paymentId, amountPaise: sub.pricePaise }, source: "client" });
};

/* ---------- reconcile with the gateway (webhook missed, or an admin asked) ---------- */
export const syncSubscription = async (sub) => {
  if (!sub.gatewaySubscriptionId) return sub;
  const ref = { product: PRODUCT, gateway: sub.gateway, mode: sub.mode, gatewaySubscriptionId: sub.gatewaySubscriptionId };
  let state, charges = [];
  try { [state, charges] = await Promise.all([fetchSubscription(ref), listSubscriptionCharges(ref).catch(() => [])]); } catch (e) { throw gwError(e); }
  for (const c of charges.filter((x) => x.status === "paid" && x.paymentId).sort((a, b) => a.at - b.at)) {
    const known = await ReferralSubCharge.exists({ subscription: sub._id, gatewayPaymentId: c.paymentId, status: "paid" });
    if (!known) await applyGatewayEvent(sub, { type: "charged", state: { ...state, currentStart: c.periodStart || state.currentStart, currentEnd: c.periodEnd || state.currentEnd }, payment: { paymentId: c.paymentId, invoiceId: c.invoiceId, amountPaise: c.amountPaise }, source: "sync" });
  }
  const type = { active: "synced", authenticated: "synced", pending: "pending", halted: "halted", cancelled: "cancelled", completed: "completed", paused: "paused" }[state.status] || "synced";
  const fresh = await ReferralSubscription.findById(sub._id);
  await applyGatewayEvent(fresh, { type, state, source: "sync" });
  note(fresh, "synced", `Checked with the payment provider (${state.status})`); await fresh.save();
  return fresh;
};

/* ---------- cancel ---------- */
export const cancelOwn = async (sub, { by = "member", reason = "", endNow = false } = {}) => {
  if (sub.status === "cancelled" && !endNow) return sub;
  if (!["created", "active", "past_due", "cancelled"].includes(sub.status)) throw new ResumeError(409, "This subscription isn't active.", "NOT_ACTIVE");
  // stop the billing FIRST: only mark it cancelled once the gateway confirms, so a failure never leaves someone still being charged
  if (sub.gatewaySubscriptionId && sub.status !== "cancelled") {
    try { await cancelSubscription({ product: PRODUCT, gateway: sub.gateway, mode: sub.mode, gatewaySubscriptionId: sub.gatewaySubscriptionId, atCycleEnd: false }); }
    catch (e) {
      const gone = /cancel|completed|expired|not in a state|already/i.test(String(e?.detail || e?.message || ""));
      if (!gone) throw gwError(e);
    }
  }
  const now = new Date();
  if (sub.status === "created") { sub.status = "failed"; sub.lastFailureReason = "Cancelled before payment"; }
  else {
    sub.status = "cancelled"; sub.cancelledAt = sub.cancelledAt || now; sub.cancelledBy = by; sub.cancelReason = String(reason || "").slice(0, 300) || sub.cancelReason; sub.nextChargeAt = null;
    if (endNow) sub.currentPeriodEnd = now;
  }
  note(sub, "cancelled", endNow ? `Ended now by ${by}` : `Cancelled by ${by}. Access continues to ${sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString("en-IN") : "the end of the period"}`);
  await sub.save();
  emitToUser(String(sub.user), { type: "access_updated" });
  return sub;
};

export const findByGatewayId = (gateway, id) => ReferralSubscription.findOne({ gateway, gatewaySubscriptionId: id });
