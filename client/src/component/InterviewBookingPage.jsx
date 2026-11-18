import API_BASE_URL from "../utils/Url";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Helmet } from "react-helmet-async";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  Brain,
  Briefcase,
  Buildings,
  CalendarBlank,
  CaretRight,
  ChatCircleText,
  Check,
  CheckCircle,
  Clock,
  Code,
  CreditCard,
  EnvelopeSimple,
  GraduationCap,
  Lightning,
  LinkSimple,
  LockKey,
  Phone,
  Plus,
  SealCheck,
  ShieldCheck,
  SpinnerGap,
  Stack,
  Target,
  TreeStructure,
  User,
  VideoCamera,
  WarningCircle,
  X,
} from "@phosphor-icons/react";

import "./mockInterviews.css";

/* =========================================================
   CONFIGURATION
========================================================= */

const BASE_URL = (
  API_BASE_URL
).replace(/\/+$/, "");

const API = `${BASE_URL}/api/interviews`;
const PAYMENT_STATUS_PATH = "/mock-interviews/payment-status";
const TIMEZONE = "Asia/Kolkata";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const DEFAULT_CASHFREE_MODE =
  import.meta.env.VITE_CASHFREE_ENV === "production"
    ? "production"
    : "sandbox";

const EASE = [0.22, 1, 0.36, 1];

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/mock-interviews`;
const SEO_TITLE = "Book Mock Interviews: DSA, HLD, LLD & Java | Target Trek";
const SEO_DESCRIPTION =
  "Book realistic 1:1 mock interviews in DSA, backend, Java, Spring Boot, System Design and GenAI. Get honest feedback and find your weak spots before the real interview.";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap";

const cn = (...classes) => classes.filter(Boolean).join(" ");

/* =========================================================
   INTERVIEW TOPICS
========================================================= */

const TOPIC_INFO = {
  DSA: {
    title: "Data Structures & Algorithms",
    short: "DSA",
    description:
      "Coding questions, problem solving, complexity analysis and edge cases.",
    Icon: Code,
  },
  LLD: {
    title: "Low-Level Design",
    short: "LLD",
    description:
      "Object-oriented design, SOLID, design patterns and concurrency.",
    Icon: Stack,
  },
  HLD: {
    title: "High-Level System Design",
    short: "System Design",
    description:
      "Distributed systems, scalability, caching, databases and architecture.",
    Icon: TreeStructure,
  },
  GENAI: {
    title: "Generative AI Engineering",
    short: "GenAI",
    description:
      "RAG, AI agents, LLMs, evaluation and production GenAI systems.",
    Icon: Brain,
  },
  PROJECTS: {
    title: "Backend Engineering & Projects",
    short: "Backend & Projects",
    description:
      "Java, Spring Boot, microservices, API design, databases, projects and trade-offs.",
    Icon: Briefcase,
  },
};

const ALL_TOPICS = Object.keys(TOPIC_INFO);

const INTERVIEWER_COMPANIES = [
  { name: "EPAM Systems", domain: "epam.com" },
  { name: "HashedIn by Deloitte", domain: "hashedin.com" },
  { name: "Deloitte", domain: "deloitte.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "JPMorgan Chase", domain: "jpmorganchase.com" },
  { name: "Meesho", domain: "meesho.com" },
  { name: "Walmart", domain: "walmart.com" },
  { name: "ServiceNow", domain: "servicenow.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Adobe", domain: "adobe.com" },
  { name: "PayPal", domain: "paypal.com" },
  { name: "Mastercard", domain: "mastercard.com" },
  { name: "Oracle", domain: "oracle.com" },
];

const TARGET_COMPANIES = [
  { name: "Google", domain: "google.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Meta", domain: "meta.com" },
  { name: "Apple", domain: "apple.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Netflix", domain: "netflix.com" },
  { name: "Salesforce", domain: "salesforce.com" },
  { name: "Uber", domain: "uber.com" },
];

const DISPLAY_TIMEZONES = [
  { value: "Asia/Kolkata", label: "IST · India (UTC+05:30)", short: "IST" },
  { value: "UTC", label: "UTC · Coordinated Universal Time", short: "UTC" },
  { value: "America/New_York", label: "New York · ET", short: "ET" },
  { value: "America/Los_Angeles", label: "Los Angeles · PT", short: "PT" },
  { value: "Europe/London", label: "London · UK", short: "UK" },
  { value: "Europe/Berlin", label: "Berlin · CET/CEST", short: "Berlin" },
  { value: "Asia/Dubai", label: "Dubai · GST", short: "GST" },
  { value: "Asia/Singapore", label: "Singapore · SGT", short: "SGT" },
  { value: "Asia/Tokyo", label: "Tokyo · JST", short: "JST" },
  { value: "Australia/Sydney", label: "Sydney · AET", short: "Sydney" },
];

// Marketing statistics supplied by the site owner. Update when verified.
const PAGE_STATS = [
  { value: "25+", label: "Mock interviews conducted" },
  { value: "1:1", label: "Live with a working engineer" },
  { value: "5", label: "Interview tracks" },
  { value: "0", label: "Accounts needed to book" },
];

const CURRICULUM = [
  {
    key: "DSA",
    title: "DSA & live coding",
    tagline: "From problem statement to optimal approach",
    points: [
      "Arrays, strings, hashing & sliding window",
      "Trees, graphs, recursion & dynamic programming",
      "Time-space complexity and edge cases",
      "Interviewer-style follow-ups and dry runs",
    ],
  },
  {
    key: "LLD",
    title: "Java & Low-Level Design",
    tagline: "Build maintainable, interview-ready designs",
    points: [
      "OOP, SOLID and design patterns",
      "Parking Lot, Rate Limiter & Notification System",
      "UML, entity relationships and APIs",
      "Concurrency, locking and thread safety",
    ],
  },
  {
    key: "HLD",
    title: "High-Level System Design",
    tagline: "Explain trade-offs, not just diagrams",
    points: [
      "Load balancing, caching, queues and databases",
      "Scalability, consistency and fault tolerance",
      "URL Shortener, BookMyShow and Uber",
      "Capacity estimates, bottlenecks and trade-offs",
    ],
  },
  {
    key: "GENAI",
    title: "Generative AI Engineering",
    tagline: "Real-world LLM and agentic system discussions",
    points: [
      "RAG architecture, retrieval and embeddings",
      "Vector search, evaluation and guardrails",
      "AI agents, tool calling, MCP & orchestration",
      "Google ADK, deployment and production challenges",
    ],
  },
  {
    key: "PROJECTS",
    title: "Backend & project deep dives",
    tagline: "Defend your engineering decisions",
    points: [
      "Java, Spring Boot, Python, FastAPI and JVM fundamentals",
      "REST, security, microservices, messaging and Kafka",
      "SQL/NoSQL, ACID transactions, caching and Redis",
      "API scalability, observability, concurrency and project trade-offs",
    ],
  },
];

const SESSION_BENEFITS = [
  {
    Icon: VideoCamera,
    title: "A real 1:1 interview",
    description:
      "Explain your approach out loud to an engineer, the way you will on the day, instead of solving problems in silence.",
  },
  {
    Icon: Brain,
    title: "The follow-ups that catch people out",
    description:
      "Edge cases, scale, alternatives and trade-offs: the questions interviewers ask after your first answer.",
  },
  {
    Icon: Target,
    title: "Built around your target role",
    description:
      "Tell us your experience and upcoming interview, and the session focuses on what matters for it.",
  },
  {
    Icon: Clock,
    title: "Pick the length you need",
    description:
      "Choose a listed slot that fits the depth of practice you want. The price is shown before you pay.",
  },
];

const FEEDBACK_POINTS = [
  "How you approached the problem",
  "How clearly you explained your thinking",
  "Gaps in problem solving and design",
  "The few areas to work on first",
];

const SESSION_FLOW = [
  ["01", "Introduction", "Your experience, target role, upcoming interviews and what you want from the session.", "~5 min"],
  ["02", "Technical round", "Live coding, system design, GenAI or a project discussion, based on the topics you picked.", "Main part"],
  ["03", "Follow-ups", "Edge cases, optimisations, other designs and the deeper “why” questions.", "Where it gets real"],
  ["04", "Feedback", "Your strengths, what to improve and what to practise next, talked through with you.", "Last few min"],
];

const AUDIENCE = [
  ["Students & freshers", "Get comfortable with live coding, explaining your solution and core CS questions.", "Campus & off-campus"],
  ["SDE-1 candidates", "Sharpen DSA, backend basics, project walkthroughs and how you communicate.", "0–2 years"],
  ["SDE-2 candidates", "Practise design depth, scalability, concurrency and trade-off decisions.", "2–5 years"],
  ["Backend & GenAI engineers", "Discuss APIs, microservices, RAG, agents and production architecture.", "Specialists"],
];

const HOW_IT_WORKS = [
  {
    title: "Pick a date and time",
    description:
      "Choose an open slot below, then select the topics you want to practise.",
    Icon: CalendarBlank,
  },
  {
    title: "Add your details and pay",
    description:
      "Share your name, email, background and goals. Pay securely through Cashfree. No account needed.",
    Icon: CreditCard,
  },
  {
    title: "Join your interview",
    description:
      "Once the payment is verified you get a confirmation. Meeting details are sent by email.",
    Icon: VideoCamera,
  },
];

const FAQ_ITEMS = [
  {
    question: "Who conducts the mock interview?",
    answer:
      "Sessions are conducted by technical interviewers with relevant engineering expertise. The specific interviewer and available topics depend on the slot you select. Ask support if you need interviewer details before booking.",
  },
  {
    question: "Can I choose DSA, LLD, HLD, GenAI or project discussion?",
    answer:
      "Yes. Each slot lists its supported topics and maximum number of selections. You choose from those topics during booking, then add notes about your target role and areas to practice.",
  },
  {
    question: "Will I receive detailed feedback?",
    answer:
      "Yes. Your interviewer will discuss your technical approach, problem solving, communication and areas to improve. A written report is included only when indicated in the selected slot or confirmed by support.",
  },
  {
    question: "Do I need to create an account?",
    answer:
      "No. Select an available slot, provide your contact details and complete the guest checkout.",
  },
  {
    question: "When is my booking confirmed?",
    answer:
      "Your booking is confirmed only after the backend verifies successful payment. If checkout is interrupted, use the payment-status link rather than immediately paying again.",
  },
  {
    question: "How do I get the joining link?",
    answer:
      "Your confirmation and joining information are sent to your booking email. If the meeting link is assigned later, it is shared separately.",
  },
  {
    question: "What is the cancellation policy?",
    answer:
      "For candidate-requested cancellation, contact supporttargettrek@gmail.com at least 24 hours before the interview. The stated cancellation fee is ₹199; requests made less than 24 hours before the interview are non-refundable. Check the current terms before paying.",
  },
  {
    question: "Will the mock interview guarantee an offer?",
    answer:
      "No. The session is intended to improve your preparation, technical reasoning and interview communication; hiring outcomes depend on many factors.",
  },
];

const TABS = [
  { id: "interview-slots", label: "Book a slot" },
  { id: "what-you-get", label: "What you get" },
  { id: "interview-topics", label: "Topics" },
  { id: "session-experience", label: "The session" },
  { id: "how-it-works", label: "How it works" },
  { id: "mock-faq", label: "FAQ" },
];

/* =========================================================
   THEME — uses the theme from the Navbar (no duplicate toggle)
========================================================= */

function readTheme() {
  if (typeof window === "undefined") return "light";

  try {
    const saved = localStorage.getItem("theme");

    if (saved === "light" || saved === "dark") return saved;

    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function useNavbarTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const sync = (event) => {
      const next = event?.detail?.theme;

      if (next === "dark" || next === "light") setTheme(next);
      else setTheme(readTheme());
    };

    window.addEventListener("storage", sync);
    window.addEventListener("themechange", sync);
    window.addEventListener("targettrek-theme-change", sync);

    const observer = new MutationObserver(() => setTheme(readTheme()));

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("themechange", sync);
      window.removeEventListener("targettrek-theme-change", sync);
      observer.disconnect();
    };
  }, []);

  return theme;
}

/* =========================================================
   DATE HELPERS — IST
========================================================= */

function fmtDate(value, options = {}) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIMEZONE,
    ...options,
  }).format(date);
}

function fmtTime(value, timeZone = TIMEZONE, timeFormat = "12") {
  return fmtDate(value, {
    timeZone,
    hour: timeFormat === "24" ? "2-digit" : "numeric",
    minute: "2-digit",
    hour12: timeFormat !== "24",
  }).replace(/\b(am|pm)\b/i, (part) => part.toUpperCase());
}

function fmtSlotDate(value, timeZone = TIMEZONE) {
  return fmtDate(value, {
    timeZone,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtMoney(value, currency = "INR") {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

function dateKey(date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const get = (type) => parts.find((part) => part.type === type)?.value;

  return [get("year"), get("month"), get("day")].join("-");
}

function upcomingDays() {
  const result = [];
  const seen = new Set();
  const now = new Date();

  for (let i = 0; result.length < 8 && i < 22; i++) {
    const date = new Date(now.getTime() + i * 12 * 60 * 60 * 1000);
    const key = dateKey(date);

    if (!seen.has(key)) {
      seen.add(key);
      result.push({ key, date });
    }
  }

  return result;
}

function selectedDateLabel(day) {
  if (!day) return "";

  return fmtDate(`${day}T12:00:00+05:30`, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function paymentStatusUrl(bookingId) {
  return `${PAYMENT_STATUS_PATH}?bookingId=${encodeURIComponent(bookingId)}`;
}

/* =========================================================
   PUBLIC API HELPER

   - NO JWT / ACCOUNT LOGIN / AUTHORIZATION HEADER
   - Uses the public Express endpoints.
========================================================= */

async function apiRequest(path, { method = "GET", body, signal } = {}) {
  const headers = { Accept: "application/json" };

  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${API}${path}`, {
    method,
    headers,
    signal,
    cache: "no-store",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    const error = new Error(
      data.message || `Request failed (${response.status})`
    );

    error.status = response.status;
    error.code = data.code;

    throw error;
  }

  return data;
}

/* =========================================================
   CASHFREE SDK — loaded only when payment starts
========================================================= */

let cashfreeLoadPromise = null;

function loadCashfreeSDK() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Cashfree checkout requires a browser."));
  }

  if (window.Cashfree) return Promise.resolve(window.Cashfree);

  if (!cashfreeLoadPromise) {
    cashfreeLoadPromise = new Promise((resolve, reject) => {
      const src = "https://sdk.cashfree.com/js/v3/cashfree.js";

      let script = document.querySelector(`script[src="${src}"]`);

      if (!script) {
        script = document.createElement("script");
        script.src = src;
        script.async = true;
      }

      const onLoad = () => {
        if (window.Cashfree) {
          resolve(window.Cashfree);
        } else {
          reject(new Error("Cashfree SDK is unavailable."));
        }
      };

      const onError = () => {
        reject(new Error("Unable to load Cashfree checkout."));
      };

      script.addEventListener("load", onLoad, { once: true });
      script.addEventListener("error", onError, { once: true });

      if (!script.isConnected) document.head.appendChild(script);

      if (window.Cashfree) resolve(window.Cashfree);
    }).catch((error) => {
      cashfreeLoadPromise = null;
      throw error;
    });
  }

  return cashfreeLoadPromise;
}

/* =========================================================
   FORM DATA + REAL-TIME VALIDATION
========================================================= */

const emptyCandidate = {
  name: "",
  email: "",
  phone: "",
  experienceYears: "",
  currentRole: "",
  targetRole: "",
  currentCompany: "",
  resumeUrl: "",
  notes: "",
};

// Order used to focus the first invalid field.
const VALIDATED_FIELDS = [
  "name",
  "email",
  "phone",
  "experienceYears",
  "resumeUrl",
];

function validateName(value) {
  const text = value.trim();

  if (!text) return "Full name is required.";
  if (text.length < 2) return "Name must be at least 2 characters.";
  if (/\d/.test(text)) return "Name can't contain numbers.";
  if (!/\p{L}/u.test(text)) return "Name must contain letters.";

  return "";
}

function validateEmail(value) {
  const text = value.trim();

  if (!text) return "Email address is required.";
  if (/\s/.test(text)) return "Email can't contain spaces.";

  const atCount = (text.match(/@/g) || []).length;

  if (atCount === 0) return "Email must contain an '@' symbol.";
  if (atCount > 1) return "Email can only contain one '@' symbol.";

  const [local, domain] = text.split("@");

  if (!local) return "Enter the part before '@' (e.g. name@gmail.com).";
  if (!domain) return "Enter the domain after '@' (e.g. gmail.com).";
  if (!domain.includes(".")) return "Domain needs a dot, like gmail.com.";
  if (
    text.includes("..") ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.startsWith("-")
  ) {
    return "Email has misplaced dots or hyphens.";
  }
  if (!/^[A-Za-z0-9._%+-]+$/.test(local)) {
    return "Email contains characters that aren't allowed.";
  }
  if (!/^[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/.test(domain)) {
    return "Enter a valid email address.";
  }
  if (text.length > 254) return "Email is too long.";

  return "";
}

function validatePhone(value) {
  const raw = value.trim();

  if (!raw) return "Phone number is required.";
  if (/[^\d\s()+-]/.test(raw)) {
    return "Use only digits, spaces, + ( ) and -.";
  }
  if (raw.slice(1).includes("+")) {
    return "'+' is only allowed at the beginning.";
  }

  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");

  const checkIndian = (national) => {
    if (national.length !== 10) {
      return `Indian numbers need 10 digits (${national.length}/10).`;
    }
    if (!/^[6-9]/.test(national)) {
      return "Indian mobile numbers start with 6, 7, 8 or 9.";
    }
    if (/^(\d)\1+$/.test(national)) {
      return "Enter a real phone number.";
    }
    return "";
  };

  if (hasPlus) {
    if (digits.startsWith("0")) return "Country code can't start with 0.";
    if (digits.length < 10) return "Number looks too short.";
    if (digits.length > 15) return "Number can't exceed 15 digits.";
    if (digits.startsWith("91")) return checkIndian(digits.slice(2));
    return "";
  }

  let national = digits;

  if (digits.length === 12 && digits.startsWith("91")) {
    national = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    national = digits.slice(1);
  }

  if (national.length < 10) {
    return `Enter a 10-digit mobile number (${digits.length}/10).`;
  }
  if (national.length > 10) {
    return "Too many digits. Use 10 digits, or +country code for international numbers.";
  }

  return checkIndian(national);
}

function validateExperience(value) {
  if (value === "") return "";

  if (!/^\d+(\.\d+)?$/.test(value)) return "Enter a valid number, e.g. 2 or 3.5.";

  const years = Number(value);

  if (years < 0 || years > 50) return "Experience must be between 0 and 50 years.";

  return "";
}

function validateResumeUrl(value) {
  const text = value.trim();

  if (!text) return "";
  if (/\s/.test(text)) return "Link can't contain spaces.";
  if (!/^https?:\/\//i.test(text)) {
    return "Start the link with https:// (e.g. https://drive.google.com/...).";
  }

  try {
    const url = new URL(text);

    if (!url.hostname.includes(".")) return "Enter a valid resume link.";
  } catch {
    return "Enter a valid resume link.";
  }

  return "";
}

// Returns { fieldName: "message" } for every invalid field.
function validateCandidate(candidate) {
  const checks = {
    name: validateName(candidate.name),
    email: validateEmail(candidate.email),
    phone: validatePhone(candidate.phone),
    experienceYears: validateExperience(candidate.experienceYears),
    resumeUrl: validateResumeUrl(candidate.resumeUrl),
  };

  return Object.fromEntries(
    Object.entries(checks).filter(([, message]) => Boolean(message))
  );
}

/* =========================================================
   SMALL SHARED PIECES
========================================================= */

function scrollToId(id) {
  if (typeof document === "undefined") return;

  const node = document.getElementById(id);

  if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Fades content up once as it enters the viewport. */
function Reveal({ children, className, delay = 0, y = 22, as = "div" }) {
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

function SectionHead({ eyebrow, title, lead, center = false, aside = null, id }) {
  return (
    <Reveal className={cn("mi-head", center && "is-center")}>
      <div className="mi-head-main">
        <span className="mi-eyebrow">{eyebrow}</span>
        <h2 id={id} className="mi-h2">{title}</h2>
        {lead && <p className="mi-lead">{lead}</p>}
      </div>
      {aside}
    </Reveal>
  );
}

function favicon(domain, size = 64) {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
}

function StatusBadge({ slot }) {
  const status = String(slot.status || "AVAILABLE").toUpperCase();

  let label = "Unavailable";
  let tone = "is-off";

  if (status === "AVAILABLE") {
    label = "Open";
    tone = "is-ok";
  } else if (status === "BOOKED") {
    label = "Booked";
  } else if (status === "HELD") {
    label = "Reserved";
    tone = "is-held";
  } else if (status === "BLOCKED") {
    label = "Blocked";
  }

  return (
    <span className={cn("mi-status", tone)}>
      <i aria-hidden="true" />
      {label}
    </span>
  );
}

/** Animated score bar used in the hero's sample feedback card. */
function ScoreBar({ label, value, focus = false, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });

  return (
    <div className="mi-bar-row" ref={ref}>
      <div className="mi-bar-label">
        <span>{label}</span>
        <span>{value}/10</span>
      </div>
      <div className={cn("mi-bar", focus && "is-focus")}>
        <motion.i
          initial={{ scaleX: 0 }}
          animate={{ scaleX: inView ? value / 10 : 0 }}
          transition={{ duration: 1.1, delay, ease: EASE }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   FORM FIELD (live validation)
========================================================= */

function Field({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  onBlur,
  error,
  showError,
  showValid = true,
  hint,
  inputRef,
  required = false,
  optional = false,
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  maxLength,
  className,
}) {
  const invalid = Boolean(showError && error);
  const valid = Boolean(showValid && value.trim() && !error);

  return (
    <div className={className}>
      <label htmlFor={id} className="mi-label">
        {label}
        {required && <em> *</em>}
        {optional && <small> (optional)</small>}
      </label>

      <motion.div
        className="mi-input-wrap"
        animate={invalid ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
      >
        {Icon && <Icon size={18} aria-hidden="true" />}

        <input
          id={id}
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className="mi-input"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={invalid}
          aria-describedby={`${id}-msg`}
          data-valid={valid ? "true" : "false"}
        />

        {(invalid || valid) && (
          <span className={cn("mi-input-state", invalid ? "is-bad" : "is-ok")} aria-hidden="true">
            {invalid ? <WarningCircle size={18} weight="fill" /> : <CheckCircle size={18} weight="fill" />}
          </span>
        )}
      </motion.div>

      <div id={`${id}-msg`} aria-live="polite">
        {invalid ? (
          <p role="alert" className="mi-field-msg is-err">
            <WarningCircle size={14} weight="bold" />
            {error}
          </p>
        ) : hint ? (
          <p className="mi-field-msg is-hint">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING DIALOG

   Step 1: Topics (oldest selection is replaced when the limit is hit)
   Step 2: Candidate details (live validation)
   Step 3: Review + payment
   NO LOGIN OR TOKEN REQUIRED.
========================================================= */

const STEPS = ["Topics", "Your details", "Review & pay"];

const stepVariants = {
  enter: (direction) => ({ opacity: 0, x: direction > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (direction) => ({ opacity: 0, x: direction > 0 ? -40 : 40 }),
};

function BookingModal({
  slot,
  onClose,
  cashfreeMode,
  theme,
  timeZone = TIMEZONE,
  timeFormat = "12",
}) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [topics, setTopics] = useState([]);
  const [topicNotice, setTopicNotice] = useState(null);
  const [candidate, setCandidate] = useState(emptyCandidate);
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [paymentStarted, setPaymentStarted] = useState(false);

  const processingRef = useRef(false);
  const bodyRef = useRef(null);
  const fieldRefs = useRef({});
  const dialogRef = useRef(null);

  const availableTopics = (
    Array.isArray(slot.allowedTopics) && slot.allowedTopics.length > 0
      ? slot.allowedTopics
      : ALL_TOPICS
  ).filter((topic) => Boolean(TOPIC_INFO[topic]));

  const maxTopics = Math.min(
    Math.max(1, Number(slot.maxTopics) || 3),
    availableTopics.length
  );

  const priceText = fmtMoney(slot.price, slot.currency);
  const zoneShort =
    DISPLAY_TIMEZONES.find((zone) => zone.value === timeZone)?.short ||
    timeZone;

  const fieldErrors = useMemo(() => validateCandidate(candidate), [candidate]);
  const detailsValid = Object.keys(fieldErrors).length === 0;

  const change = (key, value) => {
    setCandidate((previous) => ({ ...previous, [key]: value }));
    // Real-time: start validating a field as soon as the user types in it.
    setTouched((previous) =>
      previous[key] ? previous : { ...previous, [key]: true }
    );
  };

  const blur = (key) => {
    setTouched((previous) =>
      previous[key] ? previous : { ...previous, [key]: true }
    );
  };

  const fieldProps = (key) => ({
    id: `mi-${key}`,
    error: fieldErrors[key],
    showError: Boolean(touched[key]),
    onBlur: () => blur(key),
    inputRef: (node) => {
      fieldRefs.current[key] = node;
    },
  });

  /* ---------- Topic selection: replace the OLDEST when over the limit ---------- */

  const toggleTopic = (topic) => {
    if (topics.includes(topic)) {
      setTopics(topics.filter((item) => item !== topic));
      setTopicNotice(null);
      return;
    }

    if (topics.length >= maxTopics) {
      const overflow = topics.length - maxTopics + 1;
      const removed = topics.slice(0, overflow);

      setTopics([...topics.slice(overflow), topic]);
      setTopicNotice({ added: topic, removed });
      return;
    }

    setTopics([...topics, topic]);
    setTopicNotice(null);
  };

  useEffect(() => {
    if (!topicNotice) return undefined;

    const timer = setTimeout(() => setTopicNotice(null), 4200);

    return () => clearTimeout(timer);
  }, [topicNotice]);

  /* ---------- Step navigation ---------- */

  const goTo = (nextStep) => {
    if (nextStep === step) return;

    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
    bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const touchAll = () => {
    setTouched((previous) => ({
      ...previous,
      ...Object.fromEntries(VALIDATED_FIELDS.map((key) => [key, true])),
    }));
  };

  const focusFirstInvalid = () => {
    const first = VALIDATED_FIELDS.find((key) => fieldErrors[key]);

    if (first) fieldRefs.current[first]?.focus();
  };

  const handleContinue = () => {
    setError("");

    if (step === 0) {
      if (topics.length === 0) {
        setError("Select at least one interview topic.");
        return;
      }

      goTo(1);
      return;
    }

    if (step === 1) {
      if (!detailsValid) {
        touchAll();
        focusFirstInvalid();
        return;
      }

      goTo(2);
    }
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    dialogRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy && !processingRef.current) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  /* =====================================================
     PUBLIC CHECKOUT

     1. Load Cashfree  2. Create booking  3. Create payment
     4. Open Cashfree  5. Redirect to payment-status
     No JWT used in any request.
  ===================================================== */

  async function checkout() {
    if (busy || processingRef.current) return;

    setError("");

    if (topics.length === 0) {
      setError("Select at least one interview topic.");
      goTo(0);
      return;
    }

    if (!detailsValid) {
      touchAll();
      goTo(1);
      return;
    }

    // Never create another payment when a gateway order was already started.
    if (paymentStarted && bookingId) {
      window.location.assign(paymentStatusUrl(bookingId));
      return;
    }

    processingRef.current = true;
    setBusy(true);

    let currentBookingId = bookingId;

    try {
      // Preload the same Cashfree v3 SDK used by the book checkout.
      const Cashfree = await loadCashfreeSDK();

      if (typeof Cashfree !== "function") {
        throw new Error("Unable to initialize Cashfree.");
      }

      // Guest booking: no JWT, no Authorization header.
      if (!currentBookingId) {
        const bookingResponse = await apiRequest("/bookings", {
          method: "POST",
          body: {
            slotId: slot._id,
            selectedTopics: topics,
            candidate: {
              name: candidate.name.trim(),
              email: candidate.email.trim(),
              phone: candidate.phone.trim(),
              experienceYears:
                candidate.experienceYears === ""
                  ? 0
                  : Number(candidate.experienceYears),
              currentRole: candidate.currentRole.trim(),
              targetRole: candidate.targetRole.trim(),
              currentCompany: candidate.currentCompany.trim(),
              resumeUrl: candidate.resumeUrl.trim(),
              notes: candidate.notes.trim(),
            },
          },
        });

        currentBookingId =
          bookingResponse?.data?.bookingId ||
          bookingResponse?.bookingId ||
          bookingResponse?.data?.booking?.bookingId ||
          bookingResponse?.booking?.bookingId;

        if (!currentBookingId) {
          throw new Error("Booking was created but no booking ID was returned.");
        }

        setBookingId(currentBookingId);
      }

      // Create order and get session, never manufacture one in the browser.
      const paymentResponse = await apiRequest(
        `/bookings/${encodeURIComponent(currentBookingId)}/payment`,
        { method: "POST" }
      );

      const paymentData = paymentResponse?.data || paymentResponse;
      const gatewayData = paymentData?.gatewayOrder || {};

      const sessionId =
        paymentData?.paymentSessionId ||
        paymentData?.payment_session_id ||
        gatewayData?.payment_session_id;

      const orderId =
        paymentData?.orderId ||
        paymentData?.order_id ||
        gatewayData?.order_id;

      if (typeof sessionId !== "string" || !sessionId.trim()) {
        console.error("[Interview Cashfree] Missing session", {
          responseKeys: Object.keys(paymentData || {}),
          bookingId: currentBookingId,
          orderId,
        });

        throw new Error(
          "Cashfree payment API did not return a valid paymentSessionId."
        );
      }

      // A backend-supplied environment wins, exactly like the working book flow.
      // Otherwise use the Vite environment; the explicit prop is the fallback.
      const serverMode = String(
        paymentData?.environment ||
          paymentData?.cashfreeEnvironment ||
          paymentData?.cashfreeMode ||
          ""
      )
        .trim()
        .toLowerCase();

      const viteMode = String(
        import.meta.env.VITE_CASHFREE_ENV ||
          import.meta.env.VITE_CASHFREE_MODE ||
          ""
      )
        .trim()
        .toLowerCase();

      const propMode = String(cashfreeMode || "").trim().toLowerCase();

      const mode = ["sandbox", "production"].includes(serverMode)
        ? serverMode
        : ["sandbox", "production"].includes(viteMode)
          ? viteMode
          : propMode;

      if (!["sandbox", "production"].includes(mode)) {
        throw new Error("Cashfree SDK environment is not configured.");
      }

      console.info("[Mock Interview Checkout]", {
        bookingId: currentBookingId,
        orderId,
        sdkMode: mode,
        serverMode: serverMode || "not returned",
        sessionExists: true,
        sessionLength: sessionId.trim().length,
        sessionPrefix: sessionId.trim().slice(0, 8),
      });

      // Order exists; do not generate an additional order on repeated clicks.
      setPaymentStarted(true);

      const cashfree = Cashfree({ mode });

      if (!cashfree || typeof cashfree.checkout !== "function") {
        throw new Error("Cashfree checkout is unavailable.");
      }

      const result = await cashfree.checkout({
        paymentSessionId: sessionId.trim(),
        redirectTarget: "_self",
      });

      if (result?.error) {
        const checkoutError = new Error(
          result.error.message || "Cashfree could not open checkout."
        );

        checkoutError.code = result.error.code;

        throw checkoutError;
      }

      // Do not mark paid: webhook / server reconciliation decides success.
    } catch (err) {
      console.error("[Mock Interview Payment Error]", {
        bookingId: currentBookingId,
        message: err.message,
        code: err.code,
        httpStatus: err.status,
      });

      if (err.status === 401 || err.status === 403) {
        setError(
          "The server refused this public booking request. Check whether the deployed booking or payment endpoint requires authentication."
        );
      } else {
        setError(
          currentBookingId
            ? `${
                err.message || "Unable to start payment."
              } Your booking reference has been saved. Check its status before attempting another payment.`
            : err.message || "Unable to open payment gateway."
        );
      }
    } finally {
      processingRef.current = false;
      setBusy(false);
    }
  }

  const reviewRows = [
    ["Name", candidate.name],
    ["Email", candidate.email],
    ["Phone", candidate.phone],
    [
      "Date",
      fmtDate(slot.startTime, {
        timeZone,
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    ],
    [
      "Time",
      `${fmtTime(slot.startTime, timeZone, timeFormat)} – ${fmtTime(
        slot.endTime,
        timeZone,
        timeFormat
      )} ${zoneShort}`,
    ],
    ["Duration", `${slot.durationMinutes || 45} minutes`],
  ];

  const modal = (
    <motion.div
      className="mi-portal"
      data-theme={theme}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button
        type="button"
        aria-label="Close booking dialog"
        tabIndex={-1}
        disabled={busy}
        onClick={onClose}
        className="mi-overlay"
      />

      <motion.section
        role="dialog"
        aria-modal="true"
        aria-labelledby="mi-dlg-title"
        ref={dialogRef}
        tabIndex={-1}
        className="mi-dialog"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <div className="mi-grab" aria-hidden="true" />

        {/* HEADER */}
        <div className="mi-dlg-head">
          <div>
            <span className="mi-eyebrow">Live 1:1 · Step {step + 1} of 3</span>
            <h2 id="mi-dlg-title">Book your mock interview</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="mi-icon-btn"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* BODY */}
        <div ref={bodyRef} className="mi-dlg-body">
          <ol className="mi-stepper" aria-label="Booking progress">
            {STEPS.map((name, index) => (
              <li
                key={name}
                className={cn(
                  "mi-stepper-item",
                  index === step && "is-on",
                  index < step && "is-done"
                )}
                aria-current={index === step ? "step" : undefined}
              >
                <div className="mi-stepper-bar">
                  <motion.i
                    initial={false}
                    animate={{ scaleX: index <= step ? 1 : 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                </div>
                <span>
                  {index < step && <Check size={12} weight="bold" />}
                  {name}
                </span>
              </li>
            ))}
          </ol>

          {/* SLOT SUMMARY */}
          <div className="mi-dlg-slot">
            <div>
              <b>
                {fmtDate(slot.startTime, {
                  timeZone,
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </b>
              <span>
                {fmtTime(slot.startTime, timeZone, timeFormat)} –{" "}
                {fmtTime(slot.endTime, timeZone, timeFormat)} · {slot.durationMinutes || 45} min · {zoneShort}
              </span>
            </div>
            <strong>{priceText}</strong>
          </div>

          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: EASE }}
            >
              {/* ==================== STEP 1: TOPICS ==================== */}
              {step === 0 && (
                <div className="mi-dlg-step">
                  <h3>What do you want to practise?</h3>
                  <p>
                    Pick up to {maxTopics} topic{maxTopics > 1 ? "s" : ""}.
                    {maxTopics > 1 &&
                      " If you pick one more, your oldest choice is swapped out."}
                  </p>

                  <div className="mi-meter" aria-hidden="true">
                    {Array.from({ length: maxTopics }).map((_, index) => (
                      <i key={index} className={index < topics.length ? "is-on" : ""} />
                    ))}
                    <span>
                      {topics.length} of {maxTopics} selected
                    </span>
                  </div>

                  <AnimatePresence>
                    {topicNotice && (
                      <motion.div
                        key={`${topicNotice.added}-${topicNotice.removed.join()}`}
                        role="status"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="mi-notice">
                          <ArrowClockwise size={16} weight="bold" />
                          <span>
                            Limit of {maxTopics} reached.{" "}
                            <strong>
                              {topicNotice.removed
                                .map((topic) => TOPIC_INFO[topic]?.title)
                                .join(", ")}
                            </strong>{" "}
                            was swapped for{" "}
                            <strong>{TOPIC_INFO[topicNotice.added]?.title}</strong>.
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mi-topics">
                    {availableTopics.map((topic) => {
                      const info = TOPIC_INFO[topic];
                      const Icon = info.Icon;
                      const position = topics.indexOf(topic);
                      const selected = position !== -1;
                      const replaceNext =
                        position === 0 &&
                        topics.length >= maxTopics &&
                        maxTopics > 1;

                      return (
                        <motion.button
                          key={topic}
                          type="button"
                          aria-pressed={selected}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => toggleTopic(topic)}
                          className={cn("mi-topic", selected && "is-on")}
                        >
                          <span className="mi-ico mi-ico-sm">
                            <Icon size={18} weight="duotone" />
                          </span>
                          <span style={{ minWidth: 0 }}>
                            <b>{info.title}</b>
                            <small>{info.description}</small>
                            {replaceNext && (
                              <span className="mi-topic-next">
                                <ArrowClockwise size={11} weight="bold" />
                                Swapped next
                              </span>
                            )}
                          </span>
                          <span className="mi-topic-check" aria-hidden="true">
                            {selected ? position + 1 : ""}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= STEP 2: CANDIDATE DETAILS ================= */}
              {step === 1 && (
                <div className="mi-dlg-step">
                  <h3>Tell us about yourself</h3>
                  <p>
                    No account needed. We use this to prepare your session and
                    email you the interview details.
                  </p>

                  <div className="mi-form">
                    <Field
                      {...fieldProps("name")}
                      label="Full name"
                      icon={User}
                      required
                      autoComplete="name"
                      value={candidate.name}
                      onChange={(value) => change("name", value)}
                      placeholder="Your full name"
                      maxLength={120}
                    />

                    <Field
                      {...fieldProps("email")}
                      label="Email"
                      icon={EnvelopeSimple}
                      required
                      type="email"
                      autoComplete="email"
                      value={candidate.email}
                      onChange={(value) => change("email", value.replace(/\s/g, ""))}
                      placeholder="you@example.com"
                      maxLength={254}
                      hint="Your confirmation and joining link go here."
                    />

                    <Field
                      {...fieldProps("phone")}
                      label="Phone"
                      icon={Phone}
                      required
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={candidate.phone}
                      onChange={(value) =>
                        change("phone", value.replace(/[^\d\s()+-]/g, ""))
                      }
                      placeholder="+91 98765 43210"
                      maxLength={20}
                      hint="10-digit Indian mobile, or +country code."
                    />

                    <Field
                      {...fieldProps("experienceYears")}
                      label="Experience in years"
                      icon={Briefcase}
                      optional
                      inputMode="decimal"
                      value={candidate.experienceYears}
                      onChange={(value) =>
                        change(
                          "experienceYears",
                          value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1")
                        )
                      }
                      placeholder="e.g. 2"
                      maxLength={5}
                    />

                    <p className="mi-form-sep">Helps your interviewer prepare</p>

                    <Field
                      {...fieldProps("currentRole")}
                      label="Current role"
                      icon={Briefcase}
                      optional
                      showValid={false}
                      value={candidate.currentRole}
                      onChange={(value) => change("currentRole", value)}
                      placeholder="Software Engineer"
                      maxLength={120}
                    />

                    <Field
                      {...fieldProps("targetRole")}
                      label="Target role"
                      icon={Target}
                      optional
                      showValid={false}
                      value={candidate.targetRole}
                      onChange={(value) => change("targetRole", value)}
                      placeholder="SDE-2 / Backend Engineer"
                      maxLength={120}
                    />

                    <Field
                      {...fieldProps("currentCompany")}
                      label="Current company"
                      icon={Buildings}
                      optional
                      showValid={false}
                      value={candidate.currentCompany}
                      onChange={(value) => change("currentCompany", value)}
                      placeholder="Where you work now"
                      maxLength={120}
                    />

                    <Field
                      {...fieldProps("resumeUrl")}
                      label="Resume link"
                      icon={LinkSimple}
                      optional
                      type="url"
                      inputMode="url"
                      value={candidate.resumeUrl}
                      onChange={(value) => change("resumeUrl", value.replace(/\s/g, ""))}
                      placeholder="https://drive.google.com/..."
                    />

                    <div className="is-wide">
                      <label htmlFor="mi-notes" className="mi-label">
                        What should we focus on? <small>(optional)</small>
                      </label>
                      <textarea
                        id="mi-notes"
                        className="mi-input"
                        value={candidate.notes}
                        onChange={(event) => change("notes", event.target.value)}
                        placeholder="Your goals, upcoming interview, weaker topics or projects to discuss."
                        maxLength={3000}
                      />
                      <span className="mi-count">{candidate.notes.length}/3000</span>
                    </div>
                  </div>

                  <div className="mi-info">
                    <EnvelopeSimple size={18} weight="duotone" />
                    <p>
                      Your confirmation and joining instructions are emailed
                      after the payment is verified. If the meeting link is
                      assigned later, it is sent separately.
                    </p>
                  </div>
                </div>
              )}

              {/* ============== STEP 3: REVIEW AND PAYMENT ============== */}
              {step === 2 && (
                <div className="mi-dlg-step">
                  <h3>Check and pay</h3>
                  <p>Make sure everything is right before going to Cashfree's secure checkout.</p>

                  <div className="mi-review">
                    <dl>
                      <div>
                        <dt>Topics</dt>
                        <dd className="mi-review-topics">
                          {topics.map((topic) => (
                            <span key={topic}>{TOPIC_INFO[topic]?.short || topic}</span>
                          ))}
                        </dd>
                      </div>
                      {reviewRows.map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>

                    <div className="mi-total">
                      <b>Total to pay</b>
                      <div>
                        {Number(slot.mrp) > Number(slot.price) && (
                          <s>{fmtMoney(slot.mrp, slot.currency)}</s>
                        )}
                        <strong>{priceText}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mi-info">
                    <LockKey size={18} weight="duotone" />
                    <p>
                      Cashfree processes the payment securely. Your interview is
                      confirmed once we verify the payment on our side.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* ERRORS */}
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mi-alert"
                style={{ marginTop: 18 }}
              >
                <WarningCircle size={20} weight="fill" />
                <div>{error}</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOOKING RECOVERY */}
          {bookingId && (
            <div className="mi-recover">
              <b>
                <ShieldCheck size={18} weight="duotone" />
                Booking reference saved
              </b>
              <code>{bookingId}</code>
              <p>
                If checkout was interrupted, check your payment status before
                paying again.
              </p>
              <a
                href={paymentStatusUrl(bookingId)}
                className="mi-btn mi-btn-ghost mi-btn-sm"
                style={{ marginTop: 12 }}
              >
                <ArrowClockwise size={15} weight="bold" />
                Check payment status
              </a>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mi-dlg-foot">
          <button
            type="button"
            disabled={busy}
            className="mi-btn mi-btn-ghost"
            onClick={
              step === 0
                ? onClose
                : () => {
                    setError("");
                    goTo(step - 1);
                  }
            }
          >
            <ArrowLeft size={16} weight="bold" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < 2 ? (
            <button
              type="button"
              className="mi-btn mi-btn-primary"
              disabled={step === 0 && topics.length === 0}
              onClick={handleContinue}
            >
              Continue
              <ArrowRight size={16} weight="bold" />
            </button>
          ) : (
            <button
              type="button"
              className="mi-btn mi-btn-primary"
              disabled={busy}
              onClick={checkout}
            >
              {busy ? (
                <SpinnerGap size={18} weight="bold" className="mi-spin" />
              ) : (
                <LockKey size={18} weight="bold" />
              )}
              {busy
                ? "Opening checkout..."
                : paymentStarted
                  ? "Check payment"
                  : `Pay ${priceText}`}
            </button>
          )}
        </div>
      </motion.section>
    </motion.div>
  );

  if (typeof document === "undefined") return null;

  return createPortal(modal, document.body);
}

/* =========================================================
   MAIN PAGE — PUBLIC GUEST BOOKING PAGE
   No authToken prop, no Redux user, no login redirect.
========================================================= */

export default function InterviewBookingPage({
  cashfreeMode = DEFAULT_CASHFREE_MODE,
}) {
  const theme = useNavbarTheme();
  const reduce = useReducedMotion();
  const rootRef = useRef(null);

  const [openFaq, setOpenFaq] = useState(0);
  const [track, setTrack] = useState(CURRICULUM[0].key);

  // Display preferences only. Server availability dates remain IST and
  // checkout uses slot._id.
  const [timeZone, setTimeZone] = useState(TIMEZONE);
  const [timeFormat, setTimeFormat] = useState("12");

  const displayZone =
    DISPLAY_TIMEZONES.find((zone) => zone.value === timeZone)?.short ||
    timeZone;

  const days = useMemo(upcomingDays, []);
  const [selectedDay, setSelectedDay] = useState(() => days[0]?.key || "");

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [viewFilter, setViewFilter] = useState("all");
  const [topicFilter, setTopicFilter] = useState("all");

  /* ---------- scroll progress, pinned tabs, active tab ---------- */

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 28 });
  const tabsSlotRef = useRef(null);
  const [pinned, setPinned] = useState(false);
  const [activeTab, setActiveTab] = useState(TABS[0].id);

  useMotionValueEvent(scrollY, "change", () => {
    const slot = tabsSlotRef.current;
    const root = rootRef.current;

    if (!slot || !root) return;

    const styles = getComputedStyle(root);
    const navH = parseFloat(styles.getPropertyValue("--nav-h")) || 64;
    const tabsH = parseFloat(styles.getPropertyValue("--tabs-h")) || 56;
    const pin = slot.getBoundingClientRect().top <= navH;

    setPinned((current) => (current === pin ? current : pin));

    // scroll spy: the last section whose top has passed under the bars
    let current = TABS[0].id;

    for (const tab of TABS) {
      const node = document.getElementById(tab.id);

      if (node && node.getBoundingClientRect().top <= navH + tabsH + 80) {
        current = tab.id;
      }
    }

    setActiveTab((previous) => (previous === current ? previous : current));
  });

  /* =====================================================
     GET PUBLIC SLOTS — GET /api/interviews/slots (no token)
  ===================================================== */

  const fetchSlots = useCallback(
    async (signal) => {
      if (!selectedDay) return;

      setLoading(true);
      setLoadError("");

      try {
        const result = await apiRequest(
          `/slots?date=${encodeURIComponent(selectedDay)}&includeUnavailable=true`,
          { signal }
        );

        const list = Array.isArray(result.data)
          ? result.data
          : Array.isArray(result.data?.slots)
            ? result.data.slots
            : [];

        if (!signal?.aborted) {
          setSlots(list.filter((slot) => !slot.isDeleted));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          setSlots([]);
          setLoadError(error.message || "Unable to load interview slots.");
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [selectedDay]
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchSlots(controller.signal);

    return () => controller.abort();
  }, [fetchSlots]);

  /* FILTERS */

  const shownSlots = useMemo(
    () =>
      slots
        .filter((slot) => {
          if (viewFilter === "available" && slot.status !== "AVAILABLE") {
            return false;
          }

          if (viewFilter === "unavailable" && slot.status === "AVAILABLE") {
            return false;
          }

          if (
            topicFilter !== "all" &&
            !(slot.allowedTopics || []).includes(topicFilter)
          ) {
            return false;
          }

          return true;
        })
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [slots, viewFilter, topicFilter]
  );

  const openSlots = useMemo(
    () =>
      slots
        .filter((slot) => slot.status === "AVAILABLE")
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)),
    [slots]
  );

  const countAvailable = openSlots.length;
  const countBooked = slots.filter((slot) => slot.status === "BOOKED").length;
  const countHeld = slots.filter((slot) => slot.status === "HELD").length;

  const nextSlot = openSlots[0] || null;

  const fromPrice = useMemo(() => {
    const prices = openSlots
      .map((slot) => Number(slot.price))
      .filter((value) => Number.isFinite(value));

    if (!prices.length) return null;

    const min = Math.min(...prices);
    const slot = openSlots.find((item) => Number(item.price) === min);

    return fmtMoney(min, slot?.currency);
  }, [openSlots]);

  const dayIndex = days.findIndex((day) => day.key === selectedDay);
  const dayWord =
    dayIndex === 0 ? "today" : dayIndex === 1 ? "tomorrow" : `on ${fmtDate(`${selectedDay}T12:00:00+05:30`, { weekday: "short", day: "numeric", month: "short" })}`;

  const handleBook = (slot) => {
    if (slot.status !== "AVAILABLE") return;

    setLoadError("");
    setSelectedSlot(slot);
  };

  const pickDay = (key) => {
    setSelectedDay(key);
    setViewFilter("all");
  };

  const goToNextDay = () => {
    const next = days[dayIndex + 1];

    if (next) pickDay(next.key);
  };

  const activeTrack = CURRICULUM.find((item) => item.key === track) || CURRICULUM[0];
  const ActiveTrackIcon = TOPIC_INFO[activeTrack.key]?.Icon || Code;

  const faqSchema = useMemo(
    () =>
      JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }),
    []
  );

  /* ---------- flow line on scroll ---------- */

  const flowRef = useRef(null);
  const { scrollYProgress: flowProgress } = useScroll({
    target: flowRef,
    offset: ["start 85%", "end 55%"],
  });
  const flowScale = useSpring(flowProgress, { stiffness: 100, damping: 24 });

  return (
    <MotionConfig reducedMotion="user">
      <Helmet>
        <title>{SEO_TITLE}</title>
        <meta name="description" content={SEO_DESCRIPTION} />
        <meta
          name="keywords"
          content="mock interview, system design mock interview, DSA mock interview, Java mock interview, backend interview practice, GenAI interview, LLD mock interview, HLD mock interview"
        />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Target Trek" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONT_URL} />
        <script type="application/ld+json">{faqSchema}</script>
      </Helmet>

      <motion.div className="mi-progress" style={{ scaleX: progress }} aria-hidden="true" />

      <main ref={rootRef} className="mi" data-theme={theme === "dark" ? "dark" : "light"}>
        {/* ===================================== */}
        {/* HERO                                  */}
        {/* ===================================== */}

        <section className="mi-hero" aria-labelledby="mi-title">
          <div className="mi-hero-bg" aria-hidden="true" />

          <div className="mi-shell mi-hero-grid">
            <div>
              <motion.p
                className="mi-pill"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <span className="mi-ping" aria-hidden="true" />
                <b>Live 1:1 mock interviews</b> with working engineers
              </motion.p>

              <motion.h1
                id="mi-title"
                className="mi-h1 mi-hero-title"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.08, ease: EASE }}
              >
                Find your weak spots <span className="mi-hl">before the real interview</span> does.
              </motion.h1>

              <motion.p
                className="mi-lead mi-hero-lead"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
              >
                Practise a real technical round in DSA, System Design, Java,
                Spring Boot or GenAI. Get honest feedback on how you think and
                how you explain it, so the actual interview feels familiar.
              </motion.p>

              <motion.div
                className="mi-hero-actions"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.26, ease: EASE }}
              >
                <button
                  type="button"
                  className="mi-btn mi-btn-primary mi-btn-lg"
                  onClick={() => scrollToId("interview-slots")}
                >
                  See open slots
                  <ArrowRight size={18} weight="bold" />
                </button>
                <button
                  type="button"
                  className="mi-btn mi-btn-ghost mi-btn-lg"
                  onClick={() => scrollToId("how-it-works")}
                >
                  How it works
                </button>
              </motion.div>

              <motion.div
                className="mi-hero-tracks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.36 }}
              >
                <span>Tracks:</span>
                {ALL_TOPICS.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className="mi-chip"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setTrack(topic);
                      scrollToId("interview-topics");
                    }}
                  >
                    {TOPIC_INFO[topic].short}
                  </button>
                ))}
              </motion.div>

              <motion.ul
                className="mi-hero-trust"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.44, ease: EASE }}
              >
                {PAGE_STATS.map(({ value, label }) => (
                  <li key={label}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </li>
                ))}
              </motion.ul>
            </div>

            {/* SAMPLE FEEDBACK CARD + NEXT SLOT */}
            <motion.div
              className="mi-score-wrap"
              initial={{ opacity: 0, y: 40, rotate: reduce ? 0 : 2 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            >
              <div className="mi-score">
                <div className="mi-score-top">
                  <span className="mi-score-tag">
                    <ChatCircleText size={16} weight="fill" />
                    Feedback you take home
                  </span>
                  <span className="mi-score-live">Sample</span>
                </div>

                <div className="mi-score-who">
                  <span className="mi-avatar" aria-hidden="true">SD</span>
                  <div>
                    <b>System Design round</b>
                    <span>60 min · Live 1:1 · Design a URL shortener</span>
                  </div>
                </div>

                <div className="mi-bars">
                  <ScoreBar label="Problem breakdown" value={8} delay={0.5} />
                  <ScoreBar label="Communication" value={7} delay={0.6} />
                  <ScoreBar label="Trade-offs & scaling" value={5} focus delay={0.7} />
                  <ScoreBar label="Data modelling" value={7} delay={0.8} />
                </div>

                <div className="mi-note">
                  <small>Work on next</small>
                  Talk through cache invalidation and the read/write ratio
                  before picking a database. Start with the numbers.
                </div>

                <p className="mi-score-foot">
                  Illustration of the kind of points discussed. Feedback format
                  depends on your session.
                </p>
              </div>

              <div className="mi-next" aria-live="polite">
                <span className="mi-ico mi-ico-sm">
                  <CalendarBlank size={18} weight="duotone" />
                </span>
                <div className="mi-next-main">
                  {loading ? (
                    <>
                      <small>Checking availability</small>
                      <b className="mi-skel" style={{ height: 16, width: 150, marginTop: 4 }} />
                    </>
                  ) : nextSlot ? (
                    <>
                      <small>Next open slot {dayWord}</small>
                      <b>
                        {fmtTime(nextSlot.startTime, timeZone, timeFormat)} {displayZone} ·{" "}
                        {fmtMoney(nextSlot.price, nextSlot.currency)}
                      </b>
                    </>
                  ) : (
                    <>
                      <small>New slots open regularly</small>
                      <b>Browse the next 8 days</b>
                    </>
                  )}
                </div>
                {nextSlot && !loading ? (
                  <button
                    type="button"
                    className="mi-btn mi-btn-primary mi-btn-sm"
                    onClick={() => handleBook(nextSlot)}
                  >
                    Book
                  </button>
                ) : (
                  <button
                    type="button"
                    className="mi-btn mi-btn-ghost mi-btn-sm"
                    onClick={() => scrollToId("interview-slots")}
                  >
                    View
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===================================== */}
        {/* INTERVIEWER BACKGROUNDS               */}
        {/* ===================================== */}

        <section className="mi-logos" aria-label="Interviewer backgrounds">
          <div className="mi-shell">
            <p className="mi-logos-title">
              Our interviewers have worked as <b>engineers at companies like these</b>
            </p>
          </div>

          <div className="mi-marquee">
            <div className="mi-marquee-track">
              {[...INTERVIEWER_COMPANIES, ...INTERVIEWER_COMPANIES].map((company, index) => (
                <span
                  className="mi-logo"
                  key={`${company.name}-${index}`}
                  aria-hidden={index >= INTERVIEWER_COMPANIES.length ? "true" : undefined}
                >
                  <img
                    src={favicon(company.domain)}
                    alt=""
                    loading="lazy"
                    width="20"
                    height="20"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                  {company.name}
                </span>
              ))}
            </div>
          </div>

          <div className="mi-shell">
            <p className="mi-logos-note">
              Names describe interviewers' professional backgrounds, not
              partnerships or endorsements. The interviewer for a slot may vary.
            </p>
          </div>
        </section>

        {/* ===================================== */}
        {/* STICKY TABS                           */}
        {/* ===================================== */}

        <div ref={tabsSlotRef} className="mi-tabs-slot">
          <nav className={cn("mi-tabs", pinned && "is-pinned")} aria-label="On this page">
            <div className="mi-shell mi-tabs-in">
              <div className="mi-tabs-list">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={cn("mi-tab", activeTab === tab.id && "is-on")}
                    aria-current={activeTab === tab.id ? "true" : undefined}
                    onClick={() => scrollToId(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mi-tabs-cta">
                {fromPrice && (
                  <span>
                    From <b>{fromPrice}</b>
                  </span>
                )}
                <button
                  type="button"
                  className="mi-btn mi-btn-primary mi-btn-sm"
                  onClick={() => scrollToId("interview-slots")}
                >
                  Book a slot
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* ===================================== */}
        {/* SLOTS                                 */}
        {/* ===================================== */}

        <section id="interview-slots" className="mi-sec" aria-labelledby="mi-slots-title">
          <div className="mi-shell">
            <SectionHead
              id="mi-slots-title"
              eyebrow="Book your session"
              title={
                <>
                  Pick a time that <span className="mi-hl">works for you</span>
                </>
              }
              lead="Choose a date, then an open slot. You'll pick your topics and add your details in the next step."
            />

            <div className="mi-book">
              <div className="mi-book-bar">
                <p className="mi-step-label">
                  <span className="mi-step-num">1</span>
                  Choose a date <span className="mi-muted mi-xs" style={{ fontWeight: 600 }}>(IST)</span>
                </p>

                <div className="mi-days" role="group" aria-label="Choose a date">
                  {days.map(({ key, date }, index) => {
                    const active = selectedDay === key;

                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => pickDay(key)}
                        className={cn("mi-day", active && "is-on")}
                      >
                        {active && (
                          <motion.span
                            layoutId="mi-day-bg"
                            className="mi-day-bg"
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        <small>
                          {index === 0 ? "Today" : index === 1 ? "Tmrw" : fmtDate(date, { weekday: "short" })}
                        </small>
                        <b>{fmtDate(date, { day: "numeric" })}</b>
                        <span>{fmtDate(date, { month: "short" })}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mi-controls">
                  <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
                    <p className="mi-step-label">
                      <span className="mi-step-num">2</span>
                      Filter by topic
                    </p>
                    <div className="mi-topic-chips" role="group" aria-label="Filter by topic">
                      <button
                        type="button"
                        className={cn("mi-filter", topicFilter === "all" && "is-on")}
                        aria-pressed={topicFilter === "all"}
                        onClick={() => setTopicFilter("all")}
                      >
                        All topics
                      </button>
                      {ALL_TOPICS.map((topic) => {
                        const Icon = TOPIC_INFO[topic].Icon;

                        return (
                          <button
                            key={topic}
                            type="button"
                            className={cn("mi-filter", topicFilter === topic && "is-on")}
                            aria-pressed={topicFilter === topic}
                            onClick={() => setTopicFilter(topic)}
                          >
                            <Icon size={15} weight="bold" />
                            {TOPIC_INFO[topic].short}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mi-tz">
                    <label className="mi-select-wrap">
                      <span>Show times in</span>
                      <select
                        className="mi-select"
                        value={timeZone}
                        onChange={(event) => setTimeZone(event.target.value)}
                      >
                        {DISPLAY_TIMEZONES.map((zone) => (
                          <option key={zone.value} value={zone.value}>
                            {zone.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="mi-select-wrap" style={{ flex: "0 1 150px" }}>
                      <span>Clock</span>
                      <select
                        className="mi-select"
                        value={timeFormat}
                        onChange={(event) => setTimeFormat(event.target.value)}
                      >
                        <option value="12">12-hour</option>
                        <option value="24">24-hour</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              {/* DAY HEADER */}
              <div className="mi-day-head">
                <div>
                  <h3>{selectedDateLabel(selectedDay)}</h3>
                  <div className="mi-counts" aria-live="polite">
                    {loading ? (
                      <span className="mi-chip">Checking availability…</span>
                    ) : (
                      <>
                        <span className="mi-chip" style={{ color: "var(--ok)" }}>
                          {countAvailable} open
                        </span>
                        {countBooked > 0 && <span className="mi-chip">{countBooked} booked</span>}
                        {countHeld > 0 && <span className="mi-chip">{countHeld} reserved</span>}
                      </>
                    )}
                  </div>
                </div>

                <div className="mi-seg" role="group" aria-label="Show slots">
                  {[
                    { key: "all", label: "All" },
                    { key: "available", label: "Open" },
                    { key: "unavailable", label: "Taken" },
                  ].map((filter) => {
                    const active = viewFilter === filter.key;

                    return (
                      <button
                        key={filter.key}
                        type="button"
                        aria-pressed={active}
                        className={active ? "is-on" : ""}
                        onClick={() => setViewFilter(filter.key)}
                      >
                        {active && (
                          <motion.span
                            layoutId="mi-seg-bg"
                            className="mi-seg-bg"
                            transition={{ type: "spring", stiffness: 400, damping: 32 }}
                          />
                        )}
                        <span>{filter.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ERROR */}
              {loadError && (
                <div className="mi-alert" role="alert">
                  <WarningCircle size={20} weight="fill" />
                  <div>{loadError}</div>
                  <button type="button" onClick={() => fetchSlots()}>
                    Try again
                  </button>
                </div>
              )}

              {/* LOADING / EMPTY / SLOTS */}
              {loading ? (
                <div className="mi-slots" aria-busy="true">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="mi-slot" style={{ padding: 20, gap: 14 }}>
                      <div className="mi-skel" style={{ height: 22, width: "45%" }} />
                      <div className="mi-skel" style={{ height: 36, width: "70%" }} />
                      <div className="mi-skel" style={{ height: 18, width: "55%" }} />
                      <div className="mi-skel" style={{ height: 44, marginTop: 10 }} />
                    </div>
                  ))}
                </div>
              ) : shownSlots.length === 0 ? (
                <motion.div
                  className="mi-empty"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <span className="mi-ico">
                    <CalendarBlank size={28} weight="duotone" />
                  </span>
                  <h3 className="mi-h3">
                    {slots.length === 0 ? `No slots ${dayWord} yet` : "No slots match these filters"}
                  </h3>
                  <p>
                    {slots.length === 0
                      ? "Try another date. New sessions are added regularly."
                      : "Clear the filters to see every slot for this date."}
                  </p>
                  <div className="mi-empty-actions">
                    {(viewFilter !== "all" || topicFilter !== "all") && (
                      <button
                        type="button"
                        className="mi-btn mi-btn-ghost"
                        onClick={() => {
                          setViewFilter("all");
                          setTopicFilter("all");
                        }}
                      >
                        Clear filters
                      </button>
                    )}
                    {dayIndex < days.length - 1 && (
                      <button type="button" className="mi-btn mi-btn-primary" onClick={goToNextDay}>
                        Check the next day
                        <ArrowRight size={16} weight="bold" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="mi-slots" key={`${selectedDay}-${viewFilter}-${topicFilter}`}>
                  {shownSlots.map((slot, index) => {
                    const available = slot.status === "AVAILABLE";
                    const topics =
                      Array.isArray(slot.allowedTopics) && slot.allowedTopics.length
                        ? slot.allowedTopics
                        : ALL_TOPICS;
                    const hasDiscount = Number(slot.mrp) > Number(slot.price);
                    const off = hasDiscount
                      ? Math.round((1 - Number(slot.price) / Number(slot.mrp)) * 100)
                      : 0;
                    const time = fmtTime(slot.startTime, timeZone, timeFormat);
                    const [clock, meridiem] = time.split(/\s(?=[AaPp][Mm]$)/);

                    return (
                      <motion.article
                        key={slot._id}
                        className={cn("mi-slot", available ? "is-open" : "is-closed")}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: EASE }}
                      >
                        <div className="mi-slot-body">
                          <div className="mi-slot-top">
                            <span className="mi-slot-kind">
                              <VideoCamera size={16} weight="duotone" />
                              <span>{slot.title || "Technical mock interview"}</span>
                            </span>
                            <StatusBadge slot={slot} />
                          </div>

                          <p className="mi-slot-time">
                            {clock}
                            {meridiem && <small> {meridiem.toUpperCase()}</small>}
                          </p>

                          <div className="mi-slot-meta">
                            <span>
                              <Clock size={15} weight="bold" />
                              {slot.durationMinutes || 45} min
                            </span>
                            <span>
                              Ends {fmtTime(slot.endTime, timeZone, timeFormat)} {displayZone}
                            </span>
                          </div>

                          {timeZone !== TIMEZONE && (
                            <p className="mi-slot-local">
                              Your date: {fmtSlotDate(slot.startTime, timeZone)} ·
                              {" "}{fmtTime(slot.startTime, TIMEZONE, "12")} IST
                            </p>
                          )}

                          <div className="mi-slot-topics">
                            {topics.slice(0, 5).map((topic) => (
                              <span key={topic} className="mi-chip">
                                {TOPIC_INFO[topic]?.short || topic}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mi-slot-foot">
                          <div className="mi-slot-price">
                            <small>Session price</small>
                            <b>{fmtMoney(slot.price, slot.currency)}</b>
                            {hasDiscount && (
                              <>
                                <s>{fmtMoney(slot.mrp, slot.currency)}</s>
                                {off > 0 && <span className="mi-off">{off}% off</span>}
                              </>
                            )}
                          </div>

                          {available ? (
                            <button
                              type="button"
                              className="mi-btn mi-btn-primary"
                              onClick={() => handleBook(slot)}
                              aria-label={`Book the ${time} slot`}
                            >
                              Book
                              <ArrowRight size={16} weight="bold" />
                            </button>
                          ) : (
                            <button type="button" className="mi-btn mi-btn-muted" disabled>
                              Taken
                            </button>
                          )}
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}

              <div className="mi-book-help">
                <span><SealCheck size={17} weight="fill" /> No account needed</span>
                <span><LockKey size={17} weight="fill" /> Secure Cashfree checkout</span>
                <span><EnvelopeSimple size={17} weight="fill" /> Joining details by email</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================== */}
        {/* WHAT YOU GET                          */}
        {/* ===================================== */}

        <section id="what-you-get" className="mi-sec mi-tint" aria-labelledby="mi-get-title">
          <div className="mi-shell">
            <SectionHead
              id="mi-get-title"
              eyebrow="What you get"
              title={
                <>
                  More than another <span className="mi-hl">practice question</span>
                </>
              }
              lead="A live session that shows your blind spots before the real interview, and gives you a short list of things to fix."
            />

            <div className="mi-bento">
              <Reveal className="mi-card mi-benefit is-feature">
                <span className="mi-ico">
                  <ChatCircleText size={24} weight="duotone" />
                </span>
                <h3 className="mi-h3">Honest, specific feedback</h3>
                <p>
                  Your interviewer walks you through what went well and what
                  didn't, so you know exactly what to practise next. Written
                  feedback is included when the slot says so.
                </p>
                <ul className="mi-feedback-list">
                  {FEEDBACK_POINTS.map((point) => (
                    <li key={point}>
                      <CheckCircle size={18} weight="fill" />
                      {point}
                    </li>
                  ))}
                </ul>
              </Reveal>

              {SESSION_BENEFITS.map(({ Icon, title, description }, index) => (
                <Reveal key={title} delay={(index % 3) * 0.06} className="mi-card mi-card-hover mi-benefit">
                  <span className="mi-ico">
                    <Icon size={22} weight="duotone" />
                  </span>
                  <h3 className="mi-h3">{title}</h3>
                  <p>{description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================== */}
        {/* TOPICS / TRACKS                       */}
        {/* ===================================== */}

        <section id="interview-topics" className="mi-sec" aria-labelledby="mi-topics-title">
          <div className="mi-shell">
            <SectionHead
              id="mi-topics-title"
              eyebrow="What we can cover"
              title={
                <>
                  Practise the <span className="mi-hl">rounds that matter</span>
                </>
              }
              lead="Five tracks, each focused on reasoning and clear communication, not memorised answers. Pick a track to see what's covered."
            />

            <div className="mi-tracks">
              <div className="mi-track-list" role="tablist" aria-label="Interview tracks">
                {CURRICULUM.map((item) => {
                  const Icon = TOPIC_INFO[item.key].Icon;
                  const on = track === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      aria-controls="mi-track-panel"
                      className={cn("mi-track-btn", on && "is-on")}
                      onClick={() => setTrack(item.key)}
                    >
                      <span className="mi-ico mi-ico-sm">
                        <Icon size={18} weight="duotone" />
                      </span>
                      <span>
                        <b>{item.title}</b>
                        <small>{item.tagline}</small>
                      </span>
                      <CaretRight size={18} weight="bold" className="mi-track-caret" />
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTrack.key}
                  id="mi-track-panel"
                  role="tabpanel"
                  className="mi-track-panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  <div className="mi-track-panel-head">
                    <span className="mi-ico">
                      <ActiveTrackIcon size={26} weight="duotone" />
                    </span>
                    <div>
                      <h3 className="mi-h3">{activeTrack.title}</h3>
                      <p className="mi-muted" style={{ marginTop: 4 }}>{activeTrack.tagline}</p>
                    </div>
                  </div>

                  <ul>
                    {activeTrack.points.map((point) => (
                      <li key={point}>
                        <Check size={18} weight="bold" />
                        {point}
                      </li>
                    ))}
                  </ul>

                  <div className="mi-track-cta">
                    <p>
                      Preparing for a specific company or round? Add the job
                      description or topics in your booking notes.
                    </p>
                    <button
                      type="button"
                      className="mi-btn mi-btn-primary"
                      onClick={() => {
                        setTopicFilter(activeTrack.key);
                        scrollToId("interview-slots");
                      }}
                    >
                      Find a {TOPIC_INFO[activeTrack.key].short} slot
                      <ArrowRight size={16} weight="bold" />
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ===================================== */}
        {/* INSIDE THE SESSION + WHO IT'S FOR     */}
        {/* ===================================== */}

        <section id="session-experience" className="mi-sec mi-tint" aria-labelledby="mi-flow-title">
          <div className="mi-shell">
            <SectionHead
              id="mi-flow-title"
              eyebrow="Inside the session"
              title={
                <>
                  An interview, <span className="mi-hl">not a lecture</span>
                </>
              }
              lead="The session follows a real interview's shape, adjusted to your topics and the length of your slot."
            />

            <div className="mi-flow" ref={flowRef}>
              <div className="mi-flow-line" aria-hidden="true">
                <motion.i style={{ scaleX: reduce ? 1 : flowScale }} />
              </div>

              {SESSION_FLOW.map(([number, title, description, tag], index) => (
                <Reveal key={number} delay={index * 0.08} className="mi-card mi-flow-step">
                  <span className="mi-flow-n">{number}</span>
                  <h3 className="mi-h3">{title}</h3>
                  <p>{description}</p>
                  <span className="mi-chip">{tag}</span>
                </Reveal>
              ))}
            </div>

            <p className="mi-xs mi-muted" style={{ marginTop: 16 }}>
              Session length decides how deep each topic can go. No specific
              question or hiring result is guaranteed.
            </p>

            <div className="mi-who">
              {AUDIENCE.map(([title, description, tag], index) => (
                <Reveal key={title} delay={index * 0.06} className="mi-card mi-card-hover mi-who-card">
                  <span className="mi-chip">{tag}</span>
                  <h3 className="mi-h3">{title}</h3>
                  <p>{description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ===================================== */}
        {/* HOW IT WORKS + TARGETS                */}
        {/* ===================================== */}

        <section id="how-it-works" className="mi-sec" aria-labelledby="mi-how-title">
          <div className="mi-shell">
            <SectionHead
              id="mi-how-title"
              eyebrow="How booking works"
              title={
                <>
                  Booked in <span className="mi-hl">three steps</span>
                </>
              }
              lead="No sign-up and no back-and-forth. Pick a slot, pay, and you're set."
              aside={
                <button
                  type="button"
                  className="mi-btn mi-btn-primary mi-btn-lg"
                  onClick={() => scrollToId("interview-slots")}
                >
                  Pick a slot
                  <ArrowRight size={18} weight="bold" />
                </button>
              }
            />

            <div className="mi-steps">
              {HOW_IT_WORKS.map(({ title, description, Icon }, index) => (
                <Reveal key={title} delay={index * 0.08} className="mi-card mi-card-hover mi-howto">
                  <div className="mi-howto-top">
                    <span className="mi-ico">
                      <Icon size={22} weight="duotone" />
                    </span>
                    <b>STEP 0{index + 1}</b>
                  </div>
                  <h3 className="mi-h3">{title}</h3>
                  <p>{description}</p>
                </Reveal>
              ))}
            </div>

            <div style={{ marginTop: 72 }}>
              <SectionHead
                eyebrow="Aim higher"
                title="Getting ready for top tech interviews?"
                lead="Build the coding, backend, design and communication skills that tough software engineering interviews test."
              />

              <div className="mi-targets">
                {TARGET_COMPANIES.map((company, index) => (
                  <Reveal key={company.name} delay={(index % 4) * 0.05} className="mi-card mi-target">
                    <img
                      src={favicon(company.domain)}
                      alt=""
                      loading="lazy"
                      width="24"
                      height="24"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                    {company.name}
                  </Reveal>
                ))}
              </div>

              <p className="mi-xs mi-muted" style={{ marginTop: 14 }}>
                These are preparation targets, not employers or partners of
                Target Trek. Mock interviews do not guarantee selection or offers.
              </p>
            </div>
          </div>
        </section>

        {/* ===================================== */}
        {/* FAQ                                   */}
        {/* ===================================== */}

        <section id="mock-faq" className="mi-sec mi-tint" aria-labelledby="mi-faq-title">
          <div className="mi-shell mi-faq">
            <div className="mi-faq-side">
              <SectionHead
                id="mi-faq-title"
                eyebrow="FAQ"
                title="Good to know before you book"
                lead="Who you'll talk to, what you get, payment and cancellations."
              />

              <Reveal className="mi-faq-help">
                <span className="mi-ico mi-ico-sm">
                  <EnvelopeSimple size={18} weight="duotone" />
                </span>
                <div>
                  <b>Still have a question?</b>
                  <p>We usually reply within a day.</p>
                  <a className="mi-link" href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </Reveal>
            </div>

            <div className="mi-faq-list">
              {FAQ_ITEMS.map((item, index) => {
                const open = openFaq === index;

                return (
                  <div key={item.question} className={cn("mi-faq-item", open && "is-open")}>
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`mi-faq-${index}`}
                      onClick={() => setOpenFaq((old) => (old === index ? -1 : index))}
                    >
                      <span>{item.question}</span>
                      <span className="mi-faq-icon" aria-hidden="true">
                        <Plus size={16} weight="bold" />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          id={`mi-faq-${index}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                          style={{ overflow: "hidden" }}
                        >
                          <p className="mi-faq-answer">{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===================================== */}
        {/* FINAL CTA + POLICY                    */}
        {/* ===================================== */}

        <section className="mi-sec" aria-labelledby="mi-cta-title">
          <div className="mi-shell">
            <Reveal className="mi-cta">
              <div>
                <span className="mi-eyebrow" style={{ color: "var(--panel-accent)" }}>
                  <Lightning size={16} weight="fill" />
                  Your next interview
                </span>
                <h2 id="mi-cta-title" className="mi-h2" style={{ marginTop: 12 }}>
                  Walk in having already done it once.
                </h2>
                <p>
                  Pick a date, choose your topics and book a live 1:1 mock
                  interview{fromPrice ? `, from ${fromPrice}` : ""}. It takes
                  about two minutes.
                </p>
              </div>

              <div className="mi-cta-actions">
                <button
                  type="button"
                  className="mi-btn mi-btn-mark mi-btn-lg"
                  onClick={() => scrollToId("interview-slots")}
                >
                  See open slots
                  <ArrowRight size={18} weight="bold" />
                </button>
              </div>
            </Reveal>

            <Reveal className="mi-policy">
              <span className="mi-ico">
                <GraduationCap size={22} weight="duotone" />
              </span>
              <div>
                <h3>Need to cancel or reschedule?</h3>
                <p>
                  Email support from the address you booked with and include
                  your booking ID, at least 24 hours before your interview. A
                  ₹199 cancellation fee applies; requests within 24 hours are
                  non-refundable, subject to the applicable terms.
                </p>
              </div>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  "Mock Interview Booking Support"
                )}`}
                className="mi-btn mi-btn-ghost"
              >
                <EnvelopeSimple size={17} weight="bold" />
                Contact support
              </a>
            </Reveal>
          </div>
        </section>

        <div className="mi-dock-space" aria-hidden="true" />
      </main>

      {/* MOBILE STICKY BAR */}
      <div className="mi mi-dock" data-theme={theme === "dark" ? "dark" : "light"} style={{ minHeight: 0 }}>
        <div className="mi-dock-main">
          <b>Live 1:1 mock interview</b>
          <span>
            {fromPrice ? `From ${fromPrice} · ` : ""}
            {countAvailable > 0 ? `${countAvailable} open ${dayWord}` : "Pick a date and time"}
          </span>
        </div>
        <button
          type="button"
          className="mi-btn mi-btn-primary"
          onClick={() => scrollToId("interview-slots")}
        >
          Book a slot
        </button>
      </div>

      {/* BOOKING DIALOG */}
      <AnimatePresence>
        {selectedSlot && (
          <BookingModal
            key={selectedSlot._id}
            slot={selectedSlot}
            theme={theme === "dark" ? "dark" : "light"}
            timeZone={timeZone}
            timeFormat={timeFormat}
            cashfreeMode={cashfreeMode}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
