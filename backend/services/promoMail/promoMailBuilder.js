import { SITE_URL, escapeHtml, unsubscribeUrl } from "../campaign/render.js";

/*
  The "thanks for purchasing X, here is an offer" email.

  Order of the mail:
    1. Thanks for purchasing <book>
    2. each offered book: cover, name, coupon code, the amount to pay (and the link)
    3. a short note about Prep Arena + link
    4. reply-to support, unsubscribe

  Plain on purpose: one narrow column, small side padding, ordinary links, a few small
  covers. No big banners or buttons, which keeps it out of Promotions / Spam as far as a
  layout can.
*/

export const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

// Added to every book link so sales from this mail are attributed (see the ?ref= handling on the site).
export const PROMO_REF = process.env.PROMO_MAIL_REF || "lkh";

export const PREP_ARENA_URL = `${SITE_URL}/prep-buddy`;

const FONT = "Arial,Helvetica,sans-serif";

export const moneyExact = (n) => {
  const value = Math.round((Number(n) || 0) * 100) / 100;
  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
};

const shortDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";

/*
  The book's public page, built here (never taken from the admin's browser):
  its stored path on our own site + ?ref=<code>. Anything that is not on our site falls
  back to the books page.
*/
export const bookLink = (book, ref = PROMO_REF) => {
  let url;
  try {
    url = new URL(String(book?.redirectUrl || "").trim() || "/books", SITE_URL);
    if (url.origin !== new URL(SITE_URL).origin) url = new URL("/books", SITE_URL);
  } catch {
    url = new URL("/books", SITE_URL);
  }
  if (ref) url.searchParams.set("ref", ref);
  return url.toString();
};

/* Only https images: mail clients block or warn on the rest. */
export const coverUrl = (book) => {
  const cover = book?.coverImage || book?.coverPageUrl || "";
  const url = typeof cover === "string" ? cover : cover?.secure_url || cover?.url || "";
  return /^https:\/\//i.test(url) ? url : "";
};

const paragraphs = (text) =>
  String(text || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

const P = (inner, extra = "") => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#222222;${extra}">${inner}</p>`;

/*
  offer: priceOffer() result  { lines, total, originalTotal, savings, couponCodes, validTill }
  lines: [{ title, subtitle, price, finalAmount, discountAmount, couponCode, couponNote, coverImage, coverPageUrl, redirectUrl }]
*/
export const buildPromoMail = ({ email, name, purchasedTitle, offer, note = "" }) => {
  const firstName = String(name || "").trim().split(/\s+/)[0] || "there";
  const title = purchasedTitle || "our book";
  const lines = offer.lines;
  const many = lines.length > 1;
  const subject = `Thanks for purchasing ${title}`;
  const preheader = "A small thank-you offer on more books";
  const unsubscribe = unsubscribeUrl(email);

  /* ---------- the offered books ---------- */
  const cards = lines
    .map((line) => {
      const link = bookLink(line);
      const cover = coverUrl(line);
      const discounted = line.discountAmount > 0;

      const price = discounted
        ? `Pay only <b style="font-size:17px;color:#15803d;">${moneyExact(line.finalAmount)}</b> <span style="color:#777777;">(price <s>${moneyExact(line.price)}</s>)</span>`
        : `Price: <b>${moneyExact(line.price)}</b>${line.couponNote ? ` <span style="color:#777777;">(${escapeHtml(line.couponNote)})</span>` : ""}`;

      const code = discounted
        ? `<div style="margin-top:8px;font-size:13px;color:#444444;">Coupon code: <span style="display:inline-block;padding:2px 8px;border:1px dashed #ea580c;border-radius:4px;font-family:Menlo,Consolas,monospace;font-size:14px;font-weight:700;letter-spacing:.06em;color:#c2410c;">${escapeHtml(line.couponCode)}</span></div>`
        : "";

      return `<tr><td style="padding:0 0 12px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e5e5;border-radius:8px;"><tr>
${cover ? `<td width="84" valign="top" style="padding:12px 0 12px 12px;"><a href="${escapeHtml(link)}"><img src="${escapeHtml(cover)}" width="72" alt="${escapeHtml(line.title)}" style="display:block;width:72px;height:auto;border:0;border-radius:4px;"></a></td>` : ""}
<td valign="top" style="padding:12px;font-size:14px;line-height:1.5;color:#222222;">
<a href="${escapeHtml(link)}" style="font-size:16px;font-weight:700;color:#1a56c4;text-decoration:none;">${escapeHtml(line.title)}</a>
${line.subtitle ? `<div style="font-size:13px;color:#666666;margin-top:2px;">${escapeHtml(line.subtitle)}</div>` : ""}
<div style="margin-top:8px;">${price}</div>${code}
<div style="margin-top:8px;"><a href="${escapeHtml(link)}" style="font-size:13px;color:#1a56c4;">View book &rarr;</a></div>
</td></tr></table></td></tr>`;
    })
    .join("");

  const expiry = shortDate(offer.validTill);
  const totalRow = many
    ? `<tr><td style="padding:0 0 4px;font-size:14px;color:#222222;">Total for all ${lines.length} books: <b>${moneyExact(offer.total)}</b>${offer.savings > 0 ? ` <span style="color:#15803d;">(you save ${moneyExact(offer.savings)})</span>` : ""}</td></tr>`
    : "";
  const howRow = offer.couponCodes.length
    ? `<tr><td style="padding:0 0 4px;font-size:13px;line-height:1.5;color:#666666;">Enter the coupon code at checkout${many ? " (each book is bought separately)" : ""}.${expiry ? ` Valid till ${escapeHtml(expiry)}.` : ""}</td></tr>`
    : "";

  const note_ = paragraphs(note).map((p) => P(escapeHtml(p).replace(/\n/g, "<br>"))).join("");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:${FONT};color:#222222;-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"><tr><td align="center" style="padding:0 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;"><tr><td style="padding:22px 0 24px;">

${P(`Hi ${escapeHtml(firstName)},`)}
${P(`Thanks for purchasing <b>${escapeHtml(title)}</b>. We hope it helps your preparation.`)}
${note_}
${P(`As a thank-you, here ${many ? "are some books" : "is a book"} you may like, with a coupon for you:`)}

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 6px;">${cards}${totalRow}${howRow}</table>

<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:18px 0 0;border-top:1px solid #e5e5e5;"><tr><td style="padding:18px 0 0;">
<p style="margin:0 0 8px;font-size:16px;font-weight:700;color:#222222;">Also, meet Prep Arena</p>
${P("Preparing alone is hard to keep up. Prep Arena pairs you with one other serious candidate preparing for similar interviews, so you can practise mock interviews together, chat privately inside the platform and keep each other on track.", "margin-bottom:10px;")}
${P("You appear under an alias, and your phone number and email stay hidden unless you both choose to share them.", "margin-bottom:10px;")}
${P(`<a href="${escapeHtml(PREP_ARENA_URL)}" style="color:#1a56c4;">Take a look at Prep Arena &rarr;</a>`)}
</td></tr></table>

${P("Any questions? Just reply to this email and our team will help you.", "margin-top:6px;")}
<p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#222222;">Thanks,<br>Team Target Trek</p>

<p style="margin:0;font-size:12px;line-height:1.6;color:#777777;">You are receiving this because you purchased ${escapeHtml(title)} from Target Trek.<br>
Questions? <a href="mailto:${SUPPORT_EMAIL}" style="color:#777777;">${SUPPORT_EMAIL}</a> &nbsp;·&nbsp; <a href="${escapeHtml(unsubscribe)}" style="color:#777777;">Unsubscribe</a> from promotional emails</p>

</td></tr></table></td></tr></table>
</body></html>`;

  /* ---------- plain-text version (many mail apps and spam filters read it) ---------- */
  const textBooks = lines
    .map((line) => {
      const discounted = line.discountAmount > 0;
      return [
        line.title,
        discounted
          ? `  Coupon code: ${line.couponCode}\n  Pay only ${moneyExact(line.finalAmount)} (price ${moneyExact(line.price)})`
          : `  Price: ${moneyExact(line.price)}${line.couponNote ? ` (${line.couponNote})` : ""}`,
        `  ${bookLink(line)}`,
      ].join("\n");
    })
    .join("\n\n");

  const text = [
    `Hi ${firstName},`,
    "",
    `Thanks for purchasing ${title}. We hope it helps your preparation.`,
    ...(paragraphs(note).length ? ["", paragraphs(note).join("\n\n")] : []),
    "",
    `As a thank-you, here ${many ? "are some books" : "is a book"} you may like, with a coupon for you:`,
    "",
    textBooks,
    ...(many ? ["", `Total for all ${lines.length} books: ${moneyExact(offer.total)}${offer.savings > 0 ? ` (you save ${moneyExact(offer.savings)})` : ""}`] : []),
    ...(offer.couponCodes.length ? ["", `Enter the coupon code at checkout${many ? " (each book is bought separately)" : ""}.${expiry ? ` Valid till ${expiry}.` : ""}`] : []),
    "",
    "Also, meet Prep Arena",
    "Prep Arena pairs you with one other serious candidate preparing for similar interviews: practise mock interviews together, chat privately inside the platform and keep each other on track. You appear under an alias, and your contact details stay hidden unless you both choose to share them.",
    PREP_ARENA_URL,
    "",
    "Any questions? Just reply to this email and our team will help you.",
    "",
    "Thanks,",
    "Team Target Trek",
    "",
    `You are receiving this because you purchased ${title} from Target Trek.`,
    `Questions: ${SUPPORT_EMAIL}`,
    `Unsubscribe from promotional emails: ${unsubscribe}`,
  ].join("\n");

  return {
    subject,
    html,
    text,
    unsubscribeUrl: unsubscribe,
    // Lets mail apps show their own "Unsubscribe" button (one-click, RFC 8058).
    headers: {
      "List-Unsubscribe": `<${unsubscribe}>, <mailto:${SUPPORT_EMAIL}?subject=unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
};
