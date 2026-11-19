import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";

import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Article,
  BookOpen,
  Books,
  Brain,
  Briefcase,
  Broadcast,
  Cake,
  CaretLeft,
  CaretRight,
  ChatCircleText,
  Check,
  Confetti,
  Database,
  Diamond,
  Eye,
  FileText,
  GraduationCap,
  Graph,
  Handshake,
  HardDrives,
  Heart,
  HeartBreak,
  Images,
  Infinity as InfinityIcon,
  LockKey,
  Microphone,
  Package,
  PencilSimple,
  Plugs,
  Plus,
  ShieldCheck,
  Sparkle,
  Stack,
  Target,
  UsersThree,
  UserPlus,
  ChatsCircle,

  VideoCamera,
} from "@phosphor-icons/react";

import BASE_URL from "../utils/Url";
import { SAMPLE } from "../resume/landingContent";

import "./learn.css";

// =====================================================
// CONFIGURATION
// =====================================================

const SITE_URL = "https://www.targettrek.in";
// "/" and "/learn" render this same page; "/" is the canonical home URL.
const PAGE_URL = `${SITE_URL}/`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE = "Learn System Design, Java LLD & GenAI | Target Trek";

const SEO_DESCRIPTION =
  "Free system design and backend guides, interview preparation ebooks, real interview experiences, mock interviews, resume reviews and more, all in one place on Target Trek.";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap";

const EASE = [0.22, 1, 0.36, 1];

// Pack pages (recognised inside the single /book response)
const ALL_BOOKS_PATH = "/book/all-books";
const LIFETIME_PATH = "/book/life-type-combo";

// =====================================================
// CONTENT: every link below is a real route on the site
// =====================================================

const GOALS = [
  { id: "resources", label: "Learn for free", icon: GraduationCap },
  { id: "books", label: "Read a full book", icon: BookOpen },
  { id: "interview-prep", label: "Practise interviews", icon: VideoCamera },
  { id: "resume", label: "Get more calls", icon: FileText },
];

const PATH = [
  {
    step: "Step 1",
    title: "Learn the concepts",
    text: "Free guides on SQL, APIs and system design",
    to: "/resources",
    icon: GraduationCap,
  },
  {
    step: "Step 2",
    title: "Go deep with a book",
    text: "HLD, LLD, Java, Spring Boot, cloud and GenAI",
    to: "/books",
    icon: BookOpen,
  },
  {
    step: "Step 3",
    title: "Practise out loud",
    text: "Mock interviews and a practice buddy",
    to: "/mock-interviews",
    icon: VideoCamera,
  },
  {
    step: "Step 4",
    title: "Get the interview call",
    text: "AI and expert review of your resume",
    to: "/resume-review",
    icon: Target,
  },
];

// The directory: everything on Target Trek in one grid
const EXPLORE = [
  {
    title: "Free resources",
    text: "SQL, API engineering and system design guides you can read right now.",
    to: "/resources",
    icon: GraduationCap,
    free: true,
    size: "is-wide",
  },
  {
    title: "Ebooks",
    text: "Interview preparation books, packs and the lifetime library.",
    to: "/books",
    icon: Books,
    size: "is-tall is-feature",
    covers: true,
  },
  {
    title: "Interview experiences",
    text: "Real rounds, questions and results shared by engineers.",
    to: "/interviews",
    icon: Briefcase,
    free: true,
  },
  {
    title: "Mock interviews",
    text: "A 1:1 session with an engineer, with feedback.",
    to: "/mock-interviews",
    icon: VideoCamera,
  },
  {
    title: "Prep Buddy",
    text: "Find a serious partner to practise with, by mutual match.",
    to: "/prep-buddy",
    icon: Handshake,
  },
  {
    title: "Resume Review",
    text: "An AI report in minutes, then a working professional's notes.",
    to: "/resume-review",
    icon: FileText,
  },
  {
    title: "Referrals",
    text: "Ask people who work at your dream company to refer you. Free to ask.",
    to: "/referral",
    icon: UserPlus,
    free: true,
  },
  {
    title: "Mentorship",
    text: "Placement guidance for students and early-career engineers.",
    to: "/mentorship",
    icon: UsersThree,
  },
  {
    title: "Memories",
    text: "Make a personal page for a birthday, proposal or thank you.",
    to: "/memories",
    icon: Heart,
  },
  {
    title: "Blogs",
    text: "Engineering articles on backend, system design and careers.",
    to: "/blogs",
    icon: Article,
    free: true,
    size: "is-wide",
  },
];

const CORE_RESOURCES = [
  {
    title: "SQL",
    code: "SQL",
    text: "From fundamentals to joins, subqueries, CTEs, window functions, indexes, transactions, locking, optimization and interview problems.",
    to: "/resources/sql",
    icon: Database,
    tags: ["Joins", "CTEs", "Window functions", "Indexes", "ACID"],
  },
  {
    title: "API engineering",
    code: "API",
    text: "REST and HTTP, GraphQL, authentication, pagination, idempotency, caching, rate limiting, webhooks, OpenAPI and production API design.",
    to: "/resources/apis",
    icon: Plugs,
    tags: ["REST", "GraphQL", "Auth", "Idempotency", "Webhooks"],
  },
];

const HLD_GUIDES = [
  {
    title: "Caching",
    text: "Strategies, eviction, invalidation, Redis, TTLs and distributed caches.",
    to: "/resources/hld/cache",
    icon: Stack,
    area: "Performance",
  },
  {
    title: "Load balancing",
    text: "L4 vs L7, routing, health checks and high availability.",
    to: "/resources/hld/load-balancing",
    icon: Graph,
    area: "Scalability",
  },
  {
    title: "Database design",
    text: "SQL vs NoSQL, indexes, replication, sharding and consistency.",
    to: "/resources/hld/database",
    icon: Database,
    area: "Data",
  },
  {
    title: "Message queues",
    text: "Async messaging, events, consumers, retries and delivery guarantees.",
    to: "/resources/hld/message-queue",
    icon: Broadcast,
    area: "Distributed systems",
  },
  {
    title: "Rate limiting",
    text: "Token and leaky buckets, fixed and sliding windows, distributed limits.",
    to: "/resources/hld/rate-limiting",
    icon: ShieldCheck,
    area: "Reliability",
  },
  {
    title: "API gateway",
    text: "Routing, auth, throttling, security and resilient gateway design.",
    to: "/resources/hld/api-gateway",
    icon: HardDrives,
    area: "Architecture",
  },
];

const MOCK_TOPICS = [
  ["DSA", "Coding, complexity and edge cases"],
  ["Low level design", "OOP, SOLID, patterns, concurrency"],
  ["High level design", "Scale, caching, databases"],
  ["GenAI engineering", "RAG, agents, LLMs, evaluation"],
  ["Backend and projects", "Java, Spring Boot, APIs, trade-offs"],
];

const OCCASIONS = [
  ["Birthdays", Cake],
  ["Proposals", Diamond],
  ["Anniversaries", Heart],
  ["Apologies", HeartBreak],
  ["Thank yous", Sparkle],
  ["Christmas", Confetti],
];

const MEMORY_FEATURES = [
  { icon: Microphone, title: "Your own voice", text: "Record a voice message or upload one." },
  { icon: Images, title: "Photos and videos", text: "Your best moments, all on one page." },
  { icon: LockKey, title: "Private with a PIN", text: "Lock the page so only they can open it." },
  { icon: Eye, title: "Know when they open it", text: "See when they visit and what they reply." },
];

const FAQS = [
  {
    question: "How do I get a job referral?",
    answer:
      "Open Target Trek Referrals, search the company you want and pick a member who works there. Send your resume, LinkedIn and the job ID or link with a short note. Asking is free. If they accept, a private chat opens so you can share details.",
  },
  {
    question: "Where should I start learning system design?",
    answer:
      "Start with the free guides on caching, load balancing, databases and API gateways. When you want complete interview preparation, move on to the System Design HLD book.",
  },
  {
    question: "What is the difference between HLD and LLD?",
    answer:
      "HLD (high level design) covers scalable architecture, APIs, databases, caching, distributed systems and trade-offs. LLD (low level design) covers object oriented modelling, classes, interfaces, UML, design patterns and Java implementation.",
  },
  {
    question: "Which parts of Target Trek are free?",
    answer:
      "The resources (SQL, API engineering and the system design guides), the interview experiences and the blogs are free to read. Ebooks, mock interviews, Prep Buddy, mentorship, Resume Review and Memories are paid, and each page shows its details before you pay.",
  },
  {
    question: "What is the difference between the All books pack and Lifetime?",
    answer:
      "The All books pack gives you every book available today in one payment. Lifetime gives you every current book plus every book published in future. Both are one time payments, with no subscription.",
  },
  {
    question: "How is a mock interview different from Prep Buddy?",
    answer:
      "A mock interview is a 1:1 session with an engineer who interviews you and gives feedback. Prep Buddy matches you with another candidate, by mutual consent, so you can practise together and chat privately.",
  },
  {
    question: "What do I get from Resume Review?",
    answer:
      "An AI report in minutes with an overall and ATS score, section grades, missing keywords and rewritten bullets. Plans with a human review add notes from a working professional, and some plans add a LinkedIn review.",
  },
  {
    question: "Can I share my own interview experience?",
    answer:
      "Yes. Open Interview experiences and use Share your experience, so other engineers can learn from the rounds you went through.",
  },
];

// =====================================================
// HELPERS
// =====================================================

const readTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const getCoverUrl = (book) =>
  book?.coverPageUrl || book?.coverpageurl || book?.cover_page_url || "";

const getCategories = (book) => {
  if (Array.isArray(book?.categories)) return book.categories.filter(Boolean);
  if (book?.category) return [book.category];
  return [];
};

const getPath = (book) =>
  String(book?.redirectUrl || "")
    .trim()
    .replace(/\/+$/, "");

const getId = (book) =>
  String(book?._id || book?.slug || book?.redirectUrl || book?.title || "");

const isPack = (book) =>
  Boolean(book?.isPack || book?.plan) ||
  [ALL_BOOKS_PATH, LIFETIME_PATH].includes(getPath(book));

const includedCount = (book) =>
  Array.isArray(book?.includedBooks) ? book.includedBooks.length : 0;

const scrollToId = (id) => {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

// Internal routes use <Link>, absolute ones a plain <a>
function SmartLink({ to, className, children, ...rest }) {
  const raw = String(to || "").trim();

  if (!raw) {
    return (
      <span className={className} {...rest}>
        {children}
      </span>
    );
  }

  if (/^https?:\/\//i.test(raw)) {
    return (
      <a href={raw} className={className} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link to={raw.startsWith("/") ? raw : `/${raw}`} className={className} {...rest}>
      {children}
    </Link>
  );
}

// =====================================================
// MOTION HELPERS
// =====================================================

// Router links that can take part in staggered entrance animations
const MotionLink = motion.create(Link);

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Stagger({ children, className, gap = 0.07 }) {
  return (
    <motion.div
      className={className}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

// =====================================================
// SMALL PIECES
// =====================================================

function Cover({ book, priority = false }) {
  const [failed, setFailed] = useState(false);
  const image = getCoverUrl(book);

  return (
    <div className="lx-cover">
      {image && !failed ? (
        <img
          src={image}
          alt=""
          width="300"
          height="400"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable="false"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="lx-cover-fallback">
          <span>TARGET TREK</span>
          <strong>{book?.title || "Ebook"}</strong>
        </div>
      )}
    </div>
  );
}

function SectionHead({ eyebrow, title, text, id, children }) {
  return (
    <div className="lx-head">
      <div className="lx-head-main">
        <Reveal>
          <span className="lx-eyebrow">{eyebrow}</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h2 className="lx-h2" id={id}>
            {title}
          </h2>
        </Reveal>
        {text && (
          <Reveal delay={0.12}>
            <p className="lx-lead">{text}</p>
          </Reveal>
        )}
      </div>

      {children && (
        <Reveal delay={0.16} className="lx-head-links">
          {children}
        </Reveal>
      )}
    </div>
  );
}

// Arrow buttons that scroll a horizontal rail by one screen
function RailNav({ railRef, label, watch }) {
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return undefined;

    const update = () =>
      setEdges({
        start: rail.scrollLeft <= 4,
        end: rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4,
      });

    update();
    rail.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      rail.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [railRef, watch]);

  const go = (direction) =>
    railRef.current?.scrollBy({
      left: direction * railRef.current.clientWidth * 0.85,
      behavior: "smooth",
    });

  return (
    <div>
      <button
        type="button"
        className="lx-icon-btn"
        onClick={() => go(-1)}
        disabled={edges.start}
        aria-label={`Scroll ${label} left`}
      >
        <CaretLeft size={16} weight="bold" />
      </button>
      <button
        type="button"
        className="lx-icon-btn"
        onClick={() => go(1)}
        disabled={edges.end}
        aria-label={`Scroll ${label} right`}
      >
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  );
}

function FaqItem({ faq, index, open, onToggle }) {
  const panelId = `lx-faq-${index}`;

  return (
    <motion.div variants={rise} className={cn("lx-faq-item", open && "is-open")}>
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span>{faq.question}</span>
        <motion.span
          className="lx-faq-icon"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <Plus size={16} weight="bold" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p className="lx-faq-answer">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// "[35]% in [two] quarters": the bracketed parts are marked
function SampleBullet({ text }) {
  return String(text)
    .split(/\[(.*?)\]/)
    .map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}

// =====================================================
// MAIN
// =====================================================

export default function LearnHome() {
  const [theme, setTheme] = useState(readTheme);
  const isDark = theme === "dark";

  // the one API call on this page: the public book list
  const [books, setBooks] = useState([]);
  const [booksState, setBooksState] = useState("loading"); // loading | ready | error

  const [bookFilter, setBookFilter] = useState("");
  const [activeFaq, setActiveFaq] = useState(0);
  const [activeTab, setActiveTab] = useState("");
  const [pinned, setPinned] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const rootRef = useRef(null);
  const tabsSlotRef = useRef(null);
  const resRailRef = useRef(null);
  const bookRailRef = useRef(null);

  // ---------- theme (navbar owns the toggle) ----------
  useEffect(() => {
    const sync = (event) => {
      const next = event?.detail?.theme;
      setTheme(next === "dark" || next === "light" ? next : readTheme());
    };
    const onStorage = (event) => {
      if (!event.key || event.key === THEME_KEY) setTheme(readTheme());
    };

    window.addEventListener(THEME_EVENT, sync);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);

    return () => {
      window.removeEventListener(THEME_EVENT, sync);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
    };
  }, []);

  // ---------- the single API request ----------
  useEffect(() => {
    const controller = new AbortController();

    fetch(`${BASE_URL}/book`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((json) => {
        if (json?.success !== true || !Array.isArray(json.data)) throw new Error();
        setBooks(json.data);
        setBooksState("ready");
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setBooksState("error");
      });

    return () => controller.abort();
  }, []);

  // ---------- fixed header height (phone header has two rows) ----------
  useEffect(() => {
    const root = rootRef.current;
    const header = document.querySelector("nav.fixed");
    if (!root || !header) return undefined;

    const sync = () => {
      const height = Math.round(header.getBoundingClientRect().height);
      if (height > 0) root.style.setProperty("--nav-h", `${height}px`);
    };

    sync();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", sync);
      return () => window.removeEventListener("resize", sync);
    }

    const observer = new ResizeObserver(sync);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // ---------- scroll: progress bar, pinned tabs, back to top ----------
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  useMotionValueEvent(scrollY, "change", (value) => {
    const far = value > 900;
    setScrolled((current) => (current === far ? current : far));

    const slot = tabsSlotRef.current;
    const root = rootRef.current;
    if (!slot || !root) return;

    const navH = parseFloat(getComputedStyle(root).getPropertyValue("--nav-h")) || 64;
    const pin = slot.getBoundingClientRect().top <= navH;
    setPinned((current) => (current === pin ? current : pin));

    // above the sections no tab is "current"
    if (!pin) setActiveTab((current) => (current ? "" : current));
  });

  // ---------- derived book data ----------
  const singles = useMemo(() => books.filter((book) => !isPack(book)), [books]);

  const allPack = useMemo(
    () => books.find((book) => getPath(book) === ALL_BOOKS_PATH) || null,
    [books]
  );
  const lifePack = useMemo(
    () => books.find((book) => getPath(book) === LIFETIME_PATH) || null,
    [books]
  );

  const categories = useMemo(() => {
    const counts = new Map();
    for (const book of singles) {
      for (const name of getCategories(book)) counts.set(name, (counts.get(name) || 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [singles]);

  const railBooks = useMemo(() => {
    const list = bookFilter
      ? singles.filter((book) => getCategories(book).includes(bookFilter))
      : singles;
    // featured books first, keep the API order otherwise
    return [...list].sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));
  }, [singles, bookFilter]);

  const shelfCovers = useMemo(
    () => singles.filter((book) => getCoverUrl(book)).slice(0, 5),
    [singles]
  );

  const packCovers = (pack) => {
    const inside = (Array.isArray(pack?.includedBooks) ? pack.includedBooks : []).filter(
      (item) => item && typeof item === "object" && getCoverUrl(item)
    );
    return (inside.length ? inside : shelfCovers).slice(0, 3);
  };

  // new filter: start the rail from the first card
  useEffect(() => {
    bookRailRef.current?.scrollTo({ left: 0 });
  }, [bookFilter]);

  // ---------- section tabs + scrollspy ----------
  const tabs = [
    { id: "explore", label: "Explore" },
    { id: "resources", label: "Free resources" },
    { id: "books", label: "Books" },
    { id: "interview-prep", label: "Interview prep" },
    { id: "resume", label: "Resume review" },
    { id: "referrals", label: "Referrals" },
    { id: "memories", label: "Memories" },
    { id: "faq", label: "FAQ" },
  ];

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const nodes = ["explore", "resources", "books", "interview-prep", "resume", "referrals", "memories", "faq"]
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveTab(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  const jump = useCallback((id) => scrollToId(id), []);

  // ---------- SEO ----------
  const structuredData = useMemo(() => {
    const links = [
      ...EXPLORE.map((item) => ({ name: item.title, url: `${SITE_URL}${item.to}` })),
      ...CORE_RESOURCES.map((item) => ({ name: `${item.title} guide`, url: `${SITE_URL}${item.to}` })),
      ...HLD_GUIDES.map((item) => ({ name: `${item.title} guide`, url: `${SITE_URL}${item.to}` })),
    ];

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${PAGE_URL}#page`,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          url: PAGE_URL,
          isPartOf: { "@type": "WebSite", name: "Target Trek", url: SITE_URL },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Target Trek", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Learn", item: PAGE_URL },
          ],
        },
        {
          "@type": "ItemList",
          name: "Everything on Target Trek",
          itemListElement: links.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: item.url,
          })),
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        },
      ],
    };
  }, []);

  const [before, after] = SAMPLE.bullets[0];
  const bookCount = singles.length;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <MotionConfig reducedMotion="user">
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta
          name="keywords"
          content="system design, software engineering, Java LLD, HLD, GenAI, backend engineering, developer resources, interview experiences, mock interviews, resume review, Target Trek"
        />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <link rel="canonical" href={PAGE_URL} />
        <link rel="stylesheet" href={FONT_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Target Trek" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <motion.div className="lx-progress" style={{ scaleX: progress }} aria-hidden="true" />

      <main ref={rootRef} className="lx" data-theme={isDark ? "dark" : "light"}>
        {/* ===================================== */}
        {/* HERO                                  */}
        {/* ===================================== */}

        <section className="lx-hero" aria-labelledby="lx-title">
          <div className="lx-hero-bg" aria-hidden="true">
            <i />
          </div>

          <div className="lx-shell lx-hero-grid">
            <div>
              <motion.p
                className="lx-pill"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <span className="lx-ping" aria-hidden="true" />
                Target Trek · Learn
                <b>for software engineers</b>
              </motion.p>

              <motion.h1
                id="lx-title"
                className="lx-h1 lx-hero-title"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
              >
                Everything you need to <span className="lx-hl">crack the interview</span>, in
                one place.
              </motion.h1>

              <motion.p
                className="lx-lead lx-hero-lead"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              >
                Free system design and backend guides, interview preparation books,
                real interview experiences, mock interviews and a resume review, so
                you always know what to do next.
              </motion.p>

              <motion.div
                className="lx-goals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              >
                <p>What do you want to do today?</p>

                <div className="lx-goal-grid">
                  {GOALS.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <button
                        type="button"
                        key={goal.id}
                        className="lx-goal"
                        onClick={() => jump(goal.id)}
                      >
                        <Icon size={22} weight="duotone" />
                        <b>{goal.label}</b>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                className="lx-hero-ctas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              >
                <Link to="/resources" className="lx-btn lx-btn-primary">
                  Start with free guides
                  <ArrowRight size={16} weight="bold" />
                </Link>
                <Link to="/books" className="lx-btn lx-btn-ghost">
                  Browse the books
                </Link>
              </motion.div>
            </div>

            <motion.aside
              className="lx-path"
              aria-labelledby="lx-path-title"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            >
              <div className="lx-path-head">
                <h2 id="lx-path-title">Your prep path</h2>
                <span>4 steps</span>
              </div>

              <ol className="lx-steps">
                {PATH.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title}>
                      <Link to={item.to} className="lx-step">
                        <span className="lx-tile">
                          <Icon size={20} weight="duotone" />
                        </span>
                        <span>
                          <small>{item.step}</small>
                          <b>{item.title}</b>
                          <em>{item.text}</em>
                        </span>
                        <ArrowUpRight size={18} weight="bold" />
                      </Link>
                    </li>
                  );
                })}
              </ol>

              <Link to="/books" className="lx-shelf">
                <span className="lx-shelf-covers" aria-hidden="true">
                  {booksState === "ready" && shelfCovers.length
                    ? shelfCovers.map((book, i) => <Cover key={getId(book)} book={book} priority={i < 3} />)
                    : [0, 1, 2, 3].map((i) => <div key={i} className="lx-cover lx-skel" />)}
                </span>
                <span className="lx-shelf-copy">
                  <b>
                    {booksState === "ready" && bookCount
                      ? `${bookCount} ebooks on the shelf`
                      : "Ebooks on the shelf"}
                  </b>
                  <span>System design, Java, Spring Boot, SQL, cloud, GenAI</span>
                </span>
                <ArrowRight size={18} weight="bold" />
              </Link>
            </motion.aside>
          </div>
        </section>

        {/* ===================================== */}
        {/* SECTION TABS                          */}
        {/* ===================================== */}

        <div className="lx-tabs-slot" ref={tabsSlotRef}>
          <nav className={cn("lx-tabs", pinned && "is-pinned")} aria-label="On this page">
            <div className="lx-shell lx-tabs-in">
              <div className="lx-tabs-list">
                {tabs.map((tab) => (
                  <button
                    type="button"
                    key={tab.id}
                    className={cn("lx-tab", activeTab === tab.id && "is-on")}
                    aria-current={activeTab === tab.id ? "location" : undefined}
                    onClick={() => jump(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        </div>

        {/* ===================================== */}
        {/* EXPLORE: everything on Target Trek    */}
        {/* ===================================== */}

        <section className="lx-sec" id="explore" aria-labelledby="lx-explore-title">
          <div className="lx-shell">
            <SectionHead
              eyebrow="Explore Target Trek"
              id="lx-explore-title"
              title={
                <>
                  Pick where you are. <span className="lx-hl">We have a page for it.</span>
                </>
              }
              text="Every part of Target Trek in one place. Free ones are marked, and each card opens the full page."
            />

            <Stagger className="lx-bento" gap={0.05}>
              {EXPLORE.map((item) => {
                const Icon = item.icon;
                return (
                  <MotionLink key={item.title} variants={rise} to={item.to} className={cn("lx-cell", item.size)}>
                      <div className="lx-cell-top">
                        <span className="lx-tile">
                          <Icon size={22} weight="duotone" />
                        </span>
                        {item.free && <span className="lx-tag is-free">Free</span>}
                      </div>

                      <h3>{item.title}</h3>
                      <p>{item.text}</p>

                      {item.covers && (
                        <div className="lx-cell-covers" aria-hidden="true">
                          {booksState === "ready" && shelfCovers.length
                            ? shelfCovers.slice(0, 3).map((book) => <Cover key={getId(book)} book={book} />)
                            : [0, 1, 2].map((i) => <div key={i} className="lx-cover lx-skel" style={{ width: 54 }} />)}
                        </div>
                      )}

                      <span className="lx-go">
                        Open {item.title.toLowerCase()}
                        <ArrowRight size={14} weight="bold" />
                      </span>
                  </MotionLink>
                );
              })}
            </Stagger>
          </div>
        </section>

        {/* ===================================== */}
        {/* FREE RESOURCES                        */}
        {/* ===================================== */}

        <section className="lx-sec lx-tint" id="resources" aria-labelledby="lx-res-title">
          <div className="lx-shell">
            <SectionHead
              eyebrow="Free resources"
              id="lx-res-title"
              title="Learn one concept at a time, for free."
              text="Clear guides with examples for quick revision before a round, or to build the fundamentals the books build on."
            >
              <Link to="/resources" className="lx-btn lx-btn-ghost lx-btn-sm">
                All resources
                <ArrowRight size={14} weight="bold" />
              </Link>
            </SectionHead>

            <Stagger className="lx-res-core">
              {CORE_RESOURCES.map((item) => {
                const Icon = item.icon;
                return (
                  <MotionLink key={item.title} variants={rise} to={item.to} className="lx-res-big" data-code={item.code}>
                      <div className="lx-res-top">
                        <span className="lx-tile">
                          <Icon size={22} weight="duotone" />
                        </span>
                        <span className="lx-tag is-free">Free guide</span>
                      </div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                      <ul className="lx-chips">
                        {item.tags.map((tag) => (
                          <li key={tag}>{tag}</li>
                        ))}
                      </ul>
                      <span className="lx-go">
                        Read the {item.title} guide
                        <ArrowRight size={14} weight="bold" />
                      </span>
                  </MotionLink>
                );
              })}
            </Stagger>

            <div className="lx-sub-head">
              <h3>System design (HLD) guides</h3>
              <RailNav railRef={resRailRef} label="system design guides" />
            </div>

            <div className="lx-rail" ref={resRailRef}>
              {HLD_GUIDES.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link key={item.title} to={item.to} className="lx-res">
                    <div className="lx-res-top">
                      <span className="lx-tile">
                        <Icon size={20} weight="duotone" />
                      </span>
                      <span className="lx-res-n">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <small>{item.area}</small>
                    <h4>{item.title}</h4>
                    <p>{item.text}</p>
                    <span className="lx-go">
                      Open guide
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </Link>
                );
              })}
            </div>

            <p className="lx-books-foot" style={{ justifyContent: "center" }}>
              <Link to="/resources/hld" className="lx-link">
                See every system design guide
                <ArrowRight size={14} weight="bold" />
              </Link>
            </p>
          </div>
        </section>

        {/* ===================================== */}
        {/* BOOKS (the one API call)              */}
        {/* ===================================== */}

        <section className="lx-sec" id="books" aria-labelledby="lx-books-title">
          <div className="lx-shell">
            <SectionHead
              eyebrow="Ebooks"
              id="lx-books-title"
              title={
                <>
                  Go deep with a book, or <span className="lx-hl">take the whole shelf.</span>
                </>
              }
              text="Practical interview books written for software engineers, read in the built in reader. Take one book, every book, or every book we will ever publish."
            >
              <Link to="/books" className="lx-btn lx-btn-ghost lx-btn-sm">
                All books
                <ArrowRight size={14} weight="bold" />
              </Link>
            </SectionHead>

            {/* the two packs */}
            <Stagger className="lx-packs" gap={0.1}>
                <MotionLink variants={rise} to={ALL_BOOKS_PATH} className="lx-pack">
                  <div>
                    <span className="lx-eyebrow">
                      <Package size={14} weight="bold" />
                      All books pack
                    </span>
                    <h3>{allPack?.title || "Target Trek All Books"}</h3>
                    <p>Every book available today, in one payment.</p>
                    <ul>
                      <li>
                        <Check size={14} weight="bold" />
                        {includedCount(allPack)
                          ? `${includedCount(allPack)} books included`
                          : "Every current book included"}
                      </li>
                      <li>
                        <Check size={14} weight="bold" />
                        An email alert when a new book is published
                      </li>
                      {Number(allPack?.matches) > 0 && (
                        <li>
                          <Check size={14} weight="bold" />
                          {allPack.matches} Prep Buddy {Number(allPack.matches) === 1 ? "credit" : "credits"} included
                        </li>
                      )}
                      <li>
                        <Check size={14} weight="bold" />
                        One time payment, no subscription
                      </li>
                    </ul>
                    <span className="lx-go">
                      See what is inside
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </div>
                  <div className="lx-pack-art" aria-hidden="true">
                    {booksState === "ready"
                      ? packCovers(allPack).map((book, i) => <Cover key={getId(book) || i} book={book} />)
                      : [0, 1, 2].map((i) => <div key={i} className="lx-cover lx-skel" />)}
                  </div>
                </MotionLink>

                <MotionLink variants={rise} to={LIFETIME_PATH} className="lx-pack is-life">
                  <div>
                    <span className="lx-pack-badge">
                      <InfinityIcon size={14} weight="bold" />
                      Lifetime
                    </span>
                    <h3>{lifePack?.title || "Target Trek Lifetime Books"}</h3>
                    <p>Every book today, plus every book we publish in future.</p>
                    <ul>
                      <li>
                        <Check size={14} weight="bold" />
                        {includedCount(lifePack)
                          ? `${includedCount(lifePack)} books today, more as they launch`
                          : "Every current and future book"}
                      </li>
                      <li>
                        <Check size={14} weight="bold" />
                        New books emailed to you free
                      </li>
                      {Number(lifePack?.matches) > 0 && (
                        <li>
                          <Check size={14} weight="bold" />
                          {lifePack.matches} Prep Buddy {Number(lifePack.matches) === 1 ? "credit" : "credits"} included
                        </li>
                      )}
                    </ul>
                    <span className="lx-go">
                      See the Lifetime pack
                      <ArrowRight size={14} weight="bold" />
                    </span>
                  </div>
                  <div className="lx-pack-art" aria-hidden="true">
                    {booksState === "ready"
                      ? packCovers(lifePack).map((book, i) => <Cover key={getId(book) || i} book={book} />)
                      : [0, 1, 2].map((i) => <div key={i} className="lx-cover lx-skel" />)}
                  </div>
                </MotionLink>
            </Stagger>

            {/* book rail */}
            <div className="lx-sub-head">
              <h3>
                {booksState === "ready" && bookCount ? `All ${bookCount} books` : "Every book"}
              </h3>
              <RailNav railRef={bookRailRef} label="books" watch={`${booksState}-${railBooks.length}-${bookFilter}`} />
            </div>

            {categories.length > 0 && (
              <div className="lx-filter" role="group" aria-label="Filter books by topic" style={{ marginBottom: 14 }}>
                <button type="button" aria-pressed={!bookFilter} onClick={() => setBookFilter("")}>
                  All<span className="lx-mono">{bookCount}</span>
                </button>
                {categories.map((item) => (
                  <button
                    type="button"
                    key={item.name}
                    aria-pressed={bookFilter === item.name}
                    onClick={() => setBookFilter(bookFilter === item.name ? "" : item.name)}
                  >
                    {item.name}
                    <span className="lx-mono">{item.count}</span>
                  </button>
                ))}
              </div>
            )}

            {booksState === "error" ? (
              <div className="lx-blog">
                <div className="lx-blog-main">
                  <span className="lx-tile">
                    <BookOpen size={22} weight="duotone" />
                  </span>
                  <div>
                    <h3>The shelf did not load</h3>
                    <p>Every book is still on the books page, with details and a reader preview.</p>
                  </div>
                </div>
                <Link to="/books" className="lx-btn lx-btn-primary">
                  Open the books page
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </div>
            ) : (
              <div className="lx-rail" ref={bookRailRef} aria-busy={booksState === "loading"}>
                {booksState === "loading"
                  ? [0, 1, 2, 3].map((i) => (
                      <div key={i} className="lx-book lx-book-skel" aria-hidden="true">
                        <div className="lx-book-media">
                          <div className="lx-cover lx-skel" style={{ width: "min(140px, 62%)" }} />
                        </div>
                        <div className="lx-book-body">
                          <i className="lx-skel" style={{ width: "40%" }} />
                          <i className="lx-skel" style={{ width: "85%", height: 18 }} />
                          <i className="lx-skel" style={{ width: "60%" }} />
                        </div>
                      </div>
                    ))
                  : railBooks.map((book) => (
                      <SmartLink key={getId(book)} to={book.redirectUrl} className="lx-book">
                        <div className="lx-book-media">
                          <Cover book={book} />
                          {book.badge && <span className="lx-book-flag">{book.badge}</span>}
                        </div>
                        <div className="lx-book-body">
                          <p className="lx-kicker">
                            {getCategories(book)[0] ||
                              (book.resourceType === "bundle" ? "Combo" : "Ebook")}
                          </p>
                          <h4 className="lx-book-title">{book.title}</h4>
                          {(book.subtitle || book.shortDescription) && (
                            <p className="lx-book-sub">{book.subtitle || book.shortDescription}</p>
                          )}
                          <span className="lx-go">
                            View book
                            <ArrowRight size={14} weight="bold" />
                          </span>
                        </div>
                      </SmartLink>
                    ))}
              </div>
            )}

            <div className="lx-books-foot">
              <p>Buying several? Bundle offers lower the price when you pick more books.</p>
              <div>
                <Link to="/books/bundle-offers" className="lx-btn lx-btn-ghost lx-btn-sm">
                  Bundle offers
                </Link>
                <Link to="/books" className="lx-btn lx-btn-primary lx-btn-sm">
                  Browse all books
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================== */}
        {/* INTERVIEW PREP                        */}
        {/* ===================================== */}

        <section className="lx-sec lx-tint" id="interview-prep" aria-labelledby="lx-prep-title">
          <div className="lx-shell">
            <SectionHead
              eyebrow="Interview prep"
              id="lx-prep-title"
              title="Read real rounds. Then practise out loud."
              text="Knowing the answer is half of it. These are the places to see how interviews really go, and to rehearse explaining your own thinking."
            />

            <Stagger className="lx-prep" gap={0.08}>
              {/* interview experiences */}
              <motion.article variants={rise} className="lx-prep-card">
                <div className="lx-prep-top">
                  <span className="lx-tile">
                    <Briefcase size={22} weight="duotone" />
                  </span>
                  <span className="lx-tag is-free">Free to read</span>
                </div>
                <h3>Interview experiences</h3>
                <p>
                  Real interview experiences from engineers: the rounds, the questions
                  and the results, across DSA, LLD, HLD, backend, GenAI and system design.
                </p>
                <ul className="lx-chips">
                  {["DSA", "LLD", "HLD", "Java", "Backend", "GenAI"].map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="lx-prep-actions">
                  <Link to="/interviews" className="lx-btn lx-btn-primary lx-btn-sm">
                    Read experiences
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                  <Link to="/interview/create" className="lx-link">
                    <PencilSimple size={14} weight="bold" />
                    Share yours
                  </Link>
                </div>
              </motion.article>

              {/* mock interviews */}
              <motion.article variants={rise} className="lx-prep-card is-feature">
                <div className="lx-prep-top">
                  <span className="lx-tile">
                    <VideoCamera size={22} weight="duotone" />
                  </span>
                  <span className="lx-tag">1:1 with an engineer</span>
                </div>
                <h3>Mock interviews</h3>
                <p>
                  A live technical discussion with an interviewer, follow-up questions on
                  trade-offs and edge cases, and feedback on what to improve.
                </p>
                <ul className="lx-topics">
                  {MOCK_TOPICS.map(([title, text]) => (
                    <li key={title}>
                      <b>{title}</b>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
                <div className="lx-prep-actions">
                  <Link to="/mock-interviews" className="lx-btn lx-btn-primary lx-btn-sm">
                    See mock interview slots
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>
              </motion.article>

              {/* prep buddy */}
              <motion.article variants={rise} className="lx-prep-card">
                <div className="lx-prep-top">
                  <span className="lx-tile">
                    <Handshake size={22} weight="duotone" />
                  </span>
                  <span className="lx-tag">Peer practice</span>
                </div>
                <h3>Prep Buddy</h3>
                <p>
                  Find a serious interview-prep partner for system design, frontend,
                  backend, DevOps, SDET, DSA and GenAI.
                </p>
                <ul className="lx-points">
                  <li>
                    <Check size={14} weight="bold" />
                    Anonymous profiles, your name stays hidden until you allow it
                  </li>
                  <li>
                    <Check size={14} weight="bold" />
                    Matches only happen when both of you accept
                  </li>
                  <li>
                    <ChatCircleText size={14} weight="bold" />
                    Private chat to plan and run mock interviews together
                  </li>
                </ul>
                <div className="lx-prep-actions">
                  <Link to="/prep-buddy" className="lx-btn lx-btn-ghost lx-btn-sm">
                    Find a prep buddy
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>
              </motion.article>

              {/* mentorship */}
              <motion.article variants={rise} className="lx-prep-card">
                <div className="lx-prep-top">
                  <span className="lx-tile">
                    <UsersThree size={22} weight="duotone" />
                  </span>
                  <span className="lx-tag">Students and freshers</span>
                </div>
                <h3>Placement mentorship</h3>
                <p>
                  For college students and engineers with up to one year of experience:
                  guidance from your resume to the offer.
                </p>
                <ul className="lx-points">
                  {[
                    "Resume and project guidance",
                    "Preparation plan and resources",
                    "Mock interviews",
                    "Applications, shortlisting and placement suggestions",
                  ].map((point) => (
                    <li key={point}>
                      <Check size={14} weight="bold" />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="lx-prep-actions">
                  <Link to="/mentorship" className="lx-btn lx-btn-ghost lx-btn-sm">
                    About mentorship
                    <ArrowRight size={14} weight="bold" />
                  </Link>
                </div>
              </motion.article>
            </Stagger>
          </div>
        </section>

        {/* ===================================== */}
        {/* RESUME REVIEW                         */}
        {/* ===================================== */}

        <section className="lx-sec" id="resume" aria-label="Resume Review">
          <div className="lx-shell">
            <Reveal>
              <div className="lx-resume">
                <div>
                  <span className="lx-eyebrow">Resume Review by Target Trek</span>
                  <h2 className="lx-h2">
                    Ready for the interview? <span className="lx-hl">Now get the call.</span>
                  </h2>
                  <p className="lx-resume-text">
                    Most resumes are rejected by software or skimmed in ten seconds.
                    Find out exactly what is costing you shortlists, and how to fix it.
                  </p>

                  <ul className="lx-points">
                    <li>
                      <Sparkle size={16} weight="duotone" />
                      <span>
                        <b>AI report in minutes.</b> Overall and ATS score, section
                        grades, missing keywords and rewritten bullets.
                      </span>
                    </li>
                    <li>
                      <UsersThree size={16} weight="duotone" />
                      <span>
                        <b>A working professional reviews it.</b> Plain-language notes
                        on your story, level and fit.
                      </span>
                    </li>
                    <li>
                      <Brain size={16} weight="duotone" />
                      <span>
                        <b>LinkedIn review too.</b> One consistent story across your
                        resume and your profile.
                      </span>
                    </li>
                  </ul>

                  <div className="lx-resume-actions">
                    <Link to="/resume-review" className="lx-btn lx-btn-primary">
                      Review my resume
                      <ArrowRight size={16} weight="bold" />
                    </Link>
                    <Link to="/resume-review#sample" className="lx-link">
                      See a sample report
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>
                </div>

                <div className="lx-report" aria-label="From a sample report">
                  <div className="lx-report-head">
                    <span>Sample report</span>
                    <small>{SAMPLE.role}</small>
                  </div>
                  <h4>{SAMPLE.headline}</h4>

                  <div className="lx-scores">
                    {[
                      ["Overall", SAMPLE.overall],
                      ["ATS", SAMPLE.ats],
                      ["Job match", SAMPLE.jobMatch],
                    ].map(([label, value]) => (
                      <div key={label} className="lx-score">
                        <b>{value}</b>
                        <span>{label}</span>
                        <i>
                          <u style={{ width: `${value}%` }} />
                        </i>
                      </div>
                    ))}
                  </div>

                  <div className="lx-fix">
                    <p className="lx-before">
                      <span>Before</span>
                      <s>{before}</s>
                    </p>
                    <p className="lx-after">
                      <span>After</span>
                      <SampleBullet text={after} />
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===================================== */}
        {/* REFERRALS                             */}
        {/* ===================================== */}

        <section className="lx-sec" id="referrals" aria-labelledby="lx-ref-title" style={{ paddingTop: 0 }}>
          <div className="lx-shell">
            <Reveal>
              <div className="lx-resume">
                <div>
                  <span className="lx-eyebrow">Target Trek Referrals</span>
                  <h2 className="lx-h2" id="lx-ref-title">
                    Skip the pile. <span className="lx-hl">Get referred.</span>
                  </h2>
                  <p className="lx-resume-text">
                    A referral puts your resume in front of the hiring team. Ask people who already work at the company you want.
                  </p>
                  <ul className="lx-points">
                    <li><UserPlus size={16} weight="duotone" /><span><b>Search by company.</b> See members who work there, their role and experience.</span></li>
                    <li><ChatsCircle size={16} weight="duotone" /><span><b>Chat once they accept.</b> Share your resume, LinkedIn and the job ID.</span></li>
                    <li><ShieldCheck size={16} weight="duotone" /><span><b>Private by default.</b> Referrers can hide their name. Asking is free.</span></li>
                  </ul>
                  <div className="lx-resume-actions">
                    <Link to="/referral/app/find" className="lx-btn lx-btn-primary">
                      Find a referrer
                      <ArrowRight size={16} weight="bold" />
                    </Link>
                    <Link to="/referral" className="lx-link">
                      How referrals work
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>
                </div>

                <div className="lx-report" aria-hidden="true">
                  <div className="lx-report-head"><span>Referral request</span><small>Accepted ✅</small></div>
                  <h4>Aarav K. · SDE-2 at Flipkart · 4 yrs</h4>
                  <div className="lx-fix">
                    <p className="lx-before"><span>You</span>Hi! Applying for SDE-1 (R-12345). Built a payments retry service in Node. Would love a referral 🙏</p>
                    <p className="lx-after"><span>Aarav</span>Your resume looks strong. Sending it to the hiring manager today 🎉</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===================================== */}
        {/* MEMORIES                              */}
        {/* ===================================== */}

        <section className="lx-sec" id="memories" aria-label="Memories" style={{ paddingTop: 0 }}>
          <div className="lx-shell">
            <Reveal>
              <div className="lx-mem">
                <div>
                  <span className="lx-eyebrow" style={{ color: "var(--rose)" }}>
                    Memories by Target Trek
                  </span>
                  <h2 className="lx-h2">
                    Say it with a page <span className="lx-hl">they will never forget.</span>
                  </h2>
                  <p className="lx-mem-text">
                    Pick an occasion, add your words, photos and your own voice, then send
                    one link. Nothing to install for them, and it works on any phone.
                  </p>

                  <ul className="lx-occasions">
                    {OCCASIONS.map(([label, Icon]) => (
                      <li key={label}>
                        <Icon size={14} weight="fill" />
                        {label}
                      </li>
                    ))}
                  </ul>

                  <div className="lx-mem-actions">
                    <Link to="/memories" className="lx-btn lx-btn-primary">
                      Make a memory page
                      <ArrowRight size={16} weight="bold" />
                    </Link>
                    <Link to="/memories/preview/birthday" className="lx-link">
                      See a birthday preview
                      <ArrowRight size={14} weight="bold" />
                    </Link>
                  </div>
                </div>

                <div className="lx-mem-feats">
                  {MEMORY_FEATURES.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="lx-mem-feat">
                        <span className="lx-tile">
                          <Icon size={18} weight="duotone" />
                        </span>
                        <b>{item.title}</b>
                        <p>{item.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===================================== */}
        {/* BLOGS                                 */}
        {/* ===================================== */}

        <section className="lx-sec" aria-label="Blogs" style={{ paddingTop: 0 }}>
          <div className="lx-shell">
            <Reveal>
              <div className="lx-blog">
                <div className="lx-blog-main">
                  <span className="lx-tile">
                    <Article size={22} weight="duotone" />
                  </span>
                  <div>
                    <h3>Engineering blogs</h3>
                    <p>
                      Practical articles on system design, backend development, Java,
                      GenAI, APIs, databases and interview preparation.
                    </p>
                    <ul className="lx-chips">
                      {["System design", "Backend", "Java", "GenAI", "Careers"].map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Link to="/blogs" className="lx-btn lx-btn-ghost">
                  Read the blogs
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===================================== */}
        {/* FAQ                                   */}
        {/* ===================================== */}

        <section className="lx-sec lx-tint" id="faq" aria-labelledby="lx-faq-title">
          <div className="lx-shell lx-faq">
            <SectionHead
              eyebrow="Good to know"
              id="lx-faq-title"
              title="Questions, answered."
              text="What is free, what each part of Target Trek is for, and where to start."
            />

            <Stagger className="lx-faq-list" gap={0.05}>
              {FAQS.map((faq, index) => (
                <FaqItem
                  key={faq.question}
                  faq={faq}
                  index={index}
                  open={activeFaq === index}
                  onToggle={() => setActiveFaq(activeFaq === index ? null : index)}
                />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ===================================== */}
        {/* CLOSING CTA                           */}
        {/* ===================================== */}

        <section className="lx-sec">
          <div className="lx-shell">
            <Reveal>
              <div className="lx-cta">
                <div>
                  <span className="lx-eyebrow">Not sure where to start?</span>
                  <h2 className="lx-h2" style={{ marginTop: 12 }}>
                    Tell us your next interview. We will point the way.
                  </h2>
                  <p>
                    Write to us with the role and the round you are preparing for, and we
                    will suggest the right guide, book or session.
                  </p>
                </div>
                <div className="lx-cta-actions">
                  <Link to="/contact" className="lx-btn lx-btn-primary">
                    Contact us
                    <ArrowRight size={16} weight="bold" />
                  </Link>
                  <Link to="/about" className="lx-btn lx-btn-ghost">
                    About Target Trek
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <AnimatePresence>
          {scrolled && (
            <motion.button
              key="top"
              type="button"
              className="lx-top"
              aria-label="Back to top"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp size={20} weight="bold" />
            </motion.button>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
