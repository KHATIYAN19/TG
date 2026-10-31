
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  RefreshCcw,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { trackViewContent } from "../lib/metaPixel.js";

/* ==========================================================
   CONFIGURATION
========================================================== */

const BASE_URL = (
  import.meta.env.VITE_BASE_URL || "http://localhost:5001"
).replace(/\/+$/, "");

const JAVA_BOOK_REDIRECT_URL = "/book/java-interview-handbook";

// Companion book shown right after the hero (loaded from the backend).
const SPRING_BOOK_REDIRECT_URL = "/book/springboot-interview-handbook";

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";

// Title <= 60 chars, description <= 160 chars.
const SEO_TITLE = "100 Java Interview Questions & Answers (PDF) | Target Trek";

const SEO_DESCRIPTION =
  "Java interview handbook with 100 questions & answers: Core Java, OOP, Collections, Streams, JVM, multithreading and modern Java 17/21. Digital PDF ebook.";

const SEO_LONG_DESCRIPTION =
  "Prepare for Java interviews with 100 curated questions covering Core Java, OOP, Collections, Streams, JVM, Multithreading, Concurrency, and Modern Java.";

const SEO_KEYWORDS =
  "java interview questions, java interview questions and answers, java interview book, java handbook pdf, core java interview, collections interview questions, hashmap internal working, multithreading interview questions, jvm interview questions, java 8 stream interview questions, java 17 java 21 interview";

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
   EXTRA CONTENT (SEO + engagement)
========================================================== */

const EASE = [0.22, 1, 0.36, 1];

const ctaPrimary =
  "tt-shimmer group relative inline-flex min-h-[50px] items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 px-6 text-sm font-extrabold text-white shadow-xl shadow-orange-500/25 transition hover:-translate-y-0.5 hover:shadow-orange-500/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:cursor-not-allowed disabled:opacity-60";

const NAV_LINKS = [
  ["#springboot-book", "Spring Boot book"],
  ["#why-java-handbook", "Why this book"],
  ["#output-quiz", "Output quiz"],
  ["#java-syllabus", "Syllabus"],
  ["#java-preview", "Sample Q&A"],
  ["#java-code", "Code"],
  ["#java-pricing", "Pricing"],
  ["#java-faq", "FAQ"],
];

const MARQUEE_TERMS = [
  "Core Java",
  "OOP",
  "HashMap internals",
  "Collections",
  "Stream API",
  "Lambdas",
  "Multithreading",
  "Concurrency",
  "JVM",
  "Garbage Collection",
  "Java 17",
  "Java 21",
  "Virtual Threads",
  "Records",
  "Sealed Classes",
  "Generics",
];

const OUTPUT_QUIZ = [
  {
    code: `String a = "java";
String b = new String("java");
System.out.println(a == b);
System.out.println(a.equals(b));`,
    options: ["true true", "false true", "true false", "false false"],
    answer: 1,
    explain:
      "The literal \"java\" lives in the String constant pool, while new String(...) creates a separate heap object. == compares references (false); equals() compares content (true).",
  },
  {
    code: `Integer a = 127, b = 127;
Integer c = 128, d = 128;
System.out.println((a == b) + " " + (c == d));`,
    options: ["true true", "true false", "false false", "false true"],
    answer: 1,
    explain:
      "Integer.valueOf() caches values from -128 to 127, so a and b are the same object. 128 is outside the cache, so c and d are different objects and == is false.",
  },
  {
    code: `List<Integer> list = new ArrayList<>(List.of(1, 2, 3));
for (Integer n : list) {
    if (n == 2) list.remove(n);
}
System.out.println(list);`,
    options: [
      "[1, 3]",
      "ConcurrentModificationException",
      "[1, 2, 3]",
      "[1, 2]",
    ],
    answer: 0,
    explain:
      "Removing the second-last element leaves the iterator's cursor equal to size, so hasNext() returns false and the fail-fast check never runs. Remove any other element and you would get a ConcurrentModificationException.",
  },
];

const PAIN_POINTS = [
  {
    before: "Reading random blog posts for every Java topic",
    after: "100 curated questions in one structured handbook",
  },
  {
    before: "Memorising definitions you cannot explain",
    after: "Answers with internals, examples and follow-ups",
  },
  {
    before: "Freezing on output and tricky-behaviour questions",
    after: "Code-output chapters that train you to trace Java",
  },
  {
    before: "Skipping concurrency and JVM because they feel hard",
    after: "Dedicated chapters on threads, locks, GC and memory",
  },
];

const EXTRA_FAQS = [
  {
    question: "Which Java topics are covered in these 100 interview questions?",
    answer:
      "Core Java, OOP, Strings, the Collections Framework (including HashMap internals), exception handling and generics, Java 8 Streams, multithreading and concurrency, JVM and garbage collection, modern Java features (records, sealed classes, virtual threads), coding/output questions and real-world scenarios.",
  },
  {
    question: "Is there a Spring Boot interview book as well?",
    answer:
      "Yes. Target Trek also has a Spring Boot Interview Handbook with 100 questions across 10 chapters — REST APIs, Spring Data JPA, security, microservices, Redis/Kafka and real-world backend scenarios. It is linked right below the hero on this page.",
  },
];

/* ==========================================================
   ANIMATION HELPERS
========================================================== */

function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
  as = "div",
  ...rest
}) {
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
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    mass: 0.3,
  });

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[120] h-[3px] origin-left bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"
      style={{ scaleX }}
    />
  );
}

function TiltBook({ children }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), {
    stiffness: 150,
    damping: 18,
  });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), {
    stiffness: 150,
    damping: 18,
  });

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

function Section({ id, alt = false, isDarkMode, children, narrow = false, label }) {
  return (
    <section
      id={id}
      aria-labelledby={label}
      className={cx(
        "scroll-mt-28 py-16 sm:py-20 lg:py-24",
        alt && "border-y",
        alt &&
          (isDarkMode
            ? "border-white/10 bg-[#17191e]"
            : "border-orange-100 bg-[#fffaf6]")
      )}
    >
      <div
        className={cx(
          "mx-auto px-4 sm:px-6 lg:px-8",
          narrow ? "max-w-5xl" : "max-w-7xl"
        )}
      >
        {children}
      </div>
    </section>
  );
}

/* ==========================================================
   REUSABLE SECTION HEADING
========================================================== */

function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  isDarkMode = false,
  id,
}) {
  return (
    <Reveal className={cx("max-w-3xl", center && "mx-auto text-center")}>
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.19em] text-orange-600 dark:text-orange-400">
        {eyebrow}
      </p>

      <h2
        id={id}
        className={cx(
          "text-3xl font-extrabold leading-[1.15] tracking-tight",
          "sm:text-4xl lg:text-[43px]",
          isDarkMode ? "text-white" : "text-slate-950"
        )}
      >
        {title}
      </h2>

      {description && (
        <p
          className={cx(
            "mt-4 text-sm leading-7 sm:text-base",
            isDarkMode ? "text-slate-400" : "text-slate-600"
          )}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}

/* ==========================================================
   OUTPUT QUIZ (interactive)
========================================================== */

function OutputQuiz({ isDarkMode, cardBg, mutedText, mainText }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const quiz = OUTPUT_QUIZ[index];
  const answered = picked !== null;

  const choose = (optionIndex) => {
    if (answered) return;
    setPicked(optionIndex);
    if (optionIndex === quiz.answer) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= OUTPUT_QUIZ.length) {
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
    <div className={cx("mx-auto mt-12 max-w-4xl rounded-3xl border p-5 shadow-sm sm:p-8", cardBg)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-orange-600">
          <Terminal size={16} /> Guess the output
        </span>
        <span className={cx("text-xs font-bold", mutedText)}>
          {done ? "Finished" : `Question ${index + 1} of ${OUTPUT_QUIZ.length}`} · Score {score}
        </span>
      </div>

      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {OUTPUT_QUIZ.map((item, i) => (
          <span
            key={item.code}
            className={cx(
              "h-1.5 flex-1 rounded-full transition-colors duration-500",
              i < index || done ? "bg-orange-500" : i === index ? "bg-orange-300" : isDarkMode ? "bg-white/10" : "bg-slate-200"
            )}
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
            className="py-10 text-center"
          >
            <Trophy className="mx-auto text-orange-500" size={44} />
            <h3 className={cx("mt-4 text-2xl font-black", mainText)}>
              You scored {score} / {OUTPUT_QUIZ.length}
            </h3>
            <p className={cx("mx-auto mt-2 max-w-md text-sm leading-7", mutedText)}>
              The handbook has dedicated chapters on code-output questions, Collections internals and tricky Java behaviour — exactly this style of problem.
            </p>
            <button
              type="button"
              onClick={restart}
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-orange-300 px-5 py-2.5 text-xs font-extrabold text-orange-600 transition hover:bg-orange-50"
            >
              <RefreshCcw size={15} /> Try again
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
            <pre className="mt-6 overflow-x-auto rounded-2xl border border-slate-700 bg-[#151922] p-5 text-[12px] leading-7 text-slate-200 sm:text-[13px]">
              <code>{quiz.code}</code>
            </pre>

            <div className="mt-5 grid gap-3 sm:grid-cols-2" role="group" aria-label="Answer options">
              {quiz.options.map((option, optionIndex) => {
                const isRight = optionIndex === quiz.answer;
                const isPicked = optionIndex === picked;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => choose(optionIndex)}
                    disabled={answered}
                    className={cx(
                      "flex items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-bold transition",
                      !answered && "hover:-translate-y-0.5 hover:border-orange-400",
                      answered && isRight && "border-green-500 bg-green-500/10 text-green-600",
                      answered && isPicked && !isRight && "border-red-400 bg-red-500/10 text-red-500",
                      answered && !isRight && !isPicked && "opacity-50",
                      !answered && mainText,
                      !answered && (isDarkMode ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-white")
                    )}
                  >
                    <code className="font-mono text-[13px]">{option}</code>
                    {answered && isRight && <CheckCircle2 size={18} />}
                    {answered && isPicked && !isRight && <XCircle size={18} />}
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
                  <div className={cx("mt-5 rounded-xl border-l-[3px] border-orange-500 p-4", isDarkMode ? "bg-orange-500/10" : "bg-orange-50")}>
                    <p className="text-[11px] font-black uppercase tracking-wider text-orange-600">
                      {picked === quiz.answer ? "Correct" : "Not quite"} — why?
                    </p>
                    <p className={cx("mt-2 text-sm leading-7", mainText)}>{quiz.explain}</p>
                  </div>
                  <button
                    type="button"
                    onClick={next}
                    className={cx(ctaPrimary, "mt-5 min-h-[46px] text-xs")}
                  >
                    {index + 1 >= OUTPUT_QUIZ.length ? "See my score" : "Next question"}
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

/* ==========================================================
   SPRING BOOT COMPANION CARD (backend driven)
========================================================== */

function SpringBootBookCard({
  isDarkMode,
  product,
  loading,
  error,
  onBuy,
  onRetry,
  cardBg,
  mutedText,
  mainText,
}) {
  const price = Number(product?.price);
  const mrpValue = Number(product?.mrp || 0);
  const currencyCode = product?.currency || "INR";
  const hasPrice = Number.isFinite(price) && price >= 0 && Boolean(product);
  const savings = hasPrice && mrpValue > price ? Math.round(((mrpValue - price) / mrpValue) * 100) : 0;

  const cover =
    product?.coverpageurl || product?.coverPageUrl || product?.cover_page_url || "";

  const title = product?.title || "Spring Boot Interview Handbook — 100 Questions";

  const description =
    product?.shortDescription ||
    "100 Spring Boot interview questions across 10 chapters — IoC and dependency injection, REST APIs, Spring Data JPA, security, microservices, Redis, Kafka and real-world backend scenarios.";

  const features = [
    "100 questions · 10 chapters",
    "REST APIs, JPA & Hibernate",
    "Security, JWT & OAuth2",
    "Microservices, Redis & Kafka",
  ];

  const canBuy = Boolean(product?._id) && hasPrice && !loading;

  return (
    <Reveal
      as="article"
      className={cx(
        "relative overflow-hidden rounded-[28px] border shadow-[0_18px_60px_rgba(154,52,18,0.12)]",
        isDarkMode ? "border-orange-400/25 bg-[#1b1613]" : "border-orange-200 bg-white"
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600" />

      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl tt-orb" aria-hidden="true" />

      <div className="relative grid gap-6 p-5 sm:grid-cols-[210px_1fr] sm:gap-8 sm:p-8 lg:grid-cols-[250px_1fr]">
        <div className="mx-auto w-full max-w-[200px] sm:max-w-none">
          {loading ? (
            <div className={cx("aspect-[0.72] w-full animate-pulse rounded-2xl", isDarkMode ? "bg-white/10" : "bg-orange-100")} />
          ) : cover ? (
            <motion.img
              whileHover={{ rotate: -2, scale: 1.04 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              src={cover}
              alt={`${title} ebook cover`}
              loading="lazy"
              decoding="async"
              className="w-full rounded-2xl object-contain shadow-[14px_20px_40px_rgba(0,0,0,0.22)] ring-1 ring-black/5"
            />
          ) : (
            <motion.div
              whileHover={{ rotate: -2, scale: 1.04 }}
              className="relative flex aspect-[0.72] w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-700 to-slate-900 p-5 text-white shadow-[14px_20px_40px_rgba(0,0,0,0.22)]"
            >
              <span className="text-[10px] font-black tracking-[0.2em]">TARGET TREK</span>
              <div>
                <Server size={34} className="mb-3 text-white/80" />
                <p className="text-2xl font-black leading-tight">
                  SPRING BOOT
                  <br />
                  INTERVIEW
                  <br />
                  HANDBOOK
                </p>
                <p className="mt-3 text-sm font-bold text-emerald-100">100 Questions</p>
              </div>
            </motion.div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-orange-600">
              Next in the series
            </span>
            <span className={cx("rounded-full border px-3 py-1 text-[10px] font-bold", isDarkMode ? "border-white/10 text-slate-300" : "border-slate-200 text-slate-600")}>
              Digital PDF ebook
            </span>
            {savings > 0 && (
              <span className="rounded-full bg-green-500/10 px-3 py-1 text-[10px] font-extrabold text-green-600">
                {savings}% OFF
              </span>
            )}
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              <div className={cx("h-7 w-4/5 animate-pulse rounded-lg", isDarkMode ? "bg-white/10" : "bg-orange-100")} />
              <div className={cx("h-4 w-full animate-pulse rounded", isDarkMode ? "bg-white/10" : "bg-orange-50")} />
              <div className={cx("h-4 w-2/3 animate-pulse rounded", isDarkMode ? "bg-white/10" : "bg-orange-50")} />
            </div>
          ) : (
            <>
              <h3 className={cx("mt-4 text-2xl font-black leading-tight tracking-tight sm:text-3xl", mainText)}>
                {title}
              </h3>
              <p className={cx("mt-3 text-sm leading-7", mutedText)}>{description}</p>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className={cx("flex items-center gap-2 text-xs font-bold", mainText)}>
                    <CheckCircle2 size={16} className="shrink-0 text-orange-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className={cx("mt-6 flex flex-wrap items-end gap-x-6 gap-y-4 border-t pt-5", isDarkMode ? "border-white/10" : "border-slate-200")}>
            <div>
              {loading ? (
                <div className={cx("h-9 w-28 animate-pulse rounded-lg", isDarkMode ? "bg-white/10" : "bg-orange-100")} />
              ) : hasPrice ? (
                <div className="flex items-end gap-2">
                  <span className={cx("text-3xl font-black tracking-tight", mainText)}>
                    {formatMoney(price, currencyCode)}
                  </span>
                  {mrpValue > price && (
                    <span className={cx("pb-1 text-sm line-through", mutedText)}>
                      {formatMoney(mrpValue, currencyCode)}
                    </span>
                  )}
                </div>
              ) : (
                <span className={cx("text-sm font-semibold", mutedText)}>
                  {error ? "Price unavailable right now" : "See details for pricing"}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-wrap gap-3 sm:justify-end">
              {canBuy && (
                <button type="button" onClick={onBuy} className={ctaPrimary}>
                  <LockKeyhole size={16} />
                  Buy Spring Boot book
                  <ArrowRight size={16} className="transition group-hover:translate-x-1" />
                </button>
              )}

              <a
                href={SPRING_BOOK_REDIRECT_URL}
                className={cx(
                  "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-xl border px-5 text-sm font-extrabold transition hover:-translate-y-0.5 hover:border-orange-500 hover:text-orange-500",
                  cardBg,
                  mainText
                )}
              >
                Explore the book
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          {error && !loading && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 text-xs font-extrabold text-orange-600 underline"
            >
              <RefreshCcw size={14} /> Reload price
            </button>
          )}
        </div>
      </div>
    </Reveal>
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
  const reduce = useReducedMotion();

  /* THEME */
  const [theme, setTheme] = useState(getStoredTheme);
  const isDarkMode = theme === "dark";

  /* BACKEND PRODUCT — Java */
  const [product, setProduct] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState("");
  const [productReloadKey, setProductReloadKey] = useState(0);

  /* BACKEND PRODUCT — Spring Boot companion book */
  const [springProduct, setSpringProduct] = useState(null);
  const [loadingSpring, setLoadingSpring] = useState(true);
  const [springError, setSpringError] = useState("");
  const [springReloadKey, setSpringReloadKey] = useState(0);

  /* CHECKOUT */
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  /* CHAPTERS */
  const [expandedChapters, setExpandedChapters] = useState(getStoredChapters);
  const [searchQuery, setSearchQuery] = useState(() => safeGet(STORAGE_KEYS.search, ""));
  const [levelFilter, setLevelFilter] = useState(() => {
    const stored = safeGet(STORAGE_KEYS.level, "All");
    return ["All", "Beginner", "Intermediate", "Advanced"].includes(stored) ? stored : "All";
  });

  /* SAMPLES + FAQ */
  const [activeSample, setActiveSample] = useState(1);
  const [openFaq, setOpenFaq] = useState(0);

  /* STICKY CARD VISIBILITY */
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

  /* THEME SYNC WITH EXISTING TARGET TREK NAVBAR */
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    let lastStorageTheme = readThemeFromStorage();
    let lastDomTheme = readThemeFromDom();

    const commitTheme = (nextTheme) => {
      if (!nextTheme) return;
      setTheme((current) => (current === nextTheme ? current : nextTheme));
    };

    const syncTheme = () => {
      const storageTheme = readThemeFromStorage();
      const domTheme = readThemeFromDom();

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
          (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light")
      );
    };

    const onStorage = (event) => {
      if (!event.key || event.key === THEME_STORAGE_KEY) syncTheme();
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") syncTheme();
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

    const media = window.matchMedia?.("(prefers-color-scheme: dark)");

    syncTheme();

    // Supports navbar theme changes that write to localStorage
    // without dispatching a custom event.
    const intervalId = window.setInterval(syncTheme, 1000);

    window.addEventListener("storage", onStorage);
    window.addEventListener("themechange", syncTheme);
    window.addEventListener("tt-theme-change", syncTheme);
    window.addEventListener("focus", syncTheme);
    document.addEventListener("visibilitychange", onVisibility);
    media?.addEventListener?.("change", syncTheme);

    return () => {
      observer.disconnect();
      window.clearInterval(intervalId);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("tt-theme-change", syncTheme);
      window.removeEventListener("focus", syncTheme);
      document.removeEventListener("visibilitychange", onVisibility);
      media?.removeEventListener?.("change", syncTheme);
    };
  }, []);

  /* REFERRAL CODE - SAME AS HLD */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const referralCode = (params.get("referralCode") || params.get("ref") || "").trim();

    if (referralCode) safeSet("referralCode", referralCode);
  }, []);

  /* PRODUCT API — Java handbook (unchanged request + validation) */
  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoadingProduct(true);
        setProductError("");

        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(JAVA_BOOK_REDIRECT_URL)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !result?.data) {
          throw new Error(result?.error?.message || "Java Interview Handbook not found.");
        }

        const loadedProduct = result.data;
        const loadedPrice = Number(loadedProduct?.price);

        if (!Number.isFinite(loadedPrice) || loadedPrice <= 0) {
          throw new Error("The product does not have a valid selling price.");
        }

        setProduct(loadedProduct);
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Failed to fetch Java Interview Handbook:", error);
        setProduct(null);
        setProductError(error?.message || "Unable to load this ebook.");
      } finally {
        if (!controller.signal.aborted) setLoadingProduct(false);
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, [productReloadKey]);

  /* PRODUCT API — Spring Boot Interview Handbook (same endpoint, other redirectUrl) */
  useEffect(() => {
    const controller = new AbortController();

    const fetchSpringProduct = async () => {
      try {
        setLoadingSpring(true);
        setSpringError("");

        const response = await fetch(
          `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(SPRING_BOOK_REDIRECT_URL)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        const result = await response.json().catch(() => null);
        const data = result?.data;

        if (
          !response.ok ||
          !result?.success ||
          !data?._id ||
          !Number.isFinite(Number(data.price)) ||
          Number(data.price) < 0 ||
          data.active === false ||
          data.isActive === false ||
          data.isDeleted === true
        ) {
          throw new Error(result?.error?.message || "Spring Boot handbook details are unavailable.");
        }

        setSpringProduct(data);
      } catch (error) {
        if (error?.name === "AbortError") return;

        console.error("Failed to fetch Spring Boot handbook:", error);
        setSpringProduct(null);
        setSpringError(error?.message || "Spring Boot handbook details are unavailable.");
      } finally {
        if (!controller.signal.aborted) setLoadingSpring(false);
      }
    };

    fetchSpringProduct();

    return () => controller.abort();
  }, [springReloadKey]);

  /* LOCAL STORAGE PERSISTENCE */
  useEffect(() => {
    safeSet(STORAGE_KEYS.chapters, JSON.stringify(expandedChapters));
  }, [expandedChapters]);

  useEffect(() => {
    safeSet(STORAGE_KEYS.search, searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    safeSet(STORAGE_KEYS.level, levelFilter);
  }, [levelFilter]);

  /* PRODUCT DETAILS */
  const currentPrice = Number(product?.price ?? 0);
  const mrp = Number(product?.mrp ?? 0);
  const currency = product?.currency || "INR";
  const hasValidPrice = Number.isFinite(currentPrice) && currentPrice > 0;

  const discount =
    mrp > currentPrice && currentPrice >= 0
      ? Math.round(((mrp - currentPrice) / mrp) * 100)
      : 0;

  const bookCover =
    product?.coverpageurl || product?.coverPageUrl || product?.cover_page_url || "";

  const productName = product?.title || "Master Java Interviews — Top 100 Questions";

  const formattedPrice = hasValidPrice ? formatMoney(currentPrice, currency) : "—";
  const formattedMrp = mrp > currentPrice && hasValidPrice ? formatMoney(mrp, currency) : null;
  const savingsAmount = mrp > currentPrice && hasValidPrice ? formatMoney(mrp - currentPrice, currency) : null;

  const canBuy = !loadingProduct && !productError && Boolean(product) && hasValidPrice;

  const canonicalUrl = `${SITE_URL}${JAVA_BOOK_REDIRECT_URL}`;

  /* META PIXEL — once per loaded product (same pattern as HLD page) */
  const trackedContentRef = useRef(null);

  useEffect(() => {
    if (!product?._id || !hasValidPrice) return;

    const key = `${product._id}:${currentPrice}:${currency}`;
    if (trackedContentRef.current === key) return;

    const sent = trackViewContent({
      id: String(product._id),
      title: product.title || "Java Interview Handbook",
      price: currentPrice,
      currency,
    });

    if (sent !== false) trackedContentRef.current = key;
  }, [product, hasValidPrice, currentPrice, currency]);

  /* BUY NOW */
  const handleBuyNow = useCallback(() => {
    if (!product || loadingProduct || productError || !hasValidPrice) return;

    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  }, [product, loadingProduct, productError, hasValidPrice]);

  const handleSpringBuyNow = useCallback(() => {
    if (!springProduct?._id) return;

    setCheckoutProduct(springProduct);
    setIsCheckoutOpen(true);
  }, [springProduct]);

  const closeCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    setCheckoutProduct(null);
  }, []);

  const handleRetry = () => setProductReloadKey((prev) => prev + 1);
  const handleSpringRetry = () => setSpringReloadKey((prev) => prev + 1);

  /* CHAPTER FILTERS */
  const filteredChapters = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return CHAPTERS.filter((chapter) => {
      const matchesLevel = levelFilter === "All" || chapter.level === levelFilter;

      const searchable = [chapter.title, chapter.description, chapter.range, chapter.level, ...chapter.topics]
        .join(" ")
        .toLowerCase();

      return matchesLevel && (!query || searchable.includes(query));
    });
  }, [searchQuery, levelFilter]);

  const toggleChapter = (id) => {
    setExpandedChapters((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const expandAll = () => setExpandedChapters(CHAPTERS.map((chapter) => chapter.id));
  const collapseAll = () => setExpandedChapters([]);
  const allExpanded = expandedChapters.length === CHAPTERS.length;

  const selectedSample =
    SAMPLE_QUESTIONS.find((item) => item.id === activeSample) || SAMPLE_QUESTIONS[0];

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const allFaqs = useMemo(() => [...FAQS, ...EXTRA_FAQS], []);

  /* STRUCTURED DATA */
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
            { "@type": "ListItem", position: 3, name: "Java Interview Handbook", item: canonicalUrl },
          ],
        },
        {
          "@type": ["Product", "Book"],
          "@id": `${canonicalUrl}#product`,
          name: productName,
          description: SEO_LONG_DESCRIPTION,
          url: canonicalUrl,
          category: "Java Interview Preparation Ebook",
          keywords: SEO_KEYWORDS,
          inLanguage: "en",
          bookFormat: "https://schema.org/EBook",
          genre: "Computer science, Java, interview preparation",
          audience: {
            "@type": "Audience",
            audienceType: "Java developers preparing for technical interviews",
          },
          brand: { "@type": "Brand", name: SITE_NAME },
          author: { "@id": `${SITE_URL}/#organization` },
          publisher: { "@id": `${SITE_URL}/#organization` },
          isAccessibleForFree: false,
          ...(product?._id ? { sku: String(product._id) } : {}),
          ...(bookCover ? { image: [bookCover] } : {}),
          ...(canBuy
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
                  seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
                },
              }
            : {}),
        },
        {
          "@type": "ItemList",
          "@id": `${canonicalUrl}#chapters`,
          name: "Chapters in the Java Interview Handbook",
          numberOfItems: CHAPTERS.length,
          itemListElement: CHAPTERS.map((chapter, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: `${chapter.title} (${chapter.range})`,
            description: chapter.description,
          })),
        },
        {
          "@type": "FAQPage",
          "@id": `${canonicalUrl}#faq`,
          mainEntity: allFaqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        },
      ],
    };
  }, [allFaqs, bookCover, canBuy, canonicalUrl, currency, currentPrice, product?._id, productName]);

  /* THEME CLASSES */
  const pageBg = isDarkMode ? "bg-[#101114] text-white" : "bg-white text-slate-950";
  const sectionBg = isDarkMode ? "bg-[#17191e]" : "bg-[#fffaf6]";
  const cardBg = isDarkMode ? "bg-[#1d2026] border-white/10" : "bg-white border-slate-200";
  const mutedText = isDarkMode ? "text-slate-400" : "text-slate-600";
  const mainText = isDarkMode ? "text-white" : "text-slate-950";
  const subtleBorder = isDarkMode ? "border-white/10" : "border-slate-200";

  const buyLabel = loadingProduct ? (
    <>
      <Loader2 size={18} className="animate-spin" />
      Loading...
    </>
  ) : !canBuy ? (
    <>
      <RefreshCcw size={17} />
      Currently unavailable
    </>
  ) : (
    <>
      <LockKeyhole size={18} />
      Buy Now — {formattedPrice}
      <ArrowRight size={18} className="transition group-hover:translate-x-1" />
    </>
  );

  /* ========================================================
     MAIN JSX
  ======================================================== */

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
        <meta name="theme-color" content={isDarkMode ? "#101114" : "#fff7ed"} />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="en-IN" href={canonicalUrl} />
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
        {bookCover && <link rel="preload" as="image" href={bookCover} />}

        <meta property="og:type" content="product" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={canonicalUrl} />
        {canBuy && <meta property="product:price:amount" content={String(currentPrice)} />}
        {canBuy && <meta property="product:price:currency" content={currency} />}
        {bookCover && <meta property="og:image" content={bookCover} />}
        {bookCover && <meta property="og:image:alt" content={`${productName} ebook cover`} />}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        {bookCover && <meta name="twitter:image" content={bookCover} />}

        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <style>{`
        @media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }

        .tt-gradient-text { background-size: 200% auto; animation: tt-gradient 6s linear infinite; }
        @keyframes tt-gradient { to { background-position: 200% center; } }

        .tt-orb { animation: tt-float 12s ease-in-out infinite; }
        .tt-orb-2 { animation-duration: 16s; animation-delay: -4s; }
        @keyframes tt-float {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(24px,-30px,0) scale(1.08); }
        }

        .tt-shimmer::after {
          content: ""; position: absolute; inset: 0; transform: translateX(-120%);
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.35) 50%, transparent 70%);
          animation: tt-sheen 3.4s ease-in-out infinite; pointer-events: none;
        }
        @keyframes tt-sheen { 0%, 55% { transform: translateX(-120%); } 100% { transform: translateX(120%); } }

        .tt-pulse { animation: tt-pulse 2.4s ease-out infinite; }
        @media (min-width: 768px) { .md-tt-no-pulse { animation: none; } }
        @keyframes tt-pulse {
          0% { box-shadow: 0 0 0 0 rgba(249,115,22,.45); }
          70%, 100% { box-shadow: 0 0 0 14px rgba(249,115,22,0); }
        }

        .tt-marquee { display: flex; width: max-content; animation: tt-marquee 40s linear infinite; }
        .tt-marquee-wrap:hover .tt-marquee { animation-play-state: paused; }
        @keyframes tt-marquee { to { transform: translateX(-50%); } }

        .tt-cursor { animation: tt-blink 1s steps(2, start) infinite; }
        @keyframes tt-blink { to { visibility: hidden; } }

        @media (prefers-reduced-motion: reduce) {
          .tt-gradient-text, .tt-orb, .tt-shimmer::after, .tt-pulse, .tt-marquee, .tt-cursor { animation: none !important; }
          .tt-marquee { flex-wrap: wrap; width: auto; }
        }
      `}</style>

      <ScrollProgress />

      <main
        data-theme={theme}
        className={cx(
          "mt-16 min-h-screen w-full overflow-x-clip pb-28",
          "font-['Inter',sans-serif]",
          "transition-colors duration-300",
          pageBg
        )}
      >
        {/* ================================================
            ON-PAGE NAVIGATION (internal links for SEO + UX)
        ================================================ */}
        <nav
          aria-label="On this page"
          className={cx(
            "sticky top-16 z-40 border-b backdrop-blur-xl",
            isDarkMode ? "border-white/10 bg-[#101114]/85" : "border-orange-100 bg-white/85"
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

        {/* ================================================
            HERO SECTION
        ================================================ */}

        <section
          ref={heroRef}
          aria-labelledby="java-hero-title"
          className={cx(
            "relative overflow-hidden",
            "pt-6 pb-14 sm:pt-10 sm:pb-20 lg:pt-14 lg:pb-24",
            isDarkMode ? "bg-[#101114]" : "bg-gradient-to-br from-white via-white to-orange-50/60"
          )}
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="tt-orb absolute -right-32 top-20 h-[470px] w-[470px] rounded-full bg-orange-400/15 blur-[110px]" />
            <div className="tt-orb tt-orb-2 absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-amber-400/10 blur-[110px]" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb" className={cx("mb-6 text-xs", mutedText)}>
              <ol className="flex flex-wrap items-center gap-2">
                <li><a className="font-semibold hover:text-orange-500" href="/">Home</a></li>
                <li aria-hidden="true">/</li>
                <li><a className="font-semibold hover:text-orange-500" href="/books">Books</a></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className={cx("font-bold", mainText)}>Java Interview Handbook</li>
              </ol>
            </nav>

            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              {/* LEFT CONTENT */}
              <div>
                <Reveal y={14} className="mb-6 flex flex-wrap items-center gap-2">
                  <span
                    className={cx(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
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
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold",
                      cardBg,
                      mutedText
                    )}
                  >
                    <FileText size={13} />
                    Digital PDF Ebook
                  </span>
                </Reveal>

                <Reveal
                  as="h1"
                  delay={0.06}
                  id="java-hero-title"
                  className={cx(
                    "max-w-2xl text-[40px] font-black leading-[1.07] tracking-[-0.05em]",
                    "sm:text-[56px] lg:text-[66px]",
                    mainText
                  )}
                >
                  100 Java Interview
                  <br />
                  Questions{" "}
                  <span className="tt-gradient-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent">
                    & Answers.
                  </span>
                </Reveal>

                <Reveal
                  as="p"
                  delay={0.12}
                  className={cx(
                    "mt-6 max-w-xl text-lg font-semibold leading-8",
                    isDarkMode ? "text-slate-200" : "text-slate-800"
                  )}
                >
                  One practical handbook to revise Core Java, OOP, Collections, Streams,
                  Multithreading, JVM, and modern Java.
                </Reveal>

                <Reveal as="p" delay={0.16} className={cx("mt-4 max-w-xl text-sm leading-7", mutedText)}>
                  Prepare with structured questions, clear explanations, important Java internals,
                  code examples, tricky follow-ups, and real-world interview scenarios.
                </Reveal>

                {/* STATS */}
                <div className="mt-8 grid max-w-md grid-cols-3 gap-4">
                  {[
                    { number: 100, label: "Questions" },
                    { number: 12, label: "Chapters" },
                    { number: 3, label: "Skill Levels" },
                  ].map((item, index) => (
                    <Reveal
                      key={item.label}
                      delay={0.2 + index * 0.08}
                      y={14}
                      className="border-l-[3px] border-orange-500 pl-3"
                    >
                      <p className={cx("text-2xl font-black", mainText)}>
                        <CountUp to={item.number} />
                      </p>
                      <p className={cx("mt-1 text-xs", mutedText)}>{item.label}</p>
                    </Reveal>
                  ))}
                </div>

                {/* HERO PRICING */}
                <Reveal delay={0.3} className={cx("mt-8 border-t pt-6", subtleBorder)}>
                  {loadingProduct ? (
                    <div className="h-10 w-36 animate-pulse rounded-lg bg-orange-100 dark:bg-white/10" />
                  ) : canBuy ? (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={cx("text-[38px] font-black tracking-tight", mainText)}>
                        {formattedPrice}
                      </span>

                      {formattedMrp && (
                        <span className={cx("text-lg line-through", mutedText)}>{formattedMrp}</span>
                      )}

                      {discount > 0 && (
                        <span
                          className={cx(
                            "rounded-md px-2.5 py-1 text-xs font-extrabold",
                            isDarkMode ? "bg-orange-500/15 text-orange-300" : "bg-orange-100 text-orange-700"
                          )}
                        >
                          {discount}% OFF
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className={cx("text-sm font-semibold", mutedText)}>Product price unavailable</p>
                  )}

                  {savingsAmount && (
                    <p className="mt-2 text-xs font-extrabold text-green-600">
                      You save {savingsAmount} today
                    </p>
                  )}

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button type="button" onClick={handleBuyNow} disabled={!canBuy} className={ctaPrimary}>
                      {buyLabel}
                    </button>

                    <button
                      type="button"
                      onClick={() => scrollToSection("java-syllabus")}
                      className={cx(
                        "inline-flex min-h-[50px] items-center justify-center gap-2",
                        "rounded-xl border px-6 text-sm font-extrabold",
                        "transition-all hover:-translate-y-0.5 hover:border-orange-500 hover:text-orange-500",
                        cardBg,
                        mainText
                      )}
                    >
                      Explore Chapters
                      <ArrowUpRight size={17} />
                    </button>
                  </div>

                  <div className={cx("mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold", mutedText)}>
                    <span className="inline-flex items-center gap-1.5"><Download size={15} className="text-orange-500" /> Instant access after payment</span>
                    <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-green-600" /> Secure checkout</span>
                    <span className="inline-flex items-center gap-1.5"><FileText size={15} className="text-orange-500" /> Digital PDF</span>
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
                </Reveal>
              </div>

              {/* RIGHT BOOK COVER */}
              <Reveal delay={0.15} y={36} className="relative flex min-h-[400px] items-center justify-center py-5 sm:min-h-[500px]">
                <div className="absolute h-80 w-80 rounded-full bg-orange-500/15 blur-[75px]" aria-hidden="true" />

                <motion.div
                  initial={reduce ? false : { opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                  className={cx(
                    "absolute right-0 top-6 z-10 hidden items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold shadow-lg sm:flex",
                    cardBg,
                    mainText
                  )}
                >
                  <Code2 size={17} className="text-orange-500" />
                  Core to Advanced Java
                </motion.div>

                <div className="relative z-[2] w-full max-w-[350px]">
                  <TiltBook>
                    {bookCover ? (
                      <div className="relative">
                        <div className="absolute inset-6 bg-orange-500/20 blur-3xl" />
                        <img
                          src={bookCover}
                          alt={`${productName} ebook cover`}
                          loading="eager"
                          decoding="async"
                          fetchPriority="high"
                          className="relative mx-auto max-h-[490px] w-full object-contain drop-shadow-[16px_24px_24px_rgba(0,0,0,0.18)]"
                        />
                      </div>
                    ) : (
                      <JavaBookCover />
                    )}
                  </TiltBook>
                </div>

                <motion.div
                  initial={reduce ? false : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  className={cx(
                    "absolute bottom-4 left-0 z-10 hidden items-center gap-2 rounded-xl border px-4 py-3 text-xs font-bold shadow-lg sm:flex",
                    cardBg,
                    mainText
                  )}
                >
                  <CheckCircle2 size={17} className="text-green-600" />
                  Structured Interview Prep
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================================================
            SPRING BOOT HANDBOOK — RIGHT AFTER THE HERO
            Loaded from /book/product?redirectUrl=/book/springboot-interview-handbook
        ================================================ */}

        <section
          id="springboot-book"
          aria-labelledby="springboot-title"
          className={cx("scroll-mt-28 border-y py-14 sm:py-16", isDarkMode ? "border-white/10 bg-[#15110f]" : "border-orange-100 bg-[#fffaf6]")}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              id="springboot-title"
              eyebrow="Also from Target Trek"
              title="Preparing for backend roles? Get the Spring Boot handbook too."
              description="Java gets you in the door; Spring Boot is what most backend interviews test next. Buy it now or explore the full syllabus first."
              isDarkMode={isDarkMode}
            />

            <div className="mt-8">
              <SpringBootBookCard
                isDarkMode={isDarkMode}
                product={springProduct}
                loading={loadingSpring}
                error={springError}
                onBuy={handleSpringBuyNow}
                onRetry={handleSpringRetry}
                cardBg={cardBg}
                mutedText={mutedText}
                mainText={mainText}
              />
            </div>
          </div>
        </section>

        {/* ================================================
            TOPIC MARQUEE
        ================================================ */}

        <div
          className={cx("tt-marquee-wrap overflow-hidden border-b py-4", isDarkMode ? "border-white/10 bg-[#13151a]" : "border-orange-100 bg-white")}
          aria-label="Java topics covered"
        >
          <div className="tt-marquee">
            {[...MARQUEE_TERMS, ...MARQUEE_TERMS].map((term, index) => (
              <span
                key={`${term}-${index}`}
                aria-hidden={index >= MARQUEE_TERMS.length ? "true" : undefined}
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

        {/* ================================================
            FEATURE STRIP
        ================================================ */}

        <section aria-label="Book features" className={cx("border-b", subtleBorder, sectionBg)}>
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-0 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
            {[
              { icon: FileText, text: "Digital PDF" },
              { icon: Code2, text: "Java Examples" },
              { icon: Target, text: "Interview Focused" },
              { icon: ShieldCheck, text: "Secure Payment" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.text}
                  className={cx(
                    "group flex items-center justify-center gap-3 border-b px-3 py-5 text-xs font-extrabold lg:border-b-0",
                    subtleBorder,
                    mainText
                  )}
                >
                  <Icon size={19} className="text-orange-500 transition group-hover:scale-125" />
                  {item.text}
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================
            WHY THIS HANDBOOK
        ================================================ */}

        <Section id="why-java-handbook" isDarkMode={isDarkMode} label="why-title">
          <SectionHeading
            id="why-title"
            eyebrow="WHY THIS HANDBOOK?"
            title="Learn what actually matters in Java interviews."
            description="A focused revision handbook covering fundamental Java concepts, implementation details, and advanced technical discussions."
            center
            isDarkMode={isDarkMode}
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal
                  key={item.title}
                  delay={index * 0.07}
                  className={cx(
                    "group rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400 hover:shadow-xl",
                    cardBg
                  )}
                >
                  <div
                    className={cx(
                      "mb-6 flex h-12 w-12 items-center justify-center rounded-xl transition duration-300 group-hover:-rotate-6 group-hover:scale-110",
                      isDarkMode ? "bg-orange-500/15" : "bg-orange-50"
                    )}
                  >
                    <Icon size={23} className="text-orange-500" />
                  </div>

                  <h3 className={cx("text-base font-extrabold", mainText)}>{item.title}</h3>
                  <p className={cx("mt-3 text-xs leading-6", mutedText)}>{item.description}</p>
                </Reveal>
              );
            })}
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {PAIN_POINTS.map((item, index) => (
              <Reveal key={item.before} delay={(index % 2) * 0.08} className={cx("rounded-2xl border p-5 sm:p-6", cardBg)}>
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  <p className={cx("text-sm font-semibold leading-6 line-through decoration-rose-400/60", mutedText)}>
                    {item.before}
                  </p>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  <p className={cx("text-sm font-extrabold leading-6", mainText)}>{item.after}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ================================================
            OUTPUT QUIZ
        ================================================ */}

        <Section id="output-quiz" alt isDarkMode={isDarkMode} label="quiz-title">
          <SectionHeading
            id="quiz-title"
            eyebrow="TRY IT YOURSELF"
            title="Can you guess the output? 3 quick Java questions."
            description="Output-based questions are an interview favourite. Pick an answer and see the explanation — the handbook has a whole chapter in this style."
            center
            isDarkMode={isDarkMode}
          />
          <OutputQuiz isDarkMode={isDarkMode} cardBg={cardBg} mutedText={mutedText} mainText={mainText} />
        </Section>

        {/* ================================================
            WHO SHOULD READ
        ================================================ */}

        <Section id="who-for" isDarkMode={isDarkMode} label="who-title">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <SectionHeading
                id="who-title"
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
                ].map((item, index) => (
                  <Reveal key={item} delay={index * 0.05} y={14} className="flex items-start gap-3">
                    <span
                      className={cx(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        isDarkMode ? "bg-orange-500/15" : "bg-orange-100"
                      )}
                    >
                      <Check size={15} className="text-orange-600" />
                    </span>

                    <p className={cx("text-sm font-medium leading-6", mainText)}>{item}</p>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.1} className={cx("rounded-2xl border p-6 shadow-sm sm:p-8", cardBg)}>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-orange-600">Your Learning Roadmap</p>
                <GraduationCap size={23} className="text-orange-500" />
              </div>

              {[
                { number: "01", title: "Build Foundations", description: "Java basics, OOP, Strings" },
                { number: "02", title: "Master Core Concepts", description: "Collections, Generics, Streams" },
                { number: "03", title: "Understand Internals", description: "JVM, Concurrency, Garbage Collection" },
                { number: "04", title: "Practice Interviews", description: "Coding, Scenarios, Tricky Questions" },
              ].map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={reduce ? false : { opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + index * 0.12, duration: 0.45 }}
                  className={cx("flex items-center gap-4 border-t py-5", subtleBorder)}
                >
                  <span
                    className={cx(
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black text-orange-600",
                      isDarkMode ? "bg-orange-500/15" : "bg-orange-50"
                    )}
                  >
                    {step.number}
                  </span>

                  <div className="flex-1">
                    <h3 className={cx("text-sm font-extrabold", mainText)}>{step.title}</h3>
                    <p className={cx("mt-1 text-xs", mutedText)}>{step.description}</p>
                  </div>

                  <CheckCircle2 size={18} className="text-green-600" />
                </motion.div>
              ))}

              <div
                className={cx(
                  "mt-4 flex items-center gap-2 rounded-xl p-4 text-xs font-bold text-orange-600",
                  isDarkMode ? "bg-orange-500/10" : "bg-orange-50"
                )}
              >
                <Sparkles size={16} />
                Structured beginner-to-advanced revision
              </div>
            </Reveal>
          </div>
        </Section>

        {/* ================================================
            FULL SYLLABUS
        ================================================ */}

        <Section id="java-syllabus" alt isDarkMode={isDarkMode} label="syllabus-title">
          <SectionHeading
            id="syllabus-title"
            eyebrow="COMPLETE TABLE OF CONTENTS"
            title="12 chapters. 100 Java interview questions."
            description="Explore the complete syllabus covering Java fundamentals, advanced internals, and real-world interview discussions."
            isDarkMode={isDarkMode}
          />

          {/* QUESTION DISTRIBUTION */}
          <Reveal className={cx("mt-10 rounded-2xl border p-5 sm:p-6", cardBg)}>
            <p className="text-xs font-black uppercase tracking-widest text-orange-600">Where the 100 questions go</p>
            <div className="mt-5 space-y-3">
              {CHAPTERS.map((chapter, index) => (
                <div key={chapter.id} className="flex items-center gap-3">
                  <span className={cx("w-[38%] truncate text-[11px] font-bold sm:w-[30%] sm:text-xs", mainText)}>{chapter.title}</span>
                  <div className={cx("h-2.5 flex-1 overflow-hidden rounded-full", isDarkMode ? "bg-white/10" : "bg-orange-100")}>
                    <motion.div
                      initial={reduce ? false : { width: 0 }}
                      whileInView={{ width: `${(chapter.count / 12) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.05, ease: EASE }}
                      style={reduce ? { width: `${(chapter.count / 12) * 100}%` } : undefined}
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                    />
                  </div>
                  <span className={cx("w-6 text-right text-xs font-black", mutedText)}>{chapter.count}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* SEARCH AND FILTERS */}
          <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className={cx("flex h-12 w-full items-center gap-3 rounded-xl border px-4 lg:max-w-sm", cardBg)}>
              <Search size={18} className="text-orange-500" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search chapters and topics..."
                aria-label="Search chapters and topics"
                className={cx("min-w-0 flex-1 bg-transparent text-sm outline-none", mainText, "placeholder:text-slate-500")}
              />

              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search" className={mutedText}>
                  <X size={17} />
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {["All", "Beginner", "Intermediate", "Advanced"].map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  aria-pressed={levelFilter === level}
                  className={cx(
                    "shrink-0 rounded-lg border px-4 py-2 text-xs font-extrabold transition-all",
                    levelFilter === level
                      ? "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/25"
                      : cx(cardBg, mutedText, "hover:border-orange-400")
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 mt-7 flex items-center justify-between gap-4">
            <p className={cx("text-xs font-semibold", mutedText)}>
              Showing <strong>{filteredChapters.length}</strong> of {CHAPTERS.length} chapters
            </p>

            <button
              type="button"
              onClick={allExpanded ? collapseAll : expandAll}
              className="flex items-center gap-1.5 text-xs font-extrabold text-orange-600"
            >
              {allExpanded ? "Collapse All" : "Expand All"}
              <ChevronDown size={15} className={cx("transition-transform", allExpanded && "rotate-180")} />
            </button>
          </div>

          {/* CHAPTER CARDS — answers stay in the DOM (crawlable) and animate via grid rows */}
          <div className="space-y-3">
            {filteredChapters.map((chapter) => {
              const expanded = expandedChapters.includes(chapter.id);

              return (
                <Reveal
                  key={chapter.id}
                  y={16}
                  className={cx(
                    "overflow-hidden rounded-xl border transition-colors",
                    expanded ? "border-orange-400" : subtleBorder,
                    isDarkMode ? "bg-[#1d2026]" : "bg-white"
                  )}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter.id)}
                      aria-expanded={expanded}
                      aria-controls={`chapter-${chapter.id}`}
                      className={cx(
                        "flex w-full items-center gap-3 px-4 py-5 text-left sm:gap-5 sm:px-6",
                        isDarkMode ? "hover:bg-white/[0.03]" : "hover:bg-orange-50/40"
                      )}
                    >
                      <span
                        className={cx(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-black",
                          isDarkMode ? "bg-orange-500/15 text-orange-400" : "bg-orange-50 text-orange-600"
                        )}
                      >
                        {chapter.number}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className={cx("block text-sm font-extrabold sm:text-base", mainText)}>{chapter.title}</span>
                        <span className={cx("mt-1 block text-[11px] font-normal sm:text-xs", mutedText)}>
                          {chapter.range} · {chapter.count} Questions
                        </span>
                      </span>

                      <span
                        className={cx(
                          "hidden rounded-md px-2.5 py-1 text-[10px] font-extrabold sm:inline-flex",
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
                          "shrink-0 transition-transform duration-300",
                          expanded ? "rotate-180 text-orange-500" : mutedText
                        )}
                      />
                    </button>
                  </h3>

                  <div
                    id={`chapter-${chapter.id}`}
                    role="region"
                    className={cx(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className={cx("border-t px-5 py-6 sm:px-7", subtleBorder)}>
                        <p className={cx("mb-6 text-sm leading-7", mutedText)}>{chapter.description}</p>

                        <ul className="grid gap-4 sm:grid-cols-2">
                          {chapter.topics.map((topic, index) => (
                            <li key={`${chapter.id}-${index}`} className="flex items-start gap-3">
                              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-orange-500" />
                              <span className={cx("text-xs leading-6", mainText)}>{topic}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}

            {filteredChapters.length === 0 && (
              <div className={cx("rounded-2xl border border-dashed p-12 text-center", subtleBorder)}>
                <Search size={32} className="mx-auto text-orange-500" />

                <h3 className={cx("mt-4 text-lg font-extrabold", mainText)}>No matching chapters found</h3>

                <p className={cx("mt-2 text-sm", mutedText)}>Try a different search term or reset your filters.</p>

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
          <Reveal
            className={cx(
              "mt-7 flex flex-col items-start justify-between gap-5 rounded-xl border border-orange-200 p-5 sm:flex-row sm:items-center sm:p-6",
              isDarkMode ? "bg-orange-500/10" : "bg-orange-50"
            )}
          >
            <div className="flex items-start gap-3">
              <BookOpen size={24} className="shrink-0 text-orange-600" />

              <div>
                <h3 className={cx("text-sm font-extrabold", mainText)}>Your complete Java interview roadmap</h3>
                <p className={cx("mt-1 text-xs", mutedText)}>100 questions organized into 12 chapters.</p>
              </div>
            </div>

            <button type="button" onClick={handleBuyNow} disabled={!canBuy} className={cx(ctaPrimary, "min-h-[46px] text-xs")}>
              {buyLabel}
            </button>
          </Reveal>
        </Section>

        {/* ================================================
            SAMPLE QUESTIONS
        ================================================ */}

        <Section id="java-preview" isDarkMode={isDarkMode} label="preview-title">
          <SectionHeading
            id="preview-title"
            eyebrow="A LOOK INSIDE"
            title="Explore sample Java interview questions."
            description="Preview a few questions and explanations before purchasing the complete handbook."
            center
            isDarkMode={isDarkMode}
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-[280px_1fr]">
            <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible" role="tablist" aria-label="Sample questions">
              {SAMPLE_QUESTIONS.map((sample) => (
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeSample === sample.id}
                  key={sample.id}
                  onClick={() => setActiveSample(sample.id)}
                  className={cx(
                    "flex min-w-[170px] items-center gap-3 rounded-xl border p-4 text-left transition-all lg:min-w-0",
                    activeSample === sample.id
                      ? isDarkMode
                        ? "border-orange-500 bg-orange-500/15"
                        : "border-orange-500 bg-orange-50"
                      : cx(cardBg, "hover:border-orange-300")
                  )}
                >
                  <span className="text-xs font-black text-orange-600">0{sample.id}</span>

                  <div>
                    <p className={cx("text-xs font-extrabold", mainText)}>{sample.category}</p>
                    <p className={cx("mt-1 text-[10px]", mutedText)}>{sample.difficulty}</p>
                  </div>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedSample.id}
                role="tabpanel"
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={cx("flex min-h-[380px] flex-col rounded-2xl border p-6 shadow-sm sm:p-9", cardBg)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-black uppercase tracking-widest text-orange-600">Sample Interview Question</span>
                  <span className={cx("text-xs font-semibold", mutedText)}>{selectedSample.difficulty}</span>
                </div>

                <h3 className={cx("mt-7 text-xl font-extrabold leading-snug sm:text-2xl", mainText)}>
                  {selectedSample.question}
                </h3>

                <div className="mt-7 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-green-600">
                  <CheckCircle2 size={17} />
                  Interview Answer
                </div>

                <p className={cx("mt-4 text-sm leading-8", mutedText)}>{selectedSample.answer}</p>

                <div className={cx("mt-7 rounded-xl border-l-[3px] border-orange-500 p-4", isDarkMode ? "bg-orange-500/10" : "bg-orange-50")}>
                  <p className="text-[11px] font-black uppercase tracking-wider text-orange-600">Tricky Follow-up</p>
                  <p className={cx("mt-2 text-sm font-semibold", mainText)}>{selectedSample.followUp}</p>
                </div>

                <div className={cx("mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-6", subtleBorder)}>
                  <span className="flex items-center gap-2 text-xs font-bold text-orange-600">
                    <Sparkles size={16} />
                    Preview Question
                  </span>

                  <span className={cx("text-xs", mutedText)}>100 Questions in the full handbook</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </Section>

        {/* ================================================
            CODE EXAMPLES SECTION
        ================================================ */}

        <Section id="java-code" alt isDarkMode={isDarkMode} label="code-title">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                id="code-title"
                eyebrow="LEARN WITH REAL JAVA CODE"
                title="Understand concepts beyond definitions."
                description="Java interviews often test what code does, why it works, and how different implementations behave."
                isDarkMode={isDarkMode}
              />

              <div className="mt-9 space-y-6">
                {[
                  { icon: FileCode2, title: "Practical Java Examples", description: "Understand the use of important Java APIs and language features." },
                  { icon: Terminal, title: "Output-Based Questions", description: "Prepare to trace Java code and explain unexpected behavior." },
                  { icon: Layers3, title: "Deeper Interview Follow-ups", description: "Learn why an implementation works and what alternatives exist." },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <Reveal key={item.title} delay={index * 0.08} y={16} className="flex items-start gap-4">
                      <div
                        className={cx(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                          isDarkMode ? "bg-orange-500/15" : "bg-orange-50"
                        )}
                      >
                        <Icon size={21} className="text-orange-500" />
                      </div>

                      <div>
                        <h3 className={cx("text-sm font-extrabold", mainText)}>{item.title}</h3>
                        <p className={cx("mt-1 text-xs leading-6", mutedText)}>{item.description}</p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollToSection("java-pricing")}
                className="mt-9 inline-flex items-center gap-2 text-sm font-extrabold text-orange-600 transition-all hover:gap-3"
              >
                Get the Complete Handbook
                <ArrowRight size={18} />
              </button>
            </div>

            <Reveal delay={0.1}>
              <JavaCodePreview />
            </Reveal>
          </div>
        </Section>

        {/* ================================================
            COVERAGE
        ================================================ */}

        <Section id="java-coverage" isDarkMode={isDarkMode} label="coverage-title">
          <SectionHeading
            id="coverage-title"
            eyebrow="COMPLETE COVERAGE"
            title="The Java topics you should know."
            description="From beginner-level language features to advanced performance and concurrency discussions."
            isDarkMode={isDarkMode}
          />

          <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Core Java", topics: ["Java fundamentals", "OOP principles", "Strings and immutability", "Exception handling", "Generics"] },
              { title: "Collections & Java 8", topics: ["HashMap internals", "List, Set, Queue, Map", "Stream API", "Lambda expressions", "Optional and Collectors"] },
              { title: "Advanced Java", topics: ["Multithreading", "Synchronization", "Locks and Executors", "JVM architecture", "Garbage collection"] },
              { title: "Interview Practice", topics: ["Coding questions", "Output puzzles", "Production debugging", "Modern Java", "Tricky follow-ups"] },
            ].map((group, index) => (
              <Reveal
                key={group.title}
                delay={index * 0.07}
                className={cx("rounded-2xl border p-6 transition hover:-translate-y-1 hover:shadow-xl", cardBg)}
              >
                <h3 className={cx("mb-6 text-base font-extrabold", mainText)}>{group.title}</h3>

                <ul className="space-y-4">
                  {group.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2.5">
                      <Check size={16} className="mt-0.5 shrink-0 text-orange-500" />
                      <span className={cx("text-xs leading-6", mutedText)}>{topic}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ================================================
            HOW IT WORKS
        ================================================ */}

        <Section id="how-it-works" alt isDarkMode={isDarkMode} label="how-title">
          <SectionHeading
            id="how-title"
            eyebrow="SIMPLE DIGITAL PURCHASE"
            title="Start preparing in three simple steps."
            center
            isDarkMode={isDarkMode}
          />

          <div className="relative mt-14 grid gap-7 md:grid-cols-3">
            <div
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-14 hidden h-px bg-gradient-to-r from-transparent via-orange-400/60 to-transparent md:block"
            />

            {[
              { number: "01", icon: BookOpen, title: "Choose Your Ebook", description: "Explore the syllabus and select the Java Interview Handbook." },
              { number: "02", icon: CreditCard, title: "Complete Payment", description: "Use the existing Target Trek secure payment checkout." },
              { number: "03", icon: Download, title: "Access Your PDF", description: "Follow the digital download instructions after successful payment." },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <Reveal key={item.number} delay={index * 0.12} className="relative px-4 py-6 text-center">
                  <span className={cx("absolute right-5 top-0 text-4xl font-black", isDarkMode ? "text-white/10" : "text-slate-100")}>
                    {item.number}
                  </span>

                  <motion.div
                    whileHover={reduce ? undefined : { y: -6, rotate: -4 }}
                    className={cx(
                      "relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl",
                      isDarkMode ? "bg-orange-500/15" : "bg-orange-50"
                    )}
                  >
                    <Icon size={26} className="text-orange-500" />
                  </motion.div>

                  <h3 className={cx("text-base font-extrabold", mainText)}>{item.title}</h3>
                  <p className={cx("mx-auto mt-3 max-w-xs text-xs leading-7", mutedText)}>{item.description}</p>
                </Reveal>
              );
            })}
          </div>
        </Section>

        {/* ================================================
            PRICING SECTION
        ================================================ */}

        <Section id="java-pricing" isDarkMode={isDarkMode} label="pricing-title">
          <SectionHeading
            id="pricing-title"
            eyebrow="GET YOUR COPY"
            title="Your Java interview preparation starts here."
            description="One focused digital handbook covering 100 important Java questions."
            center
            isDarkMode={isDarkMode}
          />

          <Reveal
            className={cx(
              "relative mx-auto mt-12 max-w-[480px] overflow-hidden rounded-2xl border border-orange-300 p-6 shadow-2xl shadow-orange-500/10 sm:p-8",
              isDarkMode ? "bg-[#1d2026]" : "bg-white"
            )}
          >
            <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-600">
                <Coffee size={17} />
                Java Interview Series
              </span>

              <span className={cx("rounded-md border px-2.5 py-1 text-[10px] font-extrabold", subtleBorder, mutedText)}>
                DIGITAL EBOOK
              </span>
            </div>

            <h3 className={cx("mt-7 text-2xl font-black leading-snug", mainText)}>
              Master Java Interviews
              <br />
              Top 100 Questions
            </h3>

            <p className={cx("mt-3 text-sm leading-7", mutedText)}>
              Prepare for Java backend interviews with carefully organized explanations, practical examples, and advanced concepts.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {loadingProduct ? (
                <div className="h-11 w-36 animate-pulse rounded-lg bg-orange-100 dark:bg-white/10" />
              ) : canBuy ? (
                <>
                  <strong className={cx("text-[44px] font-black tracking-tight", mainText)}>{formattedPrice}</strong>

                  {formattedMrp && <del className={cx("text-lg", mutedText)}>{formattedMrp}</del>}

                  {discount > 0 && (
                    <span className="rounded-md bg-orange-100 px-2.5 py-1 text-[11px] font-black text-orange-700">
                      {discount}% OFF
                    </span>
                  )}
                </>
              ) : (
                <span className={cx("text-sm", mutedText)}>Price unavailable</span>
              )}
            </div>

            <div className={cx("my-7 border-t", subtleBorder)} />

            <p className={cx("mb-5 text-xs font-black uppercase tracking-wider", mainText)}>What&apos;s Included</p>

            <ul className="space-y-4">
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
              ].map((feature, index) => (
                <motion.li
                  key={feature}
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 size={17} className="shrink-0 text-orange-500" />
                  <span className={cx("text-xs font-semibold", mainText)}>{feature}</span>
                </motion.li>
              ))}
            </ul>

            <div className="mt-9">
              <button type="button" onClick={handleBuyNow} disabled={!canBuy} className={cx(ctaPrimary, "w-full")}>
                {buyLabel}
              </button>
            </div>

            <div className={cx("mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px]", mutedText)}>
              <ShieldCheck size={16} className="text-green-600" />
              Secure Checkout
              <span>·</span>
              <LockKeyhole size={14} />
              Protected Payment
              <span>·</span>
              Non-refundable digital product
            </div>

            {productError && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-xs text-red-700">
                <p>{productError}</p>

                <button type="button" onClick={handleRetry} className="mt-3 font-extrabold underline">
                  Retry Product Loading
                </button>
              </div>
            )}
          </Reveal>
        </Section>

        {/* ================================================
            FAQ
        ================================================ */}

        <Section id="java-faq" alt isDarkMode={isDarkMode} label="faq-title">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <SectionHeading
                id="faq-title"
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

            <div className={cx("border-t", subtleBorder)}>
              {allFaqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div key={faq.question} className={cx("border-b", subtleBorder)}>
                    <h3>
                      <button
                        type="button"
                        id={`java-faq-q-${index}`}
                        aria-expanded={isOpen}
                        aria-controls={`java-faq-a-${index}`}
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                        className={cx("flex w-full items-center justify-between gap-5 py-5 text-left text-sm font-extrabold", mainText)}
                      >
                        <span>{faq.question}</span>

                        <ChevronDown
                          size={19}
                          className={cx("shrink-0 transition-transform duration-300", isOpen ? "rotate-180 text-orange-500" : mutedText)}
                        />
                      </button>
                    </h3>

                    <div
                      id={`java-faq-a-${index}`}
                      role="region"
                      aria-labelledby={`java-faq-q-${index}`}
                      className={cx(
                        "grid transition-[grid-template-rows] duration-300 ease-out",
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      )}
                    >
                      <div className="overflow-hidden">
                        <p className={cx("pb-6 pr-6 text-sm leading-7", mutedText)}>{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ================================================
            FINAL CTA
        ================================================ */}

        <section aria-labelledby="java-final-cta" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-orange-800 via-orange-600 to-amber-500 px-7 py-12 text-white sm:px-12 sm:py-16 lg:px-16">
            <div className="tt-orb absolute -right-32 top-0 h-96 w-96 rounded-full border border-white/20" aria-hidden="true" />
            <div className="tt-orb tt-orb-2 absolute -right-10 bottom-0 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />

            <div className="relative z-10 max-w-2xl">
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-orange-100">
                <Rocket size={15} />
                Target Trek Interview Series
              </p>

              <h2 id="java-final-cta" className="mt-6 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Prepare with clarity.
                <br />
                <span className="text-orange-100">Interview with confidence.</span>
              </h2>

              <p className="mt-6 max-w-xl text-sm leading-8 text-orange-50">
                Strengthen your understanding of Java fundamentals, JVM internals, multithreading, modern features, and real-world interview scenarios.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={!canBuy}
                  className="tt-shimmer relative inline-flex min-h-[54px] items-center justify-center gap-3 overflow-hidden rounded-xl bg-white px-7 text-sm font-black text-orange-700 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loadingProduct ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
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

                <a
                  href={SPRING_BOOK_REDIRECT_URL}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-50 underline-offset-4 hover:underline"
                >
                  Also see the Spring Boot handbook
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>

            <Coffee
              size={200}
              strokeWidth={1}
              className="pointer-events-none absolute -bottom-10 right-6 hidden rotate-[-12deg] text-white/10 lg:block"
            />
          </Reveal>
        </section>

        <footer className={cx("border-t px-4 py-8 text-center text-xs leading-6", subtleBorder, mutedText)}>
          <p>Java Interview Handbook • 100 questions & answers • Digital PDF ebook • Non-refundable digital product</p>
          <p className="mt-1">
            Support:{" "}
            <a className="font-bold transition hover:text-orange-500" href="mailto:supporttargettrek@gmail.com">
              supporttargettrek@gmail.com
            </a>
          </p>
          <p className="mt-3 space-x-3">
            <a className="font-semibold transition hover:text-orange-500" href={SPRING_BOOK_REDIRECT_URL}>Spring Boot Interview Handbook</a>
            <a className="font-semibold transition hover:text-orange-500" href="/book/system-design/hld">System Design HLD</a>
            <a className="font-semibold transition hover:text-orange-500" href="/books">All books</a>
          </p>
        </footer>
      </main>

      {/* ==================================================
          RESPONSIVE STICKY BUY CARD
          mobile: docked strip · tablet: centered card ·
          desktop: wider card (appears after the hero on md+)
      ================================================== */}
      <div
        className={cx(
          "pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center px-2.5 pb-[max(10px,env(safe-area-inset-bottom))] transition-all duration-300 sm:px-4 md:pb-5",
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
            isDarkMode ? "border-white/10 bg-[#1d2026]/95" : "border-orange-200 bg-white/95"
          )}
        >
          <div className="min-w-0 pl-1">
            <p className={cx("hidden truncate text-sm font-extrabold leading-tight sm:block lg:text-base", mainText)}>
              Java Interview Handbook — 100 Questions
            </p>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 sm:mt-1">
              <span className="text-lg font-extrabold leading-none text-orange-500 sm:text-base lg:text-lg">
                {loadingProduct ? "…" : formattedPrice}
              </span>
              {formattedMrp && (
                <span className={cx("text-xs font-bold line-through", mutedText)}>{formattedMrp}</span>
              )}
              {discount > 0 && (
                <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-extrabold text-orange-500">
                  {discount}% off
                </span>
              )}
            </div>
            <p className={cx("mt-1 truncate text-[11px] font-bold sm:hidden", mutedText)}>
              Java Interview Handbook
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToSection("springboot-book")}
              className={cx(
                "hidden min-h-[46px] items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition hover:-translate-y-0.5 lg:inline-flex",
                isDarkMode ? "border-white/10 text-white hover:bg-white/5" : "border-orange-200 text-orange-700 hover:bg-orange-50"
              )}
            >
              <Server size={16} />
              Spring Boot book
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!canBuy}
              className={cx(ctaPrimary, "tt-pulse md-tt-no-pulse min-h-[50px] px-4 text-[13px] sm:px-6 sm:text-sm")}
            >
              {loadingProduct ? <Loader2 size={17} className="animate-spin" /> : <>Buy Now<ArrowRight size={16} className="transition group-hover:translate-x-1" /></>}
            </button>
          </div>
        </div>
      </div>

      {/* EXISTING TARGET TREK PAYMENT MODAL (Java + Spring Boot) */}
      <PayUCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        product={checkoutProduct}
      />
    </>
  );
}
