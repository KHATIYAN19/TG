
import React, {
  useEffect,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Cpu,
  Database,
  FileCode2,
  GitBranch,
  GraduationCap,
  Layers3,
  LockKeyhole,
  MemoryStick,
  Package,
  ShieldCheck,
  Sparkles,
  Terminal,
  Zap,
  Activity,
  Braces,
  MessageCircle,
  Server,
  RefreshCw,
  Network,
  Workflow,
  KeyRound,
  Copy,
  CheckCheck,
  ExternalLink,
  Layers,
  Coffee,
  ArrowDown,
} from "lucide-react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";

/* =========================================================
   CONFIG
========================================================= */

const BASE_URL = (
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:5001"
).replace(/\/$/, "");

const JAVA_PATH = "/book/langauge/java";
const SPRING_PATH = "/book/springboot";

const SITE_URL = "https://www.targettrek.in";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const BOOK_TITLE = "Mastering Java — Core to Advanced";

const DESCRIPTION =
  "Learn Java from fundamentals to advanced topics including OOP, Collections, Generics, Streams, Multithreading, Concurrency, JVM Internals, Garbage Collection and Modern Java.";

/* =========================================================
   INDEPENDENT LOCAL THEME

   No dependency on Tailwind dark mode.

   The navbar only supplies the theme value.

   All page styling uses local CSS variables.
========================================================= */

function readTheme() {
  if (typeof window === "undefined") return "light";

  try {
    return localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function useLocalTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const sync = () => {
      const next = readTheme();

      setTheme((previous) =>
        previous === next ? previous : next
      );
    };

    const onThemeEvent = (event) => {
      const next = event?.detail?.theme;

      if (next === "light" || next === "dark") {
        setTheme(next);
      } else {
        sync();
      }
    };

    sync();

    window.addEventListener(THEME_EVENT, onThemeEvent);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("pageshow", sync);

    // Detect same-tab localStorage changes from navbar,
    // even if navbar does not dispatch an event.
    const interval = window.setInterval(sync, 250);

    return () => {
      window.removeEventListener(
        THEME_EVENT,
        onThemeEvent
      );

      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("pageshow", sync);

      window.clearInterval(interval);
    };
  }, []);

  return theme;
}

/* =========================================================
   PRICE AND API
========================================================= */

function formatPrice(value, currency = "INR") {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Price unavailable";
  }

  try {
    return new Intl.NumberFormat(
      currency === "INR" ? "en-IN" : "en-US",
      {
        style: "currency",
        currency,
        maximumFractionDigits: Number.isInteger(amount)
          ? 0
          : 2,
      }
    ).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

function validateProduct(response) {
  if (!response?.success || !response?.data) {
    throw new Error(
      response?.message ||
      response?.error?.message ||
      "Unable to load product"
    );
  }

  const book = response.data;
  const id = book._id || book.id;

  const price =
    book.price === null ||
    book.price === undefined ||
    book.price === ""
      ? NaN
      : Number(book.price);

  if (
    !id ||
    !Number.isFinite(price) ||
    price < 0 ||
    book.active === false ||
    book.isActive === false
  ) {
    throw new Error("Product is unavailable");
  }

  const currency = book.currency || "INR";

  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error("Invalid currency");
  }

  const mrpNumber = Number(book.mrp);

  const mrp =
    book.mrp !== null &&
    book.mrp !== undefined &&
    book.mrp !== "" &&
    Number.isFinite(mrpNumber) &&
    mrpNumber >= price
      ? mrpNumber
      : price;

  return {
    ...book,
    _id: id,
    price,
    mrp,
    currency,
  };
}

function useBookProduct(path) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchBook() {
      setLoading(true);
      setError("");
      setProduct(null);

      try {
        const url =
          `${BASE_URL}/book/product?redirectUrl=` +
          encodeURIComponent(path);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
          signal: controller.signal,
        });

        const json = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            json?.message ||
            json?.error?.message ||
            "Unable to load price"
          );
        }

        const valid = validateProduct(json);

        if (!controller.signal.aborted) {
          setProduct(valid);
        }
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(`Book API failed: ${path}`, err);

        setError(err.message || "Price unavailable");
        setProduct(null);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchBook();

    return () => controller.abort();
  }, [path, refresh]);

  const retry = useCallback(() => {
    setRefresh((current) => current + 1);
  }, []);

  return {
    product,
    loading,
    error,
    retry,
    available: Boolean(product) && !loading && !error,
  };
}

/* =========================================================
   CURRICULUM
========================================================= */

const curriculum = [
  {
    icon: Code2,
    title: "Java Fundamentals",
    subtitle: "Everything starts here",
    topics: [
      "What is Java?",
      "History and evolution of Java",
      "JDK, JRE and JVM",
      "Java compilation and bytecode",
      "Java architecture",
      "Variables and data types",
      "Primitive vs reference types",
      "Operators and expressions",
      "Type casting and promotion",
      "Conditional statements",
      "Loops",
      "Methods and parameters",
      "Method overloading",
      "Recursion",
      "Java pass-by-value",
      "Wrapper classes",
      "Autoboxing and unboxing",
    ],
  },
  {
    icon: Layers3,
    title: "Object-Oriented Programming",
    subtitle: "Understand Java's object model",
    topics: [
      "Classes and objects",
      "Constructors",
      "Constructor chaining",
      "this keyword",
      "super keyword",
      "static keyword",
      "final keyword",
      "Encapsulation",
      "Inheritance",
      "Abstraction",
      "Polymorphism",
      "Compile-time polymorphism",
      "Runtime polymorphism",
      "Interfaces",
      "Abstract classes",
      "Method overriding",
      "Dynamic method dispatch",
      "Access modifiers",
      "Object class",
      "equals() and hashCode()",
      "toString()",
      "Shallow vs deep copy",
      "Immutable classes",
      "Nested and inner classes",
      "Enums and records",
      "Sealed classes",
    ],
  },
  {
    icon: Braces,
    title: "Strings, Arrays & Core APIs",
    subtitle: "Master essential Java APIs",
    topics: [
      "String class",
      "String immutability",
      "String Constant Pool",
      "String interning",
      "String comparison",
      "== vs equals()",
      "StringBuilder",
      "StringBuffer",
      "String concatenation",
      "String performance",
      "Arrays",
      "Multidimensional arrays",
      "Arrays utility class",
      "BigInteger",
      "BigDecimal",
      "Date and Time API",
      "Regular expressions",
      "Unicode",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Exception Handling",
    subtitle: "Handle errors correctly",
    topics: [
      "Exception hierarchy",
      "Throwable class",
      "Error vs Exception",
      "Checked exceptions",
      "Unchecked exceptions",
      "try-catch-finally",
      "throw vs throws",
      "Multiple catch blocks",
      "Custom exceptions",
      "Exception propagation",
      "Exception chaining",
      "Try-with-resources",
      "Suppressed exceptions",
      "Stack trace analysis",
    ],
  },
  {
    icon: Package,
    title: "Collections Framework",
    subtitle: "Understand collections internally",
    topics: [
      "Collections hierarchy",
      "Collection vs Collections",
      "Iterable and Iterator",
      "List interface",
      "ArrayList internals",
      "ArrayList resizing",
      "LinkedList internals",
      "Vector and Stack",
      "HashSet",
      "LinkedHashSet",
      "TreeSet",
      "HashMap internals",
      "Hashing and buckets",
      "Hash collisions",
      "Treeification",
      "HashMap resizing",
      "LinkedHashMap",
      "TreeMap",
      "Hashtable",
      "ConcurrentHashMap",
      "WeakHashMap",
      "IdentityHashMap",
      "PriorityQueue",
      "ArrayDeque",
      "Comparable vs Comparator",
      "Fail-fast iterators",
      "Immutable collections",
      "Collections performance",
    ],
  },
  {
    icon: GitBranch,
    title: "Generics",
    subtitle: "Java's type system",
    topics: [
      "Generic classes",
      "Generic interfaces",
      "Generic methods",
      "Bounded type parameters",
      "Wildcards",
      "Upper-bounded wildcards",
      "Lower-bounded wildcards",
      "PECS principle",
      "Type erasure",
      "Raw types",
      "Bridge methods",
      "Generic inheritance",
      "Heap pollution",
    ],
  },
  {
    icon: Zap,
    title: "Java 8 & Functional Programming",
    subtitle: "Functional Java and Streams",
    topics: [
      "Functional interfaces",
      "Lambda expressions",
      "Method references",
      "Constructor references",
      "Predicate",
      "Function",
      "Consumer",
      "Supplier",
      "Stream API",
      "Intermediate operations",
      "Terminal operations",
      "map()",
      "filter()",
      "flatMap()",
      "reduce()",
      "collect()",
      "Collectors",
      "groupingBy()",
      "partitioningBy()",
      "Parallel Streams",
      "Lazy evaluation",
      "Optional",
      "Stream interview problems",
    ],
  },
  {
    icon: Activity,
    title: "Multithreading",
    subtitle: "Java concurrency fundamentals",
    topics: [
      "Process vs thread",
      "Concurrency vs parallelism",
      "Thread lifecycle",
      "Thread states",
      "Thread class",
      "Runnable interface",
      "Callable interface",
      "Thread scheduling",
      "sleep(), join(), interrupt()",
      "Daemon threads",
      "Race conditions",
      "Critical sections",
      "Thread safety",
      "synchronized methods",
      "Synchronized blocks",
      "Intrinsic locks",
      "Object monitors",
      "volatile",
      "Java Memory Model",
      "Happens-before",
      "wait(), notify(), notifyAll()",
      "Deadlock",
      "Livelock",
      "Starvation",
    ],
  },
  {
    icon: LockKeyhole,
    title: "Advanced Concurrency",
    subtitle: "Advanced thread-safe programming",
    topics: [
      "Executor Framework",
      "ExecutorService",
      "ThreadPoolExecutor",
      "Thread pool sizing",
      "Rejection policies",
      "ScheduledExecutorService",
      "Future",
      "CompletableFuture",
      "Async chaining",
      "Combining futures",
      "ReentrantLock",
      "ReadWriteLock",
      "StampedLock",
      "AtomicInteger",
      "AtomicReference",
      "Compare-And-Swap",
      "Semaphore",
      "CountDownLatch",
      "CyclicBarrier",
      "BlockingQueue",
      "ThreadLocal",
      "ForkJoinPool",
      "Producer-consumer",
      "Virtual threads",
    ],
  },
  {
    icon: Cpu,
    title: "JVM Internals",
    subtitle: "How Java executes your code",
    topics: [
      "JVM architecture",
      "ClassLoader subsystem",
      "Bootstrap ClassLoader",
      "Platform ClassLoader",
      "Application ClassLoader",
      "Parent delegation",
      "Class loading lifecycle",
      "Loading, linking, initialization",
      "Runtime data areas",
      "Heap memory",
      "Stack memory",
      "Metaspace",
      "Stack frames",
      "Object allocation",
      "Object layout",
      "Bytecode execution",
      "Execution engine",
      "Interpreter",
      "JIT compiler",
      "HotSpot JVM",
      "Escape analysis",
      "OutOfMemoryError",
      "StackOverflowError",
    ],
  },
  {
    icon: MemoryStick,
    title: "Garbage Collection",
    subtitle: "Memory management and performance",
    topics: [
      "Garbage collection fundamentals",
      "GC roots",
      "Object reachability",
      "Strong references",
      "Weak references",
      "Soft references",
      "Phantom references",
      "Mark and Sweep",
      "Generational GC",
      "Minor and major GC",
      "Serial GC",
      "Parallel GC",
      "G1 Garbage Collector",
      "ZGC",
      "Stop-the-world",
      "Memory leaks",
      "Heap dumps",
      "Thread dumps",
      "Java Flight Recorder",
      "Java Mission Control",
      "JVM performance tuning",
    ],
  },
  {
    icon: FileCode2,
    title: "File Handling & I/O",
    subtitle: "Files, streams and serialization",
    topics: [
      "Java I/O architecture",
      "Byte streams",
      "Character streams",
      "InputStream",
      "OutputStream",
      "Reader and Writer",
      "BufferedReader",
      "BufferedWriter",
      "File class",
      "Path and Files",
      "Java NIO",
      "Buffers and Channels",
      "FileChannel",
      "Memory-mapped files",
      "Asynchronous I/O",
      "Serialization",
      "Deserialization",
      "Serializable",
      "transient",
      "serialVersionUID",
    ],
  },
  {
    icon: Database,
    title: "Reflection & Advanced APIs",
    subtitle: "Dynamic Java capabilities",
    topics: [
      "Reflection API",
      "Class metadata",
      "Inspecting constructors",
      "Inspecting methods",
      "Inspecting fields",
      "Dynamic invocation",
      "Annotations",
      "Custom annotations",
      "Annotation processing",
      "MethodHandles",
      "Dynamic proxies",
      "ClassLoaders",
      "Java Module System",
      "ServiceLoader",
    ],
  },
  {
    icon: Sparkles,
    title: "Modern Java",
    subtitle: "Java 8 through modern releases",
    topics: [
      "Java 8 features",
      "Java 9 modules",
      "Java 10 var",
      "Java 11 HTTP Client",
      "Switch expressions",
      "Text blocks",
      "Records",
      "Pattern matching",
      "Sealed classes",
      "Record patterns",
      "Java 21 virtual threads",
      "Modern Java 25",
      "Preview features",
      "Migration and compatibility",
    ],
  },
  {
    icon: GraduationCap,
    title: "Interview Preparation",
    subtitle: "SDE-level Java interviews",
    topics: [
      "Core Java interview questions",
      "OOP tricky questions",
      "String Pool questions",
      "HashMap internal questions",
      "Collections comparisons",
      "Generics questions",
      "Stream coding exercises",
      "Exception output prediction",
      "Multithreading questions",
      "Synchronization scenarios",
      "Deadlock debugging",
      "CompletableFuture questions",
      "JVM memory questions",
      "Garbage collection questions",
      "SDE-1 Java preparation",
      "SDE-2 Java preparation",
      "Advanced Java discussions",
    ],
  },
];

const benefits = [
  {
    icon: BookOpen,
    title: "Core Java",
    description:
      "Build strong fundamentals in the language and object-oriented programming.",
  },
  {
    icon: Package,
    title: "Collections Internals",
    description:
      "Understand the internal working of HashMap, ArrayList, TreeMap and more.",
  },
  {
    icon: Cpu,
    title: "JVM Internals",
    description:
      "Explore bytecode, class loading, JIT compilation and JVM memory.",
  },
  {
    icon: LockKeyhole,
    title: "Concurrency",
    description:
      "Learn synchronization, locks, atomic variables, thread pools and futures.",
  },
  {
    icon: Zap,
    title: "Modern Java",
    description:
      "Explore Streams, lambdas, records, pattern matching and virtual threads.",
  },
  {
    icon: GraduationCap,
    title: "Interview Preparation",
    description:
      "Practice tricky questions, output prediction and JVM scenarios.",
  },
];

const springModules = [
  {
    icon: Server,
    title: "Spring Core",
    text: "IoC, dependency injection, beans and lifecycle",
  },
  {
    icon: Zap,
    title: "Spring Boot",
    text: "Auto-configuration, starters and profiles",
  },
  {
    icon: Network,
    title: "REST API Development",
    text: "Controllers, DTOs, validation and exceptions",
  },
  {
    icon: Database,
    title: "Spring Data",
    text: "JPA, Hibernate, transactions and persistence",
  },
  {
    icon: KeyRound,
    title: "Spring Security",
    text: "Authentication, authorization and JWT",
  },
  {
    icon: Workflow,
    title: "Testing & Production",
    text: "Testing, Actuator, logging and deployment",
  },
];

const faqs = [
  {
    q: "Is this Java book suitable for beginners?",
    a: "Yes. The curriculum begins with the Java language fundamentals before progressing to collections, concurrency, JVM internals and advanced topics.",
  },
  {
    q: "Does this Java book include Spring Boot?",
    a: "Spring Boot is available as a separate companion ebook. The Java handbook focuses on Core Java, Advanced Java and JVM internals.",
  },
  {
    q: "Does the book include JDBC or Hibernate?",
    a: "No. JDBC and Hibernate are intentionally excluded from the Java-focused curriculum.",
  },
  {
    q: "Are design patterns included?",
    a: "Design patterns and low-level design are covered in Target Trek's dedicated LLD Java material.",
  },
  {
    q: "Does it cover Java 8?",
    a: "Yes. Lambda expressions, functional interfaces, Streams, Optional and other Java 8 topics are included.",
  },
  {
    q: "Does the curriculum include JVM internals?",
    a: "Yes. It covers runtime memory, class loading, JIT compilation, garbage collection and JVM diagnostics.",
  },
  {
    q: "How does the purchase work?",
    a: "Purchases use Target Trek's existing checkout flow. After successful payment, digital delivery instructions are provided through the website.",
  },
];

/* =========================================================
   SCOPED CSS

   IMPORTANT:
   All colors are controlled by .tt-java variables.

   No Tailwind dark: utilities.
   No global html.dark dependency.
   No body styling.
========================================================= */

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

.tt-java {
  --j-bg: #fffcf8;
  --j-surface: #ffffff;
  --j-alt: #fff6ec;
  --j-text: #29211d;
  --j-muted: #76685d;
  --j-border: #eee0d2;
  --j-orange: #ea580c;
  --j-orange-hover: #c2410c;
  --j-orange-soft: #ffedd5;
  --j-card-shadow: 0 16px 40px rgba(85,49,20,.055);
  --j-code: #241a15;
  --j-hero-start: #fff5e9;
  --j-hero-end: #fff0db;
  --j-panel: #fff8f0;
  --j-input: #ffffff;
  --j-green-bg: #f0faef;
  --j-green-card: #ffffff;
  --j-green-text: #285c30;
  color-scheme: light;

  background: var(--j-bg);
  color: var(--j-text);
  font-family: 'DM Sans', sans-serif;
  transition: background .25s, color .25s;
  min-height: 100vh;
  width: 100%;
}

.tt-java[data-java-theme="dark"] {
  --j-bg: #16110e;
  --j-surface: #241d18;
  --j-alt: #211811;
  --j-text: #fff7f0;
  --j-muted: #c3b1a3;
  --j-border: #46372e;
  --j-orange: #fb923c;
  --j-orange-hover: #ea580c;
  --j-orange-soft: #3b281c;
  --j-card-shadow: 0 16px 45px rgba(0,0,0,.18);
  --j-code: #120f0d;
  --j-hero-start: #24180f;
  --j-hero-end: #372215;
  --j-panel: #2b2019;
  --j-input: #30251f;
  --j-green-bg: #142519;
  --j-green-card: #203326;
  --j-green-text: #bbf7d0;
  color-scheme: dark;
}

.tt-java * {
  box-sizing: border-box;
}

.tt-java h1,
.tt-java h2,
.tt-java h3 {
  font-family: 'Manrope', sans-serif;
  letter-spacing: -.045em;
}

.tt-java a {
  text-decoration: none;
}

.tt-java button {
  font-family: inherit;
}

.j-bg { background: var(--j-bg); }
.j-surface { background: var(--j-surface); }
.j-alt { background: var(--j-alt); }
.j-text { color: var(--j-text); }
.j-muted { color: var(--j-muted); }
.j-accent { color: var(--j-orange); }
.j-border { border-color: var(--j-border); }
.j-soft { background: var(--j-orange-soft); }
.j-panel { background: var(--j-panel); }

.j-card {
  background: var(--j-surface);
  border: 1px solid var(--j-border);
  border-radius: 20px;
  box-shadow: var(--j-card-shadow);
  transition:
    transform .22s ease,
    border-color .22s ease,
    background .25s ease;
}

.j-card:hover {
  border-color: color-mix(
    in srgb,
    var(--j-orange) 45%,
    var(--j-border)
  );
}

.j-icon {
  background: var(--j-orange-soft);
  color: var(--j-orange);
  border-radius: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
}

.j-primary {
  background: #ea580c;
  color: #ffffff;
  border: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 14px 21px;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 850;
  cursor: pointer;
  transition: transform .2s, background .2s;
}

.j-primary:hover:not(:disabled) {
  background: #c2410c;
  transform: translateY(-2px);
}

.j-primary:disabled {
  opacity: .46;
  cursor: not-allowed;
  transform: none;
}

.j-outline {
  background: var(--j-surface);
  color: var(--j-text);
  border: 1px solid var(--j-border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 13px 20px;
  border-radius: 13px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: background .2s;
}

.j-outline:hover {
  background: var(--j-orange-soft);
}

.j-hero {
  position: relative;
  background:
    radial-gradient(
      circle at 80% 25%,
      rgba(249,115,22,.13),
      transparent 36%
    ),
    linear-gradient(
      135deg,
      var(--j-hero-start),
      var(--j-bg) 55%,
      var(--j-hero-end)
    );
}

.j-hero-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(
      rgba(234,88,12,.12) 1px,
      transparent 1px
    );
  background-size: 27px 27px;
  mask-image: linear-gradient(90deg,transparent,black);
}

.j-gradient {
  background: linear-gradient(
    90deg,
    #ea580c,
    #f97316,
    #fb923c
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.tt-java[data-java-theme="dark"] .j-gradient {
  background: linear-gradient(
    90deg,
    #fdba74,
    #fb923c,
    #fed7aa
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.j-section-head {
  max-width: 740px;
  margin: 0 auto 44px;
  text-align: center;
}

.j-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--j-orange);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: .14em;
  font-weight: 900;
}

.j-section-head h2 {
  font-size: clamp(29px,4vw,44px);
  line-height: 1.15;
  font-weight: 850;
  margin: 16px 0;
}

.j-section-head p {
  color: var(--j-muted);
  font-size: 14px;
  line-height: 1.85;
}

.j-code-panel {
  background: var(--j-code);
  color: #f5e8dc;
  border: 1px solid rgba(251,146,60,.24);
  border-radius: 21px;
  overflow: hidden;
  box-shadow: 0 25px 65px rgba(40,24,12,.20);
}

.j-code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 15px 19px;
  background: rgba(255,255,255,.055);
  border-bottom: 1px solid rgba(255,255,255,.1);
  font-size: 11px;
  color: #e3cbb8;
}

.j-code-dots {
  display: flex;
  gap: 6px;
}

.j-code-dots i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.j-code-dots i:nth-child(1) { background:#fb7185; }
.j-code-dots i:nth-child(2) { background:#fbbf24; }
.j-code-dots i:nth-child(3) { background:#34d399; }

.j-code-panel pre {
  margin: 0;
  padding: 24px;
  overflow-x: auto;
  font: 12px/2 ui-monospace,Consolas,monospace;
  white-space: pre;
}

.j-code-bottom {
  border-top: 1px solid rgba(255,255,255,.1);
  padding: 13px 19px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 10px;
  color: #c6ad99;
}

.j-price {
  font-family: 'Manrope', sans-serif;
  font-size: 36px;
  font-weight: 900;
  letter-spacing: -.06em;
  color: var(--j-text);
}

.j-price-old {
  color: var(--j-muted);
  text-decoration: line-through;
  font-size: 14px;
}

.j-price-badge {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--j-orange-soft);
  color: var(--j-orange);
  font-size: 10px;
  font-weight: 900;
}

.j-accordion {
  border: 1px solid var(--j-border);
  border-radius: 16px;
  background: var(--j-surface);
  overflow: hidden;
}

.j-accordion[data-open="true"] {
  border-color: var(--j-orange);
}

.j-accordion button {
  color: var(--j-text);
}

.j-chapters {
  border-top: 1px solid var(--j-border);
}

.j-spring-card {
  background:
    radial-gradient(
      circle at 6% 20%,
      rgba(132,204,22,.10),
      transparent 42%
    ),
    var(--j-green-bg);
  border: 1px solid
    color-mix(
      in srgb,
      var(--j-green-text) 24%,
      transparent
    );
  border-radius: 28px;
  overflow: hidden;
}

.j-spring-inner {
  background: var(--j-green-card);
  border: 1px solid
    color-mix(
      in srgb,
      var(--j-green-text) 20%,
      transparent
    );
  border-radius: 18px;
}

.j-spring-title {
  color: var(--j-green-text);
}

.j-spring-btn {
  background: #15803d;
  color: white;
  border: 0;
  border-radius: 12px;
  padding: 14px 20px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}

.j-spring-btn:hover:not(:disabled) {
  background: #166534;
}

.j-spring-btn:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.j-final {
  background:
    radial-gradient(
      circle at 88% 5%,
      rgba(249,115,22,.3),
      transparent 40%
    ),
    linear-gradient(135deg,#28190f,#452515);
  color: #ffffff;
  border-radius: 28px;
}

.j-mobile-bar {
  background: var(--j-surface);
  border: 1px solid var(--j-border);
  color: var(--j-text);
  box-shadow: 0 14px 45px rgba(0,0,0,.22);
  backdrop-filter: blur(15px);
}

.j-separator {
  border-color: var(--j-border);
}

.j-focus:focus-visible,
.j-primary:focus-visible,
.j-outline:focus-visible {
  outline: 3px solid var(--j-orange);
  outline-offset: 3px;
}

@media(max-width:650px) {
  .j-code-panel pre {
    font-size: 10px;
    padding: 15px;
  }

  .j-price {
    font-size: 31px;
  }
}

@media(prefers-reduced-motion:reduce) {
  .tt-java *,
  .tt-java *::before,
  .tt-java *::after {
    scroll-behavior: auto !important;
    animation-duration: .01ms !important;
    transition-duration: .01ms !important;
  }
}
`;

/* =========================================================
   REUSABLE ANIMATIONS
========================================================= */

function Reveal({ children, delay = 0, className = "" }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{
        duration: reduced ? 0 : 0.5,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function SectionHead({ label, title, description }) {
  return (
    <Reveal className="j-section-head">
      <span className="j-eyebrow">
        <Sparkles size={14} />
        {label}
      </span>

      <h2>{title}</h2>

      {description && <p>{description}</p>}
    </Reveal>
  );
}

function PriceDisplay({ state, inverse = false }) {
  if (state.loading) {
    return (
      <div role="status" className="animate-pulse">
        <div className="j-soft h-9 w-32 rounded-lg" />
        <div className="j-soft mt-3 h-3 w-24 rounded" />
      </div>
    );
  }

  if (!state.available) {
    return (
      <div>
        <strong
          className={
            inverse
              ? "text-lg font-black text-white"
              : "j-text text-lg font-black"
          }
        >
          Price unavailable
        </strong>

        <p
          className={
            inverse
              ? "mt-2 text-xs text-orange-100/70"
              : "j-muted mt-2 text-xs"
          }
        >
          Checkout is temporarily disabled.
        </p>
      </div>
    );
  }

  const p = state.product;

  const discount =
    p.mrp > p.price && p.mrp > 0
      ? Math.round((1 - p.price / p.mrp) * 100)
      : 0;

  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-3">
        <span
          className={
            inverse
              ? "text-4xl font-black text-white"
              : "j-price"
          }
        >
          {formatPrice(p.price, p.currency)}
        </span>

        {p.mrp > p.price && (
          <span className="j-price-old">
            {formatPrice(p.mrp, p.currency)}
          </span>
        )}
      </div>

      {discount > 0 && (
        <span className="j-price-badge mt-3">
          SAVE {discount}%
        </span>
      )}
    </div>
  );
}

/* =========================================================
   HERO ARTWORK - NO EXTERNAL IMAGE
========================================================= */

function JavaArtwork() {
  const reduced = useReducedMotion();

  const source = `import java.util.List;

public class JavaMastery {

    public static void main(String[] args) {

        List<String> topics = List.of(
            "Core Java",
            "Concurrency",
            "JVM Internals"
        );

        topics.forEach(System.out::println);
    }
}`;

  return (
    <div className="relative mx-auto flex min-h-[390px] w-full max-w-[520px] items-center justify-center">
      <motion.div
        className="absolute h-[290px] w-[290px] rounded-full border border-dashed border-orange-400/30 sm:h-[400px] sm:w-[400px]"
        animate={reduced ? {} : { rotate: 360 }}
        transition={{
          duration: 45,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="absolute h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" />

      <motion.div
        animate={reduced ? {} : { y: [0, -9, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="j-code-panel relative z-10 w-full"
      >
        <div className="j-code-header">
          <div className="j-code-dots">
            <i /><i /><i />
          </div>

          <span>JavaMastery.java</span>

          <Code2 size={15} />
        </div>

        <pre><code>{source}</code></pre>

        <div className="j-code-bottom">
          <span>Core to Advanced Java</span>

          <span className="flex items-center gap-1 text-emerald-300">
            <CheckCircle2 size={13} />
            Ready
          </span>
        </div>
      </motion.div>

      <div className="j-card j-text absolute -right-2 top-0 z-20 hidden items-center gap-2 px-3 py-2 text-[11px] font-bold sm:flex">
        <Cpu size={15} className="j-accent" />
        JVM Internals
      </div>

      <div className="j-card j-text absolute -bottom-1 left-0 z-20 hidden items-center gap-2 px-3 py-2 text-[11px] font-bold sm:flex">
        <LockKeyhole size={15} className="j-accent" />
        Concurrency
      </div>
    </div>
  );
}

/* =========================================================
   SPRING BOOT SVG - SELF-CONTAINED
========================================================= */

function SpringArtwork() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#102619] p-5">
      <svg
        viewBox="0 0 560 350"
        className="w-full"
        role="img"
        aria-label="Spring Boot application architecture"
      >
        <defs>
          <linearGradient id="ttSpringArt" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#84cc16" />
            <stop offset="1" stopColor="#22c55e" />
          </linearGradient>
        </defs>

        <circle
          cx="280" cy="175" r="140"
          fill="#365a32" opacity=".18"
        />

        <circle
          cx="280" cy="175" r="116"
          fill="none"
          stroke="#86efac"
          strokeOpacity=".3"
          strokeDasharray="6 8"
        />

        <path
          d="M125 175 H190 M370 175 H435 M280 112 V68 M280 238 V278"
          stroke="#84cc16"
          strokeWidth="3"
          strokeDasharray="7 6"
        />

        <rect
          x="190" y="112" width="180" height="126"
          rx="22"
          fill="#22382a"
          stroke="#86efac"
          strokeWidth="2"
        />

        <circle
          cx="280" cy="157" r="29"
          fill="url(#ttSpringArt)"
        />

        <path
          d="M263 165c24 8 36-8 36-24-20 2-38 12-36 24Zm3 0c9-7 16-11 25-15"
          stroke="#10321d"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />

        <text
          x="280" y="210"
          textAnchor="middle"
          fill="#f0fdf4"
          fontSize="20"
          fontWeight="700"
        >
          SPRING BOOT
        </text>

        {[
          { x: 15, y: 149, title: "REST API" },
          { x: 436, y: 149, title: "DATABASE" },
          { x: 224, y: 17, title: "SECURITY" },
          { x: 224, y: 280, title: "TESTING" },
        ].map((item) => (
          <g key={item.title}>
            <rect
              x={item.x} y={item.y}
              width="110" height="48"
              rx="11"
              fill="#27432d"
              stroke="#4d8e53"
            />
            <text
              x={item.x + 55}
              y={item.y + 29}
              textAnchor="middle"
              fill="#dcfce7"
              fontSize="12"
              fontWeight="700"
            >
              {item.title}
            </text>
          </g>
        ))}
      </svg>

      <div className="mt-2 flex flex-wrap justify-center gap-2">
        {["REST", "JPA", "Security", "Testing"].map((x) => (
          <span
            key={x}
            className="rounded-full border border-green-400/25 bg-green-900/40 px-3 py-1.5 text-[10px] font-bold text-green-100"
          >
            {x}
          </span>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function JavaBook() {
  const theme = useLocalTheme();

  const java = useBookProduct(JAVA_PATH);
  const spring = useBookProduct(SPRING_PATH);

  const [expanded, setExpanded] = useState([0]);
  const [openFaq, setOpenFaq] = useState(0);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  const [copied, setCopied] = useState(false);

  const canBuyJava = java.available;
  const canBuySpring = spring.available;

  /* REFERRAL */

  useEffect(() => {
    try {
      const params = new URLSearchParams(
        window.location.search
      );

      const ref = (
        params.get("referralCode") ||
        params.get("ref") ||
        ""
      ).trim();

      if (ref) {
        localStorage.setItem("referralCode", ref);
      }
    } catch {
      // Ignore storage errors.
    }
  }, []);

  const buyBook = (type) => {
    const selected =
      type === "spring" ? spring : java;

    if (!selected.available) return;

    setCheckoutProduct(selected.product);
    setCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setCheckoutProduct(null);
  };

  const toggle = (index) => {
    setExpanded((prev) =>
      prev.includes(index)
        ? prev.filter((x) => x !== index)
        : [...prev, index]
    );
  };

  const expandAll = () => {
    setExpanded(curriculum.map((_, i) => i));
  };

  const collapseAll = () => setExpanded([]);

  const copyCode = async () => {
    const code = `import java.util.concurrent.atomic.AtomicInteger;

public class ConcurrentCounter {
    private final AtomicInteger count =
        new AtomicInteger(0);

    public int increment() {
        return count.incrementAndGet();
    }
}`;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  /* SEO */

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: java.product?.title || BOOK_TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}${JAVA_PATH}`,
    brand: {
      "@type": "Brand",
      name: "Target Trek",
    },
    ...(canBuyJava
      ? {
          offers: {
            "@type": "Offer",
            price: java.product.price.toFixed(2),
            priceCurrency: java.product.currency,
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}${JAVA_PATH}`,
          },
        }
      : {}),
  };

  return (
    <>
      <Helmet>
        <title>{BOOK_TITLE} | Target Trek</title>

        <meta
          name="description"
          content={DESCRIPTION}
        />

        <link
          rel="canonical"
          href={`${SITE_URL}${JAVA_PATH}`}
        />

        <meta property="og:title" content={BOOK_TITLE} />

        <meta
          property="og:description"
          content={DESCRIPTION}
        />

        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>

      <style>{styles}</style>

      <main
        className="tt-java mt-16 overflow-x-clip"
        data-java-theme={theme}
      >
        {/* ===============================================
            HERO
        =============================================== */}

        <section className="j-hero relative overflow-hidden">
          <div className="j-hero-grid" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:py-24">
            <Reveal>
              <div>
                <span className="j-soft j-accent inline-flex items-center gap-2 rounded-full border j-border px-4 py-2 text-[11px] font-black uppercase tracking-widest">
                  <Sparkles size={14} />
                  Complete Java Handbook
                </span>

                <h1 className="mt-7 text-[clamp(2.7rem,5.6vw,5rem)] font-black leading-[1.06]">
                  Master Java.
                  <br />
                  <span className="j-gradient">
                    Beyond the basics.
                  </span>
                </h1>

                <p className="j-muted mt-7 max-w-xl text-[15px] leading-8">
                  From your first Java program to JVM
                  internals, multithreading, concurrency,
                  modern Java and interview preparation.
                  Build deep Java knowledge with a
                  structured learning roadmap.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={!canBuyJava}
                    onClick={() => buyBook("java")}
                    className="j-primary"
                  >
                    {java.loading
                      ? "Loading price..."
                      : canBuyJava
                        ? `Get the ebook — ${formatPrice(
                            java.product.price,
                            java.product.currency
                          )}`
                        : "Price unavailable"}

                    <ArrowRight size={16} />
                  </button>

                  <a href="#curriculum" className="j-outline">
                    Explore curriculum
                    <ChevronDown size={16} />
                  </a>
                </div>

                {!java.loading && !canBuyJava && (
                  <button
                    type="button"
                    onClick={java.retry}
                    className="j-accent mt-4 inline-flex items-center gap-2 text-xs font-bold"
                  >
                    <RefreshCw size={13} />
                    Retry loading price
                  </button>
                )}

                <div className="j-muted mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold">
                  {[
                    "Core + Advanced Java",
                    "JVM & Concurrency",
                    "Interview Preparation",
                  ].map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2"
                    >
                      <CheckCircle2
                        size={15}
                        className="j-accent"
                      />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <JavaArtwork />
            </Reveal>
          </div>
        </section>

        {/* ===============================================
            STATS
        =============================================== */}

        <div className="relative z-10 mx-auto -mt-6 grid max-w-7xl grid-cols-2 gap-3 px-5 sm:px-8 lg:grid-cols-4">
          {[
            ["15", "Learning modules"],
            ["Core → Advanced", "Structured roadmap"],
            ["JVM", "Internal architecture"],
            ["SDE-1 / SDE-2", "Interview focus"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="j-card p-5 text-center"
            >
              <strong className="block text-lg font-black sm:text-2xl">
                {value}
              </strong>

              <span className="j-muted mt-2 block text-[11px]">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* ===============================================
            BENEFITS
        =============================================== */}

        <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <SectionHead
            label="Why this ebook"
            title="Understand Java, not just syntax"
            description="Learn language fundamentals, internal implementation, concurrency and JVM architecture with a clear learning progression."
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item, i) => {
              const Icon = item.icon;

              return (
                <Reveal
                  key={item.title}
                  delay={(i % 3) * 0.06}
                  className="h-full"
                >
                  <div className="j-card h-full p-7 hover:-translate-y-1">
                    <div className="j-icon">
                      <Icon size={23} />
                    </div>

                    <h3 className="mt-6 text-lg font-extrabold">
                      {item.title}
                    </h3>

                    <p className="j-muted mt-3 text-xs leading-7">
                      {item.description}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ===============================================
            JAVA EXECUTION
        =============================================== */}

        <section className="j-alt py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHead
              label="JVM architecture"
              title="What happens when Java runs?"
              description="Understand the complete execution journey, from Java source code to optimized instructions running inside the JVM."
            />

            <div className="grid gap-4 md:grid-cols-4">
              {[
                {
                  icon: FileCode2,
                  title: "Source Code",
                  sub: ".java",
                  text: "Write Java classes and methods.",
                },
                {
                  icon: Code2,
                  title: "Compilation",
                  sub: "javac",
                  text: "Compile Java source into bytecode.",
                },
                {
                  icon: Package,
                  title: "Bytecode",
                  sub: ".class",
                  text: "Generate JVM instructions.",
                },
                {
                  icon: Cpu,
                  title: "Execution",
                  sub: "JVM + JIT",
                  text: "Run and optimize your program.",
                },
              ].map((item, i) => {
                const Icon = item.icon;

                return (
                  <Reveal key={item.title} delay={i * 0.06}>
                    <div className="j-card h-full p-6">
                      <div className="j-icon">
                        <Icon size={21} />
                      </div>

                      <span className="j-accent mt-5 block font-mono text-[10px] font-bold">
                        {item.sub}
                      </span>

                      <h3 className="mt-2 text-base font-extrabold">
                        {item.title}
                      </h3>

                      <p className="j-muted mt-3 text-xs leading-7">
                        {item.text}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===============================================
            CURRICULUM
        =============================================== */}

        <section
          id="curriculum"
          className="scroll-mt-24 py-20"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHead
              label="Complete curriculum"
              title="Everything you need to master Java"
              description="Explore fifteen detailed modules covering Java fundamentals, advanced language concepts, collections, concurrency, JVM internals and interviews."
            />

            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_310px]">
              <div>
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <span className="j-muted text-xs font-semibold">
                    {curriculum.length} modules
                  </span>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={expandAll}
                      className="j-accent text-xs font-bold"
                    >
                      Expand all
                    </button>

                    <button
                      type="button"
                      onClick={collapseAll}
                      className="j-accent text-xs font-bold"
                    >
                      Collapse all
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {curriculum.map((module, index) => {
                    const Icon = module.icon;
                    const isOpen = expanded.includes(index);

                    return (
                      <div
                        key={module.title}
                        className="j-accordion"
                        data-open={isOpen}
                      >
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`java-module-${index}`}
                          onClick={() => toggle(index)}
                          className="j-focus flex w-full items-center gap-3 px-4 py-5 text-left sm:px-5"
                        >
                          <span className="j-accent min-w-6 text-xs font-black">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                          <div className="j-icon shrink-0">
                            <Icon size={19} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <strong className="block text-sm font-extrabold sm:text-base">
                              {module.title}
                            </strong>

                            <span className="j-muted mt-1 block text-[11px] leading-5">
                              {module.subtitle}
                            </span>
                          </div>

                          <span className="j-muted hidden whitespace-nowrap text-[10px] sm:block">
                            {module.topics.length} topics
                          </span>

                          <ChevronDown
                            size={17}
                            className={`j-accent shrink-0 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              id={`java-module-${index}`}
                              initial={{
                                height: 0,
                                opacity: 0,
                              }}
                              animate={{
                                height: "auto",
                                opacity: 1,
                              }}
                              exit={{
                                height: 0,
                                opacity: 0,
                              }}
                              transition={{ duration: .23 }}
                              className="overflow-hidden"
                            >
                              <div className="j-chapters grid gap-x-6 gap-y-3 px-5 py-6 sm:grid-cols-2">
                                {module.topics.map((topic) => (
                                  <div
                                    key={topic}
                                    className="j-muted flex items-start gap-2 text-xs leading-6"
                                  >
                                    <Check
                                      size={14}
                                      className="j-accent mt-1 shrink-0"
                                    />

                                    <span>{topic}</span>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DESKTOP PRICE */}

              <aside className="space-y-4 lg:sticky lg:top-24">
                <div className="j-card p-6">
                  <span className="j-eyebrow">
                    <BookOpen size={15} />
                    Java Handbook
                  </span>

                  <h3 className="mt-4 text-xl font-black">
                    Mastering Java
                  </h3>

                  <p className="j-muted mt-3 text-xs leading-7">
                    Core Java, Advanced Java,
                    Concurrency and JVM Internals.
                  </p>

                  <div className="j-separator my-6 border-t pt-6">
                    <PriceDisplay state={java} />
                  </div>

                  <button
                    type="button"
                    disabled={!canBuyJava}
                    onClick={() => buyBook("java")}
                    className="j-primary w-full"
                  >
                    {java.loading
                      ? "Loading..."
                      : canBuyJava
                        ? "Get the Java ebook"
                        : "Price unavailable"}

                    <ArrowRight size={16} />
                  </button>

                  <div className="mt-6 space-y-3">
                    {[
                      "Digital ebook",
                      "Core + Advanced Java",
                      "Collections and Streams",
                      "JVM and Concurrency",
                      "Interview Preparation",
                    ].map((item) => (
                      <div
                        key={item}
                        className="j-muted flex items-center gap-2 text-xs"
                      >
                        <CheckCircle2
                          size={15}
                          className="j-accent"
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="j-panel j-border rounded-2xl border p-6">
                  <GraduationCap
                    size={24}
                    className="j-accent"
                  />

                  <h3 className="mt-4 text-base font-extrabold">
                    Focused on Java itself
                  </h3>

                  <p className="j-muted mt-3 text-xs leading-7">
                    Spring Boot, Hibernate, design
                    patterns and system design are
                    available as separate learning areas.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ===============================================
            TECHNICAL DEEP DIVES
        =============================================== */}

        <section className="j-alt py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHead
              label="Technical deep dives"
              title="Java concepts worth understanding deeply"
              description="Explore the internal details behind essential Java APIs and runtime behavior."
            />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Package,
                  title: "HashMap Internals",
                  desc: "Hashing, buckets, collisions, resizing and treeification.",
                },
                {
                  icon: MemoryStick,
                  title: "Java Memory Model",
                  desc: "Visibility, ordering, atomicity and happens-before guarantees.",
                },
                {
                  icon: GitBranch,
                  title: "CompletableFuture",
                  desc: "Async tasks, chaining, combination and exception handling.",
                },
                {
                  icon: Cpu,
                  title: "JVM Architecture",
                  desc: "Class loading, bytecode execution, memory and JIT compilation.",
                },
                {
                  icon: Zap,
                  title: "Stream API",
                  desc: "Functional pipelines, collectors, lazy execution and parallelism.",
                },
                {
                  icon: Activity,
                  title: "Virtual Threads",
                  desc: "Lightweight concurrency and thread scheduling in modern Java.",
                },
              ].map((item, i) => {
                const Icon = item.icon;

                return (
                  <Reveal key={item.title} delay={(i % 3) * .06}>
                    <div className="j-card h-full p-6">
                      <div className="j-icon">
                        <Icon size={22} />
                      </div>

                      <h3 className="mt-5 text-lg font-extrabold">
                        {item.title}
                      </h3>

                      <p className="j-muted mt-3 text-xs leading-7">
                        {item.desc}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===============================================
            CODE EXAMPLE
        =============================================== */}

        <section className="py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-2">
            <Reveal>
              <span className="j-eyebrow">
                <Terminal size={14} />
                Beyond the theory
              </span>

              <h2 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                Learn Java by understanding its behavior.
              </h2>

              <p className="j-muted mt-6 text-sm leading-8">
                Knowing how to use an API is different
                from understanding how it works.
                Study internal implementations,
                memory visibility, synchronization
                and runtime behavior.
              </p>

              <div className="mt-7 space-y-4">
                {[
                  "Java code examples",
                  "Internal implementation details",
                  "Performance trade-offs",
                  "Concurrency edge cases",
                  "Interview-oriented explanations",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm font-semibold"
                  >
                    <CheckCircle2
                      size={17}
                      className="j-accent"
                    />
                    {item}
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="j-code-panel">
                <div className="j-code-header">
                  <span>ConcurrentCounter.java</span>

                  <button
                    type="button"
                    onClick={copyCode}
                    className="flex items-center gap-2 text-orange-200"
                    aria-label="Copy code"
                  >
                    {copied ? (
                      <CheckCheck size={15} />
                    ) : (
                      <Copy size={15} />
                    )}

                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>

                <pre><code>{`import java.util.concurrent.atomic.AtomicInteger;

public class ConcurrentCounter {

    private final AtomicInteger count =
        new AtomicInteger(0);

    public int increment() {
        return count.incrementAndGet();
    }

    public int getCount() {
        return count.get();
    }
}`}</code></pre>

                <div className="j-code-bottom">
                  <span>Thread-safe counter example</span>
                  <CheckCircle2
                    size={14}
                    className="text-green-300"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===============================================
            SPRING BOOT COMPANION
        =============================================== */}

        <section
          id="spring-boot"
          className="j-alt scroll-mt-24 py-24"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHead
              label="Continue your backend journey"
              title="After Java, explore Spring Boot"
              description="Move from Java language fundamentals to building real-world backend applications with Spring Boot."
            />

            <Reveal>
              <div className="j-spring-card p-5 sm:p-8">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                  <SpringArtwork />

                  <div>
                    <span className="j-spring-title text-[11px] font-black uppercase tracking-widest">
                      Companion ebook
                    </span>

                    <h3 className="mt-5 text-3xl font-black leading-tight sm:text-4xl">
                      Mastering
                      <br />
                      <span className="j-spring-title">
                        Spring Boot
                      </span>
                    </h3>

                    <p className="j-muted mt-5 text-sm leading-8">
                      Learn Spring Core, dependency
                      injection, REST APIs, persistence,
                      application security, testing and
                      backend application development.
                    </p>

                    <div className="mt-7 grid gap-5 sm:grid-cols-2">
                      {springModules.map((item) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.title}
                            className="flex items-start gap-3"
                          >
                            <div className="j-spring-inner j-spring-title rounded-xl p-2.5">
                              <Icon size={18} />
                            </div>

                            <div>
                              <strong className="text-xs font-extrabold">
                                {item.title}
                              </strong>

                              <p className="j-muted mt-1 text-[11px] leading-6">
                                {item.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* SPRING PRICE STRIP */}

                <div className="j-spring-inner mt-8 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <span className="j-spring-title text-[11px] font-black uppercase tracking-widest">
                      Spring Boot ebook
                    </span>

                    <div className="mt-3">
                      <PriceDisplay state={spring} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={!canBuySpring}
                      onClick={() => buyBook("spring")}
                      className="j-spring-btn"
                    >
                      {spring.loading
                        ? "Loading..."
                        : canBuySpring
                          ? "Get Spring Boot ebook"
                          : "Price unavailable"}

                      <ArrowRight size={16} />
                    </button>

                    <a
                      href={SPRING_PATH}
                      className="j-outline"
                    >
                      View details
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>

                {!spring.loading && !canBuySpring && (
                  <button
                    type="button"
                    onClick={spring.retry}
                    className="j-spring-title mt-4 inline-flex items-center gap-2 text-xs font-bold"
                  >
                    <RefreshCw size={13} />
                    Retry Spring Boot price
                  </button>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ===============================================
            INTERVIEW PREPARATION
        =============================================== */}

        <section className="py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHead
              label="Interview preparation"
              title="Learn the concepts. Test your understanding."
              description="Prepare for Java interviews with tricky questions, internal implementation discussions and runtime behavior examples."
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <Reveal>
                <div className="j-card h-full p-7">
                  <h3 className="text-xl font-black">
                    Common Java interview questions
                  </h3>

                  <div className="mt-6 space-y-4">
                    {[
                      "How does HashMap work internally?",
                      "Why is String immutable?",
                      "How does ConcurrentHashMap work?",
                      "What does volatile guarantee?",
                      "What is the Java Memory Model?",
                      "How does CompletableFuture work?",
                      "What is the difference between Stack and Heap?",
                      "How does garbage collection work?",
                      "What are virtual threads?",
                      "How does Java class loading work?",
                    ].map((q, i) => (
                      <div
                        key={q}
                        className="j-separator flex gap-3 border-b pb-4 last:border-0"
                      >
                        <span className="j-accent text-xs font-black">
                          {String(i + 1).padStart(2, "0")}
                        </span>

                        <span className="text-xs font-semibold leading-6">
                          {q}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="j-card h-full overflow-hidden">
                  <div className="p-6">
                    <span className="j-eyebrow">
                      Output prediction
                    </span>

                    <h3 className="mt-3 text-xl font-black">
                      String equality in Java
                    </h3>
                  </div>

                  <div className="j-code-panel rounded-none border-x-0">
                    <pre><code>{`String a = "Java";
String b = "Java";
String c = new String("Java");

System.out.println(a == b);
System.out.println(a == c);
System.out.println(a.equals(c));`}</code></pre>
                  </div>

                  <div className="p-6">
                    <span className="j-eyebrow">
                      Expected output
                    </span>

                    <pre className="j-panel j-text mt-4 rounded-xl p-5 font-mono text-xs leading-8">{`true
false
true`}</pre>

                    <p className="j-muted mt-4 text-xs leading-7">
                      Understand reference identity,
                      String pooling and content
                      comparison instead of memorizing
                      the output.
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ===============================================
            FAQ
        =============================================== */}

        <section className="j-alt py-20" id="faq">
          <div className="mx-auto max-w-5xl px-5 sm:px-8">
            <SectionHead
              label="Frequently asked questions"
              title="Everything you should know"
              description="Answers to common questions about the Java curriculum and ebook purchase."
            />

            <div className="space-y-3">
              {faqs.map((item, index) => {
                const active = openFaq === index;

                return (
                  <div
                    key={item.q}
                    className="j-accordion"
                    data-open={active}
                  >
                    <button
                      type="button"
                      aria-expanded={active}
                      aria-controls={`java-faq-${index}`}
                      onClick={() =>
                        setOpenFaq(active ? -1 : index)
                      }
                      className="j-focus flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-sm font-extrabold"
                    >
                      <span>{item.q}</span>

                      <ChevronDown
                        size={18}
                        className={`j-accent shrink-0 transition-transform ${
                          active ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {active && (
                        <motion.div
                          id={`java-faq-${index}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="j-muted px-5 pb-6 text-xs leading-7">
                            {item.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===============================================
            FINAL CTA
        =============================================== */}

        <section
          id="purchase"
          className="scroll-mt-24 px-5 py-20 sm:px-8"
        >
          <div className="j-final mx-auto grid max-w-7xl items-center gap-10 p-7 sm:p-12 lg:grid-cols-[1fr_320px]">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-orange-300">
                Mastering Java
              </span>

              <h2 className="mt-5 max-w-xl text-3xl font-black leading-tight sm:text-4xl">
                Go from knowing Java to understanding Java.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-8 text-orange-100/75">
                Explore Java fundamentals, advanced
                concurrency, JVM internals, modern
                Java features and interview preparation
                in one focused learning resource.
              </p>

              <div className="mt-7 flex flex-wrap gap-5 text-xs">
                {[
                  "15 Modules",
                  "Advanced Java",
                  "Interview Focus",
                ].map((text) => (
                  <span
                    key={text}
                    className="flex items-center gap-2 text-orange-100"
                  >
                    <Check size={15} />
                    {text}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
              <span className="text-xs font-bold text-orange-100/80">
                Current Java ebook price
              </span>

              <div className="mt-5">
                <PriceDisplay state={java} inverse />
              </div>

              <button
                type="button"
                disabled={!canBuyJava}
                onClick={() => buyBook("java")}
                className="j-primary mt-7 w-full"
              >
                {java.loading
                  ? "Loading..."
                  : canBuyJava
                    ? "Get the Java ebook"
                    : "Price unavailable"}

                <ArrowRight size={16} />
              </button>

              <p className="mt-4 flex items-center justify-center gap-2 text-center text-[10px] text-orange-100/70">
                <LockKeyhole size={12} />
                Secure Target Trek checkout
              </p>
            </div>
          </div>
        </section>

        {/* ===============================================
            SUPPORT - NO FOOTER
        =============================================== */}

        <section className="px-5 pb-28 text-center sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <MessageCircle
              size={19}
              className="j-accent"
            />

            <span className="j-muted text-xs">
              Need help with your purchase?
            </span>

            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="j-accent text-xs font-bold hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </section>

        {/* ===============================================
            FIXED MOBILE BUY BAR
        =============================================== */}

        {!checkoutOpen && (
          <div className="j-mobile-bar fixed bottom-[max(10px,env(safe-area-inset-bottom))] left-3 right-3 z-40 flex items-center justify-between gap-3 rounded-2xl p-3 sm:hidden">
            <div className="min-w-0">
              <strong className="block truncate text-base font-black">
                {java.loading
                  ? "Loading..."
                  : canBuyJava
                    ? formatPrice(
                        java.product.price,
                        java.product.currency
                      )
                    : "Price unavailable"}
              </strong>

              <small className="j-muted mt-1 block text-[10px]">
                Mastering Java
              </small>
            </div>

            <button
              type="button"
              disabled={!canBuyJava}
              onClick={() => buyBook("java")}
              className="j-primary shrink-0 px-4 py-3 text-xs"
            >
              {canBuyJava ? "Buy Now" : "Unavailable"}
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </main>

      {/* ===============================================
          EXISTING PAYU CHECKOUT
      =============================================== */}

      {typeof document !== "undefined" &&
        createPortal(
          <PayUCheckoutModal
            isOpen={checkoutOpen}
            onClose={closeCheckout}
            product={checkoutProduct}
          />,
          document.body
        )}
    </>
  );
}
