import MemoryPage from "../../models/memory/MemoryPage.js";
import MemoryMailBlock from "../../models/memory/MemoryMailBlock.js";
import sendMail from "../../utils/MailSender.js";
import { EMAIL_LOOKS } from "./emailThemes.js";
import { MAX_EMAIL_SENDS, MemoryError, decryptPin, shareUrl } from "./memoryService.js";

/*
  THE EMAIL THAT CARRIES A PAGE.
  Sent once when the page is created (if the sender ticked "email this page") and, if it didn't arrive, up to MAX_EMAIL_SENDS times in total.
  It is dressed in the colours of the page's look, and carries the link and (for a private page) the PIN.

  Built to land in the inbox rather than Promotions or spam: it is a personal, one-to-one message (named sender, named recipient, one clear
  link), plain wording with no offers or exclamation marks, no remote images or tracking pixels, a plain-text version alongside the HTML,
  a visible "why you got this" line, a way to ask never to be emailed again, and a real reply address. What also matters happens outside
  the code: the sending domain needs SPF, DKIM and DMARC set up with your mail provider.
*/
const RESEND_GAP_MS = 2 * 60 * 1000;
const SUPPORT = "supporttargettrek@gmail.com";

const COPY = {
  birthday: { subject: (s) => `${s} made you a birthday page`, headline: (r) => `Happy birthday, ${r}`, line: (s) => `${s} made you a little page to open: balloons to pop, a cake to cut and a few gifts inside.`, button: "Open your page", emoji: "🎂" },
  sorry: { subject: (s) => `${s} has something to tell you`, headline: (r, s) => `A message from ${s}`, line: (s) => `${s} made you a page with a few honest words. Open it whenever you're ready.`, button: "Open the page", emoji: "🧸" },
  proposal: { subject: (s) => `${s} has a question for you`, headline: (r, s) => `${r}, ${s} wrote you something`, line: (s) => `${s} made you a page and would love for you to open it. Take your time. Whatever you answer is entirely yours to decide.`, button: "Open your page", emoji: "💍" },
  anniversary: { subject: (s) => `${s} made you an anniversary page`, headline: (r) => `Happy anniversary, ${r}`, line: (s) => `${s} made you a page about your story together.`, button: "Open your page", emoji: "🥂" },
  thanks: { subject: (s) => `${s} wrote you a thank-you page`, headline: (r) => `Thank you, ${r}`, line: (s) => `${s} made you a page to say thank you.`, button: "Open your page", emoji: "🍂" },
};

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dateText = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

/** The look this page uses (its own theme, or the template's default), as colours. */
export const lookFor = (theme, style) => {
  const set = EMAIL_LOOKS[theme] || EMAIL_LOOKS.birthday;
  return set.looks[style] || set.looks[set.default];
};

/** The whole message: subject, plain text and themed HTML. Pure, so it can be tested and previewed. */
export const buildPageMail = ({ theme, style, senderName, recipientName, url, pin, pinHidden = false, expiresAt }) => {
  const c = COPY[theme] || COPY.birthday;
  const look = lookFor(theme, style);
  const sender = senderName || "Someone";
  const recipient = recipientName || "there";
  const subject = c.subject(sender, recipient);
  const headline = c.headline(recipient, sender);
  const line = c.line(sender, recipient);
  const until = expiresAt ? `This page is online until ${dateText(expiresAt)}.` : "";
  const why = `You're getting this one-time email because ${sender} used Memories (Target Trek) to make you a page and entered your address. We won't email you again unless ${sender} asks us to resend it. Don't want emails like this? Write to ${SUPPORT} and we'll make sure none are sent to this address.`;

  const text = [
    `${headline}`, "",
    line, "",
    `${c.button}: ${url}`,
    ...(pin ? ["", `It's private. The PIN to open it is: ${pin}`, "Please keep the PIN to yourself."] : pinHidden ? ["", `It's private. ${sender} will give you the PIN to open it.`] : []),
    ...(until ? ["", until] : []),
    "", "—", why, "",
    "Memories by Target Trek · https://www.targettrek.in/memories",
  ].join("\n");

  const bodyBg = look.bg;
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="${look.dark ? "dark" : "light"}"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${bodyBg};-webkit-text-size-adjust:100%;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bodyBg};">
  <tr><td align="center" style="padding:28px 14px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
      <tr><td align="center" style="padding:0 0 14px;font-family:Georgia,'Times New Roman',serif;font-size:15px;letter-spacing:.08em;color:${look.muted};">${esc(c.emoji)}&nbsp; MEMORIES</td></tr>
      <tr><td style="background:${look.card};border:1px solid ${look.line};border-radius:24px;overflow:hidden;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td style="height:8px;line-height:8px;font-size:0;background:${look.accent};background-image:linear-gradient(90deg,${look.accent},${look.accent2});">&nbsp;</td></tr>
          <tr><td style="padding:34px 30px 8px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;color:${look.ink};text-align:center;">${esc(headline)}</td></tr>
          <tr><td style="padding:10px 34px 4px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.65;color:${look.ink};text-align:center;">${esc(line)}</td></tr>
          <tr><td align="center" style="padding:26px 30px 8px;">
            <a href="${esc(url)}" style="display:inline-block;background:${look.accent};background-image:linear-gradient(90deg,${look.accent},${look.accent2});color:${look.onAccent};font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:bold;text-decoration:none;padding:14px 34px;border-radius:999px;">${esc(c.button)}</a>
          </td></tr>
          ${pin ? `<tr><td align="center" style="padding:20px 30px 0;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="background:${look.dark ? "rgba(255,255,255,.08)" : "rgba(0,0,0,.04)"};border:1px dashed ${look.accent};border-radius:16px;"><tr><td align="center" style="padding:12px 26px;font-family:Arial,Helvetica,sans-serif;">
              <div style="font-size:12px;letter-spacing:.1em;color:${look.muted};">THIS PAGE IS PRIVATE. YOUR PIN:</div>
              <div style="font-family:'Courier New',monospace;font-size:30px;font-weight:bold;letter-spacing:.3em;color:${look.ink};padding:4px 0 2px;">${esc(pin)}</div>
              <div style="font-size:12px;color:${look.muted};">Please keep it to yourself.</div>
            </td></tr></table>
          </td></tr>` : pinHidden ? `<tr><td align="center" style="padding:18px 34px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:${look.muted};">This page is private. ${esc(sender)} will give you the PIN to open it.</td></tr>` : ""}
          <tr><td style="padding:22px 34px 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${look.muted};text-align:center;">If the button doesn't work, copy this link into your browser:<br><a href="${esc(url)}" style="color:${look.accent};word-break:break-all;">${esc(url)}</a></td></tr>
          ${until ? `<tr><td style="padding:6px 34px 26px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:${look.muted};text-align:center;">${esc(until)}</td></tr>` : `<tr><td style="height:22px;font-size:0;line-height:0;">&nbsp;</td></tr>`}
        </table>
      </td></tr>
      <tr><td style="padding:20px 18px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.65;color:${look.muted};text-align:center;">${esc(why)}<br><br>Memories by Target Trek &middot; <a href="https://www.targettrek.in/memories" style="color:${look.muted};">www.targettrek.in/memories</a></td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  return { subject, text, html, look: look.name };
};

/** Send (or resend) the page's email. Records the result on the page. Never throws: the page exists either way. */
export const sendPageMail = async ({ page, senderName, theme, pin, pinHidden = false, to }) => {
  const address = String(to || page.shareEmail || "").toLowerCase();
  if (await MemoryMailBlock.exists({ email: address })) {
    await MemoryPage.updateOne({ _id: page._id }, { $set: { emailStatus: "blocked" } });
    return { status: "blocked" };
  }
  const mail = buildPageMail({ theme, style: page.style, senderName, recipientName: page.recipientName, url: shareUrl(page.slug), pin, pinHidden, expiresAt: page.expiresAt });
  try {
    await sendMail(address, mail.subject, mail.text, mail.html, {
      sync: true,
      replyTo: SUPPORT,
      headers: { "List-Unsubscribe": `<mailto:${SUPPORT}?subject=Unsubscribe>`, "X-Entity-Ref-ID": `memory-${page._id}` },
    });
    await MemoryPage.updateOne({ _id: page._id }, { $set: { emailStatus: "sent", emailSentAt: new Date() }, $inc: { emailSends: 1 } });
    return { status: "sent" };
  } catch (e) {
    console.error(`[memory] page email to ${address} failed:`, e?.message || e);
    await MemoryPage.updateOne({ _id: page._id }, { $set: { emailStatus: "failed" }, $inc: { emailSends: 1 } });
    return { status: "failed" };
  }
};

export const canResend = (page) => {
  if (!page.shareEmail) throw new MemoryError(400, "This page wasn't set up to be emailed.", "NO_EMAIL");
  if ((page.emailSends || 0) >= MAX_EMAIL_SENDS) throw new MemoryError(429, `The email has already been sent ${MAX_EMAIL_SENDS} times.`, "EMAIL_SEND_LIMIT");
  if (page.emailSentAt && Date.now() - new Date(page.emailSentAt).getTime() < RESEND_GAP_MS) throw new MemoryError(429, "Please wait a couple of minutes before sending it again.", "EMAIL_TOO_SOON");
};

export { decryptPin, MAX_EMAIL_SENDS };
