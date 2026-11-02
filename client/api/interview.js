// Server-rendered interview experience: GET /interview/:slug
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
  mdToHtml,
  fetchApi,
  getTemplate,
  renderPage,
  metaTags,
  send,
} from "./_lib.js";

const STYLE =
  "<style>a{color:#EA580C}a:hover{color:#C2410C}h1,h2,h3,h4{color:#0B1524}pre{overflow:auto;background:#f5f5f4;padding:12px}</style>";

const label = (v = "") =>
  String(v).toLowerCase().replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export default async function handler(req, res) {
  const slug = String(req.query.slug || "").trim().toLowerCase();
  const template = await getTemplate(req);

  if (!template) {
    res.statusCode = 302;
    res.setHeader("Location", "/interviews");
    return res.end();
  }

  let result;
  try {
    // nocount=1: crawler/SSR requests must not inflate the reader view count.
    result = await fetchApi(
      `/api/interview/${encodeURIComponent(slug)}?nocount=1`
    );
  } catch {
    return send(res, 200, template, { cache: "no-store" });
  }

  if (result.status === 404 || !result.body?.success) {
    const status = result.status === 404 ? 404 : 200;
    return send(
      res,
      status,
      renderPage(template, {
        head: metaTags({
          title: `Interview not found | ${SITE_NAME}`,
          description: "This interview experience could not be found.",
          canonical: `${SITE_URL}/interviews`,
          robots: "noindex, follow",
        }),
        bodyHtml: "",
      }),
      { cache: status === 404 ? "public, max-age=0, s-maxage=60" : "no-store" }
    );
  }

  const iv = result.body.data;
  const company = iv.company?.name || "Company";
  const role = iv.role?.title || "Software Engineer";
  const level = iv.role?.level || "";
  const info = iv.interviewInfo || {};
  const canonical = `${SITE_URL}/interview/${iv.slug}`;
  const title =
    iv.seo?.title ||
    `${company} ${role}${level ? ` ${level}` : ""} Interview Experience | ${SITE_NAME}`;
  const summaryText = stripHtml(iv.summaryMarkdown || "");
  const description =
    iv.seo?.description ||
    truncate(summaryText, 160) ||
    `Read a detailed ${company} ${role} interview experience: rounds, questions, preparation and result.`;
  const image = absoluteUrl(iv.seo?.ogImage || iv.company?.logoUrl);
  const published = toIso(iv.publishedAt || iv.createdAt);
  const modified = toIso(iv.updatedAt || iv.publishedAt);
  const keywords = [
    `${company} interview experience`,
    `${company} interview questions`,
    `${company} ${role} interview`,
    ...(iv.topics || []),
    ...(iv.technologies || []),
    ...(iv.tags || []),
  ];
  const author = iv.author?.isAnonymous ? "Target Trek Community" : iv.author?.name || "Target Trek Community";
  const rounds = Array.isArray(iv.rounds) ? iv.rounds : [];

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: String(iv.title || title).slice(0, 110),
    description,
    url: canonical,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    ...(image ? { image: [image] } : {}),
    author: iv.author?.isAnonymous
      ? { "@type": "Organization", name: author }
      : { "@type": "Person", name: author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
    about: { "@type": "Organization", name: company },
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
    keywords: [...new Set(keywords)].join(", "),
    articleSection: "Interview experiences",
    inLanguage: "en-IN",
    isAccessibleForFree: true,
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Interview experiences", item: `${SITE_URL}/interviews` },
      { "@type": "ListItem", position: 3, name: `${company} ${role}`, item: canonical },
    ],
  };

  const facts = [
    ["Company", company],
    ["Role", `${role}${level ? ` (${level})` : ""}`],
    info.location && ["Location", info.location],
    info.interviewMode && ["Mode", label(info.interviewMode)],
    info.difficulty && ["Difficulty", label(info.difficulty)],
    info.result && ["Result", label(info.result)],
    iv.totalRounds || rounds.length ? ["Rounds", iv.totalRounds || rounds.length] : null,
  ].filter(Boolean);

  const roundsHtml = rounds
    .map((r, i) => {
      const qs = (r.questions || [])
        .map(
          (q) =>
            `<li><strong>${esc(q.question)}</strong>${
              q.descriptionMarkdown ? mdToHtml(q.descriptionMarkdown) : ""
            }${q.approachMarkdown ? `<h4>Approach</h4>${mdToHtml(q.approachMarkdown)}` : ""}</li>`
        )
        .join("");
      return `<section><h3>Round ${i + 1}: ${esc(r.title || label(r.type || "Interview"))}</h3>
<p>${[r.type && label(r.type), r.mode && label(r.mode), r.difficulty && label(r.difficulty), r.durationMinutes && `${r.durationMinutes} min`, r.platform].filter(Boolean).map(esc).join(" · ")}</p>
${r.contentMarkdown ? mdToHtml(r.contentMarkdown) : ""}
${qs ? `<h4>Questions asked</h4><ol>${qs}</ol>` : ""}
${r.takeawayMarkdown ? `<h4>Takeaway</h4>${mdToHtml(r.takeawayMarkdown)}` : ""}</section>`;
    })
    .join("\n");

  const section = (h, md) => (md ? `<section><h2>${h}</h2>${mdToHtml(md)}</section>` : "");

  const bodyHtml = `${STYLE}
<main style="max-width:820px;margin:0 auto;padding:96px 16px 48px;font-family:Inter,system-ui,sans-serif;line-height:1.7">
<nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/interviews">Interview experiences</a> / <span>${esc(company)} ${esc(role)}</span></nav>
<article>
<h1>${esc(iv.title || title)}</h1>
<p>${facts.map(([k, v]) => `<strong>${esc(k)}:</strong> ${esc(v)}`).join(" · ")}</p>
${published ? `<p>By ${esc(author)} · <time datetime="${published}">${esc(published.slice(0, 10))}</time></p>` : ""}
${section("Summary", iv.summaryMarkdown)}
${section("Overview", iv.contentMarkdown)}
${roundsHtml ? `<section><h2>Interview rounds</h2>${roundsHtml}</section>` : ""}
${section("Preparation", iv.preparationMarkdown)}
${section("Key takeaways", iv.keyTakeawaysMarkdown)}
${section("Advice", iv.adviceMarkdown)}
${(iv.topics || []).length || (iv.technologies || []).length ? `<p>Topics: ${[...(iv.topics || []), ...(iv.technologies || [])].map(esc).join(", ")}</p>` : ""}
</article>
<p><a href="/interviews">More interview experiences</a> · <a href="/book/system-design/hld">System Design HLD book</a> · <a href="/resources">Free resources</a></p>
</main>`;

  const extra = `<meta data-rh="true" name="author" content="${esc(author)}" />
<meta data-rh="true" name="keywords" content="${esc([...new Set(keywords)].join(", "))}" />
${published ? `<meta data-rh="true" property="article:published_time" content="${published}" />` : ""}
${modified ? `<meta data-rh="true" property="article:modified_time" content="${modified}" />` : ""}
${jsonLd(article)}
${jsonLd(breadcrumb)}`;

  return send(
    res,
    200,
    renderPage(template, {
      head: metaTags({
        title,
        description,
        canonical,
        image,
        imageAlt: `${company} logo`,
        type: "article",
        robots: iv.seo?.robots || undefined,
        extra,
      }),
      bodyHtml,
    })
  );
}
