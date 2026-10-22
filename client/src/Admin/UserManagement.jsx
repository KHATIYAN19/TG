// import React, {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import axios from "axios";
// import toast from "react-hot-toast";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";

// import {
//   Activity,
//   MonitorSmartphone,
//   Laptop,
//   Smartphone,
//   Globe2,
//   MapPin,
//   AlertCircle,
//   ArrowLeft,
//   ArrowRight,
//   Ban,
//   CalendarDays,
//   Check,
//   CheckCircle2,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Clock3,
//   Copy,
//   Edit3,
//   Eye,
//   Filter,
//   Handshake,
//   KeyRound,
//   Loader2,
//   LockKeyhole,
//   LogOut,
//   Mail,
//   MoreHorizontal,
//   Phone,
//   Plus,
//   RefreshCw,
//   Search,
//   Shield,
//   ShieldCheck,
//   SlidersHorizontal,
//   Trash2,
//   UserRound,
//   Users,
//   Wallet,
//   X,
// } from "lucide-react";

// import BASE_URL from "../utils/Url";

// /* ============================================================
//    CONFIGURATION
// ============================================================ */

// const API_BASE = String(BASE_URL).replace(/\/$/, "");

// const USERS_API = `${API_BASE}/api/admin/users`;

// // Update this only if your signup page uses a different route.
// const CREATE_USER_ROUTE = "/admin/signup";

// const ROLES = [
//   { value: "admin", label: "Administrator" },
//   { value: "Employee", label: "Employee" },
//   { value: "normal", label: "Normal User" },
//   { value: "affiliate", label: "Affiliate Partner" },
// ];

// const STATUSES = [
//   { value: "active", label: "Active" },
//   { value: "inactive", label: "Inactive" },
//   { value: "suspended", label: "Suspended" },
//   { value: "blocked", label: "Blocked" },
// ];

// const COMMISSION_TYPES = [
//   { value: "percentage", label: "Percentage" },
//   { value: "fixed", label: "Fixed amount" },
// ];

// const PAGE_SIZE = 10;

// /* ============================================================
//    HELPERS
// ============================================================ */

// const getErrorMessage = (error, fallback) => {
//   if (error?.response?.status === 429) {
//     return "Too many requests. Please try again later.";
//   }

//   if (error?.code === "ECONNABORTED") {
//     return "Request timed out. Please try again.";
//   }

//   return (
//     error?.response?.data?.message ||
//     error?.message ||
//     fallback
//   );
// };

// const getRoleLabel = (role) =>
//   ROLES.find((item) => item.value === role)?.label ||
//   role ||
//   "Unknown";

// const formatDate = (value, withTime = false) => {
//   if (!value) return "Not available";

//   const date = new Date(value);

//   if (Number.isNaN(date.getTime())) {
//     return "Not available";
//   }

//   return date.toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//     ...(withTime
//       ? {
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: true,
//         }
//       : {}),
//   });
// };

// const formatMoney = (value) => {
//   const number = Number(value);

//   if (!Number.isFinite(number)) return "—";

//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(number);
// };

// const formatCommission = (affiliate) => {
//   if (!affiliate) return "—";

//   if (affiliate.commissionType === "percentage") {
//     return `${affiliate.commissionValue}%`;
//   }

//   if (affiliate.commissionType === "fixed") {
//     return formatMoney(affiliate.commissionValue);
//   }

//   return "—";
// };

// const initials = (name = "") =>
//   name
//     .trim()
//     .split(/\s+/)
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((part) => part[0]?.toUpperCase())
//     .join("") || "U";

// const isValidMobile = (value) =>
//   /^[6-9]\d{9}$/.test(value);

// const isValidEmail = (value) =>
//   /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// const AFFILIATE_CODE_REGEX = /^[A-Z0-9_-]{3,30}$/;

// const isSelf = (user, currentUserId) =>
//   Boolean(
//     user &&
//       currentUserId &&
//       String(user._id) === String(currentUserId)
//   );

// /* ============================================================
//    THEME SYNCHRONIZATION
// ============================================================ */

// const getTheme = () => {
//   if (typeof window === "undefined") return "light";

//   const value = localStorage.getItem("theme");

//   if (value === "dark" || value === "light") {
//     return value;
//   }

//   return document.documentElement.classList.contains(
//     "dark"
//   )
//     ? "dark"
//     : "light";
// };

// const useSyncedTheme = () => {
//   const [theme, setTheme] = useState(getTheme);

//   useEffect(() => {
//     const sync = () => setTheme(getTheme());

//     const observer = new MutationObserver(sync);

//     observer.observe(document.documentElement, {
//       attributes: true,
//       attributeFilter: ["class", "data-theme"],
//     });

//     window.addEventListener("storage", sync);
//     window.addEventListener("theme-change", sync);

//     return () => {
//       observer.disconnect();
//       window.removeEventListener("storage", sync);
//       window.removeEventListener("theme-change", sync);
//     };
//   }, []);

//   return theme;
// };

// /* ============================================================
//    SHARED UI
// ============================================================ */

// const Badge = ({ value, type = "status", dark }) => {
//   const normalized = String(value || "").toLowerCase();

//   const orange =
//     normalized === "active" ||
//     normalized === "affiliate";

//   const gray =
//     normalized === "inactive" ||
//     normalized === "normal";

//   const dangerous =
//     normalized === "blocked" ||
//     normalized === "suspended";

//   let colors;

//   if (orange) {
//     colors = dark
//       ? "border-[#764523] bg-[#322215] text-[#FFA35C]"
//       : "border-[#FED7AA] bg-[#FFF7ED] text-[#C2410C]";
//   } else if (dangerous) {
//     colors = dark
//       ? "border-red-500/30 bg-red-500/10 text-red-400"
//       : "border-red-200 bg-red-50 text-red-600";
//   } else if (gray) {
//     colors = dark
//       ? "border-[#444] bg-[#292929] text-[#BBBBBB]"
//       : "border-[#E5E5E5] bg-[#F7F7F7] text-[#666]";
//   } else {
//     colors = dark
//       ? "border-[#454545] bg-[#252525] text-[#D5D5D5]"
//       : "border-[#E5E5E5] bg-[#F5F5F5] text-[#555]";
//   }

//   return (
//     <span
//       className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${colors}`}
//     >
//       {type === "status" && (
//         <span
//           className={`h-1.5 w-1.5 rounded-full ${
//             normalized === "active"
//               ? "bg-[#F97316]"
//               : dangerous
//                 ? "bg-red-500"
//                 : "bg-[#999]"
//           }`}
//         />
//       )}

//       {type === "role"
//         ? getRoleLabel(value)
//         : value || "Unknown"}
//     </span>
//   );
// };

// const StatCard = ({
//   icon: Icon,
//   label,
//   value,
//   description,
//   dark,
//   onClick,
//   active,
// }) => (
//   <button
//     type="button"
//     onClick={onClick}
//     className={`min-w-0 rounded-xl border p-4 text-left transition-all sm:p-5 ${
//       active
//         ? dark
//           ? "border-[#B45B20] bg-[#241B15]"
//           : "border-[#F97316] bg-[#FFF8F3]"
//         : dark
//           ? "border-[#303030] bg-[#151515] hover:border-[#555]"
//           : "border-[#E8E8E8] bg-white hover:border-[#F5C197]"
//     }`}
//   >
//     <div className="flex items-center justify-between gap-2">
//       <div
//         className={`flex h-9 w-9 items-center justify-center rounded-lg ${
//           dark ? "bg-[#282828]" : "bg-[#FFF1E6]"
//         }`}
//       >
//         <Icon size={18} className="text-[#F97316]" />
//       </div>

//       <ArrowRight
//         size={14}
//         className={dark ? "text-[#777]" : "text-[#AAA]"}
//       />
//     </div>

//     <p className="mt-4 text-[24px] font-semibold tracking-tight">
//       {value}
//     </p>

//     <p className="mt-1 text-[12px] font-semibold">{label}</p>

//     <p
//       className={`mt-1 text-[10px] ${
//         dark ? "text-[#999]" : "text-[#777]"
//       }`}
//     >
//       {description}
//     </p>
//   </button>
// );

// const Field = ({
//   label,
//   name,
//   value,
//   onChange,
//   placeholder,
//   required,
//   disabled,
//   type = "text",
//   dark,
//   maxLength,
// }) => (
//   <div className="min-w-0">
//     <label
//       htmlFor={name}
//       className="mb-2 block text-[12px] font-semibold"
//     >
//       {label}
//       {required && <span className="ml-1 text-[#F97316]">*</span>}
//     </label>

//     <input
//       id={name}
//       name={name}
//       type={type}
//       value={value ?? ""}
//       onChange={onChange}
//       placeholder={placeholder}
//       required={required}
//       disabled={disabled}
//       maxLength={maxLength}
//       className={`h-11 w-full rounded-lg border px-3.5 text-[12px] outline-none transition-colors focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 disabled:opacity-50 ${
//         dark
//           ? "border-[#3C3C3C] bg-[#202020] text-white placeholder:text-[#777]"
//           : "border-[#DEDEDE] bg-white text-[#171717] placeholder:text-[#999]"
//       }`}
//     />
//   </div>
// );

// const SelectField = ({
//   label,
//   name,
//   value,
//   options,
//   onChange,
//   dark,
// }) => (
//   <div className="min-w-0">
//     <label
//       htmlFor={name}
//       className="mb-2 block text-[12px] font-semibold"
//     >
//       {label}
//     </label>

//     <div className="relative">
//       <select
//         id={name}
//         name={name}
//         value={value}
//         onChange={onChange}
//         className={`h-11 w-full appearance-none rounded-lg border px-3.5 pr-10 text-[12px] outline-none focus:border-[#F97316] ${
//           dark
//             ? "border-[#3C3C3C] bg-[#202020] text-white"
//             : "border-[#DEDEDE] bg-white text-[#171717]"
//         }`}
//       >
//         {options.map((option) => (
//           <option key={option.value} value={option.value}>
//             {option.label}
//           </option>
//         ))}
//       </select>

//       <ChevronDown
//         size={16}
//         className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888]"
//       />
//     </div>
//   </div>
// );

// const Detail = ({ label, value, dark, mono = false }) => (
//   <div className="min-w-0">
//     <p
//       className={`text-[11px] ${
//         dark ? "text-[#999]" : "text-[#777]"
//       }`}
//     >
//       {label}
//     </p>

//     <p
//       className={`mt-1.5 break-words text-[12px] font-semibold ${
//         mono ? "font-mono" : ""
//       }`}
//     >
//       {value === null || value === undefined || value === ""
//         ? "Not provided"
//         : value}
//     </p>
//   </div>
// );

// /* ============================================================
//    MODAL WRAPPER
// ============================================================ */

// const Modal = ({
//   title,
//   subtitle,
//   children,
//   onClose,
//   dark,
//   width = "max-w-[540px]",
//   busy,
// }) => {
//   useEffect(() => {
//     const keyHandler = (event) => {
//       if (event.key === "Escape" && !busy) {
//         onClose();
//       }
//     };

//     document.addEventListener("keydown", keyHandler);

//     return () =>
//       document.removeEventListener("keydown", keyHandler);
//   }, [onClose, busy]);

//   return (
//     <div
//       className="fixed inset-0 z-[200] flex items-center justify-center bg-black/65 p-3 backdrop-blur-[3px] sm:p-5"
//       onMouseDown={(event) => {
//         if (event.target === event.currentTarget && !busy) {
//           onClose();
//         }
//       }}
//     >
//       <div
//         role="dialog"
//         aria-modal="true"
//         aria-label={title}
//         className={`flex max-h-[92vh] w-full flex-col overflow-hidden rounded-2xl border shadow-2xl ${width} ${
//           dark
//             ? "border-[#383838] bg-[#181818] text-white"
//             : "border-[#E7E7E7] bg-white text-[#171717]"
//         }`}
//       >
//         <div
//           className={`flex shrink-0 items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 ${
//             dark ? "border-[#333]" : "border-[#EAEAEA]"
//           }`}
//         >
//           <div>
//             <h2 className="text-[18px] font-semibold">{title}</h2>

//             {subtitle && (
//               <p
//                 className={`mt-1 text-[12px] leading-5 ${
//                   dark ? "text-[#999]" : "text-[#777]"
//                 }`}
//               >
//                 {subtitle}
//               </p>
//             )}
//           </div>

//           <button
//             type="button"
//             disabled={busy}
//             onClick={onClose}
//             aria-label="Close"
//             className={`rounded-lg p-1.5 ${
//               dark
//                 ? "text-[#999] hover:bg-[#333]"
//                 : "text-[#888] hover:bg-[#F3F3F3]"
//             }`}
//           >
//             <X size={19} />
//           </button>
//         </div>

//         <div className="min-h-0 overflow-y-auto p-5 sm:p-6">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// /* ============================================================
//    ADMIN USER SECURITY: ACTIVITY + ACTIVE DEVICES

//    API contract required (admin-only on the backend):
//    GET  /api/admin/users/:userId/activities?page=1&limit=15
//         => { success, activities: [], pagination:{page,pages,total} }
//    GET  /api/admin/users/:userId/sessions
//         => { success, sessions: [] } // active sessions only
//    POST /api/admin/users/:userId/sessions/:sessionId/revoke
//         => { success, message }
//    POST /api/admin/users/:userId/logout-all (already in this UI)

//    Use actual session.sessionId; never MongoDB _id for revocation.
//    No endpoint is claimed to exist until implemented in backend.
// ============================================================ */

// const SECURITY_PAGE_SIZE = 15;

// const UserSecurityTabs = ({
//   user,
//   apiConfig,
//   dark,
//   currentUserId,
//   onClose,
// }) => {
//   const [tab, setTab] = useState("activities");
//   const [page, setPage] = useState(1);
//   const [activities, setActivities] = useState([]);
//   const [activityTotal, setActivityTotal] = useState(0);
//   const [activityPages, setActivityPages] = useState(1);
//   const [sessions, setSessions] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [refresh, setRefresh] = useState(0);
//   const [busy, setBusy] = useState(false);
//   const [confirm, setConfirm] = useState(null);
//   const self = isSelf(user, currentUserId);
//   const base = `${USERS_API}/${encodeURIComponent(user._id)}`;
//   const muted = dark ? "text-[#999]" : "text-[#777]";
//   const surface = dark
//     ? "border-[#343434] bg-[#202020]"
//     : "border-[#E8E8E8] bg-[#FAFAFA]";

//   useEffect(() => {
//     const controller = new AbortController();
//     const load = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         if (tab === "activities") {
//           const { data } = await axios.get(`${base}/activities`, {
//             ...apiConfig,
//             signal: controller.signal,
//             params: { page, limit: SECURITY_PAGE_SIZE },
//           });
//           if (!data?.success) throw new Error(data?.message || "Could not load activities");
//           const list = data.activities ?? data.data?.activities;
//           const meta = data.pagination ?? data.data?.pagination;
//           if (!Array.isArray(list) || !meta) throw new Error("Unexpected activity API response");
//           setActivities(list);
//           setActivityTotal(Number(meta.total) || 0);
//           setActivityPages(Math.max(1, Number(meta.pages) || 1));
//         } else {
//           const { data } = await axios.get(`${base}/sessions`, {
//             ...apiConfig,
//             signal: controller.signal,
//           });
//           if (!data?.success) throw new Error(data?.message || "Could not load devices");
//           const list = data.sessions ?? data.data?.sessions;
//           if (!Array.isArray(list)) throw new Error("Unexpected device API response");
//           setSessions(list);
//         }
//       } catch (err) {
//         if (err.code !== "ERR_CANCELED") {
//           setError(getErrorMessage(err, `Unable to load ${tab}.`));
//         }
//       } finally {
//         if (!controller.signal.aborted) setLoading(false);
//       }
//     };
//     load();
//     return () => controller.abort();
//   }, [tab, page, refresh, base, apiConfig]);

//   const revoke = async () => {
//     if (!confirm || busy || self) return;
//     setBusy(true);
//     try {
//       const endpoint = confirm.all
//         ? `${base}/logout-all`
//         : `${base}/sessions/${encodeURIComponent(confirm.sessionId)}/revoke`;
//       const { data } = await axios.post(endpoint, {}, apiConfig);
//       if (!data?.success) throw new Error(data?.message || "Revocation failed");
//       toast.success(data.message || (confirm.all ? "All sessions revoked" : "Device logged out"));
//       setConfirm(null);
//       setRefresh((x) => x + 1);
//     } catch (err) {
//       toast.error(getErrorMessage(err, "Unable to revoke session."));
//     } finally {
//       setBusy(false);
//     }
//   };

//   const deviceLabel = (session) => {
//     const device = session.device || {};
//     if (typeof device === "string") return device;
//     return device.deviceName || device.browser || device.userAgent || "Unidentified device";
//   };

//   return (
//     <div className="mt-6 space-y-4">
//       <div className="flex flex-wrap items-center justify-between gap-2">
//         <div className={`inline-flex rounded-xl border p-1 ${surface}`} role="tablist" aria-label="User security history">
//           {[{ key: "activities", label: "Activities", Icon: Activity }, { key: "devices", label: "Active devices", Icon: MonitorSmartphone }].map(({key,label,Icon}) => (
//             <button key={key} type="button" role="tab" aria-selected={tab === key}
//               onClick={() => { setTab(key); setPage(1); setError(""); setConfirm(null); }}
//               className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${tab === key ? "bg-[#F97316] text-white" : muted}`}>
//               <Icon size={15}/>{label}
//             </button>
//           ))}
//         </div>
//         <button type="button" disabled={loading || busy} onClick={() => setRefresh((x) => x + 1)}
//           className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold ${surface}`}>
//           <RefreshCw size={14} className={loading ? "animate-spin" : ""}/> Refresh
//         </button>
//       </div>

//       {tab === "devices" && (
//         <div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3 ${surface}`}>
//           <div>
//             <p className="text-xs font-semibold">Current sessions</p>
//             <p className={`mt-1 text-[11px] ${muted}`}>Revoke access on one device or every device. Changes take effect on the next authenticated request.</p>
//           </div>
//           <button type="button" disabled={busy || loading || !sessions.length || self}
//             title={self ? "You cannot revoke your own administrator account here" : "Log out every device"}
//             onClick={() => setConfirm({ all: true })}
//             className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">
//             <LogOut size={15}/> Log out all
//           </button>
//         </div>
//       )}

//       {error && (
//         <div role="alert" className={`rounded-xl border p-4 text-xs ${dark ? "border-red-500/30 bg-red-950/20 text-red-300" : "border-red-200 bg-red-50 text-red-700"}`}>
//           {error}
//           <p className="mt-1 opacity-75">Confirm that the matching admin endpoint is mounted and authorized.</p>
//         </div>
//       )}
//       {loading ? (
//         <div className="flex min-h-36 items-center justify-center gap-2 text-xs text-[#F97316]"><Loader2 size={18} className="animate-spin"/> Loading…</div>
//       ) : !error && tab === "activities" ? (
//         <>
//           {activities.length === 0 ? (
//             <div className={`rounded-xl border p-8 text-center text-xs ${surface}`}>No recorded activities.</div>
//           ) : (
//             <div className="space-y-2" role="tabpanel">
//               {activities.map((item, index) => (
//                 <div key={item._id || item.id || index} className={`flex gap-3 rounded-xl border p-3 sm:p-4 ${surface}`}>
//                   <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F97316]/10"><Activity size={17} className="text-[#F97316]"/></span>
//                   <div className="min-w-0 flex-1">
//                     <div className="flex flex-wrap items-center justify-between gap-2">
//                       <p className="break-words text-xs font-semibold">{item.action || "Account activity"}</p>
//                       <span className={`text-[10px] ${muted}`}>{formatDate(item.createdAt || item.timestamp, true)}</span>
//                     </div>
//                     {item.result && <p className={`mt-1 text-[11px] ${muted}`}>Result: {item.result}</p>}
//                     {item.ipAddress && <p className={`mt-1 text-[11px] ${muted}`}>IP: {item.ipAddress}</p>}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//           <div className="flex items-center justify-between gap-3">
//             <p className={`text-[11px] ${muted}`}>{activityTotal} activities • 15 per page</p>
//             <div className="flex items-center gap-2">
//               <button type="button" disabled={page <= 1} onClick={() => setPage((n) => n - 1)} className={`rounded-lg border p-2 disabled:opacity-30 ${surface}`} aria-label="Previous activities"><ChevronLeft size={16}/></button>
//               <span className="text-xs">{page} / {activityPages}</span>
//               <button type="button" disabled={page >= activityPages} onClick={() => setPage((n) => n + 1)} className={`rounded-lg border p-2 disabled:opacity-30 ${surface}`} aria-label="Next activities"><ChevronRight size={16}/></button>
//             </div>
//           </div>
//         </>
//       ) : !error && tab === "devices" ? (
//         <div className="space-y-2" role="tabpanel">
//           {sessions.length === 0 ? <div className={`rounded-xl border p-8 text-center text-xs ${surface}`}>No active devices found.</div> : sessions.map((session) => {
//             const label = deviceLabel(session);
//             const DeviceIcon = /mobile|android|iphone/i.test(label) ? Smartphone : Laptop;
//             return (
//               <div key={session.sessionId} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${surface}`}>
//                 <div className="flex min-w-0 items-start gap-3">
//                   <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F97316]/10"><DeviceIcon className="text-[#F97316]" size={20}/></span>
//                   <div className="min-w-0">
//                     <p className="break-words text-xs font-semibold">{label}</p>
//                     <p className={`mt-1 text-[11px] ${muted}`}>Last active: {formatDate(session.lastActiveAt, true)}</p>
//                     <p className={`mt-1 text-[11px] ${muted}`}>Login IP: {session.ipAddress || "Unknown"}</p>
//                     <p className={`mt-1 text-[11px] ${muted}`}>Expires: {formatDate(session.expiresAt, true)}</p>
//                   </div>
//                 </div>
//                 <button type="button" disabled={busy || self || !session.sessionId}
//                   onClick={() => setConfirm({ all: false, sessionId: session.sessionId, deviceName: label })}
//                   title={self ? "You cannot revoke your own administrator account here" : "Log out this device"}
//                   className={`flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-500 disabled:opacity-40`}>
//                   <LogOut size={14}/> Log out device
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       ) : null}

//       {confirm && (
//         <div className={`rounded-xl border p-4 ${dark ? "border-red-500/40 bg-red-950/20" : "border-red-200 bg-red-50"}`}>
//           <p className="text-sm font-semibold">{confirm.all ? "Log out all devices?" : `Log out ${confirm.deviceName}?`}</p>
//           <p className={`mt-1 text-xs ${muted}`}>The session(s) will be revoked on the server. Existing browser pages are denied on their next authorized request.</p>
//           <div className="mt-4 flex flex-wrap gap-2">
//             <button type="button" disabled={busy} onClick={() => setConfirm(null)} className={`rounded-lg border px-4 py-2 text-xs font-semibold ${surface}`}>Cancel</button>
//             <button type="button" disabled={busy} onClick={revoke} className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">
//               {busy && <Loader2 size={14} className="animate-spin"/>} Confirm logout
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// /* ============================================================
//    USER EDIT FORM
// ============================================================ */

// const UserEditForm = ({
//   user,
//   onSave,
//   onCancel,
//   saving,
//   dark,
// }) => {
//   const [form, setForm] = useState(() => ({
//     name: user.name || "",
//     email: user.email || "",
//     mobile: user.mobile || "",
//     role: user.role || "normal",
//     affiliate: {
//       code: user.affiliate?.code || "",
//       commissionType:
//         user.affiliate?.commissionType || "percentage",
//       commissionValue:
//         user.affiliate?.commissionValue ?? 10,
//       status: user.affiliate?.status || "active",
//     },
//   }));

//   const update = (event) => {
//     const { name, value } = event.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const updateAffiliate = (event) => {
//     const { name, value } = event.target;

//     setForm((prev) => ({
//       ...prev,
//       affiliate: {
//         ...prev.affiliate,
//         [name]:
//           name === "code"
//             ? value.toUpperCase().replace(/\s/g, "")
//             : value,
//       },
//     }));
//   };

//   const submit = (event) => {
//     event.preventDefault();

//     const name = form.name.trim();
//     const email = form.email.trim().toLowerCase();
//     const mobile = form.mobile.trim();

//     if (name.length < 2 || name.length > 100) {
//       toast.error("Name must have 2–100 characters");
//       return;
//     }

//     if (!isValidEmail(email)) {
//       toast.error("Enter a valid email address");
//       return;
//     }

//     if (form.role !== "admin" && !isValidMobile(mobile)) {
//       toast.error("Enter a valid 10-digit mobile number");
//       return;
//     }

//     if (mobile && !isValidMobile(mobile)) {
//       toast.error("Invalid mobile number");
//       return;
//     }

//     const body = {
//       name,
//       email,
//       mobile: mobile || null,
//       role: form.role,
//     };

//     if (form.role === "affiliate") {
//       const code = form.affiliate.code.trim().toUpperCase();
//       const commissionValue = Number(
//         form.affiliate.commissionValue
//       );

//       if (!AFFILIATE_CODE_REGEX.test(code)) {
//         toast.error(
//           "Affiliate code must have 3–30 letters, digits, - or _"
//         );
//         return;
//       }

//       if (
//         !Number.isFinite(commissionValue) ||
//         commissionValue <= 0
//       ) {
//         toast.error("Commission must be greater than zero");
//         return;
//       }

//       if (
//         form.affiliate.commissionType === "percentage" &&
//         commissionValue > 100
//       ) {
//         toast.error("Percentage cannot exceed 100%");
//         return;
//       }

//       if (
//         Math.abs(
//           commissionValue * 100 -
//             Math.round(commissionValue * 100)
//         ) > 1e-7
//       ) {
//         toast.error("Maximum two commission decimal places");
//         return;
//       }

//       body.affiliate = {
//         code,
//         commissionType: form.affiliate.commissionType,
//         commissionValue,
//         status: form.affiliate.status,
//       };
//     } else if (user.role === "affiliate") {
//       // Explicitly clear config when changing away
//       // from the affiliate role.
//       body.affiliate = null;
//     }

//     onSave(body);
//   };

//   return (
//     <form onSubmit={submit} className="space-y-5">
//       <div className="grid gap-4 sm:grid-cols-2">
//         <Field
//           name="name"
//           label="Full name"
//           value={form.name}
//           onChange={update}
//           required
//           dark={dark}
//           maxLength={100}
//         />

//         <Field
//           name="email"
//           label="Email address"
//           type="email"
//           value={form.email}
//           onChange={update}
//           required
//           dark={dark}
//         />

//         <Field
//           name="mobile"
//           label="Mobile number"
//           value={form.mobile}
//           onChange={update}
//           placeholder="10-digit number"
//           dark={dark}
//         />

//         <SelectField
//           name="role"
//           label="Account role"
//           value={form.role}
//           options={ROLES}
//           onChange={update}
//           dark={dark}
//         />
//       </div>

//       {form.role === "affiliate" && (
//         <div
//           className={`space-y-4 rounded-xl border p-4 ${
//             dark
//               ? "border-[#5A3923] bg-[#241B16]"
//               : "border-[#F8D7BF] bg-[#FFF8F3]"
//           }`}
//         >
//           <div className="flex items-center gap-2">
//             <Handshake
//               size={18}
//               className="text-[#F97316]"
//             />

//             <h3 className="text-[13px] font-semibold">
//               Affiliate configuration
//             </h3>
//           </div>

//           <Field
//             name="code"
//             label="Affiliate code"
//             value={form.affiliate.code}
//             onChange={updateAffiliate}
//             placeholder="PARTNER25"
//             required
//             dark={dark}
//           />

//           <div className="grid gap-4 sm:grid-cols-2">
//             <SelectField
//               name="commissionType"
//               label="Commission type"
//               value={form.affiliate.commissionType}
//               options={COMMISSION_TYPES}
//               onChange={updateAffiliate}
//               dark={dark}
//             />

//             <Field
//               name="commissionValue"
//               label={
//                 form.affiliate.commissionType === "percentage"
//                   ? "Commission (%)"
//                   : "Fixed commission (₹)"
//               }
//               type="number"
//               value={form.affiliate.commissionValue}
//               onChange={updateAffiliate}
//               required
//               dark={dark}
//             />
//           </div>

//           <SelectField
//             name="status"
//             label="Affiliate status"
//             value={form.affiliate.status}
//             options={[
//               { value: "active", label: "Active" },
//               { value: "inactive", label: "Inactive" },
//             ]}
//             onChange={updateAffiliate}
//             dark={dark}
//           />

//           <p
//             className={`text-[11px] leading-5 ${
//               dark ? "text-[#B7A89B]" : "text-[#8A6A55]"
//             }`}
//           >
//             Affiliate status controls new referrals. Account
//             status separately controls whether this user can log in.
//           </p>
//         </div>
//       )}

//       <div
//         className={`rounded-lg border p-3 text-[11px] leading-6 ${
//           dark
//             ? "border-[#383838] bg-[#202020] text-[#AAA]"
//             : "border-[#E8E8E8] bg-[#F8F8F8] text-[#777]"
//         }`}
//       >
//         Changing a user's email or role will revoke existing
//         sessions. Other profile changes are saved directly.
//       </div>

//       <div className="flex gap-3 pt-1">
//         <button
//           type="button"
//           onClick={onCancel}
//           disabled={saving}
//           className={`h-11 flex-1 rounded-lg border text-[12px] font-semibold ${
//             dark
//               ? "border-[#444] hover:bg-[#292929]"
//               : "border-[#DDD] hover:bg-[#F7F7F7]"
//           }`}
//         >
//           Cancel
//         </button>

//         <button
//           type="submit"
//           disabled={saving}
//           className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#F97316] text-[12px] font-semibold text-white disabled:opacity-60"
//         >
//           {saving ? (
//             <Loader2 size={16} className="animate-spin" />
//           ) : (
//             <Check size={16} />
//           )}
//           Save changes
//         </button>
//       </div>
//     </form>
//   );
// };

// /* ============================================================
//    MAIN COMPONENT
// ============================================================ */

// const UserManagement = () => {
//   const navigate = useNavigate();

//   const token = useSelector(
//     (state) => state.auth?.token
//   );

//   const authUser = useSelector(
//     (state) => state.auth?.user
//   );

//   const theme = useSyncedTheme();
//   const dark = theme === "dark";

//   const currentUserId =
//     authUser?._id ||
//     authUser?.userId ||
//     authUser?.id ||
//     null;

//   /* ----------------------------------------------------------
//      LIST STATE
//   ---------------------------------------------------------- */

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [searchInput, setSearchInput] = useState("");
//   const [search, setSearch] = useState("");

//   const [roleFilter, setRoleFilter] = useState("");
//   const [statusFilter, setStatusFilter] = useState("");
//   const [affiliateStatusFilter, setAffiliateStatusFilter] =
//     useState("");

//   const [page, setPage] = useState(1);

//   const [pagination, setPagination] = useState({
//     total: 0,
//     page: 1,
//     limit: PAGE_SIZE,
//     pages: 1,
//   });

//   /* ----------------------------------------------------------
//      MODALS AND MUTATIONS
//   ---------------------------------------------------------- */

//   const [selectedUser, setSelectedUser] = useState(null);

//   const [modal, setModal] = useState(null);
//   // { type, user, nextStatus?, message? }

//   const [busy, setBusy] = useState(false);

//   const [statusReason, setStatusReason] = useState("");

//   const [detailLoading, setDetailLoading] = useState(false);

//   /* ----------------------------------------------------------
//      API CONFIG
//   ---------------------------------------------------------- */

//   const apiConfig = useMemo(
//     () => ({
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//       withCredentials: true,
//       timeout: 20000,
//     }),
//     [token]
//   );

//   /* ----------------------------------------------------------
//      LOAD USERS

//      GET /api/admin/users
//   ---------------------------------------------------------- */

//   const fetchUsers = useCallback(async () => {
//     if (!token) {
//       setLoading(false);
//       setError("You need to sign in as an administrator.");
//       return;
//     }

//     setLoading(true);
//     setError("");

//     try {
//       const params = {
//         page,
//         limit: PAGE_SIZE,
//       };

//       if (search.trim()) {
//         params.search = search.trim();
//       }

//       if (roleFilter) {
//         params.role = roleFilter;
//       }

//       if (statusFilter) {
//         params.status = statusFilter;
//       }

//       if (affiliateStatusFilter) {
//         params.affiliateStatus = affiliateStatusFilter;
//       }

//       const { data } = await axios.get(
//         USERS_API,
//         {
//           ...apiConfig,
//           params,
//         }
//       );

//       if (!data?.success) {
//         throw new Error(
//           data?.message || "Unable to fetch users"
//         );
//       }

//       setUsers(Array.isArray(data.users) ? data.users : []);

//       setPagination({
//         total: Number(data.pagination?.total || 0),
//         page: Number(data.pagination?.page || page),
//         limit: Number(data.pagination?.limit || PAGE_SIZE),
//         pages: Math.max(
//           1,
//           Number(data.pagination?.pages || 1)
//         ),
//       });
//     } catch (err) {
//       setUsers([]);

//       setError(
//         getErrorMessage(err, "Unable to load users.")
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [
//     token,
//     apiConfig,
//     page,
//     search,
//     roleFilter,
//     statusFilter,
//     affiliateStatusFilter,
//   ]);

//   useEffect(() => {
//     fetchUsers();
//   }, [fetchUsers]);

//   /* ----------------------------------------------------------
//      SEARCH DEBOUNCE
//   ---------------------------------------------------------- */

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setSearch(searchInput.trim());
//       setPage(1);
//     }, 350);

//     return () => clearTimeout(timer);
//   }, [searchInput]);

//   /* ----------------------------------------------------------
//      OPEN USER DETAILS

//      GET /api/admin/users/:userId
//   ---------------------------------------------------------- */

//   const openUserDetails = async (user) => {
//     setSelectedUser(user);
//     setModal({ type: "view", user });
//     setDetailLoading(true);

//     try {
//       const { data } = await axios.get(
//         `${USERS_API}/${user._id}`,
//         apiConfig
//       );

//       if (data.success && data.user) {
//         setSelectedUser(data.user);
//       }
//     } catch (err) {
//       toast.error(
//         getErrorMessage(
//           err,
//           "Unable to load full user details."
//         )
//       );
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   /* ----------------------------------------------------------
//      OPEN EDIT MODAL

//      GET /api/admin/users/:userId
//   ---------------------------------------------------------- */

//   const openEdit = async (user) => {
//     setSelectedUser(user);
//     setModal({ type: "edit", user });
//     setDetailLoading(true);

//     try {
//       const { data } = await axios.get(
//         `${USERS_API}/${user._id}`,
//         apiConfig
//       );

//       if (data.success && data.user) {
//         setSelectedUser(data.user);
//       }
//     } catch (err) {
//       toast.error(
//         getErrorMessage(
//           err,
//           "Unable to fetch updated user details."
//         )
//       );

//       setModal(null);
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   /* ----------------------------------------------------------
//      EDIT USER

//      PATCH /api/admin/users/:userId
//   ---------------------------------------------------------- */

//   const saveUser = async (body) => {
//     if (!selectedUser || busy) return;

//     setBusy(true);

//     try {
//       const { data } = await axios.patch(
//         `${USERS_API}/${selectedUser._id}`,
//         body,
//         apiConfig
//       );

//       if (!data.success) {
//         throw new Error(data.message || "Update failed");
//       }

//       toast.success(data.message || "User updated");

//       setModal(null);
//       setSelectedUser(null);

//       await fetchUsers();
//     } catch (err) {
//       toast.error(
//         getErrorMessage(err, "Unable to update user.")
//       );
//     } finally {
//       setBusy(false);
//     }
//   };

//   /* ----------------------------------------------------------
//      UPDATE ACCOUNT STATUS

//      PATCH /api/admin/users/:userId/status
//   ---------------------------------------------------------- */

//   const updateStatus = async () => {
//     if (!modal?.user || busy) return;

//     const user = modal.user;
//     const status = modal.nextStatus;

//     if (!status) return;

//     if (isSelf(user, currentUserId)) {
//       toast.error("You cannot change your own status.");
//       return;
//     }

//     setBusy(true);

//     try {
//       const { data } = await axios.patch(
//         `${USERS_API}/${user._id}/status`,
//         {
//           status,
//           reason: statusReason.trim() || undefined,
//         },
//         apiConfig
//       );

//       if (!data.success) {
//         throw new Error(data.message || "Status update failed");
//       }

//       toast.success(data.message || "Status updated");

//       setModal(null);
//       setStatusReason("");

//       await fetchUsers();
//     } catch (err) {
//       toast.error(
//         getErrorMessage(err, "Unable to change status.")
//       );
//     } finally {
//       setBusy(false);
//     }
//   };

//   /* ----------------------------------------------------------
//      CHANGE AFFILIATE REFERRAL STATUS

//      PATCH /api/admin/users/:userId/affiliate/status
//   ---------------------------------------------------------- */

//   const updateAffiliateStatus = async () => {
//     if (!modal?.user || busy) return;

//     setBusy(true);

//     try {
//       const { data } = await axios.patch(
//         `${USERS_API}/${modal.user._id}/affiliate/status`,
//         {
//           status: modal.nextStatus,
//         },
//         apiConfig
//       );

//       if (!data.success) {
//         throw new Error(
//           data.message || "Affiliate update failed"
//         );
//       }

//       toast.success(
//         data.message || "Affiliate status updated"
//       );

//       setModal(null);
//       await fetchUsers();
//     } catch (err) {
//       toast.error(
//         getErrorMessage(
//           err,
//           "Unable to update affiliate status."
//         )
//       );
//     } finally {
//       setBusy(false);
//     }
//   };

//   /* ----------------------------------------------------------
//      SEND PASSWORD INVITATION / RESET

//      POST /api/admin/users/:userId/password-link
//   ---------------------------------------------------------- */

//   const sendPasswordLink = async () => {
//     if (!modal?.user || busy) return;

//     setBusy(true);

//     try {
//       const { data } = await axios.post(
//         `${USERS_API}/${modal.user._id}/password-link`,
//         {},
//         apiConfig
//       );

//       if (!data.success) {
//         throw new Error(
//           data.message || "Unable to send password link."
//         );
//       }

//       toast.success(
//         data.message || "Password link sent by email."
//       );

//       setModal(null);
//     } catch (err) {
//       toast.error(
//         getErrorMessage(
//           err,
//           "Unable to send password link."
//         )
//       );
//     } finally {
//       setBusy(false);
//     }
//   };

//   /* ----------------------------------------------------------
//      LOG OUT ALL USER DEVICES

//      POST /api/admin/users/:userId/logout-all
//   ---------------------------------------------------------- */

//   const revokeAllSessions = async () => {
//     if (!modal?.user || busy) return;

//     setBusy(true);

//     try {
//       const { data } = await axios.post(
//         `${USERS_API}/${modal.user._id}/logout-all`,
//         {},
//         apiConfig
//       );

//       if (!data.success) {
//         throw new Error(data.message || "Logout failed");
//       }

//       toast.success(
//         "All sessions have been revoked."
//       );

//       setModal(null);
//     } catch (err) {
//       toast.error(
//         getErrorMessage(
//           err,
//           "Unable to revoke sessions."
//         )
//       );
//     } finally {
//       setBusy(false);
//     }
//   };

//   /* ----------------------------------------------------------
//      SOFT DELETE USER

//      DELETE /api/admin/users/:userId
//   ---------------------------------------------------------- */

//   const deleteUser = async () => {
//     if (!modal?.user || busy) return;

//     if (isSelf(modal.user, currentUserId)) {
//       toast.error("You cannot delete your own account.");
//       return;
//     }

//     setBusy(true);

//     try {
//       const { data } = await axios.delete(
//         `${USERS_API}/${modal.user._id}`,
//         apiConfig
//       );

//       if (!data.success) {
//         throw new Error(data.message || "Delete failed");
//       }

//       toast.success(
//         data.message || "User deleted successfully."
//       );

//       setModal(null);

//       if (users.length === 1 && page > 1) {
//         setPage((previous) => previous - 1);
//       } else {
//         await fetchUsers();
//       }
//     } catch (err) {
//       toast.error(
//         getErrorMessage(
//           err,
//           "Unable to delete user."
//         )
//       );
//     } finally {
//       setBusy(false);
//     }
//   };

//   /* ----------------------------------------------------------
//      FILTER HELPERS
//   ---------------------------------------------------------- */

//   const resetFilters = () => {
//     setSearchInput("");
//     setSearch("");
//     setRoleFilter("");
//     setStatusFilter("");
//     setAffiliateStatusFilter("");
//     setPage(1);
//   };

//   const changeRoleFilter = (value) => {
//     setRoleFilter(value);
//     setAffiliateStatusFilter("");
//     setPage(1);
//   };

//   /* ----------------------------------------------------------
//      STATISTICS

//      These count only the current loaded page.
//      They are deliberately not presented as total
//      company-wide counts.
//   ---------------------------------------------------------- */

//   const pageStats = useMemo(
//     () => ({
//       displayed: users.length,
//       active: users.filter(
//         (user) => user.status === "active"
//       ).length,
//       affiliates: users.filter(
//         (user) => user.role === "affiliate"
//       ).length,
//       restricted: users.filter(
//         (user) =>
//           ["blocked", "suspended", "inactive"].includes(
//             user.status
//           )
//       ).length,
//     }),
//     [users]
//   );

//   /* ----------------------------------------------------------
//      STYLES
//   ---------------------------------------------------------- */

//   const muted = dark
//     ? "text-[#999999]"
//     : "text-[#777777]";

//   const card = dark
//     ? "border-[#303030] bg-[#151515]"
//     : "border-[#E7E7E7] bg-white";

//   const border = dark
//     ? "border-[#333333]"
//     : "border-[#EAEAEA]";

//   const subtle = dark
//     ? "bg-[#202020]"
//     : "bg-[#F8F8F8]";

//   const outlineButton = dark
//     ? "border-[#444444] hover:bg-[#292929]"
//     : "border-[#DEDEDE] hover:bg-[#F6F6F6]";

//   const actionButton = `inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-[11px] font-semibold transition-colors disabled:opacity-50 ${outlineButton}`;

//   /* ----------------------------------------------------------
//      USER ACTION MENU

//      Uses buttons instead of dropdown portals to keep
//      mobile interactions reliable.
//   ---------------------------------------------------------- */

//   const UserActions = ({ user, compact = false }) => {
//     const self = isSelf(user, currentUserId);

//     const actionBase = compact
//       ? "flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[11px] font-semibold"
//       : "flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-[11px] font-semibold";

//     return (
//       <div className="flex flex-wrap items-center gap-2">
//         <button
//           type="button"
//           onClick={() => openUserDetails(user)}
//           className={`${actionBase} ${outlineButton}`}
//           title="View user"
//         >
//           <Eye size={14} />
//           {!compact && "View"}
//         </button>

//         <button
//           type="button"
//           onClick={() => openEdit(user)}
//           className={`${actionBase} ${outlineButton}`}
//           title="Edit user"
//         >
//           <Edit3 size={14} />
//           {!compact && "Edit"}
//         </button>

//         <button
//           type="button"
//           onClick={() =>
//             setModal({
//               type: "more",
//               user,
//             })
//           }
//           className={`${actionBase} ${outlineButton}`}
//           title="More actions"
//         >
//           <MoreHorizontal size={17} />
//           {!compact && "More"}
//         </button>
//       </div>
//     );
//   };

//   /* ============================================================
//      RENDER
//   ============================================================ */

//   return (
//     <div
//       data-theme={theme}
//       className={`mt-16 min-h-screen px-4 py-7 transition-colors duration-200 sm:px-6 lg:px-8 ${
//         dark
//           ? "bg-black text-white"
//           : "bg-white text-[#171717]"
//       }`}
//     >
//       <div className="mx-auto max-w-[1380px] space-y-6">

//         {/* ====================================================
//             HEADER
//         ==================================================== */}

//         <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
//           <div>
//             <p
//               className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-[1.5px] ${muted}`}
//             >
//               <span className="h-2 w-2 rounded-full bg-[#F97316]" />
//               Target Trek / Administration
//             </p>

//             <h1 className="mt-3 text-[30px] font-semibold tracking-[-1px] sm:text-[36px]">
//               User management
//             </h1>

//             <p className={`mt-2 text-[13px] leading-6 ${muted}`}>
//               Manage team members, affiliates, account access
//               and security from one workspace.
//             </p>
//           </div>

//           <div className="flex flex-wrap gap-2">
//             <button
//               type="button"
//               onClick={fetchUsers}
//               disabled={loading}
//               className={`${actionButton} h-10 px-4`}
//             >
//               <RefreshCw
//                 size={15}
//                 className={loading ? "animate-spin" : ""}
//               />
//               Refresh
//             </button>

//             <button
//               type="button"
//               onClick={() => navigate(CREATE_USER_ROUTE)}
//               className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#F97316] px-4 text-[12px] font-semibold text-white transition-colors hover:bg-[#EA650A]"
//             >
//               <Plus size={17} />
//               Add user
//             </button>
//           </div>
//         </div>

//         {/* ====================================================
//             STAT CARDS
//         ==================================================== */}

//         <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//           <StatCard
//             icon={Users}
//             label="Displayed users"
//             value={loading ? "…" : pageStats.displayed}
//             description="On this page"
//             dark={dark}
//             onClick={resetFilters}
//           />

//           <StatCard
//             icon={CheckCircle2}
//             label="Active users"
//             value={loading ? "…" : pageStats.active}
//             description="Active on this page"
//             dark={dark}
//             active={statusFilter === "active"}
//             onClick={() => {
//               setStatusFilter(
//                 statusFilter === "active" ? "" : "active"
//               );
//               setPage(1);
//             }}
//           />

//           <StatCard
//             icon={Handshake}
//             label="Affiliates"
//             value={loading ? "…" : pageStats.affiliates}
//             description="On this page"
//             dark={dark}
//             active={roleFilter === "affiliate"}
//             onClick={() =>
//               changeRoleFilter(
//                 roleFilter === "affiliate" ? "" : "affiliate"
//               )
//             }
//           />

//           <StatCard
//             icon={Shield}
//             label="Restricted users"
//             value={loading ? "…" : pageStats.restricted}
//             description="Inactive, suspended or blocked on this page"
//             dark={dark}
//             onClick={() => {
//               setStatusFilter("blocked");
//               setPage(1);
//             }}
//           />
//         </div>

//         {/* ====================================================
//             SEARCH / FILTERS
//         ==================================================== */}

//         <div className={`rounded-xl border p-4 sm:p-5 ${card}`}>
//           <div className="flex flex-col gap-4">
//             <div className="flex items-center gap-2">
//               <SlidersHorizontal
//                 size={17}
//                 className="text-[#F97316]"
//               />

//               <p className="text-[13px] font-semibold">
//                 Find and filter users
//               </p>
//             </div>

//             <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.6fr)_repeat(3,minmax(140px,1fr))]">
//               {/* SEARCH */}

//               <div className="relative">
//                 <Search
//                   size={17}
//                   className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]"
//                 />

//                 <input
//                   value={searchInput}
//                   onChange={(event) =>
//                     setSearchInput(event.target.value)
//                   }
//                   placeholder="Search name, email, mobile, affiliate code..."
//                   className={`h-11 w-full rounded-lg border pl-10 pr-9 text-[12px] outline-none focus:border-[#F97316] ${
//                     dark
//                       ? "border-[#3B3B3B] bg-[#202020] text-white placeholder:text-[#777]"
//                       : "border-[#E2E2E2] bg-white placeholder:text-[#999]"
//                   }`}
//                 />

//                 {searchInput && (
//                   <button
//                     type="button"
//                     onClick={() => setSearchInput("")}
//                     className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#999]"
//                   >
//                     <X size={15} />
//                   </button>
//                 )}
//               </div>

//               {/* ROLE */}

//               <div className="relative">
//                 <select
//                   value={roleFilter}
//                   onChange={(event) =>
//                     changeRoleFilter(event.target.value)
//                   }
//                   className={`h-11 w-full appearance-none rounded-lg border px-3 pr-9 text-[12px] outline-none focus:border-[#F97316] ${
//                     dark
//                       ? "border-[#3B3B3B] bg-[#202020] text-white"
//                       : "border-[#E2E2E2] bg-white"
//                   }`}
//                 >
//                   <option value="">All roles</option>
//                   {ROLES.map((role) => (
//                     <option key={role.value} value={role.value}>
//                       {role.label}
//                     </option>
//                   ))}
//                 </select>

//                 <ChevronDown
//                   size={15}
//                   className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888]"
//                 />
//               </div>

//               {/* ACCOUNT STATUS */}

//               <div className="relative">
//                 <select
//                   value={statusFilter}
//                   onChange={(event) => {
//                     setStatusFilter(event.target.value);
//                     setPage(1);
//                   }}
//                   className={`h-11 w-full appearance-none rounded-lg border px-3 pr-9 text-[12px] outline-none focus:border-[#F97316] ${
//                     dark
//                       ? "border-[#3B3B3B] bg-[#202020] text-white"
//                       : "border-[#E2E2E2] bg-white"
//                   }`}
//                 >
//                   <option value="">All account statuses</option>
//                   {STATUSES.map((status) => (
//                     <option key={status.value} value={status.value}>
//                       {status.label}
//                     </option>
//                   ))}
//                 </select>

//                 <ChevronDown
//                   size={15}
//                   className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888]"
//                 />
//               </div>

//               {/* AFFILIATE STATUS */}

//               <div className="relative">
//                 <select
//                   value={affiliateStatusFilter}
//                   onChange={(event) => {
//                     setAffiliateStatusFilter(event.target.value);

//                     if (event.target.value) {
//                       setRoleFilter("affiliate");
//                     }

//                     setPage(1);
//                   }}
//                   className={`h-11 w-full appearance-none rounded-lg border px-3 pr-9 text-[12px] outline-none focus:border-[#F97316] ${
//                     dark
//                       ? "border-[#3B3B3B] bg-[#202020] text-white"
//                       : "border-[#E2E2E2] bg-white"
//                   }`}
//                 >
//                   <option value="">All referral statuses</option>
//                   <option value="active">Referrals active</option>
//                   <option value="inactive">Referrals inactive</option>
//                 </select>

//                 <ChevronDown
//                   size={15}
//                   className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888]"
//                 />
//               </div>
//             </div>

//             <div className="flex flex-wrap items-center justify-between gap-2">
//               <p className={`text-[11px] ${muted}`}>
//                 {loading
//                   ? "Loading results..."
//                   : `${pagination.total} matching account${
//                       pagination.total === 1 ? "" : "s"
//                     }`}
//               </p>

//               {(searchInput ||
//                 roleFilter ||
//                 statusFilter ||
//                 affiliateStatusFilter) && (
//                 <button
//                   type="button"
//                   onClick={resetFilters}
//                   className="text-[11px] font-semibold text-[#F97316]"
//                 >
//                   Clear filters
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ====================================================
//             MAIN CONTENT
//         ==================================================== */}

//         {loading ? (
//           <div
//             className={`flex min-h-[340px] items-center justify-center rounded-xl border ${card}`}
//           >
//             <div className="flex flex-col items-center gap-3">
//               <Loader2
//                 size={27}
//                 className="animate-spin text-[#F97316]"
//               />
//               <p className={`text-[12px] ${muted}`}>
//                 Loading user accounts...
//               </p>
//             </div>
//           </div>
//         ) : error ? (
//           <div
//             className={`rounded-xl border p-8 text-center ${card}`}
//           >
//             <AlertCircle
//               size={30}
//               className="mx-auto text-[#F97316]"
//             />

//             <h2 className="mt-4 text-[18px] font-semibold">
//               Unable to load users
//             </h2>

//             <p className={`mt-2 text-[12px] ${muted}`}>
//               {error}
//             </p>

//             <button
//               type="button"
//               onClick={fetchUsers}
//               className="mt-5 rounded-lg bg-[#F97316] px-5 py-2.5 text-[12px] font-semibold text-white"
//             >
//               Try again
//             </button>
//           </div>
//         ) : users.length === 0 ? (
//           <div
//             className={`rounded-xl border p-10 text-center ${card}`}
//           >
//             <div
//               className={`mx-auto flex h-14 w-14 items-center justify-center rounded-xl ${
//                 dark ? "bg-[#292929]" : "bg-[#FFF3E8]"
//               }`}
//             >
//               <Users
//                 size={25}
//                 className="text-[#F97316]"
//               />
//             </div>

//             <h2 className="mt-5 text-[17px] font-semibold">
//               No users found
//             </h2>

//             <p
//               className={`mx-auto mt-2 max-w-[400px] text-[12px] leading-6 ${muted}`}
//             >
//               Try adjusting your search or filters.
//               You can also create a new account.
//             </p>

//             <div className="mt-5 flex justify-center gap-3">
//               <button
//                 type="button"
//                 onClick={resetFilters}
//                 className={`${actionButton} h-10`}
//               >
//                 Clear filters
//               </button>

//               <button
//                 type="button"
//                 onClick={() => navigate(CREATE_USER_ROUTE)}
//                 className="flex h-10 items-center gap-2 rounded-lg bg-[#F97316] px-4 text-[12px] font-semibold text-white"
//               >
//                 <Plus size={16} />
//                 Add user
//               </button>
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* ====================================================
//                 DESKTOP TABLE
//             ==================================================== */}

//             <div
//               className={`hidden overflow-hidden rounded-xl border lg:block ${card}`}
//             >
//               <div
//                 className={`flex items-center justify-between border-b px-5 py-4 ${border}`}
//               >
//                 <div>
//                   <h2 className="text-[14px] font-semibold">
//                     User accounts
//                   </h2>

//                   <p className={`mt-1 text-[11px] ${muted}`}>
//                     Select View or Edit to manage an account.
//                   </p>
//                 </div>

//                 <span className={`text-[11px] ${muted}`}>
//                   Page {page} of {pagination.pages}
//                 </span>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="w-full min-w-[1050px] text-left">
//                   <thead
//                     className={
//                       dark
//                         ? "bg-[#1D1D1D] text-[#AAAAAA]"
//                         : "bg-[#FAFAFA] text-[#777777]"
//                     }
//                   >
//                     <tr className="text-[10px] uppercase tracking-[0.6px]">
//                       <th className="px-5 py-4 font-semibold">
//                         User
//                       </th>

//                       <th className="px-4 py-4 font-semibold">
//                         Role
//                       </th>

//                       <th className="px-4 py-4 font-semibold">
//                         Account status
//                       </th>

//                       <th className="px-4 py-4 font-semibold">
//                         Affiliate
//                       </th>

//                       <th className="px-4 py-4 font-semibold">
//                         Last login
//                       </th>

//                       <th className="px-4 py-4 font-semibold">
//                         Created
//                       </th>

//                       <th className="px-4 py-4 text-right font-semibold">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {users.map((user) => (
//                       <tr
//                         key={user._id}
//                         className={`border-t transition-colors ${
//                           dark
//                             ? "border-[#303030] hover:bg-[#202020]"
//                             : "border-[#EEEEEE] hover:bg-[#FAFAFA]"
//                         }`}
//                       >
//                         {/* USER */}

//                         <td className="px-5 py-4">
//                           <div className="flex items-center gap-3">
//                             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F97316]/15 text-[12px] font-bold text-[#F97316]">
//                               {initials(user.name)}
//                             </div>

//                             <div className="min-w-0">
//                               <p className="max-w-[210px] truncate text-[12px] font-semibold">
//                                 {user.name}
//                               </p>

//                               <p className={`mt-1 max-w-[210px] truncate text-[11px] ${muted}`}>
//                                 {user.email}
//                               </p>

//                               {user.mobile && (
//                                 <p className={`mt-1 text-[10px] ${muted}`}>
//                                   {user.mobile}
//                                 </p>
//                               )}
//                             </div>
//                           </div>
//                         </td>

//                         {/* ROLE */}

//                         <td className="px-4 py-4">
//                           <Badge
//                             value={user.role}
//                             type="role"
//                             dark={dark}
//                           />
//                         </td>

//                         {/* STATUS */}

//                         <td className="px-4 py-4">
//                           <Badge
//                             value={user.status}
//                             dark={dark}
//                           />
//                         </td>

//                         {/* AFFILIATE */}

//                         <td className="px-4 py-4">
//                           {user.role === "affiliate" &&
//                           user.affiliate ? (
//                             <div className="space-y-1.5">
//                               <p className="font-mono text-[11px] font-semibold">
//                                 {user.affiliate.code}
//                               </p>

//                               <p className="text-[11px] font-semibold text-[#F97316]">
//                                 {formatCommission(user.affiliate)}
//                               </p>

//                               <Badge
//                                 value={user.affiliate.status}
//                                 dark={dark}
//                               />
//                             </div>
//                           ) : (
//                             <span className={`text-[11px] ${muted}`}>
//                               —
//                             </span>
//                           )}
//                         </td>

//                         {/* LAST LOGIN */}

//                         <td className={`px-4 py-4 text-[11px] ${muted}`}>
//                           {formatDate(user.lastLoginAt, true)}
//                         </td>

//                         {/* CREATED */}

//                         <td className={`px-4 py-4 text-[11px] ${muted}`}>
//                           {formatDate(user.createdAt)}
//                         </td>

//                         {/* ACTIONS */}

//                         <td className="px-4 py-4">
//                           <div className="flex justify-end">
//                             <UserActions user={user} compact />
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* ====================================================
//                 MOBILE / TABLET CARDS
//             ==================================================== */}

//             <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
//               {users.map((user) => (
//                 <article
//                   key={user._id}
//                   className={`min-w-0 rounded-xl border p-4 ${card}`}
//                 >
//                   <div className="flex items-start gap-3">
//                     <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F97316]/15 text-[13px] font-bold text-[#F97316]">
//                       {initials(user.name)}
//                     </div>

//                     <div className="min-w-0 flex-1">
//                       <h3 className="truncate text-[13px] font-semibold">
//                         {user.name}
//                       </h3>

//                       <p className={`mt-1 break-all text-[11px] ${muted}`}>
//                         {user.email}
//                       </p>

//                       <div className="mt-2 flex flex-wrap gap-1.5">
//                         <Badge
//                           value={user.role}
//                           type="role"
//                           dark={dark}
//                         />

//                         <Badge
//                           value={user.status}
//                           dark={dark}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   <div
//                     className={`my-4 border-t ${border}`}
//                   />

//                   <div className="grid grid-cols-2 gap-4">
//                     <Detail
//                       label="Mobile"
//                       value={user.mobile}
//                       dark={dark}
//                     />

//                     <Detail
//                       label="Last login"
//                       value={formatDate(user.lastLoginAt)}
//                       dark={dark}
//                     />

//                     {user.role === "affiliate" && (
//                       <>
//                         <Detail
//                           label="Affiliate code"
//                           value={user.affiliate?.code}
//                           dark={dark}
//                           mono
//                         />

//                         <Detail
//                           label="Commission"
//                           value={formatCommission(user.affiliate)}
//                           dark={dark}
//                         />
//                       </>
//                     )}
//                   </div>

//                   <div
//                     className={`mt-4 border-t pt-4 ${border}`}
//                   >
//                     <UserActions user={user} />
//                   </div>
//                 </article>
//               ))}
//             </div>

//             {/* ====================================================
//                 PAGINATION
//             ==================================================== */}

//             <div
//               className={`flex flex-col gap-4 rounded-xl border px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${card}`}
//             >
//               <p className={`text-[11px] ${muted}`}>
//                 Showing{" "}
//                 <strong className={dark ? "text-white" : "text-black"}>
//                   {(page - 1) * PAGE_SIZE + 1}
//                   {"–"}
//                   {Math.min(
//                     page * PAGE_SIZE,
//                     pagination.total
//                   )}
//                 </strong>
//                 {" "}of{" "}
//                 <strong className={dark ? "text-white" : "text-black"}>
//                   {pagination.total}
//                 </strong>
//                 {" "}users
//               </p>

//               <div className="flex items-center justify-between gap-2 sm:justify-end">
//                 <button
//                   type="button"
//                   disabled={page <= 1}
//                   onClick={() => setPage((prev) => Math.max(1, prev - 1))}
//                   className={`${actionButton} disabled:cursor-not-allowed`}
//                 >
//                   <ChevronLeft size={15} />
//                   Previous
//                 </button>

//                 <span className={`px-2 text-[11px] ${muted}`}>
//                   {page} / {pagination.pages}
//                 </span>

//                 <button
//                   type="button"
//                   disabled={page >= pagination.pages}
//                   onClick={() =>
//                     setPage((prev) =>
//                       Math.min(pagination.pages, prev + 1)
//                     )
//                   }
//                   className={`${actionButton} disabled:cursor-not-allowed`}
//                 >
//                   Next
//                   <ChevronRight size={15} />
//                 </button>
//               </div>
//             </div>
//           </>
//         )}

//         {/* ====================================================
//             MODAL: VIEW USER
//         ==================================================== */}

//         {modal?.type === "view" && (
//           <Modal
//             dark={dark}
//             width="max-w-[920px]"
//             title="User details"
//             subtitle="Account information and affiliate configuration."
//             onClose={() => setModal(null)}
//           >
//             {detailLoading ? (
//               <div className="flex justify-center py-16">
//                 <Loader2
//                   size={25}
//                   className="animate-spin text-[#F97316]"
//                 />
//               </div>
//             ) : (
//               <div className="space-y-6">
//                 <div className="flex items-center gap-4">
//                   <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-[18px] font-bold text-white">
//                     {initials(selectedUser?.name)}
//                   </div>

//                   <div className="min-w-0">
//                     <h3 className="text-[17px] font-semibold">
//                       {selectedUser?.name}
//                     </h3>

//                     <p className={`mt-1 break-all text-[12px] ${muted}`}>
//                       {selectedUser?.email}
//                     </p>

//                     <div className="mt-2 flex flex-wrap gap-2">
//                       <Badge
//                         value={selectedUser?.role}
//                         type="role"
//                         dark={dark}
//                       />

//                       <Badge
//                         value={selectedUser?.status}
//                         dark={dark}
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 <div className={`border-t ${border}`} />

//                 <div className="grid gap-5 sm:grid-cols-2">
//                   <Detail
//                     label="Full name"
//                     value={selectedUser?.name}
//                     dark={dark}
//                   />

//                   <Detail
//                     label="Email"
//                     value={selectedUser?.email}
//                     dark={dark}
//                   />

//                   <Detail
//                     label="Mobile"
//                     value={selectedUser?.mobile}
//                     dark={dark}
//                   />

//                   <Detail
//                     label="User ID"
//                     value={selectedUser?._id}
//                     dark={dark}
//                     mono
//                   />

//                   <Detail
//                     label="Account created"
//                     value={formatDate(selectedUser?.createdAt, true)}
//                     dark={dark}
//                   />

//                   <Detail
//                     label="Last updated"
//                     value={formatDate(selectedUser?.updatedAt, true)}
//                     dark={dark}
//                   />

//                   <Detail
//                     label="Last login"
//                     value={formatDate(selectedUser?.lastLoginAt, true)}
//                     dark={dark}
//                   />

//                   <Detail
//                     label="Password changed"
//                     value={formatDate(
//                       selectedUser?.passwordChangedAt,
//                       true
//                     )}
//                     dark={dark}
//                   />

//                   <Detail
//                     label="Password setup"
//                     value={
//                       selectedUser?.mustChangePassword
//                         ? "Pending"
//                         : "Completed"
//                     }
//                     dark={dark}
//                   />

//                   <Detail
//                     label="Account status"
//                     value={selectedUser?.status}
//                     dark={dark}
//                   />
//                 </div>

//                 {selectedUser?.role === "affiliate" &&
//                   selectedUser?.affiliate && (
//                     <div className={`rounded-xl border p-4 ${subtle} ${border}`}>
//                       <div className="mb-4 flex items-center gap-2">
//                         <Handshake
//                           size={18}
//                           className="text-[#F97316]"
//                         />

//                         <h4 className="text-[13px] font-semibold">
//                           Affiliate details
//                         </h4>
//                       </div>

//                       <div className="grid gap-5 sm:grid-cols-2">
//                         <Detail
//                           label="Referral code"
//                           value={selectedUser.affiliate.code}
//                           dark={dark}
//                           mono
//                         />

//                         <Detail
//                           label="Commission type"
//                           value={selectedUser.affiliate.commissionType}
//                           dark={dark}
//                         />

//                         <Detail
//                           label="Commission value"
//                           value={formatCommission(selectedUser.affiliate)}
//                           dark={dark}
//                         />

//                         <Detail
//                           label="Referral status"
//                           value={selectedUser.affiliate.status}
//                           dark={dark}
//                         />
//                       </div>
//                     </div>
//                   )}

//                 {selectedUser?.statusReason && (
//                   <div className={`rounded-lg border p-4 ${subtle} ${border}`}>
//                     <p className="text-[12px] font-semibold">
//                       Account status reason
//                     </p>

//                     <p className={`mt-2 text-[12px] leading-6 ${muted}`}>
//                       {selectedUser.statusReason}
//                     </p>
//                   </div>
//                 )}

//                 {selectedUser?._id && (
//                   <UserSecurityTabs
//                     key={selectedUser._id}
//                     user={selectedUser}
//                     apiConfig={apiConfig}
//                     dark={dark}
//                     currentUserId={currentUserId}
//                     onClose={() => setModal(null)}
//                   />
//                 )}

//                 <div className="flex justify-end gap-2">
//                   <button
//                     type="button"
//                     onClick={() => setModal(null)}
//                     className={`${actionButton} h-10`}
//                   >
//                     Close
//                   </button>

//                   <button
//                     type="button"
//                     onClick={() => {
//                       const user = selectedUser;
//                       setModal(null);
//                       openEdit(user);
//                     }}
//                     className="flex h-10 items-center gap-2 rounded-lg bg-[#F97316] px-4 text-[12px] font-semibold text-white"
//                   >
//                     <Edit3 size={15} />
//                     Edit user
//                   </button>
//                 </div>
//               </div>
//             )}
//           </Modal>
//         )}

//         {/* ====================================================
//             MODAL: EDIT USER
//         ==================================================== */}

//         {modal?.type === "edit" && (
//           <Modal
//             dark={dark}
//             width="max-w-[650px]"
//             title="Edit user"
//             subtitle="Update profile, account role and affiliate settings."
//             onClose={() => {
//               if (!busy) setModal(null);
//             }}
//             busy={busy}
//           >
//             {detailLoading ? (
//               <div className="flex justify-center py-16">
//                 <Loader2
//                   size={25}
//                   className="animate-spin text-[#F97316]"
//                 />
//               </div>
//             ) : selectedUser ? (
//               <UserEditForm
//                 key={selectedUser._id}
//                 user={selectedUser}
//                 dark={dark}
//                 saving={busy}
//                 onSave={saveUser}
//                 onCancel={() => setModal(null)}
//               />
//             ) : null}
//           </Modal>
//         )}

//         {/* ====================================================
//             MODAL: MORE ACTIONS
//         ==================================================== */}

//         {modal?.type === "more" && (
//           <Modal
//             dark={dark}
//             title="Manage account"
//             subtitle={modal.user?.name}
//             onClose={() => setModal(null)}
//           >
//             <div className="space-y-3">
//               {[
//                 {
//                   icon: KeyRound,
//                   title: modal.user?.mustChangePassword
//                     ? "Resend password setup email"
//                     : "Send password reset email",
//                   description:
//                     "Issue a secure, time-limited password link.",
//                   onClick: () =>
//                     setModal({
//                       type: "password",
//                       user: modal.user,
//                     }),
//                 },
//                 {
//                   icon: LogOut,
//                   title: "Log out all devices",
//                   description:
//                     "Revoke all active sessions and tokens.",
//                   onClick: () =>
//                     setModal({
//                       type: "logout",
//                       user: modal.user,
//                     }),
//                 },
//               ].map((action) => {
//                 const Icon = action.icon;

//                 return (
//                   <button
//                     key={action.title}
//                     type="button"
//                     onClick={action.onClick}
//                     className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors ${
//                       dark
//                         ? "border-[#383838] hover:bg-[#252525]"
//                         : "border-[#E8E8E8] hover:bg-[#F9F9F9]"
//                     }`}
//                   >
//                     <Icon
//                       size={18}
//                       className="shrink-0 text-[#F97316]"
//                     />

//                     <div className="flex-1">
//                       <p className="text-[12px] font-semibold">
//                         {action.title}
//                       </p>

//                       <p className={`mt-1 text-[11px] ${muted}`}>
//                         {action.description}
//                       </p>
//                     </div>

//                     <ChevronRight size={16} className={muted} />
//                   </button>
//                 );
//               })}

//               {/* ACCOUNT STATUS */}

//               <div className={`border-t pt-4 ${border}`}>
//                 <h3 className="mb-3 text-[12px] font-semibold">
//                   Account access
//                 </h3>

//                 <div className="grid grid-cols-2 gap-2">
//                   {STATUSES.map((status) => (
//                     <button
//                       key={status.value}
//                       type="button"
//                       disabled={
//                         modal.user?.status === status.value ||
//                         isSelf(modal.user, currentUserId)
//                       }
//                       onClick={() => {
//                         setStatusReason("");

//                         setModal({
//                           type: "status",
//                           user: modal.user,
//                           nextStatus: status.value,
//                         });
//                       }}
//                       className={`rounded-lg border px-3 py-3 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${outlineButton}`}
//                     >
//                       {status.label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* AFFILIATE REFERRAL STATUS */}

//               {modal.user?.role === "affiliate" && (
//                 <div className={`border-t pt-4 ${border}`}>
//                   <h3 className="mb-2 text-[12px] font-semibold">
//                     Affiliate referrals
//                   </h3>

//                   <p className={`mb-3 text-[11px] leading-5 ${muted}`}>
//                     Disabling referrals does not block account login.
//                   </p>

//                   <div className="grid grid-cols-2 gap-2">
//                     {[
//                       { value: "active", label: "Enable referrals" },
//                       { value: "inactive", label: "Disable referrals" },
//                     ].map((status) => (
//                       <button
//                         key={status.value}
//                         type="button"
//                         disabled={
//                           modal.user.affiliate?.status === status.value
//                         }
//                         onClick={() =>
//                           setModal({
//                             type: "affiliateStatus",
//                             user: modal.user,
//                             nextStatus: status.value,
//                           })
//                         }
//                         className={`rounded-lg border px-3 py-3 text-[11px] font-semibold disabled:opacity-40 ${outlineButton}`}
//                       >
//                         {status.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* DELETE */}

//               <div className={`border-t pt-4 ${border}`}>
//                 <button
//                   type="button"
//                   disabled={isSelf(modal.user, currentUserId)}
//                   onClick={() =>
//                     setModal({
//                       type: "delete",
//                       user: modal.user,
//                     })
//                   }
//                   className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors disabled:opacity-40 ${
//                     dark
//                       ? "border-red-500/25 bg-red-500/5 hover:bg-red-500/10"
//                       : "border-red-200 bg-red-50 hover:bg-red-100"
//                   }`}
//                 >
//                   <Trash2 size={18} className="text-red-500" />

//                   <div>
//                     <p className="text-[12px] font-semibold text-red-500">
//                       Delete account
//                     </p>

//                     <p className={`mt-1 text-[11px] ${muted}`}>
//                       Soft delete this user and revoke all sessions.
//                     </p>
//                   </div>
//                 </button>
//               </div>
//             </div>
//           </Modal>
//         )}

//         {/* ====================================================
//             MODAL: STATUS CHANGE
//         ==================================================== */}

//         {modal?.type === "status" && (
//           <Modal
//             dark={dark}
//             busy={busy}
//             title="Change account status"
//             subtitle={`Update ${modal.user?.name}'s account access.`}
//             onClose={() => setModal(null)}
//           >
//             <div className="space-y-5">
//               <div className={`rounded-lg border p-4 ${subtle} ${border}`}>
//                 <p className={`text-[11px] ${muted}`}>
//                   New account status
//                 </p>

//                 <div className="mt-2">
//                   <Badge
//                     value={modal.nextStatus}
//                     dark={dark}
//                   />
//                 </div>

//                 <p className={`mt-3 text-[11px] leading-6 ${muted}`}>
//                   This action will revoke the user's existing
//                   sessions. If you reactivate an account, the
//                   user must sign in again.
//                 </p>
//               </div>

//               <div>
//                 <label className="mb-2 block text-[12px] font-semibold">
//                   Reason (optional)
//                 </label>

//                 <textarea
//                   rows={3}
//                   maxLength={500}
//                   value={statusReason}
//                   onChange={(event) =>
//                     setStatusReason(event.target.value)
//                   }
//                   placeholder="Reason for changing account status..."
//                   className={`w-full resize-none rounded-lg border p-3 text-[12px] outline-none focus:border-[#F97316] ${
//                     dark
//                       ? "border-[#444] bg-[#202020] text-white"
//                       : "border-[#DDD] bg-white"
//                   }`}
//                 />
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   disabled={busy}
//                   onClick={() => setModal(null)}
//                   className={`${actionButton} h-11 flex-1`}
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   disabled={busy}
//                   onClick={updateStatus}
//                   className="flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#F97316] text-[12px] font-semibold text-white disabled:opacity-60"
//                 >
//                   {busy && <Loader2 size={15} className="animate-spin" />}
//                   Confirm change
//                 </button>
//               </div>
//             </div>
//           </Modal>
//         )}

//         {/* ====================================================
//             CONFIRMATION MODALS
//         ==================================================== */}

//         {[
//           "password",
//           "logout",
//           "affiliateStatus",
//           "delete",
//         ].includes(modal?.type) && (
//           <Modal
//             dark={dark}
//             busy={busy}
//             title={
//               modal.type === "password"
//                 ? "Send password link?"
//                 : modal.type === "logout"
//                   ? "Log out all devices?"
//                   : modal.type === "affiliateStatus"
//                     ? "Change referral status?"
//                     : "Delete this account?"
//             }
//             subtitle={modal.user?.name}
//             onClose={() => setModal(null)}
//           >
//             <div className="space-y-5">
//               <div
//                 className={`flex items-start gap-3 rounded-lg border p-4 ${subtle} ${border}`}
//               >
//                 {modal.type === "password" ? (
//                   <KeyRound
//                     size={20}
//                     className="shrink-0 text-[#F97316]"
//                   />
//                 ) : modal.type === "logout" ? (
//                   <LogOut
//                     size={20}
//                     className="shrink-0 text-[#F97316]"
//                   />
//                 ) : modal.type === "affiliateStatus" ? (
//                   <Handshake
//                     size={20}
//                     className="shrink-0 text-[#F97316]"
//                   />
//                 ) : (
//                   <Trash2
//                     size={20}
//                     className="shrink-0 text-red-500"
//                   />
//                 )}

//                 <p className={`text-[12px] leading-6 ${muted}`}>
//                   {modal.type === "password"
//                     ? `A secure ${
//                         modal.user?.mustChangePassword
//                           ? "password setup"
//                           : "password reset"
//                       } link will be sent to ${modal.user?.email}.`
//                     : modal.type === "logout"
//                       ? "All sessions and authorization tokens for this account will be revoked. The user must sign in again."
//                       : modal.type === "affiliateStatus"
//                         ? `Affiliate referrals will be ${
//                             modal.nextStatus
//                           }. The user's account login status will not change.`
//                         : "This account will be soft deleted. Existing sessions will be revoked, and the user will disappear from the active user list."}
//                 </p>
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   type="button"
//                   disabled={busy}
//                   onClick={() => setModal(null)}
//                   className={`${actionButton} h-11 flex-1`}
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="button"
//                   disabled={busy}
//                   onClick={
//                     modal.type === "password"
//                       ? sendPasswordLink
//                       : modal.type === "logout"
//                         ? revokeAllSessions
//                         : modal.type === "affiliateStatus"
//                           ? updateAffiliateStatus
//                           : deleteUser
//                   }
//                   className={`flex h-11 flex-1 items-center justify-center gap-2 rounded-lg px-4 text-[12px] font-semibold text-white disabled:opacity-60 ${
//                     modal.type === "delete"
//                       ? "bg-red-600 hover:bg-red-700"
//                       : "bg-[#F97316] hover:bg-[#EA650A]"
//                   }`}
//                 >
//                   {busy ? (
//                     <Loader2 size={16} className="animate-spin" />
//                   ) : modal.type === "delete" ? (
//                     <Trash2 size={15} />
//                   ) : (
//                     <Check size={15} />
//                   )}

//                   {busy
//                     ? "Processing..."
//                     : modal.type === "delete"
//                       ? "Delete account"
//                       : "Confirm"}
//                 </button>
//               </div>
//             </div>
//           </Modal>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserManagement;

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import toast from "react-hot-toast";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Ban,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Edit3,
  Eye,
  Filter,
  Handshake,
  KeyRound,
  Laptop,
  Loader2,
  LogOut,
  MonitorSmartphone,
  MoreHorizontal,
  Plus,
  ReceiptText,
  RefreshCw,
  Search,
  Shield,
  ShoppingBag,
  SlidersHorizontal,
  Smartphone,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url";

/* =========================================================
   CONFIGURATION
========================================================= */

const ROOT = String(BASE_URL).replace(/\/$/, "");

const API = {
  users: `${ROOT}/api/admin/users`,
  dashboard: `${ROOT}/api/affiliate/dashboard`,
  orders: `${ROOT}/api/affiliate/orders`,
};

const CREATE_USER_ROUTE = "/admin/signup";

const USER_PAGE_SIZE = 10;
const DETAIL_PAGE_SIZE = 15;

const ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "Employee", label: "Employee" },
  { value: "normal", label: "Normal User" },
  { value: "affiliate", label: "Affiliate Partner" },
];

const STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "blocked", label: "Blocked" },
];

const ORDER_STATUSES = [
  "ALL",
  "EARNED",
  "FAILED",
  "PENDING",
  "REFUNDED",
  "UNVERIFIED",
];

const EMPTY_ORDER_FILTERS = {
  status: "ALL",
  startDate: "",
  endDate: "",
  sort: "desc",
};

/* =========================================================
   HELPERS
========================================================= */

const money = (value, currency = "INR") => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  } catch {
    return `₹${Number(value || 0).toFixed(2)}`;
  }
};

const count = (value) =>
  new Intl.NumberFormat("en-IN").format(
    Number(value) || 0
  );

const dateText = (value, withTime = false) => {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  }).format(date);
};

const errorText = (error, fallback) => {
  if (error?.response?.status === 429) {
    return "Too many requests. Please try again.";
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
};

const initials = (name = "") =>
  String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const roleLabel = (role) =>
  ROLES.find((item) => item.value === role)?.label ||
  role ||
  "Unknown";

const isSelf = (user, currentUserId) =>
  Boolean(
    user?._id &&
      currentUserId &&
      String(user._id) === String(currentUserId)
  );

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidMobile = (value) =>
  /^[6-9]\d{9}$/.test(value);

const getTheme = () => {
  if (typeof window === "undefined") return "light";

  const saved = localStorage.getItem("theme");

  if (saved === "dark" || saved === "light") {
    return saved;
  }

  return document.documentElement.classList.contains(
    "dark"
  )
    ? "dark"
    : "light";
};

function useTheme() {
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    const sync = () => setTheme(getTheme());

    const observer = new MutationObserver(sync);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    window.addEventListener("storage", sync);
    window.addEventListener("theme-change", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", sync);
      window.removeEventListener("theme-change", sync);
    };
  }, []);

  return theme;
}

/* =========================================================
   SHARED UI
========================================================= */

function Button({
  children,
  onClick,
  disabled,
  dark,
  primary = false,
  danger = false,
  className = "",
  type = "button",
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3.5 text-[12px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "bg-red-600 text-white hover:bg-red-700"
          : primary
            ? "bg-[#F97316] text-white hover:bg-[#E7650A]"
            : dark
              ? "border border-[#444] bg-[#242424] text-white hover:bg-[#303030]"
              : "border border-[#DDD] bg-white text-[#222] hover:bg-[#F7F7F7]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  action,
  children,
  dark,
  className = "",
}) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-xl border ${
        dark
          ? "border-[#343434] bg-[#191919]"
          : "border-[#E8E8E8] bg-white"
      } ${className}`}
    >
      {(title || action) && (
        <div
          className={`flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5 ${
            dark ? "border-[#333]" : "border-[#EEE]"
          }`}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F97316]/10">
                <Icon
                  size={17}
                  className="text-[#F97316]"
                />
              </div>
            )}

            <div>
              <h3 className="text-[13px] font-semibold">
                {title}
              </h3>

              {subtitle && (
                <p className="mt-1 text-[11px] opacity-60">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action}
        </div>
      )}

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Metric({
  label,
  value,
  description,
  icon: Icon,
  dark,
  onClick,
}) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`min-w-0 rounded-xl border p-4 text-left ${
        dark
          ? "border-[#343434] bg-[#1E1E1E]"
          : "border-[#E8E8E8] bg-white"
      } ${onClick ? "transition hover:border-[#F97316]" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium opacity-65">
          {label}
        </p>

        {Icon && (
          <Icon
            size={18}
            className="shrink-0 text-[#F97316]"
          />
        )}
      </div>

      <p className="mt-3 break-words text-xl font-semibold tracking-tight sm:text-2xl">
        {value}
      </p>

      {description && (
        <p className="mt-2 text-[10px] opacity-55">
          {description}
        </p>
      )}
    </Component>
  );
}

function Badge({ value, dark }) {
  const normalized = String(value || "UNKNOWN")
    .toUpperCase();

  const good = [
    "ACTIVE",
    "SUCCESS",
    "PAID",
    "EARNED",
  ].includes(normalized);

  const bad = [
    "FAILED",
    "REFUNDED",
    "BLOCKED",
    "SUSPENDED",
  ].includes(normalized);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        good
          ? "border-orange-400/30 bg-orange-500/10 text-[#F97316]"
          : bad
            ? "border-red-500/30 bg-red-500/10 text-red-500"
            : dark
              ? "border-[#444] bg-[#292929] text-[#DDD]"
              : "border-[#DDD] bg-[#F7F7F7] text-[#555]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          good
            ? "bg-[#F97316]"
            : bad
              ? "bg-red-500"
              : "bg-gray-400"
        }`}
      />
      {normalized}
    </span>
  );
}

function Loading({ text = "Loading..." }) {
  return (
    <div className="flex min-h-36 items-center justify-center gap-2 text-[12px] text-[#F97316]">
      <Loader2 size={18} className="animate-spin" />
      {text}
    </div>
  );
}

function Empty({ children, dark }) {
  return (
    <div
      className={`rounded-xl border border-dashed px-4 py-10 text-center text-[12px] ${
        dark
          ? "border-[#444] text-[#999]"
          : "border-[#DDD] text-[#777]"
      }`}
    >
      {children}
    </div>
  );
}

function Pager({
  page,
  pages,
  total,
  onChange,
  dark,
  disabled,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-[11px] opacity-60">
        {count(total)} records · Page {page} of{" "}
        {Math.max(1, pages)}
      </p>

      <div className="flex gap-2">
        <Button
          dark={dark}
          disabled={disabled || page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft size={15} />
          Previous
        </Button>

        <Button
          dark={dark}
          disabled={
            disabled || page >= Math.max(1, pages)
          }
          onClick={() => onChange(page + 1)}
        >
          Next
          <ChevronRight size={15} />
        </Button>
      </div>
    </div>
  );
}

function Detail({ label, value, dark }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] opacity-55">{label}</p>
      <p className="mt-1 break-words text-[12px] font-semibold">
        {value ?? "Not provided"}
      </p>
    </div>
  );
}

function Modal({
  title,
  subtitle,
  children,
  onClose,
  dark,
  width = "max-w-[1020px]",
  busy = false,
}) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [onClose, busy]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !busy
        ) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`flex max-h-[94vh] w-full ${width} flex-col overflow-hidden rounded-2xl border shadow-2xl ${
          dark
            ? "border-[#383838] bg-[#171717] text-white"
            : "border-[#DDD] bg-white text-[#171717]"
        }`}
      >
        <header
          className={`flex shrink-0 items-start justify-between gap-4 border-b px-4 py-4 sm:px-6 ${
            dark ? "border-[#343434]" : "border-[#EEE]"
          }`}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#F97316]">
              Target Trek · Administration
            </p>

            <h2 className="mt-2 text-[19px] font-semibold">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 text-[11px] opacity-60">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="rounded-lg p-2 hover:bg-[#888]/10 disabled:opacity-40"
          >
            <X size={19} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   AFFILIATE TRANSACTION ROWS

   Uses the SAME response structure as UserProfile.
========================================================= */

function OrderRows({ orders = [], dark }) {
  if (!orders.length) {
    return (
      <Empty dark={dark}>
        No transactions match the selected filters.
      </Empty>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[690px] text-left text-[12px]">
        <thead>
          <tr
            className={`border-b text-[11px] opacity-65 ${
              dark ? "border-[#353535]" : "border-[#EEE]"
            }`}
          >
            <th className="pb-3 pr-4 font-medium">
              Order / Book
            </th>
            <th className="pb-3 pr-4 font-medium">
              Date
            </th>
            <th className="pb-3 pr-4 font-medium">
              Status
            </th>
            <th className="pb-3 pr-4 text-right font-medium">
              Sale
            </th>
            <th className="pb-3 text-right font-medium">
              Commission
            </th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order, index) => {
            const state =
              order.state ||
              order.paymentStatus ||
              order.orderStatus;

            return (
              <tr
                key={`${order.orderId || index}-${index}`}
                className={`border-b ${
                  dark
                    ? "border-[#303030]"
                    : "border-[#EEE]"
                }`}
              >
                <td className="py-4 pr-4">
                  <p className="max-w-[240px] truncate font-semibold">
                    {order.book?.title || "Book"}
                  </p>

                  <p className="mt-1 break-all font-mono text-[10px] opacity-55">
                    {order.orderId}
                  </p>

                  <p className="mt-1 text-[10px] opacity-55">
                    {order.commissionType === "PERCENTAGE"
                      ? `${order.commissionValue}% commission`
                      : order.commissionType === "FIXED"
                        ? `${money(order.commissionValue)} fixed`
                        : "No commission"}
                  </p>
                </td>

                <td className="py-4 pr-4 text-[11px]">
                  {dateText(
                    order.eventAt || order.createdAt,
                    true
                  )}
                </td>

                <td className="py-4 pr-4">
                  <Badge value={state} dark={dark} />
                </td>

                <td className="py-4 pr-4 text-right font-semibold">
                  {money(
                    order.amount,
                    order.currency || "INR"
                  )}
                </td>

                <td className="py-4 text-right">
                  {order.commissionEarned ? (
                    <span className="font-semibold text-[#F97316]">
                      {money(
                        order.commissionAmount,
                        order.currency || "INR"
                      )}
                    </span>
                  ) : (
                    <span className="opacity-50">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   SALES GRAPH

   Uses dashboard.graph.points from existing API.
========================================================= */

function SalesGraph({ graph, dark }) {
  const [metric, setMetric] = useState("salesAmount");
  const [hovered, setHovered] = useState(null);

  const points = graph?.points || [];

  const highest = Math.max(
    1,
    ...points.map((point) => Number(point[metric]) || 0)
  );

  const metricOptions = [
    { key: "salesAmount", label: "Sales" },
    { key: "commission", label: "Commission" },
    { key: "successfulOrders", label: "Orders" },
  ];

  const activePoint =
    hovered !== null ? points[hovered] : null;

  const shownValue = activePoint
    ? Number(activePoint[metric]) || 0
    : points.reduce(
        (sum, point) =>
          sum + (Number(point[metric]) || 0),
        0
      );

  return (
    <Panel
      title="Performance over time"
      subtitle={`Daily trends · ${graph?.days || 7} days · IST`}
      icon={BarChart3}
      dark={dark}
      action={
        <div className="flex flex-wrap gap-1">
          {metricOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                setMetric(option.key);
                setHovered(null);
              }}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${
                metric === option.key
                  ? "bg-[#F97316] text-white"
                  : dark
                    ? "bg-[#292929]"
                    : "bg-[#F3F3F3]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      }
    >
      {!points.length ? (
        <Empty dark={dark}>No graph data available.</Empty>
      ) : (
        <>
          <div
            className={`mb-5 flex flex-wrap justify-between gap-3 rounded-lg p-3 text-[12px] ${
              dark ? "bg-[#242424]" : "bg-[#F8F8F8]"
            }`}
          >
            <span className="opacity-65">
              {activePoint
                ? activePoint.date
                : "Total for selected chart"}
            </span>

            <strong className="text-[#F97316]">
              {metric === "successfulOrders"
                ? count(shownValue)
                : money(shownValue)}
            </strong>
          </div>

          <div className="flex h-[220px] items-end gap-1.5 overflow-x-auto pb-8">
            {points.map((point, index) => {
              const value = Number(point[metric]) || 0;

              const height = Math.max(
                value > 0 ? 4 : 2,
                (value / highest) * 100
              );

              const showLabel =
                points.length <= 14 ||
                index %
                  Math.ceil(points.length / 10) ===
                  0;

              return (
                <button
                  key={point.date}
                  type="button"
                  title={`${point.date}: ${value}`}
                  onMouseEnter={() => setHovered(index)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  className="relative flex h-full min-w-[12px] flex-1 flex-col justify-end outline-none"
                >
                  <span
                    style={{ height: `${height}%` }}
                    className={`w-full rounded-t-md transition-colors ${
                      hovered === index
                        ? "bg-[#F97316]"
                        : dark
                          ? "bg-[#9D511F] hover:bg-[#F97316]"
                          : "bg-[#FDBA84] hover:bg-[#F97316]"
                    }`}
                  />

                  {showLabel && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] opacity-55">
                      {point.date.slice(5)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </Panel>
  );
}

/* =========================================================
   ADMIN AFFILIATE SALES

   Existing API:
   GET /api/affiliate/dashboard?userId=...&graphDays=7

   Only render for affiliate users.
========================================================= */

function AffiliateSales({
  user,
  apiConfig,
  dark,
  onTransactions,
}) {
  const [graphDays, setGraphDays] = useState(7);
  const [period, setPeriod] = useState("last7Days");

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!user?._id) return;

    const controller = new AbortController();

    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(
          API.dashboard,
          {
            ...apiConfig,
            signal: controller.signal,
            params: {
              userId: user._id,
              graphDays,
            },
          }
        );

        if (!data?.success || !data?.data) {
          throw new Error(
            data?.message || "Unable to load affiliate sales."
          );
        }

        setDashboard(data.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          setError(
            errorText(error, "Unable to load sales.")
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => controller.abort();
  }, [user?._id, apiConfig, graphDays, revision]);

  const summary = dashboard?.summary || {};
  const selected = summary[period] || {};

  const periodOptions = [
    ["today", "Today"],
    ["last7Days", "Last 7 days"],
    ["last30Days", "Last 30 days"],
    ["last365Days", "Last 365 days"],
    ["allTime", "All time"],
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold">
            Affiliate sales overview
          </h3>

          <p className="mt-1 text-[11px] opacity-60">
            Real-time reporting for{" "}
            {user.name || "selected affiliate"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            dark={dark}
            disabled={loading}
            onClick={() => setRevision((v) => v + 1)}
          >
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </Button>

          <Button primary onClick={onTransactions}>
            <ReceiptText size={14} />
            Transactions
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 p-3 text-[12px] text-red-500">
          {error}

          <button
            type="button"
            className="ml-3 underline"
            onClick={() => setRevision((v) => v + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {loading && !dashboard ? (
        <Loading text="Loading affiliate sales..." />
      ) : dashboard ? (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Metric
              dark={dark}
              icon={ShoppingBag}
              label="All orders"
              value={count(summary.allTime?.totalOrders)}
            />

            <Metric
              dark={dark}
              icon={TrendingUp}
              label="Verified sales"
              value={money(
                summary.allTime?.successfulAmount
              )}
              description={`${count(
                summary.allTime?.successfulOrders
              )} verified orders`}
            />

            <Metric
              dark={dark}
              icon={Wallet}
              label="Earned commission"
              value={money(
                summary.allTime?.earnedCommission
              )}
            />

            <Metric
              dark={dark}
              icon={CheckCircle2}
              label="Success rate"
              value={`${Number(
                summary.allTime?.conversionRate || 0
              ).toFixed(1)}%`}
            />
          </div>

          <Panel
            dark={dark}
            title="Sales by period"
            subtitle="Verified orders and earnings"
            icon={CalendarDays}
            action={
              <select
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value)
                }
                className={`h-10 rounded-lg border px-3 text-[12px] ${
                  dark
                    ? "border-[#444] bg-[#242424]"
                    : "border-[#DDD] bg-white"
                }`}
              >
                {periodOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            }
          >
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              <Metric
                dark={dark}
                icon={TrendingUp}
                label="Sales amount"
                value={money(
                  selected.successfulAmount
                )}
              />

              <Metric
                dark={dark}
                icon={Wallet}
                label="Commission"
                value={money(
                  selected.earnedCommission
                )}
              />

              <Metric
                dark={dark}
                icon={ShoppingBag}
                label="Successful orders"
                value={count(
                  selected.successfulOrders
                )}
              />

              <Metric
                dark={dark}
                icon={AlertCircle}
                label="Failed orders"
                value={count(selected.failedOrders)}
              />
            </div>

            <div
              className={`mt-4 flex flex-wrap gap-x-6 gap-y-3 border-t pt-4 text-[11px] opacity-70 ${
                dark
                  ? "border-[#333]"
                  : "border-[#EEE]"
              }`}
            >
              <span>
                Total attempts:{" "}
                <b>{count(selected.totalOrders)}</b>
              </span>

              <span>
                Pending:{" "}
                <b>{count(selected.pendingOrders)}</b>
              </span>

              <span>
                Refunded:{" "}
                <b>{count(selected.refundedOrders)}</b>
              </span>

              <span>
                Remaining before fees:{" "}
                <b>{money(selected.remainingAmount)}</b>
              </span>
            </div>
          </Panel>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[14px] font-semibold">
              Sales trends
            </h3>

            <div className="flex gap-1 rounded-lg border border-[#888]/20 p-1">
              {[7, 30, 365].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setGraphDays(days)}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${
                    graphDays === days
                      ? "bg-[#F97316] text-white"
                      : "opacity-70"
                  }`}
                >
                  {days === 365
                    ? "1 year"
                    : `${days} days`}
                </button>
              ))}
            </div>
          </div>

          <SalesGraph
            graph={dashboard.graph}
            dark={dark}
          />

          <Panel
            dark={dark}
            title="Recent transactions"
            subtitle="Latest 15 attributed orders"
            icon={ReceiptText}
            action={
              <Button
                dark={dark}
                onClick={onTransactions}
              >
                View all
                <ArrowRight size={14} />
              </Button>
            }
          >
            <OrderRows
              dark={dark}
              orders={
                dashboard.recentOrders?.slice(0, 15) ||
                []
              }
            />
          </Panel>

          <Panel
            dark={dark}
            title="Affiliate configuration"
            icon={Handshake}
          >
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              <Detail
                label="Affiliate code"
                value={
                  dashboard.affiliate?.code ||
                  user.affiliate?.code
                }
              />

              <Detail
                label="Commission type"
                value={
                  dashboard.affiliate?.commissionType ||
                  user.affiliate?.commissionType
                }
              />

              <Detail
                label="Current rate"
                value={
                  dashboard.affiliate?.commissionType ===
                  "percentage"
                    ? `${dashboard.affiliate?.commissionValue}%`
                    : money(
                        dashboard.affiliate?.commissionValue
                      )
                }
              />

              <Detail
                label="Partner status"
                value={
                  dashboard.affiliate?.status ||
                  user.affiliate?.status
                }
              />
            </div>

            <p className="mt-5 text-[11px] opacity-60">
              Earned commissions include only eligible
              verified sales. These figures do not
              represent confirmed payouts.
            </p>
          </Panel>
        </>
      ) : null}
    </div>
  );
}

/* =========================================================
   ADMIN AFFILIATE TRANSACTIONS

   Existing API:
   GET /api/affiliate/orders

   userId identifies the selected affiliate.
   15 transactions per page.
========================================================= */

function AffiliateTransactions({
  user,
  apiConfig,
  dark,
}) {
  const [filters, setFilters] = useState({
    ...EMPTY_ORDER_FILTERS,
  });

  const [applied, setApplied] = useState({
    ...EMPTY_ORDER_FILTERS,
  });

  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?._id) return;

    const controller = new AbortController();

    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(
          API.orders,
          {
            ...apiConfig,
            signal: controller.signal,
            params: {
              userId: user._id,
              page,
              limit: DETAIL_PAGE_SIZE,
              status: applied.status,
              sort: applied.sort,
              startDate:
                applied.startDate || undefined,
              endDate:
                applied.endDate || undefined,
            },
          }
        );

        if (!data?.success || !data?.data) {
          throw new Error(
            data?.message ||
              "Unable to load transactions."
          );
        }

        setResult(data.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          setError(
            errorText(
              error,
              "Unable to load transactions."
            )
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchOrders();

    return () => controller.abort();
  }, [
    user?._id,
    apiConfig,
    page,
    applied,
    revision,
  ]);

  const applyFilters = () => {
    if (
      Boolean(filters.startDate) !==
      Boolean(filters.endDate)
    ) {
      toast.error("Select both dates or neither.");
      return;
    }

    if (
      filters.startDate &&
      filters.startDate > filters.endDate
    ) {
      toast.error(
        "Start date cannot be after end date."
      );
      return;
    }

    setPage(1);
    setApplied({ ...filters });
  };

  const clearFilters = () => {
    const defaults = { ...EMPTY_ORDER_FILTERS };

    setFilters(defaults);
    setApplied(defaults);
    setPage(1);
  };

  const inputClass = `h-10 w-full rounded-lg border px-3 text-[12px] outline-none focus:border-[#F97316] ${
    dark
      ? "border-[#444] bg-[#252525] text-white [color-scheme:dark]"
      : "border-[#DDD] bg-white text-[#222]"
  }`;

  const pagination = result?.pagination || {};
  const totals = result?.totals || {};

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold">
            Affiliate transactions
          </h3>

          <p className="mt-1 text-[11px] opacity-60">
            All attributed payments · 15 per page
          </p>
        </div>

        <Button
          dark={dark}
          disabled={loading}
          onClick={() => setRevision((v) => v + 1)}
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </Button>
      </div>

      <Panel
        title="Filter transactions"
        icon={Filter}
        dark={dark}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="text-[11px] font-medium">
            Status

            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
              className={`mt-2 ${inputClass}`}
            >
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="text-[11px] font-medium">
            Start date

            <input
              type="date"
              value={filters.startDate}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  startDate: event.target.value,
                }))
              }
              className={`mt-2 ${inputClass}`}
            />
          </label>

          <label className="text-[11px] font-medium">
            End date

            <input
              type="date"
              value={filters.endDate}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  endDate: event.target.value,
                }))
              }
              className={`mt-2 ${inputClass}`}
            />
          </label>

          <label className="text-[11px] font-medium">
            Sort

            <select
              value={filters.sort}
              onChange={(event) =>
                setFilters((previous) => ({
                  ...previous,
                  sort: event.target.value,
                }))
              }
              className={`mt-2 ${inputClass}`}
            >
              <option value="desc">
                Newest first
              </option>

              <option value="asc">
                Oldest first
              </option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button primary onClick={applyFilters}>
            <Filter size={14} />
            Apply filters
          </Button>

          <Button dark={dark} onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </Panel>

      {error && (
        <div className="rounded-lg border border-red-500/30 p-4 text-[12px] text-red-500">
          {error}

          <button
            type="button"
            className="ml-3 underline"
            onClick={() => setRevision((v) => v + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {result && (
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Metric
            dark={dark}
            icon={ShoppingBag}
            label="Matching orders"
            value={count(totals.totalOrders)}
          />

          <Metric
            dark={dark}
            icon={TrendingUp}
            label="Verified sales"
            value={money(
              totals.successfulAmount
            )}
          />

          <Metric
            dark={dark}
            icon={Wallet}
            label="Earned commission"
            value={money(
              totals.earnedCommission
            )}
          />

          <Metric
            dark={dark}
            icon={AlertCircle}
            label="Failed orders"
            value={count(totals.failedOrders)}
          />
        </div>
      )}

      <Panel
        dark={dark}
        title="Transaction history"
        subtitle="No customer personal information is displayed"
        icon={ReceiptText}
      >
        {loading ? (
          <Loading text="Loading transactions..." />
        ) : error && !result ? (
          <Empty dark={dark}>
            Transactions could not be loaded.
          </Empty>
        ) : (
          <div className="space-y-5">
            <OrderRows
              orders={result?.orders || []}
              dark={dark}
            />

            <Pager
              page={Number(pagination.page) || page}
              pages={Number(pagination.pages) || 1}
              total={Number(pagination.total) || 0}
              onChange={setPage}
              dark={dark}
              disabled={loading}
            />
          </div>
        )}
      </Panel>
    </div>
  );
}

/* =========================================================
   USER ACTIVITIES

   Existing admin endpoint.
========================================================= */

function UserActivities({
  user,
  apiConfig,
  dark,
}) {
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);

  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await axios.get(
          `${API.users}/${user._id}/activities`,
          {
            ...apiConfig,
            signal: controller.signal,
            params: {
              page,
              limit: DETAIL_PAGE_SIZE,
            },
          }
        );

        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Unable to retrieve activities."
          );
        }

        setActivities(
          data.activities ??
            data.data?.activities ??
            []
        );

        setPagination(
          data.pagination ??
            data.data?.pagination ??
            {}
        );
      } catch (error) {
        if (!axios.isCancel(error)) {
          setError(
            errorText(
              error,
              "Unable to load activities."
            )
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => controller.abort();
  }, [user._id, apiConfig, page, revision]);

  return (
    <Panel
      dark={dark}
      title="Account activities"
      subtitle="Login, security and account events"
      icon={Activity}
      action={
        <Button
          dark={dark}
          disabled={loading}
          onClick={() => setRevision((v) => v + 1)}
        >
          <RefreshCw size={14} />
          Refresh
        </Button>
      }
    >
      {error && (
        <p className="mb-4 text-[12px] text-red-500">
          {error}
        </p>
      )}

      {loading ? (
        <Loading text="Loading activities..." />
      ) : !activities.length ? (
        <Empty dark={dark}>
          No account activities found.
        </Empty>
      ) : (
        <div className="space-y-2">
          {activities.map((item, index) => (
            <div
              key={item._id || index}
              className={`flex gap-3 rounded-lg border p-4 ${
                dark
                  ? "border-[#343434] bg-[#222]"
                  : "border-[#EEE] bg-[#FAFAFA]"
              }`}
            >
              <Activity
                size={17}
                className="mt-0.5 shrink-0 text-[#F97316]"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="break-words text-[12px] font-semibold">
                    {String(
                      item.action || "Account activity"
                    ).replace(/_/g, " ")}
                  </p>

                  <p className="text-[10px] opacity-55">
                    {dateText(
                      item.createdAt || item.timestamp,
                      true
                    )}
                  </p>
                </div>

                {item.result && (
                  <p className="mt-1 text-[11px] opacity-65">
                    Result: {item.result}
                  </p>
                )}

                {item.ipAddress && (
                  <p className="mt-1 text-[11px] opacity-65">
                    IP: {item.ipAddress}
                  </p>
                )}
              </div>
            </div>
          ))}

          <div className="pt-4">
            <Pager
              page={page}
              pages={Number(pagination.pages) || 1}
              total={Number(pagination.total) || 0}
              onChange={setPage}
              dark={dark}
              disabled={loading}
            />
          </div>
        </div>
      )}
    </Panel>
  );
}

/* =========================================================
   DEVICE MANAGEMENT

   Uses existing admin session endpoints.

   IMPORTANT:
   The backend must implement these exact routes.

   Single-device logout must revoke sessionId,
   not MongoDB's document _id.
========================================================= */

function UserDevices({
  user,
  apiConfig,
  dark,
  currentUserId,
}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState("");

  const [confirmation, setConfirmation] =
    useState(null);

  const self = isSelf(user, currentUserId);

  const base = `${API.users}/${user._id}`;

  const loadSessions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get(
        `${base}/sessions`,
        apiConfig
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to retrieve devices."
        );
      }

      const list =
        data.sessions ?? data.data?.sessions;

      if (!Array.isArray(list)) {
        throw new Error(
          "Unexpected sessions response."
        );
      }

      setSessions(list);
    } catch (error) {
      setError(
        errorText(
          error,
          "Unable to load active devices."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [base, apiConfig]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions, revision]);

  const revokeSessions = async () => {
    if (!confirmation || busy || self) return;

    const selected = confirmation;

    setBusy(true);

    try {
      const endpoint = selected.all
        ? `${base}/logout-all`
        : `${base}/sessions/${encodeURIComponent(
            selected.sessionId
          )}/revoke`;

      const { data } = await axios.post(
        endpoint,
        {},
        apiConfig
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Session revocation failed."
        );
      }

      toast.success(
        data.message ||
          (selected.all
            ? "All devices logged out."
            : "Device logged out.")
      );

      setConfirmation(null);
      setRevision((value) => value + 1);
    } catch (error) {
      if (error?.response?.status === 404) {
        toast.error(
          "Logout endpoint not found (404). Check the backend session route."
        );
      } else {
        toast.error(
          errorText(
            error,
            "Unable to revoke device session."
          )
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const getDeviceName = (session) => {
    const device = session.device || {};

    if (typeof device === "string") {
      return device;
    }

    return (
      device.deviceName ||
      device.browser ||
      device.userAgent ||
      "Unknown device"
    );
  };

  return (
    <div className="space-y-4">
      <Panel
        dark={dark}
        title="Active devices"
        subtitle="View and revoke user sessions"
        icon={MonitorSmartphone}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              dark={dark}
              disabled={loading || busy}
              onClick={() =>
                setRevision((value) => value + 1)
              }
            >
              <RefreshCw size={14} />
              Refresh
            </Button>

            <Button
              danger
              disabled={busy || self}
              onClick={() =>
                setConfirmation({ all: true })
              }
            >
              <LogOut size={14} />
              Logout all
            </Button>
          </div>
        }
      >
        <p className="mb-4 text-[11px] opacity-65">
          Session revocation takes effect on the
          user's next authenticated request.
        </p>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 p-3 text-[12px] text-red-500">
            {error}
          </div>
        )}

        {loading ? (
          <Loading text="Loading devices..." />
        ) : !sessions.length ? (
          <Empty dark={dark}>
            No active sessions found.
          </Empty>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => {
              const name = getDeviceName(session);

              const DeviceIcon =
                /mobile|android|iphone/i.test(name)
                  ? Smartphone
                  : Laptop;

              return (
                <div
                  key={session.sessionId || index}
                  className={`flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
                    dark
                      ? "border-[#343434] bg-[#222]"
                      : "border-[#E8E8E8] bg-[#FAFAFA]"
                  }`}
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F97316]/10">
                      <DeviceIcon
                        size={19}
                        className="text-[#F97316]"
                      />
                    </span>

                    <div className="min-w-0">
                      <p className="break-words text-[12px] font-semibold">
                        {name}
                      </p>

                      <p className="mt-2 text-[11px] opacity-65">
                        Last active:{" "}
                        {dateText(
                          session.lastActiveAt,
                          true
                        )}
                      </p>

                      <p className="mt-1 text-[11px] opacity-65">
                        Login IP:{" "}
                        {session.ipAddress || "Unknown"}
                      </p>

                      <p className="mt-1 text-[11px] opacity-65">
                        Expires:{" "}
                        {dateText(
                          session.expiresAt,
                          true
                        )}
                      </p>
                    </div>
                  </div>

                  <Button
                    danger
                    disabled={
                      busy ||
                      self ||
                      !session.sessionId
                    }
                    onClick={() =>
                      setConfirmation({
                        all: false,
                        sessionId: session.sessionId,
                        deviceName: name,
                      })
                    }
                  >
                    <LogOut size={14} />
                    Logout device
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {confirmation && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <h4 className="text-[13px] font-semibold">
            {confirmation.all
              ? "Log out all devices?"
              : `Log out ${confirmation.deviceName}?`}
          </h4>

          <p className="mt-2 text-[11px] opacity-65">
            This will revoke access on the server.
            Continue only if you want to end the
            selected session or sessions.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              dark={dark}
              disabled={busy}
              onClick={() => setConfirmation(null)}
            >
              Cancel
            </Button>

            <Button
              danger
              disabled={busy}
              onClick={revokeSessions}
            >
              {busy ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <LogOut size={15} />
              )}

              Confirm logout
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   USER DETAILS MODAL

   TABS:
   - Activities
   - Active Devices
   - Sales
   - Transactions
========================================================= */

function UserDetails({
  user,
  apiConfig,
  dark,
  currentUserId,
}) {
  const [tab, setTab] = useState("activities");

  const tabs = [
    {
      key: "activities",
      label: "Activities",
      icon: Activity,
    },
    {
      key: "devices",
      label: "Active Devices",
      icon: MonitorSmartphone,
    },
    ...(user.role === "affiliate"
      ? [
          {
            key: "sales",
            label: "Sales",
            icon: BarChart3,
          },
          {
            key: "transactions",
            label: "Transactions",
            icon: ReceiptText,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-xl font-bold text-white">
          {initials(user.name)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="break-words text-[17px] font-semibold">
            {user.name}
          </h3>

          <p className="mt-1 break-all text-[12px] opacity-65">
            {user.email}
          </p>

          <p className="mt-1 text-[11px] text-[#F97316]">
            {roleLabel(user.role)}
          </p>
        </div>

        <Badge
          value={user.status}
          dark={dark}
        />
      </div>

      <div
        className={`grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4 ${
          dark
            ? "border-[#343434] bg-[#222]"
            : "border-[#EEE] bg-[#FAFAFA]"
        }`}
      >
        <Detail label="Role" value={roleLabel(user.role)} />

        <Detail
          label="Mobile"
          value={user.mobile || "Not provided"}
        />

        <Detail
          label="Joined"
          value={dateText(user.createdAt)}
        />

        <Detail
          label="Last login"
          value={dateText(user.lastLoginAt, true)}
        />
      </div>

      {user.role === "affiliate" && (
        <div
          className={`grid grid-cols-2 gap-4 rounded-xl border p-4 sm:grid-cols-4 ${
            dark
              ? "border-[#543722] bg-[#241C17]"
              : "border-[#F6DBC6] bg-[#FFF7F1]"
          }`}
        >
          <Detail
            label="Affiliate code"
            value={user.affiliate?.code || "—"}
          />

          <Detail
            label="Commission type"
            value={
              user.affiliate?.commissionType || "—"
            }
          />

          <Detail
            label="Commission value"
            value={
              user.affiliate?.commissionType ===
              "percentage"
                ? `${user.affiliate?.commissionValue}%`
                : money(
                    user.affiliate?.commissionValue
                  )
            }
          />

          <Detail
            label="Affiliate status"
            value={user.affiliate?.status || "—"}
          />
        </div>
      )}

      <div
        className={`flex flex-wrap gap-1 rounded-xl border p-1 ${
          dark
            ? "border-[#343434] bg-[#222]"
            : "border-[#EEE] bg-[#FAFAFA]"
        }`}
        role="tablist"
        aria-label="User details"
      >
        {tabs.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={tab === item.key}
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[11px] font-semibold transition-colors ${
                tab === item.key
                  ? "bg-[#F97316] text-white"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "activities" && (
        <UserActivities
          user={user}
          apiConfig={apiConfig}
          dark={dark}
        />
      )}

      {tab === "devices" && (
        <UserDevices
          user={user}
          apiConfig={apiConfig}
          dark={dark}
          currentUserId={currentUserId}
        />
      )}

      {tab === "sales" &&
        user.role === "affiliate" && (
          <AffiliateSales
            user={user}
            apiConfig={apiConfig}
            dark={dark}
            onTransactions={() =>
              setTab("transactions")
            }
          />
        )}

      {tab === "transactions" &&
        user.role === "affiliate" && (
          <AffiliateTransactions
            user={user}
            apiConfig={apiConfig}
            dark={dark}
          />
        )}
    </div>
  );
}

/* =========================================================
   EDIT USER FORM

   Existing PATCH /api/admin/users/:userId
========================================================= */

function UserEditForm({
  user,
  onSave,
  onCancel,
  dark,
  saving,
}) {
  const [form, setForm] = useState(() => ({
    name: user.name || "",
    email: user.email || "",
    mobile: user.mobile || "",
    role: user.role || "normal",
    affiliate: {
      code: user.affiliate?.code || "",
      commissionType:
        user.affiliate?.commissionType ||
        "percentage",
      commissionValue:
        user.affiliate?.commissionValue ?? 10,
      status:
        user.affiliate?.status || "active",
    },
  }));

  const inputClass = `mt-2 h-11 w-full rounded-lg border px-3 text-[12px] outline-none focus:border-[#F97316] ${
    dark
      ? "border-[#444] bg-[#242424] text-white"
      : "border-[#DDD] bg-white text-[#222]"
  }`;

  const update = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const updateAffiliate = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      affiliate: {
        ...previous.affiliate,
        [name]:
          name === "code"
            ? value.toUpperCase().replace(/\s/g, "")
            : value,
      },
    }));
  };

  const submit = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const mobile = form.mobile.trim();

    if (name.length < 2 || name.length > 100) {
      return toast.error(
        "Name must contain 2–100 characters."
      );
    }

    if (!isValidEmail(email)) {
      return toast.error(
        "Please enter a valid email."
      );
    }

    if (
      (form.role !== "admin" && !isValidMobile(mobile)) ||
      (mobile && !isValidMobile(mobile))
    ) {
      return toast.error(
        "Enter a valid 10-digit mobile number."
      );
    }

    const body = {
      name,
      email,
      mobile: mobile || null,
      role: form.role,
    };

    if (form.role === "affiliate") {
      const code = form.affiliate.code
        .trim()
        .toUpperCase();

      const commissionValue = Number(
        form.affiliate.commissionValue
      );

      if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
        return toast.error(
          "Affiliate code must contain 3–30 valid characters."
        );
      }

      if (
        !Number.isFinite(commissionValue) ||
        commissionValue <= 0 ||
        (form.affiliate.commissionType ===
          "percentage" &&
          commissionValue > 100)
      ) {
        return toast.error(
          "Invalid affiliate commission value."
        );
      }

      body.affiliate = {
        code,
        commissionType:
          form.affiliate.commissionType,
        commissionValue,
        status: form.affiliate.status,
      };
    } else if (user.role === "affiliate") {
      body.affiliate = null;
    }

    onSave(body);
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["name", "Full name"],
          ["email", "Email address"],
          ["mobile", "Mobile number"],
        ].map(([name, label]) => (
          <label
            key={name}
            className="block text-[12px] font-semibold"
          >
            {label}

            <input
              name={name}
              type={
                name === "email" ? "email" : "text"
              }
              value={form[name]}
              onChange={update}
              disabled={saving}
              className={inputClass}
            />
          </label>
        ))}

        <label className="text-[12px] font-semibold">
          User role

          <select
            name="role"
            value={form.role}
            onChange={update}
            disabled={saving}
            className={inputClass}
          >
            {ROLES.map((role) => (
              <option
                key={role.value}
                value={role.value}
              >
                {role.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {form.role === "affiliate" && (
        <div
          className={`space-y-4 rounded-xl border p-4 ${
            dark
              ? "border-[#5A3923] bg-[#241B16]"
              : "border-[#F8D7BF] bg-[#FFF8F3]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Handshake
              size={17}
              className="text-[#F97316]"
            />

            <h4 className="text-[13px] font-semibold">
              Affiliate configuration
            </h4>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-[12px] font-semibold">
              Affiliate code

              <input
                name="code"
                value={form.affiliate.code}
                onChange={updateAffiliate}
                className={inputClass}
              />
            </label>

            <label className="text-[12px] font-semibold">
              Commission type

              <select
                name="commissionType"
                value={
                  form.affiliate.commissionType
                }
                onChange={updateAffiliate}
                className={inputClass}
              >
                <option value="percentage">
                  Percentage
                </option>

                <option value="fixed">
                  Fixed amount
                </option>
              </select>
            </label>

            <label className="text-[12px] font-semibold">
              Commission value

              <input
                type="number"
                name="commissionValue"
                min="0"
                step="0.01"
                value={
                  form.affiliate.commissionValue
                }
                onChange={updateAffiliate}
                className={inputClass}
              />
            </label>

            <label className="text-[12px] font-semibold">
              Affiliate status

              <select
                name="status"
                value={form.affiliate.status}
                onChange={updateAffiliate}
                className={inputClass}
              >
                <option value="active">
                  Active
                </option>

                <option value="inactive">
                  Inactive
                </option>
              </select>
            </label>
          </div>
        </div>
      )}

      <p className="text-[11px] opacity-60">
        Changing a user's email or role may
        invalidate their existing sessions.
      </p>

      <div className="flex flex-wrap gap-3">
        <Button
          dark={dark}
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          primary
          disabled={saving}
        >
          {saving ? (
            <Loader2
              size={15}
              className="animate-spin"
            />
          ) : (
            <Check size={15} />
          )}

          Save changes
        </Button>
      </div>
    </form>
  );
}

/* =========================================================
   MAIN USER MANAGEMENT
========================================================= */

export default function UserManagement() {
  const navigate = useNavigate();

  const token = useSelector(
    (state) => state.auth?.token
  );

  const authUser = useSelector(
    (state) => state.auth?.user
  );

  const currentUserId =
    authUser?._id ||
    authUser?.userId ||
    authUser?.id ||
    null;

  const theme = useTheme();
  const dark = theme === "dark";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [
    affiliateStatusFilter,
    setAffiliateStatusFilter,
  ] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: USER_PAGE_SIZE,
    total: 0,
    pages: 1,
  });

  const [modal, setModal] = useState(null);
  const [selectedUser, setSelectedUser] =
    useState(null);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [busy, setBusy] = useState(false);
  const [statusReason, setStatusReason] =
    useState("");

  const apiConfig = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
      timeout: 20000,
    }),
    [token]
  );

  const surface = dark
    ? "border-[#343434] bg-[#181818]"
    : "border-[#E8E8E8] bg-white";

  const inputClass = `h-11 w-full rounded-lg border px-3 text-[12px] outline-none focus:border-[#F97316] ${
    dark
      ? "border-[#444] bg-[#242424] text-white"
      : "border-[#DDD] bg-white text-[#222]"
  }`;

  /* =====================================================
     FETCH USERS
  ===================================================== */

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError(
        "Administrator authentication required."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {
        page,
        limit: USER_PAGE_SIZE,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (affiliateStatusFilter) {
        params.affiliateStatus =
          affiliateStatusFilter;
      }

      const { data } = await axios.get(
        API.users,
        {
          ...apiConfig,
          params,
        }
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to retrieve users."
        );
      }

      setUsers(
        Array.isArray(data.users)
          ? data.users
          : []
      );

      setPagination({
        page: Number(
          data.pagination?.page || page
        ),
        limit: Number(
          data.pagination?.limit ||
            USER_PAGE_SIZE
        ),
        total: Number(
          data.pagination?.total || 0
        ),
        pages: Math.max(
          1,
          Number(data.pagination?.pages || 1)
        ),
      });
    } catch (error) {
      setUsers([]);

      setError(
        errorText(error, "Unable to load users.")
      );
    } finally {
      setLoading(false);
    }
  }, [
    token,
    apiConfig,
    page,
    search,
    roleFilter,
    statusFilter,
    affiliateStatusFilter,
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* =====================================================
     OPEN DETAILS OR EDIT
  ===================================================== */

  const openUser = async (user, type = "view") => {
    setSelectedUser(user);
    setModal({ type, user });
    setDetailLoading(true);

    try {
      const { data } = await axios.get(
        `${API.users}/${user._id}`,
        apiConfig
      );

      if (data?.success && data?.user) {
        setSelectedUser(data.user);
      }
    } catch (error) {
      toast.error(
        errorText(
          error,
          "Unable to load full user details."
        )
      );
    } finally {
      setDetailLoading(false);
    }
  };

  /* =====================================================
     UPDATE USER
  ===================================================== */

  const saveUser = async (body) => {
    if (!selectedUser || busy) return;

    setBusy(true);

    try {
      const { data } = await axios.patch(
        `${API.users}/${selectedUser._id}`,
        body,
        apiConfig
      );

      if (!data?.success) {
        throw new Error(
          data?.message || "Update failed."
        );
      }

      toast.success(
        data.message || "User updated."
      );

      setModal(null);
      setSelectedUser(null);

      await fetchUsers();
    } catch (error) {
      toast.error(
        errorText(
          error,
          "Unable to update user."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /* =====================================================
     STATUS CHANGE
  ===================================================== */

  const updateStatus = async () => {
    if (!modal?.user || busy) return;

    if (isSelf(modal.user, currentUserId)) {
      return toast.error(
        "You cannot change your own status."
      );
    }

    setBusy(true);

    try {
      const { data } = await axios.patch(
        `${API.users}/${modal.user._id}/status`,
        {
          status: modal.nextStatus,
          reason: statusReason.trim() || undefined,
        },
        apiConfig
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to update status."
        );
      }

      toast.success(
        data.message || "Status updated."
      );

      setModal(null);
      setStatusReason("");

      await fetchUsers();
    } catch (error) {
      toast.error(
        errorText(
          error,
          "Unable to change user status."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /* =====================================================
     AFFILIATE STATUS
  ===================================================== */

  const updateAffiliateStatus = async () => {
    if (!modal?.user || busy) return;

    setBusy(true);

    try {
      const { data } = await axios.patch(
        `${API.users}/${modal.user._id}/affiliate/status`,
        {
          status: modal.nextStatus,
        },
        apiConfig
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to update affiliate status."
        );
      }

      toast.success(
        data.message ||
          "Affiliate status updated."
      );

      setModal(null);
      await fetchUsers();
    } catch (error) {
      toast.error(
        errorText(
          error,
          "Unable to update affiliate status."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /* =====================================================
     PASSWORD LINK
  ===================================================== */

  const sendPasswordLink = async () => {
    if (!modal?.user || busy) return;

    setBusy(true);

    try {
      const { data } = await axios.post(
        `${API.users}/${modal.user._id}/password-link`,
        {},
        apiConfig
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to send password link."
        );
      }

      toast.success(
        data.message ||
          "Password link sent."
      );

      setModal(null);
    } catch (error) {
      toast.error(
        errorText(
          error,
          "Unable to send password link."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /* =====================================================
     LOGOUT ALL — USER ACTIONS
  ===================================================== */

  const logoutAll = async () => {
    if (!modal?.user || busy) return;

    if (isSelf(modal.user, currentUserId)) {
      return toast.error(
        "Cannot revoke your own admin sessions here."
      );
    }

    setBusy(true);

    try {
      const { data } = await axios.post(
        `${API.users}/${modal.user._id}/logout-all`,
        {},
        apiConfig
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to revoke sessions."
        );
      }

      toast.success(
        data.message ||
          "All user sessions revoked."
      );

      setModal(null);
    } catch (error) {
      toast.error(
        errorText(
          error,
          "Unable to log out all sessions."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /* =====================================================
     SOFT DELETE
  ===================================================== */

  const deleteUser = async () => {
    if (!modal?.user || busy) return;

    if (isSelf(modal.user, currentUserId)) {
      return toast.error(
        "You cannot delete your own account."
      );
    }

    setBusy(true);

    try {
      const { data } = await axios.delete(
        `${API.users}/${modal.user._id}`,
        apiConfig
      );

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Unable to delete user."
        );
      }

      toast.success(
        data.message || "User deleted."
      );

      setModal(null);

      if (users.length === 1 && page > 1) {
        setPage((value) => value - 1);
      } else {
        await fetchUsers();
      }
    } catch (error) {
      toast.error(
        errorText(
          error,
          "Unable to delete user."
        )
      );
    } finally {
      setBusy(false);
    }
  };

  /* =====================================================
     STATS
  ===================================================== */

  const stats = useMemo(
    () => ({
      displayed: users.length,
      active: users.filter(
        (user) => user.status === "active"
      ).length,
      affiliates: users.filter(
        (user) => user.role === "affiliate"
      ).length,
      restricted: users.filter((user) =>
        [
          "inactive",
          "suspended",
          "blocked",
        ].includes(user.status)
      ).length,
    }),
    [users]
  );

  const resetFilters = () => {
    setSearchInput("");
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setAffiliateStatusFilter("");
    setPage(1);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      data-theme={theme}
      className={`mt-16 min-h-screen px-4 py-7 sm:px-6 lg:px-8 ${
        dark
          ? "bg-black text-white"
          : "bg-white text-[#171717]"
      }`}
    >
      <div className="mx-auto max-w-[1380px] space-y-6">
        {/* HEADER */}

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest opacity-65">
              <span className="h-2 w-2 rounded-full bg-[#F97316]" />
              Target Trek / Administration
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              User management
            </h1>

            <p className="mt-2 text-[12px] opacity-60">
              Manage users, affiliates, security,
              transactions and sales.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              dark={dark}
              disabled={loading}
              onClick={fetchUsers}
            >
              <RefreshCw size={15} />
              Refresh
            </Button>

            <Button
              primary
              onClick={() =>
                navigate(CREATE_USER_ROUTE)
              }
            >
              <Plus size={15} />
              Add user
            </Button>
          </div>
        </div>

        {/* PAGE STATS */}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric
            dark={dark}
            icon={Users}
            label="Displayed users"
            value={stats.displayed}
            description="Current page"
            onClick={resetFilters}
          />

          <Metric
            dark={dark}
            icon={CheckCircle2}
            label="Active users"
            value={stats.active}
            description="Current page"
            onClick={() => {
              setStatusFilter("active");
              setPage(1);
            }}
          />

          <Metric
            dark={dark}
            icon={Handshake}
            label="Affiliates"
            value={stats.affiliates}
            description="Current page"
            onClick={() => {
              setRoleFilter("affiliate");
              setPage(1);
            }}
          />

          <Metric
            dark={dark}
            icon={Shield}
            label="Restricted users"
            value={stats.restricted}
            description="Current page"
            onClick={() => {
              setStatusFilter("blocked");
              setPage(1);
            }}
          />
        </div>

        {/* FILTERS */}

        <Panel
          dark={dark}
          title="Find and filter users"
          icon={SlidersHorizontal}
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.7fr)_repeat(3,minmax(130px,1fr))]">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-50"
              />

              <input
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                placeholder="Search name, email, mobile, affiliate code..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setAffiliateStatusFilter("");
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">All roles</option>

              {ROLES.map((role) => (
                <option
                  key={role.value}
                  value={role.value}
                >
                  {role.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">
                All account statuses
              </option>

              {STATUSES.map((status) => (
                <option
                  key={status.value}
                  value={status.value}
                >
                  {status.label}
                </option>
              ))}
            </select>

            <select
              value={affiliateStatusFilter}
              onChange={(event) => {
                setAffiliateStatusFilter(
                  event.target.value
                );
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">
                All affiliate statuses
              </option>

              <option value="active">
                Active affiliate
              </option>

              <option value="inactive">
                Inactive affiliate
              </option>
            </select>
          </div>

          <div className="mt-3 flex justify-end">
            <Button
              dark={dark}
              onClick={resetFilters}
            >
              <X size={14} />
              Clear filters
            </Button>
          </div>
        </Panel>

        {/* USERS LIST */}

        <Panel
          dark={dark}
          title="Users"
          subtitle={`${count(
            pagination.total
          )} matching users`}
          icon={Users}
        >
          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 p-4 text-[12px] text-red-500">
              {error}

              <button
                className="ml-3 underline"
                onClick={fetchUsers}
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <Loading text="Loading users..." />
          ) : !users.length ? (
            <Empty dark={dark}>
              No users found.
            </Empty>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-[#888]/20 text-[11px] opacity-60">
                      <th className="pb-4 pr-4 font-medium">
                        User
                      </th>

                      <th className="pb-4 pr-4 font-medium">
                        Role
                      </th>

                      <th className="pb-4 pr-4 font-medium">
                        Status
                      </th>

                      <th className="pb-4 pr-4 font-medium">
                        Affiliate
                      </th>

                      <th className="pb-4 pr-4 font-medium">
                        Joined
                      </th>

                      <th className="pb-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-[#888]/15"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F97316]/15 text-[12px] font-bold text-[#F97316]">
                              {initials(user.name)}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold">
                                {user.name}
                              </p>

                              <p className="mt-1 max-w-[230px] truncate text-[11px] opacity-60">
                                {user.email}
                              </p>

                              {user.mobile && (
                                <p className="mt-1 text-[10px] opacity-55">
                                  {user.mobile}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 pr-4">
                          {roleLabel(user.role)}
                        </td>

                        <td className="py-4 pr-4">
                          <Badge
                            value={user.status}
                            dark={dark}
                          />
                        </td>

                        <td className="py-4 pr-4">
                          {user.role === "affiliate" ? (
                            <div>
                              <p className="font-mono font-semibold text-[#F97316]">
                                {user.affiliate?.code || "—"}
                              </p>

                              <p className="mt-1 text-[10px] opacity-60">
                                {user.affiliate?.commissionType ===
                                "percentage"
                                  ? `${user.affiliate?.commissionValue}%`
                                  : money(
                                      user.affiliate?.commissionValue
                                    )}
                              </p>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>

                        <td className="py-4 pr-4 text-[11px]">
                          {dateText(user.createdAt)}
                        </td>

                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              dark={dark}
                              onClick={() =>
                                openUser(user, "view")
                              }
                            >
                              <Eye size={14} />
                              View
                            </Button>

                            <Button
                              dark={dark}
                              onClick={() =>
                                openUser(user, "edit")
                              }
                            >
                              <Edit3 size={14} />
                              Edit
                            </Button>

                            <Button
                              dark={dark}
                              onClick={() =>
                                setModal({
                                  type: "more",
                                  user,
                                })
                              }
                            >
                              <MoreHorizontal size={16} />
                              More
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-5">
                <Pager
                  page={pagination.page}
                  pages={pagination.pages}
                  total={pagination.total}
                  onChange={setPage}
                  dark={dark}
                  disabled={loading}
                />
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* ============================================
          VIEW MODAL
      ============================================ */}

      {modal?.type === "view" && (
        <Modal
          dark={dark}
          title="User details"
          subtitle="Profile, security, sales and transactions"
          onClose={() => setModal(null)}
          width="max-w-[1100px]"
        >
          {detailLoading && !selectedUser ? (
            <Loading text="Loading user..." />
          ) : selectedUser ? (
            <UserDetails
              key={selectedUser._id}
              user={selectedUser}
              apiConfig={apiConfig}
              dark={dark}
              currentUserId={currentUserId}
            />
          ) : (
            <Empty dark={dark}>
              Unable to load user details.
            </Empty>
          )}
        </Modal>
      )}

      {/* ============================================
          EDIT MODAL
      ============================================ */}

      {modal?.type === "edit" && (
        <Modal
          dark={dark}
          title="Edit user"
          subtitle={modal.user.name}
          onClose={() => {
            if (!busy) setModal(null);
          }}
          width="max-w-[650px]"
          busy={busy}
        >
          {detailLoading ? (
            <Loading text="Loading user..." />
          ) : selectedUser ? (
            <UserEditForm
              key={selectedUser._id}
              user={selectedUser}
              onSave={saveUser}
              onCancel={() => setModal(null)}
              dark={dark}
              saving={busy}
            />
          ) : null}
        </Modal>
      )}

      {/* ============================================
          MORE ACTIONS MODAL
      ============================================ */}

      {modal?.type === "more" && (
        <Modal
          dark={dark}
          title="More user actions"
          subtitle={modal.user.name}
          onClose={() => setModal(null)}
          width="max-w-[560px]"
          busy={busy}
        >
          <div className="space-y-3">
            <Panel
              dark={dark}
              title="Account access"
              icon={Shield}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {STATUSES.map((status) => (
                  <Button
                    key={status.value}
                    dark={dark}
                    disabled={
                      isSelf(
                        modal.user,
                        currentUserId
                      ) ||
                      modal.user.status ===
                        status.value
                    }
                    onClick={() => {
                      setStatusReason("");
                      setModal({
                        type: "status",
                        user: modal.user,
                        nextStatus: status.value,
                      });
                    }}
                  >
                    {status.value === "blocked" ? (
                      <Ban size={14} />
                    ) : (
                      <Shield size={14} />
                    )}

                    Set {status.label}
                  </Button>
                ))}
              </div>
            </Panel>

            {modal.user.role === "affiliate" && (
              <Panel
                dark={dark}
                title="Affiliate status"
                icon={Handshake}
              >
                <div className="flex flex-wrap gap-2">
                  {["active", "inactive"].map(
                    (status) => (
                      <Button
                        key={status}
                        dark={dark}
                        onClick={() =>
                          setModal({
                            type: "affiliate-status",
                            user: modal.user,
                            nextStatus: status,
                          })
                        }
                      >
                        Set {status}
                      </Button>
                    )
                  )}
                </div>
              </Panel>
            )}

            <Panel
              dark={dark}
              title="Security actions"
              icon={KeyRound}
            >
              <div className="flex flex-wrap gap-2">
                <Button
                  dark={dark}
                  onClick={() =>
                    setModal({
                      type: "password",
                      user: modal.user,
                    })
                  }
                >
                  <KeyRound size={14} />
                  Send password link
                </Button>

                <Button
                  danger
                  disabled={isSelf(
                    modal.user,
                    currentUserId
                  )}
                  onClick={() =>
                    setModal({
                      type: "logout-all",
                      user: modal.user,
                    })
                  }
                >
                  <LogOut size={14} />
                  Logout all devices
                </Button>
              </div>
            </Panel>

            <Panel
              dark={dark}
              title="Danger zone"
              icon={Trash2}
            >
              <Button
                danger
                disabled={isSelf(
                  modal.user,
                  currentUserId
                )}
                onClick={() =>
                  setModal({
                    type: "delete",
                    user: modal.user,
                  })
                }
              >
                <Trash2 size={14} />
                Delete user
              </Button>
            </Panel>
          </div>
        </Modal>
      )}

      {/* ============================================
          STATUS CONFIRMATION
      ============================================ */}

      {modal?.type === "status" && (
        <Modal
          dark={dark}
          title="Change account status"
          subtitle={`${modal.user.name} → ${modal.nextStatus}`}
          onClose={() => setModal(null)}
          width="max-w-[500px]"
          busy={busy}
        >
          <div className="space-y-4">
            <p className="text-[12px] opacity-70">
              Confirm changing this user's account
              status.
            </p>

            <label className="block text-[12px] font-semibold">
              Reason (optional)

              <textarea
                value={statusReason}
                onChange={(event) =>
                  setStatusReason(event.target.value)
                }
                rows={3}
                className={`mt-2 w-full rounded-lg border p-3 text-[12px] outline-none focus:border-[#F97316] ${
                  dark
                    ? "border-[#444] bg-[#242424]"
                    : "border-[#DDD] bg-white"
                }`}
              />
            </label>

            <div className="flex gap-2">
              <Button
                dark={dark}
                disabled={busy}
                onClick={() => setModal(null)}
              >
                Cancel
              </Button>

              <Button
                primary
                disabled={busy}
                onClick={updateStatus}
              >
                {busy && (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                )}
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================
          AFFILIATE STATUS CONFIRMATION
      ============================================ */}

      {modal?.type === "affiliate-status" && (
        <Modal
          dark={dark}
          title="Update affiliate status"
          subtitle={modal.user.name}
          onClose={() => setModal(null)}
          width="max-w-[500px]"
          busy={busy}
        >
          <p className="mb-5 text-[12px]">
            Change affiliate partnership status to{" "}
            <b>{modal.nextStatus}</b>?
          </p>

          <div className="flex gap-2">
            <Button
              dark={dark}
              onClick={() => setModal(null)}
              disabled={busy}
            >
              Cancel
            </Button>

            <Button
              primary
              disabled={busy}
              onClick={updateAffiliateStatus}
            >
              Confirm update
            </Button>
          </div>
        </Modal>
      )}

      {/* ============================================
          PASSWORD LINK CONFIRMATION
      ============================================ */}

      {modal?.type === "password" && (
        <Modal
          dark={dark}
          title="Send password link"
          subtitle={modal.user.email}
          onClose={() => setModal(null)}
          width="max-w-[500px]"
          busy={busy}
        >
          <p className="mb-5 text-[12px]">
            Send a password setup/reset email to
            this user?
          </p>

          <div className="flex gap-2">
            <Button
              dark={dark}
              disabled={busy}
              onClick={() => setModal(null)}
            >
              Cancel
            </Button>

            <Button
              primary
              disabled={busy}
              onClick={sendPasswordLink}
            >
              Send link
            </Button>
          </div>
        </Modal>
      )}

      {/* ============================================
          LOGOUT ALL CONFIRMATION
      ============================================ */}

      {modal?.type === "logout-all" && (
        <Modal
          dark={dark}
          title="Log out all devices"
          subtitle={modal.user.name}
          onClose={() => setModal(null)}
          width="max-w-[500px]"
          busy={busy}
        >
          <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/5 p-4">
            <LogOut
              size={20}
              className="text-red-500"
            />

            <p className="mt-3 text-[12px]">
              All sessions for this user will be
              revoked. They must authenticate again
              to access protected resources.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              dark={dark}
              disabled={busy}
              onClick={() => setModal(null)}
            >
              Cancel
            </Button>

            <Button
              danger
              disabled={busy}
              onClick={logoutAll}
            >
              {busy && (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              )}

              Confirm logout
            </Button>
          </div>
        </Modal>
      )}

      {/* ============================================
          DELETE CONFIRMATION
      ============================================ */}

      {modal?.type === "delete" && (
        <Modal
          dark={dark}
          title="Delete user"
          subtitle={modal.user.name}
          onClose={() => setModal(null)}
          width="max-w-[500px]"
          busy={busy}
        >
          <p className="mb-5 text-[12px]">
            Are you sure you want to delete this
            user? This action invokes your existing
            admin soft-delete endpoint.
          </p>

          <div className="flex gap-2">
            <Button
              dark={dark}
              disabled={busy}
              onClick={() => setModal(null)}
            >
              Cancel
            </Button>

            <Button
              danger
              disabled={busy}
              onClick={deleteUser}
            >
              <Trash2 size={14} />
              Delete user
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
