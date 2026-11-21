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
  SAME_AS,
  esc,
  truncate,
  jsonLd,
  absoluteUrl,
  fetchApi,
  getTemplate,
  getRouteAssets,
  assetLinkTags,
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
  sameAs: SAME_AS,
};

/* pages that sell more than one book (e.g. /book/docker): each book's contents */
const multiBookHtml = (x = {}) => {
  const out = [];
  if (x.HANDBOOK) {
    const h = x.HANDBOOK;
    let n = 0;
    out.push(`<h2>${esc(h.title)}${h.pages ? ` (${esc(h.pages)} pages)` : ""}</h2><p>${esc(h.tagline)}</p>${li((h.includes || []).map(esc))}`);
    /* the short, quotable answer (e.g. /book/cloud/aws) */
    if (x.QUICK_ANSWER) out.push(`<h2>What is ${esc(h.title)}?</h2><p>${esc(x.QUICK_ANSWER)}</p>`);
    if (x.PARTS_RAW?.length && typeof x.PARTS_RAW[0]?.chapters?.[0] !== "string") out.push("<h2>Table of contents</h2>");
    (x.PARTS_RAW || []).forEach((part) => {
      /* chapters are plain titles (e.g. /book/docker) or { n?, title, topics? } (e.g. /book/cloud/gcp) */
      const label = /^\d+$/.test(String(part.number)) ? `Part ${esc(Number(part.number))}: ${esc(part.title)}` : esc(part.title);
      out.push(`<h3>${label}</h3>${part.summary ? `<p>${esc(part.summary)}</p>` : ""}${li((part.chapters || []).map((c) => {
        if (typeof c === "string") { n += 1; return `Chapter ${n}: ${esc(c)}`; }
        const topics = (c.topics || []).length ? ` – ${esc(c.topics.join(", "))}` : "";
        return `${c.n ? `${esc(c.n)} ` : ""}${esc(c.title)}${topics}`;
      }))}`);
    });
    /* books without parts (e.g. /book/git): a flat chapter list of { title, detail } */
    if (Array.isArray(x.CHAPTERS_RAW) && x.CHAPTERS_RAW.length) {
      out.push(`<h3>Chapters</h3>${li(x.CHAPTERS_RAW.map((c, i) => `Chapter ${i + 1}: ${esc(c.title)}${c.detail ? ` – ${esc(c.detail)}` : ""}`))}`);
    }
    if (x.APPENDIX) out.push(`<p>${esc(x.APPENDIX.title)} – ${esc(x.APPENDIX.detail)}</p>`);
  }
  /* "which service should I use?" lists and reference designs (e.g. /book/cloud/aws) */
  if (Array.isArray(x.PICKER) && x.PICKER.length) {
    out.push(`<h2>Which service should you use?</h2>${li(x.PICKER.map((p) => `<strong>${esc(p.need)}: ${esc(p.pick)}</strong> – ${esc(p.why)} ${esc(p.alt)} (${esc(p.where)})`))}`);
  }
  if (Array.isArray(x.REF_ARCHS) && x.REF_ARCHS.length) {
    out.push(`<h2>Reference architectures</h2>${li(x.REF_ARCHS.map((r) => `<strong>${esc(r.title)}</strong> – ${esc(r.copy)} ${esc((r.flow || []).join(" → "))}`))}`);
  }
  if (Array.isArray(x.LABS) && x.LABS.length) {
    out.push(`<h2>Hands-on labs</h2>${li(x.LABS.map((l, i) => `Lab ${i + 1}: <strong>${esc(l.title)}</strong> – ${esc(l.copy)}`))}`);
  }
  if (x.CHEATSHEET) {
    const c = x.CHEATSHEET;
    out.push(`<h2>${esc(c.title)} (${esc(c.pages)} pages)</h2><p>${esc(c.tagline)}</p>`);
    const secs = x.cheatSheetSections || [];
    if (secs.length) out.push(li(secs.map((s, i) => `${i + 1}. ${esc(s.title)}${s.detail ? ` – ${esc(s.detail)}` : ""}`)));
  }
  return out.join("\n");
};

/* ------------------------------------------------------------------ prerendered book pages
   scripts/prerender.mjs renders every book page with React at build time (full contents, FAQs, schema).
   Here we only bring the price up to date, so a price change in the admin reaches search results without
   a redeploy. Falls back to the hand-built page below when the file is missing. */
async function getPrerendered(req, route) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  try {
    const r = await fetch(`${proto}://${host}/prerendered${route}.html`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const html = await r.text();
    // a failed prerender writes the bare shell: no <h1>, so use the fallback instead
    return /<div id="root">[\s\S]*?<h1[\s>]/i.test(html) ? html : null;
  } catch {
    return null;
  }
}

const isProduct = (t) => (Array.isArray(t) ? t.includes("Product") : t === "Product");

/* every Product node that describes this page gets the live price */
function patchOffers(node, canonical, live) {
  if (Array.isArray(node)) return node.forEach((n) => patchOffers(n, canonical, live));
  if (!node || typeof node !== "object") return;
  if (isProduct(node["@type"])) {
    const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
    const own = node.url === canonical || offer?.url === canonical || String(node["@id"] || "").startsWith(`${canonical}#`);
    if (own) {
      if (offer) {
        offer.price = live.price;
        offer.priceCurrency = live.currency;
      } else {
        node.offers = {
          "@type": "Offer", url: canonical, price: live.price, priceCurrency: live.currency,
          priceValidUntil: `${new Date().getFullYear() + 1}-12-31`, availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
        };
      }
      if (live.image && !node.image) node.image = [live.image];
    }
  }
  Object.values(node).forEach((v) => v && typeof v === "object" && patchOffers(v, canonical, live));
}

function withLivePrice(html, product, canonical) {
  const price = Number(product?.price) || 0;
  if (price <= 0) return html;
  const live = { price, currency: product.currency || "INR", image: absoluteUrl(product.coverPageUrl) };
  return html
    .replace(/(<script[^>]*application\/ld\+json[^>]*>)([\s\S]*?)(<\/script>)/gi, (all, open, json, close) => {
      try {
        const data = JSON.parse(json);
        patchOffers(data, canonical, live);
        return `${open}${JSON.stringify(data).replace(/</g, "\\u003c")}${close}`;
      } catch {
        return all;
      }
    })
    .replace(/(<meta[^>]*property="product:price:amount"[^>]*content=")[^"]*/i, `$1${price}`)
    .replace(/(<meta[^>]*property="product:price:currency"[^>]*content=")[^"]*/i, `$1${esc(live.currency)}`);
}

export default async function handler(req, res) {
  const route = String(req.query.p || "").replace(/\/+$/, "") || "/";
  const data = SEO[route];

  if (route !== "/learn") {
    const file = route === "/book" ? "/books" : route;
    const pre = await getPrerendered(req, file);
    if (pre) {
      let product = null;
      if (file !== "/books") {
        try {
          const r = await fetchApi(`/book/product?redirectUrl=${encodeURIComponent(file)}`, { timeout: 15000 });
          product = r.body?.success ? r.body.data : null;
        } catch {
          /* backend asleep: the build-time price stays */
        }
      }
      const canonical = `${SITE_URL}${file}`;
      return send(res, 200, product ? withLivePrice(pre, product, canonical) : pre, {
        cache: product || file === "/books"
          ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=604800"
          : "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
      });
    }
  }

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
${multiBookHtml(data.extras)}
</article>
${faqHtml(faqs)}
<p><a href="/books">More books</a> · <a href="/learn">Free learning resources</a> · <a href="/blogs">Blog</a></p>
</main>`;
  }

  const faq = faqSchema(faqs);
  if (faq) graph.push(faq);

  const routeAssets = await getRouteAssets(req);
  const html = renderPage(template, {
    assetLinks: assetLinkTags(routeAssets, route),
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
  // Live pages: prices change rarely, so keep them at the CDN for an hour (and serve stale for a week while it
  // refreshes in the background) instead of re-hitting the backend every 5 minutes per edge region.
  return send(res, 200, html, {
    cache: live
      ? "public, max-age=0, s-maxage=3600, stale-while-revalidate=604800"
      : "public, max-age=0, s-maxage=30",
  });
}
