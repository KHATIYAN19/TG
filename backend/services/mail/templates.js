/*
  TARGET TREK EMAIL TEMPLATES
  ===========================
  Pure functions: data in, { subject, text, html } out. Nothing in this file
  sends email or touches the network, so every template can be rendered and
  inspected safely (see scripts/preview-emails.mjs).

  Templates
    otpEmail        sign-up code, forgot-password code, login code
    matchedEmail    "You're matched with <buddy>"
    unmatchedEmail  "Your partnership has ended" (5 variants, see below)
    reminderEmail   "Get Prep Buddy Arena at ₹X" – sent by an admin to sign-ups who haven't paid

  Design rules (all email clients, including Gmail, Outlook and Apple Mail)
    - one 600px column of nested <table>s with inline styles only
    - orange palette; solid fallback colours behind every gradient
    - no images, no web fonts, no scripts: nothing to block or to load
    - dark text on light backgrounds with AA contrast; buttons are
      bulletproof (a table cell, so they render even without CSS support)
    - a hidden "preheader" line for the inbox preview
    - every email also has a plain-text version
    - every value that came from a user is HTML-escaped

  Support: SUPPORT_EMAIL (default supporttargettrek@gmail.com).
  Site links: FRONTEND_URL (default https://www.targettrek.in).
*/

/* ----------------------------------------------------------------------- */
/*  Brand + settings                                                        */
/* ----------------------------------------------------------------------- */

import { rupees } from "../arena/pricing.js";

export const BRAND = "Target Trek";
export const PRODUCT = "Prep Buddy Arena";

const C = {
  page: "#fff4ec",        // soft orange-tinted page
  card: "#ffffff",
  border: "#f0ded0",
  head1: "#f97316",       // header gradient, start
  head2: "#ea580c",       // header gradient end / solid fallback
  accent: "#ea580c",
  button: "#c2410c",      // darker orange: white text passes AA
  linkText: "#c2410c",
  ink: "#29201b",         // headings
  body: "#44342b",        // paragraphs
  muted: "#7a6a5f",       // small print
  tint: "#fff7ed",        // help / info panels
  tintBorder: "#fed7aa",
  codeBg: "#fff7ed",
  codeBorder: "#fdba74",
  codeInk: "#9a3412",
  warnBg: "#fffbeb",
  warnBorder: "#fde68a",
  warnInk: "#92400e",
};

const FONT = "Arial,Helvetica,sans-serif";
const MONO = "'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace";

export const supportEmail = () => process.env.SUPPORT_EMAIL || "supporttargettrek@gmail.com";
export const siteUrl = () => String(process.env.FRONTEND_URL || "https://www.targettrek.in").replace(/\/+$/, "");

const SUPPORT_SUBJECT = "Help with Prep Buddy Arena";
const supportLink = () => `mailto:${supportEmail()}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`;

/* ----------------------------------------------------------------------- */
/*  Small helpers                                                           */
/* ----------------------------------------------------------------------- */

export const esc = (value = "") =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const firstName = (name) => String(name || "").trim().split(/\s+/)[0] || "there";

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ----------------------------------------------------------------------- */
/*  HTML building blocks                                                    */
/* ----------------------------------------------------------------------- */

const p = (html, style = "") =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:16px;line-height:25px;color:${C.body};${style}">${html}</p>`;

const small = (html) =>
  `<p style="margin:0 0 12px;font-family:${FONT};font-size:13px;line-height:20px;color:${C.muted};">${html}</p>`;

const h2 = (text) =>
  `<h2 style="margin:28px 0 10px;font-family:${FONT};font-size:18px;line-height:24px;font-weight:700;color:${C.ink};">${esc(text)}</h2>`;

const link = (href, label) =>
  `<a href="${esc(href)}" style="color:${C.linkText};font-weight:700;text-decoration:underline;">${esc(label)}</a>`;

const ul = (items) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px;">${items
    .map(
      (item) => `<tr>
        <td width="22" valign="top" style="padding:0 0 8px;font-family:${FONT};font-size:16px;line-height:25px;color:${C.accent};font-weight:700;">&bull;</td>
        <td valign="top" style="padding:0 0 8px;font-family:${FONT};font-size:16px;line-height:25px;color:${C.body};">${item}</td>
      </tr>`
    )
    .join("")}</table>`;

const ol = (items) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 16px;">${items
    .map(
      (item, i) => `<tr>
        <td width="34" valign="top" style="padding:0 0 10px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" width="26" height="26" bgcolor="${C.accent}" style="background-color:${C.accent};border-radius:13px;font-family:${FONT};font-size:13px;line-height:26px;font-weight:700;color:#ffffff;">${i + 1}</td>
          </tr></table>
        </td>
        <td valign="top" style="padding:0 0 10px;font-family:${FONT};font-size:16px;line-height:25px;color:${C.body};">${item}</td>
      </tr>`
    )
    .join("")}</table>`;

/* Bulletproof button: a coloured table cell wrapping the link. */
const button = (href, label) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;">
  <tr>
    <td align="center" bgcolor="${C.button}" style="background-color:${C.button};border-radius:10px;">
      <a href="${esc(href)}" style="display:inline-block;padding:15px 30px;font-family:${FONT};font-size:16px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px;">${esc(label)}</a>
    </td>
  </tr>
</table>`;

/* The one-time code, large and easy to copy. */
const codeBox = (code) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 20px;">
  <tr>
    <td align="center" bgcolor="${C.codeBg}" style="background-color:${C.codeBg};border:2px dashed ${C.codeBorder};border-radius:14px;padding:22px 12px;">
      <div style="font-family:${FONT};font-size:12px;line-height:16px;letter-spacing:2px;font-weight:700;color:${C.warnInk};text-transform:uppercase;padding-bottom:8px;">Your code</div>
      <div style="font-family:${MONO};font-size:40px;line-height:44px;letter-spacing:10px;font-weight:700;color:${C.codeInk};">${esc(code)}</div>
    </td>
  </tr>
</table>`;

/* A tinted panel (info / warning). */
const panel = (innerHtml, { bg = C.tint, border = C.tintBorder } = {}) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 18px;">
  <tr>
    <td bgcolor="${bg}" style="background-color:${bg};border:1px solid ${border};border-radius:12px;padding:16px 18px;font-family:${FONT};font-size:15px;line-height:23px;color:${C.body};">${innerHtml}</td>
  </tr>
</table>`;

/* Label / value rows (buddy summary). */
const facts = (rows) =>
  panel(
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">${rows
      .filter(([, value]) => value)
      .map(
        ([label, value]) => `<tr>
          <td valign="top" width="38%" style="padding:4px 10px 4px 0;font-family:${FONT};font-size:13px;line-height:20px;font-weight:700;color:${C.muted};text-transform:uppercase;letter-spacing:.5px;">${esc(label)}</td>
          <td valign="top" style="padding:4px 0;font-family:${FONT};font-size:15px;line-height:22px;font-weight:700;color:${C.ink};">${value}</td>
        </tr>`
      )
      .join("")}</table>`
  );

/* "Need help?" block shown at the bottom of every email. */
const helpBlock = (tips = []) => `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:26px 0 0;">
  <tr>
    <td bgcolor="${C.tint}" style="background-color:${C.tint};border:1px solid ${C.tintBorder};border-radius:14px;padding:20px 22px;">
      <div style="font-family:${FONT};font-size:17px;line-height:24px;font-weight:700;color:${C.ink};padding-bottom:6px;">Need help?</div>
      <div style="font-family:${FONT};font-size:15px;line-height:23px;color:${C.body};">
        Reply to this email or write to ${link(supportLink(), supportEmail())}. A real person from the Target Trek team will read it.
      </div>
      ${
        tips.length
          ? `<div style="padding-top:12px;font-family:${FONT};font-size:14px;line-height:22px;color:${C.body};">${tips
              .map((tip) => `<div style="padding:0 0 6px 0;">&#8250;&nbsp; ${tip}</div>`)
              .join("")}</div>`
          : ""
      }
      <div style="padding-top:10px;font-family:${FONT};font-size:13px;line-height:20px;color:${C.muted};">
        Tip: add ${esc(supportEmail())} to your contacts so our emails never land in spam.
      </div>
    </td>
  </tr>
</table>`;

/* Page shell shared by every email. */
const SERVICE_NOTE = "This is a service email about your account, so it can't be unsubscribed from.";

/*
  Compact layout: padding only, no margins anywhere (margins are the first thing Outlook
  and some Gmail views collapse or double). Every margin becomes a small padding.
*/
const tight = (html) =>
  html
    .replace(/margin:0 0 16px;/g, "margin:0;padding:0 0 8px;")
    .replace(/margin:0 0 14px;/g, "margin:0;padding:0 0 6px;")
    .replace(/margin:0 0 12px;/g, "margin:0;padding:0 0 6px;")
    .replace(/margin:28px 0 10px;/g, "margin:0;padding:10px 0 4px;")
    .replace(/margin:(?!0;)[^;"]*;/g, "");

const shell = ({ title, preheader, eyebrow, heading, lead, bodyHtml, reason, note = SERVICE_NOTE, extraFooter = "", compact = false }) => {
  const site = siteUrl();
  const year = new Date().getFullYear();
  const pad = compact
    ? { outer: "8px 6px 12px", head: "16px 20px 14px", card: "18px 20px 2px", foot: "2px 20px 16px", h1: "24px", h1lh: "30px" }
    : { outer: "28px 12px 36px", head: "30px 32px 28px", card: "34px 32px 8px", foot: "8px 32px 30px", h1: "28px", h1lh: "34px" };

  const out = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${C.page};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;max-width:0;overflow:hidden;opacity:0;mso-hide:all;font-size:1px;line-height:1px;color:${C.page};">${esc(preheader)}${"&nbsp;&zwnj;".repeat(40)}</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${C.page}" style="background-color:${C.page};">
  <tr>
    <td align="center" style="padding:${pad.outer};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;">

        <!-- header -->
        <tr>
          <td bgcolor="${C.head2}" style="background-color:${C.head2};background-image:linear-gradient(135deg,${C.head1},${C.head2});border-radius:18px 18px 0 0;padding:${pad.head};">
            <div style="font-family:${FONT};font-size:22px;line-height:26px;font-weight:700;color:#ffffff;letter-spacing:.3px;">${BRAND}</div>
            <div style="padding-top:4px;font-family:${FONT};font-size:12px;line-height:16px;font-weight:700;color:#ffedd5;letter-spacing:2.5px;text-transform:uppercase;">${esc(eyebrow || PRODUCT)}</div>
          </td>
        </tr>

        <!-- card -->
        <tr>
          <td bgcolor="${C.card}" style="background-color:${C.card};border-left:1px solid ${C.border};border-right:1px solid ${C.border};padding:${pad.card};">
            <h1 style="margin:0 0 14px;font-family:${FONT};font-size:${pad.h1};line-height:${pad.h1lh};font-weight:700;color:${C.ink};">${esc(heading)}</h1>
            ${lead ? p(lead, "font-size:17px;line-height:27px;") : ""}
            ${bodyHtml}
          </td>
        </tr>

        <!-- footer -->
        <tr>
          <td bgcolor="${C.card}" style="background-color:${C.card};border:1px solid ${C.border};border-top:0;border-radius:0 0 18px 18px;padding:${pad.foot};">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td style="border-top:1px solid ${C.border};padding-top:18px;font-family:${FONT};font-size:12px;line-height:19px;color:${C.muted};">
              <div style="padding-bottom:8px;">${esc(reason)}</div>
              <div style="padding-bottom:8px;">${esc(note)}</div>${extraFooter}
              <div>
                <a href="${esc(site)}" style="color:${C.linkText};text-decoration:underline;">${BRAND}</a> &nbsp;|&nbsp;
                <a href="${esc(site)}/privacy-policy" style="color:${C.linkText};text-decoration:underline;">Privacy Policy</a> &nbsp;|&nbsp;
                <a href="${esc(site)}/terms-of-service" style="color:${C.linkText};text-decoration:underline;">Terms</a> &nbsp;|&nbsp;
                <a href="${esc(supportLink())}" style="color:${C.linkText};text-decoration:underline;">Support</a>
              </div>
              <div style="padding-top:10px;">&copy; ${year} ${BRAND}. All rights reserved.</div>
            </td></tr></table>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
  return compact ? tight(out) : out;
};

/* ----------------------------------------------------------------------- */
/*  Plain-text helpers                                                      */
/* ----------------------------------------------------------------------- */

const textHelp = (tips = []) =>
  [
    "NEED HELP?",
    `Reply to this email or write to ${supportEmail()}. A real person from the Target Trek team will read it.`,
    ...tips.map((t) => `- ${t}`),
    `Tip: add ${supportEmail()} to your contacts so our emails never land in spam.`,
  ].join("\n");

const textFooter = (reason, note = SERVICE_NOTE) =>
  [
    "--",
    reason,
    note,
    `${BRAND} | ${siteUrl()} | Privacy: ${siteUrl()}/privacy-policy | Terms: ${siteUrl()}/terms-of-service`,
  ].join("\n");

const joinText = (parts) => parts.filter((x) => x !== null && x !== undefined && x !== false).join("\n\n");

/* ======================================================================= */
/*  1. ONE-TIME CODES                                                       */
/* ======================================================================= */

const OTP_COPY = {
  signup: {
    subject: `Verify your email – ${PRODUCT}`,
    eyebrow: PRODUCT,
    heading: "Verify your email",
    preheader: (m) => `Your verification code is inside. It expires in ${m} minutes.`,
    lead: (name) => `Hi ${esc(firstName(name))}, welcome to ${PRODUCT}! Enter this code on the sign-up page to finish creating your account.`,
    textLead: (name) => `Hi ${firstName(name)}, welcome to ${PRODUCT}! Enter this code on the sign-up page to finish creating your account.`,
    notYou: "Didn't try to sign up? You can ignore this email. No account is created until this code is entered.",
    steps: ["Go back to the sign-up page.", "Type the 6-digit code above.", "You're in. Next you'll set up your profile."],
    reason: "You received this because this email address was used to sign up for Prep Buddy Arena.",
    tips: [
      "Didn't get the code? Check your Spam and Promotions folders, wait 60 seconds, then press <strong>Resend code</strong>.",
      "Always use the <strong>newest</strong> code. Older codes stop working when a new one is sent.",
      "For your safety you can request up to 5 codes in 24 hours, and 10 wrong attempts in a day lock sign-up for 24 hours.",
    ],
    textTips: [
      "Didn't get the code? Check Spam and Promotions, wait 60 seconds, then press Resend code.",
      "Always use the newest code. Older codes stop working when a new one is sent.",
      "You can request up to 5 codes in 24 hours, and 10 wrong attempts in a day lock sign-up for 24 hours.",
    ],
  },
  reset: {
    subject: `Reset your password – ${PRODUCT}`,
    eyebrow: "Account security",
    heading: "Reset your password",
    preheader: (m) => `Your password reset code is inside. It expires in ${m} minutes.`,
    lead: (name) => `Hi ${esc(firstName(name))}, we received a request to reset the password on your ${BRAND} account. Enter this code to choose a new one.`,
    textLead: (name) => `Hi ${firstName(name)}, we received a request to reset the password on your ${BRAND} account. Enter this code to choose a new one.`,
    notYou: "Didn't ask for this? Ignore this email and your password stays exactly as it is. If you keep getting these emails, write to us so we can help secure your account.",
    steps: ["Go back to the forgot-password page.", "Type the 6-digit code above and choose a new password.", "Log in with your new password. You'll be signed out of every other device."],
    reason: "You received this because a password reset was requested for this email address.",
    tips: [
      "Didn't get the code? Check Spam and Promotions, wait 60 seconds, then press <strong>Resend code</strong>.",
      "5 wrong codes or resends in a day lock password reset for 24 hours. Support can unlock it sooner if you write to us.",
      "Choose a password with upper and lower case letters, a number and a symbol.",
    ],
    textTips: [
      "Didn't get the code? Check Spam and Promotions, wait 60 seconds, then press Resend code.",
      "5 wrong codes or resends in a day lock password reset for 24 hours. Support can unlock it sooner if you write to us.",
      "Choose a password with upper and lower case letters, a number and a symbol.",
    ],
  },
  login: {
    subject: `Your ${BRAND} login code`,
    eyebrow: "Account security",
    heading: "Your login code",
    preheader: (m) => `Your login code is inside. It expires in ${m} minutes.`,
    lead: (name) => `Hi ${esc(firstName(name))}, enter this code to finish logging in to your ${BRAND} account.`,
    textLead: (name) => `Hi ${firstName(name)}, enter this code to finish logging in to your ${BRAND} account.`,
    notYou: "Didn't try to log in? Someone may have your password. Change it right away and write to us.",
    steps: ["Go back to the login page.", "Type the 6-digit code above."],
    reason: "You received this because a login to your account needs verification.",
    tips: [
      "Didn't get the code? Check Spam and Promotions, then press <strong>Resend code</strong>.",
    ],
    textTips: ["Didn't get the code? Check Spam and Promotions, then press Resend code."],
  },
};

export const otpEmail = ({ purpose = "signup", name, otp, minutes = 10 }) => {
  const c = OTP_COPY[purpose];
  if (!c) throw new Error(`Unknown OTP email purpose: ${purpose}`);

  const bodyHtml = [
    codeBox(otp),
    p(`This code expires in <strong>${esc(plural(minutes, "minute"))}</strong> and works only once.`),
    panel(
      `<strong style="color:${C.warnInk};">Keep it private.</strong> Never share this code with anyone. ${BRAND} staff will never ask you for it, by email, phone or chat.`,
      { bg: C.warnBg, border: C.warnBorder }
    ),
    h2("What to do next"),
    ol(c.steps.map(esc)),
    p(esc(c.notYou), "font-size:15px;line-height:23px;color:" + C.muted + ";"),
    helpBlock(c.tips),
  ].join("");

  const html = shell({
    title: c.subject,
    preheader: c.preheader(minutes),
    eyebrow: c.eyebrow,
    heading: c.heading,
    lead: c.lead(name),
    bodyHtml,
    reason: c.reason,
  });

  const text = joinText([
    `${BRAND.toUpperCase()} | ${c.eyebrow.toUpperCase()}`,
    c.heading.toUpperCase(),
    c.textLead(name),
    `YOUR CODE: ${otp}`,
    `This code expires in ${plural(minutes, "minute")} and works only once.`,
    `Keep it private. Never share this code with anyone. ${BRAND} staff will never ask you for it, by email, phone or chat.`,
    ["WHAT TO DO NEXT", ...c.steps.map((s, i) => `${i + 1}. ${s}`)].join("\n"),
    c.notYou,
    textHelp(c.textTips),
    textFooter(c.reason),
  ]);

  return { subject: c.subject, text, html };
};

/* ======================================================================= */
/*  2. MATCHED                                                              */
/* ======================================================================= */

/*
  data: { name, buddyAlias, buddyTopics: string[], buddyLevel, matchesLeft }
  Only the buddy's anonymous ID is used: no real name, email or phone is ever
  put in this email. Those are shared only when the buddy chooses to.
*/
export const matchedEmail = ({ name, buddyAlias, buddyTopics = [], buddyLevel, matchesLeft = null }) => {
  const site = siteUrl();
  const buddy = buddyAlias || "your new buddy";
  const subject = `You're matched with ${buddy} – ${PRODUCT}`;
  const topics = (buddyTopics || []).filter(Boolean).join(", ");
  const level = buddyLevel ? String(buddyLevel).replace(/_/g, " ") : "";
  const left = Number.isFinite(matchesLeft) ? matchesLeft : null;

  const tips = [
    "Can't see your buddy's name or phone? They are private until your buddy chooses to share them. You decide what you share in <strong>Settings</strong>.",
    "Something feels wrong? Use <strong>Report</strong> or <strong>Block</strong> in the My buddy tab, or write to us straight away.",
  ];
  const textTips = [
    "Can't see your buddy's name or phone? They are private until your buddy chooses to share them. You decide what you share in Settings.",
    "Something feels wrong? Use Report or Block in the My buddy tab, or write to us straight away.",
  ];

  const bodyHtml = [
    facts([
      ["Your buddy", esc(buddy)],
      ["Preparing for", esc(topics)],
      ["Level", esc(level)],
      ["Matches left after this", left === null ? "" : esc(String(left))],
    ]),
    button(`${site}/prep-buddy/app/buddy`, "Open my buddy"),
    h2("Your first 24 hours"),
    ol([
      "<strong>Say hello</strong> in the chat. A short intro about what you are preparing for is a great start.",
      "<strong>Pick a topic and a time</strong> for your first practice session. Agree on the time zone too.",
      `<strong>Choose what to share.</strong> Your name, email, phone and LinkedIn stay hidden until you switch them on in ${link(`${site}/prep-buddy/app/settings`, "Settings")}.`,
    ]),
    h2("How to get the most out of it"),
    ul([
      "Show up on time and tell your buddy early if you need to reschedule.",
      "Practise out loud, then give each other honest, kind feedback.",
      "Keep the conversation about interview preparation.",
      "Never send or accept requests for money. Report anyone who asks.",
    ]),
    h2("If it isn't working out"),
    p(
      `You can end the partnership any time from the My buddy tab. An ended partnership counts as one of your matches${left === null ? "" : `, and you'd have ${esc(plural(left, "match", "matches"))} left`}. If something was not okay, tell us so we can look into it.`
    ),
    helpBlock(tips),
  ].join("");

  const html = shell({
    title: subject,
    preheader: `${buddy} accepted. Say hello and agree on your first practice session.`,
    eyebrow: "It's a match",
    heading: `You're matched with ${buddy}!`,
    lead: `Hi ${esc(firstName(name))}, great news: your buddy request was accepted and your prep partnership has started. You can chat with ${esc(buddy)} right now.`,
    bodyHtml,
    reason: "You received this because a request was accepted in Prep Buddy Arena.",
  });

  const text = joinText([
    `${BRAND.toUpperCase()} | IT'S A MATCH`,
    `YOU'RE MATCHED WITH ${buddy.toUpperCase()}!`,
    `Hi ${firstName(name)}, great news: your buddy request was accepted and your prep partnership has started. You can chat with ${buddy} right now.`,
    [
      `Your buddy: ${buddy}`,
      topics && `Preparing for: ${topics}`,
      level && `Level: ${level}`,
      left !== null && `Matches left after this: ${left}`,
    ].filter(Boolean).join("\n"),
    `OPEN MY BUDDY: ${site}/prep-buddy/app/buddy`,
    [
      "YOUR FIRST 24 HOURS",
      "1. Say hello in the chat. A short intro about what you are preparing for is a great start.",
      "2. Pick a topic and a time for your first practice session. Agree on the time zone too.",
      `3. Choose what to share. Your name, email, phone and LinkedIn stay hidden until you switch them on in Settings: ${site}/prep-buddy/app/settings`,
    ].join("\n"),
    [
      "HOW TO GET THE MOST OUT OF IT",
      "- Show up on time and tell your buddy early if you need to reschedule.",
      "- Practise out loud, then give each other honest, kind feedback.",
      "- Keep the conversation about interview preparation.",
      "- Never send or accept requests for money. Report anyone who asks.",
    ].join("\n"),
    `IF IT ISN'T WORKING OUT\nYou can end the partnership any time from the My buddy tab. An ended partnership counts as one of your matches${left === null ? "" : `, and you'd have ${plural(left, "match", "matches")} left`}. If something was not okay, tell us so we can look into it.`,
    textHelp(textTips),
    textFooter("You received this because a request was accepted in Prep Buddy Arena."),
  ]);

  return { subject, text, html };
};

/* ======================================================================= */
/*  3. UNMATCHED                                                            */
/* ======================================================================= */

/*
  variant (who ended it, from THIS recipient's point of view):
    ended_by_you     the recipient ended the partnership
    ended_by_buddy   the other member ended it
    blocked_by_you   the recipient blocked the other member
    ended_by_team    a Target Trek admin ended it
    ended            neutral wording (the other member blocked, or an account
                     was suspended): never says who or why
  data: { name, buddyAlias, variant, matchesLeft, backInArena, notCounted }
*/
export const UNMATCH_VARIANTS = ["ended_by_you", "ended_by_buddy", "blocked_by_you", "ended_by_team", "ended"];

const UNMATCH_COPY = {
  ended_by_you: {
    heading: "You ended your partnership",
    lead: (buddy) => `your partnership with ${buddy} has ended, as you asked. The chat is now closed.`,
  },
  ended_by_buddy: {
    heading: "Your partnership has ended",
    lead: (buddy) => `${buddy} ended your partnership. This happens, and it isn't a reflection on you. The chat is now closed.`,
  },
  blocked_by_you: {
    heading: "You blocked your buddy",
    lead: (buddy) => `your partnership with ${buddy} has ended and you won't see each other in the arena again. The chat is now closed.`,
  },
  ended_by_team: {
    heading: "Your partnership has ended",
    lead: (buddy) => `the ${BRAND} team ended your partnership with ${buddy}. The chat is now closed. If you'd like to know more, write to us.`,
  },
  ended: {
    heading: "Your partnership has ended",
    lead: (buddy) => `your partnership with ${buddy} has ended. The chat is now closed.`,
  },
};

export const unmatchedEmail = ({ name, buddyAlias, variant = "ended", matchesLeft = null, backInArena = false, notCounted = false }) => {
  const site = siteUrl();
  const copy = UNMATCH_COPY[variant] || UNMATCH_COPY.ended;
  const buddy = buddyAlias || "your buddy";
  const subject = `Your partnership has ended – ${PRODUCT}`;
  const left = Number.isFinite(matchesLeft) ? matchesLeft : null;
  const canMatchAgain = Boolean(backInArena) && (left === null || left > 0);

  const nextHtml = canMatchAgain
    ? [
        p(
          `Good news: you're back in the arena${left === null ? "" : ` with <strong>${esc(plural(left, "match", "matches"))} left</strong> on your entry`}. Your profile is visible again, so you can send requests or accept new ones.`
        ),
        button(`${site}/prep-buddy/app/arena`, "Find a new buddy"),
      ].join("")
    : [
        p(
          "You've used all the matches included in your entry. To match with someone new, join the arena again with a new entry. Your profile details are saved, so it only takes a minute."
        ),
        button(`${site}/prep-buddy/app`, "Join the arena again"),
      ].join("");

  const tips = [
    "Want to tell us what happened? Reply to this email. We read every message and use it to keep the arena friendly.",
    "If you ever felt unsafe or uncomfortable, write to us right away and we'll look into it.",
  ];
  const textTips = [
    "Want to tell us what happened? Reply to this email. We read every message and use it to keep the arena friendly.",
    "If you ever felt unsafe or uncomfortable, write to us right away and we'll look into it.",
  ];

  const bodyHtml = [
    notCounted
      ? panel(`<strong>This partnership did not count against your matches.</strong> It ended through no fault of yours, so the match was given back.`)
      : "",
    h2("What this means"),
    ul([
      "The chat is closed for both of you and can't be reopened.",
      "Anything your buddy chose to share (like a name or phone number) is no longer shown in the app. If you saved it elsewhere, please keep it private.",
      "You can't be matched with the same member again.",
    ]),
    h2("What's next"),
    nextHtml,
    helpBlock(tips),
  ].join("");

  const html = shell({
    title: subject,
    preheader: `Your partnership with ${buddy} has ended. Here's what happens next.`,
    eyebrow: "Partnership update",
    heading: copy.heading,
    lead: `Hi ${esc(firstName(name))}, ${esc(copy.lead(buddy))}`,
    bodyHtml,
    reason: "You received this because a partnership you were in on Prep Buddy Arena ended.",
  });

  const text = joinText([
    `${BRAND.toUpperCase()} | PARTNERSHIP UPDATE`,
    copy.heading.toUpperCase(),
    `Hi ${firstName(name)}, ${copy.lead(buddy)}`,
    notCounted && "This partnership did not count against your matches. It ended through no fault of yours, so the match was given back.",
    [
      "WHAT THIS MEANS",
      "- The chat is closed for both of you and can't be reopened.",
      "- Anything your buddy chose to share (like a name or phone number) is no longer shown in the app. If you saved it elsewhere, please keep it private.",
      "- You can't be matched with the same member again.",
    ].join("\n"),
    canMatchAgain
      ? `WHAT'S NEXT\nYou're back in the arena${left === null ? "" : ` with ${plural(left, "match", "matches")} left on your entry`}. Your profile is visible again, so you can send requests or accept new ones.\nFind a new buddy: ${site}/prep-buddy/app/arena`
      : `WHAT'S NEXT\nYou've used all the matches included in your entry. To match with someone new, join the arena again with a new entry. Your profile details are saved, so it only takes a minute.\nJoin the arena again: ${site}/prep-buddy/app`,
    textHelp(textTips),
    textFooter("You received this because a partnership you were in on Prep Buddy Arena ended."),
  ]);

  return { subject, text, html };
};

/* ======================================================================= */
/*  4. PAYMENT REMINDER (sent by an admin to sign-ups who haven't paid)      */
/* ======================================================================= */

/*
  data: { name, pricePaise, matches, offerText, attempt, unsubscribeUrl }
  pricePaise / matches are the LIVE arena settings, never hard-coded.
  attempt = which reminder this is for the person (1, 2, 3…). Each attempt has its own
  subject and opening line: repeating the exact same subject makes mail apps stack the
  messages into one conversation and treat the repeat as bulk mail.
  The layout is compact: small padding, no margins.
*/
const REMINDER_COPY = [
  {
    subject: (n, price, m) => `Hi ${n}, get ${PRODUCT} at ${price} for ${m}`,
    lead: (n, price, m) => `You signed up for ${PRODUCT} but haven't joined yet. You can get in for just <strong>${price}</strong> and be matched for <strong>${m}</strong>.`,
    textLead: (price, m) => `You signed up for ${PRODUCT} but haven't joined yet. You can get in for just ${price} and be matched for ${m}.`,
  },
  {
    subject: (n, price, m) => `${n}, your prep buddy seat is still open (${price}, ${m})`,
    lead: (n, price, m) => `A quick follow-up: your ${PRODUCT} seat is still open. Entry is <strong>${price}</strong> and includes <strong>${m}</strong>.`,
    textLead: (price, m) => `A quick follow-up: your ${PRODUCT} seat is still open. Entry is ${price} and includes ${m}.`,
  },
  {
    subject: (n, price, m) => `Still thinking it over, ${n}? ${price} for ${m}`,
    lead: (n, price, m) => `If you're still thinking about ${PRODUCT}, here is the price again: <strong>${price}</strong> for <strong>${m}</strong>. If it isn't for you, no problem.`,
    textLead: (price, m) => `If you're still thinking about ${PRODUCT}, here is the price again: ${price} for ${m}. If it isn't for you, no problem.`,
  },
];

export const reminderEmail = ({ name, pricePaise, matches = 1, offerText = "", attempt = 1, unsubscribeUrl = "" }) => {
  const site = siteUrl();
  const price = rupees(Math.max(0, Number(pricePaise) || 0));
  const count = Math.max(1, Number(matches) || 1);
  const matchWord = plural(count, "match", "matches");
  const joinUrl = `${site}/prep-buddy/app/join`;
  const offer = String(offerText || "").trim();
  const who = firstName(name);
  const copy = REMINDER_COPY[Math.min(Math.max(1, Number(attempt) || 1), REMINDER_COPY.length) - 1];
  const unsub = /^https?:\/\//i.test(unsubscribeUrl) ? unsubscribeUrl : "";

  const subject = copy.subject(who, price, matchWord);
  const cta = `Get Prep Buddy Arena at ${price}`;

  // Each block sits in a small padded wrapper (padding only, no margins).
  const block = (html, pad = "0 0 8px") => `<div style="padding:${pad};">${html}</div>`;

  const bodyHtml = [
    block(
      panel(
        `<div style="font-family:${FONT};font-size:12px;line-height:16px;letter-spacing:2px;font-weight:700;color:${C.warnInk};text-transform:uppercase;padding-bottom:4px;">One-time entry</div>
         <div style="font-family:${FONT};font-size:34px;line-height:40px;font-weight:700;color:${C.codeInk};">${esc(price)}</div>
         <div style="font-family:${FONT};font-size:15px;line-height:22px;color:${C.body};padding-top:2px;">Includes <strong>${esc(matchWord)}</strong>${count > 1 ? ", one after another" : ""}. No subscription.</div>`,
        { bg: C.codeBg, border: C.codeBorder }
      )
    ),
    offer ? block(panel(`<strong>Current offer:</strong> ${esc(offer)}`, { bg: C.warnBg, border: C.warnBorder })) : "",
    block(button(joinUrl, cta), "2px 0 6px"),
    block(h2("How it works"), "0"),
    block(
      ol([
        `<strong>Pay ${esc(price)}</strong> once. It takes under a minute.`,
        "<strong>Add your details</strong>: what you are preparing for, your level and when you are free.",
        "<strong>Appear in the arena</strong> and start practising with a buddy.",
      ]),
      "0 0 4px"
    ),
    block(helpBlock(), "10px 0 0"),
  ].join("");

  const unsubHtml = unsub
    ? `<div style="padding-bottom:6px;">Don't want these? ${link(unsub, "Unsubscribe")} and we won't email you about this again.</div>`
    : "";

  const html = shell({
    compact: true,
    title: subject,
    preheader: `${price} for ${matchWord}. Pay, add your details and meet your prep buddy.`,
    eyebrow: "Your seat is waiting",
    heading: `Hi ${who}, your prep buddy is waiting`,
    lead: copy.lead(who, esc(price), esc(matchWord)),
    bodyHtml,
    reason: "You received this because you signed up for Prep Buddy Arena but haven't completed your entry yet.",
    note: "This is a reminder from the Target Trek team. Just reply if you have any questions.",
    extraFooter: unsubHtml,
  });

  const text = joinText([
    `${BRAND.toUpperCase()} | YOUR SEAT IS WAITING`,
    `Hi ${who},`,
    copy.textLead(price, matchWord),
    `ONE-TIME ENTRY: ${price} (includes ${matchWord}${count > 1 ? ", one after another" : ""}. No subscription.)`,
    offer ? `CURRENT OFFER: ${offer}` : null,
    `${cta.toUpperCase()}: ${joinUrl}`,
    [
      "HOW IT WORKS",
      `1. Pay ${price} once. It takes under a minute.`,
      "2. Add your details: what you are preparing for, your level and when you are free.",
      "3. Appear in the arena and start practising with a buddy.",
    ].join("\n"),
    textHelp(),
    textFooter(
      "You received this because you signed up for Prep Buddy Arena but haven't completed your entry yet.",
      "This is a reminder from the Target Trek team. Just reply if you have any questions."
    ),
    unsub ? `Unsubscribe: ${unsub}` : null,
  ]);

  return { subject, text, html };
};
