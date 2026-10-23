// import React, {
//   useEffect,
//   useMemo,
//   useState,
//   useCallback,
// } from "react";

// import {
//   AlertCircle,
//   AlertTriangle,
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

// // ======================================================
// // CONFIGURATION
// // ======================================================

// const BASE_URL =
//   import.meta.env.VITE_BASE_URL ||
//   "https://target-trek.onrender.com";

// const SUPPORT_EMAIL =
//   "supporttargettrek@gmail.com";

// const THEME_KEY = "theme";

// const THEME_EVENT =
//   "targettrek-theme-change";

// // Existing backend API
// const ACCESS_API =
//   `${BASE_URL}/payment/payu/access`;

// // ======================================================
// // THEME
// // ======================================================

// const readTheme = () => {
//   if (typeof window === "undefined") {
//     return "light";
//   }

//   return window.localStorage.getItem(
//     THEME_KEY
//   ) === "dark"
//     ? "dark"
//     : "light";
// };

// // ======================================================
// // HELPERS
// // ======================================================

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

//   const number = Number(amount);

//   if (!Number.isFinite(number)) {
//     return "";
//   }

//   try {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency,
//       maximumFractionDigits: 2,
//     }).format(number);
//   } catch {
//     return `${currency} ${number}`;
//   }
// };

// const safeFileName = (value) => {
//   const name = String(
//     value || "Target-Trek-Ebook"
//   )
//     .replace(/[^a-zA-Z0-9 _.-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/^\.+/, "")
//     .replace(/\.+$/, "")
//     .substring(0, 90);

//   return name || "Target-Trek-Ebook";
// };

// const getPdfFileName = (book) => {
//   const existing = String(
//     book?.fileName || ""
//   ).trim();

//   if (existing) {
//     const cleaned = safeFileName(
//       existing.replace(/\.pdf$/i, "")
//     );

//     return `${cleaned}.pdf`;
//   }

//   return `${safeFileName(
//     book?.slug || book?.title
//   )}.pdf`;
// };

// const getUniqueFileName = (
//   name,
//   usedNames
// ) => {
//   const base = name.replace(/\.pdf$/i, "");

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

//   const normalIOS =
//     /iPad|iPhone|iPod/i.test(userAgent);

//   const modernIPad =
//     platform === "MacIntel" &&
//     navigator.maxTouchPoints > 1;

//   return normalIOS || modernIPad;
// };

// // ======================================================
// // DOWNLOAD HELPERS
// // ======================================================

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
//   // Prefer the native iOS share/save menu.
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
//         "Native save unavailable:",
//         error
//       );
//     }
//   }

//   // Standard browser download.
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

//   // Verify the actual PDF signature.
//   // Avoid saving an HTML error page as a PDF.
//   const headerBuffer =
//     await blob.slice(0, 5).arrayBuffer();

//   const header = new TextDecoder().decode(
//     headerBuffer
//   );

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

// // ======================================================
// // NORMALIZE BACKEND RESPONSE
// // Supports new books[] and legacy single-book API
// // ======================================================

// const normalizePurchasedBooks = (data) => {
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

//         subtitle: book.subtitle || "",

//         description:
//           book.description || "",

//         coverPageUrl:
//           book.coverPageUrl || "",

//         pdfUrl:
//           book.pdfUrl || "",

//         downloadUrl:
//           book.downloadUrl || "",

//         fileName:
//           book.fileName || "",

//         resourceType:
//           book.resourceType || "ebook",
//       }));
//   }

//   // Old PayU single-book response
//   if (data.pdfUrl) {
//     return [
//       {
//         id: String(
//           data.bookId ||
//           data.product?.id ||
//           "single-book"
//         ),

//         title:
//           data.title ||
//           data.product?.title ||
//           "Purchased eBook",

//         slug: "",

//         subtitle:
//           data.subtitle || "",

//         description:
//           data.description || "",

//         coverPageUrl:
//           data.coverPageUrl || "",

//         pdfUrl: data.pdfUrl,

//         downloadUrl: "",

//         fileName:
//           data.fileName || "",

//         resourceType: "ebook",
//       },
//     ];
//   }

//   return [];
// };

// // ======================================================
// // REUSABLE UI COMPONENTS
// // ======================================================

// const BookCover = ({
//   book,
//   className = "",
// }) => {
//   if (book.coverPageUrl) {
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
//       <BookOpen size={29} />
//     </div>
//   );
// };

// const StatusIcon = ({
//   type = "success",
// }) => {
//   const success = type === "success";

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
// };

// // ======================================================
// // MAIN COMPONENT
// // ======================================================

// export default function PaymentSuccess() {
//   const [searchParams] =
//     useSearchParams();

//   const token =
//     searchParams.get("token");

//   const orderId =
//     searchParams.get("order");

//   // ------------------------------------------
//   // STATE
//   // ------------------------------------------

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

//   const [showHelp, setShowHelp] =
//     useState(false);

//   const isDark = theme === "dark";

//   // ------------------------------------------
//   // THEME EFFECT
//   // ------------------------------------------

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
//       if (event.key === THEME_KEY) {
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

//   // ------------------------------------------
//   // LOAD PURCHASED BOOKS
//   // ------------------------------------------

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
//           await response.json().catch(
//             () => null
//           );

//         if (
//           !response.ok ||
//           !result?.success ||
//           !result?.data
//         ) {
//           throw new Error(
//             result?.message ||
//             "Unable to access purchased books."
//           );
//         }

//         const data = result.data;

//         const books =
//           normalizePurchasedBooks(data);

//         if (books.length === 0) {
//           throw new Error(
//             "No downloadable books were returned. Please contact support."
//           );
//         }

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

//         // Remove token from browser address bar.
//         // The verified data stays in component state.
//         window.history.replaceState(
//           window.history.state,
//           document.title,
//           "/payment/success"
//         );

//       } catch (err) {
//         if (
//           err?.name === "AbortError"
//         ) {
//           return;
//         }

//         console.error(
//           "Payment success access error:",
//           err
//         );

//         setError(
//           err?.message ||
//           "Unable to load your purchased books."
//         );
//       } finally {
//         if (!controller.signal.aborted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchAccess();

//     return () => {
//       controller.abort();
//     };
//   }, [token, orderId]);

//   // ------------------------------------------
//   // DERIVED DATA
//   // ------------------------------------------

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
//       (item) =>
//         item.id === selectedPreviewId
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

//   // ------------------------------------------
//   // UNLOCK
//   // ------------------------------------------

//   const handleGetPdf = () => {
//     if (!acceptedTerms) {
//       return;
//     }

//     setPdfUnlocked(true);

//     setShowAccessModal(false);
//   };

//   // ------------------------------------------
//   // INDIVIDUAL DOWNLOAD
//   // ------------------------------------------

//   const handleDownloadBook =
//     useCallback(
//       async (book) => {
//         if (!pdfUnlocked || isBusy) {
//           return;
//         }

//         if (!book?.pdfUrl) {
//           setDownloadError(
//             "The PDF is currently unavailable."
//           );

//           return;
//         }

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

//           if (result === "cancelled") {
//             setDownloadMessage(
//               "Save cancelled."
//             );
//           } else if (result === "shared") {
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
//             "Book download error:",
//             err
//           );

//           setDownloadError(
//             err?.message ||
//             "Unable to download this book."
//           );

//           setDownloadMessage("");
//         } finally {
//           setDownloadingBookId(null);
//         }
//       },
//       [pdfUnlocked, isBusy]
//     );

//   // ------------------------------------------
//   // DOWNLOAD ALL BOOKS
//   // ------------------------------------------
//   // One book => regular PDF
//   // Multiple => ZIP containing every PDF
//   // ------------------------------------------

//   const handleDownloadAll =
//     async () => {
//       if (
//         !pdfUnlocked ||
//         isBusy ||
//         books.length === 0
//       ) {
//         return;
//       }

//       if (books.length === 1) {
//         await handleDownloadBook(
//           books[0]
//         );

//         return;
//       }

//       try {
//         setDownloadingAll(true);

//         setDownloadError("");

//         setDownloadProgress({
//           current: 0,
//           total: books.length,
//         });

//         const zip = new JSZip();

//         const usedNames =
//           new Set();

//         for (
//           let index = 0;
//           index < books.length;
//           index++
//         ) {
//           const book = books[index];

//           setDownloadMessage(
//             `Preparing ${index + 1} of ${books.length}: ${book.title}`
//           );

//           if (!book.pdfUrl) {
//             throw new Error(
//               `PDF unavailable: ${book.title}`
//             );
//           }

//           const pdfBlob =
//             await fetchPdfBlob(
//               book.pdfUrl
//             );

//           const fileName =
//             getUniqueFileName(
//               getPdfFileName(book),
//               usedNames
//             );

//           zip.file(
//             fileName,
//             pdfBlob
//           );

//           setDownloadProgress({
//             current: index + 1,
//             total: books.length,
//           });
//         }

//         setDownloadMessage(
//           "Creating your ZIP file..."
//         );

//         const zipBlob =
//           await zip.generateAsync({
//             type: "blob",

//             compression: "DEFLATE",

//             compressionOptions: {
//               level: 3,
//             },
//           });

//         const zipName =
//           `TargetTrek-Books-${safeFileName(
//             purchase?.orderId ||
//             "Bundle"
//           )}.zip`;

//         const result =
//           await saveBlob(
//             zipBlob,
//             zipName,
//             "application/zip"
//           );

//         if (result === "cancelled") {
//           setDownloadMessage(
//             "Save cancelled."
//           );
//         } else if (result === "shared") {
//           setDownloadMessage(
//             "Choose Save to Files to keep all your ebooks."
//           );
//         } else {
//           setDownloadMessage(
//             `ZIP download started with ${books.length} ebooks.`
//           );
//         }

//       } catch (err) {
//         console.error(
//           "Download all error:",
//           err
//         );

//         setDownloadError(
//           err?.message ||
//           "Unable to prepare all ebooks."
//         );

//         setDownloadMessage("");

//       } finally {
//         setDownloadingAll(false);

//         setDownloadProgress({
//           current: 0,
//           total: 0,
//         });
//       }
//     };

//   // ------------------------------------------
//   // PREVIEW
//   // ------------------------------------------

//   const openPreview = (book) => {
//     if (!pdfUnlocked) return;

//     setSelectedPreviewId(
//       book.id
//     );

//     setShowPreview(true);
//   };

//   // ------------------------------------------
//   // COMMON THEME CLASSES
//   // ------------------------------------------

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
//           flex min-h-screen items-center
//           justify-center px-4
//           ${pageBg}
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
//               className="animate-spin text-blue-500"
//             />
//           </div>

//           <h1
//             className={`
//               mt-5 text-xl font-bold
//               ${primaryText}
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

//   if (error || !purchase) {
//     return (
//       <main
//         className={`
//           flex min-h-screen items-center
//           justify-center px-4 py-20
//           ${pageBg}
//         `}
//       >
//         <div
//           className={`
//             w-full max-w-md rounded-3xl
//             border p-7 text-center
//             shadow-sm
//             ${border} ${cardBg}
//           `}
//         >
//           <div className="flex justify-center">
//             <StatusIcon type="error" />
//           </div>

//           <h1
//             className={`
//               mt-5 text-2xl font-bold
//               ${primaryText}
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
//             If your payment was deducted, please
//             do not pay again. Contact our support
//             team with your order ID.
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
//           lg:px-8
//           ${pageBg}
//         `}
//       >
//         <div className="mx-auto max-w-6xl">

//           {/* ====================================
//               PAYMENT SUCCESS HEADER
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
//                     Your payment has been verified.
//                     {" "}
//                     {totalBooks === 1
//                       ? "Your ebook is ready."
//                       : `All ${totalBooks} ebooks are ready.`}
//                   </p>
//                 </div>
//               </div>

//               <div
//                 className={`
//                   flex w-fit items-center
//                   gap-2 rounded-full
//                   border px-4 py-2
//                   text-xs font-bold
//                   ${
//                     isDark
//                       ? "border-emerald-800 bg-emerald-950 text-emerald-300"
//                       : "border-emerald-200 bg-white text-emerald-700"
//                   }
//                 `}
//               >
//                 <ShieldCheck size={15} />
//                 Payment verified
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
//                 <div
//                   className={`
//                     rounded-xl px-4 py-3
//                     ${softBg}
//                   `}
//                 >
//                   <p
//                     className={`
//                       text-xs ${secondaryText}
//                     `}
//                   >
//                     Books
//                   </p>

//                   <p
//                     className={`
//                       mt-1 text-lg font-bold
//                       ${primaryText}
//                     `}
//                   >
//                     {totalBooks}
//                   </p>
//                 </div>

//                 {paymentAmount !== null && (
//                   <div
//                     className={`
//                       rounded-xl px-4 py-3
//                       ${softBg}
//                     `}
//                   >
//                     <p
//                       className={`
//                         text-xs ${secondaryText}
//                       `}
//                     >
//                       Amount paid
//                     </p>

//                     <p
//                       className={`
//                         mt-1 text-lg font-bold
//                         ${primaryText}
//                       `}
//                     >
//                       {formatCurrency(
//                         paymentAmount,
//                         currency
//                       )}
//                     </p>
//                   </div>
//                 )}

//                 {isBundle && (
//                   <div
//                     className={`
//                       flex items-center
//                       gap-2 rounded-xl
//                       px-4 py-3 ${softBg}
//                     `}
//                   >
//                     <Package
//                       size={18}
//                       className="text-blue-500"
//                     />

//                     <span
//                       className={`
//                         text-sm font-bold
//                         ${primaryText}
//                       `}
//                     >
//                       Bundle
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </section>

//           {/* ====================================
//               DOWNLOAD ACCESS WARNING
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
//                 className="mt-0.5 shrink-0 text-amber-500"
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
//                   Please save all purchased PDFs to
//                   your device before leaving or
//                   refreshing this page.
//                 </p>

//                 {purchase.expiresAt && (
//                   <div
//                     className={`
//                       mt-3 inline-flex items-center
//                       gap-2 text-xs font-semibold
//                       ${
//                         isDark
//                           ? "text-amber-300"
//                           : "text-amber-800"
//                       }
//                     `}
//                   >
//                     <Clock3 size={15} />

//                     Access expires:{" "}
//                     {formatDate(purchase.expiresAt)}
//                   </div>
//                 )}
//               </div>
//             </div>
//           </section>

//           {/* ====================================
//               BOOK LIST
//           ==================================== */}

//           <section
//             className={`
//               mt-5 overflow-hidden
//               rounded-3xl border
//               shadow-sm
//               ${border} ${cardBg}
//             `}
//           >
//             {/* SECTION HEADER */}

//             <div
//               className={`
//                 flex flex-col gap-4
//                 border-b p-5
//                 sm:flex-row
//                 sm:items-center
//                 sm:justify-between
//                 sm:p-6
//                 ${border}
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
//               {books.map((book, index) => {
//                 const isDownloading =
//                   downloadingBookId === book.id;

//                 return (
//                   <article
//                     key={`${book.id}-${index}`}
//                     className="
//                       p-4 sm:p-6
//                     "
//                   >
//                     <div
//                       className="
//                         flex flex-col gap-5
//                         sm:flex-row
//                         sm:items-center
//                       "
//                     >
//                       {/* BOOK COVER */}

//                       <div
//                         className={`
//                           relative h-36 w-24
//                           shrink-0 overflow-hidden
//                           rounded-xl border
//                           shadow-sm sm:h-40
//                           sm:w-28
//                           ${border}
//                         `}
//                       >
//                         <BookCover book={book} />

//                         <div
//                           className="
//                             absolute bottom-0
//                             right-0 rounded-tl-lg
//                             bg-slate-950/80
//                             px-2 py-1
//                             text-[10px]
//                             font-semibold text-white
//                           "
//                         >
//                           PDF
//                         </div>
//                       </div>

//                       {/* BOOK INFORMATION */}

//                       <div className="min-w-0 flex-1">
//                         <div className="flex flex-wrap items-center gap-2">
//                           <span
//                             className={`
//                               inline-flex rounded-md
//                               px-2 py-1
//                               text-[10px] font-bold
//                               ${
//                                 isDark
//                                   ? "bg-slate-800 text-slate-300"
//                                   : "bg-slate-100 text-slate-600"
//                               }
//                             `}
//                           >
//                             BOOK {index + 1}
//                           </span>

//                           <span
//                             className="
//                               inline-flex items-center
//                               gap-1 rounded-md
//                               bg-emerald-500/10
//                               px-2 py-1
//                               text-[10px]
//                               font-bold
//                               text-emerald-600
//                             "
//                           >
//                             <Check size={12} />
//                             Purchased
//                           </span>
//                         </div>

//                         <h3
//                           className={`
//                             mt-3 text-base
//                             font-bold leading-snug
//                             sm:text-lg
//                             ${primaryText}
//                           `}
//                         >
//                           {book.title}
//                         </h3>

//                         {book.subtitle && (
//                           <p
//                             className={`
//                               mt-1 text-sm
//                               ${secondaryText}
//                             `}
//                           >
//                             {book.subtitle}
//                           </p>
//                         )}

//                         {book.description && (
//                           <p
//                             className={`
//                               mt-2 line-clamp-2
//                               text-sm leading-6
//                               ${secondaryText}
//                             `}
//                           >
//                             {book.description}
//                           </p>
//                         )}

//                         <div
//                           className={`
//                             mt-3 flex flex-wrap
//                             items-center gap-3
//                             text-xs
//                             ${secondaryText}
//                           `}
//                         >
//                           <span className="flex items-center gap-1.5">
//                             <FileText size={14} />
//                             PDF eBook
//                           </span>

//                           <span className="flex items-center gap-1.5">
//                             <ShieldCheck size={14} />
//                             Purchase verified
//                           </span>
//                         </div>
//                       </div>

//                       {/* DOWNLOAD ACTIONS */}

//                       <div
//                         className="
//                           flex w-full flex-col
//                           gap-2 sm:w-auto
//                           sm:min-w-[175px]
//                         "
//                       >
//                         <button
//                           type="button"
//                           onClick={() =>
//                             handleDownloadBook(book)
//                           }
//                           disabled={
//                             !pdfUnlocked ||
//                             isBusy ||
//                             !book.pdfUrl
//                           }
//                           className={`
//                             ${primaryButton}
//                             w-full
//                           `}
//                         >
//                           {isDownloading ? (
//                             <Loader2
//                               size={17}
//                               className="animate-spin"
//                             />
//                           ) : (
//                             <Download size={17} />
//                           )}

//                           {isDownloading
//                             ? "Preparing..."
//                             : "Download PDF"}
//                         </button>

//                         <button
//                           type="button"
//                           onClick={() =>
//                             openPreview(book)
//                           }
//                           disabled={!pdfUnlocked}
//                           className={`
//                             ${secondaryButton}
//                             w-full
//                           `}
//                         >
//                           <BookOpen size={16} />
//                           Preview PDF
//                         </button>
//                       </div>
//                     </div>
//                   </article>
//                 );
//               })}
//             </div>

//             {/* DOWNLOAD ALL FOOTER */}

//             <div
//               className={`
//                 border-t p-5
//                 sm:p-6 ${border}
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
//                         leading-6
//                         ${secondaryText}
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

//               {/* ZIP PROGRESS */}

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
//                       overflow-hidden
//                       rounded-full
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
//                         transition-all
//                         duration-300
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

//               {/* DOWNLOAD MESSAGE */}

//               {downloadMessage && (
//                 <div
//                   role="status"
//                   className={`
//                     mt-4 rounded-xl
//                     border p-3
//                     text-sm
//                     ${border}
//                     ${softBg}
//                     ${mutedText}
//                   `}
//                 >
//                   <div className="flex items-start gap-2">
//                     <CheckCircle2
//                       size={17}
//                       className="mt-0.5 shrink-0 text-emerald-500"
//                     />

//                     <span>
//                       {downloadMessage}
//                     </span>
//                   </div>
//                 </div>
//               )}

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
//                     <span>{downloadError}</span>
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
//                           selectedPreviewId ===
//                           book.id
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
//                   ${border}
//                   ${secondaryText}
//                 `}
//               >
//                 The viewer is for reading your
//                 purchased PDF. Use Download PDF
//                 to save a local copy.
//               </div>
//             </section>
//           )}

//           {/* ====================================
//               HOW TO SAVE YOUR BOOKS
//           ==================================== */}

//           <section
//             className={`
//               mt-5 rounded-3xl
//               border p-5
//               sm:p-6
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
//                     rounded-2xl
//                     border p-4
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
//                       mt-2 text-sm
//                       font-bold
//                       ${primaryText}
//                     `}
//                   >
//                     {step.title}
//                   </h3>

//                   <p
//                     className={`
//                       mt-2 text-xs
//                       leading-6
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
//               SUPPORT
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
//                 <p
//                   className={`
//                     text-sm leading-7
//                     ${mutedText}
//                   `}
//                 >
//                   If your PDF doesn't download,
//                   check your browser's download
//                   permissions. If the ZIP downloads
//                   successfully, extract it to access
//                   each PDF separately.
//                 </p>

//                 <p
//                   className={`
//                     mt-3 text-sm
//                     ${mutedText}
//                   `}
//                 >
//                   If you still face an issue,
//                   contact us with your order ID.
//                 </p>

//                 <a
//                   href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
//                     `Book Download Support - ${purchase.orderId || "Order"}`
//                   )}`}
//                   className={`
//                     ${secondaryButton}
//                     mt-4
//                   `}
//                 >
//                   <Mail size={17} />
//                   Email Support
//                 </a>
//               </div>
//             )}
//           </section>

//           {/* ====================================
//               BOTTOM NAVIGATION
//           ==================================== */}

//           <div
//             className="
//               mt-8 flex flex-col
//               items-center gap-4
//               sm:flex-row
//               sm:justify-between
//             "
//           >
//             <div
//               className={`
//                 flex items-center gap-2
//                 text-xs ${secondaryText}
//               `}
//             >
//               <LockKeyhole size={14} />
//               Secure digital delivery
//             </div>

//             <Link
//               to="/books"
//               className={`
//                 inline-flex items-center
//                 gap-2 text-sm font-bold
//                 text-blue-500
//                 hover:text-blue-600
//               `}
//             >
//               Explore More Books
//               <ArrowRight size={17} />
//             </Link>
//           </div>
//         </div>
//       </main>

//       {/* ======================================
//           ACCESS CONFIRMATION MODAL
//       ====================================== */}

//       {showAccessModal && !pdfUnlocked && (
//         <div
//           className="
//             fixed inset-0 z-[9999]
//             flex items-center
//             justify-center
//             bg-slate-950/75
//             p-4 backdrop-blur-sm
//           "
//         >
//           <div
//             role="dialog"
//             aria-modal="true"
//             aria-labelledby="access-modal-title"
//             className={`
//               w-full max-w-lg
//               overflow-hidden
//               rounded-3xl border
//               shadow-2xl
//               ${border} ${cardBg}
//             `}
//           >
//             <div className="p-6 sm:p-7">
//               <div
//                 className="
//                   flex h-13 w-13
//                   items-center justify-center
//                   rounded-2xl bg-blue-500/10
//                   text-blue-500
//                 "
//               >
//                 <ShieldCheck size={27} />
//               </div>

//               <h2
//                 id="access-modal-title"
//                 className={`
//                   mt-5 text-xl font-bold
//                   ${primaryText}
//                 `}
//               >
//                 Your books are ready
//               </h2>

//               <p
//                 className={`
//                   mt-2 text-sm leading-6
//                   ${secondaryText}
//                 `}
//               >
//                 You have successfully purchased{" "}
//                 <strong>{totalBooks}</strong>
//                 {" "}
//                 {totalBooks === 1
//                   ? "ebook"
//                   : "ebooks"}.
//                 Please review these instructions
//                 before accessing your files.
//               </p>

//               <div
//                 className={`
//                   mt-5 rounded-2xl
//                   border p-4
//                   ${border} ${softBg}
//                 `}
//               >
//                 <div className="space-y-3">
//                   {[
//                     "Save your PDFs before the access link expires.",
//                     "Keep a backup on your device or personal drive.",
//                     "For bundles, download individual PDFs or the full ZIP.",
//                     "Purchased files are for your personal use; do not redistribute them.",
//                   ].map((item, index) => (
//                     <div
//                       key={index}
//                       className="
//                         flex items-start
//                         gap-3
//                       "
//                     >
//                       <CheckCircle2
//                         size={16}
//                         className="
//                           mt-0.5 shrink-0
//                           text-blue-500
//                         "
//                       />

//                       <span
//                         className={`
//                           text-sm leading-5
//                           ${mutedText}
//                         `}
//                       >
//                         {item}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               <label
//                 className="
//                   mt-5 flex cursor-pointer
//                   items-start gap-3
//                 "
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
//                   I understand that this access is
//                   temporary and I need to save my
//                   ebooks to my device.
//                 </span>
//               </label>

//               <button
//                 type="button"
//                 onClick={handleGetPdf}
//                 disabled={!acceptedTerms}
//                 className={`
//                   ${primaryButton}
//                   mt-6 w-full
//                 `}
//               >
//                 <Download size={18} />
//                 Access My{" "}
//                 {totalBooks === 1
//                   ? "Book"
//                   : `${totalBooks} Books`}
//                 <ArrowRight size={17} />
//               </button>

//               <p
//                 className={`
//                   mt-3 text-center
//                   text-xs
//                   ${secondaryText}
//                 `}
//               >
//                 Your payment has already been
//                 completed. No additional payment
//                 is required.
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import React, {

  useEffect,

  useMemo,

  useState,

  useCallback,
  useRef,

} from "react";



import {

  AlertCircle,

  AlertTriangle,

  ArrowRight,

  BookOpen,

  Check,

  CheckCircle2,

  ChevronDown,

  ChevronUp,

  Clock3,

  Download,

  ExternalLink,

  FileArchive,

  FileCheck2,

  FileText,

  HelpCircle,

  Loader2,

  LockKeyhole,

  Mail,

  Package,

  ShieldCheck,

  Smartphone,

  X,

} from "lucide-react";



import {

  Link,

  useSearchParams,

} from "react-router-dom";



import JSZip from "jszip";
import { trackPurchase } from "../lib/metaPixel";



// ======================================================

// CONFIGURATION

// ======================================================



const BASE_URL =

  import.meta.env.VITE_BASE_URL ||

  "https\://target-trek.onrender.com";



const SUPPORT_EMAIL =

  "supporttargettrek@gmail.com";



const THEME_KEY = "theme";



const THEME_EVENT =

  "targettrek-theme-change";



// Existing backend API

const ACCESS_API =

  `${BASE_URL}/payment/payu/access`;



// ======================================================

// THEME

// ======================================================



const readTheme = () => {

  if (typeof window === "undefined") {

    return "light";

  }



  return window.localStorage.getItem(

    THEME_KEY

  ) === "dark"

    ? "dark"

    : "light";

};



// ======================================================

// HELPERS

// ======================================================



const formatDate = (value) => {

  if (!value) return "";



  const date = new Date(value);



  if (Number.isNaN(date.getTime())) {

    return "";

  }



  return date.toLocaleString("en-IN", {

    dateStyle: "medium",

    timeStyle: "short",

  });

};



const formatCurrency = (

  amount,

  currency = "INR"

) => {

  if (

    amount === null ||

    amount === undefined ||

    amount === ""

  ) {

    return "";

  }



  const number = Number(amount);



  if (!Number.isFinite(number)) {

    return "";

  }



  try {

    return new Intl.NumberFormat("en-IN", {

      style: "currency",

      currency,

      maximumFractionDigits: 2,

    }).format(number);

  } catch {

    return `${currency} ${number}`;

  }

};



const safeFileName = (value) => String(value || "Target-Trek-Ebook")
  .replace(/[^a-zA-Z0-9 _.-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/^\.+|\.+$/g, "")
  .substring(0, 90) || "Target-Trek-Ebook";

const getPdfFileName = (book) => `${safeFileName(
  String(book?.fileName || book?.slug || book?.title || "Target-Trek-Ebook").replace(/\.pdf$/i, "")
)}.pdf`;

const getUniqueFileName = (

  name,

  usedNames

) => {

  const base = name.replace(/\.pdf$/i, "");



  let result = `${base}.pdf`;

  let counter = 2;



  while (

    usedNames.has(result.toLowerCase())

  ) {

    result = `${base}-${counter}.pdf`;

    counter++;

  }



  usedNames.add(result.toLowerCase());



  return result;

};



const isAppleMobileDevice = () => {

  if (typeof navigator === "undefined") {

    return false;

  }



  const userAgent =

    navigator.userAgent || "";



  const platform =

    navigator.platform || "";



  const normalIOS =

    /iPad|iPhone|iPod/i.test(userAgent);



  const modernIPad =

    platform === "MacIntel" &&

    navigator.maxTouchPoints > 1;



  return normalIOS || modernIPad;

};



// ======================================================

// DOWNLOAD HELPERS

// ======================================================



const triggerBlobDownload = (

  blob,

  fileName

) => {

  const blobUrl =

    URL.createObjectURL(blob);



  const anchor =

    document.createElement("a");



  anchor.href = blobUrl;

  anchor.download = fileName;

  anchor.style.display = "none";



  document.body.appendChild(anchor);



  anchor.click();



  anchor.remove();



  window.setTimeout(() => {

    URL.revokeObjectURL(blobUrl);

  }, 60000);

};



const saveBlob = async (

  blob,

  fileName,

  mimeType

) => {

  // Prefer the native iOS share/save menu.

  if (isAppleMobileDevice()) {

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

      if (error?.name === "AbortError") {

        return "cancelled";

      }



      console.warn(

        "Native save unavailable:",

        error

      );

    }

  }



  // Standard browser download.

  triggerBlobDownload(

    blob,

    fileName

  );



  return "started";

};



const fetchPdfBlob = async (url) => {

  if (

    !url ||

    typeof url !== "string"

  ) {

    throw new Error(

      "PDF download URL is missing."

    );

  }



  const response = await fetch(url, {

    method: "GET",

    cache: "no-store",

    headers: {

      Accept: "application/pdf,*/*",

    },

  });



  if (!response.ok) {

    throw new Error(

      `PDF request failed (${response.status}).`

    );

  }



  const blob = await response.blob();



  if (!blob || blob.size === 0) {

    throw new Error(

      "The downloaded PDF is empty."

    );

  }



  // Verify the actual PDF signature.

  // Avoid saving an HTML error page as a PDF.

  const headerBuffer =

    await blob.slice(0, 5).arrayBuffer();



  const header = new TextDecoder().decode(

    headerBuffer

  );



  if (header !== "%PDF-") {

    throw new Error(

      "The server did not return a valid PDF."

    );

  }



  return new Blob(

    [blob],

    {

      type: "application/pdf",

    }

  );

};



// ======================================================

// NORMALIZE BACKEND RESPONSE

// Supports new books[] and legacy single-book API

// ======================================================



const normalizePurchasedBooks = (data) => {

  if (!data) return [];



  if (

    Array.isArray(data.books) &&

    data.books.length > 0

  ) {

    return data.books

      .filter(Boolean)

      .map((book, index) => ({

        id: String(

          book.id ||

          book._id ||

          `book-${index}`

        ),



        title:

          book.title ||

          `Purchased Book ${index + 1}`,



        slug: book.slug || "",



        subtitle: book.subtitle || "",



        description:

          book.description || "",



        coverPageUrl:

          book.coverPageUrl || "",



        pdfUrl:

          book.pdfUrl || "",



        downloadUrl:

          book.downloadUrl || "",



        fileName:

          book.fileName || "",



        resourceType:

          book.resourceType || "ebook",

      }));

  }



  // Old PayU single-book response

  if (data.pdfUrl) {

    return [

      {

        id: String(

          data.bookId ||

          data.product?.id ||

          "single-book"

        ),



        title:

          data.title ||

          data.product?.title ||

          "Purchased eBook",



        slug: "",



        subtitle:

          data.subtitle || "",



        description:

          data.description || "",



        coverPageUrl:

          data.coverPageUrl || "",



        pdfUrl: data.pdfUrl,



        downloadUrl: "",



        fileName:

          data.fileName || "",



        resourceType: "ebook",

      },

    ];

  }



  return [];

};



// ======================================================

// REUSABLE UI COMPONENTS

// ======================================================



const BookCover = ({

  book,

  className = "",

}) => {

  if (book.coverPageUrl) {

    return (

      <img

        src={book.coverPageUrl}

        alt={`${book.title} cover`}

        className={`

          h-full w-full object-cover

          ${className}

        `}

        loading="lazy"

      />

    );

  }



  return (

    <div

      className={`

        flex h-full w-full

        items-center justify-center

        bg-blue-950 text-white

        ${className}

      `}

    >

      <BookOpen size={29} />

    </div>

  );

};



const StatusIcon = ({

  type = "success",

}) => {

  const success = type === "success";



  return (

    <div

      className={`

        flex h-12 w-12 shrink-0

        items-center justify-center

        rounded-2xl



        ${

          success

            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"

            : "bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400"

        }

      `}

    >

      {success ? (

        <CheckCircle2 size={25} />

      ) : (

        <AlertCircle size={25} />

      )}

    </div>

  );

};



// ======================================================

// MAIN COMPONENT

// ======================================================



export default function PaymentSuccess() {

  const [searchParams] =

    useSearchParams();



  const token =

    searchParams.get("token");



  const orderId =

    searchParams.get("order");



  // ------------------------------------------

  // STATE

  // ------------------------------------------



  const [theme, setTheme] =

    useState(readTheme);



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



  const [showHelp, setShowHelp] =

    useState(false);



  const downloadLockRef = useRef(false);
  const isDark = theme === "dark";



  // ------------------------------------------

  // THEME EFFECT

  // ------------------------------------------



  useEffect(() => {

    setTheme(readTheme());



    const handleThemeChange = (event) => {

      const next =

        event?.detail?.theme;



      if (

        next === "light" ||

        next === "dark"

      ) {

        setTheme(next);

      }

    };



    const handleStorageChange = (event) => {

      if (event.key === THEME_KEY) {

        setTheme(readTheme());

      }

    };



    window.addEventListener(

      THEME_EVENT,

      handleThemeChange

    );



    window.addEventListener(

      "storage",

      handleStorageChange

    );



    return () => {

      window.removeEventListener(

        THEME_EVENT,

        handleThemeChange

      );



      window.removeEventListener(

        "storage",

        handleStorageChange

      );

    };

  }, []);



  // ------------------------------------------

  // LOAD PURCHASED BOOKS

  // ------------------------------------------



  useEffect(() => {

    if (!token) {

      setError(

        orderId

          ? "Your payment may already be processed. Please use your original access link or contact support."

          : "Book access token is missing."

      );



      setLoading(false);

      return;

    }



    const controller =

      new AbortController();



    const fetchAccess = async () => {

      try {

        setLoading(true);

        setError("");



        const url =

          `${ACCESS_API}?token=${encodeURIComponent(token)}`;



        const response = await fetch(

          url,

          {

            method: "GET",



            headers: {

              Accept: "application/json",

            },



            cache: "no-store",



            signal:

              controller.signal,

          }

        );



        const result =

          await response.json().catch(

            () => null

          );



        if (

          !response.ok ||

          !result?.success ||

          !result?.data

        ) {

          throw new Error(

            result?.message ||

            "Unable to access purchased books."

          );

        }



        const data = result.data;



        const books =

          normalizePurchasedBooks(data);



        if (books.length === 0) {

          throw new Error(

            "No downloadable books were returned. Please contact support."

          );

        }



        // The backend must explicitly confirm a paid order.
      const status = String(data?.payment?.status || "").toUpperCase();
      const amount = Number(data?.payment?.amount);
      if (["SUCCESS", "PAID", "COMPLETED"].includes(status) &&
          data?.orderId && data?.payment?.amount != null &&
          Number.isFinite(amount) && amount >= 0) {
        trackPurchase({
          orderId: String(data.orderId),
          amount,
          currency: data.payment?.currency || "INR",
          bookIds: books.map(book => String(book.id)),
        });
      }

      setPurchase({

          ...data,

          books,

        });



        setSelectedPreviewId(

          books[0].id

        );



        setShowAccessModal(true);

        setAcceptedTerms(false);

        setPdfUnlocked(false);



        // Remove token from browser address bar.

        // The verified data stays in component state.

        window.history.replaceState(

          window.history.state,

          document.title,

          "/payment/success"

        );



      } catch (err) {

        if (

          err?.name === "AbortError"

        ) {

          return;

        }



        console.error(

          "Payment success access error:",

          err

        );



        setError(

          err?.message ||

          "Unable to load your purchased books."

        );

      } finally {

        if (!controller.signal.aborted) {

          setLoading(false);

        }

      }

    };



    fetchAccess();



    return () => {

      controller.abort();

    };

  }, [token, orderId]);



  // ------------------------------------------

  // DERIVED DATA

  // ------------------------------------------



  const books = useMemo(

    () => purchase?.books || [],

    [purchase]

  );



  const totalBooks =

    books.length;



  const isBundle =

    Boolean(purchase?.isBundle) ||

    totalBooks > 1;



  const selectedPreview =

    books.find(

      (item) =>

        item.id === selectedPreviewId

    ) || books[0];



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



  // ------------------------------------------

  // UNLOCK

  // ------------------------------------------



  const handleGetPdf = () => {

    if (!acceptedTerms) {

      return;

    }



    setPdfUnlocked(true);



    setShowAccessModal(false);

  };



  // ------------------------------------------

  // INDIVIDUAL DOWNLOAD

  // ------------------------------------------



  const handleDownloadBook =

    useCallback(

      async (book) => {

        if (!pdfUnlocked || isBusy || downloadLockRef.current) {

          return;

        }



        if (!book?.pdfUrl) {

          setDownloadError(

            "The PDF is currently unavailable."

          );



          return;

        }



        downloadLockRef.current = true;



        try {

          setDownloadingBookId(

            book.id

          );



          setDownloadMessage(

            `Preparing ${book.title}...`

          );



          setDownloadError("");



          const blob =

            await fetchPdfBlob(

              book.pdfUrl

            );



          const fileName =

            getPdfFileName(book);



          const result =

            await saveBlob(

              blob,

              fileName,

              "application/pdf"

            );



          if (result === "cancelled") {

            setDownloadMessage(

              "Save cancelled."

            );

          } else if (result === "shared") {

            setDownloadMessage(

              "Choose Save to Files or your preferred destination."

            );

          } else {

            setDownloadMessage(

              `${book.title}: Download started. Check your Downloads folder.`

            );

          }

        } catch (err) {

          console.error(

            "Book download error:",

            err

          );



          setDownloadError(

            err?.message ||

            "Unable to download this book."

          );



          setDownloadMessage("");

        } finally {

          downloadLockRef.current = false;
        setDownloadingBookId(null);

        }

      },

      [pdfUnlocked, isBusy]

    );



  // ------------------------------------------

  // DOWNLOAD ALL BOOKS

  // ------------------------------------------

  // One book => regular PDF

  // Multiple => ZIP containing every PDF

  // ------------------------------------------



  const handleDownloadAll =

    async () => {

      if (

        !pdfUnlocked ||

        isBusy ||

        downloadLockRef.current ||
      books.length === 0

      ) {

        return;

      }



      if (books.length === 1) {

        await handleDownloadBook(

          books[0]

        );



        return;

      }



      downloadLockRef.current = true;



      try {

        setDownloadingAll(true);



        setDownloadError("");



        setDownloadProgress({

          current: 0,

          total: books.length,

        });



        const zip = new JSZip();



        const usedNames =

          new Set();



        for (

          let index = 0;

          index < books.length;

          index++

        ) {

          const book = books[index];



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

            current: index + 1,

            total: books.length,

          });

        }



        setDownloadMessage(

          "Creating your ZIP file..."

        );



        const zipBlob =

          await zip.generateAsync({

            type: "blob",



            compression: "DEFLATE",



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



        if (result === "cancelled") {

          setDownloadMessage(

            "Save cancelled."

          );

        } else if (result === "shared") {

          setDownloadMessage(

            "Choose Save to Files to keep all your ebooks."

          );

        } else {

          setDownloadMessage(

            `ZIP download started with ${books.length} ebooks.`

          );

        }



      } catch (err) {

        console.error(

          "Download all error:",

          err

        );



        setDownloadError(

          err?.message ||

          "Unable to prepare all ebooks."

        );



        setDownloadMessage("");



      } finally {

        downloadLockRef.current = false;
      setDownloadingAll(false);



        setDownloadProgress({

          current: 0,

          total: 0,

        });

      }

    };



  // ------------------------------------------

  // PREVIEW

  // ------------------------------------------



  const openPreview = (book) => {

    if (!pdfUnlocked) return;



    setSelectedPreviewId(

      book.id

    );



    setShowPreview(true);

  };



  // ------------------------------------------

  // COMMON THEME CLASSES

  // ------------------------------------------



  const pageBg = isDark

    ? "bg-[#080D14]"

    : "bg-[#F6F8FB]";



  const cardBg = isDark

    ? "bg-[#101924]"

    : "bg-white";



  const softBg = isDark

    ? "bg-[#0C131D]"

    : "bg-slate-50";



  const border = isDark

    ? "border-slate-800"

    : "border-slate-200";



  const primaryText = isDark

    ? "text-white"

    : "text-slate-950";



  const secondaryText = isDark

    ? "text-slate-400"

    : "text-slate-500";



  const mutedText = isDark

    ? "text-slate-300"

    : "text-slate-600";



  const primaryButton = `

    inline-flex min-h-[44px]

    items-center justify-center

    gap-2 rounded-xl bg-blue-600

    px-5 py-3 text-sm

    font-bold text-white

    transition hover:bg-blue-700

    disabled:cursor-not-allowed

    disabled:opacity-50

  `;



  const secondaryButton = `

    inline-flex min-h-[44px]

    items-center justify-center

    gap-2 rounded-xl border

    px-5 py-3 text-sm

    font-semibold transition

    disabled:cursor-not-allowed

    disabled:opacity-50

    ${border}

    ${

      isDark

        ? "bg-slate-900 text-slate-200 hover:bg-slate-800"

        : "bg-white text-slate-800 hover:bg-slate-50"

    }

  `;



  // ==========================================

  // LOADING PAGE

  // ==========================================



  if (loading) {

    return (

      <main

        className={`

          flex min-h-screen items-center

          justify-center px-4

          ${pageBg}

        `}

      >

        <div className="text-center">

          <div

            className="

              mx-auto flex h-16 w-16

              items-center justify-center

              rounded-2xl bg-blue-500/10

            "

          >

            <Loader2

              size={30}

              className="animate-spin text-blue-500"

            />

          </div>



          <h1

            className={`

              mt-5 text-xl font-bold

              ${primaryText}

            `}

          >

            Preparing your purchase

          </h1>



          <p

            className={`

              mt-2 text-sm

              ${secondaryText}

            `}

          >

            Verifying your secure ebook access...

          </p>

        </div>

      </main>

    );

  }



  // ==========================================

  // ERROR PAGE

  // ==========================================



  if (error || !purchase) {

    return (

      <main

        className={`

          flex min-h-screen items-center

          justify-center px-4 py-20

          ${pageBg}

        `}

      >

        <div

          className={`

            w-full max-w-md rounded-3xl

            border p-7 text-center

            shadow-sm

            ${border} ${cardBg}

          `}

        >

          <div className="flex justify-center">

            <StatusIcon type="error" />

          </div>



          <h1

            className={`

              mt-5 text-2xl font-bold

              ${primaryText}

            `}

          >

            Unable to open ebooks

          </h1>



          <p

            className={`

              mt-3 text-sm leading-6

              ${secondaryText}

            `}

          >

            {error}

          </p>



          <div

            className={`

              mt-6 rounded-xl p-4

              text-left text-sm leading-6

              ${softBg} ${mutedText}

            `}

          >

            If your payment was deducted, please

            do not pay again. Contact our support

            team with your order ID.

          </div>



          {orderId && (

            <p

              className={`

                mt-4 break-all text-xs

                ${secondaryText}

              `}

            >

              Order: {orderId}

            </p>

          )}



          <a

            href={`mailto:${SUPPORT_EMAIL}`}

            className={`

              ${primaryButton}

              mt-6 w-full

            `}

          >

            <Mail size={17} />

            Contact Support

          </a>



          <Link

            to="/books"

            className={`

              ${secondaryButton}

              mt-3 w-full

            `}

          >

            Browse Books

          </Link>

        </div>

      </main>

    );

  }



  // ==========================================

  // SUCCESS PAGE

  // ==========================================



  return (

    <>

      <main

        className={`

          min-h-screen w-full

          px-4 pb-16 pt-20

          sm:px-6 sm:pt-24

          lg:px-8

          ${pageBg}

        `}

      >

        <div className="mx-auto max-w-6xl">



          {/* ====================================

              PAYMENT SUCCESS HEADER

          \==================================== */}



          <section

            className={`

              relative overflow-hidden

              rounded-3xl border

              p-5 sm:p-7

              ${

                isDark

                  ? "border-emerald-900/60 bg-emerald-950/20"

                  : "border-emerald-200 bg-emerald-50"

              }

            `}

          >

            <div

              className="

                relative flex flex-col

                gap-5 sm:flex-row

                sm:items-center

                sm:justify-between

              "

            >

              <div className="flex items-start gap-4">

                <StatusIcon />



                <div>

                  <p

                    className={`

                      text-xs font-bold

                      uppercase tracking-widest

                      ${

                        isDark

                          ? "text-emerald-400"

                          : "text-emerald-700"

                      }

                    `}

                  >

                    Purchase confirmed

                  </p>



                  <h1

                    className={`

                      mt-1 text-2xl

                      font-extrabold

                      sm:text-3xl

                      ${

                        isDark

                          ? "text-emerald-100"

                          : "text-emerald-950"

                      }

                    `}

                  >

                    Payment Successful!

                  </h1>



                  <p

                    className={`

                      mt-2 text-sm leading-6

                      ${

                        isDark

                          ? "text-emerald-300"

                          : "text-emerald-800"

                      }

                    `}

                  >

                    Your payment has been verified.

                    {" "}

                    {totalBooks === 1

                      ? "Your ebook is ready."

                      : `All ${totalBooks} ebooks are ready.`}

                  </p>

                </div>

              </div>



              <div

                className={`

                  flex w-fit items-center

                  gap-2 rounded-full

                  border px-4 py-2

                  text-xs font-bold

                  ${

                    isDark

                      ? "border-emerald-800 bg-emerald-950 text-emerald-300"

                      : "border-emerald-200 bg-white text-emerald-700"

                  }

                `}

              >

                <ShieldCheck size={15} />

                Payment verified

              </div>

            </div>

          </section>



          {/* ====================================

              ORDER OVERVIEW

          \==================================== */}



          <section

            className={`

              mt-5 rounded-2xl border

              p-5 shadow-sm

              ${border} ${cardBg}

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

              <div className="min-w-0">

                <p

                  className={`

                    text-xs font-semibold

                    uppercase tracking-wider

                    ${secondaryText}

                  `}

                >

                  Your purchase

                </p>



                <h2

                  className={`

                    mt-1 text-lg font-bold

                    ${primaryText}

                  `}

                >

                  {productTitle}

                </h2>



                {purchase.orderId && (

                  <p

                    className={`

                      mt-2 break-all text-xs

                      ${secondaryText}

                    `}

                  >

                    Order ID: {purchase.orderId}

                  </p>

                )}

              </div>



              <div className="flex flex-wrap gap-3">

                <div

                  className={`

                    rounded-xl px-4 py-3

                    ${softBg}

                  `}

                >

                  <p

                    className={`

                      text-xs ${secondaryText}

                    `}

                  >

                    Books

                  </p>



                  <p

                    className={`

                      mt-1 text-lg font-bold

                      ${primaryText}

                    `}

                  >

                    {totalBooks}

                  </p>

                </div>



                {paymentAmount !== null && (

                  <div

                    className={`

                      rounded-xl px-4 py-3

                      ${softBg}

                    `}

                  >

                    <p

                      className={`

                        text-xs ${secondaryText}

                      `}

                    >

                      Amount paid

                    </p>



                    <p

                      className={`

                        mt-1 text-lg font-bold

                        ${primaryText}

                      `}

                    >

                      {formatCurrency(

                        paymentAmount,

                        currency

                      )}

                    </p>

                  </div>

                )}



                {isBundle && (

                  <div

                    className={`

                      flex items-center

                      gap-2 rounded-xl

                      px-4 py-3 ${softBg}

                    `}

                  >

                    <Package

                      size={18}

                      className="text-blue-500"

                    />



                    <span

                      className={`

                        text-sm font-bold

                        ${primaryText}

                      `}

                    >

                      Bundle

                    </span>

                  </div>

                )}

              </div>

            </div>

          </section>



          {/* ====================================

              DOWNLOAD ACCESS WARNING

          \==================================== */}



          <section

            className={`

              mt-5 rounded-2xl

              border p-4

              ${

                isDark

                  ? "border-amber-900/50 bg-amber-950/20"

                  : "border-amber-200 bg-amber-50"

              }

            `}

          >

            <div className="flex items-start gap-3">

              <AlertTriangle

                size={20}

                className="mt-0.5 shrink-0 text-amber-500"

              />



              <div className="flex-1">

                <h3

                  className={`

                    text-sm font-bold

                    ${

                      isDark

                        ? "text-amber-200"

                        : "text-amber-900"

                    }

                  `}

                >

                  Important — Save your books now

                </h3>



                <p

                  className={`

                    mt-1 text-sm leading-6

                    ${

                      isDark

                        ? "text-amber-300/80"

                        : "text-amber-800"

                    }

                  `}

                >

                  Your download access is temporary.

                  Please save all purchased PDFs to

                  your device before leaving or

                  refreshing this page.

                </p>



                {purchase.expiresAt && (

                  <div

                    className={`

                      mt-3 inline-flex items-center

                      gap-2 text-xs font-semibold

                      ${

                        isDark

                          ? "text-amber-300"

                          : "text-amber-800"

                      }

                    `}

                  >

                    <Clock3 size={15} />



                    Access expires:{" "}

                    {formatDate(purchase.expiresAt)}

                  </div>

                )}

              </div>

            </div>

          </section>



          {/* ====================================

              BOOK LIST

          \==================================== */}



          <section

            className={`

              mt-5 overflow-hidden

              rounded-3xl border

              shadow-sm

              ${border} ${cardBg}

            `}

          >

            {/* SECTION HEADER */}



            <div

              className={`

                flex flex-col gap-4

                border-b p-5

                sm:flex-row

                sm:items-center

                sm:justify-between

                sm:p-6

                ${border}

              `}

            >

              <div>

                <div className="flex items-center gap-2">

                  <BookOpen

                    size={21}

                    className="text-blue-500"

                  />



                  <h2

                    className={`

                      text-xl font-bold

                      ${primaryText}

                    `}

                  >

                    Your Purchased Books

                  </h2>

                </div>



                <p

                  className={`

                    mt-2 text-sm

                    ${secondaryText}

                  `}

                >

                  {totalBooks === 1

                    ? "Download your ebook below."

                    : `${totalBooks} ebooks included in your purchase. Download them individually or all together.`}

                </p>

              </div>



              <div

                className={`

                  inline-flex w-fit

                  items-center gap-2

                  rounded-full px-3 py-2

                  text-xs font-bold

                  ${

                    isDark

                      ? "bg-blue-950/40 text-blue-300"

                      : "bg-blue-50 text-blue-700"

                  }

                `}

              >

                <FileCheck2 size={15} />

                {totalBooks} available

              </div>

            </div>



            {/* BOOK ROWS */}



            <div

              className={`

                divide-y

                ${

                  isDark

                    ? "divide-slate-800"

                    : "divide-slate-100"

                }

              `}

            >

              {books.map((book, index) => {

                const isDownloading =

                  downloadingBookId === book.id;



                return (

                  <article

                    key={`${book.id}-${index}`}

                    className="

                      p-4 sm:p-6

                    "

                  >

                    <div

                      className="

                        flex flex-col gap-5

                        sm:flex-row

                        sm:items-center

                      "

                    >

                      {/* BOOK COVER */}



                      <div

                        className={`

                          relative h-36 w-24

                          shrink-0 overflow-hidden

                          rounded-xl border

                          shadow-sm sm:h-40

                          sm:w-28

                          ${border}

                        `}

                      >

                        <BookCover book={book} />



                        <div

                          className="

                            absolute bottom-0

                            right-0 rounded-tl-lg

                            bg-slate-950/80

                            px-2 py-1

                            text-[10px]

                            font-semibold text-white

                          "

                        >

                          PDF

                        </div>

                      </div>



                      {/* BOOK INFORMATION */}



                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span

                            className={`

                              inline-flex rounded-md

                              px-2 py-1

                              text-[10px] font-bold

                              ${

                                isDark

                                  ? "bg-slate-800 text-slate-300"

                                  : "bg-slate-100 text-slate-600"

                              }

                            `}

                          >

                            BOOK {index + 1}

                          </span>



                          <span

                            className="

                              inline-flex items-center

                              gap-1 rounded-md

                              bg-emerald-500/10

                              px-2 py-1

                              text-[10px]

                              font-bold

                              text-emerald-600

                            "

                          >

                            <Check size={12} />

                            Purchased

                          </span>

                        </div>



                        <h3

                          className={`

                            mt-3 text-base

                            font-bold leading-snug

                            sm:text-lg

                            ${primaryText}

                          `}

                        >

                          {book.title}

                        </h3>



                        {book.subtitle && (

                          <p

                            className={`

                              mt-1 text-sm

                              ${secondaryText}

                            `}

                          >

                            {book.subtitle}

                          </p>

                        )}



                        {book.description && (

                          <p

                            className={`

                              mt-2 line-clamp-2

                              text-sm leading-6

                              ${secondaryText}

                            `}

                          >

                            {book.description}

                          </p>

                        )}



                        <div

                          className={`

                            mt-3 flex flex-wrap

                            items-center gap-3

                            text-xs

                            ${secondaryText}

                          `}

                        >

                          <span className="flex items-center gap-1.5">

                            <FileText size={14} />

                            PDF eBook

                          </span>



                          <span className="flex items-center gap-1.5">

                            <ShieldCheck size={14} />

                            Purchase verified

                          </span>

                        </div>

                      </div>



                      {/* DOWNLOAD ACTIONS */}



                      <div

                        className="

                          flex w-full flex-col

                          gap-2 sm:w-auto

                          sm:min-w-[175px]

                        "

                      >

                        <button

                          type="button"

                          onClick={() =>

                            handleDownloadBook(book)

                          }

                          disabled={

                            !pdfUnlocked ||

                            isBusy ||

                            !book.pdfUrl

                          }

                          className={`

                            ${primaryButton}

                            w-full

                          `}

                        >

                          {isDownloading ? (

                            <Loader2

                              size={17}

                              className="animate-spin"

                            />

                          ) : (

                            <Download size={17} />

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

                          disabled={!pdfUnlocked}

                          className={`

                            ${secondaryButton}

                            w-full

                          `}

                        >

                          <BookOpen size={16} />

                          Preview PDF

                        </button>

                      </div>

                    </div>

                  </article>

                );

              })}

            </div>



            {/* DOWNLOAD ALL FOOTER */}



            <div

              className={`

                border-t p-5

                sm:p-6 ${border}

                ${

                  isDark

                    ? "bg-[#0C1520]"

                    : "bg-[#F8FAFC]"

                }

              `}

            >

              <div

                className="

                  flex flex-col gap-4

                  md:flex-row

                  md:items-center

                  md:justify-between

                "

              >

                <div className="flex items-start gap-3">

                  <div

                    className={`

                      flex h-11 w-11

                      shrink-0 items-center

                      justify-center rounded-xl

                      ${

                        isDark

                          ? "bg-blue-950/50 text-blue-400"

                          : "bg-blue-100 text-blue-700"

                      }

                    `}

                  >

                    <FileArchive size={21} />

                  </div>



                  <div>

                    <h3

                      className={`

                        text-base font-bold

                        ${primaryText}

                      `}

                    >

                      {totalBooks > 1

                        ? "Download all books together"

                        : "Save your purchased ebook"}

                    </h3>



                    <p

                      className={`

                        mt-1 text-sm

                        leading-6

                        ${secondaryText}

                      `}

                    >

                      {totalBooks > 1

                        ? `Get all ${totalBooks} PDF ebooks in a single ZIP file.`

                        : "Save a permanent PDF copy to your device."}

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

                    md:min-w-[225px]

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



              {/* ZIP PROGRESS */}



              {downloadingAll && (

                <div className="mt-5">

                  <div

                    className={`

                      flex justify-between

                      text-xs font-semibold

                      ${secondaryText}

                    `}

                  >

                    <span>

                      Preparing books

                    </span>



                    <span>

                      {downloadProgress.current}

                      {" / "}

                      {downloadProgress.total}

                    </span>

                  </div>



                  <div

                    className={`

                      mt-2 h-2 w-full

                      overflow-hidden

                      rounded-full

                      ${

                        isDark

                          ? "bg-slate-800"

                          : "bg-slate-200"

                      }

                    `}

                  >

                    <div

                      className="

                        h-full rounded-full

                        bg-blue-600

                        transition-all

                        duration-300

                      "

                      style={{

                        width: `${

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

                    mt-4 rounded-xl

                    border p-3

                    text-sm

                    ${border}

                    ${softBg}

                    ${mutedText}

                  `}

                >

                  <div className="flex items-start gap-2">

                    <CheckCircle2

                      size={17}

                      className="mt-0.5 shrink-0 text-emerald-500"

                    />



                    <span>

                      {downloadMessage}

                    </span>

                  </div>

                </div>

              )}



              {downloadError && (

                <div

                  role="alert"

                  className={`

                    mt-4 rounded-xl

                    border p-3 text-sm

                    ${

                      isDark

                        ? "border-red-900 bg-red-950/30 text-red-300"

                        : "border-red-200 bg-red-50 text-red-700"

                    }

                  `}

                >

                  <div className="flex items-start gap-2">

                    <AlertCircle

                      size={17}

                      className="mt-0.5 shrink-0"

                    />

                    <span>{downloadError}</span>

                  </div>

                </div>

              )}

            </div>

          </section>



          {/* ====================================

              PDF PREVIEW

          \==================================== */}



          {pdfUnlocked && showPreview && (

            <section

              className={`

                mt-5 overflow-hidden

                rounded-3xl border

                ${border} ${cardBg}

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

                  <h3

                    className={`

                      text-lg font-bold

                      ${primaryText}

                    `}

                  >

                    PDF Viewer

                  </h3>



                  <p

                    className={`

                      mt-1 text-sm

                      ${secondaryText}

                    `}

                  >

                    {selectedPreview?.title}

                  </p>

                </div>



                <button

                  type="button"

                  onClick={() =>

                    setShowPreview(false)

                  }

                  className={secondaryButton}

                >

                  <X size={16} />

                  Close Viewer

                </button>

              </div>



              {books.length > 1 && (

                <div

                  className={`

                    flex flex-wrap gap-2

                    border-b p-4

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

                        rounded-lg px-4 py-2

                        text-xs font-bold

                        transition

                        ${

                          selectedPreviewId ===

                          book.id

                            ? "bg-blue-600 text-white"

                            : isDark

                              ? "bg-slate-800 text-slate-300"

                              : "bg-slate-100 text-slate-700"

                        }

                      `}

                    >

                      {book.title}

                    </button>

                  ))}

                </div>

              )}



              {selectedPreview?.pdfUrl ? (

                <iframe

                  key={selectedPreview.id}

                  src={selectedPreview.pdfUrl}

                  title={selectedPreview.title}

                  className="

                    h-[65vh]

                    min-h-[420px]

                    w-full border-0

                    sm:h-[75vh]

                  "

                />

              ) : (

                <div

                  className={`

                    p-8 text-center

                    ${secondaryText}

                  `}

                >

                  PDF preview unavailable.

                </div>

              )}



              <div

                className={`

                  border-t p-4

                  text-xs leading-5

                  ${border}

                  ${secondaryText}

                `}

              >

                The viewer is for reading your

                purchased PDF. Use Download PDF

                to save a local copy.

              </div>

            </section>

          )}



          {/* ====================================

              HOW TO SAVE YOUR BOOKS

          \==================================== */}



          <section

            className={`

              mt-5 rounded-3xl

              border p-5

              sm:p-6

              ${border} ${cardBg}

            `}

          >

            <h2

              className={`

                flex items-center

                gap-2 text-lg font-bold

                ${primaryText}

              `}

            >

              <Smartphone

                size={21}

                className="text-blue-500"

              />



              How to save your ebooks

            </h2>



            <div

              className="

                mt-5 grid gap-4

                md:grid-cols-3

              "

            >

              {[

                {

                  number: "01",

                  title: "Choose your books",

                  text:

                    "Download any book individually or use Download All to get the complete bundle.",

                },

                {

                  number: "02",

                  title: "Save to your device",

                  text:

                    "On desktop, check Downloads. On iPhone or iPad, choose Save to Files.",

                },

                {

                  number: "03",

                  title: "Keep your copy",

                  text:

                    "Save the PDFs somewhere safe so you can read them after temporary access expires.",

                },

              ].map((step) => (

                <div

                  key={step.number}

                  className={`

                    rounded-2xl

                    border p-4

                    ${border} ${softBg}

                  `}

                >

                  <span

                    className="

                      text-sm font-bold

                      text-blue-500

                    "

                  >

                    {step.number}

                  </span>



                  <h3

                    className={`

                      mt-2 text-sm

                      font-bold

                      ${primaryText}

                    `}

                  >

                    {step.title}

                  </h3>



                  <p

                    className={`

                      mt-2 text-xs

                      leading-6

                      ${secondaryText}

                    `}

                  >

                    {step.text}

                  </p>

                </div>

              ))}

            </div>

          </section>



          {/* ====================================

              SUPPORT

          \==================================== */}



          <section

            className={`

              mt-5 overflow-hidden

              rounded-2xl border

              ${border} ${cardBg}

            `}

          >

            <button

              type="button"

              onClick={() =>

                setShowHelp(!showHelp)

              }

              className="

                flex w-full items-center

                justify-between gap-4

                p-5 text-left

              "

            >

              <div className="flex items-center gap-3">

                <HelpCircle

                  size={21}

                  className="text-blue-500"

                />



                <div>

                  <h3

                    className={`

                      text-sm font-bold

                      ${primaryText}

                    `}

                  >

                    Need help with downloads?

                  </h3>



                  <p

                    className={`

                      mt-1 text-xs

                      ${secondaryText}

                    `}

                  >

                    Troubleshooting and support

                  </p>

                </div>

              </div>



              {showHelp ? (

                <ChevronUp size={18} />

              ) : (

                <ChevronDown size={18} />

              )}

            </button>



            {showHelp && (

              <div

                className={`

                  border-t p-5

                  ${border}

                `}

              >

                <p

                  className={`

                    text-sm leading-7

                    ${mutedText}

                  `}

                >

                  If your PDF doesn't download,

                  check your browser's download

                  permissions. If the ZIP downloads

                  successfully, extract it to access

                  each PDF separately.

                </p>



                <p

                  className={`

                    mt-3 text-sm

                    ${mutedText}

                  `}

                >

                  If you still face an issue,

                  contact us with your order ID.

                </p>



                <a

                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(

                    `Book Download Support - ${purchase.orderId || "Order"}`

                  )}`}

                  className={`

                    ${secondaryButton}

                    mt-4

                  `}

                >

                  <Mail size={17} />

                  Email Support

                </a>

              </div>

            )}

          </section>



          {/* ====================================

              BOTTOM NAVIGATION

          \==================================== */}



          <div

            className="

              mt-8 flex flex-col

              items-center gap-4

              sm:flex-row

              sm:justify-between

            "

          >

            <div

              className={`

                flex items-center gap-2

                text-xs ${secondaryText}

              `}

            >

              <LockKeyhole size={14} />

              Secure digital delivery

            </div>



            <Link

              to="/books"

              className={`

                inline-flex items-center

                gap-2 text-sm font-bold

                text-blue-500

                hover:text-blue-600

              `}

            >

              Explore More Books

              <ArrowRight size={17} />

            </Link>

          </div>

        </div>

      </main>



      {/* ======================================

          ACCESS CONFIRMATION MODAL

      \====================================== */}



      {showAccessModal && !pdfUnlocked && (

        <div

          className="

            fixed inset-0 z-[9999]

            flex items-center

            justify-center

            bg-slate-950/75

            p-4 backdrop-blur-sm

          "

        >

          <div

            role="dialog"

            aria-modal="true"

            aria-labelledby="access-modal-title"

            className={`

              w-full max-w-lg

              overflow-hidden

              rounded-3xl border

              shadow-2xl

              ${border} ${cardBg}

            `}

          >

            <div className="p-6 sm:p-7">

              <div

                className="

                  flex h-13 w-13

                  items-center justify-center

                  rounded-2xl bg-blue-500/10

                  text-blue-500

                "

              >

                <ShieldCheck size={27} />

              </div>



              <h2

                id="access-modal-title"

                className={`

                  mt-5 text-xl font-bold

                  ${primaryText}

                `}

              >

                Your books are ready

              </h2>



              <p

                className={`

                  mt-2 text-sm leading-6

                  ${secondaryText}

                `}

              >

                You have successfully purchased{" "}

                <strong>{totalBooks}</strong>

                {" "}

                {totalBooks === 1

                  ? "ebook"

                  : "ebooks"}.

                Please review these instructions

                before accessing your files.

              </p>



              <div

                className={`

                  mt-5 rounded-2xl

                  border p-4

                  ${border} ${softBg}

                `}

              >

                <div className="space-y-3">

                  {[

                    "Save your PDFs before the access link expires.",

                    "Keep a backup on your device or personal drive.",

                    "For bundles, download individual PDFs or the full ZIP.",

                    "Purchased files are for your personal use; do not redistribute them.",

                  ].map((item, index) => (

                    <div

                      key={index}

                      className="

                        flex items-start

                        gap-3

                      "

                    >

                      <CheckCircle2

                        size={16}

                        className="

                          mt-0.5 shrink-0

                          text-blue-500

                        "

                      />



                      <span

                        className={`

                          text-sm leading-5

                          ${mutedText}

                        `}

                      >

                        {item}

                      </span>

                    </div>

                  ))}

                </div>

              </div>



              <label

                className="

                  mt-5 flex cursor-pointer

                  items-start gap-3

                "

              >

                <input

                  type="checkbox"

                  checked={acceptedTerms}

                  onChange={(event) =>

                    setAcceptedTerms(

                      event.target.checked

                    )

                  }

                  className="

                    mt-1 h-4 w-4

                    accent-blue-600

                  "

                />



                <span

                  className={`

                    text-sm leading-6

                    ${mutedText}

                  `}

                >

                  I understand that this access is

                  temporary and I need to save my

                  ebooks to my device.

                </span>

              </label>



              <button

                type="button"

                onClick={handleGetPdf}

                disabled={!acceptedTerms}

                className={`

                  ${primaryButton}

                  mt-6 w-full

                `}

              >

                <Download size={18} />

                Access My{" "}

                {totalBooks === 1

                  ? "Book"

                  : `${totalBooks} Books`}

                <ArrowRight size={17} />

              </button>



              <p

                className={`

                  mt-3 text-center

                  text-xs

                  ${secondaryText}

                `}

              >

                Your payment has already been

                completed. No additional payment

                is required.

              </p>

            </div>

          </div>

        </div>

      )}

    </>

  );

}
