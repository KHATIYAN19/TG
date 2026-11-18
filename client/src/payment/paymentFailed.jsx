import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  Copy,
  HelpCircle,
  Mail,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import ResumePromo from "../resume/ResumePromo.jsx";
import { copyText, usePayFonts } from "./payShared";
import "./payment.css";

/* ==========================================================
   BOOK PAYMENT FAILED
   Same look as /resume-review and the success page: pine panel, teal actions, yellow highlighter, red pen for the problem.
   Follows the site's light / dark toggle. Works from 320px phones up to desktop.
   Route / query contract is unchanged: /payment-failed?order=<orderId>
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
  { title: "Check your bank", text: "If money was debited, please do not pay again. Email us the order reference below.", Icon: ShieldCheck },
  { title: "No money deducted?", text: "Nothing was charged. Go back to the books and start a fresh checkout whenever you're ready.", Icon: BookOpen },
  { title: "Still stuck?", text: "Email us the order ID and what you saw. We will check the transaction and help.", Icon: Mail },
];

export default function PaymentFailed() {
  usePayFonts();

  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const [theme, setTheme] = useState(getStoredTheme);
  const [copied, setCopied] = useState(false);

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

  const isDark = theme === "dark";

  const copyOrder = async () => {
    if (!orderId) return;
    await copyText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const mailto = `mailto:${SUPPORT_EMAIL}${orderId ? `?subject=${encodeURIComponent(`Payment assistance - ${orderId}`)}` : ""}`;

  return (
    <>
      <Helmet><meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex" /></Helmet>
      <main data-theme={theme} className="tp tp-page">
        <div className="tp-wrap">
          {/* small Resume Lab strip */}
          <ResumePromo variant="strip" isDark={isDark} />

          {/* HERO */}
          <section className="tp-hero is-bad" style={{ marginTop: 14 }}>
            <div className="tp-hero-badge" aria-hidden="true">
              <XCircle size={36} />
            </div>

            <p className="tp-eyebrow" style={{ marginTop: 20 }}>Target Trek · Payment update</p>
            <h1 className="tp-h" style={{ marginTop: 8 }}>
              Payment <span className="tp-mark">wasn't completed</span>
            </h1>
            <p className="sub">
              We couldn't confirm a successful payment. This happens when checkout is cancelled, interrupted, or the bank doesn't complete the transaction. Your books are safe and nothing is lost.
            </p>

            <div className="tp-hero-meta">
              <span className="tp-chip tp-chip-panel"><ShieldCheck size={15} /> Payment not confirmed</span>
              {orderId && (
                <button type="button" onClick={copyOrder} title="Copy order ID" className="tp-ref" aria-label={`Copy order ID ${orderId}`}>
                  <span>Order {orderId}</span>
                  {copied ? <Check size={14} style={{ flex: "none", color: "#5eead4" }} /> : <Copy size={14} style={{ flex: "none", opacity: 0.7 }} />}
                </button>
              )}
            </div>
            <span role="status" className="tp-sr">{copied ? "Order ID copied" : ""}</span>

            <div className="tp-hero-cta">
              <Link to={BOOKS_PAGE} className="tp-btn tp-btn-mark tp-btn-lg"><RefreshCw size={18} /> Try again from Books</Link>
              <a href={mailto} className="tp-btn tp-btn-onpanel tp-btn-lg"><Mail size={18} /> Contact support</a>
            </div>
          </section>

          {/* HELP */}
          <div className="tp-fail-grid">
            <section className="tp-fail-warn">
              <span className="tp-ico"><AlertTriangle size={22} /></span>
              <h2 className="tp-h">Was money deducted?</h2>
              <p>
                If your bank shows a debit but this page says the payment failed, please don't pay again straight away. Send us the order reference so we can check it and either unlock your books or refund you.
              </p>
              <a href={mailto} className="tp-btn tp-btn-ghost tp-btn-block"><Mail size={17} /> Contact payment support <ArrowRight size={16} /></a>
            </section>

            <section className="tp-card tp-info-card">
              <h3><HelpCircle size={22} /> What can you do next?</h3>
              <ol className="tp-ol">
                {NEXT_STEPS.map((s, i) => (
                  <li key={s.title}>
                    <span className="tp-ico"><s.Icon size={20} /></span>
                    <div style={{ minWidth: 0 }}>
                      <span className="num">STEP {i + 1}</span>
                      <b>{s.title}</b>
                      <span className="t">{s.text}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* full Resume Lab card */}
          <div style={{ marginTop: 32 }}><ResumePromo variant="card" isDark={isDark} /></div>

          <div className="tp-foot-row">
            <Link to={BOOKS_PAGE} className="tp-btn tp-btn-ghost"><BookOpen size={17} /> Explore our books <ArrowRight size={16} /></Link>
            <p>
              Need assistance? <a href={`mailto:${SUPPORT_EMAIL}`} className="tp-link">Contact Target Trek Support</a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
