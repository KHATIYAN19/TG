import { FRONTEND_URL } from "../../config/urls.js";
import ResumeRequest from "../../models/resume/ResumeRequest.js";
import User from "../../models/User.js";
import sendMail from "../../utils/MailSender.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const SUPPORT = "supporttargettrek@gmail.com";

/* "Your review is ready": sent once, plain and personal, so it lands in the inbox. Never throws. */
export const sendReviewReady = async (id) => {
  try {
    const claimed = await ResumeRequest.findOneAndUpdate({ _id: id, notifiedAt: null }, { $set: { notifiedAt: new Date() } }, { new: true }).lean();
    if (!claimed) return;
    const user = await User.findById(claimed.user).select("name email").lean();
    if (!user?.email) return;
    const first = esc(String(user.name || "there").split(" ")[0]);
    const link = `${FRONTEND_URL}/resume-review/app/requests/${claimed._id}`;
    const name = esc(claimed.packageSnapshot?.name || "Resume review");
    const text = `Hi ${String(user.name || "there").split(" ")[0]},\n\nYour ${claimed.packageSnapshot?.name || "resume review"} is ready. Open it here:\n${link}\n\nIf you have a question about it, just reply to this email.\n\nTarget Trek`;
    const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#14122b">
<h2 style="margin:0 0 12px;font-size:20px">Your review is ready, ${first}</h2>
<p style="line-height:1.6;margin:0 0 20px">Your <b>${name}</b> is done. Open it to see your score, what to fix first, and the notes from your reviewer.</p>
<p style="margin:0 0 24px"><a href="${link}" style="background:#5b3df5;color:#fff;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:bold;display:inline-block">Open my review</a></p>
<p style="color:#6b6892;font-size:13px;line-height:1.5;margin:0">You are receiving this because you bought a review on Target Trek. Questions? Just reply to this email.</p></div>`;
    await sendMail(user.email, "Your resume review is ready", text, html, { sync: true, replyTo: SUPPORT, headers: { "X-Entity-Ref-ID": `resume-${claimed._id}` } });
  } catch (e) {
    console.error("[resume] review-ready email failed:", e?.message || e);
    await ResumeRequest.updateOne({ _id: id }, { $set: { notifiedAt: null } }).catch(() => {});
  }
};
