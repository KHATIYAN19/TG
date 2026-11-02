// Server-rendered blog article: GET /blog/:slug  (see vercel.json rewrite)
import {
  SITE_URL,
  SITE_NAME,
  LOGO_URL,
  esc,
  stripHtml,
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

// Q&A pairs → FAQPage schema. Only picks up "Question?" headings followed by
// paragraphs, so it never invents content.
function extractFaqs(html = "") {
  const faqs = [];
  const re =
    /<h[2-4][^>]*>([\s\S]*?\?)\s*<\/h[2-4]>\s*((?:<p[^>]*>[\s\S]*?<\/p>\s*){1,3})/gi;
  let m;
  while ((m = re.exec(html)) && faqs.length < 10) {
    const q = stripHtml(m[1]);
    const a = stripHtml(m[2]);
    if (q.length > 8 && a.length > 20) {
      faqs.push({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      });
    }
  }
  return faqs;
}

export default async function handler(req, res) {
  const slug = String(req.query.slug || "").trim().toLowerCase();
  const template = await getTemplate(req);

  // Can't build the shell → let the client app handle it, but don't cache.
  if (!template) {
    res.statusCode = 302;
    res.setHeader("Location", "/");
    return res.end();
  }

  let result;
  try {
    result = await fetchApi(`/blogs/${encodeURIComponent(slug)}`);
  } catch {
    // Backend asleep/unreachable: serve the plain SPA (client will fetch),
    // and make sure this isn't cached.
    return send(res, 200, template, { cache: "no-store" });
  }

  if (result.status === 404 || !result.body?.success) {
    const status = result.status === 404 ? 404 : 200;
    const html = renderPage(template, {
      head: metaTags({
        title: `Article not found | ${SITE_NAME}`,
        description: "This article could not be found.",
        canonical: `${SITE_URL}/blogs`,
        robots: "noindex, follow",
      }),
      bodyHtml: "",
    });
    return send(res, status, html, {
      cache: status === 404 ? "public, max-age=0, s-maxage=60" : "no-store",
    });
  }

  const post = result.body.data?.post || result.body.data;
  const seo = post.seo || {};
  const canonical = seo.canonicalUrl || `${SITE_URL}/blog/${post.slug}`;
  const title = seo.metaTitle || `${post.title} | ${SITE_NAME}`;
  const description = seo.metaDescription || truncate(post.excerpt, 160);
  const image = absoluteUrl(seo.ogImageUrl || post.imageUrl);
  const published = toIso(post.publishedAt || post.createdAt);
  const modified = toIso(post.updatedAt || post.publishedAt);
  const robots = seo.noIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1";
  const keywords = (seo.keywords?.length ? seo.keywords : post.tags) || [];
  const plain = stripHtml(post.content);
  const wordCount = plain ? plain.split(/\s+/).length : 0;

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: String(post.title).slice(0, 110),
    name: post.title,
    description,
    url: canonical,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    ...(image ? { image: [image] } : {}),
    author: { "@type": "Person", name: post.author || SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    articleSection: post.category,
    keywords: keywords.join(", "),
    ...((post.sources || []).length
      ? { citation: post.sources.map((s) => s.url) }
      : {}),
    wordCount,
    timeRequired: `PT${post.readingTimeMinutes || 1}M`,
    inLanguage: "en",
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blogs", item: `${SITE_URL}/blogs` },
      { "@type": "ListItem", position: 3, name: post.title, item: canonical },
    ],
  };

  // Related posts (same category) for internal linking; best-effort.
  let related = [];
  try {
    const r = await fetchApi(
      `/blogs?category=${encodeURIComponent(post.category)}&limit=6&sort=latest`,
      { timeout: 8000 }
    );
    related = (r.body?.data || []).filter((p) => p.slug !== post.slug).slice(0, 4);
  } catch {
    /* optional */
  }

  const faqs = extractFaqs(post.content);
  const faqSchema = faqs.length
    ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs }
    : null;

  const extra = `
<link data-rh="true" rel="alternate" type="application/rss+xml" title="${SITE_NAME} Blog" href="${SITE_URL}/rss.xml" />
<meta data-rh="true" name="author" content="${esc(post.author)}" />
<meta data-rh="true" name="keywords" content="${esc(keywords.join(", "))}" />
${published ? `<meta data-rh="true" property="article:published_time" content="${published}" />` : ""}
${modified ? `<meta data-rh="true" property="article:modified_time" content="${modified}" />` : ""}
<meta data-rh="true" property="article:section" content="${esc(post.category)}" />
${(post.tags || []).map((t) => `<meta data-rh="true" property="article:tag" content="${esc(t)}" />`).join("\n")}
${jsonLd(blogPosting)}
${jsonLd(breadcrumb)}
${faqSchema ? jsonLd(faqSchema) : ""}`;

  // Pre-rendered article. `post.content` is already sanitised by the backend
  // (sanitize-html allow-list) before it is stored.
  const bodyHtml = `
<style>a{color:#EA580C}a:hover{color:#C2410C}h1,h2,h3{color:#0B1524}</style>
<main style="max-width:820px;margin:0 auto;padding:96px 16px 48px;font-family:Inter,system-ui,sans-serif;line-height:1.7">
  <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/blogs">Blogs</a> / <span>${esc(post.title)}</span></nav>
  <article itemscope itemtype="https://schema.org/BlogPosting">
    <h1 itemprop="headline">${esc(post.title)}</h1>
    <p itemprop="description"><strong>${esc(stripHtml(post.excerpt))}</strong></p>
    <p>By <span itemprop="author">${esc(post.author)}</span>${published ? ` · <time datetime="${published}" itemprop="datePublished">${esc(new Date(published).toISOString().slice(0, 10))}</time>` : ""} · ${post.readingTimeMinutes || 1} min read · ${esc(post.category)}</p>
    ${image ? `<img src="${esc(image)}" alt="${esc(post.altText || post.title)}" style="max-width:100%;height:auto" />` : ""}
    ${(post.toc || []).length >= 3 ? `<nav aria-label="Table of contents"><h2>In this article</h2><ul>${post.toc.map((t) => `<li${t.level === 3 ? ' style="margin-left:1rem"' : ""}><a href="#${esc(t.id)}">${esc(t.text)}</a></li>`).join("")}</ul></nav>` : ""}
    <div itemprop="articleBody">${post.content}</div>
    ${(post.tags || []).length ? `<p>Topics: ${(post.tags || []).map((t) => esc(t)).join(", ")}</p>` : ""}
  </article>
  ${related.length ? `<nav aria-label="Related articles"><h2>Related articles</h2><ul>${related.map((r) => `<li><a href="/blog/${esc(r.slug)}">${esc(r.title)}</a></li>`).join("")}</ul></nav>` : ""}
</main>`;

  const html = renderPage(template, {
    head: metaTags({
      title,
      description,
      canonical,
      image,
      imageAlt: post.altText,
      type: "article",
      robots,
      extra,
    }),
    bodyHtml,
  });

  return send(res, 200, html);
}
