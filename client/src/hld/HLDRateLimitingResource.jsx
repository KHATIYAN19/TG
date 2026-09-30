import React, {
  useEffect,
  useState,
} from "react";

import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

import {
  BrainCircuit,
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Globe2,
  Hash,
  KeyRound,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Network,
  RefreshCcw,
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
  `${SITE_URL}/resources/hld/rate-limiting`;

const BOOK_URL =
  "/book/system-design/hld";

const PAGE_TITLE =
  "Rate Limiting in System Design: Token Bucket, Sliding Window & Redis | TargetTrek";

const SEO_KEYWORDS =
  "rate limiter system design, rate limiting system design, token bucket algorithm, leaky bucket algorithm, sliding window rate limiter, fixed window rate limiter, Redis rate limiter, distributed rate limiter, HTTP 429, API throttling, rate limiting interview questions";

const LAST_UPDATED = "2026-09-30";

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("theme");

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
};

const PREVIOUS_TOPIC = {
  title:
    "Message Queues",

  description:
    "Learn Kafka, RabbitMQ, pub-sub, consumer groups, ordering, retries, DLQ and event-driven architecture.",

  path:
    "/resources/hld/message-queue",
};

const NEXT_TOPIC = {
  title:
    "API Gateway",

  description:
    "Learn routing, authentication, authorization, throttling, request transformation, aggregation, observability and gateway high availability.",

  path:
    "/resources/hld/api-gateway",
};

const CONTENT_SECTIONS = [
  {
    id: "fundamentals",
    label: "What is Rate Limiting?",
  },
  {
    id: "why",
    label: "Why Needed?",
  },
  {
    id: "where",
    label: "Where to Place It",
  },
  {
    id: "dimensions",
    label: "Limit By",
  },
  {
    id: "fixed-window",
    label: "Fixed Window",
  },
  {
    id: "sliding-log",
    label: "Sliding Log",
  },
  {
    id: "sliding-counter",
    label: "Sliding Counter",
  },
  {
    id: "token-bucket",
    label: "Token Bucket",
  },
  {
    id: "leaky-bucket",
    label: "Leaky Bucket",
  },
  {
    id: "concurrency",
    label: "Concurrency Limit",
  },
  {
    id: "comparison",
    label: "Algorithm Choice",
  },
  {
    id: "distributed",
    label: "Distributed Limiter",
  },
  {
    id: "redis",
    label: "Redis",
  },
  {
    id: "atomicity",
    label: "Atomic Operations",
  },
  {
    id: "headers",
    label: "HTTP 429",
  },
  {
    id: "burst",
    label: "Burst Traffic",
  },
  {
    id: "hot-key",
    label: "Hot Keys",
  },
  {
    id: "multi-region",
    label: "Multi Region",
  },
  {
    id: "bookmyshow",
    label: "Booking Case Study",
  },
  {
    id: "failures",
    label: "Failures",
  },
  {
    id: "monitoring",
    label: "Monitoring",
  },
  {
    id: "interview",
    label: "Interview Questions",
  },
];

const ALGORITHMS = [
  {
    title:
      "Fixed Window Counter",

    short:
      "Simple",

    description:
      "Count requests inside fixed time buckets such as 10:00:00–10:00:59.",

    goodFor:
      "Simple APIs where exact fairness around window boundaries is not critical.",

    benefit:
      "Very simple, cheap and easy to implement.",

    drawback:
      "Allows burst traffic around window boundaries.",
  },

  {
    title:
      "Sliding Window Log",

    short:
      "Accurate",

    description:
      "Store timestamps of recent requests and count only timestamps inside the current rolling interval.",

    goodFor:
      "Low-to-medium traffic systems where precise rolling-window limits matter.",

    benefit:
      "Very accurate rolling limit.",

    drawback:
      "Memory cost grows with request volume.",
  },

  {
    title:
      "Sliding Window Counter",

    short:
      "Balanced",

    description:
      "Approximate a sliding window by combining the current and previous fixed-window counts.",

    goodFor:
      "APIs needing smoother boundaries without storing every request timestamp.",

    benefit:
      "Good accuracy with much lower memory than a request log.",

    drawback:
      "Still an approximation.",
  },

  {
    title:
      "Token Bucket",

    short:
      "Bursts",

    description:
      "Tokens refill at a constant rate. Every request consumes a token.",

    goodFor:
      "APIs that want to allow controlled bursts while enforcing a long-term average rate.",

    benefit:
      "Allows bursts without giving unlimited traffic.",

    drawback:
      "Needs atomic token refill and consumption logic.",
  },

  {
    title:
      "Leaky Bucket",

    short:
      "Smooth",

    description:
      "Incoming work enters a bucket and leaves at a controlled constant rate.",

    goodFor:
      "Protecting systems that need smooth downstream request flow.",

    benefit:
      "Turns bursts into predictable output traffic.",

    drawback:
      "Queued requests may experience latency or be dropped when the bucket fills.",
  },

  {
    title:
      "Concurrency Limiter",

    short:
      "In Flight",

    description:
      "Limits how many expensive operations can execute at the same time.",

    goodFor:
      "Expensive DB queries, AI inference, uploads, report generation and slow downstream calls.",

    benefit:
      "Protects limited resources even when requests have variable durations.",

    drawback:
      "Does not directly control total requests per second.",
  },
];

const FAQ_DATA = [
  {
    question:
      "What is rate limiting in system design?",

    answer:
      "Rate limiting controls how much traffic a client, user, API key, tenant, route or other identity can send during a defined interval or concurrency limit.",
  },

  {
    question:
      "Which rate limiting algorithm is most commonly used?",

    answer:
      "There is no universal best algorithm. Token bucket is useful when controlled bursts are allowed, sliding windows provide smoother rolling limits, and fixed windows are attractive when simplicity matters.",
  },

  {
    question:
      "Why is Redis used for distributed rate limiting?",

    answer:
      "Redis provides fast shared state, TTL support and atomic operations, making it useful when multiple application instances need to enforce one shared limit.",
  },

  {
    question:
      "What HTTP status code should a rate limiter return?",

    answer:
      "HTTP 429 Too Many Requests is commonly returned when the client exceeds an applicable request limit.",
  },

  {
    question:
      "Should rate limits be based only on IP address?",

    answer:
      "Usually not. IP limits are useful for unauthenticated traffic, but authenticated systems often also limit by user, API key, tenant, route or operation because many users can share an IP address.",
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
      className="scroll-mt-28"
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

        <div className="min-w-0">
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

const DiagramNode = ({
  icon: Icon,
  title,
  subtitle,
  isDark,
  highlight = false,
  danger = false,
  success = false,
}) => {
  let classes =
    isDark
      ? "border-slate-700 bg-slate-900"
      : "border-slate-200 bg-white";

  let iconClass =
    isDark
      ? "text-slate-400"
      : "text-slate-500";

  if (highlight) {
    classes =
      isDark
        ? "border-blue-700 bg-blue-950/40"
        : "border-blue-200 bg-blue-50";

    iconClass =
      "text-blue-500";
  }

  if (danger) {
    classes =
      isDark
        ? "border-red-900 bg-red-950/30"
        : "border-red-200 bg-red-50";

    iconClass =
      "text-red-500";
  }

  if (success) {
    classes =
      isDark
        ? "border-emerald-900 bg-emerald-950/30"
        : "border-emerald-200 bg-emerald-50";

    iconClass =
      "text-emerald-500";
  }

  return (
    <div
      className={`min-w-0 rounded-xl border p-3 text-center sm:p-4 ${classes}`}
    >
      {Icon && (
        <Icon
          className={`mx-auto h-5 w-5 ${iconClass}`}
        />
      )}

      <p
        className={`mt-2 break-words text-sm font-black ${
          isDark
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {title}
      </p>

      {subtitle && (
        <p
          className={`mt-1 break-words text-[11px] leading-5 ${
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

const DownArrow = ({
  label,
  isDark,
}) => {
  return (
    <div className="flex flex-col items-center py-2">
      {label && (
        <span
          className={`mb-1 text-center text-[10px] font-black uppercase tracking-wide ${
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

const Callout = ({
  type = "info",
  title,
  children,
  isDark,
}) => {
  const config = {
    info: {
      icon:
        Lightbulb,

      light:
        "border-blue-100 bg-blue-50 text-blue-950",

      dark:
        "border-blue-900/50 bg-blue-950/20 text-blue-100",

      iconColor:
        "text-blue-500",
    },

    warning: {
      icon:
        TriangleAlert,

      light:
        "border-amber-200 bg-amber-50 text-amber-950",

      dark:
        "border-amber-900/50 bg-amber-950/20 text-amber-100",

      iconColor:
        "text-amber-500",
    },

    success: {
      icon:
        CheckCircle2,

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

const CodeBlock = ({
  title,
  children,
}) => {
  return (
    <div className="my-5 min-w-0 max-w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#07101f]">
      {title && (
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-400">
          <Code2 className="h-3.5 w-3.5" />

          {title}
        </div>
      )}

      <pre
        className="
          block
          w-full
          max-w-full
          overflow-x-hidden
          whitespace-pre-wrap
          break-words
          p-4
          font-mono
          text-[11px]
          leading-5
          text-slate-100

          sm:overflow-x-auto
          sm:whitespace-pre
          sm:text-sm
          sm:leading-6
        "
      >
        <code>
          {children}
        </code>
      </pre>
    </div>
  );
};

const HLDRateLimitingResource =
  () => {
    const navigate =
      useNavigate();

    const [theme, setTheme] = useState(getStoredTheme);

    useEffect(() => {
      const syncTheme = () => {
        setTheme((currentTheme) => {
          const nextTheme = getStoredTheme();
          return currentTheme === nextTheme ? currentTheme : nextTheme;
        });
      };

      syncTheme();

      const root = document.documentElement;
      const observer = new MutationObserver(syncTheme);

      observer.observe(root, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });

      window.addEventListener("storage", syncTheme);
      window.addEventListener("themechange", syncTheme);
      window.addEventListener("focus", syncTheme);
      window.addEventListener("click", syncTheme);
      document.addEventListener("visibilitychange", syncTheme);

      return () => {
        observer.disconnect();
        window.removeEventListener("storage", syncTheme);
        window.removeEventListener("themechange", syncTheme);
        window.removeEventListener("focus", syncTheme);
        window.removeEventListener("click", syncTheme);
        document.removeEventListener("visibilitychange", syncTheme);
      };
    }, []);

    const isDark = theme === "dark";

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

    const seoDescription =
      "Complete rate limiting guide for system design interviews covering fixed window, sliding window log, sliding window counter, token bucket, leaky bucket, concurrency limits, Redis distributed rate limiting, Lua atomicity, HTTP 429, hot keys, burst traffic and multi-region limits.";

    const articleSchema = {
      "@context":
        "https://schema.org",

      "@type":
        "TechArticle",

      headline:
        "Rate Limiting in System Design: Complete HLD Guide",

      name:
        "Rate Limiting in System Design",

      description:
        seoDescription,

      dateModified:
        LAST_UPDATED,

      inLanguage:
        "en",

      isAccessibleForFree:
        true,

      keywords:
        SEO_KEYWORDS,

      url:
        PAGE_URL,

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

        url:
          SITE_URL,
      },

      publisher: {
        "@type":
          "Organization",

        name:
          "TargetTrek",

        url:
          SITE_URL,
      },

      educationalLevel:
        "Intermediate to Advanced",

      learningResourceType:
        "System Design Tutorial",

      about: [
        "Rate Limiting",
        "Token Bucket",
        "Leaky Bucket",
        "Sliding Window",
        "Redis",
        "Distributed Systems",
        "API Rate Limiting",
        "High Level Design",
      ],
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
            "Rate Limiting",

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
        FAQ_DATA.map(
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

    return (
      <>

        <Helmet>
          <title>{PAGE_TITLE}</title>

          <meta
            name="description"
            content={
              seoDescription
            }
          />

          <meta name="author" content="TargetTrek" />
          <meta name="application-name" content="TargetTrek" />
          <meta name="theme-color" content={isDark ? "#090d14" : "#f8fafc"} />

          <meta name="keywords" content={SEO_KEYWORDS} />

          <meta
            name="robots"
            content="index,follow,max-image-preview:large,max-snippet:-1"
          />

          <link
            rel="canonical"
            href={
              PAGE_URL
            }
          />

          <meta property="og:type" content="article" />
          <meta property="og:locale" content="en_IN" />
          <meta property="article:section" content="System Design" />
          <meta property="article:modified_time" content={`${LAST_UPDATED}T00:00:00+05:30`} />

          <meta
            property="og:site_name"
            content="TargetTrek"
          />

          <meta
            property="og:title"
            content="Rate Limiting in System Design — Complete HLD Guide"
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

          <meta name="twitter:card" content="summary" />

          <meta
            name="twitter:title"
            content="Rate Limiting in System Design — Complete HLD Guide"
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
          className={`min-h-screen pt-20 transition-colors duration-300 sm:pt-24 ${
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
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
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
                ? "border-slate-800 bg-gradient-to-b from-amber-950/20 to-[#090d14]"
                : "border-slate-200 bg-gradient-to-b from-amber-50 to-white"
            }`}
          >
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
              <div className="mx-auto max-w-4xl">
                <div className="flex flex-wrap gap-2">
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
                    Rate Limiting
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      isDark
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Clock3 className="h-3 w-3" />

                    35 min read
                  </span>
                </div>

                <h1
                  className={`mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl ${textPrimary}`}
                >
                  Rate Limiting in
                  System Design
                </h1>

                <p
                  className={`mt-5 max-w-3xl text-base leading-8 sm:text-lg ${textSecondary}`}
                >
                  Learn how scalable
                  systems protect
                  APIs from abuse,
                  traffic spikes,
                  bots and expensive
                  workloads using
                  fixed windows,
                  sliding windows,
                  token buckets,
                  leaky buckets,
                  Redis and
                  distributed rate
                  limiting.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={() =>
                      document
                        .getElementById(
                          "fundamentals"
                        )
                        ?.scrollIntoView({
                          behavior:
                            "smooth",
                        })
                    }
                    className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
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
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition sm:w-auto ${surface}`}
                  >
                    <BookOpen className="h-4 w-4" />

                    Master HLD Book
                  </button>
                </div>
              </div>
            </div>
          </header>


          <nav
            aria-label="Rate limiting guide sections"
            className={`sticky top-20 z-30 border-b backdrop-blur sm:top-24 ${
              isDark
                ? "border-slate-800 bg-[#090d14]/95"
                : "border-slate-200 bg-white/95"
            }`}
          >
            <div className="mx-auto max-w-7xl overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 lg:px-8">
              <div className="flex min-w-max gap-2 py-3">
                {CONTENT_SECTIONS.map(
                  (item) => (
                    <a
                      key={
                        item.id
                      }
                      href={`#${item.id}`}
                      className={`rounded-lg px-3 py-2 text-xs font-bold ${
                        isDark
                          ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      {
                        item.label
                      }
                    </a>
                  )
                )}
              </div>
            </div>
          </nav>

          <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

            <section>
              <SectionHeading
                id="fundamentals"
                eyebrow="Fundamentals"
                title="What is Rate Limiting?"
                description="Rate limiting controls how much traffic a client or workload is allowed to send during a defined period or concurrent execution limit."
                icon={ShieldCheck}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-5 sm:p-7 ${surface}`}
              >
                <div className="mx-auto max-w-xl">
                  <DiagramNode
                    icon={Users}
                    title="Client"
                    subtitle="1000 requests"
                    isDark={
                      isDark
                    }
                  />

                  <DownArrow
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={ShieldCheck}
                    title="Rate Limiter"
                    subtitle="Allowed: 100 req/min"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DownArrow
                    label="Allowed requests"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Application"
                    subtitle="Protected"
                    isDark={
                      isDark
                    }
                    success
                  />
                </div>
              </div>

              <Callout
                type="info"
                title="Rate limiting is a protection mechanism"
                isDark={
                  isDark
                }
              >
                It protects the
                service, databases,
                downstream APIs and
                other limited
                resources from
                receiving more work
                than they can safely
                process.
              </Callout>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="why"
                eyebrow="Why?"
                title="Why Do We Need Rate Limiting?"
                description="Traffic can become dangerous even when every request is technically valid."
                icon={TriangleAlert}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Prevent Abuse",
                    "Stop clients from sending unlimited API requests.",
                  ],

                  [
                    "Protect Infrastructure",
                    "Prevent traffic from overwhelming databases, queues and downstream services.",
                  ],

                  [
                    "Control Cost",
                    "Protect expensive resources such as AI inference, third-party APIs and payment providers.",
                  ],

                  [
                    "Fairness",
                    "Prevent one tenant or user from consuming all available capacity.",
                  ],

                  [
                    "DDoS Mitigation Layer",
                    "Rate limiting can be one part of a larger abuse and traffic-protection strategy.",
                  ],

                  [
                    "Business Quotas",
                    "Different plans can receive different API limits.",
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

                      <h3
                        className={`mt-3 font-black ${textPrimary}`}
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
                id="where"
                eyebrow="Architecture"
                title="Where Should the Rate Limiter Live?"
                description="Rate limiting can be enforced at several layers, and large systems often combine them."
                icon={Layers3}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Internet Traffic"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Globe2}
                  title="CDN / Edge / WAF"
                  subtitle="Coarse IP / bot limits"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Network}
                  title="API Gateway"
                  subtitle="User / API key / route quotas"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="Application"
                  subtitle="Business-specific limits"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Database}
                  title="DB / Downstream Services"
                  subtitle="Protected resources"
                  isDark={
                    isDark
                  }
                />
              </div>

              <Callout
                type="success"
                title="Layer your limits"
                isDark={
                  isDark
                }
              >
                Edge-level limits can
                reject obvious abuse
                early. Gateway limits
                can enforce user or
                API quotas. The
                application can still
                enforce domain rules
                such as “one OTP every
                30 seconds.”
              </Callout>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="dimensions"
                eyebrow="Identity"
                title="What Can We Rate Limit By?"
                description="The limiter key determines who shares the quota."
                icon={KeyRound}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  [
                    "IP Address",
                    "Useful for unauthenticated traffic and basic abuse control.",
                  ],

                  [
                    "User ID",
                    "Good for authenticated user-level quotas.",
                  ],

                  [
                    "API Key",
                    "Common for developer APIs.",
                  ],

                  [
                    "Tenant / Organization",
                    "Protect multi-tenant systems and enforce plan limits.",
                  ],

                  [
                    "Endpoint",
                    "Expensive endpoints can have stricter limits.",
                  ],

                  [
                    "Operation",
                    "OTP, password reset, AI generation or export can each have separate quotas.",
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

              <CodeBlock title="Composite Rate-Limit Key">
{`rate-limit:
tenant:company_123:
user:user_42:
route:/api/payments`}
              </CodeBlock>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="fixed-window"
                eyebrow="Algorithm 1"
                title="Fixed Window Counter"
                description="Split time into fixed intervals and maintain a request counter for each client and interval."
                icon={Timer}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Example">
{`Limit:

100 requests / minute

Window 1:
10:00:00 - 10:00:59

Window 2:
10:01:00 - 10:01:59`}
              </CodeBlock>

              <div
                className={`mt-6 rounded-2xl border p-5 ${surface}`}
              >
                <p
                  className={`font-black ${textPrimary}`}
                >
                  Boundary Problem
                </p>

                <CodeBlock>
{`10:00:59
-> 100 requests accepted

10:01:00
-> another 100 requests accepted

Result:

200 requests may arrive
within approximately 1 second.`}
                </CodeBlock>
              </div>

              <Callout
                type="success"
                title="Why use it?"
                isDark={
                  isDark
                }
              >
                It is simple, uses
                little memory and can
                be implemented
                efficiently with an
                atomic counter plus
                TTL.
              </Callout>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="sliding-log"
                eyebrow="Algorithm 2"
                title="Sliding Window Log"
                description="Store individual request timestamps and remove entries older than the rolling window."
                icon={Clock3}
                isDark={
                  isDark
                }
              />

              <CodeBlock>
{`Current time:
10:01:20

Window:
last 60 seconds

Stored timestamps:

10:00:25
10:00:40
10:00:55
10:01:10
10:01:18

Remove anything older than:
10:00:20

Count remaining timestamps.`}
              </CodeBlock>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <p className="font-black text-emerald-500">
                    Benefit
                  </p>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Very accurate
                    rolling-window
                    enforcement.
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <p className="font-black text-amber-500">
                    Cost
                  </p>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Potentially store
                    one timestamp for
                    every request.
                  </p>
                </div>
              </div>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="sliding-counter"
                eyebrow="Algorithm 3"
                title="Sliding Window Counter"
                description="Approximate a rolling window using weighted counts from the current and previous fixed windows."
                icon={Activity}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Concept">
{`Previous window count = 80

Current window count = 20

Current window is 25% complete.

Approximation:

80 * 0.75 + 20

= 80 requests`}
              </CodeBlock>

              <Callout
                type="info"
                title="Good compromise"
                isDark={
                  isDark
                }
              >
                Sliding counters avoid
                the large memory
                overhead of storing
                every request
                timestamp while
                reducing the sharp
                fixed-window boundary
                problem.
              </Callout>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="token-bucket"
                eyebrow="Algorithm 4"
                title="Token Bucket"
                description="Tokens enter a bucket at a configured rate. A request is accepted only when enough tokens are available."
                icon={Zap}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={RefreshCcw}
                  title="Refill"
                  subtitle="+10 tokens/sec"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Database}
                  title="Token Bucket"
                  subtitle="Capacity = 100"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Request consumes 1 token"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="API"
                  subtitle="Request allowed"
                  isDark={
                    isDark
                  }
                  success
                />
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Why Token Bucket is
                Useful
              </h3>

              <p
                className={`mt-3 text-sm leading-7 ${textSecondary}`}
              >
                If the bucket has
                accumulated tokens,
                the client can send a
                short burst. But over
                time, traffic is still
                restricted by the
                token refill rate.
              </p>

              <CodeBlock title="Token Bucket Pseudocode">
{`function allowRequest(bucket) {

    now = currentTime()

    elapsed =
        now - bucket.lastRefill

    newTokens =
        elapsed * bucket.refillRate

    bucket.tokens =
        min(
            bucket.capacity,
            bucket.tokens + newTokens
        )

    bucket.lastRefill = now

    if (bucket.tokens < 1) {
        return false
    }

    bucket.tokens -= 1

    return true
}`}
              </CodeBlock>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="leaky-bucket"
                eyebrow="Algorithm 5"
                title="Leaky Bucket"
                description="Requests enter a bucket or queue while work leaves at a controlled rate."
                icon={RefreshCcw}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Burst Traffic"
                  subtitle="1000 req/sec"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Database}
                  title="Bucket / Queue"
                  subtitle="Finite capacity"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Constant leak rate"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="Backend"
                  subtitle="100 req/sec"
                  isDark={
                    isDark
                  }
                  success
                />
              </div>

              <Callout
                type="info"
                title="Token bucket vs leaky bucket"
                isDark={
                  isDark
                }
              >
                Token bucket usually
                allows controlled
                bursts. Leaky bucket
                is useful when the
                output should be
                smoother and more
                constant.
              </Callout>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="concurrency"
                eyebrow="Expensive Operations"
                title="Concurrency Limiting"
                description="Requests per second alone may not protect a resource when each request has a very different execution time."
                icon={LockKeyhole}
                isDark={
                  isDark
                }
              />

              <CodeBlock>
{`Maximum concurrent AI requests:

20

Current in-flight:

20

New request:

REJECT / QUEUE`}
              </CodeBlock>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    RPS Limit
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Controls how many
                    requests begin
                    during a time
                    interval.
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Concurrency Limit
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Controls how many
                    operations can
                    remain active at
                    once.
                  </p>
                </div>
              </div>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="comparison"
                eyebrow="Selection"
                title="Which Rate Limiting Algorithm Should You Use?"
                description="The correct choice depends on accuracy, burst tolerance, state size and complexity."
                icon={BrainCircuit}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-4">
                {ALGORITHMS.map(
                  (
                    algorithm,
                    index
                  ) => (
                    <div
                      key={
                        algorithm.title
                      }
                      className={`rounded-2xl border p-5 sm:p-6 ${surface}`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">
                          {index + 1}
                        </span>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3
                              className={`text-lg font-black ${textPrimary}`}
                            >
                              {
                                algorithm.title
                              }
                            </h3>

                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                                isDark
                                  ? "bg-slate-800 text-slate-300"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {
                                algorithm.short
                              }
                            </span>
                          </div>

                          <p
                            className={`mt-2 text-sm leading-7 ${textSecondary}`}
                          >
                            {
                              algorithm.description
                            }
                          </p>

                          <div className="mt-4 grid gap-4 sm:grid-cols-3">
                            <div>
                              <p className="text-xs font-black uppercase text-blue-500">
                                Good For
                              </p>

                              <p
                                className={`mt-1 text-sm ${textSecondary}`}
                              >
                                {
                                  algorithm.goodFor
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-black uppercase text-emerald-500">
                                Benefit
                              </p>

                              <p
                                className={`mt-1 text-sm ${textSecondary}`}
                              >
                                {
                                  algorithm.benefit
                                }
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-black uppercase text-amber-500">
                                Trade-off
                              </p>

                              <p
                                className={`mt-1 text-sm ${textSecondary}`}
                              >
                                {
                                  algorithm.drawback
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="distributed"
                eyebrow="Distributed Systems"
                title="Local vs Distributed Rate Limiting"
                description="A limiter inside one application server is easy, but multiple application instances create a coordination problem."
                icon={Network}
                isDark={
                  isDark
                }
              />

              <h3
                className={`mt-7 text-xl font-black ${textPrimary}`}
              >
                Broken Local Design
              </h3>

              <div
                className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="User"
                  subtitle="Limit = 100/min"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <DiagramNode
                    icon={Server}
                    title="API 1"
                    subtitle="100 allowed"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="API 2"
                    subtitle="100 allowed"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="API 3"
                    subtitle="100 allowed"
                    isDark={
                      isDark
                    }
                  />
                </div>

                <p className="mt-5 text-center text-sm font-black text-red-500">
                  Effective limit may
                  become 300/min.
                </p>
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Shared State
              </h3>

              <div
                className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <DiagramNode
                    icon={Server}
                    title="API 1"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="API 2"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="API 3"
                    isDark={
                      isDark
                    }
                  />
                </div>

                <DownArrow
                  label="Shared counter"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Database}
                  title="Redis"
                  subtitle="user:42 => 76 / 100"
                  isDark={
                    isDark
                  }
                  highlight
                />
              </div>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="redis"
                eyebrow="Implementation"
                title="Redis-Based Rate Limiting"
                description="Redis is commonly useful because application instances can share fast counters and expirations."
                icon={Database}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Fixed Window">
{`key =
  "rate:user:42:202609291546"

count =
  INCR key

if count == 1:
    EXPIRE key 60

if count > 100:
    rejectRequest()
`}
              </CodeBlock>

              <Callout
                type="warning"
                title="INCR and EXPIRE must be handled safely"
                isDark={
                  isDark
                }
              >
                If your application
                increments a brand-new
                key and crashes before
                setting its TTL, the
                counter may remain
                indefinitely. Use an
                atomic operation,
                transaction or script
                suited to your design.
              </Callout>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="atomicity"
                eyebrow="Concurrency"
                title="Why Atomicity Matters"
                description="Two requests can reach the limiter at exactly the same time."
                icon={LockKeyhole}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Incorrect Read-Modify-Write">
{`Request A:

GET counter -> 99

Request B:

GET counter -> 99

A thinks:
99 < 100 -> allow

B thinks:
99 < 100 -> allow

Both update counter.

Limit is violated.`}
              </CodeBlock>

              <p
                className={`mt-5 text-sm leading-7 ${textSecondary}`}
              >
                Use atomic Redis
                operations, scripts
                or another shared
                state mechanism that
                performs check +
                update as one logical
                operation.
              </p>

              <CodeBlock title="Atomic Lua-Style Concept">
{`local current =
    redis.call(
        "GET",
        KEYS[1]
    )

if current and
   tonumber(current) >=
   tonumber(ARGV[1])
then
    return 0
end

local value =
    redis.call(
        "INCR",
        KEYS[1]
    )

if value == 1 then
    redis.call(
        "EXPIRE",
        KEYS[1],
        ARGV[2]
    )
end

return 1`}
              </CodeBlock>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="headers"
                eyebrow="API Behavior"
                title="HTTP 429 & Rate Limit Responses"
                description="Clients should receive enough information to understand that the request was throttled and, where appropriate, when to retry."
                icon={TriangleAlert}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Example Response">
{`HTTP/1.1 429 Too Many Requests

Retry-After: 30

Content-Type: application/json

{
  "success": false,
  "message": "Rate limit exceeded",
  "retryAfterSeconds": 30
}`}
              </CodeBlock>

              <Callout
                type="warning"
                title="Do not make clients retry immediately"
                isDark={
                  isDark
                }
              >
                If thousands of
                clients receive 429
                and immediately retry
                in a tight loop, the
                limiter itself can
                become part of a retry
                storm. Clients should
                use backoff and
                respect retry
                guidance.
              </Callout>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="burst"
                eyebrow="Traffic Spikes"
                title="Handling Burst Traffic"
                description="Rate limits need to distinguish between acceptable short bursts and sustained overload."
                icon={Zap}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Normal Traffic"
                  subtitle="100 req/sec"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  label="Flash event"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Activity}
                  title="10,000 req/sec"
                  subtitle="Sudden burst"
                  isDark={
                    isDark
                  }
                  danger
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={ShieldCheck}
                  title="Token Bucket"
                  subtitle="Allow bounded burst"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="Backend"
                  subtitle="Protected"
                  isDark={
                    isDark
                  }
                  success
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Burst Capacity",
                    "Allows temporary traffic above the steady refill rate.",
                  ],

                  [
                    "Sustained Rate",
                    "Controls long-term throughput.",
                  ],

                  [
                    "Queueing",
                    "Some workloads can wait instead of being rejected.",
                  ],

                  [
                    "Load Shedding",
                    "Optional requests may be rejected under extreme pressure.",
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
                id="hot-key"
                eyebrow="Scale"
                title="Rate Limiter Hot-Key Problem"
                description="A single very popular identity can create enormous traffic against one Redis key."
                icon={Activity}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <DiagramNode
                    icon={Users}
                    title="R1"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Users}
                    title="R2"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Users}
                    title="R3"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Users}
                    title="Millions"
                    isDark={
                      isDark
                    }
                  />
                </div>

                <DownArrow
                  label="Same API key"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Database}
                  title="rate:api-key:popular-key"
                  subtitle="Hot Redis key"
                  isDark={
                    isDark
                  }
                  danger
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Local + Global Limits",
                    "Enforce small local limits first and use global storage for authoritative quota.",
                  ],

                  [
                    "Sharded Counter Design",
                    "For some approximate limits, distribute counter work across multiple keys.",
                  ],

                  [
                    "Edge Enforcement",
                    "Reject obvious traffic before it reaches central infrastructure.",
                  ],

                  [
                    "Plan-Specific Architecture",
                    "Very high-volume tenants may need dedicated quota state.",
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
                id="multi-region"
                eyebrow="Global Systems"
                title="Multi-Region Rate Limiting"
                description="A global limit becomes difficult when traffic is handled independently in several geographical regions."
                icon={Globe2}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Global User"
                  subtitle="Limit = 1000/min worldwide"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <DiagramNode
                    icon={Globe2}
                    title="India"
                    subtitle="400"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Globe2}
                    title="US"
                    subtitle="400"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Globe2}
                    title="Europe"
                    subtitle="400"
                    isDark={
                      isDark
                    }
                  />
                </div>

                <p className="mt-5 text-center text-sm font-black text-red-500">
                  Independent regional
                  limits could allow
                  1200 instead of
                  1000.
                </p>
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Design Choices
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Central Global Counter",
                    "More accurate globally, but adds latency and cross-region dependency.",
                  ],

                  [
                    "Regional Quota Allocation",
                    "Split 1000 global tokens among regions. Fast locally but unused quota can become stranded.",
                  ],

                  [
                    "Eventually Synchronized Counters",
                    "Lower latency but may temporarily exceed exact global limit.",
                  ],

                  [
                    "Hybrid",
                    "Enforce strict local ceilings while asynchronously coordinating global quota.",
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

              <Callout
                type="info"
                title="Ask whether the limit must be exact"
                isDark={
                  isDark
                }
              >
                An abuse-prevention
                limit can often
                tolerate small
                approximation.
                Billing or expensive
                quota enforcement may
                require stronger
                correctness.
              </Callout>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="bookmyshow"
                eyebrow="Case Study"
                title="BookMyShow-Style Flash Sale Rate Limiting"
                description="Imagine tickets for a blockbuster movie opening at exactly 10:00 AM."
                icon={Users}
                isDark={
                  isDark
                }
              />

              <Callout
                type="info"
                title="Interview-style architecture"
                isDark={
                  isDark
                }
              >
                This is a conceptual
                ticket-booking design
                for learning. It is
                not a claim about
                BookMyShow's private
                implementation.
              </Callout>

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="500K+ Users"
                  subtitle="Tickets open"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Globe2}
                  title="CDN / Edge"
                  subtitle="Static assets + coarse abuse controls"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={ShieldCheck}
                  title="Rate Limiter"
                  subtitle="IP + user + booking limits"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Allowed traffic"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Network}
                  title="Load Balancer"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <DiagramNode
                    icon={Server}
                    title="Booking 1"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Booking 2"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Booking N"
                    isDark={
                      isDark
                    }
                  />
                </div>

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DiagramNode
                    icon={Database}
                    title="Redis"
                    subtitle="Seat holds + quota state"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="Booking DB"
                    subtitle="Durable booking"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Example Limits
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "Per IP",
                    "Reduce obvious bot floods.",
                  ],

                  [
                    "Per User",
                    "Prevent one account from creating excessive booking attempts.",
                  ],

                  [
                    "Per Show",
                    "Protect a highly popular show from overwhelming downstream booking state.",
                  ],

                  [
                    "OTP",
                    "Prevent unlimited OTP generation.",
                  ],

                  [
                    "Payment Attempts",
                    "Protect payment providers and reduce repeated abuse.",
                  ],

                  [
                    "Search",
                    "Allow higher throughput because search is less correctness-sensitive than booking.",
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

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Layered Flash-Sale
                Protection
              </h3>

              <div className="mt-4 space-y-3">
                {[
                  "Edge filters obvious abusive traffic.",

                  "Gateway enforces IP, user and API-level quotas.",

                  "Booking service applies stricter business limits.",

                  "Token bucket allows a controlled burst.",

                  "Load balancer spreads accepted traffic.",

                  "Redis handles temporary distributed quota state.",

                  "Seat locking prevents concurrent booking conflicts.",

                  "Database protects final booking correctness.",
                ].map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item
                      }
                      className={`flex gap-3 rounded-xl border p-4 ${surface}`}
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                        {index + 1}
                      </span>

                      <p
                        className={`pt-1 text-sm font-semibold ${textPrimary}`}
                      >
                        {item}
                      </p>
                    </div>
                  )
                )}
              </div>

              <Callout
                type="warning"
                title="Rate limiting does not solve seat concurrency"
                isDark={
                  isDark
                }
              >
                Rate limiting reduces
                excessive traffic.
                Redis seat holds,
                database locking,
                transactions and
                idempotency solve
                booking correctness.
              </Callout>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="failures"
                eyebrow="Production Engineering"
                title="Rate Limiter Failure Scenarios"
                description="A limiter is part of the critical request path, so its own failures need explicit handling."
                icon={TriangleAlert}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-4">
                {[
                  [
                    "Redis Is Down",
                    "Decide whether the endpoint fails open or fails closed. The correct behavior depends on the risk of allowing traffic versus rejecting valid users.",
                  ],

                  [
                    "Race Condition",
                    "Use atomic state changes so concurrent requests cannot exceed the quota.",
                  ],

                  [
                    "Clock Skew",
                    "Distributed algorithms relying on timestamps need a consistent time strategy.",
                  ],

                  [
                    "Hot Key",
                    "A highly active user, API key or tenant may overload one quota key.",
                  ],

                  [
                    "Limiter Adds Latency",
                    "Use low-latency storage, local optimization or hierarchical limits where appropriate.",
                  ],

                  [
                    "Configuration Error",
                    "A limit of 10/min accidentally deployed instead of 10,000/min can cause an outage.",
                  ],

                  [
                    "Regional Partition",
                    "Global quota enforcement may become inconsistent when regions cannot communicate.",
                  ],

                  [
                    "Retry Storm",
                    "Rejected clients must use backoff instead of immediately retrying.",
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
                      className={`rounded-2xl border p-5 ${surface}`}
                    >
                      <div className="flex gap-3">
                        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />

                        <div>
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
                      </div>
                    </div>
                  )
                )}
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Fail Open vs Fail
                Closed
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <h3 className="font-black text-emerald-500">
                    Fail Open
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    If limiter storage
                    fails, allow the
                    request.
                  </p>

                  <p
                    className={`mt-3 text-sm ${textSecondary}`}
                  >
                    Useful when
                    availability is
                    more important
                    than strict quota
                    enforcement.
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <h3 className="font-black text-red-500">
                    Fail Closed
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    If limiter storage
                    fails, reject the
                    request.
                  </p>

                  <p
                    className={`mt-3 text-sm ${textSecondary}`}
                  >
                    Useful when the
                    protected
                    operation is very
                    expensive or
                    abuse-sensitive.
                  </p>
                </div>
              </div>
            </section>


            <section className="mt-16">
              <SectionHeading
                id="monitoring"
                eyebrow="Observability"
                title="Rate Limiter Metrics"
                description="Monitoring tells you whether limits are protecting the system or simply blocking legitimate users."
                icon={Activity}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  "Allowed Requests",
                  "Rejected Requests",
                  "429 Rate",
                  "Limiter Latency",
                  "Redis Latency",
                  "Redis Errors",
                  "Hot Keys",
                  "Top Limited Users",
                  "Top Limited IPs",
                  "Limit Utilization",
                  "Fail-Open Count",
                  "Fail-Closed Count",
                  "Burst Rate",
                  "Quota Exhaustion",
                  "Regional Drift",
                  "Config Changes",
                ].map(
                  (
                    metric
                  ) => (
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
                id="interview"
                eyebrow="Interview Preparation"
                title="Rate Limiting Interview Questions"
                description="These are the concepts you should be able to explain with trade-offs."
                icon={Sparkles}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-3">
                {[
                  "Why do we need rate limiting?",

                  "Where should a rate limiter be placed?",

                  "Rate limiting vs throttling — how do you think about them?",

                  "What can you rate limit by?",

                  "Explain Fixed Window Counter.",

                  "What is the fixed-window boundary problem?",

                  "Explain Sliding Window Log.",

                  "Why is Sliding Window Log memory intensive?",

                  "Explain Sliding Window Counter.",

                  "Explain Token Bucket.",

                  "Why does Token Bucket allow bursts?",

                  "Explain Leaky Bucket.",

                  "Token Bucket vs Leaky Bucket?",

                  "What is concurrency limiting?",

                  "RPS limiting vs concurrency limiting?",

                  "How would you rate limit across multiple application servers?",

                  "Why is Redis commonly used?",

                  "How do race conditions break a rate limiter?",

                  "How can Lua scripts help with Redis rate limiting?",

                  "What should happen after HTTP 429?",

                  "What is Retry-After?",

                  "How do you prevent client retry storms?",

                  "How do you support different limits for free and premium users?",

                  "How would you rate limit by API key?",

                  "How would you rate limit OTP generation?",

                  "How do you handle rate-limiter hot keys?",

                  "How would you implement a global multi-region rate limit?",

                  "Exact vs approximate rate limiting?",

                  "When would you fail open?",

                  "When would you fail closed?",

                  "How would you handle Redis failure?",

                  "How would you protect a flash sale?",

                  "How would you rate limit a BookMyShow-style booking API?",

                  "How would you protect an expensive AI inference endpoint?",

                  "What metrics would you monitor?",
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
                description="Short answers to common rate-limiting questions."
                icon={Lightbulb}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-4">
                {FAQ_DATA.map(
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

                      Mastering System
                      Design — HLD
                    </div>

                    <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                      Learn how rate
                      limiting fits
                      into complete
                      system designs.
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                      Combine rate
                      limiting with
                      caching,
                      databases,
                      load balancing,
                      queues,
                      distributed
                      locking,
                      concurrency and
                      failure handling
                      in complete HLD
                      interview
                      designs.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-blue-100">
                      {[
                        "Rate Limiter",
                        "Redis",
                        "Caching",
                        "Queues",
                        "Databases",
                        "BookMyShow",
                        "Scaling",
                        "Concurrency",
                      ].map(
                        (
                          item
                        ) => (
                          <span
                            key={
                              item
                            }
                            className="rounded-full bg-white/10 px-3 py-1.5"
                          >
                            {
                              item
                            }
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
                    className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
                  >
                    Explore HLD Book

                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>


            <section
              className={`mt-10 border-t pt-8 ${
                isDark
                  ? "border-slate-800"
                  : "border-slate-200"
              }`}
            >
              <p
                className={`mb-4 text-xs font-black uppercase tracking-[0.14em] ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Continue Learning
              </p>

              <div className="grid gap-4 md:grid-cols-2">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      PREVIOUS_TOPIC.path
                    )
                  }
                  className={`group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 sm:p-6 ${
                    isDark
                      ? "border-slate-800 bg-slate-900 hover:border-blue-700"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                        isDark
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <ArrowLeft className="h-5 w-5 transition group-hover:-translate-x-1" />
                    </div>

                    <div>
                      <p
                        className={`text-[11px] font-black uppercase tracking-wider ${
                          isDark
                            ? "text-slate-500"
                            : "text-slate-400"
                        }`}
                      >
                        Previous Topic
                      </p>

                      <h3
                        className={`mt-1 text-xl font-black ${textPrimary}`}
                      >
                        {
                          PREVIOUS_TOPIC.title
                        }
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-6 ${textSecondary}`}
                      >
                        {
                          PREVIOUS_TOPIC.description
                        }
                      </p>
                    </div>
                  </div>
                </button>


                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      NEXT_TOPIC.path
                    )
                  }
                  className={`group rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 sm:p-6 ${
                    isDark
                      ? "border-blue-900 bg-blue-950/20 hover:border-blue-600"
                      : "border-blue-200 bg-blue-50/50 hover:border-blue-400 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-wider text-blue-500">
                        Next Topic
                      </p>

                      <h3
                        className={`mt-1 text-xl font-black ${textPrimary}`}
                      >
                        {
                          NEXT_TOPIC.title
                        }
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-6 ${textSecondary}`}
                      >
                        {
                          NEXT_TOPIC.description
                        }
                      </p>
                    </div>

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </button>
              </div>
            </section>
          </main>
        </div>
      </>
    );
  };

export default HLDRateLimitingResource;
