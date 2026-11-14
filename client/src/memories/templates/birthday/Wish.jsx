import { useState } from "react";
import { Check, Loader2, Send, Sparkles } from "lucide-react";

import { errMsg } from "../../../arena/api";
import { track } from "../../track";
import { WISH_PREFIX, isWishReply } from "./audiences";

/*
  MAKE A WISH: the sender's question ("What is your birthday wish?"), ideas to tap and a box for their own words.
  The wish is SENT to the sender (saved on the page as a reply starting with "🎂 My birthday wish:"), who reads it in
  My pages > Activity. Without `onReply` (the builder and the demos) it looks real but nothing is saved.
*/
export default function Wish({ question, chips, sender, fx, sound, onReply, previous = [] }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState([]);
  const [flying, setFlying] = useState(0);
  const sent = onReply ? previous.filter(isWishReply).map((r) => r.text.slice(WISH_PREFIX.length)) : demo;

  const parts = text.split(",").map((x) => x.trim()).filter(Boolean);
  const toggle = (c, e) => {
    sound?.sfx.pop();
    setText(parts.includes(c) ? parts.filter((x) => x !== c).join(", ") : [...parts, c].join(", "));
    const b = e.currentTarget.getBoundingClientRect();
    fx?.sparkle(b.left + b.width / 2, b.top + b.height / 2, { n: 8 });
  };

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true); setError("");
    try {
      if (onReply) await onReply(`${WISH_PREFIX}${t}`.slice(0, 500)); else setDemo((l) => [...l, t]);
      track("wish", { text: t.slice(0, 100) });
      setText("");
      setFlying((n) => n + 1);
      sound?.sfx.lantern();
      setTimeout(() => sound?.sfx.chime(), 700);
      const { W, H } = fx?.size() || { W: 400, H: 700 };
      setTimeout(() => { fx?.firework(W * 0.5, H * 0.3); fx?.sparkle(W * 0.5, H * 0.3, { n: 26 }); }, 900);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="pt-wish mem-reveal" onSubmit={send} noValidate>
      <div className="pt-wish-sky" aria-hidden>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <i key={i} style={{ "--i": i }} />)}
        {flying > 0 && <span key={flying} className="pt-wish-star"><Sparkles className="h-6 w-6" /></span>}
      </div>
      <h3 className="pt-wish-q">{question}</h3>
      {sent.length > 0 && (
        <ul className="pt-wish-sent" aria-label="Wishes you sent">
          {sent.map((w, i) => <li key={i}><Check className="h-3.5 w-3.5" aria-hidden /> <span>{w}</span></li>)}
        </ul>
      )}
      {flying > 0 && <p key={flying} className="pt-wish-ok" role="status">Your wish is flying to {sender} ✨</p>}
      <div className="pt-chips" role="group" aria-label="Wish ideas">
        {chips.map((c) => <button key={c} type="button" className={`pt-chip ${parts.includes(c) ? "on" : ""}`} onClick={(e) => toggle(c, e)} aria-pressed={parts.includes(c)}>{c}</button>)}
      </div>
      <label className="pt-label" htmlFor="pt-wish-box">{sent.length ? "Make another wish" : "Or write your own wish"}</label>
      <textarea id="pt-wish-box" className="pt-box" rows={3} maxLength={400} value={text} onChange={(e) => { setText(e.target.value); setError(""); }} placeholder="I wish for…" />
      {error && <p className="pt-err" role="alert">{error}</p>}
      <button type="submit" className="bd-btn pt-wide" disabled={!text.trim() || busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />} Send my wish to {sender}
      </button>
    </form>
  );
}
