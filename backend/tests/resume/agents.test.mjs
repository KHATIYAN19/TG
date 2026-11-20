/*
  Offline checks for the resume review agents (no database, no S3, no real AI): fetch is faked and answers as each agent.
  Run: node --test tests/resume/agents.test.mjs
*/
import test from "node:test";
import assert from "node:assert/strict";

process.env.ANTHROPIC_API_KEY = "test-key";
process.env.RESUME_AI_MAX_REVISIONS = "2";

const { runPipeline, pipelineOut } = await import("../../services/resume/agents/pipeline.js");
const { runChecks } = await import("../../services/resume/agents/checks.js");

const ACTIVE = { provider: "anthropic", model: "claude-sonnet-5-5" };
const request = { _id: "r1", profile: { kind: "student", targetRole: "Backend Engineer" }, packageSnapshot: { includes: {} }, jobDescription: "", notes: "", resume: { filename: "cv.pdf" } };

const section = (name, score) => ({ name, score, feedback: `The ${name} section is reasonable. It could show more results. Here is what to change.` });
const review = (extra = {}) => ({
  overallScore: 60, atsScore: 70, headline: "Clear projects, weak results.", summary: "Decent for a fresher. Results are missing. Fix bullets first.",
  sections: ["Summary", "Education", "Projects", "Skills", "Experience", "Formatting"].map((n) => section(n, 60)),
  strengths: ["Good stack", "Clean layout", "Relevant degree"],
  improvements: [1, 2, 3, 4].map((i) => ({ issue: `Issue ${i} in Projects`, why: "Recruiters skip it.", fix: `Rewrite project bullet ${i} with [result].` })),
  missingKeywords: ["Docker"], jdCheck: { status: "none", note: "" },
  rewrittenBullets: [1, 2, 3].map((i) => ({ before: `Worked on API ${i}`, after: `Built API ${i} that [result]` })),
  criticalIssues: [1, 2, 3, 4, 5, 6].map((i) => ({ title: `Problem ${i}`, severity: "major", where: "Projects", whatIsWrong: "It is vague.", impact: "Rejected.", howToFix: "Add [number]." })),
  interviewRisks: [1, 2, 3, 4].map((i) => ({ question: `Q${i}?`, whyTheyAsk: "Because.", prepare: "Prepare." })),
  actionPlan: [1, 2, 3, 4, 5].map((i) => ({ step: `Step ${i}`, effort: "1 hour", payoff: "Better" })),
  marketInsight: "Competitive.", recruiterFirstImpression: "Okay.", shortlistChance: 30,
  experienceCheck: { level: "meets", claimedYears: 0, expectedForRole: "Entry level", assessment: "Fine.", gaps: [], howToBridge: "Build." },
  ...extra,
});
const PLAN = { candidate: { stage: "student", inferredYears: 0, targetRoleFit: "aligned" }, sections: [{ heading: "Education", standard: true }], contact: {}, roles: [], projects: [{ name: "Shop API", stack: ["Node"] }], education: [], skills: {}, bullets: { total: 9, withNumbers: 1, weakStarts: [], weakest: [] }, layout: {}, dateFindings: [], jdRequirements: [], plan: { rubric: "student", focus: [{ area: "Project results", why: "Only 1 of 9 bullets has a number" }], riskFlags: [], keywordTargets: ["Docker"], checklist: ["Does each project show a result?"] } };

/* answers as whichever agent the system prompt belongs to; `validator(round)` decides the Validator's verdict */
const fakeAi = ({ validator }) => {
  const calls = { planner: 0, reviewer: 0, validator: 0, reviser: 0 };
  globalThis.fetch = async (_url, init) => {
    const body = JSON.parse(init.body);
    const sys = body.system;
    let answer;
    if (sys.includes("You are the Planner")) { calls.planner += 1; answer = PLAN; }
    else if (sys.includes("You are the Validator")) { calls.validator += 1; answer = validator(calls.validator); }
    else if (sys.includes("REVISION MODE")) { calls.reviser += 1; answer = { overallScore: 55, sections: review().sections.map((s) => ({ ...s, score: 55 })), changeLog: [{ issueId: "V1", change: "Lowered the section scores." }] }; }
    else { calls.reviewer += 1; answer = review(); }
    return new Response(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(answer) }], stop_reason: "end_turn", usage: { input_tokens: 100, output_tokens: 50 } }), { status: 200 });
  };
  return calls;
};
const revise = { verdict: "revise", qualityScore: 60, summary: "Scores too high.", issues: [{ id: "V1", area: "sections", check: "scores", severity: "major", problem: "Projects scored too high for vague bullets.", instruction: "Lower it." }], missedProblems: [], passedChecks: ["tone"] };
const pass = { verdict: "pass", qualityScore: 92, summary: "All good.", issues: [], missedProblems: [], passedChecks: ["grounding", "truth", "scores"] };

test("validator sends the review back once, then passes", async () => {
  const calls = fakeAi({ validator: (n) => (n === 1 ? revise : pass) });
  const seen = [];
  const { result, pipeline } = await runPipeline(request, ACTIVE, { onProgress: (p) => seen.push(p.stage) });
  assert.deepEqual(calls, { planner: 1, reviewer: 1, validator: 2, reviser: 1 });
  assert.equal(result.quality.verdict, "passed");
  assert.equal(result.quality.rounds, 1);
  assert.equal(result.sections[0].score, 55); // the reviser's patch was merged and re-cleaned
  assert.deepEqual(pipeline.steps.map((s) => s.agent), ["planner", "reviewer", "validator", "reviser", "validator", "finalizer"]);
  assert.ok(pipeline.steps.every((s) => s.status === "done"));
  assert.ok(seen.includes("reviser"), "progress is reported while it runs");
  assert.equal(pipelineOut(pipeline).usage, undefined, "token usage is for admins only");
  assert.equal(pipelineOut(pipeline, { admin: true }).usage.calls, 5); // the finalizer is our code, not an AI call
});

test("never more than two revision rounds", async () => {
  const calls = fakeAi({ validator: () => revise });
  const { result, pipeline } = await runPipeline(request, ACTIVE);
  assert.equal(calls.reviser, 2);
  assert.equal(calls.validator, 3); // the last check after round two is reported, not acted on
  assert.equal(result.quality.verdict, "checked");
  assert.equal(pipeline.revisions, 2);
});

test("a failing validator does not stop the review", async () => {
  fakeAi({ validator: () => { throw new Error("boom"); } });
  const { result, pipeline } = await runPipeline(request, ACTIVE);
  assert.ok(result.headline);
  const v = pipeline.steps.find((s) => s.agent === "validator");
  assert.equal(v.data.source, "automated");
});

test("exact checks catch invented lines, invented numbers and keywords already present", () => {
  const text = `Education B.Tech Computer Science 2025. Projects Shop API built with Node.js and MongoDB for the college canteen. Worked on login page for the app. Skills Docker Python Git. ${"filler words to make this resume long enough for the checks ".repeat(4)}`;
  const issues = runChecks(review({
    missingKeywords: ["Docker", "Kubernetes"],
    rewrittenBullets: [
      { before: "Worked on login page for the app", after: "Built the login page, cutting sign-in time by 40%" },
      { before: "Led a team of 12 engineers at Google", after: "Led [number] engineers" },
      { before: "Shop API built with Node.js and MongoDB", after: "Built a Node.js API that [result]" },
    ],
  }), { resumeText: text, kind: "student" });
  const has = (check, needle) => issues.some((i) => i.check === check && i.problem.includes(needle));
  assert.ok(has("truth", "40%"), "invented number");
  assert.ok(has("grounding", "Led a team of 12"), "line not on the resume");
  assert.ok(has("grounding", "Docker"), "keyword already on the resume");
  assert.ok(!has("grounding", "Kubernetes"));
  assert.ok(!issues.some((i) => i.problem.includes("Shop API built")), "a real line passes");
});

test("the job description is judged by the AI alone", async () => {
  const { __test } = await import("../../services/resume/ai.js");
  const raw = (jd) => ({ ...review(), ...(jd === undefined ? {} : { jdCheck: jd }) });
  const run = (r, jobDescription) => __test.clean(r, true, false, "student", 0, "", { jobDescription, resumeText: "", targetRole: "Backend Engineer" });
  // text that a keyword rule would call "not a job description" is still used when the AI says it is one
  assert.equal(run(raw({ status: "valid", note: "" }), "Need node dev").jdCheck.status, "valid");
  assert.equal(run(raw({ status: "not_a_jd", note: "This is a bio." }), "Long text ".repeat(30)).reviewMode, "general");
  // a pasted text without the AI's verdict is never guessed: the answer is retried
  assert.throws(() => run(raw(undefined), "Some pasted text"), /did not judge/);
  // nothing pasted: no verdict needed
  assert.equal(run(raw(undefined), "").jdCheck.status, "none");
});
