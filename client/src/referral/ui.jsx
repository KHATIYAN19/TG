import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, CaretLeft, CaretRight, CheckCircle, Copy, Crown, FilePdf, Sparkle, UploadSimple, Warning, X } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { uploadDocument } from "./api";
import { Btn, cx } from "../resume/ui";

/* ------------------------------------------------------------ people */
/* the Priority badge shown beside a member who holds a priority pass */
export const Vip = ({ show, label = "Priority" }) => (show ? <span className="rf-vip" title="Priority member"><Crown size={12} weight="fill" aria-hidden />{label}</span> : null);

/* initials on a colour picked from the name, so the same person always gets the same colour */
const SHADES = [["#0f766e", "#14b8a6"], ["#1d4ed8", "#38bdf8"], ["#7c3aed", "#c084fc"], ["#b45309", "#f59e0b"], ["#be123c", "#fb7185"], ["#047857", "#34d399"], ["#334155", "#64748b"]];
const shadeOf = (s) => { let h = 0; for (const ch of String(s || "")) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return SHADES[h % SHADES.length]; };
export const Avatar = ({ person, size, ring }) => {
  const [a, b] = shadeOf(person?.name || person?.initials);
  return (
    <span className={cx("rf-avatar", person?.anonymous && "anon", ring && "ring")} style={{ ...(size ? { width: size, height: size, fontSize: Math.round(size / 2.9), borderRadius: Math.round(size / 3.2) } : {}), ...(person?.anonymous ? {} : { "--rf-av": `linear-gradient(140deg, ${a}, ${b})` }) }} aria-hidden>
      {person?.anonymous ? "🕶️" : person?.initials || "?"}
    </span>
  );
};

/* ------------------------------------------------------------ page parts */
export function PageHead({ eyebrow, title, sub, actions, back }) {
  return (
    <>
      {back && <Link to={back.to} className="rf-back"><ArrowLeft size={15} weight="bold" aria-hidden />{back.label}</Link>}
      <header className="rf-head">
        <div>{eyebrow && <span className="rf-eyebrow">{eyebrow}</span>}<h1 className="rf-h1">{title}</h1>{sub && <p className="rf-sub">{sub}</p>}</div>
        {actions && <div className="rf-btns">{actions}</div>}
      </header>
    </>
  );
}
export const Ico = ({ e, tone = "", size = "" }) => <span className={cx("rf-ico", tone, size)} aria-hidden>{e}</span>;
export const Badge = ({ tone = "muted", children }) => <span className={cx("rf-badge", tone)}>{children}</span>;
export const Empty = ({ emoji = "🔍", icon: Icon, title, children, action }) => (
  <div className="rf-empty">{Icon ? <Icon size={36} weight="duotone" aria-hidden /> : <span className="e" aria-hidden>{emoji}</span>}<h3>{title}</h3>{children && <p>{children}</p>}{action}</div>
);
export const Live = ({ state }) => <span className={cx("rf-live", state === "open" && "on")} role="status"><i aria-hidden />{state === "open" ? "Live" : state === "connecting" ? "Connecting…" : "Reconnecting…"}</span>;

export const Pager = ({ page, pages, onGo }) => pages > 1 && (
  <nav className="rf-pager" aria-label="Pages">
    <Btn variant="ghost" size="sm" disabled={page <= 1} onClick={() => onGo(page - 1)}><CaretLeft size={14} weight="bold" aria-hidden />Prev</Btn>
    <span className="rv-sm rv-mono">{page} / {pages}</span>
    <Btn variant="ghost" size="sm" disabled={page >= pages} onClick={() => onGo(page + 1)}>Next<CaretRight size={14} weight="bold" aria-hidden /></Btn>
  </nav>
);

/* copy a payment id or any short text, with a toast */
export function CopyText({ value, children }) {
  const copy = async () => { try { await navigator.clipboard.writeText(String(value)); toast.success("Copied"); } catch { toast.error("Couldn't copy. Select it instead."); } };
  return <button type="button" className="rf-copy rf-mono" onClick={copy} aria-label={`Copy ${value}`}>{children || value}<Copy size={14} aria-hidden /></button>;
}

/* ------------------------------------------------------------ forms */
/* a labelled on / off row (a real checkbox underneath, so keyboards and screen readers work) */
export const Switch = ({ checked, onChange, title, hint, disabled }) => (
  <label className="rf-switch">
    <span><b>{title}</b>{hint && <small>{hint}</small>}</span>
    <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} /><i aria-hidden />
  </label>
);

/* a text field: red with a message under it when `error` is set; `*` for required; a live character count when `count` is given */
export function TextField({ id, label, required, optional, error, hint, textarea, className = "", count, value, ...rest }) {
  const Tag = textarea ? "textarea" : "input";
  const len = String(value ?? "").length;
  return (
    <div className="rf-field">
      <label htmlFor={id} className="rv-label">
        <span>{label}{required && <span className="rv-star" aria-hidden title="Required"> *</span>}{optional && <span className="rv-subtle" style={{ fontWeight: 500 }}> · optional</span>}</span>
        {count && <span className={cx("cnt", len > count * 0.9 && "near")} aria-hidden>{len}/{count}</span>}
      </label>
      <Tag id={id} value={value} maxLength={count || rest.maxLength} className={cx("rv-input", textarea && "rf-textarea", error && "bad", className)} aria-invalid={error ? "true" : undefined} aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined} aria-required={required || undefined} {...rest} />
      {error ? <p id={`${id}-e`} role="alert" className="rv-err"><Warning size={15} weight="fill" style={{ marginTop: 2, flexShrink: 0 }} aria-hidden />{error}</p> : hint ? <p id={`${id}-h`} className="rv-hint">{hint}</p> : null}
    </div>
  );
}
/* scroll to, and focus, the first invalid field as it appears on the page (not in the order the rules ran) */
export const focusFirstError = (errors) => {
  const els = Object.keys(errors).map((k) => document.getElementById(`f-${k}`)).filter(Boolean);
  els.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top || (a.compareDocumentPosition(b) & 4 ? -1 : 1));
  const el = els[0];
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
  el?.focus({ preventScroll: true });
};

/* upload a PDF / Word resume straight to storage (click or drop); `value` is { key, filename } */
export function ResumeUpload({ value, onChange, saved }) {
  const input = useRef(null);
  const [pct, setPct] = useState(null);
  const [err, setErr] = useState("");
  const [drag, setDrag] = useState(false);
  const pick = async (file) => {
    if (!file) return;
    if (!/\.(pdf|docx?)$/i.test(file.name)) return setErr("Upload a PDF or Word file.");
    if (file.size > 10 * 1024 * 1024) return setErr("The file is over 10 MB.");
    setErr(""); setPct(0);
    try { const r = await uploadDocument(file, (p) => setPct(Math.round(p * 100))); onChange({ key: r.key, filename: r.filename }); }
    catch (e) { setErr(e?.message || "The upload didn't go through."); }
    finally { setPct(null); if (input.current) input.current.value = ""; }
  };
  const has = Boolean(value?.key);
  return (
    <div>
      <div className={cx("rf-file", drag && "drag", has && "has")} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}>
        {has ? <CheckCircle size={26} weight="duotone" color="var(--rv-ok)" aria-hidden /> : <FilePdf size={26} weight="duotone" aria-hidden />}
        <span><b>{pct != null ? `Uploading… ${pct}%` : value?.filename || saved?.filename || "Drop your resume here"}</b><small>{has ? "Attached" : "PDF or Word · up to 10 MB"}</small></span>
        <input ref={input} type="file" accept=".pdf,.doc,.docx,application/pdf" hidden onChange={(e) => pick(e.target.files?.[0])} />
        <Btn size="sm" variant="ghost" onClick={() => input.current?.click()} loading={pct != null}><UploadSimple size={14} weight="bold" aria-hidden />{has || saved ? "Replace" : "Choose file"}</Btn>
        {has && <button type="button" className="rf-iconbtn" style={{ width: 36, height: 36 }} aria-label="Remove file" onClick={() => onChange(null)}><X size={14} aria-hidden /></button>}
      </div>
      {err && <p role="alert" className="rv-err">{err}</p>}
    </div>
  );
}

/* a small Resume Lab nudge: a strong resume is what a referrer forwards */
export function ResumeBoost() {
  return (
    <a href="/resume-review" className="rf-boost" target="_blank" rel="noopener">
      <Ico e="✨" size="sm" />
      <div><b>Make your resume strong first</b><small>An AI report in minutes with Resume Lab.</small></div>
      <ArrowRight size={16} weight="bold" aria-hidden />
    </a>
  );
}

/* under a scroll-loaded list: the trigger, a count, and a button for people who don't scroll */
export function LoadMore({ list, noun = "result" }) {
  if (list.items === null) return null;
  return (
    <div className="rf-more" aria-live="polite">
      {list.hasMore && <div ref={list.sentinel} aria-hidden style={{ height: 1 }} />}
      {list.items.length > 0 && <span className="rf-xs">Showing {list.items.length} of {list.total} {noun}{list.total === 1 ? "" : "s"}</span>}
      {list.hasMore && <Btn variant="ghost" size="sm" loading={list.loading} onClick={list.loadMore}>Load more</Btn>}
      {list.error && <p role="alert" className="rv-err">{list.error} <button type="button" className="rl-textlink" style={{ background: "none", border: 0, cursor: "pointer" }} onClick={list.hasMore ? list.loadMore : list.reload}>Try again</button></p>}
    </div>
  );
}

/* ------------------------------------------------------------ dialogs */
/*
  A bottom sheet on phones, a centred dialog on large screens. Rendered into <body> (inside a .rv wrapper so the colours still apply),
  so a card's hover animation can never move or clip it.
*/
export function Sheet({ title, subtitle, onClose, children, wide, compact }) {
  const box = useRef(null);
  const before = useRef(typeof document !== "undefined" ? document.activeElement : null); // read before any autoFocus inside moves it
  useEffect(() => {
    const on = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", on);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!box.current?.contains(document.activeElement)) box.current?.focus({ preventScroll: true });
    const back = before.current;
    return () => { window.removeEventListener("keydown", on); document.body.style.overflow = prev; back?.focus?.({ preventScroll: true }); };
  }, [onClose]);
  return createPortal(
    <div className="rv">
      <div className="rf-sheet-back" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <div ref={box} tabIndex={-1} className={cx("rf-sheet", wide && "wide", compact && "compact")} role="dialog" aria-modal="true" aria-label={title} style={{ outline: "none" }}>
          <div className="rf-sheet-head"><div><h2>{title}</h2>{subtitle && <p className="rf-muted">{subtitle}</p>}</div><button type="button" className="rf-iconbtn" onClick={onClose} aria-label="Close"><X size={18} aria-hidden /></button></div>
          <div className="rf-sheet-body">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* a confirmation dialog: `const [ask, dialog] = useConfirm();` then `if (await ask({ title, message, confirmLabel })) ...` and render {dialog} */
export function useConfirm() {
  const [cfg, setCfg] = useState(null);
  const ask = useCallback((opts) => new Promise((resolve) => setCfg({ ...opts, resolve })), []);
  const done = (v) => { cfg?.resolve(v); setCfg(null); };
  const dialog = cfg && (
    <Sheet title={cfg.title || "Are you sure?"} subtitle={cfg.message} onClose={() => done(false)} compact>
      <div className="rf-btns">
        <Btn variant={cfg.danger === false ? undefined : "danger"} onClick={() => done(true)} autoFocus>{cfg.confirmLabel || "Confirm"}</Btn>
        <Btn variant="ghost" onClick={() => done(false)}>{cfg.cancelLabel || "Cancel"}</Btn>
      </div>
    </Sheet>
  );
  return [ask, dialog];
}

/* ask for a short text (a reason, a note) in a modal: `const [prompt, dialog] = usePrompt();` then `const text = await prompt({ title, label })`
   resolves to the text, or null when cancelled */
export function usePrompt() {
  const [cfg, setCfg] = useState(null);
  const [text, setText] = useState("");
  const prompt = useCallback((opts) => new Promise((resolve) => { setText(opts.value || ""); setCfg({ ...opts, resolve }); }), []);
  const done = (v) => { cfg?.resolve(v); setCfg(null); };
  const dialog = cfg && (
    <Sheet title={cfg.title} subtitle={cfg.message} onClose={() => done(null)} compact>
      <form className="rf-form" onSubmit={(e) => { e.preventDefault(); if (cfg.required && !text.trim()) return; done(text.trim()); }}>
        <TextField id="f-prompt" label={cfg.label || "Reason"} optional={!cfg.required} required={cfg.required} textarea rows={3} count={cfg.max || 300} value={text} onChange={(e) => setText(e.target.value)} placeholder={cfg.placeholder || ""} autoFocus />
        <div className="rf-btns">
          <Btn type="submit" variant={cfg.danger ? "danger" : undefined} disabled={cfg.required && !text.trim()}>{cfg.confirmLabel || "Continue"}</Btn>
          <Btn variant="ghost" onClick={() => done(null)}>Cancel</Btn>
        </div>
      </form>
    </Sheet>
  );
  return [prompt, dialog];
}
