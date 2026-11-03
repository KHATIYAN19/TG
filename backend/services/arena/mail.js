import sendMail from "../../utils/MailSender.js";

const SITE = process.env.FRONTEND_URL || "https://www.targettrek.in";
const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const layout = (title, bodyHtml, cta) => `
<div style="font-family:Arial,Helvetica,sans-serif;background:#f4f5f7;padding:24px">
  <div style="max-width:520px;margin:auto;background:#fff;border-radius:14px;padding:28px;border:1px solid #e5e7eb">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:.12em;color:#6366f1;font-weight:700">PREP BUDDY ARENA</p>
    <h2 style="margin:0 0 16px;color:#111827">${escapeHtml(title)}</h2>
    <div style="color:#374151;font-size:15px;line-height:1.6">${bodyHtml}</div>
    ${cta ? `<p style="margin:24px 0 0"><a href="${cta.url}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600;display:inline-block">${escapeHtml(cta.label)}</a></p>` : ""}
    <p style="margin:28px 0 0;font-size:12px;color:#9ca3af">Target Trek · You received this because you use Prep Buddy Arena.</p>
  </div>
</div>`;

/*
  EMAIL POLICY (Prep Buddy Arena) — exactly three emails, nothing else:
    1. the signup verification code
    2. the forgot-password code (only when the member asks for it)
    3. "You're matched", when a request is accepted
  No receipts, request alerts, cancellation or "match ended" emails.
*/

/* Mail must never break a request – log and move on. */
const safeSend = async (to, subject, text, html) => {
  try {
    await sendMail(to, subject, text, html);
  } catch (error) {
    console.error("[arena:mail]", subject, error.message);
  }
};

export const sendSignupOtp = (to, name, otp, minutes) =>
  safeSend(
    to,
    "Verify your email – Prep Buddy Arena",
    `Your verification code is ${otp}. It expires in ${minutes} minutes.`,
    layout(
      "Verify your email",
      `<p>Hi ${escapeHtml(name)}, use this code to finish creating your account:</p>
       <p style="font-size:34px;letter-spacing:8px;font-weight:700;color:#111827;margin:12px 0">${otp}</p>
       <p>It expires in ${minutes} minutes. If this wasn't you, ignore this email.</p>`
    )
  );


export const sendPasswordResetOtp = (to, name, otp, minutes) =>
  safeSend(
    to,
    "Reset your password – Prep Buddy Arena",
    `Your password reset code is ${otp}. It expires in ${minutes} minutes.`,
    layout(
      "Reset your password",
      `<p>Hi ${escapeHtml(name)}, use this code to choose a new password:</p>
       <p style="font-size:34px;letter-spacing:8px;font-weight:700;color:#111827;margin:12px 0">${otp}</p>
       <p>It expires in ${minutes} minutes. If you didn't ask for this, ignore this email and your password stays the same.</p>`
    )
  );

export const sendMatchedMail = (to) =>
  safeSend(
    to,
    "You're matched – say hello to your prep buddy",
    "You have a new prep buddy. Open your match to start chatting.",
    layout(
      "You're matched 🎉",
      "<p>Your buddy request was accepted. You can now chat, and see whatever details your buddy chose to share.</p>",
      { label: "Open my buddy", url: `${SITE}/prep-buddy/app/buddy` }
    )
  );
