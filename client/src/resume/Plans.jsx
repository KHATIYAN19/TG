import { useState } from "react";
import { ArrowRight, CaretDown, Brain, Clock, LinkedinLogo, MagicWand, Sparkle, UserCircle, Check } from "@phosphor-icons/react";

import { formatINR } from "./api";
import { Btn, cx } from "./ui";
import { planType } from "./landingContent";

const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
export const validityText = (days) => (!days ? "No expiry" : days % 365 === 0 ? `Valid ${plural(days / 365, "year")}` : `Valid ${days} days`);
export const TYPE_ICON = { ai: Brain, human: UserCircle, linkedin: LinkedinLogo, mix: Sparkle, builder: MagicWand };
export const TYPE_LABEL = { ai: "AI reviews", human: "Human review", linkedin: "LinkedIn review", mix: "Human + LinkedIn", builder: "Resume builder" };

/* What a plan gives beyond the three headline counts, one line each. */
export const planFacts = (p) => [
  validityText(p.validityDays),
  ...(p.human?.enabled && p.includes?.rewrittenResume ? ["Complete rewritten resume from our team"] : []),
  ...(p.includes?.jobMatch ? ["Match against a job description"] : []),
  ...(p.builder?.enabled ? ["AI writes a tailored resume for each build"] : []),
];

const Credit = ({ icon: Icon, n, label }) => (
  <li className="rl-credit">
    <Icon size={18} weight="duotone" aria-hidden />
    <b className="rv-mono">{n}</b>
    <span>{label}</span>
  </li>
);

/* One plan. `onSelect` is the action (buy); `cta` the button text. A featured plan gets the dark treatment. */
export default function PlanCard({ plan, featured = false, cta, busy = false, disabled = false, onSelect, href, as, style, className }) {
  const type = planType(plan);
  const Icon = TYPE_ICON[type];
  const save = plan.compareAt > plan.price ? Math.round(((plan.compareAt - plan.price) / plan.compareAt) * 100) : 0;
  const aiOn = plan.ai?.enabled !== false;
  const unlimited = aiOn && plan.ai?.reviews === 0;
  const [open, setOpen] = useState(false);
  const facts = [...planFacts(plan), ...(plan.features || [])];
  const shown = open ? facts : facts.slice(0, 4);
  const person = plan.human?.enabled || plan.linkedin?.enabled;
  return (
    <article className={cx("rl-plan", featured && "is-featured", className)} style={style}>
      <div className="rl-plan-head">
        <span className="rl-plan-type"><Icon size={15} weight="bold" aria-hidden />{TYPE_LABEL[type]}</span>
        {plan.badge && <span className="rl-plan-badge">{plan.badge}</span>}
      </div>
      <h3 className="rl-plan-name">{plan.name}</h3>
      {plan.tagline && <p className="rl-plan-tag">{plan.tagline}</p>}

      <div className="rl-plan-price">
        <span className="rv-mono rl-price">{formatINR(plan.price)}</span>
        {plan.compareAt > 0 && <s className="rv-mono">{formatINR(plan.compareAt)}</s>}
        {save > 0 && <span className="rl-save">Save {save}%</span>}
      </div>
      <p className="rl-plan-once">One-time payment</p>

      <ul className="rl-credits" aria-label="Included reviews">
        {aiOn && <Credit icon={Brain} n={unlimited ? "∞" : plan.ai?.reviews} label="AI" />}
        {plan.human?.enabled && <Credit icon={UserCircle} n={plan.human.reviews} label="Human" />}
        {plan.linkedin?.enabled && <Credit icon={LinkedinLogo} n={plan.linkedin.reviews} label="LinkedIn" />}
        {plan.builder?.enabled && <Credit icon={MagicWand} n={plan.builder.credits} label={plan.builder.credits === 1 ? "Resume build" : "Resume builds"} />}
      </ul>

      <p className="rl-plan-sla"><Clock size={14} weight="bold" aria-hidden />
        {person ? <>Human review within <b>{plan.deliveryHours} hours</b>{plan.deliveryHours < 48 ? " · priority" : ""}</> : !aiOn ? <>Resume built by AI in <b>a few minutes</b></> : <>AI report in about <b>2 minutes</b></>}
      </p>

      <ul className="rl-plan-list">
        {shown.map((f) => <li key={f}><Check size={14} weight="bold" aria-hidden /><span>{f}</span></li>)}
      </ul>
      {facts.length > 4 && (
        <button type="button" className="rl-plan-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          {open ? "Show less" : `Show all ${facts.length} features`}<CaretDown size={13} weight="bold" aria-hidden />
        </button>
      )}
      <Btn as={as} to={href} variant={featured ? "primary" : "ghost"} size="lg" block loading={busy} disabled={disabled} onClick={onSelect} className="rl-plan-cta">
        {cta} <ArrowRight size={16} weight="bold" aria-hidden />
      </Btn>
    </article>
  );
}
