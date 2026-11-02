// GET /robots.txt
import { SITE_URL, send } from "./_lib.js";

const PRIVATE = [
  "/admin",
  "/dashboard",
  "/campaign",
  "/portfolio-manage",
  "/contact-query",
  "/contact-details/",
  "/employee/",
  "/clients",
  "/interest",
  "/profile",
  "/submit-review/",
  "/blog-manage",
  "/payment/",
  "/ebook/adk/payment/",
  "/set-password",
  "/review/",
  "/mock-interviews/success",
  "/mock-interviews/failed",
  "/mock-interviews/payment-status",
  "/interview/create",
];

export default function handler(req, res) {
  const disallow = PRIVATE.map((p) => `Disallow: ${p}`).join("\n");

  // Explicitly welcome search + answer-engine crawlers.
  const bots = [
    "Googlebot",
    "Bingbot",
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "PerplexityBot",
    "ClaudeBot",
    "Claude-SearchBot",
    "Google-Extended",
    "Applebot",
    "Applebot-Extended",
    "CCBot",
  ]
    .map((b) => `User-agent: ${b}\nAllow: /\n${disallow}\n`)
    .join("\n");

  const txt = `User-agent: *
Allow: /
${disallow}

${bots}
Sitemap: ${SITE_URL}/sitemap.xml
`;
  return send(res, 200, txt, {
    type: "text/plain; charset=utf-8",
    cache: "public, max-age=0, s-maxage=86400",
  });
}
