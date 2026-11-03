import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { MailtrapTransport } from "mailtrap";

import { getMailSettings } from "../services/mail/mailSettings.js";

dotenv.config();

/* =====================================================
   CONFIGURATION
===================================================== */

const sender = {
  address: "no-reply@targettrek.in",
  name: "Target Trek",
};

const transport = nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  })
);

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
  if (!process.env.MAILTRAP_TOKEN) {
    throw new Error(
      "MAILTRAP_TOKEN is missing"
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
      await transport.sendMail(
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
  const apiKey = process.env.RESEND_API_KEY;

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
   PROVIDER REGISTRY + RUNTIME SWITCH
===================================================== */

const PROVIDERS = {
  mailtrap: {
    send: sendViaMailtrap,
    configured: () => Boolean(process.env.MAILTRAP_TOKEN),
  },
  resend: {
    send: sendViaResend,
    configured: () => Boolean(process.env.RESEND_API_KEY),
  },
};

const other = (name) => (name === "mailtrap" ? "resend" : "mailtrap");

// Per-process counters, shown on the admin page.
const stats = {
  mailtrap: { sent: 0, failed: 0, lastError: null, lastErrorAt: null, lastSentAt: null },
  resend: { sent: 0, failed: 0, lastError: null, lastErrorAt: null, lastSentAt: null },
  fallbacks: 0,
};

const record = (name, ok, error) => {
  const s = stats[name];
  if (ok) {
    s.sent += 1;
    s.lastSentAt = new Date().toISOString();
  } else {
    s.failed += 1;
    s.lastError = String(error?.message || error).slice(0, 300);
    s.lastErrorAt = new Date().toISOString();
  }
};

export const getMailProviderStatus = () => ({
  providers: {
    mailtrap: { configured: PROVIDERS.mailtrap.configured() },
    resend: { configured: PROVIDERS.resend.configured(), from: resendFrom() },
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
   SEND MAIL (default export, unchanged signature)

   sendMail(to, subject, text, html, options?)

   Uses the provider the admin selected. If it fails and
   fallback is on, the other configured provider is tried,
   so a "daily limit reached" no longer stops emails.
===================================================== */

const sendMail = async (...args) => {
  const settings = await getMailSettings();

  const primary = PROVIDERS[settings.provider]
    ? settings.provider
    : "mailtrap";

  try {
    const info = await sendMailWith(primary, ...args);
    return info;
  } catch (error) {
    const backup = other(primary);

    if (!settings.fallbackEnabled || !PROVIDERS[backup].configured()) {
      throw error;
    }

    stats.fallbacks += 1;
    console.warn(
      `[MAIL FALLBACK] ${primary} failed (${error.message}); retrying with ${backup}`
    );

    try {
      return await sendMailWith(backup, ...args);
    } catch (backupError) {
      // Surface the primary failure: that is the one the admin configured.
      backupError.primaryError = error.message;
      throw error;
    }
  }
};

export default sendMail;
