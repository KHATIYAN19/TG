/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowsClockwise,
  BookOpen,
  Check,
  CheckCircle,
  Code,
  CreditCard,
  DeviceMobile,
  DownloadSimple,
  FileText,
  GraduationCap,
  HardDrives,
  Lightning,
  Lock,
  LockKey,
  Package,
  Plus,
  Rocket,
  ShieldCheck,
  Stack,
  Target,
  Timer,
  Trophy,
  Wallet,
  XCircle,
} from "@phosphor-icons/react";

import { trackViewContent } from "../lib/metaPixel.js";
import BASE_URL from "../utils/Url";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import {
  AnimatePresence,
  BookOfferCard,
  Breadcrumb,
  BuyBar,
  EASE,
  FLOAT_EASE,
  FONT_HREF,
  FaqList,
  FinalCta,
  FloatChip,
  FloatNav,
  Marquee,
  PillTabs,
  PriceSkeleton,
  Reveal,
  ScrollProgress,
  Section,
  SectionHeader,
  SkipLink,
  StatsStrip,
  TaglineReveal,
  Tilt,
  cx,
  motion,
  twoDigits,
  useGoToSection,
  useInViewport,
  useNavOffset,
  useReducedMotion,
  useSiteTheme,
} from "./systemDesign/ui.jsx";

// ======================================================
// CONFIGURATION
// ======================================================

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";

const ROUTES = {
  combo: "/book/system-design/hld-lld/combo",
  hld: "/book/system-design/hld",
  lld: "/book/system-design/lld",
};

const BOOKS_API =
  `${String(BASE_URL || "").replace(/\/+$/, "")}/book`;

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

// Title <= 60 chars, description <= 160 chars.
const SEO_TITLE = "HLD + LLD System Design Combo (2 eBooks) | Target Trek";

const SEO_DESCRIPTION =
  "Both system design ebooks in one checkout: HLD with 19 case studies plus Java LLD with 23 GoF patterns and 16 coded case studies. Digital PDFs.";

const SEO_LONG_DESCRIPTION =
  "Prepare for system design interviews with Target Trek's HLD + LLD combo. Learn scalable architecture, caching, databases, APIs, Java OOP, SOLID, UML, design patterns, concurrency and practical design problems.";

const SEO_KEYWORDS =
  "system design combo, HLD and LLD book, system design interview ebook, high level design, low level design java, design patterns, distributed systems, BookMyShow design, parking lot design, system design PDF";

// Content groups are detailed editorial curriculum
// summaries. Match module labels to the current
// ebook PDF before describing them as exact chapters.

const HLD_MODULES = [
  {
    title: "System Design Foundations",
    description:
      "Develop a framework for converting business requirements into scalable architecture.",
    topics: [
      "High-Level Design vs Low-Level Design",
      "Functional and non-functional requirements",
      "Availability, scalability and reliability",
      "Latency, throughput and response time",
      "Clarifying requirements in interviews",
      "Defining system boundaries",
      "Architecture trade-offs",
    ],
  },
  {
    title: "Capacity Estimation",
    description:
      "Understand expected traffic and calculate the resources a system needs.",
    topics: [
      "Daily active users and traffic estimation",
      "Requests per second and peak traffic",
      "Storage requirements",
      "Read-heavy and write-heavy workloads",
      "Bandwidth estimation",
      "QPS assumptions",
      "Estimating database growth",
    ],
  },
  {
    title: "Networking and API Architecture",
    description:
      "Learn how clients communicate with services and how to expose stable APIs.",
    topics: [
      "Client-server architecture",
      "HTTP and HTTPS",
      "REST API design",
      "API Gateway",
      "Service-to-service communication",
      "WebSockets",
      "Synchronous vs asynchronous communication",
      "API authentication and authorization",
    ],
  },
  {
    title: "Databases and Data Modeling",
    description:
      "Make practical storage decisions for performance, consistency and future growth.",
    topics: [
      "Relational databases",
      "SQL vs NoSQL",
      "Primary and secondary indexes",
      "Database normalization",
      "Database replication",
      "Read replicas",
      "Horizontal partitioning",
      "Sharding strategies",
      "Transactions and consistency",
      "Data modeling for common applications",
    ],
  },
  {
    title: "Caching and Performance",
    description:
      "Reduce latency and database pressure with well-designed caching layers.",
    topics: [
      "Why caching improves performance",
      "Redis fundamentals",
      "Cache-aside pattern",
      "Write-through and write-behind",
      "TTL and eviction policies",
      "Cache invalidation",
      "Cache stampede",
      "Hot-key problems",
      "CDN and edge caching",
    ],
  },
  {
    title: "Load Balancing and Scaling",
    description:
      "Prepare services and infrastructure for high concurrent traffic.",
    topics: [
      "Vertical vs horizontal scaling",
      "Load balancers",
      "Round-robin distribution",
      "Least-connections strategies",
      "Stateless application servers",
      "Auto scaling",
      "Service discovery",
      "Microservice decomposition",
      "Fault tolerance",
      "Graceful degradation",
    ],
  },
  {
    title: "Message Queues and Async Systems",
    description:
      "Decouple services and move expensive work into reliable background processes.",
    topics: [
      "Kafka and message queues",
      "Publish/subscribe",
      "Producer and consumer design",
      "Asynchronous job processing",
      "Retry queues",
      "Dead-letter queues",
      "Event-driven architecture",
      "Ordering and delivery guarantees",
      "Consumer idempotency",
    ],
  },
  {
    title: "Concurrency and Distributed Consistency",
    description:
      "Reason about correctness when many clients update shared data.",
    topics: [
      "Race conditions",
      "Optimistic concurrency control",
      "Pessimistic locking",
      "Distributed locks",
      "Temporary reservation holds",
      "Idempotency keys",
      "Eventual consistency",
      "Consistency and availability trade-offs",
      "Handling partial failures",
      "Duplicate transaction prevention",
    ],
  },
  {
    title: "Security and Reliability",
    description:
      "Improve system behavior under failures and protect important operations.",
    topics: [
      "Authentication and authorization",
      "Rate limiting",
      "Retry and exponential backoff",
      "Circuit breakers",
      "Failure isolation",
      "Monitoring and observability",
      "Logs, metrics and tracing",
      "Disaster recovery considerations",
      "High availability",
    ],
  },
  {
    title: "End-to-End Interview Design",
    description:
      "Bring requirements, architecture, data flow and failure handling into one answer.",
    topics: [
      "Requirement gathering",
      "High-level architecture diagrams",
      "Core service responsibilities",
      "Database choices",
      "API contracts",
      "Traffic and storage estimation",
      "Scaling decisions",
      "Concurrency edge cases",
      "Discussing design trade-offs",
      "Responding to follow-up questions",
    ],
  },

  {title: "Nineteen HLD Case Studies", description: "Architecture walkthroughs spanning consumer, infrastructure and transactional systems.", topics: [
    "URL Shortener and real-time messaging", "Uber and geospatial dispatch", "Instagram, YouTube, Netflix and Twitter/X", "Dropbox, Google Drive and Docs", "Ticket booking and food delivery", "Notification system and distributed rate limiter", "News feed and distributed job scheduler", "Search autocomplete and web crawler", "Payment system and e-commerce platform"
  ]},
  {title: "Resilience and Production Architecture", description: "Connect each architecture to the practical failure modes interviewers explore.", topics: [
    "Cache stampedes, hot keys and CDN design", "Outbox, CDC, queues and Kafka partitioning", "Idempotency and payment reconciliation", "Reservation locks, leases and fencing tokens", "Distributed tracing, retries and circuit breakers", "Consistency boundaries across checkout, search and feeds"
  ]},
];

const LLD_MODULES = [
  {
    title: "Java OOP Foundations",
    description:
      "Understand the building blocks of maintainable object-oriented software.",
    topics: [
      "Classes and objects",
      "Encapsulation",
      "Inheritance",
      "Polymorphism",
      "Abstraction",
      "Interfaces and abstract classes",
      "Composition over inheritance",
      "Object relationships",
      "Method overriding and overloading",
    ],
  },
  {
    title: "SOLID and Clean Design",
    description:
      "Design classes and modules that handle change without unnecessary complexity.",
    topics: [
      "Single Responsibility Principle",
      "Open/Closed Principle",
      "Liskov Substitution Principle",
      "Interface Segregation Principle",
      "Dependency Inversion Principle",
      "DRY principle",
      "KISS principle",
      "YAGNI principle",
      "Loose coupling",
      "High cohesion",
    ],
  },
  {
    title: "Creational Design Patterns",
    description:
      "Learn different approaches to constructing objects and managing dependencies.",
    topics: [
      "Singleton",
      "Factory Method",
      "Abstract Factory",
      "Builder",
      "Prototype",
      "When to choose each pattern",
      "Java implementation examples",
    ],
  },
  {
    title: "Structural Design Patterns",
    description:
      "Connect components while keeping interfaces clean and implementations flexible.",
    topics: [
      "Adapter",
      "Decorator",
      "Facade",
      "Proxy",
      "Composite",
      "Bridge",
      "Flyweight",
      "Practical use cases",
    ],
  },
  {
    title: "Behavioral Design Patterns",
    description:
      "Model application behavior and communication between objects.",
    topics: [
      "Strategy",
      "Observer",
      "Command",
      "State",
      "Template Method",
      "Chain of Responsibility",
      "Iterator",
      "Mediator",
      "Memento",
      "Visitor",
    ],
  },
  {
    title: "UML and Class Relationships",
    description:
      "Visualize your design before turning it into code.",
    topics: [
      "UML class diagrams",
      "Association",
      "Aggregation",
      "Composition",
      "Inheritance",
      "Interface realization",
      "Dependency relationships",
      "Entity and service boundaries",
    ],
  },
  {
    title: "Java Multithreading",
    description:
      "Understand concurrency and design safe operations on shared state.",
    topics: [
      "Thread lifecycle",
      "Runnable and Callable",
      "ExecutorService",
      "Synchronization",
      "Race conditions",
      "ReentrantLock",
      "ReadWriteLock",
      "Atomic variables",
      "ConcurrentHashMap",
      "Deadlocks",
      "Thread-safe design",
    ],
  },
  {
    title: "Designing Complete Applications",
    description:
      "Move from problem statements to entities, interfaces, services and working implementations.",
    topics: [
      "Requirement analysis",
      "Entity identification",
      "Responsibility assignment",
      "Choosing interfaces",
      "Applying design patterns",
      "Service layer design",
      "Extensibility",
      "Error handling",
      "Testing and edge cases",
      "Communicating design decisions",
    ],
  },

  {title: "Java Language and Runtime for LLD", description: "Foundational Java mechanics needed to implement sound designs.", topics: [
    "Java type system, classes and object identity", "Stack, heap, metaspace and object lifecycle", "Interfaces, abstract classes and composition", "Collections, generics and equality", "Modern Java language features"
  ]},
  {title: "GRASP, Code Smells and Refactoring", description: "Go beyond SOLID to assign responsibilities and improve maintainability.", topics: [
    "GRASP responsibility assignment", "DRY, KISS and YAGNI", "Code smells and anti-patterns", "Refactoring safely", "Modeling dependencies and boundaries"
  ]},
  {title: "Concurrency and Async Java", description: "Study Java synchronization and concurrency-oriented designs.", topics: [
    "Executor framework and thread pools", "CompletableFuture and asynchronous workflows", "Locks, atomic operations and thread safety", "Deadlocks, backpressure and shared state", "Race conditions in booking and inventory"
  ]},
  {title: "Java Backend, Persistence and Security", description: "Translate object models into real API and storage boundaries.", topics: [
    "REST API design, status codes and validation", "Entity modeling, indexes and isolation levels", "JPA and Hibernate concepts", "Clean Architecture with Java and Spring Boot", "Authentication, authorization and secure design", "Retries, timeouts, idempotency and observability"
  ]},
  {title: "Testing, Production Engineering and LLD Interviews", description: "Validate designs and communicate trade-offs with confidence.", topics: [
    "Unit testing and maintainability", "Designing for failure and graceful shutdown", "Metrics, structured logs and tracing", "Requirements-to-classes interview approach", "UML, coding the core flow and validating edge cases"
  ]},
  {title: "Sixteen Java LLD Case Studies", description: "Hands-on practice with class diagrams, Java implementations, state transitions and concurrency.", topics: [
    "Movie ticket booking (BookMyShow / District)", "Inventory management system", "Parking lot system", "Notification system", "Rate limiter", "Additional case studies in the ebook's problem section"
  ]},
];

const PROBLEMS = [
  {
    title: "BookMyShow",
    category: "HLD + LLD",
    focus:
      "Seat availability, reservation locking, concurrency, payment handling.",
  },
  {
    title: "Uber",
    category: "HLD + LLD",
    focus:
      "Ride matching, location updates, trip state, dispatch architecture.",
  },
  {
    title: "URL Shortener",
    category: "HLD",
    focus:
      "Unique key generation, caching, database choice, read scalability.",
  },
  {
    title: "Rate Limiter",
    category: "HLD + LLD",
    focus:
      "Token bucket, sliding window, Redis, concurrency and limits.",
  },
  {
    title: "Parking Lot",
    category: "LLD",
    focus:
      "Entities, floors, spots, allocation, billing and interfaces.",
  },
  {
    title: "Splitwise",
    category: "LLD",
    focus:
      "Groups, balances, expense splitting, strategies, settlement.",
  },
  {
    title: "Payment Gateway",
    category: "LLD",
    focus:
      "Payment strategies, provider abstraction, idempotency and lifecycle.",
  },
  {
    title: "Notification System",
    category: "LLD",
    focus:
      "Channel providers, notification templates, retries, extensions.",
  },
  {
    title: "Inventory System",
    category: "LLD",
    focus:
      "Stock reservations, consistency, concurrent updates, service design.",
  },
  {
    title: "Logger",
    category: "LLD",
    focus:
      "Logging levels, handlers, sinks, threading and extensibility.",
  },
  {
    title: "Coupon System",
    category: "LLD",
    focus:
      "Validation rules, strategy pattern, eligibility and discounts.",
  },

  {title: "WhatsApp / Messaging", category: "HLD", focus: "WebSockets, session routing, ordering, offline delivery and idempotency."},
  {title: "Instagram", category: "HLD", focus: "Media upload, fan-out, feed creation, storage and CDN delivery."},
  {title: "YouTube", category: "HLD", focus: "Chunked uploads, transcoding, adaptive streaming and CDN distribution."},
  {title: "Netflix", category: "HLD", focus: "Video catalog, playback, encoding ladders and multi-region delivery."},
  {title: "Twitter / X", category: "HLD", focus: "Timelines, social graph, caching and celebrity fan-out."},
  {title: "Dropbox", category: "HLD", focus: "Chunking, sync conflicts, file versioning and deduplication."},
  {title: "Google Drive + Docs", category: "HLD", focus: "Sharing, permission models, file sync and live collaboration."},
  {title: "Food Delivery", category: "HLD", focus: "Order state, driver assignment, payments and live tracking."},
  {title: "News Feed", category: "HLD", focus: "Ranking, cache freshness and write-vs-read fan-out."},
  {title: "Distributed Job Scheduler", category: "HLD", focus: "Leases, retry safety, scheduling partitions and recurring execution."},
  {title: "Search Autocomplete", category: "HLD", focus: "Trie/FST, top-K ranking, hot-prefix caches and fast serving."},
  {title: "Web Crawler", category: "HLD", focus: "URL frontier, politeness, deduplication and recrawl scheduling."},
  {title: "Payment System", category: "HLD", focus: "Payment lifecycle, ledgers, verified webhooks and reconciliation."},
  {title: "E-commerce Platform", category: "HLD", focus: "Catalog and search, stock reservation and checkout sagas."},
];

const FAQS = [
  {
    q: "What exactly do I get in the combo?",
    a:
      "You get both Mastering System Design ebooks: High-Level Design and Low-Level Design (Java). They are delivered as separate digital PDF files after successful payment verification.",
  },
  {
    q: "Can I buy only HLD or only LLD?",
    a:
      "Yes. The HLD and LLD editions have separate product pages where you can purchase just one ebook.",
  },
  {
    q: "Do the books include Java code?",
    a:
      "The LLD ebook focuses on Java, OOP, interfaces, design patterns, UML and implementation-focused topics. HLD focuses on system architecture and technical trade-offs.",
  },
  {
    q: "Are these physical books?",
    a:
      "No. The products are digital ebooks supplied as PDF files. No physical shipping is required.",
  },
  {
    q: "How do I receive the PDFs?",
    a:
      "After payment verification, the success page provides access to the included ebooks, with options for individual downloads and downloading all books.",
  },
  {
    q: "Can I use this for SDE-1 and SDE-2 preparation?",
    a:
      "The content covers topics commonly relevant to backend system design interviews at different levels. Choose the modules according to the requirements of your target role.",
  },
  {
    q: "Which payment methods are available?",
    a:
      "Your checkout uses the payment gateway configured on the website. UPI and card options depend on the methods enabled by that provider for your merchant account.",
  },
];

const money = (value, currency = "INR") => {
  if (value == null || value === "") return "—";

  const n = Number(value);
  if (!Number.isFinite(n)) return "—";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n}`;
  }
};

const getId = (value) => {
  if (!value) return "";
  return typeof value === "string"
    ? value
    : String(value._id || value.id || "");
};

const cleanPath = (value) => {
  if (!value) return "";

  try {
    return new URL(value, SITE_URL)
      .pathname.replace(/\/+$/, "")
      .toLowerCase();
  } catch {
    return "";
  }
};

const normalizeBook = (book) => {
  if (!book) return null;

  const id = getId(book);
  if (!id) return null;

  return {
    ...book,
    _id: id,
    title: book.title || "Untitled",
    resourceType: book.resourceType || "ebook",
    currency: book.currency || "INR",
    price: book.price,
    mrp: book.mrp,
    coverPageUrl: book.coverPageUrl || "",
    redirectUrl: book.redirectUrl || "",
    includedBooks: Array.isArray(book.includedBooks)
      ? book.includedBooks
      : [],
    isPublished: book.isPublished !== false,
    isActive: book.isActive !== false,
  };
};

const parseBooks = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.books)) return response.books;
  if (Array.isArray(response?.data?.books)) {
    return response.data.books;
  }
  throw new Error("The books API returned an invalid list.");
};

const findBook = (books, route) =>
  books.find(
    (book) =>
      cleanPath(book.redirectUrl) === cleanPath(route)
  ) || null;

const purchasable = (book) =>
  Boolean(
    book &&
    book.isActive &&
    book.isPublished &&
    Number.isFinite(Number(book.price)) &&
    book.price != null
  );

const discount = (book) => {
  if (!book) return 0;

  const price = Number(book.price);
  const mrp = Number(book.mrp);

  return mrp > price && mrp > 0
    ? Math.round(((mrp - price) / mrp) * 100)
    : 0;
};

const MARQUEE_TERMS = [
  "Scalability",
  "Caching",
  "Kafka",
  "Sharding",
  "Load Balancing",
  "CDN",
  "SOLID",
  "UML",
  "23 GoF Patterns",
  "Concurrency",
  "Spring Boot",
  "Idempotency",
  "Rate Limiting",
  "Saga",
  "Clean Architecture",
  "JPA & Hibernate",
];

const GLANCE_STATS = [
  { value: 2, label: "Digital ebooks" },
  { value: 19, label: "HLD case studies" },
  { value: 16, label: "Java LLD case studies" },
  { value: 23, label: "GoF design patterns" },
];

const BOOK_FACTS = {
  hld: [
    "19 production-style case studies",
    "45-minute interview playbook",
    "16 core building blocks",
    "APIs, DB, failures and trade-offs",
  ],
  lld: [
    "23 GoF design patterns",
    "16 coded Java case studies",
    "60-minute LLD interview framework",
    "Spring Boot, concurrency and testing",
  ],
};

const WHY_COMBO = [
  {
    icon: Stack,
    title: "Architecture + implementation",
    text: "Interviewers ask you to draw the system, then drop into one component. The combo trains both halves of that conversation.",
  },
  {
    icon: Target,
    title: "Covers every design round",
    text: "System design, machine-coding and backend deep-dive rounds map onto one book or the other — you are prepared for all three.",
  },
  {
    icon: Lightning,
    title: "Shared case studies",
    text: "BookMyShow, Uber, rate limiters and payments appear in both books, once as architecture and once as Java classes.",
  },
  {
    icon: Package,
    title: "One checkout, two PDFs",
    text: "Pay once and receive separate HLD and LLD downloads — plus a combined download option on the success page.",
  },
  {
    icon: Timer,
    title: "Two interview playbooks",
    text: "A 45-minute HLD plan and a 60-minute LLD framework, so you know how to use the time in each round.",
  },
  {
    icon: ShieldCheck,
    title: "Failure-first thinking",
    text: "Retries, idempotency, hot keys, race conditions and recovery appear in every case study, not as an afterthought.",
  },
];

const ROUND_MATRIX = [
  { round: "High-level system design", hld: true, lld: false },
  { round: "Machine coding / low-level design", hld: false, lld: true },
  { round: "Backend deep-dive (APIs, DB, caching)", hld: true, lld: true },
  { round: "Concurrency and correctness questions", hld: true, lld: true },
  { round: "Design-pattern and OOP questions", hld: false, lld: true },
  { round: "Scaling, sharding and reliability", hld: true, lld: false },
];

const CLASSIFY_QUIZ = [
  {
    prompt: "Choose between Redis and a database cache for hot keys.",
    answer: "hld",
    explain: "Choosing infrastructure components and cache layers is an architecture (HLD) decision.",
  },
  {
    prompt: "Which design pattern lets a payment gateway switch between providers?",
    answer: "lld",
    explain: "Strategy and adapter style abstractions are class-level (LLD) design.",
  },
  {
    prompt: "How should messages be sharded and routed to the right chat server?",
    answer: "hld",
    explain: "Partitioning data and routing traffic across servers is a distributed-systems (HLD) concern.",
  },
  {
    prompt: "Which classes, interfaces and enums does a parking lot need?",
    answer: "lld",
    explain: "Entities, responsibilities and relationships between classes are LLD.",
  },
];

const STUDY_PLANS = [
  {
    id: "7",
    label: "1 week",
    tag: "Crash revision",
    steps: [
      ["Days 1–2", "HLD playbook, building blocks and 4 key case studies (URL shortener, messaging, ride-hailing, payments)."],
      ["Days 3–4", "LLD framework, SOLID and the most-asked patterns (Strategy, Factory, Observer, Singleton)."],
      ["Days 5–6", "LLD case studies: parking lot, BookMyShow, rate limiter, notifications."],
      ["Day 7", "Mock a full HLD round and a full LLD round back to back."],
    ],
  },
  {
    id: "14",
    label: "2 weeks",
    tag: "Balanced prep",
    steps: [
      ["Week 1", "HLD: requirements, estimation, APIs, databases, caching, queues and 10 case studies."],
      ["Week 2", "LLD: OOP, SOLID, 23 patterns, concurrency and 8 coded case studies."],
      ["Last 2 days", "Failure handling, trade-offs and timed mock interviews for both rounds."],
    ],
  },
  {
    id: "28",
    label: "4 weeks",
    tag: "Deep preparation",
    steps: [
      ["Week 1", "Foundations: estimation, APIs, Java OOP, SOLID and UML."],
      ["Week 2", "HLD case studies: all 19 designs with deep dives on consistency and scale."],
      ["Week 3", "LLD: all 23 patterns, concurrency, Spring Boot architecture and 16 case studies."],
      ["Week 4", "Combined practice: take one system, design it as HLD then model it as LLD; run timed mocks."],
    ],
  },
];

const COMPARE_ROWS = [
  ["Best for", "System design rounds", "Machine coding / LLD rounds", "Complete interview preparation"],
  ["Interview timing", "45-minute playbook", "60-minute framework", "Both"],
  ["Case studies", "19", "16", "35 in total"],
  ["Language focus", "Language-agnostic architecture", "Java", "Architecture + Java"],
  ["Key topics", "Redis, Kafka, sharding, CDN", "SOLID, GoF patterns, concurrency", "Everything in both"],
];

const EXTRA_FAQS = [
  {
    q: "What is the difference between HLD and LLD in system design interviews?",
    a: "High-Level Design is the architecture of the whole system: services, databases, caches, queues, scaling and failure handling. Low-Level Design is the internal design of one component: classes, interfaces, design patterns and thread safety. Many companies test both, which is why this page bundles the two books.",
  },
  {
    q: "Should I start with HLD or LLD?",
    a: "If your next round is a whiteboard architecture discussion, start with HLD. If it is a machine-coding or object-oriented design round, start with LLD. With 3+ weeks, read HLD first and LLD second, then practise a few systems end to end in both books.",
  },
  {
    q: "How many case studies are in the combo?",
    a: "The HLD book has 19 case studies and the Java LLD book has 16 coded case studies, so the combo gives 35 worked designs in total, several of them (such as BookMyShow and rate limiters) viewed from both architecture and class-design angles.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page copy                                                          */
/* ------------------------------------------------------------------ */

// Same source the checkout modal uses (VITE_BOOKS_PAYMENT_GATEWAY, then
// VITE_PAYMENT_GATEWAY).
const PROVIDER_NAME = gatewayLabel(preferredGateway("books"));

const NAV_LINKS = [
  { href: "#included-books", label: "Included books" },
  { href: "#why-combo", label: "Why combo" },
  { href: "#round-picker", label: "HLD or LLD" },
  { href: "#curriculum", label: "Curriculum" },
  { href: "#practice", label: "Case studies" },
  { href: "#study-plan", label: "Study plan" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

const TAGLINE =
  "Interviewers ask you to draw the system, then drop into one component. The combo trains both halves of that conversation.";

const DESIGN_LEVELS = [
  {
    title: "High Level Design",
    icon: HardDrives,
    intro: "Understand how the system behaves as a whole.",
    points: [
      "What services should exist?",
      "How will they communicate?",
      "Where will data be stored?",
      "How will traffic be distributed?",
      "What happens during failures?",
    ],
  },
  {
    title: "Low Level Design",
    icon: Code,
    intro: "Understand how individual components should be implemented.",
    points: [
      "What classes and interfaces are needed?",
      "Which object owns each responsibility?",
      "Which design pattern fits?",
      "How can the design be extended?",
      "How is shared state protected?",
    ],
  },
];

const METHOD_STEPS = [
  ["01", "Understand requirements", "Clarify features, constraints, scale and expected behaviour."],
  ["02", "Identify core components", "For HLD, map services and data flow. For LLD, identify entities and responsibilities."],
  ["03", "Design the foundation", "Define APIs, storage, classes, interfaces and key relationships."],
  ["04", "Discuss scalability and extensibility", "Explain the tradeoffs in architecture and object composition."],
  ["05", "Handle critical edge cases", "Consider failures, concurrency, retries, duplicate requests and changing requirements."],
  ["06", "Explain your decisions", "Clearly describe assumptions and alternative approaches."],
];

const STAGES = [
  ["Stage 01", "Foundations", "Revise requirements, APIs, object oriented programming and basic class relationships."],
  ["Stage 02", "Core design", "Study databases, caching, scaling, SOLID and design patterns."],
  ["Stage 03", "Correctness", "Explore concurrency, locking, failures, retries and consistent state."],
  ["Stage 04", "Mock interviews", "Practice full system design and Java LLD problems under time limits."],
];

const READERS = [
  { icon: HardDrives, title: "Backend engineers", detail: "Strengthen architecture decisions, scalability fundamentals and API and service design." },
  { icon: GraduationCap, title: "SDE candidates", detail: "Prepare systematically for architecture and object oriented design interview questions." },
  { icon: Code, title: "Java developers", detail: "Improve class modeling, interfaces, design patterns and concurrency reasoning." },
];

const PAY_OPTIONS = [
  { icon: DeviceMobile, title: "UPI", text: "When enabled" },
  { icon: CreditCard, title: "Debit card", text: "When enabled" },
  { icon: Wallet, title: "Credit card", text: "When enabled" },
  { icon: LockKey, title: "Secure checkout", text: PROVIDER_NAME },
];

const AFTER_PAYMENT = [
  { icon: ShieldCheck, title: "Purchase verification", text: "The payment is verified through the configured gateway." },
  { icon: BookOpen, title: "Access your books", text: "Both HLD and LLD appear on the purchase success page." },
  { icon: DownloadSimple, title: "Save both PDFs", text: "Download the files one by one or use the combined download option." },
];

const INCLUDES_MATRIX = [
  ["High Level Design", true, false, true],
  ["Low Level Design", false, true, true],
  ["Java LLD content", false, true, true],
  ["System architecture", true, false, true],
  ["Two ebooks", false, false, true],
];

/* ------------------------------------------------------------------ */
/*  Components                                                         */
/* ------------------------------------------------------------------ */

function YesNo({ yes }) {
  return yes ? (
    <CheckCircle className="tok" size={20} weight="fill" aria-label="Included" />
  ) : (
    <span className="t3" aria-label="Not included">
      –
    </span>
  );
}

// Two overlapping covers that float and tilt. Covers come from the books API.
function TwoBooks({ hld, lld }) {
  const reduce = useReducedMotion();

  const covers = [
    { key: "lld", src: lld?.coverPageUrl, label: "LLD (Java)", pos: "right-4 top-0 z-10 rotate-6", y: [0, -8, 0], delay: 0.6 },
    { key: "hld", src: hld?.coverPageUrl, label: "HLD", pos: "left-4 top-6 z-20 -rotate-6", y: [0, 8, 0], delay: 0 },
  ];

  return (
    <Tilt className="relative mx-auto h-64 w-full max-w-xs" float={false}>
      <div className="relative h-64">
        {covers.map((cover) => (
          <motion.div
            key={cover.key}
            className={cx(
              "absolute aspect-[0.72] w-36 overflow-hidden rounded-xl bg-[#181818] shadow-[0_24px_48px_rgba(0,0,0,0.3)] sm:w-40",
              cover.pos
            )}
            animate={reduce ? undefined : { y: cover.y }}
            transition={{ duration: 5.5, repeat: Infinity, ease: FLOAT_EASE, delay: cover.delay }}
          >
            {cover.src ? (
              <img src={cover.src} alt={`${cover.label} ebook cover`} className="h-full w-full bg-white object-contain" loading="eager" decoding="async" />
            ) : (
              <div className="flex h-full flex-col justify-between p-4 text-white">
                <span className="caption-3 uppercase tracking-wider text-[#fb923c]">Target Trek</span>
                <div>
                  <p className="caption-4 text-[#b4b4b4]">Mastering System Design</p>
                  <p className="heading-6 mt-1">{cover.label}</p>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </Tilt>
  );
}

// Accordion: module topics stay in the DOM (crawlable).
function ModuleList({ modules, prefix }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-3">
      {modules.map((module, index) => {
        const expanded = open === index;
        const panelId = `${prefix}-panel-${index}`;

        return (
          <Reveal key={`${prefix}-${index}`} y={16} delay={Math.min(index, 5) * 0.04}>
            <article className={cx("card rounded-2xl", expanded && "featured")}>
              <h3>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() => setOpen(expanded ? -1 : index)}
                  className="focusable flex w-full items-start justify-between gap-4 rounded-2xl p-4 text-left sm:p-6"
                >
                  <span className="flex gap-4">
                    <span className="num body-4 mono">{twoDigits(index + 1)}</span>
                    <span>
                      <span className="title-3 t1 block">{module.title}</span>
                      <span className="body-6 t2 mt-1 block">{module.description}</span>
                      <span className="caption-3 ta mt-2 block">{module.topics.length} topics</span>
                    </span>
                  </span>
                  <Plus size={20} weight="bold" className={cx("spin ta shrink-0", expanded && "rotate-45")} />
                </button>
              </h3>

              <div id={panelId} role="region" hidden={!expanded} className="fade-up">
                <ul className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-6 sm:pb-6">
                  {module.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2">
                      <Check className="ta mt-0.5 shrink-0" size={16} weight="bold" />
                      <span className="body-6 t1">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

// "Is it HLD or LLD?" mini game
function ClassifyGame() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const item = CLASSIFY_QUIZ[index];
  const answered = picked !== null;

  const choose = (choice) => {
    if (answered) return;
    setPicked(choice);
    if (choice === item.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= CLASSIFY_QUIZ.length) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  return (
    <Reveal className="mx-auto mt-10 max-w-3xl">
      <div className="card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow caption-3">Quick game · Is it HLD or LLD?</span>
          <span className="caption-1 mono t3">
            {done ? "Finished" : `Question ${index + 1} of ${CLASSIFY_QUIZ.length}`} · Score {score}
          </span>
        </div>

        <div className="mt-4 flex gap-1" aria-hidden="true">
          {CLASSIFY_QUIZ.map((q, i) => (
            <span key={q.prompt} className="seg h-1 flex-1 rounded-full" data-on={i <= index || done ? "true" : "false"} />
          ))}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {done ? (
            <motion.div
              key="done"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="py-8 text-center"
            >
              <span className="tile h-12 w-12 rounded-xl">
                <Trophy size={24} weight="duotone" />
              </span>
              <h3 className="heading-5 t1 mt-4">
                You scored <span className="mono">{score} / {CLASSIFY_QUIZ.length}</span>
              </h3>
              <p className="body-6 t2 mx-auto mt-2 max-w-md">
                Real interviews mix both skills. The combo trains the architecture and the class level design in one plan.
              </p>
              <button type="button" onClick={restart} className="btn btn-secondary button-sm mt-6">
                <ArrowsClockwise size={16} weight="bold" />
                Play again
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={index}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <p className="heading-6 t1 mt-6">{item.prompt}</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["hld", "HLD", "Architecture", HardDrives],
                  ["lld", "LLD", "Class design", Code],
                ].map(([id, label, hint, Icon]) => {
                  const isRight = id === item.answer;
                  const isPicked = id === picked;
                  const state = !answered ? "idle" : isRight ? "right" : isPicked ? "wrong" : "dim";

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => choose(id)}
                      disabled={answered}
                      data-state={state}
                      className="choice focusable flex items-center gap-3 rounded-xl p-4 text-left"
                    >
                      <span className="tile h-10 w-10 rounded-lg">
                        <Icon size={20} weight="duotone" />
                      </span>
                      <span>
                        <span className="body-1 t1 block">{label}</span>
                        <span className="caption-2 t2 block">{hint}</span>
                      </span>
                      {state === "right" && <CheckCircle className="tok ml-auto" size={20} weight="fill" />}
                      {state === "wrong" && <XCircle className="tbad ml-auto" size={20} weight="fill" />}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className="fade-up">
                  <div className="note mt-6 rounded-xl p-4">
                    <p className="caption-3 uppercase tracking-wider">{picked === item.answer ? "Correct" : "Not quite"}</p>
                    <p className="body-6 t1 mt-2">{item.explain}</p>
                  </div>
                  <button type="button" onClick={next} className="btn btn-primary button-md mt-4">
                    {index + 1 >= CLASSIFY_QUIZ.length ? "See my score" : "Next question"}
                    <ArrowRight className="arrow" size={18} weight="bold" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

// Study plan builder
function PlanBuilder() {
  const reduce = useReducedMotion();
  const [planId, setPlanId] = useState("14");
  const plan = STUDY_PLANS.find((item) => item.id === planId) || STUDY_PLANS[1];

  return (
    <div className="mt-8">
      <Reveal>
        <PillTabs
          label="Choose how much time you have"
          value={planId}
          onChange={setPlanId}
          items={STUDY_PLANS.map((item) => ({ id: item.id, label: item.label }))}
        />
      </Reveal>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={plan.id}
          role="tabpanel"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="card mt-6 rounded-3xl p-6 sm:p-8"
        >
          <p className="eyebrow caption-3 flex items-center gap-2">
            <Rocket size={16} weight="bold" />
            {plan.tag}
          </p>
          <ol className="mt-6 space-y-3">
            {plan.steps.map(([when, what], stepIndex) => (
              <motion.li
                key={when}
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 + stepIndex * 0.08, duration: 0.5, ease: EASE }}
                className="bg-s2 row-hover flex flex-col gap-2 rounded-xl p-4 sm:flex-row sm:items-start sm:gap-6"
              >
                <span className="caption-3 mono ta shrink-0 uppercase tracking-wider sm:w-28 sm:pt-0.5">{when}</span>
                <span className="body-6 t1">{what}</span>
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Filterable case study explorer
function ProblemExplorer() {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState("All");
  const filters = ["All", "HLD", "LLD", "HLD + LLD"];
  const visible = filter === "All" ? PROBLEMS : PROBLEMS.filter((problem) => problem.category === filter);

  return (
    <>
      <Reveal className="mt-8">
        <PillTabs
          role="group"
          label="Filter case studies"
          value={filter}
          onChange={setFilter}
          items={filters.map((name) => ({
            id: name,
            label: name,
            count: name === "All" ? PROBLEMS.length : PROBLEMS.filter((problem) => problem.category === name).length,
          }))}
        />
      </Reveal>

      <motion.div layout={!reduce} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((problem) => (
            <motion.div
              key={problem.title}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <article className="card lift h-full rounded-2xl p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className={cx("chip caption-3", problem.category === "HLD + LLD" && "chip-accent")}>
                    {problem.category}
                  </span>
                  <ArrowUpRight className="peek" size={18} weight="bold" aria-hidden="true" />
                </div>
                <h3 className="title-2 t1 mt-4">{problem.title}</h3>
                <p className="body-6 t2 mt-2">{problem.focus}</p>
              </article>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// Animated price comparison: separate vs combo
function SavingsBars({ hld, lld, combo, currency, savings }) {
  const reduce = useReducedMotion();
  const sepTotal = purchasable(hld) && purchasable(lld) ? Number(hld.price) + Number(lld.price) : null;
  const comboPrice = purchasable(combo) ? Number(combo.price) : null;

  if (sepTotal === null || comboPrice === null || sepTotal <= 0) return null;

  const rows = [
    { label: "HLD and LLD bought separately", value: sepTotal, accent: false },
    { label: "HLD + LLD combo", value: comboPrice, accent: true },
  ];
  const max = Math.max(...rows.map((row) => row.value));

  return (
    <Reveal className="mt-8">
      <div className="card rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="heading-6 t1">See what you save</h3>
          {savings > 0 && <span className="chip chip-accent caption-3 mono">You save {money(savings, currency)}</span>}
        </div>

        <div className="mt-6 space-y-4">
          {rows.map((row, index) => (
            <div key={row.label}>
              <div className="flex items-center justify-between gap-3">
                <span className="body-5 t2">{row.label}</span>
                <span className="body-4 mono t1">{money(row.value, currency)}</span>
              </div>
              <div className="bar-track mt-2 h-3 overflow-hidden rounded-full">
                <div className="h-full" style={{ width: `${(row.value / max) * 100}%` }}>
                  <motion.div
                    initial={reduce ? false : { scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, delay: 0.1 + index * 0.15, ease: EASE }}
                    className={cx("bar-fill h-full rounded-full", row.accent && "accent")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
export default function SystemDesignCombo() {
  const theme = useSiteTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [activeCurriculum, setActiveCurriculum] = useState("hld");

  const trackedComboRef = useRef(null);

  // Sticky buy bar: on tablet and up it appears once the hero scrolls away.
  const heroRef = useRef(null);
  const heroVisible = useInViewport(heroRef);

  // ====================================================
  // FETCH PRODUCTS
  // ====================================================

  const fetchProducts = useCallback(async (signal) => {
    try {
      setLoading(true);
      setLoadError("");

      const response = await fetch(BOOKS_API, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || `Unable to load books (HTTP ${response.status}).`
        );
      }

      const normalized = parseBooks(result).map(normalizeBook).filter(Boolean);

      if (!signal?.aborted) setBooks(normalized);
    } catch (error) {
      if (error?.name === "AbortError") return;

      console.error("Combo books API:", error);
      setLoadError(error.message || "Unable to load products.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  // ====================================================
  // PRODUCT MATCHING
  // ====================================================

  const hld = useMemo(() => findBook(books, ROUTES.hld), [books]);
  const lld = useMemo(() => findBook(books, ROUTES.lld), [books]);

  const combo = useMemo(() => {
    const direct = findBook(books, ROUTES.combo);

    if (direct?.resourceType === "bundle") return direct;

    if (!hld?._id || !lld?._id) return null;

    return (
      books.find((book) => {
        if (book.resourceType !== "bundle") return false;

        const includedIds = book.includedBooks.map(getId);

        return includedIds.includes(hld._id) && includedIds.includes(lld._id);
      }) || null
    );
  }, [books, hld, lld]);

  const canBuy = purchasable(combo) && combo.resourceType === "bundle";

  // Meta Pixel: ViewContent only after the real bundle is loaded.
  useEffect(() => {
    if (!canBuy || !combo?._id) return;

    const price = Number(combo.price);
    if (!Number.isFinite(price) || price < 0) return;

    const currencyCode = combo.currency || "INR";
    const key = `${combo._id}:${price}:${currencyCode}`;
    if (trackedComboRef.current === key) return;

    try {
      const sent = trackViewContent({
        id: String(combo._id),
        title: combo.title || "Mastering System Design — HLD + LLD Combo",
        price,
        currency: currencyCode,
      });

      if (sent !== false) trackedComboRef.current = key;
    } catch (error) {
      console.warn("Combo ViewContent tracking failed:", error);
    }
  }, [canBuy, combo?._id, combo?.title, combo?.price, combo?.currency]);

  const currency = combo?.currency || "INR";

  const originalSeparatePrice =
    purchasable(hld) &&
    purchasable(lld) &&
    hld.currency === lld.currency &&
    lld.currency === currency
      ? Number(hld.price) + Number(lld.price)
      : null;

  const savings =
    canBuy && originalSeparatePrice !== null
      ? Math.max(0, originalSeparatePrice - Number(combo.price))
      : null;

  const combinedDiscount = discount(combo);

  const totalModules = HLD_MODULES.length + LLD_MODULES.length;

  const totalTopics = [...HLD_MODULES, ...LLD_MODULES].reduce(
    (sum, module) => sum + module.topics.length,
    0
  );

  const priceText = loading
    ? "…"
    : canBuy
      ? money(combo.price, currency)
      : "Unavailable";

  // ====================================================
  // CHECKOUT
  // ====================================================

  const buyCombo = () => {
    if (!canBuy) return;

    setCheckoutProduct(combo);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutProduct(null);
  };

  // ====================================================
  // SEO
  // ====================================================
  const canonical = `${SITE_URL}${ROUTES.combo}`;
  const allFaqs = useMemo(() => [...FAQS, ...EXTRA_FAQS], []);
  const comboName = combo?.title || "Mastering System Design — HLD + LLD Combo";
  const comboCover = combo?.coverPageUrl || hld?.coverPageUrl || lld?.coverPageUrl || "";

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
          email: SUPPORT_EMAIL,
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
          "@id": `${canonical}#webpage`,
          url: canonical,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          inLanguage: "en-IN",
          isPartOf: { "@id": `${SITE_URL}/#website` },
          breadcrumb: { "@id": `${canonical}#breadcrumb` },
          about: { "@id": `${canonical}#product` },
          ...(comboCover ? { primaryImageOfPage: { "@type": "ImageObject", url: comboCover } } : {}),
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${canonical}#breadcrumb`,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
            { "@type": "ListItem", position: 3, name: "HLD + LLD Combo", item: canonical },
          ],
        },
        {
          "@type": "Product",
          "@id": `${canonical}#product`,
          name: comboName,
          description: SEO_LONG_DESCRIPTION,
          url: canonical,
          category: "System Design Ebook Bundle",
          keywords: SEO_KEYWORDS,
          brand: { "@type": "Brand", name: SITE_NAME },
          ...(combo?._id ? { sku: String(combo._id) } : {}),
          ...(comboCover ? { image: [comboCover] } : {}),
          isRelatedTo: [
            { "@type": "Book", name: hld?.title || "Mastering System Design — HLD", url: `${SITE_URL}${ROUTES.hld}`, bookFormat: "https://schema.org/EBook" },
            { "@type": "Book", name: lld?.title || "Mastering System Design — LLD (Java)", url: `${SITE_URL}${ROUTES.lld}`, bookFormat: "https://schema.org/EBook" },
          ],
          ...(canBuy
            ? {
                offers: {
                  "@type": "Offer",
                  url: canonical,
                  price: Number(combo.price),
                  priceCurrency: currency,
                  priceValidUntil,
                  availability: "https://schema.org/InStock",
                  itemCondition: "https://schema.org/NewCondition",
                  hasMerchantReturnPolicy: {
                    "@type": "MerchantReturnPolicy",
                    returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
                  },
                  seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
                },
              }
            : {}),
        },
        {
          "@type": "ItemList",
          "@id": `${canonical}#case-studies`,
          name: "System design case studies in the HLD + LLD combo",
          numberOfItems: PROBLEMS.length,
          itemListElement: PROBLEMS.map((problem, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `Design ${problem.title} (${problem.category})`,
            description: problem.focus,
          })),
        },
        {
          "@type": "FAQPage",
          "@id": `${canonical}#faq`,
          mainEntity: allFaqs.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        },
      ],
    };
  }, [allFaqs, canBuy, canonical, combo?._id, combo?.price, comboCover, comboName, currency, hld?.title, lld?.title]);

  /* ---------------------------------------------------------------- */
  /*  Presentation                                                     */
  /* ---------------------------------------------------------------- */

  const reduce = useReducedMotion();
  const goTo = useGoToSection();
  const rootRef = useRef(null);
  useNavOffset(rootRef);

  const priceNode = loading ? <PriceSkeleton /> : priceText;
  const hasMrp = canBuy && Number(combo.mrp) > Number(combo.price);
  const mrpNode = hasMrp ? money(combo.mrp, currency) : null;
  const bookStatus = (book) => (loading ? "loading" : purchasable(book) ? "ready" : "error");

  return (
    <>
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta name="author" content={SITE_NAME} />
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="theme-color" content={theme === "dark" ? "#000000" : "#ffffff"} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en-IN" href={canonical} />
        <link rel="alternate" hrefLang="x-default" href={canonical} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONT_HREF} rel="stylesheet" />
        {comboCover && <link rel="preload" as="image" href={comboCover} />}

        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={canonical} />
        {canBuy && <meta property="product:price:amount" content={String(combo.price)} />}
        {canBuy && <meta property="product:price:currency" content={currency} />}
        {comboCover && <meta property="og:image" content={comboCover} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        {comboCover && <meta name="twitter:image" content={comboCover} />}

        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div ref={rootRef} className="hld min-h-screen overflow-x-hidden pb-28" data-theme={theme}>
        <SkipLink />
        <ScrollProgress />
        <FloatNav
          links={NAV_LINKS}
          show={!heroVisible && !checkoutOpen}
          onBuy={buyCombo}
          canBuy={canBuy}
          buyLabel="Get the combo"
        />
        <Breadcrumb current="HLD + LLD Combo" />

        <main id="page-main">
          {loadError && (
            <div className="bg-base">
              <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div role="alert" className="alert flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
                  <span className="body-6">
                    <strong className="font-semibold">Book details could not be loaded. </strong>
                    {loadError}
                  </span>
                  <button type="button" onClick={() => fetchProducts()} className="btn btn-secondary button-sm">
                    <ArrowsClockwise size={16} weight="bold" />
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------ HERO ------------------------------ */}
          <section ref={heroRef} aria-labelledby="combo-hero-title" className="bg-base relative">
            <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center lg:px-8 lg:pb-24 lg:pt-12">
              <div className="min-w-0">
                <Reveal y={16}>
                  <span className="chip chip-accent caption-3">
                    <Package size={14} weight="bold" />
                    The complete system design collection
                  </span>
                </Reveal>

                <Reveal as="h1" delay={0.06} id="combo-hero-title" className="hero-title heading-1 mt-4 max-w-[680px] pb-1">
                  <span className="block">System design</span>
                  <span className="block">HLD + LLD combo.</span>
                  <span className="block">35 case studies.</span>
                </Reveal>

                <Reveal as="p" delay={0.12} className="body-3 t2 mt-6 max-w-[680px] sm:text-lg sm:leading-7">
                  From large scale architecture to production minded Java class design. Learn how
                  systems are structured, how their components work together, and how to discuss
                  engineering tradeoffs in system design interviews.
                </Reveal>

                <Reveal delay={0.18} className="mt-8 flex flex-wrap items-center gap-3">
                  <button type="button" onClick={buyCombo} disabled={!canBuy} className="btn btn-primary btn-lg button-md">
                    Get the combo {priceNode !== "Unavailable" && priceNode}
                    <ArrowRight className="arrow" size={20} weight="bold" />
                  </button>
                  <a href="#curriculum" onClick={(event) => goTo(event, "#curriculum")} className="btn btn-ghost btn-lg button-md">
                    <BookOpen size={20} weight="bold" />
                    Explore the curriculum
                  </a>
                </Reveal>

                <Reveal delay={0.24} className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {[
                    [FileText, "Two separate PDF downloads"],
                    [Lock, `Secure checkout via ${PROVIDER_NAME}`],
                    [DownloadSimple, "Access after payment verification"],
                  ].map(([Icon, text]) => (
                    <span key={text} className="caption-1 t2 inline-flex items-center gap-2">
                      <Icon className="ta" size={16} weight="bold" />
                      {text}
                    </span>
                  ))}
                </Reveal>
              </div>

              {/* Books + price */}
              <Reveal delay={0.15} className="mx-auto w-full max-w-sm lg:max-w-none">
                <div className="bg-s2 bd relative rounded-3xl p-6 sm:p-8">
                  <FloatChip className="right-3 top-4 sm:right-4" delay={0.8}>
                    <p className="heading-6 mono ta">2 books</p>
                    <p className="caption-4 t2">one checkout</p>
                  </FloatChip>

                  <TwoBooks hld={hld} lld={lld} />

                  <div className="card mt-6 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="eyebrow caption-3">HLD + LLD (Java) · 2 PDFs</p>
                        <div className="mt-2 flex flex-wrap items-baseline gap-2">
                          <span className="heading-4 mono t1">{priceNode}</span>
                          {mrpNode && <span className="body-5 mono t3 strike">{mrpNode}</span>}
                        </div>
                      </div>
                      {combinedDiscount > 0 && (
                        <span className="chip chip-accent caption-3 mono">{combinedDiscount}% off</span>
                      )}
                    </div>
                    {savings !== null && savings > 0 && (
                      <p className="caption-3 tok mt-2">
                        Save {money(savings, currency)} compared with buying both separately
                      </p>
                    )}
                    <ul className="mt-4 space-y-2">
                      {["High Level Design PDF", "Low Level Design (Java) PDF", "Digital access after verification"].map((item) => (
                        <li key={item} className="caption-1 t2 flex items-center gap-2">
                          <Check className="ta shrink-0" size={14} weight="bold" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          {/* ---------------------- THE TWO BOOKS (HLD, LLD) -------------------- */}
          <Section id="included-books" alt labelledBy="included-title">
            <SectionHeader
              id="included-title"
              eyebrow="Inside your combo"
              title="Two complete books. One purchase."
              description="The combo brings together system architecture and Java object design. You can also open either book on its own page."
            />

            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              <Reveal>
                <BookOfferCard
                  eyebrow="Book 01 · High level design"
                  title={hld?.title && hld.title !== "Untitled" ? hld.title : "Mastering System Design: HLD"}
                  subtitle="Architecture and scale"
                  description="Requirements, APIs, distributed systems, databases, caching, queues, scalability and reliability."
                  cover={hld?.coverPageUrl}
                  features={BOOK_FACTS.hld}
                  status={bookStatus(hld)}
                  price={hld?.price}
                  mrp={hld?.mrp}
                  currency={hld?.currency}
                  href={ROUTES.hld}
                  viewLabel="View the HLD book"
                />
              </Reveal>
              <Reveal delay={0.1}>
                <BookOfferCard
                  eyebrow="Book 02 · Low level design"
                  title={lld?.title && lld.title !== "Untitled" ? lld.title : "Mastering System Design: LLD (Java)"}
                  subtitle="Java first class design"
                  description="Java fundamentals, OOP, SOLID, 23 GoF patterns, UML, Spring Boot architecture, concurrency, testing and 16 LLD case studies."
                  cover={lld?.coverPageUrl}
                  features={BOOK_FACTS.lld}
                  status={bookStatus(lld)}
                  price={lld?.price}
                  mrp={lld?.mrp}
                  currency={lld?.currency}
                  href={ROUTES.lld}
                  viewLabel="View the LLD book"
                />
              </Reveal>
            </div>
          </Section>

          {/* ------------------------------ PROOF ------------------------------ */}
          <StatsStrip label="Combo at a glance" items={GLANCE_STATS.map((item) => [item.value, "", item.label])} />
          <div className="bg-base pb-16">
            <Marquee terms={MARQUEE_TERMS} label="Topics covered in both books" />
          </div>

          <TaglineReveal text={TAGLINE} />

          {/* ---------------------------- WHY THE COMBO ------------------------ */}
          <Section id="why-combo" alt labelledBy="why-title">
            <SectionHeader
              id="why-title"
              eyebrow="Why choose the combo"
              title="Interviewers test both halves. Prepare for both."
              description="A strong candidate can zoom out to the whole architecture and zoom in to a clean class design. The combo is built around that skill."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_COMBO.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={(index % 3) * 0.07}>
                    <article className="card lift h-full rounded-3xl p-6">
                      <span className="tile h-12 w-12 rounded-xl">
                        <Icon size={24} weight="duotone" />
                      </span>
                      <h3 className="heading-6 t1 mt-6">{item.title}</h3>
                      <p className="body-6 t2 mt-2">{item.text}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </Section>

          {/* ------------------------ HLD VS LLD + ROUNDS ---------------------- */}
          <Section id="round-picker" labelledBy="round-title">
            <SectionHeader
              id="round-title"
              eyebrow="The complete picture"
              title="Architecture decisions and implementation decisions"
              description="A strong system design answer connects the components of a system with the internal design of those components."
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {DESIGN_LEVELS.map((item, cardIndex) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={cardIndex * 0.1}>
                    <article className="card lift h-full rounded-3xl p-6 sm:p-8">
                      <span className="tile h-12 w-12 rounded-xl">
                        <Icon size={24} weight="duotone" />
                      </span>
                      <h3 className="heading-5 t1 mt-6">{item.title}</h3>
                      <p className="body-6 t2 mt-2">{item.intro}</p>
                      <ul className="mt-6 space-y-3">
                        {item.points.map((point) => (
                          <li key={point} className="flex items-start gap-3">
                            <Check className="ta mt-0.5 shrink-0" size={16} weight="bold" />
                            <span className="body-6 t1">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  </Reveal>
                );
              })}
            </div>

            <Reveal className="mt-6">
              <div className="rule bd grid gap-px overflow-hidden rounded-3xl">
                <div className="bg-s2 grid grid-cols-[3fr_1fr_1fr] gap-3 px-4 py-3">
                  <span className="caption-3 t3 uppercase tracking-wider">Interview round</span>
                  <span className="caption-3 t3 text-center uppercase tracking-wider">HLD</span>
                  <span className="caption-3 t3 text-center uppercase tracking-wider">LLD</span>
                </div>
                {ROUND_MATRIX.map((row) => (
                  <div key={row.round} className="bg-s1 row-hover grid grid-cols-[3fr_1fr_1fr] items-center gap-3 px-4 py-4">
                    <span className="body-5 t1">{row.round}</span>
                    <span className="flex justify-center"><YesNo yes={row.hld} /></span>
                    <span className="flex justify-center"><YesNo yes={row.lld} /></span>
                  </div>
                ))}
              </div>
            </Reveal>

            <ClassifyGame />
          </Section>

          {/* ----------------------------- CURRICULUM -------------------------- */}
          <Section id="curriculum" alt labelledBy="curriculum-title">
            <SectionHeader
              id="curriculum-title"
              eyebrow="Detailed curriculum"
              title="Explore the subjects in depth"
              description="Move through foundations, architecture, Java object design, concurrency, practical scenarios and interview problem solving techniques."
            />

            <Reveal className="mt-8">
              <PillTabs
                label="Choose a book curriculum"
                value={activeCurriculum}
                onChange={setActiveCurriculum}
                items={[
                  { id: "hld", label: "HLD · Architecture", count: HLD_MODULES.length },
                  { id: "lld", label: "LLD · Java", count: LLD_MODULES.length },
                ]}
              />
            </Reveal>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeCurriculum}
                role="tabpanel"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mt-6"
              >
                {activeCurriculum === "hld" ? (
                  <ModuleList key="hld" modules={HLD_MODULES} prefix="hld" />
                ) : (
                  <ModuleList key="lld" modules={LLD_MODULES} prefix="lld" />
                )}
              </motion.div>
            </AnimatePresence>

            <p className="caption-2 t3 mt-4">
              This outline lists {totalModules} modules and {totalTopics} topic entries. It is a topic level
              study guide for the collection, not a page by page table of contents from the PDFs.
            </p>
          </Section>

          {/* ---------------------------- CASE STUDIES ------------------------- */}
          <Section id="practice" labelledBy="practice-title">
            <SectionHeader
              id="practice-title"
              eyebrow="Applied design"
              title="Real world systems to study"
              description="Use familiar products and engineering problems to practice system architecture, class modeling, concurrency and failure handling."
            />
            <ProblemExplorer />
            <Reveal className="mt-10 flex flex-col items-center gap-3 text-center">
              <p className="body-2 t1">35 worked designs across the two books.</p>
              <button type="button" onClick={buyCombo} disabled={!canBuy} className="btn btn-primary btn-lg button-md">
                Get the combo {priceNode !== "Unavailable" && priceNode}
                <ArrowRight className="arrow" size={18} weight="bold" />
              </button>
            </Reveal>
          </Section>

          {/* ------------------------------ METHOD ----------------------------- */}
          <Section id="method" alt labelledBy="method-title">
            <SectionHeader
              id="method-title"
              eyebrow="Interview preparation"
              title="A repeatable approach to design rounds"
              description="Practice explaining why a design works, not just drawing boxes or naming design patterns."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {METHOD_STEPS.map(([number, title, description], index) => (
                <Reveal key={number} delay={(index % 3) * 0.07}>
                  <article className="card lift h-full rounded-3xl p-6">
                    <span className="num heading-4 mono">{number}</span>
                    <h3 className="heading-6 t1 mt-4">{title}</h3>
                    <p className="body-6 t2 mt-2">{description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ----------------------------- STUDY PLAN -------------------------- */}
          <Section id="study-plan" labelledBy="plan-title">
            <SectionHeader
              id="plan-title"
              eyebrow="How to prepare"
              title="Pick your timeline. Get a study plan."
              description="Choose how much time you have before the interview. The plan shows how to split it between the two books."
            />
            <PlanBuilder />

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {STAGES.map(([stage, title, text], index) => (
                <Reveal key={stage} delay={index * 0.07} y={24}>
                  <article className="card lift h-full rounded-2xl p-4 sm:p-6">
                    <span className="num caption-3 mono">{stage}</span>
                    <h3 className="title-2 t1 mt-3">{title}</h3>
                    <p className="body-6 t2 mt-1">{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </Section>

          {/* ------------------------------ READERS ---------------------------- */}
          <Section id="readers" alt labelledBy="who-title">
            <SectionHeader
              id="who-title"
              eyebrow="Intended readers"
              title="Built for developers who want stronger design fundamentals"
            />

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {READERS.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal key={item.title} delay={index * 0.08}>
                    <article className="card lift h-full rounded-3xl p-6">
                      <span className="tile h-12 w-12 rounded-xl">
                        <Icon size={24} weight="duotone" />
                      </span>
                      <h3 className="heading-6 t1 mt-6">{item.title}</h3>
                      <p className="body-6 t2 mt-2">{item.detail}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </Section>

          {/* ------------------------------ PAYMENTS --------------------------- */}
          <Section id="payments" labelledBy="payments-title">
            <SectionHeader
              id="payments-title"
              eyebrow="Checkout and delivery"
              title="A straightforward digital purchase"
              description={`Your checkout is powered by ${PROVIDER_NAME}. The payment methods you see depend on those enabled for the merchant account.`}
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              <Reveal>
                <div className="card h-full rounded-3xl p-6 sm:p-8">
                  <h3 className="heading-6 t1">Payment options</h3>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {PAY_OPTIONS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title} className="bg-s2 row-hover rounded-xl p-4">
                          <Icon className="ta" size={24} weight="duotone" />
                          <p className="body-4 t1 mt-3">{item.title}</p>
                          <p className="caption-2 t2 mt-1">{item.text}</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="caption-2 t3 mt-4">
                    Payment availability is decided at checkout. This page does not verify which methods are active.
                  </p>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="card h-full rounded-3xl p-6 sm:p-8">
                  <h3 className="heading-6 t1">After successful payment</h3>
                  <ol className="mt-6 space-y-6">
                    {AFTER_PAYMENT.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <Reveal as="li" key={item.title} y={16} delay={index * 0.1} className="flex items-start gap-4">
                          <span className="tile h-10 w-10 rounded-lg">
                            <Icon size={20} weight="duotone" />
                          </span>
                          <div>
                            <h4 className="body-1 t1">{item.title}</h4>
                            <p className="body-6 t2 mt-1">{item.text}</p>
                          </div>
                        </Reveal>
                      );
                    })}
                  </ol>
                </div>
              </Reveal>
            </div>
          </Section>

          {/* ------------------------------ PRICING ---------------------------- */}
          <Section id="pricing" alt labelledBy="pricing-title">
            <SectionHeader
              id="pricing-title"
              eyebrow="Pricing"
              title="One book or the complete combo"
              description="Buy an individual edition, or choose the combo and receive both."
            />

            <SavingsBars hld={hld} lld={lld} combo={combo} currency={currency} savings={savings || 0} />

            <Reveal className="mt-6">
              <div className="rule bd grid gap-px overflow-hidden rounded-3xl">
                <div className="bg-s2 grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-3 py-3 sm:px-6">
                  <span />
                  <span className="caption-3 t3 text-center uppercase tracking-wider">HLD</span>
                  <span className="caption-3 t3 text-center uppercase tracking-wider">LLD</span>
                  <span className="caption-3 ta text-center uppercase tracking-wider">Combo</span>
                </div>
                {INCLUDES_MATRIX.map((row) => (
                  <div key={row[0]} className="bg-s1 row-hover grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 px-3 py-4 sm:px-6">
                    <span className="body-5 t1">{row[0]}</span>
                    {row.slice(1).map((yes, index) => (
                      <span key={index} className="flex justify-center"><YesNo yes={yes} /></span>
                    ))}
                  </div>
                ))}
                <div className="bg-s1 grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 px-3 py-4 sm:px-6">
                  <span className="body-4 t1">Price</span>
                  {[hld, lld, combo].map((book, index) => (
                    <span key={index} className={cx("body-4 mono text-center", index === 2 ? "ta" : "t1")}>
                      {loading ? <PriceSkeleton className="h-4 w-10" /> : purchasable(book) ? money(book.price, book.currency) : "–"}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal className="mt-6">
              <div className="card no-scrollbar overflow-x-auto rounded-3xl">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="bg-s2">
                      {["", "HLD", "LLD (Java)", "Combo"].map((label, index) => (
                        <th key={index} scope="col" className="caption-3 t3 p-4 uppercase tracking-wider">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((row) => (
                      <tr key={row[0]} className="row-hover">
                        <th scope="row" className="body-4 t1 p-4">{row[0]}</th>
                        {row.slice(1).map((cell, index) => (
                          <td key={index} className={cx("body-6 p-4", index === 2 ? "ta font-semibold" : "t2")}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Reveal>
          </Section>

          {/* -------------------------------- FAQ ------------------------------ */}
          <Section id="faq" narrow labelledBy="faq-title">
            <SectionHeader id="faq-title" eyebrow="Questions" title="Frequently asked questions" align="center" />
            <FaqList items={allFaqs} idPrefix="combo-faq" defaultOpen={0} />
          </Section>

          <FinalCta
            titleId="combo-final"
            eyebrow="Complete digital collection"
            title="Get HLD and LLD together."
            copy="Two ebooks, one checkout, separate PDF downloads."
            price={priceNode}
            mrp={mrpNode}
            onBuy={buyCombo}
            canBuy={canBuy}
            buyLabel="Get the combo"
            secondary={{ label: "See what is inside", onClick: (event) => goTo(event, "#included-books") }}
            note="Digital products are not refundable after purchase."
          />
        </main>

        <footer className="bg-base caption-2 t3 px-4 pb-8 text-center">
          <p>
            Need help with a purchase?{" "}
            <a className="link focusable font-semibold" href={`mailto:${SUPPORT_EMAIL}`}>
              Contact Target Trek support
            </a>
          </p>
          <p className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-2">
            <Link className="link focusable font-medium" to={ROUTES.hld}>System Design HLD</Link>
            <Link className="link focusable font-medium" to={ROUTES.lld}>System Design LLD (Java)</Link>
            <a className="link focusable font-medium" href="/books">All books</a>
          </p>
        </footer>

        <BuyBar
          title="HLD + LLD Complete Combo"
          price={priceNode}
          mrp={mrpNode}
          discount={combinedDiscount}
          onBuy={buyCombo}
          canBuy={canBuy && !loadError}
          buyLabel="Get the combo"
          hidden={checkoutOpen}
          heroVisible={heroVisible && !loading}
          secondary={{ label: "What is inside", onClick: (event) => goTo(event, "#included-books") }}
        />
      </div>

      <PayUCheckoutModal isOpen={checkoutOpen} onClose={closeCheckout} product={checkoutProduct} />
    </>
  );
}
