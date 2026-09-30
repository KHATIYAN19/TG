import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  FileJson,
  GitBranch,
  Globe2,
  Hash,
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
  Table2,
  Timer,
  TriangleAlert,
  Users,
  Zap,
} from "lucide-react";

const SITE_URL =
  "https://www.targettrek.in";

const PAGE_URL =
  `${SITE_URL}/resources/hld/database`;

const BOOK_URL =
  "/book/system-design/hld";

const DATE_PUBLISHED =
  "2026-09-29T00:00:00+05:30";

const DATE_MODIFIED =
  "2026-09-29T00:00:00+05:30";

const PREVIOUS_TOPIC = {
  title: "Load Balancing",

  description:
    "Understand L4 vs L7 load balancing, health checks, routing algorithms, sticky sessions and high availability.",

  path:
    "/resources/hld/load-balancing",
};

const NEXT_TOPIC = {
  title: "Message Queues",

  description:
    "Learn queues, Kafka, pub-sub, consumer groups, retries, DLQ, ordering and event-driven architecture.",

  path:
    "/resources/hld/message-queue",
};

const CONTENT_SECTIONS = [
  {
    id: "fundamentals",
    label: "Fundamentals",
  },
  {
    id: "oltp-olap",
    label: "OLTP vs OLAP",
  },
  {
    id: "database-types",
    label: "DB Types",
  },
  {
    id: "selection",
    label: "Which DB?",
  },
  {
    id: "normalization",
    label: "Normalization",
  },
  {
    id: "acid",
    label: "ACID / BASE",
  },
  {
    id: "isolation",
    label: "Isolation",
  },
  {
    id: "locking",
    label: "Locking",
  },
  {
    id: "mvcc",
    label: "MVCC",
  },
  {
    id: "cap",
    label: "CAP",
  },
  {
    id: "indexes",
    label: "Indexes",
  },
  {
    id: "optimizer",
    label: "Query Optimizer",
  },
  {
    id: "pooling",
    label: "Connection Pool",
  },
  {
    id: "replication",
    label: "Replication",
  },
  {
    id: "read-write",
    label: "Read / Write Split",
  },
  {
    id: "partitioning",
    label: "Partitioning",
  },
  {
    id: "sharding",
    label: "Sharding",
  },
  {
    id: "hot-shard",
    label: "Hot Shards",
  },
  {
    id: "consistent-hashing",
    label: "Consistent Hashing",
  },
  {
    id: "quorum",
    label: "Quorum",
  },
  {
    id: "consistency",
    label: "Consistency",
  },
  {
    id: "wal",
    label: "WAL",
  },
  {
    id: "buffer-pool",
    label: "Buffer Pool",
  },
  {
    id: "backup",
    label: "Backup / RPO",
  },
  {
    id: "migration",
    label: "Migration",
  },
  {
    id: "soft-delete",
    label: "Soft Delete",
  },
  {
    id: "archival",
    label: "Archival",
  },
  {
    id: "security",
    label: "Security",
  },
  {
    id: "scaling",
    label: "Scaling",
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

const DATABASE_TYPES = [
  {
    title:
      "Relational Database",

    short:
      "SQL",

    examples:
      "PostgreSQL, MySQL, SQL Server, Oracle",

    icon:
      Table2,

    speciality:
      "Structured data, relationships, constraints and transactions.",

    useCases: [
      "Payments",
      "Orders",
      "Bookings",
      "Inventory",
      "Banking",
      "Wallets",
      "User accounts",
    ],

    benefits: [
      "ACID transactions",
      "JOIN support",
      "Foreign keys",
      "Constraints",
      "Strong query capabilities",
      "Mature tooling",
    ],

    tradeoffs: [
      "Schema changes need planning",
      "Horizontal scaling may require more work",
      "Poor indexes and joins can become expensive",
    ],

    chooseWhen:
      "Correctness, transactions and relationships are important.",
  },

  {
    title:
      "Document Database",

    short:
      "Document",

    examples:
      "MongoDB, Couchbase, Firestore",

    icon:
      FileJson,

    speciality:
      "Stores flexible JSON-like documents.",

    useCases: [
      "CMS",
      "Profiles",
      "Product catalogs",
      "Content",
      "Dynamic metadata",
      "Rapidly changing schemas",
    ],

    benefits: [
      "Flexible schema",
      "Natural JSON model",
      "Nested structures",
      "Easy application mapping",
      "Good document locality",
    ],

    tradeoffs: [
      "Data duplication is common",
      "Complex relations are less natural",
      "Bad document boundaries can create huge records",
    ],

    chooseWhen:
      "Data naturally belongs together as independent JSON documents.",
  },

  {
    title:
      "Key-Value Database",

    short:
      "Key Value",

    examples:
      "Redis, DynamoDB, Aerospike",

    icon:
      KeyRound,

    speciality:
      "Fast access when a known key identifies the value.",

    useCases: [
      "Caching",
      "Sessions",
      "Shopping carts",
      "Counters",
      "Rate limiting",
      "Temporary state",
      "Feature flags",
    ],

    benefits: [
      "Very fast",
      "Simple model",
      "Easy key partitioning",
      "High throughput",
      "Good TTL support in many systems",
    ],

    tradeoffs: [
      "Limited joins",
      "Limited ad-hoc queries",
      "Access patterns often need to be known beforehand",
    ],

    chooseWhen:
      "Your main query is essentially get value by key.",
  },

  {
    title:
      "Wide-Column Database",

    short:
      "Wide Column",

    examples:
      "Cassandra, ScyllaDB, HBase",

    icon:
      Layers3,

    speciality:
      "Distributed high-throughput storage designed around known query patterns.",

    useCases: [
      "Large event histories",
      "Activity feeds",
      "IoT",
      "Messaging metadata",
      "Write-heavy systems",
      "Large distributed workloads",
    ],

    benefits: [
      "High write throughput",
      "Horizontal scale",
      "Replication",
      "High availability",
    ],

    tradeoffs: [
      "Query-first schema design",
      "Joins usually avoided",
      "New query pattern can require a new table",
    ],

    chooseWhen:
      "You need huge distributed throughput and know your query patterns.",
  },

  {
    title:
      "Graph Database",

    short:
      "Graph",

    examples:
      "Neo4j, Amazon Neptune, JanusGraph",

    icon:
      GitBranch,

    speciality:
      "Optimized for relationships and graph traversal.",

    useCases: [
      "Social graph",
      "Fraud detection",
      "Recommendation graph",
      "Knowledge graph",
      "Network topology",
      "Dependencies",
    ],

    benefits: [
      "Natural nodes and edges",
      "Fast relationship traversal",
      "Useful for many-hop queries",
    ],

    tradeoffs: [
      "Not ideal for every CRUD workload",
      "Different query model",
      "Distributed graph traversal can be difficult",
    ],

    chooseWhen:
      "Relationships are the primary data you need to explore.",
  },

  {
    title:
      "Time-Series Database",

    short:
      "Time Series",

    examples:
      "InfluxDB, TimescaleDB, VictoriaMetrics",

    icon:
      Activity,

    speciality:
      "Optimized for timestamped measurements and append-heavy workloads.",

    useCases: [
      "Monitoring",
      "CPU metrics",
      "IoT sensors",
      "Application telemetry",
      "Financial ticks",
      "Observability",
    ],

    benefits: [
      "Time-window queries",
      "Retention policies",
      "Compression",
      "Downsampling",
      "High append throughput",
    ],

    tradeoffs: [
      "Not intended for general transactional workloads",
      "Relational workflows may be unnatural",
    ],

    chooseWhen:
      "Almost every record has a timestamp and queries are primarily time ranges.",
  },

  {
    title:
      "Search Engine",

    short:
      "Search",

    examples:
      "Elasticsearch, OpenSearch, Solr",

    icon:
      Search,

    speciality:
      "Optimized for text search, ranking and inverted indexes.",

    useCases: [
      "Product search",
      "Website search",
      "Autocomplete",
      "Log search",
      "Faceted filtering",
      "Text ranking",
    ],

    benefits: [
      "Full-text search",
      "Fuzzy matching",
      "Ranking",
      "Aggregations",
      "Tokenization",
    ],

    tradeoffs: [
      "Usually not the transactional source of truth",
      "Index synchronization is required",
      "Operational complexity at scale",
    ],

    chooseWhen:
      "Users need search behavior rather than exact row lookup.",
  },

  {
    title:
      "Vector Database",

    short:
      "Vector",

    examples:
      "Pinecone, Milvus, Weaviate, Qdrant, pgvector",

    icon:
      BrainCircuit,

    speciality:
      "Nearest-neighbor search over embeddings.",

    useCases: [
      "RAG",
      "Semantic search",
      "Image similarity",
      "Recommendations",
      "AI memory",
      "Embedding retrieval",
    ],

    benefits: [
      "Semantic retrieval",
      "Similarity search",
      "ANN indexes",
      "Metadata filtering",
    ],

    tradeoffs: [
      "Not a transactional database replacement",
      "Approximate search has recall/latency trade-offs",
      "Embedding refresh needs management",
    ],

    chooseWhen:
      "You need similarity based on meaning rather than exact equality.",
  },

  {
    title:
      "Columnar / Analytical Database",

    short:
      "OLAP",

    examples:
      "ClickHouse, BigQuery, Snowflake, Redshift",

    icon:
      BarChart3,

    speciality:
      "Optimized for large scans and analytical aggregations.",

    useCases: [
      "Analytics",
      "Dashboards",
      "Reporting",
      "BI",
      "Event analysis",
      "Data warehouse",
    ],

    benefits: [
      "Column compression",
      "Large scans",
      "Fast aggregations",
      "Efficient analytical queries",
    ],

    tradeoffs: [
      "Not usually designed for frequent small row transactions",
      "Different latency and cost characteristics",
    ],

    chooseWhen:
      "You run large SUM, COUNT, GROUP BY and analytical queries.",
  },

  {
    title:
      "Distributed SQL",

    short:
      "Distributed SQL",

    examples:
      "Google Spanner, CockroachDB, YugabyteDB",

    icon:
      Globe2,

    speciality:
      "Relational semantics with distributed replication and horizontal scaling.",

    useCases: [
      "Global transactional applications",
      "Multi-region SQL",
      "Highly available transactional systems",
      "Large relational workloads",
    ],

    benefits: [
      "SQL",
      "Transactions",
      "Horizontal scale",
      "Replication",
      "Multi-region support",
    ],

    tradeoffs: [
      "Distributed transactions cost latency",
      "Operational complexity",
      "May be unnecessary for smaller applications",
    ],

    chooseWhen:
      "You truly need relational transactions across distributed infrastructure.",
  },
];

const FAQ_DATA = [
  {
    question:
      "How should I choose a database in a system design interview?",

    answer:
      "Start from access patterns, transaction requirements, consistency requirements, relationships, expected scale, read and write volume, query flexibility and operational complexity.",
  },

  {
    question:
      "What is the difference between partitioning and sharding?",

    answer:
      "Partitioning means splitting data into smaller logical pieces. Sharding commonly means distributing those pieces across different database nodes or machines.",
  },

  {
    question:
      "What is replication?",

    answer:
      "Replication stores copies of data on multiple nodes to improve availability, durability or read scalability.",
  },

  {
    question:
      "What is a hot shard?",

    answer:
      "A hot shard receives a disproportionate amount of reads or writes compared with other shards, creating a bottleneck despite unused capacity elsewhere.",
  },

  {
    question:
      "Why do databases use indexes?",

    answer:
      "Indexes maintain additional structures that allow the database to find rows without scanning the complete table, trading extra storage and write cost for faster reads.",
  },

  {
    question:
      "What is MVCC?",

    answer:
      "Multi-Version Concurrency Control allows transactions to work with versions or snapshots of rows so reads and writes can often proceed with less blocking.",
  },
];

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return window.localStorage.getItem("theme") === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

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

const BulletCard = ({
  title,
  items,
  isDark,
  icon:
    Icon = CheckCircle2,
}) => {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <h3
        className={`font-black ${
          isDark
            ? "text-white"
            : "text-slate-950"
        }`}
      >
        {title}
      </h3>

      <div className="mt-4 space-y-2.5">
        {items.map(
          (item) => (
            <div
              key={item}
              className="flex items-start gap-2"
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

              <span
                className={`text-sm leading-6 ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                {item}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const HLDDatabaseResource =
  () => {
    const [theme, setTheme] =
      useState(getStoredTheme);

    const isDark =
      theme === "dark";

    useEffect(() => {
      const syncTheme = () => {
        const currentTheme =
          getStoredTheme();

        setTheme((previousTheme) =>
          previousTheme !== currentTheme
            ? currentTheme
            : previousTheme
        );
      };

      const handleStorage = (event) => {
        if (
          event.key === "theme" ||
          event.key === null
        ) {
          syncTheme();
        }
      };

      const handleVisibilityChange = () => {
        if (!document.hidden) {
          syncTheme();
        }
      };

      syncTheme();

      const intervalId =
        window.setInterval(
          syncTheme,
          200
        );

      window.addEventListener(
        "storage",
        handleStorage
      );

      window.addEventListener(
        "focus",
        syncTheme
      );

      window.addEventListener(
        "themechange",
        syncTheme
      );

      window.addEventListener(
        "theme-change",
        syncTheme
      );

      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      return () => {
        window.clearInterval(
          intervalId
        );

        window.removeEventListener(
          "storage",
          handleStorage
        );

        window.removeEventListener(
          "focus",
          syncTheme
        );

        window.removeEventListener(
          "themechange",
          syncTheme
        );

        window.removeEventListener(
          "theme-change",
          syncTheme
        );

        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }, []);

    const surface =
      isDark
        ? "border-slate-800 bg-slate-900 shadow-sm shadow-black/10"
        : "border-slate-200 bg-white shadow-sm shadow-slate-200/40";

    const textPrimary =
      isDark
        ? "text-white"
        : "text-slate-950";

    const textSecondary =
      isDark
        ? "text-slate-400"
        : "text-slate-600";

    const seoDescription =
      "Master database system design: SQL, NoSQL, MongoDB, PostgreSQL, Redis, Cassandra, graph, time-series, vector and analytical databases, normalization, ACID, isolation levels, MVCC, indexes, query optimization, replication, partitioning, sharding, consistent hashing, quorum, WAL, backup and scaling.";

    const articleSchema = {
      "@context":
        "https://schema.org",

      "@type":
        "TechArticle",

      inLanguage:
        "en-IN",

      isAccessibleForFree:
        true,

      articleSection:
        "High Level Design",

      proficiencyLevel:
        "Intermediate to Advanced",

      timeRequired:
        "PT60M",

      headline:
        "Database Design in System Design: Complete HLD Guide",

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

      educationalUse:
        "Interview preparation and software architecture learning",

      keywords: [
        "Database System Design",
        "SQL vs NoSQL",
        "Database Sharding",
        "Database Replication",
        "MVCC",
        "ACID",
        "CAP Theorem",
        "Database Indexing",
        "High Level Design",
      ],

      about: [
        "Database System Design",
        "SQL",
        "NoSQL",
        "PostgreSQL",
        "MongoDB",
        "Database Sharding",
        "Database Replication",
        "Database Partitioning",
        "Database Indexes",
        "MVCC",
        "ACID",
        "CAP Theorem",
        "Distributed Databases",
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
            "Database Design",

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
          <html
            lang="en"
            data-theme={theme}
          />

          <title>
            Database System Design:
            SQL, NoSQL, Sharding,
            Replication & MVCC |
            TargetTrek
          </title>

          <meta
            name="description"
            content={seoDescription}
          />

          <meta
            name="keywords"
            content="database system design, SQL vs NoSQL, PostgreSQL system design, MongoDB system design, database sharding, database partitioning, replication, MVCC, transaction isolation, database indexing, query optimizer, ACID, CAP theorem, consistent hashing, database interview questions"
          />

          <meta
            name="author"
            content="TargetTrek"
          />

          <meta
            name="robots"
            content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
          />

          <meta
            name="theme-color"
            content={
              isDark
                ? "#090d14"
                : "#f8fafc"
            }
          />

          <link
            rel="canonical"
            href={PAGE_URL}
          />

          <link
            rel="prev"
            href={`${SITE_URL}${PREVIOUS_TOPIC.path}`}
          />

          <link
            rel="next"
            href={`${SITE_URL}${NEXT_TOPIC.path}`}
          />

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
            content="Database System Design — Complete HLD Guide"
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
            property="article:section"
            content="High Level Design"
          />

          <meta
            property="article:published_time"
            content={DATE_PUBLISHED}
          />

          <meta
            property="article:modified_time"
            content={DATE_MODIFIED}
          />

          {[
            "Database System Design",
            "SQL",
            "NoSQL",
            "Sharding",
            "Replication",
            "MVCC",
            "ACID",
            "CAP Theorem",
          ].map((tag) => (
            <meta
              key={tag}
              property="article:tag"
              content={tag}
            />
          ))}

          <meta
            name="twitter:card"
            content="summary_large_image"
          />

          <meta
            name="twitter:title"
            content="Database System Design — Complete HLD Guide"
          />

          <meta
            name="twitter:description"
            content={seoDescription}
          />

          <script type="application/ld+json">
            {JSON.stringify(
              articleSchema
            )}
          </script>

          <script type="application/ld+json">
            {JSON.stringify(
              breadcrumbSchema
            )}
          </script>

          <script type="application/ld+json">
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
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6 lg:px-8">
              <Link
                to="/resources/hld"
                className={`inline-flex min-h-[42px] items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition ${
                  isDark
                    ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700 hover:text-blue-400"
                    : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />

                <span className="hidden sm:inline">
                  HLD Resources
                </span>

                <span className="sm:hidden">
                  Back
                </span>
              </Link>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-wider sm:text-xs ${
                  isDark
                    ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
                    : "border-cyan-100 bg-cyan-50 text-cyan-700"
                }`}
              >
                <Database className="h-3.5 w-3.5" />
                Database HLD
              </div>
            </div>
          </div>

          <header
            className={`relative overflow-hidden border-b ${
              isDark
                ? "border-slate-800 bg-[#090d14]"
                : "border-slate-200 bg-white"
            }`}
          >
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 ${
                isDark
                  ? "bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.16),transparent_36%),radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.10),transparent_28%)]"
                  : "bg-[radial-gradient(circle_at_top_left,rgba(6,182,212,0.12),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.08),transparent_30%)]"
              }`}
            />

            <div className="relative mx-auto max-w-7xl px-3 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
              <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-12">
                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                        isDark
                          ? "border-blue-800 bg-blue-950/50 text-blue-300"
                          : "border-blue-200 bg-blue-50 text-blue-700"
                      }`}
                    >
                      High Level Design
                    </span>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        isDark
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      Databases
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                        isDark
                          ? "bg-slate-800 text-slate-300"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Clock3 className="h-3.5 w-3.5" />
                      60+ min read
                    </span>
                  </div>

                  <h1
                    className={`mt-5 max-w-4xl text-3xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl ${
                      isDark
                        ? "text-white"
                        : "text-slate-950"
                    }`}
                  >
                    Databases in
                    System Design
                  </h1>

                  <p
                    className={`mt-5 max-w-3xl text-sm leading-7 sm:text-base sm:leading-8 lg:text-lg ${textSecondary}`}
                  >
                    A complete database
                    guide for system
                    design interviews:
                    database types,
                    transactions,
                    indexing, query
                    optimization,
                    locking, MVCC,
                    replication,
                    partitioning,
                    sharding,
                    consistency,
                    durability,
                    backups and
                    production scaling.
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
                      className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:w-auto"
                    >
                      Start Learning
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <Link
                      to={BOOK_URL}
                      className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-black transition ${
                        isDark
                          ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-700 hover:text-blue-400"
                          : "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      <BookOpen className="h-4 w-4" />
                      Master HLD Book
                    </Link>
                  </div>
                </div>

                <div
                  className={`rounded-2xl border p-4 shadow-xl sm:p-5 lg:rounded-3xl ${
                    isDark
                      ? "border-slate-800 bg-slate-900/80 shadow-black/20"
                      : "border-slate-200 bg-white/90 shadow-slate-200/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                      <Database className="h-5 w-5" />
                    </div>

                    <div>
                      <p
                        className={`text-sm font-black ${
                          isDark
                            ? "text-white"
                            : "text-slate-950"
                        }`}
                      >
                        Complete Database Roadmap
                      </p>

                      <p
                        className={`mt-0.5 text-xs ${
                          isDark
                            ? "text-slate-500"
                            : "text-slate-500"
                        }`}
                      >
                        From fundamentals to production scaling
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      ["33", "Core topics"],
                      ["10", "DB families"],
                      ["50+", "Interview Qs"],
                      ["1", "Booking case study"],
                    ].map(([value, label]) => (
                      <div
                        key={label}
                        className={`rounded-xl border p-3 ${
                          isDark
                            ? "border-slate-800 bg-slate-950/70"
                            : "border-slate-100 bg-slate-50"
                        }`}
                      >
                        <p className="text-xl font-black text-blue-500">
                          {value}
                        </p>

                        <p
                          className={`mt-1 text-[11px] font-bold leading-4 ${
                            isDark
                              ? "text-slate-400"
                              : "text-slate-600"
                          }`}
                        >
                          {label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`mt-4 flex items-start gap-2 rounded-xl p-3 ${
                      isDark
                        ? "bg-emerald-500/10"
                        : "bg-emerald-50"
                    }`}
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                    <p
                      className={`text-xs leading-5 ${
                        isDark
                          ? "text-emerald-200/80"
                          : "text-emerald-800"
                      }`}
                    >
                      Built for interview
                      preparation and practical
                      architecture decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div
            className={`sticky top-20 z-30 border-b backdrop-blur sm:top-24 ${
              isDark
                ? "border-slate-800 bg-[#090d14]/95"
                : "border-slate-200 bg-white/95"
            }`}
          >
            <div className="mx-auto max-w-7xl overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-6 lg:px-8">
              <div className="flex min-w-max items-center gap-1.5 py-2.5 sm:gap-2 sm:py-3">
                {CONTENT_SECTIONS.map(
                  (item) => (
                    <a
                      key={
                        item.id
                      }
                      href={`#${item.id}`}
                      className={`rounded-lg px-3 py-2 text-[11px] font-bold transition sm:text-xs ${
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

          <main className="mx-auto max-w-5xl px-3 pb-14 pt-7 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8 lg:py-12">


<section>
              <SectionHeading
                id="fundamentals"
                eyebrow="Fundamentals"
                title="How Should You Think About Databases?"
                description="The database should be selected from the application's access patterns and correctness requirements, not from technology popularity."
                icon={Database}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-5 sm:p-7 ${surface}`}
              >
                <p
                  className={`leading-8 ${textSecondary}`}
                >
                  Before saying
                  PostgreSQL,
                  MongoDB,
                  Cassandra or
                  Redis, answer the
                  questions that
                  actually determine
                  storage design.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "What are the read patterns?",
                    "What are the write patterns?",
                    "Do we need transactions?",
                    "How important is strong consistency?",
                    "Do entities have relationships?",
                    "Do we need arbitrary queries?",
                    "What is the dataset size?",
                    "What is expected QPS?",
                    "Read-heavy or write-heavy?",
                    "Do we need range queries?",
                    "Can data be stale?",
                    "Do we need global distribution?",
                  ].map(
                    (item) => (
                      <div
                        key={
                          item
                        }
                        className={`rounded-xl border p-4 text-sm font-semibold ${surface}`}
                      >
                        {item}
                      </div>
                    )
                  )}
                </div>
              </div>

              <Callout
                type="warning"
                title="Avoid saying 'NoSQL scales, SQL does not'"
                isDark={
                  isDark
                }
              >
                Modern relational
                databases can scale
                very far. NoSQL
                systems usually
                trade some relational
                capabilities for
                specific distributed
                access patterns.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="oltp-olap"
                eyebrow="Workload"
                title="OLTP vs OLAP"
                description="First identify whether your database primarily serves operational transactions or analytical queries."
                icon={BarChart3}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <BulletCard
                  title="OLTP — Transaction Processing"
                  isDark={
                    isDark
                  }
                  items={[
                    "Many small reads and writes",
                    "User-facing requests",
                    "Low latency",
                    "Frequent INSERT / UPDATE",
                    "Transactions",
                    "Point lookups",
                    "Examples: PostgreSQL, MySQL, MongoDB",
                  ]}
                />

                <BulletCard
                  title="OLAP — Analytical Processing"
                  isDark={
                    isDark
                  }
                  items={[
                    "Large scans",
                    "Aggregations",
                    "Historical analysis",
                    "GROUP BY",
                    "Dashboards",
                    "Reporting",
                    "Examples: BigQuery, ClickHouse, Snowflake",
                  ]}
                />
              </div>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="database-types"
                eyebrow="Storage Models"
                title="Major Types of Databases"
                description="Each database family is optimized for a different kind of access pattern."
                icon={Boxes}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-5">
                {DATABASE_TYPES.map(
                  (
                    database,
                    index
                  ) => {
                    const Icon =
                      database.icon;

                    return (
                      <div
                        key={
                          database.title
                        }
                        className={`rounded-2xl border p-5 sm:p-6 ${surface}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                            <Icon className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3
                                className={`text-lg font-black ${textPrimary}`}
                              >
                                {
                                  database.title
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
                                  database.short
                                }
                              </span>
                            </div>

                            <p
                              className={`mt-2 text-sm leading-7 ${textSecondary}`}
                            >
                              {
                                database.speciality
                              }
                            </p>

                            <p className="mt-3 text-xs font-black uppercase text-blue-500">
                              Examples
                            </p>

                            <p
                              className={`mt-1 text-sm font-semibold ${textPrimary}`}
                            >
                              {
                                database.examples
                              }
                            </p>

                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                              <div>
                                <p className="text-xs font-black uppercase text-blue-500">
                                  Use Cases
                                </p>

                                <div className="mt-2 space-y-1.5">
                                  {database.useCases.map(
                                    (
                                      item
                                    ) => (
                                      <p
                                        key={
                                          item
                                        }
                                        className={`text-sm ${textSecondary}`}
                                      >
                                        •{" "}
                                        {
                                          item
                                        }
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-black uppercase text-emerald-500">
                                  Benefits
                                </p>

                                <div className="mt-2 space-y-1.5">
                                  {database.benefits.map(
                                    (
                                      item
                                    ) => (
                                      <p
                                        key={
                                          item
                                        }
                                        className={`text-sm ${textSecondary}`}
                                      >
                                        •{" "}
                                        {
                                          item
                                        }
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>

                              <div>
                                <p className="text-xs font-black uppercase text-amber-500">
                                  Trade-offs
                                </p>

                                <div className="mt-2 space-y-1.5">
                                  {database.tradeoffs.map(
                                    (
                                      item
                                    ) => (
                                      <p
                                        key={
                                          item
                                        }
                                        className={`text-sm ${textSecondary}`}
                                      >
                                        •{" "}
                                        {
                                          item
                                        }
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>

                            <div
                              className={`mt-5 rounded-xl p-4 ${
                                isDark
                                  ? "bg-blue-950/20"
                                  : "bg-blue-50"
                              }`}
                            >
                              <p className="text-xs font-black uppercase text-blue-500">
                                Choose when
                              </p>

                              <p
                                className={`mt-1 text-sm font-semibold leading-7 ${textPrimary}`}
                              >
                                {
                                  database.chooseWhen
                                }
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="selection"
                eyebrow="Decision Guide"
                title="Which Database Should You Use?"
                description="Choose storage based on what the system actually needs."
                icon={BrainCircuit}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Database}
                  title="Identify Access Pattern"
                  subtitle="Transactions? Search? Analytics? Relationships?"
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

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <DiagramNode
                    icon={Table2}
                    title="Transactions"
                    subtitle="PostgreSQL / MySQL"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={FileJson}
                    title="Flexible Documents"
                    subtitle="MongoDB"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={KeyRound}
                    title="Key Lookup"
                    subtitle="Redis / DynamoDB"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Layers3}
                    title="Huge Writes"
                    subtitle="Cassandra"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={GitBranch}
                    title="Relationships"
                    subtitle="Graph DB"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Activity}
                    title="Metrics"
                    subtitle="Time-Series DB"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Search}
                    title="Text Search"
                    subtitle="Elasticsearch"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={BrainCircuit}
                    title="Semantic Search"
                    subtitle="Vector DB"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={BarChart3}
                    title="Analytics"
                    subtitle="ClickHouse / BigQuery"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <Callout
                type="success"
                title="Polyglot persistence"
                isDark={
                  isDark
                }
              >
                A large system can
                use PostgreSQL for
                transactions, Redis
                for cache,
                Elasticsearch for
                search and
                ClickHouse for
                analytics. The
                important part is
                having a clear reason
                for each datastore.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="normalization"
                eyebrow="Data Modeling"
                title="Normalization vs Denormalization"
                description="Normalization reduces duplication and anomalies. Denormalization intentionally duplicates selected data to improve read performance."
                icon={Table2}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <BulletCard
                  title="Normalization"
                  isDark={
                    isDark
                  }
                  items={[
                    "Reduce duplicate data",
                    "Improve consistency",
                    "Separate independent entities",
                    "Use keys and relationships",
                    "Often requires JOINs",
                  ]}
                />

                <BulletCard
                  title="Denormalization"
                  isDark={
                    isDark
                  }
                  items={[
                    "Duplicate selected information",
                    "Reduce expensive JOINs",
                    "Optimize read-heavy paths",
                    "Increase write complexity",
                    "Requires synchronization strategy",
                  ]}
                />
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Normal Forms
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {[
                  [
                    "1NF",
                    "Keep values atomic and avoid repeating groups.",
                  ],

                  [
                    "2NF",
                    "Meet 1NF and remove partial dependency on part of a composite key.",
                  ],

                  [
                    "3NF",
                    "Meet 2NF and remove unnecessary transitive dependencies.",
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
                        className="font-black text-blue-500"
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
                title="System design perspective"
                isDark={
                  isDark
                }
              >
                Interviewers usually
                care more about why
                you normalize or
                denormalize for the
                workload than about
                memorizing every
                formal normal form.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="acid"
                eyebrow="Transactions"
                title="ACID and BASE"
                description="These models help reason about transactional correctness and distributed consistency trade-offs."
                icon={ShieldCheck}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {[
                  [
                    "Atomicity",
                    "All operations in a transaction succeed together or fail together.",
                  ],

                  [
                    "Consistency",
                    "Transactions preserve defined database rules and constraints.",
                  ],

                  [
                    "Isolation",
                    "Concurrent transactions interact according to a defined isolation model.",
                  ],

                  [
                    "Durability",
                    "Committed data survives failures according to durability guarantees.",
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
                      <ShieldCheck className="h-5 w-5 text-emerald-500" />

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

              <CodeBlock title="Bank Transfer">
{`BEGIN;

UPDATE accounts
SET balance = balance - 100
WHERE id = 'A';

UPDATE accounts
SET balance = balance + 100
WHERE id = 'B';

COMMIT;`}
              </CodeBlock>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                BASE
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <DiagramNode
                  icon={Server}
                  title="Basically Available"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={RefreshCcw}
                  title="Soft State"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Globe2}
                  title="Eventual Consistency"
                  isDark={
                    isDark
                  }
                />
              </div>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="isolation"
                eyebrow="Concurrency"
                title="Transaction Isolation Levels"
                description="Isolation determines which effects concurrent transactions are allowed to observe."
                icon={LockKeyhole}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 overflow-hidden rounded-2xl border">
                <div className="overflow-x-auto">
                  <table
                    className={`min-w-[900px] w-full ${
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
                          "Level",
                          "Dirty Read",
                          "Non-repeatable Read",
                          "Phantom",
                          "Concurrency",
                        ].map(
                          (
                            value
                          ) => (
                            <th
                              key={
                                value
                              }
                              className={`px-5 py-4 text-left text-xs font-black uppercase ${
                                isDark
                                  ? "text-slate-300"
                                  : "text-slate-600"
                              }`}
                            >
                              {
                                value
                              }
                            </th>
                          )
                        )}
                      </tr>
                    </thead>

                    <tbody>
                      {[
                        [
                          "READ UNCOMMITTED",
                          "Possible",
                          "Possible",
                          "Possible",
                          "Highest",
                        ],

                        [
                          "READ COMMITTED",
                          "Prevented",
                          "Possible",
                          "Possible",
                          "High",
                        ],

                        [
                          "REPEATABLE READ",
                          "Prevented",
                          "Prevented",
                          "DB dependent",
                          "Medium",
                        ],

                        [
                          "SERIALIZABLE",
                          "Prevented",
                          "Prevented",
                          "Prevented",
                          "Lowest",
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

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Dirty Read",
                    "Transaction reads uncommitted data written by another transaction.",
                  ],

                  [
                    "Non-repeatable Read",
                    "The same row returns a different committed value later in the same transaction.",
                  ],

                  [
                    "Phantom Read",
                    "A repeated range query returns additional or missing rows.",
                  ],

                  [
                    "Lost Update",
                    "Two transactions overwrite each other's changes.",
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


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="locking"
                eyebrow="Concurrency Control"
                title="Optimistic vs Pessimistic Locking"
                description="These are two common ways to protect updates when multiple users can modify the same logical record."
                icon={LockKeyhole}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Pessimistic
                    Locking
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Lock the record
                    while performing
                    critical work.
                  </p>

                  <CodeBlock>
{`BEGIN;

SELECT *
FROM seats
WHERE id = 10
FOR UPDATE;

UPDATE seats
SET status = 'BOOKED'
WHERE id = 10;

COMMIT;`}
                  </CodeBlock>

                  <p className="text-sm font-bold text-emerald-500">
                    Good when
                    conflicts are
                    likely.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Optimistic
                    Locking
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Allow concurrent
                    reads and reject
                    the update if the
                    version changed.
                  </p>

                  <CodeBlock>
{`UPDATE seats

SET
    status = 'BOOKED',
    version = version + 1

WHERE
    id = 10
    AND version = 7;`}
                  </CodeBlock>

                  <p className="text-sm font-bold text-emerald-500">
                    Good when
                    conflicts are
                    uncommon.
                  </p>
                </div>
              </div>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="mvcc"
                eyebrow="Concurrency"
                title="MVCC — Multi-Version Concurrency Control"
                description="MVCC allows readers and writers to interact using row versions or snapshots instead of forcing every read to block every write."
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
                  title="Transaction A"
                  subtitle="Reads version 1"
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
                  title="Row Version 1"
                  subtitle="balance = 100"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Transaction B updates"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Database}
                  title="Row Version 2"
                  subtitle="balance = 150"
                  isDark={
                    isDark
                  }
                  success
                />
              </div>

              <p
                className={`mt-5 text-sm leading-7 ${textSecondary}`}
              >
                Depending on
                isolation semantics,
                Transaction A can
                continue reading its
                previous consistent
                snapshot while newer
                transactions observe
                the updated version.
              </p>

              <Callout
                type="info"
                title="MVCC does not mean 'no locks ever'"
                isDark={
                  isDark
                }
              >
                Databases can still
                use locks for writes,
                schema operations and
                particular conflict
                scenarios. MVCC
                primarily helps
                reduce unnecessary
                read/write blocking.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="cap"
                eyebrow="Distributed Systems"
                title="CAP Theorem"
                description="CAP describes the trade-off a distributed system faces during a network partition."
                icon={Network}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {[
                  [
                    "Consistency",
                    "Requests observe behavior compatible with the system's chosen consistency guarantee.",
                  ],

                  [
                    "Availability",
                    "Every request to a non-failing node receives a response.",
                  ],

                  [
                    "Partition Tolerance",
                    "The system continues operating despite network communication failure between nodes.",
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
                title="CAP is about what happens during a partition"
                isDark={
                  isDark
                }
              >
                It is misleading to
                label a database
                simply “CA” or “CP”
                without specifying
                assumptions and
                behavior. The
                interesting trade-off
                appears when nodes
                cannot communicate.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="indexes"
                eyebrow="Performance"
                title="Database Indexes"
                description="Indexes reduce read work by maintaining structures that make selected lookups faster."
                icon={Search}
                isDark={
                  isDark
                }
              />

              <CodeBlock title="Without an index">
{`SELECT *
FROM users
WHERE email = 'user@example.com';

Potential result:

Scan millions of rows
until matching email is found.`}
              </CodeBlock>

              <CodeBlock title="Create an index">
{`CREATE INDEX idx_users_email
ON users(email);`}
              </CodeBlock>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "B-Tree",
                    "Great general-purpose structure for equality, ranges and ordered access.",
                  ],

                  [
                    "Hash",
                    "Useful for equality lookups in systems that support it.",
                  ],

                  [
                    "Composite",
                    "Indexes multiple columns and should match common query ordering.",
                  ],

                  [
                    "Covering",
                    "Contains enough indexed data to satisfy a query without fetching the full row in some databases.",
                  ],

                  [
                    "Full Text",
                    "Supports text-search behavior.",
                  ],

                  [
                    "Spatial",
                    "Supports geospatial queries.",
                  ],

                  [
                    "Vector",
                    "Supports nearest-neighbor vector search.",
                  ],

                  [
                    "Partial",
                    "Indexes only a subset of rows when supported.",
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
                title="Indexes have a write cost"
                isDark={
                  isDark
                }
              >
                INSERT, UPDATE and
                DELETE operations may
                also need to maintain
                affected indexes.
                Creating every
                possible index is not
                a good optimization
                strategy.
              </Callout>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Composite Index
                Ordering
              </h3>

              <CodeBlock>
{`CREATE INDEX idx_orders_user_status
ON orders(user_id, status);`}
              </CodeBlock>

              <p
                className={`text-sm leading-7 ${textSecondary}`}
              >
                The order of columns
                matters because the
                index is organized
                according to its key
                sequence. Design
                indexes from actual
                query patterns.
              </p>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="optimizer"
                eyebrow="Query Performance"
                title="Query Planner & Optimizer"
                description="When SQL arrives, the database must decide how to execute it efficiently."
                icon={BrainCircuit}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Code2}
                  title="SQL Query"
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
                  icon={BrainCircuit}
                  title="Parser + Planner"
                  subtitle="Generate possible plans"
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
                  icon={Activity}
                  title="Cost Estimator"
                  subtitle="Rows, indexes, statistics"
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
                  title="Execution Plan"
                  subtitle="Index scan / sequential scan / join strategy"
                  isDark={
                    isDark
                  }
                  success
                />
              </div>

              <CodeBlock title="Inspect query plan">
{`EXPLAIN ANALYZE

SELECT
    id,
    user_id,
    status
FROM orders
WHERE user_id = 42
AND status = 'PAID';`}
              </CodeBlock>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <BulletCard
                  title="Look For"
                  isDark={
                    isDark
                  }
                  items={[
                    "Sequential scans on huge tables",
                    "Unexpectedly large row estimates",
                    "Expensive sorts",
                    "Bad join order",
                    "Repeated nested loops",
                    "Missing indexes",
                  ]}
                />

                <BulletCard
                  title="Optimization Inputs"
                  isDark={
                    isDark
                  }
                  items={[
                    "Indexes",
                    "Table statistics",
                    "Cardinality",
                    "Predicate selectivity",
                    "Join relationships",
                    "Query structure",
                  ]}
                />
              </div>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="pooling"
                eyebrow="Database Connections"
                title="Connection Pooling"
                description="Opening a new database connection for every HTTP request is expensive and can overwhelm the database."
                icon={Server}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <div className="grid grid-cols-3 gap-2">
                  <DiagramNode
                    icon={Server}
                    title="App 1"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="App 2"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="App N"
                    isDark={
                      isDark
                    }
                  />
                </div>

                <DownArrow
                  label="Reuse bounded connections"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Network}
                  title="Connection Pool"
                  subtitle="Example: 50 active DB connections"
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
                  icon={Database}
                  title="Database"
                  isDark={
                    isDark
                  }
                />
              </div>

              <Callout
                type="warning"
                title="Autoscaling can create a connection explosion"
                isDark={
                  isDark
                }
              >
                200 application
                instances × 100
                connections each =
                20,000 potential
                database
                connections. Pool
                sizing must be
                coordinated with
                database capacity.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="replication"
                eyebrow="Availability"
                title="Database Replication"
                description="Replication maintains multiple copies of data for availability, durability and sometimes read scalability."
                icon={RefreshCcw}
                isDark={
                  isDark
                }
              />

              <h3
                className={`mt-7 text-xl font-black ${textPrimary}`}
              >
                Single-Leader
                Replication
              </h3>

              <div
                className={`mt-4 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Database}
                  title="Primary"
                  subtitle="Accept writes"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Replicate"
                  isDark={
                    isDark
                  }
                />

                <div className="grid grid-cols-3 gap-2">
                  <DiagramNode
                    icon={Database}
                    title="Replica 1"
                    subtitle="Reads"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="Replica 2"
                    subtitle="Reads"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="Replica 3"
                    subtitle="Failover"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Replication Models
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {[
                  [
                    "Single Leader",
                    "One leader accepts writes and replicates them to followers.",
                  ],

                  [
                    "Multi Leader",
                    "More than one leader can accept writes. Conflict resolution becomes important.",
                  ],

                  [
                    "Leaderless",
                    "Clients or coordinators write to multiple replicas and use quorum-style techniques.",
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
                Sync vs Async
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <BulletCard
                  title="Synchronous"
                  isDark={
                    isDark
                  }
                  items={[
                    "Wait for replica acknowledgement",
                    "Stronger durability",
                    "Potentially stronger consistency",
                    "Higher write latency",
                  ]}
                />

                <BulletCard
                  title="Asynchronous"
                  isDark={
                    isDark
                  }
                  items={[
                    "Primary responds sooner",
                    "Lower write latency",
                    "Replica lag possible",
                    "Failover can risk newest writes depending on guarantees",
                  ]}
                />
              </div>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="read-write"
                eyebrow="Read Scaling"
                title="Read / Write Splitting"
                description="A common architecture sends writes to the primary and appropriate reads to replicas."
                icon={Network}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <DiagramNode
                    icon={Server}
                    title="Write Traffic"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Server}
                    title="Read Traffic"
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

                <div className="grid gap-3 sm:grid-cols-2">
                  <DiagramNode
                    icon={Database}
                    title="Primary"
                    subtitle="Writes"
                    isDark={
                      isDark
                    }
                    highlight
                  />

                  <DiagramNode
                    icon={Network}
                    title="Replica Router"
                    subtitle="Read distribution"
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

                <div className="grid grid-cols-3 gap-2">
                  <DiagramNode
                    icon={Database}
                    title="R1"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="R2"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="R3"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <Callout
                type="warning"
                title="Read-after-write problem"
                isDark={
                  isDark
                }
              >
                A user updates their
                profile on the
                primary and
                immediately reads
                from a lagging
                replica. They may see
                the old value. Route
                sensitive reads to
                the primary or use a
                stronger consistency
                technique.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="partitioning"
                eyebrow="Large Tables"
                title="Database Partitioning"
                description="Partitioning divides a large logical dataset into smaller pieces that can be managed independently."
                icon={Layers3}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Horizontal
                    Partitioning
                  </h3>

                  <p
                    className={`mt-2 text-sm ${textSecondary}`}
                  >
                    Divide rows.
                  </p>

                  <CodeBlock>
{`orders_2025
orders_2026
orders_2027`}
                  </CodeBlock>

                  <p
                    className={`text-sm leading-7 ${textSecondary}`}
                  >
                    Common for large
                    time-based or
                    range-based
                    datasets.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Vertical
                    Partitioning
                  </h3>

                  <p
                    className={`mt-2 text-sm ${textSecondary}`}
                  >
                    Separate columns
                    or logical
                    features.
                  </p>

                  <CodeBlock>
{`users
----------------
id
email
name


user_profiles
----------------
user_id
bio
avatar
preferences`}
                  </CodeBlock>
                </div>
              </div>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="sharding"
                eyebrow="Horizontal Scaling"
                title="Database Sharding"
                description="Sharding distributes subsets of data across multiple database nodes."
                icon={Boxes}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Server}
                  title="Application"
                  isDark={
                    isDark
                  }
                />

                <DownArrow
                  label="Shard Key"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Hash}
                  title="Shard Router"
                  subtitle="Find owning shard"
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

                <div className="grid grid-cols-3 gap-2">
                  <DiagramNode
                    icon={Database}
                    title="Shard A"
                    subtitle="Subset"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="Shard B"
                    subtitle="Subset"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="Shard C"
                    subtitle="Subset"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Sharding Strategies
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Hash Sharding",
                    "hash(key) determines the shard. Often distributes traffic reasonably evenly.",
                  ],

                  [
                    "Range Sharding",
                    "Different value ranges live on different shards. Useful for range locality but can create hotspots.",
                  ],

                  [
                    "Directory Sharding",
                    "A mapping service determines which shard owns each entity.",
                  ],

                  [
                    "Geo Sharding",
                    "Data is partitioned by region for locality or data residency.",
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
                Sharding Problems
              </h3>

              <BulletCard
                title="Complexities Introduced"
                isDark={
                  isDark
                }
                icon={
                  TriangleAlert
                }
                items={[
                  "Cross-shard joins",
                  "Cross-shard transactions",
                  "Rebalancing",
                  "Global unique constraints",
                  "Hot shards",
                  "Distributed queries",
                  "Shard key changes",
                ]}
              />
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="hot-shard"
                eyebrow="Shard-Key Design"
                title="Hot Shards & Celebrity Problem"
                description="A system can have many shards but still fail if most traffic lands on one shard."
                icon={Activity}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <div className="grid grid-cols-4 gap-2">
                  <DiagramNode
                    icon={Users}
                    title="User"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Users}
                    title="User"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Users}
                    title="User"
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
                  label="Celebrity 123"
                  isDark={
                    isDark
                  }
                />

                <div className="grid grid-cols-3 gap-2">
                  <DiagramNode
                    icon={Database}
                    title="Shard A"
                    subtitle="🔥 overloaded"
                    isDark={
                      isDark
                    }
                    danger
                  />

                  <DiagramNode
                    icon={Database}
                    title="Shard B"
                    subtitle="Mostly idle"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="Shard C"
                    subtitle="Mostly idle"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <BulletCard
                  title="Good Shard Key"
                  isDark={
                    isDark
                  }
                  items={[
                    "High cardinality",
                    "Traffic distributed reasonably evenly",
                    "Matches common access patterns",
                    "Avoids excessive cross-shard queries",
                  ]}
                />

                <BulletCard
                  title="Possible Hot-Shard Solutions"
                  isDark={
                    isDark
                  }
                  items={[
                    "Cache hot reads",
                    "Read replicas",
                    "Key salting",
                    "Better shard key",
                    "Split hot partitions",
                    "Precompute popular data",
                  ]}
                />
              </div>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="consistent-hashing"
                eyebrow="Distribution"
                title="Consistent Hashing"
                description="Consistent hashing reduces how many keys need to move when nodes are added or removed."
                icon={Hash}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-5 sm:p-7 ${surface}`}
              >
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <DiagramNode
                    icon={Database}
                    title="Node A"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="Node B"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="Node C"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Database}
                    title="Node D"
                    isDark={
                      isDark
                    }
                  />
                </div>

                <div
                  className={`mt-6 rounded-full border-4 border-dashed p-10 text-center ${
                    isDark
                      ? "border-blue-900 bg-blue-950/10"
                      : "border-blue-200 bg-blue-50"
                  }`}
                >
                  <p className="text-sm font-black text-blue-500">
                    Hash Ring
                  </p>

                  <p
                    className={`mt-2 text-xs ${textSecondary}`}
                  >
                    Keys map to
                    positions and are
                    assigned to the
                    next appropriate
                    node around the
                    ring.
                  </p>
                </div>
              </div>

              <Callout
                type="info"
                title="Virtual nodes"
                isDark={
                  isDark
                }
              >
                A physical server can
                own multiple virtual
                points on the hash
                ring, helping improve
                distribution and
                rebalancing.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="quorum"
                eyebrow="Leaderless Databases"
                title="Quorum Reads and Writes"
                description="Some distributed stores write and read from multiple replicas using configurable quorum values."
                icon={Network}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {[
                  [
                    "N",
                    "Total number of replicas.",
                  ],

                  [
                    "W",
                    "Number of replica acknowledgements required for a write.",
                  ],

                  [
                    "R",
                    "Number of replicas consulted for a read.",
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
                      className={`rounded-xl border p-5 text-center ${surface}`}
                    >
                      <p className="text-3xl font-black text-blue-500">
                        {title}
                      </p>

                      <p
                        className={`mt-2 text-sm ${textSecondary}`}
                      >
                        {text}
                      </p>
                    </div>
                  )
                )}
              </div>

              <CodeBlock title="Example">
{`N = 3
W = 2
R = 2

A write succeeds after 2 replicas acknowledge.

A read consults 2 replicas.`}
              </CodeBlock>

              <Callout
                type="warning"
                title="R + W > N is useful intuition, not the complete consistency story"
                isDark={
                  isDark
                }
              >
                Real guarantees also
                depend on conflict
                handling, versioning,
                failures,
                coordination,
                sloppy quorums and
                implementation
                details.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="consistency"
                eyebrow="Distributed Reads"
                title="Consistency Models"
                description="Consistency is not simply strong or eventual. Different applications need different guarantees."
                icon={RefreshCcw}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                {[
                  [
                    "Strong Consistency",
                    "Reads behave according to a strong latest-value style guarantee provided by the system.",
                  ],

                  [
                    "Eventual Consistency",
                    "Replicas can temporarily differ and converge later.",
                  ],

                  [
                    "Read Your Writes",
                    "A client sees its own successful updates.",
                  ],

                  [
                    "Monotonic Reads",
                    "After seeing a newer state, a client should not later see an older one.",
                  ],

                  [
                    "Bounded Staleness",
                    "Reads may lag, but only within an allowed time or version bound.",
                  ],

                  [
                    "Causal Consistency",
                    "Causally related operations are observed in a consistent causal order.",
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


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="wal"
                eyebrow="Durability"
                title="Write-Ahead Log — WAL"
                description="Many databases record intended changes in a durable log before considering the transaction safely committed."
                icon={ShieldCheck}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Server}
                  title="Application Write"
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
                  icon={Code2}
                  title="Write-Ahead Log"
                  subtitle="Durable record of change"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Commit / ACK"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Database}
                  title="Data Pages"
                  subtitle="Flushed later"
                  isDark={
                    isDark
                  }
                />
              </div>

              <p
                className={`mt-5 text-sm leading-7 ${textSecondary}`}
              >
                After a crash, the
                database can use its
                transaction log to
                replay committed
                operations and
                recover state.
              </p>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="buffer-pool"
                eyebrow="Internal Caching"
                title="Database Buffer Pool"
                description="Databases themselves cache frequently accessed pages in memory."
                icon={Zap}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Server}
                  title="SQL Query"
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
                  icon={Zap}
                  title="Buffer Pool"
                  subtitle="Frequently used DB pages in RAM"
                  isDark={
                    isDark
                  }
                  highlight
                />

                <DownArrow
                  label="Miss"
                  isDark={
                    isDark
                  }
                />

                <DiagramNode
                  icon={Database}
                  title="Disk / SSD"
                  isDark={
                    isDark
                  }
                />
              </div>

              <Callout
                type="info"
                title="Database read does not always mean disk read"
                isDark={
                  isDark
                }
              >
                Frequently accessed
                pages may already be
                available in database
                memory or operating
                system cache.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="backup"
                eyebrow="Disaster Recovery"
                title="Backup, PITR, RPO & RTO"
                description="Replication protects availability, but replication alone is not a backup strategy."
                icon={ShieldCheck}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <BulletCard
                  title="Backup Techniques"
                  isDark={
                    isDark
                  }
                  items={[
                    "Full backups",
                    "Incremental backups",
                    "Snapshots",
                    "Transaction log archival",
                    "Point-in-time recovery",
                    "Cross-region backup copies",
                  ]}
                />

                <BulletCard
                  title="Recovery Questions"
                  isDark={
                    isDark
                  }
                  items={[
                    "How much data can we lose?",
                    "How long can restoration take?",
                    "Are backups tested?",
                    "Are backups encrypted?",
                    "Can we recover from accidental deletion?",
                  ]}
                />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <p className="text-3xl font-black text-blue-500">
                    RPO
                  </p>

                  <h3
                    className={`mt-2 font-black ${textPrimary}`}
                  >
                    Recovery Point
                    Objective
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Maximum acceptable
                    amount of data
                    loss measured in
                    time.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <p className="text-3xl font-black text-violet-500">
                    RTO
                  </p>

                  <h3
                    className={`mt-2 font-black ${textPrimary}`}
                  >
                    Recovery Time
                    Objective
                  </h3>

                  <p
                    className={`mt-2 text-sm leading-7 ${textSecondary}`}
                  >
                    Maximum acceptable
                    time to restore
                    service.
                  </p>
                </div>
              </div>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="migration"
                eyebrow="Production Changes"
                title="Schema Migration Without Downtime"
                description="Large tables cannot always be changed with one blocking migration."
                icon={RefreshCcw}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-3">
                {[
                  [
                    "1",
                    "Expand — add the new schema in a backward-compatible way.",
                  ],

                  [
                    "2",
                    "Deploy code that understands both old and new representations.",
                  ],

                  [
                    "3",
                    "Backfill existing data in controlled batches.",
                  ],

                  [
                    "4",
                    "Switch reads and writes to the new representation.",
                  ],

                  [
                    "5",
                    "Verify migration and monitoring.",
                  ],

                  [
                    "6",
                    "Contract — remove the old schema later.",
                  ],
                ].map(
                  (
                    [
                      number,
                      text,
                    ]
                  ) => (
                    <div
                      key={
                        number
                      }
                      className={`flex gap-4 rounded-xl border p-4 ${surface}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">
                        {number}
                      </span>

                      <p
                        className={`pt-1 text-sm font-semibold ${textPrimary}`}
                      >
                        {text}
                      </p>
                    </div>
                  )
                )}
              </div>

              <Callout
                type="warning"
                title="Avoid huge one-shot migrations"
                isDark={
                  isDark
                }
              >
                Rewriting hundreds
                of millions of rows
                in one transaction
                can create locks,
                replication lag,
                excessive WAL and
                long recovery times.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="soft-delete"
                eyebrow="Data Lifecycle"
                title="Soft Delete vs Hard Delete"
                description="Deletion semantics affect auditing, privacy, storage and query behavior."
                icon={Database}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Hard Delete
                  </h3>

                  <CodeBlock>
{`DELETE FROM users
WHERE id = 42;`}
                  </CodeBlock>

                  <p
                    className={`text-sm leading-7 ${textSecondary}`}
                  >
                    Record is
                    physically removed
                    from the logical
                    table.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border p-5 ${surface}`}
                >
                  <h3
                    className={`font-black ${textPrimary}`}
                  >
                    Soft Delete
                  </h3>

                  <CodeBlock>
{`UPDATE users

SET
    deleted_at = NOW()

WHERE
    id = 42;`}
                  </CodeBlock>

                  <p
                    className={`text-sm leading-7 ${textSecondary}`}
                  >
                    Record remains
                    stored but is
                    logically hidden.
                  </p>
                </div>
              </div>

              <Callout
                type="warning"
                title="Soft delete adds query complexity"
                isDark={
                  isDark
                }
              >
                Every relevant query
                must correctly exclude
                deleted rows, and
                indexes may need to
                account for deletion
                state.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="archival"
                eyebrow="Storage Lifecycle"
                title="Hot, Warm & Cold Data"
                description="Not every record needs to remain forever in the expensive primary transactional database."
                icon={Database}
                isDark={
                  isDark
                }
              />

              <div
                className={`mt-7 rounded-2xl border p-4 sm:p-7 ${surface}`}
              >
                <DiagramNode
                  icon={Zap}
                  title="Hot Data"
                  subtitle="Primary DB • frequently accessed"
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
                  icon={Database}
                  title="Warm Data"
                  subtitle="Archive tables / cheaper storage"
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
                  icon={Boxes}
                  title="Cold Data"
                  subtitle="Object storage / long-term archive"
                  isDark={
                    isDark
                  }
                />
              </div>

              <p
                className={`mt-5 text-sm leading-7 ${textSecondary}`}
              >
                Historical logs,
                completed orders and
                old events can often
                be moved out of the
                latency-sensitive
                primary storage while
                remaining available
                for analytics or
                compliance.
              </p>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="security"
                eyebrow="Security"
                title="Database Security"
                description="A scalable database that exposes customer data is still a failed architecture."
                icon={ShieldCheck}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid gap-4 md:grid-cols-2">
                <BulletCard
                  title="Access Security"
                  isDark={
                    isDark
                  }
                  items={[
                    "Least-privilege database users",
                    "Application-specific credentials",
                    "Network restrictions",
                    "Secret rotation",
                    "Separate admin access",
                    "Audit privileged operations",
                  ]}
                />

                <BulletCard
                  title="Data Security"
                  isDark={
                    isDark
                  }
                  items={[
                    "TLS in transit",
                    "Encryption at rest",
                    "Encrypted backups",
                    "Sensitive-field protection",
                    "PII minimization",
                    "Data retention policies",
                  ]}
                />
              </div>

              <Callout
                type="warning"
                title="Never expose the database directly to the public internet unless there is a very deliberate secured architecture"
                isDark={
                  isDark
                }
              >
                Application services,
                private networking,
                authentication,
                authorization and
                firewall controls
                should protect the
                storage layer.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="scaling"
                eyebrow="Scaling Strategy"
                title="How Should You Scale a Database?"
                description="Sharding should usually not be the first optimization."
                icon={Sparkles}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-3">
                {[
                  "Measure the bottleneck first.",

                  "Fix inefficient queries.",

                  "Improve schema design.",

                  "Add appropriate indexes.",

                  "Use connection pooling.",

                  "Cache suitable hot reads.",

                  "Scale vertically if cost-effective.",

                  "Add read replicas for read-heavy traffic.",

                  "Partition huge tables.",

                  "Archive cold data.",

                  "Shard when one database can no longer satisfy storage or write requirements.",
                ].map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item
                      }
                      className={`flex gap-4 rounded-xl border p-4 ${surface}`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white">
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
                type="success"
                title="Measure before scaling"
                isDark={
                  isDark
                }
              >
                CPU, I/O, lock
                contention, cache hit
                rate, query latency,
                scanned rows and
                connection
                utilization tell you
                what actually needs
                improvement.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="bookmyshow"
                eyebrow="Case Study"
                title="BookMyShow-Style Database Architecture"
                description="A high-concurrency booking platform is a good example of combining multiple storage technologies."
                icon={LockKeyhole}
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
                learning. It is not a
                claim about
                BookMyShow's private
                production
                implementation.
              </Callout>

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
                  icon={Server}
                  title="Booking Service"
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
                    icon={Table2}
                    title="SQL"
                    subtitle="Bookings + payments"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Zap}
                    title="Redis"
                    subtitle="Seat holds + cache"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={Search}
                    title="Search"
                    subtitle="Movie discovery"
                    isDark={
                      isDark
                    }
                  />

                  <DiagramNode
                    icon={BarChart3}
                    title="Analytics"
                    subtitle="Reporting"
                    isDark={
                      isDark
                    }
                  />
                </div>
              </div>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Core SQL Schema
              </h3>

              <CodeBlock>
{`movies
-------------------------
id
title
language


theatres
-------------------------
id
name
city


shows
-------------------------
id
movie_id
theatre_id
screen_id
start_time


show_seats
-------------------------
show_id
seat_id
status
price
version


bookings
-------------------------
id
user_id
show_id
status
total_amount


booking_seats
-------------------------
booking_id
show_id
seat_id


payments
-------------------------
id
booking_id
provider_txn_id
status
amount`}
              </CodeBlock>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Prevent Final Double
                Booking
              </h3>

              <CodeBlock title="Optimistic conditional update">
{`UPDATE show_seats

SET
    status = 'BOOKED',
    version = version + 1

WHERE
    show_id = :showId
    AND seat_id = :seatId
    AND status = 'AVAILABLE'
    AND version = :expectedVersion;`}
              </CodeBlock>

              <p
                className={`mt-3 text-sm leading-7 ${textSecondary}`}
              >
                If zero rows are
                updated, another
                transaction has
                probably changed the
                seat.
              </p>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Alternative:
                Pessimistic Lock
              </h3>

              <CodeBlock>
{`BEGIN;

SELECT *
FROM show_seats

WHERE
    show_id = :showId
    AND seat_id = :seatId

FOR UPDATE;


-- verify AVAILABLE

UPDATE show_seats
SET status = 'BOOKED'
WHERE ...;

COMMIT;`}
              </CodeBlock>

              <h3
                className={`mt-8 text-xl font-black ${textPrimary}`}
              >
                Why Redis Still
                Helps
              </h3>

              <p
                className={`mt-3 text-sm leading-7 ${textSecondary}`}
              >
                Redis can provide a
                short-lived seat hold
                during checkout,
                reducing contention
                and improving user
                experience. The
                durable database
                remains responsible
                for final booking
                correctness.
              </p>

              <CodeBlock>
{`SET
show:992:seat:A10:lock
booking-token-123

NX
PX 300000`}
              </CodeBlock>

              <Callout
                type="success"
                title="Layered correctness"
                isDark={
                  isDark
                }
              >
                Redis handles fast
                temporary state.
                SQL transactions,
                conditional updates,
                constraints and
                idempotency protect
                the final durable
                booking.
              </Callout>
            </section>


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="failures"
                eyebrow="Production"
                title="Database Failure Scenarios"
                description="Good system design covers what happens when the storage layer becomes slow, unavailable or inconsistent."
                icon={TriangleAlert}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-4">
                {[
                  [
                    "Primary Failure",
                    "Promote a healthy replica or use managed failover while clients reconnect safely.",
                  ],

                  [
                    "Replica Lag",
                    "Consistency-sensitive reads may need to go to the primary.",
                  ],

                  [
                    "Connection Exhaustion",
                    "Use bounded pools, backpressure and appropriate timeouts.",
                  ],

                  [
                    "Hot Shard",
                    "Change partition strategy, split hot data or cache high-volume reads.",
                  ],

                  [
                    "Slow Query",
                    "Inspect EXPLAIN plans, indexes, row estimates, lock waits and scanned data.",
                  ],

                  [
                    "Deadlock",
                    "Keep transactions small, use consistent lock ordering and handle transaction retry safely.",
                  ],

                  [
                    "Disk Full",
                    "Capacity monitoring, archival, cleanup and emergency storage procedures are required.",
                  ],

                  [
                    "Backup Failure",
                    "Alert immediately and regularly test actual restore procedures.",
                  ],

                  [
                    "Region Failure",
                    "Use cross-region replication and a clearly tested disaster-recovery process when required.",
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


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="monitoring"
                eyebrow="Observability"
                title="Database Metrics to Monitor"
                description="Database performance problems often appear in metrics before they become full outages."
                icon={Activity}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {[
                  "Query P50",
                  "Query P95",
                  "Query P99",
                  "QPS",
                  "CPU",
                  "Memory",
                  "Disk I/O",
                  "Disk Space",
                  "Connections",
                  "Pool Wait Time",
                  "Cache Hit Ratio",
                  "Replication Lag",
                  "Lock Waits",
                  "Deadlocks",
                  "Slow Queries",
                  "Rows Scanned",
                  "Index Usage",
                  "Transaction Rate",
                  "Rollback Rate",
                  "Backup Status",
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


<section className="mt-12 sm:mt-16">
              <SectionHeading
                id="interview"
                eyebrow="Interview Preparation"
                title="Database System Design Interview Questions"
                description="Use these for revision after studying the complete page."
                icon={Sparkles}
                isDark={
                  isDark
                }
              />

              <div className="mt-7 space-y-3">
                {[
                  "How do you choose between SQL and NoSQL?",

                  "When would you choose PostgreSQL?",

                  "When would you choose MongoDB?",

                  "When is Cassandra a good choice?",

                  "When should Redis be used?",

                  "Why should Elasticsearch usually not be the transactional source of truth?",

                  "When should you use a graph database?",

                  "What problem does a time-series database solve?",

                  "When do you need a vector database?",

                  "OLTP vs OLAP?",

                  "Normalization vs denormalization?",

                  "Explain 1NF, 2NF and 3NF.",

                  "What are ACID properties?",

                  "What is BASE?",

                  "What are transaction isolation levels?",

                  "What is a dirty read?",

                  "What is a non-repeatable read?",

                  "What is a phantom read?",

                  "What is a lost update?",

                  "Optimistic vs pessimistic locking?",

                  "What is MVCC?",

                  "Explain CAP theorem.",

                  "What is a database index?",

                  "B-Tree vs hash index?",

                  "What is a composite index?",

                  "Why do indexes make writes slower?",

                  "What does EXPLAIN ANALYZE do?",

                  "How does a query optimizer select an execution plan?",

                  "Why do applications use connection pools?",

                  "How can autoscaling cause database connection exhaustion?",

                  "What is replication?",

                  "Single-leader vs multi-leader vs leaderless replication?",

                  "Synchronous vs asynchronous replication?",

                  "What is replication lag?",

                  "What is read/write splitting?",

                  "How do you solve read-after-write inconsistency?",

                  "What is horizontal partitioning?",

                  "What is vertical partitioning?",

                  "Partitioning vs sharding?",

                  "What is database sharding?",

                  "Hash vs range sharding?",

                  "What makes a good shard key?",

                  "What is a hot shard?",

                  "What is consistent hashing?",

                  "Why use virtual nodes?",

                  "What are N, R and W in quorum systems?",

                  "Strong consistency vs eventual consistency?",

                  "What is read-your-writes consistency?",

                  "What is WAL?",

                  "How does WAL help durability?",

                  "What is a database buffer pool?",

                  "Replication vs backup?",

                  "What are RPO and RTO?",

                  "How would you perform a zero-downtime schema migration?",

                  "Soft delete vs hard delete?",

                  "How do you archive old data?",

                  "How should databases be secured?",

                  "How would you scale a read-heavy database?",

                  "How would you scale a write-heavy database?",

                  "When should you finally introduce sharding?",

                  "How would you design BookMyShow's booking database?",

                  "How would you prevent double seat booking?",

                  "What database metrics would you monitor?",
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


<section className="mt-12 sm:mt-16">
              <SectionHeading
                eyebrow="Quick Revision"
                title="Frequently Asked Questions"
                description="Short answers to frequently searched database system-design questions."
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


<section className="mt-12 sm:mt-16">
              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl sm:p-9">
                <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-blue-100">
                      <BookOpen className="h-3.5 w-3.5" />

                      Mastering System
                      Design — HLD
                    </div>

                    <h2 className="mt-4 text-2xl font-black sm:text-3xl">
                      Learn complete
                      system design,
                      not isolated
                      database
                      concepts.
                    </h2>

                    <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
                      Learn how
                      databases,
                      caching, load
                      balancing,
                      queues, rate
                      limiting,
                      locking,
                      concurrency and
                      scaling work
                      together in
                      complete
                      interview-style
                      architectures.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-blue-100">
                      {[
                        "SQL",
                        "NoSQL",
                        "Indexes",
                        "Replication",
                        "Sharding",
                        "Caching",
                        "Queues",
                        "BookMyShow",
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

                  <Link
                    to={BOOK_URL}
                    className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
                  >
                    Explore HLD Book

                    <ArrowRight className="h-4 w-4" />
                  </Link>
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
                <Link
                  to={PREVIOUS_TOPIC.path}
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
                </Link>

                <Link
                  to={NEXT_TOPIC.path}
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
                </Link>
              </div>
            </section>
          </main>
        </div>
      </>
    );
  };

export default HLDDatabaseResource;