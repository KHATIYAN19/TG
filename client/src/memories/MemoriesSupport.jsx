import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CaretRight, ChatCircleDots, CheckCircle, CircleNotch, PaperPlaneTilt, Plus, XCircle } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { closeTicket, createTicket, getTicket, listTickets, listPages, replyTicket } from "./memApi";
import { Loading } from "./AppShell";
import { Banner, PageHead, Sheet } from "./appUi";
import { Btn } from "./landingUi";
import { cx } from "./ui";

export const CATEGORIES = [
  ["payment", "Payment or order"], ["page", "My page"], ["login", "Login or account"], ["refund", "Refund"], ["bug", "Something is broken"], ["feature", "Idea or request"], ["other", "Something else"],
];
export const STATUS_LABEL = { open: "Waiting for us", answered: "We replied", closed: "Closed" };
const STATUS_CLS = { open: "bg-amber-100 text-amber-800", answered: "bg-[#ecfdf5] text-emerald-700", closed: "bg-slate-100 text-slate-600" };
const catLabel = (c) => CATEGORIES.find(([k]) => k === c)?.[1] || "Something else";
const stamp = (d) => new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const taCls = "ml-input w-full resize-y";

const StatusChip = ({ status }) => <span className={cx("ma-chip caption-3", STATUS_CLS[status])}>{STATUS_LABEL[status]}</span>;

/* ---------- raise a ticket ---------- */
function NewTicket({ onClose, onCreated }) {
  const [f, setF] = useState({ subject: "", category: "other", message: "", pageId: "" });
  const [pages, setPages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => { listPages().then((d) => setPages(d?.items || d?.pages || (Array.isArray(d) ? d : []))).catch(() => {}); }, []);
  const set = (k) => (e) => { setF((v) => ({ ...v, [k]: e.target.value })); setErr(""); };
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try { onCreated(await createTicket({ ...f, pageId: f.pageId || null })); } catch (x) { setErr(errMsg(x)); setBusy(false); }
  };
  return (
    <Sheet title="New support ticket" subtitle="Tell us what happened. We reply here, so check back soon." icon={<ChatCircleDots size={20} weight="duotone" aria-hidden />} onClose={onClose} locked={busy}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block"><span className="body-5 mb-1 block font-medium text-[#4a2340]">What is it about?</span>
          <select value={f.category} onChange={set("category")} className="ml-input w-full">{CATEGORIES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        {pages.length > 0 && (
          <label className="block"><span className="body-5 mb-1 block font-medium text-[#4a2340]">Which page? <span className="opacity-60">(optional)</span></span>
            <select value={f.pageId} onChange={set("pageId")} className="ml-input w-full"><option value="">Not about a page</option>{pages.map((p) => <option key={p.id || p._id} value={p.id || p._id}>{p.title}</option>)}</select></label>
        )}
        <label className="block"><span className="body-5 mb-1 block font-medium text-[#4a2340]">Subject</span>
          <input value={f.subject} onChange={set("subject")} maxLength={120} required minLength={4} placeholder="A short summary" className="ml-input w-full" /></label>
        <label className="block"><span className="body-5 mb-1 block font-medium text-[#4a2340]">Details</span>
          <textarea value={f.message} onChange={set("message")} maxLength={5000} required minLength={2} rows={6} placeholder="What were you doing, and what did you expect? Add any order ID if it is about a payment." className={taCls} /></label>
        {err && <p role="alert" className="body-6 font-medium text-rose-600">{err}</p>}
        <Btn type="submit" loading={busy} className="w-full" onClick={submit}><PaperPlaneTilt size={16} aria-hidden /> Send ticket</Btn>
      </form>
    </Sheet>
  );
}

/* ---------- one conversation ---------- */
function Thread() {
  const { id } = useParams();
  const [t, setT] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState("");
  const end = useRef(null);

  const load = useCallback(async () => { try { setT(await getTicket(id)); setErr(""); } catch (e) { setErr(errMsg(e)); } }, [id]);
  useEffect(() => { load(); const i = setInterval(() => document.visibilityState === "visible" && load(), 30000); return () => clearInterval(i); }, [load]);
  useEffect(() => { end.current?.scrollIntoView({ block: "nearest" }); }, [t?.messages?.length]);

  const act = async (name, fn) => {
    setBusy(name); setErr("");
    try { const r = await fn(); if (r?.id) setT(r); return true; } catch (e) { setErr(errMsg(e)); return false; } finally { setBusy(""); }
  };
  const send = async (e) => { e.preventDefault(); if (msg.trim().length < 2) return; if (await act("send", () => replyTicket(id, msg.trim()))) setMsg(""); };

  if (!t && !err) return <Loading />;
  if (!t) return <div className="py-10"><Banner tone="error">{err}</Banner><Btn to="/memories/app/support" variant="ghost" className="mt-4">Back to tickets</Btn></div>;
  const closed = t.status === "closed";

  return (
    <div className="py-6">
      <Link to="/memories/app/support" className="ml-link caption-3 inline-flex items-center gap-1 text-[#be123c]"><ArrowLeft size={14} aria-hidden /> All tickets</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="caption-3 font-mono text-[#a07890]">{t.ticketNo} · {catLabel(t.category)}{t.pageTitle ? ` · ${t.pageTitle}` : ""}</p>
          <h1 className="heading-4 mt-1 break-words text-[#2a1023]">{t.subject}</h1>
        </div>
        <StatusChip status={t.status} />
      </div>

      <div className="mt-5 space-y-3" aria-live="polite">
        {t.messages.map((m) => {
          const mineMsg = m.from === "user";
          return (
            <div key={m.id} className={cx("flex", mineMsg ? "justify-end" : "justify-start")}>
              <div className={cx("max-w-[88%] rounded-3xl px-4 py-3 sm:max-w-[75%]", mineMsg ? "rounded-br-lg bg-[#e11d48] text-white" : "rounded-bl-lg bg-white text-[#2a1023] ring-1 ring-inset ring-[#f8d7e0]")}>
                <p className={cx("caption-4 font-semibold", mineMsg ? "text-rose-100" : "text-[#be123c]")}>{mineMsg ? "You" : "Target Trek support"}</p>
                <p className="body-5 mt-1 whitespace-pre-wrap break-words">{m.text}</p>
                <p className={cx("caption-5 mt-1", mineMsg ? "text-rose-100" : "text-[#a07890]")}>{stamp(m.at)}</p>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>

      {err && <Banner tone="error" className="mt-4">{err}</Banner>}

      {closed ? (
        <div className="mt-6 rounded-3xl bg-white p-5 text-center ring-1 ring-inset ring-[#f8d7e0]">
          <p className="body-4 font-semibold text-[#2a1023]"><CheckCircle size={18} weight="fill" className="mr-1 inline text-emerald-600" aria-hidden /> This ticket is closed{t.closedBy === "admin" ? " by our team" : ""}.</p>
          <p className="body-6 mt-1 text-[#7a5370]">Still need help? Raise a new ticket and mention this one ({t.ticketNo}).</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Btn to="/memories/app/support?new=1"><Plus size={16} weight="bold" aria-hidden /> Raise a new ticket</Btn>
          </div>
        </div>
      ) : (
        <form onSubmit={send} className="mt-6 space-y-3">
          <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4} maxLength={5000} placeholder="Write a reply…" aria-label="Your reply" className={taCls} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Btn variant="ghost" size="sm" loading={busy === "close"} onClick={() => act("close", () => closeTicket(id))}><XCircle size={16} aria-hidden /> Mark as solved</Btn>
            <Btn type="submit" loading={busy === "send"} disabled={msg.trim().length < 2} onClick={send}><PaperPlaneTilt size={16} aria-hidden /> Send reply</Btn>
          </div>
        </form>
      )}
    </div>
  );
}

/* ---------- the list ---------- */
function List() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState(null);
  const [more, setMore] = useState(false);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState(() => new URLSearchParams(window.location.search).get("new") === "1");

  const load = useCallback(async () => {
    try { const d = await listTickets({ ...(filter !== "all" ? { status: filter } : {}), limit: 20 }); setData(d); setErr(""); } catch (e) { setErr(errMsg(e)); }
  }, [filter]);
  useEffect(() => { setData(null); load(); }, [load]);
  const loadMore = async () => {
    setMore(true);
    try { const d = await listTickets({ ...(filter !== "all" ? { status: filter } : {}), limit: 20, cursor: data.nextCursor }); setData((p) => ({ ...d, items: [...p.items, ...d.items] })); } catch (e) { setErr(errMsg(e)); } finally { setMore(false); }
  };

  return (
    <div className="py-6">
      <PageHead kicker="HELP AND SUPPORT" title="Your tickets" text="Raise a question and follow the conversation here. Past tickets stay in your history.">
        <Btn onClick={() => setOpen(true)}><Plus size={16} weight="bold" aria-hidden /> New ticket</Btn>
      </PageHead>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter tickets">
        {[["all", "All"], ["active", "Open"], ["closed", "Closed"]].map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={filter === k} onClick={() => setFilter(k)} className={cx("ma-chip caption-3 px-4 py-2 ring-1 ring-inset transition", filter === k ? "bg-[#e11d48] text-white ring-[#e11d48]" : "bg-white text-[#7a5370] ring-[#f8d7e0] hover:bg-[#fff0f4]")}>{l}</button>
        ))}
      </div>

      {err && <Banner tone="error" className="mt-4">{err}</Banner>}
      {!data && !err ? <Loading /> : data && (
        data.items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-8 text-center ring-1 ring-inset ring-[#f8d7e0]">
            <ChatCircleDots size={40} weight="duotone" className="mx-auto text-[#e11d48]" aria-hidden />
            <p className="body-3 mt-3 font-semibold text-[#2a1023]">{filter === "all" ? "No tickets yet" : "Nothing here"}</p>
            <p className="body-6 mt-1 text-[#7a5370]">Stuck on a payment, a page or anything else? We are happy to help.</p>
            <Btn className="mt-4" onClick={() => setOpen(true)}><Plus size={16} weight="bold" aria-hidden /> Raise a ticket</Btn>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {data.items.map((t) => (
              <li key={t.id} className="ma-lift flex items-center gap-2 rounded-3xl bg-white p-4 ring-1 ring-inset ring-[#f8d7e0]">
                <Link to={`/memories/app/support/${t.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusChip status={t.status} />
                      {t.unread && <span className="ma-chip caption-3 bg-[#e11d48] text-white">New reply</span>}
                      <span className="caption-4 font-mono text-[#a07890]">{t.ticketNo}</span>
                    </span>
                    <span className="body-4 mt-2 block truncate font-semibold text-[#2a1023]">{t.subject}</span>
                    <span className="body-6 mt-0.5 block truncate text-[#7a5370]">{t.lastFrom === "admin" ? "Support: " : ""}{t.preview}</span>
                    <span className="caption-4 mt-1 block text-[#a07890]">{catLabel(t.category)} · {stamp(t.lastMessageAt)}</span>
                  </span>
                  <CaretRight size={18} className="shrink-0 text-[#c99bb0]" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
      {data?.hasMore && <div className="mt-5 text-center"><Btn variant="ghost" loading={more} onClick={loadMore}>{more ? <CircleNotch size={16} className="animate-spin" aria-hidden /> : null} Load more</Btn></div>}

      {open && <NewTicket onClose={() => setOpen(false)} onCreated={(t) => { setOpen(false); navigate(`/memories/app/support/${t.id}`); }} />}
    </div>
  );
}

export { List as SupportList, Thread as SupportThread };
