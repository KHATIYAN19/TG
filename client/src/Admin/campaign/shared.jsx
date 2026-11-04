import { useEffect, useRef, useState } from "react";

import { campaignHttp as api, errMsg } from "../../arena/api";
import { cx } from "../../arena/ui";

export { api, errMsg };

export const MUTED = "text-stone-500 dk:text-[#b9a79c]";
export const TITLE = "text-[#29201b] dk:text-[#fff7ed]";

export const when = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

export const money = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

export const STATUS_TONE = {
  DRAFT: "slate",
  SCHEDULED: "amber",
  QUEUEING: "amber",
  SENDING: "brand",
  PAUSED: "amber",
  COMPLETED: "emerald",
  CANCELLED: "slate",
  FAILED: "rose",
  // recipients
  PENDING: "slate",
  QUEUED: "amber",
  SENT: "emerald",
  DEAD: "rose",
  SKIPPED: "slate",
};

export const EMPTY_AUDIENCE = {
  sources: ["buyers"],
  includeBooks: [],
  includeMode: "any",
  excludeBooks: [],
  purchasedFrom: "",
  purchasedTo: "",
  minOrders: "",
  minSpent: "",
  maxSpent: "",
  userScope: "nonBuyers",
  manualEmails: "",
  excludeEmails: "",
  excludeCampaignIds: [],
};

export const EMPTY_CONTENT = {
  headline: "",
  body: "",
  couponCode: "",
  ctaText: "",
  ctaUrl: "",
  featuredBookIds: [],
};

export const EMAIL_RE = /[^\s@,;<>"']+@[^\s@,;<>"']+\.[^\s@,;<>"']+/g;

/* Empty form values must not be sent as "" numbers. */
export const cleanAudience = (a) => {
  const out = { ...a };
  for (const key of ["minOrders", "minSpent", "maxSpent"]) {
    if (out[key] === "" || out[key] == null) delete out[key];
    else out[key] = Number(out[key]);
  }
  for (const key of ["purchasedFrom", "purchasedTo"]) if (!out[key]) delete out[key];
  return out;
};

/* Value that settles after `ms` of no change. */
export function useDebounced(value, ms = 600) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

/* Repeats `fn` while `active`. */
export function usePolling(fn, active, ms = 4000) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    if (!active) return undefined;
    const id = setInterval(() => saved.current(), ms);
    return () => clearInterval(id);
  }, [active, ms]);
}

export function Progress({ done, total, tone = "orange" }) {
  const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200/80 dk:bg-[#3a2c23]">
        <div
          className={cx("h-full rounded-full transition-all", tone === "emerald" ? "bg-gradient-to-r from-emerald-400 to-emerald-600" : "bg-gradient-to-r from-orange-400 to-orange-600")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-xs font-semibold tabular-nums">{pct}%</span>
    </div>
  );
}

export function Stat({ label, value, tone }) {
  return (
    <div className="rounded-2xl border border-stone-100 bg-stone-50/70 p-3.5 text-center dk:border-[#3a2c23] dk:bg-[#2c211b]">
      <div className={cx("text-[11px] font-semibold uppercase tracking-wide", MUTED)}>{label}</div>
      <div
        className={cx(
          "mt-1 text-xl font-bold tabular-nums",
          tone === "rose" ? "text-rose-600 dk:text-rose-300" : tone === "emerald" ? "text-emerald-600 dk:text-emerald-300" : TITLE
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* Sandboxed live preview of an email. */
export function EmailFrame({ html, height = 520 }) {
  return (
    <iframe
      title="Email preview"
      sandbox=""
      srcDoc={html || "<p style='font-family:sans-serif;color:#888;padding:24px'>Nothing to preview yet.</p>"}
      className="w-full rounded-xl border border-stone-200 bg-white dk:border-[#443127]"
      style={{ height }}
    />
  );
}

/* Pull every e-mail address out of free text / a CSV. */
export const extractEmails = (text) => [...new Set((String(text).match(EMAIL_RE) || []).map((e) => e.toLowerCase()))];

export const downloadText = (filename, text, type = "text/csv") => {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
