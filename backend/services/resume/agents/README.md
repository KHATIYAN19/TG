# Resume review agents

The AI review of an uploaded resume is written by a team of agents instead of one prompt. One agent writes the review and a different agent checks it, so the validator catches what the writer missed. The page shows each step while it runs.

```
 upload ─▶ 1. PLANNER ─▶ 2. REVIEWER ─▶ 3. VALIDATOR ──pass──▶ 5. FINALIZER ─▶ report
                                            │   ▲
                                     revise │   │ re-check
                                            ▼   │
                                         4. REVISER     (at most 2 rounds: RESUME_AI_MAX_REVISIONS)
```

| # | Agent | Model call? | Input | Output | If it fails |
|---|-------|-------------|-------|--------|-------------|
| 1 | Planner | yes, with the PDF | resume (PDF + extracted text), person's details, JD | facts (sections, roles, bullets, contact, layout signals, date findings, JD requirements) + plan (rubric, focus areas, risk flags, keyword targets, checklist) | skipped; the Reviewer works without a plan |
| 2 | Reviewer | yes, with the PDF | everything above + plan | the full review JSON (same schema as before, `SYSTEM` rubric in `../ai.js`) | whole run fails, AI credit refunded (unchanged behaviour) |
| 3 | Validator | yes (PDF only if no text) | review draft, plan, resume text, **automated checks** | verdict, quality score, issues (id, area, check, severity, problem, instruction), score adjustments, missed problems | automated checks alone decide |
| 4 | Reviser | yes (PDF only if no text) | previous review + validator report | only the top-level keys it changed + `changeLog` | keeps the last checked version |
| 5 | Finalizer | no, our code | final draft + last validation | drops rewrites still confirmed wrong, attaches `result.quality` | n/a |

Files: `prompts.js` (Planner, Validator, Reviser prompts), `checks.js` (exact checks, no AI), `pipeline.js` (the run), `../ai.js` (rubric, model call, cleaning, claim/refund).

## Step by step

1. **Claim.** `runAiReview` claims the request with a fresh `ai.runId` and `ai.heartbeatAt`. Every later write is filtered on that `runId`, so a run that gets taken over (an admin re-run, or a crashed server's run picked up after 28 min without a heartbeat) can never overwrite the newer one.
2. **Load once.** The PDF comes from S3 once and its text is pulled out locally (`extractText`). Every agent reads the same text.
3. **Planner.** Reads the resume the way an ATS parser and a recruiter would. It copies weak bullets word for word. Our code then drops any "weakest" line that isn't actually in the text (`groundPlan`), so the Reviewer never gets a quote that doesn't exist. If the Planner says the file can't be read and our text extraction also found nothing, the run stops with the "unreadable" message.
4. **Reviewer.** Uses the same rubric as the old single-pass prompt, with the plan added as fenced data. Its answer goes through `clean()` (bounds, URL and markup stripping, prompt-leak check, keyword and date checks, weighted overall score), the same as before.
5. **Validator + exact checks.** `runChecks` first matches the draft exactly against the resume text:
   - a rewritten bullet's `before` is not on the resume (critical)
   - a rewrite adds a number that is in neither the original line nor the resume and isn't a `[placeholder]` (critical)
   - a "missing" keyword is already on the resume
   - the same line is rewritten twice
   - a section scored 80+ but listing 3+ problems, overall 80+ with 2+ critical issues, or a shortlist chance far above the score
   - a 3+ year professional asked to add Projects; a job match written without a valid JD
   - generic fixes ("Quantify your achievements"); one-line section feedback
   - lists that are too short; personal details, weak openers or date problems the Planner found but the review never mentions

   Then the Validator agent audits ten things in order: grounding, truth, scores, coverage, specificity, consistency, stage, JD, completeness and tone. It gets the exact-check findings as confirmed. **The verdict is ours, not the model's:** `revise` whenever any critical or major issue is open, or 2 or more problems were missed.
6. **Reviser.** Gets the previous review and the validator report. It returns only the keys it changed, each with its full value, plus a change log. We merge the patch into the Reviewer's raw answer and run `clean()` again, so every deterministic guard runs on every version. An empty or broken patch leaves the last version in place.
7. **Loop.** Validate, then revise, up to `maxRevisions` (default 2, max 2). After the last revision the Validator runs once more for the report but can't send the review back again. No new round starts after 20 minutes.
8. **Finalizer.** Runs the exact checks one last time and removes any rewritten bullet that is still confirmed invented. It writes `result.quality` = `{ verdict: passed|checked, qualityScore, rounds, validations, issuesFound, openIssues, removed, history[], summary }`.
9. **Save.** `ai.result` holds the review and `ai.pipeline` holds the trail. The status moves on as before (human review queue or completed, email when completed).

## Live updates

Each step is pushed to `ai.pipeline` when it starts and when it ends (about 10 small writes per run), and `ai.heartbeatAt` is updated with each one. `GET /api/resume/requests/:id` returns it through `pipelineOut` (no token usage or model name for members; admins see both). The review page polls every 2.5 s while the AI runs and renders `AgentProgress` (`client/src/resume/AgentRun.jsx`): finished steps with their findings, the running step with a spinner, and the steps still to come greyed out. When the run is done, `QualityCard` sums up how the review was checked, with the full trail one click away. Admins see the same view, refreshed every 3 s; it only replaces `r.ai`, so a reviewer's unsaved edits are safe.

Polling over the database was chosen over SSE or websockets on purpose. It works across several server instances and survives a restart mid-run, and a run takes minutes, so a 2.5 s delay doesn't matter.

## Cost and time

A typical run makes 5 calls: Planner, Reviewer, Validator, Reviser, Validator. That's about 2.5x the tokens of the old single pass. The Reviser writes only changed keys, and the Validator and Reviser get text without the PDF. Best case is 3 calls (pass on the first check), worst case 7. Expect 3 to 6 minutes. Admins see `pipeline.usage` (input/output tokens, calls).

## Switches

| Env | Default | Effect |
|-----|---------|--------|
| `RESUME_AI_PIPELINE` | `on` | `off` = old single-pass review |
| `RESUME_AI_MAX_REVISIONS` | `2` | 0 to 2 validator send-backs |
| (existing) admin model picker | | all agents use the active model |

## What the prompts are built on (resume review research)

- **ATS parsing first.** Applicant tracking systems (Workday, Greenhouse, Lever, Taleo, Naukri RMS) parse text into fields before any person reads it. Columns, tables, text boxes, icons, skill bars, contact details only in a header or footer, and non-standard headings are the usual reasons a parse fails. So the Planner records layout signals and non-standard headings, and the ATS score is checked against them.
- **The recruiter's first skim.** Eye-tracking studies of recruiters (Ladders, 2012 and 2018) found the first pass takes seconds and lands on titles, companies, dates and the top third of page one. That is why there is a `recruiterFirstImpression` and why the plan's focus areas are ranked by shortlisting impact.
- **Impact bullets.** Action verb + what + how/with what + measurable result (Google's "X-Y-Z" pattern: accomplished X, measured by Y, by doing Z). The Planner counts bullets with numbers and weak openers, and the Reviewer rewrites the weakest ones.
- **The truth rule.** A reviewer that invents metrics does harm: the candidate gets asked about them in interviews. Rewrites may only restate facts, and gaps become `[placeholders]`. This is enforced twice, by the Validator's truth check and by the exact invented-number check.
- **Stage-appropriate judging.** Students and freshers are judged on projects, internships, fundamentals and one page. Professionals are judged on scope, ownership and impact. That gives two weight tables, the Projects rule for 3+ years, and Education at the top for students.
- **India context.** Drop the photo, DOB, marital status, full address and "Declaration". A short targeted summary beats a generic objective. CGPA is fine for freshers. GitHub, LeetCode or a portfolio helps tech roles.
- **Keyword match without stuffing.** Keywords come from a valid JD, or from the target role when there is no JD. Anything already on the resume is dropped, and the candidate is never told to claim a skill they don't show.
- **Writer and checker separation.** A model checking its own answer in the same call tends to approve it. A separate validator with a strict checklist, plus exact non-AI checks, catches invented quotes, rewrites that drift from the facts, and scores that drift from the rubric. Capping the loop at two rounds limits cost and stops the review swinging back and forth.

## Extending it

- New exact check: add it to `runChecks` with `area`, `check`, `severity` and an `instruction` the Reviser can act on. Critical and major findings trigger a revision.
- New review field: add it to `SYSTEM` and `clean()` in `../ai.js`, to `REVIEW_KEYS` in `pipeline.js` (so the Reviser can patch it), and to `AiReport` in `client/src/resume/ResumeDetail.jsx`.
- Different model per agent: `ask()` in `pipeline.js` is the single place that picks `active`.
- Tests: `node --test tests/resume/agents.test.mjs` (a fake model plays every agent).
