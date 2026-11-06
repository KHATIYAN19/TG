import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, CheckCircle2, Lock, Pencil, ShieldCheck, Tag } from "lucide-react";

import { useArena } from "../ArenaContext";
import { http, errMsg, errCode, inr } from "../api";
import { BackgroundLine, PracticeFacts, TargetCompanies, TopicBadges } from "../MemberBits";
import { Button, Card, Spinner, cx } from "../ui";
import { resolveGateway } from "../gateway";
import OfferBanner from "../OfferBanner";
import { ProfileForm } from "./ProfilePage";

/* ------------------------------ payment SDKs ------------------------------ */
const loadScript = (id, src, ready) =>
  new Promise((resolve) => {
    if (ready()) return resolve(true);
    const existing = document.getElementById(id);
    const script = existing || Object.assign(document.createElement("script"), { id, src, async: true });
    script.addEventListener("load", () => resolve(ready()));
    script.addEventListener("error", () => resolve(false));
    if (!existing) document.body.appendChild(script);
  });

const loadCashfree = () => loadScript("cashfree-sdk", "https://sdk.cashfree.com/js/v3/cashfree.js", () => Boolean(window.Cashfree));
// Referral code captured globally by App.jsx (?ref= / ?referralCode=). The server validates it.
const readReferralCode = () => {
  try {
    const code = (localStorage.getItem("referralCode") || "").trim();
    return /^[a-zA-Z0-9_-]{1,64}$/.test(code) ? code : undefined;
  } catch {
    return undefined;
  }
};

const loadRazorpay = () => loadScript("razorpay-sdk", "https://checkout.razorpay.com/v1/checkout.js", () => Boolean(window.Razorpay));

/* ------------------------------- step header ------------------------------- */
const STEPS = ["Account", "Payment", "Your details"];

function Stepper({ current }) {
  return (
    <ol className="mb-8 flex items-center" aria-label="Progress">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className={cx("flex items-center", i < STEPS.length - 1 && "flex-1")} aria-current={active ? "step" : undefined}>
            <span className="flex items-center gap-2.5">
              <span
                className={cx(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors",
                  done && "bg-orange-600 text-white",
                  active && "bg-orange-600 text-white ring-4 ring-orange-100 dk:ring-orange-500/20",
                  !done && !active && "bg-stone-200 dk:bg-[#35261e] text-stone-500 dk:text-[#b9a79c]"
                )}
              >
                {done ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : i + 1}
              </span>
              <span className={cx("hidden text-sm font-semibold sm:block", active ? "text-[#29201b] dk:text-[#fff7ed]" : done ? "text-stone-700 dk:text-[#ead9cc]" : "text-stone-400 dk:text-[#8f7c70]")}>{label}</span>
            </span>
            {i < STEPS.length - 1 && <span className={cx("mx-3 h-0.5 flex-1 rounded", done ? "bg-orange-500" : "bg-stone-200 dk:bg-[#35261e]")} />}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------- details recap ------------------------------- */
function DetailsRecap({ profile, onEdit }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#29201b] dk:text-[#fff7ed]">Your saved details</h2>
          <p className="mt-0.5 text-sm text-stone-600 dk:text-[#d6c4b8]">Saved to your account. You appear as <strong>{profile.alias}</strong>.</p>
        </div>
        <Button variant="outline" size="sm" onClick={onEdit}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
      </div>

      <div className="mt-4"><TopicBadges topics={profile.topics} level={profile.level} /></div>
      <BackgroundLine m={profile} className="mt-4" />
      <div className="mt-4 flex flex-wrap gap-1.5">
        {profile.skills.map((s) => <span key={s} className="rounded-md bg-stone-100 dk:bg-[#2c211b] px-2 py-0.5 text-xs font-medium text-stone-700 dk:text-[#ead9cc]">{s}</span>)}
      </div>
      <div className="mt-4"><PracticeFacts m={profile} full /></div>
      <div className="mt-2"><TargetCompanies list={profile.targetCompanies} /></div>
      {profile.bio && <p className="mt-3 rounded-xl bg-[#fff8f2] dk:bg-[#15110e] p-3 text-sm text-stone-700 dk:text-[#ead9cc] ring-1 ring-orange-100 dk:ring-orange-500/20">{profile.bio}</p>}

      <p className="mt-4 flex items-center gap-2 text-xs text-stone-500 dk:text-[#b9a79c]"><Lock className="h-3.5 w-3.5" aria-hidden /> Your name and contact details stay private until you match and choose to share them. Your company and job title are visible on your card.</p>
    </Card>
  );
}

/* ------------------------------- payment step ------------------------------- */
function PaymentStep({ me, refresh, onProcessing }) {
  const navigate = useNavigate();
  const { settings } = me;

  const [code, setCode] = useState("");
  const [applied, setApplied] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [checking, setChecking] = useState(false);
  const [paying, setPaying] = useState(false);

  const list = settings.entryPricePaise;
  const final = applied ? applied.finalPaise : list;
  const gw = resolveGateway(settings.paymentGateway);

  // If the admin changes the price while this page is open, drop the stale preview.
  useEffect(() => setApplied(null), [list]);

  const apply = async () => {
    if (!code.trim()) return;
    setChecking(true);
    setCouponError("");
    try {
      const { data } = await http.post("/coupon/validate", { code });
      setApplied(data.data);
    } catch (e) {
      setApplied(null);
      setCouponError(errMsg(e));
    } finally {
      setChecking(false);
    }
  };

  const finishPaid = async () => {
    toast.success(me.profile ? "Payment received. Welcome to the arena!" : "Payment received. Now add your details to enter the arena.", { id: "arena-paid" });
    await refresh();
    // No details yet: the app routes a paid member without a profile back to the details step.
    navigate("/prep-buddy/app", { replace: true });
  };

  const startRazorpay = (checkout) =>
    new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: checkout.key,
        amount: checkout.amount,
        currency: checkout.currency,
        order_id: checkout.razorpayOrderId,
        name: checkout.name,
        description: checkout.description,
        prefill: checkout.prefill,
        theme: { color: "#ea580c" },
        handler: async (response) => {
          try {
            const { data, status } = await http.post("/entry/verify", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            if (status === 202) { toast(data.message, { icon: "⏳", id: "arena-pay-pending" }); onProcessing(); } else await finishPaid();
            resolve();
          } catch (e) { reject(e); }
        },
        modal: {
          ondismiss: async () => {
            try {
              const { data } = await http.post("/entry/reconcile");
              if (["paid", "consumed"].includes(data.data.status)) await finishPaid();
            } catch { /* ignore */ }
            resolve();
          },
        },
      });
      rzp.on("payment.failed", (resp) => toast.error(resp?.error?.description || "Payment failed. Please try again.", { id: "arena-pay-error" }));
      rzp.open();
    });

  const pay = async () => {
    setPaying(true);
    try {
      const { data } = await http.post("/entry/checkout", { couponCode: applied?.coupon?.code || "", affiliateCode: readReferralCode() });

      if (data.data.free) {
        toast.success(me.profile ? "You're in the arena!" : "You're in! Now add your details to enter the arena.", { id: "arena-paid" });
        await refresh();
        navigate("/prep-buddy/app", { replace: true });
        return;
      }

      const { checkout } = data.data;

      if (checkout.gateway === "cashfree") {
        if (!(await loadCashfree())) throw new Error("Couldn't load the payment window. Check your connection and try again.");
        // Redirects to Cashfree, then back to /prep-buddy/app/join?order_id=…
        const result = await window.Cashfree({ mode: checkout.mode }).checkout({
          paymentSessionId: checkout.paymentSessionId,
          redirectTarget: "_self",
        });
        if (result?.error) throw new Error(result.error.message || "Unable to open the payment window");
        return;
      }

      if (!(await loadRazorpay())) throw new Error("Couldn't load the payment window. Check your connection and try again.");
      await startRazorpay(checkout);
    } catch (e) {
      toast.error(e.response ? errMsg(e) : e.message || "Payment failed. Please try again.", { id: "arena-pay-error" });
      if (["ALREADY_IN_ARENA", "ALREADY_PAID"].includes(errCode(e))) { await refresh(); navigate("/prep-buddy/app", { replace: true }); }
    } finally {
      setPaying(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-orange-600 to-amber-500 p-6 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-100">One-time entry</p>
        <div className="mt-2 flex items-end gap-3">
          <span className="text-4xl font-bold">{inr(final)}</span>
          {applied && applied.discountPaise > 0 && <span className="pb-1 text-lg text-orange-100 line-through">{inr(list)}</span>}
        </div>
        <p className="mt-1 text-sm text-orange-50">
          Includes <strong>{settings.matchesPerEntry} {settings.matchesPerEntry === 1 ? "match" : "matches"}</strong>
          {settings.matchesPerEntry > 1 ? ", one after another." : "."} Want more later? Buy a new entry.
        </p>
      </div>

      <div className="space-y-5 p-6">
        <ul className="space-y-2.5 text-sm text-stone-700 dk:text-[#ead9cc]">
          {["Add your details and your profile goes live in the arena", "Browse members, send and accept buddy requests", `${settings.matchesPerEntry} ${settings.matchesPerEntry === 1 ? "partnership" : "partnerships"} with private chat${settings.matchesPerEntry > 1 ? " (one at a time)" : ""}`].map((t) => (
            <li key={t} className="flex gap-2.5"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dk:text-emerald-400" aria-hidden />{t}</li>
          ))}
        </ul>

        <div>
          <label htmlFor="coupon" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-stone-800 dk:text-[#ffedd5]">
            <Tag className="h-4 w-4 text-stone-400 dk:text-[#8f7c70]" aria-hidden /> Coupon code
          </label>
          {applied ? (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 dk:bg-emerald-500/10 px-3.5 py-2.5 text-sm text-emerald-800 dk:text-emerald-200 ring-1 ring-emerald-100 dk:ring-emerald-500/20">
              <span><strong>{applied.coupon.code}</strong> applied · you save {inr(applied.discountPaise)}</span>
              <button onClick={() => { setApplied(null); setCode(""); }} className="shrink-0 font-semibold underline">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && apply()}
                placeholder="Enter code" maxLength={30}
                className={cx("block w-full rounded-xl border bg-white dk:bg-[#241b15] px-3.5 py-2.5 text-sm uppercase focus:outline-none focus:ring-2", couponError ? "border-rose-300 dk:border-rose-500/30 focus:ring-rose-200 dk:focus:ring-rose-500/25" : "border-stone-300 dk:border-[#5a4336] focus:border-orange-500 focus:ring-orange-100 dk:focus:ring-orange-500/20")} />
              <Button variant="outline" onClick={apply} loading={checking} disabled={!code.trim()}>Apply</Button>
            </div>
          )}
          {couponError && <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dk:text-rose-400">{couponError}</p>}
        </div>

        {settings.cancelRefundEnabled && settings.cancellationFeePercent != null && (
        <div className="rounded-xl bg-orange-50/60 dk:bg-orange-500/10 p-4 text-sm text-stone-700 dk:text-[#ead9cc] ring-1 ring-orange-100 dk:ring-orange-500/20">
          <p className="flex items-center gap-2 font-semibold text-[#29201b] dk:text-[#fff7ed]"><ShieldCheck className="h-4 w-4 text-orange-600 dk:text-orange-400" aria-hidden /> Cancellation policy</p>
          <p className="mt-1.5">
            Cancel any time <strong>before your first match</strong> and get {100 - settings.cancellationFeePercent}% back
            ({settings.cancellationFeePercent}% cancellation fee). Once a match is used, the entry isn't refundable.
          </p>
        </div>
        )}

        <Button size="lg" className="w-full" onClick={pay} loading={paying} disabled={!settings.enabled}>
          {final === 0 ? "Join the arena for free" : `Pay ${inr(final)} & join`}
        </Button>
        {!settings.enabled && <p className="text-center text-xs text-amber-700 dk:text-amber-300">New entries are paused for now. Please check back soon.</p>}
        <div className="flex justify-center"><OfferBanner offer={settings.offer} /></div>
        <p className="flex items-center justify-center gap-1.5 text-xs text-stone-500 dk:text-[#b9a79c]"><Lock className="h-3.5 w-3.5" aria-hidden /> {gw ? `Secure payment via ${gw.name}` : "Secure payment"}{me.profile ? " · your details are saved" : ""}</p>
        {gw && final > 0 && <p className="text-center text-xs text-stone-500 dk:text-[#b9a79c]">Pay with {gw.methods.join(", ")}.</p>}
      </div>
    </Card>
  );
}

/* ------------------------- returning from the gateway ------------------------- */
function PaymentReturn({ orderId, refresh }) {
  const navigate = useNavigate();
  const [state, setState] = useState("checking"); // checking | processing | failed
  const [message, setMessage] = useState("");
  const tries = useRef(0);
  const started = useRef(false);

  const check = useCallback(async () => {
    setState("checking");
    try {
      const { data, status } = await http.post("/entry/verify", { orderId });
      if (status === 202) {
        // Gateways can take a few seconds to settle. Poll briefly.
        tries.current += 1;
        setMessage(data.message);
        if (tries.current < 6) return setTimeout(check, 3000);
        return setState("processing");
      }
      sessionStorage.setItem(`arena:verify:${orderId}`, "done");
      toast.success("Payment received.", { id: "arena-paid" });
      await refresh();
      // The app sends a member with details to the arena, and one without to the details step.
      navigate("/prep-buddy/app", { replace: true });
    } catch (e) {
      setMessage(errMsg(e));
      setState("failed");
    }
  }, [orderId, refresh, navigate]);

  // Verify each gateway order exactly once, even if React re-runs the effect
  // (StrictMode, re-renders). This is what used to produce 2-3 duplicate toasts.
  useEffect(() => {
    const key = `arena:verify:${orderId}`;
    if (sessionStorage.getItem(key) === "done") {
      navigate("/prep-buddy/app", { replace: true }); // already confirmed (page reload)
      return;
    }
    if (started.current) return;
    started.current = true;
    check();
  }, [check, orderId, navigate]);

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      {state === "checking" ? (
        <><Spinner label="Confirming your payment" /><p className="text-sm text-stone-500 dk:text-[#b9a79c]">Please don't close this page.</p></>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-[#29201b] dk:text-[#fff7ed]">{state === "processing" ? "Payment still processing" : "We couldn't confirm your payment"}</h2>
          <p className="mt-2 text-sm text-stone-600 dk:text-[#d6c4b8]">
            {state === "processing"
              ? "Your bank hasn't confirmed the payment yet. If money was deducted, your entry activates automatically. You can also check again."
              : message}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button onClick={() => { tries.current = 0; started.current = true; check(); }}>Check again</Button>
            <Link to="/prep-buddy/app/join" replace className="inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-600 dk:text-[#d6c4b8] ring-1 ring-inset ring-stone-300 dk:ring-[#5a4336] hover:bg-orange-50 dk:hover:bg-orange-500/10">Back to payment</Link>
          </div>
        </>
      )}
    </Card>
  );
}

/* ----------------------------------- page ----------------------------------- */
// Matches that came with a book pack: those members don't pay in the arena, they just add details.
const hasPackAccess = (pack) => Boolean(pack?.packMember || pack?.matches?.waiting > 0 || pack?.matches?.granted > 0);

export default function JoinPage() {
  const { me, refresh } = useArena();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const orderId = params.get("order_id");

  const profile = me.profile;
  const [editing, setEditing] = useState(false);
  const [, setProcessing] = useState(false);

  // Returning from the payment gateway.
  if (orderId) return <PaymentReturn orderId={orderId} refresh={async () => { await refresh(); setParams({}, { replace: true }); }} />;

  /*
    PAY FIRST, THEN DETAILS:
      1. no details yet and nothing paid  → payment (step 2)
      2. paid (or a book pack) but no details → details form (step 3), then straight into the arena
      3. older accounts that saved details before paying → recap + payment, as before
  */
  const paidWithoutDetails = !profile && ["paid", "in_match"].includes(me.entry?.status);
  const unlocked = paidWithoutDetails || (!profile && hasPackAccess(me.pack));
  const showForm = unlocked || (profile && editing);
  const step = unlocked ? 2 : 1;

  if (showForm) {
    return (
      <div className="mx-auto max-w-5xl">
        <Stepper current={step} />
        <div className="mx-auto max-w-3xl">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#29201b] dk:text-[#fff7ed]">{profile ? "Edit your details" : paidWithoutDetails ? "Payment received. Now tell us about you" : "Tell us about you"}</h2>
            <p className="mt-1 text-sm text-stone-600 dk:text-[#d6c4b8]">
              {profile
                ? "Update your details. Other members only ever see the anonymous parts."
                : "Save your details and your profile appears in the arena straight away. Other members only ever see the anonymous parts."}
            </p>
          </div>
          {profile && (
            <button onClick={() => setEditing(false)} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-700 dk:text-orange-300 hover:text-orange-600 dk:hover:text-orange-400">
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back to payment
            </button>
          )}
          <ProfileForm
            me={me}
            refresh={refresh}
            onSaved={() => { setEditing(false); if (!profile) navigate("/prep-buddy/app", { replace: true }); }}
            saveLabel={profile ? "Save & continue to payment" : "Save & enter the arena"}
          />
        </div>
      </div>
    );
  }

  // Nothing paid yet.
  return (
    <div className="mx-auto max-w-5xl">
      <Stepper current={1} />
      {profile ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="order-2 lg:order-1"><DetailsRecap profile={profile} onEdit={() => setEditing(true)} /></div>
          <div className="order-1 lg:order-2 lg:sticky lg:top-[calc(var(--arena-nav-h,5rem)+4rem)] lg:self-start"><PaymentStep me={me} refresh={refresh} onProcessing={() => setProcessing(true)} /></div>
        </div>
      ) : (
        <div className="mx-auto max-w-lg">
          <div className="mb-5 text-center">
            <h2 className="text-xl font-bold text-[#29201b] dk:text-[#fff7ed]">Pay the entry fee to join</h2>
            <p className="mt-1 text-sm text-stone-600 dk:text-[#d6c4b8]">Pay once, then add your details and your profile appears in the arena.</p>
          </div>
          <PaymentStep me={me} refresh={refresh} onProcessing={() => setProcessing(true)} />
        </div>
      )}
    </div>
  );
}
