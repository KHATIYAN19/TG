import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowDown, ArrowRight, Check, CheckCircle, Copy, File, FolderOpen, MagnifyingGlass, Terminal, X } from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import ResumePromo from "../resume/ResumePromo.jsx";
import {
  BookFooter, BookHero, BookOffers, BuyBar, FONT_HREF, FaqSection, FinalSection, SITE_NAME, SITE_URL,
  coverOf, cx, priceOf, scrollToId, useOnScreen, useProduct, useReferral, useSiteTheme, useTrackView,
} from "./bookKit";
import "./genaiBook.css";

/*
  The three GenAI book pages (/book/genai/mcp, /book/genai/rag, /book/genai/google-adk) share this kit.
  It sits on bookKit (pricing, checkout, theme, hero, offers, FAQ, buy bar) and adds the pieces a
  technical book needs: an architecture flow, a chapter explorer, a code viewer and a project file tree.
  Styles: BookPage.css (hb-*) + genaiBook.css (gx-*).
*/

const PAYMENT_PROVIDER_NAME = gatewayLabel(preferredGateway("books"));

export const GENAI_BOOKS = {
  mcp: {
    path: "/book/genai/mcp", eyebrow: "Model Context Protocol", title: "Master GenAI Interview — MCP",
    copy: "Hosts, clients, servers, JSON-RPC, STDIO and HTTP transports, FastMCP, LangChain and a full authenticated Python project.",
    points: ["16 chapters in 4 stages", "FastMCP servers and clients", "Complete reminder application"], cta: "Get the MCP book",
  },
  rag: {
    path: "/book/genai/rag", eyebrow: "Retrieval-Augmented Generation", title: "Master GenAI Interview — RAG Pipeline",
    copy: "Ingestion, chunking, embeddings, vector databases, retrieval, re-ranking, evaluation and production RAG with LangChain.",
    points: ["25 chapters in 5 stages", "Offline and online pipelines", "Vector database guide"], cta: "Get the RAG book",
  },
  adk: {
    path: "/book/genai/google-adk", eyebrow: "AI agents · Google ADK", title: "Google ADK Complete Developer Handbook",
    copy: "Agents, tools, sessions, memory, multi-agent orchestration, guardrails, evaluation, RAG, MCP and deployment.",
    points: ["32 chapters", "Single and multi-agent systems", "Production practices"], cta: "Get the ADK book",
  },
};

/* ------------------------------------------------------------------ page shell */
/*
  Everything that is the same on all three pages: SEO + schema, product + price, checkout, hero, the
  "other GenAI books" row, FAQ, final call to action, footer and the docked buy bar.
  `children({ info, buy })` renders the page's own content sections between the offers and the FAQ.
*/
export function GenaiBookPage({ id, seo, hero, nav, contentsId = "contents", faqs, final, footerLine, schemaExtra = [], onCheckout, children }) {
  const book = GENAI_BOOKS[id];
  const others = Object.entries(GENAI_BOOKS).filter(([k]) => k !== id);
  const theme = useSiteTheme();
  const isDark = theme === "dark";
  useReferral();
  const { product, loading } = useProduct(book.path);
  const { product: otherA } = useProduct(others[0][1].path);
  const { product: otherB } = useProduct(others[1][1].path);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const heroRef = useRef(null);
  const heroVisible = useOnScreen(heroRef);
  useTrackView(product, book.title);

  const info = priceOf(product, loading);
  const cover = coverOf(product);
  const productName = product?.title || book.title;
  /* source says which button was used; onCheckout lets a page send its own analytics before checkout opens */
  const buy = (p, source = "offers") => {
    if (!priceOf(p).canBuy) return;
    try { onCheckout?.(p, source, p === product ? productName : p.title, p === product); } catch (e) { console.warn("Checkout analytics warning:", e); }
    setCheckoutProduct(p); setIsCheckoutOpen(true);
  };
  const buyThis = (source = "page") => buy(product, typeof source === "string" ? source : "page");
  const seeInside = () => scrollToId(contentsId);
  const canonicalUrl = `${SITE_URL}${book.path}`;

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: "supporttargettrek@gmail.com",
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "supporttargettrek@gmail.com", availableLanguage: ["English"] } },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: "en-IN", publisher: { "@id": `${SITE_URL}/#organization` } },
      { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: seo.title, description: seo.description, inLanguage: "en-IN",
        isPartOf: { "@id": `${SITE_URL}/#website` }, breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` }, about: { "@id": `${canonicalUrl}#product` },
        ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover } } : {}) },
      { "@type": "BreadcrumbList", "@id": `${canonicalUrl}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
        { "@type": "ListItem", position: 3, name: hero.crumb, item: canonicalUrl },
      ] },
      { "@type": ["Product", "Book"], "@id": `${canonicalUrl}#product`, name: productName, description: seo.long || seo.description, url: canonicalUrl,
        category: seo.category, keywords: seo.keywords, inLanguage: "en", bookFormat: "https://schema.org/EBook",
        genre: "Computer science, generative AI, interview preparation",
        audience: { "@type": "Audience", audienceType: "Software engineers and GenAI developers" },
        brand: { "@type": "Brand", name: SITE_NAME }, author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` },
        isAccessibleForFree: false, ...(product?._id ? { sku: String(product._id) } : {}), ...(cover ? { image: [cover] } : {}),
        ...(info.valid && info.price > 0 ? { offers: { "@type": "Offer", url: canonicalUrl, price: info.price, priceCurrency: info.currency, priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
          availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition",
          hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" },
          seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } } : {}) },
      { "@type": "FAQPage", "@id": `${canonicalUrl}#faq`, mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      ...schemaExtra.map((s) => ({ ...s, "@id": `${canonicalUrl}#${s.idSuffix}`, idSuffix: undefined })),
    ],
  }), [cover, canonicalUrl, info.valid, info.price, info.currency, product?._id, productName]); // eslint-disable-line react-hooks/exhaustive-deps

  const offerOf = (key, p, current) => p && { key, p, current, href: GENAI_BOOKS[key].path, eyebrow: GENAI_BOOKS[key].eyebrow,
    title: (current ? productName : p.title) || GENAI_BOOKS[key].title, copy: GENAI_BOOKS[key].copy, points: GENAI_BOOKS[key].points, cta: GENAI_BOOKS[key].cta };
  const offers = [offerOf(id, product, true), offerOf(others[0][0], otherA), offerOf(others[1][0], otherB)].filter(Boolean);

  return (
    <div className="hb gx" data-theme={theme}>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        <meta name="keywords" content={seo.keywords} />
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
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        <meta property="og:url" content={canonicalUrl} />
        {info.valid && info.price > 0 && <meta property="product:price:amount" content={String(info.price)} />}
        {info.valid && info.price > 0 && <meta property="product:price:currency" content={info.currency} />}
        {cover && <meta property="og:image" content={cover} />}
        {cover && <meta property="og:image:alt" content={`${productName} ebook cover`} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seo.title} />
        <meta name="twitter:description" content={seo.description} />
        {cover && <meta name="twitter:image" content={cover} />}
        <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
      </Helmet>
      <a href="#hb-main" className="hb-skip">Skip to content</a>

      <main id="hb-main">
        <BookHero
          heroRef={heroRef} crumb={hero.crumb} pill={hero.pill} title={hero.title}
          lead={product?.shortDescription || hero.lead} stats={hero.stats} info={info} onBuy={() => buyThis("hero")} onPreview={seeInside}
          providerName={PAYMENT_PROVIDER_NAME} cover={cover} coverTitle={productName} coverFallback={hero.coverFallback} nav={nav}
          previewLabel="See what's inside"
        />

        {children({ info, buy: buyThis })}

        <BookOffers
          offers={offers} onBuy={buy} onPreview={seeInside} sampleLabel="See chapters"
          title="The GenAI interview series"
          lead="Three books that fit together: RAG for grounding answers in your data, MCP for connecting models to tools, and Google ADK for building the agents that use both."
        />

        <FaqSection items={faqs} />

        <FinalSection title={final.title} line={final.line} info={info} onBuy={() => buyThis("final_cta")} onPreview={seeInside} previewLabel="See the chapters">
          <ResumePromo variant="banner" isDark={isDark} />
        </FinalSection>
      </main>

      <BookFooter line={footerLine} links={others.map(([, b]) => [b.path, b.title])} />
      <BuyBar name={productName} info={info} onBuy={() => buyThis("mobile_sticky")} onPreview={seeInside} previewLabel="Chapters" hidden={isCheckoutOpen} heroVisible={heroVisible} />
      <PayUCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={checkoutProduct || product} />
    </div>
  );
}

/* ------------------------------------------------------------------ content blocks */

/* a request moving through boxes, left to right on wide screens and top to bottom on phones */
export function Flow({ steps, label, note }) {
  return (
    <figure className="gx-flow" aria-label={label}>
      <ol className="gx-flow-row" style={{ "--n": steps.length }}>
        {steps.map(({ icon: Icon, title, text, tag }, n) => (
          <Fragment key={title}>
            {n > 0 && <li className="gx-flow-arrow" aria-hidden><ArrowRight className="gx-arr-x" size={18} weight="bold" /><ArrowDown className="gx-arr-y" size={18} weight="bold" /></li>}
            <li className="gx-node">
              <span className="gx-node-top"><span className="hb-ico"><Icon size={20} weight="duotone" aria-hidden /></span>{tag && <span className="gx-node-tag hb-mono">{tag}</span>}</span>
              <b>{title}</b>
              <p>{text}</p>
            </li>
          </Fragment>
        ))}
      </ol>
      {note && <figcaption className="gx-note">{note}</figcaption>}
    </figure>
  );
}

/* "without" vs "with" */
export function BeforeAfter({ before, after }) {
  return (
    <div className="gx-ba">
      <div className="gx-ba-card is-before"><span className="gx-ba-k"><X size={14} weight="bold" aria-hidden />{before.label}</span><p>{before.text}</p>{before.line && <p className="gx-ba-line">{before.line}</p>}</div>
      <div className="gx-ba-card is-after"><span className="gx-ba-k"><Check size={14} weight="bold" aria-hidden />{after.label}</span><p>{after.text}</p>{after.line && <p className="gx-ba-line">{after.line}</p>}</div>
    </div>
  );
}

/* icon cards: optional kicker above the title and a code chip below */
export function Cards({ items, cols = 3 }) {
  return (
    <ul className={cx("gx-cards", `c${cols}`)}>
      {items.map(({ icon: Icon, kicker, title, text, code, points }) => (
        <li key={title} className="gx-card">
          <span className="hb-ico"><Icon size={22} weight="duotone" aria-hidden /></span>
          {kicker && <span className="gx-kicker">{kicker}</span>}
          <h3>{title}</h3>
          <p>{text}</p>
          {points && <ul className="hb-checks">{points.map((x) => <li key={x}><Check size={15} weight="bold" aria-hidden />{x}</li>)}</ul>}
          {code && <code className="gx-chip hb-mono">{code}</code>}
        </li>
      ))}
    </ul>
  );
}

/* two options side by side, with "use it when" bullets */
export function Versus({ items }) {
  return (
    <div className="gx-vs">
      {items.map(({ icon: Icon, title, badge, text, points }, n) => (
        <article key={title} className={cx("gx-vs-card", n === 1 && "is-alt")}>
          <div className="gx-vs-top"><span className="hb-ico"><Icon size={22} weight="duotone" aria-hidden /></span><div><span className="gx-kicker">{badge}</span><h3>{title}</h3></div></div>
          <p>{text}</p>
          <ul className="hb-checks">{points.map((x) => <li key={x}><Check size={15} weight="bold" aria-hidden />{x}</li>)}</ul>
        </article>
      ))}
    </div>
  );
}

/* the book's contents: stage tabs, a search box, and the chapters of the chosen stage */
export function Chapters({ stages, placeholder = "Search chapters" }) {
  const [active, setActive] = useState(stages[0].id);
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const total = stages.reduce((n, s) => n + s.chapters.length, 0);
  const shown = query
    ? stages.map((s) => ({ ...s, chapters: s.chapters.filter((c) => `${c.title} ${c.details} ${s.title}`.toLowerCase().includes(query)) })).filter((s) => s.chapters.length)
    : stages.filter((s) => s.id === active);
  const hits = shown.reduce((n, s) => n + s.chapters.length, 0);
  return (
    <div className="gx-ch">
      <div className="gx-ch-tools">
        <div className="gx-ch-tabs" role="tablist" aria-label="Book stages">
          {stages.map((s, n) => (
            <button key={s.id} type="button" role="tab" aria-selected={!query && active === s.id} onClick={() => { setQ(""); setActive(s.id); }}>
              <span className="hb-mono">{String(n + 1).padStart(2, "0")}</span>
              <span className="gx-ch-tab-t"><b>{s.title}</b><small>{s.chapters.length} chapters</small></span>
            </button>
          ))}
        </div>
        <label className="hb-search gx-ch-search">
          <MagnifyingGlass size={17} weight="bold" aria-hidden />
          <span className="hb-sr">Search all {total} chapters</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
        </label>
      </div>
      {query && <p className="hb-cs-count" aria-live="polite">{hits} of {total} chapters match “{q}”</p>}
      {shown.length === 0 ? (
        <div className="hb-empty"><b>No chapter mentions “{q}”.</b><button type="button" className="hb-btn hb-btn-ghost" onClick={() => setQ("")}>Show all chapters</button></div>
      ) : shown.map((s) => (
        <section key={s.id} className="gx-ch-stage" aria-label={s.title}>
          <header><h3>{s.title}</h3>{s.subtitle && <p>{s.subtitle}</p>}</header>
          <ol className="gx-ch-list">
            {s.chapters.map((c) => (
              <li key={c.n}>
                <span className="gx-ch-n hb-mono">{c.n}</span>
                <div><b>{c.title}</b><p>{c.details}</p></div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

/* a dark code window with tabs and a copy button */
export function CodeTabs({ examples, points }) {
  const [active, setActive] = useState(examples[0].id);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  const ex = examples.find((e) => e.id === active) || examples[0];
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try { await navigator.clipboard.writeText(ex.code); setCopied(true); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };
  return (
    <div className="gx-code">
      <div className="gx-code-side">
        <div className="gx-code-tabs" role="tablist" aria-label="Code examples">
          {examples.map((e) => <button key={e.id} type="button" role="tab" aria-selected={active === e.id} onClick={() => { setActive(e.id); setCopied(false); }}>{e.label}</button>)}
        </div>
        <div className="gx-code-about">
          <h3>{ex.title}</h3>
          <p>{ex.description}</p>
          {points && <ul className="hb-checks">{points.map((x) => <li key={x}><Check size={15} weight="bold" aria-hidden />{x}</li>)}</ul>}
        </div>
      </div>
      <div className="gx-win" role="tabpanel" aria-label={ex.title}>
        <div className="gx-win-bar">
          <span className="gx-dots" aria-hidden><i /><i /><i /></span>
          <span className="gx-win-name hb-mono">{ex.filename === "terminal" ? <><Terminal size={13} weight="bold" aria-hidden />terminal</> : ex.filename}</span>
          <button type="button" className="gx-copy" onClick={copy} aria-live="polite">{copied ? <><CheckCircle size={14} weight="fill" aria-hidden />Copied</> : <><Copy size={14} weight="bold" aria-hidden />Copy</>}</button>
        </div>
        <pre className="gx-pre"><code>{ex.code}</code></pre>
      </div>
    </div>
  );
}

/* a project's files as a tree */
export function FileTree({ root, files }) {
  return (
    <div className="gx-tree">
      <p className="gx-tree-root hb-mono"><FolderOpen size={16} weight="duotone" aria-hidden />{root}</p>
      <ul>
        {files.map((f) => (
          <li key={f.name}>
            <File size={15} weight="duotone" aria-hidden />
            <div><b className="hb-mono">{f.name}</b><p>{f.description}</p></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
