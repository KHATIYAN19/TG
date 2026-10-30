import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Helmet } from "react-helmet";

import {
  ArrowRight,
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
  Network,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TerminalSquare,
  UserRound,
  Users,
  Workflow,
} from "lucide-react";

import {
  FaFacebookF,
  FaLinkedinIn,
} from "react-icons/fa";

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const CANONICAL_URL = `${SITE_URL}/about`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

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

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = localStorage.getItem(THEME_KEY);

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return "light";
};

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
    accent: "blue",
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
    accent: "violet",
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
    accent: "emerald",
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
    accent: "amber",
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
    accent: "pink",
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

const getAccentClasses = (accent, isDark) => {
  const light = {
    blue: {
      icon: "bg-blue-50 text-blue-600",
      badge: "border-blue-100 bg-blue-50 text-blue-700",
      hover: "hover:border-blue-300",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600",
      badge: "border-violet-100 bg-violet-50 text-violet-700",
      hover: "hover:border-violet-300",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600",
      badge: "border-emerald-100 bg-emerald-50 text-emerald-700",
      hover: "hover:border-emerald-300",
    },
    amber: {
      icon: "bg-amber-50 text-amber-600",
      badge: "border-amber-100 bg-amber-50 text-amber-700",
      hover: "hover:border-amber-300",
    },
    pink: {
      icon: "bg-pink-50 text-pink-600",
      badge: "border-pink-100 bg-pink-50 text-pink-700",
      hover: "hover:border-pink-300",
    },
  };

  const dark = {
    blue: {
      icon: "bg-blue-500/10 text-blue-400",
      badge:
        "border-blue-500/20 bg-blue-500/10 text-blue-300",
      hover: "hover:border-blue-500/40",
    },
    violet: {
      icon: "bg-violet-500/10 text-violet-400",
      badge:
        "border-violet-500/20 bg-violet-500/10 text-violet-300",
      hover: "hover:border-violet-500/40",
    },
    emerald: {
      icon: "bg-emerald-500/10 text-emerald-400",
      badge:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
      hover: "hover:border-emerald-500/40",
    },
    amber: {
      icon: "bg-amber-500/10 text-amber-400",
      badge:
        "border-amber-500/20 bg-amber-500/10 text-amber-300",
      hover: "hover:border-amber-500/40",
    },
    pink: {
      icon: "bg-pink-500/10 text-pink-400",
      badge:
        "border-pink-500/20 bg-pink-500/10 text-pink-300",
      hover: "hover:border-pink-500/40",
    },
  };

  const palette = isDark ? dark : light;

  return palette[accent] || palette.blue;
};

const AboutPage = () => {
  const [theme, setTheme] = useState(getStoredTheme);

  const isDark = theme === "dark";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    const syncTheme = () => {
      setTheme(getStoredTheme());
    };

    const handleStorage = (event) => {
      if (event.key === THEME_KEY) {
        syncTheme();
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(THEME_EVENT, syncTheme);

    syncTheme();

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        THEME_EVENT,
        syncTheme
      );
    };
  }, []);

  const structuredData = {
    "@context": "https://schema.org",

    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,

        name: SITE_NAME,

        url: SITE_URL,

        description:
          "Target Trek creates practical developer books and technical learning resources covering System Design, Low-Level Design, Backend Engineering, Generative AI, RAG, MCP, Google ADK and software engineering interviews.",

        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/favicon.ico`,
        },

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
      },

      {
        "@type": "WebSite",

        "@id": `${SITE_URL}/#website`,

        url: SITE_URL,

        name: SITE_NAME,

        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },

        inLanguage: "en",
      },

      {
        "@type": "AboutPage",

        "@id": `${CANONICAL_URL}#webpage`,

        url: CANONICAL_URL,

        name: SEO_TITLE,

        description: SEO_DESCRIPTION,

        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },

        about: {
          "@id": `${SITE_URL}/#organization`,
        },

        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },

        breadcrumb: {
          "@id": `${CANONICAL_URL}#breadcrumb`,
        },

        primaryImageOfPage: {
          "@type": "ImageObject",
          url: ABOUT_IMAGE,
        },

        inLanguage: "en",
      },

      {
        "@type": "BreadcrumbList",

        "@id": `${CANONICAL_URL}#breadcrumb`,

        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },

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

        itemListElement: books.map(
          (book, index) => ({
            "@type": "ListItem",

            position: index + 1,

            item: {
              "@type": "Book",

              name: book.title,

              description: book.description,

              publisher: {
                "@id": `${SITE_URL}/#organization`,
              },

              inLanguage: "en",

              genre: book.category,
            },
          })
        ),
      },
    ],
  };

  return (
    <div
      className={`min-h-screen pt-16 transition-colors duration-300 md:pt-20 ${
        isDark
          ? "bg-slate-950 text-slate-100"
          : "bg-white text-slate-900"
      }`}
    >
      <Helmet>
        <title>{SEO_TITLE}</title>

        <meta
          name="description"
          content={SEO_DESCRIPTION}
        />

        <meta
          name="keywords"
          content={SEO_KEYWORDS}
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <meta
          name="author"
          content={SITE_NAME}
        />

        <meta
          name="application-name"
          content={SITE_NAME}
        />

        <meta
          name="theme-color"
          content={isDark ? "#020617" : "#ffffff"}
        />

        <link
          rel="canonical"
          href={CANONICAL_URL}
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content={SITE_NAME}
        />

        <meta
          property="og:locale"
          content="en_IN"
        />

        <meta
          property="og:title"
          content={SEO_TITLE}
        />

        <meta
          property="og:description"
          content={SEO_DESCRIPTION}
        />

        <meta
          property="og:url"
          content={CANONICAL_URL}
        />

        <meta
          property="og:image"
          content={ABOUT_IMAGE}
        />

        <meta
          property="og:image:alt"
          content="Target Trek developer books covering system design, GenAI and software engineering"
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={SEO_TITLE}
        />

        <meta
          name="twitter:description"
          content={SEO_DESCRIPTION}
        />

        <meta
          name="twitter:image"
          content={ABOUT_IMAGE}
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <main>
        {/* HERO */}
        <section
          className={`relative overflow-hidden border-b ${
            isDark
              ? "border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950 to-blue-950/40"
              : "border-slate-200 bg-gradient-to-br from-white via-blue-50/70 to-indigo-50"
          }`}
        >
          <div
            className={`pointer-events-none absolute -right-48 -top-48 h-[520px] w-[520px] rounded-full blur-3xl ${
              isDark
                ? "bg-blue-500/10"
                : "bg-blue-300/20"
            }`}
          />

          <div
            className={`pointer-events-none absolute -bottom-56 -left-36 h-[480px] w-[480px] rounded-full blur-3xl ${
              isDark
                ? "bg-indigo-500/10"
                : "bg-indigo-300/20"
            }`}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <nav
              aria-label="Breadcrumb"
              className={`mb-9 flex items-center gap-2 text-xs font-semibold ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              <NavLink
                to="/"
                className="transition hover:text-blue-500"
              >
                Home
              </NavLink>

              <span>/</span>

              <span
                className={
                  isDark
                    ? "text-slate-300"
                    : "text-slate-600"
                }
              >
                About
              </span>
            </nav>

            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.15em] ${
                    isDark
                      ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
                      : "border-blue-200 bg-white text-blue-700 shadow-sm"
                  }`}
                >
                  <BookOpen size={14} />

                  Developer Books & Learning
                </div>

                <h1
                  className={`mt-7 text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${
                    isDark
                      ? "text-white"
                      : "text-slate-950"
                  }`}
                >
                  Practical books for
                  <span className="mt-2 block text-blue-600">
                    modern software developers.
                  </span>
                </h1>

                <p
                  className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${
                    isDark
                      ? "text-slate-300"
                      : "text-slate-600"
                  }`}
                >
                  Target Trek is a developer-learning
                  platform creating structured books
                  and technical resources around
                  System Design, Backend Engineering,
                  Generative AI, AI Agents and
                  software engineering interviews.
                </p>

                <p
                  className={`mt-4 max-w-2xl text-base leading-8 ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  Our goal is to make complex
                  engineering concepts easier to
                  understand by connecting theory,
                  architecture, implementation,
                  trade-offs and real-world
                  applications.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <NavLink
                    to="/books"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
                  >
                    Explore Our Books
                    <ArrowRight size={17} />
                  </NavLink>

                  <NavLink
                    to="/resources"
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-bold transition ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    Free Resources
                    <Search size={17} />
                  </NavLink>
                </div>

                <div className="mt-9 flex flex-wrap gap-2">
                  {[
                    "System Design",
                    "LLD",
                    "Backend Engineering",
                    "RAG",
                    "MCP",
                    "Google ADK",
                    "AI Agents",
                  ].map((item) => (
                    <span
                      key={item}
                      className={`rounded-full border px-3 py-2 text-xs font-bold ${
                        isDark
                          ? "border-slate-700 bg-slate-900 text-slate-400"
                          : "border-slate-200 bg-white text-slate-600 shadow-sm"
                      }`}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hero Book Card */}
              <div className="relative">
                <div className="absolute inset-10 rounded-full bg-blue-500/10 blur-[90px]" />

                <div
                  className={`relative rounded-[32px] border p-5 shadow-2xl sm:p-7 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-blue-100 bg-white"
                  }`}
                >
                  <div
                    className={`rounded-[24px] border p-6 sm:p-7 ${
                      isDark
                        ? "border-slate-800 bg-slate-950"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <span className="text-[11px] font-black uppercase tracking-[0.17em] text-blue-600">
                      Target Trek Library
                    </span>

                    <h2
                      className={`mt-2 text-2xl font-black ${
                        isDark
                          ? "text-white"
                          : "text-slate-950"
                      }`}
                    >
                      Learn concepts. Understand
                      architecture. Build better
                      systems.
                    </h2>

                    <div className="mt-7 space-y-3">
                      {[
                        [
                          Network,
                          "System Design",
                          "HLD, architecture, scalability and distributed systems.",
                        ],

                        [
                          Code2,
                          "Low-Level Design",
                          "OOP, SOLID, design patterns and Java.",
                        ],

                        [
                          Database,
                          "RAG",
                          "Embeddings, vector databases and retrieval.",
                        ],

                        [
                          Workflow,
                          "MCP",
                          "Clients, servers, transports and integrations.",
                        ],

                        [
                          Bot,
                          "AI Agents",
                          "Google ADK, orchestration and agent systems.",
                        ],
                      ].map(
                        ([Icon, title, text]) => (
                          <div
                            key={title}
                            className={`flex gap-4 rounded-2xl border p-4 ${
                              isDark
                                ? "border-slate-800 bg-slate-900"
                                : "border-slate-200 bg-white"
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                isDark
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-blue-50 text-blue-600"
                              }`}
                            >
                              <Icon size={19} />
                            </div>

                            <div>
                              <h3
                                className={`text-sm font-black ${
                                  isDark
                                    ? "text-slate-100"
                                    : "text-slate-900"
                                }`}
                              >
                                {title}
                              </h3>

                              <p
                                className={`mt-1 text-xs leading-5 ${
                                  isDark
                                    ? "text-slate-500"
                                    : "text-slate-500"
                                }`}
                              >
                                {text}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PLATFORM INTRO */}
        <section
          className={`border-b py-8 ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 sm:px-6 md:grid-cols-5 lg:px-8">
            {[
              [Network, "System Design"],
              [Code2, "LLD"],
              [Database, "RAG"],
              [Workflow, "MCP"],
              [Bot, "AI Agents"],
            ].map(([Icon, text]) => (
              <div
                key={text}
                className={`flex items-center gap-3 text-sm font-bold ${
                  isDark
                    ? "text-slate-300"
                    : "text-slate-700"
                }`}
              >
                <Icon
                  size={19}
                  className="shrink-0 text-blue-600"
                />

                {text}
              </div>
            ))}
          </div>
        </section>

        {/* BOOKS */}
        <section
          className={`py-20 lg:py-24 ${
            isDark
              ? "bg-slate-950"
              : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Our Books
              </span>

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Developer books built around
                practical engineering
              </h2>

              <p
                className={`mt-5 text-base leading-8 sm:text-lg ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Our books focus on topics developers
                repeatedly encounter while building
                software systems, learning modern AI
                technologies and preparing for
                technical interviews.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {books.map((book, index) => {
                const Icon = book.icon;

                const accent =
                  getAccentClasses(
                    book.accent,
                    isDark
                  );

                return (
                  <article
                    key={book.title}
                    className={`rounded-[28px] border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                      isDark
                        ? `border-slate-800 bg-slate-900 ${accent.hover}`
                        : `border-slate-200 bg-white shadow-sm ${accent.hover}`
                    } ${
                      index === 0
                        ? "lg:col-span-2"
                        : ""
                    }`}
                  >
                    <div
                      className={
                        index === 0
                          ? "lg:grid lg:grid-cols-[.8fr_1.2fr] lg:gap-12"
                          : ""
                      }
                    >
                      <div>
                        <div
                          className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl ${accent.icon}`}
                        >
                          <Icon size={25} />
                        </div>

                        <p
                          className={`mt-6 text-[10px] font-black uppercase tracking-[0.16em] ${
                            isDark
                              ? "text-slate-500"
                              : "text-slate-400"
                          }`}
                        >
                          {book.category}
                        </p>

                        <h3
                          className={`mt-2 text-2xl font-black tracking-tight ${
                            isDark
                              ? "text-white"
                              : "text-slate-950"
                          }`}
                        >
                          {book.title}
                        </h3>

                        <p
                          className={`mt-4 text-sm leading-7 ${
                            isDark
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          {book.description}
                        </p>
                      </div>

                      <div
                        className={`grid gap-3 sm:grid-cols-2 ${
                          index === 0
                            ? "mt-7 lg:mt-0"
                            : "mt-7"
                        }`}
                      >
                        {book.topics.map(
                          (topic) => (
                            <div
                              key={topic}
                              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold ${accent.badge}`}
                            >
                              <CheckCircle2
                                size={16}
                                className="shrink-0"
                              />

                              {topic}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <NavLink
                to="/books"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white transition hover:bg-blue-700"
              >
                Browse All Books
                <ArrowRight size={17} />
              </NavLink>
            </div>
          </div>
        </section>

        {/* WHAT WE TEACH */}
        <section
          className={`py-20 lg:py-24 ${
            isDark
              ? "bg-slate-900"
              : "bg-slate-50"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                What We Cover
              </span>

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Learning areas for modern
                developers
              </h2>

              <p
                className={`mt-5 text-base leading-8 ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Target Trek focuses on engineering
                areas where developers need both
                conceptual understanding and
                practical implementation knowledge.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {learningAreas.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className={`rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      isDark
                        ? "border-slate-800 bg-slate-950 hover:border-blue-500/40"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        isDark
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      <Icon size={23} />
                    </div>

                    <h3
                      className={`mt-5 text-xl font-black ${
                        isDark
                          ? "text-white"
                          : "text-slate-950"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`mt-3 text-sm leading-7 ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW BOOKS ARE BUILT */}
        <section
          className={`py-20 lg:py-24 ${
            isDark
              ? "bg-slate-950"
              : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-12 lg:grid-cols-[.85fr_1.15fr]">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                  How We Write
                </span>

                <h2
                  className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${
                    isDark
                      ? "text-white"
                      : "text-slate-950"
                  }`}
                >
                  Learn the concept, understand the
                  flow, then implement it.
                </h2>

                <p
                  className={`mt-5 max-w-xl text-base leading-8 ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  We aim to avoid presenting
                  engineering concepts as isolated
                  definitions. Instead, our books
                  connect theory, architecture,
                  implementation and production
                  considerations.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {learningPrinciples.map(
                  (item, index) => {
                    const Icon = item.icon;

                    return (
                      <article
                        key={item.title}
                        className={`rounded-3xl border p-6 ${
                          isDark
                            ? "border-slate-800 bg-slate-900"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                              isDark
                                ? "bg-blue-500/10 text-blue-400"
                                : "bg-blue-50 text-blue-600"
                            }`}
                          >
                            <Icon size={21} />
                          </div>

                          <span
                            className={`font-mono text-xs font-black ${
                              isDark
                                ? "text-slate-700"
                                : "text-slate-300"
                            }`}
                          >
                            0{index + 1}
                          </span>
                        </div>

                        <h3
                          className={`mt-5 text-lg font-black ${
                            isDark
                              ? "text-white"
                              : "text-slate-950"
                          }`}
                        >
                          {item.title}
                        </h3>

                        <p
                          className={`mt-2 text-sm leading-7 ${
                            isDark
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          {item.description}
                        </p>
                      </article>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MISSION */}
        <section
          className={`py-20 lg:py-24 ${
            isDark
              ? "bg-slate-900"
              : "bg-slate-50"
          }`}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="relative">
              <div
                className={`absolute -inset-5 rounded-[36px] ${
                  isDark
                    ? "bg-blue-500/10"
                    : "bg-gradient-to-br from-blue-100 to-indigo-100"
                }`}
              />

              <img
                src={ABOUT_IMAGE}
                alt="Developer learning and software engineering books by Target Trek"
                loading="lazy"
                className="relative aspect-[4/3] w-full rounded-[28px] object-cover shadow-xl"
              />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Our Mission
              </span>

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Make difficult engineering concepts
                easier to learn.
              </h2>

              <p
                className={`mt-5 text-base leading-8 sm:text-lg ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Software engineering evolves
                quickly. Developers are expected to
                understand architecture, system
                design, backend engineering,
                distributed systems and increasingly
                AI-powered applications.
              </p>

              <p
                className={`mt-4 text-base leading-8 ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Target Trek aims to organize those
                concepts into practical learning
                resources that are easier to revise,
                understand and apply.
              </p>

              <div
                className={`mt-9 border-t pt-8 ${
                  isDark
                    ? "border-slate-800"
                    : "border-slate-200"
                }`}
              >
                <span className="text-xs font-black uppercase tracking-[0.16em] text-indigo-500">
                  Our Vision
                </span>

                <h3
                  className={`mt-3 flex items-center gap-3 text-2xl font-black ${
                    isDark
                      ? "text-white"
                      : "text-slate-950"
                  }`}
                >
                  <Rocket
                    size={25}
                    className="text-indigo-500"
                  />

                  A practical developer-learning
                  library
                </h3>

                <p
                  className={`mt-4 leading-8 ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  Our long-term goal is to build a
                  structured library covering the
                  engineering concepts developers
                  need across backend development,
                  system design, AI and technical
                  interviews.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="bg-blue-950 py-20 text-white lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr]">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-300">
                  Who Target Trek Is For
                </span>

                <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                  Built for developers who want
                  practical depth.
                </h2>

                <p className="mt-5 max-w-xl leading-8 text-blue-100/80">
                  Whether you are preparing for an
                  interview, learning system design,
                  strengthening backend fundamentals
                  or exploring GenAI, our resources
                  are designed around developer
                  learning.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {audience.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-blue-300"
                    />

                    <span className="text-sm font-bold">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* WHY TARGET TREK */}
        <section
          className={`py-20 lg:py-24 ${
            isDark
              ? "bg-slate-950"
              : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                Our Approach
              </span>

              <h2
                className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Practical learning over isolated
                definitions
              </h2>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
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
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className={`rounded-3xl border p-8 text-center transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      isDark
                        ? "border-slate-800 bg-slate-900"
                        : "border-slate-200 bg-white shadow-sm"
                    }`}
                  >
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <Icon size={29} />
                    </div>

                    <h3
                      className={`mt-6 text-xl font-black ${
                        isDark
                          ? "text-white"
                          : "text-slate-950"
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={`mt-3 text-sm leading-7 ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      {item.text}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* OPERATOR */}
        <section
          className={`border-y py-14 ${
            isDark
              ? "border-slate-800 bg-slate-900"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div
              className={`rounded-3xl border p-7 sm:p-9 ${
                isDark
                  ? "border-slate-800 bg-slate-950"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                    isDark
                      ? "bg-purple-500/10 text-purple-400"
                      : "bg-purple-50 text-purple-600"
                  }`}
                >
                  <UserRound size={27} />
                </div>

                <div>
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
                    About The Platform
                  </span>

                  {/* <h2
                    className={`mt-2 text-2xl font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    Target Trek is operated by Tanu
                  </h2> */}

                  <p
                    className={`mt-4 max-w-3xl text-sm leading-7 sm:text-base ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    Target Trek focuses on creating
                    and improving developer-learning
                    resources covering software
                    engineering, System Design,
                    Backend Engineering and
                    Generative AI.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SUPPORT */}
        <section
          className={`py-16 ${
            isDark
              ? "bg-slate-950"
              : "bg-white"
          }`}
        >
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div
              className={`flex flex-col gap-6 rounded-3xl border p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9 ${
                isDark
                  ? "border-slate-800 bg-slate-900"
                  : "border-blue-100 bg-blue-50/60"
              }`}
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-black text-blue-600">
                  <Mail size={18} />
                  Customer Support
                </div>

                <h2
                  className={`mt-2 text-2xl font-black ${
                    isDark
                      ? "text-white"
                      : "text-slate-950"
                  }`}
                >
                  Need help with a book or purchase?
                </h2>

                <p
                  className={`mt-2 text-sm ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-600"
                  }`}
                >
                  Contact us for ebook access,
                  payment, download or product
                  support.
                </p>
              </div>

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-white hover:bg-slate-700"
                    : "border-slate-200 bg-white text-slate-800 shadow-sm hover:border-blue-200"
                }`}
              >
                <Mail size={17} />
                {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-slate-950 py-16 text-white lg:py-20">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <BookOpen
              size={38}
              className="mx-auto text-blue-400"
            />

            <span className="mt-5 block text-xs font-black uppercase tracking-[0.16em] text-blue-300">
              Keep Learning
            </span>

            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Explore the Target Trek developer
              library
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              Learn System Design, Low-Level Design,
              Backend Engineering, RAG, MCP, Google
              ADK and modern GenAI concepts through
              practical developer-focused resources.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <NavLink
                to="/books"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-black text-white transition hover:bg-blue-500"
              >
                Explore Books
                <ArrowRight size={17} />
              </NavLink>

              <NavLink
                to="/resources"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Free Resources
                <GraduationCap size={17} />
              </NavLink>
            </div>

            <div className="mt-9 flex justify-center gap-4">
              {/* <a
                href="https://www.facebook.com/targettreks/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Target Trek on Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white hover:text-blue-700"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://www.linkedin.com/company/target-trek/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Target Trek on LinkedIn"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white hover:text-blue-700"
              >
                <FaLinkedinIn />
              </a> */}

              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                aria-label="Contact Target Trek support"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white hover:text-blue-700"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;