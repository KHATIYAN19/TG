/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowRight,
  ArrowsClockwise,
  BookOpen,
  CaretRight,
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
  Minus,
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
import { loadCatalog } from "../utils/bookApi";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { gatewayLabel, preferredGateway } from "../payment/gatewayConfig";
import { useSiteTheme } from "./systemDesign/ui.jsx";

import "./systemDesignCombo.css";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap";

const EASE = [0.22, 1, 0.36, 1];

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
/*  Small pieces                                                       */
/* ------------------------------------------------------------------ */

const cx = (...classes) => classes.filter(Boolean).join(" ");
const twoDigits = (n) => String(n).padStart(2, "0");

const scrollToId = (id) => {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

function Reveal({ children, delay = 0, className, as = "div", ...rest }) {
  const Tag = motion[as] || motion.div;
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

function Head({ id, eyebrow, title, text, center = false }) {
  return (
    <div className={cx("cb-head", center && "is-center")}>
      <Reveal>
        <span className="cb-eyebrow">{eyebrow}</span>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 id={id} className="cb-h2">
          {title}
        </h2>
      </Reveal>
      {text && (
        <Reveal delay={0.12}>
          <p className="cb-lead">{text}</p>
        </Reveal>
      )}
    </div>
  );
}

function Cover({ book, label, priority = false }) {
  const [failed, setFailed] = useState(false);
  const src = book?.coverPageUrl;

  return (
    <div className="cb-cover">
      {src && !failed ? (
        <img
          src={src}
          alt={`${label} ebook cover`}
          width="300"
          height="400"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cb-cover-fallback">
          <span>TARGET TREK</span>
          <strong>
            Mastering System Design
            <br />
            {label}
          </strong>
        </div>
      )}
    </div>
  );
}

function PriceTag({ book, loading, large = false }) {
  if (loading) {
    return <span className="cb-skel" style={{ width: large ? 120 : 70, height: large ? 30 : 18 }} />;
  }
  if (!purchasable(book)) return <span className="cb-muted">Unavailable</span>;

  const off = discount(book);
  return (
    <span className="cb-price-row">
      <span className="cb-price-now" style={large ? undefined : { fontSize: "inherit" }}>
        {money(book.price, book.currency)}
      </span>
      {Number(book.mrp) > Number(book.price) && (
        <s className="cb-price-mrp">{money(book.mrp, book.currency)}</s>
      )}
      {large && off > 0 && <span className="cb-off">{off}% off</span>}
    </span>
  );
}

function YesNo({ yes }) {
  return yes ? (
    <CheckCircle className="cb-yes" size={20} weight="fill" aria-label="Included" />
  ) : (
    <Minus className="cb-no" size={18} weight="bold" aria-label="Not included" />
  );
}

/* ------------------------------------------------------------------ */
/*  Interactive blocks                                                 */
/* ------------------------------------------------------------------ */

// Accordion: topics stay in the DOM for crawlers (hidden attribute only).
function ModuleList({ modules, prefix }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="cb-modules">
      {modules.map((module, index) => {
        const expanded = open === index;
        const panelId = `${prefix}-panel-${index}`;

        return (
          <article key={`${prefix}-${index}`} className={cx("cb-module", expanded && "is-open")}>
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? -1 : index)}
              >
                <span className="cb-module-n">{twoDigits(index + 1)}</span>
                <span className="cb-module-t">
                  <b>{module.title}</b>
                  <span>{module.description}</span>
                  <small>{module.topics.length} topics</small>
                </span>
                <span className="cb-module-icon" aria-hidden="true">
                  <Plus size={14} weight="bold" />
                </span>
              </button>
            </h3>

            <ul id={panelId} hidden={!expanded}>
              {module.topics.map((topic) => (
                <li key={topic}>
                  <Check size={14} weight="bold" />
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </article>
        );
      })}
    </div>
  );
}

// "Is it HLD or LLD?" quick game
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
    <Reveal className="cb-game">
      <div className="cb-game-top">
        <span className="cb-eyebrow">Quick game · Is it HLD or LLD?</span>
        <small>
          {done ? "Finished" : `Question ${index + 1} of ${CLASSIFY_QUIZ.length}`} · Score {score}
        </small>
      </div>

      <div className="cb-game-bar" aria-hidden="true">
        {CLASSIFY_QUIZ.map((q, i) => (
          <i key={q.prompt} className={cx((i <= index || done) && "is-on")} />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            className="cb-game-done"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <span className="cb-tile">
              <Trophy size={24} weight="duotone" />
            </span>
            <h3>
              You scored <span className="cb-mono">{score} / {CLASSIFY_QUIZ.length}</span>
            </h3>
            <p>Real interviews mix both skills. The combo trains the architecture and the class level design in one plan.</p>
            <button type="button" onClick={restart} className="cb-btn cb-btn-ghost cb-btn-sm">
              <ArrowsClockwise size={16} weight="bold" />
              Play again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: reduce ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduce ? 0 : -20 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="cb-game-q">{item.prompt}</p>

            <div className="cb-choices">
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
                    className="cb-choice"
                    data-state={state}
                    disabled={answered}
                    onClick={() => choose(id)}
                  >
                    <span className="cb-tile" style={{ width: 40, height: 40, borderRadius: 12 }}>
                      <Icon size={20} weight="duotone" />
                    </span>
                    <span>
                      <b>{label}</b>
                      <small>{hint}</small>
                    </span>
                    {state === "right" && <CheckCircle className="cb-mark cb-yes" size={22} weight="fill" />}
                    {state === "wrong" && <XCircle className="cb-mark" size={22} weight="fill" style={{ color: "var(--pen)" }} />}
                  </button>
                );
              })}
            </div>

            {answered && (
              <div>
                <div className="cb-explain">
                  <b>{picked === item.answer ? "Correct" : "Not quite"}</b>
                  <p>{item.explain}</p>
                </div>
                <button type="button" onClick={next} className="cb-btn cb-btn-primary cb-btn-sm" style={{ marginTop: 14 }}>
                  {index + 1 >= CLASSIFY_QUIZ.length ? "See my score" : "Next question"}
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Reveal>
  );
}

function PlanBuilder() {
  const reduce = useReducedMotion();
  const [planId, setPlanId] = useState("14");
  const plan = STUDY_PLANS.find((item) => item.id === planId) || STUDY_PLANS[1];

  return (
    <>
      <Reveal>
        <div className="cb-switch" role="tablist" aria-label="Choose how much time you have">
          {STUDY_PLANS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={item.id === planId}
              onClick={() => setPlanId(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Reveal>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={plan.id}
          role="tabpanel"
          className="cb-plan"
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduce ? 0 : -10 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <span className="cb-eyebrow">
            <Rocket size={16} weight="bold" />
            {plan.tag}
          </span>
          <ol>
            {plan.steps.map(([when, what]) => (
              <li key={when}>
                <b>{when}</b>
                <span>{what}</span>
              </li>
            ))}
          </ol>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function ProblemExplorer() {
  const [filter, setFilter] = useState("All");
  const filters = ["All", "HLD", "LLD", "HLD + LLD"];
  const visible = filter === "All" ? PROBLEMS : PROBLEMS.filter((problem) => problem.category === filter);

  return (
    <>
      <Reveal>
        <div className="cb-switch" role="group" aria-label="Filter case studies">
          {filters.map((name) => (
            <button key={name} type="button" aria-pressed={filter === name} onClick={() => setFilter(name)}>
              {name}
              <span className="cb-mono">
                {name === "All" ? PROBLEMS.length : PROBLEMS.filter((problem) => problem.category === name).length}
              </span>
            </button>
          ))}
        </div>
      </Reveal>

      <div className="cb-problems">
        {visible.map((problem) => (
          <article key={problem.title} className={cx("cb-problem", problem.category === "HLD + LLD" && "is-both")}>
            <span className="cb-chip">{problem.category}</span>
            <h3>{problem.title}</h3>
            <p>{problem.focus}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function SavingsBars({ hld, lld, combo, currency, savings }) {
  const reduce = useReducedMotion();
  const sepTotal = purchasable(hld) && purchasable(lld) ? Number(hld.price) + Number(lld.price) : null;
  const comboPrice = purchasable(combo) ? Number(combo.price) : null;

  if (sepTotal === null || comboPrice === null || sepTotal <= 0) return null;

  const rows = [
    { label: "HLD and LLD bought separately", value: sepTotal, combo: false },
    { label: "HLD + LLD combo", value: comboPrice, combo: true },
  ];
  const max = Math.max(...rows.map((row) => row.value));

  return (
    <Reveal className="cb-bars">
      <div className="cb-bars-top">
        <h3>See what you save</h3>
        {savings > 0 && <span className="cb-chip is-mark cb-mono">You save {money(savings, currency)}</span>}
      </div>

      {rows.map((row, index) => (
        <div key={row.label} className="cb-bar">
          <div className="cb-bar-label">
            <span>{row.label}</span>
            <b>{money(row.value, currency)}</b>
          </div>
          <div className="cb-bar-track">
            <div style={{ width: `${(row.value / max) * 100}%`, height: "100%" }}>
              <motion.div
                className={cx("cb-bar-fill", row.combo && "is-combo")}
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.1 + index * 0.15, ease: EASE }}
              />
            </div>
          </div>
        </div>
      ))}
    </Reveal>
  );
}

function FaqItem({ item, index, open, onToggle }) {
  const panelId = `combo-faq-${index}`;

  return (
    <div className={cx("cb-faq-item", open && "is-open")}>
      <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <span>{item.q}</span>
        <span className="cb-module-icon" aria-hidden="true">
          <Plus size={14} weight="bold" />
        </span>
      </button>
      <p id={panelId} hidden={!open}>
        {item.a}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const TABS = NAV_LINKS.map((link) => ({ id: link.href.slice(1), label: link.label }));

export default function SystemDesignCombo() {
  const theme = useSiteTheme();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [activeCurriculum, setActiveCurriculum] = useState("hld");
  const [openFaq, setOpenFaq] = useState(0);

  const [pinned, setPinned] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [heroGone, setHeroGone] = useState(false);

  const trackedComboRef = useRef(null);
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const tabsSlotRef = useRef(null);

  // ====================================================
  // FETCH PRODUCTS (the page's single API request)
  // ====================================================

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");
      // shared, cached /book/catalog (same data the /books page uses)
      const catalog = await loadCatalog();
      setBooks(parseBooks({ data: catalog.books }).map(normalizeBook).filter(Boolean));
    } catch (error) {
      console.error("Combo books API:", error);
      setLoadError(error.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
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
  const totalTopics = [...HLD_MODULES, ...LLD_MODULES].reduce((sum, module) => sum + module.topics.length, 0);

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
  // LAYOUT: header height, pinned tabs, scrollspy, buy bar
  // ====================================================

  useEffect(() => {
    const root = rootRef.current;
    const header = document.querySelector("nav.fixed");
    if (!root || !header) return undefined;

    const sync = () => {
      const height = Math.round(header.getBoundingClientRect().height);
      if (height > 0) root.style.setProperty("--nav-h", `${height}px`);
    };

    sync();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", sync);
      return () => window.removeEventListener("resize", sync);
    }
    const observer = new ResizeObserver(sync);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  useMotionValueEvent(scrollY, "change", () => {
    const root = rootRef.current;
    const slot = tabsSlotRef.current;
    const hero = heroRef.current;
    if (!root || !slot) return;

    const navH = parseFloat(getComputedStyle(root).getPropertyValue("--nav-h")) || 64;
    const pin = slot.getBoundingClientRect().top <= navH;
    setPinned((current) => (current === pin ? current : pin));
    if (!pin) setActiveTab((current) => (current ? "" : current));

    const gone = hero ? hero.getBoundingClientRect().bottom < navH : false;
    setHeroGone((current) => (current === gone ? current : gone));
  });

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const nodes = TABS.map((tab) => document.getElementById(tab.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveTab(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

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

  const isDark = theme === "dark";
  const hldTitle = hld?.title && hld.title !== "Untitled" ? hld.title : "Mastering System Design: HLD";
  const lldTitle = lld?.title && lld.title !== "Untitled" ? lld.title : "Mastering System Design: LLD (Java)";
  const showBar = heroGone && !checkoutOpen && canBuy && !loadError;

  const buyLabel = loading ? "Get the combo" : canBuy ? `Get the combo · ${money(combo.price, currency)}` : "Currently unavailable";

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <MotionConfig reducedMotion="user">
      <Helmet htmlAttributes={{ lang: "en" }}>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta name="keywords" content={SEO_KEYWORDS} />
        <meta name="author" content={SITE_NAME} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="theme-color" content={isDark ? "#0a1312" : "#f6f8f7"} />
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

      <motion.div className="cb-progress" style={{ scaleX: progress }} aria-hidden="true" />

      <div ref={rootRef} className="cb" data-theme={isDark ? "dark" : "light"}>
        <a href="#page-main" className="cb-skip">
          Skip to content
        </a>

        <main id="page-main">
          {/* ------------------------------ HERO ------------------------------ */}
          <section ref={heroRef} className="cb-hero" aria-labelledby="combo-hero-title">
            <div className="cb-hero-bg" aria-hidden="true">
              <i />
            </div>

            <div className="cb-shell">
              <nav className="cb-crumbs" aria-label="Breadcrumb">
                <Link to="/">Home</Link>
                <CaretRight size={12} weight="bold" aria-hidden="true" />
                <Link to="/books">Books</Link>
                <CaretRight size={12} weight="bold" aria-hidden="true" />
                <span aria-current="page">HLD + LLD Combo</span>
              </nav>

              {loadError && (
                <div className="cb-card" role="alert" style={{ marginBottom: 24, borderColor: "var(--pen)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <p>
                    <b style={{ color: "var(--text)" }}>Book details could not be loaded.</b> {loadError}
                  </p>
                  <button type="button" onClick={() => fetchProducts()} className="cb-btn cb-btn-ghost cb-btn-sm">
                    <ArrowsClockwise size={16} weight="bold" />
                    Try again
                  </button>
                </div>
              )}

              <div className="cb-hero-grid">
                <div>
                  <motion.span
                    className="cb-chip is-mark"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <Package size={14} weight="bold" />
                    The complete system design collection
                  </motion.span>

                  <motion.h1
                    id="combo-hero-title"
                    className="cb-h1"
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.06, ease: EASE }}
                  >
                    HLD + LLD. <span className="cb-hl">Both halves</span> of the system design round.
                  </motion.h1>

                  <motion.p
                    className="cb-lead cb-hero-lead"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.16, ease: EASE }}
                  >
                    From large scale architecture to production minded Java class design.
                    Two complete ebooks and 35 worked case studies, so you can draw the
                    system and then build the component the interviewer zooms into.
                  </motion.p>

                  <motion.div
                    className="cb-buybox"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.26, ease: EASE }}
                  >
                    <div className="cb-price">
                      <PriceTag book={combo} loading={loading} large />
                      {savings !== null && savings > 0 && (
                        <span className="cb-save">
                          Save {money(savings, currency)} vs buying both separately
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={buyCombo}
                      disabled={!canBuy}
                      className="cb-btn cb-btn-primary cb-btn-lg"
                    >
                      {canBuy || loading ? "Get the combo" : "Currently unavailable"}
                      <ArrowRight size={18} weight="bold" />
                    </button>
                  </motion.div>

                  <motion.div
                    className="cb-hero-links"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.36 }}
                  >
                    <button type="button" className="cb-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => scrollToId("curriculum")}>
                      <BookOpen size={16} weight="bold" />
                      Explore the curriculum
                    </button>
                    <button type="button" className="cb-link" style={{ border: 0, background: "none", padding: 0 }} onClick={() => scrollToId("practice")}>
                      See all 35 case studies
                    </button>
                  </motion.div>

                  <div className="cb-trust">
                    {[
                      [FileText, "Two separate PDF downloads"],
                      [Lock, `Secure checkout via ${PROVIDER_NAME}`],
                      [DownloadSimple, "Access after payment verification"],
                    ].map(([Icon, text]) => (
                      <span key={text}>
                        <Icon size={16} weight="bold" />
                        {text}
                      </span>
                    ))}
                  </div>
                </div>

                <motion.aside
                  className="cb-stage"
                  aria-label="The two books in the combo"
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.85, delay: 0.18, ease: EASE }}
                >
                  <div className="cb-sticker">
                    <b>35</b>
                    <span>case studies</span>
                  </div>

                  <div className="cb-fan">
                    <div className="cb-fan-book is-lld">
                      <Cover book={lld} label="LLD (Java)" priority />
                    </div>
                    <div className="cb-fan-book is-hld">
                      <Cover book={hld} label="HLD" priority />
                    </div>
                    <span className="cb-plus" aria-hidden="true">
                      <Plus size={18} weight="bold" />
                    </span>
                  </div>

                  <ul className="cb-stage-list">
                    <li>
                      <HardDrives size={18} weight="duotone" />
                      High Level Design
                      <small>19 case studies</small>
                    </li>
                    <li>
                      <Code size={18} weight="duotone" />
                      Low Level Design (Java)
                      <small>16 case studies</small>
                    </li>
                  </ul>
                </motion.aside>
              </div>
            </div>
          </section>

          {/* ------------------------------ AT A GLANCE ------------------------------ */}
          <section className="cb-shell" aria-label="Combo at a glance" style={{ paddingBottom: 48 }}>
            <Reveal className="cb-stats">
              {GLANCE_STATS.map((item) => (
                <div key={item.label} className="cb-stat">
                  <b>{item.value}</b>
                  <span>{item.label}</span>
                </div>
              ))}
            </Reveal>
            <ul className="cb-terms" aria-label="Topics covered in both books">
              {MARQUEE_TERMS.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </section>

          {/* ------------------------------ TABS ------------------------------ */}
          <div className="cb-tabs-slot" ref={tabsSlotRef}>
            <nav className={cx("cb-tabs", pinned && "is-pinned")} aria-label="On this page">
              <div className="cb-shell cb-tabs-in">
                <div className="cb-tabs-list">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      className={cx("cb-tab", activeTab === tab.id && "is-on")}
                      aria-current={activeTab === tab.id ? "location" : undefined}
                      onClick={() => scrollToId(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button type="button" className="cb-btn cb-btn-primary cb-btn-sm cb-tabs-buy" disabled={!canBuy} onClick={buyCombo}>
                  {canBuy ? `Get the combo · ${money(combo.price, currency)}` : "Get the combo"}
                </button>
              </div>
            </nav>
          </div>

          {/* ------------------------------ INCLUDED BOOKS ------------------------------ */}
          <section id="included-books" className="cb-sec cb-tint" aria-labelledby="included-title">
            <div className="cb-shell">
              <Head
                id="included-title"
                eyebrow="Inside your combo"
                title={
                  <>
                    Two complete books. <span className="cb-hl">One purchase.</span>
                  </>
                }
                text="The combo brings together system architecture and Java object design. You can also open either book on its own page."
              />

              <div className="cb-books">
                {[
                  {
                    key: "hld",
                    book: hld,
                    label: "HLD",
                    eyebrow: "Book 01 · High level design",
                    title: hldTitle,
                    sub: "Architecture and scale",
                    desc: "Requirements, APIs, distributed systems, databases, caching, queues, scalability and reliability.",
                    facts: BOOK_FACTS.hld,
                    href: ROUTES.hld,
                    view: "View the HLD book",
                  },
                  {
                    key: "lld",
                    book: lld,
                    label: "LLD (Java)",
                    eyebrow: "Book 02 · Low level design",
                    title: lldTitle,
                    sub: "Java first class design",
                    desc: "Java fundamentals, OOP, SOLID, 23 GoF patterns, UML, Spring Boot architecture, concurrency, testing and 16 LLD case studies.",
                    facts: BOOK_FACTS.lld,
                    href: ROUTES.lld,
                    view: "View the LLD book",
                  },
                ].map((item, i) => (
                  <Reveal key={item.key} delay={i * 0.1} as="article" className="cb-card cb-book">
                    <div className="cb-book-media">
                      <Cover book={item.book} label={item.label} />
                    </div>
                    <div>
                      <span className="cb-eyebrow">{item.eyebrow}</span>
                      <h3>{item.title}</h3>
                      <p className="cb-book-sub">{item.sub}</p>
                      <p className="cb-book-desc">{item.desc}</p>
                      <ul className="cb-facts">
                        {item.facts.map((fact) => (
                          <li key={fact}>
                            <Check size={14} weight="bold" />
                            {fact}
                          </li>
                        ))}
                      </ul>
                      <div className="cb-book-foot">
                        <small>
                          On its own
                          <b>{loading ? "…" : purchasable(item.book) ? money(item.book.price, item.book.currency) : "–"}</b>
                        </small>
                        <Link to={item.href} className="cb-link">
                          {item.view}
                          <ArrowRight size={14} weight="bold" />
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
                <span className="cb-join" aria-hidden="true">
                  <Plus size={22} weight="bold" />
                </span>
              </div>
            </div>
          </section>

          <section className="cb-tagline" aria-label="Why both books">
            <div className="cb-shell">
              <Reveal as="p">{TAGLINE}</Reveal>
            </div>
          </section>

          {/* ------------------------------ WHY THE COMBO ------------------------------ */}
          <section id="why-combo" className="cb-sec" aria-labelledby="why-title">
            <div className="cb-shell">
              <Head
                id="why-title"
                eyebrow="Why choose the combo"
                title="Interviewers test both halves. Prepare for both."
                text="A strong candidate can zoom out to the whole architecture and zoom in to a clean class design. The combo is built around that skill."
              />

              <div className="cb-grid-3">
                {WHY_COMBO.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Reveal key={item.title} delay={(index % 3) * 0.06} as="article" className="cb-card is-lift">
                      <span className="cb-tile">
                        <Icon size={22} weight="duotone" />
                      </span>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </Reveal>
                  );
                })}
              </div>

              <div className="cb-grid-3" style={{ marginTop: 14 }}>
                {READERS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Reveal key={item.title} delay={index * 0.06} as="article" className="cb-card is-lift" style={{ background: "var(--surface-2)" }}>
                      <span className="cb-eyebrow" style={{ gap: 10 }}>
                        <Icon size={18} weight="duotone" />
                        For {item.title.toLowerCase()}
                      </span>
                      <p>{item.detail}</p>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ------------------------------ HLD OR LLD ------------------------------ */}
          <section id="round-picker" className="cb-sec cb-tint" aria-labelledby="round-title">
            <div className="cb-shell">
              <Head
                id="round-title"
                eyebrow="HLD or LLD?"
                title="Architecture decisions and implementation decisions"
                text="A strong system design answer connects the components of a system with the internal design of those components."
              />

              <div className="cb-levels">
                {DESIGN_LEVELS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Reveal key={item.title} delay={index * 0.08} as="article" className="cb-card cb-level is-lift">
                      <div className="cb-level-top">
                        <span className="cb-tile">
                          <Icon size={22} weight="duotone" />
                        </span>
                        <h3>{item.title}</h3>
                      </div>
                      <p className="cb-level-intro">{item.intro}</p>
                      <ul>
                        {item.points.map((point) => (
                          <li key={point}>
                            <Check size={14} weight="bold" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </Reveal>
                  );
                })}
              </div>

              <Reveal className="cb-matrix">
                <div className="cb-matrix-row" role="row">
                  <span>Interview round</span>
                  <span>HLD</span>
                  <span>LLD</span>
                </div>
                {ROUND_MATRIX.map((row) => (
                  <div key={row.round} className="cb-matrix-row">
                    <span>{row.round}</span>
                    <span><YesNo yes={row.hld} /></span>
                    <span><YesNo yes={row.lld} /></span>
                  </div>
                ))}
              </Reveal>

              <ClassifyGame />
            </div>
          </section>

          {/* ------------------------------ CURRICULUM ------------------------------ */}
          <section id="curriculum" className="cb-sec" aria-labelledby="curriculum-title">
            <div className="cb-shell">
              <Head
                id="curriculum-title"
                eyebrow="Detailed curriculum"
                title="Explore the subjects in depth"
                text="Foundations, architecture, Java object design, concurrency, practical scenarios and interview problem solving. Open any module to see its topics."
              />

              <Reveal>
                <div className="cb-switch" role="tablist" aria-label="Choose a book curriculum">
                  {[
                    { id: "hld", label: "HLD · Architecture", count: HLD_MODULES.length },
                    { id: "lld", label: "LLD · Java", count: LLD_MODULES.length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={activeCurriculum === tab.id}
                      onClick={() => setActiveCurriculum(tab.id)}
                    >
                      {tab.label}
                      <span className="cb-mono">{tab.count}</span>
                    </button>
                  ))}
                </div>
              </Reveal>

              {activeCurriculum === "hld" ? (
                <ModuleList key="hld" modules={HLD_MODULES} prefix="hld" />
              ) : (
                <ModuleList key="lld" modules={LLD_MODULES} prefix="lld" />
              )}

              <p className="cb-note">
                This outline lists {totalModules} modules and {totalTopics} topic entries. It is a topic level
                study guide for the collection, not a page by page table of contents from the PDFs.
              </p>
            </div>
          </section>

          {/* ------------------------------ CASE STUDIES ------------------------------ */}
          <section id="practice" className="cb-sec cb-tint" aria-labelledby="practice-title">
            <div className="cb-shell">
              <Head
                id="practice-title"
                eyebrow="Case studies"
                title="Real world systems to study"
                text="Use familiar products and engineering problems to practise system architecture, class modelling, concurrency and failure handling."
              />

              <ProblemExplorer />

              <Reveal className="cb-center">
                <p>35 worked designs across the two books.</p>
                <button type="button" onClick={buyCombo} disabled={!canBuy} className="cb-btn cb-btn-primary cb-btn-lg">
                  {buyLabel}
                  <ArrowRight size={18} weight="bold" />
                </button>
              </Reveal>
            </div>
          </section>

          {/* ------------------------------ METHOD + STUDY PLAN ------------------------------ */}
          <section className="cb-sec" aria-labelledby="method-title">
            <div className="cb-shell">
              <Head
                id="method-title"
                eyebrow="Interview method"
                title="A repeatable approach to design rounds"
                text="Practise explaining why a design works, not just drawing boxes or naming design patterns."
              />

              <div className="cb-steps">
                {METHOD_STEPS.map(([number, title, text], index) => (
                  <Reveal key={number} delay={(index % 3) * 0.06} as="article" className="cb-card cb-step is-lift">
                    <span className="cb-step-n">{number}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section id="study-plan" className="cb-sec cb-tint" aria-labelledby="plan-title">
            <div className="cb-shell">
              <Head
                id="plan-title"
                eyebrow="Study plan"
                title="Pick your timeline. Get a study plan."
                text="Choose how much time you have before the interview. The plan shows how to split it between the two books."
              />

              <PlanBuilder />

              <div className="cb-stages">
                {STAGES.map(([stage, title, text], index) => (
                  <Reveal key={stage} delay={index * 0.06} as="article" className="cb-card is-lift">
                    <small>{stage}</small>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* ------------------------------ PRICING ------------------------------ */}
          <section id="pricing" className="cb-sec" aria-labelledby="pricing-title">
            <div className="cb-shell">
              <Head
                id="pricing-title"
                eyebrow="Pricing"
                title="One book or the complete combo"
                text="Buy an individual edition, or choose the combo and receive both."
                center
              />

              <div className="cb-plans">
                {[
                  { key: "hld", name: "HLD only", book: hld, col: 1, to: ROUTES.hld },
                  { key: "lld", name: "LLD (Java) only", book: lld, col: 2, to: ROUTES.lld },
                  { key: "combo", name: "HLD + LLD combo", book: combo, col: 3 },
                ].map((plan, index) => {
                  const isCombo = plan.key === "combo";
                  return (
                    <Reveal key={plan.key} delay={index * 0.08} as="article" className={cx("cb-plan-card", isCombo && "is-combo")}>
                      {isCombo && (
                        <span className="cb-ribbon">
                          <Lightning size={12} weight="fill" />
                          Best value
                        </span>
                      )}
                      <h3>{plan.name}</h3>
                      <PriceTag book={plan.book} loading={loading} large />
                      {isCombo && savings !== null && savings > 0 && (
                        <span className="cb-save">Save {money(savings, currency)}</span>
                      )}
                      <ul>
                        {INCLUDES_MATRIX.map((row) => {
                          const yes = row[plan.col];
                          return (
                            <li key={row[0]} className={cx(!yes && "is-no")}>
                              <YesNo yes={yes} />
                              {row[0]}
                            </li>
                          );
                        })}
                      </ul>
                      {isCombo ? (
                        <button type="button" onClick={buyCombo} disabled={!canBuy} className="cb-btn cb-btn-primary">
                          Get the combo
                          <ArrowRight size={16} weight="bold" />
                        </button>
                      ) : (
                        <Link to={plan.to} className="cb-btn cb-btn-ghost">
                          View this book
                          <ArrowRight size={16} weight="bold" />
                        </Link>
                      )}
                    </Reveal>
                  );
                })}
              </div>

              <SavingsBars hld={hld} lld={lld} combo={combo} currency={currency} savings={savings || 0} />

              <Reveal className="cb-table-wrap">
                <table className="cb-table">
                  <caption className="cb-skip" style={{ position: "absolute", left: -9999 }}>
                    HLD, LLD and combo compared
                  </caption>
                  <thead>
                    <tr>
                      {["", "HLD", "LLD (Java)", "Combo"].map((label, index) => (
                        <th key={index} scope="col" className={cx(index === 3 && "is-combo")}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE_ROWS.map((row) => (
                      <tr key={row[0]}>
                        <th scope="row">{row[0]}</th>
                        {row.slice(1).map((cell, index) => (
                          <td key={index} className={cx(index === 2 && "is-combo")}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Reveal>

              <div className="cb-pay">
                <Reveal className="cb-card">
                  <h3>Checkout and payment</h3>
                  <p style={{ marginTop: 6 }}>
                    Your checkout is powered by {PROVIDER_NAME}. The methods you see depend on those enabled for the merchant account.
                  </p>
                  <div className="cb-pay-opts">
                    {PAY_OPTIONS.map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.title}>
                          <Icon size={22} weight="duotone" />
                          <b>{item.title}</b>
                          <span>{item.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </Reveal>

                <Reveal className="cb-card" delay={0.08}>
                  <h3>After successful payment</h3>
                  <ol className="cb-after">
                    {AFTER_PAYMENT.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.title}>
                          <span className="cb-tile">
                            <Icon size={20} weight="duotone" />
                          </span>
                          <span>
                            <b>{item.title}</b>
                            <span>{item.text}</span>
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                  <p className="cb-fine">Digital products are not refundable after purchase.</p>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ------------------------------ FAQ ------------------------------ */}
          <section id="faq" className="cb-sec cb-tint" aria-labelledby="faq-title">
            <div className="cb-narrow">
              <Head id="faq-title" eyebrow="Questions" title="Frequently asked questions" center />
              <div className="cb-faq">
                {allFaqs.map((item, index) => (
                  <FaqItem
                    key={item.q}
                    item={item}
                    index={index}
                    open={openFaq === index}
                    onToggle={() => setOpenFaq(openFaq === index ? -1 : index)}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* ------------------------------ FINAL CTA ------------------------------ */}
          <section className="cb-sec" aria-labelledby="combo-final">
            <div className="cb-shell">
              <Reveal className="cb-final">
                <div>
                  <span className="cb-eyebrow">Complete digital collection</span>
                  <h2 id="combo-final" className="cb-h2" style={{ marginTop: 10 }}>
                    Get HLD and LLD together.
                  </h2>
                  <p>Two ebooks, one checkout, separate PDF downloads.</p>
                </div>
                <div className="cb-final-buy">
                  <PriceTag book={combo} loading={loading} large />
                  <button type="button" onClick={buyCombo} disabled={!canBuy} className="cb-btn cb-btn-primary cb-btn-lg">
                    Get the combo
                    <ArrowRight size={18} weight="bold" />
                  </button>
                  <small>Digital products are not refundable after purchase.</small>
                </div>
              </Reveal>

              <footer className="cb-foot">
                <p>
                  Need help with a purchase?{" "}
                  <a className="cb-link" href={`mailto:${SUPPORT_EMAIL}`}>
                    Contact Target Trek support
                  </a>
                </p>
                <nav aria-label="Related books">
                  <Link className="cb-link" to={ROUTES.hld}>System Design HLD</Link>
                  <Link className="cb-link" to={ROUTES.lld}>System Design LLD (Java)</Link>
                  <Link className="cb-link" to="/books">All books</Link>
                </nav>
              </footer>
            </div>
          </section>
        </main>

        {/* ------------------------------ BOTTOM BUY BAR ------------------------------ */}
        <AnimatePresence>
          {showBar && (
            <motion.aside
              key="buybar"
              className="cb-bar-buy"
              aria-label="Buy the combo"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="cb-bar-copy">
                <b>HLD + LLD Complete Combo</b>
                <span>
                  {money(combo.price, currency)}
                  {Number(combo.mrp) > Number(combo.price) && <s>{money(combo.mrp, currency)}</s>}
                  {combinedDiscount > 0 && <em style={{ fontStyle: "normal", color: "var(--ok)" }}>{combinedDiscount}% off</em>}
                </span>
              </div>
              <button type="button" onClick={buyCombo} className="cb-btn cb-btn-primary">
                Get the combo
              </button>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <PayUCheckoutModal isOpen={checkoutOpen} onClose={closeCheckout} product={checkoutProduct} />
    </MotionConfig>
  );
}
