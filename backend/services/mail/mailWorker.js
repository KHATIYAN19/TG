import MailSuppression from "../../models/MailSuppression.js";
import MarketingCampaign from "../../models/MarketingCampaign.js";
import MarketingRecipient from "../../models/MarketingRecipient.js";
import { deliverMail } from "../../utils/MailSender.js";
import { launchCampaign, loadCampaignContext, maybeComplete } from "../campaign/campaignService.js";
import { renderCampaignEmail } from "../campaign/render.js";
import { isMailQueueEnabled } from "./mailQueue.js";
import {
  changeVisibility,
  deleteMessage,
  getDlq,
  getMainQueueUrl,
  getQueueAttributes,
  parseRedrivePolicy,
  receiveMessages,
} from "./sqs.js";

/*
  Email queue worker.

  Long-polls the main SQS queue and sends each message with deliverMail()
  (the selected provider + automatic failover).

    success             -> message deleted
    permanent failure   -> message deleted, recipient marked FAILED
                           (e.g. malformed address: retrying can never help)
    temporary failure   -> message left on the queue with a growing delay
                           (SQS shows it again after the visibility timeout)
    too many failures   -> message left alone; because the main queue has a
                           redrive policy, AWS moves it to the dead-letter queue
                           by itself. The recipient is marked DEAD so the admin
                           sees it and can redrive it from the DLQ page.

  Env:
    MAIL_WORKER_ENABLED        "false" to run no worker in this process
    MAIL_WORKER_POLLERS        parallel pollers, default 2
    MAIL_WORKER_RATE_PER_SEC   max sends per second for this process, default 10
                               (keep below your SES sending rate)
    MAIL_MAX_ATTEMPTS          used only if the queue has no DLQ, default 5
*/

const CLAIM_LEASE_MS = 5 * 60 * 1000;
const CONTEXT_TTL_MS = 30 * 1000;
const MAX_BACKOFF_SECONDS = 15 * 60;

let running = false;
let pollers = [];
let schedulerTimer = null;

const stats = {
  startedAt: null,
  processed: 0,
  sent: 0,
  retried: 0,
  failed: 0,
  dead: 0,
  skipped: 0,
  lastError: null,
  lastErrorAt: null,
  lastPollAt: null,
};

export const getWorkerStats = () => ({ running, ...stats });

const log = (...a) => console.log("[mail-worker]", ...a);
const warn = (...a) => console.warn("[mail-worker]", ...a);

/* ---------------- throttle ---------------- */

let nextSlot = 0;
const throttle = async () => {
  const perSecond = Math.max(1, Number(process.env.MAIL_WORKER_RATE_PER_SEC) || 10);
  const gap = 1000 / perSecond;
  const now = Date.now();
  nextSlot = Math.max(nextSlot, now) + gap;
  const wait = nextSlot - gap - now;
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
};

/* ---------------- queue policy (max receives) ---------------- */

let policyCache = null;
const queuePolicy = async () => {
  if (policyCache && Date.now() - policyCache.at < 5 * 60 * 1000) return policyCache.value;

  let value = { maxReceiveCount: null, hasDlq: false };
  try {
    const attributes = await getQueueAttributes(await getMainQueueUrl(), ["RedrivePolicy"]);
    const policy = parseRedrivePolicy(attributes);
    if (policy?.maxReceiveCount) value = { maxReceiveCount: policy.maxReceiveCount, hasDlq: true };
    else await getDlq().catch(() => null);
  } catch (error) {
    warn("could not read the queue's redrive policy:", error.message);
  }

  policyCache = { value, at: Date.now() };
  return value;
};

const finalAttempt = async (receiveCount) => {
  const { maxReceiveCount, hasDlq } = await queuePolicy();
  const limit = hasDlq ? maxReceiveCount : Number(process.env.MAIL_MAX_ATTEMPTS) || 5;
  return { isFinal: receiveCount >= limit, hasDlq };
};

/* ---------------- error classification ---------------- */

export const isPermanentError = (error) => {
  const message = String(error?.message || "");
  const code = String(error?.code || "");
  const status = Number(error?.statusCode) || 0;

  if (["InvalidParameterValue", "BadRequestException", "InvalidParameter"].includes(code)) return true;
  if (status === 400 && /illegal address|invalid (e-?mail|address|recipient)|malformed|recipient address/i.test(message)) {
    return true;
  }
  return false;
};

const backoffSeconds = (receiveCount) =>
  Math.min(MAX_BACKOFF_SECONDS, 30 * 2 ** Math.max(0, receiveCount - 1));

/* ---------------- campaign context cache ---------------- */

const campaigns = new Map(); // id -> { campaign, context, at }

const getCampaign = async (id) => {
  const hit = campaigns.get(id);
  if (hit && Date.now() - hit.at < CONTEXT_TTL_MS) return hit;

  const campaign = await MarketingCampaign.findById(id).lean();
  if (!campaign) return null;

  const entry = { campaign, context: await loadCampaignContext(campaign), at: Date.now() };
  campaigns.set(id, entry);
  if (campaigns.size > 50) campaigns.delete(campaigns.keys().next().value);
  return entry;
};

/* ---------------- handlers ---------------- */

const count = (campaignId, field, n = 1) =>
  MarketingCampaign.updateOne({ _id: campaignId }, { $inc: { [`counts.${field}`]: n } });

const settle = async (campaignId) => {
  const done = await maybeComplete(campaignId);
  if (done) log("campaign completed:", String(campaignId));
};

// kind: "mail" - any ordinary email.
const handleMail = async (job, message) => {
  const recipients = Array.isArray(job.to) ? job.to : [job.to];
  await throttle();

  try {
    await deliverMail(recipients, job.subject, job.text, job.html, job.options || {});
    stats.sent += 1;
    await deleteMessage(message.receiptHandle);
    return;
  } catch (error) {
    return failure(error, message, {
      onPermanent: () => {
        stats.failed += 1;
      },
      onDead: () => {
        stats.dead += 1;
      },
    });
  }
};

// kind: "campaign" - one recipient of a marketing campaign.
const handleCampaign = async (job, message) => {
  const recipient = await MarketingRecipient.findById(job.recipientId).lean();
  const entry = recipient ? await getCampaign(String(job.campaignId)) : null;

  // Orphan message (campaign or recipient deleted): nothing to do.
  if (!recipient || !entry) {
    await deleteMessage(message.receiptHandle);
    return;
  }

  const { campaign, context } = entry;
  // Pause / cancel must act now, not after the 30s cache.
  const live = await MarketingCampaign.findById(campaign._id).select("status").lean();
  const status = live?.status;

  if (["SENT", "FAILED", "SKIPPED"].includes(recipient.status)) {
    await deleteMessage(message.receiptHandle); // duplicate delivery of a finished one
    return;
  }

  if (status === "CANCELLED") {
    const res = await MarketingRecipient.updateOne(
      { _id: recipient._id, status: { $in: ["PENDING", "QUEUED"] } },
      { $set: { status: "SKIPPED", error: "Campaign cancelled" } }
    );
    if (res.modifiedCount) {
      await count(campaign._id, "skipped");
      stats.skipped += 1;
    }
    await deleteMessage(message.receiptHandle);
    return;
  }

  if (status === "PAUSED") {
    // Hand it back; Resume queues it again.
    await MarketingRecipient.updateOne({ _id: recipient._id, status: "QUEUED" }, { $set: { status: "PENDING" } });
    await deleteMessage(message.receiptHandle);
    return;
  }

  // Claim (idempotent against duplicate deliveries / two workers).
  const previous = await MarketingRecipient.findOneAndUpdate(
    {
      _id: recipient._id,
      $or: [
        { status: { $in: ["PENDING", "QUEUED", "DEAD"] } },
        { status: "SENDING", claimedAt: { $lt: new Date(Date.now() - CLAIM_LEASE_MS) } },
      ],
    },
    { $set: { status: "SENDING", claimedAt: new Date() }, $inc: { attempts: 1 } },
    { new: false }
  ).lean();

  if (!previous) {
    await deleteMessage(message.receiptHandle); // someone else is on it
    return;
  }
  if (previous.status === "DEAD") await count(campaign._id, "dead", -1); // redriven from the DLQ

  if (await MailSuppression.exists({ email: recipient.email })) {
    await MarketingRecipient.updateOne({ _id: recipient._id }, { $set: { status: "SKIPPED", error: "Unsubscribed" } });
    await count(campaign._id, "skipped");
    stats.skipped += 1;
    await deleteMessage(message.receiptHandle);
    await settle(campaign._id);
    return;
  }

  try {
    const mail = renderCampaignEmail(campaign, recipient, context);
    await throttle();
    const info = await deliverMail(recipient.email, mail.subject, mail.text, mail.html, {
      ...(campaign.replyTo ? { replyTo: campaign.replyTo } : {}),
    });

    await MarketingRecipient.updateOne(
      { _id: recipient._id },
      { $set: { status: "SENT", sentAt: new Date(), error: "", messageId: String(info?.messageId || "") } }
    );
    await count(campaign._id, "sent");
    stats.sent += 1;
    await deleteMessage(message.receiptHandle);
    await settle(campaign._id);
  } catch (error) {
    await failure(error, message, {
      onTemporary: () =>
        MarketingRecipient.updateOne(
          { _id: recipient._id },
          { $set: { status: "QUEUED", error: String(error.message).slice(0, 300) } }
        ),
      onPermanent: async () => {
        await MarketingRecipient.updateOne(
          { _id: recipient._id },
          { $set: { status: "FAILED", error: String(error.message).slice(0, 300) } }
        );
        await count(campaign._id, "failed");
        stats.failed += 1;
        await settle(campaign._id);
      },
      onDead: async (hasDlq) => {
        await MarketingRecipient.updateOne(
          { _id: recipient._id },
          {
            $set: {
              status: "DEAD",
              error: `${String(error.message).slice(0, 260)}${hasDlq ? " (moved to the dead-letter queue)" : ""}`,
            },
          }
        );
        await count(campaign._id, "dead");
        stats.dead += 1;
        await settle(campaign._id);
      },
    });
  }
};

/* Shared failure policy. */
const failure = async (error, message, { onTemporary, onPermanent, onDead }) => {
  stats.lastError = String(error?.message || error).slice(0, 300);
  stats.lastErrorAt = new Date().toISOString();

  if (isPermanentError(error)) {
    warn("permanent failure, dropping:", error.message);
    await onPermanent?.();
    await deleteMessage(message.receiptHandle);
    return;
  }

  const { isFinal, hasDlq } = await finalAttempt(message.receiveCount);

  if (isFinal) {
    warn(`giving up after ${message.receiveCount} attempts:`, error.message);
    await onDead?.(hasDlq);
    if (hasDlq) {
      // Leave it: once its visibility expires SQS moves it to the DLQ.
      await changeVisibility(message.receiptHandle, 5).catch(() => {});
    } else {
      await deleteMessage(message.receiptHandle);
    }
    return;
  }

  const delay = backoffSeconds(message.receiveCount);
  stats.retried += 1;
  warn(`attempt ${message.receiveCount} failed (${error.message}); retrying in ${delay}s`);
  await onTemporary?.();
  await changeVisibility(message.receiptHandle, delay).catch(() => {});
};

/* ---------------- one message ---------------- */

export const processMessage = async (message) => {
  stats.processed += 1;

  let job;
  try {
    job = JSON.parse(message.body);
  } catch {
    warn("dropping a message that is not JSON:", message.messageId);
    await deleteMessage(message.receiptHandle);
    return;
  }

  try {
    if (job?.kind === "mail") await handleMail(job, message);
    else if (job?.kind === "campaign") await handleCampaign(job, message);
    else {
      warn("unknown message kind, dropping:", job?.kind);
      await deleteMessage(message.receiptHandle);
    }
  } catch (error) {
    // Unexpected (database / SQS hiccup). Leave the message: it will be shown again.
    stats.lastError = String(error?.message || error).slice(0, 300);
    stats.lastErrorAt = new Date().toISOString();
    warn("could not process message (will be retried):", error.message);
  }
};

/* ---------------- polling loop ---------------- */

const pollLoop = async (index) => {
  let failures = 0;

  while (running) {
    try {
      const messages = await receiveMessages({ max: 10, waitSeconds: 20 });
      stats.lastPollAt = new Date().toISOString();
      failures = 0;
      await Promise.all(messages.map(processMessage));
    } catch (error) {
      failures += 1;
      stats.lastError = String(error?.message || error).slice(0, 300);
      stats.lastErrorAt = new Date().toISOString();
      const wait = Math.min(60_000, 2000 * 2 ** Math.min(failures, 5));
      if (failures === 1 || failures % 10 === 0) warn(`poller ${index}: ${error.message}; retrying in ${wait / 1000}s`);
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }
};

/* Campaigns scheduled for later: launch them when their time comes. */
const runScheduler = async () => {
  try {
    const due = await MarketingCampaign.find({ status: "SCHEDULED", scheduledAt: { $lte: new Date() } })
      .select("_id")
      .limit(5)
      .lean();
    for (const { _id } of due) {
      await launchCampaign(_id).catch((error) => warn("scheduled launch failed:", error.message));
    }
  } catch (error) {
    warn("scheduler:", error.message);
  }
};

export const startMailWorker = () => {
  if (running) return false;

  if (process.env.MAIL_WORKER_ENABLED === "false") {
    log("disabled (MAIL_WORKER_ENABLED=false)");
    return false;
  }
  if (!isMailQueueEnabled()) {
    log("email queue not configured (set SQS_EMAIL_QUEUE_NAME); emails are sent directly");
    return false;
  }

  running = true;
  stats.startedAt = new Date().toISOString();
  const count = Math.max(1, Math.min(10, Number(process.env.MAIL_WORKER_POLLERS) || 2));
  pollers = Array.from({ length: count }, (_, i) => pollLoop(i + 1));

  schedulerTimer = setInterval(runScheduler, 30_000);
  schedulerTimer.unref?.();

  log(`started with ${count} poller(s)`);
  return true;
};

export const stopMailWorker = async () => {
  running = false;
  clearInterval(schedulerTimer);
  await Promise.allSettled(pollers);
  pollers = [];
};
