// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import { Helmet } from "react-helmet";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-hot-toast";

// import {
//   ArrowRight,
//   BadgeCheck,
//   BriefcaseBusiness,
//   Building2,
//   CheckCircle2,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Clock3,
//   Filter,
//   Flame,
//   IndianRupee,
//   MapPin,
//   Moon,
//   Plus,
//   Search,
//   ShieldCheck,
//   Sparkles,
//   Star,
//   Sun,
//   UserRound,
//   X,
// } from "lucide-react";

// import BASE_URL from "../utils/Url.js";

// const SITE_URL =
//   "https://www.targettrek.in";

// const RESULT_OPTIONS = [
//   {
//     value: "",
//     label: "All Results",
//   },
//   {
//     value: "SELECTED",
//     label: "Selected",
//   },
//   {
//     value: "REJECTED",
//     label: "Rejected",
//   },
//   {
//     value: "WAITING",
//     label: "Waiting",
//   },
//   {
//     value: "OFFER_DECLINED",
//     label: "Offer Declined",
//   },
//   {
//     value: "NOT_DISCLOSED",
//     label: "Not Disclosed",
//   },
// ];

// const DIFFICULTY_OPTIONS = [
//   {
//     value: "",
//     label: "All Difficulties",
//   },
//   {
//     value: "EASY",
//     label: "Easy",
//   },
//   {
//     value: "MEDIUM",
//     label: "Medium",
//   },
//   {
//     value: "MEDIUM_HARD",
//     label: "Medium-Hard",
//   },
//   {
//     value: "HARD",
//     label: "Hard",
//   },
//   {
//     value: "NOT_SPECIFIED",
//     label: "Not Specified",
//   },
// ];

// const FEED_SECTIONS = [
//   {
//     value: "for-you",
//     label: "For You",
//     icon: Sparkles,
//   },
//   {
//     value: "latest",
//     label: "Newest",
//     icon: Clock3,
//   },
//   {
//     value: "trending",
//     label: "Trending",
//     icon: Flame,
//   },
//   {
//     value: "editor-picks",
//     label: "Editor's Picks",
//     icon: BadgeCheck,
//   },
//   {
//     value: "featured",
//     label: "Featured",
//     icon: Star,
//   },
//   {
//     value: "compensation",
//     label: "Compensation",
//     icon: IndianRupee,
//   },
// ];

// const initialFilters = {
//   company: "",
//   role: "",
//   location: "",
//   topic: "",
//   technology: "",
//   result: "",
//   difficulty: "",
// };

// const formatLabel = (value = "") => {
//   if (!value) {
//     return "";
//   }

//   return String(value)
//     .replaceAll("_", " ")
//     .toLowerCase()
//     .replace(/\b\w/g, (char) =>
//       char.toUpperCase()
//     );
// };

// const stripMarkdown = (
//   value = ""
// ) => {
//   return String(value)
//     .replace(
//       /```[\s\S]*?```/g,
//       " "
//     )
//     .replace(
//       /`([^`]+)`/g,
//       "$1"
//     )
//     .replace(
//       /\[([^\]]+)\]\([^)]*\)/g,
//       "$1"
//     )
//     .replace(
//       /[#>*_~\-]/g,
//       " "
//     )
//     .replace(
//       /\s+/g,
//       " "
//     )
//     .trim();
// };

// const getTimeAgo = (
//   value
// ) => {
//   if (!value) {
//     return "";
//   }

//   const date =
//     new Date(value);

//   if (
//     Number.isNaN(
//       date.getTime()
//     )
//   ) {
//     return "";
//   }

//   const seconds =
//     Math.max(
//       0,
//       Math.floor(
//         (Date.now() -
//           date.getTime()) /
//           1000
//       )
//     );

//   if (seconds < 10) {
//     return "just now";
//   }

//   if (seconds < 60) {
//     return `${seconds}s ago`;
//   }

//   const minutes =
//     Math.floor(
//       seconds / 60
//     );

//   if (minutes < 60) {
//     return `${minutes}m ago`;
//   }

//   const hours =
//     Math.floor(
//       minutes / 60
//     );

//   if (hours < 24) {
//     return `${hours}h ago`;
//   }

//   const days =
//     Math.floor(
//       hours / 24
//     );

//   if (days < 7) {
//     return `${days}d ago`;
//   }

//   const weeks =
//     Math.floor(
//       days / 7
//     );

//   if (weeks < 5) {
//     return `${weeks}w ago`;
//   }

//   const months =
//     Math.floor(
//       days / 30
//     );

//   if (months < 12) {
//     return `${months}mo ago`;
//   }

//   const years =
//     Math.floor(
//       days / 365
//     );

//   return `${years}y ago`;
// };

// const getExperienceText = (
//   info = {}
// ) => {
//   const years =
//     Number(
//       info?.experienceYears ||
//         0
//     );

//   const months =
//     Number(
//       info?.experienceMonths ||
//         0
//     );

//   if (
//     !years &&
//     !months
//   ) {
//     return "";
//   }

//   const parts = [];

//   if (years) {
//     parts.push(
//       `${years} ${
//         years === 1
//           ? "year"
//           : "years"
//       }`
//     );
//   }

//   if (months) {
//     parts.push(
//       `${months} ${
//         months === 1
//           ? "month"
//           : "months"
//       }`
//     );
//   }

//   return parts.join(" ");
// };

// const getResultClasses = (
//   result,
//   isDark
// ) => {
//   if (result === "SELECTED") {
//     return isDark
//       ? "border-emerald-800 bg-emerald-950/50 text-emerald-300"
//       : "border-emerald-200 bg-emerald-50 text-emerald-700";
//   }

//   if (result === "REJECTED") {
//     return isDark
//       ? "border-rose-800 bg-rose-950/50 text-rose-300"
//       : "border-rose-200 bg-rose-50 text-rose-700";
//   }

//   if (result === "WAITING") {
//     return isDark
//       ? "border-amber-800 bg-amber-950/50 text-amber-300"
//       : "border-amber-200 bg-amber-50 text-amber-700";
//   }

//   if (
//     result ===
//     "OFFER_DECLINED"
//   ) {
//     return isDark
//       ? "border-violet-800 bg-violet-950/50 text-violet-300"
//       : "border-violet-200 bg-violet-50 text-violet-700";
//   }

//   return isDark
//     ? "border-slate-700 bg-slate-800 text-slate-300"
//     : "border-slate-200 bg-slate-100 text-slate-600";
// };

// const getDifficultyClasses = (
//   difficulty,
//   isDark
// ) => {
//   if (difficulty === "EASY") {
//     return isDark
//       ? "bg-emerald-950/50 text-emerald-300"
//       : "bg-emerald-50 text-emerald-700";
//   }

//   if (difficulty === "MEDIUM") {
//     return isDark
//       ? "bg-blue-950/50 text-blue-300"
//       : "bg-blue-50 text-blue-700";
//   }

//   if (
//     difficulty ===
//     "MEDIUM_HARD"
//   ) {
//     return isDark
//       ? "bg-amber-950/50 text-amber-300"
//       : "bg-amber-50 text-amber-700";
//   }

//   if (difficulty === "HARD") {
//     return isDark
//       ? "bg-rose-950/50 text-rose-300"
//       : "bg-rose-50 text-rose-700";
//   }

//   return isDark
//     ? "bg-slate-800 text-slate-300"
//     : "bg-slate-100 text-slate-600";
// };

// const FilterSelect = ({
//   label,
//   value,
//   onChange,
//   options,
//   isDark,
// }) => {
//   return (
//     <div className="space-y-1.5">
//       <label
//         className={`text-xs font-bold ${
//           isDark
//             ? "text-slate-400"
//             : "text-slate-600"
//         }`}
//       >
//         {label}
//       </label>

//       <div className="relative">
//         <select
//           value={value}
//           onChange={(event) =>
//             onChange(
//               event.target.value
//             )
//           }
//           className={`w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
//             isDark
//               ? "border-slate-700 bg-slate-900 text-slate-200"
//               : "border-slate-200 bg-white text-slate-700"
//           }`}
//         >
//           {options.map(
//             (option) => (
//               <option
//                 key={`${label}-${option.value}`}
//                 value={
//                   option.value
//                 }
//               >
//                 {
//                   option.label
//                 }
//               </option>
//             )
//           )}
//         </select>

//         <ChevronDown
//           className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
//             isDark
//               ? "text-slate-500"
//               : "text-slate-400"
//           }`}
//         />
//       </div>
//     </div>
//   );
// };

// const InterviewSkeleton = ({
//   isDark,
// }) => {
//   return (
//     <div
//       className={`animate-pulse rounded-2xl border p-5 sm:p-6 ${
//         isDark
//           ? "border-slate-800 bg-slate-900"
//           : "border-slate-200 bg-white"
//       }`}
//     >
//       <div className="flex gap-4">
//         <div
//           className={`h-12 w-12 rounded-xl ${
//             isDark
//               ? "bg-slate-800"
//               : "bg-slate-200"
//           }`}
//         />

//         <div className="flex-1">
//           <div
//             className={`h-4 w-1/3 rounded ${
//               isDark
//                 ? "bg-slate-800"
//                 : "bg-slate-200"
//             }`}
//           />

//           <div
//             className={`mt-3 h-6 w-4/5 rounded ${
//               isDark
//                 ? "bg-slate-800"
//                 : "bg-slate-200"
//             }`}
//           />

//           <div
//             className={`mt-3 h-4 w-1/2 rounded ${
//               isDark
//                 ? "bg-slate-800"
//                 : "bg-slate-100"
//             }`}
//           />
//         </div>
//       </div>

//       <div
//         className={`mt-5 h-4 w-full rounded ${
//           isDark
//             ? "bg-slate-800"
//             : "bg-slate-100"
//         }`}
//       />

//       <div
//         className={`mt-2 h-4 w-5/6 rounded ${
//           isDark
//             ? "bg-slate-800"
//             : "bg-slate-100"
//         }`}
//       />
//     </div>
//   );
// };

// const InterviewCard = ({
//   interview,
//   isDark,
//   onOpen,
// }) => {
//   const info =
//     interview?.interviewInfo ||
//     {};

//   const experience =
//     getExperienceText(info);

//   const technologies =
//     Array.isArray(
//       interview?.technologies
//     )
//       ? interview.technologies
//       : [];

//   const topics =
//     Array.isArray(
//       interview?.topics
//     )
//       ? interview.topics
//       : [];

//   const summary =
//     stripMarkdown(
//       interview?.summaryMarkdown ||
//         interview?.contentMarkdown ||
//         ""
//     );

//   return (
//     <article
//       onClick={() =>
//         onOpen(interview)
//       }
//       className={`group cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 ${
//         isDark
//           ? "border-slate-800 bg-slate-900 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20"
//           : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-lg hover:shadow-slate-200/60"
//       }`}
//     >
//       <div className="p-4 sm:p-6">
//         <div className="flex items-start gap-3 sm:gap-4">
//           <div
//             className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border sm:h-12 sm:w-12 ${
//               isDark
//                 ? "border-slate-700 bg-slate-800"
//                 : "border-slate-200 bg-slate-50"
//             }`}
//           >
//             {interview?.company
//               ?.logoUrl ? (
//               <img
//                 src={
//                   interview
//                     .company
//                     .logoUrl
//                 }
//                 alt={`${interview.company.name} logo`}
//                 loading="lazy"
//                 className="h-full w-full object-contain p-1.5"
//               />
//             ) : (
//               <Building2
//                 className={`h-5 w-5 ${
//                   isDark
//                     ? "text-slate-400"
//                     : "text-slate-500"
//                 }`}
//               />
//             )}
//           </div>

//           <div className="min-w-0 flex-1">
//             <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
//               <span
//                 className={`text-sm font-bold ${
//                   isDark
//                     ? "text-slate-200"
//                     : "text-slate-800"
//                 }`}
//               >
//                 {
//                   interview
//                     ?.company
//                     ?.name
//                 }
//               </span>

//               <span
//                 className={
//                   isDark
//                     ? "text-slate-600"
//                     : "text-slate-300"
//                 }
//               >
//                 •
//               </span>

//               <span
//                 className={`text-sm ${
//                   isDark
//                     ? "text-slate-400"
//                     : "text-slate-500"
//                 }`}
//               >
//                 {
//                   interview?.role
//                     ?.title
//                 }
//               </span>
//             </div>

//             <h2
//               className={`mt-2 text-base font-black leading-6 transition-colors sm:text-xl sm:leading-7 ${
//                 isDark
//                   ? "text-white group-hover:text-blue-400"
//                   : "text-slate-950 group-hover:text-blue-600"
//               }`}
//             >
//               {interview.title}
//             </h2>

//             <div
//               className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs ${
//                 isDark
//                   ? "text-slate-500"
//                   : "text-slate-500"
//               }`}
//             >
//               <span className="flex items-center gap-1.5">
//                 <UserRound className="h-3.5 w-3.5" />

//                 {interview
//                   ?.author?.name ||
//                   "Anonymous"}
//               </span>

//               <span className="flex items-center gap-1.5">
//                 <Clock3 className="h-3.5 w-3.5" />

//                 {getTimeAgo(
//                   interview
//                     ?.publishedAt ||
//                     interview
//                       ?.createdAt
//                 )}
//               </span>

//               {info.location && (
//                 <span className="flex items-center gap-1.5">
//                   <MapPin className="h-3.5 w-3.5" />

//                   {info.location}
//                 </span>
//               )}

//               {experience && (
//                 <span className="hidden items-center gap-1.5 sm:flex">
//                   <BriefcaseBusiness className="h-3.5 w-3.5" />

//                   {experience} exp.
//                 </span>
//               )}

//               {interview
//                 ?.readingTimeMinutes >
//                 0 && (
//                 <span>
//                   {
//                     interview
//                       .readingTimeMinutes
//                   }{" "}
//                   min read
//                 </span>
//               )}
//             </div>
//           </div>

//           {interview.editorPick && (
//             <BadgeCheck className="h-5 w-5 shrink-0 text-blue-500" />
//           )}
//         </div>

//         {summary && (
//           <p
//             className={`mt-4 line-clamp-2 text-sm leading-6 sm:line-clamp-3 ${
//               isDark
//                 ? "text-slate-400"
//                 : "text-slate-600"
//             }`}
//           >
//             {summary}
//           </p>
//         )}

//         <div className="mt-4 flex flex-wrap gap-2">
//           {info.result &&
//             info.result !==
//               "NOT_DISCLOSED" && (
//               <span
//                 className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getResultClasses(
//                   info.result,
//                   isDark
//                 )}`}
//               >
//                 {formatLabel(
//                   info.result
//                 )}
//               </span>
//             )}

//           {info.difficulty &&
//             info.difficulty !==
//               "NOT_SPECIFIED" && (
//               <span
//                 className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getDifficultyClasses(
//                   info.difficulty,
//                   isDark
//                 )}`}
//               >
//                 {formatLabel(
//                   info.difficulty
//                 )}
//               </span>
//             )}

//           {interview.totalRounds >
//             0 && (
//             <span
//               className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
//                 isDark
//                   ? "bg-slate-800 text-slate-300"
//                   : "bg-slate-100 text-slate-600"
//               }`}
//             >
//               {
//                 interview.totalRounds
//               }{" "}
//               Rounds
//             </span>
//           )}
//         </div>

//         {(technologies.length >
//           0 ||
//           topics.length > 0) && (
//           <div className="mt-4 flex flex-wrap gap-1.5">
//             {technologies
//               .slice(0, 3)
//               .map(
//                 (
//                   technology
//                 ) => (
//                   <span
//                     key={
//                       technology
//                     }
//                     className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
//                       isDark
//                         ? "bg-blue-950/50 text-blue-300"
//                         : "bg-blue-50 text-blue-700"
//                     }`}
//                   >
//                     {
//                       technology
//                     }
//                   </span>
//                 )
//               )}

//             {topics
//               .slice(
//                 0,
//                 Math.max(
//                   0,
//                   4 -
//                     Math.min(
//                       technologies.length,
//                       3
//                     )
//                 )
//               )
//               .map(
//                 (topic) => (
//                   <span
//                     key={topic}
//                     className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
//                       isDark
//                         ? "bg-slate-800 text-slate-300"
//                         : "bg-slate-100 text-slate-600"
//                     }`}
//                   >
//                     {topic}
//                   </span>
//                 )
//               )}
//           </div>
//         )}
//       </div>

//       <div
//         className={`flex items-center justify-between border-t px-4 py-3 sm:px-6 ${
//           isDark
//             ? "border-slate-800 bg-slate-900/70"
//             : "border-slate-100 bg-slate-50/60"
//         }`}
//       >
//         <div>
//           {interview.editorPick ? (
//             <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-500">
//               <BadgeCheck className="h-3.5 w-3.5" />
//               Editor's Pick
//             </span>
//           ) : interview.featured ? (
//             <span className="flex items-center gap-1.5 text-xs font-semibold text-violet-500">
//               <Star className="h-3.5 w-3.5" />
//               Featured
//             </span>
//           ) : (
//             <span
//               className={`text-xs ${
//                 isDark
//                   ? "text-slate-500"
//                   : "text-slate-400"
//               }`}
//             >
//               Community experience
//             </span>
//           )}
//         </div>

//         <span className="flex items-center gap-1 text-xs font-bold text-blue-500">
//           Read full
//           <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
//         </span>
//       </div>
//     </article>
//   );
// };

// const InterviewFeed = () => {
//   const navigate =
//     useNavigate();

//   const [theme, setTheme] =
//     useState(() => {
//       if (
//         typeof window ===
//         "undefined"
//       ) {
//         return "light";
//       }

//       return (
//         localStorage.getItem(
//           "theme"
//         ) || "light"
//       );
//     });

//   const isDark =
//     theme === "dark";

//   useEffect(() => {
//     localStorage.setItem(
//       "theme",
//       theme
//     );
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((previous) =>
//       previous === "dark"
//         ? "light"
//         : "dark"
//     );
//   };

//   const API_BASE =
//     useMemo(
//       () =>
//         `${BASE_URL.replace(
//           /\/$/,
//           ""
//         )}/api/interview`,
//       []
//     );

//   const [
//     activeSection,
//     setActiveSection,
//   ] = useState("for-you");

//   const [
//     interviews,
//     setInterviews,
//   ] = useState([]);

//   const [
//     filtersData,
//     setFiltersData,
//   ] = useState({
//     companies: [],
//     roles: [],
//     locations: [],
//     topics: [],
//     technologies: [],
//     tags: [],
//   });

//   const [
//     search,
//     setSearch,
//   ] = useState("");

//   const [
//     debouncedSearch,
//     setDebouncedSearch,
//   ] = useState("");

//   const [
//     filters,
//     setFilters,
//   ] = useState(
//     initialFilters
//   );

//   const [
//     page,
//     setPage,
//   ] = useState(1);

//   const [
//     loading,
//     setLoading,
//   ] = useState(true);

//   const [
//     filtersOpen,
//     setFiltersOpen,
//   ] = useState(false);

//   const [
//     pagination,
//     setPagination,
//   ] = useState({
//     page: 1,
//     limit: 25,
//     total: 0,
//     totalPages: 1,
//     hasNextPage: false,
//     hasPreviousPage: false,
//   });

//   useEffect(() => {
//     const timer =
//       setTimeout(() => {
//         setDebouncedSearch(
//           search.trim()
//         );

//         setPage(1);
//       }, 400);

//     return () =>
//       clearTimeout(timer);
//   }, [search]);

//   const fetchFilters =
//     useCallback(
//       async () => {
//         try {
//           const response =
//             await fetch(
//               `${API_BASE}/filters`
//             );

//           const data =
//             await response.json();

//           if (!response.ok) {
//             return;
//           }

//           setFiltersData({
//             companies:
//               data?.data
//                 ?.companies || [],

//             roles:
//               data?.data
//                 ?.roles || [],

//             locations:
//               data?.data
//                 ?.locations || [],

//             topics:
//               data?.data
//                 ?.topics || [],

//             technologies:
//               data?.data
//                 ?.technologies ||
//               [],

//             tags:
//               data?.data?.tags ||
//               [],
//           });
//         } catch (error) {
//           console.error(
//             "fetchFilters:",
//             error
//           );
//         }
//       },
//       [API_BASE]
//     );

//   const fetchInterviews =
//     useCallback(
//       async () => {
//         try {
//           setLoading(true);

//           const params =
//             new URLSearchParams();

//           params.set(
//             "page",
//             String(page)
//           );

//           params.set(
//             "feed",
//             activeSection
//           );

//           if (
//             debouncedSearch
//           ) {
//             params.set(
//               "q",
//               debouncedSearch
//             );
//           }

//           Object.entries(
//             filters
//           ).forEach(
//             ([key, value]) => {
//               if (value) {
//                 params.set(
//                   key,
//                   value
//                 );
//               }
//             }
//           );

//           const response =
//             await fetch(
//               `${API_BASE}?${params.toString()}`
//             );

//           const data =
//             await response.json();

//           if (!response.ok) {
//             throw new Error(
//               data?.message ||
//                 "Unable to load interview experiences."
//             );
//           }

//           setInterviews(
//             Array.isArray(
//               data?.data
//             )
//               ? data.data
//               : []
//           );

//           setPagination({
//             page:
//               data?.pagination
//                 ?.page || page,

//             limit:
//               data?.pagination
//                 ?.limit || 25,

//             total:
//               data?.pagination
//                 ?.total || 0,

//             totalPages:
//               data?.pagination
//                 ?.totalPages || 1,

//             hasNextPage:
//               Boolean(
//                 data
//                   ?.pagination
//                   ?.hasNextPage
//               ),

//             hasPreviousPage:
//               Boolean(
//                 data
//                   ?.pagination
//                   ?.hasPreviousPage
//               ),
//           });
//         } catch (error) {
//           console.error(
//             error
//           );

//           toast.error(
//             error?.message ||
//               "Unable to load interviews."
//           );
//         } finally {
//           setLoading(false);
//         }
//       },
//       [
//         API_BASE,
//         page,
//         activeSection,
//         debouncedSearch,
//         filters,
//       ]
//     );

//   useEffect(() => {
//     fetchFilters();
//   }, [fetchFilters]);

//   useEffect(() => {
//     fetchInterviews();
//   }, [fetchInterviews]);

//   const updateFilter = (
//     name,
//     value
//   ) => {
//     setFilters(
//       (previous) => ({
//         ...previous,
//         [name]: value,
//       })
//     );

//     setPage(1);
//   };

//   const clearFilters = () => {
//     setFilters(
//       initialFilters
//     );

//     setSearch("");

//     setDebouncedSearch("");

//     setPage(1);
//   };

//   const activeFilters =
//     Object.entries(filters)
//       .filter(
//         ([, value]) =>
//           Boolean(value)
//       )
//       .map(
//         ([key, value]) => ({
//           key,
//           value,
//         })
//       );

//   const companyOptions = [
//     {
//       value: "",
//       label: "All Companies",
//     },
//     ...filtersData.companies.map(
//       (value) => ({
//         value,
//         label: value,
//       })
//     ),
//   ];

//   const roleOptions = [
//     {
//       value: "",
//       label: "All Roles",
//     },
//     ...filtersData.roles.map(
//       (value) => ({
//         value,
//         label: value,
//       })
//     ),
//   ];

//   const locationOptions = [
//     {
//       value: "",
//       label: "All Locations",
//     },
//     ...filtersData.locations.map(
//       (value) => ({
//         value,
//         label: value,
//       })
//     ),
//   ];

//   const topicOptions = [
//     {
//       value: "",
//       label: "All Topics",
//     },
//     ...filtersData.topics.map(
//       (value) => ({
//         value,
//         label: value,
//       })
//     ),
//   ];

//   const technologyOptions =
//     [
//       {
//         value: "",
//         label:
//           "All Technologies",
//       },
//       ...filtersData.technologies.map(
//         (value) => ({
//           value,
//           label: value,
//         })
//       ),
//     ];

//   const activeSectionData =
//     FEED_SECTIONS.find(
//       (item) =>
//         item.value ===
//         activeSection
//     ) || FEED_SECTIONS[0];

//   const structuredData = {
//     "@context":
//       "https://schema.org",

//     "@type":
//       "CollectionPage",

//     name:
//       "Software Engineering Interview Experiences",

//     description:
//       "Real software engineering interview experiences, interview rounds, coding questions, system design, backend and GenAI interviews.",

//     url:
//       `${SITE_URL}/interview`,

//     isPartOf: {
//       "@type": "WebSite",

//       name: "TargetTrek",

//       url: SITE_URL,
//     },
//   };

//   return (
//     <>
//       <Helmet>
//         <title>
//           Software Engineering
//           Interview Experiences |
//           TargetTrek
//         </title>

//         <meta
//           name="description"
//           content="Read real software engineering interview experiences from Amazon, Microsoft, Mastercard, PayPal and more. Explore DSA, LLD, HLD, backend and GenAI interview rounds and questions."
//         />

//         <meta
//           name="keywords"
//           content="software engineer interview experience, SDE interview experience, backend interview, AI engineer interview, system design interview, DSA interview questions"
//         />

//         <meta
//           name="robots"
//           content="index,follow"
//         />

//         <link
//           rel="canonical"
//           href={`${SITE_URL}/interview`}
//         />

//         <meta
//           property="og:title"
//           content="Software Engineering Interview Experiences | TargetTrek"
//         />

//         <meta
//           property="og:description"
//           content="Read real software engineering interview rounds, questions, preparation strategies and candidate experiences."
//         />

//         <meta
//           property="og:type"
//           content="website"
//         />

//         <meta
//           property="og:url"
//           content={`${SITE_URL}/interview`}
//         />

//         <meta
//           name="twitter:card"
//           content="summary_large_image"
//         />

//         <meta
//           name="twitter:title"
//           content="Software Engineering Interview Experiences | TargetTrek"
//         />

//         <script
//           type="application/ld+json"
//         >
//           {JSON.stringify(
//             structuredData
//           )}
//         </script>
//       </Helmet>

//       <div
//         className={`min-h-screen pt-20 transition-colors duration-300 sm:pt-24 ${
//           isDark
//             ? "bg-slate-950 text-white"
//             : "bg-slate-50 text-slate-900"
//         }`}
//       >
//         {/* TOP */}

//         <header
//           className={`border-b ${
//             isDark
//               ? "border-slate-800 bg-slate-950"
//               : "border-slate-200 bg-white"
//           }`}
//         >
//           <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
//             <div className="flex items-start justify-between gap-4">
//               <div className="min-w-0">
//                 <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-500">
//                   <BriefcaseBusiness className="h-4 w-4" />

//                   TargetTrek
//                   Interviews
//                 </div>

//                 <h1
//                   className={`mt-2 max-w-3xl text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl ${
//                     isDark
//                       ? "text-white"
//                       : "text-slate-950"
//                   }`}
//                 >
//                   Real Interview
//                   Experiences From
//                   Engineers
//                 </h1>

//                 <p
//                   className={`mt-3 max-w-2xl text-sm leading-6 sm:text-base ${
//                     isDark
//                       ? "text-slate-400"
//                       : "text-slate-600"
//                   }`}
//                 >
//                   Discover real
//                   interview rounds,
//                   coding questions,
//                   system design,
//                   backend and GenAI
//                   experiences.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 onClick={
//                   toggleTheme
//                 }
//                 aria-label="Toggle theme"
//                 className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition ${
//                   isDark
//                     ? "border-slate-700 bg-slate-900 text-yellow-400 hover:bg-slate-800"
//                     : "border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-100"
//                 }`}
//               >
//                 {isDark ? (
//                   <Sun className="h-5 w-5" />
//                 ) : (
//                   <Moon className="h-5 w-5" />
//                 )}
//               </button>
//             </div>

//             {/* SEARCH */}

//             <div className="mt-6 flex flex-col gap-3 sm:flex-row">
//               <div className="relative flex-1">
//                 <Search
//                   className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${
//                     isDark
//                       ? "text-slate-500"
//                       : "text-slate-400"
//                   }`}
//                 />

//                 <input
//                   value={search}
//                   onChange={(
//                     event
//                   ) =>
//                     setSearch(
//                       event.target
//                         .value
//                     )
//                   }
//                   placeholder="Search Amazon, SDE-2, Java, System Design, RAG..."
//                   className={`w-full rounded-xl border py-3.5 pl-12 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
//                     isDark
//                       ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
//                       : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
//                   }`}
//                 />

//                 {search && (
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setSearch(
//                         ""
//                       )
//                     }
//                     className={`absolute right-4 top-1/2 -translate-y-1/2 ${
//                       isDark
//                         ? "text-slate-500"
//                         : "text-slate-400"
//                     }`}
//                   >
//                     <X className="h-4 w-4" />
//                   </button>
//                 )}
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate(
//                     "/interview/create"
//                   )
//                 }
//                 className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
//               >
//                 <Plus className="h-4 w-4" />

//                 Share Interview
//               </button>
//             </div>
//           </div>
//         </header>

//         {/* FEED NAV */}

//         <div
//           className={`sticky top-0 z-20 border-b ${
//             isDark
//               ? "border-slate-800 bg-slate-950/95"
//               : "border-slate-200 bg-white/95"
//           } backdrop-blur`}
//         >
//           <div className="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6 lg:px-8">
//             <div className="flex min-w-max items-center gap-1 py-3">
//               {FEED_SECTIONS.map(
//                 (section) => {
//                   const Icon =
//                     section.icon;

//                   const active =
//                     activeSection ===
//                     section.value;

//                   return (
//                     <button
//                       key={
//                         section.value
//                       }
//                       type="button"
//                       onClick={() => {
//                         setActiveSection(
//                           section.value
//                         );

//                         setPage(1);
//                       }}
//                       className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-4 ${
//                         active
//                           ? "bg-blue-600 text-white"
//                           : isDark
//                             ? "text-slate-400 hover:bg-slate-900 hover:text-white"
//                             : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
//                       }`}
//                     >
//                       <Icon className="h-4 w-4" />

//                       {
//                         section.label
//                       }
//                     </button>
//                   );
//                 }
//               )}
//             </div>
//           </div>
//         </div>

//         <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
//           {/* FILTER HEADER */}

//           <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
//             <div>
//               <h2
//                 className={`text-xl font-black ${
//                   isDark
//                     ? "text-white"
//                     : "text-slate-950"
//                 }`}
//               >
//                 {
//                   activeSectionData.label
//                 }
//               </h2>

//               <p
//                 className={`mt-1 text-xs ${
//                   isDark
//                     ? "text-slate-500"
//                     : "text-slate-500"
//                 }`}
//               >
//                 {
//                   pagination.total
//                 }{" "}
//                 published interview
//                 {pagination.total ===
//                 1
//                   ? ""
//                   : "s"}
//               </p>
//             </div>

//             <button
//               type="button"
//               onClick={() =>
//                 setFiltersOpen(
//                   (previous) =>
//                     !previous
//                 )
//               }
//               className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
//                 isDark
//                   ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
//                   : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
//               }`}
//             >
//               <Filter className="h-4 w-4" />

//               Filters

//               {activeFilters.length >
//                 0 && (
//                 <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
//                   {
//                     activeFilters.length
//                   }
//                 </span>
//               )}
//             </button>
//           </div>

//           {/* FILTER PANEL */}

//           {filtersOpen && (
//             <section
//               className={`mb-6 rounded-2xl border p-4 sm:p-5 ${
//                 isDark
//                   ? "border-slate-800 bg-slate-900"
//                   : "border-slate-200 bg-white"
//               }`}
//             >
//               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
//                 <FilterSelect
//                   label="Company"
//                   value={
//                     filters.company
//                   }
//                   onChange={(
//                     value
//                   ) =>
//                     updateFilter(
//                       "company",
//                       value
//                     )
//                   }
//                   options={
//                     companyOptions
//                   }
//                   isDark={isDark}
//                 />

//                 <FilterSelect
//                   label="Role"
//                   value={
//                     filters.role
//                   }
//                   onChange={(
//                     value
//                   ) =>
//                     updateFilter(
//                       "role",
//                       value
//                     )
//                   }
//                   options={
//                     roleOptions
//                   }
//                   isDark={isDark}
//                 />

//                 <FilterSelect
//                   label="Location"
//                   value={
//                     filters.location
//                   }
//                   onChange={(
//                     value
//                   ) =>
//                     updateFilter(
//                       "location",
//                       value
//                     )
//                   }
//                   options={
//                     locationOptions
//                   }
//                   isDark={isDark}
//                 />

//                 <FilterSelect
//                   label="Result"
//                   value={
//                     filters.result
//                   }
//                   onChange={(
//                     value
//                   ) =>
//                     updateFilter(
//                       "result",
//                       value
//                     )
//                   }
//                   options={
//                     RESULT_OPTIONS
//                   }
//                   isDark={isDark}
//                 />

//                 <FilterSelect
//                   label="Difficulty"
//                   value={
//                     filters.difficulty
//                   }
//                   onChange={(
//                     value
//                   ) =>
//                     updateFilter(
//                       "difficulty",
//                       value
//                     )
//                   }
//                   options={
//                     DIFFICULTY_OPTIONS
//                   }
//                   isDark={isDark}
//                 />

//                 <FilterSelect
//                   label="Topic"
//                   value={
//                     filters.topic
//                   }
//                   onChange={(
//                     value
//                   ) =>
//                     updateFilter(
//                       "topic",
//                       value
//                     )
//                   }
//                   options={
//                     topicOptions
//                   }
//                   isDark={isDark}
//                 />

//                 <FilterSelect
//                   label="Technology"
//                   value={
//                     filters.technology
//                   }
//                   onChange={(
//                     value
//                   ) =>
//                     updateFilter(
//                       "technology",
//                       value
//                     )
//                   }
//                   options={
//                     technologyOptions
//                   }
//                   isDark={isDark}
//                 />
//               </div>

//               <div className="mt-5 flex justify-end">
//                 <button
//                   type="button"
//                   onClick={
//                     clearFilters
//                   }
//                   className="text-xs font-bold text-red-500 hover:text-red-600"
//                 >
//                   Clear all filters
//                 </button>
//               </div>
//             </section>
//           )}

//           {/* ACTIVE FILTERS */}

//           {activeFilters.length >
//             0 && (
//             <div className="mb-5 flex flex-wrap gap-2">
//               {activeFilters.map(
//                 ({
//                   key,
//                   value,
//                 }) => (
//                   <button
//                     key={`${key}-${value}`}
//                     type="button"
//                     onClick={() =>
//                       updateFilter(
//                         key,
//                         ""
//                       )
//                     }
//                     className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
//                       isDark
//                         ? "bg-blue-950/60 text-blue-300"
//                         : "bg-blue-50 text-blue-700"
//                     }`}
//                   >
//                     {formatLabel(
//                       value
//                     )}

//                     <X className="h-3 w-3" />
//                   </button>
//                 )
//               )}
//             </div>
//           )}

//           <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
//             {/* FEED */}

//             <div className="min-w-0 space-y-4">
//               {loading ? (
//                 <>
//                   <InterviewSkeleton
//                     isDark={
//                       isDark
//                     }
//                   />

//                   <InterviewSkeleton
//                     isDark={
//                       isDark
//                     }
//                   />

//                   <InterviewSkeleton
//                     isDark={
//                       isDark
//                     }
//                   />
//                 </>
//               ) : interviews.length ===
//                 0 ? (
//                 <div
//                   className={`rounded-2xl border px-5 py-16 text-center ${
//                     isDark
//                       ? "border-slate-800 bg-slate-900"
//                       : "border-slate-200 bg-white"
//                   }`}
//                 >
//                   <Search
//                     className={`mx-auto h-8 w-8 ${
//                       isDark
//                         ? "text-slate-600"
//                         : "text-slate-300"
//                     }`}
//                   />

//                   <h3
//                     className={`mt-4 font-black ${
//                       isDark
//                         ? "text-white"
//                         : "text-slate-900"
//                     }`}
//                   >
//                     No interviews
//                     found
//                   </h3>

//                   <p
//                     className={`mt-2 text-sm ${
//                       isDark
//                         ? "text-slate-500"
//                         : "text-slate-500"
//                     }`}
//                   >
//                     Try another
//                     search or remove
//                     some filters.
//                   </p>

//                   <button
//                     type="button"
//                     onClick={
//                       clearFilters
//                     }
//                     className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white"
//                   >
//                     Reset Filters
//                   </button>
//                 </div>
//               ) : (
//                 interviews.map(
//                   (
//                     interview
//                   ) => (
//                     <InterviewCard
//                       key={
//                         interview._id
//                       }
//                       interview={
//                         interview
//                       }
//                       isDark={
//                         isDark
//                       }
//                       onOpen={(
//                         item
//                       ) =>
//                         navigate(
//                           `/interview/${item.slug}`
//                         )
//                       }
//                     />
//                   )
//                 )
//               )}

//               {/* PAGINATION */}

//               {!loading &&
//                 pagination
//                   .totalPages >
//                   1 && (
//                   <div
//                     className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
//                       isDark
//                         ? "border-slate-800 bg-slate-900"
//                         : "border-slate-200 bg-white"
//                     }`}
//                   >
//                     <p
//                       className={`text-xs ${
//                         isDark
//                           ? "text-slate-500"
//                           : "text-slate-500"
//                       }`}
//                     >
//                       Page{" "}
//                       {
//                         pagination.page
//                       }{" "}
//                       of{" "}
//                       {
//                         pagination.totalPages
//                       }
//                     </p>

//                     <div className="flex gap-2">
//                       <button
//                         type="button"
//                         disabled={
//                           !pagination.hasPreviousPage
//                         }
//                         onClick={() => {
//                           setPage(
//                             (
//                               previous
//                             ) =>
//                               Math.max(
//                                 1,
//                                 previous -
//                                   1
//                               )
//                           );

//                           window.scrollTo(
//                             {
//                               top: 0,
//                               behavior:
//                                 "smooth",
//                             }
//                           );
//                         }}
//                         className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
//                           isDark
//                             ? "border-slate-700 text-slate-300"
//                             : "border-slate-200 text-slate-700"
//                         }`}
//                       >
//                         <ChevronLeft className="h-4 w-4" />

//                         Previous
//                       </button>

//                       <button
//                         type="button"
//                         disabled={
//                           !pagination.hasNextPage
//                         }
//                         onClick={() => {
//                           setPage(
//                             (
//                               previous
//                             ) =>
//                               previous +
//                               1
//                           );

//                           window.scrollTo(
//                             {
//                               top: 0,
//                               behavior:
//                                 "smooth",
//                             }
//                           );
//                         }}
//                         className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
//                           isDark
//                             ? "border-slate-700 text-slate-300"
//                             : "border-slate-200 text-slate-700"
//                         }`}
//                       >
//                         Next

//                         <ChevronRight className="h-4 w-4" />
//                       </button>
//                     </div>
//                   </div>
//                 )}
//             </div>

//             {/* SIDEBAR */}

//             <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
//               <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg">
//                 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
//                   <Plus className="h-5 w-5" />
//                 </div>

//                 <h3 className="mt-4 text-lg font-black">
//                   Had an interview
//                   recently?
//                 </h3>

//                 <p className="mt-2 text-sm leading-6 text-blue-100">
//                   Share your
//                   experience and help
//                   other engineers
//                   prepare. You can
//                   publish anonymously.
//                 </p>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     navigate(
//                       "/interview/create"
//                     )
//                   }
//                   className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
//                 >
//                   Add Interview
//                   Experience
//                 </button>
//               </div>

//               {filtersData.topics
//                 .length > 0 && (
//                 <div
//                   className={`rounded-2xl border p-5 ${
//                     isDark
//                       ? "border-slate-800 bg-slate-900"
//                       : "border-slate-200 bg-white"
//                   }`}
//                 >
//                   <h3
//                     className={`text-sm font-black ${
//                       isDark
//                         ? "text-white"
//                         : "text-slate-900"
//                     }`}
//                   >
//                     Popular Topics
//                   </h3>

//                   <div className="mt-4 flex flex-wrap gap-2">
//                     {filtersData.topics
//                       .slice(0, 10)
//                       .map(
//                         (
//                           topic
//                         ) => (
//                           <button
//                             type="button"
//                             key={
//                               topic
//                             }
//                             onClick={() =>
//                               updateFilter(
//                                 "topic",
//                                 topic
//                               )
//                             }
//                             className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
//                               isDark
//                                 ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
//                                 : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
//                             }`}
//                           >
//                             {
//                               topic
//                             }
//                           </button>
//                         )
//                       )}
//                   </div>
//                 </div>
//               )}

//               <div
//                 className={`rounded-2xl border p-5 ${
//                   isDark
//                     ? "border-slate-800 bg-slate-900"
//                     : "border-slate-200 bg-white"
//                 }`}
//               >
//                 <div className="flex items-start gap-3">
//                   <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />

//                   <div>
//                     <h3
//                       className={`text-sm font-black ${
//                         isDark
//                           ? "text-white"
//                           : "text-slate-900"
//                       }`}
//                     >
//                       Community
//                       Experiences
//                     </h3>

//                     <p
//                       className={`mt-2 text-xs leading-5 ${
//                         isDark
//                           ? "text-slate-500"
//                           : "text-slate-500"
//                       }`}
//                     >
//                       Interview
//                       experiences can
//                       differ by team,
//                       interviewer,
//                       location and
//                       hiring cycle.
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </aside>
//           </div>
//         </main>
//       </div>
//     </>
//   );
// };

// export default InterviewFeed;
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  Flame,
  IndianRupee,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url.js";

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const SITE_URL = "https://www.targettrek.in";
const SITE_NAME = "Target Trek";

const PAGE_URL = `${SITE_URL}/interview`;

const SEO_TITLE =
  "Software Engineering Interview Experiences | SDE, Backend, AI & System Design";

const SEO_DESCRIPTION =
  "Read real software engineering interview experiences from engineers interviewing at top companies. Explore DSA, LLD, HLD, backend, AI, GenAI, system design, interview rounds, compensation and hiring experiences.";

const THEME_STORAGE_KEY = "theme";

const RESULT_OPTIONS = [
  {
    value: "",
    label: "All Results",
  },
  {
    value: "SELECTED",
    label: "Selected",
  },
  {
    value: "REJECTED",
    label: "Rejected",
  },
  {
    value: "WAITING",
    label: "Waiting",
  },
  {
    value: "OFFER_DECLINED",
    label: "Offer Declined",
  },
  {
    value: "NOT_DISCLOSED",
    label: "Not Disclosed",
  },
];

const DIFFICULTY_OPTIONS = [
  {
    value: "",
    label: "All Difficulties",
  },
  {
    value: "EASY",
    label: "Easy",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "MEDIUM_HARD",
    label: "Medium-Hard",
  },
  {
    value: "HARD",
    label: "Hard",
  },
  {
    value: "NOT_SPECIFIED",
    label: "Not Specified",
  },
];

/*
|--------------------------------------------------------------------------
| FEED RULES
|--------------------------------------------------------------------------
|
| for-you:
|   All published interviews.
|
| latest:
|   Published interviews sorted by publishedAt DESC.
|
| trending:
|   Published interviews sorted by views DESC.
|
| editor-picks:
|   Published + editorPick === true.
|
| featured:
|   Published + featured === true.
|
| compensation:
|   Published interviews having Compensation / Salary / CTC / Package
|   related tags/topics.
|
*/

const FEED_SECTIONS = [
  {
    value: "for-you",
    label: "For You",
    icon: Sparkles,
    description:
      "Explore all published software engineering interview experiences.",
  },
  {
    value: "latest",
    label: "Newest",
    icon: Clock3,
    description:
      "Recently published interview experiences from engineers.",
  },
  {
    value: "trending",
    label: "Trending",
    icon: Flame,
    description:
      "Interview experiences receiving the highest number of views.",
  },
  {
    value: "editor-picks",
    label: "Editor's Picks",
    icon: BadgeCheck,
    description:
      "Interview experiences highlighted by the Target Trek editorial team.",
  },
  {
    value: "featured",
    label: "Featured",
    icon: Star,
    description:
      "Featured software engineering interview experiences.",
  },
  {
    value: "compensation",
    label: "Compensation",
    icon: IndianRupee,
    description:
      "Interview experiences containing salary, CTC and compensation information.",
  },
];

const initialFilters = {
  company: "",
  role: "",
  location: "",
  topic: "",
  technology: "",
  result: "",
  difficulty: "",
};

/* -------------------------------------------------------------------------- */
/* THEME                                                                      */
/* -------------------------------------------------------------------------- */

const readStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage
    .getItem(THEME_STORAGE_KEY)
    ?.trim()
    .toLowerCase();

  return storedTheme === "dark" ? "dark" : "light";
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const formatLabel = (value = "") => {
  if (!value) return "";

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const stripMarkdown = (value = "") => {
  return String(value)
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const getTimeAgo = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days}d ago`;
  }

  const weeks = Math.floor(days / 7);

  if (weeks < 5) {
    return `${weeks}w ago`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `${months}mo ago`;
  }

  const years = Math.floor(days / 365);

  return `${years}y ago`;
};

const getExperienceText = (info = {}) => {
  const years = Number(info?.experienceYears || 0);
  const months = Number(info?.experienceMonths || 0);

  if (!years && !months) {
    return "";
  }

  const parts = [];

  if (years) {
    parts.push(`${years} ${years === 1 ? "year" : "years"}`);
  }

  if (months) {
    parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  }

  return parts.join(" ");
};

const getViews = (interview = {}) => {
  return Number(
    interview?.views ??
      interview?.viewCount ??
      interview?.stats?.views ??
      interview?.analytics?.views ??
      0
  );
};

const normalizeArrayValue = (value) => {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    return (
      value?.name ||
      value?.label ||
      value?.value ||
      value?.title ||
      ""
    );
  }

  return "";
};

/* -------------------------------------------------------------------------- */
/* PUBLICATION CHECK                                                          */
/* -------------------------------------------------------------------------- */

const isPublishedInterview = (interview = {}) => {
  /*
   * Explicit boolean has highest priority.
   */

  if (typeof interview?.published === "boolean") {
    return interview.published;
  }

  if (typeof interview?.isPublished === "boolean") {
    return interview.isPublished;
  }

  /*
   * Then check publication/status fields.
   */

  const rawStatus =
    interview?.status ||
    interview?.publicationStatus ||
    interview?.publishStatus ||
    "";

  const status = String(rawStatus).trim().toUpperCase();

  if (status) {
    return ["PUBLISHED", "LIVE", "APPROVED"].includes(status);
  }

  /*
   * Last fallback for APIs that only expose publishedAt
   * on public resources.
   */

  return Boolean(interview?.publishedAt);
};

/* -------------------------------------------------------------------------- */
/* COMPENSATION CHECK                                                         */
/* -------------------------------------------------------------------------- */

const isCompensationInterview = (interview = {}) => {
  const tags = Array.isArray(interview?.tags)
    ? interview.tags
    : [];

  const topics = Array.isArray(interview?.topics)
    ? interview.topics
    : [];

  const categories = Array.isArray(interview?.categories)
    ? interview.categories
    : interview?.category
      ? [interview.category]
      : [];

  const values = [
    ...tags,
    ...topics,
    ...categories,
    interview?.type,
  ]
    .map(normalizeArrayValue)
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const compensationKeywords = [
    "compensation",
    "salary",
    "ctc",
    "package",
    "pay package",
    "base salary",
  ];

  return compensationKeywords.some((keyword) =>
    values.includes(keyword)
  );
};

/* -------------------------------------------------------------------------- */
/* CLIENT FALLBACK FEED FILTERING                                             */
/* -------------------------------------------------------------------------- */

const applyFeedRules = (items = [], activeSection) => {
  /*
   * SAFETY:
   * Never expose unpublished interview experiences,
   * even if backend accidentally returns them.
   */

  let result = items.filter(isPublishedInterview);

  switch (activeSection) {
    case "latest":
      return [...result].sort((a, b) => {
        const bDate = new Date(
          b?.publishedAt || b?.createdAt || 0
        ).getTime();

        const aDate = new Date(
          a?.publishedAt || a?.createdAt || 0
        ).getTime();

        return bDate - aDate;
      });

    case "trending":
      return [...result].sort(
        (a, b) => getViews(b) - getViews(a)
      );

    case "editor-picks":
      return result.filter(
        (interview) => interview?.editorPick === true
      );

    case "featured":
      return result.filter(
        (interview) => interview?.featured === true
      );

    case "compensation":
      return result.filter(isCompensationInterview);

    case "for-you":
    default:
      return result;
  }
};

/* -------------------------------------------------------------------------- */
/* COLORS                                                                     */
/* -------------------------------------------------------------------------- */

const getResultClasses = (result, isDark) => {
  if (result === "SELECTED") {
    return isDark
      ? "border-emerald-800/70 bg-emerald-950/50 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (result === "REJECTED") {
    return isDark
      ? "border-rose-800/70 bg-rose-950/50 text-rose-300"
      : "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (result === "WAITING") {
    return isDark
      ? "border-amber-800/70 bg-amber-950/50 text-amber-300"
      : "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (result === "OFFER_DECLINED") {
    return isDark
      ? "border-violet-800/70 bg-violet-950/50 text-violet-300"
      : "border-violet-200 bg-violet-50 text-violet-700";
  }

  return isDark
    ? "border-slate-700 bg-slate-800 text-slate-300"
    : "border-slate-200 bg-slate-100 text-slate-600";
};

const getDifficultyClasses = (difficulty, isDark) => {
  if (difficulty === "EASY") {
    return isDark
      ? "bg-emerald-950/50 text-emerald-300"
      : "bg-emerald-50 text-emerald-700";
  }

  if (difficulty === "MEDIUM") {
    return isDark
      ? "bg-blue-950/50 text-blue-300"
      : "bg-blue-50 text-blue-700";
  }

  if (difficulty === "MEDIUM_HARD") {
    return isDark
      ? "bg-amber-950/50 text-amber-300"
      : "bg-amber-50 text-amber-700";
  }

  if (difficulty === "HARD") {
    return isDark
      ? "bg-rose-950/50 text-rose-300"
      : "bg-rose-50 text-rose-700";
  }

  return isDark
    ? "bg-slate-800 text-slate-300"
    : "bg-slate-100 text-slate-600";
};

/* -------------------------------------------------------------------------- */
/* FILTER SELECT                                                              */
/* -------------------------------------------------------------------------- */

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  isDark,
}) => {
  return (
    <div className="min-w-0 space-y-1.5">
      <label
        className={`block text-xs font-bold ${
          isDark
            ? "text-slate-400"
            : "text-slate-600"
        }`}
      >
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`w-full appearance-none rounded-xl border px-3 py-2.5 pr-9 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
            isDark
              ? "border-slate-700 bg-slate-950 text-slate-200"
              : "border-slate-200 bg-white text-slate-700"
          }`}
        >
          {options.map((option) => (
            <option
              key={`${label}-${option.value}`}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          aria-hidden="true"
          className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
            isDark
              ? "text-slate-500"
              : "text-slate-400"
          }`}
        />
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SKELETON                                                                   */
/* -------------------------------------------------------------------------- */

const InterviewSkeleton = ({ isDark }) => {
  const skeletonClass = isDark
    ? "bg-slate-800"
    : "bg-slate-200";

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl border p-4 sm:p-6 ${
        isDark
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex gap-3 sm:gap-4">
        <div
          className={`h-11 w-11 shrink-0 rounded-xl sm:h-12 sm:w-12 ${skeletonClass}`}
        />

        <div className="min-w-0 flex-1">
          <div
            className={`h-4 w-1/3 rounded ${skeletonClass}`}
          />

          <div
            className={`mt-3 h-6 w-4/5 rounded ${skeletonClass}`}
          />

          <div
            className={`mt-3 h-4 w-1/2 rounded ${skeletonClass}`}
          />
        </div>
      </div>

      <div
        className={`mt-5 h-4 w-full rounded ${
          isDark ? "bg-slate-800" : "bg-slate-100"
        }`}
      />

      <div
        className={`mt-2 h-4 w-5/6 rounded ${
          isDark ? "bg-slate-800" : "bg-slate-100"
        }`}
      />
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* INTERVIEW CARD                                                             */
/* -------------------------------------------------------------------------- */

const InterviewCard = ({
  interview,
  isDark,
}) => {
  const info =
    interview?.interviewInfo || {};

  const experience =
    getExperienceText(info);

  const technologies =
    Array.isArray(interview?.technologies)
      ? interview.technologies
      : [];

  const topics =
    Array.isArray(interview?.topics)
      ? interview.topics
      : [];

  const summary =
    stripMarkdown(
      interview?.summaryMarkdown ||
        interview?.contentMarkdown ||
        ""
    );

  const views =
    getViews(interview);

  const slug =
    interview?.slug || "";

  const interviewUrl = slug
    ? `/interview/${encodeURIComponent(slug)}`
    : "/interview";

  return (
    <article
      className={`group overflow-hidden rounded-2xl border transition-all duration-200 sm:rounded-3xl ${
        isDark
          ? "border-slate-800 bg-slate-900 hover:border-slate-700 hover:shadow-xl hover:shadow-black/20"
          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
      }`}
    >
      <Link
        to={interviewUrl}
        aria-label={`Read ${interview?.title || "interview experience"}`}
        className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            {/* COMPANY LOGO */}

            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border sm:h-12 sm:w-12 ${
                isDark
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {interview?.company?.logoUrl ? (
                <img
                  src={interview.company.logoUrl}
                  alt={`${interview?.company?.name || "Company"} logo`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain p-1.5"
                />
              ) : (
                <Building2
                  aria-hidden="true"
                  className={`h-5 w-5 ${
                    isDark
                      ? "text-slate-400"
                      : "text-slate-500"
                  }`}
                />
              )}
            </div>

            {/* MAIN INFO */}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span
                  className={`max-w-full truncate text-sm font-bold ${
                    isDark
                      ? "text-slate-200"
                      : "text-slate-800"
                  }`}
                >
                  {interview?.company?.name ||
                    "Company"}
                </span>

                {interview?.role?.title && (
                  <>
                    <span
                      aria-hidden="true"
                      className={
                        isDark
                          ? "text-slate-600"
                          : "text-slate-300"
                      }
                    >
                      •
                    </span>

                    <span
                      className={`text-sm ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-500"
                      }`}
                    >
                      {interview.role.title}
                    </span>
                  </>
                )}
              </div>

              <h2
                className={`mt-2 break-words text-base font-black leading-6 transition-colors sm:text-xl sm:leading-7 ${
                  isDark
                    ? "text-white group-hover:text-blue-400"
                    : "text-slate-950 group-hover:text-blue-600"
                }`}
              >
                {interview?.title ||
                  "Interview Experience"}
              </h2>

              <div
                className={`mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] sm:text-xs ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-500"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <UserRound className="h-3.5 w-3.5 shrink-0" />

                  <span className="truncate">
                    {interview?.author?.name ||
                      "Anonymous"}
                  </span>
                </span>

                <span className="flex items-center gap-1.5">
                  <Clock3 className="h-3.5 w-3.5 shrink-0" />

                  {getTimeAgo(
                    interview?.publishedAt ||
                      interview?.createdAt
                  )}
                </span>

                {views > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 shrink-0" />

                    {views.toLocaleString("en-IN")} views
                  </span>
                )}

                {info.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />

                    {info.location}
                  </span>
                )}

                {experience && (
                  <span className="flex items-center gap-1.5">
                    <BriefcaseBusiness className="h-3.5 w-3.5 shrink-0" />

                    {experience} exp.
                  </span>
                )}

                {Number(
                  interview?.readingTimeMinutes
                ) > 0 && (
                  <span>
                    {
                      interview
                        .readingTimeMinutes
                    }{" "}
                    min read
                  </span>
                )}
              </div>
            </div>

            {/* EDITOR PICK ICON */}

            {interview?.editorPick === true && (
              <BadgeCheck
                aria-label="Editor's Pick"
                className="hidden h-5 w-5 shrink-0 text-blue-500 sm:block"
              />
            )}
          </div>

          {/* SUMMARY */}

          {summary && (
            <p
              className={`mt-4 line-clamp-2 text-sm leading-6 sm:line-clamp-3 ${
                isDark
                  ? "text-slate-400"
                  : "text-slate-600"
              }`}
            >
              {summary}
            </p>
          )}

          {/* INTERVIEW INFO */}

          <div className="mt-4 flex flex-wrap gap-2">
            {info.result &&
              info.result !==
                "NOT_DISCLOSED" && (
                <span
                  className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${getResultClasses(
                    info.result,
                    isDark
                  )}`}
                >
                  {formatLabel(
                    info.result
                  )}
                </span>
              )}

            {info.difficulty &&
              info.difficulty !==
                "NOT_SPECIFIED" && (
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getDifficultyClasses(
                    info.difficulty,
                    isDark
                  )}`}
                >
                  {formatLabel(
                    info.difficulty
                  )}
                </span>
              )}

            {Number(
              interview?.totalRounds
            ) > 0 && (
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                  isDark
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {interview.totalRounds}{" "}
                Rounds
              </span>
            )}
          </div>

          {/* TECHNOLOGIES */}

          {(technologies.length > 0 ||
            topics.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {technologies
                .slice(0, 3)
                .map((technology) => (
                  <span
                    key={
                      typeof technology ===
                      "string"
                        ? technology
                        : JSON.stringify(
                            technology
                          )
                    }
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                      isDark
                        ? "bg-blue-950/50 text-blue-300"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {normalizeArrayValue(
                      technology
                    )}
                  </span>
                ))}

              {topics
                .slice(
                  0,
                  Math.max(
                    0,
                    4 -
                      Math.min(
                        technologies.length,
                        3
                      )
                  )
                )
                .map((topic) => (
                  <span
                    key={
                      typeof topic ===
                      "string"
                        ? topic
                        : JSON.stringify(
                            topic
                          )
                    }
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                      isDark
                        ? "bg-slate-800 text-slate-300"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {normalizeArrayValue(
                      topic
                    )}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* CARD FOOTER */}

        <div
          className={`flex items-center justify-between gap-4 border-t px-4 py-3 sm:px-6 ${
            isDark
              ? "border-slate-800 bg-slate-950/40"
              : "border-slate-100 bg-slate-50/70"
          }`}
        >
          <div className="min-w-0">
            {interview?.editorPick ===
            true ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-500 sm:text-xs">
                <BadgeCheck className="h-3.5 w-3.5" />

                Editor's Pick
              </span>
            ) : interview?.featured ===
              true ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-500 sm:text-xs">
                <Star className="h-3.5 w-3.5" />

                Featured
              </span>
            ) : (
              <span
                className={`text-[11px] sm:text-xs ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                Interview experience
              </span>
            )}
          </div>

          <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-blue-500 sm:text-xs">
            Read full

            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </article>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const InterviewFeed = () => {
  const navigate = useNavigate();

  /* ------------------------------------------------------------------------ */
  /* THEME FROM LOCAL STORAGE ONLY                                            */
  /* ------------------------------------------------------------------------ */

  const [theme, setTheme] =
    useState(readStoredTheme);

  const isDark =
    theme === "dark";

  useEffect(() => {
    const syncTheme = () => {
      const nextTheme =
        readStoredTheme();

      setTheme((current) =>
        current === nextTheme
          ? current
          : nextTheme
      );
    };

    syncTheme();

    /*
     * Works when another tab changes
     * localStorage.
     */

    window.addEventListener(
      "storage",
      syncTheme
    );

    /*
     * If your Navbar dispatches:
     *
     * window.dispatchEvent(
     *   new Event("themechange")
     * );
     *
     * this page updates instantly.
     */

    window.addEventListener(
      "themechange",
      syncTheme
    );

    /*
     * storage event does NOT fire in the
     * same browser tab.
     *
     * Therefore this small sync also
     * supports a Navbar which only does:
     *
     * localStorage.setItem("theme", "dark")
     */

    const interval =
      window.setInterval(
        syncTheme,
        300
      );

    return () => {
      window.removeEventListener(
        "storage",
        syncTheme
      );

      window.removeEventListener(
        "themechange",
        syncTheme
      );

      window.clearInterval(
        interval
      );
    };
  }, []);

  /*
   * Keep Tailwind's dark class synchronized
   * with the stored value.
   *
   * IMPORTANT:
   * We are NOT writing to localStorage here.
   */

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      isDark
    );

    document.documentElement.style.colorScheme =
      isDark ? "dark" : "light";
  }, [isDark]);

  /* ------------------------------------------------------------------------ */
  /* API                                                                      */
  /* ------------------------------------------------------------------------ */

  const API_BASE =
    useMemo(() => {
      return `${BASE_URL.replace(
        /\/$/,
        ""
      )}/api/interview`;
    }, []);

  /* ------------------------------------------------------------------------ */
  /* STATE                                                                    */
  /* ------------------------------------------------------------------------ */

  const [
    activeSection,
    setActiveSection,
  ] = useState("for-you");

  const [
    interviews,
    setInterviews,
  ] = useState([]);

  const [
    filtersData,
    setFiltersData,
  ] = useState({
    companies: [],
    roles: [],
    locations: [],
    topics: [],
    technologies: [],
    tags: [],
  });

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [
    filters,
    setFilters,
  ] = useState(initialFilters);

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  /* ------------------------------------------------------------------------ */
  /* SEARCH DEBOUNCE                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setDebouncedSearch(
          search.trim()
        );

        setPage(1);
      }, 400);

    return () =>
      window.clearTimeout(timer);
  }, [search]);

  /* ------------------------------------------------------------------------ */
  /* FETCH FILTERS                                                            */
  /* ------------------------------------------------------------------------ */

  const fetchFilters =
    useCallback(async () => {
      try {
        const response =
          await fetch(
            `${API_BASE}/filters`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          return;
        }

        setFiltersData({
          companies:
            data?.data
              ?.companies || [],

          roles:
            data?.data?.roles ||
            [],

          locations:
            data?.data
              ?.locations || [],

          topics:
            data?.data?.topics ||
            [],

          technologies:
            data?.data
              ?.technologies ||
            [],

          tags:
            data?.data?.tags ||
            [],
        });
      } catch (error) {
        console.error(
          "fetchFilters:",
          error
        );
      }
    }, [API_BASE]);

  /* ------------------------------------------------------------------------ */
  /* FETCH INTERVIEWS                                                         */
  /* ------------------------------------------------------------------------ */

  const fetchInterviews =
    useCallback(async () => {
      try {
        setLoading(true);

        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page)
        );

        params.set(
          "limit",
          "25"
        );

        /*
         * Always tell backend:
         * PUBLIC PAGE = PUBLISHED ONLY.
         */

        params.set(
          "status",
          "PUBLISHED"
        );

        /*
         * Keep feed param so your existing
         * backend can also implement these
         * rules server-side.
         */

        params.set(
          "feed",
          activeSection
        );

        /*
         * Explicit server-side sorting /
         * filtering hints.
         *
         * This is important because Trending
         * should ideally be sorted across the
         * complete database BEFORE pagination.
         */

        switch (
          activeSection
        ) {
          case "latest":
            params.set(
              "sortBy",
              "publishedAt"
            );

            params.set(
              "sortOrder",
              "desc"
            );

            break;

          case "trending":
            params.set(
              "sortBy",
              "views"
            );

            params.set(
              "sortOrder",
              "desc"
            );

            break;

          case "editor-picks":
            params.set(
              "editorPick",
              "true"
            );

            break;

          case "featured":
            params.set(
              "featured",
              "true"
            );

            break;

          case "compensation":
            params.set(
              "tag",
              "compensation"
            );

            break;

          default:
            break;
        }

        if (
          debouncedSearch
        ) {
          params.set(
            "q",
            debouncedSearch
          );
        }

        Object.entries(
          filters
        ).forEach(
          ([key, value]) => {
            if (value) {
              params.set(
                key,
                value
              );
            }
          }
        );

        const response =
          await fetch(
            `${API_BASE}?${params.toString()}`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load interview experiences."
          );
        }

        const rawInterviews =
          Array.isArray(
            data?.data
          )
            ? data.data
            : [];

        /*
         * Frontend safety layer.
         *
         * Even if backend accidentally
         * returns Draft/Pending records,
         * they will not be rendered.
         */

        const safeInterviews =
          applyFeedRules(
            rawInterviews,
            activeSection
          );

        setInterviews(
          safeInterviews
        );

        setPagination({
          page:
            data?.pagination
              ?.page || page,

          limit:
            data?.pagination
              ?.limit || 25,

          total:
            data?.pagination
              ?.total ||
            safeInterviews.length,

          totalPages:
            data?.pagination
              ?.totalPages || 1,

          hasNextPage:
            Boolean(
              data
                ?.pagination
                ?.hasNextPage
            ),

          hasPreviousPage:
            Boolean(
              data
                ?.pagination
                ?.hasPreviousPage
            ),
        });
      } catch (error) {
        console.error(
          "fetchInterviews:",
          error
        );

        setInterviews([]);

        toast.error(
          error?.message ||
            "Unable to load interviews."
        );
      } finally {
        setLoading(false);
      }
    }, [
      API_BASE,
      page,
      activeSection,
      debouncedSearch,
      filters,
    ]);

  /* ------------------------------------------------------------------------ */
  /* INITIAL FETCH                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  /* ------------------------------------------------------------------------ */
  /* FILTER HANDLERS                                                          */
  /* ------------------------------------------------------------------------ */

  const updateFilter = (
    name,
    value
  ) => {
    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

    setPage(1);
  };

  const clearFilters = () => {
    setFilters(initialFilters);

    setSearch("");

    setDebouncedSearch("");

    setPage(1);
  };

  const activeFilters =
    useMemo(() => {
      return Object.entries(
        filters
      )
        .filter(([, value]) =>
          Boolean(value)
        )
        .map(([key, value]) => ({
          key,
          value,
        }));
    }, [filters]);

  /* ------------------------------------------------------------------------ */
  /* FILTER OPTIONS                                                           */
  /* ------------------------------------------------------------------------ */

  const companyOptions =
    useMemo(
      () => [
        {
          value: "",
          label:
            "All Companies",
        },

        ...filtersData.companies.map(
          (value) => ({
            value,
            label: value,
          })
        ),
      ],
      [
        filtersData.companies,
      ]
    );

  const roleOptions =
    useMemo(
      () => [
        {
          value: "",
          label: "All Roles",
        },

        ...filtersData.roles.map(
          (value) => ({
            value,
            label: value,
          })
        ),
      ],
      [filtersData.roles]
    );

  const locationOptions =
    useMemo(
      () => [
        {
          value: "",
          label:
            "All Locations",
        },

        ...filtersData.locations.map(
          (value) => ({
            value,
            label: value,
          })
        ),
      ],
      [
        filtersData.locations,
      ]
    );

  const topicOptions =
    useMemo(
      () => [
        {
          value: "",
          label: "All Topics",
        },

        ...filtersData.topics.map(
          (value) => ({
            value,
            label: value,
          })
        ),
      ],
      [filtersData.topics]
    );

  const technologyOptions =
    useMemo(
      () => [
        {
          value: "",
          label:
            "All Technologies",
        },

        ...filtersData.technologies.map(
          (value) => ({
            value,
            label: value,
          })
        ),
      ],
      [
        filtersData.technologies,
      ]
    );

  /* ------------------------------------------------------------------------ */
  /* ACTIVE SECTION                                                           */
  /* ------------------------------------------------------------------------ */

  const activeSectionData =
    FEED_SECTIONS.find(
      (section) =>
        section.value ===
        activeSection
    ) || FEED_SECTIONS[0];

  /* ------------------------------------------------------------------------ */
  /* SEO STRUCTURED DATA                                                      */
  /* ------------------------------------------------------------------------ */

  const structuredData =
    useMemo(() => {
      const interviewItems =
        interviews
          .filter(
            isPublishedInterview
          )
          .filter(
            (interview) =>
              Boolean(
                interview?.slug
              )
          )
          .slice(0, 25)
          .map(
            (
              interview,
              index
            ) => ({
              "@type":
                "ListItem",

              position:
                index + 1,

              url: `${SITE_URL}/interview/${encodeURIComponent(
                interview.slug
              )}`,

              name:
                interview?.title ||
                `${
                  interview
                    ?.company
                    ?.name ||
                  "Software Engineering"
                } Interview Experience`,
            })
          );

      return {
        "@context":
          "https://schema.org",

        "@graph": [
          {
            "@type":
              "Organization",

            "@id": `${SITE_URL}/#organization`,

            name: SITE_NAME,

            url: SITE_URL,
          },

          {
            "@type":
              "WebSite",

            "@id": `${SITE_URL}/#website`,

            name: SITE_NAME,

            url: SITE_URL,

            publisher: {
              "@id": `${SITE_URL}/#organization`,
            },
          },

          {
            "@type":
              "CollectionPage",

            "@id": `${PAGE_URL}#webpage`,

            url: PAGE_URL,

            name: SEO_TITLE,

            description:
              SEO_DESCRIPTION,

            isPartOf: {
              "@id": `${SITE_URL}/#website`,
            },

            about: [
              "Software Engineering Interviews",
              "SDE Interviews",
              "Backend Engineering Interviews",
              "System Design Interviews",
              "AI Engineering Interviews",
              "GenAI Interviews",
              "Interview Compensation",
            ],

            breadcrumb: {
              "@id": `${PAGE_URL}#breadcrumb`,
            },

            mainEntity: {
              "@id": `${PAGE_URL}#interview-list`,
            },
          },

          {
            "@type":
              "BreadcrumbList",

            "@id": `${PAGE_URL}#breadcrumb`,

            itemListElement: [
              {
                "@type":
                  "ListItem",

                position: 1,

                name: "Home",

                item: SITE_URL,
              },

              {
                "@type":
                  "ListItem",

                position: 2,

                name:
                  "Interview Experiences",

                item: PAGE_URL,
              },
            ],
          },

          {
            "@type":
              "ItemList",

            "@id": `${PAGE_URL}#interview-list`,

            name:
              "Software Engineering Interview Experiences",

            numberOfItems:
              interviewItems.length,

            itemListElement:
              interviewItems,
          },
        ],
      };
    }, [interviews]);

  /* ------------------------------------------------------------------------ */
  /* PAGE CHANGE                                                              */
  /* ------------------------------------------------------------------------ */

  const changePage = (
    nextPage
  ) => {
    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      {/* -------------------------------------------------------------- */}
      {/* SEO                                                            */}
      {/* -------------------------------------------------------------- */}

      <Helmet
        htmlAttributes={{
          lang: "en",
        }}
      >
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
          name="author"
          content={SITE_NAME}
        />

        <meta
          name="application-name"
          content={SITE_NAME}
        />

        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <meta
          name="googlebot"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />

        <meta
          name="theme-color"
          content={
            isDark
              ? "#020617"
              : "#ffffff"
          }
        />

        <meta
          name="color-scheme"
          content={
            isDark
              ? "dark"
              : "light"
          }
        />

        <link
          rel="canonical"
          href={PAGE_URL}
        />

        {/* OPEN GRAPH */}

        <meta
          property="og:type"
          content="website"
        />

        <meta
          property="og:site_name"
          content={SITE_NAME}
        />

        <meta
          property="og:locale"
          content="en_IN"
        />

        <meta
          property="og:title"
          content={SEO_TITLE}
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

        {/* TWITTER */}

        <meta
          name="twitter:card"
          content="summary"
        />

        <meta
          name="twitter:title"
          content={SEO_TITLE}
        />

        <meta
          name="twitter:description"
          content={
            SEO_DESCRIPTION
          }
        />

        {/* STRUCTURED DATA */}

        <script
          type="application/ld+json"
        >
          {JSON.stringify(
            structuredData
          )}
        </script>
      </Helmet>

      {/* -------------------------------------------------------------- */}
      {/* PAGE                                                           */}
      {/* -------------------------------------------------------------- */}

      <div
        className={`min-h-screen overflow-x-hidden pt-20 transition-colors duration-300 sm:pt-24 ${
          isDark
            ? "bg-slate-950 text-white"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        {/* ------------------------------------------------------------ */}
        {/* HEADER                                                       */}
        {/* ------------------------------------------------------------ */}

        <header
          className={`border-b ${
            isDark
              ? "border-slate-800 bg-slate-950"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
            {/* BREADCRUMB */}

            <nav
              aria-label="Breadcrumb"
              className={`mb-5 text-xs font-semibold ${
                isDark
                  ? "text-slate-500"
                  : "text-slate-500"
              }`}
            >
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link
                    to="/"
                    className="transition hover:text-blue-500"
                  >
                    Home
                  </Link>
                </li>

                <li
                  aria-hidden="true"
                >
                  /
                </li>

                <li
                  aria-current="page"
                  className={
                    isDark
                      ? "text-slate-300"
                      : "text-slate-700"
                  }
                >
                  Interview
                  Experiences
                </li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-blue-500">
                <BriefcaseBusiness className="h-4 w-4" />

                Target Trek
                Interviews
              </div>

              <h1
                className={`mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                Real Software
                Engineering Interview
                Experiences
              </h1>

              <p
                className={`mt-4 max-w-3xl text-sm leading-7 sm:text-base lg:text-lg ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Discover real
                interview rounds,
                coding questions,
                DSA, Low-Level
                Design, High-Level
                Design, backend,
                AI, GenAI and
                compensation
                experiences shared
                by engineers.
              </p>
            </div>

            {/* SEARCH */}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search
                  aria-hidden="true"
                  className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${
                    isDark
                      ? "text-slate-500"
                      : "text-slate-400"
                  }`}
                />

                <input
                  type="search"
                  value={search}
                  aria-label="Search interview experiences"
                  onChange={(
                    event
                  ) =>
                    setSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search company, role, Java, System Design, RAG..."
                  className={`min-h-[50px] w-full rounded-xl border py-3 pl-12 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:rounded-2xl ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500"
                      : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400"
                  }`}
                />

                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() =>
                      setSearch("")
                    }
                    className={`absolute right-4 top-1/2 -translate-y-1/2 rounded-md p-1 ${
                      isDark
                        ? "text-slate-500 hover:text-white"
                        : "text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/interview/create"
                  )
                }
                className="inline-flex min-h-[50px] w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 sm:w-auto sm:rounded-2xl"
              >
                <Plus className="h-4 w-4" />

                Share Interview
              </button>
            </div>
          </div>
        </header>

        {/* ------------------------------------------------------------ */}
        {/* FEED NAV                                                     */}
        {/* ------------------------------------------------------------ */}

        <nav
          aria-label="Interview feed categories"
          className={`sticky top-0 z-30 border-b backdrop-blur-xl ${
            isDark
              ? "border-slate-800 bg-slate-950/95"
              : "border-slate-200 bg-white/95"
          }`}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              role="tablist"
              aria-label="Interview categories"
              className="flex snap-x snap-mandatory gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {FEED_SECTIONS.map(
                (section) => {
                  const Icon =
                    section.icon;

                  const active =
                    activeSection ===
                    section.value;

                  return (
                    <button
                      key={
                        section.value
                      }
                      type="button"
                      role="tab"
                      aria-selected={
                        active
                      }
                      onClick={() => {
                        setActiveSection(
                          section.value
                        );

                        setPage(1);
                      }}
                      className={`flex shrink-0 snap-start items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                        active
                          ? "bg-blue-600 text-white shadow-sm"
                          : isDark
                            ? "text-slate-400 hover:bg-slate-900 hover:text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <Icon className="h-4 w-4" />

                      {section.label}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </nav>

        {/* ------------------------------------------------------------ */}
        {/* CONTENT                                                      */}
        {/* ------------------------------------------------------------ */}

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* SECTION HEADER */}

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                className={`text-xl font-black sm:text-2xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-950"
                }`}
              >
                {
                  activeSectionData.label
                }
              </h2>

              <p
                className={`mt-1 max-w-2xl text-xs leading-5 sm:text-sm ${
                  isDark
                    ? "text-slate-500"
                    : "text-slate-500"
                }`}
              >
                {
                  activeSectionData.description
                }
              </p>
            </div>

            <button
              type="button"
              aria-expanded={
                filtersOpen
              }
              onClick={() =>
                setFiltersOpen(
                  (previous) =>
                    !previous
                )
              }
              className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition sm:w-auto ${
                isDark
                  ? "border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
                  : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              <Filter className="h-4 w-4" />

              Filters

              {activeFilters.length >
                0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] text-white">
                  {
                    activeFilters.length
                  }
                </span>
              )}
            </button>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* FILTER PANEL                                               */}
          {/* ---------------------------------------------------------- */}

          {filtersOpen && (
            <section
              aria-label="Interview filters"
              className={`mb-6 rounded-2xl border p-4 sm:rounded-3xl sm:p-5 ${
                isDark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <FilterSelect
                  label="Company"
                  value={
                    filters.company
                  }
                  onChange={(
                    value
                  ) =>
                    updateFilter(
                      "company",
                      value
                    )
                  }
                  options={
                    companyOptions
                  }
                  isDark={isDark}
                />

                <FilterSelect
                  label="Role"
                  value={
                    filters.role
                  }
                  onChange={(
                    value
                  ) =>
                    updateFilter(
                      "role",
                      value
                    )
                  }
                  options={
                    roleOptions
                  }
                  isDark={isDark}
                />

                <FilterSelect
                  label="Location"
                  value={
                    filters.location
                  }
                  onChange={(
                    value
                  ) =>
                    updateFilter(
                      "location",
                      value
                    )
                  }
                  options={
                    locationOptions
                  }
                  isDark={isDark}
                />

                <FilterSelect
                  label="Result"
                  value={
                    filters.result
                  }
                  onChange={(
                    value
                  ) =>
                    updateFilter(
                      "result",
                      value
                    )
                  }
                  options={
                    RESULT_OPTIONS
                  }
                  isDark={isDark}
                />

                <FilterSelect
                  label="Difficulty"
                  value={
                    filters.difficulty
                  }
                  onChange={(
                    value
                  ) =>
                    updateFilter(
                      "difficulty",
                      value
                    )
                  }
                  options={
                    DIFFICULTY_OPTIONS
                  }
                  isDark={isDark}
                />

                <FilterSelect
                  label="Topic"
                  value={
                    filters.topic
                  }
                  onChange={(
                    value
                  ) =>
                    updateFilter(
                      "topic",
                      value
                    )
                  }
                  options={
                    topicOptions
                  }
                  isDark={isDark}
                />

                <FilterSelect
                  label="Technology"
                  value={
                    filters.technology
                  }
                  onChange={(
                    value
                  ) =>
                    updateFilter(
                      "technology",
                      value
                    )
                  }
                  options={
                    technologyOptions
                  }
                  isDark={isDark}
                />
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="rounded-lg px-2 py-1 text-xs font-bold text-red-500 transition hover:bg-red-500/10 hover:text-red-600"
                >
                  Clear all filters
                </button>
              </div>
            </section>
          )}

          {/* ACTIVE FILTERS */}

          {activeFilters.length >
            0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {activeFilters.map(
                ({
                  key,
                  value,
                }) => (
                  <button
                    key={`${key}-${value}`}
                    type="button"
                    onClick={() =>
                      updateFilter(
                        key,
                        ""
                      )
                    }
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      isDark
                        ? "bg-blue-950/60 text-blue-300"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {formatLabel(
                      value
                    )}

                    <X className="h-3 w-3" />
                  </button>
                )
              )}
            </div>
          )}

          {/* ---------------------------------------------------------- */}
          {/* FEED + SIDEBAR                                             */}
          {/* ---------------------------------------------------------- */}

          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_290px] xl:grid-cols-[minmax(0,1fr)_310px]">
            {/* FEED */}

            <section
              aria-label={`${activeSectionData.label} interview experiences`}
              className="min-w-0 space-y-4"
            >
              {loading ? (
                <>
                  <InterviewSkeleton
                    isDark={isDark}
                  />

                  <InterviewSkeleton
                    isDark={isDark}
                  />

                  <InterviewSkeleton
                    isDark={isDark}
                  />
                </>
              ) : interviews.length ===
                0 ? (
                <div
                  className={`rounded-2xl border px-5 py-14 text-center sm:rounded-3xl sm:py-16 ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Search
                    aria-hidden="true"
                    className={`mx-auto h-8 w-8 ${
                      isDark
                        ? "text-slate-600"
                        : "text-slate-300"
                    }`}
                  />

                  <h3
                    className={`mt-4 font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    No interview
                    experiences found
                  </h3>

                  <p
                    className={`mx-auto mt-2 max-w-md text-sm leading-6 ${
                      isDark
                        ? "text-slate-500"
                        : "text-slate-500"
                    }`}
                  >
                    Try another
                    search, choose
                    another category
                    or remove some of
                    the filters.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                interviews.map(
                  (
                    interview
                  ) => (
                    <InterviewCard
                      key={
                        interview?._id ||
                        interview?.slug
                      }
                      interview={
                        interview
                      }
                      isDark={
                        isDark
                      }
                    />
                  )
                )
              )}

              {/* PAGINATION */}

              {!loading &&
                pagination.totalPages >
                  1 && (
                  <nav
                    aria-label="Interview pagination"
                    className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                      isDark
                        ? "border-slate-800 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <p
                      className={`text-xs ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-500"
                      }`}
                    >
                      Page{" "}
                      {
                        pagination.page
                      }{" "}
                      of{" "}
                      {
                        pagination.totalPages
                      }
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <button
                        type="button"
                        disabled={
                          !pagination.hasPreviousPage
                        }
                        onClick={() =>
                          changePage(
                            Math.max(
                              1,
                              page - 1
                            )
                          )
                        }
                        className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          isDark
                            ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <ChevronLeft className="h-4 w-4" />

                        Previous
                      </button>

                      <button
                        type="button"
                        disabled={
                          !pagination.hasNextPage
                        }
                        onClick={() =>
                          changePage(
                            page + 1
                          )
                        }
                        className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                          isDark
                            ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                            : "border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        Next

                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </nav>
                )}
            </section>

            {/* -------------------------------------------------------- */}
            {/* SIDEBAR                                                  */}
            {/* -------------------------------------------------------- */}

            <aside className="min-w-0 space-y-4 lg:sticky lg:top-24 lg:self-start">
              {/* SHARE CTA */}

              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-5 text-white shadow-lg sm:rounded-3xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                  <Plus className="h-5 w-5" />
                </div>

                <h2 className="mt-4 text-lg font-black">
                  Had an interview
                  recently?
                </h2>

                <p className="mt-2 text-sm leading-6 text-blue-100">
                  Share your
                  interview rounds,
                  questions and
                  experience to help
                  other engineers
                  prepare. You can
                  also publish
                  anonymously.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/interview/create"
                    )
                  }
                  className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                >
                  Add Interview
                  Experience
                </button>
              </div>

              {/* POPULAR TOPICS */}

              {filtersData.topics
                .length > 0 && (
                <section
                  className={`rounded-2xl border p-5 sm:rounded-3xl ${
                    isDark
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <h2
                    className={`text-sm font-black ${
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    Popular Interview
                    Topics
                  </h2>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {filtersData.topics
                      .slice(0, 10)
                      .map(
                        (
                          topic
                        ) => (
                          <button
                            type="button"
                            key={
                              topic
                            }
                            onClick={() =>
                              updateFilter(
                                "topic",
                                topic
                              )
                            }
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${
                              filters.topic ===
                              topic
                                ? "bg-blue-600 text-white"
                                : isDark
                                  ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                  : "bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                            }`}
                          >
                            {
                              topic
                            }
                          </button>
                        )
                      )}
                  </div>
                </section>
              )}

              {/* DISCLAIMER */}

              <section
                className={`rounded-2xl border p-5 sm:rounded-3xl ${
                  isDark
                    ? "border-slate-800 bg-slate-900"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />

                  <div>
                    <h2
                      className={`text-sm font-black ${
                        isDark
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      Community
                      Interview
                      Experiences
                    </h2>

                    <p
                      className={`mt-2 text-xs leading-5 ${
                        isDark
                          ? "text-slate-500"
                          : "text-slate-500"
                      }`}
                    >
                      Interview
                      processes can
                      differ by team,
                      interviewer,
                      location, role
                      and hiring
                      cycle. Use each
                      experience as a
                      preparation
                      reference rather
                      than an exact
                      hiring process.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </>
  );
};

export default InterviewFeed;