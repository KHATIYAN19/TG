import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowRight, ArrowsClockwise, Bank, BookOpen, ChartBar, ChartLineUp, Coins, CreditCard, DownloadSimple, EyeSlash,
  FileText, Handshake, Heart, Info, Lock, MagnifyingGlass, Receipt, ShieldCheck, Sparkle, SquaresFour, Tag, TrendDown,
  TrendUp, Users, X,
} from "@phosphor-icons/react";

import { accountHttp, errMsg } from "../arena/api";
import { Btn, Page, cx } from "../resume/ui";
import { Badge, Pager } from "../referral/ui";
import { Card, Kpi, count, day, money, stamp } from "../component/UserProfile.jsx";
import "../referral/referral.css";
import "../Admin/adminReferrals.css";
import "../Admin/adminResume.css";
import "../component/profile.css";
import "../Admin/adminUsers.css";
import "./partner.css";

/*
  PARTNER DASHBOARD  (/partners/dashboard)
  Read-only revenue for the products an admin shared. The server decides every number and column:
  anything this partner may not see is simply absent from the response, so the screen only renders what arrives.
  Customer details (name, email, phone…) are never sent to partners.

    #overview       headline numbers, revenue by day, product split, recent payments
    #transactions   every payment: search, product / status / code filters, CSV
    #codes          coupons and referral codes used

  <PartnerView api={…} preview /> is the same screen, used by admins to preview a partner (Admin/AdminPartners.jsx).
*/

export const PRODUCT_ICON = { books: BookOpen, prepBuddy: Sparkle, memories: Heart, resume: FileText, referral: Users };
const PRODUCT_LABEL = { books: "Books", prepBuddy: "Prep Buddy", memories: "Memories", resume: "Resume Lab", referral: "Referrals" };
const STATUS = {
  paid: ["Paid", "ok"], partial_refund: ["Part refunded", "warn"], refunded: ["Refunded", "bad"], pending: ["Pending", "info"], failed: ["Failed / expired", "muted"],
};
const RANGES = [["7d", "7 days"], ["30d", "30 days"], ["90d", "90 days"], ["365d", "1 year"], ["all", "All time"]];

export const partnerApi = {
  me: () => accountHttp.get("/partner/me").then((r) => r.data.data),
  overview: (params) => accountHttp.get("/partner/overview", { params }).then((r) => r.data.data),
  transactions: (params) => accountHttp.get("/partner/transactions", { params }).then((r) => r.data.data),
  exportCsv: (params) => accountHttp.get("/partner/export", { params, responseType: "blob", timeout: 90000 }),
};
export const previewApi = (id) => ({
  me: () => accountHttp.get(`/admin/partners/${id}/preview/me`).then((r) => r.data.data),
  overview: (params) => accountHttp.get(`/admin/partners/${id}/preview/overview`, { params }).then((r) => r.data.data),
  transactions: (params) => accountHttp.get(`/admin/partners/${id}/preview/transactions`, { params }).then((r) => r.data.data),
});

const has = (o, k) => o && Object.prototype.hasOwnProperty.call(o, k);
const inr = (paise) => money((Number(paise) || 0) / 100);
const pctChange = (now, before) => (before > 0 ? Math.round(((now - before) / before) * 100) : null);
const useDebounced = (v, ms = 350) => { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]); return d; };

/* one request per screen; an older answer never overwrites a newer one */
function useLoad(fn, key, enabled = true) {
  const [state, setState] = useState({ data: null, error: "", code: "", loading: enabled });
  const seq = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(async () => {
    const n = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: "", code: "" }));
    try { const d = await fnRef.current(); if (n === seq.current) setState({ data: d, error: "", code: "", loading: false }); }
    catch (e) { if (n === seq.current) setState((s) => ({ ...s, error: errMsg(e), code: e?.response?.data?.code || "", loading: false })); }
  }, []);
  useEffect(() => { if (enabled) run(); }, [key, run, enabled]);
  return { ...state, reload: run };
}

/* ------------------------------------------------------------ small parts */
const ErrorBox = ({ error, retry }) => <div className="acx-error" role="alert"><span>{error}</span><Btn variant="ghost" size="sm" onClick={retry}>Try again</Btn></div>;
const StatusTag = ({ s }) => { const [l, t] = STATUS[s] || [s, "muted"]; return <Badge tone={t}>{l}</Badge>; };
const ProductTag = ({ p }) => { const I = PRODUCT_ICON[p] || Receipt; return <span className="pt-prod"><I size={14} weight="bold" aria-hidden />{PRODUCT_LABEL[p] || p}</span>; };
const Delta = ({ now, before }) => {
  const d = pctChange(now, before);
  if (d === null) return null;
  const up = d >= 0;
  return <span className={cx("pt-delta", up ? "up" : "down")}>{up ? <TrendUp size={13} weight="bold" aria-hidden /> : <TrendDown size={13} weight="bold" aria-hidden />}{up ? "+" : ""}{d}% <span className="sr-only">vs the previous period</span></span>;
};

function Blocked({ code, message, preview }) {
  const map = {
    PARTNER_PORTAL_OFF: ["The partner dashboard is switched off", "The Target Trek team has paused the partner dashboard for now. Please check back later."],
    PARTNER_EXPIRED: ["Your access has ended", "Your partner access period is over. Contact the Target Trek team to extend it."],
    PARTNER_PAUSED: ["Your access is paused", "Your partner access is paused. Contact the Target Trek team if you think this is a mistake."],
    PARTNER_NO_PRODUCTS: ["Nothing shared yet", "No products have been shared with you yet. The team will open your dashboard soon."],
  };
  const [title, text] = map[code] || ["Not available", message || "This dashboard isn't available right now."];
  return (
    <div className="pt-blocked">
      <span className="pt-blocked-ico"><Lock size={26} weight="duotone" aria-hidden /></span>
      <h2>{title}</h2>
      <p>{preview ? `This partner currently sees: “${text}”` : text}</p>
    </div>
  );
}

/* ------------------------------------------------------------ revenue chart (one series, hover / tap to read) */
function RevenueChart({ series, showAmount, loading }) {
  const [metric, setMetric] = useState(showAmount ? "amount" : "count");
  const [hover, setHover] = useState(null);
  useEffect(() => { if (!showAmount) setMetric("count"); }, [showAmount]);
  useEffect(() => setHover(null), [series]);
  const pts = series || [];
  const fmt = (v) => (metric === "amount" ? inr(v) : count(v));
  const total = pts.reduce((s, p) => s + (Number(p[metric]) || 0), 0);
  const top = Math.max(1, ...pts.map((p) => Number(p[metric]) || 0));
  const every = Math.ceil(pts.length / 8);
  const monthly = pts.some((p) => p.month);
  const hp = hover === null ? null : pts[hover];
  const label = (p) => (p.month ? new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(new Date(`${p.date}T00:00:00+05:30`)) : day(`${p.date}T00:00:00+05:30`));
  const tick = (p) => (p.month ? new Intl.DateTimeFormat("en-IN", { month: "short" }).format(new Date(`${p.date}T00:00:00+05:30`)) : p.date.slice(5).split("-").reverse().join("/"));

  return (
    <Card icon={ChartBar} title={metric === "amount" ? (monthly ? "Revenue by month" : "Revenue by day") : (monthly ? "Payments by month" : "Payments by day")}
      caption="Paid orders only, in IST. Hover or tap a bar to read it."
      action={showAmount && <div className="acx-seg" role="group" aria-label="Measure">{[["amount", "Revenue"], ["count", "Payments"]].map(([k, l]) => <button key={k} type="button" aria-pressed={metric === k} onClick={() => { setMetric(k); setHover(null); }}>{l}</button>)}</div>}>
      <div className={cx(loading && "rlx-dim")}>
        <div className="acx-readout" aria-live="polite">
          <span>{hp ? label(hp) : "Total for this range"}</span>
          <b>{fmt(hp ? hp[metric] : total)}{hp && metric === "amount" && has(hp, "count") ? <small className="pt-readout-sub"> · {count(hp.count)} payments</small> : null}</b>
        </div>
        {pts.length === 0 || total === 0 ? <p className="acx-note" style={{ marginTop: 12 }}>No paid orders in this range yet.</p> : (
          <div className={cx("acx-chart", pts.length > 60 && "many")} style={{ marginTop: 14 }} onMouseLeave={() => setHover(null)}>
            {pts.map((p, i) => {
              const v = Number(p[metric]) || 0;
              return (
                <button key={p.date} type="button" className={hover === i ? "on" : ""} aria-label={`${label(p)}: ${fmt(v)}`}
                  onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)}>
                  <i style={{ height: `${v > 0 ? Math.max(3, (v / top) * 100) : 1}%` }} />
                  {(pts.length <= 10 || i % every === 0) && <em>{tick(p)}</em>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------ transactions table (columns follow permissions) */
function columnsFor(f) {
  return [
    f.amount && { key: "amount", label: "Paid", num: true, cell: (r) => <><b className="mono">{inr(r.amount)}</b>{f.listPrice && r.discount > 0 && <span className="sub">−{inr(r.discount)} off {inr(r.listPrice)}</span>}</> },
    !f.amount && f.listPrice && { key: "list", label: "List price", num: true, cell: (r) => <><span className="mono">{inr(r.listPrice)}</span>{r.discount > 0 && <span className="sub">−{inr(r.discount)} discount</span>}</> },
    f.status && { key: "status", label: "Status", cell: (r) => <StatusTag s={r.status} /> },
    f.coupon && { key: "coupon", label: "Coupon", cell: (r) => (r.coupon ? <span className="pt-code"><Tag size={12} weight="bold" aria-hidden />{r.coupon}</span> : <span className="pt-dim">—</span>) },
    f.referralCode && { key: "ref", label: "Referral", cell: (r) => (r.referralCode ? <span className="pt-code"><Handshake size={12} weight="bold" aria-hidden />{r.referralCode}</span> : <span className="pt-dim">—</span>) },
    f.referralAmount && { key: "refAmt", label: "Referral amt", num: true, cell: (r) => (r.referralAmount ? <span className="mono">{inr(r.referralAmount)}</span> : <span className="pt-dim">—</span>) },
    f.refund && { key: "refund", label: "Refunded", num: true, cell: (r) => (r.refunded ? <span className="mono pt-neg">−{inr(r.refunded)}</span> : <span className="pt-dim">—</span>) },
    f.gateway && { key: "gw", label: "Gateway", cell: (r) => <span className="pt-cap">{r.gateway || "—"}</span> },
    f.transactionId && { key: "txn", label: "Transaction ID", cell: (r) => <span className="mono pt-id">{r.txnId || "—"}</span> },
    f.orderId && { key: "order", label: "Order ID", cell: (r) => <span className="mono pt-id">{r.ref || "—"}</span> },
  ].filter(Boolean);
}

/* onHide (admin preview only): a "Hide" button per row; rows carry hideId only in the preview */
function TxTable({ rows, fields, onHide }) {
  const cols = columnsFor(fields);
  const [busy, setBusy] = useState(null);
  const hide = async (id) => { setBusy(id); try { await onHide(id); } finally { setBusy(null); } };
  return (
    <div className="arx-table-wrap pt-table">
      <table className="arx-table">
        <thead><tr><th>Payment</th>{cols.map((c) => <th key={c.key} className={c.num ? "num" : undefined}>{c.label}</th>)}{onHide && <th><span className="sr-only">Hide</span></th>}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={`${r.product}-${r.ref || r.txnId || ""}-${r.at}-${i}`}>
              <td className="first">
                <b>{fields.item && r.item ? r.item : PRODUCT_LABEL[r.product]}</b>
                <span className="sub"><ProductTag p={r.product} /> · {stamp(r.at)}</span>
              </td>
              {cols.map((c) => <td key={c.key} data-label={c.label} className={c.num ? "num" : undefined}>{c.cell(r)}</td>)}
              {onHide && (
                <td className="act">
                  {r.hideId
                    ? <Btn variant="ghost" size="sm" loading={busy === r.hideId} disabled={Boolean(busy)} onClick={() => hide(r.hideId)} title={`Hide ${r.hideId} from this partner`}><EyeSlash size={14} />Hide</Btn>
                    : <span className="pt-dim" title="This payment has no ID to hide by">—</span>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------ overview */
function Overview({ api, perms, query, go, openCode, onHide }) {
  const ov = useLoad(() => api.overview(query), JSON.stringify(query));
  const recent = useLoad(() => api.transactions({ ...query, limit: 10, page: 1 }), `r:${JSON.stringify(query)}`, perms.sections.transactions);
  const d = ov.data;
  if (ov.error && !d) return ov.code?.startsWith("PARTNER_") ? <Blocked code={ov.code} message={ov.error} /> : <ErrorBox error={ov.error} retry={ov.reload} />;
  if (!d) return <div className="acx-stack"><div className="arx-kpis">{Array.from({ length: 4 }, (_, i) => <div key={i} className="acx-skel" style={{ height: 96 }} />)}</div><div className="acx-skel" style={{ height: 280 }} /></div>;

  if (d.range?.outside) return <div className="rf-empty"><span className="e">📅</span><h3>Outside your shared dates</h3><p>Nothing in this range is shared with you. Pick another range.</p></div>;
  const t = d.totals;
  const kpis = t ? [
    has(t, "amount") && <Kpi key="rev" icon={Coins} label="Revenue" value={inr(t.amount)} sub={d.previous && has(d.previous, "amount") ? <Delta now={t.amount} before={d.previous.amount} /> : "Paid orders"} />,
    has(t, "net") && <Kpi key="net" icon={Bank} label="Net after refunds" value={inr(t.net)} sub={t.refunded ? `${inr(t.refunded)} refunded` : "No refunds"} />,
    <Kpi key="cnt" icon={Receipt} label="Payments" value={count(t.count)} sub={d.previous ? <Delta now={t.count} before={d.previous.count} /> : "Paid orders"} />,
    has(t, "amount") && t.count > 0 && <Kpi key="avg" icon={ChartLineUp} label="Average order" value={inr(Math.round(t.amount / t.count))} sub="Revenue ÷ payments" />,
    has(t, "referralAmount") && <Kpi key="ra" icon={Handshake} label="Referral amount" value={inr(t.referralAmount)} sub={has(t, "referralUses") ? `${count(t.referralUses)} referred payments` : "Commission on codes"} />,
    !has(t, "referralAmount") && has(t, "referralUses") && <Kpi key="ru" icon={Handshake} label="Referred payments" value={count(t.referralUses)} sub="Paid with a referral code" />,
    has(t, "discount") && <Kpi key="disc" icon={Tag} label="Discounts given" value={inr(t.discount)} sub={has(t, "couponUses") ? `${count(t.couponUses)} coupon uses` : "Coupons and offers"} />,
    !has(t, "discount") && has(t, "couponUses") && <Kpi key="cu" icon={Tag} label="Coupon uses" value={count(t.couponUses)} sub="Paid with a coupon" />,
  ].filter(Boolean) : [];

  const splitMax = Math.max(1, ...(d.byProduct || []).map((p) => (has(p, "amount") ? p.amount : p.count)));
  const splitTotal = (d.byProduct || []).reduce((s, p) => s + (has(p, "amount") ? p.amount : p.count), 0);

  return (
    <div className={cx("acx-stack", ov.loading && "rlx-dim")}>
      {kpis.length > 0 && <div className="arx-kpis pt-kpis">{kpis}</div>}

      {d.series && <RevenueChart series={d.series} showAmount={perms.fields.amount} loading={ov.loading} />}

      {(d.byProduct?.length > 1 || d.gateways?.length > 0) && (
        <div className="acx-grid2">
          {d.byProduct?.length > 1 && (
            <Card icon={SquaresFour} title="By product" caption={perms.fields.amount ? "Share of revenue in this range." : "Share of payments in this range."}>
              <ul className="aux-meters">
                {d.byProduct.map((p) => {
                  const v = has(p, "amount") ? p.amount : p.count;
                  const I = PRODUCT_ICON[p.product] || Receipt;
                  return (
                    <li key={p.product}>
                      <span className="lbl"><I size={15} weight="bold" aria-hidden />{p.label}</span>
                      <span className="val mono">{has(p, "amount") ? inr(p.amount) : count(p.count)}<small>{has(p, "amount") ? `${count(p.count)} paid` : `${splitTotal ? Math.round((v / splitTotal) * 100) : 0}%`}</small></span>
                      <span className="bar" aria-hidden><i style={{ width: `${v ? Math.max(2, (v / splitMax) * 100) : 0}%` }} /></span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
          {d.gateways?.length > 0 && (
            <Card icon={CreditCard} title="By gateway" caption="Where the payments were made.">
              <ul className="aux-meters">
                {d.gateways.map((g) => {
                  const v = has(g, "amount") ? g.amount : g.count;
                  const max = Math.max(1, ...d.gateways.map((x) => (has(x, "amount") ? x.amount : x.count)));
                  return (
                    <li key={g.gateway}>
                      <span className="lbl pt-cap"><CreditCard size={15} weight="bold" aria-hidden />{g.gateway}</span>
                      <span className="val mono">{has(g, "amount") ? inr(g.amount) : count(g.count)}<small>{count(g.count)} paid</small></span>
                      <span className="bar" aria-hidden><i style={{ width: `${v ? Math.max(2, (v / max) * 100) : 0}%` }} /></span>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>
      )}

      {d.codes && (d.codes.coupons?.length > 0 || d.codes.referrals?.length > 0) && perms.sections.codes && (
        <Card icon={Tag} title="Top codes" caption="Most used coupons and referral codes in this range." action={<Btn variant="ghost" size="sm" onClick={() => go("codes")}>All codes<ArrowRight size={14} /></Btn>}>
          <div className="pt-chips">
            {[...(d.codes.coupons || []).slice(0, 4).map((c) => ({ ...c, kind: "coupon" })), ...(d.codes.referrals || []).slice(0, 4).map((c) => ({ ...c, kind: "ref" }))].map((c) => (
              <button key={`${c.kind}-${c.code}`} type="button" className="pt-chip" onClick={() => openCode(c.code)} disabled={!perms.sections.transactions}>
                {c.kind === "coupon" ? <Tag size={14} weight="bold" aria-hidden /> : <Handshake size={14} weight="bold" aria-hidden />}
                <b>{c.code}</b><small>{count(c.count)}×</small>
              </button>
            ))}
          </div>
        </Card>
      )}

      {perms.sections.transactions && (
        <Card icon={Receipt} title="Latest payments" action={<Btn variant="ghost" size="sm" onClick={() => go("transactions")}>All transactions<ArrowRight size={14} /></Btn>}>
          {recent.error ? <ErrorBox error={recent.error} retry={recent.reload} />
            : !recent.data ? <div className="acx-skel" style={{ height: 180 }} />
            : recent.data.rows.length ? <TxTable rows={recent.data.rows} fields={perms.fields} onHide={onHide} />
            : <div className="rf-empty"><span className="e">🧾</span><h3>No payments in this range</h3><p>Try a longer range.</p></div>}
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ transactions */
function Transactions({ api, perms, query, code, setCode, preview, onHide }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [exporting, setExporting] = useState(false);
  const search = useDebounced(q.trim());
  const params = useMemo(() => ({ ...query, page, limit: 25, ...(status !== "all" ? { status } : {}), ...(search ? { q: search } : {}), ...(code ? { code } : {}) }), [query, page, status, search, code]);
  useEffect(() => setPage(1), [query, status, search, code]);
  const res = useLoad(() => api.transactions(params), JSON.stringify(params));

  const doExport = async () => {
    setExporting(true);
    try {
      const rest = { ...params };
      delete rest.page; delete rest.limit;
      const r = await api.exportCsv(rest);
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `partner-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      toast.success(r.headers?.["x-export-truncated"] ? `Downloaded the newest ${r.headers["x-export-truncated"]} rows` : "CSV downloaded");
    } catch (e) {
      // blob errors carry their JSON inside the blob
      let msg = errMsg(e);
      try { const t = await e?.response?.data?.text?.(); if (t) msg = JSON.parse(t).message || msg; } catch { /* keep msg */ }
      toast.error(msg);
    } finally { setExporting(false); }
  };

  const searchHint = [
    perms.searchable.includes("txnId") && "transaction ID",
    perms.searchable.includes("ref") && "order ID",
    perms.searchable.includes("coupon") && "coupon",
    perms.searchable.includes("referralCode") && "referral code",
    perms.searchable.includes("item") && "item",
  ].filter(Boolean);

  if (res.error && !res.data && res.code?.startsWith("PARTNER_")) return <Blocked code={res.code} message={res.error} preview={preview} />;

  return (
    <div className="acx-stack">
      <div className="pt-filters">
        {searchHint.length > 0 && (
          <label className="pt-search">
            <MagnifyingGlass size={17} aria-hidden />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${searchHint.slice(0, 3).join(", ")}`} aria-label="Search transactions" maxLength={60} />
            {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search"><X size={15} /></button>}
          </label>
        )}
        {perms.statuses.length > 0 && (
          <select className="rv-input pt-select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="all">{perms.includeUnpaid ? "All statuses" : "All paid"}</option>
            {perms.statuses.map((s) => <option key={s} value={s}>{STATUS[s]?.[0] || s}</option>)}
          </select>
        )}
        {perms.sections.export && !preview && (
          <Btn variant="ghost" size="sm" onClick={doExport} loading={exporting} disabled={!res.data?.total}><DownloadSimple size={15} />CSV</Btn>
        )}
      </div>

      {code && (
        <div className="pt-active-filter">
          <span>Showing payments with code <b>{code}</b></span>
          <button type="button" onClick={() => setCode(null)} aria-label="Remove code filter"><X size={14} weight="bold" /></button>
        </div>
      )}

      {res.error && !res.data ? <ErrorBox error={res.error} retry={res.reload} />
        : !res.data ? <div className="acx-skel" style={{ height: 420 }} />
        : (
          <div className={cx("acx-stack", res.loading && "rlx-dim")}>
            <p className="pt-count">{count(res.data.total)} {res.data.total === 1 ? "payment" : "payments"}{res.data.pages > 1 ? ` · page ${res.data.page} of ${res.data.pages}` : ""}{res.data.hiddenCount ? ` · ${count(res.data.hiddenCount)} hidden by you` : ""}</p>
            {res.data.rows.length ? <TxTable rows={res.data.rows} fields={perms.fields} onHide={onHide} /> : (
              <div className="rf-empty"><span className="e">🔍</span><h3>No payments found</h3><p>{res.data.range?.outside ? "This range is outside the dates shared with you." : search || code || status !== "all" ? "Try clearing a filter or picking a longer range." : "Nothing in this range yet."}</p></div>
            )}
            <Pager page={res.data.page} pages={Math.min(res.data.pages, 400)} onGo={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </div>
        )}
    </div>
  );
}

/* ------------------------------------------------------------ codes */
function Codes({ api, perms, query, openCode }) {
  const ov = useLoad(() => api.overview(query), `codes:${JSON.stringify(query)}`);
  if (ov.error && !ov.data) return ov.code?.startsWith("PARTNER_") ? <Blocked code={ov.code} message={ov.error} /> : <ErrorBox error={ov.error} retry={ov.reload} />;
  if (!ov.data) return <div className="acx-skel" style={{ height: 320 }} />;
  const c = ov.data.codes || {};
  const table = (list, kind) => (
    <div className="arx-table-wrap">
      <table className="arx-table">
        <thead><tr><th>Code</th><th className="num">Uses</th>{list.some((x) => has(x, "amount")) && <th className="num">Revenue</th>}{kind === "coupon" && list.some((x) => has(x, "discount")) && <th className="num">Discount</th>}{kind === "ref" && list.some((x) => has(x, "referralAmount")) && <th className="num">Referral amt</th>}{perms.sections.transactions && <th />}</tr></thead>
        <tbody>
          {list.map((x) => (
            <tr key={x.code}>
              <td className="first"><span className="pt-code lg">{kind === "coupon" ? <Tag size={13} weight="bold" aria-hidden /> : <Handshake size={13} weight="bold" aria-hidden />}{x.code}</span></td>
              <td data-label="Uses" className="num mono">{count(x.count)}</td>
              {has(x, "amount") && <td data-label="Revenue" className="num mono">{inr(x.amount)}</td>}
              {kind === "coupon" && has(x, "discount") && <td data-label="Discount" className="num mono">{inr(x.discount)}</td>}
              {kind === "ref" && has(x, "referralAmount") && <td data-label="Referral amt" className="num mono">{inr(x.referralAmount)}</td>}
              {perms.sections.transactions && <td className="act"><Btn variant="ghost" size="sm" onClick={() => openCode(x.code)}>Payments<ArrowRight size={14} /></Btn></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <div className={cx("acx-stack", ov.loading && "rlx-dim")}>
      {perms.fields.coupon && (
        <Card icon={Tag} title="Coupons" caption="Coupon codes used on paid orders in this range (top 12).">
          {c.coupons?.length ? table(c.coupons, "coupon") : <p className="acx-note">No coupons were used in this range.</p>}
        </Card>
      )}
      {perms.fields.referralCode && (
        <Card icon={Handshake} title="Referral codes" caption="Affiliate and referral codes behind paid orders in this range (top 12).">
          {c.referrals?.length ? table(c.referrals, "ref") : <p className="acx-note">No referral codes were used in this range.</p>}
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ range + product controls */
function Controls({ perms, range, setRange, custom, setCustom, product, setProduct }) {
  const [draft, setDraft] = useState(custom);
  const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
  const floor = perms.visible?.from || undefined;
  const ceil = perms.visible?.to && perms.visible.to < today ? perms.visible.to : today;
  const fixed = Boolean(perms.visible?.from || perms.visible?.to);
  const ranges = RANGES.filter(([k]) => !perms.historyDays || k === "all" || Number.parseInt(k, 10) <= perms.historyDays);
  return (
    <div className="pt-controls">
      <div className="acx-seg" role="group" aria-label="Date range">
        {ranges.map(([k, l]) => <button key={k} type="button" aria-pressed={range === k} onClick={() => setRange(k)}>{k === "all" && fixed ? "All shared dates" : l}</button>)}
        <button type="button" aria-pressed={range === "custom"} onClick={() => setRange("custom")}>Custom</button>
      </div>
      {range === "custom" && (
        <form className="pt-custom" onSubmit={(e) => { e.preventDefault(); if (draft.from && draft.to && draft.from > draft.to) { toast.error("The start date must be before the end date."); return; } setCustom(draft); }}>
          <label><span>From</span><input type="date" className="rv-input" value={draft.from} min={floor} max={draft.to || ceil} onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))} /></label>
          <label><span>To</span><input type="date" className="rv-input" value={draft.to} min={draft.from || floor} max={ceil} onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))} /></label>
          <Btn size="sm" type="submit">Apply</Btn>
        </form>
      )}
      {perms.products.length > 1 && (
        <div className="pt-products" role="group" aria-label="Product">
          <button type="button" aria-pressed={!product} onClick={() => setProduct(null)}>All products</button>
          {perms.products.map((p) => { const I = PRODUCT_ICON[p.key] || Receipt; return <button key={p.key} type="button" aria-pressed={product === p.key} onClick={() => setProduct(p.key)}><I size={15} weight={product === p.key ? "fill" : "bold"} aria-hidden />{p.label}</button>; })}
        </div>
      )}
    </div>
  );
}

/* "You can see payments from … to …". Never mentions what is held back (hidden payments, dates, codes, delays, limits). */
const fmtDay = (v) => (v ? day(`${v}T00:00:00+05:30`) : "");
function VisibleLine({ perms }) {
  const v = perms.visible || {};
  const parts = [];
  if (v.empty) parts.push("No dates are shared with you right now.");
  else if (v.from && v.to) parts.push(`You can see payments from ${fmtDay(v.from)} to ${fmtDay(v.to)}.`);
  else if (v.from) parts.push(`You can see payments from ${fmtDay(v.from)} onwards.`);
  else if (v.to) parts.push(`You can see payments up to ${fmtDay(v.to)}.`);
  if (perms.expiresAt) parts.push(`Your access runs until ${fmtDay(perms.expiresAt)}.`);
  if (!parts.length) return null;
  return <p className="pt-hint"><Info size={14} aria-hidden /><span>{parts.join(" ")}</span></p>;
}

/* ------------------------------------------------------------ the screen (partner or admin preview) */
const VIEWS = [
  { key: "overview", label: "Overview", icon: SquaresFour, need: (p) => p.sections.overview || p.sections.revenue },
  { key: "transactions", label: "Transactions", icon: Receipt, need: (p) => p.sections.transactions },
  { key: "codes", label: "Codes", icon: Tag, need: (p) => p.sections.codes },
];
const readHash = () => (typeof window !== "undefined" ? window.location.hash.slice(1) : "");

export function PartnerView({ api, preview = false, onHide }) {
  const me = useLoad(() => api.me(), "me");
  const perms = me.data?.permissions;
  const views = useMemo(() => (perms ? VIEWS.filter((v) => v.need(perms)) : []), [perms]);
  const [view, setView] = useState(() => (preview ? "overview" : readHash() || "overview"));
  const [range, setRangeState] = useState("30d");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [product, setProduct] = useState(null);
  const [code, setCode] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => { if (views.length && !views.some((v) => v.key === view)) setView(views[0].key); }, [views, view]);
  useEffect(() => {
    if (preview) return undefined;
    const on = () => { const h = readHash(); if (VIEWS.some((v) => v.key === h)) setView(h); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, [preview]);

  const go = useCallback((k) => {
    setView(k);
    if (!preview) { try { window.history.replaceState(null, "", `#${k}`); } catch { /* ignore */ } window.scrollTo({ top: 0 }); }
  }, [preview]);
  const openCode = useCallback((c) => { setCode(c); go("transactions"); }, [go]);
  const setRange = (k) => { setRangeState(k); if (k !== "custom") setCustom({ from: "", to: "" }); };

  const query = useMemo(() => {
    const q = { range };
    if (range === "custom") { if (!custom.from && !custom.to) q.range = "30d"; else { if (custom.from) q.from = custom.from; if (custom.to) q.to = custom.to; } }
    if (product) q.product = product;
    if (tick) q.t = tick; // Refresh: a new query key makes every panel load again
    return q;
  }, [range, custom, product, tick]);

  if (me.error && !me.data) return <div className="pt-pad"><ErrorBox error={me.error} retry={me.reload} /></div>;
  if (!perms) return <div className="pt-pad acx-stack"><div className="acx-skel" style={{ height: 80 }} /><div className="arx-kpis">{Array.from({ length: 4 }, (_, i) => <div key={i} className="acx-skel" style={{ height: 96 }} />)}</div><div className="acx-skel" style={{ height: 280 }} /></div>;

  const blockedCode = perms.expired ? "PARTNER_EXPIRED" : !perms.portalEnabled ? "PARTNER_PORTAL_OFF" : !perms.accessEnabled ? "PARTNER_PAUSED" : !perms.products.length ? "PARTNER_NO_PRODUCTS" : null;
  const head = { overview: ["Overview", "Revenue and payments for the products shared with you."], transactions: ["Transactions", "Every payment, with only the details shared with you."], codes: ["Coupons & referral codes", "Which codes were used and what they brought in."] }[view] || ["Overview", ""];

  const body = blockedCode ? <Blocked code={blockedCode} preview={preview} /> : !views.length ? <Blocked code="NONE" message="No part of the dashboard is shared yet." preview={preview} /> : (
    <>
      <div className="aux-head">
        <div><h1>{head[0]}</h1><p>{head[1]}</p></div>
        <Btn variant="ghost" size="sm" onClick={() => { me.reload(); setTick((n) => n + 1); }} aria-label="Refresh"><ArrowsClockwise size={15} />Refresh</Btn>
      </div>
      {perms.notice && <div className="pt-notice" role="note"><Info size={18} weight="fill" aria-hidden /><p>{perms.notice}</p></div>}
      <Controls perms={perms} range={range} setRange={setRange} custom={custom} setCustom={setCustom} product={product} setProduct={setProduct} />
      <VisibleLine perms={perms} />
      {view === "overview" && <Overview key={JSON.stringify(query)} api={api} perms={perms} query={query} go={go} openCode={openCode} onHide={preview ? onHide : undefined} />}
      {view === "transactions" && <Transactions api={api} perms={perms} query={query} code={code} setCode={setCode} preview={preview} onHide={preview ? onHide : undefined} />}
      {view === "codes" && <Codes api={api} perms={perms} query={query} openCode={openCode} />}
      <p className="pt-privacy"><ShieldCheck size={15} weight="fill" aria-hidden />Customer names, emails and phone numbers are never shown here.</p>
    </>
  );

  return (
    <div className={cx("arx rlx acx aux pt", preview && "pt-preview")}>
      <div className="arx-layout">
        <aside className="arx-side" aria-label="Dashboard sections">
          <div className="acx-me"><span className="acx-av"><ChartLineUp size={20} weight="bold" /></span><div><b>{me.data.partner.name}</b><small>{preview ? "Partner preview" : "Partner dashboard"}</small></div></div>
          {!blockedCode && (
            <nav className="arx-nav">
              <span>Dashboard</span>
              {views.map((v) => <button key={v.key} type="button" aria-current={view === v.key ? "page" : undefined} onClick={() => go(v.key)}><v.icon size={18} weight={view === v.key ? "fill" : "regular"} />{v.label}</button>)}
            </nav>
          )}
          {!blockedCode && (
            <div className="pt-side-products">
              <span>Shared with you</span>
              {perms.products.map((p) => { const I = PRODUCT_ICON[p.key] || Receipt; return <em key={p.key}><I size={14} weight="bold" aria-hidden />{p.label}</em>; })}
            </div>
          )}
        </aside>
        <main className="arx-main"><div className="acx-body acx-stack">{body}</div></main>
      </div>
      {!blockedCode && views.length > 1 && !preview && (
        <nav className="acx-tabbar" aria-label="Dashboard sections" style={{ gridTemplateColumns: `repeat(${views.length}, minmax(0, 1fr))` }}>
          {views.map((v) => <button key={v.key} type="button" aria-label={v.label} title={v.label} aria-current={view === v.key ? "page" : undefined} onClick={() => go(v.key)}><v.icon size={24} weight={view === v.key ? "fill" : "regular"} aria-hidden /></button>)}
        </nav>
      )}
      {preview && views.length > 1 && !blockedCode && (
        <nav className="pt-preview-tabs" aria-label="Preview sections">
          {views.map((v) => <button key={v.key} type="button" aria-current={view === v.key ? "page" : undefined} onClick={() => go(v.key)}><v.icon size={16} weight={view === v.key ? "fill" : "bold"} />{v.label}</button>)}
        </nav>
      )}
    </div>
  );
}

export default function PartnerDashboard() {
  return (
    <Page title="Partner dashboard · Target Trek" top={false}>
      <PartnerView api={partnerApi} />
    </Page>
  );
}

