// // import React, {
// //   useCallback,
// //   useEffect,
// //   useMemo,
// //   useState,
// // } from "react";

// // import { Helmet } from "react-helmet-async";
// // import { useLocation, useNavigate } from "react-router-dom";

// // import {
// //   AlertCircle,
// //   ArrowRight,
// //   BookOpen,
// //   ChevronDown,
// //   FileText,
// //   Filter,
// //   Search,
// //   Sparkles,
// //   X,
// // } from "lucide-react";

// // import BASE_URL from "../utils/Url";

// // /* =========================================================
// //    HELPERS
// // ========================================================= */

// // function ScrollToTop() {
// //   const { pathname } = useLocation();

// //   useEffect(() => {
// //     window.scrollTo({
// //       top: 0,
// //       left: 0,
// //       behavior: "auto",
// //     });
// //   }, [pathname]);

// //   return null;
// // }

// // function money(value, currency = "INR") {
// //   if (
// //     value === undefined ||
// //     value === null ||
// //     value === ""
// //   ) {
// //     return "";
// //   }

// //   const number = Number(value);

// //   if (!Number.isFinite(number)) {
// //     return "";
// //   }

// //   try {
// //     return new Intl.NumberFormat(
// //       currency === "INR" ? "en-IN" : "en-US",
// //       {
// //         style: "currency",
// //         currency,
// //         maximumFractionDigits: 2,
// //       }
// //     ).format(number);
// //   } catch {
// //     return `${currency} ${number.toLocaleString()}`;
// //   }
// // }

// // function getDiscount(book) {
// //   const price = Number(book?.price);
// //   const mrp = Number(book?.mrp);

// //   if (
// //     !Number.isFinite(price) ||
// //     !Number.isFinite(mrp) ||
// //     mrp <= 0 ||
// //     price >= mrp
// //   ) {
// //     return 0;
// //   }

// //   return Math.round(((mrp - price) / mrp) * 100);
// // }

// // function getSavings(book) {
// //   const price = Number(book?.price);
// //   const mrp = Number(book?.mrp);

// //   if (
// //     !Number.isFinite(price) ||
// //     !Number.isFinite(mrp) ||
// //     mrp <= price
// //   ) {
// //     return 0;
// //   }

// //   return mrp - price;
// // }

// // function formatResourceType(type) {
// //   const map = {
// //     pdf: "PDF",
// //     ebook: "Ebook",
// //     course: "Course",
// //     bundle: "Bundle",
// //     template: "Template",
// //     notes: "Notes",
// //     other: "Digital Product",
// //   };

// //   return map[type] || "Digital Product";
// // }

// // /* =========================================================
// //    TAG COLORS
// // ========================================================= */

// // const TAG_STYLES = [
// //   "border-blue-200 bg-blue-50 text-blue-700",
// //   "border-violet-200 bg-violet-50 text-violet-700",
// //   "border-emerald-200 bg-emerald-50 text-emerald-700",
// //   "border-orange-200 bg-orange-50 text-orange-700",
// //   "border-pink-200 bg-pink-50 text-pink-700",
// //   "border-cyan-200 bg-cyan-50 text-cyan-700",
// //   "border-amber-200 bg-amber-50 text-amber-700",
// //   "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
// //   "border-teal-200 bg-teal-50 text-teal-700",
// // ];

// // function getTagStyle(tag = "") {
// //   let hash = 0;

// //   for (let i = 0; i < tag.length; i++) {
// //     hash =
// //       tag.charCodeAt(i) +
// //       ((hash << 5) - hash);
// //   }

// //   return TAG_STYLES[
// //     Math.abs(hash) % TAG_STYLES.length
// //   ];
// // }

// // /* =========================================================
// //    COVER
// // ========================================================= */

// // function BookCover({ book }) {
// //   const [imageError, setImageError] = useState(false);

// //   useEffect(() => {
// //     setImageError(false);
// //   }, [book?.coverPageUrl]);

// //   return (
// //     <div className="relative h-full w-full">
// //       {book?.coverPageUrl && !imageError ? (
// //         <img
// //           src={book.coverPageUrl}
// //           alt={`${book?.title || "Product"} cover`}
// //           loading="lazy"
// //           onError={() => setImageError(true)}
// //           className="
// //             h-full
// //             w-full
// //             object-cover
// //             transition
// //             duration-500
// //             group-hover:scale-[1.03]
// //           "
// //         />
// //       ) : (
// //         <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-4 text-white">
// //           <div className="flex items-center justify-between">
// //             <BookOpen className="h-6 w-6 text-blue-200" />

// //             <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">
// //               Target Trek
// //             </span>
// //           </div>

// //           <div>
// //             <div className="mb-3 h-1 w-9 rounded-full bg-blue-300" />

// //             <h3 className="line-clamp-4 text-sm font-bold leading-5 sm:text-base">
// //               {book?.title || "Digital Product"}
// //             </h3>
// //           </div>
// //         </div>
// //       )}

// //       <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-white/5" />
// //     </div>
// //   );
// // }

// // /* =========================================================
// //    PRODUCT CARD
// // ========================================================= */

// // function ProductCard({ book, onOpen }) {
// //   const discount = getDiscount(book);
// //   const savings = getSavings(book);

// //   const firstTag =
// //     Array.isArray(book?.tags) && book.tags.length > 0
// //       ? book.tags[0]
// //       : null;

// //   const handleKeyboard = (event) => {
// //     if (event.key === "Enter" || event.key === " ") {
// //       event.preventDefault();
// //       onOpen(book);
// //     }
// //   };

// //   return (
// //     <article
// //       role="link"
// //       tabIndex={0}
// //       onClick={() => onOpen(book)}
// //       onKeyDown={handleKeyboard}
// //       aria-label={`View ${book?.title || "product"}`}
// //       className="
// //         group
// //         relative
// //         flex
// //         min-h-[245px]
// //         cursor-pointer
// //         overflow-hidden
// //         rounded-2xl
// //         border
// //         border-slate-200
// //         bg-white
// //         shadow-[0_3px_12px_rgba(15,23,42,0.05)]
// //         outline-none
// //         transition-all
// //         duration-300
// //         hover:-translate-y-1
// //         hover:border-blue-200
// //         hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)]
// //         focus-visible:ring-4
// //         focus-visible:ring-blue-100
// //       "
// //     >
// //       {/* =============================================
// //           LEFT - COVER
// //       ============================================= */}

// //       <div
// //         className="
// //           relative
// //           m-3
// //           w-[115px]
// //           shrink-0
// //           overflow-hidden
// //           rounded-xl
// //           border
// //           border-slate-200
// //           bg-slate-100
// //           shadow-sm

// //           sm:m-4
// //           sm:w-[135px]

// //           lg:w-[145px]
// //         "
// //       >
// //         <BookCover book={book} />
// //       </div>

// //       {/* =============================================
// //           RIGHT - DETAILS
// //       ============================================= */}

// //       <div className="flex min-w-0 flex-1 flex-col px-2 py-4 pr-4 sm:py-5 sm:pr-5">
// //         {/* Top badges */}

// //         <div className="mb-3 flex min-h-[25px] flex-wrap items-center gap-1.5">
// //           {firstTag && (
// //             <span
// //               title={firstTag}
// //               className={`
// //                 max-w-[110px]
// //                 truncate
// //                 rounded-full
// //                 border
// //                 px-2.5
// //                 py-1
// //                 text-[9px]
// //                 font-bold
// //                 uppercase
// //                 tracking-wide
// //                 ${getTagStyle(firstTag)}
// //               `}
// //             >
// //               {firstTag}
// //             </span>
// //           )}

// //           {book?.category && (
// //             <span
// //               title={book.category}
// //               className="
// //                 max-w-[110px]
// //                 truncate
// //                 rounded-full
// //                 border
// //                 border-violet-200
// //                 bg-violet-50
// //                 px-2.5
// //                 py-1
// //                 text-[9px]
// //                 font-bold
// //                 uppercase
// //                 tracking-wide
// //                 text-violet-700
// //               "
// //             >
// //               {book.category}
// //             </span>
// //           )}

// //           <span
// //             className="
// //               flex
// //               items-center
// //               gap-1
// //               rounded-full
// //               border
// //               border-emerald-200
// //               bg-emerald-50
// //               px-2.5
// //               py-1
// //               text-[9px]
// //               font-bold
// //               uppercase
// //               tracking-wide
// //               text-emerald-700
// //             "
// //           >
// //             <FileText className="h-2.5 w-2.5" />

// //             {formatResourceType(book?.resourceType)}
// //           </span>
// //         </div>

// //         {/* Featured + badge */}

// //         {(book?.isFeatured || book?.badge) && (
// //           <div className="mb-2 flex flex-wrap items-center gap-2">
// //             {book?.isFeatured && (
// //               <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
// //                 <Sparkles className="h-3 w-3" />
// //                 Featured
// //               </span>
// //             )}

// //             {book?.badge && (
// //               <span className="text-[10px] font-semibold text-slate-400">
// //                 {book.badge}
// //               </span>
// //             )}
// //           </div>
// //         )}

// //         {/* Title */}

// //         <h2
// //           className="
// //             line-clamp-2
// //             text-base
// //             font-extrabold
// //             leading-6
// //             tracking-tight
// //             text-slate-950
// //             transition-colors
// //             group-hover:text-blue-700

// //             sm:text-lg
// //           "
// //         >
// //           {book?.title || "Untitled Product"}
// //         </h2>

// //         {/* Subtitle */}

// //         {book?.subtitle && (
// //           <p
// //             className="
// //               mt-1.5
// //               line-clamp-2
// //               text-xs
// //               leading-5
// //               text-slate-500
// //               sm:text-[13px]
// //             "
// //           >
// //             {book.subtitle}
// //           </p>
// //         )}

// //         {/* Spacer */}

// //         <div className="flex-1" />

// //         {/* Price */}

// //         <div className="mt-4 border-t border-slate-100 pt-3">
// //           <div className="flex items-end justify-between gap-3">
// //             <div className="min-w-0">
// //               <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
// //                 Get it for
// //               </p>

// //               <div className="flex flex-wrap items-center gap-2">
// //                 <span className="text-xl font-extrabold tracking-tight text-slate-950">
// //                   {money(book?.price, book?.currency)}
// //                 </span>

// //                 {Number(book?.mrp) > Number(book?.price) && (
// //                   <span className="text-xs font-medium text-slate-400 line-through">
// //                     {money(book?.mrp, book?.currency)}
// //                   </span>
// //                 )}
// //               </div>

// //               {(savings > 0 || discount > 0) && (
// //                 <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
// //                   {savings > 0 && (
// //                     <span className="text-[10px] font-bold text-emerald-600">
// //                       Save {money(savings, book?.currency)}
// //                     </span>
// //                   )}

// //                   {discount > 0 && (
// //                     <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
// //                       {discount}% OFF
// //                     </span>
// //                   )}
// //                 </div>
// //               )}
// //             </div>

// //             {/* Arrow */}

// //             <div
// //               className="
// //                 flex
// //                 h-10
// //                 w-10
// //                 shrink-0
// //                 items-center
// //                 justify-center
// //                 rounded-full
// //                 bg-slate-950
// //                 text-white
// //                 transition-all
// //                 duration-300
// //                 group-hover:scale-105
// //                 group-hover:bg-blue-600
// //               "
// //             >
// //               <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </article>
// //   );
// // }

// // /* =========================================================
// //    SELECT
// // ========================================================= */

// // function SelectField({
// //   value,
// //   onChange,
// //   options,
// //   placeholder,
// // }) {
// //   return (
// //     <div className="relative">
// //       <select
// //         value={value}
// //         onChange={(event) => onChange(event.target.value)}
// //         className="
// //           h-11
// //           appearance-none
// //           rounded-xl
// //           border
// //           border-slate-200
// //           bg-white
// //           pl-4
// //           pr-10
// //           text-sm
// //           font-semibold
// //           text-slate-700
// //           outline-none
// //           transition
// //           focus:border-blue-400
// //           focus:ring-4
// //           focus:ring-blue-100
// //         "
// //       >
// //         <option value="">{placeholder}</option>

// //         {options.map((option) => {
// //           const optionValue = option.value ?? option;
// //           const optionLabel = option.label ?? option;

// //           return (
// //             <option
// //               key={optionValue}
// //               value={optionValue}
// //             >
// //               {optionLabel}
// //             </option>
// //           );
// //         })}
// //       </select>

// //       <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
// //     </div>
// //   );
// // }

// // /* =========================================================
// //    SKELETON
// // ========================================================= */

// // function ProductSkeleton() {
// //   return (
// //     <div className="flex min-h-[245px] animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
// //       <div className="m-3 w-[115px] shrink-0 rounded-xl bg-slate-100 sm:m-4 sm:w-[135px] lg:w-[145px]" />

// //       <div className="flex flex-1 flex-col py-5 pr-5">
// //         <div className="flex gap-2">
// //           <div className="h-5 w-16 rounded-full bg-slate-100" />
// //           <div className="h-5 w-20 rounded-full bg-slate-100" />
// //         </div>

// //         <div className="mt-5 h-5 w-full rounded bg-slate-100" />

// //         <div className="mt-2 h-5 w-4/5 rounded bg-slate-100" />

// //         <div className="mt-3 h-3 w-full rounded bg-slate-50" />

// //         <div className="mt-2 h-3 w-2/3 rounded bg-slate-50" />

// //         <div className="flex-1" />

// //         <div className="mt-5 border-t border-slate-100 pt-4">
// //           <div className="h-7 w-24 rounded bg-slate-100" />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // /* =========================================================
// //    HERO STAT
// // ========================================================= */

// // function HeroStat({ value, label }) {
// //   return (
// //     <div className="px-5 py-5 first:pl-0">
// //       <div className="text-3xl font-extrabold text-blue-600">
// //         {value}
// //       </div>

// //       <div className="mt-1 text-xs font-medium text-slate-500">
// //         {label}
// //       </div>
// //     </div>
// //   );
// // }

// // /* =========================================================
// //    MAIN PAGE
// // ========================================================= */

// // export default function Books() {
// //   const navigate = useNavigate();

// //   const [books, setBooks] = useState([]);

// //   const [loading, setLoading] = useState(true);

// //   const [error, setError] = useState("");

// //   const [search, setSearch] = useState("");

// //   const [category, setCategory] = useState("");

// //   const [resourceType, setResourceType] = useState("");

// //   const [sort, setSort] = useState("");

// //   /* =======================================================
// //      FETCH BOOKS
// //   ======================================================= */

// //   const fetchBooks = useCallback(async (signal) => {
// //     try {
// //       setLoading(true);
// //       setError("");

// //       const response = await fetch(`${BASE_URL}/book`, {
// //         method: "GET",

// //         headers: {
// //           Accept: "application/json",
// //         },

// //         signal,
// //       });

// //       let result;

// //       try {
// //         result = await response.json();
// //       } catch {
// //         throw new Error(
// //           "Invalid response received from the server."
// //         );
// //       }

// //       if (!response.ok) {
// //         throw new Error(
// //           result?.error?.message ||
// //             result?.message ||
// //             "Unable to load products."
// //         );
// //       }

// //       if (result?.success !== true) {
// //         throw new Error(
// //           result?.error?.message ||
// //             result?.message ||
// //             "Unable to load products."
// //         );
// //       }

// //       const data = Array.isArray(result?.data)
// //         ? result.data
// //         : [];

// //       setBooks(data);
// //     } catch (err) {
// //       if (err?.name === "AbortError") {
// //         return;
// //       }

// //       console.error("Products fetch error:", err);

// //       setBooks([]);

// //       setError(
// //         err?.message ||
// //           "Something went wrong while loading products."
// //       );
// //     } finally {
// //       if (!signal?.aborted) {
// //         setLoading(false);
// //       }
// //     }
// //   }, []);

// //   useEffect(() => {
// //     const controller = new AbortController();

// //     fetchBooks(controller.signal);

// //     return () => controller.abort();
// //   }, [fetchBooks]);

// //   /* =======================================================
// //      CATEGORIES
// //   ======================================================= */

// //   const categories = useMemo(() => {
// //     return [
// //       ...new Set(
// //         books
// //           .map((book) => book?.category?.trim())
// //           .filter(Boolean)
// //       ),
// //     ].sort((a, b) => a.localeCompare(b));
// //   }, [books]);

// //   /* =======================================================
// //      RESOURCE TYPES
// //   ======================================================= */

// //   const resourceTypes = useMemo(() => {
// //     return [
// //       ...new Set(
// //         books
// //           .map((book) => book?.resourceType)
// //           .filter(Boolean)
// //       ),
// //     ].sort();
// //   }, [books]);

// //   /* =======================================================
// //      FILTER + SORT
// //   ======================================================= */

// //   const filteredBooks = useMemo(() => {
// //     const query = search.trim().toLowerCase();

// //     const result = books.filter((book) => {
// //       const tags = Array.isArray(book?.tags)
// //         ? book.tags.join(" ")
// //         : "";

// //       const searchable = [
// //         book?.title,
// //         book?.slug,
// //         book?.subtitle,
// //         book?.resourceType,
// //         book?.pageKey,
// //         book?.category,
// //         book?.badge,
// //         tags,
// //       ]
// //         .filter(Boolean)
// //         .join(" ")
// //         .toLowerCase();

// //       const matchesSearch =
// //         !query || searchable.includes(query);

// //       const matchesCategory =
// //         !category || book?.category === category;

// //       const matchesType =
// //         !resourceType ||
// //         book?.resourceType === resourceType;

// //       return (
// //         matchesSearch &&
// //         matchesCategory &&
// //         matchesType
// //       );
// //     });

// //     return [...result].sort((a, b) => {
// //       if (sort === "price-low") {
// //         return (
// //           Number(a?.price || 0) -
// //           Number(b?.price || 0)
// //         );
// //       }

// //       if (sort === "price-high") {
// //         return (
// //           Number(b?.price || 0) -
// //           Number(a?.price || 0)
// //         );
// //       }

// //       if (sort === "title") {
// //         return String(a?.title || "").localeCompare(
// //           String(b?.title || "")
// //         );
// //       }

// //       return 0;
// //     });
// //   }, [
// //     books,
// //     search,
// //     category,
// //     resourceType,
// //     sort,
// //   ]);

// //   /* =======================================================
// //      NAVIGATION
// //   ======================================================= */

// //   const openBook = (book) => {
// //     const redirectUrl = book?.redirectUrl?.trim();

// //     if (!redirectUrl) {
// //       console.error(
// //         "Product redirectUrl is missing:",
// //         book
// //       );

// //       return;
// //     }

// //     /*
// //      * External URL
// //      */
// //     if (
// //       redirectUrl.startsWith("http://") ||
// //       redirectUrl.startsWith("https://")
// //     ) {
// //       window.location.href = redirectUrl;
// //       return;
// //     }

// //     /*
// //      * Internal React route
// //      */
// //     const normalizedPath = redirectUrl.startsWith("/")
// //       ? redirectUrl
// //       : `/${redirectUrl}`;

// //     navigate(normalizedPath);
// //   };

// //   /* =======================================================
// //      CLEAR FILTERS
// //   ======================================================= */

// //   const clearFilters = () => {
// //     setSearch("");
// //     setCategory("");
// //     setResourceType("");
// //     setSort("");
// //   };

// //   const hasFilters =
// //     Boolean(search) ||
// //     Boolean(category) ||
// //     Boolean(resourceType) ||
// //     Boolean(sort);

// //   /* =======================================================
// //      UI
// //   ======================================================= */

// //   return (
// //     <>
// //       <Helmet>
// //         <title>
// //           Books & Digital Resources | Target Trek
// //         </title>

// //         <meta
// //           name="description"
// //           content="Explore ebooks, developer guides, courses, PDFs and practical learning resources from Target Trek."
// //         />
// //       </Helmet>

// //       <ScrollToTop />

// //       <main className="min-h-screen bg-slate-50 pt-24 text-slate-900 sm:pt-28">
// //         {/* =================================================
// //             HERO
// //         ================================================= */}

// //         <section className="relative overflow-hidden border-b border-slate-200 bg-white">
// //           <div
// //             className="pointer-events-none absolute inset-0 opacity-50"
// //             style={{
// //               backgroundImage:
// //                 "linear-gradient(rgba(37,99,235,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.035) 1px, transparent 1px)",

// //               backgroundSize: "40px 40px",
// //             }}
// //           />

// //           <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
// //             <div className="max-w-3xl">
// //               <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-700">
// //                 <BookOpen className="h-3.5 w-3.5" />

// //                 Target Trek Library
// //               </div>

// //               <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
// //                 Learn from resources

// //                 <span className="block text-blue-600">
// //                   built for practical growth.
// //                 </span>
// //               </h1>

// //               <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
// //                 Explore practical ebooks, developer guides,
// //                 PDFs, courses and carefully created learning
// //                 resources.
// //               </p>

// //               {!loading &&
// //                 !error &&
// //                 books.length > 0 && (
// //                   <div className="mt-8 grid max-w-md grid-cols-2 divide-x divide-slate-200 border-y border-slate-200">
// //                     <HeroStat
// //                       value={books.length}
// //                       label={
// //                         books.length === 1
// //                           ? "Product"
// //                           : "Products"
// //                       }
// //                     />

// //                     <HeroStat
// //                       value={categories.length}
// //                       label="Categories"
// //                     />
// //                   </div>
// //                 )}
// //             </div>
// //           </div>
// //         </section>

// //         {/* =================================================
// //             CONTENT
// //         ================================================= */}

// //         <section className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
// //           {/* ===============================================
// //               FILTER BAR
// //           =============================================== */}

// //           {!loading &&
// //             !error &&
// //             books.length > 0 && (
// //               <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
// //                 <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
// //                   {/* Search */}

// //                   <div className="relative min-w-0 flex-1">
// //                     <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

// //                     <input
// //                       type="text"
// //                       value={search}
// //                       onChange={(event) =>
// //                         setSearch(event.target.value)
// //                       }
// //                       placeholder="Search books, tags, categories..."
// //                       className="
// //                         h-11
// //                         w-full
// //                         rounded-xl
// //                         border
// //                         border-slate-200
// //                         bg-slate-50
// //                         pl-11
// //                         pr-10
// //                         text-sm
// //                         text-slate-800
// //                         outline-none
// //                         transition
// //                         placeholder:text-slate-400
// //                         focus:border-blue-400
// //                         focus:bg-white
// //                         focus:ring-4
// //                         focus:ring-blue-100
// //                       "
// //                     />

// //                     {search && (
// //                       <button
// //                         type="button"
// //                         aria-label="Clear search"
// //                         onClick={() => setSearch("")}
// //                         className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-slate-100"
// //                       >
// //                         <X className="h-4 w-4 text-slate-500" />
// //                       </button>
// //                     )}
// //                   </div>

// //                   {/* Filters */}

// //                   <div className="flex flex-wrap gap-2">
// //                     {categories.length > 0 && (
// //                       <SelectField
// //                         value={category}
// //                         onChange={setCategory}
// //                         options={categories}
// //                         placeholder="All Categories"
// //                       />
// //                     )}

// //                     {resourceTypes.length > 0 && (
// //                       <SelectField
// //                         value={resourceType}
// //                         onChange={setResourceType}
// //                         options={resourceTypes.map((type) => ({
// //                           value: type,
// //                           label: formatResourceType(type),
// //                         }))}
// //                         placeholder="All Types"
// //                       />
// //                     )}

// //                     <SelectField
// //                       value={sort}
// //                       onChange={setSort}
// //                       options={[
// //                         {
// //                           value: "price-low",
// //                           label: "Price: Low to High",
// //                         },
// //                         {
// //                           value: "price-high",
// //                           label: "Price: High to Low",
// //                         },
// //                         {
// //                           value: "title",
// //                           label: "Title: A-Z",
// //                         },
// //                       ]}
// //                       placeholder="Sort By"
// //                     />
// //                   </div>
// //                 </div>

// //                 {/* Result count */}

// //                 <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
// //                   <div className="flex items-center gap-2 text-xs text-slate-500">
// //                     <Filter className="h-3.5 w-3.5" />

// //                     <span>
// //                       Showing{" "}
// //                       <strong className="text-slate-900">
// //                         {filteredBooks.length}
// //                       </strong>{" "}
// //                       of{" "}
// //                       <strong className="text-slate-900">
// //                         {books.length}
// //                       </strong>{" "}
// //                       products
// //                     </span>
// //                   </div>

// //                   {hasFilters && (
// //                     <button
// //                       type="button"
// //                       onClick={clearFilters}
// //                       className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
// //                     >
// //                       Clear filters
// //                     </button>
// //                   )}
// //                 </div>
// //               </div>
// //             )}

// //           {/* ===============================================
// //               LOADING
// //           =============================================== */}

// //           {loading && (
// //             <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
// //               {Array.from({
// //                 length: 6,
// //               }).map((_, index) => (
// //                 <ProductSkeleton key={index} />
// //               ))}
// //             </div>
// //           )}

// //           {/* ===============================================
// //               ERROR
// //           =============================================== */}

// //           {!loading && error && (
// //             <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
// //               <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
// //                 <AlertCircle className="h-8 w-8 text-red-500" />
// //               </div>

// //               <h2 className="mt-6 text-2xl font-bold text-slate-950">
// //                 Unable to load products
// //               </h2>

// //               <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
// //                 {error}
// //               </p>

// //               <button
// //                 type="button"
// //                 onClick={() => window.location.reload()}
// //                 className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
// //               >
// //                 Try Again
// //               </button>
// //             </div>
// //           )}

// //           {/* ===============================================
// //               NO PRODUCTS
// //           =============================================== */}

// //           {!loading &&
// //             !error &&
// //             books.length === 0 && (
// //               <div className="rounded-3xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
// //                 <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
// //                   <BookOpen className="h-9 w-9 text-blue-600" />
// //                 </div>

// //                 <h2 className="mt-7 text-3xl font-bold text-slate-950">
// //                   New resources are coming soon
// //                 </h2>

// //                 <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
// //                   We're currently adding books and digital
// //                   learning resources to the library.
// //                 </p>
// //               </div>
// //             )}

// //           {/* ===============================================
// //               PRODUCT GRID

// //               MOBILE  = 1 CARD
// //               DESKTOP = 2 CARDS
// //           =============================================== */}

// //           {!loading &&
// //             !error &&
// //             books.length > 0 &&
// //             filteredBooks.length > 0 && (
// //               <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
// //                 {filteredBooks.map((book) => (
// //                   <ProductCard
// //                     key={
// //                       book._id ||
// //                       book.pageKey ||
// //                       book.slug
// //                     }
// //                     book={book}
// //                     onOpen={openBook}
// //                   />
// //                 ))}
// //               </div>
// //             )}

// //           {/* ===============================================
// //               NO FILTER RESULTS
// //           =============================================== */}

// //           {!loading &&
// //             !error &&
// //             books.length > 0 &&
// //             filteredBooks.length === 0 && (
// //               <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
// //                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
// //                   <Search className="h-7 w-7 text-slate-400" />
// //                 </div>

// //                 <h2 className="mt-6 text-2xl font-bold text-slate-950">
// //                   No products found
// //                 </h2>

// //                 <p className="mt-3 text-sm text-slate-500">
// //                   Try another search term or clear the
// //                   selected filters.
// //                 </p>

// //                 <button
// //                   type="button"
// //                   onClick={clearFilters}
// //                   className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
// //                 >
// //                   Clear Filters
// //                 </button>
// //               </div>
// //             )}
// //         </section>
// //       </main>
// //     </>
// //   );
// // }
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { Helmet } from "react-helmet-async";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   AlertCircle,
//   ArrowRight,
//   BookOpen,
//   CheckCircle2,
//   ChevronDown,
//   Code2,
//   FileText,
//   Filter,
//   Layers3,
//   Search,
//   ShieldCheck,
//   Sparkles,
//   Target,
//   X,
//   Zap,
// } from "lucide-react";
// import BASE_URL from "../utils/Url";

// const SITE_URL = "https://www.targettrek.in";
// const SITE_NAME = "Target Trek";
// const CANONICAL_URL = `${SITE_URL}/books`;
// const SEO_TITLE = "Developer Books & Interview Guides | Target Trek";
// const SEO_DESCRIPTION =
//   "Explore practical ebooks and digital resources for system design, GenAI, backend engineering, coding interviews, and developer growth from Target Trek.";

// const TAG_STYLES = [
//   "border-blue-200 bg-blue-50 text-blue-700",
//   "border-violet-200 bg-violet-50 text-violet-700",
//   "border-emerald-200 bg-emerald-50 text-emerald-700",
//   "border-orange-200 bg-orange-50 text-orange-700",
//   "border-pink-200 bg-pink-50 text-pink-700",
//   "border-cyan-200 bg-cyan-50 text-cyan-700",
//   "border-amber-200 bg-amber-50 text-amber-700",
//   "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
//   "border-teal-200 bg-teal-50 text-teal-700",
// ];

// function ScrollToTop() {
//   const { pathname } = useLocation();

//   useEffect(() => {
//     window.scrollTo({ top: 0, left: 0, behavior: "auto" });
//   }, [pathname]);

//   return null;
// }

// function money(value, currency = "INR") {
//   if (value === undefined || value === null || value === "") return "";

//   const number = Number(value);
//   if (!Number.isFinite(number)) return "";

//   const localeByCurrency = {
//     INR: "en-IN",
//     USD: "en-US",
//     GBP: "en-GB",
//     EUR: "en-IE",
//     AUD: "en-AU",
//     CAD: "en-CA",
//   };

//   try {
//     return new Intl.NumberFormat(localeByCurrency[currency] || "en", {
//       style: "currency",
//       currency,
//       minimumFractionDigits: Number.isInteger(number) ? 0 : 2,
//       maximumFractionDigits: 2,
//     }).format(number);
//   } catch {
//     return `${currency} ${number.toLocaleString()}`;
//   }
// }

// function getDiscount(book) {
//   const price = Number(book?.price);
//   const mrp = Number(book?.mrp);

//   if (
//     !Number.isFinite(price) ||
//     !Number.isFinite(mrp) ||
//     mrp <= 0 ||
//     price >= mrp
//   ) {
//     return 0;
//   }

//   return Math.round(((mrp - price) / mrp) * 100);
// }

// function getSavings(book) {
//   const price = Number(book?.price);
//   const mrp = Number(book?.mrp);

//   if (
//     !Number.isFinite(price) ||
//     !Number.isFinite(mrp) ||
//     mrp <= price
//   ) {
//     return 0;
//   }

//   return mrp - price;
// }

// function formatResourceType(type) {
//   const map = {
//     pdf: "PDF",
//     ebook: "Ebook",
//     course: "Course",
//     bundle: "Bundle",
//     template: "Template",
//     notes: "Notes",
//     other: "Digital Product",
//   };

//   return map[type] || "Digital Product";
// }

// function getTagStyle(tag = "") {
//   let hash = 0;

//   for (let i = 0; i < tag.length; i += 1) {
//     hash = tag.charCodeAt(i) + ((hash << 5) - hash);
//   }

//   return TAG_STYLES[Math.abs(hash) % TAG_STYLES.length];
// }

// function getCoverUrl(book) {
//   return (
//     book?.coverPageUrl ||
//     book?.coverpageurl ||
//     book?.cover_page_url ||
//     ""
//   );
// }

// function BookCover({ book, priority = false }) {
//   const [imageError, setImageError] = useState(false);
//   const coverUrl = getCoverUrl(book);

//   useEffect(() => {
//     setImageError(false);
//   }, [coverUrl]);

//   return (
//     <div className="relative h-full w-full">
//       {coverUrl && !imageError ? (
//         <img
//           src={coverUrl}
//           alt={`${book?.title || "Target Trek resource"} cover`}
//           loading={priority ? "eager" : "lazy"}
//           fetchPriority={priority ? "high" : "auto"}
//           onError={() => setImageError(true)}
//           className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
//         />
//       ) : (
//         <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-4 text-white">
//           <div className="flex items-center justify-between">
//             <BookOpen className="h-6 w-6 text-blue-200" />
//             <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">
//               Target Trek
//             </span>
//           </div>

//           <div>
//             <div className="mb-3 h-1 w-9 rounded-full bg-blue-300" />
//             <h3 className="line-clamp-4 text-sm font-bold leading-5 sm:text-base">
//               {book?.title || "Digital Product"}
//             </h3>
//           </div>
//         </div>
//       )}

//       <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-white/5" />
//     </div>
//   );
// }

// function ProductCard({ book, onOpen, priority = false, featured = false }) {
//   const discount = getDiscount(book);
//   const savings = getSavings(book);
//   const firstTag =
//     Array.isArray(book?.tags) && book.tags.length > 0
//       ? book.tags[0]
//       : null;

//   const handleKeyboard = (event) => {
//     if (event.key === "Enter" || event.key === " ") {
//       event.preventDefault();
//       onOpen(book);
//     }
//   };

//   return (
//     <article
//       role="link"
//       tabIndex={0}
//       onClick={() => onOpen(book)}
//       onKeyDown={handleKeyboard}
//       aria-label={`View ${book?.title || "product"}`}
//       className={`group relative flex cursor-pointer overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)] outline-none transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_46px_rgba(15,23,42,0.10)] focus-visible:ring-4 focus-visible:ring-blue-100 ${featured ? "min-h-[320px]" : "min-h-[250px]"}`}
//     >
//       <div className={`relative m-3 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm sm:m-4 ${featured ? "w-[145px] sm:w-[190px] lg:w-[230px]" : "w-[118px] sm:w-[138px] lg:w-[150px]"}`}>

//         <BookCover book={book} priority={priority} />
//       </div>

//       <div className="flex min-w-0 flex-1 flex-col px-2 py-4 pr-4 sm:py-5 sm:pr-5">
//         <div className="mb-3 flex min-h-[25px] flex-wrap items-center gap-1.5">
//           {firstTag && (
//             <span
//               title={firstTag}
//               className={`max-w-[120px] truncate rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${getTagStyle(
//                 firstTag
//               )}`}
//             >
//               {firstTag}
//             </span>
//           )}

//           {book?.category && (
//             <span
//               title={book.category}
//               className="max-w-[120px] truncate rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-violet-700"
//             >
//               {book.category}
//             </span>
//           )}

//           <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
//             <FileText className="h-2.5 w-2.5" />
//             {formatResourceType(book?.resourceType)}
//           </span>
//         </div>

//         {(book?.isFeatured || book?.badge) && (
//           <div className="mb-2 flex flex-wrap items-center gap-2">
//             {book?.isFeatured && (
//               <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-blue-600">
//                 <Sparkles className="h-3 w-3" />
//                 Featured
//               </span>
//             )}

//             {book?.badge && (
//               <span className="text-[10px] font-semibold text-slate-400">
//                 {book.badge}
//               </span>
//             )}
//           </div>
//         )}

//         <h2 className={`line-clamp-2 font-extrabold tracking-tight text-slate-950 transition-colors group-hover:text-blue-700 ${featured ? "text-xl leading-7 sm:text-2xl sm:leading-8" : "text-base leading-6 sm:text-lg"}`}>
//           {book?.title || "Untitled Product"}
//         </h2>

//         {book?.subtitle && (
//           <p className={`mt-1.5 text-slate-500 ${featured ? "line-clamp-3 text-sm leading-7 sm:text-base" : "line-clamp-2 text-xs leading-5 sm:text-[13px]"}`}>

//             {book.subtitle}
//           </p>
//         )}

//         <div className="flex-1" />

//         <div className="mt-4 border-t border-slate-100 pt-3">
//           <div className="flex items-end justify-between gap-3">
//             <div className="min-w-0">
//               <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
//                 Get it for
//               </p>

//               <div className="flex flex-wrap items-center gap-2">
//                 <span className={`${featured ? "text-2xl sm:text-3xl" : "text-xl"} font-extrabold tracking-tight text-slate-950`}>
//                   {money(book?.price, book?.currency)}
//                 </span>

//                 {Number(book?.mrp) > Number(book?.price) && (
//                   <span className="text-xs font-medium text-slate-400 line-through">
//                     {money(book?.mrp, book?.currency)}
//                   </span>
//                 )}
//               </div>

//               {(savings > 0 || discount > 0) && (
//                 <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
//                   {savings > 0 && (
//                     <span className="text-[10px] font-bold text-emerald-600">
//                       Save {money(savings, book?.currency)}
//                     </span>
//                   )}

//                   {discount > 0 && (
//                     <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
//                       {discount}% OFF
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600">
//               <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
//             </div>
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// }

// function SelectField({
//   value,
//   onChange,
//   options,
//   placeholder,
//   ariaLabel,
// }) {
//   return (
//     <div className="relative">
//       <select
//         value={value}
//         onChange={(event) => onChange(event.target.value)}
//         aria-label={ariaLabel || placeholder}
//         className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
//       >
//         <option value="">{placeholder}</option>

//         {options.map((option) => {
//           const optionValue = option.value ?? option;
//           const optionLabel = option.label ?? option;

//           return (
//             <option key={optionValue} value={optionValue}>
//               {optionLabel}
//             </option>
//           );
//         })}
//       </select>

//       <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//     </div>
//   );
// }

// function ProductSkeleton() {
//   return (
//     <div className="flex min-h-[250px] animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white">
//       <div className="m-3 w-[118px] shrink-0 rounded-2xl bg-slate-100 sm:m-4 sm:w-[138px] lg:w-[150px]" />

//       <div className="flex flex-1 flex-col py-5 pr-5">
//         <div className="flex gap-2">
//           <div className="h-5 w-16 rounded-full bg-slate-100" />
//           <div className="h-5 w-20 rounded-full bg-slate-100" />
//         </div>

//         <div className="mt-5 h-5 w-full rounded bg-slate-100" />
//         <div className="mt-2 h-5 w-4/5 rounded bg-slate-100" />
//         <div className="mt-3 h-3 w-full rounded bg-slate-50" />
//         <div className="mt-2 h-3 w-2/3 rounded bg-slate-50" />
//         <div className="flex-1" />

//         <div className="mt-5 border-t border-slate-100 pt-4">
//           <div className="h-7 w-24 rounded bg-slate-100" />
//         </div>
//       </div>
//     </div>
//   );
// }

// function HeroStat({ value, label }) {
//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white/90 px-5 py-4 shadow-sm backdrop-blur">
//       <div className="text-2xl font-extrabold text-blue-600 sm:text-3xl">
//         {value}
//       </div>
//       <div className="mt-1 text-xs font-semibold text-slate-500">
//         {label}
//       </div>
//     </div>
//   );
// }

// const discoveryItems = [
//   {
//     icon: Code2,
//     title: "Code-first learning",
//     text: "Use practical examples, implementation notes, and developer-focused explanations instead of theory alone.",
//   },
//   {
//     icon: Layers3,
//     title: "Structured interview prep",
//     text: "Move from fundamentals to architecture, trade-offs, edge cases, and real interview discussions.",
//   },
//   {
//     icon: ShieldCheck,
//     title: "Production-aware topics",
//     text: "Go beyond demos with reliability, security, evaluation, scaling, and deployment considerations.",
//   },
//   {
//     icon: Zap,
//     title: "Fast revision",
//     text: "Use concise learning paths, examples, and reference sections when you need to revise quickly.",
//   },
// ];

// const learningSteps = [
//   {
//     number: "01",
//     title: "Choose your focus",
//     text: "Pick a topic such as system design, GenAI, backend engineering, or interview preparation.",
//   },
//   {
//     number: "02",
//     title: "Learn with structure",
//     text: "Follow resources that move from fundamentals into implementation, architecture, and practical trade-offs.",
//   },
//   {
//     number: "03",
//     title: "Apply and revise",
//     text: "Use code, diagrams, examples, and interview-oriented sections to turn concepts into usable knowledge.",
//   },
// ];

// const faqs = [
//   {
//     q: "What kind of resources are available on Target Trek?",
//     a: "The library includes digital ebooks, PDFs, developer guides, notes, courses, bundles, and other practical learning resources. Availability depends on the current catalog.",
//   },
//   {
//     q: "Are the prices shown on this page live?",
//     a: "Yes. Product information, price, currency, and offers are loaded from the Target Trek backend when the library page opens.",
//   },
//   {
//     q: "Can I search by topic or category?",
//     a: "Yes. Use the search box, category filter, resource-type filter, and sorting controls to narrow the catalog.",
//   },
//   {
//     q: "Are these resources useful for interview preparation?",
//     a: "Many Target Trek resources are designed around practical developer learning and interview preparation, including system design, backend engineering, and GenAI topics.",
//   },
// ];

// export default function Books() {
//   const navigate = useNavigate();
//   const [books, setBooks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [retryCount, setRetryCount] = useState(0);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("");
//   const [resourceType, setResourceType] = useState("");
//   const [sort, setSort] = useState("");
//   const [openFaq, setOpenFaq] = useState(0);

//   const fetchBooks = useCallback(async (signal) => {
//     try {
//       setLoading(true);
//       setError("");

//       const response = await fetch(`${BASE_URL}/book`, {
//         method: "GET",
//         cache: "no-store",
//         headers: {
//           Accept: "application/json",
//         },
//         signal,
//       });

//       let result;

//       try {
//         result = await response.json();
//       } catch {
//         throw new Error("Invalid response received from the server.");
//       }

//       if (!response.ok || result?.success !== true) {
//         throw new Error(
//           result?.error?.message ||
//             result?.message ||
//             "Unable to load products."
//         );
//       }

//       setBooks(Array.isArray(result?.data) ? result.data : []);
//     } catch (err) {
//       if (err?.name === "AbortError") return;

//       console.error("Products fetch error:", err);
//       setBooks([]);
//       setError(
//         err?.message ||
//           "Something went wrong while loading products."
//       );
//     } finally {
//       if (!signal?.aborted) {
//         setLoading(false);
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const controller = new AbortController();
//     fetchBooks(controller.signal);
//     return () => controller.abort();
//   }, [fetchBooks, retryCount]);

//   const categories = useMemo(() => {
//     return [
//       ...new Set(
//         books
//           .map((book) => book?.category?.trim())
//           .filter(Boolean)
//       ),
//     ].sort((a, b) => a.localeCompare(b));
//   }, [books]);

//   const resourceTypes = useMemo(() => {
//     return [
//       ...new Set(
//         books
//           .map((book) => book?.resourceType)
//           .filter(Boolean)
//       ),
//     ].sort();
//   }, [books]);

//   const filteredBooks = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     const result = books.filter((book) => {
//       const tags = Array.isArray(book?.tags)
//         ? book.tags.join(" ")
//         : "";

//       const searchable = [
//         book?.title,
//         book?.slug,
//         book?.subtitle,
//         book?.resourceType,
//         book?.pageKey,
//         book?.category,
//         book?.badge,
//         tags,
//       ]
//         .filter(Boolean)
//         .join(" ")
//         .toLowerCase();

//       const matchesSearch =
//         !query || searchable.includes(query);

//       const matchesCategory =
//         !category || book?.category === category;

//       const matchesType =
//         !resourceType ||
//         book?.resourceType === resourceType;

//       return (
//         matchesSearch &&
//         matchesCategory &&
//         matchesType
//       );
//     });

//     return [...result].sort((a, b) => {
//       if (sort === "price-low") {
//         return Number(a?.price || 0) - Number(b?.price || 0);
//       }

//       if (sort === "price-high") {
//         return Number(b?.price || 0) - Number(a?.price || 0);
//       }

//       if (sort === "title") {
//         return String(a?.title || "").localeCompare(
//           String(b?.title || "")
//         );
//       }

//       return 0;
//     });
//   }, [books, search, category, resourceType, sort]);

//   const featuredBook = useMemo(() => {
//     return books.find((book) => book?.isFeatured) || null;
//   }, [books]);

//   const seoImage = useMemo(() => {
//     const withCover = books.find((book) => getCoverUrl(book));
//     return withCover ? getCoverUrl(withCover) : "";
//   }, [books]);

//   const structuredData = useMemo(() => {
//     const itemList = books.slice(0, 50).map((book, index) => {
//       const redirectUrl = String(book?.redirectUrl || "").trim();
//       const url = redirectUrl
//         ? redirectUrl.startsWith("http://") ||
//           redirectUrl.startsWith("https://")
//           ? redirectUrl
//           : `${SITE_URL}${redirectUrl.startsWith("/") ? redirectUrl : `/${redirectUrl}`}`
//         : CANONICAL_URL;

//       const price = Number(book?.price);
//       const offer =
//         Number.isFinite(price) && price >= 0
//           ? {
//               "@type": "Offer",
//               price,
//               priceCurrency: book?.currency || "INR",
//               availability: "https://schema.org/InStock",
//               url,
//             }
//           : undefined;

//       return {
//         "@type": "ListItem",
//         position: index + 1,
//         item: {
//           "@type": "Product",
//           name: book?.title || "Target Trek Digital Resource",
//           description:
//             book?.subtitle ||
//             "Practical developer learning resource from Target Trek.",
//           image: getCoverUrl(book) || undefined,
//           category:
//             book?.category ||
//             formatResourceType(book?.resourceType),
//           url,
//           brand: {
//             "@type": "Brand",
//             name: SITE_NAME,
//           },
//           offers: offer,
//         },
//       };
//     });

//     return {
//       "@context": "https://schema.org",
//       "@graph": [
//         {
//           "@type": "Organization",
//           "@id": `${SITE_URL}/#organization`,
//           name: SITE_NAME,
//           url: SITE_URL,
//         },
//         {
//           "@type": "WebSite",
//           "@id": `${SITE_URL}/#website`,
//           name: SITE_NAME,
//           url: SITE_URL,
//           publisher: {
//             "@id": `${SITE_URL}/#organization`,
//           },
//         },
//         {
//           "@type": "CollectionPage",
//           "@id": `${CANONICAL_URL}#webpage`,
//           url: CANONICAL_URL,
//           name: SEO_TITLE,
//           description: SEO_DESCRIPTION,
//           isPartOf: {
//             "@id": `${SITE_URL}/#website`,
//           },
//           about: {
//             "@id": `${SITE_URL}/#organization`,
//           },
//         },
//         {
//           "@type": "BreadcrumbList",
//           itemListElement: [
//             {
//               "@type": "ListItem",
//               position: 1,
//               name: "Home",
//               item: SITE_URL,
//             },
//             {
//               "@type": "ListItem",
//               position: 2,
//               name: "Books & Resources",
//               item: CANONICAL_URL,
//             },
//           ],
//         },
//         ...(itemList.length > 0
//           ? [
//               {
//                 "@type": "ItemList",
//                 name: "Target Trek Books and Digital Resources",
//                 itemListElement: itemList,
//               },
//             ]
//           : []),
//         {
//           "@type": "FAQPage",
//           mainEntity: faqs.map((item) => ({
//             "@type": "Question",
//             name: item.q,
//             acceptedAnswer: {
//               "@type": "Answer",
//               text: item.a,
//             },
//           })),
//         },
//       ],
//     };
//   }, [books]);

//   const openBook = (book) => {
//     const redirectUrl = book?.redirectUrl?.trim();

//     if (!redirectUrl) {
//       console.error("Product redirectUrl is missing:", book);
//       return;
//     }

//     if (
//       redirectUrl.startsWith("http://") ||
//       redirectUrl.startsWith("https://")
//     ) {
//       window.location.href = redirectUrl;
//       return;
//     }

//     navigate(
//       redirectUrl.startsWith("/")
//         ? redirectUrl
//         : `/${redirectUrl}`
//     );
//   };

//   const clearFilters = () => {
//     setSearch("");
//     setCategory("");
//     setResourceType("");
//     setSort("");
//   };

//   const hasFilters =
//     Boolean(search) ||
//     Boolean(category) ||
//     Boolean(resourceType) ||
//     Boolean(sort);

//   const scrollToLibrary = () => {
//     document
//       .getElementById("library")
//       ?.scrollIntoView({ behavior: "smooth" });
//   };

//   return (
//     <>
//       <Helmet>
//         <title>{SEO_TITLE}</title>
//         <meta name="description" content={SEO_DESCRIPTION} />
//         <meta
//           name="robots"
//           content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
//         />
//         <meta
//           name="googlebot"
//           content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
//         />
//         <meta name="author" content="Target Trek" />
//         <meta name="application-name" content="Target Trek" />
//         <meta name="theme-color" content="#2563eb" />
//         <link rel="canonical" href={CANONICAL_URL} />

//         <meta property="og:type" content="website" />
//         <meta property="og:site_name" content={SITE_NAME} />
//         <meta property="og:title" content={SEO_TITLE} />
//         <meta property="og:description" content={SEO_DESCRIPTION} />
//         <meta property="og:url" content={CANONICAL_URL} />
//         <meta property="og:locale" content="en_IN" />

//         {seoImage && (
//           <meta property="og:image" content={seoImage} />
//         )}

//         {seoImage && (
//           <meta
//             property="og:image:alt"
//             content="Target Trek developer books and digital resources"
//           />
//         )}

//         <meta
//           name="twitter:card"
//           content={seoImage ? "summary_large_image" : "summary"}
//         />
//         <meta name="twitter:title" content={SEO_TITLE} />
//         <meta
//           name="twitter:description"
//           content={SEO_DESCRIPTION}
//         />

//         {seoImage && (
//           <meta name="twitter:image" content={seoImage} />
//         )}

//         <script type="application/ld+json">
//           {JSON.stringify(structuredData)}
//         </script>
//       </Helmet>

//       <ScrollToTop />

//       <main className="min-h-screen bg-[#f7f9fc] pt-24 text-slate-900 sm:pt-28">
//         <section className="relative overflow-hidden border-b border-blue-100 bg-white">
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(99,102,241,0.10),transparent_28%)]" />
//           <div
//             className="pointer-events-none absolute inset-0 opacity-50"
//             style={{
//               backgroundImage:
//                 "linear-gradient(rgba(37,99,235,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.035) 1px, transparent 1px)",
//               backgroundSize: "42px 42px",
//             }}
//           />

//           <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.06fr_.94fr] lg:px-8 lg:py-20">
//             <div className="self-center">
//               <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-black uppercase tracking-[0.14em] text-blue-700">
//                 <BookOpen className="h-4 w-4" />
//                 Target Trek Developer Library
//               </div>

//               <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.06] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
//                 Practical resources for
//                 <span className="block text-blue-600">
//                   developers who want to build and grow.
//                 </span>
//               </h1>

//               <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
//                 Explore developer-focused ebooks, interview guides, PDFs,
//                 courses, and technical resources covering system design,
//                 GenAI, backend engineering, and practical software
//                 development.
//               </p>

//               <div className="mt-8 flex flex-wrap gap-3">
//                 <button
//                   type="button"
//                   onClick={scrollToLibrary}
//                   className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
//                 >
//                   Explore the library
//                   <ArrowRight className="h-4 w-4" />
//                 </button>

//                 <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600">
//                   <CheckCircle2 className="h-4 w-4 text-emerald-500" />
//                   Instant digital access
//                 </div>
//               </div>

//               {!loading && !error && books.length > 0 && (
//                 <div className="mt-9 grid max-w-lg grid-cols-2 gap-3 sm:grid-cols-3">
//                   <HeroStat
//                     value={books.length}
//                     label={books.length === 1 ? "Resource" : "Resources"}
//                   />
//                   <HeroStat
//                     value={categories.length}
//                     label="Categories"
//                   />
//                   <HeroStat
//                     value={resourceTypes.length}
//                     label="Formats"
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="relative hidden min-h-[470px] lg:block">
//               <div className="absolute inset-2 rounded-[38px] border border-blue-100 bg-gradient-to-br from-[#f7fbff] via-white to-[#eef2ff] shadow-[0_30px_80px_rgba(37,99,235,0.12)]" />
//               <div className="absolute -right-8 top-8 h-36 w-36 rounded-full bg-violet-200/40 blur-3xl" />
//               <div className="absolute -left-8 bottom-8 h-40 w-40 rounded-full bg-blue-200/40 blur-3xl" />

//               <div className="absolute inset-8 flex flex-col rounded-[30px] border border-white/80 bg-white/78 p-6 shadow-xl backdrop-blur-xl">
//                 <div className="flex items-start justify-between gap-5">
//                   <div>
//                     <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-blue-700">
//                       <Sparkles className="h-3.5 w-3.5" />
//                       Developer learning map
//                     </div>
//                     <h2 className="mt-4 max-w-md text-2xl font-black leading-tight tracking-tight text-slate-950">
//                       Learn the concept, prepare for the interview, then apply it in real systems.
//                     </h2>
//                   </div>
//                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
//                     <Layers3 className="h-5 w-5" />
//                   </div>
//                 </div>

//                 <div className="mt-6 grid grid-cols-3 gap-3">
//                   <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
//                     <div className="text-xl font-black text-blue-700">
//                       {!loading && !error && books.length > 0 ? books.length : "Curated"}
//                     </div>
//                     <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
//                       Resources
//                     </div>
//                   </div>
//                   <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-3">
//                     <div className="text-xl font-black text-violet-700">
//                       {!loading && !error && categories.length > 0 ? categories.length : "Focused"}
//                     </div>
//                     <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
//                       Topics
//                     </div>
//                   </div>
//                   <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
//                     <div className="text-xl font-black text-emerald-700">
//                       {!loading && !error && resourceTypes.length > 0 ? resourceTypes.length : "Practical"}
//                     </div>
//                     <div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
//                       Formats
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-5 grid gap-3">
//                   <div className="flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                       <Code2 className="h-5 w-5" />
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <div className="flex items-center justify-between gap-3">
//                         <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-600">Learn</p>
//                         <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700">01</span>
//                       </div>
//                       <p className="mt-1 font-extrabold text-slate-950">Concepts + implementation</p>
//                     </div>
//                   </div>

//                   <div className="ml-8 flex items-center gap-4 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
//                       <Target className="h-5 w-5" />
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <div className="flex items-center justify-between gap-3">
//                         <p className="text-[10px] font-black uppercase tracking-[0.14em] text-violet-600">Prepare</p>
//                         <span className="rounded-full bg-violet-50 px-2 py-1 text-[9px] font-bold text-violet-700">02</span>
//                       </div>
//                       <p className="mt-1 font-extrabold text-slate-950">Interviews + system thinking</p>
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-white shadow-lg">
//                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
//                       <Zap className="h-5 w-5" />
//                     </div>
//                     <div className="min-w-0 flex-1">
//                       <div className="flex items-center justify-between gap-3">
//                         <p className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-300">Apply</p>
//                         <span className="rounded-full bg-white/10 px-2 py-1 text-[9px] font-bold text-blue-200">03</span>
//                       </div>
//                       <p className="mt-1 font-extrabold">Build with practical context</p>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-[10px] font-bold text-slate-500">
//                   <span>Code-first</span>
//                   <span className="h-1 w-1 rounded-full bg-slate-300" />
//                   <span>Interview-ready</span>
//                   <span className="h-1 w-1 rounded-full bg-slate-300" />
//                   <span>Production-aware</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section className="border-b border-slate-200 bg-white">
//           <div className="mx-auto grid max-w-7xl gap-4 px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
//             {discoveryItems.map(({ icon: Icon, title, text }) => (
//               <div
//                 key={title}
//                 className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5"
//               >
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//                   <Icon className="h-5 w-5" />
//                 </div>
//                 <h2 className="mt-4 text-sm font-black text-slate-950">
//                   {title}
//                 </h2>
//                 <p className="mt-2 text-xs leading-6 text-slate-500">
//                   {text}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </section>

//         {!loading && !error && featuredBook && (
//           <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
//             <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
//               <div>
//                 <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
//                   Featured resource
//                 </p>
//                 <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
//                   Start with our featured book
//                 </h2>
//                 <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
//                   One highlighted resource from the current Target Trek catalog, selected to give you a strong place to start.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={scrollToLibrary}
//                 className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
//               >
//                 Browse everything
//                 <ArrowRight className="h-4 w-4" />
//               </button>
//             </div>

//             <div className="mt-8 w-full max-w-6xl">
//               <ProductCard
//                 key={featuredBook._id || featuredBook.pageKey || featuredBook.slug}
//                 book={featuredBook}
//                 onOpen={openBook}
//                 priority
//                 featured
//               />
//             </div>
//           </section>
//         )}

//         <section id="library" className="border-y border-slate-200 bg-slate-50">
//           <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
//             <div className="mb-8">
//               <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
//                 Complete library
//               </p>
//               <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
//                 <div>
//                   <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
//                     Find the right resource for your next goal
//                   </h2>
//                   <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
//                     Search the catalog, filter by category or format, and
//                     compare live pricing directly from the backend.
//                   </p>
//                 </div>

//                 {!loading && !error && books.length > 0 && (
//                   <div className="text-sm font-semibold text-slate-500">
//                     {books.length} total{" "}
//                     {books.length === 1 ? "resource" : "resources"}
//                   </div>
//                 )}
//               </div>
//             </div>

//             {!loading && !error && categories.length > 0 && (
//               <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
//                 <button
//                   type="button"
//                   onClick={() => setCategory("")}
//                   className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
//                     !category
//                       ? "border-blue-600 bg-blue-600 text-white"
//                       : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
//                   }`}
//                 >
//                   All topics
//                 </button>

//                 {categories.slice(0, 8).map((item) => (
//                   <button
//                     type="button"
//                     key={item}
//                     onClick={() => setCategory(item)}
//                     className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold transition ${
//                       category === item
//                         ? "border-blue-600 bg-blue-600 text-white"
//                         : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
//                     }`}
//                   >
//                     {item}
//                   </button>
//                 ))}
//               </div>
//             )}

//             {!loading && !error && books.length > 0 && (
//               <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//                 <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
//                   <div className="relative min-w-0 flex-1">
//                     <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

//                     <input
//                       type="search"
//                       value={search}
//                       onChange={(event) =>
//                         setSearch(event.target.value)
//                       }
//                       placeholder="Search books, topics, tags, categories..."
//                       aria-label="Search Target Trek resources"
//                       className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                     />

//                     {search && (
//                       <button
//                         type="button"
//                         aria-label="Clear search"
//                         onClick={() => setSearch("")}
//                         className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full transition hover:bg-slate-100"
//                       >
//                         <X className="h-4 w-4 text-slate-500" />
//                       </button>
//                     )}
//                   </div>

//                   <div className="flex flex-wrap gap-2">
//                     {categories.length > 0 && (
//                       <SelectField
//                         value={category}
//                         onChange={setCategory}
//                         options={categories}
//                         placeholder="All Categories"
//                         ariaLabel="Filter by category"
//                       />
//                     )}

//                     {resourceTypes.length > 0 && (
//                       <SelectField
//                         value={resourceType}
//                         onChange={setResourceType}
//                         options={resourceTypes.map((type) => ({
//                           value: type,
//                           label: formatResourceType(type),
//                         }))}
//                         placeholder="All Types"
//                         ariaLabel="Filter by resource type"
//                       />
//                     )}

//                     <SelectField
//                       value={sort}
//                       onChange={setSort}
//                       options={[
//                         {
//                           value: "price-low",
//                           label: "Price: Low to High",
//                         },
//                         {
//                           value: "price-high",
//                           label: "Price: High to Low",
//                         },
//                         {
//                           value: "title",
//                           label: "Title: A-Z",
//                         },
//                       ]}
//                       placeholder="Sort By"
//                       ariaLabel="Sort resources"
//                     />
//                   </div>
//                 </div>

//                 <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
//                   <div className="flex items-center gap-2 text-xs text-slate-500">
//                     <Filter className="h-3.5 w-3.5" />
//                     <span>
//                       Showing{" "}
//                       <strong className="text-slate-900">
//                         {filteredBooks.length}
//                       </strong>{" "}
//                       of{" "}
//                       <strong className="text-slate-900">
//                         {books.length}
//                       </strong>{" "}
//                       resources
//                     </span>
//                   </div>

//                   {hasFilters && (
//                     <button
//                       type="button"
//                       onClick={clearFilters}
//                       className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
//                     >
//                       Clear filters
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}

//             {loading && (
//               <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
//                 {Array.from({ length: 6 }).map((_, index) => (
//                   <ProductSkeleton key={index} />
//                 ))}
//               </div>
//             )}

//             {!loading && error && (
//               <div
//                 role="alert"
//                 className="rounded-3xl border border-red-100 bg-white px-6 py-20 text-center shadow-sm"
//               >
//                 <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
//                   <AlertCircle className="h-8 w-8 text-red-500" />
//                 </div>

//                 <h2 className="mt-6 text-2xl font-black text-slate-950">
//                   Unable to load the library
//                 </h2>

//                 <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
//                   {error}
//                 </p>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     setRetryCount((count) => count + 1)
//                   }
//                   className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
//                 >
//                   Try Again
//                 </button>
//               </div>
//             )}

//             {!loading && !error && books.length === 0 && (
//               <div className="rounded-3xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
//                 <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
//                   <BookOpen className="h-9 w-9 text-blue-600" />
//                 </div>

//                 <h2 className="mt-7 text-3xl font-black text-slate-950">
//                   New resources are coming soon
//                 </h2>

//                 <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
//                   We&apos;re currently adding books and digital learning
//                   resources to the library.
//                 </p>
//               </div>
//             )}

//             {!loading &&
//               !error &&
//               books.length > 0 &&
//               filteredBooks.length > 0 && (
//                 <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
//                   {filteredBooks.map((book, index) => (
//                     <ProductCard
//                       key={
//                         book._id ||
//                         book.pageKey ||
//                         book.slug ||
//                         index
//                       }
//                       book={book}
//                       onOpen={openBook}
//                       priority={index < 2}
//                     />
//                   ))}
//                 </div>
//               )}

//             {!loading &&
//               !error &&
//               books.length > 0 &&
//               filteredBooks.length === 0 && (
//                 <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
//                   <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50">
//                     <Search className="h-7 w-7 text-slate-400" />
//                   </div>

//                   <h2 className="mt-6 text-2xl font-black text-slate-950">
//                     No resources found
//                   </h2>

//                   <p className="mt-3 text-sm text-slate-500">
//                     Try another search term or clear the selected filters.
//                   </p>

//                   <button
//                     type="button"
//                     onClick={clearFilters}
//                     className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
//                   >
//                     Clear Filters
//                   </button>
//                 </div>
//               )}
//           </div>
//         </section>

//         <section className="bg-white py-20">
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <div className="mx-auto max-w-3xl text-center">
//               <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
//                 A simple learning workflow
//               </p>
//               <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
//                 Turn a resource into practical progress
//               </h2>
//               <p className="mt-4 text-sm leading-7 text-slate-500 sm:text-base">
//                 Use the library as a focused learning path rather than a
//                 collection of disconnected material.
//               </p>
//             </div>

//             <div className="mt-10 grid gap-5 md:grid-cols-3">
//               {learningSteps.map((step) => (
//                 <article
//                   key={step.number}
//                   className="rounded-3xl border border-slate-200 bg-slate-50 p-7"
//                 >
//                   <span className="text-xs font-black tracking-[0.16em] text-blue-600">
//                     STEP {step.number}
//                   </span>
//                   <h3 className="mt-4 text-xl font-black text-slate-950">
//                     {step.title}
//                   </h3>
//                   <p className="mt-3 text-sm leading-7 text-slate-500">
//                     {step.text}
//                   </p>
//                 </article>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="border-y border-blue-100 bg-blue-50/70 py-20">
//           <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:px-8">
//             <div>
//               <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
//                 Why Target Trek
//               </p>
//               <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
//                 Technical learning designed around real developer goals.
//               </h2>
//               <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
//                 The library focuses on practical learning, interview
//                 preparation, implementation thinking, and the engineering
//                 context developers need when moving from concepts to
//                 production systems.
//               </p>
//             </div>

//             <div className="grid gap-4 sm:grid-cols-2">
//               {[
//                 [
//                   "Interview-focused",
//                   "Resources are structured to help you explain concepts, trade-offs, and design decisions clearly.",
//                 ],
//                 [
//                   "Implementation-aware",
//                   "Code and architecture are connected so you understand how ideas translate into working systems.",
//                 ],
//                 [
//                   "Built for revision",
//                   "Clear sections, examples, and structured learning paths make it easier to revisit important topics.",
//                 ],
//                 [
//                   "Growing technical library",
//                   "New resources can be added to the same searchable catalog as Target Trek expands.",
//                 ],
//               ].map(([title, description]) => (
//                 <div
//                   key={title}
//                   className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm"
//                 >
//                   <CheckCircle2 className="h-5 w-5 text-blue-600" />
//                   <h3 className="mt-4 font-black text-slate-950">
//                     {title}
//                   </h3>
//                   <p className="mt-2 text-sm leading-6 text-slate-500">
//                     {description}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         <section className="bg-white py-20">
//           <div className="mx-auto max-w-3xl px-4 sm:px-6">
//             <div className="text-center">
//               <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">
//                 Questions
//               </p>
//               <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
//                 Frequently asked questions
//               </h2>
//             </div>

//             <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
//               {faqs.map((item, index) => (
//                 <div key={item.q}>
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setOpenFaq(
//                         openFaq === index ? -1 : index
//                       )
//                     }
//                     aria-expanded={openFaq === index}
//                     aria-controls={`library-faq-${index}`}
//                     className="flex w-full items-center justify-between gap-5 py-5 text-left font-black text-slate-950"
//                   >
//                     <span>{item.q}</span>
//                     <ChevronDown
//                       className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
//                         openFaq === index ? "rotate-180" : ""
//                       }`}
//                     />
//                   </button>

//                   <div
//                     id={`library-faq-${index}`}
//                     hidden={openFaq !== index}
//                     className="pb-5 pr-8 text-sm leading-7 text-slate-500"
//                   >
//                     {item.a}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>
//       </main>
//     </>
//   );
// }
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileText,
  Filter,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";

import BASE_URL from "../utils/Url";

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "TargetTrek";
const PAGE_URL = `${SITE_URL}/books`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE =
  "Software Engineering Books, System Design & GenAI Guides | TargetTrek";

const SEO_DESCRIPTION =
  "Explore practical software engineering ebooks and developer guides from TargetTrek. Learn System Design, Java LLD, Google ADK, RAG, MCP, GenAI, backend engineering and interview preparation.";

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

const money = (
  value,
  currency = "INR"
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return "";
  }

  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "";
  }

  const localeByCurrency = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "en-IE",
    AUD: "en-AU",
    CAD: "en-CA",
  };

  try {
    return new Intl.NumberFormat(
      localeByCurrency[currency] ||
        "en",
      {
        style: "currency",
        currency,
        minimumFractionDigits:
          Number.isInteger(number)
            ? 0
            : 2,
        maximumFractionDigits: 2,
      }
    ).format(number);
  } catch {
    return `${currency} ${number}`;
  }
};

const getDiscount = (book) => {
  const price = Number(book?.price);
  const mrp = Number(book?.mrp);

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
};

const getSavings = (book) => {
  const price = Number(book?.price);
  const mrp = Number(book?.mrp);

  if (
    !Number.isFinite(price) ||
    !Number.isFinite(mrp) ||
    mrp <= price
  ) {
    return 0;
  }

  return mrp - price;
};

const formatResourceType = (
  type
) => {
  const map = {
    pdf: "PDF",
    ebook: "Ebook",
    course: "Course",
    bundle: "Bundle",
    template: "Template",
    notes: "Notes",
    other: "Digital Product",
  };

  return (
    map[type] ||
    "Digital Product"
  );
};

const getCoverUrl = (book) => {
  return (
    book?.coverPageUrl ||
    book?.coverpageurl ||
    book?.cover_page_url ||
    ""
  );
};

const getBookCategories = (
  book
) => {
  if (
    Array.isArray(
      book?.categories
    ) &&
    book.categories.length > 0
  ) {
    return book.categories.filter(
      Boolean
    );
  }

  if (book?.category) {
    return [book.category];
  }

  return [];
};

const getPrimaryCategory = (
  book
) => {
  return (
    getBookCategories(book)[0] ||
    ""
  );
};

const absoluteBookUrl = (
  redirectUrl
) => {
  if (!redirectUrl) {
    return "";
  }

  if (
    redirectUrl.startsWith(
      "http://"
    ) ||
    redirectUrl.startsWith(
      "https://"
    )
  ) {
    return redirectUrl;
  }

  const path =
    redirectUrl.startsWith("/")
      ? redirectUrl
      : `/${redirectUrl}`;

  return `${SITE_URL}${path}`;
};

const discoveryItems = [
  {
    icon: Code2,
    title:
      "Code-first learning",
    text:
      "Understand concepts through practical code, implementation examples and engineering decisions.",
  },
  {
    icon: Layers3,
    title:
      "Structured preparation",
    text:
      "Move from fundamentals to architecture, trade-offs, edge cases and interview-level discussions.",
  },
  {
    icon: ShieldCheck,
    title:
      "Production-aware",
    text:
      "Go beyond basic demos with reliability, security, scaling, evaluation and deployment topics.",
  },
  {
    icon: Zap,
    title:
      "Built for revision",
    text:
      "Use structured chapters, quick references and practical examples when interview time is limited.",
  },
];

const learningTracks = [
  {
    icon: Layers3,
    title: "System Design",
    query: "system design",
    text:
      "HLD, LLD, scalability, APIs, databases, caching, concurrency and design interviews.",
  },
  {
    icon: Sparkles,
    title: "GenAI Engineering",
    query: "genai",
    text:
      "Google ADK, RAG, MCP, agents, retrieval pipelines and production GenAI systems.",
  },
  {
    icon: Code2,
    title: "Java & Backend",
    query: "java",
    text:
      "Object-oriented design, Java implementation and practical backend engineering concepts.",
  },
  {
    icon: Target,
    title: "Interview Preparation",
    query: "interview",
    text:
      "Resources designed around technical interviews, revision, architecture and engineering discussions.",
  },
];

const learningSteps = [
  {
    number: "01",
    title:
      "Choose a focused goal",
    text:
      "Start with the topic you need now instead of trying to learn everything at once.",
  },
  {
    number: "02",
    title:
      "Follow structured material",
    text:
      "Move from fundamentals to implementation, architecture, edge cases and trade-offs.",
  },
  {
    number: "03",
    title:
      "Apply what you learn",
    text:
      "Use code, design exercises, diagrams and interview questions to convert knowledge into practice.",
  },
];

const faqs = [
  {
    q:
      "What books and resources are available on TargetTrek?",
    a:
      "The TargetTrek library contains practical digital resources for software engineering, System Design, Java LLD, GenAI, Google ADK, RAG, MCP, backend engineering and interview preparation. The exact catalog depends on currently published resources.",
  },
  {
    q:
      "Are the prices shown on this page current?",
    a:
      "Yes. Product information and pricing displayed in the library are loaded from the TargetTrek backend when the page loads.",
  },
  {
    q:
      "Can I search and filter the library?",
    a:
      "Yes. You can search by title, topic and tags, filter by category or resource type, and sort resources by price or title.",
  },
  {
    q:
      "Are TargetTrek books useful for software engineering interviews?",
    a:
      "Many TargetTrek resources are designed around technical interview preparation and practical engineering topics such as HLD, LLD, backend systems and GenAI.",
  },
  {
    q:
      "Are these physical books?",
    a:
      "Resources in the library are digital products unless the individual product page states otherwise. Check the resource format before purchasing.",
  },
  {
    q:
      "Where can I get help with a book purchase?",
    a:
      "For payment, download or ebook-related issues, contact supporttargettrek@gmail.com.",
  },
];

function BookCover({
  book,
  priority = false,
}) {
  const [
    imageError,
    setImageError,
  ] = useState(false);

  const coverUrl =
    getCoverUrl(book);

  useEffect(() => {
    setImageError(false);
  }, [coverUrl]);

  return (
    <div className="relative h-full w-full">
      {coverUrl &&
      !imageError ? (
        <img
          src={coverUrl}
          alt={`${
            book?.title ||
            "TargetTrek resource"
          } cover`}
          loading={
            priority
              ? "eager"
              : "lazy"
          }
          decoding="async"
          onError={() =>
            setImageError(true)
          }
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      ) : (
        <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-4 text-white">
          <div className="flex items-center justify-between">
            <BookOpen className="h-6 w-6 text-blue-200" />

            <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">
              TargetTrek
            </span>
          </div>

          <div>
            <div className="mb-3 h-1 w-9 rounded-full bg-blue-300" />

            <p className="line-clamp-4 text-sm font-black leading-5 sm:text-base">
              {book?.title ||
                "Digital Resource"}
            </p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-white/5" />
    </div>
  );
}

function ProductCard({
  book,
  onOpen,
  isDark,
  featured = false,
  priority = false,
}) {
  const discount =
    getDiscount(book);

  const savings =
    getSavings(book);

  const category =
    getPrimaryCategory(book);

  const tags =
    Array.isArray(book?.tags)
      ? book.tags
      : [];

  const firstTag =
    tags[0] || null;

  const handleKeyboard = (
    event
  ) => {
    if (
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      onOpen(book);
    }
  };

  const surface =
    isDark
      ? "border-slate-800 bg-[#101924]"
      : "border-slate-200 bg-white";

  const text =
    isDark
      ? "text-white"
      : "text-slate-950";

  const muted =
    isDark
      ? "text-slate-400"
      : "text-slate-500";

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() =>
        onOpen(book)
      }
      onKeyDown={
        handleKeyboard
      }
      aria-label={`View ${
        book?.title ||
        "resource"
      }`}
      className={`
        group
        relative
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        outline-none
        transition-all
        duration-300
        hover:-translate-y-1
        focus-visible:ring-4
        focus-visible:ring-blue-500/20
        ${surface}
        ${
          isDark
            ? "hover:border-blue-800 hover:shadow-[0_20px_50px_rgba(0,0,0,.24)]"
            : "hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(15,23,42,.10)]"
        }
        ${
          featured
            ? "flex flex-col sm:min-h-[330px] sm:flex-row"
            : "flex min-h-[220px]"
        }
      `}
    >
      <div
        className={`
          relative
          shrink-0
          overflow-hidden
          border
          shadow-sm

          ${
            isDark
              ? "border-slate-700 bg-slate-900"
              : "border-slate-200 bg-slate-100"
          }

          ${
            featured
              ? "mx-auto mt-4 aspect-[3/4] w-[150px] rounded-2xl sm:m-4 sm:w-[190px] lg:w-[220px]"
              : "m-3 w-[96px] rounded-xl sm:m-4 sm:w-[125px] lg:w-[145px]"
          }
        `}
      >
        <BookCover
          book={book}
          priority={priority}
        />
      </div>

      <div
        className={`
          flex
          min-w-0
          flex-1
          flex-col
          ${
            featured
              ? "px-5 pb-6 pt-4 sm:py-6 sm:pr-7"
              : "py-4 pr-4 sm:py-5 sm:pr-5"
          }
        `}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {firstTag && (
            <span
              title={firstTag}
              className={`
                max-w-[120px]
                truncate
                rounded-full
                border
                px-2.5
                py-1
                text-[9px]
                font-black
                uppercase
                tracking-wide
                ${
                  isDark
                    ? "border-blue-900/60 bg-blue-950/30 text-blue-300"
                    : "border-blue-200 bg-blue-50 text-blue-700"
                }
              `}
            >
              {firstTag}
            </span>
          )}

          {category && (
            <span
              title={category}
              className={`
                max-w-[120px]
                truncate
                rounded-full
                border
                px-2.5
                py-1
                text-[9px]
                font-black
                uppercase
                tracking-wide
                ${
                  isDark
                    ? "border-violet-900/60 bg-violet-950/30 text-violet-300"
                    : "border-violet-200 bg-violet-50 text-violet-700"
                }
              `}
            >
              {category}
            </span>
          )}

          <span
            className={`
              flex
              items-center
              gap-1
              rounded-full
              border
              px-2.5
              py-1
              text-[9px]
              font-black
              uppercase
              tracking-wide
              ${
                isDark
                  ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-300"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }
            `}
          >
            <FileText className="h-2.5 w-2.5" />

            {formatResourceType(
              book?.resourceType
            )}
          </span>
        </div>

        {(book?.isFeatured ||
          book?.badge) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {book?.isFeatured && (
              <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-blue-500">
                <Sparkles className="h-3 w-3" />

                Featured
              </span>
            )}

            {book?.badge && (
              <span
                className={`text-[10px] font-semibold ${muted}`}
              >
                {book.badge}
              </span>
            )}
          </div>
        )}

        <h3
          className={`
            mt-3
            line-clamp-2
            font-black
            tracking-tight
            transition-colors
            group-hover:text-blue-500
            ${text}

            ${
              featured
                ? "text-xl leading-7 sm:text-2xl sm:leading-8"
                : "text-sm leading-5 sm:text-lg sm:leading-6"
            }
          `}
        >
          {book?.title ||
            "Untitled Resource"}
        </h3>

        {book?.subtitle && (
          <p
            className={`
              mt-2
              ${muted}
              ${
                featured
                  ? "line-clamp-3 text-sm leading-7"
                  : "line-clamp-2 text-[11px] leading-5 sm:text-[13px]"
              }
            `}
          >
            {book.subtitle}
          </p>
        )}

        {featured &&
          book?.shortDescription && (
            <p
              className={`mt-3 hidden line-clamp-2 text-sm leading-6 sm:block ${muted}`}
            >
              {
                book.shortDescription
              }
            </p>
          )}

        <div className="flex-1" />

        <div
          className={`
            mt-4
            border-t
            pt-3
            ${
              isDark
                ? "border-slate-800"
                : "border-slate-100"
            }
          `}
        >
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p
                className={`mb-1 text-[9px] font-black uppercase tracking-wider ${muted}`}
              >
                Current price
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`
                    font-black
                    tracking-tight
                    ${text}
                    ${
                      featured
                        ? "text-2xl sm:text-3xl"
                        : "text-lg sm:text-xl"
                    }
                  `}
                >
                  {money(
                    book?.price,
                    book?.currency
                  )}
                </span>

                {Number(
                  book?.mrp
                ) >
                  Number(
                    book?.price
                  ) && (
                  <span
                    className={`text-xs font-semibold line-through ${muted}`}
                  >
                    {money(
                      book?.mrp,
                      book?.currency
                    )}
                  </span>
                )}
              </div>

              {(savings > 0 ||
                discount > 0) && (
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  {savings > 0 && (
                    <span className="text-[10px] font-black text-emerald-500">
                      Save{" "}
                      {money(
                        savings,
                        book?.currency
                      )}
                    </span>
                  )}

                  {discount > 0 && (
                    <span
                      className={`
                        rounded-md
                        px-1.5
                        py-0.5
                        text-[9px]
                        font-black
                        ${
                          isDark
                            ? "bg-emerald-950/40 text-emerald-300"
                            : "bg-emerald-50 text-emerald-700"
                        }
                      `}
                    >
                      {discount}% OFF
                    </span>
                  )}
                </div>
              )}
            </div>

            <div
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                text-white
                transition-all
                duration-300
                group-hover:scale-105
                group-hover:bg-blue-600
                ${
                  isDark
                    ? "bg-slate-700"
                    : "bg-slate-950"
                }
              `}
            >
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  isDark,
}) {
  return (
    <div className="relative w-full sm:w-auto">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        aria-label={
          ariaLabel ||
          placeholder
        }
        className={`
          h-11
          w-full
          appearance-none
          rounded-xl
          border
          pl-4
          pr-10
          text-sm
          font-semibold
          outline-none
          transition
          sm:w-auto
          sm:min-w-[150px]

          ${
            isDark
              ? "border-slate-700 bg-slate-900 text-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-900/30"
              : "border-slate-200 bg-white text-slate-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          }
        `}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map(
          (option) => {
            const optionValue =
              option.value ??
              option;

            const optionLabel =
              option.label ??
              option;

            return (
              <option
                key={
                  optionValue
                }
                value={
                  optionValue
                }
              >
                {optionLabel}
              </option>
            );
          }
        )}
      </select>

      <ChevronDown
        className={`
          pointer-events-none
          absolute
          right-3
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          ${
            isDark
              ? "text-slate-500"
              : "text-slate-400"
          }
        `}
      />
    </div>
  );
}

function ProductSkeleton({
  isDark,
}) {
  return (
    <div
      className={`
        flex
        min-h-[220px]
        animate-pulse
        overflow-hidden
        rounded-2xl
        border
        ${
          isDark
            ? "border-slate-800 bg-[#101924]"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <div
        className={`
          m-3
          w-[96px]
          shrink-0
          rounded-xl
          sm:m-4
          sm:w-[125px]
          lg:w-[145px]
          ${
            isDark
              ? "bg-slate-800"
              : "bg-slate-100"
          }
        `}
      />

      <div className="flex flex-1 flex-col py-5 pr-5">
        <div className="flex gap-2">
          <div
            className={`h-5 w-16 rounded-full ${
              isDark
                ? "bg-slate-800"
                : "bg-slate-100"
            }`}
          />

          <div
            className={`h-5 w-20 rounded-full ${
              isDark
                ? "bg-slate-800"
                : "bg-slate-100"
            }`}
          />
        </div>

        <div
          className={`mt-5 h-5 w-full rounded ${
            isDark
              ? "bg-slate-800"
              : "bg-slate-100"
          }`}
        />

        <div
          className={`mt-2 h-5 w-4/5 rounded ${
            isDark
              ? "bg-slate-800"
              : "bg-slate-100"
          }`}
        />

        <div className="flex-1" />

        <div
          className={`mt-5 border-t pt-4 ${
            isDark
              ? "border-slate-800"
              : "border-slate-100"
          }`}
        >
          <div
            className={`h-7 w-24 rounded ${
              isDark
                ? "bg-slate-800"
                : "bg-slate-100"
            }`}
          />
        </div>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  isDark,
  center = false,
}) {
  return (
    <div
      className={`max-w-3xl ${
        center
          ? "mx-auto text-center"
          : ""
      }`}
    >
      <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-500">
        {eyebrow}
      </p>

      <h2
        className={`
          mt-3
          text-3xl
          font-black
          tracking-tight
          sm:text-4xl
          ${
            isDark
              ? "text-white"
              : "text-slate-950"
          }
        `}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`
            mt-4
            text-sm
            leading-7
            sm:text-base
            ${
              isDark
                ? "text-slate-400"
                : "text-slate-500"
            }
          `}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default function Books() {
  const navigate =
    useNavigate();

  const [
    theme,
    setTheme,
  ] = useState(
    readTheme
  );

  const [
    books,
    setBooks,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    retryCount,
    setRetryCount,
  ] = useState(0);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    category,
    setCategory,
  ] = useState("");

  const [
    resourceType,
    setResourceType,
  ] = useState("");

  const [
    sort,
    setSort,
  ] = useState("");

  const [
    openFaq,
    setOpenFaq,
  ] = useState(0);

  const isDark =
    theme === "dark";

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, []);

  useEffect(() => {
    setTheme(
      readTheme()
    );

    const handleThemeChange =
      (event) => {
        const newTheme =
          event?.detail
            ?.theme;

        if (
          newTheme ===
            "dark" ||
          newTheme ===
            "light"
        ) {
          setTheme(
            newTheme
          );
        }
      };

    const handleStorageChange =
      (event) => {
        if (
          event.key !==
          THEME_KEY
        ) {
          return;
        }

        if (
          event.newValue ===
            "dark" ||
          event.newValue ===
            "light"
        ) {
          setTheme(
            event.newValue
          );
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

  const fetchBooks =
    useCallback(
      async (signal) => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${BASE_URL}/book`,
              {
                method:
                  "GET",
                cache:
                  "no-store",
                headers: {
                  Accept:
                    "application/json",
                },
                signal,
              }
            );

          const result =
            await response
              .json()
              .catch(
                () => null
              );

          if (
            !response.ok ||
            result?.success !==
              true
          ) {
            throw new Error(
              result?.error
                ?.message ||
                result?.message ||
                "Unable to load resources."
            );
          }

          setBooks(
            Array.isArray(
              result?.data
            )
              ? result.data
              : []
          );
        } catch (err) {
          if (
            err?.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "Books fetch error:",
            err
          );

          setBooks([]);

          setError(
            err?.message ||
              "Something went wrong while loading the library."
          );
        } finally {
          if (
            !signal?.aborted
          ) {
            setLoading(
              false
            );
          }
        }
      },
      []
    );

  useEffect(() => {
    const controller =
      new AbortController();

    fetchBooks(
      controller.signal
    );

    return () =>
      controller.abort();
  }, [
    fetchBooks,
    retryCount,
  ]);

  const categories =
    useMemo(() => {
      return [
        ...new Set(
          books.flatMap(
            (book) =>
              getBookCategories(
                book
              )
          )
        ),
      ].sort((a, b) =>
        a.localeCompare(b)
      );
    }, [books]);

  const resourceTypes =
    useMemo(() => {
      return [
        ...new Set(
          books
            .map(
              (book) =>
                book?.resourceType
            )
            .filter(Boolean)
        ),
      ].sort();
    }, [books]);

  const filteredBooks =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const result =
        books.filter(
          (book) => {
            const tags =
              Array.isArray(
                book?.tags
              )
                ? book.tags.join(
                    " "
                  )
                : "";

            const categoryText =
              getBookCategories(
                book
              ).join(" ");

            const searchable =
              [
                book?.title,
                book?.slug,
                book?.subtitle,
                book?.shortDescription,
                book?.description,
                book?.resourceType,
                book?.pageKey,
                book?.badge,
                categoryText,
                tags,
              ]
                .filter(
                  Boolean
                )
                .join(" ")
                .toLowerCase();

            const matchesSearch =
              !query ||
              searchable.includes(
                query
              );

            const matchesCategory =
              !category ||
              getBookCategories(
                book
              ).includes(
                category
              );

            const matchesType =
              !resourceType ||
              book?.resourceType ===
                resourceType;

            return (
              matchesSearch &&
              matchesCategory &&
              matchesType
            );
          }
        );

      return [
        ...result,
      ].sort((a, b) => {
        if (
          sort ===
          "price-low"
        ) {
          return (
            Number(
              a?.price || 0
            ) -
            Number(
              b?.price || 0
            )
          );
        }

        if (
          sort ===
          "price-high"
        ) {
          return (
            Number(
              b?.price || 0
            ) -
            Number(
              a?.price || 0
            )
          );
        }

        if (
          sort === "title"
        ) {
          return String(
            a?.title || ""
          ).localeCompare(
            String(
              b?.title || ""
            )
          );
        }

        if (
          sort ===
          "featured"
        ) {
          return (
            Number(
              Boolean(
                b?.isFeatured
              )
            ) -
            Number(
              Boolean(
                a?.isFeatured
              )
            )
          );
        }

        return 0;
      });
    }, [
      books,
      search,
      category,
      resourceType,
      sort,
    ]);

  const featuredBook =
    useMemo(() => {
      return (
        books.find(
          (book) =>
            book?.isFeatured
        ) ||
        books[0] ||
        null
      );
    }, [books]);

  const openBook = (
    book
  ) => {
    const redirectUrl =
      book?.redirectUrl?.trim();

    if (!redirectUrl) {
      console.error(
        "Book redirect URL missing:",
        book
      );

      return;
    }

    if (
      redirectUrl.startsWith(
        "http://"
      ) ||
      redirectUrl.startsWith(
        "https://"
      )
    ) {
      window.location.href =
        redirectUrl;

      return;
    }

    navigate(
      redirectUrl.startsWith(
        "/"
      )
        ? redirectUrl
        : `/${redirectUrl}`
    );
  };

  const clearFilters =
    () => {
      setSearch("");
      setCategory("");
      setResourceType("");
      setSort("");
    };

  const scrollToLibrary =
    () => {
      document
        .getElementById(
          "library"
        )
        ?.scrollIntoView({
          behavior:
            "smooth",
        });
    };

  const selectTrack = (
    query
  ) => {
    setSearch(query);
    setCategory("");
    setResourceType("");
    setSort("");

    window.setTimeout(
      scrollToLibrary,
      50
    );
  };

  const hasFilters =
    Boolean(search) ||
    Boolean(category) ||
    Boolean(
      resourceType
    ) ||
    Boolean(sort);

  const firstCover =
    featuredBook
      ? getCoverUrl(
          featuredBook
        )
      : "";

  const structuredData =
    useMemo(() => {
      const items =
        books
          .filter(
            (book) =>
              book?.redirectUrl
          )
          .slice(0, 50)
          .map(
            (book, index) => {
              const url =
                absoluteBookUrl(
                  book.redirectUrl
                );

              const cover =
                getCoverUrl(
                  book
                );

              return {
                "@type":
                  "ListItem",
                position:
                  index + 1,
                url,
                item: {
                  "@type":
                    "CreativeWork",
                  name:
                    book?.title ||
                    "TargetTrek Resource",
                  url,
                  ...(book?.subtitle
                    ? {
                        description:
                          book.subtitle,
                      }
                    : {}),
                  ...(cover
                    ? {
                        image:
                          cover,
                      }
                    : {}),
                },
              };
            }
          );

      return {
        "@context":
          "https://schema.org",

        "@graph": [
          {
            "@type":
              "Organization",

            "@id":
              `${SITE_URL}/#organization`,

            name:
              SITE_NAME,

            url:
              SITE_URL,

            email:
              "supporttargettrek@gmail.com",
          },

          {
            "@type":
              "WebSite",

            "@id":
              `${SITE_URL}/#website`,

            name:
              SITE_NAME,

            url:
              SITE_URL,

            publisher: {
              "@id":
                `${SITE_URL}/#organization`,
            },
          },

          {
            "@type":
              "CollectionPage",

            "@id":
              `${PAGE_URL}#webpage`,

            name:
              SEO_TITLE,

            url:
              PAGE_URL,

            description:
              SEO_DESCRIPTION,

            isPartOf: {
              "@id":
                `${SITE_URL}/#website`,
            },

            publisher: {
              "@id":
                `${SITE_URL}/#organization`,
            },
          },

          {
            "@type":
              "BreadcrumbList",

            "@id":
              `${PAGE_URL}#breadcrumb`,

            itemListElement: [
              {
                "@type":
                  "ListItem",
                position: 1,
                name:
                  "TargetTrek",
                item:
                  SITE_URL,
              },
              {
                "@type":
                  "ListItem",
                position: 2,
                name:
                  "Books",
                item:
                  PAGE_URL,
              },
            ],
          },

          {
            "@type":
              "ItemList",

            "@id":
              `${PAGE_URL}#resources`,

            name:
              "TargetTrek Developer Books and Resources",

            numberOfItems:
              items.length,

            itemListElement:
              items,
          },

          {
            "@type":
              "FAQPage",

            "@id":
              `${PAGE_URL}#faq`,

            mainEntity:
              faqs.map(
                (item) => ({
                  "@type":
                    "Question",

                  name:
                    item.q,

                  acceptedAnswer:
                    {
                      "@type":
                        "Answer",

                      text:
                        item.a,
                    },
                })
              ),
          },
        ],
      };
    }, [books]);

  const pageBg =
    isDark
      ? "bg-[#080D14]"
      : "bg-[#F7F9FC]";

  const sectionBg =
    isDark
      ? "bg-[#0B111A]"
      : "bg-white";

  const softBg =
    isDark
      ? "bg-[#0C131D]"
      : "bg-slate-50";

  const cardBg =
    isDark
      ? "bg-[#101924]"
      : "bg-white";

  const primaryText =
    isDark
      ? "text-white"
      : "text-slate-950";

  const secondaryText =
    isDark
      ? "text-slate-400"
      : "text-slate-500";

  const border =
    isDark
      ? "border-slate-800"
      : "border-slate-200";

  return (
    <>
      <Helmet>
        <title>
          {SEO_TITLE}
        </title>

        <meta
          name="description"
          content={
            SEO_DESCRIPTION
          }
        />

        <meta
          name="keywords"
          content="software engineering books, system design book, HLD book, LLD Java book, GenAI ebook, Google ADK book, RAG ebook, MCP ebook, backend engineering, developer interview preparation, TargetTrek"
        />

        <meta
          name="author"
          content={
            SITE_NAME
          }
        />

        <meta
          name="application-name"
          content={
            SITE_NAME
          }
        />

        <meta
          name="robots"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />

        <meta
          name="googlebot"
          content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
        />

        <meta
          name="theme-color"
          content={
            isDark
              ? "#080D14"
              : "#ffffff"
          }
        />

        <link
          rel="canonical"
          href={PAGE_URL}
        />

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content={
            SITE_NAME
          }
        />

        <meta
          property="og:locale"
          content="en_IN"
        />

        <meta
          property="og:title"
          content={
            SEO_TITLE
          }
        />

        <meta
          property="og:description"
          content={
            SEO_DESCRIPTION
          }
        />

        <meta
          property="og:url"
          content={PAGE_URL}
        />

        {firstCover && (
          <meta
            property="og:image"
            content={
              firstCover
            }
          />
        )}

        {firstCover && (
          <meta
            property="og:image:alt"
            content={`${
              featuredBook?.title ||
              "TargetTrek developer book"
            } cover`}
          />
        )}

        <meta
          name="twitter:card"
          content={
            firstCover
              ? "summary_large_image"
              : "summary"
          }
        />

        <meta
          name="twitter:title"
          content={
            SEO_TITLE
          }
        />

        <meta
          name="twitter:description"
          content={
            SEO_DESCRIPTION
          }
        />

        {firstCover && (
          <meta
            name="twitter:image"
            content={
              firstCover
            }
          />
        )}

        <script
          type="application/ld+json"
        >
          {JSON.stringify(
            structuredData
          )}
        </script>
      </Helmet>

      <main
        className={`
          min-h-screen
          w-full
          overflow-x-hidden
          pt-16
          transition-colors
          duration-300
          ${pageBg}
          ${primaryText}
        `}
      >
        <section
          className={`
            relative
            overflow-hidden
            border-b
            ${border}
            ${sectionBg}
          `}
        >
          <div className="pointer-events-none absolute inset-0">
            <div
              className={`
                absolute
                -left-40
                -top-40
                h-[480px]
                w-[480px]
                rounded-full
                blur-[130px]
                ${
                  isDark
                    ? "bg-blue-900/15"
                    : "bg-blue-100/70"
                }
              `}
            />

            <div
              className={`
                absolute
                -right-40
                top-0
                h-[520px]
                w-[520px]
                rounded-full
                blur-[140px]
                ${
                  isDark
                    ? "bg-indigo-900/10"
                    : "bg-indigo-100/60"
                }
              `}
            />

            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  isDark
                    ? "linear-gradient(rgba(59,130,246,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.035) 1px, transparent 1px)"
                    : "linear-gradient(rgba(37,99,235,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.035) 1px, transparent 1px)",
                backgroundSize:
                  "42px 42px",
              }}
            />
          </div>

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-8 lg:py-24">
            <div>
              <div
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3.5
                  py-2
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.15em]
                  sm:text-[11px]
                  ${
                    isDark
                      ? "border-blue-900/60 bg-blue-950/30 text-blue-300"
                      : "border-blue-200 bg-blue-50 text-blue-700"
                  }
                `}
              >
                <BookOpen className="h-3.5 w-3.5" />

                TargetTrek Library
              </div>

              <h1
                className={`
                  mt-6
                  max-w-3xl
                  text-4xl
                  font-black
                  leading-[1.04]
                  tracking-[-0.04em]
                  sm:text-5xl
                  lg:text-6xl
                  ${primaryText}
                `}
              >
                Practical books for{" "}

                <span className="text-blue-500">
                  software engineers.
                </span>
              </h1>

              <p
                className={`
                  mt-6
                  max-w-2xl
                  text-base
                  leading-8
                  sm:text-lg
                  ${secondaryText}
                `}
              >
                Explore structured
                developer resources
                for System Design,
                Java LLD, GenAI,
                RAG, MCP, Google ADK,
                backend engineering
                and technical
                interviews.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={
                    scrollToLibrary
                  }
                  className="
                    inline-flex
                    min-h-[48px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-6
                    py-3
                    text-sm
                    font-black
                    text-white
                    shadow-lg
                    shadow-blue-600/20
                    transition
                    hover:-translate-y-0.5
                    hover:bg-blue-700
                    sm:w-auto
                  "
                >
                  Explore Library

                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    selectTrack(
                      "system design"
                    )
                  }
                  className={`
                    inline-flex
                    min-h-[48px]
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    border
                    px-6
                    py-3
                    text-sm
                    font-black
                    transition
                    sm:w-auto
                    ${
                      isDark
                        ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
                    }
                  `}
                >
                  System Design Books
                </button>
              </div>

              {!loading &&
                !error &&
                books.length >
                  0 && (
                  <div className="mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      [
                        books.length,
                        "Resources",
                      ],
                      [
                        categories.length,
                        "Categories",
                      ],
                      [
                        resourceTypes.length,
                        "Formats",
                      ],
                      [
                        "Live",
                        "Pricing",
                      ],
                    ].map(
                      ([
                        value,
                        label,
                      ]) => (
                        <div
                          key={
                            label
                          }
                          className={`
                            rounded-2xl
                            border
                            px-4
                            py-4
                            ${
                              isDark
                                ? "border-slate-800 bg-slate-900/70"
                                : "border-slate-200 bg-white/80"
                            }
                          `}
                        >
                          <div className="text-xl font-black text-blue-500 sm:text-2xl">
                            {value}
                          </div>

                          <div
                            className={`mt-1 text-[10px] font-bold sm:text-xs ${secondaryText}`}
                          >
                            {label}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>

            <div className="relative mx-auto w-full max-w-[470px]">
              <div
                className={`
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  p-5
                  shadow-2xl
                  sm:p-7
                  ${border}
                  ${
                    isDark
                      ? "bg-[#0C131D]"
                      : "bg-white"
                  }
                `}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500">
                      TargetTrek Learn
                    </p>

                    <h2
                      className={`mt-2 text-xl font-black sm:text-2xl ${primaryText}`}
                    >
                      One library.
                      Multiple engineering
                      paths.
                    </h2>
                  </div>

                  <div
                    className={`
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      ${
                        isDark
                          ? "bg-blue-950/40 text-blue-300"
                          : "bg-blue-50 text-blue-600"
                      }
                    `}
                  >
                    <Layers3 className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {[
                    [
                      "01",
                      "Understand",
                      "Learn fundamentals and mental models",
                    ],
                    [
                      "02",
                      "Implement",
                      "Study code, architecture and trade-offs",
                    ],
                    [
                      "03",
                      "Apply",
                      "Prepare for interviews and real engineering",
                    ],
                  ].map(
                    ([
                      number,
                      title,
                      description,
                    ]) => (
                      <div
                        key={
                          number
                        }
                        className={`
                          flex
                          items-center
                          gap-4
                          rounded-2xl
                          border
                          p-4
                          ${border}
                          ${
                            isDark
                              ? "bg-[#101924]"
                              : "bg-slate-50"
                          }
                        `}
                      >
                        <span
                          className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            font-mono
                            text-xs
                            font-black
                            ${
                              isDark
                                ? "bg-blue-950/40 text-blue-300"
                                : "bg-blue-100 text-blue-700"
                            }
                          `}
                        >
                          {number}
                        </span>

                        <div>
                          <p
                            className={`font-black ${primaryText}`}
                          >
                            {title}
                          </p>

                          <p
                            className={`mt-1 text-xs leading-5 ${secondaryText}`}
                          >
                            {
                              description
                            }
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div
                  className={`
                    mt-6
                    grid
                    grid-cols-3
                    gap-2
                    border-t
                    pt-5
                    text-center
                    text-[10px]
                    font-bold
                    ${border}
                    ${secondaryText}
                  `}
                >
                  <span>
                    Code-first
                  </span>

                  <span>
                    Interview-ready
                  </span>

                  <span>
                    Production-aware
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`border-b ${border} ${sectionBg}`}
        >
          <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
            {discoveryItems.map(
              ({
                icon: Icon,
                title,
                text,
              }) => (
                <article
                  key={
                    title
                  }
                  className={`
                    rounded-2xl
                    border
                    p-5
                    ${border}
                    ${
                      isDark
                        ? "bg-[#101924]"
                        : "bg-slate-50/70"
                    }
                  `}
                >
                  <div
                    className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      ${
                        isDark
                          ? "bg-blue-950/40 text-blue-300"
                          : "bg-blue-50 text-blue-600"
                      }
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <h2
                    className={`mt-4 text-sm font-black ${primaryText}`}
                  >
                    {title}
                  </h2>

                  <p
                    className={`mt-2 text-xs leading-6 ${secondaryText}`}
                  >
                    {text}
                  </p>
                </article>
              )
            )}
          </div>
        </section>

        <section
          className={`py-16 sm:py-20 ${pageBg}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Explore by goal"
              title="Choose what you want to learn next"
              description="Start with a specific engineering goal and jump directly into relevant resources in the library."
              isDark={
                isDark
              }
              center
            />

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {learningTracks.map(
                ({
                  icon: Icon,
                  title,
                  query,
                  text,
                }) => (
                  <button
                    key={
                      title
                    }
                    type="button"
                    onClick={() =>
                      selectTrack(
                        query
                      )
                    }
                    className={`
                      group
                      rounded-2xl
                      border
                      p-5
                      text-left
                      transition
                      hover:-translate-y-1
                      ${border}
                      ${cardBg}
                      ${
                        isDark
                          ? "hover:border-blue-800"
                          : "hover:border-blue-200 hover:shadow-lg"
                      }
                    `}
                  >
                    <div
                      className={`
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        ${
                          isDark
                            ? "bg-blue-950/40 text-blue-300"
                            : "bg-blue-50 text-blue-600"
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3
                      className={`mt-5 text-lg font-black ${primaryText}`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${secondaryText}`}
                    >
                      {text}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-blue-500">
                      View resources

                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {!loading &&
          !error &&
          featuredBook && (
            <section
              className={`border-y py-16 sm:py-20 ${border} ${sectionBg}`}
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                  <SectionHeading
                    eyebrow="Featured resource"
                    title="A strong place to start"
                    description="Explore one highlighted resource from the current TargetTrek library."
                    isDark={
                      isDark
                    }
                  />

                  <button
                    type="button"
                    onClick={
                      scrollToLibrary
                    }
                    className="inline-flex min-h-[44px] items-center gap-2 text-sm font-black text-blue-500"
                  >
                    Browse all resources

                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-8 max-w-6xl">
                  <ProductCard
                    book={
                      featuredBook
                    }
                    onOpen={
                      openBook
                    }
                    isDark={
                      isDark
                    }
                    priority
                    featured
                  />
                </div>
              </div>
            </section>
          )}

        <section
          id="library"
          className={`scroll-mt-24 border-b py-16 sm:py-20 ${border} ${softBg}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <SectionHeading
                eyebrow="Complete library"
                title="Find the right resource for your next goal"
                description="Search the complete catalog, filter by category or format, and compare current prices."
                isDark={
                  isDark
                }
              />

              {!loading &&
                !error &&
                books.length >
                  0 && (
                  <p
                    className={`text-sm font-semibold ${secondaryText}`}
                  >
                    {books.length}{" "}
                    {books.length ===
                    1
                      ? "resource"
                      : "resources"}{" "}
                    available
                  </p>
                )}
            </div>

            {!loading &&
              !error &&
              categories.length >
                0 && (
                <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCategory(
                        ""
                      )
                    }
                    className={`
                      shrink-0
                      rounded-full
                      border
                      px-4
                      py-2.5
                      text-xs
                      font-black
                      transition
                      ${
                        !category
                          ? "border-blue-600 bg-blue-600 text-white"
                          : isDark
                          ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                      }
                    `}
                  >
                    All topics
                  </button>

                  {categories.map(
                    (item) => (
                      <button
                        type="button"
                        key={
                          item
                        }
                        onClick={() =>
                          setCategory(
                            item
                          )
                        }
                        className={`
                          shrink-0
                          rounded-full
                          border
                          px-4
                          py-2.5
                          text-xs
                          font-black
                          transition
                          ${
                            category ===
                            item
                              ? "border-blue-600 bg-blue-600 text-white"
                              : isDark
                              ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
                          }
                        `}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              )}

            {!loading &&
              !error &&
              books.length >
                0 && (
                <div
                  className={`
                    mt-5
                    rounded-2xl
                    border
                    p-4
                    shadow-sm
                    ${border}
                    ${cardBg}
                  `}
                >
                  <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                    <div className="relative">
                      <Search
                        className={`
                          absolute
                          left-4
                          top-1/2
                          h-4
                          w-4
                          -translate-y-1/2
                          ${secondaryText}
                        `}
                      />

                      <input
                        type="search"
                        value={
                          search
                        }
                        onChange={(
                          event
                        ) =>
                          setSearch(
                            event
                              .target
                              .value
                          )
                        }
                        placeholder="Search books, topics, technologies..."
                        aria-label="Search TargetTrek resources"
                        className={`
                          h-11
                          w-full
                          rounded-xl
                          border
                          pl-11
                          pr-10
                          text-sm
                          outline-none
                          transition

                          ${
                            isDark
                              ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-900/30"
                              : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
                          }
                        `}
                      />

                      {search && (
                        <button
                          type="button"
                          aria-label="Clear search"
                          onClick={() =>
                            setSearch(
                              ""
                            )
                          }
                          className={`
                            absolute
                            right-2
                            top-1/2
                            flex
                            h-8
                            w-8
                            -translate-y-1/2
                            items-center
                            justify-center
                            rounded-full
                            transition
                            ${
                              isDark
                                ? "hover:bg-slate-800"
                                : "hover:bg-slate-100"
                            }
                          `}
                        >
                          <X
                            className={`h-4 w-4 ${secondaryText}`}
                          />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
                      {categories.length >
                        0 && (
                        <SelectField
                          value={
                            category
                          }
                          onChange={
                            setCategory
                          }
                          options={
                            categories
                          }
                          placeholder="All Categories"
                          ariaLabel="Filter by category"
                          isDark={
                            isDark
                          }
                        />
                      )}

                      {resourceTypes.length >
                        0 && (
                        <SelectField
                          value={
                            resourceType
                          }
                          onChange={
                            setResourceType
                          }
                          options={resourceTypes.map(
                            (
                              type
                            ) => ({
                              value:
                                type,
                              label:
                                formatResourceType(
                                  type
                                ),
                            })
                          )}
                          placeholder="All Types"
                          ariaLabel="Filter by resource type"
                          isDark={
                            isDark
                          }
                        />
                      )}

                      <SelectField
                        value={
                          sort
                        }
                        onChange={
                          setSort
                        }
                        options={[
                          {
                            value:
                              "featured",
                            label:
                              "Featured First",
                          },
                          {
                            value:
                              "price-low",
                            label:
                              "Price: Low to High",
                          },
                          {
                            value:
                              "price-high",
                            label:
                              "Price: High to Low",
                          },
                          {
                            value:
                              "title",
                            label:
                              "Title: A-Z",
                          },
                        ]}
                        placeholder="Sort By"
                        ariaLabel="Sort resources"
                        isDark={
                          isDark
                        }
                      />
                    </div>
                  </div>

                  <div
                    className={`
                      mt-4
                      flex
                      flex-wrap
                      items-center
                      justify-between
                      gap-3
                      border-t
                      pt-3
                      ${border}
                    `}
                  >
                    <div
                      className={`flex items-center gap-2 text-xs ${secondaryText}`}
                    >
                      <Filter className="h-3.5 w-3.5" />

                      <span>
                        Showing{" "}

                        <strong
                          className={
                            primaryText
                          }
                        >
                          {
                            filteredBooks.length
                          }
                        </strong>{" "}

                        of{" "}

                        <strong
                          className={
                            primaryText
                          }
                        >
                          {
                            books.length
                          }
                        </strong>{" "}

                        resources
                      </span>
                    </div>

                    {hasFilters && (
                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                        className="text-xs font-black text-blue-500 hover:text-blue-400"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </div>
              )}

            <div className="mt-8">
              {loading && (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {Array.from({
                    length: 6,
                  }).map(
                    (
                      _,
                      index
                    ) => (
                      <ProductSkeleton
                        key={
                          index
                        }
                        isDark={
                          isDark
                        }
                      />
                    )
                  )}
                </div>
              )}

              {!loading &&
                error && (
                  <div
                    role="alert"
                    className={`
                      rounded-3xl
                      border
                      px-6
                      py-16
                      text-center
                      ${border}
                      ${cardBg}
                    `}
                  >
                    <div
                      className={`
                        mx-auto
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        ${
                          isDark
                            ? "bg-red-950/30"
                            : "bg-red-50"
                        }
                      `}
                    >
                      <AlertCircle className="h-8 w-8 text-red-500" />
                    </div>

                    <h2
                      className={`mt-6 text-2xl font-black ${primaryText}`}
                    >
                      Unable to load
                      the library
                    </h2>

                    <p
                      className={`mx-auto mt-3 max-w-lg text-sm leading-6 ${secondaryText}`}
                    >
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setRetryCount(
                          (
                            count
                          ) =>
                            count +
                            1
                        )
                      }
                      className="mt-7 min-h-[44px] rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700"
                    >
                      Try Again
                    </button>
                  </div>
                )}

              {!loading &&
                !error &&
                books.length ===
                  0 && (
                  <div
                    className={`
                      rounded-3xl
                      border
                      px-6
                      py-20
                      text-center
                      ${border}
                      ${cardBg}
                    `}
                  >
                    <div
                      className={`
                        mx-auto
                        flex
                        h-20
                        w-20
                        items-center
                        justify-center
                        rounded-3xl
                        ${
                          isDark
                            ? "bg-blue-950/40"
                            : "bg-blue-50"
                        }
                      `}
                    >
                      <BookOpen className="h-9 w-9 text-blue-500" />
                    </div>

                    <h2
                      className={`mt-7 text-3xl font-black ${primaryText}`}
                    >
                      New resources
                      are coming soon
                    </h2>

                    <p
                      className={`mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base ${secondaryText}`}
                    >
                      We&apos;re
                      currently adding
                      more books and
                      digital learning
                      resources to the
                      TargetTrek
                      library.
                    </p>
                  </div>
                )}

              {!loading &&
                !error &&
                books.length >
                  0 &&
                filteredBooks.length >
                  0 && (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {filteredBooks.map(
                      (
                        book,
                        index
                      ) => (
                        <ProductCard
                          key={
                            book._id ||
                            book.pageKey ||
                            book.slug ||
                            index
                          }
                          book={
                            book
                          }
                          onOpen={
                            openBook
                          }
                          isDark={
                            isDark
                          }
                          priority={
                            index <
                            2
                          }
                        />
                      )
                    )}
                  </div>
                )}

              {!loading &&
                !error &&
                books.length >
                  0 &&
                filteredBooks.length ===
                  0 && (
                  <div
                    className={`
                      rounded-3xl
                      border
                      px-6
                      py-16
                      text-center
                      ${border}
                      ${cardBg}
                    `}
                  >
                    <div
                      className={`
                        mx-auto
                        flex
                        h-16
                        w-16
                        items-center
                        justify-center
                        rounded-2xl
                        ${
                          isDark
                            ? "bg-slate-800"
                            : "bg-slate-100"
                        }
                      `}
                    >
                      <Search
                        className={`h-7 w-7 ${secondaryText}`}
                      />
                    </div>

                    <h2
                      className={`mt-6 text-2xl font-black ${primaryText}`}
                    >
                      No resources
                      found
                    </h2>

                    <p
                      className={`mt-3 text-sm ${secondaryText}`}
                    >
                      Try another
                      search term or
                      clear the
                      selected
                      filters.
                    </p>

                    <button
                      type="button"
                      onClick={
                        clearFilters
                      }
                      className="mt-7 min-h-[44px] rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
            </div>
          </div>
        </section>

        <section
          className={`py-16 sm:py-20 ${sectionBg}`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Simple learning workflow"
              title="Turn a resource into practical progress"
              description="Use the library as a focused learning system instead of a collection of disconnected material."
              center
              isDark={
                isDark
              }
            />

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {learningSteps.map(
                (step) => (
                  <article
                    key={
                      step.number
                    }
                    className={`
                      rounded-2xl
                      border
                      p-6
                      ${border}
                      ${
                        isDark
                          ? "bg-[#101924]"
                          : "bg-slate-50"
                      }
                    `}
                  >
                    <span className="font-mono text-xs font-black tracking-[0.15em] text-blue-500">
                      STEP{" "}
                      {step.number}
                    </span>

                    <h3
                      className={`mt-4 text-xl font-black ${primaryText}`}
                    >
                      {
                        step.title
                      }
                    </h3>

                    <p
                      className={`mt-3 text-sm leading-7 ${secondaryText}`}
                    >
                      {step.text}
                    </p>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        <section
          className={`
            border-y
            py-16
            sm:py-20
            ${border}
            ${
              isDark
                ? "bg-[#0B111A]"
                : "bg-blue-50/60"
            }
          `}
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:px-8">
            <div>
              <SectionHeading
                eyebrow="Why TargetTrek"
                title="Technical learning built around real developer goals"
                description="The library connects concepts with implementation, interview preparation and production engineering context."
                isDark={
                  isDark
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                [
                  "Interview-focused",
                  "Learn to explain concepts, trade-offs and architecture decisions clearly.",
                ],
                [
                  "Implementation-aware",
                  "Understand how ideas translate into code and working systems.",
                ],
                [
                  "Structured for revision",
                  "Use focused chapters and examples to revisit important concepts quickly.",
                ],
                [
                  "Growing technical library",
                  "Explore new developer and GenAI resources as the TargetTrek catalog expands.",
                ],
              ].map(
                ([
                  title,
                  description,
                ]) => (
                  <div
                    key={
                      title
                    }
                    className={`
                      rounded-2xl
                      border
                      p-5
                      ${border}
                      ${cardBg}
                    `}
                  >
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />

                    <h3
                      className={`mt-4 font-black ${primaryText}`}
                    >
                      {title}
                    </h3>

                    <p
                      className={`mt-2 text-sm leading-6 ${secondaryText}`}
                    >
                      {
                        description
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section
          className={`py-16 sm:py-20 ${sectionBg}`}
        >
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Questions"
              title="Frequently asked questions"
              center
              isDark={
                isDark
              }
            />

            <div
              className={`
                mt-10
                divide-y
                border-y
                ${
                  isDark
                    ? "divide-slate-800 border-slate-800"
                    : "divide-slate-200 border-slate-200"
                }
              `}
            >
              {faqs.map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.q
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenFaq(
                          openFaq ===
                            index
                            ? -1
                            : index
                        )
                      }
                      aria-expanded={
                        openFaq ===
                        index
                      }
                      aria-controls={`books-faq-${index}`}
                      className={`
                        flex
                        min-h-[64px]
                        w-full
                        items-center
                        justify-between
                        gap-5
                        py-5
                        text-left
                        text-sm
                        font-black
                        sm:text-base
                        ${primaryText}
                      `}
                    >
                      <span>
                        {item.q}
                      </span>

                      <ChevronDown
                        className={`
                          h-5
                          w-5
                          shrink-0
                          transition-transform
                          ${secondaryText}
                          ${
                            openFaq ===
                            index
                              ? "rotate-180"
                              : ""
                          }
                        `}
                      />
                    </button>

                    <div
                      id={`books-faq-${index}`}
                      hidden={
                        openFaq !==
                        index
                      }
                      className={`pb-5 pr-7 text-sm leading-7 ${secondaryText}`}
                    >
                      {item.a}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        <section
          className={`
            border-t
            px-4
            py-14
            sm:px-6
            lg:px-8
            ${border}
            ${
              isDark
                ? "bg-[#080D14]"
                : "bg-[#0B111A]"
            }
          `}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-400">
                Keep learning
              </p>

              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                Build stronger
                engineering skills
                with practical,
                structured resources.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
                Explore System
                Design, Java,
                backend engineering
                and GenAI resources
                designed for
                developers.
              </p>
            </div>

            <button
              type="button"
              onClick={
                scrollToLibrary
              }
              className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700 md:w-auto"
            >
              Explore All Books

              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </>
  );
}