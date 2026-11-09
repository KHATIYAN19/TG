import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowRight, Check, Gift, KeyRound, Lock, ShieldCheck, Ticket, Sparkles } from "lucide-react";

import { errMsg } from "../arena/api";
import { claimFreeCredit, createPayment, getPaymentStatus, redeemCode } from "./memApi";
import { runCheckout } from "./checkout";
import { formatPrice } from "./api";
import { Loading } from "./AppShell";
import { SUPPORT_EMAIL } from "./legal/constants";
import { chooseGateway, gatewayLabel } from "./paymentGateway";
import { Button, cx } from "./ui";

const STEPS = ["Account", "Unlock a page", "Choose a template"];

export function Stepper({ current }) {
  return (
    <ol className="mx-auto mb-8 flex max-w-xl items-center" aria-label="Progress">
      {STEPS.map((label, i) => (
        <li key={label} className={cx("flex items-center", i < STEPS.length - 1 && "flex-1")} aria-current={i === current ? "step" : undefined}>
          <span className="flex items-center gap-2">
            <span className={cx("grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition", i < current && "bg-emerald-500 text-white", i === current && "bg-gradient-to-br from-rose-500 to-orange-400 text-white ring-4 ring-rose-100", i > current && "bg-white text-[#a07890] ring-1 ring-rose-100")}>
              {i < current ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            <span className={cx("hidden text-sm font-semibold sm:block", i === current ? "text-[#3a1530]" : "text-[#a07890]")}>{label}</span>
          </span>
          {i < STEPS.length - 1 && <span className={cx("mx-3 h-0.5 flex-1 rounded", i < current ? "bg-emerald-300" : "bg-rose-100")} aria-hidden />}
        </li>
      ))}
    </ol>
  );
}

const INCLUDED = [
  "1 credit creates 1 page. Add credits whenever you like",
  "Any of the 5 templates, and any look",
  "A unique link, public or PIN-protected",
  "Photos, videos and music",
  "Edit it, close it or replace the link while it's online",
];

/*
  Right after sign-up: unlock your first page by paying once, or by entering a unique code.
  Either way it adds exactly ONE page credit, and every page you create uses one credit.
*/
export default function MemoriesPay({ cfg, reload, firstTime = false }) {
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth?.user);
  const [paying, setPaying] = useState(false);
  const [code, setCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState("");

  if (!cfg) return <Loading label="Getting things ready…" />;

  const price = cfg.price;
  const isFree = !(price > 0);
  const included = [INCLUDED[0], `Each page stays online for ${cfg.pageLifetimeDays || 30} days`, ...INCLUDED.slice(1)];
  const chosen = chooseGateway(cfg); // VITE_MEMORIES_PAYMENT_GATEWAY (default cashfree), or the server's default if that one is switched off
  const noGateway = !isFree && !chosen;

  const done = async (how, credits) => {
    await reload();
    toast.success(how === "code" ? "Code accepted. 1 page credit added." : "1 page credit added.", { id: "memories-credit" });
    navigate("/memories/app", { replace: true, state: { welcome: how, credits } });
  };

  const pay = async () => {
    setPaying(true); setError("");
    try {
      const order = await createPayment(chosen);
      const r = await runCheckout({ checkout: order.checkout, orderId: order.orderId, user });
      if (r.status === "redirect") return; // the gateway page takes over, and brings us back to /memories/payment-result
      let status = r.status;
      if (status !== "paid") status = (await getPaymentStatus(order.orderId)).status; // they may have paid even if the window closed
      if (status === "paid") return await done("payment");
      if (r.status === "dismissed") toast("Payment cancelled. Nothing was charged.", { icon: "ℹ️", id: "memories-pay-cancel" });
      else setError(status === "pending" || status === "created" ? "We haven't received the payment yet. If you were charged, it will appear in a minute. Check again or contact us." : "The payment didn't go through. Nothing was charged. Please try again.");
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setPaying(false);
    }
  };

  const redeem = async (e) => {
    e.preventDefault();
    if (code.trim().length < 3) return setCodeError("Enter your unique code.");
    setRedeeming(true); setCodeError("");
    try { await redeemCode(code.trim()); await done("code"); } catch (err) { setCodeError(errMsg(err)); } finally { setRedeeming(false); }
  };

  const claimFree = async () => {
    setPaying(true); setError("");
    try { await claimFreeCredit(); await done("free"); } catch (e) { setError(errMsg(e)); } finally { setPaying(false); }
  };

  return (
    <div className="py-8 sm:py-12">
      {firstTime && <Stepper current={1} />}

      <div className="text-center">
        {firstTime && <p className="mem-script text-4xl text-rose-500 sm:text-5xl">Welcome{user?.name ? `, ${String(user.name).split(" ")[0]}` : ""}!</p>}
        <h1 className="mt-2 text-balance text-2xl font-bold tracking-tight text-[#3a1530] sm:text-3xl">{firstTime ? "Get your first page credit" : "Add page credits"}</h1>
        <p className="mx-auto mt-2 max-w-lg text-[#7a5370]">Each credit lets you create <b>one page</b>. Make as many pages as you like, just add a credit for each. Pay, or use a unique code: both add <b>1 credit</b>.</p>
      </div>

      {cfg.credits > 0 && (
        <div className="mx-auto mt-6 flex max-w-4xl flex-col items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-center ring-1 ring-emerald-200 sm:flex-row sm:text-left">
          <Check className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
          <p className="flex-1 text-sm text-emerald-900">You already have <b>{cfg.credits} unused credit{cfg.credits === 1 ? "" : "s"}</b>. You can go straight to the templates, or add another.</p>
          <Button as={Link} to="/memories/app" size="sm">Choose a template <ArrowRight className="h-4 w-4" aria-hidden /></Button>
        </div>
      )}

      <div className="mx-auto mt-8 grid max-w-4xl gap-5 lg:grid-cols-[1.15fr_1fr]">
        {/* PAY */}
        <section className="overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-xl shadow-rose-100/60" aria-labelledby="pay-h">
          <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 p-6 text-white sm:p-7">
            <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-white/15" aria-hidden />
            <p id="pay-h" className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">1 credit · 1 page</p>
            <p className="mt-1 text-5xl font-bold tracking-tight">{formatPrice(price) || "…"}</p>
            <p className="mt-1 text-sm text-white/90">{isFree ? "Free right now" : "One-time payment. No subscription."}</p>
          </div>
          <div className="p-6 sm:p-7">
            <ul className="space-y-2.5">
              {included.map((x) => <li key={x} className="flex gap-2.5 text-sm text-[#4a2340]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={3} aria-hidden /> {x}</li>)}
            </ul>

            {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}
            {noGateway && <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200">Online payment isn&apos;t available right now. If you have a unique code, use it on the right.</p>}

            {isFree ? (
              <Button size="lg" className="mt-6 w-full" onClick={claimFree} loading={paying}><Gift className="h-4 w-4" aria-hidden /> Claim my free credit</Button>
            ) : (
              <Button size="lg" className="mt-6 w-full" onClick={pay} loading={paying} disabled={noGateway}><Lock className="h-4 w-4" aria-hidden /> Pay {formatPrice(price)} with {gatewayLabel(chosen)}</Button>
            )}
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#8a6a80]"><ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden /> UPI, cards and netbanking on a secure page. You&apos;re charged only when you confirm. All sales are final; only an accidental double payment is refunded.</p>
          </div>
        </section>

        {/* CODE */}
        <section className="flex flex-col rounded-[28px] border border-rose-100 bg-white p-6 shadow-lg shadow-rose-100/50 sm:p-7" aria-labelledby="code-h">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-600"><Ticket className="h-6 w-6" aria-hidden /></span>
          <h2 id="code-h" className="mt-4 text-lg font-bold text-[#3a1530]">Have a unique code?</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#7a5370]">Enter it and a credit is yours, free. A code adds <b>1 credit</b>, same as paying.</p>
          <form onSubmit={redeem} className="mt-5" noValidate>
            <label htmlFor="mem-code" className="text-xs font-bold uppercase tracking-wider text-[#a07890]">Your code</label>
            <div className="relative mt-1.5">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-rose-300" aria-hidden />
              <input id="mem-code" value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(""); }} maxLength={40} autoComplete="off" spellCheck={false} placeholder="e.g. LOVE2025"
                className="w-full rounded-xl border border-rose-100 bg-white py-3 pl-10 pr-3 font-mono text-sm tracking-widest text-[#3a1530] outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-[#c4a8b8] focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                aria-invalid={Boolean(codeError)} aria-describedby={codeError ? "code-err" : undefined} />
            </div>
            {codeError && <p id="code-err" role="alert" className="mt-2 text-sm text-rose-600">{codeError}</p>}
            <Button type="submit" variant="soft" size="lg" className="mt-4 w-full" loading={redeeming}><Sparkles className="h-4 w-4" aria-hidden /> Use this code</Button>
          </form>
          <p className="mt-auto pt-6 text-xs leading-relaxed text-[#8a6a80]">Codes are single-use per person and can expire. Wrong tries are limited to keep codes safe.</p>
        </section>
      </div>

      <p className="mx-auto mt-6 max-w-4xl text-center text-sm text-[#8a6a80]">Payment problem or a question? <a className="font-semibold text-rose-600 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. <Link to="/memories/refund" className="font-semibold text-rose-600 hover:underline">Refund policy</Link></p>
      <p className="mt-3 text-center text-sm text-[#8a6a80]">Just looking? <Link to="/memories" className="font-semibold text-rose-600 hover:underline">Back to the home page</Link></p>
    </div>
  );
}
