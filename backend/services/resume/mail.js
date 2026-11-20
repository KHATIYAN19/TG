import { FRONTEND_URL } from "../../config/urls.js";
import ResumeRequest from "../../models/resume/ResumeRequest.js";
import User from "../../models/User.js";
import sendMail from "../../utils/MailSender.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const SUPPORT = "supporttargettrek@gmail.com";

const C = { bg: "#fff7ed", card: "#ffffff", ink: "#1c1410", muted: "#6b5a4e", line: "#f0e4d8", accent: "#ea580c", soft: "#fff1e3", ok: "#15803d", warn: "#b45309", bad: "#b91c1c" };
const tone = (n) => (n >= 75 ? C.ok : n >= 50 ? C.warn : C.bad);
const num = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v)) : null);

const scoreCell = (label, value) => value === null ? "" : `<td align="center" style="padding:6px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.soft};border-radius:14px"><tr><td align="center" style="padding:16px 8px"><div style="font-size:32px;line-height:36px;font-weight:700;color:${tone(value)}">${value}<span style="font-size:14px;color:${C.muted};font-weight:400">/100</span></div><div style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:${C.muted};margin-top:4px">${esc(label)}</div></td></tr></table></td>`;

/* "Your review is ready": sent once, a branded table-layout email with the scores and the first fixes. Never throws. */
export const sendReviewReady = async (id) => {
  try {
    const claimed = await ResumeRequest.findOneAndUpdate({ _id: id, notifiedAt: null }, { $set: { notifiedAt: new Date() } }, { new: true }).lean();
    if (!claimed) return;
    const user = await User.findById(claimed.user).select("name email").lean();
    if (!user?.email) return;
    const firstRaw = String(user.name || "there").trim().split(/\s+/)[0] || "there";
    const first = esc(firstRaw);
    const link = `${FRONTEND_URL}/resume-review/app/requests/${claimed._id}`;
    const planName = claimed.packageSnapshot?.name || "Resume review";
    const role = claimed.profile?.targetRole || "";
    const ai = claimed.ai?.status === "done" ? claimed.ai.result || null : null;
    const human = claimed.humanRequested && claimed.status === "completed" ? claimed.human || null : null;
    const overall = num(ai?.overallScore), ats = num(ai?.atsScore), reviewer = num(human?.score);
    const fixes = (ai?.improvements || []).slice(0, 3).map((x) => x?.issue).filter(Boolean);
    const humanFixes = (human?.improvements || []).slice(0, 3).filter(Boolean);
    const top = fixes.length ? fixes : humanFixes;
    const headline = ai?.headline ? esc(ai.headline) : "Your scores, what to fix first and your rewritten bullets are waiting.";
    const preheader = `${planName}${role ? ` for ${role}` : ""} is ready${overall !== null ? `. Overall score ${overall}/100` : ""}.`;

    const scores = [scoreCell("Overall", overall), scoreCell("ATS ready", ats), scoreCell("Reviewer", reviewer)].join("");
    const fixRows = top.map((t, n) => `<tr><td width="30" valign="top" style="padding:8px 0"><div style="width:24px;height:24px;line-height:24px;border-radius:12px;background:${C.accent};color:#fff;font-size:12px;font-weight:700;text-align:center">${n + 1}</div></td><td style="padding:8px 0;font-size:15px;line-height:22px;color:${C.ink}">${esc(t)}</td></tr>`).join("");

    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Your resume review is ready</title></head>
<body style="margin:0;padding:0;background:${C.bg}"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.bg}">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.bg}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;font-family:Arial,Helvetica,sans-serif;color:${C.ink}">
<tr><td style="padding:0 4px 16px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${C.accent};color:#fff;font-weight:700;font-size:14px;width:32px;height:32px;border-radius:9px;text-align:center">RL</td><td style="padding-left:10px;font-size:16px;font-weight:700">Resume Lab</td></tr></table></td></tr>
<tr><td style="background:${C.card};border:1px solid ${C.line};border-radius:20px;padding:36px 32px">
<div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${C.accent};font-weight:700">Review ready</div>
<h1 style="margin:10px 0 0;font-size:26px;line-height:32px;font-weight:700;color:${C.ink}">${first}, your resume review is ready</h1>
<p style="margin:14px 0 0;font-size:15px;line-height:24px;color:${C.muted}"><b style="color:${C.ink}">${esc(planName)}</b>${role ? ` for <b style="color:${C.ink}">${esc(role)}</b>` : ""}. ${headline}</p>
${scores ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:22px"><tr>${scores}</tr></table>` : ""}
${fixRows ? `<div style="margin-top:26px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:${C.muted};font-weight:700">Fix these first</div><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:6px">${fixRows}</table>` : ""}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px"><tr><td style="background:${C.accent};border-radius:12px"><a href="${link}" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none">Open my full review</a></td></tr></table>
<p style="margin:14px 0 0;font-size:13px;line-height:20px;color:${C.muted}">Button not working? Paste this link in your browser:<br><a href="${link}" style="color:${C.accent};word-break:break-all">${link}</a></p>
</td></tr>
<tr><td style="padding:20px 8px 0;font-size:12px;line-height:19px;color:${C.muted};text-align:center">You are getting this because you bought a review on Resume Lab by Target Trek.<br>Questions? Reply to this email or write to <a href="mailto:${SUPPORT}" style="color:${C.muted}">${SUPPORT}</a>.</td></tr>
</table></td></tr></table></body></html>`;
    const text = `Hi ${firstRaw},\n\nYour ${planName}${role ? ` for ${role}` : ""} is ready.\n${overall !== null ? `Overall score: ${overall}/100\n` : ""}${ats !== null ? `ATS readiness: ${ats}/100\n` : ""}${reviewer !== null ? `Reviewer score: ${reviewer}/100\n` : ""}${top.length ? `\nFix these first:\n${top.map((t, n) => `${n + 1}. ${t}`).join("\n")}\n` : ""}\nOpen your full review:\n${link}\n\nQuestions? Just reply to this email.\n\nResume Lab by Target Trek`;
    await sendMail(user.email, "Your resume review is ready", text, html, { sync: true, replyTo: SUPPORT, headers: { "X-Entity-Ref-ID": `resume-${claimed._id}` } });
  } catch (e) {
    console.error("[resume] review-ready email failed:", e?.message || e);
    await ResumeRequest.updateOne({ _id: id }, { $set: { notifiedAt: null } }).catch(() => {});
  }
};
