import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft, ArrowRight, CalendarBlank, ChartLineUp, CaretLeft, CaretRight, CaretRight as Chevron, ChartBar, Check, CheckCircle,
  ClockCounterClockwise, Copy, Crown, Devices, DownloadSimple, Envelope, FunnelSimple, GoogleLogo, Handshake,
  HourglassMedium, Key, Lock, MagnifyingGlass, PaperPlaneTilt, PencilSimple, Phone, Prohibit, Pulse, Receipt,
  ShieldWarning, ShoppingCart, SignOut, SquaresFour, Trash, User, UserPlus, Users, WarningCircle, WifiHigh, X,
} from "@phosphor-icons/react";

import { accountHttp, errMsg } from "../arena/api";
import { Btn, Page, cx } from "../resume/ui";
import { Badge, Sheet } from "../referral/ui";
import {
  ActivityItem, Card, Kpi, OrdersTable, Row, SalesChart, StatusBadge, ago, copy, count, day, deviceIcon,
  eventInfo, initials, money, phoneText, sinceText, stamp, titleCase,
} from "../component/UserProfile.jsx";
import "../referral/referral.css";
import "./adminReferrals.css";
import "./adminResume.css";
import "../component/profile.css";
import "./adminUsers.css";

/*
  ADMIN · USERS  (/admin/users)
  Same look as the account centre. Desktop: left menu. Phones and tablets: icon-only bar at the bottom.

    #overview        headline numbers, sign-ups chart, roles, who needs attention, security events   (1 call)
    #all             every account: search, filters, sort, CSV export                               (1 call per page)
    #affiliates      affiliates only, with code and commission
    #restricted      inactive, suspended, blocked
    #pending         invited, no password yet
    #user=<id>       one person, as a full page: overview, devices, activity, purchases, sales, manage (1 call)

  Picking several people is opt-in: press "Select", tap rows, then choose an action in the bar that appears.
*/

const API = {
  list: (params) => accountHttp.get("/admin/users/console", { params }).then((r) => r.data),
  one: (id) => accountHttp.get(`/admin/users/${id}/console`).then((r) => r.data),
  create: (body) => accountHttp.post("/admin/users", body).then((r) => r.data),
  update: (id, body) => accountHttp.patch(`/admin/users/${id}`, body).then((r) => r.data),
  status: (id, status, reason) => accountHttp.patch(`/admin/users/${id}/status`, { status, ...(reason ? { reason } : {}) }).then((r) => r.data),
  affiliate: (id, status) => accountHttp.patch(`/admin/users/${id}/affiliate/status`, { status }).then((r) => r.data),
  passwordLink: (id) => accountHttp.post(`/admin/users/${id}/password-link`, {}).then((r) => r.data),
  logoutAll: (id) => accountHttp.post(`/admin/users/${id}/logout-all`, {}).then((r) => r.data),
  revoke: (id, sid) => accountHttp.delete(`/admin/users/${id}/sessions/${encodeURIComponent(sid)}`).then((r) => r.data),
  clearActivity: (id) => accountHttp.delete(`/admin/users/${id}/activities`).then((r) => r.data),
  remove: (id) => accountHttp.delete(`/admin/users/${id}`).then((r) => r.data),
  bulk: (body) => accountHttp.post("/admin/users/bulk", body).then((r) => r.data),
  exportCsv: (params) => accountHttp.get("/admin/users/export", { params, responseType: "blob", timeout: 60000 }),
  sales: (id, graphDays) => accountHttp.get("/affiliate/dashboard", { params: { userId: id, graphDays } }).then((r) => r.data?.data),
  orders: (id, params) => accountHttp.get("/affiliate/orders", { params: { userId: id, ...params } }).then((r) => r.data?.data),
};

const ROLES = [
  { value: "normal", label: "Member", icon: User },
  { value: "affiliate", label: "Affiliate", icon: Handshake },
  { value: "partner", label: "Partner", icon: ChartLineUp },
  { value: "Employee", label: "Employee", icon: Users },
  { value: "admin", label: "Admin", icon: Crown },
];
const roleLabel = (r) => ROLES.find((x) => x.value === r)?.label || "Member";
const ROLE_TONE = { admin: "warn", Employee: "info", affiliate: "brand", partner: "ok", normal: "muted" };
const STATUSES = ["active", "inactive", "suspended", "blocked"];
const STATUS_HELP = {
  active: "Can sign in and use everything.",
  inactive: "Paused. Can't sign in until reactivated.",
  suspended: "Temporarily blocked while you look into something.",
  blocked: "Blocked for good. Every device is signed out.",
};
const PAGE_SIZE = 20;

const VIEWS = [
  { key: "overview", label: "Overview", icon: SquaresFour },
  { key: "all", label: "Users", icon: Users },
  { key: "affiliates", label: "Affiliates", icon: Handshake },
  { key: "restricted", label: "Restricted", icon: ShieldWarning },
  { key: "pending", label: "Pending setup", icon: HourglassMedium },
];
const HEAD = {
  overview: ["Users", "Everyone with a Target Trek account, at a glance."],
  all: ["All users", "Search, filter and open any account."],
  affiliates: ["Affiliates", "Partners who earn commission with their own code."],
  restricted: ["Restricted", "Inactive, suspended and blocked accounts. They can't sign in."],
  pending: ["Pending setup", "Invited by the team, but no password set yet."],
};

/* #all  ·  #user=<id>&from=all */
const readHash = () => {
  const h = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
  const q = new URLSearchParams(h.includes("=") ? h : "");
  if (q.get("user")) return { view: VIEWS.some((v) => v.key === q.get("from")) ? q.get("from") : "all", person: q.get("user") };
  return { view: VIEWS.some((v) => v.key === h) ? h : "overview", person: null };
};
const writeHash = (h) => { try { window.history.replaceState(null, "", `#${h}`); } catch { /* ignore */ } };
const useDebounced = (v, ms = 350) => { const [d, setD] = useState(v); useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]); return d; };

/* one request per screen; an older answer never overwrites a newer one */
function useLoad(fn, key) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const seq = useRef(0);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const run = useCallback(async (opts) => {
    const n = ++seq.current;
    setLoading(true); setError("");
    try { const d = await fnRef.current(opts); if (n === seq.current) setData(d); } catch (e) { if (n === seq.current) setError(errMsg(e)); } finally { if (n === seq.current) setLoading(false); }
  }, []);
  useEffect(() => { run(); }, [key, run]);
  return { data, error, loading, reload: run, setData };
}

/* ------------------------------------------------------------ small parts */
const Avatar = ({ name, size }) => <span className={cx("acx-av", "aux-av", size)} aria-hidden>{initials(name || "?")}</span>;
const RoleBadge = ({ role }) => <Badge tone={ROLE_TONE[role] || "muted"}>{roleLabel(role)}</Badge>;
const Empty = ({ emoji = "🔍", title, children }) => <div className="rf-empty"><span className="e">{emoji}</span><h3>{title}</h3>{children && <p>{children}</p>}</div>;
const Seg = ({ value, options, onChange, label }) => (
  <div className="acx-seg aux-seg" role="group" aria-label={label}>
    {options.map(([k, l]) => <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}>{l}</button>)}
  </div>
);
const ErrorBox = ({ error, retry }) => <div className="acx-error" role="alert"><span>{error}</span><Btn variant="ghost" size="sm" onClick={retry}>Try again</Btn></div>;

/* ------------------------------------------------------------ overview */
function Bars({ series }) {
  const [hover, setHover] = useState(null);
  const top = Math.max(1, ...series.map((p) => p.count));
  const total = series.reduce((s, p) => s + p.count, 0);
  const hp = hover === null ? null : series[hover];
  return (
    <>
      <div className="acx-readout" aria-live="polite"><span>{hp ? day(`${hp.date}T00:00:00+05:30`) : "Last 30 days"}</span><b>{count(hp ? hp.count : total)} sign-up{(hp ? hp.count : total) === 1 ? "" : "s"}</b></div>
      <div className="acx-chart aux-chart" onMouseLeave={() => setHover(null)}>
        {series.map((p, i) => (
          <button key={p.date} type="button" className={hover === i ? "on" : ""} aria-label={`${p.date}: ${p.count}`} onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)}>
            <i style={{ height: `${p.count ? Math.max(4, (p.count / top) * 100) : 1}%` }} />
          </button>
        ))}
      </div>
      <div className="aux-axis"><span>{day(`${series[0]?.date}T00:00:00+05:30`)}</span><span>Today</span></div>
    </>
  );
}

function PersonLine({ u, onOpen, right }) {
  return (
    <button type="button" className="aux-line" onClick={() => onOpen(u.id)}>
      <Avatar name={u.name} />
      <span className="mid"><b>{u.name}</b><small>{u.email}</small></span>
      <span className="end">{right}</span>
      <Chevron size={16} className="chev" aria-hidden />
    </button>
  );
}

function Overview({ data, go, onOpen }) {
  const s = data.stats;
  const pct = (n) => (s.total ? Math.round((n / s.total) * 100) : 0);
  const attention = [...data.restricted, ...data.pending].slice(0, 6);
  return (
    <div className="acx-stack">
      <div className="arx-kpis aux-kpis">
        <Kpi icon={Users} label="All accounts" value={count(s.total)} sub={`${count(s.new30)} joined in 30 days`} />
        <Kpi icon={WifiHigh} label="Signed in now" value={count(s.signedIn)} sub="Have an active device" />
        <Kpi icon={UserPlus} label="New this week" value={count(s.new7)} sub="Last 7 days" />
        <Kpi icon={Pulse} label="Active today" value={count(s.login24h)} sub={`${count(s.login7d)} this week`} />
        <Kpi icon={Handshake} label="Active affiliates" value={count(s.affiliates?.active)} sub={`${count(s.affiliates?.inactive)} switched off`} />
        <Kpi icon={ShieldWarning} label="Restricted" value={count(s.restricted)} sub="Can't sign in" />
        <Kpi icon={HourglassMedium} label="Pending setup" value={count(s.pending)} sub="No password yet" />
        <Kpi icon={CheckCircle} label="Email verified" value={`${pct(s.verified)}%`} sub={`${count(s.verified)} accounts`} />
      </div>

      <div className="acx-grid2">
        <Card icon={ChartBar} title="Sign-ups per day" caption="New accounts by day (IST). Hover or tap a bar.">
          <Bars series={data.series} />
        </Card>
        <Card icon={Users} title="Accounts by role" action={<Btn variant="ghost" size="sm" onClick={() => go("all")}>All users<ArrowRight size={14} /></Btn>}>
          <ul className="aux-meters">
            {ROLES.map((r) => {
              const n = s.byRole?.[r.value] || 0;
              return (
                <li key={r.value}>
                  <span className="lbl"><r.icon size={15} weight="bold" aria-hidden />{r.label}</span>
                  <span className="val mono">{count(n)}<small>{pct(n)}%</small></span>
                  <span className="bar" aria-hidden><i style={{ width: `${Math.max(pct(n), n ? 1 : 0)}%` }} /></span>
                </li>
              );
            })}
          </ul>
          <div className="aux-pills">
            {STATUSES.map((k) => <span key={k}><StatusBadge status={k} /><b className="mono">{count(s.byStatus?.[k])}</b></span>)}
          </div>
        </Card>
      </div>

      <div className="acx-grid2">
        <Card icon={UserPlus} title="Newest accounts">
          {data.recent.length === 0 ? <p className="acx-note">No accounts yet.</p> : (
            <div className="aux-lines">{data.recent.map((u) => <PersonLine key={u.id} u={u} onOpen={onOpen} right={<><RoleBadge role={u.role} /><small>{ago(u.createdAt)}</small></>} />)}</div>
          )}
        </Card>
        <Card icon={WarningCircle} title="Needs attention" caption="Restricted accounts and invites that were never finished.">
          {attention.length === 0 ? <p className="acx-note">Nothing needs you right now. 🎉</p> : (
            <div className="aux-lines">{attention.map((u) => <PersonLine key={u.id} u={u} onOpen={onOpen} right={u.pendingSetup ? <Badge tone="warn">Setup pending</Badge> : <StatusBadge status={u.status} />} />)}</div>
          )}
          <div className="rf-btns">
            <Btn variant="ghost" size="sm" onClick={() => go("restricted")}><ShieldWarning size={15} />Restricted · {count(s.restricted)}</Btn>
            <Btn variant="ghost" size="sm" onClick={() => go("pending")}><HourglassMedium size={15} />Pending · {count(s.pending)}</Btn>
          </div>
        </Card>
      </div>

      <Card icon={ClockCounterClockwise} title="Security events" caption="Failed sign-ins, status changes, sign-outs and deletions across all accounts.">
        {data.events.length === 0 ? <p className="acx-note">No security events yet.</p> : (
          <div className="aux-lines">
            {data.events.map((a) => {
              const [title] = eventInfo(a.action);
              const bad = a.result === "failure";
              return (
                <button key={a.id} type="button" className="aux-line aux-ev" onClick={() => a.user && onOpen(a.user.id)} disabled={!a.user}>
                  <span className={cx("aux-evdot", bad && "bad")} aria-hidden>{bad ? <WarningCircle size={18} weight="fill" /> : <ShieldWarning size={18} weight="fill" />}</span>
                  <span className="mid">
                    <b>{title}</b>
                    <small>{a.user?.name || "Unknown"}{a.actor ? ` · by ${a.actor.name}` : ""}{a.location ? ` · ${a.location.text}` : ""}</small>
                  </span>
                  <span className="end"><small title={stamp(a.createdAt)}>{ago(a.createdAt)}</small></span>
                  <Chevron size={16} className="chev" aria-hidden />
                </button>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------ list */
const NO_FILTERS = { role: "", status: "", affiliateStatus: "", joined: "", idle: "", setup: "" };

function FilterSheet({ view, value, onApply, onClose }) {
  const [f, setF] = useState(value);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const sel = (k, label, opts) => (
    <label className="aux-field">
      <span>{label}</span>
      <select className="rv-input" value={f[k]} onChange={set(k)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
    </label>
  );
  return (
    <Sheet title="Filters" subtitle="Narrow the list down" onClose={onClose} compact>
      <div className="acx acx-stack">
        <div className="aux-fields">
          {view === "all" && sel("role", "Role", [["", "All roles"], ...ROLES.map((r) => [r.value, r.label])])}
          {view !== "restricted" && sel("status", "Status", [["", "Any status"], ...STATUSES.map((k) => [k, titleCase(k)])])}
          {view === "affiliates" && sel("affiliateStatus", "Partnership", [["", "On or off"], ["active", "Active"], ["inactive", "Switched off"]])}
          {sel("joined", "Joined", [["", "Any time"], ["1", "Today"], ["7", "Last 7 days"], ["30", "Last 30 days"], ["90", "Last 90 days"], ["365", "Last year"]])}
          {sel("idle", "Last sign-in", [["", "Any time"], ["30", "Not in 30 days"], ["90", "Not in 90 days"], ["180", "Not in 180 days"]])}
          {view === "all" && sel("setup", "Password", [["", "Any"], ["pending", "Setup pending"], ["done", "Set"]])}
        </div>
        <div className="rf-btns">
          <Btn variant="ghost" onClick={() => onApply(NO_FILTERS)}>Clear all</Btn>
          <Btn onClick={() => onApply(f)}><Check size={16} />Show results</Btn>
        </div>
      </div>
    </Sheet>
  );
}

function UserList({ view, me, onOpen, refreshKey, onChanged }) {
  const [q, setQ] = useState("");
  const search = useDebounced(q);
  const [f, setF] = useState(NO_FILTERS);
  const [sort, setSort] = useState("new");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState(() => new Set());
  const [bulk, setBulk] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => { setPage(1); }, [search, f, sort]);

  const params = useMemo(() => {
    const p = { view, page, limit: PAGE_SIZE, sort };
    if (search) p.search = search;
    for (const k of Object.keys(NO_FILTERS)) if (f[k]) p[k] = f[k];
    return p;
  }, [view, page, f, search, sort]);
  const { data, error, loading, reload } = useLoad((o) => API.list({ ...params, ...(o?.fresh ? { fresh: 1 } : {}) }), JSON.stringify(params) + refreshKey);

  const rows = data?.users || [];
  const p = data?.pagination || {};
  const activeFilters = Object.values(f).filter(Boolean).length;
  useEffect(() => { setPicked(new Set()); }, [data]);
  const stopSelecting = () => { setSelecting(false); setPicked(new Set()); };
  const toggle = (id) => setPicked((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const pickable = rows.filter((u) => u.id !== me);
  const allOn = pickable.length > 0 && pickable.every((u) => picked.has(u.id));

  const doExport = async () => {
    setExporting(true);
    try {
      const { page: _p, limit: _l, ...rest } = params;
      const r = await API.exportCsv(rest);
      const url = URL.createObjectURL(r.data);
      const a = document.createElement("a");
      a.href = url; a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("CSV downloaded");
    } catch (e) { toast.error(errMsg(e)); } finally { setExporting(false); }
  };

  const showAff = view === "affiliates";

  return (
    <div className="acx-stack">
      {/* toolbar */}
      <div className="aux-bar">
        <div className="aux-search">
          <MagnifyingGlass size={18} aria-hidden />
          <input className="rv-input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, mobile or code" aria-label="Search users" />
          {q && <button type="button" onClick={() => setQ("")} aria-label="Clear search"><X size={16} /></button>}
        </div>
        <div className="aux-tools">
          <button type="button" className={cx("aux-tool", activeFilters > 0 && "on")} onClick={() => setFiltersOpen(true)} aria-label="Filters" title="Filters"><FunnelSimple size={17} weight="bold" /><span>Filters</span>{activeFilters > 0 && <em>{activeFilters}</em>}</button>
          <label className="aux-tool aux-sort"><span className="sr">Sort</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
              <option value="new">Newest</option><option value="old">Oldest</option><option value="name">Name A–Z</option><option value="login">Recent sign-in</option>
            </select>
          </label>
          <button type="button" className={cx("aux-tool", selecting && "on")} onClick={() => (selecting ? stopSelecting() : setSelecting(true))} aria-label={selecting ? "Done selecting" : "Select people"} title={selecting ? "Done" : "Select people"}><Check size={17} weight="bold" /><span>{selecting ? "Done" : "Select"}</span></button>
          <button type="button" className="aux-tool icon" onClick={doExport} disabled={exporting} aria-label="Export CSV" title="Export CSV">{exporting ? <span className="rv-spin" /> : <DownloadSimple size={18} weight="bold" />}</button>
        </div>
      </div>

      {/* selection bar: light, sits above the list, only while selecting */}
      {selecting && (
        <div className="aux-select" role="region" aria-label="Selection">
          <div className="top">
            <label className="aux-checkall"><input type="checkbox" checked={allOn} onChange={() => setPicked(allOn ? new Set() : new Set(pickable.map((u) => u.id)))} /><span>{picked.size ? `${picked.size} selected` : "Tap people to select"}</span></label>
            <button type="button" className="aux-link" onClick={stopSelecting}>Cancel</button>
          </div>
          <div className="acts">
            <button type="button" disabled={!picked.size} onClick={() => setBulk({ action: "status", status: "active" })}><CheckCircle size={16} />Activate</button>
            <button type="button" disabled={!picked.size} onClick={() => setBulk({ action: "status", status: "suspended" })}><Prohibit size={16} />Restrict</button>
            <button type="button" disabled={!picked.size} onClick={() => setBulk({ action: "logout" })}><SignOut size={16} />Sign out</button>
            <button type="button" disabled={!picked.size} onClick={() => setBulk({ action: "password-link" })}><PaperPlaneTilt size={16} />Send link</button>
            <button type="button" className="bad" disabled={!picked.size} onClick={() => setBulk({ action: "delete" })}><Trash size={16} />Delete</button>
          </div>
        </div>
      )}

      {error && <ErrorBox error={error} retry={() => reload()} />}

      <div className="aux-meta">
        <span>{loading && !data ? "Loading…" : `${count(p.total)} ${p.total === 1 ? "account" : "accounts"}`}{search && <> for “{search}”</>}</span>
        {activeFilters > 0 && <button type="button" className="aux-link" onClick={() => setF(NO_FILTERS)}>Clear filters</button>}
      </div>

      {!data && loading ? <div className="aux-table"><div className="acx-skel" style={{ height: 420, borderRadius: 0 }} /></div> : rows.length === 0 ? (
        <Empty emoji={search ? "🔍" : "🗂️"} title={search || activeFilters ? "No one matches" : "Nobody here"}>{search || activeFilters ? "Try another search or clear the filters." : view === "pending" ? "Every invite has been accepted." : view === "restricted" ? "No account is restricted." : "Accounts will show up here."}</Empty>
      ) : (
        <div className={cx("aux-table", showAff && "aff", selecting && "selecting", loading && "rlx-dim")} role="table" aria-label="Users">
          <div className="aux-th" role="row">
            {selecting && <span role="columnheader" className="c-pick" />}
            <span role="columnheader">Person</span>
            <span role="columnheader">Role</span>
            <span role="columnheader">Status</span>
            <span role="columnheader">{showAff ? "Code · rate" : "Devices"}</span>
            <span role="columnheader">Last sign-in</span>
            <span role="columnheader">Joined</span>
            <span role="columnheader" />
          </div>
          {rows.map((u) => {
            const self = u.id === me;
            const on = picked.has(u.id);
            const click = () => (selecting ? (!self && toggle(u.id)) : onOpen(u.id));
            return (
              <button key={u.id} type="button" role="row" className={cx("aux-tr", on && "on", u.status !== "active" && "off")} onClick={click} aria-pressed={selecting ? on : undefined} aria-label={selecting ? `${on ? "Unselect" : "Select"} ${u.name}` : `Open ${u.name}`}>
                {selecting && <span className="c-pick" role="cell"><i className={cx("aux-box", on && "on", self && "dis")}>{on && <Check size={13} weight="bold" />}</i></span>}
                <span className="c-who" role="cell">
                  <Avatar name={u.name} />
                  <span className="txt"><b>{u.name}{self && <em className="you">You</em>}</b><small>{u.email}</small></span>
                </span>
                <span className="c-role" role="cell"><RoleBadge role={u.role} /></span>
                <span className="c-status" role="cell"><StatusBadge status={u.status} />{u.pendingSetup && <Badge tone="warn">Setup</Badge>}</span>
                <span className="c-extra" role="cell">
                  {showAff && u.affiliate ? <><span className="mono">{u.affiliate.code}</span><small>{u.affiliate.commissionType === "percentage" ? `${u.affiliate.commissionValue}%` : money(u.affiliate.commissionValue)}{u.affiliate.status !== "active" ? " · off" : ""}</small></>
                    : u.devices > 0 ? <span className="aux-online"><i />{u.devices} online</span> : <small>—</small>}
                </span>
                <span className="c-login" role="cell">{u.lastLoginAt ? <><small className="lbl">Signed in</small>{ago(u.lastLoginAt)}</> : <span className="never">Never signed in</span>}<span className="mob"> · joined {day(u.createdAt)}</span></span>
                <span className="c-joined" role="cell"><small className="lbl">Joined</small>{day(u.createdAt)}</span>
                <span className="c-go" role="cell" aria-hidden>{!selecting && <Chevron size={16} />}</span>
              </button>
            );
          })}
        </div>
      )}

      {p.pages > 1 && (
        <div className="aux-pager">
          <Btn variant="ghost" size="sm" disabled={loading || p.page <= 1} onClick={() => setPage((n) => Math.max(1, n - 1))}><CaretLeft size={14} />Prev</Btn>
          <span>Page <b>{p.page}</b> of {p.pages}</span>
          <Btn variant="ghost" size="sm" disabled={loading || p.page >= p.pages} onClick={() => setPage((n) => n + 1)}>Next<CaretRight size={14} /></Btn>
        </div>
      )}

      {filtersOpen && <FilterSheet view={view} value={f} onClose={() => setFiltersOpen(false)} onApply={(v) => { setF(v); setFiltersOpen(false); }} />}
      {bulk && <BulkSheet bulk={bulk} setBulk={setBulk} ids={[...picked]} rows={rows} onClose={() => setBulk(null)}
        onDone={() => { setBulk(null); stopSelecting(); reload({ fresh: true }); onChanged(); }} />}
    </div>
  );
}

function BulkSheet({ bulk, setBulk, ids, rows, onClose, onDone }) {
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const names = rows.filter((u) => ids.includes(u.id)).map((u) => u.name);
  const n = ids.length;
  const people = `${n} ${n === 1 ? "person" : "people"}`;
  const title = bulk.action === "status" ? `Change status for ${people}` : bulk.action === "logout" ? `Sign out ${people}` : bulk.action === "password-link" ? `Send a password link to ${people}` : `Delete ${people}`;
  const danger = bulk.action === "delete";
  const run = async () => {
    setBusy(true);
    try {
      const r = await API.bulk({ ids, action: bulk.action, ...(bulk.action === "status" ? { status: bulk.status, reason: reason.trim() || undefined } : {}) });
      if (r.failed?.length) toast(`${r.message}. ${r.failed[0].message}`, { icon: "⚠️" }); else toast.success(r.message);
      onDone();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Sheet title={title} subtitle={names.slice(0, 3).join(", ") + (names.length > 3 ? ` +${names.length - 3} more` : "")} onClose={onClose} compact>
      <div className="acx acx-stack">
        {bulk.action === "status" && (
          <>
            <Seg label="New status" value={bulk.status} onChange={(s) => setBulk({ ...bulk, status: s })} options={STATUSES.map((s) => [s, titleCase(s)])} />
            <p className="acx-note">{STATUS_HELP[bulk.status]}</p>
            <label className="aux-field"><span>Reason <em>optional · they may see it</em></span><textarea className="rv-input" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></label>
          </>
        )}
        {bulk.action === "logout" && <p className="acx-note">Every device of these accounts is signed out right away. They can sign in again.</p>}
        {bulk.action === "password-link" && <p className="acx-note">Each person gets an email with a link to set a new password.</p>}
        {danger && (
          <>
            <div className="acx-confirm"><b>This can't be undone.</b><p>The accounts and all their data are erased. Admins and your own account are skipped.</p></div>
            <label className="aux-field"><span>Type <b>DELETE</b> to confirm</span><input className="rv-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" /></label>
          </>
        )}
        <div className="rf-btns">
          <Btn variant="ghost" onClick={onClose} disabled={busy}>Cancel</Btn>
          <Btn variant={danger ? "danger" : "primary"} loading={busy} disabled={danger && confirm !== "DELETE"} onClick={run}>{danger ? <Trash size={16} /> : <Check size={16} />}Confirm</Btn>
        </div>
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------ create / edit */
const blankForm = (u) => ({
  name: u?.name || "", email: u?.email || "", mobile: u?.mobile || "", role: u?.role || "normal",
  code: u?.affiliate?.code || "", commissionType: u?.affiliate?.commissionType || "percentage",
  commissionValue: u?.affiliate?.commissionValue ?? 10, affStatus: u?.affiliate?.status || "active",
});
const formBody = (f, wasAffiliate) => {
  const errors = {};
  const name = f.name.trim(); const email = f.email.trim().toLowerCase(); const mobile = f.mobile.trim();
  if (name.length < 2 || name.length > 100) errors.name = "Use 2–100 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email.";
  if (mobile ? !/^[6-9]\d{9}$/.test(mobile) : f.role !== "admin") errors.mobile = "Enter a 10-digit Indian mobile number.";
  const body = { name, email, mobile: mobile || null, role: f.role };
  if (f.role === "affiliate") {
    const code = f.code.trim().toUpperCase(); const value = Number(f.commissionValue);
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) errors.code = "3–30 letters, numbers, - or _.";
    if (!Number.isFinite(value) || value <= 0 || (f.commissionType === "percentage" && value > 100)) errors.commissionValue = f.commissionType === "percentage" ? "Between 0.01 and 100." : "More than 0.";
    body.affiliate = { code, commissionType: f.commissionType, commissionValue: Math.round(value * 100) / 100, status: f.affStatus };
  } else if (wasAffiliate) body.affiliate = null;
  return { body, errors };
};

function UserForm({ user, onSubmit, onCancel, busy, isSelf }) {
  const [f, setF] = useState(() => blankForm(user));
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => { const v = k === "code" ? e.target.value.toUpperCase().replace(/\s/g, "") : e.target.value; setF((x) => ({ ...x, [k]: v })); setErrors((x) => ({ ...x, [k]: undefined })); };
  const submit = (e) => {
    e.preventDefault();
    const { body, errors: errs } = formBody(f, user?.role === "affiliate");
    setErrors(errs);
    if (Object.keys(errs).length) return toast.error("Fix the highlighted fields.");
    onSubmit(body);
  };
  const input = (k, label, props = {}) => (
    <label className="aux-field">
      <span>{label}</span>
      <input className={cx("rv-input", errors[k] && "bad", props.mono && "mono")} value={f[k]} onChange={set(k)} disabled={busy} {...{ ...props, mono: undefined }} />
      {errors[k] && <small className="err">{errors[k]}</small>}
    </label>
  );
  const lockRole = isSelf && user?.role === "admin";
  return (
    <form onSubmit={submit} noValidate className="acx-stack">
      <div className="aux-fields two">
        {input("name", "Full name", { autoComplete: "off", maxLength: 100 })}
        {input("email", "Email", { type: "email", autoComplete: "off" })}
        {input("mobile", f.role === "admin" ? "Mobile (optional)" : "Mobile", { inputMode: "numeric", maxLength: 10, placeholder: "9876543210" })}
        <label className="aux-field">
          <span>Role</span>
          <select className="rv-input" value={f.role} onChange={set("role")} disabled={busy || lockRole}>{ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
          {lockRole && <small>You can't change your own role.</small>}
        </label>
      </div>
      {f.role === "affiliate" && (
        <div className="aux-group">
          <h4><Handshake size={15} weight="bold" />Affiliate set-up</h4>
          <div className="aux-fields two">
            {input("code", "Referral code", { maxLength: 30, placeholder: "PRIYA10", mono: true })}
            <label className="aux-field"><span>Commission type</span><select className="rv-input" value={f.commissionType} onChange={set("commissionType")}><option value="percentage">Percentage of sale</option><option value="fixed">Fixed amount per sale</option></select></label>
            {input("commissionValue", f.commissionType === "percentage" ? "Commission (%)" : "Commission (₹)", { type: "number", min: 0, step: "0.01", inputMode: "decimal" })}
            <label className="aux-field"><span>Partnership</span><select className="rv-input" value={f.affStatus} onChange={set("affStatus")}><option value="active">Active, earns commission</option><option value="inactive">Switched off</option></select></label>
          </div>
        </div>
      )}
      <p className="acx-note">{user ? <>Changing the <b>email</b> or <b>role</b> signs this person out of every device.</> : <>They get an email with a link to set a password. Until then they show under <b>Pending setup</b>.</>}</p>
      <div className="rf-btns">
        <Btn variant="ghost" onClick={onCancel} disabled={busy}>Cancel</Btn>
        <Btn type="submit" loading={busy}>{!busy && <Check size={16} />}{user ? "Save changes" : "Create account"}</Btn>
      </div>
    </form>
  );
}

function CreateSheet({ onClose, onCreated }) {
  const [busy, setBusy] = useState(false);
  const submit = async (body) => {
    setBusy(true);
    try { const r = await API.create(body); toast.success(r.message || "Account created"); onCreated(r.user?._id); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Sheet title="Add a user" subtitle="Create the account and email a password link" onClose={onClose} wide>
      <div className="acx"><UserForm onSubmit={submit} onCancel={onClose} busy={busy} /></div>
    </Sheet>
  );
}

/* ------------------------------------------------------------ one person (full page) */
const PERSON_TABS = [
  { key: "profile", label: "Overview", icon: User },
  { key: "devices", label: "Devices", icon: Devices },
  { key: "activity", label: "Activity", icon: ClockCounterClockwise },
  { key: "purchases", label: "Purchases", icon: ShoppingCart },
  { key: "sales", label: "Sales", icon: ChartBar, affiliate: true },
  { key: "orders", label: "Transactions", icon: Receipt, affiliate: true },
  { key: "manage", label: "Manage", icon: Key },
];

function PersonPage({ id, me, back, backLabel, onChanged }) {
  const { data, error, loading, reload } = useLoad(() => API.one(id), id);
  const [tab, setTab] = useState("profile");
  const [busy, setBusy] = useState("");
  const [editing, setEditing] = useState(false);
  const u = data?.user;
  const self = id === me;
  const tabs = PERSON_TABS.filter((t) => !t.affiliate || u?.role === "affiliate");

  const act = async (name, fn, after) => {
    setBusy(name);
    try { const r = await fn(); toast.success(r?.message || "Done"); await after?.(r); return r; } catch (e) { toast.error(errMsg(e)); return null; } finally { setBusy(""); }
  };
  const changed = async () => { await reload(); onChanged(); };
  const pick = (k) => { setTab(k); setEditing(false); };

  return (
    <div className="acx-stack aux-person">
      <button type="button" className="aux-back" onClick={back}><ArrowLeft size={16} weight="bold" />{backLabel}</button>

      {!data && loading ? <div className="acx-stack"><div className="acx-skel" style={{ height: 150 }} /><div className="acx-skel" style={{ height: 300 }} /></div> : !data ? <ErrorBox error={error} retry={() => reload()} /> : (
        <>
          <header className="acx-hero aux-hero">
            <div className="who">
              <Avatar name={u.name} size="lg" />
              <div>
                <h1>{u.name}{self && <em className="you">You</em>}</h1>
                <ul className="acx-contact">
                  <li><Envelope size={16} weight="bold" aria-label="Email" /><span>{u.email}</span><button type="button" className="acx-iconlink" onClick={() => copy(u.email, "Email copied")} aria-label="Copy email"><Copy size={14} /></button></li>
                  {phoneText(u) && <li><Phone size={16} weight="bold" aria-label="Phone" /><span>{phoneText(u)}</span></li>}
                </ul>
                <div className="acx-badges"><RoleBadge role={u.role} /><StatusBadge status={u.status} />{u.pendingSetup && <Badge tone="warn">Setup pending</Badge>}{u.emailVerified && <Badge tone="ok"><CheckCircle size={12} weight="fill" />Verified</Badge>}{u.google && <Badge tone="info"><GoogleLogo size={12} weight="bold" />Google</Badge>}</div>
              </div>
            </div>
            <div className="acx-since"><CalendarBlank size={18} weight="fill" aria-hidden /><div><small>Member for</small><b>{sinceText(u.createdAt) === "Today" ? "Joined today" : sinceText(u.createdAt)}</b></div></div>
          </header>

          {u.status !== "active" && (
            <div className="aux-alert"><ShieldWarning size={18} weight="fill" /><div><b>{titleCase(u.status)}</b>{u.statusReason ? ` — ${u.statusReason}` : ""}<small>{STATUS_HELP[u.status]}{u.statusChangedAt ? ` Changed ${ago(u.statusChangedAt)}${u.statusChangedBy ? ` by ${u.statusChangedBy.name}` : ""}.` : ""}</small></div><Btn variant="ghost" size="sm" onClick={() => pick("manage")}>Manage</Btn></div>
          )}

          {u.role === "partner" && (
            <div className="aux-alert"><ChartLineUp size={18} weight="fill" /><div><b>Partner account</b><small>Choose which products, numbers and columns this partner can see on their dashboard. Customer details are never shown to partners.</small></div><Btn variant="ghost" size="sm" as={Link} to={`/admin/partners#partner=${u.id}`}>Partner access</Btn></div>
          )}

          <nav className="aux-ptabs" aria-label="Sections">
            {tabs.map((t) => <button key={t.key} type="button" aria-current={tab === t.key ? "page" : undefined} onClick={() => pick(t.key)}><t.icon size={16} weight={tab === t.key ? "fill" : "bold"} />{t.label}</button>)}
          </nav>

          {tab === "profile" && (editing ? (
            <Card icon={PencilSimple} title="Edit details">
              <UserForm user={u} isSelf={self} busy={busy === "save"} onCancel={() => setEditing(false)} onSubmit={(body) => act("save", () => API.update(id, body), async () => { setEditing(false); await changed(); })} />
            </Card>
          ) : (
            <div className="acx-stack">
              <div className="arx-kpis aux-kpis">
                <Kpi icon={Pulse} label="Last sign-in" value={u.lastLoginAt ? ago(u.lastLoginAt) : "Never"} sub={u.lastLoginAt ? stamp(u.lastLoginAt) : "Hasn't signed in"} text />
                <Kpi icon={Devices} label="Devices" value={count(data.devices.length)} sub="Signed in now" />
                <Kpi icon={ShoppingCart} label="Purchases" value={count(data.purchases.paidOrders)} sub={`${money(data.purchases.paidAmount)} paid`} />
                <Kpi icon={WarningCircle} label="Failed sign-ins" value={count(data.failedLogins30d)} sub="Last 30 days" />
              </div>
              <div className="acx-grid2">
                <Card icon={User} title="Account" action={<Btn variant="ghost" size="sm" onClick={() => setEditing(true)}><PencilSimple size={15} />Edit</Btn>}>
                  <dl className="rf-kv aux-kv">
                    <Row label="Name">{u.name}</Row>
                    <Row label="Email">{u.email}</Row>
                    <Row label="Mobile">{phoneText(u) || "—"}</Row>
                    <Row label="Role">{roleLabel(u.role)}</Row>
                    <Row label="Joined">{stamp(u.createdAt)}</Row>
                    <Row label="Created by">{u.createdBy ? u.createdBy.name : "Signed up themselves"}</Row>
                    <Row label="Last updated">{ago(u.updatedAt)}{u.updatedBy ? ` · ${u.updatedBy.name}` : ""}</Row>
                  </dl>
                </Card>
                <Card icon={Lock} title="Security">
                  <dl className="rf-kv aux-kv">
                    <Row label="Password">{u.pendingSetup ? <Badge tone="warn">Not set yet</Badge> : u.passwordChangedAt ? `Changed ${ago(u.passwordChangedAt)}` : "Set at sign-up"}</Row>
                    <Row label="Email verified">{u.emailVerifiedAt ? day(u.emailVerifiedAt) : "No"}</Row>
                    <Row label="Google sign-in">{u.googleLinkedAt ? `Linked ${day(u.googleLinkedAt)}` : "Not linked"}</Row>
                    <Row label="Signed-in devices">{count(data.devices.length)}</Row>
                    <Row label="Activity records">{count(data.activityTotal)}</Row>
                  </dl>
                </Card>
              </div>
              {u.affiliate && (
                <Card icon={Handshake} title="Affiliate partnership">
                  <div className="acx-code"><div><span className="subtle">Referral code</span><br /><b>{u.affiliate.code}</b></div><Btn size="sm" variant="ghost" onClick={() => copy(u.affiliate.code, "Code copied")}><Copy size={15} />Copy</Btn></div>
                  <dl className="rf-kv aux-kv">
                    <Row label="Commission">{u.affiliate.commissionType === "percentage" ? `${u.affiliate.commissionValue}% of each sale` : `${money(u.affiliate.commissionValue)} per sale`}</Row>
                    <Row label="Partnership"><StatusBadge status={u.affiliate.status} /></Row>
                  </dl>
                </Card>
              )}
            </div>
          ))}

          {tab === "devices" && (
            <Card icon={Devices} title="Signed-in devices" caption="Every device signed in right now, most recently used first."
              action={data.devices.length > 0 && !self && <Btn variant="danger" size="sm" loading={busy === "all"} onClick={() => act("all", () => API.logoutAll(id), changed)}><SignOut size={15} />Sign out all</Btn>}>
              {data.devices.length === 0 ? <Empty emoji="💻" title="Not signed in anywhere" /> : (
                <div className="acx-devs">
                  {data.devices.map((d) => {
                    const I = deviceIcon(d.device?.type);
                    return (
                      <article key={d.sessionId} className="acx-dev">
                        <div className="row">
                          <span className="ico"><I size={22} weight="duotone" /></span>
                          <div className="name"><div><b>{d.device?.name || "Unknown device"}</b>{d.isTrusted && <Badge tone="info">Remembered</Badge>}</div><span className="subtle">{[d.device?.browser, d.device?.os].filter((x) => x && x !== "Browser" && x !== "Unknown OS").join(" · ")}</span></div>
                        </div>
                        <dl className="facts">
                          <div><dt>Last active</dt><dd>{ago(d.lastActiveAt)}</dd></div>
                          <div><dt>Signed in</dt><dd>{day(d.createdAt)}</dd></div>
                          <div><dt>Location</dt><dd>{d.location?.text || "Unknown"}</dd></div>
                          <div><dt>IP address</dt><dd className="mono">{d.ipAddress || "—"}</dd></div>
                        </dl>
                        {!self && <div className="acts"><Btn variant="ghost" size="sm" loading={busy === d.sessionId} onClick={() => act(d.sessionId, () => API.revoke(id, d.sessionId), changed)}><SignOut size={15} />Sign out this device</Btn></div>}
                      </article>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {tab === "activity" && (
            <Card icon={ClockCounterClockwise} title="Activity" caption={`Latest 10 of ${count(data.activityTotal)} events. Times in IST.`}
              action={data.activityTotal > 0 && <ClearActivity busy={busy === "clear"} onConfirm={() => act("clear", () => API.clearActivity(id), changed)} />}>
              {data.activities.length === 0 ? <Empty emoji="🕊️" title="No activity yet" /> : <ul className="acx-acts">{data.activities.map((a) => <ActivityItem key={a.id} a={a} />)}</ul>}
            </Card>
          )}

          {tab === "purchases" && (
            <Card icon={ShoppingCart} title="Book purchases" caption={`Orders placed with ${u.email} · ${count(data.purchases.paidOrders)} paid · ${money(data.purchases.paidAmount)} total`}>
              {data.purchases.recent.length === 0 ? <Empty emoji="🛒" title="No purchases yet" /> : (
                <div className="aux-lines">
                  {data.purchases.recent.map((o) => {
                    const st = String(o.status).toUpperCase();
                    return (
                      <div key={o.orderId} className={cx("aux-order", st === "SUCCESS" ? "ok" : st === "FAILED" ? "bad" : "")}>
                        <span className="mid"><b>{o.title}</b><small className="mono">{o.orderId}{o.coupon ? ` · ${o.coupon}` : ""} · {stamp(o.at)}</small></span>
                        <span className="end"><b className="mono">{money(o.amount)}</b><Badge tone={st === "SUCCESS" ? "ok" : st === "FAILED" ? "bad" : "muted"}>{titleCase(st)}</Badge></span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {tab === "sales" && u.affiliate && <PartnerSales id={id} />}
          {tab === "orders" && u.affiliate && <PartnerOrders id={id} />}
          {tab === "manage" && <Manage u={u} self={self} busy={busy} act={act} changed={changed} onDeleted={() => { onChanged(); back(); }} />}
        </>
      )}
    </div>
  );
}

function ClearActivity({ busy, onConfirm }) {
  const [ask, setAsk] = useState(false);
  if (!ask) return <Btn variant="ghost" size="sm" onClick={() => setAsk(true)}><Trash size={15} />Clear</Btn>;
  return <div className="rf-btns"><Btn variant="ghost" size="sm" onClick={() => setAsk(false)}>Keep</Btn><Btn variant="danger" size="sm" loading={busy} onClick={async () => { await onConfirm(); setAsk(false); }}>Delete all</Btn></div>;
}

/* settings-style list: one row per action, the destructive one on its own at the bottom */
function Manage({ u, self, busy, act, changed, onDeleted }) {
  const [next, setNext] = useState(u.status === "active" ? "suspended" : "active");
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState("");
  const id = u.id;
  return (
    <div className="acx-stack">
      <Card icon={ShieldWarning} title="Account access" caption={self ? "You can't change your own status." : `Currently ${u.status}. ${STATUS_HELP[u.status] || ""}`}>
        {!self && (
          <>
            <Seg label="Status" value={next} onChange={setNext} options={STATUSES.map((s) => [s, titleCase(s)])} />
            <p className="acx-note">{STATUS_HELP[next]}</p>
            <label className="aux-field"><span>Reason <em>optional</em></span><textarea className="rv-input" rows={2} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Payment dispute under review" /></label>
            <div className="rf-btns"><Btn disabled={next === u.status} loading={busy === "status"} onClick={() => act("status", () => API.status(id, next, reason.trim()), async () => { setReason(""); await changed(); })}><Check size={16} />{next === u.status ? `Already ${next}` : `Set to ${titleCase(next)}`}</Btn></div>
          </>
        )}
      </Card>

      <section className="arx-card aux-settings">
        <div className="acx-cardhead"><h3><Key size={15} weight="bold" />Quick actions</h3></div>
        <div className="aux-setting">
          <div><b>{u.pendingSetup ? "Resend set-up link" : "Send password reset link"}</b><span>Emails {u.email} a link to set a new password.</span></div>
          <Btn variant="ghost" size="sm" loading={busy === "pw"} onClick={() => act("pw", () => API.passwordLink(id), changed)}><PaperPlaneTilt size={15} />Send</Btn>
        </div>
        <div className="aux-setting">
          <div><b>Sign out everywhere</b><span>Ends every session now. They can sign in again.</span></div>
          <Btn variant="ghost" size="sm" disabled={self} loading={busy === "all"} onClick={() => act("all", () => API.logoutAll(id), changed)}><SignOut size={15} />Sign out</Btn>
        </div>
        {u.affiliate && (
          <div className="aux-setting">
            <div><b>Affiliate partnership</b><span>{u.affiliate.status === "active" ? "On. Their code earns commission." : "Off. Their code doesn't earn commission."}</span></div>
            <Btn variant="ghost" size="sm" loading={busy === "aff"} onClick={() => act("aff", () => API.affiliate(id, u.affiliate.status === "active" ? "inactive" : "active"), changed)}>{u.affiliate.status === "active" ? <><Prohibit size={15} />Switch off</> : <><CheckCircle size={15} />Switch on</>}</Btn>
          </div>
        )}
      </section>

      <section className="arx-card danger">
        <div className="acx-cardhead"><h3><Trash size={15} weight="bold" />Delete account</h3><p>{self ? "You can't delete your own account." : u.role === "admin" ? "Admin accounts can't be deleted. Change the role first." : "Erases the account, its activity and its data for good."}</p></div>
        {!self && u.role !== "admin" && (
          <>
            <label className="aux-field"><span>Type <b className="mono">{u.email}</b> to confirm</span><input className="rv-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="off" /></label>
            <div className="rf-btns"><Btn variant="danger" disabled={confirm.trim().toLowerCase() !== u.email.toLowerCase()} loading={busy === "del"} onClick={() => act("del", () => API.remove(id), onDeleted)}><Trash size={16} />Delete forever</Btn></div>
          </>
        )}
      </section>
    </div>
  );
}

function PartnerSales({ id }) {
  const [days, setDays] = useState(30);
  const [period, setPeriod] = useState("last30Days");
  const { data, error, loading, reload } = useLoad(() => API.sales(id, days), `${id}:${days}`);
  if (error) return <ErrorBox error={error} retry={() => reload()} />;
  if (!data) return <div className="acx-skel" style={{ height: 300 }} />;
  const all = data.summary?.allTime || {};
  const cur = data.summary?.[period] || {};
  return (
    <div className="acx-stack">
      <div className="arx-kpis aux-kpis">
        <Kpi icon={Handshake} label="Commission earned" value={money(all.earnedCommission)} sub="All time" />
        <Kpi icon={ChartBar} label="Verified sales" value={money(all.successfulAmount)} sub={`${count(all.successfulOrders)} orders`} />
        <Kpi icon={Receipt} label="All orders" value={count(all.totalOrders)} sub={`${count(all.failedOrders)} failed`} />
        <Kpi icon={CheckCircle} label="Success rate" value={`${Number(all.conversionRate || 0).toFixed(1)}%`} />
      </div>
      <Card icon={CalendarBlank} title="By period" action={<Seg label="Period" value={period} onChange={setPeriod} options={[["today", "Today"], ["last7Days", "7d"], ["last30Days", "30d"], ["last365Days", "1y"]]} />}>
        <div className="aux-pills">
          <span>Sales<b className="mono">{money(cur.successfulAmount)}</b></span><span>Commission<b className="mono">{money(cur.earnedCommission)}</b></span>
          <span>Orders<b className="mono">{count(cur.successfulOrders)}</b></span><span>Failed<b className="mono">{count(cur.failedOrders)}</b></span>
        </div>
      </Card>
      <SalesChart graph={data.graph} days={days} loading={loading} onDays={setDays} />
      <Card icon={Receipt} title="Recent orders"><OrdersTable orders={data.recentOrders || []} /></Card>
    </div>
  );
}

function PartnerOrders({ id }) {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const { data, error, loading, reload } = useLoad(() => API.orders(id, { status, page, limit: 15, sort: "desc" }), `${id}:${status}:${page}`);
  const t = data?.totals || {};
  const p = data?.pagination || {};
  return (
    <div className="acx-stack">
      <label className="aux-field" style={{ maxWidth: 260 }}><span>Status</span>
        <select className="rv-input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>{["ALL", "EARNED", "PENDING", "FAILED", "REFUNDED", "UNVERIFIED"].map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select>
      </label>
      {error && <ErrorBox error={error} retry={() => reload()} />}
      <div className="arx-kpis aux-kpis">
        <Kpi icon={Receipt} label="Matching" value={count(t.totalOrders)} />
        <Kpi icon={ChartBar} label="Verified sales" value={money(t.successfulAmount)} />
        <Kpi icon={Handshake} label="Commission" value={money(t.earnedCommission)} />
        <Kpi icon={WarningCircle} label="Failed" value={count(t.failedOrders)} />
      </div>
      <div className={cx(loading && "rlx-dim")}>{!data ? <div className="acx-skel" style={{ height: 240 }} /> : <OrdersTable orders={data.orders || []} />}</div>
      {p.pages > 1 && (
        <div className="aux-pager">
          <Btn variant="ghost" size="sm" disabled={loading || !p.hasPrevious} onClick={() => setPage((n) => Math.max(1, n - 1))}><CaretLeft size={14} />Prev</Btn>
          <span>Page <b>{p.page || page}</b> of {p.pages || 1}</span>
          <Btn variant="ghost" size="sm" disabled={loading || !p.hasNext} onClick={() => setPage((n) => n + 1)}>Next<CaretRight size={14} /></Btn>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ page */
export default function UserManagement() {
  const authUser = useSelector((s) => s.auth?.user);
  const me = String(authUser?._id || authUser?.id || authUser?.userId || "");
  const [{ view, person }, setNav] = useState(readHash);
  const [creating, setCreating] = useState(false);
  const [tick, setTick] = useState(0);

  const overview = useLoad(() => (view === "overview" && !person ? API.list({ view: "overview", ...(tick ? { fresh: 1 } : {}) }) : Promise.resolve(overview?.data ?? null)), `${view}:${person ? "p" : ""}:${tick}`);
  const stats = overview.data?.stats;

  const go = useCallback((k) => { setNav({ view: k, person: null }); writeHash(k); window.scrollTo({ top: 0 }); }, []);
  const open = useCallback((id) => { setNav((n) => { writeHash(`user=${id}&from=${n.view}`); return { ...n, person: String(id) }; }); window.scrollTo({ top: 0 }); }, []);
  const back = useCallback(() => setNav((n) => { writeHash(n.view); return { ...n, person: null }; }), []);
  useEffect(() => { const on = () => setNav(readHash()); window.addEventListener("hashchange", on); return () => window.removeEventListener("hashchange", on); }, []);
  const changed = useCallback(() => setTick((n) => n + 1), []);

  const [title, sub] = HEAD[view];
  const backLabel = `Back to ${VIEWS.find((v) => v.key === view)?.label.toLowerCase() || "users"}`;

  return (
    <Page title="Users · Admin · Target Trek" top={false}>
      <div className="arx rlx acx aux">
        <div className="arx-layout">
          <aside className="arx-side" aria-label="User sections">
            <div className="acx-me"><span className="acx-av"><Users size={20} weight="bold" /></span><div><b>Users</b><small>Admin console</small></div></div>
            <nav className="arx-nav">
              <span>People</span>
              {VIEWS.map((v) => (
                <button key={v.key} type="button" aria-current={view === v.key ? "page" : undefined} onClick={() => go(v.key)}>
                  <v.icon size={18} weight={view === v.key ? "fill" : "regular"} />{v.label}
                  {v.key === "pending" && stats?.pending > 0 && <em>{stats.pending}</em>}
                </button>
              ))}
            </nav>
            <div className="arx-foot"><Btn size="sm" onClick={() => setCreating(true)}><UserPlus size={15} />Add user</Btn></div>
          </aside>

          <main className="arx-main">
            <div className="acx-body acx-stack">
              {person ? (
                <PersonPage key={person} id={person} me={me} back={back} backLabel={backLabel} onChanged={changed} />
              ) : (
                <>
                  <div className="aux-head">
                    <div><h1>{title}</h1><p>{sub}</p></div>
                    <Btn size="sm" onClick={() => setCreating(true)}><UserPlus size={16} />Add user</Btn>
                  </div>
                  {view === "overview" ? (
                    overview.error && !overview.data ? <ErrorBox error={overview.error} retry={() => overview.reload()} />
                      : !overview.data ? <div className="acx-stack"><div className="arx-kpis aux-kpis">{Array.from({ length: 8 }, (_, i) => <div key={i} className="acx-skel" style={{ height: 92 }} />)}</div><div className="acx-skel" style={{ height: 260 }} /></div>
                      : <Overview data={overview.data} go={go} onOpen={open} />
                  ) : (
                    <UserList key={view} view={view} me={me} onOpen={open} refreshKey={tick} onChanged={changed} />
                  )}
                </>
              )}
            </div>
          </main>
        </div>

        <nav className="acx-tabbar" aria-label="User sections" style={{ gridTemplateColumns: `repeat(${VIEWS.length}, minmax(0, 1fr))` }}>
          {VIEWS.map((v) => (
            <button key={v.key} type="button" aria-label={v.label} title={v.label} aria-current={view === v.key ? "page" : undefined} onClick={() => go(v.key)}>
              <v.icon size={24} weight={view === v.key ? "fill" : "regular"} aria-hidden />
              {v.key === "pending" && stats?.pending > 0 && <em>{stats.pending}</em>}
            </button>
          ))}
        </nav>
      </div>

      {creating && <CreateSheet onClose={() => setCreating(false)} onCreated={(newId) => { setCreating(false); changed(); if (newId) open(newId); }} />}
    </Page>
  );
}
