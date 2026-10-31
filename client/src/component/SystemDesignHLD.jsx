import React, { useEffect, useMemo, useState, useRef } from "react";
import { trackViewContent } from "../lib/metaPixel.js";
import { Helmet } from "react-helmet-async";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  Check,
  CheckCircle2,
  ChevronDown,
  Cloud,
  Code2,
  Database,
  Download,
  FileText,
  Gauge,
  Globe,
  Lock,
  Rocket,
  Target,
  Timer,
  TrendingUp,
  XCircle,
  GitBranch,
  HardDrive,
  Layers3,
  LockKeyhole,
  Network,
  RadioTower,
  RefreshCcw,
  Search,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { pdfjs } from "react-pdf";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import HLD_PREVIEW_PDF from "../assest/master_hld_preview.pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";
const THEME_STORAGE_KEY = "theme";
const LLD_REDIRECT_URL = "/book/system-design/lld";
const COMBO_REDIRECT_URL = "/book/system-design/hld-lld/combo";

// Title <= 60 chars and description <= 160 chars so SERP snippets are not truncated.
const SEO_TITLE = "System Design HLD Book: 19 Case Studies (PDF) | Target Trek";
const SEO_DESCRIPTION =
  "Crack system design interviews with an HLD ebook: 45-minute playbook, 16 core building blocks and 19 case studies — WhatsApp, Uber, BookMyShow, payments & more.";
const SEO_KEYWORDS =
  "system design book, HLD book, high level design interview, system design interview ebook, system design PDF, distributed systems, URL shortener design, WhatsApp system design, Uber system design, BookMyShow system design, Kafka, Redis, sharding";
const SEO_LONG_DESCRIPTION =
  "Learn High-Level Design with a 45-minute interview playbook, core distributed-system building blocks, and 19 production-style case studies covering APIs, databases, caching, Kafka, scaling, failure handling and trade-offs.";

const normalizeTheme = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return normalized === "dark" || normalized === "light" ? normalized : null;
};

const readThemeFromStorage = () => {
  if (typeof window === "undefined") return null;
  return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
};

const readThemeFromDom = () => {
  if (typeof document === "undefined") return null;

  const html = document.documentElement;
  const body = document.body;

  const explicitTheme =
    normalizeTheme(html?.getAttribute("data-theme")) ||
    normalizeTheme(body?.getAttribute("data-theme"));

  if (explicitTheme) return explicitTheme;

  if (html?.classList?.contains("dark") || body?.classList?.contains("dark")) {
    return "dark";
  }

  if (html?.classList?.contains("light") || body?.classList?.contains("light")) {
    return "light";
  }

  return null;
};

const readStoredTheme = () => {
  if (typeof window === "undefined") return "light";

  return (
    readThemeFromStorage() ||
    readThemeFromDom() ||
    (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
      ? "dark"
      : "light")
  );
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

const formatTwoDigits = (value) => String(value).padStart(2, "0");

const caseStudies = [
  {
    number: "01",
    title: "URL Shortener",
    subtitle: "bit.ly style redirect platform",
    summary:
      "Short-code generation, read-heavy architecture, Redis caching, redirect latency, click analytics, expiry and multi-region design.",
    tags: ["KGS", "Redis", "DynamoDB", "Kafka"],
  },
  {
    number: "02",
    title: "WhatsApp / Messaging",
    subtitle: "Real-time 1:1 and group chat",
    summary:
      "WebSockets, session registry, message ordering, offline delivery, fan-out, idempotency, presence and encrypted media flows.",
    tags: ["WebSocket", "Cassandra", "Redis", "Kafka"],
  },
  {
    number: "03",
    title: "Uber / Ride-Hailing",
    subtitle: "Location + matching at scale",
    summary:
      "Driver location ingestion, geo indexes, dispatch, atomic assignment, trip state machine, ETA, surge and payment flow.",
    tags: ["H3", "Redis GEO", "CAS", "Kafka"],
  },
  {
    number: "04",
    title: "Instagram",
    subtitle: "Media, social graph and feed",
    summary:
      "Upload pipeline, CDN, object storage, feed generation, fan-out, caching, likes/comments, celebrity users and search.",
    tags: ["CDN", "Feed", "S3", "Fan-out"],
  },
  {
    number: "05",
    title: "YouTube",
    subtitle: "Video upload and delivery",
    summary:
      "Chunked upload, transcoding, metadata, object storage, adaptive streaming, CDN distribution and recommendation events.",
    tags: ["Video", "Transcoding", "CDN", "Object Store"],
  },
  {
    number: "06",
    title: "Netflix / Video Streaming",
    subtitle: "Global playback platform",
    summary:
      "Playback APIs, catalog, recommendation, encoding ladders, CDN strategy, regional resiliency and massive read traffic.",
    tags: ["Streaming", "CDN", "Cache", "Multi-region"],
  },
  {
    number: "07",
    title: "Twitter / X",
    subtitle: "Timeline and social graph",
    summary:
      "Tweet storage, home timeline, fan-out-on-write vs read, celebrity handling, cache hierarchy, search and trending events.",
    tags: ["Timeline", "Fan-out", "Redis", "Kafka"],
  },
  {
    number: "08",
    title: "Dropbox",
    subtitle: "Distributed file sync",
    summary:
      "Chunking, deduplication, metadata, sync conflicts, uploads, versioning, object storage and desktop/mobile consistency.",
    tags: ["Chunking", "Metadata", "Sync", "Object Store"],
  },
  {
    number: "09",
    title: "Google Drive + Docs",
    subtitle: "Files, sharing and collaboration",
    summary:
      "File metadata, permissions, sync, document collaboration, versioning, real-time updates and scalable blob delivery.",
    tags: ["Sharing", "Collaboration", "Versioning", "Storage"],
  },
  {
    number: "10",
    title: "Ticket Booking / BookMyShow",
    subtitle: "Zero double-booking seat inventory",
    summary:
      "Seat holds, TTL, transactions, locking, payment saga, hot-show traffic, waiting rooms and idempotent confirmation.",
    tags: ["Locking", "TTL", "Saga", "Transactions"],
  },
  {
    number: "11",
    title: "Food Delivery",
    subtitle: "Swiggy / Zomato style platform",
    summary:
      "Restaurant discovery, cart, order lifecycle, delivery-partner assignment, live tracking, payments and notifications.",
    tags: ["Orders", "Geo", "Events", "State Machine"],
  },
  {
    number: "12",
    title: "Notification System",
    subtitle: "Email, SMS and push at scale",
    summary:
      "Priority queues, provider routing, retries, dedupe, scheduling, frequency caps, fallback channels and bulk campaigns.",
    tags: ["Kafka", "Retry", "Dedupe", "Workers"],
  },
  {
    number: "13",
    title: "Distributed Rate Limiter",
    subtitle: "Low-latency API protection",
    summary:
      "Token bucket, sliding windows, Redis atomicity, sharding, dynamic rules, burst handling and fail-open/fail-closed choices.",
    tags: ["Redis", "Lua", "Token Bucket", "Gateway"],
  },
  {
    number: "14",
    title: "News Feed",
    subtitle: "Personalized feed generation",
    summary:
      "Fan-out strategies, ranking, cache layers, pagination, celebrity users, freshness and asynchronous feed materialization.",
    tags: ["Feed", "Ranking", "Fan-out", "Cache"],
  },
  {
    number: "15",
    title: "Distributed Job Scheduler",
    subtitle: "Reliable delayed and recurring work",
    summary:
      "Scheduling, worker leases, retries, idempotency, partitioning, failure recovery, cron semantics and execution history.",
    tags: ["Scheduler", "Queue", "Lease", "Retry"],
  },
  {
    number: "16",
    title: "Search Autocomplete",
    subtitle: "Typeahead at very high QPS",
    summary:
      "Trie/FST indexes, top-K precomputation, hot prefixes, cache hierarchy, offline rebuilds, trends and personalization.",
    tags: ["Trie", "Top-K", "Cache", "Flink"],
  },
  {
    number: "17",
    title: "Web Crawler",
    subtitle: "Distributed internet-scale crawling",
    summary:
      "URL frontier, politeness, dedupe, Bloom filters, retries, robots rules, spider-trap defense and recrawl scheduling.",
    tags: ["Frontier", "Bloom Filter", "Kafka", "Object Store"],
  },
  {
    number: "18",
    title: "Payment System",
    subtitle: "Correct money movement",
    summary:
      "Payment state machines, idempotency, ledger entries, webhook reliability, PSP routing, reconciliation and security.",
    tags: ["Ledger", "Idempotency", "Webhook", "Reconciliation"],
  },
  {
    number: "19",
    title: "E-commerce Platform",
    subtitle: "Amazon / Flipkart scale",
    summary:
      "Catalog, search, cart, inventory reservation, checkout saga, flash-sale controls, seller flows, fulfillment and tracking.",
    tags: ["Inventory", "Saga", "Search", "Flash Sale"],
  },
];

const caseStudyFramework = [
  {
    number: "01",
    title: "Interview question",
    copy: "Start from the prompt exactly as it is likely to be asked in a real interview.",
  },
  {
    number: "02",
    title: "Clarifying questions",
    copy: "Narrow the scope before drawing boxes: scale, features, consistency, retention and geography.",
  },
  {
    number: "03",
    title: "FR + NFR + estimates",
    copy: "Turn the prompt into functional requirements, SLOs and back-of-the-envelope traffic/storage numbers.",
  },
  {
    number: "04",
    title: "Interviewer signals",
    copy: "Know what strong answers should surface, the common red flags and likely follow-up questions.",
  },
  {
    number: "05",
    title: "Entities + APIs + DB",
    copy: "Model the core domain, define API contracts and choose storage from actual access patterns.",
  },
  {
    number: "06",
    title: "HLD architecture",
    copy: "Connect clients, gateways, services, queues, caches, databases, storage and analytics components.",
  },
  {
    number: "07",
    title: "Request flows",
    copy: "Walk the interviewer through the most important success path and state transitions step by step.",
  },
  {
    number: "08",
    title: "Algorithms + deep dives",
    copy: "Go deep on the hard part: geo search, key generation, rate limiting, fan-out, locking or scheduling.",
  },
  {
    number: "09",
    title: "Trade-offs + failures",
    copy: "Discuss retries, hot keys, crashes, consistency, recovery and the cost of every major design choice.",
  },
];

const interviewPlaybook = [
  { time: "05 min", title: "Requirements", copy: "Scope, users, critical flows, FRs and NFRs." },
  { time: "03 min", title: "Estimation", copy: "QPS, peak load, storage, bandwidth and concurrency." },
  { time: "07 min", title: "APIs + Entities", copy: "Data model, API surface and important states." },
  { time: "10 min", title: "HLD", copy: "Core services, data stores, caches and async paths." },
  { time: "15 min", title: "Deep dive", copy: "Solve the 1–2 genuinely hard parts of the design." },
  { time: "05 min", title: "Failures + trade-offs", copy: "Recovery, consistency, bottlenecks and alternatives." },
];

const buildingBlocks = [
  {
    title: "API Gateway",
    icon: Network,
    copy: "Authentication, routing, TLS termination, quotas and edge rate limiting.",
    accent: "from-orange-500 to-orange-500",
  },
  {
    title: "Load Balancing",
    icon: Workflow,
    copy: "L4/L7 routing, health checks, horizontal scale and failure isolation.",
    accent: "from-orange-500 to-amber-500",
  },
  {
    title: "Redis",
    icon: Zap,
    copy: "Cache, counters, TTLs, geo indexes, sorted sets, dedupe keys and locks.",
    accent: "from-amber-500 to-amber-500",
  },
  {
    title: "Kafka",
    icon: RadioTower,
    copy: "Durable async backbone, replay, decoupling, partition ordering and burst absorption.",
    accent: "from-orange-500 to-orange-500",
  },
  {
    title: "CDC",
    icon: RefreshCcw,
    copy: "Stream database changes to search, caches and analytics without unsafe dual writes.",
    accent: "from-orange-500 to-orange-500",
  },
  {
    title: "Elasticsearch",
    icon: Search,
    copy: "Full-text search, faceting, autocomplete support and read-optimized search indexes.",
    accent: "from-orange-500 to-orange-500",
  },
  {
    title: "Object Store + CDN",
    icon: Cloud,
    copy: "Store large media blobs and deliver static/video content close to users.",
    accent: "from-orange-500 to-orange-500",
  },
  {
    title: "SQL Databases",
    icon: Database,
    copy: "Transactions, relational integrity, locking, indexes and strongly consistent workflows.",
    accent: "from-orange-500 to-amber-500",
  },
  {
    title: "NoSQL Databases",
    icon: HardDrive,
    copy: "Horizontal scale for key-based, write-heavy and extremely large access patterns.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    title: "Sharding",
    icon: GitBranch,
    copy: "Partition data by user, region, city, key-range or hash while controlling hot partitions.",
    accent: "from-orange-500 to-orange-500",
  },
  {
    title: "Replication",
    icon: Layers3,
    copy: "Read scale, redundancy, failover, RPO/RTO choices and sync vs async replicas.",
    accent: "from-orange-500 to-orange-500",
  },
  {
    title: "Rate Limiting",
    icon: Gauge,
    copy: "Token bucket, fixed/sliding windows, Redis atomicity and per-tenant policy enforcement.",
    accent: "from-orange-500 to-amber-500",
  },
  {
    title: "Distributed Coordination",
    icon: LockKeyhole,
    copy: "Leases, locks, compare-and-set, leader election and correctness under concurrency.",
    accent: "from-amber-500 to-orange-500",
  },
  {
    title: "Service Architecture",
    icon: Boxes,
    copy: "Service boundaries, synchronous RPC, asynchronous events and graceful degradation.",
    accent: "from-orange-500 to-orange-500",
  },
  {
    title: "Observability",
    icon: ServerCog,
    copy: "Logs, metrics, tracing, queue lag, error rate and latency SLOs for production systems.",
    accent: "from-orange-500 to-orange-500",
  },
  {
    title: "Security + Reliability",
    icon: ShieldCheck,
    copy: "AuthN/AuthZ, secrets, encryption, retries, circuit breakers and idempotent operations.",
    accent: "from-orange-500 to-orange-500",
  },
];

const deepDives = [
  {
    kicker: "URL SHORTENER",
    title: "Generate short codes without collisions",
    copy: "Compare hashing, counters, Snowflake IDs and a Key Generation Service, then reason about 301 vs 302, hot links and async click analytics.",
    chips: ["Base62", "KGS", "Negative cache", "Multi-region"],
  },
  {
    kicker: "MESSAGING",
    title: "Guarantee ordering without pretending exactly-once exists",
    copy: "Use per-conversation ordering, time-sortable IDs, persistent WebSockets, session routing and at-least-once delivery with idempotent dedupe.",
    chips: ["WebSocket", "ULID", "Fan-out", "Reconnect"],
  },
  {
    kicker: "UBER",
    title: "Match millions of moving drivers",
    copy: "Separate the GPS write firehose from the transactional trip store, use H3/geohash cells, rank by ETA and protect assignment with lock + CAS.",
    chips: ["H3", "Redis GEO", "ETA", "CAS"],
  },
  {
    kicker: "BOOKMYSHOW",
    title: "Prevent double booking under flash-sale traffic",
    copy: "Model inventory per show-seat, create temporary holds, keep payment outside long DB transactions and confirm atomically with idempotent state transitions.",
    chips: ["Seat hold", "TTL", "Saga", "Waiting room"],
  },
  {
    kicker: "PAYMENTS",
    title: "Make money movement auditable and replay-safe",
    copy: "Design idempotency keys, append-only ledger entries, verified webhooks, reconciliation and retry rules that never create duplicate charges.",
    chips: ["Ledger", "Webhook", "PSP", "Reconciliation"],
  },
  {
    kicker: "E-COMMERCE",
    title: "Keep browsing fast while inventory remains correct",
    copy: "Let catalog/search be cache-heavy and eventually consistent, but make checkout and stock reservation strongly consistent with sagas and atomic inventory updates.",
    chips: ["Inventory", "Search", "Saga", "Flash sale"],
  },
];

const toneStyles = {
  blue: {
    borderLight: "border-orange-200/80",
    borderDark: "border-orange-400/15",
    softLight: "bg-orange-50",
    softDark: "bg-orange-400/[0.07]",
    textLight: "text-orange-700",
    textDark: "text-orange-300",
    chipLight: "bg-orange-100 text-orange-700",
    chipDark: "bg-orange-400/10 text-orange-300",
    icon: "from-orange-600 to-orange-500",
    line: "from-orange-500 to-orange-400",
  },
  cyan: {
    borderLight: "border-orange-200/80",
    borderDark: "border-orange-400/15",
    softLight: "bg-orange-50",
    softDark: "bg-orange-400/[0.07]",
    textLight: "text-orange-700",
    textDark: "text-orange-300",
    chipLight: "bg-orange-100 text-orange-700",
    chipDark: "bg-orange-400/10 text-orange-300",
    icon: "from-orange-500 to-orange-500",
    line: "from-orange-500 to-orange-400",
  },
  indigo: {
    borderLight: "border-orange-200/80",
    borderDark: "border-orange-400/15",
    softLight: "bg-orange-50",
    softDark: "bg-orange-400/[0.07]",
    textLight: "text-orange-700",
    textDark: "text-orange-300",
    chipLight: "bg-orange-100 text-orange-700",
    chipDark: "bg-orange-400/10 text-orange-300",
    icon: "from-orange-600 to-amber-500",
    line: "from-orange-500 to-amber-400",
  },
  violet: {
    borderLight: "border-amber-200/80",
    borderDark: "border-amber-400/15",
    softLight: "bg-amber-50",
    softDark: "bg-amber-400/[0.07]",
    textLight: "text-amber-700",
    textDark: "text-amber-300",
    chipLight: "bg-amber-100 text-amber-700",
    chipDark: "bg-amber-400/10 text-amber-300",
    icon: "from-amber-600 to-amber-500",
    line: "from-amber-500 to-amber-400",
  },
  emerald: {
    borderLight: "border-orange-200/80",
    borderDark: "border-orange-400/15",
    softLight: "bg-orange-50",
    softDark: "bg-orange-400/[0.07]",
    textLight: "text-orange-700",
    textDark: "text-orange-300",
    chipLight: "bg-orange-100 text-orange-700",
    chipDark: "bg-orange-400/10 text-orange-300",
    icon: "from-orange-500 to-orange-500",
    line: "from-orange-500 to-orange-400",
  },
  amber: {
    borderLight: "border-amber-200/80",
    borderDark: "border-amber-400/15",
    softLight: "bg-amber-50",
    softDark: "bg-amber-400/[0.07]",
    textLight: "text-amber-700",
    textDark: "text-amber-300",
    chipLight: "bg-amber-100 text-amber-700",
    chipDark: "bg-amber-400/10 text-amber-300",
    icon: "from-amber-500 to-orange-500",
    line: "from-amber-500 to-orange-400",
  },
  rose: {
    borderLight: "border-orange-200/80",
    borderDark: "border-orange-400/15",
    softLight: "bg-orange-50",
    softDark: "bg-orange-400/[0.07]",
    textLight: "text-orange-700",
    textDark: "text-orange-300",
    chipLight: "bg-orange-100 text-orange-700",
    chipDark: "bg-orange-400/10 text-orange-300",
    icon: "from-orange-500 to-orange-500",
    line: "from-orange-500 to-orange-400",
  },
  sky: {
    borderLight: "border-orange-200/80",
    borderDark: "border-orange-400/15",
    softLight: "bg-orange-50",
    softDark: "bg-orange-400/[0.07]",
    textLight: "text-orange-700",
    textDark: "text-orange-300",
    chipLight: "bg-orange-100 text-orange-700",
    chipDark: "bg-orange-400/10 text-orange-300",
    icon: "from-orange-500 to-orange-500",
    line: "from-orange-500 to-orange-400",
  },
};

const getTone = (tone, isDarkMode) => {
  const styles = toneStyles[tone] || toneStyles.blue;
  return {
    border: isDarkMode ? styles.borderDark : styles.borderLight,
    soft: isDarkMode ? styles.softDark : styles.softLight,
    text: isDarkMode ? styles.textDark : styles.textLight,
    chip: isDarkMode ? styles.chipDark : styles.chipLight,
    icon: styles.icon,
    line: styles.line,
  };
};

const chapterCoverage = [
  {
    number: "01",
    tone: "blue",
    title: "Requirements before architecture",
    subtitle: "Clarify first. Draw later.",
    description:
      "Every case study starts by narrowing scope before choosing technology. The book separates user-facing features from the system qualities that change architecture.",
    bullets: [
      "Functional requirements and critical user flows",
      "Latency, availability, durability and consistency targets",
      "Scope boundaries: region, retention, media, payments, search and analytics",
      "Interviewer follow-ups and red flags before the diagram begins",
    ],
  },
  {
    number: "02",
    tone: "cyan",
    title: "Back-of-envelope estimation",
    subtitle: "Turn vague scale into concrete numbers.",
    description:
      "The handbook repeatedly estimates QPS, peak traffic, concurrent connections, storage, bandwidth and hot-set size so the architecture is tied to a scale assumption.",
    bullets: [
      "Average QPS versus realistic peak multipliers",
      "Read:write ratios and the hot path that deserves optimization",
      "Connection counts for WebSocket-heavy systems",
      "Storage growth, media volume and cache working-set estimates",
    ],
  },
  {
    number: "03",
    tone: "indigo",
    title: "Entities, APIs and state machines",
    subtitle: "Make the system contract explicit.",
    description:
      "Before adding infrastructure, each design defines the important entities, REST/WebSocket interfaces and state transitions that services must preserve.",
    bullets: [
      "REST, WebSocket, SSE and upload-control-plane APIs",
      "Idempotency keys on retryable operations",
      "Explicit lifecycle states for booking, trip, payment and job execution",
      "Version fields and compare-and-set for concurrent updates",
    ],
  },
  {
    number: "04",
    tone: "violet",
    title: "Databases from access patterns",
    subtitle: "SQL and NoSQL are choices, not slogans.",
    description:
      "The book chooses storage from correctness and access patterns: relational databases for transactional inventory and money, wide-column/KV stores for enormous key-based workloads.",
    bullets: [
      "PostgreSQL/MySQL for transactions and relational integrity",
      "Cassandra/DynamoDB for write-heavy or key-value scale",
      "Sharding by city, user, namespace, conversation or hash",
      "Replication, hot partitions, indexes and archival strategies",
    ],
  },
  {
    number: "05",
    tone: "emerald",
    title: "Caching, CDN and search",
    subtitle: "Keep expensive work off the request path.",
    description:
      "Redis, CDN and Elasticsearch appear only where they solve a concrete read path: hot links, product pages, catalog browse, geo state, autocomplete or full-text search.",
    bullets: [
      "Cache-aside, TTL, negative caching and local LRU layers",
      "CDN for static assets, images, video segments and hot reads",
      "Elasticsearch for full-text search, facets and autocomplete alternatives",
      "Hot-key protection, request coalescing and edge caching",
    ],
  },
  {
    number: "06",
    tone: "amber",
    title: "Kafka, queues and event-driven workflows",
    subtitle: "Move non-critical work out of the synchronous chain.",
    description:
      "Analytics, notifications, search indexing, asynchronous fan-out and recovery paths use durable queues so bursts do not turn into cascading failures.",
    bullets: [
      "Kafka partitions for ordering where the key matters",
      "Outbox/CDC to avoid unsafe database + event dual writes",
      "Consumer groups, retries, backoff and dead-letter handling",
      "Burst absorption for campaigns, flash sales and event pipelines",
    ],
  },
  {
    number: "07",
    tone: "rose",
    title: "Consistency, concurrency and idempotency",
    subtitle: "Correctness is a first-class architecture concern.",
    description:
      "The hardest systems in the book are hard because two things happen at once: two buyers pick one seat, two callbacks update one payment, or two workers execute one job.",
    bullets: [
      "Atomic claims, unique constraints and compare-and-set",
      "Redis locks as a fast gate with the database as source of truth",
      "At-least-once delivery plus idempotent dedupe",
      "Leases, fencing tokens, hold TTLs and compensating actions",
    ],
  },
  {
    number: "08",
    tone: "sky",
    title: "Failures, observability and security",
    subtitle: "A design is incomplete until the happy path breaks.",
    description:
      "Every case closes with failure handling and trade-offs: reconnect, retry, failover, degraded features, webhook verification, encryption and operational signals.",
    bullets: [
      "Timeouts, exponential backoff and circuit breakers",
      "Graceful degradation when recommendations or metadata fail",
      "Logs, metrics, tracing, queue lag and end-to-end latency",
      "TLS, tokenization, least privilege, signatures and audit trails",
    ],
  },
];

const scaleSnapshots = [
  {
    tone: "blue",
    system: "URL Shortener",
    number: "40k/s peak reads",
    detail: "100M new URLs/month with a 100:1 read:write ratio; the redirect path is the product.",
  },
  {
    tone: "indigo",
    system: "Messaging",
    number: "20B messages/day",
    detail: "500M DAU, roughly 230k messages/s average and around 100M concurrent connections at peak.",
  },
  {
    tone: "cyan",
    system: "Ride Hailing",
    number: "1.25M GPS writes/s",
    detail: "5M online drivers pinging every four seconds makes location ingestion far larger than trip creation traffic.",
  },
  {
    tone: "violet",
    system: "Netflix",
    number: "~500 Tbps",
    detail: "100M concurrent viewers at 5 Mbps shows why delivery must happen from an edge CDN instead of central data centers.",
  },
  {
    tone: "rose",
    system: "BookMyShow",
    number: "10–50k req/s",
    detail: "A single hot show can receive flash-sale traffic while the real problem is contention on a few hundred seat rows.",
  },
  {
    tone: "emerald",
    system: "Autocomplete",
    number: "~1.5M req/s peak",
    detail: "10B searches/day can generate many suggestion requests per query, so prefix serving must stay memory-first and cacheable.",
  },
  {
    tone: "amber",
    system: "Payments",
    number: "40M ledger rows/day",
    detail: "10M payments/day is not enormous traffic; correctness, auditability and immutable money movement are the difficult parts.",
  },
  {
    tone: "sky",
    system: "E-commerce",
    number: "100k+ views/s peak",
    detail: "100M DAU with sale traffic 100× baseline requires a different consistency model for browsing versus inventory checkout.",
  },
];

const architectureDecisions = [
  {
    tone: "violet",
    title: "SQL when correctness is the feature",
    use: "Seat inventory, orders, payments, trip state and other transactional workflows.",
    reason:
      "Transactions, unique constraints, row locks and compare-and-set make the database the final arbiter when a duplicate action would be incorrect.",
    examples: ["BookMyShow", "Payments", "E-commerce inventory", "Trips"],
  },
  {
    tone: "cyan",
    title: "NoSQL when the access path is enormous and simple",
    use: "Message histories, URL mappings, high-volume time-series or key-based data.",
    reason:
      "Partition-key access, horizontal scale and write throughput matter more than joins or multi-row transactions.",
    examples: ["WhatsApp messages", "URL mappings", "Event trails"],
  },
  {
    tone: "emerald",
    title: "Redis for hot or ephemeral state",
    use: "Caches, rate-limit counters, presence, geo sets, locks, hold gates and dedupe keys.",
    reason:
      "The book uses Redis when losing/rebuilding a hot copy is acceptable or when atomic in-memory operations remove pressure from the primary store.",
    examples: ["Presence", "Seat holds", "Driver geo", "Rate limiting"],
  },
  {
    tone: "amber",
    title: "Kafka when the caller should not wait",
    use: "Analytics, click events, notifications, index updates, fan-out and asynchronous workflows.",
    reason:
      "A durable log absorbs bursts, decouples producers from consumers and allows replay after consumer failure.",
    examples: ["Click analytics", "Booking events", "Search indexing", "Notifications"],
  },
  {
    tone: "blue",
    title: "CDN + object storage for large immutable bytes",
    use: "Images, file blocks, video renditions, manifests, static assets and downloadable media.",
    reason:
      "Application servers should move metadata and authorization, not repeatedly stream petabytes of immutable content.",
    examples: ["YouTube", "Netflix", "Instagram", "Dropbox"],
  },
  {
    tone: "rose",
    title: "Strong consistency only where a wrong answer costs more",
    use: "Money, seat ownership, stock decrement and one-driver/one-trip assignment.",
    reason:
      "Catalogs, feeds and search indexes can tolerate eventual consistency; inventory and money cannot tolerate two successful owners.",
    examples: ["Payments", "Booking", "Inventory", "Dispatch"],
  },
];

const tradeoffCards = [
  {
    tone: "blue",
    title: "301 vs 302 redirect",
    left: "301: browsers cache aggressively and origin traffic drops.",
    right: "302: the service stays in the path, preserving control and click analytics.",
    takeaway: "Choose based on product behavior, not HTTP trivia.",
  },
  {
    tone: "indigo",
    title: "Fan-out on write vs fan-out on read",
    left: "Write-time fan-out makes ordinary feed reads fast.",
    right: "Read-time fan-out avoids exploding work for celebrity or huge-channel publishers.",
    takeaway: "Hybrid designs are often more realistic than one global rule.",
  },
  {
    tone: "cyan",
    title: "Distance vs ETA for driver matching",
    left: "Straight-line distance is cheap but does not model roads or traffic.",
    right: "ETA ranking is costlier but aligns with the rider experience.",
    takeaway: "A coarse geo index narrows candidates before an expensive ranker.",
  },
  {
    tone: "rose",
    title: "Availability vs correctness",
    left: "Browse/catalog/search can stay available with stale data.",
    right: "Booking, inventory and payment paths may reject/delay rather than accept conflicting state.",
    takeaway: "Use different consistency guarantees inside the same product.",
  },
  {
    tone: "amber",
    title: "Exactly-once vs idempotent at-least-once",
    left: "Networks, retries and worker crashes make true end-to-end exactly-once unrealistic.",
    right: "Stable IDs, unique keys and dedupe make repeated delivery produce one logical effect.",
    takeaway: "Design for retries instead of assuming they will not happen.",
  },
  {
    tone: "violet",
    title: "Pull CDN vs pre-positioning",
    left: "UGC systems often pull new content into caches when demand appears.",
    right: "A small predictable catalog can be pushed to edge locations during off-peak periods.",
    takeaway: "Netflix and YouTube have different content economics even though both stream video.",
  },
];

const caseStudySpotlights = [
  {
    tone: "blue",
    caseNo: "01",
    title: "URL Shortener",
    subtitle: "Read-heavy systems and cache-first thinking",
    scale: "100M new URLs/month • 100:1 read:write • ~40k/s peak reads",
    hardPart: "Generate short codes safely and keep redirect p99 extremely low.",
    flow: [
      "Client creates URL through API Gateway",
      "Create Service validates and gets a key from KGS",
      "Mapping is written with an atomic uniqueness condition",
      "Redirect checks local cache → Redis → primary KV store",
      "Click event goes asynchronously to Kafka and analytics",
    ],
    concepts: ["Base62", "KGS", "Redis", "DynamoDB/Cassandra", "Kafka", "Negative cache"],
    failures: [
      "Hot viral links are protected with CDN/local cache/Redis replicas.",
      "Expired links are checked lazily and removed with TTL/background cleanup.",
      "Analytics never blocks the redirect response.",
    ],
  },
  {
    tone: "indigo",
    caseNo: "02",
    title: "WhatsApp / Messaging",
    subtitle: "Connections, ordering and offline delivery",
    scale: "500M DAU • 20B msgs/day • ~100M concurrent connections",
    hardPart: "Route a message to the correct live connection while preserving conversation ordering and retry safety.",
    flow: [
      "Device holds a WebSocket to a chat server",
      "Session registry maps user/device → chat server",
      "Message is persisted before sender receives SENT acknowledgement",
      "Online recipients receive through routed server-to-server delivery",
      "Offline recipients use store-and-forward plus push notification",
    ],
    concepts: ["WebSocket", "Session registry", "ULID/Snowflake", "Cassandra", "Fan-out", "Idempotency"],
    failures: [
      "A dead chat server only loses connections, not persisted messages.",
      "Reconnect drains missing messages from the last acknowledged point.",
      "At-least-once delivery becomes effectively once to the user through dedupe.",
    ],
  },
  {
    tone: "cyan",
    caseNo: "03",
    title: "Uber / Ride Hailing",
    subtitle: "Geo indexing and atomic driver assignment",
    scale: "5M online drivers • ~1.25M location writes/s • 20M rides/day",
    hardPart: "The location firehose is enormous, but one driver must still never be committed to two rides.",
    flow: [
      "Driver pings update ephemeral geo state",
      "Dispatch queries H3/geohash cells around pickup",
      "Candidates are filtered and ranked by ETA",
      "Fast lock protects the offer window",
      "Database compare-and-set commits the winning driver/trip transition",
    ],
    concepts: ["H3", "Redis GEO", "ETA", "CAS", "State machine", "Kafka"],
    failures: [
      "Driver TTL removes stale locations after network loss.",
      "Requested trips can be re-enqueued if dispatch crashes.",
      "City-based partitioning limits blast radius and keeps matching local.",
    ],
  },
  {
    tone: "rose",
    caseNo: "10",
    title: "Ticket Booking / BookMyShow",
    subtitle: "No double booking under flash traffic",
    scale: "500k users at launch • 10–50k req/s on a hot show • ~300 seats/show",
    hardPart: "The challenge is not table size; it is thousands of users competing for the same few rows.",
    flow: [
      "Browse traffic is cached heavily",
      "Booking request creates a temporary seat hold",
      "Inventory DB is the source of truth for AVAILABLE/HELD/BOOKED",
      "Payment happens outside a long database transaction",
      "Webhook confirms seats or timeout worker releases the hold",
    ],
    concepts: ["Seat hold", "TTL", "SQL", "Unique constraint", "Saga", "Waiting room"],
    failures: [
      "Unique constraints remain the last-line safety net.",
      "Late/duplicate payment callbacks are processed idempotently.",
      "Virtual waiting room and rate limits protect a blockbuster release.",
    ],
  },
  {
    tone: "amber",
    caseNo: "15",
    title: "Distributed Job Scheduler",
    subtitle: "Leases, retries and effectively-once execution",
    scale: "Large scheduled workloads • recurring jobs • bursty cron boundaries",
    hardPart: "Find due jobs efficiently and prevent two schedulers/workers from producing duplicate logical execution.",
    flow: [
      "DB keeps durable schedule and next_run_time",
      "Scheduler owns shards using a lease",
      "Lookahead/timing wheel moves due work into a queue",
      "Worker lease + fencing token protects execution ownership",
      "Idempotent handler makes retry safe",
    ],
    concepts: ["Timing wheel", "Lease", "Fencing token", "SKIP LOCKED", "Idempotency", "Misfire policy"],
    failures: [
      "Scheduler ownership transfers after lease expiry.",
      "Outbox retains unpublished runs during queue outages.",
      "Jitter avoids a midnight or top-of-hour thundering herd.",
    ],
  },
  {
    tone: "emerald",
    caseNo: "16",
    title: "Search Autocomplete",
    subtitle: "Top-K prefix serving at massive QPS",
    scale: "100M DAU • 10B queries/day • up to ~1.5M suggestion req/s peak",
    hardPart: "Return top suggestions in tens of milliseconds without running a database LIKE query on every keystroke.",
    flow: [
      "Client debounces keystrokes and checks local cache",
      "CDN/edge caches popular prefix responses",
      "Suggest service routes to the correct in-memory trie/FST shard",
      "Offline batch rebuild computes top-K results",
      "Streaming overlay adds fresh trending signals",
    ],
    concepts: ["Trie/FST", "Top-K", "CDN", "Sharding", "Spark/Flink", "Trending overlay"],
    failures: [
      "Hot prefixes are spread through cache layers.",
      "Blue/green index swap avoids partially loaded serving state.",
      "Eventual consistency is acceptable for ranking freshness.",
    ],
  },
  {
    tone: "violet",
    caseNo: "18",
    title: "Payment System",
    subtitle: "Correctness, auditability and unknown outcomes",
    scale: "10M tx/day • 1–5k/s sale peaks • ~40M ledger rows/day",
    hardPart: "A timeout does not mean failure. The system must discover the truth without charging twice.",
    flow: [
      "Idempotency layer claims one logical payment operation",
      "Payment state machine calls a selected PSP connector",
      "Ledger posts immutable double-entry movements",
      "Outbox/CDC emits events after database commit",
      "Webhooks + polling + reconciliation resolve asynchronous or unknown outcomes",
    ],
    concepts: ["Idempotency", "Double-entry ledger", "Outbox", "Webhook", "Reconciliation", "Tokenization"],
    failures: [
      "Unknown PSP response remains pending until definitive status is known.",
      "Webhook signatures are verified and event IDs are deduplicated.",
      "Reconciliation compares internal ledger, PSP report and bank statement.",
    ],
  },
  {
    tone: "sky",
    caseNo: "19",
    title: "E-commerce Platform",
    subtitle: "Fast browse path, correct inventory path",
    scale: "100M DAU • 100× sale traffic • 100k+ product views/s peak",
    hardPart: "Search/catalog can be eventually consistent while inventory reservation and order state must not oversell.",
    flow: [
      "CDN/Redis serve product and catalog reads",
      "CDC updates Elasticsearch without dual writes",
      "Checkout orchestrator reserves stock before finalizing order",
      "Payment and inventory transitions are coordinated as a saga",
      "Kafka drives fulfillment, notification, analytics and downstream indexing",
    ],
    concepts: ["Inventory reservation", "CDC", "Elasticsearch", "Saga", "Kafka", "Flash-sale gate"],
    failures: [
      "Cart never silently becomes the stock source of truth.",
      "Compensation releases inventory after payment/order failure.",
      "Waiting room and stock gate prevent the database from absorbing the entire sale spike.",
    ],
  },
];

const productionPatterns = [
  {
    tone: "blue",
    title: "Cache only what can be rebuilt",
    copy: "Redis is used as a hot copy or ephemeral state in many designs; the primary database still owns durable truth where correctness matters.",
  },
  {
    tone: "cyan",
    title: "Partition by the unit that moves together",
    copy: "Conversation, city, namespace, user or region keys keep related traffic local and make horizontal scaling predictable.",
  },
  {
    tone: "indigo",
    title: "Order only what must be ordered",
    copy: "Kafka partition keys, per-conversation IDs and version checks provide local ordering without imposing a global serialization bottleneck.",
  },
  {
    tone: "violet",
    title: "Use state machines for multi-step workflows",
    copy: "Trips, payments, bookings, orders and jobs are easier to reason about when transitions and terminal states are explicit.",
  },
  {
    tone: "rose",
    title: "Expect duplicate delivery",
    copy: "Stable request IDs, unique constraints and dedupe tables are safer than assuming a client, queue or webhook will execute once.",
  },
  {
    tone: "amber",
    title: "Keep analytics off the critical path",
    copy: "Click events, search logs, delivery metrics and product analytics are emitted asynchronously so the core user response is not held hostage.",
  },
  {
    tone: "emerald",
    title: "Use TTL for ephemeral ownership",
    copy: "Presence, seat holds, driver availability, leases and temporary dedupe keys naturally expire when their owner disappears.",
  },
  {
    tone: "sky",
    title: "Back-pressure before the database",
    copy: "Rate limits, queues and virtual waiting rooms absorb spikes before hot rows and downstream providers become the bottleneck.",
  },
  {
    tone: "blue",
    title: "Outbox/CDC beats dual writes",
    copy: "Write business state and an outbox record in one transaction, then publish later; this prevents DB-success/Kafka-failure inconsistency.",
  },
  {
    tone: "indigo",
    title: "Degrade optional features first",
    copy: "Playback, checkout or messaging should survive when recommendations, analytics or secondary indexes are unavailable.",
  },
  {
    tone: "rose",
    title: "Locks are not the final truth",
    copy: "A Redis lock can reduce contention, but a durable compare-and-set or unique database constraint still protects correctness after lock loss.",
  },
  {
    tone: "violet",
    title: "Reconciliation is an architecture component",
    copy: "For payments and other externally coordinated systems, a later audit loop catches state drift that online requests cannot perfectly eliminate.",
  },
];

const audience = [
  {
    title: "SDE-1 → SDE-2",
    copy: "Move from knowing components individually to explaining how they work together under load and failure.",
  },
  {
    title: "Backend Engineers",
    copy: "Practice the architecture choices behind APIs, databases, caches, queues, storage and distributed workflows.",
  },
  {
    title: "Interview Preparation",
    copy: "Use one repeatable 45-minute structure instead of memorizing disconnected diagrams for every company question.",
  },
  {
    title: "Revision Before Interviews",
    copy: "Case-study cards and consistent sections make it easier to revisit one design quickly before a system-design round.",
  },
];

const faqs = [
  {
    q: "What is High-Level Design (HLD) in a system design interview?",
    a: "HLD is the architecture-level part of a system design round: you clarify requirements, estimate scale, define APIs and entities, choose databases, caches and queues, draw the end-to-end architecture and then defend the trade-offs and failure handling. This book teaches that flow with 19 worked case studies.",
  },
  {
    q: "What is the difference between HLD and LLD?",
    a: "HLD answers how a whole system scales: services, data stores, caching, messaging and consistency. LLD answers how one component is built: classes, interfaces, SOLID principles and design patterns. This page covers HLD; the Java-first LLD handbook and an HLD + LLD bundle are linked on this page.",
  },
  {
    q: "Is this book only for experienced engineers?",
    a: "No. The page starts from the interview method and core building blocks, then moves into complete case studies. It is especially useful when you already know basic backend development but want a structured HLD approach.",
  },
  {
    q: "How are the 19 case studies structured?",
    a: "Each case follows the same sequence: interview prompt, clarifying questions, functional and non-functional requirements, estimation, interviewer expectations, entities, APIs, database design, HLD, request flows, algorithms/deep dives, trade-offs and failures.",
  },
  {
    q: "Does it cover Redis, Kafka, sharding and distributed systems?",
    a: "Yes. The case studies repeatedly use API gateways, load balancers, Redis, Kafka, CDC, Elasticsearch, object storage/CDNs, SQL/NoSQL choices, sharding, replication, locks, retries, idempotency and observability in context.",
  },
  {
    q: "Does the book include BookMyShow-style concurrency problems?",
    a: "Yes. The ticket-booking case focuses on seat inventory, temporary holds, locking/transactions, payment state transitions, timeout release and flash-sale traffic.",
  },
  {
    q: "Can I preview the book before buying?",
    a: "Yes. The preview PDF is rendered page-by-page into normal image elements, so visitors see every preview page directly in the website without a PDF toolbar or nested scroller.",
  },
  {
    q: "Is this a physical book?",
    a: "No. This is a digital PDF ebook.",
  },
  {
    q: "Is the digital purchase refundable?",
    a: "No. Digital ebook purchases are non-refundable after successful payment.",
  },
  {
    q: "How can I contact support?",
    a: "Email supporttargettrek@gmail.com for purchase or ebook support.",
  },
];

function SectionHeader({ eyebrow, title, description, align = "left", dark = false, id }) {
  return (
    <Reveal className={cx(align === "center" && "mx-auto max-w-3xl text-center")}>
      <p
        className={cx(
          "text-xs font-extrabold uppercase tracking-[0.2em] sm:text-sm",
          dark ? "text-orange-300" : "text-orange-600"
        )}
      >
        {eyebrow}
      </p>
      <h2
        id={id}
        className={cx(
          "hld-display mt-3 text-3xl font-extrabold leading-[1.08] tracking-[-0.035em] sm:text-4xl lg:text-[3.15rem]",
          dark ? "text-white" : "text-slate-950"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cx(
            "mt-4 text-base leading-7 sm:text-lg sm:leading-8",
            dark ? "text-slate-300" : "text-slate-600"
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

/* ------------------------------------------------------------------ */
/*  Animation + conversion building blocks (framer-motion)             */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1];

const ctaPrimary =
  "hld-shimmer group relative inline-flex min-h-[48px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-3 text-sm font-extrabold text-white shadow-xl shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-orange-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-60";

const NAV_LINKS = [
  ["#book-preview", "Free preview"],
  ["#what-is-hld", "What is HLD"],
  ["#framework", "Framework"],
  ["#request-flow", "Request flow"],
  ["#playbook", "45-min plan"],
  ["#estimator", "Estimator"],
  ["#case-studies", "19 case studies"],
  ["#spotlights", "Deep dives"],
  ["#offer", "What you get"],
  ["#faq", "FAQ"],
];

const rotatingPrompts = [
  "a URL Shortener",
  "WhatsApp",
  "Uber",
  "BookMyShow",
  "a Payment System",
  "Netflix",
  "a Rate Limiter",
  "a Web Crawler",
];

const marqueeTerms = [
  "Redis",
  "Kafka",
  "Sharding",
  "Replication",
  "CDN",
  "Load Balancing",
  "Elasticsearch",
  "CDC",
  "Rate Limiting",
  "Idempotency",
  "Saga",
  "WebSockets",
  "Bloom Filter",
  "API Gateway",
  "Leader Election",
  "Outbox Pattern",
];

const painPoints = [
  {
    before: "Memorising one diagram per company",
    after: "One 9-step method that works on any prompt",
  },
  {
    before: "Jumping to Kafka and Redis in the first minute",
    after: "Requirements, estimates and APIs first — components second",
  },
  {
    before: "Saying “it scales” without any numbers",
    after: "QPS, storage and bandwidth tied to every design decision",
  },
  {
    before: "Going blank on “what if this component fails?”",
    after: "Failure handling and trade-offs close every case study",
  },
];

const hldVsLld = [
  ["Focus", "Architecture of the whole system", "Class-level design inside one service"],
  ["Core question", "How does it scale to millions of users?", "How do I model objects and relationships?"],
  ["Artifacts", "Components, APIs, data stores, queues", "Classes, interfaces, patterns, working code"],
  ["You decide", "SQL vs NoSQL, caching, sharding, consistency", "SOLID, design patterns, extensibility, concurrency"],
];

const valueStack = [
  { icon: FileText, title: "Digital PDF ebook", copy: "Read on laptop, tablet or phone — revise anywhere." },
  { icon: Target, title: "19 interview case studies", copy: "URL shortener to payments, each in the same 9-step structure." },
  { icon: Timer, title: "45-minute interview playbook", copy: "A minute-by-minute plan for the real round." },
  { icon: Boxes, title: "16 core building-block primers", copy: "Redis, Kafka, CDC, sharding and more — tied to the problem they solve." },
  { icon: TrendingUp, title: "Back-of-envelope numbers", copy: "Concrete QPS, storage and bandwidth estimates for every system." },
  { icon: ShieldCheck, title: "Failures + trade-offs", copy: "What breaks, how you recover and what each choice costs." },
];

const flowStages = [
  {
    id: "client",
    label: "Client",
    icon: Globe,
    copy: "Web or mobile app sends the request. Retries are only safe when the API is idempotent — so every write carries a stable request ID.",
  },
  {
    id: "edge",
    label: "CDN + Gateway",
    icon: Network,
    copy: "The CDN answers static and hot reads at the edge. The API gateway handles authentication, quotas, rate limits and routing.",
  },
  {
    id: "service",
    label: "Services",
    icon: Boxes,
    copy: "Stateless services scale horizontally behind a load balancer. Optional features degrade first when a dependency is slow.",
  },
  {
    id: "cache",
    label: "Redis cache",
    icon: Zap,
    copy: "Cache-aside: a hit returns in about a millisecond, a miss falls through to the database. TTLs and negative caching protect the store.",
  },
  {
    id: "db",
    label: "SQL / NoSQL",
    icon: Database,
    copy: "The source of truth. SQL for transactions and unique constraints; NoSQL for enormous key-based access — chosen from the access pattern.",
  },
  {
    id: "queue",
    label: "Kafka + workers",
    icon: RadioTower,
    copy: "Analytics, notifications and search indexing leave the request path through a durable log, so bursts never block the user.",
  },
];

const CASE_CATEGORY = {
  "01": "Infrastructure",
  "02": "Real-time & Social",
  "03": "Marketplace & Payments",
  "04": "Real-time & Social",
  "05": "Media & Storage",
  "06": "Media & Storage",
  "07": "Real-time & Social",
  "08": "Media & Storage",
  "09": "Media & Storage",
  "10": "Marketplace & Payments",
  "11": "Marketplace & Payments",
  "12": "Infrastructure",
  "13": "Infrastructure",
  "14": "Real-time & Social",
  "15": "Infrastructure",
  "16": "Infrastructure",
  "17": "Infrastructure",
  "18": "Marketplace & Payments",
  "19": "Marketplace & Payments",
};

const caseFilters = [
  "All",
  "Real-time & Social",
  "Media & Storage",
  "Marketplace & Payments",
  "Infrastructure",
];

const fmtCompact = (value) =>
  new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.max(0, value));

const fmtStorage = (gigabytes) => {
  if (gigabytes >= 1e6) return `${(gigabytes / 1e6).toFixed(1)} PB`;
  if (gigabytes >= 1e3) return `${(gigabytes / 1e3).toFixed(1)} TB`;
  return `${gigabytes.toFixed(1)} GB`;
};

function Reveal({ children, delay = 0, y = 26, className, as = "div", ...rest }) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Plain = as;
    return (
      <Plain className={className} {...rest}>
        {children}
      </Plain>
    );
  }

  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function CountUp({ to, suffix = "", duration = 1.4 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduce) {
      setValue(to);
      return undefined;
    }
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[95] h-[3px] origin-left bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"
      style={{ scaleX }}
    />
  );
}

function TiltBook({ children }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 150, damping: 18 });

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    mx.set((event.clientX - rect.left) / rect.width - 0.5);
    my.set((event.clientY - rect.top) / rect.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  if (reduce) return <div>{children}</div>;

  return (
    <div style={{ perspective: 1000 }} onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

function RotatingPrompt({ isDarkMode }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return undefined;
    const id = window.setInterval(
      () => setIndex((current) => (current + 1) % rotatingPrompts.length),
      2200
    );
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <p
      className={cx(
        "mt-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border px-3.5 py-2 text-sm font-bold shadow-sm",
        isDarkMode
          ? "border-white/10 bg-white/[0.04] text-slate-300"
          : "border-orange-200 bg-white/80 text-stone-700"
      )}
    >
      <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-orange-500">
        Today’s interview prompt
      </span>
      <span aria-live="off">
        “Design{" "}
        <span className="relative inline-flex h-[1.5em] min-w-[10.5ch] overflow-hidden align-bottom">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={rotatingPrompts[index]}
              initial={reduce ? false : { y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="whitespace-nowrap font-extrabold text-orange-500"
            >
              {rotatingPrompts[index]}
            </motion.span>
          </AnimatePresence>
        </span>
        ”
      </span>
    </p>
  );
}

function RequestFlowDemo({ isDarkMode }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto || reduce) return undefined;
    const id = window.setInterval(
      () => setActive((current) => (current + 1) % flowStages.length),
      2600
    );
    return () => window.clearInterval(id);
  }, [auto, reduce]);

  const stage = flowStages[active];

  return (
    <div
      className={cx(
        "mt-10 rounded-[28px] border p-4 shadow-sm sm:p-7",
        isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-orange-100 bg-white"
      )}
    >
      <div className="flex flex-col items-stretch lg:flex-row lg:items-center">
        {flowStages.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === active;
          return (
            <React.Fragment key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setActive(index);
                  setAuto(false);
                }}
                onMouseEnter={() => setAuto(false)}
                aria-pressed={isActive}
                className={cx(
                  "group flex shrink-0 items-center gap-3 rounded-2xl border px-4 py-3 text-left transition duration-300 lg:flex-col lg:gap-2 lg:px-3 lg:py-4 lg:text-center",
                  isActive
                    ? "scale-[1.03] border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/15"
                    : isDarkMode
                    ? "border-white/10 bg-white/[0.03] hover:border-orange-400/40"
                    : "border-slate-200 bg-slate-50/60 hover:border-orange-300"
                )}
              >
                <span
                  className={cx(
                    "flex h-10 w-10 items-center justify-center rounded-xl transition",
                    isActive
                      ? "bg-gradient-to-br from-orange-600 to-amber-500 text-white"
                      : isDarkMode
                      ? "bg-white/10 text-slate-300"
                      : "bg-white text-orange-600 ring-1 ring-orange-100"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-extrabold lg:text-xs">{item.label}</span>
              </button>
              {index < flowStages.length - 1 && (
                <span
                  aria-hidden="true"
                  className="hld-conn"
                  style={{ animationDelay: `${index * 0.35}s` }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div
        className={cx(
          "mt-6 min-h-[88px] rounded-2xl border p-4 sm:p-5",
          isDarkMode ? "border-white/10 bg-black/20" : "border-orange-100 bg-[#fffaf5]"
        )}
        aria-live="polite"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-500">
              Step {active + 1} · {stage.label}
            </p>
            <p className={cx("mt-2 text-sm leading-7 sm:text-base", isDarkMode ? "text-slate-300" : "text-slate-700")}>
              {stage.copy}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      <p className={cx("mt-3 text-center text-xs font-semibold", isDarkMode ? "text-slate-500" : "text-slate-500")}>
        Tap any stage to pause the animation. Every case study in the book walks this path for its own system.
      </p>
    </div>
  );
}

function EstimatorDemo({ isDarkMode, onBuy, canBuy }) {
  const [dau, setDau] = useState(50);
  const [actions, setActions] = useState(10);
  const [peak, setPeak] = useState(3);
  const [ratio, setRatio] = useState(10);
  const [bytes, setBytes] = useState(500);

  const totalPerDay = dau * 1e6 * actions;
  const avgQps = totalPerDay / 86400;
  const peakQps = avgQps * peak;
  const peakWrites = peakQps / (ratio + 1);
  const peakReads = peakQps - peakWrites;
  const storagePerDayGb = ((totalPerDay / (ratio + 1)) * bytes) / 1e9;
  const storageFiveYearGb = storagePerDayGb * 365 * 5;

  const insight =
    ratio >= 20
      ? "Extremely read-heavy: put a CDN/Redis cache in front, keep the redirect or read path tiny and push analytics to a queue."
      : ratio >= 5
      ? "Read-heavy: cache-aside with Redis, read replicas and a cache-hit target above 90% will carry most traffic."
      : ratio >= 2
      ? "Balanced: partition by a good key, batch writes and watch replication lag."
      : "Write-heavy: favour an append-friendly store (LSM / wide-column), partition aggressively and absorb bursts with Kafka.";

  const sliders = [
    { id: "est-dau", label: "Daily active users", value: dau, set: setDau, min: 1, max: 500, step: 1, text: `${dau}M` },
    { id: "est-actions", label: "Requests per user / day", value: actions, set: setActions, min: 1, max: 100, step: 1, text: String(actions) },
    { id: "est-peak", label: "Peak-to-average multiplier", value: peak, set: setPeak, min: 1, max: 10, step: 1, text: `${peak}×` },
    { id: "est-ratio", label: "Read : write ratio", value: ratio, set: setRatio, min: 1, max: 100, step: 1, text: `${ratio}:1` },
    { id: "est-bytes", label: "Bytes per stored record", value: bytes, set: setBytes, min: 100, max: 5000, step: 100, text: `${bytes} B` },
  ];

  const results = [
    ["Average QPS", fmtCompact(avgQps)],
    ["Peak QPS", fmtCompact(peakQps)],
    ["Peak reads / s", fmtCompact(peakReads)],
    ["Peak writes / s", fmtCompact(peakWrites)],
    ["New storage / day", fmtStorage(storagePerDayGb)],
    ["Storage over 5 years", fmtStorage(storageFiveYearGb)],
  ];

  return (
    <div className="mt-10 grid gap-5 lg:grid-cols-[1fr_1.05fr]">
      <Reveal
        className={cx(
          "rounded-[28px] border p-5 sm:p-7",
          isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white"
        )}
      >
        <div className="space-y-5">
          {sliders.map((item) => (
            <div key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={item.id} className="text-sm font-bold">
                  {item.label}
                </label>
                <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-extrabold text-orange-500">
                  {item.text}
                </span>
              </div>
              <input
                id={item.id}
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={item.value}
                onChange={(event) => item.set(Number(event.target.value))}
                className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-orange-500/20 accent-orange-500"
              />
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal
        delay={0.1}
        className={cx(
          "flex flex-col rounded-[28px] border p-5 sm:p-7",
          isDarkMode ? "border-orange-400/20 bg-orange-400/[0.05]" : "border-orange-200 bg-[#fff7ed]"
        )}
      >
        <div className="grid grid-cols-2 gap-3">
          {results.map(([label, value]) => (
            <div
              key={label}
              className={cx(
                "rounded-2xl border p-4",
                isDarkMode ? "border-white/10 bg-black/20" : "border-orange-100 bg-white"
              )}
            >
              <p className={cx("text-[11px] font-extrabold uppercase tracking-[0.12em]", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                {label}
              </p>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={value}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="mt-1 text-2xl font-extrabold tracking-tight text-orange-500"
                >
                  {value}
                </motion.p>
              </AnimatePresence>
            </div>
          ))}
        </div>

        <p className={cx("mt-5 rounded-2xl p-4 text-sm font-semibold leading-6", isDarkMode ? "bg-white/5 text-slate-300" : "bg-white text-slate-700")}>
          <span className="font-extrabold text-orange-500">Design hint: </span>
          {insight}
        </p>

        <div className="mt-auto pt-5">
          <p className={cx("text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>
            The book runs this exact estimation for URL shortener, messaging, ride-hailing, video, payments and 13 more systems.
          </p>
          <button type="button" onClick={onBuy} disabled={!canBuy} className={cx(ctaPrimary, "mt-4 w-full")}>
            See all 19 worked estimates
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </button>
        </div>
      </Reveal>
    </div>
  );
}

function CaseExplorer({ isDarkMode }) {
  const [filter, setFilter] = useState("All");
  const reduce = useReducedMotion();
  const palette = ["blue", "indigo", "cyan", "violet", "emerald", "sky", "rose", "amber"];

  const items = caseStudies.map((item, index) => ({
    ...item,
    category: CASE_CATEGORY[item.number],
    toneKey: palette[index % palette.length],
  }));
  const visible = filter === "All" ? items : items.filter((item) => item.category === filter);

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter case studies">
        {caseFilters.map((name) => {
          const selected = filter === name;
          const count = name === "All" ? items.length : items.filter((item) => item.category === name).length;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(name)}
              className={cx(
                "rounded-full border px-4 py-2 text-xs font-extrabold transition sm:text-sm",
                selected
                  ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : isDarkMode
                  ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-orange-400/50"
                  : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
              )}
            >
              {name} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <motion.div layout={!reduce} className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((item) => {
            const tone = getTone(item.toneKey, isDarkMode);
            return (
              <motion.article
                key={item.number}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={cx(
                  "group relative overflow-hidden rounded-[26px] border p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl",
                  tone.border,
                  isDarkMode ? "bg-white/[0.025]" : "bg-white"
                )}
              >
                <div className={cx("absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-90", tone.line)} />
                <div className="flex items-center justify-between gap-4">
                  <span className={cx("text-sm font-extrabold tracking-[0.18em]", tone.text)}>CASE {item.number}</span>
                  <div className={cx("flex h-9 w-9 items-center justify-center rounded-xl transition group-hover:rotate-6 group-hover:scale-110", tone.chip)}>
                    <Code2 className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="mt-5 text-2xl font-extrabold tracking-[-0.025em]">Design {item.title}</h3>
                <p className={cx("mt-1 text-sm font-semibold", tone.text)}>{item.subtitle}</p>
                <p className={cx("mt-4 text-sm leading-6", isDarkMode ? "text-slate-400" : "text-slate-600")}>{item.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className={cx("rounded-full px-3 py-1.5 text-xs font-semibold", tone.chip)}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

function SpotlightViewer({ isDarkMode }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const item = caseStudySpotlights[index];
  const tone = getTone(item.tone, isDarkMode);

  return (
    <div className="mt-10">
      <div
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
        role="tablist"
        aria-label="Case study deep dives"
      >
        {caseStudySpotlights.map((spot, spotIndex) => {
          const selected = spotIndex === index;
          return (
            <button
              key={spot.caseNo}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setIndex(spotIndex)}
              className={cx(
                "shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold transition sm:text-sm",
                selected
                  ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : isDarkMode
                  ? "border-white/10 bg-white/[0.04] text-slate-300 hover:border-orange-400/50"
                  : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
              )}
            >
              {spot.title}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={item.caseNo}
          role="tabpanel"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: EASE }}
          className={cx("mt-5 overflow-hidden rounded-[30px] border", tone.border, isDarkMode ? "bg-white/[0.025]" : "bg-white")}
        >
          <div className={cx("h-1.5 bg-gradient-to-r", tone.line)} />
          <div className="grid gap-7 p-6 lg:grid-cols-[.8fr_1.2fr] lg:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={cx("rounded-full px-3 py-1 text-xs font-extrabold tracking-[0.15em]", tone.chip)}>CASE {item.caseNo}</span>
                <span className={cx("text-xs font-semibold uppercase tracking-[0.12em]", tone.text)}>{item.subtitle}</span>
              </div>
              <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">Design {item.title}</h3>
              <p className={cx("mt-4 text-sm font-semibold leading-6", tone.text)}>{item.scale}</p>
              <div className={cx("mt-5 rounded-2xl border p-4", tone.border, tone.soft)}>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em]">Hard part</p>
                <p className={cx("mt-2 text-sm leading-6", isDarkMode ? "text-slate-300" : "text-slate-700")}>{item.hardPart}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.concepts.map((concept) => (
                  <span key={concept} className={cx("rounded-full px-3 py-1.5 text-xs font-semibold", tone.chip)}>{concept}</span>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className={cx("rounded-[24px] border p-5", tone.border, isDarkMode ? "bg-black/10" : "bg-slate-50/70")}>
                <p className={cx("text-xs font-extrabold uppercase tracking-[0.16em]", tone.text)}>Request / state flow</p>
                <ol className="relative mt-4 space-y-3">
                  {item.flow.map((step, stepIndex) => (
                    <motion.li
                      key={step}
                      initial={reduce ? false : { opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + stepIndex * 0.09, duration: 0.35 }}
                      className="flex items-start gap-3"
                    >
                      <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold", tone.chip)}>{stepIndex + 1}</span>
                      <span className={cx("text-sm leading-6", isDarkMode ? "text-slate-300" : "text-slate-700")}>{step}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>

              <div className={cx("rounded-[24px] border p-5", tone.border, isDarkMode ? "bg-black/10" : "bg-slate-50/70")}>
                <p className={cx("text-xs font-extrabold uppercase tracking-[0.16em]", tone.text)}>Failure handling</p>
                <ul className="mt-4 space-y-3">
                  {item.failures.map((failure, failureIndex) => (
                    <motion.li
                      key={failure}
                      initial={reduce ? false : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + failureIndex * 0.1, duration: 0.35 }}
                      className="flex items-start gap-3"
                    >
                      <ShieldCheck className={cx("mt-0.5 h-5 w-5 shrink-0", tone.text)} />
                      <span className={cx("text-sm leading-6", isDarkMode ? "text-slate-300" : "text-slate-700")}>{failure}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.article>
      </AnimatePresence>
    </div>
  );
}

function Section({ id, alt = false, narrow = false, isDarkMode, children }) {
  return (
    <section
      id={id}
      className={cx(
        "scroll-mt-20 py-16 sm:py-20 lg:py-24",
        alt && "border-y",
        alt && (isDarkMode ? "border-white/10 bg-[#161616]" : "border-orange-100 bg-[#fffaf5]")
      )}
    >
      <div className={cx("mx-auto px-4 sm:px-6 lg:px-8", narrow ? "max-w-4xl" : "max-w-7xl")}>
        {children}
      </div>
    </section>
  );
}

function SystemDesignHLD() {
  const [theme, setTheme] = useState(readStoredTheme);
  const isDarkMode = theme === "dark";

  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");

  const [comboProduct, setComboProduct] = useState(null);
  const [lldProduct, setLldProduct] = useState(null);
  const [loadingLldProduct, setLoadingLldProduct] = useState(true);
  const [lldProductError, setLldProductError] = useState("");

  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewSectionRef = useRef(null);

  // Floating desktop buy bar appears once the hero (and its CTA) scrolls away.
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(true);

  useEffect(() => {
    const el = heroRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const openBookPreview = () => {
    setIsPreviewOpen(true);
    window.requestAnimationFrame(() => {
      previewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const [previewImages, setPreviewImages] = useState([]);
  const [previewTotalPages, setPreviewTotalPages] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    let lastStorageTheme = readThemeFromStorage();
    let lastDomTheme = readThemeFromDom();

    const commitTheme = (nextTheme) => {
      if (!nextTheme) return;
      setTheme((currentTheme) =>
        currentTheme === nextTheme ? currentTheme : nextTheme
      );
    };

    const syncTheme = () => {
      const storageTheme = readThemeFromStorage();
      const domTheme = readThemeFromDom();

      // Follow whichever source actually changed. This matters because a navbar
      // often changes localStorage in the same tab (no native `storage` event),
      // while other implementations only toggle the html/body class.
      if (storageTheme && storageTheme !== lastStorageTheme) {
        lastStorageTheme = storageTheme;
        lastDomTheme = domTheme;
        commitTheme(storageTheme);
        return;
      }

      if (domTheme && domTheme !== lastDomTheme) {
        lastDomTheme = domTheme;
        lastStorageTheme = storageTheme;
        commitTheme(domTheme);
        return;
      }

      lastStorageTheme = storageTheme;
      lastDomTheme = domTheme;
      commitTheme(
        storageTheme ||
          domTheme ||
          (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
            ? "dark"
            : "light")
      );
    };

    const onStorage = (event) => {
      if (!event.key || event.key === THEME_STORAGE_KEY) syncTheme();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") syncTheme();
    };

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    const observer = new MutationObserver(syncTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class", "data-theme"],
      });
    }

    syncTheme();

    // Same-tab localStorage writes do not emit `storage`, so this lightweight
    // check guarantees navbar-driven changes are reflected immediately.
    const intervalId = window.setInterval(syncTheme, 1000);

    window.addEventListener("storage", onStorage);
    window.addEventListener("themechange", syncTheme);
    window.addEventListener("focus", syncTheme);
    document.addEventListener("visibilitychange", onVisibility);
    media?.addEventListener?.("change", syncTheme);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("focus", syncTheme);
      document.removeEventListener("visibilitychange", onVisibility);
      media?.removeEventListener?.("change", syncTheme);
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referralCode = (
      params.get("referralCode") ||
      params.get("ref") ||
      ""
    ).trim();

    if (referralCode) localStorage.setItem("referralCode", referralCode);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

        const redirectUrl = window.location.pathname;
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
            redirectUrl
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(result?.error?.message || "Book not found.");
        }

        setProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Failed to fetch HLD product:", error);
        setProduct(null);
        setProductError(error?.message || "Book not found.");
      } finally {
        if (!controller.signal.aborted) setLoadingProduct(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchLldProduct = async () => {
      try {
        setLoadingLldProduct(true);
        setLldProductError("");

        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
            LLD_REDIRECT_URL
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(
            result?.error?.message || "LLD book details are unavailable."
          );
        }

        setLldProduct(result.data);
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Failed to fetch LLD product:", error);
        setLldProduct(null);
        setLldProductError(
          error?.message || "LLD book details are unavailable."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingLldProduct(false);
        }
      }
    };

    fetchLldProduct();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCombo = async () => {
      try {
        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(COMBO_REDIRECT_URL)}`,
          {
            headers: { Accept: "application/json" },
            cache: "no-store",
            signal: controller.signal,
          }
        );
        if (!response.ok) return;
        const result = await response.json().catch(() => null);
        const data = result?.data;
        if (
          result?.success === true &&
          data?._id &&
          Number.isFinite(Number(data.price)) &&
          Number(data.price) >= 0 &&
          data.active !== false &&
          data.isActive !== false &&
          data.isDeleted !== true
        ) {
          setComboProduct(data);
        }
      } catch (error) {
        if (error?.name !== "AbortError") {
          console.error("Combo product lookup failed:", error);
        }
      }
    };
    fetchCombo();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask = null;
    const objectUrls = [];

    const canvasToBlob = (canvas) =>
      new Promise((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob),
          "image/jpeg",
          0.94
        );
      });

    const renderPreviewAsImages = async () => {
      try {
        setPreviewLoading(true);
        setPreviewError("");
        setPreviewImages([]);

        loadingTask = pdfjs.getDocument(HLD_PREVIEW_PDF);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        setPreviewTotalPages(pdf.numPages);

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const targetWidth = Math.min(
            1500,
            Math.max(1050, typeof window !== "undefined" ? window.innerWidth * 1.35 : 1200)
          );
          const scale = Math.max(1.25, targetWidth / baseViewport.width);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { alpha: false });

          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);

          if (!context) throw new Error("Canvas is not supported in this browser.");

          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport,
            background: "white",
          }).promise;

          const blob = await canvasToBlob(canvas);
          if (!blob) throw new Error(`Could not render preview page ${pageNumber}.`);

          const src = URL.createObjectURL(blob);
          objectUrls.push(src);

          if (!cancelled) {
            setPreviewImages((current) => [
              ...current,
              {
                pageNumber,
                src,
                width: canvas.width,
                height: canvas.height,
              },
            ]);
          }

          page.cleanup?.();
          canvas.width = 1;
          canvas.height = 1;
        }
      } catch (error) {
        if (cancelled) return;
        console.error("HLD preview image rendering failed:", error);
        setPreviewError(
          error?.message || "Unable to render the preview pages as images."
        );
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    renderPreviewAsImages();

    return () => {
      cancelled = true;
      try {
        loadingTask?.destroy?.();
      } catch {
        // no-op
      }
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const currentPrice = Number(product?.price ?? 0);
  const mrp = Number(product?.mrp ?? 0);
  const currency = product?.currency || "INR";
  const discount =
    mrp > currentPrice && currentPrice >= 0
      ? Math.round(((mrp - currentPrice) / mrp) * 100)
      : 0;

  const bookCover =
    product?.coverpageurl ||
    product?.coverPageUrl ||
    product?.cover_page_url ||
    "";

  const productName =
    product?.title || "Mastering System Design — High-Level Design";

  const lldCurrentPrice = Number(lldProduct?.price ?? 0);
  const lldMrp = Number(lldProduct?.mrp ?? 0);
  const lldCurrency = lldProduct?.currency || "INR";
  const lldDiscount =
    lldMrp > lldCurrentPrice && lldCurrentPrice >= 0
      ? Math.round(((lldMrp - lldCurrentPrice) / lldMrp) * 100)
      : 0;

  const lldCover =
    lldProduct?.coverpageurl ||
    lldProduct?.coverPageUrl ||
    lldProduct?.cover_page_url ||
    "";

  const lldTitle =
    lldProduct?.title || "Mastering System Design — LLD (Java)";

  const lldSubtitle =
    lldProduct?.subtitle ||
    "Java-first Low-Level Design interview handbook";

  const lldDescription =
    lldProduct?.shortDescription ||
    lldProduct?.description ||
    "Turn requirements into clean object models, apply SOLID principles and design patterns, and practice complete Java-first low-level design problems.";
  // Track an API-loaded product once for this page view. Do not track
  // fallback prices or refetches, and do not reference an undefined `book`.
  const trackedContentRef = useRef(null);

  useEffect(() => {
    if (!product?._id || product.price == null) return;

    const amount = Number(product.price);
    if (!Number.isFinite(amount) || amount < 0) return;

    const trackingKey = `${product._id}:${amount}:${product.currency || "INR"}`;
    if (trackedContentRef.current === trackingKey) return;

    const sent = trackViewContent({
      id: String(product._id),
      title: product.title || "Mastering System Design — HLD",
      price: amount,
      currency: product.currency || "INR",
    });

    // Only mark tracked if fbq was loaded and the helper dispatched it.
    if (sent !== false) trackedContentRef.current = trackingKey;
  }, [product?._id, product?.title, product?.price, product?.currency]);

  const lldMetaItems = [
    lldProduct?.edition ? `Edition: ${lldProduct.edition}` : null,
    lldProduct?.level ? `Level: ${lldProduct.level}` : null,
    lldProduct?.language ? `Language: ${lldProduct.language}` : null,
    lldProduct?.format ? `Format: ${lldProduct.format}` : "Digital ebook",
  ].filter(Boolean);

  const lldCategoryPills = Array.isArray(lldProduct?.categories)
    ? lldProduct.categories
        .map((item) =>
          typeof item === "string"
            ? item
            : item?.name || item?.title || item?.label || ""
        )
        .filter(Boolean)
        .slice(0, 5)
    : [];

  const formatMoney = (amount, currencyCode = currency) => {
    const value = Number(amount || 0);
    const localeMap = {
      INR: "en-IN",
      USD: "en-US",
      GBP: "en-GB",
      EUR: "en-IE",
      AUD: "en-AU",
      CAD: "en-CA",
    };

    try {
      return new Intl.NumberFormat(localeMap[currencyCode] || "en", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${currencyCode} ${value}`;
    }
  };

  const handleBuyNow = () => {
    if (!product?._id) return;
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleComboBuyNow = () => {
    if (!comboProduct?._id) return;
    setCheckoutProduct(comboProduct);
    setIsCheckoutOpen(true);
  };

  const handleLldBuyNow = () => {
    if (!lldProduct?._id) return;
    setCheckoutProduct(lldProduct);
    setIsCheckoutOpen(true);
  };

  const pathname =
    typeof window !== "undefined"
      ? window.location.pathname
      : "/book/system-design/hld";
  const canonicalUrl = `${SITE_URL}${pathname.replace(/\/+$/, "") || "/"}`;

  const structuredData = useMemo(() => {
    const priceValidUntil = `${new Date().getFullYear() + 1}-12-31`;

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: SITE_NAME,
          url: SITE_URL,
          email: "supporttargettrek@gmail.com",
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            email: "supporttargettrek@gmail.com",
            availableLanguage: ["English"],
          },
        },
        {
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          url: SITE_URL,
          name: SITE_NAME,
          inLanguage: "en-IN",
          publisher: { "@id": `${SITE_URL}/#organization` },
        },
        {
          "@type": "WebPage",
          "@id": `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          inLanguage: "en-IN",
          isPartOf: { "@id": `${SITE_URL}/#website` },
          breadcrumb: { "@id": `${canonicalUrl}#breadcrumb` },
          about: { "@id": `${canonicalUrl}#product` },
          ...(bookCover ? { primaryImageOfPage: { "@type": "ImageObject", url: bookCover } } : {}),
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonicalUrl}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
            { "@type": "ListItem", position: 3, name: "System Design HLD", item: canonicalUrl },
          ],
        },
        {
          "@type": ["Product", "Book"],
          "@id": `${canonicalUrl}#product`,
          name: productName,
          description: SEO_LONG_DESCRIPTION,
          url: canonicalUrl,
          category: "System Design High-Level Design Ebook",
          keywords: SEO_KEYWORDS,
          inLanguage: "en",
          bookFormat: "https://schema.org/EBook",
          genre: "Computer science, system design, interview preparation",
          audience: {
            "@type": "Audience",
            audienceType: "Software engineers preparing for system design interviews",
          },
          brand: { "@type": "Brand", name: SITE_NAME },
          author: { "@id": `${SITE_URL}/#organization` },
          publisher: { "@id": `${SITE_URL}/#organization` },
          isAccessibleForFree: false,
          ...(product?._id ? { sku: String(product._id) } : {}),
          ...(bookCover ? { image: [bookCover] } : {}),
          ...(currentPrice > 0
            ? {
                offers: {
                  "@type": "Offer",
                  url: canonicalUrl,
                  price: currentPrice,
                  priceCurrency: currency,
                  priceValidUntil,
                  availability: "https://schema.org/InStock",
                  itemCondition: "https://schema.org/NewCondition",
                  hasMerchantReturnPolicy: {
                    "@type": "MerchantReturnPolicy",
                    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
                  },
                  seller: {
                    "@type": "Organization",
                    name: SITE_NAME,
                    url: SITE_URL,
                  },
                },
              }
            : {}),
        },
        {
          "@type": "ItemList",
          "@id": `${canonicalUrl}#case-studies`,
          name: "19 system design case studies in the HLD handbook",
          numberOfItems: caseStudies.length,
          itemListElement: caseStudies.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `Design ${item.title}`,
            description: item.summary,
          })),
        },
        {
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faq`,
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.a,
            },
          })),
        },
      ],
    };
  }, [bookCover, canonicalUrl, currency, currentPrice, product?._id, productName]);

  const pageShell = isDarkMode
    ? "bg-[#111111] text-slate-100"
    : "bg-white text-slate-950";

  const panel = isDarkMode
    ? "border-white/10 bg-white/[0.04]"
    : "border-slate-200 bg-white";

  const softPanel = isDarkMode
    ? "border-white/10 bg-[#1b1b1b]"
    : "border-orange-100 bg-[#faf9f7]";

  const muted = isDarkMode ? "text-slate-400" : "text-slate-600";

  const dotBackground = {
    backgroundImage: isDarkMode
      ? "radial-gradient(circle, rgba(249,115,22,.14) 1.2px, transparent 1.2px)"
      : "radial-gradient(circle, rgba(249,115,22,.09) 1.2px, transparent 1.2px)",
    backgroundSize: "40px 40px",
  };

  // While the product API is in flight the full page still renders (good for
  // crawlers and perceived speed); only the price and buy buttons wait.
  const priceText = loadingProduct ? "…" : formatMoney(currentPrice);
  const savingsAmount = mrp > currentPrice ? mrp - currentPrice : 0;
  const canBuy = Boolean(product?._id);

  const seoHead = (
    <Helmet htmlAttributes={{ lang: "en" }}>
      <title>{SEO_TITLE}</title>
      <meta name="description" content={SEO_DESCRIPTION} />
      <meta name="keywords" content={SEO_KEYWORDS} />
      <meta name="author" content={SITE_NAME} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta
        name="googlebot"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="theme-color" content={isDarkMode ? "#111111" : "#fff7ed"} />
      <meta name="color-scheme" content={isDarkMode ? "dark" : "light"} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {bookCover && <link rel="preload" as="image" href={bookCover} />}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <meta property="og:type" content="product" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:title" content={SEO_TITLE} />
      <meta property="og:description" content={SEO_DESCRIPTION} />
      <meta property="og:url" content={canonicalUrl} />
      {currentPrice > 0 && (
        <meta property="product:price:amount" content={String(currentPrice)} />
      )}
      {currentPrice > 0 && (
        <meta property="product:price:currency" content={currency} />
      )}
      {bookCover && <meta property="og:image" content={bookCover} />}
      {bookCover && (
        <meta property="og:image:alt" content={`${productName} ebook cover`} />
      )}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SEO_TITLE} />
      <meta name="twitter:description" content={SEO_DESCRIPTION} />
      {bookCover && <meta name="twitter:image" content={bookCover} />}
      {bookCover && (
        <meta name="twitter:image:alt" content={`${productName} ebook cover`} />
      )}

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );

  if (!loadingProduct && (!product || productError)) {
    return (
      <div className={cx("flex min-h-screen items-center justify-center px-4", pageShell)}>
        <Helmet>
          <title>Book Not Found | Target Trek</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className={cx("w-full max-w-lg rounded-[28px] border p-8 text-center shadow-xl", panel)}>
          <BookOpen className="mx-auto h-12 w-12 text-orange-500" />
          <h1 className="mt-5 text-2xl font-extrabold">Book details are unavailable</h1>
          <p className={cx("mt-3 text-sm leading-6", muted)}>
            {productError || "Please refresh the page and try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cx("min-h-screen overflow-x-hidden pb-28", pageShell)}
      style={{
        fontFamily: 'DM Sans, ui-sans-serif, system-ui, sans-serif',
        fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
      }}
    >
      {seoHead}
      <style>{`
        .hld-display, .hld-hero-title { font-family: 'Plus Jakarta Sans', 'DM Sans', sans-serif; }
        @media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }

        .hld-preview-page { transition: transform .25s ease, box-shadow .25s ease; }
        .hld-preview-page:hover { transform: translateY(-3px); box-shadow: 0 20px 55px rgba(249,115,22,.12); }

        /* animated gradient headline */
        .hld-gradient-text { background-size: 200% auto; animation: hld-gradient 6s linear infinite; }
        @keyframes hld-gradient { to { background-position: 200% center; } }

        /* floating background orbs */
        .hld-orb { animation: hld-float 12s ease-in-out infinite; }
        .hld-orb-2 { animation-duration: 16s; animation-delay: -4s; }
        @keyframes hld-float {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(24px,-30px,0) scale(1.08); }
        }

        /* shimmer sweep on primary CTAs */
        .hld-shimmer::after {
          content: ""; position: absolute; inset: 0; transform: translateX(-120%);
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.35) 50%, transparent 70%);
          animation: hld-sheen 3.4s ease-in-out infinite;
        }
        @keyframes hld-sheen { 0%, 55% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }

        /* pulsing ring for the mobile buy button */
        .hld-pulse { animation: hld-pulse 2.4s ease-out infinite; }
        @media (min-width: 768px) { .md\\:hld-no-pulse { animation: none; } }
        @keyframes hld-pulse {
          0% { box-shadow: 0 0 0 0 rgba(249,115,22,.45); }
          70%, 100% { box-shadow: 0 0 0 14px rgba(249,115,22,0); }
        }

        /* technology marquee */
        .hld-marquee { display: flex; width: max-content; animation: hld-marquee 38s linear infinite; }
        .hld-marquee-wrap:hover .hld-marquee { animation-play-state: paused; }
        @keyframes hld-marquee { to { transform: translateX(-50%); } }

        /* request-flow connector with travelling packet */
        .hld-conn {
          position: relative; flex: 1 1 28px; min-width: 28px; min-height: 28px;
          align-self: center; width: 2px; height: 28px;
          background: repeating-linear-gradient(180deg, rgba(249,115,22,.4) 0 6px, transparent 6px 12px);
        }
        .hld-conn::after {
          content: ""; position: absolute; left: -3px; top: 0; width: 8px; height: 8px; border-radius: 9999px;
          background: #f97316; box-shadow: 0 0 12px 2px rgba(249,115,22,.8);
          animation: hld-dot-y 1.8s linear infinite; animation-delay: inherit;
        }
        @keyframes hld-dot-y { from { top: 0; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } to { top: calc(100% - 8px); opacity: 0; } }
        @media (min-width: 1024px) {
          .hld-conn {
            width: auto; height: 2px; min-height: 0; align-self: center;
            background: repeating-linear-gradient(90deg, rgba(249,115,22,.4) 0 6px, transparent 6px 12px);
          }
          .hld-conn::after { left: 0; top: -3px; animation-name: hld-dot-x; }
          @keyframes hld-dot-x { from { left: 0; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } to { left: calc(100% - 8px); opacity: 0; } }
        }

        @media (prefers-reduced-motion: reduce) {
          .hld-preview-page, .hld-gradient-text, .hld-orb, .hld-shimmer::after, .hld-pulse, .hld-marquee, .hld-conn::after { animation: none !important; transition: none !important; }
          .hld-preview-page:hover { transform: none; }
          .hld-marquee { flex-wrap: wrap; width: auto; }
        }
      `}</style>

      <ScrollProgress />

      <nav
        aria-label="Breadcrumb"
        className={cx(
          "border-b px-4 py-3 text-sm",
          isDarkMode
            ? "border-white/10 bg-[#111111] text-slate-400"
            : "border-slate-200 bg-white text-slate-500"
        )}
      >
        <ol className="mx-auto flex max-w-7xl items-center gap-2">
          <li>
            <a className="font-semibold transition hover:text-orange-500" href="/">
              Home
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <a className="font-semibold transition hover:text-orange-500" href="/books">
              Books
            </a>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className={cx("font-bold", isDarkMode ? "text-slate-200" : "text-slate-800")}>
            System Design HLD
          </li>
        </ol>
      </nav>

      <nav
        aria-label="On this page"
        className={cx(
          "sticky top-0 z-40 border-b backdrop-blur-xl",
          isDarkMode ? "border-white/10 bg-[#111111]/85" : "border-orange-100 bg-white/85"
        )}
      >
        <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 text-xs font-bold sm:px-6 lg:px-8">
          {NAV_LINKS.map(([href, label]) => (
            <li key={href} className="shrink-0">
              <a
                href={href}
                className={cx(
                  "inline-block rounded-full px-3 py-1.5 transition hover:bg-orange-500/10 hover:text-orange-500",
                  isDarkMode ? "text-slate-300" : "text-slate-600"
                )}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main>
        {/* ------------------------------ HERO ------------------------------ */}
        <section
          ref={heroRef}
          aria-labelledby="hld-hero-title"
          className={cx(
            "relative overflow-hidden border-b",
            isDarkMode ? "border-orange-400/10 bg-[#111111]" : "border-orange-100 bg-[#fffaf5]"
          )}
          style={dotBackground}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="hld-orb absolute -left-24 top-20 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="hld-orb hld-orb-2 absolute -right-24 top-0 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
          </div>

          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[1.16fr_.84fr] lg:items-center lg:gap-10 lg:px-8 lg:py-16">
            <div className="min-w-0">
              <Reveal
                y={14}
                className={cx(
                  "inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] shadow-sm sm:text-sm sm:tracking-[0.16em]",
                  isDarkMode
                    ? "border-orange-400/20 bg-white/5 text-orange-300"
                    : "border-orange-200 bg-white/85 text-orange-700"
                )}
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span className="truncate">HLD system design interview handbook · PDF ebook</span>
              </Reveal>

              <Reveal as="h1" delay={0.06} id="hld-hero-title" className="hld-hero-title mt-4 text-[2.25rem] font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-[2.8rem] lg:text-[3.4rem]">
                <span className={isDarkMode ? "text-white" : "text-[#1c1917]"}>
                  Crack the System Design interview.
                </span>
                <span className="hld-gradient-text mt-2 block bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                  Design 19 real systems, step by step.
                </span>
              </Reveal>

              <Reveal delay={0.12}>
                <RotatingPrompt isDarkMode={isDarkMode} />
              </Reveal>

              <Reveal
                as="p"
                delay={0.18}
                className={cx(
                  "mt-4 max-w-xl text-sm font-medium leading-6 sm:text-base sm:leading-7",
                  isDarkMode ? "text-slate-300" : "text-[#57534e]"
                )}
              >
                Learn a repeatable way to turn an open-ended prompt into requirements,
                estimates, APIs, data models, a complete architecture, deep dives and
                failure handling — then practice it on WhatsApp, Uber, BookMyShow,
                payments, Netflix and 14 more systems.
              </Reveal>

              <Reveal delay={0.24} className="mt-5 flex flex-wrap items-center gap-2.5">
                <button type="button" onClick={handleBuyNow} disabled={!canBuy} className={ctaPrimary}>
                  Get the ebook {priceText}
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={openBookPreview}
                  aria-controls="hld-preview-content"
                  aria-expanded={isPreviewOpen}
                  className={cx(
                    "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition hover:-translate-y-0.5",
                    isDarkMode
                      ? "border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.07]"
                      : "border-orange-200 bg-white/85 text-slate-800 hover:border-orange-300 hover:bg-white"
                  )}
                >
                  <BookOpen className="h-5 w-5" />
                  Read free sample pages
                  <ChevronDown className={cx("h-4 w-4 transition-transform", isPreviewOpen && "rotate-180")} />
                </button>
              </Reveal>

              <Reveal delay={0.3} className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold sm:text-[13px]">
                {[
                  [Download, "Instant access after payment"],
                  [Lock, "Secure checkout via PayU"],
                  [FileText, "Free preview before you buy"],
                ].map(([Icon, text]) => (
                  <span key={text} className={cx("inline-flex items-center gap-1.5", isDarkMode ? "text-slate-300" : "text-stone-600")}>
                    <Icon className="h-4 w-4 text-orange-500" />
                    {text}
                  </span>
                ))}
              </Reveal>

              <div className="mt-6 grid gap-2.5 sm:max-w-2xl sm:grid-cols-3">
                {[
                  "19 interview case studies",
                  "45-minute HLD playbook",
                  "APIs • DB • failures • trade-offs",
                ].map((item, index) => (
                  <Reveal key={item} delay={0.36 + index * 0.08} y={12} className="flex items-center gap-3 text-sm font-extrabold sm:text-[15px]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-400/15 text-orange-500">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                    <span className={isDarkMode ? "text-slate-300" : "text-[#57534e]"}>{item}</span>
                  </Reveal>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[310px] sm:max-w-[340px] lg:max-w-[355px]">
              <Reveal delay={0.15} y={36}>
                <div className="relative mx-auto w-[65%] min-w-[165px] max-w-[220px] sm:w-[65%] lg:w-[70%]">
                  <div className="absolute -inset-8 rounded-[42px] bg-gradient-to-br from-orange-500/25 via-orange-500/10 to-amber-500/25 blur-3xl" aria-hidden="true" />
                  <TiltBook>
                    <div className="relative rotate-[-1.5deg] overflow-hidden rounded-[22px] border border-white/30 bg-[#171717] shadow-[0_24px_60px_rgba(0,0,0,.28)]">
                      {bookCover ? (
                        <img
                          src={bookCover}
                          alt={`${productName} ebook cover`}
                          className="block h-auto w-full object-cover"
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                        />
                      ) : (
                        <div className="aspect-[0.72] bg-gradient-to-br from-[#181818] via-[#262626] to-[#4b2712] p-8 text-white">
                          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-200">The system design interview guide</p>
                          <p className="mt-12 text-4xl font-extrabold leading-none">MASTER SYSTEM DESIGN</p>
                          <p className="mt-5 font-bold text-orange-200">High-Level Design</p>
                        </div>
                      )}
                    </div>
                  </TiltBook>
                </div>

                <div className={cx("relative -mt-3 rounded-2xl border p-3 shadow-lg backdrop-blur-xl sm:p-4", panel)}>
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className={cx("text-xs font-extrabold uppercase tracking-[0.18em]", isDarkMode ? "text-orange-300" : "text-orange-600")}>
                        Digital PDF ebook
                      </p>
                      <div className="mt-2 flex flex-wrap items-end gap-2">
                        <motion.span
                          key={priceText}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-extrabold"
                        >
                          {priceText}
                        </motion.span>
                        {mrp > currentPrice && (
                          <span className={cx("pb-1 text-sm font-bold line-through", isDarkMode ? "text-slate-500" : "text-slate-400")}>
                            {formatMoney(mrp)}
                          </span>
                        )}
                      </div>
                    </div>

                    {discount > 0 && (
                      <div className="rounded-full bg-orange-500/12 px-3 py-1.5 text-xs font-extrabold text-orange-500">
                        {discount}% OFF
                      </div>
                    )}
                  </div>
                  {savingsAmount > 0 && (
                    <p className="mt-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                      You save {formatMoney(savingsAmount)} on today’s price
                    </p>
                  )}
                  <p className={cx("mt-2 text-xs leading-5", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                    Instant access after successful payment. Digital purchases are non-refundable.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------------------- BUNDLE / LLD UPSELL (unchanged data) ------- */}
        {(lldProduct || comboProduct) && (
          <section
            aria-labelledby="bundle-title"
            className={cx(
              "border-y py-14 sm:py-16 lg:py-20",
              isDarkMode ? "border-white/10 bg-[#15110f]" : "border-orange-100 bg-[#fffaf6]"
            )}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Reveal className="mb-9 max-w-3xl">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500">
                  Complete your System Design preparation
                </p>
                <h2
                  id="bundle-title"
                  className={cx("mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl", isDarkMode ? "text-white" : "text-stone-900")}
                >
                  Go deeper with LLD — or get both books
                </h2>
                <p className={cx("mt-3 max-w-2xl text-base leading-7", isDarkMode ? "text-stone-300" : "text-stone-600")}>
                  Move from designing scalable systems to implementing clean,
                  reliable Java classes. Choose the LLD handbook or prepare for
                  both design rounds with the HLD + LLD bundle.
                </p>
              </Reveal>

              <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
                {[
                  ...(lldProduct
                    ? [{
                        key: "lld",
                        item: lldProduct,
                        eyebrow: "LOW-LEVEL DESIGN · JAVA",
                        fallback: "Mastering System Design — LLD",
                        description:
                          "Turn requirements into clean Java code with object-oriented design, UML, SOLID, design patterns, concurrency, and real interview problems.",
                        features: [
                          "Java, OOP, SOLID & UML",
                          "23 GoF design patterns",
                          "16 detailed LLD case studies",
                        ],
                        action: handleLldBuyNow,
                        href: LLD_REDIRECT_URL,
                        button: "Get the LLD book",
                      }]
                    : []),
                  ...(comboProduct
                    ? [{
                        key: "combo",
                        item: comboProduct,
                        eyebrow: "COMPLETE SYSTEM DESIGN BUNDLE",
                        fallback: "Mastering System Design — HLD + LLD Combo",
                        description:
                          "Prepare for both system design rounds in one bundle: distributed architecture and scalable backends in HLD, plus practical Java class design in LLD.",
                        features: [
                          "HLD + LLD together",
                          "19 HLD case studies + 16 LLD problems",
                          "Architecture, Java code & design patterns",
                        ],
                        action: handleComboBuyNow,
                        href: COMBO_REDIRECT_URL,
                        button: "Get the combo",
                      }]
                    : []),
                ].map(({ key, item, eyebrow, fallback, description, features, action, href, button }, cardIndex) => {
                  const price = Number(item.price);
                  const mrpValue = Number(item.mrp || 0);
                  const currencyCode = item.currency || "INR";
                  const savings = mrpValue > price ? Math.round(((mrpValue - price) / mrpValue) * 100) : 0;
                  return (
                    <Reveal
                      as="article"
                      key={key}
                      delay={cardIndex * 0.1}
                      className={cx(
                        "relative flex h-full min-w-0 flex-col overflow-hidden rounded-[28px] border shadow-[0_16px_48px_rgba(105,54,20,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_64px_rgba(105,54,20,0.16)]",
                        key === "combo" && "ring-2 ring-orange-500/60",
                        isDarkMode ? "border-stone-700 bg-[#241c17]" : "border-orange-200 bg-white"
                      )}
                    >
                      {key === "combo" && (
                        <span className="absolute right-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-white">
                          Best value
                        </span>
                      )}
                      <div className="flex h-full min-w-0 flex-1 flex-col p-6 sm:p-7 lg:p-8">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-orange-500">{eyebrow}</p>
                        <h3 className={cx("mt-2 text-xl font-extrabold leading-tight sm:text-[22px]", isDarkMode ? "text-white" : "text-stone-900")}>
                          {item.title || fallback}
                        </h3>
                        <p className={cx("mt-3 text-sm leading-6", isDarkMode ? "text-stone-300" : "text-stone-600")}>{description}</p>
                        <ul className="mt-4 space-y-2">
                          {features.map((feature) => (
                            <li
                              key={feature}
                              className={cx("flex items-start gap-2 text-[13px] font-semibold leading-5", isDarkMode ? "text-stone-200" : "text-stone-700")}
                            >
                              <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-auto pt-5">
                          {key === "combo" && (
                            <p className={cx("mb-1 text-xs font-semibold", isDarkMode ? "text-stone-300" : "text-stone-500")}>
                              Current bundle price
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className={cx("text-3xl font-extrabold tracking-tight", isDarkMode ? "text-white" : "text-stone-900")}>
                              {formatMoney(price, currencyCode)}
                            </span>
                            {mrpValue > price && (
                              <span className={cx("text-sm line-through", isDarkMode ? "text-stone-400" : "text-stone-500")}>
                                {formatMoney(mrpValue, currencyCode)}
                              </span>
                            )}
                            {savings > 0 && (
                              <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-xs font-extrabold text-orange-500">
                                {savings}% OFF
                              </span>
                            )}
                          </div>
                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={action}
                              className="inline-flex min-h-12 w-full min-w-0 items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-2 py-2.5 text-center text-xs font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-orange-700 sm:text-sm"
                            >
                              {button}
                              <ArrowRight className="h-4 w-4" />
                            </button>
                            <a
                              href={href}
                              className={cx(
                                "inline-flex min-h-12 w-full min-w-0 items-center justify-center rounded-xl border px-2 py-2.5 text-center text-xs font-bold transition hover:-translate-y-0.5 sm:text-sm",
                                isDarkMode ? "border-stone-600 text-stone-100 hover:bg-white/5" : "border-orange-200 text-orange-700 hover:bg-orange-50"
                              )}
                            >
                              View details
                            </a>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* --------------------------- TECH MARQUEE -------------------------- */}
        <div
          className={cx(
            "hld-marquee-wrap overflow-hidden border-b py-4",
            isDarkMode ? "border-white/10 bg-[#141414]" : "border-orange-100 bg-white"
          )}
          aria-label="Technologies and concepts covered"
        >
          <div className="hld-marquee">
            {[...marqueeTerms, ...marqueeTerms].map((term, index) => (
              <span
                key={`${term}-${index}`}
                aria-hidden={index >= marqueeTerms.length ? "true" : undefined}
                className={cx(
                  "mx-2 inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em]",
                  isDarkMode ? "border-white/10 bg-white/[0.04] text-slate-300" : "border-orange-100 bg-orange-50/70 text-orange-700"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* ------------------------------ STATS ------------------------------ */}
        <section aria-label="Book at a glance" className={cx("border-b", isDarkMode ? "border-white/10 bg-[#111111]" : "border-slate-200 bg-white")}>
          <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4">
            {[
              [19, "", "Case studies"],
              [45, " min", "Interview playbook"],
              [9, "", "Steps per case"],
              [buildingBlocks.length, "", "Core building blocks"],
            ].map(([value, suffix, label], index) => (
              <div
                key={label}
                className={cx(
                  "px-4 py-7 text-center",
                  index % 2 === 0 ? "border-r" : "",
                  index < 2 ? "border-b md:border-b-0" : "",
                  index === 1 ? "md:border-r" : "",
                  index === 2 ? "md:border-r" : "",
                  isDarkMode ? "border-white/10" : "border-slate-200"
                )}
              >
                <div className="text-3xl font-extrabold text-orange-500 sm:text-4xl">
                  <CountUp to={value} suffix={suffix} />
                </div>
                <div className={cx("mt-1 text-xs font-bold uppercase tracking-[0.12em] sm:text-sm", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ----------------------------- PREVIEW ----------------------------- */}
        <section id="book-preview" ref={previewSectionRef} aria-labelledby="preview-title" className={cx("scroll-mt-24 border-b py-10 sm:py-14", isDarkMode ? "border-white/10 bg-[#161616]" : "border-orange-100 bg-[#fff7ed]")}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              id="preview-title"
              eyebrow="Real book preview"
              title="See exactly what’s inside."
              description="A real look inside Mastering System Design — HLD. Explore the sample pages before you decide."
              dark={isDarkMode}
            />

            <div className={cx("mt-7 rounded-[24px] border p-3 shadow-sm sm:p-5", softPanel)}>
              <div className={cx("flex flex-col gap-4 rounded-[22px] border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5", isDarkMode ? "border-white/10 bg-white/[0.025]" : "border-orange-100 bg-white")}>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-extrabold tracking-[-0.01em]">Mastering System Design — HLD Preview</p>
                    <p className={cx("mt-1 text-xs font-medium", isDarkMode ? "text-slate-400" : "text-slate-500")}>
                      {previewLoading
                        ? "Rendering preview pages…"
                        : previewTotalPages
                        ? `${previewTotalPages} preview pages `
                        : "Preview pages"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen((open) => !open)}
                  aria-expanded={isPreviewOpen}
                  aria-controls="hld-preview-content"
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500"
                >
                  <BookOpen className="h-4 w-4" />
                  {isPreviewOpen ? "Close preview" : "Preview the book"}
                  <ChevronDown className={cx("h-4 w-4 transition-transform", isPreviewOpen && "rotate-180")} />
                </button>
              </div>

              <div id="hld-preview-content" hidden={!isPreviewOpen}>
                {isPreviewOpen && previewLoading && previewImages.length === 0 && (
                  <div className="mt-5 space-y-6">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className={cx(
                          "mx-auto aspect-[0.707] w-full max-w-[920px] animate-pulse rounded-[18px]",
                          isDarkMode ? "bg-white/[0.05]" : "bg-white"
                        )}
                      />
                    ))}
                  </div>
                )}

                {isPreviewOpen && previewError && previewImages.length === 0 && (
                  <div className={cx("mx-auto mt-5 max-w-2xl rounded-[22px] border p-6 text-center", panel)}>
                    <BookOpen className="mx-auto h-9 w-9 text-orange-500" />
                    <p className="mt-3 font-extrabold">Preview could not be rendered</p>
                    <p className={cx("mt-2 text-sm leading-6", muted)}>
                      {previewError || "Check the preview PDF path and pdf.js worker configuration."}
                    </p>
                  </div>
                )}

                {isPreviewOpen && previewImages.length > 0 && (
                  <div className="mt-5 space-y-5 sm:mt-7 sm:space-y-8">
                    {previewImages.map((page) => (
                      <motion.article
                        key={page.pageNumber}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="mx-auto w-full max-w-[940px]"
                      >
                        <div className="mb-2.5 flex items-center justify-between px-1">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Preview page {formatTwoDigits(page.pageNumber)}
                          </span>
                          <span className={cx("text-[11px] font-medium", isDarkMode ? "text-slate-600" : "text-slate-400")}>
                            {page.pageNumber} / {previewTotalPages}
                          </span>
                        </div>

                        <div className="hld-preview-page overflow-hidden rounded-2xl bg-white shadow-[0_12px_36px_rgba(15,23,42,.10)] ring-1 ring-black/5">
                          <img
                            src={page.src}
                            alt={`Mastering System Design HLD preview page ${page.pageNumber}`}
                            width={page.width}
                            height={page.height}
                            loading={page.pageNumber <= 2 ? "eager" : "lazy"}
                            decoding="async"
                            className="block h-auto w-full bg-white"
                          />
                        </div>
                      </motion.article>
                    ))}

                    <div className="mx-auto flex max-w-[940px] flex-col items-center gap-3 rounded-2xl border border-orange-300/40 bg-orange-500/10 p-5 text-center">
                      <p className="text-sm font-extrabold sm:text-base">Liked the sample? The full book has all 19 case studies.</p>
                      <button type="button" onClick={handleBuyNow} disabled={!canBuy} className={ctaPrimary}>
                        Get the full ebook {priceText}
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------- WHY CANDIDATES STALL ---------------------- */}
        <Section isDarkMode={isDarkMode}>
          <SectionHeader
            id="pain-title"
            eyebrow="Why system design rounds go wrong"
            title="Stop memorising diagrams. Start reasoning like a senior engineer."
            description="Most candidates know the tools but cannot explain why a component belongs in the design. This handbook fixes the reasoning, not just the vocabulary."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {painPoints.map((item, index) => (
              <Reveal
                key={item.before}
                delay={(index % 2) * 0.08}
                className={cx("rounded-[24px] border p-5 sm:p-6", panel)}
              >
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <p className={cx("text-sm font-semibold leading-6 line-through decoration-rose-400/60", isDarkMode ? "text-slate-500" : "text-slate-500")}>
                    {item.before}
                  </p>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  <p className="text-sm font-extrabold leading-6 sm:text-base">{item.after}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ----------------------------- WHAT IS HLD ------------------------- */}
        <Section id="what-is-hld" alt isDarkMode={isDarkMode}>
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
            <div>
              <SectionHeader
                id="what-is-hld-title"
                eyebrow="System design basics"
                title="What is High-Level Design (HLD)?"
                dark={isDarkMode}
              />
              <Reveal delay={0.08} className={cx("mt-5 space-y-4 text-base leading-8", muted)}>
                <p>
                  <strong className={isDarkMode ? "text-white" : "text-slate-900"}>High-Level Design</strong> is the part of a system design
                  interview where you describe the architecture of an entire product: which services exist, how clients
                  talk to them, where data lives, what is cached, what runs asynchronously and how the system behaves
                  when something breaks.
                </p>
                <p>
                  A strong HLD answer follows a predictable path — requirements, back-of-the-envelope estimation, APIs
                  and entities, the architecture diagram, request flows, deep dives and failure handling. This book
                  trains exactly that path on 19 familiar systems, from a URL shortener to an e-commerce platform.
                </p>
                <p>
                  If you are also preparing for object-oriented design rounds, the companion{" "}
                  <a href={LLD_REDIRECT_URL} className="font-bold text-orange-500 underline-offset-4 hover:underline">
                    Java LLD handbook
                  </a>{" "}
                  covers classes, SOLID and design patterns.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.12} className={cx("overflow-hidden rounded-[26px] border", panel)}>
              <div className="grid grid-cols-3 bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-white">
                <span />
                <span>HLD</span>
                <span>LLD</span>
              </div>
              {hldVsLld.map(([label, hld, lld]) => (
                <div
                  key={label}
                  className={cx("grid grid-cols-3 gap-3 border-t px-4 py-4 text-sm leading-6", isDarkMode ? "border-white/10" : "border-slate-200")}
                >
                  <span className="font-extrabold text-orange-500">{label}</span>
                  <span className={muted}>{hld}</span>
                  <span className={muted}>{lld}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </Section>

        {/* ----------------------------- FRAMEWORK --------------------------- */}
        <Section id="framework" isDarkMode={isDarkMode}>
          <SectionHeader
            id="framework-title"
            eyebrow="One repeatable framework"
            title="Every case study follows the same interview-ready structure"
            description="The point is not to memorize 19 diagrams. The point is to build one reasoning process you can reuse when the interviewer changes the product, scale or constraint."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudyFramework.map((item, index) => (
              <Reveal
                as="article"
                key={item.number}
                delay={(index % 3) * 0.07}
                className={cx("group rounded-[24px] border p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-400/60 hover:shadow-xl sm:p-6", panel)}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm font-extrabold tracking-[0.16em] text-orange-500">{item.number}</span>
                  <span className="h-px flex-1 bg-gradient-to-r from-orange-500/40 to-transparent transition-all duration-500 group-hover:from-orange-500" />
                </div>
                <h3 className="mt-5 text-xl font-extrabold tracking-tight">{item.title}</h3>
                <p className={cx("mt-2 text-sm leading-6", muted)}>{item.copy}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------------------- REQUEST FLOW ------------------------- */}
        <Section id="request-flow" alt isDarkMode={isDarkMode}>
          <SectionHeader
            id="request-flow-title"
            eyebrow="See it in motion"
            title="Follow one request through a production architecture"
            description="Click any stage to see why it exists. These are the same building blocks you will justify in every HLD interview."
            dark={isDarkMode}
          />
          <RequestFlowDemo isDarkMode={isDarkMode} />
        </Section>

        {/* ----------------------------- PLAYBOOK ---------------------------- */}
        <Section id="playbook" isDarkMode={isDarkMode}>
          <SectionHeader
            id="playbook-title"
            eyebrow="The 45-minute interview plan"
            title="Know what to do with every minute"
            description="A system-design round feels less chaotic when you have a fixed order: scope first, estimate quickly, define interfaces, draw the system, then spend most of the interview on the genuinely hard parts."
            dark={isDarkMode}
          />

          <div className="mt-10 flex h-3 w-full overflow-hidden rounded-full bg-orange-500/10" role="img" aria-label="Time split across the 45-minute interview">
            {interviewPlaybook.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
                style={{ flexGrow: parseInt(item.time, 10), transformOrigin: "left" }}
                className={cx(
                  "h-full border-r border-white/30 last:border-r-0",
                  index % 2 === 0 ? "bg-orange-600" : "bg-amber-500"
                )}
                title={`${item.title}: ${item.time}`}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {interviewPlaybook.map((item, index) => (
              <Reveal
                as="article"
                key={item.title}
                delay={(index % 3) * 0.07}
                className={cx("relative overflow-hidden rounded-[24px] border p-6 transition hover:-translate-y-1 hover:shadow-xl", panel)}
              >
                <div className="absolute right-4 top-3 text-6xl font-extrabold tracking-tighter text-orange-500/[0.07]">{formatTwoDigits(index + 1)}</div>
                <span className="inline-flex rounded-full bg-orange-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.15em] text-orange-500">
                  {item.time}
                </span>
                <h3 className="mt-5 text-xl font-extrabold">{item.title}</h3>
                <p className={cx("mt-2 text-sm leading-6", muted)}>{item.copy}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------------------- BUILDING BLOCKS ---------------------- */}
        <Section id="building-blocks" alt isDarkMode={isDarkMode}>
          <SectionHeader
            id="building-blocks-title"
            eyebrow="Core toolkit"
            title="The building blocks that keep appearing in strong HLD answers"
            description="Instead of learning Redis, Kafka, databases and CDN as isolated definitions, the book connects them to the exact problem they solve inside a production design."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {buildingBlocks.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal
                  as="article"
                  key={item.title}
                  delay={(index % 4) * 0.06}
                  y={20}
                  className={cx("group rounded-[24px] border p-5 transition hover:-translate-y-1 hover:border-orange-400/60 hover:shadow-xl", panel)}
                >
                  <div className={cx("flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition duration-300 group-hover:-rotate-6 group-hover:scale-110", item.accent)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold">{item.title}</h3>
                  <p className={cx("mt-2 text-sm leading-6", muted)}>{item.copy}</p>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ------------------------------ ESTIMATOR -------------------------- */}
        <Section id="estimator" isDarkMode={isDarkMode}>
          <SectionHeader
            id="estimator-title"
            eyebrow="Try it yourself"
            title="Back-of-the-envelope estimator"
            description="Interviewers love when you put numbers on the whiteboard. Move the sliders and watch QPS and storage change — then see which design pattern the numbers point to."
            dark={isDarkMode}
          />
          <EstimatorDemo isDarkMode={isDarkMode} onBuy={handleBuyNow} canBuy={canBuy} />
        </Section>

        {/* ------------------------- CHAPTER COVERAGE ------------------------ */}
        <Section id="syllabus" alt isDarkMode={isDarkMode}>
          <SectionHeader
            id="syllabus-title"
            eyebrow="What the handbook actually teaches"
            title="From the first clarification question to production failure handling"
            description="The book is organized around the decisions you need to make in an interview. Each topic is tied to a real architecture problem rather than presented as an isolated definition."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {chapterCoverage.map((item, index) => {
              const tone = getTone(item.tone, isDarkMode);
              return (
                <Reveal
                  as="article"
                  key={item.number}
                  delay={(index % 2) * 0.08}
                  className={cx("relative overflow-hidden rounded-[28px] border p-6 sm:p-7", tone.border, tone.soft)}
                >
                  <div className={cx("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", tone.line)} />
                  <div className="flex items-start gap-4">
                    <div className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-extrabold text-white shadow-lg", tone.icon)}>
                      {item.number}
                    </div>
                    <div>
                      <p className={cx("text-xs font-extrabold uppercase tracking-[0.18em]", tone.text)}>{item.subtitle}</p>
                      <h3 className="mt-2 text-xl font-extrabold tracking-[-0.02em] sm:text-2xl">{item.title}</h3>
                    </div>
                  </div>

                  <p className={cx("mt-5 text-sm leading-7 sm:text-[15px]", isDarkMode ? "text-slate-300" : "text-slate-600")}>{item.description}</p>

                  <ul className="mt-5 grid gap-2.5">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <span className={cx("mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full", tone.chip)}>
                          <Check className="h-3.5 w-3.5" strokeWidth={3} />
                        </span>
                        <span className={cx("text-sm leading-6", muted)}>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* --------------------------- SCALE SNAPSHOTS ----------------------- */}
        <Section id="scale" isDarkMode={isDarkMode}>
          <SectionHeader
            id="scale-title"
            eyebrow="Scale changes the design"
            title="Numbers from the case studies, not generic architecture claims"
            description="The handbook uses concrete traffic and storage estimates so you can explain why a cache, partitioning strategy, connection model or consistency guarantee is actually needed."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {scaleSnapshots.map((item, index) => {
              const tone = getTone(item.tone, isDarkMode);
              return (
                <Reveal
                  as="article"
                  key={item.system}
                  delay={(index % 4) * 0.07}
                  className={cx("rounded-[26px] border p-5 transition hover:-translate-y-1 hover:shadow-xl", tone.border, tone.soft)}
                >
                  <p className={cx("text-xs font-extrabold uppercase tracking-[0.16em]", tone.text)}>{item.system}</p>
                  <div className="mt-3 text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl">{item.number}</div>
                  <p className={cx("mt-3 text-sm leading-6", muted)}>{item.detail}</p>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ------------------------ ARCHITECTURE DECISIONS ------------------- */}
        <Section id="decisions" alt isDarkMode={isDarkMode}>
          <SectionHeader
            id="decisions-title"
            eyebrow="Architecture decisions"
            title="Know why a component belongs in the diagram"
            description="A strong HLD answer is not a collection of logos. These cards summarize the decision logic repeated across the book."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {architectureDecisions.map((item, index) => {
              const tone = getTone(item.tone, isDarkMode);
              return (
                <Reveal
                  as="article"
                  key={item.title}
                  delay={(index % 3) * 0.07}
                  className={cx("rounded-[26px] border p-6 transition hover:-translate-y-1 hover:shadow-xl", tone.border, isDarkMode ? "bg-white/[0.025]" : "bg-white")}
                >
                  <div className={cx("h-1.5 w-16 rounded-full bg-gradient-to-r", tone.line)} />
                  <h3 className="mt-5 text-xl font-extrabold tracking-[-0.02em]">{item.title}</h3>
                  <p className={cx("mt-3 text-sm font-semibold leading-6", tone.text)}>{item.use}</p>
                  <p className={cx("mt-3 text-sm leading-7", muted)}>{item.reason}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.examples.map((example) => (
                      <span key={example} className={cx("rounded-full px-3 py-1.5 text-xs font-semibold", tone.chip)}>{example}</span>
                    ))}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ------------------------------ TRADE-OFFS ------------------------- */}
        <Section id="tradeoffs" isDarkMode={isDarkMode}>
          <SectionHeader
            id="tradeoffs-title"
            eyebrow="Trade-offs interviewers expect"
            title="The answer is usually ‘it depends’ — but you must explain what it depends on"
            description="The book repeatedly compares realistic alternatives and then ties the choice back to latency, correctness, cost, scale or product behavior."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {tradeoffCards.map((item, index) => {
              const tone = getTone(item.tone, isDarkMode);
              return (
                <Reveal
                  as="article"
                  key={item.title}
                  delay={(index % 2) * 0.08}
                  className={cx("rounded-[28px] border p-6 sm:p-7", tone.border, isDarkMode ? "bg-white/[0.025]" : "bg-white")}
                >
                  <div className="flex items-center gap-3">
                    <div className={cx("h-2.5 w-2.5 rounded-full bg-gradient-to-br", tone.icon)} />
                    <h3 className="text-xl font-extrabold tracking-[-0.02em]">{item.title}</h3>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className={cx("rounded-2xl border p-4 text-sm leading-6 transition hover:-translate-y-0.5", tone.border, tone.soft)}>{item.left}</div>
                    <div className={cx("rounded-2xl border p-4 text-sm leading-6 transition hover:-translate-y-0.5", tone.border, tone.soft)}>{item.right}</div>
                  </div>
                  <div className={cx("mt-4 rounded-2xl px-4 py-3 text-sm font-semibold", tone.chip)}>{item.takeaway}</div>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* --------------------------- CASE STUDIES -------------------------- */}
        <Section id="case-studies" alt isDarkMode={isDarkMode}>
          <SectionHeader
            id="case-studies-title"
            eyebrow="19 complete case studies"
            title="Practice the problems interviewers keep coming back to"
            description="All 19 use cases from the handbook are listed here. Filter by domain to find the problems closest to the company you are interviewing with."
            dark={isDarkMode}
          />
          <CaseExplorer isDarkMode={isDarkMode} />
        </Section>

        {/* ---------------------------- SPOTLIGHTS --------------------------- */}
        <Section id="spotlights" isDarkMode={isDarkMode}>
          <SectionHeader
            id="spotlights-title"
            eyebrow="Inside the hardest designs"
            title="Detailed case-study spotlights from the handbook"
            description="These are the parts that usually decide whether an HLD discussion stays superficial or becomes production-grade: routing, concurrency, idempotency, state transitions and recovery."
            dark={isDarkMode}
          />
          <SpotlightViewer isDarkMode={isDarkMode} />
        </Section>

        {/* -------------------------- PRODUCTION PATTERNS -------------------- */}
        <Section id="patterns" alt isDarkMode={isDarkMode}>
          <SectionHeader
            id="patterns-title"
            eyebrow="Production patterns repeated across the book"
            title="Patterns you can reuse when the interview problem changes"
            description="Instead of memorizing only named systems, learn the cross-cutting ideas that appear again and again in reliable distributed architectures."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productionPatterns.map((item, index) => {
              const tone = getTone(item.tone, isDarkMode);
              return (
                <Reveal
                  as="article"
                  key={item.title}
                  delay={(index % 3) * 0.06}
                  y={20}
                  className={cx("rounded-[24px] border p-5 transition hover:-translate-y-1 hover:shadow-lg", tone.border, tone.soft)}
                >
                  <div className={cx("h-1.5 w-12 rounded-full bg-gradient-to-r", tone.line)} />
                  <h3 className="mt-4 text-lg font-extrabold tracking-[-0.015em]">{item.title}</h3>
                  <p className={cx("mt-2 text-sm leading-6", muted)}>{item.copy}</p>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ------------------------------ DEEP DIVES ------------------------- */}
        <Section id="deep-dives" isDarkMode={isDarkMode}>
          <SectionHeader
            id="deep-dives-title"
            eyebrow="Production-level deep dives"
            title="The book goes beyond drawing boxes"
            description="The strongest HLD discussion happens after the diagram: collision handling, ordering, concurrency, idempotency, hot keys, failover and the trade-off between correctness and availability."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {deepDives.map((item, index) => {
              const palette = ["blue", "indigo", "cyan", "rose", "violet", "emerald"];
              const tone = getTone(palette[index % palette.length], isDarkMode);
              return (
                <Reveal
                  as="article"
                  key={item.title}
                  delay={(index % 2) * 0.08}
                  className={cx("rounded-[26px] border p-6 transition hover:-translate-y-1 hover:shadow-xl sm:p-7", tone.border, isDarkMode ? "bg-white/[0.025]" : "bg-white")}
                >
                  <p className={cx("text-xs font-extrabold uppercase tracking-[0.18em]", tone.text)}>{item.kicker}</p>
                  <h3 className="mt-3 text-2xl font-extrabold tracking-[-0.025em]">{item.title}</h3>
                  <p className={cx("mt-3 text-sm leading-7 sm:text-base", muted)}>{item.copy}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.chips.map((chip) => (
                      <span key={chip} className={cx("rounded-full px-3 py-1.5 text-xs font-semibold", tone.chip)}>{chip}</span>
                    ))}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ------------------------------ AUDIENCE --------------------------- */}
        <Section id="audience" alt isDarkMode={isDarkMode}>
          <SectionHeader
            id="audience-title"
            eyebrow="Who this is for"
            title="Built for engineers who want a system, not another list of buzzwords"
            description="The content is designed around interview reasoning and production trade-offs, with enough repetition in structure to make revision fast."
            dark={isDarkMode}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {audience.map((item, index) => (
              <Reveal
                as="article"
                key={item.title}
                delay={index * 0.07}
                className={cx("rounded-[24px] border p-6 transition hover:-translate-y-1 hover:shadow-xl", panel)}
              >
                <span className="text-sm font-extrabold text-orange-500">0{index + 1}</span>
                <h3 className="mt-4 text-xl font-extrabold">{item.title}</h3>
                <p className={cx("mt-3 text-sm leading-6", muted)}>{item.copy}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------------------- OFFER / VALUE ------------------------ */}
        <Section id="offer" isDarkMode={isDarkMode}>
          <div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
            <div>
              <SectionHeader
                id="offer-title"
                eyebrow="Everything in the ebook"
                title="What you get when you buy the HLD handbook"
                dark={isDarkMode}
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {valueStack.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Reveal
                      key={item.title}
                      delay={(index % 2) * 0.07}
                      y={18}
                      className={cx("flex items-start gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:border-orange-400/60", panel)}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-md">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-extrabold">{item.title}</span>
                        <span className={cx("mt-1 block text-xs leading-5", muted)}>{item.copy}</span>
                      </span>
                    </Reveal>
                  );
                })}
              </div>
            </div>

            <Reveal
              delay={0.1}
              className={cx(
                "relative overflow-hidden rounded-[30px] border p-6 shadow-2xl shadow-orange-500/10 lg:sticky lg:top-24",
                isDarkMode ? "border-orange-400/30 bg-[#1b1613]" : "border-orange-200 bg-white"
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600" />
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-orange-500">Digital PDF ebook</p>
              <h3 className="mt-2 text-xl font-extrabold leading-tight">{productName}</h3>
              <div className="mt-5 flex flex-wrap items-end gap-3">
                <span className="text-4xl font-extrabold tracking-tight">{priceText}</span>
                {mrp > currentPrice && (
                  <span className={cx("pb-1 text-base font-bold line-through", isDarkMode ? "text-slate-500" : "text-slate-400")}>{formatMoney(mrp)}</span>
                )}
                {discount > 0 && (
                  <span className="mb-1 rounded-full bg-orange-500/12 px-3 py-1 text-xs font-extrabold text-orange-500">{discount}% OFF</span>
                )}
              </div>
              {savingsAmount > 0 && (
                <p className="mt-2 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">You save {formatMoney(savingsAmount)}</p>
              )}
              <button type="button" onClick={handleBuyNow} disabled={!canBuy} className={cx(ctaPrimary, "mt-5 w-full")}>
                Get the ebook
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={openBookPreview}
                className={cx(
                  "mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:-translate-y-0.5",
                  isDarkMode ? "border-white/10 text-white hover:bg-white/5" : "border-orange-200 text-orange-700 hover:bg-orange-50"
                )}
              >
                <BookOpen className="h-4 w-4" />
                Read free sample pages first
              </button>
              <ul className={cx("mt-5 space-y-2 text-xs font-semibold", muted)}>
                <li className="flex items-center gap-2"><Download className="h-4 w-4 text-orange-500" /> Instant access after successful payment</li>
                <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-orange-500" /> Secure checkout via PayU</li>
                <li className="flex items-center gap-2"><FileText className="h-4 w-4 text-orange-500" /> Digital PDF — non-refundable after payment</li>
              </ul>
            </Reveal>
          </div>
        </Section>

        {/* ------------------------------ LLD PROMO -------------------------- */}
        <section
          id="lld-book"
          className={cx(
            "relative overflow-hidden border-y py-12 sm:py-14 lg:py-16",
            isDarkMode ? "border-white/10 bg-[#081326]" : "border-[#d9e4ef] bg-[#f8fafc]"
          )}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className={cx("hld-orb absolute -left-14 top-0 h-44 w-44 rounded-full blur-3xl", isDarkMode ? "bg-[#2b66a8]/10" : "bg-[#dcecf8]/80")} />
            <div className={cx("hld-orb hld-orb-2 absolute -right-10 bottom-0 h-44 w-44 rounded-full blur-3xl", isDarkMode ? "bg-[#8b6bb8]/10" : "bg-[#eee7f6]/85")} />
          </div>

          <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
            <Reveal className="mx-auto max-w-xl text-center">
              <p className={cx("text-[11px] font-extrabold uppercase tracking-[0.18em]", isDarkMode ? "text-[#9bc0ea]" : "text-[#2b66a8]")}>
                Also prepare Low-Level Design
              </p>
              <h2 className={cx("hld-display mt-2 text-2xl font-extrabold leading-tight tracking-[-0.035em] sm:text-[2rem]", isDarkMode ? "text-white" : "text-[#17223a]")}>
                Continue with the Java-first LLD handbook
              </h2>
              <p className={cx("mx-auto mt-2 max-w-lg text-sm leading-6", isDarkMode ? "text-slate-400" : "text-[#68778b]")}>
                Object modelling, OOP, SOLID, patterns and complete interview
                problems — in the same interview-first style.
              </p>
            </Reveal>

            {loadingLldProduct && (
              <div className={cx("mx-auto mt-7 grid w-full max-w-[760px] gap-4 rounded-[24px] border p-4 shadow-[0_16px_45px_rgba(24,56,96,.08)] sm:grid-cols-[150px_minmax(0,1fr)]", isDarkMode ? "border-white/10 bg-[#0d1b32]" : "border-[#cad9e8] bg-white")}>
                <div className={cx("mx-auto aspect-[0.72] w-full max-w-[145px] animate-pulse rounded-[16px]", isDarkMode ? "bg-white/[0.06]" : "bg-[#e7f0f8]")} />
                <div className="flex flex-col justify-center">
                  <div className={cx("h-4 w-32 animate-pulse rounded-full", isDarkMode ? "bg-white/[0.06]" : "bg-[#e7f0f8]")} />
                  <div className={cx("mt-3 h-7 w-full max-w-sm animate-pulse rounded-lg", isDarkMode ? "bg-white/[0.06]" : "bg-[#edf2f7]")} />
                  <div className={cx("mt-3 h-14 w-full animate-pulse rounded-xl", isDarkMode ? "bg-white/[0.05]" : "bg-[#f2f5f8]")} />
                  <div className="mt-4 flex gap-2">
                    <div className="h-10 w-28 animate-pulse rounded-xl bg-[#2b66a8]/20" />
                    <div className={cx("h-10 w-28 animate-pulse rounded-xl", isDarkMode ? "bg-white/[0.05]" : "bg-[#eef2f6]")} />
                  </div>
                </div>
              </div>
            )}

            {!loadingLldProduct && lldProduct && (
              <Reveal
                as="article"
                delay={0.05}
                className={cx(
                  "mx-auto mt-7 w-full max-w-[760px] overflow-hidden rounded-[24px] border shadow-[0_18px_50px_rgba(30,64,110,.10)] transition hover:-translate-y-1",
                  isDarkMode ? "border-[#35577f]/35 bg-[#0d1b32]" : "border-[#c8d8e8] bg-white"
                )}
              >
                <div className="grid sm:grid-cols-[175px_minmax(0,1fr)]">
                  <div className={cx("relative flex min-h-[245px] items-center justify-center overflow-hidden border-b p-4 sm:border-b-0 sm:border-r", isDarkMode ? "border-white/10 bg-[#112442]" : "border-[#d4e1ed] bg-[#eaf3fa]")}>
                    <div className={cx("absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.13em]", isDarkMode ? "border-[#6b91bd]/30 bg-[#2b66a8]/12 text-[#a8c8ea]" : "border-[#bcd1e3] bg-white/90 text-[#2b66a8]")}>
                      Java-first LLD
                    </div>
                    <span className={cx("absolute -left-7 bottom-5 h-20 w-20 rounded-full blur-2xl", isDarkMode ? "bg-[#78ad83]/10" : "bg-[#dfeee2]")} />
                    <span className={cx("absolute -right-7 top-10 h-20 w-20 rounded-full blur-2xl", isDarkMode ? "bg-[#e2ad62]/10" : "bg-[#f7ead7]")} />

                    {lldCover ? (
                      <img
                        src={lldCover}
                        alt={`${lldTitle} ebook cover`}
                        loading="lazy"
                        decoding="async"
                        className="relative z-10 max-h-[205px] w-auto max-w-[135px] rounded-[10px] object-contain shadow-[0_14px_30px_rgba(15,23,42,.18)] ring-1 ring-black/5"
                      />
                    ) : (
                      <div className="relative z-10 flex aspect-[0.72] w-full max-w-[135px] flex-col justify-between rounded-[12px] bg-[#244f88] p-4 text-white shadow-xl">
                        <div>
                          <p className="text-[7px] font-extrabold uppercase tracking-[0.16em] text-[#cadcf0]">The Java Interview Guide</p>
                          <p className="mt-4 text-xl font-extrabold leading-[1.05] tracking-[-0.035em]">
                            Master<br />System<br />Design
                          </p>
                        </div>
                        <p className="text-[9px] font-bold text-[#d9e6f5]">LLD • Java</p>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={cx("rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em]", isDarkMode ? "border-[#5f86b2]/25 bg-[#2b66a8]/10 text-[#a6c7ea]" : "border-[#bed1e4] bg-[#e7f1f9] text-[#2b66a8]")}>LLD</span>
                      <span className={cx("rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.1em]", isDarkMode ? "border-[#78ad83]/25 bg-[#78ad83]/10 text-[#a9d3b1]" : "border-[#c9e0ce] bg-[#e9f5eb] text-[#477d52]")}>Java</span>
                      {lldDiscount > 0 && (
                        <span className={cx("rounded-full border px-2.5 py-1 text-[9px] font-extrabold", isDarkMode ? "border-[#e2ad62]/25 bg-[#e2ad62]/10 text-[#f0c98e]" : "border-[#efd7b2] bg-[#fff0dc] text-[#9c651f]")}>
                          {lldDiscount}% OFF
                        </span>
                      )}
                    </div>

                    <h3 className={cx("mt-3 text-xl font-extrabold leading-tight tracking-[-0.035em] sm:text-[1.45rem]", isDarkMode ? "text-white" : "text-[#17223a]")}>
                      {lldTitle}
                    </h3>
                    <p className={cx("mt-1 text-xs font-bold sm:text-sm", isDarkMode ? "text-[#9bc0ea]" : "text-[#2b66a8]")}>{lldSubtitle}</p>
                    <p className={cx("mt-2 line-clamp-2 text-xs leading-5 sm:text-sm", isDarkMode ? "text-slate-400" : "text-[#68778b]")}>{lldDescription}</p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {[
                        { label: "Object modelling", light: "border-[#bcd4e8] bg-[#e9f3fa] text-[#285f95]", dark: "border-[#4773a1]/25 bg-[#2b66a8]/10 text-[#a9c8e8]" },
                        { label: "OOP + SOLID", light: "border-[#cae1ce] bg-[#ebf6ed] text-[#477d52]", dark: "border-[#78ad83]/25 bg-[#78ad83]/10 text-[#acd5b4]" },
                        { label: "Design patterns", light: "border-[#efd8b8] bg-[#fff2df] text-[#9d6621]", dark: "border-[#e2ad62]/25 bg-[#e2ad62]/10 text-[#efc98f]" },
                        { label: "LLD problems", light: "border-[#ddd2eb] bg-[#f3eff8] text-[#6d58a0]", dark: "border-[#8b6bb8]/25 bg-[#8b6bb8]/10 text-[#c8bae0]" },
                      ].map((item) => (
                        <div key={item.label} className={cx("flex min-h-[38px] items-center gap-2 rounded-[11px] border px-2.5 py-2", isDarkMode ? item.dark : item.light)}>
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          <span className="text-[11px] font-bold leading-4 sm:text-xs">{item.label}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {lldMetaItems.slice(0, 2).map((item) => (
                        <span key={item} className={cx("rounded-full border px-2.5 py-1 text-[9px] font-semibold", isDarkMode ? "border-white/10 bg-white/[0.04] text-slate-400" : "border-[#dce4ec] bg-[#f7f9fb] text-[#6e7d90]")}>
                          {item}
                        </span>
                      ))}
                      {lldCategoryPills.slice(0, 2).map((category) => (
                        <span key={category} className={cx("rounded-full border px-2.5 py-1 text-[9px] font-semibold", isDarkMode ? "border-[#8b6bb8]/25 bg-[#8b6bb8]/10 text-[#c8bae0]" : "border-[#ddd2eb] bg-[#f3eff8] text-[#6d58a0]")}>
                          {category}
                        </span>
                      ))}
                    </div>

                    <div className={cx("mt-4 rounded-[14px] border p-3", isDarkMode ? "border-[#466789]/30 bg-[#10223d]" : "border-[#d2dfeb] bg-[#f7fafc]")}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className={cx("text-[8px] font-extrabold uppercase tracking-[0.14em]", isDarkMode ? "text-slate-500" : "text-[#7b8999]")}>Ebook price</p>
                          <div className="mt-1 flex items-end gap-2">
                            <span className={cx("text-xl font-extrabold tracking-[-0.035em]", isDarkMode ? "text-white" : "text-[#17223a]")}>
                              {formatMoney(lldCurrentPrice, lldCurrency)}
                            </span>
                            {lldMrp > lldCurrentPrice && (
                              <span className={cx("pb-0.5 text-[10px] font-bold line-through", isDarkMode ? "text-slate-600" : "text-[#95a0ad]")}>
                                {formatMoney(lldMrp, lldCurrency)}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={cx("rounded-full border px-2.5 py-1 text-[9px] font-semibold", isDarkMode ? "border-[#8fb0d3]/15 bg-[#2b66a8]/8 text-[#a8c7e7]" : "border-[#cad9e8] bg-[#eaf3fa] text-[#426b94]")}>
                          Digital PDF
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleLldBuyNow}
                          disabled={!lldProduct?._id}
                          className="group inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[11px] bg-[#2b66a8] px-3 text-[11px] font-extrabold text-white shadow-[0_7px_16px_rgba(43,102,168,.20)] transition hover:-translate-y-0.5 hover:bg-[#24598f] disabled:cursor-not-allowed disabled:opacity-60 sm:text-xs"
                        >
                          Buy LLD
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </button>
                        <a
                          href={LLD_REDIRECT_URL}
                          className={cx(
                            "group inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-[11px] border px-3 text-[11px] font-extrabold transition hover:-translate-y-0.5 sm:text-xs",
                            isDarkMode ? "border-[#6b86a5]/30 bg-[#172941] text-[#b4cde8] hover:bg-[#1b304d]" : "border-[#c5d5e5] bg-white text-[#2b66a8] hover:bg-[#eef5fa]"
                          )}
                        >
                          See details
                          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            )}

            {!loadingLldProduct && !lldProduct && (
              <div className={cx("mx-auto mt-7 w-full max-w-[680px] rounded-[20px] border p-4 shadow-sm", isDarkMode ? "border-[#45668d]/30 bg-[#0d1b32]" : "border-[#cedbea] bg-white")}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className={cx("text-sm font-extrabold", isDarkMode ? "text-white" : "text-[#17223a]")}>Explore the Java LLD handbook</p>
                    <p className={cx("mt-1 text-xs leading-5", isDarkMode ? "text-slate-400" : "text-[#68778b]")}>
                      {lldProductError || "Live LLD product details could not be loaded right now."}
                    </p>
                  </div>
                  <a
                    href={LLD_REDIRECT_URL}
                    className="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-1.5 rounded-[11px] bg-[#2b66a8] px-3.5 text-[11px] font-extrabold text-white shadow-[0_7px_16px_rgba(43,102,168,.18)] transition hover:bg-[#24598f]"
                  >
                    See LLD details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------- FAQ ------------------------------ */}
        <Section id="faq" narrow isDarkMode={isDarkMode}>
          <SectionHeader
            id="faq-title"
            eyebrow="FAQ"
            title="Before you get the HLD handbook"
            description="Quick answers about system design HLD, the format, preview and what is covered."
            dark={isDarkMode}
          />

          <div className="mt-10 space-y-3">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <Reveal
                  as="article"
                  key={item.q}
                  y={16}
                  delay={Math.min(index, 4) * 0.04}
                  className={cx(
                    "overflow-hidden rounded-[22px] border transition-colors",
                    panel,
                    isOpen && "border-orange-400/60"
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-6"
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      id={`faq-question-${index}`}
                    >
                      <span className="font-extrabold sm:text-lg">{item.q}</span>
                      <ChevronDown className={cx("h-5 w-5 shrink-0 text-orange-500 transition-transform duration-300", isOpen && "rotate-180")} />
                    </button>
                  </h3>
                  {/* Answers stay in the DOM (crawlable) and animate open via grid rows. */}
                  <div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    className={cx(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className={cx("border-t px-5 py-5 text-sm leading-7 sm:px-6 sm:text-base", isDarkMode ? "border-white/10 text-slate-400" : "border-slate-200 text-slate-600")}>
                        {item.a}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ------------------------------ FINAL CTA -------------------------- */}
        <section aria-labelledby="final-cta-title" className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
          <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-gradient-to-br from-orange-700 via-orange-600 to-amber-500 p-7 text-white shadow-2xl shadow-orange-600/25 sm:p-10 lg:p-14">
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="hld-orb absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
              <div className="hld-orb hld-orb-2 absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />
            </div>
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em]">
                  <Rocket className="h-4 w-4" />
                  Interview-ready HLD revision
                </div>
                <h2 id="final-cta-title" className="mt-5 max-w-3xl text-3xl font-extrabold tracking-[-0.035em] sm:text-4xl lg:text-5xl">
                  Build the habit of explaining why your architecture works.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-orange-50 sm:text-base">
                  19 complete designs, one consistent method, and the production trade-offs interviewers expect you to discuss after the first diagram.
                </p>
              </div>

              <div className="min-w-[240px] rounded-[24px] bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-extrabold">{priceText}</span>
                  {mrp > currentPrice && (
                    <span className="pb-1 text-sm font-bold text-orange-100 line-through">{formatMoney(mrp)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  className="hld-shimmer relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-[18px] bg-white px-5 py-4 font-extrabold text-orange-700 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Get the ebook
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={openBookPreview}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-bold text-orange-50 underline-offset-4 hover:underline"
                >
                  Or read the free sample first
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className={cx("border-t px-4 py-8 text-center text-xs leading-6", isDarkMode ? "border-white/10 bg-[#111111] text-slate-500" : "border-slate-200 bg-white text-slate-500")}>
        <p>Mastering System Design — High-Level Design • Digital PDF ebook • Non-refundable digital product</p>
        <p className="mt-1">
          Support:{" "}
          <a className="font-bold transition hover:text-orange-500" href="mailto:supporttargettrek@gmail.com">
            supporttargettrek@gmail.com
          </a>
        </p>
        <p className="mt-3 space-x-3">
          <a className="font-semibold transition hover:text-orange-500" href={LLD_REDIRECT_URL}>System Design LLD (Java)</a>
          <a className="font-semibold transition hover:text-orange-500" href={COMBO_REDIRECT_URL}>HLD + LLD Combo</a>
          <a className="font-semibold transition hover:text-orange-500" href="/books">All books</a>
        </p>
      </footer>

      {/* Sticky buy bar: one responsive card. Mobile = docked full-width strip,
          tablet = centered card, desktop = wider card with a secondary action.
          On md+ it appears only after the hero CTA scrolls out of view. */}
      <div
        className={cx(
          "pointer-events-none fixed inset-x-0 bottom-0 z-[80] flex justify-center px-2.5 pb-[max(10px,env(safe-area-inset-bottom))] transition-all duration-300 sm:px-4 md:pb-5",
          (isCheckoutOpen || (heroVisible && !loadingProduct)) && "md:translate-y-10 md:opacity-0",
          isCheckoutOpen && "max-md:translate-y-24 max-md:opacity-0"
        )}
      >
        <div
          className={cx(
            "pointer-events-auto grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 rounded-[20px] border p-2.5 shadow-[0_-10px_45px_rgba(15,23,42,.18)] backdrop-blur-xl",
            "sm:max-w-xl sm:gap-4 sm:rounded-[22px] sm:p-3",
            "md:max-w-2xl md:rounded-2xl md:py-3 md:pl-5 md:pr-3",
            "lg:max-w-3xl lg:gap-6 xl:max-w-4xl 2xl:max-w-5xl",
            isDarkMode ? "border-white/10 bg-[#191919]/95" : "border-orange-200 bg-white/95"
          )}
        >
          <div className="min-w-0 pl-1">
            <p className={cx("hidden truncate text-sm font-extrabold leading-tight sm:block lg:text-base", isDarkMode ? "text-white" : "text-slate-900")}>
              Mastering System Design — HLD
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 sm:mt-1">
              <span className="text-lg font-extrabold leading-none text-orange-500 sm:text-base lg:text-lg">{priceText}</span>
              {mrp > currentPrice && (
                <span className={cx("text-xs font-bold line-through", isDarkMode ? "text-slate-500" : "text-slate-400")}>{formatMoney(mrp)}</span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-extrabold text-orange-500">{discount}% off</span>
              )}
            </div>
            <p className={cx("mt-1 truncate text-[11px] font-bold sm:hidden", isDarkMode ? "text-slate-400" : "text-[#737373]")}>
              Mastering System Design — HLD
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openBookPreview}
              className={cx(
                "hidden min-h-[46px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:-translate-y-0.5 lg:inline-flex",
                isDarkMode ? "border-white/10 text-white hover:bg-white/5" : "border-orange-200 text-orange-700 hover:bg-orange-50"
              )}
            >
              <BookOpen className="h-4 w-4" />
              Free sample
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canBuy}
              className={cx(ctaPrimary, "hld-pulse min-h-[50px] px-4 text-[13px] sm:min-h-[48px] sm:px-6 sm:text-sm md:hld-no-pulse")}
            >
              Get the ebook
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      <PayUCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        product={checkoutProduct || product}
      />
    </div>
  );
}

export default SystemDesignHLD;
