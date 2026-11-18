import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Check, CheckCircle, Copy, FileText, MagnifyingGlass, Question, Target } from "@phosphor-icons/react";

import PayUCheckoutModal from "../../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../../payment/gatewayConfig";
import ResumePromo from "../../resume/ResumePromo.jsx";
import {
  BookFooter, BookHero, BookOffers, BuyBar, FONT_HREF, FaqSection, FinalSection, Price, SITE_NAME, SITE_URL, Section,
  coverOf, priceOf, scrollToId, useOnScreen, useProduct, useReferral, useSiteTheme, useTrackView,
} from "../bookKit";
import "./csBook.css";

/*
  CS CORE BOOK PAGE: the shared frame for the Computer Networks, Operating Systems and SQL books.
  Same look and buying flow as the System Design HLD page (bookKit + BookPage.css), plus the pieces a
  subject book needs: quick answers, interactive "try it" labs (passed in as children), mental models,
  a searchable syllabus and runnable code samples. Each book is just a data object.
*/

const PROVIDER = gatewayLabel(preferredGateway("books"));

/* the three CS core books, cross-sold on every page */
export const CORE_BOOKS = [
  { key: "cn", path: "/book/computer-network", eyebrow: "Computer Networks", title: "Computer Networks: The Placement Handbook",
    copy: "OSI and TCP/IP, subnetting, routing, TCP, DNS, HTTP and TLS, with solved numericals.", points: ["12 chapters, physical to application", "25 solved numericals", "Interview Q&A and port cheat-sheet"], cta: "Get CN book" },
  { key: "os", path: "/books/operating-systems", eyebrow: "Operating Systems", title: "Operating Systems: The Placement Handbook",
    copy: "Processes, threads, scheduling, synchronization, deadlocks, memory and file systems.", points: ["Scheduling with Gantt charts", "Paging, page replacement, deadlocks", "Interview Q&A and numericals"], cta: "Get OS book" },
  { key: "sql", path: "/book/database/sql", eyebrow: "SQL & Databases", title: "SQL & Database Interview Handbook",
    copy: "From first SELECT to window functions, indexes, transactions and scaling databases.", points: ["Joins, CTEs, window functions", "Indexes, transactions, isolation", "Interview-style query problems"], cta: "Get SQL book" },
];

/* ------------------------------------------------------------------ quick answers */
function QuickAnswers({ items }) {
  return (
    <Section id="answers" eyebrow="Quick answers" title="Short answers, straight from the book" lead="The questions asked most in exams and interviews, answered the way you would say them out loud.">
      <ul className="cs-qa">
        {items.map((it) => (
          <li key={it.q}>
            <h3><Question size={18} weight="duotone" aria-hidden />{it.q}</h3>
            <p>{it.a}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/* ------------------------------------------------------------------ mental models: a few flows that explain the subject */
function Flows({ flows }) {
  return (
    <Section id="models" eyebrow={flows.eyebrow || "Mental models"} title={flows.title} lead={flows.lead} tint>
      <div className="cs-flows">
        {flows.items.map(({ n, title, icon: Icon, copy, steps, note }) => (
          <article key={title} className="cs-flow">
            <div className="cs-flow-top">
              <span className="hb-ico"><Icon size={20} weight="duotone" aria-hidden /></span>
              <div><span className="cs-k hb-mono">Model {n}</span><h3 className="hb-h3">{title}</h3></div>
            </div>
            <p className="hb-muted">{copy}</p>
            <ol className="cs-chain" aria-label={`${title}, step by step`}>
              {steps.map((s, i) => <li key={s}>{i > 0 && <i aria-hidden>→</i>}<span className="cs-chip"><span className="hb-mono">{i + 1}</span>{s}</span></li>)}
            </ol>
            <p className="cs-note"><CheckCircle size={16} weight="fill" aria-hidden /><span>{note}</span></p>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ syllabus: parts, chapters, sections, searchable */
const hit = (text, q) => q && text.toLowerCase().includes(q);

function Syllabus({ parts, title, lead }) {
  const [part, setPart] = useState("all");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const totalCh = parts.reduce((n, p) => n + p.chapters.length, 0);
  const totalSec = parts.reduce((n, p) => n + p.chapters.reduce((m, c) => m + c.sections.length, 0), 0);

  const shown = parts
    .filter((p) => part === "all" || p.id === part)
    .map((p) => ({ ...p, chapters: p.chapters.filter((c) => !query || [c.title, c.details || "", ...c.sections].join(" ").toLowerCase().includes(query)) }))
    .filter((p) => p.chapters.length);
  const count = shown.reduce((n, p) => n + p.chapters.length, 0);

  return (
    <Section id="syllabus" eyebrow="Syllabus" title={title} lead={lead}>
      <div className="hb-cs-tools">
        <div className="hb-filters" role="group" aria-label="Filter by part">
          <button type="button" aria-pressed={part === "all"} onClick={() => setPart("all")}>All parts<span className="hb-mono">{totalCh}</span></button>
          {parts.map((p) => <button key={p.id} type="button" aria-pressed={part === p.id} onClick={() => setPart(p.id)}>{p.title}<span className="hb-mono">{p.chapters.length}</span></button>)}
        </div>
        <label className="hb-search">
          <MagnifyingGlass size={17} weight="bold" aria-hidden />
          <span className="hb-sr">Search the syllabus</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search any topic…" />
        </label>
      </div>
      <p className="hb-cs-count" aria-live="polite">
        {query || part !== "all" ? `${count} of ${totalCh} chapters` : `${totalCh} chapters · ${totalSec} sections`}
      </p>

      {count === 0 ? (
        <div className="hb-empty"><b>No chapter mentions “{q}”.</b><button type="button" className="hb-btn hb-btn-ghost" onClick={() => { setQ(""); setPart("all"); }}>Show the full syllabus</button></div>
      ) : (
        <div className="cs-parts">
          {shown.map((p) => (
            <div key={p.id} className="cs-part">
              <div className="cs-part-head"><span className="hb-mono">Part {p.number}</span><b>{p.title}</b><small>{p.subtitle}</small></div>
              <div className="cs-chapters">
                {p.chapters.map((c, i) => (
                  <details key={`${c.n}-${query}`} className="hb-acc" open={Boolean(query) || (part === "all" && p === shown[0] && i === 0)}>
                    <summary><span className="hb-mono">{c.n}</span><span><b>{c.title}</b><small>{c.sections.length} sections</small></span></summary>
                    <div className="hb-acc-body">
                      {c.details && <p>{c.details}</p>}
                      <ul className="cs-secs">{c.sections.map((s) => <li key={s} className={hit(s, query) ? "is-hit" : ""}><Check size={14} weight="bold" aria-hidden />{s}</li>)}</ul>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

/* ------------------------------------------------------------------ code samples */
function Samples({ samples, title, lead }) {
  const [id, setId] = useState(samples[0].id);
  const [copied, setCopied] = useState(false);
  const cur = samples.find((s) => s.id === id) || samples[0];
  const copy = async () => {
    try { await navigator.clipboard.writeText(cur.code); setCopied(true); window.setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ }
  };
  return (
    <Section id="code" eyebrow="Free samples" title={title} lead={lead} tint>
      <div className="cs-code">
        <div className="cs-code-tabs" role="tablist" aria-label="Code samples">
          {samples.map((s) => (
            <button key={s.id} type="button" role="tab" id={`code-${s.id}`} aria-selected={s.id === cur.id} aria-controls="code-panel" onClick={() => { setId(s.id); setCopied(false); }}>
              {s.label}
            </button>
          ))}
        </div>
        <div className="cs-code-panel" id="code-panel" role="tabpanel" aria-labelledby={`code-${cur.id}`} key={cur.id}>
          <div className="cs-code-copy">
            <h3 className="hb-h3">{cur.title}</h3>
            <p className="hb-muted">{cur.description}</p>
          </div>
          <div className="cs-term">
            <div className="cs-term-bar">
              <span className="cs-dots" aria-hidden><i /><i /><i /></span>
              <span className="hb-mono">{cur.filename}</span>
              <button type="button" onClick={copy} aria-label={`Copy ${cur.filename}`}>{copied ? <><Check size={14} weight="bold" aria-hidden />Copied</> : <><Copy size={14} weight="bold" aria-hidden />Copy</>}</button>
            </div>
            <pre tabIndex={0}><code>{cur.code}</code></pre>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ page */
export default function CsBookPage({ book, children }) {
  const theme = useSiteTheme();
  const isDark = theme === "dark";
  useReferral();

  /* this book plus the other two core books (fixed number of hooks, always in the same order) */
  const cn = useProduct(CORE_BOOKS[0].path);
  const os = useProduct(CORE_BOOKS[1].path);
  const sql = useProduct(CORE_BOOKS[2].path);
  const byKey = { cn, os, sql };
  const { product, loading } = byKey[book.key];

  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const heroRef = useRef(null);
  const heroVisible = useOnScreen(heroRef);
  useTrackView(product, book.productName);

  const info = priceOf(product, loading);
  const cover = coverOf(product);
  const productName = product?.title || book.productName;
  const canonicalUrl = `${SITE_URL}${book.path}`;
  const buy = (p) => { if (!priceOf(p).canBuy) return; setCheckoutProduct(p); setIsCheckoutOpen(true); };
  const buyThis = () => buy(product);
  const openSample = () => scrollToId(book.sampleTarget || "try");

  const allChapters = book.curriculum.flatMap((p) => p.chapters);
  const structuredData = useMemo(() => JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: "supporttargettrek@gmail.com" },
      { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: book.seo.title, description: book.seo.description, inLanguage: "en-IN",
        breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` }, about: { "@id": `${canonicalUrl}#product` }, ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover } } : {}) },
      { "@type": "BreadcrumbList", "@id": `${canonicalUrl}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
        { "@type": "ListItem", position: 3, name: book.crumb, item: canonicalUrl },
      ] },
      { "@type": ["Product", "Book"], "@id": `${canonicalUrl}#product`, name: productName, description: book.seo.long || book.seo.description, url: canonicalUrl,
        category: book.seo.category, keywords: book.seo.keywords, inLanguage: "en", bookFormat: "https://schema.org/EBook",
        brand: { "@type": "Brand", name: SITE_NAME }, author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` },
        isAccessibleForFree: false, ...(product?._id ? { sku: String(product._id) } : {}), ...(cover ? { image: [cover] } : {}),
        ...(info.valid && info.price > 0 ? { offers: { "@type": "Offer", url: canonicalUrl, price: info.price, priceCurrency: info.currency, priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
          availability: "https://schema.org/InStock", seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } } : {}) },
      { "@type": "ItemList", "@id": `${canonicalUrl}#chapters`, name: `${book.crumb} ebook chapters`, numberOfItems: allChapters.length,
        itemListElement: allChapters.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, ...(c.details ? { description: c.details } : {}) })) },
      { "@type": "FAQPage", "@id": `${canonicalUrl}#faq`, mainEntity: [...book.quick, ...book.faqs].map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  }).replace(/</g, "\\u003c"), [cover, canonicalUrl, info.valid, info.price, info.currency, product?._id, productName]); // eslint-disable-line react-hooks/exhaustive-deps

  const offers = CORE_BOOKS.map((b) => {
    const p = byKey[b.key].product;
    if (!p) return null;
    const current = b.key === book.key;
    return { key: b.key, p, current, eyebrow: b.eyebrow, title: p.title || b.title, copy: b.copy, points: b.points, href: b.path, cta: current ? "Get this ebook" : b.cta };
  }).filter(Boolean);

  return (
    <div className="hb cs" data-theme={theme}>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{book.seo.title}</title>
        <meta name="description" content={book.seo.description} />
        <meta name="keywords" content={book.seo.keywords} />
        <meta name="author" content={SITE_NAME} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="theme-color" content={isDark ? "#0a1312" : "#f6f8f7"} />
        <meta name="color-scheme" content={isDark ? "dark" : "light"} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {cover && <link rel="preload" as="image" href={cover} />}
        <link href={FONT_HREF} rel="stylesheet" />
        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={book.seo.title} />
        <meta property="og:description" content={book.seo.description} />
        <meta property="og:url" content={canonicalUrl} />
        {cover && <meta property="og:image" content={cover} />}
        {info.valid && info.price > 0 && <meta property="product:price:amount" content={String(info.price)} />}
        {info.valid && info.price > 0 && <meta property="product:price:currency" content={info.currency} />}
        <meta name="twitter:card" content={cover ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={book.seo.title} />
        <meta name="twitter:description" content={book.seo.description} />
        {cover && <meta name="twitter:image" content={cover} />}
        <script type="application/ld+json">{structuredData}</script>
      </Helmet>
      <a href="#hb-main" className="hb-skip">Skip to content</a>

      <main id="hb-main">
        <BookHero
          heroRef={heroRef} crumb={book.crumb}
          pill={<><FileText size={14} weight="bold" aria-hidden />{book.pill}</>}
          title={book.h1} lead={book.lead} stats={book.stats}
          info={info} onBuy={buyThis} onPreview={openSample} providerName={PROVIDER} previewLabel="Try it free"
          cover={cover} coverTitle={productName} coverFallback={book.cover} nav={book.nav}
        />

        <QuickAnswers items={book.quick} />
        {children}
        <Flows flows={book.flows} />
        <Syllabus parts={book.curriculum} title={book.syllabusTitle} lead={book.syllabusLead} />
        <Samples samples={book.samples} title={book.samplesTitle} lead={book.samplesLead} />

        <BookOffers
          offers={offers} onBuy={buy} onPreview={openSample}
          title="The CS core set: Networks, OS and SQL"
          lead="The three subjects asked in almost every campus and off-campus technical round. Start with this one, add the others when you need them."
        />

        <Section id="for-you" eyebrow="Who it's for" title={book.forTitle} tint>
          <div className="hb-split">
            <ul className="cs-aud">
              {book.audiences.map(({ icon: Icon = Target, title, copy, points }) => (
                <li key={title}>
                  <span className="hb-ico"><Icon size={20} weight="duotone" aria-hidden /></span>
                  <div>
                    <b>{title}</b>
                    <p>{copy}</p>
                    {points && <ul className="cs-aud-pts">{points.map((p) => <li key={p}><Check size={13} weight="bold" aria-hidden />{p}</li>)}</ul>}
                  </div>
                </li>
              ))}
            </ul>
            <div className="hb-get">
              <p className="hb-get-k">What you get</p>
              <ul>{book.value.map(({ title, copy, icon: Icon }) => <li key={title}><Icon size={18} weight="duotone" aria-hidden /><div><b>{title}</b><p>{copy}</p></div></li>)}</ul>
              <div className="hb-get-buy">
                <Price info={info} />
                <button type="button" className="hb-btn hb-btn-primary hb-btn-block" onClick={buyThis} disabled={!info.canBuy}>Get the ebook<ArrowRight size={17} weight="bold" aria-hidden /></button>
              </div>
            </div>
          </div>
        </Section>

        <FaqSection items={book.faqs} />

        <FinalSection title={book.final.title} line={book.final.line} info={info} onBuy={buyThis} onPreview={openSample} previewLabel="Try it free">
          <ResumePromo variant="banner" isDark={isDark} />
        </FinalSection>
      </main>

      <BookFooter line={book.footLine} links={CORE_BOOKS.filter((b) => b.key !== book.key).map((b) => [b.path, b.eyebrow])} />
      <BuyBar name={book.productName} info={info} onBuy={buyThis} onPreview={openSample} hidden={isCheckoutOpen} heroVisible={heroVisible} previewLabel="Try free" />
      <PayUCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={checkoutProduct || product} />
    </div>
  );
}

/* a small helper the labs share: a pill toggle row */
export function Seg({ options, value, onChange, label }) {
  return (
    <div className="cs-seg" role="group" aria-label={label}>
      {options.map(([v, text]) => <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>{text}</button>)}
    </div>
  );
}
