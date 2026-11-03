import { useState } from "react";
import toast from "react-hot-toast";
import { Download, Gift, Wallet } from "lucide-react";

import { Badge, Button, Card, EmptyState, Spinner, cx, inputClass } from "../ui";
import { MUTED, Pager, Person, SearchBox, StatusBadge, Table, Td, api, errMsg, fmtDateTime, rupees2, useDebounced, useList } from "./shared";

const STATUSES = [["", "All statuses"], ["paid", "Paid (active)"], ["in_match", "In a match"], ["consumed", "All matches used"], ["cancelled", "Cancelled / refunded"], ["pending_payment", "Awaiting payment"], ["expired", "Abandoned"]];

function Summary({ label, value, sub, tone }) {
  return (
    <Card className="p-4">
      <p className={cx("text-xs font-semibold uppercase tracking-wide", MUTED)}>{label}</p>
      <p className={cx("mt-1.5 text-xl font-bold tabular-nums", tone || "text-[#29201b] dk:text-[#fff7ed]")}>{value}</p>
      {sub && <p className={cx("mt-0.5 text-xs", MUTED)}>{sub}</p>}
    </Card>
  );
}

const Money = ({ paise, className, negative }) => (
  <span className={cx("tabular-nums", negative && paise > 0 && "text-rose-600 dk:text-rose-300", className)}>{negative && paise > 0 ? "−" : ""}{rupees2(paise)}</span>
);

export default function PaymentsTab() {
  const [f, setF] = useState({ status: "", gateway: "", complimentary: "", from: "", to: "", q: "" });
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const dq = useDebounced(f.q);
  const params = { ...f, q: dq, page, pageSize: 25 };
  const [{ loading, data, error }] = useList("/payments", params);

  const set = (k) => (e) => { setPage(1); setF((x) => ({ ...x, [k]: e.target.value })); };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const filters = { ...params };
      delete filters.page; delete filters.pageSize;           // export everything that matches, not one page
      const res = await api.get("/payments", { params: { ...filters, format: "csv" }, responseType: "blob" });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `arena-payments-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast.success("Export downloaded");
    } catch (e) { toast.error(errMsg(e)); } finally { setExporting(false); }
  };

  const T = data?.totals;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Summary label="Entries" value={T?.entries ?? "…"} sub={T ? `${T.complimentaryEntries} complimentary` : undefined} />
        <Summary label="Collected" value={T ? rupees2(T.grossPaidPaise) : "…"} />
        <Summary label="Discounts given" value={T ? rupees2(T.discountsPaise) : "…"} />
        <Summary label="Refunded" value={T ? rupees2(T.refundedPaise) : "…"} tone="text-rose-600 dk:text-rose-300" />
        <Summary label="Fees kept" value={T ? rupees2(T.cancellationFeesPaise) : "…"} />
        <Summary label="Net revenue" value={T ? rupees2(T.netPaise) : "…"} tone="text-emerald-700 dk:text-emerald-300" sub="collected − refunds" />
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <SearchBox value={f.q} onChange={(v) => { setPage(1); setF((x) => ({ ...x, q: v })); }} placeholder="Member, order ID, payment ID, coupon" className="sm:col-span-2" />
          <select aria-label="Status" value={f.status} onChange={set("status")} className={inputClass(false)}>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select aria-label="Gateway" value={f.gateway} onChange={set("gateway")} className={inputClass(false)}>
            <option value="">All gateways</option><option value="cashfree">Cashfree</option><option value="razorpay">Razorpay</option><option value="admin">Admin (free)</option>
          </select>
          <label className="flex items-center gap-2 text-xs text-stone-500 dk:text-[#b9a79c]">From<input type="date" value={f.from} onChange={set("from")} className={inputClass(false)} /></label>
          <label className="flex items-center gap-2 text-xs text-stone-500 dk:text-[#b9a79c]">To<input type="date" value={f.to} onChange={set("to")} className={inputClass(false)} /></label>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-sm">
            {[["", "Paid + free"], ["false", "Paid only"], ["true", "Free (admin-granted) only"]].map(([v, l]) => (
              <button key={v} onClick={() => { setPage(1); setF((x) => ({ ...x, complimentary: v })); }} className={cx("rounded-full px-3 py-1 text-xs font-semibold ring-1", f.complimentary === v ? "bg-orange-600 text-white ring-orange-600" : "bg-white text-stone-700 ring-[#f0ded0] dk:bg-[#241b15] dk:text-[#ead9cc] dk:ring-[#443127]")}>{l}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => { setPage(1); setF({ status: "", gateway: "", complimentary: "", from: "", to: "", q: "" }); }}>Reset filters</Button>
            <Button size="sm" onClick={exportCsv} loading={exporting}><Download className="h-4 w-4" /> Export CSV</Button>
          </div>
        </div>
      </Card>

      {loading && !data ? <Spinner /> : error ? <EmptyState title="Couldn't load payments">{error}</EmptyState> : !data.items.length ? (
        <EmptyState icon={Wallet} title="No payments match these filters" />
      ) : (
        <>
          <Table dense head={["Date", "Member", "Order & payment ID", "Gateway", { label: "List", right: true }, { label: "Discount", right: true }, { label: "Paid", right: true }, "Matches", "Status", { label: "Fee kept", right: true }, { label: "Refunded", right: true }]}>
            {data.items.map((p) => (
              <tr key={p.id} className={p.complimentary ? "bg-amber-50/40 dk:bg-amber-500/5" : undefined}>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(p.paidAt || p.createdAt)}</Td>
                <Td><Person p={p.member} /></Td>
                <Td className="min-w-[13rem]">
                  {p.orderId ? <p className="break-all font-mono text-[11px]">{p.orderId}</p> : <span className={MUTED}>—</span>}
                  {p.paymentId && <p className={cx("break-all font-mono text-[11px]", MUTED)}>pay: {p.paymentId}</p>}
                  {p.refundId && <p className={cx("break-all font-mono text-[11px]", MUTED)}>refund: {p.refundId}</p>}
                  {p.coupon && <Badge tone="brand" className="mt-1">coupon {p.coupon}</Badge>}
                </Td>
                <Td>
                  {p.complimentary ? <Badge tone="amber"><Gift className="h-3 w-3" /> free</Badge> : <span className="capitalize">{p.gateway ?? "—"}</span>}
                  {p.complimentary && p.grantedBy && <p className={cx("mt-1 text-[11px]", MUTED)}>by {p.grantedBy}</p>}
                </Td>
                <Td className="text-right"><Money paise={p.listPricePaise} className={p.complimentary ? MUTED : ""} /></Td>
                <Td className="text-right"><Money paise={p.discountPaise} negative /></Td>
                <Td className="text-right font-semibold"><Money paise={p.paidPaise} /></Td>
                <Td className="whitespace-nowrap tabular-nums">{p.matchesUsed} / {p.matchesAllowed}</Td>
                <Td><StatusBadge status={p.status} />{p.cancelledAt && <p className={cx("mt-1 text-[11px]", MUTED)}>{fmtDateTime(p.cancelledAt)}</p>}</Td>
                <Td className="text-right">{p.status === "cancelled" ? <><Money paise={p.feePaise} /><p className={cx("text-[11px]", MUTED)}>{p.cancellationFeePercent}%</p></> : <span className={MUTED}>—</span>}</Td>
                <Td className="text-right">{p.status === "cancelled" ? <Money paise={p.refundPaise} negative /> : <span className={MUTED}>—</span>}</Td>
              </tr>
            ))}
          </Table>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      )}
      <p className={cx("text-xs", MUTED)}>Amounts are in INR. “Collected” counts paid, in-match, used-up and cancelled entries; pending and abandoned checkouts are excluded. Free (admin-granted) entries show ₹0.00 and can never be refunded.</p>
    </div>
  );
}
