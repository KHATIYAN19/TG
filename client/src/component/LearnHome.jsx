import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Code2,
  Database,
  FileText,
  GraduationCap,
  Layers3,
  Network,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  Helmet,
} from "react-helmet";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const SITE_URL =
  "https://www.targettrek.in";

const PAGE_URL =
  `${SITE_URL}/learn`;

const THEME_KEY =
  "theme";

const THEME_EVENT =
  "targettrek-theme-change";

/*
|--------------------------------------------------------------------------
| READ THEME
|--------------------------------------------------------------------------
*/

const readTheme = () => {
  if (
    typeof window ===
    "undefined"
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

/*
|--------------------------------------------------------------------------
| MAIN LEARNING AREAS
|--------------------------------------------------------------------------
*/

const LEARNING_AREAS = [
  {
    title:
      "Technical Books",

    description:
      "Structured technical books for developers preparing for system design, backend and software engineering interviews.",

    path:
      "/books",

    button:
      "Explore Books",

    icon:
      BookOpen,

    items: [
      "System Design HLD",
      "System Design LLD",
      "GenAI learning",
    ],
  },

  {
    title:
      "Interview Experiences",

    description:
      "Explore real interview processes, coding rounds, LLD, HLD, backend, AI and managerial discussions.",

    path:
      "/interviews",

    button:
      "Read Interviews",

    icon:
      Briefcase,

    items: [
      "SDE Interviews",
      "Backend Interviews",
      "AI / GenAI Interviews",
    ],
  },

  {
    title:
      "Free Resources",

    description:
      "Learn focused engineering concepts through practical explanations, diagrams, examples and interview-oriented notes.",

    path:
      "/resources/hld/cache",

    button:
      "Start Learning",

    icon:
      GraduationCap,

    items: [
      "System Design",
      "Architecture Concepts",
      "Engineering Fundamentals",
    ],
  },

  {
    title:
      "Engineering Blogs",

    description:
      "Read articles covering software engineering, development, interview preparation and practical technical topics.",

    path:
      "/blogs",

    button:
      "Read Blogs",

    icon:
      FileText,

    items: [
      "Engineering",
      "Interview Preparation",
      "Developer Learning",
    ],
  },
];

/*
|--------------------------------------------------------------------------
| FEATURED BOOKS
|--------------------------------------------------------------------------
*/

const FEATURED_BOOKS = [
  {
    title:
      "Mastering System Design — HLD",

    label:
      "High-Level Design",

    description:
      "Build a strong system-design interview approach covering requirements, APIs, databases, caching, scalability, concurrency, failure handling and architectural trade-offs.",

    topics: [
      "Requirements",
      "Architecture",
      "Caching",
      "Databases",
      "Scalability",
      "Trade-offs",
    ],

    path:
      "/book/system-design/hld",

    icon:
      Network,
  },

  {
    title:
      "Mastering System Design — LLD",

    label:
      "Java",

    description:
      "Strengthen object-oriented design using Java with OOP, SOLID, design patterns, UML, concurrency and interview-focused low-level design problems.",

    topics: [
      "OOP",
      "SOLID",
      "Java",
      "Patterns",
      "UML",
      "Concurrency",
    ],

    path:
      "/book/system-design/lld",

    icon:
      Code2,
  },
];

/*
|--------------------------------------------------------------------------
| CURRENT FREE RESOURCES
|--------------------------------------------------------------------------
|
| These routes currently exist in App.jsx.
|
*/

const FREE_RESOURCES = [
  {
    title:
      "Caching",

    description:
      "Understand caching strategies, invalidation, eviction policies, hot keys and distributed caching concepts.",

    path:
      "/resources/hld/cache",

    icon:
      Layers3,
  },

  {
    title:
      "Load Balancing",

    description:
      "Learn traffic distribution, L4 vs L7, balancing algorithms, health checks and high availability.",

    path:
      "/resources/hld/load-balancing",

    icon:
      Network,
  },

  {
    title:
      "Database Design",

    description:
      "Explore database selection, indexing, replication, sharding, consistency and scaling fundamentals.",

    path:
      "/resources/hld/database",

    icon:
      Database,
  },

  {
    title:
      "Message Queues",

    description:
      "Learn asynchronous processing, queues, consumer groups, retries, delivery guarantees and event-driven systems.",

    path:
      "/resources/hld/message-queue",

    icon:
      Rocket,
  },

  {
    title:
      "Rate Limiting",

    description:
      "Understand token bucket, leaky bucket, sliding windows and distributed API rate limiting.",

    path:
      "/resources/hld/rate-limiting",

    icon:
      ShieldCheck,
  },

  {
    title:
      "API Gateway",

    description:
      "Learn routing, authentication, authorization, throttling, resilience and API gateway architecture.",

    path:
      "/resources/hld/api-gateway",

    icon:
      Network,
  },
];

/*
|--------------------------------------------------------------------------
| WHY TARGETTREK
|--------------------------------------------------------------------------
*/

const BENEFITS = [
  {
    title:
      "Practical Learning",

    description:
      "Focused explanations built around concepts developers actually encounter in interviews and engineering work.",

    icon:
      Code2,
  },

  {
    title:
      "Interview Focused",

    description:
      "Connect technical concepts with interview questions, design discussions and real interview experiences.",

    icon:
      Briefcase,
  },

  {
    title:
      "Structured Content",

    description:
      "Move from individual concepts to complete preparation without jumping through disconnected material.",

    icon:
      Layers3,
  },

  {
    title:
      "Free + In-Depth",

    description:
      "Start with free resources and use structured books when you want deeper, connected preparation.",

    icon:
      BookOpen,
  },
];

/*
|--------------------------------------------------------------------------
| SECTION HEADER
|--------------------------------------------------------------------------
*/

const SectionHeader = ({
  eyebrow,
  title,
  description,
  isDark,
  center = false,
}) => {
  return (
    <div
      className={
        center
          ? "mx-auto max-w-3xl text-center"
          : "max-w-3xl"
      }
    >
      {eyebrow && (
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-500">
          {eyebrow}
        </p>
      )}

      <h2
        className={`mt-2 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl ${
          isDark
            ? "text-white"
            : "text-slate-950"
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-3 text-sm leading-7 sm:text-base ${
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
};

/*
|--------------------------------------------------------------------------
| LEARN HOME
|--------------------------------------------------------------------------
*/

const LearnHome = () => {
  /*
  |--------------------------------------------------------------------------
  | THEME
  |--------------------------------------------------------------------------
  |
  | Navbar controls the theme.
  |
  | This page:
  |
  | - reads localStorage
  | - listens to Navbar
  | - DOES NOT contain a toggle
  |
  */

  const [
    theme,
    setTheme,
  ] = useState(
    readTheme
  );

  const isDark =
    theme === "dark";

  /*
  |--------------------------------------------------------------------------
  | LISTEN TO NAVBAR THEME
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    setTheme(
      readTheme()
    );

    /*
    |--------------------------------------------------------------------------
    | SAME TAB
    |--------------------------------------------------------------------------
    */

    const handleThemeChange =
      (event) => {
        const newTheme =
          event?.detail
            ?.theme;

        if (
          newTheme === "dark" ||
          newTheme === "light"
        ) {
          setTheme(
            newTheme
          );
        }
      };

    /*
    |--------------------------------------------------------------------------
    | OTHER TAB
    |--------------------------------------------------------------------------
    */

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

  /*
  |--------------------------------------------------------------------------
  | THEME CLASSES
  |--------------------------------------------------------------------------
  */

  const pageBg =
    isDark
      ? "bg-[#080D14]"
      : "bg-[#F7FAFC]";

  const sectionBg =
    isDark
      ? "bg-[#0B111A]"
      : "bg-white";

  const surface =
    isDark
      ? "border-slate-800 bg-[#101720]"
      : "border-slate-200 bg-white";

  const surfaceSoft =
    isDark
      ? "border-slate-800 bg-[#0C131C]"
      : "border-slate-200 bg-slate-50";

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
    "Learn software engineering with TargetTrek. Explore system design books, Java LLD preparation, real software engineering interview experiences, free engineering resources and technical blogs.";

  const webPageSchema =
    useMemo(
      () => ({
        "@context":
          "https://schema.org",

        "@type":
          "CollectionPage",

        name:
          "TargetTrek Learn",

        headline:
          "Software Engineering Books, Interviews and Learning Resources",

        description:
          seoDescription,

        url:
          PAGE_URL,

        isPartOf: {
          "@type":
            "WebSite",

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

        about: [
          "Software Engineering",
          "System Design",
          "Java",
          "Backend Engineering",
          "Technical Interviews",
          "Developer Learning",
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
              "Learn",

            item:
              PAGE_URL,
          },
        ],
      }),
      []
    );

  const learningListSchema =
    useMemo(
      () => ({
        "@context":
          "https://schema.org",

        "@type":
          "ItemList",

        name:
          "TargetTrek Learning Sections",

        itemListElement:
          [
            {
              name:
                "Books",

              url:
                `${SITE_URL}/books`,
            },

            {
              name:
                "Interview Experiences",

              url:
                `${SITE_URL}/interviews`,
            },

            {
              name:
                "Engineering Blogs",

              url:
                `${SITE_URL}/blogs`,
            },

            ...FREE_RESOURCES.map(
              (
                resource
              ) => ({
                name:
                  resource.title,

                url:
                  `${SITE_URL}${resource.path}`,
              })
            ),
          ].map(
            (
              item,
              index
            ) => ({
              "@type":
                "ListItem",

              position:
                index + 1,

              name:
                item.name,

              url:
                item.url,
            })
          ),
      }),
      []
    );

  return (
    <>
      {/* ============================================================ */}
      {/* SEO */}
      {/* ============================================================ */}

      <Helmet>
        <title>
          Learn Software Engineering,
          System Design & Interviews |
          TargetTrek
        </title>

        <meta
          name="description"
          content={
            seoDescription
          }
        />

        <meta
          name="keywords"
          content="software engineering resources, system design interview preparation, system design books, HLD book, LLD Java book, software engineer interview experiences, backend engineering, developer resources, TargetTrek learn"
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
          content="website"
        />

        <meta
          property="og:site_name"
          content="TargetTrek"
        />

        <meta
          property="og:title"
          content="TargetTrek Learn — Software Engineering Books, Interviews & Resources"
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

        {/* TWITTER */}

        <meta
          name="twitter:card"
          content="summary"
        />

        <meta
          name="twitter:title"
          content="TargetTrek Learn — Software Engineering Learning Hub"
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
            webPageSchema
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
            learningListSchema
          )}
        </script>
      </Helmet>

      {/* ============================================================ */}
      {/* PAGE */}
      {/* ============================================================ */}

      <main
        className={`
          min-h-screen
          pt-16
          transition-colors
          duration-300
          sm:pt-16
          ${pageBg}
        `}
      >
        {/* ========================================================== */}
        {/* HERO */}
        {/* ========================================================== */}

        <section
          className={`
            relative
            overflow-hidden
            border-b
            ${
              isDark
                ? "border-slate-800 bg-[#080D14]"
                : "border-slate-200 bg-white"
            }
          `}
        >
          {/* SUBTLE DECORATION */}

          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div
              className={`
                absolute
                left-[8%]
                top-[-190px]
                h-[420px]
                w-[420px]
                rounded-full
                blur-[130px]
                ${
                  isDark
                    ? "bg-blue-900/15"
                    : "bg-blue-100/70"
                }
              `}
            />

            <div
              className={`
                absolute
                right-[-160px]
                top-[20%]
                h-[400px]
                w-[400px]
                rounded-full
                blur-[130px]
                ${
                  isDark
                    ? "bg-cyan-900/10"
                    : "bg-cyan-100/50"
                }
              `}
            />
          </div>

          <div
            className="
              relative
              mx-auto
              max-w-7xl
              px-4
              py-14

              sm:px-6
              sm:py-20

              lg:px-8
              lg:py-24
            "
          >
            <div className="mx-auto max-w-4xl text-center">
              {/* BADGE */}

              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3.5
                  py-1.5
                  text-[11px]
                  font-black
                  uppercase
                  tracking-[0.15em]
                  ${
                    isDark
                      ? "border-blue-900/60 bg-blue-950/25 text-blue-300"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }
                `}
              >
                <Sparkles className="h-3.5 w-3.5" />

                TargetTrek Learn
              </div>

              {/* TITLE */}

              <h1
                className={`
                  mt-6
                  text-4xl
                  font-black
                  leading-[1.08]
                  tracking-tight

                  sm:text-5xl

                  lg:text-6xl

                  ${textPrimary}
                `}
              >
                Practical learning
                for{" "}

                <span className="text-blue-500">
                  software engineers.
                </span>
              </h1>

              {/* DESCRIPTION */}

              <p
                className={`
                  mx-auto
                  mt-6
                  max-w-3xl
                  text-base
                  leading-8

                  sm:text-lg

                  ${textSecondary}
                `}
              >
                Explore structured
                technical books, real
                interview experiences,
                free engineering
                resources and
                practical software
                development content
                in one place.
              </p>

              {/* CTA */}

              <div
                className="
                  mt-8
                  flex
                  flex-col
                  items-stretch
                  justify-center
                  gap-3

                  sm:flex-row
                  sm:items-center
                "
              >
                <Link
                  to="/books"
                  className="
                    inline-flex
                    min-h-[48px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-6
                    py-3
                    text-sm
                    font-black
                    text-white
                    transition
                    hover:bg-blue-700
                  "
                >
                  Explore Books

                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/interviews"
                  className={`
                    inline-flex
                    min-h-[48px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    px-6
                    py-3
                    text-sm
                    font-black
                    transition
                    ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-white hover:border-blue-700"
                        : "border-slate-200 bg-white text-slate-800 hover:border-blue-300 hover:shadow-sm"
                    }
                  `}
                >
                  Read Interviews
                </Link>
              </div>

              {/* TAGS */}

              <div className="mt-8 flex flex-wrap justify-center gap-2">
                {[
                  "System Design",
                  "Java",
                  "Backend",
                  "Interviews",
                  "Architecture",
                  "GenAI",
                ].map(
                  (item) => (
                    <span
                      key={
                        item
                      }
                      className={`
                        rounded-full
                        border
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        ${
                          isDark
                            ? "border-slate-800 bg-slate-900/70 text-slate-400"
                            : "border-slate-200 bg-slate-50 text-slate-600"
                        }
                      `}
                    >
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* EXPLORE */}
        {/* ========================================================== */}

        <section
          className="
            mx-auto
            max-w-7xl
            px-4
            py-14

            sm:px-6
            sm:py-16

            lg:px-8
            lg:py-20
          "
        >
          <SectionHeader
            eyebrow="Explore TargetTrek"
            title="Choose how you want to learn"
            description="Use free resources for focused concepts, explore real interview experiences, read technical articles, or go deeper with structured books."
            isDark={
              isDark
            }
            center
          />

          <div
            className="
              mt-10
              grid
              gap-5

              sm:grid-cols-2

              xl:grid-cols-4
            "
          >
            {LEARNING_AREAS.map(
              (section) => {
                const Icon =
                  section.icon;

                return (
                  <Link
                    key={
                      section.title
                    }
                    to={
                      section.path
                    }
                    className={`
                      group
                      flex
                      min-h-full
                      flex-col
                      rounded-2xl
                      border
                      p-5
                      transition-all
                      duration-300

                      sm:p-6

                      hover:-translate-y-1

                      ${surface}

                      ${
                        isDark
                          ? "hover:border-blue-800"
                          : "hover:border-blue-300 hover:shadow-lg"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          isDark
                            ? "bg-blue-950/40 text-blue-300"
                            : "bg-blue-50 text-blue-600"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h2
                      className={`mt-5 text-lg font-black sm:text-xl ${textPrimary}`}
                    >
                      {
                        section.title
                      }
                    </h2>

                    <p
                      className={`mt-2 flex-1 text-sm leading-7 ${textSecondary}`}
                    >
                      {
                        section.description
                      }
                    </p>

                    <div className="mt-5 space-y-2">
                      {section.items.map(
                        (
                          item
                        ) => (
                          <div
                            key={
                              item
                            }
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />

                            <span
                              className={`text-xs ${
                                isDark
                                  ? "text-slate-500"
                                  : "text-slate-500"
                              }`}
                            >
                              {
                                item
                              }
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-sm font-black text-blue-500">
                      {
                        section.button
                      }

                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              }
            )}
          </div>
        </section>

        {/* ========================================================== */}
        {/* FEATURED BOOKS */}
        {/* ========================================================== */}

        <section
          className={`
            border-y
            ${
              isDark
                ? "border-slate-800 bg-[#0B111A]"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-4
              py-14

              sm:px-6
              sm:py-16

              lg:px-8
              lg:py-20
            "
          >
            <div
              className="
                flex
                flex-col
                gap-5

                md:flex-row
                md:items-end
                md:justify-between
              "
            >
              <SectionHeader
                eyebrow="Featured Books"
                title="Structured preparation when you want to go deeper"
                description="Move beyond isolated concepts with books designed to connect fundamentals, architecture, trade-offs and interview preparation."
                isDark={
                  isDark
                }
              />

              <Link
                to="/books"
                className={`
                  inline-flex
                  shrink-0
                  items-center
                  gap-2
                  self-start
                  rounded-xl
                  border
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  transition

                  md:self-auto

                  ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                  }
                `}
              >
                View All Books

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div
              className="
                mt-10
                grid
                gap-6

                lg:grid-cols-2
              "
            >
              {FEATURED_BOOKS.map(
                (book) => {
                  const Icon =
                    book.icon;

                  return (
                    <article
                      key={
                        book.title
                      }
                      className={`
                        group
                        rounded-3xl
                        border
                        p-6
                        transition-all
                        duration-300

                        sm:p-8

                        ${surface}

                        ${
                          isDark
                            ? "hover:border-blue-800"
                            : "hover:border-blue-300 hover:shadow-xl"
                        }
                      `}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={`
                            flex
                            h-12
                            w-12
                            items-center
                            justify-center
                            rounded-2xl
                            ${
                              isDark
                                ? "bg-blue-950/40 text-blue-300"
                                : "bg-blue-50 text-blue-600"
                            }
                          `}
                        >
                          <Icon className="h-6 w-6" />
                        </div>

                        <span
                          className={`
                            rounded-full
                            px-3
                            py-1
                            text-[10px]
                            font-black
                            uppercase
                            tracking-wider
                            ${
                              isDark
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-100 text-slate-600"
                            }
                          `}
                        >
                          {book.label}
                        </span>
                      </div>

                      <h3
                        className={`mt-6 text-2xl font-black leading-tight ${textPrimary}`}
                      >
                        {book.title}
                      </h3>

                      <p
                        className={`mt-3 text-sm leading-7 ${textSecondary}`}
                      >
                        {
                          book.description
                        }
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {book.topics.map(
                          (
                            topic
                          ) => (
                            <span
                              key={
                                topic
                              }
                              className={`
                                rounded-lg
                                px-2.5
                                py-1.5
                                text-xs
                                font-semibold
                                ${
                                  isDark
                                    ? "bg-slate-800 text-slate-400"
                                    : "bg-slate-100 text-slate-600"
                                }
                              `}
                            >
                              {
                                topic
                              }
                            </span>
                          )
                        )}
                      </div>

                      <Link
                        to={
                          book.path
                        }
                        className="
                          mt-7
                          inline-flex
                          min-h-[44px]
                          items-center
                          justify-center
                          gap-2
                          rounded-xl
                          bg-blue-600
                          px-5
                          py-2.5
                          text-sm
                          font-black
                          text-white
                          transition
                          hover:bg-blue-700
                        "
                      >
                        View Book

                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </article>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* INTERVIEW EXPERIENCE */}
        {/* ========================================================== */}

        <section
          className="
            mx-auto
            max-w-7xl
            px-4
            py-14

            sm:px-6
            sm:py-16

            lg:px-8
            lg:py-20
          "
        >
          <div
            className={`
              overflow-hidden
              rounded-3xl
              border
              ${surface}
            `}
          >
            <div
              className="
                grid

                lg:grid-cols-[1.1fr_0.9fr]
              "
            >
              {/* LEFT */}

              <div className="p-6 sm:p-8 lg:p-10">
                <div
                  className={`
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    px-3
                    py-1.5
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.14em]
                    ${
                      isDark
                        ? "border-slate-700 bg-slate-800 text-slate-300"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }
                  `}
                >
                  <Briefcase className="h-3.5 w-3.5" />

                  Interview Experiences
                </div>

                <h2
                  className={`mt-5 text-2xl font-black tracking-tight sm:text-3xl ${textPrimary}`}
                >
                  Learn from real
                  software engineering
                  interview journeys.
                </h2>

                <p
                  className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base ${textSecondary}`}
                >
                  Understand interview
                  rounds, questions,
                  design discussions
                  and preparation
                  approaches across
                  software engineering,
                  backend and AI roles.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "DSA & Coding",
                    "LLD Discussions",
                    "HLD Interviews",
                    "Backend Questions",
                    "GenAI Interviews",
                    "Managerial Rounds",
                  ].map(
                    (
                      item
                    ) => (
                      <div
                        key={
                          item
                        }
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

                        <span
                          className={`text-sm ${textSecondary}`}
                        >
                          {item}
                        </span>
                      </div>
                    )
                  )}
                </div>

                <Link
                  to="/interviews"
                  className="
                    mt-7
                    inline-flex
                    min-h-[44px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-5
                    py-2.5
                    text-sm
                    font-black
                    text-white
                    transition
                    hover:bg-blue-700
                  "
                >
                  Explore Interviews

                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* RIGHT */}

              <div
                className={`
                  flex
                  items-center
                  justify-center
                  border-t
                  p-6

                  sm:p-8

                  lg:border-l
                  lg:border-t-0
                  lg:p-10

                  ${
                    isDark
                      ? "border-slate-800 bg-[#0C131C]"
                      : "border-slate-200 bg-slate-50"
                  }
                `}
              >
                <div className="w-full max-w-md space-y-3">
                  {[
                    {
                      title:
                        "SDE Interview",

                      flow:
                        "DSA → LLD → HLD → Managerial",
                    },

                    {
                      title:
                        "Backend Interview",

                      flow:
                        "Java → APIs → SQL → Architecture",
                    },

                    {
                      title:
                        "AI / GenAI Interview",

                      flow:
                        "RAG → Agents → MCP → Projects",
                    },
                  ].map(
                    (
                      item,
                      index
                    ) => (
                      <div
                        key={
                          item.title
                        }
                        className={`
                          rounded-2xl
                          border
                          p-4

                          sm:p-5

                          ${surface}

                          ${
                            index ===
                            1
                              ? "sm:ml-5"
                              : ""
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              ${
                                isDark
                                  ? "bg-slate-800 text-blue-300"
                                  : "bg-blue-50 text-blue-600"
                              }
                            `}
                          >
                            <Users className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p
                              className={`text-sm font-black ${textPrimary}`}
                            >
                              {
                                item.title
                              }
                            </p>

                            <p
                              className={`mt-1 text-xs leading-5 ${textSecondary}`}
                            >
                              {
                                item.flow
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* FREE RESOURCES */}
        {/* ========================================================== */}

        <section
          className={`
            border-y
            ${
              isDark
                ? "border-slate-800 bg-[#0B111A]"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-4
              py-14

              sm:px-6
              sm:py-16

              lg:px-8
              lg:py-20
            "
          >
            <SectionHeader
              eyebrow="Free Engineering Resources"
              title="Strengthen individual concepts before going deeper"
              description="Explore focused system-design topics with practical explanations, architecture examples and interview-oriented notes."
              isDark={
                isDark
              }
              center
            />

            <div
              className="
                mt-10
                grid
                gap-5

                sm:grid-cols-2

                lg:grid-cols-3
              "
            >
              {FREE_RESOURCES.map(
                (
                  resource
                ) => {
                  const Icon =
                    resource.icon;

                  return (
                    <Link
                      key={
                        resource.title
                      }
                      to={
                        resource.path
                      }
                      className={`
                        group
                        rounded-2xl
                        border
                        p-5
                        transition-all
                        duration-300
                        hover:-translate-y-1

                        sm:p-6

                        ${surface}

                        ${
                          isDark
                            ? "hover:border-blue-800"
                            : "hover:border-blue-300 hover:shadow-lg"
                        }
                      `}
                    >
                      <div
                        className={`
                          flex
                          h-11
                          w-11
                          items-center
                          justify-center
                          rounded-xl
                          ${
                            isDark
                              ? "bg-slate-800 text-blue-300"
                              : "bg-blue-50 text-blue-600"
                          }
                        `}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <h3
                        className={`mt-5 text-lg font-black ${textPrimary}`}
                      >
                        {
                          resource.title
                        }
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-7 ${textSecondary}`}
                      >
                        {
                          resource.description
                        }
                      </p>

                      <div className="mt-5 flex items-center gap-2 text-sm font-black text-blue-500">
                        Read Resource

                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* FREE VS STRUCTURED */}
        {/* ========================================================== */}

        <section
          className="
            mx-auto
            max-w-7xl
            px-4
            py-14

            sm:px-6
            sm:py-16

            lg:px-8
            lg:py-20
          "
        >
          <SectionHeader
            eyebrow="Learn Your Way"
            title="Free resources and structured books solve different needs"
            description="Use focused resources when you need one concept. Use books when you want a complete topic connected from fundamentals to interview-level design."
            isDark={
              isDark
            }
            center
          />

          <div
            className="
              mx-auto
              mt-10
              grid
              max-w-5xl
              gap-5

              md:grid-cols-2
            "
          >
            {/* FREE */}

            <div
              className={`
                rounded-3xl
                border
                p-6

                sm:p-8

                ${surface}
              `}
            >
              <div
                className={`
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  ${
                    isDark
                      ? "bg-emerald-950/30 text-emerald-300"
                      : "bg-emerald-50 text-emerald-600"
                  }
                `}
              >
                <GraduationCap className="h-5 w-5" />
              </div>

              <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-500">
                Free Resources
              </p>

              <h3
                className={`mt-2 text-2xl font-black ${textPrimary}`}
              >
                Learn individual
                engineering concepts
              </h3>

              <p
                className={`mt-3 text-sm leading-7 ${textSecondary}`}
              >
                Ideal when you want a
                focused explanation,
                quick revision or an
                introduction to one
                technical topic.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "Focused explanations",
                  "Architecture diagrams",
                  "Technical examples",
                  "Interview questions",
                ].map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item
                      }
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

                      <span
                        className={`text-sm ${textSecondary}`}
                      >
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>

              <Link
                to="/resources/hld/cache"
                className="mt-7 inline-flex items-center gap-2 text-sm font-black text-emerald-500"
              >
                Start Learning

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* BOOKS */}

            <div
              className={`
                rounded-3xl
                border
                p-6

                sm:p-8

                ${
                  isDark
                    ? "border-blue-900/60 bg-blue-950/10"
                    : "border-blue-200 bg-blue-50/40"
                }
              `}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
                <BookOpen className="h-5 w-5" />
              </div>

              <p className="mt-5 text-[11px] font-black uppercase tracking-[0.16em] text-blue-500">
                Structured Books
              </p>

              <h3
                className={`mt-2 text-2xl font-black ${textPrimary}`}
              >
                Prepare complete
                topics in depth
              </h3>

              <p
                className={`mt-3 text-sm leading-7 ${textSecondary}`}
              >
                Ideal when you want a
                connected learning
                path, deeper
                explanations and
                complete interview
                preparation.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "Structured progression",
                  "Deep explanations",
                  "Connected concepts",
                  "Complete preparation",
                ].map(
                  (
                    item
                  ) => (
                    <div
                      key={
                        item
                      }
                      className="flex items-center gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500" />

                      <span
                        className={`text-sm ${textSecondary}`}
                      >
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>

              <Link
                to="/books"
                className="mt-7 inline-flex items-center gap-2 text-sm font-black text-blue-500"
              >
                Explore Books

                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* WHY TARGETTREK */}
        {/* ========================================================== */}

        <section
          className={`
            border-y
            ${
              isDark
                ? "border-slate-800 bg-[#0B111A]"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <div
            className="
              mx-auto
              max-w-7xl
              px-4
              py-14

              sm:px-6
              sm:py-16

              lg:px-8
              lg:py-20
            "
          >
            <SectionHeader
              eyebrow="Why TargetTrek"
              title="Learning built around software engineering"
              description="Technical content should be practical, understandable and connected to the situations developers actually face."
              isDark={
                isDark
              }
              center
            />

            <div
              className="
                mt-10
                grid
                gap-5

                sm:grid-cols-2

                lg:grid-cols-4
              "
            >
              {BENEFITS.map(
                (
                  item
                ) => {
                  const Icon =
                    item.icon;

                  return (
                    <div
                      key={
                        item.title
                      }
                      className={`
                        rounded-2xl
                        border
                        p-5

                        sm:p-6

                        ${surface}
                      `}
                    >
                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-xl
                          ${
                            isDark
                              ? "bg-slate-800 text-blue-300"
                              : "bg-blue-50 text-blue-600"
                          }
                        `}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <h3
                        className={`mt-4 font-black ${textPrimary}`}
                      >
                        {
                          item.title
                        }
                      </h3>

                      <p
                        className={`mt-2 text-sm leading-7 ${textSecondary}`}
                      >
                        {
                          item.description
                        }
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* ========================================================== */}
        {/* BOTTOM CTA */}
        {/* NO BLUE/PURPLE GRADIENT */}
        {/* ========================================================== */}

        <section
          className="
            mx-auto
            max-w-7xl
            px-4
            py-14

            sm:px-6
            sm:py-16

            lg:px-8
            lg:py-20
          "
        >
          <div
            className={`
              relative
              overflow-hidden
              rounded-3xl
              border
              p-6

              sm:p-8

              lg:p-10

              ${
                isDark
                  ? "border-slate-800 bg-[#080D14]"
                  : "border-slate-800 bg-[#0B111A]"
              }
            `}
          >
            {/* SUBTLE BACKGROUND ONLY */}

            <div className="pointer-events-none absolute inset-0">
              <div className="absolute right-[-140px] top-[-170px] h-[360px] w-[360px] rounded-full bg-blue-900/15 blur-[110px]" />

              <div className="absolute bottom-[-180px] left-[20%] h-[300px] w-[300px] rounded-full bg-cyan-900/10 blur-[120px]" />
            </div>

            <div
              className="
                relative
                grid
                gap-8

                lg:grid-cols-[1fr_auto]
                lg:items-center
              "
            >
              <div className="max-w-3xl">
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-slate-700
                    bg-slate-900/70
                    px-3
                    py-1.5
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.15em]
                    text-blue-300
                  "
                >
                  <Rocket className="h-3.5 w-3.5" />

                  Keep Learning
                </div>

                <h2
                  className="
                    mt-5
                    text-2xl
                    font-black
                    tracking-tight
                    text-white

                    sm:text-3xl

                    lg:text-4xl
                  "
                >
                  Build stronger
                  engineering skills
                  with focused,
                  practical learning.
                </h2>

                <p
                  className="
                    mt-4
                    max-w-2xl
                    text-sm
                    leading-7
                    text-slate-400

                    sm:text-base
                  "
                >
                  Explore technical
                  concepts, learn from
                  real interview
                  experiences and use
                  structured books
                  whenever you need
                  deeper preparation.
                </p>
              </div>

              {/* BUTTONS */}

              <div
                className="
                  flex
                  w-full
                  flex-col
                  gap-3

                  sm:w-auto
                  sm:flex-row

                  lg:flex-col
                "
              >
                <Link
                  to="/resources/hld/cache"
                  className="
                    inline-flex
                    min-h-[48px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-white
                    px-5
                    py-3
                    text-sm
                    font-black
                    text-slate-950
                    transition
                    hover:bg-slate-100

                    sm:w-auto
                  "
                >
                  Explore Resources

                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/interviews"
                  className="
                    inline-flex
                    min-h-[48px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-slate-700
                    bg-slate-900
                    px-5
                    py-3
                    text-sm
                    font-black
                    text-white
                    transition
                    hover:border-slate-600
                    hover:bg-slate-800

                    sm:w-auto
                  "
                >
                  Interview Experiences
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default LearnHome;