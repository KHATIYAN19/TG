// Server-rendered portfolio: GET /portfolio and /portfolio/:slug
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

const WRAP =
  '<style>a{color:#EA580C}a:hover{color:#C2410C}h1,h2,h3{color:#0B1524}</style><main style="max-width:900px;margin:0 auto;padding:96px 16px 48px;font-family:Inter,system-ui,sans-serif;line-height:1.7">';

export default async function handler(req, res) {
  const slug = String(req.query.slug || "").trim().toLowerCase();
  const template = await getTemplate(req);
  if (!template) {
    res.statusCode = 302;
    res.setHeader("Location", "/");
    return res.end();
  }

  /* ---------------------------- DETAIL ---------------------------------- */
  if (slug) {
    let r;
    try {
      r = await fetchApi(`/portfolio/${encodeURIComponent(slug)}`);
    } catch {
      return send(res, 200, template, { cache: "no-store" });
    }
    const item = r.body?.data;
    if (r.status === 404 || !r.body?.success || !item || item.isPublished === false) {
      const status = r.status === 404 || item?.isPublished === false ? 404 : 200;
      return send(
        res,
        status,
        renderPage(template, {
          head: metaTags({
            title: `Project not found | ${SITE_NAME}`,
            description: "This portfolio project could not be found.",
            canonical: `${SITE_URL}/portfolio`,
            robots: "noindex, follow",
          }),
          bodyHtml: "",
        }),
        { cache: status === 404 ? "public, max-age=0, s-maxage=60" : "no-store" }
      );
    }

    const canonical = `${SITE_URL}/portfolio/${item.slug}`;
    const title = `${item.title} - ${SITE_NAME}`;
    const description = truncate(item.description, 160);
    const image = absoluteUrl(item.imageUrl);
    const created = toIso(item.createdAt);

    const creative = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: item.title,
      description,
      url: canonical,
      ...(image ? { image: [image] } : {}),
      about: item.category,
      keywords: (item.tags || []).join(", "),
      creator: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: LOGO_URL },
      ...(created ? { dateCreated: created } : {}),
    };
    const crumbs = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Portfolio", item: `${SITE_URL}/portfolio` },
        { "@type": "ListItem", position: 3, name: item.title, item: canonical },
      ],
    };

    const bodyHtml = `${WRAP}
<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/portfolio">Portfolio</a> / <span>${esc(item.title)}</span></nav>
<article>
<h1>${esc(item.title)}</h1>
<p><strong>${esc(item.category)}</strong></p>
${image ? `<img src="${esc(image)}" alt="${esc(item.altText || item.title)}" style="max-width:100%;height:auto" />` : ""}
<p>${esc(item.description)}</p>
${(item.tags || []).length ? `<p>Tags: ${item.tags.map(esc).join(", ")}</p>` : ""}
</article>
<p><a href="/portfolio">More projects</a> · <a href="/contact">Contact us</a></p>
</main>`;

    return send(
      res,
      200,
      renderPage(template, {
        head: metaTags({
          title,
          description,
          canonical,
          image,
          imageAlt: item.altText || item.title,
          type: "article",
          extra: `${jsonLd(creative)}\n${jsonLd(crumbs)}`,
        }),
        bodyHtml,
      })
    );
  }

  /* ----------------------------- LIST ----------------------------------- */
  let items = [];
  try {
    const r = await fetchApi("/portfolio/published");
    if (!r.ok || !r.body?.success) throw new Error("api");
    items = r.body.data || r.body.items || [];
  } catch {
    return send(res, 200, template, { cache: "no-store" });
  }

  const canonical = `${SITE_URL}/portfolio`;
  const title = "Our Portfolio: Web, GenAI & Marketing Projects | Target Trek";
  const description =
    "Explore Target Trek projects across web development, GenAI, social media marketing and content marketing, with the results delivered for clients.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonical,
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/portfolio/${it.slug}`,
        name: it.title,
      })),
    },
  };

  const bodyHtml = `${WRAP}
<h1>Our Portfolio</h1>
<p>${esc(description)}</p>
<ul>${items
    .map(
      (it) => `<li><h2><a href="/portfolio/${esc(it.slug)}">${esc(it.title)}</a></h2>
<p><strong>${esc(it.category)}</strong> – ${esc(truncate(it.description, 180))}</p></li>`
    )
    .join("\n")}</ul>
</main>`;

  return send(
    res,
    200,
    renderPage(template, {
      head: metaTags({
        title,
        description,
        canonical,
        image: absoluteUrl(items[0]?.imageUrl),
        extra: jsonLd(schema),
      }),
      bodyHtml,
    })
  );
}
