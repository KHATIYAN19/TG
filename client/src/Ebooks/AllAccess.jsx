/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import {
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
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
  HandTap,
  Heart,
  Infinity as InfinityIcon,
  Key,
  Lightbulb,
  Lightning,
  LockKey,
  MagnifyingGlass,
  Minus,
  Prohibit,
  Receipt,
  ShieldCheck,
  Sword,
  TreeEvergreen,
} from "@phosphor-icons/react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { inr, usePacks } from "./PackSections";

/* =====================================================
   PACK LANDING PAGE
   Served on /book/life-type-combo and /book/all-books (and /all-access).

   One offer per URL: the pack whose page you are on is the "focus" pack.
   The hero, the sticky bar and the final call to action all sell that
   pack; the other pack is offered once, in the pricing section.

   Every number, price, book and credit count comes from the database
   (GET /api/membership/plans, see PackSections.jsx). Nothing on this page
   is invented: no reviews, no buyer counts, no made up guarantees.
   Lifetime only sections render only when a lifetime pack exists, and
   Prep Arena sections render only when a pack carries credits.
===================================================== */

const SITE_URL = "https://www.targettrek.in";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const MEMORIES_REDEEM = "/memories/app/pay";
const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";
const FONT_URL = "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap";

/* Motion: one weighted curve everywhere, transform and opacity only. */
const EASE = [0.22, 1, 0.36, 1];
const FLOAT_EASE = [0.45, 0, 0.55, 1];

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

/* Scroll reveal: rises 32px and fades in, once. */
function Reveal({ as = "div", delay = 0, children, ...rest }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const staggerItem = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };

function Counter({ value, prefix = "", suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    const controls = animate(0, Number(value) || 0, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return <span ref={ref} className="lp-num">{prefix}{shown.toLocaleString("en-IN")}{suffix}</span>;
}

function SectionHead({ eyebrow, title, lead, center }) {
  return (
    <Reveal className={`lp-head ${center ? "center" : ""}`}>
      {eyebrow && <p className="lp-eyebrow caption-3">{eyebrow}</p>}
      <h2 className="heading-2">{title}</h2>
      {lead && <p className="lp-lead body-3">{lead}</p>}
    </Reveal>
  );
}

/* 3D tilt that follows the mouse. Touch screens just see the static element. */
function Tilt({ children, className = "", max = 8 }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 160, damping: 18 });
  const sy = useSpring(ry, { stiffness: 160, damping: 18 });

  const onMove = (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    ry.set(((e.clientX - r.left) / r.width - 0.5) * max * 2);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * max * 2);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: sx, rotateY: sy, transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  );
}

/*
  Tagline reveal: every word starts muted and lights up, in reading order,
  as it crosses a line 30% above the bottom of the screen. One observer,
  no scroll listener. Reduced motion shows the full text at once (see CSS).
*/
function TaglineReveal({ lines }) {
  const ref = useRef(null);
  const key = lines.join("|");

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;
    const words = Array.from(root.querySelectorAll(".lp-word"));
    if (typeof IntersectionObserver === "undefined") {
      words.forEach((w) => w.classList.add("on"));
      return undefined;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        entries
          .filter((e) => e.isIntersecting || e.boundingClientRect.top < 0)
          .sort((a, b) => words.indexOf(a.target) - words.indexOf(b.target))
          .forEach((e, i) => {
            e.target.style.transitionDelay = `${Math.min(i, 12) * 70}ms`;
            e.target.classList.add("on");
            obs.unobserve(e.target);
          });
      },
      { rootMargin: "0px 0px -30% 0px", threshold: 0 }
    );
    words.forEach((w) => obs.observe(w));
    return () => obs.disconnect();
  }, [key]);

  return (
    <section className="lp-tagline" aria-label={lines.join(" ")}>
      <div className="lp-wrap">
        <p className="lp-tagline-text heading-1" ref={ref} key={key} aria-hidden="true">
          {lines.map((line) => (
            <span className="lp-tagline-line" key={line}>
              {line.split(" ").map((word, i) => (
                <span className="lp-word" key={`${word}-${i}`}>{word} </span>
              ))}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

/* ---------- static copy (facts only, no invented proof) ---------- */

const MEMORY_TEMPLATES = [
  { icon: Cake, name: "Birthday", text: "A surprise page full of photos and wishes.", demo: "/memories/preview/birthday" },
  { icon: CalendarHeart, name: "Anniversary", text: "Your story so far, told in photos and words.", demo: "/memories/preview/anniversary" },
  { icon: Diamond, name: "Proposal", text: "Ask the big question on a page they will keep.", demo: "/memories/preview/proposal" },
  { icon: HandHeart, name: "Sorry", text: "Say it properly, when a text is not enough.", demo: "/memories/preview/sorry" },
  { icon: Flower, name: "Thank you", text: "Thank a mentor, friend or parent in a way that lasts.", demo: "/memories/preview/thanks" },
  { icon: TreeEvergreen, name: "Christmas", text: "A festive greeting page, made just for them.", demo: "/memories/preview/christmas" },
];

const MATCH_FLOW = [
  { title: "Sign up", text: "Create your Prep Arena profile with the email you bought with. Your credits are added at once." },
  { title: "Find a buddy", text: "Browse members preparing for similar roles and send a request, or accept one." },
  { title: "Practise together", text: "Run mock interviews and chat privately inside the platform. You appear under an alias." },
  { title: "Use the next credit", text: "When a partnership ends, your next credit pairs you with someone new." },
];

const TRUST = [
  { icon: LockKey, title: "Checkout you already know", text: "Pay by UPI, card or net banking through a trusted payment gateway. We never see or store your card details." },
  { icon: EnvelopeSimple, title: "In your inbox right after payment", text: "Your PDFs are emailed as soon as the payment goes through. Very large files arrive as a download link." },
  { icon: Prohibit, title: "Nothing renews", text: "It is a single payment. There is no subscription, no saved card and no charge next month." },
  { icon: ChatsCircle, title: "A person answers", text: `Missing a file or stuck somewhere? Write to ${SUPPORT_EMAIL} and we will sort it out and resend what you need.`, mail: true },
  { icon: Eye, title: "See every book before you pay", text: "Each book in the pack has its own page with its topics and details. Open any of them from the library above.", to: "/books", linkLabel: "Browse all books" },
  { icon: Receipt, title: "Refund rules in plain words", text: "Digital books are not refundable, and we would rather say so up front. A verified duplicate charge is refunded within 7 days.", to: "/refund-policy", linkLabel: "Read the refund policy" },
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
        { q: "What is a Prep Arena credit?", a: "Prep Arena pairs you with another serious candidate for mock interviews and private chat. 1 credit = 1 match = 1 partnership. When it ends, your next credit pairs you with someone new, so several credits means several buddies, one after another." },
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
      ? { icon: InfinityIcon, text: "Every book we publish in future, emailed to you free", strong: true }
      : { icon: BellRinging, text: "Email alert when a new book is published" },
    ...(credits > 0 ? [{ icon: Sword, text: `${credits} Prep Arena ${creditWord(credits)}`, strong: true }] : []),
    ...(lifetime
      ? [
          { icon: Heart, text: "1 Memories page free, code emailed after purchase", strong: true },
          { icon: Gift, text: "Free limited Prep Arena credits when we launch new features" },
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
  const heroRef = useRef(null);
  const packsRef = useRef(null);
  const finalRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  // Parallax: the covers drift a little while the hero scrolls away.
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const fanY = useTransform(heroP, [0, 1], [0, 64]);

  const packs = useMemo(() => data?.packs || [], [data]);
  const books = useMemo(() => data?.books || [], [data]);
  const bookCount = Number(data?.stats?.bookCount) || books.length;
  const worth = Number(data?.stats?.individualWorth) || 0;

  const lifetimePack = packs.find((p) => p.plan === "lifetime") || null;
  const basicPack = packs.find((p) => p.plan !== "lifetime") || null;
  const current = packs.find((p) => p.redirectUrl === pathname) || null;
  // The pack this URL sells. Unknown URLs lead with Lifetime.
  const focus = current || lifetimePack || packs[0] || null;
  const focusLifetime = focus?.plan === "lifetime";
  // The pack we recommend in pricing and the comparison: Lifetime whenever it exists.
  const recommended = lifetimePack || focus;
  const ready = !loading && !error && Boolean(focus);

  const maxMatches = Math.max(0, ...packs.map((p) => Number(p.matches) || 0));
  const anyMatches = maxMatches > 0;
  const focusCredits = Number(focus?.matches) || 0;
  const save = focus && worth > focus.price ? worth - focus.price : 0;
  const savePct = focus && worth > 0 && worth > focus.price ? Math.round((1 - focus.price / worth) * 100) : 0;
  const extra = lifetimePack && basicPack && lifetimePack.price > basicPack.price ? lifetimePack.price - basicPack.price : 0;
  // What the buyer of this pack receives today (falls back to the catalogue count).
  const packCount = (focus?.includedBooks || []).length || bookCount;
  const listPct = focus && Number(focus.mrp) > focus.price ? Math.round((1 - focus.price / focus.mrp) * 100) : 0;
  const wasPrice = focus ? (Number(focus.mrp) > focus.price ? Number(focus.mrp) : worth > focus.price ? worth : 0) : 0;

  /* Follow the navbar theme toggle (it saves `theme` and fires an event). */
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

  /* Sticky buy bar: shown once the hero is gone, hidden while the pricing cards or the page end are on screen. */
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.target === heroRef.current) setHeroInView(e.isIntersecting);
        if (e.target === packsRef.current) setPacksInView(e.isIntersecting);
        // The last section and everything after it (the site footer) keep the bar away.
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

  /* Hero and sticky bar covers: HLD, LLD, Java, Spring Boot when present, else the first four. */
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
      if (picked.length < 4 && !picked.includes(b)) picked.push(b);
    });
    return picked.slice(0, 4);
  }, [books]);

  const headline = focusLifetime
    ? ["Every interview book", "we will ever publish.", "One payment."]
    : focus
      ? ["Every interview book", "on the shelf today.", "One payment."]
      : ["Every interview book.", "One pack.", "One payment."];

  const countText = packCount > 0 ? `All ${packCount} Target Trek ${bookWord(packCount)}` : "Every Target Trek book";
  const subhead = focusLifetime
    ? `${countText} land in your inbox as PDFs right after you pay. Every book we publish later is emailed to you free. No subscription, nothing to renew.`
    : `${countText} land in your inbox as PDFs right after you pay, in one pack instead of ${packCount > 1 ? packCount : "many"} separate purchases. No subscription, nothing to renew.`;

  const tagline = focusLifetime || (!focus && !error)
    ? ["Buy the library once.", "Every book we write next", "lands in your inbox, free."]
    : ["The whole shelf.", "One payment, one inbox,", "nothing to renew."];

  /* ---------- benefits (only what the packs really carry) ---------- */
  const benefits = [
    { icon: Books, title: "The whole library, today", text: `${countText} as PDFs, emailed right after you pay. No hunting through ten tabs for the next topic.` },
    ...(lifetimePack ? [{ icon: InfinityIcon, title: "Every future book, free", text: "Each new release is emailed to you with the PDF inside. No checkout and no extra payment.", lifetime: true }] : []),
    { icon: BellRinging, title: "You hear about new books first", text: "Pack members get an email whenever a book is published, so your prep never falls behind." },
    ...(anyMatches ? [{ icon: Sword, title: `Up to ${maxMatches} Prep Arena ${creditWord(maxMatches)}`, text: "Each credit pairs you with another serious candidate for mock interviews and private chat." }] : []),
    ...(lifetimePack ? [{ icon: Heart, title: "A Memories page, on us", text: "A unique code arrives by email. Redeem it and build a personal page for someone you care about.", lifetime: true }] : []),
    { icon: Lightbulb, title: "Ask for the book you need", text: "Request or suggest a topic from inside Prep Arena and follow its status until it is published." },
    ...(lifetimePack ? [{ icon: Gift, title: "Credits when features launch", text: "Lifetime members receive free limited Prep Arena credits when we launch new features.", lifetime: true }] : []),
  ];

  /* ---------- how it works ---------- */
  const steps = [
    { icon: Lightning, title: "Pay once", text: "UPI, card or net banking. No subscription and nothing to renew." },
    { icon: EnvelopeSimpleOpen, title: "Open your inbox", text: `Your PDFs are emailed right after payment.${focusLifetime ? " Your Memories code comes to the same inbox." : ""}` },
    ...(focusCredits > 0 ? [{ icon: Sword, title: "Join Prep Arena", text: `Sign up with the same email and your ${focusCredits} ${creditWord(focusCredits)} ${focusCredits === 1 ? "is" : "are"} added at once.` }] : []),
    focusLifetime
      ? { icon: InfinityIcon, title: "Keep getting more", text: "Every new book is emailed to you with the PDF inside. Nothing more to pay." }
      : { icon: BellRinging, title: "Stay in the loop", text: "We email you whenever a new book is out." },
  ];

  /* ---------- comparison table ---------- */
  const columns = packs.slice(0, 3);
  const hasLifetimeCol = columns.some((p) => p.plan === "lifetime");
  const rows = [
    { label: "Books available today", cell: () => true, other: "Pay for each" },
    { label: "Books published later", cell: (p) => p.plan === "lifetime", other: "Pay for each", note: (p) => (p.plan === "lifetime" ? "Emailed free" : "") },
    { label: "Email when a new book is published", cell: () => true, other: false },
    ...(hasLifetimeCol ? [{ label: "1 Memories page free", cell: (p) => p.plan === "lifetime", other: false, note: (p) => (p.plan === "lifetime" ? "Code by email" : "") }] : []),
    ...(anyMatches ? [{ label: "Prep Arena credits", cell: (p) => (Number(p.matches) > 0 ? `${p.matches}` : false), other: false }] : []),
    ...(hasLifetimeCol ? [{ label: "Free limited credits on feature launches", cell: (p) => p.plan === "lifetime", other: false }] : []),
    { label: "Request new books in Prep Arena", cell: () => true, other: false },
    { label: "One payment, no renewal", cell: () => true, other: "Pay again each time" },
  ];

  /* ---------- value bars ---------- */
  const barMax = Math.max(worth, ...packs.map((p) => Number(p.price) || 0), 1);
  const bars = [
    { label: `Buying all ${bookCount || ""} ${bookWord(bookCount)} one by one`.replace(/\s+/g, " "), value: worth, tone: "muted" },
    ...packs.map((p) => ({ label: p.title, value: p.price, tone: p._id === focus?._id ? "hot" : "warm" })),
  ];

  const showBar = ready && !heroInView && !packsInView && !endReached && !product;

  return (
    <MotionConfig reducedMotion="user">
      <div className="lp mt-16" data-theme={theme}>
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
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={FONT_URL} />
          {packs.length > 0 && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
        </Helmet>

        <style>{PAGE_CSS}</style>

        <motion.div className="lp-progress" style={{ scaleX: progress }} aria-hidden="true" />

        <main>
          {/* ================= HERO ================= */}
          <header className="lp-hero" ref={heroRef}>
            <div className="lp-wrap lp-hero-grid">
              <motion.div className="lp-hero-copy" initial="hidden" animate="show" variants={stagger}>
                <motion.p className="lp-pill caption-1" variants={staggerItem}>
                  {focusLifetime ? <Crown size={16} weight="fill" /> : <Books size={16} weight="fill" />}
                  {focusLifetime ? "Lifetime pack" : "Book pack"}
                  <span className="lp-pill-dot" aria-hidden="true" />
                  One payment, no subscription
                </motion.p>

                <h1 className="lp-h1 heading-1">
                  {headline.map((line) => (
                    <motion.span key={line} className="lp-h1-line" variants={staggerItem}>{line}</motion.span>
                  ))}
                </h1>

                <motion.p className="lp-hero-sub title-2" variants={staggerItem}>{subhead}</motion.p>

                <motion.div className="lp-hero-cta" variants={staggerItem}>
                  {loading ? (
                    <span className="lp-skel lp-skel-btn" aria-hidden="true" />
                  ) : (
                    <button type="button" className="lp-btn lp-btn-lg lp-btn-primary lp-btn-pulse button-lg" onClick={onCta}>
                      {ctaLabel} <ArrowRight size={20} weight="bold" className="lp-arr" />
                    </button>
                  )}
                  <p className="lp-hero-safe caption-2">
                    <LockKey size={16} /> Secure checkout by UPI, card or net banking. PDFs emailed right after payment.
                  </p>
                </motion.div>

                {/* proof: live numbers from the catalogue */}
                <motion.div className="lp-proof" variants={staggerItem}>
                  {loading ? (
                    <span className="lp-skel lp-skel-proof" aria-hidden="true" />
                  ) : ready ? (
                    <dl>
                      <div>
                        <dt className="heading-5"><Counter value={packCount} /></dt>
                        <dd className="caption-2">{bookWord(packCount)} inside today</dd>
                      </div>
                      {save > 0 ? (
                        <div>
                          <dt className="heading-5"><Counter value={worth} prefix="₹" /></dt>
                          <dd className="caption-2">if bought one by one</dd>
                        </div>
                      ) : focusLifetime ? (
                        <div>
                          <dt className="heading-5 lp-num">₹0</dt>
                          <dd className="caption-2">for every future book</dd>
                        </div>
                      ) : null}
                      {savePct > 0 ? (
                        <div>
                          <dt className="heading-5 lp-ok"><Counter value={savePct} suffix="%" /></dt>
                          <dd className="caption-2">saved with this pack</dd>
                        </div>
                      ) : listPct > 0 ? (
                        <div>
                          <dt className="heading-5 lp-ok"><Counter value={listPct} suffix="%" /></dt>
                          <dd className="caption-2">off the list price</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                </motion.div>
              </motion.div>

              {/* real covers from the pack */}
              <motion.div className="lp-fan-wrap" style={{ y: fanY }} aria-hidden="true">
                <Tilt className="lp-fan" max={6}>
                  <span className="lp-fan-panel" />
                  {(heroCovers.length ? heroCovers : [null, null, null, null]).map((b, i, arr) => {
                    const mid = (arr.length - 1) / 2;
                    return (
                      <motion.div
                        key={b?._id || i}
                        className="lp-fan-card"
                        style={{ zIndex: 10 - Math.round(Math.abs(i - mid)) }}
                        initial={{ opacity: 0, y: 64, rotate: 0 }}
                        animate={{ opacity: 1, y: Math.abs(i - mid) * 12, rotate: (i - mid) * 7 }}
                        transition={{ duration: 0.9, delay: 0.25 + i * 0.1, ease: EASE }}
                      >
                        <motion.div
                          className="lp-fan-float"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 5 + i, repeat: Infinity, ease: FLOAT_EASE, delay: i * 0.4 }}
                        >
                          {b?.coverPageUrl ? <img src={b.coverPageUrl} alt="" /> : <span className="lp-fan-ph"><BookOpen size={32} /></span>}
                        </motion.div>
                      </motion.div>
                    );
                  })}

                  {ready && wasPrice > 0 && (
                    <motion.div className="lp-tag lp-tag-price" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.9, ease: EASE }}>
                      <s className="caption-2">{inr(wasPrice)}</s>
                      <b className="heading-6">{inr(focus.price)}</b>
                    </motion.div>
                  )}
                  {ready && focusLifetime && (
                    <motion.div className="lp-tag lp-tag-future caption-3" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.05, ease: EASE }}>
                      <InfinityIcon size={16} weight="bold" /> Every future book included
                    </motion.div>
                  )}
                </Tilt>
              </motion.div>
            </div>
          </header>

          {/* ================= PRICING ================= */}
          <section className="lp-sec lp-alt" id="packs" ref={packsRef}>
            <div className="lp-wrap">
              <SectionHead
                center
                eyebrow="Pricing"
                title={packs.length > 1 ? "Two packs, one payment either way" : "One pack, one payment"}
                lead={lifetimePack && packs.length > 1
                  ? "We recommend Lifetime: it is the only pack that keeps sending you every new book. No subscription and no renewal on either."
                  : "No subscription and no renewal. Your PDFs are emailed right after payment."}
              />

              {loading && (
                <div className="lp-packs" aria-hidden="true">
                  {[0, 1].map((i) => (
                    <div key={i} className="lp-card lp-pack-skel">
                      <span className="lp-skel" style={{ width: "40%" }} />
                      <span className="lp-skel" style={{ width: "70%", height: 32 }} />
                      <span className="lp-skel" style={{ width: "50%", height: 48 }} />
                      <span className="lp-skel" /><span className="lp-skel" /><span className="lp-skel" style={{ width: "80%" }} />
                      <span className="lp-skel" style={{ height: 48 }} />
                    </div>
                  ))}
                </div>
              )}

              {!loading && error && (
                <div className="lp-error" role="alert">
                  <p className="body-5">We could not load the packs. {error}</p>
                  <button type="button" className="lp-btn lp-btn-ghost button-md" onClick={reload}>
                    <ArrowsClockwise size={18} /> Try again
                  </button>
                </div>
              )}

              {!loading && !error && packs.length === 0 && (
                <div className="lp-error">
                  <p className="body-5">Packs are being set up. Meanwhile, every book is available on its own page.</p>
                  <Link className="lp-btn lp-btn-ghost button-md" to="/books">Browse all books <ArrowRight size={18} className="lp-arr" /></Link>
                </div>
              )}

              {!loading && !error && packs.length > 0 && (
                <motion.div className={`lp-packs ${packs.length === 1 ? "one" : ""}`} variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-64px" }}>
                  {packs.map((p) => (
                    <motion.div key={p._id} variants={staggerItem} className={`lp-pack-slot ${p._id === recommended?._id ? "first" : ""}`}>
                      <PackCard pack={p} worth={worth} featured={p._id === recommended?._id} onBuy={buy} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {ready && extra > 0 && (
                <Reveal as="p" className="lp-extra body-5">
                  <Crown size={18} weight="fill" /> Lifetime is {inr(extra)} more than {basicPack.title}, and covers every book we publish from here on.
                </Reveal>
              )}
            </div>
          </section>

          {/* ================= PROBLEM TO SOLUTION: the maths ================= */}
          {ready && save > 0 && (
            <section className="lp-sec">
              <div className="lp-wrap">
                <SectionHead
                  eyebrow="The maths"
                  title="Buying book by book adds up fast"
                  lead={`Bought one at a time, the ${bookCount} ${bookWord(bookCount)} cost ${inr(worth)}. A pack puts the same shelf in your inbox for a fraction of that.`}
                />
                <div className="lp-maths">
                  <div className="lp-bars">
                    {bars.map((b, i) => (
                      <motion.div key={b.label} className="lp-bar-row" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-48px" }}>
                        <span className="lp-bar-label body-5">{b.label}</span>
                        <b className="lp-bar-val body-4 lp-num">{inr(b.value)}</b>
                        <div className="lp-bar-track">
                          <div className="lp-bar-clip" style={{ width: `${Math.max(4, (b.value / barMax) * 100)}%` }}>
                            <motion.span
                              className={`lp-bar ${b.tone}`}
                              variants={{ hidden: { x: "-101%" }, show: { x: 0, transition: { duration: 1.1, ease: EASE, delay: i * 0.12 } } }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {save > 0 && (
                    <Reveal className="lp-keep" delay={0.1}>
                      <p className="caption-1">With {focus.title} you keep</p>
                      <p className="lp-keep-num heading-1"><Counter value={save} prefix="₹" /></p>
                      <p className="body-6">
                        That is {savePct}% less than buying every book separately
                        {focusLifetime ? ", and the gap grows with every book we publish." : "."}
                      </p>
                      <button type="button" className="lp-btn lp-btn-primary button-md" onClick={onCta}>
                        {ctaLabel} <ArrowRight size={18} weight="bold" className="lp-arr" />
                      </button>
                    </Reveal>
                  )}
                </div>
              </div>
            </section>
          )}

          {ready && save <= 0 && focusLifetime && (
            <section className="lp-sec">
              <div className="lp-wrap">
                <SectionHead
                  eyebrow="The maths"
                  title="The last time you pay for a Target Trek book"
                  lead="A normal purchase ends at checkout. Lifetime keeps delivering: every book we publish after today is one you do not pay for."
                />
                <motion.div className="lp-sum" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-64px" }}>
                  <motion.div className="lp-card" variants={staggerItem}>
                    <p className="caption-1">{packCount} {bookWord(packCount)} today</p>
                    <p className="heading-3 lp-num">{worth > 0 ? <Counter value={worth} prefix="₹" /> : "Included"}</p>
                    <p className="body-6">{worth > 0 ? "What the current shelf costs when bought one by one." : "The full shelf, emailed right after payment."}</p>
                  </motion.div>
                  <motion.div className="lp-card" variants={staggerItem}>
                    <p className="caption-1">Every future book</p>
                    <p className="heading-3 lp-num lp-ok">₹0</p>
                    <p className="body-6">Each new release is emailed to you with the PDF inside.</p>
                  </motion.div>
                  <motion.div className="lp-card lp-sum-hot" variants={staggerItem}>
                    <p className="caption-1">You pay, once</p>
                    <p className="heading-3 lp-num"><Counter value={focus.price} prefix="₹" /></p>
                    <p className="body-6">{extra > 0 ? `${inr(extra)} more than ${basicPack.title}, with nothing to renew.` : "One payment with nothing to renew."}</p>
                  </motion.div>
                </motion.div>
              </div>
            </section>
          )}

          {/* ================= BENEFITS ================= */}
          <section className="lp-sec lp-alt" id="benefits">
            <div className="lp-wrap">
              <SectionHead eyebrow="What you get" title="One pack, and your prep is covered" lead="Everything below is included in the price you see. No add ons at checkout." />
              <motion.div className={`lp-benefits r${benefits.length % 3}`} variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-64px" }}>
                {benefits.map(({ icon: Icon, title: t, text, lifetime }) => (
                  <motion.article key={t} className="lp-card lp-benefit" variants={staggerItem}>
                    <div className="lp-benefit-top">
                      <span className="lp-ico"><Icon size={24} weight="duotone" /></span>
                      {lifetime && <span className="lp-badge caption-3"><Crown size={12} weight="fill" /> Lifetime</span>}
                    </div>
                    <h3 className="title-2">{t}</h3>
                    <p className="body-6">{text}</p>
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ================= TAGLINE REVEAL ================= */}
          <TaglineReveal lines={tagline} />

          {/* ================= LIBRARY ================= */}
          <section className="lp-sec lp-alt" id="library">
            <div className="lp-wrap">
              <SectionHead
                eyebrow="The library"
                title="Every book in the pack"
                lead={books.length > 0
                  ? `${books.length} ${bookWord(books.length)}${worth > 0 ? `, worth ${inr(worth)} one by one` : ""}. Open any of them to see what is inside before you pay. This list grows by itself as we publish.`
                  : "Books appear here as soon as they are published."}
              />
              {loading ? (
                <div className="lp-books" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => <span key={i} className="lp-skel lp-skel-book" />)}
                </div>
              ) : (
                <BookLibrary books={books} />
              )}
            </div>
          </section>

          {/* ================= COMPARE ================= */}
          {ready && columns.length > 0 && (
            <section className="lp-sec" id="compare">
              <div className="lp-wrap">
                <SectionHead center eyebrow="Compare" title="What is in each pack" lead="Side by side, next to what buying book by book would mean." />
              <Reveal className="lp-table-wrap" delay={0.05}>
                  <table className="lp-table">
                    <caption className="sr-only">What is in each pack compared with buying one by one</caption>
                    <thead>
                      <tr>
                        <th scope="col"><span className="sr-only">Feature</span></th>
                        {columns.map((p) => (
                          <th scope="col" key={p._id} className={p._id === recommended?._id ? "hl" : ""}>
                            {p._id === recommended?._id && <span className="lp-th-rec caption-3"><Crown size={12} weight="fill" /> Recommended</span>}
                            <span className="body-4">{p.title}</span>
                            <small className="caption-2 lp-num">{inr(p.price)}</small>
                          </th>
                        ))}
                        <th scope="col" className="lp-col-other">
                          <span className="body-4">One by one</span>
                          <small className="caption-2 lp-num">{worth > 0 ? inr(worth) : ""}</small>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.label}>
                          <th scope="row" className="body-5">{r.label}</th>
                          {columns.map((p) => {
                            const v = r.cell(p);
                            return (
                              <td key={p._id} className={p._id === recommended?._id ? "hl" : ""}>
                                {v === true ? <CheckCircle className="yes" size={20} weight="fill" aria-label="Included" /> : v === false ? <Minus className="no" size={20} aria-label="Not included" /> : <b className="body-4">{v}</b>}
                                {r.note?.(p) && <small className="caption-5">{r.note(p)}</small>}
                              </td>
                            );
                          })}
                          <td className="lp-col-other">{r.other === false ? <Minus className="no" size={20} aria-label="Not included" /> : <span className="caption-2">{r.other}</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Reveal>
                <div className="lp-more">
                  <button type="button" className="lp-btn lp-btn-lg lp-btn-primary button-md" onClick={() => buy(recommended)}>
                    Get {recommended.plan === "lifetime" ? "Lifetime" : "all books"} for {inr(recommended.price)} <ArrowRight size={18} weight="bold" className="lp-arr" />
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ================= HOW IT WORKS ================= */}
          <section className="lp-sec lp-alt" id="how">
            <div className="lp-wrap">
              <SectionHead center eyebrow="How it works" title="From payment to prepared in minutes" />
              <div className="lp-steps" style={{ "--n": steps.length }}>
                <div className="lp-steps-line" aria-hidden="true">
                  <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, margin: "-96px" }} transition={{ duration: 1.4, ease: EASE, delay: 0.2 }} />
                </div>
                <motion.ol variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-96px" }}>
                  {steps.map(({ icon: Icon, title: t, text }, i) => (
                    <motion.li key={t} variants={staggerItem}>
                      <span className="lp-step-n body-4">{i + 1}</span>
                      <div className="lp-step-body">
                        <h3 className="title-2"><Icon size={20} weight="duotone" /> {t}</h3>
                        <p className="body-6">{text}</p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ol>
              </div>
            </div>
          </section>

          {/* ================= LIFETIME GIFT: MEMORIES ================= */}
          {lifetimePack && <MemoriesGift pack={lifetimePack} onBuy={() => buy(lifetimePack)} />}

          {/* ================= PREP ARENA (only when a pack has credits) ================= */}
          {anyMatches && (
            <section className="lp-sec lp-alt" id="prep-arena">
              <div className="lp-wrap lp-split">
                <div>
                  <SectionHead eyebrow="Prep Arena" title="Reading is half the work. Practice is the other half." lead="Prep Arena pairs you with another serious candidate so you can rehearse real interviews together. 1 credit = 1 match = 1 buddy partnership." />
                  <motion.ol className="lp-flow" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-64px" }}>
                    {MATCH_FLOW.map((s, i) => (
                      <motion.li key={s.title} variants={staggerItem}>
                        <span className="lp-step-n sm caption-3">{i + 1}</span>
                        <div>
                          <h3 className="title-3">{s.title}</h3>
                          <p className="body-6">{s.text}</p>
                        </div>
                      </motion.li>
                    ))}
                  </motion.ol>
                  <Link className="lp-btn lp-btn-ghost button-md" to="/prep-buddy">See Prep Arena <ArrowUpRight size={18} className="lp-arr" /></Link>
                </div>

                <Reveal className="lp-card lp-credits" delay={0.1}>
                  <p className="caption-1">Included with the biggest pack</p>
                  <p className="heading-3"><Counter value={maxMatches} /> {creditWord(maxMatches)}</p>
                  <div className="lp-dots" aria-hidden="true">
                    {Array.from({ length: Math.min(maxMatches, 60) }, (_, i) => (
                      <motion.i key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: Math.min(i, 30) * 0.03, duration: 0.5, ease: EASE }} />
                    ))}
                  </div>
                  <p className="body-6">Added to your account the moment you sign up with the same email. Unused credits never expire.</p>
                </Reveal>
              </div>
            </section>
          )}

          {/* ================= TRUST AND RISK ================= */}
          <section className={`lp-sec ${anyMatches ? "" : "lp-alt"}`} id="trust">
            <div className="lp-wrap">
              <SectionHead center eyebrow="Buy with confidence" title="What you can count on" lead="No fine print. This is exactly how a purchase works here." />
              <motion.div className="lp-trust" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-64px" }}>
                {TRUST.map(({ icon: Icon, title: t, text, to, linkLabel, mail }) => (
                  <motion.article key={t} className="lp-card lp-trust-item" variants={staggerItem}>
                    <span className="lp-ico"><Icon size={24} weight="duotone" /></span>
                    <h3 className="title-2">{t}</h3>
                    <p className="body-6">{text}</p>
                    {to && <Link to={to} className="lp-link body-4">{linkLabel} <ArrowRight size={16} className="lp-arr" /></Link>}
                    {mail && <a href={`mailto:${SUPPORT_EMAIL}`} className="lp-link body-4">Email support <ArrowRight size={16} className="lp-arr" /></a>}
                  </motion.article>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ================= FAQ ================= */}
          <section className={`lp-sec ${anyMatches ? "lp-alt" : ""}`} id="faq">
            <div className="lp-wrap lp-narrow">
              <SectionHead center eyebrow="FAQ" title="Questions, answered" />
              <Faq items={faqs} />
              <Reveal as="p" className="lp-faq-more body-6">
                Still unsure? Write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and a person will reply.
              </Reveal>
            </div>
          </section>

          {/* ================= FINAL CTA ================= */}
          <section className="lp-final" ref={finalRef}>
            <Reveal className="lp-wrap lp-final-in">
              <span className="lp-final-ico">{focusLifetime ? <InfinityIcon size={32} weight="bold" /> : <Books size={32} weight="duotone" />}</span>
              <h2 className="heading-2">Stop collecting links.<br />Start preparing.</h2>
              <p className="title-2">{subhead}</p>
              {loading ? (
                <span className="lp-skel lp-skel-btn" aria-hidden="true" />
              ) : (
                <button type="button" className="lp-btn lp-btn-lg lp-btn-primary button-lg" onClick={onCta}>
                  {ctaLabel} <ArrowRight size={20} weight="bold" className="lp-arr" />
                </button>
              )}
              <ul className="lp-final-ticks caption-1">
                <li><ShieldCheck size={16} weight="fill" /> Secure checkout</li>
                <li><EnvelopeSimple size={16} weight="fill" /> PDFs by email</li>
                <li><Prohibit size={16} weight="bold" /> No subscription</li>
              </ul>
              <p className="lp-final-links caption-2">
                <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                <Link to="/books">All books</Link>
                <Link to="/prep-buddy">Prep Arena</Link>
                {lifetimePack && <Link to="/memories">Memories</Link>}
                <Link to="/refund-policy">Refund policy</Link>
                <Link to="/privacy-policy">Privacy</Link>
                <Link to="/terms-of-service">Terms</Link>
              </p>
            </Reveal>
          </section>
        </main>

        {/* ================= STICKY BUY BAR ================= */}
        <motion.div
          className="lp-sticky"
          initial={false}
          animate={showBar ? { y: 0, opacity: 1 } : { y: 96, opacity: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          style={{ pointerEvents: showBar ? "auto" : "none" }}
          aria-hidden={!showBar}
        >
          <span className="lp-sticky-covers" aria-hidden="true">
            {heroCovers.slice(0, 3).map((b, i) => (
              <img key={b._id} src={b.coverPageUrl} alt="" style={{ zIndex: 3 - i }} />
            ))}
          </span>
          <div className="lp-sticky-text">
            <b className="body-4">{focus?.title}</b>
            <span className="caption-2">
              <span className="lp-num">{focus ? inr(focus.price) : ""}</span>
              {savePct > 0 && <em className="caption-3">Save {savePct}%</em>}
            </span>
          </div>
          <button type="button" className="lp-btn lp-btn-primary button-md" onClick={onCta} tabIndex={showBar ? 0 : -1}>
            Get it <span className="lp-sticky-price lp-num">{focus ? inr(focus.price) : ""}</span> <ArrowRight size={18} weight="bold" className="lp-arr" />
          </button>
        </motion.div>

        <PayUCheckoutModal isOpen={Boolean(product)} onClose={() => setProduct(null)} product={product} />
      </div>
    </MotionConfig>
  );
}

/* =====================================================
   PRICING CARD
===================================================== */

function PackCard({ pack, worth, featured, onBuy }) {
  const [open, setOpen] = useState(false);
  const lifetime = pack.plan === "lifetime";
  const included = pack.includedBooks || [];
  const save = worth > pack.price ? worth - pack.price : 0;
  const panelId = `lp-inside-${pack._id}`;

  return (
    <article className={`lp-card lp-pack ${featured ? "featured" : ""}`}>
      {featured && <span className="lp-ribbon caption-3"><Crown size={12} weight="fill" /> Recommended</span>}

      <p className="lp-eyebrow caption-3">{lifetime ? "Lifetime pack" : "All Books pack"}</p>
      <h3 className="heading-5">{pack.title}</h3>
      {pack.subtitle && <p className="lp-pack-sub body-6">{pack.subtitle}</p>}

      <div className="lp-price">
        <b className="heading-2 lp-num">{inr(pack.price)}</b>
        {pack.mrp > pack.price && <s className="body-3 lp-num">{inr(pack.mrp)}</s>}
        <span className="caption-2">one payment</span>
      </div>
      {save > 0 && <p className="lp-pack-save caption-1">You keep {inr(save)} compared with buying one by one</p>}
      {featured && lifetime && <p className="lp-pack-why body-5"><InfinityIcon size={18} weight="bold" /> <span>Why we recommend it: every book we publish after today is yours at no extra cost.</span></p>}

      <ul className="lp-feats">
        {packFeatures(pack).map(({ icon: Icon, text, strong }) => (
          <li key={text} className={strong ? "body-4" : "body-6"}>
            <Icon size={18} weight={strong ? "fill" : "regular"} /> <span>{text}</span>
          </li>
        ))}
      </ul>

      {included.length > 0 && (
        <div className={`lp-inside ${open ? "open" : ""}`}>
          <button type="button" className="lp-inside-btn body-4" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={panelId}>
            <span><BookOpen size={18} /> {open ? "Hide" : "See"} all {included.length} {bookWord(included.length)} inside</span>
            <CaretDown size={16} weight="bold" className="lp-caret" />
          </button>
          {open && (
            <motion.ul id={panelId} className="lp-inside-list" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
              {included.map((b) => (
                <li key={b._id} className="caption-1">
                  <span className="lp-thumb">{b.coverPageUrl ? <img src={b.coverPageUrl} alt="" loading="lazy" /> : <BookOpen size={12} />}</span>
                  <span>{b.title}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      )}

      <div className="lp-pack-foot">
        <button type="button" className={`lp-btn lp-btn-lg button-md ${featured ? "lp-btn-primary" : "lp-btn-ghost"}`} onClick={() => onBuy(pack)}>
          Get {lifetime ? "Lifetime" : "all books"} for {inr(pack.price)} <ArrowRight size={18} weight="bold" className="lp-arr" />
        </button>
        <p className="caption-5"><LockKey size={12} /> Secure checkout. PDFs sent to your email.</p>
      </div>
    </article>
  );
}

/* =====================================================
   LIBRARY: every book in the pack, searchable.
===================================================== */

const LIBRARY_FIRST = 10;

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
      <div className="lp-error">
        <p className="body-5">The first books are on their way. Check back soon.</p>
        <Link className="lp-btn lp-btn-ghost button-md" to="/books">Go to the books page <ArrowRight size={18} className="lp-arr" /></Link>
      </div>
    );
  }

  const filtering = q.trim() !== "" || cat !== "All";
  const shown = all || filtering ? matched : matched.slice(0, LIBRARY_FIRST);
  const hidden = matched.length - shown.length;

  return (
    <>
      <Reveal className="lp-filter" delay={0.05}>
        <label className="lp-search">
          <MagnifyingGlass size={18} />
          <input className="body-6" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search books and topics" aria-label="Search books" />
        </label>
        {cats.length > 2 && (
          <div className="lp-cats" role="group" aria-label="Filter by category">
            {cats.map((c) => (
              <button key={c} type="button" aria-pressed={cat === c} className={`caption-1 ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>
        )}
      </Reveal>

      <div className="lp-books">
        {shown.map((b, i) => (
          <motion.div
            key={b._id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-32px" }}
            transition={{ duration: 0.6, ease: EASE, delay: (i % 5) * 0.06 }}
          >
            <Link to={b.redirectUrl || "/books"} className="lp-book">
              <span className="lp-cover">
                {b.coverPageUrl ? <img src={b.coverPageUrl} alt={`Cover of ${b.title}`} loading="lazy" /> : <BookOpen size={32} />}
                <span className="lp-included caption-3"><Check size={12} weight="bold" /> Included</span>
              </span>
              <span className="lp-book-body">
                {b.category && <span className="lp-book-cat caption-4">{b.category}</span>}
                <span className="lp-book-title title-4">{b.title}</span>
                <span className="lp-book-price caption-2">
                  {Number(b.price) > 0 && <s className="lp-num">{inr(b.price)}</s>}
                  <span>View book <ArrowUpRight size={12} weight="bold" /></span>
                </span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      {hidden > 0 && (
        <div className="lp-more">
          <button type="button" className="lp-btn lp-btn-ghost button-md" onClick={() => setAll(true)}>
            Show all {matched.length} {bookWord(matched.length)} <CaretDown size={16} weight="bold" />
          </button>
        </div>
      )}

      {matched.length === 0 && (
        <div className="lp-error">
          <p className="body-5">No book matches that search.</p>
          <button type="button" className="lp-btn lp-btn-ghost button-md" onClick={() => { setQ(""); setCat("All"); }}>Clear search</button>
        </div>
      )}
    </>
  );
}

/* =====================================================
   LIFETIME GIFT: one free Memories page.
===================================================== */

function MemoriesGift({ pack, onBuy }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <section className="lp-sec lp-mem" id="memories">
      {/* hearts drifting up behind the content */}
      <div className="lp-hearts" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => (
          <Heart key={i} weight="fill" size={16 + (i % 3) * 8} style={{ left: `${4 + i * 10}%`, animationDelay: `${i * 0.9}s`, animationDuration: `${9 + (i % 4) * 2}s` }} />
        ))}
      </div>

      <div className="lp-wrap">
        <div className="lp-split">
          <div>
            <Reveal as="p" className="lp-mem-pill caption-1"><Gift size={16} weight="fill" /> Free with Lifetime</Reveal>
            <SectionHead
              title="A free Memories page, for someone who stood by you"
              lead="Interview prep is serious, and the people around you carry it too. Every Lifetime pack includes 1 Memories page: a personal page with your photos and words, shared as a private link."
            />
            <motion.ul className="lp-ticks" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-64px" }}>
              {[
                "Your unique code is emailed after purchase",
                "Works on any template and look",
                "Shared as a private link that opens on any phone",
              ].map((t) => (
                <motion.li key={t} className="body-5" variants={staggerItem}><Heart size={20} weight="fill" /> {t}</motion.li>
              ))}
            </motion.ul>

            <Reveal className="lp-row" delay={0.1}>
              <button type="button" className="lp-btn lp-btn-lg lp-btn-primary button-md" onClick={onBuy}>
                Get Lifetime for {inr(pack.price)} <ArrowRight size={18} weight="bold" className="lp-arr" />
              </button>
              <Link className="lp-link body-4" to={MEMORIES_REDEEM}><Key size={16} /> Already have a code? Redeem it</Link>
            </Reveal>
          </div>

          {/* flip card: the email, then the code */}
          <Reveal className="lp-flip-wrap" delay={0.1}>
            <motion.button
              type="button"
              className="lp-flip"
              onClick={() => setFlipped((v) => !v)}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              aria-pressed={flipped}
              aria-label={flipped ? "Show the front of the gift card" : "Open the gift card"}
            >
              <span className="lp-flip-face front">
                <span className="lp-flip-ico"><EnvelopeSimple size={40} weight="duotone" /></span>
                <b className="title-1">Your Lifetime email</b>
                <span className="body-6">Books, and one more thing inside</span>
                <span className="lp-flip-hint caption-3"><HandTap size={16} weight="fill" /> Tap to open</span>
              </span>
              <span className="lp-flip-face back">
                <span className="lp-flip-ico"><Heart size={40} weight="fill" /></span>
                <b className="title-1">Memories code</b>
                <span className="lp-code heading-5" aria-hidden="true">•••• ••••</span>
                <span className="body-6">Your own unique code arrives by email. Redeem it on Memories and the page is yours.</span>
              </span>
            </motion.button>
          </Reveal>
        </div>

        {/* templates */}
        <Reveal as="p" className="lp-tpl-head title-2">Pick any template for your free page</Reveal>
        <motion.div className="lp-tpls" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-64px" }}>
          {MEMORY_TEMPLATES.map(({ icon: Icon, name, text, demo }) => (
            <motion.div key={name} variants={staggerItem}>
              <Link to={demo} target="_blank" rel="noopener" className="lp-tpl">
                <span className="lp-tpl-ico"><Icon size={24} weight="duotone" /></span>
                <b className="title-3">{name}</b>
                <span className="body-6">{text}</span>
                <span className="lp-tpl-go caption-3">Live preview <ArrowUpRight size={12} weight="bold" /></span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* =====================================================
   FAQ: one open at a time. The panel fades and settles; nothing animates height.
===================================================== */

function Faq({ items }) {
  const [open, setOpen] = useState(0);
  return (
    <div className="lp-faq">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <Reveal key={f.q} className={`lp-faq-item ${isOpen ? "open" : ""}`} delay={Math.min(i, 6) * 0.04}>
            <h3>
              <button type="button" className="title-3" onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} aria-controls={`lp-faq-${i}`}>
                <span>{f.q}</span>
                <CaretDown size={18} weight="bold" className="lp-caret" />
              </button>
            </h3>
            {isOpen && (
              <motion.p id={`lp-faq-${i}`} className="body-3" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                {f.a}
              </motion.p>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

/* =====================================================
   STYLES
   Scoped under .lp. Colours switch with data-theme (light or dark).
   Flat backgrounds only. Type sizes sit on the Tailwind scale, spacing on
   2 4 8 12 16 24 32 40 48 64 80 96, and every transition uses one curve.
===================================================== */

const PAGE_CSS = `
.lp{
  --bg:#FFFFFF;--bg2:#FAFAF9;--card:#FFFFFF;--card2:#F5F5F4;
  --ink:#0A0A0A;--mut:#57534E;--faint:#78716C;--line:#E7E5E4;
  --acc:#F97316;--acc-hover:#FB923C;--acc-ink:#C2410C;--acc-soft:#FFF4EA;--acc-line:#FED7AA;--btn-fg:#1C0A00;
  --ok:#15803D;--rose:#BE123C;
  --inv-bg:#0A0A0A;--inv-card:#1F1F1F;--inv-mut:#B5B0AB;
  --glass:rgba(255,255,255,.84);
  --shadow:0 24px 48px rgba(28,25,23,.12);--shadow-sm:0 8px 24px rgba(28,25,23,.06);
  --h1a:#000000;--h1b:#666666;
  --curve:cubic-bezier(.22,1,.36,1);
  background:var(--bg);color:var(--ink);
  font-family:"Manrope",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  font-style:normal;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;
  min-height:100vh;overflow-x:hidden;overflow-x:clip;
}
.lp[data-theme="dark"]{
  --bg:#000000;--bg2:#131209;--card:#181818;--card2:#1F1F1F;
  --ink:#FFFFFF;--mut:#B5B0AB;--faint:#8F8A85;--line:#313131;
  --acc-ink:#FB923C;--acc-soft:#272727;--acc-line:#313131;
  --ok:#4ADE80;--rose:#FB7185;
  --inv-bg:#181818;--inv-card:#272727;
  --glass:rgba(24,24,24,.84);
  --shadow:0 24px 48px rgba(0,0,0,.6);--shadow-sm:0 8px 24px rgba(0,0,0,.4);
  --h1a:#FFFFFF;--h1b:#9B9B9B;
}
.lp.mt-16{margin-top:4rem}
.lp *,.lp *::before,.lp *::after{box-sizing:border-box}
.lp :where(h1,h2,h3,p,ul,ol,dl,dt,dd){margin:0;padding:0}
.lp :where(ul,ol){list-style:none}
.lp :where(a){color:inherit;text-decoration:none}
.lp :where(button){font-family:inherit;color:inherit}
.lp :where(em,i,s){font-style:normal}
.lp :where(img){display:block;max-width:100%}
.lp :where(svg){flex:none}
.lp .sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.lp-num{font-variant-numeric:tabular-nums}
.lp-ok{color:var(--ok)}

/* ---------- named text styles ---------- */
.lp .heading-1{font-size:36px;line-height:40px;font-weight:600;letter-spacing:-.02em;text-wrap:balance}
.lp .heading-2{font-size:30px;line-height:36px;font-weight:600;letter-spacing:-.02em;text-wrap:balance}
.lp .heading-3{font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.01em;text-wrap:balance}
.lp .heading-5{font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.01em}
.lp .heading-6{font-size:20px;line-height:28px;font-weight:600}
.lp .title-1{font-size:20px;line-height:28px;font-weight:500}
.lp .title-2{font-size:18px;line-height:28px;font-weight:500}
.lp .title-3{font-size:16px;line-height:24px;font-weight:500}
.lp .title-4{font-size:14px;line-height:20px;font-weight:500}
.lp .body-3{font-size:16px;line-height:24px;font-weight:400;text-wrap:pretty}
.lp .body-4{font-size:14px;line-height:20px;font-weight:600}
.lp .body-5{font-size:14px;line-height:20px;font-weight:500;text-wrap:pretty}
.lp .body-6{font-size:14px;line-height:20px;font-weight:400;text-wrap:pretty}
.lp .button-lg{font-size:18px;line-height:28px;font-weight:600}
.lp .button-md{font-size:16px;line-height:24px;font-weight:600}
.lp .caption-1{font-size:14px;line-height:20px;font-weight:500}
.lp .caption-2{font-size:14px;line-height:20px;font-weight:400}
.lp .caption-3{font-size:12px;line-height:16px;font-weight:600}
.lp .caption-4{font-size:12px;line-height:16px;font-weight:500}
.lp .caption-5{font-size:12px;line-height:16px;font-weight:400}
@media (min-width:640px){
  .lp .heading-1{font-size:48px;line-height:48px}
  .lp .heading-2{font-size:36px;line-height:40px}
  .lp .heading-3{font-size:30px;line-height:36px}
}
@media (min-width:1024px){
  .lp .heading-2{font-size:48px;line-height:48px}
  .lp .heading-3{font-size:36px;line-height:40px}
}
@media (min-width:1280px){
  .lp .heading-1{font-size:60px;line-height:60px}
}

/* ---------- layout ---------- */
.lp-wrap{width:100%;max-width:1152px;margin:0 auto;padding:0 16px}
.lp-narrow{max-width:800px}
.lp-sec{padding:64px 0;scroll-margin-top:64px}
.lp-alt{background:var(--bg2)}
.lp-head{margin-bottom:40px;max-width:680px}
.lp-head.center{margin-left:auto;margin-right:auto;text-align:center}
.lp-eyebrow{color:var(--acc-ink);text-transform:uppercase;letter-spacing:.08em;margin-bottom:12px}
.lp-lead{color:var(--mut);margin-top:16px}
.lp-split{display:grid;gap:48px;align-items:center}
.lp-row{display:flex;flex-wrap:wrap;align-items:center;gap:16px 24px;margin-top:32px}
@media (min-width:640px){.lp-wrap{padding:0 24px}}
@media (min-width:768px){.lp-sec{padding:96px 0}.lp-head{margin-bottom:48px}}
@media (min-width:960px){.lp-split{grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:64px}}

.lp-card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:24px}
.lp-ico{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:var(--acc-soft);color:var(--acc-ink);border:1px solid var(--acc-line)}
.lp-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:9999px;background:var(--acc-soft);color:var(--acc-ink);border:1px solid var(--acc-line)}
.lp-link{display:inline-flex;align-items:center;gap:8px;color:var(--acc-ink);border-radius:4px;transition:opacity .3s var(--curve)}
.lp-link:hover{opacity:.8}
.lp-link:hover .lp-arr{transform:translateX(4px)}
.lp a:focus-visible,.lp button:focus-visible,.lp input:focus-visible{outline:2px solid var(--acc);outline-offset:2px}

/* ---------- buttons ---------- */
.lp-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:8px 12px;border-radius:8px;border:1px solid transparent;cursor:pointer;text-align:center;
  transition:transform .5s var(--curve),background-color .3s var(--curve),border-color .3s var(--curve),opacity .3s var(--curve)}
.lp-btn-lg{padding:12px 24px;border-radius:12px;min-height:48px}
.lp-btn:hover{transform:translateY(-2px)}
.lp-btn:active{transform:scale(.98)}
.lp-btn-primary{background:var(--acc);color:var(--btn-fg);box-shadow:0 8px 24px rgba(249,115,22,.28)}
.lp-btn-primary:hover{background:var(--acc-hover)}
.lp-btn-ghost{background:var(--card);color:var(--ink);border-color:var(--line)}
.lp-btn-ghost:hover{border-color:var(--acc)}
.lp-arr{transition:transform .5s var(--curve)}
.lp-btn:hover .lp-arr{transform:translateX(4px)}
/* a ring that breathes around the main hero button (transform and opacity only) */
.lp-btn-pulse::after{content:"";position:absolute;inset:0;border-radius:inherit;border:2px solid var(--acc);opacity:0;pointer-events:none;animation:lp-ring 2.8s var(--curve) infinite}
@keyframes lp-ring{0%{transform:scale(1);opacity:.6}70%,100%{transform:scale(1.12,1.4);opacity:0}}

/* ---------- skeletons ---------- */
.lp-skel{display:block;height:16px;width:100%;border-radius:8px;background:var(--card2);animation:lp-pulse 1.2s cubic-bezier(.45,0,.55,1) infinite alternate}
.lp[data-theme="dark"] .lp-skel{background:#272727}
.lp-skel-btn{height:52px;width:280px;max-width:100%;border-radius:12px}
.lp-skel-proof{height:52px;width:320px;max-width:100%}
.lp-skel-book{height:auto;aspect-ratio:3/5;border-radius:16px}
@keyframes lp-pulse{from{opacity:1}to{opacity:.45}}

/* ---------- scroll progress ---------- */
.lp-progress{position:fixed;top:0;left:0;right:0;height:4px;background:var(--acc);transform-origin:0 50%;z-index:60}

/* ---------- hero ---------- */
.lp-hero{position:relative;padding:64px 0 64px;overflow:hidden}
.lp-hero-grid{display:grid;gap:48px;align-items:center}
.lp-hero-copy{min-width:0}
.lp-pill{display:inline-flex;flex-wrap:wrap;align-items:center;gap:8px;padding:4px 12px;border-radius:9999px;background:var(--acc-soft);border:1px solid var(--acc-line);color:var(--acc-ink)}
.lp-pill-dot{width:4px;height:4px;border-radius:9999px;background:currentColor;opacity:.5}
.lp-h1{max-width:680px;margin-top:24px}
.lp-h1-line{display:block;padding-bottom:4px;background-image:linear-gradient(90deg,var(--h1a),var(--h1b));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
.lp-hero-sub{max-width:680px;margin-top:24px;color:var(--mut);text-wrap:pretty}
.lp-hero-cta{margin-top:32px;display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.lp-hero-safe{display:flex;align-items:flex-start;gap:8px;color:var(--faint);max-width:480px}
.lp-hero-safe svg{margin-top:2px}
.lp-proof{margin-top:32px;min-height:52px}
.lp-proof dl{display:flex;flex-wrap:wrap;gap:16px 24px}
.lp-proof dd{color:var(--mut)}
.lp-fan-wrap{min-width:0}
.lp-fan{--cw:96px;position:relative;display:flex;justify-content:center;align-items:center;padding:48px 0 64px}
.lp-fan-panel{position:absolute;inset:24px 0;border-radius:24px;background:var(--bg2);border:1px solid var(--line)}
.lp-fan-card{position:relative;width:var(--cw);flex:none;margin-left:calc(var(--cw) * -.36)}
.lp-fan-card:first-of-type{margin-left:0}
.lp-fan-float{aspect-ratio:3/4;border-radius:8px;overflow:hidden;background:var(--card2);border:1px solid var(--line);box-shadow:var(--shadow)}
.lp-fan-float img{width:100%;height:100%;object-fit:cover}
.lp-fan-ph{display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:var(--faint)}
.lp-tag{position:absolute;z-index:20;display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:12px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow-sm)}
.lp-tag-price{left:8px;bottom:8px}
.lp-tag-price s{color:var(--faint)}
.lp-tag-future{right:8px;top:8px;color:var(--acc-ink)}
@media (min-width:640px){.lp-fan{--cw:144px}.lp-hero{padding:64px 0 80px}.lp-tag-price{left:24px}.lp-tag-future{right:24px}}
@media (min-width:1024px){
  .lp-hero-grid{grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);gap:48px}
  .lp-fan{--cw:128px}
  .lp-tag-price{left:-8px}.lp-tag-future{right:-8px}
}
@media (min-width:1280px){.lp-fan{--cw:148px}}

/* ---------- the maths ---------- */
.lp-maths{display:grid;gap:32px;align-items:center}
.lp-bars{display:grid;gap:24px}
.lp-bar-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 16px;align-items:baseline}
.lp-bar-label{color:var(--mut)}
.lp-bar-track{grid-column:1 / -1;height:16px;border-radius:9999px;background:var(--card2);overflow:hidden}
.lp[data-theme="dark"] .lp-bar-track{background:#1F1F1F}
.lp-bar-clip{height:100%;border-radius:9999px;overflow:hidden}
.lp-bar{display:block;width:100%;height:100%;border-radius:9999px}
.lp-bar.muted{background:var(--faint)}
.lp-bar.warm{background:var(--acc-hover)}
.lp-bar.hot{background:var(--acc)}
.lp-keep{background:var(--bg2);border:1px solid var(--line);border-radius:24px;padding:32px;display:flex;flex-direction:column;align-items:flex-start;gap:12px;box-shadow:var(--shadow-sm)}
.lp-keep > p:first-child{color:var(--mut)}
.lp-keep-num{color:var(--ok)}
.lp-keep .body-6{color:var(--mut)}
.lp-keep .lp-btn{margin-top:12px}
@media (min-width:960px){.lp-maths{grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr);gap:64px}}

/* ---------- benefits ---------- */
.lp-benefits,.lp-trust{display:grid;gap:16px}
.lp-benefit,.lp-trust-item{display:flex;flex-direction:column;gap:12px;height:100%;transition:transform .5s var(--curve),border-color .3s var(--curve)}
.lp-benefit:hover,.lp-trust-item:hover{transform:translateY(-4px);border-color:var(--acc)}
.lp-benefit-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:4px}
.lp-benefit p,.lp-trust-item p{color:var(--mut)}
.lp-trust-item .lp-ico{margin-bottom:4px}
.lp-trust-item .lp-link{margin-top:auto;padding-top:4px}
@media (min-width:640px){.lp-benefits,.lp-trust{grid-template-columns:repeat(2,minmax(0,1fr));gap:24px}}
@media (min-width:1024px){
  .lp-benefits,.lp-trust{grid-template-columns:repeat(3,minmax(0,1fr))}
  .lp-benefits.r1 > :first-child,.lp-benefits.r1 > :last-child,.lp-benefits.r2 > :first-child{grid-column:span 2}
}
.lp-sum{display:grid;gap:16px}
.lp-sum .lp-card{display:flex;flex-direction:column;gap:8px}
.lp-sum .caption-1,.lp-sum .body-6{color:var(--mut)}
.lp-sum-hot{border:2px solid var(--acc)}
@media (min-width:768px){.lp-sum{grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}}

/* ---------- tagline reveal ---------- */
.lp-tagline{padding:96px 0}
.lp-tagline-text{max-width:680px;margin:0 auto;text-align:center}
.lp-tagline-line{display:block}
.lp-word{opacity:.28;transition:opacity .7s var(--curve)}
.lp-word.on{opacity:1}
@media (min-width:768px){.lp-tagline{padding:96px 0}}

/* ---------- library ---------- */
.lp-filter{display:flex;flex-wrap:wrap;align-items:center;gap:16px;margin-bottom:32px}
.lp-search{display:flex;align-items:center;gap:8px;flex:1 1 240px;max-width:400px;padding:8px 12px;border-radius:12px;background:var(--card);border:1px solid var(--line);color:var(--faint);transition:border-color .3s var(--curve)}
.lp-search:focus-within{border-color:var(--acc)}
.lp-search input{flex:1;min-width:0;border:0;background:transparent;color:var(--ink);font-family:inherit;padding:4px 0}
.lp-search input::placeholder{color:var(--faint)}
.lp-search input:focus-visible{outline:none}
.lp-cats{display:flex;flex-wrap:wrap;gap:8px}
.lp-cats button{padding:8px 12px;border-radius:9999px;border:1px solid var(--line);background:var(--card);color:var(--mut);cursor:pointer;transition:background-color .3s var(--curve),border-color .3s var(--curve),color .3s var(--curve)}
.lp-cats button:hover{border-color:var(--acc)}
.lp-cats button.on{background:var(--ink);border-color:var(--ink);color:var(--bg)}
.lp-books{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.lp-book{display:flex;flex-direction:column;height:100%;padding:8px;border-radius:16px;background:var(--card);border:1px solid var(--line);transition:transform .5s var(--curve),border-color .3s var(--curve)}
.lp-book:hover{transform:translateY(-4px);border-color:var(--acc)}
.lp-cover{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:3/4;border-radius:8px;overflow:hidden;background:var(--card2);color:var(--faint)}
.lp-cover img{width:100%;height:100%;object-fit:cover;transition:transform .5s var(--curve)}
.lp-book:hover .lp-cover img{transform:scale(1.04)}
.lp-included{position:absolute;left:8px;top:8px;display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border-radius:9999px;background:#0A0A0A;color:#FFFFFF}
.lp-book-body{display:flex;flex-direction:column;gap:4px;padding:12px 4px 4px;flex:1}
.lp-book-cat{color:var(--acc-ink);text-transform:uppercase;letter-spacing:.06em}
.lp-book-title{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.lp-book-price{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:4px 8px;margin-top:auto;padding-top:8px;color:var(--mut)}
.lp-book-price s{color:var(--faint)}
.lp-book-price > span{display:inline-flex;align-items:center;gap:4px;color:var(--acc-ink);font-weight:600}
.lp-more{display:flex;justify-content:center;margin-top:32px}
@media (min-width:640px){.lp-books{grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}}
@media (min-width:900px){.lp-books{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (min-width:1152px){.lp-books{grid-template-columns:repeat(5,minmax(0,1fr))}}

/* ---------- empty and error states ---------- */
.lp-error{display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;padding:32px 24px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--mut)}

/* ---------- pricing ---------- */
.lp-packs{display:grid;gap:32px;align-items:stretch;padding-top:12px}
.lp-packs.one{max-width:520px;margin:0 auto}
.lp-pack-slot{height:100%}
.lp-pack-slot.first{order:-1}
.lp-pack{position:relative;display:flex;flex-direction:column;height:100%;padding:32px 24px 24px;transition:transform .5s var(--curve)}
.lp-pack:hover{transform:translateY(-4px)}
.lp-pack.featured{border:2px solid var(--acc);box-shadow:var(--shadow)}
.lp-pack .lp-eyebrow{margin-bottom:8px}
.lp-ribbon{position:absolute;top:-12px;left:24px;display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:9999px;background:var(--acc);color:var(--btn-fg)}
.lp-pack-sub{color:var(--mut);margin-top:4px}
.lp-price{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px;margin-top:24px}
.lp-price s,.lp-price span{color:var(--faint)}
.lp-pack-save{color:var(--ok);margin-top:8px}
.lp-pack-why{display:flex;align-items:flex-start;gap:8px;margin-top:16px;padding:12px;border-radius:12px;background:var(--acc-soft);border:1px solid var(--acc-line)}
.lp-pack-why svg{color:var(--acc-ink);margin-top:1px}
.lp-th-rec{display:inline-flex!important;align-items:center;gap:4px;margin-bottom:8px;padding:4px 8px;border-radius:9999px;background:var(--acc);color:var(--btn-fg)}
.lp-feats{display:grid;gap:12px;margin:24px 0}
.lp-feats li{display:flex;align-items:flex-start;gap:12px}
.lp-feats li svg{margin-top:1px;color:var(--acc-ink)}
.lp-feats li.body-6{color:var(--mut)}
.lp-inside{margin-bottom:24px}
.lp-inside-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 16px;border-radius:12px;border:1px solid var(--line);background:var(--bg2);cursor:pointer;transition:border-color .3s var(--curve)}
.lp-inside-btn:hover{border-color:var(--acc)}
.lp-inside-btn > span{display:inline-flex;align-items:center;gap:8px;text-align:left}
.lp-caret{transition:transform .5s var(--curve)}
.lp-inside.open .lp-caret,.lp-faq-item.open .lp-caret{transform:rotate(180deg)}
.lp-inside-list{display:grid;gap:8px;margin-top:12px;max-height:280px;overflow-y:auto;padding-right:4px}
.lp-inside-list li{display:flex;align-items:center;gap:12px;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--bg2)}
.lp-thumb{flex:none;display:flex;align-items:center;justify-content:center;width:24px;height:32px;border-radius:4px;overflow:hidden;background:var(--card2);color:var(--faint)}
.lp-thumb img{width:100%;height:100%;object-fit:cover}
.lp-pack-foot{margin-top:auto;display:grid;gap:12px}
.lp-pack-foot .lp-btn{width:100%}
.lp-pack-foot p{display:flex;align-items:center;justify-content:center;gap:4px;color:var(--faint);text-align:center}
.lp-pack-skel{display:grid;gap:16px;align-content:start;min-height:400px}
.lp-extra{display:flex;align-items:flex-start;justify-content:center;gap:8px;margin-top:32px;color:var(--mut);text-align:center}
.lp-extra svg{color:var(--acc);margin-top:1px}
@media (min-width:860px){.lp-pack-slot.first{order:0}.lp-pack.featured{transform:scale(1.02)}.lp-pack.featured:hover{transform:scale(1.02) translateY(-4px)}.lp-packs{grid-template-columns:repeat(2,minmax(0,1fr))}.lp-packs.one{grid-template-columns:1fr}.lp-pack{padding:40px 32px 32px}.lp-ribbon{left:32px}}

.lp-table-wrap{margin-top:48px;border-radius:16px;border:1px solid var(--line);background:var(--card);overflow-x:auto;-webkit-overflow-scrolling:touch}
.lp-table{width:100%;border-collapse:collapse;text-align:center}
.lp-table th,.lp-table td{padding:12px 8px;border-bottom:1px solid var(--line);vertical-align:middle}
.lp-table tbody th{padding-left:16px;width:40%}
.lp-table .lp-col-other{display:none}
@media (min-width:640px){
  .lp-table{min-width:560px}
  .lp-table th,.lp-table td{padding:12px 16px}
  .lp-table .lp-col-other{display:table-cell}
}
.lp-table tbody tr:last-child th,.lp-table tbody tr:last-child td{border-bottom:0}
.lp-table thead th{padding:16px 8px;vertical-align:bottom}
.lp-table thead th > span,.lp-table thead small{display:block}
.lp-table thead th > .lp-th-rec{width:-moz-fit-content;width:fit-content;margin-left:auto;margin-right:auto}
.lp-table small{color:var(--faint);display:block}
.lp-table tbody th{text-align:left;color:var(--ink);font-weight:500}
.lp-table .hl{background:var(--acc-soft)}
.lp-table td svg{display:inline-block}
.lp-table .yes{color:var(--ok)}
.lp-table .no{color:var(--faint);opacity:.6}
.lp-table td span{color:var(--mut)}

/* ---------- how it works ---------- */
.lp-steps{position:relative}
.lp-steps ol{display:grid;gap:32px}
.lp-steps li{position:relative;display:flex;gap:16px;align-items:flex-start}
.lp-step-n{flex:none;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9999px;background:var(--acc);color:var(--btn-fg);position:relative;z-index:1}
.lp-step-n.sm{width:32px;height:32px}
.lp-step-body h3{display:flex;align-items:center;gap:8px}
.lp-step-body h3 svg{color:var(--acc-ink)}
.lp-step-body p{color:var(--mut);margin-top:8px}
.lp-steps-line{display:none}
@media (min-width:900px){
  .lp-steps ol{grid-template-columns:repeat(var(--n),minmax(0,1fr));gap:32px}
  .lp-steps li{flex-direction:column;gap:24px}
  .lp-steps-line{display:block;position:absolute;top:20px;left:20px;right:calc(100% / var(--n) - 20px);height:2px;margin-top:-1px;background:var(--line);overflow:hidden}
  .lp-steps-line span{display:block;width:100%;height:100%;background:var(--acc);transform-origin:0 50%}
}

/* ---------- memories gift ---------- */
.lp-ticks{display:grid;gap:12px}
.lp-ticks li{display:flex;align-items:flex-start;gap:12px}
.lp-ticks svg{color:var(--ok)}
/* light pink band: the accent tokens turn rose inside it, so every shared part follows */
.lp-mem{position:relative;overflow:hidden;background:#FFF1F2;--acc:#E11D48;--acc-hover:#F43F5E;--acc-ink:#BE123C;--acc-soft:#FFE4E6;--acc-line:#FECDD3;--btn-fg:#FFFFFF;--line:#FECDD3;--mut:#5F4B50;--ok:#E11D48}
.lp[data-theme="dark"] .lp-mem{background:#1F1217;--acc:#FB7185;--acc-hover:#FDA4AF;--acc-ink:#FDA4AF;--acc-soft:#33161F;--acc-line:#4C1D2B;--btn-fg:#1F0A10;--line:#4C1D2B;--mut:#CDB9BE;--ok:#FB7185;--card:#28161C}
.lp-mem .lp-wrap{position:relative;z-index:1}
.lp-mem .lp-btn-primary{box-shadow:0 8px 24px rgba(225,29,72,.28)}
.lp-mem-pill{display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;padding:4px 12px;border-radius:9999px;background:var(--acc);color:var(--btn-fg)}
.lp-hearts{position:absolute;inset:0;pointer-events:none}
.lp-hearts svg{position:absolute;bottom:-48px;color:var(--acc);opacity:0;animation-name:lp-rise;animation-timing-function:cubic-bezier(.45,0,.55,1);animation-iteration-count:infinite}
@keyframes lp-rise{0%{transform:translateY(0) rotate(-8deg);opacity:0}15%{opacity:.22}100%{transform:translateY(-880px) rotate(12deg);opacity:0}}
.lp-tpl-head{margin-top:64px;margin-bottom:24px}
.lp-tpls{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.lp-tpl{display:flex;flex-direction:column;gap:8px;height:100%;padding:16px;border-radius:16px;border:1px solid var(--line);background:var(--card);transition:transform .5s var(--curve),border-color .3s var(--curve)}
.lp-tpl:hover{transform:translateY(-4px);border-color:var(--acc)}
.lp-tpl .body-6{color:var(--mut)}
.lp-tpl-ico{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:var(--acc-soft);border:1px solid var(--acc-line);color:var(--acc-ink);margin-bottom:4px;transition:transform .5s var(--curve)}
.lp-tpl:hover .lp-tpl-ico{transform:scale(1.08) rotate(-6deg)}
.lp-tpl-go{display:inline-flex;align-items:center;gap:4px;margin-top:auto;padding-top:8px;color:var(--acc-ink)}
@media (min-width:640px){.lp-tpls{grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.lp-tpl{padding:24px}}
@media (min-width:1024px){.lp-tpls{grid-template-columns:repeat(6,minmax(0,1fr));gap:16px}.lp-tpl{padding:16px}}
.lp-flip-wrap{perspective:1200px;-webkit-perspective:1200px;width:100%;max-width:400px;margin:0 auto}
.lp-flip{position:relative;display:block;width:100%;aspect-ratio:4/5;padding:0;border:0;background:transparent;cursor:pointer;border-radius:24px;transform-style:preserve-3d;-webkit-transform-style:preserve-3d}
.lp-flip-face{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:32px;border-radius:24px;border:1px solid var(--line);background:var(--card);box-shadow:var(--shadow);text-align:center;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.lp-flip-face .body-6{color:var(--mut)}
.lp-flip-face.back{transform:rotateY(180deg);border:2px solid var(--acc)}
.lp-flip-ico{display:inline-flex;align-items:center;justify-content:center;width:80px;height:80px;border-radius:24px;background:var(--acc-soft);border:1px solid var(--acc-line);color:var(--acc-ink);margin-bottom:12px}
.lp-flip-face.back .lp-flip-ico{color:var(--acc);animation:lp-beat 1.6s var(--curve) infinite}
.lp-flip-hint{display:inline-flex;align-items:center;gap:8px;margin-top:12px;padding:8px 12px;border-radius:9999px;background:var(--acc);color:var(--btn-fg);animation:lp-beat 1.6s var(--curve) infinite}
.lp-code{padding:8px 24px;border-radius:12px;border:1px dashed var(--acc);color:var(--acc-ink);letter-spacing:.2em}
@keyframes lp-beat{0%,100%{transform:scale(1)}40%{transform:scale(1.08)}}

/* ---------- prep arena ---------- */
.lp-flow{display:grid;gap:24px;margin-bottom:32px}
.lp-flow li{display:flex;gap:16px;align-items:flex-start}
.lp-flow p{color:var(--mut);margin-top:4px}
.lp-credits{display:flex;flex-direction:column;gap:16px;padding:32px;border-radius:24px;box-shadow:var(--shadow-sm)}
.lp-credits > p:first-child,.lp-credits .body-6{color:var(--mut)}
.lp-dots{display:flex;flex-wrap:wrap;gap:8px}
.lp-dots i{width:16px;height:16px;border-radius:9999px;background:var(--acc)}

/* ---------- faq ---------- */
.lp-faq{display:grid;gap:12px}
.lp-faq-item{border-radius:12px;border:1px solid var(--line);background:var(--card);transition:border-color .3s var(--curve)}
.lp-faq-item.open,.lp-faq-item:hover{border-color:var(--acc)}
.lp-faq-item h3{font-size:inherit;font-weight:inherit}
.lp-faq-item button{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px;border:0;background:transparent;text-align:left;cursor:pointer;border-radius:12px}
.lp-faq-item .lp-caret{color:var(--faint)}
.lp-faq-item p{padding:0 16px 16px;color:var(--mut)}
.lp-faq-more{margin-top:24px;text-align:center;color:var(--mut)}
.lp-faq-more a{color:var(--acc-ink);font-weight:600;word-break:break-word}

/* ---------- final call to action ---------- */
.lp-final{background:var(--inv-bg);color:#FFFFFF;padding:80px 0 96px;text-align:center}
.lp-final-in{display:flex;flex-direction:column;align-items:center;gap:24px}
.lp-final-ico{display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:16px;background:var(--inv-card);color:var(--acc)}
.lp-final h2{max-width:680px}
.lp-final .title-2{max-width:680px;color:var(--inv-mut);text-wrap:pretty}
.lp-final .lp-skel{background:var(--inv-card)}
.lp-final-ticks{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 24px;color:var(--inv-mut)}
.lp-final-ticks li{display:inline-flex;align-items:center;gap:8px}
.lp-final-ticks svg{color:var(--acc)}
.lp-final-links{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 24px;color:var(--inv-mut);margin-top:16px}
.lp-final-links a{transition:opacity .3s var(--curve);word-break:break-word}
.lp-final-links a:hover{color:#FFFFFF}

/* ---------- sticky buy bar ---------- */
.lp-sticky{position:fixed;left:16px;right:16px;bottom:16px;bottom:calc(16px + env(safe-area-inset-bottom,0px));margin:0 auto;max-width:640px;z-index:50;display:flex;align-items:center;gap:12px;padding:8px 8px 8px 16px;border-radius:16px;background:var(--glass);border:1px solid var(--line);box-shadow:var(--shadow);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px)}
.lp-sticky-covers{display:none;flex:none}
.lp-sticky-covers img{width:32px;height:40px;object-fit:cover;border-radius:4px;border:1px solid var(--line);position:relative;margin-left:-12px}
.lp-sticky-covers img:first-child{margin-left:0}
.lp-sticky-text{flex:1;min-width:0;display:flex;flex-direction:column}
.lp-sticky-text b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lp-sticky-text > span{display:flex;align-items:center;gap:8px;color:var(--mut)}
.lp-sticky-text em{color:var(--ok)}
.lp-sticky .lp-btn{flex:none;min-height:44px;padding:8px 16px}
.lp-sticky-price{display:none}
@media (min-width:520px){.lp-sticky-covers{display:flex}}
@media (min-width:640px){.lp-sticky-price{display:inline}.lp-sticky-text > span .lp-num{display:none}}

/* ---------- reduced motion: keep opacity, drop movement ---------- */
@media (prefers-reduced-motion:reduce){
  .lp *,.lp *::before,.lp *::after{animation:none!important}
  .lp-word{opacity:1!important;transition:none!important}
  .lp-btn,.lp-arr,.lp-book,.lp-benefit,.lp-trust-item,.lp-pack,.lp-tpl,.lp-tpl-ico,.lp-caret,.lp-cover img{transition-property:opacity,background-color,border-color,color!important}
  .lp-btn:hover,.lp-btn:active,.lp-book:hover,.lp-benefit:hover,.lp-trust-item:hover,.lp-pack:hover,.lp-tpl:hover{transform:none!important}
}
`;
