import { SITE_URL, escapeHtml, unsubscribeUrl } from "../campaign/render.js";

/*
  Emails for purchases that carry Prep Arena matches and/or are an "all books" pack:
    buildPurchaseMail  thanks + what you got + what a match is (sent once per paid order)
    buildNewBookMail   a new book is live (pack holders)
  Orange/white, compact padding, same sender as every other Target Trek mail.
*/

export const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
export const ARENA_SIGNUP_URL = `${SITE_URL}/prep-buddy/signup`;
export const ARENA_APP_URL = `${SITE_URL}/prep-buddy/app`;
export const ARENA_BOOKS_URL = `${SITE_URL}/prep-buddy/app/books`;

const FONT = "Arial,Helvetica,sans-serif";
const ORANGE = "#EA580C";
const ORANGE_LIGHT = "#F97316";
const SOFT = "#FFF4EA";
const LINE = "#FDDCBF";
const INK = "#1F2937";
const MUTED = "#6B7280";

const P = (html, extra = "") => `<p style="margin:0 0 10px;font-size:14px;line-height:1.55;color:${INK};${extra}">${html}</p>`;

const button = (text, url) =>
  `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 4px;"><tr><td style="background:${ORANGE};border-radius:6px;"><a href="${escapeHtml(url)}" style="display:inline-block;padding:9px 18px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(text)}</a></td></tr></table>`;

const shell = ({ subject, preheader, body, footer }) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${SOFT};font-family:${FONT};color:${INK};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:10px 8px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;background:#ffffff;border:1px solid ${LINE};border-radius:8px;">
<tr><td style="background:${ORANGE};background-image:linear-gradient(135deg,${ORANGE_LIGHT},${ORANGE});padding:12px 16px;border-radius:8px 8px 0 0;">
<span style="font-size:17px;font-weight:800;color:#ffffff;">Target Trek</span></td></tr>
<tr><td style="padding:16px;">
${body}
<p style="margin:12px 0 12px;font-size:14px;line-height:1.5;color:${INK};">Thanks,<br>Team Target Trek</p>
<p style="margin:0;font-size:12px;line-height:1.5;color:${MUTED};">${footer}</p>
</td></tr></table>
</td></tr></table>
</body></html>`;

const firstNameOf = (name) => String(name || "").trim().split(/\s+/)[0] || "there";

const headersFor = (unsubscribe) => ({
  "List-Unsubscribe": `<${unsubscribe}>, <mailto:${SUPPORT_EMAIL}?subject=unsubscribe>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
});

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

/* ---------------- purchase ---------------- */

/*
  matches      matches this purchase gave (0 = the matches sections are left out)
  matchesAdded true when they are already on the member's arena account
  packPlan     "none" | "all_current" | "lifetime"
*/
export const buildPurchaseMail = ({ email, name, bookTitle, matches = 0, matchesAdded = false, packPlan = "none" }) => {
  const lifetime = packPlan === "lifetime";
  const isPack = packPlan !== "none";
  const subject = `Thanks for purchasing ${bookTitle}`;
  const unsubscribe = unsubscribeUrl(email);
  const hasMatches = matches > 0;

  /* ---- what you got ---- */
  const gotBox = hasMatches
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 12px;background:${SOFT};border:1px solid ${LINE};border-radius:6px;"><tr><td style="padding:10px 12px;">
<div style="font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:${ORANGE};">Prep Arena</div>
<div style="font-size:18px;font-weight:800;color:${INK};margin:2px 0 4px;">You got ${plural(matches, "match", "matches")}</div>
<div style="font-size:13.5px;line-height:1.5;color:${INK};">${
        matchesAdded
          ? `They are already added to your Prep Arena account. Open the arena and start finding your buddy.`
          : `Sign up on Prep Arena with <b>${escapeHtml(email)}</b> (the email you used here) and all ${matches} appear on your account straight away, with nothing to pay.`
      }</div>
</td></tr></table>${button(matchesAdded ? "Open Prep Arena" : "Sign up on Prep Arena", matchesAdded ? ARENA_APP_URL : ARENA_SIGNUP_URL)}`
    : "";

  /* ---- what is a match ---- */
  const aboutArena = hasMatches
    ? `<p style="margin:12px 0 4px;font-size:15px;font-weight:800;color:${ORANGE};">What is Prep Arena?</p>
${P("Prep Arena pairs you with one other serious candidate preparing for similar interviews. You practise mock interviews together, chat privately inside the platform and keep each other on track. You appear under an alias; your phone number and email stay hidden unless you both choose to share them.")}
<p style="margin:10px 0 4px;font-size:15px;font-weight:800;color:${ORANGE};">What does 1 match mean?</p>
<ul style="margin:0 0 10px;padding-left:18px;font-size:14px;line-height:1.55;color:${INK};">
<li style="margin:0 0 4px;"><b>1 match = 1 partnership</b> with a prep buddy, for as long as you both keep practising.</li>
<li style="margin:0 0 4px;">When a partnership ends, your next match lets you pair with someone new.</li>
<li style="margin:0 0 4px;">${plural(matches, "match", "matches")} means ${matches === 1 ? "one buddy" : `up to ${matches} buddies, one after another`}. Unused matches stay on your account.</li>
</ul>`
    : "";

  /* ---- pack benefits ---- */
  const packBox = isPack
    ? `<p style="margin:12px 0 4px;font-size:15px;font-weight:800;color:${ORANGE};">Your pack benefits</p>
<ul style="margin:0 0 10px;padding-left:18px;font-size:14px;line-height:1.55;color:${INK};">
<li style="margin:0 0 4px;">${lifetime ? "<b>Every book we publish in future</b>, emailed to you free when it is released." : "An email whenever we publish a new book."}</li>
<li style="margin:0 0 4px;">Request or suggest new books inside Prep Arena (sign in, open <b>Books</b>).</li>
</ul>${button("Open the Books tab", ARENA_BOOKS_URL)}`
    : "";

  const body = `${P(`Hi ${escapeHtml(firstNameOf(name))},`, "font-size:15px;")}
${P(`Thanks for purchasing <b>${escapeHtml(bookTitle)}</b>${isPack ? " (pack)" : ""}. ${
    hasMatches ? "Here is what came with it." : "Your PDFs are being sent in a separate email."
  }`)}
${gotBox}${packBox}${aboutArena}
${P(`Questions? Just reply to this email.`, `color:${MUTED};font-size:13px;`)}`;

  const html = shell({
    subject,
    preheader: hasMatches ? `You got ${plural(matches, "Prep Arena match", "Prep Arena matches")}` : "Thanks for your purchase",
    body,
    footer: `You are receiving this because you purchased ${escapeHtml(bookTitle)} from Target Trek.<br>Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:${MUTED};">${SUPPORT_EMAIL}</a> &nbsp;·&nbsp; <a href="${escapeHtml(unsubscribe)}" style="color:${MUTED};">Unsubscribe</a>`,
  });

  const text = [
    `Hi ${firstNameOf(name)},`,
    "",
    `Thanks for purchasing ${bookTitle}${isPack ? " (pack)" : ""}.`,
    hasMatches
      ? matchesAdded
        ? `You got ${plural(matches, "Prep Arena match", "Prep Arena matches")}, already added to your account: ${ARENA_APP_URL}`
        : `You got ${plural(matches, "Prep Arena match", "Prep Arena matches")}. Sign up with ${email} and they appear on your account straight away: ${ARENA_SIGNUP_URL}`
      : "",
    hasMatches ? "\nWhat is 1 match? 1 match = 1 partnership with a prep buddy for mock interviews and private chat. When it ends, your next match pairs you with someone new." : "",
    isPack ? `\nPack benefits: ${lifetime ? "every future book emailed free" : "an email for every new book"}; request books in Prep Arena > Books: ${ARENA_BOOKS_URL}` : "",
    "",
    "Team Target Trek",
    `Unsubscribe: ${unsubscribe}`,
  ]
    .filter((l) => l !== "")
    .join("\n");

  return { subject, html, text, headers: headersFor(unsubscribe) };
};

/* ---------------- new book ---------------- */

export const buildNewBookMail = ({ email, name, lifetime, book, accessUrl, packTitle }) => {
  const subject = lifetime ? `New book added to your library: ${book.title}` : `New book on Target Trek: ${book.title}`;
  const unsubscribe = unsubscribeUrl(email);
  const bookUrl = book.redirectUrl ? `${SITE_URL}${book.redirectUrl.startsWith("/") ? "" : "/"}${book.redirectUrl}` : `${SITE_URL}/books`;
  const cover = /^https?:\/\//i.test(book.coverPageUrl || "") ? book.coverPageUrl : "";

  const card = `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 10px;background:${SOFT};border:1px solid ${LINE};border-radius:6px;"><tr>
${cover ? `<td width="80" valign="top" style="padding:10px 0 10px 10px;"><img src="${escapeHtml(cover)}" width="70" alt="${escapeHtml(book.title)}" style="display:block;width:70px;height:auto;border:0;border-radius:4px;"></td>` : ""}
<td valign="top" style="padding:10px 12px;font-size:14px;line-height:1.5;color:${INK};">
<div style="font-size:16px;font-weight:800;">${escapeHtml(book.title)}</div>
${book.subtitle ? `<div style="font-size:13px;color:${MUTED};margin-top:2px;">${escapeHtml(book.subtitle)}</div>` : ""}
</td></tr></table>`;

  const intro = lifetime
    ? `A new book is live, and it is <b>included in your ${escapeHtml(packTitle || "Lifetime")} pack</b>. Nothing to pay.`
    : `We have just published a new book on Target Trek.`;

  const action = lifetime
    ? `${button("Download your copy", accessUrl || bookUrl)}${P(`If the button does not open, copy this link: <span style="word-break:break-all;color:${MUTED};">${escapeHtml(accessUrl || bookUrl)}</span>`, "font-size:12px;")}`
    : `${button("View the book", bookUrl)}${P(`Want every future book included? <a href="${escapeHtml(`${SITE_URL}/books`)}" style="color:${ORANGE};">See the Lifetime pack</a>.`, "font-size:13px;")}`;

  const body = `${P(`Hi ${escapeHtml(firstNameOf(name))},`, "font-size:15px;")}${P(intro)}${card}${action}
${P(`Want a book on another topic? Sign in to Prep Arena and use the <b>Books</b> tab to suggest it.`, `font-size:13px;color:${MUTED};`)}`;

  const html = shell({
    subject,
    preheader: lifetime ? "Included in your Lifetime pack" : "A new book is live",
    body,
    footer: `You are receiving this because you hold a Target Trek book pack.<br>Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:${MUTED};">${SUPPORT_EMAIL}</a> &nbsp;·&nbsp; <a href="${escapeHtml(unsubscribe)}" style="color:${MUTED};">Unsubscribe</a> from book alerts`,
  });

  const text = [
    `Hi ${firstNameOf(name)},`,
    "",
    lifetime ? `"${book.title}" is live and included in your pack.` : `We just published "${book.title}".`,
    lifetime ? `Download: ${accessUrl || bookUrl}` : `View: ${bookUrl}`,
    "",
    "Team Target Trek",
    `Unsubscribe from book alerts: ${unsubscribe}`,
  ].join("\n");

  return { subject, html, text, headers: headersFor(unsubscribe) };
};
