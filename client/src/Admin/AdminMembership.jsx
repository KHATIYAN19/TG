import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  AlertTriangle,
  BadgeCheck,
  BookOpen,
  Ban,
  CheckCircle2,
  Crown,
  Gift,
  Lightbulb,
  Loader2,
  Mail,
  Megaphone,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Swords,
  Trash2,
  Users,
  Wallet,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url";

/* =====================================================
   ADMIN: BOOK PACKS & MATCHES
     Overview        cards + charts
     Members         suspend / unsuspend / delete a membership
     Suggestions     requests from pack members (delete permanently)
     Announcements   new-book emails, sent only when you press Send
===================================================== */

const API = `${String(BASE_URL || "").replace(/\/+$/, "")}/api/admin/membership`;

const inr = (n) => `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;
const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-");
const day = (d) => (d ? new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "");
const errText = (e, fb) => e?.response?.data?.message || e?.message || fb;
const initials = (name, email) => String(name || email || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/* categorical slots 1-3 of the reference palette (blue, orange, aqua); identity is also carried by the text label */
const PLAN = {
  all_current: { label: "All Books pack", color: "#2a78d6", soft: "bg-blue-50 text-blue-700 ring-blue-200" },
  lifetime: { label: "Lifetime pack", color: "#eb6834", soft: "bg-orange-50 text-orange-700 ring-orange-200" },
  none: { label: "Book with matches", color: "#1baf7a", soft: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};

const SUGGEST_STATUS = {
  new: { label: "New", cls: "bg-slate-100 text-slate-700 ring-slate-200" },
  planned: { label: "Planned", cls: "bg-blue-50 text-blue-700 ring-blue-200" },
  published: { label: "Published", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  declined: { label: "Declined", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
};

const TABS = [
  ["members", "Members", Users],
  ["suggestions", "Suggestions", Lightbulb],
  ["notices", "Announcements", Megaphone],
];

/* ---------------------------------------------------- small pieces */

function Chip({ children, className = "" }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ring-inset ${className}`}>{children}</span>;
}

function Kpi({ icon: Icon, label, value, hint, tone = "orange" }) {
  const tones = {
    orange: "from-orange-500 to-amber-500",
    blue: "from-blue-500 to-sky-500",
    green: "from-emerald-500 to-teal-500",
    rose: "from-rose-500 to-pink-500",
    violet: "from-violet-500 to-indigo-500",
  };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${tones[tone]} opacity-15 transition group-hover:scale-125`} aria-hidden="true" />
      <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${tones[tone]} text-white shadow`}><Icon size={19} /></span>
      <div className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">{value}</div>
      <div className="text-sm font-semibold text-slate-600">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

/* Column chart: one series, one baseline, thin bars with a rounded data end, hover + focus tooltip, table view. */
function SignupChart({ series }) {
  const [tip, setTip] = useState(null);
  const W = 640, H = 190, padL = 28, padB = 24, padT = 22;
  const max = Math.max(1, ...series.map((d) => d.members));
  const niceMax = max <= 4 ? 4 : Math.ceil(max / 2) * 2;
  const bw = (W - padL - 6) / series.length;
  const y = (v) => padT + (H - padT - padB) * (1 - v / niceMax);
  const peakIndex = series.reduce((best, d, i) => (d.members > series[best].members ? i : best), 0);
  const total = series.reduce((n, d) => n + d.members, 0);

  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`New members per day for the last 30 days. ${total} in total.`}>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={padL} x2={W} y1={y(niceMax * t)} y2={y(niceMax * t)} stroke="#e2e8f0" strokeWidth="1" />
              <text x={padL - 6} y={y(niceMax * t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{Math.round(niceMax * t)}</text>
            </g>
          ))}
          {series.map((d, i) => {
            const h = d.members ? Math.max(4, (H - padT - padB) * (d.members / niceMax)) : 0;
            const x = padL + i * bw + bw * 0.18;
            const w = bw * 0.64;
            const base = y(0);
            return (
              <g key={d.date}>
                {h > 0 && (
                  <path
                    d={`M${x},${base} V${base - h + 3} Q${x},${base - h} ${x + 3},${base - h} H${x + w - 3} Q${x + w},${base - h} ${x + w},${base - h + 3} V${base} Z`}
                    fill="#eb6834" opacity={tip && tip.i !== i ? 0.5 : 1} style={{ transition: "opacity .15s" }}
                  />
                )}
                {/* wide invisible hit target, bigger than the mark */}
                <rect
                  x={padL + i * bw} y={padT} width={bw} height={H - padT - padB} fill="transparent" tabIndex={0}
                  aria-label={`${day(d.date)}: ${d.members} new members, ${inr(d.revenue)}`}
                  onMouseEnter={() => setTip({ i, d })} onFocus={() => setTip({ i, d })} onMouseLeave={() => setTip(null)} onBlur={() => setTip(null)}
                />
              </g>
            );
          })}
          {[0, 10, 20, 29].map((i) => series[i] && (
            <text key={i} x={padL + i * bw + bw / 2} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">{day(series[i].date)}</text>
          ))}
          {series[peakIndex]?.members > 0 && (
            <text x={Math.min(W - 14, padL + peakIndex * bw + bw / 2)} y={y(series[peakIndex].members) - 8} textAnchor="middle" fontSize="11" fontWeight="700" fill="#0f172a">{series[peakIndex].members}</text>
          )}
        </svg>
        {tip && (
          <div className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg" style={{ left: `${Math.min(88, Math.max(12, ((padL + tip.i * bw + bw / 2) / W) * 100))}%` }}>
            <div className="font-bold text-slate-900">{day(tip.d.date)}</div>
            <div className="text-slate-600">{tip.d.members} new {tip.d.members === 1 ? "member" : "members"}</div>
            <div className="text-slate-500">{inr(tip.d.revenue)}</div>
          </div>
        )}
      </div>
      <details className="mt-2 text-xs text-slate-500">
        <summary className="cursor-pointer font-semibold text-slate-600">View as table</summary>
        <div className="mt-2 max-h-40 overflow-auto rounded-lg border">
          <table className="w-full text-left">
            <thead className="bg-slate-50"><tr><th className="p-2">Day</th><th className="p-2">New members</th><th className="p-2">Revenue</th></tr></thead>
            <tbody>
              {series.filter((d) => d.members).map((d) => <tr key={d.date} className="border-t"><td className="p-2">{day(d.date)}</td><td className="p-2">{d.members}</td><td className="p-2">{inr(d.revenue)}</td></tr>)}
              {total === 0 && <tr><td colSpan={3} className="p-2 text-slate-400">No new members in the last 30 days.</td></tr>}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/* Part-to-whole, read beside its figures: a thin segmented bar + a legend that carries the numbers. */
function SplitBar({ parts, format = (v) => v }) {
  const total = parts.reduce((n, p) => n + p.value, 0);
  if (!total) return <p className="text-sm text-slate-400">Nothing yet.</p>;
  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full" role="img" aria-label={parts.map((p) => `${p.label}: ${format(p.value)}`).join(", ")}>
        {parts.filter((p) => p.value > 0).map((p) => (
          <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} className="transition-all duration-700" title={`${p.label}: ${format(p.value)}`} />
        ))}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-700"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />{p.label}</span>
            <span className="font-semibold text-slate-900">{format(p.value)} <span className="font-normal text-slate-400">({Math.round((p.value / total) * 100)}%)</span></span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Modal({ title, icon: Icon, tone = "orange", children, onClose, busy }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);
  const tones = { orange: "bg-orange-100 text-orange-600", red: "bg-rose-100 text-rose-600", green: "bg-emerald-100 text-emerald-600" };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/55 p-4 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" style={{ animation: "modalIn .2s ease-out" }}>
        <style>{"@keyframes modalIn{from{opacity:0;transform:translateY(10px) scale(.98)}to{opacity:1;transform:none}}"}</style>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}><Icon size={20} /></span>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          </div>
          <button type="button" onClick={onClose} disabled={busy} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-40"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MemberBox({ row }) {
  const p = PLAN[row.plan] || PLAN.none;
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl border bg-slate-50 p-3">
      <span className="grid h-11 w-11 flex-none place-items-center rounded-full font-extrabold text-white" style={{ background: p.color }}>{initials(row.name, row.email)}</span>
      <div className="min-w-0">
        <div className="truncate font-semibold text-slate-900">{row.name || row.email}</div>
        <div className="truncate text-xs text-slate-500">{row.email}</div>
        <div className="text-xs text-slate-500">{p.label} · {row.bookTitle}</div>
      </div>
    </div>
  );
}

function ModalError({ msg }) {
  if (!msg) return null;
  return <p className="mt-3 rounded-lg border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700" role="alert">{msg}</p>;
}

function Actions({ busy, onCancel, onOk, okLabel, okTone, disabled }) {
  const tones = { orange: "bg-orange-600 hover:bg-orange-700", amber: "bg-amber-600 hover:bg-amber-700", green: "bg-emerald-600 hover:bg-emerald-700", red: "bg-rose-600 hover:bg-rose-700" };
  return (
    <div className="mt-5 flex justify-end gap-2">
      <button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40">Cancel</button>
      <button type="button" onClick={onOk} disabled={busy || disabled} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-45 ${tones[okTone]}`}>
        {busy ? <><Loader2 size={15} className="animate-spin" /> Working…</> : okLabel}
      </button>
    </div>
  );
}

/* ====================================================== PAGE */

export default function AdminMembership() {
  const token = useSelector((s) => s.auth?.token);
  const [tab, setTab] = useState("members");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [overview, setOverview] = useState(null);

  const [members, setMembers] = useState({ rows: [], total: 0, page: 1, pages: 1 });
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestStatus, setSuggestStatus] = useState("");
  const [selected, setSelected] = useState(() => new Set());

  const [ann, setAnn] = useState({ members: { total: 0, lifetime: 0, allBooks: 0 }, books: [] });

  // One modal at a time: { type, ...payload }
  const [modal, setModal] = useState(null);
  const [modalError, setModalError] = useState("");
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");

  const http = useMemo(
    () => axios.create({ baseURL: API, withCredentials: true, timeout: 30000, headers: token ? { Authorization: `Bearer ${token}` } : {} }),
    [token]
  );

  const flash = useCallback((msg) => {
    setNotice(msg);
    window.setTimeout(() => setNotice((cur) => (cur === msg ? "" : cur)), 7000);
  }, []);

  const loadOverview = useCallback(async () => {
    try {
      const res = await http.get("/overview");
      setOverview(res.data.data);
    } catch (e) {
      setError(errText(e, "Unable to load the overview."));
    }
  }, [http]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (tab === "members") {
        const res = await http.get("/members", { params: { plan: plan || undefined, status: status || undefined, q: q.trim() || undefined, page } });
        setMembers(res.data.data);
      } else if (tab === "suggestions") {
        const res = await http.get("/suggestions", { params: { status: suggestStatus || undefined } });
        setSuggestions(res.data.data);
        setSelected(new Set());
      } else {
        const res = await http.get("/announcements");
        setAnn(res.data.data);
      }
    } catch (e) {
      setError(errText(e, "Unable to load."));
    } finally {
      setLoading(false);
    }
  }, [http, tab, plan, status, q, page, suggestStatus]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  const refreshAll = () => { loadOverview(); load(); };

  const openModal = (m) => { setModal(m); setModalError(""); setReason(""); setTyped(""); };
  const closeModal = useCallback(() => setModal(null), []);

  /* one runner for every modal action */
  const run = async (fn) => {
    setBusy(true);
    setModalError("");
    try {
      const msg = await fn();
      setModal(null);
      if (msg) flash(msg);
      await Promise.all([loadOverview(), load()]);
    } catch (e) {
      setModalError(errText(e, "Something went wrong."));
    } finally {
      setBusy(false);
    }
  };

  const [memBusy, setMemBusy] = useState(null);
  const resendMemories = async (m) => {
    setMemBusy(m._id);
    try {
      const r = await http.post(`/members/${m._id}/resend-memories-mail`);
      flash(r.data.message);
      await load();
    } catch (e) {
      flash(errText(e, "Could not send the Memories code mail."));
    } finally {
      setMemBusy(null);
    }
  };
  const doSuspend = () => run(async () => (await http.patch(`/members/${modal.row._id}/suspend`, { reason })).data.message);
  const doUnsuspend = () => run(async () => (await http.patch(`/members/${modal.row._id}/unsuspend`)).data.message);
  const doDeleteMember = () => run(async () => (await http.delete(`/members/${modal.row._id}`)).data.message);
  const doDeleteSuggestion = () => run(async () => (await http.delete(`/suggestions/${modal.item._id}`)).data.message);
  const doBulkDelete = () => run(async () => (await http.post("/suggestions/bulk-delete", modal.body)).data.message);
  const doSend = () =>
    run(async () => {
      const { sent, failed } = (await http.post(`/announcements/${modal.book._id}/send`)).data.data;
      return `"${modal.book.title}": ${sent} sent${failed ? `, ${failed} failed (press Send again to retry the missing ones)` : ""}.`;
    });

  const updateSuggestion = async (id, patch) => {
    try {
      const res = await http.patch(`/suggestions/${id}`, patch);
      setSuggestions((rows) => rows.map((r) => (r._id === id ? res.data.data : r)));
      loadOverview();
    } catch (e) {
      setError(errText(e, "Could not update."));
    }
  };

  const toggleSel = (id) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const ov = overview;
  const byPlan = (p) => ov?.byPlan?.find((x) => x.plan === p);
  const matchesTotal = (ov?.matches?.claimed || 0) + (ov?.matches?.waiting || 0);

  return (
    <div className="mt-16 min-h-screen bg-slate-50 pb-16">
      <Helmet><title>Book Packs & Matches | Admin</title></Helmet>

      {/* ---------- header ---------- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-8 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100">Admin</p>
              <h1 className="mt-1 flex items-center gap-3 text-3xl font-extrabold tracking-tight"><Crown size={28} /> Book Packs &amp; Matches</h1>
              <p className="mt-2 max-w-2xl text-sm text-orange-50">
                Members, Prep Arena matches, book requests and new-book emails in one place. Pack price, books inside and matches are edited in{" "}
                <Link to="/admin/books" className="font-bold underline">Books</Link>.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/book/all-books" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25">All Books page</Link>
              <Link to="/book/life-type-combo" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/25">Lifetime page</Link>
              <button type="button" onClick={refreshAll} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-orange-700 shadow transition hover:shadow-lg">
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* ---------- KPI cards ---------- */}
        <div className="-mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Kpi icon={Users} label="Members" value={ov ? ov.members.total : "-"} hint={ov ? `${ov.members.active} active` : ""} tone="orange" />
          <Kpi icon={ShieldCheck} label="Active" value={ov ? ov.members.active : "-"} hint="Arena + Books tab" tone="green" />
          <Kpi icon={Ban} label="Suspended" value={ov ? ov.members.suspended : "-"} hint="No arena access" tone="rose" />
          <Kpi icon={Wallet} label="Pack revenue" value={ov ? inr(ov.revenue) : "-"} hint="Pack / matches orders" tone="blue" />
          <Kpi icon={Swords} label="Matches given" value={ov ? matchesTotal : "-"} hint={ov ? `${ov.matches.waiting} waiting for sign-up` : ""} tone="violet" />
          <Kpi icon={Lightbulb} label="New requests" value={ov ? ov.suggestions.new : "-"} hint={ov ? `${ov.booksNotYetSent} book${ov.booksNotYetSent === 1 ? "" : "s"} not yet emailed` : ""} tone="orange" />
        </div>

        {/* ---------- charts ---------- */}
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2" aria-labelledby="ch1">
            <div className="mb-3 flex items-baseline justify-between gap-2">
              <h2 id="ch1" className="font-bold text-slate-900">New members, last 30 days</h2>
              <span className="text-xs text-slate-400">{ov ? `${ov.series.reduce((n, d) => n + d.members, 0)} total` : ""}</span>
            </div>
            {ov ? <SignupChart series={ov.series} /> : <div className="h-48 animate-pulse rounded-xl bg-slate-100" />}
          </section>

          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-900">Members by pack</h2>
              <SplitBar parts={["all_current", "lifetime", "none"].map((p) => ({ label: PLAN[p].label, color: PLAN[p].color, value: byPlan(p)?.members || 0 }))} />
              <p className="mt-3 border-t pt-3 text-xs text-slate-500">
                Revenue: {["all_current", "lifetime", "none"].map((p) => `${PLAN[p].label} ${inr(byPlan(p)?.revenue)}`).join(" · ")}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-bold text-slate-900">Prep Arena matches</h2>
              <SplitBar
                parts={[
                  { label: "Added to arena accounts", color: "#2a78d6", value: ov?.matches.claimed || 0 },
                  { label: "Waiting for sign-up", color: "#eb6834", value: ov?.matches.waiting || 0 },
                ]}
              />
            </div>
          </section>
        </div>

        {/* ---------- tabs ---------- */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200" role="tablist">
          {TABS.map(([id, label, Icon]) => {
            const count = id === "suggestions" ? ov?.suggestions.new : id === "notices" ? ov?.booksNotYetSent : ov?.members.total;
            return (
              <button
                key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
                className={`-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition ${tab === id ? "border-orange-600 text-orange-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
              >
                <Icon size={16} /> {label}
                {count > 0 && <span className={`rounded-full px-2 py-0.5 text-[11px] ${tab === id ? "bg-orange-100 text-orange-700" : "bg-slate-100 text-slate-600"}`}>{count}</span>}
              </button>
            );
          })}
        </div>

        {error && <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700" role="alert"><AlertTriangle size={16} /> {error}</div>}
        {notice && <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-800" role="status"><CheckCircle2 size={16} /> {notice}</div>}
        {loading && <div className="mt-4 flex items-center gap-2 text-sm text-slate-500"><Loader2 size={15} className="animate-spin" /> Loading…</div>}

        {/* ================= MEMBERS ================= */}
        {tab === "members" && (
          <section className="mt-4">
            <div className="mb-3 flex flex-wrap gap-2">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search email" className="rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
              </div>
              <select value={plan} onChange={(e) => { setPlan(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">All packs</option><option value="all_current">All Books pack</option><option value="lifetime">Lifetime pack</option><option value="none">Books with matches</option>
              </select>
              <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">Any status</option><option value="active">Active</option><option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                  <tr><th className="p-3">Member</th><th className="p-3">Pack</th><th className="p-3">Status</th><th className="p-3">Prep Arena</th><th className="p-3">Purchase</th><th className="p-3">Memories code</th><th className="p-3 text-right">Actions</th></tr>
                </thead>
                <tbody>
                  {members.rows.map((m) => {
                    const p = PLAN[m.plan] || PLAN.none;
                    const sus = m.status === "suspended";
                    const g = m.matches?.granted || 0;
                    return (
                      <tr key={m._id} className={`border-t transition hover:bg-orange-50/40 ${sus ? "bg-rose-50/40" : ""}`}>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 flex-none place-items-center rounded-full text-sm font-extrabold text-white" style={{ background: p.color }}>{initials(m.name, m.email)}</span>
                            <div className="min-w-0"><div className="truncate font-semibold text-slate-900">{m.name || "-"}</div><div className="truncate text-xs text-slate-500">{m.email}</div></div>
                          </div>
                        </td>
                        <td className="p-3"><Chip className={p.soft}>{m.lifetime && <Crown size={11} />}{p.label}</Chip></td>
                        <td className="p-3">
                          {sus
                            ? <div><Chip className="bg-rose-50 text-rose-700 ring-rose-200"><Ban size={11} /> Suspended</Chip><div className="mt-1 max-w-[190px] text-xs text-slate-500" title={m.suspendReason}>{m.suspendReason}</div></div>
                            : <Chip className="bg-emerald-50 text-emerald-700 ring-emerald-200"><BadgeCheck size={11} /> Active</Chip>}
                        </td>
                        <td className="p-3">
                          {g > 0 ? (
                            <div className="text-xs">
                              <div className="font-semibold text-slate-800">{g} {g === 1 ? "match" : "matches"} <span className="font-normal text-slate-500">{m.matches?.claimedAt ? "added" : "waiting for sign-up"}</span></div>
                              {m.arena?.hasAccount
                                ? <div className="text-slate-500">{m.arena.matchesLeft} left · {m.arena.profileStatus ? `profile ${m.arena.profileStatus}` : "no profile yet"}</div>
                                : <div className="text-slate-400">No account yet</div>}
                            </div>
                          ) : <span className="text-xs text-slate-400">No matches</span>}
                        </td>
                        <td className="p-3 text-xs"><div className="font-semibold text-slate-800">{m.bookTitle || "-"}</div><div className="text-slate-500">{inr(m.paidAmount)} · {when(m.activatedAt)}</div><div className="font-mono text-[10px] text-slate-400">{m.orderId}</div></td>
                        <td className="p-3 text-xs">
                          {m.memories ? (
                            <div>
                              <div className="font-mono font-semibold text-slate-800">{m.memories.code || "not made yet"}</div>
                              <div title={m.memories.lastError} className={m.memories.used ? "text-emerald-700" : m.memories.mailStatus === "failed" ? "text-rose-600" : "text-slate-500"}>
                                {m.memories.used ? "page created" : `mail ${{ none: "not sent", sending: "sending", queued: "queued", sent: "sent", failed: "failed" }[m.memories.mailStatus] || m.memories.mailStatus}${m.memories.sends > 1 ? ` ×${m.memories.sends}` : ""}`}
                              </div>
                              {!m.memories.used && (
                                <button type="button" disabled={memBusy === m._id} onClick={() => resendMemories(m)} className="mt-1 inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2 py-1 text-[11px] font-bold text-orange-700 transition hover:bg-orange-100 disabled:opacity-50">
                                  {memBusy === m._id ? "Sending…" : m.memories.mailStatus === "failed" || m.memories.mailStatus === "none" ? "Retry mail" : "Resend mail"}
                                </button>
                              )}
                            </div>
                          ) : <span className="text-slate-300">Lifetime only</span>}
                        </td>
                        <td className="p-3">
                          <div className="flex justify-end gap-1.5">
                            {sus ? (
                              <button type="button" onClick={() => openModal({ type: "unsuspend", row: m })} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"><ShieldCheck size={13} /> Unsuspend</button>
                            ) : (
                              <button type="button" onClick={() => openModal({ type: "suspend", row: m })} className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100"><ShieldAlert size={13} /> Suspend</button>
                            )}
                            <button type="button" onClick={() => openModal({ type: "deleteMember", row: m })} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"><Trash2 size={13} /> Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!loading && members.rows.length === 0 && <tr><td colSpan={7} className="p-10 text-center text-slate-400">No members match.</td></tr>}
                </tbody>
              </table>
            </div>

            {members.pages > 1 && (
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">{members.total} members</span>
                <div className="flex items-center gap-2">
                  <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg border bg-white px-3 py-1.5 disabled:opacity-40">Prev</button>
                  <span>{page} / {members.pages}</span>
                  <button type="button" disabled={page >= members.pages} onClick={() => setPage(page + 1)} className="rounded-lg border bg-white px-3 py-1.5 disabled:opacity-40">Next</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ================= SUGGESTIONS ================= */}
        {tab === "suggestions" && (
          <section className="mt-4">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <select value={suggestStatus} onChange={(e) => setSuggestStatus(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
                <option value="">All statuses</option>{Object.entries(SUGGEST_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <span className="text-sm text-slate-500">{suggestions.length} request{suggestions.length === 1 ? "" : "s"}</span>
              <div className="ml-auto flex flex-wrap gap-2">
                {selected.size > 0 && (
                  <button type="button" onClick={() => openModal({ type: "bulk", title: `Delete ${selected.size} selected`, body: { ids: [...selected] }, count: selected.size })} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-sm font-bold text-white">
                    <Trash2 size={14} /> Delete selected ({selected.size})
                  </button>
                )}
                {suggestStatus && suggestions.length > 0 && (
                  <button type="button" onClick={() => openModal({ type: "bulk", title: `Delete all "${SUGGEST_STATUS[suggestStatus].label}"`, body: { status: suggestStatus }, count: suggestions.length })} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-600">
                    <Trash2 size={14} /> Delete all {SUGGEST_STATUS[suggestStatus].label.toLowerCase()}
                  </button>
                )}
                {!suggestStatus && suggestions.length > 0 && (
                  <button type="button" onClick={() => openModal({ type: "bulk", title: "Delete ALL suggestions", body: { all: true }, count: suggestions.length })} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-bold text-rose-600">
                    <Trash2 size={14} /> Delete all
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {suggestions.map((s) => {
                const st = SUGGEST_STATUS[s.status] || SUGGEST_STATUS.new;
                return (
                  <article key={s._id} className={`rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${selected.has(s._id) ? "border-orange-400 ring-2 ring-orange-100" : "border-slate-200"}`}>
                    <div className="flex items-start gap-3">
                      <input type="checkbox" checked={selected.has(s._id)} onChange={() => toggleSel(s._id)} aria-label={`Select ${s.title}`} className="mt-1 h-4 w-4 accent-orange-600" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">{s.title}</h3>
                          <Chip className={st.cls}>{st.label}</Chip>
                          {s.topic && <Chip className="bg-violet-50 text-violet-700 ring-violet-200">{s.topic}</Chip>}
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">{s.name || "Member"} · {s.email} · {when(s.createdAt)}</p>
                        {s.details && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{s.details}</p>}
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <select value={s.status} onChange={(e) => updateSuggestion(s._id, { status: e.target.value })} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold">
                            {Object.entries(SUGGEST_STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                          <input
                            defaultValue={s.adminNote} maxLength={300} placeholder="Internal note"
                            onBlur={(e) => e.target.value !== (s.adminNote || "") && updateSuggestion(s._id, { adminNote: e.target.value })}
                            className="min-w-[140px] flex-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs outline-none focus:border-orange-400"
                          />
                          <button type="button" onClick={() => openModal({ type: "deleteSuggestion", item: s })} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-50"><Trash2 size={12} /> Delete</button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
              {!loading && suggestions.length === 0 && <p className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">No suggestions yet. Pack members send them from Prep Arena, Books tab.</p>}
            </div>
          </section>
        )}

        {/* ================= ANNOUNCEMENTS ================= */}
        {tab === "notices" && (
          <section className="mt-4">
            <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <Mail size={18} className="mt-0.5 flex-none" />
              <p>
                <b>New books are never emailed automatically.</b> Publishing or editing a book sends nothing. Press <b>Send</b> on a book when you are ready. It goes to every eligible active pack member who has not been told yet
                (Lifetime: PDF link; All Books: new-book alert). Eligible now: <b>{ann.members.lifetime}</b> Lifetime and <b>{ann.members.allBooks}</b> All Books. Suspended members are skipped.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500"><tr><th className="p-3">Book</th><th className="p-3">Status</th><th className="p-3">Will receive</th><th className="p-3">Sent so far</th><th className="p-3" /></tr></thead>
                <tbody>
                  {ann.books.map((b) => (
                    <tr key={b._id} className="border-t transition hover:bg-orange-50/40">
                      <td className="p-3"><div className="flex items-center gap-3">{b.coverPageUrl ? <img src={b.coverPageUrl} alt="" className="h-14 w-10 rounded object-cover shadow" /> : <span className="grid h-14 w-10 place-items-center rounded bg-orange-50 text-orange-500"><BookOpen size={16} /></span>}<div><div className="font-semibold">{b.title}</div><div className="text-xs text-slate-500">Added {when(b.createdAt)}</div></div></div></td>
                      <td className="p-3">
                        {!b.notice && <Chip className="bg-slate-100 text-slate-600 ring-slate-200">Not sent</Chip>}
                        {b.notice?.status === "done" && <Chip className="bg-emerald-50 text-emerald-700 ring-emerald-200"><CheckCircle2 size={11} /> Sent</Chip>}
                        {b.notice?.status === "running" && <Chip className="bg-sky-50 text-sky-700 ring-sky-200">Sending…</Chip>}
                        {b.notice?.status === "failed" && <Chip className="bg-rose-50 text-rose-700 ring-rose-200">Some failed</Chip>}
                        {b.notice?.lastError && <div className="mt-1 text-xs text-rose-600">{b.notice.lastError}</div>}
                      </td>
                      <td className="p-3">{b.pending.total > 0 ? <>{b.pending.total} <span className="text-xs text-slate-500">({b.pending.lifetime} Lifetime, {b.pending.allBooks} All Books)</span></> : <span className="text-slate-400">Nobody waiting</span>}</td>
                      <td className="p-3">{b.notice ? `${b.notice.sent} sent${b.notice.failed ? `, ${b.notice.failed} failed` : ""}` : "-"}</td>
                      <td className="p-3 text-right">
                        <button type="button" disabled={b.pending.total === 0 || b.notice?.status === "running"} onClick={() => openModal({ type: "send", book: b })} className="rounded-lg bg-gradient-to-r from-orange-600 to-amber-500 px-3.5 py-1.5 text-xs font-bold text-white shadow transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40">
                          {b.pending.total === 0 ? "Nothing to send" : `Send to ${b.pending.total}`}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && ann.books.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-slate-400">No announceable books yet. A book must be published, in Main Books and have a PDF.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {modal?.type === "suspend" && (
        <Modal title="Suspend this membership?" icon={ShieldAlert} tone="orange" onClose={closeModal} busy={busy}>
          <MemberBox row={modal.row} />
          <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
            <li className="flex gap-2"><Ban size={15} className="mt-0.5 flex-none text-rose-500" /> They cannot enter Prep Arena (their profile is suspended).</li>
            <li className="flex gap-2"><Ban size={15} className="mt-0.5 flex-none text-rose-500" /> The Books tab, book requests and new-book emails stop.</li>
            <li className="flex gap-2"><Gift size={15} className="mt-0.5 flex-none text-emerald-600" /> Their unused matches stay. When you unsuspend, they return with the same matches left.</li>
          </ul>
          <label className="mt-4 block text-sm font-semibold text-slate-700">Reason (shown to the arena team)
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} rows={3} placeholder="e.g. Shared the PDFs publicly" className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-sm font-normal outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
          </label>
          <ModalError msg={modalError} />
          <Actions busy={busy} onCancel={closeModal} onOk={doSuspend} okLabel="Suspend membership" okTone="amber" disabled={reason.trim().length < 3} />
        </Modal>
      )}

      {modal?.type === "unsuspend" && (
        <Modal title="Unsuspend this membership?" icon={ShieldCheck} tone="green" onClose={closeModal} busy={busy}>
          <MemberBox row={modal.row} />
          <p className="mt-4 text-sm text-slate-700">They can enter Prep Arena again, with the <b>same matches they had left</b>, and the Books tab and book alerts work again.</p>
          {modal.row.suspendReason && <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-500">Suspended for: {modal.row.suspendReason}</p>}
          <ModalError msg={modalError} />
          <Actions busy={busy} onCancel={closeModal} onOk={doUnsuspend} okLabel="Unsuspend" okTone="green" />
        </Modal>
      )}

      {modal?.type === "deleteMember" && (
        <Modal title="Delete this membership permanently?" icon={Trash2} tone="red" onClose={closeModal} busy={busy}>
          <MemberBox row={modal.row} />
          <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
            <li className="flex gap-2"><Trash2 size={15} className="mt-0.5 flex-none text-rose-500" /> The membership record is removed. They lose the Books tab, requests and new-book emails.</li>
            {modal.row.matches?.granted > 0 && !modal.row.matches?.claimedAt && <li className="flex gap-2"><Trash2 size={15} className="mt-0.5 flex-none text-rose-500" /> {modal.row.matches.granted} matches still waiting for sign-up are lost.</li>}
            <li className="flex gap-2"><Gift size={15} className="mt-0.5 flex-none text-emerald-600" /> Matches already added to their Prep Arena account stay (change them in Arena admin if needed). The payment record is not touched.</li>
          </ul>
          <label className="mt-4 block text-sm font-semibold text-slate-700">Type <b className="font-mono">DELETE</b> to confirm
            <input value={typed} onChange={(e) => setTyped(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-mono text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" autoComplete="off" />
          </label>
          <ModalError msg={modalError} />
          <Actions busy={busy} onCancel={closeModal} onOk={doDeleteMember} okLabel="Delete permanently" okTone="red" disabled={typed !== "DELETE"} />
        </Modal>
      )}

      {modal?.type === "deleteSuggestion" && (
        <Modal title="Delete this suggestion?" icon={Trash2} tone="red" onClose={closeModal} busy={busy}>
          <div className="mt-4 rounded-xl border bg-slate-50 p-3"><div className="font-semibold">{modal.item.title}</div><div className="text-xs text-slate-500">{modal.item.email}</div></div>
          <p className="mt-3 text-sm text-slate-700">It is deleted permanently and disappears from the member&apos;s &quot;Your requests&quot; list too. This cannot be undone.</p>
          <ModalError msg={modalError} />
          <Actions busy={busy} onCancel={closeModal} onOk={doDeleteSuggestion} okLabel="Delete permanently" okTone="red" />
        </Modal>
      )}

      {modal?.type === "bulk" && (
        <Modal title={modal.title} icon={Trash2} tone="red" onClose={closeModal} busy={busy}>
          <p className="mt-4 text-sm text-slate-700"><b>{modal.count}</b> suggestion{modal.count === 1 ? "" : "s"} will be deleted permanently, and disappear from the members&apos; lists. This cannot be undone.</p>
          {modal.body.all && (
            <label className="mt-4 block text-sm font-semibold text-slate-700">Type <b className="font-mono">DELETE</b> to confirm
              <input value={typed} onChange={(e) => setTyped(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 font-mono text-sm outline-none focus:border-rose-400" autoComplete="off" />
            </label>
          )}
          <ModalError msg={modalError} />
          <Actions busy={busy} onCancel={closeModal} onOk={doBulkDelete} okLabel="Delete permanently" okTone="red" disabled={Boolean(modal.body.all) && typed !== "DELETE"} />
        </Modal>
      )}

      {modal?.type === "send" && (
        <Modal title="Send this book to members?" icon={Mail} tone="orange" onClose={closeModal} busy={busy}>
          <div className="mt-4 flex items-center gap-3 rounded-xl border bg-slate-50 p-3">
            {modal.book.coverPageUrl && <img src={modal.book.coverPageUrl} alt="" className="h-14 w-10 rounded object-cover" />}
            <div className="min-w-0"><div className="truncate font-semibold">{modal.book.title}</div><div className="text-xs text-slate-500">Added {when(modal.book.createdAt)}</div></div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li className="flex justify-between"><span>Lifetime members (PDF link)</span><b>{modal.book.pending.lifetime}</b></li>
            <li className="flex justify-between"><span>All Books members (new-book alert)</span><b>{modal.book.pending.allBooks}</b></li>
            <li className="flex justify-between border-t pt-2"><span>Total emails</span><b>{modal.book.pending.total}</b></li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">Unsubscribed All Books members and suspended members are skipped. Members already told are not emailed again. This cannot be undone.</p>
          <ModalError msg={modalError} />
          <Actions busy={busy} onCancel={closeModal} onOk={doSend} okLabel={`Send to ${modal.book.pending.total}`} okTone="orange" />
        </Modal>
      )}
    </div>
  );
}
