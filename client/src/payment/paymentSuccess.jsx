
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
} from "react-router-dom";

import JSZip from "jszip";
import { Helmet } from "react-helmet-async";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  Download,
  ExternalLink,
  FileArchive,
  FileCheck2,
  FileText,
  HelpCircle,
  Layers3,
  Loader2,
  LockKeyhole,
  Mail,
  Network,
  Package,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Video,
  X,
  BrainCircuit,
  BriefcaseBusiness,
  MessageSquareText,
} from "lucide-react";

import {
  trackPurchase,
} from "../lib/metaPixel";

/* ==========================================================
   CONFIGURATION
========================================================== */

const BASE_URL = (
  import.meta.env.VITE_BASE_URL ||
  "https://target-trek.onrender.com"
).replace(/\/+$/, "");

const ACCESS_API =
  `${BASE_URL}/payment/payu/access`;

const SUPPORT_EMAIL =
  "supporttargettrek@gmail.com";

const MOCK_INTERVIEW_URL =
  "/mock-interviews";

const BOOKS_URL =
  "/books";

const THEME_KEY =
  "theme";

const THEME_EVENT =
  "targettrek-theme-change";

const TERMS_KEY_PREFIX =
  "targettrek:ebook-terms:v1:";

/*
  Your access API must validate the payment
  before returning any PDF URLs.

  A successful response is treated as proof
  of a paid purchase only because the backend
  is expected to enforce that check.
*/

const REQUIRE_PAYMENT_GATED_ACCESS =
  true;

/* ==========================================================
   THEME

   Reads localStorage.
   React state determines every local color.
   Navbar theme changes are synchronized.
========================================================== */

function getSavedTheme() {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    const stored =
      window.localStorage.getItem(
        THEME_KEY
      );

    if (stored === "dark") {
      return "dark";
    }

    if (stored === "light") {
      return "light";
    }

    return document.documentElement.classList
      .contains("dark")
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
}

function useLocalStorageTheme() {
  const [theme, setTheme] =
    useState(getSavedTheme);

  useEffect(() => {
    const sync = () => {
      setTheme(getSavedTheme());
    };

    const handleThemeEvent = (event) => {
      const next =
        event?.detail?.theme;

      if (
        next === "dark" ||
        next === "light"
      ) {
        setTheme(next);
      } else {
        sync();
      }
    };

    const handleStorage = (event) => {
      if (
        event.key === THEME_KEY
      ) {
        sync();
      }
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    window.addEventListener(
      THEME_EVENT,
      handleThemeEvent
    );

    window.addEventListener(
      "themechange",
      handleThemeEvent
    );

    const observer =
      new MutationObserver(sync);

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

    sync();

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );

      window.removeEventListener(
        THEME_EVENT,
        handleThemeEvent
      );

      window.removeEventListener(
        "themechange",
        handleThemeEvent
      );

      observer.disconnect();
    };
  }, []);

  return {
    theme,
    setTheme,
    isDark: theme === "dark",
  };
}

/* ==========================================================
   FORMAT HELPERS
========================================================== */

function formatMoney(
  amount,
  currency = "INR"
) {
  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return "—";
  }

  const number =
    Number(amount);

  if (!Number.isFinite(number)) {
    return "—";
  }

  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency:
          currency || "INR",
        maximumFractionDigits: 2,
      }
    ).format(number);
  } catch {
    return `${currency} ${number}`;
  }
}

function safeFileName(value) {
  return (
    String(
      value || "Target-Trek-Ebook"
    )
      .replace(
        /[^a-zA-Z0-9 _.-]/g,
        ""
      )
      .replace(/\s+/g, "-")
      .replace(
        /^\.+|\.+$/g,
        ""
      )
      .substring(0, 90) ||
    "Target-Trek-Ebook"
  );
}

function getPdfFileName(book) {
  const name = String(
    book?.fileName ||
    book?.slug ||
    book?.title ||
    "Target-Trek-Ebook"
  ).replace(/\.pdf$/i, "");

  return `${safeFileName(name)}.pdf`;
}

function getUniqueFileName(
  name,
  usedNames
) {
  const base =
    name.replace(/\.pdf$/i, "");

  let finalName =
    `${base}.pdf`;

  let number = 2;

  while (
    usedNames.has(
      finalName.toLowerCase()
    )
  ) {
    finalName =
      `${base}-${number}.pdf`;

    number++;
  }

  usedNames.add(
    finalName.toLowerCase()
  );

  return finalName;
}

function isAppleMobileDevice() {
  if (
    typeof navigator === "undefined"
  ) {
    return false;
  }

  const userAgent =
    navigator.userAgent || "";

  const platform =
    navigator.platform || "";

  return (
    /iPad|iPhone|iPod/i.test(
      userAgent
    ) ||
    (
      platform === "MacIntel" &&
      navigator.maxTouchPoints > 1
    )
  );
}

/* ==========================================================
   TERMS ACCEPTANCE (localStorage, per order)
========================================================== */

function getTermsKey(orderKey) {
  return `${TERMS_KEY_PREFIX}${orderKey}`;
}

function hasAcceptedTerms(orderKey) {
  if (!orderKey || typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.localStorage.getItem(
      getTermsKey(orderKey)
    );

    if (!raw) {
      return false;
    }

    return JSON.parse(raw)?.accepted === true;
  } catch {
    return false;
  }
}

function saveAcceptedTerms(orderKey) {
  if (!orderKey || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      getTermsKey(orderKey),
      JSON.stringify({
        accepted: true,
        orderId: orderKey,
        acceptedAt: new Date().toISOString(),
      })
    );
  } catch {
    // Private mode / blocked storage: modal will simply show again.
  }
}

/* ==========================================================
   DOWNLOAD HELPERS
========================================================== */

/*
  Fallback used when the PDF host blocks fetch() (CORS) or the
  network call fails. A plain link works in every browser/device.
*/
function openDirectDownload(url, fileName) {
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();
}

function wait(ms) {
  return new Promise((resolve) =>
    window.setTimeout(resolve, ms)
  );
}

function triggerDownload(
  blob,
  fileName
) {
  const blobUrl =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = blobUrl;
  link.download = fileName;

  link.style.display =
    "none";

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(
      blobUrl
    );
  }, 60000);
}

async function saveBlob(
  blob,
  fileName,
  mimeType
) {
  if (
    isAppleMobileDevice()
  ) {
    try {
      const file = new File(
        [blob],
        fileName,
        {
          type: mimeType,
        }
      );

      if (
        navigator.share &&
        navigator.canShare?.({
          files: [file],
        })
      ) {
        await navigator.share({
          files: [file],
          title: fileName,
        });

        return "shared";
      }
    } catch (error) {
      if (
        error?.name === "AbortError"
      ) {
        return "cancelled";
      }

      console.warn(
        "[Download] Native share failed:",
        error
      );
    }
  }

  triggerDownload(
    blob,
    fileName
  );

  return "started";
}

async function fetchPdfBlob(url) {
  if (
    typeof url !== "string" ||
    !url
  ) {
    throw new Error(
      "PDF download URL is missing."
    );
  }

  const response =
    await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept:
          "application/pdf,*/*",
      },
    });

  if (!response.ok) {
    throw new Error(
      `Unable to download PDF (${response.status}).`
    );
  }

  const blob =
    await response.blob();

  if (
    !blob ||
    blob.size === 0
  ) {
    throw new Error(
      "The downloaded PDF is empty."
    );
  }

  const headerBuffer =
    await blob
      .slice(0, 5)
      .arrayBuffer();

  const header =
    new TextDecoder().decode(
      headerBuffer
    );

  if (
    header !== "%PDF-"
  ) {
    throw new Error(
      "The server did not return a valid PDF."
    );
  }

  return new Blob(
    [blob],
    {
      type:
        "application/pdf",
    }
  );
}

/* ==========================================================
   NORMALIZE PURCHASED BOOKS

   Supports:
   - Single ebook
   - Multiple ebooks
   - Combo / bundle
   - Legacy PayU responses
   - Cashfree purchase responses
========================================================== */

function normalizePurchasedBooks(data) {
  if (!data) {
    return [];
  }

  if (
    Array.isArray(data.books) &&
    data.books.length > 0
  ) {
    return data.books
      .filter(Boolean)
      .map(
        (book, index) => ({
          id: String(
            book.id ||
            book._id ||
            `book-${index}`
          ),

          title:
            book.title ||
            `Purchased Book ${
              index + 1
            }`,

          slug:
            book.slug || "",

          subtitle:
            book.subtitle || "",

          description:
            book.description || "",

          coverPageUrl:
            book.coverPageUrl ||
            data.coverPageUrl ||
            "",

          pdfUrl:
            book.pdfUrl ||
            book.downloadUrl ||
            (
              data.books.length === 1
                ? data.pdfUrl
                : ""
            ) ||
            "",

          downloadUrl:
            book.downloadUrl ||
            "",

          fileName:
            book.fileName ||
            "",

          resourceType:
            book.resourceType ||
            "ebook",
        })
      );
  }

  if (
    data.pdfUrl
  ) {
    return [
      {
        id: String(
          data.bookId ||
          data.product?.id ||
          data.product?._id ||
          "single-book"
        ),

        title:
          data.title ||
          data.product?.title ||
          "Purchased eBook",

        slug:
          data.slug || "",

        subtitle:
          data.subtitle || "",

        description:
          data.description || "",

        coverPageUrl:
          data.coverPageUrl ||
          "",

        pdfUrl:
          data.pdfUrl,

        downloadUrl: "",

        fileName:
          data.fileName || "",

        resourceType:
          "ebook",
      },
    ];
  }

  return [];
}

/* ==========================================================
   META PURCHASE TRACKING

   Keeps the existing trackPurchase API.

   Access must already be payment-gated
   on the backend.

   The pixel helper should deduplicate
   using the order ID.
========================================================== */

function buildMetaPurchase(
  result,
  data,
  books
) {
  const payment =
    data?.payment || {};

  const orderId =
    data?.orderId ??
    data?.order?.orderId ??
    null;

  const amount =
    Number(
      payment.amount
    );

  const currency =
    String(
      payment.currency ||
      "INR"
    )
      .trim()
      .toUpperCase();

  const status =
    String(
      payment.status ??
      payment.paymentStatus ??
      payment.payment_status ??
      data?.paymentStatus ??
      ""
    )
      .trim()
      .toUpperCase();

  const paidStatuses =
    new Set([
      "SUCCESS",
      "PAID",
      "COMPLETED",
    ]);

  const statusValid =
    !status ||
    paidStatuses.has(status);

  const bookIds =
    books
      .map((book) =>
        String(book.id || "")
      )
      .filter(Boolean);

  const eligible =
    REQUIRE_PAYMENT_GATED_ACCESS &&
    result?.success === true &&
    typeof orderId === "string" &&
    orderId.trim().length > 0 &&
    Number.isFinite(amount) &&
    amount > 0 &&
    /^[A-Z]{3}$/.test(
      currency
    ) &&
    bookIds.length > 0 &&
    statusValid;

  return {
    eligible,
    orderId,
    amount,
    currency,
    bookIds,
  };
}

function reportMetaPurchase(
  result,
  data,
  books
) {
  const meta =
    buildMetaPurchase(
      result,
      data,
      books
    );

  if (!meta.eligible) {
    console.warn(
      "[Meta Purchase] Skipped: invalid purchase context"
    );

    return false;
  }

  try {
    if (
      typeof window.fbq !==
      "function"
    ) {
      return false;
    }

    return Boolean(
      trackPurchase({
        orderId:
          meta.orderId,

        amount:
          meta.amount,

        currency:
          meta.currency,

        bookIds:
          meta.bookIds,
      })
    );
  } catch (error) {
    console.error(
      "[Meta Purchase]",
      error
    );

    return false;
  }
}

/* ==========================================================
   SMALL UI COMPONENTS
========================================================== */

function BookCover({
  book,
}) {
  if (
    book?.coverPageUrl
  ) {
    return (
      <img
        src={
          book.coverPageUrl
        }
        alt={
          `${book.title} cover`
        }
        loading="lazy"
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-600 to-amber-400 text-white">
      <BookOpen size={34} />
    </div>
  );
}

function DetailBox({
  label,
  value,
  Icon,
  isDark,
}) {
  return (
    <div
      className={`
        flex min-w-[115px]
        flex-col gap-2
        rounded-2xl border
        px-4 py-3
        ${
          isDark
            ? "border-stone-800 bg-stone-900/80"
            : "border-orange-100 bg-orange-50/70"
        }
      `}
    >
      <div className="flex items-center gap-2 text-xs opacity-70">
        {Icon && (
          <Icon size={15} />
        )}
        {label}
      </div>

      <strong className="text-base font-extrabold">
        {value}
      </strong>
    </div>
  );
}

function MockFeature({
  Icon,
  title,
  description,
  isDark,
}) {
  return (
    <div
      className={`
        flex gap-3
        rounded-2xl border p-4
        ${
          isDark
            ? "border-stone-700 bg-stone-900/70"
            : "border-orange-100 bg-white/85"
        }
      `}
    >
      <div
        className={`
          flex h-11 w-11
          shrink-0 items-center
          justify-center
          rounded-xl
          ${
            isDark
              ? "bg-orange-500/15 text-orange-400"
              : "bg-orange-100 text-orange-600"
          }
        `}
      >
        <Icon size={20} />
      </div>

      <div>
        <h3 className="text-sm font-extrabold">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-6 opacity-65">
          {description}
        </p>
      </div>
    </div>
  );
}

/* ==========================================================
   MOCK INTERVIEW PROMOTION

   Uses existing route:
   /mock-interviews
========================================================== */

function MockInterviewCard({
  isDark,
}) {
  const features = [
    {
      Icon: Code2,
      title: "DSA & Coding",
      description:
        "Practice problem solving, optimal approaches, edge cases and complexity.",
    },

    {
      Icon: Layers3,
      title: "Low-Level Design",
      description:
        "Discuss OOP, design patterns, SOLID principles and concurrency.",
    },

    {
      Icon: Network,
      title: "System Design",
      description:
        "Learn to explain scalable architecture, APIs, databases and trade-offs.",
    },

    {
      Icon: BrainCircuit,
      title: "GenAI & Projects",
      description:
        "Practice RAG, AI agents, project explanations and technical decisions.",
    },
  ];

  return (
    <section
      className={`
        relative mt-7
        overflow-hidden
        rounded-[28px]
        border
        ${
          isDark
            ? "border-orange-900/60 bg-[#20150e]"
            : "border-orange-200 bg-[#fff3e7]"
        }
      `}
    >
      <div
        className="
          pointer-events-none
          absolute -right-20
          -top-24 h-80 w-80
          rounded-full
          bg-orange-500/15
          blur-3xl
        "
      />

      <div
        className="
          relative grid
          gap-8 p-6
          sm:p-8 lg:grid-cols-[1.05fr_.95fr]
          lg:items-center
          lg:p-10
        "
      >
        <div>
          <div
            className={`
              inline-flex items-center
              gap-2 rounded-full
              px-3 py-2 text-[11px]
              font-black uppercase
              tracking-[0.12em]
              ${
                isDark
                  ? "bg-orange-500/15 text-orange-300"
                  : "bg-orange-100 text-orange-700"
              }
            `}
          >
            <Video size={15} />
            Target Trek Mock Interviews
          </div>

          <h2
            className="
              mt-5 text-2xl
              font-black leading-tight
              tracking-tight
              sm:text-3xl
              lg:text-[35px]
            "
          >
            You have the books.
            <span className="mt-1 block text-orange-500">
              Now practice the interview.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-8 opacity-75 sm:text-base">
            Reading concepts is one part of
            interview preparation. Explaining
            your approach, answering follow-up
            questions, and defending your
            technical decisions is another.

            Practice your knowledge through
            a live, personalized technical
            mock interview.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {[
              "Live 1:1 session",
              "Choose your topics",
              "Interview-style questions",
            ].map((feature) => (
              <span
                key={feature}
                className={`
                  inline-flex items-center
                  gap-2 rounded-full
                  border px-3 py-2
                  text-xs font-bold
                  ${
                    isDark
                      ? "border-orange-900 bg-orange-950/20"
                      : "border-orange-200 bg-white/75"
                  }
                `}
              >
                <Check
                  size={14}
                  className="text-orange-500"
                />

                {feature}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to={MOCK_INTERVIEW_URL}
              className="
                inline-flex min-h-12
                items-center justify-center
                gap-2 rounded-xl
                bg-orange-600
                px-6 py-3
                text-sm font-extrabold
                text-white
                transition
                hover:bg-orange-700
              "
            >
              <CalendarDays size={18} />

              Book a Mock Interview

              <ArrowRight size={17} />
            </Link>

            <Link
              to={MOCK_INTERVIEW_URL}
              className={`
                inline-flex min-h-12
                items-center justify-center
                gap-2 rounded-xl border
                px-5 py-3 text-sm
                font-bold transition
                ${
                  isDark
                    ? "border-stone-700 bg-stone-900 hover:bg-stone-800"
                    : "border-orange-200 bg-white hover:bg-orange-50"
                }
              `}
            >
              Explore Available Slots
              <ExternalLink size={16} />
            </Link>
          </div>

          <p className="mt-4 text-xs leading-6 opacity-60">
            Select an available date, choose
            your interview topics, and complete
            the booking securely.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <MockFeature
              key={feature.title}
              {...feature}
              isDark={isDark}
            />
          ))}

          <div
            className={`
              rounded-2xl border p-4
              sm:col-span-2
              ${
                isDark
                  ? "border-orange-900 bg-orange-950/20"
                  : "border-orange-200 bg-white/80"
              }
            `}
          >
            <div className="flex items-start gap-3">
              <MessageSquareText
                size={21}
                className="mt-1 shrink-0 text-orange-500"
              />

              <div>
                <h3 className="text-sm font-extrabold">
                  Prepare for real interview discussions
                </h3>

                <p className="mt-2 text-xs leading-6 opacity-70">
                  Work on structured problem
                  solving, design explanations,
                  project walkthroughs, and
                  interview communication
                  instead of relying only on
                  memorized answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================
   PAYMENT SUCCESS PAGE
========================================================== */

export default function PaymentSuccess() {
  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const orderId =
    searchParams.get("order");

  const {
    theme,
    isDark,
  } = useLocalStorageTheme();

  /* --------------------------------------------------------
     LOCAL STATE
  -------------------------------------------------------- */

  const [purchase, setPurchase] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    showAccessModal,
    setShowAccessModal,
  ] = useState(false);

  const [
    acceptedTerms,
    setAcceptedTerms,
  ] = useState(false);

  const [
    pdfUnlocked,
    setPdfUnlocked,
  ] = useState(false);

  const [
    downloadingBookId,
    setDownloadingBookId,
  ] = useState(null);

  const [
    downloadingAll,
    setDownloadingAll,
  ] = useState(false);

  const [
    downloadProgress,
    setDownloadProgress,
  ] = useState({
    current: 0,
    total: 0,
  });

  const [
    downloadMessage,
    setDownloadMessage,
  ] = useState("");

  const [
    downloadError,
    setDownloadError,
  ] = useState("");

  const [
    selectedPreviewId,
    setSelectedPreviewId,
  ] = useState(null);

  const [
    showPreview,
    setShowPreview,
  ] = useState(false);

  const [previewObjectUrl, setPreviewObjectUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const previewSectionRef = useRef(null);

  const [
    showHelp,
    setShowHelp,
  ] = useState(false);

  const downloadLockRef =
    useRef(false);

  // This route is private purchase access, never a search landing page.
  // This is a crawler directive, NOT authentication; backend payment validation
  // above is what prevents access without a valid token.
  useEffect(() => {
    document.title = "Your purchased ebooks | Target Trek";
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "noindex, nofollow, noarchive, nosnippet, noimageindex");
    return () => {
      // Keep noindex on this page until the next route updates document head.
    };
  }, []);

  /* ========================================================
     LOAD VERIFIED PURCHASE

     IMPORTANT:
     - Access token is still sent to backend
     - Backend must verify paid order
     - Token is removed from browser URL
     - No expiry information is displayed
  ======================================================== */

  useEffect(() => {
    if (!token) {
      setError(
        orderId
          ? "Your payment may have been processed. Please use your original purchase-access link or contact support."
          : "Your purchase access link is missing or invalid."
      );

      setLoading(false);

      return;
    }

    const controller =
      new AbortController();

    async function loadPurchase() {
      try {
        setLoading(true);
        setError("");

        const url =
          `${ACCESS_API}?token=` +
          encodeURIComponent(token);

        const response =
          await fetch(url, {
            method: "GET",

            headers: {
              Accept:
                "application/json",
            },

            cache: "no-store",

            signal:
              controller.signal,
          });

        const result =
          await response
            .json()
            .catch(() => null);

        if (
          !response.ok ||
          result?.success !== true ||
          !result?.data
        ) {
          throw new Error(
            result?.message ||
            "Unable to verify your purchased books."
          );
        }

        if (
          controller.signal.aborted
        ) {
          return;
        }

        const data =
          result.data;

        const books =
          normalizePurchasedBooks(
            data
          );

        if (
          books.length === 0
        ) {
          throw new Error(
            "No downloadable books were returned. Contact support with your order reference."
          );
        }

        // Track a verified, payment-gated purchase.
        reportMetaPurchase(
          result,
          data,
          books
        );

        setPurchase({
          ...data,
          books,
        });

        setSelectedPreviewId(
          books[0].id
        );

        // Returning visitors who already accepted the
        // notice for this order skip the modal.
        const alreadyAccepted =
          hasAcceptedTerms(
            data.orderId || orderId || token
          );

        setAcceptedTerms(alreadyAccepted);
        setPdfUnlocked(alreadyAccepted);
        setShowAccessModal(!alreadyAccepted);

        // Keep the full URL (token + order) visible so the
        // page can be refreshed or bookmarked. If the order id
        // was missing from the URL, add it.
        const finalOrderId =
          data.orderId || orderId;

        if (finalOrderId && !orderId) {
          const params =
            new URLSearchParams(
              window.location.search
            );

          params.set("order", finalOrderId);

          window.history.replaceState(
            window.history.state,
            document.title,
            `${window.location.pathname}?${params.toString()}`
          );
        }
      } catch (err) {
        if (
          err?.name ===
            "AbortError" ||
          controller.signal.aborted
        ) {
          return;
        }

        console.error(
          "[Payment Success] Access error:",
          err
        );

        setError(
          err?.message ||
          "Unable to load purchased books."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadPurchase();

    return () => {
      controller.abort();
    };
  }, [token, orderId]);

  /* ========================================================
     DERIVED VALUES
  ======================================================== */

  const books = useMemo(
    () =>
      purchase?.books || [],
    [purchase]
  );

  const totalBooks =
    books.length;

  const isBundle =
    Boolean(
      purchase?.isBundle
    ) ||
    totalBooks > 1;

  const selectedPreview =
    books.find(
      (book) =>
        book.id ===
        selectedPreviewId
    ) ||
    books[0] ||
    null;

  const isBusy =
    Boolean(downloadingBookId) ||
    downloadingAll;

  const paymentAmount =
    purchase?.payment?.amount ??
    purchase?.product?.price ??
    null;

  const currency =
    purchase?.payment?.currency ||
    purchase?.product?.currency ||
    "INR";

  const productTitle =
    purchase?.product?.title ||
    purchase?.title ||
    (
      isBundle
        ? "Target Trek Book Bundle"
        : books[0]?.title
    ) ||
    "Purchased Books";

  /* ========================================================
     CONFIRM ACCESS
  ======================================================== */

  function handleUnlock() {
    if (!acceptedTerms) {
      return;
    }

    saveAcceptedTerms(
      purchase?.orderId || orderId || token
    );

    setPdfUnlocked(true);
    setShowAccessModal(false);
  }

  /* ========================================================
     DOWNLOAD ONE PDF
  ======================================================== */

  const handleDownloadBook =
    useCallback(
      async (book) => {
        if (
          !pdfUnlocked ||
          downloadingAll ||
          downloadingBookId ||
          downloadLockRef.current
        ) {
          return;
        }

        if (!book?.pdfUrl) {
          setDownloadError(
            "The PDF is currently unavailable."
          );

          return;
        }

        downloadLockRef.current =
          true;

        setDownloadingBookId(
          book.id
        );

        setDownloadError("");
        setDownloadMessage(
          `Preparing ${book.title}...`
        );

        try {
          const blob =
            await fetchPdfBlob(
              book.pdfUrl
            );

          const result =
            await saveBlob(
              blob,
              getPdfFileName(book),
              "application/pdf"
            );

          if (
            result === "cancelled"
          ) {
            setDownloadMessage(
              "Save cancelled."
            );
          } else if (
            result === "shared"
          ) {
            setDownloadMessage(
              "Choose Save to Files or another destination."
            );
          } else {
            setDownloadMessage(
              `${book.title}: Download started. Check your Downloads folder.`
            );
          }
        } catch (err) {
          console.error(
            "[PDF Download]",
            err
          );

          if (err instanceof TypeError) {
            // Network/CORS failure: use a direct link instead.
            openDirectDownload(
              book.pdfUrl,
              getPdfFileName(book)
            );

            setDownloadMessage(
              `${book.title}: Opening the direct download. If nothing happens, email ${SUPPORT_EMAIL}.`
            );
          } else {
            setDownloadError(
              err?.message ||
              "Unable to download this ebook."
            );

            setDownloadMessage("");
          }
        } finally {
          downloadLockRef.current =
            false;

          setDownloadingBookId(
            null
          );
        }
      },
      [
        pdfUnlocked,
        downloadingAll,
        downloadingBookId,
      ]
    );

  /* ========================================================
     DOWNLOAD ALL BOOKS AS ZIP
  ======================================================== */

  async function handleDownloadAll() {
    if (
      !pdfUnlocked ||
      isBusy ||
      downloadLockRef.current ||
      books.length === 0
    ) {
      return;
    }

    if (
      books.length === 1
    ) {
      await handleDownloadBook(
        books[0]
      );

      return;
    }

    downloadLockRef.current =
      true;

    setDownloadingAll(true);
    setDownloadError("");

    setDownloadProgress({
      current: 0,
      total: books.length,
    });

    try {
      const zip =
        new JSZip();

      const usedNames =
        new Set();

      for (
        let index = 0;
        index < books.length;
        index++
      ) {
        const book =
          books[index];

        setDownloadMessage(
          `Preparing ${index + 1} of ${books.length}: ${book.title}`
        );

        if (!book.pdfUrl) {
          throw new Error(
            `PDF unavailable: ${book.title}`
          );
        }

        const pdfBlob =
          await fetchPdfBlob(
            book.pdfUrl
          );

        const fileName =
          getUniqueFileName(
            getPdfFileName(book),
            usedNames
          );

        zip.file(
          fileName,
          pdfBlob
        );

        setDownloadProgress({
          current:
            index + 1,

          total:
            books.length,
        });
      }

      setDownloadMessage(
        "Creating your ZIP file..."
      );

      const zipBlob =
        await zip.generateAsync({
          type: "blob",

          compression:
            "DEFLATE",

          compressionOptions: {
            level: 3,
          },
        });

      const zipName =
        `TargetTrek-Books-${safeFileName(
          purchase?.orderId ||
          "Bundle"
        )}.zip`;

      const result =
        await saveBlob(
          zipBlob,
          zipName,
          "application/zip"
        );

      if (
        result === "cancelled"
      ) {
        setDownloadMessage(
          "Save cancelled."
        );
      } else if (
        result === "shared"
      ) {
        setDownloadMessage(
          "Choose Save to Files to keep your ebooks."
        );
      } else {
        setDownloadMessage(
          `ZIP download started with ${books.length} ebooks.`
        );
      }
    } catch (err) {
      console.error(
        "[ZIP Download]",
        err
      );

      if (err instanceof TypeError) {
        // Network/CORS failure: download each PDF directly.
        setDownloadMessage(
          "Starting individual downloads. If your browser asks, allow multiple downloads."
        );

        for (const book of books) {
          if (book.pdfUrl) {
            openDirectDownload(
              book.pdfUrl,
              getPdfFileName(book)
            );

            await wait(1200);
          }
        }
      } else {
        setDownloadError(
          err?.message ||
          "Unable to prepare the ZIP file."
        );

        setDownloadMessage("");
      }
    } finally {
      downloadLockRef.current =
        false;

      setDownloadingAll(false);

      setDownloadProgress({
        current: 0,
        total: 0,
      });
    }
  }

  /* ========================================================
     PDF PREVIEW
  ======================================================== */

  function openPreview(book) {
    if (!pdfUnlocked || !book?.pdfUrl) return;
    setSelectedPreviewId(book.id);
    setShowPreview(true);
    setPreviewError("");
  }

  // Fetch the signed PDF as a Blob before putting it into an iframe.
  // Direct cross-origin framing may be blocked by X-Frame-Options,
  // Content-Security-Policy or Content-Disposition: attachment.
  useEffect(() => {
    if (!showPreview || !pdfUnlocked || !selectedPreview?.pdfUrl) {
      setPreviewObjectUrl("");
      setPreviewLoading(false);
      return undefined;
    }

    let cancelled = false;
    let objectUrl = "";
    setPreviewLoading(true);
    setPreviewError("");
    setPreviewObjectUrl("");

    fetchPdfBlob(selectedPreview.pdfUrl)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setPreviewObjectUrl(objectUrl);
      })
      .catch((err) => {
        if (!cancelled) {
          setPreviewError(err?.message || "Unable to load the PDF preview.");
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [showPreview, pdfUnlocked, selectedPreview?.id, selectedPreview?.pdfUrl]);

  useEffect(() => {
    if (!showPreview) return;
    const frame = requestAnimationFrame(() => {
      previewSectionRef.current?.scrollIntoView({
        behavior: "smooth", block: "start",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [showPreview, selectedPreviewId]);

  /* ========================================================
     LOCAL DESIGN VARIABLES

     The whole page uses React's isDark value.
     No dependency on Tailwind dark: classes.
  ======================================================== */

  const pageBg = isDark
    ? "bg-[#110e0c]"
    : "bg-[#fffaf5]";

  const cardBg = isDark
    ? "bg-[#211a15]"
    : "bg-white";

  const softBg = isDark
    ? "bg-[#2d2119]"
    : "bg-[#fff3e8]";

  const border = isDark
    ? "border-[#403027]"
    : "border-[#f1dfd1]";

  const primaryText = isDark
    ? "text-[#fff8f0]"
    : "text-[#29201a]";

  const secondaryText = isDark
    ? "text-[#bca99b]"
    : "text-[#76665a]";

  const mutedText = isDark
    ? "text-[#ddcfc3]"
    : "text-[#594a40]";

  const primaryButton = `
    inline-flex
    min-h-[46px]
    items-center
    justify-center
    gap-2 rounded-xl
    bg-orange-600
    px-5 py-3
    text-sm font-extrabold
    text-white
    transition
    hover:bg-orange-700
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;

  const secondaryButton = `
    inline-flex
    min-h-[46px]
    items-center
    justify-center
    gap-2 rounded-xl
    border px-5 py-3
    text-sm font-bold
    transition
    disabled:cursor-not-allowed
    disabled:opacity-50
    ${border}
    ${
      isDark
        ? "bg-[#2b211b] text-[#f8ede4] hover:bg-[#382a21]"
        : "bg-white text-[#4c3526] hover:bg-orange-50"
    }
  `;

  const badgeBg = isDark
    ? "bg-orange-500/15 text-orange-300"
    : "bg-orange-100 text-orange-700";

  const successBg = isDark
    ? "border-emerald-900/60 bg-emerald-950/20"
    : "border-emerald-200 bg-emerald-50";

  /* ========================================================
     LOADING VIEW
  ======================================================== */

  if (loading) {
    return (
      <main
        className={`
          flex min-h-screen
          items-center justify-center
          px-5 py-20
          font-sans
          ${pageBg}
          ${primaryText}
        `}
      >
        <div className="max-w-md text-center">
          <div
            className={`
              mx-auto flex
              h-20 w-20
              items-center justify-center
              rounded-3xl
              ${softBg}
            `}
          >
            <Loader2
              size={34}
              className="animate-spin text-orange-500"
            />
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Preparing your purchase
          </h1>

          <p
            className={`
              mt-3 text-sm leading-7
              ${secondaryText}
            `}
          >
            Verifying your payment and
            preparing your purchased ebooks.
          </p>
        </div>
      </main>
    );
  }

  /* ========================================================
     ERROR VIEW
  ======================================================== */

  if (
    error ||
    !purchase
  ) {
    return (
      <main
        className={`
          flex min-h-screen
          items-center justify-center
          px-4 py-24
          ${pageBg}
          ${primaryText}
        `}
      >
        <div
          className={`
            w-full max-w-lg
            rounded-3xl border
            p-7 text-center
            shadow-sm
            ${cardBg}
            ${border}
          `}
        >
          <div
            className="
              mx-auto flex h-16 w-16
              items-center justify-center
              rounded-2xl
              bg-red-500/10
              text-red-500
            "
          >
            <AlertCircle size={30} />
          </div>

          <h1 className="mt-6 text-2xl font-black">
            Unable to open your ebooks
          </h1>

          <p
            className={`
              mt-4 text-sm
              leading-7
              ${secondaryText}
            `}
          >
            {error ||
              "We couldn't load your purchase details."}
          </p>

          <div
            className={`
              mt-6 rounded-2xl
              p-4 text-left
              text-sm leading-7
              ${softBg}
              ${mutedText}
            `}
          >
            <AlertTriangle
              size={18}
              className="mb-2 text-orange-500"
            />

            If your payment was deducted,
            please do not make another payment.
            Contact our support team with
            your order reference.
          </div>

          {orderId && (
            <p
              className={`
                mt-5 break-all
                text-xs
                ${secondaryText}
              `}
            >
              Order: {orderId}
            </p>
          )}

          <div className="mt-7 grid gap-3">
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className={primaryButton}
            >
              <Mail size={17} />
              Contact Support
            </a>

            <Link
              to={BOOKS_URL}
              className={secondaryButton}
            >
              <ArrowLeft size={17} />
              Browse Books
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================================
     SUCCESS PAGE
  ======================================================== */

  return (
    <>
      <Helmet><meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex" /></Helmet>
      <main
        data-theme={theme}
        className={`
          min-h-screen
          w-full px-4
          pb-20 pt-[115px]
          font-sans
          sm:px-6
          lg:px-8
          ${pageBg}
          ${primaryText}
        `}
      >
        <div className="mx-auto max-w-6xl">

          {/* ======================================
              COMPACT PURCHASE CARD
              (verified badge, book name, price, order id)
          ====================================== */}

          <section
            className={`
              rounded-2xl border
              p-4 shadow-sm sm:p-5
              ${border}
              ${cardBg}
            `}
          >
            <div
              className="
                flex flex-col gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="
                    flex h-11 w-11
                    shrink-0 items-center
                    justify-center
                    rounded-xl
                    bg-emerald-500/15
                    text-emerald-500
                  "
                >
                  <CheckCircle2 size={24} />
                </div>

                <div className="min-w-0">
                  <span
                    className={`
                      inline-flex items-center
                      gap-1.5 rounded-full
                      px-2.5 py-0.5
                      text-[11px] font-extrabold
                      ${
                        isDark
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-emerald-100 text-emerald-700"
                      }
                    `}
                  >
                    <ShieldCheck size={13} />
                    Purchase verified
                  </span>

                  <h1 className="mt-1 break-words text-base font-black leading-snug sm:text-lg">
                    {productTitle}
                    {isBundle && (
                      <span
                        className={`
                          ml-2 text-xs
                          font-bold
                          ${secondaryText}
                        `}
                      >
                        ({totalBooks} books)
                      </span>
                    )}
                  </h1>

                  {purchase.orderId && (
                    <p
                      className={`
                        mt-1 break-all
                        text-xs
                        ${secondaryText}
                      `}
                    >
                      Order ID:{" "}
                      <span className="font-bold">
                        {purchase.orderId}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {paymentAmount !== null && (
                <div className="shrink-0 sm:text-right">
                  <p
                    className={`
                      text-[11px] font-bold
                      uppercase tracking-widest
                      ${secondaryText}
                    `}
                  >
                    Amount paid
                  </p>

                  <p className="text-xl font-black text-orange-500">
                    {formatMoney(
                      paymentAmount,
                      currency
                    )}
                  </p>
                </div>
              )}
            </div>
          </section>


          {/* ======================================
              PURCHASED BOOKS
          ====================================== */}

          <section
            className={`
              mt-6 overflow-hidden
              rounded-3xl border
              shadow-sm
              ${border}
              ${cardBg}
            `}
          >
            <div
              className={`
                flex flex-col gap-4
                border-b p-5
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:p-7
                ${border}
              `}
            >
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className={`
                      flex h-11 w-11
                      items-center
                      justify-center
                      rounded-xl
                      ${softBg}
                    `}
                  >
                    <BookOpen
                      size={22}
                      className="text-orange-500"
                    />
                  </div>

                  <h2 className="text-xl font-black">
                    Your Purchased Books
                  </h2>
                </div>

                <p
                  className={`
                    mt-3 text-sm
                    leading-6
                    ${secondaryText}
                  `}
                >
                  {totalBooks === 1
                    ? "Download or preview your purchased ebook."
                    : `You purchased ${totalBooks} ebooks. Download them individually or together as a ZIP.`}
                </p>
              </div>

              <span
                className={`
                  inline-flex w-fit
                  items-center gap-2
                  rounded-full px-4 py-2
                  text-xs font-extrabold
                  ${badgeBg}
                `}
              >
                <FileCheck2 size={16} />
                {totalBooks} available
              </span>
            </div>

            <div
              className={`
                divide-y
                ${
                  isDark
                    ? "divide-stone-800"
                    : "divide-orange-100"
                }
              `}
            >
              {books.map(
                (book, index) => {
                  const isDownloading =
                    downloadingBookId ===
                    book.id;

                  return (
                    <article
                      key={`${book.id}-${index}`}
                      className="p-5 sm:p-7"
                    >
                      <div
                        className="
                          flex flex-col
                          gap-6 sm:flex-row
                          sm:items-center
                        "
                      >
                        {/* BOOK COVER */}

                        <div
                          className={`
                            relative h-44 w-32
                            shrink-0 overflow-hidden
                            rounded-xl border
                            shadow-sm
                            ${border}
                          `}
                        >
                          <BookCover book={book} />

                          <div
                            className="
                              absolute bottom-0
                              right-0 rounded-tl-lg
                              bg-stone-950/85
                              px-3 py-1
                              text-[10px]
                              font-bold text-white
                            "
                          >
                            PDF
                          </div>
                        </div>

                        {/* BOOK INFORMATION */}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`
                                rounded-full
                                px-3 py-1
                                text-[10px]
                                font-extrabold
                                ${badgeBg}
                              `}
                            >
                              BOOK {index + 1}
                            </span>

                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-extrabold text-emerald-600">
                              <Check size={13} />
                              Purchased
                            </span>
                          </div>

                          <h3
                            className="
                              mt-4 text-lg
                              font-black
                              leading-snug
                            "
                          >
                            {book.title}
                          </h3>

                          {book.subtitle && (
                            <p
                              className={`
                                mt-2 text-sm
                                ${secondaryText}
                              `}
                            >
                              {book.subtitle}
                            </p>
                          )}

                          {book.description && (
                            <p
                              className={`
                                mt-3 line-clamp-3
                                text-sm leading-7
                                ${secondaryText}
                              `}
                            >
                              {book.description}
                            </p>
                          )}

                          <div
                            className={`
                              mt-4 flex
                              flex-wrap gap-4
                              text-xs
                              ${secondaryText}
                            `}
                          >
                            <span className="inline-flex items-center gap-2">
                              <FileText size={15} />
                              Digital PDF
                            </span>

                            <span className="inline-flex items-center gap-2">
                              <ShieldCheck size={15} />
                              Purchase verified
                            </span>
                          </div>
                        </div>

                        {/* BOOK ACTIONS */}

                        <div
                          className="
                            flex w-full
                            flex-col gap-3
                            sm:w-auto
                            sm:min-w-[185px]
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadBook(
                                book
                              )
                            }
                            disabled={
                              !pdfUnlocked ||
                              isBusy ||
                              !book.pdfUrl
                            }
                            className={primaryButton}
                          >
                            {isDownloading ? (
                              <Loader2
                                size={18}
                                className="animate-spin"
                              />
                            ) : (
                              <Download size={18} />
                            )}

                            {isDownloading
                              ? "Preparing..."
                              : "Download PDF"}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openPreview(book)
                            }
                            disabled={
                              !pdfUnlocked ||
                              !book.pdfUrl
                            }
                            className={secondaryButton}
                          >
                            <BookOpen size={17} />

                            Preview PDF
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>

            {/* ==================================
                DOWNLOAD ALL
            ================================== */}

            <div
              className={`
                border-t p-5
                sm:p-7
                ${border}
                ${softBg}
              `}
            >
              <div
                className="
                  flex flex-col
                  gap-5 md:flex-row
                  md:items-center
                  md:justify-between
                "
              >
                <div className="flex items-start gap-4">
                  <div
                    className="
                      flex h-12 w-12
                      shrink-0 items-center
                      justify-center
                      rounded-xl
                      bg-orange-600
                      text-white
                    "
                  >
                    <FileArchive size={23} />
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold">
                      {totalBooks > 1
                        ? "Download your complete collection"
                        : "Save your ebook"}
                    </h3>

                    <p
                      className={`
                        mt-2 text-sm
                        leading-7
                        ${secondaryText}
                      `}
                    >
                      {totalBooks > 1
                        ? `Download all ${totalBooks} purchased ebooks in one ZIP file.`
                        : "Keep a PDF copy on your device for offline reading."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadAll}
                  disabled={
                    !pdfUnlocked ||
                    isBusy
                  }
                  className={`
                    ${primaryButton}
                    w-full md:w-auto
                  `}
                >
                  {downloadingAll ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Download size={18} />
                  )}

                  {downloadingAll
                    ? "Preparing ZIP..."
                    : totalBooks > 1
                      ? `Download All ${totalBooks} Books`
                      : "Download Book"}
                </button>
              </div>

              {/* PROGRESS */}

              {downloadingAll && (
                <div className="mt-6">
                  <div
                    className={`
                      flex justify-between
                      text-xs font-bold
                      ${secondaryText}
                    `}
                  >
                    <span>
                      Preparing download
                    </span>

                    <span>
                      {downloadProgress.current}
                      {" / "}
                      {downloadProgress.total}
                    </span>
                  </div>

                  <div
                    className={`
                      mt-3 h-2
                      overflow-hidden
                      rounded-full
                      ${
                        isDark
                          ? "bg-stone-800"
                          : "bg-orange-200"
                      }
                    `}
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-orange-600
                        transition-all
                        duration-300
                      "
                      style={{
                        width:
                          `${
                            downloadProgress.total
                              ? (
                                  downloadProgress.current /
                                  downloadProgress.total
                                ) * 100
                              : 0
                          }%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* DOWNLOAD MESSAGE */}

              {downloadMessage && (
                <div
                  role="status"
                  className={`
                    mt-5 flex
                    items-start gap-3
                    rounded-xl border
                    p-4 text-sm
                    leading-6
                    ${border}
                    ${cardBg}
                  `}
                >
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-500"
                  />

                  <span>
                    {downloadMessage}
                  </span>
                </div>
              )}

              {/* DOWNLOAD ERROR */}

              {downloadError && (
                <div
                  role="alert"
                  className="
                    mt-5 flex
                    items-start gap-3
                    rounded-xl border
                    border-red-500/30
                    bg-red-500/10
                    p-4 text-sm
                    text-red-500
                  "
                >
                  <AlertCircle size={19} />

                  <span>
                    {downloadError}
                  </span>
                </div>
              )}

              {/* SUPPORT */}

              <p
                className={`
                  mt-5 flex flex-wrap
                  items-center gap-2
                  text-xs leading-6
                  ${secondaryText}
                `}
              >
                <Mail size={15} />
                Download problem? Email us at
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                    `Ebook download help - ${purchase.orderId || ""}`
                  )}`}
                  className="font-bold text-orange-500 underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </div>
          </section>

          {/* ======================================
              MOCK INTERVIEW PROMOTION
          ====================================== */}

          <MockInterviewCard
            isDark={isDark}
          />

          {/* ======================================
              PDF VIEWER
          ====================================== */}

          {pdfUnlocked &&
            showPreview &&
            selectedPreview && (
              <section
                ref={previewSectionRef}
                style={{ scrollMarginTop: "100px" }}
                className={`
                  mt-7 overflow-hidden
                  rounded-3xl
                  border
                  ${border}
                  ${cardBg}
                `}
              >
                <div
                  className={`
                    flex flex-col gap-4
                    border-b p-5
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                    ${border}
                  `}
                >
                  <div>
                    <h3 className="text-lg font-extrabold">
                      PDF Viewer
                    </h3>

                    <p
                      className={`
                        mt-2 text-sm
                        ${secondaryText}
                      `}
                    >
                      {selectedPreview.title}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowPreview(
                        false
                      )
                    }
                    className={secondaryButton}
                  >
                    <X size={17} />
                    Close Viewer
                  </button>
                </div>

                {books.length > 1 && (
                  <div
                    className={`
                      flex flex-wrap
                      gap-2 border-b
                      p-4
                      ${border}
                    `}
                  >
                    {books.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() =>
                          setSelectedPreviewId(
                            book.id
                          )
                        }
                        className={`
                          rounded-xl
                          px-4 py-2
                          text-xs font-bold
                          transition
                          ${
                            selectedPreviewId ===
                            book.id
                              ? "bg-orange-600 text-white"
                              : softBg
                          }
                        `}
                      >
                        {book.title}
                      </button>
                    ))}
                  </div>
                )}

                {previewLoading ? (
                  <div className="flex min-h-[240px] items-center justify-center gap-3 p-8">
                    <Loader2 size={22} className="animate-spin text-orange-500" />
                    <span>Loading your purchased PDF...</span>
                  </div>
                ) : previewError ? (
                  <div role="alert" className="p-8 text-center text-red-500">
                    {previewError}
                    <p className="mt-2 text-sm">If the PDF host blocks cross-origin access, configure CORS or proxy the PDF through your authenticated backend.</p>
                  </div>
                ) : previewObjectUrl ? (
                  <iframe
                    key={previewObjectUrl}
                    src={`${previewObjectUrl}#toolbar=1&view=FitH`}
                    title={selectedPreview.title}
                    className="h-[65vh] min-h-[420px] w-full border-0 sm:h-[75vh]"
                  />
                ) : (
                  <div
                    className={`
                      p-10 text-center
                      ${secondaryText}
                    `}
                  >
                    PDF preview unavailable.
                  </div>
                )}

                <div
                  className={`
                    border-t p-4
                    text-xs leading-6
                    ${border}
                    ${secondaryText}
                  `}
                >
                  Preview your PDF here or
                  use Download PDF to save
                  a copy to your device.
                </div>
              </section>
            )}

          {/* ======================================
              HOW TO SAVE
          ====================================== */}

          <section
            className={`
              mt-7 rounded-3xl
              border p-6
              sm:p-8
              ${border}
              ${cardBg}
            `}
          >
            <div className="flex items-center gap-3">
              <Smartphone
                size={24}
                className="text-orange-500"
              />

              <h2 className="text-xl font-black">
                How to save your ebooks
              </h2>
            </div>

            <p
              className={`
                mt-3 text-sm
                leading-7
                ${secondaryText}
              `}
            >
              Follow these simple steps
              to keep your purchased PDFs
              available for offline learning.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                {
                  number: "01",
                  title:
                    "Choose your books",
                  text:
                    "Download books individually, or use Download All for a complete bundle.",
                },

                {
                  number: "02",
                  title:
                    "Save to your device",
                  text:
                    "On desktop, check Downloads. On iPhone or iPad, choose Save to Files.",
                },

                {
                  number: "03",
                  title:
                    "Learn offline",
                  text:
                    "Keep your PDFs organized and open them anytime using your preferred PDF reader.",
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className={`
                    rounded-2xl
                    border p-5
                    ${border}
                    ${softBg}
                  `}
                >
                  <span className="text-sm font-black text-orange-500">
                    {item.number}
                  </span>

                  <h3 className="mt-3 text-sm font-extrabold">
                    {item.title}
                  </h3>

                  <p
                    className={`
                      mt-2 text-xs
                      leading-7
                      ${secondaryText}
                    `}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ======================================
              HELP SECTION
          ====================================== */}

          <section
            className={`
              mt-7 overflow-hidden
              rounded-3xl
              border
              ${border}
              ${cardBg}
            `}
          >
            <button
              type="button"
              onClick={() =>
                setShowHelp(
                  !showHelp
                )
              }
              aria-expanded={showHelp}
              className="
                flex w-full
                items-center
                justify-between
                gap-4 p-6
                text-left
              "
            >
              <div className="flex items-center gap-3">
                <HelpCircle
                  size={23}
                  className="text-orange-500"
                />

                <div>
                  <h3 className="text-sm font-extrabold">
                    Need help with your ebooks?
                  </h3>

                  <p
                    className={`
                      mt-1 text-xs
                      ${secondaryText}
                    `}
                  >
                    Download support and troubleshooting
                  </p>
                </div>
              </div>

              {showHelp ? (
                <ChevronUp size={19} />
              ) : (
                <ChevronDown size={19} />
              )}
            </button>

            {showHelp && (
              <div
                className={`
                  space-y-5
                  border-t p-6
                  ${border}
                `}
              >
                <div>
                  <h4 className="text-sm font-extrabold">
                    Download isn't starting?
                  </h4>

                  <p
                    className={`
                      mt-2 text-sm
                      leading-7
                      ${secondaryText}
                    `}
                  >
                    Make sure your browser
                    allows downloads. Try
                    saving one PDF at a time.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold">
                    Using an iPhone or iPad?
                  </h4>

                  <p
                    className={`
                      mt-2 text-sm
                      leading-7
                      ${secondaryText}
                    `}
                  >
                    If the native share menu
                    appears, select Save to Files.
                    Otherwise, check your browser's
                    Downloads section.
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold">
                    PDF not opening?
                  </h4>

                  <p
                    className={`
                      mt-2 text-sm
                      leading-7
                      ${secondaryText}
                    `}
                  >
                    Download it and open the
                    saved file with a PDF reader.
                  </p>
                </div>

                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className={secondaryButton}
                >
                  <Mail size={17} />

                  Contact Support

                  <ArrowRight size={16} />
                </a>
              </div>
            )}
          </section>

          {/* ======================================
              FOOTER
          ====================================== */}

          <div
            className="
              mt-9 flex
              flex-col gap-4
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <Link
              to={BOOKS_URL}
              className={secondaryButton}
            >
              <BookOpen size={17} />

              Explore More Books

              <ArrowRight size={16} />
            </Link>

            <p
              className={`
                text-center
                text-xs
                ${secondaryText}
              `}
            >
              Thank you for choosing
              Target Trek.
            </p>
          </div>
        </div>
      </main>

      {/* ======================================
          DOWNLOAD ACCESS MODAL
      ====================================== */}

      {showAccessModal && (
        <div
          className="
            fixed inset-0
            z-[9999]
            overflow-y-auto
            overscroll-contain
            bg-black/75
            backdrop-blur-sm
          "
        >
          <div
            className="
              flex min-h-full
              items-center
              justify-center
              px-4 py-6
            "
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="purchase-ready-title"
              className={`
                w-full max-w-md
                rounded-3xl
                border shadow-2xl
                ${border}
                ${cardBg}
                ${primaryText}
              `}
            >
              <div
                className={`
                  flex items-center gap-3
                  border-b p-4 sm:p-5
                  ${border}
                `}
              >
                <div
                  className="
                    flex h-11 w-11
                    shrink-0 items-center
                    justify-center
                    rounded-xl
                    bg-orange-600
                    text-white
                  "
                >
                  <CheckCircle2 size={24} />
                </div>

                <div className="min-w-0">
                  <h2
                    id="purchase-ready-title"
                    className="text-lg font-black leading-tight sm:text-xl"
                  >
                    Your ebooks are ready!
                  </h2>

                  <p
                    className={`
                      mt-1 text-xs
                      leading-5
                      ${secondaryText}
                    `}
                  >
                    {totalBooks === 1
                      ? "Your ebook is ready to download."
                      : `All ${totalBooks} ebooks are ready to download.`}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div
                  className={`
                    flex items-start
                    gap-3 rounded-xl
                    border p-3
                    ${border}
                    ${softBg}
                  `}
                >
                  <Download
                    size={18}
                    className="mt-0.5 shrink-0 text-orange-500"
                  />

                  <p
                    className={`
                      text-xs leading-6
                      ${secondaryText}
                    `}
                  >
                    Please download your
                    book{totalBooks > 1 ? "s" : ""} as
                    soon as possible and save
                    {totalBooks > 1 ? " them" : " it"} to
                    your device. You can download
                    one book or all at once.
                  </p>
                </div>

                <p
                  className={`
                    mt-3 flex flex-wrap
                    items-center gap-1.5
                    text-xs leading-5
                    ${secondaryText}
                  `}
                >
                  <Mail size={14} />
                  Need help? Email
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="break-all font-bold text-orange-500 underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </p>

                <label
                  className={`
                    mt-4 flex
                    cursor-pointer
                    items-start gap-3
                    rounded-xl border
                    p-3
                    ${border}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={
                      acceptedTerms
                    }
                    onChange={(event) =>
                      setAcceptedTerms(
                        event.target.checked
                      )
                    }
                    className="
                      mt-1 h-4 w-4
                      shrink-0
                      accent-orange-600
                    "
                  />

                  <span className="text-sm leading-6">
                    I understand that I should
                    save my purchased PDFs to
                    my own device.
                  </span>
                </label>

                <button
                  type="button"
                  disabled={
                    !acceptedTerms
                  }
                  onClick={
                    handleUnlock
                  }
                  className={`
                    ${primaryButton}
                    mt-4 w-full
                  `}
                >
                  <Download size={19} />

                  Access My Ebooks

                  <ArrowRight size={17} />
                </button>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
