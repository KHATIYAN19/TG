import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, CheckCircle, Check, Clock, Copy, Gift, Lock, Minus, Plus, ShareNetwork, ShieldCheck, Sparkle, UserPlus, Users, Wallet, WarningCircle, XCircle,
} from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { cashOutReferral, getReferral, spendReferralCredits } from "./memApi";
import { Loading } from "./AppShell";
import { Banner, PageHead, Sheet } from "./appUi";
import { Btn } from "./landingUi";
import { cx } from "./ui";

/*
  REFER AND EARN (signed in).
    1. the link to share
    2. progress towards the next credit
    3. "your credits": use them as pages, or (when the admin allows it) take cash
    4. the friends who joined, cash requests, and the rules
  A credit is used ONCE, one way or the other. A credit used for a page can never be cashed, and the screen says so before it happens.
*/

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const day = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const plural = (n, one, many) => `${n} ${n === 1 ? one : many || `${one}s`}`;
const FRIEND = { paid: ["Paid", "bg-[#ecfdf5] text-emerald-700", CheckCircle], signed_up: ["Signed up", "bg-amber-100 text-amber-800", Clock] };
const PAYOUT = { requested: ["Waiting for payment", "bg-amber-100 text-amber-800"], paid: ["Paid", "bg-[#ecfdf5] text-emerald-700"], cancelled: ["Cancelled", "bg-slate-100 text-slate-600"] };

/* a small "- 1 +" control */
function Stepper({ value, min = 1, max, onChange, label }) {
  const set = (v) => onChange(Math.max(min, Math.min(max, v)));
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 ring-1 ring-inset ring-[#f8d7e0]" role="group" aria-label={label}>
      <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label="Fewer" className="ma-round !h-9 !w-9 disabled:opacity-40"><Minus size={16} weight="bold" aria-hidden /></button>
      <span className="min-w-8 text-center text-lg font-semibold tabular-nums text-[#2a1023]" aria-live="polite">{value}</span>
      <button type="button" onClick={() => set(value + 1)} disabled={value >= max} aria-label="More" className="ma-round !h-9 !w-9 disabled:opacity-40"><Plus size={16} weight="bold" aria-hidden /></button>
    </div>
  );
}

/* the one-way warning, shown wherever a choice is made */
const OneWay = ({ cashEnabled }) => (
  <div className="flex gap-3 rounded-2xl bg-amber-50 p-3 text-amber-900 ring-1 ring-inset ring-amber-200">
    <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-amber-600" aria-hidden />
    <p className="body-6">
      <b>A credit can be used only once.</b> {cashEnabled ? "If you use a credit to create a page, you cannot get money for it later. And once you ask for cash, that credit can no longer be used for a page." : "Once you use a credit to create a page, it is gone."}
    </p>
  </div>
);

/* ---------- confirm: use credits as pages ---------- */
function UseSheet({ r, count, busy, err, onClose, onConfirm }) {
  return (
    <Sheet size="sm" title={`Use ${plural(count, "credit")} for ${count === 1 ? "a page" : "pages"}?`} subtitle="You will be able to create it from any template." icon={<Sparkle size={20} weight="duotone" aria-hidden />} onClose={onClose} locked={busy}
      footer={<div className="grid grid-cols-2 gap-3"><Btn variant="ghost" onClick={onClose} disabled={busy}>Not now</Btn><Btn onClick={onConfirm} loading={busy}>Yes, use {count}</Btn></div>}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-[#fff0f4] p-4 text-center">
          <p className="text-4xl font-semibold tabular-nums text-[#be123c]">{count}</p>
          <p className="caption-4 text-[#7a5370]">free page{count === 1 ? "" : "s"} added to your account</p>
        </div>
        <OneWay cashEnabled={r.cashEnabled} />
        {err && <p role="alert" className="body-5 text-rose-600">{err}</p>}
      </div>
    </Sheet>
  );
}

/* ---------- ask for cash ---------- */
function CashSheet({ r, onClose, onDone }) {
  const min = r.minPayoutCredits || 1;
  const [credits, setCredits] = useState(min);
  const [upi, setUpi] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const amount = credits * r.cashPerCredit;
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try { onDone(await cashOutReferral(credits, upi.trim())); } catch (x) { setErr(errMsg(x)); setBusy(false); }
  };
  return (
    <Sheet size="sm" title="Take cash instead" subtitle={`Each credit is worth ${rupees(r.cashPerCredit)}. Least ${plural(min, "credit")} per request.`} icon={<Wallet size={20} weight="duotone" aria-hidden />} onClose={onClose} locked={busy}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="flex items-center justify-between gap-3">
          <span className="body-5 font-medium text-[#4a2340]">Credits to cash out</span>
          <Stepper value={credits} min={min} max={r.available} onChange={(v) => { setCredits(v); setErr(""); }} label="Credits to cash out" />
        </div>
        <label className="block"><span className="body-5 mb-1 block font-medium text-[#4a2340]">Your UPI ID</span>
          <input className="ml-input w-full" placeholder="name@bank" autoComplete="off" autoCapitalize="none" spellCheck={false} value={upi} onChange={(e) => { setUpi(e.target.value); setErr(""); }} />
        </label>
        <p className="rounded-2xl bg-[#fff0f4] p-4 text-center"><span className="caption-4 block text-[#7a5370]">You will receive</span><span className="text-3xl font-semibold tabular-nums text-[#be123c]">{rupees(amount)}</span></p>
        <OneWay cashEnabled />
        {err && <p role="alert" className="body-5 text-rose-600">{err}</p>}
        <Btn type="submit" className="w-full" loading={busy} disabled={!upi.trim()}>Ask for {rupees(amount)}</Btn>
      </form>
    </Sheet>
  );
}

export default function MemoriesReferral({ reload }) {
  const [r, setR] = useState(null);
  const [error, setError] = useState("");
  const [pages, setPages] = useState(1);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [useErr, setUseErr] = useState("");
  const [cash, setCash] = useState(false);
  const [done, setDone] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(() => getReferral().then((d) => { setR(d); setError(""); }).catch((e) => setError(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (r) setPages((p) => Math.max(1, Math.min(p, r.available || 1))); }, [r]);

  if (error && !r) return <p role="alert" className="py-24 text-center text-rose-600">{error}</p>;
  if (!r) return <Loading />;
  if (!r.enabled) return <p className="py-24 text-center text-[#7a5370]">Refer and earn is not open right now. Please check back soon.</p>;

  const n = r.perCredit;
  const min = r.minPayoutCredits || 1;
  const link = `${window.location.origin}/memories?mref=${r.code}`;
  const text = `I make beautiful memory pages for birthdays, proposals and more. Try it with my link: ${link}`;
  const doneFriends = r.qualified % n;
  const cashReady = r.available >= min;
  const missingCredits = Math.max(0, min - r.available);
  const friendsToCash = missingCredits > 0 ? (missingCredits - 1) * n + r.toNext : 0; // paid friends still needed before cash can be asked

  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: "Memories by Target Trek", text, url: link }); return; } catch { /* closed */ } } copy(); };
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(text)}`;

  const useAsPage = async () => {
    setBusy(true); setUseErr("");
    try { setR(await spendReferralCredits(pages)); await reload?.(); setConfirm(false); setDone(`${plural(pages, "page credit")} added. Pick a template to create ${pages === 1 ? "it" : "them"}.`); } catch (e) { setUseErr(errMsg(e)); }
    setBusy(false);
  };

  return (
    <div className="mx-auto min-w-0 max-w-3xl space-y-5 py-6 sm:space-y-6 sm:py-8">
      {/* ---------- 1. hero + link ---------- */}
      <section className="ma-in relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#e11d48] via-[#e11d48] to-[#fb7185] p-5 text-white sm:p-8">
        <Sparkle size={140} weight="fill" className="pointer-events-none absolute -right-8 -top-8 text-white/15" aria-hidden />
        <Gift size={90} weight="duotone" className="pointer-events-none absolute -bottom-6 right-6 hidden text-white/15 sm:block" aria-hidden />
        <p className="caption-3 relative text-rose-100" style={{ letterSpacing: "0.14em" }}>REFER AND EARN</p>
        <h1 className="heading-3 relative mt-2">Bring {plural(n, "friend")}. Get a page free.</h1>
        <p className="body-5 relative mt-2 max-w-md text-rose-50">Every friend who joins with your link and pays for a page counts. {n === 1 ? "Each one" : `Every ${n}`} earns you 1 page credit{r.cashEnabled ? ", or " + rupees(r.cashPerCredit) + " in cash" : ""}.</p>

        <div className="relative mt-5 rounded-2xl bg-white/15 p-2 backdrop-blur">
          <div className="flex items-center gap-2 rounded-xl bg-white p-2 pl-3 text-[#2a1023]">
            <p className="body-5 min-w-0 flex-1 truncate" title={link}>{link}</p>
            <button type="button" onClick={copy} className="ma-round !h-10 !w-10 bg-[#fff0f4]" aria-label="Copy link">{copied ? <Check size={18} className="text-emerald-600" aria-hidden /> : <Copy size={18} aria-hidden />}</button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Btn variant="light" onClick={share} className="w-full"><ShareNetwork size={16} aria-hidden /> Share link</Btn>
            <Btn variant="light" href={whatsapp} target="_blank" rel="noopener noreferrer" className="w-full">WhatsApp <ArrowRight size={16} aria-hidden /></Btn>
          </div>
        </div>
        <p className="caption-4 relative mt-3 text-rose-100">Your code: <b className="tracking-widest text-white">{r.code}</b></p>
      </section>

      {done && <Banner tone="ok">{done}</Banner>}

      {/* ---------- 2. progress ---------- */}
      <section className="ma-in ma-card min-w-0 p-4 sm:p-6" style={{ "--i": 1 }}>
        <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
          {[[Users, "Friends joined", r.friends.length], [CheckCircle, "Friends paid", r.qualified], [Sparkle, "Credits earned", r.earned]].map(([Icon, k, v]) => (
            <div key={k} className="rounded-2xl bg-[#fff0f4] p-3 sm:p-4">
              <Icon size={20} weight="duotone" className="mx-auto text-[#e11d48]" aria-hidden />
              <p className="mt-1 text-2xl font-semibold tabular-nums text-[#be123c]">{v}</p>
              <p className="caption-4 text-[#7a5370]">{k}</p>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <p className="body-4 font-medium text-[#2a1023]">Next credit: {doneFriends} of {n} friends paid</p>
            <p className="caption-4 text-[#7a5370]">{plural(r.toNext, "more friend")} to go</p>
          </div>
          {n <= 10 ? (
            <ol className="mt-3 flex gap-1.5" aria-label={`${doneFriends} of ${n} friends paid`}>
              {Array.from({ length: n }, (_, i) => (
                <li key={i} className={cx("grid h-9 min-w-0 flex-1 place-items-center rounded-full transition-colors duration-500", i < doneFriends ? "bg-[#e11d48] text-white" : "bg-[#fff0f4] text-[#e9a3b5]")}>
                  {i < doneFriends ? <Check size={16} weight="bold" aria-hidden /> : <UserPlus size={16} aria-hidden />}
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#fff0f4]" role="progressbar" aria-valuemin={0} aria-valuemax={n} aria-valuenow={doneFriends}>
              <div className="h-full rounded-full bg-[#e11d48] transition-all duration-700" style={{ width: `${(doneFriends / n) * 100}%` }} />
            </div>
          )}
        </div>
      </section>

      {/* ---------- 3. your credits ---------- */}
      <section className="ma-in ma-card min-w-0 p-4 sm:p-6" style={{ "--i": 2 }} aria-labelledby="ref-credits">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="ref-credits" className="heading-6 text-[#2a1023]">Your referral credits</h2>
            <p className="caption-4 text-[#7a5370]">{r.earned} earned · {r.usedAsPage} used for pages{r.cashEnabled ? ` · ${r.cashedOut} asked as cash` : ""}</p>
          </div>
          <div className="grid h-16 min-w-16 place-items-center rounded-2xl bg-[#e11d48] px-3 text-white"><span className="text-3xl font-semibold tabular-nums">{r.available}</span><span className="caption-5 -mt-2 text-rose-100">ready</span></div>
        </div>

        {r.available === 0 && (
          <p className="body-5 mt-4 rounded-2xl bg-[#fff0f4] p-4 text-[#6b3a5a]">No credits ready yet. <b>{plural(r.toNext, "more friend")}</b> {r.toNext === 1 ? "needs" : "need"} to join with your link and pay to earn your next one.</p>
        )}

        <div className={cx("mt-5 grid gap-4", r.cashEnabled && "md:grid-cols-2")}>
          {/* option A: a page */}
          <div className="flex min-w-0 flex-col rounded-3xl bg-[#fffaf6] p-4 ring-1 ring-inset ring-[#f5dfe4] sm:p-5">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e11d48] text-white"><Sparkle size={22} weight="duotone" aria-hidden /></span>
            <h3 className="heading-6 mt-3 text-[#2a1023]">Use as a free page</h3>
            <p className="body-6 mt-1 text-[#7a5370]">1 credit = 1 page in any template and look. No payment needed.</p>
            <div className="mt-auto pt-4">
              {r.available > 1 && <div className="mb-3 flex items-center justify-between gap-3"><span className="body-6 text-[#4a2340]">How many?</span><Stepper value={pages} max={r.available} onChange={setPages} label="Credits to use as pages" /></div>}
              <Btn className="w-full" disabled={r.available < 1} onClick={() => { setUseErr(""); setConfirm(true); }}>Use {r.available > 1 ? pages : 1} as {(r.available > 1 ? pages : 1) === 1 ? "a page" : "pages"}</Btn>
            </div>
          </div>

          {/* option B: cash */}
          {r.cashEnabled && (
            <div className="flex min-w-0 flex-col rounded-3xl bg-[#fffaf6] p-4 ring-1 ring-inset ring-[#f5dfe4] sm:p-5">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-600 text-white"><Wallet size={22} weight="duotone" aria-hidden /></span>
              <h3 className="heading-6 mt-3 text-[#2a1023]">Take cash</h3>
              <p className="body-6 mt-1 text-[#7a5370]"><b className="text-[#2a1023]">{rupees(r.cashPerCredit)}</b> for each credit, sent to your UPI ID.</p>
              <ul className="mt-3 space-y-2">
                <li className="body-6 flex items-start gap-2 text-[#4a2340]"><ShieldCheck size={16} weight="duotone" className="mt-0.5 shrink-0 text-emerald-600" aria-hidden /> Minimum <b>{plural(min, "credit")}</b> ({rupees(min * r.cashPerCredit)}) per request</li>
                <li className="body-6 flex items-start gap-2 text-[#4a2340]"><XCircle size={16} weight="duotone" className="mt-0.5 shrink-0 text-rose-500" aria-hidden /> A credit used for a page cannot be cashed</li>
              </ul>
              <div className="mt-auto pt-4">
                {cashReady ? (
                  <Btn variant="ghost" className="w-full" onClick={() => setCash(true)}>Take {rupees(min * r.cashPerCredit)}{r.available > min ? ` or more` : ""}</Btn>
                ) : (
                  <>
                    <div className="mb-2 h-2 overflow-hidden rounded-full bg-[#fff0f4]" role="progressbar" aria-valuemin={0} aria-valuemax={min} aria-valuenow={r.available}><div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${(r.available / min) * 100}%` }} /></div>
                    <p className="caption-4 mb-3 text-[#7a5370]"><Lock size={12} className="mr-1 inline align-[-1px]" aria-hidden />You have {r.available} of the {min} credits needed. About {plural(friendsToCash, "more paid friend")} to unlock cash.</p>
                    <Btn variant="ghost" className="w-full" disabled>Cash unlocks at {plural(min, "credit")}</Btn>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4"><OneWay cashEnabled={r.cashEnabled} /></div>
      </section>

      {/* ---------- 4. friends ---------- */}
      <section className="ma-in ma-card min-w-0 p-4 sm:p-6" style={{ "--i": 3 }}>
        <h2 className="heading-6 flex items-center gap-2 text-[#2a1023]"><Users size={20} weight="duotone" className="text-[#e11d48]" aria-hidden /> Your friends</h2>
        <p className="caption-4 text-[#7a5370]">Only names and status are shown. A friend counts once they pay for a page.</p>
        {r.friends.length ? (
          <ul className="mt-3 divide-y divide-[#fbe3ea]">
            {r.friends.map((f) => {
              const [label, cls, Icon] = FRIEND[f.status];
              return (
                <li key={f.id} className="flex items-center gap-3 py-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff0f4] font-semibold text-[#be123c]" aria-hidden>{(f.name[0] || "?").toUpperCase()}</span>
                  <span className="min-w-0 flex-1"><span className="body-4 block truncate text-[#2a1023]">{f.name}</span><span className="caption-5 block text-[#a07890]">{f.status === "paid" ? "Paid on" : "Joined on"} {day(f.at)}</span></span>
                  <span className={cx("ma-chip caption-3 shrink-0", cls)}><Icon size={14} weight="fill" aria-hidden /> {label}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl bg-[#fff0f4] p-6 text-center">
            <UserPlus size={32} weight="duotone" className="mx-auto text-[#e11d48]" aria-hidden />
            <p className="body-5 mt-2 text-[#6b3a5a]">No one has joined with your link yet.</p>
            <Btn className="mt-3" onClick={share}>Share your link</Btn>
          </div>
        )}
      </section>

      {/* ---------- 5. cash requests ---------- */}
      {r.payouts.length > 0 && (
        <section className="ma-in ma-card min-w-0 p-4 sm:p-6" style={{ "--i": 4 }}>
          <h2 className="heading-6 flex items-center gap-2 text-[#2a1023]"><Wallet size={20} weight="duotone" className="text-[#e11d48]" aria-hidden /> Your cash requests</h2>
          <ul className="mt-3 divide-y divide-[#fbe3ea]">
            {r.payouts.map((p) => (
              <li key={p.id} className="py-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold tabular-nums text-[#2a1023]">{rupees(p.amount)}</span>
                  <span className={cx("ma-chip caption-3 ml-auto shrink-0", PAYOUT[p.status][1])}>{PAYOUT[p.status][0]}</span>
                </div>
                <p className="caption-4 mt-1 break-all text-[#7a5370]">{plural(p.credits, "credit")} · {p.upiId} · asked {day(p.createdAt)}</p>
                {p.status === "cancelled" && <p className="caption-4 mt-1 text-[#7a5370]">{p.note ? `Reason: ${p.note}. ` : ""}The credits are back in your account.</p>}
                {p.status === "paid" && p.txnRef && <p className="caption-4 mt-1 break-all text-emerald-700">Paid. UPI reference: {p.txnRef}</p>}
                {p.status === "requested" && <p className="caption-4 mt-1 text-[#7a5370]">We will send it to your UPI ID and mark it paid here.</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------- 6. the rules ---------- */}
      <section className="ma-in ma-card min-w-0 p-4 sm:p-6" style={{ "--i": 5 }}>
        <h2 className="heading-6 flex items-center gap-2 text-[#2a1023]"><ShieldCheck size={20} weight="duotone" className="text-[#e11d48]" aria-hidden /> Good to know</h2>
        <ul className="body-6 mt-3 space-y-2.5 text-[#4a2340]">
          {[
            `A friend counts after they sign up with your link (email or Google) and pay for a page.`,
            `Every ${n === 1 ? "paying friend" : `${n} paying friends`} = 1 referral credit.`,
            `Use a credit for a free page, any template and look.`,
            ...(r.cashEnabled ? [`Or take ${rupees(r.cashPerCredit)} per credit by UPI, with a minimum of ${plural(min, "credit")} per request.`, `A credit already used for a page cannot be cashed, and cash cannot be turned back into a page. Pick carefully.`, `If we cancel a cash request, the credits come back to you.`] : []),
            `Your own link does not count for you, and a friend can only be linked to one person.`,
          ].map((t) => <li key={t} className="flex gap-2"><CheckCircle size={16} weight="fill" className="mt-0.5 shrink-0 text-[#e11d48]" aria-hidden /><span>{t}</span></li>)}
        </ul>
        <p className="caption-4 mt-4 text-[#7a5370]">Questions? <Link to="/memories/app/support" className="underline">Contact support</Link></p>
      </section>

      {confirm && <UseSheet r={r} count={r.available > 1 ? pages : 1} busy={busy} err={useErr} onClose={() => setConfirm(false)} onConfirm={useAsPage} />}
      {cash && <CashSheet r={r} onClose={() => setCash(false)} onDone={(d) => { setR(d); setCash(false); setDone("Request sent. We will pay it to your UPI ID and mark it paid here."); }} />}
    </div>
  );
}
