import { useState } from "react";
import { Check, Copy, Loader2, Send } from "lucide-react";

import { errMsg } from "../../../arena/api";

/*
  SAY THANKS BACK: pick a reply or write your own, then SEND it to the sender (it is saved on the page and the sender reads it).
  Sharing it on WhatsApp or copying it are extras. Nothing is saved in the builder or demos (no `onReply`).
*/
export default function SayThanksBack({ replies, sender, fx, sound, onReply, previous = [] }) {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [demoSent, setDemoSent] = useState([]);
  const sent = onReply ? previous : demoSent;

  const pick = (r, e) => {
    setText(r);
    sound?.sfx.pop();
    const b = e.currentTarget.getBoundingClientRect();
    fx?.sparkle?.(b.left + b.width / 2, b.top + b.height / 2);
  };
  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true); setError("");
    try {
      if (onReply) await onReply(t); else setDemoSent((l) => [...l, { text: t }]);
      setText("");
      sound?.sfx.chime();
      const { W, H } = fx?.size() || { W: 400, H: 700 };
      fx?.hearts(W / 2, H * 0.6, 10);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };
  const msg = text.trim();

  return (
    <form className="th-reply mem-reveal" onSubmit={send} noValidate>
      {sent.length > 0 && (
        <ul className="rb-sent" aria-label="Messages you sent">
          {sent.map((m, i) => <li key={i}><Check className="h-3.5 w-3.5" aria-hidden /> <span>{m.text}</span></li>)}
        </ul>
      )}
      <div className="th-chips" role="group" aria-label="Quick replies">
        {replies.map((r) => <button key={r} type="button" className={`th-chip ${text === r ? "on" : ""}`} onClick={(e) => pick(r, e)}>{r}</button>)}
      </div>
      <label className="th-reply-label" htmlFor="th-reply">{sent.length ? `Send another message to ${sender}` : `Or write your own to ${sender}`}</label>
      <textarea id="th-reply" className="th-reply-box" rows={3} maxLength={500} value={text} onChange={(e) => { setText(e.target.value); setError(""); }} placeholder="Type a message…" />
      {error && <p className="th-reply-err" role="alert">{error}</p>}
      <div className="th-reply-actions">
        <button type="submit" className="bd-btn" disabled={!msg || busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />} Send to {sender}</button>
        <a className={`bd-btn bd-btn-ghost ${msg ? "" : "th-disabled"}`} href={msg ? `https://wa.me/?text=${encodeURIComponent(msg)}` : undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!msg} onClick={(e) => { if (!msg) e.preventDefault(); }}>WhatsApp</a>
        <button type="button" className="bd-btn bd-btn-ghost" onClick={copy} disabled={!msg}><Copy className="h-4 w-4" aria-hidden /> {copied ? "Copied" : "Copy"}</button>
      </div>
    </form>
  );
}
