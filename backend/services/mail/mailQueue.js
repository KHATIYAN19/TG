import {
  getDlq,
  getMainQueueUrl,
  getQueueAttributes,
  isSqsConfigured,
  parseRedrivePolicy,
  sendMessage,
  sendMessageBatch,
  sqsConfig,
} from "./sqs.js";

/*
  Producer side of the email queue.

  Two kinds of messages travel on the one queue:

    { kind: "mail",     to, subject, text, html, options }   any normal email
    { kind: "campaign", campaignId, recipientId }            one campaign recipient
                                                              (rendered by the worker)

  The worker (mailWorker.js) consumes both. Messages that keep failing are moved
  by AWS to the dead-letter queue configured on the main queue.
*/

// SQS allows large bodies, but keep well under it: bigger mail is sent directly.
export const MAX_QUEUE_BODY_BYTES = 200 * 1024;

export const isMailQueueEnabled = () => isSqsConfigured();

const toArray = (value) => (Array.isArray(value) ? value : [value]);

/*
  Decide whether a message can be queued. Attachments and calendar invites hold
  binary data, which does not belong on a queue, so those are delivered directly.
*/
export const canQueueMail = (options = {}) =>
  isMailQueueEnabled() &&
  !options?.sync &&
  !options?.attachments?.length &&
  !options?.icalEvent;

export const enqueueMail = async (to, subject, text, html, options = {}) => {
  const recipients = toArray(to).filter(Boolean);
  if (!recipients.length) throw new Error("At least one recipient is required");

  const body = JSON.stringify({
    v: 1,
    kind: "mail",
    to: recipients,
    subject,
    text: text || "",
    html: html || "",
    options: options?.replyTo ? { replyTo: options.replyTo } : {},
    enqueuedAt: new Date().toISOString(),
  });

  if (Buffer.byteLength(body) > MAX_QUEUE_BODY_BYTES) {
    const error = new Error("Email is too large for the queue");
    error.code = "TooLargeForQueue";
    throw error;
  }

  const result = await sendMessage(body);

  console.log("[MAIL QUEUED]", { messageId: result.MessageId, recipients: recipients.length });

  return {
    messageId: result.MessageId || null,
    accepted: recipients,
    submitted: true,
    queued: true,
    provider: "sqs",
  };
};

/*
  Queue many campaign recipients, 10 per SQS request.
  items: [{ recipientId, campaignId }]
  Returns the recipientIds that could NOT be queued (caller keeps them PENDING).
*/
export const enqueueCampaignRecipients = async (items, { concurrency = 4 } = {}) => {
  const failedIds = [];
  const batches = [];

  for (let i = 0; i < items.length; i += 10) batches.push(items.slice(i, i + 10));

  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, batches.length) }, async () => {
    while (cursor < batches.length) {
      const batch = batches[cursor++];
      try {
        const { failed } = await sendMessageBatch(
          batch.map((item, index) => ({
            id: index,
            body: { v: 1, kind: "campaign", campaignId: String(item.campaignId), recipientId: String(item.recipientId) },
          }))
        );
        for (const f of failed) failedIds.push(String(batch[Number(f.id)].recipientId));
      } catch (error) {
        console.error("[MAIL QUEUE] batch enqueue failed:", error.message);
        for (const item of batch) failedIds.push(String(item.recipientId));
      }
    }
  });

  await Promise.all(runners);
  return failedIds;
};

/* ------------------------------------------------------------------ */
/* Status for the admin page                                           */
/* ------------------------------------------------------------------ */

const count = (value) => Number(value) || 0;

const summarize = (attributes) => ({
  waiting: count(attributes.ApproximateNumberOfMessages),
  inFlight: count(attributes.ApproximateNumberOfMessagesNotVisible),
  delayed: count(attributes.ApproximateNumberOfMessagesDelayed),
});

export const getQueueStatus = async () => {
  const config = sqsConfig();

  const base = {
    enabled: process.env.MAIL_QUEUE_ENABLED !== "false",
    configured: config.configured,
    missing: config.missing,
    region: config.region || null,
    queueName: config.queueName || null,
    workerEnabled: process.env.MAIL_WORKER_ENABLED !== "false",
  };

  if (!config.configured) return { ...base, reachable: false, queue: null, dlq: null };

  try {
    const url = await getMainQueueUrl();
    const attributes = await getQueueAttributes(url);
    const policy = parseRedrivePolicy(attributes);

    let dlq = null;
    try {
      const info = await getDlq();
      if (info) {
        dlq = { name: info.name, ...summarize(await getQueueAttributes(info.url)) };
      }
    } catch (error) {
      dlq = { error: error.message };
    }

    return {
      ...base,
      reachable: true,
      queue: {
        ...summarize(attributes),
        visibilityTimeout: count(attributes.VisibilityTimeout),
        maxReceiveCount: policy?.maxReceiveCount ?? null,
        fifo: /\.fifo$/i.test(url),
      },
      dlq,
      hasRedrivePolicy: Boolean(policy),
    };
  } catch (error) {
    return { ...base, reachable: false, error: error.message, queue: null, dlq: null };
  }
};
