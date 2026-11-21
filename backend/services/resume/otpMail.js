import { FRONTEND_URL } from "../../config/urls.js";
/*
  RESUME LAB: the verification-code email sent from the Resume Lab sign-up screen.
  Same look as the Resume Lab site (orange, the "RL" mark) so a person who signs up there gets a Resume Lab email.
  Deliverability matches the other OTP emails: table layout, inline styles, a real text version, the code also in the subject, no images or tracking links.
*/
const BRAND = "Resume Lab";
const SITE = `${FRONTEND_URL}/resume-review`;
const support = () => process.env.SUPPORT_EMAIL || "supporttargettrek@gmail.com";

const C = { bg: "#fff7ed", card: "#ffffff", ink: "#1c1410", muted: "#6b5a4e", line: "#f0e4d8", codeBg: "#fff7ed", accent: "#ea580c", warnBg: "#fbf4e4", warnLine: "#ecd9a6", warnInk: "#7a5a00" };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const firstName = (name) => String(name || "").trim().split(/\s+/)[0] || "there";

const COPY = {
  signup: {
    subject: (otp) => `${otp} is your Resume Lab verification code`,
    preheader: (m) => `Use this code to finish creating your Resume Lab account. It expires in ${plural(m, "minute")}.`,
    eyebrow: "Welcome to Resume Lab",
    heading: (n) => `Hi ${n}, let's confirm your email`,
    lead: "You're one step from a resume that gets more interview calls. Enter this code on the sign-up screen to finish, then pick your plan and upload your resume.",
    steps: ["Go back to the Resume Lab sign-up screen.", "Type the 6-digit code from this email.", "Tap Verify, then choose your plan and pay securely."],
    notYou: "If you didn't try to sign up for Resume Lab, you can ignore this email. No account is created until the code is used.",
    reason: "You're getting this because someone used this email address to sign up for Resume Lab by Target Trek.",
  },
  login: {
    subject: (otp) => `${otp} is your Resume Lab login code`,
    preheader: (m) => `Use this code to finish logging in to Resume Lab. It expires in ${plural(m, "minute")}.`,
    eyebrow: "Log in to Resume Lab",
    heading: (n) => `Hi ${n}, here is your login code`,
    lead: "We noticed a login from a new device. Enter this code on the login screen to continue to your resume reviews.",
    steps: ["Go back to the Resume Lab login screen.", "Type the 6-digit code from this email.", "Tap Verify to open your reviews."],
    notYou: "If this wasn't you, don't share the code and change your password right away.",
    reason: "You're getting this because someone tried to log in to Resume Lab by Target Trek with this email address.",
  },
  reset: {
    subject: (otp) => `${otp} is your Resume Lab password reset code`,
    preheader: (m) => `Use this code to choose a new password. It expires in ${plural(m, "minute")}.`,
    eyebrow: "Password reset",
    heading: (n) => `Hi ${n}, reset your password`,
    lead: "We got a request to reset the password of your account. Enter this code on the reset screen to choose a new one.",
    steps: ["Go back to the reset screen.", "Type the 6-digit code from this email.", "Choose a new password."],
    notYou: "If you didn't ask for this, you can ignore this email. Your password stays the same.",
    reason: "You're getting this because a password reset was requested for this email address on Resume Lab by Target Trek.",
  },
};

export const resumeOtpEmail = ({ purpose = "signup", name, otp, minutes = 10 }) => {
  const c = COPY[purpose];
  if (!c) throw new Error(`Unknown Resume Lab OTP email purpose: ${purpose}`);
  const who = firstName(name);
  const subject = c.subject(otp);
  const digits = String(otp).split("").map((d) => `<td style="padding:0 2px;"><div style="width:44px;height:64px;line-height:64px;text-align:center;font-family:'Courier New',monospace;font-size:40px;font-weight:bold;color:${C.ink};background:${C.card};border:1px solid ${C.line};border-radius:8px;">${esc(d)}</div></td>`).join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg};">${esc(c.preheader(minutes))}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg};"><tr><td align="center" style="padding:14px 8px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;">
    <tr><td align="center" style="padding:0 0 16px;font-family:Arial,Helvetica,sans-serif;">
      <span style="display:inline-block;background:${C.accent};color:#ffffff;font-size:13px;font-weight:bold;letter-spacing:.04em;line-height:36px;width:36px;height:36px;border-radius:8px;text-align:center;vertical-align:middle;">RL</span>
      <span style="font-size:22px;font-weight:bold;color:${C.ink};vertical-align:middle;padding-left:8px;">${BRAND}</span>
    </td></tr>
    <tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:16px;padding:24px 20px;font-family:Arial,Helvetica,sans-serif;color:${C.ink};">
      <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:bold;color:${C.accent};text-align:center;">${esc(c.eyebrow)}</div>
      <h1 style="margin:10px 0 0;font-size:24px;line-height:30px;text-align:center;color:${C.ink};">${esc(c.heading(who))}</h1>
      <p style="margin:12px 0 0;font-size:15px;line-height:23px;color:${C.muted};text-align:center;">${esc(c.lead)}</p>
      <table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:22px auto 0;background:${C.codeBg};border-radius:12px;"><tr><td style="padding:14px 12px 6px;text-align:center;font-size:12px;letter-spacing:.1em;color:${C.muted};font-weight:bold;">YOUR CODE</td></tr>
        <tr><td style="padding:0 12px 16px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tr>${digits}</tr></table></td></tr></table>
      <p style="margin:14px 0 0;font-size:14px;line-height:21px;color:${C.muted};text-align:center;">This code expires in <strong>${esc(plural(minutes, "minute"))}</strong> and works only once.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 0;"><tr><td style="background:${C.warnBg};border:1px solid ${C.warnLine};border-radius:10px;padding:12px 14px;font-size:13px;line-height:20px;color:${C.warnInk};">
        <strong>Keep it private.</strong> Never share this code with anyone. The ${BRAND} team will never ask you for it.</td></tr></table>
      <p style="margin:18px 0 0;font-size:13px;line-height:20px;color:${C.muted};">${esc(c.notYou)}</p>
      <p style="margin:12px 0 0;font-size:13px;line-height:20px;color:${C.muted};">Need any help? Write us at <a href="mailto:${esc(support())}" style="color:${C.accent};">${esc(support())}</a>.</p>
    </td></tr>
    <tr><td align="center" style="padding:16px 10px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:${C.muted};">
      ${esc(c.reason)}<br>Questions? Reply to this email or write to <a href="mailto:${esc(support())}" style="color:${C.accent};">${esc(support())}</a>.<br>
      <a href="${esc(SITE)}" style="color:${C.muted};">Resume Lab by Target Trek</a>
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
    c.notYou, "",
    `Need any help? Write us at ${support()}.`, "",
    "--", c.reason, `Questions? Reply to this email or write to ${support()}.`, `Resume Lab by Target Trek: ${SITE}`,
  ].join("\n");

  return { subject, text, html };
};
