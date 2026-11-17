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
  Eye,
  Gift,
  Graph,
  HardDrives,
  Lightbulb,
  Lightning,
  LockKey,
  MagnifyingGlass,
  Package,
  Plus,
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
import { fetchPackages, cachedPackages } from "../resume/api";
import { SAMPLE, planType } from "../resume/landingContent";

import "./books.css";

// =======================================================
// CONFIGURATION
// =======================================================

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/books`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE = "System Design, Java & GenAI Ebooks (PDF) | Target Trek";

const SEO_DESCRIPTION =
  "Explore practical ebooks on System Design HLD, Java LLD, Google ADK, RAG, MCP, GenAI, and backend engineering from Target Trek.";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap";

// Base motion curve: weighted, decelerates into place.
const EASE = [0.22, 1, 0.36, 1];

// The two pack pages. Used to recognise packs inside the books list.
const PACK_PATHS = ["/book/all-books", "/book/life-type-combo"];
const LIFETIME_PATH = "/book/life-type-combo";

// Books rendered per "page" of the catalog before "Show more"
const PAGE_SIZE = 12;

// How long each spotlight book stays in front
const SPOT_MS = 5200;

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
    text: "Search the shelf, open Quick view to compare, and press Buy now on the one you want.",
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
const TAGLINE_KEYS = /^(clear|finish|week\.?)$/i;

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

const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

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
    /high[\s-]level[\s-]design/.test(value) ||
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

// Plain text paragraphs from the admin description (tags are stripped)
const getParagraphs = (text) =>
  String(text || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .split(/\n{2,}/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .filter(Boolean);

// Included books are populated objects on the packs API, ids elsewhere
const getIncludedTitles = (book) =>
  (Array.isArray(book?.includedBooks) ? book.includedBooks : [])
    .filter((item) => item && typeof item === "object" && item.title)
    .map((item) => ({ id: item._id || item.title, title: item.title }));

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
  hidden: { opacity: 0, y: 28 },
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
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
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
    <p className="bx-tagline" ref={ref}>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <span
            className={cn(
              "bx-tagline-word",
              TAGLINE_KEYS.test(word) && "is-key",
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
    <div className={cn("bx-cover", className)}>
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
        <div className="bx-cover-fallback">
          <span>
            <BookOpen size={14} weight="duotone" />
            TARGET TREK
          </span>

          <strong>{book?.title || "Digital ebook"}</strong>
        </div>
      )}

      <span className="bx-cover-shine" aria-hidden="true" />
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
    <div className={cn("bx-price", large && "is-large")}>
      <div className="bx-price-row">
        <strong className="bx-price-now">
          {money(book?.price, book?.currency)}
        </strong>

        {saving > 0 && (
          <s className="bx-price-mrp">{money(book?.mrp, book?.currency)}</s>
        )}

        {discount > 0 && <span className="bx-off">{discount}% off</span>}
      </div>

      {(saving > 0 || credits > 0) && (
        <div className="bx-price-notes">
          {saving > 0 && (
            <span className="bx-save">
              You save {money(saving, book?.currency)}
            </span>
          )}

          {credits > 0 && (
            <span
              className="bx-credits"
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
        "bx-btn bx-btn-primary",
        size === "lg" && "bx-btn-lg",
        size === "sm" && "bx-btn-sm",
        className
      )}
      onClick={() => onBuy(book)}
      whileHover={{ scale: 1.02 }}
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
// SEARCH FIELD (hero + catalog toolbar)
// =======================================================

const SearchField = React.forwardRef(function SearchField(
  { value, onChange, onSubmit, placeholder, large = false, id, hint = false },
  ref
) {
  return (
    <form
      role="search"
      className={cn("bx-search", large && "is-large")}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <MagnifyingGlass size={20} weight="bold" className="bx-search-icon" />

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
          className="bx-search-clear"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <X size={16} weight="bold" />
        </button>
      ) : (
        hint && (
          <kbd className="bx-kbd" aria-hidden="true">
            /
          </kbd>
        )
      )}

      {large && (
        <button type="submit" className="bx-btn bx-btn-primary bx-search-go">
          Search
        </button>
      )}
    </form>
  );
});

// =======================================================
// HERO SPOTLIGHT: one book at a time, with a cover rail
// =======================================================

function Spotlight({ books, loading, onBuy, onPeek }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const railRef = useRef(null);

  const count = books.length;
  const safeIndex = count ? index % count : 0;
  const current = books[safeIndex];
  const auto = count > 1 && !reduced;

  useEffect(() => {
    if (!auto || paused) return undefined;

    const timer = setTimeout(() => {
      setIndex((value) => (value + 1) % count);
    }, SPOT_MS);

    return () => clearTimeout(timer);
  }, [auto, paused, count, safeIndex]);

  // keep the active thumbnail visible inside the rail
  useEffect(() => {
    const rail = railRef.current;
    const thumb = rail?.children?.[safeIndex];
    if (!rail || !thumb) return;

    const left = thumb.offsetLeft - rail.clientWidth / 2 + thumb.clientWidth / 2;
    rail.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  }, [safeIndex, reduced]);

  const step = (direction) =>
    setIndex((value) => (value + direction + count) % count);

  if (loading || !count) {
    return <div className="bx-spot bx-spot-skel bx-skel" aria-hidden="true" />;
  }

  return (
    <section
      className="bx-spot"
      aria-roledescription="carousel"
      aria-label="Featured books"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="bx-spot-top">
        <span className="bx-spot-label">
          <Sparkle size={14} weight="fill" />
          Spotlight
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="bx-spot-count" aria-live="polite">
            {String(safeIndex + 1).padStart(2, "0")} /{" "}
            {String(count).padStart(2, "0")}
          </span>

          {count > 1 && (
            <div className="bx-spot-nav">
              <button type="button" onClick={() => step(-1)} aria-label="Previous book">
                <CaretLeft size={14} weight="bold" />
              </button>
              <button type="button" onClick={() => step(1)} aria-label="Next book">
                <CaretRight size={14} weight="bold" />
              </button>
            </div>
          )}
        </div>
      </div>

      {auto && (
        <div className="bx-spot-bar" aria-hidden="true">
          <i
            key={safeIndex}
            className={cn("is-run", paused && "is-paused")}
            style={{ "--spot-ms": `${SPOT_MS}ms` }}
          />
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={getBookId(current)}
          className="bx-spot-main"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <div className="bx-spot-cover">
            <BookLink book={current} tabIndex={-1} aria-hidden="true">
              <BookCover book={current} priority decorative />
            </BookLink>

            {getDiscount(current) > 0 && (
              <span className="bx-spot-tag">{getDiscount(current)}% off</span>
            )}
          </div>

          <div className="bx-spot-copy">
            <p className="bx-spot-kicker">
              {current.badge || getCategories(current)[0] || "Ebook"}
            </p>

            <BookLink book={current} className="bx-spot-title">
              {current.title}
            </BookLink>

            {(current.subtitle || current.shortDescription) && (
              <p className="bx-spot-sub">
                {current.subtitle || current.shortDescription}
              </p>
            )}

            <Price book={current} />

            <div className="bx-spot-actions">
              <BuyButton book={current} onBuy={onBuy} />

              <button
                type="button"
                className="bx-btn bx-btn-onpanel"
                onClick={() => onPeek(current)}
              >
                <Eye size={18} weight="bold" />
                Quick view
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {count > 1 && (
        <div className="bx-spot-rail" ref={railRef} role="group" aria-label="Choose a featured book">
          {books.map((book, i) => (
            <button
              type="button"
              key={getBookId(book)}
              className={cn("bx-spot-thumb", i === safeIndex && "is-on")}
              onClick={() => setIndex(i)}
              aria-label={`Show ${book.title}`}
              aria-current={i === safeIndex ? "true" : undefined}
            >
              <BookCover book={book} decorative />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

// =======================================================
// BOOK CARD
// =======================================================

const BookCard = React.forwardRef(function BookCard(
  { book, view, index, query, onBuy, onPeek },
  ref
) {
  const pack = isPackBook(book);
  const category = getCategories(book)[0];
  const flag = pack ? "Pack" : book?.badge;
  const discount = getDiscount(book);
  const tags = getTags(book).slice(0, 2);

  return (
    <motion.article
      ref={ref}
      layout
      className={cn("bx-card", view === "list" && "is-row")}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.25, ease: EASE } }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.6,
        delay: (index % 4) * 0.05,
        ease: EASE,
        layout: { duration: 0.5, ease: EASE },
      }}
    >
      <BookLink
        book={book}
        className="bx-card-media"
        aria-label={`View ${book?.title}`}
        tabIndex={-1}
      >
        <BookCover book={book} />

        {flag && <span className="bx-flag">{flag}</span>}
        {discount > 0 && <span className="bx-flag-off">-{discount}%</span>}
      </BookLink>

      <div className="bx-card-body">
        <p className="bx-kicker">
          {[category, getResourceType(book?.resourceType)]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <h3 className="bx-card-title">
          <BookLink book={book}>
            <Highlight text={book?.title} query={query} />
          </BookLink>
        </h3>

        {(book?.subtitle || book?.shortDescription) && (
          <p className="bx-card-sub">{book.subtitle || book.shortDescription}</p>
        )}

        {tags.length > 0 && (
          <div className="bx-card-tags">
            {tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className="bx-card-foot">
          <Price book={book} />

          <div className="bx-card-actions">
            <BuyButton
              book={book}
              onBuy={onBuy}
              size="sm"
              label={pack ? "Buy pack" : "Buy now"}
            />

            <button
              type="button"
              className="bx-icon-btn"
              onClick={() => onPeek(book)}
              aria-label={`Quick view of ${book?.title}`}
              title="Quick view"
            >
              <Eye size={18} weight="bold" />
            </button>

            <BookLink
              book={book}
              className="bx-icon-btn"
              aria-label={`Open the page of ${book?.title}`}
              title="Full details"
            >
              <ArrowUpRight size={18} weight="bold" />
            </BookLink>
          </div>
        </div>
      </div>
    </motion.article>
  );
});

function BookSkeleton() {
  return (
    <div className="bx-card bx-card-skel" aria-hidden="true">
      <div className="bx-card-media">
        <div className="bx-cover bx-skel" />
      </div>

      <div className="bx-card-body">
        <i className="bx-skel" style={{ width: "40%" }} />
        <i className="bx-skel" style={{ width: "90%", height: 20 }} />
        <i className="bx-skel" style={{ width: "60%" }} />
        <i className="bx-skel" style={{ width: "100%", height: 40, marginTop: 16 }} />
      </div>
    </div>
  );
}

// =======================================================
// QUICK VIEW: side drawer on desktop, bottom sheet on mobile
// =======================================================

function QuickView({ book, onClose, onBuy }) {
  const closeRef = useRef(null);
  const titleId = useId();

  const pack = isPackBook(book);
  const paragraphs = getParagraphs(book?.description);
  const categories = getCategories(book);
  const tags = getTags(book);
  const included = getIncludedTitles(book);
  const credits = Number(book?.matches) || 0;

  // Esc to close, lock page scroll, focus the close button
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="bx-sheet-root">
      <motion.div
        className="bx-sheet-backdrop"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bx-sheet"
        initial={{ opacity: 0, y: 40, x: 0 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        <span className="bx-sheet-grip" aria-hidden="true" />

        <div className="bx-sheet-head">
          <span className="bx-eyebrow">
            <Eye size={14} weight="bold" />
            Quick view
          </span>

          <button
            ref={closeRef}
            type="button"
            className="bx-icon-btn"
            onClick={onClose}
            aria-label="Close quick view"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="bx-sheet-body">
          <div className="bx-sheet-hero">
            <BookCover book={book} priority />

            <div style={{ minWidth: 0 }}>
              <p className="bx-kicker">
                {[pack ? "Pack" : categories[0], getResourceType(book?.resourceType)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>

              <h2 id={titleId} className="bx-sheet-title">
                {book?.title}
              </h2>

              {(book?.subtitle || book?.shortDescription) && (
                <p className="bx-sheet-sub">
                  {book.subtitle || book.shortDescription}
                </p>
              )}

              <div style={{ marginTop: 14 }}>
                <Price book={book} />
              </div>
            </div>
          </div>

          <div className="bx-sheet-block">
            <ul className="bx-sheet-facts">
              <li>
                <CreditCard size={18} weight="duotone" />
                One time payment
              </li>
              <li>
                <BookOpenText size={18} weight="duotone" />
                Built in reader
              </li>
              <li>
                <LockKey size={18} weight="duotone" />
                Secure access link
              </li>
              <li>
                {credits > 0 ? (
                  <>
                    <Sword size={18} weight="duotone" />
                    {credits} Prep Arena {credits === 1 ? "credit" : "credits"}
                  </>
                ) : (
                  <>
                    <EnvelopeSimple size={18} weight="duotone" />
                    Email support
                  </>
                )}
              </li>
            </ul>
          </div>

          {paragraphs.length > 0 && (
            <div className="bx-sheet-block bx-sheet-desc">
              <h4>About this {pack ? "pack" : "book"}</h4>
              {paragraphs.slice(0, 6).map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          )}

          {included.length > 0 && (
            <div className="bx-sheet-block">
              <h4>{included.length} books inside</h4>
              <ul className="bx-inside-list" style={{ paddingTop: 0 }}>
                {included.map((item) => (
                  <li key={item.id}>
                    <Check size={14} weight="bold" />
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(categories.length > 0 || tags.length > 0) && (
            <div className="bx-sheet-block">
              <h4>Topics</h4>
              <div className="bx-sheet-tags">
                {categories.map((name) => (
                  <span key={`c-${name}`}>{name}</span>
                ))}
                {tags.map((tag) => (
                  <span key={`t-${tag}`}>#{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bx-sheet-foot">
          <BuyButton
            book={book}
            onBuy={onBuy}
            label={pack ? "Buy this pack" : "Buy now"}
          />

          {book?.redirectUrl && (
            <BookLink book={book} className="bx-btn bx-btn-ghost" onClick={onClose}>
              Full details
              <ArrowUpRight size={16} weight="bold" />
            </BookLink>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// =======================================================
// SYSTEM DESIGN PICKS: the HLD book and the HLD + LLD combo
// =======================================================

const HLD_TOPICS = ["Architecture", "APIs", "Databases", "Caching", "Distributed systems"];
const LLD_TOPICS = ["Classes", "Interfaces", "UML", "Design patterns", "Java"];

function SystemDesignPicks({ hld, lld, combo, onBuy, onPeek }) {
  // the books inside the combo, HLD first (populated objects on /book)
  const inside = (Array.isArray(combo?.includedBooks) ? combo.includedBooks : [])
    .filter((item) => item && typeof item === "object")
    .sort((a, b) => Number(isHLDBook(b)) - Number(isHLDBook(a)));

  const separate =
    hld && lld ? Number(hld.price || 0) + Number(lld.price || 0) : 0;
  const comboSave = combo ? separate - Number(combo.price || 0) : 0;

  return (
    <div className="bx-sd-grid">
      {hld && (
        <motion.article variants={rise} className="bx-sd-card">
          <div className="bx-sd-media">
            <BookLink book={hld} tabIndex={-1} aria-hidden="true" className="bx-sd-cover">
              <BookCover book={hld} priority decorative />
            </BookLink>
            {hld.badge && <span className="bx-flag">{hld.badge}</span>}
          </div>

          <div className="bx-sd-body">
            <p className="bx-kicker">High level design · Ebook</p>

            <h3 className="bx-sd-title">
              <BookLink book={hld}>{hld.title}</BookLink>
            </h3>

            <p className="bx-sd-text">
              Scalable architecture, APIs, databases, caching and distributed
              systems, for system design interviews and real projects.
            </p>

            <ul className="bx-sd-topics">
              {HLD_TOPICS.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>

            <div className="bx-sd-foot">
              <Price book={hld} />

              <div className="bx-card-actions">
                <BuyButton book={hld} onBuy={onBuy} />
                <button
                  type="button"
                  className="bx-icon-btn"
                  onClick={() => onPeek(hld)}
                  aria-label={`Quick view of ${hld.title}`}
                  title="Quick view"
                >
                  <Eye size={18} weight="bold" />
                </button>
                <BookLink
                  book={hld}
                  className="bx-icon-btn"
                  aria-label={`Open the page of ${hld.title}`}
                  title="Full details"
                >
                  <ArrowUpRight size={18} weight="bold" />
                </BookLink>
              </div>
            </div>
          </div>
        </motion.article>
      )}

      {combo && (
        <motion.article variants={rise} className="bx-sd-card is-combo">
          <span className="bx-ribbon bx-sd-ribbon">
            <Sparkle size={12} weight="fill" />
            Best value
          </span>

          <div className="bx-sd-media">
            <BookLink book={combo} tabIndex={-1} aria-hidden="true" className="bx-sd-fan">
              {(inside.length ? inside : [combo]).slice(0, 2).map((book, i) => (
                <BookCover key={book._id || i} book={book} decorative />
              ))}
              {inside.length > 1 && (
                <span className="bx-sd-plus">
                  <Plus size={14} weight="bold" />
                </span>
              )}
            </BookLink>
          </div>

          <div className="bx-sd-body">
            <p className="bx-kicker">
              HLD + LLD combo · {inside.length || 2} books
            </p>

            <h3 className="bx-sd-title">
              <BookLink book={combo}>{combo.title}</BookLink>
            </h3>

            <p className="bx-sd-text">
              Both sides of the system design round in one payment: the big
              picture, and the classes and patterns behind it.
            </p>

            <ul className="bx-sd-inside">
              {inside.map((book) => (
                <li key={book._id || book.title}>
                  <Check size={14} weight="bold" />
                  <span>
                    {book.title}
                    <small>{(isHLDBook(book) ? HLD_TOPICS : LLD_TOPICS).slice(0, 3).join(" · ")}</small>
                  </span>
                </li>
              ))}
            </ul>

            {comboSave > 0 && (
              <p className="bx-sd-compare">
                <span>
                  Bought one by one <s>{money(separate, combo.currency)}</s>
                </span>
                <b>Combo saves {money(comboSave, combo.currency)}</b>
              </p>
            )}

            <div className="bx-sd-foot">
              <Price book={combo} />

              <div className="bx-card-actions">
                <BuyButton book={combo} onBuy={onBuy} label="Buy combo" />
                <button
                  type="button"
                  className="bx-icon-btn"
                  onClick={() => onPeek(combo)}
                  aria-label={`Quick view of ${combo.title}`}
                  title="Quick view"
                >
                  <Eye size={18} weight="bold" />
                </button>
                <BookLink
                  book={combo}
                  className="bx-icon-btn"
                  aria-label={`Open the page of ${combo.title}`}
                  title="Full details"
                >
                  <ArrowUpRight size={18} weight="bold" />
                </BookLink>
              </div>
            </div>
          </div>
        </motion.article>
      )}
    </div>
  );
}

// =======================================================
// RESUME LAB: compact card with the live plans and a real sample
// =======================================================

const RL_PLANS_URL = "/resume-review#pricing";
const RL_SAMPLE_URL = "/resume-review#sample";

// "[35]% in [two] quarters" -> the bracketed parts are marked
function SampleBullet({ text }) {
  return String(text)
    .split(/\[(.*?)\]/)
    .map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}

const planLine = (plan) =>
  [
    plan.ai?.reviews
      ? `${plan.ai.reviews} AI ${plan.ai.reviews === 1 ? "report" : "reports"}`
      : "",
    plan.human?.enabled ? "human review" : "",
    plan.linkedin?.enabled ? "LinkedIn" : "",
  ]
    .filter(Boolean)
    .join(" · ");

// Three honest quick picks from the live list: cheapest AI plan,
// cheapest plan with a person's review, and the recommended plan.
const pickPlans = (list) => {
  const plans = (Array.isArray(list) ? list : []).filter(
    (plan) => plan && Number.isFinite(Number(plan.price))
  );
  const cheapest = (items) =>
    [...items].sort((a, b) => Number(a.price) - Number(b.price))[0];

  const picks = [
    { plan: cheapest(plans.filter((p) => planType(p) === "ai")), tag: "Quick check" },
    { plan: cheapest(plans.filter((p) => p.human?.enabled)), tag: "With a person" },
    { plan: plans.find((p) => p.badge), tag: null },
  ];

  const seen = new Set();

  return picks
    .filter(({ plan }) => plan && !seen.has(plan.name) && seen.add(plan.name))
    .map(({ plan, tag }) => ({ plan, tag: tag || plan.badge }));
};

function ResumeLabCard() {
  const [packages, setPackages] = useState(() =>
    typeof window === "undefined" ? null : cachedPackages()
  );

  useEffect(() => {
    let alive = true;

    fetchPackages()
      .then((list) => alive && setPackages(list))
      .catch(() => {}); // the card still works without live prices

    return () => {
      alive = false;
    };
  }, []);

  const picks = useMemo(() => pickPlans(packages), [packages]);
  const [before, after] = SAMPLE.bullets[0];

  return (
    <motion.aside
      className="bx-rl"
      aria-label="Resume Lab by Target Trek"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: EASE }}
    >
      <div className="bx-rl-main">
        <div className="bx-rl-top">
          <span className="bx-rl-alert">
            <i aria-hidden="true" />
            Applied to 50+ jobs and heard nothing?
          </span>
          <span className="bx-eyebrow">Resume Lab by Target Trek</span>
        </div>

        <h2 className="bx-rl-title">
          Reading the books but not getting calls?{" "}
          <span className="bx-hl">Fix the resume.</span>
        </h2>

        <p className="bx-rl-text">
          Most resumes are rejected by software or skimmed in ten seconds. See
          exactly what is costing you shortlists.
        </p>

        <ul className="bx-rl-feats">
          <li>
            <Sparkle size={16} weight="duotone" />
            AI report in minutes
          </li>
          <li>
            <BookOpenText size={16} weight="duotone" />
            Working professional review
          </li>
          <li>
            <ShareNetwork size={16} weight="duotone" />
            LinkedIn review
          </li>
        </ul>

        {picks.length > 0 && (
          <div className="bx-rl-plans">
            {picks.map(({ plan, tag }) => (
              <Link
                key={plan.name}
                to={RL_PLANS_URL}
                className={cn("bx-rl-plan", plan.badge && "is-rec")}
              >
                <span className="bx-rl-plan-tag">{tag}</span>
                <strong>{plan.name}</strong>
                <b className="bx-mono">{money(plan.price, plan.currency || "INR")}</b>
                <small>{planLine(plan)}</small>
              </Link>
            ))}
          </div>
        )}

        <div className="bx-rl-actions">
          <Link to={RL_PLANS_URL} className="bx-btn bx-btn-primary">
            See all plans
            <ArrowRight size={16} weight="bold" />
          </Link>
          <Link to={RL_SAMPLE_URL} className="bx-link">
            See a sample review
            <ArrowRight size={14} weight="bold" />
          </Link>
        </div>
      </div>

      <div className="bx-rl-art" aria-label="From a sample report">
        <div className="bx-rl-art-head">
          <span>Sample report</span>
          <small>{SAMPLE.role}</small>
        </div>

        <div className="bx-rl-scores">
          {[
            ["Overall", SAMPLE.overall],
            ["ATS", SAMPLE.ats],
            ["Job match", SAMPLE.jobMatch],
          ].map(([label, value]) => (
            <div key={label} className="bx-rl-score">
              <b className="bx-mono">{value}</b>
              <span>{label}</span>
              <i>
                <u style={{ width: `${value}%` }} />
              </i>
            </div>
          ))}
        </div>

        <div className="bx-rl-fix">
          <p className="bx-rl-before">
            <span>Before</span>
            <s>{before}</s>
          </p>
          <p className="bx-rl-after">
            <span>After</span>
            <SampleBullet text={after} />
          </p>
        </div>
      </div>
    </motion.aside>
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
  const named = getIncludedTitles(pack);
  const saving = getSaving(pack);
  const showWorth = Number(worth) > Number(pack.price);

  return (
    <motion.article
      variants={rise}
      className={cn("bx-pack", lifetime && "is-featured")}
    >
      <div className="bx-pack-head">
        <span className="bx-eyebrow">
          <Package size={14} weight="bold" />
          {lifetime ? "Lifetime pack" : "All books pack"}
        </span>

        {(pack.badge || lifetime) && (
          <span className="bx-ribbon">
            <Sparkle size={12} weight="fill" />
            {pack.badge || "Best value"}
          </span>
        )}
      </div>

      <h3>{pack.title}</h3>

      {pack.subtitle && <p className="bx-pack-sub">{pack.subtitle}</p>}

      {included.length > 0 && (
        <div className="bx-pack-covers" aria-hidden="true">
          {included.slice(0, 8).map((book, i) => (
            <span
              key={book?._id || i}
              className="bx-pack-thumb"
              style={{ zIndex: 20 - i }}
            >
              {book?.coverPageUrl ? (
                <img src={book.coverPageUrl} alt="" loading="lazy" />
              ) : (
                <BookOpen size={16} />
              )}
            </span>
          ))}

          {included.length > 8 && (
            <span className="bx-pack-more">+{included.length - 8}</span>
          )}
        </div>
      )}

      <div className="bx-pack-price">
        <strong>{money(pack.price, pack.currency)}</strong>

        {saving > 0 && <s>{money(pack.mrp, pack.currency)}</s>}

        {getDiscount(pack) > 0 && (
          <span className="bx-off">{getDiscount(pack)}% off</span>
        )}

        <span>one time</span>
      </div>

      {showWorth && (
        <p className="bx-pack-worth">
          Worth {money(worth, pack.currency)} if bought one by one
        </p>
      )}

      <ul className="bx-checks">
        <li>
          <Check size={16} weight="bold" />
          <span>
            <b>{included.length > 0 ? `${included.length} books` : "All books"}</b>{" "}
            available today
          </span>
        </li>

        <li>
          <BellRinging size={16} weight="bold" />
          <span>
            {lifetime
              ? "Every book we publish in future, emailed to you free"
              : "Email alert when a new book is published"}
          </span>
        </li>

        {credits > 0 && (
          <li>
            <Sword size={16} weight="bold" />
            <span>
              {credits} Prep Arena {credits === 1 ? "credit" : "credits"} for
              mock interview partners
            </span>
          </li>
        )}

        {lifetime && (
          <li>
            <Gift size={16} weight="bold" />
            <span>Free limited Prep Arena credits when we launch new features</span>
          </li>
        )}

        <li>
          <Lightbulb size={16} weight="bold" />
          <span>Request or suggest new books inside Prep Arena</span>
        </li>

        {(pack.highlights || []).map((item) => (
          <li key={item}>
            <Check size={16} weight="bold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {named.length > 0 && (
        <div className="bx-inside">
          <button
            type="button"
            className="bx-inside-btn"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={panelId}
          >
            {open ? "Hide" : "See"} all {named.length} books inside
            <motion.span
              style={{ display: "inline-grid" }}
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
                <ul className="bx-inside-list">
                  {named.map((book, i) => (
                    <motion.li
                      key={book.id}
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

      <div className="bx-pack-actions">
        <BuyButton book={pack} onBuy={onBuy} size="lg" label="Buy this pack" />

        {pack.redirectUrl && (
          <BookLink book={pack} className="bx-btn bx-btn-lg bx-btn-ghost">
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
      <aside className="bx-offer" aria-label="Bundle offers">
        <div>
          <span className="bx-eyebrow">
            <Lightning size={14} weight="fill" /> Bundle offers
          </span>

          <h3>Buy more books, pay less</h3>

          <p className="bx-small bx-muted">
            Pick your books and the offer price is applied automatically.
          </p>

          <ul className="bx-offer-pills">
            {offers.slice(0, 3).map((offer) => (
              <li key={offer._id}>{offerDeal(offer)}</li>
            ))}

            {offers.length > 3 && <li>+{offers.length - 3} more</li>}
          </ul>
        </div>

        <Link to="/books/bundle-offers" className="bx-btn bx-btn-ghost">
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

function SectionHead({ eyebrow, title, text, id, children }) {
  return (
    <div className="bx-head">
      <div className="bx-head-main">
        <Reveal>
          <span className="bx-eyebrow">{eyebrow}</span>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="bx-h2" id={id}>
            {title}
          </h2>
        </Reveal>

        {text && (
          <Reveal delay={0.12}>
            <p className="bx-lead">{text}</p>
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
      className={cn("bx-chip", active && "is-on")}
      aria-pressed={active}
      onClick={onClick}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="bx-chip-pill"
          transition={{ duration: 0.45, ease: EASE }}
        />
      )}

      <span className="bx-chip-label">
        {children}
        {count !== undefined && <span className="bx-mono">{count}</span>}
      </span>
    </button>
  );
}

function FaqItem({ faq, index, open, onToggle }) {
  const panelId = `bx-faq-panel-${index}`;

  return (
    <motion.div variants={rise} className={cn("bx-faq-item", open && "is-open")}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span>{faq.question}</span>

        <motion.span
          className="bx-faq-icon"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          <Plus size={16} weight="bold" />
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
            transition={{ duration: 0.45, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p className="bx-faq-answer">{faq.answer}</p>
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
  const [limit, setLimit] = useState(PAGE_SIZE);

  const [offers, setOffers] = useState([]);

  const [view, setView] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [activeTab, setActiveTab] = useState("");

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [barClosed, setBarClosed] = useState(false);

  // The book or pack currently in checkout (null = modal closed)
  const [product, setProduct] = useState(null);
  // The book open in Quick view (null = closed)
  const [peek, setPeek] = useState(null);

  const { data: packData } = usePacks();

  const isDark = theme === "dark";

  const toolbarSearchRef = useRef(null);
  const rootRef = useRef(null);

  // The site header is fixed and its height changes by breakpoint (the phone
  // header has a second row). Measure it so the sticky tabs sit right below.
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

  // =====================================================
  // SCROLL EFFECTS
  // =====================================================

  const { scrollY, scrollYProgress } = useScroll();

  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });

  const tabsSlotRef = useRef(null);
  const [pinned, setPinned] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    const next = value > 700;

    setScrolled((current) => (current === next ? current : next));

    // pin the section tabs once their slot slides under the site header
    const slot = tabsSlotRef.current;
    const root = rootRef.current;
    if (slot && root) {
      const navH = parseFloat(getComputedStyle(root).getPropertyValue("--nav-h")) || 64;
      const pin = slot.getBoundingClientRect().top <= navH;

      setPinned((current) => (current === pin ? current : pin));
    }
  });

  // rotating search placeholder
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((n) => (n + 1) % SEARCH_EXAMPLES.length);
    }, 2600);

    return () => clearInterval(timer);
  }, []);

  const focusCatalogSearch = useCallback(() => {
    scrollToId("library");
    // wait for the smooth scroll to start before focusing (avoids a jump)
    setTimeout(() => toolbarSearchRef.current?.focus({ preventScroll: true }), 350);
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
      focusCatalogSearch();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [focusCatalogSearch]);

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

  // New filters start from the first page of results
  useEffect(() => {
    setLimit(PAGE_SIZE);
  }, [search, category, tag, sort]);

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

  // Spotlight: the HLD book first, then featured books, then the rest
  const featuredBook = useMemo(
    () =>
      singles.find(isHLDBook) ||
      singles.find((book) => book.isFeatured) ||
      singles[0] ||
      null,
    [singles]
  );

  const spotBooks = useMemo(() => {
    if (!featuredBook) return [];

    const id = getBookId(featuredBook);
    const rest = singles.filter((book) => getBookId(book) !== id);

    return [
      featuredBook,
      ...rest.filter((book) => book.isFeatured),
      ...rest.filter((book) => !book.isFeatured),
    ].slice(0, 8);
  }, [singles, featuredBook]);

  // System design picks shown right after the hero
  const sdPicks = useMemo(() => {
    const path = (book) => getPath(book).toLowerCase();
    const combo =
      singles.find((book) => /hld-lld|lld-hld/.test(path(book))) ||
      singles.find(
        (book) =>
          book.resourceType === "bundle" && path(book).includes("system-design")
      ) ||
      null;
    const notCombo = (book) => book !== combo;
    const hld =
      singles.find((book) => path(book) === "/book/system-design/hld") ||
      singles.find((book) => notCombo(book) && isHLDBook(book)) ||
      null;
    const lld =
      singles.find((book) => path(book) === "/book/system-design/lld") ||
      singles.find((book) => notCombo(book) && /\blld\b/.test(lower(`${book.title} ${path(book)}`))) ||
      null;

    return { hld, lld, combo };
  }, [singles]);

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

  const visibleBooks = filteredBooks.slice(0, limit);
  const remaining = Math.max(0, filteredBooks.length - visibleBooks.length);

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

    requestAnimationFrame(() => scrollToId("bx-results"));
  };

  const openCheckout = useCallback((book) => {
    setPeek(null);
    setProduct(book);
  }, []);

  const closePeek = useCallback(() => setPeek(null), []);

  // =====================================================
  // SECTION TABS + SCROLLSPY
  // =====================================================

  const tabs = useMemo(() => {
    const list = [];

    if (!error && (sdPicks.hld || sdPicks.combo)) {
      list.push({ id: "system-design", label: "System Design" });
    }

    if (!error && packs.length > 0) {
      list.push({ id: "packs", label: "Packs", count: packs.length });
    }

    if (!error) {
      list.push({ id: "library", label: "All books", count: books.length || undefined });
    }

    list.push({ id: "how", label: "How it works" });
    list.push({ id: "faq", label: "FAQ" });

    return list;
  }, [error, packs.length, books.length, sdPicks]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const nodes = tabs
      .map((tab) => document.getElementById(tab.id))
      .filter(Boolean);

    if (!nodes.length) return undefined;

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
  }, [tabs, loading]);

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
  const showBar = scrolled && !barClosed && !product && !peek && Boolean(cheapestPack);

  const statItems = ready
    ? [
        { key: "count", value: <Counter to={stats.count} />, label: "Ebooks" },
        { key: "topics", value: <Counter to={stats.topics} />, label: "Topics" },
        stats.from > 0 && {
          key: "from",
          value: (
            <>
              ₹<Counter to={stats.from} />
            </>
          ),
          label: "Prices start at",
        },
        stats.maxOff > 0 && {
          key: "off",
          value: (
            <>
              <Counter to={stats.maxOff} />%
            </>
          ),
          label: "Top discount",
        },
      ].filter(Boolean)
    : [];

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

      <motion.div
        className="bx-progress"
        style={{ scaleX: progress }}
        aria-hidden="true"
      />

      <main ref={rootRef} className="bx" data-theme={isDark ? "dark" : "light"}>
        {/* ===================================== */}
        {/* HERO                                  */}
        {/* ===================================== */}

        <section className="bx-hero" aria-labelledby="bx-title">
          <div className="bx-hero-bg" aria-hidden="true" />

          <div className="bx-shell bx-hero-grid">
            <div>
              <motion.p
                className="bx-pill"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <span className="bx-ping" aria-hidden="true" />
                Target Trek library
                {ready && stats.count > 0 && <b>{stats.count} ebooks</b>}
              </motion.p>

              <motion.h1
                id="bx-title"
                className="bx-h1 bx-hero-title"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
              >
                Ebooks that make <span className="bx-hl">hard topics</span> click.
              </motion.h1>

              <motion.p
                className="bx-lead bx-hero-lead"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
              >
                Practical ebooks on System Design HLD, Java LLD, Spring Boot,
                cloud, core CS and GenAI, written for software engineers
                preparing for interviews and real projects. Pay once and read in
                the built in reader.
              </motion.p>

              <motion.div
                className="bx-hero-search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              >
                <SearchField
                  large
                  id="bx-hero-search"
                  value={search}
                  onChange={setSearch}
                  onSubmit={() => scrollToId("bx-results")}
                  placeholder={`Try "${SEARCH_EXAMPLES[placeholderIndex]}"`}
                />
              </motion.div>

              {categoryStats.length > 0 && (
                <motion.div
                  className="bx-hero-topics"
                  variants={stagger(0.04, 0.35)}
                  initial="hidden"
                  animate="show"
                >
                  <span>Popular:</span>

                  {categoryStats.slice(0, 6).map((item) => (
                    <motion.button
                      type="button"
                      key={item.name}
                      variants={rise}
                      className="bx-topic"
                      onClick={() => pickCategory(item.name)}
                    >
                      {item.name}
                    </motion.button>
                  ))}
                </motion.div>
              )}

              {statItems.length > 0 && (
                <motion.div
                  className="bx-stats"
                  style={{ "--n": statItems.length }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
                >
                  {statItems.map((item) => (
                    <div className="bx-stat" key={item.key}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
            >
              <Spotlight
                books={spotBooks}
                loading={loading}
                onBuy={openCheckout}
                onPeek={setPeek}
              />
            </motion.div>
          </div>
        </section>

        {/* ===================================== */}
        {/* SYSTEM DESIGN: HLD + the HLD/LLD combo */}
        {/* ===================================== */}

        {!error && (sdPicks.hld || sdPicks.combo) && (
          <section
            className="bx-sec bx-sd"
            id="system-design"
            aria-labelledby="bx-sd-title"
          >
            <div className="bx-shell">
              <SectionHead
                eyebrow="Start here · System Design"
                id="bx-sd-title"
                title={
                  <>
                    The books most engineers <span className="bx-hl">start with.</span>
                  </>
                }
                text="Begin with High Level Design, or take HLD and LLD together and cover the whole system design round."
              />

              <Stagger gap={0.12}>
                <SystemDesignPicks
                  hld={sdPicks.hld}
                  lld={sdPicks.lld}
                  combo={sdPicks.combo}
                  onBuy={openCheckout}
                  onPeek={setPeek}
                />
              </Stagger>

              {sdPicks.lld && (
                <p className="bx-sd-more">
                  Only need low level design?{" "}
                  <BookLink book={sdPicks.lld} className="bx-link">
                    {sdPicks.lld.title} · {money(sdPicks.lld.price, sdPicks.lld.currency)}
                    <ArrowRight size={14} weight="bold" />
                  </BookLink>
                </p>
              )}
            </div>
          </section>
        )}

        {/* ===================================== */}
        {/* STICKY SECTION TABS                   */}
        {/* ===================================== */}

        <div className="bx-tabs-slot" ref={tabsSlotRef}>
        <nav className={cn("bx-tabs", pinned && "is-pinned")} aria-label="On this page">
          <div className="bx-shell bx-tabs-in">
            <div className="bx-tabs-list">
              {tabs.map((tab) => {
                const on = activeTab === tab.id;

                return (
                  <button
                    type="button"
                    key={tab.id}
                    className={cn("bx-tab", on && "is-on")}
                    aria-current={on ? "location" : undefined}
                    onClick={() => scrollToId(tab.id)}
                  >
                    <span>
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className="bx-mono">{tab.count}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {cheapestPack && (
              <span className="bx-tabs-cta">
                All books from <b>{money(cheapestPack.price, cheapestPack.currency)}</b>
              </span>
            )}

            <button
              type="button"
              className="bx-icon-btn bx-tabs-search"
              onClick={focusCatalogSearch}
              aria-label="Search books"
              title="Search books ( / )"
            >
              <MagnifyingGlass size={18} weight="bold" />
            </button>
          </div>
        </nav>
        </div>

        {/* ===================================== */}
        {/* TRUST STRIP                           */}
        {/* ===================================== */}

        <div className="bx-tint">
          <Stagger className="bx-shell bx-trust" gap={0.06}>
            {TRUST.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div key={item.title} variants={rise} className="bx-trust-item">
                  <span className="bx-tile">
                    <Icon size={20} weight="duotone" />
                  </span>

                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
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
          <div className="bx-shell">
            <div className="bx-error" role="alert">
              <div>
                <h2>Unable to load books</h2>
                <p>{error} Check your connection and try again.</p>
              </div>

              <button
                type="button"
                className="bx-btn bx-btn-primary"
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
          <section className="bx-sec" id="packs" aria-labelledby="bx-packs-title">
            <div className="bx-shell">
              <SectionHead
                eyebrow="Book packs"
                id="bx-packs-title"
                title={
                  <>
                    Get <span className="bx-hl">every book</span> in one pack.
                  </>
                }
                text="One payment, no subscription. Take all the current books, or go Lifetime and receive every future book too."
              />

              <Stagger className="bx-packs" gap={0.12}>
                {packs.map((pack) => (
                  <PackPanel
                    key={getBookId(pack)}
                    pack={pack}
                    worth={packWorth}
                    onBuy={openCheckout}
                  />
                ))}
              </Stagger>

              {packsFromApi && (
                <Stagger className="bx-notes" gap={0.08}>
                  {anyCredits && (
                    <motion.p variants={rise} className="bx-note">
                      <Sword size={20} weight="duotone" />
                      <span>
                        <b>What is a Prep Arena credit?</b> Prep Arena pairs you
                        with another serious candidate for mock interviews and
                        private chat. 1 credit = 1 match = 1 partnership.
                      </span>
                    </motion.p>
                  )}

                  {hasLifetime && (
                    <motion.p variants={rise} className="bx-note">
                      <Gift size={20} weight="duotone" />
                      <span>
                        <b>Lifetime bonus.</b> We give you free, limited Prep
                        Arena credits when we launch new features. Buy once and
                        the perks keep growing.
                      </span>
                    </motion.p>
                  )}

                  <motion.p variants={rise} className="bx-note">
                    <BellRinging size={20} weight="duotone" />
                    <span>
                      <b>New books, straight to your inbox.</b> Pack members are
                      emailed when a book is published and can request new
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
        {/* RESUME LAB                            */}
        {/* ===================================== */}

        <section
          className="bx-sec"
          style={{ paddingTop: packs.length > 0 && !error ? 0 : undefined }}
          aria-label="Resume Lab"
        >
          <div className="bx-shell">
            <ResumeLabCard />
          </div>
        </section>

        {/* ===================================== */}
        {/* SEARCHABLE CATALOG                    */}
        {/* ===================================== */}

        {!error && (
          <section
            className="bx-sec bx-tint"
            id="library"
            aria-labelledby="bx-library-title"
          >
            <div className="bx-shell">
              <SectionHead
                eyebrow="Book collection"
                id="bx-library-title"
                title="Find your next book."
                text="Start from a topic, or search by title and tag. Open Quick view to read the details without leaving the page."
              />

              {/* BROWSE BY TOPIC */}

              {categoryStats.length > 0 && (
                <Stagger className="bx-topics" gap={0.05}>
                  {categoryStats.slice(0, 8).map((item) => {
                    const Icon = getCategoryIcon(item.name);
                    const active = lower(category) === lower(item.name);

                    return (
                      <motion.button
                        type="button"
                        key={item.name}
                        variants={rise}
                        className={cn("bx-topic-card", active && "is-on")}
                        aria-pressed={active}
                        onClick={() => pickCategory(active ? "" : item.name)}
                      >
                        <span className="bx-tile">
                          <Icon size={20} weight="duotone" />
                        </span>

                        <span>
                          <strong>{item.name}</strong>
                          <small>
                            {item.count} {item.count === 1 ? "book" : "books"}
                            {Number.isFinite(item.from) && ` · from ${money(item.from)}`}
                          </small>
                        </span>

                        <span className="bx-topic-covers" aria-hidden="true">
                          {item.covers.slice(0, 2).map((book) => (
                            <BookCover key={getBookId(book)} book={book} decorative />
                          ))}
                        </span>
                      </motion.button>
                    );
                  })}
                </Stagger>
              )}

              {/* TOOLBAR */}

              <div className="bx-toolbar">
                <div className="bx-toolbar-row">
                  <SearchField
                    ref={toolbarSearchRef}
                    id="bx-search"
                    hint
                    value={search}
                    onChange={setSearch}
                    onSubmit={() => {
                      toolbarSearchRef.current?.blur();
                      scrollToId("bx-results");
                    }}
                    placeholder={`Search ${SEARCH_EXAMPLES[placeholderIndex]}`}
                  />

                  <div className="bx-select bx-select-sort">
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
                    className={cn("bx-icon-btn bx-filter-toggle", showFilters && "is-on")}
                    onClick={() => setShowFilters((value) => !value)}
                    aria-expanded={showFilters}
                    aria-controls="bx-filters"
                    aria-label="More filters"
                  >
                    <SlidersHorizontal size={18} weight="bold" />
                    {(tag || sort) && <i aria-hidden="true" />}
                  </button>

                  <div className="bx-view" role="group" aria-label="Layout">
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
                              layoutId="bx-view-pill"
                              className="bx-view-pill"
                              transition={{ duration: 0.45, ease: EASE }}
                            />
                          )}
                          <Icon size={18} weight="bold" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bx-chips" role="group" aria-label="Book categories">
                  <Chip
                    active={!category}
                    onClick={() => setCategory("")}
                    count={books.length || undefined}
                    layoutId="bx-chip-pill"
                  >
                    All books
                  </Chip>

                  {categoryStats.map((item) => (
                    <Chip
                      key={item.name}
                      active={lower(category) === lower(item.name)}
                      onClick={() => setCategory(item.name)}
                      count={item.count}
                      layoutId="bx-chip-pill"
                    >
                      {item.name}
                    </Chip>
                  ))}
                </div>

                <AnimatePresence initial={false}>
                  {showFilters && (
                    <motion.div
                      key="filters"
                      id="bx-filters"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.45, ease: EASE }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="bx-filters">
                        <div className="bx-select">
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
                            <p className="bx-filters-label">Tags</p>

                            <div className="bx-filters-row">
                              {tagOptions.map((item) => (
                                <Chip
                                  key={item.key}
                                  active={tag === item.key}
                                  onClick={() => setTag(tag === item.key ? "" : item.key)}
                                  layoutId="bx-tag-pill"
                                >
                                  #{item.label}
                                </Chip>
                              ))}
                            </div>
                          </>
                        ) : (
                          <p className="bx-filters-label">No tags to filter by yet</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* RESULT COUNT */}

              <div id="bx-results" className="bx-count" aria-live="polite">
                {!loading && (
                  <p>
                    Showing <b>{filteredBooks.length}</b>{" "}
                    {filteredBooks.length === 1 ? "book" : "books"}
                    {search.trim() && (
                      <>
                        {" "}
                        for <b>“{search.trim()}”</b>
                      </>
                    )}
                    {category && (
                      <>
                        {" "}
                        in <b>{category}</b>
                      </>
                    )}
                    {tag && (
                      <>
                        {" "}
                        tagged <b>#{tag}</b>
                      </>
                    )}
                  </p>
                )}

                {hasFilters && (
                  <button type="button" className="bx-link" onClick={clearFilters}>
                    <X size={14} weight="bold" />
                    Clear all
                  </button>
                )}
              </div>

              {/* LOADING GRID */}

              {loading && (
                <div className="bx-grid">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <BookSkeleton key={index} />
                  ))}
                </div>
              )}

              {/* LIVE BOOK GRID */}

              {!loading && visibleBooks.length > 0 && (
                <div className={cn("bx-grid", view === "list" && "is-list")}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {visibleBooks.map((book, index) => (
                      <BookCard
                        key={getBookId(book)}
                        book={book}
                        view={view}
                        index={index}
                        query={search}
                        onBuy={openCheckout}
                        onPeek={setPeek}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* SHOW MORE */}

              {!loading && remaining > 0 && (
                <div className="bx-more">
                  <span>
                    You have seen {visibleBooks.length} of {filteredBooks.length} books
                  </span>

                  <span className="bx-more-bar" aria-hidden="true">
                    <i
                      style={{
                        width: `${(visibleBooks.length / filteredBooks.length) * 100}%`,
                      }}
                    />
                  </span>

                  <button
                    type="button"
                    className="bx-btn bx-btn-ghost"
                    onClick={() => setLimit((n) => n + PAGE_SIZE)}
                  >
                    Show {Math.min(PAGE_SIZE, remaining)} more
                    <CaretDown size={16} weight="bold" />
                  </button>
                </div>
              )}

              {/* EMPTY SEARCH */}

              {!loading && filteredBooks.length === 0 && books.length > 0 && (
                <motion.div
                  className="bx-empty"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <span className="bx-tile">
                    <MagnifyingGlass size={28} weight="duotone" />
                  </span>

                  <h3>No books match that search</h3>

                  <p>
                    Try a shorter keyword such as HLD, Java or RAG, or jump into
                    one of these topics.
                  </p>

                  <div className="bx-empty-topics">
                    {categoryStats.slice(0, 5).map((item) => (
                      <button
                        type="button"
                        key={item.name}
                        className="bx-topic"
                        onClick={() => pickCategory(item.name)}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>

                  <button type="button" className="bx-btn bx-btn-primary" onClick={clearFilters}>
                    Show all books
                  </button>
                </motion.div>
              )}

              {/* EMPTY CATALOG */}

              {!loading && books.length === 0 && (
                <div className="bx-empty">
                  <span className="bx-tile">
                    <BookOpen size={28} weight="duotone" />
                  </span>

                  <h3>No books available yet</h3>

                  <p>Published books will appear here.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ===================================== */}
        {/* HOW IT WORKS                          */}
        {/* ===================================== */}

        <section className="bx-sec" id="how" aria-labelledby="bx-steps-title">
          <div className="bx-shell">
            <SectionHead
              eyebrow="How it works"
              id="bx-steps-title"
              title="From Buy now to page one in three steps."
              text="No account setup before you pay and nothing to install. Here is exactly what happens after you press the button."
            />

            <Stagger className="bx-steps" gap={0.12}>
              <span className="bx-steps-line" aria-hidden="true" />

              {STEPS.map((step) => (
                <motion.div key={step.n} variants={rise} className="bx-step">
                  <span className="bx-step-n">{step.n}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ===================================== */}
        {/* TAGLINE REVEAL                        */}
        {/* ===================================== */}

        <section className="bx-tagline-sec" aria-label="Our promise">
          <div className="bx-shell">
            <TaglineReveal text={TAGLINE} />
          </div>
        </section>

        {/* ===================================== */}
        {/* FAQ                                   */}
        {/* ===================================== */}

        <section className="bx-sec" id="faq" aria-labelledby="bx-faq-title">
          <div className="bx-shell bx-faq">
            <div className="bx-faq-side">
              <SectionHead
                eyebrow="Good to know"
                id="bx-faq-title"
                title="Questions before you buy?"
                text="Straight answers on access, payment and refunds."
              />

              <Reveal delay={0.15}>
                <div className="bx-faq-help">
                  <span className="bx-tile">
                    <EnvelopeSimple size={20} weight="duotone" />
                  </span>

                  <p>
                    Still stuck? Write to us with your order reference.
                    <br />
                    <a className="bx-link" href={`mailto:${SUPPORT_EMAIL}`}>
                      {SUPPORT_EMAIL}
                    </a>
                  </p>
                </div>
              </Reveal>
            </div>

            <Stagger className="bx-faq-list" gap={0.06}>
              {FAQS.map((faq, index) => (
                <FaqItem
                  key={faq.question}
                  faq={faq}
                  index={index}
                  open={activeFaq === index}
                  onToggle={() => setActiveFaq(activeFaq === index ? null : index)}
                />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ===================================== */}
        {/* SUPPORT CTA                           */}
        {/* ===================================== */}

        <section className="bx-sec" style={{ paddingTop: 0 }}>
          <div className="bx-shell">
            <motion.div
              className="bx-cta"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <div>
                <span className="bx-eyebrow" style={{ color: "#5eead4" }}>
                  Need a hand?
                </span>

                <h2 className="bx-h2" style={{ marginTop: 12 }}>
                  Not sure which book fits you?
                </h2>

                <p>
                  Tell us what you are preparing for and we will point you to the
                  right book. We also help with purchase and access issues.
                </p>
              </div>

              <div className="bx-cta-actions">
                <motion.a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="bx-btn bx-btn-lg bx-btn-mark"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <EnvelopeSimple size={18} weight="bold" />
                  Email support
                </motion.a>

                <button
                  type="button"
                  className="bx-btn bx-btn-lg bx-btn-onpanel"
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
              className="bx-bar"
              aria-label="Book pack offer"
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 48 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <span className="bx-bar-icon">
                <Package size={22} weight="duotone" />
              </span>

              <div className="bx-bar-copy">
                <strong>{cheapestPack.title}</strong>
                <span>
                  {money(cheapestPack.price, cheapestPack.currency)}
                  {getDiscount(cheapestPack) > 0 &&
                    ` · ${getDiscount(cheapestPack)}% off`}
                </span>
              </div>

              <BuyButton
                book={cheapestPack}
                onBuy={openCheckout}
                size="sm"
                label="Buy pack"
              />

              <button
                type="button"
                className="bx-bar-close"
                onClick={() => setBarClosed(true)}
                aria-label="Hide pack offer"
              >
                <X size={16} weight="bold" />
              </button>
            </motion.aside>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {scrolled && !product && !peek && (
            <motion.button
              key="top"
              type="button"
              className={cn("bx-top", showBar && "is-raised")}
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

        {/* ===================================== */}
        {/* QUICK VIEW                            */}
        {/* ===================================== */}

        <AnimatePresence>
          {peek && (
            <QuickView
              key={getBookId(peek)}
              book={peek}
              onClose={closePeek}
              onBuy={openCheckout}
            />
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
