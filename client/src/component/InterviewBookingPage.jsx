// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import { createPortal } from "react-dom";

// import {
//   AnimatePresence,
//   motion,
// } from "framer-motion";

// import {
//   ArrowRight,
//   ArrowLeft,
//   CalendarDays,
//   Clock3,
//   CheckCircle2,
//   X,
//   ShieldCheck,
//   Video,
//   Code2,
//   Layers3,
//   Network,
//   BrainCircuit,
//   BriefcaseBusiness,
//   MessageSquareText,
//   LoaderCircle,
//   LockKeyhole,
//   CreditCard,
//   Sparkles,
//   AlertCircle,
//   Check,
//   Mail,
//   RefreshCw,
//   ChevronRight,
//   HelpCircle,
// } from "lucide-react";

// /* =========================================================
//    CONFIGURATION
// ========================================================= */

// const BASE_URL = (
//   import.meta.env.VITE_BASE_URL ||
//   "http://localhost:5001"
// ).replace(/\/+$/, "");

// const API = `${BASE_URL}/api/interviews`;

// const PAYMENT_STATUS_PATH =
//   "/mock-interviews/payment-status";

// const TIMEZONE = "Asia/Kolkata";

// const SUPPORT_EMAIL =
//   "supporttargettrek@gmail.com";

// const DEFAULT_CASHFREE_MODE =
//   import.meta.env.VITE_CASHFREE_ENV ===
//   "production"
//     ? "production"
//     : "sandbox";

// /* =========================================================
//    INTERVIEW TOPICS
// ========================================================= */

// const TOPIC_INFO = {
//   DSA: {
//     title: "Data Structures & Algorithms",
//     description:
//       "Coding questions, problem solving, complexity analysis and edge cases.",
//     Icon: Code2,
//   },

//   LLD: {
//     title: "Low-Level Design",
//     description:
//       "Object-oriented design, SOLID, design patterns and concurrency.",
//     Icon: Layers3,
//   },

//   HLD: {
//     title: "High-Level System Design",
//     description:
//       "Distributed systems, scalability, caching, databases and architecture.",
//     Icon: Network,
//   },

//   GENAI: {
//     title: "Generative AI Engineering",
//     description:
//       "RAG, AI agents, LLMs, evaluation and production GenAI systems.",
//     Icon: BrainCircuit,
//   },

//   PROJECTS: {
//     title: "Project Discussion",
//     description:
//       "Project architecture, technical decisions, impact and trade-offs.",
//     Icon: BriefcaseBusiness,
//   },
// };

// const ALL_TOPICS = Object.keys(
//   TOPIC_INFO
// );

// /* =========================================================
//    THEME

//    Uses the theme from your Navbar.
//    No duplicate theme toggle.
// ========================================================= */

// function readTheme() {
//   if (typeof window === "undefined") {
//     return "light";
//   }

//   try {
//     const saved =
//       localStorage.getItem("theme");

//     if (
//       saved === "light" ||
//       saved === "dark"
//     ) {
//       return saved;
//     }

//     return document.documentElement.classList
//       .contains("dark")
//       ? "dark"
//       : "light";
//   } catch {
//     return "light";
//   }
// }

// function useNavbarTheme() {
//   const [theme, setTheme] =
//     useState(readTheme);

//   useEffect(() => {
//     const sync = () => {
//       setTheme(readTheme());
//     };

//     window.addEventListener(
//       "storage",
//       sync
//     );

//     window.addEventListener(
//       "themechange",
//       sync
//     );

//     window.addEventListener(
//       "targettrek-theme-change",
//       sync
//     );

//     const observer =
//       new MutationObserver(sync);

//     observer.observe(
//       document.documentElement,
//       {
//         attributes: true,
//         attributeFilter: [
//           "class",
//           "data-theme",
//         ],
//       }
//     );

//     return () => {
//       window.removeEventListener(
//         "storage",
//         sync
//       );

//       window.removeEventListener(
//         "themechange",
//         sync
//       );

//       window.removeEventListener(
//         "targettrek-theme-change",
//         sync
//       );

//       observer.disconnect();
//     };
//   }, []);

//   return theme;
// }

// /* =========================================================
//    DATE HELPERS — IST
// ========================================================= */

// function fmtDate(value, options = {}) {
//   if (!value) return "—";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return "—";
//   }

//   return new Intl.DateTimeFormat(
//     "en-IN",
//     {
//       timeZone: TIMEZONE,
//       ...options,
//     }
//   ).format(date);
// }

// function fmtTime(value) {
//   return fmtDate(value, {
//     hour: "numeric",
//     minute: "2-digit",
//     hour12: true,
//   });
// }

// function fmtMoney(
//   value,
//   currency = "INR"
// ) {
//   const amount = Number(value);

//   if (!Number.isFinite(amount)) {
//     return "—";
//   }

//   try {
//     return new Intl.NumberFormat(
//       "en-IN",
//       {
//         style: "currency",
//         currency: currency || "INR",
//         maximumFractionDigits: 2,
//       }
//     ).format(amount);
//   } catch {
//     return `₹${amount}`;
//   }
// }

// function dateKey(date) {
//   const parts = new Intl.DateTimeFormat(
//     "en-US",
//     {
//       timeZone: TIMEZONE,
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//     }
//   ).formatToParts(date);

//   const get = (type) =>
//     parts.find(
//       (part) => part.type === type
//     )?.value;

//   return [
//     get("year"),
//     get("month"),
//     get("day"),
//   ].join("-");
// }

// function upcomingDays() {
//   const result = [];
//   const seen = new Set();
//   const now = new Date();

//   for (
//     let i = 0;
//     result.length < 8 && i < 22;
//     i++
//   ) {
//     const date = new Date(
//       now.getTime() +
//         i * 12 * 60 * 60 * 1000
//     );

//     const key = dateKey(date);

//     if (!seen.has(key)) {
//       seen.add(key);

//       result.push({
//         key,
//         date,
//       });
//     }
//   }

//   return result;
// }

// function selectedDateLabel(day) {
//   if (!day) return "";

//   return fmtDate(
//     `${day}T12:00:00+05:30`,
//     {
//       weekday: "long",
//       day: "numeric",
//       month: "long",
//       year: "numeric",
//     }
//   );
// }

// function paymentStatusUrl(bookingId) {
//   return (
//     `${PAYMENT_STATUS_PATH}?bookingId=` +
//     encodeURIComponent(bookingId)
//   );
// }

// /* =========================================================
//    PUBLIC API HELPER

//    IMPORTANT:
//    - NO JWT
//    - NO ACCOUNT LOGIN
//    - NO AUTHORIZATION HEADER
//    - NO AUTH REDIRECT

//    Uses the public Express endpoints.
// ========================================================= */

// async function apiRequest(
//   path,
//   {
//     method = "GET",
//     body,
//     signal,
//   } = {}
// ) {
//   const headers = {
//     Accept: "application/json",
//   };

//   if (body !== undefined) {
//     headers["Content-Type"] =
//       "application/json";
//   }

//   const response = await fetch(
//     `${API}${path}`,
//     {
//       method,
//       headers,
//       signal,
//       cache: "no-store",
//       ...(body !== undefined
//         ? {
//             body: JSON.stringify(body),
//           }
//         : {}),
//     }
//   );

//   const data = await response
//     .json()
//     .catch(() => ({}));

//   if (
//     !response.ok ||
//     data.success === false
//   ) {
//     const error = new Error(
//       data.message ||
//         `Request failed (${response.status})`
//     );

//     error.status = response.status;
//     error.code = data.code;

//     throw error;
//   }

//   return data;
// }

// /* =========================================================
//    CASHFREE SDK

//    SDK is loaded only when payment starts.
// ========================================================= */

// let cashfreeLoadPromise = null;

// function loadCashfreeSDK() {
//   if (typeof window === "undefined") {
//     return Promise.reject(
//       new Error(
//         "Cashfree checkout requires a browser."
//       )
//     );
//   }

//   if (window.Cashfree) {
//     return Promise.resolve(
//       window.Cashfree
//     );
//   }

//   if (!cashfreeLoadPromise) {
//     cashfreeLoadPromise = new Promise(
//       (resolve, reject) => {
//         const src =
//           "https://sdk.cashfree.com/js/v3/cashfree.js";

//         let script =
//           document.querySelector(
//             `script[src="${src}"]`
//           );

//         if (!script) {
//           script =
//             document.createElement(
//               "script"
//             );

//           script.src = src;
//           script.async = true;
//         }

//         const onLoad = () => {
//           if (window.Cashfree) {
//             resolve(window.Cashfree);
//           } else {
//             reject(
//               new Error(
//                 "Cashfree SDK is unavailable."
//               )
//             );
//           }
//         };

//         const onError = () => {
//           reject(
//             new Error(
//               "Unable to load Cashfree checkout."
//             )
//           );
//         };

//         script.addEventListener(
//           "load",
//           onLoad,
//           { once: true }
//         );

//         script.addEventListener(
//           "error",
//           onError,
//           { once: true }
//         );

//         if (!script.isConnected) {
//           document.head.appendChild(
//             script
//           );
//         }

//         if (window.Cashfree) {
//           resolve(window.Cashfree);
//         }
//       }
//     ).catch((error) => {
//       cashfreeLoadPromise = null;
//       throw error;
//     });
//   }

//   return cashfreeLoadPromise;
// }

// /* =========================================================
//    FORM DATA
// ========================================================= */

// const emptyCandidate = {
//   name: "",
//   email: "",
//   phone: "",
//   experienceYears: "",
//   currentRole: "",
//   targetRole: "",
//   currentCompany: "",
//   resumeUrl: "",
//   notes: "",
// };

// function validateCandidate(candidate) {
//   if (
//     candidate.name.trim().length < 2
//   ) {
//     return "Please enter your full name.";
//   }

//   if (
//     !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
//       candidate.email.trim()
//     )
//   ) {
//     return "Please enter a valid email address.";
//   }

//   const phone =
//     candidate.phone.replace(
//       /[\s()-]/g,
//       ""
//     );

//   if (!/^\+?\d{10,15}$/.test(phone)) {
//     return "Please enter a valid phone number.";
//   }

//   if (
//     candidate.experienceYears !== ""
//   ) {
//     const years = Number(
//       candidate.experienceYears
//     );

//     if (
//       !Number.isFinite(years) ||
//       years < 0 ||
//       years > 50
//     ) {
//       return "Experience must be between 0 and 50 years.";
//     }
//   }

//   if (candidate.resumeUrl.trim()) {
//     try {
//       const url = new URL(
//         candidate.resumeUrl.trim()
//       );

//       if (
//         !["http:", "https:"].includes(
//           url.protocol
//         )
//       ) {
//         return "Enter a valid resume URL.";
//       }
//     } catch {
//       return "Enter a valid resume URL.";
//     }
//   }

//   return "";
// }

// /* =========================================================
//    SCOPED STYLES

//    Compatible with:
//    - Light theme
//    - Dark theme
//    - Mobile
//    - Tablet
//    - Desktop
// ========================================================= */

// const styles = `
// .tt-ib {
//   --ib-bg: #fffcf8;
//   --ib-surface: #ffffff;
//   --ib-alt: #fff4e8;
//   --ib-text: #28211d;
//   --ib-muted: #74665c;
//   --ib-border: #eadfd4;
//   --ib-orange: #ea580c;
//   --ib-orange-light: #ffedd5;
//   --ib-input: #ffffff;
//   --ib-green: #166534;
//   --ib-green-bg: #ecfdf3;
//   --ib-red: #b91c1c;
//   --ib-red-bg: #fef2f2;

//   background: var(--ib-bg);
//   color: var(--ib-text);
//   font-family: Inter, system-ui, sans-serif;
//   color-scheme: light;
//   min-height: 100vh;
// }

// .tt-ib[data-ib-theme="dark"] {
//   --ib-bg: #15110e;
//   --ib-surface: #231c17;
//   --ib-alt: #302118;
//   --ib-text: #fff8f1;
//   --ib-muted: #c2b1a4;
//   --ib-border: #49372c;
//   --ib-orange: #fb923c;
//   --ib-orange-light: #38261a;
//   --ib-input: #291f19;
//   --ib-green: #86efac;
//   --ib-green-bg: #153424;
//   --ib-red: #fca5a5;
//   --ib-red-bg: #3b1e20;

//   color-scheme: dark;
// }

// .tt-ib *,
// .tt-ib *::before,
// .tt-ib *::after {
//   box-sizing: border-box;
// }

// .tt-ib .ib-card {
//   background: var(--ib-surface);
//   border: 1px solid var(--ib-border);
//   color: var(--ib-text);
// }

// .tt-ib .ib-panel {
//   background: var(--ib-alt);
// }

// .tt-ib .ib-muted {
//   color: var(--ib-muted);
// }

// .tt-ib .ib-orange {
//   color: var(--ib-orange);
// }

// .tt-ib .ib-field {
//   width: 100%;
//   background: var(--ib-input);
//   color: var(--ib-text);
//   border: 1px solid var(--ib-border);
//   border-radius: 12px;
//   padding: 12px 13px;
//   font-size: 14px;
//   outline: none;
// }

// .tt-ib .ib-field:focus {
//   border-color: var(--ib-orange);
//   box-shadow: 0 0 0 3px rgba(234,88,12,.13);
// }

// .tt-ib .ib-field::placeholder {
//   color: var(--ib-muted);
//   opacity: .75;
// }

// .tt-ib .ib-primary {
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   gap: 9px;
//   background: #ea580c;
//   color: #ffffff !important;
//   border: 1px solid #ea580c;
//   border-radius: 12px;
//   padding: 12px 18px;
//   font-size: 13px;
//   font-weight: 800;
//   cursor: pointer;
//   text-decoration: none;
//   transition: .18s ease;
// }

// .tt-ib .ib-primary:hover:not(:disabled) {
//   background: #c2410c;
// }

// .tt-ib .ib-outline {
//   display: inline-flex;
//   align-items: center;
//   justify-content: center;
//   gap: 8px;
//   background: var(--ib-surface);
//   color: var(--ib-text);
//   border: 1px solid var(--ib-border);
//   border-radius: 12px;
//   padding: 11px 15px;
//   font-size: 13px;
//   font-weight: 750;
//   cursor: pointer;
//   text-decoration: none;
//   transition: .18s ease;
// }

// .tt-ib .ib-outline:hover:not(:disabled) {
//   border-color: var(--ib-orange);
// }

// .tt-ib button:disabled {
//   opacity: .52;
//   cursor: not-allowed;
// }

// .tt-ib .ib-selected {
//   border-color: var(--ib-orange) !important;
//   background: var(--ib-alt) !important;
// }

// .tt-ib .ib-status-available {
//   background: var(--ib-green-bg);
//   color: var(--ib-green);
// }

// .tt-ib .ib-status-unavailable {
//   background: var(--ib-red-bg);
//   color: var(--ib-red);
// }

// .tt-ib .ib-status-held {
//   background: var(--ib-orange-light);
//   color: var(--ib-orange);
// }

// .tt-ib .ib-input-label {
//   display: block;
//   font-size: 12px;
//   font-weight: 750;
//   margin-bottom: 7px;
// }

// .tt-ib .ib-progress {
//   height: 6px;
//   background: var(--ib-border);
//   border-radius: 999px;
// }

// .tt-ib .ib-progress-active {
//   background: #ea580c;
// }

// .tt-ib .ib-overlay {
//   background: rgba(8,5,3,.86) !important;
// }

// .tt-ib .ib-modal-surface {
//   background: var(--ib-surface) !important;
//   color: var(--ib-text) !important;
//   isolation: isolate;
//   box-shadow: 0 35px 115px rgba(0,0,0,.5);
// }

// .tt-ib .ib-error {
//   background: var(--ib-red-bg);
//   color: var(--ib-red);
//   border: 1px solid var(--ib-border);
// }

// .tt-ib .ib-recovery {
//   background: var(--ib-orange-light);
//   border: 1px solid var(--ib-border);
// }

// .tt-ib .ib-modal-scroll {
//   scrollbar-width: thin;
//   scrollbar-color: var(--ib-border) transparent;
//   overscroll-behavior: contain;
// }

// .tt-ib a {
//   text-decoration: none;
// }

// .tt-ib button,
// .tt-ib input,
// .tt-ib textarea {
//   font: inherit;
// }

// .tt-ib .ib-day:hover,
// .tt-ib .ib-slot:hover {
//   border-color: var(--ib-orange);
// }

// .tt-ib .ib-slot {
//   transition: border-color .18s, transform .18s;
// }

// .tt-ib .ib-slot:hover:not(:disabled) {
//   transform: translateY(-2px);
// }

// @media (max-width: 640px) {
//   .tt-ib .ib-modal-surface {
//     border-bottom-left-radius: 0;
//     border-bottom-right-radius: 0;
//   }
// }

// @media (prefers-reduced-motion: reduce) {
//   .tt-ib *,
//   .tt-ib *::before,
//   .tt-ib *::after {
//     scroll-behavior: auto !important;
//     transition-duration: 0.01ms !important;
//     animation-duration: 0.01ms !important;
//   }
// }
// `;

// /* =========================================================
//    SHARED COMPONENTS
// ========================================================= */

// function StatusPill({ slot }) {
//   const status =
//     String(slot.status || "AVAILABLE")
//       .toUpperCase();

//   let label = "Unavailable";
//   let className =
//     "ib-status-unavailable";

//   if (status === "AVAILABLE") {
//     label = "Available";
//     className =
//       "ib-status-available";
//   } else if (status === "BOOKED") {
//     label = "Booked";
//   } else if (status === "HELD") {
//     label = "Reserved";
//     className =
//       "ib-status-held";
//   } else if (status === "BLOCKED") {
//     label = "Blocked";
//   }

//   return (
//     <span
//       className={
//         `rounded-full px-2.5 py-1 text-[11px] font-extrabold ${className}`
//       }
//     >
//       {label}
//     </span>
//   );
// }

// function Progress({ step }) {
//   const steps = [
//     "Topics",
//     "Your details",
//     "Payment",
//   ];

//   return (
//     <div className="grid grid-cols-3 gap-2">
//       {steps.map((name, index) => (
//         <div
//           key={name}
//           className="space-y-2"
//         >
//           <div
//             className={
//               index <= step
//                 ? "ib-progress ib-progress-active"
//                 : "ib-progress"
//             }
//           />

//           <span
//             className={
//               `text-[11px] ${
//                 index === step
//                   ? "font-extrabold ib-orange"
//                   : "ib-muted"
//               }`
//             }
//           >
//             {index + 1}. {name}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// }

// function TopicCard({
//   topic,
//   selected,
//   disabled,
//   onClick,
// }) {
//   const info = TOPIC_INFO[topic];

//   if (!info) return null;

//   const Icon = info.Icon;

//   return (
//     <button
//       type="button"
//       disabled={disabled}
//       onClick={onClick}
//       aria-pressed={selected}
//       className={
//         `ib-card flex items-start gap-3 rounded-xl p-4 text-left ${
//           selected ? "ib-selected" : ""
//         }`
//       }
//     >
//       <span className="ib-panel rounded-lg p-2">
//         <Icon
//           size={18}
//           className="ib-orange"
//         />
//       </span>

//       <span className="min-w-0 flex-1">
//         <strong className="block text-sm">
//           {info.title}
//         </strong>

//         <span className="ib-muted mt-1 block text-xs leading-5">
//           {info.description}
//         </span>
//       </span>

//       {selected && (
//         <CheckCircle2
//           size={18}
//           className="ib-orange shrink-0"
//         />
//       )}
//     </button>
//   );
// }

// function TextField({
//   label,
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   required = false,
//   maxLength,
//   min,
//   max,
//   step,
//   className = "",
// }) {
//   return (
//     <label className={className}>
//       <span className="ib-input-label">
//         {label}
//         {required && " *"}
//       </span>

//       <input
//         type={type}
//         className="ib-field"
//         value={value}
//         onChange={(event) =>
//           onChange(event.target.value)
//         }
//         placeholder={placeholder}
//         required={required}
//         maxLength={maxLength}
//         min={min}
//         max={max}
//         step={step}
//       />
//     </label>
//   );
// }

// /* =========================================================
//    BOOKING MODAL

//    Step 1: Topics
//    Step 2: Candidate details
//    Step 3: Payment

//    NO LOGIN OR TOKEN REQUIRED.
// ========================================================= */

// function BookingModal({
//   slot,
//   onClose,
//   cashfreeMode,
//   theme,
// }) {
//   const [step, setStep] =
//     useState(0);

//   const [topics, setTopics] =
//     useState([]);

//   const [candidate, setCandidate] =
//     useState(emptyCandidate);

//   const [busy, setBusy] =
//     useState(false);

//   const [error, setError] =
//     useState("");

//   const [bookingId, setBookingId] =
//     useState("");

//   const [
//     paymentStarted,
//     setPaymentStarted,
//   ] = useState(false);

//   const processingRef = useRef(false);

//   const availableTopics = (
//     Array.isArray(slot.allowedTopics) &&
//     slot.allowedTopics.length > 0
//       ? slot.allowedTopics
//       : ALL_TOPICS
//   ).filter((topic) =>
//     Boolean(TOPIC_INFO[topic])
//   );

//   const maxTopics = Math.min(
//     Math.max(
//       1,
//       Number(slot.maxTopics) || 3
//     ),
//     availableTopics.length
//   );

//   const priceText = fmtMoney(
//     slot.price,
//     slot.currency
//   );

//   const detailsError =
//     validateCandidate(candidate);

//   const change = (key, value) => {
//     setCandidate((previous) => ({
//       ...previous,
//       [key]: value,
//     }));
//   };

//   const toggleTopic = (topic) => {
//     setTopics((previous) => {
//       if (previous.includes(topic)) {
//         return previous.filter(
//           (item) => item !== topic
//         );
//       }

//       if (
//         previous.length >= maxTopics
//       ) {
//         return previous;
//       }

//       return [...previous, topic];
//     });
//   };

//   useEffect(() => {
//     const previousOverflow =
//       document.body.style.overflow;

//     document.body.style.overflow =
//       "hidden";

//     return () => {
//       document.body.style.overflow =
//         previousOverflow;
//     };
//   }, []);

//   useEffect(() => {
//     const onKeyDown = (event) => {
//       if (
//         event.key === "Escape" &&
//         !busy &&
//         !processingRef.current
//       ) {
//         onClose();
//       }
//     };

//     document.addEventListener(
//       "keydown",
//       onKeyDown
//     );

//     return () => {
//       document.removeEventListener(
//         "keydown",
//         onKeyDown
//       );
//     };
//   }, [busy, onClose]);

//   /* =====================================================
//      PUBLIC CHECKOUT

//      1. Load Cashfree
//      2. Create booking
//      3. Create payment
//      4. Open Cashfree
//      5. Redirect to payment-status

//      No JWT used in any request.
//   ===================================================== */

//   async function checkout() {
//     if (busy || processingRef.current) return;
//     setError("");

//     if (topics.length === 0) {
//       setError("Select at least one interview topic.");
//       setStep(0);
//       return;
//     }

//     const validationError = validateCandidate(candidate);
//     if (validationError) {
//       setError(validationError);
//       setStep(1);
//       return;
//     }

//     // Never create another payment when a gateway order was already started.
//     if (paymentStarted && bookingId) {
//       window.location.assign(paymentStatusUrl(bookingId));
//       return;
//     }

//     processingRef.current = true;
//     setBusy(true);
//     let currentBookingId = bookingId;

//     try {
//       // Preload the same Cashfree v3 SDK used by your book checkout.
//       const Cashfree = await loadCashfreeSDK();
//       if (typeof Cashfree !== "function") {
//         throw new Error("Unable to initialize Cashfree.");
//       }

//       // Guest booking: no JWT, no Authorization header.
//       if (!currentBookingId) {
//         const bookingResponse = await apiRequest("/bookings", {
//           method: "POST",
//           body: {
//             slotId: slot._id,
//             selectedTopics: topics,
//             candidate: {
//               name: candidate.name.trim(),
//               email: candidate.email.trim(),
//               phone: candidate.phone.trim(),
//               experienceYears:
//                 candidate.experienceYears === ""
//                   ? 0
//                   : Number(candidate.experienceYears),
//               currentRole: candidate.currentRole.trim(),
//               targetRole: candidate.targetRole.trim(),
//               currentCompany: candidate.currentCompany.trim(),
//               resumeUrl: candidate.resumeUrl.trim(),
//               notes: candidate.notes.trim(),
//             },
//           },
//         });

//         currentBookingId =
//           bookingResponse?.data?.bookingId ||
//           bookingResponse?.bookingId ||
//           bookingResponse?.data?.booking?.bookingId ||
//           bookingResponse?.booking?.bookingId;

//         if (!currentBookingId) {
//           throw new Error("Booking was created but no booking ID was returned.");
//         }
//         setBookingId(currentBookingId);
//       }

//       // Create order and get session, never manufacture one in the browser.
//       const paymentResponse = await apiRequest(
//         `/bookings/${encodeURIComponent(currentBookingId)}/payment`,
//         { method: "POST" }
//       );

//       const paymentData = paymentResponse?.data || paymentResponse;
//       const gatewayData = paymentData?.gatewayOrder || {};
//       const sessionId =
//         paymentData?.paymentSessionId ||
//         paymentData?.payment_session_id ||
//         gatewayData?.payment_session_id;
//       const orderId =
//         paymentData?.orderId ||
//         paymentData?.order_id ||
//         gatewayData?.order_id;

//       if (typeof sessionId !== "string" || !sessionId.trim()) {
//         console.error("[Interview Cashfree] Missing session", {
//           responseKeys: Object.keys(paymentData || {}),
//           bookingId: currentBookingId,
//           orderId,
//         });
//         throw new Error("Cashfree payment API did not return a valid paymentSessionId.");
//       }

//       // A backend-supplied environment wins, exactly like working book flow.
//       // Otherwise use the Vite environment; preserve explicit prop as fallback.
//       const serverMode = String(
//         paymentData?.environment ||
//         paymentData?.cashfreeEnvironment ||
//         paymentData?.cashfreeMode ||
//         ""
//       ).trim().toLowerCase();
//       const viteMode = String(
//         import.meta.env.VITE_CASHFREE_ENV ||
//         import.meta.env.VITE_CASHFREE_MODE ||
//         ""
//       ).trim().toLowerCase();
//       const propMode = String(cashfreeMode || "").trim().toLowerCase();
//       const mode = ["sandbox", "production"].includes(serverMode)
//         ? serverMode
//         : ["sandbox", "production"].includes(viteMode)
//           ? viteMode
//           : propMode;

//       if (!["sandbox", "production"].includes(mode)) {
//         throw new Error("Cashfree SDK environment is not configured.");
//       }

//       console.info("[Mock Interview Checkout]", {
//         bookingId: currentBookingId,
//         orderId,
//         sdkMode: mode,
//         serverMode: serverMode || "not returned",
//         sessionExists: true,
//         sessionLength: sessionId.trim().length,
//         sessionPrefix: sessionId.trim().slice(0, 8),
//       });

//       // Order exists; do not generate an additional order on repeated clicks.
//       setPaymentStarted(true);

//       const cashfree = Cashfree({ mode });
//       if (!cashfree || typeof cashfree.checkout !== "function") {
//         throw new Error("Cashfree checkout is unavailable.");
//       }

//       const result = await cashfree.checkout({
//         paymentSessionId: sessionId.trim(),
//         redirectTarget: "_self",
//       });

//       if (result?.error) {
//         const error = new Error(
//           result.error.message || "Cashfree could not open checkout."
//         );
//         error.code = result.error.code;
//         throw error;
//       }
//       // Do not mark paid: webhook / server reconciliation decides success.
//     } catch (err) {
//       console.error("[Mock Interview Payment Error]", {
//         bookingId: currentBookingId,
//         message: err.message,
//         code: err.code,
//         httpStatus: err.status,
//       });

//       if (err.status === 401 || err.status === 403) {
//         setError(
//           "The server refused this public booking request. Check whether the deployed booking or payment endpoint requires authentication."
//         );
//       } else {
//         setError(
//           currentBookingId
//             ? `${err.message || "Unable to start payment."} Your booking reference has been saved. Check its status before attempting another payment.`
//             : err.message || "Unable to open payment gateway."
//         );
//       }
//     } finally {
//       processingRef.current = false;
//       setBusy(false);
//     }
//   }

//   const modal = (
//     <motion.div
//       data-ib-theme={theme}
//       className="tt-ib !min-h-0 fixed inset-0 !m-0 z-[2147483000] flex items-end justify-center sm:items-center sm:p-5"
//       style={{
//         background: "transparent",
//         isolation: "isolate",
//       }}
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//     >
//       {/* BACKDROP */}

//       <button
//         type="button"
//         aria-label="Close booking dialog"
//         disabled={busy}
//         onClick={onClose}
//         className="ib-overlay absolute inset-0 z-0 w-full"
//       />

//       {/* MODAL */}

//       <motion.section
//         role="dialog"
//         aria-modal="true"
//         aria-label="Book mock interview"
//         className="ib-card ib-modal-surface relative z-10 flex max-h-[96dvh] w-full max-w-[730px] flex-col overflow-hidden rounded-t-3xl sm:max-h-[91dvh] sm:rounded-3xl"
//         initial={{
//           y: 30,
//           opacity: 0,
//         }}
//         animate={{
//           y: 0,
//           opacity: 1,
//         }}
//         exit={{
//           y: 25,
//           opacity: 0,
//         }}
//       >
//         {/* HEADER */}

//         <div
//           className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4 sm:px-7"
//           style={{
//             borderColor:
//               "var(--ib-border)",
//           }}
//         >
//           <div>
//             <div className="ib-orange text-[10px] font-black uppercase tracking-widest">
//               Target Trek · Live 1:1
//             </div>

//             <h2 className="mt-1 text-lg font-black sm:text-xl">
//               Book your mock interview
//             </h2>
//           </div>

//           <button
//             type="button"
//             onClick={onClose}
//             disabled={busy}
//             aria-label="Close"
//             className="ib-outline !p-2"
//           >
//             <X size={18} />
//           </button>
//         </div>

//         {/* BODY */}

//         <div className="ib-modal-scroll flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
//           <Progress step={step} />

//           {/* SLOT SUMMARY */}

//           <div className="ib-panel mt-5 rounded-2xl p-4">
//             <div className="flex flex-wrap items-center justify-between gap-2">
//               <strong>
//                 {fmtDate(
//                   slot.startTime,
//                   {
//                     weekday: "long",
//                     day: "numeric",
//                     month: "short",
//                   }
//                 )}
//               </strong>

//               <span className="ib-orange text-lg font-black">
//                 {priceText}
//               </span>
//             </div>

//             <div className="ib-muted mt-2 flex flex-wrap items-center gap-2 text-sm">
//               <Clock3 size={14} />

//               {fmtTime(
//                 slot.startTime
//               )}

//               {" – "}

//               {fmtTime(
//                 slot.endTime
//               )}

//               {" · "}

//               {slot.durationMinutes} min

//               {" · IST"}
//             </div>
//           </div>

//           {/* ==================================
//               STEP 1: TOPICS
//           ================================== */}

//           {step === 0 && (
//             <div className="mt-6">
//               <h3 className="text-lg font-extrabold">
//                 What would you like to practice?
//               </h3>

//               <p className="ib-muted mt-2 text-sm leading-7">
//                 Select up to {maxTopics}{" "}
//                 topics. Your interviewer can
//                 tailor the session to your
//                 experience and target role.
//               </p>

//               <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
//                 {availableTopics.map(
//                   (topic) => (
//                     <TopicCard
//                       key={topic}
//                       topic={topic}
//                       selected={
//                         topics.includes(topic)
//                       }
//                       onClick={() =>
//                         toggleTopic(topic)
//                       }
//                     />
//                   )
//                 )}
//               </div>
//             </div>
//           )}

//           {/* ==================================
//               STEP 2: CANDIDATE DETAILS
//           ================================== */}

//           {step === 1 && (
//             <div className="mt-6">
//               <h3 className="text-lg font-extrabold">
//                 Tell us about yourself
//               </h3>

//               <p className="ib-muted mt-2 text-sm leading-7">
//                 No account is required.
//                 Enter your details so we can
//                 prepare your session and send
//                 interview information by email.
//               </p>

//               <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
//                 <TextField
//                   label="Full name"
//                   required
//                   value={
//                     candidate.name
//                   }
//                   onChange={(value) =>
//                     change(
//                       "name",
//                       value
//                     )
//                   }
//                   placeholder="Your full name"
//                   maxLength={120}
//                 />

//                 <TextField
//                   label="Email address"
//                   required
//                   type="email"
//                   value={
//                     candidate.email
//                   }
//                   onChange={(value) =>
//                     change(
//                       "email",
//                       value
//                     )
//                   }
//                   placeholder="you@example.com"
//                   maxLength={254}
//                 />

//                 <TextField
//                   label="Phone number"
//                   required
//                   type="tel"
//                   value={
//                     candidate.phone
//                   }
//                   onChange={(value) =>
//                     change(
//                       "phone",
//                       value
//                     )
//                   }
//                   placeholder="+91 9876543210"
//                 />

//                 <TextField
//                   label="Experience (years)"
//                   type="number"
//                   min="0"
//                   max="50"
//                   step="0.5"
//                   value={
//                     candidate.experienceYears
//                   }
//                   onChange={(value) =>
//                     change(
//                       "experienceYears",
//                       value
//                     )
//                   }
//                   placeholder="2"
//                 />

//                 <TextField
//                   label="Current role"
//                   value={
//                     candidate.currentRole
//                   }
//                   onChange={(value) =>
//                     change(
//                       "currentRole",
//                       value
//                     )
//                   }
//                   placeholder="Software Engineer"
//                   maxLength={120}
//                 />

//                 <TextField
//                   label="Target role"
//                   value={
//                     candidate.targetRole
//                   }
//                   onChange={(value) =>
//                     change(
//                       "targetRole",
//                       value
//                     )
//                   }
//                   placeholder="SDE-2 / Backend Engineer"
//                   maxLength={120}
//                 />

//                 <TextField
//                   label="Current company"
//                   value={
//                     candidate.currentCompany
//                   }
//                   onChange={(value) =>
//                     change(
//                       "currentCompany",
//                       value
//                     )
//                   }
//                   placeholder="Optional"
//                   maxLength={120}
//                 />

//                 <TextField
//                   label="Resume URL"
//                   type="url"
//                   value={
//                     candidate.resumeUrl
//                   }
//                   onChange={(value) =>
//                     change(
//                       "resumeUrl",
//                       value
//                     )
//                   }
//                   placeholder="https://drive.google.com/..."
//                 />

//                 <label className="sm:col-span-2">
//                   <span className="ib-input-label">
//                     What should we focus on?
//                   </span>

//                   <textarea
//                     className="ib-field min-h-[105px] resize-y"
//                     value={
//                       candidate.notes
//                     }
//                     onChange={(event) =>
//                       change(
//                         "notes",
//                         event.target.value
//                       )
//                     }
//                     placeholder="Share your goals, upcoming interview, weaker topics or projects."
//                     maxLength={3000}
//                   />
//                 </label>
//               </div>

//               <div className="ib-panel mt-5 flex items-start gap-3 rounded-xl p-4">
//                 <Mail
//                   size={18}
//                   className="ib-orange mt-0.5 shrink-0"
//                 />

//                 <p className="ib-muted text-xs leading-6">
//                   Your interview confirmation
//                   and joining instructions will
//                   be sent to your email after
//                   payment verification. If the
//                   meeting link is not yet
//                   assigned, it will be shared
//                   separately.
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* ==================================
//               STEP 3: REVIEW AND PAYMENT
//           ================================== */}

//           {step === 2 && (
//             <div className="mt-6">
//               <h3 className="text-lg font-extrabold">
//                 Review your booking
//               </h3>

//               <p className="ib-muted mt-2 text-sm leading-7">
//                 Review everything before
//                 continuing to Cashfree's
//                 secure checkout.
//               </p>

//               <div className="ib-card mt-4 overflow-hidden rounded-2xl">
//                 <div className="space-y-4 p-4 text-sm sm:p-5">
//                   <div className="flex justify-between gap-4">
//                     <span className="ib-muted">
//                       Interview topics
//                     </span>

//                     <strong className="max-w-[60%] text-right">
//                       {topics.join(" · ")}
//                     </strong>
//                   </div>

//                   <div className="flex justify-between gap-4">
//                     <span className="ib-muted">
//                       Candidate
//                     </span>

//                     <strong className="text-right">
//                       {candidate.name}
//                     </strong>
//                   </div>

//                   <div className="flex justify-between gap-4">
//                     <span className="ib-muted">
//                       Email
//                     </span>

//                     <strong className="break-all text-right">
//                       {candidate.email}
//                     </strong>
//                   </div>

//                   <div className="flex justify-between gap-4">
//                     <span className="ib-muted">
//                       Interview date
//                     </span>

//                     <strong className="text-right">
//                       {fmtDate(
//                         slot.startTime,
//                         {
//                           day: "numeric",
//                           month: "short",
//                           year: "numeric",
//                         }
//                       )}
//                     </strong>
//                   </div>

//                   <div className="flex justify-between gap-4">
//                     <span className="ib-muted">
//                       Interview time
//                     </span>

//                     <strong className="text-right">
//                       {fmtTime(
//                         slot.startTime
//                       )}{" "}
//                       IST
//                     </strong>
//                   </div>

//                   <div className="flex justify-between gap-4">
//                     <span className="ib-muted">
//                       Duration
//                     </span>

//                     <strong>
//                       {slot.durationMinutes}{" "}
//                       minutes
//                     </strong>
//                   </div>
//                 </div>

//                 <div className="ib-panel flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
//                   <strong>
//                     Total to pay
//                   </strong>

//                   <div className="text-right">
//                     {Number(slot.mrp) >
//                       Number(slot.price) && (
//                       <span className="ib-muted mr-2 text-xs line-through">
//                         {fmtMoney(
//                           slot.mrp,
//                           slot.currency
//                         )}
//                       </span>
//                     )}

//                     <span className="ib-orange text-2xl font-black">
//                       {priceText}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="ib-muted mt-4 flex items-start gap-2 text-xs leading-6">
//                 <LockKeyhole
//                   size={17}
//                   className="mt-0.5 shrink-0"
//                 />

//                 Cashfree securely processes
//                 the payment. Your interview
//                 is confirmed only after the
//                 backend verifies successful
//                 payment.
//               </div>
//             </div>
//           )}

//           {/* ERRORS */}

//           {error && (
//             <div
//               role="alert"
//               className="ib-error mt-5 flex items-start gap-2 rounded-xl p-4 text-sm"
//             >
//               <AlertCircle
//                 size={18}
//                 className="shrink-0"
//               />

//               <span>{error}</span>
//             </div>
//           )}

//           {/* BOOKING RECOVERY */}

//           {bookingId && (
//             <div className="ib-recovery mt-5 rounded-xl p-4">
//               <div className="flex items-start gap-3">
//                 <ShieldCheck
//                   size={20}
//                   className="ib-orange shrink-0"
//                 />

//                 <div className="min-w-0">
//                   <strong className="text-sm">
//                     Booking reference created
//                   </strong>

//                   <p className="ib-muted mt-1 break-all text-xs">
//                     {bookingId}
//                   </p>

//                   <p className="ib-muted mt-2 text-xs leading-6">
//                     If checkout was interrupted,
//                     check your booking's payment
//                     status before making another
//                     payment.
//                   </p>

//                   <a
//                     href={paymentStatusUrl(
//                       bookingId
//                     )}
//                     className="ib-outline mt-3"
//                   >
//                     <RefreshCw size={15} />

//                     Check Payment Status

//                     <ArrowRight size={15} />
//                   </a>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* FOOTER */}

//         <div
//           className="flex shrink-0 items-center justify-between gap-2 border-t p-4 sm:px-7"
//           style={{
//             borderColor:
//               "var(--ib-border)",
//           }}
//         >
//           <button
//             type="button"
//             disabled={busy}
//             className="ib-outline"
//             onClick={
//               step === 0
//                 ? onClose
//                 : () => {
//                     setError("");
//                     setStep(
//                       step - 1
//                     );
//                   }
//             }
//           >
//             <ArrowLeft size={16} />

//             {step === 0
//               ? "Close"
//               : "Back"}
//           </button>

//           {step < 2 ? (
//             <button
//               type="button"
//               className="ib-primary"
//               disabled={
//                 step === 0
//                   ? topics.length === 0
//                   : Boolean(detailsError)
//               }
//               onClick={() => {
//                 setError("");

//                 if (
//                   step === 1 &&
//                   detailsError
//                 ) {
//                   setError(
//                     detailsError
//                   );

//                   return;
//                 }

//                 setStep(
//                   step + 1
//                 );
//               }}
//             >
//               Continue

//               <ArrowRight size={16} />
//             </button>
//           ) : (
//             <button
//               type="button"
//               className="ib-primary"
//               disabled={busy}
//               onClick={checkout}
//             >
//               {busy ? (
//                 <LoaderCircle
//                   size={17}
//                   className="animate-spin"
//                 />
//               ) : (
//                 <CreditCard size={17} />
//               )}

//               {busy
//                 ? "Processing..."
//                 : paymentStarted
//                   ? "Check Payment"
//                   : `Pay ${priceText}`}
//             </button>
//           )}
//         </div>
//       </motion.section>
//     </motion.div>
//   );

//   if (typeof document === "undefined") {
//     return null;
//   }

//   return createPortal(
//     modal,
//     document.body
//   );
// }

// /* =========================================================
//    MAIN PAGE

//    PUBLIC GUEST BOOKING PAGE.

//    No authToken prop.
//    No onLoginRequired prop.
//    No Redux user.
//    No login redirect.
// ========================================================= */

// export default function InterviewBookingPage({
//   cashfreeMode = DEFAULT_CASHFREE_MODE,
// }) {
//   const theme = useNavbarTheme();

//   const days = useMemo(
//     upcomingDays,
//     []
//   );

//   const [
//     selectedDay,
//     setSelectedDay,
//   ] = useState(
//     () => days[0]?.key || ""
//   );

//   const [slots, setSlots] =
//     useState([]);

//   const [loading, setLoading] =
//     useState(true);

//   const [loadError, setLoadError] =
//     useState("");

//   const [
//     selectedSlot,
//     setSelectedSlot,
//   ] = useState(null);

//   const [
//     viewFilter,
//     setViewFilter,
//   ] = useState("all");

//   const [
//     topicFilter,
//     setTopicFilter,
//   ] = useState("all");

//   /* =====================================================
//      GET PUBLIC SLOTS

//      GET /api/interviews/slots

//      No token required.
//   ===================================================== */

//   const fetchSlots = useCallback(
//     async (signal) => {
//       if (!selectedDay) {
//         return;
//       }

//       setLoading(true);
//       setLoadError("");

//       try {
//         const result =
//           await apiRequest(
//             `/slots?date=${encodeURIComponent(
//               selectedDay
//             )}&includeUnavailable=true`,
//             { signal }
//           );

//         const list =
//           Array.isArray(result.data)
//             ? result.data
//             : Array.isArray(
//                 result.data?.slots
//               )
//               ? result.data.slots
//               : [];

//         if (!signal?.aborted) {
//           setSlots(
//             list.filter(
//               (slot) =>
//                 !slot.isDeleted
//             )
//           );
//         }
//       } catch (error) {
//         if (
//           error.name !== "AbortError"
//         ) {
//           setSlots([]);

//           setLoadError(
//             error.message ||
//               "Unable to load interview slots."
//           );
//         }
//       } finally {
//         if (!signal?.aborted) {
//           setLoading(false);
//         }
//       }
//     },
//     [selectedDay]
//   );

//   useEffect(() => {
//     const controller =
//       new AbortController();

//     fetchSlots(
//       controller.signal
//     );

//     return () =>
//       controller.abort();
//   }, [fetchSlots]);

//   /* =====================================================
//      FILTERS
//   ===================================================== */

//   const shownSlots = useMemo(
//     () =>
//       slots
//         .filter((slot) => {
//           if (
//             viewFilter ===
//               "available" &&
//             slot.status !==
//               "AVAILABLE"
//           ) {
//             return false;
//           }

//           if (
//             viewFilter ===
//               "unavailable" &&
//             slot.status ===
//               "AVAILABLE"
//           ) {
//             return false;
//           }

//           if (
//             topicFilter !== "all" &&
//             !(
//               slot.allowedTopics ||
//               []
//             ).includes(topicFilter)
//           ) {
//             return false;
//           }

//           return true;
//         })
//         .sort(
//           (a, b) =>
//             new Date(
//               a.startTime
//             ) -
//             new Date(
//               b.startTime
//             )
//         ),
//     [
//       slots,
//       viewFilter,
//       topicFilter,
//     ]
//   );

//   const countAvailable =
//     slots.filter(
//       (slot) =>
//         slot.status ===
//         "AVAILABLE"
//     ).length;

//   const countBooked =
//     slots.filter(
//       (slot) =>
//         slot.status ===
//         "BOOKED"
//     ).length;

//   const countHeld =
//     slots.filter(
//       (slot) =>
//         slot.status ===
//         "HELD"
//     ).length;

//   /* =====================================================
//      OPEN MODAL

//      No authentication check.
//   ===================================================== */

//   const handleBook = (slot) => {
//     if (
//       slot.status !==
//       "AVAILABLE"
//     ) {
//       return;
//     }

//     setLoadError("");

//     setSelectedSlot(slot);
//   };

//   return (
//     <div
//       className="tt-ib pt-[116px] xl:pt-[76px]"
//       data-ib-theme={theme}
//     >
//       <style>{styles}</style>

//       <main>
//         {/* ==========================================
//             HERO
//         ========================================== */}

//         <section
//           className="relative overflow-hidden px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8"
//           style={{
//             background:
//               "linear-gradient(140deg,var(--ib-bg),var(--ib-alt))",
//           }}
//         >
//           <div
//             className="pointer-events-none absolute -right-20 top-4 h-64 w-64 rounded-full blur-3xl"
//             style={{
//               background:
//                 "rgba(249,115,22,.10)",
//             }}
//           />

//           <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
//             <div>
//               <div
//                 className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest"
//                 style={{
//                   background:
//                     "var(--ib-orange-light)",
//                   color:
//                     "var(--ib-orange)",
//                 }}
//               >
//                 <span className="h-2 w-2 rounded-full bg-orange-500" />

//                 Target Trek Mock Interviews
//               </div>

//               <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-[58px] lg:leading-[1.12]">
//                 Prepare for the interview{" "}
//                 <span className="ib-orange">
//                   that matters.
//                 </span>
//               </h1>

//               <p className="ib-muted mt-5 max-w-2xl text-base leading-8 sm:text-lg">
//                 Practice technical interviews
//                 with engineers experienced in
//                 backend development, system
//                 design and production systems.
//                 Strengthen your problem-solving
//                 skills, architecture decisions
//                 and communication through
//                 realistic technical discussions.
//               </p>

//               <div className="mt-7 flex flex-wrap items-center gap-3">
//                 <a
//                   href="#interview-slots"
//                   className="ib-primary"
//                 >
//                   Explore Available Slots

//                   <ArrowRight size={17} />
//                 </a>

//                 <a
//                   href="#how-it-works"
//                   className="ib-outline"
//                 >
//                   How It Works

//                   <ChevronRight size={17} />
//                 </a>
//               </div>

//               <div className="ib-muted mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold">
//                 <span className="flex items-center gap-2">
//                   <Video
//                     size={15}
//                     className="ib-orange"
//                   />
//                   Live 1:1 Interview
//                 </span>

//                 <span className="flex items-center gap-2">
//                   <MessageSquareText
//                     size={15}
//                     className="ib-orange"
//                   />
//                   Actionable Feedback
//                 </span>

//                 <span className="flex items-center gap-2">
//                   <ShieldCheck
//                     size={15}
//                     className="ib-orange"
//                   />
//                   Secure Checkout
//                 </span>

//                 <span className="flex items-center gap-2">
//                   <CheckCircle2
//                     size={15}
//                     className="ib-orange"
//                   />
//                   No Account Required
//                 </span>
//               </div>
//             </div>

//             {/* TOPIC CARD */}

//             <div className="ib-card rounded-3xl p-5 shadow-xl sm:p-7">
//               <div className="flex items-center justify-between">
//                 <span className="ib-orange text-xs font-bold uppercase tracking-wider">
//                   What you can practice
//                 </span>

//                 <div className="ib-panel rounded-xl p-2">
//                   <Sparkles
//                     size={20}
//                     className="ib-orange"
//                   />
//                 </div>
//               </div>

//               <div className="mt-5 space-y-3">
//                 {ALL_TOPICS.map(
//                   (topic) => {
//                     const info =
//                       TOPIC_INFO[topic];

//                     const Icon =
//                       info.Icon;

//                     return (
//                       <div
//                         key={topic}
//                         className="flex items-center gap-3 rounded-xl p-2"
//                       >
//                         <div className="ib-panel rounded-lg p-2.5">
//                           <Icon
//                             size={18}
//                             className="ib-orange"
//                           />
//                         </div>

//                         <div className="flex-1">
//                           <div className="text-sm font-bold">
//                             {info.title}
//                           </div>

//                           <p className="ib-muted mt-1 text-xs">
//                             {info.description}
//                           </p>
//                         </div>

//                         <Check
//                           size={16}
//                           className="ib-orange"
//                         />
//                       </div>
//                     );
//                   }
//                 )}
//               </div>

//               <div className="ib-panel ib-muted mt-5 rounded-xl px-4 py-3 text-xs leading-6">
//                 Sessions can be tailored to
//                 your experience, target role,
//                 upcoming interviews and
//                 improvement areas.
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             SLOT CALENDAR
//         ========================================== */}

//         <section
//           id="interview-slots"
//           className="scroll-mt-36 px-4 py-14 sm:px-6 lg:px-8"
//         >
//           <div className="mx-auto max-w-6xl">
//             <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
//               <div>
//                 <span className="ib-orange text-xs font-black uppercase tracking-widest">
//                   Choose Your Time
//                 </span>

//                 <h2 className="mt-2 text-2xl font-black sm:text-3xl">
//                   Upcoming Interview Slots
//                 </h2>

//                 <p className="ib-muted mt-2 max-w-2xl text-sm leading-7">
//                   Browse upcoming dates,
//                   choose your preferred
//                   interview session and book
//                   without creating an account.
//                 </p>
//               </div>

//               <span className="ib-panel rounded-xl px-4 py-2 text-xs font-bold">
//                 All Times in IST
//               </span>
//             </div>

//             {/* DATE SELECTOR */}

//             <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-3">
//               {days.map(
//                 ({ key, date }, index) => {
//                   const active =
//                     selectedDay === key;

//                   return (
//                     <button
//                       key={key}
//                       type="button"
//                       aria-pressed={active}
//                       onClick={() => {
//                         setSelectedDay(key);

//                         setViewFilter(
//                           "all"
//                         );
//                       }}
//                       className={
//                         `ib-card ib-day rounded-2xl p-2.5 text-center sm:p-4 ${
//                           active
//                             ? "ib-selected"
//                             : ""
//                         }`
//                       }
//                     >
//                       <div className="ib-muted text-[11px] font-bold">
//                         {index === 0
//                           ? "Today"
//                           : fmtDate(
//                               date,
//                               {
//                                 weekday:
//                                   "short",
//                               }
//                             )}
//                       </div>

//                       <div
//                         className={
//                           `mt-1 text-2xl font-black ${
//                             active
//                               ? "ib-orange"
//                               : ""
//                           }`
//                         }
//                       >
//                         {fmtDate(
//                           date,
//                           {
//                             day:
//                               "numeric",
//                           }
//                         )}
//                       </div>

//                       <div className="ib-muted mt-1 text-xs">
//                         {fmtDate(
//                           date,
//                           {
//                             month:
//                               "short",
//                           }
//                         )}
//                       </div>

//                       {active && (
//                         <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-orange-500" />
//                       )}
//                     </button>
//                   );
//                 }
//               )}
//             </div>

//             {/* FILTER HEADER */}

//             <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
//               <div>
//                 <h3 className="text-lg font-extrabold">
//                   {selectedDateLabel(
//                     selectedDay
//                   )}
//                 </h3>

//                 <p className="ib-muted mt-1 text-xs">
//                   {loading
//                     ? "Checking availability..."
//                     : `${countAvailable} available · ${countBooked} booked · ${countHeld} reserved`}
//                 </p>
//               </div>

//               <div className="ib-card inline-flex flex-wrap rounded-xl p-1">
//                 {[
//                   {
//                     key: "all",
//                     label: "All",
//                   },
//                   {
//                     key: "available",
//                     label: "Available",
//                   },
//                   {
//                     key: "unavailable",
//                     label: "Unavailable",
//                   },
//                 ].map((filter) => (
//                   <button
//                     key={filter.key}
//                     type="button"
//                     onClick={() =>
//                       setViewFilter(
//                         filter.key
//                       )
//                     }
//                     className={
//                       `rounded-lg px-3 py-2 text-xs font-bold ${
//                         viewFilter ===
//                         filter.key
//                           ? "ib-selected"
//                           : "ib-muted"
//                       }`
//                     }
//                   >
//                     {filter.label}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* TOPIC FILTER */}

//             <div className="mt-5 flex flex-wrap gap-2">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setTopicFilter("all")
//                 }
//                 className={
//                   `ib-outline !px-3 !py-2 ${
//                     topicFilter === "all"
//                       ? "ib-selected"
//                       : ""
//                   }`
//                 }
//               >
//                 All Topics
//               </button>

//               {ALL_TOPICS.map((topic) => (
//                 <button
//                   key={topic}
//                   type="button"
//                   onClick={() =>
//                     setTopicFilter(topic)
//                   }
//                   className={
//                     `ib-outline !px-3 !py-2 ${
//                       topicFilter === topic
//                         ? "ib-selected"
//                         : ""
//                     }`
//                   }
//                 >
//                   {TOPIC_INFO[topic].title}
//                 </button>
//               ))}
//             </div>

//             {/* ERROR */}

//             {loadError && (
//               <div className="ib-error mt-6 flex items-start gap-3 rounded-xl p-4 text-sm">
//                 <AlertCircle
//                   size={19}
//                   className="shrink-0"
//                 />

//                 <div className="flex-1">
//                   {loadError}
//                 </div>

//                 <button
//                   type="button"
//                   onClick={() =>
//                     fetchSlots()
//                   }
//                   className="font-bold underline"
//                 >
//                   Retry
//                 </button>
//               </div>
//             )}

//             {/* LOADING */}

//             {loading ? (
//               <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                 {[1, 2, 3, 4, 5, 6].map(
//                   (index) => (
//                     <div
//                       key={index}
//                       className="ib-card animate-pulse rounded-2xl p-5"
//                     >
//                       <div className="ib-panel h-5 w-1/2 rounded-lg" />

//                       <div className="ib-panel mt-4 h-12 rounded-xl" />

//                       <div className="ib-panel mt-4 h-10 rounded-xl" />
//                     </div>
//                   )
//                 )}
//               </div>
//             ) : shownSlots.length === 0 ? (
//               <div className="ib-card mt-8 rounded-3xl px-5 py-14 text-center">
//                 <CalendarDays
//                   size={36}
//                   className="ib-orange mx-auto"
//                 />

//                 <h3 className="mt-4 text-lg font-extrabold">
//                   No matching interview slots
//                 </h3>

//                 <p className="ib-muted mx-auto mt-2 max-w-md text-sm leading-7">
//                   Try a different date or
//                   clear the selected filters
//                   to explore more sessions.
//                 </p>

//                 <button
//                   type="button"
//                   className="ib-outline mt-5"
//                   onClick={() => {
//                     setViewFilter("all");
//                     setTopicFilter("all");
//                   }}
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             ) : (
//               <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                 {shownSlots.map(
//                   (slot) => {
//                     const available =
//                       slot.status ===
//                       "AVAILABLE";

//                     const topics =
//                       Array.isArray(
//                         slot.allowedTopics
//                       ) &&
//                       slot.allowedTopics.length
//                         ? slot.allowedTopics
//                         : ALL_TOPICS;

//                     const hasDiscount =
//                       Number(slot.mrp) >
//                       Number(slot.price);

//                     return (
//                       <article
//                         key={
//                           slot._id
//                         }
//                         className="ib-card ib-slot flex flex-col rounded-2xl p-5 shadow-sm"
//                       >
//                         <div className="flex items-start justify-between gap-3">
//                           <div className="ib-panel rounded-xl p-3">
//                             <Video
//                               size={20}
//                               className="ib-orange"
//                             />
//                           </div>

//                           <StatusPill
//                             slot={slot}
//                           />
//                         </div>

//                         <h3 className="mt-4 text-lg font-black">
//                           {slot.title ||
//                             "Technical Mock Interview"}
//                         </h3>

//                         <div className="ib-muted mt-3 flex items-center gap-2 text-sm">
//                           <Clock3
//                             size={16}
//                             className="ib-orange"
//                           />

//                           {fmtTime(
//                             slot.startTime
//                           )}

//                           {" – "}

//                           {fmtTime(
//                             slot.endTime
//                           )}
//                         </div>

//                         <p className="ib-muted mt-2 text-xs">
//                           {slot.durationMinutes ||
//                             45}{" "}
//                           minutes · IST
//                         </p>

//                         <div className="mt-4 flex flex-wrap gap-1.5">
//                           {topics
//                             .slice(0, 4)
//                             .map(
//                               (topic) => (
//                                 <span
//                                   key={topic}
//                                   className="ib-panel rounded-lg px-2.5 py-1 text-[11px] font-bold"
//                                 >
//                                   {topic}
//                                 </span>
//                               )
//                             )}
//                         </div>

//                         <div
//                           className="mt-auto pt-5"
//                         >
//                           <div
//                             className="border-t pt-4"
//                             style={{
//                               borderColor:
//                                 "var(--ib-border)",
//                             }}
//                           >
//                             <div className="flex items-center justify-between gap-2">
//                               <div>
//                                 <p className="ib-muted text-[11px]">
//                                   Session price
//                                 </p>

//                                 <div className="mt-1 flex items-center gap-2">
//                                   <span className="ib-orange text-2xl font-black">
//                                     {fmtMoney(
//                                       slot.price,
//                                       slot.currency
//                                     )}
//                                   </span>

//                                   {hasDiscount && (
//                                     <span className="ib-muted text-xs line-through">
//                                       {fmtMoney(
//                                         slot.mrp,
//                                         slot.currency
//                                       )}
//                                     </span>
//                                   )}
//                                 </div>
//                               </div>
//                             </div>

//                             <button
//                               type="button"
//                               disabled={!available}
//                               onClick={() =>
//                                 handleBook(slot)
//                               }
//                               className={
//                                 available
//                                   ? "ib-primary mt-4 w-full"
//                                   : "ib-outline mt-4 w-full"
//                               }
//                             >
//                               {available ? (
//                                 <>
//                                   Book This Slot

//                                   <ArrowRight
//                                     size={16}
//                                   />
//                                 </>
//                               ) : (
//                                 "Not Available"
//                               )}
//                             </button>
//                           </div>
//                         </div>
//                       </article>
//                     );
//                   }
//                 )}
//               </div>
//             )}
//           </div>
//         </section>

//         {/* ==========================================
//             HOW IT WORKS
//         ========================================== */}

//         <section
//           id="how-it-works"
//           className="scroll-mt-36 px-4 py-14 sm:px-6 lg:px-8"
//           style={{
//             background:
//               "var(--ib-alt)",
//           }}
//         >
//           <div className="mx-auto max-w-6xl">
//             <div className="max-w-2xl">
//               <span className="ib-orange text-xs font-black uppercase tracking-widest">
//                 Simple Booking Process
//               </span>

//               <h2 className="mt-2 text-2xl font-black sm:text-3xl">
//                 How your mock interview works
//               </h2>

//               <p className="ib-muted mt-3 text-sm leading-7">
//                 Book your technical mock
//                 interview in a few simple
//                 steps. No account registration
//                 is required.
//               </p>
//             </div>

//             <div className="mt-8 grid gap-4 md:grid-cols-3">
//               {[
//                 {
//                   number: "01",
//                   title:
//                     "Choose your session",
//                   description:
//                     "Select an available date and time, then choose the topics you want to practice.",
//                   Icon: CalendarDays,
//                 },
//                 {
//                   number: "02",
//                   title:
//                     "Enter details and pay",
//                   description:
//                     "Provide your name, email, experience and interview goals. Complete payment securely through Cashfree.",
//                   Icon: CreditCard,
//                 },
//                 {
//                   number: "03",
//                   title:
//                     "Attend your interview",
//                   description:
//                     "After payment verification, receive your booking confirmation. Meeting details are shared by email.",
//                   Icon: Video,
//                 },
//               ].map(
//                 ({
//                   number,
//                   title,
//                   description,
//                   Icon,
//                 }) => (
//                   <div
//                     key={number}
//                     className="ib-card rounded-2xl p-6"
//                   >
//                     <div className="flex items-center justify-between">
//                       <span className="ib-orange text-3xl font-black">
//                         {number}
//                       </span>

//                       <Icon
//                         size={24}
//                         className="ib-orange"
//                       />
//                     </div>

//                     <h3 className="mt-5 text-lg font-extrabold">
//                       {title}
//                     </h3>

//                     <p className="ib-muted mt-3 text-sm leading-7">
//                       {description}
//                     </p>
//                   </div>
//                 )
//               )}
//             </div>
//           </div>
//         </section>

//         {/* ==========================================
//             SUPPORT AND CANCELLATIONS
//         ========================================== */}

//         <section className="px-4 py-14 sm:px-6 lg:px-8">
//           <div className="mx-auto max-w-6xl">
//             <div className="ib-card grid gap-6 rounded-3xl p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
//               <div>
//                 <div className="ib-orange flex items-center gap-2 text-xs font-black uppercase tracking-widest">
//                   <HelpCircle size={17} />

//                   Support
//                 </div>

//                 <h2 className="mt-3 text-xl font-black sm:text-2xl">
//                   Need to cancel or reschedule?
//                 </h2>

//                 <p className="ib-muted mt-3 max-w-2xl text-sm leading-7">
//                   Contact our support team
//                   using the same email
//                   address you entered during
//                   booking. Include your
//                   booking ID and request.

//                   Cancellation fees may apply
//                   depending on who requests
//                   cancellation and the
//                   applicable policy.
//                 </p>
//               </div>

//               <a
//                 href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
//                   "Mock Interview Booking Support"
//                 )}`}
//                 className="ib-primary w-full md:w-auto"
//               >
//                 <Mail size={17} />

//                 Contact Support
//               </a>
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* ==========================================
//           BOOKING MODAL
//       ========================================== */}

//       <AnimatePresence>
//         {selectedSlot && (
//           <BookingModal
//             key={selectedSlot._id}
//             slot={selectedSlot}
//             theme={theme}
//             cashfreeMode={
//               cashfreeMode
//             }
//             onClose={() =>
//               setSelectedSlot(null)
//             }
//           />
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }
import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, } from "framer-motion";
import { ArrowRight, ArrowLeft, CalendarDays, Clock3, CheckCircle2, X, ShieldCheck, Video, Code2, Layers3, Network, BrainCircuit, BriefcaseBusiness, MessageSquareText, LoaderCircle, LockKeyhole, CreditCard, Sparkles, AlertCircle, Check, Mail, RefreshCw, ChevronRight, HelpCircle, Star, Target, TrendingUp, Award, GraduationCap, Database, ServerCog, ClipboardCheck, Quote, BookOpen, ChevronDown, Timer, BadgeCheck, Lightbulb, CheckCheck, } from "lucide-react";
/* =========================================================
   CONFIGURATION
========================================================= */
const BASE_URL = (import.meta.env.VITE_BASE_URL ||
    "http://localhost:5001").replace(/\/+$/, "");
const API = `${BASE_URL}/api/interviews`;
const PAYMENT_STATUS_PATH = "/mock-interviews/payment-status";
const TIMEZONE = "Asia/Kolkata";
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const DEFAULT_CASHFREE_MODE = import.meta.env.VITE_CASHFREE_ENV ===
    "production"
    ? "production"
    : "sandbox";
/* =========================================================
   INTERVIEW TOPICS
========================================================= */
const TOPIC_INFO = {
    DSA: {
        title: "Data Structures & Algorithms",
        description: "Coding questions, problem solving, complexity analysis and edge cases.",
        Icon: Code2,
    },
    LLD: {
        title: "Low-Level Design",
        description: "Object-oriented design, SOLID, design patterns and concurrency.",
        Icon: Layers3,
    },
    HLD: {
        title: "High-Level System Design",
        description: "Distributed systems, scalability, caching, databases and architecture.",
        Icon: Network,
    },
    GENAI: {
        title: "Generative AI Engineering",
        description: "RAG, AI agents, LLMs, evaluation and production GenAI systems.",
        Icon: BrainCircuit,
    },
    PROJECTS: {
        title: "Backend Engineering & Projects",
        description: "Java, Spring Boot, microservices, API design, databases, projects and trade-offs.",
        Icon: BriefcaseBusiness,
    },
};
const ALL_TOPICS = Object.keys(TOPIC_INFO);
const INTERVIEWER_COMPANIES = [
    { name: "EPAM Systems", domain: "epam.com" },
    { name: "HashedIn by Deloitte", domain: "hashedin.com" },
    { name: "Deloitte", domain: "deloitte.com" },
    { name: "Salesforce", domain: "salesforce.com" },
    { name: "JPMorgan Chase", domain: "jpmorganchase.com" },
    { name: "Meesho", domain: "meesho.com" },
    { name: "Walmart", domain: "walmart.com" },
    { name: "ServiceNow", domain: "servicenow.com" },
    { name: "Microsoft", domain: "microsoft.com" },
    { name: "Adobe", domain: "adobe.com" },
    { name: "PayPal", domain: "paypal.com" },
    { name: "Mastercard", domain: "mastercard.com" },
    { name: "Oracle", domain: "oracle.com" },
];
const TARGET_COMPANIES = [
    { name: "Google", domain: "google.com" },
    { name: "Amazon", domain: "amazon.com" },
    { name: "Meta", domain: "meta.com" },
    { name: "Apple", domain: "apple.com" },
    { name: "Microsoft", domain: "microsoft.com" },
    { name: "Netflix", domain: "netflix.com" },
    { name: "Salesforce", domain: "salesforce.com" },
    { name: "Uber", domain: "uber.com" },
];
function CompanyLogo({ company, compact = false }) {
    if (compact) {
        return (
            <div className="group flex min-w-[82px] flex-col items-center gap-2 text-center" title={company.name}>
                <div className="ib-card flex h-14 w-14 items-center justify-center overflow-hidden rounded-full p-3 shadow-sm transition-transform duration-200 group-hover:-translate-y-1 group-hover:border-orange-500 sm:h-16 sm:w-16">
                    <img
                        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(company.domain)}&sz=128`}
                        alt={`${company.name} logo`}
                        loading="lazy"
                        className="h-full w-full object-contain"
                        onError={(event) => { event.currentTarget.style.opacity = "0"; }}
                    />
                </div>
                <span className="ib-muted max-w-[104px] text-[11px] font-bold leading-4">{company.name}</span>
            </div>
        );
    }
    return (
        <div className="ib-card flex min-h-[68px] items-center justify-center gap-3 rounded-xl px-3 py-3 text-center">
            <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(company.domain)}&sz=64`} alt="" aria-hidden="true" loading="lazy" className="h-7 w-7 shrink-0 object-contain" onError={event => { event.currentTarget.style.display = "none"; }}/>
            <span className="text-xs font-extrabold leading-5 sm:text-sm">{company.name}</span>
        </div>
    );
}

const DISPLAY_TIMEZONES = [
    { value: "Asia/Kolkata", label: "IST · India (UTC+05:30)", short: "IST" },
    { value: "UTC", label: "UTC · Coordinated Universal Time", short: "UTC" },
    { value: "America/New_York", label: "New York · ET", short: "ET" },
    { value: "America/Los_Angeles", label: "Los Angeles · PT", short: "PT" },
    { value: "Europe/London", label: "London · UK", short: "UK" },
    { value: "Europe/Berlin", label: "Berlin · CET/CEST", short: "Berlin" },
    { value: "Asia/Dubai", label: "Dubai · GST", short: "GST" },
    { value: "Asia/Singapore", label: "Singapore · SGT", short: "SGT" },
    { value: "Asia/Tokyo", label: "Tokyo · JST", short: "JST" },
    { value: "Australia/Sydney", label: "Sydney · AET", short: "Sydney" },
];

function TimeDisplayControls({ timeZone, setTimeZone, timeFormat, setTimeFormat }) {
    return (
        <div className="flex flex-wrap items-end gap-2">
            <label className="min-w-[220px] flex-1 sm:flex-none">
                <span className="ib-muted mb-1 block text-[11px] font-bold">Display time zone</span>
                <select
                    className="ib-field !py-2.5 !text-xs"
                    aria-label="Display time zone"
                    value={timeZone}
                    onChange={event => setTimeZone(event.target.value)}
                >
                    {DISPLAY_TIMEZONES.map(zone => (
                        <option key={zone.value} value={zone.value}>{zone.label}</option>
                    ))}
                </select>
            </label>
            <label className="min-w-[120px]">
                <span className="ib-muted mb-1 block text-[11px] font-bold">Clock format</span>
                <select
                    className="ib-field !py-2.5 !text-xs"
                    aria-label="Clock format"
                    value={timeFormat}
                    onChange={event => setTimeFormat(event.target.value)}
                >
                    <option value="12">12-hour (AM/PM)</option>
                    <option value="24">24-hour</option>
                </select>
            </label>
        </div>
    );
}

// Marketing statistics supplied by the site owner. Update when verified.
const PAGE_STATS = [
    { value: "25+", label: "Mock interviews conducted", Icon: Video },
    { value: "1:1", label: "Working engineer-led sessions", Icon: ServerCog },
    { value: "Live", label: "Technical questions & feedback", Icon: Layers3 },
    { value: "5", label: "Interview preparation tracks", Icon: Target },
];
const CURRICULUM = [
    { key: "DSA", Icon: Code2, title: "DSA & live coding", tagline: "From problem statement to optimal approach", points: ["Arrays, strings, hashing & sliding window", "Trees, graphs, recursion & dynamic programming", "Time-space complexity and edge cases", "Interviewer-style follow-ups and dry runs"] },
    { key: "LLD", Icon: Layers3, title: "Java & Low-Level Design", tagline: "Build maintainable, interview-ready designs", points: ["OOP, SOLID and design patterns", "Parking Lot, Rate Limiter & Notification System", "UML, entity relationships and APIs", "Concurrency, locking and thread safety"] },
    { key: "HLD", Icon: Network, title: "High-Level System Design", tagline: "Explain trade-offs, not just diagrams", points: ["Load balancing, caching, queues and databases", "Scalability, consistency and fault tolerance", "URL Shortener, BookMyShow and Uber", "Capacity estimates, bottlenecks and trade-offs"] },
    { key: "GENAI", Icon: BrainCircuit, title: "Generative AI Engineering", tagline: "Real-world LLM and agentic system discussions", points: ["RAG architecture, retrieval and embeddings", "Vector search, evaluation and guardrails", "AI agents, tool calling, MCP & orchestration", "Google ADK, deployment and production challenges"] },
    { key: "PROJECTS", Icon: BriefcaseBusiness, title: "Backend & project deep dives", tagline: "Defend your engineering decisions", points: ["Java, Spring Boot, Python, FastAPI and JVM fundamentals", "REST, security, microservices, messaging and Kafka", "SQL/NoSQL, ACID transactions, caching and Redis", "API scalability, observability, concurrency and project trade-offs"] },
];
const SESSION_BENEFITS = [
    { Icon: Video, title: "Real 1:1 technical discussion", description: "Practice explaining your approach live to an engineer instead of solving problems silently." },
    { Icon: MessageSquareText, title: "Detailed interview feedback", description: "Receive an interviewer-led breakdown of your technical approach, communication, problem-solving gaps, and priority areas to improve. Written feedback is provided when included in the selected session." },
    { Icon: BrainCircuit, title: "Deeper follow-up questions", description: "Discuss edge cases, scalability, alternatives and trade-offs that interviewers often probe." },
    { Icon: Target, title: "Tailored to your target role", description: "Share your experience and upcoming interview so the available session topics can reflect your goals." },
    { Icon: Clock3, title: "Choose your duration", description: "Pick a listed slot that matches the depth of practice you need, with pricing shown before payment." },
    { Icon: ShieldCheck, title: "Clear booking workflow", description: "Book as a guest, pay through Cashfree and receive confirmation after server-side payment verification." },
];
const FAQ_ITEMS = [
    { question: "Who conducts the mock interview?", answer: "Sessions are conducted by technical interviewers with relevant engineering expertise. The specific interviewer and available topics depend on the slot you select. Ask support if you need interviewer details before booking." },
    { question: "Can I choose DSA, LLD, HLD, GenAI or project discussion?", answer: "Yes. Each slot lists its supported topics and maximum number of selections. You choose from those topics during booking, then add notes about your target role and areas to practice." },
    { question: "Will I receive detailed feedback?", answer: "Yes. Your interviewer will discuss your technical approach, problem solving, communication and areas to improve. A written report is included only when indicated in the selected slot or confirmed by support." },
    { question: "Do I need to create an account?", answer: "No. Select an available slot, provide your contact details and complete the guest checkout." },
    { question: "When is my booking confirmed?", answer: "Your booking is confirmed only after the backend verifies successful payment. If checkout is interrupted, use the payment-status link rather than immediately paying again." },
    { question: "How do I get the joining link?", answer: "Your confirmation and joining information are sent to your booking email. If the meeting link is assigned later, it is shared separately." },
    { question: "What is the cancellation policy?", answer: "For candidate-requested cancellation, contact supporttargettrek@gmail.com at least 24 hours before the interview. The stated cancellation fee is ₹199; requests made less than 24 hours before the interview are non-refundable. Check the current terms before paying." },
    { question: "Will the mock interview guarantee an offer?", answer: "No. The session is intended to improve your preparation, technical reasoning and interview communication; hiring outcomes depend on many factors." },
];
/* =========================================================
   THEME

   Uses the theme from your Navbar.
   No duplicate theme toggle.
========================================================= */
function readTheme() {
    if (typeof window === "undefined") {
        return "light";
    }
    try {
        const saved = localStorage.getItem("theme");
        if (saved === "light" ||
            saved === "dark") {
            return saved;
        }
        return document.documentElement.classList
            .contains("dark")
            ? "dark"
            : "light";
    }
    catch {
        return "light";
    }
}
function useNavbarTheme() {
    const [theme, setTheme] = useState(readTheme);
    useEffect(() => {
        const sync = () => {
            setTheme(readTheme());
        };
        window.addEventListener("storage", sync);
        window.addEventListener("themechange", sync);
        window.addEventListener("targettrek-theme-change", sync);
        const observer = new MutationObserver(sync);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: [
                "class",
                "data-theme",
            ],
        });
        return () => {
            window.removeEventListener("storage", sync);
            window.removeEventListener("themechange", sync);
            window.removeEventListener("targettrek-theme-change", sync);
            observer.disconnect();
        };
    }, []);
    return theme;
}
/* =========================================================
   DATE HELPERS — IST
========================================================= */
function fmtDate(value, options = {}) {
    if (!value)
        return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "—";
    }
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: TIMEZONE,
        ...options,
    }).format(date);
}
function fmtTime(value, timeZone = TIMEZONE, timeFormat = "12") {
    return fmtDate(value, {
        timeZone,
        hour: timeFormat === "24" ? "2-digit" : "numeric",
        minute: "2-digit",
        hour12: timeFormat !== "24",
    });
}

function fmtSlotDate(value, timeZone = TIMEZONE) {
    return fmtDate(value, {
        timeZone,
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
function fmtMoney(value, currency = "INR") {
    const amount = Number(value);
    if (!Number.isFinite(amount)) {
        return "—";
    }
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
            maximumFractionDigits: 2,
        }).format(amount);
    }
    catch {
        return `₹${amount}`;
    }
}
function dateKey(date) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(date);
    const get = (type) => parts.find((part) => part.type === type)?.value;
    return [
        get("year"),
        get("month"),
        get("day"),
    ].join("-");
}
function upcomingDays() {
    const result = [];
    const seen = new Set();
    const now = new Date();
    for (let i = 0; result.length < 8 && i < 22; i++) {
        const date = new Date(now.getTime() +
            i * 12 * 60 * 60 * 1000);
        const key = dateKey(date);
        if (!seen.has(key)) {
            seen.add(key);
            result.push({
                key,
                date,
            });
        }
    }
    return result;
}
function selectedDateLabel(day) {
    if (!day)
        return "";
    return fmtDate(`${day}T12:00:00+05:30`, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}
function paymentStatusUrl(bookingId) {
    return (`${PAYMENT_STATUS_PATH}?bookingId=` +
        encodeURIComponent(bookingId));
}
/* =========================================================
   PUBLIC API HELPER

   IMPORTANT:
   - NO JWT
   - NO ACCOUNT LOGIN
   - NO AUTHORIZATION HEADER
   - NO AUTH REDIRECT

   Uses the public Express endpoints.
========================================================= */
async function apiRequest(path, { method = "GET", body, signal, } = {}) {
    const headers = {
        Accept: "application/json",
    };
    if (body !== undefined) {
        headers["Content-Type"] =
            "application/json";
    }
    const response = await fetch(`${API}${path}`, {
        method,
        headers,
        signal,
        cache: "no-store",
        ...(body !== undefined
            ? {
                body: JSON.stringify(body),
            }
            : {}),
    });
    const data = await response
        .json()
        .catch(() => ({}));
    if (!response.ok ||
        data.success === false) {
        const error = new Error(data.message ||
            `Request failed (${response.status})`);
        error.status = response.status;
        error.code = data.code;
        throw error;
    }
    return data;
}
/* =========================================================
   CASHFREE SDK

   SDK is loaded only when payment starts.
========================================================= */
let cashfreeLoadPromise = null;
function loadCashfreeSDK() {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("Cashfree checkout requires a browser."));
    }
    if (window.Cashfree) {
        return Promise.resolve(window.Cashfree);
    }
    if (!cashfreeLoadPromise) {
        cashfreeLoadPromise = new Promise((resolve, reject) => {
            const src = "https://sdk.cashfree.com/js/v3/cashfree.js";
            let script = document.querySelector(`script[src="${src}"]`);
            if (!script) {
                script =
                    document.createElement("script");
                script.src = src;
                script.async = true;
            }
            const onLoad = () => {
                if (window.Cashfree) {
                    resolve(window.Cashfree);
                }
                else {
                    reject(new Error("Cashfree SDK is unavailable."));
                }
            };
            const onError = () => {
                reject(new Error("Unable to load Cashfree checkout."));
            };
            script.addEventListener("load", onLoad, { once: true });
            script.addEventListener("error", onError, { once: true });
            if (!script.isConnected) {
                document.head.appendChild(script);
            }
            if (window.Cashfree) {
                resolve(window.Cashfree);
            }
        }).catch((error) => {
            cashfreeLoadPromise = null;
            throw error;
        });
    }
    return cashfreeLoadPromise;
}
/* =========================================================
   FORM DATA
========================================================= */
const emptyCandidate = {
    name: "",
    email: "",
    phone: "",
    experienceYears: "",
    currentRole: "",
    targetRole: "",
    currentCompany: "",
    resumeUrl: "",
    notes: "",
};
function validateCandidate(candidate) {
    if (candidate.name.trim().length < 2) {
        return "Please enter your full name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email.trim())) {
        return "Please enter a valid email address.";
    }
    const phone = candidate.phone.replace(/[\s()-]/g, "");
    if (!/^\+?\d{10,15}$/.test(phone)) {
        return "Please enter a valid phone number.";
    }
    if (candidate.experienceYears !== "") {
        const years = Number(candidate.experienceYears);
        if (!Number.isFinite(years) ||
            years < 0 ||
            years > 50) {
            return "Experience must be between 0 and 50 years.";
        }
    }
    if (candidate.resumeUrl.trim()) {
        try {
            const url = new URL(candidate.resumeUrl.trim());
            if (!["http:", "https:"].includes(url.protocol)) {
                return "Enter a valid resume URL.";
            }
        }
        catch {
            return "Enter a valid resume URL.";
        }
    }
    return "";
}
/* =========================================================
   SCOPED STYLES

   Compatible with:
   - Light theme
   - Dark theme
   - Mobile
   - Tablet
   - Desktop
========================================================= */
const styles = `
.tt-ib {
  --ib-bg: #fffcf8;
  --ib-surface: #ffffff;
  --ib-alt: #fff4e8;
  --ib-text: #28211d;
  --ib-muted: #74665c;
  --ib-border: #eadfd4;
  --ib-orange: #ea580c;
  --ib-orange-light: #ffedd5;
  --ib-input: #ffffff;
  --ib-green: #166534;
  --ib-green-bg: #ecfdf3;
  --ib-red: #b91c1c;
  --ib-red-bg: #fef2f2;

  background: var(--ib-bg);
  color: var(--ib-text);
  font-family: Inter, system-ui, sans-serif;
  color-scheme: light;
  min-height: 100vh;
}

.tt-ib[data-ib-theme="dark"] {
  --ib-bg: #15110e;
  --ib-surface: #231c17;
  --ib-alt: #302118;
  --ib-text: #fff8f1;
  --ib-muted: #c2b1a4;
  --ib-border: #49372c;
  --ib-orange: #fb923c;
  --ib-orange-light: #38261a;
  --ib-input: #291f19;
  --ib-green: #86efac;
  --ib-green-bg: #153424;
  --ib-red: #fca5a5;
  --ib-red-bg: #3b1e20;

  color-scheme: dark;
}

.tt-ib *,
.tt-ib *::before,
.tt-ib *::after {
  box-sizing: border-box;
}

.tt-ib .ib-card {
  background: var(--ib-surface);
  border: 1px solid var(--ib-border);
  color: var(--ib-text);
}

.tt-ib .ib-panel {
  background: var(--ib-alt);
}

.tt-ib .ib-muted {
  color: var(--ib-muted);
}

.tt-ib .ib-orange {
  color: var(--ib-orange);
}

.tt-ib .ib-field {
  width: 100%;
  background: var(--ib-input);
  color: var(--ib-text);
  border: 1px solid var(--ib-border);
  border-radius: 12px;
  padding: 12px 13px;
  font-size: 14px;
  outline: none;
}

.tt-ib .ib-field:focus {
  border-color: var(--ib-orange);
  box-shadow: 0 0 0 3px rgba(234,88,12,.13);
}

.tt-ib .ib-field::placeholder {
  color: var(--ib-muted);
  opacity: .75;
}

.tt-ib .ib-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  background: #ea580c;
  color: #ffffff !important;
  border: 1px solid #ea580c;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
  transition: .18s ease;
}

.tt-ib .ib-primary:hover:not(:disabled) {
  background: #c2410c;
}

.tt-ib .ib-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--ib-surface);
  color: var(--ib-text);
  border: 1px solid var(--ib-border);
  border-radius: 12px;
  padding: 11px 15px;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  text-decoration: none;
  transition: .18s ease;
}

.tt-ib .ib-outline:hover:not(:disabled) {
  border-color: var(--ib-orange);
}

.tt-ib button:disabled {
  opacity: .52;
  cursor: not-allowed;
}

.tt-ib .ib-selected {
  border-color: var(--ib-orange) !important;
  background: var(--ib-alt) !important;
}

.tt-ib .ib-status-available {
  background: var(--ib-green-bg);
  color: var(--ib-green);
}

.tt-ib .ib-status-unavailable {
  background: var(--ib-red-bg);
  color: var(--ib-red);
}

.tt-ib .ib-status-held {
  background: var(--ib-orange-light);
  color: var(--ib-orange);
}

.tt-ib .ib-input-label {
  display: block;
  font-size: 12px;
  font-weight: 750;
  margin-bottom: 7px;
}

.tt-ib .ib-progress {
  height: 6px;
  background: var(--ib-border);
  border-radius: 999px;
}

.tt-ib .ib-progress-active {
  background: #ea580c;
}

.tt-ib .ib-overlay {
  background: rgba(8,5,3,.86) !important;
}

.tt-ib .ib-modal-surface {
  background: var(--ib-surface) !important;
  color: var(--ib-text) !important;
  isolation: isolate;
  box-shadow: 0 35px 115px rgba(0,0,0,.5);
}

.tt-ib .ib-error {
  background: var(--ib-red-bg);
  color: var(--ib-red);
  border: 1px solid var(--ib-border);
}

.tt-ib .ib-recovery {
  background: var(--ib-orange-light);
  border: 1px solid var(--ib-border);
}

.tt-ib .ib-modal-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--ib-border) transparent;
  overscroll-behavior: contain;
}

.tt-ib a {
  text-decoration: none;
}

.tt-ib button,
.tt-ib input,
.tt-ib textarea {
  font: inherit;
}

.tt-ib .ib-day:hover,
.tt-ib .ib-slot:hover {
  border-color: var(--ib-orange);
}

.tt-ib .ib-slot {
  transition: border-color .18s, transform .18s;
}

.tt-ib .ib-slot:hover:not(:disabled) {
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .tt-ib .ib-modal-surface {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tt-ib *,
  .tt-ib *::before,
  .tt-ib *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
`;
/* =========================================================
   SHARED COMPONENTS
========================================================= */
function StatusPill({ slot }) {
    const status = String(slot.status || "AVAILABLE")
        .toUpperCase();
    let label = "Unavailable";
    let className = "ib-status-unavailable";
    if (status === "AVAILABLE") {
        label = "Available";
        className =
            "ib-status-available";
    }
    else if (status === "BOOKED") {
        label = "Booked";
    }
    else if (status === "HELD") {
        label = "Reserved";
        className =
            "ib-status-held";
    }
    else if (status === "BLOCKED") {
        label = "Blocked";
    }
    return (<span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${className}`}>
      {label}
    </span>);
}
function Progress({ step }) {
    const steps = [
        "Topics",
        "Your details",
        "Payment",
    ];
    return (<div className="grid grid-cols-3 gap-2">
      {steps.map((name, index) => (<div key={name} className="space-y-2">
          <div className={index <= step
                ? "ib-progress ib-progress-active"
                : "ib-progress"}/>

          <span className={`text-[11px] ${index === step
                ? "font-extrabold ib-orange"
                : "ib-muted"}`}>
            {index + 1}. {name}
          </span>
        </div>))}
    </div>);
}
function TopicCard({ topic, selected, disabled, onClick, }) {
    const info = TOPIC_INFO[topic];
    if (!info)
        return null;
    const Icon = info.Icon;
    return (<button type="button" disabled={disabled} onClick={onClick} aria-pressed={selected} className={`ib-card flex items-start gap-3 rounded-xl p-4 text-left ${selected ? "ib-selected" : ""}`}>
      <span className="ib-panel rounded-lg p-2">
        <Icon size={18} className="ib-orange"/>
      </span>

      <span className="min-w-0 flex-1">
        <strong className="block text-sm">
          {info.title}
        </strong>

        <span className="ib-muted mt-1 block text-xs leading-5">
          {info.description}
        </span>
      </span>

      {selected && (<CheckCircle2 size={18} className="ib-orange shrink-0"/>)}
    </button>);
}
function TextField({ label, value, onChange, placeholder, type = "text", required = false, maxLength, min, max, step, className = "", }) {
    return (<label className={className}>
      <span className="ib-input-label">
        {label}
        {required && " *"}
      </span>

      <input type={type} className="ib-field" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} maxLength={maxLength} min={min} max={max} step={step}/>
    </label>);
}
/* =========================================================
   BOOKING MODAL

   Step 1: Topics
   Step 2: Candidate details
   Step 3: Payment

   NO LOGIN OR TOKEN REQUIRED.
========================================================= */
function BookingModal({ slot, onClose, cashfreeMode, theme, timeZone = TIMEZONE, timeFormat = "12" }) {
    const [step, setStep] = useState(0);
    const [topics, setTopics] = useState([]);
    const [candidate, setCandidate] = useState(emptyCandidate);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [bookingId, setBookingId] = useState("");
    const [paymentStarted, setPaymentStarted,] = useState(false);
    const processingRef = useRef(false);
    const availableTopics = (Array.isArray(slot.allowedTopics) &&
        slot.allowedTopics.length > 0
        ? slot.allowedTopics
        : ALL_TOPICS).filter((topic) => Boolean(TOPIC_INFO[topic]));
    const maxTopics = Math.min(Math.max(1, Number(slot.maxTopics) || 3), availableTopics.length);
    const priceText = fmtMoney(slot.price, slot.currency);
    const detailsError = validateCandidate(candidate);
    const change = (key, value) => {
        setCandidate((previous) => ({
            ...previous,
            [key]: value,
        }));
    };
    const toggleTopic = (topic) => {
        setTopics((previous) => {
            if (previous.includes(topic)) {
                return previous.filter((item) => item !== topic);
            }
            if (previous.length >= maxTopics) {
                return previous;
            }
            return [...previous, topic];
        });
    };
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow =
            "hidden";
        return () => {
            document.body.style.overflow =
                previousOverflow;
        };
    }, []);
    useEffect(() => {
        const onKeyDown = (event) => {
            if (event.key === "Escape" &&
                !busy &&
                !processingRef.current) {
                onClose();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [busy, onClose]);
    /* =====================================================
       PUBLIC CHECKOUT
  
       1. Load Cashfree
       2. Create booking
       3. Create payment
       4. Open Cashfree
       5. Redirect to payment-status
  
       No JWT used in any request.
    ===================================================== */
    async function checkout() {
        if (busy || processingRef.current)
            return;
        setError("");
        if (topics.length === 0) {
            setError("Select at least one interview topic.");
            setStep(0);
            return;
        }
        const validationError = validateCandidate(candidate);
        if (validationError) {
            setError(validationError);
            setStep(1);
            return;
        }
        // Never create another payment when a gateway order was already started.
        if (paymentStarted && bookingId) {
            window.location.assign(paymentStatusUrl(bookingId));
            return;
        }
        processingRef.current = true;
        setBusy(true);
        let currentBookingId = bookingId;
        try {
            // Preload the same Cashfree v3 SDK used by your book checkout.
            const Cashfree = await loadCashfreeSDK();
            if (typeof Cashfree !== "function") {
                throw new Error("Unable to initialize Cashfree.");
            }
            // Guest booking: no JWT, no Authorization header.
            if (!currentBookingId) {
                const bookingResponse = await apiRequest("/bookings", {
                    method: "POST",
                    body: {
                        slotId: slot._id,
                        selectedTopics: topics,
                        candidate: {
                            name: candidate.name.trim(),
                            email: candidate.email.trim(),
                            phone: candidate.phone.trim(),
                            experienceYears: candidate.experienceYears === ""
                                ? 0
                                : Number(candidate.experienceYears),
                            currentRole: candidate.currentRole.trim(),
                            targetRole: candidate.targetRole.trim(),
                            currentCompany: candidate.currentCompany.trim(),
                            resumeUrl: candidate.resumeUrl.trim(),
                            notes: candidate.notes.trim(),
                        },
                    },
                });
                currentBookingId =
                    bookingResponse?.data?.bookingId ||
                        bookingResponse?.bookingId ||
                        bookingResponse?.data?.booking?.bookingId ||
                        bookingResponse?.booking?.bookingId;
                if (!currentBookingId) {
                    throw new Error("Booking was created but no booking ID was returned.");
                }
                setBookingId(currentBookingId);
            }
            // Create order and get session, never manufacture one in the browser.
            const paymentResponse = await apiRequest(`/bookings/${encodeURIComponent(currentBookingId)}/payment`, { method: "POST" });
            const paymentData = paymentResponse?.data || paymentResponse;
            const gatewayData = paymentData?.gatewayOrder || {};
            const sessionId = paymentData?.paymentSessionId ||
                paymentData?.payment_session_id ||
                gatewayData?.payment_session_id;
            const orderId = paymentData?.orderId ||
                paymentData?.order_id ||
                gatewayData?.order_id;
            if (typeof sessionId !== "string" || !sessionId.trim()) {
                console.error("[Interview Cashfree] Missing session", {
                    responseKeys: Object.keys(paymentData || {}),
                    bookingId: currentBookingId,
                    orderId,
                });
                throw new Error("Cashfree payment API did not return a valid paymentSessionId.");
            }
            // A backend-supplied environment wins, exactly like working book flow.
            // Otherwise use the Vite environment; preserve explicit prop as fallback.
            const serverMode = String(paymentData?.environment ||
                paymentData?.cashfreeEnvironment ||
                paymentData?.cashfreeMode ||
                "").trim().toLowerCase();
            const viteMode = String(import.meta.env.VITE_CASHFREE_ENV ||
                import.meta.env.VITE_CASHFREE_MODE ||
                "").trim().toLowerCase();
            const propMode = String(cashfreeMode || "").trim().toLowerCase();
            const mode = ["sandbox", "production"].includes(serverMode)
                ? serverMode
                : ["sandbox", "production"].includes(viteMode)
                    ? viteMode
                    : propMode;
            if (!["sandbox", "production"].includes(mode)) {
                throw new Error("Cashfree SDK environment is not configured.");
            }
            console.info("[Mock Interview Checkout]", {
                bookingId: currentBookingId,
                orderId,
                sdkMode: mode,
                serverMode: serverMode || "not returned",
                sessionExists: true,
                sessionLength: sessionId.trim().length,
                sessionPrefix: sessionId.trim().slice(0, 8),
            });
            // Order exists; do not generate an additional order on repeated clicks.
            setPaymentStarted(true);
            const cashfree = Cashfree({ mode });
            if (!cashfree || typeof cashfree.checkout !== "function") {
                throw new Error("Cashfree checkout is unavailable.");
            }
            const result = await cashfree.checkout({
                paymentSessionId: sessionId.trim(),
                redirectTarget: "_self",
            });
            if (result?.error) {
                const error = new Error(result.error.message || "Cashfree could not open checkout.");
                error.code = result.error.code;
                throw error;
            }
            // Do not mark paid: webhook / server reconciliation decides success.
        }
        catch (err) {
            console.error("[Mock Interview Payment Error]", {
                bookingId: currentBookingId,
                message: err.message,
                code: err.code,
                httpStatus: err.status,
            });
            if (err.status === 401 || err.status === 403) {
                setError("The server refused this public booking request. Check whether the deployed booking or payment endpoint requires authentication.");
            }
            else {
                setError(currentBookingId
                    ? `${err.message || "Unable to start payment."} Your booking reference has been saved. Check its status before attempting another payment.`
                    : err.message || "Unable to open payment gateway.");
            }
        }
        finally {
            processingRef.current = false;
            setBusy(false);
        }
    }
    const modal = (<motion.div data-ib-theme={theme} className="tt-ib !min-h-0 fixed inset-0 !m-0 z-[2147483000] flex items-end justify-center sm:items-center sm:p-5" style={{
            background: "transparent",
            isolation: "isolate",
        }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* BACKDROP */}

      <button type="button" aria-label="Close booking dialog" disabled={busy} onClick={onClose} className="ib-overlay absolute inset-0 z-0 w-full"/>

      {/* MODAL */}

      <motion.section role="dialog" aria-modal="true" aria-label="Book mock interview" className="ib-card ib-modal-surface relative z-10 flex max-h-[96dvh] w-full max-w-[730px] flex-col overflow-hidden rounded-t-3xl sm:max-h-[91dvh] sm:rounded-3xl" initial={{
            y: 30,
            opacity: 0,
        }} animate={{
            y: 0,
            opacity: 1,
        }} exit={{
            y: 25,
            opacity: 0,
        }}>
        {/* HEADER */}

        <div className="flex shrink-0 items-center justify-between gap-3 border-b px-5 py-4 sm:px-7" style={{
            borderColor: "var(--ib-border)",
        }}>
          <div>
            <div className="ib-orange text-[10px] font-black uppercase tracking-widest">
              Target Trek · Live 1:1
            </div>

            <h2 className="mt-1 text-lg font-black sm:text-xl">
              Book your mock interview
            </h2>
          </div>

          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="ib-outline !p-2">
            <X size={18}/>
          </button>
        </div>

        {/* BODY */}

        <div className="ib-modal-scroll flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <Progress step={step}/>

          {/* SLOT SUMMARY */}

          <div className="ib-panel mt-5 rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>
                {fmtDate(slot.startTime, {
            timeZone,
            weekday: "long",
            day: "numeric",
            month: "short",
        })}
              </strong>

              <span className="ib-orange text-lg font-black">
                {priceText}
              </span>
            </div>

            <div className="ib-muted mt-2 flex flex-wrap items-center gap-2 text-sm">
              <Clock3 size={14}/>

              {fmtTime(slot.startTime, timeZone, timeFormat)}

              {" – "}

              {fmtTime(slot.endTime, timeZone, timeFormat)}

              {" · "}

              {slot.durationMinutes} min

              {` · ${DISPLAY_TIMEZONES.find(zone => zone.value === timeZone)?.short || timeZone}`}
            </div>
          </div>

          {/* ==================================
          STEP 1: TOPICS
      ================================== */}

          {step === 0 && (<div className="mt-6">
              <h3 className="text-lg font-extrabold">
                What would you like to practice?
              </h3>

              <p className="ib-muted mt-2 text-sm leading-7">
                Select up to {maxTopics}{" "}
                topics. Your interviewer can
                tailor the session to your
                experience and target role.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {availableTopics.map((topic) => (<TopicCard key={topic} topic={topic} selected={topics.includes(topic)} onClick={() => toggleTopic(topic)}/>))}
              </div>
            </div>)}

          {/* ==================================
          STEP 2: CANDIDATE DETAILS
      ================================== */}

          {step === 1 && (<div className="mt-6">
              <h3 className="text-lg font-extrabold">
                Tell us about yourself
              </h3>

              <p className="ib-muted mt-2 text-sm leading-7">
                No account is required.
                Enter your details so we can
                prepare your session and send
                interview information by email.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <TextField label="Full name" required value={candidate.name} onChange={(value) => change("name", value)} placeholder="Your full name" maxLength={120}/>

                <TextField label="Email address" required type="email" value={candidate.email} onChange={(value) => change("email", value)} placeholder="you@example.com" maxLength={254}/>

                <TextField label="Phone number" required type="tel" value={candidate.phone} onChange={(value) => change("phone", value)} placeholder="+91 9876543210"/>

                <TextField label="Experience (years)" type="number" min="0" max="50" step="0.5" value={candidate.experienceYears} onChange={(value) => change("experienceYears", value)} placeholder="2"/>

                <TextField label="Current role" value={candidate.currentRole} onChange={(value) => change("currentRole", value)} placeholder="Software Engineer" maxLength={120}/>

                <TextField label="Target role" value={candidate.targetRole} onChange={(value) => change("targetRole", value)} placeholder="SDE-2 / Backend Engineer" maxLength={120}/>

                <TextField label="Current company" value={candidate.currentCompany} onChange={(value) => change("currentCompany", value)} placeholder="Optional" maxLength={120}/>

                <TextField label="Resume URL" type="url" value={candidate.resumeUrl} onChange={(value) => change("resumeUrl", value)} placeholder="https://drive.google.com/..."/>

                <label className="sm:col-span-2">
                  <span className="ib-input-label">
                    What should we focus on?
                  </span>

                  <textarea className="ib-field min-h-[105px] resize-y" value={candidate.notes} onChange={(event) => change("notes", event.target.value)} placeholder="Share your goals, upcoming interview, weaker topics or projects." maxLength={3000}/>
                </label>
              </div>

              <div className="ib-panel mt-5 flex items-start gap-3 rounded-xl p-4">
                <Mail size={18} className="ib-orange mt-0.5 shrink-0"/>

                <p className="ib-muted text-xs leading-6">
                  Your interview confirmation
                  and joining instructions will
                  be sent to your email after
                  payment verification. If the
                  meeting link is not yet
                  assigned, it will be shared
                  separately.
                </p>
              </div>
            </div>)}

          {/* ==================================
          STEP 3: REVIEW AND PAYMENT
      ================================== */}

          {step === 2 && (<div className="mt-6">
              <h3 className="text-lg font-extrabold">
                Review your booking
              </h3>

              <p className="ib-muted mt-2 text-sm leading-7">
                Review everything before
                continuing to Cashfree's
                secure checkout.
              </p>

              <div className="ib-card mt-4 overflow-hidden rounded-2xl">
                <div className="space-y-4 p-4 text-sm sm:p-5">
                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Interview topics
                    </span>

                    <strong className="max-w-[60%] text-right">
                      {topics.join(" · ")}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Candidate
                    </span>

                    <strong className="text-right">
                      {candidate.name}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Email
                    </span>

                    <strong className="break-all text-right">
                      {candidate.email}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Interview date
                    </span>

                    <strong className="text-right">
                      {fmtDate(slot.startTime, {
                timeZone,
                day: "numeric",
                month: "short",
                year: "numeric",
            })}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Interview time
                    </span>

                    <strong className="text-right">
                      {fmtTime(slot.startTime, timeZone, timeFormat)}{" "}
                      {DISPLAY_TIMEZONES.find(zone => zone.value === timeZone)?.short || timeZone}
                    </strong>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="ib-muted">
                      Duration
                    </span>

                    <strong>
                      {slot.durationMinutes}{" "}
                      minutes
                    </strong>
                  </div>
                </div>

                <div className="ib-panel flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                  <strong>
                    Total to pay
                  </strong>

                  <div className="text-right">
                    {Number(slot.mrp) >
                Number(slot.price) && (<span className="ib-muted mr-2 text-xs line-through">
                        {fmtMoney(slot.mrp, slot.currency)}
                      </span>)}

                    <span className="ib-orange text-2xl font-black">
                      {priceText}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ib-muted mt-4 flex items-start gap-2 text-xs leading-6">
                <LockKeyhole size={17} className="mt-0.5 shrink-0"/>

                Cashfree securely processes
                the payment. Your interview
                is confirmed only after the
                backend verifies successful
                payment.
              </div>
            </div>)}

          {/* ERRORS */}

          {error && (<div role="alert" className="ib-error mt-5 flex items-start gap-2 rounded-xl p-4 text-sm">
              <AlertCircle size={18} className="shrink-0"/>

              <span>{error}</span>
            </div>)}

          {/* BOOKING RECOVERY */}

          {bookingId && (<div className="ib-recovery mt-5 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="ib-orange shrink-0"/>

                <div className="min-w-0">
                  <strong className="text-sm">
                    Booking reference created
                  </strong>

                  <p className="ib-muted mt-1 break-all text-xs">
                    {bookingId}
                  </p>

                  <p className="ib-muted mt-2 text-xs leading-6">
                    If checkout was interrupted,
                    check your booking's payment
                    status before making another
                    payment.
                  </p>

                  <a href={paymentStatusUrl(bookingId)} className="ib-outline mt-3">
                    <RefreshCw size={15}/>

                    Check Payment Status

                    <ArrowRight size={15}/>
                  </a>
                </div>
              </div>
            </div>)}
        </div>

        {/* FOOTER */}

        <div className="flex shrink-0 items-center justify-between gap-2 border-t p-4 sm:px-7" style={{
            borderColor: "var(--ib-border)",
        }}>
          <button type="button" disabled={busy} className="ib-outline" onClick={step === 0
            ? onClose
            : () => {
                setError("");
                setStep(step - 1);
            }}>
            <ArrowLeft size={16}/>

            {step === 0
            ? "Close"
            : "Back"}
          </button>

          {step < 2 ? (<button type="button" className="ib-primary" disabled={step === 0
                ? topics.length === 0
                : Boolean(detailsError)} onClick={() => {
                setError("");
                if (step === 1 &&
                    detailsError) {
                    setError(detailsError);
                    return;
                }
                setStep(step + 1);
            }}>
              Continue

              <ArrowRight size={16}/>
            </button>) : (<button type="button" className="ib-primary" disabled={busy} onClick={checkout}>
              {busy ? (<LoaderCircle size={17} className="animate-spin"/>) : (<CreditCard size={17}/>)}

              {busy
                ? "Processing..."
                : paymentStarted
                    ? "Check Payment"
                    : `Pay ${priceText}`}
            </button>)}
        </div>
      </motion.section>
    </motion.div>);
    if (typeof document === "undefined") {
        return null;
    }
    return createPortal(modal, document.body);
}
/* =========================================================
   MAIN PAGE

   PUBLIC GUEST BOOKING PAGE.

   No authToken prop.
   No onLoginRequired prop.
   No Redux user.
   No login redirect.
========================================================= */
function SectionIntro({ eyebrow, title, description, center = false }) {
    return (<div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <span className="ib-orange text-xs font-black uppercase tracking-[.17em]">{eyebrow}</span>
      <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="ib-muted mt-4 text-sm leading-7 sm:text-base">{description}</p>}
    </div>);
}
function MarketingSections({ openFaq, setOpenFaq }) {
    return (<>
      <section id="what-you-get" className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8" style={{ background: "var(--ib-alt)" }}>
        <div className="mx-auto max-w-6xl">
          <SectionIntro eyebrow="Your interview, your growth" title="More than another practice question" description="A live session designed to expose blind spots before your real interview and give you concrete areas to work on."/>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SESSION_BENEFITS.map(({ Icon, title, description }) => (<div key={title} className="ib-card rounded-2xl p-6">
                <div className="ib-panel inline-flex rounded-xl p-3"><Icon className="ib-orange" size={23}/></div>
                <h3 className="mt-4 text-base font-extrabold">{title}</h3>
                <p className="ib-muted mt-2 text-sm leading-7">{description}</p>
              </div>))}
          </div>
        </div>
      </section>

      <section id="top-company-prep" className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionIntro eyebrow="Aim higher" title="Prepare for FAANG, MAANG and other leading tech interviews" description="Build the core coding, backend, system design and communication skills used in challenging software engineering interview processes."/>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {TARGET_COMPANIES.map(company => <CompanyLogo key={company.name} company={company}/>)}
          </div>
          <p className="ib-muted mt-4 text-xs leading-6">These are preparation targets, not employers or partners of Target Trek. Mock interviews do not guarantee selection or offers.</p>
        </div>
      </section>

      <section id="interview-topics" className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionIntro eyebrow="What we can cover" title="Prepare for the rounds that matter" description="Pick a slot supporting your chosen track. Every session is focused on depth, reasoning and clear communication—not simply memorizing answers."/>
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {CURRICULUM.map(({ key, Icon, title, tagline, points }) => (<article key={key} className="ib-card rounded-2xl p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="ib-panel rounded-xl p-3"><Icon className="ib-orange" size={22}/></div>
                  <div><h3 className="text-lg font-extrabold">{title}</h3><p className="ib-muted mt-1 text-sm">{tagline}</p></div>
                </div>
                <ul className="mt-5 grid gap-3">
                  {points.map(point => <li key={point} className="flex gap-2 text-sm leading-6"><Check size={16} className="ib-orange mt-1 shrink-0"/><span>{point}</span></li>)}
                </ul>
              </article>))}
            <article className="rounded-2xl p-6 text-white" style={{ background: "linear-gradient(120deg,#9a3412,#ea580c)" }}>
              <GraduationCap size={29}/>
              <h3 className="mt-4 text-xl font-black">Preparing for a specific company or round?</h3>
              <p className="mt-3 text-sm leading-7 text-white/90">Share the job description, target role or topics in your booking notes. Your interviewer can use that context within the duration and selected session's supported tracks.</p>
              <a className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-orange-800" href="#interview-slots">Choose your session <ArrowRight size={16}/></a>
            </article>
          </div>
        </div>
      </section>

      <section id="session-experience" className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8" style={{ background: "var(--ib-alt)" }}>
        <div className="mx-auto max-w-6xl">
          <SectionIntro eyebrow="Inside the session" title="Experience an interview—not a lecture" description="A flexible flow built around your selected topics and session duration."/>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
            ["01", "Introduction", "Your experience, target role, upcoming interviews and expectations."],
            ["02", "Technical round", "Live coding, system design, GenAI or project discussion, depending on your selected topics."],
            ["03", "Follow-ups", "Edge cases, optimizations, architecture alternatives and deeper why-questions."],
            ["04", "Feedback", "Talk through strengths, improvement areas and suggested next practice steps."],
        ].map(([number, title, description]) => <div key={number} className="ib-card rounded-2xl p-6"><span className="ib-orange text-3xl font-black">{number}</span><h3 className="mt-4 text-lg font-extrabold">{title}</h3><p className="ib-muted mt-2 text-sm leading-7">{description}</p></div>)}
          </div>
          <p className="ib-muted mt-4 text-xs leading-6">Session length controls how deeply individual topics can be covered. No specific interview question or hiring result is guaranteed.</p>
        </div>
      </section>

      <section id="who-its-for" className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionIntro eyebrow="Made for your next step" title="Who should book a mock interview?" description="Whether you're starting out or targeting your next engineering role, focused practice helps you prepare more deliberately."/>
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
            ["Students & freshers", "Get comfortable with live coding, problem explanations and fundamental CS questions."],
            ["SDE-1 candidates", "Sharpen DSA, backend basics, project walkthroughs and communication."],
            ["SDE-2 candidates", "Practice design depth, scalability, concurrency and decision-making trade-offs."],
            ["Backend & GenAI engineers", "Discuss APIs, microservices, RAG, agents and production architecture."],
        ].map(([title, description]) => <div key={title} className="ib-card rounded-2xl p-5"><BadgeCheck className="ib-orange" size={24}/><h3 className="mt-4 font-extrabold">{title}</h3><p className="ib-muted mt-2 text-sm leading-7">{description}</p></div>)}
          </div>
        </div>
      </section>

      <section id="mock-faq" className="scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8" style={{ background: "var(--ib-alt)" }}>
        <div className="mx-auto max-w-4xl">
          <SectionIntro eyebrow="FAQs" title="Everything to know before booking" description="Clear answers about eligibility, topics, feedback, checkout and cancellations."/>
          <div className="mt-8 space-y-3">
            {FAQ_ITEMS.map((item, index) => (<div key={item.question} className="ib-card overflow-hidden rounded-2xl">
                <button type="button" className="flex w-full items-center justify-between gap-4 p-5 text-left font-bold" aria-expanded={openFaq === index} onClick={() => setOpenFaq(old => old === index ? -1 : index)}>
                  <span>{item.question}</span><ChevronDown size={19} className={`ib-orange shrink-0 transition-transform ${openFaq === index ? "rotate-180" : ""}`}/>
                </button>
                {openFaq === index && <p className="ib-muted border-t px-5 pb-5 pt-4 text-sm leading-7" style={{ borderColor: "var(--ib-border)" }}>{item.answer}</p>}
              </div>))}
          </div>
          <div className="mt-9 rounded-3xl p-7 text-white sm:p-9" style={{ background: "linear-gradient(120deg,#9a3412,#ea580c)" }}>
            <h3 className="text-2xl font-black">Ready to find your weak spots before the real interview?</h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/90">Choose a date, pick your preferred technical areas and book your live 1:1 mock interview.</p>
            <a href="#interview-slots" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-orange-800">View available sessions <ArrowRight size={17}/></a>
          </div>
        </div>
      </section>
    </>);
}
export default function InterviewBookingPage({ cashfreeMode = DEFAULT_CASHFREE_MODE, }) {
    const theme = useNavbarTheme();
    const [openFaq, setOpenFaq] = useState(0);
    // Display preferences only. Server availability dates remain IST and checkout uses slot._id.
    const [timeZone, setTimeZone] = useState(TIMEZONE);
    const [timeFormat, setTimeFormat] = useState("12");
    const displayZone = DISPLAY_TIMEZONES.find(zone => zone.value === timeZone)?.short || timeZone;
    const days = useMemo(upcomingDays, []);
    const [selectedDay, setSelectedDay,] = useState(() => days[0]?.key || "");
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [selectedSlot, setSelectedSlot,] = useState(null);
    const [viewFilter, setViewFilter,] = useState("all");
    const [topicFilter, setTopicFilter,] = useState("all");
    /* =====================================================
       GET PUBLIC SLOTS
  
       GET /api/interviews/slots
  
       No token required.
    ===================================================== */
    const fetchSlots = useCallback(async (signal) => {
        if (!selectedDay) {
            return;
        }
        setLoading(true);
        setLoadError("");
        try {
            const result = await apiRequest(`/slots?date=${encodeURIComponent(selectedDay)}&includeUnavailable=true`, { signal });
            const list = Array.isArray(result.data)
                ? result.data
                : Array.isArray(result.data?.slots)
                    ? result.data.slots
                    : [];
            if (!signal?.aborted) {
                setSlots(list.filter((slot) => !slot.isDeleted));
            }
        }
        catch (error) {
            if (error.name !== "AbortError") {
                setSlots([]);
                setLoadError(error.message ||
                    "Unable to load interview slots.");
            }
        }
        finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, [selectedDay]);
    useEffect(() => {
        const controller = new AbortController();
        fetchSlots(controller.signal);
        return () => controller.abort();
    }, [fetchSlots]);
    /* =====================================================
       FILTERS
    ===================================================== */
    const shownSlots = useMemo(() => slots
        .filter((slot) => {
        if (viewFilter ===
            "available" &&
            slot.status !==
                "AVAILABLE") {
            return false;
        }
        if (viewFilter ===
            "unavailable" &&
            slot.status ===
                "AVAILABLE") {
            return false;
        }
        if (topicFilter !== "all" &&
            !(slot.allowedTopics ||
                []).includes(topicFilter)) {
            return false;
        }
        return true;
    })
        .sort((a, b) => new Date(a.startTime) -
        new Date(b.startTime)), [
        slots,
        viewFilter,
        topicFilter,
    ]);
    const countAvailable = slots.filter((slot) => slot.status ===
        "AVAILABLE").length;
    const countBooked = slots.filter((slot) => slot.status ===
        "BOOKED").length;
    const countHeld = slots.filter((slot) => slot.status ===
        "HELD").length;
    /* =====================================================
       OPEN MODAL
  
       No authentication check.
    ===================================================== */
    const handleBook = (slot) => {
        if (slot.status !==
            "AVAILABLE") {
            return;
        }
        setLoadError("");
        setSelectedSlot(slot);
    };
    return (<div className="tt-ib pb-20 pt-[116px] sm:pb-0 xl:pt-[76px]" data-ib-theme={theme}>
      <style>{styles}</style>

      <main>
        {/* ==========================================
            HERO
        ========================================== */}

        <section className="relative overflow-hidden px-4 pb-14 pt-12 sm:px-6 sm:pt-16 lg:px-8" style={{
            background: "linear-gradient(140deg,var(--ib-bg),var(--ib-alt))",
        }}>
          <div className="pointer-events-none absolute -right-20 top-4 h-64 w-64 rounded-full blur-3xl" style={{
            background: "rgba(249,115,22,.10)",
        }}/>

          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest" style={{
            background: "var(--ib-orange-light)",
            color: "var(--ib-orange)",
        }}>
                <span className="h-2 w-2 rounded-full bg-orange-500"/>

                Target Trek Mock Interviews
              </div>

              <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-[58px] lg:leading-[1.12]">
                Your next technical interview starts {" "}
                <span className="ib-orange">with better practice.</span>
              </h1>

              <p className="ib-muted mt-5 max-w-2xl text-base leading-8 sm:text-lg">
                Get realistic 1:1 interview practice in DSA, backend engineering,
                Java, Spring Boot, System Design and GenAI. Discuss real
                engineering trade-offs, identify weak points and become
                more confident explaining your solutions.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#interview-slots" className="ib-primary">
                  Explore Available Slots

                  <ArrowRight size={17}/>
                </a>

                <a href="#how-it-works" className="ib-outline">
                  How It Works

                  <ChevronRight size={17}/>
                </a>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PAGE_STATS.map(({ value, label, Icon }) => (<div key={label} className="ib-card rounded-xl p-3">
                    <Icon size={17} className="ib-orange"/>
                    <div className="mt-2 text-xl font-black">{value}</div>
                    <p className="ib-muted mt-1 text-[11px] leading-5">{label}</p>
                  </div>))}
              </div>

              <div className="ib-muted mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <Video size={15} className="ib-orange"/>
                  Live 1:1 Interview
                </span>

                <span className="flex items-center gap-2">
                  <MessageSquareText size={15} className="ib-orange"/>
                  Actionable Feedback
                </span>

                <span className="flex items-center gap-2">
                  <ShieldCheck size={15} className="ib-orange"/>
                  Secure Checkout
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="ib-orange"/>
                  No Account Required
                </span>
              </div>
            </div>

            {/* TOPIC CARD */}

            <div className="ib-card rounded-3xl p-5 shadow-xl sm:p-7">
              <div className="flex items-center justify-between">
                <span className="ib-orange text-xs font-bold uppercase tracking-wider">
                  What you can practice
                </span>

                <div className="ib-panel rounded-xl p-2">
                  <Sparkles size={20} className="ib-orange"/>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {ALL_TOPICS.map((topic) => {
            const info = TOPIC_INFO[topic];
            const Icon = info.Icon;
            return (<div key={topic} className="flex items-center gap-3 rounded-xl p-2">
                        <div className="ib-panel rounded-lg p-2.5">
                          <Icon size={18} className="ib-orange"/>
                        </div>

                        <div className="flex-1">
                          <div className="text-sm font-bold">
                            {info.title}
                          </div>

                          <p className="ib-muted mt-1 text-xs">
                            {info.description}
                          </p>
                        </div>

                        <Check size={16} className="ib-orange"/>
                      </div>);
        })}
              </div>

              <div className="ib-panel ib-muted mt-5 rounded-xl px-4 py-3 text-xs leading-6">
                Sessions can be tailored to
                your experience, target role,
                upcoming interviews and
                improvement areas.
              </div>
            </div>
          </div>
        </section>

        <section id="interviewer-companies" className="scroll-mt-32 px-4 py-12 sm:px-6 lg:px-8" style={{ background: "var(--ib-alt)" }}>
          <div className="mx-auto max-w-6xl">
            <SectionIntro eyebrow="Meet the engineering community" title="Practice with working engineers from multiple companies" description="Our interviewer network brings practical perspectives from backend development, Java, Spring Boot, microservices, system design, GenAI and production engineering."/>
            <div className="mt-7 flex flex-wrap justify-center gap-x-4 gap-y-6 sm:gap-x-6 lg:gap-x-7">
              {INTERVIEWER_COMPANIES.map(company => <CompanyLogo key={company.name} company={company} compact/>)}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5" style={{ borderColor: "var(--ib-border)", background: "var(--ib-surface)" }}>
              <div className="flex items-start gap-3"><ShieldCheck className="ib-orange mt-0.5 shrink-0" size={20}/><p className="ib-muted max-w-3xl text-xs leading-6">Company names describe reported interviewer professional backgrounds, not corporate partnerships or endorsements. The interviewer for a specific slot may vary; contact support for the assigned engineer's profile.</p></div>
              <a href="#interview-slots" className="ib-primary">Find a slot <ArrowRight size={15}/></a>
            </div>
          </div>
        </section>

        {/* ==========================================
            SLOT CALENDAR
        ========================================== */}

        <section id="interview-slots" className="scroll-mt-36 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="ib-orange text-xs font-black uppercase tracking-widest">
                  Choose Your Time
                </span>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Upcoming Interview Slots
                </h2>

                <p className="ib-muted mt-2 max-w-2xl text-sm leading-7">
                  Browse dates in IST, then instantly view session times in your preferred time zone and clock format. Your booking uses the original slot and schedule.
                </p>
              </div>

              <TimeDisplayControls
                timeZone={timeZone}
                setTimeZone={setTimeZone}
                timeFormat={timeFormat}
                setTimeFormat={setTimeFormat}
              />
            </div>

            {/* DATE SELECTOR */}

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 sm:gap-3">
              {days.map(({ key, date }, index) => {
            const active = selectedDay === key;
            return (<button key={key} type="button" aria-pressed={active} onClick={() => {
                    setSelectedDay(key);
                    setViewFilter("all");
                }} className={`ib-card ib-day rounded-2xl p-2.5 text-center sm:p-4 ${active
                    ? "ib-selected"
                    : ""}`}>
                      <div className="ib-muted text-[11px] font-bold">
                        {index === 0
                    ? "Today"
                    : fmtDate(date, {
                        weekday: "short",
                    })}
                      </div>

                      <div className={`mt-1 text-2xl font-black ${active
                    ? "ib-orange"
                    : ""}`}>
                        {fmtDate(date, {
                    day: "numeric",
                })}
                      </div>

                      <div className="ib-muted mt-1 text-xs">
                        {fmtDate(date, {
                    month: "short",
                })}
                      </div>

                      {active && (<div className="mx-auto mt-2 h-1 w-8 rounded-full bg-orange-500"/>)}
                    </button>);
        })}
            </div>

            {/* FILTER HEADER */}

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-extrabold">
                  {selectedDateLabel(selectedDay)} <span className="ib-muted text-xs font-semibold">(IST date)</span>
                </h3>

                <p className="ib-muted mt-1 text-xs">
                  {loading
            ? "Checking availability..."
            : `${countAvailable} available · ${countBooked} booked · ${countHeld} reserved`}
                </p>
              </div>

              <div className="ib-card inline-flex flex-wrap rounded-xl p-1">
                {[
            {
                key: "all",
                label: "All",
            },
            {
                key: "available",
                label: "Available",
            },
            {
                key: "unavailable",
                label: "Unavailable",
            },
        ].map((filter) => (<button key={filter.key} type="button" onClick={() => setViewFilter(filter.key)} className={`rounded-lg px-3 py-2 text-xs font-bold ${viewFilter ===
                filter.key
                ? "ib-selected"
                : "ib-muted"}`}>
                    {filter.label}
                  </button>))}
              </div>
            </div>

            {/* TOPIC FILTER */}

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => setTopicFilter("all")} className={`ib-outline !px-3 !py-2 ${topicFilter === "all"
            ? "ib-selected"
            : ""}`}>
                All Topics
              </button>

              {ALL_TOPICS.map((topic) => (<button key={topic} type="button" onClick={() => setTopicFilter(topic)} className={`ib-outline !px-3 !py-2 ${topicFilter === topic
                ? "ib-selected"
                : ""}`}>
                  {TOPIC_INFO[topic].title}
                </button>))}
            </div>

            {/* ERROR */}

            {loadError && (<div className="ib-error mt-6 flex items-start gap-3 rounded-xl p-4 text-sm">
                <AlertCircle size={19} className="shrink-0"/>

                <div className="flex-1">
                  {loadError}
                </div>

                <button type="button" onClick={() => fetchSlots()} className="font-bold underline">
                  Retry
                </button>
              </div>)}

            {/* LOADING */}

            {loading ? (<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((index) => (<div key={index} className="ib-card animate-pulse rounded-2xl p-5">
                      <div className="ib-panel h-5 w-1/2 rounded-lg"/>

                      <div className="ib-panel mt-4 h-12 rounded-xl"/>

                      <div className="ib-panel mt-4 h-10 rounded-xl"/>
                    </div>))}
              </div>) : shownSlots.length === 0 ? (<div className="ib-card mt-8 rounded-3xl px-5 py-14 text-center">
                <CalendarDays size={36} className="ib-orange mx-auto"/>

                <h3 className="mt-4 text-lg font-extrabold">
                  No matching interview slots
                </h3>

                <p className="ib-muted mx-auto mt-2 max-w-md text-sm leading-7">
                  Try a different date or
                  clear the selected filters
                  to explore more sessions.
                </p>

                <button type="button" className="ib-outline mt-5" onClick={() => {
                setViewFilter("all");
                setTopicFilter("all");
            }}>
                  Clear Filters
                </button>
              </div>) : (<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {shownSlots.map((slot) => {
                const available = slot.status ===
                    "AVAILABLE";
                const topics = Array.isArray(slot.allowedTopics) &&
                    slot.allowedTopics.length
                    ? slot.allowedTopics
                    : ALL_TOPICS;
                const hasDiscount = Number(slot.mrp) >
                    Number(slot.price);
                return (<article key={slot._id} className="ib-card ib-slot flex flex-col rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div className="ib-panel rounded-xl p-3">
                            <Video size={20} className="ib-orange"/>
                          </div>

                          <StatusPill slot={slot}/>
                        </div>

                        <h3 className="mt-4 text-lg font-black">
                          {slot.title ||
                        "Technical Mock Interview"}
                        </h3>

                        <div className="ib-muted mt-3 flex items-center gap-2 text-sm">
                          <Clock3 size={16} className="ib-orange"/>

                          {fmtTime(slot.startTime, timeZone, timeFormat)}

                          {" – "}

                          {fmtTime(slot.endTime, timeZone, timeFormat)}
                        </div>

                        <p className="ib-muted mt-2 text-xs">
                          {slot.durationMinutes ||
                        45}{" "}
                          minutes · {displayZone}
                        </p>
                        {timeZone !== TIMEZONE && (
                          <p className="ib-muted mt-1 text-xs">Your local date: {fmtSlotDate(slot.startTime, timeZone)} · Original schedule: {fmtTime(slot.startTime, TIMEZONE, "12")} IST</p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {topics
                        .slice(0, 4)
                        .map((topic) => (<span key={topic} className="ib-panel rounded-lg px-2.5 py-1 text-[11px] font-bold">
                                  {topic}
                                </span>))}
                        </div>

                        <div className="mt-auto pt-5">
                          <div className="border-t pt-4" style={{
                        borderColor: "var(--ib-border)",
                    }}>
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="ib-muted text-[11px]">
                                  Session price
                                </p>

                                <div className="mt-1 flex items-center gap-2">
                                  <span className="ib-orange text-2xl font-black">
                                    {fmtMoney(slot.price, slot.currency)}
                                  </span>

                                  {hasDiscount && (<span className="ib-muted text-xs line-through">
                                      {fmtMoney(slot.mrp, slot.currency)}
                                    </span>)}
                                </div>
                              </div>
                            </div>

                            <button type="button" disabled={!available} onClick={() => handleBook(slot)} className={available
                        ? "ib-primary mt-4 w-full"
                        : "ib-outline mt-4 w-full"}>
                              {available ? (<>
                                  Book This Slot

                                  <ArrowRight size={16}/>
                                </>) : ("Not Available")}
                            </button>
                          </div>
                        </div>
                      </article>);
            })}
              </div>)}
          </div>
        </section>

        <MarketingSections openFaq={openFaq} setOpenFaq={setOpenFaq}/>

        {/* ==========================================
            HOW IT WORKS
        ========================================== */}

        <section id="how-it-works" className="scroll-mt-36 px-4 py-14 sm:px-6 lg:px-8" style={{
            background: "var(--ib-alt)",
        }}>
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <span className="ib-orange text-xs font-black uppercase tracking-widest">
                Simple Booking Process
              </span>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                How your mock interview works
              </h2>

              <p className="ib-muted mt-3 text-sm leading-7">
                Book your technical mock
                interview in a few simple
                steps. No account registration
                is required.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
            {
                number: "01",
                title: "Choose your session",
                description: "Select an available date and time, then choose the topics you want to practice.",
                Icon: CalendarDays,
            },
            {
                number: "02",
                title: "Enter details and pay",
                description: "Provide your name, email, background and interview goals. Complete payment securely through Cashfree.",
                Icon: CreditCard,
            },
            {
                number: "03",
                title: "Attend your interview",
                description: "After payment verification, receive your booking confirmation. Meeting details are shared by email.",
                Icon: Video,
            },
        ].map(({ number, title, description, Icon, }) => (<div key={number} className="ib-card rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <span className="ib-orange text-3xl font-black">
                        {number}
                      </span>

                      <Icon size={24} className="ib-orange"/>
                    </div>

                    <h3 className="mt-5 text-lg font-extrabold">
                      {title}
                    </h3>

                    <p className="ib-muted mt-3 text-sm leading-7">
                      {description}
                    </p>
                  </div>))}
            </div>
          </div>
        </section>

        {/* ==========================================
            SUPPORT AND CANCELLATIONS
        ========================================== */}

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="ib-card grid gap-6 rounded-3xl p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="ib-orange flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                  <HelpCircle size={17}/>

                  Support
                </div>

                <h2 className="mt-3 text-xl font-black sm:text-2xl">
                  Need to cancel or reschedule?
                </h2>

                <p className="ib-muted mt-3 max-w-2xl text-sm leading-7">
                  Contact our support team
                  using the same email
                  address you entered during
                  booking. Include your
                  booking ID and request.

                  For candidate-requested cancellations, email support at least
                  24 hours before your interview. A ₹199 cancellation fee
                  applies; requests made within 24 hours are non-refundable,
                  subject to the applicable terms.
                </p>
              </div>

              <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Mock Interview Booking Support")}`} className="ib-primary w-full md:w-auto">
                <Mail size={17}/>

                Contact Support
              </a>
            </div>
          </div>
        </section>
      </main>

      <div className="ib-card fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t p-3 sm:hidden" style={{ boxShadow: "0 -8px 25px rgba(0,0,0,.08)" }}>
        <div className="min-w-0"><strong className="block text-sm">Live 1:1 mock interview</strong><span className="ib-muted block text-xs">Choose a slot · Secure checkout</span></div>
        <a href="#interview-slots" className="ib-primary shrink-0">Book a slot <ArrowRight size={15}/></a>
      </div>

      {/* ==========================================
              BOOKING MODAL
          ========================================== */}

      <AnimatePresence>
        {selectedSlot && (<BookingModal key={selectedSlot._id} slot={selectedSlot} theme={theme} timeZone={timeZone} timeFormat={timeFormat} cashfreeMode={cashfreeMode} onClose={() => setSelectedSlot(null)}/>)}
      </AnimatePresence>
    </div>);
}
