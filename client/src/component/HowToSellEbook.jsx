import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight, ChartLine, Check, FileText, GraduationCap, Info, Lightbulb, Megaphone, Moon, PencilSimpleLine, Rocket,
  SpeakerHigh, Storefront, Sun, Tag, Target, Users, Wallet, Briefcase,
} from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import logo from "../utils/target_Trek_logo_2.jpg";
import {
  BookFooter, BookHero, BuyBar, FONT_HREF, FaqSection, FinalSection, SITE_NAME, SITE_URL, SUPPORT_EMAIL, Section,
  coverOf, priceOf, scrollToId, useNear, useOnScreen, useProduct, useReferral, useSiteTheme, useTrackView,
} from "./bookKit";
import { Cards, Flow } from "./genaiKit";
import { ForYou, Glance, Swap } from "./javaKit";
import "./sellEbook.css";

/*
  /others/book/how-to-sell-ebook: a standalone landing page (the site navbar and footer are hidden on this route,
  so it carries its own slim top bar with the theme switch).
  what it is (at a glance) → why first ebooks fail → video → the 4-step roadmap → 8 chapters → what you learn
  → anatomy of a sales page → illustrative calculator → who it's for → FAQ → buy
*/

const PAGE_PATH = "/others/book/how-to-sell-ebook";
const PAYMENT_PROVIDER_NAME = gatewayLabel(preferredGateway("books"));

/* the intro video is optional: resolved with a glob so the page still builds (and shows the cover) without it */
const videoModules = import.meta.glob("../assest/ebook_video.mp4", { eager: true, query: "?url", import: "default" });
const VIDEO_SRC = Object.values(videoModules)[0] || null;

const SEO = {
  title: "How to Sell Ebooks Online: Create, Price & Market | Target Trek",
  description: "A practical guide to selling ebooks online: find a profitable idea, write your first ebook, price it, build a sales page, take payments and market it.",
  keywords: "how to sell ebooks online, how to sell ebook in india, create an ebook, write your first ebook, sell digital products, ebook business, ebook business for beginners, ebook pricing strategy, ebook sales page, ebook marketing, instagram marketing for ebooks, payment gateway for digital products, automated ebook delivery, earn money selling ebooks",
  long: "A beginner-friendly guide to building an ebook business in eight chapters: ebook business fundamentals, finding a profitable idea, creating your first ebook, pricing, building a sales page, marketing and getting customers, payments and automated delivery, and growing with more ebooks, bundles and upsells.",
};

const NAV = [["glance", "At a glance"], ["why", "Why ebooks fail"], ["roadmap", "Roadmap"], ["inside", "8 chapters"], ["learn", "What you learn"], ["sales-page", "Sales page"], ["calculator", "Calculator"], ["faq", "FAQ"]];
const STATS = [["8", "chapters"], ["4", "step roadmap"], ["0", "coding needed"], ["PDF", "read anywhere"]];

const CHAPTERS = [
  { n: "01", title: "Ebook Business Fundamentals", subtitle: "How the model works",
    description: "What an ebook business is, how selling a digital product works end to end, and where the earnings come from.",
    topics: ["The ebook business model", "Digital product opportunities", "How ebook selling works"] },
  { n: "02", title: "Finding a Profitable Ebook Idea", subtitle: "A topic people will pay for",
    description: "How to pick a topic that solves a real problem for a specific audience, and check that demand exists before you write.",
    topics: ["Niche selection", "Audience research", "Problem identification", "Competitor research"] },
  { n: "03", title: "Creating Your First Ebook", subtitle: "From notes to a finished PDF",
    description: "Turn what you know into a structured, useful and sellable ebook, with a writing workflow you can actually finish.",
    topics: ["Content planning", "Writing workflow", "Chapter structure", "Formatting and design"] },
  { n: "04", title: "Pricing Your Ebook", subtitle: "Charging for value",
    description: "How to decide a price, the main pricing strategies, and when discounts and bundles help rather than hurt.",
    topics: ["Pricing strategies", "Value-based pricing", "Discounts and bundles"] },
  { n: "05", title: "Building a Sales Page", subtitle: "A page that explains and sells",
    description: "A landing page that helps visitors understand the product quickly and gives them a clear reason and way to buy.",
    topics: ["Product positioning", "Sales page structure", "Benefits and features", "Call to action"] },
  { n: "06", title: "Marketing and Getting Customers", subtitle: "Reaching the right readers",
    description: "Practical ways to get your ebook in front of the audience it was written for, free and paid.",
    topics: ["Instagram marketing", "Content marketing", "SEO basics", "Paid advertising"] },
  { n: "07", title: "Payments and Delivery", subtitle: "Get paid, deliver automatically",
    description: "Receiving payments online and delivering the ebook to every buyer automatically, plus handling support.",
    topics: ["Payment gateways", "Automated delivery", "Customer support"] },
  { n: "08", title: "Growing Your Ebook Business", subtitle: "After the first ebook",
    description: "Ideas for building a product range and growing the business once the first ebook is selling.",
    topics: ["Multiple ebooks", "Upselling", "Bundles", "Improving conversions"] },
];

const PAIN = [
  { before: "An idea, but no idea where to start", after: "A step-by-step roadmap from idea to launch" },
  { before: "Guessing which topic will actually sell", after: "A clear process for niche and audience research" },
  { before: "Picking a price out of thin air", after: "Pricing strategies, discounts and bundles explained" },
  { before: "No plan for a sales page or marketing", after: "A framework for the sales page, marketing and delivery" },
];

const ROADMAP = [
  { icon: Target, title: "Choose your niche", tag: "Ch 01–02", text: "Find a topic and the specific audience you want to help." },
  { icon: PencilSimpleLine, title: "Create your ebook", tag: "Ch 03", text: "Organise your knowledge into a useful, well-structured guide." },
  { icon: Rocket, title: "Launch the product", tag: "Ch 04–05, 07", text: "Set the price, build the sales page and set up payment and delivery." },
  { icon: ChartLine, title: "Market and improve", tag: "Ch 06, 08", text: "Reach your audience, learn from feedback and grow the range." },
];

const LEARN = [
  { icon: Lightbulb, title: "Idea and niche finding", text: "A repeatable process to find a topic people already want help with." },
  { icon: PencilSimpleLine, title: "Ebook creation workflow", text: "Planning, writing, chapter structure, formatting and design." },
  { icon: Tag, title: "Pricing playbook", text: "Value-based pricing, launch discounts and bundles." },
  { icon: Megaphone, title: "Marketing basics", text: "Instagram, content marketing, SEO and an introduction to paid ads." },
  { icon: Wallet, title: "Payments and delivery", text: "Payment gateways, automated delivery and customer support." },
  { icon: Rocket, title: "Growth ideas", text: "More ebooks, upsells, bundles and improving conversion." },
];

const ANATOMY = [
  { title: "A headline that names the result", copy: "Say who the ebook is for and what they will be able to do after reading it." },
  { title: "The reader's problem", copy: "Describe their situation in their own words so they recognise themselves." },
  { title: "What's inside", copy: "Chapters and outcomes, not just a page count." },
  { title: "A look before buying", copy: "A sample, a video or the chapter list, so readers can judge the quality." },
  { title: "A clear price and offer", copy: "One price, and a discount only when it is real." },
  { title: "Answers to objections", copy: "Format, delivery, refunds and support, answered in an FAQ." },
  { title: "One clear call to action", copy: "The same buy button, repeated where a reader is ready to decide." },
];

const AUDIENCE = [
  { icon: Briefcase, title: "Working professionals", text: "Package your work experience and professional knowledge into a digital product." },
  { icon: GraduationCap, title: "Students", text: "Learn how digital products work by sharing a skill you already have." },
  { icon: Users, title: "Creators", text: "Launch ebooks and digital products for the audience you have already built." },
  { icon: Storefront, title: "Complete beginners", text: "Understand online selling and the ebook business from zero, without code." },
];

const INCLUDED = [
  "8 chapters from first idea to growth", "Niche and audience research process", "Writing workflow and chapter structure",
  "Pricing strategies, discounts and bundles", "Sales page structure and positioning", "Instagram, content, SEO and paid ads basics",
  "Payment gateways and automated delivery", "Growth: more ebooks, upsells and bundles", "Digital PDF for phone, tablet or laptop",
];

const FAQS = [
  { q: "Can a complete beginner start an ebook business?", a: "Yes. You do not need a complicated setup to start. You can choose a useful topic, create a well-structured ebook on it and start selling. The guide walks through each step from the beginning." },
  { q: "Do I need to know coding?", a: "No. There are no-code tools for writing, designing and selling ebooks. This guide focuses on the business process: the idea, the product, the price, the sales page, marketing and delivery." },
  { q: "Will selling ebooks guarantee an income?", a: "No. Income is never guaranteed. Results depend on your topic, the quality of the ebook, your pricing, your marketing and your audience." },
  { q: "How do I choose an ebook topic people will pay for?", a: "Start from a problem you have solved yourself, for a specific group of people, and check that they already look for help with it: questions they ask, content they search for and products they buy. Chapter 02 turns this into a step-by-step research process." },
  { q: "How should I price my first ebook?", a: "Price on the value of the result the reader gets, not on the page count, and compare it with similar products your audience already buys. Chapter 04 covers value-based pricing, launch discounts and bundles." },
  { q: "Do I need my own website to sell an ebook?", a: "Not to start. A dedicated sales page, an online payment option and automated delivery make the business much easier to run as it grows, and the guide explains how each fits together." },
  { q: "How do buyers receive an ebook after paying?", a: "Usually through automated delivery: once the payment gateway confirms the payment, the buyer gets a download link or access, often by email as well, with no manual work for each sale. Chapter 07 explains the setup." },
  { q: "How do I get this guide after paying?", a: "It is a digital PDF ebook. After your payment is confirmed, download or access instructions are shown in the payment flow, and relevant details may also be sent to your registered email." },
  { q: "Can I get a refund, and how do I contact support?", a: `Digital purchases are non-refundable. For payment or access help, email ${SUPPORT_EMAIL}.` },
];

/* ------------------------------------------------------------------ pieces only this page needs */

function setSiteTheme(next) {
  try { localStorage.setItem("theme", next); } catch { /* storage may be blocked */ }
  document.documentElement.classList.toggle("dark", next === "dark");
  document.documentElement.setAttribute("data-theme", next);
  window.dispatchEvent(new CustomEvent("targettrek-theme-change", { detail: { theme: next } }));
  window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: next } }));
}

/* the site navbar is hidden on this route, so the page brings a slim bar of its own */
function TopBar({ isDark }) {
  return (
    <div className="sx-top">
      <div className="hb-shell sx-top-in">
        <a href="/" className="sx-brand" aria-label="Target Trek home"><img src={logo} alt="" width={32} height={32} /><b>Target Trek</b></a>
        <div className="sx-top-r">
          <a href="/books" className="sx-top-link">All books</a>
          <button type="button" className="sx-theme" onClick={() => setSiteTheme(isDark ? "light" : "dark")} aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}>
            {isDark ? <Sun size={18} weight="bold" aria-hidden /> : <Moon size={18} weight="bold" aria-hidden />}
          </button>
        </div>
      </div>
    </div>
  );
}

/* the intro video only loads once someone scrolls near it; it starts muted and offers sound */
function IntroVideo({ src, cover, title }) {
  const ref = useRef(null);
  const [near] = useNear(ref, "400px");
  const [muted, setMuted] = useState(true);
  const withSound = () => {
    const v = ref.current?.querySelector("video");
    if (!v) return;
    v.muted = false; v.currentTime = 0;
    v.play?.()?.catch?.(() => {});
    setMuted(false);
  };
  return (
    <figure ref={ref} className="sx-video">
      <div className="sx-video-frame">
        {src && near ? (
          <>
            <video src={src} poster={cover || undefined} autoPlay muted loop playsInline controls preload="metadata" onVolumeChange={(e) => setMuted(e.currentTarget.muted)} aria-label={`${title}: video introduction`} />
            {muted && <button type="button" className="sx-sound" onClick={withSound}><SpeakerHigh size={16} weight="bold" aria-hidden />Play with sound</button>}
          </>
        ) : cover ? <img src={cover} alt={`${title} ebook cover`} loading="lazy" /> : <span className="hb-spin" aria-hidden />}
      </div>
    </figure>
  );
}

/* illustrative only: price × sales − gateway fee, with the warning right next to the result */
function EarningsCalculator() {
  const [price, setPrice] = useState(299);
  const [sales, setSales] = useState(50);
  const [fee, setFee] = useState(2.5);
  const gross = price * sales;
  const fees = Math.round((gross * fee) / 100);
  const net = gross - fees;
  const inr = (n) => `₹${Math.round(n).toLocaleString("en-IN")}`;
  return (
    <div className="sx-calc">
      <div className="sx-calc-in">
        <label className="sx-range">
          <span><b>Ebook price</b><output className="hb-mono">{inr(price)}</output></span>
          <input type="range" min={49} max={999} step={10} value={price} onChange={(e) => setPrice(Number(e.target.value))} />
        </label>
        <label className="sx-range">
          <span><b>Number of sales</b><output className="hb-mono">{sales}</output></span>
          <input type="range" min={5} max={500} step={5} value={sales} onChange={(e) => setSales(Number(e.target.value))} />
        </label>
        <label className="sx-range">
          <span><b>Payment gateway fee</b><output className="hb-mono">{fee}%</output></span>
          <input type="range" min={0} max={5} step={0.5} value={fee} onChange={(e) => setFee(Number(e.target.value))} />
        </label>
      </div>
      <div className="sx-calc-out" aria-live="polite">
        <dl>
          <div><dt>Gross sales</dt><dd className="hb-mono">{inr(gross)}</dd></div>
          <div><dt>Gateway fees</dt><dd className="hb-mono">− {inr(fees)}</dd></div>
          <div className="is-net"><dt>Before tax</dt><dd className="hb-mono">{inr(net)}</dd></div>
        </dl>
        <p className="sx-calc-note"><Info size={16} weight="bold" aria-hidden /><span>Illustrative calculator only, not an income promise. Real results depend on your topic, quality, marketing and audience, and taxes such as GST may apply.</span></p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ page */
export default function HowToSellEbook() {
  const theme = useSiteTheme();
  const isDark = theme === "dark";
  useReferral();
  const { product, loading } = useProduct(PAGE_PATH);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const heroRef = useRef(null);
  const heroVisible = useOnScreen(heroRef);
  useTrackView(product, "How to Earn Money by Selling Ebooks");

  const info = priceOf(product, loading);
  const cover = coverOf(product);
  const productName = product?.title || "How to Sell Ebooks Online";
  const buy = () => { if (info.canBuy) setIsCheckoutOpen(true); };
  const seeInside = () => scrollToId("inside");
  const canonicalUrl = `${SITE_URL}${PAGE_PATH}`;

  const structuredData = useMemo(() => ({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: SITE_NAME, url: SITE_URL, email: SUPPORT_EMAIL,
        contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: SUPPORT_EMAIL, availableLanguage: ["English", "Hindi"] } },
      { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: SITE_NAME, inLanguage: "en-IN", publisher: { "@id": `${SITE_URL}/#organization` } },
      { "@type": "WebPage", "@id": `${canonicalUrl}#webpage`, url: canonicalUrl, name: SEO.title, description: SEO.description, inLanguage: "en-IN",
        isPartOf: { "@id": `${SITE_URL}/#website` }, breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` }, about: { "@id": `${canonicalUrl}#product` },
        speakable: { "@type": "SpeakableSpecification", cssSelector: [".jx-glance-def", "#faq"] },
        ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover } } : {}) },
      { "@type": "BreadcrumbList", "@id": `${canonicalUrl}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
        { "@type": "ListItem", position: 3, name: "How to Sell Ebooks", item: canonicalUrl },
      ] },
      { "@type": ["Product", "Book"], "@id": `${canonicalUrl}#product`, name: productName, description: SEO.long, url: canonicalUrl,
        category: "Online Business and Digital Products Ebook", keywords: SEO.keywords, inLanguage: "en", bookFormat: "https://schema.org/EBook",
        genre: "Business, entrepreneurship, digital products",
        teaches: "Finding an ebook niche, writing an ebook, ebook pricing, building a sales page, ebook marketing, payment gateways and automated delivery",
        audience: { "@type": "Audience", audienceType: "Beginners, students, working professionals and creators who want to sell ebooks online" },
        brand: { "@type": "Brand", name: SITE_NAME }, author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` },
        isAccessibleForFree: false, ...(product?._id ? { sku: String(product._id) } : {}), ...(cover ? { image: [cover] } : {}),
        ...(info.valid && info.price > 0 ? { offers: { "@type": "Offer", url: canonicalUrl, price: info.price, priceCurrency: info.currency, priceValidUntil: `${new Date().getFullYear() + 1}-12-31`,
          availability: "https://schema.org/InStock", itemCondition: "https://schema.org/NewCondition",
          hasMerchantReturnPolicy: { "@type": "MerchantReturnPolicy", returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted" },
          seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL } } } : {}) },
      { "@type": "HowTo", "@id": `${canonicalUrl}#howto`, name: "How to sell an ebook online", description: "The four-step roadmap the guide follows, from choosing a niche to marketing and improving.",
        step: ROADMAP.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text })) },
      { "@type": "ItemList", "@id": `${canonicalUrl}#chapters`, name: "Chapters of the ebook", numberOfItems: CHAPTERS.length,
        itemListElement: CHAPTERS.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, description: c.description })) },
      { "@type": "FAQPage", "@id": `${canonicalUrl}#faq`, mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  }), [cover, canonicalUrl, info.valid, info.price, info.currency, product?._id, productName]);

  return (
    <div className="hb gx jx sx" data-theme={theme}>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{SEO.title}</title>
        <meta name="description" content={SEO.description} />
        <meta name="keywords" content={SEO.keywords} />
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
        <meta property="og:title" content={SEO.title} />
        <meta property="og:description" content={SEO.description} />
        <meta property="og:url" content={canonicalUrl} />
        {info.valid && info.price > 0 && <meta property="product:price:amount" content={String(info.price)} />}
        {info.valid && info.price > 0 && <meta property="product:price:currency" content={info.currency} />}
        {cover && <meta property="og:image" content={cover} />}
        {cover && <meta property="og:image:alt" content={`${productName} ebook cover`} />}
        <meta name="twitter:card" content={cover ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={SEO.title} />
        <meta name="twitter:description" content={SEO.description} />
        {cover && <meta name="twitter:image" content={cover} />}
        <script type="application/ld+json">{JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
      </Helmet>
      <a href="#hb-main" className="hb-skip">Skip to content</a>
      <TopBar isDark={isDark} />

      <main id="hb-main">
        <BookHero
          heroRef={heroRef} crumb="How to Sell Ebooks"
          pill={<><FileText size={14} weight="bold" aria-hidden />Digital product guide · PDF ebook</>}
          title={<>Turn what you know into <span className="hb-mark">an ebook that sells.</span></>}
          lead="A practical guide to the whole journey: finding a topic people will pay for, writing and designing the ebook, pricing it, building a sales page, taking payments and getting your first customers."
          stats={STATS} info={info} onBuy={buy} onPreview={seeInside} providerName={PAYMENT_PROVIDER_NAME}
          cover={cover} coverTitle={productName} coverFallback={{ title: "How to Sell Ebooks", subtitle: "Idea → launch → growth", line: "8 chapters · no coding needed" }}
          nav={NAV} previewLabel="See the chapters"
        />

        <Section id="glance" eyebrow="At a glance" title="What is this guide?">
          <Glance
            definition={<><b>How to Sell Ebooks Online</b> is a digital PDF guide by Target Trek that walks a complete beginner through <b>building an ebook business in 8 chapters</b>: choosing a profitable topic, creating the ebook, pricing it, building a sales page, marketing it, taking payments with automated delivery, and growing with more products. No coding is needed.</>}
            facts={[["Format", "Digital PDF ebook"], ["Chapters", "8, idea to growth"], ["Level", "Beginner-friendly"], ["Coding needed", "None"], ["Language", "Hinglish"], ["Best for", "Creators, pros, students"], ["Reads on", "Phone, tablet, laptop"], ["Publisher", "Target Trek"]]}
            topics={["Niche selection", "Audience research", "Writing workflow", "Ebook design", "Pricing strategy", "Bundles", "Sales page", "Instagram marketing", "Content marketing", "SEO basics", "Paid ads", "Payment gateways", "Automated delivery", "Upselling"]}
          />
        </Section>

        <Section id="why" tint eyebrow="The problem" title="Why most first ebooks never sell" lead="It is rarely the writing. It is starting without a topic people want, a price that makes sense, or a plan to reach readers. The guide fixes those first.">
          <Swap rows={PAIN} beforeLabel="Without a plan" afterLabel="With this guide" />
        </Section>

        <Section id="video" eyebrow="Watch" title="A quick look at the guide" lead="A short video introduction before you decide. Tap play with sound to hear it.">
          <IntroVideo src={VIDEO_SRC} cover={cover} title={productName} />
        </Section>

        <Section id="roadmap" tint eyebrow="The roadmap" title="From idea to your first sale in four steps" lead="The guide follows the same order you will work in. Each step points to the chapters that cover it.">
          <Flow steps={ROADMAP} label="Four steps to sell an ebook online"
            note={<><Lightbulb size={18} weight="bold" aria-hidden /><span><b>Start small:</b> one focused ebook that solves one problem well is easier to write, price and market than a broad one. You can grow the range later (Chapter 08).</span></>}
          />
        </Section>

        <Section id="inside" eyebrow="Complete contents" title="8 chapters, from first idea to growth" lead="Open any chapter to see what it covers.">
          <div className="hb-syl">
            {CHAPTERS.map((c, n) => (
              <details key={c.n} className="hb-acc" open={n === 0}>
                <summary><span className="hb-mono">{c.n}</span><span><b>{c.title}</b><small>{c.subtitle}</small></span></summary>
                <div className="hb-acc-body">
                  <p>{c.description}</p>
                  <ul className="hb-checks">{c.topics.map((t) => <li key={t}><Check size={15} weight="bold" aria-hidden />{t}</li>)}</ul>
                </div>
              </details>
            ))}
          </div>
        </Section>

        <Section id="learn" tint eyebrow="What you learn" title="One guide for the whole ebook business" lead="Six skills you will use for this ebook and every digital product after it.">
          <Cards items={LEARN} cols={3} />
        </Section>

        <Section id="sales-page" eyebrow="Inside Chapter 05" title="The anatomy of a sales page that converts" lead="The seven blocks a good ebook sales page needs, in order. You are reading one: this page follows the same structure.">
          <ol className="hb-steps">
            {ANATOMY.map((s, n) => <li key={s.title}><span className="hb-mono">{String(n + 1).padStart(2, "0")}</span><div><b>{s.title}</b><p>{s.copy}</p></div></li>)}
          </ol>
          <div className="jx-cta-row">
            <p><b>Want the full framework?</b> Chapter 05 covers positioning, page structure, benefits versus features and the call to action.</p>
            <button type="button" className="hb-btn hb-btn-primary" onClick={buy} disabled={!info.canBuy}>Get the guide · {info.label}<ArrowRight size={16} weight="bold" aria-hidden /></button>
          </div>
        </Section>

        <Section id="calculator" tint eyebrow="Play with the numbers" title="What could one ebook add up to?" lead="Move the sliders to see how price, sales and payment fees combine. It is a planning tool, not a forecast.">
          <EarningsCalculator />
        </Section>

        <Section id="for-you" eyebrow="Who it's for" title="Made for anyone with knowledge worth sharing">
          <ForYou audience={AUDIENCE} included={INCLUDED} info={info} onBuy={buy} />
        </Section>

        <FaqSection items={FAQS} />

        <FinalSection
          title={<>Your knowledge is already a product. <span className="hb-mark">Learn how to sell it.</span></>}
          line="8 chapters from first idea to growth, in one PDF you can read anywhere."
          info={info} onBuy={buy} onPreview={seeInside} previewLabel="See the chapters"
        />
      </main>

      <BookFooter line="How to Sell Ebooks Online · Digital PDF ebook · Digital purchases are not refundable" links={[["/", "Home"]]} />
      <BuyBar name={productName} info={info} onBuy={buy} onPreview={seeInside} previewLabel="Chapters" hidden={isCheckoutOpen} heroVisible={heroVisible} />
      <PayUCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} product={product} />
    </div>
  );
}
