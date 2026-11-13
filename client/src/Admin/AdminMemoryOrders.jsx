import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, Clock3, Copy, Download, ExternalLink, Eye, Inbox, Loader2, PackagePlus, RefreshCw, Search, Sparkles, Trash2, Heart, XCircle } from "lucide-react";

import { ActionMenu, Btn, Chip, Pager, inputCls, inr, when } from "./AdminMemoryUi";

/*
  ORDERS. Every payment, newest first, with what was bought, who paid, and the gateway ids you need when a customer writes in.
  Search by customer (name, email, phone) or by a gateway order / payment id. Filter by status, what was bought, gateway and dates.
*/

const KIND = {
  page: { label: "Page", icon: Heart, cls: "bg-rose-50 text-rose-600" },
  upgrade: { label: "Upgrade", icon: Sparkles, cls: "bg-amber-50 text-amber-600" },
  addon: { label: "Extra room", icon: PackagePlus, cls: "bg-indigo-50 text-indigo-600" },
};
const STATE = {
  paid: { label: "Paid", icon: CheckCircle2, cls: "text-emerald-600" },
  created: { label: "Not paid", icon: Clock3, cls: "text-amber-600" },
  failed: { label: "Failed", icon: XCircle, cls: "text-rose-600" },
};
const copy = (text, what) => { navigator.clipboard?.writeText(text); toast.success(`${what} copied`); };
const csv = (rows) => {
  const cell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const head = ["Created", "Paid at", "Status", "Customer", "Email", "Phone", "Bought", "Template", "Look", "Page", "Amount (INR)", "Gateway", "Gateway order", "Payment id"];
  const body = rows.map((o) => [o.createdAt, o.paidAt || "", o.status, o.user?.name || "", o.user?.email || "", o.user?.phone || "", KIND[o.kind]?.label || o.kind, o.template, o.theme, o.page?.title || "", o.amount, o.gateway, o.gatewayOrderId, o.gatewayPaymentId || ""]);
  return [head, ...body].map((r) => r.map(cell).join(",")).join("\n");
};

function Tally({ label, count, amount, tone, icon: Icon, active, onClick }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active}
      className={`rounded-2xl border bg-white p-3.5 text-left shadow-sm transition hover:shadow-md ${active ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"}`}>
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Icon size={15} className={tone} /> {label}</div>
      <div className="mt-1.5 text-xl font-extrabold tabular-nums text-slate-900">{count}</div>
      <div className="text-xs tabular-nums text-slate-500">{inr(amount)}</div>
    </button>
  );
}

export default function Orders({ http, run, setDialog, openPage }) {
  const [f, setF] = useState({ q: "", status: "", kind: "", gateway: "", from: "", to: "", page: 1 });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (patch) => setF((x) => ({ ...x, ...patch, page: patch.page ?? 1 }));

  const load = useCallback(async () => {
    setLoading(true);
    const d = await run(() => http.get("/orders", { params: { ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "")), limit: 20 } }));
    if (d) setData(d);
    setLoading(false);
  }, [http, run, f]);
  useEffect(() => { const t = setTimeout(load, f.q ? 300 : 0); return () => clearTimeout(t); }, [load, f.q]);

  const remove = (o) => setDialog({
    kind: "confirm", title: "Delete this order record?",
    text: o.status === "paid" ? `This paid ${o.gateway} order (${inr(o.amount)}, ${o.gatewayOrderId}) is removed from your records only. The customer keeps what it gave them.` : `This ${o.status} ${o.gateway} order (${o.gatewayOrderId}) is removed from your records.`,
    label: "Delete order", onSubmit: async () => { if (await run(() => http.delete(`/orders/${o.id}`), "Order deleted")) load(); },
  });

  const exportCsv = () => {
    const rows = data?.items || [];
    if (!rows.length) return toast.info("Nothing to export");
    const url = URL.createObjectURL(new Blob([csv(rows)], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `memories-orders-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click(); URL.revokeObjectURL(url);
  };

  const sm = data?.summary;
  const filtered = Object.entries(f).some(([k, v]) => k !== "page" && v);

  return (
    <div className="space-y-4">
      {/* totals for exactly what the filters show */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tally label="All shown" count={data?.total ?? "…"} amount={(sm?.paidAmount || 0) + (sm?.pendingAmount || 0) + (sm?.failedAmount || 0)} icon={Inbox} tone="text-slate-500" active={!f.status} onClick={() => set({ status: "" })} />
        <Tally label="Paid" count={sm?.paid ?? "…"} amount={sm?.paidAmount || 0} icon={CheckCircle2} tone="text-emerald-600" active={f.status === "paid"} onClick={() => set({ status: f.status === "paid" ? "" : "paid" })} />
        <Tally label="Not paid" count={sm?.pending ?? "…"} amount={sm?.pendingAmount || 0} icon={Clock3} tone="text-amber-600" active={f.status === "created"} onClick={() => set({ status: f.status === "created" ? "" : "created" })} />
        <Tally label="Failed" count={sm?.failed ?? "…"} amount={sm?.failedAmount || 0} icon={XCircle} tone="text-rose-600" active={f.status === "failed"} onClick={() => set({ status: f.status === "failed" ? "" : "failed" })} />
      </div>

      {/* filters */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input className={`${inputCls} pl-8`} placeholder="Search customer, email, phone, order or payment id…" value={f.q} onChange={(e) => set({ q: e.target.value })} aria-label="Search orders" />
        </div>
        <select className={`${inputCls} !w-auto`} value={f.kind} onChange={(e) => set({ kind: e.target.value })} aria-label="What was bought">
          <option value="">Everything</option><option value="page">Pages</option><option value="upgrade">Upgrades</option><option value="addon">Extra room</option>
        </select>
        <select className={`${inputCls} !w-auto`} value={f.gateway} onChange={(e) => set({ gateway: e.target.value })} aria-label="Gateway">
          <option value="">All gateways</option>{["razorpay", "cashfree", "payu", "mock"].map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-slate-500">from <input type="date" className={`${inputCls} !w-auto`} value={f.from} onChange={(e) => set({ from: e.target.value })} /></label>
        <label className="flex items-center gap-1.5 text-xs text-slate-500">to <input type="date" className={`${inputCls} !w-auto`} value={f.to} onChange={(e) => set({ to: e.target.value })} /></label>
        {filtered && <Btn onClick={() => setF({ q: "", status: "", kind: "", gateway: "", from: "", to: "", page: 1 })}>Clear</Btn>}
        <div className="ml-auto flex gap-2">
          <Btn onClick={exportCsv} title="Download the orders on this page as a spreadsheet"><Download size={12} /> Export</Btn>
          <Btn onClick={load}><RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh</Btn>
        </div>
      </div>

      {/* the orders */}
      {!data ? (
        <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-20 text-slate-400"><Loader2 className="animate-spin" /></div>
      ) : data.items.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/70 py-16 text-center text-slate-400"><Inbox size={30} /><p className="mt-2 text-sm">{filtered ? "No orders match these filters" : "No orders yet"}</p></div>
      ) : (
        <ul className="space-y-2.5">
          {data.items.map((o) => {
            const k = KIND[o.kind] || KIND.page;
            const st = STATE[o.status] || STATE.created;
            return (
              <li key={o.id} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition hover:shadow-md sm:p-4">
                <div className="grid gap-3 lg:grid-cols-[1.25fr_1.3fr_1.5fr_auto] lg:items-center">
                  {/* who */}
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${k.cls}`}><k.icon size={18} /></span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{o.user?.name || "Deleted user"}</p>
                      <p className="truncate text-xs text-slate-500">{o.user?.email || ""}</p>
                      {o.user?.phone && <p className="truncate text-xs text-slate-400">{o.user.phone}</p>}
                    </div>
                  </div>

                  {/* what */}
                  <div className="min-w-0 text-sm">
                    <p className="flex flex-wrap items-center gap-1.5"><span className="font-semibold text-slate-800">{k.label}</span>{o.template && <span className="text-slate-500">· {o.template}</span>}{o.theme && <Chip className="bg-slate-50 text-slate-600 ring-slate-200">{o.theme}</Chip>}</p>
                    {o.upgrade && o.fullPrice > 0 && <p className="text-xs text-slate-500">paid the {inr(o.basePrice)} difference · look costs {inr(o.fullPrice)}</p>}
                    {o.addons.length > 0 && <p className="mt-0.5 flex flex-wrap gap-1">{o.addons.map((a) => <span key={a.name} className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[11px] font-semibold text-indigo-700">{a.name} ×{a.packs}</span>)}</p>}
                    {o.page && <button type="button" onClick={() => openPage(o.page.id, "preview")} className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:underline"><Eye size={11} /> {o.page.title}</button>}
                  </div>

                  {/* money + ids */}
                  <div className="min-w-0 text-xs">
                    <p className="flex items-center gap-2"><span className="text-lg font-extrabold tabular-nums text-slate-900">{inr(o.amount)}</span><span className={`inline-flex items-center gap-1 font-bold ${st.cls}`}><st.icon size={13} /> {st.label}</span><Chip>{o.gateway}</Chip></p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500" title={o.gatewayOrderId}>order {o.gatewayOrderId}</p>
                    <p className="truncate font-mono text-[11px] text-slate-500" title={o.gatewayPaymentId || ""}>{o.gatewayPaymentId ? `payment ${o.gatewayPaymentId}` : o.failureReason ? <span className="text-rose-500">{o.failureReason}</span> : "no payment id yet"}</p>
                  </div>

                  {/* when + menu */}
                  <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                    <div className="text-right text-[11px] text-slate-500"><p>{when(o.createdAt)}</p>{o.paidAt && <p className="text-emerald-600">paid {when(o.paidAt)}</p>}{o.status === "paid" && !o.fulfilled && <p className="font-semibold text-amber-600">delivering…</p>}</div>
                    <ActionMenu label="Order actions" items={[
                      { label: "Copy order id", icon: <Copy size={14} />, onClick: () => copy(o.gatewayOrderId, "Order id") },
                      { label: "Copy payment id", icon: <Copy size={14} />, hidden: !o.gatewayPaymentId, onClick: () => copy(o.gatewayPaymentId, "Payment id") },
                      { label: "Copy customer email", icon: <Copy size={14} />, hidden: !o.user?.email, onClick: () => copy(o.user.email, "Email") },
                      { label: "Preview the page", icon: <ExternalLink size={14} />, hidden: !o.page, onClick: () => openPage(o.page.id, "preview") },
                      { label: "Delete record", icon: <Trash2 size={14} />, tone: "danger", divider: true, onClick: () => remove(o) },
                    ]} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Pager page={data?.page || 1} pages={data?.pages} onPage={(p) => setF((x) => ({ ...x, page: p }))} />
    </div>
  );
}

