import { Fragment, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, Check, Warning, X } from "@phosphor-icons/react";

import "./resume.css";
import "./lab.css";
import "./studio.css";

export const cx = (...a) => a.filter(Boolean).join(" ");

const FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap";

/* Page frame: loads the fonts (same as the Books page) and sets the title. `top` leaves room for the site's fixed navbar. */
export function Page({ title, description, children, top = true, className = "" }) {
  return (
    <div className={cx("rv", top && "rv-top", className)}>
      <Helmet>
        <title>{title}</title>
        {description && <meta name="description" content={description} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </Helmet>
      {children}
    </div>
  );
}

/* the signed-in area's tabs */
export function SubNav() {
  const item = ({ isActive }) => (isActive ? "on" : "");
  return (
    <div className="rv-shell">
      <nav className="rv-subnav" aria-label="Resume Lab">
        <Link to="/resume-review" className="rv-back"><ArrowLeft size={14} weight="bold" aria-hidden />Resume Review</Link>
        <NavLink end to="/resume-review/app" className={item}>My reviews</NavLink>
        <NavLink to="/resume-review/app/plans" className={item}>Plans</NavLink>
      </nav>
    </div>
  );
}

/* one button for links and actions: variant primary | ghost | danger, size sm | md | lg */
export function Btn({ as: As = "button", variant = "primary", size = "md", loading = false, block = false, className = "", children, disabled, ...rest }) {
  const props = As === "button" ? { type: rest.type || "button", disabled: disabled || loading } : { "aria-disabled": disabled || undefined };
  return (
    <As className={cx("rv-btn", `rv-btn-${variant}`, size !== "md" && `rv-btn-${size}`, block && "rv-btn-block", className)} {...props} {...rest}>
      {loading && <span className="rv-spin" aria-hidden />}
      {children}
    </As>
  );
}

export function Field({ label, hint, error, htmlFor, children, optional = false, required = false }) {
  return (
    <div>
      {label && <label htmlFor={htmlFor} className="rv-label">{label}{required && <span className="rv-star" aria-hidden title="Required"> *</span>}{optional && <span className="rv-subtle" style={{ fontWeight: 500 }}> · optional</span>}</label>}
      {children}
      {error ? <p role="alert" className="rv-err"><Warning size={15} weight="fill" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />{error}</p> : hint ? <p className="rv-hint">{hint}</p> : null}
    </div>
  );
}

export const Tick = () => <span className="rv-tick"><Check size={11} weight="bold" aria-hidden /></span>;
export const Pill = ({ tone = "", children, className = "" }) => <span className={cx("rv-pill", tone, className)}>{children}</span>;
export const Kicker = ({ children }) => <span className="rv-kicker">{children}</span>;

/* A circular score. The arc grows to the value on mount. Colour says good / careful / bad, in muted tones. */
export function ScoreRing({ value = 0, size = 120, stroke = 8, label = "" }) {
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(Math.max(0, Math.min(100, value))), 100); return () => clearTimeout(t); }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const tone = value >= 75 ? "var(--rv-ok)" : value >= 50 ? "var(--rv-warn)" : "var(--rv-bad)";
  return (
    <div className="rv-ring" style={{ width: size, height: size }} role="img" aria-label={`${label || "Score"}: ${value} out of 100`}>
      <svg width={size} height={size} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--rv-surface-3)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} style={{ transition: "stroke-dashoffset 1.1s var(--rv-ease)" }} />
      </svg>
      <div className="rv-ring-num">
        <div className="rv-mono" style={{ fontSize: size * 0.3, fontWeight: 600, letterSpacing: "-0.04em" }}>{Math.round(value)}</div>
        {label && <div className="rv-xs rv-subtle" style={{ marginTop: 4, fontWeight: 600 }}>{label}</div>}
      </div>
    </div>
  );
}

export function Bar({ value = 0, tone = "" }) {
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(value), 100); return () => clearTimeout(t); }, [value]);
  return <div className={cx("rv-bar", tone)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${w}%` }} /></div>;
}

export const toneOf = (n) => (n >= 75 ? "ok" : n >= 50 ? "warn" : "bad");

/* fades sections in as they scroll into view */
export function useReveal(deps = []) {
  useEffect(() => {
    // content is only hidden-until-scrolled once JavaScript is running, so crawlers and no-JS browsers always see everything
    document.querySelector(".rv")?.classList.add("rv-js");
    const nodes = [...document.querySelectorAll(".rv-reveal:not(.in)")];
    if (typeof IntersectionObserver === "undefined") { nodes.forEach((n) => n.classList.add("in")); return undefined; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
}

export const Skeleton = ({ h = 20, className = "", style }) => <div className={cx("rv-skel", className)} style={{ height: h, ...style }} aria-hidden />;

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const on = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [onClose]);
  return (
    <div className="rv-modal-back" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rv-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 16 }}>
          <h2 className="rv-h3">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" style={{ background: "none", border: 0, padding: 4 }}><X size={20} aria-hidden /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/*
  The reviewer's text, shown the way it was typed:
    blank line      starts a new paragraph          a single line break stays a line break
    "- " or "• "    bullet list                     "1. " numbered list
    "## " / "# "    a heading                       **word** is bold
  Built from plain React elements (never raw HTML), so nothing typed can run as code.
*/
const inline = (s) => String(s).split(/(\*\*[^*]+\*\*)/g).map((part, i) => (/^\*\*[^*]+\*\*$/.test(part) ? <b key={i}>{part.slice(2, -2)}</b> : <Fragment key={i}>{part}</Fragment>));

export function FormattedText({ text, className = "" }) {
  const raw = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!raw) return null;
  const bullet = /^\s*([-•*])\s+/;
  const numbered = /^\s*\d+[.)]\s+/;
  /* the lines of one block, as a list or a paragraph that keeps its line breaks */
  const body = (lines, key) => {
    if (!lines.length) return null;
    if (lines.every((l) => bullet.test(l))) return <ul key={key}>{lines.map((l, i) => <li key={i}>{inline(l.replace(bullet, ""))}</li>)}</ul>;
    if (lines.every((l) => numbered.test(l))) return <ol key={key}>{lines.map((l, i) => <li key={i}>{inline(l.replace(numbered, ""))}</li>)}</ol>;
    return <p key={key}>{lines.map((l, i) => <Fragment key={i}>{i > 0 && <br />}{inline(l)}</Fragment>)}</p>;
  };
  return (
    <div className={cx("rv-prose", className)}>
      {raw.split(/\n\s*\n/).map((block, bi) => {
        const lines = block.split("\n").map((l) => l.replace(/\s+$/, "")).filter((l, i, a) => l !== "" || i < a.length);
        const head = lines[0].match(/^(#{1,3})\s+(.*)$/);
        if (!head) return body(lines, bi);
        const Tag = head[1].length === 1 ? "h3" : "h4";
        return <Fragment key={bi}><Tag>{inline(head[2])}</Tag>{body(lines.slice(1), "b")}</Fragment>;
      })}
    </div>
  );
}
