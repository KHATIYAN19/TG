// Server-rendered Learn / Books / book landing pages.
//   GET /learn, /books, /book/...   (see vercel.json rewrites)
// Titles, descriptions and FAQs come from api/_seo-data.json, generated from
// the React page components by scripts/gen-seo-data.mjs. Price, cover and
// description come live from the backend product API.
import { createRequire } from "node:module";
import {
  SITE_URL,
  SITE_NAME,
  LOGO_URL,
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

const require = createRequire(import.meta.url);
const SEO = require("./_seo-data.json");

const money = (n, cur = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: cur,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${cur} ${n}`;
  }
};

const li = (items) =>
  items.length ? `<ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>` : "";

const faqHtml = (faqs) =>
  faqs.length
    ? `<section><h2>Frequently asked questions</h2>${faqs
        .map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`)
        .join("")}</section>`
    : "";

const STYLE =
  "<style>a{color:#EA580C}a:hover{color:#C2410C}h1,h2,h3{color:#0B1524}</style>";
const WRAP =
  '<main style="max-width:900px;margin:0 auto;padding:96px 16px 48px;font-family:Inter,system-ui,sans-serif;line-height:1.7">';

const crumbs = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, item], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name,
    item,
  })),
});

const faqSchema = (faqs) =>
  faqs.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: SITE_URL,
  logo: LOGO_URL,
};

export default async function handler(req, res) {
  const route = String(req.query.p || "").replace(/\/+$/, "") || "/";
  const data = SEO[route];
  const template = await getTemplate(req);

  if (!data || !template) {
    if (template) return send(res, 200, template, { cache: "no-store" });
    res.statusCode = 302;
    res.setHeader("Location", "/");
    return res.end();
  }

  const isLearn = route === "/learn";
  const isBooks = route === "/books" || route === "/book";
  const canonicalPath =
    route === "/book" ? "/books" : isLearn ? "/" : route;
  const canonical = canonicalPath === "/" ? `${SITE_URL}/` : `${SITE_URL}${canonicalPath}`;

  let product = null;
  let bookList = [];

  try {
    if (isBooks || isLearn) {
      const r = await fetchApi("/book", { timeout: 20000 });
      bookList = Array.isArray(r.body?.data) ? r.body.data : [];
    } else {
      const r = await fetchApi(
        `/book/product?redirectUrl=${encodeURIComponent(route)}`,
        { timeout: 20000 }
      );
      product = r.body?.success ? r.body.data : null;
    }
  } catch {
    // Backend asleep: still serve the static SEO (title/desc/FAQs) but do not
    // let the CDN cache the price-less version for long.
  }
  const live = isBooks || isLearn ? bookList.length > 0 : Boolean(product);

  const title = data.title;
  const description = data.description;
  const faqs = data.faqs || [];
  const graph = [orgSchema];
  const extraHead = [];
  let image = "";
  let bodyHtml = "";

  /* ----------------------------- LEARN ---------------------------------- */
  if (isLearn) {
    const x = data.extras || {};
    const areas = x.LEARNING_AREAS || [];
    const books = x.FEATURED_BOOKS || [];
    const free = x.FREE_RESOURCES || [];

    graph.push(
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${canonical}#page`,
        name: title,
        description,
        url: canonical,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      },
      crumbs([
        [SITE_NAME, SITE_URL],
        ["Learn", `${SITE_URL}/learn`],
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Target Trek learning resources",
        itemListElement: [...books, ...free].map((it, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: it.title,
          url: `${SITE_URL}${it.path || it.redirectUrl || "/learn"}`,
        })),
      }
    );

    bodyHtml = `${STYLE}${WRAP}
<h1>Learn Software Engineering with ${SITE_NAME}</h1>
<p>${esc(description)}</p>
${areas.length ? `<section><h2>Learning paths</h2>${areas
      .map(
        (a) =>
          `<h3><a href="${esc(a.path)}">${esc(a.title)}</a></h3><p>${esc(a.description)}</p>${li(
            (a.topics || []).map(esc)
          )}`
      )
      .join("")}</section>` : ""}
${books.length ? `<section><h2>Flagship books</h2>${books
      .map(
        (b) =>
          `<h3>${esc(b.title)}</h3><p>${esc(b.subtitle || "")} ${esc(b.description || "")}</p>`
      )
      .join("")}${bookList.length ? li(bookList.map((b) => `<a href="${esc(b.redirectUrl)}">${esc(b.title)}</a>`)) : ""}</section>` : ""}
${free.length ? `<section><h2>Free resources</h2>${li(
      free.map(
        (f) => `<a href="${esc(f.path)}">${esc(f.title)}</a> – ${esc(f.description)}`
      )
    )}</section>` : ""}
<p><a href="/blogs">Read the blog</a> · <a href="/interviews">Interview experiences</a> · <a href="/books">All books</a></p>
${faqHtml(faqs)}
</main>`;
  }

  /* ----------------------------- BOOKS LIST ------------------------------ */
  else if (isBooks) {
    graph.push(
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${canonical}#page`,
        name: title,
        description,
        url: canonical,
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      },
      crumbs([
        ["Home", SITE_URL],
        ["Books", canonical],
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Target Trek ebooks",
        itemListElement: bookList.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.title,
          url: absoluteUrl(b.redirectUrl),
        })),
      }
    );
    image = absoluteUrl(bookList[0]?.coverPageUrl);

    bodyHtml = `${STYLE}${WRAP}
<h1>Target Trek ebooks: System Design, Java and GenAI</h1>
<p>${esc(description)}</p>
<ul>${bookList
      .map(
        (b) => `<li><h2><a href="${esc(b.redirectUrl)}">${esc(b.title)}</a></h2>
<p>${esc(b.subtitle || truncate(b.description, 200))}</p>${
          Number(b.price) > 0
            ? `<p>Price: ${esc(money(b.price, b.currency || "INR"))}</p>`
            : ""
        }</li>`
      )
      .join("")}</ul>
${faqHtml(faqs)}
</main>`;
  }

  /* ----------------------------- BOOK PRODUCT ---------------------------- */
  else {
    const name = product?.title || title.replace(/\s*\|.*$/, "");
    const price = Number(product?.price) || 0;
    const mrp = Number(product?.mrp) || 0;
    const currency = product?.currency || "INR";
    image = absoluteUrl(product?.coverPageUrl);
    const longDesc =
      data.longDescription || truncate(product?.description, 500) || description;
    const validUntil = new Date(Date.now() + 365 * 864e5)
      .toISOString()
      .slice(0, 10);

    graph.push(
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: title,
        description,
        inLanguage: "en-IN",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
      },
      crumbs([
        ["Home", SITE_URL],
        ["Books", `${SITE_URL}/books`],
        [name, canonical],
      ]),
      {
        "@context": "https://schema.org",
        "@type": ["Product", "Book"],
        "@id": `${canonical}#product`,
        name,
        description: longDesc,
        url: canonical,
        bookFormat: "https://schema.org/EBook",
        inLanguage: "en",
        brand: { "@type": "Brand", name: SITE_NAME },
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        isAccessibleForFree: false,
        ...(data.keywords ? { keywords: data.keywords } : {}),
        ...(image ? { image: [image] } : {}),
        ...(price > 0
          ? {
              offers: {
                "@type": "Offer",
                url: canonical,
                price,
                priceCurrency: currency,
                priceValidUntil: validUntil,
                availability: "https://schema.org/InStock",
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
              },
            }
          : {}),
      }
    );

    const cases = data.extras?.caseStudies || [];
    bodyHtml = `${STYLE}${WRAP}
<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/books">Books</a> / <span>${esc(name)}</span></nav>
<article itemscope itemtype="https://schema.org/Product">
<h1 itemprop="name">${esc(name)}</h1>
${product?.subtitle ? `<p><strong>${esc(product.subtitle)}</strong></p>` : ""}
${image ? `<img src="${esc(image)}" alt="${esc(name)} cover" style="max-width:260px;height:auto" itemprop="image" />` : ""}
<p itemprop="description">${esc(longDesc)}</p>
${
  price > 0
    ? `<p>Price: <strong>${esc(money(price, currency))}</strong>${
        mrp > price ? ` <s>${esc(money(mrp, currency))}</s>` : ""
      } · Digital PDF ebook · instant access after purchase</p>`
    : ""
}
${(product?.highlights || []).length ? `<h2>What you get</h2>${li((product.highlights || []).map((h) => esc(typeof h === "string" ? h : h.text || h.title || "")))}` : ""}
${(product?.topics || []).length ? `<h2>Topics covered</h2>${li((product.topics || []).map((t) => esc(typeof t === "string" ? t : t.title || t.name || "")))}` : ""}
${(product?.includedBooks || []).length ? `<h2>Included books</h2>${li((product.includedBooks || []).map((b) => esc(typeof b === "string" ? b : b.title || "")))}` : ""}
${cases.length ? `<h2>${cases.length} case studies</h2>${li(cases.map((c) => `<strong>${esc(c.title)}</strong> – ${esc(c.summary)}`))}` : ""}
</article>
${faqHtml(faqs)}
<p><a href="/books">More books</a> · <a href="/learn">Free learning resources</a> · <a href="/blogs">Blog</a></p>
</main>`;
  }

  const faq = faqSchema(faqs);
  if (faq) graph.push(faq);

  const html = renderPage(template, {
    head: metaTags({
      title,
      description,
      canonical,
      image: image || LOGO_URL,
      imageAlt: title,
      type: !isLearn && !isBooks ? "product" : "website",
      extra: `${data.keywords ? `<meta data-rh="true" name="keywords" content="${esc(data.keywords)}" />\n` : ""}${graph.map(jsonLd).join("\n")}`,
    }),
    bodyHtml,
  });

  // If the backend didn't answer, don't let the CDN pin the price-less page.
  return send(res, 200, html, live ? undefined : { cache: "public, max-age=0, s-maxage=30" });
}
