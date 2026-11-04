import crypto from "node:crypto";

import { signRequest } from "../../utils/awsSigV4.js";

/*
  Minimal Amazon SQS client (JSON protocol, SigV4-signed over HTTPS), the same
  approach as the SES sender: no AWS SDK needed.

  Environment
    SQS_EMAIL_QUEUE_NAME      name of the main email queue            (required)
    SQS_EMAIL_QUEUE_URL       full queue URL, skips the name lookup   (optional)
    SQS_EMAIL_DLQ_NAME        dead-letter queue name. Optional: it is discovered
                              from the main queue's redrive policy.
    SQS_REGION                defaults to AMAZON_REGION / AWS_REGION
    AMAZON_ACCESS_KEY_ID / AMAZON_SECRET_ACCESS_KEY (or AWS_*)  same keys as SES

  IAM needed: sqs:SendMessage, sqs:ReceiveMessage, sqs:DeleteMessage,
  sqs:ChangeMessageVisibility, sqs:GetQueueUrl, sqs:GetQueueAttributes
  (and the same on the DLQ so the admin page can inspect / redrive it).
*/

const firstEnv = (...names) => {
  for (const name of names) {
    const value = String(process.env[name] || "").trim();
    if (value) return value;
  }
  return "";
};

export const sqsConfig = () => {
  const accessKeyId = firstEnv("AMAZON_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID");
  const secretAccessKey = firstEnv("AMAZON_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY");
  const region = firstEnv("SQS_REGION", "AMAZON_REGION", "AMAZON_SES_REGION", "AWS_REGION", "AWS_DEFAULT_REGION");
  const queueName = firstEnv("SQS_EMAIL_QUEUE_NAME");
  const queueUrl = firstEnv("SQS_EMAIL_QUEUE_URL");

  const missing = [
    ...(accessKeyId ? [] : ["AMAZON_ACCESS_KEY_ID"]),
    ...(secretAccessKey ? [] : ["AMAZON_SECRET_ACCESS_KEY"]),
    ...(region ? [] : ["AMAZON_REGION"]),
    ...(queueName || queueUrl ? [] : ["SQS_EMAIL_QUEUE_NAME"]),
  ];

  return {
    accessKeyId,
    secretAccessKey,
    region,
    sessionToken: firstEnv("AMAZON_SESSION_TOKEN", "AWS_SESSION_TOKEN") || null,
    queueName: queueName || (queueUrl ? queueUrl.split("/").pop() : ""),
    queueUrl,
    dlqName: firstEnv("SQS_EMAIL_DLQ_NAME"),
    missing,
    configured: missing.length === 0,
  };
};

export const isSqsConfigured = () =>
  process.env.MAIL_QUEUE_ENABLED !== "false" && sqsConfig().configured;

const SQS_TIMEOUT_MS = 30_000;

export class SqsError extends Error {
  constructor(message, { code, statusCode } = {}) {
    super(message);
    this.name = "SqsError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

// One SQS API call. `timeoutMs` must exceed any long-poll wait.
export const sqsCall = async (action, payload, { timeoutMs = SQS_TIMEOUT_MS } = {}) => {
  const config = sqsConfig();
  if (config.missing.length) {
    throw new SqsError(`Amazon SQS is missing: ${config.missing.join(", ")}`, { code: "NotConfigured" });
  }

  const url = `https://sqs.${config.region}.amazonaws.com/`;
  const body = JSON.stringify(payload);

  const headers = signRequest({
    method: "POST",
    url,
    headers: {
      "content-type": "application/x-amz-json-1.0",
      "x-amz-target": `AmazonSQS.${action}`,
    },
    body,
    region: config.region,
    service: "sqs",
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    sessionToken: config.sessionToken,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { method: "POST", headers, body, signal: controller.signal });
    const text = await response.text();
    let result = {};
    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = {};
    }

    if (!response.ok) {
      const rawType = String(result?.__type || response.headers.get("x-amzn-errortype") || `HTTP_${response.status}`);
      const code = rawType.split("#").pop().split(":")[0];
      throw new SqsError(result?.message || result?.Message || `Amazon SQS responded with ${response.status}`, {
        code,
        statusCode: response.status,
      });
    }

    return result;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new SqsError("Amazon SQS request timed out", { code: "ETIMEDOUT" });
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
};

/* ------------------------------------------------------------------ */
/* Queue URL resolution (cached)                                       */
/* ------------------------------------------------------------------ */

let mainUrl = null;
let dlqInfo = null; // { url, arn, name } | false (no DLQ) | null (not looked up yet)

export const resetSqsCache = () => {
  mainUrl = null;
  dlqInfo = null;
};

export const getQueueUrl = async (name) => {
  const result = await sqsCall("GetQueueUrl", { QueueName: name });
  return result.QueueUrl;
};

export const getMainQueueUrl = async () => {
  if (mainUrl) return mainUrl;
  const config = sqsConfig();
  mainUrl = config.queueUrl || (await getQueueUrl(config.queueName));
  return mainUrl;
};

export const getQueueAttributes = async (queueUrl, names = ["All"]) => {
  const result = await sqsCall("GetQueueAttributes", { QueueUrl: queueUrl, AttributeNames: names });
  return result.Attributes || {};
};

export const parseRedrivePolicy = (attributes) => {
  try {
    const policy = JSON.parse(attributes?.RedrivePolicy || "null");
    if (!policy?.deadLetterTargetArn) return null;
    return {
      deadLetterTargetArn: policy.deadLetterTargetArn,
      maxReceiveCount: Number(policy.maxReceiveCount) || null,
    };
  } catch {
    return null;
  }
};

/*
  The DLQ is attached to the main queue by AWS (redrive policy), so the app only
  has to *find* it: read the policy, turn the target ARN into a queue URL.
  SQS_EMAIL_DLQ_NAME overrides the discovery.
*/
export const getDlq = async () => {
  if (dlqInfo !== null) return dlqInfo || null;

  const config = sqsConfig();
  let name = config.dlqName;
  let arn = null;

  if (!name) {
    const attributes = await getQueueAttributes(await getMainQueueUrl(), ["RedrivePolicy"]);
    const policy = parseRedrivePolicy(attributes);
    if (!policy) {
      dlqInfo = false;
      return null;
    }
    arn = policy.deadLetterTargetArn;
    name = arn.split(":").pop();
  }

  const url = await getQueueUrl(name);
  dlqInfo = { url, arn, name };
  return dlqInfo;
};

/* ------------------------------------------------------------------ */
/* Messages                                                            */
/* ------------------------------------------------------------------ */

const isFifo = (url) => /\.fifo$/i.test(url || "");

const fifoFields = (url, dedupeId) =>
  isFifo(url)
    ? { MessageGroupId: "email", MessageDeduplicationId: dedupeId || crypto.randomUUID() }
    : {};

export const sendMessage = async (body, { queueUrl, delaySeconds, dedupeId } = {}) => {
  const url = queueUrl || (await getMainQueueUrl());
  return sqsCall("SendMessage", {
    QueueUrl: url,
    MessageBody: typeof body === "string" ? body : JSON.stringify(body),
    ...(delaySeconds ? { DelaySeconds: Math.min(900, Math.max(0, Math.floor(delaySeconds))) } : {}),
    ...fifoFields(url, dedupeId),
  });
};

// Up to 10 per request (SQS limit). Returns { successful: [{id, messageId}], failed: [{id, code, message}] }.
export const sendMessageBatch = async (entries, { queueUrl } = {}) => {
  const url = queueUrl || (await getMainQueueUrl());
  const result = await sqsCall("SendMessageBatch", {
    QueueUrl: url,
    Entries: entries.slice(0, 10).map((entry) => ({
      Id: String(entry.id),
      MessageBody: typeof entry.body === "string" ? entry.body : JSON.stringify(entry.body),
      ...(entry.delaySeconds ? { DelaySeconds: Math.min(900, Math.floor(entry.delaySeconds)) } : {}),
      ...fifoFields(url, entry.dedupeId),
    })),
  });

  return {
    successful: (result.Successful || []).map((s) => ({ id: s.Id, messageId: s.MessageId })),
    failed: (result.Failed || []).map((f) => ({ id: f.Id, code: f.Code, message: f.Message })),
  };
};

export const receiveMessages = async ({
  queueUrl,
  max = 10,
  waitSeconds = 20,
  visibilityTimeout,
} = {}) => {
  const url = queueUrl || (await getMainQueueUrl());
  const result = await sqsCall(
    "ReceiveMessage",
    {
      QueueUrl: url,
      MaxNumberOfMessages: Math.min(10, Math.max(1, max)),
      WaitTimeSeconds: waitSeconds,
      ...(visibilityTimeout !== undefined ? { VisibilityTimeout: visibilityTimeout } : {}),
      MessageSystemAttributeNames: ["ApproximateReceiveCount", "SentTimestamp"],
    },
    { timeoutMs: (waitSeconds + 15) * 1000 }
  );

  return (result.Messages || []).map((m) => ({
    messageId: m.MessageId,
    receiptHandle: m.ReceiptHandle,
    body: m.Body,
    receiveCount: Number(m.Attributes?.ApproximateReceiveCount) || 1,
    sentAt: m.Attributes?.SentTimestamp ? new Date(Number(m.Attributes.SentTimestamp)) : null,
  }));
};

export const deleteMessage = (receiptHandle, { queueUrl } = {}) =>
  getMainQueueUrl().then((main) =>
    sqsCall("DeleteMessage", { QueueUrl: queueUrl || main, ReceiptHandle: receiptHandle })
  );

export const changeVisibility = (receiptHandle, seconds, { queueUrl } = {}) =>
  getMainQueueUrl().then((main) =>
    sqsCall("ChangeMessageVisibility", {
      QueueUrl: queueUrl || main,
      ReceiptHandle: receiptHandle,
      VisibilityTimeout: Math.min(43200, Math.max(0, Math.floor(seconds))),
    })
  );
