import { BACKEND_URL, FRONTEND_URL } from "../../config/urls.js";
import crypto from "node:crypto";

/*
  Template rendering for campaign emails.

    {{name}}            HTML-escaped value
    {{{products}}}      trusted HTML block (built by this module)

  Variables available in every template:
    name, firstName, email, siteUrl, headline, couponCode, couponDiscount,
    couponExpiry, ctaText, ctaUrl, purchasedBooks, unsubscribeUrl
  Blocks:
    {{{message}}}  admin message (line breaks kept)   {{{coupon}}}  coupon box
    {{{button}}}   call-to-action button              {{{products}}} featured books
*/

export const SITE_URL = (process.env.PUBLIC_SITE_URL || FRONTEND_URL).replace(/\/$/, "");

export const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const htmlToText = (html = "") =>
  String(html)
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, label) =>
      `${label.replace(/<[^>]+>/g, "").trim()} (${href})`)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/* ---------------- unsubscribe links ---------------- */

const secret = () => process.env.UNSUBSCRIBE_SECRET || process.env.JWT_SECRET || "targettrek-unsubscribe";

export const unsubscribeToken = (email) =>
  crypto.createHmac("sha256", secret()).update(String(email).toLowerCase()).digest("hex").slice(0, 32);

export const verifyUnsubscribeToken = (email, token) => {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(String(token || ""));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
};

export const unsubscribeUrl = (email, campaignId = "") => {
  const base = BACKEND_URL;
  const query = new URLSearchParams({ e: email, t: unsubscribeToken(email), ...(campaignId ? { c: String(campaignId) } : {}) });
  return `${base}/api/mail/unsubscribe?${query}`;
};

/* ---------------- building blocks ---------------- */

const money = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

const safeUrl = (url, fallback = SITE_URL) => {
  const value = String(url || "").trim();
  return /^https?:\/\//i.test(value) ? value : fallback;
};

export const messageBlock = (text) =>
  String(text || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#44403c;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

export const buttonBlock = (text, url) =>
  text && url
    ? `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:22px 0;"><tr><td style="border-radius:10px;background:#ea580c;"><a href="${escapeHtml(safeUrl(url))}" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">${escapeHtml(text)}</a></td></tr></table>`
    : "";

export const couponBlock = ({ code, discount, expiry }) =>
  code
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:20px 0;"><tr><td align="center" style="border:2px dashed #ea580c;border-radius:12px;background:#fff7ed;padding:18px;">
<div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#9a3412;font-weight:700;">${escapeHtml(discount || "Your exclusive coupon")}</div>
<div style="margin:8px 0;font-size:28px;font-weight:800;letter-spacing:.08em;color:#c2410c;font-family:Menlo,Consolas,monospace;">${escapeHtml(code)}</div>
<div style="font-size:12px;color:#78716c;">${expiry ? `Valid till ${escapeHtml(expiry)} · ` : ""}Apply at checkout</div>
</td></tr></table>`
    : "";

export const productsBlock = (books, linkUrl) =>
  books.length
    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:18px 0;">${books
        .map((b) => {
          const price = Number(b.price) || 0;
          const mrp = Number(b.mrp) || 0;
          const off = mrp > price && price > 0 ? Math.round(((mrp - price) / mrp) * 100) : 0;
          return `<tr><td style="padding:0 0 12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #e7e5e4;border-radius:12px;"><tr>
${b.coverPageUrl ? `<td width="92" style="padding:12px;"><img src="${escapeHtml(safeUrl(b.coverPageUrl, ""))}" width="68" alt="" style="display:block;border-radius:6px;border:0;"></td>` : ""}
<td style="padding:12px;">
<div style="font-size:15px;font-weight:700;color:#1c1917;">${escapeHtml(b.title)}</div>
${b.subtitle ? `<div style="font-size:13px;color:#78716c;margin-top:2px;">${escapeHtml(b.subtitle)}</div>` : ""}
<div style="margin-top:6px;font-size:15px;font-weight:700;color:#c2410c;">${money(price)}${mrp > price ? ` <span style="font-size:12px;font-weight:400;color:#a8a29e;text-decoration:line-through;">${money(mrp)}</span>` : ""}${off ? ` <span style="font-size:12px;color:#15803d;">${off}% off</span>` : ""}</div>
</td>
<td align="right" style="padding:12px;"><a href="${escapeHtml(safeUrl(linkUrl))}" style="display:inline-block;padding:8px 14px;border-radius:8px;background:#1c1917;color:#ffffff;font-size:13px;font-weight:600;text-decoration:none;">View</a></td>
</tr></table></td></tr>`;
        })
        .join("")}</table>`
    : "";

/* "A", "A and B", "A, B and C" */
export const joinTitles = (titles = [], fallback = "our Target Trek book") => {
  const list = titles.filter(Boolean).slice(0, 3);
  if (!list.length) return fallback;
  if (list.length === 1) return list[0];
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
};

/* ---------------- main renderer ---------------- */

export const renderString = (template, vars = {}, blocks = {}) =>
  String(template || "")
    .replace(/\{\{\{\s*([\w]+)\s*\}\}\}/g, (_, key) => (key in blocks ? blocks[key] : ""))
    .replace(/\{\{\s*([\w]+)\s*\}\}/g, (_, key) => escapeHtml(vars[key] ?? ""));

/*
  campaign : MarketingCampaign (lean)
  recipient: { email, name, books: [titles] }
  context  : { featuredBooks: [Book], coupon: Coupon|null }
*/
export const renderCampaignEmail = (campaign, recipient, context = {}) => {
  const content = campaign.content || {};
  const email = recipient.email;
  const firstName = String(recipient.name || "").trim().split(/\s+/)[0] || "there";
  const coupon = context.coupon || null;

  const couponCode = String(content.couponCode || "").toUpperCase();
  const couponDiscount = coupon
    ? coupon.discountType === "PERCENTAGE"
      ? `${coupon.discountValue}% OFF`
      : `${money(coupon.discountValue)} OFF`
    : "";
  const couponExpiry = coupon?.validTill
    ? new Date(coupon.validTill).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "";

  const ctaUrl = safeUrl(content.ctaUrl, `${SITE_URL}/books`);
  const unsubscribe = unsubscribeUrl(email, campaign._id);

  const vars = {
    name: recipient.name || "there",
    firstName,
    email,
    siteUrl: SITE_URL,
    headline: content.headline || "",
    couponCode,
    couponDiscount,
    couponExpiry,
    ctaText: content.ctaText || "",
    ctaUrl,
    purchasedBooks: joinTitles(recipient.books),
    unsubscribeUrl: unsubscribe,
    preheader: campaign.preheader || "",
  };

  const blocks = {
    message: messageBlock(content.body),
    coupon: couponBlock({ code: couponCode, discount: couponDiscount, expiry: couponExpiry }),
    button: buttonBlock(content.ctaText, ctaUrl),
    products: productsBlock(context.featuredBooks || [], ctaUrl),
  };

  const html = renderString(campaign.html, vars, blocks);
  // The subject is plain text, so no HTML escaping (and no line breaks).
  const subject = String(campaign.subject || "")
    .replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => String(vars[key] ?? ""))
    .replace(/\s+/g, " ")
    .trim();

  return { subject, html, text: htmlToText(html), unsubscribeUrl: unsubscribe };
};

// Sample data for previews in the admin UI.
export const SAMPLE_RECIPIENT = { email: "student@example.com", name: "Aarav Sharma", books: ["System Design HLD Handbook"] };
