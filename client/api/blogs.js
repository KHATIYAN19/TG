// Server-rendered blog index: GET /blogs  (see vercel.json rewrite)
// Supports the same URLs as the client page so every topic is indexable:
//   /blogs   /blogs?page=2   /blogs?category=system-design   /blogs?tag=java
// Search (?q=) and non-default sorts are noindex to avoid thin duplicates.
import {
  SITE_URL,
  SITE_NAME,
  LOGO_URL,
  esc,
  truncate,
  jsonLd,
  absoluteUrl,
  toIso,
  fetchApi,
  getTemplate,
  renderPage,
  metaTags,
  send,
} from "./_lib.js";

const BLOG_URL = `${SITE_URL}/blogs`;
const titleCase = (s = "") =>
  String(s)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
const slugParam = (v) =>
  String(v || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 _-]/g, "")
    .slice(0, 80);

export default async function handler(req, res) {
  const template = await getTemplate(req);
  if (!template) {
    res.statusCode = 302;
    res.setHeader("Location", "/");
    return res.end();
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const category = slugParam(req.query.category);
  const tag = slugParam(req.query.tag);
  const q = String(req.query.q || "").trim().slice(0, 80);
  const sort = ["latest", "trending", "oldest", "title"].includes(req.query.sort) ? req.query.sort : "latest";

  const qs = new URLSearchParams({ limit: "24", page: String(page), sort });
  if (category) qs.set("category", category);
  if (tag) qs.set("tag", tag);
  if (q) qs.set("search", q);

  let posts = [];
  let pagination = {};
  let categories = [];
  try {
    const [list, cats] = await Promise.all([
      fetchApi(`/blogs?${qs.toString()}`),
      fetchApi("/blogs/meta/categories", { timeout: 8000 }).catch(() => null),
    ]);
    if (!list.ok || !list.body?.success) throw new Error("api");
    posts = list.body.data || [];
    pagination = list.body.pagination || {};
    categories = (cats?.body?.data || []).filter(Boolean);
  } catch {
    return send(res, 200, template, { cache: "no-store" });
  }

  const catName = titleCase(category);
  const base = category
    ? `${BLOG_URL}?category=${encodeURIComponent(category)}`
    : tag
      ? `${BLOG_URL}?tag=${encodeURIComponent(tag)}`
      : BLOG_URL;
  const pageUrl = (n) => (n <= 1 ? base : `${base}${base.includes("?") ? "&" : "?"}page=${n}`);
  const canonical = pageUrl(page);
  const noindex = Boolean(q) || sort !== "latest" || (page > 1 && posts.length === 0);

  const title = category
    ? `${catName} Articles and Guides | ${SITE_NAME} Blog`
    : tag
      ? `#${tag} Articles | ${SITE_NAME} Blog`
      : "Software Engineering, System Design and Interview Prep Blog | Target Trek";
  const description = category
    ? `Practical ${catName} articles from ${SITE_NAME}: clear explanations, real examples and interview-focused takeaways for software engineers.`
    : "Practical articles on system design, backend engineering, Java, GenAI, databases and interview preparation. Clear explanations, real examples and takeaways you can use in your next interview.";

  const blog = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BLOG_URL}#blog`,
    name: `${SITE_NAME} Blog`,
    url: BLOG_URL,
    description,
    inLanguage: "en",
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: LOGO_URL } },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: String(p.title).slice(0, 110),
      url: `${SITE_URL}/blog/${p.slug}`,
      ...(toIso(p.publishedAt) ? { datePublished: toIso(p.publishedAt) } : {}),
      ...(toIso(p.updatedAt) ? { dateModified: toIso(p.updatedAt) } : {}),
      author: { "@type": "Person", name: p.author || SITE_NAME },
      ...(p.imageUrl ? { image: absoluteUrl(p.imageUrl) } : {}),
      articleSection: titleCase(p.category),
      description: truncate(p.excerpt, 200),
    })),
  };

  const collection = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    url: canonical,
    description,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    ...(category ? { about: { "@type": "Thing", name: catName } } : {}),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: (page - 1) * 24 + i + 1,
        url: `${SITE_URL}/blog/${p.slug}`,
        name: p.title,
      })),
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: BLOG_URL },
      ...(category ? [{ "@type": "ListItem", position: 3, name: catName, item: base }] : []),
    ],
  };

  const day = (d) => {
    const iso = toIso(d);
    return iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
  };

  const bodyHtml = `
<style>
.ssr-bl{max-width:960px;margin:0 auto;padding:96px 16px 48px;font-family:Manrope,system-ui,sans-serif;line-height:1.7;color:#24342f;background:#f6f8f7}
.ssr-bl a{color:#0f766e}.ssr-bl h1,.ssr-bl h2{color:#0c1a17;line-height:1.2}
.ssr-bl ul{padding-left:1.1rem}.ssr-bl li{margin:0 0 18px}
</style>
<main class="ssr-bl">
  <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blogs">Blog</a>${category ? ` / <span>${esc(catName)}</span>` : ""}</nav>
  <h1>${esc(category ? `${catName} articles` : tag ? `#${tag} articles` : `${SITE_NAME} Blog`)}</h1>
  <p>${esc(description)}</p>
  ${categories.length ? `<nav aria-label="Topics"><strong>Topics:</strong> ${categories.map((c) => `<a href="/blogs?category=${esc(encodeURIComponent(c))}">${esc(titleCase(c))}</a>`).join(" · ")}</nav>` : ""}
  <ul>
    ${posts
      .map(
        (p) => `<li>
      <h2><a href="/blog/${esc(p.slug)}">${esc(p.title)}</a></h2>
      <p>${esc(truncate(p.excerpt, 220))}</p>
      <small>${esc(titleCase(p.category))} · ${esc(p.author || "")}${day(p.publishedAt) ? ` · <time datetime="${toIso(p.publishedAt)}">${esc(day(p.publishedAt))}</time>` : ""} · ${p.readingTimeMinutes || 1} min read</small>
    </li>`
      )
      .join("\n")}
  </ul>
  <nav aria-label="Pagination">
    ${page > 1 ? `<a rel="prev" href="${esc(pageUrl(page - 1).replace(SITE_URL, ""))}">Previous</a>` : ""}
    ${pagination.hasNextPage ? `<a rel="next" href="${esc(pageUrl(page + 1).replace(SITE_URL, ""))}">Next</a>` : ""}
  </nav>
</main>`;

  const html = renderPage(template, {
    head: metaTags({
      title,
      description,
      canonical,
      image: absoluteUrl(posts[0]?.imageUrl),
      robots: noindex ? "noindex, follow" : undefined,
      extra: `<link data-rh="true" rel="alternate" type="application/rss+xml" title="${SITE_NAME} Blog" href="${SITE_URL}/rss.xml" />
${page > 1 ? `<link data-rh="true" rel="prev" href="${esc(pageUrl(page - 1))}" />` : ""}
${pagination.hasNextPage ? `<link data-rh="true" rel="next" href="${esc(pageUrl(page + 1))}" />` : ""}
${jsonLd(blog)}
${jsonLd(collection)}
${jsonLd(breadcrumb)}`,
    }),
    bodyHtml,
  });

  return send(res, 200, html);
}
