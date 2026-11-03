import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";

import { adminHttp as api, errMsg } from "../api";
import { Badge, Button, Modal, cx } from "../ui";

/* ------------------------------ data loading ------------------------------ */
export const useList = (path, params) => {
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const key = JSON.stringify(params);
  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const { data } = await api.get(path, { params });
      setState({ loading: false, data: data.data, error: "" });
    } catch (e) {
      setState({ loading: false, data: null, error: errMsg(e) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, key]);
  useEffect(() => { load(); }, [load]);
  return [state, load];
};

export const useDebounced = (value, ms = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

/* -------------------------------- formatting -------------------------------- */
export const fmtDateTime = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", hour12: true })
    : "—";

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) : "");

/** ₹1,234.50: always two decimals so ledger columns line up. */
export const rupees2 = (paise) =>
  `₹${((Number(paise) || 0) / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const humanize = (s) => String(s ?? "").replace(/_/g, " ");

/* --------------------------------- layout bits --------------------------------- */
const TEXT = "text-[#29201b] dk:text-[#fff7ed]";
export const MUTED = "text-stone-500 dk:text-[#b9a79c]";

export function Pager({ page, setPage, total, pageSize }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return <p className={cx("mt-3 text-right text-xs", MUTED)}>{total} total</p>;
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600 dk:text-[#d6c4b8]">
      <span className="text-xs">{total} total</span>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
        Page {page} / {pages}
        <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

/** head: array of strings, or { label, right } */
export const Table = ({ head, children, dense }) => (
  <div className="overflow-x-auto rounded-2xl border border-[#f0ded0] bg-white dk:border-[#443127] dk:bg-[#241b15]">
    <table className={cx("min-w-full divide-y divide-[#f0ded0] text-sm dk:divide-[#443127]", dense && "text-[13px]")}>
      <thead className="bg-[#fff8f2] text-left text-xs font-semibold uppercase tracking-wide text-stone-500 dk:bg-[#15110e] dk:text-[#b9a79c]">
        <tr>
          {head.map((h) => {
            const label = typeof h === "string" ? h : h.label;
            return <th key={label} className={cx("whitespace-nowrap px-4 py-3", h.right && "text-right")}>{label}</th>;
          })}
        </tr>
      </thead>
      <tbody className="divide-y divide-orange-100 dk:divide-orange-500/20">{children}</tbody>
    </table>
  </div>
);

export const Td = ({ children, className }) => (
  <td className={cx("px-4 py-3 align-top text-stone-700 dk:text-[#ead9cc]", className)}>{children}</td>
);

export function Person({ p, compact }) {
  if (!p) return <span className={MUTED}>(deleted member)</span>;
  return (
    <div className="min-w-[11rem]">
      <p className={cx("font-semibold", TEXT)}>{p.name || p.realName || "—"}</p>
      <p className={cx("text-xs", MUTED)}>{p.alias}</p>
      {!compact && p.email && <p className="break-all text-xs text-stone-600 dk:text-[#d6c4b8]">{p.email}</p>}
      {!compact && p.phone && <p className={cx("text-xs", MUTED)}>{p.phone}</p>}
    </div>
  );
}

/* A row of status filters with live counts. */
export function StatusPills({ options, value, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {options.map(([v, label]) => {
        const n = v === "" ? Object.values(counts ?? {}).reduce((a, b) => a + b, 0) : counts?.[v];
        const on = value === v;
        return (
          <button
            key={v || "all"}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(v)}
            className={cx(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold ring-1 transition-colors",
              on
                ? "bg-orange-600 text-white ring-orange-600"
                : "bg-white text-stone-700 ring-[#f0ded0] hover:bg-orange-50 dk:bg-[#241b15] dk:text-[#ead9cc] dk:ring-[#443127] dk:hover:bg-[#2c211b]"
            )}
          >
            {label}
            {n != null && (
              <span className={cx("rounded-full px-1.5 text-xs", on ? "bg-white/25" : "bg-stone-100 text-stone-600 dk:bg-[#35261e] dk:text-[#d6c4b8]")}>{n}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder = "Search name, email, member ID…", className }) {
  return (
    <div className={cx("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="block min-h-[2.75rem] w-full rounded-xl border border-stone-300 bg-white py-2.5 pl-9 pr-9 text-sm text-[#29201b] placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dk:border-[#5a4336] dk:bg-[#241b15] dk:text-[#fff7ed] dk:placeholder:text-[#8f7c70] dk:focus:ring-orange-500/30"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:text-stone-700" aria-label="Clear search">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

const STATUS_TONE = {
  pending: "amber", accepted: "emerald", rejected: "rose", withdrawn: "slate", cancelled: "slate", expired: "slate",
  active: "emerald", ended: "slate", dissolved: "rose",
  paid: "brand", in_match: "emerald", consumed: "slate", pending_payment: "amber",
  open: "amber", actioned: "emerald", dismissed: "slate",
  in_progress: "brand", resolved: "emerald", wont_fix: "slate",
  draft: "slate", matched: "emerald", suspended: "rose",
};
export const StatusBadge = ({ status, children }) => <Badge tone={STATUS_TONE[status] ?? "slate"}>{children ?? humanize(status)}</Badge>;

/* Destructive actions get an explicit, plain-language confirmation. */
export function ConfirmModal({ open, onClose, title, children, confirmLabel = "Delete permanently", onConfirm, busy }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="danger" loading={busy} onClick={onConfirm}>{confirmLabel}</Button></>}
    >
      {children}
    </Modal>
  );
}

export { api, errMsg };
