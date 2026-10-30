// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import axios from "axios";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";

// import {
//   AlertCircle,
//   BookOpen,
//   Check,
//   CheckCircle2,
//   ChevronDown,
//   FileText,
//   ImagePlus,
//   Layers3,
//   Loader2,
//   Package,
//   Plus,
//   RefreshCw,
//   Search,
//   Trash2,
//   UploadCloud,
//   X,
// } from "lucide-react";

// import BASE_URL from "../utils/Url";

// // =====================================================
// // API CONFIGURATION
// // =====================================================

// const API_BASE = String(BASE_URL || "")
//   .trim()
//   .replace(/\/+$/, "");

// const GET_BOOKS_URL = `${API_BASE}/book`;

// const CREATE_BOOK_URL =
//   `${API_BASE}/book/admin/create`;

// const RESOURCE_TYPES = [
//   { value: "ebook", label: "eBook" },
//   { value: "pdf", label: "PDF" },
//   { value: "bundle", label: "Book Bundle" },
//   { value: "course", label: "Course" },
//   { value: "template", label: "Template" },
//   { value: "notes", label: "Notes" },
//   { value: "other", label: "Other" },
// ];

// // Start as bundle so selector is immediately visible.
// const INITIAL_FORM = {
//   title: "",
//   slug: "",
//   subtitle: "",
//   description: "",
//   resourceType: "bundle",
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

// const inputClass =
//   "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

// const labelClass =
//   "mb-2 block text-sm font-semibold text-slate-700";

// // =====================================================
// // UTILITY FUNCTIONS
// // =====================================================

// const slugify = (value = "") =>
//   String(value)
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/^-|-$/g, "");

// const commaToArray = (value = "") =>
//   String(value)
//     .split(",")
//     .map((item) => item.trim())
//     .filter(Boolean);

// const formatMoney = (
//   amount,
//   currency = "INR"
// ) => {
//   const number = Number(amount);

//   if (!Number.isFinite(number)) {
//     return "-";
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

// const getApiError = (error) => {
//   const data = error?.response?.data;

//   return (
//     data?.error?.message ||
//     data?.message ||
//     error?.message ||
//     "Request failed."
//   );
// };

// const normalizeBooksResponse = (payload) => {
//   // Standard controller response:
//   // { success: true, count, data: [...] }

//   if (Array.isArray(payload)) {
//     return payload;
//   }

//   if (Array.isArray(payload?.data)) {
//     return payload.data;
//   }

//   // Compatible with nested wrappers if introduced.
//   if (Array.isArray(payload?.data?.books)) {
//     return payload.data.books;
//   }

//   if (Array.isArray(payload?.books)) {
//     return payload.books;
//   }

//   throw new Error(
//     "GET /book did not return a recognized books array."
//   );
// };

// const normalizeBook = (record) => {
//   if (!record) return null;

//   const id =
//     record._id ||
//     record.id;

//   if (!id) return null;

//   return {
//     id: String(id),
//     title: record.title || "Untitled Book",
//     subtitle: record.subtitle || "",
//     slug: record.slug || "",
//     category: record.category || "",
//     resourceType: record.resourceType || "ebook",
//     price: Number(record.price) || 0,
//     mrp: Number(record.mrp) || 0,
//     currency: record.currency || "INR",
//     coverPageUrl: record.coverPageUrl || "",
//     isPublished: record.isPublished !== false,
//     isActive: record.isActive !== false,
//   };
// };

// const validHttpUrl = (value) => {
//   try {
//     const url = new URL(value);

//     return (
//       url.protocol === "http:" ||
//       url.protocol === "https:"
//     );
//   } catch {
//     return false;
//   }
// };

// const validRedirectUrl = (value) => {
//   const path = String(value || "").trim();

//   return (
//     path.length > 1 &&
//     path.startsWith("/") &&
//     !path.startsWith("//") &&
//     !/[\r\n\\]/.test(path)
//   );
// };

// // =====================================================
// // REUSABLE UI COMPONENTS
// // =====================================================

// function Panel({
//   title,
//   description,
//   children,
//   className = "",
// }) {
//   return (
//     <section
//       className={`
//         rounded-2xl border border-slate-200
//         bg-white p-5 shadow-sm sm:p-6
//         ${className}
//       `}
//     >
//       <div className="mb-5">
//         <h2 className="text-lg font-bold text-slate-950">
//           {title}
//         </h2>

//         {description && (
//           <p className="mt-1 text-sm leading-6 text-slate-500">
//             {description}
//           </p>
//         )}
//       </div>

//       {children}
//     </section>
//   );
// }

// function InputField({
//   label,
//   name,
//   value,
//   onChange,
//   error,
//   required = false,
//   helper,
//   className = "",
//   ...props
// }) {
//   return (
//     <div className={className}>
//       <label
//         htmlFor={name}
//         className={labelClass}
//       >
//         {label}
//         {required && (
//           <span className="ml-1 text-red-500">*</span>
//         )}
//       </label>

//       <input
//         id={name}
//         name={name}
//         value={value}
//         onChange={onChange}
//         className={`${inputClass} ${
//           error ? "border-red-400" : ""
//         }`}
//         {...props}
//       />

//       {helper && (
//         <p className="mt-1.5 text-xs leading-5 text-slate-500">
//           {helper}
//         </p>
//       )}

//       {error && (
//         <p className="mt-1.5 text-xs font-medium text-red-600">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }

// function TextAreaField({
//   label,
//   name,
//   value,
//   onChange,
//   rows = 4,
//   placeholder,
//   helper,
// }) {
//   return (
//     <div>
//       <label
//         htmlFor={name}
//         className={labelClass}
//       >
//         {label}
//       </label>

//       <textarea
//         id={name}
//         name={name}
//         value={value}
//         onChange={onChange}
//         rows={rows}
//         placeholder={placeholder}
//         className={`${inputClass} resize-y`}
//       />

//       {helper && (
//         <p className="mt-1.5 text-xs text-slate-500">
//           {helper}
//         </p>
//       )}
//     </div>
//   );
// }

// function BookCover({
//   book,
//   size = "normal",
// }) {
//   const dimensions =
//     size === "small"
//       ? "h-14 w-10"
//       : "h-28 w-20";

//   return (
//     <div
//       className={`
//         ${dimensions}
//         shrink-0 overflow-hidden
//         rounded-lg border border-slate-200
//         bg-slate-100
//       `}
//     >
//       {book.coverPageUrl ? (
//         <img
//           src={book.coverPageUrl}
//           alt={book.title}
//           loading="lazy"
//           className="h-full w-full object-cover"
//         />
//       ) : (
//         <div className="flex h-full items-center justify-center text-slate-400">
//           <BookOpen size={23} />
//         </div>
//       )}
//     </div>
//   );
// }

// function Toggle({
//   label,
//   description,
//   name,
//   checked,
//   onChange,
// }) {
//   return (
//     <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
//       <div>
//         <p className="text-sm font-semibold text-slate-900">
//           {label}
//         </p>

//         <p className="mt-1 text-xs text-slate-500">
//           {description}
//         </p>
//       </div>

//       <input
//         type="checkbox"
//         name={name}
//         checked={checked}
//         onChange={onChange}
//         className="h-5 w-5 accent-blue-600"
//       />
//     </label>
//   );
// }

// // =====================================================
// // BOOK SELECTION CARD
// // =====================================================

// function BookSelectionCard({
//   book,
//   selected,
//   disabled,
//   onToggle,
// }) {
//   return (
//     <label
//       className={`
//         flex items-start gap-4
//         rounded-2xl border-2 p-4
//         transition
//         ${
//           disabled
//             ? "cursor-default border-slate-200 opacity-60"
//             : selected
//               ? "cursor-pointer border-blue-500 bg-blue-50"
//               : "cursor-pointer border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
//         }
//       `}
//     >
//       <input
//         type="checkbox"
//         checked={selected}
//         disabled={disabled}
//         onChange={() => onToggle(book.id)}
//         className="sr-only"
//       />

//       <BookCover book={book} />

//       <div className="min-w-0 flex-1">
//         <div className="flex items-start justify-between gap-2">
//           <div className="min-w-0">
//             <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">
//               {book.resourceType}
//             </p>

//             <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">
//               {book.title}
//             </h3>
//           </div>

//           <span
//             className={`
//               flex h-6 w-6 shrink-0
//               items-center justify-center
//               rounded-md border
//               ${
//                 selected
//                   ? "border-blue-600 bg-blue-600 text-white"
//                   : "border-slate-300 bg-white"
//               }
//             `}
//           >
//             {selected && (
//               <Check size={16} />
//             )}
//           </span>
//         </div>

//         {book.subtitle && (
//           <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
//             {book.subtitle}
//           </p>
//         )}

//         {book.category && (
//           <p className="mt-2 text-xs text-slate-500">
//             {book.category}
//           </p>
//         )}

//         <div className="mt-3 flex items-center gap-2">
//           <strong className="text-sm text-slate-950">
//             {formatMoney(
//               book.price,
//               book.currency
//             )}
//           </strong>

//           {book.mrp > book.price && (
//             <span className="text-xs text-slate-400 line-through">
//               {formatMoney(
//                 book.mrp,
//                 book.currency
//               )}
//             </span>
//           )}
//         </div>
//       </div>
//     </label>
//   );
// }

// // =====================================================
// // MAIN COMPONENT
// // =====================================================

// export default function AddBook() {
//   const token = useSelector(
//     (state) => state.auth.token
//   );

//   const [formData, setFormData] =
//     useState({ ...INITIAL_FORM });

//   const [availableBooks, setAvailableBooks] =
//     useState([]);

//   const [selectedBookIds, setSelectedBookIds] =
//     useState([]);

//   const [searchText, setSearchText] =
//     useState("");

//   const [fetchingBooks, setFetchingBooks] =
//     useState(true);

//   const [booksError, setBooksError] =
//     useState("");

//   const [booksHttpStatus, setBooksHttpStatus] =
//     useState(null);

//   const [lastFetchTime, setLastFetchTime] =
//     useState(null);

//   const [coverPage, setCoverPage] =
//     useState(null);

//   const [coverPreview, setCoverPreview] =
//     useState("");

//   const [pdfFile, setPdfFile] =
//     useState(null);

//   const [submitting, setSubmitting] =
//     useState(false);

//   const [errors, setErrors] =
//     useState({});

//   const coverInputRef = useRef(null);
//   const pdfInputRef = useRef(null);
//   const coverObjectUrlRef = useRef("");

//   const mountedRef = useRef(false);
//   const fetchSequenceRef = useRef(0);

//   const isBundle =
//     formData.resourceType === "bundle";

//   const requiresPdf =
//     formData.resourceType === "ebook" ||
//     formData.resourceType === "pdf";

//   // ===================================================
//   // FETCH ALL BOOKS
//   // ===================================================

//   const fetchBooks = useCallback(
//     async ({ signal } = {}) => {
//       const requestId =
//         ++fetchSequenceRef.current;

//       setFetchingBooks(true);
//       setBooksError("");
//       setBooksHttpStatus(null);

//       console.log(
//         "[AddBook] GET:",
//         GET_BOOKS_URL
//       );

//       try {
//         const response = await axios.get(
//           GET_BOOKS_URL,
//           {
//             signal,
//             timeout: 20000,
//             headers: {
//               Accept: "application/json",
//             },
//             params: {
//               // Bypass browser/proxy cache.
//               _t: Date.now(),
//             },
//           }
//         );

//         if (
//           signal?.aborted ||
//           requestId !==
//             fetchSequenceRef.current
//         ) {
//           return;
//         }

//         setBooksHttpStatus(
//           response.status
//         );

//         const payload =
//           response.data;

//         if (payload?.success === false) {
//           throw new Error(
//             payload.message ||
//             "The books API returned success=false."
//           );
//         }

//         const records =
//           normalizeBooksResponse(payload);

//         const normalized =
//           records
//             .map(normalizeBook)
//             .filter(Boolean);

//         // The backend's bundle validator permits
//         // existing PDF/eBook products only.
//         const eligibleBooks =
//           normalized.filter((book) =>
//             ["ebook", "pdf"].includes(
//               book.resourceType
//             )
//           );

//         setAvailableBooks(
//           eligibleBooks
//         );

//         setLastFetchTime(
//           new Date()
//         );

//         console.log(
//           "[AddBook] Books loaded:",
//           eligibleBooks.length,
//           eligibleBooks
//         );

//       } catch (error) {
//         if (
//           signal?.aborted ||
//           requestId !==
//             fetchSequenceRef.current ||
//           axios.isCancel(error)
//         ) {
//           return;
//         }

//         console.error(
//           "[AddBook] GET /book failed:",
//           error
//         );

//         setAvailableBooks([]);

//         setBooksHttpStatus(
//           error.response?.status ?? null
//         );

//         const message =
//           getApiError(error);

//         if (!error.response) {
//           setBooksError(
//             `Network or CORS error while calling ${GET_BOOKS_URL}. ${message}`
//           );
//         } else {
//           setBooksError(
//             `GET /book returned HTTP ${error.response.status}: ${message}`
//           );
//         }
//       } finally {
//         if (
//           !signal?.aborted &&
//           requestId ===
//             fetchSequenceRef.current
//         ) {
//           setFetchingBooks(false);
//         }
//       }
//     },
//     []
//   );

//   // ===================================================
//   // FETCH ON PAGE MOUNT
//   // ===================================================

//   useEffect(() => {
//     mountedRef.current = true;

//     const controller =
//       new AbortController();

//     // Important:
//     // No condition such as if (isBundle).
//     // This runs on page mount.
//     fetchBooks({
//       signal: controller.signal,
//     });

//     return () => {
//       mountedRef.current = false;
//       controller.abort();
//     };
//   }, [fetchBooks]);

//   // ===================================================
//   // COVER OBJECT URL CLEANUP
//   // ===================================================

//   useEffect(() => {
//     return () => {
//       if (coverObjectUrlRef.current) {
//         URL.revokeObjectURL(
//           coverObjectUrlRef.current
//         );
//       }
//     };
//   }, []);

//   // ===================================================
//   // FILTER BOOKS
//   // ===================================================

//   const filteredBooks = useMemo(() => {
//     const keyword =
//       searchText.trim().toLowerCase();

//     if (!keyword) {
//       return availableBooks;
//     }

//     return availableBooks.filter(
//       (book) =>
//         book.title
//           .toLowerCase()
//           .includes(keyword) ||
//         book.slug
//           .toLowerCase()
//           .includes(keyword) ||
//         book.subtitle
//           .toLowerCase()
//           .includes(keyword) ||
//         book.category
//           .toLowerCase()
//           .includes(keyword)
//     );
//   }, [
//     availableBooks,
//     searchText,
//   ]);

//   // ===================================================
//   // SELECTED BOOKS
//   // ===================================================

//   const selectedBooks = useMemo(() => {
//     const bookMap = new Map(
//       availableBooks.map((book) => [
//         book.id,
//         book,
//       ])
//     );

//     return selectedBookIds
//       .map((id) => bookMap.get(id))
//       .filter(Boolean);
//   }, [
//     availableBooks,
//     selectedBookIds,
//   ]);

//   const toggleBook = (bookId) => {
//     setSelectedBookIds((prev) => {
//       if (prev.includes(bookId)) {
//         return prev.filter(
//           (id) => id !== bookId
//         );
//       }

//       return [
//         ...prev,
//         bookId,
//       ];
//     });

//     setErrors((prev) => ({
//       ...prev,
//       includedBooks: "",
//     }));
//   };

//   const selectAllVisible = () => {
//     setSelectedBookIds((prev) => [
//       ...new Set([
//         ...prev,
//         ...filteredBooks.map(
//           (book) => book.id
//         ),
//       ]),
//     ]);

//     setErrors((prev) => ({
//       ...prev,
//       includedBooks: "",
//     }));
//   };

//   const clearSelection = () => {
//     setSelectedBookIds([]);
//   };

//   const combinedPrice = useMemo(
//     () =>
//       selectedBooks.reduce(
//         (sum, book) =>
//           sum + book.price,
//         0
//       ),
//     [selectedBooks]
//   );

//   const combinedMrp = useMemo(
//     () =>
//       selectedBooks.reduce(
//         (sum, book) =>
//           sum + (
//             book.mrp > 0
//               ? book.mrp
//               : book.price
//           ),
//         0
//       ),
//     [selectedBooks]
//   );

//   const sameCurrency =
//     selectedBooks.every(
//       (book) =>
//         book.currency ===
//         formData.currency
//     );

//   // ===================================================
//   // FORM EVENTS
//   // ===================================================

//   const handleChange = (event) => {
//     const {
//       name,
//       value,
//       type,
//       checked,
//     } = event.target;

//     let nextValue =
//       type === "checkbox"
//         ? checked
//         : value;

//     if (name === "currency") {
//       nextValue = String(value)
//         .toUpperCase()
//         .slice(0, 3);
//     }

//     if (
//       name === "slug" ||
//       name === "pageKey"
//     ) {
//       nextValue =
//         String(value).toLowerCase();
//     }

//     if (
//       name === "resourceType" &&
//       value === "bundle"
//     ) {
//       setPdfFile(null);

//       if (pdfInputRef.current) {
//         pdfInputRef.current.value = "";
//       }
//     }

//     setFormData((prev) => ({
//       ...prev,
//       [name]: nextValue,
//       ...(name === "resourceType" &&
//       value === "bundle"
//         ? { fileName: "" }
//         : {}),
//     }));

//     setErrors((prev) => ({
//       ...prev,
//       [name]: "",
//     }));
//   };

//   const setResourceType = (value) => {
//     setFormData((prev) => ({
//       ...prev,
//       resourceType: value,
//       ...(value === "bundle"
//         ? { fileName: "" }
//         : {}),
//     }));

//     if (value === "bundle") {
//       setPdfFile(null);

//       if (pdfInputRef.current) {
//         pdfInputRef.current.value = "";
//       }
//     }
//   };

//   const generateSlugAndKey = () => {
//     const slug =
//       slugify(formData.title);

//     if (!slug) {
//       toast.error(
//         "Enter the product title first."
//       );
//       return;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       slug,
//       pageKey: slug,
//     }));
//   };

//   const generateRedirect = () => {
//     const slug =
//       formData.slug ||
//       slugify(formData.title);

//     if (!slug) {
//       toast.error(
//         "Enter a title or slug first."
//       );
//       return;
//     }

//     setFormData((prev) => ({
//       ...prev,
//       redirectUrl:
//         `/book/${slug}`,
//     }));
//   };

//   const handleCoverChange = (event) => {
//     const file =
//       event.target.files?.[0];

//     if (!file) return;

//     const allowed = [
//       "image/png",
//       "image/jpeg",
//       "image/webp",
//     ];

//     if (
//       !allowed.includes(file.type)
//     ) {
//       toast.error(
//         "Select a PNG, JPG or WEBP image."
//       );

//       event.target.value = "";
//       return;
//     }

//     if (
//       file.size >
//       10 * 1024 * 1024
//     ) {
//       toast.error(
//         "Cover must be below 10 MB."
//       );

//       event.target.value = "";
//       return;
//     }

//     if (
//       coverObjectUrlRef.current
//     ) {
//       URL.revokeObjectURL(
//         coverObjectUrlRef.current
//       );
//     }

//     const url =
//       URL.createObjectURL(file);

//     coverObjectUrlRef.current =
//       url;

//     setCoverPage(file);
//     setCoverPreview(url);

//     setErrors((prev) => ({
//       ...prev,
//       coverPage: "",
//     }));
//   };

//   const removeCover = () => {
//     if (
//       coverObjectUrlRef.current
//     ) {
//       URL.revokeObjectURL(
//         coverObjectUrlRef.current
//       );

//       coverObjectUrlRef.current = "";
//     }

//     setCoverPage(null);
//     setCoverPreview("");

//     if (coverInputRef.current) {
//       coverInputRef.current.value = "";
//     }
//   };

//   const handlePdfChange = (event) => {
//     const file =
//       event.target.files?.[0];

//     if (!file) return;

//     const validPdf =
//       file.type ===
//         "application/pdf" ||
//       file.name
//         .toLowerCase()
//         .endsWith(".pdf");

//     if (!validPdf) {
//       toast.error(
//         "Only PDF files are allowed."
//       );
//       event.target.value = "";
//       return;
//     }

//     if (
//       file.size >
//       100 * 1024 * 1024
//     ) {
//       toast.error(
//         "PDF must be below 100 MB."
//       );
//       event.target.value = "";
//       return;
//     }

//     setPdfFile(file);

//     setFormData((prev) => ({
//       ...prev,
//       fileName:
//         prev.fileName ||
//         file.name,
//     }));

//     setErrors((prev) => ({
//       ...prev,
//       pdf: "",
//     }));
//   };

//   const removePdf = () => {
//     setPdfFile(null);

//     if (pdfInputRef.current) {
//       pdfInputRef.current.value = "";
//     }
//   };

//   // ===================================================
//   // DISCOUNT
//   // ===================================================

//   const discount = useMemo(() => {
//     if (
//       formData.price === "" ||
//       formData.mrp === ""
//     ) {
//       return 0;
//     }

//     const price =
//       Number(formData.price);

//     const mrp =
//       Number(formData.mrp);

//     if (
//       !Number.isFinite(price) ||
//       !Number.isFinite(mrp) ||
//       mrp <= 0 ||
//       price >= mrp
//     ) {
//       return 0;
//     }

//     return Math.round(
//       ((mrp - price) / mrp) * 100
//     );
//   }, [
//     formData.price,
//     formData.mrp,
//   ]);

//   // ===================================================
//   // VALIDATION
//   // ===================================================

//   const validate = () => {
//     const next = {};

//     if (
//       formData.title.trim().length < 3
//     ) {
//       next.title =
//         "Title must have at least 3 characters.";
//     }

//     if (
//       !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
//         formData.slug
//       )
//     ) {
//       next.slug =
//         "Enter a valid slug.";
//     }

//     if (
//       !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
//         formData.pageKey
//       )
//     ) {
//       next.pageKey =
//         "Enter a valid page key.";
//     }

//     const price =
//       Number(formData.price);

//     const mrp =
//       Number(formData.mrp);

//     if (
//       formData.price === "" ||
//       !Number.isFinite(price) ||
//       price < 0
//     ) {
//       next.price =
//         "Enter a valid price.";
//     }

//     if (
//       formData.mrp === "" ||
//       !Number.isFinite(mrp) ||
//       mrp < 0
//     ) {
//       next.mrp =
//         "Enter a valid MRP.";
//     }

//     if (
//       formData.price !== "" &&
//       formData.mrp !== "" &&
//       price > mrp
//     ) {
//       next.price =
//         "Price cannot exceed MRP.";
//     }

//     if (
//       !/^[A-Z]{3}$/.test(
//         formData.currency
//       )
//     ) {
//       next.currency =
//         "Use a three-letter currency code.";
//     }

//     if (
//       !validHttpUrl(
//         formData.paymentUrl
//       )
//     ) {
//       next.paymentUrl =
//         "Enter a valid payment URL.";
//     }

//     if (
//       !validRedirectUrl(
//         formData.redirectUrl
//       )
//     ) {
//       next.redirectUrl =
//         "Enter a valid frontend route.";
//     }

//     if (!coverPage) {
//       next.coverPage =
//         "Cover image is required.";
//     }

//     if (
//       requiresPdf &&
//       !pdfFile
//     ) {
//       next.pdf =
//         "Upload the product PDF.";
//     }

//     if (isBundle) {
//       if (
//         selectedBookIds.length === 0
//       ) {
//         next.includedBooks =
//           "Select at least one book.";
//       } else if (
//         selectedBooks.length !==
//         selectedBookIds.length
//       ) {
//         next.includedBooks =
//           "Some selected books are unavailable. Refresh the list and select again.";
//       }

//       if (fetchingBooks) {
//         next.includedBooks =
//           "Wait for the books API to finish.";
//       }

//       if (booksError) {
//         next.includedBooks =
//           "Resolve the books API error before creating a bundle.";
//       }
//     }

//     setErrors(next);

//     return (
//       Object.keys(next).length === 0
//     );
//   };

//   // ===================================================
//   // RESET FORM
//   // ===================================================

//   const resetForm = () => {
//     setFormData({
//       ...INITIAL_FORM,
//     });

//     setSelectedBookIds([]);
//     setSearchText("");

//     removeCover();
//     removePdf();

//     setErrors({});
//   };

//   // ===================================================
//   // CREATE PRODUCT
//   // ===================================================

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     if (submitting) return;

//     if (!validate()) {
//       toast.error(
//         "Please fix the highlighted fields."
//       );

//       return;
//     }

//     if (!token) {
//       toast.error(
//         "Authentication token missing. Please log in."
//       );

//       return;
//     }

//     const payload =
//       new FormData();

//     const stringFields = [
//       "title",
//       "slug",
//       "subtitle",
//       "description",
//       "resourceType",
//       "currency",
//       "paymentUrl",
//       "redirectUrl",
//       "pageKey",
//       "fileName",
//       "category",
//       "badge",
//     ];

//     for (const field of stringFields) {
//       payload.append(
//         field,
//         String(
//           formData[field] ?? ""
//         ).trim()
//       );
//     }

//     payload.append(
//       "price",
//       String(
//         Number(formData.price)
//       )
//     );

//     payload.append(
//       "mrp",
//       String(
//         Number(formData.mrp)
//       )
//     );

//     for (const field of [
//       "tags",
//       "topics",
//       "highlights",
//     ]) {
//       payload.append(
//         field,
//         JSON.stringify(
//           commaToArray(
//             formData[field]
//           )
//         )
//       );
//     }

//     for (const field of [
//       "isPublished",
//       "isActive",
//       "isFeatured",
//     ]) {
//       payload.append(
//         field,
//         String(formData[field])
//       );
//     }

//     // CRITICAL: MULTIPLE BOOK REFERENCES
//     payload.append(
//       "includedBooks",
//       JSON.stringify(
//         isBundle
//           ? selectedBookIds
//           : []
//       )
//     );

//     // Existing multer field names.
//     payload.append(
//       "coverPage",
//       coverPage
//     );

//     // Bundles don't upload a new PDF.
//     if (
//       !isBundle &&
//       pdfFile
//     ) {
//       payload.append(
//         "pdf",
//         pdfFile
//       );
//     }

//     try {
//       setSubmitting(true);

//       console.log(
//         "[AddBook] POST:",
//         CREATE_BOOK_URL
//       );

//       console.log(
//         "[AddBook] Bundle IDs:",
//         isBundle
//           ? selectedBookIds
//           : []
//       );

//       const response =
//         await axios.post(
//           CREATE_BOOK_URL,
//           payload,
//           {
//             headers: {
//               Authorization:
//                 `Bearer ${token}`,
//             },
//             timeout: 120000,
//           }
//         );

//       if (
//         response.data?.success !== true
//       ) {
//         throw new Error(
//           response.data?.message ||
//           "Product creation failed."
//         );
//       }

//       toast.success(
//         isBundle
//           ? "Book bundle created successfully!"
//           : "Product created successfully!"
//       );

//       resetForm();

//       // Refresh product list after create.
//       fetchBooks();

//       window.scrollTo({
//         top: 0,
//         behavior: "smooth",
//       });

//     } catch (error) {
//       console.error(
//         "[AddBook] POST failed:",
//         error
//       );

//       toast.error(
//         getApiError(error)
//       );

//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ===================================================
//   // JSX
//   // ===================================================

//   return (
//     <main className="min-h-screen bg-[#F6F8FC] px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:px-8">

//       <div className="mx-auto max-w-7xl">

//         {/* HEADER */}

//         <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
//           <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
//             TARGET TREK ADMIN
//           </span>

//           <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
//             Add Books & Bundles
//           </h1>

//           <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
//             Create individual ebooks or combine
//             existing books into one product
//             with a single checkout.
//           </p>
//         </div>

//         {/* MAIN FORM */}

//         <form
//           onSubmit={handleSubmit}
//           className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_350px]"
//         >
//           <div className="min-w-0 space-y-6">

//             {/* ===================================
//                 SECTION 1: PRODUCT TYPE
//             =================================== */}

//             <Panel
//               title="01. Select Product Type"
//               description="Choose whether customers will receive one uploaded book or multiple existing books."
//             >
//               <div className="grid gap-4 sm:grid-cols-2">

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setResourceType("ebook")
//                   }
//                   className={`
//                     rounded-2xl border-2 p-5
//                     text-left transition
//                     ${
//                       !isBundle
//                         ? "border-blue-500 bg-blue-50"
//                         : "border-slate-200 hover:border-blue-300"
//                     }
//                   `}
//                 >
//                   <BookOpen
//                     size={27}
//                     className="text-blue-600"
//                   />

//                   <h3 className="mt-3 font-bold text-slate-900">
//                     Single Book
//                   </h3>

//                   <p className="mt-2 text-xs leading-5 text-slate-500">
//                     Upload a new cover and PDF.
//                   </p>

//                   {!isBundle && (
//                     <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600">
//                       <Check size={14} />
//                       Selected
//                     </span>
//                   )}
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setResourceType("bundle")
//                   }
//                   className={`
//                     rounded-2xl border-2 p-5
//                     text-left transition
//                     ${
//                       isBundle
//                         ? "border-blue-500 bg-blue-50"
//                         : "border-slate-200 hover:border-blue-300"
//                     }
//                   `}
//                 >
//                   <Layers3
//                     size={27}
//                     className="text-blue-600"
//                   />

//                   <h3 className="mt-3 font-bold text-slate-900">
//                     Multiple Books / Bundle
//                   </h3>

//                   <p className="mt-2 text-xs leading-5 text-slate-500">
//                     Select existing books.
//                     No separate PDF upload.
//                   </p>

//                   {isBundle && (
//                     <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600">
//                       <Check size={14} />
//                       Selected
//                     </span>
//                   )}
//                 </button>
//               </div>

//               <div className="mt-5">
//                 <label className={labelClass}>
//                   Resource Type
//                 </label>

//                 <div className="relative">
//                   <select
//                     name="resourceType"
//                     value={formData.resourceType}
//                     onChange={handleChange}
//                     className={`${inputClass} appearance-none pr-10`}
//                   >
//                     {RESOURCE_TYPES.map(
//                       (type) => (
//                         <option
//                           key={type.value}
//                           value={type.value}
//                         >
//                           {type.label}
//                         </option>
//                       )
//                     )}
//                   </select>

//                   <ChevronDown
//                     size={17}
//                     className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
//                   />
//                 </div>
//               </div>
//             </Panel>

//             {/* ===================================
//                 SECTION 2: BOOK SELECTION

//                 ALWAYS VISIBLE.
//                 GET /book runs on mount.
//             =================================== */}

//             <Panel
//               title="02. Existing Books — Select for Bundle"
//               description="All available PDF/eBook products are loaded from your backend. Tick the books you want to include."
//             >
//               {/* API STATUS */}

//               <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
//                 <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
//                   Books API
//                 </p>

//                 <p className="mt-1 break-all font-mono text-xs text-blue-900">
//                   GET {GET_BOOKS_URL}
//                 </p>

//                 <div className="mt-3 flex flex-wrap items-center gap-3">
//                   {fetchingBooks ? (
//                     <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-700">
//                       <Loader2
//                         size={14}
//                         className="animate-spin"
//                       />
//                       Fetching books...
//                     </span>
//                   ) : booksError ? (
//                     <span className="inline-flex items-center gap-2 text-xs font-bold text-red-600">
//                       <AlertCircle size={14} />
//                       Request failed
//                     </span>
//                   ) : (
//                     <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700">
//                       <CheckCircle2 size={14} />
//                       Loaded {availableBooks.length} books
//                     </span>
//                   )}

//                   {booksHttpStatus && (
//                     <span className="text-xs text-slate-600">
//                       HTTP {booksHttpStatus}
//                     </span>
//                   )}

//                   {lastFetchTime && (
//                     <span className="text-xs text-slate-500">
//                       Last updated{" "}
//                       {lastFetchTime.toLocaleTimeString()}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* SEARCH + REFRESH */}

//               <div className="flex flex-col gap-3 sm:flex-row">
//                 <div className="relative flex-1">
//                   <Search
//                     size={18}
//                     className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
//                   />

//                   <input
//                     type="search"
//                     value={searchText}
//                     onChange={(event) =>
//                       setSearchText(
//                         event.target.value
//                       )
//                     }
//                     placeholder="Search by title, slug, subtitle, category..."
//                     className={`${inputClass} pl-11`}
//                   />
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     fetchBooks()
//                   }
//                   disabled={fetchingBooks}
//                   className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
//                 >
//                   <RefreshCw
//                     size={16}
//                     className={
//                       fetchingBooks
//                         ? "animate-spin"
//                         : ""
//                     }
//                   />
//                   Refresh Books
//                 </button>
//               </div>

//               {/* COUNTERS */}

//               <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">
//                 <div className="flex flex-wrap items-center gap-3">
//                   <span className="text-sm font-semibold text-slate-600">
//                     Available:
//                     <strong className="ml-1 text-slate-950">
//                       {availableBooks.length}
//                     </strong>
//                   </span>

//                   <span className="text-sm font-semibold text-slate-600">
//                     Selected:
//                     <strong className="ml-1 text-blue-600">
//                       {selectedBookIds.length}
//                     </strong>
//                   </span>
//                 </div>

//                 <div className="flex items-center gap-4">
//                   <button
//                     type="button"
//                     onClick={selectAllVisible}
//                     disabled={
//                       !isBundle ||
//                       fetchingBooks ||
//                       filteredBooks.length === 0
//                     }
//                     className="text-xs font-bold text-blue-600 disabled:opacity-40"
//                   >
//                     Select Visible
//                   </button>

//                   <button
//                     type="button"
//                     onClick={clearSelection}
//                     disabled={
//                       !isBundle ||
//                       selectedBookIds.length === 0
//                     }
//                     className="text-xs font-bold text-red-600 disabled:opacity-40"
//                   >
//                     Clear All
//                   </button>
//                 </div>
//               </div>

//               {/* SINGLE BOOK MESSAGE */}

//               {!isBundle && (
//                 <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
//                   Existing books are visible, but
//                   selection is disabled while
//                   creating a single product.
//                   Choose <strong>Multiple Books / Bundle</strong>
//                   {" "}above to enable it.
//                 </div>
//               )}

//               {/* API ERROR */}

//               {booksError && (
//                 <div
//                   role="alert"
//                   className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"
//                 >
//                   <p className="text-sm font-bold text-red-700">
//                     Unable to load books
//                   </p>

//                   <p className="mt-2 break-words text-xs leading-6 text-red-700">
//                     {booksError}
//                   </p>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       fetchBooks()
//                     }
//                     className="mt-3 text-sm font-bold text-red-700 underline"
//                   >
//                     Retry GET /book
//                   </button>
//                 </div>
//               )}

//               {/* LOADING */}

//               {fetchingBooks && (
//                 <div className="flex min-h-[190px] flex-col items-center justify-center gap-3">
//                   <Loader2
//                     size={28}
//                     className="animate-spin text-blue-600"
//                   />

//                   <p className="text-sm text-slate-500">
//                     Loading existing products...
//                   </p>
//                 </div>
//               )}

//               {/* BOOK CARDS */}

//               {!fetchingBooks &&
//                 !booksError &&
//                 filteredBooks.length > 0 && (
//                   <div className="mt-5 grid gap-4 md:grid-cols-2">
//                     {filteredBooks.map((book) => (
//                       <BookSelectionCard
//                         key={book.id}
//                         book={book}
//                         disabled={!isBundle}
//                         selected={
//                           selectedBookIds.includes(
//                             book.id
//                           )
//                         }
//                         onToggle={toggleBook}
//                       />
//                     ))}
//                   </div>
//                 )}

//               {/* EMPTY BOOK LIST */}

//               {!fetchingBooks &&
//                 !booksError &&
//                 filteredBooks.length === 0 && (
//                   <div className="mt-5 flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
//                     <BookOpen
//                       size={30}
//                       className="text-slate-400"
//                     />

//                     <h3 className="mt-3 text-sm font-bold text-slate-700">
//                       No available books found
//                     </h3>

//                     <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">
//                       {searchText
//                         ? "No books match your search. Try another keyword."
//                         : "GET /book returned no eligible PDF/eBook products. Check that the books are active and published."}
//                     </p>
//                   </div>
//                 )}

//               {/* SELECTED BOOKS LIST */}

//               {isBundle &&
//                 selectedBooks.length > 0 && (
//                   <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5">
//                     <div className="flex items-center justify-between gap-3">
//                       <div>
//                         <h3 className="text-sm font-bold text-slate-950">
//                           Books Included in Bundle
//                         </h3>

//                         <p className="mt-1 text-xs text-slate-500">
//                           These IDs will be sent in includedBooks.
//                         </p>
//                       </div>

//                       <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">
//                         {selectedBooks.length}
//                       </span>
//                     </div>

//                     <div className="mt-4 space-y-2">
//                       {selectedBooks.map(
//                         (book, index) => (
//                           <div
//                             key={book.id}
//                             className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3"
//                           >
//                             <span className="text-xs font-bold text-blue-700">
//                               {index + 1}.
//                             </span>

//                             <BookCover
//                               book={book}
//                               size="small"
//                             />

//                             <div className="min-w-0 flex-1">
//                               <p className="text-sm font-bold text-slate-900">
//                                 {book.title}
//                               </p>

//                               <p className="mt-1 break-all font-mono text-[10px] text-slate-400">
//                                 {book.id}
//                               </p>
//                             </div>

//                             <button
//                               type="button"
//                               onClick={() =>
//                                 toggleBook(book.id)
//                               }
//                               title="Remove book"
//                               className="rounded-lg p-2 text-red-600 hover:bg-red-50"
//                             >
//                               <X size={17} />
//                             </button>
//                           </div>
//                         )
//                       )}
//                     </div>

//                     <div className="mt-4 grid gap-3 sm:grid-cols-2">
//                       <div className="rounded-xl bg-white p-4">
//                         <p className="text-xs text-slate-500">
//                           Combined Selling Price
//                         </p>

//                         <p className="mt-1 text-lg font-bold text-slate-950">
//                           {sameCurrency
//                             ? formatMoney(
//                                 combinedPrice,
//                                 formData.currency
//                               )
//                             : "Mixed currencies"}
//                         </p>
//                       </div>

//                       <div className="rounded-xl bg-white p-4">
//                         <p className="text-xs text-slate-500">
//                           Combined MRP
//                         </p>

//                         <p className="mt-1 text-lg font-bold text-slate-950">
//                           {sameCurrency
//                             ? formatMoney(
//                                 combinedMrp,
//                                 formData.currency
//                               )
//                             : "Mixed currencies"}
//                         </p>

//                         {sameCurrency && (
//                           <button
//                             type="button"
//                             onClick={() =>
//                               setFormData((prev) => ({
//                                 ...prev,
//                                 mrp: String(combinedMrp),
//                               }))
//                             }
//                             className="mt-2 text-xs font-bold text-blue-600"
//                           >
//                             Use Combined MRP
//                           </button>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 )}

//               {errors.includedBooks && (
//                 <p className="mt-4 text-sm font-semibold text-red-600">
//                   {errors.includedBooks}
//                 </p>
//               )}
//             </Panel>

//             {/* ===================================
//                 SECTION 3: PRODUCT INFO
//             =================================== */}

//             <Panel
//               title="03. Product Information"
//               description="Enter the product details that will be stored in MongoDB."
//             >
//               <div className="grid gap-5 md:grid-cols-2">

//                 <InputField
//                   label="Product Title"
//                   name="title"
//                   value={formData.title}
//                   onChange={handleChange}
//                   error={errors.title}
//                   placeholder="Mastering System Design — HLD + LLD Combo"
//                   required
//                   className="md:col-span-2"
//                 />

//                 <div className="md:col-span-2">
//                   <button
//                     type="button"
//                     onClick={generateSlugAndKey}
//                     className="rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
//                   >
//                     Generate Slug + Page Key
//                   </button>
//                 </div>

//                 <InputField
//                   label="Slug"
//                   name="slug"
//                   value={formData.slug}
//                   onChange={handleChange}
//                   error={errors.slug}
//                   placeholder="system-design-hld-lld-combo"
//                   required
//                 />

//                 <InputField
//                   label="Page Key"
//                   name="pageKey"
//                   value={formData.pageKey}
//                   onChange={handleChange}
//                   error={errors.pageKey}
//                   placeholder="system-design-hld-lld-combo"
//                   required
//                 />

//                 <InputField
//                   label="Subtitle"
//                   name="subtitle"
//                   value={formData.subtitle}
//                   onChange={handleChange}
//                   placeholder="High-Level + Low-Level Design"
//                   className="md:col-span-2"
//                 />

//                 <div className="md:col-span-2">
//                   <TextAreaField
//                     label="Description"
//                     name="description"
//                     value={formData.description}
//                     onChange={handleChange}
//                     rows={5}
//                     placeholder="Describe the complete book or bundle..."
//                   />
//                 </div>
//               </div>
//             </Panel>

//             {/* ===================================
//                 SECTION 4: URL CONFIG
//             =================================== */}

//             <Panel
//               title="04. Page & Checkout URLs"
//               description="Connect your product with its frontend sales page."
//             >
//               <div className="space-y-5">

//                 <InputField
//                   label="Redirect URL"
//                   name="redirectUrl"
//                   value={formData.redirectUrl}
//                   onChange={handleChange}
//                   error={errors.redirectUrl}
//                   placeholder="/book/system-design/hld-lld-combo"
//                   required
//                 />

//                 <button
//                   type="button"
//                   onClick={generateRedirect}
//                   className="text-xs font-bold text-blue-600"
//                 >
//                   Generate Redirect from Slug
//                 </button>

//                 <InputField
//                   label="Payment URL"
//                   name="paymentUrl"
//                   type="url"
//                   value={formData.paymentUrl}
//                   onChange={handleChange}
//                   error={errors.paymentUrl}
//                   placeholder="https://www.targettrek.in/book/system-design/hld-lld-combo"
//                   helper="Use the destination configured for your current checkout flow."
//                   required
//                 />
//               </div>
//             </Panel>

//             {/* ===================================
//                 SECTION 5: PRICING
//             =================================== */}

//             <Panel
//               title="05. Pricing"
//               description="Set the selling price of this product or bundle."
//             >
//               <div className="grid gap-5 sm:grid-cols-3">

//                 <InputField
//                   label="Selling Price"
//                   name="price"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={formData.price}
//                   onChange={handleChange}
//                   error={errors.price}
//                   required
//                 />

//                 <InputField
//                   label="MRP"
//                   name="mrp"
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   value={formData.mrp}
//                   onChange={handleChange}
//                   error={errors.mrp}
//                   required
//                 />

//                 <InputField
//                   label="Currency"
//                   name="currency"
//                   value={formData.currency}
//                   onChange={handleChange}
//                   error={errors.currency}
//                   maxLength={3}
//                   required
//                 />
//               </div>

//               {discount > 0 && (
//                 <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
//                   <span className="font-bold text-emerald-700">
//                     {discount}% OFF
//                   </span>

//                   <span className="ml-3 text-sm text-emerald-800">
//                     Savings:{" "}
//                     {formatMoney(
//                       Number(formData.mrp) -
//                       Number(formData.price),
//                       formData.currency
//                     )}
//                   </span>
//                 </div>
//               )}
//             </Panel>

//             {/* ===================================
//                 SECTION 6: DISCOVERY
//             =================================== */}

//             <Panel
//               title="06. Discovery & Metadata"
//               description="Organize your product for the storefront."
//             >
//               <div className="grid gap-5 md:grid-cols-2">

//                 <InputField
//                   label="Category"
//                   name="category"
//                   value={formData.category}
//                   onChange={handleChange}
//                   placeholder="System Design"
//                 />

//                 <InputField
//                   label="Badge"
//                   name="badge"
//                   value={formData.badge}
//                   onChange={handleChange}
//                   placeholder="Best Value"
//                 />

//                 <InputField
//                   label="Tags"
//                   name="tags"
//                   value={formData.tags}
//                   onChange={handleChange}
//                   placeholder="HLD, LLD, Java, Interview"
//                   helper="Separate tags with commas."
//                   className="md:col-span-2"
//                 />

//                 <InputField
//                   label="Topics"
//                   name="topics"
//                   value={formData.topics}
//                   onChange={handleChange}
//                   placeholder="Architecture, OOP, Design Patterns"
//                   helper="Separate topics with commas."
//                   className="md:col-span-2"
//                 />

//                 <div className="md:col-span-2">
//                   <TextAreaField
//                     label="Highlights"
//                     name="highlights"
//                     value={formData.highlights}
//                     onChange={handleChange}
//                     placeholder="HLD, LLD, Real-world examples, Java code"
//                     helper="Separate highlights with commas."
//                     rows={3}
//                   />
//                 </div>
//               </div>
//             </Panel>

//             {/* ===================================
//                 SECTION 7: FILES
//             =================================== */}

//             <Panel
//               title="07. Product Files"
//               description={
//                 isBundle
//                   ? "Upload the combo cover only. PDFs will come from the selected existing books."
//                   : "Upload the cover and PDF for this new product."
//               }
//             >
//               <div className="grid gap-5 md:grid-cols-2">

//                 {/* COVER */}

//                 <div>
//                   <label className={labelClass}>
//                     Cover Image *
//                   </label>

//                   <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-blue-400">
//                     {coverPreview ? (
//                       <img
//                         src={coverPreview}
//                         alt="Product cover"
//                         className="max-h-[220px] max-w-full object-contain"
//                       />
//                     ) : (
//                       <>
//                         <ImagePlus
//                           size={34}
//                           className="text-blue-600"
//                         />

//                         <p className="mt-3 text-sm font-bold text-slate-800">
//                           Choose Cover Image
//                         </p>

//                         <p className="mt-2 text-xs text-slate-500">
//                           PNG / JPG / WEBP
//                         </p>
//                       </>
//                     )}

//                     <input
//                       ref={coverInputRef}
//                       type="file"
//                       accept="image/png,image/jpeg,image/webp"
//                       onChange={handleCoverChange}
//                       className="hidden"
//                     />
//                   </label>

//                   {coverPage && (
//                     <button
//                       type="button"
//                       onClick={removeCover}
//                       className="mt-3 flex items-center gap-1 text-xs font-bold text-red-600"
//                     >
//                       <Trash2 size={14} />
//                       Remove Cover
//                     </button>
//                   )}

//                   {errors.coverPage && (
//                     <p className="mt-2 text-xs text-red-600">
//                       {errors.coverPage}
//                     </p>
//                   )}
//                 </div>

//                 {/* PDF UPLOAD */}

//                 {!isBundle && (
//                   <div>
//                     <label className={labelClass}>
//                       Product PDF
//                       {requiresPdf ? " *" : ""}
//                     </label>

//                     <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-blue-400">
//                       <FileText
//                         size={34}
//                         className="text-red-600"
//                       />

//                       <p className="mt-3 max-w-full break-words text-sm font-bold text-slate-800">
//                         {pdfFile
//                           ? pdfFile.name
//                           : "Choose Product PDF"}
//                       </p>

//                       <input
//                         ref={pdfInputRef}
//                         type="file"
//                         accept="application/pdf,.pdf"
//                         onChange={handlePdfChange}
//                         className="hidden"
//                       />
//                     </label>

//                     {pdfFile && (
//                       <button
//                         type="button"
//                         onClick={removePdf}
//                         className="mt-3 text-xs font-bold text-red-600"
//                       >
//                         Remove PDF
//                       </button>
//                     )}

//                     {errors.pdf && (
//                       <p className="mt-2 text-xs text-red-600">
//                         {errors.pdf}
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {isBundle && (
//                 <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
//                   <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
//                     <Package size={18} />
//                     Bundle contains {selectedBooks.length} books
//                   </div>

//                   <p className="mt-2 text-xs leading-6 text-emerald-700">
//                     Each selected book retains its
//                     own PDF. Customers can download
//                     them individually from the
//                     payment success page.
//                   </p>
//                 </div>
//               )}

//               {!isBundle && (
//                 <div className="mt-5">
//                   <InputField
//                     label="Display File Name"
//                     name="fileName"
//                     value={formData.fileName}
//                     onChange={handleChange}
//                     placeholder="mastering-system-design.pdf"
//                   />
//                 </div>
//               )}
//             </Panel>
//           </div>

//           {/* =====================================
//               SIDEBAR
//           ===================================== */}

//           <aside className="min-w-0 space-y-6 xl:sticky xl:top-8 xl:self-start">

//             <Panel
//               title="Publishing"
//               description="Control visibility."
//             >
//               <div className="space-y-3">
//                 <Toggle
//                   label="Active"
//                   description="Allow this product to be used."
//                   name="isActive"
//                   checked={formData.isActive}
//                   onChange={handleChange}
//                 />

//                 <Toggle
//                   label="Published"
//                   description="Show in public product APIs."
//                   name="isPublished"
//                   checked={formData.isPublished}
//                   onChange={handleChange}
//                 />

//                 <Toggle
//                   label="Featured"
//                   description="Highlight in storefront."
//                   name="isFeatured"
//                   checked={formData.isFeatured}
//                   onChange={handleChange}
//                 />
//               </div>
//             </Panel>

//             <Panel
//               title="Product Preview"
//               description="Review before saving."
//             >
//               <div className="rounded-xl border border-slate-200 p-4">
//                 {coverPreview ? (
//                   <img
//                     src={coverPreview}
//                     alt="Cover preview"
//                     className="mx-auto max-h-52 object-contain"
//                   />
//                 ) : (
//                   <div className="flex h-40 items-center justify-center bg-slate-50 text-slate-300">
//                     <BookOpen size={35} />
//                   </div>
//                 )}

//                 <h3 className="mt-4 text-sm font-bold text-slate-900">
//                   {formData.title ||
//                     "Product Title"}
//                 </h3>

//                 <p className="mt-2 text-lg font-bold text-slate-950">
//                   {formatMoney(
//                     formData.price || 0,
//                     formData.currency
//                   )}
//                 </p>

//                 {isBundle && (
//                   <div className="mt-4 rounded-xl bg-blue-50 p-3">
//                     <p className="text-sm font-bold text-blue-800">
//                       {selectedBooks.length} Included Books
//                     </p>

//                     {selectedBooks.map((book) => (
//                       <p
//                         key={book.id}
//                         className="mt-2 text-xs leading-5 text-blue-700"
//                       >
//                         • {book.title}
//                       </p>
//                     ))}
//                   </div>
//                 )}

//                 {formData.redirectUrl && (
//                   <p className="mt-3 break-all font-mono text-xs text-slate-500">
//                     {formData.redirectUrl}
//                   </p>
//                 )}
//               </div>
//             </Panel>

//             {/* SUBMIT */}

//             <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//               <button
//                 type="submit"
//                 disabled={
//                   submitting ||
//                   (isBundle && fetchingBooks)
//                 }
//                 className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
//               >
//                 {submitting ? (
//                   <Loader2
//                     size={18}
//                     className="animate-spin"
//                   />
//                 ) : (
//                   <Plus size={18} />
//                 )}

//                 {submitting
//                   ? "Creating Product..."
//                   : isBundle
//                     ? "Create Book Bundle"
//                     : "Create Product"}
//               </button>

//               <p className="mt-3 text-center text-xs leading-5 text-slate-500">
//                 {isBundle
//                   ? `${selectedBooks.length} books will be included in one product.`
//                   : "One PDF will be delivered after purchase."}
//               </p>
//             </div>
//           </aside>
//         </form>
//       </div>
//     </main>
//   );
// }
import React, {

  useCallback,

  useEffect,

  useMemo,

  useRef,

  useState,

} from "react";



import axios from "axios";

import { useSelector } from "react-redux";

import { toast } from "react-toastify";



import {

  AlertCircle,

  BookOpen,

  Check,

  CheckCircle2,

  ChevronDown,

  FileText,

  ImagePlus,

  Layers3,

  Loader2,

  Package,

  Plus,

  RefreshCw,

  Search,

  Trash2,

  UploadCloud,

  X,

} from "lucide-react";



import BASE_URL from "../utils/Url";



// =====================================================

// API CONFIGURATION

// =====================================================



const API_BASE = String(BASE_URL || "")

  .trim()

  .replace(/\/+$/, "");



const GET_BOOKS_URL = `${API_BASE}/book`;



const CREATE_BOOK_URL =

  `${API_BASE}/book/admin/create`;



const RESOURCE_TYPES = [

  { value: "ebook", label: "eBook" },

  { value: "pdf", label: "PDF" },

  { value: "bundle", label: "Book Bundle" },

  { value: "course", label: "Course" },

  { value: "template", label: "Template" },

  { value: "notes", label: "Notes" },

  { value: "other", label: "Other" },

];



// Start as bundle so selector is immediately visible.

const INITIAL_FORM = {

  title: "",

  slug: "",

  subtitle: "",

  description: "",

  resourceType: "bundle",

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
  showInMainBooks: false,

};



const inputClass =

  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";



const labelClass =

  "mb-2 block text-sm font-semibold text-slate-700";



// =====================================================

// UTILITY FUNCTIONS

// =====================================================



const slugify = (value = "") =>

  String(value)

    .toLowerCase()

    .trim()

    .replace(/[^a-z0-9\s-]/g, "")

    .replace(/\s+/g, "-")

    .replace(/-+/g, "-")

    .replace(/^-|-$/g, "");



const commaToArray = (value = "") =>

  String(value)

    .split(",")

    .map((item) => item.trim())

    .filter(Boolean);



const formatMoney = (

  amount,

  currency = "INR"

) => {

  const number = Number(amount);



  if (!Number.isFinite(number)) {

    return "-";

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



const getApiError = (error) => {

  const data = error?.response?.data;



  return (

    data?.error?.message ||

    data?.message ||

    error?.message ||

    "Request failed."

  );

};



const normalizeBooksResponse = (payload) => {

  // Standard controller response:

  // { success: true, count, data: [...] }



  if (Array.isArray(payload)) {

    return payload;

  }



  if (Array.isArray(payload?.data)) {

    return payload.data;

  }



  // Compatible with nested wrappers if introduced.

  if (Array.isArray(payload?.data?.books)) {

    return payload.data.books;

  }



  if (Array.isArray(payload?.books)) {

    return payload.books;

  }



  throw new Error(

    "GET /book did not return a recognized books array."

  );

};



const normalizeBook = (record) => {

  if (!record) return null;



  const id =

    record._id ||

    record.id;



  if (!id) return null;



  return {

    id: String(id),

    title: record.title || "Untitled Book",

    subtitle: record.subtitle || "",

    slug: record.slug || "",

    category: record.category || "",

    resourceType: record.resourceType || "ebook",

    price: Number(record.price) || 0,

    mrp: Number(record.mrp) || 0,

    currency: record.currency || "INR",

    coverPageUrl: record.coverPageUrl || "",

    isPublished: record.isPublished !== false,

    isActive: record.isActive !== false,
    isFeatured: record.isFeatured === true,
    showInMainBooks: record.showInMainBooks === true,

  };

};



const validHttpUrl = (value) => {

  try {

    const url = new URL(value);



    return (

      url.protocol === "http:" ||

      url.protocol === "https:"

    );

  } catch {

    return false;

  }

};



const validRedirectUrl = (value) => {

  const path = String(value || "").trim();



  return (

    path.length > 1 &&

    path.startsWith("/") &&

    !path.startsWith("//") &&

    !/[\r\n\\]/.test(path)

  );

};



// =====================================================

// REUSABLE UI COMPONENTS

// =====================================================



function Panel({

  title,

  description,

  children,

  className = "",

}) {

  return (

    <section

      className={`

        rounded-2xl border border-slate-200

        bg-white p-5 shadow-sm sm:p-6

        ${className}

      `}

    >

      <div className="mb-5">

        <h2 className="text-lg font-bold text-slate-950">

          {title}

        </h2>



        {description && (

          <p className="mt-1 text-sm leading-6 text-slate-500">

            {description}

          </p>

        )}

      </div>



      {children}

    </section>

  );

}



function InputField({

  label,

  name,

  value,

  onChange,

  error,

  required = false,

  helper,

  className = "",

  ...props

}) {

  return (

    <div className={className}>

      <label

        htmlFor={name}

        className={labelClass}

      >

        {label}

        {required && (

          <span className="ml-1 text-red-500">*</span>

        )}

      </label>



      <input

        id={name}

        name={name}

        value={value}

        onChange={onChange}

        className={`${inputClass} ${

          error ? "border-red-400" : ""

        }`}

        {...props}

      />



      {helper && (

        <p className="mt-1.5 text-xs leading-5 text-slate-500">

          {helper}

        </p>

      )}



      {error && (

        <p className="mt-1.5 text-xs font-medium text-red-600">

          {error}

        </p>

      )}

    </div>

  );

}



function TextAreaField({

  label,

  name,

  value,

  onChange,

  rows = 4,

  placeholder,

  helper,

}) {

  return (

    <div>

      <label

        htmlFor={name}

        className={labelClass}

      >

        {label}

      </label>



      <textarea

        id={name}

        name={name}

        value={value}

        onChange={onChange}

        rows={rows}

        placeholder={placeholder}

        className={`${inputClass} resize-y`}

      />



      {helper && (

        <p className="mt-1.5 text-xs text-slate-500">

          {helper}

        </p>

      )}

    </div>

  );

}



function BookCover({

  book,

  size = "normal",

}) {

  const dimensions =

    size === "small"

      ? "h-14 w-10"

      : "h-28 w-20";



  return (

    <div

      className={`

        ${dimensions}

        shrink-0 overflow-hidden

        rounded-lg border border-slate-200

        bg-slate-100

      `}

    >

      {book.coverPageUrl ? (

        <img

          src={book.coverPageUrl}

          alt={book.title}

          loading="lazy"

          className="h-full w-full object-cover"

        />

      ) : (

        <div className="flex h-full items-center justify-center text-slate-400">

          <BookOpen size={23} />

        </div>

      )}

    </div>

  );

}



function Toggle({

  label,

  description,

  name,

  checked,

  onChange,

}) {

  return (

    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">

      <div>

        <p className="text-sm font-semibold text-slate-900">

          {label}

        </p>



        <p className="mt-1 text-xs text-slate-500">

          {description}

        </p>

      </div>



      <input

        type="checkbox"

        name={name}

        checked={checked}

        onChange={onChange}

        className="h-5 w-5 accent-blue-600"

      />

    </label>

  );

}



// =====================================================

// BOOK SELECTION CARD

// =====================================================



function BookSelectionCard({

  book,

  selected,

  disabled,

  onToggle,

}) {

  return (

    <label

      className={`

        flex items-start gap-4

        rounded-2xl border-2 p-4

        transition

        ${

          disabled

            ? "cursor-default border-slate-200 opacity-60"

            : selected

              ? "cursor-pointer border-blue-500 bg-blue-50"

              : "cursor-pointer border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"

        }

      `}

    >

      <input

        type="checkbox"

        checked={selected}

        disabled={disabled}

        onChange={() => onToggle(book.id)}

        className="sr-only"

      />



      <BookCover book={book} />



      <div className="min-w-0 flex-1">

        <div className="flex items-start justify-between gap-2">

          <div className="min-w-0">

            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">

              {book.resourceType}

            </p>



            <h3 className="mt-1 line-clamp-2 text-sm font-bold text-slate-900">

              {book.title}

            </h3>

          </div>



          <span

            className={`

              flex h-6 w-6 shrink-0

              items-center justify-center

              rounded-md border

              ${

                selected

                  ? "border-blue-600 bg-blue-600 text-white"

                  : "border-slate-300 bg-white"

              }

            `}

          >

            {selected && (

              <Check size={16} />

            )}

          </span>

        </div>



        {book.subtitle && (

          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">

            {book.subtitle}

          </p>

        )}



        {book.category && (

          <p className="mt-2 text-xs text-slate-500">

            {book.category}

          </p>

        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          {book.showInMainBooks && (
            <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-700">
              Main Books
            </span>
          )}
          {book.isFeatured && (
            <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
              Featured
            </span>
          )}
        </div>



        <div className="mt-3 flex items-center gap-2">

          <strong className="text-sm text-slate-950">

            {formatMoney(

              book.price,

              book.currency

            )}

          </strong>



          {book.mrp > book.price && (

            <span className="text-xs text-slate-400 line-through">

              {formatMoney(

                book.mrp,

                book.currency

              )}

            </span>

          )}

        </div>

      </div>

    </label>

  );

}



// =====================================================

// MAIN COMPONENT

// =====================================================



export default function AddBook() {

  const token = useSelector(

    (state) => state.auth.token

  );



  const [formData, setFormData] =

    useState({ ...INITIAL_FORM });



  const [availableBooks, setAvailableBooks] =

    useState([]);



  const [selectedBookIds, setSelectedBookIds] =

    useState([]);



  const [searchText, setSearchText] =

    useState("");



  const [fetchingBooks, setFetchingBooks] =

    useState(true);



  const [booksError, setBooksError] =

    useState("");



  const [booksHttpStatus, setBooksHttpStatus] =

    useState(null);



  const [lastFetchTime, setLastFetchTime] =

    useState(null);



  const [coverPage, setCoverPage] =

    useState(null);



  const [coverPreview, setCoverPreview] =

    useState("");



  const [pdfFile, setPdfFile] =

    useState(null);



  const [submitting, setSubmitting] =

    useState(false);



  const [errors, setErrors] =

    useState({});



  const coverInputRef = useRef(null);

  const pdfInputRef = useRef(null);

  const coverObjectUrlRef = useRef("");



  const mountedRef = useRef(false);

  const fetchSequenceRef = useRef(0);



  const isBundle =

    formData.resourceType === "bundle";



  const requiresPdf =

    formData.resourceType === "ebook" ||

    formData.resourceType === "pdf";



  // ===================================================

  // FETCH ALL BOOKS

  // ===================================================



  const fetchBooks = useCallback(

    async ({ signal } = {}) => {

      const requestId =

        ++fetchSequenceRef.current;



      setFetchingBooks(true);

      setBooksError("");

      setBooksHttpStatus(null);



      console.log(

        "[AddBook] GET:",

        GET_BOOKS_URL

      );



      try {

        const response = await axios.get(

          GET_BOOKS_URL,

          {

            signal,

            timeout: 20000,

            headers: {

              Accept: "application/json",

            },

            params: {

              // Bypass browser/proxy cache.

              _t: Date.now(),

            },

          }

        );



        if (

          signal?.aborted ||

          requestId !==

            fetchSequenceRef.current

        ) {

          return;

        }



        setBooksHttpStatus(

          response.status

        );



        const payload =

          response.data;



        if (payload?.success === false) {

          throw new Error(

            payload.message ||

            "The books API returned success=false."

          );

        }



        const records =

          normalizeBooksResponse(payload);



        const normalized =

          records

            .map(normalizeBook)

            .filter(Boolean);



        // The backend's bundle validator permits

        // existing PDF/eBook products only.

        const eligibleBooks =

          normalized.filter((book) =>

            ["ebook", "pdf"].includes(

              book.resourceType

            )

          );



        setAvailableBooks(

          eligibleBooks

        );



        setLastFetchTime(

          new Date()

        );



        console.log(

          "[AddBook] Books loaded:",

          eligibleBooks.length,

          eligibleBooks

        );



      } catch (error) {

        if (

          signal?.aborted ||

          requestId !==

            fetchSequenceRef.current ||

          axios.isCancel(error)

        ) {

          return;

        }



        console.error(

          "[AddBook] GET /book failed:",

          error

        );



        setAvailableBooks([]);



        setBooksHttpStatus(

          error.response?.status ?? null

        );



        const message =

          getApiError(error);



        if (!error.response) {

          setBooksError(

            `Network or CORS error while calling ${GET_BOOKS_URL}. ${message}`

          );

        } else {

          setBooksError(

            `GET /book returned HTTP ${error.response.status}: ${message}`

          );

        }

      } finally {

        if (

          !signal?.aborted &&

          requestId ===

            fetchSequenceRef.current

        ) {

          setFetchingBooks(false);

        }

      }

    },

    []

  );



  // ===================================================

  // FETCH ON PAGE MOUNT

  // ===================================================



  useEffect(() => {

    mountedRef.current = true;



    const controller =

      new AbortController();



    // Important:

    // No condition such as if (isBundle).

    // This runs on page mount.

    fetchBooks({

      signal: controller.signal,

    });



    return () => {

      mountedRef.current = false;

      controller.abort();

    };

  }, [fetchBooks]);



  // ===================================================

  // COVER OBJECT URL CLEANUP

  // ===================================================



  useEffect(() => {

    return () => {

      if (coverObjectUrlRef.current) {

        URL.revokeObjectURL(

          coverObjectUrlRef.current

        );

      }

    };

  }, []);



  // ===================================================

  // FILTER BOOKS

  // ===================================================



  const filteredBooks = useMemo(() => {

    const keyword =

      searchText.trim().toLowerCase();



    if (!keyword) {

      return availableBooks;

    }



    return availableBooks.filter(

      (book) =>

        book.title

          .toLowerCase()

          .includes(keyword) ||

        book.slug

          .toLowerCase()

          .includes(keyword) ||

        book.subtitle

          .toLowerCase()

          .includes(keyword) ||

        book.category

          .toLowerCase()

          .includes(keyword)

    );

  }, [

    availableBooks,

    searchText,

  ]);



  // ===================================================

  // SELECTED BOOKS

  // ===================================================



  const selectedBooks = useMemo(() => {

    const bookMap = new Map(

      availableBooks.map((book) => [

        book.id,

        book,

      ])

    );



    return selectedBookIds

      .map((id) => bookMap.get(id))

      .filter(Boolean);

  }, [

    availableBooks,

    selectedBookIds,

  ]);



  const toggleBook = (bookId) => {

    setSelectedBookIds((prev) => {

      if (prev.includes(bookId)) {

        return prev.filter(

          (id) => id !== bookId

        );

      }



      return [

        ...prev,

        bookId,

      ];

    });



    setErrors((prev) => ({

      ...prev,

      includedBooks: "",

    }));

  };



  const selectAllVisible = () => {

    setSelectedBookIds((prev) => [

      ...new Set([

        ...prev,

        ...filteredBooks.map(

          (book) => book.id

        ),

      ]),

    ]);



    setErrors((prev) => ({

      ...prev,

      includedBooks: "",

    }));

  };



  const clearSelection = () => {

    setSelectedBookIds([]);

  };



  const combinedPrice = useMemo(

    () =>

      selectedBooks.reduce(

        (sum, book) =>

          sum + book.price,

        0

      ),

    [selectedBooks]

  );



  const combinedMrp = useMemo(

    () =>

      selectedBooks.reduce(

        (sum, book) =>

          sum + (

            book.mrp > 0

              ? book.mrp

              : book.price

          ),

        0

      ),

    [selectedBooks]

  );



  const sameCurrency =

    selectedBooks.every(

      (book) =>

        book.currency ===

        formData.currency

    );



  // ===================================================

  // FORM EVENTS

  // ===================================================



  const handleChange = (event) => {

    const {

      name,

      value,

      type,

      checked,

    } = event.target;



    let nextValue =

      type === "checkbox"

        ? checked

        : value;



    if (name === "currency") {

      nextValue = String(value)

        .toUpperCase()

        .slice(0, 3);

    }



    if (

      name === "slug" ||

      name === "pageKey"

    ) {

      nextValue =

        String(value).toLowerCase();

    }



    if (

      name === "resourceType" &&

      value === "bundle"

    ) {

      setPdfFile(null);



      if (pdfInputRef.current) {

        pdfInputRef.current.value = "";

      }

    }



    setFormData((prev) => ({

      ...prev,

      [name]: nextValue,

      ...(name === "resourceType" &&

      value === "bundle"

        ? { fileName: "" }

        : {}),

    }));



    setErrors((prev) => ({

      ...prev,

      [name]: "",

    }));

  };



  const setResourceType = (value) => {

    setFormData((prev) => ({

      ...prev,

      resourceType: value,

      ...(value === "bundle"

        ? { fileName: "" }

        : {}),

    }));



    if (value === "bundle") {

      setPdfFile(null);



      if (pdfInputRef.current) {

        pdfInputRef.current.value = "";

      }

    }

  };



  const generateSlugAndKey = () => {

    const slug =

      slugify(formData.title);



    if (!slug) {

      toast.error(

        "Enter the product title first."

      );

      return;

    }



    setFormData((prev) => ({

      ...prev,

      slug,

      pageKey: slug,

    }));

  };



  const generateRedirect = () => {

    const slug =

      formData.slug ||

      slugify(formData.title);



    if (!slug) {

      toast.error(

        "Enter a title or slug first."

      );

      return;

    }



    setFormData((prev) => ({

      ...prev,

      redirectUrl:

        `/book/${slug}`,

    }));

  };



  const handleCoverChange = (event) => {

    const file =

      event.target.files?.[0];



    if (!file) return;



    const allowed = [

      "image/png",

      "image/jpeg",

      "image/webp",

    ];



    if (

      !allowed.includes(file.type)

    ) {

      toast.error(

        "Select a PNG, JPG or WEBP image."

      );



      event.target.value = "";

      return;

    }



    if (

      file.size >

      10 * 1024 * 1024

    ) {

      toast.error(

        "Cover must be below 10 MB."

      );



      event.target.value = "";

      return;

    }



    if (

      coverObjectUrlRef.current

    ) {

      URL.revokeObjectURL(

        coverObjectUrlRef.current

      );

    }



    const url =

      URL.createObjectURL(file);



    coverObjectUrlRef.current =

      url;



    setCoverPage(file);

    setCoverPreview(url);



    setErrors((prev) => ({

      ...prev,

      coverPage: "",

    }));

  };



  const removeCover = () => {

    if (

      coverObjectUrlRef.current

    ) {

      URL.revokeObjectURL(

        coverObjectUrlRef.current

      );



      coverObjectUrlRef.current = "";

    }



    setCoverPage(null);

    setCoverPreview("");



    if (coverInputRef.current) {

      coverInputRef.current.value = "";

    }

  };



  const handlePdfChange = (event) => {

    const file =

      event.target.files?.[0];



    if (!file) return;



    const validPdf =

      file.type ===

        "application/pdf" ||

      file.name

        .toLowerCase()

        .endsWith(".pdf");



    if (!validPdf) {

      toast.error(

        "Only PDF files are allowed."

      );

      event.target.value = "";

      return;

    }



    if (

      file.size >

      100 * 1024 * 1024

    ) {

      toast.error(

        "PDF must be below 100 MB."

      );

      event.target.value = "";

      return;

    }



    setPdfFile(file);



    setFormData((prev) => ({

      ...prev,

      fileName:

        prev.fileName ||

        file.name,

    }));



    setErrors((prev) => ({

      ...prev,

      pdf: "",

    }));

  };



  const removePdf = () => {

    setPdfFile(null);



    if (pdfInputRef.current) {

      pdfInputRef.current.value = "";

    }

  };



  // ===================================================

  // DISCOUNT

  // ===================================================



  const discount = useMemo(() => {

    if (

      formData.price === "" ||

      formData.mrp === ""

    ) {

      return 0;

    }



    const price =

      Number(formData.price);



    const mrp =

      Number(formData.mrp);



    if (

      !Number.isFinite(price) ||

      !Number.isFinite(mrp) ||

      mrp <= 0 ||

      price >= mrp

    ) {

      return 0;

    }



    return Math.round(

      ((mrp - price) / mrp) * 100

    );

  }, [

    formData.price,

    formData.mrp,

  ]);



  // ===================================================

  // VALIDATION

  // ===================================================



  const validate = () => {

    const next = {};



    if (

      formData.title.trim().length < 3

    ) {

      next.title =

        "Title must have at least 3 characters.";

    }



    if (

      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(

        formData.slug

      )

    ) {

      next.slug =

        "Enter a valid slug.";

    }



    if (

      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(

        formData.pageKey

      )

    ) {

      next.pageKey =

        "Enter a valid page key.";

    }



    const price =

      Number(formData.price);



    const mrp =

      Number(formData.mrp);



    if (

      formData.price === "" ||

      !Number.isFinite(price) ||

      price < 0

    ) {

      next.price =

        "Enter a valid price.";

    }



    if (

      formData.mrp === "" ||

      !Number.isFinite(mrp) ||

      mrp < 0

    ) {

      next.mrp =

        "Enter a valid MRP.";

    }



    if (

      formData.price !== "" &&

      formData.mrp !== "" &&

      price > mrp

    ) {

      next.price =

        "Price cannot exceed MRP.";

    }



    if (

      !/^[A-Z]{3}$/.test(

        formData.currency

      )

    ) {

      next.currency =

        "Use a three-letter currency code.";

    }



    if (

      !validHttpUrl(

        formData.paymentUrl

      )

    ) {

      next.paymentUrl =

        "Enter a valid payment URL.";

    }



    if (

      !validRedirectUrl(

        formData.redirectUrl

      )

    ) {

      next.redirectUrl =

        "Enter a valid frontend route.";

    }



    if (!coverPage) {

      next.coverPage =

        "Cover image is required.";

    }



    if (

      requiresPdf &&

      !pdfFile

    ) {

      next.pdf =

        "Upload the product PDF.";

    }



    if (isBundle) {

      if (

        selectedBookIds.length === 0

      ) {

        next.includedBooks =

          "Select at least one book.";

      } else if (

        selectedBooks.length !==

        selectedBookIds.length

      ) {

        next.includedBooks =

          "Some selected books are unavailable. Refresh the list and select again.";

      }



      if (fetchingBooks) {

        next.includedBooks =

          "Wait for the books API to finish.";

      }



      if (booksError) {

        next.includedBooks =

          "Resolve the books API error before creating a bundle.";

      }

    }



    setErrors(next);



    return (

      Object.keys(next).length === 0

    );

  };



  // ===================================================

  // RESET FORM

  // ===================================================



  const resetForm = () => {

    setFormData({

      ...INITIAL_FORM,

    });



    setSelectedBookIds([]);

    setSearchText("");



    removeCover();

    removePdf();



    setErrors({});

  };



  // ===================================================

  // CREATE PRODUCT

  // ===================================================



  const handleSubmit = async (event) => {

    event.preventDefault();



    if (submitting) return;



    if (!validate()) {

      toast.error(

        "Please fix the highlighted fields."

      );



      return;

    }



    if (!token) {

      toast.error(

        "Authentication token missing. Please log in."

      );



      return;

    }



    const payload =

      new FormData();



    const stringFields = [

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



    for (const field of stringFields) {

      payload.append(

        field,

        String(

          formData[field] ?? ""

        ).trim()

      );

    }



    payload.append(

      "price",

      String(

        Number(formData.price)

      )

    );



    payload.append(

      "mrp",

      String(

        Number(formData.mrp)

      )

    );



    for (const field of [

      "tags",

      "topics",

      "highlights",

    ]) {

      payload.append(

        field,

        JSON.stringify(

          commaToArray(

            formData[field]

          )

        )

      );

    }



    for (const field of [

      "isPublished",
    "isActive",
    "isFeatured",
    "showInMainBooks",

    ]) {

      payload.append(

        field,

        String(formData[field])

      );

    }



    // CRITICAL: MULTIPLE BOOK REFERENCES

    payload.append(

      "includedBooks",

      JSON.stringify(

        isBundle

          ? selectedBookIds

          : []

      )

    );



    // Existing multer field names.

    payload.append(

      "coverPage",

      coverPage

    );



    // Bundles don't upload a new PDF.

    if (

      !isBundle &&

      pdfFile

    ) {

      payload.append(

        "pdf",

        pdfFile

      );

    }



    try {

      setSubmitting(true);



      console.log(

        "[AddBook] POST:",

        CREATE_BOOK_URL

      );



      console.log(

        "[AddBook] Bundle IDs:",

        isBundle

          ? selectedBookIds

          : []

      );



      const response =

        await axios.post(

          CREATE_BOOK_URL,

          payload,

          {

            headers: {

              Authorization:

                `Bearer ${token}`,

            },

            timeout: 120000,

          }

        );



      if (

        response.data?.success !== true

      ) {

        throw new Error(

          response.data?.message ||

          "Product creation failed."

        );

      }



      toast.success(

        isBundle

          ? "Book bundle created successfully!"

          : "Product created successfully!"

      );



      resetForm();



      // Refresh product list after create.

      fetchBooks();



      window.scrollTo({

        top: 0,

        behavior: "smooth",

      });



    } catch (error) {

      console.error(

        "[AddBook] POST failed:",

        error

      );



      toast.error(

        getApiError(error)

      );



    } finally {

      setSubmitting(false);

    }

  };



  // ===================================================

  // JSX

  // ===================================================



  return (

    <main className="min-h-screen bg-[#F6F8FC] px-4 pb-12 pt-10 sm:px-6 sm:pt-14 lg:px-8">



      <div className="mx-auto max-w-7xl">



        {/* HEADER */}



        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

          <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">

            TARGET TREK ADMIN

          </span>



          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">

            Add Books & Bundles

          </h1>



          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">

            Create individual ebooks or combine

            existing books into one product

            with a single checkout.

          </p>

        </div>



        {/* MAIN FORM */}



        <form

          onSubmit={handleSubmit}

          className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_350px]"

        >

          <div className="min-w-0 space-y-6">



            {/* ===================================

                SECTION 1: PRODUCT TYPE

            =================================== */}



            <Panel

              title="01. Select Product Type"

              description="Choose whether customers will receive one uploaded book or multiple existing books."

            >

              <div className="grid gap-4 sm:grid-cols-2">



                <button

                  type="button"

                  onClick={() =>

                    setResourceType("ebook")

                  }

                  className={`

                    rounded-2xl border-2 p-5

                    text-left transition

                    ${

                      !isBundle

                        ? "border-blue-500 bg-blue-50"

                        : "border-slate-200 hover:border-blue-300"

                    }

                  `}

                >

                  <BookOpen

                    size={27}

                    className="text-blue-600"

                  />



                  <h3 className="mt-3 font-bold text-slate-900">

                    Single Book

                  </h3>



                  <p className="mt-2 text-xs leading-5 text-slate-500">

                    Upload a new cover and PDF.

                  </p>



                  {!isBundle && (

                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600">

                      <Check size={14} />

                      Selected

                    </span>

                  )}

                </button>



                <button

                  type="button"

                  onClick={() =>

                    setResourceType("bundle")

                  }

                  className={`

                    rounded-2xl border-2 p-5

                    text-left transition

                    ${

                      isBundle

                        ? "border-blue-500 bg-blue-50"

                        : "border-slate-200 hover:border-blue-300"

                    }

                  `}

                >

                  <Layers3

                    size={27}

                    className="text-blue-600"

                  />



                  <h3 className="mt-3 font-bold text-slate-900">

                    Multiple Books / Bundle

                  </h3>



                  <p className="mt-2 text-xs leading-5 text-slate-500">

                    Select existing books.

                    No separate PDF upload.

                  </p>



                  {isBundle && (

                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600">

                      <Check size={14} />

                      Selected

                    </span>

                  )}

                </button>

              </div>



              <div className="mt-5">

                <label className={labelClass}>

                  Resource Type

                </label>



                <div className="relative">

                  <select

                    name="resourceType"

                    value={formData.resourceType}

                    onChange={handleChange}

                    className={`${inputClass} appearance-none pr-10`}

                  >

                    {RESOURCE_TYPES.map(

                      (type) => (

                        <option

                          key={type.value}

                          value={type.value}

                        >

                          {type.label}

                        </option>

                      )

                    )}

                  </select>



                  <ChevronDown

                    size={17}

                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"

                  />

                </div>

              </div>

            </Panel>



            {/* ===================================

                SECTION 2: BOOK SELECTION



                ALWAYS VISIBLE.

                GET /book runs on mount.

            =================================== */}



            <Panel

              title="02. Existing Books — Select for Bundle"

              description="All available PDF/eBook products are loaded from your backend. Tick the books you want to include."

            >

              {/* API STATUS */}



              <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 p-4">

                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">

                  Books API

                </p>



                <p className="mt-1 break-all font-mono text-xs text-blue-900">

                  GET {GET_BOOKS_URL}

                </p>



                <div className="mt-3 flex flex-wrap items-center gap-3">

                  {fetchingBooks ? (

                    <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-700">

                      <Loader2

                        size={14}

                        className="animate-spin"

                      />

                      Fetching books...

                    </span>

                  ) : booksError ? (

                    <span className="inline-flex items-center gap-2 text-xs font-bold text-red-600">

                      <AlertCircle size={14} />

                      Request failed

                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700">

                      <CheckCircle2 size={14} />

                      Loaded {availableBooks.length} books

                    </span>

                  )}



                  {booksHttpStatus && (

                    <span className="text-xs text-slate-600">

                      HTTP {booksHttpStatus}

                    </span>

                  )}



                  {lastFetchTime && (

                    <span className="text-xs text-slate-500">

                      Last updated{" "}

                      {lastFetchTime.toLocaleTimeString()}

                    </span>

                  )}

                </div>

              </div>



              {/* SEARCH + REFRESH */}



              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="relative flex-1">

                  <Search

                    size={18}

                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"

                  />



                  <input

                    type="search"

                    value={searchText}

                    onChange={(event) =>

                      setSearchText(

                        event.target.value

                      )

                    }

                    placeholder="Search by title, slug, subtitle, category..."

                    className={`${inputClass} pl-11`}

                  />

                </div>



                <button

                  type="button"

                  onClick={() =>

                    fetchBooks()

                  }

                  disabled={fetchingBooks}

                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"

                >

                  <RefreshCw

                    size={16}

                    className={

                      fetchingBooks

                        ? "animate-spin"

                        : ""

                    }

                  />

                  Refresh Books

                </button>

              </div>



              {/* COUNTERS */}



              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4">

                <div className="flex flex-wrap items-center gap-3">

                  <span className="text-sm font-semibold text-slate-600">

                    Available:

                    <strong className="ml-1 text-slate-950">

                      {availableBooks.length}

                    </strong>

                  </span>



                  <span className="text-sm font-semibold text-slate-600">

                    Selected:

                    <strong className="ml-1 text-blue-600">

                      {selectedBookIds.length}

                    </strong>

                  </span>

                </div>



                <div className="flex items-center gap-4">

                  <button

                    type="button"

                    onClick={selectAllVisible}

                    disabled={

                      !isBundle ||

                      fetchingBooks ||

                      filteredBooks.length === 0

                    }

                    className="text-xs font-bold text-blue-600 disabled:opacity-40"

                  >

                    Select Visible

                  </button>



                  <button

                    type="button"

                    onClick={clearSelection}

                    disabled={

                      !isBundle ||

                      selectedBookIds.length === 0

                    }

                    className="text-xs font-bold text-red-600 disabled:opacity-40"

                  >

                    Clear All

                  </button>

                </div>

              </div>



              {/* SINGLE BOOK MESSAGE */}



              {!isBundle && (

                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">

                  Existing books are visible, but

                  selection is disabled while

                  creating a single product.

                  Choose <strong>Multiple Books / Bundle</strong>

                  {" "}above to enable it.

                </div>

              )}



              {/* API ERROR */}



              {booksError && (

                <div

                  role="alert"

                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"

                >

                  <p className="text-sm font-bold text-red-700">

                    Unable to load books

                  </p>



                  <p className="mt-2 break-words text-xs leading-6 text-red-700">

                    {booksError}

                  </p>



                  <button

                    type="button"

                    onClick={() =>

                      fetchBooks()

                    }

                    className="mt-3 text-sm font-bold text-red-700 underline"

                  >

                    Retry GET /book

                  </button>

                </div>

              )}



              {/* LOADING */}



              {fetchingBooks && (

                <div className="flex min-h-[190px] flex-col items-center justify-center gap-3">

                  <Loader2

                    size={28}

                    className="animate-spin text-blue-600"

                  />



                  <p className="text-sm text-slate-500">

                    Loading existing products...

                  </p>

                </div>

              )}



              {/* BOOK CARDS */}



              {!fetchingBooks &&

                !booksError &&

                filteredBooks.length > 0 && (

                  <div className="mt-5 grid gap-4 md:grid-cols-2">

                    {filteredBooks.map((book) => (

                      <BookSelectionCard

                        key={book.id}

                        book={book}

                        disabled={!isBundle}

                        selected={

                          selectedBookIds.includes(

                            book.id

                          )

                        }

                        onToggle={toggleBook}

                      />

                    ))}

                  </div>

                )}



              {/* EMPTY BOOK LIST */}



              {!fetchingBooks &&

                !booksError &&

                filteredBooks.length === 0 && (

                  <div className="mt-5 flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">

                    <BookOpen

                      size={30}

                      className="text-slate-400"

                    />



                    <h3 className="mt-3 text-sm font-bold text-slate-700">

                      No available books found

                    </h3>



                    <p className="mt-2 max-w-sm text-xs leading-6 text-slate-500">

                      {searchText

                        ? "No books match your search. Try another keyword."

                        : "GET /book returned no eligible PDF/eBook products. Check that the books are active and published."}

                    </p>

                  </div>

                )}



              {/* SELECTED BOOKS LIST */}



              {isBundle &&

                selectedBooks.length > 0 && (

                  <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5">

                    <div className="flex items-center justify-between gap-3">

                      <div>

                        <h3 className="text-sm font-bold text-slate-950">

                          Books Included in Bundle

                        </h3>



                        <p className="mt-1 text-xs text-slate-500">

                          These IDs will be sent in includedBooks.

                        </p>

                      </div>



                      <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">

                        {selectedBooks.length}

                      </span>

                    </div>



                    <div className="mt-4 space-y-2">

                      {selectedBooks.map(

                        (book, index) => (

                          <div

                            key={book.id}

                            className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white p-3"

                          >

                            <span className="text-xs font-bold text-blue-700">

                              {index + 1}.

                            </span>



                            <BookCover

                              book={book}

                              size="small"

                            />



                            <div className="min-w-0 flex-1">

                              <p className="text-sm font-bold text-slate-900">

                                {book.title}

                              </p>



                              <p className="mt-1 break-all font-mono text-[10px] text-slate-400">

                                {book.id}

                              </p>

                            </div>



                            <button

                              type="button"

                              onClick={() =>

                                toggleBook(book.id)

                              }

                              title="Remove book"

                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"

                            >

                              <X size={17} />

                            </button>

                          </div>

                        )

                      )}

                    </div>



                    <div className="mt-4 grid gap-3 sm:grid-cols-2">

                      <div className="rounded-xl bg-white p-4">

                        <p className="text-xs text-slate-500">

                          Combined Selling Price

                        </p>



                        <p className="mt-1 text-lg font-bold text-slate-950">

                          {sameCurrency

                            ? formatMoney(

                                combinedPrice,

                                formData.currency

                              )

                            : "Mixed currencies"}

                        </p>

                      </div>



                      <div className="rounded-xl bg-white p-4">

                        <p className="text-xs text-slate-500">

                          Combined MRP

                        </p>



                        <p className="mt-1 text-lg font-bold text-slate-950">

                          {sameCurrency

                            ? formatMoney(

                                combinedMrp,

                                formData.currency

                              )

                            : "Mixed currencies"}

                        </p>



                        {sameCurrency && (

                          <button

                            type="button"

                            onClick={() =>

                              setFormData((prev) => ({

                                ...prev,

                                mrp: String(combinedMrp),

                              }))

                            }

                            className="mt-2 text-xs font-bold text-blue-600"

                          >

                            Use Combined MRP

                          </button>

                        )}

                      </div>

                    </div>

                  </div>

                )}



              {errors.includedBooks && (

                <p className="mt-4 text-sm font-semibold text-red-600">

                  {errors.includedBooks}

                </p>

              )}

            </Panel>



            {/* ===================================

                SECTION 3: PRODUCT INFO

            =================================== */}



            <Panel

              title="03. Product Information"

              description="Enter the product details that will be stored in MongoDB."

            >

              <div className="grid gap-5 md:grid-cols-2">



                <InputField

                  label="Product Title"

                  name="title"

                  value={formData.title}

                  onChange={handleChange}

                  error={errors.title}

                  placeholder="Mastering System Design — HLD + LLD Combo"

                  required

                  className="md:col-span-2"

                />



                <div className="md:col-span-2">

                  <button

                    type="button"

                    onClick={generateSlugAndKey}

                    className="rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 hover:bg-blue-100"

                  >

                    Generate Slug + Page Key

                  </button>

                </div>



                <InputField

                  label="Slug"

                  name="slug"

                  value={formData.slug}

                  onChange={handleChange}

                  error={errors.slug}

                  placeholder="system-design-hld-lld-combo"

                  required

                />



                <InputField

                  label="Page Key"

                  name="pageKey"

                  value={formData.pageKey}

                  onChange={handleChange}

                  error={errors.pageKey}

                  placeholder="system-design-hld-lld-combo"

                  required

                />



                <InputField

                  label="Subtitle"

                  name="subtitle"

                  value={formData.subtitle}

                  onChange={handleChange}

                  placeholder="High-Level + Low-Level Design"

                  className="md:col-span-2"

                />



                <div className="md:col-span-2">

                  <TextAreaField

                    label="Description"

                    name="description"

                    value={formData.description}

                    onChange={handleChange}

                    rows={5}

                    placeholder="Describe the complete book or bundle..."

                  />

                </div>

              </div>

            </Panel>



            {/* ===================================

                SECTION 4: URL CONFIG

            =================================== */}



            <Panel

              title="04. Page & Checkout URLs"

              description="Connect your product with its frontend sales page."

            >

              <div className="space-y-5">



                <InputField

                  label="Redirect URL"

                  name="redirectUrl"

                  value={formData.redirectUrl}

                  onChange={handleChange}

                  error={errors.redirectUrl}

                  placeholder="/book/system-design/hld-lld-combo"

                  required

                />



                <button

                  type="button"

                  onClick={generateRedirect}

                  className="text-xs font-bold text-blue-600"

                >

                  Generate Redirect from Slug

                </button>



                <InputField

                  label="Payment URL"

                  name="paymentUrl"

                  type="url"

                  value={formData.paymentUrl}

                  onChange={handleChange}

                  error={errors.paymentUrl}

                  placeholder="https\://www.targettrek.in/book/system-design/hld-lld-combo"

                  helper="Use the destination configured for your current checkout flow."

                  required

                />

              </div>

            </Panel>



            {/* ===================================

                SECTION 5: PRICING

            =================================== */}



            <Panel

              title="05. Pricing"

              description="Set the selling price of this product or bundle."

            >

              <div className="grid gap-5 sm:grid-cols-3">



                <InputField

                  label="Selling Price"

                  name="price"

                  type="number"

                  min="0"

                  step="0.01"

                  value={formData.price}

                  onChange={handleChange}

                  error={errors.price}

                  required

                />



                <InputField

                  label="MRP"

                  name="mrp"

                  type="number"

                  min="0"

                  step="0.01"

                  value={formData.mrp}

                  onChange={handleChange}

                  error={errors.mrp}

                  required

                />



                <InputField

                  label="Currency"

                  name="currency"

                  value={formData.currency}

                  onChange={handleChange}

                  error={errors.currency}

                  maxLength={3}

                  required

                />

              </div>



              {discount > 0 && (

                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                  <span className="font-bold text-emerald-700">

                    {discount}% OFF

                  </span>



                  <span className="ml-3 text-sm text-emerald-800">

                    Savings:{" "}

                    {formatMoney(

                      Number(formData.mrp) -

                      Number(formData.price),

                      formData.currency

                    )}

                  </span>

                </div>

              )}

            </Panel>



            {/* ===================================

                SECTION 6: DISCOVERY

            =================================== */}



            <Panel

              title="06. Discovery & Metadata"

              description="Organize your product for the storefront."

            >

              <div className="grid gap-5 md:grid-cols-2">



                <InputField

                  label="Category"

                  name="category"

                  value={formData.category}

                  onChange={handleChange}

                  placeholder="System Design"

                />



                <InputField

                  label="Badge"

                  name="badge"

                  value={formData.badge}

                  onChange={handleChange}

                  placeholder="Best Value"

                />



                <InputField

                  label="Tags"

                  name="tags"

                  value={formData.tags}

                  onChange={handleChange}

                  placeholder="HLD, LLD, Java, Interview"

                  helper="Separate tags with commas."

                  className="md:col-span-2"

                />



                <InputField

                  label="Topics"

                  name="topics"

                  value={formData.topics}

                  onChange={handleChange}

                  placeholder="Architecture, OOP, Design Patterns"

                  helper="Separate topics with commas."

                  className="md:col-span-2"

                />



                <div className="md:col-span-2">

                  <TextAreaField

                    label="Highlights"

                    name="highlights"

                    value={formData.highlights}

                    onChange={handleChange}

                    placeholder="HLD, LLD, Real-world examples, Java code"

                    helper="Separate highlights with commas."

                    rows={3}

                  />

                </div>

              </div>

            </Panel>



            {/* ===================================

                SECTION 7: FILES

            =================================== */}



            <Panel

              title="07. Product Files"

              description={

                isBundle

                  ? "Upload the combo cover only. PDFs will come from the selected existing books."

                  : "Upload the cover and PDF for this new product."

              }

            >

              <div className="grid gap-5 md:grid-cols-2">



                {/* COVER */}



                <div>

                  <label className={labelClass}>

                    Cover Image *

                  </label>



                  <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-blue-400">

                    {coverPreview ? (

                      <img

                        src={coverPreview}

                        alt="Product cover"

                        className="max-h-[220px] max-w-full object-contain"

                      />

                    ) : (

                      <>

                        <ImagePlus

                          size={34}

                          className="text-blue-600"

                        />



                        <p className="mt-3 text-sm font-bold text-slate-800">

                          Choose Cover Image

                        </p>



                        <p className="mt-2 text-xs text-slate-500">

                          PNG / JPG / WEBP

                        </p>

                      </>

                    )}



                    <input

                      ref={coverInputRef}

                      type="file"

                      accept="image/png,image/jpeg,image/webp"

                      onChange={handleCoverChange}

                      className="hidden"

                    />

                  </label>



                  {coverPage && (

                    <button

                      type="button"

                      onClick={removeCover}

                      className="mt-3 flex items-center gap-1 text-xs font-bold text-red-600"

                    >

                      <Trash2 size={14} />

                      Remove Cover

                    </button>

                  )}



                  {errors.coverPage && (

                    <p className="mt-2 text-xs text-red-600">

                      {errors.coverPage}

                    </p>

                  )}

                </div>



                {/* PDF UPLOAD */}



                {!isBundle && (

                  <div>

                    <label className={labelClass}>

                      Product PDF

                      {requiresPdf ? " *" : ""}

                    </label>



                    <label className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-blue-400">

                      <FileText

                        size={34}

                        className="text-red-600"

                      />



                      <p className="mt-3 max-w-full break-words text-sm font-bold text-slate-800">

                        {pdfFile

                          ? pdfFile.name

                          : "Choose Product PDF"}

                      </p>



                      <input

                        ref={pdfInputRef}

                        type="file"

                        accept="application/pdf,.pdf"

                        onChange={handlePdfChange}

                        className="hidden"

                      />

                    </label>



                    {pdfFile && (

                      <button

                        type="button"

                        onClick={removePdf}

                        className="mt-3 text-xs font-bold text-red-600"

                      >

                        Remove PDF

                      </button>

                    )}



                    {errors.pdf && (

                      <p className="mt-2 text-xs text-red-600">

                        {errors.pdf}

                      </p>

                    )}

                  </div>

                )}

              </div>



              {isBundle && (

                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">

                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">

                    <Package size={18} />

                    Bundle contains {selectedBooks.length} books

                  </div>



                  <p className="mt-2 text-xs leading-6 text-emerald-700">

                    Each selected book retains its

                    own PDF. Customers can download

                    them individually from the

                    payment success page.

                  </p>

                </div>

              )}



              {!isBundle && (

                <div className="mt-5">

                  <InputField

                    label="Display File Name"

                    name="fileName"

                    value={formData.fileName}

                    onChange={handleChange}

                    placeholder="mastering-system-design.pdf"

                  />

                </div>

              )}

            </Panel>

          </div>



          {/* =====================================

              SIDEBAR

          ===================================== */}



          <aside className="min-w-0 space-y-6 xl:sticky xl:top-8 xl:self-start">



            <Panel

              title="Publishing"

              description="Control visibility."

            >

              <div className="space-y-3">

                <Toggle

                  label="Active"

                  description="Allow this product to be used."

                  name="isActive"

                  checked={formData.isActive}

                  onChange={handleChange}

                />



                <Toggle

                  label="Published"

                  description="Show in public product APIs."

                  name="isPublished"

                  checked={formData.isPublished}

                  onChange={handleChange}

                />



                <Toggle

                  label="Featured"

                  description="Highlight in storefront."

                  name="isFeatured"

                  checked={formData.isFeatured}

                  onChange={handleChange}

                />
              <Toggle
                label="Show in Main Books"
                description="Include this product in the Main Books section."
                name="showInMainBooks"
                checked={formData.showInMainBooks}
                onChange={handleChange}
              />

              </div>

            </Panel>



            <Panel

              title="Product Preview"

              description="Review before saving."

            >

              <div className="rounded-xl border border-slate-200 p-4">

                {coverPreview ? (

                  <img

                    src={coverPreview}

                    alt="Cover preview"

                    className="mx-auto max-h-52 object-contain"

                  />

                ) : (

                  <div className="flex h-40 items-center justify-center bg-slate-50 text-slate-300">

                    <BookOpen size={35} />

                  </div>

                )}



                <h3 className="mt-4 text-sm font-bold text-slate-900">

                  {formData.title ||

                    "Product Title"}

                </h3>



                <p className="mt-2 text-lg font-bold text-slate-950">

                  {formatMoney(

                    formData.price || 0,

                    formData.currency

                  )}

                </p>



                {isBundle && (

                  <div className="mt-4 rounded-xl bg-blue-50 p-3">

                    <p className="text-sm font-bold text-blue-800">

                      {selectedBooks.length} Included Books

                    </p>



                    {selectedBooks.map((book) => (

                      <p

                        key={book.id}

                        className="mt-2 text-xs leading-5 text-blue-700"

                      >

                        • {book.title}

                      </p>

                    ))}

                  </div>

                )}



                {formData.redirectUrl && (

                  <p className="mt-3 break-all font-mono text-xs text-slate-500">

                    {formData.redirectUrl}

                  </p>

                )}

              </div>

            </Panel>



            {/* SUBMIT */}



            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <button

                type="submit"

                disabled={

                  submitting ||

                  (isBundle && fetchingBooks)

                }

                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"

              >

                {submitting ? (

                  <Loader2

                    size={18}

                    className="animate-spin"

                  />

                ) : (

                  <Plus size={18} />

                )}



                {submitting

                  ? "Creating Product..."

                  : isBundle

                    ? "Create Book Bundle"

                    : "Create Product"}

              </button>



              <p className="mt-3 text-center text-xs leading-5 text-slate-500">

                {isBundle

                  ? `${selectedBooks.length} books will be included in one product.`

                  : "One PDF will be delivered after purchase."}

              </p>

            </div>

          </aside>

        </form>

      </div>

    </main>

  );

}
