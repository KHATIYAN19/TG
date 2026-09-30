import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Flame,
  Globe2,
  KeyRound,
  Layers,
  Lightbulb,
  LockKeyhole,
  Network,
  RefreshCcw,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Timer,
  TriangleAlert,
  Users,
  Zap,
} from "lucide-react";


const SITE_URL =
  "https://www.targettrek.in";

const PAGE_URL =
  `${SITE_URL}/resources/hld/cache`;

const BOOK_URL =
  "/book/system-design/hld";

const NEXT_TOPIC = {
  title: "Load Balancing",
  description:
    "Understand L4 vs L7 load balancers, algorithms, health checks, sticky sessions, consistent hashing and high availability.",
  path: "/resources/hld/load-balancing",
};

const CONTENT_SECTIONS = [
  {
    id: "what-is-cache",
    label: "What is Cache?",
  },
  {
    id: "architecture",
    label: "Cache Architecture",
  },
  {
    id: "strategies",
    label: "Caching Strategies",
  },
  {
    id: "eviction",
    label: "Eviction Policies",
  },
  {
    id: "invalidation",
    label: "Cache Invalidation",
  },
  {
    id: "stampede",
    label: "Cache Stampede",
  },
  {
    id: "hot-key",
    label: "Celebrity Problem",
  },
  {
    id: "millions",
    label: "Millions of Requests",
  },
  {
    id: "redis",
    label: "Redis Design",
  },
  {
    id: "bookmyshow",
    label: "BookMyShow Case Study",
  },
  {
    id: "failures",
    label: "Failure Handling",
  },
  {
    id: "interview",
    label: "Interview Questions",
  },
];

const CACHE_STRATEGIES = [
  {
    title: "Cache Aside",
    subtitle: "Lazy Loading",
    read:
      "Application checks cache first. On miss, it reads the database and writes the result into cache.",
    write:
      "Application writes directly to the database and usually invalidates the cached key.",
    goodFor:
      "Read-heavy systems where not every database row needs to be cached.",
    tradeOff:
      "First request after a miss is slower. Stale data is possible if invalidation fails.",
  },
  {
    title: "Read Through",
    subtitle: "Cache-managed reads",
    read:
      "Application asks the cache. The cache itself loads missing data from the underlying store.",
    write:
      "Depends on the cache implementation and write strategy.",
    goodFor:
      "Systems wanting caching logic abstracted away from application code.",
    tradeOff:
      "Needs cache/library support for loading data from the source.",
  },
  {
    title: "Write Through",
    subtitle: "Synchronous write",
    read:
      "Reads usually come from cache.",
    write:
      "Every write updates both the cache and persistent database before success is returned.",
    goodFor:
      "Systems where cache and database consistency are important.",
    tradeOff:
      "Higher write latency because two systems must be updated.",
  },
  {
    title: "Write Back",
    subtitle: "Write Behind",
    read:
      "Usually served from cache.",
    write:
      "Write reaches cache first. Database persistence happens asynchronously.",
    goodFor:
      "High write throughput where small persistence delays are acceptable.",
    tradeOff:
      "Data can be lost if the cache fails before the asynchronous database write.",
  },
  {
    title: "Refresh Ahead",
    subtitle: "Proactive refresh",
    read:
      "Frequently accessed data is refreshed before its TTL expires.",
    write:
      "Usually combined with another strategy such as cache-aside.",
    goodFor:
      "Very hot predictable keys where expiration misses would cause spikes.",
    tradeOff:
      "Can refresh data that nobody ends up requesting.",
  },
];


const SectionHeading = ({
  id,
  eyebrow,
  title,
  description,
  icon: Icon,
  isDark,
}) => {
  return (
    <div
      id={id}
      className="scroll-mt-36 sm:scroll-mt-40"
    >
      {eyebrow && (
        <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-500">
          {eyebrow}
        </p>
      )}

      <div className="mt-2 flex items-start gap-3">
        {Icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              isDark
                ? "bg-blue-950/50 text-blue-300"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}

        <div>
          <h2
            className={`text-2xl font-black tracking-tight sm:text-3xl ${
              isDark
                ? "text-white"
                : "text-slate-950"
            }`}
          >
            {title}
          </h2>

          {description && (
            <p
              className={`mt-2 max-w-3xl text-sm leading-7 sm:text-base ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const CodeBlock = ({
  children,
  title,
  isDark,
}) => {
  return (
    <div
      className={`my-5 min-w-0 overflow-hidden rounded-2xl border ${
        isDark
          ? "border-slate-800 bg-[#07101f]"
          : "border-slate-800 bg-slate-950"
      }`}
    >
      {title && (
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Code2 className="h-3.5 w-3.5" />
            {title}
          </div>
        </div>
      )}

      <pre
        className="block w-full max-w-full overflow-x-auto whitespace-pre p-4 font-mono text-[11px] leading-5 text-slate-100 sm:text-sm sm:leading-6"
      >
        <code>
          {children}
        </code>
      </pre>
    </div>
  );
};

const Callout = ({
  type = "info",
  title,
  children,
  isDark,
}) => {
  const config = {
    info: {
      icon: Lightbulb,

      light:
        "border-blue-100 bg-blue-50 text-blue-950",

      dark:
        "border-blue-900/50 bg-blue-950/20 text-blue-100",

      iconColor:
        "text-blue-500",
    },

    warning: {
      icon: TriangleAlert,

      light:
        "border-amber-200 bg-amber-50 text-amber-950",

      dark:
        "border-amber-900/50 bg-amber-950/20 text-amber-100",

      iconColor:
        "text-amber-500",
    },

    success: {
      icon: CheckCircle2,

      light:
        "border-emerald-200 bg-emerald-50 text-emerald-950",

      dark:
        "border-emerald-900/50 bg-emerald-950/20 text-emerald-100",

      iconColor:
        "text-emerald-500",
    },
  };

  const selected =
    config[type] ||
    config.info;

  const Icon =
    selected.icon;

  return (
    <div
      className={`my-5 rounded-2xl border p-4 sm:p-5 ${
        isDark
          ? selected.dark
          : selected.light
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${selected.iconColor}`}
        />

        <div className="min-w-0">
          {title && (
            <p className="font-black">
              {title}
            </p>
          )}

          <div className="mt-1 text-sm leading-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const DiagramNode = ({
  icon: Icon,
  title,
  subtitle,
  isDark,
  highlight = false,
}) => {
  return (
    <div
      className={`min-w-0 rounded-xl border p-3 text-center sm:p-4 ${
        highlight
          ? isDark
            ? "border-blue-700 bg-blue-950/40"
            : "border-blue-200 bg-blue-50"
          : isDark
            ? "border-slate-700 bg-slate-900"
            : "border-slate-200 bg-white"
      }`}
    >
      {Icon && (
        <Icon
          className={`mx-auto h-5 w-5 ${
            highlight
              ? "text-blue-500"
              : isDark
                ? "text-slate-400"
                : "text-slate-500"
          }`}
        />
      )}

      <p
        className={`mt-2 text-sm font-black ${
          isDark
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {title}
      </p>

      {subtitle && (
        <p
          className={`mt-1 text-[11px] leading-5 ${
            isDark
              ? "text-slate-500"
              : "text-slate-500"
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

const ArrowDown = ({
  isDark,
  label,
}) => {
  return (
    <div className="flex flex-col items-center py-2">
      {label && (
        <span
          className={`mb-1 text-[10px] font-bold uppercase ${
            isDark
              ? "text-slate-500"
              : "text-slate-400"
          }`}
        >
          {label}
        </span>
      )}

      <ArrowRight
        className={`h-5 w-5 rotate-90 ${
          isDark
            ? "text-slate-600"
            : "text-slate-300"
        }`}
      />
    </div>
  );
};


const HLDCacheResource = () => {
  const navigate =
    useNavigate();

  const readStoredTheme = () => {
    if (typeof window === "undefined") {
      return "light";
    }

    return window.localStorage.getItem("theme") === "dark"
      ? "dark"
      : "light";
  };

  const [theme, setTheme] = useState(readStoredTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const syncTheme = () => {
      const nextTheme = readStoredTheme();
      setTheme((currentTheme) =>
        currentTheme === nextTheme ? currentTheme : nextTheme
      );
    };

    syncTheme();

    window.addEventListener("storage", syncTheme);
    window.addEventListener("themechange", syncTheme);
    window.addEventListener("theme-change", syncTheme);
    window.addEventListener("focus", syncTheme);

    const rootObserver = new MutationObserver(syncTheme);
    rootObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const intervalId = window.setInterval(syncTheme, 250);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("theme-change", syncTheme);
      window.removeEventListener("focus", syncTheme);
      rootObserver.disconnect();
      window.clearInterval(intervalId);
    };
  }, []);

  const seoDescription =
    "Learn caching for system design interviews: cache-aside, read-through, write-through, write-back, TTL, eviction, cache stampede, celebrity hot-key problem, Redis scaling, distributed locking and a BookMyShow-style seat booking case study.";

  const faqData =
    useMemo(
      () => [
        {
          question:
            "What is caching in system design?",

          answer:
            "Caching stores frequently used data in a faster storage layer so future requests can avoid repeatedly accessing a slower database, service or remote resource.",
        },

        {
          question:
            "What is a cache stampede?",

          answer:
            "A cache stampede happens when a popular cached value expires and many requests simultaneously miss the cache and hit the underlying database or service.",
        },

        {
          question:
            "What is the celebrity or hot-key problem?",

          answer:
            "The celebrity problem occurs when one key receives disproportionately high traffic, causing a single cache shard, node or backend dependency to become overloaded.",
        },

        {
          question:
            "Why is Redis commonly used for caching?",

          answer:
            "Redis provides fast in-memory access, TTL support, atomic commands, multiple data structures and clustering capabilities, making it useful for caching and short-lived distributed state.",
        },

        {
          question:
            "Can Redis prevent double booking?",

          answer:
            "Redis can be used for short-lived atomic seat holds, but the persistent database should remain the source of truth and the booking flow should also use idempotency and database-level consistency protections.",
        },
      ],
      []
    );

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "Caching in System Design: Complete HLD Guide",
    description: seoDescription,
    url: PAGE_URL,
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    learningResourceType: "Technical Guide",
    educationalUse: "Interview Preparation",
    keywords: [
      "caching in system design",
      "Redis",
      "cache-aside",
      "cache invalidation",
      "cache stampede",
      "hot key problem",
      "distributed locking",
      "HLD interview",
    ],

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id":
        PAGE_URL,
    },

    author: {
      "@type":
        "Organization",

      name:
        "TargetTrek",
    },

    publisher: {
      "@type":
        "Organization",

      name:
        "TargetTrek",

      url:
        SITE_URL,
    },

    about: [
      "Caching",
      "System Design",
      "Redis",
      "Cache Stampede",
      "Distributed Systems",
      "High Level Design",
    ],

    proficiencyLevel:
      "Intermediate",
  };

  const breadcrumbSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    itemListElement: [
      {
        "@type":
          "ListItem",

        position: 1,

        name:
          "TargetTrek",

        item:
          SITE_URL,
      },

      {
        "@type":
          "ListItem",

        position: 2,

        name:
          "HLD Resources",

        item:
          `${SITE_URL}/resources/hld`,
      },

      {
        "@type":
          "ListItem",

        position: 3,

        name:
          "Caching",

        item:
          PAGE_URL,
      },
    ],
  };

  const faqSchema = {
    "@context":
      "https://schema.org",

    "@type":
      "FAQPage",

    mainEntity:
      faqData.map(
        (item) => ({
          "@type":
            "Question",

          name:
            item.question,

          acceptedAnswer: {
            "@type":
              "Answer",

            text:
              item.answer,
          },
        })
      ),
  };

  const surface =
    isDark
      ? "border-slate-800 bg-slate-900"
      : "border-slate-200 bg-white";

  const textPrimary =
    isDark
      ? "text-white"
      : "text-slate-950";

  const textSecondary =
    isDark
      ? "text-slate-400"
      : "text-slate-600";

  return (
    <>
      <Helmet>
        <html lang="en" />

        <title>
          Caching in System Design: Redis, Strategies & Scaling | TargetTrek
        </title>

        <meta
          name="description"
          content={
            seoDescription
          }
        />

        <meta
          name="keywords"
          content="cache system design, caching strategies, redis system design, cache aside, cache stampede, celebrity problem cache, hot key problem, redis distributed lock, HLD interview, caching interview questions"
        />

        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />

        <meta name="author" content="TargetTrek" />
        <meta name="theme-color" content={isDark ? "#090d14" : "#ffffff"} />

        <link
          rel="canonical"
          href={PAGE_URL}
        />
        <meta
          property="og:type"
          content="article"
        />

        <meta
          property="og:site_name"
          content="TargetTrek"
        />

        <meta property="og:locale" content="en_IN" />
        <meta property="article:section" content="System Design" />

        <meta
          property="og:title"
          content="Caching in System Design — Complete HLD Guide"
        />

        <meta
          property="og:description"
          content={
            seoDescription
          }
        />

        <meta
          property="og:url"
          content={
            PAGE_URL
          }
        />
        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="Caching in System Design — Complete HLD Guide"
        />

        <meta
          name="twitter:description"
          content={
            seoDescription
          }
        />
        <script
          type="application/ld+json"
        >
          {JSON.stringify(
            articleSchema
          )}
        </script>

        <script
          type="application/ld+json"
        >
          {JSON.stringify(
            breadcrumbSchema
          )}
        </script>

        <script
          type="application/ld+json"
        >
          {JSON.stringify(
            faqSchema
          )}
        </script>
      </Helmet>

      <div
        className={`min-h-screen overflow-x-hidden pt-20 transition-colors duration-300 sm:pt-24 ${
          isDark
            ? "bg-[#090d14] text-slate-100"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <div
          className={`border-b ${
            isDark
              ? "border-slate-800 bg-[#090d14]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-start px-4 py-3 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/resources/hld"
                )
              }
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700 hover:text-blue-400"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <ArrowLeft className="h-4 w-4" />

              <span className="hidden sm:inline">
                HLD Resources
              </span>

              <span className="sm:hidden">
                Back
              </span>
            </button>
          </div>
        </div>
        <header
          className={`border-b ${
            isDark
              ? "border-slate-800 bg-gradient-to-b from-blue-950/20 to-[#090d14]"
              : "border-slate-200 bg-gradient-to-b from-blue-50 to-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-black ${
                    isDark
                      ? "border-blue-800 bg-blue-950/50 text-blue-300"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  HLD
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  System Design
                </span>

                <span
                  className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                    isDark
                      ? "bg-slate-800 text-slate-300"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Clock3 className="h-3 w-3" />
                  25 min read
                </span>
              </div>

              <h1
                id="cache-page-title"
                className={`mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Caching in
                System Design
              </h1>

              <p
                className={`mt-5 max-w-3xl text-base leading-8 sm:text-lg ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Learn how caching
                works from first
                principles to
                production-scale
                systems: cache-aside,
                read-through,
                write-through,
                eviction, invalidation,
                stampedes, hot keys,
                Redis, distributed
                locking and
                high-traffic
                architecture.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        "what-is-cache"
                      )
                      ?.scrollIntoView({
                        behavior:
                          "smooth",
                      })
                  }
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Start Learning
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      BOOK_URL
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />

                  Master HLD Book
                </button>
              </div>
            </div>
          </div>
        </header>
        <nav
          aria-label="Caching article sections"
          className={`sticky top-20 z-30 border-b backdrop-blur sm:top-24 ${
            isDark
              ? "border-slate-800 bg-[#090d14]/95"
              : "border-slate-200 bg-white/95"
          }`}
        >
          <div className="mx-auto max-w-7xl overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-2 py-3">
              {CONTENT_SECTIONS.map(
                (item) => (
                  <a
                    key={
                      item.id
                    }
                    href={`#${item.id}`}
                    className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                      isDark
                        ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    }`}
                  >
                    {item.label}
                  </a>
                )
              )}
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-12 lg:px-8">
          <article aria-labelledby="cache-page-title">
            <section>
            <SectionHeading
              id="what-is-cache"
              eyebrow="Fundamentals"
              title="What is a Cache?"
              description="A cache is a faster storage layer that temporarily keeps frequently accessed or expensive-to-compute data close to the consumer."
              icon={Zap}
              isDark={isDark}
            />

            <div
              className={`mt-7 rounded-2xl border p-5 sm:p-7 ${surface}`}
            >
              <p
                className={`leading-8 ${textSecondary}`}
              >
                Imagine your
                application needs a
                user profile. Reading
                that profile from a
                distributed database
                may take significantly
                longer than reading it
                from an in-memory
                cache.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div
                  className={`rounded-xl border p-5 ${
                    isDark
                      ? "border-red-900/50 bg-red-950/20"
                      : "border-red-100 bg-red-50"
                  }`}
                >
                  <Database className="h-6 w-6 text-red-500" />

                  <h3
                    className={`mt-3 font-black ${textPrimary}`}
                  >
                    Without Cache
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-6 ${textSecondary}`}
                  >
                    Every request
                    reaches the
                    database or
                    downstream
                    service.
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      ❌ Higher
                      latency
                    </p>

                    <p>
                      ❌ More database
                      load
                    </p>

                    <p>
                      ❌ Harder to
                      absorb traffic
                      spikes
                    </p>
                  </div>
                </div>

                <div
                  className={`rounded-xl border p-5 ${
                    isDark
                      ? "border-emerald-900/50 bg-emerald-950/20"
                      : "border-emerald-100 bg-emerald-50"
                  }`}
                >
                  <Zap className="h-6 w-6 text-emerald-500" />

                  <h3
                    className={`mt-3 font-black ${textPrimary}`}
                  >
                    With Cache
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-6 ${textSecondary}`}
                  >
                    Frequently used
                    values can be
                    served from a
                    faster layer.
                  </p>

                  <div className="mt-4 space-y-2 text-sm">
                    <p>
                      ✅ Lower latency
                    </p>

                    <p>
                      ✅ Less database
                      pressure
                    </p>

                    <p>
                      ✅ Better burst
                      handling
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Callout
              title="Caching does not make the database unnecessary"
              type="warning"
              isDark={isDark}
            >
              The persistent
              database should usually
              remain the source of
              truth. Cache is an
              optimization layer, not
              a replacement for
              durable storage.
            </Callout>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="architecture"
              eyebrow="Architecture"
              title="Where Can We Cache?"
              description="Caching can exist at several layers. Large systems often combine multiple cache layers rather than relying on one Redis cluster."
              icon={Layers}
              isDark={isDark}
            />

            <div
              className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
            >
              <div className="mx-auto max-w-xl">
                <DiagramNode
                  icon={Users}
                  title="User"
                  subtitle="Browser / Mobile App"
                  isDark={isDark}
                />

                <ArrowDown
                  isDark={isDark}
                  label="Request"
                />

                <DiagramNode
                  icon={Globe2}
                  title="Browser / CDN Cache"
                  subtitle="Static assets, images, public content"
                  isDark={isDark}
                  highlight
                />

                <ArrowDown
                  isDark={isDark}
                />

                <DiagramNode
                  icon={Server}
                  title="Application Servers"
                  subtitle="Local in-memory cache"
                  isDark={isDark}
                />

                <ArrowDown
                  isDark={isDark}
                />

                <DiagramNode
                  icon={Zap}
                  title="Distributed Cache"
                  subtitle="Redis / Memcached"
                  isDark={isDark}
                  highlight
                />

                <ArrowDown
                  isDark={isDark}
                  label="Cache Miss"
                />

                <DiagramNode
                  icon={Database}
                  title="Persistent Database"
                  subtitle="Source of truth"
                  isDark={isDark}
                />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                [
                  "Browser Cache",
                  "CSS, JavaScript, fonts, API responses and other client-cacheable resources.",
                ],

                [
                  "CDN / Edge Cache",
                  "Static and public content cached geographically close to users.",
                ],

                [
                  "Local Application Cache",
                  "Per-instance in-memory cache with extremely low latency.",
                ],

                [
                  "Distributed Cache",
                  "A shared cache such as Redis accessible across application instances.",
                ],

                [
                  "Database Cache",
                  "Buffer pools, query caches and database-managed memory optimizations.",
                ],

                [
                  "Computed Result Cache",
                  "Store expensive calculations, search results, recommendations or rendered responses.",
                ],
              ].map(
                (
                  [
                    title,
                    description,
                  ]
                ) => (
                  <div
                    key={
                      title
                    }
                    className={`rounded-xl border p-5 ${surface}`}
                  >
                    <h3
                      className={`font-black ${textPrimary}`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${textSecondary}`}
                    >
                      {
                        description
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="strategies"
              eyebrow="Core Interview Topic"
              title="Caching Strategies"
              description="An interviewer usually expects you to explain not only that you will use Redis, but how reads and writes interact with the cache."
              icon={RefreshCcw}
              isDark={isDark}
            />

            <div className="mt-7 space-y-4">
              {CACHE_STRATEGIES.map(
                (
                  strategy,
                  index
                ) => (
                  <div
                    key={
                      strategy.title
                    }
                    className={`rounded-2xl border p-5 sm:p-6 ${surface}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-lg font-black ${textPrimary}`}
                        >
                          {
                            strategy.title
                          }
                        </h3>

                        <p className="text-xs font-bold text-blue-500">
                          {
                            strategy.subtitle
                          }
                        </p>

                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <p className="text-xs font-black uppercase text-slate-500">
                              Read
                            </p>

                            <p
                              className={`mt-1 text-sm leading-6 ${textSecondary}`}
                            >
                              {
                                strategy.read
                              }
                            </p>
                          </div>

                          <div>
                            <p className="text-xs font-black uppercase text-slate-500">
                              Write
                            </p>

                            <p
                              className={`mt-1 text-sm leading-6 ${textSecondary}`}
                            >
                              {
                                strategy.write
                              }
                            </p>
                          </div>
                        </div>

                        <div
                          className={`mt-4 border-t pt-4 ${
                            isDark
                              ? "border-slate-800"
                              : "border-slate-100"
                          }`}
                        >
                          <p
                            className={`text-sm ${textSecondary}`}
                          >
                            <strong
                              className={
                                textPrimary
                              }
                            >
                              Good for:
                            </strong>{" "}
                            {
                              strategy.goodFor
                            }
                          </p>

                          <p
                            className={`mt-2 text-sm ${textSecondary}`}
                          >
                            <strong
                              className={
                                textPrimary
                              }
                            >
                              Trade-off:
                            </strong>{" "}
                            {
                              strategy.tradeOff
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <h3
              className={`mt-8 text-xl font-black ${textPrimary}`}
            >
              Cache-Aside Flow
            </h3>

            <div
              className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}
            >
              <div className="grid gap-3 md:grid-cols-5 md:items-center">
                <DiagramNode
                  icon={Users}
                  title="Client"
                  isDark={isDark}
                />

                <ArrowRight className="mx-auto hidden h-5 w-5 text-slate-400 md:block" />

                <DiagramNode
                  icon={Server}
                  title="API"
                  isDark={isDark}
                />

                <ArrowRight className="mx-auto hidden h-5 w-5 text-slate-400 md:block" />

                <DiagramNode
                  icon={Zap}
                  title="Redis"
                  subtitle="GET user:42"
                  isDark={isDark}
                  highlight
                />
              </div>

              <div className="my-5 text-center">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    isDark
                      ? "bg-red-950/40 text-red-300"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  CACHE MISS
                </span>
              </div>

              <div className="mx-auto max-w-sm">
                <DiagramNode
                  icon={Database}
                  title="Database"
                  subtitle="Fetch user → populate Redis → return"
                  isDark={isDark}
                />
              </div>
            </div>

            <CodeBlock
              title="Cache Aside Pseudocode"
              isDark={isDark}
            >
{`async function getUser(userId) {
    const key = \`user:\${userId}\`;

    const cached = await redis.get(key);

    if (cached) {
        return JSON.parse(cached);
    }

    const user = await database.getUser(userId);

    if (!user) {
        return null;
    }

    await redis.set(
        key,
        JSON.stringify(user),
        "EX",
        300
    );

    return user;
}`}
            </CodeBlock>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="eviction"
              eyebrow="Memory Management"
              title="Cache Eviction Policies"
              description="Cache memory is finite. When it fills up, the system must decide what data to remove."
              icon={Database}
              isDark={isDark}
            />

            <div className="mt-7 overflow-hidden rounded-2xl border">
              <div className="overflow-x-auto">
                <table
                  className={`min-w-[720px] w-full ${
                    isDark
                      ? "bg-slate-900"
                      : "bg-white"
                  }`}
                >
                  <thead
                    className={
                      isDark
                        ? "bg-slate-800"
                        : "bg-slate-100"
                    }
                  >
                    <tr>
                      {[
                        "Policy",
                        "Meaning",
                        "Useful When",
                      ].map(
                        (
                          item
                        ) => (
                          <th
                            key={
                              item
                            }
                            className={`px-5 py-4 text-left text-xs font-black uppercase ${
                              isDark
                                ? "text-slate-300"
                                : "text-slate-600"
                            }`}
                          >
                            {
                              item
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {[
                      [
                        "LRU",
                        "Least Recently Used",
                        "Recent access predicts future access.",
                      ],

                      [
                        "LFU",
                        "Least Frequently Used",
                        "Frequently accessed objects should remain cached.",
                      ],

                      [
                        "FIFO",
                        "First In First Out",
                        "Simple eviction is enough.",
                      ],

                      [
                        "TTL",
                        "Time To Live",
                        "Data becomes stale after a known period.",
                      ],

                      [
                        "Random",
                        "Random eviction",
                        "Very simple and low-overhead policy is acceptable.",
                      ],
                    ].map(
                      (row) => (
                        <tr
                          key={
                            row[0]
                          }
                          className={`border-t ${
                            isDark
                              ? "border-slate-800"
                              : "border-slate-200"
                          }`}
                        >
                          {row.map(
                            (
                              cell,
                              index
                            ) => (
                              <td
                                key={
                                  index
                                }
                                className={`px-5 py-4 text-sm ${
                                  index ===
                                  0
                                    ? `font-black ${textPrimary}`
                                    : textSecondary
                                }`}
                              >
                                {
                                  cell
                                }
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Callout
              type="info"
              title="TTL and eviction are different"
              isDark={isDark}
            >
              TTL removes data
              because it has become
              too old. Eviction
              removes data because
              memory is under
              pressure. A production
              cache may use both.
            </Callout>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="invalidation"
              eyebrow="The Hard Part"
              title="Cache Invalidation"
              description="Caching is easy when data never changes. The difficult part is keeping cached data acceptably fresh after writes."
              icon={RefreshCcw}
              isDark={isDark}
            />

            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {[
                {
                  title:
                    "Delete on Write",

                  text:
                    "Update the database, then delete the related cache entry. The next read repopulates it.",
                },

                {
                  title:
                    "Update Cache",

                  text:
                    "Update the database and immediately update the cached copy.",
                },

                {
                  title:
                    "TTL Expiry",

                  text:
                    "Allow stale data for a bounded time and let the cache expire naturally.",
                },
              ].map(
                (item) => (
                  <div
                    key={
                      item.title
                    }
                    className={`rounded-2xl border p-5 ${surface}`}
                  >
                    <h3
                      className={`font-black ${textPrimary}`}
                    >
                      {
                        item.title
                      }
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-7 ${textSecondary}`}
                    >
                      {item.text}
                    </p>
                  </div>
                )
              )}
            </div>

            <CodeBlock
              title="Update + Invalidate"
              isDark={isDark}
            >
{`async function updateUser(userId, payload) {

    await database.updateUser(
        userId,
        payload
    );

    // Remove potentially stale data.
    await redis.del(
        \`user:\${userId}\`
    );

    return { success: true };
}`}
            </CodeBlock>

            <Callout
              type="warning"
              title="What if DB update succeeds but cache delete fails?"
              isDark={isDark}
            >
              Now the database
              contains the new value
              while Redis may still
              contain the old value.
              Possible approaches
              include short TTLs,
              retry queues,
              change-data-capture,
              event-driven
              invalidation and
              versioned cache keys.
            </Callout>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="stampede"
              eyebrow="High Traffic"
              title="Cache Stampede / Thundering Herd"
              description="A cache stampede happens when a hot key expires and a large number of requests simultaneously discover the cache miss."
              icon={Flame}
              isDark={isDark}
            />

            <div
              className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
            >
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {[
                  "Req 1",
                  "Req 2",
                  "Req 3",
                  "Req 4",
                  "Req 5",
                ].map(
                  (request) => (
                    <DiagramNode
                      key={
                        request
                      }
                      icon={Users}
                      title={
                        request
                      }
                      isDark={
                        isDark
                      }
                    />
                  )
                )}
              </div>

              <ArrowDown
                isDark={isDark}
              />

              <DiagramNode
                icon={Zap}
                title="Redis"
                subtitle="hot:key expired → MISS"
                isDark={isDark}
                highlight
              />

              <ArrowDown
                label="All requests now fall through"
                isDark={isDark}
              />

              <DiagramNode
                icon={Database}
                title="Database"
                subtitle="Suddenly receives thousands of identical expensive queries"
                isDark={isDark}
              />
            </div>

            <h3
              className={`mt-8 text-xl font-black ${textPrimary}`}
            >
              Ways to Stop a
              Stampede
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                [
                  "Single Flight / Mutex",
                  "Only one request rebuilds the value. Other requests wait for that result.",
                ],

                [
                  "TTL Jitter",
                  "Add random variation to expiry times so thousands of keys do not expire simultaneously.",
                ],

                [
                  "Stale While Revalidate",
                  "Serve a slightly stale value while one background worker refreshes it.",
                ],

                [
                  "Refresh Ahead",
                  "Refresh a highly popular key before the TTL actually expires.",
                ],

                [
                  "Request Coalescing",
                  "Merge identical concurrent cache-miss requests into one backend operation.",
                ],

                [
                  "Rate Limit / Queue",
                  "Protect the database by controlling how much miss traffic is allowed through.",
                ],
              ].map(
                (
                  [
                    title,
                    text,
                  ]
                ) => (
                  <div
                    key={
                      title
                    }
                    className={`rounded-xl border p-5 ${surface}`}
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />

                    <h4
                      className={`mt-3 font-black ${textPrimary}`}
                    >
                      {title}
                    </h4>

                    <p
                      className={`mt-2 text-sm leading-7 ${textSecondary}`}
                    >
                      {text}
                    </p>
                  </div>
                )
              )}
            </div>

            <CodeBlock
              title="TTL Jitter"
              isDark={isDark}
            >
{`const BASE_TTL = 300;

// Random additional expiry time.
// Keys will not all expire together.
const jitter =
    Math.floor(Math.random() * 60);

await redis.set(
    key,
    value,
    "EX",
    BASE_TTL + jitter
);`}
            </CodeBlock>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="hot-key"
              eyebrow="Hot Key Problem"
              title="The Celebrity Problem"
              description="Imagine a celebrity publishes a post and tens of millions of users request the same profile or post. One cache key can become far hotter than everything else."
              icon={Users}
              isDark={isDark}
            />

            <div
              className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {[
                  "User",
                  "User",
                  "User",
                  "User",
                ].map(
                  (
                    label,
                    index
                  ) => (
                    <DiagramNode
                      key={
                        index
                      }
                      icon={Users}
                      title={
                        label
                      }
                      isDark={
                        isDark
                      }
                    />
                  )
                )}
              </div>

              <ArrowDown
                label="Millions request same key"
                isDark={isDark}
              />

              <DiagramNode
                icon={Flame}
                title="celebrity:123"
                subtitle="One extremely hot Redis key / shard"
                isDark={isDark}
                highlight
              />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                [
                  "Local L1 Cache",
                  "Cache the hot object inside application instances so many requests never reach Redis.",
                ],

                [
                  "Replication",
                  "Spread read traffic across replicas when the data can be safely read from multiple nodes.",
                ],

                [
                  "Key Replication",
                  "For extreme read hotspots, intentionally maintain multiple copies such as hot:123:0, hot:123:1, etc.",
                ],

                [
                  "CDN / Edge",
                  "For public content, move requests closer to users and keep them away from the origin entirely.",
                ],

                [
                  "Longer TTL",
                  "If freshness requirements allow it, avoid repeatedly rebuilding extremely popular content.",
                ],

                [
                  "Pre-Warming",
                  "Populate known hot data before a predictable event or traffic surge.",
                ],
              ].map(
                (
                  [
                    title,
                    text,
                  ]
                ) => (
                  <div
                    key={
                      title
                    }
                    className={`rounded-xl border p-5 ${surface}`}
                  >
                    <h3
                      className={`font-black ${textPrimary}`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-7 ${textSecondary}`}
                    >
                      {text}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="millions"
              eyebrow="Scale"
              title="How Do We Handle Millions of Requests?"
              description="One Redis node is not the architecture. At large scale we reduce traffic at every possible layer before it reaches the primary database."
              icon={Rocket}
              isDark={isDark}
            />

            <div
              className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
            >
              <div className="mx-auto max-w-2xl">
                <DiagramNode
                  icon={Users}
                  title="Millions of Users"
                  subtitle="Web / Mobile"
                  isDark={isDark}
                />

                <ArrowDown
                  isDark={isDark}
                />

                <DiagramNode
                  icon={Globe2}
                  title="CDN / Edge"
                  subtitle="Absorb static + cacheable traffic"
                  isDark={isDark}
                  highlight
                />

                <ArrowDown
                  isDark={isDark}
                />

                <DiagramNode
                  icon={Network}
                  title="Load Balancer"
                  subtitle="Spread traffic"
                  isDark={isDark}
                />

                <ArrowDown
                  isDark={isDark}
                />

                <div className="grid grid-cols-3 gap-2">
                  <DiagramNode
                    icon={Server}
                    title="API 1"
                    subtitle="L1 cache"
                    isDark={isDark}
                  />

                  <DiagramNode
                    icon={Server}
                    title="API 2"
                    subtitle="L1 cache"
                    isDark={isDark}
                  />

                  <DiagramNode
                    icon={Server}
                    title="API N"
                    subtitle="L1 cache"
                    isDark={isDark}
                  />
                </div>

                <ArrowDown
                  isDark={isDark}
                />

                <DiagramNode
                  icon={Zap}
                  title="Redis Cluster"
                  subtitle="Distributed L2 cache"
                  isDark={isDark}
                  highlight
                />

                <ArrowDown
                  label="Only misses"
                  isDark={isDark}
                />

                <DiagramNode
                  icon={Database}
                  title="Database Cluster"
                  subtitle="Primary + replicas / partitions"
                  isDark={isDark}
                />
              </div>
            </div>

            <Callout
              type="success"
              title="The goal is traffic reduction"
              isDark={isDark}
            >
              If 95% of requests can
              be served before
              reaching the database,
              a million incoming
              requests do not
              necessarily mean a
              million database
              queries.
            </Callout>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="redis"
              eyebrow="Distributed Cache"
              title="Designing Redis Properly"
              description="Redis is fast, but poor key design, unlimited TTLs or one hot shard can still create serious production problems."
              icon={Zap}
              isDark={isDark}
            />

            <h3
              className={`mt-7 text-xl font-black ${textPrimary}`}
            >
              Key Naming
            </h3>

            <CodeBlock
              title="Redis Keys"
              isDark={isDark}
            >
{`user:42
user:42:profile
product:1001
movie:778:show:992
show:992:seat:A10
show:992:seat:A10:lock
feed:user:42:v3`}
            </CodeBlock>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                [
                  "Use Namespaces",
                  "Keys such as user:42 and product:42 avoid collisions and are easier to inspect.",
                ],

                [
                  "Always Think About TTL",
                  "Permanent cache entries often become stale or consume memory indefinitely.",
                ],

                [
                  "Avoid Giant Values",
                  "Huge serialized objects increase network, CPU and memory cost.",
                ],

                [
                  "Monitor Hit Ratio",
                  "A cache with a very low hit ratio may add complexity without meaningful benefit.",
                ],

                [
                  "Watch Hot Keys",
                  "One disproportionately popular key can overload a shard even when total cluster capacity looks healthy.",
                ],

                [
                  "Plan Failure Mode",
                  "Ask what your application does when Redis is unavailable.",
                ],
              ].map(
                (
                  [
                    title,
                    text,
                  ]
                ) => (
                  <div
                    key={
                      title
                    }
                    className={`rounded-xl border p-5 ${surface}`}
                  >
                    <h3
                      className={`font-black ${textPrimary}`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-7 ${textSecondary}`}
                    >
                      {text}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="bookmyshow"
              eyebrow="System Design Case Study"
              title="BookMyShow-Style Seat Locking with Redis"
              description="Let's apply caching and distributed locking concepts to a high-concurrency ticket booking system."
              icon={LockKeyhole}
              isDark={isDark}
            />

            <Callout
              type="info"
              title="Important"
              isDark={isDark}
            >
              This is an
              interview-style
              architecture for a
              BookMyShow-like
              ticketing platform. It
              illustrates how Redis
              can be used for
              temporary seat holds;
              it is not a claim about
              BookMyShow's private
              production code.
            </Callout>
            <h3
              className={`mt-8 text-xl font-black ${textPrimary}`}
            >
              Seat State Machine
            </h3>

            <div
              className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}
            >
              <div className="grid gap-3 md:grid-cols-5 md:items-center">
                <DiagramNode
                  icon={CheckCircle2}
                  title="AVAILABLE"
                  subtitle="Seat can be selected"
                  isDark={isDark}
                />

                <ArrowRight className="mx-auto hidden h-5 w-5 text-slate-400 md:block" />

                <DiagramNode
                  icon={LockKeyhole}
                  title="HELD"
                  subtitle="Temporary Redis lock"
                  isDark={isDark}
                  highlight
                />

                <ArrowRight className="mx-auto hidden h-5 w-5 text-slate-400 md:block" />

                <DiagramNode
                  icon={ShieldCheck}
                  title="BOOKED"
                  subtitle="Persisted after successful booking"
                  isDark={isDark}
                />
              </div>

              <div
                className={`mt-5 rounded-xl border border-dashed p-4 text-center text-sm ${
                  isDark
                    ? "border-slate-700 text-slate-400"
                    : "border-slate-300 text-slate-600"
                }`}
              >
                If payment fails,
                checkout is abandoned
                or the hold expires:
                <strong>
                  {" "}
                  HELD → AVAILABLE
                </strong>
              </div>
            </div>
            <h3
              className={`mt-8 text-xl font-black ${textPrimary}`}
            >
              Booking Flow
            </h3>

            <div
              className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}
            >
              <div className="mx-auto max-w-xl">
                <DiagramNode
                  icon={Users}
                  title="User selects A10"
                  isDark={isDark}
                />

                <ArrowDown
                  isDark={isDark}
                />

                <DiagramNode
                  icon={Server}
                  title="Seat Reservation API"
                  subtitle="Validate show + seat"
                  isDark={isDark}
                />

                <ArrowDown
                  isDark={isDark}
                />

                <DiagramNode
                  icon={LockKeyhole}
                  title="Atomic Redis Lock"
                  subtitle="SET seat:992:A10:lock token NX PX 300000"
                  isDark={isDark}
                  highlight
                />

                <ArrowDown
                  label="Lock acquired"
                  isDark={isDark}
                />

                <DiagramNode
                  icon={Timer}
                  title="5 Minute Seat Hold"
                  subtitle="Other users see seat as unavailable"
                  isDark={isDark}
                />

                <ArrowDown
                  isDark={isDark}
                />

                <DiagramNode
                  icon={ShieldCheck}
                  title="Payment"
                  subtitle="Idempotent booking flow"
                  isDark={isDark}
                />

                <ArrowDown
                  label="Success"
                  isDark={isDark}
                />

                <DiagramNode
                  icon={Database}
                  title="Persistent DB"
                  subtitle="Atomically mark seat BOOKED"
                  isDark={isDark}
                />
              </div>
            </div>

            <CodeBlock
              title="Acquire Temporary Seat Hold"
              isDark={isDark}
            >
{`const lockKey =
    \`show:\${showId}:seat:\${seatId}:lock\`;

const token = crypto.randomUUID();

const acquired = await redis.set(
    lockKey,
    token,
    "NX",
    "PX",
    5 * 60 * 1000
);

if (!acquired) {
    throw new Error(
        "Seat already held by another user"
    );
}

// Continue checkout...
`}
            </CodeBlock>

            <h3
              className={`mt-8 text-xl font-black ${textPrimary}`}
            >
              Why Store a Unique
              Token?
            </h3>

            <p
              className={`mt-3 leading-8 ${textSecondary}`}
            >
              Imagine User A obtains
              a lock. The lock
              expires. Then User B
              obtains a new lock for
              the same seat. User A
              must not accidentally
              delete User B's lock
              during cleanup.
            </p>

            <CodeBlock
              title="Safe Redis Unlock"
              isDark={isDark}
            >
{`if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end`}
            </CodeBlock>

            <h3
              className={`mt-8 text-xl font-black ${textPrimary}`}
            >
              What Happens When 100
              People Click A10?
            </h3>

            <div
              className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}
            >
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {[
                  "U1",
                  "U2",
                  "U3",
                  "U4",
                  "U100",
                ].map(
                  (user) => (
                    <DiagramNode
                      key={user}
                      icon={Users}
                      title={user}
                      isDark={isDark}
                    />
                  )
                )}
              </div>

              <ArrowDown
                label="Same seat"
                isDark={isDark}
              />

              <DiagramNode
                icon={LockKeyhole}
                title="Redis Atomic SET NX"
                subtitle="Only one request creates the lock"
                isDark={isDark}
                highlight
              />

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div
                  className={`rounded-xl border p-4 ${
                    isDark
                      ? "border-emerald-900 bg-emerald-950/20"
                      : "border-emerald-100 bg-emerald-50"
                  }`}
                >
                  <p className="font-black text-emerald-500">
                    Winner
                  </p>

                  <p
                    className={`mt-1 text-sm ${textSecondary}`}
                  >
                    One request
                    acquires the seat
                    hold and proceeds
                    to checkout.
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-4 ${
                    isDark
                      ? "border-red-900 bg-red-950/20"
                      : "border-red-100 bg-red-50"
                  }`}
                >
                  <p className="font-black text-red-500">
                    Everyone Else
                  </p>

                  <p
                    className={`mt-1 text-sm ${textSecondary}`}
                  >
                    Redis refuses the
                    `NX` operation and
                    the API returns
                    seat unavailable.
                  </p>
                </div>
              </div>
            </div>

            <h3
              className={`mt-8 text-xl font-black ${textPrimary}`}
            >
              But Redis Must Not Be
              Your Only Protection
            </h3>

            <p
              className={`mt-3 leading-8 ${textSecondary}`}
            >
              The cache lock protects
              the high-concurrency
              checkout experience,
              but the final booking
              should still be
              protected by the
              persistent data layer.
            </p>

            <CodeBlock
              title="Final DB Guard"
              isDark={isDark}
            >
{`UPDATE seats

SET
    status = 'BOOKED',
    booking_id = :bookingId

WHERE
    show_id = :showId
    AND seat_id = :seatId
    AND status = 'AVAILABLE';`}
            </CodeBlock>

            <Callout
              type="success"
              title="Defense in depth"
              isDark={isDark}
            >
              Redis gives you a fast
              temporary hold. The
              database gives you
              durable correctness.
              Idempotency protects
              retries. TTL protects
              abandoned checkouts.
            </Callout>

            <h3
              className={`mt-8 text-xl font-black ${textPrimary}`}
            >
              Payment Success vs
              Failure
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div
                className={`rounded-2xl border p-5 ${
                  isDark
                    ? "border-emerald-900/50 bg-emerald-950/20"
                    : "border-emerald-100 bg-emerald-50"
                }`}
              >
                <h4 className="font-black text-emerald-500">
                  Payment Success
                </h4>

                <div
                  className={`mt-4 space-y-2 text-sm leading-6 ${textSecondary}`}
                >
                  <p>
                    1. Verify payment
                  </p>

                  <p>
                    2. Idempotently
                    create booking
                  </p>

                  <p>
                    3. Persist seat as
                    BOOKED
                  </p>

                  <p>
                    4. Remove
                    temporary lock
                  </p>

                  <p>
                    5. Publish booking
                    event
                  </p>
                </div>
              </div>

              <div
                className={`rounded-2xl border p-5 ${
                  isDark
                    ? "border-red-900/50 bg-red-950/20"
                    : "border-red-100 bg-red-50"
                }`}
              >
                <h4 className="font-black text-red-500">
                  Payment Failure
                </h4>

                <div
                  className={`mt-4 space-y-2 text-sm leading-6 ${textSecondary}`}
                >
                  <p>
                    1. Mark payment
                    attempt failed
                  </p>

                  <p>
                    2. Safely release
                    the Redis lock
                  </p>

                  <p>
                    3. Or allow TTL to
                    expire
                  </p>

                  <p>
                    4. Seat becomes
                    available again
                  </p>

                  <p>
                    5. Notify active
                    clients
                  </p>
                </div>
              </div>
            </div>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="failures"
              eyebrow="Production Engineering"
              title="Caching Failure Scenarios"
              description="A strong system design answer explains what happens when the happy path fails."
              icon={TriangleAlert}
              isDark={isDark}
            />

            <div className="mt-7 space-y-4">
              {[
                {
                  problem:
                    "Redis Goes Down",

                  answer:
                    "Fail open or fail closed depending on the use case. Normal profile reads may temporarily fall back to the DB with strict rate limiting. Seat locks require much stricter correctness handling.",
                },

                {
                  problem:
                    "Cache and DB Disagree",

                  answer:
                    "Treat the database as authoritative. Use TTL, invalidation retries, versioning or events to repair stale cache state.",
                },

                {
                  problem:
                    "All Keys Expire Together",

                  answer:
                    "Use TTL jitter, proactive refresh and staggered warm-up.",
                },

                {
                  problem:
                    "One Key Becomes Extremely Hot",

                  answer:
                    "Use local cache, replicas, CDN, key replication or precomputed responses depending on the workload.",
                },

                {
                  problem:
                    "Redis Memory Is Full",

                  answer:
                    "Configure appropriate max-memory policy, TTLs and alerts. Monitor eviction rate and memory fragmentation.",
                },

                {
                  problem:
                    "Network Partition",

                  answer:
                    "Define whether stale cached reads are acceptable and avoid assuming every distributed lock is an absolute correctness guarantee.",
                },
              ].map(
                (item) => (
                  <div
                    key={
                      item.problem
                    }
                    className={`rounded-2xl border p-5 sm:p-6 ${surface}`}
                  >
                    <div className="flex gap-3">
                      <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />

                      <div>
                        <h3
                          className={`font-black ${textPrimary}`}
                        >
                          {
                            item.problem
                          }
                        </h3>

                        <p
                          className={`mt-2 text-sm leading-7 ${textSecondary}`}
                        >
                          {
                            item.answer
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            <h3
              className={`mt-8 text-xl font-black ${textPrimary}`}
            >
              Important Metrics
            </h3>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                "Hit Ratio",
                "Miss Ratio",
                "P50 / P95 / P99",
                "Memory Usage",
                "Evictions",
                "Hot Keys",
                "Connection Count",
                "CPU",
                "Network I/O",
              ].map(
                (metric) => (
                  <div
                    key={
                      metric
                    }
                    className={`rounded-xl border p-4 text-center text-sm font-bold ${surface}`}
                  >
                    {metric}
                  </div>
                )
              )}
            </div>
          </section>
          <section className="mt-16">
            <SectionHeading
              eyebrow="Trade-offs"
              title="When Should You Not Cache?"
              description="Adding Redis to every system is not automatically good system design."
              icon={TriangleAlert}
              isDark={isDark}
            />

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {[
                "Data changes extremely frequently and stale reads are unacceptable.",

                "The underlying database query is already cheap and traffic is low.",

                "The expected cache hit ratio is extremely small.",

                "The additional operational complexity is greater than the performance benefit.",

                "The value is highly sensitive and should not be duplicated without a clear security model.",

                "Strong transactional consistency is required on every read.",
              ].map(
                (
                  text,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className={`flex gap-3 rounded-xl border p-4 ${surface}`}
                  >
                    <span className="font-black text-red-500">
                      ×
                    </span>

                    <p
                      className={`text-sm leading-6 ${textSecondary}`}
                    >
                      {text}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
          <section className="mt-16">
            <SectionHeading
              id="interview"
              eyebrow="Interview Preparation"
              title="Caching Questions You Should Be Able to Answer"
              description="If you can explain these clearly, including trade-offs, you are in a strong position for most HLD interviews."
              icon={Sparkles}
              isDark={isDark}
            />

            <div className="mt-7 space-y-3">
              {[
                "What problem does caching solve?",

                "What is the difference between cache-aside and read-through?",

                "When would you choose write-through over write-back?",

                "What is a cache stampede?",

                "How would you prevent a thundering herd?",

                "What is TTL jitter?",

                "What is the celebrity / hot-key problem?",

                "How do you invalidate cache after a database update?",

                "What happens if the database update succeeds but cache invalidation fails?",

                "What happens if Redis is unavailable?",

                "How do you cache data across multiple application servers?",

                "What is the difference between an L1 local cache and an L2 distributed cache?",

                "LRU vs LFU — when would you use each?",

                "How would you design a cache for millions of requests per second?",

                "How would you prevent double booking using Redis?",

                "Why should the database still protect final booking correctness?",

                "How do idempotency and caching interact in a payment or booking system?",

                "What metrics would you monitor for Redis?",
              ].map(
                (
                  question,
                  index
                ) => (
                  <div
                    key={
                      question
                    }
                    className={`flex gap-3 rounded-xl border p-4 ${surface}`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                      {index + 1}
                    </span>

                    <p
                      className={`pt-1 text-sm font-semibold ${textPrimary}`}
                    >
                      {question}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
          <section className="mt-16">
            <SectionHeading
              eyebrow="Quick Revision"
              title="Frequently Asked Questions"
              description="Short answers to some of the most common caching questions."
              icon={Lightbulb}
              isDark={isDark}
            />

            <div className="mt-7 space-y-4">
              {faqData.map(
                (item) => (
                  <div
                    key={
                      item.question
                    }
                    className={`rounded-2xl border p-5 ${surface}`}
                  >
                    <h3
                      className={`font-black ${textPrimary}`}
                    >
                      {
                        item.question
                      }
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-7 ${textSecondary}`}
                    >
                      {
                        item.answer
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
          <section className="mt-16">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl sm:p-9">
              <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-100">
                    <BookOpen className="h-3.5 w-3.5" />

                    TargetTrek HLD
                  </div>

                  <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                    Want to master
                    complete System
                    Design?
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                    Go beyond caching.
                    Learn requirements,
                    APIs, databases,
                    scaling, queues,
                    locking,
                    concurrency,
                    failure handling
                    and complete
                    interview-style
                    designs such as
                    BookMyShow and
                    other large-scale
                    systems.
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-blue-100">
                    {[
                      "Caching",
                      "Databases",
                      "Rate Limiting",
                      "Queues",
                      "Concurrency",
                      "BookMyShow",
                      "Uber",
                      "Scaling",
                    ].map(
                      (item) => (
                        <span
                          key={
                            item
                          }
                          className="rounded-full bg-white/10 px-3 py-1.5"
                        >
                          {item}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      BOOK_URL
                    )
                  }
                  className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50 md:w-auto"
                >
                  Explore HLD Book

                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
          <section
            className={`mt-8 border-t pt-8 ${
              isDark
                ? "border-slate-800"
                : "border-slate-200"
            }`}
          >
            <p
              className={`text-xs font-black uppercase tracking-[0.14em] ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-400"
              }`}
            >
              Continue Learning
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  NEXT_TOPIC.path
                )
              }
              className={`group mt-3 w-full rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 sm:p-6 ${
                isDark
                  ? "border-slate-800 bg-slate-900 hover:border-blue-700"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg"
              }`}
            >
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-xs font-bold text-blue-500">
                    NEXT TOPIC
                  </p>

                  <h2
                    className={`mt-1 text-xl font-black sm:text-2xl ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    {
                      NEXT_TOPIC.title
                    }
                  </h2>

                  <p
                    className={`mt-2 max-w-2xl text-sm leading-6 ${textSecondary}`}
                  >
                    {
                      NEXT_TOPIC.description
                    }
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </button>
          </section>
          </article>
        </main>
      </div>
    </>
  );
};

export default HLDCacheResource;