/*
  Checks our own code runs on a review, with exact matching against the resume text. They need no AI, never miss, and cost nothing.
  The Validator gets them as confirmed findings, and the pipeline uses them to decide on a revision even when the Validator fails.

  runChecks(review, { resumeText, kind, years, plan, jdStatus }) -> [{ id, area, check, severity, problem, instruction }]
*/

const norm = (s) => String(s || "").toLowerCase().replace(/[“”"'’`]/g, "").replace(/[^a-z0-9%+#.\s]/g, " ").replace(/\s+/g, " ").trim();
const words = (s) => norm(s).split(" ").filter((w) => w.length > 2);

/* is this line (more or less) on the resume? Exact substring first, then word overlap, so a shortened quote still counts. */
export const onResume = (line, hayNorm, haySet) => {
  const n = norm(line).replace(/\.\.\.|…/g, " ").trim();
  if (!n) return false;
  if (hayNorm.includes(n.slice(0, 60))) return true;
  const w = words(n);
  if (w.length < 3) return hayNorm.includes(n);
  const hit = w.filter((x) => haySet.has(x)).length;
  return hit / w.length >= 0.75;
};

/* numbers in the rewrite that are not in the original line, nor anywhere on the resume, and are not inside [brackets] */
const NUM = /(?<![\w[])(\d+(?:[.,]\d+)?\s*(?:%|x|k|\+|lpa|cr|lakh|million|users|ms|hours|days)?)(?![\w\]])/gi;
const inventedNumbers = (before, after, hayNorm) => {
  const outside = String(after || "").replace(/\[[^\]]*\]/g, " ");
  const found = [...outside.matchAll(NUM)].map((m) => m[1].trim()).filter((x) => /\d/.test(x));
  const b = norm(before);
  return [...new Set(found.filter((x) => { const d = x.replace(/[^\d.]/g, ""); return d && !b.includes(d) && !hayNorm.includes(` ${d}`) && !hayNorm.startsWith(d); }))];
};

const GENERIC = [
  /^(add|include|use) (more )?(relevant )?keywords\.?$/i,
  /^quantify (your )?(achievements|results|impact)\.?$/i,
  /^(make|keep) (it|your resume) (concise|short|clean)\.?$/i,
  /^tailor (your|the) resume( to the job)?\.?$/i,
  /^use (strong )?action verbs\.?$/i,
];

/* the personal details an Indian resume should drop, each matched in the Planner's note and in the review */
const PERSONAL = [/photo|picture|image/i, /birth|\bdob\b/i, /marital|married/i, /gender|\bsex\b/i, /religion|caste/i, /address/i, /father|mother|parent/i, /declaration/i, /passport/i, /nationality/i];

const COUNTS = [
  ["criticalIssues", 6, 10, "major"],
  ["improvements", 4, 7, "major"],
  ["rewrittenBullets", 3, 5, "minor"],
  ["actionPlan", 5, 8, "minor"],
  ["interviewRisks", 4, 6, "minor"],
  ["strengths", 2, 6, "minor"],
];

export const runChecks = (review, { resumeText = "", kind = "professional", years = 0, plan = null, jdStatus = "none" } = {}) => {
  const out = [];
  const add = (area, check, severity, problem, instruction) => out.push({ id: `A${out.length + 1}`, area, check, severity, problem, instruction });
  const hayNorm = norm(resumeText);
  const haySet = new Set(hayNorm.split(" "));
  const haveText = hayNorm.length > 200;

  // 1. grounding: every "before" must be a real line, and no line rewritten twice
  const befores = new Set();
  for (const b of review.rewrittenBullets || []) {
    if (haveText && !onResume(b.before, hayNorm, haySet)) add("rewrittenBullets", "grounding", "critical", `The "before" line "${String(b.before).slice(0, 140)}" is not on the resume.`, "Replace it with a weak bullet copied exactly from the resume text, and rewrite that one.");
    const k = norm(b.before).slice(0, 50);
    if (befores.has(k)) add("rewrittenBullets", "consistency", "major", `The line "${String(b.before).slice(0, 100)}" is rewritten twice.`, "Rewrite a different bullet from another part of the resume instead.");
    befores.add(k);
    // 2. truth: a rewrite may not add numbers the resume never gave
    if (haveText) {
      const bad = inventedNumbers(b.before, b.after, hayNorm);
      if (bad.length) add("rewrittenBullets", "truth", "critical", `The rewrite "${String(b.after).slice(0, 140)}" adds ${bad.join(", ")}, which the resume never states.`, "Replace each invented figure with a bracketed placeholder such as [number] or [percent].");
    }
  }

  // keywords that are already on the resume are not missing
  if (haveText) {
    const present = (review.missingKeywords || []).filter((k) => { const n = norm(k); return n && (n.includes(" ") ? hayNorm.includes(n) : haySet.has(n)); });
    if (present.length) add("missingKeywords", "grounding", "major", `These "missing" keywords already appear on the resume: ${present.slice(0, 8).join(", ")}.`, "Remove them and list only terms that are truly absent from the resume.");
  }

  // 3. scores: a section scored high while it carries several problems; overall far from its sections
  for (const s of review.sections || []) {
    if (s.score >= 80 && (s.problems || []).length >= 3) add("sections", "scores", "major", `"${s.name}" is scored ${s.score} but lists ${s.problems.length} problems.`, "Lower the score to match the problems, or drop the problems that are not real.");
  }
  const crit = (review.criticalIssues || []).filter((c) => c.severity === "critical").length;
  if (review.overallScore >= 80 && crit >= 2) add("overallScore", "scores", "major", `The overall score is ${review.overallScore} but there are ${crit} critical issues that are likely to get the resume rejected.`, "Bring the section scores (and so the overall) in line with the calibration bands, or re-grade the issues if they are not really critical.");
  if (review.shortlistChance != null && review.shortlistChance >= 70 && review.overallScore < 60) add("shortlistChance", "scores", "major", `The shortlist chance (${review.shortlistChance}%) is far above what an overall score of ${review.overallScore} supports.`, "Make the shortlist chance agree with the overall score and the issues.");

  // stage fit
  if (kind !== "student" && Number(years) >= 3) {
    const asks = [...(review.improvements || []).map((i) => i.issue), ...(review.criticalIssues || []).map((c) => c.title)].filter((t) => /\b(add|missing|no|lack)\b[^.]{0,30}\bprojects?\b/i.test(t));
    if (asks.length) add("improvements", "stage", "major", `A professional with ${years} years is asked to add a Projects section ("${asks[0].slice(0, 100)}").`, "Remove that advice; experienced professionals do not need a Projects section.");
  }

  // the job description rule
  if (jdStatus !== "valid" && review.jobMatch) add("jobMatch", "jd", "major", "A job match was written although no usable job description was given.", "Set jobMatch to null.");

  // 5. specificity
  for (const i of review.improvements || []) {
    if (GENERIC.some((g) => g.test(String(i.fix || "").trim()))) add("improvements", "specificity", "major", `The fix "${i.fix}" is generic and does not point at this resume.`, "Rewrite it to name the exact lines or section and give a concrete example.");
  }
  for (const s of review.sections || []) if (String(s.feedback || "").split(/[.!?]\s/).filter(Boolean).length < 2) add("sections", "completeness", "minor", `The feedback for "${s.name}" is a single line.`, "Write 3 to 5 sentences of real analysis for that section.");

  // 6. consistency: the same thing praised and criticised
  const strengths = (review.strengths || []).map(norm);
  for (const c of review.criticalIssues || []) {
    const t = words(c.title).filter((w) => w.length > 4);
    const clash = strengths.find((s) => t.length >= 2 && t.filter((w) => s.includes(w)).length >= Math.min(3, t.length));
    if (clash) add("strengths", "consistency", "minor", `"${c.title}" is a critical issue but a strength says something very similar.`, "Keep only the one that is true for this resume.");
  }

  // 9. completeness
  for (const [k, min, max, sev] of COUNTS) {
    const n = (review[k] || []).length;
    if (n < min) add(k, "completeness", sev, `${k} has ${n} item${n === 1 ? "" : "s"}; the review needs ${min} to ${max}.`, `Add real, resume-specific items to reach at least ${min}, without padding.`);
  }

  // 4. coverage: what the Planner found that the review never mentions
  if (plan) {
    const all = norm(JSON.stringify(review));
    for (const d of (plan.contact?.personalDetailsToRemove || []).slice(0, 6)) {
      const kind = PERSONAL.find((p) => p.test(d));
      if (kind && !kind.test(all)) add("criticalIssues", "coverage", "major", `The resume shows "${d}", which should be removed, but the review never mentions it.`, "Add it to criticalIssues or improvements with the India-context reason to remove it.");
    }
    const weak = (plan.bullets?.weakStarts || []).length;
    if (weak >= 3 && !/responsible for|worked on|weak (verb|start|opener)|action verb|helped/i.test(JSON.stringify(review))) add("improvements", "coverage", "major", `${weak} bullets start with weak openers (for example "${String(plan.bullets.weakStarts[0]).slice(0, 80)}"), and the review never says so.`, "Add an improvement naming these bullets and showing how to start them with a strong verb and a result.");
    for (const f of (plan.dateFindings || []).slice(0, 4)) {
      const key = words(f).filter((w) => w.length > 4).slice(0, 2);
      if (key.length && !key.some((w) => all.includes(w))) add("criticalIssues", "coverage", "minor", `The Planner found a date problem ("${String(f).slice(0, 120)}") that the review does not mention.`, "Mention it if it is real, with how to explain or fix it.");
    }
  }
  return out;
};

export const severityCount = (issues) => issues.reduce((a, i) => ({ ...a, [i.severity]: (a[i.severity] || 0) + 1 }), { critical: 0, major: 0, minor: 0 });
export const needsRevision = (issues) => issues.some((i) => i.severity === "critical" || i.severity === "major");
