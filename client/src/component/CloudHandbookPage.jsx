import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, BookOpen, Check, Copy, FileText, Lightbulb, MagnifyingGlass, Path, Stack, Target, Terminal, TreeStructure,
} from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import ResumePromo from "../resume/ResumePromo.jsx";
import {
  BookFooter, BookHero, BookOffers, BuyBar, FONT_HREF, FinalSection, Price, SITE_NAME, SITE_URL, SUPPORT_EMAIL, Section,
  coverOf, cx, priceOf, scrollToId, useOnScreen, useProduct, useReferral, useSiteTheme, useTrackView,
} from "./bookKit";

import "./cloudBook.css";

/*
  CLOUD BOOK PAGE: one layout for /book/cloud/aws and /book/cloud/gcp, on the same kit as the HLD page (bookKit.jsx).
  Order answers a buyer's questions in turn:
    what is it and what does it cost (hero) → the short answer (overview) → AWS or GCP (choose)
    → can I try it (free CLI samples) → which service do I need (picker) → how is it taught (path, chapter template)
    → is my topic in it (searchable contents, every part closed until opened) → architectures and labs → is it for me → buy.
  No FAQ section. Book facts live in awsBookData.js / gcpBookData.js.
*/

const PAYMENT_PROVIDER_NAME = gatewayLabel(preferredGateway("books"));

/* ------------------------------------------------------------------ small pieces */

const CLI_WORDS = new Set(["aws", "gcloud", "bq", "kubectl", "gsutil"]);

/* light shell colouring: comments, the CLI name, --flags, quoted strings, $VARS */
function Shell({ code }) {
  return code.split("\n").map((line, ln) => {
    if (/^\s*#/.test(line)) return <span key={ln} className="hc-c">{line}{"\n"}</span>;
    const parts = line.split(/(\s+)/);
    let first = true;
    return (
      <span key={ln}>
        {parts.map((w, i) => {
          if (!w || /^\s+$/.test(w)) return w;
          let cls = "";
          if (first && CLI_WORDS.has(w)) cls = "hc-k";
          else if (w.startsWith("--")) cls = "hc-f";
          else if (/^["'`]/.test(w) || /["'`]$/.test(w)) cls = "hc-s";
          else if (w.includes("$")) cls = "hc-v";
          if (w !== "\\") first = false;
          return cls ? <span key={i} className={cls}>{w}</span> : w;
        })}
        {"\n"}
      </span>
    );
  });
}

function CopyButton({ text }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
      }
      setDone(true);
      window.setTimeout(() => setDone(false), 1600);
    } catch { /* copying is a convenience; ignore failures */ }
  };
  return (
    <button type="button" className="hc-copy" onClick={copy} aria-label={done ? "Copied" : "Copy commands"}>
      {done ? <Check size={14} weight="bold" aria-hidden /> : <Copy size={14} weight="bold" aria-hidden />}
      <span>{done ? "Copied" : "Copy"}</span>
    </button>
  );
}

/* tabs on a scrollable rail, one sample visible at a time */
function Samples({ items, cliName }) {
  const [active, setActive] = useState(items[0]?.id);
  const onKey = (e) => {
    const i = items.findIndex((x) => x.id === active);
    let n = -1;
    if (e.key === "ArrowRight") n = (i + 1) % items.length;
    if (e.key === "ArrowLeft") n = (i - 1 + items.length) % items.length;
    if (n < 0) return;
    e.preventDefault();
    setActive(items[n].id);
    document.getElementById(`hc-tab-${items[n].id}`)?.focus();
  };
  return (
    <div className="hc-samples">
      <div className="hc-rail" role="tablist" aria-label={`Free ${cliName} samples`} onKeyDown={onKey}>
        {items.map((x) => (
          <button key={x.id} id={`hc-tab-${x.id}`} type="button" role="tab" aria-selected={active === x.id} aria-controls={`hc-panel-${x.id}`}
            tabIndex={active === x.id ? 0 : -1} onClick={() => setActive(x.id)}>
            {x.tab}
          </button>
        ))}
      </div>
      {items.map((x) => (
        <div key={x.id} id={`hc-panel-${x.id}`} role="tabpanel" aria-labelledby={`hc-tab-${x.id}`} hidden={active !== x.id} className="hc-sample">
          <div className="hc-sample-info">
            <span className="hb-eyebrow">{x.where}</span>
            <h3 className="hb-h3">{x.title}</h3>
            <p className="hb-muted">{x.intro}</p>
            <p className="hc-tip"><Lightbulb size={17} weight="duotone" aria-hidden /><span><b>Interview tip:</b> {x.tip}</span></p>
          </div>
          <div className="hc-term">
            <div className="hc-term-bar">
              <span className="hc-dots" aria-hidden><i /><i /><i /></span>
              <span className="hb-mono">{x.file}</span>
              <CopyButton text={x.code} />
            </div>
            <pre className="hc-code" tabIndex={0} aria-label={`${x.title}: commands`}><code><Shell code={x.code} /></code></pre>
            <div className="hc-out">
              <span>Sample output</span>
              <pre tabIndex={0} aria-label={`${x.title}: sample output`}>{x.out}</pre>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

const matches = (text, q) => text.toLowerCase().includes(q);

/* the whole table of contents: every part closed until opened; a search opens the parts that match */
function Contents({ parts, deepLabel, searchHint }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(() => new Set());
  const query = q.trim().toLowerCase();

  const shown = useMemo(() => parts.map((p, i) => {
    if (!query) return { p, i, hits: null };
    const partHit = matches(`${p.number} ${p.title} ${p.summary}`, query);
    const hits = new Set(p.chapters.filter((c) => matches(`${c.n || ""} ${c.title} ${(c.topics || []).join(" ")}`, query)).map((c) => c.title));
    return partHit || hits.size ? { p, i, hits } : null;
  }).filter(Boolean), [parts, query]);

  const allOpen = !query && open.size === parts.length;
  const toggleAll = () => setOpen(allOpen ? new Set() : new Set(parts.map((_, i) => i)));
  const onToggle = (i) => (e) => {
    if (query) return; // while searching, matching parts are held open
    const isOpen = e.currentTarget.open;
    setOpen((cur) => {
      if (cur.has(i) === isOpen) return cur;
      const next = new Set(cur);
      if (isOpen) next.add(i); else next.delete(i);
      return next;
    });
  };

  return (
    <>
      <div className="hc-toc-tools">
        <label className="hb-search">
          <MagnifyingGlass size={17} weight="bold" aria-hidden />
          <span className="hb-sr">Search the contents</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchHint} />
        </label>
        {!query && <button type="button" className="hb-btn hb-btn-ghost" onClick={toggleAll} aria-expanded={allOpen}>{allOpen ? "Collapse all" : "Expand all"}</button>}
      </div>
      <p className="hb-cs-count" aria-live="polite">
        {query ? `${shown.length} of ${parts.length} parts mention “${q.trim()}”` : `${parts.length} sections · ${parts.reduce((n, p) => n + p.chapters.length, 0)} chapters`}
      </p>
      {shown.length === 0 ? (
        <div className="hb-empty"><b>Nothing in the contents matches “{q}”.</b><button type="button" className="hb-btn hb-btn-ghost" onClick={() => setQ("")}>Clear search</button></div>
      ) : (
        <div className="hb-syl">
          {shown.map(({ p, i, hits }) => (
            <details key={p.title} className="hb-acc" open={query ? true : open.has(i)} onToggle={onToggle(i)}>
              <summary>
                <span className="hb-mono">{p.number}</span>
                <span><b>{p.title}</b><small>{p.chapters.length} chapter{p.chapters.length === 1 ? "" : "s"} · {p.summary}</small></span>
              </summary>
              <div className="hb-acc-body">
                <ol className="hc-chapters">
                  {p.chapters.map((c) => (
                    <li key={c.title} className={cx(hits?.has(c.title) && "is-hit")}>
                      <div className="hc-ch-head">
                        {c.n && <span className="hb-mono">{c.n}</span>}
                        <b>{c.title}</b>
                        {c.deep && <span className="hc-badge">{deepLabel}</span>}
                      </div>
                      {c.topics?.length > 0 && <ul className="hb-tags">{c.topics.map((t) => <li key={t}>{t}</li>)}</ul>}
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          ))}
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ the page */

/*
  config: {
    path, otherUrl, seo: { title, description, longDescription, keywords }, data (the book data module),
    crumb, shortName, cliName, wiki: { name, url }, pill, heroTitle, heroLead, stats, coverFallback,
    templateSection: { eyebrow, title, lead, items }, deepLabel, searchHint, finalTitle, finalLine, footerLine, footerLinks, teaches
  }
*/
export default function CloudHandbookPage({ config }) {
  const { data, seo } = config;
  const theme = useSiteTheme();
  const isDark = theme === "dark";
  useReferral();
  const { product, loading } = useProduct(config.path);
  const { product: otherProduct } = useProduct(config.otherUrl);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const heroRef = useRef(null);
  const heroVisible = useOnScreen(heroRef);
  useTrackView(product, data.HANDBOOK.title);

  const info = priceOf(product, loading);
  const cover = coverOf(product);
  const productName = product?.title || data.HANDBOOK.title;
  const canonicalUrl = `${SITE_URL}${config.path}`;
  const buy = (p) => { if (!priceOf(p).canBuy) return; setCheckoutProduct(p); setIsCheckoutOpen(true); };
  const buyThis = () => buy(product);
  const trySamples = () => scrollToId("samples");

  const nav = [
    ["overview", "Overview"], ["samples", "Free samples"], ["picker", "Which service?"], ["path", "Learning path"],
    ["contents", "Full contents"], ["architectures", "Architectures"], ["for-you", "Who it's for"],
  ];

  const structuredData = useMemo(() => {
    const org = { "@id": `${SITE_URL}/#organization` };
    return {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: SUPPORT_EMAIL,
          contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: SUPPORT_EMAIL, availableLanguage: ["English"] } },
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: "en-IN", publisher: org },
        { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: seo.title, description: seo.description, inLanguage: "en-IN",
          isPartOf: { "@id": `${SITE_URL}/#website` }, breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` }, about: { "@id": `${canonicalUrl}#product` },
          mainEntity: { "@id": `${canonicalUrl}#product` },
          speakable: { "@type": "SpeakableSpecification", cssSelector: [".hb-h1", ".hb-hero .hb-lead", ".hc-answer"] },
          ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover } } : {}) },
        { "@type": "BreadcrumbList", "@id": `${canonicalUrl}#breadcrumb`, itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
          { "@type": "ListItem", position: 3, name: config.crumb, item: canonicalUrl },
        ] },
        { "@type": ["Product", "Book"], "@id": `${canonicalUrl}#product`, name: productName, description: seo.longDescription, url: canonicalUrl,
          category: "Cloud computing ebook", keywords: seo.keywords, inLanguage: "en", bookFormat: "https://schema.org/EBook",
          genre: "Cloud computing, DevOps, interview preparation", educationalLevel: "Beginner to advanced", learningResourceType: "Handbook",
          audience: { "@type": "Audience", audienceType: "Developers, DevOps and cloud engineers, data engineers, architects and students" },
          about: { "@type": "Thing", name: config.wiki.name, sameAs: config.wiki.url },
          teaches: config.teaches,
          brand: { "@type": "Brand", name: SITE_NAME }, author: org, publisher: org, isAccessibleForFree: false,
          hasPart: data.PARTS_RAW.map((p, i) => ({ "@type": "Chapter", position: i + 1, name: /^\d+$/.test(p.number) ? `Part ${Number(p.number)}: ${p.title}` : p.title, description: p.summary })),
          ...(product?._id ? { sku: String(product._id) } : {}), ...(cover ? { image: [cover] } : {}),
          ...(info.valid && info.price > 0 ? { offers: { "@type": "Offer", url: canonicalUrl, price: info.price, priceCurrency: info.currency, priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
            availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition",
            hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" },
            seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } } : {}) },
        { "@type": "ItemList", "@id": `${canonicalUrl}#service-picker`, name: `Which ${config.shortName} service to use`, numberOfItems: data.PICKER.length,
          itemListElement: data.PICKER.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: `${x.need}: ${x.pick}`, description: `${x.why} ${x.alt}` })) },
        { "@type": "ItemList", "@id": `${canonicalUrl}#architectures`, name: `${config.shortName} reference architectures in the book`, numberOfItems: data.REF_ARCHS.length,
          itemListElement: data.REF_ARCHS.map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.title, description: `${r.copy} ${r.flow.join(" → ")}` })) },
      ],
    };
  }, [canonicalUrl, config, cover, data, info.currency, info.price, info.valid, product?._id, productName, seo]);

  const offers = [
    product && { key: "this", p: product, current: true, eyebrow: config.shortName, title: productName, copy: data.HANDBOOK.tagline,
      points: data.HANDBOOK.includes.slice(0, 3), cta: `Get the ${config.shortName} book` },
    otherProduct && priceOf(otherProduct).valid && { key: "other", p: otherProduct, eyebrow: data.OTHER_BOOK.eyebrow, title: otherProduct.title || data.OTHER_BOOK.title,
      copy: data.OTHER_BOOK.copy, points: data.OTHER_BOOK.points, href: config.otherUrl, cta: data.OTHER_BOOK.cta },
  ].filter(Boolean);

  const tmpl = config.templateSection;

  return (
    <div className="hb hb-cloud" data-theme={theme}>
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
          heroRef={heroRef} crumb={config.crumb} pill={<><FileText size={14} weight="bold" aria-hidden />{config.pill}</>}
          title={config.heroTitle} lead={config.heroLead} stats={config.stats}
          info={info} onBuy={buyThis} onPreview={trySamples} providerName={PAYMENT_PROVIDER_NAME} previewLabel="Try free samples"
          cover={cover} coverTitle={productName} coverFallback={config.coverFallback} nav={nav}
        />

        {/* the short answer: written to be quoted by search and AI answers */}
        <Section id="overview" eyebrow="In short" title={`What is ${data.HANDBOOK.title}?`}>
          <div className="hc-overview">
            <p className="hc-answer">{data.QUICK_ANSWER}</p>
            <div className="hc-includes">
              <p className="hb-get-k">Inside the PDF</p>
              <ul className="hb-checks">{data.HANDBOOK.includes.map((x) => <li key={x}><Check size={15} weight="bold" aria-hidden />{x}</li>)}</ul>
              <div className="hc-includes-buy">
                <Price info={info} />
                <button type="button" className="hb-btn hb-btn-primary" onClick={buyThis} disabled={!info.canBuy}>Get the ebook<ArrowRight size={17} weight="bold" aria-hidden /></button>
              </div>
            </div>
          </div>
        </Section>

        {offers.length > 1 && (
          <BookOffers
            offers={offers} onBuy={buy} onPreview={trySamples} sampleLabel="Free samples"
            title="AWS or Google Cloud: pick your platform"
            lead="Both handbooks take the same route: foundations, identity, compute, data, networking, security, AI, delivery and cost. Pick the cloud your team or target job uses."
          />
        )}

        <Section id="samples" eyebrow="Free · try before you buy" title={`Free ${config.cliName} samples from the book`}
          lead="Real commands in the style of the book's hands-on sections, each with sample output and the point interviewers want to hear." tint>
          <Samples items={data.SNIPPETS} cliName={config.cliName} />
        </Section>

        <Section id="picker" eyebrow="Service picker" title={`Which ${config.shortName} service should you use?`}
          lead="The common decisions, with the service to pick, why, and where the book goes deeper.">
          <ul className="hc-picks">
            {data.PICKER.map((x) => (
              <li key={x.need}>
                <span className="hc-need">{x.need}</span>
                <b className="hc-pick"><Target size={17} weight="duotone" aria-hidden />{x.pick}</b>
                <p>{x.why}</p>
                <p className="hc-alt">{x.alt}</p>
                <span className="hc-where hb-mono">{x.where}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="path" eyebrow="Learning path" title="Six stages, from first account to production" tint
          lead="Read it front to back as a course, or jump to the part you need. Each stage builds on the one before.">
          <ol className="hb-steps">
            {data.STAGES.map((s, i) => (
              <li key={s.title}><span className="hb-mono">{i + 1}</span><div><small className="hc-parts hb-mono">{s.parts}</small><b>{s.title}</b><p>{s.copy}</p></div></li>
            ))}
          </ol>
          <div className="hc-template">
            <div className="hb-play-head"><Stack size={20} weight="duotone" aria-hidden /><h3 className="hb-h3">{tmpl.title}</h3></div>
            <p className="hb-muted">{tmpl.lead}</p>
            <ol className={cx("hc-tmpl", tmpl.items.length <= 4 && "is-4")}>
              {tmpl.items.map((s, i) => <li key={s.title}><span className="hb-mono">{String(i + 1).padStart(2, "0")}</span><div><b>{s.title}</b><p>{s.copy}</p></div></li>)}
            </ol>
          </div>
        </Section>

        <Section id="contents" eyebrow="Full table of contents" title={`Every part and chapter of the ${config.shortName} handbook`}
          lead="Every part starts closed. Open one to see its chapters, or search for a service to check it's covered.">
          <Contents parts={data.PARTS_RAW} deepLabel={config.deepLabel} searchHint={config.searchHint} />
        </Section>

        <Section id="architectures" eyebrow="Put it together" title={config.archTitle} lead={config.archLead} tint>
          <ul className="hc-archs">
            {data.REF_ARCHS.map((r, i) => (
              <li key={r.title}>
                <div className="hc-arch-head"><TreeStructure size={20} weight="duotone" aria-hidden /><span className="hb-mono">Reference {i + 1}</span></div>
                <b>{r.title}</b>
                <p>{r.copy}</p>
                <ol className="hc-flow" aria-label={`${r.title} components in order`}>
                  {r.flow.map((f) => <li key={f}><span>{f}</span></li>)}
                </ol>
              </li>
            ))}
          </ul>
          {data.LABS && (
            <div className="hc-labs">
              <div className="hb-play-head"><Terminal size={20} weight="duotone" aria-hidden /><h3 className="hb-h3">{data.LABS.length} hands-on labs</h3></div>
              <ol className="hb-steps hb-steps-2">
                {data.LABS.map((l, i) => <li key={l.title}><span className="hb-mono">{i + 1}</span><div><b>Lab {i + 1}: {l.title}</b><p>{l.copy}</p></div></li>)}
              </ol>
            </div>
          )}
        </Section>

        <Section id="for-you" eyebrow="Who it's for" title={`Made for engineers who build on ${config.shortName}`}>
          <div className="hb-split">
            <ul className="hb-who">
              {data.AUDIENCE.map((a) => <li key={a.title}><Path size={18} weight="duotone" aria-hidden /><div><b>{a.title}</b><p>{a.copy}</p></div></li>)}
            </ul>
            <div className="hb-get">
              <p className="hb-get-k">What you get</p>
              <ul>{data.VALUE.map((v) => <li key={v.title}><BookOpen size={18} weight="duotone" aria-hidden /><div><b>{v.title}</b><p>{v.copy}</p></div></li>)}</ul>
              <div className="hb-get-buy">
                <Price info={info} />
                <button type="button" className="hb-btn hb-btn-primary hb-btn-block" onClick={buyThis} disabled={!info.canBuy}>Get the ebook<ArrowRight size={17} weight="bold" aria-hidden /></button>
                <p className="hc-fine">Digital PDF, shown on screen and sent by email after payment. Digital purchases are not refundable. Help: {SUPPORT_EMAIL}</p>
              </div>
            </div>
          </div>
        </Section>

        <FinalSection title={config.finalTitle} line={config.finalLine} info={info} onBuy={buyThis} onPreview={trySamples} previewLabel="Try free samples">
          <ResumePromo variant="banner" isDark={isDark} />
        </FinalSection>
      </main>

      <BookFooter line={config.footerLine} links={config.footerLinks} />
      <BuyBar name={data.HANDBOOK.title} info={info} onBuy={buyThis} onPreview={trySamples} hidden={isCheckoutOpen} heroVisible={heroVisible} previewLabel="Samples" />
      <PayUCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={checkoutProduct || product} />
    </div>
  );
}
