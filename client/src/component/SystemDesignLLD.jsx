import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, BookOpen, Clock, Code, FileText, Lightbulb, LockKey, MagnifyingGlass, Sparkle, Stack, Target } from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import LLD_PREVIEW_PDF from "../assest/master_lld_java_preview.pdf";
import ResumePromo from "../resume/ResumePromo.jsx";
import {
  BookFooter, BookHero, BookOffers, BuyBar, FONT_HREF, FaqSection, FinalSection, PreviewSection, Price, SITE_NAME, SITE_URL, SUPPORT_EMAIL, Section,
  coverOf, cx, priceOf, scrollToId, useNear, useOnScreen, useProduct, useReferral, useSiteTheme, useTrackView,
} from "./bookKit";
import { hldVsLld } from "./hldBookData";
import { AUDIENCE, FRAMEWORK_STEPS, PATTERN_CUES, QUESTION_SUMMARIES, designQuestions, faqItems, modules, patterns, principles } from "./lldBookData";

/*
  /book/system-design/lld: one short page that answers, in order:
    what is it and what does it cost (hero)  →  which book do I need (LLD, HLD, combo)  →  can I see it (preview)
    →  what's inside (16 case studies, 23 patterns, 14-part curriculum, the interview method)  →  is it for me  →  questions  →  buy  →  resume review
  The long code samples, UML sketches and topic clouds of the old page are gone: the preview shows the real pages instead.
*/

const PAYMENT_PROVIDER_NAME = gatewayLabel(preferredGateway("books"));
const PAGE_PATH = "/book/system-design/lld";
const HLD_URL = "/book/system-design/hld";
const COMBO_URL = "/book/system-design/hld-lld/combo";

const SEO_TITLE = "Java LLD Book: 23 Patterns & 16 Case Studies | Target Trek";
const SEO_DESCRIPTION = "Low-Level Design in Java: OOP, UML, SOLID, 23 GoF patterns, Spring Boot, concurrency, a 60-minute interview framework and 16 coded case studies. PDF ebook.";
const SEO_LONG_DESCRIPTION = "Master Low-Level Design with Java, OOP, UML, SOLID, 23 GoF patterns, Spring Boot, APIs, persistence, concurrency, testing, a 60-minute interview framework and 16 coded case studies.";
const SEO_KEYWORDS = "low level design Java, LLD interview preparation, system design LLD, Java OOP, SOLID principles, UML diagrams, Java design patterns, GoF design patterns, concurrency, locking, BookMyShow LLD, parking lot LLD, Splitwise LLD, TargetTrek";

const PAGE_NAV = [["bundle", "LLD · HLD · Combo"], ["preview", "Free preview"], ["case-studies", "16 case studies"], ["patterns", "23 patterns"], ["curriculum", "Curriculum"], ["method", "The method"], ["faq", "FAQ"]];
const HERO_STATS = [["14", "part curriculum"], ["23", "GoF patterns"], ["16", "coded case studies"], ["60", "minute framework"]];
const PATTERN_KIND = { Creational: "How objects are created", Structural: "How objects are composed", Behavioral: "How objects work together" };
const VALUE = [
  [FileText, "Digital PDF ebook", "Read on laptop, tablet or phone and revise anywhere."],
  [BookOpen, "14-part curriculum", "From OOP and UML to Spring Boot, testing and production engineering."],
  [Sparkle, "All 23 GoF patterns", "Each with its purpose, a real example and when to reach for it."],
  [Code, "16 coded case studies", "UML class diagrams, Java implementations and runnable driver scenarios."],
  [LockKey, "Concurrency and locking", "Threads, executors, the Java Memory Model, locks and deadlocks."],
  [Clock, "60-minute interview framework", "Scope, diagram, code the core and handle the follow-ups."],
];

/* one name per pattern family, so "Factory" and "Factory Method" filter together */
const patternKey = (p) => (/^factory/i.test(p) ? "Factory" : p);
const CASES = designQuestions.map((q, i) => ({ ...q, number: String(i + 1).padStart(2, "0"), summary: QUESTION_SUMMARIES[i] || "", keys: [...new Set(q.patterns.map(patternKey))] }));
const PATTERN_FILTERS = (() => {
  const count = {};
  CASES.forEach((c) => c.keys.forEach((k) => { count[k] = (count[k] || 0) + 1; }));
  return ["All", ...Object.keys(count).filter((k) => count[k] >= 3).sort((a, b) => count[b] - count[a])];
})();

function CaseStudies() {
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const query = q.trim().toLowerCase();
  const shown = CASES.filter((c) => (filter === "All" || c.keys.includes(filter))
    && (!query || `${c.title} ${c.company} ${c.focus} ${c.summary} ${c.classes} ${c.patterns.join(" ")}`.toLowerCase().includes(query)));
  const LIMIT = 9;
  const folded = !all && filter === "All" && !query && shown.length > LIMIT;
  const visible = folded ? shown.slice(0, LIMIT) : shown;
  const counts = (f) => CASES.filter((c) => f === "All" || c.keys.includes(f)).length;
  return (
    <>
      <div className="hb-cs-tools">
        <div className="hb-filters" role="group" aria-label="Filter case studies by design pattern">
          {PATTERN_FILTERS.map((f) => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}<span className="hb-mono">{counts(f)}</span></button>)}
        </div>
        <label className="hb-search">
          <MagnifyingGlass size={17} weight="bold" aria-hidden />
          <span className="hb-sr">Search case studies</span>
          <input id="hb-lld-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: parking, Splitwise, locking…" />
        </label>
      </div>
      <p className="hb-cs-count" aria-live="polite">{shown.length} of {CASES.length} case studies</p>
      {shown.length === 0 ? (
        <div className="hb-empty"><b>No case study matches “{q}”.</b><button type="button" className="hb-btn hb-btn-ghost" onClick={() => { setQ(""); setFilter("All"); }}>Show all {CASES.length}</button></div>
      ) : (
        <ol className="hb-cases">
          {visible.map((c) => (
            <li key={c.number} className="hb-case">
              <div className="hb-case-top"><span className="hb-case-n hb-mono">{c.number}</span><span className="hb-case-cat">{c.company}</span></div>
              <h3>{c.title}</h3>
              <p className="hb-case-sub">{c.focus}</p>
              <p className="hb-case-sum">{c.summary}</p>
              <p className="hb-case-classes"><span>Key classes</span><code>{c.classes}</code></p>
              <ul className="hb-tags hb-tags-pat" aria-label="Design patterns used">{c.patterns.map((t) => <li key={t}>{t}</li>)}</ul>
            </li>
          ))}
        </ol>
      )}
      {folded && <div className="hb-more"><button type="button" className="hb-btn hb-btn-ghost hb-btn-lg" onClick={() => setAll(true)}>Show all {CASES.length} case studies</button></div>}
    </>
  );
}

function PatternLibrary() {
  const kinds = Object.keys(patterns);
  const [kind, setKind] = useState(kinds[0]);
  const list = patterns[kind] || [];
  return (
    <div className="hb-patlib">
      <div className="hb-ptabs" role="tablist" aria-label="Pattern families">
        {kinds.map((k) => (
          <button key={k} id={`pt-${k}`} role="tab" type="button" aria-selected={kind === k} aria-controls="pt-panel" onClick={() => setKind(k)}>
            <b>{k}</b><small>{patterns[k].length} patterns · {PATTERN_KIND[k] || ""}</small>
          </button>
        ))}
      </div>
      <ul id="pt-panel" role="tabpanel" aria-labelledby={`pt-${kind}`} className="hb-pats" key={kind}>
        {list.map((p) => (
          <li key={p.name}>
            <b>{p.name}</b>
            <p>{p.purpose}</p>
            <dl>
              <div><dt>Example</dt><dd>{p.example}</dd></div>
              <div><dt>Use when</dt><dd>{p.when}</dd></div>
            </dl>
          </li>
        ))}
      </ul>
      <div className="hb-cues">
        <p className="hb-cues-k"><Lightbulb size={18} weight="duotone" aria-hidden />Which pattern? A quick cheat sheet from the book</p>
        <ul>{PATTERN_CUES.map(([q, a]) => <li key={q}><span>{q}</span><b>{a}</b></li>)}</ul>
      </div>
    </div>
  );
}

export default function SystemDesignLLD() {
  const theme = useSiteTheme();
  const isDark = theme === "dark";
  useReferral();
  const { product, loading } = useProduct(typeof window !== "undefined" ? window.location.pathname : PAGE_PATH);
  const { product: hldProduct } = useProduct(HLD_URL);
  const { product: comboProduct } = useProduct(COMBO_URL);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const heroRef = useRef(null);
  const previewRef = useRef(null);
  const heroVisible = useOnScreen(heroRef);
  const [previewStart, setPreviewStart] = useNear(previewRef);
  useTrackView(product, "Mastering System Design — LLD (Java)");

  const info = priceOf(product, loading);
  const cover = coverOf(product);
  const productName = product?.title || "Mastering System Design — Low-Level Design in Java";
  const buy = (p) => { if (!priceOf(p).canBuy) return; setCheckoutProduct(p); setIsCheckoutOpen(true); };
  const buyThis = () => buy(product);
  const openPreview = () => { setPreviewStart(true); scrollToId("preview"); };
  const canonicalUrl = `${SITE_URL}${PAGE_PATH}`;

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: SUPPORT_EMAIL },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, publisher: { "@id": `${SITE_URL}/#organization` } },
      { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: SEO_TITLE, description: SEO_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${canonicalUrl}#book` },
        ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover } } : {}) },
      { "@type": "BreadcrumbList", "@id": `${canonicalUrl}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
        { "@type": "ListItem", position: 3, name: "System Design LLD in Java", item: canonicalUrl },
      ] },
      { "@type": "Book", "@id": `${canonicalUrl}#book`, name: productName, description: SEO_DESCRIPTION, url: canonicalUrl, bookFormat: "https://schema.org/EBook",
        inLanguage: product?.language || "English", ...(product?.edition ? { bookEdition: product.edition } : {}), ...(cover ? { image: cover } : {}),
        publisher: { "@id": `${SITE_URL}/#organization` } },
      { "@type": "Product", "@id": `${canonicalUrl}#product`, name: productName, description: SEO_LONG_DESCRIPTION, url: canonicalUrl, category: "Low-Level Design Java Ebook",
        brand: { "@type": "Brand", name: SITE_NAME }, ...(product?._id ? { sku: String(product._id) } : {}), ...(cover ? { image: [cover] } : {}),
        ...(info.canBuy ? { offers: { "@type": "Offer", url: canonicalUrl, price: info.price, priceCurrency: info.currency, priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
          availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition",
          hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" },
          seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } } : {}) },
      { "@type": "ItemList", "@id": `${canonicalUrl}#curriculum`, name: "14-part curriculum of the Java LLD handbook", numberOfItems: modules.length,
        itemListElement: modules.map((m, i) => ({ "@type": "ListItem", position: i + 1, name: m.title, description: m.detail })) },
      { "@type": "FAQPage", "@id": `${canonicalUrl}#faq`, mainEntity: faqItems.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  }), [cover, canonicalUrl, info.canBuy, info.price, info.currency, product?._id, product?.language, product?.edition, productName]);

  const offers = [
    product && { key: "lld", p: product, current: true, eyebrow: "Low-level design · Java", title: productName,
      copy: "How one service is built: classes, relationships, SOLID, design patterns, concurrency and working Java.",
      points: ["16 coded LLD case studies", "All 23 GoF design patterns", "60-minute interview framework"], cta: "Get the LLD book" },
    hldProduct && { key: "hld", p: hldProduct, eyebrow: "High-level design", title: hldProduct.title || "Mastering System Design — HLD",
      copy: "Architecture for the whole system: requirements, estimates, APIs, data stores, caching, queues and failures.",
      points: ["19 HLD case studies", "16 building-block primers", "45-minute interview playbook"], href: HLD_URL, cta: "Get the HLD book" },
    comboProduct && priceOf(comboProduct).valid && { key: "combo", p: comboProduct, best: true, eyebrow: "Best value · both rounds", title: comboProduct.title || "Mastering System Design: HLD + LLD Combo",
      copy: "Practical Java class design in LLD, plus distributed architecture and scalable backends in HLD.",
      points: ["This LLD book and the HLD book", "16 LLD problems plus 19 HLD case studies", "Java code, design patterns and architecture"], href: COMBO_URL, cta: "Get the combo" },
  ].filter(Boolean);

  return (
    <div className="hb" data-theme={theme}>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta name="author" content={SITE_NAME} />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="theme-color" content={isDark ? "#0a1312" : "#f6f8f7"} />
        <meta name="color-scheme" content={isDark ? "dark" : "light"} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        {cover && <link rel="preload" as="image" href={cover} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_HREF} rel="stylesheet" />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl} />
        {cover && <meta property="og:image" content={cover} />}
        {cover && <meta property="og:image:alt" content={`${productName} ebook cover`} />}
        {info.canBuy && <meta property="product:price:amount" content={String(info.price)} />}
        {info.canBuy && <meta property="product:price:currency" content={info.currency} />}
        <meta name="twitter:card" content={cover ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        {cover && <meta name="twitter:image" content={cover} />}
        {cover && <meta name="twitter:image:alt" content={`${productName} ebook cover`} />}
        <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
      </Helmet>
      <a href="#hb-main" className="hb-skip">Skip to content</a>

      <main id="hb-main">
        <BookHero
          heroRef={heroRef} crumb="System Design LLD (Java)"
          pill={<><Code size={14} weight="bold" aria-hidden />Java LLD interview handbook · PDF ebook</>}
          title={<>Design classes interviewers trust, <span className="hb-mark">in clean Java.</span></>}
          lead="Turn requirements into classes, relationships and patterns, then into working Java. Learn OOP, SOLID, all 23 GoF patterns and concurrency, and practise on 16 real problems like BookMyShow, Splitwise and a rate limiter."
          stats={HERO_STATS} info={info} onBuy={buyThis} onPreview={openPreview} providerName={PAYMENT_PROVIDER_NAME}
          cover={cover} coverTitle={productName} coverFallback={{ subtitle: "Low-Level Design in Java", line: "23 patterns · 16 case studies" }} nav={PAGE_NAV}
        />

        <BookOffers
          offers={offers} onBuy={buy} onPreview={openPreview}
          title="LLD, HLD, or both rounds together"
          lead="LLD is how one service is built in code. HLD is how the whole system scales. Most product companies ask both, and the combo covers both rounds."
          compare={{ head: ["HLD", "LLD (this book)"], mine: 1, rows: hldVsLld }}
        />

        <PreviewSection
          sectionRef={previewRef} file={LLD_PREVIEW_PDF} bookTitle="Mastering System Design LLD (Java)" start={previewStart}
          onBuy={buyThis} canBuy={info.canBuy} priceLabel={info.label} fullBookLine="The full book has all 14 parts and 16 coded case studies."
          points={["No download, no sign-up", "Same layout and depth as the full book", "Full book: 23 patterns, 16 coded case studies"]}
        />

        <Section id="case-studies" eyebrow="What's inside" title="16 LLD problems, designed and coded in Java" lead="The problems product companies actually ask. Each one comes with a UML class diagram, a Java implementation and a runnable scenario. Filter by the pattern it uses.">
          <CaseStudies />
        </Section>

        <Section id="patterns" eyebrow="Design patterns" title="All 23 GoF patterns, and when to use each" lead="Not a definition list. Each pattern comes with a real example and the signal that tells you to reach for it in an interview." tint>
          <PatternLibrary />
        </Section>

        <Section id="curriculum" eyebrow="Curriculum" title="14 parts, from first class to production" lead="Start from OOP and work up to patterns, concurrency, Spring Boot and the interview itself.">
          <ol className="hb-curr">
            {modules.map(({ number, title, detail, icon: Icon }) => (
              <li key={number}>
                <span className="hb-ico"><Icon size={20} weight="duotone" aria-hidden /></span>
                <div><span className="hb-mono">Part {number}</span><b>{title}</b><p>{detail}</p></div>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="method" eyebrow="The method" title="How to answer an LLD round in 60 minutes" lead="The book's ten-step framework. Every case study follows it, so you can apply it to a problem you have never seen." tint>
          <ol className="hb-steps hb-steps-2">
            {FRAMEWORK_STEPS.map(([n, t, d]) => <li key={n}><span className="hb-mono">{n}</span><div><b>{t}</b><p>{d}</p></div></li>)}
          </ol>
          <div className="hb-princ-wrap">
            <div className="hb-play-head"><Stack size={20} weight="duotone" aria-hidden /><h3 className="hb-h3">The {principles.length} principles behind every design</h3></div>
            <ul className="hb-princ">{principles.map((p) => <li key={p.title}><b>{p.title}</b><span>{p.short}</span></li>)}</ul>
          </div>
        </Section>

        <Section id="for-you" eyebrow="Who it's for" title="From your first LLD round to SDE 2">
          <div className="hb-split">
            <ul className="hb-who">
              {AUDIENCE.map(([t, d]) => <li key={t}><Target size={18} weight="duotone" aria-hidden /><div><b>{t}</b><p>{d}</p></div></li>)}
            </ul>
            <div className="hb-get">
              <p className="hb-get-k">What you get</p>
              <ul>{VALUE.map(([Icon, t, d]) => <li key={t}><Icon size={18} weight="duotone" aria-hidden /><div><b>{t}</b><p>{d}</p></div></li>)}</ul>
              <div className="hb-get-buy">
                <Price info={info} />
                <button type="button" className={cx("hb-btn hb-btn-primary hb-btn-block")} onClick={buyThis} disabled={!info.canBuy}>Get the ebook<ArrowRight size={17} weight="bold" aria-hidden /></button>
              </div>
            </div>
          </div>
        </Section>

        <FaqSection items={faqItems} />

        <FinalSection
          title={<>Explain why each class exists, <span className="hb-mark">then write it in Java.</span></>}
          line="23 patterns, 16 coded case studies and one interview method, in a digital PDF you can read anywhere."
          info={info} onBuy={buyThis} onPreview={openPreview}
        >
          <ResumePromo variant="card" pain lead="Ready for the LLD round?" accent="Make sure your resume gets you there." isDark={isDark} />
        </FinalSection>
      </main>

      <BookFooter line="Mastering System Design: Low-Level Design in Java · Digital PDF ebook · Digital purchases are not refundable" links={[[HLD_URL, "System Design HLD"], [COMBO_URL, "HLD + LLD Combo"]]} />
      <BuyBar name="Mastering System Design LLD (Java)" info={info} onBuy={buyThis} onPreview={openPreview} hidden={isCheckoutOpen} heroVisible={heroVisible} />
      <PayUCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={checkoutProduct || product} />
    </div>
  );
}
