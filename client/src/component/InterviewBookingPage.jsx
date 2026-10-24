
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  ArrowRight,
  ArrowLeft,
  CalendarDays,
  Clock3,
  CheckCircle2,
  X,
  ShieldCheck,
  Video,
  Code2,
  Layers3,
  Network,
  BrainCircuit,
  BriefcaseBusiness,
  Star,
  MessageSquareText,
  LoaderCircle,
  LockKeyhole,
  CreditCard,
  Users,
  Sparkles,
  AlertCircle,
  Check,
  FileText,
  ChevronRight,
  Mail,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

/* =========================================================
   CONFIGURATION
========================================================= */

const BASE_URL = (
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:5001"
).replace(/\/+$/, "");

const API = `${BASE_URL}/api/interviews`;

const PAYMENT_STATUS_PATH =
  "/mock-interviews/payment-status";

const TIMEZONE = "Asia/Kolkata";

const DEFAULT_CASHFREE_MODE =
  import.meta.env.VITE_CASHFREE_ENV === "production"
    ? "production"
    : "sandbox";

const TOPIC_INFO = {
  DSA: {
    title: "Data Structures & Algorithms",
    description:
      "Problem solving, coding, complexity and edge cases.",
    Icon: Code2,
  },
  LLD: {
    title: "Low-Level Design",
    description:
      "OOP, SOLID, design patterns and concurrency.",
    Icon: Layers3,
  },
  HLD: {
    title: "High-Level System Design",
    description:
      "Architecture, caching, scaling and distributed systems.",
    Icon: Network,
  },
  GENAI: {
    title: "GenAI Engineering",
    description:
      "RAG, AI agents, LLMs, evaluations and production systems.",
    Icon: BrainCircuit,
  },
  PROJECTS: {
    title: "Project Discussion",
    description:
      "Architecture decisions, impact, trade-offs and ownership.",
    Icon: BriefcaseBusiness,
  },
};

const ALL_TOPICS = Object.keys(TOPIC_INFO);

/* =========================================================
   THEME

   Uses navbar's localStorage theme.
   No additional theme toggle.
========================================================= */

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const value = localStorage.getItem("theme");

    if (value === "dark" || value === "light") {
      return value;
    }

    return document.documentElement.classList.contains(
      "dark"
    )
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function useNavbarTheme() {
  const [theme, setTheme] = useState(
    getStoredTheme
  );

  useEffect(() => {
    const sync = () => {
      setTheme(getStoredTheme());
    };

    sync();

    window.addEventListener("storage", sync);
    window.addEventListener("themechange", sync);
    window.addEventListener(
      "targettrek-theme-change",
      sync
    );

    const observer = new MutationObserver(sync);

    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "data-theme",
        ],
      }
    );

    return () => {
      window.removeEventListener(
        "storage",
        sync
      );

      window.removeEventListener(
        "themechange",
        sync
      );

      window.removeEventListener(
        "targettrek-theme-change",
        sync
      );

      observer.disconnect();
    };
  }, []);

  return theme;
}

/* =========================================================
   DATE HELPERS

   All interview dates/times display in IST.
========================================================= */

function dateKey(date) {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }
  ).formatToParts(date);

  const get = (type) =>
    parts.find((part) => part.type === type)
      ?.value;

  return (
    `${get("year")}-` +
    `${get("month")}-` +
    `${get("day")}`
  );
}

function upcomingDays() {
  const result = [];

  const now = new Date();

  /*
    Use distinct IST calendar dates.

    Twelve-hour steps avoid accidentally
    skipping a date near UTC boundaries.
  */

  for (
    let i = 0;
    result.length < 8 && i < 22;
    i++
  ) {
    const date = new Date(
      now.getTime() +
        i * 12 * 60 * 60 * 1000
    );

    const key = dateKey(date);

    if (
      !result.some((item) => item.key === key)
    ) {
      result.push({
        key,
        date,
      });
    }
  }

  return result;
}

function fmtDate(value, options = {}) {
  if (!value) return "—";

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: TIMEZONE,
      ...options,
    }
  ).format(date);
}

function fmtTime(value) {
  return fmtDate(value, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function fmtMoney(value, currency = "INR") {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}

function formatSelectedDate(day) {
  if (!day) return "";

  return fmtDate(
    `${day}T12:00:00+05:30`,
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}

/* =========================================================
   AUTH TOKEN

   Pass authToken from Redux if available.
========================================================= */

function getToken(propToken) {
  if (propToken) {
    return propToken;
  }

  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      ""
    );
  } catch {
    return "";
  }
}

/* =========================================================
   API HELPER
========================================================= */

async function apiRequest(
  path,
  {
    method = "GET",
    body,
    token,
    signal,
  } = {}
) {
  const headers = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API}${path}`,
    {
      method,
      headers,
      credentials: "include",
      signal,
      cache: "no-store",
      ...(body !== undefined
        ? {
            body: JSON.stringify(body),
          }
        : {}),
    }
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (
    !response.ok ||
    data.success === false
  ) {
    const error = new Error(
      data.message ||
        `Request failed (${response.status})`
    );

    error.status = response.status;

    throw error;
  }

  return data;
}

function paymentStatusUrl(bookingId) {
  return (
    PAYMENT_STATUS_PATH +
    `?bookingId=${encodeURIComponent(
      bookingId
    )}`
  );
}

/* =========================================================
   CASHFREE SDK
========================================================= */

let cashfreeLoadPromise = null;

function loadCashfreeSDK() {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error(
        "Cashfree checkout requires a browser."
      )
    );
  }

  if (window.Cashfree) {
    return Promise.resolve(
      window.Cashfree
    );
  }

  if (!cashfreeLoadPromise) {
    cashfreeLoadPromise =
      new Promise(
        (resolve, reject) => {
          const existing =
            document.querySelector(
              'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]'
            );

          const script =
            existing ||
            document.createElement(
              "script"
            );

          if (!existing) {
            script.src =
              "https://sdk.cashfree.com/js/v3/cashfree.js";

            script.async = true;
          }

          const onLoad = () => {
            if (window.Cashfree) {
              resolve(
                window.Cashfree
              );
            } else {
              reject(
                new Error(
                  "Cashfree SDK is unavailable."
                )
              );
            }
          };

          const onError = () => {
            reject(
              new Error(
                "Unable to load Cashfree checkout."
              )
            );
          };

          script.addEventListener(
            "load",
            onLoad,
            { once: true }
          );

          script.addEventListener(
            "error",
            onError,
            { once: true }
          );

          if (!existing) {
            document.head.appendChild(
              script
            );
          } else if (window.Cashfree) {
            resolve(window.Cashfree);
          }
        }
      ).catch((error) => {
        cashfreeLoadPromise = null;
        throw error;
      });
  }

  return cashfreeLoadPromise;
}

/* =========================================================
   FORM VALIDATION
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

function validateDetails(candidate) {
  if (
    candidate.name.trim().length < 2
  ) {
    return "Enter your full name.";
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      candidate.email.trim()
    )
  ) {
    return "Enter a valid email address.";
  }

  const normalizedPhone =
    candidate.phone.replace(
      /[\s()-]/g,
      ""
    );

  if (
    !/^\+?\d{10,15}$/.test(
      normalizedPhone
    )
  ) {
    return "Enter a valid phone number.";
  }

  if (
    candidate.experienceYears !== ""
  ) {
    const experience = Number(
      candidate.experienceYears
    );

    if (
      !Number.isFinite(experience) ||
      experience < 0 ||
      experience > 50
    ) {
      return "Experience must be between 0 and 50 years.";
    }
  }

  if (
    candidate.resumeUrl.trim()
  ) {
    try {
      const url = new URL(
        candidate.resumeUrl.trim()
      );

      if (
        !["https:", "http:"].includes(
          url.protocol
        )
      ) {
        return "Enter a valid resume URL.";
      }
    } catch {
      return "Enter a valid resume URL.";
    }
  }

  return "";
}

/* =========================================================
   LOCAL STYLES

   Fully scoped to .tt-ib.

   The portal receives the same class and
   theme attributes so modal variables work.

   No navbar/footer/global theme toggle.
========================================================= */

const styles = `
.tt-ib {
  --ib-bg: #fffcf8;
  --ib-surface: #ffffff;
  --ib-alt: #fff5eb;
  --ib-text: #28211d;
  --ib-muted: #74665c;
  --ib-border: #eadfd4;
  --ib-orange: #ea580c;
  --ib-orange-light: #ffedd5;
  --ib-input: #ffffff;
  --ib-green: #166534;
  --ib-green-bg: #ecfdf3;
  --ib-red: #b91c1c;
  --ib-red-bg: #fef2f2;

  color: var(--ib-text);
  background: var(--ib-bg);
  font-family: "DM Sans", Inter, system-ui, sans-serif;
  color-scheme: light;
  min-height: 100vh;
}

.tt-ib[data-ib-theme="dark"] {
  --ib-bg: #15110e;
  --ib-surface: #231c17;
  --ib-alt: #302118;
  --ib-text: #fff8f1;
  --ib-muted: #c2b1a4;
  --ib-border: #49372c;
  --ib-orange: #fb923c;
  --ib-orange-light: #38261a;
  --ib-input: #291f19;
  --ib-green: #86efac;
  --ib-green-bg: #153424;
  --ib-red: #fca5a5;
  --ib-red-bg: #3b1e20;

  color-scheme: dark;
}

.tt-ib *,
.tt-ib *::before,
.tt-ib *::after {
  box-sizing: border-box;
}

.tt-ib .ib-card {
  background: var(--ib-surface);
  border: 1px solid var(--ib-border);
  color: var(--ib-text);
}

.tt-ib .ib-panel {
  background: var(--ib-alt);
}

.tt-ib .ib-muted {
  color: var(--ib-muted);
}

.tt-ib .ib-orange {
  color: var(--ib-orange);
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
}

.tt-ib .ib-field:focus {
  border-color: var(--ib-orange);
  box-shadow: 0 0 0 3px rgba(234,88,12,.13);
}

.tt-ib .ib-field::placeholder {
  color: var(--ib-muted);
  opacity: .75;
}

.tt-ib .ib-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  background: #ea580c;
  color: #ffffff !important;
  border: 1px solid #ea580c;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  transition: .18s ease;
}

.tt-ib .ib-primary:hover:not(:disabled) {
  background: #c2410c;
}

.tt-ib .ib-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--ib-surface);
  color: var(--ib-text);
  border: 1px solid var(--ib-border);
  border-radius: 12px;
  padding: 11px 15px;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  transition: .18s ease;
}

.tt-ib .ib-outline:hover:not(:disabled) {
  border-color: var(--ib-orange);
}

.tt-ib button:disabled {
  opacity: .52;
  cursor: not-allowed;
}

.tt-ib .ib-selected {
  border-color: var(--ib-orange) !important;
  background: var(--ib-alt) !important;
}

.tt-ib .ib-status-available {
  background: var(--ib-green-bg);
  color: var(--ib-green);
}

.tt-ib .ib-status-unavailable {
  background: var(--ib-red-bg);
  color: var(--ib-red);
}

.tt-ib .ib-status-held {
  background: var(--ib-orange-light);
  color: var(--ib-orange);
}

.tt-ib .ib-input-label {
  display: block;
  font-size: 12px;
  font-weight: 750;
  margin-bottom: 7px;
}

.tt-ib .ib-progress {
  height: 6px;
  background: var(--ib-border);
  border-radius: 999px;
}

.tt-ib .ib-progress-active {
  background: #ea580c;
}

.tt-ib .ib-overlay {
  background: rgba(8, 5, 3, .86) !important;
}

.tt-ib .ib-modal-surface {
  background: var(--ib-surface) !important;
  color: var(--ib-text) !important;
  opacity: 1 !important;
  isolation: isolate;
  box-shadow: 0 35px 115px rgba(0,0,0,.5);
}

.tt-ib .ib-modal-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--ib-border) transparent;
  overscroll-behavior: contain;
}

.tt-ib .ib-error {
  background: var(--ib-red-bg);
  color: var(--ib-red);
  border: 1px solid var(--ib-border);
}

.tt-ib .ib-recovery {
  background: var(--ib-orange-light);
  border: 1px solid var(--ib-border);
}

.tt-ib a {
  text-decoration: none;
}

.tt-ib input,
.tt-ib textarea,
.tt-ib button {
  font: inherit;
}

.tt-ib .ib-primary,
.tt-ib .ib-outline {
  text-decoration: none;
}

.tt-ib .ib-day {
  min-width: 0;
  transition: border-color .18s, background .18s;
}

.tt-ib .ib-day:hover {
  border-color: var(--ib-orange);
}

.tt-ib .ib-slot {
  transition: border-color .18s, transform .18s;
}

.tt-ib .ib-slot:hover {
  border-color: var(--ib-orange);
}

@media (max-width: 640px) {
  .tt-ib .ib-modal-surface {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}
`;

/* =========================================================
   SMALL SHARED COMPONENTS
========================================================= */

function StatusPill({ slot }) {
  const status =
    slot.status || "AVAILABLE";

  let label = "Unavailable";
  let className =
    "ib-status-unavailable";

  if (status === "AVAILABLE") {
    label = "Available";
    className =
      "ib-status-available";
  } else if (status === "BOOKED") {
    label = "Booked";
  } else if (status === "HELD") {
    label = "Reserved";
    className =
      "ib-status-held";
  } else if (status === "BLOCKED") {
    label = "Blocked";
  }

  return (
    <span
      className={
        `rounded-full px-2.5 py-1 text-[11px] font-extrabold ${className}`
      }
    >
      {label}
    </span>
  );
}

function Progress({ step }) {
  const steps = [
    "Topics",
    "Your details",
    "Payment",
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {steps.map((name, index) => (
        <div
          key={name}
          className="space-y-2"
        >
          <div
            className={
              index <= step
                ? "ib-progress ib-progress-active"
                : "ib-progress"
            }
          />

          <span
            className={
              `text-[11px] ${
                index === step
                  ? "font-extrabold ib-orange"
                  : "ib-muted"
              }`
            }
          >
            {index + 1}. {name}
          </span>
        </div>
      ))}
    </div>
  );
}

function TopicCard({
  topic,
  selected,
  disabled,
  onClick,
}) {
  const info = TOPIC_INFO[topic];

  if (!info) return null;

  const Icon = info.Icon;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        `ib-card flex items-start gap-3 rounded-xl p-4 text-left ${
          selected
            ? "ib-selected"
            : ""
        }`
      }
    >
      <span className="ib-panel rounded-lg p-2">
        <Icon
          size={18}
          className="ib-orange"
        />
      </span>

      <span className="min-w-0 flex-1">
        <strong className="block text-sm">
          {info.title}
        </strong>

        <span className="ib-muted mt-1 block text-xs leading-5">
          {info.description}
        </span>
      </span>

      {selected && (
        <CheckCircle2
          size={18}
          className="ib-orange shrink-0"
        />
      )}
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  maxLength,
  min,
  max,
  step,
  className = "",
}) {
  return (
    <label className={className}>
      <span className="ib-input-label">
        {label}
        {required && " *"}
      </span>

      <input
        type={type}
        className="ib-field"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
      />
    </label>
  );
}

/* =========================================================
   BOOKING MODAL

   STEP 1: Select topics
   STEP 2: Enter candidate details
   STEP 3: Review + Cashfree checkout

   Payment result is handled by separate routes.
========================================================= */

function BookingModal({
  slot,
  onClose,
  token,
  cashfreeMode,
  theme,
}) {
  const [step, setStep] =
    useState(0);

  const [topics, setTopics] =
    useState([]);

  const [candidate, setCandidate] =
    useState(emptyCandidate);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [bookingId, setBookingId] =
    useState("");

  const [
    paymentStarted,
    setPaymentStarted,
  ] = useState(false);

  const availableTopics = (
    slot.allowedTopics ||
    ALL_TOPICS
  ).filter(
    (topic) =>
      Boolean(TOPIC_INFO[topic])
  );

  const maxTopics = Math.min(
    Number(slot.maxTopics) || 3,
    availableTopics.length
  );

  const priceText = fmtMoney(
    slot.price,
    slot.currency
  );

  const detailsError =
    validateDetails(candidate);

  const validDetails =
    !detailsError;

  const toggleTopic = (topic) => {
    setTopics((previous) => {
      if (
        previous.includes(topic)
      ) {
        return previous.filter(
          (item) => item !== topic
        );
      }

      if (
        previous.length >= maxTopics
      ) {
        return previous;
      }

      return [...previous, topic];
    });
  };

  const change = (key, value) => {
    setCandidate((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (
        event.key === "Escape" &&
        !busy
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      onKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [busy, onClose]);

  /*
    Lock body scroll while the modal is open.
  */

  useEffect(() => {
    const oldOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        oldOverflow;
    };
  }, []);

  /* =====================================================
     CHECKOUT

     Booking creation and payment order creation
     happen on the backend.

     The frontend never marks payment SUCCESS.

     Cashfree redirects to:

     /mock-interviews/payment-status?bookingId=...

     That page reconciles and routes to
     /success or /failed.
  ===================================================== */


async function checkout() {
  if (busy) return;

  setError("");

  if (topics.length === 0) {
    setError("Please select at least one interview topic.");
    setStep(0);
    return;
  }

  const validationError = validateDetails(candidate);

  if (validationError) {
    setError(validationError);
    setStep(1);
    return;
  }

  if (!token) {
    setError(
      "Please sign in to your Target Trek account before paying."
    );
    return;
  }

  /*
    Existing bookings must be checked before
    starting another payment.

    Do not create a second Cashfree order
    after checkout has already started.
  */

  if (paymentStarted && bookingId) {
    window.location.assign(
      paymentStatusUrl(bookingId)
    );
    return;
  }

  setBusy(true);

  let currentBookingId = bookingId;

  try {
    /* ==========================================
       STEP 1: LOAD CASHFREE SDK FIRST

       No booking or slot hold exists yet
       if this is the first attempt.
    ========================================== */

    const Cashfree = await loadCashfreeSDK();

    if (typeof Cashfree !== "function") {
      throw new Error(
        "Unable to initialize Cashfree payment gateway."
      );
    }

    const cashfree = Cashfree({
      mode: cashfreeMode,
    });

    if (
      !cashfree ||
      typeof cashfree.checkout !== "function"
    ) {
      throw new Error(
        "Cashfree checkout is not available. Please try again."
      );
    }

    /* ==========================================
       STEP 2: CREATE BOOKING

       The backend atomically holds the slot.
       Amount comes from the database.
    ========================================== */

    if (!currentBookingId) {
      const response = await apiRequest(
        "/bookings",
        {
          method: "POST",
          token,

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

              currentRole:
                candidate.currentRole.trim(),

              targetRole:
                candidate.targetRole.trim(),

              currentCompany:
                candidate.currentCompany.trim(),

              resumeUrl:
                candidate.resumeUrl.trim(),

              notes:
                candidate.notes.trim(),
            },
          },
        }
      );

      currentBookingId =
        response.data?.bookingId;

      if (!currentBookingId) {
        throw new Error(
          "Booking creation did not return a booking ID."
        );
      }

      setBookingId(currentBookingId);
    }

    /* ==========================================
       STEP 3: CREATE CASHFREE ORDER
    ========================================== */

    const paymentResponse = await apiRequest(
      `/bookings/${encodeURIComponent(
        currentBookingId
      )}/payment`,
      {
        method: "POST",
        token,
      }
    );

    const sessionId =
      paymentResponse.data?.paymentSessionId;

    const orderId =
      paymentResponse.data?.orderId;

    if (!sessionId) {
      throw new Error(
        "Cashfree did not return a payment session ID."
      );
    }

    /*
      An order is now registered with Cashfree.

      Never create another order just because
      the customer closes the payment screen.
    */

    setPaymentStarted(true);

    console.info("[Interview Checkout]", {
      bookingId: currentBookingId,
      orderId,
      mode: cashfreeMode,
      sessionCreated: Boolean(sessionId),
    });

    /* ==========================================
       STEP 4: OPEN CASHFREE PAYMENT GATEWAY
    ========================================== */

    const result = await cashfree.checkout({
      paymentSessionId: sessionId,
      redirectTarget: "_self",
    });

    /* ==========================================
       STEP 5: HANDLE SDK ERRORS

       Cashfree handles the redirect.

       DO NOT call window.location.assign()
       after checkout() returns successfully.
    ========================================== */

    if (result?.error) {
      throw new Error(
        result.error.message ||
          "Cashfree checkout could not be opened."
      );
    }

    /*
      If Cashfree returns without navigating,
      do not assume payment was made.

      Keep the booking available for a status
      check using the recovery link shown
      in the modal.
    */
  } catch (error) {
    console.error(
      "[Interview Checkout Error]",
      {
        bookingId: currentBookingId,
        message: error.message,
      }
    );

    setError(
      currentBookingId
        ? `${error.message || "Payment could not be started."} Your booking reference has been preserved. Please check its payment status before paying again.`
        : error.message ||
            "Unable to open the payment gateway."
    );
  } finally {
    setBusy(false);
  }
}


  const modal = (
    <motion.div
      data-ib-theme={theme}
      className="tt-ib !min-h-0 fixed inset-0 !m-0 z-[2147483000] flex items-end justify-center sm:items-center sm:p-5"
      style={{
        background: "transparent",
        isolation: "isolate",
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 1 }}
    >
      {/* OPAQUE BACKDROP */}

      <button
        type="button"
        aria-label="Close booking dialog"
        disabled={busy}
        onClick={onClose}
        className="ib-overlay absolute inset-0 z-0 w-full"
      />

      {/* FULLY OPAQUE DIALOG */}

      <motion.section
        role="dialog"
        aria-modal="true"
        aria-label="Book your mock interview"
        className="ib-card ib-modal-surface relative z-10 flex max-h-[96dvh] w-full max-w-[730px] flex-col overflow-hidden rounded-t-3xl shadow-2xl sm:max-h-[91dvh] sm:rounded-3xl"
        initial={{
          y: 28,
          scale: 0.99,
          opacity: 1,
        }}
        animate={{
          y: 0,
          scale: 1,
          opacity: 1,
        }}
        exit={{
          y: 20,
          opacity: 1,
        }}
      >
        {/* HEADER */}

        <div
          className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4 sm:px-7"
          style={{
            borderColor:
              "var(--ib-border)",
          }}
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

        {/* SCROLLABLE BODY */}

        <div className="ib-modal-scroll flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <Progress step={step} />

          {/* SLOT SUMMARY */}

          <div className="ib-panel mt-5 rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-extrabold">
                {fmtDate(
                  slot.startTime,
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  }
                )}
              </div>

              <span className="ib-orange text-lg font-black">
                {priceText}
              </span>
            </div>

            <div className="ib-muted mt-2 flex flex-wrap items-center gap-2 text-sm">
              <Clock3 size={14} />

              {fmtTime(
                slot.startTime
              )}

              {" – "}

              {fmtTime(
                slot.endTime
              )}

              {" · "}

              {slot.durationMinutes} min

              {" · IST"}
            </div>
          </div>

          {/* STEP 1 — TOPICS */}

          {step === 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-extrabold">
                Which topics should we focus on?
              </h3>

              <p className="ib-muted mt-1 text-sm leading-7">
                Choose up to {maxTopics} topics.
                Your interviewer can tailor
                the discussion to your target
                role and experience.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {availableTopics.map(
                  (topic) => {
                    const selected =
                      topics.includes(
                        topic
                      );

                    return (
                      <TopicCard
                        key={topic}
                        topic={topic}
                        selected={
                          selected
                        }
                        onClick={() =>
                          toggleTopic(
                            topic
                          )
                        }
                      />
                    );
                  }
                )}
              </div>
            </div>
          )}

          {/* STEP 2 — CANDIDATE DETAILS */}

          {step === 1 && (
            <div className="mt-6">
              <h3 className="text-lg font-extrabold">
                Tell us about yourself
              </h3>

              <p className="ib-muted mt-1 text-sm leading-7">
                These details help us prepare
                your session and send your
                interview confirmation.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField
                  label="Full name"
                  required
                  value={
                    candidate.name
                  }
                  onChange={(value) =>
                    change(
                      "name",
                      value
                    )
                  }
                  placeholder="Your full name"
                  maxLength={120}
                />

                <TextField
                  label="Email address"
                  required
                  type="email"
                  value={
                    candidate.email
                  }
                  onChange={(value) =>
                    change(
                      "email",
                      value
                    )
                  }
                  placeholder="you@example.com"
                  maxLength={254}
                />

                <TextField
                  label="Phone number"
                  required
                  type="tel"
                  value={
                    candidate.phone
                  }
                  onChange={(value) =>
                    change(
                      "phone",
                      value
                    )
                  }
                  placeholder="+91 9876543210"
                />

                <TextField
                  label="Experience (years)"
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={
                    candidate.experienceYears
                  }
                  onChange={(value) =>
                    change(
                      "experienceYears",
                      value
                    )
                  }
                  placeholder="2"
                />

                <TextField
                  label="Current role"
                  value={
                    candidate.currentRole
                  }
                  onChange={(value) =>
                    change(
                      "currentRole",
                      value
                    )
                  }
                  placeholder="Software Engineer"
                  maxLength={120}
                />

                <TextField
                  label="Target role"
                  value={
                    candidate.targetRole
                  }
                  onChange={(value) =>
                    change(
                      "targetRole",
                      value
                    )
                  }
                  placeholder="SDE-2 / Backend Engineer"
                  maxLength={120}
                />

                <TextField
                  label="Current company"
                  value={
                    candidate.currentCompany
                  }
                  onChange={(value) =>
                    change(
                      "currentCompany",
                      value
                    )
                  }
                  placeholder="Optional"
                  maxLength={120}
                />

                <TextField
                  label="Resume URL"
                  type="url"
                  value={
                    candidate.resumeUrl
                  }
                  onChange={(value) =>
                    change(
                      "resumeUrl",
                      value
                    )
                  }
                  placeholder="https://drive.google.com/..."
                />

                <label className="sm:col-span-2">
                  <span className="ib-input-label">
                    What should we focus on?
                  </span>

                  <textarea
                    className="ib-field min-h-[105px] resize-y"
                    value={
                      candidate.notes
                    }
                    onChange={(event) =>
                      change(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Share your goals, upcoming interview, weaker topics or projects you'd like to discuss."
                    maxLength={3000}
                  />
                </label>
              </div>

              <div className="ib-panel mt-5 flex items-start gap-3 rounded-xl p-4">
                <Mail
                  size={18}
                  className="ib-orange mt-0.5 shrink-0"
                />

                <p className="ib-muted text-xs leading-6">
                  After your payment is verified,
                  your booking details and
                  joining instructions will be
                  sent to your email address.
                  If the meeting link hasn't
                  been assigned, it will be
                  shared separately.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3 — REVIEW + PAYMENT */}

          {step === 2 && (
            <div className="mt-6">
              <h3 className="text-lg font-extrabold">
                Review and pay
              </h3>

              <p className="ib-muted mt-1 text-sm leading-7">
                Confirm your information
                before continuing to
                Cashfree's secure checkout.
              </p>

              <div className="ib-card mt-4 overflow-hidden rounded-2xl">
                <div className="space-y-4 p-4 text-sm sm:p-5">
                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Interview topics
                    </span>

                    <strong className="text-right">
                      {topics.join(
                        " · "
                      )}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Candidate
                    </span>

                    <strong className="text-right">
                      {candidate.name}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Email
                    </span>

                    <strong className="break-all text-right">
                      {candidate.email}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Interview time
                    </span>

                    <strong className="text-right">
                      {fmtTime(
                        slot.startTime
                      )}{" "}
                      IST
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Duration
                    </span>

                    <strong>
                      {slot.durationMinutes} minutes
                    </strong>
                  </div>
                </div>

                <div className="ib-panel flex items-center justify-between gap-3 p-4 sm:p-5">
                  <span className="font-bold">
                    Total to pay
                  </span>

                  <div className="text-right">
                    {Number(
                      slot.mrp
                    ) >
                      Number(
                        slot.price
                      ) && (
                      <span className="ib-muted mr-2 text-xs line-through">
                        {fmtMoney(
                          slot.mrp,
                          slot.currency
                        )}
                      </span>
                    )}

                    <span className="ib-orange text-2xl font-black">
                      {priceText}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ib-muted mt-4 flex items-start gap-2 text-xs leading-6">
                <LockKeyhole
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                Payment is processed securely
                by Cashfree. Your interview
                is confirmed only after
                our backend verifies
                successful payment.
              </div>
            </div>
          )}

          {/* ERRORS */}

          {error && (
            <div
              role="alert"
              className="ib-error mt-5 flex items-start gap-2 rounded-xl p-4 text-sm"
            >
              <AlertCircle
                size={18}
                className="shrink-0"
              />

              <span>{error}</span>
            </div>
          )}

          {/* PAYMENT RECOVERY */}

          {bookingId && (
            <div className="ib-recovery mt-5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="ib-orange shrink-0"
                />

                <div className="min-w-0">
                  <div className="text-sm font-extrabold">
                    Booking reference created
                  </div>

                  <div className="ib-muted mt-1 break-all text-xs">
                    {bookingId}
                  </div>

                  <p className="ib-muted mt-2 text-xs leading-6">
                    If checkout was interrupted,
                    verify this booking before
                    attempting another payment.
                  </p>

                  <a
                    href={paymentStatusUrl(
                      bookingId
                    )}
                    className="ib-outline mt-3"
                  >
                    <RefreshCw
                      size={15}
                    />
                    Check Payment Status
                    <ArrowRight
                      size={15}
                    />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER BUTTONS INSIDE MODAL */}

        <div
          className="flex shrink-0 items-center justify-between gap-3 border-t p-4 sm:px-7"
          style={{
            borderColor:
              "var(--ib-border)",
          }}
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
                    setStep(
                      step - 1
                    );
                  }
            }
          >
            <ArrowLeft
              size={16}
            />

            {step === 0
              ? "Cancel"
              : "Back"}
          </button>

          {step < 2 ? (
            <button
              type="button"
              className="ib-primary"
              disabled={
                step === 0
                  ? topics.length === 0
                  : !validDetails
              }
              onClick={() => {
                setError("");

                if (
                  step === 1 &&
                  detailsError
                ) {
                  setError(
                    detailsError
                  );
                  return;
                }

                setStep(
                  step + 1
                );
              }}
            >
              Continue
              <ArrowRight
                size={16}
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
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <CreditCard
                  size={17}
                />
              )}

              {busy
                ? "Processing..."
                : paymentStarted
                  ? "Check Payment"
                  : `Pay ${priceText}`}
            </button>
          )}
        </div>
      </motion.section>
    </motion.div>
  );

  return typeof document === "undefined"
    ? null
    : createPortal(
        modal,
        document.body
      );
}

/* =========================================================
   MAIN CUSTOMER PAGE
========================================================= */

export default function InterviewBookingPage({
  authToken,
  cashfreeMode = DEFAULT_CASHFREE_MODE,
  onLoginRequired,
}) {
  const theme = useNavbarTheme();

  const days = useMemo(
    upcomingDays,
    []
  );

  const [
    selectedDay,
    setSelectedDay,
  ] = useState(
    () => days[0]?.key || ""
  );

  const [slots, setSlots] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    selectedSlot,
    setSelectedSlot,
  ] = useState(null);

  const [
    viewFilter,
    setViewFilter,
  ] = useState("all");

  const [
    topicFilter,
    setTopicFilter,
  ] = useState("all");

  const token =
    getToken(authToken);

  /* =====================================================
     FETCH SLOTS FOR SELECTED DATE

     GET /api/interviews/slots
       ?date=YYYY-MM-DD
       &includeUnavailable=true
  ===================================================== */

  const fetchSlots =
    useCallback(
      async (
        signal
      ) => {
        if (!selectedDay) {
          return;
        }

        setLoading(true);
        setLoadError("");

        try {
          const result =
            await apiRequest(
              `/slots?date=${encodeURIComponent(
                selectedDay
              )}&includeUnavailable=true`,
              {
                signal,
              }
            );

          const list =
            Array.isArray(
              result.data
            )
              ? result.data
              : [];

          if (
            !signal?.aborted
          ) {
            setSlots(
              list.filter(
                (slot) =>
                  !slot.isDeleted
              )
            );
          }
        } catch (error) {
          if (
            error.name !==
            "AbortError"
          ) {
            setSlots([]);

            setLoadError(
              error.message ||
                "Unable to load interview slots."
            );
          }
        } finally {
          if (
            !signal?.aborted
          ) {
            setLoading(false);
          }
        }
      },
      [selectedDay]
    );

  useEffect(() => {
    const controller =
      new AbortController();

    fetchSlots(
      controller.signal
    );

    return () =>
      controller.abort();
  }, [fetchSlots]);

  /* =====================================================
     DERIVED SLOT FILTERS
  ===================================================== */

  const shownSlots = useMemo(
    () =>
      slots
        .filter((slot) => {
          if (
            viewFilter ===
              "available" &&
            slot.status !==
              "AVAILABLE"
          ) {
            return false;
          }

          if (
            viewFilter ===
              "unavailable" &&
            slot.status ===
              "AVAILABLE"
          ) {
            return false;
          }

          if (
            topicFilter !==
              "all" &&
            !(
              slot.allowedTopics ||
              []
            ).includes(
              topicFilter
            )
          ) {
            return false;
          }

          return true;
        })
        .sort(
          (a, b) =>
            new Date(
              a.startTime
            ) -
            new Date(
              b.startTime
            )
        ),
    [
      slots,
      viewFilter,
      topicFilter,
    ]
  );

  const countAvailable =
    slots.filter(
      (slot) =>
        slot.status ===
        "AVAILABLE"
    ).length;

  const countBooked =
    slots.filter(
      (slot) =>
        slot.status ===
        "BOOKED"
    ).length;

  const countHeld =
    slots.filter(
      (slot) =>
        slot.status ===
        "HELD"
    ).length;

  /* =====================================================
     OPEN BOOKING MODAL

     Authentication is required.
  ===================================================== */

  const handleBook = (
    slot
  ) => {
    if (
      slot.status !==
      "AVAILABLE"
    ) {
      return;
    }
    setLoadError("");
    setSelectedSlot(slot);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      className="tt-ib mt-16"
      data-ib-theme={theme}
    >
      <style>{styles}</style>

      <main>
        {/* =================================================
           HERO
        ================================================= */}

        <section
          className="relative overflow-hidden px-4 pb-14 pt-12 sm:px-6 sm:pt-20 lg:px-8"
          style={{
            background:
              "linear-gradient(140deg,var(--ib-bg),var(--ib-alt))",
          }}
        >
          <div
            className="pointer-events-none absolute -right-20 top-4 h-64 w-64 rounded-full blur-3xl"
            style={{
              background:
                "rgba(249,115,22,.10)",
            }}
          />

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest"
                style={{
                  background:
                    "var(--ib-orange-light)",
                  color:
                    "var(--ib-orange)",
                }}
              >
                <span className="h-2 w-2 rounded-full bg-orange-500" />

                Target Trek Mock Interviews
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-[58px] lg:leading-[1.12]">
                Prepare for the interview{" "}
                <span className="ib-orange">
                  that matters.
                </span>
              </h1>

              <p className="ib-muted mt-5 max-w-2xl text-base leading-8 sm:text-lg">
                Practice technical interviews
                with engineers experienced in
                backend engineering and
                large-scale distributed systems.
                Strengthen your technical depth,
                problem-solving approach and
                communication through realistic
                discussions and actionable feedback.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="#interview-slots"
                  className="ib-primary"
                >
                  Explore Available Slots
                  <ArrowRight
                    size={17}
                  />
                </a>

                <a
                  href="#how-it-works"
                  className="ib-outline"
                >
                  How It Works
                  <ChevronRight
                    size={17}
                  />
                </a>
              </div>

              <div className="ib-muted mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <Video
                    size={15}
                    className="ib-orange"
                  />
                  Live 1:1 Interview
                </span>

                <span className="flex items-center gap-2">
                  <MessageSquareText
                    size={15}
                    className="ib-orange"
                  />
                  Actionable Feedback
                </span>

                <span className="flex items-center gap-2">
                  <ShieldCheck
                    size={15}
                    className="ib-orange"
                  />
                  Secure Checkout
                </span>
              </div>
            </div>

            {/* HERO TOPIC CARD */}

            <div className="ib-card rounded-3xl p-5 shadow-xl sm:p-7">
              <div className="flex items-center justify-between">
                <span className="ib-orange text-xs font-bold uppercase tracking-wider">
                  What you can practice
                </span>

                <div className="ib-panel rounded-xl p-2">
                  <Sparkles
                    size={20}
                    className="ib-orange"
                  />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {ALL_TOPICS.map(
                  (topic) => {
                    const info =
                      TOPIC_INFO[topic];

                    const Icon =
                      info.Icon;

                    return (
                      <div
                        key={topic}
                        className="flex items-center gap-3 rounded-xl p-2"
                      >
                        <div className="ib-panel rounded-lg p-2.5">
                          <Icon
                            size={18}
                            className="ib-orange"
                          />
                        </div>

                        <div className="flex-1">
                          <div className="text-sm font-bold">
                            {info.title}
                          </div>

                          <p className="ib-muted mt-1 text-xs">
                            {info.description}
                          </p>
                        </div>

                        <Check
                          size={16}
                          className="ib-orange"
                        />
                      </div>
                    );
                  }
                )}
              </div>

              <div className="ib-panel ib-muted mt-5 rounded-xl px-4 py-3 text-xs leading-6">
                Sessions can be tailored to
                your experience, target
                company, upcoming interviews
                and improvement areas.
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
           SLOT CALENDAR
        ================================================= */}

        <section
          id="interview-slots"
          className="scroll-mt-24 px-4 py-14 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="ib-orange text-xs font-black uppercase tracking-widest">
                  Choose Your Time
                </span>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Upcoming Interview Slots
                </h2>

                <p className="ib-muted mt-2 max-w-2xl text-sm leading-7">
                  Browse today and the next
                  seven days. Select a date
                  to view available,
                  reserved, booked and
                  blocked interview times.
                  Each slot has its own price.
                </p>
              </div>

              <span className="ib-panel rounded-xl px-4 py-2 text-xs font-bold">
                All Times in IST
              </span>
            </div>

            {/* DATE SELECTOR */}

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-3">
              {days.map(
                (
                  { key, date },
                  index
                ) => {
                  const active =
                    selectedDay ===
                    key;

                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={
                        active
                      }
                      onClick={() => {
                        setSelectedDay(
                          key
                        );

                        setViewFilter(
                          "all"
                        );
                      }}
                      className={
                        `ib-card ib-day rounded-2xl p-2.5 text-center sm:p-4 ${
                          active
                            ? "ib-selected"
                            : ""
                        }`
                      }
                    >
                      <div className="ib-muted text-[11px] font-bold">
                        {index === 0
                          ? "Today"
                          : fmtDate(
                              date,
                              {
                                weekday:
                                  "short",
                              }
                            )}
                      </div>

                      <div
                        className={
                          `mt-1 text-2xl font-black ${
                            active
                              ? "ib-orange"
                              : ""
                          }`
                        }
                      >
                        {fmtDate(
                          date,
                          {
                            day:
                              "numeric",
                          }
                        )}
                      </div>

                      <div className="ib-muted mt-1 text-xs">
                        {fmtDate(
                          date,
                          {
                            month:
                              "short",
                          }
                        )}
                      </div>

                      {active && (
                        <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-orange-500" />
                      )}
                    </button>
                  );
                }
              )}
            </div>

            {/* DATE TITLE AND STATUS FILTERS */}

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold">
                  {formatSelectedDate(
                    selectedDay
                  )}
                </h3>

                <p className="ib-muted mt-1 text-xs">
                  {loading
                    ? "Checking availability..."
                    : `${countAvailable} available · ${countBooked} booked · ${countHeld} reserved`}
                </p>
              </div>

              <div className="ib-card inline-flex flex-wrap rounded-xl p-1">
                {[
                  {
                    key: "all",
                    label: "All",
                  },
                  {
                    key: "available",
                    label: "Available",
                  },
                  {
                    key: "unavailable",
                    label: "Unavailable",
                  },
                ].map(
                  (filter) => (
                    <button
                      key={
                        filter.key
                      }
                      type="button"
                      onClick={() =>
                        setViewFilter(
                          filter.key
                        )
                      }
                      className={
                        `rounded-lg px-3 py-2 text-xs font-bold ${
                          viewFilter ===
                          filter.key
                            ? "ib-selected"
                            : "ib-muted"
                        }`
                      }
                    >
                      {filter.label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* TOPIC FILTER */}

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  setTopicFilter(
                    "all"
                  )
                }
                className={
                  `ib-outline !px-3 !py-2 !text-xs ${
                    topicFilter === "all"
                      ? "ib-selected"
                      : ""
                  }`
                }
              >
                All Topics
              </button>

              {ALL_TOPICS.map(
                (topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() =>
                      setTopicFilter(
                        topic
                      )
                    }
                    className={
                      `ib-outline !px-3 !py-2 !text-xs ${
                        topicFilter ===
                        topic
                          ? "ib-selected"
                          : ""
                      }`
                    }
                  >
                    {topic === "GENAI"
                      ? "GenAI"
                      : topic === "PROJECTS"
                        ? "Projects"
                        : topic}
                  </button>
                )
              )}
            </div>

            {/* ERROR */}

            {loadError && (
              <div
                role="alert"
                className="ib-error mt-5 flex items-start gap-2 rounded-xl p-4 text-sm"
              >
                <AlertCircle
                  size={18}
                  className="shrink-0"
                />

                <span>
                  {loadError}
                </span>
              </div>
            )}

            {/* LOADING */}

            {loading ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(
                  (number) => (
                    <div
                      key={number}
                      className="ib-card h-44 animate-pulse rounded-2xl"
                    />
                  )
                )}
              </div>
            ) : shownSlots.length ? (
              /* SLOT CARDS */

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shownSlots.map(
                  (slot) => {
                    const available =
                      slot.status ===
                      "AVAILABLE";

                    return (
                      <motion.article
                        layout
                        key={
                          slot._id
                        }
                        className={
                          `ib-card ib-slot rounded-2xl p-5 ${
                            available
                              ? ""
                              : "opacity-75"
                          }`
                        }
                      >
                        <div className="flex items-center justify-between gap-2">
                          <StatusPill
                            slot={slot}
                          />

                          <span className="ib-muted flex items-center gap-1.5 text-xs">
                            <Clock3
                              size={13}
                            />

                            {slot.durationMinutes} min
                          </span>
                        </div>

                        <h4 className="mt-4 text-lg font-extrabold">
                          {fmtTime(
                            slot.startTime
                          )}
                        </h4>

                        <p className="ib-muted mt-1 text-sm">
                          Until{" "}
                          {fmtTime(
                            slot.endTime
                          )}{" "}
                          · IST
                        </p>

                        <p className="ib-muted mt-3 line-clamp-2 min-h-[38px] text-xs leading-5">
                          {slot.description ||
                            slot.title ||
                            "Live online technical mock interview"}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {(
                            slot.allowedTopics ||
                            []
                          )
                            .slice(
                              0,
                              5
                            )
                            .map(
                              (
                                topic
                              ) => (
                                <span
                                  key={
                                    topic
                                  }
                                  className="ib-panel rounded-md px-2 py-1 text-[10px] font-bold"
                                >
                                  {
                                    topic
                                  }
                                </span>
                              )
                            )}
                        </div>

                        <div
                          className="mt-5 flex items-end justify-between gap-2 border-t pt-4"
                          style={{
                            borderColor:
                              "var(--ib-border)",
                          }}
                        >
                          <div>
                            {Number(
                              slot.mrp
                            ) >
                              Number(
                                slot.price
                              ) && (
                              <div className="ib-muted text-xs line-through">
                                {fmtMoney(
                                  slot.mrp,
                                  slot.currency
                                )}
                              </div>
                            )}

                            <div className="ib-orange text-xl font-black">
                              {fmtMoney(
                                slot.price,
                                slot.currency
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={
                              !available
                            }
                            onClick={() =>
                              handleBook(
                                slot
                              )
                            }
                            className={
                              available
                                ? "ib-primary"
                                : "ib-outline"
                            }
                          >
                            {available
                              ? "Book Slot"
                              : slot.status ===
                                  "BOOKED"
                                ? "Booked"
                                : slot.status ===
                                    "HELD"
                                  ? "Reserved"
                                  : "Unavailable"}

                            {available && (
                              <ArrowRight
                                size={15}
                              />
                            )}
                          </button>
                        </div>
                      </motion.article>
                    );
                  }
                )}
              </div>
            ) : (
              /* EMPTY STATE */

              <div className="ib-card mt-6 rounded-2xl px-6 py-16 text-center">
                <CalendarDays
                  size={34}
                  className="ib-orange mx-auto"
                />

                <h4 className="mt-4 text-lg font-extrabold">
                  No slots for this selection
                </h4>

                <p className="ib-muted mx-auto mt-2 max-w-md text-sm leading-6">
                  Try another date, choose
                  a different topic or
                  view all statuses.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setViewFilter(
                      "all"
                    );

                    setTopicFilter(
                      "all"
                    );
                  }}
                  className="ib-outline mt-4"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
           HOW IT WORKS
        ================================================= */}

        <section
          id="how-it-works"
          className="px-4 py-14 sm:px-6 lg:px-8"
          style={{
            background:
              "var(--ib-alt)",
          }}
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <span className="ib-orange text-xs font-black uppercase tracking-widest">
                Simple Booking Process
              </span>

              <h2 className="mt-2 text-3xl font-black">
                From preparation to
                confident answers.
              </h2>

              <p className="ib-muted mt-3 text-sm leading-7">
                Choose a suitable interview
                time, tell us what you'd
                like to practice, complete
                payment and receive your
                confirmed booking details.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title:
                    "Choose Your Slot",
                  description:
                    "Browse dates, durations, topics, availability and the price of each session.",
                  Icon:
                    CalendarDays,
                },
                {
                  number: "02",
                  title:
                    "Personalize Your Interview",
                  description:
                    "Select interview topics and share your goals, experience and resume.",
                  Icon: Users,
                },
                {
                  number: "03",
                  title:
                    "Pay and Attend",
                  description:
                    "Complete Cashfree checkout, verify your booking and join at your scheduled time.",
                  Icon: Video,
                },
              ].map(
                (item) => {
                  const Icon =
                    item.Icon;

                  return (
                    <div
                      key={
                        item.number
                      }
                      className="ib-card rounded-2xl p-6"
                    >
                      <span className="ib-orange text-sm font-black">
                        {
                          item.number
                        }
                      </span>

                      <div className="ib-panel mt-4 inline-flex rounded-xl p-3">
                        <Icon
                          size={24}
                          className="ib-orange"
                        />
                      </div>

                      <h3 className="mt-4 text-lg font-extrabold">
                        {
                          item.title
                        }
                      </h3>

                      <p className="ib-muted mt-2 text-sm leading-7">
                        {
                          item.description
                        }
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>

        {/* =================================================
           ENGINEERING BENEFITS
        ================================================= */}

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
            <div>
              <span className="ib-orange text-xs font-black uppercase tracking-widest">
                Learn Through Realistic Practice
              </span>

              <h2 className="mt-2 text-3xl font-black">
                More than just
                answering questions.
              </h2>

              <p className="ib-muted mt-4 text-sm leading-8">
                Technical interviews
                evaluate how you think,
                communicate and make
                decisions. Practice
                discussing architecture,
                data structures, performance,
                concurrency and trade-offs
                with engineers experienced
                in real-world backend
                systems.
              </p>

              <div className="mt-7 space-y-4">
                {[
                  "Explain complexity, trade-offs and edge cases",
                  "Discuss high-impact projects and technical decisions",
                  "Explore scalability, concurrency and distributed systems",
                  "Identify practical areas for improvement",
                ].map(
                  (item) => (
                    <div
                      key={
                        item
                      }
                      className="flex items-start gap-3"
                    >
                      <span className="ib-panel rounded-lg p-1.5">
                        <Check
                          size={16}
                          className="ib-orange"
                        />
                      </span>

                      <span className="text-sm leading-7">
                        {
                          item
                        }
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* FEEDBACK CARD */}

            <div className="ib-card rounded-3xl p-6 sm:p-8">
              <div className="ib-orange flex items-center gap-2 text-sm font-extrabold">
                <Star
                  size={17}
                />
                Feedback-Focused Practice
              </div>

              <h3 className="mt-4 text-2xl font-black">
                What your feedback can cover
              </h3>

              <div className="mt-5 space-y-4">
                {[
                  {
                    title:
                      "Problem-solving approach",
                    description:
                      "How you clarify requirements, explore solutions and handle edge cases.",
                  },
                  {
                    title:
                      "Technical depth",
                    description:
                      "Data structures, object-oriented design, architecture and engineering trade-offs.",
                  },
                  {
                    title:
                      "Communication",
                    description:
                      "How clearly you explain decisions, complexity and past projects.",
                  },
                  {
                    title:
                      "Areas for improvement",
                    description:
                      "Concrete topics to revise and practical suggestions for interview preparation.",
                  },
                ].map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item.title
                      }
                      className="flex gap-3"
                    >
                      <span className="ib-panel ib-orange flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black">
                        {
                          index + 1
                        }
                      </span>

                      <div>
                        <div className="text-sm font-bold">
                          {
                            item.title
                          }
                        </div>

                        <p className="ib-muted mt-1 text-xs leading-6">
                          {
                            item.description
                          }
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              <p className="ib-muted mt-6 text-xs">
                Feedback depends on
                the session's duration,
                selected topics and
                interview discussion.
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
           CALL TO ACTION
        ================================================= */}

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div
            className="mx-auto max-w-6xl rounded-3xl p-7 text-center sm:p-12"
            style={{
              background:
                "linear-gradient(130deg,#c2410c,#ea580c)",
              color: "#ffffff",
            }}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Code2
                size={25}
              />
            </div>

            <h2 className="mt-4 text-2xl font-black sm:text-3xl">
              Ready for a realistic
              technical mock interview?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-orange-50">
              Prepare for DSA, LLD,
              HLD, GenAI and project
              discussions with
              personalized interview practice.
            </p>

            <a
              href="#interview-slots"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-black text-orange-700"
            >
              Find Your Interview Slot

              <ArrowRight
                size={17}
              />
            </a>
          </div>
        </section>
      </main>

      {/* =================================================
         BOOKING MODAL

         No payment-result modal here.

         Payment result lives in the three
         dedicated routes.
      ================================================= */}

      <AnimatePresence>
        {selectedSlot && (
          <BookingModal
            key={
              selectedSlot._id
            }
            slot={
              selectedSlot
            }
            token={
              token
            }
            cashfreeMode={
              cashfreeMode
            }
            theme={
              theme
            }
            onClose={() => {
              setSelectedSlot(
                null
              );

              /*
                Fetch fresh availability
                after the booking modal closes.
              */

              fetchSlots();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
