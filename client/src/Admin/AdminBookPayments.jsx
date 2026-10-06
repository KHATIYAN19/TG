// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";
// import { Helmet } from "react-helmet-async";
// import {
//   useNavigate,
//   useParams,
// } from "react-router-dom";
// import { useSelector } from "react-redux";
// import toast from "react-hot-toast";
// import {
//   Activity,
//   AlertCircle,
//   ArrowLeft,
//   BadgePercent,
//   Banknote,
//   BookOpen,
//   CalendarDays,
//   CheckCircle2,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   ChevronUp,
//   CircleDollarSign,
//   Clock3,
//   Copy,
//   CreditCard,
//   Database,
//   Filter,
//   Globe2,
//   Hash,
//   Info,
//   Loader2,
//   Link2,
//   Mail,
//   MessageSquareText,
//   MoreVertical,
//   Receipt,
//   RefreshCw,
//   RotateCcw,
//   Search,
//   Send,
//   ShieldCheck,
//   ShoppingBag,
//   Tag,
//   Trash2,
//   User,
//   WalletCards,
//   X,
//   XCircle,
// } from "lucide-react";

// import BASE_URL from "../utils/Url";

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

// const FILTERS = [
//   {
//     key: "ALL",

//     label: "All",

//     icon: Filter,
//   },

//   {
//     key: "SUCCESS",

//     label: "Success",

//     icon: CheckCircle2,
//   },

//   {
//     key: "PENDING",

//     label: "Pending",

//     icon: Clock3,
//   },

//   {
//     key: "FAILED",

//     label: "Failed",

//     icon: XCircle,
//   },
// ];

// const SUCCESS_STATUSES = new Set([
//   "SUCCESS",
//   "PAID",
//   "COMPLETED",
// ]);

// const PENDING_STATUSES = new Set([
//   "PENDING",
//   "PROCESSING",
//   "INITIATED",
// ]);

// const FAILED_STATUSES = new Set([
//   "FAILED",
//   "BOUNCED",
//   "DECLINED",
// ]);

// function getIsDarkTheme() {
//   if (typeof window === "undefined") {
//     return false;
//   }

//   const storedTheme = String(
//     window.localStorage.getItem("theme") ||
//       window.localStorage.getItem("color-theme") ||
//       ""
//   )
//     .trim()
//     .toLowerCase();

//   if (storedTheme === "dark") {
//     return true;
//   }

//   if (storedTheme === "light") {
//     return false;
//   }

//   return (
//     document.documentElement.classList.contains("dark") ||
//     document.documentElement.getAttribute("data-theme") === "dark"
//   );
// }

// function money(
//   value,
//   currency = "INR"
// ) {
//   if (
//     value === undefined ||
//     value === null ||
//     value === ""
//   ) {
//     return "—";
//   }

//   const number =
//     Number(value);

//   if (
//     !Number.isFinite(
//       number
//     )
//   ) {
//     return "—";
//   }

//   try {
//     return new Intl.NumberFormat(
//       currency === "INR"
//         ? "en-IN"
//         : "en-US",
//       {
//         style: "currency",

//         currency,

//         maximumFractionDigits: 2,
//       }
//     ).format(number);
//   } catch {
//     return `${currency} ${number.toLocaleString()}`;
//   }
// }

// function formatDate(value) {
//   if (!value) {
//     return "—";
//   }

//   const date =
//     new Date(value);

//   if (
//     Number.isNaN(
//       date.getTime()
//     )
//   ) {
//     return "—";
//   }

//   return date.toLocaleString(
//     "en-IN",
//     {
//       day: "2-digit",

//       month: "short",

//       year: "numeric",

//       hour: "2-digit",

//       minute: "2-digit",

//       second: "2-digit",
//     }
//   );
// }

// function yesNo(value) {
//   if (value === true) {
//     return "Yes";
//   }

//   if (value === false) {
//     return "No";
//   }

//   return "—";
// }

// function normalizeStatus(
//   status
// ) {
//   return String(
//     status || ""
//   )
//     .trim()
//     .toUpperCase();
// }

// function getOrderPrimaryStatus(
//   order
// ) {
//   return normalizeStatus(
//     order?.payment
//       ?.status ||
//       order?.orderStatus
//   );
// }

// function matchesStatusFilter(
//   order,
//   filter
// ) {
//   if (
//     filter === "ALL"
//   ) {
//     return true;
//   }

//   const status =
//     getOrderPrimaryStatus(
//       order
//     );

//   if (
//     filter === "SUCCESS"
//   ) {
//     return SUCCESS_STATUSES.has(
//       status
//     );
//   }

//   if (
//     filter === "PENDING"
//   ) {
//     return PENDING_STATUSES.has(
//       status
//     );
//   }

//   if (
//     filter === "FAILED"
//   ) {
//     return FAILED_STATUSES.has(
//       status
//     );
//   }

//   return true;
// }

// function copyValue(
//   value,
//   label = "Value"
// ) {
//   if (
//     value === undefined ||
//     value === null ||
//     value === ""
//   ) {
//     return;
//   }

//   navigator.clipboard
//     ?.writeText(
//       String(value)
//     )
//     .then(() => {
//       toast.success(
//         `${label} copied`
//       );
//     })
//     .catch(() => {
//       toast.error(
//         "Unable to copy"
//       );
//     });
// }

// function StatusBadge({
//   status,
// }) {
//   const normalized =
//     normalizeStatus(
//       status
//     );

//   const config = {
//     SUCCESS: {
//       className:
//         "border-emerald-200 bg-emerald-50 text-emerald-700",

//       icon:
//         CheckCircle2,
//     },

//     PAID: {
//       className:
//         "border-emerald-200 bg-emerald-50 text-emerald-700",

//       icon:
//         CheckCircle2,
//     },

//     COMPLETED: {
//       className:
//         "border-emerald-200 bg-emerald-50 text-emerald-700",

//       icon:
//         CheckCircle2,
//     },

//     SENT: {
//       className:
//         "border-emerald-200 bg-emerald-50 text-emerald-700",

//       icon:
//         CheckCircle2,
//     },

//     ACTIVE: {
//       className:
//         "border-emerald-200 bg-emerald-50 text-emerald-700",

//       icon:
//         CheckCircle2,
//     },

//     PENDING: {
//       className:
//         "border-amber-200 bg-amber-50 text-amber-700",

//       icon:
//         Clock3,
//     },

//     PROCESSING: {
//       className:
//         "border-blue-200 bg-blue-50 text-blue-700",

//       icon:
//         Clock3,
//     },

//     INITIATED: {
//       className:
//         "border-blue-200 bg-blue-50 text-blue-700",

//       icon:
//         Clock3,
//     },

//     FAILED: {
//       className:
//         "border-red-200 bg-red-50 text-red-700",

//       icon:
//         XCircle,
//     },

//     BOUNCED: {
//       className:
//         "border-red-200 bg-red-50 text-red-700",

//       icon:
//         XCircle,
//     },

//     DECLINED: {
//       className:
//         "border-red-200 bg-red-50 text-red-700",

//       icon:
//         XCircle,
//     },

//     CANCELLED: {
//       className:
//         "border-slate-200 bg-slate-100 text-slate-600",

//       icon:
//         XCircle,
//     },

//     REFUNDED: {
//       className:
//         "border-violet-200 bg-violet-50 text-violet-700",

//       icon:
//         RotateCcw,
//     },

//     PARTIAL: {
//       className:
//         "border-sky-200 bg-sky-50 text-sky-700",

//       icon:
//         RotateCcw,
//     },

//     PARTIALLY_REFUNDED: {
//       className:
//         "border-sky-200 bg-sky-50 text-sky-700",

//       icon:
//         RotateCcw,
//     },

//     REVOKED: {
//       className:
//         "border-red-200 bg-red-50 text-red-700",

//       icon:
//         XCircle,
//     },
//   };

//   const selected =
//     config[
//       normalized
//     ] || {
//       className:
//         "border-slate-200 bg-slate-50 text-slate-600",

//       icon:
//         Activity,
//     };

//   const Icon =
//     selected.icon;

//   return (
//     <span
//       className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.07em] ${selected.className}`}
//     >
//       <Icon className="h-3 w-3" />

//       {normalized ||
//         "UNKNOWN"}
//     </span>
//   );
// }

// function MetricCard({
//   icon,
//   label,
//   value,
//   helper,
//   tone = "blue",
// }) {
//   const tones = {
//     blue:
//       "bg-blue-50 text-blue-600 ring-blue-100",

//     green:
//       "bg-emerald-50 text-emerald-600 ring-emerald-100",

//     red:
//       "bg-red-50 text-red-600 ring-red-100",

//     amber:
//       "bg-amber-50 text-amber-600 ring-amber-100",

//     violet:
//       "bg-violet-50 text-violet-600 ring-violet-100",

//     slate:
//       "bg-slate-100 text-slate-600 ring-slate-200",
//   };

//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
//       <div className="flex items-start justify-between gap-4">
//         <div className="min-w-0">
//           <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
//             {label}
//           </p>

//           <p className="mt-2 break-words text-xl font-extrabold text-slate-950">
//             {value ?? 0}
//           </p>

//           {helper && (
//             <p className="mt-1 text-[11px] font-medium leading-4 text-slate-400">
//               {helper}
//             </p>
//           )}
//         </div>

//         <div
//           className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${
//             tones[tone] ||
//             tones.blue
//           }`}
//         >
//           {icon}
//         </div>
//       </div>
//     </div>
//   );
// }

// function FilterTab({
//   active,
//   icon: Icon,
//   label,
//   count,
//   onClick,
//   tone,
// }) {
//   const tones = {
//     ALL:
//       active
//         ? "border-slate-900 bg-slate-900 text-white"
//         : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",

//     SUCCESS:
//       active
//         ? "border-emerald-600 bg-emerald-600 text-white"
//         : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300",

//     PENDING:
//       active
//         ? "border-amber-500 bg-amber-500 text-white"
//         : "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300",

//     FAILED:
//       active
//         ? "border-red-600 bg-red-600 text-white"
//         : "border-red-200 bg-red-50 text-red-700 hover:border-red-300",
//   };

//   return (
//     <button
//       type="button"
//       onClick={
//         onClick
//       }
//       aria-pressed={
//         active
//       }
//       className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-extrabold transition ${tones[tone]}`}
//     >
//       <Icon className="h-4 w-4" />

//       <span>
//         {label}
//       </span>

//       <span
//         className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
//           active
//             ? "bg-white/20 text-white"
//             : "bg-white/80 text-current"
//         }`}
//       >
//         {count ?? 0}
//       </span>
//     </button>
//   );
// }

// function DataField({
//   label,
//   value,
//   mono = false,
//   copy = false,
//   badge = false,
//   important = false,
// }) {
//   const hasValue =
//     value !==
//       undefined &&
//     value !== null &&
//     value !== "";

//   return (
//     <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50/70 px-3.5 py-3">
//       <p className="text-[9px] font-extrabold uppercase tracking-[0.1em] text-slate-400">
//         {label}
//       </p>

//       <div className="mt-1.5 flex min-w-0 items-start justify-between gap-2">
//         <div className="min-w-0">
//           {badge &&
//           hasValue ? (
//             <StatusBadge
//               status={
//                 value
//               }
//             />
//           ) : (
//             <p
//               className={`break-words ${
//                 mono
//                   ? "font-mono text-[11px] font-semibold text-slate-700"
//                   : important
//                   ? "text-base font-extrabold text-slate-950"
//                   : "text-sm font-bold text-slate-800"
//               }`}
//             >
//               {hasValue
//                 ? String(
//                     value
//                   )
//                 : "—"}
//             </p>
//           )}
//         </div>

//         {copy &&
//           hasValue && (
//             <button
//               type="button"
//               onClick={() =>
//                 copyValue(
//                   value,
//                   label
//                 )
//               }
//               className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-blue-600 hover:shadow-sm"
//             >
//               <Copy className="h-3.5 w-3.5" />
//             </button>
//           )}
//       </div>
//     </div>
//   );
// }

// function SectionCard({
//   icon,
//   title,
//   subtitle,
//   children,
//   className = "",
// }) {
//   return (
//     <section
//       className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
//     >
//       <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
//         <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//           {icon}
//         </div>

//         <div className="min-w-0">
//           <h3 className="text-sm font-extrabold text-slate-950">
//             {title}
//           </h3>

//           {subtitle && (
//             <p className="mt-0.5 text-[11px] font-medium text-slate-400">
//               {subtitle}
//             </p>
//           )}
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2">
//         {children}
//       </div>
//     </section>
//   );
// }

// function TechnicalJson({
//   label,
//   value,
// }) {
//   const [
//     open,
//     setOpen,
//   ] = useState(false);

//   const hasValue =
//     value !==
//       undefined &&
//     value !== null;

//   return (
//     <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
//       <button
//         type="button"
//         onClick={() =>
//           setOpen(
//             (current) =>
//               !current
//           )
//         }
//         className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-slate-50"
//       >
//         <div>
//           <p className="text-xs font-extrabold text-slate-800">
//             {label}
//           </p>

//           <p className="mt-0.5 text-[10px] font-medium text-slate-400">
//             {hasValue
//               ? "Open raw provider data"
//               : "No raw data available"}
//           </p>
//         </div>

//         {open ? (
//           <ChevronUp className="h-4 w-4 text-slate-400" />
//         ) : (
//           <ChevronDown className="h-4 w-4 text-slate-400" />
//         )}
//       </button>

//       {open && (
//         <div className="border-t border-slate-200 bg-slate-950 p-4">
//           <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-5 text-slate-100">
//             {hasValue
//               ? JSON.stringify(
//                   value,
//                   null,
//                   2
//                 )
//               : "No data available"}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// }

// function TimelineItem({
//   label,
//   value,
//   icon: Icon,
//   tone = "slate",
// }) {
//   const tones = {
//     slate:
//       "bg-slate-100 text-slate-600",

//     green:
//       "bg-emerald-50 text-emerald-600",

//     red:
//       "bg-red-50 text-red-600",

//     amber:
//       "bg-amber-50 text-amber-600",

//     blue:
//       "bg-blue-50 text-blue-600",

//     violet:
//       "bg-violet-50 text-violet-600",
//   };

//   return (
//     <div className="flex min-w-0 items-start gap-3">
//       <div
//         className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tones[tone]}`}
//       >
//         <Icon className="h-3.5 w-3.5" />
//       </div>

//       <div className="min-w-0">
//         <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
//           {label}
//         </p>

//         <p className="mt-1 text-xs font-bold leading-5 text-slate-700">
//           {value}
//         </p>
//       </div>
//     </div>
//   );
// }

// function PaymentCard({
//   order,
//   index,
//   currency,
//   menuOpen,
//   onToggleMenu,
//   onSendMail,
//   onSendAccessMail,
//   sendingAccessMail,
//   onGenerateReviewLink,
//   generatingReviewLink,
//   onSendReviewMail,
//   sendingReviewMail,
//   onDelete,
// }) {
//   const [
//     showMore,
//     setShowMore,
//   ] = useState(false);

//   const payment =
//     order?.payment || {};

//   const customer =
//     order?.customer || {};

//   const book =
//     order?.book || {};

//   const coupon =
//     order?.coupon || {};

//   const refund =
//     order?.refund || {};

//   const pendingMail =
//     order?.pendingMail ||
//     {};

//   const verification =
//     order?.verification ||
//     {};

//   const access =
//     order?.access || {};

//   const metadata =
//     order?.metadata || {};

//   const orderCurrency =
//     book?.currency ||
//     currency ||
//     "INR";

//   const displayAmount =
//     payment.amount ??
//     coupon.finalAmount ??
//     book.price;

//   const originalAmount =
//     coupon.originalAmount ??
//     book.price;

//   const finalAmount =
//     coupon.applied
//       ? coupon.finalAmount ??
//         payment.amount
//       : payment.amount;

//   const discountAmount =
//     coupon.applied
//       ? coupon.discountAmount
//       : 0;

//   const refundAmount =
//     refund.refundedAmount ??
//     0;

//   const hasCoupon =
//     coupon.applied ===
//     true;

//   const hasRefund =
//     Boolean(
//       refund.status
//     ) ||
//     Number(
//       refund.refundedAmount
//     ) >
//       0 ||
//     Number(
//       refund.requestedAmount
//     ) >
//       0;

//   const hasReminder =
//     Number(
//       pendingMail.sentCount
//     ) >
//       0 ||
//     pendingMail.firstSentAt ||
//     pendingMail.lastSentAt;

//   const primaryStatus =
//     payment.status ||
//     order.orderStatus;

//   const canSendAccessMail =
//     normalizeStatus(
//       order.orderStatus
//     ) === "PAID" &&
//     normalizeStatus(
//       payment.status
//     ) === "SUCCESS";

//   const canUseBookReview =
//     canSendAccessMail;

//   const timeline = [
//     {
//       label:
//         "Order created",

//       value:
//         formatDate(
//           order.createdAt
//         ),

//       icon:
//         CalendarDays,

//       tone:
//         "blue",
//     },

//     payment.paidAt
//       ? {
//           label:
//             "Payment completed",

//           value:
//             formatDate(
//               payment.paidAt
//             ),

//           icon:
//             CheckCircle2,

//           tone:
//             "green",
//         }
//       : payment.failedAt
//       ? {
//           label:
//             "Payment failed",

//           value:
//             formatDate(
//               payment.failedAt
//             ),

//           icon:
//             XCircle,

//           tone:
//             "red",
//         }
//       : {
//           label:
//             "Payment state",

//           value:
//             normalizeStatus(
//               primaryStatus
//             ) ||
//             "UNKNOWN",

//           icon:
//             Clock3,

//           tone:
//             "amber",
//         },

//     hasReminder
//       ? {
//           label:
//             "Last reminder",

//           value:
//             formatDate(
//               pendingMail.lastSentAt ||
//                 pendingMail.firstSentAt
//             ),

//           icon:
//             Mail,

//           tone:
//             "violet",
//         }
//       : {
//           label:
//             "Reminder email",

//           value:
//             "Not sent yet",

//           icon:
//             Mail,

//           tone:
//             "slate",
//         },

//     hasRefund
//       ? {
//           label:
//             "Refund activity",

//           value:
//             refund.completedAt
//               ? formatDate(
//                   refund.completedAt
//                 )
//               : normalizeStatus(
//                   refund.status
//                 ) ||
//                 "Refund recorded",

//           icon:
//             RotateCcw,

//           tone:
//             "violet",
//         }
//       : {
//           label:
//             "Refund",

//           value:
//             "No refund activity",

//           icon:
//             RotateCcw,

//           tone:
//             "slate",
//         },
//   ];

//   return (
//     <article className="relative overflow-visible rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
//       <div className="relative rounded-t-3xl border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-5 py-5 sm:px-6">
//         <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
//           <div className="flex min-w-0 items-start gap-4 pr-12">
//             <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-extrabold text-white shadow-sm">
//               {index}
//             </div>

//             <div className="min-w-0">
//               <div className="flex flex-wrap items-center gap-2">
//                 <h2 className="truncate text-lg font-extrabold text-slate-950">
//                   {customer.name ||
//                     "Customer"}
//                 </h2>

//                 <StatusBadge
//                   status={
//                     primaryStatus
//                   }
//                 />

//                 {order.orderStatus &&
//                   normalizeStatus(
//                     order.orderStatus
//                   ) !==
//                     normalizeStatus(
//                       primaryStatus
//                     ) && (
//                     <StatusBadge
//                       status={
//                         order.orderStatus
//                       }
//                     />
//                   )}
//               </div>

//               <p className="mt-1 truncate text-sm font-semibold text-slate-500">
//                 {customer.email ||
//                   "No customer email"}
//               </p>

//               <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold text-slate-400">
//                 <span className="inline-flex items-center gap-1">
//                   <Hash className="h-3 w-3" />

//                   {order.orderId ||
//                     "No Order ID"}
//                 </span>

//                 <span className="inline-flex items-center gap-1">
//                   <CalendarDays className="h-3 w-3" />

//                   {formatDate(
//                     order.createdAt
//                   )}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:gap-5 xl:justify-end">
//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
//               <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
//                 Final amount
//               </p>

//               <p className="mt-1 text-xl font-extrabold text-slate-950">
//                 {money(
//                   displayAmount,
//                   orderCurrency
//                 )}
//               </p>
//             </div>

//             <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
//               <p className="text-[9px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
//                 Provider
//               </p>

//               <p className="mt-1 text-sm font-extrabold text-slate-800">
//                 {payment.provider ||
//                   "—"}
//               </p>

//               <p className="mt-0.5 text-[10px] font-bold uppercase text-slate-400">
//                 {payment.method ||
//                   "Payment"}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="absolute right-4 top-4 z-30">
//           <button
//             type="button"
//             onClick={(
//               event
//             ) => {
//               event.stopPropagation();

//               onToggleMenu();
//             }}
//             className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
//           >
//             <MoreVertical className="h-5 w-5" />
//           </button>

//           {menuOpen && (
//             <div
//               onClick={(
//                 event
//               ) =>
//                 event.stopPropagation()
//               }
//               className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-2xl"
//             >
//               <button
//                 type="button"
//                 onClick={
//                   onSendMail
//                 }
//                 className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
//               >
//                 <Mail className="h-4 w-4" />

//                 Send Purchase Reminder
//               </button>

//               <button
//                 type="button"
//                 onClick={
//                   onSendAccessMail
//                 }
//                 disabled={
//                   !canSendAccessMail ||
//                   sendingAccessMail
//                 }
//                 title={
//                   canSendAccessMail
//                     ? "Generate a fresh secure access link and email it to the customer"
//                     : "Available only when order status is PAID and payment status is SUCCESS"
//                 }
//                 className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-300"
//               >
//                 {sendingAccessMail ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <ShieldCheck className="h-4 w-4" />
//                 )}

//                 {sendingAccessMail
//                   ? "Sending Access Mail..."
//                   : "Send Book Access Mail"}
//               </button>

//               <div className="my-1 border-t border-slate-100" />

//               <button
//                 type="button"
//                 onClick={
//                   onGenerateReviewLink
//                 }
//                 disabled={
//                   !canUseBookReview ||
//                   generatingReviewLink
//                 }
//                 title={
//                   canUseBookReview
//                     ? "Create the review link or return the existing review link"
//                     : "Available only when order status is PAID and payment status is SUCCESS"
//                 }
//                 className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-violet-700 transition hover:bg-violet-50 disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-300"
//               >
//                 {generatingReviewLink ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <Link2 className="h-4 w-4" />
//                 )}

//                 {generatingReviewLink
//                   ? "Generating Review Link..."
//                   : "Generate Review Link"}
//               </button>

//               <button
//                 type="button"
//                 onClick={
//                   onSendReviewMail
//                 }
//                 disabled={
//                   !canUseBookReview ||
//                   sendingReviewMail
//                 }
//                 title={
//                   canUseBookReview
//                     ? "Send the existing review link by email, or generate one first if needed"
//                     : "Available only when order status is PAID and payment status is SUCCESS"
//                 }
//                 className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:bg-white disabled:text-slate-300"
//               >
//                 {sendingReviewMail ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <Send className="h-4 w-4" />
//                 )}

//                 {sendingReviewMail
//                   ? "Sending Review Mail..."
//                   : "Send Review Mail"}
//               </button>

//               <div className="my-1 border-t border-slate-100" />

//               <button
//                 type="button"
//                 onClick={
//                   onDelete
//                 }
//                 className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-red-600 transition hover:bg-red-50"
//               >
//                 <Trash2 className="h-4 w-4" />

//                 Delete Payment
//               </button>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="p-5 sm:p-6">
//         <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
//           <SectionCard
//             icon={
//               <User className="h-4 w-4" />
//             }
//             title="Customer"
//             subtitle="Buyer and order identity"
//           >
//             <DataField
//               label="Name"
//               value={
//                 customer.name
//               }
//             />

//             <DataField
//               label="Email"
//               value={
//                 customer.email
//               }
//               copy
//             />

//             <DataField
//               label="Phone"
//               value={
//                 customer.phone
//               }
//               copy
//             />

//             <DataField
//               label="Order Status"
//               value={
//                 order.orderStatus
//               }
//               badge
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <CreditCard className="h-4 w-4" />
//             }
//             title="Transaction"
//             subtitle="Current payment state"
//           >
//             <DataField
//               label="Payment Status"
//               value={
//                 payment.status
//               }
//               badge
//             />

//             <DataField
//               label="Paid Amount"
//               value={money(
//                 payment.amount,
//                 orderCurrency
//               )}
//               important
//             />

//             <DataField
//               label="Provider"
//               value={
//                 payment.provider
//               }
//             />

//             <DataField
//               label="Method"
//               value={
//                 payment.method
//               }
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <Banknote className="h-4 w-4" />
//             }
//             title="Pricing"
//             subtitle={
//               hasCoupon
//                 ? "Coupon applied to this order"
//                 : "Original pricing snapshot"
//             }
//           >
//             <DataField
//               label="Original Amount"
//               value={money(
//                 originalAmount,
//                 orderCurrency
//               )}
//             />

//             <DataField
//               label="Discount"
//               value={
//                 hasCoupon
//                   ? money(
//                       discountAmount,
//                       orderCurrency
//                     )
//                   : "No discount"
//               }
//             />

//             <DataField
//               label="Final Amount"
//               value={money(
//                 finalAmount,
//                 orderCurrency
//               )}
//               important
//             />

//             <DataField
//               label="Coupon"
//               value={
//                 hasCoupon
//                   ? coupon.code ||
//                     "Applied"
//                   : "Not applied"
//               }
//               mono={
//                 hasCoupon
//               }
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <Activity className="h-4 w-4" />
//             }
//             title="Recovery & Access"
//             subtitle="Refund, reminder and resource access"
//           >
//             <DataField
//               label="Refunded"
//               value={money(
//                 refundAmount,
//                 orderCurrency
//               )}
//               important={
//                 Number(
//                   refundAmount
//                 ) >
//                 0
//               }
//             />

//             <DataField
//               label="Reminder Count"
//               value={
//                 pendingMail.sentCount ??
//                 0
//               }
//             />

//             <DataField
//               label="Access Count"
//               value={
//                 access.accessCount ??
//                 0
//               }
//             />

//             <DataField
//               label="Access Revoked"
//               value={yesNo(
//                 access.revoked
//               )}
//             />
//           </SectionCard>
//         </div>

//         <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
//           <div className="mb-4 flex items-center gap-2">
//             <Activity className="h-4 w-4 text-blue-600" />

//             <h3 className="text-xs font-extrabold uppercase tracking-[0.08em] text-slate-700">
//               Order Timeline
//             </h3>
//           </div>

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//             {timeline.map(
//               (item) => (
//                 <TimelineItem
//                   key={
//                     item.label
//                   }
//                   {...item}
//                 />
//               )
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
//         <button
//           type="button"
//           onClick={() =>
//             setShowMore(
//               (current) =>
//                 !current
//             )
//           }
//           className="flex w-full items-center justify-between gap-4 text-left"
//         >
//           <div>
//             <p className="text-sm font-extrabold text-slate-900">
//               Complete Payment Record
//             </p>

//             <p className="mt-0.5 text-xs font-medium text-slate-400">
//               IDs, coupon, refund, reminder, verification,
//               access, attribution and raw provider data
//             </p>
//           </div>

//           <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm">
//             {showMore ? (
//               <ChevronUp className="h-4 w-4" />
//             ) : (
//               <ChevronDown className="h-4 w-4" />
//             )}
//           </div>
//         </button>
//       </div>

//       {showMore && (
//         <div className="grid grid-cols-1 gap-4 border-t border-slate-100 bg-slate-50 p-5 sm:p-6 xl:grid-cols-2">
//           <SectionCard
//             icon={
//               <Hash className="h-4 w-4" />
//             }
//             title="Identifiers"
//             subtitle="Order and provider references"
//           >
//             <DataField
//               label="Mongo ID"
//               value={
//                 order._id
//               }
//               mono
//               copy
//             />

//             <DataField
//               label="Order ID"
//               value={
//                 order.orderId
//               }
//               mono
//               copy
//             />

//             <DataField
//               label="Book ID"
//               value={
//                 order.bookId
//               }
//               mono
//               copy
//             />

//             <DataField
//               label="Transaction ID"
//               value={
//                 payment.transactionId
//               }
//               mono
//               copy
//             />

//             <DataField
//               label="Payment ID"
//               value={
//                 payment.paymentId
//               }
//               mono
//               copy
//             />

//             <DataField
//               label="Affiliate Code"
//               value={
//                 payment.affiliateCode
//               }
//               mono
//               copy
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <Clock3 className="h-4 w-4" />
//             }
//             title="Payment Timeline"
//             subtitle="Recorded transaction timestamps"
//           >
//             <DataField
//               label="Paid At"
//               value={formatDate(
//                 payment.paidAt
//               )}
//             />

//             <DataField
//               label="Failed At"
//               value={formatDate(
//                 payment.failedAt
//               )}
//             />

//             <DataField
//               label="Refunded At"
//               value={formatDate(
//                 payment.refundedAt
//               )}
//             />

//             <DataField
//               label="Created At"
//               value={formatDate(
//                 order.createdAt
//               )}
//             />

//             <DataField
//               label="Updated At"
//               value={formatDate(
//                 order.updatedAt
//               )}
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <BookOpen className="h-4 w-4" />
//             }
//             title="Book Snapshot"
//             subtitle="Book information stored with this order"
//           >
//             <DataField
//               label="Title"
//               value={
//                 book.title
//               }
//             />

//             <DataField
//               label="Price"
//               value={money(
//                 book.price,
//                 orderCurrency
//               )}
//               important
//             />

//             <DataField
//               label="MRP"
//               value={money(
//                 book.mrp,
//                 orderCurrency
//               )}
//             />

//             <DataField
//               label="Currency"
//               value={
//                 book.currency
//               }
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <BadgePercent className="h-4 w-4" />
//             }
//             title="Coupon Details"
//             subtitle="Coupon snapshot and discount calculation"
//           >
//             <DataField
//               label="Applied"
//               value={yesNo(
//                 coupon.applied
//               )}
//             />

//             <DataField
//               label="Coupon ID"
//               value={
//                 coupon.couponId
//               }
//               mono
//               copy
//             />

//             <DataField
//               label="Code"
//               value={
//                 coupon.code
//               }
//               mono
//               copy
//             />

//             <DataField
//               label="Name"
//               value={
//                 coupon.name
//               }
//             />

//             <DataField
//               label="Description"
//               value={
//                 coupon.description
//               }
//             />

//             <DataField
//               label="Discount Type"
//               value={
//                 coupon.discountType
//               }
//             />

//             <DataField
//               label="Discount Value"
//               value={
//                 coupon.discountValue
//               }
//             />

//             <DataField
//               label="Max Discount"
//               value={money(
//                 coupon.maxDiscountAmount,
//                 orderCurrency
//               )}
//             />

//             <DataField
//               label="Minimum Order"
//               value={money(
//                 coupon.minimumOrderAmount,
//                 orderCurrency
//               )}
//             />

//             <DataField
//               label="Original Amount"
//               value={money(
//                 coupon.originalAmount,
//                 orderCurrency
//               )}
//             />

//             <DataField
//               label="Discount Amount"
//               value={money(
//                 coupon.discountAmount,
//                 orderCurrency
//               )}
//               important
//             />

//             <DataField
//               label="Final Amount"
//               value={money(
//                 coupon.finalAmount,
//                 orderCurrency
//               )}
//               important
//             />

//             <DataField
//               label="Applied At"
//               value={formatDate(
//                 coupon.appliedAt
//               )}
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <RotateCcw className="h-4 w-4" />
//             }
//             title="Refund Details"
//             subtitle="Refund request and settlement information"
//           >
//             <DataField
//               label="Status"
//               value={
//                 refund.status
//               }
//               badge={
//                 Boolean(
//                   refund.status
//                 )
//               }
//             />

//             <DataField
//               label="Requested Amount"
//               value={money(
//                 refund.requestedAmount,
//                 orderCurrency
//               )}
//             />

//             <DataField
//               label="Refunded Amount"
//               value={money(
//                 refund.refundedAmount,
//                 orderCurrency
//               )}
//               important
//             />

//             <DataField
//               label="Remaining Amount"
//               value={money(
//                 refund.remainingAmount,
//                 orderCurrency
//               )}
//             />

//             <DataField
//               label="Reason"
//               value={
//                 refund.reason
//               }
//             />

//             <DataField
//               label="Provider"
//               value={
//                 refund.provider
//               }
//             />

//             <DataField
//               label="Provider Refund ID"
//               value={
//                 refund.providerRefundId
//               }
//               mono
//               copy
//             />

//             <DataField
//               label="Refund Transaction ID"
//               value={
//                 refund.refundTransactionId
//               }
//               mono
//               copy
//             />

//             <DataField
//               label="Initiated By"
//               value={
//                 refund.initiatedBy
//               }
//             />

//             <DataField
//               label="Initiated At"
//               value={formatDate(
//                 refund.initiatedAt
//               )}
//             />

//             <DataField
//               label="Processed At"
//               value={formatDate(
//                 refund.processedAt
//               )}
//             />

//             <DataField
//               label="Completed At"
//               value={formatDate(
//                 refund.completedAt
//               )}
//             />

//             <DataField
//               label="Failed At"
//               value={formatDate(
//                 refund.failedAt
//               )}
//             />

//             <DataField
//               label="Failure Reason"
//               value={
//                 refund.failureReason
//               }
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <Mail className="h-4 w-4" />
//             }
//             title="Reminder History"
//             subtitle="Purchase recovery email activity"
//           >
//             <DataField
//               label="Sent Count"
//               value={
//                 pendingMail.sentCount ??
//                 0
//               }
//               important
//             />

//             <DataField
//               label="First Sent At"
//               value={formatDate(
//                 pendingMail.firstSentAt
//               )}
//             />

//             <DataField
//               label="Last Sent At"
//               value={formatDate(
//                 pendingMail.lastSentAt
//               )}
//             />

//             <DataField
//               label="Last Sent By"
//               value={
//                 pendingMail.lastSentBy
//               }
//             />

//             <DataField
//               label="Last Status"
//               value={
//                 pendingMail.lastStatus
//               }
//               badge={
//                 Boolean(
//                   pendingMail.lastStatus
//                 )
//               }
//             />

//             <DataField
//               label="Last Error"
//               value={
//                 pendingMail.lastError
//               }
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <ShieldCheck className="h-4 w-4" />
//             }
//             title="Verification & Access"
//             subtitle="Payment checks and resource access"
//           >
//             <DataField
//               label="Callback Hash Verified"
//               value={yesNo(
//                 verification.callbackHashVerified
//               )}
//             />

//             <DataField
//               label="PayU Verified"
//               value={yesNo(
//                 verification.payuVerified
//               )}
//             />

//             <DataField
//               label="Amount Verified"
//               value={yesNo(
//                 verification.amountVerified
//               )}
//             />

//             <DataField
//               label="Verified At"
//               value={formatDate(
//                 verification.verifiedAt
//               )}
//             />

//             <DataField
//               label="Access Generated"
//               value={formatDate(
//                 access.generatedAt
//               )}
//             />

//             <DataField
//               label="Access Expires"
//               value={formatDate(
//                 access.expiresAt
//               )}
//             />

//             <DataField
//               label="Last Accessed"
//               value={formatDate(
//                 access.lastAccessedAt
//               )}
//             />

//             <DataField
//               label="Access Count"
//               value={
//                 access.accessCount ??
//                 0
//               }
//             />

//             <DataField
//               label="Revoked"
//               value={yesNo(
//                 access.revoked
//               )}
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <Globe2 className="h-4 w-4" />
//             }
//             title="Traffic & Attribution"
//             subtitle="Request metadata and campaign information"
//           >
//             <DataField
//               label="IP Address"
//               value={
//                 metadata.ipAddress
//               }
//               mono
//               copy
//             />

//             <DataField
//               label="User Agent"
//               value={
//                 metadata.userAgent
//               }
//             />

//             <DataField
//               label="Referrer"
//               value={
//                 metadata.referrer
//               }
//             />

//             <DataField
//               label="UTM Source"
//               value={
//                 metadata.utmSource
//               }
//             />

//             <DataField
//               label="UTM Medium"
//               value={
//                 metadata.utmMedium
//               }
//             />

//             <DataField
//               label="UTM Campaign"
//               value={
//                 metadata.utmCampaign
//               }
//             />
//           </SectionCard>

//           <SectionCard
//             icon={
//               <Database className="h-4 w-4" />
//             }
//             title="Audit"
//             subtitle="Record creation and update information"
//           >
//             <DataField
//               label="Created By"
//               value={
//                 order.createdBy
//               }
//               mono
//             />

//             <DataField
//               label="Updated By"
//               value={
//                 order.updatedBy
//               }
//               mono
//             />

//             <DataField
//               label="Created At"
//               value={formatDate(
//                 order.createdAt
//               )}
//             />

//             <DataField
//               label="Updated At"
//               value={formatDate(
//                 order.updatedAt
//               )}
//             />
//           </SectionCard>

//           <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
//             <div className="mb-1 flex items-center gap-3">
//               <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
//                 <Database className="h-4 w-4" />
//               </div>

//               <div>
//                 <h3 className="text-sm font-extrabold text-slate-950">
//                   Raw Provider Data
//                 </h3>

//                 <p className="mt-0.5 text-[11px] font-medium text-slate-400">
//                   Expand only when debugging payment or refund
//                   issues
//                 </p>
//               </div>
//             </div>

//             <TechnicalJson
//               label="Payment Callback Response"
//               value={
//                 payment.callbackResponse
//               }
//             />

//             <TechnicalJson
//               label="Payment Verification Response"
//               value={
//                 payment.verificationResponse
//               }
//             />

//             <TechnicalJson
//               label="Refund Request Payload"
//               value={
//                 refund.requestPayload
//               }
//             />

//             <TechnicalJson
//               label="Refund Provider Response"
//               value={
//                 refund.providerResponse
//               }
//             />
//           </section>
//         </div>
//       )}
//     </article>
//   );
// }

// function BreakdownSection({
//   breakdown,
//   currency,
// }) {
//   const hasData =
//     breakdown.paymentStatus
//       .length >
//       0 ||
//     breakdown.orderStatus
//       .length >
//       0 ||
//     breakdown.refundStatus
//       .length >
//       0 ||
//     breakdown.coupons
//       .length >
//       0 ||
//     breakdown.affiliates
//       .length >
//       0;

//   if (!hasData) {
//     return null;
//   }

//   const renderGroup = (
//     title,
//     items,
//     keyName
//   ) => {
//     if (
//       !items?.length
//     ) {
//       return null;
//     }

//     return (
//       <div>
//         <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
//           {title}
//         </p>

//         <div className="mt-3 flex flex-wrap gap-2">
//           {items.map(
//             (
//               item,
//               index
//             ) => {
//               const label =
//                 item.status ||
//                 item.code ||
//                 item.name ||
//                 item.affiliateCode ||
//                 "Unknown";

//               const amount =
//                 item.amount ??
//                 item.refundedAmount ??
//                 item.discountAmount;

//               return (
//                 <div
//                   key={`${keyName}-${label}-${index}`}
//                   className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
//                 >
//                   <div className="flex items-center gap-2">
//                     <p className="text-xs font-extrabold text-slate-700">
//                       {label}
//                     </p>

//                     {item.count !==
//                       undefined && (
//                       <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-extrabold text-slate-500 shadow-sm">
//                         {
//                           item.count
//                         }
//                       </span>
//                     )}
//                   </div>

//                   {amount !==
//                     undefined && (
//                     <p className="mt-1 text-[11px] font-bold text-slate-400">
//                       {money(
//                         amount,
//                         currency
//                       )}
//                     </p>
//                   )}
//                 </div>
//               );
//             }
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
//       <div className="flex items-center gap-3">
//         <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
//           <Activity className="h-5 w-5" />
//         </div>

//         <div>
//           <h2 className="text-base font-extrabold text-slate-950">
//             Business Breakdown
//           </h2>

//           <p className="mt-0.5 text-xs font-medium text-slate-400">
//             Aggregated payment, refund, coupon and affiliate
//             distribution
//           </p>
//         </div>
//       </div>

//       <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
//         {renderGroup(
//           "Payment Status",
//           breakdown.paymentStatus,
//           "payment"
//         )}

//         {renderGroup(
//           "Order Status",
//           breakdown.orderStatus,
//           "order"
//         )}

//         {renderGroup(
//           "Refund Status",
//           breakdown.refundStatus,
//           "refund"
//         )}

//         {renderGroup(
//           "Coupons",
//           breakdown.coupons,
//           "coupon"
//         )}

//         {renderGroup(
//           "Affiliates",
//           breakdown.affiliates,
//           "affiliate"
//         )}
//       </div>
//     </section>
//   );
// }

// export default function AdminBookPayments() {
//   const navigate =
//     useNavigate();

//   const {
//     bookId,
//   } = useParams();

//   const token =
//     useSelector(
//       (state) =>
//         state.auth.token
//     );

//   const [
//     isDark,
//     setIsDark,
//   ] = useState(() =>
//     getIsDarkTheme()
//   );

//   const [
//     book,
//     setBook,
//   ] = useState(null);

//   const [
//     summary,
//     setSummary,
//   ] = useState(
//     EMPTY_SUMMARY
//   );

//   const [
//     breakdown,
//     setBreakdown,
//   ] = useState({
//     paymentStatus: [],

//     orderStatus: [],

//     refundStatus: [],

//     coupons: [],

//     affiliates: [],
//   });

//   const [
//     payments,
//     setPayments,
//   ] = useState([]);

//   const [
//     pagination,
//     setPagination,
//   ] = useState({
//     enabled: true,

//     page: 1,

//     limit: 10,

//     totalItems: 0,

//     totalPages: 1,

//     returnedItems: 0,

//     hasNextPage: false,

//     hasPreviousPage: false,
//   });

//   const [
//     page,
//     setPage,
//   ] = useState(1);

//   const [
//     loading,
//     setLoading,
//   ] = useState(true);

//   const [
//     error,
//     setError,
//   ] = useState("");

//   const [
//     menuOrderId,
//     setMenuOrderId,
//   ] = useState(null);

//   const [
//     statusFilter,
//     setStatusFilter,
//   ] = useState(
//     "ALL"
//   );

//   const [
//     searchQuery,
//     setSearchQuery,
//   ] = useState("");

//   const [
//     pendingOrder,
//     setPendingOrder,
//   ] = useState(null);

//   const [
//     couponCode,
//     setCouponCode,
//   ] = useState("");

//   const [
//     couponDescription,
//     setCouponDescription,
//   ] = useState("");

//   const [
//     sendingMail,
//     setSendingMail,
//   ] = useState(false);

//   const [
//     sendingAccessOrderId,
//     setSendingAccessOrderId,
//   ] = useState(null);

//   const [
//     generatingReviewOrderId,
//     setGeneratingReviewOrderId,
//   ] = useState(null);

//   const [
//     sendingReviewMailOrderId,
//     setSendingReviewMailOrderId,
//   ] = useState(null);

//   const [
//     reviewLinkModal,
//     setReviewLinkModal,
//   ] = useState(null);

//   const [
//     deleteOrder,
//     setDeleteOrder,
//   ] = useState(null);

//   const [
//     deletingPayment,
//     setDeletingPayment,
//   ] = useState(false);

//   const fetchPayments =
//     useCallback(
//       async (
//         requestedPage =
//           page,
//         signal =
//           undefined
//       ) => {
//         try {
//           if (
//             !bookId ||
//             !token
//           ) {
//             return;
//           }

//           setLoading(
//             true
//           );

//           setError(
//             ""
//           );

//           const response =
//             await fetch(
//               `${BASE_URL}/admin/books/${encodeURIComponent(
//                 bookId
//               )}/payments/page/${requestedPage}`,
//               {
//                 method:
//                   "GET",

//                 headers: {
//                   Accept:
//                     "application/json",

//                   Authorization: `Bearer ${token}`,
//                 },

//                 signal,
//               }
//             );

//           let result =
//             null;

//           try {
//             result =
//               await response.json();
//           } catch {
//             throw new Error(
//               "Invalid payment response received from server."
//             );
//           }

//           if (
//             !response.ok ||
//             result?.success !==
//               true
//           ) {
//             throw new Error(
//               result?.message ||
//                 "Unable to load payment details."
//             );
//           }

//           const data =
//             result?.data ||
//             {};

//           const rawSummary =
//             data.summary ||
//             {};

//           setBook(
//             data.book ||
//               null
//           );

//           setSummary({
//             ...EMPTY_SUMMARY,

//             ...rawSummary,

//             payments: {
//               ...EMPTY_SUMMARY.payments,

//               ...(rawSummary.payments ||
//                 {}),
//             },

//             refunds: {
//               ...EMPTY_SUMMARY.refunds,

//               ...(rawSummary.refunds ||
//                 {}),
//             },

//             coupons: {
//               ...EMPTY_SUMMARY.coupons,

//               ...(rawSummary.coupons ||
//                 {}),
//             },

//             reminderMails: {
//               ...EMPTY_SUMMARY.reminderMails,

//               ...(rawSummary.reminderMails ||
//                 {}),
//             },

//             access: {
//               ...EMPTY_SUMMARY.access,

//               ...(rawSummary.access ||
//                 {}),
//             },

//             verification: {
//               ...EMPTY_SUMMARY.verification,

//               ...(rawSummary.verification ||
//                 {}),
//             },

//             affiliates: {
//               ...EMPTY_SUMMARY.affiliates,

//               ...(rawSummary.affiliates ||
//                 {}),
//             },
//           });

//           setBreakdown({
//             paymentStatus:
//               data?.breakdown
//                 ?.paymentStatus ||
//               [],

//             orderStatus:
//               data?.breakdown
//                 ?.orderStatus ||
//               [],

//             refundStatus:
//               data?.breakdown
//                 ?.refundStatus ||
//               [],

//             coupons:
//               data?.breakdown
//                 ?.coupons ||
//               [],

//             affiliates:
//               data?.breakdown
//                 ?.affiliates ||
//               [],
//           });

//           setPayments(
//             Array.isArray(
//               data.payments
//             )
//               ? data.payments
//               : []
//           );

//           setPagination({
//             enabled:
//               true,

//             page:
//               requestedPage,

//             limit:
//               10,

//             totalItems:
//               0,

//             totalPages:
//               1,

//             returnedItems:
//               0,

//             hasNextPage:
//               false,

//             hasPreviousPage:
//               false,

//             ...(data.pagination ||
//               {}),
//           });
//         } catch (err) {
//           if (
//             err?.name ===
//             "AbortError"
//           ) {
//             return;
//           }

//           console.error(
//             "Fetch payments error:",
//             err
//           );

//           setError(
//             err?.message ||
//               "Unable to load payment details."
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
//       [
//         bookId,
//         token,
//         page,
//       ]
//     );

//   useEffect(() => {
//     const syncTheme = () => {
//       setIsDark(
//         getIsDarkTheme()
//       );
//     };

//     syncTheme();

//     window.addEventListener(
//       "storage",
//       syncTheme
//     );

//     window.addEventListener(
//       "themechange",
//       syncTheme
//     );

//     window.addEventListener(
//       "theme-change",
//       syncTheme
//     );

//     const observer =
//       new MutationObserver(
//         syncTheme
//       );

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

//     // The browser does not emit a storage event in the same tab
//     // that changed localStorage. This tiny sync interval keeps this
//     // page in lockstep with the navbar even if the navbar only writes
//     // localStorage and does not dispatch a custom event.
//     const intervalId =
//       window.setInterval(
//         syncTheme,
//         400
//       );

//     return () => {
//       window.removeEventListener(
//         "storage",
//         syncTheme
//       );

//       window.removeEventListener(
//         "themechange",
//         syncTheme
//       );

//       window.removeEventListener(
//         "theme-change",
//         syncTheme
//       );

//       observer.disconnect();

//       window.clearInterval(
//         intervalId
//       );
//     };
//   }, []);

//   useEffect(() => {
//     const controller =
//       new AbortController();

//     fetchPayments(
//       page,
//       controller.signal
//     );

//     return () =>
//       controller.abort();
//   }, [
//     page,
//     fetchPayments,
//   ]);

//   useEffect(() => {
//     const closeMenu =
//       () =>
//         setMenuOrderId(
//           null
//         );

//     document.addEventListener(
//       "click",
//       closeMenu
//     );

//     return () =>
//       document.removeEventListener(
//         "click",
//         closeMenu
//       );
//   }, []);

//   useEffect(() => {
//     setMenuOrderId(
//       null
//     );
//   }, [
//     statusFilter,
//     searchQuery,
//   ]);

//   const filterCounts =
//     useMemo(
//       () => ({
//         ALL:
//           summary.totalOrders ||
//           pagination.totalItems ||
//           0,

//         SUCCESS:
//           summary.payments
//             .successfulPayments ||
//           0,

//         PENDING:
//           summary.payments
//             .pendingPayments ||
//           0,

//         FAILED:
//           summary.payments
//             .failedPayments ||
//           0,
//       }),
//       [
//         summary,
//         pagination.totalItems,
//       ]
//     );

//   const visiblePayments =
//     useMemo(() => {
//       const normalizedSearch =
//         searchQuery
//           .trim()
//           .toLowerCase();

//       return payments.filter(
//         (
//           order
//         ) => {
//           if (
//             !matchesStatusFilter(
//               order,
//               statusFilter
//             )
//           ) {
//             return false;
//           }

//           if (
//             !normalizedSearch
//           ) {
//             return true;
//           }

//           const searchable =
//             [
//               order?._id,

//               order?.orderId,

//               order?.customer
//                 ?.name,

//               order?.customer
//                 ?.email,

//               order?.customer
//                 ?.phone,

//               order?.book
//                 ?.title,

//               order?.payment
//                 ?.transactionId,

//               order?.payment
//                 ?.paymentId,

//               order?.payment
//                 ?.provider,

//               order?.payment
//                 ?.affiliateCode,

//               order?.coupon
//                 ?.code,
//             ]
//               .filter(
//                 Boolean
//               )
//               .join(
//                 " "
//               )
//               .toLowerCase();

//           return searchable.includes(
//             normalizedSearch
//           );
//         }
//       );
//     }, [
//       payments,
//       statusFilter,
//       searchQuery,
//     ]);

//   const openPendingModal =
//     (order) => {
//       setMenuOrderId(
//         null
//       );

//       setPendingOrder(
//         order
//       );

//       setCouponCode(
//         ""
//       );

//       setCouponDescription(
//         ""
//       );
//     };

//   const closePendingModal =
//     () => {
//       if (
//         sendingMail
//       ) {
//         return;
//       }

//       setPendingOrder(
//         null
//       );

//       setCouponCode(
//         ""
//       );

//       setCouponDescription(
//         ""
//       );
//     };

//   const handleSendPendingMail =
//     async () => {
//       if (
//         !pendingOrder?._id
//       ) {
//         return;
//       }

//       const code =
//         couponCode.trim();

//       const description =
//         couponDescription.trim();

//       if (
//         Boolean(code) !==
//         Boolean(
//           description
//         )
//       ) {
//         toast.error(
//           "Fill both coupon code and coupon description, or leave both empty."
//         );

//         return;
//       }

//       try {
//         setSendingMail(
//           true
//         );

//         const response =
//           await fetch(
//             `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
//               pendingOrder._id
//             )}/send-pending-mail`,
//             {
//               method:
//                 "POST",

//               headers: {
//                 Accept:
//                   "application/json",

//                 "Content-Type":
//                   "application/json",

//                 Authorization: `Bearer ${token}`,
//               },

//               body:
//                 JSON.stringify(
//                   code
//                     ? {
//                         couponCode:
//                           code,

//                         couponDescription:
//                           description,
//                       }
//                     : {}
//                 ),
//             }
//           );

//         let result =
//           null;

//         try {
//           result =
//             await response.json();
//         } catch {
//           result =
//             null;
//         }

//         if (
//           !response.ok ||
//           result?.success ===
//             false
//         ) {
//           throw new Error(
//             result?.message ||
//               "Unable to send pending notification."
//           );
//         }

//         toast.success(
//           result?.message ||
//             "Purchase reminder sent successfully."
//         );

//         setPendingOrder(
//           null
//         );

//         setCouponCode(
//           ""
//         );

//         setCouponDescription(
//           ""
//         );

//         await fetchPayments(
//           page
//         );
//       } catch (err) {
//         console.error(
//           "Send pending mail error:",
//           err
//         );

//         toast.error(
//           err?.message ||
//             "Unable to send pending notification."
//         );
//       } finally {
//         setSendingMail(
//           false
//         );
//       }
//     };

//   const handleSendAccessMail =
//     async (order) => {
//       if (
//         !order?._id
//       ) {
//         toast.error(
//           "Order ID is missing."
//         );

//         return;
//       }

//       const orderStatus =
//         normalizeStatus(
//           order.orderStatus
//         );

//       const paymentStatus =
//         normalizeStatus(
//           order.payment
//             ?.status
//         );

//       if (
//         orderStatus !==
//           "PAID" ||
//         paymentStatus !==
//           "SUCCESS"
//       ) {
//         toast.error(
//           "Book access mail can only be sent for a PAID order with SUCCESS payment status."
//         );

//         return;
//       }

//       if (!token) {
//         toast.error(
//           "Admin authentication token is missing."
//         );

//         return;
//       }

//       setMenuOrderId(
//         null
//       );

//       const toastId =
//         toast.loading(
//           `Sending book access mail to ${
//             order.customer
//               ?.email ||
//             "customer"
//           }...`
//         );

//       try {
//         setSendingAccessOrderId(
//           order._id
//         );

//         const response =
//           await fetch(
//             `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
//               order._id
//             )}/resend-book-access`,
//             {
//               method:
//                 "POST",

//               headers: {
//                 Accept:
//                   "application/json",

//                 "Content-Type":
//                   "application/json",

//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );

//         let result =
//           null;

//         try {
//           result =
//             await response.json();
//         } catch {
//           result =
//             null;
//         }

//         if (
//           !response.ok ||
//           result?.success ===
//             false
//         ) {
//           throw new Error(
//             result?.message ||
//               "Unable to send book access email."
//           );
//         }

//         toast.success(
//           result?.message ||
//             "Book access email sent successfully.",
//           {
//             id:
//               toastId,
//           }
//         );

//         await fetchPayments(
//           page
//         );
//       } catch (err) {
//         console.error(
//           "Send book access mail error:",
//           err
//         );

//         toast.error(
//           err?.message ||
//             "Unable to send book access email.",
//           {
//             id:
//               toastId,
//           }
//         );
//       } finally {
//         setSendingAccessOrderId(
//           null
//         );
//       }
//     };

//   const handleGenerateReviewLink =
//     async (order) => {
//       if (!order?._id) {
//         toast.error(
//           "Order ID is missing."
//         );

//         return;
//       }

//       const orderStatus =
//         normalizeStatus(
//           order.orderStatus
//         );

//       const paymentStatus =
//         normalizeStatus(
//           order.payment
//             ?.status
//         );

//       if (
//         orderStatus !==
//           "PAID" ||
//         paymentStatus !==
//           "SUCCESS"
//       ) {
//         toast.error(
//           "Review link can only be generated for a PAID order with SUCCESS payment status."
//         );

//         return;
//       }

//       if (!token) {
//         toast.error(
//           "Admin authentication token is missing."
//         );

//         return;
//       }

//       setMenuOrderId(
//         null
//       );

//       const toastId =
//         toast.loading(
//           "Generating review link..."
//         );

//       try {
//         setGeneratingReviewOrderId(
//           order._id
//         );

//         const response =
//           await fetch(
//             `${BASE_URL}/api/book/review/admin/order/${encodeURIComponent(
//               order._id
//             )}/link`,
//             {
//               method:
//                 "POST",

//               headers: {
//                 Accept:
//                   "application/json",

//                 "Content-Type":
//                   "application/json",

//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );

//         let result =
//           null;

//         try {
//           result =
//             await response.json();
//         } catch {
//           result =
//             null;
//         }

//         if (
//           !response.ok ||
//           result?.success ===
//             false
//         ) {
//           throw new Error(
//             result?.message ||
//               "Unable to generate review link."
//           );
//         }

//         const reviewUrl =
//           result?.data
//             ?.reviewUrl;

//         if (!reviewUrl) {
//           throw new Error(
//             "Review link was not returned by the server."
//           );
//         }

//         setReviewLinkModal({
//           reviewUrl,

//           alreadyGenerated:
//             Boolean(
//               result?.data
//                 ?.alreadyGenerated
//             ),

//           customerName:
//             order.customer
//               ?.name ||
//             "Customer",

//           customerEmail:
//             order.customer
//               ?.email ||
//             "",

//           orderId:
//             order.orderId ||
//             order._id,

//           bookTitle:
//             order.book
//               ?.title ||
//             book?.title ||
//             "Book",
//         });

//         toast.success(
//           result?.message ||
//             "Review link generated successfully.",
//           {
//             id:
//               toastId,
//           }
//         );
//       } catch (err) {
//         console.error(
//           "Generate review link error:",
//           err
//         );

//         toast.error(
//           err?.message ||
//             "Unable to generate review link.",
//           {
//             id:
//               toastId,
//           }
//         );
//       } finally {
//         setGeneratingReviewOrderId(
//           null
//         );
//       }
//     };

//   const handleSendReviewMail =
//     async (order) => {
//       if (!order?._id) {
//         toast.error(
//           "Order ID is missing."
//         );

//         return;
//       }

//       const orderStatus =
//         normalizeStatus(
//           order.orderStatus
//         );

//       const paymentStatus =
//         normalizeStatus(
//           order.payment
//             ?.status
//         );

//       if (
//         orderStatus !==
//           "PAID" ||
//         paymentStatus !==
//           "SUCCESS"
//       ) {
//         toast.error(
//           "Review mail can only be sent for a PAID order with SUCCESS payment status."
//         );

//         return;
//       }

//       if (!token) {
//         toast.error(
//           "Admin authentication token is missing."
//         );

//         return;
//       }

//       setMenuOrderId(
//         null
//       );

//       const toastId =
//         toast.loading(
//           `Sending review mail to ${
//             order.customer
//               ?.email ||
//             "customer"
//           }...`
//         );

//       try {
//         setSendingReviewMailOrderId(
//           order._id
//         );

//         const response =
//           await fetch(
//             `${BASE_URL}/api/book/review/admin/order/${encodeURIComponent(
//               order._id
//             )}/send-mail`,
//             {
//               method:
//                 "POST",

//               headers: {
//                 Accept:
//                   "application/json",

//                 "Content-Type":
//                   "application/json",

//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );

//         let result =
//           null;

//         try {
//           result =
//             await response.json();
//         } catch {
//           result =
//             null;
//         }

//         if (
//           !response.ok ||
//           result?.success ===
//             false
//         ) {
//           throw new Error(
//             result?.message ||
//               "Unable to send review mail."
//           );
//         }

//         toast.success(
//           result?.message ||
//             "Review mail sent successfully.",
//           {
//             id:
//               toastId,
//           }
//         );
//       } catch (err) {
//         console.error(
//           "Send review mail error:",
//           err
//         );

//         toast.error(
//           err?.message ||
//             "Unable to send review mail.",
//           {
//             id:
//               toastId,
//           }
//         );
//       } finally {
//         setSendingReviewMailOrderId(
//           null
//         );
//       }
//     };

//   const handleDeletePayment =
//     async () => {
//       if (
//         !deleteOrder?._id
//       ) {
//         return;
//       }

//       try {
//         setDeletingPayment(
//           true
//         );

//         const response =
//           await fetch(
//             `${BASE_URL}/admin/books/${encodeURIComponent(
//               bookId
//             )}/payments/${encodeURIComponent(
//               deleteOrder._id
//             )}`,
//             {
//               method:
//                 "DELETE",

//               headers: {
//                 Accept:
//                   "application/json",

//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );

//         let result =
//           null;

//         try {
//           result =
//             await response.json();
//         } catch {
//           result =
//             null;
//         }

//         if (
//           !response.ok ||
//           result?.success ===
//             false
//         ) {
//           throw new Error(
//             result?.message ||
//               "Unable to delete payment."
//           );
//         }

//         toast.success(
//           result?.message ||
//             "Payment deleted successfully."
//         );

//         setDeleteOrder(
//           null
//         );

//         if (
//           payments.length ===
//             1 &&
//           page >
//             1
//         ) {
//           setPage(
//             (
//               current
//             ) =>
//               current -
//               1
//           );
//         } else {
//           await fetchPayments(
//             page
//           );
//         }
//       } catch (err) {
//         console.error(
//           "Delete payment error:",
//           err
//         );

//         toast.error(
//           err?.message ||
//             "Unable to delete payment."
//         );
//       } finally {
//         setDeletingPayment(
//           false
//         );
//       }
//     };

//   const goToPage =
//     (nextPage) => {
//       const totalPages =
//         Math.max(
//           Number(
//             pagination.totalPages
//           ) ||
//             1,
//           1
//         );

//       if (
//         nextPage < 1 ||
//         nextPage >
//           totalPages ||
//         nextPage ===
//           page ||
//         loading
//       ) {
//         return;
//       }

//       setPage(
//         nextPage
//       );

//       setMenuOrderId(
//         null
//       );

//       window.scrollTo({
//         top: 0,

//         behavior:
//           "smooth",
//       });
//     };

//   const currency =
//     book?.currency ||
//     "INR";

//   return (
//     <div
//       className={
//         isDark
//           ? "admin-book-payments-root admin-book-payments-dark"
//           : "admin-book-payments-root"
//       }
//     >
//       <Helmet>
//         <title>
//           {book?.title
//             ? `${book.title} Payment Management | Target Trek Admin`
//             : "Book Payment Management | Target Trek Admin"}
//         </title>

//         <meta
//           name="description"
//           content={
//             book?.title
//               ? `Admin payment management for ${book.title}. Review orders, payment status, refunds, coupons, reminder emails and secure book access.`
//               : "Target Trek admin payment management dashboard for orders, refunds, coupons, reminder emails and secure book access."
//           }
//         />

//         <meta
//           name="robots"
//           content="noindex, nofollow, noarchive, nosnippet"
//         />

//         <meta
//           name="googlebot"
//           content="noindex, nofollow, noarchive, nosnippet"
//         />

//         <meta
//           name="referrer"
//           content="same-origin"
//         />

//         <meta
//           name="theme-color"
//           content={
//             isDark
//               ? "#020617"
//               : "#f8fafc"
//           }
//         />
//       </Helmet>

//       <style>{`
//         .admin-book-payments-dark {
//           color-scheme: dark;
//           background: #020617;
//         }

//         .admin-book-payments-dark main {
//           background-color: #020617 !important;
//           color: #e2e8f0 !important;
//         }

//         .admin-book-payments-dark [class~="bg-white"],
//         .admin-book-payments-dark [class~="bg-white/95"] {
//           background-color: #0f172a !important;
//         }

//         .admin-book-payments-dark [class~="bg-slate-50"],
//         .admin-book-payments-dark [class~="bg-slate-50/70"],
//         .admin-book-payments-dark [class~="bg-slate-50/80"],
//         .admin-book-payments-dark [class~="bg-slate-100"] {
//           background-color: #111827 !important;
//         }

//         .admin-book-payments-dark [class~="bg-slate-200"] {
//           background-color: #1e293b !important;
//         }

//         .admin-book-payments-dark [class~="bg-blue-50"],
//         .admin-book-payments-dark [class~="bg-blue-50/40"] {
//           background-color: rgba(37, 99, 235, 0.14) !important;
//         }

//         .admin-book-payments-dark [class~="bg-emerald-50"] {
//           background-color: rgba(5, 150, 105, 0.14) !important;
//         }

//         .admin-book-payments-dark [class~="bg-amber-50"] {
//           background-color: rgba(217, 119, 6, 0.14) !important;
//         }

//         .admin-book-payments-dark [class~="bg-red-50"] {
//           background-color: rgba(220, 38, 38, 0.14) !important;
//         }

//         .admin-book-payments-dark [class~="bg-violet-50"] {
//           background-color: rgba(124, 58, 237, 0.14) !important;
//         }

//         .admin-book-payments-dark [class~="bg-sky-50"] {
//           background-color: rgba(2, 132, 199, 0.14) !important;
//         }

//         .admin-book-payments-dark [class~="text-slate-950"],
//         .admin-book-payments-dark [class~="text-slate-900"] {
//           color: #f8fafc !important;
//         }

//         .admin-book-payments-dark [class~="text-slate-800"],
//         .admin-book-payments-dark [class~="text-slate-700"] {
//           color: #e2e8f0 !important;
//         }

//         .admin-book-payments-dark [class~="text-slate-600"],
//         .admin-book-payments-dark [class~="text-slate-500"] {
//           color: #cbd5e1 !important;
//         }

//         .admin-book-payments-dark [class~="text-slate-400"] {
//           color: #94a3b8 !important;
//         }

//         .admin-book-payments-dark [class~="text-slate-300"] {
//           color: #64748b !important;
//         }

//         .admin-book-payments-dark [class~="text-blue-700"],
//         .admin-book-payments-dark [class~="text-blue-600"] {
//           color: #60a5fa !important;
//         }

//         .admin-book-payments-dark [class~="text-emerald-700"],
//         .admin-book-payments-dark [class~="text-emerald-600"] {
//           color: #34d399 !important;
//         }

//         .admin-book-payments-dark [class~="text-amber-700"],
//         .admin-book-payments-dark [class~="text-amber-600"] {
//           color: #fbbf24 !important;
//         }

//         .admin-book-payments-dark [class~="text-red-700"],
//         .admin-book-payments-dark [class~="text-red-600"],
//         .admin-book-payments-dark [class~="text-red-500"] {
//           color: #f87171 !important;
//         }

//         .admin-book-payments-dark [class~="text-violet-700"],
//         .admin-book-payments-dark [class~="text-violet-600"] {
//           color: #a78bfa !important;
//         }

//         .admin-book-payments-dark [class~="text-sky-700"],
//         .admin-book-payments-dark [class~="text-sky-600"] {
//           color: #38bdf8 !important;
//         }

//         .admin-book-payments-dark [class~="border-slate-100"],
//         .admin-book-payments-dark [class~="border-slate-200"],
//         .admin-book-payments-dark [class~="border-slate-300"] {
//           border-color: #334155 !important;
//         }

//         .admin-book-payments-dark [class~="border-blue-100"],
//         .admin-book-payments-dark [class~="border-blue-200"] {
//           border-color: rgba(96, 165, 250, 0.3) !important;
//         }

//         .admin-book-payments-dark [class~="border-emerald-100"],
//         .admin-book-payments-dark [class~="border-emerald-200"] {
//           border-color: rgba(52, 211, 153, 0.3) !important;
//         }

//         .admin-book-payments-dark [class~="border-red-100"],
//         .admin-book-payments-dark [class~="border-red-200"] {
//           border-color: rgba(248, 113, 113, 0.3) !important;
//         }

//         .admin-book-payments-dark [class~="border-violet-200"] {
//           border-color: rgba(167, 139, 250, 0.3) !important;
//         }

//         .admin-book-payments-dark [class~="border-amber-200"] {
//           border-color: rgba(251, 191, 36, 0.3) !important;
//         }

//         .admin-book-payments-dark [class~="border-sky-200"] {
//           border-color: rgba(56, 189, 248, 0.3) !important;
//         }

//         .admin-book-payments-dark [class~="bg-gradient-to-r"] {
//           background-image: linear-gradient(
//             to right,
//             #0f172a,
//             #111827,
//             #0f172a
//           ) !important;
//         }

//         .admin-book-payments-dark input,
//         .admin-book-payments-dark textarea,
//         .admin-book-payments-dark select {
//           background-color: #0f172a !important;
//           border-color: #334155 !important;
//           color: #f8fafc !important;
//         }

//         .admin-book-payments-dark input::placeholder,
//         .admin-book-payments-dark textarea::placeholder {
//           color: #64748b !important;
//         }

//         .admin-book-payments-dark [class~="disabled:bg-white"]:disabled,
//         .admin-book-payments-dark [class~="disabled:bg-slate-100"]:disabled {
//           background-color: #111827 !important;
//         }

//         .admin-book-payments-dark [class~="hover:bg-slate-50"]:hover,
//         .admin-book-payments-dark [class~="hover:bg-slate-100"]:hover,
//         .admin-book-payments-dark [class~="hover:bg-slate-200"]:hover {
//           background-color: #1e293b !important;
//         }

//         .admin-book-payments-dark [class~="hover:bg-blue-50"]:hover {
//           background-color: rgba(37, 99, 235, 0.2) !important;
//         }

//         .admin-book-payments-dark [class~="hover:bg-emerald-50"]:hover {
//           background-color: rgba(5, 150, 105, 0.2) !important;
//         }

//         .admin-book-payments-dark [class~="hover:bg-violet-50"]:hover {
//           background-color: rgba(124, 58, 237, 0.2) !important;
//         }

//         .admin-book-payments-dark [class~="hover:bg-red-50"]:hover {
//           background-color: rgba(220, 38, 38, 0.2) !important;
//         }

//         .admin-book-payments-dark pre {
//           background-color: #020617 !important;
//           color: #e2e8f0 !important;
//         }
//       `}</style>

//       <main className="min-h-screen bg-slate-50 pt-24 text-slate-900 sm:pt-28">
//         <div className="mx-auto max-w-[1550px] px-4 pb-20 sm:px-6 lg:px-8">
//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <button
//               type="button"
//               onClick={() =>
//                 navigate(
//                   `/admin/book/${bookId}`
//                 )
//               }
//               className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-blue-600"
//             >
//               <ArrowLeft className="h-4 w-4" />

//               Back to Book Details
//             </button>

//             <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate(
//                     `/admin/book/${bookId}/reviews`
//                   )
//                 }
//                 className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
//               >
//                 <MessageSquareText className="h-4 w-4" />

//                 Manage Reviews
//               </button>

//               <button
//                 type="button"
//                 onClick={() =>
//                   fetchPayments(
//                     page
//                   )
//                 }
//                 disabled={
//                   loading
//                 }
//                 className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:opacity-50"
//               >
//                 <RefreshCw
//                   className={`h-4 w-4 ${
//                     loading
//                       ? "animate-spin"
//                       : ""
//                   }`}
//                 />

//                 Refresh
//               </button>
//             </div>
//           </div>

//           <section className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
//             <div className="bg-gradient-to-r from-blue-50 via-white to-slate-50 p-5 sm:p-7">
//               <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
//                 <div className="min-w-0">
//                   <div className="flex items-center gap-3">
//                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
//                       <ShoppingBag className="h-6 w-6" />
//                     </div>

//                     <div className="min-w-0">
//                       <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-blue-600">
//                         Payment Management
//                       </p>

//                       <h1 className="mt-1 truncate text-2xl font-extrabold text-slate-950 sm:text-3xl">
//                         {book?.title ||
//                           "Book Payments"}
//                       </h1>
//                     </div>
//                   </div>

//                   <p className="mt-4 max-w-2xl text-sm font-medium leading-6 text-slate-500">
//                     Review payment status, customer details,
//                     discounts, refunds, reminder emails,
//                     verification, access activity and provider
//                     data from one place.
//                   </p>
//                 </div>

//                 <div className="grid grid-cols-2 gap-3 sm:flex">
//                   <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
//                     <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
//                       Book Price
//                     </p>

//                     <p className="mt-1 text-xl font-extrabold text-slate-950">
//                       {money(
//                         book?.price,
//                         currency
//                       )}
//                     </p>
//                   </div>

//                   <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white shadow-sm">
//                     <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-slate-400">
//                       Total Orders
//                     </p>

//                     <p className="mt-1 text-xl font-extrabold">
//                       {summary.totalOrders ||
//                         0}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </section>

//           <section className="sticky top-20 z-20 mt-5 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur sm:top-24 sm:p-4">
//             <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
//               <div className="flex min-w-0 items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
//                 {FILTERS.map(
//                   (
//                     filter
//                   ) => (
//                     <FilterTab
//                       key={
//                         filter.key
//                       }
//                       active={
//                         statusFilter ===
//                         filter.key
//                       }
//                       icon={
//                         filter.icon
//                       }
//                       label={
//                         filter.label
//                       }
//                       count={
//                         filterCounts[
//                           filter.key
//                         ]
//                       }
//                       tone={
//                         filter.key
//                       }
//                       onClick={() =>
//                         setStatusFilter(
//                           filter.key
//                         )
//                       }
//                     />
//                   )
//                 )}
//               </div>

//               <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
//                 <div className="relative min-w-0 sm:w-[320px]">
//                   <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

//                   <input
//                     value={
//                       searchQuery
//                     }
//                     onChange={(
//                       event
//                     ) =>
//                       setSearchQuery(
//                         event.target
//                           .value
//                       )
//                     }
//                     placeholder="Search name, email, order or transaction"
//                     className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
//                   />

//                   {searchQuery && (
//                     <button
//                       type="button"
//                       onClick={() =>
//                         setSearchQuery(
//                           ""
//                         )
//                       }
//                       className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700"
//                     >
//                       <X className="h-3.5 w-3.5" />
//                     </button>
//                   )}
//                 </div>

//                 <div className="whitespace-nowrap rounded-xl bg-slate-100 px-3.5 py-3 text-xs font-extrabold text-slate-600">
//                   {
//                     visiblePayments.length
//                   }{" "}
//                   shown
//                 </div>
//               </div>
//             </div>
//           </section>

//           <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
//             <MetricCard
//               icon={
//                 <CheckCircle2 className="h-5 w-5" />
//               }
//               label="Successful"
//               value={
//                 summary.payments
//                   .successfulPayments
//               }
//               helper={money(
//                 summary.payments
//                   .successfulAmount,
//                 currency
//               )}
//               tone="green"
//             />

//             <MetricCard
//               icon={
//                 <Clock3 className="h-5 w-5" />
//               }
//               label="Pending"
//               value={
//                 summary.payments
//                   .pendingPayments
//               }
//               helper={money(
//                 summary.payments
//                   .pendingAmount,
//                 currency
//               )}
//               tone="amber"
//             />

//             <MetricCard
//               icon={
//                 <XCircle className="h-5 w-5" />
//               }
//               label="Failed"
//               value={
//                 summary.payments
//                   .failedPayments
//               }
//               helper={money(
//                 summary.payments
//                   .failedAmount,
//                 currency
//               )}
//               tone="red"
//             />

//             <MetricCard
//               icon={
//                 <CircleDollarSign className="h-5 w-5" />
//               }
//               label="Gross Paid"
//               value={money(
//                 summary.payments
//                   .grossPaidAmount,
//                 currency
//               )}
//               helper={`${
//                 summary.payments
//                   .paidOrders ||
//                 0
//               } paid orders`}
//               tone="blue"
//             />

//             <MetricCard
//               icon={
//                 <Banknote className="h-5 w-5" />
//               }
//               label="Net Revenue"
//               value={money(
//                 summary.payments
//                   .netRevenue,
//                 currency
//               )}
//               helper="After recorded refunds"
//               tone="green"
//             />

//             <MetricCard
//               icon={
//                 <RotateCcw className="h-5 w-5" />
//               }
//               label="Refunded"
//               value={money(
//                 summary.refunds
//                   .totalRefundedAmount,
//                 currency
//               )}
//               helper={`${
//                 summary.refunds
//                   .refundOrders ||
//                 0
//               } refund orders`}
//               tone="violet"
//             />
//           </div>

//           <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
//             <MetricCard
//               icon={
//                 <BadgePercent className="h-5 w-5" />
//               }
//               label="Coupon Orders"
//               value={
//                 summary.coupons
//                   .couponAppliedOrders
//               }
//               helper={money(
//                 summary.coupons
//                   .totalDiscountAmount,
//                 currency
//               )}
//               tone="blue"
//             />

//             <MetricCard
//               icon={
//                 <Mail className="h-5 w-5" />
//               }
//               label="Reminder Mails"
//               value={
//                 summary.reminderMails
//                   .totalSent
//               }
//               helper={`${
//                 summary.reminderMails
//                   .ordersWithReminderMail ||
//                 0
//               } orders contacted`}
//               tone="blue"
//             />

//             <MetricCard
//               icon={
//                 <Activity className="h-5 w-5" />
//               }
//               label="Access Count"
//               value={
//                 summary.access
//                   .totalAccessCount
//               }
//               helper={`${
//                 summary.access
//                   .revokedAccessOrders ||
//                 0
//               } revoked`}
//               tone="slate"
//             />

//             <MetricCard
//               icon={
//                 <ShieldCheck className="h-5 w-5" />
//               }
//               label="PayU Verified"
//               value={
//                 summary.verification
//                   .payuVerified
//               }
//               helper={`${
//                 summary.verification
//                   .amountVerified ||
//                 0
//               } amount verified`}
//               tone="green"
//             />

//             <MetricCard
//               icon={
//                 <Tag className="h-5 w-5" />
//               }
//               label="Affiliate Orders"
//               value={
//                 summary.affiliates
//                   .affiliateOrders
//               }
//               helper="Attributed orders"
//               tone="slate"
//             />

//             <MetricCard
//               icon={
//                 <Receipt className="h-5 w-5" />
//               }
//               label="Order Value"
//               value={money(
//                 summary.totalOrderAmount,
//                 currency
//               )}
//               helper="Total recorded amount"
//               tone="blue"
//             />
//           </div>

//           <BreakdownSection
//             breakdown={
//               breakdown
//             }
//             currency={
//               currency
//             }
//           />

//           {error && (
//             <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex items-start gap-2 text-sm font-semibold text-red-700">
//                 <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

//                 {error}
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   fetchPayments(
//                     page
//                   )
//                 }
//                 className="text-left text-xs font-extrabold text-red-700 sm:text-right"
//               >
//                 Retry
//               </button>
//             </div>
//           )}

//           <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <p className="text-sm font-bold text-slate-700">
//                 Page{" "}
//                 <span className="font-extrabold text-slate-950">
//                   {pagination.page ||
//                     page}
//                 </span>{" "}
//                 of{" "}
//                 <span className="font-extrabold text-slate-950">
//                   {Math.max(
//                     pagination.totalPages ||
//                       1,
//                     1
//                   )}
//                 </span>
//               </p>

//               <p className="mt-1 text-xs font-medium text-slate-400">
//                 {pagination.totalItems ||
//                   0}{" "}
//                 total payment records ·{" "}
//                 {pagination.returnedItems ||
//                   0}{" "}
//                 loaded on this page
//               </p>
//             </div>

//             <div className="flex gap-2">
//               <button
//                 type="button"
//                 onClick={() =>
//                   goToPage(
//                     page -
//                       1
//                   )
//                 }
//                 disabled={
//                   !pagination.hasPreviousPage ||
//                   loading
//                 }
//                 className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
//               >
//                 <ChevronLeft className="h-4 w-4" />

//                 Previous
//               </button>

//               <button
//                 type="button"
//                 onClick={() =>
//                   goToPage(
//                     page +
//                       1
//                   )
//                 }
//                 disabled={
//                   !pagination.hasNextPage ||
//                   loading
//                 }
//                 className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
//               >
//                 Next

//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           </div>

//           {loading &&
//           payments.length ===
//             0 ? (
//             <div className="py-24 text-center">
//               <Loader2 className="mx-auto h-9 w-9 animate-spin text-blue-600" />

//               <p className="mt-3 text-sm font-semibold text-slate-500">
//                 Loading payment records...
//               </p>
//             </div>
//           ) : payments.length ===
//             0 ? (
//             <div className="mt-6 rounded-3xl border border-slate-200 bg-white py-20 text-center shadow-sm">
//               <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
//                 <Receipt className="h-7 w-7 text-slate-400" />
//               </div>

//               <h3 className="mt-4 text-lg font-extrabold text-slate-900">
//                 No payments found
//               </h3>

//               <p className="mt-2 text-sm font-medium text-slate-400">
//                 There are no payment records available for this
//                 page.
//               </p>
//             </div>
//           ) : visiblePayments.length ===
//             0 ? (
//             <div className="mt-6 rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-sm">
//               <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
//                 <Search className="h-6 w-6" />
//               </div>

//               <h3 className="mt-4 text-lg font-extrabold text-slate-900">
//                 No matching payments
//               </h3>

//               <p className="mx-auto mt-2 max-w-lg text-sm font-medium leading-6 text-slate-400">
//                 No payment on this loaded page matches the selected
//                 status and search criteria.
//               </p>

//               <button
//                 type="button"
//                 onClick={() => {
//                   setStatusFilter(
//                     "ALL"
//                   );

//                   setSearchQuery(
//                     ""
//                   );
//                 }}
//                 className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           ) : (
//             <div className="mt-6 space-y-6">
//               {visiblePayments.map(
//                 (
//                   order
//                 ) => {
//                   const originalIndex =
//                     payments.findIndex(
//                       (
//                         item
//                       ) =>
//                         item ===
//                         order
//                     );

//                   return (
//                     <PaymentCard
//                       key={
//                         order._id ||
//                         order.orderId ||
//                         originalIndex
//                       }
//                       order={
//                         order
//                       }
//                       index={
//                         (page -
//                           1) *
//                           10 +
//                         originalIndex +
//                         1
//                       }
//                       currency={
//                         currency
//                       }
//                       menuOpen={
//                         menuOrderId ===
//                         order._id
//                       }
//                       onToggleMenu={() =>
//                         setMenuOrderId(
//                           (
//                             current
//                           ) =>
//                             current ===
//                             order._id
//                               ? null
//                               : order._id
//                         )
//                       }
//                       onSendMail={() =>
//                         openPendingModal(
//                           order
//                         )
//                       }
//                       onSendAccessMail={() =>
//                         handleSendAccessMail(
//                           order
//                         )
//                       }
//                       sendingAccessMail={
//                         sendingAccessOrderId ===
//                         order._id
//                       }
//                       onGenerateReviewLink={() =>
//                         handleGenerateReviewLink(
//                           order
//                         )
//                       }
//                       generatingReviewLink={
//                         generatingReviewOrderId ===
//                         order._id
//                       }
//                       onSendReviewMail={() =>
//                         handleSendReviewMail(
//                           order
//                         )
//                       }
//                       sendingReviewMail={
//                         sendingReviewMailOrderId ===
//                         order._id
//                       }
//                       onDelete={() => {
//                         setMenuOrderId(
//                           null
//                         );

//                         setDeleteOrder(
//                           order
//                         );
//                       }}
//                     />
//                   );
//                 }
//               )}
//             </div>
//           )}

//           {payments.length >
//             0 && (
//             <div className="mt-8 flex items-center justify-center gap-2">
//               <button
//                 type="button"
//                 onClick={() =>
//                   goToPage(
//                     page -
//                       1
//                   )
//                 }
//                 disabled={
//                   !pagination.hasPreviousPage ||
//                   loading
//                 }
//                 className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm disabled:opacity-40"
//               >
//                 <ChevronLeft className="h-4 w-4" />

//                 Previous
//               </button>

//               <span className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm">
//                 {page} /{" "}
//                 {Math.max(
//                   pagination.totalPages ||
//                     1,
//                   1
//                 )}
//               </span>

//               <button
//                 type="button"
//                 onClick={() =>
//                   goToPage(
//                     page +
//                       1
//                   )
//                 }
//                 disabled={
//                   !pagination.hasNextPage ||
//                   loading
//                 }
//                 className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:bg-slate-300"
//               >
//                 Next

//                 <ChevronRight className="h-4 w-4" />
//               </button>
//             </div>
//           )}
//         </div>
//       </main>

//       {pendingOrder && (
//         <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
//           <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
//             <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white p-6">
//               <div className="flex items-start justify-between gap-5">
//                 <div className="flex items-start gap-4">
//                   <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
//                     <Send className="h-5 w-5" />
//                   </div>

//                   <div>
//                     <h2 className="text-xl font-extrabold text-slate-950">
//                       Send Purchase Reminder
//                     </h2>

//                     <p className="mt-1 text-sm leading-6 text-slate-500">
//                       Send a recovery email for this incomplete
//                       purchase.
//                     </p>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={
//                     closePendingModal
//                   }
//                   disabled={
//                     sendingMail
//                   }
//                   className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
//                 >
//                   <X className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>

//             <div className="p-6">
//               <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
//                 <div className="flex items-start gap-3">
//                   <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
//                     <User className="h-4 w-4" />
//                   </div>

//                   <div className="min-w-0">
//                     <p className="font-extrabold text-slate-900">
//                       {pendingOrder
//                         .customer
//                         ?.name ||
//                         "Customer"}
//                     </p>

//                     <p className="mt-1 break-all text-sm font-semibold text-slate-500">
//                       {pendingOrder
//                         .customer
//                         ?.email ||
//                         "No email"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-200 pt-4">
//                   <div>
//                     <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
//                       Order
//                     </p>

//                     <p className="mt-1 break-all font-mono text-xs font-bold text-slate-700">
//                       {pendingOrder.orderId ||
//                         "—"}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
//                       Status
//                     </p>

//                     <div className="mt-1">
//                       <StatusBadge
//                         status={
//                           pendingOrder
//                             .payment
//                             ?.status ||
//                           pendingOrder.orderStatus
//                         }
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
//                 <div className="flex gap-3">
//                   <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

//                   <p className="text-xs font-semibold leading-5 text-blue-700">
//                     Coupon is optional. Enter both coupon code and
//                     description to include an offer, or leave both
//                     fields empty to send a normal reminder.
//                   </p>
//                 </div>
//               </div>

//               <div className="mt-6 space-y-5">
//                 <div>
//                   <label className="mb-2 block text-xs font-extrabold text-slate-700">
//                     Coupon Code
//                   </label>

//                   <input
//                     value={
//                       couponCode
//                     }
//                     onChange={(
//                       event
//                     ) =>
//                       setCouponCode(
//                         event.target
//                           .value
//                       )
//                     }
//                     placeholder="Example: SAVE20"
//                     disabled={
//                       sendingMail
//                     }
//                     className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
//                   />
//                 </div>

//                 <div>
//                   <label className="mb-2 block text-xs font-extrabold text-slate-700">
//                     Coupon Description
//                   </label>

//                   <textarea
//                     value={
//                       couponDescription
//                     }
//                     onChange={(
//                       event
//                     ) =>
//                       setCouponDescription(
//                         event.target
//                           .value
//                       )
//                     }
//                     placeholder="Example: Get 20% off on your purchase"
//                     rows={
//                       4
//                     }
//                     disabled={
//                       sendingMail
//                     }
//                     className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold leading-6 text-slate-800 outline-none transition placeholder:text-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
//                   />
//                 </div>
//               </div>

//               {couponCode.trim() &&
//                 couponDescription.trim() && (
//                   <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
//                     <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">
//                       Coupon Preview
//                     </p>

//                     <p className="mt-2 font-mono text-lg font-extrabold text-emerald-700">
//                       {couponCode
//                         .trim()
//                         .toUpperCase()}
//                     </p>

//                     <p className="mt-1 text-sm font-semibold leading-6 text-emerald-700">
//                       {couponDescription.trim()}
//                     </p>
//                   </div>
//                 )}

//               <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
//                 <button
//                   type="button"
//                   onClick={
//                     closePendingModal
//                   }
//                   disabled={
//                     sendingMail
//                   }
//                   className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   onClick={
//                     handleSendPendingMail
//                   }
//                   disabled={
//                     sendingMail
//                   }
//                   className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
//                 >
//                   {sendingMail ? (
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   ) : (
//                     <Mail className="h-4 w-4" />
//                   )}

//                   {sendingMail
//                     ? "Sending Reminder..."
//                     : "Send Reminder Email"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {reviewLinkModal && (
//         <div
//           className="fixed inset-0 z-[125] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
//           onClick={() =>
//             setReviewLinkModal(
//               null
//             )
//           }
//         >
//           <div
//             onClick={(event) =>
//               event.stopPropagation()
//             }
//             className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7"
//           >
//             <div className="flex items-start justify-between gap-4">
//               <div className="flex min-w-0 items-start gap-4">
//                 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
//                   <Link2 className="h-5 w-5" />
//                 </div>

//                 <div className="min-w-0">
//                   <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-violet-600">
//                     {reviewLinkModal.alreadyGenerated
//                       ? "Existing Review Link"
//                       : "Review Link Generated"}
//                   </p>

//                   <h2 className="mt-1 text-xl font-extrabold text-slate-950">
//                     Customer Review Link
//                   </h2>

//                   <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
//                     Share this unique link with the customer. The same link is returned if it has already been generated.
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={() =>
//                   setReviewLinkModal(
//                     null
//                   )
//                 }
//                 className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
//                 aria-label="Close review link"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
//               <div>
//                 <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
//                   Customer
//                 </p>

//                 <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
//                   {reviewLinkModal.customerName}
//                 </p>

//                 <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
//                   {reviewLinkModal.customerEmail ||
//                     "No email available"}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
//                   Order / Book
//                 </p>

//                 <p className="mt-1 truncate text-sm font-extrabold text-slate-900">
//                   {reviewLinkModal.bookTitle}
//                 </p>

//                 <p className="mt-0.5 truncate font-mono text-xs font-semibold text-slate-500">
//                   {reviewLinkModal.orderId}
//                 </p>
//               </div>
//             </div>

//             <div className="mt-5">
//               <label className="mb-2 block text-xs font-extrabold text-slate-700">
//                 Review Link
//               </label>

//               <div className="flex items-stretch gap-2">
//                 <input
//                   type="text"
//                   readOnly
//                   value={
//                     reviewLinkModal.reviewUrl
//                   }
//                   onFocus={(event) =>
//                     event.target.select()
//                   }
//                   className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-xs font-semibold text-slate-800 outline-none"
//                 />

//                 <button
//                   type="button"
//                   onClick={() =>
//                     copyValue(
//                       reviewLinkModal.reviewUrl,
//                       "Review link"
//                     )
//                   }
//                   className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700"
//                   title="Copy review link"
//                 >
//                   <Copy className="h-4 w-4" />

//                   <span className="hidden sm:inline">
//                     Copy
//                   </span>
//                 </button>
//               </div>
//             </div>

//             <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
//               <div className="flex gap-3">
//                 <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />

//                 <p className="text-xs font-semibold leading-5 text-blue-700">
//                   The customer will only see the book details and review fields on this link. Customer name and email remain internal to the admin flow.
//                 </p>
//               </div>
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setReviewLinkModal(
//                     null
//                   )
//                 }
//                 className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {deleteOrder && (
//         <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
//           <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
//             <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
//               <Trash2 className="h-6 w-6 text-red-600" />
//             </div>

//             <h2 className="mt-5 text-2xl font-extrabold text-slate-950">
//               Delete Payment?
//             </h2>

//             <p className="mt-3 text-sm font-medium leading-6 text-slate-500">
//               This will permanently delete the payment and order
//               record for{" "}
//               <strong className="text-slate-800">
//                 {deleteOrder.customer
//                   ?.email ||
//                   deleteOrder.orderId}
//               </strong>
//               . This action cannot be undone.
//             </p>

//             <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-4">
//               <p className="text-[10px] font-extrabold uppercase tracking-wider text-red-500">
//                 Mongo ID
//               </p>

//               <p className="mt-1 break-all font-mono text-xs font-bold text-red-700">
//                 {deleteOrder._id}
//               </p>
//             </div>

//             <div className="mt-7 flex justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() =>
//                   setDeleteOrder(
//                     null
//                   )
//                 }
//                 disabled={
//                   deletingPayment
//                 }
//                 className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 disabled:opacity-50"
//               >
//                 Cancel
//               </button>

//               <button
//                 type="button"
//                 onClick={
//                   handleDeletePayment
//                 }
//                 disabled={
//                   deletingPayment
//                 }
//                 className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
//               >
//                 {deletingPayment ? (
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                 ) : (
//                   <Trash2 className="h-4 w-4" />
//                 )}

//                 {deletingPayment
//                   ? "Deleting..."
//                   : "Delete Payment"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";

import toast from "react-hot-toast";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  Filter,
  Globe2,
  Hash,
  KeyRound,
  Link2,
  Loader2,
  LockKeyhole,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ShieldOff,
  ShoppingBag,
  TimerReset,
  Trash2,
  UnlockKeyhole,
  UserRound,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import BASE_URL from "../utils/Url";


/* =========================================================
   THEME
========================================================= */

const THEME_KEY =
  "theme";

const THEME_EVENT =
  "targettrek-theme-change";


/* =========================================================
   DEFAULT SUMMARY
========================================================= */

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


/* =========================================================
   FILTERS
========================================================= */

const FILTERS = [
  {
    key: "ALL",

    label: "All",

    icon: Filter,
  },

  {
    key: "SUCCESS",

    label: "Success",

    icon: CheckCircle2,
  },

  {
    key: "PENDING",

    label: "Pending",

    icon: Clock3,
  },

  {
    key: "FAILED",

    label: "Failed",

    icon: XCircle,
  },
];


const SUCCESS_STATUSES =
  new Set([
    "SUCCESS",
    "PAID",
    "COMPLETED",
    "CAPTURED",
  ]);


const PENDING_STATUSES =
  new Set([
    "PENDING",
    "PROCESSING",
    "INITIATED",
    "IN_PROGRESS",
  ]);


const FAILED_STATUSES =
  new Set([
    "FAILED",
    "FAILURE",
    "BOUNCED",
    "DECLINED",
    "ERROR",
  ]);


/* =========================================================
   ACCESS EXTEND PRESETS
========================================================= */

const EXTEND_PRESETS = [
  {
    label: "1 hour",
    hours: 1,
  },

  {
    label: "6 hours",
    hours: 6,
  },

  {
    label: "12 hours",
    hours: 12,
  },

  {
    label: "24 hours",
    hours: 24,
  },

  {
    label: "48 hours",
    hours: 48,
  },

  {
    label: "72 hours",
    hours: 72,
  },

  {
    label: "7 days",
    hours: 168,
  },
];


/* =========================================================
   THEME HELPER
========================================================= */

function getIsDarkTheme() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }


  const storedTheme =
    String(
      window.localStorage.getItem(
        THEME_KEY
      ) || ""
    )
      .trim()
      .toLowerCase();


  if (
    storedTheme ===
    "dark"
  ) {
    return true;
  }


  if (
    storedTheme ===
    "light"
  ) {
    return false;
  }


  return (
    document.documentElement.classList.contains(
      "dark"
    ) ||

    document.documentElement.getAttribute(
      "data-theme"
    ) ===
      "dark"
  );
}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
  status
) {
  return String(
    status || ""
  )
    .trim()
    .toUpperCase();
}


/* =========================================================
   GET ALL STATUS VALUES
========================================================= */

function getOrderStatusValues(
  order
) {
  const values = [
    order?.payment?.status,

    order?.orderStatus,

    order?.payment
      ?.callbackResponse
      ?.status,

    order?.payment
      ?.callbackResponse
      ?.unmappedstatus,

    order?.payment
      ?.verificationResponse
      ?.status,

    order?.payment
      ?.verificationResponse
      ?.unmappedstatus,
  ];


  return values
    .map(
      normalizeStatus
    )
    .filter(
      Boolean
    );
}


/* =========================================================
   ORDER STATUS BUCKET

   Failed gets priority.

   This fixes cases where provider callback / payment /
   order status are not perfectly aligned.
========================================================= */

function getOrderBucket(
  order
) {
  const statuses =
    getOrderStatusValues(
      order
    );


  const hasFailedStatus =
    statuses.some(
      (
        status
      ) =>
        FAILED_STATUSES.has(
          status
        )
    );


  const hasFailedDate =
    Boolean(
      order?.payment?.failedAt
    );


  if (
    hasFailedStatus ||
    hasFailedDate
  ) {
    return "FAILED";
  }


  const hasSuccessStatus =
    statuses.some(
      (
        status
      ) =>
        SUCCESS_STATUSES.has(
          status
        )
    );


  if (
    hasSuccessStatus
  ) {
    return "SUCCESS";
  }


  const hasPendingStatus =
    statuses.some(
      (
        status
      ) =>
        PENDING_STATUSES.has(
          status
        )
    );


  if (
    hasPendingStatus
  ) {
    return "PENDING";
  }


  return "OTHER";
}


/* =========================================================
   PRIMARY DISPLAY STATUS
========================================================= */

function getOrderPrimaryStatus(
  order
) {
  const bucket =
    getOrderBucket(
      order
    );


  if (
    bucket !==
    "OTHER"
  ) {
    return bucket;
  }


  return (
    normalizeStatus(
      order?.payment?.status
    ) ||

    normalizeStatus(
      order?.orderStatus
    ) ||

    "UNKNOWN"
  );
}


/* =========================================================
   FILTER MATCH
========================================================= */

function matchesStatusFilter(
  order,
  filter
) {
  if (
    filter ===
    "ALL"
  ) {
    return true;
  }


  return (
    getOrderBucket(
      order
    ) ===
    filter
  );
}


/* =========================================================
   MONEY
========================================================= */

function money(
  value,
  currency = "INR"
) {
  if (
    value ===
      undefined ||

    value ===
      null ||

    value ===
      ""
  ) {
    return "—";
  }


  const amount =
    Number(
      value
    );


  if (
    !Number.isFinite(
      amount
    )
  ) {
    return "—";
  }


  try {
    return new Intl
      .NumberFormat(
        currency ===
          "INR"
          ? "en-IN"
          : "en-US",
        {
          style:
            "currency",

          currency,

          maximumFractionDigits:
            2,
        }
      )
      .format(
        amount
      );
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}


/* =========================================================
   DATE
========================================================= */

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }


  const date =
    value instanceof Date
      ? value
      : new Date(
          value
        );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }


  return date.toLocaleString(
    "en-IN",
    {
      timeZone:
        "Asia/Kolkata",

      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      second:
        "2-digit",

      hour12:
        true,
    }
  );
}


/* =========================================================
   YES / NO
========================================================= */

function yesNo(
  value
) {
  if (
    value ===
    true
  ) {
    return "Yes";
  }


  if (
    value ===
    false
  ) {
    return "No";
  }


  return "—";
}


/* =========================================================
   READ RESPONSE
========================================================= */

async function readResponse(
  response
) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}


/* =========================================================
   COPY VALUE
========================================================= */

function copyValue(
  value,
  label = "Value"
) {
  if (
    value ===
      undefined ||

    value ===
      null ||

    value ===
      ""
  ) {
    toast.error(
      `${label} is unavailable.`
    );

    return;
  }


  navigator.clipboard
    ?.writeText(
      String(
        value
      )
    )
    .then(
      () => {
        toast.success(
          `${label} copied`
        );
      }
    )
    .catch(
      () => {
        toast.error(
          "Unable to copy."
        );
      }
    );
}


/* =========================================================
   ACCESS STATE
========================================================= */

function getAccessState(
  order,
  now =
    Date.now()
) {
  const access =
    order?.access ||
    {};


  if (
    access.revoked ===
    true
  ) {
    return {
      key:
        "REVOKED",

      label:
        "Revoked",

      description:
        "Customer access has been manually revoked.",
    };
  }


  if (
    !access.expiresAt
  ) {
    return {
      key:
        "NONE",

      label:
        "Not Generated",

      description:
        "No secure access expiry is available for this order.",
    };
  }


  const expiry =
    new Date(
      access.expiresAt
    );


  if (
    Number.isNaN(
      expiry.getTime()
    )
  ) {
    return {
      key:
        "UNKNOWN",

      label:
        "Unknown",

      description:
        "The stored access expiry is invalid.",
    };
  }


  if (
    expiry.getTime() <=
    now
  ) {
    return {
      key:
        "EXPIRED",

      label:
        "Expired",

      description:
        "The current book access period has expired.",
    };
  }


  return {
    key:
      "ACTIVE",

    label:
      "Active",

    description:
      "Customer currently has valid secure book access.",
  };
}


/* =========================================================
   REMAINING TIME
========================================================= */

function getRemainingTime(
  expiresAt,
  now =
    Date.now()
) {
  if (
    !expiresAt
  ) {
    return "No expiry";
  }


  const expiry =
    new Date(
      expiresAt
    );


  if (
    Number.isNaN(
      expiry.getTime()
    )
  ) {
    return "Invalid expiry";
  }


  const difference =
    expiry.getTime() -
    now;


  if (
    difference <=
    0
  ) {
    const elapsed =
      Math.abs(
        difference
      );


    const days =
      Math.floor(
        elapsed /
          86400000
      );


    const hours =
      Math.floor(
        elapsed /
          3600000
      );


    const minutes =
      Math.max(
        1,

        Math.floor(
          elapsed /
            60000
        )
      );


    if (
      days >
      0
    ) {
      return `Expired ${days}d ago`;
    }


    if (
      hours >
      0
    ) {
      return `Expired ${hours}h ago`;
    }


    return `Expired ${minutes}m ago`;
  }


  const totalMinutes =
    Math.ceil(
      difference /
        60000
    );


  const days =
    Math.floor(
      totalMinutes /
        1440
    );


  const hours =
    Math.floor(
      (
        totalMinutes %
        1440
      ) /
        60
    );


  const minutes =
    totalMinutes %
    60;


  if (
    days >
    0
  ) {
    return `${days}d ${hours}h remaining`;
  }


  if (
    hours >
    0
  ) {
    return `${hours}h ${minutes}m remaining`;
  }


  return `${Math.max(
    minutes,
    1
  )}m remaining`;
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}) {
  const normalized =
    normalizeStatus(
      status
    );


  let type =
    "neutral";


  if (
    FAILED_STATUSES.has(
      normalized
    ) ||
    normalized ===
      "FAILED"
  ) {
    type =
      "failed";
  } else if (
    PENDING_STATUSES.has(
      normalized
    ) ||
    normalized ===
      "PENDING"
  ) {
    type =
      "pending";
  } else if (
    SUCCESS_STATUSES.has(
      normalized
    ) ||
    normalized ===
      "SUCCESS"
  ) {
    type =
      "success";
  }


  const Icon =
    type ===
    "success"
      ? CheckCircle2
      : type ===
        "pending"
      ? Clock3
      : type ===
        "failed"
      ? XCircle
      : Activity;


  return (
    <span
      className={`tt-status tt-status-${type}`}
    >
      <Icon
        className="h-3 w-3"
      />

      {normalized ||
        "UNKNOWN"}
    </span>
  );
}


/* =========================================================
   ACCESS BADGE
========================================================= */

function AccessBadge({
  state,
}) {
  const Icon =
    state.key ===
    "ACTIVE"
      ? UnlockKeyhole
      : state.key ===
        "REVOKED"
      ? LockKeyhole
      : state.key ===
        "EXPIRED"
      ? TimerReset
      : KeyRound;


  return (
    <span
      className={`tt-access-badge tt-access-${state.key.toLowerCase()}`}
    >
      <Icon
        className="h-3 w-3"
      />

      {state.label}
    </span>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,

  label,

  value,

  helper,

  tone =
    "blue",
}) {
  return (
    <div
      className="tt-card p-4"
    >
      <div
        className="flex items-start justify-between gap-3"
      >
        <div
          className="min-w-0"
        >
          <p
            className="tt-label"
          >
            {label}
          </p>


          <p
            className="tt-summary-value"
          >
            {value}
          </p>


          {helper ? (
            <p
              className="tt-helper mt-1"
            >
              {helper}
            </p>
          ) : null}
        </div>


        <div
          className={`tt-summary-icon tt-summary-${tone}`}
        >
          <Icon
            className="h-5 w-5"
          />
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   DATA ITEM
========================================================= */

function DataItem({
  label,

  value,

  copy = false,

  mono = false,

  children,
}) {
  const hasValue =
    value !==
      undefined &&

    value !==
      null &&

    value !==
      "";


  return (
    <div
      className="tt-data-item"
    >
      <p
        className="tt-label"
      >
        {label}
      </p>


      <div
        className="mt-1.5 flex min-w-0 items-start justify-between gap-2"
      >
        <div
          className="min-w-0"
        >
          {children || (
            <p
              className={`tt-data-value ${
                mono
                  ? "font-mono text-[11px]"
                  : ""
              }`}
            >
              {hasValue
                ? String(
                    value
                  )
                : "—"}
            </p>
          )}
        </div>


        {copy &&
        hasValue ? (
          <button
            type="button"

            onClick={() =>
              copyValue(
                value,
                label
              )
            }

            className="tt-copy-button"
          >
            <Copy
              className="h-3.5 w-3.5"
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}


/* =========================================================
   ACCESS PANEL
========================================================= */

function AccessPanel({
  order,

  nowMs,
}) {
  const access =
    order?.access ||
    {};


  const state =
    getAccessState(
      order,
      nowMs
    );


  return (
    <section
      className={`tt-access-panel tt-access-panel-${state.key.toLowerCase()}`}
    >
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div
          className="flex items-start gap-3"
        >
          <div
            className="tt-access-icon"
          >
            <KeyRound
              className="h-5 w-5"
            />
          </div>


          <div>
            <div
              className="flex flex-wrap items-center gap-2"
            >
              <h3
                className="font-black"
              >
                Secure Book Access
              </h3>


              <AccessBadge
                state={
                  state
                }
              />
            </div>


            <p
              className="tt-helper mt-1"
            >
              {state.description}
            </p>
          </div>
        </div>


        <div
          className="tt-access-window"
        >
          <p
            className="tt-label"
          >
            Access Window
          </p>


          <p
            className="mt-1 text-xs font-black"
          >
            {getRemainingTime(
              access.expiresAt,
              nowMs
            )}
          </p>
        </div>
      </div>


      <div
        className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4"
      >
        <DataItem
          label="Expires At"

          value={
            formatDate(
              access.expiresAt
            )
          }
        />


        <DataItem
          label="Generated At"

          value={
            formatDate(
              access.generatedAt
            )
          }
        />


        <DataItem
          label="Last Accessed"

          value={
            formatDate(
              access.lastAccessedAt
            )
          }
        />


        <DataItem
          label="Access Count"

          value={
            Number(
              access.accessCount ||
              0
            )
          }
        />
      </div>
    </section>
  );
}


/* =========================================================
   JSON ACCORDION
========================================================= */

function JsonAccordion({
  label,

  value,
}) {
  const [
    open,
    setOpen,
  ] =
    useState(
      false
    );


  return (
    <div
      className="tt-card overflow-hidden"
    >
      <button
        type="button"

        onClick={() =>
          setOpen(
            (
              current
            ) =>
              !current
          )
        }

        className="tt-accordion-button"
      >
        <div>
          <p
            className="text-xs font-extrabold"
          >
            {label}
          </p>


          <p
            className="tt-helper mt-0.5"
          >
            {value
              ? "View provider payload"
              : "No payload available"}
          </p>
        </div>


        {open ? (
          <ChevronUp
            className="h-4 w-4"
          />
        ) : (
          <ChevronDown
            className="h-4 w-4"
          />
        )}
      </button>


      {open ? (
        <div
          className="tt-json-container"
        >
          <pre
            className="max-h-80 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-5"
          >
            {value
              ? JSON.stringify(
                  value,
                  null,
                  2
                )
              : "No data available"}
          </pre>
        </div>
      ) : null}
    </div>
  );
}


/* =========================================================
   ACTION MENU
========================================================= */

function ActionMenu({
  order,

  open,

  onToggle,

  onPending,

  onAccess,

  onExtend,

  onRevoke,

  onReviewLink,

  onReviewMail,

  onDelete,

  sendingAccess,

  extending,

  revoking,

  generatingReview,

  sendingReview,

  nowMs,
}) {
  const bucket =
    getOrderBucket(
      order
    );


  const isPaidSuccess =
    bucket ===
      "SUCCESS" &&

    normalizeStatus(
      order?.orderStatus
    ) ===
      "PAID";


  const accessState =
    getAccessState(
      order,
      nowMs
    );


  const hasAccess =
    Boolean(
      order?.access
        ?.generatedAt ||

      order?.access
        ?.expiresAt
    );


  return (
    <div
      className="relative"

      onClick={
        (
          event
        ) =>
          event.stopPropagation()
      }
    >
      <button
        type="button"

        onClick={
          onToggle
        }

        className="tt-btn tt-btn-secondary"
      >
        <MoreHorizontal
          className="h-4 w-4"
        />

        Manage

        <ChevronDown
          className={`h-3.5 w-3.5 transition ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>


      {open ? (
        <div
          className="tt-action-menu"
        >
          <div
            className="tt-menu-heading"
          >
            Order Actions
          </div>


          {bucket ===
            "FAILED" ||
          bucket ===
            "PENDING" ? (
            <button
              type="button"

              onClick={() =>
                onPending(
                  order
                )
              }

              className="tt-menu-item"
            >
              <Mail
                className="h-4 w-4"
              />

              Send Purchase Reminder
            </button>
          ) : null}


          {isPaidSuccess ? (
            <>
              <button
                type="button"

                disabled={
                  sendingAccess ||

                  accessState.key ===
                    "REVOKED"
                }

                onClick={() =>
                  onAccess(
                    order
                  )
                }

                className="tt-menu-item"
              >
                {sendingAccess ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Send
                    className="h-4 w-4"
                  />
                )}

                Send Book Access
              </button>


              <button
                type="button"

                disabled={
                  extending ||

                  !hasAccess
                }

                onClick={() =>
                  onExtend(
                    order
                  )
                }

                className="tt-menu-item tt-menu-success"
              >
                {extending ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <TimerReset
                    className="h-4 w-4"
                  />
                )}

                {accessState.key ===
                "REVOKED"
                  ? "Reactivate / Extend Access"
                  : "Extend Access"}
              </button>


              <button
                type="button"

                disabled={
                  revoking ||

                  !hasAccess ||

                  accessState.key ===
                    "REVOKED"
                }

                onClick={() =>
                  onRevoke(
                    order
                  )
                }

                className="tt-menu-item tt-menu-danger"
              >
                {revoking ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <ShieldOff
                    className="h-4 w-4"
                  />
                )}

                Revoke Book Access
              </button>


              <div
                className="tt-menu-divider"
              />


              <button
                type="button"

                disabled={
                  generatingReview
                }

                onClick={() =>
                  onReviewLink(
                    order
                  )
                }

                className="tt-menu-item"
              >
                {generatingReview ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Link2
                    className="h-4 w-4"
                  />
                )}

                Generate Review Link
              </button>


              <button
                type="button"

                disabled={
                  sendingReview
                }

                onClick={() =>
                  onReviewMail(
                    order
                  )
                }

                className="tt-menu-item"
              >
                {sendingReview ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <MessageSquareText
                    className="h-4 w-4"
                  />
                )}

                Send Review Email
              </button>
            </>
          ) : null}


          <div
            className="tt-menu-divider"
          />


          <button
            type="button"

            onClick={() =>
              onDelete(
                order
              )
            }

            className="tt-menu-item tt-menu-danger"
          >
            <Trash2
              className="h-4 w-4"
            />

            Delete Payment
          </button>
        </div>
      ) : null}
    </div>
  );
}


/* =========================================================
   PAYMENT CARD
========================================================= */

function PaymentCard({
  order,

  index,

  currency,

  menuOpen,

  onToggleMenu,

  onPending,

  onAccess,

  onExtend,

  onRevoke,

  onReviewLink,

  onReviewMail,

  onDelete,

  sendingAccess,

  extending,

  revoking,

  generatingReview,

  sendingReview,

  nowMs,
}) {
  const [
    expanded,
    setExpanded,
  ] =
    useState(
      false
    );


  const payment =
    order?.payment ||
    {};


  const customer =
    order?.customer ||
    {};


  const book =
    order?.book ||
    {};


  const coupon =
    order?.coupon ||
    {};


  const refund =
    order?.refund ||
    {};


  const reminder =
    order?.pendingMail ||
    {};


  const verification =
    order?.verification ||
    {};


  const metadata =
    order?.metadata ||
    {};


  const orderCurrency =
    book.currency ||

    currency ||

    "INR";


  const displayAmount =
    payment.amount ??

    coupon.finalAmount ??

    book.price;


  const primaryStatus =
    getOrderPrimaryStatus(
      order
    );


  const accessState =
    getAccessState(
      order,
      nowMs
    );


  return (
    <article
      className="tt-card overflow-visible"
    >
      <div
        className="tt-payment-header"
      >
        <div
          className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"
        >
          <div
            className="flex min-w-0 items-start gap-4"
          >
            <div
              className="tt-index"
            >
              {index}
            </div>


            <div
              className="min-w-0"
            >
              <div
                className="flex flex-wrap items-center gap-2"
              >
                <h2
                  className="truncate text-lg font-black"
                >
                  {customer.name ||
                    "Customer"}
                </h2>


                <StatusBadge
                  status={
                    primaryStatus
                  }
                />


                <AccessBadge
                  state={
                    accessState
                  }
                />
              </div>


              <p
                className="tt-muted mt-1 break-all text-sm font-semibold"
              >
                {customer.email ||
                  "No customer email"}
              </p>


              <div
                className="tt-subtle mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold"
              >
                <span
                  className="inline-flex items-center gap-1"
                >
                  <Hash
                    className="h-3 w-3"
                  />

                  {order.orderId ||
                    "No Order ID"}
                </span>


                <span
                  className="inline-flex items-center gap-1"
                >
                  <CalendarDays
                    className="h-3 w-3"
                  />

                  {formatDate(
                    order.createdAt
                  )}
                </span>
              </div>
            </div>
          </div>


          <div
            className="flex flex-wrap items-center gap-2"
          >
            <div
              className="tt-small-stat"
            >
              <p
                className="tt-label"
              >
                Amount
              </p>


              <p
                className="mt-1 text-lg font-black"
              >
                {money(
                  displayAmount,
                  orderCurrency
                )}
              </p>
            </div>


            <div
              className="tt-small-stat"
            >
              <p
                className="tt-label"
              >
                Provider
              </p>


              <p
                className="mt-1 text-sm font-black"
              >
                {payment.provider ||
                  "—"}
              </p>
            </div>


            <ActionMenu
              order={
                order
              }

              open={
                menuOpen
              }

              onToggle={
                onToggleMenu
              }

              onPending={
                onPending
              }

              onAccess={
                onAccess
              }

              onExtend={
                onExtend
              }

              onRevoke={
                onRevoke
              }

              onReviewLink={
                onReviewLink
              }

              onReviewMail={
                onReviewMail
              }

              onDelete={
                onDelete
              }

              sendingAccess={
                sendingAccess
              }

              extending={
                extending
              }

              revoking={
                revoking
              }

              generatingReview={
                generatingReview
              }

              sendingReview={
                sendingReview
              }

              nowMs={
                nowMs
              }
            />
          </div>
        </div>
      </div>


      <div
        className="space-y-4 p-5 sm:p-6"
      >
        <AccessPanel
          order={
            order
          }

          nowMs={
            nowMs
          }
        />


        <div
          className="grid grid-cols-2 gap-2 md:grid-cols-4"
        >
          <DataItem
            label="Payment ID"

            value={
              payment.paymentId
            }

            copy

            mono
          />


          <DataItem
            label="Transaction ID"

            value={
              payment.transactionId
            }

            copy

            mono
          />


          <DataItem
            label="Payment Method"

            value={
              payment.method
            }
          />


          <DataItem
            label="Affiliate"

            value={
              payment.affiliateCode ||
              "Direct / none"
            }
          />
        </div>


        <button
          type="button"

          onClick={() =>
            setExpanded(
              (
                current
              ) =>
                !current
            )
          }

          className="tt-expand-button"
        >
          <div>
            <p
              className="font-extrabold"
            >
              {expanded
                ? "Hide Complete Details"
                : "View Complete Details"}
            </p>


            <p
              className="tt-helper mt-0.5"
            >
              Customer, payment, coupon, refund,
              verification and provider information
            </p>
          </div>


          {expanded ? (
            <ChevronUp
              className="h-4 w-4"
            />
          ) : (
            <ChevronDown
              className="h-4 w-4"
            />
          )}
        </button>


        {expanded ? (
          <div
            className="space-y-4 border-t pt-4"

            style={{
              borderColor:
                "var(--tt-border)",
            }}
          >
            <div
              className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            >
              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <UserRound
                    className="h-4 w-4"
                  />

                  Customer & Order
                </div>


                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <DataItem
                    label="Name"

                    value={
                      customer.name
                    }
                  />


                  <DataItem
                    label="Email"

                    value={
                      customer.email
                    }

                    copy
                  />


                  <DataItem
                    label="Phone"

                    value={
                      customer.phone
                    }

                    copy
                  />


                  <DataItem
                    label="Mongo ID"

                    value={
                      order._id
                    }

                    copy

                    mono
                  />


                  <DataItem
                    label="Order Status"
                  >
                    <StatusBadge
                      status={
                        order.orderStatus
                      }
                    />
                  </DataItem>


                  <DataItem
                    label="Created By"

                    value={
                      order.createdBy
                    }
                  />


                  <DataItem
                    label="Created At"

                    value={
                      formatDate(
                        order.createdAt
                      )
                    }
                  />


                  <DataItem
                    label="Updated At"

                    value={
                      formatDate(
                        order.updatedAt
                      )
                    }
                  />
                </div>
              </section>


              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <CreditCard
                    className="h-4 w-4"
                  />

                  Payment Details
                </div>


                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <DataItem
                    label="Provider"

                    value={
                      payment.provider
                    }
                  />


                  <DataItem
                    label="Status"
                  >
                    <StatusBadge
                      status={
                        payment.status
                      }
                    />
                  </DataItem>


                  <DataItem
                    label="Amount"

                    value={
                      money(
                        payment.amount,
                        orderCurrency
                      )
                    }
                  />


                  <DataItem
                    label="Method"

                    value={
                      payment.method
                    }
                  />


                  <DataItem
                    label="Paid At"

                    value={
                      formatDate(
                        payment.paidAt
                      )
                    }
                  />


                  <DataItem
                    label="Failed At"

                    value={
                      formatDate(
                        payment.failedAt
                      )
                    }
                  />


                  <DataItem
                    label="Payment ID"

                    value={
                      payment.paymentId
                    }

                    copy

                    mono
                  />


                  <DataItem
                    label="Transaction ID"

                    value={
                      payment.transactionId
                    }

                    copy

                    mono
                  />
                </div>
              </section>
            </div>


            <div
              className="grid grid-cols-1 gap-4 lg:grid-cols-3"
            >
              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <BadgePercent
                    className="h-4 w-4"
                  />

                  Coupon
                </div>


                <div
                  className="space-y-2"
                >
                  <DataItem
                    label="Applied"

                    value={
                      yesNo(
                        coupon.applied
                      )
                    }
                  />


                  <DataItem
                    label="Code"

                    value={
                      coupon.code
                    }

                    copy
                  />


                  <DataItem
                    label="Original Amount"

                    value={
                      money(
                        coupon.originalAmount,
                        orderCurrency
                      )
                    }
                  />


                  <DataItem
                    label="Discount"

                    value={
                      money(
                        coupon.discountAmount,
                        orderCurrency
                      )
                    }
                  />


                  <DataItem
                    label="Final Amount"

                    value={
                      money(
                        coupon.finalAmount,
                        orderCurrency
                      )
                    }
                  />
                </div>
              </section>


              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <RotateCcw
                    className="h-4 w-4"
                  />

                  Refund
                </div>


                <div
                  className="space-y-2"
                >
                  <DataItem
                    label="Status"
                  >
                    <StatusBadge
                      status={
                        refund.status ||
                        "NOT_REQUESTED"
                      }
                    />
                  </DataItem>


                  <DataItem
                    label="Requested"

                    value={
                      money(
                        refund.requestedAmount,
                        orderCurrency
                      )
                    }
                  />


                  <DataItem
                    label="Refunded"

                    value={
                      money(
                        refund.refundedAmount,
                        orderCurrency
                      )
                    }
                  />


                  <DataItem
                    label="Remaining"

                    value={
                      money(
                        refund.remainingAmount,
                        orderCurrency
                      )
                    }
                  />
                </div>
              </section>


              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <ShieldCheck
                    className="h-4 w-4"
                  />

                  Verification
                </div>


                <div
                  className="space-y-2"
                >
                  <DataItem
                    label="Callback Hash"

                    value={
                      yesNo(
                        verification.callbackHashVerified
                      )
                    }
                  />


                  <DataItem
                    label="PayU Verified"

                    value={
                      yesNo(
                        verification.payuVerified
                      )
                    }
                  />


                  <DataItem
                    label="Amount Verified"

                    value={
                      yesNo(
                        verification.amountVerified
                      )
                    }
                  />


                  <DataItem
                    label="Verified At"

                    value={
                      formatDate(
                        verification.verifiedAt
                      )
                    }
                  />
                </div>
              </section>
            </div>


            <div
              className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            >
              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <Mail
                    className="h-4 w-4"
                  />

                  Reminder Email
                </div>


                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <DataItem
                    label="Sent Count"

                    value={
                      Number(
                        reminder.sentCount ||
                        0
                      )
                    }
                  />


                  <DataItem
                    label="Last Status"

                    value={
                      reminder.lastStatus ||
                      "NOT_SENT"
                    }
                  />


                  <DataItem
                    label="First Sent"

                    value={
                      formatDate(
                        reminder.firstSentAt
                      )
                    }
                  />


                  <DataItem
                    label="Last Sent"

                    value={
                      formatDate(
                        reminder.lastSentAt
                      )
                    }
                  />
                </div>
              </section>


              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <Globe2
                    className="h-4 w-4"
                  />

                  Request Metadata
                </div>


                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <DataItem
                    label="IP Address"

                    value={
                      metadata.ipAddress
                    }

                    copy

                    mono
                  />


                  <DataItem
                    label="Referrer"

                    value={
                      metadata.referrer
                    }
                  />


                  <DataItem
                    label="UTM Source"

                    value={
                      metadata.utmSource
                    }
                  />


                  <DataItem
                    label="UTM Medium"

                    value={
                      metadata.utmMedium
                    }
                  />


                  <DataItem
                    label="UTM Campaign"

                    value={
                      metadata.utmCampaign
                    }
                  />
                </div>
              </section>
            </div>


            <div
              className="grid grid-cols-1 gap-3 lg:grid-cols-2"
            >
              <JsonAccordion
                label="PayU Callback Response"

                value={
                  payment.callbackResponse
                }
              />


              <JsonAccordion
                label="PayU Verification Response"

                value={
                  payment.verificationResponse
                }
              />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}


/* =========================================================
   MODAL
========================================================= */

function Modal({
  children,

  maxWidth =
    "max-w-lg",
}) {
  return (
    <div
      className="tt-modal-backdrop"
    >
      <div
        className={`tt-modal ${maxWidth}`}
      >
        {children}
      </div>
    </div>
  );
}


/* =========================================================
   MODAL HEADER
========================================================= */

function ModalHeader({
  icon: Icon,

  title,

  subtitle,

  onClose,

  tone =
    "blue",
}) {
  return (
    <div
      className="tt-modal-header"
    >
      <div
        className="flex items-start gap-3"
      >
        <div
          className={`tt-modal-icon tt-modal-icon-${tone}`}
        >
          <Icon
            className="h-5 w-5"
          />
        </div>


        <div>
          <h2
            className="text-xl font-black"
          >
            {title}
          </h2>


          {subtitle ? (
            <p
              className="tt-helper mt-1"
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>


      <button
        type="button"

        onClick={
          onClose
        }

        className="tt-icon-button"
      >
        <X
          className="h-4 w-4"
        />
      </button>
    </div>
  );
}


/* =========================================================
   BUSINESS BREAKDOWN
========================================================= */

function BreakdownPanel({
  breakdown,

  currency,
}) {
  const [
    open,
    setOpen,
  ] =
    useState(
      false
    );


  const groups = [
    {
      title:
        "Payment Status",

      items:
        breakdown.paymentStatus ||
        [],

      label:
        (
          item
        ) =>
          item.status ||
          "Unknown",

      value:
        (
          item
        ) =>
          `${item.count || 0} • ${money(
            item.amount ||
              0,
            currency
          )}`,
    },

    {
      title:
        "Order Status",

      items:
        breakdown.orderStatus ||
        [],

      label:
        (
          item
        ) =>
          item.status ||
          "Unknown",

      value:
        (
          item
        ) =>
          `${item.count || 0} orders`,
    },

    {
      title:
        "Coupons",

      items:
        breakdown.coupons ||
        [],

      label:
        (
          item
        ) =>
          item.code ||
          "No code",

      value:
        (
          item
        ) =>
          `${item.uses || 0} uses • ${money(
            item.totalDiscountAmount ||
              0,
            currency
          )}`,
    },

    {
      title:
        "Affiliates",

      items:
        breakdown.affiliates ||
        [],

      label:
        (
          item
        ) =>
          item.affiliateCode ||
          "Direct / none",

      value:
        (
          item
        ) =>
          `${item.orders || 0} orders • ${money(
            item.amount ||
              0,
            currency
          )}`,
    },
  ];


  return (
    <section
      className="tt-card overflow-hidden"
    >
      <button
        type="button"

        onClick={() =>
          setOpen(
            (
              current
            ) =>
              !current
          )
        }

        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
      >
        <div
          className="flex items-center gap-3"
        >
          <div
            className="tt-summary-icon tt-summary-blue"
          >
            <Activity
              className="h-5 w-5"
            />
          </div>


          <div>
            <h2
              className="font-black"
            >
              Business Breakdown
            </h2>


            <p
              className="tt-helper mt-0.5"
            >
              Payment, order, coupon and affiliate distribution
            </p>
          </div>
        </div>


        {open ? (
          <ChevronUp
            className="h-5 w-5 tt-muted"
          />
        ) : (
          <ChevronDown
            className="h-5 w-5 tt-muted"
          />
        )}
      </button>


      {open ? (
        <div
          className="grid grid-cols-1 gap-4 border-t p-5 sm:p-6 lg:grid-cols-2 xl:grid-cols-4"

          style={{
            borderColor:
              "var(--tt-border)",
          }}
        >
          {groups.map(
            (
              group
            ) => (
              <div
                key={
                  group.title
                }

                className="tt-soft-card p-4"
              >
                <p
                  className="font-black"
                >
                  {group.title}
                </p>


                <div
                  className="mt-3 space-y-2"
                >
                  {group.items.length ? (
                    group.items.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={`${group.title}-${index}`}

                          className="tt-breakdown-row"
                        >
                          <span
                            className="truncate font-bold"
                          >
                            {group.label(
                              item
                            )}
                          </span>


                          <span
                            className="tt-subtle shrink-0 text-[10px] font-extrabold"
                          >
                            {group.value(
                              item
                            )}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p
                      className="tt-helper"
                    >
                      No data
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      ) : null}
    </section>
  );
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminBookPayments() {
  const navigate =
    useNavigate();


  const {
    bookId,
  } =
    useParams();


  const token =
    useSelector(
      (
        state
      ) =>
        state.auth.token
    );


  /* =======================================================
     THEME
  ======================================================= */

  const [
    isDark,
    setIsDark,
  ] =
    useState(
      () =>
        getIsDarkTheme()
    );


  /* =======================================================
     DATA
  ======================================================= */

  const [
    book,
    setBook,
  ] =
    useState(
      null
    );


  const [
    summary,
    setSummary,
  ] =
    useState(
      EMPTY_SUMMARY
    );


  const [
    breakdown,
    setBreakdown,
  ] =
    useState({
      paymentStatus: [],

      orderStatus: [],

      refundStatus: [],

      coupons: [],

      affiliates: [],
    });


  const [
    payments,
    setPayments,
  ] =
    useState(
      []
    );


  /*
   * Used when status filter/search
   * needs records from every page.
   */
  const [
    allPayments,
    setAllPayments,
  ] =
    useState(
      []
    );


  const [
    allPaymentsLoaded,
    setAllPaymentsLoaded,
  ] =
    useState(
      false
    );


  const [
    loadingAllPayments,
    setLoadingAllPayments,
  ] =
    useState(
      false
    );


  const [
    pagination,
    setPagination,
  ] =
    useState({
      enabled: true,

      page: 1,

      limit: 10,

      totalItems: 0,

      totalPages: 1,

      returnedItems: 0,

      hasNextPage: false,

      hasPreviousPage: false,
    });


  const [
    page,
    setPage,
  ] =
    useState(
      1
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState(
      "ALL"
    );


  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState(
      ""
    );


  const [
    menuOrderId,
    setMenuOrderId,
  ] =
    useState(
      null
    );


  const [
    nowMs,
    setNowMs,
  ] =
    useState(
      Date.now()
    );


  /* =======================================================
     REMINDER MAIL
  ======================================================= */

  const [
    pendingOrder,
    setPendingOrder,
  ] =
    useState(
      null
    );


  const [
    couponCode,
    setCouponCode,
  ] =
    useState(
      ""
    );


  const [
    couponDescription,
    setCouponDescription,
  ] =
    useState(
      ""
    );


  const [
    sendingMail,
    setSendingMail,
  ] =
    useState(
      false
    );


  /* =======================================================
     ACCESS
  ======================================================= */

  const [
    sendingAccessOrderId,
    setSendingAccessOrderId,
  ] =
    useState(
      null
    );


  const [
    extendOrder,
    setExtendOrder,
  ] =
    useState(
      null
    );


  const [
    extendHours,
    setExtendHours,
  ] =
    useState(
      "24"
    );


  const [
    extendingAccessOrderId,
    setExtendingAccessOrderId,
  ] =
    useState(
      null
    );


  const [
    revokeOrder,
    setRevokeOrder,
  ] =
    useState(
      null
    );


  const [
    revokingAccessOrderId,
    setRevokingAccessOrderId,
  ] =
    useState(
      null
    );


  /* =======================================================
     REVIEW
  ======================================================= */

  const [
    generatingReviewOrderId,
    setGeneratingReviewOrderId,
  ] =
    useState(
      null
    );


  const [
    sendingReviewMailOrderId,
    setSendingReviewMailOrderId,
  ] =
    useState(
      null
    );


  const [
    reviewLinkModal,
    setReviewLinkModal,
  ] =
    useState(
      null
    );


  /* =======================================================
     DELETE
  ======================================================= */

  const [
    deleteOrder,
    setDeleteOrder,
  ] =
    useState(
      null
    );


  const [
    deletingPayment,
    setDeletingPayment,
  ] =
    useState(
      false
    );


  /* =======================================================
     NAVBAR THEME SYNC
  ======================================================= */

  useEffect(
    () => {
      const syncTheme =
        (
          event
        ) => {
          const detail =
            event?.detail;


          const eventTheme =
            typeof detail ===
              "string"
              ? detail
              : detail?.theme;


          if (
            eventTheme ===
            "dark"
          ) {
            setIsDark(
              true
            );

            return;
          }


          if (
            eventTheme ===
            "light"
          ) {
            setIsDark(
              false
            );

            return;
          }


          setIsDark(
            getIsDarkTheme()
          );
        };


      syncTheme();


      /*
       * Same-tab navbar change.
       */
      window.addEventListener(
        THEME_EVENT,
        syncTheme
      );


      /*
       * Other tabs.
       */
      window.addEventListener(
        "storage",
        syncTheme
      );


      /*
       * Also monitor html class/data-theme.
       */
      const observer =
        new MutationObserver(
          syncTheme
        );


      observer.observe(
        document.documentElement,
        {
          attributes:
            true,

          attributeFilter: [
            "class",
            "data-theme",
          ],
        }
      );


      return () => {
        window.removeEventListener(
          THEME_EVENT,
          syncTheme
        );


        window.removeEventListener(
          "storage",
          syncTheme
        );


        observer.disconnect();
      };
    },
    []
  );


  /* =======================================================
     ACCESS TIMER
  ======================================================= */

  useEffect(
    () => {
      const timer =
        window.setInterval(
          () => {
            setNowMs(
              Date.now()
            );
          },
          30000
        );


      return () =>
        window.clearInterval(
          timer
        );
    },
    []
  );


  /* =======================================================
     FETCH CURRENT PAGE
  ======================================================= */

  const fetchPayments =
    useCallback(
      async (
        requestedPage =
          page,

        signal =
          undefined
      ) => {
        try {
          if (
            !bookId ||
            !token
          ) {
            return;
          }


          setLoading(
            true
          );


          setError(
            ""
          );


          const response =
            await fetch(
              `${BASE_URL}/admin/books/${encodeURIComponent(
                bookId
              )}/payments/page/${requestedPage}`,
              {
                method:
                  "GET",

                headers: {
                  Accept:
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                signal,
              }
            );


          const result =
            await readResponse(
              response
            );


          if (
            !response.ok ||

            result?.success !==
              true
          ) {
            throw new Error(
              result?.message ||

              "Unable to load payment details."
            );
          }


          const data =
            result?.data ||
            {};


          const rawSummary =
            data.summary ||
            {};


          setBook(
            data.book ||
            null
          );


          setSummary({
            ...EMPTY_SUMMARY,

            ...rawSummary,

            payments: {
              ...EMPTY_SUMMARY.payments,

              ...(
                rawSummary.payments ||
                {}
              ),
            },

            refunds: {
              ...EMPTY_SUMMARY.refunds,

              ...(
                rawSummary.refunds ||
                {}
              ),
            },

            coupons: {
              ...EMPTY_SUMMARY.coupons,

              ...(
                rawSummary.coupons ||
                {}
              ),
            },

            reminderMails: {
              ...EMPTY_SUMMARY.reminderMails,

              ...(
                rawSummary.reminderMails ||
                {}
              ),
            },

            access: {
              ...EMPTY_SUMMARY.access,

              ...(
                rawSummary.access ||
                {}
              ),
            },

            verification: {
              ...EMPTY_SUMMARY.verification,

              ...(
                rawSummary.verification ||
                {}
              ),
            },

            affiliates: {
              ...EMPTY_SUMMARY.affiliates,

              ...(
                rawSummary.affiliates ||
                {}
              ),
            },
          });


          setBreakdown({
            paymentStatus:
              data?.breakdown
                ?.paymentStatus ||
              [],

            orderStatus:
              data?.breakdown
                ?.orderStatus ||
              [],

            refundStatus:
              data?.breakdown
                ?.refundStatus ||
              [],

            coupons:
              data?.breakdown
                ?.coupons ||
              [],

            affiliates:
              data?.breakdown
                ?.affiliates ||
              [],
          });


          setPayments(
            Array.isArray(
              data.payments
            )
              ? data.payments
              : []
          );


          setPagination({
            enabled: true,

            page:
              requestedPage,

            limit: 10,

            totalItems: 0,

            totalPages: 1,

            returnedItems: 0,

            hasNextPage: false,

            hasPreviousPage: false,

            ...(
              data.pagination ||
              {}
            ),
          });


          /*
           * Invalidate all-page cache because
           * database could have changed.
           */
          setAllPayments(
            []
          );


          setAllPaymentsLoaded(
            false
          );

        } catch (
          error
        ) {
          if (
            error?.name ===
            "AbortError"
          ) {
            return;
          }


          console.error(
            "Fetch payments error:",
            error
          );


          setError(
            error?.message ||

            "Unable to load payments."
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
      [
        bookId,
        token,
        page,
      ]
    );


  /* =======================================================
     FETCH ALL PAGES FOR FILTER / SEARCH
  ======================================================= */

  const fetchAllPayments =
    useCallback(
      async () => {
        if (
          !bookId ||
          !token ||
          allPaymentsLoaded ||
          loadingAllPayments
        ) {
          return;
        }


        try {
          setLoadingAllPayments(
            true
          );


          const totalPages =
            Math.max(
              Number(
                pagination.totalPages
              ) ||
                1,

              1
            );


          /*
           * If one page only,
           * no extra requests.
           */
          if (
            totalPages ===
            1
          ) {
            setAllPayments(
              payments
            );


            setAllPaymentsLoaded(
              true
            );


            return;
          }


          const pageNumbers =
            Array.from(
              {
                length:
                  totalPages,
              },
              (
                _,
                index
              ) =>
                index +
                1
            );


          const responses =
            await Promise.all(
              pageNumbers.map(
                (
                  currentPage
                ) =>
                  fetch(
                    `${BASE_URL}/admin/books/${encodeURIComponent(
                      bookId
                    )}/payments/page/${currentPage}`,
                    {
                      method:
                        "GET",

                      headers: {
                        Accept:
                          "application/json",

                        Authorization:
                          `Bearer ${token}`,
                      },
                    }
                  )
              )
            );


          const results =
            await Promise.all(
              responses.map(
                async (
                  response
                ) => {
                  const result =
                    await readResponse(
                      response
                    );


                  if (
                    !response.ok ||

                    result?.success !==
                      true
                  ) {
                    throw new Error(
                      result?.message ||

                      "Unable to load all payment records."
                    );
                  }


                  return result;
                }
              )
            );


          const combined =
            results.flatMap(
              (
                result
              ) => {
                const list =
                  result?.data
                    ?.payments;


                return Array.isArray(
                  list
                )
                  ? list
                  : [];
              }
            );


          /*
           * Remove duplicates.
           */
          const map =
            new Map();


          combined.forEach(
            (
              order
            ) => {
              const key =
                order?._id ||

                order?.orderId;


              if (
                key
              ) {
                map.set(
                  key,
                  order
                );
              }
            }
          );


          setAllPayments(
            Array.from(
              map.values()
            )
          );


          setAllPaymentsLoaded(
            true
          );

        } catch (
          error
        ) {
          console.error(
            "Fetch all payments error:",
            error
          );


          toast.error(
            error?.message ||

            "Unable to load all payments for filtering."
          );

        } finally {
          setLoadingAllPayments(
            false
          );
        }
      },
      [
        bookId,
        token,
        pagination.totalPages,
        payments,
        allPaymentsLoaded,
        loadingAllPayments,
      ]
    );


  /* =======================================================
     LOAD CURRENT PAGE
  ======================================================= */

  useEffect(
    () => {
      const controller =
        new AbortController();


      fetchPayments(
        page,
        controller.signal
      );


      return () =>
        controller.abort();
    },
    [
      page,
      fetchPayments,
    ]
  );


  /* =======================================================
     GLOBAL FILTER MODE

     ALL:
     use current backend page.

     Success/Pending/Failed/Search:
     load all backend pages.
  ======================================================= */

  const isGlobalFilterMode =
    statusFilter !==
      "ALL" ||

    Boolean(
      searchQuery.trim()
    );


  useEffect(
    () => {
      if (
        !isGlobalFilterMode ||

        loading ||

        allPaymentsLoaded ||

        loadingAllPayments
      ) {
        return;
      }


      fetchAllPayments();
    },
    [
      isGlobalFilterMode,
      loading,
      allPaymentsLoaded,
      loadingAllPayments,
      fetchAllPayments,
    ]
  );


  /* =======================================================
     CLOSE MENU
  ======================================================= */

  useEffect(
    () => {
      const closeMenu =
        () =>
          setMenuOrderId(
            null
          );


      document.addEventListener(
        "click",
        closeMenu
      );


      return () =>
        document.removeEventListener(
          "click",
          closeMenu
        );
    },
    []
  );


  useEffect(
    () => {
      setMenuOrderId(
        null
      );
    },
    [
      statusFilter,
      searchQuery,
    ]
  );


  /* =======================================================
     FILTER COUNTS
  ======================================================= */

  const filterCounts =
    useMemo(
      () => ({
        ALL:
          summary.totalOrders ||

          pagination.totalItems ||

          0,

        SUCCESS:
          summary.payments
            .successfulPayments ||
          0,

        PENDING:
          summary.payments
            .pendingPayments ||
          0,

        FAILED:
          summary.payments
            .failedPayments ||
          0,
      }),
      [
        summary,
        pagination.totalItems,
      ]
    );


  /* =======================================================
     VISIBLE PAYMENTS
  ======================================================= */

  const visiblePayments =
    useMemo(
      () => {
        const normalizedSearch =
          searchQuery
            .trim()
            .toLowerCase();


        /*
         * IMPORTANT:
         *
         * Status filters/search use ALL pages.
         * ALL view keeps backend pagination.
         */
        const source =
          isGlobalFilterMode
            ? allPayments
            : payments;


        return source.filter(
          (
            order
          ) => {
            if (
              !matchesStatusFilter(
                order,
                statusFilter
              )
            ) {
              return false;
            }


            if (
              !normalizedSearch
            ) {
              return true;
            }


            const searchable =
              [
                order?._id,

                order?.orderId,

                order?.customer
                  ?.name,

                order?.customer
                  ?.email,

                order?.customer
                  ?.phone,

                order?.book
                  ?.title,

                order?.payment
                  ?.transactionId,

                order?.payment
                  ?.paymentId,

                order?.payment
                  ?.provider,

                order?.payment
                  ?.affiliateCode,

                order?.payment
                  ?.method,

                order?.payment
                  ?.status,

                order?.orderStatus,

                order?.coupon
                  ?.code,
              ]
                .filter(
                  Boolean
                )
                .join(
                  " "
                )
                .toLowerCase();


            return searchable.includes(
              normalizedSearch
            );
          }
        );
      },
      [
        payments,
        allPayments,
        isGlobalFilterMode,
        statusFilter,
        searchQuery,
      ]
    );


  /* =======================================================
     OPEN PENDING MODAL
  ======================================================= */

  const openPendingModal =
    (
      order
    ) => {
      setMenuOrderId(
        null
      );


      setPendingOrder(
        order
      );


      setCouponCode(
        ""
      );


      setCouponDescription(
        ""
      );
    };


  /* =======================================================
     SEND PENDING / FAILED REMINDER
  ======================================================= */

  const handleSendPendingMail =
    async () => {
      if (
        !pendingOrder?._id
      ) {
        return;
      }


      const code =
        couponCode.trim();


      const description =
        couponDescription.trim();


      if (
        Boolean(
          code
        ) !==
        Boolean(
          description
        )
      ) {
        toast.error(
          "Enter both coupon code and coupon description, or leave both empty."
        );

        return;
      }


      const toastId =
        toast.loading(
          "Sending purchase reminder..."
        );


      try {
        setSendingMail(
          true
        );


        const response =
          await fetch(
            `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
              pendingOrder._id
            )}/send-pending-mail`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  code
                    ? {
                        couponCode:
                          code,

                        couponDescription:
                          description,
                      }
                    : {}
                ),
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to send purchase reminder."
          );
        }


        toast.success(
          result?.message ||

          "Purchase reminder sent successfully.",
          {
            id:
              toastId,
          }
        );


        setPendingOrder(
          null
        );


        setCouponCode(
          ""
        );


        setCouponDescription(
          ""
        );


        await fetchPayments(
          page
        );

      } catch (
        error
      ) {
        console.error(
          "Send reminder error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to send purchase reminder.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setSendingMail(
          false
        );
      }
    };


  /* =======================================================
     SEND BOOK ACCESS
  ======================================================= */

  const handleSendAccessMail =
    async (
      order
    ) => {
      if (
        !order?._id
      ) {
        toast.error(
          "Order ID is missing."
        );

        return;
      }


      if (
        getOrderBucket(
          order
        ) !==
          "SUCCESS" ||

        normalizeStatus(
          order.orderStatus
        ) !==
          "PAID"
      ) {
        toast.error(
          "Book access can only be sent for a successful paid order."
        );

        return;
      }


      if (
        order.access?.revoked ===
        true
      ) {
        toast.error(
          "Reactivate this access before sending the access email."
        );

        return;
      }


      setMenuOrderId(
        null
      );


      const toastId =
        toast.loading(
          `Sending book access to ${
            order.customer?.email ||
            "customer"
          }...`
        );


      try {
        setSendingAccessOrderId(
          order._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
              order._id
            )}/resend-book-access`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to send book access email."
          );
        }


        toast.success(
          result?.message ||

          "Book access email sent successfully.",
          {
            id:
              toastId,
          }
        );


        await fetchPayments(
          page
        );

      } catch (
        error
      ) {
        console.error(
          "Book access error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to send book access email.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setSendingAccessOrderId(
          null
        );
      }
    };


  /* =======================================================
     OPEN EXTEND
  ======================================================= */

  const openExtendAccess =
    (
      order
    ) => {
      setMenuOrderId(
        null
      );


      setExtendOrder(
        order
      );


      setExtendHours(
        "24"
      );
    };


  /* =======================================================
     EXTEND / REACTIVATE ACCESS
  ======================================================= */

  const handleExtendAccess =
    async () => {
      if (
        !extendOrder?._id
      ) {
        return;
      }


      const hours =
        Number(
          extendHours
        );


      if (
        !Number.isInteger(
          hours
        ) ||

        hours <=
        0
      ) {
        toast.error(
          "Hours must be a positive whole number."
        );

        return;
      }


      const wasRevoked =
        extendOrder.access
          ?.revoked ===
        true;


      const toastId =
        toast.loading(
          wasRevoked
            ? "Reactivating access..."
            : "Extending access..."
        );


      try {
        setExtendingAccessOrderId(
          extendOrder._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
              extendOrder._id
            )}/access/extend`,
            {
              method:
                "PATCH",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  hours,
                }),
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to update book access."
          );
        }


        toast.success(
          result?.message ||

          (
            wasRevoked
              ? "Book access reactivated successfully."
              : "Book access extended successfully."
          ),
          {
            id:
              toastId,
          }
        );


        setExtendOrder(
          null
        );


        setExtendHours(
          "24"
        );


        await fetchPayments(
          page
        );

      } catch (
        error
      ) {
        console.error(
          "Extend access error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to update book access.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setExtendingAccessOrderId(
          null
        );
      }
    };


  /* =======================================================
     REVOKE ACCESS
  ======================================================= */

  const handleRevokeAccess =
    async () => {
      if (
        !revokeOrder?._id
      ) {
        return;
      }


      const toastId =
        toast.loading(
          "Revoking book access..."
        );


      try {
        setRevokingAccessOrderId(
          revokeOrder._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
              revokeOrder._id
            )}/access/revoke`,
            {
              method:
                "PATCH",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to revoke book access."
          );
        }


        toast.success(
          result?.message ||

          "Book access revoked successfully.",
          {
            id:
              toastId,
          }
        );


        setRevokeOrder(
          null
        );


        await fetchPayments(
          page
        );

      } catch (
        error
      ) {
        console.error(
          "Revoke access error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to revoke book access.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setRevokingAccessOrderId(
          null
        );
      }
    };


  /* =======================================================
     GENERATE REVIEW LINK
  ======================================================= */

  const handleGenerateReviewLink =
    async (
      order
    ) => {
      if (
        !order?._id
      ) {
        return;
      }


      setMenuOrderId(
        null
      );


      const toastId =
        toast.loading(
          "Generating review link..."
        );


      try {
        setGeneratingReviewOrderId(
          order._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/book/review/admin/order/${encodeURIComponent(
              order._id
            )}/link`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to generate review link."
          );
        }


        const reviewUrl =
          result?.data
            ?.reviewUrl;


        if (
          !reviewUrl
        ) {
          throw new Error(
            "Review URL was not returned by the server."
          );
        }


        setReviewLinkModal({
          reviewUrl,

          alreadyGenerated:
            Boolean(
              result?.data
                ?.alreadyGenerated
            ),

          customerName:
            order.customer
              ?.name ||
            "Customer",

          customerEmail:
            order.customer
              ?.email ||
            "",

          orderId:
            order.orderId ||
            order._id,

          bookTitle:
            order.book
              ?.title ||

            book?.title ||

            "Book",
        });


        toast.success(
          result?.message ||

          "Review link generated successfully.",
          {
            id:
              toastId,
          }
        );

      } catch (
        error
      ) {
        console.error(
          "Review link error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to generate review link.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setGeneratingReviewOrderId(
          null
        );
      }
    };


  /* =======================================================
     SEND REVIEW MAIL
  ======================================================= */

  const handleSendReviewMail =
    async (
      order
    ) => {
      if (
        !order?._id
      ) {
        return;
      }


      setMenuOrderId(
        null
      );


      const toastId =
        toast.loading(
          "Sending review email..."
        );


      try {
        setSendingReviewMailOrderId(
          order._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/book/review/admin/order/${encodeURIComponent(
              order._id
            )}/send-mail`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to send review email."
          );
        }


        toast.success(
          result?.message ||

          "Review email sent successfully.",
          {
            id:
              toastId,
          }
        );

      } catch (
        error
      ) {
        console.error(
          "Review email error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to send review email.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setSendingReviewMailOrderId(
          null
        );
      }
    };


  /* =======================================================
     DELETE PAYMENT
  ======================================================= */

  const handleDeletePayment =
    async () => {
      if (
        !deleteOrder?._id
      ) {
        return;
      }


      const toastId =
        toast.loading(
          "Deleting payment record..."
        );


      try {
        setDeletingPayment(
          true
        );


        const response =
          await fetch(
            `${BASE_URL}/admin/books/${encodeURIComponent(
              bookId
            )}/payments/${encodeURIComponent(
              deleteOrder._id
            )}`,
            {
              method:
                "DELETE",

              headers: {
                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to delete payment."
          );
        }


        toast.success(
          result?.message ||

          "Payment deleted successfully.",
          {
            id:
              toastId,
          }
        );


        setDeleteOrder(
          null
        );


        if (
          payments.length ===
            1 &&

          page >
            1
        ) {
          setPage(
            (
              current
            ) =>
              current -
              1
          );
        } else {
          await fetchPayments(
            page
          );
        }

      } catch (
        error
      ) {
        console.error(
          "Delete payment error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to delete payment.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setDeletingPayment(
          false
        );
      }
    };


  /* =======================================================
     PAGINATION
  ======================================================= */

  const goToPage =
    (
      nextPage
    ) => {
      const totalPages =
        Math.max(
          Number(
            pagination.totalPages
          ) ||
            1,

          1
        );


      if (
        nextPage <
          1 ||

        nextPage >
          totalPages ||

        nextPage ===
          page ||

        loading
      ) {
        return;
      }


      setPage(
        nextPage
      );


      setMenuOrderId(
        null
      );


      window.scrollTo({
        top:
          0,

        behavior:
          "smooth",
      });
    };


  const currency =
    book?.currency ||
    "INR";


  return (
    <div
      className="tt-payments"

      data-theme={
        isDark
          ? "dark"
          : "light"
      }
    >
      <Helmet>
        <title>
          {book?.title
            ? `${book.title} Payments | Target Trek Admin`
            : "Book Payments | Target Trek Admin"}
        </title>


        <meta
          name="robots"
          content="noindex, nofollow, noarchive, nosnippet"
        />


        <meta
          name="googlebot"
          content="noindex, nofollow, noarchive, nosnippet"
        />


        <meta
          name="theme-color"
          content={
            isDark
              ? "#020617"
              : "#f8fafc"
          }
        />
      </Helmet>


      <style>{`

        .tt-payments {
          color-scheme: light;

          --tt-bg: #f8fafc;
          --tt-surface: #ffffff;
          --tt-surface-soft: #f8fafc;
          --tt-surface-muted: #f1f5f9;

          --tt-text: #0f172a;
          --tt-text-secondary: #334155;

          --tt-muted: #64748b;
          --tt-subtle: #94a3b8;

          --tt-border: #e2e8f0;
          --tt-border-soft: #f1f5f9;

          --tt-primary: #2563eb;
          --tt-primary-hover: #1d4ed8;
          --tt-primary-soft: #eff6ff;

          --tt-success: #059669;
          --tt-success-soft: #ecfdf5;
          --tt-success-border: #a7f3d0;

          --tt-warning: #d97706;
          --tt-warning-soft: #fffbeb;
          --tt-warning-border: #fde68a;

          --tt-danger: #dc2626;
          --tt-danger-soft: #fef2f2;
          --tt-danger-border: #fecaca;

          --tt-violet: #7c3aed;
          --tt-violet-soft: #f5f3ff;

          --tt-overlay:
            rgba(2, 6, 23, 0.68);

          --tt-shadow:
            0 1px 2px rgba(15, 23, 42, 0.04),
            0 8px 24px rgba(15, 23, 42, 0.05);
        }


        .tt-payments[data-theme="dark"] {
          color-scheme: dark;

          --tt-bg: #020617;
          --tt-surface: #0f172a;
          --tt-surface-soft: #111827;
          --tt-surface-muted: #1e293b;

          --tt-text: #f8fafc;
          --tt-text-secondary: #e2e8f0;

          --tt-muted: #94a3b8;
          --tt-subtle: #64748b;

          --tt-border: #1e293b;
          --tt-border-soft: #172033;

          --tt-primary: #60a5fa;
          --tt-primary-hover: #93c5fd;
          --tt-primary-soft:
            rgba(37, 99, 235, 0.15);

          --tt-success: #34d399;
          --tt-success-soft:
            rgba(5, 150, 105, 0.15);
          --tt-success-border:
            rgba(52, 211, 153, 0.3);

          --tt-warning: #fbbf24;
          --tt-warning-soft:
            rgba(217, 119, 6, 0.15);
          --tt-warning-border:
            rgba(251, 191, 36, 0.3);

          --tt-danger: #f87171;
          --tt-danger-soft:
            rgba(220, 38, 38, 0.15);
          --tt-danger-border:
            rgba(248, 113, 113, 0.3);

          --tt-violet: #a78bfa;
          --tt-violet-soft:
            rgba(124, 58, 237, 0.15);

          --tt-overlay:
            rgba(0, 0, 0, 0.76);

          --tt-shadow:
            0 15px 45px rgba(0, 0, 0, 0.28);
        }


        .tt-page {
          min-height: 100vh;
          background: var(--tt-bg);
          color: var(--tt-text);

          transition:
            background-color 180ms ease,
            color 180ms ease;
        }


        .tt-card {
          border:
            1px solid
            var(--tt-border);

          border-radius: 1.5rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text);

          box-shadow:
            var(--tt-shadow);
        }


        .tt-soft-card {
          border:
            1px solid
            var(--tt-border);

          border-radius:
            1rem;

          background:
            var(--tt-surface-soft);

          color:
            var(--tt-text);
        }


        .tt-muted {
          color:
            var(--tt-muted);
        }


        .tt-subtle {
          color:
            var(--tt-subtle);
        }


        .tt-helper {
          color:
            var(--tt-muted);

          font-size:
            0.75rem;

          line-height:
            1.35rem;

          font-weight:
            500;
        }


        .tt-label {
          color:
            var(--tt-subtle);

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            0.1em;

          text-transform:
            uppercase;
        }


        .tt-summary-value {
          margin-top:
            0.4rem;

          color:
            var(--tt-text);

          font-size:
            1.25rem;

          font-weight:
            900;

          word-break:
            break-word;
        }


        .tt-summary-icon {
          display:
            flex;

          width:
            2.5rem;

          height:
            2.5rem;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            0.8rem;
        }


        .tt-summary-blue {
          color:
            var(--tt-primary);

          background:
            var(--tt-primary-soft);
        }


        .tt-summary-emerald {
          color:
            var(--tt-success);

          background:
            var(--tt-success-soft);
        }


        .tt-summary-amber {
          color:
            var(--tt-warning);

          background:
            var(--tt-warning-soft);
        }


        .tt-summary-red {
          color:
            var(--tt-danger);

          background:
            var(--tt-danger-soft);
        }


        .tt-summary-violet {
          color:
            var(--tt-violet);

          background:
            var(--tt-violet-soft);
        }


        .tt-summary-slate {
          color:
            var(--tt-text-secondary);

          background:
            var(--tt-surface-muted);
        }


        .tt-hero {
          border:
            1px solid
            var(--tt-border);

          border-radius:
            1.6rem;

          background:
            linear-gradient(
              135deg,
              var(--tt-primary-soft),
              var(--tt-surface) 50%,
              var(--tt-violet-soft)
            );

          box-shadow:
            var(--tt-shadow);
        }


        .tt-btn {
          display:
            inline-flex;

          min-height:
            40px;

          align-items:
            center;

          justify-content:
            center;

          gap:
            0.5rem;

          border-radius:
            0.75rem;

          padding:
            0.55rem 0.9rem;

          font-size:
            0.8rem;

          font-weight:
            800;

          transition:
            all 150ms ease;
        }


        .tt-btn:disabled {
          cursor:
            not-allowed;

          opacity:
            0.48;
        }


        .tt-btn-secondary {
          border:
            1px solid
            var(--tt-border);

          background:
            var(--tt-surface);

          color:
            var(--tt-text-secondary);
        }


        .tt-btn-secondary:hover:not(:disabled) {
          border-color:
            var(--tt-primary);

          color:
            var(--tt-primary);
        }


        .tt-btn-primary {
          border:
            1px solid
            var(--tt-primary);

          background:
            var(--tt-primary);

          color:
            white;
        }


        .tt-btn-success {
          border:
            1px solid
            var(--tt-success);

          background:
            var(--tt-success);

          color:
            white;
        }


        .tt-btn-danger {
          border:
            1px solid
            var(--tt-danger);

          background:
            var(--tt-danger);

          color:
            white;
        }


        .tt-input,
        .tt-textarea {
          width:
            100%;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          outline:
            none;

          background:
            var(--tt-surface);

          color:
            var(--tt-text);

          font-size:
            0.875rem;

          font-weight:
            600;
        }


        .tt-input {
          height:
            44px;

          padding:
            0 0.85rem;
        }


        .tt-textarea {
          padding:
            0.85rem;

          resize:
            vertical;
        }


        .tt-input::placeholder,
        .tt-textarea::placeholder {
          color:
            var(--tt-subtle);
        }


        .tt-input:focus,
        .tt-textarea:focus {
          border-color:
            var(--tt-primary);

          box-shadow:
            0 0 0 3px
            var(--tt-primary-soft);
        }


        .tt-payment-header {
          padding:
            1.25rem;

          border-bottom:
            1px solid
            var(--tt-border-soft);

          border-radius:
            1.5rem
            1.5rem
            0
            0;

          background:
            linear-gradient(
              90deg,
              var(--tt-surface-soft),
              var(--tt-surface),
              var(--tt-primary-soft)
            );
        }


        .tt-index {
          display:
            flex;

          width:
            44px;

          height:
            44px;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            0.9rem;

          background:
            var(--tt-text);

          color:
            var(--tt-surface);

          font-size:
            0.85rem;

          font-weight:
            900;
        }


        .tt-small-stat {
          min-width:
            112px;

          padding:
            0.65rem
            0.85rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.8rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text);

          box-shadow:
            var(--tt-shadow);
        }


        .tt-status,
        .tt-access-badge {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            0.3rem;

          padding:
            0.26rem
            0.55rem;

          border-radius:
            999px;

          border:
            1px solid;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.07em;

          text-transform:
            uppercase;
        }


        .tt-status-success,
        .tt-access-active {
          color:
            var(--tt-success);

          border-color:
            var(--tt-success-border);

          background:
            var(--tt-success-soft);
        }


        .tt-status-pending,
        .tt-access-expired {
          color:
            var(--tt-warning);

          border-color:
            var(--tt-warning-border);

          background:
            var(--tt-warning-soft);
        }


        .tt-status-failed,
        .tt-access-revoked {
          color:
            var(--tt-danger);

          border-color:
            var(--tt-danger-border);

          background:
            var(--tt-danger-soft);
        }


        .tt-status-neutral,
        .tt-access-none,
        .tt-access-unknown {
          color:
            var(--tt-muted);

          border-color:
            var(--tt-border);

          background:
            var(--tt-surface-muted);
        }


        .tt-access-panel {
          padding:
            1rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            1rem;

          background:
            var(--tt-surface-soft);
        }


        .tt-access-panel-active {
          border-color:
            var(--tt-success-border);

          background:
            var(--tt-success-soft);
        }


        .tt-access-panel-expired {
          border-color:
            var(--tt-warning-border);

          background:
            var(--tt-warning-soft);
        }


        .tt-access-panel-revoked {
          border-color:
            var(--tt-danger-border);

          background:
            var(--tt-danger-soft);
        }


        .tt-access-icon {
          display:
            flex;

          width:
            40px;

          height:
            40px;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text-secondary);
        }


        .tt-access-window {
          padding:
            0.6rem
            0.8rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text);
        }


        .tt-data-item {
          min-width:
            0;

          padding:
            0.7rem
            0.8rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          background:
            var(--tt-surface);
        }


        .tt-data-value {
          color:
            var(--tt-text-secondary);

          font-size:
            0.8rem;

          line-height:
            1.2rem;

          font-weight:
            700;

          word-break:
            break-word;
        }


        .tt-copy-button {
          display:
            flex;

          width:
            28px;

          height:
            28px;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            0.5rem;

          color:
            var(--tt-subtle);
        }


        .tt-copy-button:hover {
          background:
            var(--tt-surface-muted);

          color:
            var(--tt-primary);
        }


        .tt-expand-button {
          display:
            flex;

          width:
            100%;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            1rem;

          padding:
            0.8rem
            1rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          background:
            var(--tt-surface-soft);

          color:
            var(--tt-text-secondary);

          text-align:
            left;
        }


        .tt-expand-button:hover {
          border-color:
            var(--tt-primary);
        }


        .tt-detail-section {
          padding:
            1rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            1rem;

          background:
            var(--tt-surface);
        }


        .tt-section-title {
          display:
            flex;

          align-items:
            center;

          gap:
            0.5rem;

          margin-bottom:
            0.8rem;

          color:
            var(--tt-text);

          font-size:
            0.85rem;

          font-weight:
            900;
        }


        .tt-accordion-button {
          display:
            flex;

          width:
            100%;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            1rem;

          padding:
            0.8rem
            1rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text-secondary);

          text-align:
            left;
        }


        .tt-accordion-button:hover {
          background:
            var(--tt-surface-soft);
        }


        .tt-json-container {
          padding:
            1rem;

          border-top:
            1px solid
            var(--tt-border);

          background:
            #020617;

          color:
            #e2e8f0;
        }


        .tt-action-menu {
          position:
            absolute;

          right:
            0;

          top:
            48px;

          z-index:
            80;

          width:
            290px;

          overflow:
            hidden;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            1rem;

          background:
            var(--tt-surface);

          box-shadow:
            0 24px 60px
            rgba(2, 6, 23, 0.25);
        }


        .tt-menu-heading {
          padding:
            0.65rem
            0.9rem;

          border-bottom:
            1px solid
            var(--tt-border-soft);

          color:
            var(--tt-subtle);

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.1em;

          text-transform:
            uppercase;
        }


        .tt-menu-item {
          display:
            flex;

          width:
            100%;

          align-items:
            center;

          gap:
            0.75rem;

          padding:
            0.78rem
            0.9rem;

          background:
            transparent;

          color:
            var(--tt-text-secondary);

          font-size:
            0.82rem;

          font-weight:
            800;

          text-align:
            left;
        }


        .tt-menu-item:hover:not(:disabled) {
          background:
            var(--tt-primary-soft);

          color:
            var(--tt-primary);
        }


        .tt-menu-item:disabled {
          cursor:
            not-allowed;

          opacity:
            0.4;
        }


        .tt-menu-success:hover:not(:disabled) {
          background:
            var(--tt-success-soft);

          color:
            var(--tt-success);
        }


        .tt-menu-danger {
          color:
            var(--tt-danger);
        }


        .tt-menu-danger:hover:not(:disabled) {
          background:
            var(--tt-danger-soft);

          color:
            var(--tt-danger);
        }


        .tt-menu-divider {
          margin:
            0
            0.75rem;

          border-top:
            1px solid
            var(--tt-border-soft);
        }


        .tt-breakdown-row {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            0.75rem;

          padding:
            0.55rem
            0.65rem;

          border-radius:
            0.65rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text-secondary);

          font-size:
            0.75rem;
        }


        .tt-modal-backdrop {
          position:
            fixed;

          inset:
            0;

          z-index:
            120;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            1rem;

          background:
            var(--tt-overlay);

          backdrop-filter:
            blur(6px);
        }


        .tt-modal {
          width:
            100%;

          max-height:
            92vh;

          overflow-y:
            auto;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            1.5rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text);

          box-shadow:
            0 30px 80px
            rgba(2, 6, 23, 0.35);
        }


        .tt-modal-header {
          display:
            flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap:
            1rem;

          padding:
            1.25rem;

          border-bottom:
            1px solid
            var(--tt-border-soft);
        }


        .tt-modal-icon {
          display:
            flex;

          width:
            44px;

          height:
            44px;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            0.9rem;
        }


        .tt-modal-icon-blue {
          background:
            var(--tt-primary-soft);

          color:
            var(--tt-primary);
        }


        .tt-modal-icon-emerald {
          background:
            var(--tt-success-soft);

          color:
            var(--tt-success);
        }


        .tt-modal-icon-red {
          background:
            var(--tt-danger-soft);

          color:
            var(--tt-danger);
        }


        .tt-modal-icon-violet {
          background:
            var(--tt-violet-soft);

          color:
            var(--tt-violet);
        }


        .tt-icon-button {
          display:
            flex;

          width:
            36px;

          height:
            36px;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            0.65rem;

          color:
            var(--tt-muted);
        }


        .tt-icon-button:hover {
          background:
            var(--tt-surface-muted);

          color:
            var(--tt-text);
        }


        .tt-filter-button {
          display:
            inline-flex;

          min-height:
            40px;

          align-items:
            center;

          gap:
            0.45rem;

          padding:
            0.5rem
            0.8rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-muted);

          font-size:
            0.75rem;

          font-weight:
            900;
        }


        .tt-filter-button:hover {
          border-color:
            var(--tt-primary);

          color:
            var(--tt-primary);
        }


        .tt-filter-button-active {
          border-color:
            var(--tt-text);

          background:
            var(--tt-text);

          color:
            var(--tt-surface);
        }


        .tt-filter-count {
          padding:
            0.08rem
            0.4rem;

          border-radius:
            999px;

          background:
            var(--tt-surface-muted);

          color:
            var(--tt-muted);

          font-size:
            9px;
        }


        .tt-filter-button-active
        .tt-filter-count {
          background:
            rgba(148, 163, 184, 0.2);

          color:
            inherit;
        }


        .tt-search-wrapper {
          position:
            relative;

          width:
            100%;
        }


        .tt-search-icon {
          position:
            absolute;

          left:
            0.85rem;

          top:
            50%;

          width:
            16px;

          height:
            16px;

          transform:
            translateY(-50%);

          pointer-events:
            none;

          color:
            var(--tt-subtle);
        }


        .tt-search-input {
          width:
            100%;

          height:
            44px;

          padding:
            0
            0.9rem
            0
            2.6rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          outline:
            none;

          background:
            var(--tt-surface-soft);

          color:
            var(--tt-text);

          font-size:
            0.82rem;

          font-weight:
            700;
        }


        .tt-search-input::placeholder {
          color:
            var(--tt-subtle);
        }


        .tt-search-input:focus {
          border-color:
            var(--tt-primary);

          background:
            var(--tt-surface);

          box-shadow:
            0 0 0 3px
            var(--tt-primary-soft);
        }


        @media (
          min-width: 640px
        ) {
          .tt-payment-header {
            padding:
              1.5rem;
          }


          .tt-modal-header {
            padding:
              1.5rem;
          }
        }

      `}</style>


      <main
        className="tt-page pt-24 sm:pt-28"
      >
        <div
          className="mx-auto max-w-[1560px] px-4 pb-20 sm:px-6 lg:px-8"
        >
          {/* =================================================
              TOP BAR
          ================================================= */}

          <div
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <button
              type="button"

              onClick={() =>
                navigate(
                  `/admin/book/${bookId}`
                )
              }

              className="tt-muted inline-flex items-center gap-2 text-sm font-bold"
            >
              <ArrowLeft
                className="h-4 w-4"
              />

              Back to Book Details
            </button>


            <div
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"

                onClick={() =>
                  navigate(
                    `/admin/book/${bookId}/reviews`
                  )
                }

                className="tt-btn tt-btn-primary"
              >
                <MessageSquareText
                  className="h-4 w-4"
                />

                Manage Reviews
              </button>


              <button
                type="button"

                disabled={
                  loading
                }

                onClick={() =>
                  fetchPayments(
                    page
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>


          {/* =================================================
              HERO
          ================================================= */}

          <section
            className="tt-hero mt-5 p-5 sm:p-7"
          >
            <div
              className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between"
            >
              <div
                className="flex min-w-0 items-start gap-4"
              >
                {book?.coverPageUrl ? (
                  <img
                    src={
                      book.coverPageUrl
                    }

                    alt={
                      book.title ||
                      "Book"
                    }

                    className="h-24 w-16 shrink-0 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div
                    className="tt-summary-icon tt-summary-blue h-14 w-14"
                  >
                    <ShoppingBag
                      className="h-7 w-7"
                    />
                  </div>
                )}


                <div
                  className="min-w-0"
                >
                  <p
                    className="tt-label"

                    style={{
                      color:
                        "var(--tt-primary)",
                    }}
                  >
                    Revenue & Access Control
                  </p>


                  <h1
                    className="mt-1 max-w-4xl text-2xl font-black tracking-tight sm:text-3xl"
                  >
                    {book?.title ||
                      "Book Payments"}
                  </h1>


                  <p
                    className="tt-helper mt-3 max-w-3xl text-sm"
                  >
                    Manage payments, failed orders, purchase
                    reminders, coupons, refunds, access expiry,
                    access revocation and customer review requests.
                  </p>


                  <div
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {book?.slug ? (
                      <span
                        className="tt-soft-card px-2.5 py-1 text-[10px] font-bold"
                      >
                        /{book.slug}
                      </span>
                    ) : null}


                    <span
                      className="tt-soft-card px-2.5 py-1 text-[10px] font-bold"
                    >
                      Price{" "}

                      {money(
                        book?.price,
                        currency
                      )}
                    </span>


                    <span
                      className="tt-soft-card px-2.5 py-1 text-[10px] font-bold"
                    >
                      MRP{" "}

                      {money(
                        book?.mrp,
                        currency
                      )}
                    </span>
                  </div>
                </div>
              </div>


              <div
                className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[570px]"
              >
                <SummaryCard
                  icon={
                    ShoppingBag
                  }

                  label="Orders"

                  value={
                    summary.totalOrders
                  }

                  helper={`${pagination.totalItems || 0} total`}

                  tone="slate"
                />


                <SummaryCard
                  icon={
                    CircleDollarSign
                  }

                  label="Net Revenue"

                  value={
                    money(
                      summary.payments
                        .netRevenue,
                      currency
                    )
                  }

                  helper={`${summary.payments.successfulPayments} success`}

                  tone="emerald"
                />


                <SummaryCard
                  icon={
                    KeyRound
                  }

                  label="Book Opens"

                  value={
                    summary.access
                      .totalAccessCount
                  }

                  helper={`${summary.access.revokedAccessOrders} revoked`}

                  tone="blue"
                />


                <SummaryCard
                  icon={
                    BadgePercent
                  }

                  label="Discounts"

                  value={
                    money(
                      summary.coupons
                        .totalDiscountAmount,
                      currency
                    )
                  }

                  helper={`${summary.coupons.couponAppliedOrders} coupon orders`}

                  tone="violet"
                />
              </div>
            </div>
          </section>


          {/* =================================================
              STATS
          ================================================= */}

          <section
            className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
          >
            <SummaryCard
              icon={
                CheckCircle2
              }

              label="Successful"

              value={
                summary.payments
                  .successfulPayments
              }

              helper={
                money(
                  summary.payments
                    .successfulAmount,
                  currency
                )
              }

              tone="emerald"
            />


            <SummaryCard
              icon={
                Clock3
              }

              label="Pending"

              value={
                summary.payments
                  .pendingPayments
              }

              helper={
                money(
                  summary.payments
                    .pendingAmount,
                  currency
                )
              }

              tone="amber"
            />


            <SummaryCard
              icon={
                XCircle
              }

              label="Failed"

              value={
                summary.payments
                  .failedPayments
              }

              helper={
                money(
                  summary.payments
                    .failedAmount,
                  currency
                )
              }

              tone="red"
            />


            <SummaryCard
              icon={
                RotateCcw
              }

              label="Refunded"

              value={
                money(
                  summary.refunds
                    .totalRefundedAmount,
                  currency
                )
              }

              helper={`${summary.refunds.refundOrders} orders`}

              tone="violet"
            />


            <SummaryCard
              icon={
                Mail
              }

              label="Reminders"

              value={
                summary.reminderMails
                  .totalSent
              }

              helper={`${summary.reminderMails.ordersWithReminderMail} orders`}

              tone="blue"
            />


            <SummaryCard
              icon={
                ShieldCheck
              }

              label="Verified"

              value={
                summary.verification
                  .payuVerified
              }

              helper="PayU verified"

              tone="slate"
            />
          </section>


          {/* =================================================
              BREAKDOWN
          ================================================= */}

          <div
            className="mt-4"
          >
            <BreakdownPanel
              breakdown={
                breakdown
              }

              currency={
                currency
              }
            />
          </div>


          {/* =================================================
              FILTERS / SEARCH
          ================================================= */}

          <section
            className="tt-card mt-5 p-4 sm:p-5"
          >
            <div
              className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
            >
              <div
                className="flex flex-wrap gap-2"
              >
                {FILTERS.map(
                  (
                    item
                  ) => {
                    const Icon =
                      item.icon;


                    const active =
                      statusFilter ===
                      item.key;


                    return (
                      <button
                        key={
                          item.key
                        }

                        type="button"

                        onClick={() => {
                          setStatusFilter(
                            item.key
                          );


                          setMenuOrderId(
                            null
                          );
                        }}

                        className={`tt-filter-button ${
                          active
                            ? "tt-filter-button-active"
                            : ""
                        }`}
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                        />

                        {item.label}


                        <span
                          className="tt-filter-count"
                        >
                          {filterCounts[
                            item.key
                          ] ||
                            0}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>


              <div
                className="tt-search-wrapper xl:max-w-md"
              >
                <Search
                  className="tt-search-icon"
                />


                <input
                  value={
                    searchQuery
                  }

                  onChange={
                    (
                      event
                    ) =>
                      setSearchQuery(
                        event.target.value
                      )
                  }

                  className="tt-search-input"

                  placeholder="Search customer, order, transaction, payment ID..."
                />
              </div>
            </div>


            {isGlobalFilterMode ? (
              <div
                className="tt-soft-card mt-4 px-4 py-3"
              >
                {loadingAllPayments &&
                !allPaymentsLoaded ? (
                  <div
                    className="flex items-center gap-2 text-sm font-bold"

                    style={{
                      color:
                        "var(--tt-primary)",
                    }}
                  >
                    <Loader2
                      className="h-4 w-4 animate-spin"
                    />

                    Loading all payment pages...
                  </div>
                ) : (
                  <p
                    className="tt-helper"
                  >
                    Showing{" "}

                    <strong
                      style={{
                        color:
                          "var(--tt-text)",
                      }}
                    >
                      {visiblePayments.length}
                    </strong>{" "}

                    matching record
                    {visiblePayments.length ===
                    1
                      ? ""
                      : "s"}{" "}

                    across{" "}

                    <strong
                      style={{
                        color:
                          "var(--tt-text)",
                      }}
                    >
                      {pagination.totalItems ||
                        allPayments.length}
                    </strong>{" "}

                    total orders.
                  </p>
                )}
              </div>
            ) : null}
          </section>


          {/* =================================================
              ERROR
          ================================================= */}

          {error ? (
            <section
              className="mt-5 rounded-2xl border p-5"

              style={{
                borderColor:
                  "var(--tt-danger-border)",

                background:
                  "var(--tt-danger-soft)",

                color:
                  "var(--tt-danger)",
              }}
            >
              <div
                className="flex items-start gap-3"
              >
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0"
                />


                <div>
                  <p
                    className="font-black"
                  >
                    Unable to load payments
                  </p>


                  <p
                    className="mt-1 text-sm font-semibold"
                  >
                    {error}
                  </p>
                </div>
              </div>
            </section>
          ) : null}


          {/* =================================================
              PAYMENT CARDS
          ================================================= */}

          <section
            className="mt-5 space-y-4"
          >
            {loading &&
            !payments.length ? (
              <div
                className="tt-card flex min-h-[320px] items-center justify-center"
              >
                <div
                  className="text-center"
                >
                  <Loader2
                    className="mx-auto h-7 w-7 animate-spin"

                    style={{
                      color:
                        "var(--tt-primary)",
                    }}
                  />


                  <p
                    className="tt-muted mt-3 text-sm font-bold"
                  >
                    Loading payment records...
                  </p>
                </div>
              </div>
            ) : isGlobalFilterMode &&
              loadingAllPayments &&
              !allPaymentsLoaded ? (
              <div
                className="tt-card flex min-h-[240px] items-center justify-center"
              >
                <div
                  className="text-center"
                >
                  <Loader2
                    className="mx-auto h-7 w-7 animate-spin"

                    style={{
                      color:
                        "var(--tt-primary)",
                    }}
                  />


                  <p
                    className="tt-muted mt-3 text-sm font-bold"
                  >
                    Loading all orders for filtering...
                  </p>
                </div>
              </div>
            ) : visiblePayments.length ? (
              visiblePayments.map(
                (
                  order,
                  index
                ) => (
                  <PaymentCard
                    key={
                      order._id ||
                      order.orderId
                    }

                    order={
                      order
                    }

                    index={
                      isGlobalFilterMode
                        ? index +
                          1
                        : (
                            page -
                            1
                          ) *
                            (
                              pagination.limit ||
                              10
                            ) +
                          index +
                          1
                    }

                    currency={
                      currency
                    }

                    menuOpen={
                      menuOrderId ===
                      order._id
                    }

                    onToggleMenu={
                      (
                        event
                      ) => {
                        event.stopPropagation();


                        setMenuOrderId(
                          (
                            current
                          ) =>
                            current ===
                            order._id
                              ? null
                              : order._id
                        );
                      }
                    }

                    onPending={
                      openPendingModal
                    }

                    onAccess={
                      handleSendAccessMail
                    }

                    onExtend={
                      openExtendAccess
                    }

                    onRevoke={
                      (
                        selectedOrder
                      ) => {
                        setMenuOrderId(
                          null
                        );


                        setRevokeOrder(
                          selectedOrder
                        );
                      }
                    }

                    onReviewLink={
                      handleGenerateReviewLink
                    }

                    onReviewMail={
                      handleSendReviewMail
                    }

                    onDelete={
                      (
                        selectedOrder
                      ) => {
                        setMenuOrderId(
                          null
                        );


                        setDeleteOrder(
                          selectedOrder
                        );
                      }
                    }

                    sendingAccess={
                      sendingAccessOrderId ===
                      order._id
                    }

                    extending={
                      extendingAccessOrderId ===
                      order._id
                    }

                    revoking={
                      revokingAccessOrderId ===
                      order._id
                    }

                    generatingReview={
                      generatingReviewOrderId ===
                      order._id
                    }

                    sendingReview={
                      sendingReviewMailOrderId ===
                      order._id
                    }

                    nowMs={
                      nowMs
                    }
                  />
                )
              )
            ) : (
              <div
                className="tt-card p-12 text-center"
              >
                <Receipt
                  className="tt-subtle mx-auto h-9 w-9"
                />


                <h3
                  className="mt-4 text-lg font-black"
                >
                  No payment records found
                </h3>


                <p
                  className="tt-helper mt-1"
                >
                  Try another filter or search query.
                </p>
              </div>
            )}
          </section>


          {/* =================================================
              PAGINATION

              Hide pagination when filtering because all
              backend pages are already combined.
          ================================================= */}

          {!isGlobalFilterMode ? (
            <section
              className="tt-card mt-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p
                className="tt-helper"
              >
                Page{" "}

                <strong
                  style={{
                    color:
                      "var(--tt-text)",
                  }}
                >
                  {pagination.page ||
                    page}
                </strong>{" "}

                of{" "}

                <strong
                  style={{
                    color:
                      "var(--tt-text)",
                  }}
                >
                  {Math.max(
                    Number(
                      pagination.totalPages
                    ) ||
                      1,
                    1
                  )}
                </strong>

                {" • "}

                {pagination.totalItems ||
                  0}{" "}
                records
              </p>


              <div
                className="flex gap-2"
              >
                <button
                  type="button"

                  disabled={
                    !pagination.hasPreviousPage ||

                    loading
                  }

                  onClick={() =>
                    goToPage(
                      page -
                        1
                    )
                  }

                  className="tt-btn tt-btn-secondary"
                >
                  <ChevronLeft
                    className="h-4 w-4"
                  />

                  Previous
                </button>


                <button
                  type="button"

                  disabled={
                    !pagination.hasNextPage ||

                    loading
                  }

                  onClick={() =>
                    goToPage(
                      page +
                        1
                    )
                  }

                  className="tt-btn tt-btn-secondary"
                >
                  Next

                  <ChevronRight
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </main>


      {/* ===================================================
          SEND REMINDER MODAL
      =================================================== */}

      {pendingOrder ? (
        <Modal>
          <ModalHeader
            icon={
              Mail
            }

            title="Send Purchase Reminder"

            subtitle={
              pendingOrder.customer
                ?.email ||

              pendingOrder.orderId
            }

            onClose={() => {
              if (
                !sendingMail
              ) {
                setPendingOrder(
                  null
                );
              }
            }}
          />


          <div
            className="p-5 sm:p-6"
          >
            <div
              className="tt-soft-card p-4"
            >
              <p
                className="font-black"
              >
                Optional Coupon
              </p>


              <p
                className="tt-helper mt-1"
              >
                Enter both coupon code and coupon description
                or leave both empty.
              </p>


              <div
                className="mt-4 space-y-3"
              >
                <input
                  value={
                    couponCode
                  }

                  onChange={
                    (
                      event
                    ) =>
                      setCouponCode(
                        event.target.value
                      )
                  }

                  className="tt-input"

                  placeholder="Coupon code"
                />


                <textarea
                  rows={
                    3
                  }

                  value={
                    couponDescription
                  }

                  onChange={
                    (
                      event
                    ) =>
                      setCouponDescription(
                        event.target.value
                      )
                  }

                  className="tt-textarea"

                  placeholder="Coupon description"
                />
              </div>
            </div>


            <div
              className="mt-6 flex justify-end gap-2"
            >
              <button
                type="button"

                disabled={
                  sendingMail
                }

                onClick={() =>
                  setPendingOrder(
                    null
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                Cancel
              </button>


              <button
                type="button"

                disabled={
                  sendingMail
                }

                onClick={
                  handleSendPendingMail
                }

                className="tt-btn tt-btn-primary"
              >
                {sendingMail ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Send
                    className="h-4 w-4"
                  />
                )}

                Send Reminder
              </button>
            </div>
          </div>
        </Modal>
      ) : null}


      {/* ===================================================
          EXTEND ACCESS MODAL
      =================================================== */}

      {extendOrder ? (
        <Modal
          maxWidth="max-w-xl"
        >
          <ModalHeader
            icon={
              TimerReset
            }

            tone="emerald"

            title={
              extendOrder.access
                ?.revoked
                ? "Reactivate Book Access"
                : "Extend Book Access"
            }

            subtitle={
              extendOrder.customer
                ?.email ||

              extendOrder.orderId
            }

            onClose={() => {
              if (
                !extendingAccessOrderId
              ) {
                setExtendOrder(
                  null
                );
              }
            }}
          />


          <div
            className="p-5 sm:p-6"
          >
            <AccessPanel
              order={
                extendOrder
              }

              nowMs={
                nowMs
              }
            />


            <div
              className="mt-5"
            >
              <p
                className="font-black"
              >
                Select Access Duration
              </p>


              <p
                className="tt-helper mt-1"
              >
                Expiry will be calculated from the current
                time, not from the previous expiry.
              </p>


              <div
                className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {EXTEND_PRESETS.map(
                  (
                    preset
                  ) => (
                    <button
                      key={
                        preset.hours
                      }

                      type="button"

                      onClick={() =>
                        setExtendHours(
                          String(
                            preset.hours
                          )
                        )
                      }

                      className={`tt-btn ${
                        Number(
                          extendHours
                        ) ===
                        preset.hours
                          ? "tt-btn-success"
                          : "tt-btn-secondary"
                      }`}
                    >
                      {preset.label}
                    </button>
                  )
                )}
              </div>


              <div
                className="mt-4"
              >
                <label
                  className="tt-label"
                >
                  Custom Hours
                </label>


                <input
                  type="number"

                  min="1"

                  step="1"

                  value={
                    extendHours
                  }

                  onChange={
                    (
                      event
                    ) =>
                      setExtendHours(
                        event.target.value
                      )
                  }

                  className="tt-input mt-2"
                />
              </div>


              {Number.isInteger(
                Number(
                  extendHours
                )
              ) &&
              Number(
                extendHours
              ) >
                0 ? (
                <div
                  className="mt-4 rounded-xl border p-3"

                  style={{
                    borderColor:
                      "var(--tt-success-border)",

                    background:
                      "var(--tt-success-soft)",
                  }}
                >
                  <p
                    className="tt-label"

                    style={{
                      color:
                        "var(--tt-success)",
                    }}
                  >
                    Expected New Expiry
                  </p>


                  <p
                    className="mt-1 text-sm font-black"

                    style={{
                      color:
                        "var(--tt-success)",
                    }}
                  >
                    {formatDate(
                      new Date(
                        nowMs +

                        Number(
                          extendHours
                        ) *
                          60 *
                          60 *
                          1000
                      )
                    )}
                  </p>
                </div>
              ) : null}
            </div>


            <div
              className="mt-6 flex justify-end gap-2"
            >
              <button
                type="button"

                disabled={
                  Boolean(
                    extendingAccessOrderId
                  )
                }

                onClick={() =>
                  setExtendOrder(
                    null
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                Cancel
              </button>


              <button
                type="button"

                disabled={
                  Boolean(
                    extendingAccessOrderId
                  )
                }

                onClick={
                  handleExtendAccess
                }

                className="tt-btn tt-btn-success"
              >
                {extendingAccessOrderId ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Zap
                    className="h-4 w-4"
                  />
                )}

                {extendOrder.access
                  ?.revoked
                  ? "Reactivate Access"
                  : "Extend Access"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}


      {/* ===================================================
          REVOKE ACCESS MODAL
      =================================================== */}

      {revokeOrder ? (
        <Modal>
          <ModalHeader
            icon={
              ShieldOff
            }

            tone="red"

            title="Revoke Book Access?"

            subtitle="The current customer access will stop immediately."

            onClose={() => {
              if (
                !revokingAccessOrderId
              ) {
                setRevokeOrder(
                  null
                );
              }
            }}
          />


          <div
            className="p-5 sm:p-6"
          >
            <AccessPanel
              order={
                revokeOrder
              }

              nowMs={
                nowMs
              }
            />


            <div
              className="mt-4 rounded-xl border p-4"

              style={{
                borderColor:
                  "var(--tt-danger-border)",

                background:
                  "var(--tt-danger-soft)",
              }}
            >
              <div
                className="flex items-start gap-3"
              >
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0"

                  style={{
                    color:
                      "var(--tt-danger)",
                  }}
                />


                <div>
                  <p
                    className="font-black"

                    style={{
                      color:
                        "var(--tt-danger)",
                    }}
                  >
                    Customer access will stop immediately.
                  </p>


                  <p
                    className="tt-helper mt-1"
                  >
                    The existing token is preserved. You can
                    reactivate the same access later using
                    Extend Access.
                  </p>
                </div>
              </div>
            </div>


            <div
              className="mt-6 flex justify-end gap-2"
            >
              <button
                type="button"

                disabled={
                  Boolean(
                    revokingAccessOrderId
                  )
                }

                onClick={() =>
                  setRevokeOrder(
                    null
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                Cancel
              </button>


              <button
                type="button"

                disabled={
                  Boolean(
                    revokingAccessOrderId
                  )
                }

                onClick={
                  handleRevokeAccess
                }

                className="tt-btn tt-btn-danger"
              >
                {revokingAccessOrderId ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <LockKeyhole
                    className="h-4 w-4"
                  />
                )}

                Revoke Access
              </button>
            </div>
          </div>
        </Modal>
      ) : null}


      {/* ===================================================
          REVIEW LINK MODAL
      =================================================== */}

      {reviewLinkModal ? (
        <Modal
          maxWidth="max-w-xl"
        >
          <ModalHeader
            icon={
              Link2
            }

            tone="violet"

            title="Review Link"

            subtitle={`${reviewLinkModal.customerName} • ${reviewLinkModal.bookTitle}`}

            onClose={() =>
              setReviewLinkModal(
                null
              )
            }
          />


          <div
            className="p-5 sm:p-6"
          >
            <div
              className="rounded-xl border p-4"

              style={{
                borderColor:
                  "var(--tt-border)",

                background:
                  "var(--tt-violet-soft)",
              }}
            >
              <p
                className="tt-label"

                style={{
                  color:
                    "var(--tt-violet)",
                }}
              >
                {reviewLinkModal.alreadyGenerated
                  ? "Existing Link"
                  : "New Link Generated"}
              </p>


              <p
                className="mt-2 break-all font-mono text-xs font-semibold leading-5"
              >
                {reviewLinkModal.reviewUrl}
              </p>
            </div>


            <div
              className="mt-6 flex justify-end gap-2"
            >
              <button
                type="button"

                onClick={() =>
                  copyValue(
                    reviewLinkModal.reviewUrl,
                    "Review link"
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                <Copy
                  className="h-4 w-4"
                />

                Copy Link
              </button>


              <button
                type="button"

                onClick={() =>
                  setReviewLinkModal(
                    null
                  )
                }

                className="tt-btn tt-btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      ) : null}


      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deleteOrder ? (
        <Modal>
          <ModalHeader
            icon={
              Trash2
            }

            tone="red"

            title="Delete Payment?"

            subtitle="This permanently removes the payment and order record."

            onClose={() => {
              if (
                !deletingPayment
              ) {
                setDeleteOrder(
                  null
                );
              }
            }}
          />


          <div
            className="p-5 sm:p-6"
          >
            <div
              className="rounded-xl border p-4"

              style={{
                borderColor:
                  "var(--tt-danger-border)",

                background:
                  "var(--tt-danger-soft)",
              }}
            >
              <p
                className="text-sm font-semibold"
              >
                Customer:{" "}

                <strong>
                  {deleteOrder.customer
                    ?.email ||

                    deleteOrder.orderId}
                </strong>
              </p>


              <p
                className="mt-3 break-all font-mono text-[11px]"

                style={{
                  color:
                    "var(--tt-danger)",
                }}
              >
                {deleteOrder._id}
              </p>
            </div>


            <div
              className="mt-6 flex justify-end gap-2"
            >
              <button
                type="button"

                disabled={
                  deletingPayment
                }

                onClick={() =>
                  setDeleteOrder(
                    null
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                Cancel
              </button>


              <button
                type="button"

                disabled={
                  deletingPayment
                }

                onClick={
                  handleDeletePayment
                }

                className="tt-btn tt-btn-danger"
              >
                {deletingPayment ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Trash2
                    className="h-4 w-4"
                  />
                )}

                Delete Payment
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}