import MailSuppression from "../models/MailSuppression.js";
import { escapeHtml, verifyUnsubscribeToken } from "../services/campaign/render.js";
import { isValidEmail, normalizeEmail } from "../services/campaign/audience.js";

const page = (title, body) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;background:#fafaf9;font-family:Arial,Helvetica,sans-serif;color:#1c1917;"><div style="max-width:440px;margin:12vh auto;padding:32px 28px;background:#fff;border:1px solid #e7e5e4;border-radius:16px;text-align:center;">
<div style="font-size:20px;font-weight:800;color:#ea580c;margin-bottom:18px;">Target Trek</div>${body}</div></body></html>`;

const parse = (source) => {
  const email = normalizeEmail(source?.e);
  const valid = isValidEmail(email) && verifyUnsubscribeToken(email, source?.t);
  return { email, valid, campaignId: /^[a-f\d]{24}$/i.test(String(source?.c || "")) ? source.c : null, token: source?.t };
};

// Step 1: a confirmation page (so mail scanners that open links do not unsubscribe people).
export const unsubscribePage = (req, res) => {
  const { email, valid, campaignId, token } = parse(req.query);
  res.set("Cache-Control", "no-store");
  if (!valid) {
    return res.status(400).send(page("Invalid link", `<p>This unsubscribe link is not valid.</p>`));
  }
  res.send(
    page(
      "Unsubscribe",
      `<h1 style="font-size:20px;margin:0 0 10px;">Unsubscribe</h1><p style="color:#57534e;font-size:14px;">Stop promotional emails to <b>${escapeHtml(email)}</b>?</p>
<form method="post" action="/api/mail/unsubscribe"><input type="hidden" name="e" value="${escapeHtml(email)}"><input type="hidden" name="t" value="${escapeHtml(token)}"><input type="hidden" name="c" value="${escapeHtml(campaignId || "")}">
<button type="submit" style="margin-top:14px;padding:12px 26px;border:0;border-radius:10px;background:#ea580c;color:#fff;font-size:15px;font-weight:700;cursor:pointer;">Yes, unsubscribe me</button></form>`
    )
  );
};

// Step 2: the actual unsubscribe (also what "one-click" mail clients POST).
export const unsubscribeSubmit = async (req, res) => {
  const { email, valid, campaignId } = parse({ ...req.query, ...req.body });
  res.set("Cache-Control", "no-store");
  if (!valid) {
    return res.status(400).send(page("Invalid link", `<p>This unsubscribe link is not valid.</p>`));
  }
  try {
    await MailSuppression.updateOne(
      { email },
      { $setOnInsert: { email, reason: "UNSUBSCRIBED", campaignId } },
      { upsert: true }
    );
  } catch (error) {
    console.error("[unsubscribe]", error.message);
    return res.status(500).send(page("Error", `<p>Something went wrong. Please try again.</p>`));
  }
  res.send(
    page("Unsubscribed", `<h1 style="font-size:20px;margin:0 0 10px;">You are unsubscribed</h1><p style="color:#57534e;font-size:14px;">${escapeHtml(email)} will no longer receive promotional emails. Order and account emails still reach you.</p>`)
  );
};
