import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Download, Gift, RotateCcw, Trash2, Wallet } from "lucide-react";

import { Badge, Button, Card, EmptyState, Modal, Spinner, cx, inputClass } from "../ui";
import { ConfirmModal, MUTED, Pager, Person, SearchBox, StatusBadge, Table, Td, api, errMsg, fmtDateTime, rupees2, useDebounced, useDeleter, useList } from "./shared";

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

const REFUNDABLE = ["paid", "in_match", "consumed", "cancelled"];
const refundedOf = (p) => (p.refundPaise || 0) + (p.refundedPaise || 0);
const refundableOf = (p) => (p.complimentary || !p.paymentId || !REFUNDABLE.includes(p.status) ? 0 : Math.max(0, p.paidPaise - refundedOf(p)));

const Money = ({ paise, className, negative }) => (
  <span className={cx("tabular-nums", negative && paise > 0 && "text-rose-600 dk:text-rose-300", className)}>{negative && paise > 0 ? "−" : ""}{rupees2(paise)}</span>
);

export default function PaymentsTab() {
  const [f, setF] = useState({ status: "", gateway: "", complimentary: "", affiliate: "", from: "", to: "", q: "" });
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const dq = useDebounced(f.q);
  const params = { ...f, q: dq, page, pageSize: 25 };
  const [{ loading, data, error }, reload] = useList("/payments", params);
  const { del, setDel, busy: deleting, run } = useDeleter(reload);

  const [refundsOn, setRefundsOn] = useState(false);
  useEffect(() => { api.get("/settings").then(({ data }) => setRefundsOn(data.data.cancelRefundEnabled !== false)).catch(() => setRefundsOn(false)); }, []);

  const [rf, setRf] = useState(null);       // payment being refunded
  const [amount, setAmount] = useState("");  // rupees, as typed
  const [note, setNote] = useState("");
  const [rfStep, setRfStep] = useState("form"); // form -> confirm
  const [rfBusy, setRfBusy] = useState(false);
  const openRefund = (p) => { setRf(p); setAmount((refundableOf(p) / 100).toFixed(2)); setNote(""); setRfStep("form"); };
  const closeRefund = () => { if (!rfBusy) setRf(null); };
  const amountPaise = Math.round(Number(amount) * 100);
  const maxPaise = rf ? refundableOf(rf) : 0;
  const amountError = !/^\d+(\.\d{1,2})?$/.test(amount.trim()) || amountPaise < 100 ? "Enter an amount of at least ₹1 (max 2 decimals)" : amountPaise > maxPaise ? `Cannot exceed ${rupees2(maxPaise)}` : "";
  const submitRefund = async () => {
    setRfBusy(true);
    try {
      const { data: res } = await api.post(`/payments/${rf.id}/refund`, { amountPaise, paymentId: rf.paymentId, note, confirm: true });
      toast.success(res?.message || "Refund started", { duration: 6000 });
      setRf(null);
      reload();
    } catch (e) { toast.error(errMsg(e), { duration: 7000 }); } finally { setRfBusy(false); }
  };

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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-7">
        <Summary label="Entries" value={T?.entries ?? "…"} sub={T ? `${T.complimentaryEntries} complimentary` : undefined} />
        <Summary label="Collected" value={T ? rupees2(T.grossPaidPaise) : "…"} />
        <Summary label="Discounts given" value={T ? rupees2(T.discountsPaise) : "…"} />
        <Summary label="Refunded" value={T ? rupees2(T.refundedPaise) : "…"} tone="text-rose-600 dk:text-rose-300" />
        <Summary label="Fees kept" value={T ? rupees2(T.cancellationFeesPaise) : "…"} />
        <Summary label="Net revenue" value={T ? rupees2(T.netPaise) : "…"} tone="text-emerald-700 dk:text-emerald-300" sub="collected − refunds" />
        <Summary label="Affiliate commission" value={T ? rupees2(T.affiliateCommissionPaise) : "…"} tone="text-violet-700 dk:text-violet-300" sub={T ? `${T.affiliateEntries} referred · ${rupees2(T.affiliateSalesPaise)} sales` : undefined} />
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
          <SearchBox value={f.q} onChange={(v) => { setPage(1); setF((x) => ({ ...x, q: v })); }} placeholder="Member, order ID, payment ID, coupon" className="sm:col-span-2" />
          <select aria-label="Status" value={f.status} onChange={set("status")} className={inputClass(false)}>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          <select aria-label="Gateway" value={f.gateway} onChange={set("gateway")} className={inputClass(false)}>
            <option value="">All gateways</option><option value="cashfree">Cashfree</option><option value="razorpay">Razorpay</option><option value="admin">Admin (free)</option>
          </select>
          <select aria-label="Affiliate" value={f.affiliate} onChange={set("affiliate")} className={inputClass(false)}>
            <option value="">All sources</option><option value="any">Via affiliate</option><option value="none">Direct (no affiliate)</option>
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
            <Button size="sm" variant="ghost" onClick={() => { setPage(1); setF({ status: "", gateway: "", complimentary: "", affiliate: "", from: "", to: "", q: "" }); }}>Reset filters</Button>
            <Button size="sm" onClick={exportCsv} loading={exporting}><Download className="h-4 w-4" /> Export CSV</Button>
          </div>
        </div>
      </Card>

      {loading && !data ? <Spinner /> : error ? <EmptyState title="Couldn't load payments">{error}</EmptyState> : !data.items.length ? (
        <EmptyState icon={Wallet} title="No payments match these filters" />
      ) : (
        <>
          <Table dense head={["Date", "Member", "Order & payment ID", "Gateway", { label: "List", right: true }, { label: "Discount", right: true }, { label: "Paid", right: true }, "Affiliate", "Matches", "Status", { label: "Fee kept", right: true }, { label: "Refunded", right: true }, ""]}>
            {data.items.map((p) => (
              <tr key={p.id} className={p.complimentary ? "bg-amber-50/40 dk:bg-amber-500/5" : undefined}>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(p.paidAt || p.createdAt)}</Td>
                <Td><Person p={p.member} /></Td>
                <Td className="min-w-[13rem]">
                  {p.orderId ? <p className="break-all font-mono text-[11px]">{p.orderId}</p> : <span className={MUTED}>—</span>}
                  {p.paymentId && <p className={cx("break-all font-mono text-[11px]", MUTED)}>pay: {p.paymentId}</p>}
                  {p.refundId && <p className={cx("break-all font-mono text-[11px]", MUTED)}>refund: {p.refundId}</p>}
                  {p.refunds?.map((r) => <p key={r.refundId || r.at} className={cx("break-all font-mono text-[11px]", MUTED)}>refund {rupees2(r.amountPaise)}: {r.refundId}</p>)}
                  {p.coupon && <Badge tone="brand" className="mt-1">coupon {p.coupon}</Badge>}
                </Td>
                <Td>
                  {p.complimentary ? <Badge tone="amber"><Gift className="h-3 w-3" /> free</Badge> : <span className="capitalize">{p.gateway ?? "—"}</span>}
                  {p.complimentary && p.grantedBy && <p className={cx("mt-1 text-[11px]", MUTED)}>by {p.grantedBy}</p>}
                </Td>
                <Td className="text-right"><Money paise={p.listPricePaise} className={p.complimentary ? MUTED : ""} /></Td>
                <Td className="text-right"><Money paise={p.discountPaise} negative /></Td>
                <Td className="text-right font-semibold"><Money paise={p.paidPaise} /></Td>
                <Td className="whitespace-nowrap">
                  {p.affiliate ? (
                    <>
                      <Badge tone="brand">{p.affiliate.code}</Badge>
                      <p className="mt-1 text-xs font-semibold tabular-nums">{rupees2(p.affiliate.netPaise)}</p>
                      <p className={cx("text-[11px]", MUTED)}>{p.affiliate.type === "percentage" ? `${p.affiliate.value}%` : `${rupees2(p.affiliate.value * 100)} fixed`}{p.affiliate.status === "partially_refunded" || p.affiliate.status === "refunded" ? ` · ${p.affiliate.status.replace("_", " ")}` : ""}</p>
                    </>
                  ) : <span className={MUTED}>—</span>}
                </Td>
                <Td className="whitespace-nowrap tabular-nums">{p.matchesUsed} / {p.matchesAllowed}</Td>
                <Td><StatusBadge status={p.status} />{p.cancelledAt && <p className={cx("mt-1 text-[11px]", MUTED)}>{fmtDateTime(p.cancelledAt)}</p>}</Td>
                <Td className="text-right">{p.status === "cancelled" ? <><Money paise={p.feePaise} /><p className={cx("text-[11px]", MUTED)}>{p.cancellationFeePercent}%</p></> : <span className={MUTED}>—</span>}</Td>
                <Td className="text-right">{refundedOf(p) > 0 ? <Money paise={refundedOf(p)} negative /> : <span className={MUTED}>—</span>}</Td>
                <Td className="whitespace-nowrap text-right">
                  {refundsOn && refundableOf(p) > 0 && <Button size="sm" variant="ghost" className="text-amber-700 hover:bg-amber-50 dk:text-amber-300 dk:hover:bg-amber-500/10" aria-label={`Refund payment ${p.paymentId}`} onClick={() => openRefund(p)}><RotateCcw className="h-3.5 w-3.5" /> Refund</Button>}
                  <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 dk:text-rose-300 dk:hover:bg-rose-500/10" aria-label={`Delete payment ${p.orderId || p.id} permanently`} onClick={() => setDel(p)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                </Td>
              </tr>
            ))}
          </Table>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      )}
      <Modal
        open={Boolean(rf)}
        onClose={closeRefund}
        title={rfStep === "form" ? "Initiate refund" : "Confirm refund"}
        footer={rfStep === "form" ? (
          <><Button variant="ghost" onClick={closeRefund}>Cancel</Button><Button disabled={Boolean(amountError)} onClick={() => setRfStep("confirm")}>Review refund</Button></>
        ) : (
          <><Button variant="ghost" disabled={rfBusy} onClick={() => setRfStep("form")}>Back</Button><Button variant="danger" loading={rfBusy} onClick={submitRefund}>Yes, refund {rupees2(amountPaise)}</Button></>
        )}
      >
        {rf && rfStep === "form" && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl bg-stone-50 p-3 text-xs dk:bg-[#241b15]">
              <p><strong>{rf.member?.name}</strong> · paid {rupees2(rf.paidPaise)} via <span className="capitalize">{rf.gateway}</span></p>
              <p className="mt-1 break-all font-mono">payment ID: {rf.paymentId}</p>
              <p className={cx("mt-1", MUTED)}>Already refunded: {rupees2(refundedOf(rf))} · Refundable now: <strong>{rupees2(maxPaise)}</strong></p>
            </div>
            <label className="block">
              <span className="font-medium">Amount to refund (₹)</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" autoFocus className={cx(inputClass(Boolean(amountError)), "mt-1.5")} />
              {amountError && <span className="mt-1 block text-xs text-rose-600">{amountError}</span>}
            </label>
            <label className="block">
              <span className="font-medium">Note (optional)</span>
              <input value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} className={cx(inputClass(false), "mt-1.5")} />
            </label>
          </div>
        )}
        {rf && rfStep === "confirm" && (
          <div className="space-y-3 text-sm">
            <p>You are about to refund <strong>{rupees2(amountPaise)}</strong> to <strong>{rf.member?.name}</strong>.</p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-stone-600 dk:text-[#d6c4b8]">
              <li>It goes back to the <strong>same account</strong> that paid, against payment <span className="break-all font-mono">{rf.paymentId}</span> ({rf.gateway}).</li>
              <li>A refund cannot be cancelled once the gateway accepts it.</li>
              <li>This does not remove the member's arena access or matches.</li>
            </ul>
          </div>
        )}
      </Modal>
      <ConfirmModal open={Boolean(del)} onClose={() => setDel(null)} title="Delete this payment permanently?" confirmWord="DELETE" busy={deleting} onConfirm={() => run(`/payments/${del.id}`)}>
        <p>The payment record of <strong>{rupees2(del?.paidPaise)}</strong> for <strong>{del?.member?.name}</strong>{del?.orderId ? <> (order <span className="break-all font-mono text-xs">{del.orderId}</span>)</> : null} is removed from the database and from your revenue totals.</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-stone-600 dk:text-[#d6c4b8]">
          <li><strong>Nothing is refunded.</strong> This does not contact Cashfree/Razorpay. Refund in the gateway first if the member is owed money.</li>
          <li>If it was their only usable entry, they go back to the payment step and leave the arena.</li>
          <li>A payment that is powering a live match can't be deleted: dissolve or delete the match first.</li>
        </ul>
      </ConfirmModal>

      <p className={cx("text-xs", MUTED)}>Amounts are in INR. “Collected” counts paid, in-match, used-up and cancelled entries; pending and abandoned checkouts are excluded. Free (admin-granted) entries show ₹0.00 and can never be refunded.</p>
    </div>
  );
}
