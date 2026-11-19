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
  "/referral/app",
  "/resume-review/app",
  "/login",
  "/signup",
  "/resume-review/login",
  "/resume-review/signup",
  "/resume-review/payment-result",
  "/prep-buddy/app",
  "/prep-buddy/signup",
  "/mock-interviews/success",
  "/mock-interviews/failed",
  "/mock-interviews/payment-status",
  "/interview/create",
];

// Memories: every /memories/<code> is someone's personal page (and /memories/app, /login, /payment-result are private), so the whole
// folder is closed to crawlers EXCEPT the public pages below. The longest matching rule wins, so these Allow lines beat the Disallow.
const MEMORIES_PUBLIC = ["/memories/birthday", "/memories/preview/", "/memories/terms", "/memories/privacy", "/memories/refund", "/memories/contact"];

export default function handler(req, res) {
  const disallow = [
    ...PRIVATE.map((p) => `Disallow: ${p}`),
    "Disallow: /memories/",
    ...MEMORIES_PUBLIC.map((p) => `Allow: ${p}`),
  ].join("\n");

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
