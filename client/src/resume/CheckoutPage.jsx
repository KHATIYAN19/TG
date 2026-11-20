import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Bank, Check, Clock, CreditCard, LockKey, QrCode, Receipt, ShieldCheck, Sparkle, UserCircle, Vault } from "@phosphor-icons/react";

import { fetchPackages, formatINR } from "./api";
import { useApp } from "./appData";
import { usePlanBuy } from "./PlanPicker";
import { TYPE_ICON, TYPE_LABEL, planFacts, validityText } from "./Plans";
import { planType } from "./landingContent";
import { creditsOf, deliveryOf } from "./ResumeBuy";
import { PageHead } from "./parts";
import { Btn, Skeleton } from "./ui";

/*
  CHECKOUT  /resume-review/app/checkout/:packageId
  The order in full, what happens after paying, and one Pay button. The payment opens in place (popup or redirect, the server picks the
  gateway); after it is confirmed the app data is refreshed and the person goes straight to "Start a review" with the new plan.
*/
export default function Checkout() {
  const { packageId } = useParams();
  const { data, refresh } = useApp();
  const [packs, setPacks] = useState(null);
  const [failed, setFailed] = useState(false);
  const buyer = usePlanBuy({ onPaid: () => refresh() });

  useEffect(() => { fetchPackages().then(setPacks).catch(() => setFailed(true)); }, []);
  const plan = packs?.find((p) => p.id === packageId);

  if (failed) return <div className="rs-error" role="alert"><b>We couldn't load this plan.</b><p className="rs-sm">Check your connection and try again.</p><Btn as={Link} to="/resume-review/app/plans" variant="ghost">Back to plans</Btn></div>;
  if (!packs) return <div className="rs-loading"><Skeleton h={80} style={{ borderRadius: 16 }} /><Skeleton h={360} style={{ borderRadius: 16 }} /></div>;
  if (!plan) return <div className="rs-empty"><h3 className="rs-h3">This plan isn't available any more</h3><p>Plans change from time to time. Pick one of the current plans.</p><Btn as={Link} to="/resume-review/app/plans">See plans</Btn></div>;

  const type = planType(plan);
  const Icon = TYPE_ICON[type];
  const save = plan.compareAt > plan.price ? plan.compareAt - plan.price : 0;
  const human = plan.human?.enabled || plan.linkedin?.enabled;
  const builderOnly = plan.ai?.enabled === false && plan.builder?.enabled;
  const facts = [...(plan.ai?.enabled !== false ? ["AI agents' report: scores, every mistake, fixes, rewritten bullets, and a validator's check"] : []), ...planFacts(plan), ...(plan.features || [])];
  const have = data?.summary?.plans > 0;
  const busy = buyer.busy === plan.id;
  const pay = () => buyer.buy(plan);
  const flow = builderOnly
    ? [[LockKey, "Pay securely", "UPI, card or net banking."], [Sparkle, "Build your resume", "Upload your resume and the job; the AI writes a tailored one-page version."]]
    : [[LockKey, "Pay securely", "UPI, card or net banking. Confirmed in seconds."], [Vault, "Pick your resume", "From your Resume Vault, or add a new PDF."], [Sparkle, "AI agents review it", "A planner, a reviewer and a validator. Ready in a few minutes."], ...(human ? [[UserCircle, "A person adds their notes", `Within ${plan.deliveryHours} hours.`]] : [])];

  return (
    <>
      <PageHead back={{ to: "/resume-review/app/plans", label: "All plans" }} eyebrow={<><Receipt size={14} weight="bold" aria-hidden />Checkout</>} title="Review and pay" sub="One-time payment. Nothing renews." />
      <div className="rs-checkout">
        <div className="rs-stack">
          <section className="rs-card rs-stack" aria-labelledby="co-plan">
            <div className="rs-row nowrap" style={{ alignItems: "flex-start" }}>
              <span className="rs-ico lg" aria-hidden><Icon size={24} weight="duotone" /></span>
              <div style={{ flex: 1 }}>
                <span className="rs-xs rs-subtle" style={{ fontWeight: 700 }}>{TYPE_LABEL[type]}</span>
                <h2 id="co-plan" className="rs-h2">{plan.name}</h2>
                {plan.tagline && <p className="rs-sm rs-muted" style={{ marginTop: 4 }}>{plan.tagline}</p>}
              </div>
              {plan.badge && <span className="rs-chip brand"><span>{plan.badge}</span></span>}
            </div>
            <ul className="rs-credits">{creditsOf(plan).map(([I, label, n]) => <li key={label}><I size={18} weight="duotone" aria-hidden /><b>{n}</b><span>{label}</span></li>)}</ul>
            <ul className="rs-lines">
              <li><span>Validity</span><b>{validityText(plan.validityDays).replace("Valid ", "")}</b></li>
              <li><span>Delivery</span><b style={{ textAlign: "right" }}>{deliveryOf(plan)}</b></li>
            </ul>
            <div className="rs-divider" />
            <p className="rs-k">Everything included</p>
            <ul className="rs-feats">{facts.map((f) => <li key={f}><Check size={14} weight="bold" aria-hidden /><span>{f}</span></li>)}</ul>
          </section>

          <section className="rs-card rs-stack" aria-labelledby="co-next">
            <h2 id="co-next" className="rs-h2">What happens next</h2>
            <ol className="rs-flow">{flow.map(([I, t, d], i) => <li key={t} className={i === 0 ? "on" : ""}><span aria-hidden><I size={16} weight="bold" /></span><div><b>{t}</b><p>{d}</p></div></li>)}</ol>
          </section>
        </div>

        <aside className="rs-pay" aria-label="Payment">
          <section className="rs-card rs-stack">
            <p className="rs-k">Payment</p>
            <ul className="rs-lines">
              <li><span>{plan.name}</span><b className="rs-num">{formatINR(plan.compareAt > plan.price ? plan.compareAt : plan.price)}</b></li>
              {save > 0 && <li><span>Discount</span><b className="rs-num" style={{ color: "var(--rv-ok)" }}>− {formatINR(save)}</b></li>}
            </ul>
            <div className="rs-total"><span className="rs-sm" style={{ fontWeight: 700 }}>Total today</span><b>{formatINR(plan.price)}</b></div>
            <Btn block size="lg" loading={busy} onClick={pay}><LockKey size={17} weight="bold" aria-hidden />Pay {formatINR(plan.price)} securely</Btn>
            <div className="rs-methods" aria-label="Ways to pay"><span><QrCode size={14} weight="bold" aria-hidden />UPI</span><span><CreditCard size={14} weight="bold" aria-hidden />Cards</span><span><Bank size={14} weight="bold" aria-hidden />Net banking</span></div>
            <ul className="rs-feats">
              <li><ShieldCheck size={14} weight="bold" aria-hidden /><span>Secured by our payment partner. We never see your card or UPI PIN.</span></li>
              <li><Clock size={14} weight="bold" aria-hidden /><span>Closed the window by mistake? Nothing is charged, and the order waits under Unfinished payments.</span></li>
              <li><Receipt size={14} weight="bold" aria-hidden /><span>Plans can't be cancelled once bought. Payment questions: supporttargettrek@gmail.com</span></li>
              {have && <li><Check size={14} weight="bold" aria-hidden /><span>Adds to the credits you already have.</span></li>}
            </ul>
            <Link to="/resume-review/app/plans" className="rs-link"><ArrowLeft size={13} weight="bold" aria-hidden />Choose a different plan</Link>
          </section>
        </aside>
      </div>

      <div className="rs-actionbar">
        <div><span>{plan.name}</span><b className="rs-num">{formatINR(plan.price)}</b></div>
        <Btn loading={busy} onClick={pay}><LockKey size={16} weight="bold" aria-hidden />Pay now</Btn>
      </div>
    </>
  );
}
