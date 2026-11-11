import React, {
  useCallback,
  useEffect,
  useId,
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
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";

import {
  ArrowClockwise,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BellRinging,
  BookOpen,
  BookOpenText,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  Cloud,
  Coffee,
  Cpu,
  CreditCard,
  Database,
  EnvelopeSimple,
  Gift,
  Graph,
  HardDrives,
  Lightbulb,
  Lightning,
  LockKey,
  MagnifyingGlass,
  Package,
  Rows,
  ShareNetwork,
  ShoppingBagOpen,
  SlidersHorizontal,
  Sparkle,
  SquaresFour,
  Sword,
  X,
} from "@phosphor-icons/react";

import BASE_URL from "../utils/Url";
import { describeOffer } from "./bundleRules";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import { usePacks } from "./PackSections";

// =======================================================
// EXISTING WEBSITE CONFIGURATION
// =======================================================

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/books`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE = "System Design, Java & GenAI Ebooks (PDF) | Target Trek";

const SEO_DESCRIPTION =
  "Explore practical ebooks on System Design HLD, Java LLD, Google ADK, RAG, MCP, GenAI, and backend engineering from Target Trek.";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700&display=swap";

// Base motion curve: weighted, decelerates into place.
const EASE = [0.22, 1, 0.36, 1];

// The two pack pages. Used to recognise packs inside the books list.
const PACK_PATHS = ["/book/all-books", "/book/life-type-combo"];
const LIFETIME_PATH = "/book/life-type-combo";

const SEARCH_EXAMPLES = [
  "System Design HLD",
  "Java LLD",
  "Google ADK",
  "RAG",
  "MCP",
  "Spring Boot",
  "SQL",
];

const SORTS = [
  { value: "", label: "Recommended" },
  { value: "price-low", label: "Price: low to high" },
  { value: "price-high", label: "Price: high to low" },
  { value: "discount", label: "Biggest discount" },
  { value: "title", label: "Title: A to Z" },
];

const TRUST = [
  {
    icon: CreditCard,
    title: "One time payment",
    text: "Pay once per book or pack. No subscription.",
  },
  {
    icon: LockKey,
    title: "Secure access link",
    text: "Sent to you after a successful payment.",
  },
  {
    icon: BookOpenText,
    title: "Built in reader",
    text: "Read your ebook on the Target Trek website.",
  },
  {
    icon: EnvelopeSimple,
    title: "Help by email",
    text: "Purchase and access support when you need it.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Pick a book or a pack",
    text: "Search the shelf, compare prices and press Buy now on the one you want.",
  },
  {
    n: "02",
    title: "Pay once",
    text: "Enter your name and email at checkout and complete the payment. Coupons can be applied there.",
  },
  {
    n: "03",
    title: "Start reading",
    text: "You receive a secure access link and read the book in the built in reader on Target Trek.",
  },
];

const TAGLINE =
  "One clear book beats ten open tabs. Pick the topic you keep postponing and finish it this week.";

const FAQS = [
  {
    question: "Which Target Trek book should I start with?",
    answer:
      "For architecture, scalability and system design interviews start with the System Design HLD book. For object oriented design in Java choose the LLD book. For AI engineering, explore the Google ADK, RAG and MCP guides.",
  },
  {
    question: "What is the difference between HLD and LLD?",
    answer:
      "HLD (high level design) covers scalable architecture, APIs, databases, caching and distributed systems. LLD (low level design) covers classes, interfaces, UML, design patterns and Java implementation.",
  },
  {
    question: "How do I read the ebooks after buying?",
    answer:
      "Our books are digital ebooks. After a successful payment you receive a secure access link and can read the book in the built in reader on the Target Trek website.",
  },
  {
    question: "Is it a subscription?",
    answer:
      "No. Every book and every pack on this page is a one time payment. The price you see on the card is the price you pay at checkout, before any coupon you apply.",
  },
  {
    question: "Can I buy several books together?",
    answer:
      "Yes. A book pack gives you the books inside it in a single payment, and its card lists what is included. When bundle offers are running they are shown on this page as well.",
  },
  {
    question: "Are ebook purchases refundable?",
    answer:
      "Ebooks are digital products and purchases are final and non refundable, so please review the book details and our Refund Policy before buying.",
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
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

const money = (value, currency = "INR") => {
  if (value === null || value === undefined || value === "") {
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
    return new Intl.NumberFormat(localeMap[currency] || "en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: Number.isInteger(number) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(number);
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

const getSaving = (book) => {
  const price = Number(book?.price);
  const mrp = Number(book?.mrp);

  return Number.isFinite(price) && Number.isFinite(mrp) && mrp > price
    ? mrp - price
    : 0;
};

const getCoverUrl = (book) =>
  book?.coverPageUrl || book?.coverpageurl || book?.cover_page_url || "";

const getCategories = (book) => {
  if (Array.isArray(book?.categories)) {
    return book.categories.filter(Boolean);
  }

  if (book?.category) return [book.category];

  return [];
};

const getTags = (book) =>
  (Array.isArray(book?.tags) ? book.tags : [])
    .map((tag) => String(tag || "").trim())
    .filter(Boolean);

const getResourceType = (type) => {
  const types = {
    pdf: "PDF",
    ebook: "Ebook",
    course: "Course",
    bundle: "Bundle",
    template: "Template",
    notes: "Notes",
    other: "Digital product",
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

const getPath = (book) =>
  String(book?.redirectUrl || "")
    .trim()
    .replace(/\/+$/, "");

const isPackBook = (book) =>
  Boolean(book?.isPack || book?.plan) || PACK_PATHS.includes(getPath(book));

const isHLDBook = (book) => {
  const value = [book?.title, book?.slug, book?.redirectUrl, book?.subtitle]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    value.includes("/system-design/hld") ||
    value.includes("system-design-hld") ||
    value.includes("high-level design") ||
    (value.includes("system design") && /\bhld\b/.test(value))
  );
};

const getBookUrl = (book) => {
  const redirectUrl = book?.redirectUrl?.trim();

  if (!redirectUrl) return "";

  return redirectUrl.startsWith("http://") ||
    redirectUrl.startsWith("https://")
    ? redirectUrl
    : `${SITE_URL}${redirectUrl.startsWith("/") ? redirectUrl : `/${redirectUrl}`}`;
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const lower = (value) => String(value || "").toLowerCase();
const compact = (value) => lower(value).replace(/[^a-z0-9]+/g, "");

// Forgiving search: every word must match, in any order, and spacing does
// not matter ("spring boot" finds "Springboot", "hld" finds the HLD book).
const matchesQuery = (book, query) => {
  const text = lower(query).trim();
  if (!text) return true;

  const haystack = lower(
    [
      book?.title,
      book?.slug,
      book?.subtitle,
      book?.shortDescription,
      book?.description,
      book?.resourceType,
      book?.pageKey,
      book?.badge,
      getCategories(book).join(" "),
      getTags(book).join(" "),
    ]
      .filter(Boolean)
      .join(" ")
  );

  const squashed = compact(haystack);

  if (squashed.includes(compact(text))) return true;

  return text
    .split(/\s+/)
    .every((word) => haystack.includes(word) || squashed.includes(compact(word)));
};

const CATEGORY_ICONS = [
  ["system", Graph],
  ["java", Coffee],
  ["backend", HardDrives],
  ["cloud", Cloud],
  ["database", Database],
  ["sql", Database],
  ["genai", Sparkle],
  ["ai", Sparkle],
  ["operating", Cpu],
  ["network", ShareNetwork],
  ["core", ShareNetwork],
];

const getCategoryIcon = (name) => {
  const key = lower(name);
  const match = CATEGORY_ICONS.find(([needle]) => key.includes(needle));

  return match ? match[1] : BookOpen;
};

const scrollToId = (id) => {
  if (typeof document === "undefined") return;

  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
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

function Counter({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;

    const controls = animate(0, to, {
      duration: 1.2,
      ease: EASE,
      onUpdate: (latest) => setValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{value}</span>;
}

// One headline line sliding up out of a mask
function LineReveal({ children, delay = 0 }) {
  return (
    <span className="bk-line-mask">
      <motion.span
        className="bk-line"
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Words light up one at a time as the section scrolls into view
function TaglineReveal({ text }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const words = useMemo(() => text.split(" "), [text]);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 55%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.round(progress * words.length);

    setActive((current) => (next > current ? next : current));
  });

  return (
    <p className="heading-3 bk-tagline" ref={ref}>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <span
            className={cn(
              "bk-tagline-word",
              (reduced || index < active) && "is-on"
            )}
          >
            {word}
          </span>{" "}
        </React.Fragment>
      ))}
    </p>
  );
}

// Flat line grid drawn as SVG (no background gradients)
function GridPattern({ id, size = 32 }) {
  return (
    <svg className="bk-gridsvg" aria-hidden="true">
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          <path
            d={`M${size} 0H0V${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// Marks the searched words inside a title
function Highlight({ text, query }) {
  const words = String(query || "")
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 1)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

  if (!words.length || !text) return text || null;

  const parts = String(text).split(new RegExp(`(${words.join("|")})`, "ig"));

  return parts.map((part, index) =>
    index % 2 === 1 ? <mark key={index}>{part}</mark> : part
  );
}

// =======================================================
// BOOK COVER
// =======================================================

function BookCover({ book, className = "", priority = false, decorative = false }) {
  const [imageError, setImageError] = useState(false);

  const image = getCoverUrl(book);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  return (
    <div className={cn("bk-cover", className)}>
      {image && !imageError ? (
        <img
          src={image}
          alt={decorative ? "" : `${book?.title || "Ebook"} cover`}
          width="300"
          height="400"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          draggable="false"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="bk-cover-fallback">
          <span className="mono caption-4">
            <BookOpen size={16} weight="duotone" />
            TARGET TREK
          </span>

          <strong className="body-4">{book?.title || "Digital ebook"}</strong>
        </div>
      )}

      <span className="bk-cover-sweep" aria-hidden="true" />
    </div>
  );
}

// =======================================================
// PRICE + BUY
// =======================================================

function Price({ book, large = false }) {
  const discount = getDiscount(book);
  const saving = getSaving(book);
  const credits = Number(book?.matches) || 0;

  return (
    <div className={cn("bk-price", large && "is-large")}>
      <div className="bk-price-row">
        <strong className={cn("mono", large ? "heading-4" : "heading-6")}>
          {money(book?.price, book?.currency)}
        </strong>

        {saving > 0 && (
          <s className="mono body-6">{money(book?.mrp, book?.currency)}</s>
        )}

        {discount > 0 && (
          <span className="mono caption-3 bk-off">{discount}% off</span>
        )}
      </div>

      {(saving > 0 || credits > 0) && (
        <div className="bk-price-notes">
          {saving > 0 && (
            <span className="caption-4 bk-save">
              You save {money(saving, book?.currency)}
            </span>
          )}

          {credits > 0 && (
            <span
              className="caption-4 bk-credits"
              title="Prep Arena credits included. 1 credit = 1 match = 1 buddy partnership."
            >
              <Sword size={12} weight="bold" />
              {credits} Prep Arena {credits === 1 ? "credit" : "credits"}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function BuyButton({ book, onBuy, label = "Buy now", size = "md", className }) {
  return (
    <motion.button
      type="button"
      className={cn(
        size === "lg" ? "button-lg" : size === "sm" ? "button-sm" : "button-md",
        "bk-btn bk-btn-primary",
        className
      )}
      onClick={() => onBuy(book)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.4, ease: EASE }}
      aria-label={`${label}: ${book?.title || "this book"} for ${money(book?.price, book?.currency)}`}
    >
      <ShoppingBagOpen size={size === "sm" ? 16 : 18} weight="bold" />
      {label}
    </motion.button>
  );
}

// =======================================================
// HERO DECK: a cover flow that sells one book at a time
// =======================================================

function HeroDeck({ books, loading, onBuy }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = books.length;
  const safeIndex = count ? index % count : 0;
  const current = books[safeIndex];

  useEffect(() => {
    if (count < 2 || paused) return undefined;

    const timer = setInterval(() => {
      setIndex((value) => (value + 1) % count);
    }, 3400);

    return () => clearInterval(timer);
  }, [count, paused]);

  const step = (direction) =>
    setIndex((value) => (value + direction + count) % count);

  if (loading || !count) {
    return (
      <div className="bk-deck" aria-hidden="true">
        <div className="bk-deck-stage">
          <div className="bk-deck-card bk-skel" />
        </div>
      </div>
    );
  }

  const half = Math.floor(count / 2);

  return (
    <div
      className="bk-deck"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="bk-deck-stage">
        <div className="bk-deck-halo" aria-hidden="true" />

        {books.map((book, i) => {
          // signed distance from the front card
          const offset = ((i - safeIndex + count + half) % count) - half;
          const distance = Math.abs(offset);
          const front = offset === 0;

          return (
            <motion.button
              type="button"
              key={getBookId(book)}
              className="bk-deck-card"
              tabIndex={front ? -1 : distance > 2 ? -1 : 0}
              aria-hidden={distance > 2 || front}
              aria-label={`Show ${book.title}`}
              style={{ zIndex: 10 - distance, pointerEvents: distance > 2 ? "none" : "auto" }}
              initial={false}
              animate={{
                x: `${Math.max(-2.4, Math.min(2.4, offset)) * 38}%`,
                rotate: offset * 7,
                scale: 1 - distance * 0.14,
                opacity: distance > 2 ? 0 : 1,
              }}
              transition={{ duration: 0.7, ease: EASE }}
              onClick={() => setIndex(i)}
            >
              <BookCover book={book} priority={distance < 2} decorative />
            </motion.button>
          );
        })}
      </div>

      <div className="bk-deck-info">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={getBookId(current)}
            className="bk-deck-copy"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="caption-3 bk-kicker">
              {current.badge || getCategories(current)[0] || "Ebook"}
            </p>

            <BookLink book={current} className="title-2 bk-deck-title">
              {current.title}
            </BookLink>

            <Price book={current} />
          </motion.div>
        </AnimatePresence>

        <div className="bk-deck-actions">
          <BuyButton book={current} onBuy={onBuy} />

          {count > 1 && (
            <div className="bk-deck-nav">
              <button
                type="button"
                className="bk-icon-btn"
                onClick={() => step(-1)}
                aria-label="Previous book"
              >
                <CaretLeft size={16} weight="bold" />
              </button>

              <span className="mono caption-4" aria-live="polite">
                {String(safeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>

              <button
                type="button"
                className="bk-icon-btn"
                onClick={() => step(1)}
                aria-label="Next book"
              >
                <CaretRight size={16} weight="bold" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// =======================================================
// SEARCH FIELD (shared by the hero and the sticky toolbar)
// =======================================================

const SearchField = React.forwardRef(function SearchField(
  { value, onChange, onSubmit, placeholder, large = false, id, hint = false },
  ref
) {
  return (
    <form
      role="search"
      className={cn("bk-search", large && "is-large")}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <MagnifyingGlass size={20} weight="bold" className="bk-search-icon" />

      <input
        ref={ref}
        id={id}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.preventDefault();
            onChange("");
          }
        }}
        placeholder={placeholder}
        aria-label="Search books by title, topic or tag"
      />

      {value ? (
        <button
          type="button"
          className="bk-search-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={16} weight="bold" />
        </button>
      ) : (
        hint && (
          <kbd className="mono caption-4 bk-kbd" aria-hidden="true">
            /
          </kbd>
        )
      )}

      {large && (
        <button type="submit" className="button-md bk-btn bk-btn-primary">
          Search
        </button>
      )}
    </form>
  );
});

// =======================================================
// BOOK CARD
// =======================================================

const BookCard = React.forwardRef(function BookCard(
  { book, view, index, query, onBuy },
  ref
) {
  const pack = isPackBook(book);
  const category = getCategories(book)[0];
  const flag = pack ? "Pack" : book?.badge;

  return (
    <motion.article
      ref={ref}
      layout
      className={cn("bk-card", view === "list" && "is-row")}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25, ease: EASE } }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        delay: (index % 4) * 0.06,
        ease: EASE,
        layout: { duration: 0.5, ease: EASE },
      }}
    >
      <BookLink
        book={book}
        className="bk-card-media"
        aria-label={`View ${book?.title}`}
        tabIndex={-1}
      >
        <BookCover book={book} />

        {flag && <span className="caption-3 bk-flag">{flag}</span>}
      </BookLink>

      <div className="bk-card-body">
        <p className="caption-3 bk-kicker">
          {[category, getResourceType(book?.resourceType)]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <h3 className="title-3 bk-card-title">
          <BookLink book={book}>
            <Highlight text={book?.title} query={query} />
          </BookLink>
        </h3>

        {(book?.subtitle || book?.shortDescription) && (
          <p className="body-6 bk-card-sub">
            {book.subtitle || book.shortDescription}
          </p>
        )}

        <div className="bk-card-foot">
          <Price book={book} />

          <div className="bk-card-actions">
            <BuyButton
              book={book}
              onBuy={onBuy}
              size="sm"
              label={pack ? "Buy this pack" : "Buy now"}
            />

            <BookLink
              book={book}
              className="button-sm bk-btn bk-btn-outline"
              aria-label={`Details of ${book?.title}`}
            >
              Details
              <ArrowUpRight size={14} weight="bold" />
            </BookLink>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

function BookSkeleton() {
  return (
    <div className="bk-card bk-card-skel" aria-hidden="true">
      <div className="bk-card-media">
        <div className="bk-cover bk-skel" />
      </div>

      <div className="bk-card-body">
        <i className="bk-skel" style={{ width: "40%" }} />
        <i className="bk-skel" style={{ width: "90%", height: 20 }} />
        <i className="bk-skel" style={{ width: "60%" }} />
        <i className="bk-skel" style={{ width: "100%", height: 36, marginTop: 16 }} />
      </div>
    </div>
  );
}

// =======================================================
// PACKS: every book in one payment
// =======================================================

function PackPanel({ pack, worth, onBuy }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const lifetime = pack.plan === "lifetime";
  const credits = Number(pack.matches) || 0;
  const included = Array.isArray(pack.includedBooks) ? pack.includedBooks : [];
  const saving = getSaving(pack);
  const showWorth = Number(worth) > Number(pack.price);

  return (
    <motion.article
      variants={rise}
      className={cn("bk-pack", lifetime && "is-featured")}
    >
      <div className="bk-pack-head">
        <p className="caption-3 bk-kicker">
          {lifetime ? "Lifetime pack" : "All books pack"}
        </p>

        {(pack.badge || lifetime) && (
          <span className="caption-3 bk-pack-ribbon">
            {pack.badge || "Best value"}
          </span>
        )}
      </div>

      <h3 className="heading-5">{pack.title}</h3>

      {pack.subtitle && <p className="body-6 bk-muted">{pack.subtitle}</p>}

      {included.length > 0 && (
        <div className="bk-pack-covers" aria-hidden="true">
          {included.slice(0, 8).map((book, i) => (
            <span
              key={book._id || i}
              className="bk-pack-thumb"
              style={{ zIndex: 20 - i }}
            >
              {book.coverPageUrl ? (
                <img src={book.coverPageUrl} alt="" loading="lazy" />
              ) : (
                <BookOpen size={16} />
              )}
            </span>
          ))}

          {included.length > 8 && (
            <span className="mono caption-3 bk-pack-more">
              +{included.length - 8}
            </span>
          )}
        </div>
      )}

      <div className="bk-pack-price">
        <strong className="mono heading-3">{money(pack.price, pack.currency)}</strong>

        {saving > 0 && (
          <s className="mono body-3">{money(pack.mrp, pack.currency)}</s>
        )}

        <span className="caption-4 bk-muted">one time</span>
      </div>

      {showWorth && (
        <p className="caption-3 bk-save">
          Worth {money(worth, pack.currency)} if bought one by one
        </p>
      )}

      <ul className="bk-checks">
        <li className="body-6">
          <Check size={16} weight="bold" />
          <span>
            <b>
              {included.length > 0 ? `${included.length} books` : "All books"}
            </b>{" "}
            available today
          </span>
        </li>

        <li className="body-6">
          <BellRinging size={16} weight="bold" />
          <span>
            {lifetime
              ? "Every book we publish in future, emailed to you free"
              : "Email alert when a new book is published"}
          </span>
        </li>

        {credits > 0 && (
          <li className="body-6">
            <Sword size={16} weight="bold" />
            <span>
              {credits} Prep Arena {credits === 1 ? "credit" : "credits"} for
              mock interview partners
            </span>
          </li>
        )}

        {lifetime && (
          <li className="body-6">
            <Gift size={16} weight="bold" />
            <span>
              Free limited Prep Arena credits when we launch new features
            </span>
          </li>
        )}

        <li className="body-6">
          <Lightbulb size={16} weight="bold" />
          <span>Request or suggest new books inside Prep Arena</span>
        </li>

        {(pack.highlights || []).map((item) => (
          <li className="body-6" key={item}>
            <Check size={16} weight="bold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {included.length > 0 && (
        <div className="bk-inside">
          <button
            type="button"
            className="button-sm bk-inside-btn"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={panelId}
          >
            {open ? "Hide" : "See"} all {included.length} books inside
            <motion.span
              className="bk-inline-icon"
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <CaretDown size={14} weight="bold" />
            </motion.span>
          </button>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={panelId}
                key="panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{ overflow: "hidden" }}
              >
                <ul className="bk-inside-list">
                  {included.map((book, i) => (
                    <motion.li
                      key={book._id || i}
                      className="body-6"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: Math.min(i, 10) * 0.04,
                        ease: EASE,
                      }}
                    >
                      <Check size={14} weight="bold" />
                      {book.title}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <div className="bk-pack-actions">
        <BuyButton book={pack} onBuy={onBuy} size="lg" label="Buy this pack" />

        {pack.redirectUrl && (
          <BookLink book={pack} className="button-md bk-btn bk-btn-outline">
            Pack details
            <ArrowUpRight size={16} weight="bold" />
          </BookLink>
        )}
      </div>
    </motion.article>
  );
}

// Bundle offers (only rendered when at least one offer is running)
const offerDeal = (offer) => describeOffer(offer, offer.eligibleCount).line;

function OfferCard({ offers }) {
  if (!offers.length) return null;

  return (
    <Reveal>
      <aside className="bk-offer" aria-label="Bundle offers">
        <div>
          <p className="caption-3 bk-kicker">
            <Lightning size={14} weight="fill" /> Bundle offers
          </p>

          <h3 className="heading-6">Buy more books, pay less</h3>

          <p className="body-6 bk-muted">
            Pick your books and the offer price is applied automatically.
          </p>

          <ul className="bk-offer-pills">
            {offers.slice(0, 3).map((offer) => (
              <li className="mono caption-3" key={offer._id}>
                {offerDeal(offer)}
              </li>
            ))}

            {offers.length > 3 && (
              <li className="mono caption-3">+{offers.length - 3} more</li>
            )}
          </ul>
        </div>

        <Link to="/books/bundle-offers" className="button-md bk-btn bk-btn-outline">
          View offers
          <ArrowRight size={16} weight="bold" />
        </Link>
      </aside>
    </Reveal>
  );
}

// =======================================================
// SMALL PIECES
// =======================================================

function SectionHead({ index, eyebrow, title, text, id, children }) {
  return (
    <div className="bk-head">
      <div className="bk-head-main">
        <Reveal>
          <p className="caption-3 bk-eyebrow">
            <span className="mono">{index}</span>
            <motion.span
              className="bk-eyebrow-line"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            />
            {eyebrow}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="heading-3" id={id}>
            {title}
          </h2>
        </Reveal>

        {text && (
          <Reveal delay={0.16}>
            <p className="body-3 bk-muted bk-head-text">{text}</p>
          </Reveal>
        )}
      </div>

      {children}
    </div>
  );
}

function Chip({ active, onClick, children, count, layoutId }) {
  return (
    <button
      type="button"
      className={cn("button-sm bk-chip", active && "is-on")}
      aria-pressed={active}
      onClick={onClick}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="bk-chip-pill"
          transition={{ duration: 0.5, ease: EASE }}
        />
      )}

      <span className="bk-chip-label">
        {children}
        {count !== undefined && <span className="mono caption-4">{count}</span>}
      </span>
    </button>
  );
}

function FaqItem({ faq, index, open, onToggle }) {
  const panelId = `bk-faq-panel-${index}`;

  return (
    <motion.div variants={rise} className={cn("bk-faq-item", open && "is-open")}>
      <button
        type="button"
        className="title-3"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span>{faq.question}</span>

        <motion.span
          className="bk-inline-icon bk-accent"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <CaretDown size={16} weight="bold" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p className="body-6 bk-faq-answer">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState("");

  const [offers, setOffers] = useState([]);

  const [view, setView] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [barClosed, setBarClosed] = useState(false);

  // The book or pack currently in checkout (null = modal closed)
  const [product, setProduct] = useState(null);

  const { data: packData } = usePacks();

  const isDark = theme === "dark";

  const toolbarSearchRef = useRef(null);

  // =====================================================
  // SCROLL EFFECTS
  // =====================================================

  const { scrollY, scrollYProgress } = useScroll();

  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  useMotionValueEvent(scrollY, "change", (value) => {
    const next = value > 700;

    setScrolled((current) => (current === next ? current : next));
  });

  // rotating search placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((n) => (n + 1) % SEARCH_EXAMPLES.length);
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  // Press "/" anywhere to jump into search
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target;
      const typing =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

      if (typing) return;

      event.preventDefault();
      scrollToId("library");
      toolbarSearchRef.current?.focus({ preventScroll: true });
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Shareable searches: read ?q= and ?category= once, then keep them updated
  const urlReady = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("q")) setSearch(params.get("q"));
    if (params.get("category")) setCategory(params.get("category"));

    urlReady.current = true;
  }, []);

  useEffect(() => {
    if (!urlReady.current) return undefined;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);

      if (search.trim()) params.set("q", search.trim());
      else params.delete("q");

      if (category) params.set("category", category);
      else params.delete("category");

      const query = params.toString();
      const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;

      window.history.replaceState(window.history.state, "", next);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);

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
  // EXISTING APIS - UNCHANGED
  //
  // GET ${BASE_URL}/book             -> { success: true, data: [...] }
  // GET ${BASE_URL}/api/book-offers  -> running bundle offers
  // =====================================================

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${BASE_URL}/api/book-offers`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const list = Array.isArray(json?.data)
          ? json.data.filter((o) => o.available)
          : [];
        setOffers(list);
      })
      .catch(() => {}); // purely promotional: stay hidden on any error

    return () => controller.abort();
  }, []);

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

      setError(err?.message || "Something went wrong while loading books.");
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
  // DERIVED DATA (all numbers come from the live API)
  // =====================================================

  const singles = useMemo(() => books.filter((book) => !isPackBook(book)), [books]);

  // Packs: the packs API when available, otherwise the pack rows in the list
  const packs = useMemo(() => {
    if (Array.isArray(packData?.packs) && packData.packs.length) {
      return packData.packs;
    }

    return books.filter(isPackBook).map((book) => ({
      ...book,
      plan: book.plan || (getPath(book) === LIFETIME_PATH ? "lifetime" : "all"),
    }));
  }, [packData, books]);

  const packWorth = Number(packData?.stats?.individualWorth) || 0;
  const packsFromApi = Boolean(packData?.packs?.length);
  const anyCredits = packs.some((pack) => Number(pack.matches) > 0);
  const hasLifetime = packs.some((pack) => pack.plan === "lifetime");

  const cheapestPack = useMemo(
    () =>
      [...packs].sort((a, b) => Number(a.price) - Number(b.price))[0] || null,
    [packs]
  );

  const categoryStats = useMemo(() => {
    const map = new Map();

    for (const book of singles) {
      for (const name of getCategories(book)) {
        const entry = map.get(name) || { name, count: 0, from: Infinity, covers: [] };

        entry.count += 1;
        entry.from = Math.min(entry.from, Number(book.price) || Infinity);
        if (getCoverUrl(book)) entry.covers.push(book);

        map.set(name, entry);
      }
    }

    return [...map.values()].sort(
      (a, b) => b.count - a.count || a.name.localeCompare(b.name)
    );
  }, [singles]);

  // Tags set by admin on each book, most used first
  const tagOptions = useMemo(() => {
    const counts = new Map();

    for (const book of books) {
      const seen = new Set();

      for (const label of getTags(book)) {
        const key = label.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const prev = counts.get(key);
        counts.set(key, {
          label: prev?.label || label,
          key,
          count: (prev?.count || 0) + 1,
        });
      }
    }

    return [...counts.values()].sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label)
    );
  }, [books]);

  // Hero deck: the HLD book first, then featured books, then the rest
  const featuredBook = useMemo(
    () =>
      singles.find(isHLDBook) ||
      singles.find((book) => book.isFeatured) ||
      singles[0] ||
      null,
    [singles]
  );

  const deckBooks = useMemo(() => {
    if (!featuredBook) return [];

    const id = getBookId(featuredBook);
    const rest = singles.filter((book) => getBookId(book) !== id);

    return [
      featuredBook,
      ...rest.filter((book) => book.isFeatured),
      ...rest.filter((book) => !book.isFeatured),
    ].slice(0, 7);
  }, [singles, featuredBook]);

  const stats = useMemo(() => {
    const prices = singles
      .map((book) => Number(book.price))
      .filter((price) => Number.isFinite(price) && price > 0);

    return {
      count: singles.length,
      topics: categoryStats.length,
      from: prices.length ? Math.min(...prices) : 0,
      maxOff: singles.reduce((max, book) => Math.max(max, getDiscount(book)), 0),
    };
  }, [singles, categoryStats]);

  // =====================================================
  // FILTERS & SORTING
  // =====================================================

  const filteredBooks = useMemo(() => {
    const wanted = lower(category);

    const result = books.filter((book) => {
      const matchesCategory =
        !wanted || getCategories(book).some((name) => lower(name) === wanted);

      const matchesTag =
        !tag || getTags(book).some((label) => label.toLowerCase() === tag);

      return matchesCategory && matchesTag && matchesQuery(book, search);
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") {
        return Number(a?.price ?? 0) - Number(b?.price ?? 0);
      }

      if (sort === "price-high") {
        return Number(b?.price ?? 0) - Number(a?.price ?? 0);
      }

      if (sort === "discount") {
        return getDiscount(b) - getDiscount(a);
      }

      if (sort === "title") {
        return String(a?.title || "").localeCompare(String(b?.title || ""));
      }

      return 0;
    });
  }, [books, search, category, tag, sort]);

  const hasFilters = Boolean(search.trim() || category || tag || sort);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setTag("");
    setSort("");
  };

  const pickCategory = (name) => {
    setCategory(name);
    setTag("");
    setSearch("");

    requestAnimationFrame(() => scrollToId("library"));
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
  const ready = !loading && !error && books.length > 0;
  const showBar = scrolled && !barClosed && !product && Boolean(cheapestPack);

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
        <link rel="stylesheet" href={FONT_URL} />

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
        .bkRoot {
          --bg: #FAF9F6;
          --surface: #FFFFFF;
          --surface-2: #F3F0EB;
          --text: #131209;
          --muted: #5F5852;
          --subtle: #8A8179;
          --border: #E5DFD7;
          --accent: #EA580C;
          --accent-text: #C2410C;
          --accent-soft: #FFF0E4;
          --accent-line: #FDBA74;
          --btn-bg: #C2410C;
          --btn-bg-hover: #9A3412;
          --btn-text: #FFFFFF;
          --ok: #15803D;
          --ok-soft: #E8F5EC;
          --mark: #FFE2B8;
          --panel: #131209;
          --panel-border: #313131;
          --panel-text: #FAF8F5;
          --panel-muted: #A8A29E;
          --h-from: #000000;
          --h-to: #666666;
          --shadow: 0 24px 48px rgba(19,18,9,.08);
          --shadow-book: 0 16px 32px rgba(19,18,9,.22);
          --ease: cubic-bezier(0.22,1,0.36,1);

          min-height: 100vh;
          width: 100%;
          overflow-x: clip;
          background: var(--bg);
          color: var(--text);
          font-family: "Manrope", ui-sans-serif, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background-color .3s var(--ease), color .3s var(--ease);
        }

        .bkRoot[data-theme="dark"] {
          --bg: #131209;
          --surface: #181818;
          --surface-2: #1F1F1F;
          --text: #FAF8F5;
          --muted: #B5ACA5;
          --subtle: #8D827A;
          --border: #313131;
          --accent: #FB923C;
          --accent-text: #FB923C;
          --accent-soft: #272727;
          --accent-line: #7C4A22;
          --btn-bg: #FB923C;
          --btn-bg-hover: #FDBA74;
          --btn-text: #131209;
          --ok: #4ADE80;
          --ok-soft: #272727;
          --mark: #7C4A22;
          --panel: #000000;
          --h-from: #FFFFFF;
          --h-to: #9B9B9B;
          --shadow: 0 24px 48px rgba(0,0,0,.4);
          --shadow-book: 0 16px 32px rgba(0,0,0,.6);
          color-scheme: dark;
        }

        .bkRoot *, .bkRoot *::before, .bkRoot *::after { box-sizing: border-box; }
        .bkRoot a { color: inherit; text-decoration: none; }
        .bkRoot button, .bkRoot input, .bkRoot select { font: inherit; color: inherit; }
        .bkRoot button { cursor: pointer; -webkit-tap-highlight-color: transparent; }
        .bkRoot :where(h1, h2, h3, h4, p, ul) { margin: 0; padding: 0; }
        .bkRoot ul { list-style: none; }
        .bkRoot :where(h1, h2, h3, h4) { text-wrap: balance; letter-spacing: -.02em; }
        .bkRoot p { text-wrap: pretty; }
        .bkRoot s { color: var(--subtle); }
        .bkRoot mark { background: var(--mark); color: inherit; border-radius: 2px; padding: 0 2px; }
        .bkRoot a:focus-visible, .bkRoot button:focus-visible, .bkRoot select:focus-visible {
          outline: 2px solid var(--accent); outline-offset: 2px;
        }

        /* ---------- text styles ---------- */
        .bkRoot .mono { font-family: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; letter-spacing: 0; }
        .bkRoot .heading-1 { font-size: 36px; line-height: 40px; font-weight: 600; }
        .bkRoot .heading-3 { font-size: 30px; line-height: 36px; font-weight: 600; }
        .bkRoot .heading-4 { font-size: 30px; line-height: 36px; font-weight: 600; }
        .bkRoot .heading-5 { font-size: 24px; line-height: 32px; font-weight: 600; }
        .bkRoot .heading-6 { font-size: 20px; line-height: 28px; font-weight: 600; }
        .bkRoot .title-2 { font-size: 18px; line-height: 28px; font-weight: 500; }
        .bkRoot .title-3 { font-size: 16px; line-height: 24px; font-weight: 500; }
        .bkRoot .body-3 { font-size: 16px; line-height: 24px; font-weight: 400; }
        .bkRoot .body-4 { font-size: 14px; line-height: 20px; font-weight: 600; }
        .bkRoot .body-6 { font-size: 14px; line-height: 20px; font-weight: 400; }
        .bkRoot .button-lg { font-size: 18px; line-height: 28px; font-weight: 600; }
        .bkRoot .button-md { font-size: 16px; line-height: 24px; font-weight: 600; }
        .bkRoot .button-sm { font-size: 14px; line-height: 20px; font-weight: 600; }
        .bkRoot .caption-3 { font-size: 12px; line-height: 16px; font-weight: 600; }
        .bkRoot .caption-4 { font-size: 12px; line-height: 16px; font-weight: 500; }
        @media (min-width: 768px) {
          .bkRoot .heading-1 { font-size: 48px; line-height: 48px; }
          .bkRoot .heading-3 { font-size: 36px; line-height: 40px; }
        }
        @media (min-width: 1280px) { .bkRoot .heading-1 { font-size: 60px; line-height: 60px; } }

        /* ---------- layout ---------- */
        .bk-shell { width: min(1240px, calc(100% - 32px)); margin: 0 auto; }
        .bk-section { padding: 64px 0; position: relative; }
        @media (min-width: 768px) {
          .bk-shell { width: min(1240px, calc(100% - 48px)); }
          .bk-section { padding: 96px 0; }
        }
        .bk-alt { background: var(--surface-2); }
        .bk-muted { color: var(--muted); }
        .bk-accent { color: var(--accent-text); }
        .bk-inline-icon { display: inline-grid; place-items: center; flex-shrink: 0; }
        .bk-gridsvg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }

        .bk-progress {
          position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 9999;
          transform-origin: 0 50%; background: #F97316;
        }

        .bk-kicker {
          display: inline-flex; align-items: center; gap: 4px;
          color: var(--accent-text); text-transform: uppercase; letter-spacing: .1em;
        }

        .bk-skel { position: relative; overflow: hidden; background: var(--surface-2); border-radius: 8px; }
        .bk-skel::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: var(--surface); opacity: .6; filter: blur(16px);
          animation: bk-shimmer 1.4s var(--ease) infinite;
        }

        /* ---------- buttons ---------- */
        .bk-btn {
          position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 8px 12px; border-radius: 8px; border: 1px solid transparent; white-space: nowrap;
          transition: background-color .3s var(--ease), border-color .3s var(--ease), color .3s var(--ease);
        }
        .bk-btn svg { flex-shrink: 0; transition: transform .5s var(--ease); }
        .bk-btn-primary { background: var(--btn-bg); color: var(--btn-text) !important; }
        .bk-btn-primary:hover { background: var(--btn-bg-hover); }
        .bk-btn-primary:hover svg { transform: translateY(-2px) rotate(-8deg); }
        .bk-btn-outline { background: var(--surface); border-color: var(--border); color: var(--text) !important; }
        .bk-btn-outline:hover { border-color: var(--accent); color: var(--accent-text) !important; }
        .bk-btn-outline:hover svg { transform: translate(2px, -2px); }
        .bk-btn-outline:active { transform: scale(.98); }

        .bk-icon-btn {
          display: grid; place-items: center; width: 40px; height: 40px; border-radius: 8px;
          background: var(--surface); border: 1px solid var(--border); color: var(--text);
          transition: border-color .3s var(--ease), color .3s var(--ease), transform .5s var(--ease);
        }
        .bk-icon-btn:hover { border-color: var(--accent); color: var(--accent-text); }
        .bk-icon-btn:active { transform: scale(.94); }

        .bk-text-link { display: inline-flex; align-items: center; gap: 8px; color: var(--accent-text) !important; background: none; border: 0; padding: 0; }
        .bk-text-link svg { transition: transform .5s var(--ease); }
        .bk-text-link:hover svg { transform: translateX(4px); }

        /* ---------- section heads ---------- */
        .bk-head { display: flex; flex-direction: column; gap: 24px; margin-bottom: 40px; }
        @media (min-width: 880px) { .bk-head { flex-direction: row; align-items: flex-end; justify-content: space-between; } }
        .bk-head-main { max-width: 680px; }
        .bk-eyebrow { display: flex; align-items: center; gap: 12px; color: var(--accent-text); text-transform: uppercase; letter-spacing: .12em; }
        .bk-eyebrow .mono { color: var(--subtle); }
        .bk-eyebrow-line { display: block; width: 24px; height: 2px; background: var(--accent); transform-origin: 0 50%; }
        .bk-head h2 { margin-top: 16px; }
        .bk-head-text { margin-top: 16px; }

        /* ---------- price ---------- */
        .bk-price-row { display: flex; align-items: baseline; flex-wrap: wrap; gap: 8px; }
        .bk-price-row strong { color: var(--text); }
        .bk-off { padding: 2px 8px; border-radius: 6px; background: var(--accent-soft); color: var(--accent-text); align-self: center; }
        .bk-price-notes { display: flex; flex-wrap: wrap; gap: 4px 12px; margin-top: 4px; }
        .bk-save { color: var(--ok); }
        .bk-credits { display: inline-flex; align-items: center; gap: 4px; color: var(--accent-text); }

        /* ---------- cover ---------- */
        .bk-cover {
          position: relative; aspect-ratio: 3 / 4; overflow: hidden;
          border-radius: 4px 8px 8px 4px; background: var(--panel);
          box-shadow: var(--shadow-book);
        }
        .bk-cover::before {
          content: ""; position: absolute; z-index: 2; left: 0; top: 0; bottom: 0; width: 6px;
          background: #000; opacity: .18; pointer-events: none;
        }
        .bk-cover img { display: block; width: 100%; height: 100%; object-fit: cover; -webkit-user-drag: none; user-select: none; }
        .bk-cover-fallback {
          display: flex; flex-direction: column; justify-content: space-between; height: 100%;
          padding: 16px 12px 16px 16px; color: #FAF8F5;
        }
        .bk-cover-fallback span { display: inline-flex; align-items: center; gap: 4px; color: #FDBA74; letter-spacing: .08em; }
        .bk-cover-sweep {
          position: absolute; z-index: 3; top: -20%; bottom: -20%; left: 0; width: 40%;
          background: #fff; opacity: 0; transform: translateX(-160%) skewX(-18deg); pointer-events: none;
        }

        /* ---------- HERO ---------- */
        .bk-hero { position: relative; padding: 128px 0 64px; overflow: hidden; }
        @media (min-width: 768px) { .bk-hero { padding: 144px 0 96px; } }
        .bk-hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .bk-hero-bg .bk-gridsvg {
          color: var(--border);
          -webkit-mask-image: radial-gradient(ellipse at 72% 40%, #000 0%, transparent 70%);
          mask-image: radial-gradient(ellipse at 72% 40%, #000 0%, transparent 70%);
        }
        .bk-hero-grid { position: relative; display: grid; gap: 64px; align-items: center; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 1080px) { .bk-hero-grid { grid-template-columns: minmax(0,1.15fr) minmax(0,.85fr); gap: 48px; } }

        .bk-pill {
          display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 9999px;
          background: var(--surface); border: 1px solid var(--border); color: var(--muted);
        }
        .bk-pill b { color: var(--accent-text); font-weight: 600; }
        .bk-ping { position: relative; width: 8px; height: 8px; border-radius: 9999px; background: #16A34A; }
        .bk-ping::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: #16A34A; animation: bk-ping 2s var(--ease) infinite; }

        .bk-hero-title { max-width: 680px; margin-top: 24px; letter-spacing: -.03em; }
        .bk-line-mask { display: block; overflow: hidden; padding-bottom: .14em; margin-bottom: -.14em; }
        .bk-line {
          display: block; width: fit-content;
          background-image: linear-gradient(90deg, var(--h-from), var(--h-to));
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
        }
        .bk-hero-sub { max-width: 680px; margin-top: 24px; color: var(--muted); }
        .bk-hero-search { max-width: 680px; margin-top: 32px; }
        .bk-hero-topics { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; max-width: 680px; margin-top: 16px; }
        .bk-hero-topics > span { color: var(--subtle); }
        .bk-topic {
          padding: 4px 12px; border-radius: 9999px; background: var(--surface); border: 1px solid var(--border); color: var(--muted);
          transition: border-color .3s var(--ease), color .3s var(--ease), transform .5s var(--ease);
        }
        .bk-topic:hover { border-color: var(--accent); color: var(--accent-text); transform: translateY(-2px); }
        .bk-topic:active { transform: scale(.96); }

        .bk-stats { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 24px; max-width: 680px; margin-top: 48px; }
        @media (min-width: 640px) { .bk-stats { grid-template-columns: repeat(4,minmax(0,1fr)); } }
        .bk-stat strong { display: block; color: var(--text); }
        .bk-stat > span { display: block; margin-top: 4px; color: var(--muted); }

        /* ---------- search field ---------- */
        .bk-search {
          position: relative; display: flex; align-items: center; gap: 8px; height: 48px; padding: 0 8px 0 16px;
          border-radius: 12px; background: var(--surface); border: 1px solid var(--border);
          transition: border-color .3s var(--ease), box-shadow .3s var(--ease);
        }
        .bk-search.is-large { height: 64px; border-radius: 16px; padding-right: 12px; box-shadow: var(--shadow); }
        .bk-search:focus-within { border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft); }
        .bk-search-icon { flex-shrink: 0; color: var(--subtle); transition: color .3s var(--ease), transform .5s var(--ease); }
        .bk-search:focus-within .bk-search-icon { color: var(--accent-text); transform: scale(1.1) rotate(-8deg); }
        .bk-search input {
          flex: 1; min-width: 0; height: 100%; border: 0; outline: 0; background: transparent; color: var(--text);
          font-size: 16px; line-height: 24px; font-weight: 500;
          -webkit-appearance: none; appearance: none;
        }
        .bk-search input::placeholder { color: var(--subtle); opacity: 1; }
        .bk-search input::-webkit-search-cancel-button, .bk-search input::-webkit-search-decoration { -webkit-appearance: none; display: none; }
        .bk-search-clear {
          display: grid; place-items: center; flex-shrink: 0; width: 32px; height: 32px; border-radius: 9999px;
          border: 0; background: var(--surface-2); color: var(--muted);
          transition: color .3s var(--ease), transform .5s var(--ease);
        }
        .bk-search-clear:hover { color: var(--accent-text); transform: rotate(90deg); }
        .bk-kbd { display: none; flex-shrink: 0; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface-2); color: var(--muted); }
        @media (hover: hover) and (min-width: 880px) { .bk-kbd { display: inline-block; } }

        /* ---------- hero deck ---------- */
        .bk-deck { width: 100%; max-width: 480px; margin: 0 auto; }
        .bk-deck-stage { position: relative; display: grid; place-items: center; height: 304px; }
        @media (min-width: 640px) { .bk-deck-stage { height: 384px; } }
        .bk-deck-halo {
          position: absolute; width: 320px; height: 320px; border-radius: 9999px;
          background: #F97316; opacity: .16; filter: blur(80px);
        }
        .bk-deck-card {
          position: absolute; width: 176px; padding: 0; border: 0; background: transparent; border-radius: 8px;
          transform-origin: 50% 100%; will-change: transform;
        }
        @media (min-width: 640px) { .bk-deck-card { width: 232px; } }
        .bk-deck-card.bk-skel { aspect-ratio: 3 / 4; position: relative; }
        .bk-deck-info {
          position: relative; margin-top: 24px; padding: 16px; border-radius: 16px;
          background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow);
        }
        .bk-deck-copy { min-height: 104px; }
        .bk-deck-title {
          display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;
          margin: 4px 0 8px; color: var(--text); transition: color .3s var(--ease);
        }
        .bk-deck-title:hover { color: var(--accent-text); }
        .bk-deck-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 16px; }
        .bk-deck-nav { display: flex; align-items: center; gap: 8px; color: var(--muted); }

        /* ---------- trust strip ---------- */
        .bk-trust { display: grid; gap: 12px; grid-template-columns: repeat(2,minmax(0,1fr)); padding: 24px 0; }
        @media (min-width: 960px) { .bk-trust { grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; } }
        .bk-trust-item { display: flex; flex-direction: column; gap: 8px; padding: 16px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); }
        @media (min-width: 640px) { .bk-trust-item { flex-direction: row; gap: 12px; align-items: flex-start; } }
        .bk-tile {
          display: grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; border-radius: 8px;
          background: var(--accent-soft); color: var(--accent-text);
          transition: transform .5s var(--ease), background-color .3s var(--ease), color .3s var(--ease);
        }
        .bk-trust-item:hover .bk-tile, .bk-goal:hover .bk-tile { transform: translateY(-2px) rotate(-6deg); background: var(--btn-bg); color: var(--btn-text); }
        .bk-trust-item p { margin-top: 2px; color: var(--muted); }

        /* ---------- packs ---------- */
        .bk-packs { display: grid; gap: 16px; grid-template-columns: minmax(0,1fr); align-items: stretch; }
        @media (min-width: 960px) { .bk-packs { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        .bk-pack {
          position: relative; display: flex; flex-direction: column; padding: 24px; border-radius: 24px;
          background: var(--surface); border: 1px solid var(--border);
          transition: transform .5s var(--ease), border-color .3s var(--ease), box-shadow .5s var(--ease);
        }
        @media (min-width: 640px) { .bk-pack { padding: 32px; } }
        .bk-pack:hover { transform: translateY(-4px); border-color: var(--accent-line); box-shadow: var(--shadow); }
        .bk-pack.is-featured { border: 2px solid var(--accent); }
        .bk-pack-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .bk-pack-ribbon { padding: 4px 12px; border-radius: 9999px; background: var(--btn-bg); color: var(--btn-text); }
        .bk-pack h3 + p { margin-top: 4px; }
        .bk-pack-covers { display: flex; align-items: center; margin-top: 24px; padding-left: 12px; }
        .bk-pack-thumb {
          position: relative; display: grid; place-items: center; width: 48px; aspect-ratio: 3 / 4; margin-left: -12px; overflow: hidden;
          border-radius: 4px; background: var(--surface-2); color: var(--accent-text);
          border: 2px solid var(--surface); box-shadow: 0 4px 8px rgba(19,18,9,.16);
          transition: transform .5s var(--ease), margin .5s var(--ease);
        }
        .bk-pack-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .bk-pack:hover .bk-pack-thumb { transform: translateY(-4px) rotate(-3deg); }
        .bk-pack:hover .bk-pack-thumb:nth-child(even) { transform: translateY(2px) rotate(3deg); }
        .bk-pack-more { margin-left: 12px; color: var(--muted); }
        .bk-pack-price { display: flex; align-items: baseline; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
        .bk-pack-price + .bk-save { margin-top: 8px; }
        .bk-checks { display: grid; gap: 12px; margin: 24px 0; }
        .bk-checks li { display: flex; align-items: flex-start; gap: 12px; color: var(--text); }
        .bk-checks svg { flex-shrink: 0; margin-top: 2px; color: var(--accent-text); }
        .bk-checks b { font-weight: 600; }
        .bk-inside { margin-bottom: 24px; }
        .bk-inside-btn {
          display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;
          padding: 8px 12px; border-radius: 8px; background: var(--surface-2); border: 1px solid var(--border); color: var(--text);
          transition: border-color .3s var(--ease);
        }
        .bk-inside-btn:hover { border-color: var(--accent); }
        .bk-inside-list { display: grid; gap: 8px; padding: 16px 4px 0; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 520px) { .bk-inside-list { grid-template-columns: repeat(2,minmax(0,1fr)); } }
        .bk-inside-list li { display: flex; align-items: flex-start; gap: 8px; color: var(--muted); }
        .bk-inside-list svg { flex-shrink: 0; margin-top: 2px; color: var(--ok); }
        .bk-pack-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: auto; }
        .bk-pack-actions .bk-btn-primary { flex: 1 1 200px; }
        .bk-notes { display: grid; gap: 12px; margin-top: 24px; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 960px) { .bk-notes { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        .bk-note { display: flex; gap: 12px; align-items: flex-start; padding: 16px; border-radius: 12px; background: var(--surface); border: 1px solid var(--border); color: var(--muted); }
        .bk-note svg { flex-shrink: 0; margin-top: 2px; color: var(--accent-text); }
        .bk-note b { color: var(--text); font-weight: 600; }

        .bk-offer {
          display: flex; flex-direction: column; align-items: flex-start; gap: 24px; margin-top: 24px; padding: 24px;
          border-radius: 16px; background: var(--surface); border: 1px dashed var(--accent-line);
        }
        @media (min-width: 768px) { .bk-offer { flex-direction: row; align-items: center; justify-content: space-between; } }
        .bk-offer h3 { margin: 8px 0 4px; }
        .bk-offer-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .bk-offer-pills li { padding: 4px 8px; border-radius: 6px; background: var(--accent-soft); color: var(--accent-text); }

        /* ---------- goals ---------- */
        .bk-goals { display: grid; gap: 12px; grid-template-columns: repeat(2,minmax(0,1fr)); margin-bottom: 32px; }
        @media (min-width: 768px) { .bk-goals { grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; } }
        .bk-goal {
          position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; padding: 16px; overflow: hidden;
          text-align: left; border-radius: 16px; background: var(--surface); border: 1px solid var(--border); color: var(--text);
          transition: transform .5s var(--ease), border-color .3s var(--ease), box-shadow .5s var(--ease);
        }
        .bk-goal:hover { transform: translateY(-4px); border-color: var(--accent-line); box-shadow: var(--shadow); }
        .bk-goal:active { transform: scale(.98); }
        .bk-goal.is-on { border-color: var(--accent); }
        .bk-goal small { display: block; margin-top: 2px; color: var(--muted); }
        .bk-goal-covers { position: absolute; right: -8px; bottom: -24px; display: none; }
        @media (min-width: 1080px) { .bk-goal-covers { display: flex; } }
        .bk-goal-covers .bk-cover { width: 56px; margin-left: -20px; box-shadow: 0 8px 16px rgba(19,18,9,.2); transition: transform .5s var(--ease); }
        .bk-goal-covers .bk-cover:nth-child(1) { transform: rotate(-8deg); }
        .bk-goal-covers .bk-cover:nth-child(2) { transform: rotate(4deg) translateY(-4px); }
        .bk-goal:hover .bk-goal-covers .bk-cover:nth-child(1) { transform: rotate(-14deg) translateY(-12px); }
        .bk-goal:hover .bk-goal-covers .bk-cover:nth-child(2) { transform: rotate(8deg) translateY(-16px); }

        /* ---------- toolbar ---------- */
        .bk-toolbar {
          position: sticky; top: 70px; z-index: 30; margin-bottom: 24px; padding: 12px;
          border-radius: 16px; border: 1px solid var(--border); background: var(--bg);
          box-shadow: 0 8px 24px rgba(19,18,9,.06);
        }
        @supports ((backdrop-filter: blur(16px)) or (-webkit-backdrop-filter: blur(16px))) {
          .bk-toolbar { background: color-mix(in srgb, var(--bg) 86%, transparent); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); }
        }
        @media (max-width: 640px) { .bk-toolbar { top: 62px; padding: 8px; border-radius: 12px; } }
        .bk-toolbar-row { display: flex; align-items: center; gap: 8px; }
        .bk-toolbar-row .bk-search { flex: 1; min-width: 0; }
        .bk-select { position: relative; flex-shrink: 0; }
        .bk-select select {
          height: 48px; padding: 0 40px 0 16px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface);
          font-size: 14px; line-height: 20px; font-weight: 600; cursor: pointer;
          -webkit-appearance: none; appearance: none; transition: border-color .3s var(--ease);
        }
        .bk-select select:hover { border-color: var(--accent); }
        .bk-select svg { position: absolute; right: 16px; top: 50%; margin-top: -7px; pointer-events: none; color: var(--muted); }
        .bk-filter-toggle { position: relative; width: 48px; height: 48px; border-radius: 12px; }
        .bk-filter-toggle i { position: absolute; top: 8px; right: 8px; width: 8px; height: 8px; border-radius: 9999px; background: var(--accent); }
        .bk-view { display: none; padding: 4px; gap: 4px; border-radius: 12px; border: 1px solid var(--border); background: var(--surface); }
        @media (min-width: 880px) { .bk-view { display: flex; } }
        .bk-view button { position: relative; display: grid; place-items: center; width: 40px; height: 38px; border: 0; border-radius: 8px; background: transparent; color: var(--muted); transition: color .3s var(--ease); }
        .bk-view button[aria-pressed="true"] { color: var(--btn-text); }
        .bk-view-pill { position: absolute; inset: 0; border-radius: 8px; background: var(--btn-bg); }
        .bk-view svg { position: relative; }
        @media (max-width: 640px) { .bk-select-sort { display: none; } }

        .bk-chips {
          display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; padding-bottom: 2px;
          scrollbar-width: none; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain;
        }
        .bk-chips::-webkit-scrollbar { display: none; }
        .bk-chip {
          position: relative; flex-shrink: 0; padding: 8px 12px; border-radius: 9999px;
          background: var(--surface); border: 1px solid var(--border); color: var(--muted);
          transition: border-color .3s var(--ease), color .3s var(--ease), transform .5s var(--ease);
        }
        .bk-chip:hover { border-color: var(--accent); color: var(--accent-text); }
        .bk-chip:active { transform: scale(.95); }
        .bk-chip.is-on, .bk-chip.is-on:hover { color: var(--btn-text); border-color: transparent; }
        .bk-chip-pill { position: absolute; inset: -1px; border-radius: 9999px; background: var(--btn-bg); }
        .bk-chip-label { position: relative; display: inline-flex; align-items: center; gap: 8px; }
        .bk-chip-label .mono { opacity: .7; }

        .bk-filters { padding: 16px 4px 4px; }
        .bk-filters-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .bk-filters > p { margin-bottom: 8px; color: var(--muted); text-transform: uppercase; letter-spacing: .1em; }
        .bk-filters .bk-select { display: none; margin-bottom: 16px; }
        .bk-filters .bk-select select { width: 100%; }
        @media (max-width: 640px) { .bk-filters .bk-select { display: block; } }

        .bk-count { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px; color: var(--muted); min-height: 24px; }
        .bk-count b { color: var(--text); font-weight: 600; }

        /* ---------- grid + cards ---------- */
        .bk-grid { display: grid; gap: 12px; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 560px) { .bk-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px; } }
        @media (min-width: 880px) { .bk-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        @media (min-width: 1200px) { .bk-grid { grid-template-columns: repeat(4,minmax(0,1fr)); } }
        @media (min-width: 880px) { .bk-grid.is-list { grid-template-columns: repeat(2,minmax(0,1fr)); } }

        .bk-card {
          position: relative; display: flex; flex-direction: row; min-width: 0; padding: 8px; gap: 4px;
          border-radius: 16px; background: var(--surface); border: 1px solid var(--border);
          transition: border-color .3s var(--ease), box-shadow .5s var(--ease);
        }
        .bk-card:hover, .bk-card:focus-within { border-color: var(--accent-line); box-shadow: var(--shadow); }
        .bk-card-media {
          position: relative; display: grid; place-items: center; flex-shrink: 0; width: 112px; padding: 12px;
          border-radius: 8px; background: var(--surface-2); overflow: hidden;
        }
        .bk-card-media .bk-cover { width: 100%; transition: transform .5s var(--ease), box-shadow .5s var(--ease); }
        .bk-card:hover .bk-card-media .bk-cover { transform: translateY(-6px) rotate(-3deg) scale(1.04); }
        .bk-card:hover .bk-cover-sweep { opacity: .22; transform: translateX(360%) skewX(-18deg); transition: transform .9s var(--ease), opacity .3s var(--ease); }
        .bk-flag {
          position: absolute; z-index: 4; top: 8px; left: 8px; padding: 2px 8px; border-radius: 6px;
          background: var(--panel); color: #FDBA74; border: 1px solid var(--panel-border);
        }
        .bk-card-body { display: flex; flex-direction: column; flex: 1; min-width: 0; padding: 8px; }
        .bk-card-title { margin-top: 4px; color: var(--text); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .bk-card-title a { transition: color .3s var(--ease); }
        .bk-card-title a:hover { color: var(--accent-text); }
        .bk-card-sub { margin-top: 4px; color: var(--muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .bk-card-foot { margin-top: auto; padding-top: 12px; }
        .bk-card-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
        .bk-card-actions .bk-btn-primary { flex: 1 1 auto; }

        /* stacked card: tablets and up, unless list view is chosen */
        @media (min-width: 560px) {
          .bk-card:not(.is-row) { flex-direction: column; }
          .bk-card:not(.is-row) .bk-card-media { width: 100%; padding: 24px 24px 16px; }
          .bk-card:not(.is-row) .bk-card-media .bk-cover { width: min(168px, 72%); }
          .bk-card:not(.is-row) .bk-card-body { padding: 12px 8px 8px; }
          .bk-card.is-row .bk-card-media { width: 144px; }
        }
        .bk-card-skel .bk-card-body { gap: 12px; }
        .bk-card-skel i { display: block; height: 12px; }
        .bk-card-skel .bk-cover { width: 100%; box-shadow: none; }
        @media (min-width: 560px) { .bk-card-skel .bk-card-media .bk-cover { width: min(168px, 72%); } }

        .bk-empty { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 64px 24px; border-radius: 24px; background: var(--surface); border: 1px dashed var(--border); }
        .bk-empty .bk-tile { width: 64px; height: 64px; border-radius: 16px; margin-bottom: 24px; }
        .bk-empty p { max-width: 440px; margin: 8px 0 24px; color: var(--muted); }
        .bk-empty-topics { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 24px; }

        .bk-error { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; padding: 24px; margin: 32px 0; border-radius: 16px; background: var(--surface); border: 1px solid var(--accent-line); }
        .bk-error p { margin-top: 4px; color: var(--muted); }

        /* ---------- steps ---------- */
        .bk-steps { display: grid; gap: 16px; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 880px) { .bk-steps { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        .bk-step { padding: 24px; border-radius: 16px; background: var(--surface); border: 1px solid var(--border); transition: transform .5s var(--ease), border-color .3s var(--ease); }
        .bk-step:hover { transform: translateY(-4px); border-color: var(--accent-line); }
        .bk-step .mono { color: var(--accent-text); }
        .bk-step h3 { margin: 16px 0 8px; }
        .bk-step p { color: var(--muted); }

        /* ---------- tagline ---------- */
        .bk-tagline-section { padding: 96px 0; }
        @media (min-width: 768px) { .bk-tagline-section { padding: 160px 0; } }
        .bk-tagline { max-width: 680px; margin: 0 auto; text-align: center; text-wrap: balance; letter-spacing: -.02em; }
        .bk-tagline-word { opacity: .3; transition: opacity .5s var(--ease); }
        .bk-tagline-word.is-on { opacity: 1; }

        /* ---------- faq ---------- */
        .bk-faq { display: grid; gap: 32px; align-items: start; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 1080px) {
          .bk-faq { grid-template-columns: minmax(0,.8fr) minmax(0,1.2fr); gap: 64px; }
          .bk-faq > .bk-head { position: sticky; top: 96px; margin-bottom: 0; }
        }
        .bk-faq-list { display: grid; gap: 12px; }
        .bk-faq-item { border-radius: 12px; overflow: hidden; background: var(--surface); border: 1px solid var(--border); transition: border-color .3s var(--ease); }
        .bk-faq-item:hover, .bk-faq-item.is-open { border-color: var(--accent-line); }
        .bk-faq-item button { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 24px; border: 0; background: transparent; text-align: left; color: var(--text); }
        .bk-faq-item button:focus-visible { outline-offset: -2px; border-radius: 12px; }
        .bk-faq-answer { padding: 0 24px 24px; color: var(--muted); }

        /* ---------- support ---------- */
        .bk-support {
          position: relative; overflow: hidden; isolation: isolate;
          display: flex; flex-direction: column; align-items: flex-start; gap: 32px; padding: 40px 24px;
          border-radius: 24px; background: var(--panel); border: 1px solid var(--panel-border); color: var(--panel-text);
        }
        @media (min-width: 880px) { .bk-support { flex-direction: row; align-items: center; justify-content: space-between; padding: 64px; } }
        .bk-support .bk-gridsvg { z-index: -1; color: var(--panel-border); opacity: .7; }
        .bk-support h2 { max-width: 560px; color: var(--panel-text); }
        .bk-support p { max-width: 520px; margin-top: 16px; color: var(--panel-muted); }
        .bk-support-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; flex-shrink: 0; }
        .bk-support .bk-btn-primary { background: #FB923C; color: #131209 !important; }
        .bk-support .bk-btn-primary:hover { background: #FDBA74; }
        .bk-support .bk-text-link { color: #FDBA74 !important; }

        /* ---------- floating pack bar + back to top ---------- */
        .bk-bar {
          position: fixed; z-index: 60; left: 16px; right: 16px; bottom: 16px; margin: 0 auto; max-width: 560px;
          display: flex; align-items: center; gap: 12px; padding: 8px 8px 8px 16px;
          border-radius: 16px; background: var(--panel); border: 1px solid var(--panel-border); color: var(--panel-text);
          box-shadow: 0 24px 48px rgba(0,0,0,.32);
          padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
        }
        .bk-bar-copy { flex: 1; min-width: 0; }
        .bk-bar-copy strong { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bk-bar-copy span { display: block; color: var(--panel-muted); }
        .bk-bar .bk-btn-primary { background: #FB923C; color: #131209 !important; }
        .bk-bar .bk-btn-primary:hover { background: #FDBA74; }
        .bk-bar-close { display: grid; place-items: center; width: 32px; height: 32px; flex-shrink: 0; border: 0; border-radius: 9999px; background: transparent; color: var(--panel-muted); transition: color .3s var(--ease), transform .5s var(--ease); }
        .bk-bar-close:hover { color: #fff; transform: rotate(90deg); }

        .bk-top {
          position: fixed; z-index: 55; right: 16px; bottom: 16px; display: grid; place-items: center; width: 48px; height: 48px;
          border-radius: 9999px; border: 1px solid var(--border); background: var(--surface); color: var(--text);
          box-shadow: var(--shadow);
        }
        .bk-top.is-raised { bottom: 96px; }
        @media (min-width: 880px) { .bk-top.is-raised { bottom: 16px; } }

        /* ---------- keyframes ---------- */
        @keyframes bk-ping { 0% { transform: scale(1); opacity: .7; } 80%,100% { transform: scale(3); opacity: 0; } }
        @keyframes bk-shimmer { 0% { transform: translateX(-120%); } 100% { transform: translateX(320%); } }

        @media (prefers-reduced-motion: reduce) {
          .bkRoot *, .bkRoot *::before, .bkRoot *::after {
            animation: none !important;
            transition-property: opacity, color, background-color, border-color !important;
          }
        }
      `}</style>

      <motion.div
        className="bk-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <main className="bkRoot" data-theme={isDark ? "dark" : "light"}>
        {/* ===================================== */}
        {/* HERO                                  */}
        {/* ===================================== */}

        <section className="bk-hero" aria-labelledby="bk-title">
          <div className="bk-hero-bg" aria-hidden="true">
            <GridPattern id="bk-grid-hero" />
          </div>

          <div className="bk-shell bk-hero-grid">
            <div>
              <motion.p
                className="caption-3 bk-pill"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <span className="bk-ping" aria-hidden="true" />
                Target Trek library
                {ready && stats.count > 0 && <b>{stats.count} ebooks</b>}
              </motion.p>

              <h1 id="bk-title" className="heading-1 bk-hero-title">
                <LineReveal delay={0.1}>Ebooks that make</LineReveal>
                <LineReveal delay={0.22}>hard topics click.</LineReveal>
              </h1>

              <motion.p
                className="body-3 bk-hero-sub"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
              >
                Practical ebooks on System Design HLD, Java LLD, Spring Boot,
                cloud, core CS and GenAI, written for software engineers
                preparing for interviews and real projects. Pay once and read
                in the built in reader.
              </motion.p>

              <motion.div
                className="bk-hero-search"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
              >
                <SearchField
                  large
                  id="bk-hero-search"
                  value={search}
                  onChange={setSearch}
                  onSubmit={() => scrollToId("library")}
                  placeholder={`Try "${SEARCH_EXAMPLES[placeholderIndex]}"`}
                />
              </motion.div>

              {categoryStats.length > 0 && (
                <motion.div
                  className="bk-hero-topics"
                  variants={stagger(0.05, 0.1)}
                  initial="hidden"
                  animate="show"
                >
                  <span className="caption-4">Popular</span>

                  {categoryStats.slice(0, 6).map((item) => (
                    <motion.button
                      type="button"
                      key={item.name}
                      variants={rise}
                      className="caption-3 bk-topic"
                      onClick={() => pickCategory(item.name)}
                    >
                      {item.name}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {ready && (
                <Stagger className="bk-stats" gap={0.08}>
                  <motion.div variants={rise} className="bk-stat">
                    <strong className="mono heading-5">
                      <Counter to={stats.count} />
                    </strong>
                    <span className="caption-4">Ebooks</span>
                  </motion.div>

                  <motion.div variants={rise} className="bk-stat">
                    <strong className="mono heading-5">
                      <Counter to={stats.topics} />
                    </strong>
                    <span className="caption-4">Topics covered</span>
                  </motion.div>

                  {stats.from > 0 && (
                    <motion.div variants={rise} className="bk-stat">
                      <strong className="mono heading-5">
                        ₹<Counter to={stats.from} />
                      </strong>
                      <span className="caption-4">Prices start at</span>
                    </motion.div>
                  )}

                  {stats.maxOff > 0 && (
                    <motion.div variants={rise} className="bk-stat">
                      <strong className="mono heading-5">
                        <Counter to={stats.maxOff} />%
                      </strong>
                      <span className="caption-4">Biggest discount today</span>
                    </motion.div>
                  )}
                </Stagger>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
            >
              <HeroDeck
                books={deckBooks}
                loading={loading}
                onBuy={setProduct}
              />
            </motion.div>
          </div>
        </section>

        {/* ===================================== */}
        {/* TRUST STRIP                           */}
        {/* ===================================== */}

        <div className="bk-alt">
          <Stagger className="bk-shell bk-trust" gap={0.06}>
            {TRUST.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  variants={rise}
                  className="bk-trust-item"
                >
                  <span className="bk-tile">
                    <Icon size={20} weight="duotone" />
                  </span>

                  <div>
                    <h2 className="body-4">{item.title}</h2>
                    <p className="caption-4">{item.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </Stagger>
        </div>

        {/* ===================================== */}
        {/* API ERROR                             */}
        {/* ===================================== */}

        {error && (
          <div className="bk-shell">
            <div className="bk-error" role="alert">
              <div>
                <h2 className="title-3">Unable to load books</h2>
                <p className="body-6">{error} Check your connection and try again.</p>
              </div>

              <button
                type="button"
                className="button-md bk-btn bk-btn-primary"
                onClick={() => setRetryCount((n) => n + 1)}
              >
                <ArrowClockwise size={16} weight="bold" />
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ===================================== */}
        {/* BOOK PACKS                            */}
        {/* ===================================== */}

        {!error && packs.length > 0 && (
          <section
            className="bk-section"
            id="packs"
            aria-labelledby="bk-packs-title"
            style={{ scrollMarginTop: 80 }}
          >
            <div className="bk-shell">
              <SectionHead
                index="01"
                eyebrow="Book packs"
                id="bk-packs-title"
                title="Get every book in one pack."
                text="One payment, no subscription. Take all the current books, or go Lifetime and receive every future book too."
              />

              <Stagger className="bk-packs" gap={0.12}>
                {packs.map((pack) => (
                  <PackPanel
                    key={getBookId(pack)}
                    pack={pack}
                    worth={packWorth}
                    onBuy={setProduct}
                  />
                ))}
              </Stagger>

              {packsFromApi && (
                <Stagger className="bk-notes" gap={0.08}>
                  {anyCredits && (
                    <motion.p variants={rise} className="body-6 bk-note">
                      <Sword size={20} weight="duotone" />
                      <span>
                        <b>What is a Prep Arena credit?</b> Prep Arena pairs
                        you with another serious candidate for mock interviews
                        and private chat. 1 credit = 1 match = 1 partnership.
                      </span>
                    </motion.p>
                  )}

                  {hasLifetime && (
                    <motion.p variants={rise} className="body-6 bk-note">
                      <Gift size={20} weight="duotone" />
                      <span>
                        <b>Lifetime bonus.</b> We give you free, limited Prep
                        Arena credits when we launch new features. Buy once and
                        the perks keep growing.
                      </span>
                    </motion.p>
                  )}

                  <motion.p variants={rise} className="body-6 bk-note">
                    <BellRinging size={20} weight="duotone" />
                    <span>
                      <b>New books, straight to your inbox.</b> Pack members
                      are emailed when a book is published and can request new
                      books from inside Prep Arena.
                    </span>
                  </motion.p>
                </Stagger>
              )}

              <OfferCard offers={offers} />
            </div>
          </section>
        )}

        {/* ===================================== */}
        {/* SEARCHABLE CATALOG                    */}
        {/* ===================================== */}

        {!error && (
          <section
            className="bk-section bk-alt"
            id="library"
            aria-labelledby="bk-library-title"
            style={{ scrollMarginTop: 64 }}
          >
            <div className="bk-shell">
              <SectionHead
                index="02"
                eyebrow="Book collection"
                id="bk-library-title"
                title="Find your next book."
                text="Search by title, topic or tag, or start from a goal. Every book has a Buy now button, so checkout is one tap away."
              />

              {/* SHOP BY GOAL */}

              {categoryStats.length > 0 && (
                <Stagger className="bk-goals" gap={0.05}>
                  {categoryStats.slice(0, 8).map((item) => {
                    const Icon = getCategoryIcon(item.name);
                    const active = lower(category) === lower(item.name);

                    return (
                      <motion.button
                        type="button"
                        key={item.name}
                        variants={rise}
                        className={cn("bk-goal", active && "is-on")}
                        aria-pressed={active}
                        onClick={() => pickCategory(active ? "" : item.name)}
                      >
                        <span className="bk-tile">
                          <Icon size={20} weight="duotone" />
                        </span>

                        <span>
                          <span className="body-4">{item.name}</span>
                          <small className="caption-4">
                            {item.count} {item.count === 1 ? "book" : "books"}
                            {Number.isFinite(item.from) &&
                              ` · from ${money(item.from)}`}
                          </small>
                        </span>

                        <span className="bk-goal-covers" aria-hidden="true">
                          {item.covers.slice(0, 2).map((book) => (
                            <BookCover
                              key={getBookId(book)}
                              book={book}
                              decorative
                            />
                          ))}
                        </span>
                      </motion.button>
                    );
                  })}
                </Stagger>
              )}

              {/* STICKY TOOLBAR */}

              <div className="bk-toolbar">
                <div className="bk-toolbar-row">
                  <SearchField
                    ref={toolbarSearchRef}
                    id="bk-search"
                    hint
                    value={search}
                    onChange={setSearch}
                    onSubmit={() => toolbarSearchRef.current?.blur()}
                    placeholder={`Search ${SEARCH_EXAMPLES[placeholderIndex]}`}
                  />

                  <div className="bk-select bk-select-sort">
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                      aria-label="Sort books"
                    >
                      {SORTS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <CaretDown size={14} weight="bold" />
                  </div>

                  <button
                    type="button"
                    className="bk-icon-btn bk-filter-toggle"
                    onClick={() => setShowFilters((value) => !value)}
                    aria-expanded={showFilters}
                    aria-controls="bk-filters"
                    aria-label="More filters"
                  >
                    <SlidersHorizontal size={18} weight="bold" />
                    {(tag || sort) && <i aria-hidden="true" />}
                  </button>

                  <div className="bk-view" role="group" aria-label="Layout">
                    {[
                      { id: "grid", icon: SquaresFour, label: "Grid view" },
                      { id: "list", icon: Rows, label: "List view" },
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
                              layoutId="bk-view-pill"
                              className="bk-view-pill"
                              transition={{ duration: 0.5, ease: EASE }}
                            />
                          )}
                          <Icon size={18} weight="bold" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <nav className="bk-chips" aria-label="Book categories">
                  <Chip
                    active={!category}
                    onClick={() => setCategory("")}
                    count={books.length || undefined}
                    layoutId="bk-chip-pill"
                  >
                    All books
                  </Chip>

                  {categoryStats.map((item) => (
                    <Chip
                      key={item.name}
                      active={lower(category) === lower(item.name)}
                      onClick={() => setCategory(item.name)}
                      count={item.count}
                      layoutId="bk-chip-pill"
                    >
                      {item.name}
                    </Chip>
                  ))}
                </nav>

                <AnimatePresence initial={false}>
                  {showFilters && (
                    <motion.div
                      key="filters"
                      id="bk-filters"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="bk-filters">
                        <div className="bk-select">
                          <select
                            value={sort}
                            onChange={(event) => setSort(event.target.value)}
                            aria-label="Sort books"
                          >
                            {SORTS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <CaretDown size={14} weight="bold" />
                        </div>

                        {tagOptions.length > 0 ? (
                          <>
                            <p className="caption-3">Tags</p>

                            <div className="bk-filters-row">
                              {tagOptions.map((item) => (
                                <Chip
                                  key={item.key}
                                  active={tag === item.key}
                                  onClick={() =>
                                    setTag(tag === item.key ? "" : item.key)
                                  }
                                  layoutId="bk-tag-pill"
                                >
                                  #{item.label}
                                </Chip>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="caption-3">No tags to filter by yet</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RESULT COUNT */}

              <div className="body-6 bk-count" aria-live="polite">
                {!loading && (
                  <p>
                    Showing <b>{filteredBooks.length}</b>{" "}
                    {filteredBooks.length === 1 ? "book" : "books"}
                    {search.trim() && (
                      <>
                        {" "}
                        for <b>{search.trim()}</b>
                      </>
                    )}
                    {category && (
                      <>
                        {" "}
                        in <b>{category}</b>
                      </>
                    )}
                  </p>
                )}

                {hasFilters && (
                  <button
                    type="button"
                    className="button-sm bk-text-link"
                    onClick={clearFilters}
                  >
                    <X size={14} weight="bold" />
                    Clear all
                  </button>
                )}
              </div>

              {/* LOADING GRID */}

              {loading && (
                <div className="bk-grid">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <BookSkeleton key={index} />
                  ))}
                </div>
              )}

              {/* LIVE BOOK GRID */}

              {!loading && filteredBooks.length > 0 && (
                <div className={cn("bk-grid", view === "list" && "is-list")}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredBooks.map((book, index) => (
                      <BookCard
                        key={getBookId(book)}
                        book={book}
                        view={view}
                        index={index}
                        query={search}
                        onBuy={setProduct}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* EMPTY SEARCH */}

              {!loading && filteredBooks.length === 0 && books.length > 0 && (
                <motion.div
                  className="bk-empty"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <span className="bk-tile">
                    <MagnifyingGlass size={28} weight="duotone" />
                  </span>

                  <h3 className="heading-6">No books match that search</h3>

                  <p className="body-6">
                    Try a shorter keyword such as HLD, Java or RAG, or jump
                    into one of these topics.
                  </p>

                  <div className="bk-empty-topics">
                    {categoryStats.slice(0, 5).map((item) => (
                      <button
                        type="button"
                        key={item.name}
                        className="caption-3 bk-topic"
                        onClick={() => pickCategory(item.name)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="button-md bk-btn bk-btn-primary"
                    onClick={clearFilters}
                  >
                    Show all books
                  </button>
                </motion.div>
              )}

              {/* EMPTY CATALOG */}

              {!loading && books.length === 0 && (
                <div className="bk-empty">
                  <span className="bk-tile">
                    <BookOpen size={28} weight="duotone" />
                  </span>

                  <h3 className="heading-6">No books available yet</h3>

                  <p className="body-6">Published books will appear here.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================================== */}
        {/* HOW IT WORKS                          */}
        {/* ===================================== */}

        <section className="bk-section" aria-labelledby="bk-steps-title">
          <div className="bk-shell">
            <SectionHead
              index="03"
              eyebrow="How it works"
              id="bk-steps-title"
              title="From Buy now to page one in three steps."
              text="No account setup before you pay and nothing to install. Here is exactly what happens after you press the button."
            />

            <Stagger className="bk-steps" gap={0.12}>
              {STEPS.map((step) => (
                <motion.div key={step.n} variants={rise} className="bk-step">
                  <span className="mono heading-5">{step.n}</span>
                  <h3 className="heading-6">{step.title}</h3>
                  <p className="body-6">{step.text}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ===================================== */}
        {/* TAGLINE REVEAL                        */}
        {/* ===================================== */}

        <section className="bk-tagline-section bk-alt">
          <div className="bk-shell">
            <TaglineReveal text={TAGLINE} />
          </div>
        </section>

        {/* ===================================== */}
        {/* FAQ                                   */}
        {/* ===================================== */}

        <section className="bk-section" aria-labelledby="bk-faq-title">
          <div className="bk-shell bk-faq">
            <SectionHead
              index="04"
              eyebrow="Good to know"
              id="bk-faq-title"
              title="Questions before you buy?"
              text="Straight answers on access, payment and refunds."
            />

            <Stagger className="bk-faq-list" gap={0.06}>
              {FAQS.map((faq, index) => (
                <FaqItem
                  key={faq.question}
                  faq={faq}
                  index={index}
                  open={activeFaq === index}
                  onToggle={() =>
                    setActiveFaq(activeFaq === index ? null : index)
                  }
                />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ===================================== */}
        {/* SUPPORT                               */}
        {/* ===================================== */}

        <section className="bk-section" style={{ paddingTop: 0 }}>
          <div className="bk-shell">
            <motion.div
              className="bk-support"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <GridPattern id="bk-grid-support" />

              <div>
                <h2 className="heading-3">Not sure which book fits you?</h2>

                <p className="body-3">
                  Tell us what you are preparing for and we will point you to
                  the right book. We also help with purchase and access issues.
                </p>
              </div>

              <div className="bk-support-actions">
                <motion.a
                  href="mailto:supporttargettrek@gmail.com"
                  className="button-lg bk-btn bk-btn-primary"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <EnvelopeSimple size={18} weight="bold" />
                  Email support
                </motion.a>

                <button
                  type="button"
                  className="button-md bk-text-link"
                  onClick={() => scrollToId("library")}
                >
                  Browse all books
                  <ArrowRight size={16} weight="bold" />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===================================== */}
        {/* FLOATING PACK BAR + BACK TO TOP       */}
        {/* ===================================== */}

        <AnimatePresence>
          {showBar && (
            <motion.aside
              key="bar"
              className="bk-bar"
              aria-label="Book pack offer"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 48 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Package size={24} weight="duotone" color="#FB923C" />

              <div className="bk-bar-copy">
                <strong className="body-4">{cheapestPack.title}</strong>
                <span className="mono caption-4">
                  {money(cheapestPack.price, cheapestPack.currency)}
                  {getDiscount(cheapestPack) > 0 &&
                    ` · ${getDiscount(cheapestPack)}% off`}
                </span>
              </div>

              <BuyButton
                book={cheapestPack}
                onBuy={setProduct}
                size="sm"
                label="Buy this pack"
              />

              <button
                type="button"
                className="bk-bar-close"
                onClick={() => setBarClosed(true)}
                aria-label="Hide pack offer"
              >
                <X size={16} weight="bold" />
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scrolled && !product && (
            <motion.button
              key="top"
              type="button"
              className={cn("bk-top", showBar && "is-raised")}
              aria-label="Back to top"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.4, ease: EASE }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <ArrowUp size={20} weight="bold" />
            </motion.button>
          )}
        </AnimatePresence>
      </main>

      <PayUCheckoutModal
        isOpen={Boolean(product)}
        onClose={() => setProduct(null)}
        product={product}
      />
    </MotionConfig>
  );
}
