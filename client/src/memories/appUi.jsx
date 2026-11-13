import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { CheckCircle, Info, WarningCircle, X } from "@phosphor-icons/react";

import { cx } from "./ui";
import "./memories.css";
import "./landing.css";
import "./app.css";

/* Building blocks of the signed-in Memories app. */

/**
 * A MODAL. On phones it is a sheet that rises from the bottom; from tablet up it is a dialog in the middle.
 * The header (with the close button) and the footer never scroll away: only the middle scrolls, and the whole thing is never
 * taller than the visible screen, so the close button is always on screen. It is drawn at the end of <body>, outside any page
 * wrapper that could clip or move it. Escape, a tap on the backdrop and the close button all close it (unless `locked`).
 */
export function Sheet({ title, subtitle, icon, label, onClose, locked = false, size = "md", footer, children }) {
  const box = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  const isLocked = useRef(locked);
  isLocked.current = locked;

  useEffect(() => {
    const key = (e) => { if (e.key === "Escape" && !isLocked.current) close.current(); };
    const html = document.documentElement;
    const prev = [html.style.overflow, document.body.style.overflow];
    html.style.overflow = "hidden"; // the page behind stays still
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    const before = document.activeElement;
    box.current?.focus({ preventScroll: true });
    return () => {
      window.removeEventListener("keydown", key);
      [html.style.overflow, document.body.style.overflow] = prev;
      if (before instanceof HTMLElement) before.focus({ preventScroll: true });
    };
  }, []);

  const width = { sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-3xl" }[size];
  return createPortal(
    <div className="mem-root ml-root ma-root ma-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget && !locked) onClose(); }}>
      <div ref={box} tabIndex={-1} role="dialog" aria-modal="true" aria-label={label || (typeof title === "string" ? title : undefined)} className={cx("ma-sheet outline-none", width)}>
        <span className="ma-sheet-grab" aria-hidden />
        <header className="ma-sheet-head">
          {icon && <span className="ma-spin-in grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ffe4ec] text-[#e11d48]">{icon}</span>}
          <div className="min-w-0 flex-1 self-center">
            {title && <h2 className="heading-6 break-words text-[#2a1023]">{title}</h2>}
            {subtitle && <p className="body-6 break-words text-[#7a5370]">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} disabled={locked} aria-label="Close" className="ma-close"><X size={20} weight="bold" aria-hidden /></button>
        </header>
        <div className="ma-sheet-body">{children}</div>
        {footer && <footer className="ma-sheet-foot">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

/** A coloured note: good news, a warning, an error or plain information. */
export function Banner({ tone = "info", title, children, className }) {
  const T = {
    ok: ["bg-[#ecfdf5] text-emerald-900 ring-emerald-200", CheckCircle, "text-emerald-600"],
    warn: ["bg-amber-50 text-amber-900 ring-amber-200", WarningCircle, "text-amber-600"],
    error: ["bg-[#fff1f3] text-[#9f1239] ring-[#fecdd3]", WarningCircle, "text-[#e11d48]"],
    info: ["bg-white text-[#6b3a5a] ring-[#f8d7e0]", Info, "text-[#e11d48]"],
  }[tone];
  const Icon = T[1];
  return (
    <div role={tone === "error" || tone === "warn" ? "alert" : "status"} className={cx("ma-in body-6 flex gap-3 rounded-2xl p-4 ring-1 ring-inset", T[0], className)}>
      <Icon size={20} weight="fill" className={cx("mt-0.5 shrink-0", T[2])} aria-hidden />
      <div className="min-w-0 space-y-1">{title && <p className="font-semibold">{title}</p>}{children}</div>
    </div>
  );
}

/** The heading at the top of each tab. */
export function PageHead({ kicker, title, text, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="ma-in min-w-0">
        <p className="ml-kicker caption-3">{kicker}</p>
        <h1 className="heading-3 mt-2 text-[#2a1023]">{title}</h1>
        {text && <p className="body-3 mt-2 max-w-xl text-[#7a5370]">{text}</p>}
      </div>
      {children && <div className="ma-in flex flex-wrap items-center gap-2" style={{ "--i": 1 }}>{children}</div>}
    </div>
  );
}

/** A square with an icon in it. */
export const IconTile = ({ children, className, style }) => (
  <span className={cx("ma-icon grid h-12 w-12 shrink-0 place-items-center rounded-2xl", className)} style={style}>{children}</span>
);

export const SectionTitle = ({ id, children }) => <h3 id={id} className="ml-kicker caption-3">{children}</h3>;
