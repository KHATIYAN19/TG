import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  BrainCircuit,
  CheckCircle2,
  Code2,
  Database,
  FileCode2,
  GraduationCap,
  Layers3,
  Lightbulb,
  Mail,
  MapPin,
  Network,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TerminalSquare,
  UserRound,
  Workflow,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const CANONICAL_URL = `${SITE_URL}/about`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

/*
|--------------------------------------------------------------------------
| Business / operator details (from .env)
|--------------------------------------------------------------------------
| VITE_OPERATOR_NAME=...
| VITE_OPERATOR_MOBILE=...
| VITE_OPERATOR_ADDRESS=...
|
| A section/row is shown only when its variable has a non-empty value.
| (Vite reads .env at startup: restart the dev server after editing it.)
*/

const readEnv = (value) => {
  return String(value || "").trim();
};

const OPERATOR_NAME = readEnv(import.meta.env.VITE_OPERATOR_NAME);
const OPERATOR_MOBILE = readEnv(import.meta.env.VITE_OPERATOR_MOBILE);
const OPERATOR_ADDRESS = readEnv(import.meta.env.VITE_OPERATOR_ADDRESS);

const OPERATOR_PHONE_HREF = OPERATOR_MOBILE
  ? `tel:${OPERATOR_MOBILE.replace(/[^\d+]/g, "")}`
  : "";

const HAS_OPERATOR_INFO = Boolean(
  OPERATOR_NAME || OPERATOR_MOBILE || OPERATOR_ADDRESS
);

const SEO_TITLE =
  "About Target Trek | System Design, GenAI & Developer Books";

const SEO_DESCRIPTION =
  "Learn about Target Trek, a developer learning platform creating practical books and resources on System Design HLD, LLD Java, RAG, MCP, Google ADK, Backend Engineering, GenAI and software engineering interviews.";

const SEO_KEYWORDS = [
  "Target Trek",
  "Target Trek books",
  "developer books",
  "developer ebooks",
  "software engineering books",
  "system design book",
  "system design ebook",
  "HLD book",
  "high level design book",
  "LLD book",
  "low level design Java",
  "LLD Java book",
  "GenAI book",
  "RAG book",
  "RAG pipeline",
  "MCP book",
  "Model Context Protocol book",
  "Google ADK book",
  "AI agents book",
  "backend engineering",
  "software engineering interview preparation",
  "system design interview preparation",
].join(", ");

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80";

const EASE = [0.22, 1, 0.36, 1];
const SOFT_EASE = [0.25, 0.1, 0.25, 1];

const getStoredTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    /* storage unavailable */
  }

  return "light";
};

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

const books = [
  {
    icon: Network,
    title: "Mastering System Design — HLD",
    category: "High-Level Design",
    description:
      "A practical system design resource covering requirements, APIs, databases, caching, scalability, distributed systems, reliability and real interview-style architecture problems.",
    topics: [
      "Requirements & APIs",
      "Databases & Caching",
      "Scalability",
      "Distributed Systems",
      "Real HLD Problems",
    ],
  },
  {
    icon: Code2,
    title: "Mastering System Design — LLD (Java)",
    category: "Low-Level Design",
    description:
      "A Java-focused Low-Level Design book covering object-oriented programming, SOLID principles, design patterns, concurrency, UML and complete interview-style design problems.",
    topics: [
      "OOP Principles",
      "SOLID",
      "Design Patterns",
      "Java Implementation",
      "LLD Problems",
    ],
  },
  {
    icon: Database,
    title: "Master GenAI Interview — RAG Pipeline",
    category: "Generative AI",
    description:
      "A developer-focused RAG resource covering ingestion, chunking, embeddings, vector databases, retrieval, generation and complete offline and online RAG pipelines.",
    topics: [
      "RAG Fundamentals",
      "Chunking",
      "Embeddings",
      "Vector Databases",
      "Production RAG",
    ],
  },
  {
    icon: Workflow,
    title: "Master GenAI Interview — MCP",
    category: "Model Context Protocol",
    description:
      "Understand MCP from fundamentals to implementation, including hosts, clients, servers, transports, JSON-RPC, lifecycle management, connectors and practical MCP projects.",
    topics: [
      "MCP Architecture",
      "Hosts & Clients",
      "MCP Servers",
      "JSON-RPC",
      "Practical Projects",
    ],
  },
  {
    icon: Bot,
    title: "Google ADK Complete Developer Handbook",
    category: "AI Agents",
    description:
      "A practical Google ADK handbook covering agents, tools, sessions, memory, multi-agent orchestration, guardrails, evaluation, RAG, MCP and production agent development.",
    topics: [
      "Google ADK",
      "AI Agents",
      "Tools & Sessions",
      "Multi-Agent Systems",
      "RAG & MCP",
    ],
  },
];

const learningAreas = [
  {
    icon: Network,
    title: "System Design",
    description:
      "Learn how large-scale systems are designed from requirements to APIs, databases, caching, queues, scaling, reliability and distributed architecture.",
  },
  {
    icon: Code2,
    title: "Low-Level Design",
    description:
      "Understand object modeling, OOP, SOLID, design patterns, UML, concurrency and complete Java implementations.",
  },
  {
    icon: BrainCircuit,
    title: "Generative AI",
    description:
      "Explore RAG, MCP, AI agents, orchestration and modern GenAI application development.",
  },
  {
    icon: TerminalSquare,
    title: "Backend Engineering",
    description:
      "Strengthen practical understanding of APIs, services, databases, caching, queues, concurrency, reliability and production systems.",
  },
  {
    icon: GraduationCap,
    title: "Interview Preparation",
    description:
      "Prepare for software engineering and GenAI interviews using structured explanations, trade-offs, examples and real design problems.",
  },
  {
    icon: Bot,
    title: "AI Agents",
    description:
      "Learn agent architecture, tools, sessions, memory, orchestration, MCP, retrieval and production AI workflows.",
  },
];

const learningPrinciples = [
  {
    icon: Lightbulb,
    title: "Understand Why",
    description:
      "We first explain why a concept or architecture exists before discussing implementation.",
  },
  {
    icon: Layers3,
    title: "See the Architecture",
    description:
      "Diagrams and flows connect individual concepts into complete systems.",
  },
  {
    icon: FileCode2,
    title: "Move to Implementation",
    description:
      "Concepts are connected with code, APIs, commands and implementation examples wherever appropriate.",
  },
  {
    icon: ShieldCheck,
    title: "Think About Production",
    description:
      "Scalability, failures, reliability, security, concurrency and trade-offs are treated as part of engineering.",
  },
];

const audience = [
  "Software Developers",
  "Backend Engineers",
  "Java Developers",
  "GenAI Engineers",
  "AI Engineers",
  "Software Engineering Students",
  "System Design Learners",
  "Interview Candidates",
];

const approach = [
  {
    icon: Target,
    title: "Focused Content",
    text: "Topics are structured around concepts developers actually encounter while learning, building systems and preparing for interviews.",
  },
  {
    icon: BookOpen,
    title: "Structured Learning",
    text: "Books move from fundamentals to architecture, implementation, examples and practical problems.",
  },
  {
    icon: Sparkles,
    title: "Continuous Improvement",
    text: "Our resources continue evolving as technologies, engineering practices and developer learning needs change.",
  },
];

const heroTopics = [
  [Network, "System Design", "HLD, architecture, scalability and distributed systems."],
  [Code2, "Low-Level Design", "OOP, SOLID, design patterns and Java."],
  [Database, "RAG", "Embeddings, vector databases and retrieval."],
  [Workflow, "MCP", "Clients, servers, transports and integrations."],
  [Bot, "AI Agents", "Google ADK, orchestration and agent systems."],
];

const marqueeTopics = [
  "System Design",
  "High-Level Design",
  "Low-Level Design",
  "Java",
  "Backend Engineering",
  "RAG Pipeline",
  "MCP",
  "Google ADK",
  "AI Agents",
  "Interview Preparation",
];

/* -------------------------------------------------------------------------- */
/* Animation helpers                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Content fades + un-blurs into view when it enters the viewport and
 * dissolves again when it leaves (once: false) — scrolling up or down
 * makes sections appear and disappear.
 */
const Reveal = ({
  children,
  className = "",
  delay = 0,
  x = 0,
  y = 56,
  scale = 0.95,
  amount = 0.15,
}) => {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        x: x * 0.35,
        y: y * 0.4,
        scale: 1 - (1 - scale) * 0.4,
        filter: "blur(4px)",
      }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: false, amount }}
      transition={{ duration: 0.45, delay: delay * 0.4, ease: SOFT_EASE }}
    >
      {children}
    </motion.div>
  );
};

const Counter = ({ value, suffix = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.6 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return undefined;
    }

    if (!inView) {
      setDisplay(0);
      return undefined;
    }

    const controls = animate(0, value, {
      duration: 1.6,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
};

const Eyebrow = ({ children, t, center = false }) => (
  <span
    className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] ${t.eyebrow} ${
      center ? "justify-center" : ""
    }`}
  >
    <span className="h-px w-8 bg-gradient-to-r from-orange-500 to-transparent" />
    {children}
  </span>
);

const GradientText = ({ children }) => (
  <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 bg-clip-text text-transparent">
    {children}
  </span>
);

const OperatorRow = ({ icon: Icon, label, t, children }) => (
  <div className={`flex items-start gap-4 rounded-2xl border p-4 ${t.innerCard}`}>
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.iconBox}`}
    >
      <Icon size={20} />
    </div>

    <div className="min-w-0">
      <p
        className={`text-[11px] font-black uppercase tracking-[0.14em] ${t.eyebrow}`}
      >
        {label}
      </p>

      <div className={`mt-1 break-words text-sm font-bold leading-6 sm:text-base ${t.h}`}>
        {children}
      </div>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const AboutPage = () => {
  const [theme, setTheme] = useState(getStoredTheme);
  const isDark = theme === "dark";
  const reduce = useReducedMotion();

  /* Theme tokens: one place for light + dark classes */
  const t = isDark
    ? {
        page: "bg-[#0c0907] text-stone-100",
        h: "text-white",
        p: "text-stone-400",
        muted: "text-stone-500",
        eyebrow: "text-orange-400",
        alt: "bg-[#120d0a]",
        card: "border-orange-500/10 bg-stone-900/60 backdrop-blur-sm",
        cardHover:
          "hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10",
        innerCard: "border-orange-500/10 bg-stone-950/70",
        iconBox: "bg-orange-500/10 text-orange-400",
        chip: "border-orange-500/20 bg-orange-500/10 text-orange-300",
        ghostBtn:
          "border-orange-500/30 bg-stone-900/70 text-stone-100 hover:bg-orange-500/10",
        border: "border-orange-500/10",
        glowA: "bg-orange-500/20",
        glowB: "bg-amber-500/10",
        grid: "rgba(251,146,60,0.07)",
      }
    : {
        page: "bg-[#fffaf5] text-stone-900",
        h: "text-stone-950",
        p: "text-stone-600",
        muted: "text-stone-500",
        eyebrow: "text-orange-600",
        alt: "bg-orange-50/70",
        card: "border-orange-100 bg-white shadow-sm shadow-orange-100/60",
        cardHover:
          "hover:border-orange-300 hover:shadow-2xl hover:shadow-orange-200/60",
        innerCard: "border-orange-100 bg-orange-50/50",
        iconBox: "bg-orange-100 text-orange-600",
        chip: "border-orange-200 bg-orange-50 text-orange-700",
        ghostBtn:
          "border-orange-200 bg-white text-stone-800 hover:border-orange-400 hover:bg-orange-50",
        border: "border-orange-100",
        glowA: "bg-orange-300/40",
        glowB: "bg-amber-200/50",
        grid: "rgba(234,88,12,0.08)",
      };

  /* Theme sync with the rest of the site */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    const syncTheme = () => setTheme(getStoredTheme());

    const handleStorage = (event) => {
      if (event.key === THEME_KEY) syncTheme();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(THEME_EVENT, syncTheme);
    syncTheme();

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(THEME_EVENT, syncTheme);
    };
  }, []);

  /* Page scroll progress bar */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });

  /* Hero parallax */
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroTextY = useTransform(heroProgress, [0, 1], [0, 120]);
  const heroCardY = useTransform(heroProgress, [0, 1], [0, -80]);
  const heroFade = useTransform(heroProgress, [0, 0.9], [1, 0.15]);
  const glowY = useTransform(heroProgress, [0, 1], [0, 220]);

  /* "How we write" timeline that draws itself as you scroll */
  const timelineRef = useRef(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start 75%", "end 55%"],
  });
  const timelineScale = useSpring(timelineProgress, {
    stiffness: 100,
    damping: 24,
  });

  /* Mission image parallax */
  const missionRef = useRef(null);
  const { scrollYProgress: missionProgress } = useScroll({
    target: missionRef,
    offset: ["start end", "end start"],
  });
  const missionImgY = useTransform(missionProgress, [0, 1], ["-8%", "8%"]);

  const stats = [
    { value: books.length, label: "Developer Books" },
    { value: learningAreas.length, label: "Learning Areas" },
    { value: learningPrinciples.length, label: "Learning Principles" },
    { value: audience.length, label: "Learner Groups" },
  ];

  /* Structured data (operator details only when real values exist) */
  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Target Trek creates practical developer books and technical learning resources covering System Design, Low-Level Design, Backend Engineering, Generative AI, RAG, MCP, Google ADK and software engineering interviews.",
    logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.ico` },
    email: SUPPORT_EMAIL,
    sameAs: [
      "https://www.facebook.com/targettreks/",
      "https://www.linkedin.com/company/target-trek/",
    ],
    knowsAbout: [
      "Software Engineering",
      "System Design",
      "High-Level Design",
      "Low-Level Design",
      "Java",
      "Backend Engineering",
      "Generative AI",
      "Retrieval-Augmented Generation",
      "Model Context Protocol",
      "Google ADK",
      "AI Agents",
      "Software Engineering Interviews",
    ],
  };

  if (OPERATOR_NAME) {
    organization.founder = { "@type": "Person", name: OPERATOR_NAME };
  }
  if (OPERATOR_MOBILE) {
    organization.telephone = OPERATOR_MOBILE;
  }
  if (OPERATOR_ADDRESS) {
    organization.address = {
      "@type": "PostalAddress",
      streetAddress: OPERATOR_ADDRESS.replace(/\s*\n\s*/g, ", "),
    };
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "AboutPage",
        "@id": `${CANONICAL_URL}#webpage`,
        url: CANONICAL_URL,
        name: SEO_TITLE,
        description: SEO_DESCRIPTION,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: { "@id": `${CANONICAL_URL}#breadcrumb` },
        primaryImageOfPage: { "@type": "ImageObject", url: ABOUT_IMAGE },
        inLanguage: "en",
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${CANONICAL_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "About Target Trek",
            item: CANONICAL_URL,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "Target Trek Developer Books",
        itemListElement: books.map((book, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Book",
            name: book.title,
            description: book.description,
            publisher: { "@id": `${SITE_URL}/#organization` },
            inLanguage: "en",
            genre: book.category,
          },
        })),
      },
    ],
  };

  return (
    <div
      className={`relative min-h-screen overflow-x-clip pt-16 transition-colors duration-500 md:pt-20 ${t.page}`}
    >
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="author" content={SITE_NAME} />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="theme-color" content={isDark ? "#0c0907" : "#fffaf5"} />
        <link rel="canonical" href={CANONICAL_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={CANONICAL_URL} />
        <meta property="og:image" content={ABOUT_IMAGE} />
        <meta
          property="og:image:alt"
          content="Target Trek developer books covering system design, GenAI and software engineering"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        <meta name="twitter:image" content={ABOUT_IMAGE} />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Scroll progress */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"
      />

      <main>
        {/* ================================================================ */}
        {/* HERO                                                             */}
        {/* ================================================================ */}
        <section
          ref={heroRef}
          className={`relative overflow-hidden border-b ${t.border}`}
        >
          {/* Grid texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`,
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at 50% 30%, black 20%, transparent 75%)",
            }}
          />

          {/* Glows */}
          <motion.div
            aria-hidden="true"
            style={reduce ? undefined : { y: glowY }}
            className={`pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full blur-[110px] ${t.glowA}`}
          />
          <motion.div
            aria-hidden="true"
            animate={
              reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }
            }
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className={`pointer-events-none absolute -bottom-52 -left-40 h-[480px] w-[480px] rounded-full blur-[110px] ${t.glowB}`}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <motion.nav
              aria-label="Breadcrumb"
              initial={reduce ? false : { opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className={`mb-9 flex items-center gap-2 text-xs font-semibold ${t.muted}`}
            >
              <NavLink to="/" className="transition hover:text-orange-500">
                Home
              </NavLink>
              <span>/</span>
              <span className="text-orange-500">About</span>
            </motion.nav>

            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
              {/* Hero text */}
              <motion.div
                style={reduce ? undefined : { y: heroTextY, opacity: heroFade }}
              >
                <motion.div
                  initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.15em] ${t.chip}`}
                >
                  <BookOpen size={14} />
                  Developer Books &amp; Learning
                </motion.div>

                <h1
                  className={`mt-7 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${t.h}`}
                >
                  {["Practical", "books", "for"].map((word, i) => (
                    <motion.span
                      key={word}
                      initial={reduce ? false : { opacity: 0, y: 40, filter: "blur(10px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: EASE }}
                      className="mr-3 inline-block"
                    >
                      {word}
                    </motion.span>
                  ))}

                  <motion.span
                    initial={reduce ? false : { opacity: 0, y: 40, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.9, delay: 0.55, ease: EASE }}
                    className="mt-2 block"
                  >
                    <GradientText>modern software developers.</GradientText>
                  </motion.span>
                </h1>

                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
                  className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${t.p}`}
                >
                  Target Trek is a developer-learning platform creating
                  structured books and technical resources around System
                  Design, Backend Engineering, Generative AI, AI Agents and
                  software engineering interviews.
                </motion.p>

                <motion.p
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
                  className={`mt-4 max-w-2xl text-base leading-8 ${t.p}`}
                >
                  Our goal is to make complex engineering concepts easier to
                  understand by connecting theory, architecture,
                  implementation, trade-offs and real-world applications.
                </motion.p>

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.9, ease: EASE }}
                  className="mt-8 flex flex-col gap-3 sm:flex-row"
                >
                  <NavLink
                    to="/books"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40"
                  >
                    Explore Our Books
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </NavLink>

                  <NavLink
                    to="/resources"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold transition hover:-translate-y-0.5 ${t.ghostBtn}`}
                  >
                    Free Resources
                    <Search size={17} />
                  </NavLink>
                </motion.div>
              </motion.div>

              {/* Hero card */}
              <motion.div
                style={reduce ? undefined : { y: heroCardY }}
                className="relative"
              >
                <div
                  aria-hidden="true"
                  className={`absolute inset-6 rounded-full blur-[90px] ${t.glowA}`}
                />

                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 60, rotate: 3, scale: 0.92 }}
                  animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                  transition={{ duration: 1, delay: 0.4, ease: EASE }}
                >
                  <motion.div
                    animate={reduce ? undefined : { y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className={`relative rounded-[32px] border p-5 shadow-2xl sm:p-7 ${t.card} ${
                      isDark ? "shadow-orange-500/10" : "shadow-orange-200/60"
                    }`}
                  >
                    <div className={`rounded-[24px] border p-6 sm:p-7 ${t.innerCard}`}>
                      <span
                        className={`text-[11px] font-black uppercase tracking-[0.17em] ${t.eyebrow}`}
                      >
                        Target Trek Library
                      </span>

                      <h2 className={`mt-2 text-2xl font-black ${t.h}`}>
                        Learn concepts. Understand architecture. Build better
                        systems.
                      </h2>

                      <div className="mt-7 space-y-3">
                        {heroTopics.map(([Icon, title, text], i) => (
                          <motion.div
                            key={title}
                            initial={reduce ? false : { opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 + i * 0.1, ease: EASE }}
                            whileHover={reduce ? undefined : { x: 6 }}
                            className={`flex gap-4 rounded-2xl border p-4 ${t.card}`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${t.iconBox}`}
                            >
                              <Icon size={19} />
                            </div>

                            <div>
                              <h3 className={`text-sm font-black ${t.h}`}>{title}</h3>
                              <p className={`mt-1 text-xs leading-5 ${t.muted}`}>{text}</p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* MARQUEE                                                          */}
        {/* ================================================================ */}
        <section
          aria-label="Topics we cover"
          className={`overflow-hidden border-b py-5 ${t.border} ${t.alt}`}
        >
          <motion.div
            className="flex w-max gap-4"
            animate={reduce ? undefined : { x: ["0%", "-50%"] }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          >
            {[...marqueeTopics, ...marqueeTopics].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className={`flex items-center gap-3 whitespace-nowrap rounded-full border px-5 py-2 text-sm font-bold ${t.chip}`}
              >
                <Sparkles size={14} />
                {item}
              </span>
            ))}
          </motion.div>
        </section>

        {/* ================================================================ */}
        {/* STATS                                                            */}
        {/* ================================================================ */}
        <section className="py-14 lg:py-16">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08} y={36}>
                <div
                  className={`rounded-3xl border p-6 text-center transition duration-300 hover:-translate-y-1 ${t.card} ${t.cardHover}`}
                >
                  <div className="text-4xl font-black sm:text-5xl">
                    <GradientText>
                      <Counter value={stat.value} />
                    </GradientText>
                  </div>
                  <p className={`mt-2 text-sm font-bold ${t.p}`}>{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ================================================================ */}
        {/* BOOKS                                                            */}
        {/* ================================================================ */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-3xl text-center">
              <Eyebrow t={t} center>
                Our Books
              </Eyebrow>

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${t.h}`}
              >
                Developer books built around <GradientText>practical engineering</GradientText>
              </h2>

              <p className={`mt-5 text-base leading-8 sm:text-lg ${t.p}`}>
                Our books focus on topics developers repeatedly encounter while
                building software systems, learning modern AI technologies and
                preparing for technical interviews.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-6 lg:grid-cols-2">
              {books.map((book, index) => {
                const Icon = book.icon;
                const featured = index === 0;

                return (
                  <Reveal
                    key={book.title}
                    delay={(index % 2) * 0.1}
                    x={featured ? 0 : index % 2 ? 60 : -60}
                    className={featured ? "lg:col-span-2" : ""}
                  >
                    <article
                      className={`group relative h-full overflow-hidden rounded-[28px] border p-7 transition duration-300 hover:-translate-y-1.5 sm:p-8 ${t.card} ${t.cardHover}`}
                    >
                      {/* Hover glow */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-orange-500/0 blur-3xl transition duration-500 group-hover:bg-orange-500/20"
                      />

                      <div
                        className={`relative ${
                          featured ? "lg:grid lg:grid-cols-[.8fr_1.2fr] lg:gap-12" : ""
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div
                              className={`flex h-[54px] w-[54px] items-center justify-center rounded-2xl transition duration-300 group-hover:rotate-6 group-hover:scale-110 ${t.iconBox}`}
                            >
                              <Icon size={26} />
                            </div>

                            <span
                              className={`font-mono text-xs font-black ${t.muted}`}
                            >
                              {String(index + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <p
                            className={`mt-6 text-[10px] font-black uppercase tracking-[0.16em] ${t.eyebrow}`}
                          >
                            {book.category}
                          </p>

                          <h3 className={`mt-2 text-2xl font-black tracking-tight ${t.h}`}>
                            {book.title}
                          </h3>

                          <p className={`mt-4 text-sm leading-7 ${t.p}`}>
                            {book.description}
                          </p>
                        </div>

                        <div
                          className={`grid gap-3 sm:grid-cols-2 ${
                            featured ? "mt-7 lg:mt-0" : "mt-7"
                          }`}
                        >
                          {book.topics.map((topic) => (
                            <div
                              key={topic}
                              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition duration-300 group-hover:translate-x-0.5 ${t.chip}`}
                            >
                              <CheckCircle2 size={16} className="shrink-0" />
                              {topic}
                            </div>
                          ))}
                        </div>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>

            <Reveal className="mt-12 text-center">
              <NavLink
                to="/books"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5"
              >
                Browse All Books
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              </NavLink>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* WHAT WE COVER                                                    */}
        {/* ================================================================ */}
        <section className={`border-y py-16 lg:py-24 ${t.border} ${t.alt}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-3xl text-center">
              <Eyebrow t={t} center>
                What We Cover
              </Eyebrow>

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${t.h}`}
              >
                Learning areas for <GradientText>modern developers</GradientText>
              </h2>

              <p className={`mt-5 text-base leading-8 ${t.p}`}>
                Target Trek focuses on engineering areas where developers need
                both conceptual understanding and practical implementation
                knowledge.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {learningAreas.map((item, i) => {
                const Icon = item.icon;

                return (
                  <Reveal key={item.title} delay={(i % 3) * 0.1} y={48}>
                    <article
                      className={`group h-full rounded-3xl border p-6 transition duration-300 hover:-translate-y-1.5 ${t.card} ${t.cardHover}`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition duration-300 group-hover:bg-orange-500 group-hover:text-white ${t.iconBox}`}
                      >
                        <Icon size={23} />
                      </div>

                      <h3 className={`mt-5 text-xl font-black ${t.h}`}>{item.title}</h3>

                      <p className={`mt-3 text-sm leading-7 ${t.p}`}>{item.description}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* HOW WE WRITE                                                     */}
        {/* ================================================================ */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-[.85fr_1.15fr]">
              <Reveal x={-50} y={20} className="lg:sticky lg:top-28">
                <Eyebrow t={t}>How We Write</Eyebrow>

                <h2
                  className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${t.h}`}
                >
                  Learn the concept, understand the flow,{" "}
                  <GradientText>then implement it.</GradientText>
                </h2>

                <p className={`mt-5 max-w-xl text-base leading-8 ${t.p}`}>
                  We aim to avoid presenting engineering concepts as isolated
                  definitions. Instead, our books connect theory, architecture,
                  implementation and production considerations.
                </p>
              </Reveal>

              <div ref={timelineRef} className="relative pl-10 sm:pl-12">
                {/* Track */}
                <div
                  aria-hidden="true"
                  className={`absolute bottom-4 left-[15px] top-4 w-0.5 rounded-full sm:left-[19px] ${
                    isDark ? "bg-stone-800" : "bg-orange-100"
                  }`}
                />
                {/* Filling line */}
                <motion.div
                  aria-hidden="true"
                  style={reduce ? { scaleY: 1 } : { scaleY: timelineScale }}
                  className="absolute bottom-4 left-[15px] top-4 w-0.5 origin-top rounded-full bg-gradient-to-b from-orange-500 to-amber-400 sm:left-[19px]"
                />

                <div className="space-y-6">
                  {learningPrinciples.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <Reveal key={item.title} x={50} y={20}>
                        <div className="relative">
                          <span
                            className={`absolute -left-10 top-6 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-black sm:-left-12 sm:h-10 sm:w-10 ${
                              isDark
                                ? "border-orange-500 bg-stone-950 text-orange-400"
                                : "border-orange-500 bg-white text-orange-600"
                            }`}
                          >
                            {index + 1}
                          </span>

                          <article
                            className={`rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 ${t.card} ${t.cardHover}`}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${t.iconBox}`}
                              >
                                <Icon size={21} />
                              </div>

                              <h3 className={`text-lg font-black ${t.h}`}>{item.title}</h3>
                            </div>

                            <p className={`mt-4 text-sm leading-7 ${t.p}`}>
                              {item.description}
                            </p>
                          </article>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* MISSION & VISION                                                 */}
        {/* ================================================================ */}
        <section
          ref={missionRef}
          className={`border-y py-16 lg:py-24 ${t.border} ${t.alt}`}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <Reveal x={-60} y={20} scale={0.9}>
              <div className="relative">
                <div
                  aria-hidden="true"
                  className={`absolute -inset-4 rounded-[36px] bg-gradient-to-br ${
                    isDark
                      ? "from-orange-500/20 to-amber-500/5"
                      : "from-orange-200 to-amber-100"
                  }`}
                />

                <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] shadow-2xl shadow-orange-500/10">
                  <motion.img
                    src={ABOUT_IMAGE}
                    alt="Developer learning and software engineering books by Target Trek"
                    loading="lazy"
                    style={reduce ? undefined : { y: missionImgY, scale: 1.2 }}
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-orange-600/30 via-transparent to-transparent mix-blend-multiply"
                  />
                </div>
              </div>
            </Reveal>

            <Reveal x={60} y={20}>
              <Eyebrow t={t}>Our Mission</Eyebrow>

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${t.h}`}
              >
                Make difficult engineering concepts{" "}
                <GradientText>easier to learn.</GradientText>
              </h2>

              <p className={`mt-5 text-base leading-8 sm:text-lg ${t.p}`}>
                Software engineering evolves quickly. Developers are expected to
                understand architecture, system design, backend engineering,
                distributed systems and increasingly AI-powered applications.
              </p>

              <p className={`mt-4 text-base leading-8 ${t.p}`}>
                Target Trek aims to organize those concepts into practical
                learning resources that are easier to revise, understand and
                apply.
              </p>

              <div className={`mt-9 rounded-3xl border p-6 ${t.card}`}>
                <Eyebrow t={t}>Our Vision</Eyebrow>

                <h3
                  className={`mt-3 flex items-center gap-3 text-2xl font-black ${t.h}`}
                >
                  <Rocket size={26} className="shrink-0 text-orange-500" />A
                  practical developer-learning library
                </h3>

                <p className={`mt-4 leading-8 ${t.p}`}>
                  Our long-term goal is to build a structured library covering
                  the engineering concepts developers need across backend
                  development, system design, AI and technical interviews.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* AUDIENCE                                                         */}
        {/* ================================================================ */}
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 py-16 text-white lg:py-24">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/15 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-black/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
              <Reveal x={-50} y={20}>
                <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-orange-100">
                  <span className="h-px w-8 bg-white/60" />
                  Who Target Trek Is For
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                  Built for developers who want practical depth.
                </h2>

                <p className="mt-5 max-w-xl leading-8 text-orange-50/90">
                  Whether you are preparing for an interview, learning system
                  design, strengthening backend fundamentals or exploring GenAI,
                  our resources are designed around developer learning.
                </p>
              </Reveal>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {audience.map((item, i) => (
                  <Reveal key={item} delay={(i % 2) * 0.08} y={30} scale={0.9}>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/25">
                      <CheckCircle2 size={18} className="shrink-0" />
                      <span className="text-sm font-bold">{item}</span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* APPROACH                                                         */}
        {/* ================================================================ */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-3xl text-center">
              <Eyebrow t={t} center>
                Our Approach
              </Eyebrow>

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${t.h}`}
              >
                Practical learning over{" "}
                <GradientText>isolated definitions</GradientText>
              </h2>
            </Reveal>

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {approach.map((item, i) => {
                const Icon = item.icon;

                return (
                  <Reveal key={item.title} delay={i * 0.12} y={60}>
                    <article
                      className={`group h-full rounded-3xl border p-8 text-center transition duration-300 hover:-translate-y-2 ${t.card} ${t.cardHover}`}
                    >
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
                        <Icon size={29} />
                      </div>

                      <h3 className={`mt-6 text-xl font-black ${t.h}`}>{item.title}</h3>

                      <p className={`mt-3 text-sm leading-7 ${t.p}`}>{item.text}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* BUSINESS INFORMATION (only when .env has real values)            */}
        {/* ================================================================ */}
        {HAS_OPERATOR_INFO && (
          <section className={`border-y py-16 lg:py-20 ${t.border} ${t.alt}`}>
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
              <Reveal scale={0.92}>
                <div
                  className={`relative overflow-hidden rounded-[32px] border p-7 sm:p-10 ${t.card}`}
                >
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl ${t.glowA}`}
                  />

                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${t.iconBox}`}
                      >
                        <BadgeCheck size={28} />
                      </div>

                      <div>
                        <Eyebrow t={t}>Business Information</Eyebrow>

                        <h2 className={`mt-2 text-2xl font-black sm:text-3xl ${t.h}`}>
                          Who is behind Target Trek
                        </h2>

                        <p className={`mt-3 max-w-2xl text-sm leading-7 sm:text-base ${t.p}`}>
                          Target Trek focuses on creating and improving
                          developer-learning resources covering software
                          engineering, System Design, Backend Engineering and
                          Generative AI. Here is how to reach the people
                          running it.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-8 grid gap-4 ${
                        OPERATOR_ADDRESS ? "md:grid-cols-2" : "sm:grid-cols-2"
                      }`}
                    >
                      {OPERATOR_NAME && (
                        <OperatorRow
                          icon={UserRound}
                          label="Target Trek is operated by"
                          t={t}
                        >
                          {OPERATOR_NAME}
                        </OperatorRow>
                      )}

                      {OPERATOR_MOBILE && (
                        <OperatorRow icon={Phone} label="Mobile" t={t}>
                          <a
                            href={OPERATOR_PHONE_HREF}
                            className="transition hover:text-orange-500"
                          >
                            {OPERATOR_MOBILE}
                          </a>
                        </OperatorRow>
                      )}

                      {OPERATOR_ADDRESS && (
                        <div className="md:col-span-2">
                          <OperatorRow icon={MapPin} label="Business address" t={t}>
                            <address className="whitespace-pre-line not-italic">
                              {OPERATOR_ADDRESS}
                            </address>
                          </OperatorRow>
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <OperatorRow icon={Mail} label="Support email" t={t}>
                          <a
                            href={`mailto:${SUPPORT_EMAIL}`}
                            className="transition hover:text-orange-500"
                          >
                            {SUPPORT_EMAIL}
                          </a>
                        </OperatorRow>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        )}

        {/* ================================================================ */}
        {/* SUPPORT                                                          */}
        {/* ================================================================ */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div
                className={`flex flex-col gap-6 rounded-3xl border p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9 ${
                  isDark
                    ? "border-orange-500/20 bg-orange-500/5"
                    : "border-orange-200 bg-orange-50"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-black text-orange-500">
                    <Mail size={18} />
                    Customer Support
                  </div>

                  <h2 className={`mt-2 text-2xl font-black ${t.h}`}>
                    Need help with a book or purchase?
                  </h2>

                  <p className={`mt-2 text-sm ${t.p}`}>
                    Contact us for ebook access, payment, download or product
                    support.
                  </p>
                </div>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className={`inline-flex shrink-0 items-center justify-center gap-2 break-all rounded-xl border px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${t.ghostBtn}`}
                >
                  <Mail size={17} />
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================================================================ */}
        {/* FINAL CTA                                                        */}
        {/* ================================================================ */}
        <section className="relative overflow-hidden bg-[#0c0907] py-20 text-white lg:py-28">
          <motion.div
            aria-hidden="true"
            animate={
              reduce ? undefined : { scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }
            }
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/30 blur-[120px]"
          />

          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <Reveal>
              <BookOpen size={40} className="mx-auto text-orange-400" />

              <span className="mt-5 block text-xs font-black uppercase tracking-[0.18em] text-orange-300">
                Keep Learning
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Explore the Target Trek{" "}
                <span className="bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                  developer library
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
                Learn System Design, Low-Level Design, Backend Engineering, RAG,
                MCP, Google ADK and modern GenAI concepts through practical
                developer-focused resources.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <NavLink
                  to="/books"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 transition hover:-translate-y-0.5"
                >
                  Explore Books
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </NavLink>

                <NavLink
                  to="/resources"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Free Resources
                  <GraduationCap size={17} />
                </NavLink>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
