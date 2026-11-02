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
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  Briefcase,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  CreditCard,
  GraduationCap,
  HelpCircle,
  Layers3,
  Link2,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Network,
  Phone,
  RefreshCw,
  Send,
  ServerCog,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Video,
  X,
} from "lucide-react";

/* =========================================================
   CONFIGURATION
========================================================= */

const BASE_URL = (
  import.meta.env.VITE_BASE_URL || "http://localhost:5001"
).replace(/\/+$/, "");

const API = `${BASE_URL}/api/interviews`;
const PAYMENT_STATUS_PATH = "/mock-interviews/payment-status";
const TIMEZONE = "Asia/Kolkata";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const DEFAULT_CASHFREE_MODE =
  import.meta.env.VITE_CASHFREE_ENV === "production"
    ? "production"
    : "sandbox";

const EASE = [0.25, 0.1, 0.25, 1];

/* =========================================================
   INTERVIEW TOPICS
========================================================= */

const TOPIC_INFO = {
  DSA: {
    title: "Data Structures & Algorithms",
    description:
      "Coding questions, problem solving, complexity analysis and edge cases.",
    Icon: Code2,
  },
  LLD: {
    title: "Low-Level Design",
    description:
      "Object-oriented design, SOLID, design patterns and concurrency.",
    Icon: Layers3,
  },
  HLD: {
    title: "High-Level System Design",
    description:
      "Distributed systems, scalability, caching, databases and architecture.",
    Icon: Network,
  },
  GENAI: {
    title: "Generative AI Engineering",
    description:
      "RAG, AI agents, LLMs, evaluation and production GenAI systems.",
    Icon: BrainCircuit,
  },
  PROJECTS: {
    title: "Backend Engineering & Projects",
    description:
      "Java, Spring Boot, microservices, API design, databases, projects and trade-offs.",
    Icon: BriefcaseBusiness,
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
  { value: "25+", label: "Mock interviews conducted", Icon: Video },
  { value: "1:1", label: "Working engineer-led sessions", Icon: ServerCog },
  { value: "Live", label: "Technical questions & feedback", Icon: Layers3 },
  { value: "5", label: "Interview preparation tracks", Icon: Target },
];

const CURRICULUM = [
  {
    key: "DSA",
    Icon: Code2,
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
    Icon: Layers3,
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
    Icon: Network,
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
    Icon: BrainCircuit,
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
    Icon: BriefcaseBusiness,
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
    Icon: Video,
    title: "Real 1:1 technical discussion",
    description:
      "Practice explaining your approach live to an engineer instead of solving problems silently.",
  },
  {
    Icon: MessageSquareText,
    title: "Detailed interview feedback",
    description:
      "Receive an interviewer-led breakdown of your technical approach, communication, problem-solving gaps, and priority areas to improve. Written feedback is provided when included in the selected session.",
  },
  {
    Icon: BrainCircuit,
    title: "Deeper follow-up questions",
    description:
      "Discuss edge cases, scalability, alternatives and trade-offs that interviewers often probe.",
  },
  {
    Icon: Target,
    title: "Tailored to your target role",
    description:
      "Share your experience and upcoming interview so the available session topics can reflect your goals.",
  },
  {
    Icon: Clock3,
    title: "Choose your duration",
    description:
      "Pick a listed slot that matches the depth of practice you need, with pricing shown before payment.",
  },
  {
    Icon: ShieldCheck,
    title: "Clear booking workflow",
    description:
      "Book as a guest, pay through Cashfree and receive confirmation after server-side payment verification.",
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
    const sync = () => setTheme(readTheme());

    window.addEventListener("storage", sync);
    window.addEventListener("themechange", sync);
    window.addEventListener("targettrek-theme-change", sync);

    const observer = new MutationObserver(sync);

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
  });
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
   SCOPED STYLES (light + dark, orange theme)
========================================================= */

const styles = `
.tt-ib {
  --ib-bg: #fffaf5;
  --ib-surface: #ffffff;
  --ib-alt: #fff1e3;
  --ib-text: #2a1f18;
  --ib-muted: #7a6a5e;
  --ib-border: #f1dcc8;
  --ib-orange: #ea580c;
  --ib-orange-light: #ffedd5;
  --ib-input: #ffffff;
  --ib-green: #166534;
  --ib-green-bg: #ecfdf3;
  --ib-red: #dc2626;
  --ib-red-bg: #fef2f2;
  --ib-grid: rgba(234,88,12,.07);
  --ib-glow: rgba(249,115,22,.22);

  background: var(--ib-bg);
  color: var(--ib-text);
  font-family: Inter, system-ui, sans-serif;
  color-scheme: light;
  min-height: 100vh;
}

.tt-ib[data-ib-theme="dark"] {
  --ib-bg: #0f0b08;
  --ib-surface: #1b1511;
  --ib-alt: #17110d;
  --ib-text: #fff6ee;
  --ib-muted: #bfae9f;
  --ib-border: #3a2a1f;
  --ib-orange: #fb923c;
  --ib-orange-light: #3a2314;
  --ib-input: #20180f;
  --ib-green: #86efac;
  --ib-green-bg: #153424;
  --ib-red: #f87171;
  --ib-red-bg: #3b1e20;
  --ib-grid: rgba(251,146,60,.07);
  --ib-glow: rgba(249,115,22,.18);

  color-scheme: dark;
}

.tt-ib *, .tt-ib *::before, .tt-ib *::after { box-sizing: border-box; }

.tt-ib .ib-card {
  background: var(--ib-surface);
  border: 1px solid var(--ib-border);
  color: var(--ib-text);
  transition: border-color .25s, box-shadow .25s;
}
.tt-ib .ib-card-hover:hover {
  border-color: var(--ib-orange);
  box-shadow: 0 18px 45px -18px var(--ib-glow);
}
.tt-ib .ib-panel { background: var(--ib-alt); }
.tt-ib .ib-muted { color: var(--ib-muted); }
.tt-ib .ib-orange { color: var(--ib-orange); }
.tt-ib .ib-req { color: var(--ib-red); }

.tt-ib .ib-grad-text {
  background-image: linear-gradient(90deg,#ea580c,#f59e0b,#ea580c);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ib-shine 6s linear infinite;
}

.tt-ib .ib-field {
  width: 100%;
  background: var(--ib-input);
  color: var(--ib-text);
  border: 1px solid var(--ib-border);
  border-radius: 12px;
  padding: 12px 13px;
  font-size: 14px;
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.tt-ib .ib-field.has-icon { padding-left: 40px; }
.tt-ib .ib-field.has-status { padding-right: 38px; }
.tt-ib .ib-field:hover { border-color: color-mix(in srgb, var(--ib-orange) 45%, var(--ib-border)); }
.tt-ib .ib-field:focus {
  border-color: var(--ib-orange);
  box-shadow: 0 0 0 3px rgba(234,88,12,.15);
}
.tt-ib .ib-field[aria-invalid="true"] {
  border-color: var(--ib-red);
  box-shadow: 0 0 0 3px rgba(220,38,38,.10);
}
.tt-ib .ib-field[data-valid="true"] { border-color: #22c55e; }
.tt-ib .ib-field::placeholder { color: var(--ib-muted); opacity: .7; }

.tt-ib .ib-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 9px;
  background: linear-gradient(135deg,#f97316,#ea580c);
  color: #fff !important;
  border: 1px solid #ea580c;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 13px; font-weight: 800;
  cursor: pointer; text-decoration: none;
  box-shadow: 0 10px 24px -10px rgba(234,88,12,.7);
  transition: transform .2s, box-shadow .2s, filter .2s;
}
.tt-ib .ib-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 16px 30px -12px rgba(234,88,12,.8);
  filter: brightness(1.05);
}

.tt-ib .ib-outline {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  background: var(--ib-surface); color: var(--ib-text);
  border: 1px solid var(--ib-border);
  border-radius: 12px; padding: 11px 15px;
  font-size: 13px; font-weight: 750;
  cursor: pointer; text-decoration: none;
  transition: border-color .2s, transform .2s;
}
.tt-ib .ib-outline:hover:not(:disabled) { border-color: var(--ib-orange); transform: translateY(-1px); }

.tt-ib button:disabled { opacity: .5; cursor: not-allowed; }

.tt-ib .ib-selected {
  border-color: var(--ib-orange) !important;
  background: var(--ib-orange-light) !important;
}

.tt-ib .ib-status-available { background: var(--ib-green-bg); color: var(--ib-green); }
.tt-ib .ib-status-unavailable { background: var(--ib-red-bg); color: var(--ib-red); }
.tt-ib .ib-status-held { background: var(--ib-orange-light); color: var(--ib-orange); }

.tt-ib .ib-input-label { display: block; font-size: 12px; font-weight: 750; margin-bottom: 7px; }

.tt-ib .ib-overlay { background: rgba(10,6,3,.78) !important; backdrop-filter: blur(5px); }
.tt-ib .ib-modal-surface {
  background: var(--ib-surface) !important;
  color: var(--ib-text) !important;
  isolation: isolate;
  box-shadow: 0 35px 115px rgba(0,0,0,.5);
}
.tt-ib .ib-error { background: var(--ib-red-bg); color: var(--ib-red); border: 1px solid var(--ib-border); }
.tt-ib .ib-recovery { background: var(--ib-orange-light); border: 1px solid var(--ib-border); }
.tt-ib .ib-notice { background: var(--ib-orange-light); border: 1px solid var(--ib-orange); color: var(--ib-text); }

.tt-ib .ib-modal-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--ib-border) transparent;
  overscroll-behavior: contain;
}

.tt-ib a { text-decoration: none; }
.tt-ib button, .tt-ib input, .tt-ib textarea, .tt-ib select { font: inherit; }

.tt-ib .ib-grid-bg {
  background-image:
    linear-gradient(var(--ib-grid) 1px, transparent 1px),
    linear-gradient(90deg, var(--ib-grid) 1px, transparent 1px);
  background-size: 56px 56px;
  -webkit-mask-image: radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%);
  mask-image: radial-gradient(ellipse at 50% 30%, #000 20%, transparent 75%);
}

.tt-ib .ib-ring {
  background: conic-gradient(from 0deg, transparent 0 55%, #f97316 75%, #f59e0b 90%, transparent 100%);
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
  animation: ib-spin 9s linear infinite;
}
.tt-ib .ib-ring-slow { animation-duration: 16s; animation-direction: reverse; opacity: .55; }

.tt-ib .ib-marquee { overflow: hidden; }
.tt-ib .ib-marquee-track { display: flex; width: max-content; gap: 28px; animation: ib-marquee 48s linear infinite; }
.tt-ib .ib-marquee:hover .ib-marquee-track { animation-play-state: paused; }

.tt-ib .ib-icon-spin:hover svg { transform: rotate(12deg) scale(1.1); }
.tt-ib .ib-icon-spin svg { transition: transform .3s; }

@keyframes ib-spin { to { transform: rotate(360deg); } }
@keyframes ib-marquee { to { transform: translateX(-50%); } }
@keyframes ib-shine { to { background-position: -200% 0; } }

@media (max-width: 640px) {
  .tt-ib .ib-modal-surface { border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .tt-ib *, .tt-ib *::before, .tt-ib *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
  .tt-ib .ib-ring, .tt-ib .ib-marquee-track, .tt-ib .ib-grad-text { animation: none !important; }
}
`;

/* =========================================================
   ANIMATION HELPERS
========================================================= */

/** Soft, quick fade in / out as sections enter and leave the viewport. */
function Reveal({
  children,
  className = "",
  delay = 0,
  x = 0,
  y = 28,
  rotate = 0,
  amount = 0.15,
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y, rotate, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, filter: "blur(0px)" }}
      viewport={{ once: false, amount }}
      transition={{ duration: 0.45, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

function StatValue({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, amount: 0.6 });
  const reduce = useReducedMotion();
  const match = /^(\d+)(\+?)$/.exec(value);
  const target = match ? Number(match[1]) : null;
  const [display, setDisplay] = useState(target ?? 0);

  useEffect(() => {
    if (target === null) return undefined;

    if (reduce || !inView) {
      setDisplay(reduce ? target : 0);
      return undefined;
    }

    const controls = animate(0, target, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, target, reduce]);

  if (target === null) return <span ref={ref}>{value}</span>;

  return (
    <span ref={ref}>
      {display}
      {match[2]}
    </span>
  );
}

/* ---------- Paper plane flight (used on every step change) ---------- */

const FLIGHT_POINTS = [
  [-8, 84],
  [22, 6],
  [58, 102],
  [108, 10],
];

function bezier(t, a, b, c, d) {
  const u = 1 - t;
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
}

function buildFlight(direction) {
  const mirror = direction < 0;
  const pts = FLIGHT_POINTS.map(([x, y]) => [mirror ? 100 - x : x, y]);
  const at = (t, mirrored) => {
    const source = FLIGHT_POINTS;
    const index = mirrored ? source : pts;
    return [
      bezier(t, index[0][0], index[1][0], index[2][0], index[3][0]),
      bezier(t, index[0][1], index[1][1], index[2][1], index[3][1]),
    ];
  };

  const samples = 18;
  const left = [];
  const top = [];
  const rotate = [];
  const times = [];
  const smooth = (t) => t * t * (3 - 2 * t);

  for (let i = 0; i <= samples; i++) {
    const t = smooth(i / samples);
    const [x, y] = at(t, false);
    // Heading is measured on the un-mirrored curve, then reflected.
    const [x1, y1] = at(Math.max(0, t - 0.02), true);
    const [x2, y2] = at(Math.min(1, t + 0.02), true);
    const heading = (Math.atan2(y2 - y1, (x2 - x1) * 1.3) * 180) / Math.PI;
    const finalHeading = mirror ? 180 - heading : heading;

    left.push(`${x}%`);
    top.push(`${y}%`);
    // The Send icon points up-right (-45°), so offset by +45°.
    rotate.push(finalHeading + 45);
    times.push(i / samples);
  }

  const path = `M ${pts[0][0]} ${pts[0][1]} C ${pts[1][0]} ${pts[1][1]}, ${pts[2][0]} ${pts[2][1]}, ${pts[3][0]} ${pts[3][1]}`;

  return { left, top, rotate, times, path };
}

function PaperPlaneFlight({ direction, onDone }) {
  const reduce = useReducedMotion();
  const flight = useMemo(() => buildFlight(direction), [direction]);

  useEffect(() => {
    if (reduce) onDone?.();
  }, [reduce, onDone]);

  if (reduce) return null;

  const duration = 1.15;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <motion.path
          d={flight.path}
          fill="none"
          stroke="#f97316"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={{ pathLength: 0, opacity: 0.9 }}
          animate={{ pathLength: 1, opacity: [0.9, 0.9, 0] }}
          transition={{
            pathLength: { duration, ease: "easeInOut" },
            opacity: { duration, times: [0, 0.75, 1] },
          }}
        />
      </svg>

      <motion.div
        className="absolute"
        style={{ x: "-50%", y: "-50%" }}
        initial={{
          left: flight.left[0],
          top: flight.top[0],
          rotate: flight.rotate[0],
          opacity: 0,
          scale: 0.6,
        }}
        animate={{
          left: flight.left,
          top: flight.top,
          rotate: flight.rotate,
          opacity: [0, 1, 1, 0],
          scale: [0.6, 1.15, 1.15, 0.7],
        }}
        transition={{
          left: { duration, times: flight.times, ease: "linear" },
          top: { duration, times: flight.times, ease: "linear" },
          rotate: { duration, times: flight.times, ease: "linear" },
          opacity: { duration, times: [0, 0.1, 0.85, 1], ease: "linear" },
          scale: { duration, times: [0, 0.15, 0.85, 1], ease: "linear" },
        }}
        onAnimationComplete={onDone}
      >
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-xl"
          style={{
            background: "linear-gradient(135deg,#f97316,#ea580c)",
            boxShadow: "0 10px 25px -5px rgba(234,88,12,.7)",
          }}
        >
          <Send size={20} fill="currentColor" fillOpacity={0.25} />
        </span>
      </motion.div>
    </div>
  );
}

/* =========================================================
   SHARED COMPONENTS
========================================================= */

function SectionIntro({ eyebrow, title, description, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <span
        className={`ib-orange inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.17em] ${
          center ? "justify-center" : ""
        }`}
      >
        <span className="h-px w-8 bg-gradient-to-r from-orange-500 to-transparent" />
        {eyebrow}
      </span>

      <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="ib-muted mt-4 text-sm leading-7 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

function CompanyLogo({ company, compact = false }) {
  if (compact) {
    return (
      <div
        className="group flex min-w-[88px] flex-col items-center gap-2 text-center"
        title={company.name}
      >
        <div className="ib-card flex h-14 w-14 items-center justify-center overflow-hidden rounded-full p-3 shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6 group-hover:border-orange-500 sm:h-16 sm:w-16">
          <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
              company.domain
            )}&sz=128`}
            alt={`${company.name} logo`}
            loading="lazy"
            className="h-full w-full object-contain"
            onError={(event) => {
              event.currentTarget.style.opacity = "0";
            }}
          />
        </div>

        <span className="ib-muted max-w-[104px] text-[11px] font-bold leading-4">
          {company.name}
        </span>
      </div>
    );
  }

  return (
    <div className="ib-card ib-card-hover flex min-h-[68px] items-center justify-center gap-3 rounded-xl px-3 py-3 text-center transition-transform duration-300 hover:-translate-y-1">
      <img
        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(
          company.domain
        )}&sz=64`}
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="h-7 w-7 shrink-0 object-contain"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />

      <span className="text-xs font-extrabold leading-5 sm:text-sm">
        {company.name}
      </span>
    </div>
  );
}

function TimeDisplayControls({
  timeZone,
  setTimeZone,
  timeFormat,
  setTimeFormat,
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="min-w-[220px] flex-1 sm:flex-none">
        <span className="ib-muted mb-1 block text-[11px] font-bold">
          Display time zone
        </span>

        <select
          className="ib-field !py-2.5 !text-xs"
          aria-label="Display time zone"
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

      <label className="min-w-[120px]">
        <span className="ib-muted mb-1 block text-[11px] font-bold">
          Clock format
        </span>

        <select
          className="ib-field !py-2.5 !text-xs"
          aria-label="Clock format"
          value={timeFormat}
          onChange={(event) => setTimeFormat(event.target.value)}
        >
          <option value="12">12-hour (AM/PM)</option>
          <option value="24">24-hour</option>
        </select>
      </label>
    </div>
  );
}

function StatusPill({ slot }) {
  const status = String(slot.status || "AVAILABLE").toUpperCase();

  let label = "Unavailable";
  let className = "ib-status-unavailable";

  if (status === "AVAILABLE") {
    label = "Available";
    className = "ib-status-available";
  } else if (status === "BOOKED") {
    label = "Booked";
  } else if (status === "HELD") {
    label = "Reserved";
    className = "ib-status-held";
  } else if (status === "BLOCKED") {
    label = "Blocked";
  }

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${className}`}
    >
      {label}
    </span>
  );
}

/** Step tracker with a little paper plane that glides to the active step. */
function Progress({ step }) {
  const steps = ["Topics", "Your details", "Payment"];
  const percent = (step / (steps.length - 1)) * 100;

  return (
    <div className="px-5">
      <div className="relative h-9">
        <div
          className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{ background: "var(--ib-border)" }}
        />

        <motion.div
          className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.6, ease: EASE }}
        />

        {steps.map((name, index) => {
          const done = index < step;
          const active = index === step;

          return (
            <div
              key={name}
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${(index / (steps.length - 1)) * 100}%` }}
            >
              <motion.span
                className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-black ${
                  done || active
                    ? "border-orange-600 bg-orange-600 text-white"
                    : "ib-muted"
                }`}
                style={
                  done || active
                    ? undefined
                    : {
                        background: "var(--ib-surface)",
                        borderColor: "var(--ib-border)",
                      }
                }
                animate={{ scale: active ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {done ? <Check size={14} /> : index + 1}
              </motion.span>
            </div>
          );
        })}

        <motion.span
          aria-hidden="true"
          className="absolute -top-1 z-10 flex h-5 w-5 items-center justify-center text-orange-500"
          style={{ x: "-50%" }}
          animate={{ left: `${percent}%`, y: [0, -3, 0] }}
          transition={{
            left: { type: "spring", stiffness: 140, damping: 18 },
            y: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Send size={14} fill="currentColor" fillOpacity={0.3} />
        </motion.span>
      </div>

      <div className="mt-1 grid grid-cols-3 text-[11px]">
        {steps.map((name, index) => (
          <span
            key={name}
            className={`${
              index === 0 ? "text-left" : index === 2 ? "text-right" : "text-center"
            } ${index === step ? "ib-orange font-extrabold" : "ib-muted"}`}
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopicCard({ topic, selected, order, replaceNext, onClick }) {
  const info = TOPIC_INFO[topic];

  if (!info) return null;

  const Icon = info.Icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -3 }}
      animate={selected ? { scale: [1, 1.03, 1] } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`ib-card ib-card-hover ib-icon-spin relative flex items-start gap-3 rounded-xl p-4 text-left ${
        selected ? "ib-selected" : ""
      }`}
    >
      <span className="ib-panel rounded-lg p-2">
        <Icon size={18} className="ib-orange" />
      </span>

      <span className="min-w-0 flex-1">
        <strong className="block text-sm">{info.title}</strong>

        <span className="ib-muted mt-1 block text-xs leading-5">
          {info.description}
        </span>

        {replaceNext && (
          <span className="ib-orange mt-2 inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider">
            <RefreshCw size={11} />
            Replaced next
          </span>
        )}
      </span>

      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 90 }}
            transition={{ type: "spring", stiffness: 380, damping: 20 }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-black text-white"
          >
            {order}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/** Form field with live validation, error text shown below the input. */
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
  type = "text",
  inputMode,
  autoComplete,
  placeholder,
  maxLength,
  className = "",
}) {
  const reduce = useReducedMotion();
  const invalid = Boolean(showError && error);
  const valid = Boolean(showValid && value.trim() && !error);

  return (
    <div className={className}>
      <label htmlFor={id} className="ib-input-label">
        {label}
        {required && <span className="ib-req"> *</span>}
      </label>

      <motion.div
        className="relative"
        animate={invalid && !reduce ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.35 }}
      >
        {Icon && (
          <Icon
            size={16}
            className="ib-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
          />
        )}

        <input
          id={id}
          ref={inputRef}
          type={type}
          inputMode={inputMode}
          autoComplete={autoComplete}
          className={`ib-field ${Icon ? "has-icon" : ""} has-status`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={invalid}
          aria-describedby={`${id}-msg`}
          data-valid={valid ? "true" : "false"}
        />

        <AnimatePresence>
          {(invalid || valid) && (
            <motion.span
              key={invalid ? "bad" : "ok"}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
            >
              {invalid ? (
                <AlertCircle size={17} style={{ color: "var(--ib-red)" }} />
              ) : (
                <CheckCircle2 size={17} className="text-green-500" />
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <div id={`${id}-msg`} aria-live="polite">
        <AnimatePresence initial={false} mode="wait">
          {invalid ? (
            <motion.p
              key={error}
              role="alert"
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold leading-5"
              style={{ color: "var(--ib-red)" }}
            >
              <AlertCircle size={13} className="mt-1 shrink-0" />
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ib-muted mt-1.5 text-[11px] leading-5"
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =========================================================
   BOOKING MODAL

   Step 1: Topics (oldest selection is replaced when the limit is hit)
   Step 2: Candidate details (live validation)
   Step 3: Review + payment

   A paper plane flies across the dialog on every step change.
   NO LOGIN OR TOKEN REQUIRED.
========================================================= */

const stepVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 50 : -50,
    filter: "blur(4px)",
  }),
  center: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -50 : 50,
    filter: "blur(4px)",
  }),
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
  const [flight, setFlight] = useState(null);
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
    id: `ib-${key}`,
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

  /* ---------- Step navigation with paper-plane flight ---------- */

  const goTo = (nextStep) => {
    if (nextStep === step) return;

    const dir = nextStep > step ? 1 : -1;

    setDirection(dir);
    setFlight({ id: Date.now(), dir });
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

  const modal = (
    <motion.div
      data-ib-theme={theme}
      className="tt-ib !min-h-0 fixed inset-0 !m-0 z-[2147483000] flex items-end justify-center sm:items-center sm:p-5"
      style={{ background: "transparent", isolation: "isolate" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        aria-label="Close booking dialog"
        disabled={busy}
        onClick={onClose}
        className="ib-overlay absolute inset-0 z-0 w-full"
      />

      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Book mock interview"
        className="ib-card ib-modal-surface relative z-10 flex max-h-[96dvh] w-full max-w-[730px] flex-col overflow-hidden rounded-t-3xl sm:max-h-[91dvh] sm:rounded-3xl"
        initial={{ y: 40, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        <div className="h-1 w-full shrink-0 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600" />

        {/* HEADER */}
        <div
          className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4 sm:px-7"
          style={{ borderColor: "var(--ib-border)" }}
        >
          <div>
            <div className="ib-orange text-[10px] font-black uppercase tracking-widest">
              Target Trek · Live 1:1
            </div>

            <h2 className="mt-1 text-lg font-black sm:text-xl">
              Book your mock interview
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="ib-outline !p-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div
          ref={bodyRef}
          className="ib-modal-scroll flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6"
        >
          <Progress step={step} />

          {/* SLOT SUMMARY */}
          <div className="ib-panel mt-5 rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>
                {fmtDate(slot.startTime, {
                  timeZone,
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </strong>

              <span className="ib-orange text-lg font-black">{priceText}</span>
            </div>

            <div className="ib-muted mt-2 flex flex-wrap items-center gap-2 text-sm">
              <Clock3 size={14} />
              {fmtTime(slot.startTime, timeZone, timeFormat)}
              {" – "}
              {fmtTime(slot.endTime, timeZone, timeFormat)}
              {" · "}
              {slot.durationMinutes} min
              {` · ${zoneShort}`}
            </div>
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
                <div className="mt-6">
                  <h3 className="text-lg font-extrabold">
                    What would you like to practice?
                  </h3>

                  <p className="ib-muted mt-2 text-sm leading-7">
                    Select up to {maxTopics} topic{maxTopics > 1 ? "s" : ""}.
                    {maxTopics > 1 &&
                      " Pick another once you're at the limit and your oldest choice is swapped out automatically."}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    {Array.from({ length: maxTopics }).map((_, index) => (
                      <motion.span
                        key={index}
                        animate={{ scaleX: index < topics.length ? 1 : 0.8 }}
                        className={`h-2 w-8 rounded-full ${
                          index < topics.length ? "bg-orange-600" : ""
                        }`}
                        style={
                          index < topics.length
                            ? undefined
                            : { background: "var(--ib-border)" }
                        }
                      />
                    ))}

                    <span className="ib-muted ml-1 text-xs font-bold">
                      {topics.length}/{maxTopics} selected
                    </span>
                  </div>

                  <AnimatePresence>
                    {topicNotice && (
                      <motion.div
                        key={`${topicNotice.added}-${topicNotice.removed.join()}`}
                        role="status"
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="ib-notice mt-3 flex items-start gap-2 rounded-xl p-3 text-xs font-semibold leading-5">
                          <RefreshCw
                            size={15}
                            className="ib-orange mt-0.5 shrink-0"
                          />
                          <span>
                            Limit of {maxTopics} reached —{" "}
                            <strong>
                              {topicNotice.removed
                                .map((topic) => TOPIC_INFO[topic]?.title)
                                .join(", ")}
                            </strong>{" "}
                            was replaced by{" "}
                            <strong>{TOPIC_INFO[topicNotice.added]?.title}</strong>
                            .
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {availableTopics.map((topic) => {
                      const position = topics.indexOf(topic);

                      return (
                        <TopicCard
                          key={topic}
                          topic={topic}
                          selected={position !== -1}
                          order={position + 1}
                          replaceNext={
                            position === 0 &&
                            topics.length >= maxTopics &&
                            maxTopics > 1
                          }
                          onClick={() => toggleTopic(topic)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ================= STEP 2: CANDIDATE DETAILS ================= */}
              {step === 1 && (
                <div className="mt-6">
                  <h3 className="text-lg font-extrabold">
                    Tell us about yourself
                  </h3>

                  <p className="ib-muted mt-2 text-sm leading-7">
                    No account is required. Enter your details so we can prepare
                    your session and send interview information by email.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      label="Email address"
                      icon={Mail}
                      required
                      type="email"
                      autoComplete="email"
                      value={candidate.email}
                      onChange={(value) => change("email", value.replace(/\s/g, ""))}
                      placeholder="you@example.com"
                      maxLength={254}
                      hint="Your confirmation and joining link are sent here."
                    />

                    <Field
                      {...fieldProps("phone")}
                      label="Phone number"
                      icon={Phone}
                      required
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={candidate.phone}
                      onChange={(value) =>
                        change("phone", value.replace(/[^\d\s()+-]/g, ""))
                      }
                      placeholder="+91 9876543210"
                      maxLength={20}
                      hint="10-digit Indian mobile, or +country code."
                    />

                    <Field
                      {...fieldProps("experienceYears")}
                      label="Experience (years)"
                      icon={Briefcase}
                      inputMode="decimal"
                      value={candidate.experienceYears}
                      onChange={(value) =>
                        change(
                          "experienceYears",
                          value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1")
                        )
                      }
                      placeholder="2"
                      maxLength={5}
                    />

                    <Field
                      {...fieldProps("currentRole")}
                      label="Current role"
                      icon={BriefcaseBusiness}
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
                      showValid={false}
                      value={candidate.targetRole}
                      onChange={(value) => change("targetRole", value)}
                      placeholder="SDE-2 / Backend Engineer"
                      maxLength={120}
                    />

                    <Field
                      {...fieldProps("currentCompany")}
                      label="Current company"
                      icon={Building2}
                      showValid={false}
                      value={candidate.currentCompany}
                      onChange={(value) => change("currentCompany", value)}
                      placeholder="Optional"
                      maxLength={120}
                    />

                    <Field
                      {...fieldProps("resumeUrl")}
                      label="Resume URL"
                      icon={Link2}
                      type="url"
                      inputMode="url"
                      value={candidate.resumeUrl}
                      onChange={(value) => change("resumeUrl", value.replace(/\s/g, ""))}
                      placeholder="https://drive.google.com/..."
                    />

                    <label className="sm:col-span-2">
                      <span className="ib-input-label">
                        What should we focus on?
                      </span>

                      <textarea
                        className="ib-field min-h-[105px] resize-y"
                        value={candidate.notes}
                        onChange={(event) => change("notes", event.target.value)}
                        placeholder="Share your goals, upcoming interview, weaker topics or projects."
                        maxLength={3000}
                      />

                      <span className="ib-muted mt-1 block text-right text-[11px]">
                        {candidate.notes.length}/3000
                      </span>
                    </label>
                  </div>

                  <div className="ib-panel mt-5 flex items-start gap-3 rounded-xl p-4">
                    <Mail size={18} className="ib-orange mt-0.5 shrink-0" />

                    <p className="ib-muted text-xs leading-6">
                      Your interview confirmation and joining instructions will
                      be sent to your email after payment verification. If the
                      meeting link is not yet assigned, it will be shared
                      separately.
                    </p>
                  </div>
                </div>
              )}

              {/* ============== STEP 3: REVIEW AND PAYMENT ============== */}
              {step === 2 && (
                <div className="mt-6">
                  <h3 className="text-lg font-extrabold">Review your booking</h3>

                  <p className="ib-muted mt-2 text-sm leading-7">
                    Review everything before continuing to Cashfree's secure
                    checkout.
                  </p>

                  <div className="ib-card mt-4 overflow-hidden rounded-2xl">
                    <div className="space-y-4 p-4 text-sm sm:p-5">
                      <div className="flex justify-between gap-4">
                        <span className="ib-muted">Interview topics</span>

                        <div className="flex max-w-[65%] flex-wrap justify-end gap-1.5">
                          {topics.map((topic) => (
                            <span
                              key={topic}
                              className="ib-panel ib-orange rounded-lg px-2.5 py-1 text-[11px] font-black"
                            >
                              {TOPIC_INFO[topic]?.title || topic}
                            </span>
                          ))}
                        </div>
                      </div>

                      {[
                        ["Candidate", candidate.name],
                        ["Email", candidate.email],
                        ["Phone", candidate.phone],
                        [
                          "Interview date",
                          fmtDate(slot.startTime, {
                            timeZone,
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }),
                        ],
                        [
                          "Interview time",
                          `${fmtTime(slot.startTime, timeZone, timeFormat)} ${zoneShort}`,
                        ],
                        ["Duration", `${slot.durationMinutes} minutes`],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-4">
                          <span className="ib-muted">{label}</span>
                          <strong className="break-all text-right">{value}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="ib-panel flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                      <strong>Total to pay</strong>

                      <div className="text-right">
                        {Number(slot.mrp) > Number(slot.price) && (
                          <span className="ib-muted mr-2 text-xs line-through">
                            {fmtMoney(slot.mrp, slot.currency)}
                          </span>
                        )}

                        <span className="ib-orange text-2xl font-black">
                          {priceText}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ib-muted mt-4 flex items-start gap-2 text-xs leading-6">
                    <LockKeyhole size={17} className="mt-0.5 shrink-0" />
                    Cashfree securely processes the payment. Your interview is
                    confirmed only after the backend verifies successful
                    payment.
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
                className="ib-error mt-5 flex items-start gap-2 rounded-xl p-4 text-sm"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOOKING RECOVERY */}
          {bookingId && (
            <div className="ib-recovery mt-5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="ib-orange shrink-0" />

                <div className="min-w-0">
                  <strong className="text-sm">Booking reference created</strong>

                  <p className="ib-muted mt-1 break-all text-xs">{bookingId}</p>

                  <p className="ib-muted mt-2 text-xs leading-6">
                    If checkout was interrupted, check your booking's payment
                    status before making another payment.
                  </p>

                  <a
                    href={paymentStatusUrl(bookingId)}
                    className="ib-outline mt-3"
                  >
                    <RefreshCw size={15} />
                    Check Payment Status
                    <ArrowRight size={15} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          className="flex shrink-0 items-center justify-between gap-2 border-t p-4 sm:px-7"
          style={{ borderColor: "var(--ib-border)" }}
        >
          <button
            type="button"
            disabled={busy}
            className="ib-outline"
            onClick={
              step === 0
                ? onClose
                : () => {
                    setError("");
                    goTo(step - 1);
                  }
            }
          >
            <ArrowLeft size={16} />
            {step === 0 ? "Close" : "Back"}
          </button>

          {step < 2 ? (
            <button
              type="button"
              className="ib-primary group"
              disabled={step === 0 && topics.length === 0}
              onClick={handleContinue}
            >
              Continue
              <Send
                size={16}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1"
              />
            </button>
          ) : (
            <button
              type="button"
              className="ib-primary"
              disabled={busy}
              onClick={checkout}
            >
              {busy ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <CreditCard size={17} />
              )}

              {busy
                ? "Processing..."
                : paymentStarted
                  ? "Check Payment"
                  : `Pay ${priceText}`}
            </button>
          )}
        </div>

        {/* PAPER PLANE FLIGHT */}
        {flight && (
          <PaperPlaneFlight
            key={flight.id}
            direction={flight.dir}
            onDone={() => setFlight(null)}
          />
        )}
      </motion.section>
    </motion.div>
  );

  if (typeof document === "undefined") return null;

  return createPortal(modal, document.body);
}

/* =========================================================
   MARKETING SECTIONS
========================================================= */

function MarketingSections({ openFaq, setOpenFaq }) {
  const experienceRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: experienceRef,
    offset: ["start 80%", "end 60%"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 100, damping: 24 });
  const reduce = useReducedMotion();

  return (
    <>
      {/* BENEFITS */}
      <section
        id="what-you-get"
        className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8"
        style={{ background: "var(--ib-alt)" }}
      >
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionIntro
              eyebrow="Your interview, your growth"
              title={
                <>
                  More than another{" "}
                  <span className="ib-grad-text">practice question</span>
                </>
              }
              description="A live session designed to expose blind spots before your real interview and give you concrete areas to work on."
            />
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SESSION_BENEFITS.map(({ Icon, title, description }, index) => (
              <Reveal
                key={title}
                delay={(index % 3) * 0.06}
                rotate={index % 2 ? 1.5 : -1.5}
              >
                <div className="ib-card ib-card-hover ib-icon-spin h-full rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1.5">
                  <div className="ib-panel inline-flex rounded-xl p-3">
                    <Icon className="ib-orange" size={23} />
                  </div>

                  <h3 className="mt-4 text-base font-extrabold">{title}</h3>

                  <p className="ib-muted mt-2 text-sm leading-7">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TARGET COMPANIES */}
      <section
        id="top-company-prep"
        className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionIntro
              eyebrow="Aim higher"
              title="Prepare for FAANG, MAANG and other leading tech interviews"
              description="Build the core coding, backend, system design and communication skills used in challenging software engineering interview processes."
            />
          </Reveal>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TARGET_COMPANIES.map((company, index) => (
              <Reveal key={company.name} delay={(index % 4) * 0.05} y={20}>
                <CompanyLogo company={company} />
              </Reveal>
            ))}
          </div>

          <p className="ib-muted mt-4 text-xs leading-6">
            These are preparation targets, not employers or partners of Target
            Trek. Mock interviews do not guarantee selection or offers.
          </p>
        </div>
      </section>

      {/* CURRICULUM */}
      <section
        id="interview-topics"
        className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionIntro
              eyebrow="What we can cover"
              title={
                <>
                  Prepare for the{" "}
                  <span className="ib-grad-text">rounds that matter</span>
                </>
              }
              description="Pick a slot supporting your chosen track. Every session is focused on depth, reasoning and clear communication—not simply memorizing answers."
            />
          </Reveal>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {CURRICULUM.map(({ key, Icon, title, tagline, points }, index) => (
              <Reveal
                key={key}
                x={index % 2 ? 24 : -24}
                rotate={index % 2 ? 1 : -1}
              >
                <article className="ib-card ib-card-hover ib-icon-spin h-full rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="ib-panel rounded-xl p-3">
                      <Icon className="ib-orange" size={22} />
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold">{title}</h3>
                      <p className="ib-muted mt-1 text-sm">{tagline}</p>
                    </div>
                  </div>

                  <ul className="mt-5 grid gap-3">
                    {points.map((point) => (
                      <li key={point} className="flex gap-2 text-sm leading-6">
                        <Check size={16} className="ib-orange mt-1 shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}

            <Reveal x={24}>
              <article
                className="relative h-full overflow-hidden rounded-2xl p-6 text-white"
                style={{ background: "linear-gradient(120deg,#9a3412,#ea580c)" }}
              >
                <GraduationCap size={29} />

                <h3 className="mt-4 text-xl font-black">
                  Preparing for a specific company or round?
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/90">
                  Share the job description, target role or topics in your
                  booking notes. Your interviewer can use that context within
                  the duration and selected session's supported tracks.
                </p>

                <a
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-orange-800 transition hover:-translate-y-0.5"
                  href="#interview-slots"
                >
                  Choose your session <ArrowRight size={16} />
                </a>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SESSION EXPERIENCE */}
      <section
        id="session-experience"
        ref={experienceRef}
        className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8"
        style={{ background: "var(--ib-alt)" }}
      >
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionIntro
              eyebrow="Inside the session"
              title="Experience an interview—not a lecture"
              description="A flexible flow built around your selected topics and session duration."
            />
          </Reveal>

          <div className="relative mt-10">
            <div
              aria-hidden="true"
              className="absolute left-[12%] right-[12%] top-[26px] hidden h-0.5 md:block"
              style={{ background: "var(--ib-border)" }}
            />
            <motion.div
              aria-hidden="true"
              style={{ scaleX: reduce ? 1 : lineScale }}
              className="absolute left-[12%] right-[12%] top-[26px] hidden h-0.5 origin-left bg-gradient-to-r from-orange-500 to-amber-400 md:block"
            />

            <div className="relative grid gap-4 md:grid-cols-4">
              {[
                ["01", "Introduction", "Your experience, target role, upcoming interviews and expectations."],
                ["02", "Technical round", "Live coding, system design, GenAI or project discussion, depending on your selected topics."],
                ["03", "Follow-ups", "Edge cases, optimizations, architecture alternatives and deeper why-questions."],
                ["04", "Feedback", "Talk through strengths, improvement areas and suggested next practice steps."],
              ].map(([number, title, description], index) => (
                <Reveal key={number} delay={index * 0.06} y={36}>
                  <div className="ib-card ib-card-hover h-full rounded-2xl p-6">
                    <span
                      className="flex h-[52px] w-[52px] items-center justify-center rounded-full text-lg font-black text-white shadow-lg"
                      style={{
                        background: "linear-gradient(135deg,#f97316,#ea580c)",
                        boxShadow: "0 10px 22px -8px rgba(234,88,12,.7)",
                      }}
                    >
                      {number}
                    </span>

                    <h3 className="mt-4 text-lg font-extrabold">{title}</h3>

                    <p className="ib-muted mt-2 text-sm leading-7">{description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <p className="ib-muted mt-4 text-xs leading-6">
            Session length controls how deeply individual topics can be covered.
            No specific interview question or hiring result is guaranteed.
          </p>
        </div>
      </section>

      {/* WHO IT'S FOR */}
      <section
        id="who-its-for"
        className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionIntro
              eyebrow="Made for your next step"
              title="Who should book a mock interview?"
              description="Whether you're starting out or targeting your next engineering role, focused practice helps you prepare more deliberately."
            />
          </Reveal>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Students & freshers", "Get comfortable with live coding, problem explanations and fundamental CS questions."],
              ["SDE-1 candidates", "Sharpen DSA, backend basics, project walkthroughs and communication."],
              ["SDE-2 candidates", "Practice design depth, scalability, concurrency and decision-making trade-offs."],
              ["Backend & GenAI engineers", "Discuss APIs, microservices, RAG, agents and production architecture."],
            ].map(([title, description], index) => (
              <Reveal key={title} delay={(index % 4) * 0.05} rotate={index % 2 ? 2 : -2}>
                <div className="ib-card ib-card-hover ib-icon-spin h-full rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1.5">
                  <BadgeCheck className="ib-orange" size={24} />

                  <h3 className="mt-4 font-extrabold">{title}</h3>

                  <p className="ib-muted mt-2 text-sm leading-7">{description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="scroll-mt-36 px-4 py-16 sm:px-6 lg:px-8"
        style={{ background: "var(--ib-alt)" }}
      >
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SectionIntro
              eyebrow="Simple Booking Process"
              title="How your mock interview works"
              description="Book your technical mock interview in a few simple steps. No account registration is required."
            />
          </Reveal>

          <div className="relative mt-10">
            {/* A little paper plane cruising along the dashed route */}
            <div
              aria-hidden="true"
              className="absolute left-[6%] right-[6%] top-[-18px] hidden h-6 md:block"
            >
              <div
                className="absolute inset-x-0 top-1/2 border-t-2 border-dashed"
                style={{ borderColor: "var(--ib-border)" }}
              />

              {!reduce && (
                <motion.span
                  className="absolute top-1/2 text-orange-500"
                  style={{ y: "-50%", x: "-50%" }}
                  animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.1, 0.9, 1],
                  }}
                >
                  <Send size={18} fill="currentColor" fillOpacity={0.3} />
                </motion.span>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Choose your session",
                  description:
                    "Select an available date and time, then choose the topics you want to practice.",
                  Icon: CalendarDays,
                },
                {
                  number: "02",
                  title: "Enter details and pay",
                  description:
                    "Provide your name, email, background and interview goals. Complete payment securely through Cashfree.",
                  Icon: CreditCard,
                },
                {
                  number: "03",
                  title: "Attend your interview",
                  description:
                    "After payment verification, receive your booking confirmation. Meeting details are shared by email.",
                  Icon: Video,
                },
              ].map(({ number, title, description, Icon }, index) => (
                <Reveal key={number} delay={index * 0.08} y={36}>
                  <div className="ib-card ib-card-hover ib-icon-spin h-full rounded-2xl p-6 transition-transform duration-300 hover:-translate-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="ib-grad-text text-4xl font-black">{number}</span>
                      <Icon size={26} className="ib-orange" />
                    </div>

                    <h3 className="mt-5 text-lg font-extrabold">{title}</h3>

                    <p className="ib-muted mt-3 text-sm leading-7">{description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="mock-faq"
        className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <SectionIntro
              eyebrow="FAQs"
              title="Everything to know before booking"
              description="Clear answers about eligibility, topics, feedback, checkout and cancellations."
            />
          </Reveal>

          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const open = openFaq === index;

              return (
                <Reveal key={item.question} delay={(index % 4) * 0.03} y={18}>
                  <div
                    className={`ib-card overflow-hidden rounded-2xl ${
                      open ? "ib-selected" : ""
                    }`}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold"
                      aria-expanded={open}
                      onClick={() =>
                        setOpenFaq((old) => (old === index ? -1 : index))
                      }
                    >
                      <span>{item.question}</span>

                      <ChevronDown
                        size={19}
                        className={`ib-orange shrink-0 transition-transform duration-300 ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: EASE }}
                        >
                          <p
                            className="ib-muted border-t px-5 pb-5 pt-4 text-sm leading-7"
                            style={{ borderColor: "var(--ib-border)" }}
                          >
                            {item.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-9">
            <div
              className="relative overflow-hidden rounded-3xl p-7 text-white sm:p-9"
              style={{ background: "linear-gradient(120deg,#9a3412,#ea580c)" }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/15 blur-3xl"
              />

              <h3 className="relative text-2xl font-black">
                Ready to find your weak spots before the real interview?
              </h3>

              <p className="relative mt-3 max-w-2xl text-sm leading-7 text-white/90">
                Choose a date, pick your preferred technical areas and book your
                live 1:1 mock interview.
              </p>

              <a
                href="#interview-slots"
                className="group relative mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-orange-800 transition hover:-translate-y-0.5"
              >
                View available sessions
                <Send
                  size={17}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-1"
                />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
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

  const [openFaq, setOpenFaq] = useState(0);

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

  /* Scroll progress + hero parallax */
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.4,
  });

  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroTextY = useTransform(heroProgress, [0, 1], [0, 90]);
  const heroCardY = useTransform(heroProgress, [0, 1], [0, -70]);
  const heroFade = useTransform(heroProgress, [0, 0.9], [1, 0.2]);
  const glowY = useTransform(heroProgress, [0, 1], [0, 200]);

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

  const countAvailable = slots.filter((slot) => slot.status === "AVAILABLE").length;
  const countBooked = slots.filter((slot) => slot.status === "BOOKED").length;
  const countHeld = slots.filter((slot) => slot.status === "HELD").length;

  const handleBook = (slot) => {
    if (slot.status !== "AVAILABLE") return;

    setLoadError("");
    setSelectedSlot(slot);
  };

  const heroWords = ["Your", "next", "technical", "interview", "starts"];

  return (
    <div
      className="tt-ib overflow-x-clip pb-20 pt-[116px] sm:pb-0 xl:pt-[76px]"
      data-ib-theme={theme}
    >
      <Helmet>
              <title>Book Mock Interviews: DSA, HLD, LLD &amp; Java | Target Trek</title>
              <meta name="description" content="Book realistic 1:1 mock interviews in DSA, backend, Java, Spring Boot, System Design and GenAI. Get honest feedback and fix your weak points." />
              <meta name="keywords" content="mock interview, system design mock interview, DSA mock interview, Java mock interview, backend interview practice, GenAI interview preparation" />
              <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
              <link rel="canonical" href="https://www.targettrek.in/mock-interviews" />
              <meta property="og:type" content="website" />
              <meta property="og:site_name" content="Target Trek" />
              <meta property="og:locale" content="en_IN" />
              <meta property="og:title" content="Book Mock Interviews: DSA, HLD, LLD &amp; Java | Target Trek" />
              <meta property="og:description" content="Book realistic 1:1 mock interviews in DSA, backend, Java, Spring Boot, System Design and GenAI. Get honest feedback and fix your weak points." />
              <meta property="og:url" content="https://www.targettrek.in/mock-interviews" />
              <meta name="twitter:card" content="summary" />
              <meta name="twitter:title" content="Book Mock Interviews: DSA, HLD, LLD &amp; Java | Target Trek" />
              <meta name="twitter:description" content="Book realistic 1:1 mock interviews in DSA, backend, Java, Spring Boot, System Design and GenAI. Get honest feedback and fix your weak points." />
            </Helmet>

      <style>{styles}</style>

      {/* Scroll progress */}
      <motion.div
        aria-hidden="true"
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-[100] h-[3px] origin-left bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"
      />

      <main>
        {/* ==========================================
            HERO
        ========================================== */}
        <section
          ref={heroRef}
          className="relative overflow-hidden px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:px-8"
        >
          <div aria-hidden="true" className="ib-grid-bg pointer-events-none absolute inset-0" />

          <motion.div
            aria-hidden="true"
            style={{ ...(reduce ? {} : { y: glowY }), background: "var(--ib-glow)" }}
            className="pointer-events-none absolute -right-24 -top-16 h-80 w-80 rounded-full blur-[100px]"
          />

          <motion.div
            aria-hidden="true"
            animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full blur-[100px]"
            style={{ background: "rgba(245,158,11,.14)" }}
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_.85fr]">
            <motion.div style={reduce ? undefined : { y: heroTextY, opacity: heroFade }}>
              <motion.div
                initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest"
                style={{
                  background: "var(--ib-orange-light)",
                  color: "var(--ib-orange)",
                }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                </span>
                Target Trek Mock Interviews
              </motion.div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-[58px] lg:leading-[1.12]">
                {heroWords.map((word, index) => (
                  <motion.span
                    key={word}
                    initial={reduce ? false : { opacity: 0, y: 26 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + index * 0.07, ease: EASE }}
                    className="mr-3 inline-block"
                  >
                    {word}
                  </motion.span>
                ))}

                <motion.span
                  initial={reduce ? false : { opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.5, ease: EASE }}
                  className="ib-grad-text inline-block"
                >
                  with better practice.
                </motion.span>
              </h1>

              <motion.p
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6, ease: EASE }}
                className="ib-muted mt-5 max-w-2xl text-base leading-8 sm:text-lg"
              >
                Get realistic 1:1 interview practice in DSA, backend
                engineering, Java, Spring Boot, System Design and GenAI. Discuss
                real engineering trade-offs, identify weak points and become
                more confident explaining your solutions.
              </motion.p>

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7, ease: EASE }}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                <a href="#interview-slots" className="ib-primary group">
                  Explore Available Slots
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>

                <a href="#how-it-works" className="ib-outline">
                  How It Works
                  <ChevronRight size={17} />
                </a>
              </motion.div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PAGE_STATS.map(({ value, label, Icon }, index) => (
                  <motion.div
                    key={label}
                    initial={reduce ? false : { opacity: 0, y: 24, rotate: index % 2 ? 3 : -3 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.07, ease: EASE }}
                    whileHover={reduce ? undefined : { y: -4 }}
                    className="ib-card ib-card-hover rounded-xl p-3"
                  >
                    <Icon size={17} className="ib-orange" />

                    <div className="mt-2 text-xl font-black">
                      <StatValue value={value} />
                    </div>

                    <p className="ib-muted mt-1 text-[11px] leading-5">{label}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="ib-muted mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold"
              >
                {[
                  [Video, "Live 1:1 Interview"],
                  [MessageSquareText, "Actionable Feedback"],
                  [ShieldCheck, "Secure Checkout"],
                  [CheckCircle2, "No Account Required"],
                ].map(([Icon, text]) => (
                  <span key={text} className="flex items-center gap-2">
                    <Icon size={15} className="ib-orange" />
                    {text}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* TOPIC CARD with rotating ring */}
            <motion.div
              style={reduce ? undefined : { y: heroCardY }}
              className="relative mx-auto w-full max-w-md lg:max-w-none"
            >
              <div aria-hidden="true" className="ib-ring pointer-events-none absolute -inset-3 rounded-[36px]" />
              <div aria-hidden="true" className="ib-ring ib-ring-slow pointer-events-none absolute -inset-6 rounded-[44px]" />

              <motion.div
                initial={reduce ? false : { opacity: 0, y: 50, rotate: 4, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
              >
                <motion.div
                  animate={reduce ? undefined : { y: [0, -9, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="ib-card relative rounded-3xl p-5 shadow-2xl sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="ib-orange text-xs font-bold uppercase tracking-wider">
                      What you can practice
                    </span>

                    <motion.div
                      className="ib-panel rounded-xl p-2"
                      animate={reduce ? undefined : { rotate: [0, 12, -12, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles size={20} className="ib-orange" />
                    </motion.div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {ALL_TOPICS.map((topic, index) => {
                      const info = TOPIC_INFO[topic];
                      const Icon = info.Icon;

                      return (
                        <motion.div
                          key={topic}
                          initial={reduce ? false : { opacity: 0, x: 28 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.7 + index * 0.08, ease: EASE }}
                          whileHover={reduce ? undefined : { x: 6 }}
                          className="ib-icon-spin flex items-center gap-3 rounded-xl p-2"
                        >
                          <div className="ib-panel rounded-lg p-2.5">
                            <Icon size={18} className="ib-orange" />
                          </div>

                          <div className="flex-1">
                            <div className="text-sm font-bold">{info.title}</div>
                            <p className="ib-muted mt-1 text-xs">{info.description}</p>
                          </div>

                          <Check size={16} className="ib-orange" />
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="ib-panel ib-muted mt-5 rounded-xl px-4 py-3 text-xs leading-6">
                    Sessions can be tailored to your experience, target role,
                    upcoming interviews and improvement areas.
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ==========================================
            INTERVIEWER COMPANIES (marquee)
        ========================================== */}
        <section
          id="interviewer-companies"
          className="scroll-mt-32 px-4 py-14 sm:px-6 lg:px-8"
          style={{ background: "var(--ib-alt)" }}
        >
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <SectionIntro
                eyebrow="Meet the engineering community"
                title="Practice with working engineers from multiple companies"
                description="Our interviewer network brings practical perspectives from backend development, Java, Spring Boot, microservices, system design, GenAI and production engineering."
              />
            </Reveal>

            <div
              className="ib-marquee mt-8"
              style={{
                WebkitMaskImage:
                  "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
                maskImage:
                  "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)",
              }}
            >
              <div className="ib-marquee-track py-2">
                {[...INTERVIEWER_COMPANIES, ...INTERVIEWER_COMPANIES].map(
                  (company, index) => (
                    <CompanyLogo
                      key={`${company.name}-${index}`}
                      company={company}
                      compact
                    />
                  )
                )}
              </div>
            </div>

            <Reveal className="mt-6">
              <div
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5"
                style={{
                  borderColor: "var(--ib-border)",
                  background: "var(--ib-surface)",
                }}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="ib-orange mt-0.5 shrink-0" size={20} />

                  <p className="ib-muted max-w-3xl text-xs leading-6">
                    Company names describe reported interviewer professional
                    backgrounds, not corporate partnerships or endorsements. The
                    interviewer for a specific slot may vary; contact support
                    for the assigned engineer's profile.
                  </p>
                </div>

                <a href="#interview-slots" className="ib-primary">
                  Find a slot <ArrowRight size={15} />
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ==========================================
            SLOT CALENDAR
        ========================================== */}
        <section
          id="interview-slots"
          className="scroll-mt-36 px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="ib-orange inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                  <span className="h-px w-8 bg-gradient-to-r from-orange-500 to-transparent" />
                  Choose Your Time
                </span>

                <h2 className="mt-2 text-2xl font-black sm:text-4xl">
                  Upcoming <span className="ib-grad-text">Interview Slots</span>
                </h2>

                <p className="ib-muted mt-2 max-w-2xl text-sm leading-7">
                  Browse dates in IST, then instantly view session times in your
                  preferred time zone and clock format. Your booking uses the
                  original slot and schedule.
                </p>
              </div>

              <TimeDisplayControls
                timeZone={timeZone}
                setTimeZone={setTimeZone}
                timeFormat={timeFormat}
                setTimeFormat={setTimeFormat}
              />
            </Reveal>

            {/* DATE SELECTOR */}
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-3">
              {days.map(({ key, date }, index) => {
                const active = selectedDay === key;

                return (
                  <Reveal key={key} delay={index * 0.03} y={18}>
                    <button
                      type="button"
                      aria-pressed={active}
                      onClick={() => {
                        setSelectedDay(key);
                        setViewFilter("all");
                      }}
                      className="ib-card ib-card-hover relative w-full overflow-hidden rounded-2xl p-2.5 text-center transition-transform duration-200 hover:-translate-y-1 sm:p-4"
                    >
                      {active && (
                        <motion.span
                          layoutId="ib-day-pill"
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: "var(--ib-orange-light)",
                            boxShadow: "inset 0 0 0 2px var(--ib-orange)",
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}

                      <span className="relative block">
                        <span className="ib-muted block text-[11px] font-bold">
                          {index === 0
                            ? "Today"
                            : fmtDate(date, { weekday: "short" })}
                        </span>

                        <span
                          className={`mt-1 block text-2xl font-black ${
                            active ? "ib-orange" : ""
                          }`}
                        >
                          {fmtDate(date, { day: "numeric" })}
                        </span>

                        <span className="ib-muted mt-1 block text-xs">
                          {fmtDate(date, { month: "short" })}
                        </span>
                      </span>
                    </button>
                  </Reveal>
                );
              })}
            </div>

            {/* FILTER HEADER */}
            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold">
                  {selectedDateLabel(selectedDay)}{" "}
                  <span className="ib-muted text-xs font-semibold">(IST date)</span>
                </h3>

                <p className="ib-muted mt-1 text-xs">
                  {loading
                    ? "Checking availability..."
                    : `${countAvailable} available · ${countBooked} booked · ${countHeld} reserved`}
                </p>
              </div>

              <div className="ib-card inline-flex flex-wrap rounded-xl p-1">
                {[
                  { key: "all", label: "All" },
                  { key: "available", label: "Available" },
                  { key: "unavailable", label: "Unavailable" },
                ].map((filter) => {
                  const active = viewFilter === filter.key;

                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setViewFilter(filter.key)}
                      className={`relative rounded-lg px-3 py-2 text-xs font-bold ${
                        active ? "ib-orange" : "ib-muted"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="ib-filter-pill"
                          className="absolute inset-0 rounded-lg"
                          style={{ background: "var(--ib-orange-light)" }}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}

                      <span className="relative">{filter.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TOPIC FILTER */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTopicFilter("all")}
                className={`ib-outline !px-3 !py-2 ${
                  topicFilter === "all" ? "ib-selected" : ""
                }`}
              >
                All Topics
              </button>

              {ALL_TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setTopicFilter(topic)}
                  className={`ib-outline !px-3 !py-2 ${
                    topicFilter === topic ? "ib-selected" : ""
                  }`}
                >
                  {TOPIC_INFO[topic].title}
                </button>
              ))}
            </div>

            {/* ERROR */}
            {loadError && (
              <div className="ib-error mt-6 flex items-start gap-3 rounded-xl p-4 text-sm">
                <AlertCircle size={19} className="shrink-0" />

                <div className="flex-1">{loadError}</div>

                <button
                  type="button"
                  onClick={() => fetchSlots()}
                  className="font-bold underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* LOADING / EMPTY / SLOTS */}
            {loading ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div
                    key={index}
                    className="ib-card animate-pulse rounded-2xl p-5"
                  >
                    <div className="ib-panel h-5 w-1/2 rounded-lg" />
                    <div className="ib-panel mt-4 h-12 rounded-xl" />
                    <div className="ib-panel mt-4 h-10 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : shownSlots.length === 0 ? (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="ib-card mt-8 rounded-3xl px-5 py-14 text-center"
              >
                <motion.div
                  animate={reduce ? undefined : { rotate: [0, 8, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="inline-block"
                >
                  <CalendarDays size={36} className="ib-orange mx-auto" />
                </motion.div>

                <h3 className="mt-4 text-lg font-extrabold">
                  No matching interview slots
                </h3>

                <p className="ib-muted mx-auto mt-2 max-w-md text-sm leading-7">
                  Try a different date or clear the selected filters to explore
                  more sessions.
                </p>

                <button
                  type="button"
                  className="ib-outline mt-5"
                  onClick={() => {
                    setViewFilter("all");
                    setTopicFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <div
                key={`${selectedDay}-${viewFilter}-${topicFilter}`}
                className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              >
                {shownSlots.map((slot, index) => {
                  const available = slot.status === "AVAILABLE";

                  const topics =
                    Array.isArray(slot.allowedTopics) && slot.allowedTopics.length
                      ? slot.allowedTopics
                      : ALL_TOPICS;

                  const hasDiscount = Number(slot.mrp) > Number(slot.price);

                  return (
                    <motion.article
                      key={slot._id}
                      initial={reduce ? false : { opacity: 0, y: 24, rotate: index % 2 ? 1.5 : -1.5 }}
                      animate={{ opacity: 1, y: 0, rotate: 0 }}
                      transition={{ duration: 0.45, delay: Math.min(index, 8) * 0.05, ease: EASE }}
                      whileHover={reduce ? undefined : { y: -5 }}
                      className={`ib-card ib-icon-spin flex flex-col rounded-2xl p-5 shadow-sm ${
                        available ? "ib-card-hover" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="ib-panel rounded-xl p-3">
                          <Video size={20} className="ib-orange" />
                        </div>

                        <StatusPill slot={slot} />
                      </div>

                      <h3 className="mt-4 text-lg font-black">
                        {slot.title || "Technical Mock Interview"}
                      </h3>

                      <div className="ib-muted mt-3 flex items-center gap-2 text-sm">
                        <Clock3 size={16} className="ib-orange" />
                        {fmtTime(slot.startTime, timeZone, timeFormat)}
                        {" – "}
                        {fmtTime(slot.endTime, timeZone, timeFormat)}
                      </div>

                      <p className="ib-muted mt-2 text-xs">
                        {slot.durationMinutes || 45} minutes · {displayZone}
                      </p>

                      {timeZone !== TIMEZONE && (
                        <p className="ib-muted mt-1 text-xs">
                          Your local date: {fmtSlotDate(slot.startTime, timeZone)} ·
                          Original schedule: {fmtTime(slot.startTime, TIMEZONE, "12")} IST
                        </p>
                      )}

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {topics.slice(0, 4).map((topic) => (
                          <span
                            key={topic}
                            className="ib-panel rounded-lg px-2.5 py-1 text-[11px] font-bold"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-5">
                        <div
                          className="border-t pt-4"
                          style={{ borderColor: "var(--ib-border)" }}
                        >
                          <p className="ib-muted text-[11px]">Session price</p>

                          <div className="mt-1 flex items-center gap-2">
                            <span className="ib-orange text-2xl font-black">
                              {fmtMoney(slot.price, slot.currency)}
                            </span>

                            {hasDiscount && (
                              <span className="ib-muted text-xs line-through">
                                {fmtMoney(slot.mrp, slot.currency)}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            disabled={!available}
                            onClick={() => handleBook(slot)}
                            className={`group ${
                              available
                                ? "ib-primary mt-4 w-full"
                                : "ib-outline mt-4 w-full"
                            }`}
                          >
                            {available ? (
                              <>
                                Book This Slot
                                <Send
                                  size={16}
                                  className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1"
                                />
                              </>
                            ) : (
                              "Not Available"
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <MarketingSections openFaq={openFaq} setOpenFaq={setOpenFaq} />

        {/* ==========================================
            SUPPORT AND CANCELLATIONS
        ========================================== */}
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="ib-card grid gap-6 rounded-3xl p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="ib-orange flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    <HelpCircle size={17} />
                    Support
                  </div>

                  <h2 className="mt-3 text-xl font-black sm:text-2xl">
                    Need to cancel or reschedule?
                  </h2>

                  <p className="ib-muted mt-3 max-w-2xl text-sm leading-7">
                    Contact our support team using the same email address you
                    entered during booking. Include your booking ID and request.
                    For candidate-requested cancellations, email support at
                    least 24 hours before your interview. A ₹199 cancellation
                    fee applies; requests made within 24 hours are
                    non-refundable, subject to the applicable terms.
                  </p>
                </div>

                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                    "Mock Interview Booking Support"
                  )}`}
                  className="ib-primary w-full md:w-auto"
                >
                  <Mail size={17} />
                  Contact Support
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Mobile sticky CTA */}
      <div
        className="ib-card fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t p-3 sm:hidden"
        style={{ boxShadow: "0 -8px 25px rgba(0,0,0,.08)" }}
      >
        <div className="min-w-0">
          <strong className="block text-sm">Live 1:1 mock interview</strong>
          <span className="ib-muted block text-xs">Choose a slot · Secure checkout</span>
        </div>

        <a href="#interview-slots" className="ib-primary shrink-0">
          Book a slot <Send size={15} />
        </a>
      </div>

      {/* BOOKING MODAL */}
      <AnimatePresence>
        {selectedSlot && (
          <BookingModal
            key={selectedSlot._id}
            slot={selectedSlot}
            theme={theme}
            timeZone={timeZone}
            timeFormat={timeFormat}
            cashfreeMode={cashfreeMode}
            onClose={() => setSelectedSlot(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
