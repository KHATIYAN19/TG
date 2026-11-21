import { FAQ, MISTAKES, PAGE_URL, SEO, SITE, STEPS, UPDATED_ISO } from "./landingContent";

/*
  Structured data for /resume-review (JSON-LD). Search engines read it for rich results; answer engines and AI assistants read it
  to quote the page correctly. It is built from the same arrays that draw the page, so the two can never disagree.
  `plans` (optional) are the live plans from the API, added as offers once they load.
*/
const LOGO = "https://www.targettrek.in/brand/target-trek-logo.jpg";

export function buildSchema(plans) {
  const org = { "@type": "Organization", "@id": `${SITE}/#organization`, name: "Target Trek", url: SITE, logo: LOGO, email: "supporttargettrek@gmail.com" };

  const service = {
    "@type": "Service",
    "@id": `${PAGE_URL}#service`,
    name: "Resume Lab: AI and working-professional resume and LinkedIn review",
    serviceType: "Resume review",
    description: SEO.description,
    provider: { "@id": `${SITE}/#organization` },
    areaServed: [{ "@type": "Country", name: "India" }],
    audience: { "@type": "Audience", audienceType: "Students, freshers and working professionals applying for technology jobs" },
    url: PAGE_URL,
    availableChannel: { "@type": "ServiceChannel", serviceUrl: PAGE_URL },
  };
  if (plans?.length) {
    service.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: "Resume Lab plans",
      itemListElement: plans.map((p) => ({
        "@type": "Offer",
        name: p.name,
        description: [p.tagline, p.terms].filter(Boolean).join(". "),
        price: String(p.price),
        priceCurrency: "INR",
        availability: "https://schema.org/InStock",
        url: `${PAGE_URL}#pricing`,
        seller: { "@id": `${SITE}/#organization` },
      })),
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      org,
      {
        "@type": "WebPage",
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: SEO.title,
        description: SEO.description,
        inLanguage: "en-IN",
        isPartOf: { "@type": "WebSite", "@id": `${SITE}/#website`, url: SITE, name: "Target Trek" },
        about: { "@id": `${PAGE_URL}#service` },
        dateModified: UPDATED_ISO,
        primaryImageOfPage: { "@type": "ImageObject", url: LOGO },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["h1", ".rv-answer"] },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Target Trek", item: SITE },
          { "@type": "ListItem", position: 2, name: "Resume Lab", item: PAGE_URL },
        ],
      },
      service,
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "HowTo",
        "@id": `${PAGE_URL}#howto`,
        name: "How to get your resume reviewed with Resume Lab",
        description: "Choose a plan, pay, send in your resume, read the AI report, then get a working professional's detailed review.",
        step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text, url: `${PAGE_URL}#how-it-works` })),
      },
      {
        "@type": "ItemList",
        "@id": `${PAGE_URL}#mistakes`,
        name: "12 resume mistakes that stop interview calls, and how to fix them",
        itemListElement: MISTAKES.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.title, url: `${PAGE_URL}#mistakes` })),
      },
    ],
  };
}

/* JSON for a <script> tag: "<" is escaped so nothing in the text can close the tag early */
export const schemaJson = (plans) => JSON.stringify(buildSchema(plans)).replace(/</g, "\\u003c");
