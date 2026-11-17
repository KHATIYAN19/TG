import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Check, Clock, FileText, Lightning, MagnifyingGlass, Target } from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import HLD_PREVIEW_PDF from "../assest/master_hld_preview.pdf";
import ResumePromo from "../resume/ResumePromo.jsx";
import {
  BookFooter, BookHero, BookOffers, BuyBar, FONT_HREF, FaqSection, FinalSection, PreviewSection, Price, SITE_NAME, SITE_URL, Section,
  coverOf, priceOf, scrollToId, useNear, useOnScreen, useProduct, useReferral, useSiteTheme, useTrackView,
} from "./bookKit";
import {
  CASE_CATEGORY, audience, buildingBlocks, caseFilters, caseStudies, caseStudyFramework, chapterCoverage, deepDives, faqs, hldVsLld, interviewPlaybook, valueStack,
} from "./hldBookData";

/*
  /book/system-design/hld: one short page that answers, in order:
    what is it and what does it cost (hero)  →  which book do I need (HLD, LLD, combo)  →  can I see it (preview)
    →  what's inside (case studies, method, blocks, syllabus)  →  is it for me  →  questions  →  buy  →  resume review
*/

const PAYMENT_PROVIDER_NAME = gatewayLabel(preferredGateway("books"));
const LLD_URL = "/book/system-design/lld";
const COMBO_URL = "/book/system-design/hld-lld/combo";

const SEO_TITLE = "System Design HLD Book: 19 Case Studies (PDF) | Target Trek";
const SEO_DESCRIPTION = "Crack system design interviews with an HLD ebook: 45-minute playbook, 16 core building blocks and 19 case studies — WhatsApp, Uber, BookMyShow, payments & more.";
const SEO_KEYWORDS = "system design book, HLD book, high level design interview, system design interview ebook, system design PDF, distributed systems, URL shortener design, WhatsApp system design, Uber system design, BookMyShow system design, Kafka, Redis, sharding";
const SEO_LONG_DESCRIPTION = "Learn High-Level Design with a 45-minute interview playbook, core distributed-system building blocks, and 19 production-style case studies covering APIs, databases, caching, Kafka, scaling, failure handling and trade-offs.";

const PAGE_NAV = [["bundle", "HLD · LLD · Combo"], ["preview", "Free preview"], ["case-studies", "19 case studies"], ["method", "The method"], ["blocks", "Building blocks"], ["syllabus", "Syllabus"], ["faq", "FAQ"]];
const HERO_STATS = [["19", "case studies"], ["16", "building blocks"], ["9", "steps per case"], ["45", "minute playbook"]];
const DEEP_DIVE_BY_CASE = { "01": deepDives[0], "02": deepDives[1], "03": deepDives[2], 10: deepDives[3], 18: deepDives[4], 19: deepDives[5] };
const PLAYBOOK_TOTAL = interviewPlaybook.reduce((n, s) => n + parseInt(s.time, 10), 0);

function CaseStudies() {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const query = q.trim().toLowerCase();
  const shown = caseStudies.filter((c) => (filter === "All" || CASE_CATEGORY[c.number] === filter)
    && (!query || `${c.title} ${c.subtitle} ${c.summary} ${c.tags.join(" ")}`.toLowerCase().includes(query)));
  const LIMIT = 9;
  const folded = !all && filter === "All" && !query && shown.length > LIMIT;
  const visible = folded ? shown.slice(0, LIMIT) : shown;
  const counts = (f) => caseStudies.filter((c) => f === "All" || CASE_CATEGORY[c.number] === f).length;
  return (
    <>
      <div className="hb-cs-tools">
        <div className="hb-filters" role="group" aria-label="Filter case studies">
          {caseFilters.map((f) => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}<span className="hb-mono">{counts(f)}</span></button>)}
        </div>
        <label className="hb-search">
          <MagnifyingGlass size={17} weight="bold" aria-hidden />
          <span className="hb-sr">Search case studies</span>
          <input id="hb-cs-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: Kafka, Redis, payments…" />
        </label>
      </div>
      <p className="hb-cs-count" aria-live="polite">{shown.length} of {caseStudies.length} case studies</p>
      {shown.length === 0 ? (
        <div className="hb-empty"><b>No case study matches “{q}”.</b><button type="button" className="hb-btn hb-btn-ghost" onClick={() => { setQ(""); setFilter("All"); }}>Show all {caseStudies.length}</button></div>
      ) : (
        <ol className="hb-cases">
          {visible.map((c) => {
            const dd = DEEP_DIVE_BY_CASE[c.number];
            return (
              <li key={c.number} className="hb-case">
                <div className="hb-case-top"><span className="hb-case-n hb-mono">{c.number}</span><span className="hb-case-cat">{CASE_CATEGORY[c.number]}</span></div>
                <h3>{c.title}</h3>
                <p className="hb-case-sub">{c.subtitle}</p>
                <p className="hb-case-sum">{c.summary}</p>
                {dd && <p className="hb-case-dd"><Lightning size={14} weight="fill" aria-hidden /><span><b>Hard part:</b> {dd.title}</span></p>}
                <ul className="hb-tags" aria-label="Key technologies">{c.tags.map((t) => <li key={t}>{t}</li>)}</ul>
              </li>
            );
          })}
        </ol>
      )}
      {folded && <div className="hb-more"><button type="button" className="hb-btn hb-btn-ghost hb-btn-lg" onClick={() => setAll(true)}>Show all {caseStudies.length} case studies</button></div>}
    </>
  );
}

function SystemDesignHLD() {
  const theme = useSiteTheme();
  const isDark = theme === "dark";
  useReferral();
  const { product, loading } = useProduct(typeof window !== "undefined" ? window.location.pathname : "/book/system-design/hld");
  const { product: lldProduct } = useProduct(LLD_URL);
  const { product: comboProduct } = useProduct(COMBO_URL);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const heroRef = useRef(null);
  const previewRef = useRef(null);
  const heroVisible = useOnScreen(heroRef);
  const [previewStart, setPreviewStart] = useNear(previewRef);
  useTrackView(product, "Mastering System Design — HLD");

  const info = priceOf(product, loading);
  const cover = coverOf(product);
  const productName = product?.title || "Mastering System Design — High-Level Design";
  const buy = (p) => { if (!priceOf(p).canBuy) return; setCheckoutProduct(p); setIsCheckoutOpen(true); };
  const buyThis = () => buy(product);
  const openPreview = () => { setPreviewStart(true); scrollToId("preview"); };

  const pathname = typeof window !== "undefined" ? window.location.pathname : "/book/system-design/hld";
  const canonicalUrl = `${SITE_URL}${pathname.replace(/\/+$/, "") || "/"}`;

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: "supporttargettrek@gmail.com",
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "supporttargettrek@gmail.com", availableLanguage: ["English"] } },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: "en-IN", publisher: { "@id": `${SITE_URL}/#organization` } },
      { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: SEO_TITLE, description: SEO_DESCRIPTION, inLanguage: "en-IN",
        isPartOf: { "@id": `${SITE_URL}/#website` }, breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` }, about: { "@id": `${canonicalUrl}#product` },
        ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover } } : {}) },
      { "@type": "BreadcrumbList", "@id": `${canonicalUrl}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
        { "@type": "ListItem", position: 3, name: "System Design HLD", item: canonicalUrl },
      ] },
      { "@type": ["Product", "Book"], "@id": `${canonicalUrl}#product`, name: productName, description: SEO_LONG_DESCRIPTION, url: canonicalUrl,
        category: "System Design High-Level Design Ebook", keywords: SEO_KEYWORDS, inLanguage: "en", bookFormat: "https://schema.org/EBook",
        genre: "Computer science, system design, interview preparation",
        audience: { "@type": "Audience", audienceType: "Software engineers preparing for system design interviews" },
        brand: { "@type": "Brand", name: SITE_NAME }, author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` },
        isAccessibleForFree: false, ...(product?._id ? { sku: String(product._id) } : {}), ...(cover ? { image: [cover] } : {}),
        ...(info.valid && info.price > 0 ? { offers: { "@type": "Offer", url: canonicalUrl, price: info.price, priceCurrency: info.currency, priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
          availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition",
          hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" },
          seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } } : {}) },
      { "@type": "ItemList", "@id": `${canonicalUrl}#case-studies`, name: "19 system design case studies in the HLD handbook", numberOfItems: caseStudies.length,
        itemListElement: caseStudies.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: `Design ${c.title}`, description: c.summary })) },
      { "@type": "FAQPage", "@id": `${canonicalUrl}#faq`, mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  }), [cover, canonicalUrl, info.valid, info.price, info.currency, product?._id, productName]);

  const offers = [
    product && { key: "hld", p: product, current: true, eyebrow: "High-level design", title: productName,
      copy: "Architecture for the whole system: requirements, estimates, APIs, data stores, caching, queues and failures.",
      points: ["19 HLD case studies", "16 building-block primers", "45-minute interview playbook"], cta: "Get the HLD book" },
    lldProduct && { key: "lld", p: lldProduct, eyebrow: "Low-level design · Java", title: lldProduct.title || "Mastering System Design — LLD (Java)",
      copy: lldProduct.shortDescription || "Turn requirements into clean object models, apply SOLID and design patterns, and practise complete Java LLD problems.",
      points: ["Java, OOP, SOLID and UML", "23 GoF design patterns", "16 detailed LLD case studies"], href: LLD_URL, cta: "Get the LLD book" },
    comboProduct && priceOf(comboProduct).valid && { key: "combo", p: comboProduct, best: true, eyebrow: "Best value · both rounds", title: comboProduct.title || "Mastering System Design: HLD + LLD Combo",
      copy: "Distributed architecture and scalable backends in HLD, plus practical Java class design in LLD.",
      points: ["This HLD book and the LLD book", "19 HLD case studies plus 16 LLD problems", "Architecture, Java code and design patterns"], href: COMBO_URL, cta: "Get the combo" },
  ].filter(Boolean);

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
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {cover && <link rel="preload" as="image" href={cover} />}
        <link href={FONT_HREF} rel="stylesheet" />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl} />
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
          heroRef={heroRef} crumb="System Design HLD"
          pill={<><FileText size={14} weight="bold" aria-hidden />HLD interview handbook · PDF ebook</>}
          title={<>Crack the system design round with <span className="hb-mark">19 real systems.</span></>}
          lead="One repeatable method to turn an open prompt into requirements, estimates, APIs, data models, an architecture and failure handling. Practised on WhatsApp, Uber, BookMyShow, payments, Netflix and 14 more."
          stats={HERO_STATS} info={info} onBuy={buyThis} onPreview={openPreview} providerName={PAYMENT_PROVIDER_NAME}
          cover={cover} coverTitle={productName} coverFallback={{ subtitle: "High-Level Design", line: "19 case studies · 45-minute playbook" }} nav={PAGE_NAV}
        />

        <BookOffers
          offers={offers} onBuy={buy} onPreview={openPreview}
          title="HLD, LLD, or both rounds together"
          lead="HLD is how the whole system scales. LLD is how one service is built in code. Most product companies ask both, and the combo covers both rounds."
          compare={{ head: ["HLD (this book)", "LLD"], mine: 0, rows: hldVsLld }}
        />

        <PreviewSection
          sectionRef={previewRef} file={HLD_PREVIEW_PDF} bookTitle="Mastering System Design HLD" start={previewStart}
          onBuy={buyThis} canBuy={info.canBuy} priceLabel={info.label} fullBookLine="The full book has all 19 case studies."
          points={["No download, no sign-up", "Same layout and depth as the full book", "Full book: 19 case studies, 16 building blocks"]}
        />

        <Section id="case-studies" eyebrow="What's inside" title="19 case studies, each built the same way" lead="Every system asked in real interviews, from a URL shortener to payments. Filter by type or search by technology.">
          <CaseStudies />
        </Section>

        <Section id="method" eyebrow="The method" title="One way to answer any design prompt" lead="Each case study walks these nine steps, so by the third one you can do it on a new prompt yourself." tint>
          <ol className="hb-steps">
            {caseStudyFramework.map((s) => <li key={s.number}><span className="hb-mono">{s.number}</span><div><b>{s.title}</b><p>{s.copy}</p></div></li>)}
          </ol>
          <div className="hb-play">
            <div className="hb-play-head"><Clock size={20} weight="duotone" aria-hidden /><h3 className="hb-h3">The 45-minute interview plan</h3></div>
            <p className="hb-muted">How to spend the real round, minute by minute.</p>
            <div className="hb-play-bar" aria-hidden>
              {interviewPlaybook.map((s, n) => <span key={s.title} style={{ flexGrow: parseInt(s.time, 10) }} className={`c${n}`}><b className="hb-mono">{parseInt(s.time, 10)}m</b></span>)}
            </div>
            <ol className="hb-play-list">
              {interviewPlaybook.map((s, n) => <li key={s.title}><i className={`c${n}`} aria-hidden /><span className="hb-mono">{s.time}</span><div><b>{s.title}</b><p>{s.copy}</p></div></li>)}
            </ol>
            <p className="hb-play-total hb-mono">Total: {PLAYBOOK_TOTAL} minutes</p>
          </div>
        </Section>

        <Section id="blocks" eyebrow="Building blocks" title="16 components, explained by the problem they solve" lead="Short primers you can revise the night before. Each one shows up again inside the case studies.">
          <ul className="hb-blocks">
            {buildingBlocks.map(({ title, icon: Icon, copy }) => <li key={title}><span className="hb-ico"><Icon size={20} weight="duotone" aria-hidden /></span><div><b>{title}</b><p>{copy}</p></div></li>)}
          </ul>
        </Section>

        <Section id="syllabus" eyebrow="Syllabus" title="What the book teaches across every system" tint>
          <div className="hb-syl">
            {chapterCoverage.map((c, n) => (
              <details key={c.number} className="hb-acc" open={n === 0}>
                <summary><span className="hb-mono">{c.number}</span><span><b>{c.title}</b><small>{c.subtitle}</small></span></summary>
                <div className="hb-acc-body">
                  <p>{c.description}</p>
                  <ul className="hb-checks">{c.bullets.map((b) => <li key={b}><Check size={15} weight="bold" aria-hidden />{b}</li>)}</ul>
                </div>
              </details>
            ))}
          </div>
        </Section>

        <Section id="for-you" eyebrow="Who it's for" title="Made for engineers preparing for the design round">
          <div className="hb-split">
            <ul className="hb-who">
              {audience.map((a) => <li key={a.title}><Target size={18} weight="duotone" aria-hidden /><div><b>{a.title}</b><p>{a.copy}</p></div></li>)}
            </ul>
            <div className="hb-get">
              <p className="hb-get-k">What you get</p>
              <ul>{valueStack.map(({ title, copy, icon: Icon }) => <li key={title}><Icon size={18} weight="duotone" aria-hidden /><div><b>{title}</b><p>{copy}</p></div></li>)}</ul>
              <div className="hb-get-buy">
                <Price info={info} />
                <button type="button" className="hb-btn hb-btn-primary hb-btn-block" onClick={buyThis} disabled={!info.canBuy}>Get the ebook<ArrowRight size={17} weight="bold" aria-hidden /></button>
              </div>
            </div>
          </div>
        </Section>

        <FaqSection items={faqs} />

        <FinalSection
          title={<>Walk into the round with a plan, <span className="hb-mark">not a memorised diagram.</span></>}
          line="19 case studies, one method, a digital PDF you can read anywhere."
          info={info} onBuy={buyThis} onPreview={openPreview}
        >
          <ResumePromo variant="banner" isDark={isDark} />
        </FinalSection>
      </main>

      <BookFooter line="Mastering System Design: High-Level Design · Digital PDF ebook · Digital purchases are not refundable" links={[[LLD_URL, "System Design LLD (Java)"], [COMBO_URL, "HLD + LLD Combo"]]} />
      <BuyBar name="Mastering System Design HLD" info={info} onBuy={buyThis} onPreview={openPreview} hidden={isCheckoutOpen} heroVisible={heroVisible} />
      <PayUCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={checkoutProduct || product} />
    </div>
  );
}

export default SystemDesignHLD;
