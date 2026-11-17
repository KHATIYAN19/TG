/*
  MASTERING SYSTEM DESIGN: HLD — the words and lists on /book/system-design/hld.
  Kept apart from the page so the page, the FAQ schema and the case-study schema always say the same thing.
*/
import {
  ArrowsClockwise, Broadcast, Cloud, Cube, Database, FileText, FlowArrow, Gauge, GitBranch, HardDrives, Lightning, LockKey,
  MagnifyingGlass, Network, Pulse, ShieldCheck, Stack, Target, Timer, TrendUp,
} from "@phosphor-icons/react";

export const caseStudies = [
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

export const caseStudyFramework = [
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

export const interviewPlaybook = [
  { time: "05 min", title: "Requirements", copy: "Scope, users, critical flows, FRs and NFRs." },
  { time: "03 min", title: "Estimation", copy: "QPS, peak load, storage, bandwidth and concurrency." },
  { time: "07 min", title: "APIs + Entities", copy: "Data model, API surface and important states." },
  { time: "10 min", title: "HLD", copy: "Core services, data stores, caches and async paths." },
  { time: "15 min", title: "Deep dive", copy: "Solve the 1–2 genuinely hard parts of the design." },
  { time: "05 min", title: "Failures + trade-offs", copy: "Recovery, consistency, bottlenecks and alternatives." },
];

export const buildingBlocks = [
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

export const deepDives = [
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

export const chapterCoverage = [
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

export const audience = [
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

export const faqs = [
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
    a: "Yes. Real sample pages from the book are on this page. Read them right here, page by page, with no download or sign-up.",
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

export const hldVsLld = [
  ["Focus", "Architecture of the whole system", "Class-level design inside one service"],
  ["Core question", "How does it scale to millions of users?", "How do I model objects and relationships?"],
  ["Artifacts", "Components, APIs, data stores, queues", "Classes, interfaces, patterns, working code"],
  ["You decide", "SQL vs NoSQL, caching, sharding, consistency", "SOLID, design patterns, extensibility, concurrency"],
];

export const valueStack = [
  { icon: FileText, title: "Digital PDF ebook", copy: "Read on laptop, tablet or phone — revise anywhere." },
  { icon: Target, title: "19 interview case studies", copy: "URL shortener to payments, each in the same 9-step structure." },
  { icon: Timer, title: "45-minute interview playbook", copy: "A minute-by-minute plan for the real round." },
  { icon: Cube, title: "16 core building-block primers", copy: "Redis, Kafka, CDC, sharding and more — tied to the problem they solve." },
  { icon: TrendUp, title: "Back-of-envelope numbers", copy: "Concrete QPS, storage and bandwidth estimates for every system." },
  { icon: ShieldCheck, title: "Failures + trade-offs", copy: "What breaks, how you recover and what each choice costs." },
];

export const CASE_CATEGORY = {
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

export const caseFilters = [
  "All",
  "Real-time & Social",
  "Media & Storage",
  "Marketplace & Payments",
  "Infrastructure",
];
