import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Cloud,
  Database,
  Gauge,
  Globe2,
  Layers3,
  LockKeyhole,
  MessageSquareMore,
  Network,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Workflow,
  X,
  Zap,
} from "lucide-react";

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/resources/hld`;
const BOOK_URL = "/book/system-design/hld";

const TOPICS = [
  {
    id: "load-balancing",
    title: "Load Balancing",
    description:
      "Understand load balancers, routing algorithms, health checks, sticky sessions, L4 vs L7 balancing, failover and high availability.",
    path: "/resources/hld/load-balancing",
    icon: Network,
    category: "Scalability",
    readTime: "30 min",
    level: "Fundamental",
    available: true,
    keywords: [
      "load balancing",
      "load balancer",
      "round robin",
      "least connections",
      "l4",
      "l7",
      "health check",
      "sticky session",
    ],
  },
  {
    id: "cache",
    title: "Caching",
    description:
      "Learn cache-aside, read-through, write-through, write-back, TTL, eviction strategies, cache invalidation and distributed caching.",
    path: "/resources/hld/cache",
    icon: Zap,
    category: "Performance",
    readTime: "30 min",
    level: "Fundamental",
    available: true,
    keywords: [
      "cache",
      "caching",
      "redis",
      "ttl",
      "cache aside",
      "write through",
      "write back",
      "eviction",
    ],
  },
  {
    id: "database",
    title: "Databases",
    description:
      "Understand SQL vs NoSQL, indexing, replication, partitioning, sharding, transactions, consistency and database scaling.",
    path: "/resources/hld/database",
    icon: Database,
    category: "Database",
    readTime: "40 min",
    level: "Fundamental",
    available: true,
    keywords: [
      "database",
      "sql",
      "nosql",
      "index",
      "replication",
      "sharding",
      "partitioning",
      "transaction",
    ],
  },
  {
    id: "message-queue",
    title: "Message Queues",
    description:
      "Learn Kafka, RabbitMQ, producers, consumers, partitions, consumer groups, ordering, retries, dead-letter queues and event-driven systems.",
    path: "/resources/hld/message-queue",
    icon: MessageSquareMore,
    category: "Distributed Systems",
    readTime: "35 min",
    level: "Intermediate",
    available: true,
    keywords: [
      "message queue",
      "kafka",
      "rabbitmq",
      "producer",
      "consumer",
      "consumer group",
      "partition",
      "dlq",
      "pub sub",
    ],
  },
  {
    id: "rate-limiting",
    title: "Rate Limiting",
    description:
      "Learn fixed window, sliding window, token bucket, leaky bucket, Redis-based distributed rate limiting, HTTP 429 and burst handling.",
    path: "/resources/hld/rate-limiting",
    icon: Gauge,
    category: "Scalability",
    readTime: "35 min",
    level: "Intermediate",
    available: true,
    featured: true,
    keywords: [
      "rate limiter",
      "rate limiting",
      "token bucket",
      "leaky bucket",
      "sliding window",
      "redis",
      "http 429",
    ],
  },
  {
    id: "api-gateway",
    title: "API Gateway",
    description:
      "Understand request routing, authentication, authorization, throttling, aggregation, transformation, observability and gateway high availability.",
    path: "/resources/hld/api-gateway",
    icon: ShieldCheck,
    category: "Architecture",
    readTime: "35 min",
    level: "Intermediate",
    available: true,
    keywords: [
      "api gateway",
      "routing",
      "authentication",
      "authorization",
      "throttling",
      "aggregation",
      "gateway",
    ],
  },
  {
    id: "cdn",
    title: "Content Delivery Network",
    description:
      "Learn CDN architecture, edge locations, origin servers, static content caching, cache invalidation and reducing latency for global users.",
    icon: Globe2,
    category: "Performance",
    level: "Intermediate",
    available: false,
    keywords: [
      "cdn",
      "content delivery network",
      "edge",
      "origin server",
      "latency",
      "static content",
    ],
  },
  {
    id: "database-sharding",
    title: "Database Sharding",
    description:
      "Understand horizontal partitioning, shard keys, routing, resharding, hot partitions and distributed database trade-offs.",
    icon: Boxes,
    category: "Database",
    level: "Intermediate",
    available: false,
    keywords: [
      "database sharding",
      "sharding",
      "horizontal partitioning",
      "shard key",
      "hot partition",
    ],
  },
  {
    id: "consistent-hashing",
    title: "Consistent Hashing",
    description:
      "Learn hash rings, virtual nodes, node addition and removal, key redistribution and why consistent hashing is useful in distributed systems.",
    icon: Workflow,
    category: "Distributed Systems",
    level: "Intermediate",
    available: false,
    keywords: [
      "consistent hashing",
      "hash ring",
      "virtual nodes",
      "distributed cache",
    ],
  },
  {
    id: "distributed-locking",
    title: "Distributed Locking",
    description:
      "Understand distributed locks, leases, fencing tokens, Redis locking, race conditions and coordination across multiple service instances.",
    icon: LockKeyhole,
    category: "Distributed Systems",
    level: "Advanced",
    available: false,
    keywords: [
      "distributed lock",
      "redis lock",
      "lease",
      "fencing token",
      "race condition",
    ],
  },
  {
    id: "cap-theorem",
    title: "CAP Theorem",
    description:
      "Understand consistency, availability and partition tolerance and how distributed systems make trade-offs during network failures.",
    icon: BrainCircuit,
    category: "Distributed Systems",
    level: "Intermediate",
    available: false,
    keywords: [
      "cap theorem",
      "consistency",
      "availability",
      "partition tolerance",
    ],
  },
  {
    id: "idempotency",
    title: "Idempotency",
    description:
      "Learn idempotency keys, duplicate request prevention, safe retries, payment processing and reliable distributed API operations.",
    icon: CheckCircle2,
    category: "Reliability",
    level: "Intermediate",
    available: false,
    keywords: [
      "idempotency",
      "idempotency key",
      "retry",
      "duplicate request",
      "payment",
    ],
  },
  {
    id: "service-discovery",
    title: "Service Discovery",
    description:
      "Learn how services discover other service instances dynamically using service registries, DNS-based discovery and health checks.",
    icon: Network,
    category: "Architecture",
    level: "Intermediate",
    available: false,
    keywords: [
      "service discovery",
      "service registry",
      "microservices",
      "consul",
      "dns",
    ],
  },
  {
    id: "microservices",
    title: "Microservices Architecture",
    description:
      "Understand service boundaries, independent deployments, service communication, data ownership and microservice architecture trade-offs.",
    icon: Boxes,
    category: "Architecture",
    level: "Intermediate",
    available: false,
    keywords: [
      "microservices",
      "microservice architecture",
      "service communication",
      "distributed system",
    ],
  },
  {
    id: "distributed-transactions",
    title: "Distributed Transactions",
    description:
      "Learn two-phase commit, Saga patterns, compensating transactions and eventual consistency across multiple services.",
    icon: Workflow,
    category: "Distributed Systems",
    level: "Advanced",
    available: false,
    keywords: [
      "distributed transaction",
      "saga pattern",
      "2pc",
      "two phase commit",
      "eventual consistency",
    ],
  },
];

const FAQ_DATA = [
  {
    question: "What is High Level Design in software engineering?",
    answer:
      "High Level Design describes the major components of a software system and how services, APIs, databases, caches, queues, load balancers and other infrastructure components interact.",
  },
  {
    question: "What should I study for a system design interview?",
    answer:
      "Important topics include load balancing, caching, databases, message queues, rate limiting, API gateways, sharding, consistent hashing, distributed systems, reliability and scalability.",
  },
  {
    question: "Is HLD important for backend interviews?",
    answer:
      "HLD is commonly discussed in backend and system design interviews because backend engineers need to understand scalability, data storage, APIs, reliability and distributed architecture.",
  },
  {
    question: "How should I approach an HLD interview question?",
    answer:
      "Start by clarifying requirements, estimate scale, define APIs and data models, build the high-level architecture, explain important request flows and then discuss scalability, failures and trade-offs.",
  },
];

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem("theme");

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  if (document.documentElement.classList.contains("dark")) {
    return "dark";
  }

  return "light";
};

const useNavbarTheme = () => {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    const syncTheme = () => {
      const nextTheme = getStoredTheme();

      setTheme((currentTheme) =>
        currentTheme === nextTheme ? currentTheme : nextTheme
      );
    };

    syncTheme();

    window.addEventListener("storage", syncTheme);
    window.addEventListener("themechange", syncTheme);
    window.addEventListener("focus", syncTheme);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        syncTheme();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const interval = window.setInterval(syncTheme, 300);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("focus", syncTheme);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      observer.disconnect();
      window.clearInterval(interval);
    };
  }, []);

  return theme;
};

const TopicCard = ({ topic, isDark, onOpen }) => {
  const Icon = topic.icon;

  const surfaceClass = topic.available
    ? isDark
      ? "border-slate-800 bg-slate-900/80 hover:border-blue-800 hover:bg-slate-900"
      : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
    : isDark
    ? "border-slate-800 bg-slate-900/50"
    : "border-slate-200 bg-slate-100/70";

  const cardContent = (
    <>
      {!topic.available && (
        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
              isDark
                ? "bg-amber-950/60 text-amber-300"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            <Clock3 className="h-3 w-3" />
            Coming Soon
          </span>
        </div>
      )}

      {topic.featured && topic.available && (
        <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
              isDark
                ? "bg-blue-950 text-blue-300"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Featured
          </span>
        </div>
      )}

      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
          topic.available
            ? isDark
              ? "bg-blue-950/60 text-blue-300"
              : "bg-blue-50 text-blue-600"
            : isDark
            ? "bg-slate-800 text-slate-500"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
            isDark
              ? "bg-slate-800 text-slate-400"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {topic.category}
        </span>

        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
            isDark
              ? "bg-slate-800 text-slate-400"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {topic.level}
        </span>
      </div>

      <h2
        className={`mt-4 text-lg font-black tracking-tight sm:text-xl ${
          topic.available
            ? isDark
              ? "text-white transition-colors group-hover:text-blue-300"
              : "text-slate-950 transition-colors group-hover:text-blue-600"
            : isDark
            ? "text-slate-300"
            : "text-slate-700"
        }`}
      >
        {topic.title}
      </h2>

      <p
        className={`mt-3 flex-1 text-sm leading-6 sm:leading-7 ${
          topic.available
            ? isDark
              ? "text-slate-400"
              : "text-slate-600"
            : isDark
            ? "text-slate-500"
            : "text-slate-500"
        }`}
      >
        {topic.description}
      </p>

      <div
        className={`mt-5 flex min-h-[40px] items-center justify-between border-t pt-4 ${
          isDark ? "border-slate-800" : "border-slate-200"
        }`}
      >
        {topic.available ? (
          <>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                isDark ? "text-slate-500" : "text-slate-500"
              }`}
            >
              <Clock3 className="h-3.5 w-3.5" />
              {topic.readTime}
            </span>

            <span
              className={`inline-flex items-center gap-1 text-sm font-black ${
                isDark ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Learn
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </>
        ) : (
          <span
            className={`inline-flex items-center gap-2 text-sm font-black ${
              isDark ? "text-amber-400" : "text-amber-600"
            }`}
          >
            <Clock3 className="h-4 w-4" />
            Coming Soon
          </span>
        )}
      </div>
    </>
  );

  if (!topic.available) {
    return (
      <article
        className={`relative flex h-full cursor-default flex-col overflow-hidden rounded-2xl border sm:rounded-3xl ${surfaceClass}`}
        aria-label={`${topic.title} - Coming Soon`}
      >
        <div className="flex h-full flex-col p-5 sm:p-6">
          {cardContent}
        </div>
      </article>
    );
  }

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 sm:rounded-3xl ${surfaceClass}`}
    >
      <button
        type="button"
        onClick={() => onOpen(topic.path)}
        className="flex h-full w-full flex-col p-5 text-left sm:p-6"
        aria-label={`Learn ${topic.title}`}
      >
        {cardContent}
      </button>
    </article>
  );
};

const HLDResources = () => {
  const navigate = useNavigate();
  const theme = useNavbarTheme();

  const isDark = theme === "dark";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const availableTopics = useMemo(
    () => TOPICS.filter((topic) => topic.available),
    []
  );

  const comingSoonTopics = useMemo(
    () => TOPICS.filter((topic) => !topic.available),
    []
  );

  const categories = useMemo(
    () => ["All", ...new Set(TOPICS.map((topic) => topic.category))],
    []
  );

  const filteredTopics = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return TOPICS.filter((topic) => {
      const matchesCategory =
        selectedCategory === "All" ||
        topic.category === selectedCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [
        topic.title,
        topic.description,
        topic.category,
        topic.level,
        ...topic.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [search, selectedCategory]);

  const seoDescription =
    "Free High Level Design resources for system design interviews. Learn load balancing, caching, databases, message queues, rate limiting, API gateways, distributed systems, scalability and backend architecture.";

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "High Level Design Resources",
    headline:
      "High Level Design Resources for System Design Interviews",
    description: seoDescription,
    url: PAGE_URL,
    inLanguage: "en",
    isAccessibleForFree: true,
    about: [
      "High Level Design",
      "System Design",
      "Backend Engineering",
      "Distributed Systems",
      "Scalability",
      "Software Architecture",
    ],
    publisher: {
      "@type": "Organization",
      name: "TargetTrek",
      url: SITE_URL,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: availableTopics.length,
      itemListElement: availableTopics.map((topic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: topic.title,
        url: `${SITE_URL}${topic.path}`,
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "TargetTrek",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Resources",
        item: `${SITE_URL}/resources`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "High Level Design",
        item: PAGE_URL,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const textPrimary = isDark
    ? "text-white"
    : "text-slate-950";

  const textSecondary = isDark
    ? "text-slate-400"
    : "text-slate-600";

  const surface = isDark
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";

  return (
    <>
      <Helmet>
        <title>
          HLD Resources - System Design Tutorials & Interview
          Preparation | TargetTrek
        </title>

        <meta
          name="description"
          content={seoDescription}
        />

        <meta
          name="keywords"
          content="HLD, high level design, HLD system design, system design interview, backend system design, load balancing, caching, database design, message queue, rate limiting, API gateway, distributed systems, scalability, software architecture"
        />

        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />

        <meta
          name="author"
          content="TargetTrek"
        />

        <meta
          name="theme-color"
          content={
            isDark
              ? "#090d14"
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
          content="TargetTrek"
        />

        <meta
          property="og:title"
          content="High Level Design Resources - System Design Tutorials"
        />

        <meta
          property="og:description"
          content={seoDescription}
        />

        <meta
          property="og:url"
          content={PAGE_URL}
        />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content="High Level Design Resources - System Design Tutorials"
        />

        <meta
          name="twitter:description"
          content={seoDescription}
        />

        <script type="application/ld+json">
          {JSON.stringify(collectionSchema)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      <div
        className={`min-h-screen pt-16 transition-colors duration-300 sm:pt-20 ${
          isDark
            ? "bg-[#090d14] text-slate-100"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <header
          className={`relative overflow-hidden border-b ${
            isDark
              ? "border-slate-800 bg-[#090d14]"
              : "border-slate-200 bg-white"
          }`}
        >
          <div
            className={`pointer-events-none absolute left-1/2 top-0 h-[450px] w-[90%] max-w-[800px] -translate-x-1/2 rounded-full blur-3xl ${
              isDark
                ? "bg-blue-900/10"
                : "bg-blue-100/70"
            }`}
          />

          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <div className="mx-auto max-w-4xl text-center">
              <div className="flex justify-center">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] ${
                    isDark
                      ? "border-blue-900 bg-blue-950/50 text-blue-300"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }`}
                >
                  <Layers3 className="h-3.5 w-3.5" />

                  High Level Design
                </span>
              </div>

              <h1
                className={`mt-5 text-3xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl ${textPrimary}`}
              >
                Learn High Level
                <span className="block text-blue-600">
                  System Design
                </span>
              </h1>

              <p
                className={`mx-auto mt-5 max-w-3xl text-sm leading-7 sm:text-base sm:leading-8 lg:text-lg ${textSecondary}`}
              >
                Learn the core building blocks used to design
                scalable, reliable and distributed systems.
                Explore practical HLD concepts for backend
                engineering and system design interviews.
              </p>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(
                        "hld-topics"
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 sm:w-auto"
                >
                  Start Learning

                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(BOOK_URL)
                  }
                  className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition sm:w-auto ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-700 hover:text-blue-300"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />

                  Mastering System Design HLD
                </button>
              </div>
            </div>

            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                [
                  availableTopics.length,
                  "Available Topics",
                ],
                [
                  comingSoonTopics.length,
                  "Coming Soon",
                ],
                [
                  "Free",
                  "Learning Resources",
                ],
                [
                  "Interview",
                  "Focused",
                ],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className={`rounded-2xl border p-4 text-center ${surface}`}
                >
                  <p
                    className={`text-lg font-black sm:text-xl ${textPrimary}`}
                  >
                    {value}
                  </p>

                  <p
                    className={`mt-1 text-xs font-medium ${textSecondary}`}
                  >
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <main>
          <section
            className={`border-b ${
              isDark
                ? "border-slate-800 bg-[#0c111b]"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: Server,
                    title: "Scalability",
                    text: "Design systems that continue working as traffic grows.",
                  },
                  {
                    icon: Database,
                    title: "Data",
                    text: "Understand storage, replication and database scaling.",
                  },
                  {
                    icon: Cloud,
                    title: "Distributed Systems",
                    text: "Learn communication and coordination across services.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Reliability",
                    text: "Handle failures while keeping services available.",
                  },
                ].map((item) => {
                  const Icon =
                    item.icon;

                  return (
                    <div
                      key={item.title}
                      className={`flex gap-3 rounded-2xl border p-4 ${surface}`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                          isDark
                            ? "bg-blue-950/60 text-blue-300"
                            : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <h2
                          className={`font-black ${textPrimary}`}
                        >
                          {item.title}
                        </h2>

                        <p
                          className={`mt-1 text-xs leading-5 ${textSecondary}`}
                        >
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section
            id="hld-topics"
            className="mx-auto max-w-7xl scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-500">
                  System Design Learning
                </p>

                <h2
                  className={`mt-2 text-2xl font-black tracking-tight sm:text-3xl ${textPrimary}`}
                >
                  High Level Design Topics
                </h2>

                <p
                  className={`mt-2 max-w-2xl text-sm leading-7 ${textSecondary}`}
                >
                  Explore available HLD tutorials or see
                  which system design topics are coming
                  next.
                </p>
              </div>

              <div className="relative w-full lg:max-w-sm">
                <Search
                  className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search HLD topics..."
                  aria-label="Search High Level Design topics"
                  className={`w-full rounded-xl border py-3 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
                      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                  }`}
                />

                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() =>
                      setSearch("")
                    }
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition ${
                      isDark
                        ? "text-slate-500 hover:text-white"
                        : "text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="-mx-4 mt-7 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <div className="flex min-w-max gap-2">
                {categories.map(
                  (category) => {
                    const selected =
                      selectedCategory ===
                      category;

                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                        className={`rounded-full border px-4 py-2 text-xs font-black transition ${
                          selected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : isDark
                            ? "border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                        }`}
                      >
                        {category}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p
                className={`text-xs font-semibold ${textSecondary}`}
              >
                Showing{" "}
                {filteredTopics.length}{" "}
                {filteredTopics.length === 1
                  ? "topic"
                  : "topics"}
              </p>

              {(search ||
                selectedCategory !==
                  "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory(
                      "All"
                    );
                  }}
                  className="text-xs font-black text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filteredTopics.length >
            0 ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {filteredTopics.map(
                  (topic) => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      isDark={isDark}
                      onOpen={navigate}
                    />
                  )
                )}
              </div>
            ) : (
              <div
                className={`mt-7 rounded-2xl border px-5 py-12 text-center sm:py-16 ${surface}`}
              >
                <Search
                  className={`mx-auto h-9 w-9 ${
                    isDark
                      ? "text-slate-600"
                      : "text-slate-300"
                  }`}
                />

                <h3
                  className={`mt-4 text-lg font-black ${textPrimary}`}
                >
                  No HLD topics found
                </h3>

                <p
                  className={`mx-auto mt-2 max-w-md text-sm leading-6 ${textSecondary}`}
                >
                  Try another search term
                  or remove the selected
                  category filter.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory(
                      "All"
                    );
                  }}
                  className="mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  Show All Topics
                </button>
              </div>
            )}
          </section>

          <section
            className={`border-y ${
              isDark
                ? "border-slate-800 bg-slate-900/40"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
              <div className="grid items-center gap-8 lg:grid-cols-[1fr_0.8fr] lg:gap-12">
                <div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${
                      isDark
                        ? "bg-blue-950/60 text-blue-300"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    <BookOpen className="h-3.5 w-3.5" />

                    Complete HLD Preparation
                  </span>

                  <h2
                    className={`mt-4 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl ${textPrimary}`}
                  >
                    Learn how to solve a
                    complete system design
                    problem
                  </h2>

                  <p
                    className={`mt-4 max-w-2xl text-sm leading-7 sm:text-base ${textSecondary}`}
                  >
                    Mastering System Design
                    – HLD covers the full
                    design process from
                    requirements and
                    estimations to APIs,
                    databases, caching,
                    scaling, concurrency,
                    failures and
                    architectural
                    trade-offs.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        BOOK_URL
                      )
                    }
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 sm:w-auto"
                  >
                    Explore HLD Book

                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div
                  className={`rounded-2xl border p-5 sm:rounded-3xl sm:p-6 ${surface}`}
                >
                  <p
                    className={`text-sm font-black uppercase tracking-wide ${
                      isDark
                        ? "text-blue-400"
                        : "text-blue-600"
                    }`}
                  >
                    HLD Interview Approach
                  </p>

                  <div className="mt-5 space-y-4">
                    {[
                      "Clarify functional requirements",
                      "Identify non-functional requirements",
                      "Estimate traffic and storage",
                      "Define APIs and data models",
                      "Create the high-level architecture",
                      "Find bottlenecks and scale components",
                      "Discuss reliability, failures and trade-offs",
                    ].map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={item}
                          className="flex items-start gap-3"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">
                            {index +
                              1}
                          </span>

                          <p
                            className={`pt-1 text-sm font-semibold leading-5 ${textSecondary}`}
                          >
                            {item}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-blue-500">
                Common Questions
              </p>

              <h2
                className={`mt-2 text-2xl font-black tracking-tight sm:text-3xl ${textPrimary}`}
              >
                HLD & System Design FAQ
              </h2>

              <p
                className={`mx-auto mt-3 max-w-2xl text-sm leading-7 ${textSecondary}`}
              >
                Quick answers to common
                questions about High Level
                Design and system design
                interview preparation.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {FAQ_DATA.map(
                (faq) => (
                  <article
                    key={
                      faq.question
                    }
                    className={`rounded-2xl border p-5 sm:p-6 ${surface}`}
                  >
                    <h3
                      className={`text-base font-black sm:text-lg ${textPrimary}`}
                    >
                      {faq.question}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-7 ${textSecondary}`}
                    >
                      {faq.answer}
                    </p>
                  </article>
                )
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
};

export default HLDResources;