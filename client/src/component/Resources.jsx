import React, {

  useEffect,

  useMemo,

  useState,

} from "react";

import { Helmet } from "react-helmet";

import { Link } from "react-router-dom";

import {

  ArrowRight,

  BookOpen,

  Boxes,

  CheckCircle2,

  ChevronRight,

  Code2,

  Database,

  FileText,

  Gauge,

  GraduationCap,

  Layers3,

  Network,

  Search,

  Server,

  ShieldCheck,

  Sparkles,

  Workflow,

  X,

  Zap,

} from "lucide-react";

const SITE_URL =

  "https://www.targettrek.in";

const PAGE_URL =

  `${SITE_URL}/resources`;

const SITE_NAME =

  "TargetTrek";

const THEME_KEY =

  "theme";

const THEME_EVENT =

  "targettrek-theme-change";

const SEO_TITLE =

  "Free Software Engineering Resources, System Design & Backend Guides | TargetTrek";

const SEO_DESCRIPTION =
  "Explore free software engineering resources from TargetTrek. Learn SQL, API engineering, REST, GraphQL, system design, API Gateway, caching, load balancing, databases, message queues, rate limiting and practical backend engineering concepts.";

const readTheme = () => {

  if (

    typeof window === "undefined"

  ) {

    return "light";

  }

  const saved =

    window.localStorage.getItem(

      THEME_KEY

    );

  return saved === "dark"

    ? "dark"

    : "light";

};

const coreResources = [
  {
    title: "SQL",
    description:
      "Master SQL from fundamentals to advanced queries, joins, subqueries, CTEs, window functions, indexes, transactions, ACID, locking, optimization and interview problems.",
    path: "/resources/sql",
    icon: Database,
    tag: "Database",
    keywords:
      "sql database joins subqueries cte window functions indexes transactions acid isolation locking optimization interview queries",
  },
  {
    title: "API Engineering",
    description:
      "Learn REST, RESTful API design, HTTP, GraphQL, authentication, authorization, pagination, idempotency, caching, rate limiting, webhooks, OpenAPI and production API architecture.",
    path: "/resources/apis",
    icon: Boxes,
    tag: "Backend",
    keywords:
      "api rest restful graphql http authentication authorization pagination idempotency caching rate limiting webhook openapi backend",
  },
];

const hldResources = [

  {

    title:

      "Caching",

    description:

      "Learn cache-aside, write-through, write-back, TTL, eviction policies, Redis, distributed caching, consistency and cache invalidation.",

    path:

      "/resources/hld/cache",

    icon:

      Zap,

    tag:

      "Performance",

    keywords:

      "cache caching redis ttl eviction performance distributed system",

  },

  {

    title:

      "Load Balancing",

    description:

      "Understand load balancers, Layer 4 vs Layer 7, routing algorithms, health checks, sticky sessions and high availability.",

    path:

      "/resources/hld/load-balancing",

    icon:

      Network,

    tag:

      "Scalability",

    keywords:

      "load balancing load balancer l4 l7 routing scalability high availability",

  },

  {

    title:

      "Database Design",

    description:

      "Learn SQL vs NoSQL decisions, indexing, replication, sharding, transactions, consistency and database scaling trade-offs.",

    path:

      "/resources/hld/database",

    icon:

      Database,

    tag:

      "Data",

    keywords:

      "database sql nosql indexing replication sharding consistency transactions",

  },

  {

    title:

      "Message Queues",

    description:

      "Understand asynchronous processing, producers, consumers, retries, dead-letter queues, ordering and event-driven systems.",

    path:

      "/resources/hld/message-queue",

    icon:

      Workflow,

    tag:

      "Async Systems",

    keywords:

      "message queue kafka rabbitmq async producer consumer events retries",

  },

  {

    title:

      "Rate Limiting",

    description:

      "Learn token bucket, leaky bucket, fixed window, sliding window and distributed rate limiting with Redis.",

    path:

      "/resources/hld/rate-limiting",

    icon:

      Gauge,

    tag:

      "Reliability",

    keywords:

      "rate limit token bucket sliding window leaky bucket redis throttle",

  },

  {

    title:

      "API Gateway",

    description:

      "Learn routing, authentication, authorization, throttling, BFF, aggregation, retries, circuit breakers and gateway security.",

    path:

      "/resources/hld/api-gateway",

    icon:

      ShieldCheck,

    tag:

      "Microservices",

    keywords:

      "api gateway routing authentication authorization bff circuit breaker microservices",

  },

];

const upcomingTracks = [
  {
    title: "Backend Engineering",
    description:
      "APIs, authentication, concurrency, distributed systems, queues, caching and production backend patterns.",
    icon: Server,
  },
  {
    title: "Java",
    description:
      "Java fundamentals, OOP, collections, concurrency, JVM concepts and interview-focused engineering topics.",
    icon: Code2,
  },
  {
    title: "Spring Boot",
    description:
      "REST APIs, dependency injection, persistence, validation, security and production Spring Boot practices.",
    icon: Layers3,
  },
  {
    title: "DevOps",
    description:
      "Docker, CI/CD, cloud deployment, monitoring, scaling and practical production operations.",
    icon: Workflow,
  },
];

const learningFlow = [

  {

    number:

      "01",

    title:

      "Understand the concept",

    description:

      "Start with the problem a component solves and where it fits in a real architecture.",

  },

  {

    number:

      "02",

    title:

      "See the architecture",

    description:

      "Use diagrams and request flows to understand how clients, infrastructure and services connect.",

  },

  {

    number:

      "03",

    title:

      "Study trade-offs",

    description:

      "Learn when a solution works well, when it fails and what alternatives an interviewer may expect.",

  },

  {

    number:

      "04",

    title:

      "Prepare for interviews",

    description:

      "Revise common questions, failure cases, scaling decisions and production considerations.",

  },

];

function SectionHeading({

  eyebrow,

  title,

  description,

  center = false,

  isDark,

}) {

  return (

    <div

      className={`max-w-3xl ${

        center

          ? "mx-auto text-center"

          : ""

      }`}

    >

      <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-500">

        {eyebrow}

      </p>

      <h2

        className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl ${

          isDark

            ? "text-white"

            : "text-slate-950"

        }`}

      >

        {title}

      </h2>

      {description && (

        <p

          className={`mt-4 text-sm leading-7 sm:text-base ${

            isDark

              ? "text-slate-400"

              : "text-slate-600"

          }`}

        >

          {description}

        </p>

      )}

    </div>

  );

}

function ResourceCard({

  resource,

  isDark,

}) {

  const Icon =

    resource.icon;

  return (

    <Link

      to={resource.path}

      className={`group flex h-full flex-col rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 sm:p-6 ${

        isDark

          ? "border-slate-800 bg-[#101924] hover:border-blue-800 hover:shadow-[0_18px_50px_rgba(0,0,0,.25)]"

          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(15,23,42,.08)]"

      }`}

    >

      <div className="flex items-start justify-between gap-4">

        <div

          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${

            isDark

              ? "bg-blue-950/40 text-blue-300"

              : "bg-blue-50 text-blue-600"

          }`}

        >

          <Icon className="h-6 w-6" />

        </div>

        <span

          className={`rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] ${

            isDark

              ? "border-slate-700 bg-slate-900 text-slate-400"

              : "border-slate-200 bg-slate-50 text-slate-500"

          }`}

        >

          {resource.tag}

        </span>

      </div>

      <h3

        className={`mt-5 text-xl font-black tracking-tight transition-colors group-hover:text-blue-500 ${

          isDark

            ? "text-white"

            : "text-slate-950"

        }`}

      >

        {resource.title}

      </h3>

      <p

        className={`mt-3 flex-1 text-sm leading-7 ${

          isDark

            ? "text-slate-400"

            : "text-slate-600"

        }`}

      >

        {resource.description}

      </p>

      <div

        className={`mt-6 flex items-center justify-between border-t pt-4 ${

          isDark

            ? "border-slate-800"

            : "border-slate-100"

        }`}

      >

        <span className="text-xs font-black text-blue-500">

          Learn this topic

        </span>

        <span

          className={`flex h-9 w-9 items-center justify-center rounded-full transition group-hover:bg-blue-600 group-hover:text-white ${

            isDark

              ? "bg-slate-800 text-slate-300"

              : "bg-slate-100 text-slate-600"

          }`}

        >

          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />

        </span>

      </div>

    </Link>

  );

}

export default function Resources() {

  const [

    theme,

    setTheme,

  ] = useState(

    readTheme

  );

  const [

    search,

    setSearch,

  ] = useState("");

  const isDark =

    theme === "dark";

  useEffect(() => {

    setTheme(

      readTheme()

    );

    const handleThemeChange =

      (event) => {

        const newTheme =

          event?.detail?.theme;

        if (

          newTheme === "dark" ||

          newTheme === "light"

        ) {

          setTheme(

            newTheme

          );

        }

      };

    const handleStorageChange =

      (event) => {

        if (

          event.key !==

          THEME_KEY

        ) {

          return;

        }

        if (

          event.newValue ===

            "dark" ||

          event.newValue ===

            "light"

        ) {

          setTheme(

            event.newValue

          );

        }

      };

    window.addEventListener(

      THEME_EVENT,

      handleThemeChange

    );

    window.addEventListener(

      "storage",

      handleStorageChange

    );

    return () => {

      window.removeEventListener(

        THEME_EVENT,

        handleThemeChange

      );

      window.removeEventListener(

        "storage",

        handleStorageChange

      );

    };

  }, []);

  const filteredResources =

    useMemo(() => {

      const query =

        search

          .trim()

          .toLowerCase();

      if (!query) {

        return hldResources;

      }

      return hldResources.filter(

        (resource) =>

          [

            resource.title,

            resource.description,

            resource.tag,

            resource.keywords,

          ]

            .join(" ")

            .toLowerCase()

            .includes(query)

      );

    }, [search]);

  const structuredData =

    useMemo(

      () => ({

        "@context":

          "https://schema.org",

        "@graph": [

          {

            "@type":

              "CollectionPage",

            "@id":

              `${PAGE_URL}#webpage`,

            url:

              PAGE_URL,

            name:

              SEO_TITLE,

            description:

              SEO_DESCRIPTION,

            isPartOf: {

              "@type":

                "WebSite",

              name:

                SITE_NAME,

              url:

                SITE_URL,

            },

          },

          {

            "@type":

              "BreadcrumbList",

            "@id":

              `${PAGE_URL}#breadcrumb`,

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

                  "Resources",

                item:

                  PAGE_URL,

              },

            ],

          },

          {
            "@type": "ItemList",
            "@id": `${PAGE_URL}#core-resources`,
            name: "Core Engineering Resources",
            numberOfItems: coreResources.length,
            itemListElement: coreResources.map((resource, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: resource.title,
              url: `${SITE_URL}${resource.path}`,
            })),
          },

          {
            "@type": "ItemList",
            "@id": `${PAGE_URL}#hld-resources`,
            name: "System Design HLD Resources",
            numberOfItems: hldResources.length,
            itemListElement: hldResources.map((resource, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: resource.title,
              url: `${SITE_URL}${resource.path}`,
            })),
          },

        ],

      }),

      []

    );

  const pageBg =

    isDark

      ? "bg-[#080D14]"

      : "bg-[#F7F9FC]";

  const sectionBg =

    isDark

      ? "bg-[#0B111A]"

      : "bg-white";

  const softBg =

    isDark

      ? "bg-[#0C131D]"

      : "bg-slate-50";

  const cardBg =

    isDark

      ? "bg-[#101924]"

      : "bg-white";

  const primaryText =

    isDark

      ? "text-white"

      : "text-slate-950";

  const secondaryText =

    isDark

      ? "text-slate-400"

      : "text-slate-600";

  const mutedText =

    isDark

      ? "text-slate-500"

      : "text-slate-500";

  const border =

    isDark

      ? "border-slate-800"

      : "border-slate-200";

  return (

    <>

      <Helmet>

        <title>

          {SEO_TITLE}

        </title>

        <meta

          name="description"

          content={

            SEO_DESCRIPTION

          }

        />

        <meta

          name="keywords"

          content="software engineering resources, SQL tutorial, SQL interview questions, API tutorial, REST API, GraphQL, system design resources, HLD tutorial, API gateway system design, caching system design, load balancing, database system design, message queues, rate limiting, backend engineering, TargetTrek"

        />

        <meta

          name="robots"

          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"

        />

        <meta

          name="googlebot"

          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"

        />

        <meta

          name="theme-color"

          content={

            isDark

              ? "#080D14"

              : "#ffffff"

          }

        />

        <link

          rel="canonical"

          href={PAGE_URL}

        />

        <meta

          property="og:type"

          content="website"

        />

        <meta

          property="og:site_name"

          content={

            SITE_NAME

          }

        />

        <meta

          property="og:title"

          content={

            SEO_TITLE

          }

        />

        <meta

          property="og:description"

          content={

            SEO_DESCRIPTION

          }

        />

        <meta

          property="og:url"

          content={PAGE_URL}

        />

        <meta

          name="twitter:card"

          content="summary"

        />

        <meta

          name="twitter:title"

          content={

            SEO_TITLE

          }

        />

        <meta

          name="twitter:description"

          content={

            SEO_DESCRIPTION

          }

        />

        <script

          type="application/ld+json"

        >

          {JSON.stringify(

            structuredData

          )}

        </script>

      </Helmet>

      <main

        className={`min-h-screen w-full overflow-x-hidden pt-16 transition-colors duration-300 ${pageBg} ${primaryText}`}

      >

        <section

          className={`relative overflow-hidden border-b ${border} ${sectionBg}`}

        >

          <div className="pointer-events-none absolute inset-0">

            <div

              className={`absolute -left-44 -top-44 h-[500px] w-[500px] rounded-full blur-[140px] ${

                isDark

                  ? "bg-blue-900/15"

                  : "bg-blue-100/70"

              }`}

            />

            <div

              className={`absolute -right-48 top-10 h-[520px] w-[520px] rounded-full blur-[140px] ${

                isDark

                  ? "bg-indigo-900/10"

                  : "bg-indigo-100/60"

              }`}

            />

            <div

              className="absolute inset-0 opacity-40"

              style={{

                backgroundImage:

                  isDark

                    ? "linear-gradient(rgba(59,130,246,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.035) 1px, transparent 1px)"

                    : "linear-gradient(rgba(37,99,235,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.035) 1px, transparent 1px)",

                backgroundSize:

                  "42px 42px",

              }}

            />

          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-16 lg:px-8 lg:py-24">

            <div>

              <span

                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.16em] sm:text-[11px] ${

                  isDark

                    ? "border-blue-900/60 bg-blue-950/30 text-blue-300"

                    : "border-blue-200 bg-blue-50 text-blue-700"

                }`}

              >

                <GraduationCap className="h-4 w-4" />

                Free Engineering Resources

              </span>

              <h1

                className={`mt-6 max-w-4xl text-4xl font-black leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-6xl xl:text-[68px] ${primaryText}`}

              >

                Learn software

                engineering{" "}

                <span className="text-blue-500">

                  one concept at a

                  time.

                </span>

              </h1>

              <p

                className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${secondaryText}`}

              >

                Explore practical,

                interview-focused

                engineering guides

                covering System

                Design, scalability,

                databases,

                distributed systems

                and backend

                architecture.

              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">

                <button

                  type="button"

                  onClick={() =>

                    document

                      .getElementById(

                        "core-resources"

                      )

                      ?.scrollIntoView({

                        behavior:

                          "smooth",

                      })

                  }

                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700 sm:w-auto"

                >

                  Explore Resources

                  <ArrowRight className="h-4 w-4" />

                </button>

                <Link

                  to="/book/system-design/hld"

                  className={`inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border px-6 py-3 text-sm font-black transition sm:w-auto ${

                    isDark

                      ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-700"

                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"

                  }`}

                >

                  <BookOpen className="h-4 w-4" />

                  System Design Book

                </Link>

              </div>

              <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3">

                {[

                  "Free to read",

                  "Interview focused",

                  "Architecture diagrams",

                  "Mobile friendly",

                ].map(

                  (item) => (

                    <span

                      key={

                        item

                      }

                      className={`flex items-center gap-2 text-xs font-bold sm:text-sm ${secondaryText}`}

                    >

                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

                      {item}

                    </span>

                  )

                )}

              </div>

            </div>

            <div className="mx-auto w-full max-w-[470px]">

              <div

                className={`relative overflow-hidden rounded-3xl border p-5 shadow-2xl sm:p-7 ${border} ${cardBg}`}

              >

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500">

                      System Design

                      Learning Path

                    </p>

                    <h2

                      className={`mt-2 text-xl font-black sm:text-2xl ${primaryText}`}

                    >

                      Build your HLD

                      foundation

                    </h2>

                  </div>

                  <div

                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${

                      isDark

                        ? "bg-blue-950/40 text-blue-300"

                        : "bg-blue-50 text-blue-600"

                    }`}

                  >

                    <Network className="h-6 w-6" />

                  </div>

                </div>

                <div className="mt-7 space-y-3">

                  {[

                    [

                      "01",

                      "Traffic",

                      "Load balancing & rate limiting",

                    ],

                    [

                      "02",

                      "Data",

                      "Databases & caching",

                    ],

                    [

                      "03",

                      "Communication",

                      "Queues & asynchronous systems",

                    ],

                    [

                      "04",

                      "Entry Layer",

                      "API Gateway & service routing",

                    ],

                  ].map(

                    ([

                      number,

                      title,

                      text,

                    ]) => (

                      <div

                        key={

                          number

                        }

                        className={`flex gap-4 rounded-2xl border p-4 ${border} ${

                          isDark

                            ? "bg-[#0C131D]"

                            : "bg-slate-50"

                        }`}

                      >

                        <span

                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-black ${

                            isDark

                              ? "bg-slate-800 text-blue-300"

                              : "bg-blue-100 text-blue-700"

                          }`}

                        >

                          {number}

                        </span>

                        <div>

                          <p

                            className={`font-black ${primaryText}`}

                          >

                            {title}

                          </p>

                          <p

                            className={`mt-1 text-xs leading-5 ${secondaryText}`}

                          >

                            {text}

                          </p>

                        </div>

                      </div>

                    )

                  )}

                </div>

                <div

                  className={`mt-6 border-t pt-5 ${border}`}

                >

                  <div className="grid grid-cols-3 gap-3 text-center">

                    <div>

                      <p className="text-xl font-black text-blue-500">

                        {

                          hldResources.length

                        }

                      </p>

                      <p

                        className={`mt-1 text-[10px] font-bold ${mutedText}`}

                      >

                        HLD Topics

                      </p>

                    </div>

                    <div>

                      <p className="text-xl font-black text-blue-500">

                        Free

                      </p>

                      <p

                        className={`mt-1 text-[10px] font-bold ${mutedText}`}

                      >

                        Access

                      </p>

                    </div>

                    <div>

                      <p className="text-xl font-black text-blue-500">

                        HLD

                      </p>

                      <p

                        className={`mt-1 text-[10px] font-bold ${mutedText}`}

                      >

                        Focus

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        <section

          className={`border-b ${border} ${sectionBg}`}

        >

          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px sm:grid-cols-4">

            {[

              [

                FileText,

                "Concepts",

                "Clear explanations",

              ],

              [

                Network,

                "Architecture",

                "Visual system flows",

              ],

              [

                ShieldCheck,

                "Trade-offs",

                "Production thinking",

              ],

              [

                Sparkles,

                "Interviews",

                "Focused revision",

              ],

            ].map(

              ([

                Icon,

                title,

                text,

              ]) => (

                <div

                  key={

                    title

                  }

                  className={`p-4 sm:p-6 ${

                    isDark

                      ? "bg-[#0B111A]"

                      : "bg-white"

                  }`}

                >

                  <Icon className="h-5 w-5 text-blue-500" />

                  <p

                    className={`mt-3 text-sm font-black ${primaryText}`}

                  >

                    {title}

                  </p>

                  <p

                    className={`mt-1 text-[11px] leading-5 sm:text-xs ${secondaryText}`}

                  >

                    {text}

                  </p>

                </div>

              )

            )}

          </div>

        </section>
        <section
          id="core-resources"
          className={`scroll-mt-24 border-b py-16 sm:py-20 lg:py-24 ${border} ${sectionBg}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                eyebrow="Now Available"
                title="Core engineering resources"
                description="Two complete resources are now live: SQL for database engineering and API Engineering for designing reliable production APIs."
                isDark={isDark}
              />

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-black ${
                  isDark
                    ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-300"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                {coreResources.length} complete guides
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {coreResources.map((resource) => (
                <ResourceCard
                  key={resource.path}
                  resource={resource}
                  isDark={isDark}
                />
              ))}
            </div>

            <div
              className={`mt-6 rounded-2xl border p-5 sm:p-6 ${
                isDark
                  ? "border-blue-900/50 bg-blue-950/20"
                  : "border-blue-200 bg-blue-50/70"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p
                    className={`text-sm font-black ${
                      isDark ? "text-blue-200" : "text-blue-900"
                    }`}
                  >
                    Recommended learning path
                  </p>

                  <p
                    className={`mt-1 max-w-3xl text-sm leading-6 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    Start with SQL to understand how application data is stored,
                    queried and optimized. Then move to API Engineering to learn
                    how backend systems expose, secure and scale access to that
                    data.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-xs font-black text-blue-500">
                  SQL
                  <ArrowRight className="h-4 w-4" />
                  API Engineering
                </div>
              </div>
            </div>
          </div>
        </section>

        <section

          id="hld-resources"

          className={`scroll-mt-24 py-16 sm:py-20 lg:py-24 ${pageBg}`}

        >

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

              <SectionHeading

                eyebrow="System Design / HLD"

                title="High Level Design resources"

                description="Build your system design foundation through focused topics covering the components that appear repeatedly in backend and HLD interviews."

                isDark={

                  isDark

                }

              />

              <div className="w-full lg:max-w-sm">

                <div className="relative">

                  <Search

                    className={`absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedText}`}

                  />

                  <input

                    type="search"

                    value={

                      search

                    }

                    onChange={(

                      event

                    ) =>

                      setSearch(

                        event.target

                          .value

                      )

                    }

                    placeholder="Search HLD topics..."

                    aria-label="Search system design resources"

                    className={`h-12 w-full rounded-xl border pl-11 pr-11 text-sm outline-none transition ${

                      isDark

                        ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-900/30"

                        : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"

                    }`}

                  />

                  {search && (

                    <button

                      type="button"

                      aria-label="Clear search"

                      onClick={() =>

                        setSearch("")

                      }

                      className={`absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg ${

                        isDark

                          ? "hover:bg-slate-800"

                          : "hover:bg-slate-100"

                      }`}

                    >

                      <X

                        className={`h-4 w-4 ${mutedText}`}

                      />

                    </button>

                  )}

                </div>

              </div>

            </div>

            <div className="mt-10">

              {filteredResources.length >

              0 ? (

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {filteredResources.map(

                    (resource) => (

                      <ResourceCard

                        key={

                          resource.path

                        }

                        resource={

                          resource

                        }

                        isDark={

                          isDark

                        }

                      />

                    )

                  )}

                </div>

              ) : (

                <div

                  className={`rounded-3xl border px-5 py-14 text-center sm:px-8 ${border} ${cardBg}`}

                >

                  <div

                    className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${

                      isDark

                        ? "bg-slate-800"

                        : "bg-slate-100"

                    }`}

                  >

                    <Search

                      className={`h-6 w-6 ${mutedText}`}

                    />

                  </div>

                  <h3

                    className={`mt-5 text-xl font-black ${primaryText}`}

                  >

                    No resources found

                  </h3>

                  <p

                    className={`mt-2 text-sm ${secondaryText}`}

                  >

                    Try searching for

                    another system

                    design topic.

                  </p>

                  <button

                    type="button"

                    onClick={() =>

                      setSearch("")

                    }

                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-black text-white hover:bg-blue-700"

                  >

                    Clear Search

                  </button>

                </div>

              )}

            </div>

          </div>

        </section>

        <section

          className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${sectionBg}`}

        >

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <SectionHeading

              eyebrow="How to use these resources"

              title="Learn system design in a practical sequence"

              description="Each resource is designed to help you understand the component itself and how it participates in a larger distributed architecture."

              center

              isDark={

                isDark

              }

            />

            <div className="relative mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              {learningFlow.map(

                (

                  item,

                  index

                ) => (

                  <div

                    key={

                      item.number

                    }

                    className="relative"

                  >

                    {index <

                      learningFlow.length -

                        1 && (

                      <ChevronRight

                        className={`absolute -right-4 top-10 z-10 hidden h-5 w-5 lg:block ${

                          isDark

                            ? "text-slate-700"

                            : "text-slate-300"

                        }`}

                      />

                    )}

                    <article

                      className={`h-full rounded-2xl border p-5 sm:p-6 ${border} ${

                        isDark

                          ? "bg-[#101924]"

                          : "bg-slate-50"

                      }`}

                    >

                      <span className="font-mono text-xs font-black tracking-[0.14em] text-blue-500">

                        STEP{" "}

                        {item.number}

                      </span>

                      <h3

                        className={`mt-5 text-lg font-black ${primaryText}`}

                      >

                        {item.title}

                      </h3>

                      <p

                        className={`mt-3 text-sm leading-7 ${secondaryText}`}

                      >

                        {

                          item.description

                        }

                      </p>

                    </article>

                  </div>

                )

              )}

            </div>

          </div>

        </section>

        <section

          className={`py-16 sm:py-20 lg:py-24 ${softBg}`}

        >

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <SectionHeading

              eyebrow="Growing resource library"

              title="More engineering topics are coming"

              description="The free resource library is continuing to expand with backend, Java, Spring Boot and DevOps learning tracks."

              isDark={

                isDark

              }

            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {upcomingTracks.map(

                ({

                  icon: Icon,

                  title,

                  description,

                }) => (

                  <article

                    key={

                      title

                    }

                    className={`rounded-2xl border p-5 sm:p-6 ${border} ${cardBg}`}

                  >

                    <div className="flex items-start justify-between gap-4">

                      <div

                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${

                          isDark

                            ? "bg-slate-800 text-blue-300"

                            : "bg-blue-50 text-blue-600"

                        }`}

                      >

                        <Icon className="h-5 w-5" />

                      </div>

                      <span

                        className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${

                          isDark

                            ? "bg-slate-800 text-slate-400"

                            : "bg-slate-100 text-slate-500"

                        }`}

                      >

                        Coming Soon

                      </span>

                    </div>

                    <h3

                      className={`mt-5 text-lg font-black ${primaryText}`}

                    >

                      {title}

                    </h3>

                    <p

                      className={`mt-2 text-sm leading-7 ${secondaryText}`}

                    >

                      {description}

                    </p>

                  </article>

                )

              )}

            </div>

          </div>

        </section>

        <section

          className={`border-y py-16 sm:py-20 lg:py-24 ${border} ${sectionBg}`}

        >

          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-8">

            <div>

              <SectionHeading

                eyebrow="Resources vs books"

                title="Use free resources for focused concepts. Use books for complete preparation."

                description="The resource library helps you learn individual components. TargetTrek books connect those components into complete interview-ready systems and structured learning paths."

                isDark={

                  isDark

                }

              />

              <Link

                to="/books"

                className="mt-7 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700 sm:w-auto"

              >

                Explore All Books

                <ArrowRight className="h-4 w-4" />

              </Link>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div

                className={`rounded-2xl border p-5 sm:p-6 ${border} ${

                  isDark

                    ? "bg-[#101924]"

                    : "bg-slate-50"

                }`}

              >

                <FileText className="h-6 w-6 text-blue-500" />

                <h3

                  className={`mt-5 text-xl font-black ${primaryText}`}

                >

                  Free Resources

                </h3>

                <p

                  className={`mt-2 text-sm leading-7 ${secondaryText}`}

                >

                  Best for learning a

                  specific concept

                  such as caching,

                  rate limiting,

                  databases or API

                  gateways.

                </p>

                <ul

                  className={`mt-5 space-y-3 text-sm ${secondaryText}`}

                >

                  {[

                    "Focused topics",

                    "Quick revision",

                    "Architecture basics",

                    "Interview questions",

                  ].map(

                    (item) => (

                      <li

                        key={

                          item

                        }

                        className="flex items-center gap-2"

                      >

                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

                        {item}

                      </li>

                    )

                  )}

                </ul>

              </div>

              <div

                className={`rounded-2xl border p-5 sm:p-6 ${

                  isDark

                    ? "border-blue-900/60 bg-blue-950/20"

                    : "border-blue-200 bg-blue-50"

                }`}

              >

                <BookOpen className="h-6 w-6 text-blue-500" />

                <h3

                  className={`mt-5 text-xl font-black ${primaryText}`}

                >

                  Structured Books

                </h3>

                <p

                  className={`mt-2 text-sm leading-7 ${secondaryText}`}

                >

                  Best when you want

                  an end-to-end path

                  covering multiple

                  topics, design

                  decisions and full

                  interview systems.

                </p>

                <ul

                  className={`mt-5 space-y-3 text-sm ${secondaryText}`}

                >

                  {[

                    "Complete learning path",

                    "Detailed system designs",

                    "Trade-offs & edge cases",

                    "Interview preparation",

                  ].map(

                    (item) => (

                      <li

                        key={

                          item

                        }

                        className="flex items-center gap-2"

                      >

                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

                        {item}

                      </li>

                    )

                  )}

                </ul>

              </div>

            </div>

          </div>

        </section>

        <section

          className={`py-16 sm:py-20 ${pageBg}`}

        >

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <SectionHeading

              eyebrow="Why TargetTrek resources"

              title="Built around engineering understanding, not memorization"

              description="The goal is to help you understand why a component exists, how it works and how to discuss its trade-offs."

              center

              isDark={

                isDark

              }

            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {[

                {

                  icon:

                    Network,

                  title:

                    "Architecture first",

                  text:

                    "See where each component sits in a complete system.",

                },

                {

                  icon:

                    Code2,

                  title:

                    "Developer focused",

                  text:

                    "Explanations are written for software engineers and backend developers.",

                },

                {

                  icon:

                    ShieldCheck,

                  title:

                    "Trade-offs included",

                  text:

                    "Understand failure cases, reliability and production concerns.",

                },

                {

                  icon:

                    Sparkles,

                  title:

                    "Interview ready",

                  text:

                    "Connect concepts with the questions commonly discussed in system design interviews.",

                },

              ].map(

                ({

                  icon: Icon,

                  title,

                  text,

                }) => (

                  <article

                    key={

                      title

                    }

                    className={`rounded-2xl border p-5 sm:p-6 ${border} ${cardBg}`}

                  >

                    <div

                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${

                        isDark

                          ? "bg-blue-950/40 text-blue-300"

                          : "bg-blue-50 text-blue-600"

                      }`}

                    >

                      <Icon className="h-5 w-5" />

                    </div>

                    <h3

                      className={`mt-5 text-lg font-black ${primaryText}`}

                    >

                      {title}

                    </h3>

                    <p

                      className={`mt-2 text-sm leading-7 ${secondaryText}`}

                    >

                      {text}

                    </p>

                  </article>

                )

              )}

            </div>

          </div>

        </section>

        <section

          className={`border-t px-4 py-16 sm:px-6 sm:py-20 lg:px-8 ${border} ${

            isDark

              ? "bg-[#080D14]"

              : "bg-[#0B111A]"

          }`}

        >

          <div className="mx-auto flex max-w-6xl flex-col gap-7 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-400">

                Keep learning

              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">

                Build stronger

                system design

                fundamentals.

              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">

                Start with free HLD

                resources, then move

                into complete system

                design preparation

                when you're

                ready.

              </p>

            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">

              <Link

                to="/book/system-design/hld"

                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700 sm:w-auto"

              >

                Master HLD Book

                <ArrowRight className="h-4 w-4" />

              </Link>

              <Link

                to="/learn"

                className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-slate-700 bg-slate-900 px-6 py-3 text-sm font-black text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 sm:w-auto"

              >

                Back to Learn

              </Link>

            </div>

          </div>

        </section>

      </main>

    </>

  );

}
