import { Link } from "react-router-dom";
import { ArrowRight, CaretLeft, CaretRight, FilePdf, UserCircle } from "@phosphor-icons/react";

import { STATUS, dateFmt, dayFmt } from "./api";
import { ScoreRing, Skeleton, cx } from "./ui";

/* Small pieces shared by the pages of the signed-in space. */

/* where the main action goes: start a review when a plan allows it, otherwise choose a plan */
export const startTarget = (data) => (data?.plans?.some((p) => p.usable) ? "/resume-review/app/new" : "/resume-review/app/plans");

export const n0 = (v) => Number(v ?? 0).toLocaleString("en-IN");
export const plural = (n, w) => `${n0(n)} ${w}${Number(n) === 1 ? "" : "s"}`;
export const mb = (bytes) => (bytes > 0 ? `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 2 : 1)} MB` : "");

export const ago = (d) => {
  if (!d) return "";
  const m = Math.max(0, Math.round((Date.now() - new Date(d).getTime()) / 60000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const days = Math.round(h / 24);
  return days < 30 ? `${days} day${days === 1 ? "" : "s"} ago` : dayFmt(d);
};

/* what one review's state is, in words and tone */
export const reviewState = (r) => {
  if (r.humanRequested) return STATUS[r.status] || { label: "In progress", tone: "" };
  if (r.aiStatus === "failed" || r.ai?.status === "failed") return { label: "Report not generated", tone: "bad" };
  return r.status === "completed" ? { label: "Report ready", tone: "ok" } : { label: "AI agents at work", tone: "live" };
};

export function PageHead({ eyebrow, title, sub, actions, back }) {
  return (
    <header className="rs-head">
      <div>
        {back && <Link to={back.to} className="rs-back"><ArrowLeft14 />{back.label}</Link>}
        {eyebrow && <span className="rs-eyebrow">{eyebrow}</span>}
        <h1 className="rs-h1">{title}</h1>
        {sub && <p className="rs-sub">{sub}</p>}
      </div>
      {actions && <div className="rs-head-actions">{actions}</div>}
    </header>
  );
}
const ArrowLeft14 = () => <CaretLeft size={14} weight="bold" aria-hidden />;

export function ReviewItem({ r }) {
  const st = reviewState(r);
  const busy = r.score == null && st.tone !== "bad";
  return (
    <li>
      <Link to={`/resume-review/app/requests/${r.id}`} className="rs-item">
        {r.score != null ? <ScoreRing value={r.score} size={52} stroke={5} /> : <span className="rs-item-wait" aria-label={busy ? "Report in progress" : "No report"}>{busy ? <span className="rv-spin" /> : "—"}</span>}
        <span className="rs-item-main">
          <b>{r.targetRole || r.package?.name || "Resume review"}</b>
          <span className="rs-item-file"><FilePdf size={14} weight="duotone" aria-hidden /><span>{r.filename || "Resume"}</span></span>
        </span>
        <span className="rs-item-meta">
          <span className={cx("rs-chip", st.tone)}><span>{st.label}</span></span>
          {r.humanRequested && <span className="rs-chip brand"><UserCircle size={13} weight="bold" aria-hidden /><span>Human</span></span>}
          <span className="rs-item-date" title={dateFmt(r.createdAt)}>{ago(r.createdAt)}</span>
        </span>
        <ArrowRight size={18} weight="bold" className="rs-item-go" aria-hidden />
      </Link>
    </li>
  );
}

export const ListSkeleton = ({ n = 3, h = 80 }) => <ul className="rs-list">{Array.from({ length: n }, (_, i) => <li key={i}><Skeleton h={h} style={{ borderRadius: 16 }} /></li>)}</ul>;

const pageList = (page, pages) => {
  const out = [];
  for (let i = 1; i <= pages; i += 1) if (i === 1 || i === pages || Math.abs(i - page) <= 1) out.push(i);
  return out.flatMap((n, i) => (i > 0 && n - out[i - 1] > 1 ? ["…", n] : [n]));
};
export function Pager({ page, pages, onGo }) {
  if (!pages || pages <= 1) return null;
  return (
    <nav className="rs-pager" aria-label="Pages">
      <button type="button" onClick={() => onGo(page - 1)} disabled={page === 1} aria-label="Previous page"><CaretLeft size={14} weight="bold" aria-hidden /></button>
      {pageList(page, pages).map((n, i) => (n === "…" ? <span key={`d${i}`} className="rs-subtle" aria-hidden>…</span> : <button key={n} type="button" className={n === page ? "on" : ""} aria-current={n === page ? "page" : undefined} onClick={() => onGo(n)}>{n}</button>))}
      <button type="button" onClick={() => onGo(page + 1)} disabled={page === pages} aria-label="Next page"><CaretRight size={14} weight="bold" aria-hidden /></button>
    </nav>
  );
}

/* a segmented filter: every option the same size */
export function Seg({ value, options, onChange, label }) {
  return (
    <div className="rs-seg" role="tablist" aria-label={label}>
      {options.map(([id, text, count]) => (
        <button key={id} type="button" role="tab" aria-selected={value === id} onClick={() => onChange(id)}>
          {text}{count != null && <small className="rs-num">{count}</small>}
        </button>
      ))}
    </div>
  );
}
