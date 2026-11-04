import mongoose from "mongoose";
import { z } from "zod";

import Book from "../models/Book.js";
import Coupon from "../models/Coupon.js";
import MailSuppression from "../models/MailSuppression.js";
import MailTemplate from "../models/MailTemplate.js";
import MarketingCampaign from "../models/MarketingCampaign.js";
import MarketingRecipient from "../models/MarketingRecipient.js";
import sendMail from "../utils/MailSender.js";
import {
  bookBuyerCounts,
  isValidEmail,
  normalizeEmail,
  previewAudience,
  resolveAudience,
  toCsv,
} from "../services/campaign/audience.js";
import {
  CampaignError,
  cancelCampaign,
  launchCampaign,
  loadCampaignContext,
  pauseCampaign,
  recipientBreakdown,
  recount,
  resumeCampaign,
  retryFailed,
} from "../services/campaign/campaignService.js";
import { BUILTIN_TEMPLATES } from "../services/campaign/builtinTemplates.js";
import { SAMPLE_RECIPIENT, renderCampaignEmail } from "../services/campaign/render.js";
import { getQueueStatus, isMailQueueEnabled } from "../services/mail/mailQueue.js";
import { getWorkerStats } from "../services/mail/mailWorker.js";
import { deleteMessage, getDlq, receiveMessages, sendMessage } from "../services/mail/sqs.js";

/* ---------------- helpers ---------------- */

const handler = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues[0] ? `${error.issues[0].path.join(".") || "input"}: ${error.issues[0].message}` : "Invalid input",
      });
    }
    if (error instanceof CampaignError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("[campaign-studio]", error);
    return res.status(500).json({ success: false, message: error?.message || "Something went wrong." });
  }
};

const ok = (res, data = {}, status = 200) => res.status(status).json({ success: true, ...data });

const validId = (id) => mongoose.Types.ObjectId.isValid(String(id));
const needId = (id) => {
  if (!validId(id)) throw new CampaignError("Invalid id.", 400);
};

const objectId = z.string().refine(validId, "Invalid id");
const optionalDate = z.union([z.string(), z.null()]).optional();
const emailList = z.union([z.string().max(2_000_000), z.array(z.string().max(254)).max(50_000)]).optional();

const audienceSchema = z
  .object({
    sources: z.array(z.enum(["buyers", "users", "manual"])).max(3).default(["buyers"]),
    includeBooks: z.array(objectId).max(100).default([]),
    includeMode: z.enum(["any", "all"]).default("any"),
    excludeBooks: z.array(objectId).max(100).default([]),
    purchasedFrom: optionalDate,
    purchasedTo: optionalDate,
    minOrders: z.coerce.number().min(0).max(10_000).optional(),
    minSpent: z.coerce.number().min(0).optional(),
    maxSpent: z.coerce.number().min(0).optional(),
    userScope: z.enum(["nonBuyers", "all"]).default("nonBuyers"),
    manualEmails: emailList,
    excludeEmails: emailList,
    excludeCampaignIds: z.array(objectId).max(50).default([]),
  })
  .strip();

const contentSchema = z
  .object({
    headline: z.string().max(200).default(""),
    body: z.string().max(10_000).default(""),
    couponCode: z.string().max(40).default(""),
    ctaText: z.string().max(60).default(""),
    ctaUrl: z.string().max(500).refine((v) => !v || /^https?:\/\//i.test(v), "must start with http:// or https://").default(""),
    featuredBookIds: z.array(objectId).max(8).default([]),
  })
  .strip();

const campaignSchema = z.object({
  name: z.string().trim().min(1).max(140),
  subject: z.string().trim().min(1).max(300),
  preheader: z.string().max(200).default(""),
  html: z.string().min(1).max(500_000),
  templateKey: z.string().max(80).default(""),
  content: contentSchema.default({}),
  audience: audienceSchema.default({}),
  replyTo: z.string().max(254).refine((v) => !v || isValidEmail(normalizeEmail(v)), "invalid e-mail").default(""),
  scheduledAt: optionalDate,
});

const actor = (req) => ({
  id: req.user?._id || req.user?.id || null,
  name: req.user?.name || req.user?.email || "admin",
});

/* ---------------- meta ---------------- */

export const getMeta = handler(async (req, res) => {
  const [books, coupons, templates, buyerInfo, suppressed, queue] = await Promise.all([
    Book.find({}).select("title price isActive resourceType").sort({ title: 1 }).lean(),
    Coupon.find({ isActive: true }).select("code name discountType discountValue validTill").sort({ createdAt: -1 }).limit(200).lean(),
    MailTemplate.find({}).sort({ updatedAt: -1 }).lean(),
    bookBuyerCounts(),
    MailSuppression.countDocuments({}),
    getQueueStatus(),
  ]);

  ok(res, {
    books: books.map((b) => ({
      _id: b._id,
      title: b.title,
      price: b.price,
      resourceType: b.resourceType,
      isActive: b.isActive !== false,
      buyers: buyerInfo.counts.get(String(b._id)) || 0,
    })),
    coupons,
    builtinTemplates: BUILTIN_TEMPLATES,
    templates,
    totalBuyers: buyerInfo.totalBuyers,
    suppressed,
    queue,
    worker: getWorkerStats(),
  });
});

/* ---------------- audience ---------------- */

export const audiencePreview = handler(async (req, res) => {
  const audience = audienceSchema.parse(req.body?.audience || {});
  ok(res, { preview: await previewAudience(audience) });
});

export const audienceExport = handler(async (req, res) => {
  const audience = audienceSchema.parse(req.body?.audience || {});
  const { recipients } = await resolveAudience(audience);
  ok(res, { count: recipients.length, csv: toCsv(recipients) });
});

/* ---------------- templates ---------------- */

const templateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(300).default(""),
  category: z.string().max(40).default("custom"),
  subject: z.string().max(300).default(""),
  html: z.string().min(1).max(500_000),
});

export const listTemplates = handler(async (req, res) => {
  ok(res, { builtin: BUILTIN_TEMPLATES, templates: await MailTemplate.find({}).sort({ updatedAt: -1 }).lean() });
});

export const createTemplate = handler(async (req, res) => {
  const data = templateSchema.parse(req.body);
  const template = await MailTemplate.create({ ...data, createdBy: actor(req).id });
  ok(res, { template }, 201);
});

export const updateTemplate = handler(async (req, res) => {
  needId(req.params.id);
  const data = templateSchema.parse(req.body);
  const template = await MailTemplate.findByIdAndUpdate(req.params.id, { $set: data }, { new: true });
  if (!template) throw new CampaignError("Template not found.", 404);
  ok(res, { template });
});

export const deleteTemplate = handler(async (req, res) => {
  needId(req.params.id);
  const template = await MailTemplate.findByIdAndDelete(req.params.id);
  if (!template) throw new CampaignError("Template not found.", 404);
  ok(res, { message: "Template deleted." });
});

/* Render any HTML with sample data, for the live preview. */
export const previewRender = handler(async (req, res) => {
  const body = z
    .object({
      subject: z.string().max(300).default(""),
      preheader: z.string().max(200).default(""),
      html: z.string().max(500_000),
      content: contentSchema.default({}),
    })
    .parse(req.body);

  const draft = { _id: "preview", ...body };
  const context = await loadCampaignContext(draft);
  const mail = renderCampaignEmail(draft, SAMPLE_RECIPIENT, context);
  ok(res, { subject: mail.subject, html: mail.html });
});

/* ---------------- campaigns ---------------- */

const withScheduleChecks = (data) => {
  const when = data.scheduledAt ? new Date(data.scheduledAt) : null;
  if (when && Number.isNaN(when.getTime())) throw new CampaignError("Invalid schedule time.");
  return when;
};

export const listCampaigns = handler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const filter = {};
  if (req.query.status) filter.status = String(req.query.status).toUpperCase();
  if (req.query.search) {
    filter.name = { $regex: String(req.query.search).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }

  const [campaigns, total] = await Promise.all([
    MarketingCampaign.find(filter).select("-html").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    MarketingCampaign.countDocuments(filter),
  ]);

  ok(res, { campaigns, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

export const getCampaign = handler(async (req, res) => {
  needId(req.params.id);
  const campaign = await MarketingCampaign.findById(req.params.id).lean();
  if (!campaign) throw new CampaignError("Campaign not found.", 404);
  ok(res, { campaign, breakdown: await recipientBreakdown(campaign._id) });
});

export const createCampaign = handler(async (req, res) => {
  const data = campaignSchema.parse(req.body);
  const scheduledAt = withScheduleChecks(data);
  const who = actor(req);

  const campaign = await MarketingCampaign.create({
    ...data,
    scheduledAt,
    status: "DRAFT",
    createdBy: who.id,
    createdByName: who.name,
  });
  ok(res, { campaign }, 201);
});

export const updateCampaign = handler(async (req, res) => {
  needId(req.params.id);
  const data = campaignSchema.parse(req.body);
  const scheduledAt = withScheduleChecks(data);

  const campaign = await MarketingCampaign.findOneAndUpdate(
    { _id: req.params.id, status: { $in: ["DRAFT", "SCHEDULED"] } },
    { $set: { ...data, scheduledAt, status: "DRAFT" } },
    { new: true }
  );
  if (!campaign) throw new CampaignError("Only a draft campaign can be edited.", 409);
  ok(res, { campaign });
});

export const deleteCampaign = handler(async (req, res) => {
  needId(req.params.id);
  const campaign = await MarketingCampaign.findById(req.params.id).select("status").lean();
  if (!campaign) throw new CampaignError("Campaign not found.", 404);
  if (["QUEUEING", "SENDING"].includes(campaign.status)) {
    throw new CampaignError("Pause or cancel the campaign before deleting it.", 409);
  }
  await MarketingRecipient.deleteMany({ campaignId: campaign._id });
  await MarketingCampaign.deleteOne({ _id: campaign._id });
  ok(res, { message: "Campaign deleted." });
});

/* Send now, or schedule when `scheduledAt` is in the future. */
export const sendCampaign = handler(async (req, res) => {
  needId(req.params.id);
  const campaign = await MarketingCampaign.findById(req.params.id).lean();
  if (!campaign) throw new CampaignError("Campaign not found.", 404);

  const when = req.body?.scheduledAt ? new Date(req.body.scheduledAt) : null;
  if (when && Number.isNaN(when.getTime())) throw new CampaignError("Invalid schedule time.");

  if (when && when.getTime() > Date.now() + 60_000) {
    const scheduled = await MarketingCampaign.findOneAndUpdate(
      { _id: campaign._id, status: { $in: ["DRAFT", "SCHEDULED"] } },
      { $set: { status: "SCHEDULED", scheduledAt: when } },
      { new: true }
    );
    if (!scheduled) throw new CampaignError("This campaign has already been sent.", 409);
    return ok(res, { campaign: scheduled, message: "Campaign scheduled." });
  }

  ok(res, { campaign: await launchCampaign(campaign._id), message: "Campaign is being sent." });
});

export const sendTest = handler(async (req, res) => {
  needId(req.params.id);
  const { to } = z.object({ to: z.string().max(254) }).parse(req.body);
  const email = normalizeEmail(to);
  if (!isValidEmail(email)) throw new CampaignError("Enter a valid e-mail address.");

  const campaign = await MarketingCampaign.findById(req.params.id).lean();
  if (!campaign) throw new CampaignError("Campaign not found.", 404);

  const context = await loadCampaignContext(campaign);
  const mail = renderCampaignEmail(campaign, { ...SAMPLE_RECIPIENT, email, name: req.user?.name || SAMPLE_RECIPIENT.name }, context);

  // Goes through the same queue as the real send.
  const info = await sendMail(email, `[TEST] ${mail.subject}`, mail.text, mail.html, campaign.replyTo ? { replyTo: campaign.replyTo } : {});
  ok(res, { to: email, queued: Boolean(info?.queued), message: info?.queued ? "Test email queued." : "Test email sent." });
});

export const pause = handler(async (req, res) => {
  needId(req.params.id);
  ok(res, { campaign: await pauseCampaign(req.params.id) });
});
export const resume = handler(async (req, res) => {
  needId(req.params.id);
  ok(res, { campaign: await resumeCampaign(req.params.id) });
});
export const cancel = handler(async (req, res) => {
  needId(req.params.id);
  ok(res, { campaign: await cancelCampaign(req.params.id) });
});
export const retry = handler(async (req, res) => {
  needId(req.params.id);
  ok(res, await retryFailed(req.params.id));
});
export const recountCampaign = handler(async (req, res) => {
  needId(req.params.id);
  ok(res, { breakdown: await recount(req.params.id), campaign: await MarketingCampaign.findById(req.params.id).select("-html").lean() });
});

export const listRecipients = handler(async (req, res) => {
  needId(req.params.id);
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const filter = { campaignId: req.params.id };
  if (req.query.status) filter.status = String(req.query.status).toUpperCase();
  if (req.query.search) {
    filter.email = { $regex: String(req.query.search).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  }

  const [recipients, total] = await Promise.all([
    MarketingRecipient.find(filter).sort({ _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
    MarketingRecipient.countDocuments(filter),
  ]);
  ok(res, { recipients, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

/* ---------------- queue + dead-letter queue ---------------- */

export const queueStatus = handler(async (req, res) => {
  ok(res, { queue: await getQueueStatus(), worker: getWorkerStats() });
});

const describe = async (message) => {
  let job = null;
  try {
    job = JSON.parse(message.body);
  } catch {
    /* shown as raw */
  }

  const item = {
    messageId: message.messageId,
    receiveCount: message.receiveCount,
    sentAt: message.sentAt,
    kind: job?.kind || "unknown",
  };

  if (job?.kind === "mail") {
    item.to = Array.isArray(job.to) ? job.to.join(", ") : job.to;
    item.subject = job.subject;
  } else if (job?.kind === "campaign") {
    const [recipient, campaign] = await Promise.all([
      MarketingRecipient.findById(job.recipientId).select("email status error").lean(),
      MarketingCampaign.findById(job.campaignId).select("name").lean(),
    ]);
    item.to = recipient?.email || "(recipient removed)";
    item.subject = campaign?.name ? `Campaign: ${campaign.name}` : "Campaign (removed)";
    item.error = recipient?.error || "";
  } else {
    item.subject = String(message.body).slice(0, 120);
  }
  return item;
};

export const dlqPeek = handler(async (req, res) => {
  if (!isMailQueueEnabled()) throw new CampaignError("The email queue is not configured.", 503);
  const dlq = await getDlq();
  if (!dlq) return ok(res, { dlq: null, messages: [], message: "The main queue has no dead-letter queue attached." });

  // visibilityTimeout 0: just look, do not hide the messages.
  const messages = await receiveMessages({ queueUrl: dlq.url, max: 10, waitSeconds: 1, visibilityTimeout: 0 });
  ok(res, { dlq: { name: dlq.name }, messages: await Promise.all(messages.map(describe)) });
});

/* Move messages from the DLQ back to the main queue so the worker tries them again. */
export const dlqRedrive = handler(async (req, res) => {
  if (!isMailQueueEnabled()) throw new CampaignError("The email queue is not configured.", 503);
  const max = Math.min(Math.max(Number(req.body?.max) || 50, 1), 500);
  const dlq = await getDlq();
  if (!dlq) throw new CampaignError("The main queue has no dead-letter queue attached.", 409);

  let moved = 0;
  let empty = 0;
  while (moved < max && empty < 2) {
    const messages = await receiveMessages({ queueUrl: dlq.url, max: Math.min(10, max - moved), waitSeconds: 1, visibilityTimeout: 120 });
    if (!messages.length) {
      empty += 1;
      continue;
    }
    for (const message of messages) {
      await sendMessage(message.body); // back onto the main queue
      await deleteMessage(message.receiptHandle, { queueUrl: dlq.url });
      moved += 1;
    }
  }
  ok(res, { moved, message: moved ? `${moved} message(s) sent back to the queue.` : "The dead-letter queue is empty." });
});

/* Permanently discard messages from the DLQ. */
export const dlqDiscard = handler(async (req, res) => {
  if (!isMailQueueEnabled()) throw new CampaignError("The email queue is not configured.", 503);
  const max = Math.min(Math.max(Number(req.body?.max) || 50, 1), 500);
  const dlq = await getDlq();
  if (!dlq) throw new CampaignError("The main queue has no dead-letter queue attached.", 409);

  let removed = 0;
  let empty = 0;
  while (removed < max && empty < 2) {
    const messages = await receiveMessages({ queueUrl: dlq.url, max: Math.min(10, max - removed), waitSeconds: 1, visibilityTimeout: 120 });
    if (!messages.length) {
      empty += 1;
      continue;
    }
    for (const message of messages) {
      await deleteMessage(message.receiptHandle, { queueUrl: dlq.url });
      removed += 1;
    }
  }
  ok(res, { removed, message: `${removed} message(s) discarded.` });
});

/* ---------------- suppression list ---------------- */

export const listSuppressions = handler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);
  const filter = req.query.search
    ? { email: { $regex: String(req.query.search).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" } }
    : {};
  const [items, total] = await Promise.all([
    MailSuppression.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    MailSuppression.countDocuments(filter),
  ]);
  ok(res, { items, total, page, totalPages: Math.max(1, Math.ceil(total / limit)) });
});

export const addSuppression = handler(async (req, res) => {
  const { email } = z.object({ email: z.string().max(254) }).parse(req.body);
  const value = normalizeEmail(email);
  if (!isValidEmail(value)) throw new CampaignError("Enter a valid e-mail address.");
  await MailSuppression.updateOne({ email: value }, { $setOnInsert: { email: value, reason: "ADMIN" } }, { upsert: true });
  ok(res, { message: "Address will no longer receive campaigns." }, 201);
});

export const removeSuppression = handler(async (req, res) => {
  needId(req.params.id);
  await MailSuppression.deleteOne({ _id: req.params.id });
  ok(res, { message: "Address can receive campaigns again." });
});
