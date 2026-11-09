import { useState } from "react";
import { Check, Loader2, Send } from "lucide-react";

import { errMsg } from "../../../arena/api";
import "./reply.css";

/*
  REPLY BOX: the receiver writes back to the sender. The message is saved on the page (the sender reads it in My pages > Activity)
  and stays visible here after a reload. Quick replies fill the box; they can also write their own.
  Without `onReply` (the builder and demos) it still looks real but nothing is saved.
*/
export default function ReplyBox({ sender, chips = [], onReply, previous = [], title, placeholder = "Type a message…", className = "" }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [demoSent, setDemoSent] = useState([]);
  const sent = onReply ? previous : demoSent;

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true); setError("");
    try {
      if (onReply) await onReply(t); else setDemoSent((l) => [...l, { text: t }]);
      setText("");
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className={`rb ${className}`} onSubmit={send} noValidate>
      {title && <p className="rb-title">{title}</p>}
      {sent.length > 0 && (
        <ul className="rb-sent" aria-label="Messages you sent">
          {sent.map((m, i) => <li key={i}><Check className="h-3.5 w-3.5" aria-hidden /> <span>{m.text}</span></li>)}
        </ul>
      )}
      {chips.length > 0 && (
        <div className="rb-chips" role="group" aria-label="Quick replies">
          {chips.map((c) => <button key={c} type="button" className={`rb-chip ${text === c ? "on" : ""}`} onClick={() => setText(c)}>{c}</button>)}
        </div>
      )}
      <label className="rb-label" htmlFor="rb-text">{sent.length ? `Send another message to ${sender}` : `Write to ${sender}`}</label>
      <textarea id="rb-text" className="rb-box" rows={3} maxLength={500} value={text} onChange={(e) => { setText(e.target.value); setError(""); }} placeholder={placeholder} />
      {error && <p className="rb-err" role="alert">{error}</p>}
      <button type="submit" className="bd-btn rb-send" disabled={!text.trim() || busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />} Send to {sender}</button>
    </form>
  );
}
