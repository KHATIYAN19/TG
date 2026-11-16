import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowSquareOut, CaretLeft, CaretRight, FileText, LinkedinLogo, MagnifyingGlass, Plus, Trash, UploadSimple } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import {
  PLAN_STATE, STATUS, adminBlock, adminClaim, adminDeletePackage, adminDeletePurchase, adminDeleteRequest, adminGet, adminGrant, adminList, adminMembers, adminPackages,
  adminPurchases, adminRerunAi, adminSavePackage, adminSaveReview, adminStats, adminUnblock, adminUpdatePurchase, dateFmt, dayFmt, formatINR, uploadDocument,
} from "../resume/api";
import { AiReport } from "../resume/ResumeDetail";
import { Btn, Field, FormattedText, Modal, Page, Pill, Skeleton, cx } from "../resume/ui";

/*
  RESUME LAB: admin and reviewer screen.
    Reviews   every resume sent in, what the AI said, and the human review (comments + an optional rewritten resume file)
    Payments  every plan bought: extend, add reviews, switch off, delete, or give a plan for free
    Members   who is using it, and blocking someone from using it
    Plans     prices, bundles, how many reviews and for how many days (admin only)
  Reviewers (admin now, Employee accounts later) only see Reviews.
*/
const lines = (v) => String(v || "").split("\n").map((s) => s.trim()).filter(Boolean);

const Pager = ({ page, pages, setPage }) => pages > 1 && (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 }}>
    <Btn variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><CaretLeft size={14} weight="bold" aria-hidden />Prev</Btn>
    <span className="rv-sm rv-mono">{page} / {pages}</span>
    <Btn variant="ghost" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next<CaretRight size={14} weight="bold" aria-hidden /></Btn>
  </div>
);

const Chips = ({ options, value, onChange }) => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="group" aria-label="Filter">
    {options.map(([k, label]) => <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)} className={cx("rv-pill", value === k && "dark")} style={{ cursor: "pointer", padding: "6px 14px", fontSize: 13 }}>{label}</button>)}
  </div>
);

const SearchBox = ({ value, onChange, placeholder }) => (
  <div style={{ position: "relative", width: "100%", maxWidth: 280 }}>
    <MagnifyingGlass size={16} aria-hidden style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--rv-subtle)" }} />
    <input className="rv-input" style={{ padding: "9px 12px 9px 36px", fontSize: 15 }} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder} />
  </div>
);

const useDebounced = (v, ms = 350) => { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]); return d; };

/* ============================ review one submission ============================ */
function ReviewDesk({ id, role, onBack, onChanged }) {
  const me = useSelector((s) => s.auth?.user);
  const isAdmin = role === "admin";
  const [r, setR] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState("");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(undefined); // undefined = unchanged, null = remove, {key, filename, size} = a new file
  const [uploading, setUploading] = useState(false);
  const [rawOpen, setRawOpen] = useState(false);
  const fileInput = useRef(null);

  const load = useCallback(async () => {
    try {
      const d = await adminGet(id);
      setR(d);
      const h = d.human || {};
      setFile(undefined);
      setForm({ score: h.score ?? "", summary: h.summary || "", detailedFeedback: h.detailedFeedback || "", strengths: (h.strengths || []).join("\n"), improvements: (h.improvements || []).join("\n"), linkedinFeedback: h.linkedinFeedback || "", jobMatchFeedback: h.jobMatchFeedback || "", nextSteps: h.nextSteps || "", internalNotes: h.internalNotes || "" });
    } catch (e) { toast.error(errMsg(e)); onBack(); }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);

  if (!r || !form) return <div style={{ display: "grid", gap: 16 }}><Skeleton h={30} style={{ width: "33%" }} /><Skeleton h={300} /></div>;

  const mine = r.human.reviewer && String(r.human.reviewer) === String(me?._id || me?.id);
  const canEdit = r.humanRequested && ["in_review", "completed"].includes(r.status) && (isAdmin || mine);
  const canTake = r.humanRequested && (["awaiting_review", "ai_reviewing"].includes(r.status) || (isAdmin && r.status === "in_review" && !mine));
  const inc = r.package.includes || {};
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const existing = file === undefined ? r.human.deliverable : file;

  const run = async (name, fn, ok) => {
    setBusy(name);
    try { await fn(); if (ok) toast.success(ok); await load(); onChanged(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(""); }
  };
  const payload = (complete) => ({
    score: form.score === "" ? null : Number(form.score), summary: form.summary, detailedFeedback: form.detailedFeedback, strengths: lines(form.strengths), improvements: lines(form.improvements),
    linkedinFeedback: form.linkedinFeedback, jobMatchFeedback: form.jobMatchFeedback, nextSteps: form.nextSteps, internalNotes: form.internalNotes,
    ...(file === null ? { deliverable: null } : file ? { deliverable: { key: file.key, filename: file.filename } } : {}), complete,
  });
  const deliver = () => {
    if (!window.confirm(`Deliver this review to ${r.user.name || "the user"}? They'll be emailed and see it right away.`)) return;
    run("deliver", () => adminSaveReview(id, payload(true)), "Delivered. The user was emailed.");
  };
  const upload = async (f) => {
    setUploading(true);
    try { setFile(await uploadDocument(f)); } catch (e) { toast.error(errMsg(e)); } finally { setUploading(false); }
  };
  const remove = async () => {
    if (!window.confirm("Delete this submission and its files for good?")) return;
    const give = window.confirm("Give the user this review back on their plan?\n\nOK = yes, give it back. Cancel = no.");
    try { await adminDeleteRequest(id, give); toast.success("Deleted."); onChanged(); onBack(); } catch (e) { toast.error(errMsg(e)); }
  };

  /* a long-text field with a "how it will look" preview */
  const long = ({ k, label, rows = 5, hint, mono = true }) => (
    <Field key={k} label={label} htmlFor={`rv-${k}`} hint={hint}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 6 }}><button type="button" className="rv-link" style={{ fontSize: 13 }} onClick={() => setPreview(preview === k ? "" : k)}>{preview === k ? "Edit" : "Preview"}</button></div>
      {preview === k
        ? <div className="rv-note" style={{ minHeight: 120 }}>{form[k].trim() ? <FormattedText text={form[k]} /> : <span className="rv-subtle">Nothing to preview yet.</span>}</div>
        : <textarea id={`rv-${k}`} rows={rows} className={cx("rv-input", mono && "rv-mono-area")} value={form[k]} onChange={set(k)} />}
    </Field>
  );

  return (
    <div>
      <button type="button" onClick={onBack} className="rv-link" style={{ textDecoration: "none", marginBottom: 20 }}><ArrowLeft size={14} weight="bold" aria-hidden />All reviews</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Pill className={STATUS[r.status]?.tone}>{STATUS[r.status]?.label}</Pill><Pill>{r.package.name}</Pill>{r.humanRequested ? <Pill className="dark">Human review asked</Pill> : <Pill>AI only</Pill>}{inc.rewrittenResume && <Pill className="dark">Includes rewritten resume</Pill>}</div>
          <h1 className="rv-h2" style={{ marginTop: 12, fontSize: 30 }}>{r.user.name || "User"}</h1>
          <p className="rv-muted rv-sm" style={{ marginTop: 4 }}>{r.user.email}{r.user.mobile && ` · ${r.user.mobile}`} · sent {dateFmt(r.createdAt)}</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {canTake && <Btn loading={busy === "claim"} onClick={() => run("claim", () => adminClaim(id), "It's yours now.")}>{r.status === "in_review" ? "Take over" : "Take this review"}</Btn>}
          {isAdmin && <Btn variant="ghost" loading={busy === "ai"} onClick={() => run("ai", async () => { const o = await adminRerunAi(id); if (o.aiStatus === "failed") throw new Error(o.error || "The AI failed again."); }, "AI review refreshed.")}>Re-run AI</Btn>}
          {isAdmin && <Btn variant="danger" onClick={remove}><Trash size={15} aria-hidden />Delete</Btn>}
        </div>
      </div>

      <div style={{ display: "grid", gap: 32, gridTemplateColumns: "minmax(0,1fr)" }} className="rv-desk">
        <style>{`@media (min-width: 1180px) { .rv-desk { grid-template-columns: minmax(0,1fr) minmax(0,1fr) !important; } .rv-desk-sticky { position: sticky; top: 16px; } }`}</style>

        {/* left: what they sent + the AI */}
        <div style={{ minWidth: 0, display: "grid", gap: 24, alignContent: "start" }}>
          <section className="rv-card rv-card-pad" style={{ display: "grid", gap: 18 }}>
            <h2 className="rv-h3">Submission</h2>
            <dl style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }} className="rv-sm">
              {[["Type", r.profile.kind === "student" ? "Student" : "Working professional"], [r.profile.kind === "student" ? "College" : "Company", r.profile.organization], r.profile.kind === "professional" && ["Role", `${r.profile.currentRole} · ${r.profile.experienceYears} yr`], r.profile.course && ["Course", r.profile.course], ["Target role", r.profile.targetRole]].filter(Boolean).map(([k, v]) => <div key={k}><dt className="rv-xs rv-subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{k}</dt><dd style={{ marginTop: 4, fontWeight: 600 }}>{v}</dd></div>)}
            </dl>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {r.resumeUrl && <Btn as="a" href={r.resumeUrl} target="_blank" rel="noopener noreferrer" size="sm"><FileText size={15} aria-hidden />Open resume ({r.resume.filename})<ArrowSquareOut size={13} aria-hidden /></Btn>}
              {r.linkedinUrl && <Btn as="a" href={r.linkedinUrl} target="_blank" rel="noopener noreferrer nofollow" variant="ghost" size="sm"><LinkedinLogo size={15} weight="fill" aria-hidden />Open LinkedIn<ArrowSquareOut size={13} aria-hidden /></Btn>}
            </div>
            {r.notes && <div className="rv-note"><b>They asked:</b> {r.notes}</div>}
            {r.jobDescription && <details className="rv-note"><summary style={{ cursor: "pointer", fontWeight: 600 }}>Job description ({r.jobDescription.length} characters)</summary><p style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>{r.jobDescription}</p></details>}
            {r.plan && <p className="rv-xs rv-subtle">Plan: {r.plan.package.terms} · AI {r.plan.ai.unlimited ? "unlimited" : `${r.plan.ai.used} of ${r.plan.ai.allowed} used`}{r.plan.human.enabled && ` · human ${r.plan.human.used} of ${r.plan.human.allowed} used`} · {r.plan.payment.gateway === "admin" ? "given free" : `paid ${formatINR(r.plan.payment.amount)}`}</p>}
          </section>
          <AiReport ai={r.ai} includes={inc} />
          {r.ai.error && <p className="rv-hint">AI error: {r.ai.error}</p>}
          {r.ai.result && <div><button type="button" className="rv-link" onClick={() => setRawOpen(!rawOpen)}>{rawOpen ? "Hide" : "Show"} the AI's raw reply</button>{rawOpen && <pre className="rv-note rv-mono" style={{ marginTop: 12, whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 12, maxHeight: 420, overflow: "auto" }}>{JSON.stringify(r.ai.result, null, 2)}</pre>}</div>}
        </div>

        {/* right: the human review */}
        <section className="rv-card rv-card-pad rv-desk-sticky" style={{ height: "fit-content", display: "grid", gap: 20, borderColor: canEdit ? "var(--rv-text)" : undefined }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}><h2 className="rv-h3">Your review</h2>{r.human.reviewerName && <Pill>{r.human.reviewerName}</Pill>}</div>
          {!canEdit && <p className="rv-note">{r.humanRequested ? "Take this review to start writing. Only the reviewer who took it (or an admin) can edit." : "The person didn't ask for a human review on this resume, so there is nothing to write. They can still ask for one later if they have human reviews left."}</p>}
          <fieldset disabled={!canEdit} style={{ border: 0, margin: 0, padding: 0, display: "grid", gap: 20, opacity: canEdit ? 1 : 0.55 }}>
            <Field label="Overall score (0-100)" htmlFor="rv-score"><input id="rv-score" type="number" min="0" max="100" className="rv-input" style={{ width: 120 }} value={form.score} onChange={set("score")} /></Field>
            {long({ k: "summary", label: "Summary for the person", rows: 4, mono: false, hint: "Plain words, as if talking to them. This is the first thing they read." })}
            {long({ k: "detailedFeedback", label: "Detailed feedback", rows: 14, hint: "Type it the way you want it to look. Blank line = new paragraph. “- ” starts a bullet. “## ” makes a heading. **text** is bold." })}
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <Field label="Strengths" htmlFor="rv-str" hint="One per line"><textarea id="rv-str" rows={5} className="rv-input" value={form.strengths} onChange={set("strengths")} /></Field>
              <Field label="What to change" htmlFor="rv-imp" hint="One per line"><textarea id="rv-imp" rows={5} className="rv-input" value={form.improvements} onChange={set("improvements")} /></Field>
            </div>
            {inc.linkedin && long({ k: "linkedinFeedback", label: "LinkedIn feedback", rows: 5 })}
            {(inc.jobMatch || r.jobDescription) && long({ k: "jobMatchFeedback", label: "Tailoring to their job", rows: 5 })}
            {long({ k: "nextSteps", label: "Next steps", rows: 4 })}

            <div>
              <span className="rv-label">Rewritten resume {inc.rewrittenResume ? <span className="rv-pill dark" style={{ marginLeft: 6 }}>Required for this plan</span> : <span className="rv-subtle" style={{ fontWeight: 500 }}>· optional</span>}</span>
              {existing ? (
                <div className="rv-note" style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
                  <span style={{ minWidth: 0, wordBreak: "break-all" }}><FileText size={16} aria-hidden style={{ verticalAlign: "-3px", marginRight: 6 }} />{existing.filename}{file && <Pill className="warn" style={{ marginLeft: 8 }}>Not saved yet</Pill>}</span>
                  <span style={{ display: "flex", gap: 8 }}>{file === undefined && r.deliverableUrl && <Btn as="a" href={r.deliverableUrl} target="_blank" rel="noopener noreferrer" variant="ghost" size="sm">Open</Btn>}<Btn variant="danger" size="sm" onClick={() => setFile(null)}>Remove</Btn></span>
                </div>
              ) : (
                <>
                  <input ref={fileInput} type="file" accept=".pdf,.doc,.docx,application/pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
                  <Btn variant="ghost" loading={uploading} onClick={() => fileInput.current?.click()}><UploadSimple size={16} weight="bold" aria-hidden />Upload PDF or Word file</Btn>
                  <p className="rv-hint">The person downloads it from their review page once you deliver.</p>
                </>
              )}
            </div>
            <Field label="Internal notes" htmlFor="rv-int" hint="Only reviewers and admins see this."><textarea id="rv-int" rows={2} className="rv-input" value={form.internalNotes} onChange={set("internalNotes")} /></Field>
          </fieldset>
          {canEdit && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 20, borderTop: "1px solid var(--rv-border)" }}>
              <Btn variant="ghost" loading={busy === "save"} disabled={uploading} onClick={() => run("save", () => adminSaveReview(id, payload(false)), "Draft saved.")}>Save draft</Btn>
              {r.status !== "completed" ? <Btn loading={busy === "deliver"} disabled={uploading} onClick={deliver}>Deliver to user</Btn> : <Btn loading={busy === "save2"} disabled={uploading} onClick={() => run("save2", () => adminSaveReview(id, payload(true)), "Updated.")}>Update delivered review</Btn>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ============================ reviews queue ============================ */
const FILTERS = [["all", "All"], ["awaiting_review", "Waiting"], ["in_review", "In review"], ["ai_reviewing", "AI running"], ["completed", "Delivered"]];

function Queue({ onOpen, refreshKey }) {
  const [filter, setFilter] = useState("awaiting_review");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const [mine, setMine] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { setPage(1); }, [filter, q, mine]);
  useEffect(() => {
    let live = true;
    setData(null);
    adminList({ status: filter, search: q, mine: mine ? "1" : "0", page }).then((d) => live && (setData(d), setError(""))).catch((e) => live && setError(errMsg(e)));
    return () => { live = false; };
  }, [filter, q, mine, page, refreshKey]);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <Chips options={FILTERS} value={filter} onChange={setFilter} />
        <label className="rv-check" style={{ marginLeft: "auto" }}><input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} />Mine only</label>
        <SearchBox value={search} onChange={setSearch} placeholder="Name, email, company, file…" />
      </div>
      {error && <p role="alert" className="rv-err">{error}</p>}
      <div className="rv-card" style={{ overflowX: "auto" }}>
        <table className="rv-table">
          <thead><tr><th>Person</th><th>Plan</th><th>Background</th><th>File</th><th>AI</th><th>Human</th><th>Status</th><th>Reviewer</th><th>Sent</th></tr></thead>
          <tbody>
            {data === null && !error && [0, 1, 2, 3].map((i) => <tr key={i}><td colSpan={9}><Skeleton h={18} /></td></tr>)}
            {data?.rows.map((r) => (
              <tr key={r.id} className="click" onClick={() => onOpen(r.id)} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") onOpen(r.id); }}>
                <td><b>{r.user.name || "User"}</b><div className="rv-xs rv-subtle">{r.user.email}</div></td>
                <td style={{ whiteSpace: "nowrap" }}>{r.package}{r.includes?.rewrittenResume && <Pill className="dark" style={{ marginLeft: 6 }}>Rewrite</Pill>}</td>
                <td><span className="rv-xs">{r.kind === "student" ? "Student" : "Pro"} · {r.organization}</span><div className="rv-xs rv-subtle">{r.targetRole}</div></td>
                <td className="rv-xs" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.file || "–"}</td>
                <td>{r.aiScore != null ? <Pill className={r.aiScore >= 75 ? "ok" : r.aiScore >= 50 ? "warn" : "bad"}>{r.aiScore}</Pill> : <span className="rv-xs rv-subtle">{r.aiStatus}</span>}</td>
                <td>{r.humanRequested ? <Pill className="dark">Asked</Pill> : <span className="rv-xs rv-subtle">AI only</span>}</td>
                <td><Pill className={STATUS[r.status]?.tone}>{STATUS[r.status]?.label}</Pill></td>
                <td className="rv-xs">{r.reviewerName || <span className="rv-subtle">–</span>}</td>
                <td className="rv-xs" style={{ whiteSpace: "nowrap" }}>{dateFmt(r.createdAt)}</td>
              </tr>
            ))}
            {data?.rows.length === 0 && <tr><td colSpan={9} className="rv-subtle" style={{ padding: 56, textAlign: "center" }}>Nothing here.</td></tr>}
          </tbody>
        </table>
      </div>
      {data && <Pager page={page} pages={data.pages} setPage={setPage} />}
    </div>
  );
}

/* ============================ payments ============================ */
function Payments({ packages, onChanged, refreshKey }) {
  const [filter, setFilter] = useState("paid");
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const [modal, setModal] = useState(null); // { type: "delete" | "extend" | "grant", row }
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({});
  useEffect(() => { setPage(1); }, [filter, q]);
  useEffect(() => {
    let live = true;
    setData(null);
    adminPurchases({ status: filter, search: q, page }).then((d) => live && (setData(d), setError(""))).catch((e) => live && setError(errMsg(e)));
    return () => { live = false; };
  }, [filter, q, page, tick, refreshKey]);
  const refresh = () => { setTick((t) => t + 1); onChanged(); };
  const act = async (fn, ok) => { setBusy(true); try { await fn(); toast.success(ok); setModal(null); refresh(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <Chips options={[["paid", "Paid"], ["unpaid", "Unpaid / failed"], ["expired", "Expired"], ["revoked", "Switched off"], ["all", "All"]]} value={filter} onChange={setFilter} />
        <span style={{ marginLeft: "auto" }} />
        <SearchBox value={search} onChange={setSearch} placeholder="Name, email, payment id…" />
        <Btn size="sm" onClick={() => { setF({ email: "", packageId: packages?.[0]?.id || "", extraDays: 0 }); setModal({ type: "grant" }); }}><Plus size={15} weight="bold" aria-hidden />Give a plan</Btn>
      </div>
      {error && <p role="alert" className="rv-err">{error}</p>}
      <div className="rv-card" style={{ overflowX: "auto" }}>
        <table className="rv-table">
          <thead><tr><th>Member</th><th>Plan</th><th>Paid</th><th>AI</th><th>Human</th><th>Valid until</th><th>State</th><th>Date</th><th style={{ textAlign: "right" }}>Actions</th></tr></thead>
          <tbody>
            {data === null && !error && [0, 1, 2].map((i) => <tr key={i}><td colSpan={9}><Skeleton h={18} /></td></tr>)}
            {data?.rows.map((p) => {
              const st = PLAN_STATE[p.state] || {};
              return (
                <tr key={p.id}>
                  <td><b>{p.user.name || "User"}</b><div className="rv-xs rv-subtle">{p.user.email}</div></td>
                  <td style={{ whiteSpace: "nowrap" }}>{p.package.name}<div className="rv-xs rv-subtle">{p.package.terms}</div></td>
                  <td style={{ whiteSpace: "nowrap" }}><span className="rv-mono">{p.free ? "Free" : formatINR(p.payment.amount)}</span><div className="rv-xs rv-subtle">{p.free ? "given by admin" : `${p.payment.gateway || "–"} ${p.payment.status !== "paid" ? `· ${p.payment.status}` : ""}`}</div>{p.gatewayPaymentId && <div className="rv-xs rv-subtle rv-mono" style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }} title={p.gatewayPaymentId}>{p.gatewayPaymentId}</div>}</td>
                  <td className="rv-mono">{p.ai.unlimited ? `${p.ai.used} / ∞` : `${p.ai.used} / ${p.ai.allowed}`}</td>
                  <td className="rv-mono">{p.human.enabled ? `${p.human.used} / ${p.human.allowed}` : <span className="rv-subtle">–</span>}</td>
                  <td className="rv-xs" style={{ whiteSpace: "nowrap" }}>{p.expiresAt ? dayFmt(p.expiresAt) : "Never"}</td>
                  <td><Pill className={st.tone}>{st.label}</Pill>{p.revoked && p.revokeReason && <div className="rv-xs rv-subtle">{p.revokeReason}</div>}</td>
                  <td className="rv-xs" style={{ whiteSpace: "nowrap" }}>{dateFmt(p.payment.paidAt || p.createdAt)}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    {p.payment.status === "paid" && <Btn variant="ghost" size="sm" onClick={() => { setF({ addDays: 0, addAi: 0, addHuman: 0, addLinkedin: 0 }); setModal({ type: "extend", row: p }); }}>Extend</Btn>}{" "}
                    {p.payment.status === "paid" && (p.revoked
                      ? <Btn variant="ghost" size="sm" onClick={() => act(() => adminUpdatePurchase(p.id, { revoked: false }), "Switched back on.")}>Restore</Btn>
                      : <Btn variant="ghost" size="sm" onClick={() => { const reason = window.prompt("Why are you switching this plan off? (shown only to you)", ""); if (reason !== null) act(() => adminUpdatePurchase(p.id, { revoked: true, reason }), "Plan switched off."); }}>Switch off</Btn>)}{" "}
                    <Btn variant="danger" size="sm" onClick={() => { setF({ keep: false }); setModal({ type: "delete", row: p }); }} aria-label="Delete payment"><Trash size={14} aria-hidden /></Btn>
                  </td>
                </tr>
              );
            })}
            {data?.rows.length === 0 && <tr><td colSpan={9} className="rv-subtle" style={{ padding: 56, textAlign: "center" }}>No payments here.</td></tr>}
          </tbody>
        </table>
      </div>
      {data && <Pager page={page} pages={data.pages} setPage={setPage} />}

      {modal?.type === "delete" && (
        <Modal title="Delete this payment?" onClose={() => setModal(null)}>
          <p className="rv-sm rv-muted">{modal.row.user.email} · {modal.row.package.name} · {modal.row.free ? "free" : formatINR(modal.row.payment.amount)}. This removes the payment record from Resume Lab. It does not refund money at the payment gateway.</p>
          <label className="rv-check" style={{ marginTop: 16 }}><input type="checkbox" checked={Boolean(f.keep)} onChange={(e) => setF({ ...f, keep: e.target.checked })} />Keep the reviews sent in under it (otherwise they and their files are deleted too)</label>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}><Btn variant="danger" loading={busy} onClick={() => act(async () => { const o = await adminDeletePurchase(modal.row.id, f.keep); toast(`${o.reviewsDeleted} review${o.reviewsDeleted === 1 ? "" : "s"} deleted with it.`); }, "Payment deleted.")}>Delete payment</Btn><Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
      {modal?.type === "extend" && (
        <Modal title="Extend this plan" onClose={() => setModal(null)}>
          <p className="rv-sm rv-muted">{modal.row.user.email} · {modal.row.package.name}. Use a negative number to take days or reviews away.</p>
          <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            <Field label="Add days" htmlFor="ex-d" hint={modal.row.expiresAt ? `Now valid until ${dayFmt(modal.row.expiresAt)}` : "This plan never expires. Adding days makes it end that many days from now."}><input id="ex-d" type="number" className="rv-input" value={f.addDays} onChange={(e) => setF({ ...f, addDays: e.target.value })} /></Field>
            {!modal.row.ai.unlimited && <Field label="Add AI reviews" htmlFor="ex-a" hint={`Now ${modal.row.ai.used} of ${modal.row.ai.allowed} used`}><input id="ex-a" type="number" className="rv-input" value={f.addAi} onChange={(e) => setF({ ...f, addAi: e.target.value })} /></Field>}
            <Field label="Add human reviews" htmlFor="ex-h" hint={modal.row.human.enabled ? `Now ${modal.row.human.used} of ${modal.row.human.allowed} used` : "This plan has none. Adding some turns human review on for this member."}><input id="ex-h" type="number" className="rv-input" value={f.addHuman} onChange={(e) => setF({ ...f, addHuman: e.target.value })} /></Field>
            <Field label="Add LinkedIn reviews" htmlFor="ex-l" hint={modal.row.linkedin.enabled ? `Now ${modal.row.linkedin.used} of ${modal.row.linkedin.allowed} used` : "This plan has none. Adding some turns LinkedIn review on for this member."}><input id="ex-l" type="number" className="rv-input" value={f.addLinkedin} onChange={(e) => setF({ ...f, addLinkedin: e.target.value })} /></Field>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}><Btn loading={busy} onClick={() => act(() => adminUpdatePurchase(modal.row.id, { addDays: Number(f.addDays) || 0, addAi: Number(f.addAi) || 0, addHuman: Number(f.addHuman) || 0, addLinkedin: Number(f.addLinkedin) || 0 }), "Plan updated.")}>Save</Btn><Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
      {modal?.type === "grant" && (
        <Modal title="Give a plan for free" onClose={() => setModal(null)}>
          <p className="rv-sm rv-muted">For a gift, a partner, or to fix a payment that didn't go through. They need an account already.</p>
          <div style={{ display: "grid", gap: 16, marginTop: 16 }}>
            <Field label="Their email" htmlFor="gr-e"><input id="gr-e" type="email" className="rv-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Plan" htmlFor="gr-p"><select id="gr-p" className="rv-input" value={f.packageId} onChange={(e) => setF({ ...f, packageId: e.target.value })}>{packages?.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.terms})</option>)}</select></Field>
            <Field label="Extra days on top" htmlFor="gr-d" optional><input id="gr-d" type="number" min="0" className="rv-input" value={f.extraDays} onChange={(e) => setF({ ...f, extraDays: e.target.value })} /></Field>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}><Btn loading={busy} onClick={() => act(() => adminGrant({ email: f.email, packageId: f.packageId, extraDays: Number(f.extraDays) || 0 }), "Plan given.")}>Give plan</Btn><Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ============================ members ============================ */
function Members({ onChanged }) {
  const [search, setSearch] = useState("");
  const q = useDebounced(search.trim());
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const [modal, setModal] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let live = true;
    setRows(null);
    adminMembers({ search: q }).then((d) => live && (setRows(d), setError(""))).catch((e) => live && setError(errMsg(e)));
    return () => { live = false; };
  }, [q, tick]);
  const done = () => { setTick((t) => t + 1); onChanged(); };
  const block = async () => { setBusy(true); try { await adminBlock(modal.id, reason); toast.success("Blocked from Resume Lab."); setModal(null); done(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  const unblock = async (m) => { try { await adminUnblock(m.id); toast.success("Unblocked."); done(); } catch (e) { toast.error(errMsg(e)); } };

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 20 }}>
        <p className="rv-sm rv-muted" style={{ flex: "1 1 280px" }}>{q ? "Search results across all accounts." : "Members who bought a plan or are blocked. Search to find anyone else."}</p>
        <SearchBox value={search} onChange={setSearch} placeholder="Name, email, mobile…" />
      </div>
      {error && <p role="alert" className="rv-err">{error}</p>}
      <div className="rv-card" style={{ overflowX: "auto" }}>
        <table className="rv-table">
          <thead><tr><th>Member</th><th>Plans</th><th>Paid</th><th>Reviews</th><th>Last sent</th><th>Status</th><th style={{ textAlign: "right" }}>Action</th></tr></thead>
          <tbody>
            {rows === null && !error && [0, 1, 2].map((i) => <tr key={i}><td colSpan={7}><Skeleton h={18} /></td></tr>)}
            {rows?.map((m) => (
              <tr key={m.id}>
                <td><b>{m.name || "User"}</b><div className="rv-xs rv-subtle">{m.email}{m.mobile && ` · ${m.mobile}`}</div></td>
                <td className="rv-mono">{m.plans}</td><td className="rv-mono">{formatINR(m.paid)}</td><td className="rv-mono">{m.reviews}</td>
                <td className="rv-xs">{m.lastActive ? dayFmt(m.lastActive) : "–"}</td>
                <td>{m.blocked ? <><Pill className="bad">Blocked</Pill>{m.blockReason && <div className="rv-xs rv-subtle" style={{ marginTop: 4 }}>{m.blockReason}</div>}</> : <Pill className="ok">Active</Pill>}</td>
                <td style={{ textAlign: "right" }}>{m.blocked ? <Btn variant="ghost" size="sm" onClick={() => unblock(m)}>Unblock</Btn> : <Btn variant="danger" size="sm" onClick={() => { setReason(""); setModal(m); }}>Block</Btn>}</td>
              </tr>
            ))}
            {rows?.length === 0 && <tr><td colSpan={7} className="rv-subtle" style={{ padding: 56, textAlign: "center" }}>No members found.</td></tr>}
          </tbody>
        </table>
      </div>
      {modal && (
        <Modal title="Block from Resume Lab" onClose={() => setModal(null)}>
          <p className="rv-sm rv-muted">{modal.email} won't be able to buy plans or send in resumes. They can still see reviews they already have, and their Target Trek account is untouched.</p>
          <div style={{ marginTop: 16 }}><Field label="Reason" htmlFor="bl-r" optional hint="The member sees this."><input id="bl-r" className="rv-input" value={reason} onChange={(e) => setReason(e.target.value)} maxLength={300} /></Field></div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}><Btn variant="danger" loading={busy} onClick={block}>Block member</Btn><Btn variant="ghost" onClick={() => setModal(null)}>Cancel</Btn></div>
        </Modal>
      )}
    </div>
  );
}

/* ============================ plans and prices ============================ */
const EMPTY = { id: null, key: "", name: "", tagline: "", description: "", price: "", compareAt: "", badge: "", aiReviews: 2, humanReviews: 0, linkedinReviews: 0, validityDays: 0, deliveryHours: 48, sortOrder: 0, isActive: true, resume: true, jobMatch: false, humanReview: false, rewrittenResume: false, features: "" };
const toForm = (p) => ({ id: p.id, key: p.key, name: p.name, tagline: p.tagline, description: p.description, price: p.price, compareAt: p.compareAt || "", badge: p.badge, aiReviews: p.ai.reviews, humanReviews: p.human.configured, linkedinReviews: p.linkedin.reviews, validityDays: p.validityDays, deliveryHours: p.deliveryHours, sortOrder: p.sortOrder, isActive: p.isActive, resume: p.includes.resume, jobMatch: p.includes.jobMatch, rewrittenResume: p.includes.rewrittenResume, humanReview: p.human.switch, features: (p.features || []).join("\n") });

function Plans({ list, reload }) {
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminSavePackage(form.id, {
        key: form.key, name: form.name, tagline: form.tagline, description: form.description, price: Number(form.price), compareAt: Number(form.compareAt || 0), badge: form.badge,
        aiReviews: Number(form.aiReviews), humanReviews: Number(form.humanReviews), linkedinReviews: Number(form.linkedinReviews), validityDays: Number(form.validityDays), deliveryHours: Number(form.deliveryHours), sortOrder: Number(form.sortOrder), isActive: form.isActive,
        includes: { resume: form.resume, linkedin: Number(form.linkedinReviews) > 0, jobMatch: form.jobMatch, humanReview: form.humanReview, rewrittenResume: form.rewrittenResume }, features: lines(form.features),
      });
      toast.success("Saved."); setForm(null); reload();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };
  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? If anyone bought it, it is only hidden.`)) return;
    try { const o = await adminDeletePackage(p.id); toast.success(o.hidden ? "Hidden (it has orders)." : "Deleted."); reload(); } catch (err) { toast.error(errMsg(err)); }
  };

  if (form) {
    return (
      <form onSubmit={save} className="rv-card rv-card-pad" style={{ maxWidth: 760, margin: "0 auto", display: "grid", gap: 20 }}>
        <h2 className="rv-h3">{form.id ? "Edit plan" : "New plan"}</h2>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <Field label="Name" htmlFor="pk-name"><input id="pk-name" required className="rv-input" value={form.name} onChange={set("name")} maxLength={80} /></Field>
          <Field label="Key (used in links)" htmlFor="pk-key" hint="Letters, numbers, dashes"><input id="pk-key" required className="rv-input" value={form.key} onChange={set("key")} maxLength={40} pattern="[a-zA-Z0-9-]{2,40}" /></Field>
          <Field label="Price (₹)" htmlFor="pk-price"><input id="pk-price" required type="number" min="1" step="1" className="rv-input" value={form.price} onChange={set("price")} /></Field>
          <Field label="Crossed-out price (₹)" htmlFor="pk-cmp" optional><input id="pk-cmp" type="number" min="0" className="rv-input" value={form.compareAt} onChange={set("compareAt")} /></Field>
          <Field label="Badge" htmlFor="pk-badge" optional hint="e.g. Most picked"><input id="pk-badge" className="rv-input" value={form.badge} onChange={set("badge")} maxLength={30} /></Field>
          <Field label="Review within (hours)" htmlFor="pk-hrs"><input id="pk-hrs" type="number" min="1" max="720" className="rv-input" value={form.deliveryHours} onChange={set("deliveryHours")} /></Field>
        </div>
        <fieldset className="rv-note" style={{ border: 0, display: "grid", gap: 16 }}>
          <legend className="rv-sm" style={{ fontWeight: 700, padding: 0, marginBottom: 12 }}>What the plan gives</legend>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
            <Field label="AI reviews" htmlFor="pk-ai" hint="0 = unlimited. Every resume sent in uses one."><input id="pk-ai" type="number" min="0" className="rv-input" value={form.aiReviews} onChange={set("aiReviews")} /></Field>
            <Field label="Human reviews" htmlFor="pk-hu" hint="By working professionals. Needs the switch below on."><input id="pk-hu" type="number" min="0" className="rv-input" value={form.humanReviews} onChange={set("humanReviews")} disabled={!form.humanReview} /></Field>
            <Field label="LinkedIn reviews" htmlFor="pk-li" hint="0 = none (nothing about LinkedIn is shown). Usually 1."><input id="pk-li" type="number" min="0" max="1000" className="rv-input" value={form.linkedinReviews} onChange={set("linkedinReviews")} /></Field>
            <Field label="Valid for (days)" htmlFor="pk-days" hint="0 = never expires. 30, 365, 1825 (5 years)… counts from payment."><input id="pk-days" type="number" min="0" max="3650" className="rv-input" value={form.validityDays} onChange={set("validityDays")} /></Field>
          </div>
          <label className="rv-check"><input type="checkbox" checked={form.humanReview} onChange={set("humanReview")} />Allow human review in this plan. Switch off for AI-only: no human wording is shown to buyers, and the count above is ignored.</label>
          <p className="rv-sm"><b>Reads as:</b> {Number(form.aiReviews) === 0 ? "Unlimited AI reviews" : `${form.aiReviews} AI review${Number(form.aiReviews) === 1 ? "" : "s"}`}{form.humanReview && Number(form.humanReviews) > 0 ? ` + ${form.humanReviews} human review${Number(form.humanReviews) === 1 ? "" : "s"}` : ""}{Number(form.linkedinReviews) > 0 ? ` + ${form.linkedinReviews} LinkedIn review${Number(form.linkedinReviews) === 1 ? "" : "s"}` : ""} · {Number(form.validityDays) === 0 ? "no expiry" : `valid ${form.validityDays} days`}</p>
          <p className="rv-xs rv-subtle">Changes apply to new purchases. Members who already bought keep what they paid for (you can adjust them under Payments).</p>
        </fieldset>
        <Field label="One-line pitch" htmlFor="pk-tag"><input id="pk-tag" className="rv-input" value={form.tagline} onChange={set("tagline")} maxLength={160} /></Field>
        <Field label="What's included (shown as ticks)" htmlFor="pk-feat" hint="One per line"><textarea id="pk-feat" rows={5} className="rv-input" value={form.features} onChange={set("features")} /></Field>
        <fieldset className="rv-note" style={{ border: 0, display: "grid", gap: 12 }}>
          <legend className="rv-sm" style={{ fontWeight: 700, padding: 0, marginBottom: 12 }}>What each resume review covers</legend>
          {[["resume", "Resume review (the buyer uploads a PDF)"], ["jobMatch", "Job-description match (the buyer must paste a job description)"], ["rewrittenResume", "Complete rewritten resume on human reviews (you upload the finished file). Leave off for comments only."]].map(([k, label]) => <label key={k} className="rv-check"><input type="checkbox" checked={form[k]} onChange={set(k)} />{label}</label>)}
        </fieldset>
        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", alignItems: "end" }}>
          <Field label="Sort order" htmlFor="pk-sort" hint="Smaller shows first"><input id="pk-sort" type="number" min="0" className="rv-input" value={form.sortOrder} onChange={set("sortOrder")} /></Field>
          <label className="rv-check" style={{ paddingBottom: 12 }}><input type="checkbox" checked={form.isActive} onChange={set("isActive")} />Visible on the site</label>
        </div>
        <div style={{ display: "flex", gap: 12 }}><Btn type="submit" loading={busy}>Save plan</Btn><Btn variant="ghost" onClick={() => setForm(null)}>Cancel</Btn></div>
      </form>
    );
  }
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
        <p className="rv-sm rv-muted" style={{ maxWidth: 560 }}>Create single reviews, rewrite plans, or unlimited passes for 30, 60 or any number of days. Changes show on the site straight away. People who already bought keep the plan and price they paid for.</p>
        <Btn onClick={() => setForm({ ...EMPTY })}><Plus size={16} weight="bold" aria-hidden />New plan</Btn>
      </div>
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {list === null && [0, 1, 2].map((i) => <Skeleton key={i} h={220} style={{ borderRadius: 16 }} />)}
        {list?.map((p) => (
          <div key={p.id} className="rv-card" style={{ padding: 24, display: "flex", flexDirection: "column", opacity: p.isActive ? 1 : 0.6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><h3 className="rv-h3">{p.name}</h3>{p.isActive ? <Pill className="ok">Live</Pill> : <Pill>Hidden</Pill>}</div>
            <p style={{ marginTop: 12, display: "flex", alignItems: "flex-end", gap: 8 }}><span className="rv-price" style={{ fontSize: 28 }}>{formatINR(p.price)}</span>{p.compareAt > 0 && <s className="rv-mono rv-subtle">{formatINR(p.compareAt)}</s>}</p>
            <p className="rv-sm" style={{ marginTop: 8, fontWeight: 600 }}>{p.terms}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>{p.includes.resume && <Pill>Resume</Pill>}{p.linkedin.enabled && <Pill>LinkedIn ×{p.linkedin.reviews}</Pill>}{p.includes.jobMatch && <Pill>Job match</Pill>}{p.human.enabled ? <Pill className="dark">Human ×{p.human.reviews}</Pill> : <Pill>AI only</Pill>}{p.human.configured > 0 && !p.human.switch && <Pill className="warn">Human off</Pill>}{p.includes.rewrittenResume && <Pill className="dark">Rewritten resume</Pill>}</div>
            <p className="rv-xs rv-subtle" style={{ marginTop: 12, flex: 1 }}>{p.sold} sold</p>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}><Btn variant="ghost" size="sm" onClick={() => setForm(toForm(p))}>Edit</Btn><Btn variant="danger" size="sm" onClick={() => remove(p)}><Trash size={14} aria-hidden />Delete</Btn></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================ page ============================ */
export default function AdminResumeReviews() {
  const role = useSelector((s) => s.auth?.user?.role);
  const isAdmin = role === "admin";
  const [tab, setTab] = useState("reviews");
  const [openId, setOpenId] = useState(null);
  const [tick, setTick] = useState(0);
  const [stats, setStats] = useState(null);
  const [packages, setPackages] = useState(null);
  const bump = useCallback(() => setTick((t) => t + 1), []);
  const loadPackages = useCallback(() => { if (isAdmin) adminPackages().then(setPackages).catch((e) => toast.error(errMsg(e))); }, [isAdmin]);
  useEffect(() => { adminStats().then(setStats).catch(() => {}); }, [tick]);
  useEffect(() => { loadPackages(); }, [loadPackages]);
  const tabs = useMemo(() => [["reviews", "Reviews"], ...(isAdmin ? [["payments", "Payments"], ["members", "Members"], ["plans", "Plans and prices"]] : [])], [isAdmin]);

  return (
    <Page title="Resume Lab | Admin" top={false}>
      <header style={{ borderBottom: "1px solid var(--rv-border)" }}>
        <div className="rv-shell" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 700 }}><FileText size={20} weight="fill" aria-hidden />Resume Lab <Pill className="dark">{isAdmin ? "Admin" : "Reviewer"}</Pill></span>
          <Link to="/admin" className="rv-btn rv-btn-ghost rv-btn-sm">Admin home</Link>
        </div>
      </header>
      <main className="rv-shell" style={{ padding: "40px 0 96px" }}>
        {!openId && (
          <>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 32 }}>
              {[["Waiting", stats?.awaiting], ["In review", stats?.inReview], ["Delivered", stats?.completed], ...(isAdmin ? [["Paid plans", stats?.paidPlans], ["Members", stats?.members], ["Blocked", stats?.blocked], ["Revenue", stats ? formatINR(stats.revenue) : null]] : [])].map(([k, v]) => <div key={k} className="rv-stat"><span className="rv-xs rv-subtle" style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>{k}</span><b>{v ?? "–"}</b></div>)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
              <h1 className="rv-h2" style={{ fontSize: 30 }}>{tabs.find((t) => t[0] === tab)?.[1]}</h1>
              {tabs.length > 1 && <div className="rv-tabs" role="tablist">{tabs.map(([k, label]) => <button key={k} role="tab" type="button" aria-selected={tab === k} onClick={() => setTab(k)}>{label}</button>)}</div>}
            </div>
          </>
        )}
        {openId
          ? <ReviewDesk id={openId} role={role} onBack={() => setOpenId(null)} onChanged={bump} />
          : tab === "plans" && isAdmin ? <Plans list={packages} reload={loadPackages} />
          : tab === "payments" && isAdmin ? <Payments packages={packages} onChanged={bump} refreshKey={tick} />
          : tab === "members" && isAdmin ? <Members onChanged={bump} />
          : <Queue onOpen={setOpenId} refreshKey={tick} />}
      </main>
    </Page>
  );
}
