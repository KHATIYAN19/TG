// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import {
//   AlertCircle,
//   AlertTriangle,
//   ArrowLeft,
//   ArrowRight,
//   BookOpen,
//   Check,
//   CheckCircle2,
//   ChevronDown,
//   ChevronUp,
//   Clock3,
//   Download,
//   ExternalLink,
//   FileArchive,
//   FileCheck2,
//   FileText,
//   HelpCircle,
//   Loader2,
//   LockKeyhole,
//   Mail,
//   Package,
//   ShieldCheck,
//   Smartphone,
//   X,
// } from "lucide-react";

// import {
//   Link,
//   useSearchParams,
// } from "react-router-dom";

// import JSZip from "jszip";

// import {
//   trackPurchase,
// } from "../lib/metaPixel";

// // ============================================
// // CONFIGURATION
// // ============================================

// const BASE_URL = (
//   import.meta.env.VITE_BASE_URL ||
//   "https://target-trek.onrender.com"
// ).replace(/\/+$/, "");

// const ACCESS_API =
//   `${BASE_URL}/payment/payu/access`;

// const SUPPORT_EMAIL =
//   "supporttargettrek@gmail.com";

// const THEME_KEY = "theme";

// const THEME_EVENT =
//   "targettrek-theme-change";

// // Purchase should only be tracked from the
// // real paid-order access response.
// //
// // This must match your backend's access policy.
// const REQUIRE_PAYMENT_GATED_ACCESS = true;

// // ============================================
// // BASIC HELPERS
// // ============================================

// const readTheme = () => {
//   if (typeof window === "undefined") {
//     return "light";
//   }

//   try {
//     return window.localStorage.getItem(
//       THEME_KEY
//     ) === "dark"
//       ? "dark"
//       : "light";
//   } catch {
//     return "light";
//   }
// };

// const formatDate = (value) => {
//   if (!value) return "";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return "";
//   }

//   return date.toLocaleString("en-IN", {
//     dateStyle: "medium",
//     timeStyle: "short",
//   });
// };

// const formatCurrency = (
//   amount,
//   currency = "INR"
// ) => {
//   if (
//     amount === null ||
//     amount === undefined ||
//     amount === ""
//   ) {
//     return "";
//   }

//   const value = Number(amount);

//   if (!Number.isFinite(value)) {
//     return "";
//   }

//   try {
//     return new Intl.NumberFormat(
//       "en-IN",
//       {
//         style: "currency",
//         currency,
//         maximumFractionDigits: 2,
//       }
//     ).format(value);
//   } catch {
//     return `${currency} ${value}`;
//   }
// };

// const safeFileName = (value) => {
//   return (
//     String(value || "Target-Trek-Ebook")
//       .replace(/[^a-zA-Z0-9 _.-]/g, "")
//       .replace(/\s+/g, "-")
//       .replace(/^\.+|\.+$/g, "")
//       .substring(0, 90) ||
//     "Target-Trek-Ebook"
//   );
// };

// const getPdfFileName = (book) => {
//   const name = String(
//     book?.fileName ||
//     book?.slug ||
//     book?.title ||
//     "Target-Trek-Ebook"
//   ).replace(/\.pdf$/i, "");

//   return `${safeFileName(name)}.pdf`;
// };

// const getUniqueFileName = (
//   fileName,
//   usedNames
// ) => {
//   const base = fileName.replace(
//     /\.pdf$/i,
//     ""
//   );

//   let result = `${base}.pdf`;
//   let counter = 2;

//   while (
//     usedNames.has(result.toLowerCase())
//   ) {
//     result = `${base}-${counter}.pdf`;
//     counter++;
//   }

//   usedNames.add(result.toLowerCase());

//   return result;
// };

// const isAppleMobileDevice = () => {
//   if (typeof navigator === "undefined") {
//     return false;
//   }

//   const userAgent =
//     navigator.userAgent || "";

//   const platform =
//     navigator.platform || "";

//   return (
//     /iPad|iPhone|iPod/i.test(userAgent) ||
//     (
//       platform === "MacIntel" &&
//       navigator.maxTouchPoints > 1
//     )
//   );
// };

// // ============================================
// // PDF DOWNLOAD HELPERS
// // ============================================

// const triggerBlobDownload = (
//   blob,
//   fileName
// ) => {
//   const blobUrl =
//     URL.createObjectURL(blob);

//   const anchor =
//     document.createElement("a");

//   anchor.href = blobUrl;
//   anchor.download = fileName;
//   anchor.style.display = "none";

//   document.body.appendChild(anchor);

//   anchor.click();
//   anchor.remove();

//   window.setTimeout(() => {
//     URL.revokeObjectURL(blobUrl);
//   }, 60000);
// };

// const saveBlob = async (
//   blob,
//   fileName,
//   mimeType
// ) => {
//   if (isAppleMobileDevice()) {
//     try {
//       const file = new File(
//         [blob],
//         fileName,
//         {
//           type: mimeType,
//         }
//       );

//       if (
//         navigator.share &&
//         navigator.canShare?.({
//           files: [file],
//         })
//       ) {
//         await navigator.share({
//           files: [file],
//           title: fileName,
//         });

//         return "shared";
//       }
//     } catch (error) {
//       if (error?.name === "AbortError") {
//         return "cancelled";
//       }

//       console.warn(
//         "[Download] Native share failed:",
//         error
//       );
//     }
//   }

//   triggerBlobDownload(
//     blob,
//     fileName
//   );

//   return "started";
// };

// const fetchPdfBlob = async (url) => {
//   if (
//     !url ||
//     typeof url !== "string"
//   ) {
//     throw new Error(
//       "PDF download URL is missing."
//     );
//   }

//   const response = await fetch(url, {
//     method: "GET",
//     cache: "no-store",
//     headers: {
//       Accept: "application/pdf,*/*",
//     },
//   });

//   if (!response.ok) {
//     throw new Error(
//       `PDF request failed (${response.status}).`
//     );
//   }

//   const blob = await response.blob();

//   if (!blob || blob.size === 0) {
//     throw new Error(
//       "The downloaded PDF is empty."
//     );
//   }

//   const headerBuffer =
//     await blob.slice(
//       0,
//       5
//     ).arrayBuffer();

//   const header =
//     new TextDecoder().decode(
//       headerBuffer
//     );

//   if (header !== "%PDF-") {
//     throw new Error(
//       "The server did not return a valid PDF."
//     );
//   }

//   return new Blob(
//     [blob],
//     {
//       type: "application/pdf",
//     }
//   );
// };

// // ============================================
// // NORMALIZE PURCHASED BOOKS
// // ============================================

// const normalizePurchasedBooks = (
//   data
// ) => {
//   if (!data) return [];

//   if (
//     Array.isArray(data.books) &&
//     data.books.length > 0
//   ) {
//     return data.books
//       .filter(Boolean)
//       .map((book, index) => ({
//         id: String(
//           book.id ||
//           book._id ||
//           `book-${index}`
//         ),

//         title:
//           book.title ||
//           `Purchased Book ${index + 1}`,

//         slug: book.slug || "",

//         subtitle:
//           book.subtitle || "",

//         description:
//           book.description || "",

//         coverPageUrl:
//           book.coverPageUrl ||
//           data.coverPageUrl ||
//           "",

//         pdfUrl:
//           book.pdfUrl ||
//           book.downloadUrl ||
//           (
//             data.books.length === 1
//               ? data.pdfUrl
//               : ""
//           ) ||
//           "",

//         downloadUrl:
//           book.downloadUrl || "",

//         fileName:
//           book.fileName || "",

//         resourceType:
//           book.resourceType || "ebook",
//       }));
//   }

//   // Legacy PayU single-book response
//   if (data.pdfUrl) {
//     return [
//       {
//         id: String(
//           data.bookId ||
//           data.product?.id ||
//           data.product?._id ||
//           "single-book"
//         ),

//         title:
//           data.title ||
//           data.product?.title ||
//           "Purchased eBook",

//         slug:
//           data.slug || "",

//         subtitle:
//           data.subtitle || "",

//         description:
//           data.description || "",

//         coverPageUrl:
//           data.coverPageUrl || "",

//         pdfUrl:
//           data.pdfUrl,

//         downloadUrl: "",

//         fileName:
//           data.fileName || "",

//         resourceType: "ebook",
//       },
//     ];
//   }

//   return [];
// };

// // ============================================
// // META PURCHASE VALIDATION
// // ============================================
// //
// // Actual Cashfree response:
// //
// // {
// //   success: true,
// //   data: {
// //     orderId: "...",
// //     payment: {
// //       amount: 249,
// //       currency: "INR"
// //     },
// //     books: [...]
// //   }
// // }
// //
// // payment.status is NOT returned.
// //
// // Therefore, only use the successful access
// // response as purchase confirmation if the
// // backend guarantees that access is granted
// // exclusively for verified paid orders.
// //
// // This frontend cannot independently verify
// // gateway settlement.
// //
// // ============================================

// const buildMetaPurchase = (
//   result,
//   data,
//   books
// ) => {
//   const payment = data?.payment || {};

//   const orderId =
//     data?.orderId ??
//     data?.order?.orderId ??
//     null;

//   const rawAmount =
//     payment.amount ?? null;

//   const amount =
//     rawAmount === null ||
//     rawAmount === ""
//       ? NaN
//       : Number(rawAmount);

//   const currency = String(
//     payment.currency || "INR"
//   ).trim().toUpperCase();

//   const bookIds = books
//     .map((book) => String(
//       book.id || ""
//     ))
//     .filter(Boolean);

//   // Explicitly reject known unpaid statuses,
//   // even if access is mistakenly returned.
//   const status = String(
//     payment.status ??
//     payment.paymentStatus ??
//     payment.payment_status ??
//     data?.paymentStatus ??
//     ""
//   ).trim().toUpperCase();

//   const PAID_STATUSES = [
//     "SUCCESS",
//     "PAID",
//     "COMPLETED",
//   ];

//   const hasStatus = status.length > 0;

//   const statusValid =
//     !hasStatus ||
//     PAID_STATUSES.includes(status);

//   const validOrderId =
//     typeof orderId === "string" &&
//     orderId.trim().length > 0;

//   const validAmount =
//     Number.isFinite(amount) &&
//     amount > 0;

//   const validCurrency =
//     /^[A-Z]{3}$/.test(currency);

//   const validBooks =
//     bookIds.length > 0;

//   const validResponse =
//     result?.success === true &&
//     Boolean(data) &&
//     REQUIRE_PAYMENT_GATED_ACCESS;

//   const eligible =
//     validResponse &&
//     statusValid &&
//     validOrderId &&
//     validAmount &&
//     validCurrency &&
//     validBooks;

//   return {
//     eligible,

//     orderId:
//       validOrderId
//         ? orderId.trim()
//         : null,

//     amount,
//     currency,
//     bookIds,

//     diagnostics: {
//       status:
//         status || "NOT_PROVIDED",

//       accessSuccess:
//         result?.success === true,

//       statusValid,
//       validOrderId,
//       validAmount,
//       validCurrency,
//       validBooks,

//       paymentGatedAccessAssumed:
//         REQUIRE_PAYMENT_GATED_ACCESS,
//     },
//   };
// };

// // ============================================
// // TRACK PURCHASE
// // ============================================

// const reportMetaPurchase = (
//   result,
//   data,
//   books
// ) => {
//   const meta = buildMetaPurchase(
//     result,
//     data,
//     books
//   );

//   if (!meta.eligible) {
//     console.warn(
//       "[Meta Purchase] Skipped:",
//       meta.diagnostics
//     );

//     return false;
//   }

//   try {
//     const pixelAvailable =
//       typeof window !== "undefined" &&
//       typeof window.fbq === "function";

//     if (!pixelAvailable) {
//       console.warn(
//         "[Meta Purchase] Pixel unavailable. " +
//         "Check ad blockers and fbevents.js."
//       );

//       return false;
//     }

//     // Existing metaPixel.js provides
//     // per-order localStorage deduplication.
//     const sent = trackPurchase({
//       orderId: meta.orderId,
//       amount: meta.amount,
//       currency: meta.currency,
//       bookIds: meta.bookIds,
//     });

//     if (import.meta.env.DEV) {
//       console.log(
//         "[Meta Purchase] Result:",
//         {
//           dispatched: sent,

//           amount: meta.amount,

//           currency: meta.currency,

//           bookCount:
//             meta.bookIds.length,

//           pixelAvailable,
//         }
//       );
//     }

//     if (!sent) {
//       console.warn(
//         "[Meta Purchase] Not dispatched. " +
//         "Possible duplicate order, unavailable " +
//         "pixel, or rejected tracking arguments."
//       );
//     }

//     // IMPORTANT:
//     // true means fbq() was invoked.
//     // It does not prove Meta received the event.
//     return sent;
//   } catch (error) {
//     console.error(
//       "[Meta Purchase] Error:",
//       error
//     );

//     return false;
//   }
// };

// // ============================================
// // UI COMPONENTS
// // ============================================

// function BookCover({
//   book,
//   className = "",
// }) {
//   if (book?.coverPageUrl) {
//     return (
//       <img
//         src={book.coverPageUrl}
//         alt={`${book.title} cover`}
//         className={`
//           h-full w-full object-cover
//           ${className}
//         `}
//         loading="lazy"
//       />
//     );
//   }

//   return (
//     <div
//       className={`
//         flex h-full w-full
//         items-center justify-center
//         bg-blue-950 text-white
//         ${className}
//       `}
//     >
//       <BookOpen size={30} />
//     </div>
//   );
// }

// function StatusIcon({
//   type = "success",
// }) {
//   const success =
//     type === "success";

//   return (
//     <div
//       className={`
//         flex h-12 w-12 shrink-0
//         items-center justify-center
//         rounded-2xl
//         ${
//           success
//             ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
//             : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"
//         }
//       `}
//     >
//       {success ? (
//         <CheckCircle2 size={25} />
//       ) : (
//         <AlertCircle size={25} />
//       )}
//     </div>
//   );
// }

// function InfoCard({
//   label,
//   value,
//   icon: Icon,
//   isDark,
// }) {
//   return (
//     <div
//       className={`
//         rounded-xl px-4 py-3
//         ${
//           isDark
//             ? "bg-[#0C131D]"
//             : "bg-slate-50"
//         }
//       `}
//     >
//       <div
//         className={`
//           flex items-center gap-2
//           text-xs
//           ${
//             isDark
//               ? "text-slate-400"
//               : "text-slate-500"
//           }
//         `}
//       >
//         {Icon && <Icon size={14} />}
//         {label}
//       </div>

//       <p
//         className={`
//           mt-1 text-lg font-bold
//           ${
//             isDark
//               ? "text-white"
//               : "text-slate-950"
//           }
//         `}
//       >
//         {value}
//       </p>
//     </div>
//   );
// }

// // ============================================
// // MAIN COMPONENT
// // ============================================

// export default function PaymentSuccess() {
//   const [searchParams] =
//     useSearchParams();

//   const token =
//     searchParams.get("token");

//   const orderId =
//     searchParams.get("order");

//   // ==========================================
//   // STATE
//   // ==========================================

//   const [theme, setTheme] =
//     useState(readTheme);

//   const [purchase, setPurchase] =
//     useState(null);

//   const [loading, setLoading] =
//     useState(true);

//   const [error, setError] =
//     useState("");

//   const [
//     showAccessModal,
//     setShowAccessModal,
//   ] = useState(false);

//   const [
//     acceptedTerms,
//     setAcceptedTerms,
//   ] = useState(false);

//   const [
//     pdfUnlocked,
//     setPdfUnlocked,
//   ] = useState(false);

//   const [
//     downloadingBookId,
//     setDownloadingBookId,
//   ] = useState(null);

//   const [
//     downloadingAll,
//     setDownloadingAll,
//   ] = useState(false);

//   const [
//     downloadProgress,
//     setDownloadProgress,
//   ] = useState({
//     current: 0,
//     total: 0,
//   });

//   const [
//     downloadMessage,
//     setDownloadMessage,
//   ] = useState("");

//   const [
//     downloadError,
//     setDownloadError,
//   ] = useState("");

//   const [
//     selectedPreviewId,
//     setSelectedPreviewId,
//   ] = useState(null);

//   const [
//     showPreview,
//     setShowPreview,
//   ] = useState(false);

//   const [
//     showHelp,
//     setShowHelp,
//   ] = useState(false);

//   const downloadLockRef =
//     useRef(false);

//   const isDark =
//     theme === "dark";

//   // ==========================================
//   // THEME
//   // ==========================================

//   useEffect(() => {
//     setTheme(readTheme());

//     const handleThemeChange = (event) => {
//       const next =
//         event?.detail?.theme;

//       if (
//         next === "light" ||
//         next === "dark"
//       ) {
//         setTheme(next);
//       }
//     };

//     const handleStorageChange = (event) => {
//       if (
//         event.key === THEME_KEY
//       ) {
//         setTheme(readTheme());
//       }
//     };

//     window.addEventListener(
//       THEME_EVENT,
//       handleThemeChange
//     );

//     window.addEventListener(
//       "storage",
//       handleStorageChange
//     );

//     return () => {
//       window.removeEventListener(
//         THEME_EVENT,
//         handleThemeChange
//       );

//       window.removeEventListener(
//         "storage",
//         handleStorageChange
//       );
//     };
//   }, []);

//   // ==========================================
//   // LOAD PURCHASE
//   // ==========================================

//   useEffect(() => {
//     if (!token) {
//       setError(
//         orderId
//           ? "Your payment may already be processed. Please use your original access link or contact support."
//           : "Book access token is missing."
//       );

//       setLoading(false);
//       return;
//     }

//     const controller =
//       new AbortController();

//     const fetchAccess = async () => {
//       try {
//         setLoading(true);
//         setError("");

//         const url =
//           `${ACCESS_API}?token=${encodeURIComponent(token)}`;

//         const response = await fetch(
//           url,
//           {
//             method: "GET",

//             headers: {
//               Accept: "application/json",
//             },

//             cache: "no-store",

//             signal:
//               controller.signal,
//           }
//         );

//         const result =
//           await response
//             .json()
//             .catch(() => null);

//         if (
//           !response.ok ||
//           result?.success !== true ||
//           !result?.data
//         ) {
//           throw new Error(
//             result?.message ||
//             "Unable to access purchased books."
//           );
//         }

//         if (controller.signal.aborted) {
//           return;
//         }

//         const data =
//           result.data;

//         const books =
//           normalizePurchasedBooks(data);

//         if (!books.length) {
//           throw new Error(
//             "No downloadable books were returned. Please contact support."
//           );
//         }

//         // ====================================
//         // META PURCHASE TRACKING
//         // ====================================
//         //
//         // Your actual backend response:
//         //
//         // {
//         //   success: true,
//         //   data: {
//         //     orderId: "...",
//         //     payment: {
//         //       amount: 249,
//         //       currency: "INR"
//         //     },
//         //     books: [...]
//         //   }
//         // }
//         //
//         // No payment.status is required here.
//         //
//         // Access must be payment-gated.
//         //
//         // One order -> one Purchase event.
//         //
//         // ====================================

//         reportMetaPurchase(
//           result,
//           data,
//           books
//         );

//         // ====================================
//         // SUCCESS PAGE STATE
//         // ====================================

//         setPurchase({
//           ...data,
//           books,
//         });

//         setSelectedPreviewId(
//           books[0].id
//         );

//         setShowAccessModal(true);
//         setAcceptedTerms(false);
//         setPdfUnlocked(false);

//         // Remove private token from URL.
//         // The books remain in React state.
//         window.history.replaceState(
//           window.history.state,
//           document.title,
//           "/payment/success"
//         );
//       } catch (err) {
//         if (
//           err?.name === "AbortError" ||
//           controller.signal.aborted
//         ) {
//           return;
//         }

//         console.error(
//           "[Payment Success] Access error:",
//           err
//         );

//         setError(
//           err?.message ||
//           "Unable to load your purchased books."
//         );
//       } finally {
//         if (
//           !controller.signal.aborted
//         ) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchAccess();

//     return () => {
//       controller.abort();
//     };
//   }, [token, orderId]);

//   // ==========================================
//   // DERIVED DATA
//   // ==========================================

//   const books = useMemo(
//     () => purchase?.books || [],
//     [purchase]
//   );

//   const totalBooks =
//     books.length;

//   const isBundle =
//     Boolean(purchase?.isBundle) ||
//     totalBooks > 1;

//   const selectedPreview =
//     books.find(
//       (book) =>
//         book.id === selectedPreviewId
//     ) || books[0];

//   const isBusy =
//     Boolean(downloadingBookId) ||
//     downloadingAll;

//   const paymentAmount =
//     purchase?.payment?.amount ??
//     purchase?.product?.price ??
//     null;

//   const currency =
//     purchase?.payment?.currency ||
//     purchase?.product?.currency ||
//     "INR";

//   const productTitle =
//     purchase?.product?.title ||
//     purchase?.title ||
//     (
//       isBundle
//         ? "Target Trek Book Bundle"
//         : books[0]?.title
//     ) ||
//     "Purchased Books";

//   // ==========================================
//   // UNLOCK PDF
//   // ==========================================

//   const handleGetPdf = () => {
//     if (!acceptedTerms) {
//       return;
//     }

//     setPdfUnlocked(true);
//     setShowAccessModal(false);
//   };

//   // ==========================================
//   // DOWNLOAD SINGLE BOOK
//   // ==========================================

//   const handleDownloadBook =
//     useCallback(
//       async (book) => {
//         if (
//           !pdfUnlocked ||
//           isBusy ||
//           downloadLockRef.current
//         ) {
//           return;
//         }

//         if (!book?.pdfUrl) {
//           setDownloadError(
//             "The PDF is currently unavailable."
//           );

//           return;
//         }

//         downloadLockRef.current = true;

//         try {
//           setDownloadingBookId(
//             book.id
//           );

//           setDownloadMessage(
//             `Preparing ${book.title}...`
//           );

//           setDownloadError("");

//           const blob =
//             await fetchPdfBlob(
//               book.pdfUrl
//             );

//           const fileName =
//             getPdfFileName(book);

//           const result =
//             await saveBlob(
//               blob,
//               fileName,
//               "application/pdf"
//             );

//           if (
//             result === "cancelled"
//           ) {
//             setDownloadMessage(
//               "Save cancelled."
//             );
//           } else if (
//             result === "shared"
//           ) {
//             setDownloadMessage(
//               "Choose Save to Files or your preferred destination."
//             );
//           } else {
//             setDownloadMessage(
//               `${book.title}: Download started. Check your Downloads folder.`
//             );
//           }
//         } catch (err) {
//           console.error(
//             "[Download] Book error:",
//             err
//           );

//           setDownloadError(
//             err?.message ||
//             "Unable to download this book."
//           );

//           setDownloadMessage("");
//         } finally {
//           downloadLockRef.current =
//             false;

//           setDownloadingBookId(null);
//         }
//       },
//       [
//         pdfUnlocked,
//         isBusy,
//       ]
//     );

//   // ==========================================
//   // DOWNLOAD ALL BOOKS
//   // ==========================================

//   const handleDownloadAll = async () => {
//     if (
//       !pdfUnlocked ||
//       isBusy ||
//       downloadLockRef.current ||
//       books.length === 0
//     ) {
//       return;
//     }

//     if (
//       books.length === 1
//     ) {
//       await handleDownloadBook(
//         books[0]
//       );

//       return;
//     }

//     downloadLockRef.current = true;

//     try {
//       setDownloadingAll(true);
//       setDownloadError("");

//       setDownloadProgress({
//         current: 0,
//         total: books.length,
//       });

//       const zip =
//         new JSZip();

//       const usedNames =
//         new Set();

//       for (
//         let index = 0;
//         index < books.length;
//         index++
//       ) {
//         const book =
//           books[index];

//         setDownloadMessage(
//           `Preparing ${index + 1} of ${books.length}: ${book.title}`
//         );

//         if (!book.pdfUrl) {
//           throw new Error(
//             `PDF unavailable: ${book.title}`
//           );
//         }

//         const pdfBlob =
//           await fetchPdfBlob(
//             book.pdfUrl
//           );

//         const fileName =
//           getUniqueFileName(
//             getPdfFileName(book),
//             usedNames
//           );

//         zip.file(
//           fileName,
//           pdfBlob
//         );

//         setDownloadProgress({
//           current: index + 1,
//           total: books.length,
//         });
//       }

//       setDownloadMessage(
//         "Creating your ZIP file..."
//       );

//       const zipBlob =
//         await zip.generateAsync({
//           type: "blob",

//           compression: "DEFLATE",

//           compressionOptions: {
//             level: 3,
//           },
//         });

//       const zipName =
//         `TargetTrek-Books-${safeFileName(
//           purchase?.orderId ||
//           "Bundle"
//         )}.zip`;

//       const result =
//         await saveBlob(
//           zipBlob,
//           zipName,
//           "application/zip"
//         );

//       if (result === "cancelled") {
//         setDownloadMessage(
//           "Save cancelled."
//         );
//       } else if (
//         result === "shared"
//       ) {
//         setDownloadMessage(
//           "Choose Save to Files to keep all your ebooks."
//         );
//       } else {
//         setDownloadMessage(
//           `ZIP download started with ${books.length} ebooks.`
//         );
//       }
//     } catch (err) {
//       console.error(
//         "[Download] ZIP error:",
//         err
//       );

//       setDownloadError(
//         err?.message ||
//         "Unable to prepare all ebooks."
//       );

//       setDownloadMessage("");
//     } finally {
//       downloadLockRef.current =
//         false;

//       setDownloadingAll(false);

//       setDownloadProgress({
//         current: 0,
//         total: 0,
//       });
//     }
//   };

//   // ==========================================
//   // PDF PREVIEW
//   // ==========================================

//   const openPreview = (book) => {
//     if (!pdfUnlocked) {
//       return;
//     }

//     setSelectedPreviewId(
//       book.id
//     );

//     setShowPreview(true);
//   };

//   // ==========================================
//   // THEME CLASSES
//   // ==========================================

//   const pageBg = isDark
//     ? "bg-[#080D14]"
//     : "bg-[#F6F8FB]";

//   const cardBg = isDark
//     ? "bg-[#101924]"
//     : "bg-white";

//   const softBg = isDark
//     ? "bg-[#0C131D]"
//     : "bg-slate-50";

//   const border = isDark
//     ? "border-slate-800"
//     : "border-slate-200";

//   const primaryText = isDark
//     ? "text-white"
//     : "text-slate-950";

//   const secondaryText = isDark
//     ? "text-slate-400"
//     : "text-slate-500";

//   const mutedText = isDark
//     ? "text-slate-300"
//     : "text-slate-600";

//   const primaryButton = `
//     inline-flex min-h-[44px]
//     items-center justify-center
//     gap-2 rounded-xl bg-blue-600
//     px-5 py-3 text-sm
//     font-bold text-white
//     transition hover:bg-blue-700
//     disabled:cursor-not-allowed
//     disabled:opacity-50
//   `;

//   const secondaryButton = `
//     inline-flex min-h-[44px]
//     items-center justify-center
//     gap-2 rounded-xl border
//     px-5 py-3 text-sm
//     font-semibold transition
//     disabled:cursor-not-allowed
//     disabled:opacity-50
//     ${border}
//     ${
//       isDark
//         ? "bg-slate-900 text-slate-200 hover:bg-slate-800"
//         : "bg-white text-slate-800 hover:bg-slate-50"
//     }
//   `;

//   // ==========================================
//   // LOADING PAGE
//   // ==========================================

//   if (loading) {
//     return (
//       <main
//         className={`
//           flex min-h-screen
//           items-center justify-center
//           px-4 ${pageBg}
//         `}
//       >
//         <div className="text-center">
//           <div
//             className="
//               mx-auto flex h-16 w-16
//               items-center justify-center
//               rounded-2xl bg-blue-500/10
//             "
//           >
//             <Loader2
//               size={30}
//               className="
//                 animate-spin
//                 text-blue-500
//               "
//             />
//           </div>

//           <h1
//             className={`
//               mt-5 text-xl
//               font-bold ${primaryText}
//             `}
//           >
//             Preparing your purchase
//           </h1>

//           <p
//             className={`
//               mt-2 text-sm
//               ${secondaryText}
//             `}
//           >
//             Verifying your secure ebook access...
//           </p>
//         </div>
//       </main>
//     );
//   }

//   // ==========================================
//   // ERROR PAGE
//   // ==========================================

//   if (
//     error ||
//     !purchase
//   ) {
//     return (
//       <main
//         className={`
//           flex min-h-screen
//           items-center justify-center
//           px-4 py-20 ${pageBg}
//         `}
//       >
//         <div
//           className={`
//             w-full max-w-md
//             rounded-3xl border
//             p-7 text-center shadow-sm
//             ${border} ${cardBg}
//           `}
//         >
//           <div className="flex justify-center">
//             <StatusIcon type="error" />
//           </div>

//           <h1
//             className={`
//               mt-5 text-2xl
//               font-bold ${primaryText}
//             `}
//           >
//             Unable to open ebooks
//           </h1>

//           <p
//             className={`
//               mt-3 text-sm leading-6
//               ${secondaryText}
//             `}
//           >
//             {error}
//           </p>

//           <div
//             className={`
//               mt-6 rounded-xl p-4
//               text-left text-sm leading-6
//               ${softBg} ${mutedText}
//             `}
//           >
//             If your payment was deducted,
//             please do not pay again.
//             Contact our support team
//             with your order ID.
//           </div>

//           {orderId && (
//             <p
//               className={`
//                 mt-4 break-all text-xs
//                 ${secondaryText}
//               `}
//             >
//               Order: {orderId}
//             </p>
//           )}

//           <a
//             href={`mailto:${SUPPORT_EMAIL}`}
//             className={`
//               ${primaryButton}
//               mt-6 w-full
//             `}
//           >
//             <Mail size={17} />
//             Contact Support
//           </a>

//           <Link
//             to="/books"
//             className={`
//               ${secondaryButton}
//               mt-3 w-full
//             `}
//           >
//             <ArrowLeft size={17} />
//             Browse Books
//           </Link>
//         </div>
//       </main>
//     );
//   }

//   // ==========================================
//   // SUCCESS PAGE
//   // ==========================================

//   return (
//     <>
//       <main
//         className={`
//           min-h-screen w-full
//           px-4 pb-16 pt-20
//           sm:px-6 sm:pt-24
//           lg:px-8 ${pageBg}
//         `}
//       >
//         <div className="mx-auto max-w-6xl">

//           {/* ====================================
//               SUCCESS HEADER
//           ==================================== */}

//           <section
//             className={`
//               relative overflow-hidden
//               rounded-3xl border
//               p-5 sm:p-7
//               ${
//                 isDark
//                   ? "border-emerald-900/60 bg-emerald-950/20"
//                   : "border-emerald-200 bg-emerald-50"
//               }
//             `}
//           >
//             <div
//               className="
//                 relative flex flex-col
//                 gap-5 sm:flex-row
//                 sm:items-center
//                 sm:justify-between
//               "
//             >
//               <div className="flex items-start gap-4">
//                 <StatusIcon />

//                 <div>
//                   <p
//                     className={`
//                       text-xs font-bold
//                       uppercase tracking-widest
//                       ${
//                         isDark
//                           ? "text-emerald-400"
//                           : "text-emerald-700"
//                       }
//                     `}
//                   >
//                     Purchase confirmed
//                   </p>

//                   <h1
//                     className={`
//                       mt-1 text-2xl
//                       font-extrabold
//                       sm:text-3xl
//                       ${
//                         isDark
//                           ? "text-emerald-100"
//                           : "text-emerald-950"
//                       }
//                     `}
//                   >
//                     Payment Successful!
//                   </h1>

//                   <p
//                     className={`
//                       mt-2 text-sm leading-6
//                       ${
//                         isDark
//                           ? "text-emerald-300"
//                           : "text-emerald-800"
//                       }
//                     `}
//                   >
//                     Your eBook access is ready.
//                     {" "}
//                     {totalBooks === 1
//                       ? "Your ebook is available."
//                       : `All ${totalBooks} ebooks are available.`}
//                   </p>
//                 </div>
//               </div>

//               <div
//                 className={`
//                   flex w-fit items-center
//                   gap-2 rounded-full border
//                   px-4 py-2 text-xs font-bold
//                   ${
//                     isDark
//                       ? "border-emerald-800 bg-emerald-950 text-emerald-300"
//                       : "border-emerald-200 bg-white text-emerald-700"
//                   }
//                 `}
//               >
//                 <ShieldCheck size={15} />
//                 Access confirmed
//               </div>
//             </div>
//           </section>

//           {/* ====================================
//               ORDER OVERVIEW
//           ==================================== */}

//           <section
//             className={`
//               mt-5 rounded-2xl border
//               p-5 shadow-sm
//               ${border} ${cardBg}
//             `}
//           >
//             <div
//               className="
//                 flex flex-col gap-4
//                 sm:flex-row
//                 sm:items-center
//                 sm:justify-between
//               "
//             >
//               <div className="min-w-0">
//                 <p
//                   className={`
//                     text-xs font-semibold
//                     uppercase tracking-wider
//                     ${secondaryText}
//                   `}
//                 >
//                   Your purchase
//                 </p>

//                 <h2
//                   className={`
//                     mt-1 text-lg font-bold
//                     ${primaryText}
//                   `}
//                 >
//                   {productTitle}
//                 </h2>

//                 {purchase.orderId && (
//                   <p
//                     className={`
//                       mt-2 break-all text-xs
//                       ${secondaryText}
//                     `}
//                   >
//                     Order ID: {purchase.orderId}
//                   </p>
//                 )}
//               </div>

//               <div className="flex flex-wrap gap-3">
//                 <InfoCard
//                   label="Books"
//                   value={totalBooks}
//                   icon={BookOpen}
//                   isDark={isDark}
//                 />

//                 {paymentAmount !== null && (
//                   <InfoCard
//                     label="Amount paid"
//                     value={formatCurrency(
//                       paymentAmount,
//                       currency
//                     )}
//                     icon={CheckCircle2}
//                     isDark={isDark}
//                   />
//                 )}

//                 {isBundle && (
//                   <InfoCard
//                     label="Purchase type"
//                     value="Bundle"
//                     icon={Package}
//                     isDark={isDark}
//                   />
//                 )}
//               </div>
//             </div>
//           </section>

//           {/* ====================================
//               ACCESS WARNING
//           ==================================== */}

//           <section
//             className={`
//               mt-5 rounded-2xl
//               border p-4
//               ${
//                 isDark
//                   ? "border-amber-900/50 bg-amber-950/20"
//                   : "border-amber-200 bg-amber-50"
//               }
//             `}
//           >
//             <div className="flex items-start gap-3">
//               <AlertTriangle
//                 size={20}
//                 className="
//                   mt-0.5 shrink-0
//                   text-amber-500
//                 "
//               />

//               <div className="flex-1">
//                 <h3
//                   className={`
//                     text-sm font-bold
//                     ${
//                       isDark
//                         ? "text-amber-200"
//                         : "text-amber-900"
//                     }
//                   `}
//                 >
//                   Important — Save your books now
//                 </h3>

//                 <p
//                   className={`
//                     mt-1 text-sm leading-6
//                     ${
//                       isDark
//                         ? "text-amber-300/80"
//                         : "text-amber-800"
//                     }
//                   `}
//                 >
//                   Your download access is temporary.
//                   Please save all purchased PDFs
//                   to your device before leaving
//                   or refreshing this page.
//                 </p>

//                 {purchase.expiresAt && (
//                   <div
//                     className={`
//                       mt-3 inline-flex
//                       items-center gap-2
//                       text-xs font-semibold
//                       ${
//                         isDark
//                           ? "text-amber-300"
//                           : "text-amber-800"
//                       }
//                     `}
//                   >
//                     <Clock3 size={15} />

//                     Access expires:
//                     {" "}
//                     {formatDate(
//                       purchase.expiresAt
//                     )}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </section>

//           {/* ====================================
//               PURCHASED BOOKS
//           ==================================== */}

//           <section
//             className={`
//               mt-5 overflow-hidden
//               rounded-3xl border shadow-sm
//               ${border} ${cardBg}
//             `}
//           >
//             {/* HEADER */}

//             <div
//               className={`
//                 flex flex-col gap-4
//                 border-b p-5
//                 sm:flex-row
//                 sm:items-center
//                 sm:justify-between
//                 sm:p-6 ${border}
//               `}
//             >
//               <div>
//                 <div className="flex items-center gap-2">
//                   <BookOpen
//                     size={21}
//                     className="text-blue-500"
//                   />

//                   <h2
//                     className={`
//                       text-xl font-bold
//                       ${primaryText}
//                     `}
//                   >
//                     Your Purchased Books
//                   </h2>
//                 </div>

//                 <p
//                   className={`
//                     mt-2 text-sm
//                     ${secondaryText}
//                   `}
//                 >
//                   {totalBooks === 1
//                     ? "Download your ebook below."
//                     : `${totalBooks} ebooks included in your purchase. Download them individually or all together.`}
//                 </p>
//               </div>

//               <div
//                 className={`
//                   inline-flex w-fit
//                   items-center gap-2
//                   rounded-full px-3 py-2
//                   text-xs font-bold
//                   ${
//                     isDark
//                       ? "bg-blue-950/40 text-blue-300"
//                       : "bg-blue-50 text-blue-700"
//                   }
//                 `}
//               >
//                 <FileCheck2 size={15} />
//                 {totalBooks} available
//               </div>
//             </div>

//             {/* BOOK ROWS */}

//             <div
//               className={`
//                 divide-y
//                 ${
//                   isDark
//                     ? "divide-slate-800"
//                     : "divide-slate-100"
//                 }
//               `}
//             >
//               {books.map(
//                 (book, index) => {
//                   const isDownloading =
//                     downloadingBookId === book.id;

//                   return (
//                     <article
//                       key={`${book.id}-${index}`}
//                       className="p-4 sm:p-6"
//                     >
//                       <div
//                         className="
//                           flex flex-col gap-5
//                           sm:flex-row
//                           sm:items-center
//                         "
//                       >
//                         {/* COVER */}

//                         <div
//                           className={`
//                             relative h-36 w-24
//                             shrink-0 overflow-hidden
//                             rounded-xl border shadow-sm
//                             sm:h-40 sm:w-28
//                             ${border}
//                           `}
//                         >
//                           <BookCover
//                             book={book}
//                           />

//                           <div
//                             className="
//                               absolute bottom-0
//                               right-0 rounded-tl-lg
//                               bg-slate-950/80
//                               px-2 py-1
//                               text-[10px]
//                               font-semibold text-white
//                             "
//                           >
//                             PDF
//                           </div>
//                         </div>

//                         {/* DETAILS */}

//                         <div className="min-w-0 flex-1">
//                           <div className="flex flex-wrap items-center gap-2">
//                             <span
//                               className={`
//                                 inline-flex rounded-md
//                                 px-2 py-1
//                                 text-[10px] font-bold
//                                 ${
//                                   isDark
//                                     ? "bg-slate-800 text-slate-300"
//                                     : "bg-slate-100 text-slate-600"
//                                 }
//                               `}
//                             >
//                               BOOK {index + 1}
//                             </span>

//                             <span
//                               className="
//                                 inline-flex items-center
//                                 gap-1 rounded-md
//                                 bg-emerald-500/10
//                                 px-2 py-1
//                                 text-[10px] font-bold
//                                 text-emerald-600
//                               "
//                             >
//                               <Check size={12} />
//                               Purchased
//                             </span>
//                           </div>

//                           <h3
//                             className={`
//                               mt-3 text-base
//                               font-bold leading-snug
//                               sm:text-lg
//                               ${primaryText}
//                             `}
//                           >
//                             {book.title}
//                           </h3>

//                           {book.subtitle && (
//                             <p
//                               className={`
//                                 mt-1 text-sm
//                                 ${secondaryText}
//                               `}
//                             >
//                               {book.subtitle}
//                             </p>
//                           )}

//                           {book.description && (
//                             <p
//                               className={`
//                                 mt-2 line-clamp-2
//                                 text-sm leading-6
//                                 ${secondaryText}
//                               `}
//                             >
//                               {book.description}
//                             </p>
//                           )}

//                           <div
//                             className={`
//                               mt-3 flex flex-wrap
//                               items-center gap-3
//                               text-xs ${secondaryText}
//                             `}
//                           >
//                             <span className="flex items-center gap-1.5">
//                               <FileText size={14} />
//                               PDF eBook
//                             </span>

//                             <span className="flex items-center gap-1.5">
//                               <ShieldCheck size={14} />
//                               Access confirmed
//                             </span>
//                           </div>
//                         </div>

//                         {/* ACTIONS */}

//                         <div
//                           className="
//                             flex w-full flex-col
//                             gap-2 sm:w-auto
//                             sm:min-w-[175px]
//                           "
//                         >
//                           <button
//                             type="button"

//                             onClick={() =>
//                               handleDownloadBook(book)
//                             }

//                             disabled={
//                               !pdfUnlocked ||
//                               isBusy ||
//                               !book.pdfUrl
//                             }

//                             className={`
//                               ${primaryButton}
//                               w-full
//                             `}
//                           >
//                             {isDownloading ? (
//                               <Loader2
//                                 size={17}
//                                 className="animate-spin"
//                               />
//                             ) : (
//                               <Download size={17} />
//                             )}

//                             {isDownloading
//                               ? "Preparing..."
//                               : "Download PDF"}
//                           </button>

//                           <button
//                             type="button"

//                             onClick={() =>
//                               openPreview(book)
//                             }

//                             disabled={!pdfUnlocked}

//                             className={`
//                               ${secondaryButton}
//                               w-full
//                             `}
//                           >
//                             <BookOpen size={16} />
//                             Preview PDF
//                           </button>
//                         </div>
//                       </div>
//                     </article>
//                   );
//                 }
//               )}
//             </div>

//             {/* ==================================
//                 DOWNLOAD ALL
//             ================================== */}

//             <div
//               className={`
//                 border-t p-5 sm:p-6
//                 ${border}
//                 ${
//                   isDark
//                     ? "bg-[#0C1520]"
//                     : "bg-[#F8FAFC]"
//                 }
//               `}
//             >
//               <div
//                 className="
//                   flex flex-col gap-4
//                   md:flex-row
//                   md:items-center
//                   md:justify-between
//                 "
//               >
//                 <div className="flex items-start gap-3">
//                   <div
//                     className={`
//                       flex h-11 w-11
//                       shrink-0 items-center
//                       justify-center rounded-xl
//                       ${
//                         isDark
//                           ? "bg-blue-950/50 text-blue-400"
//                           : "bg-blue-100 text-blue-700"
//                       }
//                     `}
//                   >
//                     <FileArchive size={21} />
//                   </div>

//                   <div>
//                     <h3
//                       className={`
//                         text-base font-bold
//                         ${primaryText}
//                       `}
//                     >
//                       {totalBooks > 1
//                         ? "Download all books together"
//                         : "Save your purchased ebook"}
//                     </h3>

//                     <p
//                       className={`
//                         mt-1 text-sm
//                         leading-6 ${secondaryText}
//                       `}
//                     >
//                       {totalBooks > 1
//                         ? `Get all ${totalBooks} PDF ebooks in a single ZIP file.`
//                         : "Save a permanent PDF copy to your device."}
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleDownloadAll}

//                   disabled={
//                     !pdfUnlocked ||
//                     isBusy
//                   }

//                   className={`
//                     ${primaryButton}
//                     w-full md:w-auto
//                     md:min-w-[225px]
//                   `}
//                 >
//                   {downloadingAll ? (
//                     <Loader2
//                       size={18}
//                       className="animate-spin"
//                     />
//                   ) : (
//                     <Download size={18} />
//                   )}

//                   {downloadingAll
//                     ? "Preparing ZIP..."
//                     : totalBooks > 1
//                       ? `Download All ${totalBooks} Books`
//                       : "Download Book"}
//                 </button>
//               </div>

//               {/* PROGRESS */}

//               {downloadingAll && (
//                 <div className="mt-5">
//                   <div
//                     className={`
//                       flex justify-between
//                       text-xs font-semibold
//                       ${secondaryText}
//                     `}
//                   >
//                     <span>
//                       Preparing books
//                     </span>

//                     <span>
//                       {downloadProgress.current}
//                       {" / "}
//                       {downloadProgress.total}
//                     </span>
//                   </div>

//                   <div
//                     className={`
//                       mt-2 h-2 w-full
//                       overflow-hidden rounded-full
//                       ${
//                         isDark
//                           ? "bg-slate-800"
//                           : "bg-slate-200"
//                       }
//                     `}
//                   >
//                     <div
//                       className="
//                         h-full rounded-full
//                         bg-blue-600
//                         transition-all duration-300
//                       "
//                       style={{
//                         width: `${
//                           downloadProgress.total
//                             ? (
//                                 downloadProgress.current /
//                                 downloadProgress.total
//                               ) * 100
//                             : 0
//                         }%`,
//                       }}
//                     />
//                   </div>
//                 </div>
//               )}

//               {/* DOWNLOAD SUCCESS */}

//               {downloadMessage && (
//                 <div
//                   role="status"
//                   className={`
//                     mt-4 rounded-xl
//                     border p-3 text-sm
//                     ${border} ${softBg}
//                     ${mutedText}
//                   `}
//                 >
//                   <div className="flex items-start gap-2">
//                     <CheckCircle2
//                       size={17}
//                       className="
//                         mt-0.5 shrink-0
//                         text-emerald-500
//                       "
//                     />

//                     <span>
//                       {downloadMessage}
//                     </span>
//                   </div>
//                 </div>
//               )}

//               {/* DOWNLOAD ERROR */}

//               {downloadError && (
//                 <div
//                   role="alert"
//                   className={`
//                     mt-4 rounded-xl
//                     border p-3 text-sm
//                     ${
//                       isDark
//                         ? "border-red-900 bg-red-950/30 text-red-300"
//                         : "border-red-200 bg-red-50 text-red-700"
//                     }
//                   `}
//                 >
//                   <div className="flex items-start gap-2">
//                     <AlertCircle
//                       size={17}
//                       className="mt-0.5 shrink-0"
//                     />

//                     <span>
//                       {downloadError}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </section>

//           {/* ====================================
//               PDF PREVIEW
//           ==================================== */}

//           {pdfUnlocked && showPreview && (
//             <section
//               className={`
//                 mt-5 overflow-hidden
//                 rounded-3xl border
//                 ${border} ${cardBg}
//               `}
//             >
//               <div
//                 className={`
//                   flex flex-col gap-4
//                   border-b p-5
//                   sm:flex-row
//                   sm:items-center
//                   sm:justify-between
//                   ${border}
//                 `}
//               >
//                 <div>
//                   <h3
//                     className={`
//                       text-lg font-bold
//                       ${primaryText}
//                     `}
//                   >
//                     PDF Viewer
//                   </h3>

//                   <p
//                     className={`
//                       mt-1 text-sm
//                       ${secondaryText}
//                     `}
//                   >
//                     {selectedPreview?.title}
//                   </p>
//                 </div>

//                 <button
//                   type="button"

//                   onClick={() =>
//                     setShowPreview(false)
//                   }

//                   className={secondaryButton}
//                 >
//                   <X size={16} />
//                   Close Viewer
//                 </button>
//               </div>

//               {books.length > 1 && (
//                 <div
//                   className={`
//                     flex flex-wrap gap-2
//                     border-b p-4
//                     ${border}
//                   `}
//                 >
//                   {books.map((book) => (
//                     <button
//                       key={book.id}
//                       type="button"

//                       onClick={() =>
//                         setSelectedPreviewId(
//                           book.id
//                         )
//                       }

//                       className={`
//                         rounded-lg px-4 py-2
//                         text-xs font-bold
//                         transition
//                         ${
//                           selectedPreviewId === book.id
//                             ? "bg-blue-600 text-white"
//                             : isDark
//                               ? "bg-slate-800 text-slate-300"
//                               : "bg-slate-100 text-slate-700"
//                         }
//                       `}
//                     >
//                       {book.title}
//                     </button>
//                   ))}
//                 </div>
//               )}

//               {selectedPreview?.pdfUrl ? (
//                 <iframe
//                   key={selectedPreview.id}
//                   src={selectedPreview.pdfUrl}
//                   title={selectedPreview.title}

//                   className="
//                     h-[65vh]
//                     min-h-[420px]
//                     w-full border-0
//                     sm:h-[75vh]
//                   "
//                 />
//               ) : (
//                 <div
//                   className={`
//                     p-8 text-center
//                     ${secondaryText}
//                   `}
//                 >
//                   PDF preview unavailable.
//                 </div>
//               )}

//               <div
//                 className={`
//                   border-t p-4
//                   text-xs leading-5
//                   ${border} ${secondaryText}
//                 `}
//               >
//                 The viewer is for reading
//                 your purchased PDF. Use
//                 Download PDF to save a local copy.
//               </div>
//             </section>
//           )}

//           {/* ====================================
//               HOW TO SAVE
//           ==================================== */}

//           <section
//             className={`
//               mt-5 rounded-3xl
//               border p-5 sm:p-6
//               ${border} ${cardBg}
//             `}
//           >
//             <h2
//               className={`
//                 flex items-center
//                 gap-2 text-lg font-bold
//                 ${primaryText}
//               `}
//             >
//               <Smartphone
//                 size={21}
//                 className="text-blue-500"
//               />

//               How to save your ebooks
//             </h2>

//             <div
//               className="
//                 mt-5 grid gap-4
//                 md:grid-cols-3
//               "
//             >
//               {[
//                 {
//                   number: "01",
//                   title: "Choose your books",
//                   text:
//                     "Download any book individually or use Download All to get the complete bundle.",
//                 },
//                 {
//                   number: "02",
//                   title: "Save to your device",
//                   text:
//                     "On desktop, check Downloads. On iPhone or iPad, choose Save to Files.",
//                 },
//                 {
//                   number: "03",
//                   title: "Keep your copy",
//                   text:
//                     "Save the PDFs somewhere safe so you can read them after temporary access expires.",
//                 },
//               ].map((step) => (
//                 <div
//                   key={step.number}
//                   className={`
//                     rounded-2xl border p-4
//                     ${border} ${softBg}
//                   `}
//                 >
//                   <span
//                     className="
//                       text-sm font-bold
//                       text-blue-500
//                     "
//                   >
//                     {step.number}
//                   </span>

//                   <h3
//                     className={`
//                       mt-2 text-sm font-bold
//                       ${primaryText}
//                     `}
//                   >
//                     {step.title}
//                   </h3>

//                   <p
//                     className={`
//                       mt-2 text-xs leading-6
//                       ${secondaryText}
//                     `}
//                   >
//                     {step.text}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </section>

//           {/* ====================================
//               HELP
//           ==================================== */}

//           <section
//             className={`
//               mt-5 overflow-hidden
//               rounded-2xl border
//               ${border} ${cardBg}
//             `}
//           >
//             <button
//               type="button"

//               onClick={() =>
//                 setShowHelp(!showHelp)
//               }

//               className="
//                 flex w-full items-center
//                 justify-between gap-4
//                 p-5 text-left
//               "
//             >
//               <div className="flex items-center gap-3">
//                 <HelpCircle
//                   size={21}
//                   className="text-blue-500"
//                 />

//                 <div>
//                   <h3
//                     className={`
//                       text-sm font-bold
//                       ${primaryText}
//                     `}
//                   >
//                     Need help with downloads?
//                   </h3>

//                   <p
//                     className={`
//                       mt-1 text-xs
//                       ${secondaryText}
//                     `}
//                   >
//                     Troubleshooting and support
//                   </p>
//                 </div>
//               </div>

//               {showHelp ? (
//                 <ChevronUp size={18} />
//               ) : (
//                 <ChevronDown size={18} />
//               )}
//             </button>

//             {showHelp && (
//               <div
//                 className={`
//                   border-t p-5
//                   ${border}
//                 `}
//               >
//                 <div className="space-y-4">
//                   <div>
//                     <h4
//                       className={`
//                         text-sm font-bold
//                         ${primaryText}
//                       `}
//                     >
//                       Download isn't starting?
//                     </h4>

//                     <p
//                       className={`
//                         mt-1 text-sm
//                         leading-6 ${secondaryText}
//                       `}
//                     >
//                       Make sure your browser allows
//                       downloads. Try downloading
//                       the individual PDF first.
//                     </p>
//                   </div>

//                   <div>
//                     <h4
//                       className={`
//                         text-sm font-bold
//                         ${primaryText}
//                       `}
//                     >
//                       Using an iPhone or iPad?
//                     </h4>

//                     <p
//                       className={`
//                         mt-1 text-sm
//                         leading-6 ${secondaryText}
//                       `}
//                     >
//                       Use the share menu and choose
//                       Save to Files when available.
//                     </p>
//                   </div>

//                   <div>
//                     <h4
//                       className={`
//                         text-sm font-bold
//                         ${primaryText}
//                       `}
//                     >
//                       PDF not opening?
//                     </h4>

//                     <p
//                       className={`
//                         mt-1 text-sm
//                         leading-6 ${secondaryText}
//                       `}
//                     >
//                       Download the PDF and open it
//                       using a PDF reader on your device.
//                     </p>
//                   </div>

//                   <a
//                     href={`mailto:${SUPPORT_EMAIL}`}
//                     className={`
//                       ${secondaryButton}
//                       w-full sm:w-auto
//                     `}
//                   >
//                     <Mail size={16} />
//                     Contact Support
//                     <ArrowRight size={15} />
//                   </a>
//                 </div>
//               </div>
//             )}
//           </section>

//           {/* ====================================
//               FOOTER
//           ==================================== */}

//           <div
//             className="
//               mt-8 flex flex-col
//               items-center justify-between
//               gap-4 sm:flex-row
//             "
//           >
//             <Link
//               to="/books"

//               className={`
//                 ${secondaryButton}
//                 w-full sm:w-auto
//               `}
//             >
//               <BookOpen size={17} />
//               Explore More Books
//               <ArrowRight size={16} />
//             </Link>

//             <p
//               className={`
//                 text-center text-xs
//                 ${secondaryText}
//               `}
//             >
//               Thank you for purchasing
//               from Target Trek.
//             </p>
//           </div>
//         </div>
//       </main>

//       {/* ======================================
//           DOWNLOAD ACCESS MODAL
//       ====================================== */}

//       {showAccessModal && (
//         <div
//           className="
//             fixed inset-0 z-[9999]
//             flex items-center
//             justify-center
//             bg-slate-950/70
//             px-4 py-6
//             backdrop-blur-sm
//           "
//           role="presentation"
//         >
//           <div
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="access-modal-title"

//             className={`
//               w-full max-w-lg
//               overflow-hidden rounded-3xl
//               border shadow-2xl
//               ${border} ${cardBg}
//             `}
//           >
//             <div
//               className={`
//                 border-b p-6
//                 ${border}
//               `}
//             >
//               <div
//                 className="
//                   flex h-14 w-14
//                   items-center justify-center
//                   rounded-2xl
//                   bg-emerald-500/10
//                   text-emerald-500
//                 "
//               >
//                 <CheckCircle2 size={30} />
//               </div>

//               <h2
//                 id="access-modal-title"
//                 className={`
//                   mt-5 text-2xl
//                   font-extrabold
//                   ${primaryText}
//                 `}
//               >
//                 Your eBooks are ready!
//               </h2>

//               <p
//                 className={`
//                   mt-2 text-sm leading-6
//                   ${secondaryText}
//                 `}
//               >
//                 Your purchase access has
//                 been confirmed.

//                 {" "}

//                 {totalBooks === 1
//                   ? "You can download your ebook now."
//                   : `You can download all ${totalBooks} ebooks now.`}
//               </p>
//             </div>

//             <div className="p-6">
//               <div
//                 className={`
//                   flex items-start gap-3
//                   rounded-xl border p-4
//                   ${
//                     isDark
//                       ? "border-amber-900 bg-amber-950/30"
//                       : "border-amber-200 bg-amber-50"
//                   }
//                 `}
//               >
//                 <AlertTriangle
//                   size={20}
//                   className="
//                     mt-0.5 shrink-0
//                     text-amber-500
//                   "
//                 />

//                 <p
//                   className={`
//                     text-sm leading-6
//                     ${
//                       isDark
//                         ? "text-amber-200"
//                         : "text-amber-900"
//                     }
//                   `}
//                 >
//                   Your download access is temporary.
//                   Save your books to your device
//                   before leaving or refreshing
//                   this page.
//                 </p>
//               </div>

//               {purchase?.expiresAt && (
//                 <p
//                   className={`
//                     mt-4 flex items-center
//                     gap-2 text-xs
//                     ${secondaryText}
//                   `}
//                 >
//                   <Clock3 size={15} />

//                   Access expires:
//                   {" "}
//                   {formatDate(
//                     purchase.expiresAt
//                   )}
//                 </p>
//               )}

//               <label
//                 className={`
//                   mt-5 flex cursor-pointer
//                   items-start gap-3
//                   rounded-xl border p-4
//                   ${border} ${softBg}
//                 `}
//               >
//                 <input
//                   type="checkbox"

//                   checked={acceptedTerms}

//                   onChange={(event) =>
//                     setAcceptedTerms(
//                       event.target.checked
//                     )
//                   }

//                   className="
//                     mt-1 h-4 w-4
//                     accent-blue-600
//                   "
//                 />

//                 <span
//                   className={`
//                     text-sm leading-6
//                     ${mutedText}
//                   `}
//                 >
//                   I understand that my
//                   download access is temporary,
//                   and I should save my
//                   purchased ebooks.
//                 </span>
//               </label>

//               <button
//                 type="button"

//                 onClick={handleGetPdf}

//                 disabled={!acceptedTerms}

//                 className={`
//                   ${primaryButton}
//                   mt-5 w-full
//                 `}
//               >
//                 <Download size={18} />

//                 {totalBooks > 1
//                   ? `Access My ${totalBooks} Books`
//                   : "Access My eBook"}

//                 <ArrowRight size={17} />
//               </button>

//               <p
//                 className={`
//                   mt-4 text-center
//                   text-xs ${secondaryText}
//                 `}
//               >
//                 Need help?{" "}
//                 <a
//                   href={`mailto:${SUPPORT_EMAIL}`}
//                   className="
//                     font-semibold
//                     text-blue-500
//                     hover:underline
//                   "
//                 >
//                   Contact support
//                 </a>
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

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
   DOWNLOAD HELPERS
========================================================== */

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

  const [
    showHelp,
    setShowHelp,
  ] = useState(false);

  const downloadLockRef =
    useRef(false);

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

        setAcceptedTerms(false);
        setPdfUnlocked(false);
        setShowAccessModal(true);

        // Remove token and other payment
        // parameters from the browser URL.
        window.history.replaceState(
          window.history.state,
          document.title,
          "/payment/success"
        );
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

          setDownloadError(
            err?.message ||
            "Unable to download this ebook."
          );

          setDownloadMessage("");
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

      setDownloadError(
        err?.message ||
        "Unable to prepare the ZIP file."
      );

      setDownloadMessage("");
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
    if (!pdfUnlocked) {
      return;
    }

    setSelectedPreviewId(
      book.id
    );

    setShowPreview(true);
  }

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
              PAYMENT SUCCESS HERO
          ====================================== */}

          <section
            className={`
              relative overflow-hidden
              rounded-[28px] border
              p-6 sm:p-8
              ${border}
              ${
                isDark
                  ? "bg-gradient-to-br from-[#311d10] via-[#241910] to-[#211a15]"
                  : "bg-gradient-to-br from-[#fff0de] via-[#fff8f0] to-white"
              }
            `}
          >
            <div
              className="
                pointer-events-none
                absolute -right-20
                -top-24 h-72 w-72
                rounded-full
                bg-orange-400/15
                blur-3xl
              "
            />

            <div
              className="
                relative flex
                flex-col gap-6
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex h-14 w-14
                    shrink-0 items-center
                    justify-center
                    rounded-2xl
                    bg-orange-600
                    text-white
                    shadow-lg
                    shadow-orange-500/20
                  "
                >
                  <CheckCircle2
                    size={28}
                  />
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-orange-500">
                    Target Trek · Purchase confirmed
                  </p>

                  <h1
                    className="
                      mt-2 text-2xl
                      font-black
                      tracking-tight
                      sm:text-4xl
                    "
                  >
                    Payment successful!
                  </h1>

                  <p
                    className={`
                      mt-3 max-w-xl
                      text-sm leading-7
                      ${secondaryText}
                    `}
                  >
                    Thank you for your purchase.
                    Your digital learning resources
                    are ready.

                    {" "}

                    {totalBooks === 1
                      ? "You can download your ebook below."
                      : `All ${totalBooks} ebooks from your purchase are available below.`}
                  </p>
                </div>
              </div>

              <div
                className={`
                  inline-flex w-fit
                  items-center gap-2
                  rounded-full border
                  px-4 py-2
                  text-xs font-extrabold
                  ${
                    isDark
                      ? "border-orange-800 bg-orange-500/10 text-orange-300"
                      : "border-orange-200 bg-white text-orange-700"
                  }
                `}
              >
                <ShieldCheck size={16} />

                Purchase verified
              </div>
            </div>
          </section>

          {/* ======================================
              PURCHASE OVERVIEW
          ====================================== */}

          <section
            className={`
              mt-6 rounded-3xl
              border p-5 shadow-sm
              sm:p-7
              ${border}
              ${cardBg}
            `}
          >
            <div
              className="
                flex flex-col
                gap-6 lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              <div>
                <p
                  className={`
                    text-xs font-bold
                    uppercase tracking-widest
                    ${secondaryText}
                  `}
                >
                  Your purchase
                </p>

                <h2 className="mt-2 text-xl font-black sm:text-2xl">
                  {productTitle}
                </h2>

                {purchase.orderId && (
                  <p
                    className={`
                      mt-3 break-all
                      text-xs
                      ${secondaryText}
                    `}
                  >
                    Order ID:
                    {" "}
                    {purchase.orderId}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <DetailBox
                  label="Books"
                  value={totalBooks}
                  Icon={BookOpen}
                  isDark={isDark}
                />

                {paymentAmount !== null && (
                  <DetailBox
                    label="Amount paid"
                    value={formatMoney(
                      paymentAmount,
                      currency
                    )}
                    Icon={CheckCircle2}
                    isDark={isDark}
                  />
                )}

                {isBundle && (
                  <DetailBox
                    label="Purchase type"
                    value="Bundle"
                    Icon={Package}
                    isDark={isDark}
                  />
                )}
              </div>
            </div>
          </section>

          {/* ======================================
              SAVE REMINDER

              No token expiry display.
              No access-expiry countdown.
          ====================================== */}

          <section
            className={`
              mt-6 flex items-start
              gap-4 rounded-2xl
              border p-5
              ${
                isDark
                  ? "border-orange-900 bg-orange-950/20"
                  : "border-orange-200 bg-orange-50"
              }
            `}
          >
            <div className="mt-0.5 shrink-0 text-orange-500">
              <Download size={23} />
            </div>

            <div>
              <h3 className="text-sm font-extrabold">
                Save your purchased ebooks
              </h3>

              <p
                className={`
                  mt-2 text-sm
                  leading-7
                  ${secondaryText}
                `}
              >
                Download your PDFs to your
                device so you can read them
                offline whenever you need.
                We recommend saving a personal
                copy before leaving this page.
              </p>
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

                {selectedPreview.pdfUrl ? (
                  <iframe
                    key={selectedPreview.id}
                    src={
                      selectedPreview.pdfUrl
                    }
                    title={
                      selectedPreview.title
                    }
                    className="
                      h-[65vh]
                      min-h-[420px]
                      w-full
                      border-0
                      sm:h-[75vh]
                    "
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
            flex items-center
            justify-center
            bg-black/75
            px-4 py-6
            backdrop-blur-sm
          "
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-ready-title"
            className={`
              w-full max-w-lg
              overflow-hidden
              rounded-3xl
              border shadow-2xl
              ${border}
              ${cardBg}
              ${primaryText}
            `}
          >
            <div
              className={`
                border-b p-6
                ${border}
              `}
            >
              <div
                className="
                  flex h-14 w-14
                  items-center
                  justify-center
                  rounded-2xl
                  bg-orange-600
                  text-white
                "
              >
                <CheckCircle2 size={30} />
              </div>

              <h2
                id="purchase-ready-title"
                className="
                  mt-5 text-2xl
                  font-black
                "
              >
                Your ebooks are ready!
              </h2>

              <p
                className={`
                  mt-3 text-sm
                  leading-7
                  ${secondaryText}
                `}
              >
                Your purchase has been
                verified.

                {" "}

                {totalBooks === 1
                  ? "Your ebook is ready to download."
                  : `All ${totalBooks} ebooks are ready to download.`}
              </p>
            </div>

            <div className="p-6">
              <div
                className={`
                  flex items-start
                  gap-3 rounded-xl
                  border p-4
                  ${border}
                  ${softBg}
                `}
              >
                <Download
                  size={20}
                  className="mt-1 shrink-0 text-orange-500"
                />

                <div>
                  <h3 className="text-sm font-extrabold">
                    Save your PDF files
                  </h3>

                  <p
                    className={`
                      mt-2 text-sm
                      leading-7
                      ${secondaryText}
                    `}
                  >
                    Download your purchased
                    books and save them to your
                    device for offline reading.
                  </p>
                </div>
              </div>

              <label
                className={`
                  mt-6 flex
                  cursor-pointer
                  items-start gap-3
                  rounded-xl border
                  p-4
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
                    accent-orange-600
                  "
                />

                <span className="text-sm leading-7">
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
                  mt-6 w-full
                `}
              >
                <Download size={19} />

                Access My Ebooks

                <ArrowRight size={17} />
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
