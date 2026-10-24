
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  GraduationCap,
  Mail,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Video,
  Sparkles,
  Check,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

/* ==========================================================
   CONFIGURATION

   NO ACCOUNT LOGIN
   NO JWT TOKEN
   NO AUTHORIZATION HEADER

   All payment result pages use public APIs.
========================================================== */

const BASE_URL = (
  import.meta.env.VITE_BASE_URL ||
  "http://localhost:5001"
).replace(/\/+$/, "");

const INTERVIEW_API =
  `${BASE_URL}/api/interviews`;

const HLD_API =
  `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent(
    "/book/system-design/hld"
  )}`;

const HLD_PAGE =
  "/book/system-design/hld";

const INTERVIEW_PAGE =
  "/mock-interviews";

const PAYMENT_STATUS_PAGE =
  "/mock-interviews/payment-status";

const SUCCESS_PAGE =
  "/mock-interviews/success";

const FAILED_PAGE =
  "/mock-interviews/failed";

const SUPPORT_EMAIL =
  "supporttargettrek@gmail.com";

const TIMEZONE =
  "Asia/Kolkata";

const FAILED_STATUSES =
  new Set([
    "PAYMENT_FAILED",
    "EXPIRED",
    "CANCELLED_BY_USER",
    "CANCELLED_BY_ADMIN",
  ]);

/* ==========================================================
   BASIC HELPERS
========================================================== */

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function getBookingId(params) {
  return String(
    params.get("bookingId") || ""
  ).trim();
}

function queryFor(bookingId) {
  return `?bookingId=${encodeURIComponent(
    bookingId
  )}`;
}

function getBookingStatus(booking) {
  return normalize(
    booking?.status
  );
}

function getPaymentStatus(booking) {
  return normalize(
    booking?.paymentStatus
  );
}

function isConfirmed(booking) {
  return (
    getBookingStatus(booking) ===
      "CONFIRMED" &&
    getPaymentStatus(booking) ===
      "SUCCESS"
  );
}

function isFailed(booking) {
  return (
    FAILED_STATUSES.has(
      getBookingStatus(booking)
    ) &&
    getPaymentStatus(booking) !==
      "SUCCESS"
  );
}

function requiresRefundAttention(booking) {
  return (
    getPaymentStatus(booking) ===
      "SUCCESS" &&
    !isConfirmed(booking)
  );
}

function money(
  value,
  currency = "INR"
) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

function formatDate(value) {
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
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    }
  ).format(date);
}

function formatTime(value) {
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
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  ).format(date);
}

function supportMailto(bookingId) {
  const subject = bookingId
    ? `Mock Interview Support - ${bookingId}`
    : "Mock Interview Support";

  const body = bookingId
    ? `Hello Target Trek Support,\n\nBooking ID: ${bookingId}\n\nI need assistance with my mock interview booking.\n\nIssue:\n\n`
    : "Hello Target Trek Support,\n\nI need assistance with my mock interview booking.\n\n";

  return (
    `mailto:${SUPPORT_EMAIL}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}

/* ==========================================================
   THEME

   Reads existing navbar theme.
   Does not create another theme toggle.
========================================================== */

function readTheme() {
  if (
    typeof window === "undefined"
  ) {
    return "light";
  }

  try {
    const saved =
      window.localStorage.getItem(
        "theme"
      );

    if (
      saved === "dark" ||
      saved === "light"
    ) {
      return saved;
    }

    return document.documentElement.classList
      .contains("dark")
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function useNavbarTheme() {
  const [theme, setTheme] =
    useState(readTheme);

  useEffect(() => {
    const update = () => {
      setTheme(readTheme());
    };

    window.addEventListener(
      "storage",
      update
    );

    window.addEventListener(
      "themechange",
      update
    );

    window.addEventListener(
      "targettrek-theme-change",
      update
    );

    const observer =
      new MutationObserver(
        update
      );

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
        update
      );

      window.removeEventListener(
        "themechange",
        update
      );

      window.removeEventListener(
        "targettrek-theme-change",
        update
      );

      observer.disconnect();
    };
  }, []);

  return theme;
}

/* ==========================================================
   PUBLIC API HELPER

   There are deliberately no:
   - authToken
   - readToken
   - localStorage token lookups
   - Authorization headers
   - login redirects

   Server error messages are preserved.
========================================================== */

async function apiFetch(
  path,
  {
    method = "GET",
    signal,
  } = {}
) {
  const response = await fetch(
    `${INTERVIEW_API}${path}`,
    {
      method,
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    }
  );

  const json = await response
    .json()
    .catch(() => ({}));

  if (
    !response.ok ||
    json.success === false
  ) {
    const error = new Error(
      json.message ||
        `Request failed (${response.status})`
    );

    error.status =
      response.status;

    error.code =
      json.code || null;

    throw error;
  }

  return json.data ?? json;
}

/* ==========================================================
   PUBLIC STATUS API

   GET /api/interviews/bookings/:id/status
========================================================== */

async function fetchBooking(
  bookingId,
  signal
) {
  if (!bookingId) {
    throw new Error(
      "Booking reference is missing."
    );
  }

  return apiFetch(
    `/bookings/${encodeURIComponent(
      bookingId
    )}/status`,
    {
      method: "GET",
      signal,
    }
  );
}

/* ==========================================================
   PUBLIC CASHFREE RECONCILIATION

   POST /api/interviews/bookings/:id/reconcile

   This endpoint must verify payment directly
   against Cashfree on the backend.

   The browser never marks a booking paid.
========================================================== */

async function reconcileBooking(
  bookingId,
  signal
) {
  if (!bookingId) {
    throw new Error(
      "Booking reference is missing."
    );
  }

  return apiFetch(
    `/bookings/${encodeURIComponent(
      bookingId
    )}/reconcile`,
    {
      method: "POST",
      signal,
    }
  );
}

/* ==========================================================
   HLD BOOK RECOMMENDATION

   Keeps your existing product API.
========================================================== */

function normalizeHldBook(payload) {
  const root =
    payload?.data ?? payload;

  const book =
    root?.product ??
    root?.book ??
    root?.data ??
    root;

  if (
    !book ||
    typeof book !== "object" ||
    Array.isArray(book)
  ) {
    return null;
  }

  const image =
    book.coverPageUrl ||
    book.coverUrl ||
    book.imageUrl ||
    book.thumbnailUrl ||
    book.thumbnail ||
    book.image ||
    book.cover ||
    book.images?.[0]?.url ||
    book.images?.[0] ||
    "";

  const cover =
    typeof image === "string"
      ? image
      : image?.url || "";

  const price =
    book.price?.amount ??
    book.sellingPrice ??
    book.discountedPrice ??
    book.price;

  const mrp =
    book.mrp?.amount ??
    book.originalPrice ??
    book.listPrice ??
    book.mrp;

  const summary =
    book.shortDescription ||
    book.subtitle ||
    book.description ||
    "";

  const currency =
    book.currency?.code ||
    book.currency ||
    "INR";

  return {
    title:
      book.title ||
      book.name ||
      "Mastering System Design — HLD",

    description:
      typeof summary === "string"
        ? summary
            .replace(
              /<[^>]*>/g,
              " "
            )
            .trim()
        : "",

    cover,

    price:
      Number.isFinite(
        Number(price)
      ) && price != null
        ? Number(price)
        : null,

    mrp:
      Number.isFinite(
        Number(mrp)
      ) && mrp != null
        ? Number(mrp)
        : null,

    currency,

    edition:
      book.edition || null,

    format:
      book.format ||
      "Digital eBook",
  };
}

function useHldBook() {
  const [book, setBook] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const controller =
      new AbortController();

    async function load() {
      try {
        const response = await fetch(
          HLD_API,
          {
            method: "GET",
            cache: "no-store",
            signal:
              controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Book unavailable"
          );
        }

        const json =
          await response.json();

        if (
          !controller.signal.aborted
        ) {
          setBook(
            normalizeHldBook(json)
          );
        }
      } catch (error) {
        if (
          error.name !==
          "AbortError"
        ) {
          console.error(
            "[HLD BOOK]",
            error.message
          );
        }
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    load();

    return () =>
      controller.abort();
  }, []);

  return {
    book,
    loading,
  };
}

/* ==========================================================
   STYLES

   Fully scoped to .tt-payment-page.

   Responsive orange / stone design.
   Includes navbar light/dark theme support.
========================================================== */

const styles = `
.tt-payment-page {
  --tt-bg: #fffaf5;
  --tt-panel: #ffffff;
  --tt-panel-soft: #fff4e9;
  --tt-text: #251a14;
  --tt-muted: #796b63;
  --tt-border: #f0ded0;
  --tt-orange: #ea580c;
  --tt-orange-hover: #c2410c;
  --tt-orange-soft: #ffedd5;
  --tt-green: #15803d;
  --tt-green-soft: #dcfce7;
  --tt-red: #dc2626;
  --tt-red-soft: #fee2e2;
  --tt-shadow: 0 18px 55px rgba(77,35,8,.075);

  color: var(--tt-text);
  background:
    radial-gradient(
      ellipse 65% 25% at 50% 2%,
      var(--tt-orange-soft),
      transparent 80%
    ),
    var(--tt-bg);

  min-height: 100vh;
  padding:
    155px 16px 72px;

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    sans-serif;
}

.tt-payment-page[data-theme="dark"] {
  --tt-bg: #100e0c;
  --tt-panel: #1c1917;
  --tt-panel-soft: #29211c;
  --tt-text: #faf2eb;
  --tt-muted: #b6a79b;
  --tt-border: #40352e;
  --tt-orange: #fb923c;
  --tt-orange-hover: #fdba74;
  --tt-orange-soft: #412513;
  --tt-green: #4ade80;
  --tt-green-soft: #143422;
  --tt-red: #f87171;
  --tt-red-soft: #3d1d1d;
  --tt-shadow: 0 18px 55px rgba(0,0,0,.26);
}

.tt-payment-page * {
  box-sizing: border-box;
}

.tt-payment-container {
  width: 100%;
  max-width: 1060px;
  margin: 0 auto;
}

.tt-payment-page a {
  color: inherit;
  text-decoration: none;
}

.tt-payment-crumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--tt-muted);
  font-size: 13px;
  margin-bottom: 26px;
  flex-wrap: wrap;
}

.tt-result-card {
  background: var(--tt-panel);
  border: 1px solid var(--tt-border);
  border-radius: 24px;
  padding: clamp(22px,4vw,46px);
  box-shadow: var(--tt-shadow);
  position: relative;
  overflow: hidden;
}

.tt-result-card::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 4px;
  background:
    linear-gradient(
      90deg,
      #ea580c,
      #fb923c,
      #fbbf24
    );
}

.tt-result-top {
  text-align: center;
  max-width: 680px;
  margin: auto;
}

.tt-result-icon {
  height: 78px;
  width: 78px;
  border-radius: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 22px;
  box-shadow: 0 9px 25px rgba(0,0,0,.06);
}

.tt-result-icon.success {
  background: var(--tt-green-soft);
  color: var(--tt-green);
}

.tt-result-icon.failed {
  background: var(--tt-red-soft);
  color: var(--tt-red);
}

.tt-result-icon.pending {
  background: var(--tt-orange-soft);
  color: var(--tt-orange);
}

.tt-result-eyebrow {
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  color: var(--tt-orange);
  margin-bottom: 12px;
}

.tt-result-title {
  font-size: clamp(
    27px,
    4.5vw,
    42px
  );
  line-height: 1.17;
  letter-spacing: -1.4px;
  font-weight: 850;
  margin: 0 0 14px;
}

.tt-result-description {
  color: var(--tt-muted);
  font-size: 15px;
  line-height: 1.8;
}

.tt-reference {
  margin-top: 20px;
  font-size: 12px;
  color: var(--tt-muted);
  overflow-wrap: anywhere;
}

.tt-reference strong {
  color: var(--tt-text);
}

.tt-payment-divider {
  height: 1px;
  width: 100%;
  background: var(--tt-border);
  margin: 28px 0;
}

.tt-section-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -.5px;
  margin: 0 0 18px;
}

.tt-details-grid {
  display: grid;
  grid-template-columns:
    repeat(2,minmax(0,1fr));
  gap: 12px;
}

.tt-detail {
  border: 1px solid var(--tt-border);
  border-radius: 14px;
  padding: 17px;
  background: var(--tt-panel);
  min-width: 0;
  transition:
    transform .2s ease,
    border-color .2s ease;
}

.tt-detail:hover {
  transform: translateY(-2px);
  border-color: var(--tt-orange);
}

.tt-detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--tt-muted);
  margin-bottom: 9px;
}

.tt-detail-value {
  font-size: 14px;
  font-weight: 750;
  overflow-wrap: anywhere;
}

.tt-topic-wrap {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tt-topic-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: var(--tt-orange-soft);
  color: var(--tt-orange);
  font-size: 12px;
  font-weight: 750;
  border-radius: 100px;
  padding: 8px 12px;
}

.tt-notice {
  background: var(--tt-panel-soft);
  border: 1px solid var(--tt-border);
  border-radius: 16px;
  padding: 19px;
  display: flex;
  gap: 13px;
  align-items: flex-start;
  margin-top: 24px;
}

.tt-notice h3 {
  font-size: 15px;
  font-weight: 800;
  margin: 0 0 7px;
}

.tt-notice p {
  color: var(--tt-muted);
  font-size: 13px;
  line-height: 1.75;
  margin: 0;
}

.tt-result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  justify-content: center;
  margin-top: 28px;
}

.tt-btn {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  padding: 13px 20px;
  font-size: 13px;
  font-weight: 800;
  border: 1px solid transparent;
  cursor: pointer;
  transition: .18s ease;
  min-height: 45px;
}

.tt-btn.primary {
  color: #fff !important;
  background: #ea580c;
  box-shadow:
    0 6px 16px rgba(234,88,12,.18);
}

.tt-btn.primary:hover:not(:disabled) {
  background: #c2410c;
}

.tt-btn.secondary {
  color: var(--tt-text);
  background: var(--tt-panel);
  border-color: var(--tt-border);
}

.tt-btn.secondary:hover:not(:disabled) {
  background: var(--tt-panel-soft);
}

.tt-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.tt-btn:focus-visible,
.tt-payment-page a:focus-visible {
  outline: 3px solid var(--tt-orange);
  outline-offset: 3px;
}

.tt-upsell {
  margin-top: 25px;
  background:
    linear-gradient(
      115deg,
      var(--tt-panel),
      var(--tt-panel-soft)
    );
  border: 1px solid var(--tt-border);
  border-radius: 22px;
  padding: clamp(20px,4vw,34px);
  display: grid;
  grid-template-columns:
    220px minmax(0,1fr);
  gap: 32px;
  align-items: center;
  position: relative;
  overflow: hidden;
  box-shadow: var(--tt-shadow);
}

.tt-upsell::after {
  content: "";
  position: absolute;
  right: -130px;
  top: -190px;
  width: 340px;
  height: 340px;
  border-radius: 50%;
  background: var(--tt-orange-soft);
  opacity: .45;
  pointer-events: none;
}

.tt-book-art,
.tt-book-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.tt-book-art {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.tt-book-cover,
.tt-book-fallback {
  width: 190px;
  max-width: 100%;
  height: 260px;
  object-fit: contain;
  border-radius: 13px;
  box-shadow:
    0 18px 30px rgba(65,32,14,.2);
  background: transparent;
}

.tt-book-fallback {
  color: #fff;
  background:
    linear-gradient(
      145deg,
      #7c2d12,
      #ea580c
    );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 14px;
  padding: 20px;
  font-weight: 800;
}

.tt-book-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: var(--tt-orange);
  background: var(--tt-orange-soft);
  padding: 7px 12px;
  border-radius: 99px;
}

.tt-upsell-kicker {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--tt-orange);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 9px;
}

.tt-upsell-title {
  font-size: clamp(
    21px,
    3vw,
    30px
  );
  line-height: 1.28;
  letter-spacing: -.8px;
  font-weight: 850;
  margin: 0 0 12px;
}

.tt-upsell-title span {
  color: var(--tt-orange);
}

.tt-book-name {
  font-size: 15px;
  font-weight: 800;
  margin: 10px 0 8px;
}

.tt-upsell-desc {
  color: var(--tt-muted);
  font-size: 13px;
  line-height: 1.85;
  margin-bottom: 17px;
}

.tt-book-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 24px;
}

.tt-book-pricing {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tt-price {
  font-size: 25px;
  font-weight: 850;
}

.tt-mrp {
  text-decoration: line-through;
  color: var(--tt-muted);
  font-size: 14px;
}

.tt-discount {
  color: var(--tt-green);
  background: var(--tt-green-soft);
  padding: 6px 9px;
  border-radius: 7px;
  font-size: 11px;
  font-weight: 800;
}

.tt-book-cta {
  white-space: nowrap;
}

.tt-next-steps {
  margin-top: 25px;
  padding: 25px;
  border-radius: 20px;
  border: 1px solid var(--tt-border);
  background: var(--tt-panel);
}

.tt-step {
  display: flex;
  gap: 13px;
  padding: 13px 0;
}

.tt-step + .tt-step {
  border-top:
    1px solid var(--tt-border);
}

.tt-step-number {
  display: grid;
  place-items: center;
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--tt-orange-soft);
  color: var(--tt-orange);
  font-size: 12px;
  font-weight: 850;
}

.tt-step strong {
  font-size: 13px;
}

.tt-step p {
  font-size: 12px;
  line-height: 1.7;
  color: var(--tt-muted);
  margin: 5px 0 0;
}

.tt-error-box {
  background: var(--tt-red-soft);
  border: 1px solid var(--tt-border);
  border-radius: 12px;
  padding: 13px 16px;
  margin: 20px auto 0;
  color: var(--tt-red);
  font-size: 13px;
  text-align: left;
}

.tt-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
  gap: 13px;
  flex-direction: column;
  color: var(--tt-muted);
  text-align: center;
}

.tt-spinner {
  animation:
    tt-spin .85s linear infinite;
}

@keyframes tt-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tt-payment-page *,
  .tt-payment-page *::before {
    animation: none !important;
    transition: none !important;
  }
}

@media (max-width: 700px) {
  .tt-payment-page {
    padding:
      145px 12px 60px;
  }

  .tt-result-card {
    border-radius: 18px;
    padding: 25px 17px;
  }

  .tt-details-grid {
    grid-template-columns: 1fr;
  }

  .tt-upsell {
    grid-template-columns: 1fr;
    gap: 20px;
    text-align: center;
  }

  .tt-book-art {
    align-items: center;
  }

  .tt-book-bottom {
    justify-content: center;
  }

  .tt-book-cta {
    width: 100%;
  }

  .tt-upsell-kicker {
    justify-content: center;
  }

  .tt-book-cover,
  .tt-book-fallback {
    max-width: 180px;
    height: 230px;
    margin: auto;
  }

  .tt-result-actions .tt-btn {
    width: 100%;
  }

  .tt-next-steps {
    padding: 20px 16px;
  }
}
`;

/* ==========================================================
   SHARED PAGE LAYOUT
========================================================== */

function PaymentLayout({
  children,
}) {
  const theme =
    useNavbarTheme();

  return (
    <main
      className="tt-payment-page"
      data-theme={theme}
    >
      <style>{styles}</style>

      <div className="tt-payment-container">
        <nav
          className="tt-payment-crumbs"
          aria-label="Breadcrumb"
        >
          <Link to="/">
            Home
          </Link>

          <ArrowRight size={12} />

          <Link to={INTERVIEW_PAGE}>
            Mock Interviews
          </Link>

          <ArrowRight size={12} />

          <span>
            Booking Result
          </span>
        </nav>

        {children}
      </div>
    </main>
  );
}

/* ==========================================================
   SHARED HLD BOOK RECOMMENDATION
========================================================== */

function HldBookRecommendation() {
  const {
    book,
    loading,
  } = useHldBook();

  const [
    coverBroken,
    setCoverBroken,
  ] = useState(false);

  const title =
    book?.title ||
    "Mastering System Design — HLD";

  const description =
    book?.description ||
    "Learn to approach system design interviews using practical architectures, API design, databases, caching and scalable system trade-offs.";

  const hasPrice =
    book?.price != null;

  const hasMrp =
    book?.mrp != null &&
    book.mrp > book.price;

  const discount =
    hasPrice && hasMrp
      ? Math.round(
          (
            1 -
            book.price /
              book.mrp
          ) * 100
        )
      : 0;

  return (
    <section
      className="tt-upsell"
      aria-label="Recommended system design book"
    >
      <div className="tt-book-art">
        {book?.cover &&
        !coverBroken ? (
          <img
            src={book.cover}
            alt={`${title} cover`}
            className="tt-book-cover"
            loading="lazy"
            onError={() =>
              setCoverBroken(true)
            }
          />
        ) : (
          <div className="tt-book-fallback">
            <BookOpen size={40} />

            <span>
              MASTERING
              <br />
              SYSTEM DESIGN
              <br />
              HLD
            </span>
          </div>
        )}

        <span className="tt-book-chip">
          <BookOpen size={13} />
          Digital learning
        </span>
      </div>

      <div className="tt-book-copy">
        <div className="tt-upsell-kicker">
          <Sparkles size={15} />

          Continue your preparation
        </div>

        <h2 className="tt-upsell-title">
          The interview is one step.{" "}
          <span>
            Master the design behind it.
          </span>
        </h2>

        <p className="tt-book-name">
          {title}
        </p>

        <p className="tt-upsell-desc">
          {description}
        </p>

        <div className="tt-topic-wrap">
          {[
            "Real-world architectures",
            "Caching & databases",
            "Scaling strategies",
            "Interview frameworks",
          ].map((item) => (
            <span
              key={item}
              className="tt-topic-pill"
            >
              <Check size={13} />
              {item}
            </span>
          ))}
        </div>

        <div className="tt-book-bottom">
          <div
            className="tt-book-pricing"
            aria-live="polite"
          >
            {loading ? (
              <span className="tt-result-description">
                Loading book details…
              </span>
            ) : hasPrice ? (
              <>
                <span className="tt-price">
                  {money(
                    book.price,
                    book.currency
                  )}
                </span>

                {hasMrp && (
                  <span className="tt-mrp">
                    {money(
                      book.mrp,
                      book.currency
                    )}
                  </span>
                )}

                {discount > 0 && (
                  <span className="tt-discount">
                    {discount}% off
                  </span>
                )}
              </>
            ) : (
              <span className="tt-result-description">
                See current price
              </span>
            )}
          </div>

          <Link
            className="tt-btn primary tt-book-cta"
            to={HLD_PAGE}
          >
            Explore the book
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   SHARED BOOKING DETAILS

   Public status API deliberately returns no
   candidate name, email, or meeting link.

   Render only public fields that exist.
========================================================== */

function Detail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="tt-detail">
      <div className="tt-detail-label">
        <Icon size={15} />
        {label}
      </div>

      <div className="tt-detail-value">
        {value ?? "—"}
      </div>
    </div>
  );
}

function BookingDetails({
  booking,
}) {
  if (!booking) return null;

  const snapshot =
    booking.slotSnapshot || {};

  const startTime =
    snapshot.startTime ||
    booking.startTime;

  const endTime =
    snapshot.endTime ||
    booking.endTime;

  const topics =
    Array.isArray(
      booking.selectedTopics
    )
      ? booking.selectedTopics
      : [];

  const amount =
    snapshot.price ??
    booking.amount ??
    booking.price;

  return (
    <>
      <div className="tt-payment-divider" />

      <h2 className="tt-section-title">
        Booking details
      </h2>

      <div className="tt-details-grid">
        <Detail
          icon={ShieldCheck}
          label="Booking reference"
          value={
            booking.bookingId
          }
        />

        <Detail
          icon={CheckCircle2}
          label="Booking status"
          value={
            booking.status
          }
        />

        <Detail
          icon={CreditCard}
          label="Payment status"
          value={
            booking.paymentStatus ||
            "NOT_STARTED"
          }
        />

        {startTime && (
          <Detail
            icon={CalendarDays}
            label="Interview date"
            value={
              formatDate(startTime)
            }
          />
        )}

        {startTime && (
          <Detail
            icon={Clock3}
            label="Interview time (IST)"
            value={
              `${formatTime(startTime)}` +
              (
                endTime
                  ? ` – ${formatTime(
                      endTime
                    )}`
                  : ""
              )
            }
          />
        )}

        {snapshot.title && (
          <Detail
            icon={GraduationCap}
            label="Interview"
            value={
              snapshot.title
            }
          />
        )}

        {amount != null && (
          <Detail
            icon={CreditCard}
            label="Amount"
            value={
              money(
                amount,
                snapshot.currency ||
                  booking.currency ||
                  "INR"
              )
            }
          />
        )}
      </div>

      {topics.length > 0 && (
        <div
          style={{
            marginTop: 22,
          }}
        >
          <div
            className="tt-detail-label"
            style={{
              marginBottom: 11,
            }}
          >
            Topics selected
          </div>

          <div className="tt-topic-wrap">
            {topics.map(
              (topic) => (
                <span
                  key={topic}
                  className="tt-topic-pill"
                >
                  {topic}
                </span>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ==========================================================
   BOOKING REFERENCE
========================================================== */

function BookingReference({
  bookingId,
}) {
  if (!bookingId) return null;

  return (
    <p className="tt-reference">
      Booking reference:{" "}
      <strong>
        {bookingId}
      </strong>
    </p>
  );
}

/* ==========================================================
   SHARED ACTIONS
========================================================== */

function SupportAction({
  bookingId,
}) {
  return (
    <a
      href={supportMailto(
        bookingId
      )}
      className="tt-btn secondary"
    >
      <Mail size={16} />
      Contact Support
    </a>
  );
}

function CheckStatusAction({
  bookingId,
}) {
  if (!bookingId) {
    return null;
  }

  return (
    <Link
      to={
        PAYMENT_STATUS_PAGE +
        queryFor(bookingId)
      }
      className="tt-btn primary"
    >
      <RefreshCw size={16} />

      Check Payment Status
    </Link>
  );
}

/* ==========================================================
   EMAIL NOTICE
========================================================== */

function EmailNotice() {
  return (
    <div className="tt-notice">
      <Mail
        size={23}
        color="var(--tt-orange)"
        style={{
          flexShrink: 0,
        }}
      />

      <div>
        <h3>
          Interview details will be
          shared by email
        </h3>

        <p>
          Your booking confirmation,
          interview schedule and joining
          instructions will be sent to
          the email address provided at
          checkout.
        </p>

        <p
          style={{
            marginTop: 8,
          }}
        >
          If the meeting link has not
          been assigned yet, our team
          will share it separately.
          Please check your spam folder
          as well.
        </p>
      </div>
    </div>
  );
}

/* ==========================================================
   NEXT STEPS
========================================================== */

function NextSteps() {
  const steps = [
    {
      title:
        "Check your email",
      text:
        "Your booking confirmation and interview information will be shared by email.",
    },
    {
      title:
        "Prepare your topics",
      text:
        "Review the technical areas you selected when booking your session.",
    },
    {
      title:
        "Join at the scheduled time",
      text:
        "Use the meeting details provided by our team and join a few minutes early.",
    },
  ];

  return (
    <section className="tt-next-steps">
      <h2 className="tt-section-title">
        What happens next?
      </h2>

      {steps.map(
        (step, index) => (
          <div
            key={step.title}
            className="tt-step"
          >
            <span className="tt-step-number">
              {index + 1}
            </span>

            <div>
              <strong>
                {step.title}
              </strong>

              <p>{step.text}</p>
            </div>
          </div>
        )
      )}
    </section>
  );
}

/* ==========================================================
   GUEST BOOKING STATUS HOOK

   NO account-token dependency.

   Used by:
   - Success page
   - Failure page

   Reads only the server's verified state.
========================================================== */

function useVerifiedBooking(
  bookingId
) {
  const [booking, setBooking] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const load = useCallback(
    async () => {
      if (!bookingId) {
        setBooking(null);

        setError(
          "Booking reference is missing."
        );

        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const latest =
          await fetchBooking(
            bookingId
          );

        setBooking(latest);
      } catch (err) {
        setBooking(null);

        setError(
          err.message ||
            "Unable to load booking."
        );
      } finally {
        setLoading(false);
      }
    },
    [bookingId]
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    booking,
    loading,
    error,
    reload: load,
  };
}

/* ==========================================================
   1. SUCCESS PAGE

   URL:
   /mock-interviews/success?bookingId=...

   Does not assume payment succeeded because
   the user opened the success URL.

   The server must report:
   status = CONFIRMED
   paymentStatus = SUCCESS
========================================================== */

export function InterviewPaymentSuccessPage() {
  const [params] =
    useSearchParams();

  const bookingId =
    getBookingId(params);

  const {
    booking,
    loading,
    error,
    reload,
  } = useVerifiedBooking(
    bookingId
  );

  const confirmed =
    isConfirmed(booking);

  return (
    <PaymentLayout>
      <section className="tt-result-card">
        {loading ? (
          <div className="tt-loading">
            <RefreshCw
              size={29}
              className="tt-spinner"
            />

            Verifying your booking…
          </div>
        ) : error ? (
          <div className="tt-result-top">
            <div className="tt-result-icon pending">
              <AlertCircle size={38} />
            </div>

            <h1 className="tt-result-title">
              Unable to verify booking
            </h1>

            <p className="tt-result-description">
              {error}
            </p>

            <BookingReference
              bookingId={bookingId}
            />

            <div className="tt-result-actions">
              <button
                type="button"
                className="tt-btn primary"
                onClick={reload}
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <SupportAction
                bookingId={bookingId}
              />
            </div>
          </div>
        ) : !confirmed ? (
          <div className="tt-result-top">
            <div className="tt-result-icon pending">
              <Clock3 size={38} />
            </div>

            <div className="tt-result-eyebrow">
              Verification required
            </div>

            <h1 className="tt-result-title">
              Booking not yet confirmed
            </h1>

            <p className="tt-result-description">
              Your payment has not yet
              been verified as a confirmed
              interview booking.

              If money was debited,
              please check the latest
              payment status before
              attempting another payment.
            </p>

            <BookingReference
              bookingId={bookingId}
            />

            <div className="tt-result-actions">
              <CheckStatusAction
                bookingId={bookingId}
              />

              <SupportAction
                bookingId={bookingId}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="tt-result-top">
              <div className="tt-result-icon success">
                <CheckCircle2
                  size={44}
                />
              </div>

              <div className="tt-result-eyebrow">
                Payment verified successfully
              </div>

              <h1 className="tt-result-title">
                Your mock interview
                is confirmed!
              </h1>

              <p className="tt-result-description">
                Your payment was verified
                and your interview slot
                has been confirmed.

                Get ready for a focused
                technical session and
                practical feedback.
              </p>

              <BookingReference
                bookingId={bookingId}
              />
            </div>

            <BookingDetails
              booking={booking}
            />

            <EmailNotice />

            <NextSteps />

            <div className="tt-result-actions">
              <Link
                to={INTERVIEW_PAGE}
                className="tt-btn primary"
              >
                Back to Mock Interviews
                <ArrowRight size={16} />
              </Link>

              <SupportAction
                bookingId={bookingId}
              />
            </div>
          </>
        )}
      </section>

      <HldBookRecommendation />
    </PaymentLayout>
  );
}

/* ==========================================================
   2. FAILED PAGE

   URL:
   /mock-interviews/failed?bookingId=...

   Payment failure must be verified using
   the public server status endpoint.

   A pending booking must not be presented
   as a failed payment.
========================================================== */

export function InterviewPaymentFailedPage() {
  const [params] =
    useSearchParams();

  const navigate =
    useNavigate();

  const bookingId =
    getBookingId(params);

  const {
    booking,
    loading,
    error,
    reload,
  } = useVerifiedBooking(
    bookingId
  );

  const status =
    getBookingStatus(
      booking
    );

  const failed =
    isFailed(booking);

  const confirmed =
    isConfirmed(booking);

  useEffect(() => {
    if (
      !loading &&
      !error &&
      confirmed
    ) {
      navigate(
        SUCCESS_PAGE +
          queryFor(bookingId),
        {
          replace: true,
        }
      );
    }
  }, [
    loading,
    error,
    confirmed,
    bookingId,
    navigate,
  ]);

  const failureTitle =
    status === "EXPIRED"
      ? "Your booking has expired"
      : status ===
          "CANCELLED_BY_ADMIN"
        ? "Your booking was cancelled"
        : status ===
            "CANCELLED_BY_USER"
          ? "Booking cancelled"
          : "Payment was unsuccessful";

  return (
    <PaymentLayout>
      <section className="tt-result-card">
        {loading ? (
          <div className="tt-loading">
            <RefreshCw
              size={29}
              className="tt-spinner"
            />

            Checking payment status…
          </div>
        ) : error ? (
          <div className="tt-result-top">
            <div className="tt-result-icon pending">
              <AlertCircle size={38} />
            </div>

            <h1 className="tt-result-title">
              Unable to verify payment
            </h1>

            <p className="tt-result-description">
              {error}
            </p>

            <BookingReference
              bookingId={bookingId}
            />

            <div className="tt-result-actions">
              <button
                type="button"
                onClick={reload}
                className="tt-btn primary"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

              <SupportAction
                bookingId={bookingId}
              />
            </div>
          </div>
        ) : confirmed ? (
          <div className="tt-result-top">
            <div className="tt-result-icon success">
              <CheckCircle2 size={38} />
            </div>

            <h1 className="tt-result-title">
              Your payment was successful
            </h1>

            <p className="tt-result-description">
              Your interview has been confirmed.
            </p>

            <div className="tt-result-actions">
              <Link
                to={
                  SUCCESS_PAGE +
                  queryFor(bookingId)
                }
                className="tt-btn primary"
              >
                View Confirmation
              </Link>
            </div>
          </div>
        ) : !failed ? (
          <div className="tt-result-top">
            <div className="tt-result-icon pending">
              <Clock3 size={38} />
            </div>

            <div className="tt-result-eyebrow">
              Payment status pending
            </div>

            <h1 className="tt-result-title">
              Your payment is being verified
            </h1>

            <p className="tt-result-description">
              We have not received a final
              unsuccessful payment result.

              If money was debited,
              do not make another payment
              until verification is complete.
            </p>

            <BookingReference
              bookingId={bookingId}
            />

            <div className="tt-result-actions">
              <CheckStatusAction
                bookingId={bookingId}
              />

              <SupportAction
                bookingId={bookingId}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="tt-result-top">
              <div className="tt-result-icon failed">
                <XCircle size={44} />
              </div>

              <div className="tt-result-eyebrow">
                Booking not confirmed
              </div>

              <h1 className="tt-result-title">
                {failureTitle}
              </h1>

              <p className="tt-result-description">
                This booking could not
                be confirmed.

                If you believe money was
                debited, contact support
                with your booking reference
                so the payment can be checked.
              </p>

              <BookingReference
                bookingId={bookingId}
              />
            </div>

            <BookingDetails
              booking={booking}
            />

            <div className="tt-notice">
              <AlertCircle
                size={23}
                color="var(--tt-red)"
                style={{
                  flexShrink: 0,
                }}
              />

              <div>
                <h3>
                  What should you do?
                </h3>

                <p>
                  Keep your booking reference.
                  If your bank shows a debit,
                  avoid making another payment
                  until the transaction is
                  verified.
                </p>
              </div>
            </div>

            <div className="tt-result-actions">
              <Link
                to={INTERVIEW_PAGE}
                className="tt-btn primary"
              >
                Explore Available Slots
                <ArrowRight size={16} />
              </Link>

              <SupportAction
                bookingId={bookingId}
              />

              <CheckStatusAction
                bookingId={bookingId}
              />
            </div>
          </>
        )}
      </section>

      <HldBookRecommendation />
    </PaymentLayout>
  );
}

/* ==========================================================
   3. PUBLIC PAYMENT STATUS PAGE

   URL:
   /mock-interviews/payment-status?bookingId=...

   FLOW:

   1. Reconcile with Cashfree via backend
   2. Fetch latest MongoDB booking status
   3. CONFIRMED + SUCCESS => success page
   4. Verified failure => failed page
   5. PENDING => stay on status page
   6. SUCCESS but booking unavailable => support

   No login needed.
   No account token.
   No 10-minute status limit.

   The frontend never declares payment success.
========================================================== */

export function InterviewPaymentStatusPage() {
  const [params] =
    useSearchParams();

  const navigate =
    useNavigate();

  const bookingId =
    getBookingId(params);

  const [
    checking,
    setChecking,
  ] = useState(true);

  const [
    booking,
    setBooking,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  /*
    Avoid duplicate reconciliation calls
    from fast double-clicks.
  */

  const checkingRef =
    useRef(false);

  const checkPayment = useCallback(
    async () => {
      if (
        checkingRef.current
      ) {
        return;
      }

      if (!bookingId) {
        setError(
          "Booking reference is missing."
        );

        setChecking(false);
        return;
      }

      checkingRef.current = true;

      setChecking(true);
      setError("");

      try {
        /*
          STEP 1:

          Ask backend to verify payment
          with Cashfree.

          The backend performs authoritative
          payment verification.
        */

        await reconcileBooking(
          bookingId
        );

        /*
          STEP 2:

          Get the latest booking state
          from MongoDB.
        */

        const latest =
          await fetchBooking(
            bookingId
          );

        setBooking(latest);

        /*
          STEP 3:

          Only verified confirmed bookings
          may navigate to success.
        */

        if (
          isConfirmed(latest)
        ) {
          navigate(
            SUCCESS_PAGE +
              queryFor(bookingId),
            {
              replace: true,
            }
          );

          return;
        }

        /*
          STEP 4:

          Navigate to failed only for
          a verified terminal failure
          without successful payment.
        */

        if (
          isFailed(latest)
        ) {
          navigate(
            FAILED_PAGE +
              queryFor(bookingId),
            {
              replace: true,
            }
          );

          return;
        }

        /*
          STEP 5:

          PENDING:
          Stay on payment status page.

          PAID BUT NOT CONFIRMED:
          Stay on payment status page
          and show support instructions.
        */
      } catch (err) {
        /*
          If Cashfree reconciliation fails
          temporarily, attempt to retrieve
          existing database state.

          Do not assume payment failure.
        */

        try {
          const latest =
            await fetchBooking(
              bookingId
            );

          setBooking(latest);

          if (
            isConfirmed(latest)
          ) {
            navigate(
              SUCCESS_PAGE +
                queryFor(bookingId),
              {
                replace: true,
              }
            );

            return;
          }

          if (
            isFailed(latest)
          ) {
            navigate(
              FAILED_PAGE +
                queryFor(bookingId),
              {
                replace: true,
              }
            );

            return;
          }

          setError(
            "Live Cashfree verification is temporarily unavailable. The booking status shown is the latest saved status. If money was debited, avoid another payment until verification completes."
          );
        } catch (statusError) {
          setError(
            statusError.message ||
              err.message ||
              "Unable to verify payment."
          );
        }
      } finally {
        checkingRef.current = false;
        setChecking(false);
      }
    },
    [
      bookingId,
      navigate,
    ]
  );

  /*
    Automatically verify when this page opens.

    User can also click "Check Again".
  */

  useEffect(() => {
    checkPayment();
  }, [checkPayment]);

  const receivedWithoutConfirmation =
    requiresRefundAttention(
      booking
    );

  const confirmed =
    isConfirmed(booking);

  const failed =
    isFailed(booking);

  const title = checking
    ? "Verifying your payment..."
    : receivedWithoutConfirmation
      ? "Payment received — booking needs attention"
      : confirmed
        ? "Your interview is confirmed"
        : failed
          ? "Payment could not be completed"
          : "Payment verification pending";

  const description = checking
    ? "We're checking the payment status directly with Cashfree and verifying your interview reservation."
    : receivedWithoutConfirmation
      ? "Your payment was received, but the interview reservation has not been confirmed. Please contact support with your booking reference. Our team will review the booking and any applicable refund."
      : confirmed
        ? "Your payment has been verified and your interview booking is confirmed."
        : failed
          ? "The booking could not be confirmed. If money was debited, please contact support before trying another payment."
          : "We haven't received a final confirmation yet. If money was debited, avoid another payment until verification is complete.";

  return (
    <PaymentLayout>
      <section className="tt-result-card">
        <div className="tt-result-top">
          <div
            className={
              `tt-result-icon ${
                confirmed
                  ? "success"
                  : failed
                    ? "failed"
                    : "pending"
              }`
            }
          >
            {checking ? (
              <RefreshCw
                size={38}
                className="tt-spinner"
              />
            ) : confirmed ? (
              <CheckCircle2
                size={38}
              />
            ) : failed ? (
              <XCircle
                size={38}
              />
            ) : (
              <Clock3
                size={38}
              />
            )}
          </div>

          <div className="tt-result-eyebrow">
            Secure payment verification
          </div>

          <h1 className="tt-result-title">
            {title}
          </h1>

          <p className="tt-result-description">
            {description}
          </p>

          <BookingReference
            bookingId={bookingId}
          />

          {error && (
            <div
              className="tt-error-box"
              role="alert"
            >
              <AlertCircle
                size={16}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />

              {error}
            </div>
          )}

          {booking && (
            <div
              className="tt-topic-wrap"
              style={{
                justifyContent:
                  "center",
                marginTop: 22,
              }}
            >
              <span className="tt-topic-pill">
                <ShieldCheck
                  size={14}
                />

                Booking:{" "}
                {booking.status}
              </span>

              <span className="tt-topic-pill">
                <CreditCard
                  size={14}
                />

                Payment:{" "}
                {booking.paymentStatus}
              </span>

              {booking.refundStatus &&
                booking.refundStatus !==
                  "NOT_REQUIRED" && (
                  <span className="tt-topic-pill">
                    Refund:{" "}
                    {booking.refundStatus}
                  </span>
                )}
            </div>
          )}

          {receivedWithoutConfirmation && (
            <div className="tt-notice">
              <AlertCircle
                size={22}
                color="var(--tt-orange)"
                style={{
                  flexShrink: 0,
                }}
              />

              <div
                style={{
                  textAlign: "left",
                }}
              >
                <h3>
                  Payment received,
                  booking not confirmed
                </h3>

                <p>
                  Do not pay again for this
                  booking. Contact support
                  with your booking reference
                  so our team can verify the
                  reservation and applicable
                  refund.
                </p>
              </div>
            </div>
          )}

          <div className="tt-result-actions">
            <button
              type="button"
              className="tt-btn primary"
              onClick={
                checkPayment
              }
              disabled={
                checking ||
                !bookingId
              }
            >
              <RefreshCw
                size={16}
                className={
                  checking
                    ? "tt-spinner"
                    : ""
                }
              />

              {checking
                ? "Checking..."
                : "Check Again"}
            </button>

            <Link
              to={
                INTERVIEW_PAGE
              }
              className="tt-btn secondary"
            >
              <ArrowLeft size={16} />
              Back to Interviews
            </Link>

            <SupportAction
              bookingId={bookingId}
            />
          </div>

          <p
            className="tt-result-description"
            style={{
              fontSize: 12,
              marginTop: 20,
            }}
          >
            Payment confirmation is based
            on the backend's verified
            Cashfree result. The browser
            cannot independently confirm
            a successful payment.
          </p>
        </div>
      </section>

      <HldBookRecommendation />
    </PaymentLayout>
  );
}
