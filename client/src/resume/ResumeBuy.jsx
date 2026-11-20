import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, ArrowsClockwise, Brain, CalendarBlank, Check, Clock, LinkedinLogo, MagicWand, Stack, UserCircle } from "@phosphor-icons/react";

import { fetchPackages, formatINR } from "./api";
import { useApp } from "./appData";
import { UnfinishedNotice } from "./AppHome";
import { PlanAssurance, PlanCompare } from "./PlanPicker";
import { TYPE_ICON, TYPE_LABEL, planFacts, validityText } from "./Plans";
import { FAQ, PLAN_TYPES, planType } from "./landingContent";
import { PageHead, Seg, n0 } from "./parts";
import { useBuilderMode } from "./useBuilder";
import { Btn, Skeleton, cx } from "./ui";

/*
  PLANS  /resume-review/app/plans
  Pick the kind of review, pick a plan, then continue to the checkout page (/app/checkout/:id) to pay.
  The plans come from the public list, which is cached for the session and kept from the last visit, so this page shows at once.
*/

const PLAN_FAQ = FAQ.filter((f) => ["What is the difference between the plans?", "Can I send more than one version of my resume?", "Can I cancel a plan after buying it?", "Can I get a refund?"].includes(f.q));
const saveOf = (p) => (p.compareAt > p.price ? Math.round(((p.compareAt - p.price) / p.compareAt) * 100) : 0);

export const creditsOf = (p) => [
  ...(p.ai?.enabled !== false ? [[Brain, "AI reviews", p.ai?.reviews === 0 ? "∞" : n0(p.ai?.reviews)]] : []),
  ...(p.human?.enabled ? [[UserCircle, "Human reviews", n0(p.human.reviews)]] : []),
  ...(p.linkedin?.enabled ? [[LinkedinLogo, "LinkedIn reviews", n0(p.linkedin.reviews)]] : []),
  ...(p.builder?.enabled ? [[MagicWand, "Resume builds", n0(p.builder.credits)]] : []),
];
export const deliveryOf = (p) => (p.human?.enabled || p.linkedin?.enabled ? `Human review within ${p.deliveryHours} hours` : p.ai?.enabled === false ? "Resume built by AI in minutes" : "AI report in a few minutes");

function PlanTile({ plan, featured, onPick }) {
  const type = planType(plan);
  const Icon = TYPE_ICON[type];
  const save = saveOf(plan);
  const facts = [...planFacts(plan), ...(plan.features || [])].slice(0, 4);
  return (
    <article className={cx("rs-plan", featured && "is-featured")}>
      <div className="rs-plan-top">
        <span className="rs-chip"><Icon size={13} weight="bold" aria-hidden /><span>{TYPE_LABEL[type]}</span></span>
        {plan.badge && <span className="rs-chip brand"><span>{plan.badge}</span></span>}
      </div>
      <div>
        <h3 className="rs-plan-name">{plan.name}</h3>
        {plan.tagline && <p className="rs-plan-tag">{plan.tagline}</p>}
      </div>
      <div className="rs-price">
        <b>{formatINR(plan.price)}</b>
        {plan.compareAt > 0 && <s className="rs-num">{formatINR(plan.compareAt)}</s>}
        {save > 0 && <span className="rs-chip ok"><span>Save {save}%</span></span>}
      </div>
      <div className="rs-stack sm">
        <ul className="rs-credits">{creditsOf(plan).map(([I, label, n]) => <li key={label}><I size={18} weight="duotone" aria-hidden /><b>{n}</b><span>{label}</span></li>)}</ul>
        <p className="rs-row nowrap rs-xs rs-muted"><Clock size={14} weight="bold" aria-hidden /><span>{deliveryOf(plan)} · {validityText(plan.validityDays).toLowerCase()}</span></p>
        <ul className="rs-feats">{facts.map((f) => <li key={f}><Check size={14} weight="bold" aria-hidden /><span>{f}</span></li>)}</ul>
      </div>
      <Btn block size="lg" variant={featured ? "primary" : "ghost"} onClick={() => onPick(plan)}>Continue · {formatINR(plan.price)} <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
    </article>
  );
}

export default function ResumeBuy() {
  const builderOn = useBuilderMode() === "on";
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const first = Boolean(useLocation().state?.first);
  const { data } = useApp();
  const [packs, setPacks] = useState(null);
  const [failed, setFailed] = useState(false);
  const [type, setType] = useState(() => { const t = params.get("type"); return PLAN_TYPES.some((x) => x.id === t) ? t : "all"; });

  const load = () => { setFailed(false); fetchPackages().then(setPacks).catch(() => setFailed(true)); };
  useEffect(load, []);

  const types = useMemo(() => PLAN_TYPES.map((t) => ({ ...t, count: (packs || []).filter((p) => t.id === "all" || planType(p) === t.id).length }))
    .filter((t) => !packs?.length || t.id === "all" || t.id === type || t.count > 0), [packs, type]);
  const shown = useMemo(() => (packs || []).filter((p) => type === "all" || planType(p) === type), [packs, type]);
  const highlight = params.get("package") || "";
  const featuredId = (shown.find((p) => p.key === highlight) || shown.find((p) => p.badge))?.id;
  const s = data?.summary;
  const pick = (p) => navigate(`/resume-review/app/checkout/${p.id}`);

  return (
    <>
      <PageHead
        eyebrow={<><Stack size={14} weight="bold" aria-hidden />{first ? "Welcome to Resume Lab" : "Plans"}</>}
        title={first ? "Choose a plan for your first review" : "Add reviews and credits"}
        sub={first ? "Pay once. Right after, pick your resume and our AI agents start reviewing it." : "Pay once, nothing renews. New credits add to what you already have, and each plan keeps its own validity."}
      />
      <UnfinishedNotice />

      {s?.plans > 0 && (
        <section className="rs-stats" aria-label="What you have now">
          <div className="rs-stat"><span className="rs-stat-k"><Brain size={17} weight="duotone" aria-hidden />AI reviews</span><b>{s.aiUnlimited ? "∞" : n0(s.aiLeft)}</b><small>left now</small></div>
          {s.humanAvailable && <div className="rs-stat"><span className="rs-stat-k"><UserCircle size={17} weight="duotone" aria-hidden />Human</span><b>{n0(s.humanLeft)}</b><small>left now</small></div>}
          {s.linkedinAvailable && <div className="rs-stat"><span className="rs-stat-k"><LinkedinLogo size={17} weight="duotone" aria-hidden />LinkedIn</span><b>{n0(s.linkedinLeft)}</b><small>left now</small></div>}
          <div className="rs-stat"><span className="rs-stat-k"><CalendarBlank size={17} weight="duotone" aria-hidden />Plans</span><b>{n0(s.plans)}</b><small>active</small></div>
        </section>
      )}

      <section className="rs-stack" aria-labelledby="pl-h">
        <div className="rs-sec-head" style={{ marginBottom: 0 }}>
          <div><h2 id="pl-h" className="rs-h2">Pick a plan</h2><p>{(PLAN_TYPES.find((t) => t.id === type) || PLAN_TYPES[0]).blurb}</p></div>
        </div>
        <Seg label="Kind of review" value={type} onChange={setType} options={types.map((t) => [t.id, t.label, packs ? t.count : null])} />
        {packs === null && !failed && <div className="rs-plans">{[0, 1, 2].map((i) => <Skeleton key={i} h={420} style={{ borderRadius: 18 }} />)}</div>}
        {failed && <div className="rs-error" role="alert"><b>Plans couldn't load.</b><p className="rs-sm">Check your connection and try again.</p><Btn variant="ghost" onClick={load}><ArrowsClockwise size={16} weight="bold" aria-hidden />Try again</Btn></div>}
        {packs?.length === 0 && <div className="rs-empty"><h3 className="rs-h3">Reviews are not open right now</h3><p>Please check back soon.</p></div>}
        {packs?.length > 0 && shown.length === 0 && <div className="rs-empty"><h3 className="rs-h3">No plan of this kind right now</h3><Btn variant="ghost" onClick={() => setType("all")}>Show all plans</Btn></div>}
        {shown.length > 0 && <div className="rs-plans">{shown.map((p) => <PlanTile key={p.id} plan={p} featured={p.id === featuredId} onPick={pick} />)}</div>}
      </section>

      <PlanAssurance className="rlp-assure" />

      <section className="rs-card rs-stack" aria-labelledby="cmp-h">
        <div><h2 id="cmp-h" className="rs-h2">Compare the kinds of plan</h2><p className="rs-sm rs-muted" style={{ marginTop: 4 }}>Every plan starts with the AI agents' report. The difference is what a person adds on top.</p></div>
        <PlanCompare onPick={(id) => { setType(id); document.getElementById("pl-h")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />
      </section>

      {builderOn && (
        <section className="rs-card rs-row between" aria-labelledby="bld-h">
          <div style={{ flex: "1 1 320px" }}><h2 id="bld-h" className="rs-h2"><MagicWand size={20} weight="duotone" aria-hidden />Let AI write your resume for the job</h2><p className="rs-sm rs-muted" style={{ marginTop: 6 }}>Give it your resume and a job description or target role. It writes a one-page, ATS-friendly resume from your own facts. Each build uses one builder credit.</p></div>
          <Btn as={Link} to="/resume-review/app/builder" variant="ghost"><MagicWand size={16} weight="bold" aria-hidden />Open the builder</Btn>
        </section>
      )}

      <section className="rs-card rs-stack" aria-labelledby="faq-h">
        <h2 id="faq-h" className="rs-h2">Before you pay</h2>
        <div className="rl-faq-list">{PLAN_FAQ.map((f) => <details key={f.q} className="rl-faq"><summary>{f.q}</summary><p>{f.a}</p></details>)}</div>
        <p className="rs-xs rs-subtle">Questions about a payment? Write to <b>supporttargettrek@gmail.com</b></p>
      </section>
    </>
  );
}
