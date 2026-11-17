import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowRight, ArrowsClockwise, Brain, CalendarBlank, Check, Clock, FileText, LinkedinLogo, LockKey, MagicWand, SquaresFour, UserCircle,
} from "@phosphor-icons/react";

import { fetchPackages, formatINR } from "./api";
import { AppData } from "./appData";
import { PlanAssurance, PlanCompare, usePlanBuy } from "./PlanPicker";
import { TYPE_ICON, TYPE_LABEL, planFacts, validityText } from "./Plans";
import { BUILDER_LIVE, FAQ, PLAN_TYPES, planType } from "./landingContent";
import { Btn, Skeleton, cx } from "./ui";

/*
  /resume-review/app/plans: choose what you need → pick one plan → review the order → pay.
    phones and tablets   one column; a pay bar sits at the bottom until the order summary's own button is on screen
    wide content column  plan list on the left, the order summary sticks on the right (container query, so it also fits beside the app menu)
*/

const PLAN_FAQ = FAQ.filter((f) => ["What is the difference between the plans?", "Can I send more than one version of my resume?", "Can I cancel a plan after buying it?", "Can I get a refund?"].includes(f.q));
const STEPS = ["Choose a plan", "Pay securely", "Upload your resume"];
const SHORT = { all: "Every plan we offer", ai: "Instant AI reports", human: "A person reads it", linkedin: "Profile + resume", mix: "The full package" };
const n0 = (v) => Number(v ?? 0).toLocaleString("en-IN");
const saveOf = (p) => (p.compareAt > p.price ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0);

/* what one plan includes, as rows: [icon, label, count] */
const creditsOf = (p) => [
  [Brain, "AI reviews", p.ai?.reviews === 0 ? "Unlimited" : n0(p.ai?.reviews)],
  ...(p.human?.enabled ? [[UserCircle, "Human reviews", n0(p.human.reviews)]] : []),
  ...(p.linkedin?.enabled ? [[LinkedinLogo, "LinkedIn reviews", n0(p.linkedin.reviews)]] : []),
];

/* ---------------- step 1: the kind of review ---------------- */
function TypeChooser({ packs, type, onChange }) {
  const list = PLAN_TYPES.map((t) => {
    const mine = (packs || []).filter((p) => t.id === "all" || planType(p) === t.id);
    const prices = mine.map((p) => Number(p.price)).filter((x) => x > 0);
    return { ...t, count: mine.length, from: prices.length ? Math.min(...prices) : null };
  }).filter((t) => !packs?.length || t.id === "all" || t.id === type || t.count > 0);
  return (
    <div className="rlp-types" role="radiogroup" aria-label="Kind of review">
      {list.map((t) => {
        const Icon = t.id === "all" ? SquaresFour : TYPE_ICON[t.id];
        const on = type === t.id;
        return (
          <button key={t.id} type="button" role="radio" aria-checked={on} className={cx("rlp-type", on && "is-on")} onClick={() => onChange(t.id)}>
            <span className="rlp-type-ico"><Icon size={20} weight="duotone" aria-hidden /></span>
            <span className="rlp-type-txt">
              <b>{t.label}</b>
              <small>{packs ? (t.from ? `${t.count} plan${t.count === 1 ? "" : "s"} · from ${formatINR(t.from)}` : `${t.count} plans`) : SHORT[t.id]}</small>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- step 2: one selectable plan ---------------- */
function PlanOption({ plan, on, onPick }) {
  const type = planType(plan);
  const Icon = TYPE_ICON[type];
  const save = saveOf(plan);
  return (
    <label className={cx("rlp-opt", on && "is-on")}>
      <input type="radio" name="resume-plan" value={plan.id} checked={on} onChange={() => onPick(plan.id)} className="rl-sr" />
      <span className="rlp-radio" aria-hidden><Check size={12} weight="bold" /></span>
      <span className="rlp-opt-main">
        <span className="rlp-opt-top">
          <span className="rlp-opt-type"><Icon size={14} weight="bold" aria-hidden />{TYPE_LABEL[type]}</span>
          {plan.badge && <span className="rl-plan-badge">{plan.badge}</span>}
        </span>
        <b className="rlp-opt-name">{plan.name}</b>
        {plan.tagline && <span className="rlp-opt-tag">{plan.tagline}</span>}
        <span className="rlp-opt-chips">
          {creditsOf(plan).map(([I, label, n]) => <span key={label}><I size={14} weight="duotone" aria-hidden /><b className="rv-mono">{n}</b> {label.replace(" reviews", "")}</span>)}
          <span><CalendarBlank size={14} weight="duotone" aria-hidden />{validityText(plan.validityDays)}</span>
        </span>
      </span>
      <span className="rlp-opt-price">
        <b className="rv-mono">{formatINR(plan.price)}</b>
        {plan.compareAt > 0 && <s className="rv-mono">{formatINR(plan.compareAt)}</s>}
        {save > 0 && <small>Save {save}%</small>}
      </span>
    </label>
  );
}

/* ---------------- step 3: the order summary ---------------- */
function Order({ plan, busy, onPay, have, payRef }) {
  if (!plan) {
    return (
      <aside className="rlp-order" aria-label="Your order">
        <p className="rlp-order-k">Your order</p>
        <p className="rlp-order-empty">Pick a plan to see exactly what you get and pay.</p>
      </aside>
    );
  }
  const type = planType(plan);
  const TypeIcon = TYPE_ICON[type];
  const person = plan.human?.enabled || plan.linkedin?.enabled;
  const facts = [...planFacts(plan), ...(plan.features || [])];
  const save = saveOf(plan);
  return (
    <aside className="rlp-order" aria-label="Your order" aria-live="polite">
      <p className="rlp-order-k">Your order</p>
      <div className="rlp-order-head">
        <span className="rlp-order-ico"><TypeIcon size={22} weight="duotone" aria-hidden /></span>
        <div><b>{plan.name}</b><span>{TYPE_LABEL[type]}</span></div>
      </div>

      <ul className="rlp-order-credits">
        {creditsOf(plan).map(([I, label, n]) => <li key={label}><I size={18} weight="duotone" aria-hidden /><span>{label}</span><b className="rv-mono">{n}</b></li>)}
        <li><CalendarBlank size={18} weight="duotone" aria-hidden /><span>Validity</span><b>{validityText(plan.validityDays).replace("Valid ", "")}</b></li>
      </ul>

      <p className="rlp-order-sla"><Clock size={15} weight="bold" aria-hidden /><span>{person ? <>Human review within <b>{plan.deliveryHours} hours</b>{plan.deliveryHours < 48 ? " (priority)" : ""}</> : <>AI report in about <b>2 minutes</b></>}</span></p>

      <details className="rlp-order-more">
        <summary>Everything included ({facts.length + (BUILDER_LIVE ? 2 : 1)})</summary>
        <ul>
          <li><Check size={14} weight="bold" aria-hidden />AI report with scores, keywords and rewritten bullets</li>
          {BUILDER_LIVE && <li><Check size={14} weight="bold" aria-hidden />Resume builder and job tailoring</li>}
          {facts.map((f) => <li key={f}><Check size={14} weight="bold" aria-hidden />{f}</li>)}
        </ul>
      </details>

      <div className="rlp-total">
        <span>Total today</span>
        <div>
          {plan.compareAt > plan.price && <s className="rv-mono">{formatINR(plan.compareAt)}</s>}
          <b className="rv-mono">{formatINR(plan.price)}</b>
        </div>
      </div>
      {save > 0 && <p className="rlp-saving">You save {formatINR(plan.compareAt - plan.price)} ({save}%)</p>}

      <div ref={payRef}>
        <Btn block size="lg" loading={busy} onClick={onPay}><LockKey size={17} weight="bold" aria-hidden />Pay {formatINR(plan.price)} securely</Btn>
      </div>
      <ul className="rlp-order-notes">
        <li>UPI, card or netbanking</li>
        <li>One-time payment, nothing renews</li>
        <li>Cannot be cancelled once bought</li>
        {have && <li>Adds to the credits you already have</li>}
      </ul>
    </aside>
  );
}

export default function ResumeBuy() {
  const [params] = useSearchParams();
  const first = Boolean(useLocation().state?.first);
  const { data } = useContext(AppData);
  const [packs, setPacks] = useState(null);
  const [failed, setFailed] = useState(false);
  const [type, setType] = useState("all");
  const [selId, setSelId] = useState("");
  const [payVisible, setPayVisible] = useState(false);
  const payRef = useRef(null);
  const rootRef = useRef(null);
  const [wide, setWide] = useState(false);
  const buyer = usePlanBuy();

  const load = () => { setFailed(false); setPacks(null); fetchPackages().then(setPacks).catch(() => setFailed(true)); };
  useEffect(load, []);

  const highlight = params.get("package") || "";
  const shown = useMemo(() => (packs || []).filter((p) => type === "all" || planType(p) === type), [packs, type]);
  const sel = shown.find((p) => p.id === selId) || shown.find((p) => p.key === highlight) || shown.find((p) => p.badge) || shown[0] || null;

  // the bottom pay bar only shows while the real pay button is off screen
  useEffect(() => {
    const el = payRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => setPayVisible(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [sel?.id]);

  // two columns (the order summary sits beside the list, same 780px as the CSS container query): no pay bar needed
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(([e]) => setWide(e.contentRect.width >= 780));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const s = data?.summary;
  const have = Boolean(s && s.plans > 0);
  const pay = () => sel && buyer.buy(sel);
  const pickType = (id) => { setType(id); setSelId(""); };

  return (
    <>
      <div className="rlp" ref={rootRef}>
        <header className="rlp-head">
          <div className="rlp-head-copy">
            <span className="rl-eyebrow">{first ? "Welcome to Resume Lab" : "Plans"}</span>
            <h1 className="rlp-h1">{first ? "Choose a plan for your first review" : "Get more reviews"}</h1>
            <p>{first ? "Pick a plan and pay once. Right after, you upload your resume and your AI report arrives in about two minutes." : "Pay once, no subscription. New credits add to what you have, and each plan keeps its own validity."}</p>
          </div>
          <ol className="rlp-steps" aria-label="How buying works">
            {STEPS.map((t, i) => <li key={t} className={i === 0 ? "is-on" : ""} aria-current={i === 0 ? "step" : undefined}><span className="rv-mono">{i + 1}</span>{t}</li>)}
          </ol>
        </header>

        {have && (
          <div className="rlp-have" role="status">
            <span className="rlp-have-k">You have now</span>
            <span><Brain size={16} weight="duotone" aria-hidden /><b className="rv-mono">{s.aiUnlimited ? "∞" : n0(s.aiLeft)}</b> AI</span>
            {s.humanAvailable && <span><UserCircle size={16} weight="duotone" aria-hidden /><b className="rv-mono">{n0(s.humanLeft)}</b> Human</span>}
            {s.linkedinAvailable && <span><LinkedinLogo size={16} weight="duotone" aria-hidden /><b className="rv-mono">{n0(s.linkedinLeft)}</b> LinkedIn</span>}
            <Link to="/resume-review/app" className="rl-textlink">My reviews <ArrowRight size={13} weight="bold" aria-hidden /></Link>
          </div>
        )}

        <section className="rlp-block" aria-labelledby="rlp-s1">
          <h2 id="rlp-s1" className="rlp-h2"><span className="rv-mono">1</span>What do you need?</h2>
          <TypeChooser packs={packs} type={type} onChange={pickType} />
          <p className="rlp-blurb">{(PLAN_TYPES.find((t) => t.id === type) || PLAN_TYPES[0]).blurb}</p>
        </section>

        <div className="rlp-shop">
          <section className="rlp-block" aria-labelledby="rlp-s2">
            <h2 id="rlp-s2" className="rlp-h2"><span className="rv-mono">2</span>Pick a plan{packs && <small>{shown.length} option{shown.length === 1 ? "" : "s"}</small>}</h2>
            {packs === null && !failed && <div className="rlp-list">{[0, 1, 2].map((i) => <Skeleton key={i} h={124} style={{ borderRadius: 16 }} />)}</div>}
            {failed && (
              <div className="rlp-state" role="alert">
                <b>Plans couldn't load.</b>
                <p>Check your connection and try again.</p>
                <Btn variant="ghost" onClick={load}><ArrowsClockwise size={16} weight="bold" aria-hidden />Try again</Btn>
              </div>
            )}
            {packs?.length === 0 && <div className="rlp-state"><b>Reviews are not open right now.</b><p>Please check back soon.</p></div>}
            {packs?.length > 0 && shown.length === 0 && (
              <div className="rlp-state"><b>No plan of this kind right now.</b><Btn variant="ghost" onClick={() => pickType("all")}>Show all plans</Btn></div>
            )}
            {shown.length > 0 && (
              <div className="rlp-list" role="radiogroup" aria-label="Plans">
                {shown.map((p) => <PlanOption key={p.id} plan={p} on={sel?.id === p.id} onPick={setSelId} />)}
              </div>
            )}
          </section>

          <div className="rlp-side">
            <h2 className="rlp-h2"><span className="rv-mono">3</span>Review and pay</h2>
            <Order plan={sel} busy={buyer.busy === sel?.id} onPay={pay} have={have} payRef={payRef} />
          </div>
        </div>

        <PlanAssurance className="rlp-assure" />

        <section className="rlp-block" aria-labelledby="rlp-cmp">
          <h2 id="rlp-cmp" className="rlp-h2">Compare the kinds of plan</h2>
          <p className="rlp-blurb">Every plan starts with the AI report. The difference is what a person adds on top.</p>
          <PlanCompare onPick={(id) => { pickType(id); document.getElementById("rlp-s2")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />
        </section>

        {BUILDER_LIVE && <section className="rlp-tools" aria-labelledby="rlp-tools">
          <div>
            <span className="rl-eyebrow">Included with every plan</span>
            <h2 id="rlp-tools" className="rlp-h2">Build or tailor your resume first</h2>
            <p>Answer a few questions and download an ATS-friendly PDF, or tailor your current resume to a job post. Then send it in for review.</p>
          </div>
          <div className="rlp-tools-btns">
            <Link to="/resume-review/app/builder" className="rv-btn rv-btn-ghost"><FileText size={17} weight="bold" aria-hidden />Resume builder</Link>
            <Link to="/resume-review/app/builder" className="rv-btn rv-btn-ghost"><MagicWand size={17} weight="bold" aria-hidden />Tailor to a job</Link>
          </div>
        </section>}

        <section className="rlp-block" aria-labelledby="rlp-faq">
          <h2 id="rlp-faq" className="rlp-h2">Before you pay</h2>
          <div className="rl-faq-list">
            {PLAN_FAQ.map((f) => (
              <details key={f.q} className="rl-faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className="rlp-help">Questions about a payment? Write to <b className="rl-select">supporttargettrek@gmail.com</b></p>
        </section>
      </div>

      {sel && !wide && (
        <div className={cx("rlp-bar", payVisible && "is-hidden")} role="region" aria-label="Selected plan" aria-hidden={payVisible || undefined}>
          <div className="rlp-bar-in">
            <div className="rlp-bar-txt"><span>{sel.name}</span><b className="rv-mono">{formatINR(sel.price)}</b></div>
            <Btn loading={buyer.busy === sel.id} onClick={pay} tabIndex={payVisible ? -1 : undefined}>Pay now <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
          </div>
        </div>
      )}
    </>
  );
}
