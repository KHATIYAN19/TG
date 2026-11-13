import API_BASE_URL from "../utils/Url";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { trackViewContent } from "../lib/metaPixel.js";
import { Helmet } from "react-helmet-async";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowsClockwise,
  BookOpen,
  Broadcast,
  CaretDown,
  Check,
  CheckCircle,
  Cloud,
  Cube,
  Database,
  DownloadSimple,
  FileText,
  FlowArrow,
  Gauge,
  GitBranch,
  Globe,
  HardDrives,
  Lightning,
  Lock,
  LockKey,
  MagnifyingGlass,
  Moon,
  Network,
  Plus,
  Pulse,
  ShieldCheck,
  Stack,
  Sun,
  Target,
  Timer,
  TrendUp,
  XCircle,
} from "@phosphor-icons/react";
import { pdfjs } from "react-pdf";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import HLD_PREVIEW_PDF from "../assest/master_hld_preview.pdf";
import "./SystemDesignHLD.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";
const BASE_URL = API_BASE_URL;
const THEME_STORAGE_KEY = "theme";
// Same source the checkout modal uses: VITE_BOOKS_PAYMENT_GATEWAY, then
// VITE_PAYMENT_GATEWAY, then the default gateway.
const PAYMENT_PROVIDER_NAME = gatewayLabel(preferredGateway("books"));
const SECURE_CHECKOUT_TEXT = `Secure checkout via ${PAYMENT_PROVIDER_NAME}`;
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
  },
  {
    title: "Load Balancing",
    icon: FlowArrow,
    copy: "L4/L7 routing, health checks, horizontal scale and failure isolation.",
  },
  {
    title: "Redis",
    icon: Lightning,
    copy: "Cache, counters, TTLs, geo indexes, sorted sets, dedupe keys and locks.",
  },
  {
    title: "Kafka",
    icon: Broadcast,
    copy: "Durable async backbone, replay, decoupling, partition ordering and burst absorption.",
  },
  {
    title: "CDC",
    icon: ArrowsClockwise,
    copy: "Stream database changes to search, caches and analytics without unsafe dual writes.",
  },
  {
    title: "Elasticsearch",
    icon: MagnifyingGlass,
    copy: "Full-text search, faceting, autocomplete support and read-optimized search indexes.",
  },
  {
    title: "Object Store + CDN",
    icon: Cloud,
    copy: "Store large media blobs and deliver static/video content close to users.",
  },
  {
    title: "SQL Databases",
    icon: Database,
    copy: "Transactions, relational integrity, locking, indexes and strongly consistent workflows.",
  },
  {
    title: "NoSQL Databases",
    icon: HardDrives,
    copy: "Horizontal scale for key-based, write-heavy and extremely large access patterns.",
  },
  {
    title: "Sharding",
    icon: GitBranch,
    copy: "Partition data by user, region, city, key-range or hash while controlling hot partitions.",
  },
  {
    title: "Replication",
    icon: Stack,
    copy: "Read scale, redundancy, failover, RPO/RTO choices and sync vs async replicas.",
  },
  {
    title: "Rate Limiting",
    icon: Gauge,
    copy: "Token bucket, fixed/sliding windows, Redis atomicity and per-tenant policy enforcement.",
  },
  {
    title: "Distributed Coordination",
    icon: LockKey,
    copy: "Leases, locks, compare-and-set, leader election and correctness under concurrency.",
  },
  {
    title: "Service Architecture",
    icon: Cube,
    copy: "Service boundaries, synchronous RPC, asynchronous events and graceful degradation.",
  },
  {
    title: "Observability",
    icon: Pulse,
    copy: "Logs, metrics, tracing, queue lag, error rate and latency SLOs for production systems.",
  },
  {
    title: "Security + Reliability",
    icon: ShieldCheck,
    copy: "AuthN/AuthZ, secrets, encryption, retries, circuit breakers and idempotent operations.",
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

/* ------------------------------------------------------------------ */
/*  Shared presentation constants                                      */
/* ------------------------------------------------------------------ */

const EASE = [0.22, 1, 0.36, 1];
const FLOAT_EASE = [0.37, 0, 0.63, 1];

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@500;600&display=swap";

// Every section the page can jump to. `primary` links also show in the
// compact desktop bar (the bar is hidden below the lg breakpoint).
const NAV_LINKS = [
  { href: "#book-preview", label: "Free preview", primary: true },
  { href: "#what-is-hld", label: "What is HLD" },
  { href: "#framework", label: "Framework", primary: true },
  { href: "#request-flow", label: "Request flow" },
  { href: "#playbook", label: "45 minute plan", primary: true },
  { href: "#estimator", label: "Estimator", primary: true },
  { href: "#case-studies", label: "Case studies", primary: true },
  { href: "#spotlights", label: "Deep dives" },
  { href: "#offer", label: "What you get", primary: true },
  { href: "#faq", label: "FAQ", primary: true },
];

const TAGLINE =
  "Interviewers do not grade the diagram. They grade the reasoning behind every box you draw. This book trains that reasoning on 19 real systems.";

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
  { icon: Cube, title: "16 core building-block primers", copy: "Redis, Kafka, CDC, sharding and more — tied to the problem they solve." },
  { icon: TrendUp, title: "Back-of-envelope numbers", copy: "Concrete QPS, storage and bandwidth estimates for every system." },
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
    icon: Cube,
    copy: "Stateless services scale horizontally behind a load balancer. Optional features degrade first when a dependency is slow.",
  },
  {
    id: "cache",
    label: "Redis cache",
    icon: Lightning,
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
    icon: Broadcast,
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

/* ------------------------------------------------------------------ */
/*  Motion + layout building blocks                                    */
/* ------------------------------------------------------------------ */

// Entrance wrapper. Hover effects live on the child (CSS), so the inline
// transform framer-motion leaves behind never fights a hover lift.
function Reveal({ children, delay = 0, y = 32, className, as = "div", ...rest }) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function Section({ id, alt = false, narrow = false, labelledBy, children }) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx("py-16 lg:py-24", alt ? "bg-alt" : "bg-base")}
    >
      <div className={cx("mx-auto px-4 sm:px-6 lg:px-8", narrow ? "max-w-3xl" : "max-w-6xl")}>
        {children}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, description, align = "left", id }) {
  return (
    <Reveal className={cx("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className="eyebrow caption-3">{eyebrow}</p>
      <h2 id={id} className="heading-2 t1 mt-3">
        {title}
      </h2>
      {description && <p className="body-3 t2 mt-4">{description}</p>}
    </Reveal>
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
      ease: EASE,
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
      className="progress fixed inset-x-0 top-0 z-[95] h-0.5 origin-left"
      style={{ scaleX }}
    />
  );
}

function ThemeToggle({ theme, onToggle }) {
  const dark = theme === "dark";
  const reduce = useReducedMotion();

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="icon-btn focusable"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          className="flex"
          initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -60, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 60, scale: 0.7 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {dark ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function TiltBook({ children }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 150, damping: 18 });
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
        transition={{ duration: 5, repeat: Infinity, ease: FLOAT_EASE }}
      >
        <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}

// Small label that drifts next to the hero book.
function FloatChip({ className, delay = 0, children }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cx("glass absolute z-10 rounded-xl px-3 py-2", className)}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
      animate={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, scale: 1, y: [0, -8, 0] }
      }
      transition={
        reduce
          ? { duration: 0.5, delay }
          : {
              opacity: { duration: 0.6, ease: EASE, delay },
              scale: { duration: 0.6, ease: EASE, delay },
              y: { duration: 6, repeat: Infinity, ease: FLOAT_EASE, delay },
            }
      }
    >
      {children}
    </motion.div>
  );
}

function RotatingPrompt() {
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
    <p className="bd bg-s1 inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-full px-4 py-2">
      <span className="pulse-dot" aria-hidden="true" />
      <span className="caption-3 t3 uppercase tracking-wider">Interview prompt</span>
      <span className="body-5 t1" aria-live="off">
        Design{" "}
        <span className="relative inline-flex h-5 overflow-hidden align-bottom">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={rotatingPrompts[index]}
              initial={reduce ? false : { y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: "-100%", opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="ta whitespace-nowrap font-semibold"
            >
              {rotatingPrompts[index]}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
    </p>
  );
}

// Large type statement whose words light up one at a time as it scrolls in.
function TaglineReveal({ text }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const words = useMemo(() => text.split(" "), [text]);
  const [count, setCount] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const next = Math.round(latest * words.length);
    setCount((current) => (next > current ? next : current));
  });

  return (
    <section className="bg-base relative py-20 lg:py-24" aria-label="Why this book works">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p ref={ref} className="heading-2 t1 mx-auto max-w-[680px] text-center" aria-label={text}>
          {words.map((word, index) => (
            <span
              key={`${word}-${index}`}
              aria-hidden="true"
              className="word"
              data-on={reduce || index < count ? "true" : "false"}
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}

function RequestFlowDemo() {
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
    <Reveal className="mt-10">
      <div className="card rounded-3xl p-4 sm:p-6 lg:p-8">
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
                  className="stage focusable flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left lg:w-28 lg:flex-col lg:gap-2 lg:px-2 lg:py-4 lg:text-center"
                >
                  <span className="tile h-10 w-10 rounded-lg">
                    <Icon size={20} weight="duotone" />
                  </span>
                  <span className="body-4">{item.label}</span>
                </button>
                {index < flowStages.length - 1 && (
                  <span aria-hidden="true" className="conn">
                    <b style={{ animationDelay: `${index * 0.35}s` }} />
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="bg-s2 mt-6 min-h-24 rounded-2xl p-4 sm:p-6" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stage.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <p className="eyebrow caption-3">
                <span className="mono">Step {active + 1}</span> · {stage.label}
              </p>
              <p className="body-3 t2 mt-2">{stage.copy}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      <p className="caption-2 t3 mt-4 text-center">
        Select any stage to pause the animation. Every case study in the book walks this path for its own system.
      </p>
    </Reveal>
  );
}

function EstimatorDemo({ onBuy, canBuy }) {
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
      ? "Extremely read heavy. Put a CDN and a Redis cache in front, keep the read path tiny and push analytics to a queue."
      : ratio >= 5
      ? "Read heavy. Cache aside with Redis, read replicas and a cache hit target above 90% will carry most traffic."
      : ratio >= 2
      ? "Balanced. Partition by a good key, batch writes and watch replication lag."
      : "Write heavy. Favour an append friendly store such as an LSM or wide column database, partition aggressively and absorb bursts with Kafka.";

  const sliders = [
    { id: "est-dau", label: "Daily active users", value: dau, set: setDau, min: 1, max: 500, step: 1, text: `${dau}M` },
    { id: "est-actions", label: "Requests per user per day", value: actions, set: setActions, min: 1, max: 100, step: 1, text: String(actions) },
    { id: "est-peak", label: "Peak to average multiplier", value: peak, set: setPeak, min: 1, max: 10, step: 1, text: `${peak}×` },
    { id: "est-ratio", label: "Read to write ratio", value: ratio, set: setRatio, min: 1, max: 100, step: 1, text: `${ratio}:1` },
    { id: "est-bytes", label: "Bytes per stored record", value: bytes, set: setBytes, min: 100, max: 5000, step: 100, text: `${bytes} B` },
  ];

  const results = [
    ["Average QPS", fmtCompact(avgQps)],
    ["Peak QPS", fmtCompact(peakQps)],
    ["Peak reads per second", fmtCompact(peakReads)],
    ["Peak writes per second", fmtCompact(peakWrites)],
    ["New storage per day", fmtStorage(storagePerDayGb)],
    ["Storage over 5 years", fmtStorage(storageFiveYearGb)],
  ];

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-2">
      <Reveal>
        <div className="card h-full rounded-3xl p-6 sm:p-8">
          <div className="space-y-6">
            {sliders.map((item) => (
              <div key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor={item.id} className="body-5 t1">
                    {item.label}
                  </label>
                  <span className="chip chip-accent caption-3 mono">{item.text}</span>
                </div>
                <input
                  id={item.id}
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={item.step}
                  value={item.value}
                  onChange={(event) => item.set(Number(event.target.value))}
                  className="mt-3"
                />
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="card flex h-full flex-col rounded-3xl p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-3">
            {results.map(([label, value]) => (
              <div key={label} className="bg-s2 overflow-hidden rounded-xl p-4">
                <p className="caption-4 t3">{label}</p>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={value}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="heading-5 mono ta mt-1"
                  >
                    {value}
                  </motion.p>
                </AnimatePresence>
              </div>
            ))}
          </div>

          <p className="bd body-6 t2 mt-6 rounded-xl p-4">
            <span className="ta font-semibold">Design hint. </span>
            {insight}
          </p>

          <div className="mt-auto pt-6">
            <p className="body-6 t2">
              The book runs this exact estimation for a URL shortener, messaging, ride hailing, video, payments and 14 more systems.
            </p>
            <button type="button" onClick={onBuy} disabled={!canBuy} className="btn btn-primary button-md mt-4 w-full">
              See all 19 worked estimates
              <ArrowRight className="arrow" size={18} weight="bold" />
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function CaseExplorer() {
  const [filter, setFilter] = useState("All");
  const reduce = useReducedMotion();

  const items = caseStudies.map((item) => ({
    ...item,
    category: CASE_CATEGORY[item.number],
  }));
  const visible = filter === "All" ? items : items.filter((item) => item.category === filter);

  return (
    <>
      <Reveal
        className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
        role="group"
        aria-label="Filter case studies"
      >
        {caseFilters.map((name) => {
          const count = name === "All" ? items.length : items.filter((item) => item.category === name).length;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={filter === name}
              onClick={() => setFilter(name)}
              className="pill focusable button-sm shrink-0"
            >
              {name} <span className="mono opacity-70">{count}</span>
            </button>
          );
        })}
      </Reveal>

      <motion.div layout={!reduce} className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((item) => (
            <motion.div
              key={item.number}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <article className="card lift flex h-full flex-col rounded-3xl p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="num caption-3 mono uppercase tracking-wider">Case {item.number}</span>
                  <ArrowUpRight className="peek" size={18} weight="bold" aria-hidden="true" />
                </div>
                <h3 className="heading-6 t1 mt-4">Design {item.title}</h3>
                <p className="body-5 ta mt-1">{item.subtitle}</p>
                <p className="body-6 t2 mt-3">{item.summary}</p>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  {item.tags.map((tag) => (
                    <span key={tag} className="chip caption-4">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

function SpotlightViewer() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const item = caseStudySpotlights[index];

  return (
    <div className="mt-10">
      <Reveal
        className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0"
        role="tablist"
        aria-label="Case study deep dives"
      >
        {caseStudySpotlights.map((spot, spotIndex) => (
          <button
            key={spot.caseNo}
            type="button"
            role="tab"
            aria-selected={spotIndex === index}
            onClick={() => setIndex(spotIndex)}
            className="pill focusable button-sm shrink-0"
          >
            {spot.title}
          </button>
        ))}
      </Reveal>

      <AnimatePresence mode="wait" initial={false}>
        <motion.article
          key={item.caseNo}
          role="tabpanel"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="card mt-6 rounded-3xl p-6 lg:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="chip chip-accent caption-3 mono uppercase">Case {item.caseNo}</span>
                <span className="caption-4 t3">{item.subtitle}</span>
              </div>
              <h3 className="heading-4 t1 mt-4">Design {item.title}</h3>
              <p className="body-5 mono ta mt-3">{item.scale}</p>
              <div className="bg-s2 mt-6 rounded-xl p-4">
                <p className="caption-3 t1 uppercase tracking-wider">The hard part</p>
                <p className="body-6 t2 mt-2">{item.hardPart}</p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {item.concepts.map((concept) => (
                  <span key={concept} className="chip caption-4">
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="bd rounded-2xl p-4 sm:p-6">
                <p className="eyebrow caption-3">Request and state flow</p>
                <ol className="mt-4 space-y-3">
                  {item.flow.map((step, stepIndex) => (
                    <motion.li
                      key={step}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.12 + stepIndex * 0.08, duration: 0.5, ease: EASE }}
                      className="flex items-start gap-3"
                    >
                      <span className="tile caption-3 mono h-6 w-6 rounded-full">{stepIndex + 1}</span>
                      <span className="body-6 t2">{step}</span>
                    </motion.li>
                  ))}
                </ol>
              </div>

              <div className="bd rounded-2xl p-4 sm:p-6">
                <p className="eyebrow caption-3">Failure handling</p>
                <ul className="mt-4 space-y-3">
                  {item.failures.map((failure, failureIndex) => (
                    <motion.li
                      key={failure}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + failureIndex * 0.08, duration: 0.5, ease: EASE }}
                      className="flex items-start gap-3"
                    >
                      <ShieldCheck className="ta mt-0.5 shrink-0" size={20} weight="duotone" />
                      <span className="body-6 t2">{failure}</span>
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

// 45 minute plan: the time bar and the cards highlight each other.
function PlaybookTimeline() {
  const [hovered, setHovered] = useState(null);
  const total = interviewPlaybook.reduce((sum, item) => sum + parseInt(item.time, 10), 0);

  return (
    <>
      <Reveal className="mt-10">
        <div
          className="flex h-3 w-full gap-1"
          role="img"
          aria-label={`Time split across the ${total} minute interview`}
        >
          {interviewPlaybook.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ scaleX: 0, opacity: 0 }}
              whileInView={{ scaleX: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
              style={{ flexGrow: parseInt(item.time, 10), transformOrigin: "left" }}
              className="seg h-full rounded-full"
              data-on={hovered === null || hovered === index ? "true" : "false"}
              title={`${item.title}: ${item.time}`}
            />
          ))}
        </div>
        <div className="caption-4 mono t3 mt-2 flex justify-between">
          <span>0 min</span>
          <span>{total} min</span>
        </div>
      </Reveal>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {interviewPlaybook.map((item, index) => (
          <Reveal key={item.title} delay={(index % 3) * 0.07}>
            <article
              className="card lift h-full rounded-3xl p-6"
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex items-center justify-between gap-4">
                <span className="chip chip-accent caption-3 mono">{item.time}</span>
                <span className="num heading-5 mono">{formatTwoDigits(index + 1)}</span>
              </div>
              <h3 className="heading-6 t1 mt-6">{item.title}</h3>
              <p className="body-6 t2 mt-2">{item.copy}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </>
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

  /* ---------------------------------------------------------------- */
  /*  Presentation state (theme toggle, section nav, mobile menu)      */
  /* ---------------------------------------------------------------- */

  const reduceMotion = useReducedMotion();
  const rootRef = useRef(null);
  const [activeSection, setActiveSection] = useState("");
  const pageReady = Boolean(product?._id) || loadingProduct;

  // Same contract as the site navbar: persist the choice, then announce it so
  // the navbar and the checkout modal stay in step with this page.
  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage can be blocked; the page still switches for this visit.
    }
    setTheme(nextTheme);
    const detail = { theme: nextTheme };
    window.dispatchEvent(new CustomEvent("targettrek-theme-change", { detail }));
    window.dispatchEvent(new CustomEvent("themechange", { detail }));
  };

  // The site navbar is fixed; measure it so the floating section bar and the
  // anchor offsets always clear it, whatever its height at this breakpoint.
  useEffect(() => {
    const root = rootRef.current;
    const siteNav = document.querySelector("nav.fixed.top-0");
    if (!root || !siteNav) return undefined;

    const apply = () => {
      const navRect = siteNav.getBoundingClientRect();
      root.style.setProperty("--hld-nav-h", `${Math.round(navRect.height)}px`);
      // Push the page down by whatever part of it the fixed navbar covers.
      const rootTop = root.getBoundingClientRect().top + window.scrollY;
      const covered = Math.max(0, Math.round(navRect.height - rootTop));
      root.style.setProperty("--hld-pad", `${covered}px`);
    };
    apply();

    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(apply);
    observer.observe(siteNav);
    return () => observer.disconnect();
  }, [pageReady]);

  // Highlight the section currently in view inside the floating bar.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const targets = NAV_LINKS.map((link) => document.querySelector(link.href)).filter(Boolean);
    if (!targets.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pageReady]);

  const goToSection = (event, href) => {
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  };

  // While the product API is in flight the full page still renders (good for
  // crawlers and perceived speed); only the price and buy buttons wait.
  const priceText = loadingProduct ? (
    <span className="skel h-5 w-14 align-middle" role="status" aria-label="Loading price" />
  ) : (
    formatMoney(currentPrice)
  );
  const savingsAmount = mrp > currentPrice ? mrp - currentPrice : 0;
  const canBuy = Boolean(product?._id);
  const hasMrp = mrp > currentPrice;
  const showFloatNav = !heroVisible && !isCheckoutOpen;
  const comboCover =
    comboProduct?.coverpageurl ||
    comboProduct?.coverPageUrl ||
    comboProduct?.cover_page_url ||
    "";

  const bundleOffers = [
    ...(lldProduct
      ? [
          {
            key: "lld",
            item: lldProduct,
            eyebrow: "Low level design · Java",
            title: lldTitle,
            subtitle: lldSubtitle,
            description: lldDescription,
            cover: lldCover,
            pills: [...lldMetaItems.slice(0, 2), ...lldCategoryPills.slice(0, 2)],
            features: [
              "Java, OOP, SOLID and UML",
              "23 GoF design patterns",
              "16 detailed LLD case studies",
            ],
            action: handleLldBuyNow,
            href: LLD_REDIRECT_URL,
            button: "Get the LLD book",
          },
        ]
      : []),
    ...(comboProduct
      ? [
          {
            key: "combo",
            item: comboProduct,
            eyebrow: "Complete system design bundle",
            title: comboProduct.title || "Mastering System Design: HLD + LLD Combo",
            subtitle: "Both design rounds in one bundle",
            description:
              "Distributed architecture and scalable backends in HLD, plus practical Java class design in LLD.",
            cover: comboCover,
            pills: [],
            features: [
              "HLD and LLD together",
              "19 HLD case studies plus 16 LLD problems",
              "Architecture, Java code and design patterns",
            ],
            action: handleComboBuyNow,
            href: COMBO_REDIRECT_URL,
            button: "Get the combo",
          },
        ]
      : []),
  ];
  const bundleSlots = bundleOffers.length + (loadingLldProduct || !lldProduct ? 1 : 0);

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
      <meta name="theme-color" content={isDarkMode ? "#000000" : "#ffffff"} />
      <meta name="color-scheme" content={isDarkMode ? "dark" : "light"} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {bookCover && <link rel="preload" as="image" href={bookCover} />}
      <link href={FONT_HREF} rel="stylesheet" />

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
      <div className="hld flex min-h-screen items-center justify-center px-4" data-theme={theme}>
        <Helmet>
          <title>Book Not Found | Target Trek</title>
          <meta name="robots" content="noindex, nofollow" />
          <link href={FONT_HREF} rel="stylesheet" />
        </Helmet>
        <div className="card w-full max-w-lg rounded-3xl p-8 text-center">
          <span className="tile h-12 w-12 rounded-xl">
            <BookOpen size={24} weight="duotone" />
          </span>
          <h1 className="heading-5 t1 mt-6">Book details are unavailable</h1>
          <p className="body-6 t2 mt-3">
            {productError || "Please refresh the page and try again."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={() => window.location.reload()} className="btn btn-primary button-md">
              Try again
            </button>
            <a href="/books" className="btn btn-secondary button-md">
              Browse all books
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="hld min-h-screen overflow-x-hidden pb-28" data-theme={theme}>
      {seoHead}

      <a href="#hld-main" className="skip btn btn-primary button-sm">
        Skip to content
      </a>

      <ScrollProgress />

      {/* --------------------- FLOATING SECTION NAVIGATION ------------------ */}
      <div
        className="floatnav pointer-events-none fixed inset-x-0 z-40 hidden justify-center px-4 lg:flex"
        data-show={showFloatNav ? "true" : "false"}
        {...(showFloatNav ? {} : { inert: "" })}
      >
        <nav
          aria-label="On this page"
          className="glass pointer-events-auto flex max-w-full items-center gap-1 rounded-full p-1"
        >
          <ul className="flex items-center">
            {NAV_LINKS.filter((link) => link.primary).map((link) => {
              const current = activeSection === link.href;
              return (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(event) => goToSection(event, link.href)}
                    aria-current={current ? "true" : undefined}
                    className="navlink focusable title-4 isolate block"
                  >
                    {current && (
                      <motion.span
                        layoutId="hld-nav-active"
                        className="navlink-bg"
                        transition={{ duration: 0.5, ease: EASE }}
                      />
                    )}
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!canBuy}
            className="btn btn-primary button-sm lg-only rounded-full"
          >
            Get the ebook
            <ArrowRight className="arrow" size={16} weight="bold" />
          </button>
        </nav>
      </div>

      {/* ------------------------- BREADCRUMB + THEME ----------------------- */}
      <div className="bg-base">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="caption-1 t3 flex items-center gap-2">
              <li>
                <a className="link focusable" href="/">
                  Home
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <a className="link focusable" href="/books">
                  Books
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="t1 truncate">
                System Design HLD
              </li>
            </ol>
          </nav>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </div>

      <main id="hld-main">
        {/* ------------------------------ HERO ------------------------------ */}
        <section ref={heroRef} aria-labelledby="hld-hero-title" className="bg-base relative">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center lg:px-8 lg:pb-24 lg:pt-12">
            <div className="min-w-0">
              <Reveal y={16}>
                <span className="chip chip-accent caption-3">
                  <FileText size={14} weight="bold" />
                  HLD interview handbook · PDF ebook
                </span>
              </Reveal>

              <Reveal as="h1" delay={0.06} id="hld-hero-title" className="hero-title heading-1 mt-4 max-w-[680px] pb-1">
                <span className="block">Crack the system</span>
                <span className="block">design interview</span>
                <span className="block">with 19 real systems.</span>
              </Reveal>

              <Reveal as="p" delay={0.12} className="body-3 t2 mt-6 max-w-[680px] sm:text-lg sm:leading-7">
                Learn one repeatable way to turn an open prompt into requirements, estimates, APIs,
                data models, a full architecture and failure handling. Then practice it on WhatsApp,
                Uber, BookMyShow, payments, Netflix and 14 more systems.
              </Reveal>

              <Reveal delay={0.18} className="mt-6">
                <RotatingPrompt />
              </Reveal>

              <Reveal delay={0.24} className="mt-8 flex flex-wrap items-center gap-3">
                <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="btn btn-primary btn-lg button-md">
                  Get the ebook {priceText}
                  <ArrowRight className="arrow" size={20} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={openBookPreview}
                  aria-controls="hld-preview-content"
                  aria-expanded={isPreviewOpen}
                  className="btn btn-ghost btn-lg button-md"
                >
                  <BookOpen size={20} weight="bold" />
                  Read free sample pages
                </button>
              </Reveal>

              <Reveal delay={0.3} className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {[
                  [DownloadSimple, "Instant access after payment"],
                  [Lock, SECURE_CHECKOUT_TEXT],
                  [FileText, "Free preview before you buy"],
                ].map(([Icon, text]) => (
                  <span key={text} className="caption-1 t2 inline-flex items-center gap-2">
                    <Icon className="ta" size={16} weight="bold" />
                    {text}
                  </span>
                ))}
              </Reveal>
            </div>

            {/* Book + price */}
            <Reveal delay={0.15} className="mx-auto w-full max-w-sm lg:max-w-none">
              <div className="bg-s2 bd relative rounded-3xl p-6 sm:p-8">
                <FloatChip className="left-3 top-6 sm:left-4" delay={0.5}>
                  <p className="heading-6 mono ta">19</p>
                  <p className="caption-4 t2">case studies</p>
                </FloatChip>
                <FloatChip className="right-3 top-1/3 sm:right-4" delay={0.8}>
                  <p className="heading-6 mono ta">45 min</p>
                  <p className="caption-4 t2">interview plan</p>
                </FloatChip>

                <div className="mx-auto w-40 sm:w-48">
                  <TiltBook>
                    <div className="overflow-hidden rounded-xl bg-[#181818] shadow-[0_24px_48px_rgba(0,0,0,0.3)]">
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
                        <div className="flex aspect-[0.72] flex-col justify-between p-4 text-white">
                          <p className="caption-3 uppercase tracking-wider text-[#fb923c]">
                            The system design interview guide
                          </p>
                          <div>
                            <p className="heading-5">Master System Design</p>
                            <p className="body-5 mt-2 text-[#fb923c]">High Level Design</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TiltBook>
                </div>

                <div className="card mt-8 rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow caption-3">Digital PDF ebook</p>
                      <div className="mt-2 flex flex-wrap items-baseline gap-2">
                        <span className="heading-4 mono t1">{priceText}</span>
                        {hasMrp && <span className="body-5 mono t3 strike">{formatMoney(mrp)}</span>}
                      </div>
                    </div>
                    {discount > 0 && (
                      <span className="chip chip-accent caption-3 mono">{discount}% off</span>
                    )}
                  </div>
                  {savingsAmount > 0 && (
                    <p className="caption-3 tok mt-2">You save {formatMoney(savingsAmount)} today</p>
                  )}
                  <p className="caption-5 t3 mt-2">
                    Instant access after successful payment. Digital purchases are not refundable.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ------------------------- LLD + COMBO BUNDLE ---------------------- */}
        <Section id="lld-book" alt labelledBy="bundle-title">
          <SectionHeader
            id="bundle-title"
            eyebrow="Complete your system design prep"
            title="Go deeper with LLD, or get both books"
            description="Move from designing scalable systems to writing clean, reliable Java classes. Pick the LLD handbook, or prepare for both design rounds with the HLD and LLD bundle."
          />

          <div className={cx("mt-10 grid gap-6", bundleSlots > 1 ? "lg:grid-cols-2" : "max-w-2xl")}>
            {loadingLldProduct && (
              <div className="card rounded-3xl p-6 sm:p-8" role="status" aria-label="Loading the LLD book">
                <div className="flex gap-4">
                  <div className="skel-block aspect-[0.72] w-24 shrink-0 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="skel-block h-4 w-32 rounded-full" />
                    <div className="skel-block h-6 w-full rounded-lg" />
                    <div className="skel-block h-16 w-full rounded-lg" />
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="skel-block h-12 rounded-xl" />
                  <div className="skel-block h-12 rounded-xl" />
                </div>
              </div>
            )}

            {!loadingLldProduct && !lldProduct && (
              <div className="card flex flex-col justify-between gap-6 rounded-3xl p-6 sm:p-8">
                <div>
                  <p className="eyebrow caption-3">Low level design · Java</p>
                  <h3 className="heading-6 t1 mt-2">Explore the Java LLD handbook</h3>
                  <p className="body-6 t2 mt-2">
                    {lldProductError || "Live LLD product details could not be loaded right now."}
                  </p>
                </div>
                <a href={LLD_REDIRECT_URL} className="btn btn-secondary button-md self-start">
                  See LLD details
                  <ArrowRight className="arrow" size={18} weight="bold" />
                </a>
              </div>
            )}

            {bundleOffers.map((offer, cardIndex) => {
              const price = Number(offer.item.price);
              const mrpValue = Number(offer.item.mrp || 0);
              const currencyCode = offer.item.currency || "INR";
              const savings = mrpValue > price ? Math.round(((mrpValue - price) / mrpValue) * 100) : 0;
              const isCombo = offer.key === "combo";

              return (
                <Reveal key={offer.key} delay={cardIndex * 0.1}>
                  <article className={cx("card lift flex h-full flex-col rounded-3xl p-6 sm:p-8", isCombo && "featured")}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="eyebrow caption-3">{offer.eyebrow}</p>
                      {isCombo && <span className="chip chip-accent caption-3">Best value</span>}
                    </div>

                    <div className="mt-4 flex gap-4">
                      {offer.cover && (
                        <img
                          src={offer.cover}
                          alt={`${offer.title} ebook cover`}
                          loading="lazy"
                          decoding="async"
                          className="bd h-auto w-24 shrink-0 self-start rounded-lg object-contain"
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className="heading-6 t1">{offer.title}</h3>
                        <p className="body-5 ta mt-1">{offer.subtitle}</p>
                        <p className="body-6 t2 mt-2 line-clamp-3">{offer.description}</p>
                      </div>
                    </div>

                    <ul className="mt-6 space-y-2">
                      {offer.features.map((feature) => (
                        <li key={feature} className="body-5 t1 flex items-start gap-2">
                          <Check className="ta mt-0.5 shrink-0" size={16} weight="bold" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {offer.pills.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {offer.pills.map((pill) => (
                          <span key={pill} className="chip caption-4">
                            {pill}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-6">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="heading-4 mono t1">{formatMoney(price, currencyCode)}</span>
                        {mrpValue > price && (
                          <span className="body-5 mono t3 strike">{formatMoney(mrpValue, currencyCode)}</span>
                        )}
                        {savings > 0 && <span className="chip chip-accent caption-3 mono">{savings}% off</span>}
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={offer.action}
                          disabled={!offer.item?._id}
                          className="btn btn-primary button-md w-full"
                        >
                          {offer.button}
                          <ArrowRight className="arrow" size={18} weight="bold" />
                        </button>
                        <a href={offer.href} className="btn btn-secondary button-md w-full">
                          View details
                        </a>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ------------------------------ PROOF ------------------------------ */}
        <section aria-label="Book at a glance" className="bg-base py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal className="rule bd grid grid-cols-2 gap-px overflow-hidden rounded-3xl md:grid-cols-4">
              {[
                [19, "", "Case studies"],
                [45, " min", "Interview playbook"],
                [9, "", "Steps per case"],
                [buildingBlocks.length, "", "Core building blocks"],
              ].map(([value, suffix, label]) => (
                <div key={label} className="bg-s1 px-4 py-8 text-center">
                  <div className="heading-3 mono ta">
                    <CountUp to={value} suffix={suffix} />
                  </div>
                  <div className="caption-1 t2 mt-2">{label}</div>
                </div>
              ))}
            </Reveal>
          </div>

          <div className="marquee-wrap mt-8 overflow-hidden" aria-label="Technologies and concepts covered">
            <div className="marquee">
              {[...marqueeTerms, ...marqueeTerms].map((term, index) => (
                <span
                  key={`${term}-${index}`}
                  aria-hidden={index >= marqueeTerms.length ? "true" : undefined}
                  className="chip caption-1 mx-1 shrink-0"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ----------------------------- PREVIEW ----------------------------- */}
        <section
          id="book-preview"
          ref={previewSectionRef}
          aria-labelledby="preview-title"
          className="bg-alt py-16 lg:py-24"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeader
              id="preview-title"
              eyebrow="Free preview"
              title="Read the real pages before you pay"
              description="These are actual pages from Mastering System Design HLD. Open the sample and judge the depth yourself."
            />

            <Reveal className="mt-10">
              <div className="card flex flex-col gap-4 rounded-3xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-4">
                  <span className="tile h-12 w-12 rounded-xl">
                    <BookOpen size={24} weight="duotone" />
                  </span>
                  <div>
                    <p className="title-3 t1">Mastering System Design HLD sample</p>
                    <p className="caption-2 t3 mt-1">
                      {previewLoading
                        ? "Rendering preview pages"
                        : previewTotalPages
                        ? `${previewTotalPages} preview pages`
                        : "Preview pages"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen((open) => !open)}
                  aria-expanded={isPreviewOpen}
                  aria-controls="hld-preview-content"
                  className="btn btn-primary button-md"
                >
                  {isPreviewOpen ? "Close preview" : "Preview the book"}
                  <CaretDown
                    size={16}
                    weight="bold"
                    className={cx(
                      "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isPreviewOpen && "rotate-180"
                    )}
                  />
                </button>
              </div>
            </Reveal>

            <div id="hld-preview-content" hidden={!isPreviewOpen}>
              {isPreviewOpen && previewLoading && previewImages.length === 0 && (
                <div className="mt-6 space-y-6" role="status" aria-label="Loading preview pages">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="skel-block bd mx-auto aspect-[0.707] w-full max-w-4xl rounded-2xl"
                    />
                  ))}
                </div>
              )}

              {isPreviewOpen && previewError && previewImages.length === 0 && (
                <div className="card mx-auto mt-6 max-w-2xl rounded-3xl p-6 text-center">
                  <p className="title-3 t1">The preview could not be rendered</p>
                  <p className="body-6 t2 mt-2">
                    {previewError || "Check the preview PDF path and pdf.js worker configuration."}
                  </p>
                  <p className="body-6 t2 mt-2">Refresh the page to try again.</p>
                </div>
              )}

              {isPreviewOpen && previewImages.length > 0 && (
                <div className="mt-6 space-y-8">
                  {previewImages.map((page) => (
                    <motion.article
                      key={page.pageNumber}
                      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, ease: EASE }}
                      className="mx-auto w-full max-w-4xl"
                    >
                      <div className="caption-4 mono t3 mb-2 flex items-center justify-between px-1">
                        <span>Preview page {formatTwoDigits(page.pageNumber)}</span>
                        <span>
                          {page.pageNumber} / {previewTotalPages}
                        </span>
                      </div>

                      <div className="preview-page bd overflow-hidden rounded-2xl bg-white">
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

                  <div className="card featured mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-3xl p-6 text-center">
                    <p className="title-2 t1">Liked the sample? The full book has all 19 case studies.</p>
                    <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="btn btn-primary btn-lg button-md">
                      Get the full ebook {priceText}
                      <ArrowRight className="arrow" size={18} weight="bold" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* -------------------------- TAGLINE REVEAL ------------------------- */}
        <TaglineReveal text={TAGLINE} />

        {/* ---------------------- WHY CANDIDATES STALL ---------------------- */}
        <Section alt labelledBy="pain-title">
          <SectionHeader
            id="pain-title"
            eyebrow="Why design rounds go wrong"
            title="Stop memorising diagrams. Start reasoning like a senior engineer."
            description="Most candidates know the tools but cannot explain why a component belongs in the design. This handbook fixes the reasoning, not just the vocabulary."
          />

          <Reveal className="mt-10">
            <div className="rule bd grid gap-px overflow-hidden rounded-3xl">
              <div className="bg-s2 hidden grid-cols-2 gap-6 px-6 py-3 md:grid">
                <p className="caption-3 t3 uppercase tracking-wider">Without a method</p>
                <p className="caption-3 ta uppercase tracking-wider">With this handbook</p>
              </div>
              {painPoints.map((item) => (
                <div
                  key={item.before}
                  className="bg-s1 row-hover grid gap-3 p-6 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:grid-cols-2 md:gap-6"
                >
                  <div className="flex items-start gap-3">
                    <XCircle className="tbad mt-0.5 shrink-0" size={20} weight="fill" />
                    <p className="body-3 t3 strike">{item.before}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="tok mt-0.5 shrink-0" size={20} weight="fill" />
                    <p className="body-1 t1">{item.after}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </Section>

        {/* ----------------------------- WHAT IS HLD ------------------------- */}
        <Section id="what-is-hld" labelledBy="what-is-hld-title">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionHeader
                id="what-is-hld-title"
                eyebrow="System design basics"
                title="What is High Level Design (HLD)?"
              />
              <Reveal delay={0.08} className="body-3 t2 mt-6 space-y-4">
                <p>
                  <strong className="t1 font-semibold">High Level Design</strong> is the part of a system
                  design interview where you describe the architecture of an entire product: which
                  services exist, how clients talk to them, where data lives, what is cached, what runs
                  asynchronously and how the system behaves when something breaks.
                </p>
                <p>
                  A strong HLD answer follows a predictable path: requirements, quick estimation, APIs
                  and entities, the architecture diagram, request flows, deep dives and failure
                  handling. This book trains exactly that path on 19 familiar systems, from a URL
                  shortener to an ecommerce platform.
                </p>
                <p>
                  Preparing for object oriented design rounds too? The companion{" "}
                  <a href={LLD_REDIRECT_URL} className="link ta focusable font-semibold underline">
                    Java LLD handbook
                  </a>{" "}
                  covers classes, SOLID and design patterns.
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <div className="rule bd grid gap-px overflow-hidden rounded-3xl">
                <div className="bg-s2 grid grid-cols-[2fr_3fr_3fr] gap-3 px-4 py-3">
                  <span />
                  <span className="caption-3 ta uppercase tracking-wider">HLD</span>
                  <span className="caption-3 t3 uppercase tracking-wider">LLD</span>
                </div>
                {hldVsLld.map(([label, hld, lld]) => (
                  <div
                    key={label}
                    className="bg-s1 row-hover grid grid-cols-[2fr_3fr_3fr] gap-3 px-4 py-4 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  >
                    <span className="body-4 t1">{label}</span>
                    <span className="body-6 t1">{hld}</span>
                    <span className="body-6 t2">{lld}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Section>

        {/* ----------------------------- FRAMEWORK --------------------------- */}
        <Section id="framework" alt labelledBy="framework-title">
          <SectionHeader
            id="framework-title"
            eyebrow="One repeatable framework"
            title="Every case study follows the same nine steps"
            description="The point is not to memorise 19 diagrams. It is to build one reasoning process you can reuse when the interviewer changes the product, the scale or the constraint."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {caseStudyFramework.map((item, index) => (
              <Reveal key={item.number} delay={(index % 3) * 0.07}>
                <article className="card lift h-full rounded-3xl p-6">
                  <div className="flex items-center justify-between gap-4">
                    <span className="num heading-4 mono">{item.number}</span>
                    <ArrowUpRight className="peek" size={18} weight="bold" aria-hidden="true" />
                  </div>
                  <h3 className="heading-6 t1 mt-6">{item.title}</h3>
                  <p className="body-6 t2 mt-2">{item.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------------------- REQUEST FLOW ------------------------- */}
        <Section id="request-flow" labelledBy="request-flow-title">
          <SectionHeader
            id="request-flow-title"
            eyebrow="See it in motion"
            title="Follow one request through a production architecture"
            description="Select any stage to see why it exists. You will justify these same building blocks in every HLD interview."
          />
          <RequestFlowDemo />
        </Section>

        {/* ----------------------------- PLAYBOOK ---------------------------- */}
        <Section id="playbook" alt labelledBy="playbook-title">
          <SectionHeader
            id="playbook-title"
            eyebrow="The 45 minute interview plan"
            title="Know what to do with every minute"
            description="A design round feels calmer with a fixed order. Scope first, estimate quickly, define interfaces, draw the system, then spend most of the time on the hard parts."
          />
          <PlaybookTimeline />
        </Section>

        {/* ---------------------------- BUILDING BLOCKS ---------------------- */}
        <Section id="building-blocks" labelledBy="building-blocks-title">
          <SectionHeader
            id="building-blocks-title"
            eyebrow="Core toolkit"
            title="16 building blocks that show up in strong HLD answers"
            description="The book never teaches Redis, Kafka or a CDN as an isolated definition. Each one is tied to the exact problem it solves inside a production design."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {buildingBlocks.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal key={item.title} delay={(index % 4) * 0.06} y={24}>
                  <article className="card lift flex h-full gap-4 rounded-3xl p-4 sm:flex-col sm:p-6">
                    <span className="tile h-12 w-12 rounded-xl">
                      <Icon size={24} weight="duotone" />
                    </span>
                    <div>
                      <h3 className="title-2 t1">{item.title}</h3>
                      <p className="body-6 t2 mt-1 sm:mt-2">{item.copy}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ------------------------------ ESTIMATOR -------------------------- */}
        <Section id="estimator" alt labelledBy="estimator-title">
          <SectionHeader
            id="estimator-title"
            eyebrow="Try it yourself"
            title="Put numbers on the whiteboard"
            description="Interviewers notice when you estimate before you design. Move the sliders, watch QPS and storage change, then see which pattern the numbers point to."
          />
          <EstimatorDemo onBuy={handleBuyNow} canBuy={canBuy} />
        </Section>

        {/* ------------------------- CHAPTER COVERAGE ------------------------ */}
        <Section id="syllabus" labelledBy="syllabus-title">
          <SectionHeader
            id="syllabus-title"
            eyebrow="What the handbook teaches"
            title="From the first clarifying question to production failure handling"
            description="The book is organised around the decisions you make in an interview. Every topic is tied to a real architecture problem."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {chapterCoverage.map((item, index) => (
              <Reveal key={item.number} delay={(index % 2) * 0.08}>
                <article className="card lift h-full rounded-3xl p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <span className="tile body-1 mono h-12 w-12 rounded-xl">{item.number}</span>
                    <div>
                      <p className="eyebrow caption-3">{item.subtitle}</p>
                      <h3 className="heading-6 t1 mt-1">{item.title}</h3>
                    </div>
                  </div>

                  <p className="body-6 t2 mt-6">{item.description}</p>

                  <ul className="mt-6 space-y-3">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-3">
                        <Check className="ta mt-0.5 shrink-0" size={16} weight="bold" />
                        <span className="body-6 t1">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* --------------------------- SCALE SNAPSHOTS ----------------------- */}
        <Section id="scale" alt labelledBy="scale-title">
          <SectionHeader
            id="scale-title"
            eyebrow="Scale changes the design"
            title="Real numbers from the case studies"
            description="Concrete traffic and storage estimates let you explain why a cache, a partitioning strategy or a consistency guarantee is actually needed."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {scaleSnapshots.map((item, index) => (
              <Reveal key={item.system} delay={(index % 4) * 0.07}>
                <article className="card lift h-full rounded-3xl p-6">
                  <p className="caption-3 t3 uppercase tracking-wider">{item.system}</p>
                  <p className="heading-5 mono ta mt-3">{item.number}</p>
                  <p className="body-6 t2 mt-3">{item.detail}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ------------------------ ARCHITECTURE DECISIONS ------------------- */}
        <Section id="decisions" labelledBy="decisions-title">
          <SectionHeader
            id="decisions-title"
            eyebrow="Architecture decisions"
            title="Know why each component belongs in the diagram"
            description="A strong HLD answer is not a collection of logos. These cards summarise the decision logic the book repeats."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {architectureDecisions.map((item, index) => (
              <Reveal key={item.title} delay={(index % 3) * 0.07}>
                <article className="card lift flex h-full flex-col rounded-3xl p-6">
                  <h3 className="heading-6 t1">{item.title}</h3>
                  <p className="caption-3 t3 mt-4 uppercase tracking-wider">Use it for</p>
                  <p className="body-5 ta mt-1">{item.use}</p>
                  <p className="body-6 t2 mt-4">{item.reason}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    {item.examples.map((example) => (
                      <span key={example} className="chip caption-4">
                        {example}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ------------------------------ TRADE-OFFS ------------------------- */}
        <Section id="tradeoffs" alt labelledBy="tradeoffs-title">
          <SectionHeader
            id="tradeoffs-title"
            eyebrow="Tradeoffs interviewers expect"
            title="The answer is usually “it depends”. You must explain what it depends on."
            description="The book compares realistic alternatives, then ties each choice back to latency, correctness, cost, scale or product behaviour."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {tradeoffCards.map((item, index) => (
              <Reveal key={item.title} delay={(index % 2) * 0.08}>
                <article className="card lift h-full rounded-3xl p-6">
                  <h3 className="heading-6 t1">{item.title}</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="bg-s2 rounded-xl p-4">
                      <p className="caption-3 mono t3">A</p>
                      <p className="body-6 t1 mt-2">{item.left}</p>
                    </div>
                    <div className="bg-s2 rounded-xl p-4">
                      <p className="caption-3 mono t3">B</p>
                      <p className="body-6 t1 mt-2">{item.right}</p>
                    </div>
                  </div>
                  <p className="note body-5 mt-3 flex items-start gap-2 rounded-xl p-4">
                    <Lightning className="mt-0.5 shrink-0" size={16} weight="fill" />
                    {item.takeaway}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* --------------------------- CASE STUDIES -------------------------- */}
        <Section id="case-studies" labelledBy="case-studies-title">
          <SectionHeader
            id="case-studies-title"
            eyebrow="19 complete case studies"
            title="Practice the problems interviewers keep coming back to"
            description="Every use case in the handbook is listed here. Filter by domain to find the problems closest to the company you are interviewing with."
          />
          <CaseExplorer />
          <Reveal className="mt-10 flex flex-col items-center gap-3 text-center">
            <p className="body-2 t1">All 19 designs come in one PDF.</p>
            <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="btn btn-primary btn-lg button-md">
              Get the ebook {priceText}
              <ArrowRight className="arrow" size={18} weight="bold" />
            </button>
          </Reveal>
        </Section>

        {/* ---------------------------- SPOTLIGHTS --------------------------- */}
        <Section id="spotlights" alt labelledBy="spotlights-title">
          <SectionHeader
            id="spotlights-title"
            eyebrow="Inside the hardest designs"
            title="Open a case study and see the depth"
            description="These parts decide whether an HLD discussion stays shallow or reaches production grade: routing, concurrency, idempotency, state transitions and recovery."
          />
          <SpotlightViewer />
        </Section>

        {/* -------------------------- PRODUCTION PATTERNS -------------------- */}
        <Section id="patterns" labelledBy="patterns-title">
          <SectionHeader
            id="patterns-title"
            eyebrow="Reusable production patterns"
            title="Patterns you can reuse when the problem changes"
            description="Beyond the named systems, learn the ideas that appear again and again in reliable distributed architectures."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {productionPatterns.map((item, index) => (
              <Reveal key={item.title} delay={(index % 3) * 0.06} y={24}>
                <article className="card lift h-full rounded-3xl p-6">
                  <span className="num caption-3 mono">{formatTwoDigits(index + 1)}</span>
                  <h3 className="title-2 t1 mt-3">{item.title}</h3>
                  <p className="body-6 t2 mt-2">{item.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ------------------------------ DEEP DIVES ------------------------- */}
        <Section id="deep-dives" alt labelledBy="deep-dives-title">
          <SectionHeader
            id="deep-dives-title"
            eyebrow="Beyond drawing boxes"
            title="The strongest discussion starts after the diagram"
            description="Collision handling, ordering, concurrency, idempotency, hot keys, failover and the balance between correctness and availability."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {deepDives.map((item, index) => (
              <Reveal key={item.title} delay={(index % 2) * 0.08}>
                <article className="card lift flex h-full flex-col rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <p className="eyebrow caption-3">{item.kicker}</p>
                    <ArrowUpRight className="peek" size={18} weight="bold" aria-hidden="true" />
                  </div>
                  <h3 className="heading-5 t1 mt-3">{item.title}</h3>
                  <p className="body-6 t2 mt-3">{item.copy}</p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-6">
                    {item.chips.map((chip) => (
                      <span key={chip} className="chip caption-4">
                        {chip}
                      </span>
                    ))}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ------------------------------ AUDIENCE --------------------------- */}
        <Section id="audience" labelledBy="audience-title">
          <SectionHeader
            id="audience-title"
            eyebrow="Who this is for"
            title="Built for engineers who want a system, not another list of buzzwords"
            description="The content is designed around interview reasoning and production tradeoffs, with enough repetition in structure to make revision fast."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {audience.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.07}>
                <article className="card lift h-full rounded-3xl p-6">
                  <span className="num caption-3 mono">{formatTwoDigits(index + 1)}</span>
                  <h3 className="heading-6 t1 mt-4">{item.title}</h3>
                  <p className="body-6 t2 mt-2">{item.copy}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ---------------------------- OFFER / VALUE ------------------------ */}
        <Section id="offer" alt labelledBy="offer-title">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
            <div>
              <SectionHeader
                id="offer-title"
                eyebrow="Everything in the ebook"
                title="What you get with the HLD handbook"
              />
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {valueStack.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Reveal key={item.title} delay={(index % 2) * 0.07} y={24}>
                      <div className="card lift flex h-full items-start gap-3 rounded-2xl p-4">
                        <span className="tile h-10 w-10 rounded-lg">
                          <Icon size={20} weight="duotone" />
                        </span>
                        <span>
                          <span className="body-4 t1 block">{item.title}</span>
                          <span className="body-6 t2 mt-1 block">{item.copy}</span>
                        </span>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>

            <Reveal delay={0.1}>
              <div className="card featured rounded-3xl p-6 sm:p-8">
                <p className="eyebrow caption-3">Digital PDF ebook</p>
                <h3 className="heading-6 t1 mt-2">{productName}</h3>
                <div className="mt-6 flex flex-wrap items-baseline gap-3">
                  <span className="heading-2 mono t1">{priceText}</span>
                  {hasMrp && <span className="title-2 mono t3 strike">{formatMoney(mrp)}</span>}
                  {discount > 0 && <span className="chip chip-accent caption-3 mono">{discount}% off</span>}
                </div>
                {savingsAmount > 0 && (
                  <p className="body-4 tok mt-2">You save {formatMoney(savingsAmount)}</p>
                )}
                <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="btn btn-primary btn-lg button-md mt-6 w-full">
                  Get the ebook
                  <ArrowRight className="arrow" size={20} weight="bold" />
                </button>
                <button type="button" onClick={openBookPreview} className="btn btn-secondary button-md mt-3 w-full">
                  <BookOpen size={18} weight="bold" />
                  Read free sample pages first
                </button>
                <ul className="caption-1 t2 mt-6 space-y-3">
                  <li className="flex items-center gap-2">
                    <DownloadSimple className="ta shrink-0" size={16} weight="bold" />
                    Instant access after successful payment
                  </li>
                  <li className="flex items-center gap-2">
                    <Lock className="ta shrink-0" size={16} weight="bold" />
                    {SECURE_CHECKOUT_TEXT}
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="ta shrink-0" size={16} weight="bold" />
                    Digital PDF, not refundable after payment
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </Section>

        {/* -------------------------------- FAQ ------------------------------ */}
        <Section id="faq" alt narrow labelledBy="faq-title">
          <SectionHeader
            id="faq-title"
            eyebrow="FAQ"
            title="Before you get the HLD handbook"
            description="Quick answers about system design HLD, the format, the preview and what is covered."
            align="center"
          />

          <div className="mt-10 space-y-3">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <Reveal key={item.q} y={16} delay={Math.min(index, 4) * 0.04}>
                  <article className={cx("card rounded-2xl", isOpen && "featured")}>
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className="focusable flex w-full items-center justify-between gap-4 rounded-2xl p-4 text-left sm:p-6"
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${index}`}
                        id={`faq-question-${index}`}
                      >
                        <span className="title-3 t1 sm:text-lg sm:leading-7">{item.q}</span>
                        <Plus
                          size={20}
                          weight="bold"
                          className={cx(
                            "ta shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                            isOpen && "rotate-45"
                          )}
                        />
                      </button>
                    </h3>
                    {/* Answers stay in the DOM so crawlers can read them. */}
                    <div
                      id={`faq-answer-${index}`}
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                      hidden={!isOpen}
                      className="fade-up"
                    >
                      <p className="body-3 t2 px-4 pb-4 sm:px-6 sm:pb-6">{item.a}</p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ------------------------------ FINAL CTA -------------------------- */}
        <section aria-labelledby="final-cta-title" className="bg-base px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Reveal className="mx-auto max-w-6xl">
            <div className="cta-dark rounded-3xl p-6 sm:p-10 lg:p-16">
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
                <div>
                  <p className="caption-3 uppercase tracking-wider text-[#fb923c]">Interview ready HLD revision</p>
                  <h2 id="final-cta-title" className="heading-2 mt-4 max-w-[680px]">
                    Build the habit of explaining why your architecture works.
                  </h2>
                  <p className="body-3 t2 mt-4 max-w-[680px]">
                    19 complete designs, one consistent method, and the production tradeoffs interviewers
                    expect you to discuss after the first diagram.
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="heading-3 mono">{priceText}</span>
                    {hasMrp && <span className="body-5 mono strike text-[#8c8c8c]">{formatMoney(mrp)}</span>}
                  </div>
                  <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="btn btn-primary btn-lg button-md mt-4 w-full">
                    Get the ebook
                    <ArrowRight className="arrow" size={20} weight="bold" />
                  </button>
                  <button type="button" onClick={openBookPreview} className="btn btn-light button-md mt-3 w-full">
                    <BookOpen size={18} weight="bold" />
                    Read the free sample first
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="bg-base caption-2 t3 px-4 pb-8 text-center">
        <p>Mastering System Design: High Level Design · Digital PDF ebook · Digital purchases are not refundable</p>
        <p className="mt-2">
          Support:{" "}
          <a className="link focusable font-semibold" href="mailto:supporttargettrek@gmail.com">
            supporttargettrek@gmail.com
          </a>
        </p>
        <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <a className="link focusable font-medium" href={LLD_REDIRECT_URL}>System Design LLD (Java)</a>
          <a className="link focusable font-medium" href={COMBO_REDIRECT_URL}>HLD + LLD Combo</a>
          <a className="link focusable font-medium" href="/books">All books</a>
        </p>
      </footer>

      {/* Sticky buy bar. Mobile: always docked. Tablet and up: slides in only
          after the hero CTA has scrolled out of view. */}
      <div
        className={cx(
          "buybar pointer-events-none fixed inset-x-0 bottom-0 z-[45] flex justify-center px-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-4 md:pb-6",
          isCheckoutOpen && "translate-y-24 opacity-0",
          heroVisible && !loadingProduct && "md:translate-y-24 md:opacity-0"
        )}
      >
        <div className="glass pointer-events-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl p-2 pl-4">
          <div className="min-w-0">
            <p className="title-4 t1 truncate">Mastering System Design HLD</p>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2">
              <span className="body-1 mono ta">{priceText}</span>
              {hasMrp && <span className="caption-4 mono t3 strike">{formatMoney(mrp)}</span>}
              {discount > 0 && <span className="caption-3 mono tok">{discount}% off</span>}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={openBookPreview} className="btn btn-secondary button-sm lg-only">
              <BookOpen size={16} weight="bold" />
              Free sample
            </button>
            <button type="button" onClick={handleBuyNow} disabled={!canBuy} className="btn btn-primary button-md">
              Get the ebook
              <ArrowRight className="arrow" size={18} weight="bold" />
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
