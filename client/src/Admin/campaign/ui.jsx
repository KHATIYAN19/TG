import { useEffect, useState } from "react";
import { Check } from "lucide-react";

import { cx } from "../../arena/ui";
import { api } from "./shared";

/* Design layer for Campaign Studio: warm, soft, consistent with the arena theme. */

/* ---------- hero ---------- */
export function Hero({ icon: Icon, title, subtitle, children, actions }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-6 text-white shadow-lg shadow-orange-600/20 sm:p-8">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-amber-300/20" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
            <Icon className="h-7 w-7" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-1 max-w-xl text-sm text-orange-50 sm:text-base">{subtitle}</p>
          </div>
        </div>
        {actions}
      </div>
      {children && <div className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>}
    </section>
  );
}

export function HeroStat({ icon: Icon, label, value, alert }) {
  return (
    <div className={cx("rounded-2xl p-3.5 ring-1 backdrop-blur", alert ? "bg-rose-950/30 ring-rose-200/40" : "bg-white/15 ring-white/25")}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-orange-50">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />} {label}
      </div>
      <div className="mt-1 text-2xl font-extrabold tabular-nums">{value}</div>
    </div>
  );
}

/* ---------- tabs ---------- */
export function Tabs({ tabs, value, onChange }) {
  return (
    <nav
      className="inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl border border-[#f0ded0] bg-white p-1.5 shadow-sm dk:border-[#443127] dk:bg-[#241b15]"
      aria-label="Sections"
    >
      {tabs.map(({ key, label, icon: Icon, badge }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-current={value === key ? "page" : undefined}
          className={cx(
            "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition",
            value === key
              ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30"
              : "text-stone-600 hover:bg-orange-50 dk:text-[#d6c4b8] dk:hover:bg-orange-500/10"
          )}
        >
          <Icon className="h-4 w-4" aria-hidden /> {label}
          {badge ? (
            <span className={cx("rounded-full px-1.5 text-[11px] font-bold", value === key ? "bg-white/25" : "bg-rose-100 text-rose-700")}>{badge}</span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}

/* ---------- stepper ---------- */
export function Stepper({ steps, current, onGo }) {
  return (
    <ol className="flex items-center" aria-label="Steps">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <button type="button" onClick={() => onGo(i)} className="group flex items-center gap-2.5">
              <span
                className={cx(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold transition",
                  done && "bg-emerald-500 text-white",
                  active && "bg-orange-600 text-white ring-4 ring-orange-200 dk:ring-orange-500/25",
                  !done && !active && "bg-stone-200 text-stone-500 dk:bg-[#3a2c23] dk:text-[#b9a79c]"
                )}
              >
                {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
              </span>
              <span
                className={cx(
                  "hidden text-sm font-semibold sm:block",
                  active ? "text-[#29201b] dk:text-[#fff7ed]" : "text-stone-500 dk:text-[#b9a79c]"
                )}
              >
                {label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span aria-hidden className={cx("mx-3 h-0.5 flex-1 rounded-full", done ? "bg-emerald-400" : "bg-stone-200 dk:bg-[#3a2c23]")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ---------- panel (section card with header) ---------- */
export function Panel({ icon: Icon, title, subtitle, action, children, className, tone }) {
  return (
    <section
      className={cx(
        "overflow-hidden rounded-2xl border bg-white shadow-sm dk:bg-[#241b15]",
        tone === "danger" ? "border-rose-200 dk:border-rose-500/30" : "border-[#f0ded0] dk:border-[#443127]",
        className
      )}
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-[#f6e9de] bg-gradient-to-r from-orange-50/80 to-transparent px-5 py-3.5 dk:border-[#3a2c23] dk:from-orange-500/10">
        {Icon && (
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-100 text-orange-700 dk:bg-orange-500/15 dk:text-orange-300">
            <Icon className="h-[18px] w-[18px]" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-bold text-[#29201b] dk:text-[#fff7ed]">{title}</h3>
          {subtitle && <p className="text-xs text-stone-500 dk:text-[#b9a79c]">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ---------- stat tile ---------- */
const TILE = {
  default: "bg-stone-50 text-stone-600 dk:bg-[#2c211b]",
  emerald: "bg-emerald-50 text-emerald-700 dk:bg-emerald-500/10 dk:text-emerald-300",
  rose: "bg-rose-50 text-rose-700 dk:bg-rose-500/10 dk:text-rose-300",
  amber: "bg-amber-50 text-amber-700 dk:bg-amber-500/10 dk:text-amber-300",
  brand: "bg-orange-50 text-orange-700 dk:bg-orange-500/10 dk:text-orange-300",
};
export function StatCard({ icon: Icon, label, value, tone = "default", hint }) {
  return (
    <div className="rounded-2xl border border-[#f0ded0] bg-white p-4 shadow-sm dk:border-[#443127] dk:bg-[#241b15]">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", TILE[tone])}>
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        )}
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-500 dk:text-[#b9a79c]">{label}</div>
          <div className="text-2xl font-extrabold tabular-nums text-[#29201b] dk:text-[#fff7ed]">{value}</div>
        </div>
      </div>
      {hint && <p className="mt-2 text-xs text-stone-500 dk:text-[#b9a79c]">{hint}</p>}
    </div>
  );
}

/* ---------- status pill ---------- */
const PILL = {
  DRAFT: ["bg-stone-100 text-stone-700 dk:bg-[#2c211b] dk:text-[#ead9cc]", "bg-stone-400"],
  SCHEDULED: ["bg-amber-50 text-amber-800 dk:bg-amber-500/10 dk:text-amber-200", "bg-amber-500"],
  QUEUEING: ["bg-amber-50 text-amber-800 dk:bg-amber-500/10 dk:text-amber-200", "bg-amber-500"],
  SENDING: ["bg-orange-50 text-orange-800 dk:bg-orange-500/10 dk:text-orange-200", "bg-orange-500 animate-pulse"],
  PAUSED: ["bg-amber-50 text-amber-800 dk:bg-amber-500/10 dk:text-amber-200", "bg-amber-500"],
  COMPLETED: ["bg-emerald-50 text-emerald-800 dk:bg-emerald-500/10 dk:text-emerald-200", "bg-emerald-500"],
  CANCELLED: ["bg-stone-100 text-stone-600 dk:bg-[#2c211b] dk:text-[#b9a79c]", "bg-stone-400"],
  FAILED: ["bg-rose-50 text-rose-700 dk:bg-rose-500/10 dk:text-rose-300", "bg-rose-500"],
  SENT: ["bg-emerald-50 text-emerald-800 dk:bg-emerald-500/10 dk:text-emerald-200", "bg-emerald-500"],
  QUEUED: ["bg-amber-50 text-amber-800 dk:bg-amber-500/10 dk:text-amber-200", "bg-amber-500"],
  PENDING: ["bg-stone-100 text-stone-700 dk:bg-[#2c211b] dk:text-[#ead9cc]", "bg-stone-400"],
  DEAD: ["bg-rose-50 text-rose-700 dk:bg-rose-500/10 dk:text-rose-300", "bg-rose-500"],
  SKIPPED: ["bg-stone-100 text-stone-600 dk:bg-[#2c211b] dk:text-[#b9a79c]", "bg-stone-400"],
};
export function StatusPill({ status }) {
  const [box, dot] = PILL[status] || PILL.DRAFT;
  return (
    <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold", box)}>
      <span className={cx("h-1.5 w-1.5 rounded-full", dot)} /> {status === "DEAD" ? "IN DLQ" : status}
    </span>
  );
}

/* ---------- mail-client frame around the preview ---------- */
export function MailFrame({ subject, preheader, html, height = 560 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#f0ded0] bg-white shadow-md dk:border-[#443127] dk:bg-[#241b15]">
      <div className="flex items-center gap-1.5 border-b border-stone-100 bg-stone-50 px-4 py-2.5 dk:border-[#3a2c23] dk:bg-[#2c211b]">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-[11px] font-semibold uppercase tracking-wide text-stone-400">Inbox preview</span>
      </div>
      <div className="border-b border-stone-100 px-4 py-3 dk:border-[#3a2c23]">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-orange-600 text-sm font-bold text-white">T</span>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-[#29201b] dk:text-[#fff7ed]">{subject || "Your subject line"}</div>
            <div className="truncate text-xs text-stone-500 dk:text-[#b9a79c]">Target Trek · {preheader || "preview text appears here"}</div>
          </div>
        </div>
      </div>
      <iframe
        title="Email preview"
        sandbox=""
        srcDoc={html || "<p style='font-family:sans-serif;color:#999;padding:32px;text-align:center'>Choose a template to see your email.</p>"}
        className="block w-full bg-[#fafaf9]"
        style={{ height }}
      />
    </div>
  );
}

/* ---------- scaled-down live thumbnail of an email ---------- */
const thumbCache = new Map();
export function useRenderedTemplate(t) {
  const key = t.key || t._id || t.id;
  const [html, setHtml] = useState(thumbCache.get(key) || "");
  useEffect(() => {
    if (thumbCache.has(key)) return setHtml(thumbCache.get(key));
    let off = false;
    api
      .post("/render", {
        subject: t.subject || "",
        html: t.html,
        content: { headline: "Your headline", body: "A short, friendly message for your customers.", couponCode: "SAVE20", ctaText: "Shop now", ...(t.defaults || {}) },
      })
      .then(({ data }) => {
        thumbCache.set(key, data.html);
        if (!off) setHtml(data.html);
      })
      .catch(() => {});
    return () => {
      off = true;
    };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return html;
}

export function Thumb({ template, height = 190 }) {
  const html = useRenderedTemplate(template);
  const scale = 0.42;
  return (
    <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dk:border-[#443127]" style={{ height }}>
      {html ? (
        <iframe
          title={`${template.name} thumbnail`}
          sandbox=""
          tabIndex={-1}
          srcDoc={html}
          className="pointer-events-none absolute left-1/2 top-0 origin-top border-0"
          style={{ width: 640, height: Math.ceil(height / scale), transform: `translateX(-50%) scale(${scale})` }}
        />
      ) : (
        <div className="grid h-full place-items-center text-xs text-stone-400">Loading preview…</div>
      )}
    </div>
  );
}
