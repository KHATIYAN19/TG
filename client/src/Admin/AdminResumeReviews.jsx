import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowSquareOut, ArrowsClockwise, Brain, FileText, House, LinkedinLogo, MagnifyingGlass, Plus, Trash, UploadSimple, X } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import {
  PLAN_STATE, adminAiSettings, adminBlock, adminBuilder, adminBulkDeletePurchases, adminBulkDeleteRequests, adminClaim, adminDeleteDraft, adminDeletePackage,
  adminDeletePurchase, adminDeleteRequest, adminEraseMember, adminGet, adminGetLite, adminGrant, adminList, adminMembers, adminOverview, adminPackages, adminPurchases,
  adminRerunAi, adminSaveAiSettings, adminSaveBuilderSettings, adminSavePackage, adminSaveReview, adminTestAiModel, adminUnblock, adminUpdatePurchase,
  dateFmt, dayFmt, formatINR, uploadDocument,
} from "../resume/api";
import { AiReport } from "../resume/ResumeDetail";
import { Btn, FormattedText, Page, Skeleton, cx } from "../resume/ui";
import { Badge, CopyText, Pager, Sheet, Switch, TextField, usePrompt } from "../referral/ui";
import "../referral/referral.css";
import "./adminReferrals.css";
import "./adminResume.css";

/*
  RESUME LAB · admin console (rebuilt from scratch, same shape as /admin/referrals)
    Work    Overview        the numbers, what needs attention, the oldest reviews waiting
            Reviews         every resume sent in: AI report, the human review, Trash, bulk delete forever
    Money   Payments        every plan bought: extend, switch off, give a plan, bulk delete forever
            Members         who uses Resume Lab: block, unblock, erase all their data for good
    Setup   Plans           what is sold: create, edit, hide, delete forever
            Resume builder  the on / off switch and every question it asked (delete a builder resume for good)
            AI model        which provider and model writes the AI reviews
  ONE API CALL PER TAB: each tab's endpoint returns its rows, its chip counts and anything its forms need.
  The review desk makes one call to open, then a light poll (status + AI only) while the AI agents run.
  Reviewers (Employee accounts) see Overview and Reviews only. Every permanent delete asks in a sheet first.
*/

/* ------------------------------------------------------------ small helpers */
const lines = (v) => String(v || "").split("\n").map((s) => s.trim()).filter(Boolean);
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const since = (d) => { const h = Math.max(0, (Date.now() - new Date(d).getTime()) / 36e5); return h < 1 ? "just now" : h < 24 ? `${Math.floor(h)}h` : `${Math.floor(h / 24)}d`; };
const scoreTone = (n) => (n >= 75 ? "ok" : n >= 50 ? "warn" : "bad");
const useDebounced = (v, ms = 350) => { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]); return d; };

/* One call per view. `key` says what to load; the same key never loads twice (React's dev double-run included).
   The last answer stays on screen while a new one loads, and an older answer never overwrites a newer one. */
function useLoad(fn, key, skip = false) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);
  const last = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(async () => {
    const n = ++seq.current;
    setLoading(true); setError("");
    try { const d = await fnRef.current(); if (n === seq.current) setData(d); } catch (e) { if (n === seq.current) setError(errMsg(e)); } finally { if (n === seq.current) setLoading(false); }
  }, []);
  useEffect(() => { if (skip || last.current === key) return; last.current = key; run(); }, [key, skip, run]);
  return { data, error, loading, reload: run, setData };
}

/* runs an action with a toast; `busy` names the running one so only that button spins */
const useRun = () => {
  const [busy, setBusy] = useState("");
  const run = async (name, fn, okMsg, after) => { setBusy(name); try { const r = await fn(); if (okMsg) toast.success(typeof okMsg === "function" ? okMsg(r) : okMsg); await after?.(r); return r; } catch (e) { toast.error(errMsg(e)); return null; } finally { setBusy(""); } };
  return [busy, run];
};

/* ticked rows; cleared whenever new rows arrive */
function usePick(rows) {
  const [picked, setPicked] = useState(() => new Set());
  useEffect(() => { setPicked(new Set()); }, [rows]);
  const toggle = (id) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const all = Boolean(rows?.length) && rows.every((r) => picked.has(r.id));
  const toggleAll = () => setPicked(all ? new Set() : new Set(rows.map((r) => r.id)));
  return { picked, toggle, all, toggleAll, clear: () => setPicked(new Set()) };
}

const HUES = [158, 172, 200, 262, 330, 18, 32, 8];
const Avatar = ({ name, email, size }) => {
  const label = (name || email || "?").trim();
  const initials = label.split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";
  const hue = HUES[[...label].reduce((n, c) => n + c.charCodeAt(0), 0) % HUES.length];
  return <span className={cx("rlx-av", size)} style={{ background: `linear-gradient(135deg, hsl(${hue} 62% 46%), hsl(${(hue + 30) % 360} 58% 34%))` }} aria-hidden>{initials}</span>;
};
const Who = ({ name, email, sub }) => <div className="rlx-who"><Avatar name={name} email={email} /><div><b>{name || "User"}</b><small>{sub || email}</small></div></div>;

const Search = ({ value, onChange, placeholder }) => (
  <div className="rf-qwrap"><MagnifyingGlass size={18} aria-hidden /><input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />{value && <button type="button" className="x" onClick={() => onChange("")} aria-label="Clear search"><X size={15} weight="bold" aria-hidden /></button>}</div>
);
const Chips = ({ options, value, onChange, counts }) => (
  <div className="rf-chips" role="group" aria-label="Filter">{options.map(([k, l]) => <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}>{l}{counts?.[k] != null && <em>{counts[k]}</em>}</button>)}</div>
);
const Head = ({ title, sub, actions }) => <header className="arx-head"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{actions && <div className="rf-btns">{actions}</div>}</header>;
const Empty = ({ e = "🔍", children }) => <div className="arx-empty"><span className="e" aria-hidden>{e}</span>{children}</div>;
const Refresh = ({ loading, onClick }) => <Btn size="sm" variant="ghost" loading={loading} onClick={onClick}><ArrowsClockwise size={14} aria-hidden />Refresh</Btn>;

function Table({ cols, rows, error, loading, empty, children }) {
  return (
    <>
      {error && <p role="alert" className="rf-banner bad" style={{ marginBottom: 12 }}>{error}</p>}
      <div className={cx("arx-table-wrap", loading && rows && "rlx-dim")} aria-busy={loading || undefined}>
        <table className="arx-table">
          <thead><tr>{cols.map((c, i) => <th key={i} scope="col" className={c?.pick ? "pick" : undefined}>{c?.pick ? c.node : c}</th>)}</tr></thead>
          <tbody>
            {!rows && !error && [0, 1, 2, 3, 4].map((i) => <tr key={i}><td colSpan={cols.length}><Skeleton h={22} /></td></tr>)}
            {children}
            {rows?.length === 0 && <tr><td colSpan={cols.length}><Empty e={empty[0]}>{empty[1]}</Empty></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
const PickHead = (pick) => ({ pick: true, node: <input type="checkbox" className="rlx-box" checked={pick.all} onChange={pick.toggleAll} aria-label="Select every row on this page" /> });
const PickCell = ({ pick, id, label }) => <td className="pick" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rlx-box" checked={pick.picked.has(id)} onChange={() => pick.toggle(id)} aria-label={`Select ${label}`} /></td>;
const BulkBar = ({ pick, children }) => pick.picked.size > 0 && (
  <div className="rlx-bulk" role="region" aria-label="Selected rows"><b>{pick.picked.size} selected</b><button type="button" className="lnk" onClick={pick.clear}>Clear</button><span className="grow" />{children}</div>
);

/* a confirm sheet that can hold extra options; `typeWord` makes the admin type a word for the most dangerous deletes */
function ConfirmSheet({ title, message, children, confirmLabel = "Delete forever", danger = true, typeWord, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const [typed, setTyped] = useState("");
  const blocked = typeWord && typed.trim().toUpperCase() !== typeWord;
  const go = async () => { if (blocked) return; setBusy(true); try { await onConfirm(); } finally { setBusy(false); } };
  return (
    <Sheet title={title} subtitle={message} onClose={busy ? () => {} : onClose} compact>
      {(children || typeWord) && (
        <div className="rlx-confirm">
          {children}
          {typeWord && <TextField id="f-type" label={`Type ${typeWord} to confirm`} value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" autoFocus />}
        </div>
      )}
      <div className="rf-btns">
        <Btn variant={danger ? "danger" : undefined} loading={busy} disabled={blocked} onClick={go}>{danger && <Trash size={15} aria-hidden />}{confirmLabel}</Btn>
        <Btn variant="ghost" disabled={busy} onClick={onClose}>Cancel</Btn>
      </div>
    </Sheet>
  );
}
const Check = ({ checked, onChange, children }) => <label className="rlx-check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{children}</label>;

const ST = { ai_reviewing: ["🤖 AI at work", "info"], awaiting_review: ["⏳ Waiting", "warn"], in_review: ["✍️ In review", "info"], completed: ["✅ Delivered", "ok"] };
const StatusBadge = ({ s }) => { const [l, t] = ST[s] || [s, "muted"]; return <Badge tone={t}>{l}</Badge>; };
const MODES = {
  on: ["🟢 On", "Everyone sees the resume builder. Anyone with builder credits can build; others are sent to the plans. Plans with builder credits are sold."],
  existing: ["🟡 Off for new members", "Only people who already hold builder credits (or already have builder resumes) still see and use it. Nobody new can buy credits."],
  off: ["⛔ Off completely", "Hidden and blocked for everyone, and builder plans are not sold. Nothing is deleted: turning it back on restores every resume and credit."],
};

/* ============================================================ OVERVIEW  (1 call: /overview) */
function Overview({ isAdmin, go, onCounts }) {
  const { data: d, error, loading, reload } = useLoad(adminOverview, "overview");
  useEffect(() => { if (d) onCounts({ awaiting: d.counts.awaiting }); }, [d, onCounts]);
  const c = d?.counts;
  const m = d?.money;
  const tiles = d ? [
    ["⏳", "Waiting for a reviewer", c.awaiting, c.stale ? `${c.stale} older than 2 days` : "human reviews to take", ["reviews", { filter: "awaiting_review" }], c.stale > 0],
    ["✍️", "Being reviewed", c.inReview, "taken by a reviewer", ["reviews", { filter: "in_review" }]],
    ["🤖", "AI agents at work", c.aiRunning, "running right now", ["reviews", { filter: "ai_reviewing" }]],
    ["✅", "Delivered", c.completed, `${c.total} reviews in all`, ["reviews", { filter: "completed" }]],
    ...(isAdmin ? [
      ["💸", "Revenue", formatINR(m.revenue), `${plural(m.paidPlans, "paid plan")}`, ["payments", { filter: "paid" }]],
      ["📅", "Last 7 days", formatINR(m.weekRevenue), `${plural(m.weekPlans, "plan")} sold`, ["payments", { filter: "paid" }]],
      ["👥", "Paying members", d.members.paying, `${d.members.blocked} blocked`, ["members", { filter: "paying" }]],
      ["🏷️", "Plans on sale", d.livePlans, "visible on the site", ["plans", {}]],
    ] : []),
  ] : [];
  const attn = d ? [
    c.stale > 0 && ["⏰", `${plural(c.stale, "review")} waiting more than 2 days`, "Take the oldest first. They're at the top of the queue below.", ["reviews", { filter: "awaiting_review" }]],
    c.aiFailed > 0 && ["⚠️", `${plural(c.aiFailed, "AI review")} failed`, "Open one and re-run the AI, or check the AI model.", ["reviews", { filter: "ai_failed" }]],
    isAdmin && m.unpaid > 0 && ["💳", `${plural(m.unpaid, "checkout")} not paid this week`, "Started but never paid. Give the plan for free if a member says they paid.", ["payments", { filter: "unpaid" }]],
    isAdmin && m.expiring > 0 && ["📆", `${plural(m.expiring, "plan")} ending within 7 days`, "Extend one from Payments if a member asks.", ["payments", { filter: "paid" }]],
    isAdmin && d.trash > 0 && ["🗑️", `${plural(d.trash, "review")} deleted by members`, "Hidden from them, still stored. Remove them for good from Trash.", ["reviews", { filter: "trash" }]],
    isAdmin && d.ai?.source === "default" && ["🧠", "No AI model chosen yet", "The server's default model writes the reviews. Pick one under AI model.", ["ai", {}]],
  ].filter(Boolean) : [];

  return (
    <div>
      <Head title="Overview" sub="Resume Lab at a glance. Tap any number to open it." actions={<Refresh loading={loading && Boolean(d)} onClick={reload} />} />
      {error && <p role="alert" className="rf-banner bad" style={{ marginBottom: 12 }}>{error}</p>}
      <div className="arx-kpis">
        {!d && !error && [0, 1, 2, 3, ...(isAdmin ? [4, 5, 6, 7] : [])].map((i) => <Skeleton key={i} h={104} style={{ borderRadius: 16 }} />)}
        {tiles.map(([e, l, v, small, [tab, opts], warn]) => <button key={l} type="button" className={cx("arx-kpi", warn && "warn")} onClick={() => go(tab, opts)}><span><span aria-hidden>{e}</span>{l}</span><b>{v ?? "–"}</b><small>{small}</small></button>)}
      </div>

      <section className="arx-sec"><h2>🔔 Needs attention</h2>
        {d && attn.length === 0 && <p className="rf-banner ok"><span className="e" aria-hidden>🎉</span><span>All clear. Nothing needs you right now.</span></p>}
        <div className="arx-attn">{attn.map(([e, t, sub, [tab, opts]]) => <button key={t} type="button" onClick={() => go(tab, opts)}><span className="rf-ico sm" aria-hidden>{e}</span><div><b>{t}</b><span>{sub}</span></div></button>)}</div>
      </section>

      <div className="arx-two" style={{ marginTop: 28 }}>
        <section className="arx-card"><h3>📥 Oldest in the queue</h3>
          {!d && <Skeleton h={180} />}
          {d?.queue.length === 0 && <p className="rf-muted">No human reviews waiting. 🎉</p>}
          <div className="rlx-list">
            {d?.queue.map((r) => (
              <button key={r.id} type="button" className="rlx-item" onClick={() => go("reviews", { open: r.id })}>
                <Avatar name={r.user.name} email={r.user.email} />
                <div className="mid"><b>{r.user.name || r.user.email}</b><span>{r.package}{r.targetRole ? ` · ${r.targetRole}` : ""}{r.reviewerName ? ` · ${r.reviewerName}` : ""}</span></div>
                <div className="end"><StatusBadge s={r.status} /><small>{since(r.createdAt)} ago</small></div>
              </button>
            ))}
          </div>
          {d?.queue.length > 0 && <div><Btn size="sm" variant="ghost" onClick={() => go("reviews", { filter: "awaiting_review" })}>Open the queue</Btn></div>}
        </section>

        {isAdmin && (
          <section className="arx-card"><h3>💳 Latest payments</h3>
            {!d && <Skeleton h={180} />}
            {d?.recentPayments.length === 0 && <p className="rf-muted">No paid plans yet.</p>}
            <div className="rlx-list">
              {d?.recentPayments.map((p) => (
                <button key={p.id} type="button" className="rlx-item" onClick={() => go("payments", { search: p.user.email })}>
                  <Avatar name={p.user.name} email={p.user.email} />
                  <div className="mid"><b>{p.user.name || p.user.email}</b><span>{p.package.name} · {p.package.terms}</span></div>
                  <div className="end"><b className="rf-mono">{p.free ? "Free" : formatINR(p.payment.amount)}</b><small>{dayFmt(p.payment.paidAt || p.createdAt)}</small></div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>

      {isAdmin && d && (
        <section className="arx-card" style={{ marginTop: 16 }}><h3>⚙️ Setup</h3>
          <dl className="rf-kv">
            <div><dt>AI model</dt><dd>{d.ai.provider} · {d.ai.model} {d.ai.source === "default" ? <Badge>Default</Badge> : <Badge tone="ok">Your choice</Badge>}</dd></div>
            <div><dt>Resume builder</dt><dd>{MODES[d.builder]?.[0] || d.builder}</dd></div>
            <div><dt>Plans on sale</dt><dd>{d.livePlans}</dd></div>
          </dl>
          <div className="rf-btns"><Btn size="sm" variant="ghost" onClick={() => go("ai", {})}>🧠 AI model</Btn><Btn size="sm" variant="ghost" onClick={() => go("builder", {})}>🧱 Resume builder</Btn><Btn size="sm" variant="ghost" onClick={() => go("plans", {})}>🏷️ Plans</Btn></div>
        </section>
      )}
    </div>
  );
}

/* ============================================================ REVIEW DESK  (1 call to open, a light poll while the AI runs) */
const formOf = (h = {}) => ({ score: h.score ?? "", summary: h.summary || "", detailedFeedback: h.detailedFeedback || "", strengths: (h.strengths || []).join("\n"), improvements: (h.improvements || []).join("\n"), linkedinFeedback: h.linkedinFeedback || "", jobMatchFeedback: h.jobMatchFeedback || "", nextSteps: h.nextSteps || "", internalNotes: h.internalNotes || "" });

function LongField({ id, label, hint, rows = 5, value, onChange, mono = true }) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="rf-field">
      <div className="rlx-lf-head"><label htmlFor={id} className="rv-label" style={{ margin: 0 }}>{label}</label><button type="button" className="rlx-mini" onClick={() => setPreview(!preview)}>{preview ? "Edit" : "Preview"}</button></div>
      {preview
        ? <div className="rlx-preview">{value.trim() ? <FormattedText text={value} /> : <span className="rf-xs">Nothing to preview yet.</span>}</div>
        : <textarea id={id} rows={rows} className={cx("rv-input rf-textarea", mono && "rv-mono-area")} value={value} onChange={onChange} />}
      {hint && <p className="rv-hint">{hint}</p>}
    </div>
  );
}

function ReviewDesk({ id, role, onBack, onChanged }) {
  const me = useSelector((s) => s.auth?.user);
  const isAdmin = role === "admin";
  const [r, setR] = useState(null);
  const [form, setForm] = useState(null);
  const saved = useRef("");
  const [file, setFile] = useState(undefined); // undefined = unchanged, null = remove, {key, filename, size} = a new file
  const [uploading, setUploading] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);
  const [dlg, setDlg] = useState(""); // "deliver" | "delete" | "leave"
  const [giveBack, setGiveBack] = useState(false);
  const [busy, run] = useRun();
  const fileInput = useRef(null);

  const load = useCallback(async () => {
    try {
      const d = await adminGet(id);
      const f = formOf(d.human || {});
      setR(d); setFile(undefined); setForm(f); saved.current = JSON.stringify(f);
    } catch (e) { toast.error(errMsg(e)); onBack(); }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  // while the AI agents work, follow them with the light endpoint (status + AI only), so unsaved edits are never touched
  const aiLive = r && ["pending", "running"].includes(r.ai?.status);
  useEffect(() => {
    if (!aiLive) return undefined;
    const t = setInterval(() => { if (document.visibilityState === "visible") adminGetLite(id).then((x) => setR((p) => (p ? { ...p, ai: x.ai, status: x.status } : p))).catch(() => {}); }, 4000);
    return () => clearInterval(t);
  }, [aiLive, id]);

  if (!r || !form) return <div className="arx-desk"><Skeleton h={130} style={{ borderRadius: 18 }} /><Skeleton h={420} style={{ borderRadius: 16 }} /></div>;

  const mine = r.human?.reviewer && String(r.human.reviewer) === String(me?._id || me?.id);
  const canEdit = r.humanRequested && ["in_review", "completed"].includes(r.status) && (isAdmin || mine);
  const canTake = r.humanRequested && !r.deletedAt && (["awaiting_review", "ai_reviewing"].includes(r.status) || (isAdmin && r.status === "in_review" && !mine));
  const inc = r.package?.includes || {};
  const dirty = JSON.stringify(form) !== saved.current || file !== undefined;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const existing = file === undefined ? r.human?.deliverable : file;
  const after = async () => { await load(); onChanged(); };
  const back = () => (dirty && canEdit ? setDlg("leave") : onBack());
  const payload = (complete) => ({
    score: form.score === "" ? null : Number(form.score), summary: form.summary, detailedFeedback: form.detailedFeedback, strengths: lines(form.strengths), improvements: lines(form.improvements),
    linkedinFeedback: form.linkedinFeedback, jobMatchFeedback: form.jobMatchFeedback, nextSteps: form.nextSteps, internalNotes: form.internalNotes,
    ...(file === null ? { deliverable: null } : file ? { deliverable: { key: file.key, filename: file.filename } } : {}), complete,
  });
  const upload = async (f) => { setUploading(true); try { setFile(await uploadDocument(f)); } catch (e) { toast.error(errMsg(e)); } finally { setUploading(false); } };
  const p = r.profile || {};
  const facts = [["Type", p.kind === "student" ? "Student" : "Working professional"], [p.kind === "student" ? "College" : "Company", p.organization], p.kind === "professional" && ["Role", `${p.currentRole || "–"} · ${p.experienceYears ?? 0} yr`], p.course && ["Course", p.course], ["Target role", p.targetRole]].filter(Boolean);

  return (
    <div className="arx-desk">
      <div><button type="button" className="arx-back" onClick={back}><ArrowLeft size={14} weight="bold" aria-hidden />All reviews</button></div>
      <section className="rlx-hero">
        <div className="who">
          <Avatar name={r.user.name} email={r.user.email} size="lg" />
          <div style={{ minWidth: 0 }}>
            <div className="rlx-badges"><StatusBadge s={r.status} />{r.deletedAt && <Badge tone="bad">🗑️ Deleted by member {dayFmt(r.deletedAt)}</Badge>}<Badge>{r.package?.name}</Badge>{r.humanRequested ? <Badge tone="info">🙋 Human review asked</Badge> : <Badge>AI only</Badge>}{inc.rewrittenResume && <Badge tone="warn">Rewritten resume</Badge>}{r.linkedinRequested && <Badge tone="info">LinkedIn</Badge>}</div>
            <h1>{r.user.name || "User"}</h1>
            <p>{r.user.email && <CopyText value={r.user.email} />}{r.user.mobile && ` · ${r.user.mobile}`} · sent {dateFmt(r.createdAt)}</p>
          </div>
        </div>
        <div className="rf-btns">
          {canTake && <Btn loading={busy === "claim"} onClick={() => run("claim", () => adminClaim(id), "It's yours now.", after)}>{r.status === "in_review" ? "Take over" : "Take this review"}</Btn>}
          {isAdmin && <Btn variant="ghost" loading={busy === "ai"} title="Uses 1 of the member's AI credits (given back if the run fails)" onClick={() => run("ai", async () => { const o = await adminRerunAi(id); if (o.aiStatus === "failed") throw new Error(o.error || "The AI failed again."); }, "AI agents started. 1 AI credit was taken from the member's plan.", after)}><ArrowsClockwise size={15} aria-hidden />Re-run AI · 1 credit</Btn>}
          {isAdmin && <Btn variant="danger" onClick={() => setDlg("delete")}><Trash size={15} aria-hidden />Delete forever</Btn>}
        </div>
      </section>

      <div className="rlx-desk">
        <div className="rlx-col">
          <section className="arx-card"><h3>📄 Submission</h3>
            <dl className="rf-kv">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || "–"}</dd></div>)}</dl>
            <div className="rf-btns">
              {r.resumeUrl && <Btn as="a" href={r.resumeUrl} target="_blank" rel="noopener noreferrer" size="sm"><FileText size={15} aria-hidden />Open resume ({r.resume?.filename})<ArrowSquareOut size={13} aria-hidden /></Btn>}
              {r.linkedinUrl && <Btn as="a" href={r.linkedinUrl} target="_blank" rel="noopener noreferrer nofollow" variant="ghost" size="sm"><LinkedinLogo size={15} weight="fill" aria-hidden />LinkedIn<ArrowSquareOut size={13} aria-hidden /></Btn>}
            </div>
            {r.notes && <div className="rlx-note"><b>They asked:</b> {r.notes}</div>}
            {r.jobDescription && <details className="rlx-note"><summary style={{ cursor: "pointer", fontWeight: 700 }}>Job description ({r.jobDescription.length} characters)</summary><p style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{r.jobDescription}</p></details>}
            {r.plan && <p className="rf-xs">Plan: {r.plan.package.terms} · AI {r.plan.ai.unlimited ? "unlimited" : `${r.plan.ai.used} of ${r.plan.ai.allowed} used`}{r.plan.human.enabled && ` · human ${r.plan.human.used} of ${r.plan.human.allowed} used`} · {r.plan.payment.gateway === "admin" ? "given free" : `paid ${formatINR(r.plan.payment.amount)}`}</p>}
          </section>
          <AiReport ai={r.ai} includes={inc} kind={p.kind} />
          {r.ai?.error && <p className="rf-banner bad">AI error: {r.ai.error}</p>}
          {r.ai?.result && <div><button type="button" className="rlx-mini" onClick={() => setRawOpen(!rawOpen)}>{rawOpen ? "Hide" : "Show"} the AI's raw reply</button>{rawOpen && <pre className="rlx-raw">{JSON.stringify(r.ai.result, null, 2)}</pre>}</div>}
        </div>

        <section className={cx("arx-card rlx-write", canEdit && "on")}>
          <div className="rf-row-between"><h3 style={{ margin: 0 }}>✍️ Your review</h3>{r.human?.reviewerName && <Badge tone="info">{r.human.reviewerName}</Badge>}</div>
          {!canEdit && <p className="rlx-note">{r.humanRequested ? "Take this review to start writing. Only the reviewer who took it (or an admin) can edit." : "The person didn't ask for a human review on this resume, so there is nothing to write. They can ask for one later if they have human reviews left."}</p>}
          <fieldset disabled={!canEdit}>
            <TextField id="rv-score" label="Overall score (0-100)" type="number" min={0} max={100} value={form.score} onChange={set("score")} style={{ maxWidth: 140 }} />
            <LongField id="rv-summary" label="Summary for the person" rows={4} mono={false} hint="Plain words, as if talking to them. This is the first thing they read." value={form.summary} onChange={set("summary")} />
            <LongField id="rv-detail" label="Detailed feedback" rows={12} hint="Blank line = new paragraph. “- ” starts a bullet. “## ” makes a heading. **text** is bold." value={form.detailedFeedback} onChange={set("detailedFeedback")} />
            <div className="rf-two">
              <TextField id="rv-str" label="Strengths" hint="One per line" textarea rows={5} value={form.strengths} onChange={set("strengths")} />
              <TextField id="rv-imp" label="What to change" hint="One per line" textarea rows={5} value={form.improvements} onChange={set("improvements")} />
            </div>
            {(inc.linkedin || r.linkedinRequested) && <LongField id="rv-li" label="LinkedIn feedback" value={form.linkedinFeedback} onChange={set("linkedinFeedback")} />}
            {(inc.jobMatch || r.jobDescription) && <LongField id="rv-jm" label="Tailoring to their job" value={form.jobMatchFeedback} onChange={set("jobMatchFeedback")} />}
            <LongField id="rv-next" label="Next steps" rows={4} value={form.nextSteps} onChange={set("nextSteps")} />
            <div className="rf-field">
              <span className="rv-label"><span>Rewritten resume {inc.rewrittenResume ? <Badge tone="warn">Required for this plan</Badge> : <span className="rv-subtle" style={{ fontWeight: 500 }}>· optional</span>}</span></span>
              {existing ? (
                <div className="rlx-file">
                  <span><FileText size={16} aria-hidden />{existing.filename}{file && <Badge tone="warn">Not saved yet</Badge>}</span>
                  <span className="rf-btns">{file === undefined && r.deliverableUrl && <Btn as="a" href={r.deliverableUrl} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm">Open</Btn>}<Btn variant="danger" size="sm" onClick={() => setFile(null)}>Remove</Btn></span>
                </div>
              ) : (
                <div>
                  <input ref={fileInput} type="file" accept=".pdf,.doc,.docx,application/pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
                  <Btn variant="ghost" loading={uploading} onClick={() => fileInput.current?.click()}><UploadSimple size={16} weight="bold" aria-hidden />Upload PDF or Word file</Btn>
                  <p className="rv-hint">The person downloads it from their review page once you deliver.</p>
                </div>
              )}
            </div>
            <TextField id="rv-int" label="Internal notes" hint="Only reviewers and admins see this." textarea rows={2} value={form.internalNotes} onChange={set("internalNotes")} />
          </fieldset>
          {canEdit && (
            <div className="rlx-savebar">
              <Btn variant="ghost" loading={busy === "save"} disabled={uploading} onClick={() => run("save", () => adminSaveReview(id, payload(false)), "Draft saved.", after)}>Save draft</Btn>
              {r.status !== "completed"
                ? <Btn disabled={uploading} onClick={() => setDlg("deliver")}>Deliver to user</Btn>
                : <Btn loading={busy === "save2"} disabled={uploading} onClick={() => run("save2", () => adminSaveReview(id, payload(true)), "Updated.", after)}>Update delivered review</Btn>}
              {dirty && <span className="rf-xs" style={{ alignSelf: "center" }}>● Unsaved changes</span>}
            </div>
          )}
        </section>
      </div>

      {dlg === "deliver" && <ConfirmSheet title="Deliver this review?" message={`${r.user.name || "The user"} is emailed and can see this review right away.`} danger={false} confirmLabel="Deliver to user" onClose={() => setDlg("")} onConfirm={async () => { const ok = await run("deliver", () => adminSaveReview(id, payload(true)), "Delivered. The user was emailed.", after); if (ok) setDlg(""); }} />}
      {dlg === "leave" && <ConfirmSheet title="Leave without saving?" message="Your changes to this review are not saved yet." danger={false} confirmLabel="Leave anyway" onClose={() => setDlg("")} onConfirm={async () => onBack()} />}
      {dlg === "delete" && (
        <ConfirmSheet title="Delete this review for good?" message="The whole submission goes: the AI and human review, the uploaded resume and any rewritten resume file. This can't be undone." onClose={() => setDlg("")}
          onConfirm={() => run("del", () => adminDeleteRequest(id, giveBack), "Review deleted for good.", () => { onChanged(); onBack(); })}>
          <p className="rlx-note"><b>{r.user.name || "User"}</b> · {r.user.email}{r.resume?.filename ? ` · ${r.resume.filename}` : ""}</p>
          <Check checked={giveBack} onChange={setGiveBack}>Give the member this review back on their plan</Check>
        </ConfirmSheet>
      )}
    </div>
  );
}

/* ============================================================ REVIEWS  (1 call: /requests, rows + chip counts) */
const REVIEW_FILTERS = [["awaiting_review", "⏳ Waiting"], ["in_review", "✍️ In review"], ["ai_reviewing", "🤖 AI running"], ["completed", "✅ Delivered"], ["ai_failed", "⚠️ AI failed"], ["human", "🙋 Human asked"], ["all", "All"]];

function Reviews({ isAdmin, role, preset, onCounts }) {
  const [open, setOpen] = useState(preset.open || null);
  const [filter, setFilter] = useState(preset.filter || (preset.search ? "all" : "awaiting_review"));
  const [search, setSearch] = useState(preset.search || "");
  const q = useDebounced(search.trim());
  const [mine, setMine] = useState(false);
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const [dlg, setDlg] = useState(null); // { type: "one" | "many" | "trash", row? }
  const [giveBack, setGiveBack] = useState(false);
  const [, run] = useRun();
  const { data, error, loading, reload } = useLoad(() => adminList({ status: filter, search: q, mine: mine ? "1" : "0", page }), `${filter}|${q}|${mine}|${page}|${tick}`, Boolean(open));
  const pick = usePick(data?.rows);
  useEffect(() => { if (data?.counts) onCounts({ awaiting: data.counts.awaiting_review }); }, [data, onCounts]);
  const changed = () => setTick((t) => t + 1);
  const to = (setter) => (v) => { setter(v); setPage(1); };
  const trash = filter === "trash";
  const filters = isAdmin ? [...REVIEW_FILTERS, ["trash", "🗑️ Trash"]] : REVIEW_FILTERS;

  if (open) return <ReviewDesk id={open} role={role} onBack={() => setOpen(null)} onChanged={changed} />;
  const cols = [...(isAdmin ? [PickHead(pick)] : []), "Person", "Plan", "Background", "AI", "Human", "Status", "Reviewer", "Sent", ...(isAdmin ? [""] : [])];
  const closeDlg = () => { setDlg(null); setGiveBack(false); };

  return (
    <div>
      <Head title={trash ? "Trash" : "Reviews"} sub={trash ? "Reviews members deleted themselves. They're hidden from the member but still stored. Delete them for good here." : "Every resume sent in. Open one to read the AI report and write the human review."}
        actions={<>{trash && data?.counts?.trash > 0 && <Btn variant="danger" onClick={() => setDlg({ type: "trash" })}><Trash size={15} aria-hidden />Empty trash</Btn>}<Refresh loading={loading && Boolean(data)} onClick={reload} /></>} />
      <div className="arx-toolbar">
        <div className="rlx-filters">
          <Chips options={filters} value={filter} onChange={to(setFilter)} counts={data?.counts} />
          {!trash && <Check checked={mine} onChange={to(setMine)}>Only reviews I took</Check>}
        </div>
        <Search value={search} onChange={to(setSearch)} placeholder="Name, email, company, file" />
      </div>
      <Table cols={cols} rows={data?.rows} error={error} loading={loading} empty={trash ? ["🗑️", "Trash is empty."] : ["📝", "Nothing here."]}>
        {data?.rows.map((r) => (
          <tr key={r.id} className={cx("click", pick.picked.has(r.id) && "on")} tabIndex={0} onClick={() => setOpen(r.id)} onKeyDown={(e) => e.key === "Enter" && setOpen(r.id)}>
            {isAdmin && <PickCell pick={pick} id={r.id} label={r.user.name || r.user.email} />}
            <td className="first" data-label="Person"><Who name={r.user.name} email={r.user.email} /></td>
            <td data-label="Plan">{r.package}{r.includes?.rewrittenResume && <span className="sub">+ rewritten resume</span>}</td>
            <td data-label="Background">{r.kind === "student" ? "Student" : "Pro"} · {r.organization || "–"}<span className="sub">{r.targetRole}</span></td>
            <td data-label="AI">{r.aiScore != null ? <Badge tone={scoreTone(r.aiScore)}>{r.aiScore}</Badge> : r.aiStatus === "failed" ? <Badge tone="bad">Failed</Badge> : <span className="rf-xs">{r.aiStatus || "–"}</span>}</td>
            <td data-label="Human">{r.humanRequested ? <Badge tone="info">Asked</Badge> : <span className="rf-xs">AI only</span>}</td>
            <td data-label="Status">{r.deletedAt ? <Badge tone="bad">🗑️ {dayFmt(r.deletedAt)}</Badge> : <StatusBadge s={r.status} />}</td>
            <td data-label="Reviewer">{r.reviewerName || <span className="rf-xs">–</span>}</td>
            <td data-label="Sent" className="nowrap">{dateFmt(r.createdAt)}</td>
            {isAdmin && <td className="act"><div className="arx-actions"><Btn size="sm" variant="danger" aria-label="Delete review forever" onClick={(e) => { e.stopPropagation(); setDlg({ type: "one", row: r }); }}><Trash size={14} aria-hidden /></Btn></div></td>}
          </tr>
        ))}
      </Table>
      {data && <Pager page={data.page} pages={data.pages} onGo={setPage} />}
      {isAdmin && <BulkBar pick={pick}><Btn size="sm" variant="danger" onClick={() => setDlg({ type: "many" })}><Trash size={14} aria-hidden />Delete forever</Btn></BulkBar>}

      {dlg?.type === "one" && (
        <ConfirmSheet title="Delete this review for good?" message="The AI and human review, the uploaded resume and any rewritten file are removed from storage. This can't be undone." onClose={closeDlg}
          onConfirm={() => run("d", () => adminDeleteRequest(dlg.row.id, giveBack), "Review deleted for good.", () => { closeDlg(); changed(); })}>
          <p className="rlx-note"><b>{dlg.row.user.name || "User"}</b> · {dlg.row.user.email}{dlg.row.file ? ` · ${dlg.row.file}` : ""}</p>
          {!dlg.row.deletedAt && <Check checked={giveBack} onChange={setGiveBack}>Give the member this review back on their plan</Check>}
        </ConfirmSheet>
      )}
      {dlg?.type === "many" && (
        <ConfirmSheet title={`Delete ${plural(pick.picked.size, "review")} for good?`} message="Every picked review and its files are removed permanently. This can't be undone." typeWord="DELETE" onClose={closeDlg}
          onConfirm={() => run("dm", () => adminBulkDeleteRequests({ ids: [...pick.picked], giveBackUse: giveBack }), (o) => `${plural(o.deleted, "review")} deleted for good.`, () => { closeDlg(); changed(); })}>
          {!trash && <Check checked={giveBack} onChange={setGiveBack}>Give each member their review back on their plan</Check>}
        </ConfirmSheet>
      )}
      {dlg?.type === "trash" && (
        <ConfirmSheet title="Empty the trash?" message={`All ${plural(data?.counts?.trash || 0, "review")} members deleted are removed for good, with their files. This can't be undone.`} typeWord="DELETE" confirmLabel="Empty trash" onClose={closeDlg}
          onConfirm={() => run("tr", () => adminBulkDeleteRequests({ trash: true }), (o) => `${plural(o.deleted, "review")} deleted for good.`, () => { closeDlg(); changed(); })} />
      )}
    </div>
  );
}

/* ============================================================ PAYMENTS  (1 call: /purchases, rows + counts + plan list) */
const PAY_FILTERS = [["all", "All"], ["paid", "✅ Paid"], ["unpaid", "⏳ Not paid"], ["expired", "⌛ Expired"], ["revoked", "⛔ Switched off"]];
const Meter = ({ label, used, allowed, unlimited }) => (
  <div><div className="t"><span>{label}</span><span>{unlimited ? `${used} / ∞` : `${used} / ${allowed}`}</span></div><div className={cx("rlx-meter", !unlimited && allowed > 0 && used >= allowed && "full")}><i style={{ width: unlimited ? "100%" : `${allowed ? Math.min(100, (used / allowed) * 100) : 0}%`, opacity: unlimited ? 0.35 : 1 }} /></div></div>
);

function ExtendSheet({ p, onClose, onDone }) {
  const [f, setF] = useState({ addDays: 0, addAi: 0, addHuman: 0, addBuilder: 0, addLinkedin: 0 });
  const [busy, run] = useRun();
  const num = (k, label, hint) => <TextField id={`ex-${k}`} label={label} hint={hint} type="number" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />;
  return (
    <Sheet title="Extend this plan" subtitle={`${p.user.email} · ${p.package.name}. A negative number takes days or credits away.`} onClose={onClose}>
      <form className="rf-form" onSubmit={(e) => { e.preventDefault(); run("x", () => adminUpdatePurchase(p.id, Object.fromEntries(Object.entries(f).map(([k, v]) => [k, Number(v) || 0]))), "Plan updated ✅", onDone); }}>
        {num("addDays", "Add days", p.expiresAt ? `Now valid until ${dayFmt(p.expiresAt)}` : "This plan never expires. Adding days makes it end that many days from now.")}
        <div className="rf-two">
          {!p.ai.unlimited && p.ai.enabled !== false && num("addAi", "Add AI reviews", `Now ${p.ai.used} of ${p.ai.allowed} used`)}
          {num("addHuman", "Add human reviews", p.human.enabled ? `Now ${p.human.used} of ${p.human.allowed} used` : "None yet. Adding some turns human review on.")}
          {num("addBuilder", "Add builder credits", p.builder?.enabled ? `Now ${p.builder.used} of ${p.builder.allowed} used` : "None yet. Adding some opens the resume builder for them.")}
          {num("addLinkedin", "Add LinkedIn reviews", p.linkedin.enabled ? `Now ${p.linkedin.used} of ${p.linkedin.allowed} used` : "None yet. Adding some turns LinkedIn review on.")}
        </div>
        <div className="rf-btns rf-sticky"><Btn type="submit" loading={busy === "x"}>Save</Btn><Btn variant="ghost" onClick={onClose}>Cancel</Btn></div>
      </form>
    </Sheet>
  );
}

function GrantSheet({ packages, onClose, onDone }) {
  const live = packages.filter((p) => p.isActive);
  const [f, setF] = useState({ email: "", packageId: (live[0] || packages[0])?.id || "", extraDays: 0 });
  const [busy, run] = useRun();
  return (
    <Sheet title="Give a plan for free" subtitle="For a gift, a partner, or a payment that didn't go through. They need an account already." onClose={onClose}>
      <form className="rf-form" onSubmit={(e) => { e.preventDefault(); run("g", () => adminGrant({ email: f.email.trim(), packageId: f.packageId, extraDays: Number(f.extraDays) || 0 }), "Plan given 🎁", onDone); }}>
        <TextField id="gr-e" label="Their email" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoFocus />
        <div className="rf-field">
          <label htmlFor="gr-p" className="rv-label"><span>Plan</span></label>
          <select id="gr-p" className="rv-input arx-select" value={f.packageId} onChange={(e) => setF({ ...f, packageId: e.target.value })}>
            {packages.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.terms}{p.isActive ? "" : " (hidden)"}</option>)}
          </select>
        </div>
        <TextField id="gr-d" label="Extra days on top" optional type="number" min={0} value={f.extraDays} onChange={(e) => setF({ ...f, extraDays: e.target.value })} />
        <div className="rf-btns rf-sticky"><Btn type="submit" loading={busy === "g"} disabled={!f.packageId}>Give plan</Btn><Btn variant="ghost" onClick={onClose}>Cancel</Btn></div>
      </form>
    </Sheet>
  );
}

function PaymentSheet({ p, onClose, onChanged, go }) {
  const [busy, run] = useRun();
  const [prompt, promptDialog] = usePrompt();
  const [sub, setSub] = useState(""); // "extend" | "delete"
  const [keep, setKeep] = useState(false);
  const st = PLAN_STATE[p.state] || { label: p.state, tone: "muted" };
  const done = () => { onChanged(); onClose(); };
  const off = async () => { const why = await prompt({ title: "Switch this plan off?", message: "They can't send in new resumes under it until you switch it back on. Only you see the reason.", label: "Reason", confirmLabel: "Switch off", danger: true }); if (why !== null) run("off", () => adminUpdatePurchase(p.id, { revoked: true, reason: why }), "Plan switched off.", done); };
  if (sub === "extend") return <ExtendSheet p={p} onClose={() => setSub("")} onDone={done} />;
  if (sub === "delete") return (
    <ConfirmSheet title="Delete this payment for good?" message={p.payment.status === "paid" && !p.free ? "This is a PAID record. It's removed from Resume Lab permanently. Money is not refunded at the gateway by this." : "The record is removed permanently."} onClose={() => setSub("")}
      onConfirm={() => run("del", () => adminDeletePurchase(p.id, keep), (o) => `Payment deleted for good${o.reviewsDeleted ? `, with ${plural(o.reviewsDeleted, "review")}` : ""}.`, done)}>
      <Check checked={keep} onChange={setKeep}>Keep the reviews sent in under it (otherwise they and their files go too)</Check>
    </ConfirmSheet>
  );
  return (
    <Sheet title="Payment" subtitle={`${p.user.name || "User"} · ${p.user.email}`} onClose={onClose}>
      <div className="rf-receipt">
        <div className="big"><b>{p.free ? "Free" : formatINR(p.payment.amount)}</b><span className="rf-muted">{p.package.name} · {p.package.terms}</span><Badge tone={st.tone}>{st.label}</Badge></div>
        <div className="rlx-use">
          {p.ai.enabled !== false && <Meter label="🤖 AI reviews" used={p.ai.used} allowed={p.ai.allowed} unlimited={p.ai.unlimited} />}
          {p.human.enabled && <Meter label="🙋 Human reviews" used={p.human.used} allowed={p.human.allowed} />}
          {p.builder?.enabled && <Meter label="🧱 Builder credits" used={p.builder.used} allowed={p.builder.allowed} />}
          {p.linkedin.enabled && <Meter label="🔗 LinkedIn reviews" used={p.linkedin.used} allowed={p.linkedin.allowed} />}
        </div>
        <dl className="rf-kv">
          <div><dt>Created</dt><dd>{dateFmt(p.createdAt)}</dd></div>
          {p.payment.paidAt && <div><dt>Paid</dt><dd>{dateFmt(p.payment.paidAt)}</dd></div>}
          <div><dt>Gateway</dt><dd>{p.free ? "Given by an admin" : `${p.payment.gateway || "–"} · ${p.payment.status}`}</dd></div>
          {p.gatewayPaymentId && <div><dt>Payment ID</dt><dd><CopyText value={p.gatewayPaymentId} /></dd></div>}
          {p.gatewayOrderId && <div><dt>Order ID</dt><dd><CopyText value={p.gatewayOrderId} /></dd></div>}
          <div><dt>Valid until</dt><dd>{p.expiresAt ? dayFmt(p.expiresAt) : "Never expires"}</dd></div>
          {p.failureReason && <div><dt>Failure</dt><dd>{p.failureReason}</dd></div>}
          {p.revoked && <div><dt>Switched off</dt><dd>{p.revokeReason || "No reason given"}</dd></div>}
        </dl>
        <div className="rf-btns">
          {p.payment.status === "paid" && <Btn variant="ghost" onClick={() => setSub("extend")}><Plus size={15} weight="bold" aria-hidden />Extend</Btn>}
          {p.payment.status === "paid" && (p.revoked
            ? <Btn variant="ghost" loading={busy === "on"} onClick={() => run("on", () => adminUpdatePurchase(p.id, { revoked: false }), "Switched back on ✅", done)}>Switch back on</Btn>
            : <Btn variant="ghost" loading={busy === "off"} onClick={off}>Switch off</Btn>)}
          <Btn variant="ghost" onClick={() => { onClose(); go("reviews", { filter: "all", search: p.user.email }); }}>📝 Their reviews</Btn>
          <Btn variant="danger" onClick={() => setSub("delete")}><Trash size={15} aria-hidden />Delete forever</Btn>
        </div>
      </div>
      {promptDialog}
    </Sheet>
  );
}

function Payments({ preset, go }) {
  const [filter, setFilter] = useState(preset.filter || "all");
  const [search, setSearch] = useState(preset.search || "");
  const q = useDebounced(search.trim());
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState(null);
  const [dlg, setDlg] = useState(""); // "grant" | "bulk"
  const [keep, setKeep] = useState(false);
  const [, run] = useRun();
  const { data, error, loading, reload } = useLoad(() => adminPurchases({ status: filter, search: q, page }), `${filter}|${q}|${page}|${tick}`);
  const pick = usePick(data?.rows);
  const changed = () => setTick((t) => t + 1);
  const to = (setter) => (v) => { setter(v); setPage(1); };
  return (
    <div>
      <Head title="Payments" sub="Every plan bought, paid or not. Open one to extend it, switch it off or delete it for good."
        actions={<><Refresh loading={loading && Boolean(data)} onClick={reload} /><Btn disabled={!data?.packages?.length} onClick={() => setDlg("grant")}><Plus size={16} weight="bold" aria-hidden />Give a plan</Btn></>} />
      <div className="arx-toolbar">
        <Chips options={PAY_FILTERS} value={filter} onChange={to(setFilter)} counts={data?.counts} />
        <Search value={search} onChange={to(setSearch)} placeholder="Name, email, payment ID, plan" />
      </div>
      <Table cols={[PickHead(pick), "Member", "Plan", "Paid", "Credits used", "Valid until", "State", "Date"]} rows={data?.rows} error={error} loading={loading} empty={["💳", "No payments here."]}>
        {data?.rows.map((p) => { const st = PLAN_STATE[p.state] || { label: p.state, tone: "muted" }; return (
          <tr key={p.id} className={cx("click", pick.picked.has(p.id) && "on")} tabIndex={0} onClick={() => setOpen(p)} onKeyDown={(e) => e.key === "Enter" && setOpen(p)}>
            <PickCell pick={pick} id={p.id} label={`${p.user.email} ${p.package.name}`} />
            <td className="first" data-label="Member"><Who name={p.user.name} email={p.user.email} /></td>
            <td data-label="Plan">{p.package.name}<span className="sub">{p.package.terms}</span></td>
            <td data-label="Paid" className="rf-mono">{p.free ? "Free" : formatINR(p.payment.amount)}<span className="sub">{p.free ? "given by admin" : `${p.payment.gateway || "–"}${p.payment.status !== "paid" ? ` · ${p.payment.status}` : ""}`}</span></td>
            <td data-label="Used"><span className="rlx-credits">{p.ai.enabled !== false && <span>AI <b>{p.ai.used}/{p.ai.unlimited ? "∞" : p.ai.allowed}</b></span>}{p.human.enabled && <span>Human <b>{p.human.used}/{p.human.allowed}</b></span>}{p.builder?.enabled && <span>Build <b>{p.builder.used}/{p.builder.allowed}</b></span>}{p.linkedin.enabled && <span>LI <b>{p.linkedin.used}/{p.linkedin.allowed}</b></span>}</span></td>
            <td data-label="Valid until" className="nowrap">{p.expiresAt ? dayFmt(p.expiresAt) : "Never"}</td>
            <td data-label="State"><Badge tone={st.tone}>{st.label}</Badge></td>
            <td data-label="Date" className="nowrap">{dateFmt(p.payment.paidAt || p.createdAt)}</td>
          </tr>); })}
      </Table>
      {data && <Pager page={data.page} pages={data.pages} onGo={setPage} />}
      <BulkBar pick={pick}><Btn size="sm" variant="danger" onClick={() => setDlg("bulk")}><Trash size={14} aria-hidden />Delete forever</Btn></BulkBar>

      {open && <PaymentSheet p={open} onClose={() => setOpen(null)} onChanged={changed} go={go} />}
      {dlg === "grant" && <GrantSheet packages={data.packages} onClose={() => setDlg("")} onDone={() => { setDlg(""); changed(); }} />}
      {dlg === "bulk" && (
        <ConfirmSheet title={`Delete ${plural(pick.picked.size, "payment")} for good?`} message="The picked payment records are removed permanently. Money is not refunded at the gateway by this." typeWord="DELETE" onClose={() => { setDlg(""); setKeep(false); }}
          onConfirm={() => run("b", () => adminBulkDeletePurchases([...pick.picked], keep), (o) => `${plural(o.deleted, "payment")} deleted${o.reviewsDeleted ? `, with ${plural(o.reviewsDeleted, "review")}` : ""}.`, () => { setDlg(""); setKeep(false); changed(); })}>
          <Check checked={keep} onChange={setKeep}>Keep the reviews sent in under them (otherwise they and their files go too)</Check>
        </ConfirmSheet>
      )}
    </div>
  );
}

/* ============================================================ MEMBERS  (1 call: /members, rows + counts) */
function Members({ preset, go }) {
  const [filter, setFilter] = useState(preset.filter || "all");
  const [search, setSearch] = useState(preset.search || "");
  const q = useDebounced(search.trim());
  const [tick, setTick] = useState(0);
  const [erase, setErase] = useState(null);
  const [busy, run] = useRun();
  const [prompt, promptDialog] = usePrompt();
  const { data, error, loading, reload } = useLoad(() => adminMembers({ search: q, filter }), `${filter}|${q}|${tick}`);
  const changed = () => setTick((t) => t + 1);
  const block = async (m) => { const why = await prompt({ title: `Block ${m.name || m.email}?`, message: "They can't buy plans or send in resumes. They keep reviews they already have, and their Target Trek account is untouched. They see your reason.", label: "Reason", confirmLabel: "Block", danger: true }); if (why !== null) run(`${m.id}b`, () => adminBlock(m.id, why), "Blocked from Resume Lab ⛔", changed); };
  return (
    <div>
      <Head title="Members" sub={q && filter === "all" ? "Search results across every account." : "People who bought a plan or are blocked. Search to find anyone else."} actions={<Refresh loading={loading && Boolean(data)} onClick={reload} />} />
      <div className="arx-toolbar">
        <Chips options={[["all", "All"], ["paying", "💸 Paying"], ["blocked", "⛔ Blocked"]]} value={filter} onChange={setFilter} counts={data?.counts} />
        <Search value={search} onChange={setSearch} placeholder="Name, email, mobile" />
      </div>
      <Table cols={["Member", "Plans", "Paid", "Reviews", "Last sent", "Status", ""]} rows={data?.rows} error={error} loading={loading} empty={["👥", "No members found."]}>
        {data?.rows.map((m) => (
          <tr key={m.id}>
            <td className="first" data-label="Member"><Who name={m.name} email={m.email} sub={`${m.email}${m.mobile ? ` · ${m.mobile}` : ""}`} /></td>
            <td data-label="Plans" className="rf-mono">{m.plans}</td>
            <td data-label="Paid" className="rf-mono">{formatINR(m.paid)}</td>
            <td data-label="Reviews" className="rf-mono">{m.reviews}</td>
            <td data-label="Last sent">{m.lastActive ? dayFmt(m.lastActive) : "–"}</td>
            <td data-label="Status">{m.staff ? <Badge tone="info">Staff</Badge> : m.blocked ? <><Badge tone="bad">Blocked</Badge>{m.blockReason && <span className="sub">{m.blockReason}</span>}</> : <Badge tone="ok">Active</Badge>}</td>
            <td className="act"><div className="arx-actions">
              <Btn size="sm" variant="ghost" onClick={() => go("reviews", { filter: "all", search: m.email })}>📝 Reviews</Btn>
              <Btn size="sm" variant="ghost" onClick={() => go("payments", { search: m.email })}>💳 Plans</Btn>
              {!m.staff && (m.blocked
                ? <Btn size="sm" variant="ghost" loading={busy === `${m.id}u`} onClick={() => run(`${m.id}u`, () => adminUnblock(m.id), "Unblocked ✅", changed)}>Unblock</Btn>
                : <Btn size="sm" variant="ghost" loading={busy === `${m.id}b`} onClick={() => block(m)}>Block</Btn>)}
              <Btn size="sm" variant="danger" aria-label={`Erase all Resume Lab data of ${m.email}`} onClick={() => setErase(m)}><Trash size={14} aria-hidden /></Btn>
            </div></td>
          </tr>
        ))}
      </Table>
      {erase && (
        <ConfirmSheet title={`Erase ${erase.name || erase.email}'s Resume Lab data?`} message="Every review and its files, every plan and payment record, their builder resumes, their resume vault and any block are deleted permanently. Their Target Trek account stays. Money is not refunded by this." typeWord="ERASE" confirmLabel="Erase forever" onClose={() => setErase(null)}
          onConfirm={() => run("er", () => adminEraseMember(erase.id), (o) => `Erased: ${plural(o.reviews, "review")}, ${plural(o.plans, "plan")}, ${plural(o.drafts, "builder resume")}, ${plural(o.files, "vault file")}.`, () => { setErase(null); changed(); })}>
          <p className="rlx-note"><b>{erase.email}</b> · {plural(erase.plans, "plan")} · {plural(erase.reviews, "review")} · {formatINR(erase.paid)} paid</p>
        </ConfirmSheet>
      )}
      {promptDialog}
    </div>
  );
}

/* ============================================================ PLANS  (1 call: /packages) */
const EMPTY_PLAN = { id: null, key: "", name: "", tagline: "", description: "", price: "", compareAt: "", badge: "", aiReviews: 2, humanReviews: 0, linkedinReviews: 0, builderCredits: 0, aiReview: true, validityDays: 0, deliveryHours: 48, sortOrder: 0, isActive: true, resume: true, jobMatch: false, humanReview: false, rewrittenResume: false, features: "" };
const planForm = (p) => ({ id: p.id, key: p.key, name: p.name, tagline: p.tagline || "", description: p.description || "", price: p.price, compareAt: p.compareAt || "", badge: p.badge || "", aiReviews: p.ai.reviews, humanReviews: p.human.configured, linkedinReviews: p.linkedin.reviews, builderCredits: p.builder?.configured || 0, aiReview: p.ai?.enabled !== false, validityDays: p.validityDays, deliveryHours: p.deliveryHours, sortOrder: p.sortOrder, isActive: p.isActive, resume: p.includes.resume, jobMatch: p.includes.jobMatch, rewrittenResume: p.includes.rewrittenResume, humanReview: p.human.switch, features: (p.features || []).join("\n") });
const planBody = (f) => ({
  key: f.key.trim().toLowerCase(), name: f.name, tagline: f.tagline, description: f.description, price: Number(f.price), compareAt: Number(f.compareAt || 0), badge: f.badge,
  aiReviews: Number(f.aiReviews), humanReviews: Number(f.humanReviews), linkedinReviews: Number(f.linkedinReviews), builderCredits: Number(f.builderCredits), validityDays: Number(f.validityDays), deliveryHours: Number(f.deliveryHours), sortOrder: Number(f.sortOrder), isActive: f.isActive,
  includes: { resume: f.resume, linkedin: Number(f.linkedinReviews) > 0, jobMatch: f.jobMatch, humanReview: f.humanReview, rewrittenResume: f.rewrittenResume, aiReview: f.aiReview }, features: lines(f.features),
});
const readsAs = (f) => `${!f.aiReview ? "No AI review" : Number(f.aiReviews) === 0 ? "Unlimited AI reviews" : plural(Number(f.aiReviews), "AI review")}${Number(f.builderCredits) > 0 ? ` + ${plural(Number(f.builderCredits), "resume build")}` : ""}${f.humanReview && Number(f.humanReviews) > 0 ? ` + ${plural(Number(f.humanReviews), "human review")}` : ""}${Number(f.linkedinReviews) > 0 ? ` + ${plural(Number(f.linkedinReviews), "LinkedIn review")}` : ""} · ${Number(f.validityDays) === 0 ? "no expiry" : `valid ${f.validityDays} days`}`;

function PlanSheet({ plan, onClose, onDone }) {
  const [f, setF] = useState(plan ? planForm(plan) : { ...EMPTY_PLAN });
  const [busy, run] = useRun();
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const flip = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  return (
    <Sheet title={plan ? `Edit “${plan.name}”` : "New plan"} subtitle="Changes show on the site straight away. People who already bought keep what they paid for." onClose={onClose} wide>
      <form className="rf-form" onSubmit={(e) => { e.preventDefault(); run("s", () => adminSavePackage(f.id, planBody(f)), "Plan saved ✅", onDone); }}>
        <div className="rf-two">
          <TextField id="pk-name" label="Name" required maxLength={80} value={f.name} onChange={set("name")} />
          <TextField id="pk-key" label="Key (used in links)" required maxLength={40} pattern="[a-zA-Z0-9-]{2,40}" hint="Letters, numbers, dashes" value={f.key} onChange={set("key")} />
          <TextField id="pk-price" label="Price (₹)" required type="number" min={1} step={1} value={f.price} onChange={set("price")} />
          <TextField id="pk-cmp" label="Crossed-out price (₹)" optional type="number" min={0} value={f.compareAt} onChange={set("compareAt")} />
          <TextField id="pk-badge" label="Badge" optional maxLength={30} hint="e.g. Most picked" value={f.badge} onChange={set("badge")} />
          <TextField id="pk-hrs" label="Review within (hours)" type="number" min={1} max={720} value={f.deliveryHours} onChange={set("deliveryHours")} />
        </div>
        <fieldset className="rlx-group"><legend>What the plan gives</legend>
          <Switch checked={f.aiReview} onChange={flip("aiReview")} title="🤖 AI review of an uploaded resume" hint="Off for a builder-only plan: buyers get only the builder credits." />
          <Switch checked={f.humanReview} onChange={flip("humanReview")} title="🙋 Human review" hint="Off = AI only. No human wording is shown to buyers." />
          <div className="rf-two">
            <TextField id="pk-ai" label="AI reviews" type="number" min={0} disabled={!f.aiReview} hint={f.aiReview ? "0 = unlimited. Every resume sent in uses one." : "Off: no AI review."} value={f.aiReview ? f.aiReviews : 0} onChange={set("aiReviews")} />
            <TextField id="pk-hu" label="Human reviews" type="number" min={0} disabled={!f.humanReview} hint="By working professionals." value={f.humanReviews} onChange={set("humanReviews")} />
            <TextField id="pk-bc" label="Resume builder credits" type="number" min={0} max={100000} hint="Each build uses one. 0 = none." value={f.builderCredits} onChange={set("builderCredits")} />
            <TextField id="pk-li" label="LinkedIn reviews" type="number" min={0} max={1000} hint="0 = none. Usually 1." value={f.linkedinReviews} onChange={set("linkedinReviews")} />
            <TextField id="pk-days" label="Valid for (days)" type="number" min={0} max={3650} hint="0 = never expires. Counts from payment." value={f.validityDays} onChange={set("validityDays")} />
            <TextField id="pk-sort" label="Sort order" type="number" min={0} hint="Smaller shows first" value={f.sortOrder} onChange={set("sortOrder")} />
          </div>
          <p className="rlx-reads"><b>Reads as:</b> {readsAs(f)}</p>
        </fieldset>
        <fieldset className="rlx-group"><legend>What each resume review covers</legend>
          <Switch checked={f.resume} onChange={flip("resume")} title="📄 Resume review" hint="The buyer uploads a PDF." />
          <Switch checked={f.jobMatch} onChange={flip("jobMatch")} title="🎯 Job-description match" hint="The buyer must paste a job description." />
          <Switch checked={f.rewrittenResume} onChange={flip("rewrittenResume")} title="✍️ Complete rewritten resume" hint="On human reviews you upload the finished file. Off = comments only." />
        </fieldset>
        <TextField id="pk-tag" label="One-line pitch" optional count={160} value={f.tagline} onChange={set("tagline")} />
        <TextField id="pk-feat" label="What's included (shown as ticks)" optional textarea rows={4} hint="One per line" value={f.features} onChange={set("features")} />
        <Switch checked={f.isActive} onChange={flip("isActive")} title="🌐 Visible on the site" />
        <div className="rf-btns rf-sticky"><Btn type="submit" loading={busy === "s"}>Save plan</Btn><Btn variant="ghost" onClick={onClose}>Cancel</Btn></div>
      </form>
    </Sheet>
  );
}

function Plans() {
  const [tick, setTick] = useState(0);
  const { data: list, error, loading, reload } = useLoad(adminPackages, `plans|${tick}`);
  const [edit, setEdit] = useState(null); // { plan? }
  const [del, setDel] = useState(null);
  const [busy, run] = useRun();
  const changed = () => setTick((t) => t + 1);
  const toggle = (p) => run(p.id, () => adminSavePackage(p.id, planBody({ ...planForm(p), isActive: !p.isActive })), p.isActive ? "Hidden from the site." : "On sale again ✅", changed);
  return (
    <div>
      <Head title="Plans" sub="What you sell: prices, review counts, builder credits and how long they last." actions={<><Refresh loading={loading && Boolean(list)} onClick={reload} /><Btn onClick={() => setEdit({})}><Plus size={16} weight="bold" aria-hidden />New plan</Btn></>} />
      {error && <p role="alert" className="rf-banner bad" style={{ marginBottom: 12 }}>{error}</p>}
      <div className="rlx-plans">
        {!list && !error && [0, 1, 2].map((i) => <Skeleton key={i} h={240} style={{ borderRadius: 18 }} />)}
        {list?.length === 0 && <Empty e="🏷️">No plans yet. Create the first one.</Empty>}
        {list?.map((p) => (
          <article key={p.id} className={cx("rlx-plan", !p.isActive && "off")}>
            <div className="rf-row-between"><h3>{p.name}</h3>{p.isActive ? <Badge tone="ok">On sale</Badge> : <Badge>Hidden</Badge>}</div>
            <div className="price">{formatINR(p.price)}{p.compareAt > 0 && <s>{formatINR(p.compareAt)}</s>}</div>
            <p className="terms">{p.terms}</p>
            <div className="tags">
              {p.includes.resume && <Badge>📄 Resume</Badge>}{p.ai?.enabled === false && <Badge>No AI</Badge>}{p.includes.jobMatch && <Badge>🎯 Job match</Badge>}
              {p.human.enabled ? <Badge tone="info">🙋 Human ×{p.human.reviews}</Badge> : <Badge>AI only</Badge>}{p.human.configured > 0 && !p.human.switch && <Badge tone="warn">Human off</Badge>}
              {p.linkedin.enabled && <Badge tone="info">🔗 LinkedIn ×{p.linkedin.reviews}</Badge>}{p.builder?.configured > 0 && <Badge tone="ok">🧱 Builder ×{p.builder.configured}</Badge>}{p.includes.rewrittenResume && <Badge tone="warn">✍️ Rewrite</Badge>}{p.badge && <Badge tone="info">{p.badge}</Badge>}
            </div>
            <div className="foot">
              <span className="sold">{plural(p.sold, "sale")}</span>
              <Btn size="sm" variant="ghost" onClick={() => setEdit({ plan: p })}>Edit</Btn>
              <Btn size="sm" variant="ghost" loading={busy === p.id} onClick={() => toggle(p)}>{p.isActive ? "Hide" : "Show"}</Btn>
              <Btn size="sm" variant="danger" aria-label={`Delete ${p.name}`} onClick={() => setDel(p)}><Trash size={14} aria-hidden /></Btn>
            </div>
          </article>
        ))}
      </div>
      {edit && <PlanSheet plan={edit.plan} onClose={() => setEdit(null)} onDone={() => { setEdit(null); changed(); }} />}
      {del && (
        <Sheet title={`Delete “${del.name}”?`} subtitle={del.sold > 0 ? `${plural(del.sold, "person", "people")} bought it. Every purchase keeps its own copy of the plan, so their credits keep working either way.` : "Nobody has bought it, so it can go for good."} onClose={() => setDel(null)} compact>
          <div className="rf-btns">
            {del.sold > 0 && del.isActive && <Btn variant="ghost" loading={busy === "hide"} onClick={() => run("hide", () => adminDeletePackage(del.id), "Hidden from the site.", () => { setDel(null); changed(); })}>Just hide it</Btn>}
            <Btn variant="danger" loading={busy === "force"} onClick={() => run("force", () => adminDeletePackage(del.id, true), "Plan deleted for good.", () => { setDel(null); changed(); })}><Trash size={15} aria-hidden />Delete forever</Btn>
            <Btn variant="ghost" onClick={() => setDel(null)}>Cancel</Btn>
          </div>
        </Sheet>
      )}
    </div>
  );
}

/* ============================================================ RESUME BUILDER  (1 call: /builder, the switch + every question) */
const BQ = { open: ["Unanswered", "muted"], have: ["Yes", "ok"], none: ["No / skipped", "bad"] };
const PHASE = { reading: ["Reading", "info"], questions: ["Waiting for answers", "warn"], writing: ["Writing", "info"], ready: ["Written", "ok"], failed: ["Failed", "bad"], scratch: ["By hand", "muted"] };

function Builder() {
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState(null);
  const [del, setDel] = useState(null);
  const [busy, run] = useRun();
  const { data, error, loading, reload, setData } = useLoad(() => adminBuilder({ search: q, filter, page }), `${q}|${filter}|${page}|${tick}`);
  const s = data?.settings;
  const to = (setter) => (v) => { setter(v); setPage(1); };
  const pickMode = (mode) => { if (!s || mode === s.mode || busy) return; run(mode, () => adminSaveBuilderSettings(mode), mode === "on" ? "Resume builder is on." : mode === "existing" ? "Resume builder is off for new members." : "Resume builder is off.", () => setData((d) => ({ ...d, settings: { ...d.settings, mode } }))); };
  return (
    <div>
      <Head title="Resume builder" sub="Switch the AI resume builder on or off, and see every question it asked and what people answered." actions={<Refresh loading={loading && Boolean(data)} onClick={reload} />} />
      {error && <p role="alert" className="rf-banner bad" style={{ marginBottom: 12 }}>{error}</p>}
      <section className="arx-card" aria-labelledby="bs-h"><h3 id="bs-h">🔌 The switch</h3>
        {!s ? <Skeleton h={130} /> : (
          <>
            <div className="rlx-modes" role="radiogroup" aria-label="Resume builder">
              {Object.entries(MODES).map(([k, [label, text]]) => (
                <button key={k} type="button" role="radio" aria-checked={s.mode === k} disabled={Boolean(busy)} className="rlx-mode" onClick={() => pickMode(k)}>
                  <b>{label}{s.mode === k && <Badge tone="ok">Current</Badge>}{busy === k && <span className="rv-spin" aria-hidden style={{ width: 14, height: 14 }} />}</b>
                  <span>{text}</span>
                </button>
              ))}
            </div>
            <p className="rf-xs">{plural(s.holders, "member")} still hold unused builder credits · {plural(s.drafts, "resume")} built so far. Add builder credits to any plan under Plans.</p>
          </>
        )}
      </section>

      {data?.top?.length > 0 && (
        <section className="arx-sec"><h2>🔥 Most asked</h2>
          <div className="rlx-tags">{data.top.map((t) => <span key={`${t.kind}-${t.keyword}`} className="rlx-tag" title={`${t.yes} yes, ${t.no} no, ${t.open} unanswered`}>{t.keyword}<em>×{t.asked} · {t.yes} yes</em></span>)}</div>
        </section>
      )}

      <section className="arx-sec"><h2>💬 Every question asked</h2>
        <div className="arx-toolbar">
          <Chips options={[["all", "All"], ["open", "⏳ Has unanswered"], ["answered", "✅ Answered"]]} value={filter} onChange={to(setFilter)} />
          <Search value={search} onChange={to(setSearch)} placeholder="Skill, role, name, email" />
        </div>
        <Table cols={["Member", "Resume", "Questions", "State", "Updated", ""]} rows={data?.items} error="" loading={loading} empty={["💬", "No builder questions yet."]}>
          {data?.items.map((d) => {
            const yes = d.questions.filter((x) => x.status === "have").length;
            const no = d.questions.filter((x) => x.status === "none").length;
            const [pl, pt] = PHASE[d.phase] || [d.phase, "muted"];
            return (
              <Fragment key={d.id}>
                <tr className="click" tabIndex={0} aria-expanded={open === d.id} onClick={() => setOpen(open === d.id ? null : d.id)} onKeyDown={(e) => e.key === "Enter" && setOpen(open === d.id ? null : d.id)}>
                  <td className="first" data-label="Member"><Who name={d.user.name} email={d.user.email} /></td>
                  <td data-label="Resume"><b>{d.jobTitle || d.targetRole || d.title}</b><span className="sub">{d.kind === "student" ? "Student / fresher" : "Professional"}</span></td>
                  <td data-label="Questions" className="rf-mono">{d.questions.length}<span className="sub">{yes} yes · {no} no · {d.questions.length - yes - no} open</span></td>
                  <td data-label="State"><Badge tone={pt}>{pl}</Badge></td>
                  <td data-label="Updated" className="nowrap">{dateFmt(d.updatedAt)}</td>
                  <td className="act"><div className="arx-actions"><Btn size="sm" variant="danger" aria-label="Delete this builder resume forever" onClick={(e) => { e.stopPropagation(); setDel(d); }}><Trash size={14} aria-hidden /></Btn></div></td>
                </tr>
                {open === d.id && (
                  <tr className="expand"><td colSpan={6}>
                    <div className="rlx-qs">
                      {d.error && <p className="rf-banner bad">{d.error}</p>}
                      {d.questions.map((x) => (
                        <div key={x.id}>
                          <div className="h"><b>{x.keyword}</b><Badge>{x.kind === "info" ? "Basics" : x.importance === "must" ? "Required" : "Nice to have"}</Badge><Badge tone={BQ[x.status]?.[1]}>{BQ[x.status]?.[0] || x.status}</Badge></div>
                          <span className="rf-muted">{x.question}</span>
                          {x.detail && <span style={{ fontSize: 14 }}>Answer: <em>{x.detail}</em></span>}
                        </div>
                      ))}
                      {d.details && <p className="rf-xs">Notes from the member: {d.details}</p>}
                      {d.jobDescription && <details><summary className="rf-xs" style={{ cursor: "pointer" }}>Job description they pasted</summary><p className="rf-xs" style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{d.jobDescription}</p></details>}
                    </div>
                  </td></tr>
                )}
              </Fragment>
            );
          })}
        </Table>
        {data && <Pager page={data.page} pages={data.pages} onGo={setPage} />}
      </section>
      {del && (
        <ConfirmSheet title="Delete this builder resume for good?" message={`${d2(del)} is removed permanently, with its answers. If it was never written, the member gets the builder credit back. This can't be undone.`} onClose={() => setDel(null)}
          onConfirm={() => run("dd", () => adminDeleteDraft(del.id), (o) => `Deleted for good${o.refunded ? ". The credit went back to the member" : ""}.`, () => { setDel(null); setTick((t) => t + 1); })} />
      )}
    </div>
  );
}
const d2 = (d) => `“${d.jobTitle || d.targetRole || d.title}” by ${d.user.name || d.user.email}`;

/* ============================================================ AI MODEL  (1 call: /ai-settings) */
const usd = (n) => (n == null ? "" : `$${n < 1 ? n.toFixed(3) : n.toFixed(2)}`);

function AiModel() {
  const [tick, setTick] = useState(0);
  const { data, error } = useLoad(adminAiSettings, `ai|${tick}`);
  const [sel, setSel] = useState(null); // { provider, model }
  const [custom, setCustom] = useState({});
  const [result, setResult] = useState(null);
  const [busy, run] = useRun();
  useEffect(() => { if (data) setSel((s) => s || { provider: data.active.provider, model: data.active.model }); }, [data]);

  if (error) return <div><Head title="AI model" /><p role="alert" className="rf-banner bad">{error}</p></div>;
  if (!data || !sel) return <div><Head title="AI model" sub="Which provider and model writes the AI reviews." /><div className="arx-desk"><Skeleton h={110} style={{ borderRadius: 16 }} /><Skeleton h={260} style={{ borderRadius: 16 }} /></div></div>;

  const inCatalog = (p, m) => data.providers.find((x) => x.id === p)?.models.some((x) => x.id === m);
  const pick = (provider, model) => { setSel({ provider, model }); setResult(null); };
  const selP = data.providers.find((x) => x.id === sel.provider);
  const chosen = `${selP?.label || sel.provider} · ${selP?.models.find((x) => x.id === sel.model)?.label || sel.model}`;
  const changed = sel.provider !== data.active.provider || sel.model !== data.active.model || data.active.source === "default";
  const body = { provider: sel.provider, model: sel.model.trim() };
  const ready = body.model.length >= 2 && selP?.configured;
  const activeP = data.providers.find((x) => x.id === data.active.provider);
  const activeM = activeP?.models.find((x) => x.id === data.active.model);
  const fellBack = data.saved && (data.saved.provider !== data.active.provider || data.saved.model !== data.active.model);
  const test = async () => { setResult(null); const r = await run("test", () => adminTestAiModel(body)); setResult(r || { ok: false, message: "The test call failed." }); };

  return (
    <div>
      <Head title="AI model" sub="Which provider and model writes every new AI review and every re-run. Reviews already written keep the model that wrote them." />
      <div className="arx-desk">
        <section className="arx-card"><h3>⚡ In use right now</h3>
          <div className="rlx-now"><Brain size={26} weight="duotone" aria-hidden /><b>{activeP?.label} · {activeM?.label || data.active.model}</b>{data.active.source === "admin" ? <Badge tone="ok">Your choice</Badge> : <Badge>Default</Badge>}</div>
          {data.active.source === "default" && !data.saved && <p className="rf-muted">Nothing has been chosen yet, so the server's default is used.</p>}
          {fellBack && <p role="alert" className="rf-banner bad">You chose {data.saved.model}, but that provider has no API key on the server right now, so the default is being used.</p>}
        </section>

        {data.providers.map((p) => {
          const here = sel.provider === p.id;
          const customOn = here && !inCatalog(p.id, sel.model);
          return (
            <section key={p.id} className="arx-card" aria-labelledby={`ai-${p.id}`}>
              <div className="rf-row-between"><h3 id={`ai-${p.id}`} style={{ margin: 0 }}>{p.label}</h3>{p.configured ? <Badge tone="ok">API key found</Badge> : <Badge tone="warn">No key yet</Badge>}</div>
              {!p.configured && <p className="rf-muted">To use {p.label}, add <code className="rf-mono">{p.envKey}</code> to the server settings and restart.</p>}
              <div className="rv-mdl-list" role="radiogroup" aria-label={`${p.label} models`}>
                {p.models.map((m) => {
                  const on = here && sel.model === m.id;
                  return (
                    <label key={m.id} className={cx("rv-mdl-row", on && "on", !p.configured && "dis")}>
                      <input type="radio" name="ai-model" checked={on} disabled={!p.configured} onChange={() => pick(p.id, m.id)} />
                      <span className="rv-mdl-main">
                        <span className="rv-mdl-name"><b>{m.label}</b>{m.reasoning && <Badge>Thinks first</Badge>}{data.active.provider === p.id && data.active.model === m.id && <Badge tone="ok">In use</Badge>}</span>
                        <span className="rf-xs">{m.note}</span>
                        <span className="rf-xs rf-mono">{m.id}</span>
                      </span>
                      <span className="rv-mdl-cost">{m.costInr != null ? <><b>about ₹{m.costInr < 10 ? m.costInr.toFixed(1) : Math.round(m.costInr)}</b><span className="rf-xs">per review ({usd(m.costUsd)})</span></> : <span className="rf-xs">See {p.label} pricing</span>}</span>
                    </label>
                  );
                })}
                <label className={cx("rv-mdl-row", customOn && "on", !p.configured && "dis")}>
                  <input type="radio" name="ai-model" checked={customOn} disabled={!p.configured} onChange={() => { const v = (custom[p.id] || "").trim(); if (v) pick(p.id, v); }} />
                  <span className="rv-mdl-main">
                    <span className="rv-mdl-name"><b>Another {p.label} model</b></span>
                    <span className="rf-xs">A newer model that isn't listed. Type its exact id.</span>
                    <input className="rv-input" style={{ marginTop: 6 }} disabled={!p.configured} placeholder="model id" maxLength={100} aria-label={`Custom ${p.label} model id`} value={customOn ? sel.model : custom[p.id] || ""} onChange={(e) => { const v = e.target.value; setCustom((c) => ({ ...c, [p.id]: v })); pick(p.id, v); }} />
                  </span>
                </label>
              </div>
            </section>
          );
        })}

        <div className="rv-sendbar" role="group" aria-label="Save the model">
          <div style={{ minWidth: 0 }}>
            <b>{chosen}</b>
            {result ? <p role="status" className={cx("rf-xs")} style={{ marginTop: 4, color: result.ok ? "var(--rv-ok)" : "var(--rv-bad)" }}>{result.ok ? `Works. Answered in ${(result.ms / 1000).toFixed(1)}s.` : result.message}</p> : <p className="rf-xs" style={{ marginTop: 4 }}>Test it first: one tiny real call, a fraction of a rupee.</p>}
          </div>
          <div className="rf-btns">
            <Btn variant="ghost" loading={busy === "test"} disabled={!ready || Boolean(busy)} onClick={test}>Test model</Btn>
            <Btn loading={busy === "save"} disabled={!ready || !changed || Boolean(busy)} onClick={() => run("save", () => adminSaveAiSettings(body), "Saved. New reviews use this model.", () => { setResult(null); setSel(null); setTick((t) => t + 1); })}>Use this model</Btn>
          </div>
        </div>

        <p className="rf-xs">The ₹ guide assumes a typical review (about 8,000 tokens read, 4,500 written) at the provider's list price and ₹{data.usdToInr} per US dollar. Prices change, so confirm on the provider's pricing page.</p>
        {data.history.length > 0 && (
          <section className="arx-card"><h3>🕒 Recent changes</h3>
            <ul className="rlx-hist">{data.history.map((h, i) => <li key={i}><b>{h.toModel}</b> ({h.toProvider}) replaced {h.fromModel} · {h.byName || "an admin"} · {dateFmt(h.at)}</li>)}</ul>
          </section>
        )}
      </div>
    </div>
  );
}

/* ============================================================ the page */
const NAV = (isAdmin) => [
  ["Work", [["overview", "📊", "Overview"], ["reviews", "📝", "Reviews"]]],
  ...(isAdmin ? [
    ["Money", [["payments", "💳", "Payments"], ["members", "👥", "Members"]]],
    ["Setup", [["plans", "🏷️", "Plans"], ["builder", "🧱", "Resume builder"], ["ai", "🧠", "AI model"]]],
  ] : []),
];
const TAB_KEY = "rlx-tab";

export default function AdminResumeReviews() {
  const role = useSelector((s) => s.auth?.user?.role);
  const isAdmin = role === "admin";
  const staff = isAdmin || role === "Employee";
  const groups = NAV(isAdmin);
  const all = groups.flatMap(([, t]) => t);
  const [tab, setTab] = useState(() => { try { return sessionStorage.getItem(TAB_KEY) || "overview"; } catch { return "overview"; } });
  const cur = all.some(([k]) => k === tab) ? tab : "overview";
  const [preset, setPreset] = useState({ n: 0 }); // filter / search / open handed to a tab when another tab sends you there
  const [counts, setCounts] = useState({});
  const onCounts = useCallback((c) => setCounts((x) => ({ ...x, ...c })), []);
  const go = useCallback((t, opts = {}) => {
    setTab(t); setPreset((p) => ({ ...opts, n: p.n + 1 }));
    try { sessionStorage.setItem(TAB_KEY, t); } catch { /* private mode */ }
    window.scrollTo({ top: 0 });
  }, []);
  const badge = (k) => (k === "reviews" ? counts.awaiting : 0) || 0;
  const brand = <Link to="/dashboard" className="arx-brand"><span className="rf-logo" aria-hidden>📄</span><div><b>Resume Lab</b><small>{isAdmin ? "Admin console" : "Reviewer desk"}</small></div></Link>;

  return (
    <Page title="Resume Lab | Admin" top={false} className="arx rlx">
      <div className="arx-layout">
        <aside className="arx-side" aria-label="Resume Lab admin">
          {brand}
          {groups.map(([g, items]) => (
            <nav key={g} className="arx-nav" aria-label={g}><span>{g}</span>
              {items.map(([k, e, l]) => <button key={k} type="button" aria-current={cur === k ? "page" : undefined} onClick={() => go(k)}><span className="e" aria-hidden>{e}</span>{l}{badge(k) > 0 && <em>{badge(k)}</em>}</button>)}
            </nav>
          ))}
          <div className="arx-foot"><Link to="/dashboard"><House size={16} weight="fill" aria-hidden />Admin home</Link><a href="/resume-review/app" target="_blank" rel="noopener">📄 Open the member app</a><a href="/resume-review" target="_blank" rel="noopener">🌐 Public page</a></div>
        </aside>
        <main className="arx-main">
          <div className="arx-top">{brand}<Link to="/dashboard" className="rf-iconbtn" aria-label="Admin home"><House size={18} weight="fill" aria-hidden /></Link></div>
          {staff && <nav className="arx-tabs" aria-label="Sections">{all.map(([k, e, l]) => <button key={k} type="button" aria-current={cur === k ? "page" : undefined} onClick={() => go(k)}><span aria-hidden>{e}</span>{l}{badge(k) > 0 && <em>{badge(k)}</em>}</button>)}</nav>}
          {!staff ? <Empty e="🔒">This page is for Resume Lab reviewers and admins.</Empty> : (
            <Fragment key={`${cur}-${preset.n}`}>
              {cur === "overview" && <Overview isAdmin={isAdmin} go={go} onCounts={onCounts} />}
              {cur === "reviews" && <Reviews isAdmin={isAdmin} role={role} preset={preset} onCounts={onCounts} />}
              {cur === "payments" && <Payments preset={preset} go={go} />}
              {cur === "members" && <Members preset={preset} go={go} />}
              {cur === "plans" && <Plans />}
              {cur === "builder" && <Builder />}
              {cur === "ai" && <AiModel />}
            </Fragment>
          )}
        </main>
      </div>
    </Page>
  );
}
