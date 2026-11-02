// Server-rendered interview feed: GET /interviews
import {
  SITE_URL,
  SITE_NAME,
  esc,
  truncate,
  jsonLd,
  fetchApi,
  getTemplate,
  renderPage,
  metaTags,
  send,
} from "./_lib.js";

const TITLE = "Software Engineering Interview Experiences | Target Trek";
const DESC =
  "Real interview experiences from engineers at top companies: DSA, LLD, HLD, backend, GenAI and system design rounds, questions and results.";

export default async function handler(req, res) {
  const template = await getTemplate(req);
  if (!template) {
    res.statusCode = 302;
    res.setHeader("Location", "/");
    return res.end();
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  let items = [];
  let pagination = {};
  try {
    const r = await fetchApi(`/api/interview?page=${page}`);
    if (!r.ok || !r.body?.success) throw new Error("api");
    items = r.body.data || [];
    pagination = r.body.pagination || {};
  } catch {
    return send(res, 200, template, { cache: "no-store" });
  }

  const canonical = `${SITE_URL}/interviews`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: TITLE,
    description: DESC,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: pagination.total || items.length,
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/interview/${it.slug}`,
        name: it.title,
      })),
    },
  };

  const bodyHtml = `<style>a{color:#EA580C}a:hover{color:#C2410C}h1,h2,h3{color:#0B1524}</style>
<main style="max-width:900px;margin:0 auto;padding:96px 16px 48px;font-family:Inter,system-ui,sans-serif;line-height:1.7">
<h1>Software Engineering Interview Experiences</h1>
<p>${esc(DESC)}</p>
<ul>${items
    .map(
      (it) => `<li><h2><a href="/interview/${esc(it.slug)}">${esc(it.title)}</a></h2>
<p>${esc([it.company?.name, it.role?.title, it.interviewInfo?.difficulty && `Difficulty: ${it.interviewInfo.difficulty}`, it.interviewInfo?.result && `Result: ${it.interviewInfo.result}`].filter(Boolean).join(" · "))}</p>
<p>${esc(truncate(it.summaryMarkdown || "", 200))}</p></li>`
    )
    .join("\n")}</ul>
<nav aria-label="Pagination">
${page > 1 ? `<a rel="prev" href="${page === 2 ? "/interviews" : `/interviews?page=${page - 1}`}">Previous</a>` : ""}
${pagination.hasNextPage ? `<a rel="next" href="/interviews?page=${page + 1}">Next</a>` : ""}
</nav>
</main>`;

  return send(
    res,
    200,
    renderPage(template, {
      head: metaTags({
        title: TITLE,
        description: DESC,
        canonical,
        extra: jsonLd(schema),
      }),
      bodyHtml,
    })
  );
}
