import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowRight, ChatsCircle, Crown } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { dateFmt, dayFmt, formatINR, listPayments, payAgain } from "./api";
import { Btn, Skeleton, cx } from "../resume/ui";
import { Badge, CopyText, Empty, Ico, LoadMore, PageHead, Sheet } from "./ui";
import { useInfinite } from "./useInfinite";
import { useRef_ } from "./RefContext";
import { HELP, Policy } from "./Credits";

const B = "/referral/app";
const FILTERS = [["all", "All"], ["paid", "✅ Paid"], ["failed", "⚠️ Failed / unpaid"], ["subscription", "🔁 Subscriptions"], ["onetime", "🧾 One-time"]];

/* what each payment was for: an emoji, a colour and a short name */
const LOOK = {
  unlock: ["💬", "sky", "Chat unlock"], plan: ["🎟️", "violet", "Credit pack"], grant: ["🎁", "green", "Free credits"], priority: ["⚡", "amber", "Priority pass"],
  subscription: ["🔁", "green", "Subscription"], subscription_priority: ["👑", "gold", "Priority subscription"], subscription_unlimited: ["♾️", "green", "Unlimited subscription"],
};
const lookOf = (p) => LOOK[p.source === "subscription" ? `subscription_${p.subKind}` : p.kind] || LOOK.subscription;
const STATUS = { paid: ["Paid", "ok"], free: ["Free", "brand"], failed: ["Failed", "bad"], pending: ["Not completed", "warn"], refunded: ["Refunded", "info"], revoked: ["Switched off", "muted"] };
const monthOf = (v) => new Date(v).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

function Row({ p, onOpen }) {
  const [e, tone] = lookOf(p);
  const [label, st] = STATUS[p.status] || [p.status, "muted"];
  return (
    <li>
      <button type="button" className="rf-pay-row" onClick={() => onOpen(p)}>
        <Ico e={e} tone={tone} size="sm" />
        <span className="t"><b>{p.title}</b><span>{dateFmt(p.at)}{p.attempt > 1 ? ` · try ${p.attempt}` : ""}{p.paymentId ? ` · ${p.paymentId}` : ""}</span></span>
        <span className="r"><span className={cx("amt", (p.status === "failed" || p.status === "pending") && "gone")}>{p.amount ? formatINR(p.amount) : "₹0"}</span><Badge tone={st}>{label}</Badge></span>
      </button>
    </li>
  );
}

/* the receipt: every detail we hold about one payment */
function Receipt({ p, onClose, onPaid }) {
  const user = useSelector((s) => s.auth?.user);
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [e, tone, kind] = lookOf(p);
  const [label, st] = STATUS[p.status] || [p.status, "muted"];
  const pay = async () => {
    setBusy(true);
    try {
      const r = await payAgain(p.ref, user);
      if (r.status === "paid") { toast.success("Payment received 🎉"); onPaid(); }
      else if (r.status === "pending") nav(`${B}/payment-result?order=${r.orderId}&status=pending`);
      else if (r.status === "failed") toast.error(r.message || "The payment didn't go through. Nothing was charged.");
    } catch (x) { toast.error(errMsg(x)); } finally { setBusy(false); }
  };
  const rows = [
    ["What", kind],
    ["Date", dateFmt(p.at)],
    p.status === "paid" && p.paymentId && ["Payment ID", <CopyText key="pid" value={p.paymentId} />],
    p.orderId && [p.source === "subscription" ? "Invoice / ref" : "Order ref", <CopyText key="oid" value={p.orderId} />],
    p.gateway && ["Paid via", p.gateway[0].toUpperCase() + p.gateway.slice(1)],
    p.method && ["Method", p.method.toUpperCase()],
    p.credits && ["Credits", `${p.credits.allowed - p.credits.used} left of ${p.credits.allowed}`],
    p.kind === "priority" && p.validityDays && ["Pass length", `${p.validityDays} days`],
    p.expiresAt && ["Valid until", dayFmt(p.expiresAt)],
    p.periodStart && p.status === "paid" && ["Covers", `${dayFmt(p.periodStart)} – ${dayFmt(p.periodEnd)}`],
    p.attempt > 1 && ["Try", `#${p.attempt} (a retry)`],
    p.reason && ["Reason", p.reason],
    p.note && ["Note", p.note],
  ].filter(Boolean);
  const mail = `mailto:${HELP}?subject=${encodeURIComponent(`Payment help · ${p.paymentId || p.orderId || p.ref}`)}&body=${encodeURIComponent(`Payment: ${p.title}\nAmount: ${formatINR(p.amount)}\nDate: ${dateFmt(p.at)}\nPayment ID: ${p.paymentId || "-"}\nRef: ${p.orderId || p.ref}\n\nWhat happened:\n`)}`;
  return (
    <Sheet title="Payment details" onClose={onClose}>
      <div className="rf-receipt">
        <div className="big"><Ico e={e} tone={tone} size="lg" /><b>{p.amount ? formatINR(p.amount) : "₹0"}</b><span className="rf-muted">{p.title}</span><Badge tone={st}>{label}</Badge></div>
        <dl className="rf-kv">{rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
        <div className="rf-btns">
          {p.canPay && p.status !== "paid" && <Btn loading={busy} onClick={pay}>Pay {formatINR(p.amount)} now</Btn>}
          {p.requestId && <Btn as={Link} to={`${B}/inbox/${p.requestId}`} variant="ghost"><ChatsCircle size={16} aria-hidden />Open the chat</Btn>}
          {p.source === "subscription" && <Btn as={Link} to={`${B}/plans`} variant="ghost"><Crown size={16} aria-hidden />Manage plan</Btn>}
          <Btn as="a" href={mail} variant="ghost">📧 Get help</Btn>
        </div>
        <p className="rf-xs">🚫 Payments are final. 📧 Charged twice? Email us with the payment ID and we refund the duplicate.</p>
      </div>
    </Sheet>
  );
}

export default function Payments() {
  const { refresh } = useRef_();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState(FILTERS.some(([k]) => k === params.get("filter")) ? params.get("filter") : "all");
  const [open, setOpen] = useState(null);
  const list = useInfinite((page) => listPayments({ filter, page, limit: 20 }), [filter]);
  useEffect(() => { setParams(filter === "all" ? {} : { filter }, { replace: true }); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps
  const sum = list.extra?.summary;
  let month = "";
  return (
    <div>
      <PageHead eyebrow="🧾 Payments" title="Your payments" sub="Every payment, renewal and retry. Tap one to see its details." actions={<Btn as={Link} to={`${B}/plans`} variant="ghost"><Crown size={17} aria-hidden />Plans</Btn>} />
      <section className="rf-stats c3" aria-label="Summary">
        <div className="rf-stat"><span><span aria-hidden>💸</span>Total paid</span><b>{sum ? formatINR(sum.spent) : "–"}</b><small>{sum ? `${sum.paid} payment${sum.paid === 1 ? "" : "s"}` : " "}</small></div>
        <div className="rf-stat"><span><span aria-hidden>📅</span>Last payment</span><b className="word">{sum?.lastPaidAt ? dayFmt(sum.lastPaidAt) : "–"}</b><small>{sum?.subscriptions ? `${sum.subscriptions} subscription charge${sum.subscriptions === 1 ? "" : "s"}` : "No subscription charges"}</small></div>
        <div className="rf-stat"><span><span aria-hidden>⚠️</span>Failed or unpaid</span><b>{sum ? sum.failed : "–"}</b><small>{sum?.failed ? "Nothing was charged for these" : "All good"}</small></div>
      </section>

      <div className="rf-chips" role="group" aria-label="Filter payments" style={{ marginTop: 20 }}>{FILTERS.map(([k, l]) => <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>{l}</button>)}</div>

      <div style={{ marginTop: 6 }}>
        {list.items === null && !list.error && <ul className="rf-pays">{[0, 1, 2, 3].map((i) => <li key={i}><Skeleton h={66} style={{ borderRadius: 14 }} /></li>)}</ul>}
        {list.items?.length === 0 && <Empty emoji="🧾" title={filter === "all" ? "No payments yet" : "Nothing here"} action={<Btn as={Link} to={`${B}/plans`}>See plans <ArrowRight size={16} weight="bold" aria-hidden /></Btn>}>{filter === "all" ? "When you buy a plan or open a chat, it shows here." : "Try another filter."}</Empty>}
        {list.items?.length > 0 && (
          <ul className="rf-pays">
            {list.items.map((p) => {
              const m = monthOf(p.at);
              const head = m !== month ? (month = m) : null;
              return [head && <li key={`m-${m}`} className="rf-group" aria-hidden>{m}</li>, <Row key={p.id} p={p} onOpen={setOpen} />];
            })}
          </ul>
        )}
        <LoadMore list={list} noun="payment" />
      </div>

      <section className="rf-block"><div className="rf-bhead"><h2 className="rf-h2">Billing rules</h2></div><Policy /></section>
      {open && <Receipt p={open} onClose={() => setOpen(null)} onPaid={() => { setOpen(null); list.reload(); refresh(); }} />}
    </div>
  );
}
