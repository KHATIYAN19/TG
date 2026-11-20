import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, BookOpen, Check, FileText, GitBranch, GitMerge, Lifebuoy, ListMagnifyingGlass, Terminal } from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import ResumePromo from "../resume/ResumePromo.jsx";
import {
  BookFooter, BookHero, BuyBar, FONT_HREF, FaqSection, FinalSection, Price, SITE_NAME, SITE_URL, Section,
  coverOf, priceOf, scrollToId, useOnScreen, useProduct, useReferral, useSiteTheme, useTrackView,
} from "./bookKit";
import {
  APPENDIX, CHEATSHEET, DIAGRAMS, FAQS, HANDBOOK, PAGE_URL, bookComparison, chapterGroups, cheatSheetSections, handbookChapters, highlights, topicMap,
} from "./gitBookData";

/*
  /book/git: ONE product (redirectUrl /book/git) that delivers TWO PDFs:
    Git & GitHub: The Complete Guide (123 pages) + Git & GitHub Cheat Sheet (19 pages).
  Order: hero → both books side by side → Guide contents → highlights → Cheat Sheet contents
         → topic finder → quick Git answers → FAQ → buy.
  Book facts come only from the book listings (see gitBookData.js).
*/

const PAYMENT_PROVIDER_NAME = gatewayLabel(preferredGateway("books"));
const CANONICAL_URL = `${SITE_URL}${PAGE_URL}`;
const BUNDLE_NAME = "Git & GitHub Complete Guide + Cheat Sheet";

const SEO_TITLE = "Git & GitHub Book + Cheat Sheet (PDF Ebooks) | Target Trek";
const SEO_DESCRIPTION = "Two Git PDFs in one: a 123-page Git & GitHub guide (21 chapters, real command output, diagrams) and a 19-page cheat sheet. Rebase, PRs, gh CLI, Actions.";
const SEO_LONG_DESCRIPTION = "Two Git and GitHub PDF ebooks by Target Trek in one purchase. Git & GitHub: The Complete Guide takes you from beginner to advanced in 21 chapters and 123 pages, with every command shown with real output (most local Git outputs captured from a real Git session), branching diagrams for fast-forward, three-way merge, rebase, cherry-pick, Git Flow, GitHub Flow and trunk-based development, a table of contents, page numbers and a command index of every git and gh command. It covers Git internals, branching, merging, rebasing, undoing safely with reset, revert and reflog, remotes, pull requests and code review, the GitHub CLI, security and branch protection, GitHub Actions CI/CD, open source conventions, advanced Git, troubleshooting and 25 interview questions with a 30-day plan. The Git & GitHub Cheat Sheet is a 19-page quick reference in 18 sections with command tables on every page and small diagrams for merge, rebase, reset and PR flow.";
const SEO_KEYWORDS = "git book, git ebook, git pdf, github book, git and github complete guide, git cheat sheet, git cheat sheet pdf, github cheat sheet, git commands, git rebase, interactive rebase, git merge vs rebase, git reset vs revert, git reflog, git branching strategies, git flow, github flow, trunk based development, pull requests, code review, github cli, gh cli, github actions, ci/cd, branch protection, dependabot, codeql, conventional commits, git lfs, git interview questions";

const PAGE_NAV = [["books", "Both books"], ["handbook", "Guide: 21 chapters"], ["highlights", "Real output"], ["cheat-sheet", "Cheat Sheet: 18 sections"], ["topics", "Topic finder"], ["answers", "Quick answers"], ["faq", "FAQ"]];
const HERO_STATS = [["2", "PDF ebooks"], [String(HANDBOOK.pages + CHEATSHEET.pages), "pages in total"], [String(HANDBOOK.chapters), "guide chapters"], [String(CHEATSHEET.sections), "cheat sheet sections"]];

const BOOK_CARDS = [
  { key: "handbook", href: "#handbook", eyebrow: `Book 1 · ${HANDBOOK.pages} pages`, book: HANDBOOK, link: `See all ${HANDBOOK.chapters} chapters` },
  { key: "sheet", href: "#cheat-sheet", eyebrow: `Book 2 · ${CHEATSHEET.pages} pages`, book: CHEATSHEET, link: `See all ${CHEATSHEET.sections} sections` },
];

const HIGHLIGHT_ICONS = [Terminal, GitBranch, ListMagnifyingGlass, Lifebuoy];
const BOOK_FAQS = FAQS.filter((f) => !f.topic);
const TOPIC_FAQS = FAQS.filter((f) => f.topic);

function GitBooks() {
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
    const bookBase = { "@type": "Book", inLanguage: "en", bookFormat: "https://schema.org/EBook", genre: "Software engineering, version control, DevOps",
      author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` },
      about: [{ "@type": "Thing", name: "Git", sameAs: "https://en.wikipedia.org/wiki/Git" }, { "@type": "Thing", name: "GitHub", sameAs: "https://en.wikipedia.org/wiki/GitHub" }] };
    return {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: "supporttargettrek@gmail.com",
          contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: "supporttargettrek@gmail.com", availableLanguage: ["English"] } },
        { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: "en-IN", publisher: { "@id": `${SITE_URL}/#organization` } },
        { "@type": "WebPage", "@id": `${CANONICAL_URL}#webpage`, url: CANONICAL_URL, name: SEO_TITLE, description: SEO_DESCRIPTION, inLanguage: "en-IN",
          isPartOf: { "@id": `${SITE_URL}/#website` }, breadcrumb: { "@id": `${CANONICAL_URL}#breadcrumb` }, about: { "@id": `${CANONICAL_URL}#product` },
          speakable: { "@type": "SpeakableSpecification", cssSelector: [".hb-h1", ".hb-hero .hb-lead", ".hb-answers p", ".hb-faq p"] },
          ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover } } : {}) },
        { "@type": "BreadcrumbList", "@id": `${CANONICAL_URL}#breadcrumb`, itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
          { "@type": "ListItem", position: 3, name: "Git & GitHub", item: CANONICAL_URL },
        ] },
        /* the thing you buy: one product that contains two books */
        { "@type": "Product", "@id": `${CANONICAL_URL}#product`, name: productName, description: SEO_LONG_DESCRIPTION, url: CANONICAL_URL,
          category: "Git and GitHub ebooks", keywords: SEO_KEYWORDS, brand: { "@type": "Brand", name: SITE_NAME },
          hasPart: [{ "@id": `${CANONICAL_URL}#handbook` }, { "@id": `${CANONICAL_URL}#cheat-sheet` }],
          ...(product?._id ? { sku: String(product._id) } : {}), ...(cover ? { image: [cover] } : {}),
          ...(info.valid && info.price > 0 ? { offers: { "@type": "Offer", url: CANONICAL_URL, price: info.price, priceCurrency: info.currency, priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
            availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition",
            hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" },
            seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } } : {}) },
        { ...bookBase, "@id": `${CANONICAL_URL}#handbook`, name: HANDBOOK.title, description: HANDBOOK.tagline, numberOfPages: HANDBOOK.pages,
          educationalLevel: "Beginner to advanced", learningResourceType: "Book",
          teaches: ["Git version control", "Branching and merging", "Rebasing", "Undoing changes with reset, revert and reflog", "Pull requests and code review", "GitHub CLI", "GitHub Actions CI/CD", "Branch protection and repository security"],
          hasPart: [
            ...handbookChapters.map((c) => ({ "@type": "Chapter", position: Number(c.number), name: c.title, ...(c.detail ? { description: c.detail } : {}) })),
            { "@type": "Chapter", position: handbookChapters.length + 1, name: APPENDIX.title, description: APPENDIX.detail },
          ] },
        { ...bookBase, "@id": `${CANONICAL_URL}#cheat-sheet`, name: CHEATSHEET.title, description: CHEATSHEET.tagline, numberOfPages: CHEATSHEET.pages,
          educationalLevel: "Quick reference", learningResourceType: "Cheat sheet",
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
          heroRef={heroRef} crumb="Git & GitHub"
          pill={<><FileText size={14} weight="bold" aria-hidden />2 Git & GitHub PDF ebooks · one purchase</>}
          title={<>Git & GitHub, from your first commit <span className="hb-mark">to CI/CD and open source.</span></>}
          lead={`Get both: ${HANDBOOK.title} (${HANDBOOK.pages} pages, ${HANDBOOK.chapters} chapters, beginner to advanced), with every command shown with real output and diagrams, and the ${CHEATSHEET.pages}-page ${CHEATSHEET.title} for quick revision before interviews and in daily use.`}
          stats={HERO_STATS} info={info} onBuy={buy} onPreview={seeInside} providerName={PAYMENT_PROVIDER_NAME} previewLabel="See what's inside"
          cover={cover} coverTitle={productName} coverFallback={{ title: "Git & GitHub", subtitle: "Complete Guide + Cheat Sheet", line: "123 + 19 pages · 2 PDF ebooks" }} nav={PAGE_NAV}
        />

        <Section id="books" eyebrow="Two books, one purchase" title="The Complete Guide and the Cheat Sheet, side by side"
          lead={`The Complete Guide teaches Git and GitHub end to end. The Cheat Sheet puts the commands you use every day on ${CHEATSHEET.pages} pages. You get both PDFs.`}>
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
          <div className="hb-cmp hb-cmp-after" role="region" aria-label="Git & GitHub Complete Guide compared with the Cheat Sheet" tabIndex={0}>
            <table>
              <caption className="hb-sr">{`${HANDBOOK.title} compared with the ${CHEATSHEET.title}`}</caption>
              <thead><tr><th scope="col"><span className="hb-sr">Feature</span></th><th scope="col">Complete Guide</th><th scope="col">Cheat Sheet</th></tr></thead>
              <tbody>{bookComparison.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="hb-row" style={{ marginTop: 22, alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <Price info={info} />
            <button type="button" className="hb-btn hb-btn-primary" onClick={buy} disabled={!info.canBuy}>Get both books<ArrowRight size={17} weight="bold" aria-hidden /></button>
          </div>
        </Section>

        <Section id="handbook" eyebrow={`Book 1 · ${HANDBOOK.pages} pages`} title={`${HANDBOOK.title}: all ${HANDBOOK.chapters} chapters`}
          lead="Beginner to advanced, with a table of contents, page numbers and a command index. Open a group to see its chapters and topics." tint>
          <div className="hb-syl">
            {chapterGroups.map((g, n) => {
              const first = g.chapters[0].number;
              const last = g.chapters[g.chapters.length - 1].number;
              return (
                <details key={g.label} className="hb-acc" open={n === 0}>
                  <summary>
                    <span className="hb-mono">Ch {first}–{last}</span>
                    <span><b>{g.label}</b><small>{g.chapters.length} chapters · {g.copy}</small></span>
                  </summary>
                  <div className="hb-acc-body">
                    <ol className="hb-steps hb-steps-2">
                      {g.chapters.map((c) => (
                        <li key={c.number}>
                          <span className="hb-mono" aria-label={`Chapter ${Number(c.number)}`}>{c.number}</span>
                          <div><b>{c.title}</b>{c.detail && <p>{c.detail}</p>}</div>
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
              );
            })}
          </div>
          <ul className="hb-who" style={{ marginTop: 16 }}>
            <li><ListMagnifyingGlass size={20} weight="duotone" aria-hidden /><div><b>{APPENDIX.title}</b><p>{APPENDIX.detail}.</p></div></li>
          </ul>
        </Section>

        <Section id="highlights" eyebrow="Inside the Complete Guide" title="Every command with real output, every branch drawn out"
          lead="What you get beyond the chapter list.">
          <ul className="hb-who">
            {highlights.map((h, i) => {
              const Icon = HIGHLIGHT_ICONS[i] || Terminal;
              return <li key={h.title}><Icon size={20} weight="duotone" aria-hidden /><div><b>{h.title}</b><p>{h.copy}</p></div></li>;
            })}
          </ul>
          <div style={{ marginTop: 22 }}>
            <h3 className="hb-h3" style={{ display: "flex", alignItems: "center", gap: 8 }}><GitMerge size={20} weight="duotone" aria-hidden />Branching diagrams in the Guide</h3>
            <ul className="hb-tags hb-tags-pat" style={{ marginTop: 10 }}>{DIAGRAMS.map((d) => <li key={d}>{d}</li>)}</ul>
          </div>
        </Section>

        <Section id="cheat-sheet" eyebrow={`Book 2 · ${CHEATSHEET.pages} pages`} title={`${CHEATSHEET.title}: ${CHEATSHEET.sections} sections`}
          lead={`${CHEATSHEET.tagline} Small diagrams for merge, rebase, reset and PR flow.`} tint>
          <ol className="hb-steps">
            {cheatSheetSections.map((s) => <li key={s.number}><span className="hb-mono">{s.number}</span><div><b>{s.title}</b>{s.detail && <p>{s.detail}</p>}</div></li>)}
          </ol>
        </Section>

        <Section id="topics" eyebrow="Topic finder" title="Where each Git and GitHub topic lives in both books"
          lead="Chapter numbers refer to the Complete Guide, section numbers (§) to the Cheat Sheet.">
          <div className="hb-cmp" role="region" aria-label="Git topics by book" tabIndex={0}>
            <table>
              <caption className="hb-sr">Where each Git and GitHub topic is covered in the Complete Guide and the Cheat Sheet</caption>
              <thead><tr><th scope="col">Topic</th><th scope="col">Complete Guide</th><th scope="col">Cheat Sheet</th></tr></thead>
              <tbody>{topicMap.map(([k, a, b]) => <tr key={k}><th scope="row">{k}</th><td>{a}</td><td>{b}</td></tr>)}</tbody>
            </table>
          </div>
        </Section>

        <Section id="answers" eyebrow="Quick answers" title="Common Git questions, answered in short"
          lead="The questions developers search for most, with where the Complete Guide goes deeper." tint>
          <ul className="hb-who hb-answers">
            {TOPIC_FAQS.map((f) => (
              <li key={f.q}><GitBranch size={20} weight="duotone" aria-hidden /><div><h3 className="hb-h3" style={{ fontSize: 16 }}>{f.q}</h3><p>{f.a}</p></div></li>
            ))}
          </ul>
        </Section>

        <FaqSection items={BOOK_FAQS} />

        <FinalSection
          title={<>Every Git command, every GitHub workflow, <span className="hb-mark">with real output.</span></>}
          line={`Both PDFs: ${HANDBOOK.title} (${HANDBOOK.pages} pages) and the ${CHEATSHEET.title} (${CHEATSHEET.pages} pages).`}
          info={info} onBuy={buy} onPreview={seeInside} previewLabel="See what's inside"
        >
          <ResumePromo variant="banner" isDark={isDark} />
        </FinalSection>
      </main>

      <BookFooter line="Git & GitHub: The Complete Guide + Git & GitHub Cheat Sheet · PDF ebooks · Digital purchases are not refundable" links={[["/book/docker", "Docker Handbook"], ["/book/system-design/hld", "System Design HLD"]]} />
      <BuyBar name={BUNDLE_NAME} info={info} onBuy={buy} onPreview={seeInside} hidden={isCheckoutOpen} heroVisible={heroVisible} previewLabel="Contents" />
      <PayUCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={product} />
    </div>
  );
}

export default GitBooks;
