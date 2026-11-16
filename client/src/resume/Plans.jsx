import { useState } from "react";
import { ArrowRight, CaretDown, Brain, Clock, LinkedinLogo, Sparkle, UserCircle } from "@phosphor-icons/react";

import { formatINR } from "./api";
import { Btn, Pill, Tick, cx } from "./ui";
import { planType } from "./landingContent";

const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
export const validityText = (days) => (!days ? "No expiry" : days % 365 === 0 ? `Valid ${plural(days / 365, "year")}` : `Valid ${days} days`);
export const TYPE_ICON = { ai: Brain, human: UserCircle, linkedin: LinkedinLogo, mix: Sparkle };
const TYPE_LABEL = { ai: "AI review", human: "Human review", linkedin: "LinkedIn review", mix: "Human + LinkedIn" };

/* What a plan gives beyond the three headline counts, one line each. */
export const planFacts = (p) => [
  validityText(p.validityDays),
  ...(p.human.enabled && p.includes.rewrittenResume ? ["Complete rewritten resume from our team"] : []),
  ...(p.includes.jobMatch ? ["Match against a job description"] : []),
];

const Tile = ({ icon: Icon, n, label }) => (
  <div className="rv-pt">
    <Icon size={16} weight="duotone" aria-hidden />
    <b className="rv-mono">{n}</b>
    <span>{label}</span>
  </div>
);

/* One plan. `onSelect` is the action (buy); `cta` the button text. A featured plan is drawn dark. */
export default function PlanCard({ plan, featured = false, cta, busy = false, disabled = false, onSelect, href, as, style, className }) {
  const type = planType(plan);
  const Icon = TYPE_ICON[type];
  const save = plan.compareAt > plan.price ? Math.round(((plan.compareAt - plan.price) / plan.compareAt) * 100) : 0;
  const unlimited = plan.ai.reviews === 0;
  const [open, setOpen] = useState(false);
  const facts = [...planFacts(plan), ...plan.features];
  return (
    <article className={cx("rv-plan", featured && "featured", open && "open", className)} style={style}>
      <div className="rv-plan-top">
        <span className="rv-ico"><Icon size={22} weight="duotone" aria-hidden /></span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className="rv-h3" style={{ lineHeight: 1.2 }}>{plan.name}</h3>
          <p className="rv-xs rv-subtle" style={{ marginTop: 2 }}>{TYPE_LABEL[type]}</p>
        </div>
        {plan.badge && <Pill className="rv-badge">{plan.badge}</Pill>}
      </div>

      <p className="rv-muted rv-sm rv-plan-tag" style={{ marginTop: 16, minHeight: "3.1em" }}>{plan.tagline}</p>

      <div className="rv-plan-price">
        <span className="rv-price">{formatINR(plan.price)}</span>
        {plan.compareAt > 0 && <s className="rv-mono rv-subtle">{formatINR(plan.compareAt)}</s>}
        {save > 0 && <span className="rv-save">Save {save}%</span>}
      </div>
      <p className="rv-xs rv-subtle rv-plan-ai" style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}><Clock size={13} weight="bold" aria-hidden />AI report in minutes</p>
      {(plan.human.enabled || plan.linkedin.enabled) && <p className="rv-sla"><Clock size={14} weight="bold" aria-hidden />Human review within {plan.deliveryHours} hours{plan.deliveryHours < 48 ? " · priority" : ""}</p>}

      <div className="rv-pts" aria-label="Included reviews">
        <Tile icon={Brain} n={unlimited ? "∞" : plan.ai.reviews} label="AI" />
        {plan.human.enabled && <Tile icon={UserCircle} n={plan.human.reviews} label="Human" />}
        {plan.linkedin.enabled && <Tile icon={LinkedinLogo} n={plan.linkedin.reviews} label="LinkedIn" />}
      </div>

      <ul className="rv-plan-list">
        {facts.map((f) => <li key={f} className="rv-sm"><Tick />{f}</li>)}
      </ul>
      {facts.length > 3 && <button type="button" className="rv-plan-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>{open ? "Show less" : `Show all ${facts.length} features`}<CaretDown size={13} weight="bold" aria-hidden /></button>}
      <Btn as={as} to={href} variant={featured ? "primary" : "ghost"} size="lg" block loading={busy} disabled={disabled} onClick={onSelect} className="" style={{ marginTop: 28 }}>
        {cta} <ArrowRight size={16} weight="bold" aria-hidden />
      </Btn>
    </article>
  );
}
