import sendMail from "../../utils/MailSender.js";
import { otpEmail, matchedEmail, unmatchedEmail, supportEmail } from "../mail/templates.js";

/*
  EMAIL POLICY (Prep Buddy Arena): four emails, nothing else
    1. the sign-up verification code
    2. the forgot-password code (only when the member asks for it)
    3. "You're matched", when a request is accepted
    4. "Your partnership has ended", when a partnership ends
  No receipts, request alerts or cancellation emails.

  The designs live in services/mail/templates.js. Every email carries
  Reply-To: <support address>, so a reply goes to a real inbox.
*/

/* Mail must never break a request: log and move on. */
const safeSend = async (to, mail) => {
  try {
    await sendMail(to, mail.subject, mail.text, mail.html, { replyTo: supportEmail() });
  } catch (error) {
    console.error("[arena:mail]", mail.subject, error.message);
  }
};

export const sendSignupOtp = (to, name, otp, minutes) =>
  safeSend(to, otpEmail({ purpose: "signup", name, otp, minutes }));

export const sendPasswordResetOtp = (to, name, otp, minutes) =>
  safeSend(to, otpEmail({ purpose: "reset", name, otp, minutes }));

/* data: { name, buddyAlias, buddyTopics, buddyLevel, matchesLeft } */
export const sendMatchedMail = (to, data = {}) => safeSend(to, matchedEmail(data));

/* data: { name, buddyAlias, variant, matchesLeft, backInArena, notCounted } */
export const sendUnmatchedMail = (to, data = {}) => safeSend(to, unmatchedEmail(data));
