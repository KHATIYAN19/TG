import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, DownloadSimple, FileText, LinkedinLogo, ListChecks, Target, Warning } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { STATUS, dateFmt, getDeliverableUrl, getRequest, myPlans, requestHuman } from "./api";
import { Bar, Btn, FormattedText, Pill, ScoreRing, Skeleton, Tick, toneOf } from "./ui";

const Section = ({ title, children, icon }) => (
  <section className="rv-card rv-card-pad">
    <h3 className="rv-h3" style={{ display: "flex", alignItems: "center", gap: 8 }}>{icon}{title}</h3>
    <div style={{ marginTop: 20 }}>{children}</div>
  </section>
);

/* ============================ the AI report ============================ */
export function AiReport({ ai, includes, purchaseId, humanRequested }) {
  if (ai.status === "failed") {
    const msg = ai.userMessage || "We couldn't generate your AI report this time.";
    return (
      <div className="rv-card rv-card-pad" role="alert" style={{ borderColor: "var(--rv-bad)" }}>
        <Pill className="bad">AI report not generated</Pill>
        <h3 className="rv-h3" style={{ marginTop: 14 }}>{msg}</h3>
        {ai.refunded && <p className="rv-muted rv-sm" style={{ marginTop: 10 }}>We've given this AI review back to your plan, so you haven't lost anything.{humanRequested ? " Your human reviewer will still go through your resume by hand." : ""}</p>}
        {!ai.refunded && humanRequested && <p className="rv-muted rv-sm" style={{ marginTop: 10 }}>Your human reviewer will still go through your resume by hand.</p>}
        {purchaseId && <div style={{ marginTop: 18 }}><Btn as={Link} to={`/resume-review/app/submit/${purchaseId}`}>Send it again <ArrowRight size={16} weight="bold" aria-hidden /></Btn></div>}
        <p className="rv-xs rv-subtle" style={{ marginTop: 14 }}>Still stuck? Write to supporttargettrek@gmail.com and we'll sort it out.</p>
      </div>
    );
  }
  if (ai.status !== "done" || !ai.result) {
    return (
      <div className="rv-card rv-card-pad">
        <h3 className="rv-h3">The AI is reading your resume…</h3>
        <p className="rv-muted rv-sm" style={{ marginTop: 8 }}>Usually under two minutes. This page updates by itself.</p>
        <div style={{ display: "grid", gap: 12, marginTop: 24 }}><Skeleton h={14} /><Skeleton h={14} style={{ width: "80%" }} /><Skeleton h={14} style={{ width: "60%" }} /></div>
      </div>
    );
  }
  const r = ai.result;
  return (
    <div style={{ display: "grid", gap: 24 }} className="rv-ai">
      <section className="rv-card rv-card-pad rv-ai-hero">
        <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
          <ScoreRing value={r.overallScore} size={136} stroke={9} label="Overall" />
          <div style={{ flex: "1 1 280px", minWidth: 0 }}>
            <Pill>AI first look</Pill>
            <h2 className="rv-h2" style={{ fontSize: 26, marginTop: 12 }}>{r.headline}</h2>
            <p className="rv-muted" style={{ marginTop: 12, lineHeight: 1.65 }}>{r.summary}</p>
            {r.recruiterFirstImpression && <p className="rv-note" style={{ marginTop: 16 }}><b>A recruiter's first 10 seconds:</b> {r.recruiterFirstImpression}</p>}
          </div>
        </div>
        <div className="rv-ai-bars" style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--rv-border)" }}>
          <div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }} className="rv-sm"><b>ATS readiness</b><span className="rv-mono">{r.atsScore}/100</span></div><Bar value={r.atsScore} tone={toneOf(r.atsScore)} /></div>
          {r.shortlistChance != null && <div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }} className="rv-sm"><b>Shortlist chance today</b><span className="rv-mono">{r.shortlistChance}%</span></div><Bar value={r.shortlistChance} tone={toneOf(r.shortlistChance)} /></div>}
          {includes?.jobMatch && r.jobMatch && <div><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }} className="rv-sm"><b>Job match</b><span className="rv-mono">{r.jobMatch.score}/100</span></div><Bar value={r.jobMatch.score} tone={toneOf(r.jobMatch.score)} /></div>}
        </div>
      </section>

      {r.experienceCheck && (
        <Section title="Experience vs the role">
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Pill className={r.experienceCheck.level === "below" ? "bad" : r.experienceCheck.level === "above" ? "" : "ok"}>{r.experienceCheck.level === "below" ? "Below what this role expects" : r.experienceCheck.level === "above" ? "Above what this role expects" : "In range for this role"}</Pill>
            {r.experienceCheck.claimedYears != null && <span className="rv-sm rv-muted">You stated {r.experienceCheck.claimedYears} year{r.experienceCheck.claimedYears === 1 ? "" : "s"}</span>}
          </div>
          {r.experienceCheck.expectedForRole && <p className="rv-sm" style={{ marginTop: 14 }}><b>What the role usually expects:</b> {r.experienceCheck.expectedForRole}</p>}
          <p className="rv-muted rv-sm" style={{ marginTop: 10, lineHeight: 1.7 }}>{r.experienceCheck.assessment}</p>
          {r.experienceCheck.gaps?.length > 0 && <ul style={{ display: "grid", gap: 10, marginTop: 16 }}>{r.experienceCheck.gaps.map((g) => <li key={g} className="rv-sm" style={{ display: "flex", gap: 10 }}><Warning size={16} weight="fill" style={{ color: "var(--rv-bad)", flexShrink: 0, marginTop: 2 }} aria-hidden />{g}</li>)}</ul>}
          {r.experienceCheck.howToBridge && <p className="rv-note" style={{ marginTop: 16 }}><b>How to close the gap:</b> {r.experienceCheck.howToBridge}</p>}
        </Section>
      )}

      {r.criticalIssues?.length > 0 && (
        <Section title="What's holding your resume back" icon={<Warning size={20} weight="fill" style={{ color: "var(--rv-bad)" }} aria-hidden />}>
          <div style={{ display: "grid", gap: 20 }}>
            {r.criticalIssues.map((c, n) => (
              <div key={c.title} className="rv-issue" style={{ paddingLeft: 16, borderLeft: `3px solid ${c.severity === "critical" ? "var(--rv-bad)" : c.severity === "major" ? "var(--rv-warn, #d97706)" : "var(--rv-border-strong)"}` }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><Pill className={c.severity === "critical" ? "bad" : c.severity === "major" ? "warn" : ""}>{c.severity}</Pill><b>{n + 1}. {c.title}</b></div>
                {c.where && <p className="rv-xs rv-subtle" style={{ marginTop: 6 }}>Where: {c.where}</p>}
                <p className="rv-sm" style={{ marginTop: 10, lineHeight: 1.7 }}>{c.whatIsWrong}</p>
                {c.impact && <p className="rv-muted rv-sm" style={{ marginTop: 8, lineHeight: 1.7 }}><b>Why it hurts:</b> {c.impact}</p>}
                {c.howToFix && <p className="rv-note" style={{ marginTop: 12 }}><b>Do this:</b> {c.howToFix}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {r.sections?.length > 0 && (
        <Section title="Section by section">
          <div className="rv-sec-grid">
            {r.sections.map((s) => (
              <div key={s.name} className="rv-sec-item"><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }} className="rv-sm"><b>{s.name}</b><span className="rv-mono rv-muted">{s.score}</span></div><Bar value={s.score} tone={toneOf(s.score)} /><p className="rv-muted rv-sm" style={{ marginTop: 10, lineHeight: 1.7 }}>{s.feedback}</p>
                {s.problems?.length > 0 && <ul style={{ display: "grid", gap: 6, marginTop: 10 }}>{s.problems.map((x) => <li key={x} className="rv-sm" style={{ display: "flex", gap: 8 }}><Warning size={14} weight="fill" style={{ color: "var(--rv-bad)", flexShrink: 0, marginTop: 3 }} aria-hidden />{x}</li>)}</ul>}
                {s.fixes?.length > 0 && <ul style={{ display: "grid", gap: 6, marginTop: 8 }}>{s.fixes.map((x) => <li key={x} className="rv-sm" style={{ display: "flex", gap: 8 }}><Tick />{x}</li>)}</ul>}</div>
            ))}
          </div>
        </Section>
      )}

      <div className="rv-two" style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))" }}>
        {r.strengths?.length > 0 && <Section title="What's working"><ul style={{ display: "grid", gap: 14 }}>{r.strengths.map((x) => <li key={x} className="rv-sm" style={{ display: "flex", gap: 10 }}><Tick />{x}</li>)}</ul></Section>}
        {r.missingKeywords?.length > 0 && <Section title="Keywords to add"><p className="rv-muted rv-sm">Recruiters search for these, and they're missing.</p><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>{r.missingKeywords.map((k) => <Pill key={k} className="warn">+ {k}</Pill>)}</div></Section>}
      </div>

      {r.improvements?.length > 0 && (
        <Section title="Fix these first">
          <ol className="rv-fix-grid">
            {r.improvements.map((i, n) => (
              <li key={i.issue} className="rv-fix-item" style={{ display: "flex", gap: 16 }}>
                <span className="rv-mono" style={{ width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 600, background: n === 0 ? "var(--rv-brand)" : "var(--rv-surface-2)", color: n === 0 ? "var(--rv-on-brand)" : "var(--rv-text)" }}>{n + 1}</span>
                <div style={{ minWidth: 0 }}><p style={{ fontWeight: 600 }}>{i.issue}</p>{i.why && <p className="rv-muted rv-sm" style={{ marginTop: 4 }}>{i.why}</p>}{i.fix && <p className="rv-note" style={{ marginTop: 12 }}><b>Do this:</b> {i.fix}</p>}</div>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {r.rewrittenBullets?.length > 0 && (
        <Section title="Bullets, rewritten">
          <p className="rv-muted rv-sm" style={{ marginTop: -8, marginBottom: 20 }}>Replace the numbers in brackets with your real figures.</p>
          <div style={{ display: "grid", gap: 16 }}>
            {r.rewrittenBullets.map((b) => (
              <div key={b.before} style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))" }}>
                <div className="rv-before"><span className="rv-xs" style={{ display: "block", fontWeight: 700, color: "var(--rv-bad)", marginBottom: 4 }}>BEFORE</span>{b.before}</div>
                <div className="rv-after"><span className="rv-xs" style={{ display: "block", fontWeight: 700, color: "var(--rv-ok)", marginBottom: 4 }}>AFTER</span>{b.after}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {includes?.jobMatch && r.jobMatch && (
        <Section title="Match with your job" icon={<Target size={20} aria-hidden />}>
          <p className="rv-muted rv-sm">{r.jobMatch.advice}</p>
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(240px, 100%), 1fr))", marginTop: 20 }}>
            <div><p className="rv-xs" style={{ fontWeight: 700, color: "var(--rv-ok)", marginBottom: 8 }}>YOU ALREADY SHOW</p><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{r.jobMatch.matched.map((k) => <Pill key={k} className="ok">{k}</Pill>)}</div></div>
            <div><p className="rv-xs" style={{ fontWeight: 700, color: "var(--rv-bad)", marginBottom: 8 }}>MISSING</p><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{r.jobMatch.missing.map((k) => <Pill key={k} className="bad">{k}</Pill>)}</div></div>
          </div>
        </Section>
      )}

      {includes?.linkedin && r.linkedin && (
        <Section title="LinkedIn ideas" icon={<LinkedinLogo size={20} weight="fill" aria-hidden />}>
          <div style={{ display: "grid", gap: 14 }} className="rv-sm">
            {r.linkedin.headlineIdea && <div className="rv-note"><b>Headline idea:</b> {r.linkedin.headlineIdea}</div>}
            {r.linkedin.aboutIdea && <div className="rv-note"><b>About section idea:</b> {r.linkedin.aboutIdea}</div>}
            {r.linkedin.tips?.length > 0 && <ul style={{ display: "grid", gap: 10 }}>{r.linkedin.tips.map((t) => <li key={t} style={{ display: "flex", gap: 10 }}><Tick />{t}</li>)}</ul>}
            <p className="rv-hint">The AI can't open LinkedIn. Your reviewer checks your live profile for the real feedback.</p>
          </div>
        </Section>
      )}

      {r.interviewRisks?.length > 0 && (
        <Section title="Questions this resume will invite">
          <div style={{ display: "grid", gap: 18 }}>
            {r.interviewRisks.map((q) => (
              <div key={q.question}><p style={{ fontWeight: 600 }}>"{q.question}"</p>{q.whyTheyAsk && <p className="rv-muted rv-sm" style={{ marginTop: 4 }}>{q.whyTheyAsk}</p>}<p className="rv-note" style={{ marginTop: 8 }}><b>Prepare:</b> {q.prepare}</p></div>
            ))}
          </div>
        </Section>
      )}

      {r.marketInsight && <Section title="How this profile looks in the market"><p className="rv-muted rv-sm" style={{ lineHeight: 1.75 }}>{r.marketInsight}</p></Section>}

      {r.actionPlan?.length > 0 && (
        <Section title="Your plan for this week" icon={<ListChecks size={20} aria-hidden />}>
          <ol style={{ display: "grid", gap: 16 }}>
            {r.actionPlan.map((a, n) => (
              <li key={a.step} style={{ display: "flex", gap: 14 }}>
                <span className="rv-mono" style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, background: "var(--rv-surface-2)" }}>{n + 1}</span>
                <div style={{ minWidth: 0 }}><p className="rv-sm" style={{ fontWeight: 600 }}>{a.step}</p>{(a.effort || a.payoff) && <p className="rv-xs rv-subtle" style={{ marginTop: 3 }}>{[a.effort, a.payoff].filter(Boolean).join(" · ")}</p>}</div>
              </li>
            ))}
          </ol>
        </Section>
      )}
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
    <section className="rv-card" style={{ border: "2px solid var(--rv-brand)", overflow: "hidden" }}>
      <div className="rv-panel" style={{ borderRadius: 0, padding: 28, display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ background: "var(--rv-bg)", borderRadius: "50%", padding: 6, color: "var(--rv-text)" }}><ScoreRing value={human.score ?? 0} size={104} stroke={8} label="Reviewer" /></div>
        <div style={{ minWidth: 0 }}>
          <Pill>Human review</Pill>
          <h2 className="rv-h2" style={{ fontSize: 28, marginTop: 12 }}>{human.reviewerName ? `Notes from ${human.reviewerName.split(" ")[0]}` : "Notes from your reviewer"}</h2>
          {human.completedAt && <p style={{ marginTop: 4, fontSize: 14, color: "var(--rv-panel-muted)" }}>Delivered {dateFmt(human.completedAt)}</p>}
        </div>
      </div>
      <div style={{ padding: 28, display: "grid", gap: 32 }}>
        {human.deliverable && (
          <div className="rv-note" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}><FileText size={28} weight="duotone" aria-hidden /><span><b>Your rewritten resume</b><br /><span className="rv-subtle" style={{ wordBreak: "break-all" }}>{human.deliverable.filename}</span></span></span>
            <Btn loading={busy} onClick={download}><DownloadSimple size={16} weight="bold" aria-hidden />Download</Btn>
          </div>
        )}
        {human.summary && <FormattedText text={human.summary} />}
        {human.detailedFeedback && <div><h3 className="rv-h3" style={{ marginBottom: 12 }}>Detailed feedback</h3><FormattedText text={human.detailedFeedback} /></div>}
        <div style={{ display: "grid", gap: 32, gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))" }}>
          {human.strengths?.length > 0 && <div><h3 className="rv-h3">Strengths</h3><ul style={{ display: "grid", gap: 12, marginTop: 16 }}>{human.strengths.map((x) => <li key={x} className="rv-sm" style={{ display: "flex", gap: 10 }}><Tick />{x}</li>)}</ul></div>}
          {human.improvements?.length > 0 && <div><h3 className="rv-h3">What to change</h3><ol style={{ display: "grid", gap: 12, marginTop: 16 }}>{human.improvements.map((x, i) => <li key={x} className="rv-sm" style={{ display: "flex", gap: 10 }}><span className="rv-mono rv-subtle" style={{ width: 18, flexShrink: 0 }}>{i + 1}.</span>{x}</li>)}</ol></div>}
        </div>
        {includes?.linkedin && human.linkedinFeedback && <div className="rv-quote"><h3 className="rv-h3" style={{ display: "flex", gap: 8, alignItems: "center" }}><LinkedinLogo size={20} weight="fill" aria-hidden />LinkedIn</h3><div style={{ marginTop: 12 }}><FormattedText text={human.linkedinFeedback} /></div></div>}
        {human.jobMatchFeedback && <div className="rv-quote"><h3 className="rv-h3" style={{ display: "flex", gap: 8, alignItems: "center" }}><Target size={20} aria-hidden />Tailoring to your job</h3><div style={{ marginTop: 12 }}><FormattedText text={human.jobMatchFeedback} /></div></div>}
        {human.nextSteps && <div className="rv-note"><h3 className="rv-h3">Your next steps</h3><div style={{ marginTop: 12 }}><FormattedText text={human.nextSteps} /></div></div>}
      </div>
    </section>
  );
}

/* ============================ progress ============================ */
export function Timeline({ r, preview = false }) {
  const s = r.status;
  const aiDone = ["done", "failed"].includes(r.ai.status);
  const hasHuman = Boolean(r.humanRequested);
  const rows = [
    { t: "Resume received", d: dateFmt(r.createdAt), state: "done" },
    { t: "AI reads your resume", d: aiDone ? "Done" : "In progress…", state: aiDone ? "done" : "now" },
    ...(hasHuman ? [{ t: "A reviewer takes over", d: s === "completed" ? "Done" : s === "in_review" ? `${r.human.reviewerName || "A reviewer"} is on it` : aiDone ? `Within ${r.package.deliveryHours} hours` : "", state: s === "completed" ? "done" : aiDone ? "now" : "" }] : []),
    ...(preview ? [] : [{ t: hasHuman ? "Review ready" : "AI report ready", d: s === "completed" ? "Open it on the left" : "", state: s === "completed" ? "done" : "" }]),
  ];
  return (
    <ol className="rv-tl">
      {rows.map((x) => (
        <li key={x.t} className={`rv-tl-item ${x.state}`}>
          <span className="rv-tl-dot" aria-hidden />
          <p className="rv-sm" style={{ fontWeight: 600 }}>{x.t}</p>{x.d && <p className="rv-xs rv-subtle" style={{ marginTop: 2 }}>{x.d}</p>}
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
  const [pool, setPool] = useState(null);
  const [asking, setAsking] = useState(false);
  const scrolled = useRef(false);

  const load = useCallback(async () => {
    try { setR(await getRequest(id)); setError(""); } catch (e) { setError(errMsg(e)); }
  }, [id]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { myPlans().then((d) => setPool(d.summary)).catch(() => {}); }, [r?.humanRequested]);
  const askHuman = async () => {
    setAsking(true);
    try { await requestHuman(id); toast.success("A reviewer will take a look."); await load(); } catch (e) { toast.error(errMsg(e)); } finally { setAsking(false); }
  };

  // while the AI works the page keeps itself fresh; after that, a slow check for the human's answer
  useEffect(() => {
    if (!r || r.status === "completed") return undefined;
    const t = setInterval(load, r.status === "ai_reviewing" ? 5000 : 45000);
    return () => clearInterval(t);
  }, [r?.status, load]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (r && params.get("sent") && !scrolled.current) { scrolled.current = true; window.scrollTo({ top: 0 }); } }, [r, params]);

  if (error) return <div style={{ padding: "64px 0", textAlign: "center" }}><p role="alert" className="rv-err" style={{ justifyContent: "center" }}>{error}</p><Btn as={Link} to="/resume-review/app" variant="ghost" style={{ marginTop: 24 }}>Back to my space</Btn></div>;
  if (!r) return <div style={{ display: "grid", gap: 16 }}><Skeleton h={34} style={{ width: "50%" }} /><Skeleton h={260} /><Skeleton h={200} /></div>;

  const canAsk = !r.humanRequested && pool && pool.humanLeft > 0;
  return <ReviewView r={r} canAsk={canAsk} pool={pool} asking={asking} onAsk={askHuman} sent={Boolean(params.get("sent"))} />;
}

/* The whole review page. Used by the real page and, with `preview`, by the sample on the landing page, so they can never drift apart. */
export function ReviewView({ r, canAsk, pool, asking = false, onAsk, sent = false, preview = false }) {
  const aiFailed = r.ai?.status === "failed";
  const st = r.humanRequested ? STATUS[r.status] || {} : aiFailed ? { label: "AI report not generated", tone: "bad" } : { label: r.status === "completed" ? "AI report ready" : "AI is reading it", tone: r.status === "completed" ? "ok" : "" };
  const done = r.status === "completed";
  return (
    <div className={preview ? "" : "rv-dx"}>
      {!preview && <Link to="/resume-review/app" className="rv-link" style={{ textDecoration: "none", marginBottom: 24 }}><ArrowLeft size={14} weight="bold" aria-hidden />My reviews</Link>}
      <div className="rv-dx-head" style={{ marginBottom: 32 }}>
        <div style={{ minWidth: 0 }}>
          <Pill className={st.tone}>{st.label}</Pill>
          <h1 className="rv-h2" style={{ marginTop: 12 }}>{r.profile.targetRole}</h1>
          <p className="rv-muted rv-sm" style={{ marginTop: 6 }}>{r.package.name} · sent {dateFmt(r.createdAt)}</p>
        </div>
        {!preview && (
          <div className="rv-dx-head-side">
            {r.resume?.filename && <span className="rv-dx-chip"><FileText size={16} aria-hidden /><span>{r.resume.filename}</span></span>}
            <Btn as={Link} to={`/resume-review/app/submit/${r.purchaseId}`} variant="ghost">Send another version <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
          </div>
        )}
      </div>

      {sent && !done && <div className="rv-note rv-in" style={{ marginBottom: 32 }}><b>Got it.</b> Your AI report appears below in a minute or two{r.humanRequested ? `, and your reviewer will add detailed notes within ${r.package.deliveryHours} hours` : ""}. We'll email you when it's ready.</div>}

      <div style={{ display: "grid", gap: 32, gridTemplateColumns: "minmax(0, 1fr)" }} className="rv-detail-grid">
                <div style={{ minWidth: 0, display: "grid", gap: 32, alignContent: "start" }}>
          {done && r.humanRequested && r.human && <HumanReport id={r.id} human={r.human} includes={r.package.includes} preview={preview} />}
          {!done && r.humanRequested && r.ai.status !== "pending" && (
            <div className="rv-tile"><h3 className="rv-h3">{r.status === "in_review" ? `${r.human.reviewerName || "A reviewer"} is reviewing your resume` : "Waiting for a reviewer"}</h3><p className="rv-muted rv-sm" style={{ marginTop: 6 }}>Detailed notes arrive within {r.package.deliveryHours} hours. Meanwhile, the AI report is below.</p></div>
          )}
          {canAsk && (
            <div className="rv-tile" style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
              <div><h3 className="rv-h3">Want a person to review this too?</h3><p className="rv-muted rv-sm" style={{ marginTop: 6 }}>You have {pool.humanLeft} human review{pool.humanLeft === 1 ? "" : "s"} left. A working professional will read this resume and write detailed feedback.</p></div>
              <Btn loading={asking} onClick={preview ? () => toast("This is a sample.") : onAsk}>Get a human review</Btn>
            </div>
          )}
          <AiReport ai={r.ai} includes={r.package.includes} purchaseId={r.purchaseId} humanRequested={r.humanRequested} />
        </div>
        <aside className="rv-dx-aside" style={{ display: "grid", gap: 24, alignContent: "start" }}>
          <div className="rv-card" style={{ padding: 24 }}><h2 className="rv-kicker" style={{ marginBottom: 20 }}>Progress</h2><Timeline r={r} preview={preview} /></div>
          <div className="rv-card" style={{ padding: 24, display: "grid", gap: 14 }}>
            <h2 className="rv-kicker">Your submission</h2>
            <p className="rv-sm"><span className="rv-muted">{r.profile.kind === "student" ? "Student at" : `${r.profile.currentRole} at`}</span><br /><b>{r.profile.organization}</b>{r.profile.kind === "professional" && ` · ${r.profile.experienceYears} yr`}{r.profile.course && ` · ${r.profile.course}`}</p>
            {r.resume.filename && <p className="rv-sm" style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}><FileText size={16} aria-hidden /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.resume.filename}</span></p>}
            {r.linkedinUrl && <p className="rv-sm" style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600 }}><LinkedinLogo size={16} weight="fill" aria-hidden /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "")}</span></p>}
            {r.jobDescription && <p className="rv-sm rv-muted">Job description added</p>}
          </div>
          <Btn as={Link} to={`/resume-review/app/submit/${r.purchaseId}`} variant="ghost" className="rv-dx-again" onClick={preview ? (e) => e.preventDefault() : undefined}>Send another version <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
          <p className="rv-xs rv-subtle">Need help? Reply to any email from us, or write to supporttargettrek@gmail.com.</p>
        </aside>
      </div>
    </div>
  );
}
