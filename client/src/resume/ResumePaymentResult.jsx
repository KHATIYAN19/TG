import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowClockwise, ArrowRight, Bank, CheckCircle, Clock, Copy, Envelope, Lightning, ShieldCheck, WarningCircle, XCircle } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { formatINR, getPaymentStatus } from "./api";
import { payForExisting } from "./checkout";
import { Btn, Page, cx } from "./ui";

/*
  Where the payment gateway sends the browser back to (or where the app sends someone whose payment didn't finish).
  The URL only says what the gateway CLAIMED, so we ask OUR server for the real status (it asks the gateway) and show exactly what is
  happening, with the right next step for each case:

    checking    asking the bank, a few seconds
    paid        money received: straight to "send in your resume"
    processing  a payment really is in flight at the bank (UPI / net banking can lag): reassure, keep checking, never block the person
    notpaid     the window was closed or nothing was started: no waiting, offer "pay again" at once
    failed      the bank declined or the person cancelled: say why in plain words, offer "pay again" or another plan
    slow        still in flight after a few minutes: tell them it is safe to leave, how it will resolve, and how to reach us
    error       we couldn't reach our own server: try again
*/
const SUPPORT = "supporttargettrek@gmail.com";
const FAST_MS = 2500; // while we are still expecting an answer
const SLOW_MS = 5000; // once a payment is known to be in flight
const NOTPAID_AFTER = 2; // consecutive "nothing started" answers before we believe it (the gateway can lag a few seconds)
const PROCESSING_LIMIT_MS = 3 * 60 * 1000; // after this the page says "taking longer than usual"
const NOTPAID_WATCH_MS = 90 * 1000; // a payment that "wasn't started" is still re-checked for a while, in case the bank was just late

const FAIL_COPY = {
  USER_CANCELLED: { title: "You cancelled the payment", text: "The payment was cancelled before it went through, so nothing was charged. Your plan is saved, so you can pay in one tap." },
  PAYMENT_DECLINED: { title: "The bank declined the payment", text: "Your bank or UPI app didn't approve it, so nothing was charged. This usually fixes itself with another try or another payment method." },
  DEFAULT: { title: "The payment didn't go through", text: "The payment wasn't completed, so nothing was charged. Your plan is saved, so you can try again in one tap." },
};
const FAIL_TIPS = ["Try another UPI app, a card or net banking.", "Check your balance and your daily UPI or card limit.", "Enter the OTP quickly, it expires within a minute or two."];

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Steps({ items }) {
  return (
    <ol className="rv-pay-steps" aria-label="Payment progress">
      {items.map(([label, state]) => (
        <li key={label} className={state}>
          <span className="rv-pay-dot" aria-hidden>{state === "done" ? "✓" : state === "now" ? <span className="rv-spin" /> : ""}</span>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export default function ResumePaymentResult() {
  const token = useSelector((s) => s.auth?.token);
  const user = useSelector((s) => s.auth?.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const purchase = params.get("purchase") || "";
  const hinted = params.get("status");
  const next = `/resume-review/app/submit/${purchase}`;

  const [view, setView] = useState(purchase ? "checking" : "missing");
  const [info, setInfo] = useState(null); // { plan: {name, amount}, reason }
  const [elapsed, setElapsed] = useState(0);
  const [round, setRound] = useState(0); // bump to start checking again from scratch
  const [paying, setPaying] = useState(false);
  const [left, setLeft] = useState(4);
  const startedAt = useRef(Date.now());
  const noneStreak = useRef(0);

  // ---- ask our server, and keep asking at the right pace for what it says ----
  useEffect(() => {
    if (!token || !purchase) return undefined;
    let live = true; let timer;
    startedAt.current = Date.now(); noneStreak.current = 0; setElapsed(0);
    const check = async () => {
      const age = Date.now() - startedAt.current;
      try {
        const r = await getPaymentStatus(purchase);
        if (!live) return;
        setInfo({ plan: r.plan, reason: r.reason });
        if (r.status === "paid") return setView("paid");
        if (r.status === "failed") return setView("failed");
        if (r.progress === "processing") {
          noneStreak.current = 0;
          setView(age > PROCESSING_LIMIT_MS ? "slow" : "processing");
          return void (timer = setTimeout(check, SLOW_MS));
        }
        if (r.progress === "unknown") { setView("checking"); return void (timer = setTimeout(check, SLOW_MS)); } // we couldn't reach the gateway: not the person's problem, don't judge yet
        // nothing is in flight at the bank
        noneStreak.current += 1;
        if (hinted === "failed" || noneStreak.current >= NOTPAID_AFTER) {
          setView("notpaid");
          return age < NOTPAID_WATCH_MS ? void (timer = setTimeout(check, 8000)) : undefined; // after a while we stop asking; "Check again" is still there
        }
        setView("checking");
        timer = setTimeout(check, FAST_MS);
      } catch {
        if (!live) return;
        setView("error");
      }
    };
    check();
    return () => { live = false; clearTimeout(timer); };
  }, [token, purchase, hinted, round]);

  // a clock, only while we are waiting for something
  useEffect(() => {
    if (!["checking", "processing", "slow"].includes(view)) return undefined;
    const t = setInterval(() => setElapsed(Math.round((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, [view]);

  // paid: a short, visible countdown, then on to the next step (the button is always there)
  useEffect(() => {
    if (view !== "paid") return undefined;
    setLeft(4);
    const t = setInterval(() => setLeft((n) => n - 1), 1000);
    return () => clearInterval(t);
  }, [view]);
  useEffect(() => { if (view === "paid" && left <= 0) navigate(next, { replace: true }); }, [view, left, navigate, next]);

  // ---- pay again, right here, on the same plan ----
  const payAgain = useCallback(async () => {
    setPaying(true);
    try {
      const out = await payForExisting({ purchaseId: purchase, description: info?.plan?.name || "Resume Lab plan", user });
      if (out.status === "redirect") return; // the browser is leaving for the gateway
      if (out.status === "dismissed") return void toast("Payment window closed. Whenever you're ready, tap pay again.");
      if (out.status === "failed") toast.error(out.message || "That payment didn't go through. Nothing was charged.");
      setRound((n) => n + 1); // paid, pending or failed: ask the server what really happened
    } catch (e) {
      toast.error(errMsg(e));
    } finally { setPaying(false); }
  }, [purchase, info, user]);

  const copyRef = async () => {
    try { await navigator.clipboard.writeText(purchase); toast.success("Reference copied"); } catch { toast(purchase); }
  };

  if (!token) return <Navigate to="/resume-review/login" replace state={{ from: location }} />;

  const plan = info?.plan;
  const price = plan?.amount != null ? formatINR(plan.amount) : "";
  const fail = FAIL_COPY[info?.reason] || FAIL_COPY.DEFAULT;
  const waiting = ["checking", "processing", "slow"].includes(view);

  const body = {
    missing: {
      tone: "bad", Icon: WarningCircle, title: "We couldn't find this payment", text: "The link is missing its payment reference. If you were charged, your plan appears in My plans within a few minutes.",
      actions: <><Btn as={Link} to="/resume-review/app/plans" size="lg">Choose a plan</Btn><Btn as={Link} to="/resume-review/app" variant="ghost">My space</Btn></>,
    },
    checking: {
      tone: "", Icon: Clock, spin: true, title: "Confirming your payment…", text: "We're asking your bank. This usually takes a few seconds. Please keep this page open.",
      extra: <Steps items={[["Payment sent", "done"], ["Bank is confirming", "now"], ["Activating your plan", ""]]} />,
    },
    processing: {
      tone: "warn", Icon: Bank, spin: true, title: "Your bank is still processing this payment", text: "UPI and net banking can take a minute or two to confirm. Nothing for you to do: we're checking again every few seconds and will move you on as soon as it's confirmed.",
      extra: <Steps items={[["Payment sent", "done"], ["Bank is confirming", "now"], ["Activating your plan", ""]]} />,
      actions: <Btn variant="ghost" onClick={() => setRound((n) => n + 1)}><ArrowClockwise size={16} weight="bold" aria-hidden />Check now</Btn>,
      note: "Don't pay again while this is in progress. If it succeeds, you'd be charged twice.",
    },
    slow: {
      tone: "warn", Icon: Clock, title: "This is taking longer than usual", text: "Your bank hasn't confirmed yet. That happens now and then and it is not a problem on your side. Your plan switches on by itself the moment the bank confirms, so you can safely close this page.",
      extra: (
        <ul className="rv-pay-list">
          <li><ShieldCheck size={18} weight="duotone" aria-hidden /><span><b>If the payment succeeds</b>, your plan appears in My plans automatically. No need to pay again.</span></li>
          <li><Lightning size={18} weight="duotone" aria-hidden /><span><b>If it fails</b>, any money taken is returned by your bank on its own, normally within 5 to 7 working days.</span></li>
          <li><Envelope size={18} weight="duotone" aria-hidden /><span><b>Still nothing after 30 minutes?</b> Write to <a href={`mailto:${SUPPORT}?subject=Resume%20Lab%20payment%20${purchase}`} className="rv-link">{SUPPORT}</a> with the reference below.</span></li>
        </ul>
      ),
      actions: <><Btn size="lg" onClick={() => setRound((n) => n + 1)}><ArrowClockwise size={16} weight="bold" aria-hidden />Check again</Btn><Btn as={Link} to="/resume-review/app" variant="ghost">Go to my space</Btn></>,
    },
    notpaid: {
      tone: "warn", Icon: XCircle, title: "Payment not completed", text: `We didn't receive any payment for ${plan?.name ? `"${plan.name}"` : "this plan"}. You may have closed the payment window, or it was cancelled before any money was taken. Nothing was charged.`,
      actions: (
        <>
          <Btn size="lg" loading={paying} onClick={payAgain}>{price ? `Pay ${price} now` : "Pay now"} <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
          <Btn as={Link} to="/resume-review/app/plans" variant="ghost">Choose a different plan</Btn>
          <button type="button" className="rv-link rv-pay-sub" onClick={() => setRound((n) => n + 1)}>I already paid, check again</button>
        </>
      ),
    },
    failed: {
      tone: "bad", Icon: WarningCircle, title: fail.title, text: fail.text,
      extra: (
        <div className="rv-pay-tips">
          <p className="rv-xs" style={{ fontWeight: 700, marginBottom: 8 }}>Things that usually help</p>
          <ul>{FAIL_TIPS.map((t) => <li key={t}>{t}</li>)}</ul>
          <p className="rv-xs rv-subtle" style={{ marginTop: 10 }}>If money was taken, your bank returns it automatically within 5 to 7 working days.</p>
        </div>
      ),
      actions: (
        <>
          <Btn size="lg" loading={paying} onClick={payAgain}><ArrowClockwise size={16} weight="bold" aria-hidden />{price ? `Try again · ${price}` : "Try again"}</Btn>
          <Btn as={Link} to="/resume-review/app/plans" variant="ghost">Choose a different plan</Btn>
        </>
      ),
    },
    error: {
      tone: "warn", Icon: WarningCircle, title: "We couldn't check your payment just now", text: "That's a connection problem between you and us, not a problem with your payment. If money was taken, your plan will still switch on by itself.",
      actions: <><Btn size="lg" onClick={() => setRound((n) => n + 1)}><ArrowClockwise size={16} weight="bold" aria-hidden />Try again</Btn><Btn as={Link} to="/resume-review/app" variant="ghost">My space</Btn></>,
    },
    paid: {
      tone: "ok", Icon: CheckCircle, title: "Payment received", text: `${plan?.name ? `Your ${plan.name} plan is ready. ` : "Your plan is ready. "}Next: send in your resume and your AI report arrives in about two minutes.`,
      extra: <p className="rv-xs rv-subtle" aria-live="polite">Taking you there in {Math.max(left, 0)}…</p>,
      actions: <Btn as={Link} to={next} replace size="lg">Send in my resume <ArrowRight size={16} weight="bold" aria-hidden /></Btn>,
    },
  }[view];
  const { Icon } = body;

  return (
    <Page title="Payment | Resume Lab">
      <main className="rv-shell" style={{ padding: "56px 0 120px" }}>
        <div className={cx("rv-card rv-in rv-pay", body.tone)} style={{ maxWidth: 520, margin: "0 auto", padding: "40px 32px 32px", textAlign: "center" }} role="status" aria-live="polite">
          <span className={cx("rv-pay-icon", body.tone, body.spin && "pulse", view === "paid" && "pop")}><Icon size={44} weight="duotone" aria-hidden /></span>
          <h1 className="rv-h3" style={{ marginTop: 22 }}>{body.title}</h1>

          {plan && view !== "missing" && (
            <p className="rv-pay-plan"><b>{plan.name}</b>{price && <span className="rv-mono"> · {price}</span>}</p>
          )}

          <p className="rv-muted rv-sm" style={{ marginTop: 12, lineHeight: 1.65 }}>{body.text}</p>
          {body.extra && <div style={{ marginTop: 24, textAlign: "left" }}>{body.extra}</div>}
          {waiting && <p className="rv-xs rv-subtle rv-mono" style={{ marginTop: 18 }}>Checking for {mmss(elapsed)}</p>}
          {body.actions && <div className="rv-pay-actions">{body.actions}</div>}
          {body.note && <p className="rv-xs rv-subtle" style={{ marginTop: 16 }}>{body.note}</p>}

          {purchase && ["processing", "slow", "notpaid", "failed", "error"].includes(view) && (
            <div className="rv-pay-ref">
              <span className="rv-xs rv-subtle">Reference</span>
              <code className="rv-mono rv-xs">{purchase}</code>
              <button type="button" onClick={copyRef} aria-label="Copy reference"><Copy size={14} weight="bold" aria-hidden /></button>
            </div>
          )}
        </div>
        <p className="rv-xs rv-subtle" style={{ textAlign: "center", marginTop: 20 }}>Payments are handled by your bank and our payment partner. We never see your card or UPI details.</p>
      </main>
    </Page>
  );
}
