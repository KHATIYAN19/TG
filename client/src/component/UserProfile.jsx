import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  Activity, AlertCircle, ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2,
  ChevronLeft, ChevronRight, Clock3, Copy, Eye, EyeOff, Handshake,
  IndianRupee, KeyRound, LayoutDashboard, Loader2, LockKeyhole, Mail,
  MonitorSmartphone, Percent, Phone, RefreshCw, Search, ShieldCheck,
  ShoppingBag, SlidersHorizontal, Sparkles, TrendingUp, UserRound, Wallet, X,
  BarChart3, ReceiptText, Filter, CalendarRange, ExternalLink
} from "lucide-react";
import BASE_URL from "../utils/Url";

const ROOT = String(BASE_URL).replace(/\/$/, "");
const API = {
  me: `${ROOT}/api/auth/me`,
  password: `${ROOT}/api/auth/change-password`,
  activities: `${ROOT}/api/users/activities`, // Switch to /api/auth/activities if your self-activity route is mounted there.
  dashboard: `${ROOT}/api/affiliate/dashboard`,
  orders: `${ROOT}/api/affiliate/orders`,
};
const LOGIN_ROUTE = "/admin/login";
const ORANGE = "#F97316";
const TABS = [
  { key: "profile", label: "My Profile", desc: "Account details", icon: UserRound },
  { key: "password", label: "Passwords", desc: "Account security", icon: LockKeyhole },
  { key: "activity", label: "Activity", desc: "Account events", icon: Activity },
  { key: "sales", label: "Sales Dashboard", desc: "Partner performance", icon: LayoutDashboard, affiliateOnly: true },
  { key: "devices", label: "Devices", desc: "Coming soon", icon: MonitorSmartphone, soon: true },
];
const RULES = [
  { label: "8–128 characters", test: (v) => v.length >= 8 && v.length <= 128 },
  { label: "Uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "Number", test: (v) => /\d/.test(v) },
  { label: "Special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];
const STATUS_OPTIONS = ["ALL", "EARNED", "FAILED", "PENDING", "REFUNDED", "UNVERIFIED"];
const emptyPassword = { oldPassword: "", newPassword: "", confirmPassword: "" };
const money = (value, currency = "INR") => new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value) || 0);
const count = (v) => new Intl.NumberFormat("en-IN").format(Number(v) || 0);
const dateText = (v, time = false) => {
  if (!v || Number.isNaN(new Date(v).getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata", ...(time ? { hour: "2-digit", minute: "2-digit" } : {}) }).format(new Date(v));
};
const initials = (s = "") => s.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "U";
const roleText = (r) => ({ admin: "Administrator", Employee: "Employee", normal: "Standard User", affiliate: "Affiliate Partner" }[r] || r || "User");
const errorText = (e, fallback) => e?.response?.status === 429 ? "Too many requests. Try again shortly." : e?.response?.data?.message || e?.message || fallback;
const themeNow = () => typeof window !== "undefined" && (localStorage.getItem("theme") === "dark" || (localStorage.getItem("theme") !== "light" && document.documentElement.classList.contains("dark"))) ? "dark" : "light";
function useTheme() {
  const [theme, setTheme] = useState(themeNow);
  useEffect(() => {
    const sync = () => setTheme(themeNow());
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    window.addEventListener("storage", sync);
    window.addEventListener("theme-change", sync);
    return () => { obs.disconnect(); window.removeEventListener("storage", sync); window.removeEventListener("theme-change", sync); };
  }, []);
  return theme;
}
function Panel({ title, caption, icon: Icon, action, children, dark, className = "" }) {
  return <section className={`overflow-hidden rounded-2xl border ${dark ? "border-[#303030] bg-[#151515]" : "border-[#E9E9E9] bg-white"} ${className}`}>
    {(title || action) && <div className={`flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4 sm:px-6 ${dark ? "border-[#303030]" : "border-[#EEEEEE]"}`}>
      <div className="flex items-center gap-3">{Icon && <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${dark ? "bg-[#2B241F]" : "bg-[#FFF2E8]"}`}><Icon size={18} className="text-[#F97316]" /></span>}
        <div><h3 className="text-[14px] font-semibold">{title}</h3>{caption && <p className={`mt-1 text-[11px] ${dark ? "text-[#999]" : "text-[#777]"}`}>{caption}</p>}</div></div>{action}</div>}
    <div className="p-5 sm:p-6">{children}</div>
  </section>;
}
function FieldDetail({ label, value, icon: Icon, dark, copy = false }) {
  return <div className="min-w-0"><div className={`flex items-center gap-2 text-[11px] ${dark ? "text-[#999]" : "text-[#777]"}`}>{Icon && <Icon size={14} className="text-[#F97316]" />}{label}</div>
    <div className="mt-2 flex items-center gap-2"><span className="min-w-0 break-words text-[13px] font-semibold">{value ?? "Not provided"}</span>{copy && value && <button type="button" className="rounded-md p-1 text-[#F97316] hover:bg-[#F97316]/10" onClick={async () => { try { await navigator.clipboard.writeText(String(value)); toast.success("Copied"); } catch { toast.error("Could not copy"); } }}><Copy size={14} /></button>}</div></div>;
}
function StatePill({ status, dark }) {
  const s = String(status || "UNKNOWN").toUpperCase();
  const good = ["SUCCESS", "PAID", "EARNED", "ACTIVE"].includes(s);
  const bad = ["FAILED", "BLOCKED", "REFUNDED", "CANCELLED"].includes(s);
  return <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${good ? dark ? "border-[#744221] bg-[#332216] text-[#FFA569]" : "border-orange-200 bg-orange-50 text-orange-700" : bad ? "border-red-500/25 bg-red-500/10 text-red-500" : dark ? "border-[#424242] bg-[#292929] text-[#CCC]" : "border-gray-200 bg-gray-100 text-gray-600"}`}><span className={`h-1.5 w-1.5 rounded-full ${good ? "bg-[#F97316]" : bad ? "bg-red-500" : "bg-gray-400"}`} />{s}</span>;
}
function Metric({ label, value, sub, icon: Icon, dark }) {
  return <div className={`min-w-0 rounded-xl border p-4 sm:p-5 ${dark ? "border-[#363636] bg-[#1B1B1B]" : "border-[#EAEAEA] bg-white"}`}>
    <div className="flex items-center justify-between gap-3"><span className={`text-[11px] font-medium ${dark ? "text-[#AAA]" : "text-[#777]"}`}>{label}</span><Icon className="shrink-0 text-[#F97316]" size={18} /></div>
    <p className="mt-3 break-words text-xl font-semibold tracking-tight sm:text-2xl">{value}</p>{sub && <p className={`mt-2 text-[11px] ${dark ? "text-[#888]" : "text-[#888]"}`}>{sub}</p>}</div>;
}
function Loading({ label = "Loading..." }) { return <div className="flex items-center justify-center gap-3 py-20 text-sm text-[#999]"><Loader2 className="animate-spin text-[#F97316]" size={21} />{label}</div>; }
function Empty({ text, dark }) { return <div className={`rounded-xl border border-dashed py-12 text-center text-[12px] ${dark ? "border-[#424242] text-[#999]" : "border-[#DDD] text-[#777]"}`}>{text}</div>; }
function SmallButton({ children, onClick, disabled, dark, primary = false, type = "button", className = "" }) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3.5 text-[12px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${primary ? "bg-[#F97316] text-white hover:bg-[#E7660B]" : dark ? "border border-[#454545] bg-[#202020] hover:bg-[#303030]" : "border border-[#DEDEDE] bg-white hover:bg-[#F8F8F8]"} ${className}`}>{children}</button>;
}
function DateInput({ label, value, onChange, dark, max }) { return <label className="min-w-0 flex-1 text-[11px] font-medium">{label}<input aria-label={label} type="date" value={value} onChange={(e) => onChange(e.target.value)} max={max} className={`mt-1.5 h-10 w-full rounded-lg border px-2 text-[12px] outline-none focus:border-[#F97316] ${dark ? "border-[#424242] bg-[#242424] text-white [color-scheme:dark]" : "border-[#DDD] bg-white text-[#222]"}`} /></label>; }
function OrderStatus({ order, dark }) { return <StatePill status={order?.state || order?.paymentStatus || order?.orderStatus} dark={dark} />; }
function OrderRows({ orders, dark }) {
  if (!orders.length) return <Empty text="No transactions match these filters." dark={dark} />;
  return <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-[12px]"><thead className={dark ? "text-[#999]" : "text-[#777]"}><tr className="border-b border-current/10"><th className="pb-3 pr-4 font-medium">Order / Book</th><th className="pb-3 pr-4 font-medium">Date</th><th className="pb-3 pr-4 font-medium">Status</th><th className="pb-3 pr-4 text-right font-medium">Sale</th><th className="pb-3 text-right font-medium">Commission</th></tr></thead><tbody>{orders.map((o, i) => <tr key={`${o.orderId || i}-${i}`} className={dark ? "border-b border-[#303030]" : "border-b border-[#EEE]"}><td className="py-3.5 pr-4"><div className="max-w-[230px] truncate font-semibold">{o.book?.title || "Book"}</div><div className="mt-1 font-mono text-[10px] opacity-60">{o.orderId || "—"}</div><div className="mt-1 text-[10px] opacity-60">{o.commissionType === "PERCENTAGE" ? `${o.commissionValue}%` : o.commissionType === "FIXED" ? `${money(o.commissionValue, o.currency || "INR")} fixed` : "No commission"}</div></td><td className="py-3 pr-4 text-[11px] opacity-80">{dateText(o.eventAt || o.createdAt, true)}</td><td className="py-3 pr-4"><OrderStatus order={o} dark={dark} /></td><td className="py-3 pr-4 text-right font-medium">{money(o.amount, o.currency || "INR")}</td><td className="py-3 text-right"><span className={o.commissionEarned ? "font-semibold text-[#F97316]" : "opacity-60"}>{o.commissionEarned ? money(o.commissionAmount, o.currency || "INR") : "—"}</span></td></tr>)}</tbody></table></div>;
}
function SalesGraph({ graph, dark }) {
  const [metric, setMetric] = useState("salesAmount");
  const [hovered, setHovered] = useState(null);
  const points = graph?.points || [];
  const highest = Math.max(1, ...points.map((p) => Number(p[metric]) || 0));
  const label = metric === "salesAmount" ? "Sales" : metric === "commission" ? "Commission" : "Successful orders";
  return <Panel title="Performance over time" caption={`Daily ${label.toLowerCase()} · ${graph?.days || 7} days · IST`} icon={BarChart3} dark={dark} action={<div className="flex flex-wrap gap-1">{[["salesAmount", "Sales"], ["commission", "Commission"], ["successfulOrders", "Orders"]].map(([k, l]) => <button key={k} onClick={() => { setMetric(k); setHovered(null); }} className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold ${metric === k ? "bg-[#F97316] text-white" : dark ? "bg-[#282828] text-[#AAA]" : "bg-[#F3F3F3] text-[#777]"}`}>{l}</button>)}</div>}>
    {!points.length ? <Empty text="No graph points available." dark={dark} /> : <><div className={`mb-5 flex flex-wrap justify-between gap-3 rounded-lg p-3 text-[12px] ${dark ? "bg-[#222]" : "bg-[#F8F8F8]"}`}><span className="opacity-70">{hovered === null ? `Total ${label.toLowerCase()} in chart` : dateText(`${points[hovered]?.date}T00:00:00+05:30`)}</span><b className="text-[#F97316]">{metric === "successfulOrders" ? count(hovered === null ? points.reduce((a, p) => a + (Number(p[metric]) || 0), 0) : points[hovered]?.[metric]) : money(hovered === null ? points.reduce((a, p) => a + (Number(p[metric]) || 0), 0) : points[hovered]?.[metric])}</b></div>
      <div className="relative flex h-[230px] items-end gap-1.5 overflow-x-auto pb-8 sm:gap-2">{points.map((p, i) => { const val = Number(p[metric]) || 0; const height = Math.max(val > 0 ? 4 : 2, (val / highest) * 100); const showLabel = points.length <= 14 || i % Math.ceil(points.length / 10) === 0; return <button type="button" title={`${p.date}: ${val}`} aria-label={`${p.date}: ${val}`} key={p.date} onMouseEnter={() => setHovered(i)} onFocus={() => setHovered(i)} onMouseLeave={() => setHovered(null)} className="relative flex h-full min-w-[13px] flex-1 flex-col justify-end outline-none sm:min-w-[16px]"><span style={{ height: `${height}%` }} className={`w-full rounded-t-md transition-all duration-200 ${hovered === i ? "bg-[#F97316]" : dark ? "bg-[#9B4E1B] hover:bg-[#F97316]" : "bg-[#FDBA84] hover:bg-[#F97316]"}`} />{showLabel && <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] opacity-60">{p.date.slice(5)}</span>}</button> })}</div><p className={`mt-2 text-[10px] ${dark ? "text-[#888]" : "text-[#888]"}`}>Hover or tap a bar to inspect a day. All dates use Asia/Kolkata.</p></>}
  </Panel>;
}
function TransactionModal({ open, onClose, token, dark, recent = [] }) {
  const [filters, setFilters] = useState({ status: "ALL", startDate: "", endDate: "", sort: "desc" });
  const [applied, setApplied] = useState(filters);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (!open) return; const close = (e) => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", close); const prior = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.removeEventListener("keydown", close); document.body.style.overflow = prior; }; }, [open, onClose]);
  useEffect(() => { if (!open || !token) return; let cancelled = false; const controller = new AbortController(); (async () => { setLoading(true); setError(""); try { const r = await axios.get(API.orders, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, timeout: 20000, signal: controller.signal, params: { ...applied, page, limit: 15, ...(!applied.startDate ? { startDate: undefined, endDate: undefined } : {}) } }); if (!cancelled) setData(r.data?.data || null); } catch (e) { if (!cancelled && !axios.isCancel(e)) setError(errorText(e, "Unable to load transactions.")); } finally { if (!cancelled) setLoading(false); } })(); return () => { cancelled = true; controller.abort() }; }, [open, token, applied, page]);
  if (!open) return null;
  const totals = data?.totals || {};
  const orders = data?.orders || [];
  const pagination = data?.pagination || {};
  const muted = dark ? "text-[#AAA]" : "text-[#777]";
  return <div role="presentation" className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-2 backdrop-blur-sm sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}><section role="dialog" aria-modal="true" aria-label="Affiliate transactions" className={`flex max-h-[94vh] w-full max-w-[1080px] flex-col overflow-hidden rounded-2xl border shadow-2xl ${dark ? "border-[#393939] bg-[#141414] text-white" : "border-[#DDD] bg-white text-[#181818]"}`}>
    <header className={`flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4 sm:px-7 ${dark ? "border-[#343434]" : "border-[#EEE]"}`}><div><p className="text-[10px] font-bold uppercase tracking-widest text-[#F97316]">Target Trek · Affiliate</p><h2 className="mt-1.5 text-[21px] font-semibold">Transactions</h2><p className={`mt-1 text-[11px] ${muted}`}>Private partner transactions · 15 per page</p></div><button onClick={onClose} aria-label="Close transactions" className={`rounded-lg p-2 ${dark ? "hover:bg-[#303030]" : "hover:bg-[#EEE]"}`}><X size={20} /></button></header>
    <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-7"><div className={`grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] ${dark ? "border-[#363636] bg-[#1E1E1E]" : "border-[#EEE] bg-[#FAFAFA]"}`}><label className="text-[11px] font-medium">Status<select value={filters.status} onChange={e => setFilters(v => ({ ...v, status: e.target.value }))} className={`mt-1.5 h-10 w-full rounded-lg border px-2 text-[12px] ${dark ? "border-[#444] bg-[#292929]" : "border-[#DDD] bg-white"}`}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</select></label><DateInput label="From" value={filters.startDate} onChange={v => setFilters(p => ({ ...p, startDate: v }))} dark={dark} /><DateInput label="To" value={filters.endDate} onChange={v => setFilters(p => ({ ...p, endDate: v }))} dark={dark} /><label className="text-[11px] font-medium">Order<select value={filters.sort} onChange={e => setFilters(v => ({ ...v, sort: e.target.value }))} className={`mt-1.5 h-10 w-full rounded-lg border px-2 text-[12px] ${dark ? "border-[#444] bg-[#292929]" : "border-[#DDD] bg-white"}`}><option value="desc">Newest first</option><option value="asc">Oldest first</option></select></label><div className="flex items-end gap-2"><SmallButton primary onClick={() => { if (Boolean(filters.startDate) !== Boolean(filters.endDate)) { toast.error("Select both dates or neither."); return; } if (filters.startDate && filters.startDate > filters.endDate) { toast.error("Start date must precede end date."); return; } setPage(1); setApplied({ ...filters }); }}><Filter size={14} />Apply</SmallButton><SmallButton dark={dark} onClick={() => { const v = { status: "ALL", startDate: "", endDate: "", sort: "desc" }; setFilters(v); setApplied(v); setPage(1) }}>Clear</SmallButton></div></div>
      {error && <div className="rounded-lg border border-red-500/30 p-3 text-[12px] text-red-500">{error}<button onClick={() => setApplied({ ...applied })} className="ml-3 underline">Retry</button></div>}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><Metric dark={dark} icon={ShoppingBag} label="Matching orders" value={count(totals.totalOrders)} /><Metric dark={dark} icon={TrendingUp} label="Verified sales" value={money(totals.successfulAmount)} /><Metric dark={dark} icon={Wallet} label="Earned commission" value={money(totals.earnedCommission)} /><Metric dark={dark} icon={AlertCircle} label="Failed orders" value={count(totals.failedOrders)} /></div>
      {loading ? <Loading label="Loading private transactions..." /> : <OrderRows orders={orders} dark={dark} />}
      <div className="flex flex-wrap items-center justify-between gap-3"><p className={`text-[11px] ${muted}`}>{count(pagination.total)} matching orders · Page {pagination.page || page} / {pagination.pages || 1}</p><div className="flex gap-2"><SmallButton dark={dark} disabled={loading || !pagination.hasPrevious} onClick={() => setPage(p => Math.max(1, p - 1))}><ChevronLeft size={15} />Previous</SmallButton><SmallButton dark={dark} disabled={loading || !pagination.hasNext} onClick={() => setPage(p => p + 1)}>Next<ChevronRight size={15} /></SmallButton></div></div>
    </div></section></div>;
}
function SalesDashboard({ token, profile, dark }) {
  const [graphDays, setGraphDays] = useState(7);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [period, setPeriod] = useState("last7Days");
  useEffect(() => { if (!token) return; let alive = true; const controller = new AbortController(); (async () => { setLoading(true); setError(""); try { const r = await axios.get(API.dashboard, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, timeout: 20000, signal: controller.signal, params: { graphDays } }); if (alive) setDashboard(r.data?.data || null); } catch (e) { if (alive && !axios.isCancel(e)) setError(errorText(e, "Unable to load sales dashboard.")); } finally { if (alive) setLoading(false); } })(); return () => { alive = false; controller.abort() }; }, [token, graphDays, revision]);
  const summary = dashboard?.summary || {};
  const current = summary[period] || {};
  const muted = dark ? "text-[#999]" : "text-[#777]";
  const recent = dashboard?.recentOrders || [];
  return <div className="space-y-5">
    {/* <div className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 ${dark?"border-[#453321] bg-[#211A16]":"border-[#F5D7C2] bg-[#FFF9F4]"}`}><div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-[#F97316]/10 blur-3xl"/><div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#F97316]"><Sparkles size={14}/> Partner analytics</div><h2 className="mt-3 text-[23px] font-semibold tracking-tight sm:text-[29px]">Your sales performance</h2><p className={`mt-2 max-w-lg text-[12px] leading-6 ${muted}`}>Verified sales, affiliate commission, payment trends and your most recent orders. Updated from your private dashboard API.</p></div><div className="flex flex-wrap gap-2"><SmallButton dark={dark} disabled={loading} onClick={()=>setRevision(v=>v+1)}><RefreshCw size={15} className={loading?"animate-spin":""}/>Refresh</SmallButton><SmallButton primary onClick={()=>setTransactionsOpen(true)}><ReceiptText size={15}/>All transactions<ArrowRight size={15}/></SmallButton></div></div></div> */}
    {error && <div className="rounded-xl border border-red-500/30 p-5 text-[12px] text-red-500"><AlertCircle size={17} className="mr-2 inline" />{error}<button onClick={() => setRevision(v => v + 1)} className="ml-3 font-semibold underline">Try again</button></div>}
    {loading && !dashboard ? <Loading label="Loading affiliate sales..." /> : dashboard ? <>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><Metric dark={dark} icon={ShoppingBag} label="All orders" value={count(summary.allTime?.totalOrders)} sub="All attributed orders" /><Metric dark={dark} icon={TrendingUp} label="Verified sales" value={money(summary.allTime?.successfulAmount)} sub={`${count(summary.allTime?.successfulOrders)} successful orders`} /><Metric dark={dark} icon={Wallet} label="Earned commission" value={money(summary.allTime?.earnedCommission)} sub="Verified, non-refunded orders" /><Metric dark={dark} icon={CheckCircle2} label="Success rate" value={`${Number(summary.allTime?.conversionRate || 0).toFixed(1)}%`} sub="Across all attributed orders" /></div>
      <Panel dark={dark} icon={CalendarRange} title="Sales by period" caption="Compare verified orders and earnings across time" action={<select className={`h-10 max-w-[150px] rounded-lg border px-2.5 text-[12px] ${dark ? "border-[#444] bg-[#242424]" : "border-[#DDD] bg-white"}`} value={period} onChange={e => setPeriod(e.target.value)}>{[["today", "Today"], ["last7Days", "Last 7 days"], ["last30Days", "Last 30 days"], ["last365Days", "Last 365 days"], ["allTime", "All time"]].map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>}><div className="grid grid-cols-2 gap-3 xl:grid-cols-4"><Metric dark={dark} icon={TrendingUp} label="Sales amount" value={money(current.successfulAmount)} /><Metric dark={dark} icon={Wallet} label="Your commission" value={money(current.earnedCommission)} /><Metric dark={dark} icon={ShoppingBag} label="Successful orders" value={count(current.successfulOrders)} /><Metric dark={dark} icon={AlertCircle} label="Failed attempts" value={count(current.failedOrders)} sub={`Attempted ${money(current.failedAttemptedAmount)}`} /></div><div className={`mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-[11px] ${dark ? "border-[#333] text-[#AAA]" : "border-[#EEE] text-[#777]"}`}><span>Pending: <b>{count(current.pendingOrders)}</b></span><span>Refunded: <b>{count(current.refundedOrders)}</b></span><span>Remaining before fees: <b>{money(current.remainingAmount)}</b></span><span>Total attempts: <b>{count(current.totalOrders)}</b></span></div></Panel>
      <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-[14px] font-semibold">Sales trends</h3><div className="flex gap-1 rounded-lg border border-[#888]/20 p-1">{[7, 30, 365].map(d => <button key={d} onClick={() => setGraphDays(d)} className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${graphDays === d ? "bg-[#F97316] text-white" : muted}`}>{d === 365 ? "1 year" : `${d} days`}</button>)}</div></div>
      <SalesGraph graph={dashboard.graph} dark={dark} />
      <Panel dark={dark} icon={ReceiptText} title="Recent transactions" caption="Latest 15 orders associated with your affiliate account" action={<SmallButton dark={dark} onClick={() => setTransactionsOpen(true)}>View transactions<ArrowRight size={14} /></SmallButton>}><OrderRows orders={recent.slice(0, 15)} dark={dark} /><p className={`mt-4 text-[11px] ${muted}`}>Customer details, payment credentials, and gateway responses are never shown.</p></Panel>
      <Panel dark={dark} icon={Handshake} title="Your affiliate terms" caption="Current assigned referral configuration"><div className="grid grid-cols-2 gap-5 sm:grid-cols-4"><FieldDetail dark={dark} label="Referral code" value={dashboard.affiliate?.code || profile?.affiliate?.code} copy icon={Copy} /><FieldDetail dark={dark} label="Commission type" value={dashboard.affiliate?.commissionType || profile?.affiliate?.commissionType} /><FieldDetail dark={dark} label="Current rate" value={(dashboard.affiliate?.commissionType || profile?.affiliate?.commissionType) === "percentage" ? `${dashboard.affiliate?.commissionValue ?? profile?.affiliate?.commissionValue}%` : money(dashboard.affiliate?.commissionValue ?? profile?.affiliate?.commissionValue)} /><FieldDetail dark={dark} label="Partner status" value={dashboard.affiliate?.status || profile?.affiliate?.status} /></div><p className={`mt-5 text-[11px] leading-6 ${muted}`}>Commissions are snapshots at checkout, and recognized earnings count only eligible verified sales. They are not payment or payout confirmations. Refunds may change historical totals.</p></Panel>
    </> : null}
    <TransactionModal open={transactionsOpen} onClose={() => setTransactionsOpen(false)} dark={dark} token={token} recent={recent} />
  </div>;
}
function PasswordPage({ profile, token, dark }) {
  const [form, setForm] = useState(emptyPassword);
  const [visible, setVisible] = useState({ oldPassword: false, newPassword: false, confirmPassword: false });
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [touched, setTouched] = useState(false);
  const rules = RULES.map(r => ({ ...r, passed: r.test(form.newPassword) }));
  const valid = rules.every(r => r.passed);
  const matching = Boolean(form.confirmPassword) && form.confirmPassword === form.newPassword;
  const same = Boolean(form.oldPassword) && form.oldPassword === form.newPassword;
  const muted = dark ? "text-[#999]" : "text-[#777]";
  const update = e => { setForm(p => ({ ...p, [e.target.name]: e.target.value })); setServerError(""); };
  async function submit(e) {
    e.preventDefault(); setTouched(true); if (busy) return; if (!form.oldPassword) return toast.error("Enter the current password"); if (!valid) return toast.error("Meet all password requirements"); if (!matching) return toast.error("Passwords do not match"); if (same) return toast.error("Choose a password different from your current one"); setBusy(true); setServerError(""); try {
      const r = await axios.post(API.password, form, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, timeout: 20000 }); if (!r.data?.success) throw new Error(r.data?.message || "Unable to change password"); setForm(emptyPassword); toast.success("Password updated. Please sign in again.");
      // Full clearing is explicitly requested. This also removes redux-persist state
      // and any locally stored access/refresh tokens. Don't just navigate using React Router.
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace(LOGIN_ROUTE);
    } catch (err) { const msg = errorText(err, "Unable to update password."); setServerError(msg); toast.error(msg); } finally { setBusy(false) }
  }
  return <div className="space-y-5"><div className="grid gap-4 sm:grid-cols-2"><Metric dark={dark} icon={Clock3} label="Last login" value={dateText(profile?.lastLoginAt, true)} /><Metric dark={dark} icon={KeyRound} label="Last password change" value={dateText(profile?.passwordChangedAt, true)} /></div>
    <Panel dark={dark} title="Update your password" icon={LockKeyhole} caption="Choose a secure password to protect your account"><form onSubmit={submit} noValidate className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_270px]"><div className="space-y-5">{[["oldPassword", "Current password"], ["newPassword", "New password"], ["confirmPassword", "Confirm new password"]].map(([key, label]) => <label key={key} className="block"><span className="text-[12px] font-semibold">{label}</span><div className="relative mt-2"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" size={16} /><input type={visible[key] ? "text" : "password"} name={key} value={form[key]} onChange={update} disabled={busy} autoComplete={key === "oldPassword" ? "current-password" : "new-password"} maxLength={128} className={`h-12 w-full rounded-lg border pl-10 pr-12 text-[13px] outline-none focus:border-[#F97316] ${dark ? "border-[#424242] bg-[#212121]" : "border-[#DDD] bg-white"}`} /><button type="button" aria-label={visible[key] ? "Hide password" : "Show password"} onClick={() => setVisible(p => ({ ...p, [key]: !p[key] }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]">{visible[key] ? <EyeOff size={17} /> : <Eye size={17} />}</button></div>{key === "confirmPassword" && form.confirmPassword && <p className={`mt-1.5 text-[11px] ${matching ? "text-[#F97316]" : "text-red-500"}`}>{matching ? "Passwords match" : "Passwords don't match"}</p>}</label>)}
      {same && <p className="text-[12px] text-red-500">Your new password must differ from the current password.</p>}{serverError && <p role="alert" className="rounded-lg border border-red-500/30 p-3 text-[12px] text-red-500">{serverError}</p>}<SmallButton primary type="submit" disabled={busy || !form.oldPassword || !valid || !matching || same} className="w-full sm:w-auto">{busy ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />} {busy ? "Updating..." : "Change password"}<ArrowRight size={15} /></SmallButton></div>
      <div className={`self-start rounded-xl border p-4 ${dark ? "border-[#454033] bg-[#24201B]" : "border-[#F3DED0] bg-[#FFF9F4]"}`}><div className="flex items-center gap-2 text-[12px] font-bold"><ShieldCheck className="text-[#F97316]" size={19} />Password checklist</div><div className="mt-4 grid grid-cols-5 gap-1">{rules.map(r => <span key={r.label} className={`h-1.5 rounded-full ${r.passed ? "bg-[#F97316]" : dark ? "bg-[#444]" : "bg-[#DDD]"}`} />)}</div><div className="mt-4 space-y-3">{rules.map(r => <div key={r.label} className={`flex items-center gap-2 text-[11px] ${r.passed ? "" : muted}`}><span className={`flex h-4 w-4 items-center justify-center rounded-full border ${r.passed ? "border-[#F97316] bg-[#F97316] text-white" : dark ? "border-[#666]" : "border-[#CCC]"}`}>{r.passed && <Check size={11} />}</span>{r.label}</div>)}</div><p className={`mt-5 border-t pt-4 text-[11px] leading-5 ${dark ? "border-[#504133] text-[#AAA]" : "border-[#F0D8C6] text-[#888]"}`}>On success, all browser-stored auth and session data are cleared and you'll be redirected to login. Other sessions must also be revoked server-side.</p></div></form></Panel></div>;
}
function UserProfile() {
  const token = useSelector(s => s.auth?.token);
  const theme = useTheme(); const dark = theme === "dark";
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [activities, setActivities] = useState([]); const [activityLoaded, setActivityLoaded] = useState(false); const [activityLoading, setActivityLoading] = useState(false); const [activityError, setActivityError] = useState("");
  const fetchProfile = useCallback(async () => { if (!token) { setLoading(false); setError("Please sign in to see your profile."); return; } setLoading(true); setError(""); try { const { data } = await axios.get(API.me, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, timeout: 20000 }); const user = data?.user || data?.profile || data?.data?.user; if (!user) throw new Error("Profile data not returned."); setProfile(user); } catch (e) { setError(errorText(e, "Could not load profile.")); } finally { setLoading(false) } }, [token]);
  const fetchActivities = useCallback(async () => { if (!token) return; setActivityLoading(true); setActivityError(""); try { const { data } = await axios.get(API.activities, { headers: { Authorization: `Bearer ${token}` }, withCredentials: true, timeout: 20000, params: { page: 1, limit: 20 } }); setActivities(data?.activities || data?.data?.activities || []); } catch (e) { setActivityError(errorText(e, "Account history is not available.")); } finally { setActivityLoaded(true); setActivityLoading(false) } }, [token]);
  useEffect(() => { fetchProfile() }, [fetchProfile]);
  useEffect(() => { if (tab === "activity" && !activityLoaded && !activityLoading) fetchActivities() }, [tab, activityLoaded, activityLoading, fetchActivities]);
  const nav = TABS.filter(item => !item.affiliateOnly || profile?.role === "affiliate");
  const chosen = nav.find(v => v.key === tab) || nav[0];
  const muted = dark ? "text-[#999]" : "text-[#777]";
  const card = dark ? "border-[#303030] bg-[#151515]" : "border-[#E8E8E8] bg-white";
  const affiliate = profile?.affiliate;
  return <div data-theme={theme} className={`mt-16 min-h-screen px-4 py-7 sm:px-6 lg:px-8 ${dark ? "bg-black text-white" : "bg-white text-[#171717]"}`}><div className="mx-auto max-w-[1280px] space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest ${muted}`}><span className="h-2 w-2 rounded-full bg-[#F97316]" />Target Trek / Account</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Account center</h1><p className={`mt-2 text-[13px] ${muted}`}>Profile, security and affiliate performance in one place.</p></div></div>
    {loading && !profile ? <Loading label="Loading account..." /> : error && !profile ? <Panel dark={dark}><div className="text-center"><AlertCircle size={27} className="mx-auto text-[#F97316]" /><p className="mt-3 text-sm">{error}</p><SmallButton dark={dark} onClick={fetchProfile} className="mt-4">Retry</SmallButton></div></Panel> : profile && <div className="grid items-start gap-5 lg:grid-cols-[248px_minmax(0,1fr)]"><aside className={`min-w-0 overflow-hidden rounded-2xl border lg:sticky lg:top-24 ${card}`}><div className={`hidden items-center gap-3 border-b p-5 lg:flex ${dark ? "border-[#333]" : "border-[#EEE]"}`}><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-base font-bold text-white">{initials(profile.name)}</div><div className="min-w-0"><p className="truncate text-[13px] font-semibold">{profile.name}</p><p className={`mt-1 text-[11px] ${muted}`}>{roleText(profile.role)}</p></div></div><nav aria-label="Account sections" className="flex gap-1 overflow-x-auto p-2 lg:block lg:space-y-1 lg:overflow-visible">{nav.map(item => { const Icon = item.icon; const on = chosen.key === item.key; return <button key={item.key} onClick={() => setTab(item.key)} className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-3 text-left lg:w-full ${on ? dark ? "bg-[#392418] text-[#FFA065]" : "bg-[#FFF1E5] text-[#C65C16]" : dark ? "text-[#BBB] hover:bg-[#222]" : "text-[#555] hover:bg-[#F7F7F7]"}`}><Icon size={18} className={on ? "text-[#F97316]" : ""} /><div className="flex-1"><span className="block whitespace-nowrap text-[12px] font-semibold">{item.label}</span><span className={`mt-1 hidden text-[10px] lg:block ${muted}`}>{item.desc}</span></div>{item.soon && <span className={`hidden rounded px-2 py-1 text-[9px] lg:inline ${dark ? "bg-[#333]" : "bg-[#EEE]"}`}>Soon</span>}</button> })}</nav></aside>
      <main className="min-w-0 space-y-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-[23px] font-semibold tracking-tight">{chosen.label}</h2><p className={`mt-1 text-[12px] ${muted}`}>{chosen.desc}</p></div>{["profile", "password"].includes(chosen.key) && <StatePill dark={dark} status={profile.status} />}</div>
        {chosen.key === "profile" && <div className="space-y-5"><div className={`overflow-hidden rounded-2xl border ${card}`}><div className="h-1 bg-[#F97316]" /><div className="flex flex-wrap items-center gap-5 p-6"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F97316] text-xl font-bold text-white">{initials(profile.name)}</div><div className="min-w-0 flex-1"><h3 className="break-words text-xl font-bold">{profile.name}</h3><p className="mt-1 text-[12px] font-semibold text-[#F97316]">{roleText(profile.role)}</p><p className={`mt-2 break-all text-[12px] ${muted}`}>{profile.email}</p></div><div className={`rounded-xl border p-3 text-[11px] ${dark ? "border-[#444]" : "border-[#DDD]"}`}>Member since<br /><b className="mt-1 block">{dateText(profile.createdAt)}</b></div></div></div>
          <Panel title="Personal information" icon={UserRound} caption="Registered account information" dark={dark}><div className="grid gap-6 sm:grid-cols-2"><FieldDetail dark={dark} label="Name" value={profile.name} icon={UserRound} /><FieldDetail dark={dark} label="Email" value={profile.email} icon={Mail} copy /><FieldDetail dark={dark} label="Mobile" value={profile.mobile || "Not provided"} icon={Phone} /><FieldDetail dark={dark} label="Account role" value={roleText(profile.role)} icon={ShieldCheck} /><FieldDetail dark={dark} label="Created" value={dateText(profile.createdAt)} icon={CalendarDays} /><FieldDetail dark={dark} label="Last updated" value={dateText(profile.updatedAt, true)} icon={Clock3} /></div><p className={`mt-6 border-t pt-4 text-[11px] ${dark ? "border-[#333]" : "border-[#EEE]"} ${muted}`}>Contact your administrator to change registered details.</p></Panel>
          {profile.role === "affiliate" && <Panel title="Affiliate partnership" caption="Your current referral configuration" icon={Handshake} dark={dark}><div className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 ${dark ? "border-[#5B3B21] bg-[#211A16]" : "border-[#F5D8C4] bg-[#FFF7F1]"}`}><div><p className={`text-[11px] ${muted}`}>Affiliate code</p><p className="mt-2 break-all font-mono text-xl font-bold text-[#F97316]">{affiliate?.code || "Not assigned"}</p></div><SmallButton primary disabled={!affiliate?.code} onClick={async () => { try { await navigator.clipboard.writeText(affiliate.code); toast.success("Copied affiliate code") } catch { toast.error("Could not copy") } }}><Copy size={15} />Copy</SmallButton></div><div className="mt-5 grid grid-cols-2 gap-6 sm:grid-cols-3"><FieldDetail dark={dark} label="Commission type" value={affiliate?.commissionType || "—"} icon={Percent} /><FieldDetail dark={dark} label="Commission rate" value={affiliate?.commissionType === "percentage" ? `${affiliate.commissionValue}%` : affiliate?.commissionType === "fixed" ? money(affiliate.commissionValue) : "—"} icon={Wallet} /><FieldDetail dark={dark} label="Partner status" value={affiliate?.status || "—"} icon={ShieldCheck} /></div></Panel>}
          <Panel title="Security overview" icon={ShieldCheck} dark={dark}><div className="grid gap-6 sm:grid-cols-2"><FieldDetail dark={dark} label="Last login" value={dateText(profile.lastLoginAt, true)} icon={Clock3} /><FieldDetail dark={dark} label="Last password change" value={dateText(profile.passwordChangedAt, true)} icon={KeyRound} /><FieldDetail dark={dark} label="Password setup" value={profile.mustChangePassword ? "Required" : "Completed"} /><FieldDetail dark={dark} label="Account status" value={profile.status} /></div></Panel>
        </div>}
        {chosen.key === "password" && <PasswordPage profile={profile} token={token} dark={dark} />}
        {chosen.key === "activity" && <Panel title="Account activity" caption="Recorded account and security events" icon={Activity} dark={dark} >{activityLoading ? <Loading label="Loading activity..." /> : activityError ? <Empty dark={dark} text={activityError} /> : activities.length === 0 ? <Empty dark={dark} text="No account activity found." /> : <div className="space-y-2">{activities.map((event, i) => <div key={event._id || i} className={`flex gap-3 rounded-lg border p-4 ${dark ? "border-[#333] bg-[#1E1E1E]" : "border-[#EEE] bg-[#FAFAFA]"}`}><Activity size={18} className="mt-0.5 shrink-0 text-[#F97316]" /><div><p className="text-[12px] font-semibold">{String(event.action || "Activity").replace(/_/g, " ")}</p><p className={`mt-1 text-[11px] ${muted}`}>{dateText(event.createdAt, true)} {event.result ? `· ${event.result}` : ""}</p></div></div>)}</div>}</Panel>}
        {chosen.key === "sales" && profile.role === "affiliate" && <SalesDashboard token={token} profile={profile} dark={dark} />}
        {chosen.key === "devices" && <div className={`rounded-2xl border p-10 text-center sm:p-16 ${card}`}><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-[#F97316]/10"><MonitorSmartphone size={30} className="text-[#F97316]" /></div><p className="mt-5 text-[11px] font-bold uppercase tracking-widest text-[#F97316]">Coming soon</p><h3 className="mt-2 text-2xl font-semibold">Device management</h3><p className={`mx-auto mt-3 max-w-md text-[13px] leading-6 ${muted}`}>View trusted devices, identify sessions and manage login access from a dedicated security page.</p><SmallButton primary className="mt-6" onClick={() => setTab("profile")}><ArrowLeft size={15} />Back to profile</SmallButton></div>}
      </main></div>}</div></div>;
}
export default UserProfile;
