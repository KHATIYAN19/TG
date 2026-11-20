import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, BookOpen, Check, FileText, Terminal } from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import ResumePromo from "../resume/ResumePromo.jsx";
import {
  BookFooter, BookHero, BuyBar, FONT_HREF, FaqSection, FinalSection, Price, SITE_NAME, SITE_URL, Section,
  coverOf, priceOf, scrollToId, useOnScreen, useProduct, useReferral, useSiteTheme, useTrackView,
} from "./bookKit";
import {
  CHEATSHEET, FAQS, HANDBOOK, PAGE_URL, TOOL_VERSIONS, bookComparison, cheatSheetSections, handbookParts, outputLabels, topicMap,
} from "./dockerBookData";

/*
  /book/docker: ONE product (redirectUrl /book/docker) that delivers TWO PDFs:
    Docker: The Complete Engineer's Handbook (177 pages) + Docker Cheat Sheet (20 pages).
  Order: hero → both books side by side → Handbook contents → how output is labelled → Cheat Sheet contents
         → topic finder → FAQ → buy.
  Only facts from the book listings appear on this page.
*/

const PAYMENT_PROVIDER_NAME = gatewayLabel(preferredGateway("books"));
const CANONICAL_URL = `${SITE_URL}${PAGE_URL}`;
const BUNDLE_NAME = "Docker Handbook + Docker Cheat Sheet";

const SEO_TITLE = "Docker Handbook + Cheat Sheet (PDF Ebooks) | Target Trek";
const SEO_DESCRIPTION = "Two Docker PDFs in one: a 177-page handbook (25 chapters, real command output) and a 20-page cheat sheet. Dockerfile, Compose, Swarm, security, CI/CD.";
const SEO_LONG_DESCRIPTION = "Two Docker PDF ebooks by Target Trek in one purchase. Docker: The Complete Engineer's Handbook takes you from your first container to production-grade stacks in 25 chapters across 8 parts, with 18 diagrams, a table of contents, a command index and a concept index, and every command and YAML file shown with output captured live on Docker Engine 29.10.0, Compose v5.7.1 and Buildx 0.39.0. The Docker Cheat Sheet puts every important command and file in 19 sections across 20 pages for fast revision.";
const SEO_KEYWORDS = "docker book, docker ebook, docker pdf, docker handbook, docker cheat sheet, docker cheat sheet pdf, docker compose, compose.yaml reference, dockerfile, multi-stage builds, buildkit, buildx, docker swarm, docker to kubernetes, docker security, docker scout, rootless docker, docker networking, docker volumes, docker interview questions, docker model runner, mcp toolkit";

const PAGE_NAV = [["books", "Both books"], ["handbook", "Handbook: 25 chapters"], ["output", "Real output"], ["cheat-sheet", "Cheat Sheet: 19 sections"], ["topics", "Topic finder"], ["faq", "FAQ"]];
const HERO_STATS = [["2", "PDF ebooks"], [String(HANDBOOK.pages + CHEATSHEET.pages), "pages in total"], [String(HANDBOOK.chapters), "handbook chapters"], [String(CHEATSHEET.sections), "cheat sheet sections"]];

const BOOK_CARDS = [
  { key: "handbook", href: "#handbook", eyebrow: `Book 1 · ${HANDBOOK.pages} pages`, book: HANDBOOK, link: `See all ${HANDBOOK.chapters} chapters` },
  { key: "sheet", href: "#cheat-sheet", eyebrow: `Book 2 · ${CHEATSHEET.pages} pages`, book: CHEATSHEET, link: `See all ${CHEATSHEET.sections} sections` },
];

function DockerBooks() {
  const theme = useSiteTheme();
  const isDark = theme === "dark";
  useReferral();
  const { product, loading } = useProduct(PAGE_URL);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const heroRef = useRef(null);
  const heroVisible = useOnScreen(heroRef);
  useTrackView(product, BUNDLE_NAME);

  const info = priceOf(product, loading);
  const cover = coverOf(product);
  const productName = product?.title || BUNDLE_NAME;
  const buy = () => { if (info.canBuy) setIsCheckoutOpen(true); };
  const seeInside = () => scrollToId("books");

  const structuredData = useMemo(() => {
    const bookBase = { "@type": "Book", inLanguage: "en", bookFormat: "https://schema.org/EBook", genre: "Software engineering, DevOps, containers",
      author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` } };
    return {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: "supporttargettrek@gmail.com",
          contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "supporttargettrek@gmail.com", availableLanguage: ["English"] } },
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: "en-IN", publisher: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "WebPage", "@id": `${CANONICAL_URL}#webpage`, url: CANONICAL_URL, name: SEO_TITLE, description: SEO_DESCRIPTION, inLanguage: "en-IN",
          isPartOf: { "@id": `${SITE_URL}/#website` }, breadcrumb: { "@id": `${CANONICAL_URL}#breadcrumb` }, about: { "@id": `${CANONICAL_URL}#product` },
          speakable: { "@type": "SpeakableSpecification", cssSelector: [".hb-h1", ".hb-hero .hb-lead", ".hb-faq p"] },
          ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover } } : {}) },
        { "@type": "BreadcrumbList", "@id": `${CANONICAL_URL}#breadcrumb`, itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
          { "@type": "ListItem", position: 3, name: "Docker", item: CANONICAL_URL },
        ] },
        /* the thing you buy: one product that contains two books */
        { "@type": "Product", "@id": `${CANONICAL_URL}#product`, name: productName, description: SEO_LONG_DESCRIPTION, url: CANONICAL_URL,
          category: "Docker ebooks", keywords: SEO_KEYWORDS, brand: { "@type": "Brand", name: SITE_NAME },
          hasPart: [{ "@id": `${CANONICAL_URL}#handbook` }, { "@id": `${CANONICAL_URL}#cheat-sheet` }],
          ...(product?._id ? { sku: String(product._id) } : {}), ...(cover ? { image: [cover] } : {}),
          ...(info.valid && info.price > 0 ? { offers: { "@type": "Offer", url: CANONICAL_URL, price: info.price, priceCurrency: info.currency, priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
            availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition",
            hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" },
            seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } } : {}) },
        { ...bookBase, "@id": `${CANONICAL_URL}#handbook`, name: HANDBOOK.title, description: HANDBOOK.tagline, numberOfPages: HANDBOOK.pages,
          hasPart: handbookParts.flatMap((p) => p.chapters.map((c) => ({ "@type": "Chapter", position: Number(c.number), name: c.title, isPartOf: { "@type": "CreativeWork", name: `Part ${p.number}: ${p.title}` } }))) },
        { ...bookBase, "@id": `${CANONICAL_URL}#cheat-sheet`, name: CHEATSHEET.title, description: CHEATSHEET.tagline, numberOfPages: CHEATSHEET.pages,
          hasPart: cheatSheetSections.map((s) => ({ "@type": "CreativeWork", position: Number(s.number), name: s.detail ? `${s.title}: ${s.detail}` : s.title })) },
        { "@type": "FAQPage", "@id": `${CANONICAL_URL}#faq`, mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ],
    };
  }, [cover, info.valid, info.price, info.currency, product?._id, productName]);

  return (
    <div className="hb" data-theme={theme}>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta name="author" content={SITE_NAME} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="theme-color" content={isDark ? "#0a1312" : "#f6f8f7"} />
        <meta name="color-scheme" content={isDark ? "dark" : "light"} />
        <link rel="canonical" href={CANONICAL_URL} />
        <link rel="alternate" hrefLang="en-IN" href={CANONICAL_URL} />
        <link rel="alternate" hrefLang="x-default" href={CANONICAL_URL} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {cover && <link rel="preload" as="image" href={cover} />}
        <link href={FONT_HREF} rel="stylesheet" />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={CANONICAL_URL} />
        {info.valid && info.price > 0 && <meta property="product:price:amount" content={String(info.price)} />}
        {info.valid && info.price > 0 && <meta property="product:price:currency" content={info.currency} />}
        {cover && <meta property="og:image" content={cover} />}
        {cover && <meta property="og:image:alt" content={`${productName} ebook cover`} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        {cover && <meta name="twitter:image" content={cover} />}
        {cover && <meta name="twitter:image:alt" content={`${productName} ebook cover`} />}
        <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
      </Helmet>
      <a href="#hb-main" className="hb-skip">Skip to content</a>

      <main id="hb-main">
        <BookHero
          heroRef={heroRef} crumb="Docker"
          pill={<><FileText size={14} weight="bold" aria-hidden />2 Docker PDF ebooks · one purchase</>}
          title={<>Docker, from your first container <span className="hb-mark">to production-grade stacks.</span></>}
          lead={`Get both: ${HANDBOOK.title} (${HANDBOOK.pages} pages, ${HANDBOOK.chapters} chapters in ${HANDBOOK.parts} parts), with every command and every YAML file shown with real output, and the ${CHEATSHEET.pages}-page ${CHEATSHEET.title} for fast revision.`}
          stats={HERO_STATS} info={info} onBuy={buy} onPreview={seeInside} providerName={PAYMENT_PROVIDER_NAME} previewLabel="See what's inside"
          cover={cover} coverTitle={productName} coverFallback={{ title: "Docker", subtitle: "Handbook + Cheat Sheet", line: "177 + 20 pages · 2 PDF ebooks" }} nav={PAGE_NAV}
        />

        <Section id="books" eyebrow="Two books, one purchase" title="The Handbook and the Cheat Sheet, side by side"
          lead="The Handbook teaches Docker end to end. The Cheat Sheet puts every important command and file on 20 pages. You get both PDFs.">
          <div className="hb-offers">
            {BOOK_CARDS.map(({ key, href, eyebrow, book, link }) => (
              <article key={key} className="hb-offer">
                <div className="hb-offer-top">
                  <span className="hb-offer-ph" aria-hidden><BookOpen size={26} weight="duotone" /></span>
                  <div><span className="hb-eyebrow">{eyebrow}</span><h3>{book.title}</h3></div>
                </div>
                <p className="hb-muted">{book.tagline}</p>
                <ul className="hb-checks">{book.includes.map((x) => <li key={x}><Check size={15} weight="bold" aria-hidden />{x}</li>)}</ul>
                <div className="hb-offer-foot"><a href={href} className="hb-textlink">{link}</a></div>
              </article>
            ))}
          </div>
          <div className="hb-cmp hb-cmp-after" role="region" aria-label="Docker Handbook compared with Docker Cheat Sheet" tabIndex={0}>
            <table>
              <caption className="hb-sr">{`${HANDBOOK.title} compared with the ${CHEATSHEET.title}`}</caption>
              <thead><tr><th scope="col"><span className="hb-sr">Feature</span></th><th scope="col">Handbook</th><th scope="col">Cheat Sheet</th></tr></thead>
              <tbody>{bookComparison.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="hb-row" style={{ marginTop: 22, alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Price info={info} />
            <button type="button" className="hb-btn hb-btn-primary" onClick={buy} disabled={!info.canBuy}>Get both books<ArrowRight size={17} weight="bold" aria-hidden /></button>
          </div>
        </Section>

        <Section id="handbook" eyebrow={`Book 1 · ${HANDBOOK.pages} pages`} title={`${HANDBOOK.title}: all ${HANDBOOK.chapters} chapters`}
          lead={`${HANDBOOK.parts} parts, ${HANDBOOK.diagrams} diagrams, a table of contents, a command index, a concept index and page numbers on every page. Open a part to see its chapters.`} tint>
          <div className="hb-syl">
            {handbookParts.map((p, n) => (
              <details key={p.number} className="hb-acc" open={n === 0}>
                <summary>
                  <span className="hb-mono">Part {p.number}</span>
                  <span><b>{p.title}</b><small>{p.chapters.length} chapters · Ch {p.chapters[0].number}–{p.chapters[p.chapters.length - 1].number}</small></span>
                </summary>
                <div className="hb-acc-body">
                  <ol className="hb-checks">
                    {p.chapters.map((c) => <li key={c.number}><span className="hb-mono" aria-label={`Chapter ${Number(c.number)}`}>{c.number}</span>{c.title}</li>)}
                  </ol>
                </div>
              </details>
            ))}
          </div>
        </Section>

        <Section id="output" eyebrow="Real output" title="Every command shown with its output, clearly labelled"
          lead="The Handbook marks each output block so you know exactly what you are looking at.">
          <ul className="hb-who">
            {outputLabels.map((o) => <li key={o.label}><Terminal size={18} weight="duotone" aria-hidden /><div><b className="hb-mono">{o.label}</b><p>{o.copy}</p></div></li>)}
          </ul>
          <dl className="hb-stats" style={{ marginTop: 18 }}>
            {TOOL_VERSIONS.map(([k, v]) => <div key={k}><dt className="hb-mono">{v}</dt><dd>{k}</dd></div>)}
          </dl>
        </Section>

        <Section id="cheat-sheet" eyebrow={`Book 2 · ${CHEATSHEET.pages} pages`} title={`${CHEATSHEET.title}: ${CHEATSHEET.sections} sections`}
          lead={`${CHEATSHEET.tagline} Mostly “command | what it does” tables.`} tint>
          <ol className="hb-steps">
            {cheatSheetSections.map((s) => <li key={s.number}><span className="hb-mono">{s.number}</span><div><b>{s.title}</b>{s.detail && <p>{s.detail}</p>}</div></li>)}
          </ol>
        </Section>

        <Section id="topics" eyebrow="Topic finder" title="Where each Docker topic lives in both books"
          lead="Chapter numbers refer to the Handbook, section numbers (§) to the Cheat Sheet.">
          <div className="hb-cmp" role="region" aria-label="Docker topics by book" tabIndex={0}>
            <table>
              <caption className="hb-sr">Where each Docker topic is covered in the Handbook and the Cheat Sheet</caption>
              <thead><tr><th scope="col">Topic</th><th scope="col">Handbook</th><th scope="col">Cheat Sheet</th></tr></thead>
              <tbody>{topicMap.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>)}</tbody>
            </table>
          </div>
        </Section>

        <FaqSection items={FAQS} />

        <FinalSection
          title={<>Every command, every YAML file, <span className="hb-mark">with real output.</span></>}
          line={`Both PDFs: ${HANDBOOK.title} (${HANDBOOK.pages} pages) and the ${CHEATSHEET.title} (${CHEATSHEET.pages} pages).`}
          info={info} onBuy={buy} onPreview={seeInside} previewLabel="See what's inside"
        >
          <ResumePromo variant="banner" isDark={isDark} />
        </FinalSection>
      </main>

      <BookFooter line="Docker: The Complete Engineer's Handbook + Docker Cheat Sheet · PDF ebooks · Digital purchases are not refundable" links={[["/book/cloud/aws", "AWS Handbook"], ["/book/cloud/gcp", "GCP Handbook"]]} />
      <BuyBar name={BUNDLE_NAME} info={info} onBuy={buy} onPreview={seeInside} hidden={isCheckoutOpen} heroVisible={heroVisible} previewLabel="Contents" />
      <PayUCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={product} />
    </div>
  );
}

export default DockerBooks;
