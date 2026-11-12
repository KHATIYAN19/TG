import sanitizeHtml from "sanitize-html";

export const SUPPORT_REPLY_TO = "supporttargettrek@gmail.com";

const esc = (v = "") =>
  String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/* Only simple, email-safe formatting survives. */
export const sanitizeReplyHtml = (html = "") =>
  sanitizeHtml(String(html), {
    allowedTags: [
      "p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li",
      "a", "h2", "h3", "blockquote", "hr", "span", "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      "*": ["style"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedStyles: {
      "*": {
        color: [/^#[0-9a-f]{3,8}$/i],
        "font-weight": [/^(bold|normal|[1-9]00)$/],
        "text-align": [/^(left|center|right)$/],
      },
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener noreferrer",
        style: "color:#2563eb;text-decoration:underline;",
      }),
    },
  }).trim();

export const htmlToText = (html = "") =>
  sanitizeHtml(String(html).replace(/<\/(p|div|li|h2|h3|blockquote)>/gi, "\n").replace(/<br\s*\/?>/gi, "\n"), {
    allowedTags: [],
    allowedAttributes: {},
  })
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/*
  Branded, table-based layout (email clients ignore most modern CSS),
  with all styles inline. Used for BOTH the admin preview and the real send,
  so what the admin sees is exactly what the customer gets.
*/
export const buildReplyEmail = ({ subject = "", bodyHtml = "", name = "" } = {}) => {
  const body = sanitizeReplyHtml(bodyHtml);
  const styled = body
    .replace(/<p>/g, '<p style="margin:0 0 16px;font-size:16px;line-height:1.7;color:#334155;">')
    .replace(/<ul>/g, '<ul style="margin:0 0 16px;padding-left:22px;color:#334155;font-size:16px;line-height:1.7;">')
    .replace(/<ol>/g, '<ol style="margin:0 0 16px;padding-left:22px;color:#334155;font-size:16px;line-height:1.7;">')
    .replace(/<h2>/g, '<h2 style="margin:24px 0 10px;font-size:20px;color:#0f172a;">')
    .replace(/<h3>/g, '<h3 style="margin:20px 0 8px;font-size:17px;color:#0f172a;">')
    .replace(/<blockquote>/g, '<blockquote style="margin:0 0 16px;padding:10px 16px;border-left:4px solid #6366f1;background:#f1f5f9;color:#475569;">');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 12px;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(15,23,42,0.08);">
    <tr><td style="background:#4f46e5;background-image:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 32px;">
      <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">Target Trek</div>
      <div style="font-size:13px;color:#e0e7ff;margin-top:4px;">Support Team</div>
    </td></tr>
    <tr><td style="padding:32px;">
      ${styled || '<p style="margin:0;color:#94a3b8;">Your message will appear here.</p>'}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;border-top:1px solid #e2e8f0;width:100%;">
        <tr><td style="padding-top:20px;font-size:15px;color:#334155;line-height:1.6;">
          Warm regards,<br><strong style="color:#0f172a;">Team Target Trek</strong><br>
          <a href="mailto:${SUPPORT_REPLY_TO}" style="color:#4f46e5;text-decoration:none;">${SUPPORT_REPLY_TO}</a>
        </td></tr>
      </table>
    </td></tr>
    <tr><td style="background:#0f172a;padding:20px 32px;text-align:center;font-size:12px;line-height:1.6;color:#94a3b8;">
      You are receiving this because you contacted Target Trek${name ? ` (${esc(name)})` : ""}.<br>
      Just reply to this email and our support team will get back to you.<br>
      &copy; ${new Date().getFullYear()} Target Trek. All rights reserved.
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
};
