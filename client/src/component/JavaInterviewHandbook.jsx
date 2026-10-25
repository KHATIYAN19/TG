
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Coffee,
  Copy,
  CreditCard,
  Download,
  FileCode2,
  FileText,
  GraduationCap,
  Layers3,
  Loader2,
  LockKeyhole,
  Moon,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Terminal,
  X,
  Zap,
} from "lucide-react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";

/* ==========================================================
   CONFIGURATION
========================================================== */

const BASE_URL =
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:5001";

const JAVA_BOOK_REDIRECT_URL =
  "/book/java-interview-handbook";

const SITE_URL = "https://www.targettrek.in";

const SEO_TITLE =
  "100 Java Interview Questions & Answers | Java Handbook | Target Trek";

const SEO_DESCRIPTION =
  "Prepare for Java interviews with 100 curated questions covering Core Java, OOP, Collections, Streams, JVM, Multithreading, Concurrency, and Modern Java.";

const THEME_STORAGE_KEY = "theme";

const STORAGE_KEYS = {
  referral: "referralCode",
  chapters: "tt_java_handbook_chapters",
  search: "tt_java_handbook_search",
  level: "tt_java_handbook_level",
};

/* ==========================================================
   LOCAL STORAGE HELPERS
========================================================== */

const safeGet = (key, fallback = null) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const safeSet = (key, value) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // Storage may be unavailable.
  }
};

const normalizeTheme = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  return normalized === "dark" ||
    normalized === "light"
    ? normalized
    : null;
};

const readThemeFromStorage = () => {
  return normalizeTheme(
    safeGet(THEME_STORAGE_KEY)
  );
};

const readThemeFromDom = () => {
  if (typeof document === "undefined") {
    return null;
  }

  const html = document.documentElement;
  const body = document.body;

  const attributeTheme =
    normalizeTheme(html.getAttribute("data-theme")) ||
    normalizeTheme(body?.getAttribute("data-theme"));

  if (attributeTheme) return attributeTheme;

  if (
    html.classList.contains("dark") ||
    body?.classList.contains("dark")
  ) {
    return "dark";
  }

  if (
    html.classList.contains("light") ||
    body?.classList.contains("light")
  ) {
    return "light";
  }

  return null;
};

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  return (
    readThemeFromStorage() ||
    readThemeFromDom() ||
    (window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    )?.matches
      ? "dark"
      : "light")
  );
};

const getStoredChapters = () => {
  try {
    const stored = safeGet(STORAGE_KEYS.chapters);

    if (!stored) return ["fundamentals"];

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : ["fundamentals"];
  } catch {
    return ["fundamentals"];
  }
};

const cx = (...classes) =>
  classes.filter(Boolean).join(" ");

const formatMoney = (amount, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
};

/* ==========================================================
   COMPLETE BOOK CHAPTERS
========================================================== */

const CHAPTERS = [
  {
    id: "fundamentals",
    number: "01",
    title: "Java Fundamentals",
    range: "Q1–Q10",
    count: 10,
    level: "Beginner",
    description:
      "Understand Java execution, language basics, and frequently asked foundational questions.",
    topics: [
      "What is Java and why is it platform-independent?",
      "JDK vs JRE vs JVM",
      "Compilation and Java bytecode",
      "Features of Java",
      "Primitive vs reference data types",
      "== vs equals()",
      "final vs finally vs finalize()",
      "Static vs instance variables",
      "Java pass-by-value",
      "Method overloading vs overriding",
    ],
  },

  {
    id: "oops",
    number: "02",
    title: "Object-Oriented Programming",
    range: "Q11–Q20",
    count: 10,
    level: "Beginner",
    description:
      "Master OOP concepts, interfaces, inheritance, polymorphism, and object design.",
    topics: [
      "Four pillars of OOP",
      "Encapsulation vs abstraction",
      "Abstract class vs interface",
      "Default and static interface methods",
      "Multiple inheritance in Java",
      "Constructor overloading",
      "Inheritance vs composition",
      "Runtime polymorphism",
      "this vs super",
      "Immutable class implementation",
    ],
  },

  {
    id: "strings",
    number: "03",
    title: "Strings and Object Handling",
    range: "Q21–Q28",
    count: 8,
    level: "Beginner",
    description:
      "Understand String internals, equality, immutability, and object behavior.",
    topics: [
      "Why String is immutable",
      "String Constant Pool",
      "String vs StringBuilder vs StringBuffer",
      "String literal vs new String()",
      "Shallow copy vs deep copy",
      "Object class methods",
      "equals() and hashCode() contract",
      "Wrapper classes and autoboxing",
    ],
  },

  {
    id: "collections",
    number: "04",
    title: "Java Collections Framework",
    range: "Q29–Q40",
    count: 12,
    level: "Intermediate",
    description:
      "Explore collections, internal implementations, complexity, and performance trade-offs.",
    topics: [
      "Java Collections Framework",
      "List vs Set vs Queue vs Map",
      "ArrayList vs LinkedList",
      "HashMap internal working",
      "HashMap collision handling",
      "HashMap vs Hashtable vs ConcurrentHashMap",
      "HashSet vs LinkedHashSet vs TreeSet",
      "Comparable vs Comparator",
      "Fail-fast vs weakly consistent iteration",
      "PriorityQueue internals",
      "CopyOnWriteArrayList",
      "Choosing the correct collection",
    ],
  },

  {
    id: "exceptions",
    number: "05",
    title: "Exception Handling and Generics",
    range: "Q41–Q48",
    count: 8,
    level: "Intermediate",
    description:
      "Learn robust exception handling, generics, type erasure, and resource management.",
    topics: [
      "Checked vs unchecked exceptions",
      "try-catch-finally behavior",
      "Try-with-resources",
      "throw vs throws",
      "Custom exceptions",
      "Java generics",
      "Type erasure",
      "Wildcard generics",
    ],
  },

  {
    id: "java8",
    number: "06",
    title: "Java 8+ and Stream API",
    range: "Q49–Q60",
    count: 12,
    level: "Intermediate",
    description:
      "Practice functional programming, lambdas, Streams, Optional, and Collectors.",
    topics: [
      "Lambda expressions",
      "Functional interfaces",
      "Predicate, Function, Consumer, Supplier",
      "Stream API",
      "map() vs flatMap()",
      "Intermediate and terminal operations",
      "filter(), map(), reduce()",
      "findFirst() vs findAny()",
      "Parallel streams",
      "Optional",
      "Method references",
      "Collectors.groupingBy() and partitioningBy()",
    ],
  },

  {
    id: "concurrency",
    number: "07",
    title: "Multithreading and Concurrency",
    range: "Q61–Q72",
    count: 12,
    level: "Advanced",
    description:
      "Understand thread safety, locking, synchronization, deadlocks, and executor frameworks.",
    topics: [
      "Process vs thread",
      "Thread lifecycle",
      "Thread vs Runnable vs Callable",
      "start() vs run()",
      "Synchronization and race conditions",
      "synchronized vs ReentrantLock",
      "volatile keyword",
      "Deadlock prevention",
      "wait() vs sleep() vs join()",
      "ExecutorService",
      "Future vs CompletableFuture",
      "Atomic variables and CAS",
    ],
  },

  {
    id: "jvm",
    number: "08",
    title: "JVM and Memory Management",
    range: "Q73–Q82",
    count: 10,
    level: "Advanced",
    description:
      "Understand JVM architecture, heap, stack, garbage collection, and debugging.",
    topics: [
      "JVM architecture",
      "Stack vs heap",
      "Metaspace vs PermGen",
      "Garbage collection internals",
      "Minor, major, and full GC",
      "G1 GC and ZGC",
      "Memory leaks in Java",
      "OutOfMemoryError vs StackOverflowError",
      "Class loading mechanism",
      "JIT compiler",
    ],
  },

  {
    id: "modern",
    number: "09",
    title: "Modern Java Features",
    range: "Q83–Q88",
    count: 6,
    level: "Intermediate",
    description:
      "Cover interview-relevant features from Java 17, Java 21, and newer releases.",
    topics: [
      "Java records",
      "Sealed classes and interfaces",
      "Switch expressions and pattern matching",
      "Virtual threads",
      "Text blocks and sequenced collections",
      "Modern Java language improvements",
    ],
  },

  {
    id: "coding",
    number: "10",
    title: "Java Coding and Output Questions",
    range: "Q89–Q94",
    count: 6,
    level: "Intermediate",
    description:
      "Practice Java code behavior, common coding questions, and interview implementations.",
    topics: [
      "String equality output questions",
      "Overloading and overriding output puzzles",
      "Duplicate elements using Streams",
      "First non-repeating character",
      "LRU Cache using LinkedHashMap",
      "Thread-safe counter implementation",
    ],
  },

  {
    id: "scenarios",
    number: "11",
    title: "Real-World Java Scenarios",
    range: "Q95–Q98",
    count: 4,
    level: "Advanced",
    description:
      "Production-oriented interview questions for Java backend developers.",
    topics: [
      "Debugging high memory usage",
      "Investigating race conditions",
      "Diagnosing application latency",
      "Designing a thread-safe cache",
    ],
  },

  {
    id: "tricky",
    number: "12",
    title: "Tricky Java Interview Questions",
    range: "Q99–Q100",
    count: 2,
    level: "Advanced",
    description:
      "Explore subtle Java behaviors that often appear as technical follow-ups.",
    topics: [
      "Mutable HashMap keys and broken lookups",
      "Why volatile does not make count++ atomic",
    ],
  },
];

/* ==========================================================
   SAMPLE INTERVIEW QUESTIONS
========================================================== */

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    category: "Core Java",
    difficulty: "Beginner",
    question:
      "Is Java pass-by-value or pass-by-reference?",
    answer:
      "Java is always pass-by-value. When an object is passed to a method, a copy of its reference value is passed. The method can modify the referenced object's state, but assigning the parameter to another object does not change the caller's reference.",
    followUp:
      "What happens if you reassign the object parameter inside the method?",
  },

  {
    id: 2,
    category: "Collections",
    difficulty: "Intermediate",
    question: "How does HashMap work internally?",
    answer:
      "HashMap stores entries in hash-based buckets. It uses the key's hash to identify a bucket and equals() to identify the matching key. Collisions are handled through nodes, with sufficiently large buckets potentially converted into balanced trees.",
    followUp:
      "What happens when two different keys have the same hashCode()?",
  },

  {
    id: 3,
    category: "Concurrency",
    difficulty: "Advanced",
    question:
      "Why does volatile not make count++ thread-safe?",
    answer:
      "The volatile keyword provides visibility and ordering guarantees. However, count++ is a read-modify-write operation consisting of multiple steps. Multiple threads may read the same value before writing, causing lost updates.",
    followUp:
      "How would AtomicInteger solve this problem?",
  },

  {
    id: 4,
    category: "Java 8+",
    difficulty: "Intermediate",
    question:
      "What is the difference between map() and flatMap()?",
    answer:
      "map() transforms every element into another value. flatMap() transforms each element into a stream and combines the resulting streams into a single flattened stream.",
    followUp:
      "When would you use flatMap() with a List<List<Integer>>?",
  },

  {
    id: 5,
    category: "JVM",
    difficulty: "Advanced",
    question:
      "Can Java applications have memory leaks?",
    answer:
      "Yes. Garbage collection reclaims unreachable objects, but objects retained by unnecessary references remain reachable. Common examples include unbounded caches, retained event listeners, and ThreadLocal values.",
    followUp:
      "Which tools would you use to investigate a suspected Java memory leak?",
  },
];

/* ==========================================================
   BENEFITS
========================================================== */

const BENEFITS = [
  {
    icon: Target,
    title: "Interview-Focused",
    description:
      "100 carefully organized Java questions for technical interview revision.",
  },
  {
    icon: Code2,
    title: "Practical Java Code",
    description:
      "Understand concepts using Java snippets, output questions, and implementations.",
  },
  {
    icon: Layers3,
    title: "Deep Technical Concepts",
    description:
      "Go beyond definitions with JVM, HashMap, Streams, and concurrency internals.",
  },
  {
    icon: Zap,
    title: "Quick Revision",
    description:
      "Return to important concepts before interviews with structured chapters.",
  },
];

/* ==========================================================
   FREQUENTLY ASKED QUESTIONS
========================================================== */

const FAQS = [
  {
    question:
      "Is this ebook suitable for beginners?",
    answer:
      "Yes. The handbook starts with Java fundamentals and object-oriented programming before moving into collections, streams, concurrency, JVM internals, and advanced topics.",
  },
  {
    question:
      "Does it cover Java 8, 17, and 21?",
    answer:
      "Yes. The syllabus includes Java 8 features and modern Java concepts such as records, sealed classes, pattern matching, and virtual threads.",
  },
  {
    question:
      "Does this ebook contain coding questions?",
    answer:
      "Yes. It covers code-output problems, Java collections, Stream API operations, LRU Cache, and thread-safe implementations.",
  },
  {
    question:
      "Is this a complete Java programming course?",
    answer:
      "No. This is an interview preparation handbook designed around 100 Java interview questions, explanations, examples, and technical follow-ups.",
  },
  {
    question:
      "How will I receive my ebook?",
    answer:
      "After successful payment confirmation, you will receive access through Target Trek's existing digital ebook delivery flow.",
  },
  {
    question:
      "Is this a physical book?",
    answer:
      "No. This is a digital PDF ebook that can be viewed on supported mobile devices, tablets, and computers.",
  },
  {
    question:
      "How can I contact support?",
    answer:
      "For purchase or ebook support, email supporttargettrek@gmail.com.",
  },
];

/* ==========================================================
   REUSABLE SECTION HEADING
========================================================== */

function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  isDarkMode = false,
}) {
  return (
    <div
      className={cx(
        "max-w-3xl",
        center && "mx-auto text-center"
      )}
    >
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.19em] text-orange-600 dark:text-orange-400">
        {eyebrow}
      </p>

      <h2
        className={cx(
          "text-3xl font-extrabold leading-[1.15] tracking-tight",
          "sm:text-4xl lg:text-[43px]",
          isDarkMode
            ? "text-white"
            : "text-slate-950"
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cx(
            "mt-4 text-sm leading-7 sm:text-base",
            isDarkMode
              ? "text-slate-400"
              : "text-slate-600"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* ==========================================================
   JAVA BOOK COVER FALLBACK
========================================================== */

function JavaBookCover() {
  return (
    <div className="relative mx-auto w-[250px] sm:w-[310px]">
      <div className="absolute -inset-10 rounded-full bg-orange-500/15 blur-[65px]" />

      <div
        className="
          relative aspect-[0.72]
          overflow-hidden
          rounded-r-xl rounded-l-sm
          border-l-[9px] border-orange-900
          bg-gradient-to-br
          from-orange-400
          via-orange-600
          to-orange-900
          p-6 sm:p-8
          text-white
          shadow-[18px_25px_60px_rgba(154,52,18,0.22)]
          transition-transform duration-500
          hover:-rotate-2 hover:scale-[1.03]
        "
      >
        <div className="absolute -right-24 top-20 h-72 w-72 rounded-full border border-white/20" />
        <div className="absolute -right-16 bottom-6 h-48 w-48 rounded-full border border-white/15" />

        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black tracking-[0.2em]">
              TARGET TREK
            </span>

            <span className="rounded border border-white/40 px-2 py-1 text-[8px] font-bold">
              INTERVIEW SERIES
            </span>
          </div>

          <div className="mt-12 flex justify-end">
            <Coffee
              size={47}
              strokeWidth={1.5}
              className="text-white/90"
            />
          </div>

          <div className="mt-auto">
            <p className="text-[9px] font-bold tracking-[0.2em]">
              THE DEVELOPER'S HANDBOOK
            </p>

            <h3 className="mt-3 text-[34px] font-black leading-[1.1] tracking-tight sm:text-[42px]">
              JAVA
              <br />
              INTERVIEW
              <br />
              HANDBOOK
            </h3>

            <div className="my-5 h-1 w-14 bg-white" />

            <p className="text-xl font-extrabold leading-tight">
              100 QUESTIONS
              <br />
              & ANSWERS
            </p>
          </div>

          <div className="mt-8 border-t border-white/30 pt-4">
            <p className="text-[9px] font-bold tracking-wide text-orange-100">
              CORE JAVA · JVM · CONCURRENCY
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================
   CODE PREVIEW
========================================================== */

function JavaCodePreview() {
  const [copied, setCopied] = useState(false);

  const code = `import java.util.*;
import java.util.stream.*;

public class InterviewExample {

    public static void main(String[] args) {

        List<Integer> numbers =
            Arrays.asList(1, 2, 2, 3, 4, 4);

        Set<Integer> seen = new HashSet<>();

        List<Integer> duplicates =
            numbers.stream()
                .filter(n -> !seen.add(n))
                .collect(Collectors.toList());

        System.out.println(duplicates);
    }
}

// Output: [2, 4]`;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#151922] shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-700 bg-[#1c2230] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
          </div>

          <span className="ml-3 text-xs text-slate-400">
            InterviewExample.java
          </span>
        </div>

        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1.5 rounded-md border border-slate-600 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
        >
          {copied ? (
            <Check size={14} />
          ) : (
            <Copy size={14} />
          )}

          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="overflow-x-auto p-5 sm:p-7">
        <pre className="text-[11px] leading-7 text-slate-200 sm:text-[12px]">
          <code>{code}</code>
        </pre>
      </div>

      <div className="flex items-center gap-2 border-t border-slate-700 bg-[#1c2230] px-5 py-3 text-xs text-slate-400">
        <Terminal
          size={15}
          className="text-orange-400"
        />

        Practical Java code examples
      </div>
    </div>
  );
}

/* ==========================================================
   MAIN COMPONENT
========================================================== */

export default function JavaInterviewHandbook() {
  /* --------------------------------------------------------
     THEME
  -------------------------------------------------------- */

  const [theme, setTheme] = useState(getStoredTheme);

  const isDarkMode = theme === "dark";

  /* --------------------------------------------------------
     BACKEND PRODUCT
  -------------------------------------------------------- */

  const [product, setProduct] = useState(null);

  const [
    loadingProduct,
    setLoadingProduct,
  ] = useState(true);

  const [
    productError,
    setProductError,
  ] = useState("");

  const [
    productReloadKey,
    setProductReloadKey,
  ] = useState(0);

  /* --------------------------------------------------------
     CHECKOUT
  -------------------------------------------------------- */

  const [
    checkoutProduct,
    setCheckoutProduct,
  ] = useState(null);

  const [
    isCheckoutOpen,
    setIsCheckoutOpen,
  ] = useState(false);

  /* --------------------------------------------------------
     CHAPTERS
  -------------------------------------------------------- */

  const [
    expandedChapters,
    setExpandedChapters,
  ] = useState(getStoredChapters);

  const [searchQuery, setSearchQuery] = useState(
    () => safeGet(STORAGE_KEYS.search, "")
  );

  const [levelFilter, setLevelFilter] = useState(
    () => {
      const stored = safeGet(STORAGE_KEYS.level, "All");

      return [
        "All",
        "Beginner",
        "Intermediate",
        "Advanced",
      ].includes(stored)
        ? stored
        : "All";
    }
  );

  /* --------------------------------------------------------
     SAMPLES AND FAQ
  -------------------------------------------------------- */

  const [activeSample, setActiveSample] = useState(1);

  const [openFaq, setOpenFaq] = useState(0);

  /* ========================================================
     THEME SYNC WITH EXISTING TARGET TREK NAVBAR
  ======================================================== */

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof document === "undefined"
    ) {
      return undefined;
    }

    let lastStorageTheme = readThemeFromStorage();
    let lastDomTheme = readThemeFromDom();

    const commitTheme = (nextTheme) => {
      if (!nextTheme) return;

      setTheme((current) =>
        current === nextTheme ? current : nextTheme
      );
    };

    const syncTheme = () => {
      const storageTheme = readThemeFromStorage();
      const domTheme = readThemeFromDom();

      if (
        storageTheme &&
        storageTheme !== lastStorageTheme
      ) {
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
          (window.matchMedia?.(
            "(prefers-color-scheme: dark)"
          )?.matches
            ? "dark"
            : "light")
      );
    };

    const onStorage = (event) => {
      if (
        !event.key ||
        event.key === THEME_STORAGE_KEY
      ) {
        syncTheme();
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        syncTheme();
      }
    };

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

    const media = window.matchMedia?.(
      "(prefers-color-scheme: dark)"
    );

    syncTheme();

    // Supports navbar theme changes that write to
    // localStorage without dispatching a custom event.
    const intervalId = window.setInterval(
      syncTheme,
      1000
    );

    window.addEventListener(
      "storage",
      onStorage
    );

    window.addEventListener(
      "themechange",
      syncTheme
    );

    window.addEventListener(
      "tt-theme-change",
      syncTheme
    );

    window.addEventListener(
      "focus",
      syncTheme
    );

    document.addEventListener(
      "visibilitychange",
      onVisibility
    );

    media?.addEventListener?.(
      "change",
      syncTheme
    );

    return () => {
      observer.disconnect();

      window.clearInterval(intervalId);

      window.removeEventListener(
        "storage",
        onStorage
      );

      window.removeEventListener(
        "themechange",
        syncTheme
      );

      window.removeEventListener(
        "tt-theme-change",
        syncTheme
      );

      window.removeEventListener(
        "focus",
        syncTheme
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibility
      );

      media?.removeEventListener?.(
        "change",
        syncTheme
      );
    };
  }, []);

  /* ========================================================
     REFERRAL CODE - SAME AS HLD
  ======================================================== */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const params = new URLSearchParams(
      window.location.search
    );

    const referralCode = (
      params.get("referralCode") ||
      params.get("ref") ||
      ""
    ).trim();

    if (referralCode) {
      safeSet("referralCode", referralCode);
    }
  }, []);

  /* ========================================================
     PRODUCT API - EXACT HLD PATTERN
  ======================================================== */

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

        const redirectUrl =
          JAVA_BOOK_REDIRECT_URL;

        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
            redirectUrl
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
            signal: controller.signal,
          }
        );

        const result = await response
          .json()
          .catch(() => null);

        if (
          !response.ok ||
          !result?.success ||
          !result?.data
        ) {
          throw new Error(
            result?.error?.message ||
              "Java Interview Handbook not found."
          );
        }

        const loadedProduct = result.data;

        const loadedPrice = Number(
          loadedProduct?.price
        );

        if (
          !Number.isFinite(loadedPrice) ||
          loadedPrice <= 0
        ) {
          throw new Error(
            "The product does not have a valid selling price."
          );
        }

        setProduct(loadedProduct);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        console.error(
          "Failed to fetch Java Interview Handbook:",
          error
        );

        setProduct(null);

        setProductError(
          error?.message ||
            "Unable to load this ebook."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProduct(false);
        }
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [productReloadKey]);

  /* ========================================================
     LOCAL STORAGE PERSISTENCE
  ======================================================== */

  useEffect(() => {
    safeSet(
      STORAGE_KEYS.chapters,
      JSON.stringify(expandedChapters)
    );
  }, [expandedChapters]);

  useEffect(() => {
    safeSet(
      STORAGE_KEYS.search,
      searchQuery
    );
  }, [searchQuery]);

  useEffect(() => {
    safeSet(
      STORAGE_KEYS.level,
      levelFilter
    );
  }, [levelFilter]);

  /* ========================================================
     PRODUCT DETAILS
  ======================================================== */

  const currentPrice = Number(
    product?.price ?? 0
  );

  const mrp = Number(
    product?.mrp ?? 0
  );

  const currency =
    product?.currency || "INR";

  const hasValidPrice =
    Number.isFinite(currentPrice) &&
    currentPrice > 0;

  const discount =
    mrp > currentPrice &&
    currentPrice >= 0
      ? Math.round(
          ((mrp - currentPrice) / mrp) * 100
        )
      : 0;

  const bookCover =
    product?.coverpageurl ||
    product?.coverPageUrl ||
    product?.cover_page_url ||
    "";

  const productName =
    product?.title ||
    "Master Java Interviews — Top 100 Questions";

  const formattedPrice = hasValidPrice
    ? formatMoney(currentPrice, currency)
    : "—";

  const formattedMrp =
    mrp > currentPrice && hasValidPrice
      ? formatMoney(mrp, currency)
      : null;

  const canBuy =
    !loadingProduct &&
    !productError &&
    Boolean(product) &&
    hasValidPrice;

  /* ========================================================
     BUY NOW
  ======================================================== */

  const handleBuyNow = useCallback(() => {
    if (
      !product ||
      loadingProduct ||
      productError ||
      !hasValidPrice
    ) {
      return;
    }

    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  }, [
    product,
    loadingProduct,
    productError,
    hasValidPrice,
  ]);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    setCheckoutProduct(null);
  }, []);

  const handleRetry = () => {
    setProductReloadKey((prev) => prev + 1);
  };

  /* ========================================================
     CHAPTER FILTERS
  ======================================================== */

  const filteredChapters = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return CHAPTERS.filter((chapter) => {
      const matchesLevel =
        levelFilter === "All" ||
        chapter.level === levelFilter;

      const searchable = [
        chapter.title,
        chapter.description,
        chapter.range,
        chapter.level,
        ...chapter.topics,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      return matchesLevel && matchesSearch;
    });
  }, [searchQuery, levelFilter]);

  const toggleChapter = (id) => {
    setExpandedChapters((current) => {
      if (current.includes(id)) {
        return current.filter(
          (item) => item !== id
        );
      }

      return [...current, id];
    });
  };

  const expandAll = () => {
    setExpandedChapters(
      CHAPTERS.map((chapter) => chapter.id)
    );
  };

  const collapseAll = () => {
    setExpandedChapters([]);
  };

  const allExpanded =
    expandedChapters.length === CHAPTERS.length;

  const selectedSample =
    SAMPLE_QUESTIONS.find(
      (item) => item.id === activeSample
    ) || SAMPLE_QUESTIONS[0];

  /* ========================================================
     SCROLL HELPERS
  ======================================================== */

  const scrollToSection = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  /* ========================================================
     REUSABLE BUY BUTTON
  ======================================================== */

  const BuyButton = ({
    className = "",
    compact = false,
  }) => (
    <button
      type="button"
      onClick={handleBuyNow}
      disabled={!canBuy}
      className={cx(
        "inline-flex items-center justify-center gap-3",
        "rounded-xl border border-orange-600",
        "bg-gradient-to-r from-orange-500 to-orange-600",
        "font-extrabold text-white",
        "shadow-[0_10px_25px_rgba(249,115,22,0.2)]",
        "transition-all duration-200",
        "hover:-translate-y-0.5",
        "hover:from-orange-600 hover:to-orange-700",
        "hover:shadow-[0_15px_30px_rgba(249,115,22,0.28)]",
        "disabled:cursor-not-allowed",
        "disabled:opacity-50",
        compact
          ? "min-h-[46px] px-5 text-xs"
          : "min-h-[54px] px-7 text-sm",
        className
      )}
    >
      {loadingProduct ? (
        <>
          <Loader2
            size={18}
            className="animate-spin"
          />
          Loading...
        </>
      ) : productError || !canBuy ? (
        <>
          <RefreshCcw size={17} />
          Currently unavailable
        </>
      ) : (
        <>
          <LockKeyhole
            size={compact ? 15 : 18}
          />

          Buy Now — {formattedPrice}

          <ArrowRight
            size={compact ? 16 : 19}
          />
        </>
      )}
    </button>
  );

  /* ========================================================
     THEME CLASSES
  ======================================================== */

  const pageBg = isDarkMode
    ? "bg-[#101114] text-white"
    : "bg-white text-slate-950";

  const sectionBg = isDarkMode
    ? "bg-[#17191e]"
    : "bg-[#fffaf6]";

  const cardBg = isDarkMode
    ? "bg-[#1d2026] border-white/10"
    : "bg-white border-slate-200";

  const mutedText = isDarkMode
    ? "text-slate-400"
    : "text-slate-600";

  const mainText = isDarkMode
    ? "text-white"
    : "text-slate-950";

  const subtleBorder = isDarkMode
    ? "border-white/10"
    : "border-slate-200";

  /* ========================================================
     MAIN JSX
  ======================================================== */

  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>

        <meta
          name="description"
          content={SEO_DESCRIPTION}
        />

        <meta
          name="robots"
          content="index,follow"
        />

        <link
          rel="canonical"
          href={`${SITE_URL}${JAVA_BOOK_REDIRECT_URL}`}
        />

        <meta
          property="og:title"
          content={SEO_TITLE}
        />

        <meta
          property="og:description"
          content={SEO_DESCRIPTION}
        />

        <meta
          property="og:type"
          content="product"
        />

        <meta
          property="og:url"
          content={`${SITE_URL}${JAVA_BOOK_REDIRECT_URL}`}
        />

        {bookCover && (
          <meta
            property="og:image"
            content={bookCover}
          />
        )}

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Book",
            name: productName,
            description: SEO_DESCRIPTION,
            inLanguage: "en",
            bookFormat:
              "https://schema.org/EBook",
            author: {
              "@type": "Organization",
              name: "Target Trek",
            },
            publisher: {
              "@type": "Organization",
              name: "Target Trek",
            },
            url:
              `${SITE_URL}${JAVA_BOOK_REDIRECT_URL}`,
            ...(bookCover
              ? { image: bookCover }
              : {}),
            ...(canBuy
              ? {
                  offers: {
                    "@type": "Offer",
                    price: currentPrice,
                    priceCurrency: currency,
                    url:
                      `${SITE_URL}${JAVA_BOOK_REDIRECT_URL}`,
                  },
                }
              : {}),
          })}
        </script>
      </Helmet>

      {/* ==================================================
          PAGE
          NO NAVBAR
          NO BREADCRUMBS
          mt-16
      ================================================== */}

      <main
        data-theme={theme}
        className={cx(
          "mt-16 min-h-screen w-full overflow-x-clip",
          "font-['Inter',sans-serif]",
          "transition-colors duration-300",
          pageBg
        )}
      >
        {/* ================================================
            HERO SECTION
        ================================================ */}

        <section
          className={cx(
            "relative overflow-hidden",
            "pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24",
            isDarkMode
              ? "bg-[#101114]"
              : "bg-gradient-to-br from-white via-white to-orange-50/50"
          )}
        >
          <div className="pointer-events-none absolute -right-32 top-20 h-[470px] w-[470px] rounded-full bg-orange-400/10 blur-[110px]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              {/* LEFT CONTENT */}

              <div>
                <div className="mb-7 flex flex-wrap items-center gap-2">
                  <span
                    className={cx(
                      "inline-flex items-center gap-2",
                      "rounded-full border px-3 py-1.5",
                      "text-[10px] font-extrabold uppercase tracking-wider",
                      isDarkMode
                        ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
                        : "border-orange-200 bg-orange-50 text-orange-700"
                    )}
                  >
                    <Sparkles size={13} />
                    Java Interview Series
                  </span>

                  <span
                    className={cx(
                      "inline-flex items-center gap-2 rounded-full border",
                      "px-3 py-1.5 text-[10px] font-bold",
                      cardBg,
                      mutedText
                    )}
                  >
                    <FileText size={13} />
                    Digital Ebook
                  </span>
                </div>

                <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-400">
                  THE JAVA INTERVIEW HANDBOOK
                </p>

                <h1
                  className={cx(
                    "max-w-2xl text-[43px] font-black",
                    "leading-[1.07] tracking-[-0.055em]",
                    "sm:text-[58px] lg:text-[69px]",
                    mainText
                  )}
                >
                  100 Java
                  <br />
                  Interview
                  <br />
                  <span className="text-orange-500">
                    Questions.
                  </span>
                </h1>

                <p
                  className={cx(
                    "mt-7 max-w-xl text-lg font-semibold leading-8",
                    isDarkMode
                      ? "text-slate-200"
                      : "text-slate-800"
                  )}
                >
                  One practical handbook to revise
                  Core Java, OOP, Collections, Streams,
                  Multithreading, JVM, and modern Java.
                </p>

                <p
                  className={cx(
                    "mt-4 max-w-xl text-sm leading-7",
                    mutedText
                  )}
                >
                  Prepare with structured questions,
                  clear explanations, important Java
                  internals, code examples, tricky
                  follow-ups, and real-world interview
                  scenarios.
                </p>

                {/* STATS */}

                <div className="mt-9 grid max-w-md grid-cols-3 gap-4">
                  {[
                    {
                      number: "100",
                      label: "Questions",
                    },
                    {
                      number: "12",
                      label: "Chapters",
                    },
                    {
                      number: "3",
                      label: "Skill Levels",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border-l-[3px] border-orange-500 pl-3"
                    >
                      <p
                        className={cx(
                          "text-2xl font-black",
                          mainText
                        )}
                      >
                        {item.number}
                      </p>

                      <p
                        className={cx(
                          "mt-1 text-xs",
                          mutedText
                        )}
                      >
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* HERO PRICING */}

                <div
                  className={cx(
                    "mt-9 border-t pt-7",
                    subtleBorder
                  )}
                >
                  {loadingProduct ? (
                    <div className="h-10 w-36 animate-pulse rounded-lg bg-orange-100 dark:bg-white/10" />
                  ) : canBuy ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={cx(
                          "text-[38px] font-black tracking-tight",
                          mainText
                        )}
                      >
                        {formattedPrice}
                      </span>

                      {formattedMrp && (
                        <span
                          className={cx(
                            "text-lg line-through",
                            mutedText
                          )}
                        >
                          {formattedMrp}
                        </span>
                      )}

                      {discount > 0 && (
                        <span
                          className={cx(
                            "rounded-md px-2.5 py-1 text-xs font-extrabold",
                            isDarkMode
                              ? "bg-orange-500/15 text-orange-300"
                              : "bg-orange-100 text-orange-700"
                          )}
                        >
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  ) : (
                    <p
                      className={cx(
                        "text-sm font-semibold",
                        mutedText
                      )}
                    >
                      Product price unavailable
                    </p>
                  )}

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <BuyButton />

                    <button
                      type="button"
                      onClick={() =>
                        scrollToSection("java-syllabus")
                      }
                      className={cx(
                        "inline-flex min-h-[54px] items-center justify-center gap-2",
                        "rounded-xl border px-6 text-sm font-extrabold",
                        "transition-all hover:border-orange-500 hover:text-orange-500",
                        cardBg,
                        mainText
                      )}
                    >
                      Explore Chapters
                      <ArrowUpRight size={17} />
                    </button>
                  </div>

                  <div
                    className={cx(
                      "mt-5 flex items-start gap-2 text-xs",
                      mutedText
                    )}
                  >
                    <ShieldCheck
                      size={17}
                      className="shrink-0 text-green-600"
                    />

                    <span>
                      Secure checkout · Digital PDF ·
                      Access after successful payment
                    </span>
                  </div>

                  {productError && (
                    <div className="mt-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
                      <p>{productError}</p>

                      <button
                        type="button"
                        onClick={handleRetry}
                        className="mt-3 inline-flex items-center gap-2 font-bold underline"
                      >
                        <RefreshCcw size={15} />
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT BOOK COVER */}

              <div className="relative flex min-h-[420px] items-center justify-center py-5 sm:min-h-[500px]">
                <div className="absolute h-80 w-80 rounded-full bg-orange-500/10 blur-[75px]" />

                <div
                  className={cx(
                    "absolute right-0 top-6 z-10",
                    "hidden items-center gap-2 rounded-xl border px-4 py-3",
                    "text-xs font-bold shadow-lg sm:flex",
                    cardBg,
                    mainText
                  )}
                >
                  <Code2
                    size={17}
                    className="text-orange-500"
                  />

                  Core to Advanced Java
                </div>

                <div className="relative z-[2] w-full max-w-[350px]">
                  {bookCover ? (
                    <div className="relative">
                      <div className="absolute inset-6 bg-orange-500/20 blur-3xl" />

                      <img
                        src={bookCover}
                        alt={productName}
                        className="
                          relative mx-auto
                          max-h-[490px] w-full
                          object-contain
                          drop-shadow-[16px_24px_24px_rgba(0,0,0,0.18)]
                        "
                      />
                    </div>
                  ) : (
                    <JavaBookCover />
                  )}
                </div>

                <div
                  className={cx(
                    "absolute bottom-4 left-0 z-10",
                    "hidden items-center gap-2 rounded-xl border px-4 py-3",
                    "text-xs font-bold shadow-lg sm:flex",
                    cardBg,
                    mainText
                  )}
                >
                  <CheckCircle2
                    size={17}
                    className="text-green-600"
                  />

                  Structured Interview Prep
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            FEATURE STRIP
        ================================================ */}

        <section
          className={cx(
            "border-y",
            subtleBorder,
            sectionBg
          )}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              {
                icon: FileText,
                text: "Digital PDF",
              },
              {
                icon: Code2,
                text: "Java Examples",
              },
              {
                icon: Target,
                text: "Interview Focused",
              },
              {
                icon: ShieldCheck,
                text: "Secure Payment",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.text}
                  className={cx(
                    "flex items-center justify-center gap-3",
                    "border-b px-3 py-5 text-xs font-extrabold",
                    "lg:border-b-0",
                    subtleBorder,
                    mainText
                  )}
                >
                  <Icon
                    size={19}
                    className="text-orange-500"
                  />
                  {item.text}
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================
            BENEFITS SECTION
        ================================================ */}

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="WHY THIS HANDBOOK?"
              title="Learn what actually matters in Java interviews."
              description="A focused revision handbook covering fundamental Java concepts, implementation details, and advanced technical discussions."
              center
              isDarkMode={isDarkMode}
            />

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={cx(
                      "rounded-2xl border p-6",
                      "transition-all duration-300",
                      "hover:-translate-y-1 hover:border-orange-400",
                      "hover:shadow-xl",
                      cardBg
                    )}
                  >
                    <div
                      className={cx(
                        "mb-6 flex h-12 w-12 items-center justify-center",
                        "rounded-xl",
                        isDarkMode
                          ? "bg-orange-500/15"
                          : "bg-orange-50"
                      )}
                    >
                      <Icon
                        size={23}
                        className="text-orange-500"
                      />
                    </div>

                    <h3
                      className={cx(
                        "text-base font-extrabold",
                        mainText
                      )}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={cx(
                        "mt-3 text-xs leading-6",
                        mutedText
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================
            WHO SHOULD READ
        ================================================ */}

        <section className={cx("py-20", sectionBg)}>
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
            <div>
              <SectionHeading
                eyebrow="WHO SHOULD READ THIS?"
                title="Designed for Java developers at every stage."
                description="Whether you're preparing for your first Java backend role or revising for SDE-2 interviews, this handbook provides a structured path."
                isDarkMode={isDarkMode}
              />

              <div className="mt-8 space-y-4">
                {[
                  "Students preparing for Java interviews",
                  "Freshers applying for backend roles",
                  "SDE-1 engineers revising Core Java",
                  "SDE-2 candidates preparing for advanced rounds",
                  "Spring Boot developers strengthening fundamentals",
                  "Developers returning to interview preparation",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <span
                      className={cx(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        isDarkMode
                          ? "bg-orange-500/15"
                          : "bg-orange-100"
                      )}
                    >
                      <Check
                        size={15}
                        className="text-orange-600"
                      />
                    </span>

                    <p
                      className={cx(
                        "text-sm font-medium leading-6",
                        mainText
                      )}
                    >
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={cx(
                "rounded-2xl border p-6 shadow-sm sm:p-8",
                cardBg
              )}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-orange-600">
                  Your Learning Roadmap
                </p>

                <GraduationCap
                  size={23}
                  className="text-orange-500"
                />
              </div>

              {[
                {
                  number: "01",
                  title: "Build Foundations",
                  description:
                    "Java basics, OOP, Strings",
                },
                {
                  number: "02",
                  title: "Master Core Concepts",
                  description:
                    "Collections, Generics, Streams",
                },
                {
                  number: "03",
                  title: "Understand Internals",
                  description:
                    "JVM, Concurrency, Garbage Collection",
                },
                {
                  number: "04",
                  title: "Practice Interviews",
                  description:
                    "Coding, Scenarios, Tricky Questions",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className={cx(
                    "flex items-center gap-4 border-t py-5",
                    subtleBorder
                  )}
                >
                  <span
                    className={cx(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                      "text-sm font-black text-orange-600",
                      isDarkMode
                        ? "bg-orange-500/15"
                        : "bg-orange-50"
                    )}
                  >
                    {step.number}
                  </span>

                  <div className="flex-1">
                    <h3
                      className={cx(
                        "text-sm font-extrabold",
                        mainText
                      )}
                    >
                      {step.title}
                    </h3>

                    <p
                      className={cx(
                        "mt-1 text-xs",
                        mutedText
                      )}
                    >
                      {step.description}
                    </p>
                  </div>

                  <CheckCircle2
                    size={18}
                    className="text-green-600"
                  />
                </div>
              ))}

              <div
                className={cx(
                  "mt-4 flex items-center gap-2 rounded-xl p-4",
                  "text-xs font-bold text-orange-600",
                  isDarkMode
                    ? "bg-orange-500/10"
                    : "bg-orange-50"
                )}
              >
                <Sparkles size={16} />
                Structured beginner-to-advanced revision
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            FULL SYLLABUS
        ================================================ */}

        <section
          id="java-syllabus"
          className="scroll-mt-24 py-20 sm:py-24"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="COMPLETE TABLE OF CONTENTS"
              title="12 chapters. 100 Java interview questions."
              description="Explore the complete syllabus covering Java fundamentals, advanced internals, and real-world interview discussions."
              isDarkMode={isDarkMode}
            />

            {/* SEARCH AND FILTERS */}

            <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div
                className={cx(
                  "flex h-12 w-full items-center gap-3",
                  "rounded-xl border px-4 lg:max-w-sm",
                  cardBg
                )}
              >
                <Search
                  size={18}
                  className="text-orange-500"
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search chapters and topics..."
                  className={cx(
                    "min-w-0 flex-1 bg-transparent",
                    "text-sm outline-none",
                    mainText,
                    "placeholder:text-slate-500"
                  )}
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery("")
                    }
                    aria-label="Clear search"
                    className={mutedText}
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  "All",
                  "Beginner",
                  "Intermediate",
                  "Advanced",
                ].map((level) => (
                  <button
                    type="button"
                    key={level}
                    onClick={() =>
                      setLevelFilter(level)
                    }
                    className={cx(
                      "shrink-0 rounded-lg border px-4 py-2",
                      "text-xs font-extrabold transition-all",
                      levelFilter === level
                        ? "border-orange-500 bg-orange-500 text-white"
                        : cx(cardBg, mutedText)
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* CHAPTER COUNT */}

            <div className="mb-4 mt-7 flex items-center justify-between gap-4">
              <p
                className={cx(
                  "text-xs font-semibold",
                  mutedText
                )}
              >
                Showing{" "}
                <strong>
                  {filteredChapters.length}
                </strong>{" "}
                of {CHAPTERS.length} chapters
              </p>

              <button
                type="button"
                onClick={
                  allExpanded
                    ? collapseAll
                    : expandAll
                }
                className="flex items-center gap-1.5 text-xs font-extrabold text-orange-600"
              >
                {allExpanded
                  ? "Collapse All"
                  : "Expand All"}

                <ChevronDown size={15} />
              </button>
            </div>

            {/* CHAPTER CARDS */}

            <div className="space-y-3">
              {filteredChapters.map((chapter) => {
                const expanded =
                  expandedChapters.includes(
                    chapter.id
                  );

                return (
                  <div
                    key={chapter.id}
                    className={cx(
                      "overflow-hidden rounded-xl border transition-all",
                      expanded
                        ? "border-orange-400"
                        : subtleBorder,
                      isDarkMode
                        ? "bg-[#1d2026]"
                        : "bg-white"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        toggleChapter(chapter.id)
                      }
                      aria-expanded={expanded}
                      className={cx(
                        "flex w-full items-center gap-3",
                        "px-4 py-5 text-left sm:gap-5 sm:px-6",
                        isDarkMode
                          ? "hover:bg-white/[0.03]"
                          : "hover:bg-orange-50/40"
                      )}
                    >
                      <span
                        className={cx(
                          "flex h-11 w-11 shrink-0 items-center justify-center",
                          "rounded-xl text-sm font-black",
                          isDarkMode
                            ? "bg-orange-500/15 text-orange-400"
                            : "bg-orange-50 text-orange-600"
                        )}
                      >
                        {chapter.number}
                      </span>

                      <div className="min-w-0 flex-1">
                        <h3
                          className={cx(
                            "text-sm font-extrabold sm:text-base",
                            mainText
                          )}
                        >
                          {chapter.title}
                        </h3>

                        <p
                          className={cx(
                            "mt-1 text-[11px] sm:text-xs",
                            mutedText
                          )}
                        >
                          {chapter.range} ·{" "}
                          {chapter.count} Questions
                        </p>
                      </div>

                      <span
                        className={cx(
                          "hidden rounded-md px-2.5 py-1",
                          "text-[10px] font-extrabold sm:inline-flex",
                          chapter.level === "Beginner"
                            ? "bg-green-100 text-green-700"
                            : chapter.level === "Intermediate"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-orange-100 text-orange-700"
                        )}
                      >
                        {chapter.level}
                      </span>

                      <ChevronDown
                        size={19}
                        className={cx(
                          "shrink-0 transition-transform duration-200",
                          expanded &&
                            "rotate-180 text-orange-500",
                          !expanded && mutedText
                        )}
                      />
                    </button>

                    {expanded && (
                      <div
                        className={cx(
                          "border-t px-5 py-6 sm:px-7",
                          subtleBorder
                        )}
                      >
                        <p
                          className={cx(
                            "mb-6 text-sm leading-7",
                            mutedText
                          )}
                        >
                          {chapter.description}
                        </p>

                        <div className="grid gap-4 sm:grid-cols-2">
                          {chapter.topics.map(
                            (topic, index) => (
                              <div
                                key={`${chapter.id}-${index}`}
                                className="flex items-start gap-3"
                              >
                                <CheckCircle2
                                  size={16}
                                  className="mt-0.5 shrink-0 text-orange-500"
                                />

                                <p
                                  className={cx(
                                    "text-xs leading-6",
                                    mainText
                                  )}
                                >
                                  {topic}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredChapters.length === 0 && (
                <div
                  className={cx(
                    "rounded-2xl border border-dashed p-12 text-center",
                    subtleBorder
                  )}
                >
                  <Search
                    size={32}
                    className="mx-auto text-orange-500"
                  />

                  <h3
                    className={cx(
                      "mt-4 text-lg font-extrabold",
                      mainText
                    )}
                  >
                    No matching chapters found
                  </h3>

                  <p
                    className={cx(
                      "mt-2 text-sm",
                      mutedText
                    )}
                  >
                    Try a different search term or
                    reset your filters.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setLevelFilter("All");
                    }}
                    className="mt-5 rounded-lg bg-orange-500 px-5 py-2.5 text-xs font-bold text-white"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>

            {/* BOTTOM SYLLABUS CTA */}

            <div
              className={cx(
                "mt-7 flex flex-col items-start justify-between gap-5",
                "rounded-xl border border-orange-200 p-5",
                "sm:flex-row sm:items-center sm:p-6",
                isDarkMode
                  ? "bg-orange-500/10"
                  : "bg-orange-50"
              )}
            >
              <div className="flex items-start gap-3">
                <BookOpen
                  size={24}
                  className="shrink-0 text-orange-600"
                />

                <div>
                  <h3
                    className={cx(
                      "text-sm font-extrabold",
                      mainText
                    )}
                  >
                    Your complete Java interview roadmap
                  </h3>

                  <p
                    className={cx(
                      "mt-1 text-xs",
                      mutedText
                    )}
                  >
                    100 questions organized into 12 chapters.
                  </p>
                </div>
              </div>

              <BuyButton compact />
            </div>
          </div>
        </section>

        {/* ================================================
            SAMPLE QUESTIONS
        ================================================ */}

        <section
          id="java-preview"
          className={cx(
            "scroll-mt-24 py-20 sm:py-24",
            sectionBg
          )}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="A LOOK INSIDE"
              title="Explore sample Java interview questions."
              description="Preview a few questions and explanations before purchasing the complete handbook."
              center
              isDarkMode={isDarkMode}
            />

            <div className="mt-12 grid gap-5 lg:grid-cols-[280px_1fr]">
              <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
                {SAMPLE_QUESTIONS.map((sample) => (
                  <button
                    type="button"
                    key={sample.id}
                    onClick={() =>
                      setActiveSample(sample.id)
                    }
                    className={cx(
                      "flex min-w-[170px] items-center gap-3 rounded-xl border",
                      "p-4 text-left transition-all lg:min-w-0",
                      activeSample === sample.id
                        ? isDarkMode
                          ? "border-orange-500 bg-orange-500/15"
                          : "border-orange-500 bg-orange-50"
                        : cardBg
                    )}
                  >
                    <span className="text-xs font-black text-orange-600">
                      0{sample.id}
                    </span>

                    <div>
                      <p
                        className={cx(
                          "text-xs font-extrabold",
                          mainText
                        )}
                      >
                        {sample.category}
                      </p>

                      <p
                        className={cx(
                          "mt-1 text-[10px]",
                          mutedText
                        )}
                      >
                        {sample.difficulty}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div
                className={cx(
                  "flex min-h-[380px] flex-col rounded-2xl border p-6 shadow-sm",
                  "sm:p-9",
                  cardBg
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-orange-600">
                    Sample Interview Question
                  </span>

                  <span
                    className={cx(
                      "text-xs font-semibold",
                      mutedText
                    )}
                  >
                    {selectedSample.difficulty}
                  </span>
                </div>

                <h3
                  className={cx(
                    "mt-7 text-xl font-extrabold leading-snug sm:text-2xl",
                    mainText
                  )}
                >
                  {selectedSample.question}
                </h3>

                <div className="mt-7 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-green-600">
                  <CheckCircle2 size={17} />

                  Interview Answer
                </div>

                <p
                  className={cx(
                    "mt-4 text-sm leading-8",
                    mutedText
                  )}
                >
                  {selectedSample.answer}
                </p>

                <div
                  className={cx(
                    "mt-7 rounded-xl border-l-[3px] border-orange-500 p-4",
                    isDarkMode
                      ? "bg-orange-500/10"
                      : "bg-orange-50"
                  )}
                >
                  <p className="text-[11px] font-black uppercase tracking-wider text-orange-600">
                    Tricky Follow-up
                  </p>

                  <p
                    className={cx(
                      "mt-2 text-sm font-semibold",
                      mainText
                    )}
                  >
                    {selectedSample.followUp}
                  </p>
                </div>

                <div
                  className={cx(
                    "mt-auto flex flex-wrap items-center justify-between gap-3",
                    "border-t pt-6",
                    subtleBorder
                  )}
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-orange-600">
                    <Sparkles size={16} />
                    Preview Question
                  </span>

                  <span
                    className={cx(
                      "text-xs",
                      mutedText
                    )}
                  >
                    100 Questions in the full handbook
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================
            CODE EXAMPLES SECTION
        ================================================ */}

        <section className="py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
            <div>
              <SectionHeading
                eyebrow="LEARN WITH REAL JAVA CODE"
                title="Understand concepts beyond definitions."
                description="Java interviews often test what code does, why it works, and how different implementations behave."
                isDarkMode={isDarkMode}
              />

              <div className="mt-9 space-y-6">
                {[
                  {
                    icon: FileCode2,
                    title: "Practical Java Examples",
                    description:
                      "Understand the use of important Java APIs and language features.",
                  },
                  {
                    icon: Terminal,
                    title: "Output-Based Questions",
                    description:
                      "Prepare to trace Java code and explain unexpected behavior.",
                  },
                  {
                    icon: Layers3,
                    title: "Deeper Interview Follow-ups",
                    description:
                      "Learn why an implementation works and what alternatives exist.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-start gap-4"
                    >
                      <div
                        className={cx(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                          isDarkMode
                            ? "bg-orange-500/15"
                            : "bg-orange-50"
                        )}
                      >
                        <Icon
                          size={21}
                          className="text-orange-500"
                        />
                      </div>

                      <div>
                        <h3
                          className={cx(
                            "text-sm font-extrabold",
                            mainText
                          )}
                        >
                          {item.title}
                        </h3>

                        <p
                          className={cx(
                            "mt-1 text-xs leading-6",
                            mutedText
                          )}
                        >
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() =>
                  scrollToSection("java-pricing")
                }
                className="mt-9 inline-flex items-center gap-2 text-sm font-extrabold text-orange-600 hover:gap-3"
              >
                Get the Complete Handbook

                <ArrowRight size={18} />
              </button>
            </div>

            <JavaCodePreview />
          </div>
        </section>

        {/* ================================================
            COVERAGE
        ================================================ */}

        <section className={cx("py-20", sectionBg)}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="COMPLETE COVERAGE"
              title="The Java topics you should know."
              description="From beginner-level language features to advanced performance and concurrency discussions."
              isDarkMode={isDarkMode}
            />

            <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Core Java",
                  topics: [
                    "Java fundamentals",
                    "OOP principles",
                    "Strings and immutability",
                    "Exception handling",
                    "Generics",
                  ],
                },
                {
                  title: "Collections & Java 8",
                  topics: [
                    "HashMap internals",
                    "List, Set, Queue, Map",
                    "Stream API",
                    "Lambda expressions",
                    "Optional and Collectors",
                  ],
                },
                {
                  title: "Advanced Java",
                  topics: [
                    "Multithreading",
                    "Synchronization",
                    "Locks and Executors",
                    "JVM architecture",
                    "Garbage collection",
                  ],
                },
                {
                  title: "Interview Practice",
                  topics: [
                    "Coding questions",
                    "Output puzzles",
                    "Production debugging",
                    "Modern Java",
                    "Tricky follow-ups",
                  ],
                },
              ].map((group) => (
                <div
                  key={group.title}
                  className={cx(
                    "rounded-2xl border p-6",
                    cardBg
                  )}
                >
                  <h3
                    className={cx(
                      "mb-6 text-base font-extrabold",
                      mainText
                    )}
                  >
                    {group.title}
                  </h3>

                  <div className="space-y-4">
                    {group.topics.map((topic) => (
                      <div
                        key={topic}
                        className="flex items-start gap-2.5"
                      >
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-orange-500"
                        />

                        <p
                          className={cx(
                            "text-xs leading-6",
                            mutedText
                          )}
                        >
                          {topic}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================
            HOW IT WORKS
        ================================================ */}

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="SIMPLE DIGITAL PURCHASE"
              title="Start preparing in three simple steps."
              center
              isDarkMode={isDarkMode}
            />

            <div className="mt-14 grid gap-7 md:grid-cols-3">
              {[
                {
                  number: "01",
                  icon: BookOpen,
                  title: "Choose Your Ebook",
                  description:
                    "Explore the syllabus and select the Java Interview Handbook.",
                },
                {
                  number: "02",
                  icon: CreditCard,
                  title: "Complete Payment",
                  description:
                    "Use the existing Target Trek secure payment checkout.",
                },
                {
                  number: "03",
                  icon: Download,
                  title: "Access Your PDF",
                  description:
                    "Follow the digital download instructions after successful payment.",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.number}
                    className="relative px-4 py-6 text-center"
                  >
                    <span
                      className={cx(
                        "absolute right-5 top-0 text-4xl font-black",
                        isDarkMode
                          ? "text-white/10"
                          : "text-slate-100"
                      )}
                    >
                      {item.number}
                    </span>

                    <div
                      className={cx(
                        "mx-auto mb-6 flex h-16 w-16 items-center justify-center",
                        "rounded-2xl",
                        isDarkMode
                          ? "bg-orange-500/15"
                          : "bg-orange-50"
                      )}
                    >
                      <Icon
                        size={26}
                        className="text-orange-500"
                      />
                    </div>

                    <h3
                      className={cx(
                        "text-base font-extrabold",
                        mainText
                      )}
                    >
                      {item.title}
                    </h3>

                    <p
                      className={cx(
                        "mx-auto mt-3 max-w-xs text-xs leading-7",
                        mutedText
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================
            PRICING SECTION
        ================================================ */}

        <section
          id="java-pricing"
          className={cx(
            "scroll-mt-24 py-20 sm:py-24",
            sectionBg
          )}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="GET YOUR COPY"
              title="Your Java interview preparation starts here."
              description="One focused digital handbook covering 100 important Java questions."
              center
              isDarkMode={isDarkMode}
            />

            <div
              className={cx(
                "mx-auto mt-12 max-w-[480px] rounded-2xl border",
                "border-orange-300 p-6 shadow-xl sm:p-8",
                isDarkMode
                  ? "bg-[#1d2026]"
                  : "bg-white"
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600">
                  <Coffee size={17} />

                  Java Interview Series
                </span>

                <span
                  className={cx(
                    "rounded-md border px-2.5 py-1 text-[10px] font-extrabold",
                    subtleBorder,
                    mutedText
                  )}
                >
                  DIGITAL EBOOK
                </span>
              </div>

              <h3
                className={cx(
                  "mt-7 text-2xl font-black leading-snug",
                  mainText
                )}
              >
                Master Java Interviews
                <br />
                Top 100 Questions
              </h3>

              <p
                className={cx(
                  "mt-3 text-sm leading-7",
                  mutedText
                )}
              >
                Prepare for Java backend interviews with
                carefully organized explanations,
                practical examples, and advanced concepts.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {loadingProduct ? (
                  <div className="h-11 w-36 animate-pulse rounded-lg bg-orange-100 dark:bg-white/10" />
                ) : canBuy ? (
                  <>
                    <strong
                      className={cx(
                        "text-[44px] font-black tracking-tight",
                        mainText
                      )}
                    >
                      {formattedPrice}
                    </strong>

                    {formattedMrp && (
                      <del
                        className={cx(
                          "text-lg",
                          mutedText
                        )}
                      >
                        {formattedMrp}
                      </del>
                    )}

                    {discount > 0 && (
                      <span className="rounded-md bg-orange-100 px-2.5 py-1 text-[11px] font-black text-orange-700">
                        {discount}% OFF
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    className={cx(
                      "text-sm",
                      mutedText
                    )}
                  >
                    Price unavailable
                  </span>
                )}
              </div>

              <div
                className={cx(
                  "my-7 border-t",
                  subtleBorder
                )}
              />

              <p
                className={cx(
                  "mb-5 text-xs font-black uppercase tracking-wider",
                  mainText
                )}
              >
                What's Included
              </p>

              <div className="space-y-4">
                {[
                  "100 Java Interview Questions",
                  "12 Detailed Chapters",
                  "Core Java and OOP",
                  "Collections and Stream API",
                  "Multithreading and Concurrency",
                  "JVM and Garbage Collection",
                  "Modern Java Concepts",
                  "Coding and Output Questions",
                  "Production-Based Scenarios",
                  "Digital PDF Format",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-orange-500"
                    />

                    <span
                      className={cx(
                        "text-xs font-semibold",
                        mainText
                      )}
                    >
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-9">
                <BuyButton className="w-full" />
              </div>

              <div
                className={cx(
                  "mt-5 flex flex-wrap items-center justify-center gap-2",
                  "text-[11px]",
                  mutedText
                )}
              >
                <ShieldCheck
                  size={16}
                  className="text-green-600"
                />

                Secure Checkout

                <span>·</span>

                <LockKeyhole size={14} />

                Protected Payment
              </div>

              {productError && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                  <p>{productError}</p>

                  <button
                    type="button"
                    onClick={handleRetry}
                    className="mt-3 font-extrabold underline"
                  >
                    Retry Product Loading
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================================================
            FAQ
        ================================================ */}

        <section className="py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8">
            <div>
              <SectionHeading
                eyebrow="FREQUENTLY ASKED QUESTIONS"
                title="Everything you need to know."
                description="Answers to common questions about the Java Interview Handbook."
                isDarkMode={isDarkMode}
              />

              <a
                href="mailto:supporttargettrek@gmail.com"
                className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-orange-600"
              >
                Need Help?

                <ArrowUpRight size={17} />
              </a>
            </div>

            <div
              className={cx(
                "border-t",
                subtleBorder
              )}
            >
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div
                    key={faq.question}
                    className={cx(
                      "border-b",
                      subtleBorder
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenFaq(
                          isOpen ? -1 : index
                        )
                      }
                      className={cx(
                        "flex w-full items-center justify-between gap-5",
                        "py-5 text-left text-sm font-extrabold",
                        mainText
                      )}
                    >
                      <span>{faq.question}</span>

                      <ChevronDown
                        size={19}
                        className={cx(
                          "shrink-0 transition-transform",
                          isOpen
                            ? "rotate-180 text-orange-500"
                            : mutedText
                        )}
                      />
                    </button>

                    {isOpen && (
                      <p
                        className={cx(
                          "pb-6 pr-6 text-sm leading-7",
                          mutedText
                        )}
                      >
                        {faq.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================
            FINAL CTA
        ================================================ */}

        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div
            className="
              relative mx-auto max-w-7xl
              overflow-hidden rounded-3xl
              bg-gradient-to-br
              from-orange-800
              via-orange-600
              to-orange-500
              px-7 py-12
              text-white
              sm:px-12 sm:py-16
              lg:px-16
            "
          >
            <div className="absolute -right-32 top-0 h-96 w-96 rounded-full border border-white/20" />

            <div className="absolute -right-10 bottom-0 h-72 w-72 rounded-full border border-white/10" />

            <div className="relative z-10 max-w-2xl">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-orange-100">
                <Sparkles size={15} />

                Target Trek Interview Series
              </p>

              <h2 className="mt-6 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Prepare with clarity.
                <br />
                <span className="text-orange-100">
                  Interview with confidence.
                </span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-8 text-orange-50">
                Strengthen your understanding of Java
                fundamentals, JVM internals,
                multithreading, modern features, and
                real-world interview scenarios.
              </p>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  className={cx(
                    "inline-flex min-h-[54px] items-center justify-center gap-3",
                    "rounded-xl bg-white px-7",
                    "text-sm font-black text-orange-700",
                    "shadow-xl transition-all",
                    "hover:-translate-y-0.5 hover:bg-orange-50",
                    "disabled:cursor-not-allowed disabled:opacity-60"
                  )}
                >
                  {loadingProduct ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Loading...
                    </>
                  ) : (
                    <>
                      <LockKeyhole size={18} />

                      Buy Now — {formattedPrice}

                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </div>
            </div>

            <Coffee
              size={200}
              strokeWidth={1}
              className="pointer-events-none absolute -bottom-10 right-6 hidden rotate-[-12deg] text-white/10 lg:block"
            />
          </div>
        </section>

        {/* ================================================
            MOBILE STICKY BUY NOW
        ================================================ */}

        {!isCheckoutOpen && (
          <div
            className={cx(
              "fixed inset-x-0 bottom-0 z-[100]",
              "flex items-center justify-between gap-4",
              "border-t px-4 py-3 pb-[calc(12px+env(safe-area-inset-bottom))]",
              "shadow-[0_-8px_30px_rgba(0,0,0,0.08)]",
              "md:hidden",
              isDarkMode
                ? "border-white/10 bg-[#1d2026]"
                : "border-slate-200 bg-white"
            )}
          >
            <div className="min-w-0">
              <p
                className={cx(
                  "truncate text-[10px] font-semibold",
                  mutedText
                )}
              >
                Java Interview Handbook
              </p>

              <p
                className={cx(
                  "mt-0.5 text-2xl font-black",
                  mainText
                )}
              >
                {loadingProduct
                  ? "Loading..."
                  : formattedPrice}
              </p>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canBuy}
              className={cx(
                "inline-flex min-h-[47px] min-w-[142px]",
                "items-center justify-center gap-2",
                "rounded-xl bg-gradient-to-r from-orange-500 to-orange-600",
                "px-5 text-xs font-black text-white",
                "shadow-lg transition-all hover:from-orange-600 hover:to-orange-700",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {loadingProduct ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <>
                  Buy Now

                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        )}

        {/* MOBILE EXTRA BOTTOM SPACE */}

        <div className="h-16 md:hidden" />
      </main>

      {/* ==================================================
          EXISTING TARGET TREK PAYMENT MODAL
      ================================================== */}

      <PayUCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        product={checkoutProduct}
      />
    </>
  );
}
