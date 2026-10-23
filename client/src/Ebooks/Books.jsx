// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import { Helmet } from "react-helmet";
// import { useNavigate } from "react-router-dom";

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
// const SITE_NAME = "TargetTrek";
// const PAGE_URL = `${SITE_URL}/books`;

// const THEME_KEY = "theme";
// const THEME_EVENT = "targettrek-theme-change";

// const SEO_TITLE =
//   "Software Engineering Books, System Design & GenAI Guides | TargetTrek";

// const SEO_DESCRIPTION =
//   "Explore practical software engineering ebooks and developer guides from TargetTrek. Learn System Design, Java LLD, Google ADK, RAG, MCP, GenAI, backend engineering and interview preparation.";

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

// const money = (
//   value,
//   currency = "INR"
// ) => {
//   if (
//     value === undefined ||
//     value === null ||
//     value === ""
//   ) {
//     return "";
//   }

//   const number = Number(value);

//   if (!Number.isFinite(number)) {
//     return "";
//   }

//   const localeByCurrency = {
//     INR: "en-IN",
//     USD: "en-US",
//     GBP: "en-GB",
//     EUR: "en-IE",
//     AUD: "en-AU",
//     CAD: "en-CA",
//   };

//   try {
//     return new Intl.NumberFormat(
//       localeByCurrency[currency] ||
//         "en",
//       {
//         style: "currency",
//         currency,
//         minimumFractionDigits:
//           Number.isInteger(number)
//             ? 0
//             : 2,
//         maximumFractionDigits: 2,
//       }
//     ).format(number);
//   } catch {
//     return `${currency} ${number}`;
//   }
// };

// const getDiscount = (book) => {
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

//   return Math.round(
//     ((mrp - price) / mrp) * 100
//   );
// };

// const getSavings = (book) => {
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
// };

// const formatResourceType = (
//   type
// ) => {
//   const map = {
//     pdf: "PDF",
//     ebook: "Ebook",
//     course: "Course",
//     bundle: "Bundle",
//     template: "Template",
//     notes: "Notes",
//     other: "Digital Product",
//   };

//   return (
//     map[type] ||
//     "Digital Product"
//   );
// };

// const getCoverUrl = (book) => {
//   return (
//     book?.coverPageUrl ||
//     book?.coverpageurl ||
//     book?.cover_page_url ||
//     ""
//   );
// };

// const getBookCategories = (
//   book
// ) => {
//   if (
//     Array.isArray(
//       book?.categories
//     ) &&
//     book.categories.length > 0
//   ) {
//     return book.categories.filter(
//       Boolean
//     );
//   }

//   if (book?.category) {
//     return [book.category];
//   }

//   return [];
// };

// const getPrimaryCategory = (
//   book
// ) => {
//   return (
//     getBookCategories(book)[0] ||
//     ""
//   );
// };

// const absoluteBookUrl = (
//   redirectUrl
// ) => {
//   if (!redirectUrl) {
//     return "";
//   }

//   if (
//     redirectUrl.startsWith(
//       "http://"
//     ) ||
//     redirectUrl.startsWith(
//       "https://"
//     )
//   ) {
//     return redirectUrl;
//   }

//   const path =
//     redirectUrl.startsWith("/")
//       ? redirectUrl
//       : `/${redirectUrl}`;

//   return `${SITE_URL}${path}`;
// };

// const discoveryItems = [
//   {
//     icon: Code2,
//     title:
//       "Code-first learning",
//     text:
//       "Understand concepts through practical code, implementation examples and engineering decisions.",
//   },
//   {
//     icon: Layers3,
//     title:
//       "Structured preparation",
//     text:
//       "Move from fundamentals to architecture, trade-offs, edge cases and interview-level discussions.",
//   },
//   {
//     icon: ShieldCheck,
//     title:
//       "Production-aware",
//     text:
//       "Go beyond basic demos with reliability, security, scaling, evaluation and deployment topics.",
//   },
//   {
//     icon: Zap,
//     title:
//       "Built for revision",
//     text:
//       "Use structured chapters, quick references and practical examples when interview time is limited.",
//   },
// ];

// const learningTracks = [
//   {
//     icon: Layers3,
//     title: "System Design",
//     query: "system design",
//     text:
//       "HLD, LLD, scalability, APIs, databases, caching, concurrency and design interviews.",
//   },
//   {
//     icon: Sparkles,
//     title: "GenAI Engineering",
//     query: "genai",
//     text:
//       "Google ADK, RAG, MCP, agents, retrieval pipelines and production GenAI systems.",
//   },
//   {
//     icon: Code2,
//     title: "Java & Backend",
//     query: "java",
//     text:
//       "Object-oriented design, Java implementation and practical backend engineering concepts.",
//   },
//   {
//     icon: Target,
//     title: "Interview Preparation",
//     query: "interview",
//     text:
//       "Resources designed around technical interviews, revision, architecture and engineering discussions.",
//   },
// ];

// const learningSteps = [
//   {
//     number: "01",
//     title:
//       "Choose a focused goal",
//     text:
//       "Start with the topic you need now instead of trying to learn everything at once.",
//   },
//   {
//     number: "02",
//     title:
//       "Follow structured material",
//     text:
//       "Move from fundamentals to implementation, architecture, edge cases and trade-offs.",
//   },
//   {
//     number: "03",
//     title:
//       "Apply what you learn",
//     text:
//       "Use code, design exercises, diagrams and interview questions to convert knowledge into practice.",
//   },
// ];

// const faqs = [
//   {
//     q:
//       "What books and resources are available on TargetTrek?",
//     a:
//       "The TargetTrek library contains practical digital resources for software engineering, System Design, Java LLD, GenAI, Google ADK, RAG, MCP, backend engineering and interview preparation. The exact catalog depends on currently published resources.",
//   },
//   {
//     q:
//       "Are the prices shown on this page current?",
//     a:
//       "Yes. Product information and pricing displayed in the library are loaded from the TargetTrek backend when the page loads.",
//   },
//   {
//     q:
//       "Can I search and filter the library?",
//     a:
//       "Yes. You can search by title, topic and tags, filter by category or resource type, and sort resources by price or title.",
//   },
//   {
//     q:
//       "Are TargetTrek books useful for software engineering interviews?",
//     a:
//       "Many TargetTrek resources are designed around technical interview preparation and practical engineering topics such as HLD, LLD, backend systems and GenAI.",
//   },
//   {
//     q:
//       "Are these physical books?",
//     a:
//       "Resources in the library are digital products unless the individual product page states otherwise. Check the resource format before purchasing.",
//   },
//   {
//     q:
//       "Where can I get help with a book purchase?",
//     a:
//       "For payment, download or ebook-related issues, contact supporttargettrek@gmail.com.",
//   },
// ];

// function BookCover({
//   book,
//   priority = false,
// }) {
//   const [
//     imageError,
//     setImageError,
//   ] = useState(false);

//   const coverUrl =
//     getCoverUrl(book);

//   useEffect(() => {
//     setImageError(false);
//   }, [coverUrl]);

//   return (
//     <div className="relative h-full w-full">
//       {coverUrl &&
//       !imageError ? (
//         <img
//           src={coverUrl}
//           alt={`${
//             book?.title ||
//             "TargetTrek resource"
//           } cover`}
//           loading={
//             priority
//               ? "eager"
//               : "lazy"
//           }
//           decoding="async"
//           onError={() =>
//             setImageError(true)
//           }
//           className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
//         />
//       ) : (
//         <div className="flex h-full w-full flex-col justify-between bg-gradient-to-br from-slate-950 via-blue-950 to-blue-700 p-4 text-white">
//           <div className="flex items-center justify-between">
//             <BookOpen className="h-6 w-6 text-blue-200" />

//             <span className="text-[8px] font-bold uppercase tracking-widest text-white/50">
//               TargetTrek
//             </span>
//           </div>

//           <div>
//             <div className="mb-3 h-1 w-9 rounded-full bg-blue-300" />

//             <p className="line-clamp-4 text-sm font-black leading-5 sm:text-base">
//               {book?.title ||
//                 "Digital Resource"}
//             </p>
//           </div>
//         </div>
//       )}

//       <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/10 via-transparent to-white/5" />
//     </div>
//   );
// }

// function ProductCard({
//   book,
//   onOpen,
//   isDark,
//   featured = false,
//   priority = false,
// }) {
//   const discount =
//     getDiscount(book);

//   const savings =
//     getSavings(book);

//   const category =
//     getPrimaryCategory(book);

//   const tags =
//     Array.isArray(book?.tags)
//       ? book.tags
//       : [];

//   const firstTag =
//     tags[0] || null;

//   const handleKeyboard = (
//     event
//   ) => {
//     if (
//       event.key === "Enter" ||
//       event.key === " "
//     ) {
//       event.preventDefault();
//       onOpen(book);
//     }
//   };

//   const surface =
//     isDark
//       ? "border-slate-800 bg-[#101924]"
//       : "border-slate-200 bg-white";

//   const text =
//     isDark
//       ? "text-white"
//       : "text-slate-950";

//   const muted =
//     isDark
//       ? "text-slate-400"
//       : "text-slate-500";

//   return (
//     <article
//       role="link"
//       tabIndex={0}
//       onClick={() =>
//         onOpen(book)
//       }
//       onKeyDown={
//         handleKeyboard
//       }
//       aria-label={`View ${
//         book?.title ||
//         "resource"
//       }`}
//       className={`
//         group
//         relative
//         cursor-pointer
//         overflow-hidden
//         rounded-2xl
//         border
//         outline-none
//         transition-all
//         duration-300
//         hover:-translate-y-1
//         focus-visible:ring-4
//         focus-visible:ring-blue-500/20
//         ${surface}
//         ${
//           isDark
//             ? "hover:border-blue-800 hover:shadow-[0_20px_50px_rgba(0,0,0,.24)]"
//             : "hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(15,23,42,.10)]"
//         }
//         ${
//           featured
//             ? "flex flex-col sm:min-h-[330px] sm:flex-row"
//             : "flex min-h-[220px]"
//         }
//       `}
//     >
//       <div
//         className={`
//           relative
//           shrink-0
//           overflow-hidden
//           border
//           shadow-sm

//           ${
//             isDark
//               ? "border-slate-700 bg-slate-900"
//               : "border-slate-200 bg-slate-100"
//           }

//           ${
//             featured
//               ? "mx-auto mt-4 aspect-[3/4] w-[150px] rounded-2xl sm:m-4 sm:w-[190px] lg:w-[220px]"
//               : "m-3 w-[96px] rounded-xl sm:m-4 sm:w-[125px] lg:w-[145px]"
//           }
//         `}
//       >
//         <BookCover
//           book={book}
//           priority={priority}
//         />
//       </div>

//       <div
//         className={`
//           flex
//           min-w-0
//           flex-1
//           flex-col
//           ${
//             featured
//               ? "px-5 pb-6 pt-4 sm:py-6 sm:pr-7"
//               : "py-4 pr-4 sm:py-5 sm:pr-5"
//           }
//         `}
//       >
//         <div className="flex flex-wrap items-center gap-1.5">
//           {firstTag && (
//             <span
//               title={firstTag}
//               className={`
//                 max-w-[120px]
//                 truncate
//                 rounded-full
//                 border
//                 px-2.5
//                 py-1
//                 text-[9px]
//                 font-black
//                 uppercase
//                 tracking-wide
//                 ${
//                   isDark
//                     ? "border-blue-900/60 bg-blue-950/30 text-blue-300"
//                     : "border-blue-200 bg-blue-50 text-blue-700"
//                 }
//               `}
//             >
//               {firstTag}
//             </span>
//           )}

//           {category && (
//             <span
//               title={category}
//               className={`
//                 max-w-[120px]
//                 truncate
//                 rounded-full
//                 border
//                 px-2.5
//                 py-1
//                 text-[9px]
//                 font-black
//                 uppercase
//                 tracking-wide
//                 ${
//                   isDark
//                     ? "border-violet-900/60 bg-violet-950/30 text-violet-300"
//                     : "border-violet-200 bg-violet-50 text-violet-700"
//                 }
//               `}
//             >
//               {category}
//             </span>
//           )}

//           <span
//             className={`
//               flex
//               items-center
//               gap-1
//               rounded-full
//               border
//               px-2.5
//               py-1
//               text-[9px]
//               font-black
//               uppercase
//               tracking-wide
//               ${
//                 isDark
//                   ? "border-emerald-900/60 bg-emerald-950/30 text-emerald-300"
//                   : "border-emerald-200 bg-emerald-50 text-emerald-700"
//               }
//             `}
//           >
//             <FileText className="h-2.5 w-2.5" />

//             {formatResourceType(
//               book?.resourceType
//             )}
//           </span>
//         </div>

//         {(book?.isFeatured ||
//           book?.badge) && (
//           <div className="mt-3 flex flex-wrap items-center gap-2">
//             {book?.isFeatured && (
//               <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wide text-blue-500">
//                 <Sparkles className="h-3 w-3" />

//                 Featured
//               </span>
//             )}

//             {book?.badge && (
//               <span
//                 className={`text-[10px] font-semibold ${muted}`}
//               >
//                 {book.badge}
//               </span>
//             )}
//           </div>
//         )}

//         <h3
//           className={`
//             mt-3
//             line-clamp-2
//             font-black
//             tracking-tight
//             transition-colors
//             group-hover:text-blue-500
//             ${text}

//             ${
//               featured
//                 ? "text-xl leading-7 sm:text-2xl sm:leading-8"
//                 : "text-sm leading-5 sm:text-lg sm:leading-6"
//             }
//           `}
//         >
//           {book?.title ||
//             "Untitled Resource"}
//         </h3>

//         {book?.subtitle && (
//           <p
//             className={`
//               mt-2
//               ${muted}
//               ${
//                 featured
//                   ? "line-clamp-3 text-sm leading-7"
//                   : "line-clamp-2 text-[11px] leading-5 sm:text-[13px]"
//               }
//             `}
//           >
//             {book.subtitle}
//           </p>
//         )}

//         {featured &&
//           book?.shortDescription && (
//             <p
//               className={`mt-3 hidden line-clamp-2 text-sm leading-6 sm:block ${muted}`}
//             >
//               {
//                 book.shortDescription
//               }
//             </p>
//           )}

//         <div className="flex-1" />

//         <div
//           className={`
//             mt-4
//             border-t
//             pt-3
//             ${
//               isDark
//                 ? "border-slate-800"
//                 : "border-slate-100"
//             }
//           `}
//         >
//           <div className="flex items-end justify-between gap-3">
//             <div className="min-w-0">
//               <p
//                 className={`mb-1 text-[9px] font-black uppercase tracking-wider ${muted}`}
//               >
//                 Current price
//               </p>

//               <div className="flex flex-wrap items-center gap-2">
//                 <span
//                   className={`
//                     font-black
//                     tracking-tight
//                     ${text}
//                     ${
//                       featured
//                         ? "text-2xl sm:text-3xl"
//                         : "text-lg sm:text-xl"
//                     }
//                   `}
//                 >
//                   {money(
//                     book?.price,
//                     book?.currency
//                   )}
//                 </span>

//                 {Number(
//                   book?.mrp
//                 ) >
//                   Number(
//                     book?.price
//                   ) && (
//                   <span
//                     className={`text-xs font-semibold line-through ${muted}`}
//                   >
//                     {money(
//                       book?.mrp,
//                       book?.currency
//                     )}
//                   </span>
//                 )}
//               </div>

//               {(savings > 0 ||
//                 discount > 0) && (
//                 <div className="mt-1 flex flex-wrap items-center gap-1.5">
//                   {savings > 0 && (
//                     <span className="text-[10px] font-black text-emerald-500">
//                       Save{" "}
//                       {money(
//                         savings,
//                         book?.currency
//                       )}
//                     </span>
//                   )}

//                   {discount > 0 && (
//                     <span
//                       className={`
//                         rounded-md
//                         px-1.5
//                         py-0.5
//                         text-[9px]
//                         font-black
//                         ${
//                           isDark
//                             ? "bg-emerald-950/40 text-emerald-300"
//                             : "bg-emerald-50 text-emerald-700"
//                         }
//                       `}
//                     >
//                       {discount}% OFF
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div
//               className={`
//                 flex
//                 h-10
//                 w-10
//                 shrink-0
//                 items-center
//                 justify-center
//                 rounded-full
//                 text-white
//                 transition-all
//                 duration-300
//                 group-hover:scale-105
//                 group-hover:bg-blue-600
//                 ${
//                   isDark
//                     ? "bg-slate-700"
//                     : "bg-slate-950"
//                 }
//               `}
//             >
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
//   isDark,
// }) {
//   return (
//     <div className="relative w-full sm:w-auto">
//       <select
//         value={value}
//         onChange={(event) =>
//           onChange(
//             event.target.value
//           )
//         }
//         aria-label={
//           ariaLabel ||
//           placeholder
//         }
//         className={`
//           h-11
//           w-full
//           appearance-none
//           rounded-xl
//           border
//           pl-4
//           pr-10
//           text-sm
//           font-semibold
//           outline-none
//           transition
//           sm:w-auto
//           sm:min-w-[150px]

//           ${
//             isDark
//               ? "border-slate-700 bg-slate-900 text-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-900/30"
//               : "border-slate-200 bg-white text-slate-700 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
//           }
//         `}
//       >
//         <option value="">
//           {placeholder}
//         </option>

//         {options.map(
//           (option) => {
//             const optionValue =
//               option.value ??
//               option;

//             const optionLabel =
//               option.label ??
//               option;

//             return (
//               <option
//                 key={
//                   optionValue
//                 }
//                 value={
//                   optionValue
//                 }
//               >
//                 {optionLabel}
//               </option>
//             );
//           }
//         )}
//       </select>

//       <ChevronDown
//         className={`
//           pointer-events-none
//           absolute
//           right-3
//           top-1/2
//           h-4
//           w-4
//           -translate-y-1/2
//           ${
//             isDark
//               ? "text-slate-500"
//               : "text-slate-400"
//           }
//         `}
//       />
//     </div>
//   );
// }

// function ProductSkeleton({
//   isDark,
// }) {
//   return (
//     <div
//       className={`
//         flex
//         min-h-[220px]
//         animate-pulse
//         overflow-hidden
//         rounded-2xl
//         border
//         ${
//           isDark
//             ? "border-slate-800 bg-[#101924]"
//             : "border-slate-200 bg-white"
//         }
//       `}
//     >
//       <div
//         className={`
//           m-3
//           w-[96px]
//           shrink-0
//           rounded-xl
//           sm:m-4
//           sm:w-[125px]
//           lg:w-[145px]
//           ${
//             isDark
//               ? "bg-slate-800"
//               : "bg-slate-100"
//           }
//         `}
//       />

//       <div className="flex flex-1 flex-col py-5 pr-5">
//         <div className="flex gap-2">
//           <div
//             className={`h-5 w-16 rounded-full ${
//               isDark
//                 ? "bg-slate-800"
//                 : "bg-slate-100"
//             }`}
//           />

//           <div
//             className={`h-5 w-20 rounded-full ${
//               isDark
//                 ? "bg-slate-800"
//                 : "bg-slate-100"
//             }`}
//           />
//         </div>

//         <div
//           className={`mt-5 h-5 w-full rounded ${
//             isDark
//               ? "bg-slate-800"
//               : "bg-slate-100"
//           }`}
//         />

//         <div
//           className={`mt-2 h-5 w-4/5 rounded ${
//             isDark
//               ? "bg-slate-800"
//               : "bg-slate-100"
//           }`}
//         />

//         <div className="flex-1" />

//         <div
//           className={`mt-5 border-t pt-4 ${
//             isDark
//               ? "border-slate-800"
//               : "border-slate-100"
//           }`}
//         >
//           <div
//             className={`h-7 w-24 rounded ${
//               isDark
//                 ? "bg-slate-800"
//                 : "bg-slate-100"
//             }`}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// function SectionHeading({
//   eyebrow,
//   title,
//   description,
//   isDark,
//   center = false,
// }) {
//   return (
//     <div
//       className={`max-w-3xl ${
//         center
//           ? "mx-auto text-center"
//           : ""
//       }`}
//     >
//       <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-500">
//         {eyebrow}
//       </p>

//       <h2
//         className={`
//           mt-3
//           text-3xl
//           font-black
//           tracking-tight
//           sm:text-4xl
//           ${
//             isDark
//               ? "text-white"
//               : "text-slate-950"
//           }
//         `}
//       >
//         {title}
//       </h2>

//       {description && (
//         <p
//           className={`
//             mt-4
//             text-sm
//             leading-7
//             sm:text-base
//             ${
//               isDark
//                 ? "text-slate-400"
//                 : "text-slate-500"
//             }
//           `}
//         >
//           {description}
//         </p>
//       )}
//     </div>
//   );
// }

// export default function Books() {
//   const navigate =
//     useNavigate();

//   const [
//     theme,
//     setTheme,
//   ] = useState(
//     readTheme
//   );

//   const [
//     books,
//     setBooks,
//   ] = useState([]);

//   const [
//     loading,
//     setLoading,
//   ] = useState(true);

//   const [
//     error,
//     setError,
//   ] = useState("");

//   const [
//     retryCount,
//     setRetryCount,
//   ] = useState(0);

//   const [
//     search,
//     setSearch,
//   ] = useState("");

//   const [
//     category,
//     setCategory,
//   ] = useState("");

//   const [
//     resourceType,
//     setResourceType,
//   ] = useState("");

//   const [
//     sort,
//     setSort,
//   ] = useState("");

//   const [
//     openFaq,
//     setOpenFaq,
//   ] = useState(0);

//   const isDark =
//     theme === "dark";

//   useEffect(() => {
//     window.scrollTo({
//       top: 0,
//       left: 0,
//       behavior: "auto",
//     });
//   }, []);

//   useEffect(() => {
//     setTheme(
//       readTheme()
//     );

//     const handleThemeChange =
//       (event) => {
//         const newTheme =
//           event?.detail
//             ?.theme;

//         if (
//           newTheme ===
//             "dark" ||
//           newTheme ===
//             "light"
//         ) {
//           setTheme(
//             newTheme
//           );
//         }
//       };

//     const handleStorageChange =
//       (event) => {
//         if (
//           event.key !==
//           THEME_KEY
//         ) {
//           return;
//         }

//         if (
//           event.newValue ===
//             "dark" ||
//           event.newValue ===
//             "light"
//         ) {
//           setTheme(
//             event.newValue
//           );
//         }
//       };

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

//   const fetchBooks =
//     useCallback(
//       async (signal) => {
//         try {
//           setLoading(true);
//           setError("");

//           const response =
//             await fetch(
//               `${BASE_URL}/book`,
//               {
//                 method:
//                   "GET",
//                 cache:
//                   "no-store",
//                 headers: {
//                   Accept:
//                     "application/json",
//                 },
//                 signal,
//               }
//             );

//           const result =
//             await response
//               .json()
//               .catch(
//                 () => null
//               );

//           if (
//             !response.ok ||
//             result?.success !==
//               true
//           ) {
//             throw new Error(
//               result?.error
//                 ?.message ||
//                 result?.message ||
//                 "Unable to load resources."
//             );
//           }

//           setBooks(
//             Array.isArray(
//               result?.data
//             )
//               ? result.data
//               : []
//           );
//         } catch (err) {
//           if (
//             err?.name ===
//             "AbortError"
//           ) {
//             return;
//           }

//           console.error(
//             "Books fetch error:",
//             err
//           );

//           setBooks([]);

//           setError(
//             err?.message ||
//               "Something went wrong while loading the library."
//           );
//         } finally {
//           if (
//             !signal?.aborted
//           ) {
//             setLoading(
//               false
//             );
//           }
//         }
//       },
//       []
//     );

//   useEffect(() => {
//     const controller =
//       new AbortController();

//     fetchBooks(
//       controller.signal
//     );

//     return () =>
//       controller.abort();
//   }, [
//     fetchBooks,
//     retryCount,
//   ]);

//   const categories =
//     useMemo(() => {
//       return [
//         ...new Set(
//           books.flatMap(
//             (book) =>
//               getBookCategories(
//                 book
//               )
//           )
//         ),
//       ].sort((a, b) =>
//         a.localeCompare(b)
//       );
//     }, [books]);

//   const resourceTypes =
//     useMemo(() => {
//       return [
//         ...new Set(
//           books
//             .map(
//               (book) =>
//                 book?.resourceType
//             )
//             .filter(Boolean)
//         ),
//       ].sort();
//     }, [books]);

//   const filteredBooks =
//     useMemo(() => {
//       const query =
//         search
//           .trim()
//           .toLowerCase();

//       const result =
//         books.filter(
//           (book) => {
//             const tags =
//               Array.isArray(
//                 book?.tags
//               )
//                 ? book.tags.join(
//                     " "
//                   )
//                 : "";

//             const categoryText =
//               getBookCategories(
//                 book
//               ).join(" ");

//             const searchable =
//               [
//                 book?.title,
//                 book?.slug,
//                 book?.subtitle,
//                 book?.shortDescription,
//                 book?.description,
//                 book?.resourceType,
//                 book?.pageKey,
//                 book?.badge,
//                 categoryText,
//                 tags,
//               ]
//                 .filter(
//                   Boolean
//                 )
//                 .join(" ")
//                 .toLowerCase();

//             const matchesSearch =
//               !query ||
//               searchable.includes(
//                 query
//               );

//             const matchesCategory =
//               !category ||
//               getBookCategories(
//                 book
//               ).includes(
//                 category
//               );

//             const matchesType =
//               !resourceType ||
//               book?.resourceType ===
//                 resourceType;

//             return (
//               matchesSearch &&
//               matchesCategory &&
//               matchesType
//             );
//           }
//         );

//       return [
//         ...result,
//       ].sort((a, b) => {
//         if (
//           sort ===
//           "price-low"
//         ) {
//           return (
//             Number(
//               a?.price || 0
//             ) -
//             Number(
//               b?.price || 0
//             )
//           );
//         }

//         if (
//           sort ===
//           "price-high"
//         ) {
//           return (
//             Number(
//               b?.price || 0
//             ) -
//             Number(
//               a?.price || 0
//             )
//           );
//         }

//         if (
//           sort === "title"
//         ) {
//           return String(
//             a?.title || ""
//           ).localeCompare(
//             String(
//               b?.title || ""
//             )
//           );
//         }

//         if (
//           sort ===
//           "featured"
//         ) {
//           return (
//             Number(
//               Boolean(
//                 b?.isFeatured
//               )
//             ) -
//             Number(
//               Boolean(
//                 a?.isFeatured
//               )
//             )
//           );
//         }

//         return 0;
//       });
//     }, [
//       books,
//       search,
//       category,
//       resourceType,
//       sort,
//     ]);

//   const featuredBook =
//     useMemo(() => {
//       return (
//         books.find(
//           (book) =>
//             book?.isFeatured
//         ) ||
//         books[0] ||
//         null
//       );
//     }, [books]);

//   const openBook = (
//     book
//   ) => {
//     const redirectUrl =
//       book?.redirectUrl?.trim();

//     if (!redirectUrl) {
//       console.error(
//         "Book redirect URL missing:",
//         book
//       );

//       return;
//     }

//     if (
//       redirectUrl.startsWith(
//         "http://"
//       ) ||
//       redirectUrl.startsWith(
//         "https://"
//       )
//     ) {
//       window.location.href =
//         redirectUrl;

//       return;
//     }

//     navigate(
//       redirectUrl.startsWith(
//         "/"
//       )
//         ? redirectUrl
//         : `/${redirectUrl}`
//     );
//   };

//   const clearFilters =
//     () => {
//       setSearch("");
//       setCategory("");
//       setResourceType("");
//       setSort("");
//     };

//   const scrollToLibrary =
//     () => {
//       document
//         .getElementById(
//           "library"
//         )
//         ?.scrollIntoView({
//           behavior:
//             "smooth",
//         });
//     };

//   const selectTrack = (
//     query
//   ) => {
//     setSearch(query);
//     setCategory("");
//     setResourceType("");
//     setSort("");

//     window.setTimeout(
//       scrollToLibrary,
//       50
//     );
//   };

//   const hasFilters =
//     Boolean(search) ||
//     Boolean(category) ||
//     Boolean(
//       resourceType
//     ) ||
//     Boolean(sort);

//   const firstCover =
//     featuredBook
//       ? getCoverUrl(
//           featuredBook
//         )
//       : "";

//   const structuredData =
//     useMemo(() => {
//       const items =
//         books
//           .filter(
//             (book) =>
//               book?.redirectUrl
//           )
//           .slice(0, 50)
//           .map(
//             (book, index) => {
//               const url =
//                 absoluteBookUrl(
//                   book.redirectUrl
//                 );

//               const cover =
//                 getCoverUrl(
//                   book
//                 );

//               return {
//                 "@type":
//                   "ListItem",
//                 position:
//                   index + 1,
//                 url,
//                 item: {
//                   "@type":
//                     "CreativeWork",
//                   name:
//                     book?.title ||
//                     "TargetTrek Resource",
//                   url,
//                   ...(book?.subtitle
//                     ? {
//                         description:
//                           book.subtitle,
//                       }
//                     : {}),
//                   ...(cover
//                     ? {
//                         image:
//                           cover,
//                       }
//                     : {}),
//                 },
//               };
//             }
//           );

//       return {
//         "@context":
//           "https://schema.org",

//         "@graph": [
//           {
//             "@type":
//               "Organization",

//             "@id":
//               `${SITE_URL}/#organization`,

//             name:
//               SITE_NAME,

//             url:
//               SITE_URL,

//             email:
//               "supporttargettrek@gmail.com",
//           },

//           {
//             "@type":
//               "WebSite",

//             "@id":
//               `${SITE_URL}/#website`,

//             name:
//               SITE_NAME,

//             url:
//               SITE_URL,

//             publisher: {
//               "@id":
//                 `${SITE_URL}/#organization`,
//             },
//           },

//           {
//             "@type":
//               "CollectionPage",

//             "@id":
//               `${PAGE_URL}#webpage`,

//             name:
//               SEO_TITLE,

//             url:
//               PAGE_URL,

//             description:
//               SEO_DESCRIPTION,

//             isPartOf: {
//               "@id":
//                 `${SITE_URL}/#website`,
//             },

//             publisher: {
//               "@id":
//                 `${SITE_URL}/#organization`,
//             },
//           },

//           {
//             "@type":
//               "BreadcrumbList",

//             "@id":
//               `${PAGE_URL}#breadcrumb`,

//             itemListElement: [
//               {
//                 "@type":
//                   "ListItem",
//                 position: 1,
//                 name:
//                   "TargetTrek",
//                 item:
//                   SITE_URL,
//               },
//               {
//                 "@type":
//                   "ListItem",
//                 position: 2,
//                 name:
//                   "Books",
//                 item:
//                   PAGE_URL,
//               },
//             ],
//           },

//           {
//             "@type":
//               "ItemList",

//             "@id":
//               `${PAGE_URL}#resources`,

//             name:
//               "TargetTrek Developer Books and Resources",

//             numberOfItems:
//               items.length,

//             itemListElement:
//               items,
//           },

//           {
//             "@type":
//               "FAQPage",

//             "@id":
//               `${PAGE_URL}#faq`,

//             mainEntity:
//               faqs.map(
//                 (item) => ({
//                   "@type":
//                     "Question",

//                   name:
//                     item.q,

//                   acceptedAnswer:
//                     {
//                       "@type":
//                         "Answer",

//                       text:
//                         item.a,
//                     },
//                 })
//               ),
//           },
//         ],
//       };
//     }, [books]);

//   const pageBg =
//     isDark
//       ? "bg-[#080D14]"
//       : "bg-[#F7F9FC]";

//   const sectionBg =
//     isDark
//       ? "bg-[#0B111A]"
//       : "bg-white";

//   const softBg =
//     isDark
//       ? "bg-[#0C131D]"
//       : "bg-slate-50";

//   const cardBg =
//     isDark
//       ? "bg-[#101924]"
//       : "bg-white";

//   const primaryText =
//     isDark
//       ? "text-white"
//       : "text-slate-950";

//   const secondaryText =
//     isDark
//       ? "text-slate-400"
//       : "text-slate-500";

//   const border =
//     isDark
//       ? "border-slate-800"
//       : "border-slate-200";

//   return (
//     <>
//       <Helmet>
//         <title>
//           {SEO_TITLE}
//         </title>

//         <meta
//           name="description"
//           content={
//             SEO_DESCRIPTION
//           }
//         />

//         <meta
//           name="keywords"
//           content="software engineering books, system design book, HLD book, LLD Java book, GenAI ebook, Google ADK book, RAG ebook, MCP ebook, backend engineering, developer interview preparation, TargetTrek"
//         />

//         <meta
//           name="author"
//           content={
//             SITE_NAME
//           }
//         />

//         <meta
//           name="application-name"
//           content={
//             SITE_NAME
//           }
//         />

//         <meta
//           name="robots"
//           content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
//         />

//         <meta
//           name="googlebot"
//           content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"
//         />

//         <meta
//           name="theme-color"
//           content={
//             isDark
//               ? "#080D14"
//               : "#ffffff"
//           }
//         />

//         <link
//           rel="canonical"
//           href={PAGE_URL}
//         />

//         <meta
//           property="og:type"
//           content="website"
//         />

//         <meta
//           property="og:site_name"
//           content={
//             SITE_NAME
//           }
//         />

//         <meta
//           property="og:locale"
//           content="en_IN"
//         />

//         <meta
//           property="og:title"
//           content={
//             SEO_TITLE
//           }
//         />

//         <meta
//           property="og:description"
//           content={
//             SEO_DESCRIPTION
//           }
//         />

//         <meta
//           property="og:url"
//           content={PAGE_URL}
//         />

//         {firstCover && (
//           <meta
//             property="og:image"
//             content={
//               firstCover
//             }
//           />
//         )}

//         {firstCover && (
//           <meta
//             property="og:image:alt"
//             content={`${
//               featuredBook?.title ||
//               "TargetTrek developer book"
//             } cover`}
//           />
//         )}

//         <meta
//           name="twitter:card"
//           content={
//             firstCover
//               ? "summary_large_image"
//               : "summary"
//           }
//         />

//         <meta
//           name="twitter:title"
//           content={
//             SEO_TITLE
//           }
//         />

//         <meta
//           name="twitter:description"
//           content={
//             SEO_DESCRIPTION
//           }
//         />

//         {firstCover && (
//           <meta
//             name="twitter:image"
//             content={
//               firstCover
//             }
//           />
//         )}

//         <script
//           type="application/ld+json"
//         >
//           {JSON.stringify(
//             structuredData
//           )}
//         </script>
//       </Helmet>

//       <main
//         className={`
//           min-h-screen
//           w-full
//           overflow-x-hidden
//           pt-16
//           transition-colors
//           duration-300
//           ${pageBg}
//           ${primaryText}
//         `}
//       >
//         <section
//           className={`
//             relative
//             overflow-hidden
//             border-b
//             ${border}
//             ${sectionBg}
//           `}
//         >
//           <div className="pointer-events-none absolute inset-0">
//             <div
//               className={`
//                 absolute
//                 -left-40
//                 -top-40
//                 h-[480px]
//                 w-[480px]
//                 rounded-full
//                 blur-[130px]
//                 ${
//                   isDark
//                     ? "bg-blue-900/15"
//                     : "bg-blue-100/70"
//                 }
//               `}
//             />

//             <div
//               className={`
//                 absolute
//                 -right-40
//                 top-0
//                 h-[520px]
//                 w-[520px]
//                 rounded-full
//                 blur-[140px]
//                 ${
//                   isDark
//                     ? "bg-indigo-900/10"
//                     : "bg-indigo-100/60"
//                 }
//               `}
//             />

//             <div
//               className="absolute inset-0 opacity-40"
//               style={{
//                 backgroundImage:
//                   isDark
//                     ? "linear-gradient(rgba(59,130,246,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,.035) 1px, transparent 1px)"
//                     : "linear-gradient(rgba(37,99,235,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,.035) 1px, transparent 1px)",
//                 backgroundSize:
//                   "42px 42px",
//               }}
//             />
//           </div>

//           <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:px-8 lg:py-24">
//             <div>
//               <div
//                 className={`
//                   inline-flex
//                   items-center
//                   gap-2
//                   rounded-full
//                   border
//                   px-3.5
//                   py-2
//                   text-[10px]
//                   font-black
//                   uppercase
//                   tracking-[0.15em]
//                   sm:text-[11px]
//                   ${
//                     isDark
//                       ? "border-blue-900/60 bg-blue-950/30 text-blue-300"
//                       : "border-blue-200 bg-blue-50 text-blue-700"
//                   }
//                 `}
//               >
//                 <BookOpen className="h-3.5 w-3.5" />

//                 TargetTrek Library
//               </div>

//               <h1
//                 className={`
//                   mt-6
//                   max-w-3xl
//                   text-4xl
//                   font-black
//                   leading-[1.04]
//                   tracking-[-0.04em]
//                   sm:text-5xl
//                   lg:text-6xl
//                   ${primaryText}
//                 `}
//               >
//                 Practical books for{" "}

//                 <span className="text-blue-500">
//                   software engineers.
//                 </span>
//               </h1>

//               <p
//                 className={`
//                   mt-6
//                   max-w-2xl
//                   text-base
//                   leading-8
//                   sm:text-lg
//                   ${secondaryText}
//                 `}
//               >
//                 Explore structured
//                 developer resources
//                 for System Design,
//                 Java LLD, GenAI,
//                 RAG, MCP, Google ADK,
//                 backend engineering
//                 and technical
//                 interviews.
//               </p>

//               <div className="mt-8 flex flex-col gap-3 sm:flex-row">
//                 <button
//                   type="button"
//                   onClick={
//                     scrollToLibrary
//                   }
//                   className="
//                     inline-flex
//                     min-h-[48px]
//                     w-full
//                     items-center
//                     justify-center
//                     gap-2
//                     rounded-xl
//                     bg-blue-600
//                     px-6
//                     py-3
//                     text-sm
//                     font-black
//                     text-white
//                     shadow-lg
//                     shadow-blue-600/20
//                     transition
//                     hover:-translate-y-0.5
//                     hover:bg-blue-700
//                     sm:w-auto
//                   "
//                 >
//                   Explore Library

//                   <ArrowRight className="h-4 w-4" />
//                 </button>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     selectTrack(
//                       "system design"
//                     )
//                   }
//                   className={`
//                     inline-flex
//                     min-h-[48px]
//                     w-full
//                     items-center
//                     justify-center
//                     rounded-xl
//                     border
//                     px-6
//                     py-3
//                     text-sm
//                     font-black
//                     transition
//                     sm:w-auto
//                     ${
//                       isDark
//                         ? "border-slate-700 bg-slate-900 text-slate-200 hover:border-blue-700"
//                         : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"
//                     }
//                   `}
//                 >
//                   System Design Books
//                 </button>
//               </div>

//               {!loading &&
//                 !error &&
//                 books.length >
//                   0 && (
//                   <div className="mt-9 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
//                     {[
//                       [
//                         books.length,
//                         "Resources",
//                       ],
//                       [
//                         categories.length,
//                         "Categories",
//                       ],
//                       [
//                         resourceTypes.length,
//                         "Formats",
//                       ],
//                       [
//                         "Live",
//                         "Pricing",
//                       ],
//                     ].map(
//                       ([
//                         value,
//                         label,
//                       ]) => (
//                         <div
//                           key={
//                             label
//                           }
//                           className={`
//                             rounded-2xl
//                             border
//                             px-4
//                             py-4
//                             ${
//                               isDark
//                                 ? "border-slate-800 bg-slate-900/70"
//                                 : "border-slate-200 bg-white/80"
//                             }
//                           `}
//                         >
//                           <div className="text-xl font-black text-blue-500 sm:text-2xl">
//                             {value}
//                           </div>

//                           <div
//                             className={`mt-1 text-[10px] font-bold sm:text-xs ${secondaryText}`}
//                           >
//                             {label}
//                           </div>
//                         </div>
//                       )
//                     )}
//                   </div>
//                 )}
//             </div>

//             <div className="relative mx-auto w-full max-w-[470px]">
//               <div
//                 className={`
//                   relative
//                   overflow-hidden
//                   rounded-3xl
//                   border
//                   p-5
//                   shadow-2xl
//                   sm:p-7
//                   ${border}
//                   ${
//                     isDark
//                       ? "bg-[#0C131D]"
//                       : "bg-white"
//                   }
//                 `}
//               >
//                 <div className="flex items-center justify-between gap-4">
//                   <div>
//                     <p className="text-[10px] font-black uppercase tracking-[0.16em] text-blue-500">
//                       TargetTrek Learn
//                     </p>

//                     <h2
//                       className={`mt-2 text-xl font-black sm:text-2xl ${primaryText}`}
//                     >
//                       One library.
//                       Multiple engineering
//                       paths.
//                     </h2>
//                   </div>

//                   <div
//                     className={`
//                       flex
//                       h-11
//                       w-11
//                       shrink-0
//                       items-center
//                       justify-center
//                       rounded-xl
//                       ${
//                         isDark
//                           ? "bg-blue-950/40 text-blue-300"
//                           : "bg-blue-50 text-blue-600"
//                       }
//                     `}
//                   >
//                     <Layers3 className="h-5 w-5" />
//                   </div>
//                 </div>

//                 <div className="mt-7 space-y-3">
//                   {[
//                     [
//                       "01",
//                       "Understand",
//                       "Learn fundamentals and mental models",
//                     ],
//                     [
//                       "02",
//                       "Implement",
//                       "Study code, architecture and trade-offs",
//                     ],
//                     [
//                       "03",
//                       "Apply",
//                       "Prepare for interviews and real engineering",
//                     ],
//                   ].map(
//                     ([
//                       number,
//                       title,
//                       description,
//                     ]) => (
//                       <div
//                         key={
//                           number
//                         }
//                         className={`
//                           flex
//                           items-center
//                           gap-4
//                           rounded-2xl
//                           border
//                           p-4
//                           ${border}
//                           ${
//                             isDark
//                               ? "bg-[#101924]"
//                               : "bg-slate-50"
//                           }
//                         `}
//                       >
//                         <span
//                           className={`
//                             flex
//                             h-10
//                             w-10
//                             shrink-0
//                             items-center
//                             justify-center
//                             rounded-xl
//                             font-mono
//                             text-xs
//                             font-black
//                             ${
//                               isDark
//                                 ? "bg-blue-950/40 text-blue-300"
//                                 : "bg-blue-100 text-blue-700"
//                             }
//                           `}
//                         >
//                           {number}
//                         </span>

//                         <div>
//                           <p
//                             className={`font-black ${primaryText}`}
//                           >
//                             {title}
//                           </p>

//                           <p
//                             className={`mt-1 text-xs leading-5 ${secondaryText}`}
//                           >
//                             {
//                               description
//                             }
//                           </p>
//                         </div>
//                       </div>
//                     )
//                   )}
//                 </div>

//                 <div
//                   className={`
//                     mt-6
//                     grid
//                     grid-cols-3
//                     gap-2
//                     border-t
//                     pt-5
//                     text-center
//                     text-[10px]
//                     font-bold
//                     ${border}
//                     ${secondaryText}
//                   `}
//                 >
//                   <span>
//                     Code-first
//                   </span>

//                   <span>
//                     Interview-ready
//                   </span>

//                   <span>
//                     Production-aware
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         <section
//           className={`border-b ${border} ${sectionBg}`}
//         >
//           <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
//             {discoveryItems.map(
//               ({
//                 icon: Icon,
//                 title,
//                 text,
//               }) => (
//                 <article
//                   key={
//                     title
//                   }
//                   className={`
//                     rounded-2xl
//                     border
//                     p-5
//                     ${border}
//                     ${
//                       isDark
//                         ? "bg-[#101924]"
//                         : "bg-slate-50/70"
//                     }
//                   `}
//                 >
//                   <div
//                     className={`
//                       flex
//                       h-10
//                       w-10
//                       items-center
//                       justify-center
//                       rounded-xl
//                       ${
//                         isDark
//                           ? "bg-blue-950/40 text-blue-300"
//                           : "bg-blue-50 text-blue-600"
//                       }
//                     `}
//                   >
//                     <Icon className="h-5 w-5" />
//                   </div>

//                   <h2
//                     className={`mt-4 text-sm font-black ${primaryText}`}
//                   >
//                     {title}
//                   </h2>

//                   <p
//                     className={`mt-2 text-xs leading-6 ${secondaryText}`}
//                   >
//                     {text}
//                   </p>
//                 </article>
//               )
//             )}
//           </div>
//         </section>

//         <section
//           className={`py-16 sm:py-20 ${pageBg}`}
//         >
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <SectionHeading
//               eyebrow="Explore by goal"
//               title="Choose what you want to learn next"
//               description="Start with a specific engineering goal and jump directly into relevant resources in the library."
//               isDark={
//                 isDark
//               }
//               center
//             />

//             <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//               {learningTracks.map(
//                 ({
//                   icon: Icon,
//                   title,
//                   query,
//                   text,
//                 }) => (
//                   <button
//                     key={
//                       title
//                     }
//                     type="button"
//                     onClick={() =>
//                       selectTrack(
//                         query
//                       )
//                     }
//                     className={`
//                       group
//                       rounded-2xl
//                       border
//                       p-5
//                       text-left
//                       transition
//                       hover:-translate-y-1
//                       ${border}
//                       ${cardBg}
//                       ${
//                         isDark
//                           ? "hover:border-blue-800"
//                           : "hover:border-blue-200 hover:shadow-lg"
//                       }
//                     `}
//                   >
//                     <div
//                       className={`
//                         flex
//                         h-11
//                         w-11
//                         items-center
//                         justify-center
//                         rounded-xl
//                         ${
//                           isDark
//                             ? "bg-blue-950/40 text-blue-300"
//                             : "bg-blue-50 text-blue-600"
//                         }
//                       `}
//                     >
//                       <Icon className="h-5 w-5" />
//                     </div>

//                     <h3
//                       className={`mt-5 text-lg font-black ${primaryText}`}
//                     >
//                       {title}
//                     </h3>

//                     <p
//                       className={`mt-2 text-sm leading-6 ${secondaryText}`}
//                     >
//                       {text}
//                     </p>

//                     <span className="mt-5 inline-flex items-center gap-2 text-xs font-black text-blue-500">
//                       View resources

//                       <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
//                     </span>
//                   </button>
//                 )
//               )}
//             </div>
//           </div>
//         </section>

//         {!loading &&
//           !error &&
//           featuredBook && (
//             <section
//               className={`border-y py-16 sm:py-20 ${border} ${sectionBg}`}
//             >
//               <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//                 <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
//                   <SectionHeading
//                     eyebrow="Featured resource"
//                     title="A strong place to start"
//                     description="Explore one highlighted resource from the current TargetTrek library."
//                     isDark={
//                       isDark
//                     }
//                   />

//                   <button
//                     type="button"
//                     onClick={
//                       scrollToLibrary
//                     }
//                     className="inline-flex min-h-[44px] items-center gap-2 text-sm font-black text-blue-500"
//                   >
//                     Browse all resources

//                     <ArrowRight className="h-4 w-4" />
//                   </button>
//                 </div>

//                 <div className="mt-8 max-w-6xl">
//                   <ProductCard
//                     book={
//                       featuredBook
//                     }
//                     onOpen={
//                       openBook
//                     }
//                     isDark={
//                       isDark
//                     }
//                     priority
//                     featured
//                   />
//                 </div>
//               </div>
//             </section>
//           )}

//         <section
//           id="library"
//           className={`scroll-mt-24 border-b py-16 sm:py-20 ${border} ${softBg}`}
//         >
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
//               <SectionHeading
//                 eyebrow="Complete library"
//                 title="Find the right resource for your next goal"
//                 description="Search the complete catalog, filter by category or format, and compare current prices."
//                 isDark={
//                   isDark
//                 }
//               />

//               {!loading &&
//                 !error &&
//                 books.length >
//                   0 && (
//                   <p
//                     className={`text-sm font-semibold ${secondaryText}`}
//                   >
//                     {books.length}{" "}
//                     {books.length ===
//                     1
//                       ? "resource"
//                       : "resources"}{" "}
//                     available
//                   </p>
//                 )}
//             </div>

//             {!loading &&
//               !error &&
//               categories.length >
//                 0 && (
//                 <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setCategory(
//                         ""
//                       )
//                     }
//                     className={`
//                       shrink-0
//                       rounded-full
//                       border
//                       px-4
//                       py-2.5
//                       text-xs
//                       font-black
//                       transition
//                       ${
//                         !category
//                           ? "border-blue-600 bg-blue-600 text-white"
//                           : isDark
//                           ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700"
//                           : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
//                       }
//                     `}
//                   >
//                     All topics
//                   </button>

//                   {categories.map(
//                     (item) => (
//                       <button
//                         type="button"
//                         key={
//                           item
//                         }
//                         onClick={() =>
//                           setCategory(
//                             item
//                           )
//                         }
//                         className={`
//                           shrink-0
//                           rounded-full
//                           border
//                           px-4
//                           py-2.5
//                           text-xs
//                           font-black
//                           transition
//                           ${
//                             category ===
//                             item
//                               ? "border-blue-600 bg-blue-600 text-white"
//                               : isDark
//                               ? "border-slate-700 bg-slate-900 text-slate-300 hover:border-blue-700"
//                               : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
//                           }
//                         `}
//                       >
//                         {item}
//                       </button>
//                     )
//                   )}
//                 </div>
//               )}

//             {!loading &&
//               !error &&
//               books.length >
//                 0 && (
//                 <div
//                   className={`
//                     mt-5
//                     rounded-2xl
//                     border
//                     p-4
//                     shadow-sm
//                     ${border}
//                     ${cardBg}
//                   `}
//                 >
//                   <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
//                     <div className="relative">
//                       <Search
//                         className={`
//                           absolute
//                           left-4
//                           top-1/2
//                           h-4
//                           w-4
//                           -translate-y-1/2
//                           ${secondaryText}
//                         `}
//                       />

//                       <input
//                         type="search"
//                         value={
//                           search
//                         }
//                         onChange={(
//                           event
//                         ) =>
//                           setSearch(
//                             event
//                               .target
//                               .value
//                           )
//                         }
//                         placeholder="Search books, topics, technologies..."
//                         aria-label="Search TargetTrek resources"
//                         className={`
//                           h-11
//                           w-full
//                           rounded-xl
//                           border
//                           pl-11
//                           pr-10
//                           text-sm
//                           outline-none
//                           transition

//                           ${
//                             isDark
//                               ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-blue-600 focus:ring-4 focus:ring-blue-900/30"
//                               : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                           }
//                         `}
//                       />

//                       {search && (
//                         <button
//                           type="button"
//                           aria-label="Clear search"
//                           onClick={() =>
//                             setSearch(
//                               ""
//                             )
//                           }
//                           className={`
//                             absolute
//                             right-2
//                             top-1/2
//                             flex
//                             h-8
//                             w-8
//                             -translate-y-1/2
//                             items-center
//                             justify-center
//                             rounded-full
//                             transition
//                             ${
//                               isDark
//                                 ? "hover:bg-slate-800"
//                                 : "hover:bg-slate-100"
//                             }
//                           `}
//                         >
//                           <X
//                             className={`h-4 w-4 ${secondaryText}`}
//                           />
//                         </button>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
//                       {categories.length >
//                         0 && (
//                         <SelectField
//                           value={
//                             category
//                           }
//                           onChange={
//                             setCategory
//                           }
//                           options={
//                             categories
//                           }
//                           placeholder="All Categories"
//                           ariaLabel="Filter by category"
//                           isDark={
//                             isDark
//                           }
//                         />
//                       )}

//                       {resourceTypes.length >
//                         0 && (
//                         <SelectField
//                           value={
//                             resourceType
//                           }
//                           onChange={
//                             setResourceType
//                           }
//                           options={resourceTypes.map(
//                             (
//                               type
//                             ) => ({
//                               value:
//                                 type,
//                               label:
//                                 formatResourceType(
//                                   type
//                                 ),
//                             })
//                           )}
//                           placeholder="All Types"
//                           ariaLabel="Filter by resource type"
//                           isDark={
//                             isDark
//                           }
//                         />
//                       )}

//                       <SelectField
//                         value={
//                           sort
//                         }
//                         onChange={
//                           setSort
//                         }
//                         options={[
//                           {
//                             value:
//                               "featured",
//                             label:
//                               "Featured First",
//                           },
//                           {
//                             value:
//                               "price-low",
//                             label:
//                               "Price: Low to High",
//                           },
//                           {
//                             value:
//                               "price-high",
//                             label:
//                               "Price: High to Low",
//                           },
//                           {
//                             value:
//                               "title",
//                             label:
//                               "Title: A-Z",
//                           },
//                         ]}
//                         placeholder="Sort By"
//                         ariaLabel="Sort resources"
//                         isDark={
//                           isDark
//                         }
//                       />
//                     </div>
//                   </div>

//                   <div
//                     className={`
//                       mt-4
//                       flex
//                       flex-wrap
//                       items-center
//                       justify-between
//                       gap-3
//                       border-t
//                       pt-3
//                       ${border}
//                     `}
//                   >
//                     <div
//                       className={`flex items-center gap-2 text-xs ${secondaryText}`}
//                     >
//                       <Filter className="h-3.5 w-3.5" />

//                       <span>
//                         Showing{" "}

//                         <strong
//                           className={
//                             primaryText
//                           }
//                         >
//                           {
//                             filteredBooks.length
//                           }
//                         </strong>{" "}

//                         of{" "}

//                         <strong
//                           className={
//                             primaryText
//                           }
//                         >
//                           {
//                             books.length
//                           }
//                         </strong>{" "}

//                         resources
//                       </span>
//                     </div>

//                     {hasFilters && (
//                       <button
//                         type="button"
//                         onClick={
//                           clearFilters
//                         }
//                         className="text-xs font-black text-blue-500 hover:text-blue-400"
//                       >
//                         Clear filters
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               )}

//             <div className="mt-8">
//               {loading && (
//                 <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
//                   {Array.from({
//                     length: 6,
//                   }).map(
//                     (
//                       _,
//                       index
//                     ) => (
//                       <ProductSkeleton
//                         key={
//                           index
//                         }
//                         isDark={
//                           isDark
//                         }
//                       />
//                     )
//                   )}
//                 </div>
//               )}

//               {!loading &&
//                 error && (
//                   <div
//                     role="alert"
//                     className={`
//                       rounded-3xl
//                       border
//                       px-6
//                       py-16
//                       text-center
//                       ${border}
//                       ${cardBg}
//                     `}
//                   >
//                     <div
//                       className={`
//                         mx-auto
//                         flex
//                         h-16
//                         w-16
//                         items-center
//                         justify-center
//                         rounded-2xl
//                         ${
//                           isDark
//                             ? "bg-red-950/30"
//                             : "bg-red-50"
//                         }
//                       `}
//                     >
//                       <AlertCircle className="h-8 w-8 text-red-500" />
//                     </div>

//                     <h2
//                       className={`mt-6 text-2xl font-black ${primaryText}`}
//                     >
//                       Unable to load
//                       the library
//                     </h2>

//                     <p
//                       className={`mx-auto mt-3 max-w-lg text-sm leading-6 ${secondaryText}`}
//                     >
//                       {error}
//                     </p>

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setRetryCount(
//                           (
//                             count
//                           ) =>
//                             count +
//                             1
//                         )
//                       }
//                       className="mt-7 min-h-[44px] rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700"
//                     >
//                       Try Again
//                     </button>
//                   </div>
//                 )}

//               {!loading &&
//                 !error &&
//                 books.length ===
//                   0 && (
//                   <div
//                     className={`
//                       rounded-3xl
//                       border
//                       px-6
//                       py-20
//                       text-center
//                       ${border}
//                       ${cardBg}
//                     `}
//                   >
//                     <div
//                       className={`
//                         mx-auto
//                         flex
//                         h-20
//                         w-20
//                         items-center
//                         justify-center
//                         rounded-3xl
//                         ${
//                           isDark
//                             ? "bg-blue-950/40"
//                             : "bg-blue-50"
//                         }
//                       `}
//                     >
//                       <BookOpen className="h-9 w-9 text-blue-500" />
//                     </div>

//                     <h2
//                       className={`mt-7 text-3xl font-black ${primaryText}`}
//                     >
//                       New resources
//                       are coming soon
//                     </h2>

//                     <p
//                       className={`mx-auto mt-4 max-w-xl text-sm leading-7 sm:text-base ${secondaryText}`}
//                     >
//                       We&apos;re
//                       currently adding
//                       more books and
//                       digital learning
//                       resources to the
//                       TargetTrek
//                       library.
//                     </p>
//                   </div>
//                 )}

//               {!loading &&
//                 !error &&
//                 books.length >
//                   0 &&
//                 filteredBooks.length >
//                   0 && (
//                   <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
//                     {filteredBooks.map(
//                       (
//                         book,
//                         index
//                       ) => (
//                         <ProductCard
//                           key={
//                             book._id ||
//                             book.pageKey ||
//                             book.slug ||
//                             index
//                           }
//                           book={
//                             book
//                           }
//                           onOpen={
//                             openBook
//                           }
//                           isDark={
//                             isDark
//                           }
//                           priority={
//                             index <
//                             2
//                           }
//                         />
//                       )
//                     )}
//                   </div>
//                 )}

//               {!loading &&
//                 !error &&
//                 books.length >
//                   0 &&
//                 filteredBooks.length ===
//                   0 && (
//                   <div
//                     className={`
//                       rounded-3xl
//                       border
//                       px-6
//                       py-16
//                       text-center
//                       ${border}
//                       ${cardBg}
//                     `}
//                   >
//                     <div
//                       className={`
//                         mx-auto
//                         flex
//                         h-16
//                         w-16
//                         items-center
//                         justify-center
//                         rounded-2xl
//                         ${
//                           isDark
//                             ? "bg-slate-800"
//                             : "bg-slate-100"
//                         }
//                       `}
//                     >
//                       <Search
//                         className={`h-7 w-7 ${secondaryText}`}
//                       />
//                     </div>

//                     <h2
//                       className={`mt-6 text-2xl font-black ${primaryText}`}
//                     >
//                       No resources
//                       found
//                     </h2>

//                     <p
//                       className={`mt-3 text-sm ${secondaryText}`}
//                     >
//                       Try another
//                       search term or
//                       clear the
//                       selected
//                       filters.
//                     </p>

//                     <button
//                       type="button"
//                       onClick={
//                         clearFilters
//                       }
//                       className="mt-7 min-h-[44px] rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white hover:bg-blue-700"
//                     >
//                       Clear Filters
//                     </button>
//                   </div>
//                 )}
//             </div>
//           </div>
//         </section>

//         <section
//           className={`py-16 sm:py-20 ${sectionBg}`}
//         >
//           <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//             <SectionHeading
//               eyebrow="Simple learning workflow"
//               title="Turn a resource into practical progress"
//               description="Use the library as a focused learning system instead of a collection of disconnected material."
//               center
//               isDark={
//                 isDark
//               }
//             />

//             <div className="mt-10 grid gap-4 md:grid-cols-3">
//               {learningSteps.map(
//                 (step) => (
//                   <article
//                     key={
//                       step.number
//                     }
//                     className={`
//                       rounded-2xl
//                       border
//                       p-6
//                       ${border}
//                       ${
//                         isDark
//                           ? "bg-[#101924]"
//                           : "bg-slate-50"
//                       }
//                     `}
//                   >
//                     <span className="font-mono text-xs font-black tracking-[0.15em] text-blue-500">
//                       STEP{" "}
//                       {step.number}
//                     </span>

//                     <h3
//                       className={`mt-4 text-xl font-black ${primaryText}`}
//                     >
//                       {
//                         step.title
//                       }
//                     </h3>

//                     <p
//                       className={`mt-3 text-sm leading-7 ${secondaryText}`}
//                     >
//                       {step.text}
//                     </p>
//                   </article>
//                 )
//               )}
//             </div>
//           </div>
//         </section>

//         <section
//           className={`
//             border-y
//             py-16
//             sm:py-20
//             ${border}
//             ${
//               isDark
//                 ? "bg-[#0B111A]"
//                 : "bg-blue-50/60"
//             }
//           `}
//         >
//           <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[.82fr_1.18fr] lg:px-8">
//             <div>
//               <SectionHeading
//                 eyebrow="Why TargetTrek"
//                 title="Technical learning built around real developer goals"
//                 description="The library connects concepts with implementation, interview preparation and production engineering context."
//                 isDark={
//                   isDark
//                 }
//               />
//             </div>

//             <div className="grid gap-4 sm:grid-cols-2">
//               {[
//                 [
//                   "Interview-focused",
//                   "Learn to explain concepts, trade-offs and architecture decisions clearly.",
//                 ],
//                 [
//                   "Implementation-aware",
//                   "Understand how ideas translate into code and working systems.",
//                 ],
//                 [
//                   "Structured for revision",
//                   "Use focused chapters and examples to revisit important concepts quickly.",
//                 ],
//                 [
//                   "Growing technical library",
//                   "Explore new developer and GenAI resources as the TargetTrek catalog expands.",
//                 ],
//               ].map(
//                 ([
//                   title,
//                   description,
//                 ]) => (
//                   <div
//                     key={
//                       title
//                     }
//                     className={`
//                       rounded-2xl
//                       border
//                       p-5
//                       ${border}
//                       ${cardBg}
//                     `}
//                   >
//                     <CheckCircle2 className="h-5 w-5 text-blue-500" />

//                     <h3
//                       className={`mt-4 font-black ${primaryText}`}
//                     >
//                       {title}
//                     </h3>

//                     <p
//                       className={`mt-2 text-sm leading-6 ${secondaryText}`}
//                     >
//                       {
//                         description
//                       }
//                     </p>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         </section>

//         <section
//           className={`py-16 sm:py-20 ${sectionBg}`}
//         >
//           <div className="mx-auto max-w-3xl px-4 sm:px-6">
//             <SectionHeading
//               eyebrow="Questions"
//               title="Frequently asked questions"
//               center
//               isDark={
//                 isDark
//               }
//             />

//             <div
//               className={`
//                 mt-10
//                 divide-y
//                 border-y
//                 ${
//                   isDark
//                     ? "divide-slate-800 border-slate-800"
//                     : "divide-slate-200 border-slate-200"
//                 }
//               `}
//             >
//               {faqs.map(
//                 (
//                   item,
//                   index
//                 ) => (
//                   <div
//                     key={
//                       item.q
//                     }
//                   >
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setOpenFaq(
//                           openFaq ===
//                             index
//                             ? -1
//                             : index
//                         )
//                       }
//                       aria-expanded={
//                         openFaq ===
//                         index
//                       }
//                       aria-controls={`books-faq-${index}`}
//                       className={`
//                         flex
//                         min-h-[64px]
//                         w-full
//                         items-center
//                         justify-between
//                         gap-5
//                         py-5
//                         text-left
//                         text-sm
//                         font-black
//                         sm:text-base
//                         ${primaryText}
//                       `}
//                     >
//                       <span>
//                         {item.q}
//                       </span>

//                       <ChevronDown
//                         className={`
//                           h-5
//                           w-5
//                           shrink-0
//                           transition-transform
//                           ${secondaryText}
//                           ${
//                             openFaq ===
//                             index
//                               ? "rotate-180"
//                               : ""
//                           }
//                         `}
//                       />
//                     </button>

//                     <div
//                       id={`books-faq-${index}`}
//                       hidden={
//                         openFaq !==
//                         index
//                       }
//                       className={`pb-5 pr-7 text-sm leading-7 ${secondaryText}`}
//                     >
//                       {item.a}
//                     </div>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         </section>

//         <section
//           className={`
//             border-t
//             px-4
//             py-14
//             sm:px-6
//             lg:px-8
//             ${border}
//             ${
//               isDark
//                 ? "bg-[#080D14]"
//                 : "bg-[#0B111A]"
//             }
//           `}
//         >
//           <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
//             <div>
//               <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-400">
//                 Keep learning
//               </p>

//               <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
//                 Build stronger
//                 engineering skills
//                 with practical,
//                 structured resources.
//               </h2>

//               <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
//                 Explore System
//                 Design, Java,
//                 backend engineering
//                 and GenAI resources
//                 designed for
//                 developers.
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={
//                 scrollToLibrary
//               }
//               className="inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white transition hover:bg-blue-700 md:w-auto"
//             >
//               Explore All Books

//               <ArrowRight className="h-4 w-4" />
//             </button>
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

import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  FileText,
  Filter,
  Grid2X2,
  List,
  Loader2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url";

// =======================================================
// EXISTING WEBSITE CONFIGURATION
// =======================================================

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/books`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE =
  "Software Engineering Books, System Design & GenAI Guides | Target Trek";

const SEO_DESCRIPTION =
  "Explore practical ebooks on System Design HLD, Java LLD, Google ADK, RAG, MCP, GenAI, and backend engineering from Target Trek.";

// =======================================================
// UTILITIES
// =======================================================

const readTheme = () => {
  if (typeof window === "undefined") return "light";

  try {
    return localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const money = (value, currency = "INR") => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  const number = Number(value);
  if (!Number.isFinite(number)) return "";

  const localeMap = {
    INR: "en-IN",
    USD: "en-US",
    GBP: "en-GB",
    EUR: "en-IE",
    AUD: "en-AU",
    CAD: "en-CA",
  };

  try {
    return new Intl.NumberFormat(
      localeMap[currency] || "en-IN",
      {
        style: "currency",
        currency,
        minimumFractionDigits: Number.isInteger(number)
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

  return Math.round(((mrp - price) / mrp) * 100);
};

const getCoverUrl = (book) =>
  book?.coverPageUrl ||
  book?.coverpageurl ||
  book?.cover_page_url ||
  "";

const getCategories = (book) => {
  if (Array.isArray(book?.categories)) {
    return book.categories.filter(Boolean);
  }

  if (book?.category) return [book.category];

  return [];
};

const getResourceType = (type) => {
  const types = {
    pdf: "PDF",
    ebook: "Ebook",
    course: "Course",
    bundle: "Bundle",
    template: "Template",
    notes: "Notes",
    other: "Digital Product",
  };

  return types[type] || "Ebook";
};

const getBookId = (book) =>
  String(
    book?._id ||
    book?.id ||
    book?.slug ||
    book?.redirectUrl ||
    book?.title ||
    ""
  );

const isHLDBook = (book) => {
  const value = [
    book?.title,
    book?.slug,
    book?.redirectUrl,
    book?.subtitle,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    value.includes("/system-design/hld") ||
    value.includes("system-design-hld") ||
    value.includes("high-level design") ||
    (
      value.includes("system design") &&
      /\bhld\b/.test(value)
    )
  );
};

const getBookUrl = (book) => {
  const redirectUrl = book?.redirectUrl?.trim();

  if (!redirectUrl) return "";

  return redirectUrl.startsWith("http://") ||
    redirectUrl.startsWith("https://")
    ? redirectUrl
    : `${SITE_URL}${
        redirectUrl.startsWith("/")
          ? redirectUrl
          : `/${redirectUrl}`
      }`;
};

// =======================================================
// BOOK COVER
// =======================================================

function BookCover({
  book,
  className = "",
  priority = false,
}) {
  const [imageError, setImageError] = useState(false);

  const image = getCoverUrl(book);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl
        bg-[#24211F] ${className}
      `}
    >
      {image && !imageError ? (
        <img
          src={image}
          alt={`${book?.title || "Ebook"} cover`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={() => setImageError(true)}
          className="
            h-full w-full object-cover
            transition-transform duration-500
            group-hover:scale-[1.035]
          "
        />
      ) : (
        <div
          className="
            flex h-full w-full flex-col
            justify-between bg-gradient-to-br
            from-[#1D1B19] via-[#342820]
            to-[#9A3412] p-4 text-white
          "
        >
          <div className="flex items-center justify-between">
            <BookOpen size={22} className="text-orange-300" />
            <span className="text-[9px] font-black tracking-widest text-white/60">
              TARGET TREK
            </span>
          </div>

          <div>
            <div className="mb-3 h-1 w-10 rounded-full bg-orange-400" />
            <h3
              className="
                line-clamp-5 text-sm font-extrabold
                leading-snug sm:text-base
              "
            >
              {book?.title || "Digital Ebook"}
            </h3>
          </div>
        </div>
      )}
    </div>
  );
}

// =======================================================
// PRICE
// =======================================================

function BookPrice({ book, large = false, isDark }) {
  const discount = getDiscount(book);

  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      <span
        className={`
          font-extrabold tracking-tight
          ${large ? "text-3xl" : "text-xl"}
          ${isDark ? "text-white" : "text-[#292524]"}
        `}
      >
        {money(book?.price, book?.currency)}
      </span>

      {Number(book?.mrp) > Number(book?.price) && (
        <span
          className={`
            text-sm line-through
            ${isDark ? "text-stone-500" : "text-stone-400"}
          `}
        >
          {money(book?.mrp, book?.currency)}
        </span>
      )}

      {discount > 0 && (
        <span
          className="
            rounded-md bg-orange-100 px-2 py-1
            text-[10px] font-extrabold
            text-orange-700
          "
        >
          {discount}% OFF
        </span>
      )}
    </div>
  );
}

// =======================================================
// FEATURED HLD CARD
// =======================================================

function FeaturedBook({ book, onOpen, isDark }) {
  if (!book) return null;

  const categories = getCategories(book);

  return (
    <section className="mb-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={17} className="text-orange-500" />

          <h2
            className={`
              text-base font-extrabold tracking-tight
              ${isDark ? "text-white" : "text-stone-900"}
            `}
          >
            Featured book
          </h2>
        </div>

        <span className="text-xs font-semibold text-stone-500">
          Recommended reading
        </span>
      </div>

      <article
        className={`
          group relative overflow-hidden rounded-[22px]
          border transition-all duration-300
          ${
            isDark
              ? "border-stone-700 bg-[#211D1A]"
              : "border-orange-200 bg-[#FFF6ED]"
          }
        `}
      >
        <div
          className="
            pointer-events-none absolute -right-20
            -top-28 h-72 w-72 rounded-full
            bg-orange-500/10 blur-3xl
          "
        />

        <div
          className="
            relative grid gap-5 p-4
            sm:grid-cols-[170px_1fr]
            sm:items-center sm:gap-7 sm:p-6
            lg:grid-cols-[205px_1fr]
          "
        >
          <div className="flex justify-center sm:justify-start">
            <div
              className="
                relative w-[150px] rotate-[-2deg]
                rounded-xl shadow-[12px_18px_25px_rgba(0,0,0,.17)]
                transition-transform duration-500
                group-hover:rotate-0
                sm:w-[170px] lg:w-[195px]
              "
            >
              <BookCover
                book={book}
                priority
                className="aspect-[3/4]"
              />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-md bg-orange-500 px-2.5 py-1
                  text-[10px] font-extrabold uppercase
                  tracking-wider text-white
                "
              >
                <Sparkles size={11} />
                Featured
              </span>

              {categories.slice(0, 2).map((item) => (
                <span
                  key={item}
                  className={`
                    rounded-md px-2.5 py-1
                    text-[10px] font-bold
                    ${
                      isDark
                        ? "bg-stone-700 text-stone-200"
                        : "bg-white text-stone-700"
                    }
                  `}
                >
                  {item}
                </span>
              ))}
            </div>

            <h3
              className={`
                mt-3 max-w-2xl text-2xl
                font-extrabold leading-tight
                tracking-[-0.035em]
                sm:text-3xl lg:text-[34px]
                ${
                  isDark
                    ? "text-white"
                    : "text-[#292524]"
                }
              `}
            >
              {book.title}
            </h3>

            <p
              className={`
                mt-3 max-w-2xl text-sm leading-6
                ${
                  isDark
                    ? "text-stone-400"
                    : "text-stone-600"
                }
              `}
            >
              {book.shortDescription ||
                book.subtitle ||
                book.description ||
                "Explore this practical software engineering guide."}
            </p>

            <div className="mt-5">
              <BookPrice book={book} large isDark={isDark} />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onOpen(book)}
                className="
                  inline-flex h-11 items-center
                  justify-center gap-2 rounded-xl
                  bg-orange-500 px-5 text-sm
                  font-extrabold text-white
                  transition hover:bg-orange-600
                  active:scale-[.98]
                "
              >
                Explore this book
                <ArrowUpRight size={16} />
              </button>

              <span
                className={`
                  flex items-center gap-1.5 text-xs
                  ${
                    isDark
                      ? "text-stone-400"
                      : "text-stone-500"
                  }
                `}
              >
                <Check size={14} className="text-orange-500" />
                {getResourceType(book.resourceType)}
              </span>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

// =======================================================
// REGULAR BOOK CARD
// =======================================================

function BookCard({ book, onOpen, isDark, view }) {
  const listView = view === "list";
  const categories = getCategories(book);

  return (
    <article
      className={`
        group overflow-hidden rounded-2xl border
        transition-all duration-300
        hover:-translate-y-1
        ${
          isDark
            ? "border-stone-800 bg-[#211D1A] hover:border-orange-900"
            : "border-stone-200 bg-white hover:border-orange-300 hover:shadow-[0_14px_36px_rgba(41,37,36,.08)]"
        }
        ${listView ? "flex flex-row" : "flex flex-col"}
      `}
    >
      <button
        type="button"
        onClick={() => onOpen(book)}
        className={`
          flex shrink-0 items-center justify-center
          overflow-hidden text-left
          ${
            listView
              ? "w-[115px] p-3 sm:w-[155px] sm:p-4"
              : "h-[215px] p-4 sm:h-[240px]"
          }
          ${
            isDark
              ? "bg-[#2A241F]"
              : "bg-[#FAF6F1]"
          }
        `}
        aria-label={`View ${book?.title}`}
      >
        <BookCover
          book={book}
          className={`
            aspect-[3/4] shadow-lg
            ${
              listView
                ? "w-full max-w-[120px]"
                : "h-full max-w-[175px]"
            }
          `}
        />
      </button>

      <div
        className={`
          flex min-w-0 flex-1 flex-col
          ${listView ? "p-3 sm:p-5" : "p-4"}
        `}
      >
        <div className="flex flex-wrap gap-1.5">
          {categories.slice(0, 1).map((item) => (
            <span
              key={item}
              className="
                rounded-md bg-orange-500/10
                px-2 py-1 text-[10px]
                font-bold text-orange-500
              "
            >
              {item}
            </span>
          ))}

          <span
            className={`
              rounded-md px-2 py-1
              text-[10px] font-bold
              ${
                isDark
                  ? "bg-stone-800 text-stone-400"
                  : "bg-stone-100 text-stone-600"
              }
            `}
          >
            {getResourceType(book.resourceType)}
          </span>
        </div>

        <h3
          className={`
            mt-3 line-clamp-2 text-base
            font-extrabold leading-snug
            tracking-tight
            ${
              isDark
                ? "text-white"
                : "text-stone-900"
            }
          `}
        >
          {book.title}
        </h3>

        {(book.subtitle || book.shortDescription) && (
          <p
            className={`
              mt-2 line-clamp-2 text-xs
              leading-5
              ${
                isDark
                  ? "text-stone-400"
                  : "text-stone-500"
              }
            `}
          >
            {book.subtitle || book.shortDescription}
          </p>
        )}

        <div className="flex-1" />

        <div
          className={`
            mt-5 border-t pt-4
            ${
              isDark
                ? "border-stone-800"
                : "border-stone-100"
            }
          `}
        >
          <BookPrice book={book} isDark={isDark} />

          <button
            type="button"
            onClick={() => onOpen(book)}
            className="
              mt-3 inline-flex items-center
              gap-1.5 text-xs font-extrabold
              text-orange-500 transition
              hover:gap-2.5 hover:text-orange-600
            "
          >
            View book details
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}

// =======================================================
// FILTER SELECT
// =======================================================

function FilterSelect({
  value,
  onChange,
  options,
  placeholder,
  isDark,
}) {
  return (
    <div className="relative min-w-0 flex-1">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={placeholder}
        className={`
          h-11 w-full appearance-none rounded-xl
          border px-3 pr-9 text-xs font-semibold
          outline-none transition focus:border-orange-500
          sm:text-sm
          ${
            isDark
              ? "border-stone-700 bg-[#211D1A] text-white"
              : "border-stone-200 bg-white text-stone-700"
          }
        `}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => {
          const item =
            typeof option === "string"
              ? { value: option, label: option }
              : option;

          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>

      <ChevronDown
        size={15}
        className="
          pointer-events-none absolute right-3
          top-1/2 -translate-y-1/2 text-stone-400
        "
      />
    </div>
  );
}

// =======================================================
// LOADING
// =======================================================

function BookSkeleton({ isDark }) {
  return (
    <div
      className={`
        overflow-hidden rounded-2xl border
        ${
          isDark
            ? "border-stone-800 bg-[#211D1A]"
            : "border-stone-200 bg-white"
        }
      `}
    >
      <div
        className={`
          flex h-[220px] animate-pulse
          items-center justify-center
          ${
            isDark
              ? "bg-stone-800"
              : "bg-stone-100"
          }
        `}
      >
        <div className="h-40 w-28 rounded-lg bg-stone-500/20" />
      </div>

      <div className="space-y-3 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-stone-500/20" />
        <div className="h-5 w-full animate-pulse rounded bg-stone-500/20" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-stone-500/20" />
        <div className="mt-6 h-7 w-24 animate-pulse rounded bg-stone-500/20" />
      </div>
    </div>
  );
}

// =======================================================
// MAIN COMPONENT
// =======================================================

export default function Books() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(readTheme);

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [sort, setSort] = useState("");

  const [view, setView] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);

  const isDark = theme === "dark";

  // =====================================================
  // THEME - EXISTING EVENT SUPPORT
  // =====================================================

  useEffect(() => {
    const handleThemeChange = (event) => {
      const next = event?.detail?.theme;

      if (next === "dark" || next === "light") {
        setTheme(next);
      } else {
        setTheme(readTheme());
      }
    };

    const handleStorageChange = (event) => {
      if (!event.key || event.key === THEME_KEY) {
        setTheme(readTheme());
      }
    };

    const handleFocus = () => setTheme(readTheme());

    window.addEventListener(
      THEME_EVENT,
      handleThemeChange
    );
    window.addEventListener(
      "storage",
      handleStorageChange
    );
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener(
        THEME_EVENT,
        handleThemeChange
      );
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, []);

  // =====================================================
  // EXISTING BOOKS API - UNCHANGED
  //
  // GET ${BASE_URL}/book
  // Response: { success: true, data: [...] }
  // =====================================================

  const fetchBooks = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${BASE_URL}/book`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
        signal,
      });

      const result = await response
        .json()
        .catch(() => null);

      if (
        !response.ok ||
        result?.success !== true
      ) {
        throw new Error(
          result?.error?.message ||
            result?.message ||
            "Unable to load resources."
        );
      }

      setBooks(
        Array.isArray(result?.data)
          ? result.data
          : []
      );
    } catch (err) {
      if (err?.name === "AbortError") return;

      console.error("Books fetch error:", err);

      setBooks([]);

      setError(
        err?.message ||
          "Something went wrong while loading books."
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchBooks(controller.signal);

    return () => controller.abort();
  }, [fetchBooks, retryCount]);

  // =====================================================
  // CATEGORIES & TYPES FROM BACKEND
  // =====================================================

  const categories = useMemo(() => {
    return [
      ...new Set(
        books.flatMap((book) => getCategories(book))
      ),
    ].sort((a, b) => a.localeCompare(b));
  }, [books]);

  const resourceTypes = useMemo(() => {
    return [
      ...new Set(
        books
          .map((book) => book.resourceType)
          .filter(Boolean)
      ),
    ].sort();
  }, [books]);

  // =====================================================
  // FEATURED BOOK LOGIC
  //
  // HLD PRIORITY
  // Then backend isFeatured
  // Then first API book
  // =====================================================

  const featuredBook = useMemo(() => {
    return (
      books.find(isHLDBook) ||
      books.find((book) => book.isFeatured) ||
      books[0] ||
      null
    );
  }, [books]);

  const featuredId = featuredBook
    ? getBookId(featuredBook)
    : null;

  // =====================================================
  // FILTERS & SORTING
  // =====================================================

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = books.filter((book) => {
      const tags = Array.isArray(book?.tags)
        ? book.tags.join(" ")
        : "";

      const searchable = [
        book?.title,
        book?.slug,
        book?.subtitle,
        book?.shortDescription,
        book?.description,
        book?.resourceType,
        book?.pageKey,
        book?.badge,
        getCategories(book).join(" "),
        tags,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesCategory =
        !category ||
        getCategories(book).includes(category);

      const matchesType =
        !resourceType ||
        book?.resourceType === resourceType;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") {
        return Number(a?.price ?? 0) -
          Number(b?.price ?? 0);
      }

      if (sort === "price-high") {
        return Number(b?.price ?? 0) -
          Number(a?.price ?? 0);
      }

      if (sort === "title") {
        return String(a?.title || "").localeCompare(
          String(b?.title || "")
        );
      }

      if (sort === "featured") {
        return Number(Boolean(b?.isFeatured)) -
          Number(Boolean(a?.isFeatured));
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

  const hasFilters = Boolean(
    search || category || resourceType || sort
  );

  // Show the featured book once on the default page.
  // When searching/filtering, allow it to appear in results.
  const catalogBooks = useMemo(() => {
    if (hasFilters || !featuredId) {
      return filteredBooks;
    }

    return filteredBooks.filter(
      (book) => getBookId(book) !== featuredId
    );
  }, [filteredBooks, hasFilters, featuredId]);

  const clearFilters = () => {
    setSearch("");
    setCategory("");
    setResourceType("");
    setSort("");
  };

  // =====================================================
  // EXISTING REDIRECT LOGIC
  // =====================================================

  const openBook = (book) => {
    const redirectUrl = book?.redirectUrl?.trim();

    if (!redirectUrl) {
      console.error(
        "Book redirect URL missing:",
        book
      );
      return;
    }

    if (
      redirectUrl.startsWith("http://") ||
      redirectUrl.startsWith("https://")
    ) {
      window.location.href = redirectUrl;
      return;
    }

    navigate(
      redirectUrl.startsWith("/")
        ? redirectUrl
        : `/${redirectUrl}`
    );
  };

  // =====================================================
  // SEO STRUCTURED DATA
  // =====================================================

  const structuredData = useMemo(() => {
    const items = books
      .filter((book) => book?.redirectUrl)
      .slice(0, 50)
      .map((book, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getBookUrl(book),
        item: {
          "@type": "CreativeWork",
          name: book?.title || "Target Trek Resource",
          url: getBookUrl(book),
          ...(getCoverUrl(book)
            ? { image: getCoverUrl(book) }
            : {}),
          ...(book?.subtitle
            ? { description: book.subtitle }
            : {}),
        },
      }));

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${SITE_URL}/#organization`,
          name: "Target Trek",
          url: SITE_URL,
        },
        {
          "@type": "CollectionPage",
          "@id": `${PAGE_URL}#webpage`,
          name: SEO_TITLE,
          url: PAGE_URL,
          description: SEO_DESCRIPTION,
        },
        {
          "@type": "ItemList",
          "@id": `${PAGE_URL}#resources`,
          numberOfItems: items.length,
          itemListElement: items,
        },
      ],
    };
  }, [books]);

  const cover = featuredBook
    ? getCoverUrl(featuredBook)
    : "";

  // =====================================================
  // THEME CLASSES
  // =====================================================

  const pageBg = isDark
    ? "bg-[#151311]"
    : "bg-[#FAF9F6]";

  const primaryText = isDark
    ? "text-white"
    : "text-[#292524]";

  const secondaryText = isDark
    ? "text-stone-400"
    : "text-stone-500";

  const border = isDark
    ? "border-stone-800"
    : "border-stone-200";

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <Helmet>
        <title>{SEO_TITLE}</title>

        <meta
          name="description"
          content={SEO_DESCRIPTION}
        />

        <link rel="canonical" href={PAGE_URL} />

        <meta
          property="og:title"
          content={SEO_TITLE}
        />

        <meta
          property="og:description"
          content={SEO_DESCRIPTION}
        />

        <meta property="og:url" content={PAGE_URL} />

        <meta property="og:type" content="website" />

        {cover && (
          <meta property="og:image" content={cover} />
        )}

        <meta
          name="twitter:card"
          content={cover ? "summary_large_image" : "summary"}
        />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      {/* Scoped fonts and animation */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .tt-books {
          font-family: 'DM Sans', sans-serif;
        }

        .tt-books h1,
        .tt-books h2,
        .tt-books h3,
        .tt-books button {
          font-family: 'Manrope', sans-serif;
        }

        .tt-book-fade {
          animation: ttBookFade .45s ease both;
        }

        @keyframes ttBookFade {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tt-book-fade {
            animation: none;
          }
        }
      `}</style>

      <main
        className={`
          tt-books min-h-screen w-full
          overflow-x-hidden pt-20 pb-16
          transition-colors duration-300
          ${pageBg} ${primaryText}
        `}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

          {/* ===================================== */}
          {/* COMPACT PAGE HEADING                 */}
          {/* ===================================== */}

          <div className="mb-6 sm:mb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="
                  inline-flex items-center gap-1.5
                  rounded-full bg-orange-500/10
                  px-3 py-1.5 text-[10px]
                  font-extrabold uppercase
                  tracking-widest text-orange-500
                "
              >
                <BookOpen size={13} />
                Target Trek Library
              </span>

              {!loading && !error && (
                <span
                  className={`
                    text-xs font-semibold
                    ${secondaryText}
                  `}
                >
                  {books.length} digital resources
                </span>
              )}
            </div>

            <h1
              className="
                mt-3 text-[30px] font-extrabold
                leading-tight tracking-[-0.04em]
                sm:text-[38px]
              "
            >
              Learn. Build.{" "}
              <span className="text-orange-500">
                Level up.
              </span>
            </h1>

            <p
              className={`
                mt-2 max-w-2xl text-sm leading-6
                ${secondaryText}
              `}
            >
              Practical books for System Design, Java,
              GenAI and software engineering interviews.
            </p>
          </div>

          {/* ===================================== */}
          {/* API ERROR                           */}
          {/* ===================================== */}

          {error && (
            <div
              className={`
                mb-6 flex flex-col gap-3
                rounded-xl border p-4
                sm:flex-row sm:items-center
                sm:justify-between
                ${
                  isDark
                    ? "border-red-900 bg-red-950/20"
                    : "border-red-200 bg-red-50"
                }
              `}
            >
              <div>
                <p className="font-bold text-red-500">
                  Unable to load books
                </p>
                <p className="mt-1 text-xs text-red-500">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRetryCount((n) => n + 1)}
                className="
                  inline-flex h-10 items-center
                  justify-center gap-2 rounded-lg
                  bg-red-500 px-4 text-xs
                  font-bold text-white
                "
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}

          {/* ===================================== */}
          {/* LOADING FEATURED BOOK               */}
          {/* ===================================== */}

          {loading && (
            <div className="mb-7">
              <div className="mb-4 h-5 w-36 animate-pulse rounded bg-stone-500/20" />
              <div
                className={`
                  h-[280px] animate-pulse
                  rounded-2xl border
                  ${
                    isDark
                      ? "border-stone-800 bg-stone-800/50"
                      : "border-stone-200 bg-white"
                  }
                `}
              />
            </div>
          )}

          {/* ===================================== */}
          {/* FEATURED HLD BOOK FIRST             */}
          {/* ===================================== */}

          {!loading && !error && featuredBook && (
            <FeaturedBook
              book={featuredBook}
              onOpen={openBook}
              isDark={isDark}
            />
          )}

          {/* ===================================== */}
          {/* FILTERABLE CATALOG                  */}
          {/* ===================================== */}

          {!error && (
            <section id="library" className="scroll-mt-24">

              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-orange-500" />

                    <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-orange-500">
                      Book collection
                    </span>
                  </div>

                  <h2
                    className={`
                      text-2xl font-extrabold
                      tracking-tight sm:text-[29px]
                      ${primaryText}
                    `}
                  >
                    Explore all books
                  </h2>

                  <p
                    className={`
                      mt-1 text-xs sm:text-sm
                      ${secondaryText}
                    `}
                  >
                    Search and find the right guide for your next goal.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowFilters((v) => !v)}
                    aria-expanded={showFilters}
                    className={`
                      inline-flex h-10 items-center
                      gap-2 rounded-lg border
                      px-3 text-xs font-bold
                      transition
                      ${
                        isDark
                          ? "border-stone-700 bg-stone-800"
                          : "border-stone-200 bg-white"
                      }
                    `}
                  >
                    <SlidersHorizontal size={15} />
                    Filters
                    {hasFilters && (
                      <span className="h-2 w-2 rounded-full bg-orange-500" />
                    )}
                  </button>

                  <div
                    className={`
                      flex h-10 items-center
                      rounded-lg border p-1
                      ${
                        isDark
                          ? "border-stone-700 bg-stone-800"
                          : "border-stone-200 bg-white"
                      }
                    `}
                  >
                    <button
                      type="button"
                      onClick={() => setView("grid")}
                      aria-label="Grid view"
                      aria-pressed={view === "grid"}
                      className={`
                        rounded-md p-2 transition
                        ${
                          view === "grid"
                            ? "bg-orange-500 text-white"
                            : "text-stone-500"
                        }
                      `}
                    >
                      <Grid2X2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setView("list")}
                      aria-label="List view"
                      aria-pressed={view === "list"}
                      className={`
                        rounded-md p-2 transition
                        ${
                          view === "list"
                            ? "bg-orange-500 text-white"
                            : "text-stone-500"
                        }
                      `}
                    >
                      <List size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* SEARCH */}

              <div
                className={`
                  relative mb-3 overflow-hidden
                  rounded-xl border
                  ${
                    isDark
                      ? "border-stone-700 bg-[#211D1A]"
                      : "border-stone-200 bg-white"
                  }
                `}
              >
                <Search
                  size={19}
                  className="
                    absolute left-4 top-1/2
                    -translate-y-1/2 text-stone-400
                  "
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search HLD, LLD, Java, RAG, MCP, GenAI..."
                  className="
                    h-12 w-full bg-transparent
                    pl-12 pr-12 text-sm
                    outline-none placeholder:text-stone-400
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="
                      absolute right-4 top-1/2
                      -translate-y-1/2 text-stone-400
                      hover:text-orange-500
                    "
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* TOPIC QUICK FILTERS */}

              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { label: "All books", value: "" },
                  { label: "System Design", value: "system design" },
                  { label: "Java", value: "java" },
                  { label: "GenAI", value: "genai" },
                  { label: "RAG", value: "rag" },
                  { label: "MCP", value: "mcp" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.label}
                    onClick={() => {
                      setSearch(item.value);
                      setCategory("");
                      setResourceType("");
                    }}
                    className={`
                      rounded-full border px-3 py-1.5
                      text-[11px] font-bold
                      transition-colors
                      ${
                        search.toLowerCase() === item.value
                          ? "border-orange-500 bg-orange-500 text-white"
                          : isDark
                            ? "border-stone-700 bg-[#211D1A] text-stone-300 hover:border-orange-500"
                            : "border-stone-200 bg-white text-stone-600 hover:border-orange-300"
                      }
                    `}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* ADVANCED FILTERS */}

              {showFilters && (
                <div
                  className={`
                    tt-book-fade mb-5 rounded-xl
                    border p-4
                    ${
                      isDark
                        ? "border-stone-700 bg-[#211D1A]"
                        : "border-stone-200 bg-white"
                    }
                  `}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold">
                      <Filter size={15} className="text-orange-500" />
                      Refine your results
                    </h3>

                    {hasFilters && (
                      <button
                        type="button"
                        onClick={clearFilters}
                        className="text-xs font-bold text-orange-500"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <FilterSelect
                      value={category}
                      onChange={setCategory}
                      options={categories}
                      placeholder="All categories"
                      isDark={isDark}
                    />

                    <FilterSelect
                      value={resourceType}
                      onChange={setResourceType}
                      options={resourceTypes.map((type) => ({
                        value: type,
                        label: getResourceType(type),
                      }))}
                      placeholder="All formats"
                      isDark={isDark}
                    />

                    <FilterSelect
                      value={sort}
                      onChange={setSort}
                      options={[
                        {
                          value: "featured",
                          label: "Featured first",
                        },
                        {
                          value: "price-low",
                          label: "Price: Low to high",
                        },
                        {
                          value: "price-high",
                          label: "Price: High to low",
                        },
                        {
                          value: "title",
                          label: "Title: A to Z",
                        },
                      ]}
                      placeholder="Recommended order"
                      isDark={isDark}
                    />
                  </div>
                </div>
              )}

              {/* RESULT COUNT */}

              {!loading && (
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p
                    className={`
                      text-xs font-semibold
                      ${secondaryText}
                    `}
                  >
                    Showing{" "}
                    <span className={primaryText}>
                      {catalogBooks.length}
                    </span>{" "}
                    {catalogBooks.length === 1
                      ? "resource"
                      : "resources"}
                  </p>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="
                        inline-flex items-center gap-1
                        text-xs font-bold text-orange-500
                      "
                    >
                      <X size={13} />
                      Clear all
                    </button>
                  )}
                </div>
              )}

              {/* LOADING GRID */}

              {loading && (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <BookSkeleton
                      key={index}
                      isDark={isDark}
                    />
                  ))}
                </div>
              )}

              {/* LIVE BOOK GRID */}

              {!loading && catalogBooks.length > 0 && (
                <div
                  className={`
                    grid gap-5
                    ${
                      view === "grid"
                        ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                        : "grid-cols-1 lg:grid-cols-2"
                    }
                  `}
                >
                  {catalogBooks.map((book, index) => (
                    <div
                      key={`${getBookId(book)}-${index}`}
                      className="tt-book-fade min-w-0"
                    >
                      <BookCard
                        book={book}
                        onOpen={openBook}
                        isDark={isDark}
                        view={view}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* EMPTY SEARCH */}

              {!loading &&
                catalogBooks.length === 0 &&
                hasFilters && (
                  <div
                    className={`
                      flex flex-col items-center
                      rounded-2xl border px-6
                      py-14 text-center
                      ${
                        isDark
                          ? "border-stone-800 bg-[#211D1A]"
                          : "border-stone-200 bg-white"
                      }
                    `}
                  >
                    <div
                      className="
                        flex h-14 w-14 items-center
                        justify-center rounded-2xl
                        bg-orange-500/10
                      "
                    >
                      <Search
                        size={25}
                        className="text-orange-500"
                      />
                    </div>

                    <h3 className="mt-4 text-lg font-extrabold">
                      No matching books found
                    </h3>

                    <p
                      className={`
                        mt-2 max-w-sm text-sm
                        ${secondaryText}
                      `}
                    >
                      Try another keyword or remove some
                      filters to explore more resources.
                    </p>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="
                        mt-5 rounded-lg bg-orange-500
                        px-5 py-2.5 text-xs
                        font-extrabold text-white
                        hover:bg-orange-600
                      "
                    >
                      Show all books
                    </button>
                  </div>
                )}

              {/* EMPTY CATALOG */}

              {!loading &&
                !error &&
                books.length === 0 && (
                  <div
                    className={`
                      rounded-2xl border p-10 text-center
                      ${border}
                    `}
                  >
                    <BookOpen
                      size={30}
                      className="mx-auto text-orange-500"
                    />

                    <h3 className="mt-3 font-extrabold">
                      No books available yet
                    </h3>

                    <p
                      className={`
                        mt-2 text-sm ${secondaryText}
                      `}
                    >
                      Published resources will appear here.
                    </p>
                  </div>
                )}
            </section>
          )}

          {/* ===================================== */}
          {/* COMPACT SUPPORT SECTION              */}
          {/* NOT A FOOTER                         */}
          {/* ===================================== */}

          {!loading && !error && books.length > 0 && (
            <div
              className={`
                mt-12 flex flex-col
                justify-between gap-4
                rounded-2xl border p-5
                sm:flex-row sm:items-center
                ${
                  isDark
                    ? "border-stone-800 bg-[#211D1A]"
                    : "border-stone-200 bg-white"
                }
              `}
            >
              <div>
                <h3 className="text-sm font-extrabold">
                  Need help choosing a book?
                </h3>

                <p
                  className={`
                    mt-1 text-xs leading-5
                    ${secondaryText}
                  `}
                >
                  Reach out for ebook, access, or purchase support.
                </p>
              </div>

              <a
                href="mailto:supporttargettrek@gmail.com"
                className="
                  inline-flex h-10 shrink-0
                  items-center justify-center
                  gap-2 rounded-lg
                  bg-orange-500 px-4
                  text-xs font-extrabold text-white
                  transition hover:bg-orange-600
                "
              >
                Contact support
                <ArrowUpRight size={15} />
              </a>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
