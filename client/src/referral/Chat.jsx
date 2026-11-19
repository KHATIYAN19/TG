import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ArrowBendUpLeft, PaperPlaneTilt, PencilSimple, Trash, X } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { EMOJI, clock, delMsg, editMsg, getMessages, markRead, reactMsg, restSend } from "./api";
import { Btn } from "../resume/ui";
import { useConfirm } from "./ui";
import { useRef_ } from "./RefContext";

const dayLabel = (v) => { if (!v) return ""; const d = new Date(v), t = new Date(); const y = new Date(t); y.setDate(t.getDate() - 1); return d.toDateString() === t.toDateString() ? "Today" : d.toDateString() === y.toDateString() ? "Yesterday" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: d.getFullYear() === t.getFullYear() ? undefined : "numeric" }); };
const EDIT_MS = 5 * 60 * 1000; // edit and delete are offered for 5 minutes only
const upsert = (list, m) => (list.some((x) => x.id === m.id) ? list.map((x) => (x.id === m.id ? m : x)) : [...list, m]);

/* the live conversation: history over REST, everything new over the socket (REST if the socket is down) */
export default function Chat({ requestId, open, onRefresh }) {
  const { send, subscribe, state, refresh, openChat } = useRef_();
  const [items, setItems] = useState(null);
  const [more, setMore] = useState(false);
  const [text, setText] = useState("");
  const [reply, setReply] = useState(null);
  const [editing, setEditing] = useState(null);
  const [active, setActive] = useState(null);
  const [typing, setTyping] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ask, confirmDialog] = useConfirm();
  const log = useRef(null);
  const near = useRef(true);
  const typedAt = useRef(0);
  const typingTimer = useRef(null);
  const box = useRef(null);

  // tell the server what has been read (a burst of messages = one call), and re-count the badges only if something was really unread
  const readTimer = useRef(null);
  const read = useCallback(() => { clearTimeout(readTimer.current); readTimer.current = setTimeout(() => { markRead(requestId).then((r) => { if (r?.cleared) refresh(); }).catch(() => {}); }, 400); }, [requestId, refresh]);
  useEffect(() => { openChat.current = requestId; return () => { if (openChat.current === requestId) openChat.current = ""; clearTimeout(readTimer.current); }; }, [requestId, openChat]);
  useEffect(() => { setItems(null); setReply(null); setEditing(null); setText(""); getMessages(requestId).then((d) => { setItems(d.items); setMore(d.more); read(); }).catch((e) => toast.error(errMsg(e))); }, [requestId, read]);

  useEffect(() => subscribe((f) => {
    if (f.requestId !== requestId) return;
    if (f.type === "message") { setItems((l) => (l ? upsert(l, f.message) : l)); setTyping(false); if (!f.message.mine && !document.hidden) read(); }
    else if (f.type === "message_updated") setItems((l) => (l ? upsert(l, f.message) : l));
    else if (f.type === "typing") { setTyping(true); clearTimeout(typingTimer.current); typingTimer.current = setTimeout(() => setTyping(false), 3000); }
    else if (f.type === "request_updated") { onRefresh?.(); if (f.refresh) getMessages(requestId).then((d) => setItems(d.items)).catch(() => {}); }
    else if (f.type === "error") toast.error(f.message);
  }), [subscribe, requestId, read, onRefresh]);
  useEffect(() => () => clearTimeout(typingTimer.current), []);

  useLayoutEffect(() => { const el = log.current; if (el && near.current) el.scrollTop = el.scrollHeight; }, [items, typing]);
  const loadingOlder = useRef(false);
  const older = async () => {
    const first = items?.[0]?.id;
    if (!first || loadingOlder.current) return;
    loadingOlder.current = true;
    const el = log.current;
    const before = el ? el.scrollHeight : 0;
    const d = await getMessages(requestId, first).catch(() => null);
    if (d) { near.current = false; setItems((l) => [...d.items, ...l]); setMore(d.more); requestAnimationFrame(() => { if (el) el.scrollTop = el.scrollHeight - before; loadingOlder.current = false; }); } else loadingOlder.current = false;
  };
  const onScroll = () => { const el = log.current; if (!el) return; near.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120; if (el.scrollTop < 80 && more) older(); };

  const submit = async (e) => {
    e?.preventDefault();
    const body = text.trim();
    if (!body || busy || !open) return;
    setBusy(true);
    try {
      if (editing) {
        if (!send({ type: "edit", requestId, id: editing.id, text: body })) { const r = await editMsg(requestId, editing.id, body); setItems((l) => upsert(l, r.message)); }
        setEditing(null);
      } else if (!send({ type: "message", requestId, text: body, replyTo: reply?.id })) {
        near.current = true;
        const r = await restSend(requestId, { text: body, replyTo: reply?.id });
        setItems((l) => upsert(l, r.message));
      }
      near.current = true; setText(""); setReply(null);
      if (box.current) box.current.style.height = "auto";
    } catch (x) { toast.error(errMsg(x)); } finally { setBusy(false); }
  };
  const onType = (e) => {
    setText(e.target.value);
    e.target.style.height = "auto"; e.target.style.height = `${Math.min(140, e.target.scrollHeight)}px`;
    if (open && Date.now() - typedAt.current > 2500) { typedAt.current = Date.now(); send({ type: "typing", requestId }); }
  };
  const key = (e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia("(hover: hover)").matches) submit(e); };

  const doReact = async (m, emoji) => {
    setActive(null);
    if (send({ type: "react", requestId, id: m.id, emoji })) return;
    try { const r = await reactMsg(requestId, m.id, emoji); setItems((l) => upsert(l, r.message)); } catch (e) { toast.error(errMsg(e)); }
  };
  const remove = async (m) => {
    setActive(null);
    if (!(await ask({ title: "Delete this message?", message: "It will be removed for everyone in this chat.", confirmLabel: "Delete" }))) return;
    if (send({ type: "delete", requestId, id: m.id })) return;
    try { const r = await delMsg(requestId, m.id); setItems((l) => upsert(l, r.message)); } catch (e) { toast.error(errMsg(e)); }
  };
  const startEdit = (m) => { setActive(null); setEditing(m); setReply(null); setText(m.text); setTimeout(() => box.current?.focus(), 0); };
  const startReply = (m) => { setActive(null); setEditing(null); setReply(m); setTimeout(() => box.current?.focus(), 0); };

  return (
    <>
      {confirmDialog}
      <div className="rf-log" ref={log} onScroll={onScroll} role="log" aria-live="polite" aria-label="Messages">
        {items === null && <p className="rf-muted" style={{ textAlign: "center" }}>Loading messages…</p>}
        {items?.length === 0 && <p className="rf-sys">👋 Say hello. Keep it short and friendly.</p>}
        {more && <Btn size="sm" variant="ghost" onClick={older} style={{ alignSelf: "center" }}>Earlier messages</Btn>}
        {items?.map((m, i) => {
          // a small date line whenever the day changes (Today / Yesterday / 12 Nov)
          const day = dayLabel(m.createdAt);
          const sep = day !== dayLabel(items[i - 1]?.createdAt) ? <div key={`d-${m.id}`} className="rf-day">{day}</div> : null;
          if (m.system) return [sep, <div key={m.id} className="rf-sys">ℹ️ {m.text}</div>];
          const canEdit = m.mine && !m.deleted && Date.now() - new Date(m.createdAt).getTime() < EDIT_MS;
          return [sep, (
            <div key={m.id} className={`rf-msg${m.mine ? " me" : ""}${active === m.id ? " tools" : ""}`}>
              {open && !m.deleted && (
                <div className="rf-tools" role="toolbar" aria-label="Message actions">
                  {EMOJI.map((e) => <button key={e} type="button" aria-label={`React ${e}`} onClick={() => doReact(m, e)}>{e}</button>)}
                  <button type="button" aria-label="Reply" onClick={() => startReply(m)}><ArrowBendUpLeft size={16} aria-hidden /></button>
                  {canEdit && <button type="button" aria-label="Edit" onClick={() => startEdit(m)}><PencilSimple size={16} aria-hidden /></button>}
                  {canEdit && <button type="button" aria-label="Delete" onClick={() => remove(m)}><Trash size={16} aria-hidden /></button>}
                </div>
              )}
              <div className={`rf-bubble${m.deleted ? " gone" : ""}`} onClick={() => setActive((a) => (a === m.id ? null : m.id))}>
                {m.replyTo && <div className="rf-quote">{m.replyTo.mine ? "You" : "Them"}: {m.replyTo.text || "Message"}</div>}
                {m.deleted ? "This message was deleted" : m.text}
              </div>
              {m.reactions.length > 0 && <div className="rf-reacts">{m.reactions.map((r) => <button key={r.emoji} type="button" className={r.mine ? "mine" : ""} aria-label={`${r.emoji} ${r.count}`} onClick={() => open && doReact(m, r.emoji)}>{r.emoji}{r.count > 1 && <span className="rv-xs">{r.count}</span>}</button>)}</div>}
              <span className="rf-time">{clock(m.createdAt)}{m.edited && " · edited"}</span>
            </div>
          )];
        })}
      </div>
      <div className="rf-typing" aria-live="polite">{typing ? "Typing…" : ""}</div>
      {open ? (
        <form className="rf-compose" onSubmit={submit}>
          {(reply || editing) && <div className="rf-replying"><span>{editing ? "Editing message" : `Replying to: ${reply.text || "message"}`}</span><button type="button" className="rf-iconbtn" style={{ width: 30, height: 30 }} aria-label="Cancel" onClick={() => { setReply(null); setEditing(null); setText(""); }}><X size={14} aria-hidden /></button></div>}
          <div className="bar">
            <textarea ref={box} className="rv-input" rows={1} value={text} onChange={onType} onKeyDown={key} maxLength={2000} placeholder={state === "open" ? "Write a message" : "Write a message (reconnecting…)"} aria-label="Message" />
            <Btn type="submit" loading={busy} disabled={!text.trim()} aria-label={editing ? "Save edit" : "Send"}><PaperPlaneTilt size={18} weight="fill" aria-hidden /></Btn>
          </div>
        </form>
      ) : <p className="rf-closed">🔒 This chat is closed. You can still read it.</p>}
    </>
  );
}
