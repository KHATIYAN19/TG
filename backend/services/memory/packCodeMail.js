import { FRONTEND_URL } from "../../config/urls.js";

/*
  THE EMAIL THAT CARRIES A LIFETIME-PACK BUYER'S MEMORIES CODE.

  Written to land in the inbox, not Promotions or spam:
    - it is a receipt-style, one-to-one message about something they just bought (order id, their own name, their own code);
    - plain wording: no discount talk, no urgency, no exclamation marks or ALL-CAPS hooks;
    - one primary link (to our own domain), no remote images, no tracking pixels, no URL shorteners;
    - a plain-text version that says the same thing, a hidden preheader, a real reply-to address;
    - a "why you got this" line. It carries no List-Unsubscribe header on purpose: that header marks bulk mail.
  What matters just as much happens outside the code: the sending domain needs SPF, DKIM and DMARC set up with the mail provider.

  Pure (no database, no network), so it can be previewed and tested.
*/

export const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const ROSE = "#e11d48";
const ROSE_DEEP = "#9f1239";
const INK = "#2a1023";
const MUTED = "#7a5370";
const SOFT = "#fff5f8";
const LINE = "#f8d7e0";
const FONT = "Arial,Helvetica,sans-serif";
const SERIF = "Georgia,'Times New Roman',serif";

/* the templates people can make, in the words the site uses */
export const TEMPLATE_BLURBS = [
  { name: "Birthday", line: "Balloons to pop, a cake to cut, gifts to open and a letter waiting inside." },
  { name: "Proposal", line: "A question asked gently, with a page that lets them answer in their own time." },
  { name: "Sorry", line: "A few honest words and a promise or two, for when a message is not enough." },
  { name: "Anniversary", line: "Your story together: a timeline, a love jar and a counter of the days." },
  { name: "Thank you", line: "A grateful page for a parent, a teacher, a friend, a mentor." },
  { name: "Christmas", line: "A little tree with surprises under it and a wish waiting just for them." },
];

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const firstNameOf = (name) => String(name || "").trim().split(/\s+/)[0] || "there";
const dateText = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

export const packCodeUrl = (code) => `${FRONTEND_URL}/memories/app/pay?code=${encodeURIComponent(code)}`;

export const buildPackCodeMail = ({ name, email, code, orderId = "", bookTitle = "your Lifetime pack", onlineDays = 30, expiresAt = null }) => {
  const first = firstNameOf(name);
  const url = packCodeUrl(code);
  const subject = "Your Memories page code, included with your Lifetime pack";
  const preheader = `Code ${code}: make a page for someone you love. It works for any template.`;
  const until = expiresAt ? `Use it before ${dateText(expiresAt)}.` : "It does not expire.";
  const why = `You are getting this one-time email because you bought ${bookTitle}${orderId ? ` (order ${orderId})` : ""} on Target Trek, and the Lifetime pack includes one Memories page. Questions, or the code does not work? Just reply to this email or write to ${SUPPORT_EMAIL}.`;

  const steps = [
    ["Sign up or log in", `Open Memories with ${email ? email : "the email you bought with"}. The page is added to your account by itself; if it is not, paste the code on the Redeem tab.`],
    ["Pick a template and make it yours", "Add photos, a short video or a voice note, and write your message. You can preview it as you go."],
    ["Share it with your person", `Send the link yourself, or let us email it to them. You can lock it with a PIN. The page stays online for ${onlineDays} days, and you can see when it was opened and what they replied.`],
  ];

  const text = [
    `Hi ${first},`,
    "",
    `Thank you for getting ${bookTitle}. It includes one Memories page that you can make for someone you love. Your code:`,
    "",
    `    ${code}`,
    "",
    `Works for any template and look. One use. ${until}`,
    "",
    `Create your page: ${url}`,
    "",
    "WHAT IS MEMORIES",
    "Memories turns your photos, a message and a voice note into a small private page that opens like a surprise. You send a link. They need no app and no account to open it.",
    "",
    "THE TEMPLATES",
    ...TEMPLATE_BLURBS.map((t) => `- ${t.name}: ${t.line}`),
    "",
    "HOW IT WORKS",
    ...steps.map(([t, d], i) => `${i + 1}. ${t}: ${d}`),
    "",
    "--",
    why,
    `Memories by Target Trek · ${FRONTEND_URL}/memories`,
  ].join("\n");

  const T = (inner, style = "") => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="${style}">${inner}</table>`;

  const templateRows = TEMPLATE_BLURBS.map((t, i) => `<tr>
<td valign="top" width="26" style="padding:${i ? 10 : 0}px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${ROSE};font-weight:bold;">&bull;</td>
<td valign="top" style="padding:${i ? 10 : 0}px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${INK};"><b>${esc(t.name)}</b><br><span style="color:${MUTED};">${esc(t.line)}</span></td></tr>`).join("");

  const stepRows = steps.map(([t, d], i) => `<tr>
<td valign="top" width="40" style="padding:${i ? 14 : 0}px 0 0;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" width="28" height="28" style="width:28px;height:28px;background:${ROSE};border-radius:14px;color:#ffffff;font-family:${FONT};font-size:14px;line-height:28px;font-weight:bold;">${i + 1}</td></tr></table></td>
<td valign="top" style="padding:${i ? 14 : 0}px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${INK};"><b>${esc(t)}</b><br><span style="color:${MUTED};">${esc(d)}</span></td></tr>`).join("");

  const heading = (t) => `<div style="font-family:${SERIF};font-size:19px;line-height:26px;color:${INK};padding:0 0 10px;">${esc(t)}</div>`;
  const gap = (n = 22) => `<div style="height:${n}px;line-height:${n}px;font-size:0;">&nbsp;</div>`;

  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${SOFT};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${SOFT};">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${SOFT};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">
  <tr><td align="center" style="padding:0 0 14px;font-family:${SERIF};font-size:15px;letter-spacing:.08em;color:${MUTED};">MEMORIES <span style="color:${ROSE};">&hearts;</span> <span style="font-family:${FONT};font-size:12px;letter-spacing:0;">by Target Trek</span></td></tr>
  <tr><td style="background:#ffffff;border:1px solid ${LINE};border-radius:20px;">
    ${T(`<tr><td style="height:6px;line-height:6px;font-size:0;background:${ROSE};background-image:linear-gradient(90deg,#fb7185,${ROSE});border-radius:20px 20px 0 0;">&nbsp;</td></tr>
    <tr><td style="padding:28px 28px 8px;font-family:${SERIF};font-size:26px;line-height:33px;color:${INK};">Hi ${esc(first)}, your Memories page is ready to create</td></tr>
    <tr><td style="padding:4px 28px 0;font-family:${FONT};font-size:15px;line-height:24px;color:${INK};">Thank you for getting <b>${esc(bookTitle)}</b>. The Lifetime pack includes one Memories page, made for someone you love. Here is your code.</td></tr>
    <tr><td align="center" style="padding:22px 28px 4px;">
      ${T(`<tr><td align="center" style="padding:16px 12px;background:${SOFT};border:1px dashed ${ROSE};border-radius:14px;">
        <div style="font-family:${FONT};font-size:11px;letter-spacing:.12em;color:${MUTED};">YOUR CODE</div>
        <div style="font-family:'Courier New',Courier,monospace;font-size:28px;line-height:36px;font-weight:bold;letter-spacing:.14em;color:${ROSE_DEEP};padding:4px 0 2px;">${esc(code)}</div>
        <div style="font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">Works for any template and look &middot; one use &middot; ${esc(until)}</div>
      </td></tr>`)}
    </td></tr>
    <tr><td align="center" style="padding:20px 28px 6px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" bgcolor="${ROSE}" style="background:${ROSE};border-radius:999px;"><a href="${esc(url)}" style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:16px;line-height:20px;font-weight:bold;color:#ffffff;text-decoration:none;">Create a page for someone you love</a></td></tr></table>
    </td></tr>
    <tr><td align="center" style="padding:8px 28px 4px;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};">If the button does not work, copy this link into your browser:<br><a href="${esc(url)}" style="color:${ROSE_DEEP};word-break:break-all;">${esc(url)}</a></td></tr>
    <tr><td style="padding:22px 28px 0;">${heading("What is Memories?")}
      <div style="font-family:${FONT};font-size:14px;line-height:22px;color:${INK};">Memories turns your photos, a message and a voice note into a small private page that opens like a surprise. You send a link, and the person opens it on any phone. They need no app and no account. When they answer or reply, you see it.</div>
    </td></tr>
    <tr><td style="padding:22px 28px 0;">${heading("The templates")}${T(templateRows)}</td></tr>
    <tr><td style="padding:22px 28px 0;">${heading("How it works")}${T(stepRows)}</td></tr>
    <tr><td style="padding:24px 28px 26px;font-family:${FONT};font-size:13px;line-height:20px;color:${MUTED};">Any question, just reply to this email.<br>Team Target Trek</td></tr>`)}
  </td></tr>
  <tr><td style="padding:16px 18px 0;font-family:${FONT};font-size:12px;line-height:18px;color:${MUTED};text-align:center;">${esc(why)}<br><br>Memories by Target Trek &middot; <a href="${esc(FRONTEND_URL)}/memories" style="color:${MUTED};">${esc(FRONTEND_URL.replace(/^https?:\/\//, ""))}/memories</a></td></tr>
</table>
</td></tr></table>
</body></html>`;

  return { subject, text, html, url };
};
