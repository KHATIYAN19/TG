import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowRight, Check, Plus, Receipt } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { buyPlan, buyPriority, cancelSubscription, retrySubscription, dateFmt, dayFmt, formatINR, getPlans, getSubscription, orderStatus, startSubscription } from "./api";
import { Btn, Skeleton, cx } from "../resume/ui";
import { Badge, Empty, Ico, PageHead, useConfirm } from "./ui";
import { useRef_ } from "./RefContext";

const B = "/referral/app";
export const HELP = "supporttargettrek@gmail.com";

/* the three rules, in short sentences (also on the Payments page) */
export function Policy() {
  return (
    <ul className="rf-policy" aria-label="Billing rules">
      <li><span className="e" aria-hidden>✅</span><div><b>Cancel any time</b>No more charges after you cancel. Your plan stays on until it expires.</div></li>
      <li><span className="e" aria-hidden>🚫</span><div><b>No refunds</b>Payments are final. Unused days or credits aren't refunded.</div></li>
      <li><span className="e" aria-hidden>📧</span><div><b>Charged twice?</b>Email <a href={`mailto:${HELP}?subject=Duplicate%20charge`}>{HELP}</a> with the payment ID. We refund duplicate charges.</div></li>
    </ul>
  );
}

const SUB_STATE = { active: ["🟢 Active", "ok"], past_due: ["⚠️ Payment failed · retrying", "warn"], cancelled: ["Cancelled", "muted"], expired: ["Ended", "muted"], created: ["Not paid", "warn"], failed: ["Not paid", "bad"] };

/* ------------------------------------------------------------ a plan on sale */
function PlanCard({ e, tone, name, tagline, price, unit, compareAt, per, features, badge, fine, on, busy, onBuy, label }) {
  return (
    <article className={cx("rf-card rf-plan", badge && "best", on && "on")}>
      {badge && <span className="rf-ribbon">{badge}</span>}
      <div className="name"><Ico e={e} tone={tone} size="sm" /><div><b>{name}</b>{tagline && <p className="rf-xs">{tagline}</p>}</div></div>
      <div className="price">{formatINR(price)}<small>{unit}</small>{compareAt > price && <s>{formatINR(compareAt)}</s>}</div>
      {per && <p className="per">{per}</p>}
      {features?.length > 0 && <ul>{features.map((f) => <li key={f}><Check size={15} weight="bold" aria-hidden />{f}</li>)}</ul>}
      <Btn block size="lg" loading={busy} disabled={on} onClick={onBuy}>{on ? "✅ Active" : label}</Btn>
      {fine && <p className="fine">{fine}</p>}
    </article>
  );
}

/* ------------------------------------------------------------ one subscription the member has */
function SubCard({ sub: s, busy, onCancel, onPay }) {
  const [label, tone] = SUB_STATE[s.status] || [s.status, "muted"];
  const total = 30, left = Math.min(total, s.daysLeft || 0);
  return (
    <article className="rf-card rf-sub-card">
      <div className="top">
        <div className="rf-person"><Ico e={s.kind === "unlimited" ? "♾️" : "👑"} tone={s.kind === "unlimited" ? "green" : "gold"} /><div><b>{s.planName}</b><span className="s">{formatINR(s.price)} / month</span></div></div>
        <Badge tone={s.cancelling ? "warn" : tone}>{s.cancelling ? `⏳ Ends ${dayFmt(s.accessUntil)}` : label}</Badge>
      </div>
      {s.live && <div style={{ display: "grid", gap: 6 }}><div className="rf-row-between rf-xs"><span>{s.daysLeft} day{s.daysLeft === 1 ? "" : "s"} left in this period</span><span>{dayFmt(s.accessUntil)}</span></div><div className="rf-meterbar" aria-hidden><i style={{ width: `${Math.round((left / total) * 100)}%` }} /></div></div>}
      {s.status === "past_due" && <p className="rf-banner warn"><span className="e" aria-hidden>⚠️</span><span>Last payment failed{s.lastFailureReason ? `: ${s.lastFailureReason}` : ""}. We'll retry{s.nextChargeAt ? ` on ${dayFmt(s.nextChargeAt)}` : " soon"}. Your plan stays on for now.</span></p>}
      <dl className="rf-dl cols">
        <div><dt>{s.cancelling ? "Active until" : "Next charge"}</dt><dd>{s.cancelling ? dayFmt(s.accessUntil) : s.nextChargeAt ? `${dayFmt(s.nextChargeAt)} · ${formatINR(s.price)}` : "–"}</dd></div>
        <div><dt>Started</dt><dd>{s.startedAt ? dayFmt(s.startedAt) : "–"}</dd></div>
        <div><dt>Paid so far</dt><dd>{s.paidCount} payment{s.paidCount === 1 ? "" : "s"} · {formatINR(s.paidTotal)}</dd></div>
        {s.failedCount > 0 && <div><dt>Failed tries</dt><dd>{s.failedCount}</dd></div>}
        {s.cancelledAt && <div><dt>Cancelled on</dt><dd>{dayFmt(s.cancelledAt)}</dd></div>}
      </dl>
      <div className="rf-btns">
        {s.canRetry && <Btn loading={busy === "pay"} onClick={onPay}>💳 Pay {formatINR(s.price)} now</Btn>}
        {s.canCancel && <Btn variant="ghost" loading={busy === true} onClick={onCancel}>Cancel subscription</Btn>}
        <Btn as={Link} to={`${B}/payments?filter=subscription`} variant="ghost"><Receipt size={16} aria-hidden />Payments</Btn>
      </div>
      {s.cancelling && <p className="rf-xs">You won't be charged again. 👋 You can subscribe again after it ends.</p>}
    </article>
  );
}

/* ------------------------------------------------------------ the page */
export default function Credits() {
  const user = useSelector((st) => st.auth?.user);
  const nav = useNavigate();
  const { refresh } = useRef_();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  // one request fills the whole page: plans on sale, subscriptions, credits and access
  const load = useCallback(() => { getPlans().then(setData).catch((e) => setError(errMsg(e))); }, []);
  useEffect(load, [load]);

  // back from a redirect-style gateway (Cashfree): the server already checked with the gateway; say what happened, once
  const [params, setParams] = useSearchParams();
  const returned = params.get("subscription");
  const state = params.get("state");
  const shown = useRef("");
  useEffect(() => {
    if (!returned || shown.current === returned) return; // StrictMode runs effects twice in development
    shown.current = returned;
    setParams({}, { replace: true });
    if (state === "live") { toast.success("You're subscribed 🎉 Your plan is active.", { id: "sub-return" }); refresh(); }
    else if (state === "failed") toast.error("The payment didn't go through. Nothing was charged.", { id: "sub-return" });
    else toast("Your payment is being confirmed. This page updates when it is.", { id: "sub-return", icon: "⏳" });
    load();
    if (state === "pending") { const t = setTimeout(() => getSubscription(returned).catch(() => {}).finally(() => { load(); refresh(); }), 6000); return () => clearTimeout(t); }
  }, [returned]); // eslint-disable-line react-hooks/exhaustive-deps

  const [ask, confirmDialog] = useConfirm();
  const outcome = (res, done) => {
    if (res.status === "paid") { toast.success(done); load(); refresh(); }
    else if (res.status === "dismissed" || res.status === "redirect") return;
    else if (!res.orderId && res.status === "pending") { toast("Your payment is being confirmed. This page updates when it is.", { icon: "⏳" }); load(); }
    else if (res.status === "pending") nav(`${B}/payment-result?order=${res.orderId}&status=pending`);
    else if (res.status === "failed") toast.error(res.message || "The payment didn't go through. Nothing was charged.");
  };
  const go = (id, fn, done) => async () => { setBusy(id); try { outcome(await fn(), done); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(""); } };
  const cancel = async (s) => {
    const when = s.accessUntil ? dayFmt(s.accessUntil) : "the end of this period";
    if (!(await ask({ title: `Cancel ${s.planName}?`, message: `No more charges. It stays on until ${when}${s.daysLeft ? ` (${s.daysLeft} day${s.daysLeft === 1 ? "" : "s"} left)` : ""}. Payments already made aren't refunded.`, confirmLabel: "Yes, cancel", cancelLabel: "Keep it" }))) return;
    setBusy(s.id);
    try { await cancelSubscription(s.id); toast.success("Cancelled. Your plan stays on until it expires."); load(); refresh(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(""); }
  };

  const d = data;
  const a = d?.access || {};
  const unlimited = d?.subscriptionEnabled ? d.subPlans.filter((p) => p.kind === "unlimited") : [];
  const priority = d?.priorityEnabled ? d.subPlans.filter((p) => p.kind === "priority") : [];
  const packs = d?.plansEnabled !== false ? d?.plans || [] : [];
  // all chat plans first (Unlimited + credit packs), then the Priority plans in the rows below
  const tabs = [(unlimited.length || packs.length) && ["chat", "💬 Chat plans"], priority.length && ["priority", "👑 Priority plans"]].filter(Boolean);
  const subs = d?.subscriptions || [];
  const priSubOn = subs.some((x) => x.kind === "priority" && x.live);
  const monthlyFine = "Charged today, then monthly. Cancel any time.";

  return (
    <div>
      <PageHead eyebrow="👑 Plans" title="Plans and pricing" sub={d?.paywall === false ? "Chats are free right now. 🎉 Plans are optional." : "Searching and sending requests is free. You pay only to open a chat after someone says yes."}
        actions={<Btn as={Link} to={`${B}/payments`} variant="ghost"><Receipt size={17} aria-hidden />Payments</Btn>} />
      {error && <p role="alert" className="rf-banner bad">{error}</p>}

      <section className="rf-plans-status" aria-label="What you have now">
        <div className="rf-stat"><span><span aria-hidden>♾️</span>Unlimited</span><b className="word">{!d ? "–" : a.unlimited ? "✅ On" : "Off"}</b><small>{a.unlimited ? `Until ${dayFmt(a.unlimitedUntil)}` : "Free chats and requests"}</small></div>
        <div className="rf-stat"><span><span aria-hidden>👑</span>Priority</span><b className="word">{!d ? "–" : a.priority ? "✅ On" : "Off"}</b><small>{a.priority ? `Until ${dayFmt(a.priorityUntil)}` : "Badge and top of the list"}</small></div>
        <div className="rf-stat"><span><span aria-hidden>🎟️</span>Chat credits</span><b style={{ fontSize: 20 }}>{d ? d.credits.left : "–"}</b><small>{d?.credits.nextExpiry ? `Next expiry ${dayFmt(d.credits.nextExpiry)}` : `One chat = ₹${d?.unlockFee ?? "–"} without a plan`}</small></div>
      </section>

      {subs.length > 0 && (
        <section className="rf-block" aria-labelledby="mine">
          <div className="rf-bhead"><h2 id="mine" className="rf-h2">Your subscriptions</h2></div>
          <div className="rf-grid c2">{subs.map((s) => <SubCard key={s.id} sub={s} busy={busy === s.id ? true : busy === `pay-${s.id}` ? "pay" : false} onCancel={() => cancel(s)} onPay={go(`pay-${s.id}`, () => retrySubscription(s.id, user), `Paid ✅ ${s.planName} is back on.`)} />)}</div>
        </section>
      )}

      <section className="rf-block" aria-labelledby="buy">
        <div className="rf-bhead"><h2 id="buy" className="rf-h2">Choose a plan</h2></div>
        {!d && !error && <div className="rf-grid c3"><Skeleton h={320} style={{ borderRadius: 16 }} /><Skeleton h={320} style={{ borderRadius: 16 }} /><Skeleton h={320} style={{ borderRadius: 16 }} /></div>}
        {d && tabs.length === 0 && <Empty emoji="🛍️" title="No plans on sale right now">You can still open a single chat when a referrer says yes.</Empty>}
        {tabs.some((t) => t[0] === "chat") && (<>
          <h3 className="rf-h3" style={{ marginBottom: 4 }}>💬 Chat plans</h3>
          <p className="rf-muted" style={{ marginBottom: 16 }}>💬 Open chats with referrers who said yes.{unlimited.length ? " Go Unlimited, or buy a pack of credits." : ` One credit opens one chat, cheaper than ₹${d.unlockFee} each time.`}</p>
          <div className="rf-grid c3">{unlimited.map((p) => <PlanCard key={p.id} e="♾️" tone="green" name={p.name} tagline={p.tagline} price={p.price} unit="/ month" features={p.features} badge={p.badge} on={a.unlimited} busy={busy === p.id} label={`Subscribe · ${formatINR(p.price)}/mo`} fine={monthlyFine} onBuy={go(p.id, () => startSubscription(p.id, user), `You're on ${p.name} 🎉`)} />)}
            {packs.map((p) => <PlanCard key={p.id} e="🎟️" tone="sky" name={p.name} tagline={p.tagline} price={p.price} unit="one-time" compareAt={p.compareAt} per={`${p.unlocks} chats · about ₹${p.perChat} each · ${p.validityDays ? `valid ${p.validityDays} days` : "never expires"}`} features={p.features} badge={p.badge} busy={busy === p.id} label={`Buy · ${formatINR(p.price)}`} fine="Pay once. Credits are used one per chat." onBuy={go(p.id, () => buyPlan(p.id, user), "Payment received 🎉 Your credits are ready.")} />)}</div>
        </>)}

        {tabs.some((t) => t[0] === "priority") && (<>
          <h3 className="rf-h3" style={{ margin: "30px 0 4px" }}>👑 Priority plans</h3>
          <p className="rf-muted" style={{ marginBottom: 16 }}>👑 A Priority badge on your profile. Your requests show first for referrers.</p>
          <div className="rf-grid c3">{priority.map((p) => (p.billing === "monthly"
            ? <PlanCard key={p.id} e="👑" tone="gold" name={p.name} tagline={p.tagline} price={p.price} unit="/ month" features={p.features} badge={p.badge} on={priSubOn} busy={busy === p.id} label={`Subscribe · ${formatINR(p.price)}/mo`} fine={monthlyFine} onBuy={go(p.id, () => startSubscription(p.id, user), `Priority is on 👑`)} />
            : <PlanCard key={p.id} e="⚡" tone="amber" name={p.name} tagline={p.tagline} price={p.price} unit={`for ${p.days} days`} per={`About ${formatINR(Math.round((p.price / p.days) * 10) / 10)} a day · one-time`} features={p.features} badge={p.badge} busy={busy === p.id} label={a.priority ? `Add ${p.days} more days` : `Buy ${p.days} days`} fine="Pay once. No auto-renewal. Buying again adds the days." onBuy={go(p.id, () => buyPriority(p.id, user), `Priority is on for ${p.days} days 👑`)} />))}</div>
        </>)}

      </section>

      <section className="rf-block" aria-labelledby="rules">
        <div className="rf-bhead"><h2 id="rules" className="rf-h2">Good to know</h2><Link to={`${B}/payments`}>All payments <ArrowRight size={14} weight="bold" aria-hidden /></Link></div>
        <Policy />
      </section>

      <section className="rf-block rf-faq" aria-labelledby="faq">
        <h2 id="faq" className="rf-h2" style={{ marginBottom: 6 }}>Questions</h2>
        {[
          ["What happens when I cancel?", "Billing stops right away. Your plan keeps working until the end of the days you paid for. Then it switches off."],
          ["Can I get a refund?", `No. Payments are final. If you were charged twice for the same thing, email ${HELP} with the payment ID and we refund the extra charge.`],
          ["What if a renewal payment fails?", "We retry a few times. Your plan stays on while we retry. If every try fails, the plan ends at the end of the period."],
          ["Do referrers pay anything?", "Never. Giving referrals is always free."],
        ].map(([q, ans]) => <details key={q}><summary>{q}<Plus size={16} weight="bold" aria-hidden /></summary><p>{ans}</p></details>)}
      </section>
      {confirmDialog}
    </div>
  );
}

/* ------------------------------------------------------------ where the gateway sends the browser back: ask OUR server what happened */
export function PaymentResult() {
  const [params] = useSearchParams();
  const order = params.get("order") || "";
  const nav = useNavigate();
  const { refresh } = useRef_();
  const [s, setS] = useState(null);
  const [tries, setTries] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    if (!order) return undefined;
    let live = true;
    orderStatus(order).then((x) => {
      if (!live) return;
      setS(x);
      if (x.status === "paid") refresh();
      else if (x.status !== "failed" && tries < 40) timer.current = setTimeout(() => setTries((n) => n + 1), 3000);
    }).catch(() => { if (live && tries < 5) timer.current = setTimeout(() => setTries((n) => n + 1), 4000); });
    return () => { live = false; clearTimeout(timer.current); };
  }, [order, tries, refresh]);

  const paid = s?.status === "paid", failed = s?.status === "failed";
  const what = s?.kind === "unlock" ? "Your chat is open." : s?.kind === "priority" ? "Priority is on. 👑" : "Your credits are ready.";
  return (
    <div className="rf-pay rf-card" style={{ padding: 32 }} role="status" aria-live="polite">
      {paid ? <span className="e" aria-hidden>🎉</span> : failed ? <span className="e" aria-hidden>😕</span> : <span className="rv-spin" style={{ width: 40, height: 40 }} aria-hidden />}
      <h1 className="rf-h2" style={{ fontSize: 24 }}>{paid ? "Payment received" : failed ? "The payment didn't go through" : "Checking your payment…"}</h1>
      <p className="rf-muted">{paid ? what : failed ? "Nothing was charged. You can try again." : "This takes a few seconds. UPI can take a little longer. You can leave this page."}</p>
      {s && <p className="rf-xs">{s.title} · {formatINR(s.amount)} · {dateFmt(s.startedAt)}</p>}
      <div className="rf-btns" style={{ justifyContent: "center" }}>
        {paid && s.requestId && <Btn as={Link} to={`${B}/inbox/${s.requestId}`} size="lg">Open the chat <ArrowRight size={16} weight="bold" aria-hidden /></Btn>}
        {paid && !s.requestId && <Btn as={Link} to={`${B}/plans`} size="lg">See my plan</Btn>}
        {failed && <Btn size="lg" onClick={() => nav(s?.requestId ? `${B}/inbox/${s.requestId}` : `${B}/plans`)}>Try again</Btn>}
        <Btn as={Link} to={`${B}/payments`} variant="ghost"><Receipt size={16} aria-hidden />Payments</Btn>
      </div>
    </div>
  );
}
