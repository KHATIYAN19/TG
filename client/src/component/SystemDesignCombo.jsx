import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
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
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  CreditCard,
  Download,
  GraduationCap,
  Layers3,
  LockKeyhole,
  Package,
  RefreshCw,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Timer,
  Trophy,
  WalletCards,
  XCircle,
  Zap,
} from "lucide-react";

import { trackViewContent } from "../lib/metaPixel.js";
import BASE_URL from "../utils/Url";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";

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

const RAW_GATEWAY = String(
  import.meta.env.VITE_PAYMENT_GATEWAY || "payu"
).toLowerCase().trim();

const GATEWAY = ["payu", "cashfree", "razorpay"].includes(
  RAW_GATEWAY
)
  ? RAW_GATEWAY
  : "payu";

const PROVIDER_NAME =
  GATEWAY === "cashfree"
    ? "Cashfree"
    : GATEWAY === "razorpay"
      ? "Razorpay"
      : "PayU";

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

// ======================================================
// UTILITIES
// ======================================================

const readTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    return localStorage.getItem("theme") === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const money = (value, currency = "INR") => {
  if (value == null || value === "") return "—";

  const n = Number(value);
  if (!Number.isFinite(n)) return "—";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
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

const scrollToId = (id) => {
  if (typeof document === "undefined") return;

  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
};

// ======================================================
// EXTRA CONTENT (SEO + engagement)
// ======================================================

const EASE = [0.22, 1, 0.36, 1];

const NAV_LINKS = [
  ["#included-books", "Included books"],
  ["#why-combo", "Why combo"],
  ["#round-picker", "HLD or LLD?"],
  ["#curriculum", "Curriculum"],
  ["#practice", "Case studies"],
  ["#study-plan", "Study plan"],
  ["#pricing", "Pricing"],
  ["#faq", "FAQ"],
];

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
    icon: Layers3,
    title: "Architecture + implementation",
    text: "Interviewers ask you to draw the system, then drop into one component. The combo trains both halves of that conversation.",
  },
  {
    icon: Target,
    title: "Covers every design round",
    text: "System design, machine-coding and backend deep-dive rounds map onto one book or the other — you are prepared for all three.",
  },
  {
    icon: Zap,
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

// ======================================================
// SMALL HELPERS
// ======================================================

const cx = (...classes) => classes.filter(Boolean).join(" ");

const ctaBase =
  "tc-shimmer group relative inline-flex min-h-[52px] items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 py-3 text-sm font-extrabold text-white shadow-xl shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-orange-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-50";

// ======================================================
// ANIMATION COMPONENTS
// ======================================================

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
      initial={{ opacity: 0, y, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
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
      className="fixed inset-x-0 top-0 z-[120] h-[3px] origin-left bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"
      style={{ scaleX }}
    />
  );
}

// Scroll-linked scale in / scale out.
function ScrollScale({ children, className, from = 0.94 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [from, 1, 1, from + 0.03]);
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.35, 1, 1, 0.6]);

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div ref={ref} className={className} style={{ scale, opacity }}>
      {children}
    </motion.div>
  );
}

function Tilt({ children, className }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 150, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 150, damping: 18 });

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <div
      className={className}
      style={{ perspective: 1100 }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        mx.set((event.clientX - rect.left) / rect.width - 0.5);
        my.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>{children}</motion.div>
    </div>
  );
}

// ======================================================
// DESIGN COMPONENTS
// ======================================================

function Skeleton({ className = "", dark }) {
  return <div className={`animate-pulse rounded-lg ${dark ? "bg-slate-800" : "bg-slate-200"} ${className}`} />;
}

function SectionHead({ eyebrow, title, description, dark, id, center = false }) {
  return (
    <Reveal className={cx("max-w-3xl", center && "mx-auto text-center")}>
      <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tt-orange)]">
        <Sparkles size={13} />
        {eyebrow}
      </p>

      <h2
        id={id}
        className={`mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[35px] ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>

      {description && (
        <p className={`mt-4 text-sm leading-7 sm:text-base ${dark ? "text-slate-400" : "text-slate-600"}`}>
          {description}
        </p>
      )}
    </Reveal>
  );
}

// Two overlapping books: covers come from the books API when available.
function TwoBooks({ hld, lld }) {
  const reduce = useReducedMotion();

  const covers = [
    {
      key: "lld",
      src: lld?.coverPageUrl,
      label: "LLD (Java)",
      fallback: "from-slate-800 via-orange-900 to-orange-600",
      pos: "left-[34%] top-[6%] z-10 rotate-[7deg]",
      motionProps: { y: [0, -9, 0] },
      delay: 0.6,
    },
    {
      key: "hld",
      src: hld?.coverPageUrl,
      label: "HLD",
      fallback: "from-neutral-900 via-neutral-800 to-orange-700",
      pos: "left-0 top-[14%] z-20 -rotate-[6deg]",
      motionProps: { y: [0, 10, 0] },
      delay: 0,
    },
  ];

  return (
    <Tilt className="relative mx-auto h-[330px] w-full max-w-[340px] sm:h-[380px]">
      <div className="absolute inset-6 rounded-full bg-orange-500/25 blur-3xl" aria-hidden="true" />

      {covers.map((cover) => (
        <motion.div
          key={cover.key}
          className={`absolute aspect-[0.72] w-[58%] overflow-hidden rounded-r-xl rounded-l-sm border border-white/20 shadow-[16px_22px_45px_rgba(0,0,0,0.32)] ${cover.pos}`}
          animate={reduce ? undefined : cover.motionProps}
          transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: cover.delay }}
          whileHover={reduce ? undefined : { scale: 1.06, zIndex: 40 }}
        >
          {cover.src ? (
            <img src={cover.src} alt={`${cover.label} ebook cover`} className="h-full w-full bg-white object-contain" loading="eager" />
          ) : (
            <div className={`flex h-full flex-col justify-between bg-gradient-to-br p-4 text-white ${cover.fallback}`}>
              <span className="text-[9px] font-black tracking-[0.2em]">TARGET TREK</span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-orange-200">Mastering System Design</p>
                <p className="mt-1 text-2xl font-black leading-tight">{cover.label}</p>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      <motion.span
        initial={reduce ? false : { scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 12 }}
        className="absolute bottom-3 right-2 z-30 rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2 text-xs font-black text-white shadow-lg shadow-orange-500/40"
      >
        2 books · 1 checkout
      </motion.span>
    </Tilt>
  );
}

function BookCard({ product, title, subtitle, facts, route, dark, index, loading }) {
  const card = dark ? "bg-[#1D1A17] border-slate-800" : "bg-white border-slate-200";
  const isAvailable = purchasable(product);

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={`group relative h-full overflow-hidden rounded-[24px] border p-5 transition-shadow duration-300 hover:border-[var(--tt-orange-border)] hover:shadow-[0_22px_55px_-24px_rgba(234,88,12,.45)] sm:p-6 ${card}`}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600" />

      <div className="flex items-start gap-5">
        <div className="flex aspect-[3/4] w-[92px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1.5 shadow-lg transition duration-500 group-hover:-rotate-3 group-hover:scale-105 sm:w-[115px]">
          {product?.coverPageUrl ? (
            <img src={product.coverPageUrl} alt={`${title} cover`} loading="lazy" className="h-full w-full object-contain" />
          ) : (
            <BookOpen size={32} className="text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--tt-orange)]">Book {index}</p>

          <h3 className={`mt-2 text-base font-extrabold leading-6 sm:text-lg ${dark ? "text-white" : "text-slate-950"}`}>{title}</h3>

          <p className={`mt-2 text-xs leading-6 sm:text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>{subtitle}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {loading ? (
              <Skeleton dark={dark} className="h-6 w-20" />
            ) : (
              <>
                <strong className={`text-lg ${dark ? "text-white" : "text-slate-950"}`}>
                  {isAvailable ? money(product.price, product.currency) : "Unavailable"}
                </strong>

                {product && Number(product.mrp) > Number(product.price) && (
                  <span className="text-xs text-slate-400 line-through">{money(product.mrp, product.currency)}</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <ul className="mt-5 grid gap-2 sm:grid-cols-2">
        {facts.map((fact) => (
          <li key={fact} className={`flex items-center gap-2 text-xs font-semibold ${dark ? "text-slate-300" : "text-slate-700"}`}>
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            {fact}
          </li>
        ))}
      </ul>

      <Link
        to={route}
        className={`mt-5 inline-flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-bold transition ${
          dark ? "border-slate-700 text-slate-100 hover:bg-slate-800" : "border-slate-200 text-slate-800 hover:bg-slate-50"
        }`}
      >
        View individual book
        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </motion.article>
  );
}

// Accordion: module topics stay in the DOM (crawlable) and animate open.
function ModuleList({ modules, dark, prefix }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-3">
      {modules.map((module, index) => {
        const expanded = open === index;
        const panelId = `${prefix}-panel-${index}`;

        return (
          <Reveal
            key={`${prefix}-${index}`}
            y={16}
            delay={Math.min(index, 5) * 0.04}
            className={`overflow-hidden rounded-2xl border transition-colors ${
              expanded ? "border-[var(--tt-orange-border)]" : dark ? "border-slate-800" : "border-slate-200"
            } ${dark ? "bg-[#1D1A17]" : "bg-white"}`}
          >
            <h3>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={panelId}
                onClick={() => setOpen(expanded ? -1 : index)}
                className="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5"
              >
                <span className="flex gap-4">
                  <span className="pt-0.5 text-xs font-extrabold text-[var(--tt-orange)]">{String(index + 1).padStart(2, "0")}</span>

                  <span>
                    <span className={`block text-sm font-bold sm:text-base ${dark ? "text-white" : "text-slate-950"}`}>{module.title}</span>
                    <span className={`mt-2 block text-xs font-normal leading-6 ${dark ? "text-slate-400" : "text-slate-500"}`}>{module.description}</span>
                    <span className="mt-2 block text-[11px] font-semibold text-[var(--tt-orange)]">{module.topics.length} topics</span>
                  </span>
                </span>

                <ChevronDown
                  size={18}
                  className={`shrink-0 transition-transform duration-300 ${expanded ? "rotate-180 text-[var(--tt-orange)]" : "text-slate-400"}`}
                />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <ul className={`grid gap-3 border-t px-5 py-5 sm:grid-cols-2 ${dark ? "border-slate-800" : "border-slate-100"}`}>
                  {module.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2.5">
                      <Check size={15} className="mt-1 shrink-0 text-[var(--tt-orange)]" />
                      <span className={`text-xs leading-6 sm:text-sm ${dark ? "text-slate-300" : "text-slate-700"}`}>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

// "Is it HLD or LLD?" mini game
function ClassifyGame({ dark, ui }) {
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
    <div className={`mx-auto mt-10 max-w-3xl rounded-3xl border p-5 shadow-sm sm:p-8 ${ui.card}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[var(--tt-orange)]">
          <Sparkles size={15} /> Is it HLD or LLD?
        </span>
        <span className={`text-xs font-bold ${ui.muted}`}>
          {done ? "Finished" : `Question ${index + 1} of ${CLASSIFY_QUIZ.length}`} · Score {score}
        </span>
      </div>

      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {CLASSIFY_QUIZ.map((q, i) => (
          <span
            key={q.prompt}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
              i < index || done ? "bg-orange-500" : i === index ? "bg-orange-300" : dark ? "bg-white/10" : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.div
            key="done"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            className="py-8 text-center"
          >
            <Trophy className="mx-auto text-[var(--tt-orange)]" size={42} />
            <h3 className={`mt-4 text-2xl font-black ${ui.heading}`}>You scored {score} / {CLASSIFY_QUIZ.length}</h3>
            <p className={`mx-auto mt-2 max-w-md text-sm leading-7 ${ui.muted}`}>
              Real interviews mix both skills. The combo trains the architecture and the class-level design in one plan.
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--tt-orange-border)] px-5 py-2.5 text-xs font-extrabold text-[var(--tt-orange)] transition hover:bg-[var(--tt-orange-soft)]"
            >
              <RefreshCw size={15} /> Play again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <p className={`mt-6 text-lg font-extrabold leading-snug sm:text-xl ${ui.heading}`}>{item.prompt}</p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["hld", "HLD", "Architecture", Server],
                ["lld", "LLD", "Class design", Code2],
              ].map(([id, label, hint, Icon]) => {
                const isRight = id === item.answer;
                const isPicked = id === picked;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => choose(id)}
                    disabled={answered}
                    className={cx(
                      "flex items-center gap-3 rounded-xl border px-4 py-4 text-left transition",
                      !answered && "hover:-translate-y-0.5 hover:border-orange-400",
                      !answered && (dark ? "border-slate-700 bg-white/[0.03]" : "border-slate-200 bg-white"),
                      answered && isRight && "border-emerald-500 bg-emerald-500/10",
                      answered && isPicked && !isRight && "border-red-400 bg-red-500/10",
                      answered && !isRight && !isPicked && "opacity-50"
                    )}
                  >
                    <Icon size={22} className="shrink-0 text-[var(--tt-orange)]" />
                    <span>
                      <span className={`block text-base font-black ${ui.heading}`}>{label}</span>
                      <span className={`block text-xs ${ui.muted}`}>{hint}</span>
                    </span>
                    {answered && isRight && <CheckCircle2 size={20} className="ml-auto text-emerald-600" />}
                    {answered && isPicked && !isRight && <XCircle size={20} className="ml-auto text-red-500" />}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {answered && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 rounded-xl border-l-[3px] border-[var(--tt-orange)] bg-[var(--tt-orange-soft)] p-4">
                    <p className="text-[11px] font-black uppercase tracking-wider text-[var(--tt-orange)]">
                      {picked === item.answer ? "Correct" : "Not quite"}
                    </p>
                    <p className={`mt-2 text-sm leading-7 ${ui.body}`}>{item.explain}</p>
                  </div>
                  <button type="button" onClick={next} className={`${ctaBase} mt-5 min-h-[46px] text-xs`}>
                    {index + 1 >= CLASSIFY_QUIZ.length ? "See my score" : "Next question"}
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Study-plan builder
function PlanBuilder({ dark, ui }) {
  const reduce = useReducedMotion();
  const [planId, setPlanId] = useState("14");
  const plan = STUDY_PLANS.find((item) => item.id === planId) || STUDY_PLANS[1];

  return (
    <div className="mt-8">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Choose how much time you have">
        {STUDY_PLANS.map((item) => {
          const selected = item.id === planId;

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setPlanId(item.id)}
              className={cx(
                "rounded-full border px-5 py-2.5 text-sm font-extrabold transition",
                selected
                  ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                  : dark
                    ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-orange-400"
                    : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.ol
          key={plan.id}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="relative mt-6 space-y-4"
        >
          <span aria-hidden="true" className="absolute bottom-4 left-[19px] top-4 w-px bg-gradient-to-b from-orange-500 via-orange-400/60 to-transparent" />
          <li className="relative pl-14">
            <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/30">
              <Rocket size={18} />
            </span>
            <p className="pt-2 text-xs font-extrabold uppercase tracking-widest text-[var(--tt-orange)]">{plan.tag}</p>
          </li>
          {plan.steps.map(([when, what], stepIndex) => (
            <motion.li
              key={when}
              initial={reduce ? false : { opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 + stepIndex * 0.08, duration: 0.4 }}
              className="relative pl-14"
            >
              <span className={`absolute left-[11px] top-5 h-[18px] w-[18px] rounded-full border-4 border-[var(--tt-orange)] ${dark ? "bg-[#100F0D]" : "bg-white"}`} />
              <div className={`rounded-xl border p-4 transition hover:border-[var(--tt-orange-border)] ${ui.card}`}>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--tt-orange)]">{when}</p>
                <p className={`mt-1 text-sm leading-6 ${ui.body}`}>{what}</p>
              </div>
            </motion.li>
          ))}
        </motion.ol>
      </AnimatePresence>
    </div>
  );
}

// Filterable case-study explorer
function ProblemExplorer({ dark, ui }) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState("All");
  const filters = ["All", "HLD", "LLD", "HLD + LLD"];
  const visible = filter === "All" ? PROBLEMS : PROBLEMS.filter((problem) => problem.category === filter);

  return (
    <>
      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter case studies">
        {filters.map((name) => {
          const count = name === "All" ? PROBLEMS.length : PROBLEMS.filter((problem) => problem.category === name).length;
          const selected = filter === name;

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
                  : dark
                    ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-orange-400"
                    : "border-slate-200 bg-white text-slate-700 hover:border-orange-300"
              )}
            >
              {name} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      <motion.div layout={!reduce} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((problem) => (
            <motion.article
              key={problem.title}
              layout={!reduce}
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.94 }}
              whileHover={reduce ? undefined : { y: -5 }}
              transition={{ duration: 0.3, ease: EASE }}
              className={`group h-full rounded-2xl border p-5 transition-shadow duration-300 hover:border-[var(--tt-orange-border)] hover:shadow-xl ${ui.card}`}
            >
              <span
                className={cx(
                  "inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider",
                  problem.category === "HLD"
                    ? "bg-sky-500/10 text-sky-600"
                    : problem.category === "LLD"
                      ? "bg-violet-500/10 text-violet-600"
                      : "bg-[var(--tt-orange-soft)] text-[var(--tt-orange)]"
                )}
              >
                {problem.category}
              </span>

              <h3 className={`mt-3 text-base font-bold ${ui.heading}`}>{problem.title}</h3>
              <p className={`mt-2 text-sm leading-7 ${ui.muted}`}>{problem.focus}</p>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// Animated price comparison: separate vs combo
function SavingsBars({ hld, lld, combo, currency, savings, dark, ui }) {
  const reduce = useReducedMotion();
  const sepTotal =
    purchasable(hld) && purchasable(lld) ? Number(hld.price) + Number(lld.price) : null;
  const comboPrice = purchasable(combo) ? Number(combo.price) : null;

  if (sepTotal === null || comboPrice === null || sepTotal <= 0) return null;

  const rows = [
    { label: "HLD + LLD bought separately", value: sepTotal, tone: "bg-slate-400" },
    { label: "HLD + LLD combo", value: comboPrice, tone: "bg-gradient-to-r from-orange-600 to-amber-500" },
  ];

  const max = Math.max(...rows.map((row) => row.value));

  return (
    <Reveal className={`mt-8 rounded-2xl border p-5 sm:p-7 ${ui.card}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className={`text-lg font-extrabold ${ui.heading}`}>See what you save</h3>
        {savings > 0 && (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-600">
            You save {money(savings, currency)}
          </span>
        )}
      </div>

      <div className="mt-5 space-y-4">
        {rows.map((row, index) => (
          <div key={row.label}>
            <div className="flex items-center justify-between text-xs font-bold sm:text-sm">
              <span className={ui.body}>{row.label}</span>
              <span className={ui.heading}>{money(row.value, currency)}</span>
            </div>
            <div className={`mt-2 h-3 overflow-hidden rounded-full ${dark ? "bg-white/10" : "bg-slate-100"}`}>
              <motion.div
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${(row.value / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.1 + index * 0.15, ease: EASE }}
                style={reduce ? { width: `${(row.value / max) * 100}%` } : undefined}
                className={`h-full rounded-full ${row.tone}`}
              />
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}


// ======================================================
// MAIN PAGE
// ======================================================

export default function SystemDesignCombo() {
  const reduce = useReducedMotion();

  const [theme, setTheme] = useState(readTheme);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [faqOpen, setFaqOpen] = useState(0);
  const [activeCurriculum, setActiveCurriculum] = useState("hld");

  const trackedComboRef = useRef(null);

  // Sticky buy card: on md+ it appears once the hero scrolls out of view.
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

  const dark = theme === "dark";

  // Scoped component-only colors; no Tailwind config changes required.
  const colors = useMemo(() => ({
    orange: dark ? "#FB923C" : "#EA580C",
    orangeStrong: "#F97316",
    orangeHover: dark ? "#EA580C" : "#C2410C",
    orangeSoft: dark ? "#341C10" : "#FFF2E5",
    orangeBorder: dark ? "#78350F" : "#FED7AA",
    page: dark ? "#100F0D" : "#FFFCF8",
    card: dark ? "#1D1A17" : "#FFFFFF",
    bar: dark ? "rgba(35,27,21,.97)" : "rgba(255,255,255,.97)",
    text: dark ? "#F8FAFC" : "#0F172A",
    muted: dark ? "#94A3B8" : "#475569",
  }), [dark]);

  const localColors = {
    "--tt-orange": colors.orange,
    "--tt-orange-strong": colors.orangeStrong,
    "--tt-orange-hover": colors.orangeHover,
    "--tt-orange-soft": colors.orangeSoft,
    "--tt-orange-border": colors.orangeBorder,
    "--tt-bg": colors.page,
    "--tt-card": colors.card,
    "--tt-bar": colors.bar,
    "--tt-text": colors.text,
    "--tt-muted": colors.muted,
  };

  // ====================================================
  // THEME SYNC
  // ====================================================

  useEffect(() => {
    const sync = (event) => {
      const specified = event?.detail?.theme;

      if (specified === "light" || specified === "dark") {
        setTheme(specified);
      } else {
        setTheme(readTheme());
      }
    };

    const storage = (event) => {
      if (event.key === "theme") sync();
    };

    const observer = new MutationObserver(() => {
      setTheme(readTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    window.addEventListener("targettrek-theme-change", sync);
    window.addEventListener("storage", storage);
    window.addEventListener("focus", sync);

    sync();

    return () => {
      observer.disconnect();
      window.removeEventListener("targettrek-theme-change", sync);
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", sync);
    };
  }, []);

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
  // THEME CLASSES
  // ====================================================

  const ui = useMemo(
    () => ({
      page: dark ? "bg-[#100F0D] text-slate-100" : "bg-[#FFFCF8] text-slate-900",
      card: dark ? "border-slate-800 bg-[#1D1A17]" : "border-slate-200 bg-white",
      muted: dark ? "text-slate-400" : "text-slate-600",
      heading: dark ? "text-white" : "text-slate-950",
      body: dark ? "text-slate-300" : "text-slate-700",
      border: dark ? "border-slate-800" : "border-slate-200",
      soft: dark ? "bg-[#241D17]" : "bg-[#FFF1E3]",
      alt: dark ? "border-slate-800 bg-[#15120F]" : "border-orange-100 bg-[#FFF7ED]/70",
    }),
    [dark]
  );

  const container = "mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8";

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

  // ====================================================
  // PAGE RENDER
  // ====================================================

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
        <meta name="theme-color" content={dark ? "#100F0D" : "#FFF7ED"} />
        <link rel="canonical" href={canonical} />
        <link rel="alternate" hrefLang="en-IN" href={canonical} />
        <link rel="alternate" hrefLang="x-default" href={canonical} />
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

      <style>{`
        @media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }

        .tc-gradient-text { background-size: 200% auto; animation: tc-gradient 6s linear infinite; }
        @keyframes tc-gradient { to { background-position: 200% center; } }

        .tc-orb { animation: tc-float 12s ease-in-out infinite; }
        .tc-orb-2 { animation-duration: 16s; animation-delay: -4s; }
        @keyframes tc-float {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(24px,-30px,0) scale(1.08); }
        }

        .tc-shimmer::after {
          content: ""; position: absolute; inset: 0; transform: translateX(-120%);
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.35) 50%, transparent 70%);
          animation: tc-sheen 3.4s ease-in-out infinite; pointer-events: none;
        }
        @keyframes tc-sheen { 0%, 55% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }

        .tc-pulse { animation: tc-pulse 2.4s ease-out infinite; }
        @media (min-width: 768px) { .md-tc-no-pulse { animation: none; } }
        @keyframes tc-pulse {
          0% { box-shadow: 0 0 0 0 rgba(249,115,22,.45); }
          70%, 100% { box-shadow: 0 0 0 14px rgba(249,115,22,0); }
        }

        .tc-marquee { display: flex; width: max-content; animation: tc-marquee 40s linear infinite; }
        .tc-marquee-wrap:hover .tc-marquee { animation-play-state: paused; }
        @keyframes tc-marquee { to { transform: translateX(-50%); } }

        @media (prefers-reduced-motion: reduce) {
          .tc-gradient-text, .tc-orb, .tc-shimmer::after, .tc-pulse, .tc-marquee { animation: none !important; }
          .tc-marquee { flex-wrap: wrap; width: auto; }
        }
      `}</style>

      <ScrollProgress />

      <main
        style={localColors}
        className={`min-h-screen mt-16 pb-32 transition-colors duration-300 ${ui.page}`}
      >
        {/* ON-PAGE NAVIGATION */}
        <nav
          aria-label="On this page"
          className={cx(
            "sticky top-16 z-40 border-b backdrop-blur-xl",
            dark ? "border-white/10 bg-[#100F0D]/85" : "border-orange-100 bg-white/85"
          )}
        >
          <ul className="mx-auto flex max-w-[1180px] gap-1 overflow-x-auto px-4 py-2 text-xs font-bold sm:px-6 lg:px-8">
            {NAV_LINKS.map(([href, label]) => (
              <li key={href} className="shrink-0">
                <a
                  href={href}
                  className={cx(
                    "inline-block rounded-full px-3 py-1.5 transition hover:bg-orange-500/10 hover:text-[var(--tt-orange)]",
                    dark ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {loadError && (
          <div className={`${container} pt-6`}>
            <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              <span>
                <strong>Unable to load book details.</strong> {loadError}
              </span>
              <button
                type="button"
                onClick={() => fetchProducts()}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            HERO
        ================================================= */}
        <section
          ref={heroRef}
          aria-labelledby="combo-hero-title"
          className={`${container} relative isolate pb-6 pt-7 sm:pt-12`}
        >
          <div aria-hidden="true" className="pointer-events-none absolute -z-10 inset-0 overflow-hidden">
            <div className="tc-orb absolute right-0 top-0 h-[410px] w-[68%] rounded-full bg-orange-400/15 blur-[90px]" />
            <div className="tc-orb tc-orb-2 absolute -left-20 bottom-0 h-[300px] w-[40%] rounded-full bg-amber-400/10 blur-[90px]" />
          </div>

          <nav aria-label="Breadcrumb" className={`mb-6 text-xs ${ui.muted}`}>
            <ol className="flex flex-wrap items-center gap-2">
              <li><a className="font-semibold hover:text-[var(--tt-orange)]" href="/">Home</a></li>
              <li aria-hidden="true">/</li>
              <li><a className="font-semibold hover:text-[var(--tt-orange)]" href="/books">Books</a></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className={`font-bold ${ui.heading}`}>HLD + LLD Combo</li>
            </ol>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
            <div>
              <Reveal
                y={14}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--tt-orange-border)] bg-[var(--tt-orange-soft)] px-3 py-1.5 text-xs font-bold text-[var(--tt-orange)]"
              >
                <BookOpen size={14} />
                THE COMPLETE SYSTEM DESIGN COLLECTION
              </Reveal>

              <Reveal
                as="h1"
                delay={0.06}
                id="combo-hero-title"
                className={`mt-6 max-w-3xl text-[36px] font-black leading-[1.08] tracking-[-0.05em] sm:text-[54px] lg:text-[62px] ${ui.heading}`}
              >
                System Design
                <span className="block">HLD + LLD Combo</span>
                <span className="tc-gradient-text block bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                  2 ebooks. 35 case studies.
                </span>
              </Reveal>

              <Reveal as="p" delay={0.12} className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${ui.muted}`}>
                From large-scale architecture to production-minded Java class design. Learn how systems
                are structured, how their components work together, and how to discuss engineering
                trade-offs in system design interviews.
              </Reveal>

              <Reveal delay={0.18} className="mt-6 flex flex-wrap gap-2">
                {[
                  "High-Level Design",
                  "Low-Level Design",
                  "Java",
                  "Design Patterns",
                  "Distributed Systems",
                  "System Design Interviews",
                ].map((tag, index) => (
                  <motion.span
                    key={tag}
                    whileHover={reduce ? undefined : { y: -3, scale: 1.05 }}
                    transition={{ delay: index * 0.02 }}
                    className={`cursor-default rounded-md border px-3 py-1.5 text-xs font-medium ${ui.border} ${ui.body}`}
                  >
                    {tag}
                  </motion.span>
                ))}
              </Reveal>

              <Reveal delay={0.24} className="mt-8 hidden flex-wrap gap-3 lg:flex">
                <button type="button" onClick={buyCombo} disabled={!canBuy} className={ctaBase}>
                  <CreditCard size={18} />
                  Buy Complete Combo
                  <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => scrollToId("curriculum")}
                  className={`inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:border-orange-400 ${ui.border} ${ui.body}`}
                >
                  Explore Curriculum
                  <ArrowDown size={17} />
                </button>
              </Reveal>

              <div className={`mt-9 grid grid-cols-3 gap-4 border-t pt-6 ${ui.border}`}>
                {[
                  [2, "", "Digital ebooks"],
                  [totalModules, "+", "Learning modules"],
                  [totalTopics, "+", "Topic entries"],
                ].map(([value, suffix, label], index) => (
                  <Reveal key={label} delay={0.28 + index * 0.08} y={14}>
                    <strong className={`text-2xl font-extrabold sm:text-3xl ${ui.heading}`}>
                      <CountUp to={value} suffix={suffix} />
                    </strong>
                    <p className={`mt-1 text-xs ${ui.muted}`}>{label}</p>
                  </Reveal>
                ))}
              </div>

              <p className={`mt-2 text-[11px] ${ui.muted}`}>
                Curriculum counts refer to the learning outline displayed on this page.
              </p>
            </div>

            {/* Purchase panel */}
            <Reveal delay={0.12} y={34}>
              <aside
                className={`relative overflow-hidden rounded-[28px] border border-[var(--tt-orange-border)]/70 p-6 shadow-[0_22px_65px_-35px_rgba(234,88,12,.35)] lg:sticky lg:top-32 ${ui.card}`}
              >
                <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600" />

                <TwoBooks hld={hld} lld={lld} />

                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--tt-orange)]">
                  Complete 2-book package
                </p>

                <h2 className={`mt-2 text-xl font-extrabold ${ui.heading}`}>HLD + LLD (Java)</h2>

                <p className={`mt-2 text-sm leading-6 ${ui.muted}`}>Two independent PDF ebooks with one checkout.</p>

                <div className={`my-5 border-y py-5 ${ui.border}`}>
                  {loading ? (
                    <Skeleton dark={dark} className="h-10 w-40" />
                  ) : (
                    <div className="flex flex-wrap items-end gap-2">
                      <strong className={`text-4xl font-extrabold ${ui.heading}`}>{priceText}</strong>

                      {canBuy && Number(combo.mrp) > Number(combo.price) && (
                        <span className={`pb-1 text-sm line-through ${ui.muted}`}>{money(combo.mrp, currency)}</span>
                      )}
                    </div>
                  )}

                  {combinedDiscount > 0 && (
                    <span className="mt-3 inline-flex rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
                      {combinedDiscount}% off MRP
                    </span>
                  )}

                  {savings !== null && savings > 0 && (
                    <p className="mt-3 text-xs font-semibold text-emerald-600">
                      Save {money(savings, currency)} vs buying both separately.
                    </p>
                  )}
                </div>

                <button type="button" onClick={buyCombo} disabled={!canBuy} className={`${ctaBase} w-full`}>
                  <CreditCard size={18} />
                  Buy Combo Now
                  <ArrowRight size={17} className="transition group-hover:translate-x-1" />
                </button>

                <p className={`mt-3 text-center text-[11px] ${ui.muted}`}>Checkout powered by {PROVIDER_NAME}</p>

                <ul className={`mt-5 space-y-3 border-t pt-5 ${ui.border}`}>
                  {[
                    "High-Level Design PDF",
                    "Low-Level Design (Java) PDF",
                    "Separate book downloads",
                    "Digital access after verification",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <CheckCircle2 size={17} className="shrink-0 text-emerald-600" />
                      <span className={`text-xs ${ui.body}`}>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className={`mt-5 rounded-lg p-3 ${ui.soft}`}>
                  <div className="flex items-center gap-2">
                    <LockKeyhole size={15} className="text-[var(--tt-orange)]" />
                    <span className={`text-xs font-bold ${ui.heading}`}>Secure checkout</span>
                  </div>

                  <p className={`mt-2 text-[11px] leading-5 ${ui.muted}`}>
                    Payment methods such as UPI and debit/credit cards appear when enabled for your merchant account.
                  </p>
                </div>
              </aside>
            </Reveal>
          </div>
        </section>

        {/* TECH MARQUEE */}
        <div
          className={cx("tc-marquee-wrap mt-10 overflow-hidden border-y py-4", dark ? "border-white/10 bg-[#13100E]" : "border-orange-100 bg-white")}
          aria-label="Topics covered in both books"
        >
          <div className="tc-marquee">
            {[...MARQUEE_TERMS, ...MARQUEE_TERMS].map((term, index) => (
              <span
                key={`${term}-${index}`}
                aria-hidden={index >= MARQUEE_TERMS.length ? "true" : undefined}
                className={cx(
                  "mx-2 inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em]",
                  dark ? "border-white/10 bg-white/[0.04] text-slate-300" : "border-orange-100 bg-orange-50/70 text-orange-700"
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--tt-orange)]" />
                {term}
              </span>
            ))}
          </div>
        </div>

        {/* AT A GLANCE */}
        <section aria-label="Combo at a glance" className={container}>
          <ScrollScale className="mt-10">
            <div className={`grid grid-cols-2 overflow-hidden rounded-2xl border md:grid-cols-4 ${ui.card}`}>
              {GLANCE_STATS.map((item, index) => (
                <motion.div
                  key={item.label}
                  whileHover={reduce ? undefined : { scale: 1.04 }}
                  className={cx(
                    "px-4 py-7 text-center",
                    index % 2 === 0 && "border-r",
                    index < 2 && "border-b md:border-b-0",
                    index === 1 && "md:border-r",
                    index === 2 && "md:border-r",
                    ui.border
                  )}
                >
                  <div className="text-3xl font-extrabold text-[var(--tt-orange)] sm:text-4xl">
                    <CountUp to={item.value} />
                  </div>
                  <div className={`mt-1 text-xs font-bold uppercase tracking-[0.12em] sm:text-sm ${ui.muted}`}>{item.label}</div>
                </motion.div>
              ))}
            </div>
          </ScrollScale>
        </section>

        {/* =================================================
            BOTH INDIVIDUAL BOOKS
        ================================================= */}
        <section id="included-books" aria-labelledby="included-title" className={`${container} mt-20 scroll-mt-32`}>
          <SectionHead
            id="included-title"
            eyebrow="Inside your combo"
            title="Two complete books. One purchase."
            description="The combo brings together system architecture and Java-based object design. You can also explore either book separately."
            dark={dark}
          />

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <Reveal delay={0.05}>
              <BookCard
                index="01"
                product={hld}
                loading={loading}
                title="Mastering System Design — HLD"
                subtitle="Requirements, APIs, distributed systems, databases, caching, queues, scalability and reliability."
                facts={BOOK_FACTS.hld}
                route={ROUTES.hld}
                dark={dark}
              />
            </Reveal>

            <Reveal delay={0.12}>
              <BookCard
                index="02"
                product={lld}
                loading={loading}
                title="Mastering System Design — LLD (Java)"
                subtitle="Java fundamentals, OOP, SOLID, 23 GoF patterns, UML, Spring Boot architecture, concurrency, testing and 16 LLD case studies."
                facts={BOOK_FACTS.lld}
                route={ROUTES.lld}
                dark={dark}
              />
            </Reveal>
          </div>
        </section>

        {/* =================================================
            WHY THE COMBO
        ================================================= */}
        <section id="why-combo" aria-labelledby="why-title" className={`${container} mt-20 scroll-mt-32`}>
          <SectionHead
            id="why-title"
            eyebrow="Why choose the combo"
            title="Interviewers test both halves. Prepare for both."
            description="A strong candidate can zoom out to the whole architecture and zoom in to a clean class design. The combo is built around that skill."
            dark={dark}
          />

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_COMBO.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal
                  key={item.title}
                  delay={(index % 3) * 0.07}
                  className={`group h-full rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--tt-orange-border)] hover:shadow-xl ${ui.card}`}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--tt-orange-soft)] transition duration-300 group-hover:-rotate-6 group-hover:scale-110">
                    <Icon size={23} className="text-[var(--tt-orange)]" />
                  </span>
                  <h3 className={`mt-5 text-base font-bold ${ui.heading}`}>{item.title}</h3>
                  <p className={`mt-2 text-sm leading-7 ${ui.muted}`}>{item.text}</p>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* =================================================
            HLD VS LLD + ROUND PICKER
        ================================================= */}
        <section id="round-picker" aria-labelledby="round-title" className={`mt-20 scroll-mt-32 border-y py-16 ${ui.alt}`}>
          <div className={container}>
            <SectionHead
              id="round-title"
              eyebrow="The complete picture"
              title="Architecture decisions and implementation decisions"
              description="A strong system design answer connects the components of a system with the internal design of those components."
              dark={dark}
            />

            <div className="mt-8 grid gap-5 lg:grid-cols-2">
              {[
                {
                  title: "High-Level Design",
                  icon: Server,
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
                  title: "Low-Level Design",
                  icon: Code2,
                  intro: "Understand how individual components should be implemented.",
                  points: [
                    "What classes and interfaces are needed?",
                    "Which object owns each responsibility?",
                    "Which design pattern fits?",
                    "How can the design be extended?",
                    "How is shared state protected?",
                  ],
                },
              ].map((item, cardIndex) => {
                const Icon = item.icon;

                return (
                  <Reveal key={item.title} delay={cardIndex * 0.1} className="h-full">
                    <div className={`group h-full rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${ui.card}`}>
                      <Icon size={27} className="text-[var(--tt-orange)] transition group-hover:scale-125" />

                      <h3 className={`mt-4 text-xl font-bold ${ui.heading}`}>{item.title}</h3>

                      <p className={`mt-2 text-sm leading-7 ${ui.muted}`}>{item.intro}</p>

                      <ul className="mt-5 space-y-3">
                        {item.points.map((point) => (
                          <li key={point} className="flex items-start gap-3">
                            <Check size={17} className="mt-0.5 shrink-0 text-[var(--tt-orange)]" />
                            <span className={`text-sm leading-6 ${ui.body}`}>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* Round matrix */}
            <Reveal className={`mt-8 overflow-hidden rounded-2xl border ${ui.card}`}>
              <div className={`grid grid-cols-[1.6fr_1fr_1fr] text-xs font-extrabold uppercase tracking-wider ${ui.soft} ${ui.heading}`}>
                <div className="p-4">Interview round</div>
                <div className="p-4 text-center">HLD book</div>
                <div className="p-4 text-center">LLD book</div>
              </div>
              {ROUND_MATRIX.map((row) => (
                <div key={row.round} className={`grid grid-cols-[1.6fr_1fr_1fr] border-t transition hover:bg-[var(--tt-orange-soft)] ${ui.border}`}>
                  <div className={`p-4 text-sm font-semibold ${ui.body}`}>{row.round}</div>
                  {[row.hld, row.lld].map((yes, index) => (
                    <div key={index} className="flex items-center justify-center p-4">
                      {yes ? <CheckCircle2 size={19} className="text-emerald-600" /> : <span className={ui.muted}>—</span>}
                    </div>
                  ))}
                </div>
              ))}
            </Reveal>

            <ClassifyGame dark={dark} ui={ui} />
          </div>
        </section>

        {/* =================================================
            CURRICULUM
        ================================================= */}
        <section id="curriculum" aria-labelledby="curriculum-title" className={`${container} mt-20 scroll-mt-32`}>
          <SectionHead
            id="curriculum-title"
            eyebrow="Detailed curriculum"
            title="Explore the subjects in depth"
            description="Move through foundations, architecture, Java object design, concurrency, practical scenarios and interview problem-solving techniques."
            dark={dark}
          />

          <div className="mt-8 flex gap-2" role="tablist" aria-label="Choose a book curriculum">
            {[
              { id: "hld", label: "HLD — Architecture" },
              { id: "lld", label: "LLD — Java" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeCurriculum === tab.id}
                onClick={() => setActiveCurriculum(tab.id)}
                className={cx(
                  "rounded-lg px-5 py-3 text-sm font-bold transition",
                  activeCurriculum === tab.id
                    ? "bg-[var(--tt-orange-strong)] text-white shadow-lg shadow-orange-500/25"
                    : dark
                      ? "border border-slate-700 bg-slate-900 text-slate-300 hover:border-orange-400"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-orange-300"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeCurriculum}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -10 }}
              transition={{ duration: 0.28 }}
              className="mt-6"
            >
              {activeCurriculum === "hld" ? (
                <ModuleList key="hld" modules={HLD_MODULES} dark={dark} prefix="hld" />
              ) : (
                <ModuleList key="lld" modules={LLD_MODULES} dark={dark} prefix="lld" />
              )}
            </motion.div>
          </AnimatePresence>

          <p className={`mt-4 text-xs leading-6 ${ui.muted}`}>
            This is a topic-level study guide for the collection, not a page-by-page table of contents from the PDFs.
          </p>
        </section>

        {/* =================================================
            REAL-WORLD PROBLEMS
        ================================================= */}
        <section id="practice" aria-labelledby="practice-title" className={`${container} mt-20 scroll-mt-32`}>
          <SectionHead
            id="practice-title"
            eyebrow="Applied design"
            title="Real-world systems to study"
            description="Use familiar products and engineering problems to practice system architecture, class modeling, concurrency and failure handling."
            dark={dark}
          />
          <ProblemExplorer dark={dark} ui={ui} />
        </section>

        {/* =================================================
            INTERVIEW METHOD
        ================================================= */}
        <section aria-labelledby="method-title" className={`${container} mt-20`}>
          <SectionHead
            id="method-title"
            eyebrow="Interview preparation"
            title="A repeatable approach to design rounds"
            description="Practice explaining why a design works, not just drawing boxes or naming design patterns."
            dark={dark}
          />

          <ol className={`relative mt-8 overflow-hidden rounded-2xl border ${ui.card}`}>
            {[
              ["01", "Understand requirements", "Clarify features, constraints, scale and expected behavior."],
              ["02", "Identify core components", "For HLD, map services and data flow. For LLD, identify entities and responsibilities."],
              ["03", "Design the foundation", "Define APIs, storage, classes, interfaces and key relationships."],
              ["04", "Discuss scalability and extensibility", "Explain the trade-offs in architecture and object composition."],
              ["05", "Handle critical edge cases", "Consider failures, concurrency, retries, duplicate requests and changing requirements."],
              ["06", "Explain your decisions", "Clearly describe assumptions and alternative approaches."],
            ].map(([number, title, description], index) => (
              <motion.li
                key={number}
                initial={reduce ? false : { opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={cx("group flex gap-5 p-5 transition hover:bg-[var(--tt-orange-soft)] sm:p-6", index && `border-t ${ui.border}`)}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tt-orange-soft)] text-sm font-extrabold text-[var(--tt-orange)] transition group-hover:scale-110 group-hover:bg-[var(--tt-orange-strong)] group-hover:text-white">
                  {number}
                </span>

                <div>
                  <h3 className={`text-sm font-bold sm:text-base ${ui.heading}`}>{title}</h3>
                  <p className={`mt-1.5 text-sm leading-6 ${ui.muted}`}>{description}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* =================================================
            STUDY PLAN
        ================================================= */}
        <section id="study-plan" aria-labelledby="plan-title" className={`mt-20 scroll-mt-32 border-y py-16 ${ui.alt}`}>
          <div className={container}>
            <SectionHead
              id="plan-title"
              eyebrow="How to prepare"
              title="Pick your timeline. Get a study plan."
              description="Choose how many weeks you have before the interview — the plan below shows how to split time between the two books."
              dark={dark}
            />
            <PlanBuilder dark={dark} ui={ui} />

            <div className="mt-12 grid gap-4 md:grid-cols-4">
              {[
                { stage: "Stage 01", title: "Foundations", text: "Revise requirements, APIs, object-oriented programming and basic class relationships." },
                { stage: "Stage 02", title: "Core design", text: "Study databases, caching, scaling, SOLID and design patterns." },
                { stage: "Stage 03", title: "Correctness", text: "Explore concurrency, locking, failures, retries and consistent state." },
                { stage: "Stage 04", title: "Mock interviews", text: "Practice end-to-end system design and Java LLD problems under time constraints." },
              ].map((item, index) => (
                <Reveal
                  key={item.stage}
                  delay={index * 0.07}
                  className={`h-full rounded-2xl border p-5 transition hover:-translate-y-1 hover:shadow-lg ${ui.card}`}
                >
                  <span className="text-xs font-bold text-[var(--tt-orange)]">{item.stage}</span>
                  <h3 className={`mt-3 text-base font-bold ${ui.heading}`}>{item.title}</h3>
                  <p className={`mt-3 text-sm leading-7 ${ui.muted}`}>{item.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* =================================================
            WHO THIS IS FOR
        ================================================= */}
        <section aria-labelledby="who-title" className={`${container} mt-20`}>
          <SectionHead
            id="who-title"
            eyebrow="Intended readers"
            title="Built for developers who want stronger design fundamentals"
            dark={dark}
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: Server, title: "Backend engineers", detail: "Strengthen architecture decisions, scalability fundamentals and API/service design." },
              { icon: GraduationCap, title: "SDE candidates", detail: "Prepare systematically for architecture and object-oriented design interview questions." },
              { icon: Code2, title: "Java developers", detail: "Improve class modeling, interfaces, design patterns and concurrency reasoning." },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal
                  key={item.title}
                  delay={index * 0.08}
                  className={`group h-full rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${ui.card}`}
                >
                  <Icon size={24} className="text-[var(--tt-orange)] transition duration-300 group-hover:rotate-6 group-hover:scale-125" />
                  <h3 className={`mt-4 text-base font-bold ${ui.heading}`}>{item.title}</h3>
                  <p className={`mt-3 text-sm leading-7 ${ui.muted}`}>{item.detail}</p>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* =================================================
            PAYMENT SECTION
        ================================================= */}
        <section id="payments" aria-labelledby="payments-title" className={`${container} mt-20 scroll-mt-32`}>
          <SectionHead
            id="payments-title"
            eyebrow="Checkout and delivery"
            title="A straightforward digital purchase"
            description={`Your checkout is powered by ${PROVIDER_NAME}. Available payment methods depend on those enabled for your merchant account.`}
            dark={dark}
          />

          <Reveal className={`mt-8 grid gap-8 rounded-2xl border p-6 md:grid-cols-2 md:p-8 ${ui.card}`}>
            <div>
              <h3 className={`text-lg font-bold ${ui.heading}`}>Payment options</h3>

              <div className="mt-5 grid grid-cols-2 gap-3">
                {[
                  { icon: Smartphone, title: "UPI", text: "When enabled" },
                  { icon: CreditCard, title: "Debit card", text: "When enabled" },
                  { icon: WalletCards, title: "Credit card", text: "When enabled" },
                  { icon: LockKeyhole, title: "Secure checkout", text: PROVIDER_NAME },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.title}
                      whileHover={reduce ? undefined : { y: -4, scale: 1.03 }}
                      className={`rounded-xl border p-4 ${ui.border} ${ui.soft}`}
                    >
                      <Icon size={21} className="text-[var(--tt-orange)]" />
                      <p className={`mt-3 text-sm font-bold ${ui.heading}`}>{item.title}</p>
                      <p className={`mt-1 text-xs ${ui.muted}`}>{item.text}</p>
                    </motion.div>
                  );
                })}
              </div>

              <p className={`mt-4 text-xs leading-6 ${ui.muted}`}>
                Payment availability is determined at checkout; this page doesn&apos;t independently verify which methods are active for your account.
              </p>
            </div>

            <div>
              <h3 className={`text-lg font-bold ${ui.heading}`}>After successful payment</h3>

              <ol className="mt-5 space-y-6">
                {[
                  { icon: ShieldCheck, title: "Purchase verification", text: "The payment is verified through the configured gateway." },
                  { icon: BookOpen, title: "Access your books", text: "Both HLD and LLD appear in the purchase success page." },
                  { icon: Download, title: "Save both PDFs", text: "Download the files individually or use the combined download option." },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <motion.li
                      key={item.title}
                      initial={reduce ? false : { opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.45 }}
                      className="flex items-start gap-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--tt-orange-soft)]">
                        <Icon size={17} className="text-[var(--tt-orange)]" />
                      </span>

                      <div>
                        <h4 className={`text-sm font-bold ${ui.heading}`}>{item.title}</h4>
                        <p className={`mt-1.5 text-sm leading-6 ${ui.muted}`}>{item.text}</p>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          </Reveal>
        </section>

        {/* =================================================
            PRICE COMPARISON
        ================================================= */}
        <section id="pricing" aria-labelledby="pricing-title" className={`${container} mt-20 scroll-mt-32`}>
          <SectionHead
            id="pricing-title"
            eyebrow="Pricing"
            title="One book or the complete combo"
            description="You can purchase the individual editions or choose the combo to receive both."
            dark={dark}
          />

          <SavingsBars hld={hld} lld={lld} combo={combo} currency={currency} savings={savings || 0} dark={dark} ui={ui} />

          <Reveal className={`mt-8 overflow-hidden rounded-2xl border ${ui.border}`}>
            <div className="grid grid-cols-[1.25fr_1fr_1fr_1fr]">
              {["", "HLD", "LLD", "Combo"].map((label, index) => (
                <div
                  key={index}
                  className={`p-3 text-center text-xs font-bold sm:p-5 sm:text-sm ${
                    index === 3 ? "bg-[var(--tt-orange-strong)] text-white" : `${ui.soft} ${ui.heading}`
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>

            {[
              ["High-Level Design", true, false, true],
              ["Low-Level Design", false, true, true],
              ["Java LLD content", false, true, true],
              ["System architecture", true, false, true],
              ["Two eBooks", false, false, true],
            ].map((row) => (
              <div key={row[0]} className={`grid grid-cols-[1.25fr_1fr_1fr_1fr] border-t transition hover:bg-[var(--tt-orange-soft)] ${ui.border}`}>
                <div className={`flex items-center p-3 text-[11px] sm:p-5 sm:text-sm ${ui.body}`}>{row[0]}</div>

                {row.slice(1).map((yes, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-center p-3 sm:p-5 ${index === 2 ? (dark ? "bg-orange-950/30" : "bg-orange-50") : ""}`}
                  >
                    {yes ? <CheckCircle2 size={18} className="text-emerald-600" /> : <span className={ui.muted}>—</span>}
                  </div>
                ))}
              </div>
            ))}

            <div className={`grid grid-cols-[1.25fr_1fr_1fr_1fr] border-t ${ui.border}`}>
              <div className={`p-3 text-xs font-bold sm:p-5 ${ui.heading}`}>Price</div>

              {[hld, lld, combo].map((product, index) => (
                <div
                  key={index}
                  className={`p-2 text-center text-xs font-bold sm:p-5 sm:text-base ${ui.heading} ${index === 2 ? (dark ? "bg-orange-950/30" : "bg-orange-50") : ""}`}
                >
                  {loading ? "…" : purchasable(product) ? money(product.price, product.currency) : "—"}
                </div>
              ))}
            </div>
          </Reveal>

          {/* Detailed comparison */}
          <Reveal className={`mt-6 overflow-x-auto rounded-2xl border ${ui.border}`}>
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className={`${ui.soft} ${ui.heading}`}>
                <tr>
                  {["", "HLD", "LLD (Java)", "Combo"].map((label, index) => (
                    <th key={index} scope="col" className="p-4 text-xs font-extrabold uppercase tracking-wider">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_ROWS.map((row) => (
                  <tr key={row[0]} className={`border-t transition hover:bg-[var(--tt-orange-soft)] ${ui.border}`}>
                    <th scope="row" className={`p-4 text-xs font-extrabold ${ui.heading}`}>{row[0]}</th>
                    {row.slice(1).map((cell, index) => (
                      <td key={index} className={`p-4 text-xs leading-6 sm:text-sm ${index === 2 ? "font-bold text-[var(--tt-orange)]" : ui.body}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </section>

        {/* =================================================
            FAQ
        ================================================= */}
        <section id="faq" aria-labelledby="faq-title" className={`${container} mt-20 scroll-mt-32`}>
          <SectionHead id="faq-title" eyebrow="Questions" title="Frequently asked questions" dark={dark} />

          <div className={`mt-7 divide-y border-y ${ui.border} ${dark ? "divide-slate-800" : "divide-slate-200"}`}>
            {allFaqs.map((item, index) => {
              const open = faqOpen === index;

              return (
                <div key={item.q}>
                  <h3>
                    <button
                      type="button"
                      id={`combo-faq-q-${index}`}
                      aria-expanded={open}
                      aria-controls={`combo-faq-a-${index}`}
                      onClick={() => setFaqOpen(open ? -1 : index)}
                      className="flex w-full items-center justify-between gap-5 py-5 text-left"
                    >
                      <span className={`text-sm font-semibold sm:text-base ${ui.heading}`}>{item.q}</span>
                      <ChevronDown
                        size={19}
                        className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180 text-[var(--tt-orange)]" : "text-slate-400"}`}
                      />
                    </button>
                  </h3>

                  <div
                    id={`combo-faq-a-${index}`}
                    role="region"
                    aria-labelledby={`combo-faq-q-${index}`}
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <p className={`max-w-3xl pb-5 text-sm leading-7 ${ui.muted}`}>{item.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =================================================
            FINAL CTA
        ================================================= */}
        <section aria-labelledby="combo-final" className={`${container} mt-20`}>
          <ScrollScale from={0.9}>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-800 via-orange-600 to-amber-500 p-7 text-white sm:p-10">
              <div className="tc-orb absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/20" aria-hidden="true" />
              <div className="tc-orb tc-orb-2 absolute -bottom-24 left-10 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />

              <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-orange-100">
                    <Rocket size={14} />
                    Complete digital collection
                  </p>

                  <h2 id="combo-final" className="mt-3 text-2xl font-extrabold sm:text-3xl">Get HLD and LLD together</h2>

                  <p className="mt-3 text-sm text-orange-50">Two ebooks, one checkout, separate PDF downloads.</p>
                </div>

                <div className="sm:text-right">
                  <strong className="block text-3xl font-extrabold">{priceText}</strong>

                  <button
                    type="button"
                    onClick={buyCombo}
                    disabled={!canBuy}
                    className="tc-shimmer relative mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-orange-700 shadow-xl transition hover:-translate-y-0.5 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    <CreditCard size={17} />
                    Buy Combo Now
                    <ArrowRight size={17} />
                  </button>
                </div>
              </div>
            </div>
          </ScrollScale>
        </section>

        {/* SUPPORT */}
        <div className={`${container} mt-9 text-center`}>
          <p className={`text-xs ${ui.muted}`}>
            Need help with a purchase?{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-[var(--tt-orange)] hover:underline">
              Contact Target Trek Support
            </a>
          </p>
          <p className={`mt-3 space-x-3 text-xs ${ui.muted}`}>
            <Link className="font-semibold hover:text-[var(--tt-orange)]" to={ROUTES.hld}>System Design HLD</Link>
            <Link className="font-semibold hover:text-[var(--tt-orange)]" to={ROUTES.lld}>System Design LLD (Java)</Link>
            <a className="font-semibold hover:text-[var(--tt-orange)]" href="/books">All books</a>
          </p>
        </div>
      </main>

      {/* RESPONSIVE STICKY BUY CARD
          mobile: docked strip · tablet: centered card · desktop: wider card
          (appears after the hero on md+) */}
      <div
        style={localColors}
        className={cx(
          "pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-2.5 pb-[max(10px,env(safe-area-inset-bottom))] transition-all duration-300 sm:px-4 md:pb-5",
          (checkoutOpen || (heroVisible && !loading)) && "md:translate-y-10 md:opacity-0",
          checkoutOpen && "max-md:translate-y-24 max-md:opacity-0"
        )}
      >
        <div
          className={cx(
            "pointer-events-auto grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2.5 rounded-[20px] border p-2.5 shadow-[0_-10px_45px_rgba(15,23,42,.18)] backdrop-blur-xl",
            "sm:max-w-xl sm:gap-4 sm:rounded-[22px] sm:p-3",
            "md:max-w-2xl md:rounded-2xl md:py-3 md:pl-5 md:pr-3",
            "lg:max-w-3xl lg:gap-6 xl:max-w-4xl 2xl:max-w-5xl"
          )}
          style={{ background: colors.bar, borderColor: colors.orangeBorder }}
        >
          <div className="min-w-0 pl-1">
            <p className="hidden truncate text-sm font-extrabold leading-tight sm:block lg:text-base" style={{ color: colors.text }}>
              HLD + LLD Complete Combo — 2 ebooks
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 sm:mt-1">
              <span className="text-lg font-extrabold leading-none sm:text-base lg:text-lg" style={{ color: colors.orange }}>
                {loading ? "…" : combo && Number.isFinite(Number(combo.price)) ? money(combo.price, currency) : "Price unavailable"}
              </span>
              {combo && Number(combo.mrp) > Number(combo.price) && (
                <span className="text-xs font-bold line-through" style={{ color: colors.muted }}>
                  {money(combo.mrp, currency)}
                </span>
              )}
              {combinedDiscount > 0 && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: colors.orangeSoft, color: colors.orange }}>
                  {combinedDiscount}% off
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-[11px] font-bold sm:hidden" style={{ color: colors.muted }}>
              HLD + LLD Complete Combo
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToId("included-books")}
              className="hidden min-h-[46px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:-translate-y-0.5 lg:inline-flex"
              style={{ borderColor: colors.orangeBorder, color: colors.orange }}
            >
              <BookOpen size={16} />
              What&apos;s inside
            </button>

            <button
              type="button"
              disabled={!canBuy || Boolean(loadError)}
              onClick={buyCombo}
              className={`${ctaBase} tc-pulse md-tc-no-pulse min-h-[50px] px-4 text-[13px] sm:px-6 sm:text-sm`}
            >
              Buy Now
              <ArrowRight size={16} className="transition group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* EXISTING PAYMENT MODAL
          Supports PayU/Cashfree/Razorpay based on VITE_PAYMENT_GATEWAY. */}
      <PayUCheckoutModal isOpen={checkoutOpen} onClose={closeCheckout} product={checkoutProduct} />
    </>
  );
}
