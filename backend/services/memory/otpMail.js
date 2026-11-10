/*
  MEMORIES: the verification-code email (sign-up, and forgot password) sent from the Memories sign-in screens.
  It has its own look (warm peach and rose, the Memories heart) and its own wording, separate from the Prep Buddy Arena
  email, so a person who signs up for Memories gets a Memories email.

  Deliverability: a plain, table-based layout with inline styles, a real text version, the code also in the subject,
  Reply-To a real inbox (set by the caller), no images or tracking links.
*/
const BRAND = "Memories";
const SITE = process.env.MEMORIES_SITE_URL || "https://www.targettrek.in/memories";
const support = () => process.env.SUPPORT_EMAIL || "supporttargettrek@gmail.com";

const C = { bg: "#fff7f3", card: "#ffffff", ink: "#3a1530", muted: "#7a5370", line: "#f6dfe3", accent: "#e8365d", accent2: "#ff8a4c", codeBg: "#fff1ec", warnBg: "#fff8e1", warnLine: "#f5d98a", warnInk: "#7a5a00" };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const firstName = (name) => String(name || "").trim().split(/\s+/)[0] || "there";

const COPY = {
  signup: {
    subject: (otp) => `${otp} is your Memories verification code`,
    preheader: (m) => `Use this code to finish creating your Memories account. It expires in ${plural(m, "minute")}.`,
    eyebrow: "Welcome to Memories",
    heading: (n) => `Hi ${n}, let's confirm your email`,
    lead: "You're one step away from making a page for someone special: birthday, thank you, anniversary, sorry or proposal. Enter this code on the sign-up screen to finish.",
    steps: ["Go back to the Memories sign-up screen.", "Type the 6-digit code from this email.", "Tap Verify, and start your first page."],
    notYou: "If you didn't try to sign up for Memories, you can ignore this email. No account is created until the code is used.",
    reason: "You're getting this because someone used this email address to sign up for Memories by Target Trek.",
  },
  reset: {
    subject: (otp) => `${otp} is your Memories password reset code`,
    preheader: (m) => `Use this code to choose a new Memories password. It expires in ${plural(m, "minute")}.`,
    eyebrow: "Password reset",
    heading: (n) => `Hi ${n}, reset your password`,
    lead: "We got a request to reset the password of your Memories account. Enter this code on the reset screen to choose a new one.",
    steps: ["Go back to the Memories reset screen.", "Type the 6-digit code from this email.", "Choose a new password."],
    notYou: "If you didn't ask for this, you can ignore this email. Your password stays the same.",
    reason: "You're getting this because a password reset was requested for this email address on Memories by Target Trek.",
  },
};

export const memoriesOtpEmail = ({ purpose = "signup", name, otp, minutes = 10 }) => {
  const c = COPY[purpose];
  if (!c) throw new Error(`Unknown Memories OTP email purpose: ${purpose}`);
  const who = firstName(name);
  const subject = c.subject(otp);
  const digits = String(otp).split("").map((d) => `<td style="padding:0 3px;"><div style="width:42px;height:54px;line-height:54px;text-align:center;font-family:'Courier New',monospace;font-size:30px;font-weight:bold;color:${C.ink};background:${C.card};border:1px solid ${C.line};border-radius:12px;">${esc(d)}</div></td>`).join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg};">${esc(c.preheader(minutes))}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};"><tr><td align="center" style="padding:28px 14px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
    <tr><td align="center" style="padding:0 0 16px;font-family:Arial,Helvetica,sans-serif;">
      <span style="display:inline-block;background:${C.accent};background-image:linear-gradient(135deg,${C.accent},${C.accent2});color:#ffffff;font-size:20px;line-height:36px;width:36px;height:36px;border-radius:12px;text-align:center;vertical-align:middle;">&#9829;</span>
      <span style="font-size:22px;font-weight:bold;color:${C.ink};vertical-align:middle;padding-left:8px;">${BRAND}</span>
    </td></tr>
    <tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:22px;padding:30px 26px;font-family:Arial,Helvetica,sans-serif;color:${C.ink};">
      <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:bold;color:${C.accent};text-align:center;">${esc(c.eyebrow)}</div>
      <h1 style="margin:10px 0 0;font-size:24px;line-height:30px;text-align:center;color:${C.ink};">${esc(c.heading(who))}</h1>
      <p style="margin:12px 0 0;font-size:15px;line-height:23px;color:${C.muted};text-align:center;">${esc(c.lead)}</p>
      <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:22px auto 0;background:${C.codeBg};border-radius:16px;"><tr><td style="padding:14px 12px 6px;text-align:center;font-size:12px;letter-spacing:.1em;color:${C.muted};font-weight:bold;" colspan="1">YOUR CODE</td></tr>
        <tr><td style="padding:0 12px 16px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${digits}</tr></table></td></tr></table>
      <p style="margin:14px 0 0;font-size:14px;line-height:21px;color:${C.muted};text-align:center;">This code expires in <strong>${esc(plural(minutes, "minute"))}</strong> and works only once.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0;"><tr><td style="background:${C.warnBg};border:1px solid ${C.warnLine};border-radius:12px;padding:12px 14px;font-size:13px;line-height:20px;color:${C.warnInk};">
        <strong>Keep it private.</strong> Never share this code with anyone. The ${BRAND} team will never ask you for it.</td></tr></table>
      <h2 style="margin:22px 0 6px;font-size:15px;color:${C.ink};">What to do next</h2>
      <ol style="margin:0;padding-left:20px;font-size:14px;line-height:22px;color:${C.muted};">${c.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      <p style="margin:18px 0 0;font-size:13px;line-height:20px;color:${C.muted};">${esc(c.notYou)}</p>
    </td></tr>
    <tr><td align="center" style="padding:16px 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${C.muted};">
      ${esc(c.reason)}<br>Questions? Reply to this email or write to <a href="mailto:${esc(support())}" style="color:${C.accent};">${esc(support())}</a>.<br>
      <a href="${esc(SITE)}" style="color:${C.muted};">Memories by Target Trek</a>
    </td></tr>
  </table>
</td></tr></table>
</body></html>`;

  const text = [
    `${BRAND.toUpperCase()} | ${c.eyebrow.toUpperCase()}`, "",
    c.heading(who), "",
    c.lead, "",
    `YOUR CODE: ${otp}`,
    `It expires in ${plural(minutes, "minute")} and works only once.`, "",
    `Keep it private. Never share this code with anyone. The ${BRAND} team will never ask you for it.`, "",
    "What to do next:", ...c.steps.map((s, i) => `${i + 1}. ${s}`), "",
    c.notYou, "",
    "--", c.reason, `Questions? Reply to this email or write to ${support()}.`, `Memories by Target Trek: ${SITE}`,
  ].join("\n");

  return { subject, text, html };
};
