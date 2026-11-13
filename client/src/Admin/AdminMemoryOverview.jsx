import { useEffect, useState } from "react";
import { AlertTriangle, ArrowUpRight, CalendarClock, CircleDollarSign, CreditCard, Eye, Gift, HardDrive, Heart, Loader2, MessageCircleHeart, Radio, Receipt, ShoppingBag, Ticket, TrendingUp } from "lucide-react";

import { Chip, KPI_TONES, STATUS, bytes, inr } from "./AdminMemoryUi";

/*
  OVERVIEW. The state of the business on one screen: money in (today, week, month), what needs attention, how the last two weeks went,
  what sells, and the pages people look at most. Every number comes from the server; nothing is guessed here.
*/

const KIND = { page: "Pages", upgrade: "Upgrades", addon: "Extra room" };
const short = (d) => new Date(`${d}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

function Stat({ label, value, sub, icon: Icon, tone = "rose", wide }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${wide ? "col-span-2" : ""}`}>
      <div className={`pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full bg-gradient-to-br ${KPI_TONES[tone]} opacity-10 transition group-hover:scale-125`} aria-hidden />
      <div className="flex items-center gap-2.5">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${KPI_TONES[tone]} text-white shadow`}><Icon size={17} /></span>
        <span className="text-xs font-semibold text-slate-500">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900 tabular-nums">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

const Panel = ({ title, hint, right, children, className = "" }) => (
  <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
    <div className="mb-3 flex items-start justify-between gap-2">
      <div><h3 className="text-sm font-bold text-slate-900">{title}</h3>{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>
      {right}
    </div>
    {children}
  </section>
);

/* 14 bars, one per day. The title on each bar is the exact figure; the text under the chart gives the total. */
function Bars({ rows, pick, format, color = "#f43f6e" }) {
  const max = Math.max(1, ...rows.map(pick));
  return (
    <div>
      <div className="flex h-36 items-end gap-1.5" role="img" aria-label={`Last ${rows.length} days: ${rows.map((r) => `${short(r.date)} ${format(pick(r))}`).join(", ")}`}>
        {rows.map((r) => {
          const v = pick(r);
          return (
            <div key={r.date} className="group relative flex h-full flex-1 flex-col justify-end" title={`${short(r.date)}: ${format(v)}`}>
              <div className="rounded-t-md transition group-hover:opacity-80" style={{ height: `${Math.max(v > 0 ? 4 : 1, (v / max) * 100)}%`, background: v > 0 ? color : "#e2e8f0" }} />
            </div>
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-slate-400"><span>{short(rows[0].date)}</span><span>{short(rows[rows.length - 1].date)}</span></div>
    </div>
  );
}

function Meter({ rows, total, label, value }) {
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={label(r)}>
          <div className="mb-1 flex justify-between gap-2 text-xs"><span className="truncate font-semibold text-slate-700">{label(r)}</span><span className="shrink-0 tabular-nums text-slate-500">{value(r)}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400" style={{ width: `${total ? Math.max(3, (r.share / total) * 100) : 0}%` }} /></div>
        </li>
      ))}
    </ul>
  );
}

export default function Overview({ http, run, goTo, openPage }) {
  const [s, setS] = useState(null);
  useEffect(() => { run(() => http.get("/stats")).then((d) => d && setS(d)); }, [http, run]);
  if (!s) return <div className="grid place-items-center py-24 text-slate-400"><Loader2 className="animate-spin" /></div>;

  const week = s.series.slice(-7);
  const rev14 = s.series.reduce((a, r) => a + r.revenue, 0);
  const pages14 = s.series.reduce((a, r) => a + r.pages, 0);
  const alerts = [
    s.failedOrders30d > 0 && { tone: "rose", text: `${s.failedOrders30d} failed payment${s.failedOrders30d === 1 ? "" : "s"} in the last 30 days`, go: "orders" },
    s.unpaidOrders30d > 0 && { tone: "amber", text: `${s.unpaidOrders30d} checkout${s.unpaidOrders30d === 1 ? "" : "s"} started but not paid (30 days)`, go: "orders" },
    s.expiringSoon > 0 && { tone: "amber", text: `${s.expiringSoon} page${s.expiringSoon === 1 ? "" : "s"} end within 7 days`, go: "pages" },
    s.blockedPages > 0 && { tone: "rose", text: `${s.blockedPages} blocked page${s.blockedPages === 1 ? "" : "s"}`, go: "pages" },
  ].filter(Boolean);
  const kindTotal = s.byKind.reduce((a, r) => a + r.revenue, 0);
  const tplMax = Math.max(1, ...s.byTemplate.map((r) => r.pages));
  const gwTotal = s.byGateway.reduce((a, r) => a + r.revenue, 0);

  return (
    <div className="space-y-5">
      {/* money */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-rose-900 p-5 text-white shadow-lg sm:p-6">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-rose-500/20 blur-2xl" aria-hidden />
        <div className="relative grid gap-5 lg:grid-cols-[1.1fr_2fr] lg:items-center">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/60"><CircleDollarSign size={14} /> Total revenue</p>
            <p className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums sm:text-5xl">{inr(s.revenue)}</p>
            <p className="mt-1 text-sm text-white/65">{s.paidOrders} paid order{s.paidOrders === 1 ? "" : "s"} · {s.gumroadRedeemed} Gumroad order{s.gumroadRedeemed === 1 ? "" : "s"} redeemed</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[["Today", s.revenueToday, s.ordersToday], ["Last 7 days", s.revenue7d, s.orders7d], ["Last 30 days", s.revenue30d, s.orders30d]].map(([l, v, n]) => (
              <div key={l} className="rounded-2xl bg-white/10 p-3 backdrop-blur ring-1 ring-white/10">
                <p className="text-[11px] font-semibold text-white/60">{l}</p>
                <p className="mt-0.5 text-lg font-extrabold tabular-nums sm:text-xl">{inr(v)}</p>
                <p className="text-[11px] text-white/55">{n} order{n === 1 ? "" : "s"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* attention */}
      {alerts.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label="Needs attention">
          {alerts.map((a) => (
            <button key={a.text} type="button" onClick={() => goTo(a.go)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition hover:shadow ${a.tone === "rose" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
              <AlertTriangle size={14} /> {a.text} <ArrowUpRight size={13} className="opacity-60" />
            </button>
          ))}
        </div>
      )}

      {/* numbers */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat icon={Heart} tone="rose" label="Pages created" value={s.pages} sub={`${s.pagesToday} today · ${s.pages7d} this week`} />
        <Stat icon={Radio} tone="emerald" label="Live pages" value={s.activePages} sub={`${s.closedPages} closed · ${s.blockedPages} blocked`} />
        <Stat icon={Eye} tone="sky" label="Page views" value={s.totalViews.toLocaleString("en-IN")} sub={`${s.answeredPages} answered · ${s.replies} repl${s.replies === 1 ? "y" : "ies"}`} />
        <Stat icon={Gift} tone="amber" label="Unused credits" value={s.unusedCredits} sub="paid for, page not made yet" />
        <Stat icon={ShoppingBag} tone="indigo" label="Paid orders" value={s.paidOrders} sub={`${s.failedOrders30d} failed · ${s.unpaidOrders30d} unpaid (30d)`} />
        <Stat icon={Ticket} tone="rose" label="Codes redeemed" value={s.codesRedeemed} sub="free pages given" />
        <Stat icon={CalendarClock} tone="amber" label="Ending in 7 days" value={s.expiringSoon} sub="pages about to be deleted" />
        <Stat icon={HardDrive} tone="sky" label="Media storage" value={bytes(s.storageBytes)} sub="photos, videos, voice" />
      </div>

      {/* trends */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Revenue, last 14 days" hint={`${inr(rev14)} from ${s.series.reduce((a, r) => a + r.orders, 0)} paid orders`} right={<TrendingUp size={16} className="text-slate-300" />}>
          <Bars rows={s.series} pick={(r) => r.revenue} format={inr} />
        </Panel>
        <Panel title="New pages, last 14 days" hint={`${pages14} created · ${week.reduce((a, r) => a + r.pages, 0)} in the last 7`} right={<Heart size={16} className="text-slate-300" />}>
          <Bars rows={s.series} pick={(r) => r.pages} format={(v) => `${v} page${v === 1 ? "" : "s"}`} color="#6366f1" />
        </Panel>
      </div>

      {/* what sells */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Most used templates" hint="by pages created">
          {s.byTemplate.length === 0 ? <Empty /> : (
            <Meter rows={s.byTemplate.map((r) => ({ ...r, share: r.pages }))} total={tplMax} label={(r) => r.name} value={(r) => `${r.pages} · ${r.views} views`} />
          )}
        </Panel>
        <Panel title="What people pay for" hint="share of revenue">
          {s.byKind.length === 0 ? <Empty /> : (
            <Meter rows={s.byKind.map((r) => ({ ...r, share: r.revenue }))} total={kindTotal} label={(r) => KIND[r.kind] || r.kind} value={(r) => `${inr(r.revenue)} · ${r.orders}`} />
          )}
          {s.byGateway.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400"><CreditCard size={12} /> By gateway</p>
              <div className="flex flex-wrap gap-1.5">{s.byGateway.map((g) => <Chip key={g.gateway} className="bg-slate-50 text-slate-700 ring-slate-200">{g.gateway} · {inr(g.revenue)}{gwTotal ? ` (${Math.round((g.revenue / gwTotal) * 100)}%)` : ""}</Chip>)}</div>
            </div>
          )}
        </Panel>
        <Panel title="Most viewed pages" hint="all time" right={<MessageCircleHeart size={16} className="text-slate-300" />}>
          {s.topPages.length === 0 ? <Empty /> : (
            <ol className="divide-y divide-slate-100">
              {s.topPages.map((p, i) => (
                <li key={p.id}>
                  <button type="button" onClick={() => openPage(p.id, "activity")} className="flex w-full items-center gap-3 py-2 text-left transition hover:bg-slate-50">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-rose-50 text-[11px] font-bold text-rose-600">{i + 1}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-800">{p.title}</span><span className="block truncate text-xs text-slate-500">for {p.recipientName}</span></span>
                    {p.status !== "active" && <Chip className={STATUS[p.status]}>{p.status}</Chip>}
                    <span className="shrink-0 text-xs font-bold tabular-nums text-slate-600">{p.views} <Eye size={11} className="inline" /></span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>

      <button type="button" onClick={() => goTo("orders")} className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:underline"><Receipt size={14} /> See every order <ArrowUpRight size={13} /></button>
    </div>
  );
}

const Empty = () => <p className="py-6 text-center text-sm text-slate-400">Nothing yet.</p>;
