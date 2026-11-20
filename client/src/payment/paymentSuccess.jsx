import API_BASE_URL from "../utils/Url";

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

import ResumePromo from "../resume/ResumePromo.jsx";
import { copyText, usePayFonts } from "./payShared";
import "./payment.css";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FileArchive,
  FileCheck2,
  FileText,
  HelpCircle,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";

import {
  trackPurchase,
} from "../lib/metaPixel";

import {
  trackGooglePurchase,
} from "../lib/googleAds";

/* ==========================================================
   CONFIGURATION
========================================================== */

const BASE_URL = (
  API_BASE_URL
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

/*
  A book can have several PDFs. Each entry is { id, fileName, pdfUrl }.
  Older responses only carry a single pdfUrl: that becomes one file.
*/
function normalizeFiles(book, fallbackUrl = "") {
  const list = Array.isArray(book?.files)
    ? book.files
        .filter((file) => file && file.pdfUrl)
        .map((file, index) => ({
          id: String(file.id || index),
          fileName: file.fileName || "",
          pdfUrl: file.pdfUrl,
        }))
    : [];

  if (list.length > 0) {
    return list;
  }

  const url = book?.pdfUrl || book?.downloadUrl || fallbackUrl || "";

  return url
    ? [{ id: "0", fileName: book?.fileName || "", pdfUrl: url }]
    : [];
}

// "<book>.pdf" for a one-file book, the file's own name otherwise.
function getFileDownloadName(book, file) {
  return getPdfFileName({
    ...book,
    fileName: file?.fileName || book?.fileName,
  });
}

/*
  Every file of every purchased book, in one flat list, with the path it
  takes inside a ZIP: one book -> files at the top; several books (a combo)
  -> one folder per book. Names never collide.
*/
function collectDownloadItems(books) {
  const items = [];
  const folders = new Set();
  const usedByFolder = new Map();

  for (const book of books) {
    let folder = "";

    if (books.length > 1) {
      folder = safeFileName(book.title || "Book").replace(/\.pdf$/i, "");

      let unique = folder;
      let n = 2;

      while (folders.has(unique.toLowerCase())) {
        unique = `${folder}-${n++}`;
      }

      folders.add(unique.toLowerCase());
      folder = unique;
    }

    if (!usedByFolder.has(folder)) usedByFolder.set(folder, new Set());

    for (const file of book.files || []) {
      const name = getUniqueFileName(
        getFileDownloadName(book, file),
        usedByFolder.get(folder)
      );

      items.push({
        book,
        file,
        name,
        path: folder ? `${folder}/${name}` : name,
      });
    }
  }

  return items;
}

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

          files: normalizeFiles(
            book,
            data.books.length === 1
              ? data.pdfUrl
              : ""
          ),

          pdfUrl:
            normalizeFiles(
              book,
              data.books.length === 1
                ? data.pdfUrl
                : ""
            )[0]?.pdfUrl || "",

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

        files: normalizeFiles(data, data.pdfUrl),

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
    title:
      data?.product?.title ||
      data?.title ||
      "",
    // Stored on the order at checkout by the backend
    attribution:
      data?.attribution || {
        platform: "organic",
      },
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
      "[Ad Purchase] Skipped: invalid purchase context"
    );

    return false;
  }

  // One ad platform per sale, decided by the backend.
  // Organic / direct sales are not reported anywhere.
  const platform =
    meta.attribution.platform;

  if (platform === "google") {
    return trackGooglePurchase({
      orderId: meta.orderId,
      amount: meta.amount,
      currency: meta.currency,
      attribution: meta.attribution,
    });
  }

  // Only sales that came from a Meta ad are reported to Meta, so it
  // learns from ad-driven buyers. The backend sends the same sale
  // (same event id) from the server, and Meta dedupes the pair.
  if (platform !== "meta") {
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
        title: meta.title,

        attribution:
          meta.attribution,

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

/* ==========================================================
   PAYMENT SUCCESS PAGE
========================================================== */

export default function PaymentSuccess() {
  const [searchParams] =
    useSearchParams();

  const token =
    searchParams.get("token");

  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [invoiceNote, setInvoiceNote] = useState("");

  // The invoice is made from the paid order on the server; the access token proves this is the buyer's own order.
  const handleDownloadInvoice = async () => {
    if (!token || invoiceBusy) return;
    setInvoiceBusy(true);
    setInvoiceNote("");
    try {
      const response = await fetch(
        `${BASE_URL}/payment/books/invoice?token=${encodeURIComponent(token)}`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      const result = await response.json().catch(() => null);
      if (response.ok && result?.data?.url) {
        const a = document.createElement("a");
        a.href = result.data.url;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        setInvoiceNote(result?.message || "Invoice is not available right now.");
      }
    } catch {
      setInvoiceNote("Unable to reach the server. Please try again.");
    } finally {
      setInvoiceBusy(false);
    }
  };

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
        // Isolated: tracking must never block book access.
        try {
          reportMetaPurchase(
            result,
            data,
            books
          );
        } catch (trackingError) {
          console.error(
            "[Ad Purchase] Tracking failed:",
            trackingError
          );
        }

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

  // Every PDF across every book.
  const totalFiles = useMemo(
    () =>
      books.reduce(
        (sum, book) =>
          sum + (book.files?.length || 0),
        0
      ),
    [books]
  );

  const isBundle =
    Boolean(
      purchase?.isBundle
    ) ||
    totalBooks > 1;

  // Which file of the previewed book is open (null = its first PDF).
  const [previewFileId, setPreviewFileId] = useState(null);

  const selectedPreviewBook =
    books.find(
      (book) =>
        book.id ===
        selectedPreviewId
    ) ||
    books[0] ||
    null;

  const selectedPreview = useMemo(() => {
    if (!selectedPreviewBook) return null;

    const file = selectedPreviewBook.files?.find(
      (f) => f.id === previewFileId
    );

    return file
      ? { ...selectedPreviewBook, pdfUrl: file.pdfUrl, previewFileName: file.fileName }
      : selectedPreviewBook;
  }, [selectedPreviewBook, previewFileId]);

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
     DOWNLOAD HELPERS (single file / ZIP of many files)
  ======================================================== */

  // Saves one PDF.
  async function saveOneFile(item, label) {
    const blob = await fetchPdfBlob(item.file.pdfUrl);

    const result = await saveBlob(
      blob,
      item.name,
      "application/pdf"
    );

    if (result === "cancelled") {
      setDownloadMessage("Save cancelled.");
    } else if (result === "shared") {
      setDownloadMessage(
        "Choose Save to Files or another destination."
      );
    } else {
      setDownloadMessage(
        `${label}: Download started. Check your Downloads folder.`
      );
    }
  }

  // Fetches every file and saves them together as one ZIP.
  async function saveAsZip(items, zipName, label) {
    const zip = new JSZip();

    setDownloadProgress({
      current: 0,
      total: items.length,
    });

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      setDownloadMessage(
        `Preparing ${index + 1} of ${items.length}: ${item.book.title}`
      );

      zip.file(
        item.path,
        await fetchPdfBlob(item.file.pdfUrl)
      );

      setDownloadProgress({
        current: index + 1,
        total: items.length,
      });
    }

    setDownloadMessage("Creating your ZIP file...");

    const zipBlob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 3 },
    });

    const result = await saveBlob(
      zipBlob,
      zipName,
      "application/zip"
    );

    if (result === "cancelled") {
      setDownloadMessage("Save cancelled.");
    } else if (result === "shared") {
      setDownloadMessage(
        "Choose Save to Files to keep your ebooks."
      );
    } else {
      setDownloadMessage(
        `${label}: ZIP download started with ${items.length} PDFs.`
      );
    }
  }

  // Network/CORS failure: fall back to plain links, one per file.
  async function openDirectly(items) {
    setDownloadMessage(
      "Starting individual downloads. If your browser asks, allow multiple downloads."
    );

    for (const item of items) {
      openDirectDownload(item.file.pdfUrl, item.name);

      await wait(1200);
    }
  }

  /* ========================================================
     DOWNLOAD ALL FILES OF ONE BOOK
     (one PDF -> the PDF, several PDFs -> one ZIP)
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

        if (!book?.files?.length) {
          setDownloadError(
            "The PDF is currently unavailable."
          );

          return;
        }

        const items = collectDownloadItems([book]);

        downloadLockRef.current = true;

        setDownloadingBookId(book.id);
        setDownloadError("");
        setDownloadMessage(`Preparing ${book.title}...`);

        try {
          if (items.length === 1) {
            await saveOneFile(items[0], book.title);
          } else {
            await saveAsZip(
              items,
              `${safeFileName(book.title)}.zip`,
              book.title
            );
          }
        } catch (err) {
          console.error("[PDF Download]", err);

          if (err instanceof TypeError) {
            await openDirectly(items);
          } else {
            setDownloadError(
              err?.message ||
              "Unable to download this ebook."
            );

            setDownloadMessage("");
          }
        } finally {
          downloadLockRef.current = false;

          setDownloadingBookId(null);

          setDownloadProgress({
            current: 0,
            total: 0,
          });
        }
      },
      // The helpers above only use state setters and the book data passed in.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [
        pdfUnlocked,
        downloadingAll,
        downloadingBookId,
      ]
    );

  /* ========================================================
     DOWNLOAD ONE SPECIFIC PDF OF A BOOK
  ======================================================== */

  async function handleDownloadFile(book, item) {
    if (
      !pdfUnlocked ||
      downloadingAll ||
      downloadingBookId ||
      downloadLockRef.current
    ) {
      return;
    }

    downloadLockRef.current = true;

    setDownloadingBookId(`${book.id}:${item.file.id}`);
    setDownloadError("");
    setDownloadMessage(`Preparing ${item.name}...`);

    try {
      await saveOneFile(item, item.name);
    } catch (err) {
      console.error("[PDF Download]", err);

      if (err instanceof TypeError) {
        await openDirectly([item]);
      } else {
        setDownloadError(
          err?.message || "Unable to download this PDF."
        );

        setDownloadMessage("");
      }
    } finally {
      downloadLockRef.current = false;

      setDownloadingBookId(null);
    }
  }

  /* ========================================================
     DOWNLOAD EVERYTHING
     Every PDF of every book (a combo's books can each have
     several PDFs) in one ZIP, one folder per book for combos.
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

    const items = collectDownloadItems(books);

    if (items.length === 0) {
      setDownloadError(
        "The PDFs are currently unavailable."
      );

      return;
    }

    // Nothing to zip: a single book with a single PDF.
    if (items.length === 1) {
      await handleDownloadBook(books.find((b) => b.files?.length) || books[0]);

      return;
    }

    downloadLockRef.current = true;

    setDownloadingAll(true);
    setDownloadError("");

    try {
      await saveAsZip(
        items,
        `TargetTrek-Books-${safeFileName(
          purchase?.orderId || "Bundle"
        )}.zip`,
        "All books"
      );
    } catch (err) {
      console.error("[ZIP Download]", err);

      if (err instanceof TypeError) {
        await openDirectly(items);
      } else {
        setDownloadError(
          err?.message ||
          "Unable to prepare the ZIP file."
        );

        setDownloadMessage("");
      }
    } finally {
      downloadLockRef.current = false;

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

  function openPreview(book, file = null) {
    if (!pdfUnlocked || !book?.pdfUrl) return;
    setSelectedPreviewId(book.id);
    setPreviewFileId(file?.id ?? null);
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
     UI-ONLY STATE / EFFECTS (declared before any early return)
  ======================================================== */

  usePayFonts();

  const [copiedRef, setCopiedRef] = useState(false);

  // Page cannot scroll behind the "ebooks are ready" dialog.
  useEffect(() => {
    if (!showAccessModal) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [showAccessModal]);

  async function copyOrderRef() {
    const value = purchase?.orderId || orderId;
    if (!value) return;
    await copyText(value);
    setCopiedRef(true);
    window.setTimeout(() => setCopiedRef(false), 1800);
  }

  // Locked buttons are never dead: tapping one reopens the notice so people always know what to do next.
  function guard(action) {
    if (!pdfUnlocked) {
      setShowAccessModal(true);
      return;
    }
    action();
  }

  const progressPercent = downloadProgress.total
    ? (downloadProgress.current / downloadProgress.total) * 100
    : 0;

  const downloadAllLabel = downloadingAll
    ? "Preparing ZIP..."
    : totalFiles > 1
      ? totalBooks > 1
        ? `Download all ${totalBooks} books (${totalFiles} PDFs)`
        : `Download all ${totalFiles} PDFs`
      : "Download my book";

  /* ========================================================
     LOADING VIEW
  ======================================================== */

  if (loading) {
    return (
      <main data-theme={theme} className="tp tp-center">
        <div className="tp-state" role="status" aria-live="polite">
          <div className="tp-ico">
            <Loader2 size={30} className="tp-spin" />
          </div>

          <h1 className="tp-h">Preparing your purchase</h1>

          <p>Verifying your payment and getting your ebooks ready. This takes a few seconds.</p>
        </div>
      </main>
    );
  }

  /* ========================================================
     ERROR VIEW
  ======================================================== */

  if (error || !purchase) {
    return (
      <main data-theme={theme} className="tp tp-center">
        <div className="tp-state tp-card">
          <div className="tp-ico bad">
            <AlertCircle size={30} />
          </div>

          <h1 className="tp-h">
            Unable to <span className="tp-mark">open your ebooks</span>
          </h1>

          <p>{error || "We couldn't load your purchase details."}</p>

          <div className="tp-alert tp-alert-warn">
            <AlertTriangle size={18} />
            <span>
              If your payment was deducted, please do not make another payment. Contact our support team with your order reference.
            </span>
          </div>

          {orderId && (
            <p className="tp-mono" style={{ fontSize: 12, wordBreak: "break-all" }}>
              Order: {orderId}
            </p>
          )}

          <div className="tp-stack">
            <a
              href={`mailto:${SUPPORT_EMAIL}${orderId ? `?subject=${encodeURIComponent(`Ebook access help - ${orderId}`)}` : ""}`}
              className="tp-btn tp-btn-primary tp-btn-lg"
            >
              <Mail size={18} />
              Contact support
            </a>

            <Link to={BOOKS_URL} className="tp-btn tp-btn-ghost">
              <ArrowLeft size={17} />
              Browse books
            </Link>
          </div>
        </div>
      </main>
    );
  }

  /* ========================================================
     SUCCESS PAGE
  ======================================================== */

  const statusBlock = (downloadingAll || downloadMessage || downloadError) && (
    <div className="tp-msgs" aria-live="polite">
      {downloadingAll && (
        <div className="tp-progress">
          <div className="tp-progress-top">
            <span>Preparing download</span>
            <span className="tp-mono">
              {downloadProgress.current} / {downloadProgress.total}
            </span>
          </div>
          <div className="tp-progress-bar">
            <i style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {downloadMessage && (
        <div role="status" className="tp-alert tp-alert-ok">
          <CheckCircle2 size={18} />
          <span>{downloadMessage}</span>
        </div>
      )}

      {downloadError && (
        <div role="alert" className="tp-alert tp-alert-bad">
          <AlertCircle size={18} />
          <span>{downloadError}</span>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Helmet><meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex" /></Helmet>

      <main data-theme={theme} className="tp tp-page">
        <div className="tp-wrap">
          {/* RESUME LAB (small, at the top) */}
          <ResumePromo variant="strip" isDark={isDark} />

          {/* ======================================
              HERO: payment confirmed + the main download button
          ====================================== */}

          <section className="tp-hero" style={{ marginTop: 14 }}>
            <div className="tp-hero-badge" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path className="draw" d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </div>

            <p className="tp-eyebrow" style={{ marginTop: 20 }}>Payment successful</p>

            <h1 className="tp-h" style={{ marginTop: 8 }}>
              Your {totalBooks > 1 ? "books are" : "book is"}{" "}
              <span className="tp-mark">ready to download</span>
            </h1>

            <p className="sub">
              {productTitle}
              {isBundle && ` (${totalBooks} books)`}. Press the button below to save {totalBooks > 1 ? "them" : "it"} to your device. You can also preview before saving.
            </p>

            <div className="tp-hero-meta">
              {paymentAmount !== null && (
                <span className="tp-chip tp-chip-panel">
                  <ShieldCheck size={15} />
                  Paid {formatMoney(paymentAmount, currency)}
                </span>
              )}

              {purchase.orderId && (
                <button
                  type="button"
                  onClick={copyOrderRef}
                  className="tp-ref"
                  title="Copy order ID"
                  aria-label={`Copy order ID ${purchase.orderId}`}
                >
                  <span>Order {purchase.orderId}</span>
                  {copiedRef ? (
                    <Check size={14} style={{ flex: "none", color: "#5eead4" }} />
                  ) : (
                    <Copy size={14} style={{ flex: "none", opacity: 0.7 }} />
                  )}
                </button>
              )}
            </div>
            <span role="status" className="tp-sr">{copiedRef ? "Order ID copied" : ""}</span>

            <div className="tp-hero-cta">
              <button
                type="button"
                onClick={() => guard(handleDownloadAll)}
                disabled={pdfUnlocked && isBusy}
                className="tp-btn tp-btn-mark tp-btn-lg"
              >
                {downloadingAll ? (
                  <Loader2 size={19} className="tp-spin" />
                ) : (
                  <Download size={19} />
                )}
                {pdfUnlocked ? downloadAllLabel : "Unlock my downloads"}
              </button>

              <a href="#downloads" className="tp-btn tp-btn-onpanel tp-btn-lg">
                <BookOpen size={18} />
                See my {totalBooks > 1 ? "books" : "book"}
              </a>

              {purchase.invoiceEnabled && (
              <button
                type="button"
                onClick={handleDownloadInvoice}
                disabled={invoiceBusy}
                className="tp-btn tp-btn-onpanel tp-btn-lg"
              >
                {invoiceBusy ? <Loader2 size={18} className="tp-spin" /> : <FileText size={18} />}
                Download invoice
              </button>
              )}
            </div>

            {invoiceNote && (
              <p className="tp-hero-note" role="status">
                <FileText size={15} />
                <span>{invoiceNote}</span>
              </p>
            )}

            {purchase.emailDelivery?.enabled && (
              <p className="tp-hero-note">
                <Mail size={15} />
                <span>
                  We're also emailing your{isBundle ? " PDFs" : " PDF"}
                  {purchase.emailDelivery.maskedEmail
                    ? ` to ${purchase.emailDelivery.maskedEmail}`
                    : ""}
                  . It can take a few minutes, so check spam too.
                </span>
              </p>
            )}
          </section>

          {/* HOW IT WORKS */}
          <ol className="tp-steps">
            <li className="tp-step done">
              <span className="tp-step-n"><Check size={17} /></span>
              <div>
                <b>Payment confirmed</b>
                <span>Your purchase is verified and unlocked.</span>
              </div>
            </li>
            <li className="tp-step">
              <span className="tp-step-n">2</span>
              <div>
                <b>Tap Download</b>
                <span>Save each PDF, or all of them in one ZIP.</span>
              </div>
            </li>
            <li className="tp-step">
              <span className="tp-step-n">3</span>
              <div>
                <b>Read anywhere</b>
                <span>Open the file offline in any PDF reader.</span>
              </div>
            </li>
          </ol>

          {/* ======================================
              PURCHASED BOOKS
          ====================================== */}

          <section id="downloads" className="tp-sec" style={{ scrollMarginTop: 96 }}>
            <div className="tp-sec-head">
              <div>
                <span className="tp-eyebrow">
                  <FileCheck2 size={15} />
                  {totalBooks} {totalBooks === 1 ? "ebook" : "ebooks"} available
                </span>
                <h2 className="tp-h" style={{ marginTop: 8 }}>
                  Your purchased <span className="tp-mark">books</span>
                </h2>
                <p>
                  {totalBooks === 1
                    ? totalFiles > 1
                      ? `This ebook comes with ${totalFiles} PDFs. Download them one by one, or all together as a ZIP.`
                      : "Download or preview your purchased ebook."
                    : `You purchased ${totalBooks} ebooks${totalFiles > totalBooks ? ` (${totalFiles} PDFs in total)` : ""}. Download them one by one, or all together as a ZIP.`}
                </p>
              </div>
            </div>

            {totalFiles > 1 && (
              <div className="tp-all">
                <div className="tp-all-text">
                  <span className="tp-ico"><FileArchive size={22} /></span>
                  <div>
                    <b>Download your complete collection</b>
                    <span>
                      {totalBooks > 1
                        ? `All ${totalBooks} ebooks (${totalFiles} PDFs, one folder per book) in one ZIP file.`
                        : `All ${totalFiles} PDFs of this ebook in one ZIP file.`}{" "}
                      Fastest way to save everything.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => guard(handleDownloadAll)}
                  disabled={pdfUnlocked && isBusy}
                  className="tp-btn tp-btn-primary tp-btn-lg"
                >
                  {downloadingAll ? <Loader2 size={19} className="tp-spin" /> : <Download size={19} />}
                  {downloadAllLabel}
                </button>
              </div>
            )}

            {statusBlock}

            {!pdfUnlocked && (
              <button
                type="button"
                onClick={() => setShowAccessModal(true)}
                className="tp-lock"
                style={{ width: "100%", marginTop: 14, border: 0, cursor: "pointer", textAlign: "left" }}
              >
                <LockKeyhole size={17} style={{ flex: "none" }} />
                <span>Tap here to confirm and unlock your downloads.</span>
              </button>
            )}

            <div className="tp-books">
              {books.map((book, index) => {
                const isDownloading = downloadingBookId === book.id;
                const fileItems = collectDownloadItems([book]);

                return (
                  <article key={`${book.id}-${index}`} className={`tp-book${fileItems.length > 1 ? " multi" : ""}`}>
                    <div className="tp-book-cover">
                      {book.coverPageUrl ? (
                        <img src={book.coverPageUrl} alt={`${book.title} cover`} loading="lazy" />
                      ) : (
                        <div className="fallback"><BookOpen size={32} /></div>
                      )}
                      <span className="pdf">PDF</span>
                    </div>

                    <div className="tp-book-info">
                      <div className="tp-book-tags">
                        {totalBooks > 1 && <span className="tp-tag">BOOK {index + 1}</span>}
                        <span className="tp-tag ok"><Check size={12} /> Purchased</span>
                        <span className="tp-tag"><FileText size={12} /> Digital PDF</span>
                      </div>

                      <h3>{book.title}</h3>
                      {book.subtitle && <p className="sub">{book.subtitle}</p>}
                      {book.description && <p className="desc">{book.description}</p>}
                    </div>

                    <div className="tp-book-actions">
                      {fileItems.length > 1 && (
                        <ul className="tp-files">
                          {fileItems.map((item) => {
                            const fileBusy =
                              downloadingBookId === `${book.id}:${item.file.id}`;

                            return (
                              <li key={item.file.id} className="tp-file">
                                <FileText size={16} className="tp-file-ico" />
                                <span className="tp-file-name" title={item.name}>{item.name}</span>
                                <button
                                  type="button"
                                  onClick={() => guard(() => openPreview(book, item.file))}
                                  className="tp-btn tp-btn-ghost tp-btn-xs"
                                  aria-label={`Preview ${item.name}`}
                                >
                                  <BookOpen size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => guard(() => handleDownloadFile(book, item))}
                                  disabled={pdfUnlocked && isBusy}
                                  className="tp-btn tp-btn-primary tp-btn-xs"
                                >
                                  {fileBusy ? <Loader2 size={15} className="tp-spin" /> : <Download size={15} />}
                                  Download
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}

                      <button
                        type="button"
                        onClick={() => guard(() => handleDownloadBook(book))}
                        disabled={(pdfUnlocked && isBusy) || !book.pdfUrl}
                        className={`tp-btn ${fileItems.length > 1 ? "tp-btn-ghost" : "tp-btn-primary tp-btn-lg"} tp-btn-block`}
                      >
                        {isDownloading ? (
                          <Loader2 size={19} className="tp-spin" />
                        ) : fileItems.length > 1 ? (
                          <FileArchive size={19} />
                        ) : (
                          <Download size={19} />
                        )}
                        {!book.pdfUrl
                          ? "PDF unavailable"
                          : isDownloading
                            ? "Preparing..."
                            : fileItems.length > 1
                              ? `Download all ${fileItems.length} PDFs of this book (ZIP)`
                              : "Download PDF"}
                      </button>

                      {fileItems.length <= 1 && (
                        <button
                          type="button"
                          onClick={() => guard(() => openPreview(book))}
                          disabled={!book.pdfUrl}
                          className="tp-btn tp-btn-ghost tp-btn-block"
                        >
                          <BookOpen size={17} />
                          Preview PDF
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>

            <p className="tp-muted" style={{ margin: "16px 0 0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, fontSize: 13 }}>
              <Mail size={15} />
              Download problem? Email us at
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  `Ebook download help - ${purchase.orderId || ""}`
                )}`}
                className="tp-link"
                style={{ fontWeight: 800, color: "var(--tp-brand)", textDecoration: "underline", textUnderlineOffset: 3, wordBreak: "break-all" }}
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </section>

          {/* ======================================
              PDF VIEWER
          ====================================== */}

          {pdfUnlocked && showPreview && selectedPreview && (
            <section ref={previewSectionRef} className="tp-viewer">
              <div className="tp-viewer-head">
                <div style={{ minWidth: 0 }}>
                  <h3>PDF viewer</h3>
                  <p>{selectedPreview.title}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="tp-btn tp-btn-ghost tp-btn-xs"
                >
                  <X size={17} />
                  Close viewer
                </button>
              </div>

              {books.length > 1 && (
                <div className="tp-viewer-tabs" role="tablist" aria-label="Choose a book to preview">
                  {books.map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      role="tab"
                      aria-selected={selectedPreviewId === book.id}
                      onClick={() => { setSelectedPreviewId(book.id); setPreviewFileId(null); }}
                      className={`tp-viewer-tab${selectedPreviewId === book.id ? " on" : ""}`}
                    >
                      {book.title}
                    </button>
                  ))}
                </div>
              )}

              {previewLoading ? (
                <div className="tp-viewer-body">
                  <Loader2 size={26} className="tp-spin" style={{ color: "var(--tp-brand)" }} />
                  <span>Loading your purchased PDF...</span>
                </div>
              ) : previewError ? (
                <div role="alert" className="tp-viewer-body">
                  <AlertCircle size={26} className="tp-pen" />
                  <span className="tp-pen" style={{ fontWeight: 700 }}>{previewError}</span>
                  <span style={{ fontSize: 13 }}>You can still use Download PDF to save it and open it in your PDF reader.</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadBook(selectedPreview)}
                    disabled={isBusy}
                    className="tp-btn tp-btn-primary"
                  >
                    <Download size={17} />
                    Download PDF
                  </button>
                </div>
              ) : previewObjectUrl ? (
                <iframe
                  key={previewObjectUrl}
                  src={`${previewObjectUrl}#toolbar=1&view=FitH`}
                  title={selectedPreview.title}
                />
              ) : (
                <div className="tp-viewer-body">PDF preview unavailable.</div>
              )}

              <div className="tp-viewer-foot">
                Preview your PDF here, or use <strong>Download PDF</strong> to save a copy to your device. Some phones can't show PDFs inline, so download works best there.
              </div>
            </section>
          )}

          {/* ======================================
              RESUME LAB PROMOTION
          ====================================== */}

          <div style={{ marginTop: 36 }}>
            <ResumePromo variant="card" isDark={isDark} />
          </div>

          {/* ======================================
              GUIDANCE
          ====================================== */}

          <div className="tp-info">
            <section className="tp-card tp-info-card">
              <h3><Smartphone size={22} /> Where will my file go?</h3>
              <ul className="tp-tips">
                <li><Check size={16} /><span><b>Android / desktop:</b> look in your Downloads folder, or the browser's download list.</span></li>
                <li><Check size={16} /><span><b>iPhone / iPad:</b> a share sheet opens. Choose <b>Save to Files</b>.</span></li>
                <li><Check size={16} /><span><b>Many books?</b> The ZIP contains each PDF. Unzip it with your Files app or any unzip tool.</span></li>
              </ul>
            </section>

            <section className="tp-card tp-info-card">
              <h3><HelpCircle size={22} /> Download not working?</h3>
              <ul className="tp-tips">
                <li><Check size={16} /><span>Allow downloads for this site in your browser, then try one PDF at a time.</span></li>
                <li><Check size={16} /><span>If a PDF won't open, save it first and open the saved file in a PDF reader.</span></li>
                <li><Check size={16} /><span>Still stuck? Email us your order ID and we'll sort it out quickly.</span></li>
              </ul>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                  `Ebook download help - ${purchase.orderId || ""}`
                )}`}
                className="tp-btn tp-btn-ghost tp-btn-block"
                style={{ marginTop: 16 }}
              >
                <Mail size={17} />
                Contact support
                <ArrowRight size={16} />
              </a>
            </section>
          </div>

          {/* FOOTER */}
          <div className="tp-foot-row">
            <Link to={BOOKS_URL} className="tp-btn tp-btn-ghost">
              <BookOpen size={17} />
              Explore more books
              <ArrowRight size={16} />
            </Link>

            <p>Thank you for choosing Target Trek.</p>
          </div>
        </div>

        {/* ======================================
            STICKY DOWNLOAD BAR (phones only):
            the download button is always one tap away
        ====================================== */}

        {!showAccessModal && (
          <div className="tp-sticky">
            <button
              type="button"
              onClick={() => guard(handleDownloadAll)}
              disabled={pdfUnlocked && isBusy}
              className="tp-btn tp-btn-primary tp-btn-lg tp-btn-block"
            >
              {downloadingAll || downloadingBookId ? (
                <Loader2 size={19} className="tp-spin" />
              ) : pdfUnlocked ? (
                <Download size={19} />
              ) : (
                <LockKeyhole size={19} />
              )}
              {downloadingBookId
                ? "Preparing..."
                : pdfUnlocked
                  ? downloadAllLabel
                  : "Unlock my downloads"}
            </button>
          </div>
        )}
      </main>

      {/* ======================================
          DOWNLOAD ACCESS MODAL
      ====================================== */}

      {showAccessModal && (
        <div className="tp tp-gate" data-theme={theme}>
          <div className="tp-gate-in">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="purchase-ready-title"
              className="tp-gate-card"
            >
              <div className="tp-gate-top">
                <div className="tp-hero-badge" aria-hidden="true">
                  <CheckCircle2 size={28} />
                </div>

                <h2 id="purchase-ready-title" className="tp-h">
                  Your {totalBooks === 1 ? "ebook is" : "ebooks are"}{" "}
                  <span className="tp-mark">ready!</span>
                </h2>

                <p>
                  {totalBooks === 1
                    ? "Your ebook is ready to download."
                    : `All ${totalBooks} ebooks are ready to download.`}
                </p>
              </div>

              <div className="tp-gate-body">
                <div className="tp-gate-note">
                  <Download size={18} />
                  <span>
                    Please download your book{totalBooks > 1 ? "s" : ""} as soon as possible and save{totalBooks > 1 ? " them" : " it"} to your device. You can download one book or all at once.
                  </span>
                </div>

                <label className="tp-check">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                  />
                  <span>I understand that I should save my purchased PDFs to my own device.</span>
                </label>

                <button
                  type="button"
                  disabled={!acceptedTerms}
                  onClick={handleUnlock}
                  className="tp-btn tp-btn-primary tp-btn-lg tp-btn-block"
                >
                  <Download size={19} />
                  Access my ebooks
                  <ArrowRight size={17} />
                </button>

                <p className="tp-muted" style={{ margin: 0, textAlign: "center", fontSize: 12.5 }}>
                  Need help? Email{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "var(--tp-brand)", fontWeight: 800, wordBreak: "break-all" }}>
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
