import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { MailtrapTransport } from "mailtrap";

import { getMailSettings } from "../services/mail/mailSettings.js";
import { signRequest } from "./awsSigV4.js";
import { canQueueMail, enqueueMail } from "../services/mail/mailQueue.js";

dotenv.config();

/* =====================================================
   CONFIGURATION
===================================================== */

const sender = {
  address: "no-reply@targettrek.in",
  name: "Target Trek",
};

/*
  Mailtrap token, read at SEND time (never frozen at import) and cleaned up:
  hosting dashboards often leave surrounding quotes / spaces / a "Bearer " prefix
  on pasted values. Common alternative variable names are accepted too.
*/
const MAILTRAP_TOKEN_NAMES = [
  "MAILTRAP_TOKEN",
  "MAILTRAP_API_TOKEN",
  "MAILTRAP_API_KEY",
  "MAILTRAP_SENDING_TOKEN",
];

export const getMailtrapToken = () => {
  for (const name of MAILTRAP_TOKEN_NAMES) {
    const value = String(process.env[name] || "")
      .trim()
      .replace(/^["']|["']$/g, "")
      .replace(/^Bearer\s+/i, "")
      .trim();
    if (value) return value;
  }
  return "";
};

// One transport per distinct token, created on first use.
let mailtrapTransport = null;
let mailtrapTransportToken = null;

const getTransport = () => {
  const token = getMailtrapToken();
  if (!mailtrapTransport || mailtrapTransportToken !== token) {
    mailtrapTransport = nodemailer.createTransport(MailtrapTransport({ token }));
    mailtrapTransportToken = token;
  }
  return mailtrapTransport;
};

/* =====================================================
   ATTACHMENT NORMALIZATION

   Handles:
   - Base64-encoded ICS attachments
   - Buffers
   - Ordinary text attachments
   - Other Nodemailer attachment options

   IMPORTANT:
   interviewMail.js already Base64-encodes its
   ICS file. We decode it to a Buffer here so
   Nodemailer/Mailtrap handles it correctly.
===================================================== */

function normalizeAttachments(attachments = []) {
  if (!Array.isArray(attachments)) {
    throw new Error(
      "attachments must be an array"
    );
  }

  return attachments.map(
    (attachment, index) => {
      if (!attachment?.filename) {
        throw new Error(
          `Attachment ${index} is missing filename`
        );
      }

      const contentType =
        attachment.contentType ||
        attachment.type ||
        "application/octet-stream";

      let content = attachment.content;

      if (
        content === undefined ||
        content === null
      ) {
        throw new Error(
          `Attachment ${index} has no content`
        );
      }

      /*
        The interview email service generates
        an ICS string encoded as Base64.

        Decode it into a Buffer before giving
        it to Nodemailer.
      */

      if (
        typeof content === "string" &&
        attachment.filename
          .toLowerCase()
          .endsWith(".ics")
      ) {
        content = Buffer.from(
          content,
          "base64"
        );
      }

      return {
        filename: attachment.filename,
        content,
        contentType,

        contentDisposition:
          attachment.contentDisposition ||
          attachment.disposition ||
          "attachment",

        ...(attachment.cid
          ? { cid: attachment.cid }
          : {}),
      };
    }
  );
}

/* =====================================================
   SEND MAIL

   Compatible with existing calls:

   sendMail(to, subject, text, html)

   Also supports:

   sendMail(to, subject, text, html, {
     replyTo,
     attachments,
     icalEvent
   })

===================================================== */

const sendViaMailtrap = async (
  toEmail,
  subject,
  text,
  htmlContent,
  options = {}
) => {
  if (!getMailtrapToken()) {
    throw new Error(
      "MAILTRAP_TOKEN is missing in this server process " +
        "(set it in the environment of the service that runs the backend, then restart it)"
    );
  }

  const recipients =
    Array.isArray(toEmail)
      ? toEmail
      : [toEmail];

  if (!recipients.length) {
    throw new Error(
      "At least one recipient is required"
    );
  }

  const attachments =
    options.attachments?.length
      ? normalizeAttachments(
          options.attachments
        )
      : [];

  const mailOptions = {
    from: sender,
    to: recipients,
    subject,
    text,
    html: htmlContent,

    ...(options.replyTo
      ? {
          replyTo:
            options.replyTo,
        }
      : {}),

    ...(attachments.length
      ? {
          attachments,
        }
      : {}),

    ...(options.icalEvent
      ? {
          icalEvent:
            options.icalEvent,
        }
      : {}),
  };

  try {
    const info =
      await getTransport().sendMail(
        mailOptions
      );

    const messageId =
      info?.messageId ||
      info?.message_id ||
      info?.message_ids?.[0] ||
      info?.response?.message_ids?.[0] ||
      null;

    console.log(
      "[MAIL SENT]",
      {
        messageId:
          messageId ||
          "Not provided by transport",

        recipients: recipients.length,

        attachments:
          attachments.map(
            (attachment) =>
              attachment.filename
          ),
      }
    );

    return (
      info || {
        accepted: recipients,
        submitted: true,
      }
    );
  } catch (error) {
    console.error(
      "[MAIL SEND FAILED]",
      {
        message:
          error.message,

        code:
          error.code,

        subject,

        attachments:
          attachments.map(
            (attachment) =>
              attachment.filename
          ),
      }
    );

    throw error;
  }
};



/* =====================================================
   RESEND PROVIDER  (RESEND_API_KEY)

   Plain HTTPS call to the Resend REST API, so no extra
   package is needed. Same arguments and same attachment
   rules as the Mailtrap path above.

   RESEND_FROM (optional) overrides the sender. The sending
   domain must be verified in the Resend dashboard.
===================================================== */

// Cleaned like the Mailtrap token: pasted values often carry quotes / spaces / "Bearer ".
const getResendKey = () =>
  String(process.env.RESEND_API_KEY || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^Bearer\s+/i, "")
    .trim();

const RESEND_URL = "https://api.resend.com/emails";
const RESEND_TIMEOUT_MS = 30_000;

const resendFrom = () =>
  process.env.RESEND_FROM ||
  `${sender.name} <${sender.address}>`;

const toBase64Attachment = (attachment, index) => {
  if (!attachment?.filename) {
    throw new Error(`Attachment ${index} is missing filename`);
  }

  const content = attachment.content;

  if (content === undefined || content === null) {
    throw new Error(`Attachment ${index} has no content`);
  }

  let base64;

  if (Buffer.isBuffer(content)) {
    base64 = content.toString("base64");
  } else if (
    typeof content === "string" &&
    attachment.filename.toLowerCase().endsWith(".ics")
  ) {
    // interviewMail.js already Base64-encodes its ICS file.
    base64 = content;
  } else {
    base64 = Buffer.from(String(content)).toString("base64");
  }

  return {
    filename: attachment.filename,
    content: base64,
    content_type:
      attachment.contentType ||
      attachment.type ||
      "application/octet-stream",
  };
};

const sendViaResend = async (
  toEmail,
  subject,
  text,
  htmlContent,
  options = {}
) => {
  const apiKey = getResendKey();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is missing");
  }

  const recipients = Array.isArray(toEmail) ? toEmail : [toEmail];

  if (!recipients.length) {
    throw new Error("At least one recipient is required");
  }

  const attachments = (options.attachments || []).map(toBase64Attachment);

  // Resend has no icalEvent option: send the invite as an .ics attachment.
  if (options.icalEvent?.content) {
    attachments.push({
      filename: options.icalEvent.filename || "invite.ics",
      content: Buffer.from(String(options.icalEvent.content)).toString("base64"),
      content_type: "text/calendar; method=" + (options.icalEvent.method || "REQUEST"),
    });
  }

  const payload = {
    from: resendFrom(),
    to: recipients,
    subject,
    ...(text ? { text } : {}),
    ...(htmlContent ? { html: htmlContent } : {}),
    ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    ...(attachments.length ? { attachments } : {}),
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RESEND_TIMEOUT_MS);

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        body?.message || `Resend responded with ${response.status}`
      );
      error.code = body?.name || `HTTP_${response.status}`;
      error.statusCode = response.status;
      throw error;
    }

    console.log("[MAIL SENT]", {
      provider: "resend",
      messageId: body.id || "Not provided",
      recipients: recipients.length,
      attachments: attachments.map((a) => a.filename),
    });

    return {
      messageId: body.id || null,
      accepted: recipients,
      submitted: true,
      provider: "resend",
    };
  } catch (error) {
    const aborted = error?.name === "AbortError";
    if (aborted) {
      error.message = "Resend request timed out";
      error.code = "ETIMEDOUT";
    }

    console.error("[MAIL SEND FAILED]", {
      provider: "resend",
      message: error.message,
      code: error.code,
      subject,
    });

    throw error;
  } finally {
    clearTimeout(timer);
  }
};

/* =====================================================
   AMAZON SES PROVIDER

   Amazon SES v2 "SendEmail" over HTTPS, signed with AWS
   Signature V4 (utils/awsSigV4.js), so no AWS SDK is needed.

   Uses the normal Simple content (subject + text + html, plus
   attachments), which needs only the IAM permission
   ses:SendEmail. (Raw MIME would need ses:SendRawEmail.)

   Environment:
     AMAZON_ACCESS_KEY_ID        (or AWS_ACCESS_KEY_ID)
     AMAZON_SECRET_ACCESS_KEY    (or AWS_SECRET_ACCESS_KEY)
     AMAZON_REGION               (or AMAZON_SES_REGION / AWS_REGION), e.g. ap-south-1
   Optional:
     AMAZON_SESSION_TOKEN              temporary credentials
     AMAZON_SES_FROM_EMAIL / AMAZON_SES_FROM_NAME   sender override
     AMAZON_SES_CONFIGURATION_SET      SES configuration set

   The sender address (or its domain) must be a VERIFIED identity in
   SES. New SES accounts start in the sandbox, which can only send to
   verified addresses until AWS grants production access.
===================================================== */

const SES_TIMEOUT_MS = 30_000;

const firstEnv = (...names) => {
  for (const name of names) {
    const value = String(process.env[name] || "").trim();
    if (value) return value;
  }
  return "";
};

const sesConfig = () => {
  const accessKeyId = firstEnv("AMAZON_ACCESS_KEY_ID", "AWS_ACCESS_KEY_ID");
  const secretAccessKey = firstEnv("AMAZON_SECRET_ACCESS_KEY", "AWS_SECRET_ACCESS_KEY");
  const region = firstEnv("AMAZON_REGION", "AMAZON_SES_REGION", "AWS_REGION", "AWS_DEFAULT_REGION");

  return {
    accessKeyId,
    secretAccessKey,
    region,
    sessionToken: firstEnv("AMAZON_SESSION_TOKEN", "AWS_SESSION_TOKEN") || null,
    configurationSet: firstEnv("AMAZON_SES_CONFIGURATION_SET") || null,
    missing: [
      ...(accessKeyId ? [] : ["AMAZON_ACCESS_KEY_ID"]),
      ...(secretAccessKey ? [] : ["AMAZON_SECRET_ACCESS_KEY"]),
      ...(region ? [] : ["AMAZON_REGION"]),
    ],
  };
};

const sesFrom = () => ({
  address: firstEnv("AMAZON_SES_FROM_EMAIL") || sender.address,
  name: firstEnv("AMAZON_SES_FROM_NAME") || sender.name,
});

// SES wants "Name <address>" (quoted when the name has special characters).
const formatAddress = ({ name, address }) =>
  name ? `${/[",<>@]/.test(name) ? JSON.stringify(name) : name} <${address}>` : address;

const sesData = (value) => ({ Data: value, Charset: "UTF-8" });

const sendViaSes = async (
  toEmail,
  subject,
  text,
  htmlContent,
  options = {}
) => {
  const config = sesConfig();

  if (config.missing.length) {
    throw new Error(`Amazon SES is missing: ${config.missing.join(", ")}`);
  }

  const recipients = Array.isArray(toEmail) ? toEmail : [toEmail];

  if (!recipients.length) {
    throw new Error("At least one recipient is required");
  }

  // Same attachment rules as Resend (ICS arrives base64-encoded already).
  const attachments = (options.attachments || []).map((attachment, index) => {
    const converted = toBase64Attachment(attachment, index);
    return {
      FileName: converted.filename,
      ContentType: converted.content_type,
      RawContent: converted.content,
      ContentDisposition: "ATTACHMENT",
      ContentTransferEncoding: "BASE64",
    };
  });

  // Calendar invites are sent as an .ics attachment.
  if (options.icalEvent?.content) {
    attachments.push({
      FileName: options.icalEvent.filename || "invite.ics",
      ContentType: "text/calendar; method=" + (options.icalEvent.method || "REQUEST"),
      RawContent: Buffer.from(String(options.icalEvent.content)).toString("base64"),
      ContentDisposition: "ATTACHMENT",
      ContentTransferEncoding: "BASE64",
    });
  }

  const body = JSON.stringify({
    FromEmailAddress: formatAddress(sesFrom()),
    Destination: { ToAddresses: recipients },
    ...(options.replyTo ? { ReplyToAddresses: [options.replyTo] } : {}),
    Content: {
      Simple: {
        Subject: sesData(subject),
        Body: {
          ...(text ? { Text: sesData(text) } : {}),
          ...(htmlContent ? { Html: sesData(htmlContent) } : {}),
        },
        ...(attachments.length ? { Attachments: attachments } : {}),
      },
    },
    ...(config.configurationSet ? { ConfigurationSetName: config.configurationSet } : {}),
  });

  const url = `https://email.${config.region}.amazonaws.com/v2/email/outbound-emails`;

  const headers = signRequest({
    method: "POST",
    url,
    headers: { "content-type": "application/json" },
    body,
    region: config.region,
    service: "ses",
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    sessionToken: config.sessionToken,
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SES_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        result?.message || result?.Message || `Amazon SES responded with ${response.status}`
      );
      error.code =
        String(response.headers.get("x-amzn-errortype") || result?.__type || `HTTP_${response.status}`).split(":")[0];
      error.statusCode = response.status;
      throw error;
    }

    console.log("[MAIL SENT]", {
      provider: "ses",
      messageId: result.MessageId || "Not provided",
      recipients: recipients.length,
      attachments: attachments.map((a) => a.FileName),
    });

    return {
      messageId: result.MessageId || null,
      accepted: recipients,
      submitted: true,
      provider: "ses",
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      error.message = "Amazon SES request timed out";
      error.code = "ETIMEDOUT";
    }

    console.error("[MAIL SEND FAILED]", {
      provider: "ses",
      message: error.message,
      code: error.code,
      subject,
    });

    throw error;
  } finally {
    clearTimeout(timer);
  }
};

/* =====================================================
   PROVIDER REGISTRY + RUNTIME SWITCH
===================================================== */

const PROVIDERS = {
  mailtrap: {
    send: sendViaMailtrap,
    configured: () => Boolean(getMailtrapToken()),
  },
  resend: {
    send: sendViaResend,
    configured: () => Boolean(getResendKey()),
  },
  ses: {
    send: sendViaSes,
    configured: () => sesConfig().missing.length === 0,
  },
};

// Order failover tries the OTHER providers in.
const ORDER = ["mailtrap", "resend", "ses"];

const emptyStats = () => ({ sent: 0, failed: 0, lastError: null, lastErrorAt: null, lastSentAt: null });

// Per-process counters, shown on the admin page.
const stats = {
  mailtrap: emptyStats(),
  resend: emptyStats(),
  ses: emptyStats(),
  fallbacks: 0,
};

/*
  A provider that answers 401/403 (bad API key / no permission) will keep doing so,
  so skip it for a few minutes instead of failing the first attempt of every email.
*/
const AUTH_COOLDOWN_MS = 5 * 60 * 1000;
const authBlockedUntil = {};
const isAuthError = (error) =>
  [401, 403].includes(Number(error?.statusCode)) ||
  /api key is invalid|invalid api key|unauthori[sz]ed|invalid.*token|security token|signature/i.test(String(error?.message || ""));

const record = (name, ok, error) => {
  const s = stats[name];
  if (ok) {
    delete authBlockedUntil[name];
    s.sent += 1;
    s.lastSentAt = new Date().toISOString();
  } else {
    s.failed += 1;
    s.lastError = String(error?.message || error).slice(0, 300);
    s.lastErrorAt = new Date().toISOString();
    if (isAuthError(error)) {
      authBlockedUntil[name] = Date.now() + AUTH_COOLDOWN_MS;
      console.error(`[MAIL] ${name} rejected its credentials; skipping it for 5 minutes. Fix its key in .env.`);
    }
  }
};

// Names only, never values: shown at start-up so production logs prove what the process can see.
export const logMailConfiguration = () => {
  console.log("[MAIL] providers configured in this process:", {
    mailtrap: PROVIDERS.mailtrap.configured(),
    resend: PROVIDERS.resend.configured(),
    ses: PROVIDERS.ses.configured(),
  });
};

export const getMailProviderStatus = () => ({
  providers: {
    mailtrap: {
      configured: PROVIDERS.mailtrap.configured(),
      missing: PROVIDERS.mailtrap.configured() ? [] : ["MAILTRAP_TOKEN"],
    },
    resend: { configured: PROVIDERS.resend.configured(), from: resendFrom() },
    ses: {
      configured: PROVIDERS.ses.configured(),
      from: `${sesFrom().name} <${sesFrom().address}>`,
      region: sesConfig().region || null,
      // Which settings are still missing (so the admin page can say exactly what to add).
      missing: sesConfig().missing,
    },
  },
  stats: JSON.parse(JSON.stringify(stats)),
});

/* Send through ONE specific provider (admin test button). No fallback. */
export const sendMailWith = async (provider, ...args) => {
  const target = PROVIDERS[provider];
  if (!target) throw new Error(`Unknown mail provider: ${provider}`);

  try {
    const info = await target.send(...args);
    record(provider, true);
    return info;
  } catch (error) {
    record(provider, false, error);
    throw error;
  }
};

/* =====================================================
   DIRECT DELIVERY

   deliverMail(to, subject, text, html, options?)

   Sends RIGHT NOW through the provider the admin selected.
   If it fails and failover is on, every OTHER configured provider
   is tried in turn (mailtrap → resend → ses), so one provider's
   "daily limit reached" never stops emails.

   This is what the queue worker calls. Application code should
   normally call sendMail() below instead.
===================================================== */

const assertSendingEnabled = (args) => {
  // Safety switch for tests / dry runs: never contact a provider.
  if (process.env.MAIL_DISABLE_SEND === "true") {
    // Tests may collect what WOULD have been sent: set globalThis.__MAIL_OUTBOX = [].
    if (Array.isArray(globalThis.__MAIL_OUTBOX)) {
      const [to, subject, text, html, options] = args;
      globalThis.__MAIL_OUTBOX.push({ to, subject, text, html, options });
    }
    throw new Error("Mail sending is disabled (MAIL_DISABLE_SEND=true)");
  }
};

export const deliverMail = async (...args) => {
  assertSendingEnabled(args);

  const settings = await getMailSettings();

  const chosen = PROVIDERS[settings.provider]
    ? settings.provider
    : "mailtrap";

  /*
    A provider whose keys are not set can never succeed, so do not try it
    first (that only produced "MAILTRAP_TOKEN is missing" noise and extra
    delay). Start with the chosen provider if it is configured, otherwise
    with the first configured one; the rest are the failover backups.
  */
  const all = ORDER.filter((name) => PROVIDERS[name].configured());
  // Providers with rejected credentials go last (never dropped: better than sending nothing).
  const healthy = all.filter((n) => !(authBlockedUntil[n] > Date.now()));
  const configured = [...healthy, ...all.filter((n) => !healthy.includes(n))];

  if (!configured.length) {
    // Nothing configured: let the chosen provider produce its clear error.
    return sendMailWith(chosen, ...args);
  }

  const primary = healthy.includes(chosen) ? chosen : configured[0];

  if (primary !== chosen && !authBlockedUntil[chosen]) {
    console.warn(
      `[MAIL] "${chosen}" is selected but not configured; using "${primary}". ` +
        `Add its keys or pick another provider at /admin/mail.`
    );
  }

  try {
    return await sendMailWith(primary, ...args);
  } catch (primaryError) {
    if (!settings.fallbackEnabled) {
      throw primaryError;
    }

    const backups = configured.filter((name) => name !== primary);

    for (const backup of backups) {
      stats.fallbacks += 1;
      console.warn(
        `[MAIL FALLBACK] ${primary} failed (${primaryError.message}); retrying with ${backup}`
      );

      try {
        return await sendMailWith(backup, ...args);
      } catch (backupError) {
        console.warn(`[MAIL FALLBACK] ${backup} failed too (${backupError.message})`);
      }
    }

    // Surface the primary failure: that is the one the admin configured.
    throw primaryError;
  }
};

/* =====================================================
   SEND MAIL (default export, unchanged signature)

   sendMail(to, subject, text, html, options?)

   BACKGROUND SENDING: when the Amazon SQS queue is configured
   (SQS_EMAIL_QUEUE_NAME + AMAZON_* keys) the email is put on the
   queue and the call returns immediately; the mail worker sends
   it, retries transient failures and AWS moves messages that keep
   failing to the dead-letter queue.

   Delivered directly (the old behaviour) when:
     - SQS is not configured, or MAIL_QUEUE_ENABLED=false
     - the email has attachments or a calendar invite (binary data
       does not belong on a queue)
     - options.sync === true (the caller needs the real send result)
     - the queue itself is unreachable (so mail is never lost)
===================================================== */

const sendMail = async (to, subject, text, html, options = {}) => {
  if (canQueueMail(options)) {
    assertSendingEnabled([to, subject, text, html, options]);

    try {
      return await enqueueMail(to, subject, text, html, options);
    } catch (error) {
      console.error(
        `[MAIL QUEUE] could not queue (${error.code || error.message}); sending directly instead`
      );
    }
  }

  return deliverMail(to, subject, text, html, options);
};

export default sendMail;
