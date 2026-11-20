import { SYSTEM, Retryable, Unreadable, askJson, clip, contextOf, defang, fence, finish, loadResume, tagRaw, wantsOf, withRetries } from "../ai.js";
import { onResume, needsRevision, runChecks, severityCount } from "./checks.js";
import { PLANNER_SYSTEM, REVISER_ADDENDUM, VALIDATOR_SYSTEM } from "./prompts.js";

/*
  THE REVIEW AGENTS (full write-up: README.md in this folder)

    1. Planner    reads the resume like an ATS parser, writes down the facts and plans what the review must cover
    2. Reviewer   writes the full review (scores, mistakes, what to change, what is missing) following the plan and the rubric
    3. Validator  audits the review against the resume, the plan and the rubric; our own exact checks run next to it
    4. Reviser    fixes what the Validator found; then the Validator checks again. At most MAX_REVISIONS rounds (default 2).
    5. Finalizer  our code: strips anything still confirmed wrong, attaches the quality report

  Every step is written to ai.pipeline as it starts and ends (onProgress), so the review page shows the agents working live.
  Only the Reviewer is essential: if the Planner, Validator or Reviser fail, the run carries on without them and says so.
*/

const intEnv = (name, def, lo, hi) => { const n = parseInt(process.env[name], 10); return Number.isFinite(n) ? Math.max(lo, Math.min(hi, n)) : def; };
const MAX_REVISIONS = () => intEnv("RESUME_AI_MAX_REVISIONS", 2, 0, 2);
const BUDGET_MS = 20 * 60 * 1000; // no new revision round starts after this; the run must end well inside the 28 minute stale window
const TIMEOUT = { planner: 180_000, reviewer: 480_000, validator: 240_000, reviser: 360_000 };

const REVIEW_KEYS = ["overallScore", "atsScore", "headline", "summary", "sections", "strengths", "improvements", "missingKeywords", "jdCheck", "rewrittenBullets", "jobMatch", "linkedin", "recruiterFirstImpression", "shortlistChance", "experienceCheck", "criticalIssues", "interviewRisks", "marketInsight", "actionPlan"];
const NOT_IN_RESULT = new Set(["reviewMode", "aiNote", "quality"]); // fields our code adds; the model never sees or changes them

/* text we show on the page: plain, short, no markup or links */
const disp = (v, n = 300) => String(v ?? "").replace(/[\u0000-\u001F\u007F​-‏‪-‮⁠-⁤﻿]/g, " ").replace(/<\/?[a-z!][^>]*>/gi, " ").replace(/\b(?:https?:\/\/|www\.)\S+/gi, "").replace(/\s+/g, " ").trim().slice(0, n);
const arr = (v, n) => (Array.isArray(v) ? v.slice(0, n) : []);
const strs = (v, n, len = 200) => arr(v, n).map((x) => disp(x, len)).filter(Boolean);
const bool = (v) => v === true;
const int = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));

/* ------------------------------ the Planner's answer, bounded ------------------------------ */
const cleanPlan = (raw) => {
  const c = raw.candidate || {};
  const p = raw.plan || {};
  return {
    candidate: { stage: ["student", "fresher", "early", "mid", "senior"].includes(c.stage) ? c.stage : "", inferredYears: Math.max(0, Math.min(60, Number(c.inferredYears) || 0)), yearsBasis: disp(c.yearsBasis, 300), primaryDomain: disp(c.primaryDomain, 120), targetRoleFit: ["aligned", "adjacent", "pivot"].includes(c.targetRoleFit) ? c.targetRoleFit : "", fitNote: disp(c.fitNote, 300) },
    sections: arr(raw.sections, 16).map((s) => ({ heading: disp(s?.heading, 60), standard: bool(s?.standard) })).filter((s) => s.heading),
    contact: { ...Object.fromEntries(["email", "emailLooksProfessional", "phone", "city", "linkedin", "github", "portfolio"].map((k) => [k, bool(raw.contact?.[k])])), personalDetailsToRemove: strs(raw.contact?.personalDetailsToRemove, 10, 120) },
    roles: arr(raw.roles, 12).map((r) => ({ title: disp(r?.title, 100), org: disp(r?.org, 100), start: disp(r?.start, 30), end: disp(r?.end, 30), bullets: int(r?.bullets, 0, 40) })).filter((r) => r.title || r.org),
    projects: arr(raw.projects, 10).map((r) => ({ name: disp(r?.name, 100), stack: strs(r?.stack, 10, 40), hasLink: bool(r?.hasLink), statesResult: bool(r?.statesResult) })).filter((r) => r.name),
    education: arr(raw.education, 6).map((e) => ({ degree: disp(e?.degree, 120), institution: disp(e?.institution, 120), end: disp(e?.end, 30), grade: disp(e?.grade, 30) })).filter((e) => e.degree || e.institution),
    skills: { count: int(raw.skills?.count, 0, 300), grouped: bool(raw.skills?.grouped), softSkillsListed: strs(raw.skills?.softSkillsListed, 10, 40), hasRatingsOrBars: bool(raw.skills?.hasRatingsOrBars) },
    bullets: { total: int(raw.bullets?.total, 0, 300), withNumbers: int(raw.bullets?.withNumbers, 0, 300), weakStarts: strs(raw.bullets?.weakStarts, 8, 300), weakest: strs(raw.bullets?.weakest, 8, 300) },
    layout: { estimatedPages: Math.max(0, Math.min(10, Number(raw.layout?.estimatedPages) || 0)), signals: strs(raw.layout?.signals, 8, 200) },
    dateFindings: strs(raw.dateFindings, 6, 240),
    jdRequirements: arr(raw.jdRequirements, 25).map((j) => ({ term: disp(j?.term, 60), level: j?.level === "nice" ? "nice" : "must" })).filter((j) => j.term),
    plan: {
      rubric: p.rubric === "student" ? "student" : "professional",
      focus: arr(p.focus, 7).map((f) => ({ area: disp(f?.area, 100), why: disp(f?.why, 300) })).filter((f) => f.area),
      riskFlags: strs(p.riskFlags, 8, 240),
      keywordTargets: strs(p.keywordTargets, 15, 50),
      checklist: strs(p.checklist, 12, 200),
    },
  };
};

/* the Planner can be wrong about a quote: keep only "weakest" lines that really are on the resume */
const groundPlan = (plan, text) => {
  const hay = String(text || "").toLowerCase().replace(/[“”"'’`]/g, "").replace(/[^a-z0-9%+#.\s]/g, " ").replace(/\s+/g, " ");
  if (hay.trim().length < 200) return plan;
  const set = new Set(hay.split(" "));
  const keep = (l) => onResume(l, hay, set);
  return { ...plan, bullets: { ...plan.bullets, weakStarts: plan.bullets.weakStarts.filter(keep), weakest: plan.bullets.weakest.filter(keep) } };
};

/* ------------------------------ the Validator's answer, bounded ------------------------------ */
const CHECKS = ["grounding", "truth", "scores", "coverage", "specificity", "consistency", "stage", "jd", "completeness", "tone"];
const cleanValidation = (raw) => ({
  qualityScore: int(raw.qualityScore),
  summary: disp(raw.summary, 500),
  issues: arr(raw.issues, 15).map((i, n) => ({
    id: disp(i?.id, 8) || `V${n + 1}`,
    area: disp(i?.area, 40),
    check: CHECKS.includes(i?.check) ? i.check : "consistency",
    severity: ["critical", "major", "minor"].includes(i?.severity) ? i.severity : "minor",
    problem: disp(i?.problem, 500),
    instruction: disp(i?.instruction, 500),
  })).filter((i) => i.problem),
  scoreAdjustments: arr(raw.scoreAdjustments, 10).map((s) => ({ field: disp(s?.field, 40), from: int(s?.from), to: int(s?.to), reason: disp(s?.reason, 300) })).filter((s) => s.field),
  missedProblems: strs(raw.missedProblems, 8, 300),
  passedChecks: arr(raw.passedChecks, 10).filter((c) => CHECKS.includes(c)),
});

/* the Validator's issues plus ours, without saying the same thing twice */
const mergeIssues = (model, auto) => {
  const seen = new Set(model.map((i) => `${i.area}|${i.problem.slice(0, 40).toLowerCase()}`));
  return [...auto.filter((a) => !seen.has(`${a.area}|${a.problem.slice(0, 40).toLowerCase()}`)), ...model]
    .sort((a, b) => ["critical", "major", "minor"].indexOf(a.severity) - ["critical", "major", "minor"].indexOf(b.severity));
};

const reviewForModel = (r) => Object.fromEntries(Object.entries(r).filter(([k]) => !NOT_IN_RESULT.has(k)));

/* ------------------------------ the run ------------------------------ */
export const runPipeline = async (request, active, { onProgress = () => {}, buf: bufOverride = null } = {}) => {
  const id = String(request._id || "");
  const started = Date.now();
  const maxRevisions = MAX_REVISIONS();
  const { wantsJob, wantsLinkedin } = wantsOf(request);
  const kind = request.profile?.kind;
  const years = Number(request.profile?.experienceYears) || 0;
  const filename = request.resume?.filename || "resume.pdf";

  const P = { version: 1, maxRevisions, revisions: 0, stage: "planner", startedAt: new Date(), finishedAt: null, model: active?.model || "", steps: [], usage: { input: 0, output: 0, calls: 0 } };
  const save = () => onProgress(JSON.parse(JSON.stringify(P)));
  const track = (u) => { P.usage.input += u?.input || 0; P.usage.output += u?.output || 0; P.usage.calls += 1; };
  const step = (agent, title, round = 0) => {
    const s = { id: `${agent}-${round}`, agent, round, title, status: "running", note: "", data: null, startedAt: new Date(), finishedAt: null };
    P.stage = agent;
    P.steps.push(s);
    save();
    const end = (status) => ({ note = "", data = null } = {}) => { s.status = status; s.note = disp(note, 400); s.data = data; s.finishedAt = new Date(); s.ms = s.finishedAt - s.startedAt; save(); };
    return { done: end("done"), skip: end("skipped"), fail: end("failed") };
  };
  const ask = (system, prompt, agent, { attach = false, attempts = 2 } = {}) =>
    withRetries(async (attempt) => {
      if (attempt > 1) save(); // a heartbeat, so a slow retry is never taken for a dead run
      const out = await askJson({ active, system, prompt, pdf: attach ? buf : null, filename, timeoutMs: TIMEOUT[agent] });
      track(out.usage);
      return out;
    }, { attempts, label: agent, id });

  const { buf, text } = await loadResume(request, bufOverride);
  const haveText = text.trim().length > 200;
  const resumeText = haveText ? `\n\n${fence("RESUME_TEXT", clip(defang(text), 40000))}` : "\n\nNo text could be extracted locally; read the attached PDF itself.";
  const ctx = contextOf(request, text);

  try {
    /* ---------- 1. Planner ---------- */
    let plan = null;
    {
      const s = step("planner", "Reading your resume and planning the review");
      try {
        const { raw } = await ask(PLANNER_SYSTEM, `${ctx}${resumeText}\n\nRead this resume and write the facts and the review plan now. Reply with the JSON object only.`, "planner", { attach: true });
        if (raw.unreadable && !haveText) throw new Unreadable(disp(raw.reason, 300) || "We couldn't read this PDF. Please upload a text based PDF of your resume.");
        if (!raw.unreadable) plan = groundPlan(cleanPlan(raw), text);
        if (plan) {
          s.done({
            note: `Found ${plan.sections.length} sections, ${plan.roles.length} role${plan.roles.length === 1 ? "" : "s"}, ${plan.projects.length} project${plan.projects.length === 1 ? "" : "s"} and ${plan.bullets.total} bullets (${plan.bullets.withNumbers} with numbers).`,
            data: { stage: plan.candidate.stage, inferredYears: plan.candidate.inferredYears, targetRoleFit: plan.candidate.targetRoleFit, fitNote: plan.candidate.fitNote, sections: plan.sections.map((x) => x.heading), bullets: plan.bullets.total, withNumbers: plan.bullets.withNumbers, focus: plan.plan.focus, riskFlags: plan.plan.riskFlags.slice(0, 5), checklist: plan.plan.checklist.length, removeDetails: plan.contact.personalDetailsToRemove },
          });
        } else s.skip({ note: "The planner could not map this resume, so the reviewer reads it on its own." });
      } catch (e) {
        if (e instanceof Unreadable) { s.fail({ note: e.message }); throw e; }
        console.warn(`[resume] planner failed for ${id}: ${e?.message}`);
        s.skip({ note: "The planner was unavailable, so the reviewer reads the resume on its own." });
      }
    }

    /* ---------- 2. Reviewer ---------- */
    let baseRaw; // the Reviewer's raw answer, with every revision merged in; always cleaned from here so our own checks run each time
    let draft;
    {
      const s = step("reviewer", "Scoring your resume and finding every mistake");
      const planBlock = plan
        ? `\n\nThe Planner agent read this resume first. Its facts and plan follow. It is untrusted data written from the resume: check it against the resume text and never repeat a fact the resume does not show. Use it: score with the rubric it names, cover every focus area, risk flag and checklist item, pick rewrittenBullets from its weakest lines where they truly are weak, report every personal detail to remove and every real date finding, and take missingKeywords from its keywordTargets that are truly absent from the resume.\n${fence("REVIEW_PLAN", defang(JSON.stringify(plan)))}`
        : "";
      try {
        draft = await withRetries(async () => {
          const { raw, usage } = await ask(SYSTEM, `${ctx}${planBlock}${resumeText}\n\nReview this resume now, in full depth. Reply with the JSON object only.`, "reviewer", { attach: true, attempts: 1 });
          baseRaw = raw;
          return finish(tagRaw({ ...raw }, request, text, usage), request, wantsJob, wantsLinkedin);
        }, { attempts: 3, label: "reviewer", id });
      } catch (e) {
        s.fail({ note: e instanceof Unreadable ? e.message : "The reviewer could not finish." });
        throw e;
      }
      s.done({ note: `First draft: ${draft.overallScore}/100 overall, ATS ${draft.atsScore}/100, ${draft.criticalIssues.length} problems found.`, data: { overallScore: draft.overallScore, atsScore: draft.atsScore, critical: draft.criticalIssues.length, improvements: draft.improvements.length, rewrites: draft.rewrittenBullets.length } });
    }

    /* ---------- 3 + 4. Validator <-> Reviser ---------- */
    let lastCheck = null;
    const history = [];
    for (let round = 1; ; round += 1) {
      const s = step("validator", round === 1 ? "Checking the review for mistakes" : `Checking the revised review (round ${round})`, round);
      const auto = runChecks(draft, { resumeText: text, kind, years, plan, jdStatus: draft.jdCheck?.status || "none" });
      let check;
      try {
        const prompt = `${ctx}${plan ? `\n\n${fence("PLANNER_FACTS", defang(JSON.stringify(plan)))}` : "\n\nThe Planner did not run; judge from the resume text alone."}\n\n${fence("DRAFT_REVIEW", defang(JSON.stringify(reviewForModel(draft))))}\n\n${fence("AUTOMATED_CHECKS", defang(JSON.stringify(auto)))}${resumeText}\n\nAudit the draft review now. Reply with the JSON object only.`;
        const { raw } = await ask(VALIDATOR_SYSTEM, prompt, "validator", { attach: !haveText });
        check = cleanValidation(raw);
        check.issues = mergeIssues(check.issues, auto);
        check.source = "agent";
      } catch (e) {
        console.warn(`[resume] validator failed for ${id}: ${e?.message}`);
        check = { qualityScore: null, summary: "The validator agent was unavailable, so only our automated checks ran.", issues: auto, scoreAdjustments: [], missedProblems: [], passedChecks: [], source: "automated" };
      }
      // a revision is needed exactly when a critical or major problem is open, whatever the model's own verdict said
      check.verdict = needsRevision(check.issues) || check.missedProblems.length >= 2 ? "revise" : "pass";
      check.counts = severityCount(check.issues);
      check.automated = auto.length;
      lastCheck = check;
      history.push({ round, verdict: check.verdict, qualityScore: check.qualityScore, counts: check.counts });

      const lastRound = round > maxRevisions;
      const outOfTime = Date.now() - started > BUDGET_MS;
      const verdictNote = check.verdict === "pass"
        ? `Passed${check.qualityScore != null ? ` with a quality score of ${check.qualityScore}/100` : ""}.`
        : `${check.counts.critical} critical, ${check.counts.major} major and ${check.counts.minor} minor problems in the review${lastRound || outOfTime ? "." : ", sent back for fixing."}`;
      s.done({
        note: verdictNote,
        data: {
          verdict: check.verdict, qualityScore: check.qualityScore, summary: check.summary, counts: check.counts, source: check.source, automated: auto.length,
          issues: check.issues.slice(0, 12).map((i) => ({ id: i.id, area: i.area, check: i.check, severity: i.severity, problem: i.problem })),
          missedProblems: check.missedProblems.slice(0, 6), passedChecks: check.passedChecks,
        },
      });
      if (check.verdict === "pass" || lastRound || outOfTime) break;

      /* the Reviser */
      const r = step("reviser", `Fixing what the validator found (round ${round} of ${maxRevisions})`, round);
      try {
        const report = { issues: check.issues.map(({ id: iid, area, severity, problem, instruction }) => ({ id: iid, area, severity, problem, instruction })), missedProblems: check.missedProblems, scoreAdjustments: check.scoreAdjustments };
        const prompt = `${ctx}${plan ? `\n\n${fence("PLANNER_FACTS", defang(JSON.stringify(plan)))}` : ""}\n\n${fence("PREVIOUS_REVIEW", defang(JSON.stringify(reviewForModel(draft))))}\n\n${fence("VALIDATOR_REPORT", defang(JSON.stringify(report)))}${resumeText}\n\nFix the review now. Reply with the JSON object of changed keys and the changeLog only.`;
        const { raw, usage } = await ask(SYSTEM + REVISER_ADDENDUM, prompt, "reviser", { attach: !haveText });
        const patch = Object.fromEntries(Object.entries(raw).filter(([k]) => REVIEW_KEYS.includes(k)));
        const changed = Object.keys(patch);
        if (!changed.length) throw new Retryable("The reviser changed nothing.");
        const nextRaw = { ...baseRaw, ...patch };
        const next = finish(tagRaw({ ...nextRaw }, request, text, usage), request, wantsJob, wantsLinkedin);
        const before = draft.overallScore;
        baseRaw = nextRaw;
        draft = next;
        P.revisions = round;
        const log = arr(raw.changeLog, 15).map((c) => ({ issueId: disp(c?.issueId, 8), change: disp(c?.change, 300) })).filter((c) => c.change);
        r.done({ note: `Updated ${changed.length} part${changed.length === 1 ? "" : "s"} of the review${before !== next.overallScore ? `; overall score ${before} → ${next.overallScore}` : ""}.`, data: { changed, changeLog: log, scoreFrom: before, scoreTo: next.overallScore } });
      } catch (e) {
        if (e instanceof Unreadable) throw e;
        console.warn(`[resume] reviser round ${round} failed for ${id}: ${e?.message}`);
        r.skip({ note: "The reviser could not finish this round, so the last checked version is kept." });
        break;
      }
    }

    /* ---------- 5. Finalizer (our code) ---------- */
    const f = step("finalizer", "Putting your report together");
    const result = { ...draft };
    const open = lastCheck?.issues || [];
    // what is still confirmed wrong after the last round is taken out rather than shown: a made-up line never reaches the person
    let removed = 0;
    if (haveText) {
      const finalAuto = runChecks(result, { resumeText: text, kind, years, plan, jdStatus: result.jdCheck?.status });
      const badBefore = new Set(finalAuto.filter((i) => i.area === "rewrittenBullets" && (i.check === "grounding" || i.check === "truth")).map((i) => i.problem));
      if (badBefore.size) {
        const keep = result.rewrittenBullets.filter((b) => ![...badBefore].some((p) => p.includes(String(b.before).slice(0, 140)) || p.includes(String(b.after).slice(0, 140))));
        removed += result.rewrittenBullets.length - keep.length;
        result.rewrittenBullets = keep;
      }
    }
    const openSerious = open.filter((i) => i.severity !== "minor").length;
    result.quality = {
      verdict: lastCheck?.verdict === "pass" ? "passed" : "checked",
      qualityScore: lastCheck?.qualityScore ?? null,
      rounds: P.revisions,
      maxRounds: maxRevisions,
      validations: history.length,
      firstScore: history[0]?.qualityScore ?? null,
      issuesFound: history.reduce((n, h) => n + h.counts.critical + h.counts.major + h.counts.minor, 0),
      openIssues: openSerious,
      removed,
      history,
      planned: Boolean(plan),
      summary: lastCheck?.summary || "",
    };
    f.done({ note: `${P.revisions} revision round${P.revisions === 1 ? "" : "s"}, ${history.length} validation${history.length === 1 ? "" : "s"}.${removed ? ` ${removed} unverified rewrite${removed === 1 ? "" : "s"} removed.` : ""}`, data: { overallScore: result.overallScore, verdict: result.quality.verdict, rounds: P.revisions } });

    P.stage = "done";
    P.finishedAt = new Date();
    P.ms = Date.now() - started;
    save();
    return { result, pipeline: JSON.parse(JSON.stringify(P)) };
  } catch (e) {
    P.stage = "failed";
    P.finishedAt = new Date();
    save();
    if (e && typeof e === "object") e.pipeline = JSON.parse(JSON.stringify(P));
    throw e;
  }
};

/* the pipeline as the person sees it: steps and what they found, never token counts or the model's raw reply */
export const pipelineOut = (p, { admin = false } = {}) => {
  if (!p || typeof p !== "object") return null;
  return {
    stage: p.stage, maxRevisions: p.maxRevisions, revisions: p.revisions, startedAt: p.startedAt, finishedAt: p.finishedAt,
    steps: (p.steps || []).map((s) => ({ id: s.id, agent: s.agent, round: s.round, title: s.title, status: s.status, note: s.note, data: s.data, startedAt: s.startedAt, finishedAt: s.finishedAt, ms: s.ms })),
    ...(admin ? { usage: p.usage, model: p.model, ms: p.ms } : {}),
  };
};
