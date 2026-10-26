// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import { Helmet } from "react-helmet-async";
// import { useNavigate, useParams } from "react-router-dom";
// import { useSelector } from "react-redux";
// import toast, { Toaster } from "react-hot-toast";

// import {
//   AlertCircle,
//   ArrowLeft,
//   BookOpen,
//   Check,
//   CheckCircle2,
//   CircleDollarSign,
//   CreditCard,
//   Edit3,
//   ExternalLink,
//   Eye,
//   FileText,
//   Layers3,
//   Loader2,
//   Package,
//   Plus,
//   Receipt,
//   RefreshCw,
//   Save,
//   Search,
//   ShieldCheck,
//   Sparkles,
//   Trash2,
//   Upload,
//   Users,
//   WalletCards,
//   X,
//   XCircle,
// } from "lucide-react";

// import BASE_URL from "../utils/Url";

// // =====================================================
// // CONFIGURATION
// // =====================================================

// const API = String(BASE_URL || "").replace(/\/+$/, "");

// const THEME_KEY = "theme";
// const THEME_EVENT = "targettrek-theme-change";

// const RESOURCE_TYPES = [
//   "pdf",
//   "ebook",
//   "course",
//   "bundle",
//   "template",
//   "notes",
//   "other",
// ];

// const EMPTY_FORM = {
//   title: "",
//   slug: "",
//   subtitle: "",
//   description: "",
//   resourceType: "ebook",
//   price: "",
//   mrp: "",
//   currency: "INR",
//   paymentUrl: "",
//   redirectUrl: "",
//   pageKey: "",
//   fileName: "",
//   tags: "",
//   topics: "",
//   category: "",
//   highlights: "",
//   badge: "",
//   isPublished: false,
//   isActive: true,
//   isFeatured: false,
// };

// const EMPTY_SUMMARY = {
//   totalOrders: 0,
//   totalOrderAmount: 0,

//   payments: {
//     paidOrders: 0,
//     successfulPayments: 0,
//     failedPayments: 0,
//     pendingPayments: 0,
//     cancelledPayments: 0,
//     fullyRefundedPayments: 0,
//     partiallyRefundedPayments: 0,
//     successfulAmount: 0,
//     failedAmount: 0,
//     pendingAmount: 0,
//     cancelledAmount: 0,
//     grossPaidAmount: 0,
//     netRevenue: 0,
//   },

//   refunds: {
//     refundOrders: 0,
//     pendingRefunds: 0,
//     processingRefunds: 0,
//     partialRefunds: 0,
//     completedRefunds: 0,
//     failedRefunds: 0,
//     cancelledRefunds: 0,
//     totalRefundRequestedAmount: 0,
//     totalRefundedAmount: 0,
//     totalRefundRemainingAmount: 0,
//   },

//   coupons: {
//     couponAppliedOrders: 0,
//     totalDiscountAmount: 0,
//     originalAmount: 0,
//     finalAmount: 0,
//   },

//   reminderMails: {
//     totalSent: 0,
//     ordersWithReminderMail: 0,
//     lastStatusSent: 0,
//     lastStatusFailed: 0,
//     firstMailSentAt: null,
//     lastMailSentAt: null,
//   },

//   access: {
//     totalAccessCount: 0,
//     revokedAccessOrders: 0,
//   },

//   verification: {
//     callbackHashVerified: 0,
//     payuVerified: 0,
//     amountVerified: 0,
//   },

//   affiliates: {
//     affiliateOrders: 0,
//   },
// };

// const EMPTY_BREAKDOWN = {
//   paymentStatus: [],
//   orderStatus: [],
//   refundStatus: [],
//   coupons: [],
//   affiliates: [],
// };

// // =====================================================
// // HELPERS
// // =====================================================

// const readTheme = () => {
//   if (typeof window === "undefined") {
//     return "light";
//   }

//   try {
//     return localStorage.getItem(THEME_KEY) === "dark"
//       ? "dark"
//       : "light";
//   } catch {
//     return "light";
//   }
// };

// const money = (value, currency = "INR") => {
//   if (value === null || value === undefined || value === "") {
//     return "—";
//   }

//   const number = Number(value);

//   if (!Number.isFinite(number)) return "—";

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

// const formatDate = (value) => {
//   if (!value) return "—";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) return "—";

//   return date.toLocaleString("en-IN", {
//     dateStyle: "medium",
//     timeStyle: "short",
//   });
// };

// const toArrayString = (value) =>
//   Array.isArray(value) ? value.join(", ") : "";

// const toArray = (value) =>
//   String(value || "")
//     .split(",")
//     .map((item) => item.trim())
//     .filter(Boolean);

// const getId = (value) => {
//   if (!value) return "";

//   if (typeof value === "string") return value;

//   return String(value._id || value.id || "");
// };

// const normalizeBook = (book) => {
//   if (!book) return null;

//   const id = getId(book);

//   if (!id) return null;

//   return {
//     ...book,
//     _id: id,
//     title: book.title || "Untitled Book",
//     resourceType: book.resourceType || "ebook",
//     coverPageUrl: book.coverPageUrl || "",
//     price: Number(book.price) || 0,
//     mrp: Number(book.mrp) || 0,
//     currency: book.currency || "INR",
//   };
// };

// const createFormFromBook = (book) => ({
//   title: book?.title || "",
//   slug: book?.slug || "",
//   subtitle: book?.subtitle || "",
//   description: book?.description || "",
//   resourceType: book?.resourceType || "ebook",
//   price: String(book?.price ?? ""),
//   mrp: String(book?.mrp ?? ""),
//   currency: book?.currency || "INR",
//   paymentUrl: book?.paymentUrl || "",
//   redirectUrl: book?.redirectUrl || "",
//   pageKey: book?.pageKey || "",
//   fileName: book?.fileName || "",
//   tags: toArrayString(book?.tags),
//   topics: toArrayString(book?.topics),
//   category: book?.category || "",
//   highlights: toArrayString(book?.highlights),
//   badge: book?.badge || "",
//   isPublished: book?.isPublished === true,
//   isActive: book?.isActive !== false,
//   isFeatured: book?.isFeatured === true,
// });

// const getErrorMessage = (result, fallback) =>
//   result?.error?.message ||
//   (typeof result?.error === "string" ? result.error : null) ||
//   result?.message ||
//   fallback;

// const isValidHttpUrl = (value) => {
//   try {
//     return ["http:", "https:"].includes(
//       new URL(value).protocol
//     );
//   } catch {
//     return false;
//   }
// };

// const isValidPath = (value) =>
//   /^\/(?!\/)[^\r\n\\]+$/.test(String(value || ""));

// const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// // =====================================================
// // MAIN COMPONENT
// // =====================================================

// export default function AdminBookDetails() {
//   const navigate = useNavigate();
//   const { bookId } = useParams();

//   const token = useSelector((state) => state.auth.token);

//   // THEME
//   const [theme, setTheme] = useState(readTheme);
//   const dark = theme === "dark";

//   // BOOK
//   const [book, setBook] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notFound, setNotFound] = useState(false);

//   // ANALYTICS
//   const [summary, setSummary] = useState(EMPTY_SUMMARY);
//   const [breakdown, setBreakdown] = useState(EMPTY_BREAKDOWN);
//   const [summaryLoading, setSummaryLoading] = useState(true);
//   const [summaryError, setSummaryError] = useState("");

//   // EDIT FORM
//   const [editMode, setEditMode] = useState(false);
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [originalForm, setOriginalForm] = useState(EMPTY_FORM);
//   const [errors, setErrors] = useState({});
//   const [updating, setUpdating] = useState(false);

//   // FILES
//   const [coverFile, setCoverFile] = useState(null);
//   const [pdfFile, setPdfFile] = useState(null);
//   const [coverPreview, setCoverPreview] = useState("");

//   const coverInputRef = useRef(null);
//   const pdfInputRef = useRef(null);
//   const previewObjectUrlRef = useRef("");

//   // BUNDLE BOOKS
//   const [availableBooks, setAvailableBooks] = useState([]);
//   const [availableLoading, setAvailableLoading] = useState(false);
//   const [availableError, setAvailableError] = useState("");
//   const [bookSearch, setBookSearch] = useState("");
//   const [selectedBookIds, setSelectedBookIds] = useState([]);
//   const [originalBookIds, setOriginalBookIds] = useState([]);

//   // DELETE
//   const [deleteModal, setDeleteModal] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   // ===================================================
//   // THEME SYNC
//   // ===================================================

//   useEffect(() => {
//     const syncTheme = (event) => {
//       const next = event?.detail?.theme;

//       if (next === "dark" || next === "light") {
//         setTheme(next);
//       } else {
//         setTheme(readTheme());
//       }
//     };

//     const handleStorage = (event) => {
//       if (!event || event.key === THEME_KEY) {
//         setTheme(readTheme());
//       }
//     };

//     setTheme(readTheme());

//     window.addEventListener(THEME_EVENT, syncTheme);
//     window.addEventListener("storage", handleStorage);
//     window.addEventListener("focus", syncTheme);

//     // Changes made through this hook below can be
//     // observed even when localStorage.setItem is
//     // called by the navbar without dispatching an event.
//     // Same-tab storage events are NOT emitted natively.
//     const originalSetItem = Storage.prototype.setItem;

//     const patchedSetItem = function (key, value) {
//       originalSetItem.call(this, key, value);

//       if (
//         this === window.localStorage &&
//         key === THEME_KEY
//       ) {
//         window.dispatchEvent(
//           new CustomEvent(THEME_EVENT, {
//             detail: {
//               theme: value,
//             },
//           })
//         );
//       }
//     };

//     Storage.prototype.setItem = patchedSetItem;

//     return () => {
//       window.removeEventListener(THEME_EVENT, syncTheme);
//       window.removeEventListener("storage", handleStorage);
//       window.removeEventListener("focus", syncTheme);

//       if (Storage.prototype.setItem === patchedSetItem) {
//         Storage.prototype.setItem = originalSetItem;
//       }
//     };
//   }, []);

//   // ===================================================
//   // THEME CLASSES
//   // ===================================================

//   const ui = useMemo(
//     () => ({
//       page: dark
//         ? "bg-[#080D14] text-slate-100"
//         : "bg-[#F6F8FC] text-slate-900",

//       card: dark
//         ? "bg-[#111B29] border-slate-800"
//         : "bg-white border-slate-200",

//       soft: dark
//         ? "bg-[#0C1520]"
//         : "bg-slate-50",

//       text: dark
//         ? "text-slate-100"
//         : "text-slate-950",

//       secondary: dark
//         ? "text-slate-400"
//         : "text-slate-500",

//       border: dark
//         ? "border-slate-800"
//         : "border-slate-200",

//       input: dark
//         ? "bg-[#0C1520] text-white border-slate-700 placeholder:text-slate-500"
//         : "bg-white text-slate-900 border-slate-200 placeholder:text-slate-400",

//       buttonSecondary: dark
//         ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
//         : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",

//       selected: dark
//         ? "border-blue-500 bg-blue-950/30"
//         : "border-blue-500 bg-blue-50",

//       hover: dark
//         ? "hover:bg-slate-800/60"
//         : "hover:bg-slate-50",
//     }),
//     [dark]
//   );

//   const panelClass = `rounded-2xl border p-5 sm:p-6 shadow-sm ${ui.card}`;

//   const inputClass = `
//     w-full rounded-xl border px-3.5 py-3
//     text-sm outline-none transition
//     focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
//     ${ui.input}
//   `;

//   const secondaryButton = `
//     inline-flex items-center justify-center gap-2
//     rounded-xl border px-4 py-2.5 text-sm
//     font-semibold transition
//     ${ui.buttonSecondary}
//   `;

//   const primaryButton = `
//     inline-flex items-center justify-center gap-2
//     rounded-xl bg-blue-600 px-5 py-2.5
//     text-sm font-bold text-white transition
//     hover:bg-blue-700 disabled:opacity-50
//     disabled:cursor-not-allowed
//   `;

//   const isBundle = book?.resourceType === "bundle";
//   const editingBundle = form.resourceType === "bundle";

//   // ===================================================
//   // AUTHORIZED FETCH HELPER
//   // ===================================================

//   const getHeaders = useCallback(
//     () => ({
//       Accept: "application/json",
//       Authorization: `Bearer ${token}`,
//     }),
//     [token]
//   );

//   // ===================================================
//   // GET BOOK DETAILS
//   // ===================================================

//   const fetchBook = useCallback(
//     async (signal) => {
//       try {
//         setLoading(true);
//         setError("");
//         setNotFound(false);

//         if (!bookId) {
//           setNotFound(true);
//           return;
//         }

//         if (!token) {
//           throw new Error(
//             "Authentication token missing. Please log in again."
//           );
//         }

//         const response = await fetch(
//           `${API}/book/admin/${encodeURIComponent(bookId)}`,
//           {
//             method: "GET",
//             headers: getHeaders(),
//             signal,
//           }
//         );

//         const result = await response.json().catch(() => null);

//         if (response.status === 404) {
//           setNotFound(true);
//           setBook(null);
//           return;
//         }

//         if (!response.ok || !result?.success) {
//           throw new Error(
//             getErrorMessage(result, "Unable to load book.")
//           );
//         }

//         const fetchedBook = result.data;

//         if (!fetchedBook) {
//           throw new Error("Book data was not returned.");
//         }

//         const nextForm = createFormFromBook(fetchedBook);

//         const ids = Array.isArray(fetchedBook.includedBooks)
//           ? fetchedBook.includedBooks.map(getId).filter(Boolean)
//           : [];

//         if (signal?.aborted) return;

//         setBook(fetchedBook);
//         setForm(nextForm);
//         setOriginalForm(nextForm);

//         setSelectedBookIds(ids);
//         setOriginalBookIds(ids);

//         setCoverPreview(fetchedBook.coverPageUrl || "");
//       } catch (err) {
//         if (err?.name === "AbortError") return;

//         console.error("Fetch book:", err);
//         setError(err.message || "Unable to load book.");
//       } finally {
//         if (!signal?.aborted) {
//           setLoading(false);
//         }
//       }
//     },
//     [bookId, token, getHeaders]
//   );

//   // ===================================================
//   // GET AVAILABLE BOOKS FOR BUNDLE
//   // ===================================================

//   const fetchAvailableBooks = useCallback(
//     async (signal) => {
//       try {
//         setAvailableLoading(true);
//         setAvailableError("");

//         const response = await fetch(
//           `${API}/book`,
//           {
//             headers: {
//               Accept: "application/json",
//             },
//             signal,
//             cache: "no-store",
//           }
//         );

//         const result = await response.json().catch(() => null);

//         if (!response.ok || result?.success === false) {
//           throw new Error(
//             getErrorMessage(result, "Unable to load available books.")
//           );
//         }

//         const records = Array.isArray(result?.data)
//           ? result.data
//           : Array.isArray(result)
//             ? result
//             : [];

//         const normalized = records
//           .map(normalizeBook)
//           .filter(Boolean)
//           .filter((item) =>
//             ["ebook", "pdf"].includes(item.resourceType)
//           )
//           .filter((item) => item._id !== bookId);

//         if (signal?.aborted) return;

//         setAvailableBooks(normalized);
//       } catch (err) {
//         if (err?.name === "AbortError") return;

//         console.error("Fetch available books:", err);

//         setAvailableError(
//           err.message || "Unable to load available books."
//         );
//       } finally {
//         if (!signal?.aborted) {
//           setAvailableLoading(false);
//         }
//       }
//     },
//     [bookId]
//   );

//   // ===================================================
//   // PAYMENT SUMMARY
//   // ===================================================

//   const fetchPaymentSummary = useCallback(
//     async (signal) => {
//       try {
//         if (!bookId || !token) return;

//         setSummaryLoading(true);
//         setSummaryError("");

//         const response = await fetch(
//           `${API}/admin/books/${encodeURIComponent(bookId)}/payments/page/1`,
//           {
//             headers: getHeaders(),
//             signal,
//           }
//         );

//         const result = await response.json().catch(() => null);

//         if (!response.ok || result?.success !== true) {
//           throw new Error(
//             getErrorMessage(result, "Unable to load payment analytics.")
//           );
//         }

//         const incoming = result?.data?.summary || {};

//         if (signal?.aborted) return;

//         setSummary({
//           ...EMPTY_SUMMARY,
//           ...incoming,

//           payments: {
//             ...EMPTY_SUMMARY.payments,
//             ...(incoming.payments || {}),
//           },

//           refunds: {
//             ...EMPTY_SUMMARY.refunds,
//             ...(incoming.refunds || {}),
//           },

//           coupons: {
//             ...EMPTY_SUMMARY.coupons,
//             ...(incoming.coupons || {}),
//           },

//           reminderMails: {
//             ...EMPTY_SUMMARY.reminderMails,
//             ...(incoming.reminderMails || {}),
//           },

//           access: {
//             ...EMPTY_SUMMARY.access,
//             ...(incoming.access || {}),
//           },

//           verification: {
//             ...EMPTY_SUMMARY.verification,
//             ...(incoming.verification || {}),
//           },

//           affiliates: {
//             ...EMPTY_SUMMARY.affiliates,
//             ...(incoming.affiliates || {}),
//           },
//         });

//         setBreakdown({
//           ...EMPTY_BREAKDOWN,
//           ...(result?.data?.breakdown || {}),
//         });
//       } catch (err) {
//         if (err?.name === "AbortError") return;

//         console.error("Payment summary:", err);

//         setSummaryError(
//           err.message || "Unable to load payment analytics."
//         );
//       } finally {
//         if (!signal?.aborted) {
//           setSummaryLoading(false);
//         }
//       }
//     },
//     [bookId, token, getHeaders]
//   );

//   // ===================================================
//   // INITIAL LOADING
//   // ===================================================

//   useEffect(() => {
//     const controller = new AbortController();

//     fetchBook(controller.signal);
//     fetchPaymentSummary(controller.signal);
//     fetchAvailableBooks(controller.signal);

//     return () => controller.abort();
//   }, [
//     fetchBook,
//     fetchPaymentSummary,
//     fetchAvailableBooks,
//   ]);

//   // ===================================================
//   // FILE PREVIEW CLEANUP
//   // ===================================================

//   useEffect(() => {
//     return () => {
//       if (previewObjectUrlRef.current) {
//         URL.revokeObjectURL(previewObjectUrlRef.current);
//       }
//     };
//   }, []);

//   // ===================================================
//   // BUNDLE CONTENTS
//   // ===================================================

//   const includedBooks = useMemo(() => {
//     if (!Array.isArray(book?.includedBooks)) {
//       return [];
//     }

//     return book.includedBooks
//       .map((entry) => {
//         if (typeof entry === "object" && entry !== null) {
//           return normalizeBook(entry);
//         }

//         // If the backend returns only ObjectIds,
//         // resolve the details from GET /book.
//         const id = getId(entry);

//         return (
//           availableBooks.find((item) => item._id === id) ||
//           {
//             _id: id,
//             title: `Book ${id}`,
//             resourceType: "ebook",
//             coverPageUrl: "",
//             price: 0,
//             mrp: 0,
//             currency: book?.currency || "INR",
//           }
//         );
//       })
//       .filter(Boolean);
//   }, [book, availableBooks]);

//   const availableBooksMap = useMemo(
//     () => {
//       const map = new Map();

//       for (const item of availableBooks) {
//         map.set(item._id, item);
//       }

//       for (const item of includedBooks) {
//         map.set(item._id, item);
//       }

//       return map;
//     },
//     [availableBooks, includedBooks]
//   );

//   const selectedBooks = useMemo(
//     () =>
//       selectedBookIds
//         .map((id) => availableBooksMap.get(id))
//         .filter(Boolean),
//     [selectedBookIds, availableBooksMap]
//   );

//   const filteredBooks = useMemo(() => {
//     const term = bookSearch.toLowerCase().trim();

//     if (!term) return availableBooks;

//     return availableBooks.filter(
//       (item) =>
//         item.title.toLowerCase().includes(term) ||
//         (item.slug || "").toLowerCase().includes(term) ||
//         (item.category || "").toLowerCase().includes(term)
//     );
//   }, [availableBooks, bookSearch]);

//   const toggleIncludedBook = (id) => {
//     setSelectedBookIds((prev) =>
//       prev.includes(id)
//         ? prev.filter((item) => item !== id)
//         : [...prev, id]
//     );

//     setErrors((prev) => ({
//       ...prev,
//       includedBooks: "",
//     }));
//   };

//   const combinedMrp = selectedBooks.reduce(
//     (sum, item) => sum + (item.mrp || item.price || 0),
//     0
//   );

//   // ===================================================
//   // CHANGE DETECTION
//   // ===================================================

//   const formChanged = useMemo(() => {
//     const normalize = (value) => JSON.stringify({
//       ...value,
//       title: value.title.trim(),
//       slug: value.slug.trim(),
//       price: String(value.price),
//       mrp: String(value.mrp),
//     });

//     return normalize(form) !== normalize(originalForm);
//   }, [form, originalForm]);

//   const bundleChanged = useMemo(() => {
//     const a = [...selectedBookIds].sort();
//     const b = [...originalBookIds].sort();

//     return JSON.stringify(a) !== JSON.stringify(b);
//   }, [selectedBookIds, originalBookIds]);

//   const hasChanges =
//     formChanged ||
//     (editingBundle && bundleChanged) ||
//     Boolean(coverFile) ||
//     Boolean(pdfFile);

//   // ===================================================
//   // EDIT HANDLERS
//   // ===================================================

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: name === "currency"
//         ? value.toUpperCase()
//         : name === "slug" || name === "pageKey"
//           ? value.toLowerCase()
//           : value,
//     }));

//     setErrors((prev) => ({
//       ...prev,
//       [name]: "",
//     }));
//   };

//   const setBooleanField = (name, value) => {
//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const validateForm = () => {
//     const next = {};

//     if (form.title.trim().length < 3) {
//       next.title = "Title must contain at least 3 characters.";
//     }

//     if (!slugPattern.test(form.slug.trim())) {
//       next.slug = "Invalid slug.";
//     }

//     if (!slugPattern.test(form.pageKey.trim())) {
//       next.pageKey = "Invalid page key.";
//     }

//     if (
//       form.price === "" ||
//       !Number.isFinite(Number(form.price)) ||
//       Number(form.price) < 0
//     ) {
//       next.price = "Enter a valid price.";
//     }

//     if (
//       form.mrp === "" ||
//       !Number.isFinite(Number(form.mrp)) ||
//       Number(form.mrp) < 0 ||
//       Number(form.mrp) < Number(form.price)
//     ) {
//       next.mrp = "MRP must be equal to or higher than price.";
//     }

//     if (!/^[A-Z]{3}$/.test(form.currency)) {
//       next.currency = "Invalid currency.";
//     }

//     if (!isValidHttpUrl(form.paymentUrl)) {
//       next.paymentUrl = "Invalid payment URL.";
//     }

//     if (!isValidPath(form.redirectUrl)) {
//       next.redirectUrl = "Invalid redirect URL.";
//     }

//     if (editingBundle) {
//       if (selectedBookIds.length === 0) {
//         next.includedBooks = "Select at least one book.";
//       }

//       if (selectedBooks.length !== selectedBookIds.length) {
//         next.includedBooks =
//           "Some selected books could not be resolved.";
//       }
//     }

//     setErrors(next);

//     return Object.keys(next).length === 0;
//   };

//   // ===================================================
//   // FILE CHANGE HANDLERS
//   // ===================================================

//   const handleCoverChange = (event) => {
//     const file = event.target.files?.[0];

//     if (!file) return;

//     if (
//       !["image/jpeg", "image/png", "image/webp"].includes(
//         file.type
//       )
//     ) {
//       toast.error("Cover must be JPG, PNG, or WEBP.");
//       return;
//     }

//     if (file.size > 10 * 1024 * 1024) {
//       toast.error("Maximum cover size is 10 MB.");
//       return;
//     }

//     if (previewObjectUrlRef.current) {
//       URL.revokeObjectURL(previewObjectUrlRef.current);
//     }

//     const url = URL.createObjectURL(file);

//     previewObjectUrlRef.current = url;

//     setCoverFile(file);
//     setCoverPreview(url);
//   };

//   const handlePdfChange = (event) => {
//     const file = event.target.files?.[0];

//     if (!file) return;

//     if (
//       file.type !== "application/pdf" &&
//       !file.name.toLowerCase().endsWith(".pdf")
//     ) {
//       toast.error("Only PDF files are allowed.");
//       return;
//     }

//     if (file.size > 100 * 1024 * 1024) {
//       toast.error("Maximum PDF size is 100 MB.");
//       return;
//     }

//     setPdfFile(file);
//   };

//   const cancelEdit = () => {
//     setForm({ ...originalForm });
//     setSelectedBookIds([...originalBookIds]);

//     setErrors({});
//     setCoverFile(null);
//     setPdfFile(null);

//     if (previewObjectUrlRef.current) {
//       URL.revokeObjectURL(previewObjectUrlRef.current);
//       previewObjectUrlRef.current = "";
//     }

//     setCoverPreview(book?.coverPageUrl || "");

//     if (coverInputRef.current) coverInputRef.current.value = "";
//     if (pdfInputRef.current) pdfInputRef.current.value = "";

//     setEditMode(false);
//   };

//   // ===================================================
//   // UPDATE BOOK / BUNDLE
//   // ===================================================

//   const handleUpdate = async (event) => {
//     event.preventDefault();

//     if (updating || !hasChanges) return;
//     if (!validateForm()) return;

//     if (!token) {
//       toast.error("Please log in again.");
//       return;
//     }

//     try {
//       setUpdating(true);

//       const data = new FormData();

//       const fields = [
//         "title",
//         "slug",
//         "subtitle",
//         "description",
//         "resourceType",
//         "currency",
//         "paymentUrl",
//         "redirectUrl",
//         "pageKey",
//         "fileName",
//         "category",
//         "badge",
//       ];

//       for (const field of fields) {
//         data.append(
//           field,
//           String(form[field] || "").trim()
//         );
//       }

//       data.append("price", String(Number(form.price)));
//       data.append("mrp", String(Number(form.mrp)));

//       for (const field of ["tags", "topics", "highlights"]) {
//         data.append(field, JSON.stringify(toArray(form[field])));
//       }

//       for (const field of [
//         "isPublished",
//         "isActive",
//         "isFeatured",
//       ]) {
//         data.append(field, String(form[field]));
//       }

//       // Critical: updated bundle membership.
//       data.append(
//         "includedBooks",
//         JSON.stringify(
//           editingBundle ? selectedBookIds : []
//         )
//       );

//       if (coverFile) {
//         data.append("coverPage", coverFile);
//       }

//       if (pdfFile && !editingBundle) {
//         data.append("pdf", pdfFile);
//       }

//       const response = await fetch(
//         `${API}/book/admin/${encodeURIComponent(bookId)}`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: data,
//         }
//       );

//       const result = await response.json().catch(() => null);

//       if (!response.ok || result?.success !== true) {
//         throw new Error(
//           getErrorMessage(result, "Unable to update book.")
//         );
//       }

//       // Always re-fetch to ensure includedBooks are
//       // populated with current titles and covers.
//       await fetchBook();

//       setCoverFile(null);
//       setPdfFile(null);
//       setErrors({});
//       setEditMode(false);

//       if (coverInputRef.current) coverInputRef.current.value = "";
//       if (pdfInputRef.current) pdfInputRef.current.value = "";

//       toast.success(
//         editingBundle
//           ? "Bundle updated successfully."
//           : "Book updated successfully."
//       );
//     } catch (err) {
//       console.error("Update book error:", err);
//       toast.error(err.message || "Unable to update book.");
//     } finally {
//       setUpdating(false);
//     }
//   };

//   // ===================================================
//   // DELETE PRODUCT
//   // ===================================================

//   const handleDelete = async () => {
//     try {
//       setDeleting(true);

//       const response = await fetch(
//         `${API}/book/admin/${encodeURIComponent(bookId)}`,
//         {
//           method: "DELETE",
//           headers: getHeaders(),
//         }
//       );

//       const result = await response.json().catch(() => null);

//       if (!response.ok) {
//         throw new Error(
//           getErrorMessage(result, "Unable to delete product.")
//         );
//       }

//       toast.success("Product deleted successfully.");

//       navigate("/admin/books", {
//         replace: true,
//       });
//     } catch (err) {
//       console.error("Delete product:", err);
//       toast.error(err.message || "Unable to delete.");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   // ===================================================
//   // UI HELPERS
//   // ===================================================

//   const Panel = ({ title, subtitle, children, action }) => (
//     <section className={panelClass}>
//       <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
//         <div>
//           <h2 className={`text-lg font-bold ${ui.text}`}>
//             {title}
//           </h2>

//           {subtitle && (
//             <p className={`mt-1 text-xs leading-6 ${ui.secondary}`}>
//               {subtitle}
//             </p>
//           )}
//         </div>

//         {action}
//       </div>

//       {children}
//     </section>
//   );

//   const Field = ({
//     label,
//     name,
//     type = "text",
//     required = false,
//     placeholder = "",
//   }) => (
//     <div>
//       <label className={`mb-2 block text-xs font-bold ${ui.secondary}`}>
//         {label}
//         {required && <span className="text-red-500"> *</span>}
//       </label>

//       <input
//         type={type}
//         name={name}
//         value={form[name]}
//         onChange={handleChange}
//         placeholder={placeholder}
//         className={inputClass}
//       />

//       {errors[name] && (
//         <p className="mt-1 text-xs text-red-500">
//           {errors[name]}
//         </p>
//       )}
//     </div>
//   );

//   const TextArea = ({ label, name, rows = 4 }) => (
//     <div>
//       <label className={`mb-2 block text-xs font-bold ${ui.secondary}`}>
//         {label}
//       </label>

//       <textarea
//         name={name}
//         value={form[name]}
//         onChange={handleChange}
//         rows={rows}
//         className={`${inputClass} resize-y`}
//       />
//     </div>
//   );

//   const Detail = ({ label, value, mono = false }) => (
//     <div className={`border-b py-3 last:border-b-0 ${ui.border}`}>
//       <p className={`text-[11px] font-semibold uppercase ${ui.secondary}`}>
//         {label}
//       </p>

//       <p
//         className={`mt-1 break-words text-sm font-medium ${ui.text} ${
//           mono ? "font-mono text-xs" : ""
//         }`}
//       >
//         {value === undefined || value === null || value === ""
//           ? "—"
//           : String(value)}
//       </p>
//     </div>
//   );

//   const Stat = ({ label, value, icon: Icon }) => (
//     <div className={`rounded-xl border p-4 ${ui.card}`}>
//       <div className="flex items-center justify-between gap-2">
//         <p className={`text-xs ${ui.secondary}`}>
//           {label}
//         </p>

//         {Icon && <Icon size={17} className="text-blue-500" />}
//       </div>

//       <p className={`mt-2 break-words text-xl font-bold ${ui.text}`}>
//         {summaryLoading ? (
//           <Loader2 size={19} className="animate-spin" />
//         ) : (
//           value ?? 0
//         )}
//       </p>
//     </div>
//   );

//   const BookCover = ({ item, className = "" }) => (
//     <div
//       className={`
//         shrink-0 overflow-hidden rounded-xl border
//         ${ui.border} ${ui.soft} ${className}
//       `}
//     >
//       {item?.coverPageUrl ? (
//         <img
//           src={item.coverPageUrl}
//           alt={item.title}
//           className="h-full w-full object-cover"
//         />
//       ) : (
//         <div className="flex h-full items-center justify-center">
//           <BookOpen size={24} className={ui.secondary} />
//         </div>
//       )}
//     </div>
//   );

//   // ===================================================
//   // LOADING / ERROR
//   // ===================================================

//   if (loading) {
//     return (
//       <main className={`min-h-screen pt-28 ${ui.page}`}>
//         <div className="flex min-h-[50vh] items-center justify-center">
//           <div className="text-center">
//             <Loader2
//               size={36}
//               className="mx-auto animate-spin text-blue-500"
//             />
//             <p className={`mt-4 ${ui.secondary}`}>
//               Loading product details...
//             </p>
//           </div>
//         </div>
//       </main>
//     );
//   }

//   if (notFound || error || !book) {
//     return (
//       <main className={`min-h-screen px-4 pt-28 ${ui.page}`}>
//         <div className={`mx-auto max-w-lg rounded-2xl border p-8 text-center ${ui.card}`}>
//           <AlertCircle
//             size={35}
//             className="mx-auto text-red-500"
//           />

//           <h1 className={`mt-4 text-2xl font-bold ${ui.text}`}>
//             {notFound ? "Product Not Found" : "Unable to Load Product"}
//           </h1>

//           <p className={`mt-3 text-sm ${ui.secondary}`}>
//             {error || "This product could not be found."}
//           </p>

//           <button
//             onClick={() => navigate("/admin/books")}
//             className={`${primaryButton} mt-6`}
//           >
//             <ArrowLeft size={16} />
//             Back to Books
//           </button>
//         </div>
//       </main>
//     );
//   }

//   const currency = book.currency || "INR";

//   const isEditing = editMode;

//   // ===================================================
//   // MAIN PAGE
//   // ===================================================

//   return (
//     <>
//       <Helmet>
//         <title>{book.title} | Target Trek Admin</title>
//       </Helmet>

//       <Toaster position="top-right" />

//       <main className={`min-h-screen pt-28 pb-20 ${ui.page}`}>
//         <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">

//           {/* HEADER NAV */}

//           <button
//             type="button"
//             onClick={() => navigate("/admin/books")}
//             className={`mb-6 inline-flex items-center gap-2 text-sm font-semibold ${ui.secondary}`}
//           >
//             <ArrowLeft size={17} />
//             Back to Books
//           </button>

//           {/* PRODUCT HERO */}

//           <section className={panelClass}>
//             <div className="flex flex-col gap-6 md:flex-row">

//               <BookCover
//                 item={book}
//                 className="h-[240px] w-[175px]"
//               />

//               <div className="min-w-0 flex-1">
//                 <div className="flex flex-wrap gap-2">
//                   <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-500">
//                     {book.resourceType?.toUpperCase()}
//                   </span>

//                   <span
//                     className={`rounded-full px-3 py-1 text-xs font-bold ${
//                       book.isPublished
//                         ? "bg-emerald-500/10 text-emerald-500"
//                         : "bg-slate-500/10 text-slate-400"
//                     }`}
//                   >
//                     {book.isPublished ? "Published" : "Draft"}
//                   </span>

//                   <span
//                     className={`rounded-full px-3 py-1 text-xs font-bold ${
//                       book.isActive
//                         ? "bg-emerald-500/10 text-emerald-500"
//                         : "bg-red-500/10 text-red-500"
//                     }`}
//                   >
//                     {book.isActive ? "Active" : "Inactive"}
//                   </span>

//                   {book.isFeatured && (
//                     <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500">
//                       Featured
//                     </span>
//                   )}
//                 </div>

//                 <h1 className={`mt-4 text-2xl font-extrabold sm:text-3xl ${ui.text}`}>
//                   {book.title}
//                 </h1>

//                 {book.subtitle && (
//                   <p className={`mt-2 text-sm leading-6 ${ui.secondary}`}>
//                     {book.subtitle}
//                   </p>
//                 )}

//                 <div className="mt-4 flex items-end gap-3">
//                   <strong className={`text-2xl ${ui.text}`}>
//                     {money(book.price, currency)}
//                   </strong>

//                   {Number(book.mrp) > Number(book.price) && (
//                     <span className={`text-sm line-through ${ui.secondary}`}>
//                       {money(book.mrp, currency)}
//                     </span>
//                   )}
//                 </div>

//                 <div className="mt-6 flex flex-wrap gap-3">
//                   <button
//                     type="button"
//                     onClick={() => setEditMode(!editMode)}
//                     className={primaryButton}
//                   >
//                     <Edit3 size={16} />
//                     {editMode ? "Close Editor" : "Edit Product"}
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       navigate(`/admin/book/${bookId}/payments`)
//                     }
//                     className={secondaryButton}
//                   >
//                     <CreditCard size={16} />
//                     Payments
//                   </button>

//                   {book.redirectUrl && (
//                     <a
//                       href={book.redirectUrl}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className={secondaryButton}
//                     >
//                       <ExternalLink size={16} />
//                       Open Product
//                     </a>
//                   )}

//                   <button
//                     type="button"
//                     onClick={() => setDeleteModal(true)}
//                     className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10"
//                   >
//                     <Trash2 size={16} />
//                     Delete
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* BUNDLE DETAILS */}

//           {isBundle && (
//             <section className={`mt-6 ${panelClass}`}>
//               <div className="mb-5 flex items-center justify-between gap-4">
//                 <div>
//                   <div className="flex items-center gap-2">
//                     <Package size={21} className="text-blue-500" />

//                     <h2 className={`text-lg font-bold ${ui.text}`}>
//                       Books Included in This Bundle
//                     </h2>
//                   </div>

//                   <p className={`mt-1 text-sm ${ui.secondary}`}>
//                     {includedBooks.length} books delivered with one purchase.
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() => {
//                     setEditMode(true);

//                     document
//                       .getElementById("bundle-editor")
//                       ?.scrollIntoView({
//                         behavior: "smooth",
//                         block: "start",
//                       });
//                   }}
//                   className={secondaryButton}
//                 >
//                   <Edit3 size={16} />
//                   Edit Included Books
//                 </button>
//               </div>

//               {includedBooks.length > 0 ? (
//                 <div className="grid gap-4 lg:grid-cols-2">
//                   {includedBooks.map((item, index) => (
//                     <div
//                       key={item._id}
//                       className={`flex items-start gap-4 rounded-xl border p-4 ${ui.border} ${ui.soft}`}
//                     >
//                       <BookCover
//                         item={item}
//                         className="h-28 w-20"
//                       />

//                       <div className="min-w-0 flex-1">
//                         <p className={`text-xs ${ui.secondary}`}>
//                           BOOK {index + 1}
//                         </p>

//                         <h3 className={`mt-1 text-sm font-bold ${ui.text}`}>
//                           {item.title}
//                         </h3>

//                         {item.subtitle && (
//                           <p className={`mt-1 text-xs ${ui.secondary}`}>
//                             {item.subtitle}
//                           </p>
//                         )}

//                         <p className="mt-3 text-sm font-bold text-blue-500">
//                           {money(item.price, item.currency)}
//                         </p>

//                         <span className={`mt-2 block break-all font-mono text-[10px] ${ui.secondary}`}>
//                           {item._id}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <div className={`rounded-xl p-5 ${ui.soft}`}>
//                   <p className={ui.secondary}>
//                     No included books are configured.
//                   </p>
//                 </div>
//               )}
//             </section>
//           )}

//           {/* STATS */}

//           <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
//             <Stat
//               icon={Eye}
//               label="Views"
//               value={book.stats?.views || 0}
//             />

//             <Stat
//               icon={Users}
//               label="Purchases"
//               value={book.stats?.purchases || 0}
//             />

//             <Stat
//               icon={Receipt}
//               label="Total Orders"
//               value={summary.totalOrders}
//             />

//             <Stat
//               icon={CheckCircle2}
//               label="Paid Orders"
//               value={summary.payments.paidOrders}
//             />

//             <Stat
//               icon={CircleDollarSign}
//               label="Gross Paid"
//               value={money(
//                 summary.payments.grossPaidAmount,
//                 currency
//               )}
//             />

//             <Stat
//               icon={WalletCards}
//               label="Net Revenue"
//               value={money(
//                 summary.payments.netRevenue,
//                 currency
//               )}
//             />
//           </div>

//           {/* ANALYTICS */}

//           <div className="mt-6 space-y-6">
//             <Panel
//               title="Order & Payment Overview"
//               subtitle="Financial totals for orders placed against this product."
//             >
//               {summaryError && (
//                 <p className="mb-4 text-sm text-red-500">
//                   {summaryError}
//                 </p>
//               )}

//               <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
//                 {[
//                   ["Successful", summary.payments.successfulPayments],
//                   ["Failed", summary.payments.failedPayments],
//                   ["Pending", summary.payments.pendingPayments],
//                   ["Cancelled", summary.payments.cancelledPayments],
//                   ["Fully Refunded", summary.payments.fullyRefundedPayments],
//                   ["Partially Refunded", summary.payments.partiallyRefundedPayments],
//                 ].map(([label, value]) => (
//                   <div
//                     key={label}
//                     className={`rounded-xl border p-4 ${ui.border} ${ui.soft}`}
//                   >
//                     <p className={`text-xs ${ui.secondary}`}>
//                       {label}
//                     </p>

//                     <p className={`mt-2 text-xl font-bold ${ui.text}`}>
//                       {summaryLoading ? "..." : value}
//                     </p>
//                   </div>
//                 ))}
//               </div>

//               <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
//                 {[
//                   ["Successful Amount", summary.payments.successfulAmount],
//                   ["Failed Amount", summary.payments.failedAmount],
//                   ["Pending Amount", summary.payments.pendingAmount],
//                   ["Total Order Amount", summary.totalOrderAmount],
//                 ].map(([label, value]) => (
//                   <div
//                     key={label}
//                     className={`rounded-xl border p-4 ${ui.border} ${ui.soft}`}
//                   >
//                     <p className={`text-xs ${ui.secondary}`}>
//                       {label}
//                     </p>

//                     <p className={`mt-2 text-lg font-bold ${ui.text}`}>
//                       {summaryLoading ? "..." : money(value, currency)}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </Panel>

//             <div className="grid gap-6 xl:grid-cols-3">
//               <div className="xl:col-span-2">
//                 <Panel title="Refund Overview">
//                   <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
//                     {[
//                       ["Refund Orders", summary.refunds.refundOrders],
//                       ["Pending", summary.refunds.pendingRefunds],
//                       ["Processing", summary.refunds.processingRefunds],
//                       ["Completed", summary.refunds.completedRefunds],
//                       ["Failed", summary.refunds.failedRefunds],
//                       ["Partial", summary.refunds.partialRefunds],
//                     ].map(([label, value]) => (
//                       <div
//                         key={label}
//                         className={`rounded-xl p-4 ${ui.soft}`}
//                       >
//                         <p className={`text-xs ${ui.secondary}`}>
//                           {label}
//                         </p>

//                         <p className={`mt-2 text-xl font-bold ${ui.text}`}>
//                           {summaryLoading ? "..." : value}
//                         </p>
//                       </div>
//                     ))}
//                   </div>

//                   <div className={`mt-5 grid gap-4 border-t pt-5 md:grid-cols-3 ${ui.border}`}>
//                     <Detail
//                       label="Requested Refund"
//                       value={money(
//                         summary.refunds.totalRefundRequestedAmount,
//                         currency
//                       )}
//                     />

//                     <Detail
//                       label="Refunded Amount"
//                       value={money(
//                         summary.refunds.totalRefundedAmount,
//                         currency
//                       )}
//                     />

//                     <Detail
//                       label="Remaining Refund"
//                       value={money(
//                         summary.refunds.totalRefundRemainingAmount,
//                         currency
//                       )}
//                     />
//                   </div>
//                 </Panel>
//               </div>

//               <Panel title="Coupons, Mail & Affiliates">
//                 <Detail
//                   label="Coupon Orders"
//                   value={summary.coupons.couponAppliedOrders}
//                 />
//                 <Detail
//                   label="Coupon Discount"
//                   value={money(summary.coupons.totalDiscountAmount, currency)}
//                 />
//                 <Detail
//                   label="Reminder Mails Sent"
//                   value={summary.reminderMails.totalSent}
//                 />
//                 <Detail
//                   label="Orders Reminded"
//                   value={summary.reminderMails.ordersWithReminderMail}
//                 />
//                 <Detail
//                   label="Failed Reminder Status"
//                   value={summary.reminderMails.lastStatusFailed}
//                 />
//                 <Detail
//                   label="First Reminder"
//                   value={formatDate(summary.reminderMails.firstMailSentAt)}
//                 />
//                 <Detail
//                   label="Last Reminder"
//                   value={formatDate(summary.reminderMails.lastMailSentAt)}
//                 />
//                 <Detail
//                   label="Affiliate Orders"
//                   value={summary.affiliates.affiliateOrders}
//                 />
//               </Panel>
//             </div>

//             {(breakdown.paymentStatus?.length > 0 ||
//               breakdown.refundStatus?.length > 0) && (
//               <Panel title="Payment & Refund Breakdown">
//                 <div className="grid gap-6 md:grid-cols-2">
//                   {[
//                     ["Payment Status", breakdown.paymentStatus],
//                     ["Refund Status", breakdown.refundStatus],
//                   ].map(([title, items]) => (
//                     <div key={title}>
//                       <h3 className={`mb-3 text-sm font-bold ${ui.text}`}>
//                         {title}
//                       </h3>

//                       <div className="space-y-2">
//                         {items.map((item, index) => (
//                           <div
//                             key={index}
//                             className={`flex items-center justify-between rounded-lg border p-3 ${ui.border}`}
//                           >
//                             <span className={`text-xs ${ui.secondary}`}>
//                               {item._id || item.status || "Unknown"}
//                             </span>

//                             <strong className={`text-sm ${ui.text}`}>
//                               {item.count ?? 0}
//                             </strong>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </Panel>
//             )}
//           </div>

//           {/* =====================================
//               EDITOR
//           ===================================== */}

//           {isEditing ? (
//             <form
//               id="bundle-editor"
//               onSubmit={handleUpdate}
//               className="mt-8 space-y-6 scroll-mt-28"
//             >
//               <div className="flex flex-wrap items-center justify-between gap-3">
//                 <div>
//                   <h2 className={`text-2xl font-bold ${ui.text}`}>
//                     Edit Product
//                   </h2>

//                   <p className={`mt-1 text-sm ${ui.secondary}`}>
//                     Update details, files, publishing settings, and bundle contents.
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={cancelEdit}
//                   className={secondaryButton}
//                 >
//                   <X size={16} />
//                   Cancel
//                 </button>
//               </div>

//               {/* BUNDLE BOOK EDITOR */}

//               {editingBundle && (
//                 <Panel
//                   title="Edit Books Included in Bundle"
//                   subtitle="Select or remove existing ebooks. The backend receives their IDs as includedBooks."
//                 >
//                   <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
//                     <span className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-bold text-blue-500">
//                       {selectedBookIds.length} selected
//                     </span>

//                     <button
//                       type="button"
//                       onClick={() => fetchAvailableBooks()}
//                       className={secondaryButton}
//                     >
//                       <RefreshCw size={16} />
//                       Refresh
//                     </button>
//                   </div>

//                   <div className="relative">
//                     <Search
//                       size={17}
//                       className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                     />

//                     <input
//                       type="search"
//                       value={bookSearch}
//                       onChange={(e) => setBookSearch(e.target.value)}
//                       placeholder="Search existing books..."
//                       className={`${inputClass} pl-11`}
//                     />
//                   </div>

//                   {availableError && (
//                     <div className="mt-4 rounded-xl border border-red-500/30 p-4 text-sm text-red-500">
//                       {availableError}
//                     </div>
//                   )}

//                   {availableLoading ? (
//                     <div className="flex justify-center py-12">
//                       <Loader2
//                         className="animate-spin text-blue-500"
//                       />
//                     </div>
//                   ) : (
//                     <div className="mt-5 grid gap-3 md:grid-cols-2">
//                       {filteredBooks.map((item) => {
//                         const selected =
//                           selectedBookIds.includes(item._id);

//                         return (
//                           <label
//                             key={item._id}
//                             className={`
//                               flex cursor-pointer items-start
//                               gap-3 rounded-xl border p-3
//                               ${selected ? ui.selected : ui.border}
//                             `}
//                           >
//                             <input
//                               type="checkbox"
//                               checked={selected}
//                               onChange={() =>
//                                 toggleIncludedBook(item._id)
//                               }
//                               className="mt-2 h-4 w-4 accent-blue-600"
//                             />

//                             <BookCover
//                               item={item}
//                               className="h-24 w-16"
//                             />

//                             <div className="min-w-0 flex-1">
//                               <h3 className={`text-sm font-bold ${ui.text}`}>
//                                 {item.title}
//                               </h3>

//                               <p className={`mt-1 text-xs ${ui.secondary}`}>
//                                 {item.resourceType.toUpperCase()}
//                               </p>

//                               <p className="mt-2 text-sm font-bold text-blue-500">
//                                 {money(item.price, item.currency)}
//                               </p>
//                             </div>
//                           </label>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {selectedBooks.length > 0 && (
//                     <div className={`mt-6 rounded-xl border p-4 ${ui.border} ${ui.soft}`}>
//                       <h3 className={`mb-3 font-bold ${ui.text}`}>
//                         Selected Bundle Books
//                       </h3>

//                       <div className="space-y-2">
//                         {selectedBooks.map((item, index) => (
//                           <div
//                             key={item._id}
//                             className={`flex items-center justify-between gap-3 border-b py-2 last:border-0 ${ui.border}`}
//                           >
//                             <span className={`text-sm ${ui.text}`}>
//                               {index + 1}. {item.title}
//                             </span>

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 toggleIncludedBook(item._id)
//                               }
//                               className="text-red-500"
//                             >
//                               <X size={17} />
//                             </button>
//                           </div>
//                         ))}
//                       </div>

//                       <p className={`mt-4 text-xs ${ui.secondary}`}>
//                         Combined reference MRP: {money(combinedMrp, form.currency)}
//                       </p>
//                     </div>
//                   )}

//                   {errors.includedBooks && (
//                     <p className="mt-3 text-xs text-red-500">
//                       {errors.includedBooks}
//                     </p>
//                   )}
//                 </Panel>
//               )}

//               {/* BASIC INFORMATION */}

//               <Panel title="Basic Information">
//                 <div className="grid gap-5 md:grid-cols-2">
//                   <Field label="Title" name="title" required />
//                   <Field label="Slug" name="slug" required />
//                   <Field label="Subtitle" name="subtitle" />

//                   <div>
//                     <label className={`mb-2 block text-xs font-bold ${ui.secondary}`}>
//                       Resource Type
//                     </label>

//                     <select
//                       value={form.resourceType}
//                       onChange={(e) => {
//                         const value = e.target.value;

//                         setForm((prev) => ({
//                           ...prev,
//                           resourceType: value,
//                         }));

//                         if (value === "bundle") {
//                           setPdfFile(null);
//                         }
//                       }}
//                       className={inputClass}
//                     >
//                       {RESOURCE_TYPES.map((type) => (
//                         <option key={type} value={type}>
//                           {type.toUpperCase()}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="md:col-span-2">
//                     <TextArea
//                       label="Description"
//                       name="description"
//                       rows={5}
//                     />
//                   </div>
//                 </div>
//               </Panel>

//               {/* URLS */}

//               <Panel title="Page & Checkout">
//                 <div className="grid gap-5 md:grid-cols-2">
//                   <Field
//                     label="Page Key"
//                     name="pageKey"
//                     required
//                   />

//                   <Field
//                     label="Redirect URL"
//                     name="redirectUrl"
//                     required
//                   />

//                   <div className="md:col-span-2">
//                     <Field
//                       label="Payment URL"
//                       name="paymentUrl"
//                       required
//                     />
//                   </div>
//                 </div>
//               </Panel>

//               {/* PRICE */}

//               <Panel title="Pricing">
//                 <div className="grid gap-5 md:grid-cols-3">
//                   <Field
//                     label="Selling Price"
//                     name="price"
//                     type="number"
//                     required
//                   />

//                   <Field
//                     label="MRP"
//                     name="mrp"
//                     type="number"
//                   />

//                   <Field
//                     label="Currency"
//                     name="currency"
//                     required
//                   />
//                 </div>
//               </Panel>

//               {/* METADATA */}

//               <Panel title="Discovery & Metadata">
//                 <div className="grid gap-5 md:grid-cols-2">
//                   <Field label="Category" name="category" />
//                   <Field label="Badge" name="badge" />
//                   <Field label="Tags" name="tags" />
//                   <Field label="Topics" name="topics" />
//                   <div className="md:col-span-2">
//                     <TextArea label="Highlights" name="highlights" />
//                   </div>
//                 </div>
//               </Panel>

//               {/* FILES */}

//               <Panel title="Product Files">
//                 <div className="grid gap-5 md:grid-cols-2">

//                   <div>
//                     <p className={`mb-3 text-xs font-bold ${ui.secondary}`}>
//                       Replace Cover
//                     </p>

//                     <label
//                       className={`flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 ${ui.border} ${ui.soft}`}
//                     >
//                       {coverPreview ? (
//                         <img
//                           src={coverPreview}
//                           alt="Cover"
//                           className="max-h-[200px] max-w-full object-contain"
//                         />
//                       ) : (
//                         <Upload size={30} className="text-blue-500" />
//                       )}

//                       <input
//                         ref={coverInputRef}
//                         type="file"
//                         accept="image/png,image/jpeg,image/webp"
//                         onChange={handleCoverChange}
//                         className="hidden"
//                       />
//                     </label>
//                   </div>

//                   {!editingBundle && (
//                     <div>
//                       <p className={`mb-3 text-xs font-bold ${ui.secondary}`}>
//                         Replace PDF
//                       </p>

//                       <label
//                         className={`flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 ${ui.border} ${ui.soft}`}
//                       >
//                         <FileText
//                           size={35}
//                           className="text-red-500"
//                         />

//                         <p className={`mt-3 text-xs ${ui.secondary}`}>
//                           {pdfFile?.name || "Choose PDF"}
//                         </p>

//                         <input
//                           ref={pdfInputRef}
//                           type="file"
//                           accept="application/pdf,.pdf"
//                           onChange={handlePdfChange}
//                           className="hidden"
//                         />
//                       </label>
//                     </div>
//                   )}
//                 </div>

//                 {!editingBundle && (
//                   <div className="mt-5">
//                     <Field
//                       label="Display File Name"
//                       name="fileName"
//                     />
//                   </div>
//                 )}

//                 {editingBundle && (
//                   <p className={`mt-4 text-sm ${ui.secondary}`}>
//                     Bundles do not need their own PDF. Each included book
//                     retains its existing PDF.
//                   </p>
//                 )}
//               </Panel>

//               {/* PUBLISHING */}

//               <Panel title="Publishing Settings">
//                 <div className="space-y-3">
//                   {[
//                     ["isActive", "Active"],
//                     ["isPublished", "Published"],
//                     ["isFeatured", "Featured"],
//                   ].map(([key, label]) => (
//                     <label
//                       key={key}
//                       className={`flex items-center justify-between rounded-xl border p-4 ${ui.border}`}
//                     >
//                       <span className={`text-sm font-bold ${ui.text}`}>
//                         {label}
//                       </span>

//                       <input
//                         type="checkbox"
//                         checked={form[key]}
//                         onChange={(e) =>
//                           setBooleanField(key, e.target.checked)
//                         }
//                         className="h-5 w-5 accent-blue-600"
//                       />
//                     </label>
//                   ))}
//                 </div>
//               </Panel>

//               {/* SAVE */}

//               <div className={`sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 shadow-xl ${ui.card}`}>
//                 <p className={`text-sm ${ui.secondary}`}>
//                   {hasChanges
//                     ? "You have unsaved changes."
//                     : "No changes to save."}
//                 </p>

//                 <div className="flex flex-wrap gap-3">
//                   <button
//                     type="button"
//                     onClick={cancelEdit}
//                     className={secondaryButton}
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="submit"
//                     disabled={updating || !hasChanges}
//                     className={primaryButton}
//                   >
//                     {updating ? (
//                       <Loader2 size={17} className="animate-spin" />
//                     ) : (
//                       <Save size={17} />
//                     )}
//                     {updating ? "Saving..." : "Save Changes"}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           ) : (
//             // =====================================
//             // READ ONLY DETAILS
//             // =====================================
//             <div className="mt-8 grid gap-6 xl:grid-cols-3">
//               <div className="space-y-6 xl:col-span-2">

//                 <Panel title="Product Description">
//                   <p className={`whitespace-pre-line text-sm leading-7 ${ui.secondary}`}>
//                     {book.description || "No description available."}
//                   </p>
//                 </Panel>

//                 <Panel title="Metadata">
//                   {[
//                     ["Slug", book.slug],
//                     ["Page Key", book.pageKey],
//                     ["Resource Type", book.resourceType],
//                     ["Category", book.category],
//                     ["Badge", book.badge],
//                     ["Created By", book.createdBy],
//                     ["Updated By", book.updatedBy],
//                     ["Created At", formatDate(book.createdAt)],
//                     ["Updated At", formatDate(book.updatedAt)],
//                   ].map(([label, value]) => (
//                     <Detail
//                       key={label}
//                       label={label}
//                       value={value}
//                     />
//                   ))}
//                 </Panel>

//                 <Panel title="Tags, Topics & Highlights">
//                   {[
//                     ["Tags", book.tags],
//                     ["Topics", book.topics],
//                     ["Highlights", book.highlights],
//                   ].map(([label, values]) => (
//                     <div key={label} className="mb-5 last:mb-0">
//                       <p className={`mb-2 text-xs font-bold ${ui.secondary}`}>
//                         {label}
//                       </p>

//                       <div className="flex flex-wrap gap-2">
//                         {(values || []).length ? (
//                           values.map((value, index) => (
//                             <span
//                               key={index}
//                               className="rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-500"
//                             >
//                               {value}
//                             </span>
//                           ))
//                         ) : (
//                           <span className={`text-xs ${ui.secondary}`}>
//                             None
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </Panel>
//               </div>

//               <div className="space-y-6">
//                 <Panel title="Delivery & Links">
//                   <Detail label="Redirect URL" value={book.redirectUrl} />
//                   <Detail label="Payment URL" value={book.paymentUrl} />
//                   <Detail
//                     label="Delivery"
//                     value={isBundle
//                       ? `${includedBooks.length} separate ebooks`
//                       : book.pdfUrl
//                         ? "Single PDF"
//                         : "No PDF configured"}
//                   />
//                   <Detail label="File Name" value={book.fileName} />
//                 </Panel>

//                 <Panel title="Engagement">
//                   <Detail
//                     label="Views"
//                     value={book.stats?.views || 0}
//                   />
//                   <Detail
//                     label="Purchases"
//                     value={book.stats?.purchases || 0}
//                   />
//                   <Detail
//                     label="Downloads"
//                     value={book.stats?.downloads || 0}
//                   />
//                   <Detail
//                     label="Access Count"
//                     value={summary.access.totalAccessCount}
//                   />
//                   <Detail
//                     label="Revoked Access Orders"
//                     value={summary.access.revokedAccessOrders}
//                   />
//                 </Panel>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>

//       {/* DELETE CONFIRMATION */}

//       {deleteModal && (
//         <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
//           <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${ui.card}`}>
//             <div className="flex items-center gap-3">
//               <AlertCircle size={25} className="text-red-500" />

//               <h2 className={`text-xl font-bold ${ui.text}`}>
//                 Delete Product?
//               </h2>
//             </div>

//             <p className={`mt-4 text-sm leading-7 ${ui.secondary}`}>
//               Are you sure you want to delete{" "}
//               <strong>{book.title}</strong>?
//               This action cannot be undone.
//             </p>

//             <div className="mt-6 flex justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => setDeleteModal(false)}
//                 className={secondaryButton}
//                 disabled={deleting}
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={handleDelete}
//                 disabled={deleting}
//                 className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
//               >
//                 {deleting ? (
//                   <Loader2 size={16} className="animate-spin" />
//                 ) : (
//                   <Trash2 size={16} />
//                 )}
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
import React, {
  useCallback,
  useContext,
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Check,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  FileText,
  Layers3,
  Loader2,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Users,
  WalletCards,
  X,
  XCircle,
} from "lucide-react";

import BASE_URL from "../utils/Url";

// =====================================================
// CONFIGURATION
// =====================================================

const API = String(BASE_URL || "").replace(/\/+$/, "");

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const RESOURCE_TYPES = [
  "pdf",
  "ebook",
  "course",
  "bundle",
  "template",
  "notes",
  "other",
];

const EMPTY_FORM = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  resourceType: "ebook",
  price: "",
  mrp: "",
  currency: "INR",
  paymentUrl: "",
  redirectUrl: "",
  pageKey: "",
  fileName: "",
  tags: "",
  topics: "",
  category: "",
  highlights: "",
  badge: "",
  isPublished: false,
  isActive: true,
  isFeatured: false,
};

const EMPTY_SUMMARY = {
  totalOrders: 0,
  totalOrderAmount: 0,

  payments: {
    paidOrders: 0,
    successfulPayments: 0,
    failedPayments: 0,
    pendingPayments: 0,
    cancelledPayments: 0,
    fullyRefundedPayments: 0,
    partiallyRefundedPayments: 0,
    successfulAmount: 0,
    failedAmount: 0,
    pendingAmount: 0,
    cancelledAmount: 0,
    grossPaidAmount: 0,
    netRevenue: 0,
  },

  refunds: {
    refundOrders: 0,
    pendingRefunds: 0,
    processingRefunds: 0,
    partialRefunds: 0,
    completedRefunds: 0,
    failedRefunds: 0,
    cancelledRefunds: 0,
    totalRefundRequestedAmount: 0,
    totalRefundedAmount: 0,
    totalRefundRemainingAmount: 0,
  },

  coupons: {
    couponAppliedOrders: 0,
    totalDiscountAmount: 0,
    originalAmount: 0,
    finalAmount: 0,
  },

  reminderMails: {
    totalSent: 0,
    ordersWithReminderMail: 0,
    lastStatusSent: 0,
    lastStatusFailed: 0,
    firstMailSentAt: null,
    lastMailSentAt: null,
  },

  access: {
    totalAccessCount: 0,
    revokedAccessOrders: 0,
  },

  verification: {
    callbackHashVerified: 0,
    payuVerified: 0,
    amountVerified: 0,
  },

  affiliates: {
    affiliateOrders: 0,
  },
};

const EMPTY_BREAKDOWN = {
  paymentStatus: [],
  orderStatus: [],
  refundStatus: [],
  coupons: [],
  affiliates: [],
};

// =====================================================
// HELPERS
// =====================================================

const readTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const money = (value, currency = "INR") => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) return "—";

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

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const toArrayString = (value) =>
  Array.isArray(value) ? value.join(", ") : "";

const toArray = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") return value;

  return String(value._id || value.id || "");
};

const normalizeBook = (book) => {
  if (!book) return null;

  const id = getId(book);

  if (!id) return null;

  return {
    ...book,
    _id: id,
    title: book.title || "Untitled Book",
    resourceType: book.resourceType || "ebook",
    coverPageUrl: book.coverPageUrl || "",
    price: Number(book.price) || 0,
    mrp: Number(book.mrp) || 0,
    currency: book.currency || "INR",
  };
};

const createFormFromBook = (book) => ({
  title: book?.title || "",
  slug: book?.slug || "",
  subtitle: book?.subtitle || "",
  description: book?.description || "",
  resourceType: book?.resourceType || "ebook",
  price: String(book?.price ?? ""),
  mrp: String(book?.mrp ?? ""),
  currency: book?.currency || "INR",
  paymentUrl: book?.paymentUrl || "",
  redirectUrl: book?.redirectUrl || "",
  pageKey: book?.pageKey || "",
  fileName: book?.fileName || "",
  tags: toArrayString(book?.tags),
  topics: toArrayString(book?.topics),
  category: book?.category || "",
  highlights: toArrayString(book?.highlights),
  badge: book?.badge || "",
  isPublished: book?.isPublished === true,
  isActive: book?.isActive !== false,
  isFeatured: book?.isFeatured === true,
});

const getErrorMessage = (result, fallback) =>
  result?.error?.message ||
  (typeof result?.error === "string" ? result.error : null) ||
  result?.message ||
  fallback;

const isValidHttpUrl = (value) => {
  try {
    return ["http:", "https:"].includes(
      new URL(value).protocol
    );
  } catch {
    return false;
  }
};

const isValidPath = (value) =>
  /^\/(?!\/)[^\r\n\\]+$/.test(String(value || ""));

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// These components MUST remain outside AdminBookDetails.
// Defining them inside the parent was the root cause of input focus loss.
const PageUiContext = createContext(null);

function Panel({ title, subtitle, children, action }) {
  const { panelClass, ui } = useContext(PageUiContext);
  return (
    <section className={panelClass}>
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`text-lg font-extrabold ${ui.text}`}>{title}</h2>
          {subtitle && <p className={`mt-1 text-xs leading-6 ${ui.secondary}`}>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, name, type = "text", required = false, placeholder = "", help = "" }) {
  const { form, errors, handleChange, ui, inputClass } = useContext(PageUiContext);
  return (
    <div className="min-w-0">
      <label htmlFor={`book-field-${name}`} className={`mb-2 block text-xs font-bold ${ui.secondary}`}>
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      <input
        id={`book-field-${name}`}
        type={type}
        name={name}
        value={form[name] ?? ""}
        onChange={handleChange}
        required={required}
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? "0" : undefined}
        placeholder={placeholder}
        className={inputClass}
      />
      {help && <p className={`mt-1.5 text-xs ${ui.secondary}`}>{help}</p>}
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );
}

function TextArea({ label, name, rows = 4 }) {
  const { form, errors, handleChange, ui, inputClass } = useContext(PageUiContext);
  return (
    <div className="min-w-0">
      <label htmlFor={`book-field-${name}`} className={`mb-2 block text-xs font-bold ${ui.secondary}`}>{label}</label>
      <textarea
        id={`book-field-${name}`}
        name={name}
        value={form[name] ?? ""}
        onChange={handleChange}
        rows={rows}
        className={`${inputClass} resize-y`}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]}</p>}
    </div>
  );
}

function Detail({ label, value, mono = false }) {
  const { ui } = useContext(PageUiContext);
  return (
    <div className={`border-b py-3 last:border-b-0 ${ui.border}`}>
      <p className={`text-[11px] font-semibold uppercase tracking-wide ${ui.secondary}`}>{label}</p>
      <p className={`mt-1 break-all text-sm font-medium ${ui.text} ${mono ? "font-mono text-xs" : ""}`}>
        {value === undefined || value === null || value === "" ? "—" : String(value)}
      </p>
    </div>
  );
}

function Stat({ label, value, icon: Icon }) {
  const { ui, summaryLoading } = useContext(PageUiContext);
  return (
    <div className={`rounded-2xl border p-4 transition-shadow hover:shadow-md ${ui.card}`}>
      <div className="flex items-center justify-between gap-2">
        <p className={`text-xs ${ui.secondary}`}>{label}</p>
        {Icon && <Icon size={17} className="text-orange-500" />}
      </div>
      <p className={`mt-3 break-words text-xl font-extrabold ${ui.text}`}>
        {summaryLoading ? <Loader2 size={19} className="animate-spin" /> : (value ?? 0)}
      </p>
    </div>
  );
}

function BookCover({ item, className = "" }) {
  const { ui } = useContext(PageUiContext);
  return (
    <div className={`shrink-0 overflow-hidden rounded-2xl border ${ui.border} ${ui.soft} ${className}`}>
      {item?.coverPageUrl ? (
        <img src={item.coverPageUrl} alt={`${item.title || "Book"} cover`} className="h-full w-full object-contain" loading="lazy" />
      ) : (
        <div className="flex h-full items-center justify-center"><BookOpen size={27} className={ui.secondary} /></div>
      )}
    </div>
  );
}

// A relative product route must open on the website, not the current admin route.
const storefrontUrl = (path) => {
  if (!path) return "";
  try { return new URL(path, "https://www.targettrek.in").href; }
  catch { return ""; }
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AdminBookDetails() {
  const navigate = useNavigate();
  const { bookId } = useParams();

  const token = useSelector((state) => state.auth.token);

  // THEME
  const [theme, setTheme] = useState(readTheme);
  const dark = theme === "dark";

  // BOOK
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  // ANALYTICS
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [breakdown, setBreakdown] = useState(EMPTY_BREAKDOWN);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  // EDIT FORM
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [originalForm, setOriginalForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [updating, setUpdating] = useState(false);

  // FILES
  const [coverFile, setCoverFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState("");

  const coverInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const previewObjectUrlRef = useRef("");

  // BUNDLE BOOKS
  const [availableBooks, setAvailableBooks] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [availableError, setAvailableError] = useState("");
  const [bookSearch, setBookSearch] = useState("");
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const [originalBookIds, setOriginalBookIds] = useState([]);

  // DELETE
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ===================================================
  // THEME SYNC
  // ===================================================

  useEffect(() => {
    const syncTheme = (event) => {
      const next = event?.detail?.theme;

      if (next === "dark" || next === "light") {
        setTheme(next);
      } else {
        setTheme(readTheme());
      }
    };

    const handleStorage = (event) => {
      if (!event || event.key === THEME_KEY) {
        setTheme(readTheme());
      }
    };

    setTheme(readTheme());

    window.addEventListener(THEME_EVENT, syncTheme);
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", syncTheme);

    // Changes made through this hook below can be
    // observed even when localStorage.setItem is
    // called by the navbar without dispatching an event.
    // Same-tab storage events are NOT emitted natively.
    const originalSetItem = Storage.prototype.setItem;

    const patchedSetItem = function (key, value) {
      originalSetItem.call(this, key, value);

      if (
        this === window.localStorage &&
        key === THEME_KEY
      ) {
        window.dispatchEvent(
          new CustomEvent(THEME_EVENT, {
            detail: {
              theme: value,
            },
          })
        );
      }
    };

    Storage.prototype.setItem = patchedSetItem;

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", syncTheme);

      if (Storage.prototype.setItem === patchedSetItem) {
        Storage.prototype.setItem = originalSetItem;
      }
    };
  }, []);

  // ===================================================
  // THEME CLASSES
  // ===================================================

  const ui = useMemo(
    () => ({
      page: dark
        ? "bg-[#100D0A] text-slate-100"
        : "bg-[#FFFAF5] text-slate-900",

      card: dark
        ? "bg-[#1F1813] border-slate-800"
        : "bg-white border-slate-200",

      soft: dark
        ? "bg-[#18120F]"
        : "bg-slate-50",

      text: dark
        ? "text-slate-100"
        : "text-slate-950",

      secondary: dark
        ? "text-slate-400"
        : "text-slate-500",

      border: dark
        ? "border-slate-800"
        : "border-slate-200",

      input: dark
        ? "bg-[#18120F] text-white border-slate-700 placeholder:text-slate-500"
        : "bg-white text-slate-900 border-slate-200 placeholder:text-slate-400",

      buttonSecondary: dark
        ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",

      selected: dark
        ? "border-orange-500 bg-orange-950/30"
        : "border-orange-500 bg-orange-50",

      hover: dark
        ? "hover:bg-slate-800/60"
        : "hover:bg-slate-50",
    }),
    [dark]
  );

  const panelClass = `rounded-[24px] border p-5 sm:p-6 shadow-sm ${ui.card}`;

  const inputClass = `
    w-full rounded-xl border px-3.5 py-3
    text-sm outline-none transition
    focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20
    ${ui.input}
  `;

  const secondaryButton = `
    inline-flex items-center justify-center gap-2
    rounded-xl border px-4 py-2.5 text-sm
    font-semibold transition
    ${ui.buttonSecondary}
  `;

  const primaryButton = `
    inline-flex items-center justify-center gap-2
    rounded-xl bg-orange-600 px-5 py-2.5
    text-sm font-bold text-white transition
    hover:bg-orange-700 disabled:opacity-50
    disabled:cursor-not-allowed
  `;

  useEffect(() => {
    if (!editMode) return;
    const id = requestAnimationFrame(() => {
      document.getElementById("bundle-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(id);
  }, [editMode]);

  const isBundle = book?.resourceType === "bundle";
  const editingBundle = form.resourceType === "bundle";

  // ===================================================
  // AUTHORIZED FETCH HELPER
  // ===================================================

  const getHeaders = useCallback(
    () => ({
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    }),
    [token]
  );

  // ===================================================
  // GET BOOK DETAILS
  // ===================================================

  const fetchBook = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");
        setNotFound(false);

        if (!bookId) {
          setNotFound(true);
          return;
        }

        if (!token) {
          throw new Error(
            "Authentication token missing. Please log in again."
          );
        }

        const response = await fetch(
          `${API}/book/admin/${encodeURIComponent(bookId)}`,
          {
            method: "GET",
            headers: getHeaders(),
            signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (response.status === 404) {
          setNotFound(true);
          setBook(null);
          return;
        }

        if (!response.ok || !result?.success) {
          throw new Error(
            getErrorMessage(result, "Unable to load book.")
          );
        }

        const fetchedBook = result.data;

        if (!fetchedBook) {
          throw new Error("Book data was not returned.");
        }

        const nextForm = createFormFromBook(fetchedBook);

        const ids = Array.isArray(fetchedBook.includedBooks)
          ? fetchedBook.includedBooks.map(getId).filter(Boolean)
          : [];

        if (signal?.aborted) return;

        setBook(fetchedBook);
        setForm(nextForm);
        setOriginalForm(nextForm);

        setSelectedBookIds(ids);
        setOriginalBookIds(ids);

        setCoverPreview(fetchedBook.coverPageUrl || "");
      } catch (err) {
        if (err?.name === "AbortError") return;

        console.error("Fetch book:", err);
        setError(err.message || "Unable to load book.");
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [bookId, token, getHeaders]
  );

  // ===================================================
  // GET AVAILABLE BOOKS FOR BUNDLE
  // ===================================================

  const fetchAvailableBooks = useCallback(
    async (signal) => {
      try {
        setAvailableLoading(true);
        setAvailableError("");

        const response = await fetch(
          `${API}/book`,
          {
            headers: {
              Accept: "application/json",
            },
            signal,
            cache: "no-store",
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || result?.success === false) {
          throw new Error(
            getErrorMessage(result, "Unable to load available books.")
          );
        }

        const records = Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result)
            ? result
            : [];

        const normalized = records
          .map(normalizeBook)
          .filter(Boolean)
          .filter((item) =>
            ["ebook", "pdf"].includes(item.resourceType)
          )
          .filter((item) => item._id !== bookId);

        if (signal?.aborted) return;

        setAvailableBooks(normalized);
      } catch (err) {
        if (err?.name === "AbortError") return;

        console.error("Fetch available books:", err);

        setAvailableError(
          err.message || "Unable to load available books."
        );
      } finally {
        if (!signal?.aborted) {
          setAvailableLoading(false);
        }
      }
    },
    [bookId]
  );

  // ===================================================
  // PAYMENT SUMMARY
  // ===================================================

  const fetchPaymentSummary = useCallback(
    async (signal) => {
      try {
        if (!bookId || !token) return;

        setSummaryLoading(true);
        setSummaryError("");

        const response = await fetch(
          `${API}/admin/books/${encodeURIComponent(bookId)}/payments/page/1`,
          {
            headers: getHeaders(),
            signal,
          }
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || result?.success !== true) {
          throw new Error(
            getErrorMessage(result, "Unable to load payment analytics.")
          );
        }

        const incoming = result?.data?.summary || {};

        if (signal?.aborted) return;

        setSummary({
          ...EMPTY_SUMMARY,
          ...incoming,

          payments: {
            ...EMPTY_SUMMARY.payments,
            ...(incoming.payments || {}),
          },

          refunds: {
            ...EMPTY_SUMMARY.refunds,
            ...(incoming.refunds || {}),
          },

          coupons: {
            ...EMPTY_SUMMARY.coupons,
            ...(incoming.coupons || {}),
          },

          reminderMails: {
            ...EMPTY_SUMMARY.reminderMails,
            ...(incoming.reminderMails || {}),
          },

          access: {
            ...EMPTY_SUMMARY.access,
            ...(incoming.access || {}),
          },

          verification: {
            ...EMPTY_SUMMARY.verification,
            ...(incoming.verification || {}),
          },

          affiliates: {
            ...EMPTY_SUMMARY.affiliates,
            ...(incoming.affiliates || {}),
          },
        });

        setBreakdown({
          ...EMPTY_BREAKDOWN,
          ...(result?.data?.breakdown || {}),
        });
      } catch (err) {
        if (err?.name === "AbortError") return;

        console.error("Payment summary:", err);

        setSummaryError(
          err.message || "Unable to load payment analytics."
        );
      } finally {
        if (!signal?.aborted) {
          setSummaryLoading(false);
        }
      }
    },
    [bookId, token, getHeaders]
  );

  // ===================================================
  // INITIAL LOADING
  // ===================================================

  useEffect(() => {
    const controller = new AbortController();

    fetchBook(controller.signal);
    fetchPaymentSummary(controller.signal);
    fetchAvailableBooks(controller.signal);

    return () => controller.abort();
  }, [
    fetchBook,
    fetchPaymentSummary,
    fetchAvailableBooks,
  ]);

  // ===================================================
  // FILE PREVIEW CLEANUP
  // ===================================================

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  // ===================================================
  // BUNDLE CONTENTS
  // ===================================================

  const includedBooks = useMemo(() => {
    if (!Array.isArray(book?.includedBooks)) {
      return [];
    }

    return book.includedBooks
      .map((entry) => {
        if (typeof entry === "object" && entry !== null) {
          return normalizeBook(entry);
        }

        // If the backend returns only ObjectIds,
        // resolve the details from GET /book.
        const id = getId(entry);

        return (
          availableBooks.find((item) => item._id === id) ||
          {
            _id: id,
            title: `Book ${id}`,
            resourceType: "ebook",
            coverPageUrl: "",
            price: 0,
            mrp: 0,
            currency: book?.currency || "INR",
          }
        );
      })
      .filter(Boolean);
  }, [book, availableBooks]);

  const availableBooksMap = useMemo(
    () => {
      const map = new Map();

      for (const item of availableBooks) {
        map.set(item._id, item);
      }

      for (const item of includedBooks) {
        map.set(item._id, item);
      }

      return map;
    },
    [availableBooks, includedBooks]
  );

  const selectedBooks = useMemo(
    () =>
      selectedBookIds
        .map((id) => availableBooksMap.get(id))
        .filter(Boolean),
    [selectedBookIds, availableBooksMap]
  );

  const filteredBooks = useMemo(() => {
    const term = bookSearch.toLowerCase().trim();

    if (!term) return availableBooks;

    return availableBooks.filter(
      (item) =>
        item.title.toLowerCase().includes(term) ||
        (item.slug || "").toLowerCase().includes(term) ||
        (item.category || "").toLowerCase().includes(term)
    );
  }, [availableBooks, bookSearch]);

  const toggleIncludedBook = (id) => {
    setSelectedBookIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );

    setErrors((prev) => ({
      ...prev,
      includedBooks: "",
    }));
  };

  const combinedMrp = selectedBooks.reduce(
    (sum, item) => sum + (item.mrp || item.price || 0),
    0
  );

  // ===================================================
  // CHANGE DETECTION
  // ===================================================

  const formChanged = useMemo(() => {
    const normalize = (value) => JSON.stringify({
      ...value,
      title: value.title.trim(),
      slug: value.slug.trim(),
      price: String(value.price),
      mrp: String(value.mrp),
    });

    return normalize(form) !== normalize(originalForm);
  }, [form, originalForm]);

  const bundleChanged = useMemo(() => {
    const a = [...selectedBookIds].sort();
    const b = [...originalBookIds].sort();

    return JSON.stringify(a) !== JSON.stringify(b);
  }, [selectedBookIds, originalBookIds]);

  const hasChanges =
    formChanged ||
    (editingBundle && bundleChanged) ||
    Boolean(coverFile) ||
    Boolean(pdfFile);

  // ===================================================
  // EDIT HANDLERS
  // ===================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "currency"
        ? value.toUpperCase()
        : name === "slug" || name === "pageKey"
          ? value.toLowerCase()
          : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const setBooleanField = (name, value) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const next = {};

    if (form.title.trim().length < 3) {
      next.title = "Title must contain at least 3 characters.";
    }

    if (!slugPattern.test(form.slug.trim())) {
      next.slug = "Invalid slug.";
    }

    if (!slugPattern.test(form.pageKey.trim())) {
      next.pageKey = "Invalid page key.";
    }

    if (
      form.price === "" ||
      !Number.isFinite(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      next.price = "Enter a valid price.";
    }

    if (
      form.mrp === "" ||
      !Number.isFinite(Number(form.mrp)) ||
      Number(form.mrp) < 0 ||
      Number(form.mrp) < Number(form.price)
    ) {
      next.mrp = "MRP must be equal to or higher than price.";
    }

    if (!/^[A-Z]{3}$/.test(form.currency)) {
      next.currency = "Invalid currency.";
    }

    if (!isValidHttpUrl(form.paymentUrl)) {
      next.paymentUrl = "Invalid payment URL.";
    }

    if (!isValidPath(form.redirectUrl)) {
      next.redirectUrl = "Invalid redirect URL.";
    }

    if (editingBundle) {
      if (selectedBookIds.length === 0) {
        next.includedBooks = "Select at least one book.";
      }

      if (selectedBooks.length !== selectedBookIds.length) {
        next.includedBooks =
          "Some selected books could not be resolved.";
      }
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  // ===================================================
  // FILE CHANGE HANDLERS
  // ===================================================

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      toast.error("Cover must be JPG, PNG, or WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Maximum cover size is 10 MB.");
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
    }

    const url = URL.createObjectURL(file);

    previewObjectUrlRef.current = url;

    setCoverFile(file);
    setCoverPreview(url);
  };

  const handlePdfChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      toast.error("Only PDF files are allowed.");
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error("Maximum PDF size is 100 MB.");
      return;
    }

    setPdfFile(file);
  };

  const cancelEdit = () => {
    setForm({ ...originalForm });
    setSelectedBookIds([...originalBookIds]);

    setErrors({});
    setCoverFile(null);
    setPdfFile(null);

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = "";
    }

    setCoverPreview(book?.coverPageUrl || "");

    if (coverInputRef.current) coverInputRef.current.value = "";
    if (pdfInputRef.current) pdfInputRef.current.value = "";

    setEditMode(false);
  };

  // ===================================================
  // UPDATE BOOK / BUNDLE
  // ===================================================

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (updating || !hasChanges) return;
    if (!validateForm()) return;

    if (!token) {
      toast.error("Please log in again.");
      return;
    }

    try {
      setUpdating(true);

      const data = new FormData();

      const fields = [
        "title",
        "slug",
        "subtitle",
        "description",
        "resourceType",
        "currency",
        "paymentUrl",
        "redirectUrl",
        "pageKey",
        "fileName",
        "category",
        "badge",
      ];

      for (const field of fields) {
        data.append(
          field,
          String(form[field] || "").trim()
        );
      }

      data.append("price", String(Number(form.price)));
      data.append("mrp", String(Number(form.mrp)));

      for (const field of ["tags", "topics", "highlights"]) {
        data.append(field, JSON.stringify(toArray(form[field])));
      }

      for (const field of [
        "isPublished",
        "isActive",
        "isFeatured",
      ]) {
        data.append(field, String(form[field]));
      }

      // Critical: updated bundle membership.
      data.append(
        "includedBooks",
        JSON.stringify(
          editingBundle ? selectedBookIds : []
        )
      );

      if (coverFile) {
        data.append("coverPage", coverFile);
      }

      if (pdfFile && !editingBundle) {
        data.append("pdf", pdfFile);
      }

      const response = await fetch(
        `${API}/book/admin/${encodeURIComponent(bookId)}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.success !== true) {
        throw new Error(
          getErrorMessage(result, "Unable to update book.")
        );
      }

      // Always re-fetch to ensure includedBooks are
      // populated with current titles and covers.
      await fetchBook();

      setCoverFile(null);
      setPdfFile(null);
      setErrors({});
      setEditMode(false);

      if (coverInputRef.current) coverInputRef.current.value = "";
      if (pdfInputRef.current) pdfInputRef.current.value = "";

      toast.success(
        editingBundle
          ? "Bundle updated successfully."
          : "Book updated successfully."
      );
    } catch (err) {
      console.error("Update book error:", err);
      toast.error(err.message || "Unable to update book.");
    } finally {
      setUpdating(false);
    }
  };

  // ===================================================
  // DELETE PRODUCT
  // ===================================================

  const handleDelete = async () => {
    try {
      setDeleting(true);

      const response = await fetch(
        `${API}/book/admin/${encodeURIComponent(bookId)}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result, "Unable to delete product.")
        );
      }

      toast.success("Product deleted successfully.");

      navigate("/admin/books", {
        replace: true,
      });
    } catch (err) {
      console.error("Delete product:", err);
      toast.error(err.message || "Unable to delete.");
    } finally {
      setDeleting(false);
    }
  };

  // Components below are module-level, so editing an input never
  // changes its React component type or remounts the DOM element.
  const localColors = {
    "--tt-orange": dark ? "#FB923C" : "#EA580C",
    "--tt-orange-soft": dark ? "#3A2416" : "#FFF0E1",
    "--tt-orange-border": dark ? "#7C3E1B" : "#FED7AA",
  };

  const pageContext = {
    ui, panelClass, inputClass, form, errors, handleChange,
    summaryLoading,
  };

  // ===================================================
  // LOADING / ERROR
  // ===================================================

  if (loading) {
    return (
      <main className={`min-h-screen mt-16 pt-6 ${ui.page}`}>
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="text-center">
            <Loader2
              size={36}
              className="mx-auto animate-spin text-orange-500"
            />
            <p className={`mt-4 ${ui.secondary}`}>
              Loading product details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (notFound || error || !book) {
    return (
      <main className={`min-h-screen mt-16 px-4 pt-6 ${ui.page}`}>
        <div className={`mx-auto max-w-lg rounded-2xl border p-8 text-center ${ui.card}`}>
          <AlertCircle
            size={35}
            className="mx-auto text-red-500"
          />

          <h1 className={`mt-4 text-2xl font-bold ${ui.text}`}>
            {notFound ? "Product Not Found" : "Unable to Load Product"}
          </h1>

          <p className={`mt-3 text-sm ${ui.secondary}`}>
            {error || "This product could not be found."}
          </p>

          <button
            onClick={() => navigate("/admin/books")}
            className={`${primaryButton} mt-6`}
          >
            <ArrowLeft size={16} />
            Back to Books
          </button>
        </div>
      </main>
    );
  }

  const currency = book.currency || "INR";

  const isEditing = editMode;

  // ===================================================
  // MAIN PAGE
  // ===================================================

  return (
    <PageUiContext.Provider value={pageContext}>
      <Helmet>
        <title>{book.title} | Target Trek Admin</title>
      </Helmet>

    

      <main style={localColors} className={`min-h-screen mt-16 pb-20 pt-6 ${ui.page}`}>
        <div className="mx-auto max-w-[1450px] px-4 sm:px-6 lg:px-8">

          {/* HEADER NAV */}

          <button
            type="button"
            onClick={() => navigate("/admin/books")}
            className={`mb-6 inline-flex items-center gap-2 text-sm font-semibold ${ui.secondary}`}
          >
            <ArrowLeft size={17} />
            Back to Books
          </button>

          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--tt-orange)]">Target Trek / Product management</p>
              <h2 className={`mt-1 text-2xl font-black tracking-tight sm:text-3xl ${ui.text}`}>Product overview</h2>
              <p className={`mt-1 text-sm ${ui.secondary}`}>Content, pricing, storefront links, delivery files and transactions.</p>
            </div>
            <span className="rounded-full border border-[var(--tt-orange-border)] bg-[var(--tt-orange-soft)] px-3 py-1.5 text-xs font-bold text-[var(--tt-orange)]">Live product record</span>
          </div>

          {/* PRODUCT HERO */}

          <section className={panelClass}>
            <div className="flex flex-col gap-7 md:flex-row md:items-start">

              <BookCover
                item={book}
                className="h-[280px] w-[196px] self-center shadow-xl md:self-start"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-500">
                    {book.resourceType?.toUpperCase()}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      book.isPublished
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-slate-500/10 text-slate-400"
                    }`}
                  >
                    {book.isPublished ? "Published" : "Draft"}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      book.isActive
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {book.isActive ? "Active" : "Inactive"}
                  </span>

                  {book.isFeatured && (
                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-500">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className={`mt-4 text-3xl font-black tracking-tight sm:text-4xl ${ui.text}`}>
                  {book.title}
                </h1>

                {book.subtitle && (
                  <p className={`mt-2 text-sm leading-6 ${ui.secondary}`}>
                    {book.subtitle}
                  </p>
                )}

                <div className="mt-4 flex items-end gap-3">
                  <strong className={`text-2xl ${ui.text}`}>
                    {money(book.price, currency)}
                  </strong>

                  {Number(book.mrp) > Number(book.price) && (
                    <span className={`text-sm line-through ${ui.secondary}`}>
                      {money(book.mrp, currency)}
                    </span>
                  )}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setEditMode(!editMode)}
                    className={primaryButton}
                  >
                    <Edit3 size={16} />
                    {editMode ? "Close Editor" : "Edit Product"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/admin/book/${bookId}/payments`)
                    }
                    className={secondaryButton}
                  >
                    <CreditCard size={16} />
                    Payments
                  </button>

                  {book.redirectUrl && (
                    <a
                      href={storefrontUrl(book.redirectUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={secondaryButton}
                    >
                      <ExternalLink size={16} />
                      Open Product
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteModal(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* BUNDLE DETAILS */}

          {isBundle && (
            <section className={`mt-6 ${panelClass}`}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Package size={21} className="text-orange-500" />

                    <h2 className={`text-lg font-bold ${ui.text}`}>
                      Books Included in This Bundle
                    </h2>
                  </div>

                  <p className={`mt-1 text-sm ${ui.secondary}`}>
                    {includedBooks.length} books delivered with one purchase.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditMode(true);


                  }}
                  className={secondaryButton}
                >
                  <Edit3 size={16} />
                  Edit Included Books
                </button>
              </div>

              {includedBooks.length > 0 ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  {includedBooks.map((item, index) => (
                    <div
                      key={item._id}
                      className={`flex items-start gap-4 rounded-xl border p-4 ${ui.border} ${ui.soft}`}
                    >
                      <BookCover
                        item={item}
                        className="h-28 w-20"
                      />

                      <div className="min-w-0 flex-1">
                        <p className={`text-xs ${ui.secondary}`}>
                          BOOK {index + 1}
                        </p>

                        <h3 className={`mt-1 text-sm font-bold ${ui.text}`}>
                          {item.title}
                        </h3>

                        {item.subtitle && (
                          <p className={`mt-1 text-xs ${ui.secondary}`}>
                            {item.subtitle}
                          </p>
                        )}

                        <p className="mt-3 text-sm font-bold text-orange-500">
                          {money(item.price, item.currency)}
                        </p>

                        <span className={`mt-2 block break-all font-mono text-[10px] ${ui.secondary}`}>
                          {item._id}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`rounded-xl p-5 ${ui.soft}`}>
                  <p className={ui.secondary}>
                    No included books are configured.
                  </p>
                </div>
              )}
            </section>
          )}

          {/* STATS */}

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            <Stat
              icon={Eye}
              label="Views"
              value={book.stats?.views || 0}
            />

            <Stat
              icon={Users}
              label="Purchases"
              value={book.stats?.purchases || 0}
            />

            <Stat
              icon={Receipt}
              label="Total Orders"
              value={summary.totalOrders}
            />

            <Stat
              icon={CheckCircle2}
              label="Paid Orders"
              value={summary.payments.paidOrders}
            />

            <Stat
              icon={CircleDollarSign}
              label="Gross Paid"
              value={money(
                summary.payments.grossPaidAmount,
                currency
              )}
            />

            <Stat
              icon={WalletCards}
              label="Net Revenue"
              value={money(
                summary.payments.netRevenue,
                currency
              )}
            />
          </div>

          {/* ANALYTICS */}

          <div className="mt-6 space-y-6">
            <Panel
              title="Order & Payment Overview"
              subtitle="Financial totals for orders placed against this product."
            >
              {summaryError && (
                <p className="mb-4 text-sm text-red-500">
                  {summaryError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                {[
                  ["Successful", summary.payments.successfulPayments],
                  ["Failed", summary.payments.failedPayments],
                  ["Pending", summary.payments.pendingPayments],
                  ["Cancelled", summary.payments.cancelledPayments],
                  ["Fully Refunded", summary.payments.fullyRefundedPayments],
                  ["Partially Refunded", summary.payments.partiallyRefundedPayments],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className={`rounded-xl border p-4 ${ui.border} ${ui.soft}`}
                  >
                    <p className={`text-xs ${ui.secondary}`}>
                      {label}
                    </p>

                    <p className={`mt-2 text-xl font-bold ${ui.text}`}>
                      {summaryLoading ? "..." : value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Successful Amount", summary.payments.successfulAmount],
                  ["Failed Amount", summary.payments.failedAmount],
                  ["Pending Amount", summary.payments.pendingAmount],
                  ["Total Order Amount", summary.totalOrderAmount],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className={`rounded-xl border p-4 ${ui.border} ${ui.soft}`}
                  >
                    <p className={`text-xs ${ui.secondary}`}>
                      {label}
                    </p>

                    <p className={`mt-2 text-lg font-bold ${ui.text}`}>
                      {summaryLoading ? "..." : money(value, currency)}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <Panel title="Refund Overview">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {[
                      ["Refund Orders", summary.refunds.refundOrders],
                      ["Pending", summary.refunds.pendingRefunds],
                      ["Processing", summary.refunds.processingRefunds],
                      ["Completed", summary.refunds.completedRefunds],
                      ["Failed", summary.refunds.failedRefunds],
                      ["Partial", summary.refunds.partialRefunds],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className={`rounded-xl p-4 ${ui.soft}`}
                      >
                        <p className={`text-xs ${ui.secondary}`}>
                          {label}
                        </p>

                        <p className={`mt-2 text-xl font-bold ${ui.text}`}>
                          {summaryLoading ? "..." : value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className={`mt-5 grid gap-4 border-t pt-5 md:grid-cols-3 ${ui.border}`}>
                    <Detail
                      label="Requested Refund"
                      value={money(
                        summary.refunds.totalRefundRequestedAmount,
                        currency
                      )}
                    />

                    <Detail
                      label="Refunded Amount"
                      value={money(
                        summary.refunds.totalRefundedAmount,
                        currency
                      )}
                    />

                    <Detail
                      label="Remaining Refund"
                      value={money(
                        summary.refunds.totalRefundRemainingAmount,
                        currency
                      )}
                    />
                  </div>
                </Panel>
              </div>

              <Panel title="Coupons, Mail & Affiliates">
                <Detail
                  label="Coupon Orders"
                  value={summary.coupons.couponAppliedOrders}
                />
                <Detail
                  label="Coupon Discount"
                  value={money(summary.coupons.totalDiscountAmount, currency)}
                />
                <Detail
                  label="Reminder Mails Sent"
                  value={summary.reminderMails.totalSent}
                />
                <Detail
                  label="Orders Reminded"
                  value={summary.reminderMails.ordersWithReminderMail}
                />
                <Detail
                  label="Failed Reminder Status"
                  value={summary.reminderMails.lastStatusFailed}
                />
                <Detail
                  label="First Reminder"
                  value={formatDate(summary.reminderMails.firstMailSentAt)}
                />
                <Detail
                  label="Last Reminder"
                  value={formatDate(summary.reminderMails.lastMailSentAt)}
                />
                <Detail
                  label="Affiliate Orders"
                  value={summary.affiliates.affiliateOrders}
                />
              </Panel>
            </div>

            {(breakdown.paymentStatus?.length > 0 ||
              breakdown.refundStatus?.length > 0) && (
              <Panel title="Payment & Refund Breakdown">
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    ["Payment Status", breakdown.paymentStatus],
                    ["Refund Status", breakdown.refundStatus],
                  ].map(([title, items]) => (
                    <div key={title}>
                      <h3 className={`mb-3 text-sm font-bold ${ui.text}`}>
                        {title}
                      </h3>

                      <div className="space-y-2">
                        {items.map((item, index) => (
                          <div
                            key={index}
                            className={`flex items-center justify-between rounded-lg border p-3 ${ui.border}`}
                          >
                            <span className={`text-xs ${ui.secondary}`}>
                              {item._id || item.status || "Unknown"}
                            </span>

                            <strong className={`text-sm ${ui.text}`}>
                              {item.count ?? 0}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>

          {/* =====================================
              EDITOR
          ===================================== */}

          {isEditing ? (
            <form
              id="bundle-editor"
              onSubmit={handleUpdate}
              className="mt-8 space-y-6 scroll-mt-24"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className={`text-2xl font-bold ${ui.text}`}>
                    Edit Product
                  </h2>

                  <p className={`mt-1 text-sm ${ui.secondary}`}>
                    Update details, files, publishing settings, and bundle contents.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cancelEdit}
                  className={secondaryButton}
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>

              {/* BUNDLE BOOK EDITOR */}

              {editingBundle && (
                <Panel
                  title="Edit Books Included in Bundle"
                  subtitle="Select or remove existing ebooks. The backend receives their IDs as includedBooks."
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <span className="rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-500">
                      {selectedBookIds.length} selected
                    </span>

                    <button
                      type="button"
                      onClick={() => fetchAvailableBooks()}
                      className={secondaryButton}
                    >
                      <RefreshCw size={16} />
                      Refresh
                    </button>
                  </div>

                  <div className="relative">
                    <Search
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="search"
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      placeholder="Search existing books..."
                      className={`${inputClass} pl-11`}
                    />
                  </div>

                  {availableError && (
                    <div className="mt-4 rounded-xl border border-red-500/30 p-4 text-sm text-red-500">
                      {availableError}
                    </div>
                  )}

                  {availableLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2
                        className="animate-spin text-orange-500"
                      />
                    </div>
                  ) : (
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {filteredBooks.map((item) => {
                        const selected =
                          selectedBookIds.includes(item._id);

                        return (
                          <label
                            key={item._id}
                            className={`
                              flex cursor-pointer items-start
                              gap-3 rounded-xl border p-3
                              ${selected ? ui.selected : ui.border}
                            `}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() =>
                                toggleIncludedBook(item._id)
                              }
                              className="mt-2 h-4 w-4 accent-orange-600"
                            />

                            <BookCover
                              item={item}
                              className="h-24 w-16"
                            />

                            <div className="min-w-0 flex-1">
                              <h3 className={`text-sm font-bold ${ui.text}`}>
                                {item.title}
                              </h3>

                              <p className={`mt-1 text-xs ${ui.secondary}`}>
                                {item.resourceType.toUpperCase()}
                              </p>

                              <p className="mt-2 text-sm font-bold text-orange-500">
                                {money(item.price, item.currency)}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {selectedBooks.length > 0 && (
                    <div className={`mt-6 rounded-xl border p-4 ${ui.border} ${ui.soft}`}>
                      <h3 className={`mb-3 font-bold ${ui.text}`}>
                        Selected Bundle Books
                      </h3>

                      <div className="space-y-2">
                        {selectedBooks.map((item, index) => (
                          <div
                            key={item._id}
                            className={`flex items-center justify-between gap-3 border-b py-2 last:border-0 ${ui.border}`}
                          >
                            <span className={`text-sm ${ui.text}`}>
                              {index + 1}. {item.title}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                toggleIncludedBook(item._id)
                              }
                              className="text-red-500"
                            >
                              <X size={17} />
                            </button>
                          </div>
                        ))}
                      </div>

                      <p className={`mt-4 text-xs ${ui.secondary}`}>
                        Combined reference MRP: {money(combinedMrp, form.currency)}
                      </p>
                    </div>
                  )}

                  {errors.includedBooks && (
                    <p className="mt-3 text-xs text-red-500">
                      {errors.includedBooks}
                    </p>
                  )}
                </Panel>
              )}

              {/* BASIC INFORMATION */}

              <Panel title="Basic Information">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Title" name="title" required />
                  <Field label="Slug" name="slug" required />
                  <Field label="Subtitle" name="subtitle" />

                  <div>
                    <label className={`mb-2 block text-xs font-bold ${ui.secondary}`}>
                      Resource Type
                    </label>

                    <select
                      value={form.resourceType}
                      onChange={(e) => {
                        const value = e.target.value;

                        setForm((prev) => ({
                          ...prev,
                          resourceType: value,
                        }));

                        if (value === "bundle") {
                          setPdfFile(null);
                        }
                      }}
                      className={inputClass}
                    >
                      {RESOURCE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <TextArea
                      label="Description"
                      name="description"
                      rows={5}
                    />
                  </div>
                </div>
              </Panel>

              {/* URLS */}

              <Panel title="Page & Checkout">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Page Key"
                    name="pageKey"
                    required
                  />

                  <Field
                    label="Redirect URL"
                    name="redirectUrl"
                    required
                  />

                  <div className="md:col-span-2">
                    <Field
                      label="Payment URL"
                      name="paymentUrl"
                      required
                    />
                  </div>
                </div>
              </Panel>

              {/* PRICE */}

              <Panel title="Pricing">
                <div className="grid gap-5 md:grid-cols-3">
                  <Field
                    label="Selling Price"
                    name="price"
                    type="number"
                    required
                    help="Enter the final selling price; decimals are supported."
                  />

                  <Field
                    label="MRP"
                    name="mrp"
                    type="number"
                  />

                  <Field
                    label="Currency"
                    name="currency"
                    required
                  />
                </div>
              </Panel>

              {/* METADATA */}

              <Panel title="Discovery & Metadata">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Category" name="category" />
                  <Field label="Badge" name="badge" />
                  <Field label="Tags" name="tags" />
                  <Field label="Topics" name="topics" />
                  <div className="md:col-span-2">
                    <TextArea label="Highlights" name="highlights" />
                  </div>
                </div>
              </Panel>

              {/* FILES */}

              <Panel title="Product Files">
                <div className="grid gap-5 md:grid-cols-2">

                  <div>
                    <p className={`mb-3 text-xs font-bold ${ui.secondary}`}>
                      Replace Cover
                    </p>

                    <label
                      className={`flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 ${ui.border} ${ui.soft}`}
                    >
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Cover"
                          className="max-h-[200px] max-w-full object-contain"
                        />
                      ) : (
                        <Upload size={30} className="text-orange-500" />
                      )}

                      <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {!editingBundle && (
                    <div>
                      <p className={`mb-3 text-xs font-bold ${ui.secondary}`}>
                        Replace PDF
                      </p>

                      <label
                        className={`flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 ${ui.border} ${ui.soft}`}
                      >
                        <FileText
                          size={35}
                          className="text-red-500"
                        />

                        <p className={`mt-3 text-xs ${ui.secondary}`}>
                          {pdfFile?.name || "Choose PDF"}
                        </p>

                        <input
                          ref={pdfInputRef}
                          type="file"
                          accept="application/pdf,.pdf"
                          onChange={handlePdfChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {!editingBundle && (
                  <div className="mt-5">
                    <Field
                      label="Display File Name"
                      name="fileName"
                    />
                  </div>
                )}

                {editingBundle && (
                  <p className={`mt-4 text-sm ${ui.secondary}`}>
                    Bundles do not need their own PDF. Each included book
                    retains its existing PDF.
                  </p>
                )}
              </Panel>

              {/* PUBLISHING */}

              <Panel title="Publishing Settings">
                <div className="space-y-3">
                  {[
                    ["isActive", "Active"],
                    ["isPublished", "Published"],
                    ["isFeatured", "Featured"],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className={`flex items-center justify-between rounded-xl border p-4 ${ui.border}`}
                    >
                      <span className={`text-sm font-bold ${ui.text}`}>
                        {label}
                      </span>

                      <input
                        type="checkbox"
                        checked={form[key]}
                        onChange={(e) =>
                          setBooleanField(key, e.target.checked)
                        }
                        className="h-5 w-5 accent-orange-600"
                      />
                    </label>
                  ))}
                </div>
              </Panel>

              {/* SAVE */}

              <div className={`sticky bottom-4 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 shadow-xl ${ui.card}`}>
                <p className={`text-sm ${ui.secondary}`}>
                  {hasChanges
                    ? "You have unsaved changes."
                    : "No changes to save."}
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className={secondaryButton}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updating || !hasChanges}
                    className={primaryButton}
                  >
                    {updating ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : (
                      <Save size={17} />
                    )}
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            // =====================================
            // READ ONLY DETAILS
            // =====================================
            <div className="mt-8 grid gap-6 xl:grid-cols-3">
              <div className="space-y-6 xl:col-span-2">

                <Panel title="Product Description">
                  <p className={`whitespace-pre-line text-sm leading-7 ${ui.secondary}`}>
                    {book.description || "No description available."}
                  </p>
                </Panel>

                <Panel title="Metadata">
                  {[
                    ["Slug", book.slug],
                    ["Page Key", book.pageKey],
                    ["Resource Type", book.resourceType],
                    ["Category", book.category],
                    ["Badge", book.badge],
                    ["Book ID", book._id],
                    ["Cover URL", book.coverPageUrl],
                    ["PDF URL", book.pdfUrl],
                    ["Language", book.language],
                    ["Format", book.format],
                    ["Edition", book.edition],
                    ["Created By", book.createdBy],
                    ["Updated By", book.updatedBy],
                    ["Created At", formatDate(book.createdAt)],
                    ["Updated At", formatDate(book.updatedAt)],
                  ].map(([label, value]) => (
                    <Detail
                      key={label}
                      label={label}
                      value={value}
                    />
                  ))}
                </Panel>

                <Panel title="Tags, Topics & Highlights">
                  {[
                    ["Tags", book.tags],
                    ["Topics", book.topics],
                    ["Highlights", book.highlights],
                  ].map(([label, values]) => (
                    <div key={label} className="mb-5 last:mb-0">
                      <p className={`mb-2 text-xs font-bold ${ui.secondary}`}>
                        {label}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(values) && values.length ? (
                          values.map((value, index) => (
                            <span
                              key={index}
                              className="rounded-full bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-500"
                            >
                              {value}
                            </span>
                          ))
                        ) : (
                          <span className={`text-xs ${ui.secondary}`}>
                            None
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </Panel>
              </div>

              <div className="space-y-6">
                <Panel title="Cover & Book URLs" subtitle="Original product assets and customer-facing pages">
                  <div className="mb-5 flex justify-center rounded-2xl bg-orange-500/5 p-4">
                    <BookCover item={book} className="h-[280px] w-[200px]" />
                  </div>
                  <Detail label="Cover Image URL" value={book.coverPageUrl} mono />
                  {isValidHttpUrl(book.coverPageUrl) && (
                    <a href={book.coverPageUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-orange-500"><ExternalLink size={14} /> Open cover image</a>
                  )}
                  <Detail label="Redirect URL" value={book.redirectUrl} mono />
                  {book.redirectUrl && (
                    <a href={storefrontUrl(book.redirectUrl)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-orange-500"><ExternalLink size={14} /> View product page</a>
                  )}
                  <Detail label="PDF URL" value={book.pdfUrl} mono />
                  {isValidHttpUrl(book.pdfUrl) && (
                    <a href={book.pdfUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-orange-500"><ExternalLink size={14} /> Open PDF</a>
                  )}
                  <Detail label="Payment URL" value={book.paymentUrl} mono />
                  {isValidHttpUrl(book.paymentUrl) && (
                    <a href={book.paymentUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-orange-500"><ExternalLink size={14} /> Open payment URL</a>
                  )}
                  <Detail
                    label="Delivery"
                    value={isBundle
                      ? `${includedBooks.length} separate ebooks`
                      : book.pdfUrl
                        ? "Single PDF"
                        : "No PDF configured"}
                  />
                  <Detail label="File Name" value={book.fileName} />
                </Panel>

                <Panel title="Engagement">
                  <Detail
                    label="Views"
                    value={book.stats?.views || 0}
                  />
                  <Detail
                    label="Purchases"
                    value={book.stats?.purchases || 0}
                  />
                  <Detail
                    label="Downloads"
                    value={book.stats?.downloads || 0}
                  />
                  <Detail
                    label="Access Count"
                    value={summary.access.totalAccessCount}
                  />
                  <Detail
                    label="Revoked Access Orders"
                    value={summary.access.revokedAccessOrders}
                  />
                </Panel>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* DELETE CONFIRMATION */}

      {deleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${ui.card}`}>
            <div className="flex items-center gap-3">
              <AlertCircle size={25} className="text-red-500" />

              <h2 className={`text-xl font-bold ${ui.text}`}>
                Delete Product?
              </h2>
            </div>

            <p className={`mt-4 text-sm leading-7 ${ui.secondary}`}>
              Are you sure you want to delete{" "}
              <strong>{book.title}</strong>?
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                className={secondaryButton}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </PageUiContext.Provider>
  );
}
