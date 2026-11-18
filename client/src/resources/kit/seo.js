/*
  Structured data for every /resources guide (JSON-LD).
  Built from the same `guide` object that draws the page, so search engines (SEO), answer engines (AEO) and AI
  assistants (GEO) always read exactly what a visitor sees:
    TechArticle    headline, summary, sections (hasPart), level, reading time, what it teaches
    WebPage        + speakable: the h1 and the one-paragraph answer are what voice assistants read out
    BreadcrumbList Target Trek › Resources › … › this guide
    FAQPage        the FAQ block
    ItemList       the interview questions, each with its answer (Quiz + Question for AI answer cards)
    DefinedTermSet the glossary, so assistants can quote exact definitions
*/
export const SITE = "https://www.targettrek.in";
export const LOGO = "https://i.postimg.cc/13B9k289/target-Trek-logo-2.jpg";
const ORG_ID = `${SITE}/#organization`;

const iso8601Minutes = (m) => `PT${Math.max(1, Math.round(m))}M`;

export function buildGuideSchema(g) {
  const url = `${SITE}${g.path}`;
  const org = { "@type": "Organization", "@id": ORG_ID, name: "Target Trek", url: SITE, logo: LOGO, email: "supporttargettrek@gmail.com" };
  const crumbs = [["Target Trek", "/"], ...g.crumbs];

  const graph = [
    org,
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: g.seoTitle,
      description: g.description,
      inLanguage: "en-IN",
      isPartOf: { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: "Target Trek" },
      breadcrumb: { "@id": `${url}#breadcrumb` },
      mainEntity: { "@id": `${url}#article` },
      dateModified: g.updated,
      speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".rk-answer"] },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: crumbs.map(([name, path], i) => ({ "@type": "ListItem", position: i + 1, name, item: `${SITE}${path === "/" ? "" : path}` })),
    },
    {
      "@type": "TechArticle",
      "@id": `${url}#article`,
      headline: g.h1,
      alternativeHeadline: g.seoTitle,
      description: g.description,
      abstract: g.answer,
      url,
      mainEntityOfPage: { "@id": `${url}#webpage` },
      inLanguage: "en-IN",
      isAccessibleForFree: true,
      datePublished: g.published || g.updated,
      dateModified: g.updated,
      timeRequired: iso8601Minutes(g.minutes),
      proficiencyLevel: g.level,
      educationalLevel: g.level,
      learningResourceType: "Technical guide",
      educationalUse: "Interview preparation",
      teaches: g.learn,
      keywords: g.keywords,
      about: (g.about || []).map((name) => ({ "@type": "Thing", name })),
      author: { "@id": ORG_ID },
      publisher: { "@id": ORG_ID },
      image: LOGO,
      hasPart: g.toc.map((s) => ({ "@type": "WebPageElement", name: s.label, url: `${url}#${s.id}` })),
    },
  ];

  if (g.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: g.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
  }
  if (g.questions?.length) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#interview-questions`,
      name: `${g.short} interview questions with answers`,
      numberOfItems: g.questions.length,
      itemListElement: g.questions.map((q, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@type": "Question", name: q.q, acceptedAnswer: { "@type": "Answer", text: q.a } },
      })),
    });
  }
  if (g.glossary?.length) {
    graph.push({
      "@type": "DefinedTermSet",
      "@id": `${url}#glossary`,
      name: `${g.short} glossary`,
      hasDefinedTerm: g.glossary.map(([term, def]) => ({ "@type": "DefinedTerm", name: term, description: def, inDefinedTermSet: `${url}#glossary` })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

/* JSON for a <script> tag: "<" is escaped so nothing in the text can close the tag early */
export const guideSchemaJson = (g) => JSON.stringify(buildGuideSchema(g)).replace(/</g, "\\u003c");
