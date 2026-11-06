import sendMail, { deliverMail } from "../../utils/MailSender.js";
import { unsubscribeUrl } from "../campaign/render.js";
import { otpEmail, matchedEmail, unmatchedEmail, reminderEmail, supportEmail } from "../mail/templates.js";

/*
  EMAIL POLICY (Prep Buddy Arena): four emails, nothing else
    1. the sign-up verification code
    2. the forgot-password code (only when the member asks for it)
    3. "You're matched", when a request is accepted
    4. "Your partnership has ended", when a partnership ends
  No receipts, request alerts or cancellation emails.
  Plus ONE admin-triggered email: a payment reminder to sign-ups who never paid (sendPaymentReminder).

  The designs live in services/mail/templates.js. Every email carries
  Reply-To: <support address>, so a reply goes to a real inbox.
*/

/* Mail must never break a request: log and move on. */
const safeSend = async (to, mail, { direct = false } = {}) => {
  try {
    // OTP emails (direct) are sent live, never through the queue.
    const send = direct ? deliverMail : sendMail;
    await send(to, mail.subject, mail.text, mail.html, { replyTo: supportEmail() });
  } catch (error) {
    console.error("[arena:mail]", mail.subject, error.message);
  }
};

export const sendSignupOtp = (to, name, otp, minutes) =>
  safeSend(to, otpEmail({ purpose: "signup", name, otp, minutes }), { direct: true });

export const sendPasswordResetOtp = (to, name, otp, minutes) =>
  safeSend(to, otpEmail({ purpose: "reset", name, otp, minutes }), { direct: true });

/* data: { name, buddyAlias, buddyTopics, buddyLevel, matchesLeft } */
export const sendMatchedMail = (to, data = {}) => safeSend(to, matchedEmail(data));

/* data: { name, buddyAlias, variant, matchesLeft, backInArena, notCounted } */
export const sendUnmatchedMail = (to, data = {}) => safeSend(to, unmatchedEmail(data));

/*
  Admin-triggered payment reminder. Unlike the others this one THROWS on failure, so the
  admin sees whether it really went out. data: { name, pricePaise, matches, offerText }
*/
export const sendPaymentReminder = async (to, data = {}) => {
  const unsubscribe = unsubscribeUrl(to);
  const mail = reminderEmail({ ...data, unsubscribeUrl: unsubscribe });
  await deliverMail(to, mail.subject, mail.text, mail.html, {
    replyTo: supportEmail(),
    // Lets Gmail / Apple Mail show their own one-click "Unsubscribe" (RFC 8058): mail with
    // a working unsubscribe is far less likely to be filtered as bulk.
    headers: {
      "List-Unsubscribe": `<${unsubscribe}>, <mailto:${supportEmail()}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });
  return mail.subject;
};
