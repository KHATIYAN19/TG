import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { errMsg } from "../arena/api";
import { formatINR } from "./api";
import { payForPlan } from "./checkout";
import PlanCard from "./Plans";
import { PLAN_TYPES, planType } from "./landingContent";
import { Btn, Skeleton } from "./ui";

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
      if (out.status === "dismissed") toast("Payment cancelled. You can try again whenever you're ready.");
      else toast.error(out.message || "The payment didn't go through. Nothing was charged.");
    } catch (e) {
      toast.error(errMsg(e));
    } finally { setBusy(""); }
  }, [navigate, user, onNeedLogin]);
  return { buy, busy };
}

/* Type tabs + a grid that is a swipeable row on phones, 2 columns on tablets, 3 or more on desktops. */
export default function PlanPicker({ packs, failed, type, setType, buyer, cta = (p) => `Choose plan · ${formatINR(p.price)}`, highlight = "", center = true }) {
  const [own, setOwn] = useState("all");
  const t = type ?? own;
  const set = setType ?? setOwn;
  const featured = packs ? packs.findIndex((p) => (highlight ? p.key === highlight : p.badge)) : -1;
  const shown = packs ? packs.filter((p) => t === "all" || planType(p) === t) : null;
  const cur = PLAN_TYPES.find((x) => x.id === t) || PLAN_TYPES[0];
  const counts = (id) => (packs ? packs.filter((p) => id === "all" || planType(p) === id).length : 0);
  return (
    <div>
      <div className="rv-ptabs" role="tablist" aria-label="Plan type" style={center ? undefined : { marginLeft: 0 }}>
        {PLAN_TYPES.map((x) => (
          <button key={x.id} role="tab" type="button" aria-selected={t === x.id} onClick={() => set(x.id)}>{x.label}{packs && <span className="rv-mono">{counts(x.id)}</span>}</button>
        ))}
      </div>
      <p className="rv-muted rv-sm" style={{ textAlign: center ? "center" : "left", marginTop: 16, minHeight: 22 }} aria-live="polite">{cur.blurb}</p>

      <div className={`rv-plans${center ? "" : " left"}`} style={{ marginTop: 28 }}>
        {packs === null && !failed && [0, 1, 2].map((i) => <Skeleton key={i} h={460} style={{ borderRadius: 20 }} />)}
        {shown?.map((p) => (
          <PlanCard key={p.id} plan={p} featured={packs.indexOf(p) === featured} cta={cta(p)} busy={buyer.busy === p.id} disabled={Boolean(buyer.busy) && buyer.busy !== p.id} onSelect={() => buyer.buy(p)} />
        ))}
      </div>
      {packs?.length > 1 && shown?.length > 1 && <p className="rv-xs rv-subtle rv-swipe">Swipe to see more plans →</p>}
      {failed && <p role="alert" className="rv-muted" style={{ marginTop: 28, textAlign: "center" }}>Plans couldn't load. Please refresh the page.</p>}
      {packs?.length === 0 && <p className="rv-muted" style={{ marginTop: 28, textAlign: "center" }}>Reviews are not open right now. Please check back soon.</p>}
      {packs?.length > 0 && shown.length === 0 && (
        <div className="rv-tile" style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 600 }}>No plan in this category right now.</p>
          <p className="rv-muted rv-sm" style={{ marginTop: 6 }}>See every plan, or pick another type.</p>
          <Btn variant="ghost" style={{ marginTop: 16 }} onClick={() => set("all")}>Show all plans</Btn>
        </div>
      )}
    </div>
  );
}
