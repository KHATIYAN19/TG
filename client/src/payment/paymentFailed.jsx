import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  CreditCard,
  HelpCircle,
  Mail,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ResumePromo from "../resume/ResumePromo.jsx";

/* ==========================================================
   BOOK PAYMENT FAILED
   Same page shell and theme as the success page: warm orange on warm neutrals,
   follows the site's light / dark toggle. The Resume Lab promotion sits small at the top
   and as a full card below the help sections.
========================================================== */

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const BOOKS_PAGE = "/books";

function getStoredTheme() {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  } catch {
    return "light";
  }
}

const NEXT_STEPS = [
  { title: "Check your bank", text: "If money was debited, do not pay again. Write to us with the order reference below.", Icon: ShieldCheck },
  { title: "No money deducted?", text: "Go back to the books and start a fresh checkout whenever you're ready.", Icon: BookOpen },
  { title: "Still stuck?", text: "Email us the order ID and what you saw. We will check the transaction and help.", Icon: Mail },
];

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const [theme, setTheme] = useState(getStoredTheme);
  const [copied, setCopied] = useState(false);
  const isDark = theme === "dark";

  useEffect(() => {
    const sync = () => setTheme(getStoredTheme());
    const onTheme = (e) => {
      const next = e?.detail?.theme;
      if (next === "light" || next === "dark") setTheme(next);
      else sync();
    };
    const onStorage = (e) => { if (e.key === THEME_KEY || e.key === null) sync(); };
    const onVisible = () => { if (!document.hidden) sync(); };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);
    window.addEventListener(THEME_EVENT, onTheme);
    window.addEventListener("themechange", onTheme);
    document.addEventListener("visibilitychange", onVisible);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
      window.removeEventListener(THEME_EVENT, onTheme);
      window.removeEventListener("themechange", onTheme);
      document.removeEventListener("visibilitychange", onVisible);
      observer.disconnect();
    };
  }, []);

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
    } catch {
      const t = document.createElement("textarea");
      t.value = orderId;
      t.setAttribute("readonly", "");
      t.style.position = "absolute";
      t.style.left = "-9999px";
      document.body.appendChild(t);
      t.select();
      try { document.execCommand("copy"); } catch { /* ignore */ }
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const pageBg = isDark ? "bg-[#110e0c]" : "bg-[#fffaf5]";
  const cardBg = isDark ? "bg-[#211a15]" : "bg-white";
  const softBg = isDark ? "bg-[#2d2119]" : "bg-[#fff3e8]";
  const border = isDark ? "border-[#403027]" : "border-[#f1dfd1]";
  const primaryText = isDark ? "text-[#fff8f0]" : "text-[#29201a]";
  const secondaryText = isDark ? "text-[#bca99b]" : "text-[#76665a]";

  const primaryButton = "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-orange-700 active:scale-[0.98]";
  const secondaryButton = `inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition active:scale-[0.98] ${border} ${isDark ? "bg-[#2b211b] text-[#f8ede4] hover:bg-[#382a21]" : "bg-white text-[#4c3526] hover:bg-orange-50"}`;

  const mailto = `mailto:${SUPPORT_EMAIL}${orderId ? `?subject=${encodeURIComponent(`Payment assistance - ${orderId}`)}` : ""}`;

  return (
    <>
      <Helmet><meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex" /></Helmet>
      <main data-theme={theme} className={`min-h-screen w-full px-4 pb-20 pt-[115px] font-sans transition-colors duration-300 sm:px-6 lg:px-8 ${pageBg} ${primaryText}`}>
        <div className="mx-auto max-w-5xl">
          {/* small Resume Lab strip */}
          <ResumePromo variant="strip" isDark={isDark} />

          {/* HERO */}
          <section className={`relative overflow-hidden rounded-[28px] border px-5 py-9 text-center sm:px-10 sm:py-12 ${border} ${isDark ? "bg-gradient-to-br from-[#321b13] via-[#261a14] to-[#211a15]" : "bg-gradient-to-br from-[#fff0e5] via-[#fff8f0] to-white"}`}>
            <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-24 h-64 w-64 rounded-full bg-red-400/10 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 ring-8 ring-red-500/5">
                <XCircle size={42} className="text-red-500" />
              </div>
              <p className="mt-6 text-xs font-black uppercase tracking-[0.18em] text-orange-500">Target Trek · Payment update</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">Payment wasn't completed</h1>
              <p className={`mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base ${secondaryText}`}>
                We couldn't confirm a successful payment. This happens when checkout is cancelled, interrupted, or the bank doesn't complete the transaction. Your books are safe and nothing is lost.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold ${isDark ? "border-orange-900 bg-orange-500/10 text-orange-300" : "border-orange-200 bg-white text-orange-700"}`}>
                  <ShieldCheck size={15} /> Payment not confirmed
                </span>
                {orderId && (
                  <button type="button" onClick={copyOrder} title="Copy order ID" className={`inline-flex max-w-full items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition ${border} ${cardBg}`}>
                    <CreditCard size={15} className="shrink-0 text-orange-500" />
                    <span className="truncate">Order {orderId}</span>
                    {copied ? <Check size={14} className="shrink-0 text-emerald-500" /> : <Copy size={14} className="shrink-0 opacity-60" />}
                  </button>
                )}
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={BOOKS_PAGE} className={primaryButton}><RefreshCw size={17} /> Try again from Books</Link>
                <a href={mailto} className={secondaryButton}><Mail size={17} /> Contact support</a>
              </div>
            </div>
          </section>

          {/* HELP */}
          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <section className={`rounded-3xl border p-6 sm:p-7 lg:col-span-2 ${isDark ? "border-amber-900/50 bg-amber-950/20" : "border-amber-200 bg-amber-50"}`}>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500"><AlertTriangle size={23} /></div>
              <h2 className="mt-5 text-xl font-black">Was money deducted?</h2>
              <p className={`mt-3 text-sm leading-7 ${secondaryText}`}>
                If your bank shows a debit but this page says the payment failed, please don't pay again straight away. Send us the order reference so we can check it and either unlock your books or refund you.
              </p>
              <a href={mailto} className={`${secondaryButton} mt-6 w-full`}><Mail size={17} /> Contact payment support <ArrowRight size={16} /></a>
            </section>

            <section className={`rounded-3xl border p-6 sm:p-7 lg:col-span-3 ${border} ${cardBg}`}>
              <div className="flex items-center gap-3">
                <HelpCircle size={24} className="text-orange-500" />
                <h2 className="text-xl font-black">What can you do next?</h2>
              </div>
              <ol className="mt-6 grid gap-5">
                {NEXT_STEPS.map((s, i) => (
                  <li key={s.title} className="flex gap-4">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${softBg}`}><s.Icon size={20} className="text-orange-500" /></span>
                    <div className="min-w-0">
                      <p className="text-xs font-black tracking-widest text-orange-500">STEP {i + 1}</p>
                      <h3 className="mt-1 text-base font-extrabold">{s.title}</h3>
                      <p className={`mt-1 text-sm leading-6 ${secondaryText}`}>{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* full Resume Lab card */}
          <div className="mt-8"><ResumePromo variant="card" isDark={isDark} /></div>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to={BOOKS_PAGE} className={secondaryButton}><BookOpen size={17} /> Explore our books <ArrowRight size={16} /></Link>
            <p className={`text-center text-xs leading-6 ${secondaryText}`}>
              Need assistance? <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-orange-500 hover:underline">Contact Target Trek Support</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
