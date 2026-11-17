import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Check, Minus, SquaresFour, LockKey, Receipt, Stack, Prohibit } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { formatINR } from "./api";
import { payForPlan } from "./checkout";
import PlanCard, { TYPE_ICON } from "./Plans";
import { COMPARE_COLS, COMPARE_ROWS, PLAN_ASSURANCE, PLAN_TYPES, planType } from "./landingContent";
import { Btn, Skeleton, cx } from "./ui";

/*
  Buying, in place: the button shows its own spinner and the payment opens right there.
  Only after a successful payment do we move on, to "send in your resume". `onNeedLogin(plan)` returns true when it took over (signed out).
*/
export function usePlanBuy({ onNeedLogin } = {}) {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth?.user);
  const [busy, setBusy] = useState("");
  const buy = useCallback(async (plan) => {
    if (onNeedLogin?.(plan)) return;
    setBusy(plan.id);
    try {
      const out = await payForPlan({ packageId: plan.id, description: plan.name, user });
      if (out.status === "redirect") return; // the browser is leaving for the gateway
      if (out.status === "paid") { toast.success("Payment received. Now send in your resume."); return navigate(`/resume-review/app/submit/${out.purchaseId}`, { replace: true }); }
      if (out.status === "pending") return navigate(`/resume-review/payment-result?purchase=${out.purchaseId}&status=pending`, { replace: true });
      if (out.status === "dismissed") toast("Payment window closed. Nothing was charged. Your plan is saved under Unfinished payments, so you can complete it any time.", { duration: 6000 });
      else return navigate(`/resume-review/payment-result?purchase=${out.purchaseId}&status=failed`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally { setBusy(""); }
  }, [navigate, user, onNeedLogin]);
  return { buy, busy };
}

const SHORT = { all: "Every plan", ai: "Instant AI reports", human: "A person reads it", linkedin: "Profile + resume", mix: "The full package" };

/* Type cards (a scrollable row on phones) + the plan grid. */
export default function PlanPicker({ packs, failed, type, setType, buyer, cta = (p) => `Choose plan · ${formatINR(p.price)}`, highlight = "" }) {
  const [own, setOwn] = useState("all");
  const t = type ?? own;
  const set = setType ?? setOwn;
  const featured = packs ? packs.findIndex((p) => (highlight ? p.key === highlight : p.badge)) : -1;
  const shown = packs ? packs.filter((p) => t === "all" || planType(p) === t) : null;
  const cur = PLAN_TYPES.find((x) => x.id === t) || PLAN_TYPES[0];
  const counts = (id) => (packs ? packs.filter((p) => id === "all" || planType(p) === id).length : 0);
  return (
    <div className="rl-picker">
      <div className="rl-types" role="tablist" aria-label="Plan type">
        {PLAN_TYPES.filter((x) => !packs?.length || x.id === "all" || x.id === t || counts(x.id) > 0).map((x) => {
          const Icon = x.id === "all" ? SquaresFour : TYPE_ICON[x.id];
          const n = counts(x.id);
          return (
            <button key={x.id} role="tab" type="button" aria-selected={t === x.id} className="rl-type" onClick={() => set(x.id)}>
              <span className="rl-type-ico"><Icon size={20} weight="duotone" aria-hidden /></span>
              <span className="rl-type-txt"><b>{x.label}</b><small>{SHORT[x.id]}</small></span>
              {packs && <span className="rl-type-n rv-mono" aria-label={`${n} plans`}>{n}</span>}
            </button>
          );
        })}
      </div>
      <p className="rl-type-blurb" aria-live="polite">{cur.blurb}</p>

      <div className="rl-plans">
        {packs === null && !failed && [0, 1, 2].map((i) => <Skeleton key={i} h={480} style={{ borderRadius: 20 }} />)}
        {shown?.map((p) => (
          <PlanCard key={p.id} plan={p} featured={packs.indexOf(p) === featured} cta={cta(p)} busy={buyer.busy === p.id} disabled={Boolean(buyer.busy) && buyer.busy !== p.id} onSelect={() => buyer.buy(p)} />
        ))}
      </div>
      {failed && <p role="alert" className="rl-empty">Plans couldn't load. Check your connection and refresh the page.</p>}
      {packs?.length === 0 && <p className="rl-empty">Reviews are not open right now. Please check back soon.</p>}
      {packs?.length > 0 && shown.length === 0 && (
        <div className="rl-empty">
          <p style={{ fontWeight: 700 }}>No plan of this type right now.</p>
          <p className="rv-muted rv-sm" style={{ marginTop: 6 }}>See every plan, or pick another type.</p>
          <Btn variant="ghost" style={{ marginTop: 16 }} onClick={() => set("all")}>Show all plans</Btn>
        </div>
      )}
    </div>
  );
}

/* the "I want…" shortcuts, without the ones that would show no plans */
export const needsFor = (needs, packs) => needs.filter(([, id]) => !packs?.length || packs.some((p) => planType(p) === id));

/* What each kind of plan includes, side by side. Scrolls sideways inside its own box on narrow screens. */
export function PlanCompare({ onPick }) {
  const cell = (v) => (v === true
    ? <span className="rl-yes"><Check size={14} weight="bold" aria-hidden /><span className="rl-sr">Yes</span></span>
    : v === false ? <span className="rl-no"><Minus size={14} weight="bold" aria-hidden /><span className="rl-sr">No</span></span>
    : <span className="rl-note">{v}</span>);
  return (
    <div className="rl-compare">
      <table>
        <caption className="rl-sr">What each kind of plan includes</caption>
        <thead>
          <tr>
            <th scope="col">What you get</th>
            {COMPARE_COLS.map(([id, label]) => {
              const Icon = TYPE_ICON[id];
              return (
                <th key={id} scope="col">
                  <span className="rl-compare-col"><Icon size={18} weight="duotone" aria-hidden />{label}</span>
                  {onPick && <button type="button" className="rl-compare-pick" onClick={() => onPick(id)}>See plans</button>}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {COMPARE_ROWS.map(([label, vals]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              {COMPARE_COLS.map(([id]) => <td key={id}>{cell(vals[id])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const ASSURE_ICON = [LockKey, Receipt, Stack, Prohibit];
export function PlanAssurance({ className = "" }) {
  return (
    <ul className={cx("rl-assure", className)}>
      {PLAN_ASSURANCE.map(([t, d], i) => {
        const Icon = ASSURE_ICON[i];
        return <li key={t}><Icon size={22} weight="duotone" aria-hidden /><div><b>{t}</b><p>{d}</p></div></li>;
      })}
    </ul>
  );
}
