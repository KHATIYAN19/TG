// Server-rendered blog index: GET /blogs
import {
  SITE_URL,
  SITE_NAME,
  esc,
  truncate,
  jsonLd,
  absoluteUrl,
  fetchApi,
  getTemplate,
  renderPage,
  metaTags,
  send,
} from "./_lib.js";

export default async function handler(req, res) {
  const template = await getTemplate(req);
  if (!template) {
    res.statusCode = 302;
    res.setHeader("Location", "/");
    return res.end();
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  let posts = [];
  let pagination = {};
  try {
    const { ok, body } = await fetchApi(`/blogs?limit=24&page=${page}&sort=latest`);
    if (!ok || !body?.success) throw new Error("api");
    posts = body.data || [];
    pagination = body.pagination || {};
  } catch {
    return send(res, 200, template, { cache: "no-store" });
  }

  // Client app always canonicalises to /blogs, so keep the server consistent.
  const canonical = `${SITE_URL}/blogs`;
  const title = "Software Engineering & System Design Blog | Target Trek";
  const description =
    "Explore practical software engineering articles covering system design, backend development, Java, GenAI, APIs, databases, scalability and interview preparation.";

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_NAME} Blog`,
    url: canonical,
    description,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  };

  const bodyHtml = `
<style>a{color:#EA580C}a:hover{color:#C2410C}h1,h2,h3{color:#0B1524}</style>
<main style="max-width:900px;margin:0 auto;padding:96px 16px 48px;font-family:Inter,system-ui,sans-serif;line-height:1.7">
  <h1>${SITE_NAME} Blog</h1>
  <p>${esc(description)}</p>
  <ul>
    ${posts
      .map(
        (p) => `<li>
      <h2><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a></h2>
      <p>${esc(truncate(p.excerpt, 200))}</p>
    </li>`
      )
      .join("\n")}
  </ul>
  <nav aria-label="Pagination">
    ${page > 1 ? `<a rel="prev" href="${page === 2 ? "/blogs" : `/blogs?page=${page - 1}`}">Previous</a>` : ""}
    ${pagination.hasNextPage ? `<a rel="next" href="/blogs?page=${page + 1}">Next</a>` : ""}
  </nav>
</main>`;

  const html = renderPage(template, {
    head: metaTags({
      title,
      description,
      canonical,
      image: absoluteUrl(posts[0]?.imageUrl),
      extra: `<link data-rh="true" rel="alternate" type="application/rss+xml" title="${SITE_NAME} Blog" href="${SITE_URL}/rss.xml" />
${jsonLd(collection)}`,
    }),
    bodyHtml,
  });

  return send(res, 200, html);
}
