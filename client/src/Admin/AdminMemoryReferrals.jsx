import { useCallback, useEffect, useState } from "react";
import { Copy, Loader2, Users, Wallet } from "lucide-react";
import { toast } from "react-toastify";

import { Btn, Chip, Field, Kpi, Modal, Pager, Person, Table, inputCls, inr, when } from "./AdminMemoryUi";

/*
  REFERRALS & PAYOUTS
    Payouts   cash requests from users (UPI): mark each one paid (with the UPI reference) or cancelled (with a reason; the credits go back to the user)
    Referrers who has brought friends, how many paid, and what they did with their credits
  The rules (friends per credit, cash on/off, rupees per credit) are in Settings.
*/

const STATUS_CLS = {
  requested: "bg-amber-50 text-amber-700 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
};
const FILTERS = [["requested", "To pay"], ["paid", "Paid"], ["cancelled", "Cancelled"], ["", "All"]];

function SettleModal({ row, mode, onClose, onSave }) {
  const [txn, setTxn] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const paid = mode === "paid";
  const ready = paid ? txn.trim().length >= 3 : note.trim().length >= 3;
  const go = async () => { setBusy(true); await onSave(row.id, paid ? { status: "paid", txnRef: txn.trim() } : { status: "cancelled", note: note.trim() }); setBusy(false); };
  return (
    <Modal title={paid ? `Mark ${inr(row.amount)} as paid` : "Cancel this request"} onClose={onClose}
      footer={<><Btn onClick={onClose}>Back</Btn><Btn tone={paid ? "primary" : "danger"} disabled={!ready || busy} onClick={go}>{busy ? "Saving…" : paid ? "Mark paid" : "Cancel request"}</Btn></>}>
      <p className="mb-3 text-sm text-slate-600">{row.user.name} · {row.credits} credit{row.credits === 1 ? "" : "s"} · UPI <b>{row.upiId}</b></p>
      {paid ? (
        <Field label="UPI transaction reference" hint="Shown to the user as proof of payment. Pay first, then mark it paid.">
          <input className={inputCls} value={txn} onChange={(e) => setTxn(e.target.value)} placeholder="e.g. 4123 5678 9012" autoFocus />
        </Field>
      ) : (
        <Field label="Reason (the user sees this)" hint="The credits go back to the user, who can use them for a page or ask again.">
          <textarea className={inputCls} rows={3} value={note} onChange={(e) => setNote(e.target.value)} autoFocus />
        </Field>
      )}
    </Modal>
  );
}

function Payouts({ http, run }) {
  const [status, setStatus] = useState("requested");
  const [page, setPage] = useState(1);
  const [d, setD] = useState(null);
  const [dlg, setDlg] = useState(null); // { row, mode }

  const load = useCallback(async () => {
    const r = await run(() => http.get("/payouts", { params: { status: status || undefined, page } }));
    if (r && r !== true) setD(r);
  }, [http, run, status, page]);
  useEffect(() => { load(); }, [load]);

  const save = async (id, body) => {
    const r = await run(() => http.post(`/payouts/${id}`, body), body.status === "paid" ? "Marked as paid" : "Request cancelled");
    if (r) { setDlg(null); load(); }
  };
  const copy = async (t) => { try { await navigator.clipboard.writeText(t); toast.success("Copied"); } catch { /* blocked */ } };

  if (!d) return <div className="grid place-items-center py-16 text-slate-400"><Loader2 className="animate-spin" /></div>;
  const c = d.counts || {};
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label={`To pay (${c.requested?.n || 0})`} value={inr(c.requested?.amount)} icon={Wallet} tone="amber" />
        <Kpi label={`Paid (${c.paid?.n || 0})`} value={inr(c.paid?.amount)} icon={Wallet} tone="emerald" />
        <Kpi label={`Cancelled (${c.cancelled?.n || 0})`} value={inr(c.cancelled?.amount)} icon={Wallet} tone="sky" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(([k, l]) => <button key={k} type="button" onClick={() => { setStatus(k); setPage(1); }} className={`rounded-full px-3 py-1 text-xs font-bold ${status === k ? "bg-rose-500 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>{l}</button>)}
      </div>
      <Table empty="No cash requests here" rows={d.items} cols={[
        { h: "User", v: (r) => <Person name={r.user.name} email={r.user.email} phone={r.user.mobile} /> },
        { h: "Amount", v: (r) => <div><b>{inr(r.amount)}</b><div className="text-[11px] text-slate-500">{r.credits} × {inr(r.ratePerCredit)}</div></div> },
        { h: "UPI ID", v: (r) => <button type="button" onClick={() => copy(r.upiId)} className="inline-flex items-center gap-1 font-mono text-xs text-slate-700 hover:text-rose-600">{r.upiId}<Copy size={12} /></button> },
        { h: "Asked", v: (r) => <span className="text-xs text-slate-600">{when(r.createdAt)}</span> },
        { h: "Status", v: (r) => <div><Chip className={STATUS_CLS[r.status]}>{r.status === "requested" ? "to pay" : r.status}</Chip>{r.txnRef && <div className="mt-1 text-[11px] text-slate-500">Ref {r.txnRef}</div>}{r.adminNote && <div className="mt-1 max-w-[180px] text-[11px] text-slate-500">{r.adminNote}</div>}</div> },
        { h: "", v: (r) => r.status === "requested" ? <div className="flex gap-1.5"><Btn tone="primary" onClick={() => setDlg({ row: r, mode: "paid" })}>Mark paid</Btn><Btn tone="danger" onClick={() => setDlg({ row: r, mode: "cancelled" })}>Cancel</Btn></div> : null },
      ]} />
      <Pager page={d.page} pages={d.pages} onPage={setPage} />
      {dlg && <SettleModal row={dlg.row} mode={dlg.mode} onClose={() => setDlg(null)} onSave={save} />}
    </div>
  );
}

function Referrers({ http, run }) {
  const [page, setPage] = useState(1);
  const [d, setD] = useState(null);
  useEffect(() => { run(() => http.get("/referrals", { params: { page } })).then((r) => { if (r && r !== true) setD(r); }); }, [http, run, page]);
  if (!d) return <div className="grid place-items-center py-16 text-slate-400"><Loader2 className="animate-spin" /></div>;
  return (
    <div>
      <Table empty="No one has referred a friend yet" rows={d.items.map((r) => ({ ...r, id: r.userId }))} cols={[
        { h: "Referrer", v: (r) => <Person name={r.name} email={r.email} /> },
        { h: "Code", v: (r) => <span className="font-mono text-xs">{r.code || "-"}</span> },
        { h: "Signed up", v: (r) => r.signedUp },
        { h: "Paid", v: (r) => <b className="text-emerald-700">{r.paid}</b> },
        { h: "Earned", v: (r) => r.earned },
        { h: "As page", v: (r) => r.usedAsPage },
        { h: "Cash", v: (r) => r.cashedOut },
        { h: "Ready", v: (r) => r.available },
        { h: "Last friend", v: (r) => <span className="text-xs text-slate-600">{when(r.last)}</span> },
      ]} />
      <Pager page={d.page} pages={d.pages} onPage={setPage} />
    </div>
  );
}

export default function Referrals(props) {
  const [view, setView] = useState("payouts");
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5">
        {[["payouts", "Cash payouts", Wallet], ["referrers", "Referrers", Users]].map(([k, l, I]) => (
          <button key={k} type="button" onClick={() => setView(k)} className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold ${view === k ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}><I size={15} />{l}</button>
        ))}
      </div>
      {view === "payouts" ? <Payouts {...props} /> : <Referrers {...props} />}
    </div>
  );
}
