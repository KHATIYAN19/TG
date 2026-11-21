// GET /sitemap.xml
import { SITE_URL, fetchAllPosts, fetchAllInterviews, fetchApi, send, toIso } from "./_lib.js";

const STATIC_PAGES = [
  "/",
  "/books",
  "/books/bundle-offers",
  "/book/system-design/hld",
  "/book/system-design/lld",
  "/book/database/sql",
  "/book/cloud/gcp",
  "/book/cloud/aws",
  "/book/docker",
  "/book/git",
  "/book/system-design/hld-lld/combo",
  "/book/java-interview-handbook",
  "/book/springboot-interview-handbook",
  "/book/genai/google-adk",
  "/book/genai/mcp",
  "/book/genai/rag",
  "/book/computer-network",
  "/books/operating-systems",
  "/book/all-books",
  "/book/life-type-combo",
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
  "/mock-interviews",
  "/others/book/how-to-sell-ebook",
  "/privacy-policy",
  "/terms-of-service",
  "/refund-policy",
  "/blogs",
  "/interviews",
  "/prep-buddy",
  "/memories",
  "/memories/birthday",
  "/memories/preview/birthday",
  "/memories/preview/proposal",
  "/memories/preview/anniversary",
  "/memories/preview/sorry",
  "/memories/preview/thanks",
  "/memories/preview/christmas",
  "/resume-review",
  "/resume-review/ats-score-checker",
  "/referral",
];

const xmlEsc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export default async function handler(req, res) {
  // Every source is best-effort: a slow blog API must not take the product URLs out of the sitemap.
  const settle = async (fn) => {
    try {
      return { ok: true, value: await fn() };
    } catch {
      return { ok: false, value: [] };
    }
  };
  const [postsR, interviewsR, projectsR, booksR] = await Promise.all([
    settle(fetchAllPosts),
    settle(fetchAllInterviews),
    settle(async () => {
      const r = await fetchApi("/portfolio/published");
      return r.body?.data || r.body?.items || [];
    }),
    settle(async () => {
      const r = await fetchApi("/book");
      return Array.isArray(r.body?.data) ? r.body.data : [];
    }),
  ]);
  const complete = postsR.ok && interviewsR.ok && projectsR.ok && booksR.ok;

  // cover images per product page (image sitemap: helps the covers rank in Google Images)
  const covers = new Map();
  booksR.value.forEach((b) => {
    if (b.redirectUrl && b.coverPageUrl) covers.set(b.redirectUrl, { loc: b.coverPageUrl, title: b.title });
  });
  const imageTag = (p) => {
    const c = covers.get(p);
    return c ? `<image:image><image:loc>${xmlEsc(c.loc)}</image:loc><image:title>${xmlEsc(c.title || "")}</image:title></image:image>` : "";
  };

  const urls = [
    ...STATIC_PAGES.filter((p) => !(p === "/portfolio" && projectsR.ok && !projectsR.value.length)).map((p) => `<url><loc>${SITE_URL}${p}</loc>${imageTag(p)}</url>`),
    ...postsR.value
      .filter((p) => !p.seo?.noIndex)
      .map((p) => {
        const lastmod = toIso(p.updatedAt || p.publishedAt);
        return `<url><loc>${xmlEsc(`${SITE_URL}/blog/${p.slug}`)}</loc>${
          lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
        }</url>`;
      }),
    ...projectsR.value.map(
      (p) => `<url><loc>${xmlEsc(`${SITE_URL}/portfolio/${p.slug}`)}</loc></url>`
    ),
    ...interviewsR.value.map((it) => {
      const lastmod = toIso(it.updatedAt || it.publishedAt);
      return `<url><loc>${xmlEsc(`${SITE_URL}/interview/${it.slug}`)}</loc>${
        lastmod ? `<lastmod>${lastmod}</lastmod>` : ""
      }</url>`;
    }),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>`;

  return send(res, 200, xml, {
    type: "application/xml; charset=utf-8",
    // a partial sitemap (backend slow) is cached briefly so the full one replaces it soon
    cache: complete
      ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
      : "public, max-age=0, s-maxage=120",
  });
}
