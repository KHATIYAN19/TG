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
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Code2,
  Filter,
  Grid2X2,
  Layers3,
  List,
  Network,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

import BASE_URL from "../utils/Url";

// =======================================================
// EXISTING WEBSITE CONFIGURATION
// =======================================================

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/books`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE =
  "Software Engineering Books, System Design & GenAI Guides | Target Trek";

const SEO_DESCRIPTION =
  "Explore practical ebooks on System Design HLD, Java LLD, Google ADK, RAG, MCP, GenAI, and backend engineering from Target Trek.";

const EASE = [0.22, 1, 0.36, 1];

const SEARCH_EXAMPLES = [
  "System Design HLD",
  "Java LLD",
  "Google ADK",
  "RAG",
  "MCP",
  "Spring Boot",
  "GenAI agents",
];

const QUICK_FILTERS = [
  { label: "All books", value: "" },
  { label: "System Design", value: "system design" },
  { label: "Java", value: "java" },
  { label: "GenAI", value: "genai" },
  { label: "RAG", value: "rag" },
  { label: "MCP", value: "mcp" },
];

const TICKER = [
  "System Design",
  "Java LLD",
  "Google ADK",
  "RAG",
  "MCP",
  "Spring Boot",
  "Design Patterns",
  "Caching",
  "Kafka",
  "Concurrency",
  "GenAI",
  "Backend",
];

const FAQS = [
  {
    question: "Which Target Trek book should I start with?",
    answer:
      "For architecture, scalability and system design interviews start with the System Design HLD book. For object-oriented design in Java choose the LLD book. For AI engineering, explore the Google ADK, RAG and MCP guides.",
  },
  {
    question: "What is the difference between HLD and LLD?",
    answer:
      "HLD (high-level design) covers scalable architecture, APIs, databases, caching and distributed systems. LLD (low-level design) covers classes, interfaces, UML, design patterns and Java implementation.",
  },
  {
    question: "How do I read the ebooks after buying?",
    answer:
      "Our books are digital ebooks. After a successful payment you receive a secure access link and can read the book in the built-in reader on the Target Trek website.",
  },
  {
    question: "Are ebook purchases refundable?",
    answer:
      "Ebooks are digital products and purchases are final and non-refundable, so please review the book details and our Refund Policy before buying.",
  },
  {
    question: "Who do I contact for purchase or access help?",
    answer:
      "Email supporttargettrek@gmail.com with your order reference and we will help with purchase and access issues.",
  },
];

// =======================================================
// UTILITIES
// =======================================================

const readTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    return localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const money = (value, currency = "INR") => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  const number = Number(value);
  if (!Number.isFinite(number)) return "";

  const localeMap = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "en-IE",
    AUD: "en-AU",
    CAD: "en-CA",
  };

  try {
    return new Intl.NumberFormat(
      localeMap[currency] || "en-IN",
      {
        style: "currency",
        currency,
        minimumFractionDigits: Number.isInteger(number)
          ? 0
          : 2,
        maximumFractionDigits: 2,
      }
    ).format(number);
  } catch {
    return `${currency} ${number}`;
  }
};

const getDiscount = (book) => {
  const price = Number(book?.price);
  const mrp = Number(book?.mrp);

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(mrp) ||
    mrp <= 0 ||
    price >= mrp
  ) {
    return 0;
  }

  return Math.round(((mrp - price) / mrp) * 100);
};

const getCoverUrl = (book) =>
  book?.coverPageUrl ||
  book?.coverpageurl ||
  book?.cover_page_url ||
  "";

const getCategories = (book) => {
  if (Array.isArray(book?.categories)) {
    return book.categories.filter(Boolean);
  }

  if (book?.category) return [book.category];

  return [];
};

const getResourceType = (type) => {
  const types = {
    pdf: "PDF",
    ebook: "Ebook",
    course: "Course",
    bundle: "Bundle",
    template: "Template",
    notes: "Notes",
    other: "Digital Product",
  };

  return types[type] || "Ebook";
};

const getBookId = (book) =>
  String(
    book?._id ||
    book?.id ||
    book?.slug ||
    book?.redirectUrl ||
    book?.title ||
    ""
  );

const isHLDBook = (book) => {
  const value = [
    book?.title,
    book?.slug,
    book?.redirectUrl,
    book?.subtitle,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    value.includes("/system-design/hld") ||
    value.includes("system-design-hld") ||
    value.includes("high-level design") ||
    (
      value.includes("system design") &&
      /\bhld\b/.test(value)
    )
  );
};

const getBookUrl = (book) => {
  const redirectUrl = book?.redirectUrl?.trim();

  if (!redirectUrl) return "";

  return redirectUrl.startsWith("http://") ||
    redirectUrl.startsWith("https://")
    ? redirectUrl
    : `${SITE_URL}${
        redirectUrl.startsWith("/")
          ? redirectUrl
          : `/${redirectUrl}`
      }`;
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Cursor spotlight (CSS variables read by .tb-spot)
const spot = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();

  event.currentTarget.style.setProperty(
    "--mx",
    `${event.clientX - rect.left}px`
  );
  event.currentTarget.style.setProperty(
    "--my",
    `${event.clientY - rect.top}px`
  );
};

// Real <a href> so search engines can follow every book link
function BookLink({ book, className, children, ...rest }) {
  const raw = book?.redirectUrl?.trim();

  if (!raw) {
    return (
      <span className={className} {...rest}>
        {children}
      </span>
    );
  }

  if (/^https?:\/\//i.test(raw)) {
    return (
      <a href={raw} className={className} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link
      to={raw.startsWith("/") ? raw : `/${raw}`}
      className={className}
      {...rest}
    >
      {children}
    </Link>
  );
}

// =======================================================
// MOTION HELPERS
// =======================================================

const stagger = (gap = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

const rise = {
  hidden: { opacity: 0, y: 34, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

function Reveal({ children, delay = 0, y = 30, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function Stagger({ children, className, gap, delay }) {
  return (
    <motion.div
      className={className}
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

// 3D tilt that follows the cursor
function Tilt({ children, className, max = 8, scale = 1.02 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), {
    stiffness: 220,
    damping: 20,
  });

  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), {
    stiffness: 220,
    damping: 20,
  });

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={cn("tb-tilt", className)}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={{ scale }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

function Counter({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;

    const controls = animate(0, to, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{value}</span>;
}

function SplitWords({ text, className, delay = 0.15 }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <span className="tb-word-mask" key={`${word}-${index}`}>
          <motion.span
            className="tb-word"
            aria-hidden="true"
            initial={{ y: "115%", rotate: 7 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{
              duration: 0.85,
              delay: delay + index * 0.09,
              ease: EASE,
            }}
          >
            {word}
          </motion.span>{" "}
        </span>
      ))}
    </span>
  );
}

// Words that wave in when scrolled into view
function ScrollWords({ text }) {
  return (
    <>
      {text.split(" ").map((word, index) => (
        <span className="tb-word-mask" key={`${word}-${index}`}>
          <motion.span
            className="tb-word"
            initial={{ y: "115%", rotate: 5 }}
            whileInView={{ y: "0%", rotate: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.7,
              delay: index * 0.09,
              ease: EASE,
            }}
          >
            {word}
          </motion.span>{" "}
        </span>
      ))}
    </>
  );
}

// =======================================================
// BOOK COVER
// =======================================================

function BookCover({
  book,
  className = "",
  priority = false,
  decorative = false,
}) {
  const [imageError, setImageError] = useState(false);

  const image = getCoverUrl(book);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  return (
    <div className={cn("tb-cover", className)}>
      {image && !imageError ? (
        <img
          src={image}
          alt={decorative ? "" : `${book?.title || "Ebook"} cover`}
          width="300"
          height="400"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="tb-cover-fallback">
          <div className="tb-cover-fallback-top">
            <BookOpen size={22} />
            <span>TARGET TREK</span>
          </div>

          <div>
            <i />
            <h3>{book?.title || "Digital Ebook"}</h3>
          </div>
        </div>
      )}

      <span className="tb-cover-shine" aria-hidden="true" />
    </div>
  );
}

// =======================================================
// PRICE
// =======================================================

function BookPrice({ book, large = false }) {
  const discount = getDiscount(book);

  return (
    <div className={cn("tb-price", large && "tb-price-lg")}>
      <strong>{money(book?.price, book?.currency)}</strong>

      {Number(book?.mrp) > Number(book?.price) && (
        <s>{money(book?.mrp, book?.currency)}</s>
      )}

      {discount > 0 && (
        <span className="tb-off">{discount}% OFF</span>
      )}
    </div>
  );
}

// =======================================================
// HERO BOOK FAN
// =======================================================

function HeroFan({ books }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    stiffness: 120,
    damping: 18,
  });

  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-16, 16]), {
    stiffness: 120,
    damping: 18,
  });

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();

    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  // always render three slots; real covers when available
  const slots = [books[1], books[0], books[2]];

  return (
    <motion.div
      className="tb-fan-wrap"
      initial={{ opacity: 0, scale: 0.8, rotate: -6 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 1, delay: 0.35, ease: EASE }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="tb-ring tb-ring-1" aria-hidden="true" />
      <div className="tb-ring tb-ring-2" aria-hidden="true" />

      <span className="tb-orb tb-orb-1"><Zap size={18} /></span>
      <span className="tb-orb tb-orb-2"><Network size={18} /></span>
      <span className="tb-orb tb-orb-3"><Code2 size={18} /></span>

      <motion.div
        className="tb-fan"
        style={{ rotateX, rotateY, transformPerspective: 1100 }}
      >
        {slots.map((book, index) => (
          <div className={`tb-fan-book tb-fan-${index + 1}`} key={index}>
            <BookCover
              book={book || { title: "Target Trek Ebook" }}
              priority
              decorative
            />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// =======================================================
// FEATURED HLD CARD
// =======================================================

function FeaturedBook({ book }) {
  if (!book) return null;

  const categories = getCategories(book);

  return (
    <section className="tb-featured-section" aria-labelledby="tb-featured-title">
      <Reveal>
        <div className="tb-section-label">
          <Sparkles size={16} />
          <h2 id="tb-featured-title">Featured book</h2>
          <span>Recommended reading</span>
        </div>
      </Reveal>

      <Reveal y={50}>
        <div className="tb-aurora">
          <article
            className="tb-featured tb-spot"
            onMouseMove={spot}
            itemScope
            itemType="https://schema.org/Product"
          >
            <div className="tb-featured-glow" aria-hidden="true" />

            <div className="tb-featured-media">
              <Tilt max={12} scale={1.05}>
                <div className="tb-featured-cover">
                  <BookCover book={book} priority />
                </div>
              </Tilt>
            </div>

            <div className="tb-featured-body">
              <div className="tb-tags">
                <span className="tb-tag tb-tag-solid">
                  <Sparkles size={11} />
                  Featured
                </span>

                {categories.slice(0, 2).map((item) => (
                  <span className="tb-tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>

              <h3>{book.title}</h3>

              <p>
                {book.shortDescription ||
                  book.subtitle ||
                  book.description ||
                  "Explore this practical software engineering guide."}
              </p>

              <BookPrice book={book} large />

              <div className="tb-featured-actions">
                <motion.div
                  className="tb-inline"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <BookLink book={book} className="tb-btn">
                    Explore this book
                    <ArrowUpRight size={16} />
                  </BookLink>
                </motion.div>

                <span className="tb-format">
                  <Check size={14} />
                  {getResourceType(book.resourceType)}
                </span>
              </div>
            </div>
          </article>
        </div>
      </Reveal>
    </section>
  );
}

// =======================================================
// BOOK CARD
// =======================================================

const BookCard = React.forwardRef(function BookCard(
  { book, view, index },
  ref
) {
  const listView = view === "list";
  const categories = getCategories(book);
  const discount = getDiscount(book);

  return (
    <motion.div
      ref={ref}
      layout
      className="tb-cell"
      initial={{ opacity: 0, y: 46, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.65,
        delay: (index % 4) * 0.08,
        ease: EASE,
        layout: { type: "spring", stiffness: 260, damping: 30 },
      }}
    >
      <Tilt max={listView ? 3 : 7} scale={1.025}>
        <article
          className={cn(
            "tb-card tb-spot",
            listView && "tb-card-list"
          )}
          onMouseMove={spot}
        >
          <BookLink
            book={book}
            className="tb-card-media"
            aria-label={`View ${book?.title}`}
          >
            <span className="tb-card-aura" aria-hidden="true" />

            <div
              className="tb-card-float"
              style={{
                animationDelay: `${(index % 5) * -0.9}s`,
                animationDuration: `${4.4 + (index % 3) * 0.7}s`,
              }}
            >
              <BookCover book={book} />
            </div>

            {discount > 0 && (
              <span className="tb-ribbon">{discount}% OFF</span>
            )}
          </BookLink>

          <div className="tb-card-body">
            <div className="tb-tags">
              {categories.slice(0, 1).map((item) => (
                <span className="tb-tag tb-tag-orange" key={item}>
                  {item}
                </span>
              ))}

              <span className="tb-tag">
                {getResourceType(book.resourceType)}
              </span>
            </div>

            <h3>{book.title}</h3>

            {(book.subtitle || book.shortDescription) && (
              <p>{book.subtitle || book.shortDescription}</p>
            )}

            <div className="tb-card-spacer" />

            <div className="tb-card-foot">
              <BookPrice book={book} />

              <BookLink book={book} className="tb-card-link">
                View book details
                <span className="tb-arrow">
                  <ArrowRight size={14} />
                </span>
              </BookLink>
            </div>
          </div>
        </article>
      </Tilt>
    </motion.div>
  );
});

// =======================================================
// FILTER SELECT
// =======================================================

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="tb-select">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => {
          const item =
            typeof option === "string"
              ? { value: option, label: option }
              : option;

          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>

      <ChevronDown size={15} />
    </div>
  );
}

// =======================================================
// LOADING
// =======================================================

function BookSkeleton() {
  return (
    <div className="tb-skeleton">
      <div className="tb-skeleton-media">
        <div />
      </div>

      <div className="tb-skeleton-body">
        <i style={{ width: "30%" }} />
        <i style={{ width: "100%", height: 18 }} />
        <i style={{ width: "70%" }} />
        <i style={{ width: "40%", height: 26, marginTop: 22 }} />
      </div>
    </div>
  );
}

// =======================================================
// MAIN COMPONENT
// =======================================================

export default function Books() {
  const [theme, setTheme] = useState(readTheme);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [sort, setSort] = useState("");

  const [view, setView] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showTop, setShowTop] = useState(false);

  const isDark = theme === "dark";

  const heroRef = useRef(null);

  // =====================================================
  // SCROLL EFFECTS
  // =====================================================

  const { scrollYProgress: pageProgress } = useScroll();

  const progress = useSpring(pageProgress, {
    stiffness: 140,
    damping: 28,
  });

  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const blobY = useTransform(heroProgress, [0, 1], [0, 170]);
  const blobY2 = useTransform(heroProgress, [0, 1], [0, -100]);
  const copyY = useTransform(heroProgress, [0, 1], [0, 60]);
  const fanY = useTransform(heroProgress, [0, 1], [0, 110]);
  const heroFade = useTransform(heroProgress, [0, 0.85], [1, 0.2]);
  const fanScale = useTransform(heroProgress, [0, 1], [1, 0.86]);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 700);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // rotating search placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((n) => (n + 1) % SEARCH_EXAMPLES.length);
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  // =====================================================
  // THEME - EXISTING EVENT SUPPORT
  // =====================================================

  useEffect(() => {
    const handleThemeChange = (event) => {
      const next = event?.detail?.theme;

      if (next === "dark" || next === "light") {
        setTheme(next);
      } else {
        setTheme(readTheme());
      }
    };

    const handleStorageChange = (event) => {
      if (!event.key || event.key === THEME_KEY) {
        setTheme(readTheme());
      }
    };

    const handleFocus = () => setTheme(readTheme());

    window.addEventListener(THEME_EVENT, handleThemeChange);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener(THEME_EVENT, handleThemeChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // =====================================================
  // EXISTING BOOKS API - UNCHANGED
  //
  // GET ${BASE_URL}/book
  // Response: { success: true, data: [...] }
  // =====================================================

  const fetchBooks = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${BASE_URL}/book`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
        signal,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success !== true) {
        throw new Error(
          result?.error?.message ||
            result?.message ||
            "Unable to load resources."
        );
      }

      setBooks(Array.isArray(result?.data) ? result.data : []);
    } catch (err) {
      if (err?.name === "AbortError") return;

      console.error("Books fetch error:", err);

      setBooks([]);

      setError(
        err?.message || "Something went wrong while loading books."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchBooks(controller.signal);

    return () => controller.abort();
  }, [fetchBooks, retryCount]);

  // =====================================================
  // CATEGORIES & TYPES FROM BACKEND
  // =====================================================

  const categories = useMemo(() => {
    return [
      ...new Set(books.flatMap((book) => getCategories(book))),
    ].sort((a, b) => a.localeCompare(b));
  }, [books]);

  const resourceTypes = useMemo(() => {
    return [
      ...new Set(
        books.map((book) => book.resourceType).filter(Boolean)
      ),
    ].sort();
  }, [books]);

  // =====================================================
  // FEATURED BOOK LOGIC
  //
  // HLD PRIORITY
  // Then backend isFeatured
  // Then first API book
  // =====================================================

  const featuredBook = useMemo(() => {
    return (
      books.find(isHLDBook) ||
      books.find((book) => book.isFeatured) ||
      books[0] ||
      null
    );
  }, [books]);

  const featuredId = featuredBook ? getBookId(featuredBook) : null;

  // books shown in the hero fan: featured first, then others
  const fanBooks = useMemo(() => {
    if (!featuredBook) return [];

    return [
      featuredBook,
      ...books.filter((b) => getBookId(b) !== featuredId),
    ].slice(0, 3);
  }, [books, featuredBook, featuredId]);

  // =====================================================
  // FILTERS & SORTING
  // =====================================================

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = books.filter((book) => {
      const tags = Array.isArray(book?.tags) ? book.tags.join(" ") : "";

      const searchable = [
        book?.title,
        book?.slug,
        book?.subtitle,
        book?.shortDescription,
        book?.description,
        book?.resourceType,
        book?.pageKey,
        book?.badge,
        getCategories(book).join(" "),
        tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      const matchesCategory =
        !category || getCategories(book).includes(category);

      const matchesType =
        !resourceType || book?.resourceType === resourceType;

      return matchesSearch && matchesCategory && matchesType;
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") {
        return Number(a?.price ?? 0) - Number(b?.price ?? 0);
      }

      if (sort === "price-high") {
        return Number(b?.price ?? 0) - Number(a?.price ?? 0);
      }

      if (sort === "title") {
        return String(a?.title || "").localeCompare(
          String(b?.title || "")
        );
      }

      if (sort === "featured") {
        return (
          Number(Boolean(b?.isFeatured)) -
          Number(Boolean(a?.isFeatured))
        );
      }

      return 0;
    });
  }, [books, search, category, resourceType, sort]);

  const hasFilters = Boolean(
    search || category || resourceType || sort
  );

  // Show the featured book once on the default page.
  // When searching/filtering, allow it to appear in results.
  const catalogBooks = useMemo(() => {
    if (hasFilters || !featuredId) {
      return filteredBooks;
    }

    return filteredBooks.filter(
      (book) => getBookId(book) !== featuredId
    );
  }, [filteredBooks, hasFilters, featuredId]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setResourceType("");
    setSort("");
  };

  // jump to the catalog with a topic applied
  const pickPath = (value) => {
    setSearch(value);
    setCategory("");
    setResourceType("");

    requestAnimationFrame(() => {
      document
        .getElementById("library")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  // =====================================================
  // SEO STRUCTURED DATA
  // =====================================================

  const structuredData = useMemo(() => {
    const items = books
      .filter((book) => book?.redirectUrl)
      .slice(0, 50)
      .map((book, index) => {
        const price = Number(book?.price);

        return {
          "@type": "ListItem",
          position: index + 1,
          url: getBookUrl(book),
          item: {
            "@type": "Product",
            name: book?.title || "Target Trek Resource",
            url: getBookUrl(book),
            brand: { "@type": "Brand", name: "Target Trek" },
            ...(getCoverUrl(book) ? { image: getCoverUrl(book) } : {}),
            ...(book?.subtitle || book?.shortDescription
              ? { description: book.subtitle || book.shortDescription }
              : {}),
            ...(Number.isFinite(price) && price >= 0
              ? {
                  offers: {
                    "@type": "Offer",
                    price: String(price),
                    priceCurrency: book?.currency || "INR",
                    availability: "https://schema.org/InStock",
                    url: getBookUrl(book),
                  },
                }
              : {}),
          },
        };
      });

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "Target Trek",
          url: SITE_URL,
        },
        {
          "@type": "CollectionPage",
          "@id": `${PAGE_URL}#webpage`,
          name: SEO_TITLE,
          url: PAGE_URL,
          description: SEO_DESCRIPTION,
          isPartOf: { "@id": `${SITE_URL}/#organization` },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Target Trek",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Books",
              item: PAGE_URL,
            },
          ],
        },
        {
          "@type": "ItemList",
          "@id": `${PAGE_URL}#resources`,
          numberOfItems: items.length,
          itemListElement: items,
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        },
      ],
    };
  }, [books]);

  const cover = featuredBook ? getCoverUrl(featuredBook) : "";

  const stats = [
    { value: books.length, label: "Digital resources" },
    { value: categories.length, label: "Categories" },
    { value: resourceTypes.length, label: "Formats" },
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <MotionConfig reducedMotion="user">
      <Helmet>
        <title>{SEO_TITLE}</title>

        <meta name="description" content={SEO_DESCRIPTION} />

        <meta
          name="keywords"
          content="system design books, HLD ebook, Java LLD ebook, Google ADK, RAG, MCP, GenAI ebooks, backend engineering, software engineering interview preparation, Target Trek"
        />

        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1"
        />

        <link rel="canonical" href={PAGE_URL} />

        <meta property="og:site_name" content="Target Trek" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />

        {cover && <meta property="og:image" content={cover} />}
        {cover && (
          <meta
            property="og:image:alt"
            content={`${featuredBook?.title || "Target Trek"} cover`}
          />
        )}

        <meta
          name="twitter:card"
          content={cover ? "summary_large_image" : "summary"}
        />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        {cover && <meta name="twitter:image" content={cover} />}

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .tb-root {
          --tb-bg: #F3EBE0;
          --tb-surface: #FBF6EE;
          --tb-alt: #EADFD0;
          --tb-text: #1C1917;
          --tb-muted: #61574F;
          --tb-subtle: #9A8E83;
          --tb-border: #DDD0BF;
          --tb-orange: #E5530A;
          --tb-orange-b: #F97316;
          --tb-soft: #FCE6D2;
          --tb-soft-border: #F6C79B;
          --tb-shadow: 0 18px 50px rgba(74,48,24,.14);
          --tb-glow: rgba(249,115,22,.2);

          min-height: 100vh; width: 100%;
          overflow-x: clip;
          background:
            radial-gradient(900px 500px at 8% 12%, rgba(249,115,22,.07), transparent 60%),
            radial-gradient(800px 520px at 95% 40%, rgba(251,191,36,.09), transparent 60%),
            var(--tb-bg);
          color: var(--tb-text);
          font-family: "DM Sans", sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background .25s, color .25s;
        }
        .tb-root[data-theme="dark"] {
          --tb-bg: #151311;
          --tb-surface: #211E1B;
          --tb-alt: #2B2622;
          --tb-text: #FAF8F5;
          --tb-muted: #B5ACA5;
          --tb-subtle: #8D827A;
          --tb-border: #39332E;
          --tb-orange: #FB923C;
          --tb-soft: #37251B;
          --tb-soft-border: #693B23;
          --tb-shadow: 0 18px 50px rgba(0,0,0,.35);
          --tb-glow: rgba(251,146,60,.15);
          color-scheme: dark;
        }
        .tb-root *, .tb-root *::before, .tb-root *::after { box-sizing: border-box; }
        .tb-root button { font: inherit; cursor: pointer; }
        .tb-root h1, .tb-root h2, .tb-root h3, .tb-root h4, .tb-root button { font-family: "Manrope", sans-serif; }

        .tb-shell { width: min(1240px, calc(100% - 40px)); margin: 0 auto; }

        .tb-progress {
          position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 9999;
          transform-origin: 0 50%;
          background: linear-gradient(90deg,#F97316,#FDBA74,#EA580C);
        }

        /* shared */
        .tb-btn {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center; gap: 9px;
          min-height: 46px; padding: 11px 22px; border: 0; border-radius: 12px;
          background: linear-gradient(135deg,#F97316,#EA580C); color: #fff;
          font-size: 13px; font-weight: 800;
          box-shadow: 0 10px 26px rgba(249,115,22,.3);
        }
        .tb-btn::after {
          content: ""; position: absolute; top: 0; left: -120%; width: 60%; height: 100%;
          background: linear-gradient(100deg,transparent,rgba(255,255,255,.4),transparent);
          transform: skewX(-20deg);
        }
        .tb-btn:hover::after { left: 150%; transition: left .7s ease; }

        .tb-spot { position: relative; overflow: hidden; }
        .tb-spot::before {
          content: ""; position: absolute; inset: 0; border-radius: inherit; z-index: 0;
          background: radial-gradient(280px circle at var(--mx,50%) var(--my,50%), var(--tb-glow), transparent 70%);
          opacity: 0; transition: opacity .3s; pointer-events: none;
        }
        .tb-spot:hover::before { opacity: 1; }
        .tb-spot > * { position: relative; z-index: 1; }
        .tb-tilt { height: 100%; transform-style: preserve-3d; }

        .tb-tags { display: flex; flex-wrap: wrap; gap: 7px; }
        .tb-tag {
          display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; border-radius: 7px;
          background: var(--tb-alt); color: var(--tb-muted); border: 1px solid var(--tb-border);
          font-size: 10px; font-weight: 800;
        }
        .tb-tag-solid { background: var(--tb-orange-b); border-color: transparent; color: #fff; text-transform: uppercase; letter-spacing: .08em; }
        .tb-tag-orange { background: var(--tb-soft); border-color: var(--tb-soft-border); color: var(--tb-orange); }

        .tb-price { display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; }
        .tb-price strong { font-size: 21px; font-weight: 850; letter-spacing: -.03em; color: var(--tb-text); }
        .tb-price-lg strong { font-size: 34px; }
        .tb-price s { font-size: 13px; color: var(--tb-subtle); }
        .tb-off {
          padding: 4px 8px; border-radius: 7px; background: var(--tb-soft); color: var(--tb-orange);
          font-size: 10px; font-weight: 900; animation: tb-pulse 2.4s ease-in-out infinite;
        }

        /* cover */
        .tb-cover {
          position: relative; overflow: hidden; border-radius: 6px 12px 12px 6px;
          background: #24211F; aspect-ratio: 3 / 4; width: 100%;
          box-shadow: inset 4px 0 0 rgba(255,255,255,.08);
        }
        .tb-cover img { display: block; width: 100%; height: 100%; object-fit: cover; }
        .tb-cover-fallback {
          display: flex; flex-direction: column; justify-content: space-between; height: 100%; padding: 14px; color: #fff;
          background: linear-gradient(140deg,#1D1B19,#342820 60%,#9A3412);
        }
        .tb-cover-fallback-top { display: flex; justify-content: space-between; align-items: center; color: #FDBA74; }
        .tb-cover-fallback-top span { font-size: 8px; letter-spacing: .16em; font-weight: 800; color: rgba(255,255,255,.6); }
        .tb-cover-fallback i { display: block; width: 36px; height: 3px; border-radius: 3px; background: #FB923C; margin-bottom: 10px; }
        .tb-cover-fallback h3 { margin: 0; font-size: 14px; line-height: 1.3; font-weight: 800; display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden; }
        .tb-cover-shine {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(115deg,transparent 35%,rgba(255,255,255,.34) 50%,transparent 65%);
          transform: translateX(-130%);
        }

        /* hero */
        .tb-hero {
          position: relative; overflow: hidden;
          padding: 112px 0 96px;
          background: linear-gradient(180deg,#FBEBD7 0%,#F5E2CB 55%,var(--tb-alt) 100%);
        }
        .tb-root[data-theme="dark"] .tb-hero { background: linear-gradient(180deg,#1C1816 0%,#1F1915 60%,var(--tb-alt) 100%); }
        .tb-hero-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(420px circle at var(--hx,72%) var(--hy,30%), rgba(249,115,22,.22), transparent 70%);
          transition: background .2s;
        }
        .tb-wave { position: absolute; left: 0; right: 0; bottom: -1px; height: 54px; overflow: hidden; pointer-events: none; }
        .tb-wave svg { position: absolute; left: 0; bottom: 0; width: 200%; height: 100%; fill: var(--tb-alt); animation: tb-wave 14s linear infinite; }
        .tb-wave svg:nth-child(2) { opacity: .55; animation-duration: 22s; animation-direction: reverse; }
        .tb-cue {
          position: absolute; z-index: 2; left: 50%; bottom: 62px; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 6px; color: var(--tb-muted);
          font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase;
        }
        .tb-cue-mouse { width: 22px; height: 34px; border: 2px solid var(--tb-muted); border-radius: 12px; position: relative; }
        .tb-cue-mouse::after { content: ""; position: absolute; left: 50%; top: 6px; width: 3px; height: 7px; margin-left: -1.5px; border-radius: 3px; background: var(--tb-orange-b); animation: tb-wheel 1.6s ease-in-out infinite; }
        .tb-hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .tb-blob { position: absolute; border-radius: 50%; filter: blur(70px); }
        .tb-blob-a { width: 540px; height: 540px; right: -170px; top: -250px; background: radial-gradient(circle,rgba(249,115,22,.28),transparent 68%); animation: tb-drift 14s ease-in-out infinite; }
        .tb-blob-b { width: 440px; height: 440px; left: -160px; bottom: -200px; background: radial-gradient(circle,rgba(251,191,36,.22),transparent 68%); animation: tb-drift 18s ease-in-out infinite reverse; }
        .tb-dots {
          position: absolute; inset: 0; opacity: .55;
          background-image: radial-gradient(var(--tb-border) 1px, transparent 1px);
          background-size: 26px 26px;
          mask-image: radial-gradient(ellipse at 70% 35%, #000, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 70% 35%, #000, transparent 70%);
        }
        .tb-spark {
          position: absolute; width: 5px; height: 5px; border-radius: 50%;
          background: var(--tb-orange-b); opacity: .0;
          animation: tb-rise 9s linear infinite;
        }

        .tb-hero-grid {
          position: relative; display: grid; align-items: center; gap: 50px;
          grid-template-columns: minmax(0,1.05fr) minmax(300px,.95fr);
        }
        .tb-badge {
          display: inline-flex; align-items: center; gap: 8px; padding: 7px 12px; border-radius: 8px;
          background: var(--tb-soft); border: 1px solid var(--tb-soft-border); color: var(--tb-orange);
          font-size: 10px; font-weight: 850; letter-spacing: .12em; text-transform: uppercase;
        }
        .tb-badge svg { animation: tb-spin 6s linear infinite; }
        .tb-hero h1 {
          margin: 22px 0 16px; max-width: 680px;
          font-size: clamp(40px, 5.8vw, 74px); line-height: 1.04; letter-spacing: -.06em; font-weight: 850;
        }
        .tb-word-mask { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: .08em; }
        .tb-word { display: inline-block; transform-origin: 0 100%; }
        .tb-accent {
          background: linear-gradient(100deg,#F97316,#FBBF24,#EA580C,#F97316); background-size: 250% auto;
          -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
          animation: tb-shine 5s linear infinite;
        }
        .tb-hero-copy { max-width: 540px; margin: 0; font-size: 15px; line-height: 1.85; color: var(--tb-muted); }
        .tb-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
        .tb-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px; min-height: 46px; padding: 11px 20px;
          border-radius: 12px; border: 1px solid var(--tb-border); background: var(--tb-surface); color: var(--tb-text);
          font-size: 13px; font-weight: 800; transition: border-color .2s, color .2s;
        }
        .tb-btn-ghost:hover { border-color: var(--tb-orange); color: var(--tb-orange); }

        .tb-stats { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
        .tb-stat {
          min-width: 110px; padding: 13px 16px; border-radius: 14px;
          background: var(--tb-bg); border: 1px solid var(--tb-border);
          transition: transform .3s, border-color .3s;
        }
        .tb-stat:hover { transform: translateY(-6px) rotate(-1.5deg); border-color: var(--tb-orange); }
        .tb-stat strong { display: block; font-family: "Manrope",sans-serif; font-size: 26px; font-weight: 850; color: var(--tb-orange); letter-spacing: -.04em; }
        .tb-stat span { font-size: 10px; font-weight: 800; color: var(--tb-muted); }

        /* fan */
        .tb-fan-wrap { position: relative; min-height: 400px; display: grid; place-items: center; }
        .tb-ring {
          position: absolute; left: 50%; top: 50%; border-radius: 50%; pointer-events: none;
          aspect-ratio: 1; transform: translate(-50%,-50%);
        }
        .tb-ring-1 { width: 108%; border: 1px dashed rgba(249,115,22,.4); animation: tb-spin-c 40s linear infinite; }
        .tb-ring-2 { width: 82%; border: 1px solid rgba(249,115,22,.18); animation: tb-spin-c 26s linear infinite reverse; }
        .tb-orb {
          position: absolute; z-index: 4; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 13px;
          background: var(--tb-surface); color: var(--tb-orange); border: 1px solid var(--tb-soft-border);
          box-shadow: var(--tb-shadow); animation: tb-float 6s ease-in-out infinite;
        }
        .tb-orb-1 { top: 2%; left: 6%; }
        .tb-orb-2 { top: 20%; right: 0; animation-delay: -2s; }
        .tb-orb-3 { bottom: 6%; left: 2%; animation-delay: -4s; }
        .tb-fan { position: relative; width: min(100%, 420px); height: 400px; transform-style: preserve-3d; }
        .tb-fan-book { position: absolute; left: 50%; top: 50%; width: 46%; transition: transform .6s cubic-bezier(.22,1,.36,1); animation: tb-bob 5.5s ease-in-out infinite; }
        .tb-fan-book .tb-cover { box-shadow: 14px 22px 34px rgba(0,0,0,.34), inset 5px 0 rgba(255,255,255,.08); }
        .tb-fan-1 { transform: translate(-128%,-50%) rotate(-13deg) translateZ(-30px); animation-delay: -1.5s; }
        .tb-fan-2 { transform: translate(-50%,-52%) translateZ(60px); width: 52%; z-index: 3; }
        .tb-fan-3 { transform: translate(28%,-50%) rotate(13deg) translateZ(-30px); animation-delay: -3s; }
        .tb-fan-wrap:hover .tb-fan-1 { transform: translate(-150%,-50%) rotate(-19deg) translateZ(-30px); }
        .tb-fan-wrap:hover .tb-fan-3 { transform: translate(50%,-50%) rotate(19deg) translateZ(-30px); }
        .tb-fan-wrap:hover .tb-fan-2 { transform: translate(-50%,-56%) translateZ(90px) scale(1.06); }

        /* ticker */
        .tb-ticker {
          overflow: hidden; padding: 10px 0 16px; border-bottom: 1px solid var(--tb-border); background: var(--tb-alt);
          mask-image: linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
          -webkit-mask-image: linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
        }
        .tb-ticker-track { display: flex; width: max-content; gap: 14px; animation: tb-marquee 36s linear infinite; }
        .tb-ticker-rev { margin-top: 10px; animation-direction: reverse; animation-duration: 44s; }
        .tb-ticker:hover .tb-ticker-track { animation-play-state: paused; }
        .tb-ticker-item {
          display: inline-flex; align-items: center; gap: 10px; white-space: nowrap; padding: 8px 16px; border-radius: 999px;
          border: 1px solid var(--tb-border); background: var(--tb-surface); color: var(--tb-muted); font-size: 12px; font-weight: 750;
          transition: color .2s, border-color .2s, transform .2s;
        }
        .tb-ticker-item:hover { color: var(--tb-orange); border-color: var(--tb-orange); transform: scale(1.08) rotate(-2deg); }
        .tb-ticker-item i { width: 6px; height: 6px; border-radius: 50%; background: var(--tb-orange-b); }

        .tb-main { padding: 60px 0 40px; }

        /* error */
        .tb-error {
          display: flex; flex-direction: column; gap: 14px; margin-bottom: 26px; padding: 18px; border-radius: 14px;
          border: 1px solid #FECACA; background: #FEF2F2; color: #DC2626;
        }
        .tb-root[data-theme="dark"] .tb-error { background: rgba(127,29,29,.2); border-color: #7F1D1D; }
        @media (min-width: 640px) { .tb-error { flex-direction: row; align-items: center; justify-content: space-between; } }
        .tb-error p { margin: 0; font-size: 12px; } .tb-error b { font-size: 14px; }
        .tb-error button { display: inline-flex; gap: 8px; align-items: center; justify-content: center; height: 40px; padding: 0 16px; border: 0; border-radius: 10px; background: #EF4444; color: #fff; font-size: 12px; font-weight: 800; }

        /* section label */
        .tb-section-label { display: flex; align-items: center; gap: 9px; margin-bottom: 16px; color: var(--tb-orange); }
        .tb-section-label h2 { margin: 0; font-size: 17px; font-weight: 850; letter-spacing: -.02em; color: var(--tb-text); }
        .tb-section-label span { margin-left: auto; font-size: 11px; font-weight: 700; color: var(--tb-subtle); }

        /* featured */
        .tb-featured-section { margin-bottom: 64px; }
        .tb-aurora { position: relative; overflow: hidden; padding: 2px; border-radius: 28px; isolation: isolate; }
        .tb-aurora::before {
          content: ""; position: absolute; z-index: -1; inset: -60%;
          background: conic-gradient(from 0deg,#F97316,#FBBF24,transparent 35%,#EA580C,transparent 65%,#F97316);
          animation: tb-spin 7s linear infinite;
        }
        .tb-featured {
          display: grid; grid-template-columns: minmax(200px,.7fr) minmax(0,1.3fr); gap: 36px; align-items: center;
          padding: 34px; border-radius: 26px; background: var(--tb-surface);
        }
        .tb-featured-glow {
          position: absolute !important; right: -90px; top: -120px; width: 340px; height: 340px; border-radius: 50%;
          background: radial-gradient(circle,rgba(249,115,22,.22),transparent 70%); pointer-events: none;
        }
        .tb-featured-media { display: grid; place-items: center; perspective: 1000px; }
        .tb-featured-cover {
          width: min(240px, 100%); border-radius: 8px 14px 14px 8px; transform: rotate(-3deg);
          box-shadow: 18px 28px 44px rgba(0,0,0,.28); animation: tb-bob 6s ease-in-out infinite;
        }
        .tb-featured:hover .tb-cover-shine { transform: translateX(130%); transition: transform .9s ease; }
        .tb-featured-body h3 { margin: 16px 0 0; font-size: clamp(26px,3.4vw,40px); line-height: 1.12; letter-spacing: -.045em; font-weight: 850; }
        .tb-featured-body p { margin: 14px 0 20px; max-width: 580px; font-size: 14px; line-height: 1.8; color: var(--tb-muted); }
        .tb-featured-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 16px; margin-top: 22px; }
        .tb-format { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--tb-muted); }
        .tb-format svg { color: var(--tb-orange); }

        .tb-inline { display: inline-block; }
        .tb-root a { text-decoration: none; }
        .tb-root a.tb-btn { color: #fff; }
        a.tb-card-media { text-decoration: none; }
        .tb-card:hover .tb-price strong { animation: tb-pop .5s ease; }

        /* library heading + toolbar */
        .tb-lib-head { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; margin-bottom: 20px; }
        .tb-kicker { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; color: var(--tb-orange); }
        .tb-kicker i { display: block; width: 4px; height: 16px; border-radius: 4px; background: var(--tb-orange-b); }
        .tb-lib-head h2 { margin: 6px 0 0; font-size: clamp(26px,3.2vw,38px); font-weight: 850; letter-spacing: -.045em; }
        .tb-lib-head p { margin: 6px 0 0; font-size: 13px; color: var(--tb-muted); }

        .tb-toolbar {
          position: sticky; top: 70px; z-index: 30; margin-bottom: 22px; padding: 12px;
          border-radius: 18px; border: 1px solid var(--tb-border);
          background: color-mix(in srgb, var(--tb-surface) 88%, transparent);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          box-shadow: 0 10px 30px rgba(39,29,22,.06);
        }
        .tb-toolbar-row { display: flex; gap: 10px; align-items: center; }
        .tb-search { position: relative; flex: 1; min-width: 0; }
        .tb-search svg.tb-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--tb-subtle); }
        .tb-search input {
          width: 100%; height: 48px; padding: 0 44px 0 44px; border-radius: 13px; outline: none;
          border: 1px solid var(--tb-border); background: var(--tb-bg); color: var(--tb-text); font-size: 14px;
          transition: border-color .2s, box-shadow .2s;
        }
        .tb-search input:focus { border-color: var(--tb-orange-b); box-shadow: 0 0 0 4px var(--tb-glow); }
        .tb-search input::placeholder { color: var(--tb-subtle); }
        .tb-search-clear { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); display: grid; place-items: center; width: 26px; height: 26px; border: 0; border-radius: 8px; background: transparent; color: var(--tb-subtle); }
        .tb-search-clear:hover { color: var(--tb-orange); }
        .tb-icon-btn {
          position: relative; display: inline-flex; align-items: center; gap: 8px; height: 48px; padding: 0 14px;
          border-radius: 13px; border: 1px solid var(--tb-border); background: var(--tb-bg); color: var(--tb-text);
          font-size: 12px; font-weight: 800; transition: border-color .2s;
        }
        .tb-icon-btn:hover { border-color: var(--tb-orange); }
        .tb-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--tb-orange-b); }
        .tb-view { position: relative; display: flex; padding: 4px; height: 48px; border-radius: 13px; border: 1px solid var(--tb-border); background: var(--tb-bg); }
        .tb-view button { position: relative; z-index: 1; display: grid; place-items: center; width: 38px; border: 0; border-radius: 9px; background: transparent; color: var(--tb-muted); transition: color .2s; }
        .tb-view button[aria-pressed="true"] { color: #fff; }
        .tb-view-pill { position: absolute; inset: 0; z-index: -1; border-radius: 9px; background: linear-gradient(135deg,#F97316,#EA580C); }

        .tb-chips { display: flex; gap: 10px; margin-top: 12px; padding: 4px 2px 6px; overflow-x: auto; scrollbar-width: none; }
        .tb-chips::-webkit-scrollbar { display: none; }
        .tb-chip {
          position: relative; flex-shrink: 0; padding: 9px 16px; border-radius: 999px; border: 1px solid var(--tb-border);
          background: var(--tb-surface); color: var(--tb-muted); font-size: 12px; font-weight: 800;
          transition: color .25s, border-color .25s, box-shadow .25s;
        }
        .tb-chip:hover { border-color: var(--tb-orange); color: var(--tb-orange); }
        .tb-chip[aria-pressed="true"] {
          color: #fff; border-color: transparent;
          box-shadow: 0 8px 22px rgba(28,25,23,.38), 0 0 0 2px rgba(249,115,22,.65);
        }
        .tb-root[data-theme="dark"] .tb-chip[aria-pressed="true"] { color: #1C1917; box-shadow: 0 8px 22px rgba(249,115,22,.35), 0 0 0 2px rgba(253,186,116,.7); }
        .tb-chip-label { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 8px; }
        .tb-chip[aria-pressed="true"] .tb-chip-label::before {
          content: ""; width: 7px; height: 7px; border-radius: 50%; background: #F97316; box-shadow: 0 0 10px #F97316;
          animation: tb-pulse 1.6s ease-in-out infinite;
        }
        .tb-chip-pill {
          position: absolute; inset: 0; border-radius: 999px;
          background: linear-gradient(135deg,#1C1917,#3B2214 60%,#7C2D12);
        }
        .tb-root[data-theme="dark"] .tb-chip-pill { background: linear-gradient(135deg,#FDBA74,#F97316); }

        .tb-filters { padding-top: 14px; }
        .tb-filters-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .tb-filters-head h3 { display: flex; align-items: center; gap: 8px; margin: 0; font-size: 13px; font-weight: 850; }
        .tb-filters-head h3 svg { color: var(--tb-orange); }
        .tb-link-btn { border: 0; background: transparent; color: var(--tb-orange); font-size: 12px; font-weight: 800; }
        .tb-filter-grid { display: grid; gap: 10px; grid-template-columns: repeat(3,minmax(0,1fr)); }
        .tb-select { position: relative; }
        .tb-select select {
          width: 100%; height: 46px; padding: 0 36px 0 12px; appearance: none; -webkit-appearance: none; outline: none;
          border-radius: 12px; border: 1px solid var(--tb-border); background: var(--tb-bg); color: var(--tb-text); font-size: 13px; font-weight: 600;
        }
        .tb-select select:focus { border-color: var(--tb-orange-b); }
        .tb-select svg { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--tb-subtle); }

        .tb-count { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; font-size: 12px; font-weight: 700; color: var(--tb-muted); }
        .tb-count b { color: var(--tb-text); }
        .tb-count button { display: inline-flex; align-items: center; gap: 4px; }

        /* grid + cards */
        .tb-grid { display: grid; gap: 22px; padding-bottom: 30px; grid-template-columns: repeat(auto-fill,minmax(250px,1fr)); }
        .tb-grid-list { grid-template-columns: repeat(auto-fill,minmax(min(100%,430px),1fr)); }
        @media (min-width: 760px) {
          .tb-grid:not(.tb-grid-list) > .tb-cell:nth-child(even) { margin-top: 26px; }
        }
        .tb-cell { min-width: 0; }
        .tb-card {
          display: flex; flex-direction: column; height: 100%; border-radius: 22px; overflow: hidden;
          border: 1px solid var(--tb-border); background: var(--tb-surface);
          transition: border-color .25s, box-shadow .25s;
        }
        .tb-card:hover { border-color: var(--tb-orange); box-shadow: var(--tb-shadow); }
        .tb-card-list { flex-direction: row; }
        .tb-card-media {
          position: relative; display: grid; place-items: center; width: 100%; height: 270px; padding: 22px; border: 0;
          background: var(--tb-alt); overflow: hidden; perspective: 900px;
        }
        .tb-card-list .tb-card-media { width: 150px; height: auto; min-height: 100%; flex-shrink: 0; padding: 16px; }
        .tb-card-aura {
          position: absolute; left: 50%; top: 50%; width: 190px; height: 190px; border-radius: 50%;
          transform: translate(-50%,-50%) scale(.6); opacity: 0;
          background: radial-gradient(circle,rgba(249,115,22,.38),transparent 70%);
          transition: transform .5s, opacity .5s;
        }
        .tb-card:hover .tb-card-aura { transform: translate(-50%,-50%) scale(1.25); opacity: 1; }
        .tb-card-float { position: relative; z-index: 1; width: min(150px,100%); height: auto; animation: tb-bob 5s ease-in-out infinite; }
        .tb-card-float .tb-cover {
          transform: rotateY(-8deg) rotateZ(-2deg);
          box-shadow: 12px 18px 26px rgba(0,0,0,.24), inset 4px 0 rgba(255,255,255,.08);
          transition: transform .6s cubic-bezier(.22,1,.36,1);
        }
        .tb-card:hover .tb-card-float .tb-cover { transform: rotateY(-20deg) rotateZ(-5deg) scale(1.1); }
        .tb-card:hover .tb-cover-shine { transform: translateX(130%); transition: transform .8s ease; }
        .tb-ribbon {
          position: absolute; z-index: 2; top: 14px; right: -34px; width: 120px; padding: 4px 0; text-align: center; transform: rotate(40deg);
          background: linear-gradient(135deg,#F97316,#EA580C); color: #fff; font-size: 9px; font-weight: 900; letter-spacing: .06em;
        }
        .tb-card-body { display: flex; flex-direction: column; flex: 1; min-width: 0; padding: 20px; }
        .tb-card-list .tb-card-body { padding: 20px 22px; }
        .tb-card-body h3 {
          margin: 14px 0 0; font-size: 17px; line-height: 1.3; font-weight: 850; letter-spacing: -.03em;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color: var(--tb-text);
        }
        .tb-card-body p {
          margin: 8px 0 0; font-size: 12px; line-height: 1.7; color: var(--tb-muted);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .tb-card-spacer { flex: 1; min-height: 14px; }
        .tb-card-foot { padding-top: 16px; margin-top: 8px; border-top: 1px solid var(--tb-border); }
        .tb-card-link {
          display: inline-flex; align-items: center; gap: 8px; margin-top: 12px; padding: 0; border: 0; background: transparent;
          color: var(--tb-orange); font-size: 12px; font-weight: 850; transition: gap .2s;
        }
        .tb-card:hover .tb-card-link { gap: 14px; }
        .tb-arrow {
          display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; background: var(--tb-soft);
          transition: transform .3s, background .3s, color .3s;
        }
        .tb-card:hover .tb-arrow { transform: rotate(-45deg) scale(1.1); background: var(--tb-orange-b); color: #fff; }

        /* faq */
        .tb-faq { margin-top: 70px; }
        .tb-faq-list { display: grid; gap: 12px; max-width: 860px; }
        .tb-faq-item {
          border-radius: 16px; border: 1px solid var(--tb-border); background: var(--tb-surface); overflow: hidden;
          transition: border-color .25s, box-shadow .25s;
        }
        .tb-faq-item:hover, .tb-faq-item[open] { border-color: var(--tb-orange); }
        .tb-faq-item[open] { box-shadow: var(--tb-shadow); }
        .tb-faq-item summary {
          list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 14px; cursor: pointer;
          padding: 18px 20px; font-family: "Manrope",sans-serif; font-size: 14px; font-weight: 800;
        }
        .tb-faq-item summary::-webkit-details-marker { display: none; }
        .tb-faq-item summary svg { flex-shrink: 0; color: var(--tb-orange); transition: transform .35s cubic-bezier(.22,1,.36,1); }
        .tb-faq-item[open] summary svg { transform: rotate(180deg); }
        .tb-faq-item p { margin: 0; padding: 0 20px 20px; font-size: 13px; line-height: 1.85; color: var(--tb-muted); animation: tb-open .4s ease; }

        /* skeleton */
        .tb-skeleton { overflow: hidden; border-radius: 22px; border: 1px solid var(--tb-border); background: var(--tb-surface); }
        .tb-skeleton-media { display: grid; place-items: center; height: 270px; background: var(--tb-alt); }
        .tb-skeleton-media div, .tb-skeleton-body i { position: relative; overflow: hidden; background: var(--tb-border); border-radius: 10px; }
        .tb-skeleton-media div { width: 130px; height: 175px; }
        .tb-skeleton-body { display: grid; gap: 11px; padding: 20px; }
        .tb-skeleton-body i { display: block; height: 11px; }
        .tb-skeleton-media div::after, .tb-skeleton-body i::after {
          content: ""; position: absolute; inset: 0; transform: translateX(-100%);
          background: linear-gradient(90deg,transparent,rgba(255,255,255,.35),transparent); animation: tb-shimmer 1.4s infinite;
        }
        .tb-feat-skeleton { height: 300px; margin-bottom: 56px; border-radius: 26px; border: 1px solid var(--tb-border); background: var(--tb-surface); position: relative; overflow: hidden; }
        .tb-feat-skeleton::after { content: ""; position: absolute; inset: 0; transform: translateX(-100%); background: linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent); animation: tb-shimmer 1.4s infinite; }

        /* empty */
        .tb-empty {
          display: flex; flex-direction: column; align-items: center; text-align: center; padding: 56px 24px;
          border-radius: 22px; border: 1px dashed var(--tb-border); background: var(--tb-surface);
        }
        .tb-empty-icon { display: grid; place-items: center; width: 62px; height: 62px; border-radius: 18px; background: var(--tb-soft); color: var(--tb-orange); animation: tb-float 4s ease-in-out infinite; }
        .tb-empty h3 { margin: 18px 0 0; font-size: 19px; font-weight: 850; }
        .tb-empty p { max-width: 360px; margin: 8px 0 22px; font-size: 13px; line-height: 1.7; color: var(--tb-muted); }

        /* support */
        .tb-support {
          position: relative; overflow: hidden; isolation: isolate; margin-top: 54px; padding: 38px;
          display: flex; align-items: center; justify-content: space-between; gap: 24px; border-radius: 26px; color: #fff;
          background: linear-gradient(120deg,#1C1917,#3B2214,#7C2D12,#1C1917); background-size: 300% 300%;
          animation: tb-gradient 12s ease infinite; box-shadow: 0 26px 60px rgba(124,45,18,.25);
        }
        .tb-support-ring { position: absolute; z-index: -1; border-radius: 50%; border: 1px dashed rgba(251,146,60,.35); pointer-events: none; }
        .tb-support-ring-1 { width: 360px; height: 360px; right: -100px; top: -160px; animation: tb-spin 32s linear infinite; }
        .tb-support-ring-2 { width: 220px; height: 220px; left: -70px; bottom: -110px; animation: tb-spin 24s linear infinite reverse; }
        .tb-support h3 { margin: 0; font-size: clamp(20px,2.4vw,28px); font-weight: 850; letter-spacing: -.04em; }
        .tb-support p { margin: 8px 0 0; font-size: 13px; line-height: 1.7; color: #D6CBC3; }
        .tb-support a { text-decoration: none; flex-shrink: 0; }

        /* back to top */
        .tb-top {
          position: fixed; right: 20px; bottom: 22px; z-index: 40; display: grid; place-items: center; width: 50px; height: 50px;
          border: 0; border-radius: 16px; color: #fff; background: linear-gradient(135deg,#F97316,#EA580C);
          box-shadow: 0 12px 28px rgba(249,115,22,.4);
        }
        .tb-top svg { animation: tb-updown 1.6s ease-in-out infinite; }

        /* keyframes */
        @keyframes tb-spin { to { transform: rotate(360deg); } }
        @keyframes tb-wave { to { transform: translateX(-50%); } }
        @keyframes tb-wheel { 0% { transform: translateY(0); opacity: 1; } 70% { transform: translateY(12px); opacity: 0; } 100% { opacity: 0; } }
        @keyframes tb-pop { 0%,100% { transform: scale(1); } 40% { transform: scale(1.14) rotate(-2deg); } }
        @keyframes tb-open { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
        @keyframes tb-spin-c { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes tb-float { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-14px) rotate(6deg); } }
        @keyframes tb-bob { 0%,100% { translate: 0 0; } 50% { translate: 0 -12px; } }
        @keyframes tb-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px,30px) scale(1.12); } }
        @keyframes tb-shine { to { background-position: 250% center; } }
        @keyframes tb-marquee { to { transform: translateX(-50%); } }
        @keyframes tb-shimmer { to { transform: translateX(100%); } }
        @keyframes tb-gradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes tb-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes tb-updown { 0%,100% { transform: translateY(2px); } 50% { transform: translateY(-4px); } }
        @keyframes tb-rise { 0% { transform: translateY(40px) scale(.6); opacity: 0; } 15% { opacity: .8; } 100% { transform: translateY(-420px) scale(1.2); opacity: 0; } }

        /* responsive */
        @media (max-width: 1000px) {
          .tb-hero-grid { grid-template-columns: 1fr; gap: 36px; }
          .tb-fan-wrap { min-height: 340px; }
          .tb-fan { height: 340px; }
          .tb-featured { grid-template-columns: 1fr; padding: 26px; gap: 26px; }
        }
        @media (max-width: 640px) {
          .tb-shell { width: min(1240px, calc(100% - 28px)); }
          .tb-hero { padding: 96px 0 78px; }
          .tb-cue { display: none; }
          .tb-faq { margin-top: 52px; }
          .tb-main { padding-top: 44px; }
          .tb-toolbar { top: 62px; padding: 10px; border-radius: 15px; }
          .tb-icon-btn span.tb-label { display: none; }
          .tb-icon-btn { padding: 0 13px; }
          .tb-filter-grid { grid-template-columns: 1fr; }
          .tb-grid { grid-template-columns: 1fr; gap: 18px; }
          .tb-card-list { flex-direction: column; }
          .tb-card-list .tb-card-media { width: 100%; height: 240px; }
          .tb-support { flex-direction: column; align-items: flex-start; padding: 28px 22px; }
          .tb-support a, .tb-hero-actions .tb-btn, .tb-hero-actions .tb-btn-ghost { width: 100%; justify-content: center; }
          .tb-featured-actions .tb-btn { width: 100%; }
          .tb-fan-wrap { min-height: 300px; }
          .tb-fan { height: 300px; }
          .tb-top { right: 14px; bottom: 16px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tb-root *, .tb-root *::before, .tb-root *::after {
            animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important;
          }
          .tb-ticker-track { animation: none; }
        }
      `}</style>

      <motion.div
        className="tb-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <main className="tb-root" data-theme={isDark ? "dark" : "light"}>
        {/* ===================================== */}
        {/* HERO                                  */}
        {/* ===================================== */}

        <section
          className="tb-hero"
          ref={heroRef}
          aria-labelledby="tb-title"
          onMouseMove={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            event.currentTarget.style.setProperty("--hx", `${event.clientX - rect.left}px`);
            event.currentTarget.style.setProperty("--hy", `${event.clientY - rect.top}px`);
          }}
        >
          <div className="tb-hero-bg" aria-hidden="true">
            <motion.div className="tb-blob tb-blob-a" style={{ y: blobY }} />
            <motion.div className="tb-blob tb-blob-b" style={{ y: blobY2 }} />
            <div className="tb-dots" />
            <div className="tb-hero-glow" />

            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="tb-spark"
                style={{
                  left: `${(i * 37 + 8) % 96}%`,
                  bottom: `${(i * 13) % 30}%`,
                  animationDelay: `${(i % 7) * -1.3}s`,
                  animationDuration: `${7 + (i % 5)}s`,
                }}
              />
            ))}
          </div>

          <div className="tb-shell tb-hero-grid">
            <motion.div style={{ y: copyY, opacity: heroFade }}>
              <motion.span
                className="tb-badge"
                initial={{ opacity: 0, y: -14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <BookOpen size={13} />
                Target Trek Library
              </motion.span>

              <h1 id="tb-title">
                <SplitWords text="Learn. Build." />
                <br />
                <SplitWords
                  text="Level up."
                  className="tb-accent"
                  delay={0.4}
                />
              </h1>

              <motion.p
                className="tb-hero-copy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.75, ease: EASE }}
              >
                Practical ebooks for System Design (HLD), Java LLD,
                Google ADK, RAG, MCP and GenAI &mdash; written for
                software engineers preparing for interviews and real
                projects.
              </motion.p>

              <motion.div
                className="tb-hero-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
              >
                <motion.button
                  type="button"
                  className="tb-btn"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => pickPath("")}
                >
                  Browse all books
                  <ArrowRight size={16} />
                </motion.button>

                <motion.button
                  type="button"
                  className="tb-btn-ghost"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => pickPath("system design")}
                >
                  <Layers3 size={16} />
                  System Design
                </motion.button>
              </motion.div>

              {!loading && !error && books.length > 0 && (
                <Stagger className="tb-stats" gap={0.1} delay={0.2}>
                  {stats.map((stat) => (
                    <motion.div
                      className="tb-stat"
                      variants={rise}
                      key={stat.label}
                    >
                      <strong>
                        <Counter to={stat.value} />
                      </strong>
                      <span>{stat.label}</span>
                    </motion.div>
                  ))}
                </Stagger>
              )}
            </motion.div>

            <motion.div style={{ y: fanY, scale: fanScale }}>
              <HeroFan books={fanBooks} />
            </motion.div>
          </div>

          <div className="tb-cue" aria-hidden="true">
            <span className="tb-cue-mouse" />
            Scroll
          </div>

          <div className="tb-wave" aria-hidden="true">
            <svg viewBox="0 0 2880 60" preserveAspectRatio="none">
              <path d="M0 30C180 60 360 0 540 30S900 60 1080 30 1260 0 1440 30V60H0Z" />
              <path transform="translate(1440 0)" d="M0 30C180 60 360 0 540 30S900 60 1080 30 1260 0 1440 30V60H0Z" />
            </svg>
            <svg viewBox="0 0 2880 60" preserveAspectRatio="none">
              <path d="M0 40C240 10 480 60 720 35S1200 10 1440 40V60H0Z" />
              <path transform="translate(1440 0)" d="M0 40C240 10 480 60 720 35S1200 10 1440 40V60H0Z" />
            </svg>
          </div>
        </section>

        {/* ===================================== */}
        {/* TOPIC TICKER                          */}
        {/* ===================================== */}

        <div className="tb-ticker" aria-hidden="true">
          <div className="tb-ticker-track">
            {[...TICKER, ...TICKER].map((item, index) => (
              <span className="tb-ticker-item" key={`${item}-${index}`}>
                <i />
                {item}
              </span>
            ))}
          </div>

          <div className="tb-ticker-track tb-ticker-rev">
            {[...TICKER].reverse().concat([...TICKER].reverse()).map((item, index) => (
              <span className="tb-ticker-item" key={`r-${item}-${index}`}>
                <i />
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="tb-shell tb-main">
          {/* ===================================== */}
          {/* API ERROR                             */}
          {/* ===================================== */}

          {error && (
            <div className="tb-error" role="alert">
              <div>
                <b>Unable to load books</b>
                <p>{error}</p>
              </div>

              <button
                type="button"
                onClick={() => setRetryCount((n) => n + 1)}
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}

          {/* ===================================== */}
          {/* LOADING FEATURED BOOK                 */}
          {/* ===================================== */}

          {loading && <div className="tb-feat-skeleton" />}

          {/* ===================================== */}
          {/* FEATURED HLD BOOK FIRST               */}
          {/* ===================================== */}

          {!loading && !error && featuredBook && (
            <FeaturedBook book={featuredBook} />
          )}

          {/* ===================================== */}
          {/* FILTERABLE CATALOG                    */}
          {/* ===================================== */}

          {!error && (
            <section
              id="library"
              aria-labelledby="tb-library-title"
              style={{ scrollMarginTop: 90 }}
            >
              <Reveal>
                <div className="tb-lib-head">
                  <div>
                    <div className="tb-kicker">
                      <i />
                      Book collection
                    </div>

                    <h2 id="tb-library-title">
                      <ScrollWords text="Explore all books" />
                    </h2>

                    <p>
                      Search and find the right guide for your next
                      goal.
                    </p>
                  </div>
                </div>
              </Reveal>

              {/* STICKY TOOLBAR */}

              <div className="tb-toolbar">
                <div className="tb-toolbar-row">
                  <div className="tb-search">
                    <Search size={19} className="tb-search-icon" />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={`Search ${SEARCH_EXAMPLES[placeholderIndex]}...`}
                      aria-label="Search books"
                    />

                    {search && (
                      <button
                        type="button"
                        className="tb-search-clear"
                        onClick={() => setSearch("")}
                        aria-label="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    className="tb-icon-btn"
                    onClick={() => setShowFilters((v) => !v)}
                    aria-expanded={showFilters}
                  >
                    <SlidersHorizontal size={16} />
                    <span className="tb-label">Filters</span>
                    {hasFilters && <span className="tb-dot" />}
                  </button>

                  <div className="tb-view">
                    {[
                      { id: "grid", icon: Grid2X2, label: "Grid view" },
                      { id: "list", icon: List, label: "List view" },
                    ].map((option) => {
                      const Icon = option.icon;

                      return (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => setView(option.id)}
                          aria-label={option.label}
                          aria-pressed={view === option.id}
                        >
                          {view === option.id && (
                            <motion.span
                              layoutId="tb-view-pill"
                              className="tb-view-pill"
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30,
                              }}
                            />
                          )}
                          <Icon size={16} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <nav className="tb-chips" aria-label="Book topics">
                  {QUICK_FILTERS.map((item) => {
                    const active = search.toLowerCase() === item.value;

                    return (
                      <motion.button
                        type="button"
                        key={item.label}
                        className="tb-chip"
                        aria-pressed={active}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setSearch(item.value);
                          setCategory("");
                          setResourceType("");
                        }}
                      >
                        {active && (
                          <motion.span
                            layoutId="tb-chip-pill"
                            className="tb-chip-pill"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 32,
                            }}
                          />
                        )}
                        <span className="tb-chip-label">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </nav>

                <AnimatePresence initial={false}>
                  {showFilters && (
                    <motion.div
                      key="filters"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="tb-filters">
                        <div className="tb-filters-head">
                          <h3>
                            <Filter size={15} />
                            Refine your results
                          </h3>

                          {hasFilters && (
                            <button
                              type="button"
                              className="tb-link-btn"
                              onClick={clearFilters}
                            >
                              Reset filters
                            </button>
                          )}
                        </div>

                        <div className="tb-filter-grid">
                          <FilterSelect
                            value={category}
                            onChange={setCategory}
                            options={categories}
                            placeholder="All categories"
                          />

                          <FilterSelect
                            value={resourceType}
                            onChange={setResourceType}
                            options={resourceTypes.map((type) => ({
                              value: type,
                              label: getResourceType(type),
                            }))}
                            placeholder="All formats"
                          />

                          <FilterSelect
                            value={sort}
                            onChange={setSort}
                            options={[
                              { value: "featured", label: "Featured first" },
                              { value: "price-low", label: "Price: Low to high" },
                              { value: "price-high", label: "Price: High to low" },
                              { value: "title", label: "Title: A to Z" },
                            ]}
                            placeholder="Recommended order"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RESULT COUNT */}

              {!loading && (
                <div className="tb-count">
                  <p style={{ margin: 0 }}>
                    Showing <b>{catalogBooks.length}</b>{" "}
                    {catalogBooks.length === 1 ? "resource" : "resources"}
                  </p>

                  {hasFilters && (
                    <button
                      type="button"
                      className="tb-link-btn"
                      onClick={clearFilters}
                    >
                      <X size={13} />
                      Clear all
                    </button>
                  )}
                </div>
              )}

              {/* LOADING GRID */}

              {loading && (
                <div className="tb-grid">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <BookSkeleton key={index} />
                  ))}
                </div>
              )}

              {/* LIVE BOOK GRID */}

              {!loading && catalogBooks.length > 0 && (
                <motion.div
                  layout
                  className={cn(
                    "tb-grid",
                    view === "list" && "tb-grid-list"
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {catalogBooks.map((book, index) => (
                      <BookCard
                        key={getBookId(book)}
                        book={book}
                        view={view}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* EMPTY SEARCH */}

              {!loading && catalogBooks.length === 0 && hasFilters && (
                <motion.div
                  className="tb-empty"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <div className="tb-empty-icon">
                    <Search size={26} />
                  </div>

                  <h3>No matching books found</h3>

                  <p>
                    Try another keyword or remove some filters to
                    explore more resources.
                  </p>

                  <motion.button
                    type="button"
                    className="tb-btn"
                    onClick={clearFilters}
                    whileHover={{ scale: 1.06 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Show all books
                  </motion.button>
                </motion.div>
              )}

              {/* EMPTY CATALOG */}

              {!loading && !error && books.length === 0 && (
                <div className="tb-empty">
                  <div className="tb-empty-icon">
                    <BookOpen size={26} />
                  </div>

                  <h3>No books available yet</h3>

                  <p>Published resources will appear here.</p>
                </div>
              )}
            </section>
          )}

          {/* ===================================== */}
          {/* FAQ (crawlable <details>)             */}
          {/* ===================================== */}

          <section className="tb-faq" aria-labelledby="tb-faq-title">
            <Reveal>
              <div className="tb-lib-head">
                <div>
                  <div className="tb-kicker">
                    <i />
                    Good to know
                  </div>

                  <h2 id="tb-faq-title">
                    <ScrollWords text="Questions about our books" />
                  </h2>
                </div>
              </div>
            </Reveal>

            <Stagger className="tb-faq-list" gap={0.08}>
              {FAQS.map((faq) => (
                <motion.details
                  className="tb-faq-item"
                  variants={rise}
                  key={faq.question}
                >
                  <summary>
                    {faq.question}
                    <ChevronDown size={18} />
                  </summary>

                  <p>{faq.answer}</p>
                </motion.details>
              ))}
            </Stagger>
          </section>

          {/* ===================================== */}
          {/* SUPPORT                               */}
          {/* ===================================== */}

          {!loading && !error && books.length > 0 && (
            <motion.div
              className="tb-support"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.85, ease: EASE }}
            >
              <span className="tb-support-ring tb-support-ring-1" aria-hidden="true" />
              <span className="tb-support-ring tb-support-ring-2" aria-hidden="true" />

              <div>
                <h3>Need help choosing a book?</h3>

                <p>Reach out for ebook, access, or purchase support.</p>
              </div>

              <motion.a
                href="mailto:supporttargettrek@gmail.com"
                className="tb-btn"
                whileHover={{ scale: 1.07, rotate: -1.5 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact support
                <ArrowUpRight size={15} />
              </motion.a>
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            className="tb-top"
            aria-label="Back to top"
            initial={{ opacity: 0, scale: 0.4, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.4, rotate: 90 }}
            whileHover={{ scale: 1.12, rotate: 8 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              window.scrollTo({ top: 0, behavior: "smooth" })
            }
          >
            <ArrowUp size={20} />
          </motion.button>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
