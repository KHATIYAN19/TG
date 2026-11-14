import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { CheckCircle2, EyeOff, Inbox, LifeBuoy, Loader2, LockOpen, MessageCircle, Search, Send, StickyNote, Trash2, XCircle } from "lucide-react";

import { Btn, Chip, Kpi, Modal, MoreSentinel, Person, inputCls, useCursorList, when } from "./AdminMemoryUi";

/* TICKETS TAB: help and support tickets raised by Memories users. Reply, add private notes, close, reopen or delete for good. */
const CATS = [["payment", "Payment"], ["page", "Page"], ["login", "Login"], ["refund", "Refund"], ["bug", "Bug"], ["feature", "Idea"], ["other", "Other"]];
const PRIOS = ["low", "normal", "high", "urgent"];
const ST = { open: ["Needs reply", "bg-amber-50 text-amber-700 ring-amber-200"], answered: ["Answered", "bg-emerald-50 text-emerald-700 ring-emerald-200"], closed: ["Closed", "bg-slate-100 text-slate-600 ring-slate-200"] };
const PR = { low: "bg-slate-100 text-slate-600 ring-slate-200", normal: "bg-sky-50 text-sky-700 ring-sky-200", high: "bg-orange-50 text-orange-700 ring-orange-200", urgent: "bg-rose-50 text-rose-700 ring-rose-200" };
const catLabel = (c) => CATS.find(([k]) => k === c)?.[1] || c;
const CANNED = [
  ["Looking into it", "Hi! Thanks for reaching out. We are looking into this and will update you here shortly."],
  ["Need order ID", "Could you share your order ID or the email you paid with? That helps us find it quickly."],
  ["Resolved", "This is sorted now. Please check and tell us if anything still looks off. Happy to help!"],
  ["Refund info", "We have noted your refund request. If it is eligible under our refund policy, it is processed to the original payment method within 5-7 working days."],
];

const StatusChip = ({ s }) => <Chip className={ST[s][1]}>{ST[s][0]}</Chip>;

function TicketModal({ id, http, run, setDialog, onClose, onChanged, onDeleted }) {
  const [t, setT] = useState(null);
  const [msg, setMsg] = useState("");
  const [note, setNote] = useState(false);
  const [busy, setBusy] = useState("");
  const end = useRef(null);

  const load = useCallback(async () => { const r = await run(() => http.get(`/tickets/${id}`)); if (r && r !== true) { setT(r); onChanged(r); } else if (!r) onClose(); }, [http, run, id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [load]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [t?.messages?.length]);

  const apply = async (name, fn, ok) => { setBusy(name); const r = await run(fn, ok); setBusy(""); if (r && r !== true) { setT(r); onChanged(r); return true; } return false; };
  const send = async (close = false) => {
    if (msg.trim().length < 2) return;
    if (await apply("send", () => http.post(`/tickets/${id}/reply`, { message: msg.trim(), note, close }), note ? "Note saved" : close ? "Replied and closed" : "Reply sent")) { setMsg(""); setNote(false); }
  };
  const setStatus = (status) => apply(status, () => http.post(`/tickets/${id}/status`, { status }), status === "closed" ? "Ticket closed" : "Ticket reopened");
  const meta = (body) => apply("meta", () => http.post(`/tickets/${id}/meta`, body), "Updated");
  const del = () => setDialog({
    kind: "confirm", title: "Delete this ticket permanently?", label: "Delete forever",
    text: `${t.ticketNo} · ${t.subject}. The whole conversation will be removed for you and for the user. This cannot be undone.`,
    onSubmit: async () => { if (await run(() => http.delete(`/tickets/${id}`), "Ticket deleted")) onDeleted(id); },
  });

  return (
    <Modal wide title={t ? `${t.ticketNo} · ${t.subject}` : "Ticket"} onClose={onClose}>
      {!t ? <div className="grid place-items-center py-16 text-slate-400"><Loader2 className="animate-spin" /></div> : (
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <StatusChip s={t.status} />
            <Chip className="bg-slate-100 text-slate-600 ring-slate-200">{catLabel(t.category)}</Chip>
            {t.pageTitle && <Chip className="bg-rose-50 text-rose-600 ring-rose-200">Page: {t.pageTitle}</Chip>}
            <select value={t.priority} onChange={(e) => meta({ priority: e.target.value })} aria-label="Priority" className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ring-1 ring-inset ${PR[t.priority]}`}>{PRIOS.map((p) => <option key={p} value={p}>{p} priority</option>)}</select>
            <span className="ml-auto text-xs text-slate-400">Opened {when(t.createdAt)}{t.reopenCount ? ` · reopened ${t.reopenCount}×` : ""}</span>
          </div>
          {t.user && <div className="mb-3 rounded-xl bg-slate-50 p-2.5"><Person name={t.user.name} email={t.user.email} phone={t.user.mobile} /></div>}

          <div className="max-h-[46vh] space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            {t.messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "admin" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${m.note ? "border border-dashed border-amber-300 bg-amber-50 text-amber-900" : m.from === "admin" ? "bg-rose-500 text-white" : "bg-white text-slate-800 ring-1 ring-slate-200"}`}>
                  <p className={`text-[11px] font-bold ${m.note ? "text-amber-700" : m.from === "admin" ? "text-rose-100" : "text-rose-600"}`}>{m.note ? "Private note · " : ""}{m.authorName || (m.from === "admin" ? "Support" : "User")}</p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-1 text-[10px] ${m.from === "admin" && !m.note ? "text-rose-100" : "text-slate-400"}`}>{when(m.at)}</p>
                </div>
              </div>
            ))}
            <div ref={end} />
          </div>

          <div className="mt-3">
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {CANNED.map(([label, body]) => <button key={label} type="button" onClick={() => setMsg((m) => (m ? `${m}\n${body}` : body))} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50">{label}</button>)}
            </div>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} maxLength={5000} placeholder={note ? "Private note (only admins can see this)…" : "Write a reply to the user…"} className={`${inputCls} ${note ? "!border-amber-300 !bg-amber-50" : ""}`} />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600"><input type="checkbox" checked={note} onChange={(e) => setNote(e.target.checked)} /> <StickyNote size={13} /> Private note</label>
              <span className="flex-1" />
              {!note && t.status !== "closed" && <Btn disabled={msg.trim().length < 2 || !!busy} onClick={() => send(true)}><CheckCircle2 size={12} /> Reply and close</Btn>}
              <Btn tone="primary" disabled={msg.trim().length < 2 || !!busy} onClick={() => send(false)}>{busy === "send" ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} {note ? "Save note" : "Send reply"}</Btn>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {t.status === "closed"
              ? <Btn disabled={!!busy} onClick={() => setStatus("open")}><LockOpen size={12} /> Reopen</Btn>
              : <Btn disabled={!!busy} onClick={() => setStatus("closed")}><XCircle size={12} /> Close ticket</Btn>}
            <Btn disabled={!!busy} onClick={async () => { await run(() => http.post(`/tickets/${id}/unread`, { unread: true }), "Marked unread"); onChanged({ ...t, unread: true }); onClose(); }}><EyeOff size={12} /> Mark unread</Btn>
            <span className="flex-1" />
            <Btn tone="danger" onClick={del}><Trash2 size={12} /> Delete permanently</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

export default function Tickets({ http, run, setDialog }) {
  const [f, setF] = useState({ status: "active", priority: "", category: "", unread: "", q: "" });
  const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v));
  const list = useCursorList({ http, path: "/tickets", params, limit: 25 });
  const [stats, setStats] = useState(null);
  const [sel, setSel] = useState(() => new Set());
  const [openId, setOpenId] = useState(null);
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));

  const loadStats = useCallback(() => http.get("/tickets/stats").then((r) => setStats(r.data.data)).catch(() => {}), [http]);
  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { setSel(new Set()); }, [f.status, f.priority, f.category, f.unread, f.q]);

  const rows = list.items;
  const allOn = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const toggle = (id) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const ids = [...sel];

  const bulk = (action) => {
    const verb = { delete: "Delete permanently", close: "Close", reopen: "Reopen" }[action];
    setDialog({
      kind: "confirm", title: `${verb} ${ids.length} ticket${ids.length === 1 ? "" : "s"}?`, label: verb,
      text: action === "delete" ? "The conversations are removed for good, for you and for the users. This cannot be undone." : "The users will see the new status.",
      onSubmit: async () => { const d = await run(() => http.post("/tickets/bulk", { action, ids })); if (d && d !== true) { toast.success(`${d.affected} updated`); setSel(new Set()); list.reload(); loadStats(); } },
    });
  };
  const purgeClosed = (days) => setDialog({
    kind: "confirm", title: "Delete closed tickets?", label: "Delete forever",
    text: `${days ? `Every closed ticket closed more than ${days} days ago` : "Every closed ticket"} will be permanently deleted.`,
    onSubmit: async () => { const d = await run(() => http.post("/tickets/bulk", { action: "delete", closedOlderThanDays: days })); if (d && d !== true) { toast.success(`${d.affected} deleted`); list.reload(); loadStats(); } },
  });

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Need a reply" value={stats?.open ?? "-"} icon={Inbox} tone="amber" />
        <Kpi label="Unread" value={stats?.unread ?? "-"} icon={MessageCircle} tone="rose" />
        <Kpi label="Answered" value={stats?.answered ?? "-"} icon={CheckCircle2} tone="emerald" />
        <Kpi label="Closed" value={stats?.closed ?? "-"} icon={LifeBuoy} tone="sky" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={f.q} onChange={set("q")} placeholder="Search ticket no, subject, name or email" className={`${inputCls} !pl-8`} /></div>
        <select className={`${inputCls} !w-auto`} value={f.status} onChange={set("status")} aria-label="Status"><option value="">All statuses</option><option value="active">Open and answered</option><option value="open">Needs reply</option><option value="answered">Answered</option><option value="closed">Closed</option></select>
        <select className={`${inputCls} !w-auto`} value={f.priority} onChange={set("priority")} aria-label="Priority"><option value="">Any priority</option>{PRIOS.map((p) => <option key={p} value={p}>{p}</option>)}</select>
        <select className={`${inputCls} !w-auto`} value={f.category} onChange={set("category")} aria-label="Category"><option value="">Any category</option>{CATS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select className={`${inputCls} !w-auto`} value={f.unread} onChange={set("unread")} aria-label="Read state"><option value="">Read and unread</option><option value="1">Unread only</option></select>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600"><input type="checkbox" checked={allOn} onChange={() => setSel(allOn ? new Set() : new Set(rows.map((r) => r.id)))} /> Select all shown</label>
        {ids.length > 0 && (<><span className="text-xs text-slate-400">{ids.length} selected</span><Btn onClick={() => bulk("close")}><XCircle size={12} /> Close</Btn><Btn onClick={() => bulk("reopen")}><LockOpen size={12} /> Reopen</Btn><Btn tone="danger" onClick={() => bulk("delete")}><Trash2 size={12} /> Delete</Btn></>)}
        <span className="flex-1" />
        <Btn tone="danger" onClick={() => purgeClosed(30)}><Trash2 size={12} /> Delete closed older than 30 days</Btn>
        <Btn tone="danger" onClick={() => purgeClosed(0)}><Trash2 size={12} /> Delete all closed</Btn>
      </div>

      {list.initial ? (
        <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400"><Loader2 className="animate-spin" /></div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">No tickets match.</div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {rows.map((t) => (
            <li key={t.id} className={`flex items-start gap-3 p-3 hover:bg-slate-50 ${t.unread ? "bg-rose-50/40" : ""}`}>
              <input type="checkbox" className="mt-1.5" checked={sel.has(t.id)} onChange={() => toggle(t.id)} aria-label={`Select ${t.ticketNo}`} />
              <button type="button" onClick={() => setOpenId(t.id)} className="min-w-0 flex-1 text-left">
                <span className="flex flex-wrap items-center gap-1.5">
                  {t.unread && <span className="h-2 w-2 rounded-full bg-rose-500" aria-label="Unread" />}
                  <StatusChip s={t.status} />
                  <Chip className={PR[t.priority]}>{t.priority}</Chip>
                  <Chip className="bg-slate-100 text-slate-600 ring-slate-200">{catLabel(t.category)}</Chip>
                  <span className="font-mono text-[11px] text-slate-400">{t.ticketNo}</span>
                </span>
                <span className={`mt-1 block truncate text-sm text-slate-900 ${t.unread ? "font-bold" : "font-semibold"}`}>{t.subject}</span>
                <span className="block truncate text-xs text-slate-500">{t.lastFrom === "admin" ? "You: " : ""}{t.preview}</span>
                <span className="mt-0.5 block text-[11px] text-slate-400">{t.user ? `${t.user.name || "User"} · ${t.user.email}` : "Deleted user"} · {t.messageCount} message{t.messageCount === 1 ? "" : "s"} · {when(t.lastMessageAt)}</span>
              </button>
              <Btn title="Delete permanently" tone="danger" onClick={() => setDialog({ kind: "confirm", title: "Delete this ticket permanently?", label: "Delete forever", text: `${t.ticketNo} · ${t.subject}. This cannot be undone.`, onSubmit: async () => { if (await run(() => http.delete(`/tickets/${t.id}`), "Ticket deleted")) { list.remove(t.id); loadStats(); } } })}><Trash2 size={12} /></Btn>
            </li>
          ))}
        </ul>
      )}
      <MoreSentinel hasMore={list.hasMore} loading={list.loading && !list.initial} onMore={list.loadMore} shown={rows.length} total={list.total} />

      {openId && (
        <TicketModal id={openId} http={http} run={run} setDialog={setDialog} onClose={() => { setOpenId(null); loadStats(); }}
          onChanged={(r) => list.patch(r.id, { status: r.status, priority: r.priority, category: r.category, unread: r.unread, preview: r.preview, lastFrom: r.lastFrom, messageCount: r.messageCount, lastMessageAt: r.lastMessageAt })}
          onDeleted={(id) => { setOpenId(null); list.remove(id); loadStats(); }} />
      )}
    </div>
  );
}
