import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Globe2,
  KeyRound,
  Layers3,
  Lightbulb,
  LockKeyhole,
  Network,
  RefreshCcw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  Users,
  Zap,
} from "lucide-react";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const SITE_URL =
  "https://www.targettrek.in";

const PAGE_URL =
  `${SITE_URL}/resources/hld/api-gateway`;

const BOOK_URL =
  "/book/system-design/hld";

const DATE_PUBLISHED =
  "2026-09-29T00:00:00+05:30";

const DATE_MODIFIED =
  "2026-09-30T00:00:00+05:30";

const PREVIOUS_TOPIC = {
  title:
    "Rate Limiting",

  description:
    "Learn token bucket, leaky bucket, sliding windows, Redis-based distributed limits, bursts and multi-region rate limiting.",

  path:
    "/resources/hld/rate-limiting",
};

// const NEXT_TOPIC = {
//   title:
//     "Service Discovery",

//   description:
//     "Learn how services locate each other dynamically using registries, DNS, client-side discovery, server-side discovery and health checks.",

//   path:
//     "/resources/hld/service-discovery",
// };

/*
|--------------------------------------------------------------------------
| CONTENT NAV
|--------------------------------------------------------------------------
*/

const CONTENT_SECTIONS = [
  {
    id: "fundamentals",
    label: "What is API Gateway?",
  },

  {
    id: "why",
    label: "Why Gateway?",
  },

  {
    id: "architecture",
    label: "Architecture",
  },

  {
    id: "gateway-vs-lb",
    label: "Gateway vs LB",
  },

  {
    id: "routing",
    label: "Routing",
  },

  {
    id: "authentication",
    label: "Authentication",
  },

  {
    id: "authorization",
    label: "Authorization",
  },

  {
    id: "rate-limiting",
    label: "Rate Limiting",
  },

  {
    id: "validation",
    label: "Validation",
  },

  {
    id: "transformation",
    label: "Transformation",
  },

  {
    id: "aggregation",
    label: "Aggregation",
  },

  {
    id: "bff",
    label: "BFF Pattern",
  },

  {
    id: "caching",
    label: "Gateway Cache",
  },

  {
    id: "timeouts",
    label: "Timeouts",
  },

  {
    id: "retries",
    label: "Retries",
  },

  {
    id: "circuit-breaker",
    label: "Circuit Breaker",
  },

  {
    id: "service-discovery",
    label: "Service Discovery",
  },

  {
    id: "versioning",
    label: "Versioning",
  },

  {
    id: "observability",
    label: "Observability",
  },

  {
    id: "security",
    label: "Security",
  },

  {
    id: "high-availability",
    label: "High Availability",
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

/*
|--------------------------------------------------------------------------
| FAQ
|--------------------------------------------------------------------------
*/

const FAQ_DATA = [
  {
    question:
      "What is an API Gateway in system design?",

    answer:
      "An API Gateway is an entry point placed in front of backend services that can route requests and handle cross-cutting concerns such as authentication, authorization, rate limiting, observability, request transformation and policy enforcement.",
  },

  {
    question:
      "What is the difference between an API Gateway and a load balancer?",

    answer:
      "A load balancer primarily distributes traffic across backend instances, while an API Gateway commonly performs application-level routing and policies such as authentication, authorization, throttling, transformations and API composition.",
  },

  {
    question:
      "Can an API Gateway become a single point of failure?",

    answer:
      "Yes. A production gateway should therefore run as multiple instances or use highly available managed infrastructure behind redundant traffic routing.",
  },

  {
    question:
      "Should business logic be placed inside an API Gateway?",

    answer:
      "Usually the gateway should focus on cross-cutting concerns and lightweight composition. Core domain business logic generally belongs in backend services.",
  },

  {
    question:
      "Should API Gateway perform authentication?",

    answer:
      "It is common for gateways to validate tokens, API keys or other credentials before forwarding requests, while backend services should still enforce authorization appropriate to their own resources.",
  },
];

/*
|--------------------------------------------------------------------------
| COMPONENTS
|--------------------------------------------------------------------------
*/

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
  success = false,
  danger = false,
}) => {
  let classes =
    isDark
      ? "border-slate-700 bg-slate-900"
      : "border-slate-200 bg-white";

  let iconClasses =
    isDark
      ? "text-slate-400"
      : "text-slate-500";

  if (highlight) {
    classes =
      isDark
        ? "border-blue-700 bg-blue-950/40"
        : "border-blue-200 bg-blue-50";

    iconClasses =
      "text-blue-500";
  }

  if (success) {
    classes =
      isDark
        ? "border-emerald-900 bg-emerald-950/30"
        : "border-emerald-200 bg-emerald-50";

    iconClasses =
      "text-emerald-500";
  }

  if (danger) {
    classes =
      isDark
        ? "border-red-900 bg-red-950/30"
        : "border-red-200 bg-red-50";

    iconClasses =
      "text-red-500";
  }

  return (
    <div
      className={`min-w-0 rounded-xl border p-3 text-center sm:p-4 ${classes}`}
    >
      {Icon && (
        <Icon
          className={`mx-auto h-5 w-5 ${iconClasses}`}
        />
      )}

      <p
        className={`mt-2 break-words text-sm font-black ${
          isDark
            ? "text-white"
            : "text-slate-950"
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

/*
|--------------------------------------------------------------------------
| MAIN PAGE
|--------------------------------------------------------------------------
*/

const HLDApiGatewayResource =
  () => {
    const navigate =
      useNavigate();

    /*
    |--------------------------------------------------------------------------
    | THEME
    |--------------------------------------------------------------------------
    */

    const getCurrentTheme = () => {
      if (typeof window === "undefined") {
        return "light";
      }

      const storedTheme =
        window.localStorage.getItem("theme");

      if (
        storedTheme === "dark" ||
        storedTheme === "light"
      ) {
        return storedTheme;
      }

      return document.documentElement.classList.contains(
        "dark"
      )
        ? "dark"
        : "light";
    };

    const [theme, setTheme] =
      useState(getCurrentTheme);

    const isDark =
      theme === "dark";

    /*
     * The Navbar owns the theme toggle.
     * This page only listens for the current global theme and never
     * writes a new theme value to localStorage.
     *
     * We support:
     * 1. localStorage changes from another tab/window.
     * 2. <html class="dark"> / data-theme changes made by the Navbar.
     * 3. Optional custom theme events if your Navbar dispatches them.
     * 4. A lightweight fallback check for same-tab localStorage changes.
     */
    useEffect(() => {
      const syncTheme = () => {
        const nextTheme =
          getCurrentTheme();

        setTheme((currentTheme) =>
          currentTheme === nextTheme
            ? currentTheme
            : nextTheme
        );
      };

      syncTheme();

      const handleStorage = (event) => {
        if (
          !event.key ||
          event.key === "theme"
        ) {
          syncTheme();
        }
      };

      window.addEventListener(
        "storage",
        handleStorage
      );

      window.addEventListener(
        "themechange",
        syncTheme
      );

      window.addEventListener(
        "theme-change",
        syncTheme
      );

      const rootObserver =
        new MutationObserver(syncTheme);

      rootObserver.observe(
        document.documentElement,
        {
          attributes: true,
          attributeFilter: [
            "class",
            "data-theme",
          ],
        }
      );

      const themeSyncInterval =
        window.setInterval(
          syncTheme,
          500
        );

      return () => {
        window.removeEventListener(
          "storage",
          handleStorage
        );

        window.removeEventListener(
          "themechange",
          syncTheme
        );

        window.removeEventListener(
          "theme-change",
          syncTheme
        );

        rootObserver.disconnect();

        window.clearInterval(
          themeSyncInterval
        );
      };
    }, []);

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

    /*
    |--------------------------------------------------------------------------
    | SEO
    |--------------------------------------------------------------------------
    */

    const seoDescription =
      "Learn API Gateway system design in detail: routing, authentication, authorization, JWT, API keys, rate limiting, request validation, transformations, aggregation, BFF, caching, retries, timeouts, circuit breakers, service discovery, observability, security and high availability.";

    const articleSchema =
      useMemo(
        () => ({
          "@context":
            "https://schema.org",

          "@type":
            "TechArticle",

          headline:
            "API Gateway in System Design: Complete HLD Guide",

          description:
            seoDescription,

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

          datePublished:
            DATE_PUBLISHED,

          dateModified:
            DATE_MODIFIED,

          educationalLevel:
            "Intermediate to Advanced",

          learningResourceType:
            "System Design Tutorial",

          inLanguage:
            "en-IN",

          isAccessibleForFree:
            true,

          timeRequired:
            "PT40M",

          articleSection:
            "High Level Design",

          keywords:
            "API Gateway, System Design, HLD, Microservices, Authentication, Authorization, Rate Limiting, Circuit Breaker, Service Discovery",

          about: [
            "API Gateway",
            "System Design",
            "Microservices",
            "Authentication",
            "Authorization",
            "Rate Limiting",
            "Circuit Breaker",
            "Service Discovery",
            "High Level Design",
          ],
        }),
        [
          seoDescription,
        ]
      );

    const breadcrumbSchema =
      useMemo(
        () => ({
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
                "API Gateway",

              item:
                PAGE_URL,
            },
          ],
        }),
        []
      );

    const faqSchema =
      useMemo(
        () => ({
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
        }),
        []
      );

    return (
      <>
        {/* ======================================================== */}
        {/* SEO                                                      */}
        {/* ======================================================== */}

        <Helmet>
          <title>
            API Gateway in System
            Design: Authentication,
            Routing & Microservices |
            TargetTrek
          </title>

          <meta
            name="description"
            content={
              seoDescription
            }
          />

          <meta
            name="author"
            content="TargetTrek"
          />

          <meta
            name="application-name"
            content="TargetTrek"
          />

          <meta
            name="theme-color"
            content={
              isDark
                ? "#090d14"
                : "#f8fafc"
            }
          />

          <meta
            name="keywords"
            content="api gateway system design, API gateway vs load balancer, microservices API gateway, JWT gateway, authentication authorization, API gateway rate limiting, circuit breaker, BFF pattern, service discovery, API gateway interview questions"
          />

          <meta
            name="robots"
            content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
          />

          <link
            rel="canonical"
            href={
              PAGE_URL
            }
          />

          {/* OPEN GRAPH */}

          <meta
            property="og:type"
            content="article"
          />

          <meta
            property="og:site_name"
            content="TargetTrek"
          />

          <meta
            property="og:locale"
            content="en_IN"
          />

          <meta
            property="og:title"
            content="API Gateway in System Design — Complete HLD Guide"
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
            property="article:published_time"
            content={
              DATE_PUBLISHED
            }
          />

          <meta
            property="article:modified_time"
            content={
              DATE_MODIFIED
            }
          />

          <meta
            property="article:section"
            content="High Level Design"
          />

          {[
            "API Gateway",
            "System Design",
            "HLD",
            "Microservices",
            "Authentication",
            "Rate Limiting",
          ].map((tag) => (
            <meta
              key={tag}
              property="article:tag"
              content={tag}
            />
          ))}

          {/* TWITTER */}

          <meta
            name="twitter:card"
            content="summary_large_image"
          />

          <meta
            name="twitter:title"
            content="API Gateway in System Design — Complete HLD Guide"
          />

          <meta
            name="twitter:description"
            content={
              seoDescription
            }
          />

          {/* STRUCTURED DATA */}

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
          {/* ====================================================== */}
          {/* TOP BAR                                                */}
          {/* ====================================================== */}

          <div
            className={`border-b ${
              isDark
                ? "border-slate-800 bg-[#090d14]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
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

          {/* ====================================================== */}
          {/* HERO                                                    */}
          {/* ====================================================== */}

          <header
            className={`border-b ${
              isDark
                ? "border-slate-800 bg-gradient-to-b from-blue-950/25 to-[#090d14]"
                : "border-slate-200 bg-gradient-to-b from-blue-50 to-white"
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
                    API Gateway
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                      isDark
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Clock3 className="h-3 w-3" />

                    40 min read
                  </span>
                </div>

                <h1
                  className={`mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl ${textPrimary}`}
                >
                  API Gateway in
                  System Design
                </h1>

                <p
                  className={`mt-5 max-w-3xl text-base leading-8 sm:text-lg ${textSecondary}`}
                >
                  Learn how API
                  Gateways become the
                  controlled entry
                  point into
                  microservices by
                  handling routing,
                  authentication,
                  authorization,
                  throttling,
                  validation,
                  transformations,
                  resilience,
                  observability and
                  API composition.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
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
                    className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-black ${surface}`}
                  >
                    <BookOpen className="h-4 w-4" />

                    Master HLD Book
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* ====================================================== */}
          {/* STICKY TOPIC NAV                                        */}
          {/* ====================================================== */}

          <div
            className={`sticky top-20 z-30 border-b backdrop-blur sm:top-24 ${
              isDark
                ? "border-slate-800 bg-[#090d14]/95"
                : "border-slate-200 bg-white/95"
            }`}
          >
            <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
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
                      {
                        item.label
                      }
                    </a>
                  )
                )}
              </div>
            </div>
          </div>

          <main className="mx-auto w-full max-w-5xl overflow-x-hidden px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            {/* ==================================================== */}
            {/* FUNDAMENTALS                                          */}
            {/* ==================================================== */}

            <section>
              <SectionHeading
                id="fundamentals"
                eyebrow="Fundamentals"
                title="What is an API Gateway?"
                description="An API Gateway is a controlled entry point through which clients communicate with backend services."
                icon={Network}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Web / Mobile / Partner"
                  subtitle="Clients"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  label="HTTPS"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={ShieldCheck}
                  title="API Gateway"
                  subtitle="Route • Authenticate • Limit • Observe"
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

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DiagramNode
                    icon={Server}
                    title="User"
                    subtitle="Service"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Order"
                    subtitle="Service"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Payment"
                    subtitle="Service"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Booking"
                    subtitle="Service"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <Callout
                type="info"
                title="Think of it as the front door to backend APIs"
                isDark={
                  isDark
                }
              >
                Instead of exposing
                every internal
                service directly to
                public clients, the
                gateway provides one
                controlled boundary.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* WHY                                                     */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="why"
                eyebrow="Microservices"
                title="Why Do We Need an API Gateway?"
                description="Without a gateway, public clients may need to understand the addresses and contracts of many internal services."
                icon={Layers3}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Single Entry Point",
                    "Clients communicate with one public API boundary instead of discovering many backend services.",
                  ],

                  [
                    "Central Authentication",
                    "Validate credentials before requests reach internal services.",
                  ],

                  [
                    "Authorization Policies",
                    "Reject requests that do not meet gateway-level access rules.",
                  ],

                  [
                    "Rate Limiting",
                    "Protect backend services from excessive traffic.",
                  ],

                  [
                    "Routing",
                    "Map public endpoints to internal services.",
                  ],

                  [
                    "Observability",
                    "Generate common logs, tracing metadata and request metrics.",
                  ],

                  [
                    "Request Transformation",
                    "Modify headers, paths or payload shape when appropriate.",
                  ],

                  [
                    "API Composition",
                    "Aggregate selected backend calls into one client response.",
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

            {/* ==================================================== */}
            {/* ARCHITECTURE                                            */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="architecture"
                eyebrow="Request Flow"
                title="Typical API Gateway Architecture"
                description="A real request usually passes through several infrastructure layers before reaching the target service."
                icon={Network}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Client"
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
                  title="DNS / CDN / WAF"
                  subtitle="Edge protection"
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
                  title="Load Balancer"
                  subtitle="Distribute gateway traffic"
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
                  title="API Gateway Cluster"
                  subtitle="Policies + routing"
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

                <div className="grid gap-2 sm:grid-cols-3">
                  <DiagramNode
                    icon={Server}
                    title="Service A"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Service B"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Service C"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>
            </section>

            {/* ==================================================== */}
            {/* GATEWAY VS LB                                           */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="gateway-vs-lb"
                eyebrow="Common Interview Question"
                title="API Gateway vs Load Balancer vs Reverse Proxy"
                description="These components overlap in modern infrastructure, but their primary responsibilities are different."
                icon={Network}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 overflow-hidden rounded-2xl border">
                <div className="overflow-x-auto">
                  <table
                    className={`min-w-[850px] w-full ${
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
                          "Component",
                          "Primary Role",
                          "Typical Features",
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
                          "Load Balancer",
                          "Distribute traffic",
                          "Health checks, balancing algorithms, failover",
                        ],

                        [
                          "Reverse Proxy",
                          "Represent backend servers",
                          "TLS, routing, caching, compression, proxying",
                        ],

                        [
                          "API Gateway",
                          "API policy + routing boundary",
                          "Auth, rate limits, transformations, aggregation, observability",
                        ],
                      ].map(
                        (
                          row
                        ) => (
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
                                value,
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
                                    value
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
                title="One product may perform several roles"
                isDark={
                  isDark
                }
              >
                Modern proxies,
                managed gateways and
                service-mesh
                components can
                overlap heavily.
                Discuss the logical
                responsibility rather
                than assuming there
                must always be a
                separate physical
                product for each
                role.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* ROUTING                                                 */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="routing"
                eyebrow="Core Responsibility"
                title="Request Routing"
                description="The gateway maps an incoming request to the appropriate backend service."
                icon={Network}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Path-Based Routing">
{`GET /users/42
        ↓
User Service


GET /orders/501
        ↓
Order Service


POST /payments
        ↓
Payment Service`}
              </CodeBlock>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Routing Rules
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Path Based",
                    "/users/* → User Service",
                  ],

                  [
                    "Host Based",
                    "payments.api.com → Payment Service",
                  ],

                  [
                    "Header Based",
                    "X-Client-Version=v2 → new service",
                  ],

                  [
                    "Weighted Routing",
                    "10% → v2, 90% → v1 during canary rollout",
                  ],

                  [
                    "Geo Routing",
                    "Route selected traffic to regional service deployments.",
                  ],

                  [
                    "Tenant Routing",
                    "Enterprise tenants may route to dedicated infrastructure.",
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

            {/* ==================================================== */}
            {/* AUTHENTICATION                                          */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="authentication"
                eyebrow="Security"
                title="Authentication at the Gateway"
                description="Authentication answers: who is making this request?"
                icon={KeyRound}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Client"
                  subtitle="Authorization: Bearer JWT"
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
                  title="API Gateway"
                  subtitle="Validate credential"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Valid identity"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="Backend"
                  subtitle="Trusted identity context"
                  isDark={
                    isDark
                  }
                  success
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "JWT",
                    "Validate signature, expiry, issuer, audience and required claims.",
                  ],

                  [
                    "API Key",
                    "Identify calling applications or developers.",
                  ],

                  [
                    "OAuth Access Token",
                    "Validate externally issued access tokens and scopes.",
                  ],

                  [
                    "mTLS",
                    "Authenticate clients or services using certificates.",
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

              <CodeBlock title="JWT Claims">
{`{
  "sub": "user_42",
  "role": "USER",
  "scope": [
    "booking:read",
    "booking:create"
  ],
  "iss": "auth.targettrek.in",
  "exp": 1790678000
}`}
              </CodeBlock>

              <Callout
                type="warning"
                title="Authentication is not authorization"
                isDark={
                  isDark
                }
              >
                Knowing that the
                caller is user 42
                does not automatically
                mean user 42 can
                access every booking,
                payment or admin API.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* AUTHORIZATION                                           */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="authorization"
                eyebrow="Access Control"
                title="Authorization"
                description="Authorization determines what the authenticated caller is allowed to do."
                icon={LockKeyhole}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Role-Based Access",
                    "ADMIN, USER, SUPPORT or other roles.",
                  ],

                  [
                    "Scope-Based Access",
                    "booking:create, payment:read and similar OAuth-style scopes.",
                  ],

                  [
                    "Route Policies",
                    "Only administrators may access /admin/* routes.",
                  ],

                  [
                    "Tenant Policies",
                    "One organization should not access another organization's APIs.",
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
                      <ShieldCheck className="h-5 w-5 text-blue-500" />

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

              <Callout
                type="info"
                title="Backend services should still protect business resources"
                isDark={
                  isDark
                }
              >
                A gateway can enforce
                broad policies, but
                domain-specific
                authorization such as
                “does this booking
                belong to this user?”
                usually remains the
                responsibility of the
                owning service.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* RATE LIMITING                                           */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="rate-limiting"
                eyebrow="Traffic Protection"
                title="Rate Limiting at the Gateway"
                description="The gateway is a natural place to enforce API quotas before expensive backend work begins."
                icon={Activity}
                isDark={
                  isDark
                }
              />

              <CodeBlock>
{`Free Plan:
100 requests / minute


Pro Plan:
5,000 requests / minute


Payment Route:
20 requests / minute / user


OTP Route:
1 request / 30 seconds / phone`}
              </CodeBlock>

              <div
                className={`mt-6 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Client"
                  subtitle="Too many requests"
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
                  title="Gateway Limiter"
                  subtitle="Token Bucket / Sliding Window"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Allowed only"
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
            </section>

            {/* ==================================================== */}
            {/* VALIDATION                                              */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="validation"
                eyebrow="Input Protection"
                title="Request Validation"
                description="A gateway can reject clearly invalid requests before they consume backend resources."
                icon={CheckCircle2}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Payload Size",
                    "Reject unexpectedly huge bodies before forwarding them.",
                  ],

                  [
                    "Required Headers",
                    "Require content type, API version or authentication metadata.",
                  ],

                  [
                    "Schema Validation",
                    "Validate basic request shape where gateway tooling supports it.",
                  ],

                  [
                    "Method Restrictions",
                    "Reject unsupported HTTP methods.",
                  ],

                  [
                    "Content Type",
                    "Accept only supported request encodings.",
                  ],

                  [
                    "Basic Sanitization",
                    "Normalize or reject obviously malformed traffic.",
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

            {/* ==================================================== */}
            {/* TRANSFORMATION                                          */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="transformation"
                eyebrow="Compatibility"
                title="Request & Response Transformation"
                description="Gateways can translate between a public API contract and internal service contracts."
                icon={RefreshCcw}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Public Request">
{`POST /api/orders

{
  "productId": "p1",
  "quantity": 2
}`}
              </CodeBlock>

              <CodeBlock title="Internal Request">
{`POST /internal/order-service/v2/orders

Headers:

X-User-ID: user_42
X-Request-ID: req_991


{
  "sku": "p1",
  "units": 2
}`}
              </CodeBlock>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Header Injection",
                    "Add request ID, authenticated user context or tracing metadata.",
                  ],

                  [
                    "Path Rewrite",
                    "Map public route names to internal service routes.",
                  ],

                  [
                    "Response Filtering",
                    "Remove selected internal metadata from public responses.",
                  ],

                  [
                    "Protocol Adaptation",
                    "In some architectures, gateways bridge client-facing and internal protocols.",
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
                type="warning"
                title="Avoid turning the gateway into a giant business application"
                isDark={
                  isDark
                }
              >
                Heavy domain logic
                inside the gateway
                creates coupling and
                makes every service
                deployment dependent
                on a central
                component.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* AGGREGATION                                             */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="aggregation"
                eyebrow="API Composition"
                title="Response Aggregation"
                description="One client API may need data from several backend services."
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
                  title="Mobile App"
                  subtitle="GET /home"
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
                  subtitle="Aggregate response"
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

                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode
                    icon={Server}
                    title="Profile"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Orders"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Recommendations"
                    isDark={
                      isDark
                    }
                  />
                </div>

                <DownArrow
                  label="Combine"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Users}
                  title="One Client Response"
                  isDark={
                    isDark
                  }
                  success
                />
              </div>

              <Callout
                type="warning"
                title="Aggregation creates latency coupling"
                isDark={
                  isDark
                }
              >
                If the gateway waits
                for five services,
                the slowest service
                can dominate response
                latency. Use
                parallelism,
                timeouts, partial
                responses or
                dedicated composition
                services where
                appropriate.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* BFF                                                     */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="bff"
                eyebrow="API Design"
                title="Backend for Frontend — BFF"
                description="Different clients can have very different data and latency requirements."
                icon={Users}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode
                    icon={Users}
                    title="Web"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Users}
                    title="Mobile"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Users}
                    title="Partner"
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

                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode
                    icon={Network}
                    title="Web BFF"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DiagramNode
                    icon={Network}
                    title="Mobile BFF"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DiagramNode
                    icon={Network}
                    title="Partner API"
                    isDark={
                      isDark
                    }
                    highlight
                  />
                </div>

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="Shared Microservices"
                  isDark={
                    isDark
                  }
                />
              </div>

              <p
                className={`mt-5 text-sm leading-7 ${textSecondary}`}
              >
                A mobile client may
                prefer compact
                responses and fewer
                network calls, while
                a web interface may
                require richer
                payloads. BFFs allow
                those experiences to
                evolve independently.
              </p>
            </section>

            {/* ==================================================== */}
            {/* CACHING                                                 */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="caching"
                eyebrow="Performance"
                title="Gateway Caching"
                description="Selected read-only responses can sometimes be cached before reaching backend services."
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
                  title="GET /movies/popular"
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
                  title="API Gateway Cache"
                  subtitle="TTL = 30 sec"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Cache miss only"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="Movie Service"
                  isDark={
                    isDark
                  }
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <p className="font-black text-emerald-500">
                    Good Candidates
                  </p>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Public,
                    read-heavy,
                    relatively stable
                    responses.
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <p className="font-black text-red-500">
                    Bad Candidates
                  </p>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Highly
                    personalized,
                    authorization-sensitive
                    or frequently
                    changing data
                    without a strong
                    cache key design.
                  </p>
                </div>
              </div>
            </section>

            {/* ==================================================== */}
            {/* TIMEOUTS                                                */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="timeouts"
                eyebrow="Resilience"
                title="Timeouts"
                description="Never allow gateway requests to wait indefinitely for downstream services."
                icon={Clock3}
                isDark={
                  isDark
                }
              />

              <CodeBlock>
{`Gateway timeout:

Movie Service:
500 ms

Booking Service:
2 seconds

Payment Service:
5 seconds


If timeout expires:

return / fallback / retry
depending on operation`}
              </CodeBlock>

              <Callout
                type="warning"
                title="Timeouts must reflect business behavior"
                isDark={
                  isDark
                }
              >
                A 300 ms timeout may
                be reasonable for a
                recommendation API
                but completely wrong
                for a payment
                provider that
                legitimately requires
                several seconds.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* RETRIES                                                 */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="retries"
                eyebrow="Resilience"
                title="Retries"
                description="Gateways can retry selected transient failures, but retries are dangerous when used blindly."
                icon={RefreshCcw}
                isDark={
                  isDark
                }
              />

              <CodeBlock>
{`Attempt 1
   ↓ failure

wait 100 ms + jitter

Attempt 2
   ↓ failure

wait 200 ms + jitter

Attempt 3

then stop`}
              </CodeBlock>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <h3 className="font-black text-emerald-500">
                    Safer Retry
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Idempotent GET
                    requests after
                    transient network
                    failures can often
                    be retried with
                    bounded backoff.
                  </p>
                </div>

                <div
                  className={`rounded-xl border p-5 ${surface}`}
                >
                  <h3 className="font-black text-red-500">
                    Dangerous Retry
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Retrying a payment
                    creation request
                    without an
                    idempotency key
                    could duplicate
                    side effects.
                  </p>
                </div>
              </div>
            </section>

            {/* ==================================================== */}
            {/* CIRCUIT BREAKER                                         */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="circuit-breaker"
                eyebrow="Failure Isolation"
                title="Circuit Breaker"
                description="A circuit breaker stops repeatedly calling a dependency that is already failing."
                icon={ShieldCheck}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={CheckCircle2}
                  title="CLOSED"
                  subtitle="Requests pass normally"
                  isDark={
                    isDark
                  }
                  success
                />

                <DownArrow
                  label="Failure threshold reached"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={TriangleAlert}
                  title="OPEN"
                  subtitle="Reject immediately"
                  isDark={
                    isDark
                  }
                  danger
                />

                <DownArrow
                  label="Cooldown"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Activity}
                  title="HALF OPEN"
                  subtitle="Allow test requests"
                  isDark={
                    isDark
                  }
                  highlight
                />
              </div>

              <Callout
                type="success"
                title="Fail fast"
                isDark={
                  isDark
                }
              >
                If the payment
                service is clearly
                unavailable, quickly
                failing requests can
                be better than
                allowing thousands of
                connections to wait
                until timeout.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* SERVICE DISCOVERY                                       */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="service-discovery"
                eyebrow="Dynamic Infrastructure"
                title="API Gateway + Service Discovery"
                description="Backend service instances can appear, disappear and move as deployments autoscale."
                icon={Search}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Network}
                  title="API Gateway"
                  subtitle="Need Booking Service"
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
                  icon={Search}
                  title="Service Discovery"
                  subtitle="Find healthy instances"
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

                <div className="grid gap-2 sm:grid-cols-3">
                  <DiagramNode
                    icon={Server}
                    title="Booking 1"
                    subtitle="Healthy"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Booking 2"
                    subtitle="Healthy"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Booking 3"
                    subtitle="Starting"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <p
                className={`mt-5 text-sm leading-7 ${textSecondary}`}
              >
                The gateway should
                not need permanently
                hard-coded IP
                addresses for every
                backend instance.
                Service discovery,
                DNS or infrastructure
                routing can resolve
                healthy destinations.
              </p>
            </section>

            {/* ==================================================== */}
            {/* VERSIONING                                              */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="versioning"
                eyebrow="API Evolution"
                title="API Versioning & Canary Routing"
                description="Gateways can help migrate clients and backend versions gradually."
                icon={RefreshCcw}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Versioned Routes">
{`/api/v1/orders
        ↓
Order Service v1


/api/v2/orders
        ↓
Order Service v2`}
              </CodeBlock>

              <CodeBlock title="Canary Routing">
{`Order Service v1:
90% traffic


Order Service v2:
10% traffic


Observe:

error rate
latency
business metrics


Then:

increase v2 gradually`}
              </CodeBlock>
            </section>

            {/* ==================================================== */}
            {/* OBSERVABILITY                                           */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="observability"
                eyebrow="Operations"
                title="Observability at the Gateway"
                description="Because almost every external request passes through the gateway, it is a valuable place to generate consistent telemetry."
                icon={Activity}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Request Metadata">
{`X-Request-ID:
req_18271


Trace-ID:
trace_9921


User:
user_42


Route:
/api/bookings


Backend:
booking-service


Latency:
128 ms


Status:
200`}
              </CodeBlock>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Access Logs",
                    "Method, route, status, latency and request identifiers.",
                  ],

                  [
                    "Distributed Tracing",
                    "Propagate trace context through downstream calls.",
                  ],

                  [
                    "Metrics",
                    "Request rate, latency, errors and throttling.",
                  ],

                  [
                    "Audit Logs",
                    "Record security-sensitive gateway actions where required.",
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
                type="warning"
                title="Do not log secrets"
                isDark={
                  isDark
                }
              >
                Authorization tokens,
                passwords, card data
                and sensitive PII
                should not be dumped
                into gateway logs.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* SECURITY                                                */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="security"
                eyebrow="Security Boundary"
                title="API Gateway Security"
                description="The gateway is exposed to untrusted external traffic and should be hardened accordingly."
                icon={ShieldCheck}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "TLS",
                    "Encrypt public API traffic.",
                  ],

                  [
                    "Authentication",
                    "Reject invalid credentials early.",
                  ],

                  [
                    "Authorization",
                    "Apply route and scope policies.",
                  ],

                  [
                    "Rate Limiting",
                    "Limit abuse and expensive workloads.",
                  ],

                  [
                    "Payload Limits",
                    "Prevent extremely large requests from consuming resources.",
                  ],

                  [
                    "WAF Integration",
                    "Filter known malicious request patterns.",
                  ],

                  [
                    "CORS",
                    "Control allowed browser origins for relevant APIs.",
                  ],

                  [
                    "Private Backends",
                    "Avoid exposing internal services directly when not required.",
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
                      <ShieldCheck className="h-5 w-5 text-blue-500" />

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

            {/* ==================================================== */}
            {/* HIGH AVAILABILITY                                       */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="high-availability"
                eyebrow="Reliability"
                title="Avoiding an API Gateway Single Point of Failure"
                description="If every request uses the gateway, the gateway itself must scale horizontally and survive instance failures."
                icon={Network}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Users"
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
                  title="Load Balancer"
                  subtitle="Gateway traffic"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <div className="grid gap-2 sm:grid-cols-3">
                  <DiagramNode
                    icon={ShieldCheck}
                    title="Gateway 1"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DiagramNode
                    icon={ShieldCheck}
                    title="Gateway 2"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DiagramNode
                    icon={ShieldCheck}
                    title="Gateway N"
                    isDark={
                      isDark
                    }
                    highlight
                  />
                </div>

                <DownArrow
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Server}
                  title="Backend Services"
                  isDark={
                    isDark
                  }
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Stateless Gateway",
                    "Keep gateway instances easy to add and replace where possible.",
                  ],

                  [
                    "Multiple Instances",
                    "Do not depend on one gateway process.",
                  ],

                  [
                    "Health Checks",
                    "Remove unhealthy instances from routing.",
                  ],

                  [
                    "Autoscaling",
                    "Scale gateways with request volume, CPU or other relevant metrics.",
                  ],

                  [
                    "External State",
                    "Shared limits or policy state may live in dedicated distributed infrastructure.",
                  ],

                  [
                    "Graceful Drain",
                    "Stop sending new requests before terminating gateway instances.",
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

            {/* ==================================================== */}
            {/* MULTI REGION                                            */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="multi-region"
                eyebrow="Global Architecture"
                title="Multi-Region API Gateway"
                description="Global systems can route users to gateways deployed close to them or in healthy regions."
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
                  title="Global Users"
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
                  title="Global Traffic Manager"
                  subtitle="Latency + health routing"
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

                <div className="grid gap-3 sm:grid-cols-3">
                  <DiagramNode
                    icon={Network}
                    title="India Gateway"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Network}
                    title="US Gateway"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Network}
                    title="EU Gateway"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <Callout
                type="warning"
                title="Global policies create coordination questions"
                isDark={
                  isDark
                }
              >
                Authentication keys,
                global rate limits,
                API configuration and
                policy changes need a
                defined replication
                and consistency
                strategy across
                regions.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* BOOKMYSHOW                                              */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="bookmyshow"
                eyebrow="Case Study"
                title="BookMyShow-Style API Gateway Architecture"
                description="A ticket-booking platform can use an API Gateway to protect and organize its public API surface."
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
                ticket-booking
                architecture for
                interview
                preparation. It is
                not a claim about
                BookMyShow's private
                production
                implementation.
              </Callout>

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Users}
                  title="Web / Mobile"
                  subtitle="Ticket buyers"
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
                  title="CDN / WAF"
                  subtitle="Edge protection"
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

                <DiagramNode
                  icon={ShieldCheck}
                  title="API Gateway"
                  subtitle="Auth • Rate limit • Route • Trace"
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

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <DiagramNode
                    icon={Search}
                    title="Search"
                    subtitle="Movies"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Booking"
                    subtitle="Seat booking"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Payment"
                    subtitle="Transactions"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="User"
                    subtitle="Profiles"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Example Public
                Routing
              </h3>

              <CodeBlock>
{`GET /api/movies/*
        ↓
Search Service


GET /api/shows/*
        ↓
Show Service


POST /api/bookings
        ↓
Booking Service


POST /api/payments
        ↓
Payment Service


GET /api/users/me
        ↓
User Service`}
              </CodeBlock>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Flash Sale Request
                Flow
              </h3>

              <div className="mt-4 space-y-3">
                {[
                  "Request reaches edge infrastructure.",

                  "Gateway validates authentication where required.",

                  "Rate limiter checks IP, user and booking quotas.",

                  "Gateway validates request format.",

                  "Request receives correlation and trace IDs.",

                  "Gateway routes booking request to a healthy booking service.",

                  "Booking service manages seat locking and durable booking logic.",

                  "Payment service handles payment using idempotent operations.",

                  "Gateway returns the final API response.",
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
                title="Gateway does not solve double booking"
                isDark={
                  isDark
                }
              >
                The gateway protects
                and routes the API.
                Booking correctness
                still belongs to the
                booking service,
                Redis seat holds,
                database
                transactions,
                locking and
                idempotency.
              </Callout>
            </section>

            {/* ==================================================== */}
            {/* FAILURE SCENARIOS                                       */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="failures"
                eyebrow="Production Engineering"
                title="API Gateway Failure Scenarios"
                description="Because the gateway sits in the critical request path, failure handling is extremely important."
                icon={TriangleAlert}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-4">
                {[
                  [
                    "Gateway Instance Crashes",
                    "Load balancer should stop routing traffic to the unhealthy instance.",
                  ],

                  [
                    "Backend Service Fails",
                    "Use timeouts, circuit breakers and appropriate fallback behavior.",
                  ],

                  [
                    "Backend Becomes Slow",
                    "Bound request duration so gateway resources are not consumed indefinitely.",
                  ],

                  [
                    "Authentication Provider Is Down",
                    "Define whether cached verification data or another safe fallback is possible.",
                  ],

                  [
                    "Redis Rate Limiter Is Down",
                    "Choose fail-open or fail-closed behavior according to endpoint risk.",
                  ],

                  [
                    "Gateway CPU Saturates",
                    "Autoscale, optimize policies and avoid heavy business computation at the gateway.",
                  ],

                  [
                    "Retry Storm",
                    "Bound retries and add exponential backoff plus jitter.",
                  ],

                  [
                    "Bad Gateway Configuration",
                    "Use validation, staged rollout and rapid rollback for routing/policy changes.",
                  ],

                  [
                    "Region Failure",
                    "Global traffic routing can redirect requests to another healthy region when architecture allows it.",
                  ],

                  [
                    "Certificate Expiry",
                    "Automate certificate monitoring and renewal.",
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
            </section>

            {/* ==================================================== */}
            {/* MONITORING                                              */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="monitoring"
                eyebrow="Observability"
                title="API Gateway Metrics to Monitor"
                description="Gateway metrics provide a broad view of client traffic and backend health."
                icon={Activity}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  "Requests/sec",
                  "P50 Latency",
                  "P95 Latency",
                  "P99 Latency",
                  "2xx Rate",
                  "4xx Rate",
                  "5xx Rate",
                  "429 Rate",
                  "Auth Failures",
                  "Timeout Rate",
                  "Retry Rate",
                  "Circuit Opens",
                  "Gateway CPU",
                  "Gateway Memory",
                  "Active Connections",
                  "Backend Latency",
                  "Backend Errors",
                  "Route Traffic",
                  "Cache Hit Ratio",
                  "TLS Errors",
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

            {/* ==================================================== */}
            {/* INTERVIEW QUESTIONS                                      */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                id="interview"
                eyebrow="Interview Preparation"
                title="API Gateway Interview Questions"
                description="You should be comfortable discussing all of these trade-offs in an HLD interview."
                icon={Sparkles}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-3">
                {[
                  "What is an API Gateway?",

                  "Why do microservices use an API Gateway?",

                  "API Gateway vs Load Balancer?",

                  "API Gateway vs Reverse Proxy?",

                  "Where would you place a gateway in the request path?",

                  "How does path-based routing work?",

                  "How would you implement host-based routing?",

                  "How would the gateway perform authentication?",

                  "How would JWT validation work at the gateway?",

                  "Authentication vs authorization?",

                  "Should services trust the gateway completely?",

                  "Where should rate limiting happen?",

                  "How would free and premium users get different API quotas?",

                  "How can the gateway validate requests?",

                  "What is request transformation?",

                  "Should business logic live in the gateway?",

                  "What is API aggregation?",

                  "What are the problems with excessive API aggregation?",

                  "What is the Backend for Frontend pattern?",

                  "When should gateway responses be cached?",

                  "How should gateway timeouts be configured?",

                  "When is retrying safe?",

                  "Why can gateway retries duplicate payments?",

                  "What is a circuit breaker?",

                  "Explain CLOSED, OPEN and HALF-OPEN circuit states.",

                  "How does the gateway discover backend service instances?",

                  "How would you implement API versioning?",

                  "How would you perform canary routing?",

                  "How would you generate distributed trace IDs?",

                  "What should never be logged by the gateway?",

                  "How do you prevent the gateway from becoming a single point of failure?",

                  "Should gateway instances be stateless?",

                  "How would you scale the API Gateway?",

                  "How do you handle millions of requests per second?",

                  "How would a multi-region gateway architecture work?",

                  "How would you handle a gateway configuration failure?",

                  "How would you protect a BookMyShow flash sale at the gateway?",

                  "What should happen when Redis-based rate limiting fails?",

                  "What gateway metrics would you monitor?",
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

            {/* ==================================================== */}
            {/* FAQ                                                     */}
            {/* ==================================================== */}

            <section className="mt-16">
              <SectionHeading
                eyebrow="Quick Revision"
                title="Frequently Asked Questions"
                description="Short answers to common API Gateway system-design questions."
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

            {/* ==================================================== */}
            {/* BOOK CTA                                                */}
            {/* ==================================================== */}

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
                      Learn how the
                      API Gateway fits
                      into a complete
                      scalable
                      architecture.
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                      Combine API
                      Gateway,
                      caching, load
                      balancing,
                      databases,
                      queues, rate
                      limiting,
                      locking,
                      concurrency and
                      failure handling
                      in complete HLD
                      interview
                      designs.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-blue-100">
                      {[
                        "API Gateway",
                        "Caching",
                        "Load Balancing",
                        "Databases",
                        "Queues",
                        "Rate Limiting",
                        "BookMyShow",
                        "Scalability",
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

            {/* ==================================================== */}
            {/* PREVIOUS / NEXT                                         */}
            {/* ==================================================== */}

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
                {/* PREVIOUS */}

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

                {/* NEXT */}

                {/* <button
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
                </button> */}
              </div>
            </section>
          </main>
        </div>
      </>
    );
  };

export default HLDApiGatewayResource;