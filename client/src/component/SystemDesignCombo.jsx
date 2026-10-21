
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  CreditCard,
  Database,
  FileCheck2,
  FileText,
  GitBranch,
  GraduationCap,
  Layers3,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  MonitorSmartphone,
  Package,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
  Zap,
} from "lucide-react";

import BASE_URL from "../utils/Url";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";

// ======================================================
// CONFIGURATION
// ======================================================

const SITE_URL = "https://www.targettrek.in";

const ROUTES = {
  combo: "/book/system-design/hld-lld-combo",
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
    title: "IRCTC",
    category: "LLD",
    focus:
      "Booking entities, seat availability, concurrent seat allocation.",
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
// ANIMATIONS
// ======================================================

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const update = () => setReduced(query.matches);

    update();
    query.addEventListener?.("change", update);

    return () =>
      query.removeEventListener?.("change", update);
  }, []);

  return reduced;
}

function Reveal({
  children,
  className = "",
  delay = 0,
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [reduced]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform:
          visible || reduced
            ? "translateY(0)"
            : "translateY(25px)",
        transition: reduced
          ? "none"
          : `opacity 650ms ease ${delay}ms, transform 650ms cubic-bezier(.2,.8,.2,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function AnimatedNumber({
  value,
  suffix = "",
  dark,
}) {
  const [number, setNumber] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setNumber(value);
      return;
    }

    const node = ref.current;
    if (!node) return;

    let frameId;
    let observer;

    const animate = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const start = performance.now();
      const duration = 900;

      const frame = (time) => {
        const progress = Math.min(
          1,
          (time - start) / duration
        );

        const eased =
          1 - Math.pow(1 - progress, 3);

        setNumber(
          Math.round(value * eased)
        );

        if (progress < 1) {
          frameId = requestAnimationFrame(frame);
        }
      };

      frameId = requestAnimationFrame(frame);
    };

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            animate();
            observer.disconnect();
          }
        }
      );

      observer.observe(node);
    } else {
      animate();
    }

    return () => {
      observer?.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [value, reduced]);

  return (
    <strong
      ref={ref}
      className={`text-2xl font-extrabold sm:text-3xl ${
        dark ? "text-white" : "text-slate-950"
      }`}
    >
      {number}
      {suffix}
    </strong>
  );
}

// ======================================================
// SKELETONS
// ======================================================

function Skeleton({ className = "", dark }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${
        dark ? "bg-slate-800" : "bg-slate-200"
      } ${className}`}
    />
  );
}

function LoadingPage({ dark }) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 sm:px-6">
      <div className="grid gap-9 lg:grid-cols-[1fr_350px]">
        <div>
          <Skeleton dark={dark} className="mb-7 h-5 w-36" />
          <Skeleton dark={dark} className="h-14 max-w-xl" />
          <Skeleton dark={dark} className="mt-3 h-14 max-w-lg" />
          <Skeleton dark={dark} className="mt-6 h-5 max-w-2xl" />
          <Skeleton dark={dark} className="mt-3 h-5 max-w-xl" />

          <div className="mt-9 flex gap-3">
            <Skeleton dark={dark} className="h-10 w-32" />
            <Skeleton dark={dark} className="h-10 w-32" />
          </div>
        </div>

        <Skeleton
          dark={dark}
          className="h-80 rounded-2xl"
        />
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-2">
        <Skeleton dark={dark} className="h-52 rounded-xl" />
        <Skeleton dark={dark} className="h-52 rounded-xl" />
      </div>
    </div>
  );
}

// ======================================================
// DESIGN COMPONENTS
// ======================================================

function SectionHead({
  eyebrow,
  title,
  description,
  dark,
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
        {eyebrow}
      </p>

      <h2
        className={`mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-[35px] ${
          dark ? "text-white" : "text-slate-950"
        }`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-4 text-sm leading-7 sm:text-base ${
            dark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function BookCard({
  product,
  title,
  subtitle,
  route,
  dark,
  index,
}) {
  const card = dark
    ? "bg-[#151D29] border-slate-800"
    : "bg-white border-slate-200";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6 ${card}`}
    >
      <div className="flex items-start gap-5">
        <div
          className={`flex aspect-[3/4] w-[92px] shrink-0 items-center justify-center overflow-hidden rounded-md bg-white p-1.5 sm:w-[115px]`}
        >
          {product?.coverPageUrl ? (
            <img
              src={product.coverPageUrl}
              alt={`${title} cover`}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          ) : (
            <BookOpen size={32} className="text-slate-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Book {index}
          </p>

          <h3
            className={`mt-2 text-base font-extrabold leading-6 sm:text-lg ${
              dark ? "text-white" : "text-slate-950"
            }`}
          >
            {title}
          </h3>

          <p
            className={`mt-2 text-xs leading-6 sm:text-sm ${
              dark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            {subtitle}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <strong
              className={`text-lg ${
                dark ? "text-white" : "text-slate-950"
              }`}
            >
              {purchasable(product)
                ? money(product.price, product.currency)
                : "Unavailable"}
            </strong>

            {product &&
              Number(product.mrp) >
                Number(product.price) && (
                <span className="text-xs text-slate-400 line-through">
                  {money(product.mrp, product.currency)}
                </span>
              )}
          </div>
        </div>
      </div>

      <Link
        to={route}
        className={`mt-5 inline-flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-bold transition ${
          dark
            ? "border-slate-700 text-slate-100 hover:bg-slate-800"
            : "border-slate-200 text-slate-800 hover:bg-slate-50"
        }`}
      >
        View individual book
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </article>
  );
}

function ModuleList({
  modules,
  dark,
  prefix,
}) {
  const [open, setOpen] = useState(0);

  return (
    <div className="space-y-3">
      {modules.map((module, index) => {
        const expanded = open === index;

        return (
          <div
            key={`${prefix}-${index}`}
            className={`overflow-hidden rounded-xl border ${
              dark
                ? "border-slate-800 bg-[#151D29]"
                : "border-slate-200 bg-white"
            }`}
          >
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setOpen(expanded ? -1 : index)}
              className="flex w-full items-start justify-between gap-4 p-4 text-left sm:p-5"
            >
              <div className="flex gap-4">
                <span className="pt-0.5 text-xs font-extrabold text-blue-600">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>
                  <h3
                    className={`text-sm font-bold sm:text-base ${
                      dark ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {module.title}
                  </h3>

                  <p
                    className={`mt-2 text-xs leading-6 ${
                      dark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {module.description}
                  </p>

                  <p className="mt-2 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                    {module.topics.length} topics
                  </p>
                </div>
              </div>

              {expanded ? (
                <ChevronUp
                  size={18}
                  className="shrink-0 text-blue-500"
                />
              ) : (
                <ChevronDown
                  size={18}
                  className="shrink-0 text-slate-400"
                />
              )}
            </button>

            {expanded && (
              <div
                className={`grid gap-3 border-t px-5 py-5 sm:grid-cols-2 ${
                  dark ? "border-slate-800" : "border-slate-100"
                }`}
              >
                {module.topics.map((topic) => (
                  <div
                    key={topic}
                    className="flex items-start gap-2.5"
                  >
                    <Check
                      size={15}
                      className="mt-1 shrink-0 text-blue-500"
                    />

                    <span
                      className={`text-xs leading-6 sm:text-sm ${
                        dark
                          ? "text-slate-300"
                          : "text-slate-700"
                      }`}
                    >
                      {topic}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ======================================================
// MAIN PAGE
// ======================================================

export default function SystemDesignCombo() {
  const [theme, setTheme] = useState(readTheme);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [faqOpen, setFaqOpen] = useState(0);
  const [activeCurriculum, setActiveCurriculum] =
    useState("hld");

  const [readingProgress, setReadingProgress] =
    useState(0);

  const dark = theme === "dark";

  // ====================================================
  // THEME SYNC
  // ====================================================

  useEffect(() => {
    const sync = (event) => {
      const specified = event?.detail?.theme;

      if (
        specified === "light" ||
        specified === "dark"
      ) {
        setTheme(specified);
      } else {
        setTheme(readTheme());
      }
    };

    const storage = (event) => {
      if (event.key === "theme") {
        sync();
      }
    };

    const observer = new MutationObserver(() => {
      setTheme(readTheme());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    window.addEventListener(
      "targettrek-theme-change",
      sync
    );
    window.addEventListener("storage", storage);
    window.addEventListener("focus", sync);

    sync();

    return () => {
      observer.disconnect();
      window.removeEventListener(
        "targettrek-theme-change",
        sync
      );
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", sync);
    };
  }, []);

  // ====================================================
  // SCROLL PROGRESS
  // ====================================================

  useEffect(() => {
    let ticking = false;

    const update = () => {
      const documentHeight =
        document.documentElement.scrollHeight -
        window.innerHeight;

      const progress =
        documentHeight > 0
          ? (window.scrollY / documentHeight) * 100
          : 0;

      setReadingProgress(
        Math.max(0, Math.min(100, progress))
      );

      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });
    window.addEventListener("resize", onScroll);

    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal,
      });

      const result = await response.json().catch(() => null);

      if (
        !response.ok ||
        result?.success === false
      ) {
        throw new Error(
          result?.message ||
          `Unable to load books (HTTP ${response.status}).`
        );
      }

      const normalized = parseBooks(result)
        .map(normalizeBook)
        .filter(Boolean);

      if (!signal?.aborted) {
        setBooks(normalized);
      }
    } catch (error) {
      if (error?.name === "AbortError") return;

      console.error("Combo books API:", error);

      setLoadError(
        error.message || "Unable to load products."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
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

  const hld = useMemo(
    () => findBook(books, ROUTES.hld),
    [books]
  );

  const lld = useMemo(
    () => findBook(books, ROUTES.lld),
    [books]
  );

  const combo = useMemo(() => {
    const direct = findBook(
      books,
      ROUTES.combo
    );

    if (direct?.resourceType === "bundle") {
      return direct;
    }

    if (!hld?._id || !lld?._id) return null;

    return (
      books.find((book) => {
        if (book.resourceType !== "bundle") {
          return false;
        }

        const includedIds =
          book.includedBooks.map(getId);

        return (
          includedIds.includes(hld._id) &&
          includedIds.includes(lld._id)
        );
      }) || null
    );
  }, [books, hld, lld]);

  const canBuy = purchasable(combo) &&
    combo.resourceType === "bundle";

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
      ? Math.max(
          0,
          originalSeparatePrice - Number(combo.price)
        )
      : null;

  const combinedDiscount = discount(combo);

  const totalModules =
    HLD_MODULES.length + LLD_MODULES.length;

  const totalTopics =
    [...HLD_MODULES, ...LLD_MODULES]
      .reduce((sum, module) => (
        sum + module.topics.length
      ), 0);

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
      page: dark
        ? "bg-[#0B1018] text-slate-100"
        : "bg-[#FAFAF9] text-slate-900",

      card: dark
        ? "border-slate-800 bg-[#151D29]"
        : "border-slate-200 bg-white",

      muted: dark
        ? "text-slate-400"
        : "text-slate-600",

      heading: dark
        ? "text-white"
        : "text-slate-950",

      body: dark
        ? "text-slate-300"
        : "text-slate-700",

      border: dark
        ? "border-slate-800"
        : "border-slate-200",

      soft: dark
        ? "bg-[#111924]"
        : "bg-[#F2F4F7]",
    }),
    [dark]
  );

  const container =
    "mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8";

  const primaryButton =
    "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-lg bg-[#1659B7] px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#104B9C] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50";

  // ====================================================
  // SEO
  // ====================================================

  const seoTitle =
    "HLD + LLD System Design Combo eBooks (Java) | Target Trek";

  const seoDescription =
    "Prepare for system design interviews with Target Trek's HLD + LLD combo. Learn scalable architecture, caching, databases, APIs, Java OOP, SOLID, UML, design patterns, concurrency and practical design problems.";

  const canonical =
    `${SITE_URL}${ROUTES.combo}`;

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name:
      combo?.title ||
      "Mastering System Design — HLD + LLD Combo",
    description: seoDescription,
    url: canonical,
    category: "Digital Books",
    brand: {
      "@type": "Brand",
      name: "Target Trek",
    },
    isRelatedTo: [
      {
        "@type": "Book",
        name: hld?.title || "Mastering System Design HLD",
        url: `${SITE_URL}${ROUTES.hld}`,
      },
      {
        "@type": "Book",
        name: lld?.title || "Mastering System Design LLD",
        url: `${SITE_URL}${ROUTES.lld}`,
      },
    ],
    offers: canBuy
      ? {
          "@type": "Offer",
          price: Number(combo.price),
          priceCurrency: currency,
          availability:
            "https://schema.org/InStock",
          url: canonical,
        }
      : undefined,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  // ====================================================
  // PAGE RENDER
  // ====================================================

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>

        <meta
          name="description"
          content={seoDescription}
        />

        <meta name="robots" content="index,follow" />

        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="product" />

        <meta property="og:title" content={seoTitle} />

        <meta
          property="og:description"
          content={seoDescription}
        />

        <meta property="og:url" content={canonical} />

        <meta
          name="twitter:card"
          content="summary_large_image"
        />

        <meta
          name="twitter:title"
          content={seoTitle}
        />

        <meta
          name="twitter:description"
          content={seoDescription}
        />

        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>

        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      </Helmet>

      {/* Reading progress bar */}
      <div
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[90] h-[3px]"
      >
        <div
          className="h-full bg-blue-600 transition-[width] duration-150"
          style={{
            width: `${readingProgress}%`,
          }}
        />
      </div>

      <main
        className={`min-h-screen pb-36 pt-24 transition-colors duration-300 sm:pb-24 sm:pt-28 ${ui.page}`}
      >
        {loading ? (
          <LoadingPage dark={dark} />
        ) : loadError ? (
          <div className={`${container} py-20`}>
            <div
              className={`rounded-xl border p-10 text-center ${ui.card}`}
            >
              <h1 className={`text-xl font-bold ${ui.heading}`}>
                Unable to load book details
              </h1>

              <p className={`mt-4 text-sm ${ui.muted}`}>
                {loadError}
              </p>

              <button
                type="button"
                onClick={() => fetchProducts()}
                className={`${primaryButton} mt-6`}
              >
                <RefreshCw size={17} />
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
                HERO
                MAIN PRODUCT: HLD + LLD COMBO
                NO COMBO COVER IMAGE
            ================================================= */}

            <section className={`${container} pt-7 sm:pt-12`}>
              <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_355px] lg:gap-14">
                <Reveal>
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/5 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                      <BookOpen size={14} />
                      Target Trek System Design Series
                    </div>

                    <h1
                      className={`mt-6 max-w-3xl text-[36px] font-extrabold leading-[1.12] tracking-[-0.045em] sm:text-[52px] lg:text-[62px] ${ui.heading}`}
                    >
                      Mastering
                      <span className="block">
                        System Design
                      </span>
                      <span className="block text-blue-600 dark:text-blue-400">
                        HLD + LLD Combo
                      </span>
                    </h1>

                    <p
                      className={`mt-6 max-w-2xl text-base leading-8 sm:text-lg ${ui.muted}`}
                    >
                      From large-scale architecture to
                      production-minded Java class design.
                      Learn how systems are structured,
                      how their components work together,
                      and how to discuss engineering
                      trade-offs in system design interviews.
                    </p>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {[
                        "High-Level Design",
                        "Low-Level Design",
                        "Java",
                        "Design Patterns",
                        "Distributed Systems",
                        "System Design Interviews",
                      ].map((tag) => (
                        <span
                          key={tag}
                          className={`rounded-md border px-3 py-1.5 text-xs font-medium ${ui.border} ${ui.body}`}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-8 hidden flex-wrap gap-3 sm:flex">
                      <button
                        type="button"
                        onClick={buyCombo}
                        disabled={!canBuy}
                        className={primaryButton}
                      >
                        <CreditCard size={18} />
                        Buy Complete Combo
                        <ArrowRight size={17} />
                      </button>

                      <button
                        type="button"
                        onClick={() => scrollToId("curriculum")}
                        className={`inline-flex items-center gap-2 rounded-lg border px-5 py-3 text-sm font-bold ${ui.border} ${ui.body}`}
                      >
                        Explore Curriculum
                        <ArrowDown size={17} />
                      </button>
                    </div>

                    <div className="mt-9 grid grid-cols-3 gap-4 border-t pt-6">
                      <div>
                        <AnimatedNumber value={2} dark={dark} />
                        <p className={`mt-1 text-xs ${ui.muted}`}>
                          Digital ebooks
                        </p>
                      </div>

                      <div>
                        <AnimatedNumber
                          value={totalModules}
                          suffix="+"
                          dark={dark}
                        />

                        <p className={`mt-1 text-xs ${ui.muted}`}>
                          Learning modules
                        </p>
                      </div>

                      <div>
                        <AnimatedNumber
                          value={totalTopics}
                          suffix="+"
                          dark={dark}
                        />

                        <p className={`mt-1 text-xs ${ui.muted}`}>
                          Topic entries
                        </p>
                      </div>
                    </div>

                    <p className={`mt-2 text-[11px] ${ui.muted}`}>
                      Curriculum counts refer to the learning
                      outline displayed on this page.
                    </p>
                  </div>
                </Reveal>

                {/* Purchase panel */}

                <Reveal delay={100}>
                  <aside
                    className={`rounded-2xl border p-6 shadow-sm lg:sticky lg:top-28 ${ui.card}`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400">
                      Complete 2-book package
                    </p>

                    <h2
                      className={`mt-3 text-xl font-extrabold ${ui.heading}`}
                    >
                      HLD + LLD (Java)
                    </h2>

                    <p className={`mt-2 text-sm leading-6 ${ui.muted}`}>
                      Two independent PDF ebooks with
                      one checkout.
                    </p>

                    <div className={`my-5 border-y py-5 ${ui.border}`}>
                      <div className="flex flex-wrap items-end gap-2">
                        <strong
                          className={`text-4xl font-extrabold ${ui.heading}`}
                        >
                          {canBuy
                            ? money(combo.price, currency)
                            : "Unavailable"}
                        </strong>

                        {canBuy &&
                          Number(combo.mrp) >
                            Number(combo.price) && (
                            <span className={`pb-1 text-sm line-through ${ui.muted}`}>
                              {money(combo.mrp, currency)}
                            </span>
                          )}
                      </div>

                      {combinedDiscount > 0 && (
                        <span className="mt-3 inline-flex rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600">
                          {combinedDiscount}% off MRP
                        </span>
                      )}

                      {savings !== null && savings > 0 && (
                        <p className="mt-3 text-xs font-semibold text-emerald-600">
                          Save {money(savings, currency)}
                          {" "}vs buying both separately.
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={buyCombo}
                      disabled={!canBuy}
                      className={`${primaryButton} w-full`}
                    >
                      <CreditCard size={18} />
                      Buy Combo Now
                      <ArrowRight size={17} />
                    </button>

                    <p className={`mt-3 text-center text-[11px] ${ui.muted}`}>
                      Checkout powered by {PROVIDER_NAME}
                    </p>

                    <div className={`mt-5 space-y-3 border-t pt-5 ${ui.border}`}>
                      {[
                        "High-Level Design PDF",
                        "Low-Level Design (Java) PDF",
                        "Separate book downloads",
                        "Digital access after verification",
                      ].map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-2.5"
                        >
                          <CheckCircle2
                            size={17}
                            className="shrink-0 text-emerald-600"
                          />

                          <span className={`text-xs ${ui.body}`}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className={`mt-5 rounded-lg p-3 ${ui.soft}`}>
                      <div className="flex items-center gap-2">
                        <LockKeyhole size={15} className="text-blue-500" />

                        <span
                          className={`text-xs font-bold ${ui.heading}`}
                        >
                          Secure checkout
                        </span>
                      </div>

                      <p className={`mt-2 text-[11px] leading-5 ${ui.muted}`}>
                        Payment methods such as UPI and
                        debit/credit cards appear when
                        enabled for your merchant account.
                      </p>
                    </div>
                  </aside>
                </Reveal>
              </div>
            </section>

            {/* =================================================
                BOTH INDIVIDUAL BOOKS
                DIRECTLY BELOW HERO
            ================================================= */}

            <section
              id="included-books"
              className={`${container} mt-16 scroll-mt-28`}
            >
              <Reveal>
                <SectionHead
                  eyebrow="Inside your combo"
                  title="Two complete books. One purchase."
                  description="The combo brings together system architecture and Java-based object design. You can also explore either book separately."
                  dark={dark}
                />
              </Reveal>

              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <Reveal delay={50}>
                  <BookCard
                    index="01"
                    product={hld}
                    title="Mastering System Design — HLD"
                    subtitle="Requirements, APIs, distributed systems, databases, caching, queues, scalability and reliability."
                    route={ROUTES.hld}
                    dark={dark}
                  />
                </Reveal>

                <Reveal delay={120}>
                  <BookCard
                    index="02"
                    product={lld}
                    title="Mastering System Design — LLD (Java)"
                    subtitle="OOP, SOLID, UML, design patterns, multithreading, concurrency and object-oriented design."
                    route={ROUTES.lld}
                    dark={dark}
                  />
                </Reveal>
              </div>
            </section>

            {/* =================================================
                HLD VS LLD
            ================================================= */}

            <section className={`${container} mt-20`}>
              <Reveal>
                <SectionHead
                  eyebrow="The complete picture"
                  title="Architecture decisions and implementation decisions"
                  description="A strong system design answer connects the components of a system with the internal design of those components."
                  dark={dark}
                />
              </Reveal>

              <div className={`mt-8 grid gap-5 lg:grid-cols-2`}>
                {[
                  {
                    title: "High-Level Design",
                    icon: Server,
                    intro:
                      "Understand how the system behaves as a whole.",
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
                    intro:
                      "Understand how individual components should be implemented.",
                    points: [
                      "What classes and interfaces are needed?",
                      "Which object owns each responsibility?",
                      "Which design pattern fits?",
                      "How can the design be extended?",
                      "How is shared state protected?",
                    ],
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Reveal key={item.title}>
                      <div className={`h-full rounded-2xl border p-6 ${ui.card}`}>
                        <Icon size={27} className="text-blue-600" />

                        <h3
                          className={`mt-4 text-xl font-bold ${ui.heading}`}
                        >
                          {item.title}
                        </h3>

                        <p className={`mt-2 text-sm leading-7 ${ui.muted}`}>
                          {item.intro}
                        </p>

                        <div className="mt-5 space-y-3">
                          {item.points.map((point) => (
                            <div
                              key={point}
                              className="flex items-start gap-3"
                            >
                              <Check
                                size={17}
                                className="mt-0.5 shrink-0 text-blue-600"
                              />

                              <p className={`text-sm leading-6 ${ui.body}`}>
                                {point}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                STUDY CURRICULUM
            ================================================= */}

            <section
              id="curriculum"
              className={`${container} mt-20 scroll-mt-28`}
            >
              <Reveal>
                <SectionHead
                  eyebrow="Detailed curriculum"
                  title="Explore the subjects in depth"
                  description="Move through foundations, architecture, Java object design, concurrency, practical scenarios and interview problem-solving techniques."
                  dark={dark}
                />
              </Reveal>

              <div className="mt-8 flex gap-2">
                {[
                  { id: "hld", label: "HLD — Architecture" },
                  { id: "lld", label: "LLD — Java" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() =>
                      setActiveCurriculum(tab.id)
                    }
                    className={`rounded-lg px-5 py-3 text-sm font-bold transition ${
                      activeCurriculum === tab.id
                        ? "bg-blue-600 text-white"
                        : dark
                          ? "border border-slate-700 bg-slate-900 text-slate-300"
                          : "border border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeCurriculum === "hld" ? (
                  <ModuleList
                    key="hld"
                    modules={HLD_MODULES}
                    dark={dark}
                    prefix="hld"
                  />
                ) : (
                  <ModuleList
                    key="lld"
                    modules={LLD_MODULES}
                    dark={dark}
                    prefix="lld"
                  />
                )}
              </div>

              <p className={`mt-4 text-xs leading-6 ${ui.muted}`}>
                This is a topic-level study guide for
                the collection, not a page-by-page
                table of contents from the PDFs.
              </p>
            </section>

            {/* =================================================
                REAL-WORLD PROBLEMS
            ================================================= */}

            <section
              id="practice"
              className={`${container} mt-20 scroll-mt-28`}
            >
              <Reveal>
                <SectionHead
                  eyebrow="Applied design"
                  title="Real-world systems to study"
                  description="Use familiar products and engineering problems to practice system architecture, class modeling, concurrency and failure handling."
                  dark={dark}
                />
              </Reveal>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {PROBLEMS.map((problem, index) => (
                  <Reveal
                    key={problem.title}
                    delay={(index % 3) * 60}
                  >
                    <article
                      className={`group h-full rounded-xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${ui.card}`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        {problem.category}
                      </span>

                      <h3
                        className={`mt-3 text-base font-bold ${ui.heading}`}
                      >
                        {problem.title}
                      </h3>

                      <p className={`mt-3 text-sm leading-7 ${ui.muted}`}>
                        {problem.focus}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* =================================================
                INTERVIEW METHOD
            ================================================= */}

            <section className={`${container} mt-20`}>
              <Reveal>
                <SectionHead
                  eyebrow="Interview preparation"
                  title="A repeatable approach to design rounds"
                  description="Practice explaining why a design works, not just drawing boxes or naming design patterns."
                  dark={dark}
                />
              </Reveal>

              <div
                className={`mt-8 overflow-hidden rounded-xl border ${ui.card}`}
              >
                {[
                  [
                    "01",
                    "Understand requirements",
                    "Clarify features, constraints, scale and expected behavior.",
                  ],
                  [
                    "02",
                    "Identify core components",
                    "For HLD, map services and data flow. For LLD, identify entities and responsibilities.",
                  ],
                  [
                    "03",
                    "Design the foundation",
                    "Define APIs, storage, classes, interfaces and key relationships.",
                  ],
                  [
                    "04",
                    "Discuss scalability and extensibility",
                    "Explain the trade-offs in architecture and object composition.",
                  ],
                  [
                    "05",
                    "Handle critical edge cases",
                    "Consider failures, concurrency, retries, duplicate requests and changing requirements.",
                  ],
                  [
                    "06",
                    "Explain your decisions",
                    "Clearly describe assumptions and alternative approaches.",
                  ],
                ].map(([number, title, description], index) => (
                  <div
                    key={number}
                    className={`flex gap-5 p-5 sm:p-6 ${
                      index
                        ? `border-t ${ui.border}`
                        : ""
                    }`}
                  >
                    <span className="text-sm font-extrabold text-blue-600">
                      {number}
                    </span>

                    <div>
                      <h3 className={`text-sm font-bold ${ui.heading}`}>
                        {title}
                      </h3>

                      <p className={`mt-2 text-sm leading-6 ${ui.muted}`}>
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* =================================================
                RECOMMENDED READING ROADMAP
            ================================================= */}

            <section className={`${container} mt-20`}>
              <Reveal>
                <SectionHead
                  eyebrow="How to prepare"
                  title="A suggested four-stage reading plan"
                  description="Work from fundamentals to implementation, then connect both books through practical problems."
                  dark={dark}
                />
              </Reveal>

              <div className="mt-8 grid gap-4 md:grid-cols-4">
                {[
                  {
                    stage: "Stage 01",
                    title: "Foundations",
                    text:
                      "Revise requirements, APIs, object-oriented programming and basic class relationships.",
                  },
                  {
                    stage: "Stage 02",
                    title: "Core design",
                    text:
                      "Study databases, caching, scaling, SOLID and design patterns.",
                  },
                  {
                    stage: "Stage 03",
                    title: "Correctness",
                    text:
                      "Explore concurrency, locking, failures, retries and consistent state.",
                  },
                  {
                    stage: "Stage 04",
                    title: "Mock interviews",
                    text:
                      "Practice end-to-end system design and Java LLD problems under time constraints.",
                  },
                ].map((item) => (
                  <Reveal key={item.stage}>
                    <div
                      className={`h-full rounded-xl border p-5 ${ui.card}`}
                    >
                      <span className="text-xs font-bold text-blue-600">
                        {item.stage}
                      </span>

                      <h3
                        className={`mt-3 text-base font-bold ${ui.heading}`}
                      >
                        {item.title}
                      </h3>

                      <p className={`mt-3 text-sm leading-7 ${ui.muted}`}>
                        {item.text}
                      </p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </section>

            {/* =================================================
                WHO THIS IS FOR
            ================================================= */}

            <section className={`${container} mt-20`}>
              <Reveal>
                <SectionHead
                  eyebrow="Intended readers"
                  title="Built for developers who want stronger design fundamentals"
                  dark={dark}
                />
              </Reveal>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {[
                  {
                    icon: Server,
                    title: "Backend engineers",
                    detail:
                      "Strengthen architecture decisions, scalability fundamentals and API/service design.",
                  },
                  {
                    icon: GraduationCap,
                    title: "SDE candidates",
                    detail:
                      "Prepare systematically for architecture and object-oriented design interview questions.",
                  },
                  {
                    icon: Code2,
                    title: "Java developers",
                    detail:
                      "Improve class modeling, interfaces, design patterns and concurrency reasoning.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <Reveal key={item.title}>
                      <div className={`h-full rounded-xl border p-6 ${ui.card}`}>
                        <Icon
                          size={24}
                          className="text-blue-600"
                        />

                        <h3
                          className={`mt-4 text-base font-bold ${ui.heading}`}
                        >
                          {item.title}
                        </h3>

                        <p className={`mt-3 text-sm leading-7 ${ui.muted}`}>
                          {item.detail}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                PAYMENT SECTION
            ================================================= */}

            <section
              id="payments"
              className={`${container} mt-20 scroll-mt-28`}
            >
              <Reveal>
                <SectionHead
                  eyebrow="Checkout and delivery"
                  title="A straightforward digital purchase"
                  description={`Your checkout is powered by ${PROVIDER_NAME}. Available payment methods depend on those enabled for your merchant account.`}
                  dark={dark}
                />
              </Reveal>

              <div
                className={`mt-8 grid gap-8 rounded-2xl border p-6 md:grid-cols-2 md:p-8 ${ui.card}`}
              >
                <div>
                  <h3
                    className={`text-lg font-bold ${ui.heading}`}
                  >
                    Payment options
                  </h3>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: Smartphone,
                        title: "UPI",
                        text: "When enabled",
                      },
                      {
                        icon: CreditCard,
                        title: "Debit card",
                        text: "When enabled",
                      },
                      {
                        icon: WalletCards,
                        title: "Credit card",
                        text: "When enabled",
                      },
                      {
                        icon: LockKeyhole,
                        title: "Secure checkout",
                        text: PROVIDER_NAME,
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className={`rounded-lg border p-4 ${ui.border} ${ui.soft}`}
                        >
                          <Icon
                            size={21}
                            className="text-blue-600"
                          />

                          <p
                            className={`mt-3 text-sm font-bold ${ui.heading}`}
                          >
                            {item.title}
                          </p>

                          <p
                            className={`mt-1 text-xs ${ui.muted}`}
                          >
                            {item.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <p className={`mt-4 text-xs leading-6 ${ui.muted}`}>
                    Payment availability is determined
                    at checkout; this page doesn't
                    independently verify which methods
                    are active for your account.
                  </p>
                </div>

                <div>
                  <h3
                    className={`text-lg font-bold ${ui.heading}`}
                  >
                    After successful payment
                  </h3>

                  <div className="mt-5 space-y-6">
                    {[
                      {
                        title: "Purchase verification",
                        text:
                          "The payment is verified through the configured gateway.",
                      },
                      {
                        title: "Access your books",
                        text:
                          "Both HLD and LLD appear in the purchase success page.",
                      },
                      {
                        title: "Save both PDFs",
                        text:
                          "Download the files individually or use the combined download option.",
                      },
                    ].map((item, index) => (
                      <div
                        key={item.title}
                        className="flex items-start gap-4"
                      >
                        <span className="text-xs font-extrabold text-blue-600">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div>
                          <h4
                            className={`text-sm font-bold ${ui.heading}`}
                          >
                            {item.title}
                          </h4>

                          <p
                            className={`mt-2 text-sm leading-6 ${ui.muted}`}
                          >
                            {item.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                PRICE COMPARISON
            ================================================= */}

            <section
              id="pricing"
              className={`${container} mt-20 scroll-mt-28`}
            >
              <Reveal>
                <SectionHead
                  eyebrow="Pricing"
                  title="One book or the complete combo"
                  description="You can purchase the individual editions or choose the combo to receive both."
                  dark={dark}
                />
              </Reveal>

              <div
                className={`mt-8 overflow-hidden rounded-xl border ${ui.border}`}
              >
                <div className="grid grid-cols-[1.25fr_1fr_1fr_1fr]">
                  {["", "HLD", "LLD", "Combo"].map(
                    (label, index) => (
                      <div
                        key={index}
                        className={`p-3 text-center text-xs font-bold sm:p-5 sm:text-sm ${
                          index === 3
                            ? "bg-blue-600 text-white"
                            : `${ui.soft} ${ui.heading}`
                        }`}
                      >
                        {label}
                      </div>
                    )
                  )}
                </div>

                {[
                  ["High-Level Design", true, false, true],
                  ["Low-Level Design", false, true, true],
                  ["Java LLD content", false, true, true],
                  ["System architecture", true, false, true],
                  ["Two eBooks", false, false, true],
                ].map((row) => (
                  <div
                    key={row[0]}
                    className={`grid grid-cols-[1.25fr_1fr_1fr_1fr] border-t ${ui.border}`}
                  >
                    <div
                      className={`flex items-center p-3 text-[11px] sm:p-5 sm:text-sm ${ui.body}`}
                    >
                      {row[0]}
                    </div>

                    {row.slice(1).map((yes, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-center p-3 sm:p-5 ${
                          index === 2
                            ? dark
                              ? "bg-blue-950/30"
                              : "bg-blue-50"
                            : ""
                        }`}
                      >
                        {yes ? (
                          <CheckCircle2
                            size={18}
                            className="text-emerald-600"
                          />
                        ) : (
                          <span className={ui.muted}>—</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <div className={`grid grid-cols-[1.25fr_1fr_1fr_1fr] border-t ${ui.border}`}>
                  <div
                    className={`p-3 text-xs font-bold sm:p-5 ${ui.heading}`}
                  >
                    Price
                  </div>

                  {[hld, lld, combo].map((product, index) => (
                    <div
                      key={index}
                      className={`p-2 text-center text-xs font-bold sm:p-5 sm:text-base ${ui.heading} ${
                        index === 2
                          ? dark
                            ? "bg-blue-950/30"
                            : "bg-blue-50"
                          : ""
                      }`}
                    >
                      {purchasable(product)
                        ? money(product.price, product.currency)
                        : "—"}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* =================================================
                FAQ
            ================================================= */}

            <section className={`${container} mt-20`}>
              <Reveal>
                <SectionHead
                  eyebrow="Questions"
                  title="Frequently asked questions"
                  dark={dark}
                />
              </Reveal>

              <div
                className={`mt-7 divide-y border-y ${ui.border} ${
                  dark
                    ? "divide-slate-800"
                    : "divide-slate-200"
                }`}
              >
                {FAQS.map((item, index) => {
                  const open = faqOpen === index;

                  return (
                    <div key={item.q}>
                      <button
                        type="button"
                        aria-expanded={open}
                        onClick={() =>
                          setFaqOpen(open ? -1 : index)
                        }
                        className="flex w-full items-center justify-between gap-5 py-5 text-left"
                      >
                        <span
                          className={`text-sm font-semibold sm:text-base ${ui.heading}`}
                        >
                          {item.q}
                        </span>

                        {open ? (
                          <ChevronUp
                            size={19}
                            className="shrink-0 text-blue-500"
                          />
                        ) : (
                          <ChevronDown
                            size={19}
                            className="shrink-0 text-slate-400"
                          />
                        )}
                      </button>

                      {open && (
                        <p
                          className={`max-w-3xl pb-5 text-sm leading-7 ${ui.muted}`}
                        >
                          {item.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                FINAL CTA
            ================================================= */}

            <section className={`${container} mt-20`}>
              <Reveal>
                <div
                  className={`rounded-2xl border p-7 sm:p-10 ${ui.card}`}
                >
                  <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                        Complete digital collection
                      </p>

                      <h2
                        className={`mt-3 text-2xl font-extrabold ${ui.heading}`}
                      >
                        Get HLD and LLD together
                      </h2>

                      <p
                        className={`mt-3 text-sm ${ui.muted}`}
                      >
                        Two ebooks, one checkout,
                        separate PDF downloads.
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <strong
                        className={`block text-3xl font-extrabold ${ui.heading}`}
                      >
                        {canBuy
                          ? money(combo.price, currency)
                          : "Unavailable"}
                      </strong>

                      <button
                        type="button"
                        onClick={buyCombo}
                        disabled={!canBuy}
                        className={`${primaryButton} mt-4 w-full sm:w-auto`}
                      >
                        <CreditCard size={17} />
                        Buy Combo Now
                        <ArrowRight size={17} />
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            </section>

            {/* SUPPORT */}

            <div className={`${container} mt-9 text-center`}>
              <p className={`text-xs ${ui.muted}`}>
                Need help with a purchase?{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="font-bold text-blue-600 hover:underline"
                >
                  Contact Target Trek Support
                </a>
              </p>
            </div>
          </>
        )}
      </main>

      {/* =================================================
          MOBILE FIXED BUY NOW
      ================================================= */}

      {!loading &&
        !loadError &&
        canBuy &&
        !checkoutOpen && (
          <div
            className={`fixed inset-x-0 bottom-0 z-[80] border-t px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] shadow-[0_-6px_24px_rgba(0,0,0,0.10)] sm:hidden ${ui.card}`}
          >
            <div className="mx-auto flex max-w-md items-center gap-3">
              <div className="min-w-0 shrink-0">
                <p className={`text-[10px] font-semibold ${ui.muted}`}>
                  HLD + LLD Combo
                </p>

                <strong
                  className={`text-xl font-extrabold ${ui.heading}`}
                >
                  {money(combo.price, currency)}
                </strong>
              </div>

              <button
                type="button"
                onClick={buyCombo}
                className={`${primaryButton} min-w-0 flex-1 px-3 text-xs`}
              >
                <CreditCard size={16} />
                Buy Combo Now
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

      {/* =================================================
          EXISTING PAYMENT MODAL

          Supports PayU/Cashfree/Razorpay based on
          VITE_PAYMENT_GATEWAY in your existing modal.
      ================================================= */}

      <PayUCheckoutModal
        isOpen={checkoutOpen}
        onClose={closeCheckout}
        product={checkoutProduct}
      />
    </>
  );
}
