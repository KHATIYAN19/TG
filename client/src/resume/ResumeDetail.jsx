import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowRight, ArrowsClockwise, Briefcase, CalendarBlank, ChatCircleText, Check, DownloadSimple, FilePdf, FileText, GraduationCap, Lightning, LinkedinLogo,
  ListChecks, MagnifyingGlass, PencilSimple, Sparkle, Target, Trash, TrendUp, UserCircle, Warning,
} from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { STATUS, dateFmt, deleteReview, getDeliverableUrl, getRequest, requestHuman, rerunReview } from "./api";
import { useApp } from "./appData";
import { AgentProgress, QualityCard } from "./AgentRun";
import { Bar, Btn, FormattedText, Modal, ScoreRing, Skeleton, cx, toneOf } from "./ui";

/*
  ONE REVIEW  /resume-review/app/requests/:id
  First load asks for the review AND what can still be added (?pool=1), so the page needs one call. While the AI agents work it polls
  the review alone every 2.5 seconds and shows each agent's step as it lands. The report is split into sections with sticky jump
  links, so every score, problem, fix and check is one tap away on any screen.
  AiReport is also used by the reviewers' desk (admin), and ReviewView by the sample on the landing page.
*/

const Card = ({ id, title, icon, sub, children, className = "" }) => (
  <section id={id} className={cx("rs-card rs-stack", className)} aria-labelledby={id ? `${id}-h` : undefined}>
    <div>
      <h2 id={id ? `${id}-h` : undefined} className="rs-h2">{icon}{title}</h2>
      {sub && <p className="rs-sm rs-muted" style={{ marginTop: 4 }}>{sub}</p>}
    </div>
    {children}
  </section>
);
const sevChip = (s) => (s === "critical" ? "bad" : s === "major" ? "warn" : "");
const jumpTo = (id) => (e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); };

/* ============================ the AI report ============================ */
export function AiReport({ ai, includes, purchaseId, humanRequested, kind, reviewId, onRerun }) {
  if (ai.status === "failed") {
    return (
      <section className="rs-card rs-stack rs-scope" role="alert" style={{ borderColor: "var(--rv-bad)" }}>
        <span className="rs-chip bad" style={{ width: "fit-content" }}><span>AI report not generated</span></span>
        <h2 className="rs-h2">{ai.userMessage || "We couldn't generate your AI report this time."}</h2>
        {ai.refunded && <p className="rs-sm rs-muted">We've given this AI review back to your plan, so you haven't lost anything.{humanRequested ? " Your human reviewer will still go through your resume by hand." : ""}</p>}
        {!ai.refunded && humanRequested && <p className="rs-sm rs-muted">Your human reviewer will still go through your resume by hand.</p>}
        {ai.pipeline?.steps?.length > 0 && <details><summary className="rs-sm" style={{ cursor: "pointer", fontWeight: 700 }}>What the agents did</summary><div style={{ marginTop: 14 }}><AgentProgress pipeline={ai.pipeline} /></div></details>}
        {(onRerun || purchaseId) && (
          <div className="rs-row">
            {onRerun && <Btn onClick={onRerun}><ArrowsClockwise size={16} weight="bold" aria-hidden />Run agents again (1 AI review)</Btn>}
            {purchaseId && <Btn as={Link} variant="ghost" to={`/resume-review/app/new?plan=${purchaseId}${reviewId ? `&from=${reviewId}` : ""}`}>Send a new version</Btn>}
          </div>
        )}
        <p className="rs-xs rs-subtle">Still stuck? Write to supporttargettrek@gmail.com and we'll sort it out.</p>
      </section>
    );
  }
  if (ai.status !== "done" || !ai.result) {
    const live = ai.pipeline?.steps?.length > 0;
    return (
      <section className="rs-card rs-stack rs-scope" aria-live="polite">
        <div className="rs-row between">
          <h2 className="rs-h2"><Sparkle size={20} weight="fill" style={{ color: "var(--rv-brand)" }} aria-hidden />{live ? "Our AI agents are reviewing your resume" : "Getting the agents ready…"}</h2>
          <span className="rs-chip live brand"><span>Live</span></span>
        </div>
        <p className="rs-sm rs-muted">A planner maps your resume, a reviewer scores it and finds every mistake, and a validator checks the review against your resume, sending it back for fixing up to two times. Usually 3 to 6 minutes. This page updates by itself.</p>
        {live ? <AgentProgress pipeline={ai.pipeline} live /> : <div className="rs-stack sm"><Skeleton h={14} /><Skeleton h={14} style={{ width: "80%" }} /><Skeleton h={14} style={{ width: "60%" }} /></div>}
      </section>
    );
  }

  const r = ai.result;
  const general = r.reviewMode === "general" || (r.jdCheck && r.jdCheck.status !== "valid");
  const jdProblem = general && r.jdCheck && r.jdCheck.status !== "none";
  const crit = r.criticalIssues || [];
  const counts = { critical: crit.filter((c) => c.severity === "critical").length, major: crit.filter((c) => c.severity === "major").length };
  const jumps = [
    ["rp-top", "Overview"],
    r.experienceCheck && ["rp-exp", "Experience"],
    crit.length > 0 && ["rp-issues", "Problems", crit.length],
    r.sections?.length > 0 && ["rp-sections", "Sections", r.sections.length],
    r.improvements?.length > 0 && ["rp-fixes", "Fixes", r.improvements.length],
    r.rewrittenBullets?.length > 0 && ["rp-bullets", "Rewrites", r.rewrittenBullets.length],
    (r.strengths?.length > 0 || r.missingKeywords?.length > 0) && ["rp-keys", "Strengths & keywords"],
    includes?.jobMatch && r.jobMatch && ["rp-job", "Job match"],
    includes?.linkedin && r.linkedin && ["rp-li", "LinkedIn"],
    r.interviewRisks?.length > 0 && ["rp-int", "Interview"],
    r.marketInsight && ["rp-market", "Market"],
    r.actionPlan?.length > 0 && ["rp-plan", "This week"],
    (r.quality || ai.pipeline) && ["rp-checks", "Checks"],
  ].filter(Boolean);

  return (
    <div className="rs-report rs-scope rv-ai">
      <nav className="rs-jump" aria-label="Jump to a part of the report">
        {jumps.map(([id, label, n]) => <a key={id} href={`#${id}`} onClick={jumpTo(id)}>{label}{n ? <small className="rs-num">{n}</small> : null}</a>)}
      </nav>

      <section id="rp-top" className="rs-card">
        <div className="rs-score-hero">
          <ScoreRing value={r.overallScore} size={132} stroke={9} label="Overall" />
          <div className="rs-stack sm">
            <div className="rs-row">
              <span className="rs-chip brand"><Sparkle size={12} weight="fill" aria-hidden /><span>AI agents' report</span></span>
              {r.quality && <span className={cx("rs-chip", r.quality.verdict === "passed" ? "ok" : "warn")}><span>{r.quality.verdict === "passed" ? "Validated" : "Checked"}{r.quality.rounds ? ` · ${r.quality.rounds} revision${r.quality.rounds === 1 ? "" : "s"}` : ""}</span></span>}
              {counts.critical > 0 && <span className="rs-chip bad"><span>{counts.critical} critical</span></span>}
              {counts.major > 0 && <span className="rs-chip warn"><span>{counts.major} major</span></span>}
            </div>
            <h2 className="rs-h2" style={{ fontSize: "clamp(19px, 3.6vw, 24px)" }}>{r.headline}</h2>
            <p className="rs-sm rs-muted" style={{ lineHeight: 1.7 }}>{r.summary}</p>
          </div>
        </div>
        <div className="rs-meters">
          <div className="rs-meter"><div><b>ATS readiness</b><span className="rs-num">{r.atsScore}/100</span></div><Bar value={r.atsScore} tone={toneOf(r.atsScore)} /></div>
          {r.shortlistChance != null && <div className="rs-meter"><div><b>Shortlist chance today</b><span className="rs-num">{r.shortlistChance}%</span></div><Bar value={r.shortlistChance} tone={toneOf(r.shortlistChance)} /></div>}
          {includes?.jobMatch && r.jobMatch && <div className="rs-meter"><div><b>Job match</b><span className="rs-num">{r.jobMatch.score}/100</span></div><Bar value={r.jobMatch.score} tone={toneOf(r.jobMatch.score)} /></div>}
        </div>
        {r.recruiterFirstImpression && <p className="rs-quote" style={{ marginTop: 16 }}><b>A recruiter's first 10 seconds:</b> {r.recruiterFirstImpression}</p>}
        <p className="rs-xs rs-subtle" style={{ marginTop: 12 }}>AI can make mistakes, so please double-check the details.</p>
      </section>

      {general && r.jdCheck?.note && <div className={cx("rs-notice", !jdProblem && "info")} role="status"><Warning size={20} weight="duotone" aria-hidden /><div><b>{jdProblem ? "We didn't use your job description" : "General review"}</b><p>{r.jdCheck.note}</p></div></div>}

      {r.experienceCheck && (
        <Card id="rp-exp" title="Experience vs the role" icon={<Briefcase size={20} weight="duotone" aria-hidden />}>
          <div className="rs-row">
            <span className={cx("rs-chip", r.experienceCheck.level === "below" ? "bad" : r.experienceCheck.level === "above" ? "warn" : "ok")}><span>{r.experienceCheck.level === "below" ? "Below what this role expects" : r.experienceCheck.level === "above" ? "Above what this role expects" : "In range for this role"}</span></span>
            {kind !== "student" && r.experienceCheck.claimedYears != null && <span className="rs-xs rs-muted">You stated {r.experienceCheck.claimedYears} year{r.experienceCheck.claimedYears === 1 ? "" : "s"}</span>}
          </div>
          {r.experienceCheck.expectedForRole && <p className="rs-sm"><b>What the role usually expects:</b> {r.experienceCheck.expectedForRole}</p>}
          <p className="rs-sm rs-muted" style={{ lineHeight: 1.7 }}>{r.experienceCheck.assessment}</p>
          {r.experienceCheck.gaps?.length > 0 && <ul className="rs-bullets bad">{r.experienceCheck.gaps.map((g) => <li key={g}><Warning size={15} weight="fill" aria-hidden /><span>{g}</span></li>)}</ul>}
          {r.experienceCheck.howToBridge && <p className="rs-quote"><b>How to close the gap:</b> {r.experienceCheck.howToBridge}</p>}
        </Card>
      )}

      {crit.length > 0 && (
        <Card id="rp-issues" title="What's holding your resume back" icon={<Warning size={20} weight="fill" style={{ color: "var(--rv-bad)" }} aria-hidden />} sub="Every problem the agents found, most serious first.">
          <div className="rs-stack sm">
            {crit.map((c, n) => (
              <article key={`${c.title}-${n}`} className={cx("rs-issue", c.severity)}>
                <div className="rs-issue-top"><span className={cx("rs-chip", sevChip(c.severity))}><span>{c.severity}</span></span><b>{n + 1}. {c.title}</b></div>
                {c.where && <p className="rs-xs rs-subtle">Where: {c.where}</p>}
                <p className="rs-sm" style={{ lineHeight: 1.7 }}>{c.whatIsWrong}</p>
                {c.impact && <p className="rs-sm rs-muted" style={{ lineHeight: 1.7 }}><b>Why it hurts:</b> {c.impact}</p>}
                {c.howToFix && <p className="rs-quote"><b>Do this:</b> {c.howToFix}</p>}
              </article>
            ))}
          </div>
        </Card>
      )}

      {r.sections?.length > 0 && (
        <Card id="rp-sections" title="Section by section" icon={<ListChecks size={20} weight="duotone" aria-hidden />}>
          <div className="rs-secs">
            {r.sections.map((s) => (
              <div key={s.name} className="rs-sec">
                <div className="rs-sec-top"><b>{s.name}</b><span className="rs-num rs-muted">{s.score}/100</span></div>
                <Bar value={s.score} tone={toneOf(s.score)} />
                <p className="rs-sm rs-muted" style={{ lineHeight: 1.7 }}>{s.feedback}</p>
                {s.problems?.length > 0 && <ul className="rs-bullets bad">{s.problems.map((x) => <li key={x}><Warning size={14} weight="fill" aria-hidden /><span>{x}</span></li>)}</ul>}
                {s.fixes?.length > 0 && <ul className="rs-bullets ok">{s.fixes.map((x) => <li key={x}><Check size={14} weight="bold" aria-hidden /><span>{x}</span></li>)}</ul>}
              </div>
            ))}
          </div>
        </Card>
      )}

      {r.improvements?.length > 0 && (
        <Card id="rp-fixes" title="Fix these first" icon={<PencilSimple size={20} weight="duotone" aria-hidden />} sub="Ordered by how much each one lifts your chances.">
          <ol className="rs-stack" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {r.improvements.map((i, n) => (
              <li key={`${i.issue}-${n}`} className="rs-fix">
                <span className="rs-fix-n" aria-hidden>{n + 1}</span>
                <div className="rs-stack sm"><b style={{ fontSize: 15 }}>{i.issue}</b>{i.why && <p className="rs-sm rs-muted">{i.why}</p>}{i.fix && <p className="rs-quote"><b>Do this:</b> {i.fix}</p>}</div>
              </li>
            ))}
          </ol>
        </Card>
      )}

      {r.rewrittenBullets?.length > 0 && (
        <Card id="rp-bullets" title="Bullets, rewritten" icon={<Lightning size={20} weight="duotone" aria-hidden />} sub="Replace anything in [brackets] with your real figures. We never invent them.">
          <div className="rs-stack sm">
            {r.rewrittenBullets.map((b) => <div key={b.before} className="rs-ba"><div><small>BEFORE</small>{b.before}</div><div><small>AFTER</small>{b.after}</div></div>)}
          </div>
        </Card>
      )}

      {(r.strengths?.length > 0 || r.missingKeywords?.length > 0) && (
        <div id="rp-keys" className="rs-grid-2" style={{ scrollMarginTop: 130 }}>
          {r.strengths?.length > 0 && <Card title="What's working" icon={<Check size={20} weight="bold" style={{ color: "var(--rv-ok)" }} aria-hidden />}><ul className="rs-bullets ok">{r.strengths.map((x) => <li key={x}><Check size={14} weight="bold" aria-hidden /><span>{x}</span></li>)}</ul></Card>}
          {r.missingKeywords?.length > 0 && (
            <Card title={general ? "Keywords for this role" : "Keywords from the job"} icon={<MagnifyingGlass size={20} weight="duotone" aria-hidden />} sub={general ? "Terms recruiters search for in this kind of role that we couldn't find in your resume. Only add what you truly know." : "In the job description but not in your resume. Only add what you truly know."}>
              <div className="rs-tags">{r.missingKeywords.map((k) => <span key={k} className="rs-chip warn"><span>+ {k}</span></span>)}</div>
            </Card>
          )}
        </div>
      )}

      {includes?.jobMatch && r.jobMatch && (
        <Card id="rp-job" title="Match with your job" icon={<Target size={20} weight="duotone" aria-hidden />} sub={r.jobMatch.advice}>
          <div className="rs-grid-2">
            <div className="rs-stack sm"><p className="rs-k" style={{ color: "var(--rv-ok)" }}>You already show</p><div className="rs-tags">{r.jobMatch.matched.map((k) => <span key={k} className="rs-chip ok"><span>{k}</span></span>)}</div></div>
            <div className="rs-stack sm"><p className="rs-k" style={{ color: "var(--rv-bad)" }}>Missing</p><div className="rs-tags">{r.jobMatch.missing.map((k) => <span key={k} className="rs-chip bad"><span>{k}</span></span>)}</div></div>
          </div>
        </Card>
      )}

      {includes?.linkedin && r.linkedin && (
        <Card id="rp-li" title="LinkedIn ideas" icon={<LinkedinLogo size={20} weight="fill" aria-hidden />}>
          {r.linkedin.headlineIdea && <p className="rs-quote"><b>Headline idea:</b> {r.linkedin.headlineIdea}</p>}
          {r.linkedin.aboutIdea && <p className="rs-quote"><b>About section idea:</b> {r.linkedin.aboutIdea}</p>}
          {r.linkedin.tips?.length > 0 && <ul className="rs-bullets ok">{r.linkedin.tips.map((t) => <li key={t}><Check size={14} weight="bold" aria-hidden /><span>{t}</span></li>)}</ul>}
          <p className="rs-xs rs-subtle">The AI can't open LinkedIn. Your reviewer checks your live profile for the real feedback.</p>
        </Card>
      )}

      {r.interviewRisks?.length > 0 && (
        <Card id="rp-int" title="Questions this resume will invite" icon={<ChatCircleText size={20} weight="duotone" aria-hidden />}>
          <div className="rs-stack">
            {r.interviewRisks.map((q) => <div key={q.question} className="rs-stack sm"><b style={{ fontSize: 15 }}>“{q.question}”</b>{q.whyTheyAsk && <p className="rs-sm rs-muted">{q.whyTheyAsk}</p>}<p className="rs-quote"><b>Prepare:</b> {q.prepare}</p></div>)}
          </div>
        </Card>
      )}

      {r.marketInsight && <Card id="rp-market" title="How this profile looks in the market" icon={<TrendUp size={20} weight="duotone" aria-hidden />}><p className="rs-sm rs-muted" style={{ lineHeight: 1.75 }}>{r.marketInsight}</p></Card>}

      {r.actionPlan?.length > 0 && (
        <Card id="rp-plan" title="Your plan for this week" icon={<CalendarBlank size={20} weight="duotone" aria-hidden />}>
          <ol className="rs-stack sm" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {r.actionPlan.map((a, n) => (
              <li key={`${a.step}-${n}`} className="rs-fix"><span className="rs-fix-n" aria-hidden>{n + 1}</span><div><p className="rs-sm" style={{ fontWeight: 700 }}>{a.step}</p>{(a.effort || a.payoff) && <p className="rs-xs rs-subtle" style={{ marginTop: 2 }}>{[a.effort, a.payoff].filter(Boolean).join(" · ")}</p>}</div></li>
            ))}
          </ol>
        </Card>
      )}

      {(r.quality || ai.pipeline) && <div id="rp-checks" style={{ scrollMarginTop: 130 }}><QualityCard quality={r.quality} pipeline={ai.pipeline} /></div>}
      <p className="rs-xs rs-subtle" role="note" style={{ textAlign: "center" }}>{r.aiNote || "AI can make mistakes. Please double-check anything important before you act on it."}</p>
    </div>
  );
}

/* ============================ the human review ============================ */
export function HumanReport({ id, human, includes, preview = false }) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    if (preview) return toast("This is a sample. Your own rewritten resume downloads here.");
    setBusy(true);
    try { const { url } = await getDeliverableUrl(id); window.open(url, "_blank", "noopener"); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <section className="rs-card rs-stack" style={{ border: "2px solid var(--rv-brand)" }}>
      <div className="rs-score-hero">
        <ScoreRing value={human.score ?? 0} size={104} stroke={8} label="Reviewer" />
        <div className="rs-stack sm">
          <span className="rs-chip brand" style={{ width: "fit-content" }}><UserCircle size={13} weight="bold" aria-hidden /><span>Human review</span></span>
          <h2 className="rs-h2">Notes from your reviewer</h2>
          {human.completedAt && <p className="rs-xs rs-subtle">Delivered {dateFmt(human.completedAt)}</p>}
        </div>
      </div>
      {human.deliverable && (
        <div className="rs-file is-picked">
          <span className="rs-ico" aria-hidden><FileText size={22} weight="duotone" /></span>
          <div className="rs-file-main"><b className="rs-sm">Your rewritten resume</b><span className="rs-file-meta"><span className="rs-ellipsis">{human.deliverable.filename}</span></span></div>
          <div className="rs-file-actions"><Btn loading={busy} onClick={download} size="sm"><DownloadSimple size={16} weight="bold" aria-hidden />Download</Btn></div>
        </div>
      )}
      {human.summary && <FormattedText text={human.summary} />}
      {human.detailedFeedback && <div><h3 className="rs-h3" style={{ marginBottom: 10 }}>Detailed feedback</h3><FormattedText text={human.detailedFeedback} /></div>}
      <div className="rs-grid-2">
        {human.strengths?.length > 0 && <div className="rs-stack sm"><h3 className="rs-h3">Strengths</h3><ul className="rs-bullets ok">{human.strengths.map((x) => <li key={x}><Check size={14} weight="bold" aria-hidden /><span>{x}</span></li>)}</ul></div>}
        {human.improvements?.length > 0 && <div className="rs-stack sm"><h3 className="rs-h3">What to change</h3><ol className="rs-stack sm" style={{ listStyle: "none", padding: 0, margin: 0 }}>{human.improvements.map((x, i) => <li key={x} className="rs-fix"><span className="rs-fix-n" aria-hidden>{i + 1}</span><span className="rs-sm">{x}</span></li>)}</ol></div>}
      </div>
      {includes?.linkedin && human.linkedinFeedback && <div className="rs-quote"><h3 className="rs-h3 rs-row" style={{ gap: 8 }}><LinkedinLogo size={18} weight="fill" aria-hidden />LinkedIn</h3><div style={{ marginTop: 10 }}><FormattedText text={human.linkedinFeedback} /></div></div>}
      {human.jobMatchFeedback && <div className="rs-quote"><h3 className="rs-h3 rs-row" style={{ gap: 8 }}><Target size={18} aria-hidden />Tailoring to your job</h3><div style={{ marginTop: 10 }}><FormattedText text={human.jobMatchFeedback} /></div></div>}
      {human.nextSteps && <div className="rs-quote"><h3 className="rs-h3">Your next steps</h3><div style={{ marginTop: 10 }}><FormattedText text={human.nextSteps} /></div></div>}
    </section>
  );
}

/* ============================ progress ============================ */
const AGENT_NOW = { planner: "Planner is reading it…", reviewer: "Reviewer is scoring it…", validator: "Validator is checking the review…", reviser: "Reviser is fixing the review…", finalizer: "Almost done…" };
export function Timeline({ r, preview = false }) {
  const s = r.status;
  const aiDone = ["done", "failed"].includes(r.ai.status);
  const hasHuman = Boolean(r.humanRequested);
  const rows = [
    { t: "Review started", d: dateFmt(r.createdAt), state: "done" },
    { t: "AI agents review it", d: aiDone ? (r.ai.status === "failed" ? "Could not finish" : "Done") : AGENT_NOW[r.ai.pipeline?.stage] || "Starting…", state: aiDone ? "done" : "now" },
    ...(hasHuman ? [{ t: "A reviewer takes over", d: s === "completed" ? "Done" : s === "in_review" ? "A reviewer is on it" : aiDone ? `Within ${r.package.deliveryHours} hours` : "", state: s === "completed" ? "done" : aiDone ? "now" : "" }] : []),
    ...(preview ? [] : [{ t: hasHuman ? "Review ready" : "Report ready", d: s === "completed" ? "Open it on this page" : "", state: s === "completed" ? "done" : "" }]),
  ];
  return (
    <ol className="rs-steps">
      {rows.map((x) => (
        <li key={x.t} className={x.state}>
          <span aria-hidden>{x.state === "done" ? <Check size={12} weight="bold" /> : x.state === "now" ? <span className="rv-spin" style={{ width: 10, height: 10 }} /> : null}</span>
          <div><b>{x.t}</b>{x.d && <p>{x.d}</p>}</div>
        </li>
      ))}
    </ol>
  );
}

/* ============================ page ============================ */
export default function ResumeDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [r, setR] = useState(null);
  const [error, setError] = useState("");
  const [asking, setAsking] = useState(false);
  const [dialog, setDialog] = useState(""); // "rerun" | "delete"
  const [working, setWorking] = useState(false);
  const scrolled = useRef(false);
  const navigate = useNavigate();
  const { refresh } = useApp();

  const load = useCallback(async (withPool = false) => {
    try {
      const fresh = await getRequest(id, { pool: withPool });
      setR((old) => ({ ...fresh, pool: fresh.pool || old?.pool })); // the polls don't ask for the pool again
      setError("");
    } catch (e) { setError(errMsg(e)); }
  }, [id]);
  useEffect(() => { setR(null); load(true); }, [load]);
  const askHuman = async () => {
    setAsking(true);
    try { await requestHuman(id); toast.success("A reviewer will take a look."); await load(true); } catch (e) { toast.error(errMsg(e)); } finally { setAsking(false); }
  };

  const rerun = async () => {
    setWorking(true);
    try { const fresh = await rerunReview(id); setR((old) => ({ ...fresh, pool: old?.pool && { ...old.pool, aiLeft: Math.max(0, (old.pool.aiLeft || 0) - 1) } })); setDialog(""); toast.success("The AI agents are on it again. 1 AI review used."); refresh().catch(() => {}); } catch (e) { toast.error(errMsg(e)); } finally { setWorking(false); }
  };
  const remove = async () => {
    setWorking(true);
    try { await deleteReview(id); toast.success("Review deleted."); refresh().catch(() => {}); navigate("/resume-review/app/reviews", { replace: true }); } catch (e) { toast.error(errMsg(e)); setWorking(false); }
  };

  // while the AI works, every 2.5 s (the agents' steps arrive live); after that a slow check for the human's answer
  useEffect(() => {
    if (!r || r.status === "completed") return undefined;
    const aiLive = r.status === "ai_reviewing" || ["pending", "running"].includes(r.ai?.status);
    const t = setInterval(() => load(false), aiLive ? 2500 : 45000);
    return () => clearInterval(t);
  }, [r?.status, r?.ai?.status, load]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r && params.get("sent") && !scrolled.current) { scrolled.current = true; window.scrollTo({ top: 0 }); } }, [r, params]);

  if (error) return <div className="rs-error" role="alert"><b>We couldn't open this review</b><p className="rs-sm">{error}</p><Btn as={Link} to="/resume-review/app/reviews" variant="ghost">All reviews</Btn></div>;
  if (!r) return <div className="rs-loading"><Skeleton h={34} style={{ width: "50%" }} /><Skeleton h={240} style={{ borderRadius: 16 }} /><Skeleton h={200} style={{ borderRadius: 16 }} /></div>;
  const canAsk = !r.humanRequested && r.pool && r.pool.humanLeft > 0;
  const aiIdle = ["done", "failed"].includes(r.ai?.status);
  const credits = r.pool ? r.pool.aiUnlimited || (r.pool.aiLeft || 0) > 0 : true;
  const humanBusy = r.humanRequested && ["awaiting_review", "in_review"].includes(r.status);
  return (
    <>
      <ReviewView r={r} canAsk={canAsk} pool={r.pool} asking={asking} onAsk={askHuman} sent={Boolean(params.get("sent"))}
        onRerun={aiIdle ? () => setDialog("rerun") : null} canRerun={credits} onDelete={() => setDialog("delete")} deleteBlocked={humanBusy} />
      {dialog === "rerun" && (
        <Modal title="Run the AI agents again?" onClose={() => setDialog("")}>
          <p className="rs-sm rs-muted">The planner, reviewer and validator review this resume from scratch. This uses <b>1 AI review</b>{r.pool && !r.pool.aiUnlimited ? ` (you have ${r.pool.aiLeft} left)` : ""}. If the run fails, the review is given back.</p>
          {r.ai?.status === "done" && <p className="rs-xs rs-subtle" style={{ marginTop: 10 }}>The new report replaces the one on this page.</p>}
          <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
            <Btn block loading={working} disabled={!credits} onClick={rerun}><ArrowsClockwise size={16} weight="bold" aria-hidden />Use 1 AI review and run again</Btn>
            {!credits && <Btn as={Link} to="/resume-review/app/plans" variant="ghost" block>No AI reviews left · see plans</Btn>}
            <Btn variant="ghost" block onClick={() => setDialog("")}>Cancel</Btn>
          </div>
        </Modal>
      )}
      {dialog === "delete" && (
        <Modal title="Delete this review?" onClose={() => setDialog("")}>
          <p className="rs-sm rs-muted">It disappears from your reviews and can't be brought back from your account. Your credits are not given back. The resume file stays in your Vault.</p>
          <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
            <Btn variant="danger" block loading={working} onClick={remove}><Trash size={16} aria-hidden />Delete review</Btn>
            <Btn variant="ghost" block onClick={() => setDialog("")}>Keep it</Btn>
          </div>
        </Modal>
      )}
    </>
  );
}

/* The whole review page. Used by the real page and, with `preview`, by the sample on the landing page, so they never drift apart. */
export function ReviewView({ r, canAsk, pool, asking = false, onAsk, sent = false, preview = false, onRerun = null, canRerun = true, onDelete = null, deleteBlocked = false }) {
  const aiFailed = r.ai?.status === "failed";
  const st = r.humanRequested ? STATUS[r.status] || {} : aiFailed ? { label: "Report not generated", tone: "bad" } : { label: r.status === "completed" ? "Report ready" : "AI agents at work", tone: r.status === "completed" ? "ok" : "live brand" };
  const done = r.status === "completed";
  const again = `/resume-review/app/new?plan=${r.purchaseId}&from=${r.id}`;
  const p = r.profile || {};
  return (
    <div className="rs-stack rs-scope" style={{ gap: 20 }}>
      {!preview && <Link to="/resume-review/app/reviews" className="rs-back"><ArrowRight size={13} weight="bold" style={{ transform: "rotate(180deg)" }} aria-hidden />All reviews</Link>}
      <header className="rs-rv-head">
        <div className="rs-stack sm">
          <span className={cx("rs-chip", st.tone)} style={{ width: "fit-content" }}><span>{st.label}</span></span>
          <h1 className="rs-h1">{p.targetRole || "Resume review"}</h1>
          <div className="rs-rv-meta">
            <span><CalendarBlank size={14} weight="bold" aria-hidden /><em>{dateFmt(r.createdAt)}</em></span>
            {r.resume?.filename && <span><FilePdf size={14} weight="bold" aria-hidden /><em>{r.resume.filename}</em></span>}
            <span>{p.kind === "student" ? <GraduationCap size={14} weight="bold" aria-hidden /> : <Briefcase size={14} weight="bold" aria-hidden />}<em>{p.kind === "student" ? `Student${p.organization ? ` · ${p.organization}` : ""}` : `${p.currentRole || "Professional"} · ${p.experienceYears ?? 0} yr`}</em></span>
            {r.package?.name && <span><Sparkle size={14} weight="bold" aria-hidden /><em>{r.package.name}</em></span>}
          </div>
        </div>
        {!preview && <div className="rs-head-actions"><Btn as={Link} to={again} variant="ghost"><ArrowsClockwise size={16} weight="bold" aria-hidden />Re-check a new version</Btn></div>}
      </header>

      {sent && !done && <div className="rs-notice info rv-in"><Sparkle size={20} weight="fill" aria-hidden /><div><b>Got it, the agents are on it.</b><p>Your report appears below as they work{r.humanRequested ? `, and your reviewer adds detailed notes within ${r.package.deliveryHours} hours` : ""}. We'll email you when it's ready.</p></div></div>}

      <div className="rs-rv-grid">
        <div className="rs-stack" style={{ gap: 20 }}>
          {done && r.humanRequested && r.human && <HumanReport id={r.id} human={r.human} includes={r.package.includes} preview={preview} />}
          {!done && r.humanRequested && r.ai.status !== "pending" && (
            <div className="rs-notice info"><UserCircle size={20} weight="duotone" aria-hidden /><div><b>{r.status === "in_review" ? "A reviewer is reviewing your resume" : "Waiting for a reviewer"}</b><p>Detailed notes arrive within {r.package.deliveryHours} hours. Meanwhile, the AI report is below.</p></div></div>
          )}
          {canAsk && (
            <div className="rs-notice info">
              <UserCircle size={20} weight="duotone" aria-hidden />
              <div><b>Want a person to review this too?</b><p>You have {pool.humanLeft} human review{pool.humanLeft === 1 ? "" : "s"} left. A working professional reads it and writes detailed feedback.</p></div>
              <div className="rs-notice-act"><Btn size="sm" loading={asking} onClick={preview ? () => toast("This is a sample.") : onAsk}>Add a human review</Btn></div>
            </div>
          )}
          <AiReport ai={r.ai} includes={r.package.includes} purchaseId={preview ? "" : r.purchaseId} humanRequested={r.humanRequested} kind={p.kind} reviewId={r.id} onRerun={preview ? null : onRerun} />
        </div>
        <aside className="rs-rv-aside">
          <section className="rs-card rs-stack sm"><p className="rs-k">Progress</p><Timeline r={r} preview={preview} /></section>
          <section className="rs-card rs-stack sm">
            <p className="rs-k">What you sent</p>
            <p className="rs-sm"><span className="rs-muted">{p.kind === "student" ? "Student at" : `${p.currentRole || "Working"} at`}</span><br /><b>{p.organization}</b>{p.course && <span className="rs-muted"> · {p.course}</span>}</p>
            {r.resume?.filename && <p className="rs-row nowrap rs-sm"><FilePdf size={16} weight="duotone" aria-hidden /><b className="rs-ellipsis">{r.resume.filename}</b></p>}
            {r.linkedinUrl && <p className="rs-row nowrap rs-sm"><LinkedinLogo size={16} weight="fill" aria-hidden /><span className="rs-ellipsis">{r.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")}</span></p>}
            {r.jobDescription && <p className="rs-xs rs-muted">Job description added ({r.jobDescription.length.toLocaleString("en-IN")} characters)</p>}
            {!preview && <Btn as={Link} to={again} variant="ghost" size="sm" block><ArrowsClockwise size={15} weight="bold" aria-hidden />Re-check a new version</Btn>}
          </section>
          {!preview && (onRerun || onDelete) && (
            <section className="rs-card rs-stack sm">
              <p className="rs-k">Manage</p>
              {onRerun && <Btn variant="ghost" size="sm" block onClick={onRerun}><ArrowsClockwise size={15} weight="bold" aria-hidden />Run agents again</Btn>}
              {onRerun && canRerun && <p className="rs-xs rs-subtle">Uses 1 AI review, given back if the run fails.</p>}
              {onRerun && !canRerun && <p className="rs-xs rs-subtle">You have no AI reviews left. <Link to="/resume-review/app/plans" className="rs-link" style={{ fontSize: 12.5 }}>Add credits</Link></p>}
              {onDelete && <Btn variant="danger" size="sm" block disabled={deleteBlocked} onClick={onDelete}><Trash size={15} aria-hidden />Delete review</Btn>}
              {onDelete && deleteBlocked && <p className="rs-xs rs-subtle">A reviewer is working on this one. You can delete it once their review is delivered.</p>}
            </section>
          )}
          <p className="rs-xs rs-subtle">Need help? Reply to any email from us, or write to supporttargettrek@gmail.com.</p>
        </aside>
      </div>
    </div>
  );
}
