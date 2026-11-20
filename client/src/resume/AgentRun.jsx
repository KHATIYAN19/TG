import { ArrowsClockwise, MagnifyingGlass, PencilSimpleLine, SealCheck, ShieldCheck, Warning } from "@phosphor-icons/react";

import { Pill, Tick, cx } from "./ui";

/*
  The review agents, as they work. The server writes every step to ai.pipeline the moment it starts or ends
  (backend/services/resume/agents/pipeline.js); the review page polls every few seconds and this shows it.
*/

const AGENT = {
  planner: { name: "Planner", Icon: MagnifyingGlass, what: "Reads every line and plans the review" },
  reviewer: { name: "Reviewer", Icon: PencilSimpleLine, what: "Scores the resume and finds every mistake" },
  validator: { name: "Validator", Icon: ShieldCheck, what: "Checks the review against your resume" },
  reviser: { name: "Reviser", Icon: ArrowsClockwise, what: "Fixes what the validator found" },
  finalizer: { name: "Finalizer", Icon: SealCheck, what: "Puts your report together" },
};

const sevTone = (s) => (s === "critical" ? "bad" : s === "major" ? "warn" : "");
const CHECK_LABEL = { grounding: "Quotes are real", truth: "Nothing invented", scores: "Scores fit the rubric", coverage: "Nothing missed", specificity: "Advice is specific", consistency: "No contradictions", stage: "Right for your stage", jd: "Job description handled", completeness: "Complete", tone: "Tone" };
const AREA_LABEL = { rewrittenBullets: "Rewritten bullets", criticalIssues: "Problems", improvements: "Fixes", missingKeywords: "Keywords", sections: "Section scores", overallScore: "Overall score", atsScore: "ATS score", shortlistChance: "Shortlist chance", strengths: "Strengths", jobMatch: "Job match", experienceCheck: "Experience check", actionPlan: "Action plan", interviewRisks: "Interview questions", summary: "Summary", headline: "Headline", recruiterFirstImpression: "First impression", marketInsight: "Market insight", linkedin: "LinkedIn" };
const area = (a) => AREA_LABEL[a] || a;
const secs = (ms) => (ms > 0 ? `${Math.max(1, Math.round(ms / 1000))}s` : "");

function StepBody({ s, open }) {
  const d = s.data || {};
  if (!open || !s.data) return null;
  if (s.agent === "planner") {
    return (
      <div className="rv-agent-body">
        {d.fitNote && <p className="rv-xs rv-muted">{d.fitNote}</p>}
        {d.focus?.length > 0 && (
          <div>
            <p className="rv-agent-label">What the review will focus on</p>
            <ol className="rv-agent-list">{d.focus.map((f) => <li key={f.area}><b>{f.area}</b>{f.why && <span className="rv-muted"> · {f.why}</span>}</li>)}</ol>
          </div>
        )}
        {d.riskFlags?.length > 0 && <div><p className="rv-agent-label">Questions a recruiter may raise</p><ul className="rv-agent-list">{d.riskFlags.map((x) => <li key={x}>{x}</li>)}</ul></div>}
        {d.removeDetails?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{d.removeDetails.map((x) => <Pill key={x} className="warn">Remove: {x}</Pill>)}</div>}
      </div>
    );
  }
  if (s.agent === "reviewer") {
    return (
      <div className="rv-agent-body" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Pill>Overall {d.overallScore}</Pill><Pill>ATS {d.atsScore}</Pill><Pill>{d.critical} problems</Pill><Pill>{d.improvements} fixes</Pill><Pill>{d.rewrites} rewrites</Pill>
      </div>
    );
  }
  if (s.agent === "validator") {
    return (
      <div className="rv-agent-body">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
          <Pill className={d.verdict === "pass" ? "ok" : "warn"}>{d.verdict === "pass" ? "Passed" : "Needs changes"}</Pill>
          {d.qualityScore != null && <Pill>Quality {d.qualityScore}/100</Pill>}
          {d.counts && <span className="rv-xs rv-subtle">{d.counts.critical} critical · {d.counts.major} major · {d.counts.minor} minor{d.automated ? ` · ${d.automated} found by exact checks` : ""}</span>}
        </div>
        {d.summary && <p className="rv-xs rv-muted">{d.summary}</p>}
        {d.issues?.length > 0 && (
          <ul className="rv-agent-issues">
            {d.issues.map((i) => (
              <li key={`${i.id}-${i.problem.slice(0, 20)}`}>
                <span style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}><Pill className={sevTone(i.severity)}>{i.severity}</Pill><span className="rv-xs rv-subtle">{area(i.area)} · {CHECK_LABEL[i.check] || i.check}</span></span>
                <span className="rv-xs">{i.problem}</span>
              </li>
            ))}
          </ul>
        )}
        {d.missedProblems?.length > 0 && <div><p className="rv-agent-label">Problems the first draft missed</p><ul className="rv-agent-list">{d.missedProblems.map((x) => <li key={x}>{x}</li>)}</ul></div>}
        {d.passedChecks?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{d.passedChecks.map((c) => <Pill key={c} className="ok">{CHECK_LABEL[c] || c}</Pill>)}</div>}
      </div>
    );
  }
  if (s.agent === "reviser") {
    return (
      <div className="rv-agent-body">
        {d.changed?.length > 0 && <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{d.changed.map((c) => <Pill key={c}>{area(c)}</Pill>)}</div>}
        {d.changeLog?.length > 0 && <ul className="rv-agent-list">{d.changeLog.map((c) => <li key={`${c.issueId}-${c.change.slice(0, 20)}`} style={{ display: "flex", gap: 8 }}><Tick /><span>{c.issueId && <span className="rv-mono rv-subtle">{c.issueId} </span>}{c.change}</span></li>)}</ul>}
      </div>
    );
  }
  return null;
}

/* the steps still to come while the run is live, so the person sees the whole road */
const upcoming = (p) => {
  const has = (a) => p.steps.some((s) => s.agent === a);
  const out = [];
  if (!has("reviewer")) out.push("reviewer");
  if (!has("validator")) out.push("validator");
  if (!has("finalizer")) out.push("finalizer");
  return out;
};

export function AgentProgress({ pipeline, live = false }) {
  if (!pipeline?.steps) return null;
  const steps = pipeline.steps;
  const lastId = steps[steps.length - 1]?.id;
  const round = Math.max(0, ...steps.filter((s) => s.agent === "reviser").map((s) => s.round));
  return (
    <div className="rv-agents">
      <ol className="rv-tl">
        {steps.map((s) => {
          const A = AGENT[s.agent] || AGENT.finalizer;
          const state = s.status === "running" ? "now" : s.status === "done" ? "done" : "";
          return (
            <li key={s.id} className={cx("rv-tl-item rv-agent-step", state, s.status)}>
              <span className="rv-tl-dot" aria-hidden>{s.status === "running" ? <span className="rv-spin" style={{ width: 10, height: 10 }} /> : s.status === "failed" || s.status === "skipped" ? <Warning size={11} weight="bold" /> : <A.Icon size={11} weight="bold" />}</span>
              <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                <p className="rv-sm" style={{ fontWeight: 600 }}>{A.name}{s.round > 0 && s.agent !== "finalizer" ? ` · round ${s.round}` : ""}</p>
                <span className="rv-xs rv-subtle">{s.status === "running" ? `${s.title}…` : s.status === "skipped" ? "skipped" : s.status === "failed" ? "failed" : secs(s.ms)}</span>
              </div>
              {s.note && <p className="rv-xs rv-muted" style={{ marginTop: 2 }}>{s.note}</p>}
              <StepBody s={s} open={!live || s.id === lastId || s.agent === "validator" || s.agent === "planner"} />
            </li>
          );
        })}
        {live && pipeline.stage !== "failed" && upcoming(pipeline).map((a) => (
          <li key={`next-${a}`} className="rv-tl-item rv-agent-next">
            <span className="rv-tl-dot" aria-hidden />
            <p className="rv-sm" style={{ fontWeight: 600 }}>{AGENT[a].name}</p>
            <p className="rv-xs rv-subtle" style={{ marginTop: 2 }}>{AGENT[a].what}</p>
          </li>
        ))}
      </ol>
      {live && <p className="rv-xs rv-subtle" style={{ marginTop: 14 }}>The validator can send the review back for fixing up to {pipeline.maxRevisions} time{pipeline.maxRevisions === 1 ? "" : "s"}{round ? ` (used ${round})` : ""}. This page updates by itself.</p>}
    </div>
  );
}

/* after the run: one line on how the review was checked, with the full trail behind a click */
export function QualityCard({ quality, pipeline }) {
  if (!quality && !pipeline) return null;
  const q = quality || {};
  const passed = q.verdict === "passed";
  return (
    <section className="rv-card rv-card-pad">
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <ShieldCheck size={22} weight="duotone" style={{ color: passed ? "var(--rv-ok)" : "var(--rv-warn)" }} aria-hidden />
        <h3 className="rv-h3">How this review was checked</h3>
        <Pill className={passed ? "ok" : "warn"}>{passed ? "Passed the quality check" : "Checked, with notes"}</Pill>
        {q.qualityScore != null && <Pill>Quality {q.qualityScore}/100</Pill>}
      </div>
      <p className="rv-muted rv-sm" style={{ marginTop: 12, lineHeight: 1.7 }}>
        {q.planned ? "A planner agent first mapped your resume. " : ""}A reviewer agent wrote the report, then a separate validator agent checked every quote, rewrite and score against your resume
        {q.rounds ? ` and sent it back for fixing ${q.rounds} time${q.rounds === 1 ? "" : "s"}` : ""}.
        {q.issuesFound ? ` ${q.issuesFound} problem${q.issuesFound === 1 ? " was" : "s were"} found and worked on along the way.` : ""}
        {q.removed ? ` ${q.removed} rewrite${q.removed === 1 ? "" : "s"} that could not be verified ${q.removed === 1 ? "was" : "were"} left out.` : ""}
      </p>
      {q.summary && <p className="rv-note" style={{ marginTop: 12 }}><b>Validator:</b> {q.summary}</p>}
      {pipeline?.steps?.length > 0 && (
        <details style={{ marginTop: 16 }}>
          <summary className="rv-sm" style={{ cursor: "pointer", fontWeight: 600 }}>See every step the agents took</summary>
          <div style={{ marginTop: 16 }}><AgentProgress pipeline={pipeline} /></div>
        </details>
      )}
    </section>
  );
}
