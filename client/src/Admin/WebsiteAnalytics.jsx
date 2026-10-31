import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import BASE_URL from "../utils/Url";

/* ============================================================
   CONFIG
============================================================ */

const API = `${BASE_URL}/api/admin/analytics`;
const TIMEZONE = "Asia/Kolkata";
const THEME_KEY = "theme";
const THEME_EVENTS = ["themechange", "targettrek-theme-change"];

const PERIODS = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "1h", label: "1 Hour" },
  { id: "6h", label: "6 Hours" },
  { id: "24h", label: "24 Hours" },
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "180d", label: "6 Months" },
  { id: "365d", label: "1 Year" },
  { id: "custom", label: "Custom" },
];

const PAGE_SORTS = [
  { id: "views", label: "Views" },
  { id: "unique", label: "Unique" },
  { id: "scroll", label: "Scroll" },
  { id: "engagement", label: "Engagement" },
];

const WEEKDAYS = [
  { dow: 2, label: "Mon" },
  { dow: 3, label: "Tue" },
  { dow: 4, label: "Wed" },
  { dow: 5, label: "Thu" },
  { dow: 6, label: "Fri" },
  { dow: 7, label: "Sat" },
  { dow: 1, label: "Sun" },
];

/* ============================================================
   LOCAL COLOR VARIABLES (orange palette, light + dark)
============================================================ */

const THEMES = {
  light: {
    bg: "#fff7ed",
    surface: "#ffffff",
    surface2: "#fff1e0",
    border: "#fed7aa",
    text: "#431407",
    muted: "#8a5a44",
    primary: "#ea580c",
    primaryStrong: "#c2410c",
    onPrimary: "#ffffff",
    soft: "#ffedd5",
    grid: "#fde6cf",
    good: "#15803d",
    bad: "#b91c1c",
    series: [
      "#ea580c",
      "#f59e0b",
      "#9a3412",
      "#fdba74",
      "#c2410c",
      "#fcd34d",
    ],
    heat: ["#fff1e0", "#fed7aa", "#fdba74", "#fb923c", "#ea580c", "#9a3412"],
  },
  dark: {
    bg: "#190e07",
    surface: "#26160d",
    surface2: "#321d11",
    border: "#4d2c18",
    text: "#ffedd5",
    muted: "#d3a889",
    primary: "#fb923c",
    primaryStrong: "#f97316",
    onPrimary: "#1c0d04",
    soft: "#3d2314",
    grid: "#3a2314",
    good: "#4ade80",
    bad: "#f87171",
    series: [
      "#fb923c",
      "#fbbf24",
      "#c2410c",
      "#fed7aa",
      "#f97316",
      "#fde68a",
    ],
    heat: ["#321d11", "#5c3318", "#8a4a1c", "#c2641f", "#f97316", "#fdba74"],
  },
};

const cssVars = (t) => ({
  "--wa-bg": t.bg,
  "--wa-surface": t.surface,
  "--wa-surface2": t.surface2,
  "--wa-border": t.border,
  "--wa-text": t.text,
  "--wa-muted": t.muted,
  "--wa-primary": t.primary,
  "--wa-primary-strong": t.primaryStrong,
  "--wa-on-primary": t.onPrimary,
  "--wa-soft": t.soft,
  "--wa-grid": t.grid,
  "--wa-good": t.good,
  "--wa-bad": t.bad,
});

const STYLES = `
.wa-root{background:var(--wa-bg);color:var(--wa-text);min-height:100vh}
.wa-card{background:var(--wa-surface);border:1px solid var(--wa-border);border-radius:16px}
.wa-muted{color:var(--wa-muted)}
.wa-title{color:var(--wa-text)}
.wa-btn{border:1px solid var(--wa-border);background:var(--wa-surface);color:var(--wa-text);border-radius:999px;padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap}
.wa-btn:hover{border-color:var(--wa-primary);color:var(--wa-primary)}
.wa-btn.is-active{background:var(--wa-primary);border-color:var(--wa-primary);color:var(--wa-on-primary)}
.wa-btn:disabled{opacity:.5;cursor:not-allowed}
.wa-input{background:var(--wa-surface);border:1px solid var(--wa-border);color:var(--wa-text);border-radius:10px;padding:7px 10px;font-size:13px;outline:none;min-width:0}
.wa-input:focus{border-color:var(--wa-primary);box-shadow:0 0 0 3px var(--wa-soft)}
.wa-table{width:100%;border-collapse:collapse;font-size:13px}
.wa-table th{text-align:left;font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--wa-muted);padding:8px 10px;border-bottom:1px solid var(--wa-border);white-space:nowrap}
.wa-table td{padding:9px 10px;border-bottom:1px solid var(--wa-grid);white-space:nowrap}
.wa-table tr.is-click{cursor:pointer}
.wa-table tr.is-click:hover td{background:var(--wa-soft)}
.wa-num{text-align:right!important;font-variant-numeric:tabular-nums}
.wa-bar-track{background:var(--wa-soft);border-radius:999px;height:8px;overflow:hidden}
.wa-bar-fill{background:var(--wa-primary);height:100%;border-radius:999px}
.wa-pill{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600;background:var(--wa-soft);color:var(--wa-primary-strong)}
.wa-dot{width:8px;height:8px;border-radius:50%;background:var(--wa-primary);display:inline-block}
.wa-live-dot{animation:wa-pulse 1.6s infinite}
@keyframes wa-pulse{0%{box-shadow:0 0 0 0 rgba(234,88,12,.55)}70%{box-shadow:0 0 0 8px rgba(234,88,12,0)}100%{box-shadow:0 0 0 0 rgba(234,88,12,0)}}
.wa-skeleton{background:linear-gradient(90deg,var(--wa-soft),var(--wa-surface2),var(--wa-soft));background-size:200% 100%;animation:wa-shimmer 1.4s infinite;border-radius:12px}
@keyframes wa-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.wa-overlay{position:fixed;inset:0;background:rgba(20,8,2,.55);z-index:60;display:flex;justify-content:flex-end}
.wa-drawer{background:var(--wa-bg);color:var(--wa-text);width:min(760px,100%);height:100%;overflow-y:auto;border-left:1px solid var(--wa-border)}
.wa-tick text{fill:var(--wa-muted)}
`;

/* ============================================================
   FORMATTERS
============================================================ */

const nf = new Intl.NumberFormat("en-IN");
const num = (v) => nf.format(Math.round(Number(v) || 0));
const dec = (v, d = 1) => (Number(v) || 0).toFixed(d);
const pct = (v) => `${dec(v)}%`;

const dur = (seconds) => {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${String(s % 60).padStart(2, "0")}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${String(m % 60).padStart(2, "0")}m`;
};

const dateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
};

const ago = (value) => {
  const s = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  return s < 60 ? `${Math.round(s)}s ago` : `${dur(s)} ago`;
};

// Bucket label for chart axes (short) and tooltips (long).
const bucketLabel = (iso, granularity, long = false) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const fmt = (options) =>
    new Intl.DateTimeFormat("en-IN", {
      timeZone: TIMEZONE,
      ...options,
    }).format(d);

  if (granularity === "5 minutes") {
    return fmt({ hour: "numeric", minute: "2-digit", hour12: true });
  }

  if (granularity === "hour") {
    return long
      ? fmt({ day: "2-digit", month: "short", hour: "numeric", hour12: true })
      : fmt({ hour: "numeric", hour12: true });
  }

  if (granularity === "month") {
    return fmt({ month: "short", year: "2-digit" });
  }

  return fmt({ day: "2-digit", month: "short" });
};

const shortId = (id) => (id ? String(id).slice(0, 8) : "-");

/* ============================================================
   HOOKS
============================================================ */

const readTheme = () => {
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

// Follows the site-wide theme saved in localStorage and reacts
// to changes made in this tab, other tabs, or by the navbar.
function useSiteTheme() {
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    const sync = () => setTheme(readTheme());

    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    THEME_EVENTS.forEach((name) => window.addEventListener(name, sync));

    // setItem in the same tab fires no event, so poll cheaply.
    const timer = setInterval(sync, 1000);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      THEME_EVENTS.forEach((name) => window.removeEventListener(name, sync));
      clearInterval(timer);
    };
  }, []);

  return theme;
}

function useDebounced(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

/* ============================================================
   SMALL UI PIECES
============================================================ */

function Card({ title, subtitle, right, children, className = "" }) {
  return (
    <section className={`wa-card p-4 sm:p-5 ${className}`}>
      {(title || right) && (
        <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <div>
            {title && (
              <h2 className="wa-title text-base font-bold">{title}</h2>
            )}
            {subtitle && (
              <p className="wa-muted mt-0.5 text-xs">{subtitle}</p>
            )}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

function Empty({ text = "No data for this period" }) {
  return (
    <div className="wa-muted flex h-32 items-center justify-center text-sm">
      {text}
    </div>
  );
}

function Skeleton({ className = "h-64" }) {
  return <div className={`wa-skeleton w-full ${className}`} />;
}

function Delta({ value, invert = false }) {
  if (value === null || value === undefined) {
    return <span className="wa-muted text-xs">new</span>;
  }

  const up = value > 0;
  const flat = value === 0;
  const good = flat ? null : invert ? !up : up;

  return (
    <span
      className="text-xs font-semibold"
      style={{
        color: flat
          ? "var(--wa-muted)"
          : good
            ? "var(--wa-good)"
            : "var(--wa-bad)",
      }}
    >
      {flat ? "–" : up ? "▲" : "▼"} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

function Kpi({ label, value, change, invert, hint }) {
  return (
    <div className="wa-card p-4" title={hint}>
      <p className="wa-muted text-xs font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold sm:text-3xl">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        <Delta value={change} invert={invert} />
        <span className="wa-muted text-[11px]">vs previous</span>
      </div>
    </div>
  );
}

function Tabs({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`wa-btn ${value === option.id ? "is-active" : ""}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Horizontal bars built from plain divs: readable long labels.
function BarList({ items, valueKey = "value", labelKey = "label", format = num, onClick }) {
  if (!items?.length) return <Empty />;

  const max = Math.max(...items.map((i) => Number(i[valueKey]) || 0), 1);

  return (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const value = Number(item[valueKey]) || 0;
        const Row = onClick ? "button" : "div";

        return (
          <li key={item[labelKey]}>
            <Row
              type={onClick ? "button" : undefined}
              onClick={onClick ? () => onClick(item) : undefined}
              className="block w-full text-left"
            >
              <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                <span className="truncate" title={item[labelKey]}>
                  {item[labelKey]}
                </span>
                <span className="font-semibold tabular-nums">
                  {format(value)}
                </span>
              </div>
              <div className="wa-bar-track">
                <div
                  className="wa-bar-fill"
                  style={{ width: `${Math.max(2, (value / max) * 100)}%` }}
                />
              </div>
            </Row>
          </li>
        );
      })}
    </ul>
  );
}

function DataTable({ columns, rows, onRowClick, empty, rowKey }) {
  if (!rows?.length) return <Empty text={empty} />;

  return (
    <div className="overflow-x-auto">
      <table className="wa-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={c.num ? "wa-num" : ""}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey ? rowKey(row) : index}
              className={onRowClick ? "is-click" : ""}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} className={c.num ? "wa-num" : ""}>
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ pagination, onChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="mt-3 flex items-center justify-between gap-2 text-sm">
      <span className="wa-muted">
        Page {pagination.page} of {pagination.totalPages} ·{" "}
        {num(pagination.total)} total
      </span>
      <div className="flex gap-2">
        <button
          className="wa-btn"
          disabled={pagination.page <= 1}
          onClick={() => onChange(pagination.page - 1)}
        >
          Prev
        </button>
        <button
          className="wa-btn"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function Drawer({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="wa-overlay" onClick={onClose}>
      <aside className="wa-drawer" onClick={(e) => e.stopPropagation()}>
        <div
          className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-3"
          style={{
            background: "var(--wa-surface)",
            borderBottom: "1px solid var(--wa-border)",
          }}
        >
          <h3 className="truncate text-base font-bold">{title}</h3>
          <button className="wa-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="space-y-4 p-5">{children}</div>
      </aside>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div
      className="rounded-xl p-3"
      style={{ background: "var(--wa-surface2)" }}
    >
      <p className="wa-muted text-[11px] font-semibold uppercase">{label}</p>
      <p className="mt-0.5 text-lg font-bold">{value}</p>
    </div>
  );
}

/* ============================================================
   CHARTS
============================================================ */

function ChartTip({ active, payload, label, labelFormatter, valueFormatter = num }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl px-3 py-2 text-xs shadow-lg"
      style={{
        background: "var(--wa-surface)",
        border: "1px solid var(--wa-border)",
        color: "var(--wa-text)",
      }}
    >
      <p className="mb-1 font-bold">
        {labelFormatter ? labelFormatter(label) : label}
      </p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: entry.color || entry.stroke }}
          />
          <span className="wa-muted">{entry.name}</span>
          <span className="ml-auto pl-3 font-semibold">
            {valueFormatter(entry.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

function useAxis(colors) {
  return {
    stroke: colors.muted,
    tick: { fill: colors.muted, fontSize: 11 },
    tickLine: false,
    axisLine: { stroke: colors.border },
  };
}

function TrafficChart({ timeline, colors }) {
  const [hidden, setHidden] = useState({});
  const axis = useAxis(colors);
  const granularity = timeline?.granularity;

  const series = [
    { key: "pageViews", name: "Page views", color: colors.series[0] },
    { key: "uniqueVisitors", name: "Unique visitors", color: colors.series[2] },
    { key: "uniqueSessions", name: "Sessions", color: colors.series[1] },
  ];

  if (!timeline?.data?.length) return <Empty />;

  return (
    <>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {series.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`wa-btn ${hidden[s.key] ? "" : "is-active"}`}
            onClick={() => setHidden((h) => ({ ...h, [s.key]: !h[s.key] }))}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer>
          <AreaChart data={timeline.data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`wa-g-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timestamp"
              {...axis}
              minTickGap={24}
              tickFormatter={(v) => bucketLabel(v, granularity)}
            />
            <YAxis {...axis} allowDecimals={false} />
            <Tooltip
              content={
                <ChartTip labelFormatter={(v) => bucketLabel(v, granularity, true)} />
              }
            />
            {series.map(
              (s) =>
                !hidden[s.key] && (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.name}
                    stroke={s.color}
                    strokeWidth={2}
                    fill={`url(#wa-g-${s.key})`}
                  />
                )
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function NewReturningChart({ timeline, colors }) {
  const axis = useAxis(colors);
  const granularity = timeline?.granularity;

  if (!timeline?.data?.length) return <Empty />;

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={timeline.data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            {...axis}
            minTickGap={24}
            tickFormatter={(v) => bucketLabel(v, granularity)}
          />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip
            content={<ChartTip labelFormatter={(v) => bucketLabel(v, granularity, true)} />}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: colors.muted }} />
          <Bar dataKey="newVisitors" name="New" stackId="v" fill={colors.series[0]} />
          <Bar
            dataKey="returningVisitors"
            name="Returning"
            stackId="v"
            fill={colors.series[3]}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LiveAreaChart({ data, colors, xKey, granularity, name = "Active users", dataKey = "activeSessions" }) {
  const axis = useAxis(colors);

  if (!data?.length) return <Empty text="Collecting live data…" />;

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="wa-live" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.series[0]} stopOpacity={0.4} />
              <stop offset="100%" stopColor={colors.series[0]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={xKey}
            {...axis}
            minTickGap={30}
            tickFormatter={(v) => bucketLabel(v, granularity)}
          />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip
            content={<ChartTip labelFormatter={(v) => bucketLabel(v, granularity, true)} />}
          />
          <Area
            type="stepAfter"
            dataKey={dataKey}
            name={name}
            stroke={colors.series[0]}
            strokeWidth={2}
            fill="url(#wa-live)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ConcurrentChart({ history, colors }) {
  const axis = useAxis(colors);
  const granularity = history?.granularity;

  if (!history?.data?.length) {
    return <Empty text="No concurrent-user history yet" />;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <LineChart data={history.data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            {...axis}
            minTickGap={28}
            tickFormatter={(v) => bucketLabel(v, granularity)}
          />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip
            content={<ChartTip labelFormatter={(v) => bucketLabel(v, granularity, true)} />}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: colors.muted }} />
          <Line type="monotone" dataKey="peakActive" name="Peak" stroke={colors.series[2]} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="avgActive" name="Average" stroke={colors.series[0]} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function EventsChart({ timeline, granularity, colors }) {
  const axis = useAxis(colors);

  if (!timeline?.length) return <Empty />;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={timeline} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="timestamp"
            {...axis}
            minTickGap={24}
            tickFormatter={(v) => bucketLabel(v, granularity)}
          />
          <YAxis {...axis} allowDecimals={false} />
          <Tooltip
            content={<ChartTip labelFormatter={(v) => bucketLabel(v, granularity, true)} />}
          />
          <Bar dataKey="events" name="Events" fill={colors.series[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Donut({ data, colors, nameKey = "name", valueKey = "sessions" }) {
  if (!data?.length) return <Empty />;

  const total = data.reduce((sum, d) => sum + d[valueKey], 0) || 1;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row">
      <div className="h-44 w-44 shrink-0">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              innerRadius={48}
              outerRadius={78}
              paddingAngle={2}
              stroke={colors.surface}
            >
              {data.map((entry, i) => (
                <Cell key={entry[nameKey]} fill={colors.series[i % colors.series.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-1.5 text-sm">
        {data.map((entry, i) => (
          <li key={entry[nameKey]} className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: colors.series[i % colors.series.length] }}
            />
            <span className="capitalize">{entry[nameKey]}</span>
            <span className="ml-auto font-semibold tabular-nums">
              {num(entry[valueKey])}
              <span className="wa-muted ml-1 text-xs">
                ({dec((entry[valueKey] / total) * 100, 0)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Heatmap({ data, colors }) {
  const { grid, max } = useMemo(() => {
    const map = new Map();
    let peak = 0;
    (data || []).forEach((cell) => {
      map.set(`${cell.dayOfWeek}-${cell.hour}`, cell.pageViews);
      peak = Math.max(peak, cell.pageViews);
    });
    return { grid: map, max: peak };
  }, [data]);

  if (!max) return <Empty />;

  const shade = (value) => {
    if (!value) return colors.heat[0];
    const index = Math.min(
      colors.heat.length - 1,
      1 + Math.floor((value / max) * (colors.heat.length - 1))
    );
    return colors.heat[index];
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px]">
        <div className="mb-1 ml-9 grid gap-[3px]" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
          {Array.from({ length: 24 }, (_, h) => (
            <span key={h} className="wa-muted text-center text-[9px]">
              {h % 3 === 0 ? h : ""}
            </span>
          ))}
        </div>
        {WEEKDAYS.map((day) => (
          <div key={day.dow} className="mb-[3px] flex items-center gap-1">
            <span className="wa-muted w-8 text-[11px]">{day.label}</span>
            <div className="grid flex-1 gap-[3px]" style={{ gridTemplateColumns: "repeat(24, minmax(0, 1fr))" }}>
              {Array.from({ length: 24 }, (_, h) => {
                const value = grid.get(`${day.dow}-${h}`) || 0;
                return (
                  <div
                    key={h}
                    title={`${day.label} ${h}:00 – ${num(value)} page views`}
                    className="aspect-square rounded-[4px]"
                    style={{ background: shade(value) }}
                  />
                );
              })}
            </div>
          </div>
        ))}
        <p className="wa-muted mt-2 text-right text-[11px]">
          Busiest slot: {num(max)} page views · times in IST
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   DRAWERS: page details + visitor journey
============================================================ */

function PageDetailsDrawer({ page, request, rangeParams, colors, onClose }) {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, error: "", data: null });

    request("/page-details", { ...rangeParams, page }, controller.signal)
      .then((body) => setState({ loading: false, error: "", data: body.data }))
      .catch((e) => {
        if (e.name !== "AbortError") {
          setState({ loading: false, error: e.message, data: null });
        }
      });

    return () => controller.abort();
  }, [page, request, rangeParams]);

  const d = state.data;

  return (
    <Drawer title={`Route ${page}`} onClose={onClose}>
      {state.loading && <Skeleton className="h-64" />}
      {state.error && <p style={{ color: "var(--wa-bad)" }}>{state.error}</p>}
      {d && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Page views" value={num(d.totalViews)} />
            <Stat label="Unique visitors" value={num(d.uniqueVisitors)} />
            <Stat label="Avg scroll" value={pct(d.avgScrollPercentage)} />
            <Stat label="Avg engagement" value={dur(d.avgEngagementSeconds)} />
            <Stat label="Max scroll" value={pct(d.maxScrollPercentage)} />
            <Stat label="Reached 90%" value={num(d.pageViewsReached90Percent)} />
          </div>

          <Card title="Traffic on this route">
            <TrafficChart
              colors={colors}
              timeline={{ data: d.timeline, granularity: d.granularity }}
            />
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title="Referral codes">
              <BarList items={d.referrals?.map((r) => ({ label: r.label, value: r.count }))} />
            </Card>
            <Card title="Came from">
              <BarList
                items={d.previousPages?.map((r) => ({
                  label: r.label === "Unknown" ? "Direct / external" : r.label,
                  value: r.count,
                }))}
              />
            </Card>
            <Card title="Devices">
              <BarList items={d.devices?.map((r) => ({ label: r.label, value: r.count }))} />
            </Card>
            <Card title="Countries">
              <BarList items={d.countries?.map((r) => ({ label: r.label, value: r.count }))} />
            </Card>
            <Card title="Events on this route">
              <BarList items={d.events?.map((r) => ({ label: r._id, value: r.count }))} />
            </Card>
            <Card title="URL parameters">
              {d.queryParams?.length ? (
                <ul className="space-y-2 text-sm">
                  {d.queryParams.map((q) => (
                    <li key={q.key}>
                      <span className="font-semibold">{q.key}</span>
                      <span className="wa-muted"> · {num(q.total)} hits · </span>
                      {q.topValues.map((v) => `${v.value} (${v.count})`).join(", ")}
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty />
              )}
            </Card>
          </div>
        </>
      )}
    </Drawer>
  );
}

function JourneyDrawer({ visitorId, request, onClose }) {
  const [state, setState] = useState({ loading: true, error: "", data: null });

  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true, error: "", data: null });

    request(`/visitors/${encodeURIComponent(visitorId)}`, {}, controller.signal)
      .then((body) => setState({ loading: false, error: "", data: body.data }))
      .catch((e) => {
        if (e.name !== "AbortError") {
          setState({ loading: false, error: e.message, data: null });
        }
      });

    return () => controller.abort();
  }, [visitorId, request]);

  const v = state.data?.visitor;

  return (
    <Drawer title={`Visitor ${shortId(visitorId)}`} onClose={onClose}>
      {state.loading && <Skeleton className="h-64" />}
      {state.error && <p style={{ color: "var(--wa-bad)" }}>{state.error}</p>}
      {v && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="First seen" value={dateTime(v.firstSeenAt)} />
            <Stat label="Last seen" value={dateTime(v.lastSeenAt)} />
            <Stat label="Sessions" value={num(v.sessionCount)} />
            <Stat label="Page views" value={num(v.pageViewCount)} />
            <Stat label="First ref code" value={v.firstReferralCode || "Direct"} />
            <Stat label="Country" value={v.country || "-"} />
            <Stat label="Device" value={v.device?.type || "-"} />
            <Stat
              label="Browser"
              value={`${v.device?.browser || "-"} ${v.device?.browserVersion?.split(".")[0] || ""}`}
            />
            <Stat label="OS" value={`${v.device?.os || "-"} ${v.device?.osVersion || ""}`} />
          </div>

          {state.data.sessions.map((s) => (
            <Card
              key={s.sessionId}
              title={`Session ${dateTime(s.startedAt)}`}
              subtitle={`${s.status === "ACTIVE" ? "Live" : "Ended"} · ${dur(
                s.durationSeconds ??
                  (new Date(s.lastSeenAt) - new Date(s.startedAt)) / 1000
              )} · ${s.pageCount || 0} pages · ref ${s.referralCode || "none"}${
                s.referrerHost ? ` · from ${s.referrerHost}` : ""
              }`}
              right={s.isBounce ? <span className="wa-pill">Bounce</span> : null}
            >
              <ol className="space-y-2 text-sm">
                {s.pages.map((p) => (
                  <li
                    key={p.pageVisitId}
                    className="rounded-lg p-2.5"
                    style={{ background: "var(--wa-surface2)" }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{p.page}</span>
                      <span className="wa-muted text-xs">{dateTime(p.enteredAt)}</span>
                    </div>
                    <p className="wa-muted mt-0.5 text-xs">
                      Scroll {p.maxScrollPercentage}% · active {dur(p.activeTimeSeconds)}
                      {p.query && Object.keys(p.query).length > 0 &&
                        ` · ?${new URLSearchParams(p.query).toString()}`}
                    </p>
                  </li>
                ))}
                {s.events.map((e) => (
                  <li key={e.eventId} className="flex items-center gap-2 text-xs">
                    <span className="wa-pill">{e.eventType}</span>
                    <span className="wa-muted">
                      {e.page} · {dateTime(e.createdAt)}
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          ))}
        </>
      )}
    </Drawer>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function WebsiteAnalytics() {
  const token = useSelector((state) => state.auth.token);
  const theme = useSiteTheme();
  const colors = THEMES[theme];

  /* ---------- period controls ---------- */
  const [period, setPeriod] = useState("7d");
  const [customDraft, setCustomDraft] = useState(() => {
    const iso = (d) => d.toISOString().slice(0, 10);
    const to = new Date();
    return { from: iso(new Date(Date.now() - 6 * 86400000)), to: iso(to) };
  });
  const [customApplied, setCustomApplied] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [tick, setTick] = useState(0);

  const rangeParams = useMemo(() => {
    if (period === "custom") {
      return customApplied
        ? { period: "custom", from: customApplied.from, to: customApplied.to }
        : null;
    }
    return { period };
  }, [period, customApplied]);

  const rangeKey = JSON.stringify(rangeParams);

  /* ---------- data ---------- */
  const [dash, setDash] = useState(null);
  const [history, setHistory] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [queryKeys, setQueryKeys] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const [live, setLive] = useState(null);

  const [pagesSort, setPagesSort] = useState("views");
  const [pages, setPages] = useState(null);

  const [sourceTab, setSourceTab] = useState("referrers");
  const [selectedKey, setSelectedKey] = useState("");
  const [keyValues, setKeyValues] = useState(null);

  const [listTab, setListTab] = useState("visitors");
  const [visitorFilters, setVisitorFilters] = useState({ q: "", ref: "", device: "", returning: "" });
  const [sessionFilters, setSessionFilters] = useState({ status: "", ref: "" });
  const [listPage, setListPage] = useState(1);
  const [list, setList] = useState({ loading: true, data: [], pagination: null, error: "" });

  const [pageDrawer, setPageDrawer] = useState(null);
  const [journeyId, setJourneyId] = useState(null);

  const debouncedVisitorFilters = useDebounced(visitorFilters);

  const request = useCallback(
    async (path, params = {}, signal) => {
      if (!token) throw new Error("Admin authentication token is missing");

      const qs = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          qs.set(key, String(value));
        }
      });

      const query = qs.toString();
      const response = await fetch(`${API}${path}${query ? `?${query}` : ""}`, {
        signal,
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      let body = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      if (!response.ok || body?.success === false) {
        throw new Error(body?.message || `Request failed (${response.status})`);
      }

      return body;
    },
    [token]
  );

  /* ---------- main load ---------- */
  // Same range as last load = background refresh, no skeletons.
  const loadedKey = useRef(null);

  useEffect(() => {
    if (!rangeParams) return undefined;

    const controller = new AbortController();
    const silent = loadedKey.current === rangeKey;

    if (!silent) setLoading(true);
    setError("");

    // Secondary panels must never break the dashboard.
    const optional = (promise) =>
      promise.then((b) => b.data).catch((e) => {
        if (e.name === "AbortError") throw e;
        return null;
      });

    Promise.all([
      request("/dashboard", rangeParams, controller.signal).then((b) => b.data),
      optional(request("/live-history", rangeParams, controller.signal)),
      optional(request("/heatmap", rangeParams, controller.signal)),
      optional(request("/query-params", rangeParams, controller.signal)),
    ])
      .then(([dashboard, hist, heat, keys]) => {
        setDash(dashboard);
        setHistory(hist);
        setHeatmap(heat);
        setQueryKeys(keys);
        setUpdatedAt(new Date());
        loadedKey.current = rangeKey;
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey, tick, request]);

  /* ---------- live poll (10s, only while tab visible) ---------- */
  useEffect(() => {
    let controller = new AbortController();

    const poll = () => {
      if (document.visibilityState !== "visible") return;
      controller.abort();
      controller = new AbortController();

      request("/live", {}, controller.signal)
        .then((b) => setLive(b.data))
        .catch(() => {});
    };

    poll();
    const timer = setInterval(poll, 10000);

    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [request]);

  /* ---------- auto refresh (60s) ---------- */
  useEffect(() => {
    if (!autoRefresh) return undefined;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") setTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  /* ---------- top pages (sortable) ---------- */
  useEffect(() => {
    if (!rangeParams) return undefined;
    const controller = new AbortController();

    request("/pages", { ...rangeParams, sort: pagesSort, limit: 30 }, controller.signal)
      .then((b) => setPages(b.data.data))
      .catch((e) => e.name !== "AbortError" && setPages([]));

    return () => controller.abort();
  }, [rangeKey, pagesSort, tick, request]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- query param explorer ---------- */
  useEffect(() => {
    if (!rangeParams || !selectedKey) {
      setKeyValues(null);
      return undefined;
    }

    const controller = new AbortController();

    request("/query-params", { ...rangeParams, key: selectedKey }, controller.signal)
      .then((b) => setKeyValues(b.data.data))
      .catch((e) => e.name !== "AbortError" && setKeyValues([]));

    return () => controller.abort();
  }, [rangeKey, selectedKey, request]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- visitors / sessions list ---------- */
  useEffect(() => {
    setListPage(1);
  }, [rangeKey, listTab, debouncedVisitorFilters, sessionFilters]);

  useEffect(() => {
    if (!rangeParams) return undefined;
    const controller = new AbortController();

    setList((l) => ({ ...l, loading: true, error: "" }));

    const path = listTab === "visitors" ? "/visitors" : "/sessions";
    const filters = listTab === "visitors" ? debouncedVisitorFilters : sessionFilters;

    request(path, { ...rangeParams, ...filters, page: listPage, limit: 15 }, controller.signal)
      .then((b) =>
        setList({ loading: false, data: b.data, pagination: b.pagination, error: "" })
      )
      .catch((e) => {
        if (e.name !== "AbortError") {
          setList({ loading: false, data: [], pagination: null, error: e.message });
        }
      });

    return () => controller.abort();
  }, [rangeKey, listTab, debouncedVisitorFilters, sessionFilters, listPage, tick, request]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---------- derived ---------- */
  const overview = dash?.overview;
  const current = overview?.current;
  const change = overview?.changePercent || {};

  const kpis = current
    ? [
        { k: "uniqueVisitors", label: "Unique visitors", value: num(current.uniqueVisitors) },
        { k: "pageViews", label: "Page views", value: num(current.pageViews) },
        { k: "sessions", label: "Sessions", value: num(current.sessions) },
        { k: "newVisitors", label: "New visitors", value: num(current.newVisitors) },
        { k: "returningVisitors", label: "Returning visitors", value: num(current.returningVisitors) },
        { k: "pagesPerSession", label: "Pages / session", value: dec(current.pagesPerSession, 2) },
        { k: "avgSessionDurationSeconds", label: "Avg session", value: dur(current.avgSessionDurationSeconds) },
        { k: "bounceRate", label: "Bounce rate", value: pct(current.bounceRate), invert: true, hint: "Single-page sessions with almost no engagement" },
        { k: "avgScrollPercentage", label: "Avg scroll depth", value: pct(current.avgScrollPercentage) },
        { k: "avgEngagementSeconds", label: "Avg time on page", value: dur(current.avgEngagementSeconds), hint: "Active time only" },
        { k: "scrollCompletionRate", label: "Read to 90%", value: pct(current.scrollCompletionRate) },
        { k: "events", label: "Conversions & clicks", value: num(current.events) },
      ]
    : [];

  const periodLabel =
    period === "custom" && customApplied
      ? `${customApplied.from} → ${customApplied.to}`
      : PERIODS.find((p) => p.id === period)?.label;

  const sourceRows = {
    referrers: dash?.sources?.referrers,
    utmSource: dash?.sources?.utmSources,
    utmMedium: dash?.sources?.utmMediums,
    utmCampaign: dash?.sources?.utmCampaigns,
  }[sourceTab]?.map((r) => ({ label: r.label, value: r.count }));

  const applyCustom = () => {
    if (!customDraft.from || !customDraft.to || customDraft.from > customDraft.to) {
      setError("Choose a valid custom date range");
      return;
    }
    setError("");
    setCustomApplied({ ...customDraft });
  };

  const eventCount = (row, type) => row.events?.[type] || 0;

  return (
    <div className="wa-root mt-16 px-3 pb-16 pt-6 sm:px-6" style={cssVars(colors)}>
      <style>{STYLES}</style>

      <div className="mx-auto max-w-[1500px] space-y-5">
        {/* ============ HEADER ============ */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Website Analytics</h1>
            <p className="wa-muted mt-1 text-sm">
              {periodLabel} · times in IST
              {updatedAt && ` · updated ${updatedAt.toLocaleTimeString("en-IN")}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="wa-muted flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ accentColor: "var(--wa-primary)" }}
              />
              Auto refresh
            </label>
            <button className="wa-btn is-active" onClick={() => setTick((t) => t + 1)}>
              Refresh
            </button>
          </div>
        </header>

        {/* ============ PERIOD PICKER ============ */}
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`wa-btn ${period === p.id ? "is-active" : ""}`}
                onClick={() => setPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {period === "custom" && (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="text-xs">
                <span className="wa-muted mb-1 block">From</span>
                <input
                  type="date"
                  className="wa-input"
                  value={customDraft.from}
                  max={customDraft.to}
                  onChange={(e) => setCustomDraft((d) => ({ ...d, from: e.target.value }))}
                />
              </label>
              <label className="text-xs">
                <span className="wa-muted mb-1 block">To</span>
                <input
                  type="date"
                  className="wa-input"
                  value={customDraft.to}
                  min={customDraft.from}
                  max={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setCustomDraft((d) => ({ ...d, to: e.target.value }))}
                />
              </label>
              <button className="wa-btn is-active" onClick={applyCustom}>
                Apply
              </button>
            </div>
          )}
        </Card>

        {error && (
          <div
            className="wa-card p-4 text-sm font-semibold"
            style={{ color: "var(--wa-bad)" }}
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ============ LIVE ============ */}
        <Card
          title="Live right now"
          subtitle="Active in the last minute · refreshes every 10 seconds"
          right={
            <span className="wa-pill">
              <span className="wa-dot wa-live-dot" />
              {live ? num(live.activeSessions) : "–"} active
            </span>
          }
        >
          {!live ? (
            <Skeleton className="h-40" />
          ) : (
            <div className="grid gap-5 lg:grid-cols-3">
              <div>
                <div className="grid grid-cols-2 gap-3">
                  <Stat label="Active users" value={num(live.activeSessions)} />
                  <Stat label="Unique visitors" value={num(live.uniqueActiveVisitors)} />
                  <Stat label="Active pages" value={num(live.activePages)} />
                  <Stat
                    label="Peak today"
                    value={live.peakToday ? num(live.peakToday.activeSessions) : "–"}
                  />
                </div>
                <h3 className="wa-muted mb-2 mt-4 text-xs font-bold uppercase">
                  Users per page
                </h3>
                <BarList
                  items={live.pages?.slice(0, 6).map((p) => ({
                    label: p.page,
                    value: p.activeSessions,
                  }))}
                />
              </div>

              <div>
                <h3 className="wa-muted mb-2 text-xs font-bold uppercase">Last hour</h3>
                <LiveAreaChart
                  data={live.lastHour}
                  colors={colors}
                  xKey="minute"
                  granularity="5 minutes"
                />
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <h4 className="wa-muted mb-1 text-xs font-bold uppercase">Devices</h4>
                    {Object.entries(live.devices || {}).map(([k, v]) => (
                      <p key={k} className="flex justify-between capitalize">
                        <span>{k}</span>
                        <b>{v}</b>
                      </p>
                    ))}
                  </div>
                  <div>
                    <h4 className="wa-muted mb-1 text-xs font-bold uppercase">Referrals</h4>
                    {Object.entries(live.referrals || {}).slice(0, 5).map(([k, v]) => (
                      <p key={k} className="flex justify-between">
                        <span>{k}</span>
                        <b>{v}</b>
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="wa-muted mb-2 text-xs font-bold uppercase">
                  Active sessions
                </h3>
                <div className="max-h-72 overflow-y-auto">
                  <DataTable
                    empty="Nobody is online right now"
                    rows={live.sessions?.slice(0, 40)}
                    rowKey={(s) => s.sessionId}
                    onRowClick={(s) => setJourneyId(s.visitorId)}
                    columns={[
                      { key: "page", label: "Page", render: (s) => s.page },
                      { key: "dev", label: "Device", render: (s) => s.device?.type || "-" },
                      { key: "c", label: "Geo", render: (s) => s.country || "-" },
                      { key: "r", label: "Ref", render: (s) => s.referralCode || "-" },
                      {
                        key: "t",
                        label: "On site",
                        num: true,
                        render: (s) => (s.startedAt ? ago(s.startedAt).replace(" ago", "") : "-"),
                      },
                    ]}
                  />
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* ============ KPIs ============ */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {loading && !current
            ? Array.from({ length: 12 }, (_, i) => <Skeleton key={i} className="h-28" />)
            : kpis.map((kpi) => (
                <Kpi
                  key={kpi.k}
                  label={kpi.label}
                  value={kpi.value}
                  change={change[kpi.k]}
                  invert={kpi.invert}
                  hint={kpi.hint}
                />
              ))}
        </div>

        {/* ============ TRAFFIC ============ */}
        <div className="grid gap-4 xl:grid-cols-3">
          <Card
            className="xl:col-span-2"
            title="Traffic over time"
            subtitle={dash ? `Grouped by ${dash.timeline.granularity}` : ""}
          >
            {loading && !dash ? <Skeleton /> : <TrafficChart timeline={dash?.timeline} colors={colors} />}
          </Card>

          <Card title="New vs returning visitors">
            {loading && !dash ? <Skeleton /> : <NewReturningChart timeline={dash?.timeline} colors={colors} />}
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card
            title="Concurrent users"
            subtitle="Average and peak simultaneous users"
          >
            <ConcurrentChart history={history} colors={colors} />
          </Card>

          <Card title="When visitors arrive" subtitle="Page views by weekday and hour">
            <Heatmap data={heatmap?.data} colors={colors} />
          </Card>
        </div>

        {/* ============ PAGES ============ */}
        <Card
          title="Routes hit"
          subtitle="Click a route for full details"
          right={<Tabs value={pagesSort} onChange={setPagesSort} options={PAGE_SORTS} />}
        >
          {!pages ? (
            <Skeleton className="h-48" />
          ) : (
            <DataTable
              empty="No page views in this period"
              rows={pages}
              rowKey={(r) => r.page}
              onRowClick={(r) => setPageDrawer(r.page)}
              columns={[
                { key: "page", label: "Route", render: (r) => <b>{r.page}</b> },
                { key: "totalViews", label: "Views", num: true, render: (r) => num(r.totalViews) },
                { key: "uniqueVisitors", label: "Unique", num: true, render: (r) => num(r.uniqueVisitors) },
                { key: "entries", label: "Entries", num: true, render: (r) => num(r.entries) },
                { key: "avgScrollPercentage", label: "Avg scroll", num: true, render: (r) => pct(r.avgScrollPercentage) },
                { key: "avgEngagementSeconds", label: "Avg time", num: true, render: (r) => dur(r.avgEngagementSeconds) },
                { key: "scrollCompletionRate", label: "Read 90%", num: true, render: (r) => pct(r.scrollCompletionRate) },
              ]}
            />
          )}
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Entry pages" subtitle="Where sessions start">
            <DataTable
              empty="No sessions"
              rows={dash?.entryExit?.entryPages}
              rowKey={(r) => r.page}
              columns={[
                { key: "page", label: "Route", render: (r) => <b>{r.page}</b> },
                { key: "sessions", label: "Sessions", num: true, render: (r) => num(r.sessions) },
                { key: "bounceRate", label: "Bounce", num: true, render: (r) => pct(r.bounceRate) },
                { key: "avg", label: "Avg session", num: true, render: (r) => dur(r.avgSessionDurationSeconds) },
              ]}
            />
          </Card>
          <Card title="Exit pages" subtitle="Last page before leaving">
            <DataTable
              empty="No ended sessions yet"
              rows={dash?.entryExit?.exitPages}
              rowKey={(r) => r.page}
              columns={[
                { key: "page", label: "Route", render: (r) => <b>{r.page}</b> },
                { key: "exits", label: "Exits", num: true, render: (r) => num(r.exits) },
              ]}
            />
          </Card>
        </div>

        {/* ============ ACQUISITION ============ */}
        <Card
          title="Referral codes (?ref=)"
          subtitle="Sessions grouped by the ref code they landed with"
        >
          <DataTable
            empty="No referral traffic"
            rows={dash?.referrals?.data}
            rowKey={(r) => r.referralCode}
            columns={[
              { key: "referralCode", label: "Code", render: (r) => <span className="wa-pill">{r.referralCode}</span> },
              { key: "sessions", label: "Sessions", num: true, render: (r) => num(r.sessions) },
              { key: "uniqueVisitors", label: "Visitors", num: true, render: (r) => num(r.uniqueVisitors) },
              { key: "newVisitors", label: "New", num: true, render: (r) => num(r.newVisitors) },
              { key: "pageViews", label: "Page views", num: true, render: (r) => num(r.pageViews) },
              { key: "bounceRate", label: "Bounce", num: true, render: (r) => pct(r.bounceRate) },
              { key: "buy", label: "Buy now", num: true, render: (r) => num(eventCount(r, "BUY_NOW")) },
              { key: "chk", label: "Checkout", num: true, render: (r) => num(eventCount(r, "CHECKOUT_STARTED")) },
              { key: "pay", label: "Paid", num: true, render: (r) => num(eventCount(r, "PAYMENT_SUCCESS")) },
            ]}
          />
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card
            title="Traffic sources"
            right={
              <Tabs
                value={sourceTab}
                onChange={setSourceTab}
                options={[
                  { id: "referrers", label: "Websites" },
                  { id: "utmSource", label: "UTM source" },
                  { id: "utmMedium", label: "UTM medium" },
                  { id: "utmCampaign", label: "UTM campaign" },
                ]}
              />
            }
          >
            <BarList items={sourceRows} />
          </Card>

          <Card
            title="URL parameter explorer"
            subtitle="Every query param seen on your routes"
          >
            {!queryKeys?.data?.length ? (
              <Empty text="No query parameters recorded" />
            ) : (
              <>
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {queryKeys.data.map((q) => (
                    <button
                      key={q.key}
                      className={`wa-btn ${selectedKey === q.key ? "is-active" : ""}`}
                      onClick={() => setSelectedKey(selectedKey === q.key ? "" : q.key)}
                    >
                      {q.key} · {num(q.total)}
                    </button>
                  ))}
                </div>
                {selectedKey ? (
                  <DataTable
                    empty="No values"
                    rows={keyValues}
                    rowKey={(r) => r.value}
                    columns={[
                      { key: "value", label: `${selectedKey} =`, render: (r) => <b>{r.value}</b> },
                      { key: "pageViews", label: "Page views", num: true, render: (r) => num(r.pageViews) },
                      { key: "uniqueVisitors", label: "Visitors", num: true, render: (r) => num(r.uniqueVisitors) },
                    ]}
                  />
                ) : (
                  <BarList
                    items={queryKeys.data.map((q) => ({
                      label: `${q.key}  (${q.topValues
                        .slice(0, 3)
                        .map((v) => v.value)
                        .join(", ")})`,
                      value: q.total,
                    }))}
                  />
                )}
              </>
            )}
          </Card>
        </div>

        {/* ============ AUDIENCE ============ */}
        <div className="grid gap-4 lg:grid-cols-3">
          <Card title="Device type">
            <Donut data={dash?.devices?.devices} colors={colors} />
          </Card>
          <Card title="Browsers">
            <BarList
              items={dash?.devices?.browsers?.map((b) => ({ label: b.name, value: b.sessions }))}
            />
          </Card>
          <Card title="Operating systems">
            <BarList
              items={dash?.devices?.operatingSystems?.map((b) => ({ label: b.name, value: b.sessions }))}
            />
          </Card>
          <Card title="Countries" subtitle="Needs a country header from your host/CDN">
            <BarList
              items={dash?.geo?.data?.map((c) => ({ label: c.country, value: c.sessions }))}
            />
          </Card>
          <Card title="Languages">
            <BarList
              items={dash?.devices?.languages?.map((b) => ({ label: b.name, value: b.sessions }))}
            />
          </Card>
          <Card title="Top event pages">
            <BarList
              items={dash?.events?.topPages?.slice(0, 8).map((e) => ({
                label: `${e.eventType} · ${e.page || "-"}`,
                value: e.count,
              }))}
            />
          </Card>
        </div>

        {/* ============ EVENTS ============ */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Card title="Conversions & clicks">
            <DataTable
              empty="No events recorded"
              rows={dash?.events?.totals}
              rowKey={(r) => r.eventType}
              columns={[
                { key: "eventType", label: "Event", render: (r) => <span className="wa-pill">{r.eventType}</span> },
                { key: "events", label: "Total", num: true, render: (r) => num(r.events) },
                { key: "sessions", label: "Sessions", num: true, render: (r) => num(r.sessions) },
                { key: "uniqueVisitors", label: "Visitors", num: true, render: (r) => num(r.uniqueVisitors) },
              ]}
            />
          </Card>
          <Card title="Events over time">
            <EventsChart
              timeline={dash?.events?.timeline}
              granularity={dash?.events?.granularity}
              colors={colors}
            />
          </Card>
        </div>

        {/* ============ VISITORS / SESSIONS ============ */}
        <Card
          title="Every visitor & session"
          subtitle="Click a row to see the full journey"
          right={
            <Tabs
              value={listTab}
              onChange={setListTab}
              options={[
                { id: "visitors", label: "Visitors" },
                { id: "sessions", label: "Sessions" },
              ]}
            />
          }
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {listTab === "visitors" ? (
              <>
                <input
                  className="wa-input"
                  placeholder="Visitor ID starts with…"
                  value={visitorFilters.q}
                  onChange={(e) => setVisitorFilters((f) => ({ ...f, q: e.target.value }))}
                />
                <input
                  className="wa-input w-32"
                  placeholder="Ref code"
                  value={visitorFilters.ref}
                  onChange={(e) => setVisitorFilters((f) => ({ ...f, ref: e.target.value }))}
                />
                <select
                  className="wa-input"
                  value={visitorFilters.device}
                  onChange={(e) => setVisitorFilters((f) => ({ ...f, device: e.target.value }))}
                >
                  <option value="">All devices</option>
                  <option value="desktop">Desktop</option>
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                </select>
                <select
                  className="wa-input"
                  value={visitorFilters.returning}
                  onChange={(e) => setVisitorFilters((f) => ({ ...f, returning: e.target.value }))}
                >
                  <option value="">New + returning</option>
                  <option value="false">New only</option>
                  <option value="true">Returning only</option>
                </select>
              </>
            ) : (
              <>
                <select
                  className="wa-input"
                  value={sessionFilters.status}
                  onChange={(e) => setSessionFilters((f) => ({ ...f, status: e.target.value }))}
                >
                  <option value="">All sessions</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ENDED">Ended</option>
                </select>
                <input
                  className="wa-input w-32"
                  placeholder="Ref code"
                  value={sessionFilters.ref}
                  onChange={(e) => setSessionFilters((f) => ({ ...f, ref: e.target.value }))}
                />
              </>
            )}
          </div>

          {list.error && <p style={{ color: "var(--wa-bad)" }}>{list.error}</p>}

          {list.loading && !list.data.length ? (
            <Skeleton className="h-48" />
          ) : listTab === "visitors" ? (
            <DataTable
              empty="No visitors match"
              rows={list.data}
              rowKey={(r) => r.visitorId}
              onRowClick={(r) => setJourneyId(r.visitorId)}
              columns={[
                { key: "id", label: "Visitor", render: (r) => <b>{shortId(r.visitorId)}</b> },
                { key: "first", label: "First seen", render: (r) => dateTime(r.firstSeenAt) },
                { key: "last", label: "Last seen", render: (r) => dateTime(r.lastSeenAt) },
                { key: "sessionCount", label: "Sessions", num: true, render: (r) => num(r.sessionCount) },
                { key: "pageViewCount", label: "Pages", num: true, render: (r) => num(r.pageViewCount) },
                { key: "ref", label: "Ref", render: (r) => r.firstReferralCode || "-" },
                { key: "landing", label: "Landing", render: (r) => r.firstLandingPage || "-" },
                { key: "device", label: "Device", render: (r) => `${r.device?.type || "-"} · ${r.device?.browser || "-"}` },
                { key: "country", label: "Geo", render: (r) => r.country || "-" },
              ]}
            />
          ) : (
            <DataTable
              empty="No sessions match"
              rows={list.data}
              rowKey={(r) => r.sessionId}
              onRowClick={(r) => setJourneyId(r.visitorId)}
              columns={[
                { key: "start", label: "Started", render: (r) => dateTime(r.startedAt) },
                { key: "visitor", label: "Visitor", render: (r) => <b>{shortId(r.visitorId)}</b> },
                {
                  key: "status",
                  label: "Status",
                  render: (r) => (
                    <span className="wa-pill">
                      {r.status === "ACTIVE" ? "Live" : r.isBounce ? "Bounce" : "Ended"}
                    </span>
                  ),
                },
                { key: "landing", label: "Landing", render: (r) => r.landingPage || "-" },
                { key: "exit", label: "Last page", render: (r) => r.exitPage || "-" },
                { key: "pageCount", label: "Pages", num: true, render: (r) => num(r.pageCount) },
                {
                  key: "dur",
                  label: "Duration",
                  num: true,
                  render: (r) =>
                    dur(r.durationSeconds ?? (new Date(r.lastSeenAt) - new Date(r.startedAt)) / 1000),
                },
                { key: "ref", label: "Ref", render: (r) => r.referralCode || "-" },
                { key: "src", label: "Source", render: (r) => r.referrerHost || "Direct" },
                { key: "device", label: "Device", render: (r) => `${r.device?.type || "-"} · ${r.device?.browser || "-"}` },
              ]}
            />
          )}

          <Pagination pagination={list.pagination} onChange={setListPage} />
        </Card>
      </div>

      {pageDrawer && (
        <PageDetailsDrawer
          page={pageDrawer}
          request={request}
          rangeParams={rangeParams}
          colors={colors}
          onClose={() => setPageDrawer(null)}
        />
      )}

      {journeyId && (
        <JourneyDrawer
          visitorId={journeyId}
          request={request}
          onClose={() => setJourneyId(null)}
        />
      )}
    </div>
  );
}
