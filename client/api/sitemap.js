// GET /sitemap.xml
import { SITE_URL, fetchAllPosts, fetchAllInterviews, fetchApi, send, toIso } from "./_lib.js";

const STATIC_PAGES = [
  "/",
  "/books",
  "/book/system-design/hld",
  "/book/system-design/lld",
  "/book/database/sql",
  "/book/cloud/gcp",
  "/book/cloud/aws",
  "/book/system-design/hld-lld/combo",
  "/book/java-interview-handbook",
  "/book/springboot-interview-handbook",
  "/book/genai/google-adk",
  "/book/genai/mcp",
  "/book/genai/rag",
  "/book/computer-network",
  "/resources",
  "/resources/hld",
  "/resources/hld/cache",
  "/resources/hld/load-balancing",
  "/resources/hld/database",
  "/resources/hld/message-queue",
  "/resources/hld/rate-limiting",
  "/resources/hld/api-gateway",
  "/resources/sql",
  "/resources/apis",
  "/about",
  "/contact",
  "/portfolio",
  "/carrers",
  "/mock-interviews",
  "/others/book/how-to-sell-ebook",
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/blogs",
  "/interviews",
  "/prep-buddy",
];

const xmlEsc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default async function handler(req, res) {
  let posts;
  try {
    posts = await fetchAllPosts();
  } catch {
    return send(res, 503, "Sitemap temporarily unavailable", {
      type: "text/plain; charset=utf-8",
      cache: "no-store",
    });
  }

  // Interview experiences are best-effort: a failure must not drop the rest.
  let interviews = [];
  try {
    interviews = await fetchAllInterviews();
  } catch {
    /* skip */
  }

  let projects = [];
  try {
    const r = await fetchApi("/portfolio/published");
    projects = r.body?.data || r.body?.items || [];
  } catch {
    /* skip */
  }

  const urls = [
    ...STATIC_PAGES.map((p) => `<url><loc>${SITE_URL}${p}</loc></url>`),
    ...posts
      .filter((p) => !p.seo?.noIndex)
      .map((p) => {
        const lastmod = toIso(p.updatedAt || p.publishedAt);
        return `<url><loc>${xmlEsc(`${SITE_URL}/blog/${p.slug}`)}</loc>${
          lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
        }</url>`;
      }),
    ...projects.map(
      (p) => `<url><loc>${xmlEsc(`${SITE_URL}/portfolio/${p.slug}`)}</loc></url>`
    ),
    ...interviews.map((it) => {
      const lastmod = toIso(it.updatedAt || it.publishedAt);
      return `<url><loc>${xmlEsc(`${SITE_URL}/interview/${it.slug}`)}</loc>${
        lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
      }</url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return send(res, 200, xml, {
    type: "application/xml; charset=utf-8",
    cache: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  });
}
