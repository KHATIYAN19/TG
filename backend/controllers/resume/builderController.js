import asyncHandler from "express-async-handler";
import { z } from "zod";

import ResumeDraft from "../../models/resume/ResumeDraft.js";
import User from "../../models/User.js";
import { ResumeError, assertId, assertNotBlocked, parse, sendError } from "../../services/resume/service.js";
import { renderResumePdf } from "../../services/resume/builderPdf.js";
import { analyze, itemsOf, tailor } from "../../services/resume/tailorAi.js";
import { allowedSet, cleanUrl, guardInput, labelFor, normUrl } from "../../services/resume/resumeSource.js";
import { getObjectBuffer, headObject, keyBelongsTo, userPrefix } from "../../services/storage/s3.js";
import { assertBuilderOpen, builderStatusFor, refundBuilder, refundDraftCredit, spendBuilder } from "../../services/resume/builderAccess.js";

const uid = (req) => String(req.user?.id || req.user?._id);
const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });
const handler = (fn) => asyncHandler(async (req, res) => { try { await fn(req, res); } catch (err) { return sendError(res, err); } });

const MAX_DRAFTS = 10;
const t = (n) => z.string().trim().max(n).default("");
const bullets = z.array(z.string().trim().max(400)).max(10).default([]);

/* the whole draft is saved on every step, so one schema covers every field; unknown keys are dropped */
const draftSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  template: z.enum(["classic", "modern", "executive", "minimal", "tech", "compact"]).optional(),
  design: z.object({ accent: z.string().trim().regex(/^(#[0-9a-fA-F]{6})?$/).default(""), spacing: z.enum(["comfortable", "standard", "tight"]).default("standard") }).optional(),
  kind: z.enum(["student", "professional"]).optional(),
  step: z.number().int().min(0).max(20).optional(),
  basics: z.object({ name: t(80), headline: t(120), email: t(120), phone: t(30), location: t(80) }).optional(),
  links: z.array(z.object({ label: t(30), url: t(300) })).max(10).optional(),
  summary: t(900).optional(),
  education: z.array(z.object({ school: t(140), degree: t(140), start: t(20), end: t(20), score: t(40), notes: t(300) })).max(6).optional(),
  experience: z.array(z.object({ company: t(140), role: t(120), location: t(80), start: t(20), end: t(20), current: z.boolean().default(false), bullets })).max(10).optional(),
  projects: z.array(z.object({ name: t(120), tech: t(200), link: t(300), repo: t(300), bullets })).max(10).optional(),
  skills: z.array(z.object({ group: t(40), items: z.array(z.string().trim().max(60)).max(40).default([]) })).max(10).optional(),
  extras: z.array(z.object({ heading: t(40), items: z.array(z.string().trim().max(300)).max(10).default([]) })).max(6).optional(),
});

const draftOut = (d) => ({
  id: String(d._id),
  title: d.title,
  template: d.template,
  design: { accent: d.design?.accent || "", spacing: d.design?.spacing || "standard" },
  jdKeywords: d.jdKeywords || [],
  keywordSource: d.keywordSource || "role",
  /* the projects and jobs a skill can be placed in (the question lets the person pick one) */
  targets: d.base ? itemsOf(d.base).map((x) => ({ id: x.id, kind: x.kind, label: x.label })) : [],
  kind: d.kind,
  step: d.step,
  phase: d.phase,
  error: d.error || "",
  failedStep: d.failedStep || "",
  source: { jobTitle: d.source?.jobTitle || "", targetRole: d.source?.targetRole || "", resumeFilename: d.source?.resumeFilename || "" },
  gaps: d.gaps || [],
  basics: d.basics,
  links: d.links,
  summary: d.summary,
  education: d.education,
  experience: d.experience,
  projects: d.projects,
  skills: d.skills,
  extras: d.extras,
  updatedAt: d.updatedAt,
  createdAt: d.createdAt,
});

/* the builder can be switched off by an admin (everywhere, or for new members only): every endpoint checks it */
const open = (fn) => handler(async (req, res) => { await assertBuilderOpen(uid(req)); await fn(req, res); });

const own = async (req) => {
  const d = await ResumeDraft.findOne({ _id: assertId(req.params.id, "draft"), user: uid(req) });
  if (!d) throw new ResumeError(404, "That resume was not found.", "NOT_FOUND");
  return d;
};

/* what the page needs to know first: is the builder on for this person, and how many credits are left */
export const status = handler(async (req, res) => ok(res, await builderStatusFor(uid(req))));

export const listDrafts = open(async (req, res) => {
  const items = await ResumeDraft.find({ user: uid(req) }).sort({ updatedAt: -1 }).limit(MAX_DRAFTS).select("title template phase basics.name basics.headline gaps.status updatedAt").lean();
  ok(res, { items: items.map((d) => ({ id: String(d._id), title: d.title, template: d.template, phase: d.phase, openQuestions: (d.gaps || []).filter((g) => g.status === "open").length, name: d.basics?.name || "", headline: d.basics?.headline || "", updatedAt: d.updatedAt })) });
});

export const getDraft = open(async (req, res) => ok(res, draftOut(await unstick(await own(req)))));

export const saveDraft = open(async (req, res) => {
  const d = await own(req);
  if (["reading", "writing"].includes(d.phase)) throw new ResumeError(409, "The AI is still working on this resume. Please wait a moment.", "BUSY");
  d.set(parse(draftSchema, guardInput(req.body, "your resume")));
  await d.save();
  ok(res, { id: String(d._id), updatedAt: d.updatedAt });
});

export const deleteDraft = open(async (req, res) => {
  const d = await own(req);
  const refunded = await refundDraftCredit(d); // never written = no charge
  await d.deleteOne();
  ok(res, { deleted: true, refunded });
});

/* the PDF, drawn fresh from the saved draft. ?download=1 makes the browser save it instead of showing it. */
export const draftPdf = open(async (req, res) => {
  const d = await own(req);
  const { buf, pages } = await renderResumePdf(d);
  const file = `${(d.basics?.name || "resume").replace(/[^\w.-]+/g, "_").slice(0, 60) || "resume"}_resume.pdf`;
  res.set({
    "Content-Type": "application/pdf",
    "Content-Length": buf.length,
    "Content-Disposition": `${req.query.download === "1" ? "attachment" : "inline"}; filename="${file}"`,
    "Cache-Control": "private, no-store",
    "X-Resume-Pages": String(pages),
    "Access-Control-Expose-Headers": "X-Resume-Pages",
  });
  res.send(buf);
});

/* ---------- AI: build a resume from an upload (optionally for a job) ----------
   Both AI steps run on the server after the request has returned, and the draft records where it is (phase), so the person can close the tab and
   come back to the questions or the finished resume later. A step that dies (restart, AI outage) shows as "failed" with a one-click retry. */
const tailorSchema = z.object({
  resume: z.object({ key: z.string().min(5).max(300), filename: z.string().max(200).default("resume.pdf") }),
  jobDescription: z.string().trim().max(10000).default(""),
  details: z.string().trim().max(1500).default(""),
  targetRole: z.string().trim().max(120).default(""),
  kind: z.enum(["student", "professional"]).default("student"),
});

const STALE_MS = 8 * 60 * 1000;
const running = new Set();

const fail = (id, step, err) => {
  const msg = err instanceof ResumeError ? err.message : "The AI could not finish this just now. Please try again.";
  if (!(err instanceof ResumeError)) console.error("[resume-builder]", step, err);
  return ResumeDraft.updateOne({ _id: id }, { phase: "failed", failedStep: step, error: msg.slice(0, 300) }).catch(() => {});
};

/* step 1 (background): read the upload and the job, save the resume as data + the few questions worth asking */
const runReading = async (id) => {
  if (running.has(`r${id}`)) return;
  running.add(`r${id}`);
  try {
    const d = await ResumeDraft.findById(id);
    if (!d || d.phase !== "reading") return;
    const buf = await getObjectBuffer(d.source.resumeKey);
    const r = await analyze({ buf, jobDescription: d.source.jobDescription, details: d.source.details, targetRole: d.source.targetRole });
    d.set({
      ...r.resume,
      title: (r.jobTitle ? `For ${r.jobTitle}` : d.source.targetRole ? `For ${d.source.targetRole}` : "My resume").slice(0, 80),
      "source.jobTitle": r.jobTitle,
      jdKeywords: r.jdKeywords,
      keywordSource: r.keywordSource,
      base: r.resume,
      resumeText: r.resumeText.slice(0, 60000),
      sourceLinks: r.sourceLinks,
      gaps: r.gaps,
      phase: "questions",
      error: "",
      failedStep: "",
    });
    await d.save();
    if (!r.gaps.length) { await ResumeDraft.updateOne({ _id: id, phase: "questions" }, { phase: "writing" }); running.delete(`r${id}`); await runWriting(id); } // nothing to ask: go straight on
  } catch (e) {
    await fail(id, "reading", e);
  } finally {
    running.delete(`r${id}`);
  }
};

/* step 2 (background): write the resume from the person's own resume + what they confirmed. Contact details and links of an "info" answer are applied by code. */
const runWriting = async (id) => {
  if (running.has(`w${id}`)) return;
  running.add(`w${id}`);
  try {
    const d = await ResumeDraft.findById(id).select("+resumeText");
    if (!d || d.phase !== "writing" || !d.base) return;
    const base = JSON.parse(JSON.stringify(d.base));
    base.basics = base.basics || {};
    base.links = base.links || [];
    for (const g of d.gaps.filter((x) => x.kind === "info" && x.status === "have" && x.detail.trim())) {
      const v = g.detail.trim();
      if (g.field === "email" && EMAIL.test(v)) base.basics.email = v;
      if (g.field === "phone" && PHONE.test(v)) base.basics.phone = v;
      if ((g.field === "linkedin" && /linkedin\.com\//i.test(v)) || (g.field === "github" && /github\.com\//i.test(v))) { if (!base.links.some((l) => normUrl(l.url) === normUrl(v))) base.links.push({ label: labelFor(v), url: v }); }
    }
    const out = await tailor({
      base,
      gaps: d.gaps.map((g) => g.toObject()),
      jobDescription: d.source.jobDescription,
      details: d.source.details,
      targetRole: d.source.targetRole,
      resumeText: d.resumeText,
      sourceLinks: [...(d.sourceLinks || []).map((l) => ({ url: l.url })), ...base.links.map((l) => ({ url: l.url }))],
    });
    d.set({ ...out, phase: "ready", wasReady: true, step: 0, error: "", failedStep: "" });
    await d.save();
  } catch (e) {
    await fail(id, "writing", e);
  } finally {
    running.delete(`w${id}`);
  }
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d][\d\s()-]{6,18}$/;

/* a step that never reported back (server restarted mid-way) is shown as failed so the person can retry */
const unstick = async (d) => {
  if (["reading", "writing"].includes(d.phase) && Date.now() - new Date(d.updatedAt).getTime() > STALE_MS && !running.has(`r${d._id}`) && !running.has(`w${d._id}`)) {
    d.set({ phase: "failed", failedStep: d.phase, error: "That took too long and stopped. Press retry to continue." });
    await d.save();
  }
  return d;
};

export const startTailor = open(async (req, res) => {
  await assertNotBlocked(uid(req));
  if ((await ResumeDraft.countDocuments({ user: uid(req) })) >= MAX_DRAFTS) throw new ResumeError(400, `You can keep up to ${MAX_DRAFTS} resumes. Delete one to start another.`, "DRAFT_LIMIT");
  const b = parse(tailorSchema, guardInput(req.body, "the job description or notes"));
  if (!b.jobDescription && !b.targetRole) throw new ResumeError(400, "Paste a job description, or tell us the role you are applying for.", "NEED_TARGET");
  // no job description: the AI has nothing to match, so it needs the target position AND a few details about what the person wants to highlight
  if (!b.jobDescription && b.details.length < 30) throw new ResumeError(400, "Without a job description, tell us a little more in the additional details: the skills to highlight, your experience level and the kind of company you are aiming for.", "NEED_DETAILS");
  if (b.jobDescription && b.jobDescription.length < 80) throw new ResumeError(400, "Paste the full job description (at least a few lines), or leave it empty and name the role.", "BAD_JD");
  const key = b.resume.key;
  if (!keyBelongsTo(key, `${userPrefix(uid(req))}resume/`) || !/\.pdf$/i.test(key)) throw new ResumeError(400, "That resume file isn't valid. Please upload it again as a PDF.", "INVALID_RESUME");
  if (!(await headObject(key))) throw new ResumeError(400, "We couldn't find your uploaded resume. Please upload it again.", "RESUME_NOT_FOUND");

  // everything is checked above, so the credit is taken only now, when the person really presses Build (atomic: one credit, once)
  const plan = await spendBuilder(uid(req));
  if (!plan) throw new ResumeError(409, "You have no resume builder credits left. Get a plan with builder credits to build another resume.", "NO_BUILDER_CREDITS");

  let d;
  try {
  d = await ResumeDraft.create({
    user: uid(req),
    credit: { purchase: plan._id, spent: true, refunded: false },
    kind: b.kind,
    title: (b.targetRole ? `For ${b.targetRole}` : "My resume").slice(0, 80),
    phase: "reading",
    source: { resumeKey: key, resumeFilename: b.resume.filename.replace(/[^\w.\- ()]+/g, "_").slice(0, 120), jobDescription: b.jobDescription, details: b.details, targetRole: b.targetRole },
  });
  } catch (e) {
    await refundBuilder(plan._id); // the draft was never made: give the credit back
    throw e;
  }
  runReading(String(d._id));
  ok(res, draftOut(d), 202);
});

const answersSchema = z.object({
  answers: z.array(z.object({ id: z.string().max(10), status: z.enum(["open", "have", "none"]), detail: z.string().trim().max(700).default(""), target: z.string().regex(/^((p|e)\d{1,2}|none)?$/).default("") })).max(30),
});

/* the person's answers, saved as they type (a question can stay open: they can finish later) */
export const saveAnswers = open(async (req, res) => {
  const d = await own(req);
  if (d.phase !== "questions" && d.phase !== "ready") throw new ResumeError(409, "This resume isn't waiting for answers.", "NOT_ASKING");
  if (!d.gaps.length) throw new ResumeError(400, "This resume has no questions.", "NO_QUESTIONS");
  const { answers } = parse(answersSchema, guardInput(req.body, "your answer"));
  const by = new Map(answers.map((a) => [a.id, a]));
  d.gaps = d.gaps.map((g) => {
    const a = by.get(g.id);
    if (!a) return g;
    let detail = a.status === "have" ? a.detail : "";
    if (a.status === "have" && g.kind === "info") {
      const bad = (g.field === "email" && !EMAIL.test(detail)) || (g.field === "phone" && !PHONE.test(detail)) || (["linkedin", "github"].includes(g.field) && (() => { try { return !new RegExp(`${g.field}\\.com/`, "i").test(cleanUrl(detail)); } catch { return true; } })());
      if (bad) throw new ResumeError(400, g.field === "email" ? "Enter a valid email address." : g.field === "phone" ? "Enter a valid phone number." : `Paste your real ${g.keyword} profile link.`, "BAD_ANSWER");
    }
    return { ...g.toObject(), status: a.status, detail, target: a.status === "have" ? a.target || "" : "" };
  });
  await d.save();
  ok(res, { gaps: d.gaps });
});

/* 3. write the resume (runs on the server; the client polls the draft) */
export const generateTailored = open(async (req, res) => {
  const d = await own(req);
  if (!d.base) throw new ResumeError(400, "This resume was not started from an upload.", "NOT_TAILORED");
  if (d.phase === "writing") return ok(res, draftOut(d), 202);
  if (d.gaps.some((g) => g.status === "open")) throw new ResumeError(400, "Please answer every question first, even if the answer is no.", "UNANSWERED");
  if (d.gaps.some((g) => g.status === "have" && g.detail.trim().length < 5)) throw new ResumeError(400, "Tell us briefly where you used each skill you said yes to.", "DETAIL_REQUIRED");
  d.set({ phase: "writing", error: "", failedStep: "" });
  await d.save();
  runWriting(String(d._id));
  ok(res, draftOut(d), 202);
});

/* one click to run a failed step again */
export const retry = open(async (req, res) => {
  const d = await own(req);
  if (d.phase !== "failed") return ok(res, draftOut(d));
  const step = d.failedStep || (d.base ? "writing" : "reading");
  d.set({ phase: step, error: "", failedStep: "" });
  await d.save();
  (step === "reading" ? runReading : runWriting)(String(d._id));
  ok(res, draftOut(d), 202);
});

/* =====================================================
   ADMIN: every question the builder asked, and what people answered
===================================================== */
/* every question the builder asked, with what people answered (shared by the admin's builder tab, which merges it with the switch) */
export const builderQuestionsData = async (query) => {
  const q = parse(z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(50).default(20), search: z.string().trim().max(80).default(""), filter: z.enum(["all", "open", "answered"]).default("all") }), query);
  const esc = q.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const where = { "gaps.0": { $exists: true } };
  if (q.filter === "open") where["gaps.status"] = "open";
  if (q.filter === "answered") where["gaps.status"] = { $in: ["have", "none"] };
  if (q.search) {
    const re = new RegExp(esc, "i");
    const users = await User.find({ $or: [{ name: re }, { email: re }] }).select("_id").limit(50).lean();
    where.$or = [{ "gaps.keyword": re }, { "source.jobTitle": re }, { "source.targetRole": re }, { user: { $in: users.map((u) => u._id) } }];
  }
  const [total, rows, top] = await Promise.all([
    ResumeDraft.countDocuments(where),
    ResumeDraft.find(where).sort({ updatedAt: -1 }).skip((q.page - 1) * q.limit).limit(q.limit).populate("user", "name email").select("title phase error user source.jobTitle source.targetRole source.jobDescription source.details kind gaps createdAt updatedAt").lean(),
    ResumeDraft.aggregate([{ $unwind: "$gaps" }, { $group: { _id: { k: { $toLower: "$gaps.keyword" }, kind: "$gaps.kind" }, asked: { $sum: 1 }, yes: { $sum: { $cond: [{ $eq: ["$gaps.status", "have"] }, 1, 0] } }, no: { $sum: { $cond: [{ $eq: ["$gaps.status", "none"] }, 1, 0] } } } }, { $sort: { asked: -1 } }, { $limit: 15 }]),
  ]);
  return {
    total, page: q.page, pages: Math.max(1, Math.ceil(total / q.limit)), limit: q.limit,
    top: top.map((t) => ({ keyword: t._id.k, kind: t._id.kind || "skill", asked: t.asked, yes: t.yes, no: t.no, open: t.asked - t.yes - t.no })),
    items: rows.map((d) => ({
      id: String(d._id), title: d.title, phase: d.phase, error: d.error || "", kind: d.kind,
      user: { id: String(d.user?._id || ""), name: d.user?.name || "", email: d.user?.email || "" },
      jobTitle: d.source?.jobTitle || "", targetRole: d.source?.targetRole || "", jobDescription: (d.source?.jobDescription || "").slice(0, 1500), details: d.source?.details || "",
      questions: (d.gaps || []).map((g) => ({ id: g.id, kind: g.kind || "skill", field: g.field || "", keyword: g.keyword, importance: g.importance, question: g.question, status: g.status, detail: g.status === "have" ? g.detail : "" })),
      createdAt: d.createdAt, updatedAt: d.updatedAt,
    })),
  };
};
export const adminQuestions = handler(async (req, res) => ok(res, await builderQuestionsData(req.query)));
