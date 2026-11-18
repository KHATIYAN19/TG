import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, ArrowsClockwise, Check, CheckCircle, Lightbulb, MagnifyingGlass, Target, X, XCircle } from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import ResumePromo from "../resume/ResumePromo.jsx";
import {
  BookFooter, BookHero, BookOffers, BuyBar, FONT_HREF, FaqSection, FinalSection, Price, SITE_NAME, SITE_URL, SUPPORT_EMAIL,
  coverOf, cx, priceOf, scrollToId, useOnScreen, useProduct, useReferral, useSiteTheme, useTrackView,
} from "./bookKit";
import "./genaiBook.css";
import "./javaBook.css";

/*
  The Java backend interview pages (/book/java-interview-handbook, /book/springboot-interview-handbook) share this kit.
  It sits on bookKit (pricing, checkout, theme, hero, offers, FAQ, buy bar), reuses the generic genaiKit blocks
  (Cards, Flow, CodeTabs) and adds what a question-bank book needs: an at-a-glance fact sheet, a searchable list of
  all 100 questions, sample answers, a quiz, a before/after list and a 7-day revision plan.
  Styles: BookPage.css (hb-*) + genaiBook.css (gx-*) + javaBook.css (jx-*).
*/

const PAYMENT_PROVIDER_NAME = gatewayLabel(preferredGateway("books"));

export const JAVA_SERIES = {
  java: {
    path: "/book/java-interview-handbook", eyebrow: "Core Java · 100 Q&A", title: "Java Interview Handbook",
    copy: "Core Java, OOP, Strings, Collections and HashMap internals, Streams, multithreading, JVM and modern Java 17 / 21.",
    points: ["100 questions in 12 chapters", "Output puzzles and coding questions", "JVM, GC and concurrency internals"], cta: "Get the Java book",
  },
  spring: {
    path: "/book/springboot-interview-handbook", eyebrow: "Spring Boot · 100 Q&A", title: "Spring Boot Interview Handbook",
    copy: "IoC and DI, REST APIs, Spring Data JPA, transactions and AOP, Security with JWT, microservices, Redis, Kafka and real scenarios.",
    points: ["100 questions in 10 chapters", "Java and Spring code examples", "10 SDE-2 backend scenarios"], cta: "Get the Spring Boot book",
  },
  lld: {
    path: "/book/system-design/lld", eyebrow: "Low-level design · Java", title: "Mastering System Design — LLD (Java)",
    copy: "Turn requirements into clean object models, apply SOLID and design patterns, and practise complete Java LLD problems.",
    points: ["Java, OOP, SOLID and UML", "23 GoF design patterns", "16 detailed LLD case studies"], cta: "Get the LLD book",
  },
};

/* ------------------------------------------------------------------ page shell */
/*
  Everything the two pages share: SEO + schema, product + price, checkout, hero, the series offers, FAQ, final call
  to action, footer and the docked buy bar. `children({ info, buy, offers })` renders the page's own sections;
  `offers` is the series block, so each page decides where the other books appear.
*/
export function JavaSeriesPage({ id, sibling, seo, hero, nav, faqs, answers = [], final, footerLine, chapters, samplesId = "samples", children }) {
  const book = JAVA_SERIES[id];
  const other = JAVA_SERIES[sibling];
  const theme = useSiteTheme();
  const isDark = theme === "dark";
  useReferral();
  const { product, loading } = useProduct(book.path);
  const { product: otherProduct } = useProduct(other.path);
  const { product: lldProduct } = useProduct(JAVA_SERIES.lld.path);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const heroRef = useRef(null);
  const heroVisible = useOnScreen(heroRef);
  useTrackView(product, book.title);

  const info = priceOf(product, loading);
  const cover = coverOf(product);
  const productName = product?.title || book.title;
  const buy = (p) => { if (!priceOf(p).canBuy) return; setCheckoutProduct(p); setIsCheckoutOpen(true); };
  const buyThis = () => buy(product);
  const seeSamples = () => scrollToId(samplesId);
  const canonicalUrl = `${SITE_URL}${book.path}`;
  const questionCount = chapters.reduce((n, c) => n + c.questions.length, 0);

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: SUPPORT_EMAIL,
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: SUPPORT_EMAIL, availableLanguage: ["English"] } },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: "en-IN", publisher: { "@id": `${SITE_URL}/#organization` } },
      { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: seo.title, description: seo.description, inLanguage: "en-IN",
        isPartOf: { "@id": `${SITE_URL}/#website` }, breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` }, about: { "@id": `${canonicalUrl}#product` },
        speakable: { "@type": "SpeakableSpecification", cssSelector: [".jx-glance-def", ".jx-sa-answer"] },
        ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover } } : {}) },
      { "@type": "BreadcrumbList", "@id": `${canonicalUrl}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
        { "@type": "ListItem", position: 3, name: hero.crumb, item: canonicalUrl },
      ] },
      { "@type": ["Product", "Book"], "@id": `${canonicalUrl}#product`, name: productName, description: seo.long || seo.description, url: canonicalUrl,
        category: seo.category, keywords: seo.keywords, inLanguage: "en", bookFormat: "https://schema.org/EBook",
        genre: "Computer science, Java programming, interview preparation", teaches: seo.teaches,
        audience: { "@type": "Audience", audienceType: "Students, Java developers and backend engineers preparing for technical interviews" },
        brand: { "@type": "Brand", name: SITE_NAME }, author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` },
        isAccessibleForFree: false, ...(product?._id ? { sku: String(product._id) } : {}), ...(cover ? { image: [cover] } : {}),
        ...(info.valid && info.price > 0 ? { offers: { "@type": "Offer", url: canonicalUrl, price: info.price, priceCurrency: info.currency, priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
          availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition",
          hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" },
          seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } } : {}) },
      { "@type": "ItemList", "@id": `${canonicalUrl}#chapters`, name: `Chapters of the ${book.title}`, numberOfItems: chapters.length,
        itemListElement: chapters.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, description: `${c.range}: ${c.description}` })) },
      { "@type": "ItemList", "@id": `${canonicalUrl}#questions`, name: `${questionCount} questions in the ${book.title}`, numberOfItems: questionCount,
        itemListElement: chapters.flatMap((c) => c.questions).map((q, i) => ({ "@type": "ListItem", position: i + 1, name: q })) },
      { "@type": "FAQPage", "@id": `${canonicalUrl}#faq`, mainEntity: [...answers.map((s) => ({ q: s.q, a: s.a })), ...faqs].map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  }), [cover, canonicalUrl, info.valid, info.price, info.currency, product?._id, productName]); // eslint-disable-line react-hooks/exhaustive-deps

  const offerOf = (key, p, current) => p && { key, p, current, href: JAVA_SERIES[key].path, eyebrow: JAVA_SERIES[key].eyebrow,
    title: (current ? productName : p.title) || JAVA_SERIES[key].title, copy: JAVA_SERIES[key].copy, points: JAVA_SERIES[key].points, cta: JAVA_SERIES[key].cta };
  const offerList = [offerOf(id, product, true), offerOf(sibling, otherProduct), offerOf("lld", lldProduct)].filter(Boolean);
  const offers = (
    <BookOffers
      offers={offerList} onBuy={buy} onPreview={seeSamples} sampleLabel="Sample answers"
      title="The Java backend interview series"
      lead="Core Java is the first round, Spring Boot is the backend round and LLD is the design round. Each book stands alone, and together they cover a full Java SDE interview loop."
    />
  );

  return (
    <div className="hb gx jx" data-theme={theme}>
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
        {cover && <meta name="twitter:image:alt" content={`${productName} ebook cover`} />}
        <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
      </Helmet>
      <a href="#hb-main" className="hb-skip">Skip to content</a>

      <main id="hb-main">
        <BookHero
          heroRef={heroRef} crumb={hero.crumb} pill={hero.pill} title={hero.title} lead={hero.lead} stats={hero.stats}
          info={info} onBuy={buyThis} onPreview={seeSamples} providerName={PAYMENT_PROVIDER_NAME}
          cover={cover} coverTitle={productName} coverFallback={hero.coverFallback} nav={nav} previewLabel="Read sample answers"
        />

        {children({ info, buy: buyThis, offers })}

        <FaqSection items={faqs} />

        <FinalSection title={final.title} line={final.line} info={info} onBuy={buyThis} onPreview={seeSamples} previewLabel="Read sample answers">
          <ResumePromo variant="banner" isDark={isDark} />
        </FinalSection>
      </main>

      <BookFooter line={footerLine} links={[[other.path, other.title], [JAVA_SERIES.lld.path, "System Design LLD (Java)"]]} />
      <BuyBar name={productName} info={info} onBuy={buyThis} onPreview={seeSamples} previewLabel="Samples" hidden={isCheckoutOpen} heroVisible={heroVisible} />
      <PayUCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={checkoutProduct || product} />
    </div>
  );
}

/* ------------------------------------------------------------------ content blocks */

/* a plain-language definition plus a fact sheet: the part search engines and AI assistants quote */
export function Glance({ definition, facts, topics }) {
  return (
    <div className="jx-glance">
      <div className="jx-glance-main">
        <p className="jx-glance-def">{definition}</p>
        {topics && (
          <ul className="jx-topics" aria-label="Topics covered">
            {topics.map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}
      </div>
      <dl className="jx-facts">
        {facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
      </dl>
    </div>
  );
}

/* "the usual way" vs "with this book", one row per problem */
export function Swap({ rows, beforeLabel = "Without a plan", afterLabel = "With this handbook" }) {
  return (
    <div className="jx-swap">
      <div className="jx-swap-head" aria-hidden><span><X size={13} weight="bold" />{beforeLabel}</span><span><Check size={13} weight="bold" />{afterLabel}</span></div>
      <ul>
        {rows.map((r) => (
          <li key={r.before}>
            <p className="jx-swap-b"><XCircle size={18} weight="fill" aria-hidden /><span><span className="hb-sr">{beforeLabel}: </span>{r.before}</span></p>
            <ArrowRight className="jx-swap-arr" size={16} weight="bold" aria-hidden />
            <p className="jx-swap-a"><CheckCircle size={18} weight="fill" aria-hidden /><span><span className="hb-sr">{afterLabel}: </span>{r.after}</span></p>
          </li>
        ))}
      </ul>
    </div>
  );
}

const highlight = (text, query) => {
  if (!query) return text;
  const i = text.toLowerCase().indexOf(query);
  if (i < 0) return text;
  return <>{text.slice(0, i)}<mark className="jx-hl">{text.slice(i, i + query.length)}</mark>{text.slice(i + query.length)}</>;
};

/* all questions in the book: level filter, search, and one accordion per chapter */
export function QuestionBank({ chapters, levels, placeholder = "Search all questions" }) {
  const [level, setLevel] = useState("All");
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const numbered = useMemo(() => {
    let n = 0;
    return chapters.map((c) => ({ ...c, items: c.questions.map((text) => { n += 1; return { n, text }; }) }));
  }, [chapters]);
  const total = numbered.reduce((s, c) => s + c.items.length, 0);
  const byLevel = (l) => numbered.filter((c) => l === "All" || c.level === l).reduce((s, c) => s + c.items.length, 0);

  const shown = numbered
    .filter((c) => level === "All" || c.level === level)
    .map((c) => {
      if (!query) return c;
      const chapterHit = `${c.title} ${c.description}`.toLowerCase().includes(query);
      return { ...c, items: chapterHit ? c.items : c.items.filter((it) => it.text.toLowerCase().includes(query)) };
    })
    .filter((c) => c.items.length);
  const hits = shown.reduce((s, c) => s + c.items.length, 0);
  const reset = () => { setQ(""); setLevel("All"); };

  return (
    <div className="jx-qb">
      <div className="jx-mix" aria-label="Questions by level">
        <div className="jx-mix-bar" aria-hidden>
          {levels.map((l, i) => <span key={l} className={`l${i}`} style={{ flexGrow: byLevel(l) }} />)}
        </div>
        <ul className="jx-mix-key">
          {levels.map((l, i) => <li key={l}><i className={`l${i}`} aria-hidden /><b className="hb-mono">{byLevel(l)}</b>{l}</li>)}
        </ul>
      </div>

      <div className="hb-cs-tools">
        <div className="hb-filters" role="group" aria-label="Filter questions by level">
          {["All", ...levels].map((l) => <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)}>{l}<span className="hb-mono">{byLevel(l)}</span></button>)}
        </div>
        <label className="hb-search">
          <MagnifyingGlass size={17} weight="bold" aria-hidden />
          <span className="hb-sr">Search all {total} questions</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} />
        </label>
      </div>
      <p className="hb-cs-count" aria-live="polite">{hits} of {total} questions{query ? ` match “${q.trim()}”` : ""}</p>

      {shown.length === 0 ? (
        <div className="hb-empty"><b>No question mentions “{q.trim()}”.</b><button type="button" className="hb-btn hb-btn-ghost" onClick={reset}>Show all {total} questions</button></div>
      ) : (
        <div className="jx-qb-list">
          {shown.map((c, idx) => (
            <details key={`${c.n}-${query ? "q" : "a"}-${level}`} className="hb-acc jx-ch" open={Boolean(query) || idx === 0}>
              <summary>
                <span className="hb-mono">{c.n}</span>
                <span><b>{highlight(c.title, query)}</b><small><span className="hb-mono">{c.range}</span> · {c.items.length} {c.items.length === 1 ? "question" : "questions"}</small></span>
                <em className={cx("jx-lvl", `l${Math.max(0, levels.indexOf(c.level))}`)}>{c.level}</em>
              </summary>
              <div className="hb-acc-body">
                <p>{c.description}</p>
                <ol className="jx-qs">
                  {c.items.map((it) => <li key={it.n}><span className="hb-mono">Q{it.n}</span><span>{highlight(it.text, query)}</span></li>)}
                </ol>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

/* sample interview answers: pick a question, read the answer and the follow-up */
export function SampleAnswers({ items }) {
  const [i, setI] = useState(0);
  const s = items[i];
  return (
    <div className="jx-sa">
      <div className="jx-sa-tabs" role="tablist" aria-label="Sample questions">
        {items.map((it, n) => (
          <button key={it.q} type="button" role="tab" id={`jx-sa-t${n}`} aria-controls="jx-sa-panel" aria-selected={i === n} onClick={() => setI(n)}>
            <span className="hb-mono">{String(n + 1).padStart(2, "0")}</span>
            <span className="jx-sa-tab-t"><b>{it.short}</b><small>{it.category}</small></span>
          </button>
        ))}
      </div>
      <article key={s.q} id="jx-sa-panel" role="tabpanel" aria-labelledby={`jx-sa-t${i}`} className="jx-sa-card">
        <div className="jx-sa-meta"><span className="jx-chip">{s.category}</span><span className="jx-chip is-soft">{s.level}</span></div>
        <h3>{s.q}</h3>
        <div className="jx-sa-block">
          <span className="gx-kicker">Interview answer</span>
          <p className="jx-sa-answer">{s.a}</p>
        </div>
        {s.points && <ul className="hb-checks">{s.points.map((p) => <li key={p}><Check size={15} weight="bold" aria-hidden />{p}</li>)}</ul>}
        {s.code && <pre className="jx-sa-code"><code>{s.code}</code></pre>}
        {s.followUp && (
          <p className="jx-sa-follow"><Lightbulb size={18} weight="fill" aria-hidden /><span><b>Likely follow-up:</b> {s.followUp}</span></p>
        )}
        <div className="jx-sa-nav">
          <button type="button" className="hb-btn hb-btn-ghost" onClick={() => setI((x) => (x + items.length - 1) % items.length)}>Previous</button>
          <span className="hb-mono">{i + 1} / {items.length}</span>
          <button type="button" className="hb-btn hb-btn-ghost" onClick={() => setI((x) => (x + 1) % items.length)}>Next question<ArrowRight size={16} weight="bold" aria-hidden /></button>
        </div>
      </article>
    </div>
  );
}

/* a short quiz: pick an option, see why, move on, get a score */
export function Quiz({ items, info, onBuy, label = "Quick quiz" }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = items[i];
  const answered = picked !== null;
  const right = answered && picked === q.answer;
  const choose = (n) => { if (answered) return; setPicked(n); if (n === q.answer) setScore((s) => s + 1); };
  const next = () => { if (i === items.length - 1) { setDone(true); return; } setI(i + 1); setPicked(null); };
  const restart = () => { setI(0); setPicked(null); setScore(0); setDone(false); };

  if (done) {
    const perfect = score === items.length;
    return (
      <div className="jx-quiz jx-quiz-done" aria-live="polite">
        <span className="jx-score hb-mono">{score}/{items.length}</span>
        <h3>{perfect ? "Clean sweep. You read code like an interviewer." : "These are exactly the traps interviewers set."}</h3>
        <p>{perfect ? "The book has many more like these, plus the internals behind every answer." : "Every one of them is explained step by step in the book, with the internals behind the answer."}</p>
        <div className="hb-row hb-row-center">
          <button type="button" className="hb-btn hb-btn-primary" onClick={onBuy} disabled={!info.canBuy}>Get the ebook · {info.label}<ArrowRight size={16} weight="bold" aria-hidden /></button>
          <button type="button" className="hb-btn hb-btn-ghost" onClick={restart}><ArrowsClockwise size={16} weight="bold" aria-hidden />Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="jx-quiz">
      <div className="jx-quiz-top">
        <span className="gx-kicker">{label}</span>
        <span className="jx-quiz-prog" aria-label={`Question ${i + 1} of ${items.length}`}>
          {items.map((_, n) => <i key={n} className={cx(n < i && "is-done", n === i && "is-on")} aria-hidden />)}
          <span className="hb-mono">{i + 1}/{items.length}</span>
        </span>
      </div>
      <h3 className="jx-quiz-q">{q.question}</h3>
      {q.code && (
        <div className="gx-win jx-quiz-code">
          <div className="gx-win-bar"><span className="gx-dots" aria-hidden><i /><i /><i /></span><span className="gx-win-name hb-mono">{q.file || "Main.java"}</span></div>
          <pre className="gx-pre"><code>{q.code}</code></pre>
        </div>
      )}
      <div className="jx-opts" role="group" aria-label="Answer options">
        {q.options.map((o, n) => {
          const state = !answered ? "" : n === q.answer ? "is-right" : n === picked ? "is-wrong" : "is-dim";
          return (
            <button key={o} type="button" className={cx("jx-opt", state)} onClick={() => choose(n)} disabled={answered} aria-pressed={picked === n}>
              <span className="hb-mono">{String.fromCharCode(65 + n)}</span><span>{o}</span>
              {answered && n === q.answer && <CheckCircle size={18} weight="fill" aria-hidden />}
              {answered && n === picked && n !== q.answer && <XCircle size={18} weight="fill" aria-hidden />}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={cx("jx-explain", right ? "is-right" : "is-wrong")} aria-live="polite">
          <b>{right ? "Correct." : `Not quite. The answer is ${String.fromCharCode(65 + q.answer)}.`}</b>
          <p>{q.explain}</p>
          <button type="button" className="hb-btn hb-btn-primary" onClick={next}>{i === items.length - 1 ? "See my score" : "Next question"}<ArrowRight size={16} weight="bold" aria-hidden /></button>
        </div>
      )}
    </div>
  );
}

/* a day-by-day revision plan */
export function Plan({ days }) {
  return (
    <ol className="jx-plan">
      {days.map((d, n) => (
        <li key={d.title}>
          <span className="jx-plan-d hb-mono">Day {String(n + 1).padStart(2, "0")}</span>
          <b>{d.title}</b>
          <p>{d.text}</p>
          {d.chapters && <small className="hb-mono">{d.chapters}</small>}
        </li>
      ))}
    </ol>
  );
}

/* who the book is for, next to the dark "what you get" panel with the price */
export function ForYou({ audience, included, info, onBuy }) {
  return (
    <div className="hb-split">
      <ul className="hb-who">
        {audience.map(({ icon: Icon = Target, title, text }) => <li key={title}><Icon size={20} weight="duotone" aria-hidden /><div><b>{title}</b><p>{text}</p></div></li>)}
      </ul>
      <div className="hb-get">
        <p className="hb-get-k">What you get</p>
        <ul className="jx-get-list">{included.map((x) => <li key={x}><Check size={16} weight="bold" aria-hidden /><span>{x}</span></li>)}</ul>
        <div className="hb-get-buy">
          <Price info={info} />
          <button type="button" className="hb-btn hb-btn-primary hb-btn-block" onClick={onBuy} disabled={!info.canBuy}>Get the ebook<ArrowRight size={17} weight="bold" aria-hidden /></button>
        </div>
      </div>
    </div>
  );
}
