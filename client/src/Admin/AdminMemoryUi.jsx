import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { Inbox, Loader2, MoreVertical, X } from "lucide-react";

/*
  Shared pieces of the Memory admin screens (small components, formatters, and the lazy-loading list hook).
  Kept in one place so each tab can be loaded on demand.
*/
export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
export const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-");
export const errText = (e, fb = "Something went wrong") => e?.response?.data?.message || e?.message || fb;
export const bytes = (n) => (n > 1e9 ? `${(n / 1e9).toFixed(2)} GB` : `${(n / 1e6).toFixed(1)} MB`);


export const STATUS = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  closed: "bg-amber-50 text-amber-700 ring-amber-200",
  blocked: "bg-rose-50 text-rose-700 ring-rose-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  created: "bg-slate-100 text-slate-700 ring-slate-200",
  failed: "bg-rose-50 text-rose-700 ring-rose-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

/* ---------------------------------------------------- small pieces */

export function Chip({ children, className = "bg-slate-100 text-slate-700 ring-slate-200" }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ring-1 ring-inset ${className}`}>{children}</span>;
}

export function Btn({ children, onClick, tone = "default", disabled, title, type = "button" }) {
  const tones = {
    default: "border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50",
    primary: "border-transparent bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow hover:brightness-110",
    danger: "border-rose-200 bg-rose-50/60 text-rose-600 hover:bg-rose-100",
  };
  return (
    <button type={type} title={title} disabled={disabled} onClick={onClick}
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]}`}>
      {children}
    </button>
  );
}

export const KPI_TONES = {
  rose: "from-pink-500 to-rose-500",
  indigo: "from-indigo-500 to-violet-500",
  emerald: "from-emerald-500 to-teal-500",
  amber: "from-amber-500 to-orange-500",
  sky: "from-sky-500 to-blue-500",
};

export function Kpi({ label, value, icon: Icon, tone = "rose" }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${KPI_TONES[tone]} opacity-10 transition group-hover:scale-125`} aria-hidden="true" />
      <span className={`mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${KPI_TONES[tone]} text-white shadow`}><Icon size={19} /></span>
      <div className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}

export function Avatar({ name, email }) {
  const t = String(name || email || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pink-100 to-indigo-100 text-[11px] font-bold text-slate-700">{t}</span>;
}

export function Person({ name, email, phone }) {
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={name} email={email} />
      <div className="min-w-0"><div className="truncate font-semibold text-slate-900">{name || "-"}</div><div className="truncate text-xs text-slate-500">{email}</div>{phone && <div className="truncate text-xs text-slate-500">📞 {phone}</div>}</div>
    </div>
  );
}

export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`max-h-[90vh] w-full overflow-auto rounded-2xl bg-white p-5 shadow-2xl ${wide ? "max-w-3xl" : "max-w-md"}`}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </div>
        {children}
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function Table({ cols, rows, empty = "Nothing here yet" }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-rose-50/40 text-[11px] uppercase tracking-wider text-slate-500">
          <tr>{cols.map((c) => <th key={c.h} className="px-3 py-2.5 font-semibold">{c.h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length} className="px-3 py-14 text-center text-slate-400"><Inbox className="mx-auto mb-2" size={28} />{empty}</td></tr>
          ) : rows.map((r) => (
            <tr key={r.id} className="align-middle transition hover:bg-rose-50/30">
              {cols.map((c) => <td key={c.h} className="px-3 py-2.5">{c.v(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Pager({ page, pages, onPage }) {
  if (!pages || pages < 2) return null;
  return (
    <div className="mt-3 flex items-center justify-end gap-2 text-xs text-slate-500">
      <Btn disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</Btn>
      <span>Page {page} of {pages}</span>
      <Btn disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Btn>
    </div>
  );
}

export const Field = ({ label, children, hint }) => (
  <label className="mb-3 block text-xs font-semibold text-slate-600">
    {label}
    <div className="mt-1 font-normal">{children}</div>
    {hint && <span className="mt-1 block font-normal text-slate-400">{hint}</span>}
  </label>
);
export const inputCls = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";


/*
  LAZY LOADING. A long list (users, logins) is fetched a page at a time with a cursor from the server: the first page when the tab opens,
  the next one when you scroll near the bottom. Changing the search or a filter starts over. A slow, older answer never overwrites a newer one.
*/
export function useCursorList({ http, path, params, limit = 25 }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const cursor = useRef(null);
  const gen = useRef(0);
  const busy = useRef(false);
  const key = JSON.stringify(params);

  const fetchPage = useCallback(async (reset) => {
    if (!reset && (busy.current || !cursor.current)) return;
    const mine = reset ? ++gen.current : gen.current;
    busy.current = true;
    setLoading(true);
    try {
      const r = await http.get(path, { params: { ...params, limit, ...(reset ? { withTotal: 1 } : { cursor: cursor.current }) } });
      if (mine !== gen.current) return;
      const d = r.data.data;
      setItems((prev) => (reset ? d.items : [...prev, ...d.items]));
      cursor.current = d.nextCursor || null;
      setHasMore(Boolean(d.hasMore));
      if (reset) setTotal(d.total ?? null);
    } catch (e) {
      if (mine === gen.current) { toast.error(errText(e)); setHasMore(false); }
    } finally {
      if (mine === gen.current) { setLoading(false); busy.current = false; }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [http, path, key, limit]);

  useEffect(() => {
    cursor.current = null;
    setItems([]);
    setHasMore(false);
    const t = setTimeout(() => fetchPage(true), params.q ? 300 : 0); // typing in the search box waits a moment
    return () => clearTimeout(t);
  }, [fetchPage]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items, total, hasMore, loading, initial: loading && items.length === 0,
    loadMore: () => fetchPage(false), reload: () => fetchPage(true),
    patch: (id, change) => setItems((l) => l.map((x) => (x.id === id ? { ...x, ...change } : x))),
    remove: (id) => { setItems((l) => l.filter((x) => x.id !== id)); setTotal((t) => (t == null ? t : Math.max(0, t - 1))); },
  };
}

/** Sits under a list: loads the next page when it scrolls into view. Also a button, for keyboards and for browsers without IntersectionObserver. */
export function MoreSentinel({ hasMore, loading, onMore, shown, total }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!hasMore || typeof IntersectionObserver === "undefined" || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) onMore(); }, { rootMargin: "400px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [hasMore, onMore, shown]);
  return (
    <div ref={ref} className="mt-3 flex items-center justify-center gap-3 py-2 text-xs text-slate-500">
      {loading ? <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Loading…</span>
        : hasMore ? <button type="button" onClick={onMore} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50">Load more</button>
        : shown > 0 ? <span>{total != null ? `All ${total} shown` : `${shown} shown`}</span> : null}
    </div>
  );
}

/*
  THREE-DOT MENU. Opens a list of actions next to the button. It is positioned on the screen (not inside the table or card), so a scrolling
  container can never clip it, and it flips upward near the bottom. Closes on a click outside, Escape or scroll.
  items: [{ label, icon, onClick, tone: "danger", hidden, divider }]
*/
export function ActionMenu({ items, label = "More actions" }) {
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  const menu = useRef(null);
  const shown = items.filter((i) => !i.hidden);

  useEffect(() => {
    if (!pos) return undefined;
    const close = () => setPos(null);
    const down = (e) => { if (!menu.current?.contains(e.target) && !btn.current?.contains(e.target)) close(); };
    const key = (e) => e.key === "Escape" && (close(), btn.current?.focus());
    document.addEventListener("mousedown", down);
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => { document.removeEventListener("mousedown", down); document.removeEventListener("keydown", key); window.removeEventListener("scroll", close, true); window.removeEventListener("resize", close); };
  }, [pos]);

  const toggle = () => {
    if (pos) return setPos(null);
    const r = btn.current.getBoundingClientRect();
    const h = shown.length * 38 + 16;
    const up = r.bottom + h > window.innerHeight - 8;
    setPos({ right: Math.max(8, window.innerWidth - r.right), ...(up ? { bottom: window.innerHeight - r.top + 6 } : { top: r.bottom + 6 }) });
  };

  return (
    <>
      <button ref={btn} type="button" onClick={toggle} aria-label={label} aria-haspopup="menu" aria-expanded={Boolean(pos)}
        className={`grid h-8 w-8 place-items-center rounded-lg border text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 ${pos ? "border-slate-300 bg-slate-100" : "border-transparent"}`}><MoreVertical size={17} /></button>
      {pos && createPortal(
        <div ref={menu} role="menu" style={{ position: "fixed", ...pos }} className="z-[60] w-56 rounded-xl border border-slate-200 bg-white p-1 shadow-2xl ring-1 ring-black/5">
          {shown.map((it) => (
            <div key={it.label}>
              {it.divider && <div className="my-1 border-t border-slate-100" />}
              <button type="button" role="menuitem" onClick={() => { setPos(null); it.onClick(); }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-semibold transition ${it.tone === "danger" ? "text-rose-600 hover:bg-rose-50" : "text-slate-700 hover:bg-slate-50"}`}>
                {it.icon && <span className={it.tone === "danger" ? "text-rose-400" : "text-slate-400"}>{it.icon}</span>}{it.label}
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
