import { z } from "zod";

import User from "../models/User.js";
import { MAIL_PROVIDERS } from "../models/MailSettings.js";
import { getMailSettings, updateMailSettings } from "../services/mail/mailSettings.js";
import { getMailProviderStatus, sendMailWith } from "../utils/MailSender.js";
import { logActivity } from "../utils/authUtils.js";

const ok = (res, data) => res.json({ success: true, data });
const fail = (res, status, message, code) =>
  res.status(status).json({ success: false, message, ...(code ? { code } : {}) });

const updateSchema = z
  .object({
    provider: z.enum(MAIL_PROVIDERS).optional(),
    fallbackEnabled: z.boolean().optional(),
  })
  .refine((v) => v.provider !== undefined || v.fallbackEnabled !== undefined, {
    message: "Nothing to update",
  });

const testSchema = z.object({
  provider: z.enum(MAIL_PROVIDERS),
  to: z.string().trim().toLowerCase().email().max(120).optional(),
});

const snapshot = async () => {
  const settings = await getMailSettings({ fresh: true });
  return { ...settings, ...getMailProviderStatus() };
};

export const getMail = async (req, res) => {
  try {
    ok(res, await snapshot());
  } catch (error) {
    console.error("[mail settings] get failed:", error.message);
    fail(res, 500, "Unable to load mail settings");
  }
};

export const updateMail = async (req, res) => {
  try {
    const input = updateSchema.parse(req.body);
    const status = getMailProviderStatus();

    // Never point the whole system at a provider that has no credentials.
    if (input.provider && !status.providers[input.provider].configured) {
      return fail(
        res,
        400,
        input.provider === "resend"
          ? "RESEND_API_KEY is not set on the server, so Resend can't be selected yet."
          : "MAILTRAP_TOKEN is not set on the server, so Mailtrap can't be selected yet.",
        "PROVIDER_NOT_CONFIGURED"
      );
    }

    const admin = await User.findById(req.user.userId).select("name").lean();

    await updateMailSettings({
      ...input,
      userId: req.user.userId,
      userName: admin?.name,
    });

    await logActivity({
      req,
      user: req.user.userId,
      actor: req.user.userId,
      action: "MAIL_PROVIDER_CHANGED",
      metadata: input,
    });

    ok(res, await snapshot());
  } catch (error) {
    if (error?.name === "ZodError") {
      return fail(res, 400, error.issues?.[0]?.message || "Invalid request", "VALIDATION");
    }
    console.error("[mail settings] update failed:", error.message);
    fail(res, 500, "Unable to update mail settings");
  }
};

/* Sends a real test email through ONE provider (no fallback) so the admin can
   see whether that provider works before switching to it. */
export const testMail = async (req, res) => {
  try {
    const { provider, to } = testSchema.parse(req.body);
    const status = getMailProviderStatus();

    if (!status.providers[provider].configured) {
      return fail(res, 400, `${provider} is not configured on the server.`, "PROVIDER_NOT_CONFIGURED");
    }

    const admin = await User.findById(req.user.userId).select("email name").lean();
    const recipient = to || admin?.email;

    if (!recipient) return fail(res, 400, "No recipient email available.");

    const when = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    try {
      const info = await sendMailWith(
        provider,
        recipient,
        `Test email via ${provider} – Target Trek`,
        `This is a test email sent through ${provider} at ${when} (IST).`,
        `<p>This is a test email sent through <b>${provider}</b> at ${when} (IST).</p><p>If you can read this, ${provider} is working.</p>`
      );

      ok(res, { provider, to: recipient, messageId: info?.messageId || null, ...getMailProviderStatus() });
    } catch (error) {
      // 200-range for the HTTP call itself: the page shows the provider's own error.
      res.status(502).json({
        success: false,
        code: "TEST_SEND_FAILED",
        message: `${provider} could not send: ${error.message}`,
        ...getMailProviderStatus(),
      });
    }
  } catch (error) {
    if (error?.name === "ZodError") {
      return fail(res, 400, error.issues?.[0]?.message || "Invalid request", "VALIDATION");
    }
    console.error("[mail settings] test failed:", error.message);
    fail(res, 500, "Unable to send the test email");
  }
};
