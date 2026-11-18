/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, MotionConfig, animate, motion, useInView, useScroll, useSpring } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowsClockwise,
  BellRinging,
  BookOpen,
  Books,
  Cake,
  CalendarHeart,
  CaretDown,
  ChatsCircle,
  Check,
  CheckCircle,
  Crown,
  Diamond,
  EnvelopeSimple,
  EnvelopeSimpleOpen,
  Eye,
  Flower,
  Gift,
  HandHeart,
  Heart,
  Infinity as InfinityIcon,
  Key,
  Lightbulb,
  Lightning,
  LockKey,
  MagnifyingGlass,
  Minus,
  Plus,
  Prohibit,
  Receipt,
  ShieldCheck,
  Sword,
  TreeEvergreen,
  X,
} from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { inr, usePacks } from "./PackSections";
import "./books.css";
import "./allAccess.css";

/* =====================================================
   PACK LANDING PAGE
   Served on /book/all-books and /book/life-type-combo (and /all-access).

   Same look as /books: it reuses the .bx tokens, buttons, covers and
   panels from books.css, and adds page parts in allAccess.css (.aa-*).

   One offer per URL: the pack whose page you are on is the "focus" pack.
   Hero, buy box, sticky bar and the final call to action sell that pack.
   Every number, price, book and credit count comes from the database
   (GET /api/membership/plans, see PackSections.jsx). Nothing is invented:
   no reviews, no buyer counts, no made up guarantees.
===================================================== */

const SITE_URL = "https://www.targettrek.in";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const MEMORIES_REDEEM = "/memories/app/pay";
const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap";

const EASE = [0.22, 1, 0.36, 1];

const readTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

const creditWord = (n) => (Number(n) === 1 ? "credit" : "credits");
const bookWord = (n) => (Number(n) === 1 ? "book" : "books");

/* ---------- small building blocks ---------- */

function Reveal({ as = "div", delay = 0, children, ...rest }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };
const item = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

function Counter({ value, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, Number(value) || 0, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref}>{prefix}{shown.toLocaleString("en-IN")}{suffix}</span>;
}

function Head({ eyebrow, title, lead, center, children }) {
  return (
    <Reveal className={`aa-head ${center ? "is-center" : ""}`}>
      {eyebrow && <p className="bx-eyebrow">{eyebrow}</p>}
      <h2 className="bx-h2">{title}</h2>
      {lead && <p className="bx-lead">{lead}</p>}
      {children}
    </Reveal>
  );
}

function Cover({ book, className = "" }) {
  return (
    <span className={`bx-cover ${className}`}>
      {book?.coverPageUrl ? (
        <img src={book.coverPageUrl} alt="" loading="lazy" decoding="async" />
      ) : (
        <span className="bx-cover-fallback">
          <span><BookOpen size={12} weight="bold" /> TARGET TREK</span>
          <strong>{book?.title || "Interview book"}</strong>
        </span>
      )}
    </span>
  );
}

/* ---------- static copy (facts only) ---------- */

const MEMORY_TEMPLATES = [
  { icon: Cake, name: "Birthday", text: "A surprise page full of photos and wishes.", demo: "/memories/preview/birthday" },
  { icon: CalendarHeart, name: "Anniversary", text: "Your story so far, in photos and words.", demo: "/memories/preview/anniversary" },
  { icon: Diamond, name: "Proposal", text: "Ask the big question on a page they keep.", demo: "/memories/preview/proposal" },
  { icon: HandHeart, name: "Sorry", text: "Say it properly, when a text is not enough.", demo: "/memories/preview/sorry" },
  { icon: Flower, name: "Thank you", text: "Thank a mentor, friend or parent.", demo: "/memories/preview/thanks" },
  { icon: TreeEvergreen, name: "Christmas", text: "A festive greeting page, made for them.", demo: "/memories/preview/christmas" },
];

const MATCH_FLOW = [
  { title: "Sign up", text: "Create your Prep Arena profile with the email you bought with. Your credits are added at once." },
  { title: "Find a buddy", text: "Browse members preparing for similar roles and send a request, or accept one." },
  { title: "Practise together", text: "Run mock interviews and chat privately. You appear under an alias." },
  { title: "Use the next credit", text: "When a partnership ends, your next credit pairs you with someone new." },
];

const TRUST = [
  { icon: LockKey, title: "A checkout you already know", text: "Pay by UPI, card or net banking through a trusted payment gateway. We never see or store your card details." },
  { icon: EnvelopeSimple, title: "In your inbox right after payment", text: "Your PDFs are emailed as soon as the payment goes through. Very large files arrive as a download link." },
  { icon: Prohibit, title: "Nothing renews", text: "It is a single payment. No subscription, no saved card and no charge next month." },
  { icon: ChatsCircle, title: "A real person answers", text: "Missing a file or stuck somewhere? Write to us and we will sort it out and resend what you need.", mail: true },
  { icon: Eye, title: "See every book before you pay", text: "Each book in the pack has its own page with its topics and details.", to: "/books", linkLabel: "Browse all books" },
  { icon: Receipt, title: "Refund rules in plain words", text: "Digital books are not refundable, and we say so up front. A verified duplicate charge is refunded within 7 days.", to: "/refund-policy", linkLabel: "Read the refund policy" },
];

const faqList = (hasMatches, hasLifetime) => [
  { q: "What is in the All Books pack?", a: "Every book available on Target Trek on the day you pay, as PDFs emailed to you, plus an email whenever we publish a new book. Books published after your purchase can be bought separately or by upgrading to Lifetime." },
  ...(hasLifetime
    ? [{ q: "What does the Lifetime pack add?", a: "All current books, and every book we publish in the future is emailed to you free, with no extra payment, for as long as Target Trek publishes. It also includes 1 free Memories page, free limited credits when we launch new features, and the right to request or suggest new books." }]
    : []),
  { q: "How are the books delivered?", a: "As PDFs by email right after payment. Very large files come as a download link. If anything is missing, write to us and we will resend it." },
  { q: "Is the payment secure?", a: "Yes. You pay by UPI, card or net banking through a trusted payment gateway. Your card details go straight to the gateway and are never seen or stored by Target Trek." },
  { q: "Is this a subscription?", a: "No. A pack is a single payment. Nothing renews and nothing is charged later." },
  { q: "Can I get a refund?", a: "Digital books are generally not refundable because the files are delivered at once. If you were charged twice for the same purchase, the duplicate amount is refunded within 7 days after we verify it. The full policy is on our refund policy page." },
  { q: "Which email should I use at checkout?", a: "Use the email you also sign in with. Your books, new book alerts, credits and your Memories code are all linked to it." },
  ...(hasLifetime
    ? [
        { q: "What is the free Memories page?", a: "Memories is our personalised page maker. You build a page (Birthday, Anniversary, Proposal, Sorry, Thank you or Christmas) with your own photos and words, and share it as a private link. Every Lifetime pack includes 1 Memories page free." },
        { q: "How do I get and redeem my Memories code?", a: "After your purchase we email a unique code to the address you used at checkout. Sign in to Memories, open the Pay page, enter the code and a page is added to your account. The code works on any template and look." },
        { q: "I bought Lifetime but did not get my Memories code.", a: `Check your spam and promotions folders first. If it is not there, write to ${SUPPORT_EMAIL} from the email you bought with and we will send it again.` },
      ]
    : []),
  ...(hasMatches
    ? [
        { q: "What is a Prep Arena credit?", a: "Prep Arena pairs you with another serious candidate for mock interviews and private chat. 1 credit = 1 match = 1 partnership. When it ends, your next credit pairs you with someone new." },
        { q: "When do I get my credits?", a: "The moment you sign up on Prep Arena with the same email you used at checkout. If you already have an arena account they are added right after payment. There is nothing more to pay." },
        { q: "Do unused credits expire?", a: "No. Credits stay on your account until you use them." },
      ]
    : []),
  { q: "How do I request a new book?", a: "Sign in to Prep Arena with the email you bought the pack with, open the Books tab and send your suggestion. It is open to pack members only, and you can see the status of each request." },
  { q: "How will I know a new book is out?", a: "We email you when a new book is released. Lifetime members get the PDF in that email. Use the unsubscribe link in any email to stop alerts." },
  { q: "I already bought one of the books. Can I still get a pack?", a: "Yes. Write to us with your order details and we will help you pick the right option." },
];

/* What a pack includes, as rows for its pricing card. */
const packFeatures = (pack) => {
  const lifetime = pack.plan === "lifetime";
  const credits = Number(pack.matches) || 0;
  const count = (pack.includedBooks || []).length;
  return [
    { icon: Books, text: `${count > 0 ? `${count} ${bookWord(count)}` : "All books"} available today, as PDFs`, strong: true },
    lifetime
      ? { icon: InfinityIcon, text: "Every book we publish in future, emailed free", strong: true }
      : { icon: BellRinging, text: "Email alert when a new book is published" },
    ...(credits > 0 ? [{ icon: Sword, text: `${credits} Prep Arena ${creditWord(credits)}`, strong: true }] : []),
    ...(lifetime
      ? [
          { icon: Heart, text: "1 Memories page free, code emailed after purchase", strong: true },
          { icon: Gift, text: "Free limited Prep Arena credits on feature launches" },
        ]
      : []),
    { icon: Lightbulb, text: "Request new books from inside Prep Arena" },
    ...(pack.highlights || []).map((h) => ({ icon: Check, text: h })),
  ];
};

/* ===================================================== */

export default function AllAccess() {
  const { pathname } = useLocation();
  const { data, loading, error, reload } = usePacks();

  const [theme, setTheme] = useState(readTheme);
  const [product, setProduct] = useState(null);
  const [heroInView, setHeroInView] = useState(true);
  const [packsInView, setPacksInView] = useState(false);
  const [endReached, setEndReached] = useState(false);
  const [barClosed, setBarClosed] = useState(false);
  const heroRef = useRef(null);
  const packsRef = useRef(null);
  const finalRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  const packs = useMemo(() => data?.packs || [], [data]);
  const books = useMemo(() => data?.books || [], [data]);
  const bookCount = Number(data?.stats?.bookCount) || books.length;
  const worth = Number(data?.stats?.individualWorth) || 0;

  const lifetimePack = packs.find((p) => p.plan === "lifetime") || null;
  const basicPack = packs.find((p) => p.plan !== "lifetime") || null;
  const current = packs.find((p) => p.redirectUrl === pathname) || null;
  const focus = current || lifetimePack || packs[0] || null;
  const focusLifetime = focus?.plan === "lifetime";
  const recommended = lifetimePack || focus;
  const ready = !loading && !error && Boolean(focus);

  const maxMatches = Math.max(0, ...packs.map((p) => Number(p.matches) || 0));
  const anyMatches = maxMatches > 0;
  const focusCredits = Number(focus?.matches) || 0;
  const save = focus && worth > focus.price ? worth - focus.price : 0;
  const savePct = focus && worth > 0 && worth > focus.price ? Math.round((1 - focus.price / worth) * 100) : 0;
  const extra = lifetimePack && basicPack && lifetimePack.price > basicPack.price ? lifetimePack.price - basicPack.price : 0;
  const packCount = (focus?.includedBooks || []).length || bookCount;
  const listPct = focus && Number(focus.mrp) > focus.price ? Math.round((1 - focus.price / focus.mrp) * 100) : 0;
  const wasPrice = focus ? (Number(focus.mrp) > focus.price ? Number(focus.mrp) : worth > focus.price ? worth : 0) : 0;
  const offPct = wasPrice > 0 && focus ? Math.round((1 - focus.price / wasPrice) * 100) : 0;

  /* Follow the navbar theme toggle. */
  useEffect(() => {
    const sync = (event) => {
      const next = event?.detail?.theme;
      setTheme(next === "dark" || next === "light" ? next : readTheme());
    };
    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  /* Sticky buy bar: shown once the hero is gone, hidden over pricing and the page end. */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === heroRef.current) setHeroInView(e.isIntersecting);
        if (e.target === packsRef.current) setPacksInView(e.isIntersecting);
        if (e.target === finalRef.current) setEndReached(e.isIntersecting || e.boundingClientRect.top < 0);
      });
    }, { threshold: 0 });
    if (heroRef.current) obs.observe(heroRef.current);
    if (packsRef.current) obs.observe(packsRef.current);
    if (finalRef.current) obs.observe(finalRef.current);
    return () => obs.disconnect();
  }, []);

  const buy = (pack) => pack && setProduct(pack);
  const goTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const ctaLabel = focus ? `Get ${focusLifetime ? "Lifetime" : "all books"} for ${inr(focus.price)}` : "See the packs";
  const onCta = () => (focus ? buy(focus) : goTo("packs"));

  /* ---------- SEO ---------- */
  const title = focus && current ? `${focus.title} | Target Trek` : "All Books and Lifetime Packs | Target Trek";
  const cheapest = packs[0];
  const description = cheapest
    ? `Get every Target Trek interview book from ${inr(cheapest.price)}, or go Lifetime and get every future book free${lifetimePack ? " plus a free Memories page" : ""}.${anyMatches ? ` Includes up to ${maxMatches} Prep Arena credits.` : ""} One payment, no subscription.`
    : "Get every Target Trek interview book in one pack. One payment, no subscription.";
  const canonical = `${SITE_URL}${current?.redirectUrl || "/book/all-books"}`;
  const faqs = useMemo(() => faqList(anyMatches, Boolean(lifetimePack)), [anyMatches, lifetimePack]);

  const jsonLd = useMemo(
    () => [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: packs.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: p.title,
            description: p.subtitle || undefined,
            image: p.coverPageUrl || undefined,
            offers: { "@type": "Offer", priceCurrency: p.currency || "INR", price: p.price, availability: "https://schema.org/InStock", url: `${SITE_URL}${p.redirectUrl || "/book/all-books"}` },
          },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
    [packs, faqs]
  );

  /* Hero covers: HLD, LLD, Java, Spring Boot when present, else the first ones with a cover. */
  const heroCovers = useMemo(() => {
    const withCover = books.filter((b) => b.coverPageUrl);
    const text = (b) => `${b.title} ${b.slug || ""}`.toLowerCase();
    const wanted = [/\bhld\b|high[- ]level/, /\blld\b|low[- ]level/, /\bjava\b(?!script)/, /spring ?boot/];
    const picked = [];
    wanted.forEach((re) => {
      const hit = withCover.find((b) => re.test(text(b)) && !picked.includes(b));
      if (hit) picked.push(hit);
    });
    withCover.forEach((b) => {
      if (picked.length < 5 && !picked.includes(b)) picked.push(b);
    });
    return picked.slice(0, 5);
  }, [books]);

  const countText = packCount > 0 ? `All ${packCount} Target Trek ${bookWord(packCount)}` : "Every Target Trek book";
  const subhead = focusLifetime
    ? `${countText} in your inbox as PDFs right after you pay, and every book we publish later is emailed to you free. No subscription, nothing to renew.`
    : `${countText} in your inbox as PDFs right after you pay, in one pack instead of ${packCount > 1 ? packCount : "many"} separate purchases. No subscription, nothing to renew.`;

  /* Short list for the buy box: the four things that matter most. */
  const buyPoints = focus ? packFeatures(focus).filter((f) => f.strong).slice(0, 3).concat({ icon: Prohibit, text: "One payment, nothing renews" }) : [];

  const benefits = [
    { icon: Books, title: "The whole library, today", text: `${countText} as PDFs, emailed right after you pay. No hunting through ten tabs for the next topic.` },
    ...(lifetimePack ? [{ icon: InfinityIcon, title: "Every future book, free", text: "Each new release is emailed to you with the PDF inside. No checkout and no extra payment.", lifetime: true }] : []),
    { icon: BellRinging, title: "Hear about new books first", text: "Pack members get an email whenever a book is published, so your prep never falls behind." },
    ...(anyMatches ? [{ icon: Sword, title: `Up to ${maxMatches} Prep Arena ${creditWord(maxMatches)}`, text: "Each credit pairs you with another serious candidate for mock interviews and private chat." }] : []),
    ...(lifetimePack ? [{ icon: Heart, title: "A Memories page, on us", text: "A unique code arrives by email. Redeem it and build a personal page for someone you care about.", lifetime: true }] : []),
    { icon: Lightbulb, title: "Ask for the book you need", text: "Request or suggest a topic from inside Prep Arena and follow its status until it is published." },
    ...(lifetimePack ? [{ icon: Gift, title: "Credits when features launch", text: "Lifetime members receive free limited Prep Arena credits when we launch new features.", lifetime: true }] : []),
  ];

  const steps = [
    { icon: Lightning, title: "Pay once", text: "UPI, card or net banking. No subscription and nothing to renew." },
    { icon: EnvelopeSimpleOpen, title: "Open your inbox", text: `Your PDFs are emailed right after payment.${focusLifetime ? " Your Memories code comes to the same inbox." : ""}` },
    ...(focusCredits > 0 ? [{ icon: Sword, title: "Join Prep Arena", text: `Sign up with the same email and your ${focusCredits} ${creditWord(focusCredits)} ${focusCredits === 1 ? "is" : "are"} added at once.` }] : []),
    focusLifetime
      ? { icon: InfinityIcon, title: "Keep getting more", text: "Every new book is emailed to you with the PDF inside. Nothing more to pay." }
      : { icon: BellRinging, title: "Stay in the loop", text: "We email you whenever a new book is out." },
  ];

  const columns = packs.slice(0, 3);
  const hasLifetimeCol = columns.some((p) => p.plan === "lifetime");
  const rows = [
    { label: "Books available today", cell: () => true, other: "Pay for each" },
    { label: "Books published later", cell: (p) => (p.plan === "lifetime" ? "Free" : false), other: "Pay for each" },
    { label: "Email when a new book is out", cell: () => true, other: false },
    ...(hasLifetimeCol ? [{ label: "1 Memories page free", cell: (p) => p.plan === "lifetime", other: false }] : []),
    ...(anyMatches ? [{ label: "Prep Arena credits", cell: (p) => (Number(p.matches) > 0 ? `${p.matches}` : false), other: false }] : []),
    ...(hasLifetimeCol ? [{ label: "Credits on feature launches", cell: (p) => p.plan === "lifetime", other: false }] : []),
    { label: "Request new books", cell: () => true, other: false },
    { label: "One payment, no renewal", cell: () => true, other: "Pay each time" },
  ];

  const barMax = Math.max(worth, ...packs.map((p) => Number(p.price) || 0), 1);
  const bars = [
    { label: `Buying all ${bookCount || ""} ${bookWord(bookCount)} one by one`.replace(/\s+/g, " "), value: worth, tone: "muted" },
    ...packs.map((p) => ({ label: p.title, value: p.price, tone: p._id === focus?._id ? "hot" : "warm" })),
  ];

  const showBar = ready && !barClosed && !heroInView && !packsInView && !endReached && !product;

  return (
    <MotionConfig reducedMotion="user">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="product" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        {focus?.coverPageUrl && <meta property="og:image" content={focus.coverPageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_URL} />
        {packs.length > 0 && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
      </Helmet>

      <motion.div className="bx-progress" style={{ scaleX: progress }} aria-hidden="true" />

      <main className="bx aa" data-theme={theme}>
        {/* ================= HERO ================= */}
        <section className="bx-hero aa-hero" ref={heroRef} aria-labelledby="aa-title">
          <div className="bx-hero-bg" aria-hidden="true" />
          <div className="bx-shell bx-hero-grid">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.p className="bx-pill" variants={item}>
                <span className="bx-ping" aria-hidden="true" />
                <b>{focusLifetime ? "Lifetime pack" : "All Books pack"}</b>
                <span aria-hidden="true">·</span> One payment, no subscription
              </motion.p>

              <motion.h1 id="aa-title" className="bx-h1 bx-hero-title" variants={item}>
                {focusLifetime ? (
                  <>Every interview book <span className="bx-hl">we will ever publish.</span> One payment.</>
                ) : (
                  <>Every interview book, <span className="bx-hl">in one pack.</span> One payment.</>
                )}
              </motion.h1>

              <motion.p className="bx-lead bx-hero-lead" variants={item}>{subhead}</motion.p>

              <motion.div className="aa-hero-cta" variants={item}>
                {loading ? (
                  <span className="bx-skel aa-skel-btn" aria-hidden="true" />
                ) : (
                  <button type="button" className="bx-btn bx-btn-lg bx-btn-primary" onClick={onCta}>
                    {ctaLabel} <ArrowRight size={18} weight="bold" />
                  </button>
                )}
                <button type="button" className="bx-btn bx-btn-lg bx-btn-ghost" onClick={() => goTo("library")}>
                  <Eye size={18} /> See the {packCount > 0 ? packCount : ""} books inside
                </button>
              </motion.div>

              <motion.ul className="aa-ticks" variants={item}>
                <li><ShieldCheck size={18} weight="fill" /> Secure UPI, card or net banking</li>
                <li><EnvelopeSimple size={18} weight="fill" /> PDFs emailed in minutes</li>
                <li><Prohibit size={18} weight="bold" /> Nothing renews</li>
              </motion.ul>

              {ready && (
                <motion.dl className="bx-stats" variants={item} style={{ "--n": 3 }}>
                  <div className="bx-stat">
                    <dt className="bx-sr">Books</dt>
                    <dd><strong><Counter value={packCount} /></strong><span>{bookWord(packCount)} inside today</span></dd>
                  </div>
                  {save > 0 ? (
                    <div className="bx-stat">
                      <dt className="bx-sr">Worth</dt>
                      <dd><strong><Counter value={worth} prefix="₹" /></strong><span>if bought one by one</span></dd>
                    </div>
                  ) : (
                    <div className="bx-stat">
                      <dt className="bx-sr">Future books</dt>
                      <dd><strong>{focusLifetime ? "₹0" : "Email"}</strong><span>{focusLifetime ? "for every future book" : "alert for every new book"}</span></dd>
                    </div>
                  )}
                  <div className="bx-stat">
                    <dt className="bx-sr">Saving</dt>
                    <dd>
                      <strong className="aa-ok">{savePct > 0 ? <Counter value={savePct} suffix="%" /> : listPct > 0 ? <Counter value={listPct} suffix="%" /> : "1×"}</strong>
                      <span>{savePct > 0 ? "saved with this pack" : listPct > 0 ? "off the list price" : "payment, ever"}</span>
                    </dd>
                  </div>
                </motion.dl>
              )}
            </motion.div>

            {/* Buy box: covers, price and the one button that matters */}
            <motion.aside
              className="aa-buy"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
              aria-label="Pack summary"
            >
              <div className="aa-fan" aria-hidden="true">
                {(heroCovers.length ? heroCovers : [null, null, null, null, null]).map((b, i, arr) => {
                  const mid = (arr.length - 1) / 2;
                  const off = i - mid;
                  return (
                    <span
                      key={b?._id || i}
                      className="aa-fan-card"
                      style={{ "--o": off, "--a": Math.abs(off), zIndex: 10 - Math.abs(Math.round(off)), animationDelay: `${i * 0.5}s` }}
                    >
                      <Cover book={b} />
                    </span>
                  );
                })}
              </div>

              {loading ? (
                <div className="aa-buy-skel" aria-hidden="true">
                  <span className="bx-skel" style={{ width: "50%", height: 18 }} />
                  <span className="bx-skel" style={{ width: "70%", height: 40 }} />
                  <span className="bx-skel" style={{ height: 52 }} />
                </div>
              ) : ready ? (
                <div className="aa-buy-body">
                  <div className="aa-buy-top">
                    <span className="aa-buy-label">{focusLifetime ? <Crown size={14} weight="fill" /> : <Books size={14} weight="fill" />} {focus.title}</span>
                    {offPct > 0 && <span className="bx-off">{offPct}% off</span>}
                  </div>
                  <div className="aa-buy-price">
                    <strong>{inr(focus.price)}</strong>
                    {wasPrice > 0 && <s>{inr(wasPrice)}</s>}
                    <span>one time</span>
                  </div>
                  {save > 0 && <p className="aa-buy-save">You keep {inr(save)} compared with buying one by one</p>}
                  <ul className="aa-buy-list">
                    {buyPoints.map(({ icon: Icon, text }) => (
                      <li key={text}><Icon size={18} weight="fill" /> <span>{text}</span></li>
                    ))}
                  </ul>
                  <button type="button" className="bx-btn bx-btn-lg bx-btn-block aa-btn-panel" onClick={onCta}>
                    {ctaLabel} <ArrowRight size={18} weight="bold" />
                  </button>
                  <p className="aa-buy-note"><LockKey size={14} /> Secure checkout · PDFs sent to your email</p>
                </div>
              ) : (
                <div className="aa-buy-body">
                  <p className="aa-buy-note">{error ? "We could not load the price right now." : "Packs are being set up."}</p>
                  {error && (
                    <button type="button" className="bx-btn bx-btn-onpanel" onClick={reload}>
                      <ArrowsClockwise size={18} /> Try again
                    </button>
                  )}
                </div>
              )}
            </motion.aside>
          </div>
        </section>

        {/* ================= TRUST STRIP ================= */}
        <div className="bx-shell">
          <motion.ul className="bx-trust" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-32px" }}>
            {[
              { icon: Lightning, t: "Instant delivery", d: "PDFs land in your inbox right after payment." },
              { icon: LockKey, t: "Safe checkout", d: "UPI, card or net banking. Cards never stored." },
              { icon: Prohibit, t: "No subscription", d: "Pay once. Nothing renews, ever." },
              { icon: ChatsCircle, t: "Human support", d: "Email us and a person replies." },
            ].map(({ icon: Icon, t, d }) => (
              <motion.li key={t} className="bx-trust-item" variants={item}>
                <span className="bx-tile"><Icon size={20} weight="duotone" /></span>
                <div>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        </div>

        {/* ================= PRICING ================= */}
        <section className="bx-sec" id="packs" ref={packsRef}>
          <div className="bx-shell">
            <Head
              center
              eyebrow="Pricing"
              title={packs.length > 1 ? <>Pick your pack. <span className="bx-hl">Pay once.</span></> : <>One pack. <span className="bx-hl">Pay once.</span></>}
              lead={lifetimePack && packs.length > 1
                ? "Lifetime is the only pack that keeps sending you every new book. Neither pack is a subscription."
                : "No subscription and no renewal. Your PDFs are emailed right after payment."}
            />

            {loading && (
              <div className="bx-packs" aria-hidden="true">
                {[0, 1].map((i) => (
                  <div key={i} className="bx-pack aa-pack-skel">
                    <span className="bx-skel" style={{ width: "40%", height: 16 }} />
                    <span className="bx-skel" style={{ width: "70%", height: 30 }} />
                    <span className="bx-skel" style={{ width: "50%", height: 44 }} />
                    <span className="bx-skel" style={{ height: 14 }} />
                    <span className="bx-skel" style={{ height: 14 }} />
                    <span className="bx-skel" style={{ width: "80%", height: 14 }} />
                    <span className="bx-skel" style={{ height: 52 }} />
                  </div>
                ))}
              </div>
            )}

            {!loading && error && (
              <div className="aa-empty" role="alert">
                <p>We could not load the packs. {error}</p>
                <button type="button" className="bx-btn bx-btn-ghost" onClick={reload}>
                  <ArrowsClockwise size={18} /> Try again
                </button>
              </div>
            )}

            {!loading && !error && packs.length === 0 && (
              <div className="aa-empty">
                <p>Packs are being set up. Meanwhile, every book is available on its own page.</p>
                <Link className="bx-btn bx-btn-ghost" to="/books">Browse all books <ArrowRight size={18} /></Link>
              </div>
            )}

            {!loading && !error && packs.length > 0 && (
              <motion.div className={`bx-packs ${packs.length === 1 ? "aa-one" : ""}`} variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-48px" }}>
                {packs.map((p) => (
                  <motion.div key={p._id} variants={item} className={`aa-pack-slot ${p._id === recommended?._id ? "is-first" : ""}`}>
                    <PackCard pack={p} worth={worth} featured={p._id === recommended?._id} onBuy={buy} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {ready && extra > 0 && (
              <Reveal as="p" className="aa-extra">
                <Crown size={18} weight="fill" /> <span>Lifetime is just <b>{inr(extra)}</b> more than {basicPack.title}, and covers every book we publish from here on.</span>
              </Reveal>
            )}
          </div>
        </section>

        {/* ================= THE MATHS ================= */}
        {ready && save > 0 && (
          <section className="bx-sec bx-tint">
            <div className="bx-shell">
              <Head
                eyebrow="The maths"
                title={<>Book by book adds up. <span className="bx-hl">A pack does not.</span></>}
                lead={`Bought one at a time, the ${bookCount} ${bookWord(bookCount)} cost ${inr(worth)}. A pack puts the same shelf in your inbox for a fraction of that.`}
              />
              <div className="aa-maths">
                <div className="aa-bars">
                  {bars.map((b, i) => (
                    <div key={b.label} className={`aa-bar-row is-${b.tone}`}>
                      <div className="aa-bar-meta">
                        <span>{b.label}</span>
                        <b className="bx-mono">{inr(b.value)}</b>
                      </div>
                      <div className="aa-bar-track">
                        <motion.span
                          className="aa-bar"
                          style={{ width: `${Math.max(4, (b.value / barMax) * 100)}%` }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true, margin: "-32px" }}
                          transition={{ duration: 1, ease: EASE, delay: i * 0.12 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Reveal className="aa-keep" delay={0.1}>
                  <p className="aa-keep-label">With {focus.title} you keep</p>
                  <p className="aa-keep-num bx-mono"><Counter value={save} prefix="₹" /></p>
                  <p className="aa-keep-text">
                    That is {savePct}% less than buying every book separately
                    {focusLifetime ? ", and the gap grows with every book we publish." : "."}
                  </p>
                  <button type="button" className="bx-btn bx-btn-lg bx-btn-block aa-btn-panel" onClick={onCta}>
                    {ctaLabel} <ArrowRight size={18} weight="bold" />
                  </button>
                </Reveal>
              </div>
            </div>
          </section>
        )}

        {ready && save <= 0 && focusLifetime && (
          <section className="bx-sec bx-tint">
            <div className="bx-shell">
              <Head
                eyebrow="The maths"
                title={<>The <span className="bx-hl">last time</span> you pay for a Target Trek book</>}
                lead="A normal purchase ends at checkout. Lifetime keeps delivering: every book we publish after today is one you do not pay for."
              />
              <motion.div className="aa-sum" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-48px" }}>
                <motion.div className="aa-card" variants={item}>
                  <p className="aa-card-k">{packCount} {bookWord(packCount)} today</p>
                  <p className="aa-card-v bx-mono">{worth > 0 ? <Counter value={worth} prefix="₹" /> : "Included"}</p>
                  <p className="aa-card-t">{worth > 0 ? "What the current shelf costs bought one by one." : "The full shelf, emailed right after payment."}</p>
                </motion.div>
                <motion.div className="aa-card" variants={item}>
                  <p className="aa-card-k">Every future book</p>
                  <p className="aa-card-v bx-mono aa-ok">₹0</p>
                  <p className="aa-card-t">Each new release is emailed to you with the PDF inside.</p>
                </motion.div>
                <motion.div className="aa-card is-hot" variants={item}>
                  <p className="aa-card-k">You pay, once</p>
                  <p className="aa-card-v bx-mono"><Counter value={focus.price} prefix="₹" /></p>
                  <p className="aa-card-t">{extra > 0 ? `${inr(extra)} more than ${basicPack.title}, nothing to renew.` : "One payment with nothing to renew."}</p>
                </motion.div>
              </motion.div>
            </div>
          </section>
        )}

        {/* ================= LIBRARY ================= */}
        <section className={`bx-sec ${ready && (save > 0 || focusLifetime) ? "" : "bx-tint"}`} id="library">
          <div className="bx-shell">
            <Head
              eyebrow="The library"
              title={<>Every book <span className="bx-hl">in the pack</span></>}
              lead={books.length > 0
                ? `${books.length} ${bookWord(books.length)}${worth > 0 ? `, worth ${inr(worth)} one by one` : ""}. Tap any book to see what is inside before you pay. This list grows as we publish.`
                : "Books appear here as soon as they are published."}
            />
            {loading ? (
              <div className="aa-books" aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => <span key={i} className="bx-skel aa-skel-book" />)}
              </div>
            ) : (
              <BookLibrary books={books} />
            )}
          </div>
        </section>

        {/* ================= BENEFITS ================= */}
        <section className="bx-sec bx-tint" id="benefits">
          <div className="bx-shell">
            <Head eyebrow="What you get" title={<>One pack, and your prep is <span className="bx-hl">covered</span></>} lead="Everything below is in the price you see. No add ons at checkout." />
            <motion.div className="aa-benefits" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-48px" }}>
              {benefits.map(({ icon: Icon, title: t, text, lifetime }) => (
                <motion.article key={t} className="aa-card aa-benefit" variants={item}>
                  <div className="aa-benefit-top">
                    <span className="bx-tile"><Icon size={22} weight="duotone" /></span>
                    {lifetime && <span className="bx-ribbon"><Crown size={12} weight="fill" /> Lifetime</span>}
                  </div>
                  <h3>{t}</h3>
                  <p>{text}</p>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="bx-sec" id="how">
          <div className="bx-shell">
            <Head center eyebrow="How it works" title={<>From payment to prepared <span className="bx-hl">in minutes</span></>} />
            <motion.ol className="aa-steps" style={{ "--n": steps.length }} variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-64px" }}>
              {steps.map(({ icon: Icon, title: t, text }, i) => (
                <motion.li key={t} className="bx-step" variants={item}>
                  <span className="bx-step-n">{i + 1}</span>
                  <h3><Icon size={20} weight="duotone" className="aa-step-ico" /> {t}</h3>
                  <p>{text}</p>
                </motion.li>
              ))}
            </motion.ol>
          </div>
        </section>

        {/* ================= COMPARE ================= */}
        {ready && columns.length > 0 && (
          <section className="bx-sec bx-tint" id="compare">
            <div className="bx-shell">
              <Head center eyebrow="Compare" title="What is in each pack" lead="Side by side, next to buying book by book." />
              <Reveal className="aa-table-wrap">
                <table className="aa-table">
                  <caption className="bx-sr">What is in each pack compared with buying one by one</caption>
                  <thead>
                    <tr>
                      <th scope="col"><span className="bx-sr">Feature</span></th>
                      {columns.map((p) => (
                        <th scope="col" key={p._id} className={p._id === recommended?._id ? "is-hl" : ""}>
                          {p._id === recommended?._id && columns.length > 1 && <span className="aa-th-rec"><Crown size={11} weight="fill" /> Best value</span>}
                          <span className="aa-th-name">{p.title}</span>
                          <small className="bx-mono">{inr(p.price)}</small>
                        </th>
                      ))}
                      <th scope="col" className="is-other">
                        <span className="aa-th-name">One by one</span>
                        <small className="bx-mono">{worth > 0 ? inr(worth) : "—"}</small>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.label}>
                        <th scope="row">{r.label}</th>
                        {columns.map((p) => {
                          const v = r.cell(p);
                          return (
                            <td key={p._id} className={p._id === recommended?._id ? "is-hl" : ""}>
                              {v === true ? <CheckCircle className="aa-yes" size={22} weight="fill" aria-label="Included" /> : v === false ? <Minus className="aa-no" size={20} aria-label="Not included" /> : <b>{v}</b>}
                            </td>
                          );
                        })}
                        <td className="is-other">{r.other === false ? <Minus className="aa-no" size={20} aria-label="Not included" /> : <span>{r.other}</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Reveal>
              <p className="aa-swipe" aria-hidden="true">Swipe the table to see every column</p>
              <div className="aa-center">
                <button type="button" className="bx-btn bx-btn-lg bx-btn-primary" onClick={() => buy(recommended)}>
                  Get {recommended.plan === "lifetime" ? "Lifetime" : "all books"} for {inr(recommended.price)} <ArrowRight size={18} weight="bold" />
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ================= LIFETIME GIFT: MEMORIES ================= */}
        {lifetimePack && <MemoriesGift pack={lifetimePack} onBuy={() => buy(lifetimePack)} />}

        {/* ================= PREP ARENA ================= */}
        {anyMatches && (
          <section className="bx-sec bx-tint" id="prep-arena">
            <div className="bx-shell aa-split">
              <div>
                <Head eyebrow="Prep Arena" title={<>Reading is half the work. <span className="bx-hl">Practice</span> is the other half.</>} lead="Prep Arena pairs you with another serious candidate so you can rehearse real interviews together. 1 credit = 1 match = 1 buddy partnership." />
                <motion.ol className="aa-flow" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-48px" }}>
                  {MATCH_FLOW.map((s, i) => (
                    <motion.li key={s.title} variants={item}>
                      <span className="aa-flow-n bx-mono">{i + 1}</span>
                      <div>
                        <h3>{s.title}</h3>
                        <p>{s.text}</p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ol>
                <Link className="bx-link" to="/prep-buddy">See Prep Arena <ArrowUpRight size={16} /></Link>
              </div>

              <Reveal className="aa-credits" delay={0.1}>
                <p className="aa-buy-label"><Sword size={14} weight="fill" /> Included with the biggest pack</p>
                <p className="aa-credits-num"><span className="bx-mono"><Counter value={maxMatches} /></span> {creditWord(maxMatches)}</p>
                <div className="aa-dots" aria-hidden="true">
                  {Array.from({ length: Math.min(maxMatches, 60) }, (_, i) => <i key={i} style={{ animationDelay: `${Math.min(i, 30) * 0.03}s` }} />)}
                </div>
                <p className="aa-credits-text">Added the moment you sign up with the same email. Unused credits never expire.</p>
              </Reveal>
            </div>
          </section>
        )}

        {/* ================= TRUST ================= */}
        <section className="bx-sec" id="trust">
          <div className="bx-shell">
            <Head center eyebrow="Buy with confidence" title="What you can count on" lead="No fine print. This is exactly how a purchase works here." />
            <motion.div className="aa-trust" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-48px" }}>
              {TRUST.map(({ icon: Icon, title: t, text, to, linkLabel, mail }) => (
                <motion.article key={t} className="aa-card aa-trust-item" variants={item}>
                  <span className="bx-tile"><Icon size={22} weight="duotone" /></span>
                  <h3>{t}</h3>
                  <p>{text}</p>
                  {to && <Link to={to} className="bx-link">{linkLabel} <ArrowRight size={16} /></Link>}
                  {mail && <a href={`mailto:${SUPPORT_EMAIL}`} className="bx-link">Email support <ArrowRight size={16} /></a>}
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ================= FAQ ================= */}
        <section className="bx-sec bx-tint" id="faq">
          <div className="bx-shell bx-faq">
            <div className="aa-faq-side">
              <Head eyebrow="FAQ" title={<>Questions, <span className="bx-hl">answered</span></>} lead="Everything people ask before they buy." />
              <Reveal className="bx-faq-help">
                <span className="bx-tile"><ChatsCircle size={20} weight="duotone" /></span>
                <div>
                  <p><b>Still unsure?</b> Write to us and a person will reply.</p>
                  <a className="bx-link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                </div>
              </Reveal>
            </div>
            <Faq items={faqs} />
          </div>
        </section>

        {/* ================= FINAL CTA ================= */}
        <section className="bx-sec" ref={finalRef}>
          <div className="bx-shell">
            <Reveal className="bx-cta aa-final">
              <div>
                <p className="aa-buy-label">{focusLifetime ? <InfinityIcon size={14} weight="bold" /> : <Books size={14} weight="fill" />} {focus?.title || "Book packs"}</p>
                <h2 className="bx-h2">Stop collecting links. <span className="aa-final-hl">Start preparing.</span></h2>
                <p>{subhead}</p>
                <ul className="aa-final-ticks">
                  <li><ShieldCheck size={16} weight="fill" /> Secure checkout</li>
                  <li><EnvelopeSimple size={16} weight="fill" /> PDFs by email</li>
                  <li><Prohibit size={16} weight="bold" /> No subscription</li>
                </ul>
              </div>
              <div className="aa-final-actions">
                {ready && (
                  <div className="aa-final-price">
                    <strong className="bx-mono">{inr(focus.price)}</strong>
                    {wasPrice > 0 && <s className="bx-mono">{inr(wasPrice)}</s>}
                  </div>
                )}
                {loading ? (
                  <span className="bx-skel aa-skel-btn" aria-hidden="true" />
                ) : (
                  <button type="button" className="bx-btn bx-btn-lg aa-btn-panel" onClick={onCta}>
                    {ctaLabel} <ArrowRight size={18} weight="bold" />
                  </button>
                )}
                <Link className="bx-btn bx-btn-onpanel" to="/books">Browse single books</Link>
              </div>
            </Reveal>
            <p className="aa-links">
              <Link to="/books">All books</Link>
              <Link to="/prep-buddy">Prep Arena</Link>
              {lifetimePack && <Link to="/memories">Memories</Link>}
              <Link to="/refund-policy">Refund policy</Link>
              <Link to="/privacy-policy">Privacy</Link>
              <Link to="/terms-of-service">Terms</Link>
            </p>
          </div>
        </section>

        {/* ================= STICKY BUY BAR ================= */}
        <AnimatePresence>
          {showBar && (
            <motion.div
              className="bx-bar aa-bar-sticky"
              initial={{ y: 96, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 96, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE }}
              role="region"
              aria-label="Quick buy"
            >
              <span className="aa-bar-covers" aria-hidden="true">
                {heroCovers.slice(0, 3).map((b, i) => (
                  <img key={b._id} src={b.coverPageUrl} alt="" style={{ zIndex: 3 - i }} />
                ))}
              </span>
              <div className="bx-bar-copy">
                <strong>{focus?.title}</strong>
                <span>
                  {focus ? inr(focus.price) : ""}
                  {savePct > 0 && <em className="aa-bar-save"> · save {savePct}%</em>}
                </span>
              </div>
              <button type="button" className="bx-btn bx-btn-primary" onClick={onCta}>
                Get it <ArrowRight size={16} weight="bold" />
              </button>
              <button type="button" className="bx-bar-close" onClick={() => setBarClosed(true)} aria-label="Hide this bar">
                <X size={16} weight="bold" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <PayUCheckoutModal isOpen={Boolean(product)} onClose={() => setProduct(null)} product={product} />
      </main>
    </MotionConfig>
  );
}

/* =====================================================
   PRICING CARD (uses .bx-pack from books.css)
===================================================== */

function PackCard({ pack, worth, featured, onBuy }) {
  const [open, setOpen] = useState(false);
  const lifetime = pack.plan === "lifetime";
  const included = pack.includedBooks || [];
  const save = worth > pack.price ? worth - pack.price : 0;
  const panelId = `aa-inside-${pack._id}`;
  const off = Number(pack.mrp) > pack.price ? Math.round((1 - pack.price / pack.mrp) * 100) : 0;

  return (
    <article className={`bx-pack ${featured ? "is-featured" : ""}`}>
      <div className="bx-pack-head">
        <span className="bx-eyebrow">{lifetime ? <><Crown size={14} weight="fill" /> Lifetime pack</> : <><Books size={14} weight="fill" /> All Books pack</>}</span>
        {featured && <span className="bx-ribbon"><Crown size={12} weight="fill" /> Recommended</span>}
      </div>
      <h3>{pack.title}</h3>
      {pack.subtitle && <p className="bx-pack-sub">{pack.subtitle}</p>}

      {included.length > 0 && (
        <div className="bx-pack-covers" aria-hidden="true">
          {included.slice(0, 6).map((b) => (
            <span key={b._id} className="bx-pack-thumb">
              {b.coverPageUrl ? <img src={b.coverPageUrl} alt="" loading="lazy" /> : <BookOpen size={16} />}
            </span>
          ))}
          {included.length > 6 && <span className="bx-pack-more">+{included.length - 6} more</span>}
        </div>
      )}

      <div className="bx-pack-price">
        <strong>{inr(pack.price)}</strong>
        {pack.mrp > pack.price && <s>{inr(pack.mrp)}</s>}
        {off > 0 && <span className="bx-off">{off}% off</span>}
        <span>one payment</span>
      </div>
      {save > 0 && <p className="bx-pack-worth">You keep {inr(save)} compared with buying one by one</p>}
      {featured && lifetime && (
        <p className="aa-why"><InfinityIcon size={18} weight="bold" /> <span>Every book we publish after today is yours at no extra cost.</span></p>
      )}

      <ul className="bx-checks">
        {packFeatures(pack).map(({ icon: Icon, text, strong }) => (
          <li key={text}>
            <Icon size={18} weight={strong ? "fill" : "regular"} /> {strong ? <b>{text}</b> : <span>{text}</span>}
          </li>
        ))}
      </ul>

      {included.length > 0 && (
        <div className="bx-inside">
          <button type="button" className="bx-inside-btn" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={panelId}>
            <span className="aa-inline"><BookOpen size={18} /> {open ? "Hide" : "See"} all {included.length} {bookWord(included.length)} inside</span>
            <CaretDown size={16} weight="bold" className={`aa-caret ${open ? "is-open" : ""}`} />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.ul
                id={panelId}
                className="bx-inside-list"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                {included.map((b) => (
                  <li key={b._id}><Check size={14} weight="bold" /> <span>{b.title}</span></li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="bx-pack-actions">
        <button type="button" className={`bx-btn bx-btn-lg bx-btn-block ${featured ? "bx-btn-primary" : "bx-btn-ghost"}`} onClick={() => onBuy(pack)}>
          Get {lifetime ? "Lifetime" : "all books"} for {inr(pack.price)} <ArrowRight size={18} weight="bold" />
        </button>
        <p className="aa-pack-note"><LockKey size={13} /> Secure checkout · PDFs sent to your email</p>
      </div>
    </article>
  );
}

/* =====================================================
   LIBRARY: every book in the pack, searchable.
===================================================== */

const LIBRARY_FIRST = 12;

function BookLibrary({ books }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [all, setAll] = useState(false);

  const cats = useMemo(() => ["All", ...Array.from(new Set(books.map((b) => b.category).filter(Boolean)))], [books]);

  const matched = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return books.filter((b) => {
      if (cat !== "All" && b.category !== cat) return false;
      if (!needle) return true;
      return [b.title, b.subtitle, b.category, ...(b.topics || []), ...(b.tags || [])].join(" ").toLowerCase().includes(needle);
    });
  }, [books, q, cat]);

  if (books.length === 0) {
    return (
      <div className="aa-empty">
        <p>The first books are on their way. Check back soon.</p>
        <Link className="bx-btn bx-btn-ghost" to="/books">Go to the books page <ArrowRight size={18} /></Link>
      </div>
    );
  }

  const filtering = q.trim() !== "" || cat !== "All";
  const shown = all || filtering ? matched : matched.slice(0, LIBRARY_FIRST);
  const hidden = matched.length - shown.length;

  return (
    <>
      <div className="aa-filter">
        <label className="bx-search">
          <MagnifyingGlass size={18} className="bx-search-icon" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books and topics" aria-label="Search books" enterKeyHint="search" />
          {q && (
            <button type="button" className="bx-search-clear" onClick={() => setQ("")} aria-label="Clear search">
              <X size={14} weight="bold" />
            </button>
          )}
        </label>
        {cats.length > 2 && (
          <div className="aa-chips" role="group" aria-label="Filter by category">
            {cats.map((c) => (
              <button key={c} type="button" aria-pressed={cat === c} className={`aa-chip ${cat === c ? "is-on" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        )}
      </div>

      <div className="aa-books">
        {shown.map((b, i) => (
          <motion.div
            key={b._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-24px" }}
            transition={{ duration: 0.5, ease: EASE, delay: (i % 6) * 0.05 }}
          >
            <Link to={b.redirectUrl || "/books"} className="aa-book">
              <span className="aa-book-media">
                <Cover book={b} />
                <span className="aa-included"><Check size={11} weight="bold" /> Included</span>
              </span>
              <span className="aa-book-body">
                {b.category && <span className="bx-kicker">{b.category}</span>}
                <span className="aa-book-title">{b.title}</span>
                <span className="aa-book-foot">
                  {Number(b.price) > 0 && <s className="bx-mono">{inr(b.price)}</s>}
                  <span className="aa-book-go">Details <ArrowUpRight size={12} weight="bold" /></span>
                </span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {hidden > 0 && (
        <div className="aa-center">
          <button type="button" className="bx-btn bx-btn-ghost" onClick={() => setAll(true)}>
            Show all {matched.length} {bookWord(matched.length)} <CaretDown size={16} weight="bold" />
          </button>
        </div>
      )}

      {matched.length === 0 && (
        <div className="aa-empty">
          <p>No book matches that search.</p>
          <button type="button" className="bx-btn bx-btn-ghost" onClick={() => { setQ(""); setCat("All"); }}>Clear search</button>
        </div>
      )}
    </>
  );
}

/* =====================================================
   LIFETIME GIFT: one free Memories page.
===================================================== */

function MemoriesGift({ pack, onBuy }) {
  return (
    <section className="bx-sec" id="memories">
      <div className="bx-shell">
        <div className="aa-mem">
          <div className="aa-mem-copy">
            <p className="aa-mem-pill"><Gift size={16} weight="fill" /> Free with Lifetime</p>
            <h2 className="bx-h2">A free Memories page, for someone who <span className="aa-final-hl">stood by you</span></h2>
            <p className="aa-mem-lead">Interview prep is serious, and the people around you carry it too. Every Lifetime pack includes 1 Memories page: a personal page with your photos and words, shared as a private link.</p>
            <ul className="aa-mem-ticks">
              {["Your unique code is emailed after purchase", "Works on any template and look", "A private link that opens on any phone"].map((t) => (
                <li key={t}><Heart size={18} weight="fill" /> {t}</li>
              ))}
            </ul>
            <div className="aa-mem-actions">
              <button type="button" className="bx-btn bx-btn-lg aa-btn-panel" onClick={onBuy}>
                Get Lifetime for {inr(pack.price)} <ArrowRight size={18} weight="bold" />
              </button>
              <Link className="bx-btn bx-btn-onpanel" to={MEMORIES_REDEEM}><Key size={16} /> Redeem a code</Link>
            </div>
          </div>

          <motion.div className="aa-tpls" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-48px" }}>
            {MEMORY_TEMPLATES.map(({ icon: Icon, name, text, demo }) => (
              <motion.div key={name} variants={item}>
                <Link to={demo} target="_blank" rel="noopener" className="aa-tpl">
                  <span className="aa-tpl-ico"><Icon size={22} weight="duotone" /></span>
                  <b>{name}</b>
                  <span>{text}</span>
                  <span className="aa-tpl-go">Live preview <ArrowUpRight size={12} weight="bold" /></span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* =====================================================
   FAQ (uses .bx-faq-item from books.css)
===================================================== */

function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="bx-faq-list">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className={`bx-faq-item ${isOpen ? "is-open" : ""}`}>
            <h3 className="aa-faq-h">
              <button type="button" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} aria-controls={`aa-faq-${i}`} id={`aa-faq-q-${i}`}>
                <span>{f.q}</span>
                <span className="bx-faq-icon">{isOpen ? <Minus size={16} weight="bold" /> : <Plus size={16} weight="bold" />}</span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`aa-faq-${i}`}
                  role="region"
                  aria-labelledby={`aa-faq-q-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  style={{ overflow: "hidden" }}
                >
                  <p className="bx-faq-answer">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
