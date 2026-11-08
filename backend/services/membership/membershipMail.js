import { SITE_URL, escapeHtml, unsubscribeUrl } from "../campaign/render.js";

/*
  Emails for purchases that carry Prep Arena matches and/or are an "all books" pack:
    buildPurchaseMail  thanks + what you got + what a match is (sent once per paid order)
    buildNewBookMail   a new book is live (pack holders)
  Orange/white, compact padding, same sender as every other Target Trek mail.
*/

export const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
export const ARENA_SIGNUP_URL = `${SITE_URL}/prep-buddy/signup`;
export const PREP_BUDDY_URL = `${SITE_URL}/prep-buddy`;
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
  ORDER CONFIRMATION (transactional): no bulk headers, no unsubscribe, one CTA.
  Light-orange theme. Everything, including the "how Prep Buddy looks" mock-ups, is built
  from HTML tables + inline CSS: no hosted images except the book cover.
  Spacing scale: 16px between blocks, 16px inside cards, 8px between small items.

  matches      matches this purchase gave
  matchesAdded true when they are already on the member's arena account
  packPlan     "none" | "all_current" | "lifetime"
  coverUrl     book cover (https image) shown in the order card
*/
export const buildPurchaseMail = ({ email, name, bookTitle, orderId = "", matches = 0, matchesAdded = false, packPlan = "none", coverUrl = "" }) => {
  const lifetime = packPlan === "lifetime";
  const isPack = packPlan !== "none";
  const hasMatches = matches > 0;
  const subject = `Order confirmation: ${bookTitle}${hasMatches ? ` and ${plural(matches, "Prep Arena match", "Prep Arena matches")}` : ""}`;
  const first = firstNameOf(name);
  const link = PREP_BUDDY_URL;
  const cover = /^https?:\/\//i.test(coverUrl || "") ? coverUrl : "";
  const ctaText = "Open Prep Buddy";

  const PEACH = "#FFEDD5"; // light orange fill
  const CREAM = "#FFF7ED"; // lightest orange
  const EDGE = "#FED7AA"; // light orange border
  const DEEP = "#C2410C"; // readable orange text

  // Mail apps auto-link addresses in blue; wrapping it in our own styled link keeps it readable on orange.
  const em = (v) => `<a href="mailto:${escapeHtml(v)}" style="color:${DEEP};text-decoration:none;font-weight:700;">${escapeHtml(v)}</a>`;
  const T = (inner, style = "") => `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="${style}">${inner}</table>`;
  const card = (inner, bg = CREAM) => T(`<tr><td style="padding:16px;">${inner}</td></tr>`, `background:${bg};border:1px solid ${EDGE};border-radius:10px;`);
  const title = (t, sub = "") => `<div style="font-size:16px;line-height:22px;font-weight:800;color:${DEEP};">${t}</div>${sub ? `<div style="font-size:13px;line-height:19px;color:${MUTED};padding-top:2px;">${sub}</div>` : ""}`;
  const pill = (t, bg = PEACH, fg = DEEP) => `<span style="display:inline-block;padding:2px 8px;margin:0 4px 4px 0;background:${bg};color:${fg};border-radius:10px;font-size:11px;line-height:16px;font-weight:700;">${t}</span>`;

  /* ---- order card ---- */
  const summary = card(
    T(`<tr>${cover ? `<td width="76" valign="middle" style="padding:0 16px 0 0;"><img src="${escapeHtml(cover)}" width="60" alt="${escapeHtml(bookTitle)}" style="display:block;width:60px;height:auto;border:0;border-radius:4px;"></td>` : ""}
<td valign="middle"><div style="font-size:11px;line-height:16px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${ORANGE};">Order confirmed${orderId ? ` &middot; ${escapeHtml(orderId)}` : ""}</div>
<div style="font-size:17px;line-height:23px;font-weight:800;color:${INK};padding-top:2px;">${escapeHtml(bookTitle)}${isPack ? " (pack)" : ""}</div></td></tr>`)
  );

  /* ---- credits ---- */
  const credits = hasMatches
    ? T(`<tr><td align="center" style="padding:20px 16px;">
<div style="font-size:11px;line-height:16px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:${DEEP};">Prep Arena credits</div>
<div style="font-size:44px;line-height:52px;font-weight:800;color:${ORANGE};">${matches}</div>
<div style="font-size:14px;line-height:20px;color:${INK};">${matches === 1 ? "match" : "matches"} ${matchesAdded ? "added to your account" : `reserved for ${em(email)}`}</div>
</td></tr>`, `background:${PEACH};border:1px solid ${EDGE};border-radius:10px;`)
    : "";

  /* ---- CTA: equal 14px top/bottom, 24px sides ---- */
  const cta = hasMatches
    ? `${T(`<tr><td align="center">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;"><tr><td align="center" bgcolor="${ORANGE}" style="background:${ORANGE};border-radius:10px;border-bottom:3px solid ${DEEP};"><a href="${escapeHtml(link)}" style="display:block;padding:14px 36px;font-size:16px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;text-align:center;white-space:nowrap;">${ctaText} &rarr;</a></td></tr></table>
</td></tr>`)}
<div style="padding-top:10px;font-size:12px;line-height:18px;color:${MUTED};text-align:center;">${matchesAdded ? "Your credits are already on your account." : `Create your account with ${em(email)} and the credits appear automatically.`}</div>`
    : "";

  /* ---- coded mock-up of Prep Buddy (browse card + chat) ---- */
  const avatar = (letters, bg) => `<table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" width="40" height="40" style="width:40px;height:40px;background:${bg};border-radius:20px;color:#ffffff;font-size:14px;line-height:40px;font-weight:800;">${letters}</td></tr></table>`;
  const member = (letters, bg, alias, tags, role, bio) =>
    T(`<tr><td style="padding:12px;">
${T(`<tr><td width="48" valign="top">${avatar(letters, bg)}</td><td valign="top"><div style="font-size:14px;line-height:20px;font-weight:800;color:${INK};">${alias}</div><div style="padding-top:2px;">${tags}</div></td></tr>`)}
<div style="font-size:13px;line-height:19px;font-weight:700;color:${INK};padding-top:4px;">${role}</div>
<div style="font-size:12px;line-height:18px;color:${MUTED};padding:2px 0 8px;">${bio}</div>
<div style="display:inline-block;padding:5px 10px;background:${CREAM};border:1px solid ${EDGE};border-radius:6px;font-size:11px;line-height:16px;color:${DEEP};">&#128065;&#8202; Name hidden until you both accept</div>
</td></tr>`, `background:#ffffff;border:1px solid ${EDGE};border-radius:10px;`);

  const chat = T(`<tr><td style="padding:12px;">
<div style="font-size:11px;line-height:16px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${MUTED};padding-bottom:8px;">Private chat &middot; unlocked</div>
${T(`<tr><td style="padding:0 40px 8px 0;"><div style="display:inline-block;padding:8px 12px;background:${PEACH};border-radius:12px 12px 12px 2px;font-size:13px;line-height:19px;color:${INK};">Hi! Free for a system design mock this weekend?</div></td></tr>
<tr><td align="right" style="padding:0 0 0 40px;"><div style="display:inline-block;padding:8px 12px;background:${ORANGE};border-radius:12px 12px 2px 12px;font-size:13px;line-height:19px;color:#ffffff;text-align:left;">Yes! Saturday 7 PM works. &#128077;</div></td></tr>`)}
</td></tr>`, `background:#ffffff;border:1px solid ${EDGE};border-radius:10px;`);

  const looks = hasMatches
    ? card(`${title("See how Prep Buddy looks", "Browse profiles, send a request, then chat privately once you both accept.")}
<div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div>
${member("K7", "#EA580C", "Member-K7QX2", pill("HLD") + pill("LLD") + pill("Intermediate", "#F3F4F6", "#4B5563"), "Backend Engineer at a product company &middot; 4 yrs", "Backend dev prepping for product-company design rounds. Evenings work best.")}
<div style="height:8px;line-height:8px;font-size:0;">&nbsp;</div>
${chat}`)
    : "";

  /* ---- how it works ---- */
  const step = (n, t, text, last) => `<tr><td width="40" valign="top" style="padding:0 0 ${last ? 0 : 12}px;">${T(`<tr><td align="center" width="28" height="28" style="width:28px;height:28px;background:${ORANGE};border-radius:14px;color:#ffffff;font-size:14px;line-height:28px;font-weight:800;">${n}</td></tr>`, "width:28px;")}</td>
<td valign="top" style="padding:0 0 ${last ? 0 : 12}px;font-size:14px;line-height:21px;color:${INK};"><b>${t}</b><br><span style="color:${MUTED};">${text}</span></td></tr>`;

  const how = hasMatches
    ? card(`${title("How it works")}
<div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div>
${T(
  step(1, matchesAdded ? "Open the arena" : "Create your account", matchesAdded ? "Your matches are already there." : `Sign up with ${em(email)} and your ${plural(matches, "match", "matches")} appear instantly.`) +
  step(2, "Get paired", "You are matched with one candidate preparing for similar interviews. You appear under an alias; your phone and email stay hidden.") +
  step(3, "Practise together", "Run mock interviews and chat privately. 1 match = 1 partnership; when it ends, your next match pairs you with someone new.", true)
)}`)
    : "";

  const packBlock = isPack
    ? card(`${title("Your pack")}<div style="font-size:14px;line-height:22px;color:${INK};padding-top:4px;">${lifetime ? "Every book we publish in future is emailed to you free when it is released." : "We will email you whenever a new book is published."} You can also request books from the <b>Books</b> tab inside Prep Buddy.</div>`)
    : "";

  const blocks = [summary, credits, cta, looks, how, packBlock].filter(Boolean);
  const gap = `<div style="height:16px;line-height:16px;font-size:0;">&nbsp;</div>`;

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:${PEACH};font-family:${FONT};color:${INK};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(hasMatches ? `${plural(matches, "Prep Arena match", "Prep Arena matches")} ready for you` : "Your order is confirmed")}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;background:#ffffff;border:1px solid ${EDGE};border-radius:12px;">
<tr><td style="background:${CREAM};padding:16px 20px;border-bottom:1px solid ${EDGE};border-radius:12px 12px 0 0;font-size:18px;line-height:24px;font-weight:800;color:${ORANGE};">Target <span style="color:${INK};">Trek</span></td></tr>
<tr><td style="padding:20px;">
<div style="font-size:15px;line-height:22px;color:${INK};">Hi ${escapeHtml(first)},<br>Thank you for your order. Here are the details.</div>
${gap}
${blocks.map((x) => `${x}${gap}`).join("\n")}
<div style="font-size:13px;line-height:20px;color:${MUTED};">Any question? Just reply to this email.</div>
<div style="font-size:14px;line-height:21px;color:${INK};padding-top:8px;">Team Target Trek</div>
</td></tr>
<tr><td style="padding:12px 20px;background:${CREAM};border-top:1px solid ${EDGE};border-radius:0 0 12px 12px;font-size:12px;line-height:18px;color:${MUTED};text-align:center;">Order confirmation for ${escapeHtml(bookTitle)} &middot; <a href="mailto:${SUPPORT_EMAIL}" style="color:${DEEP};">${SUPPORT_EMAIL}</a></td></tr>
</table></td></tr></table>
</body></html>`;

  const text = [
    `Hi ${first},`,
    "",
    `Your order${orderId ? ` ${orderId}` : ""} for ${bookTitle} is confirmed.`,
    hasMatches ? `\nPREP ARENA CREDITS: ${plural(matches, "match", "matches")} ${matchesAdded ? "added to your account" : `reserved for ${email}`}.\n${ctaText}: ${link}` : "",
    hasMatches ? `\nHow it works:\n1. ${matchesAdded ? "Open the arena" : `Sign up with ${email}`}\n2. Get paired with one candidate preparing for similar interviews\n3. Practise mock interviews and chat privately. 1 match = 1 partnership.` : "",
    isPack ? `\nYour pack: ${lifetime ? "every future book is emailed to you free" : "an email for every new book"}.` : "",
    "",
    "Any question? Just reply to this email.",
    "Team Target Trek",
    SUPPORT_EMAIL,
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");

  return { subject, html, text, headers: {} };
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
