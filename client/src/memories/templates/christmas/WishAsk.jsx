import { useState } from "react";
import { Check, Loader2, Send, Star } from "lucide-react";

import { errMsg } from "../../../arena/api";
import { track } from "../../track";
import { WISH_PREFIX, isWishReply } from "./audiences";
import { SantaSvg } from "./Santa";

/*
  MAKE A WISH: the sender's question ("What do you wish for this Christmas?"), a few ideas to tap, and a box for their own.
  The wish is SENT to the sender (saved on the page as a message starting with "🎄 My Christmas wish:"), who reads it in My pages > Activity.
  Without `onReply` (the builder and demos) it looks real but nothing is saved.
*/
export default function WishAsk({ question, chips, sender, fx, sound, onReply, previous = [] }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState([]);
  const [flash, setFlash] = useState(0);
  const [cheer, setCheer] = useState(false);
  const sent = (onReply ? previous.filter(isWishReply).map((r) => r.text.slice(WISH_PREFIX.length)) : demo);

  const addChip = (c, e) => {
    sound?.sfx.pop();
    setText((t) => {
      const parts = t.split(",").map((x) => x.trim()).filter(Boolean);
      return parts.includes(c) ? parts.filter((x) => x !== c).join(", ") : [...parts, c].join(", ");
    });
    const b = e.currentTarget.getBoundingClientRect();
    fx?.sparkle?.(b.left + b.width / 2, b.top + b.height / 2);
  };
  const chosen = (c) => text.split(",").map((x) => x.trim()).includes(c);

  const send = async (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || busy) return;
    setBusy(true); setError("");
    try {
      if (onReply) await onReply(`${WISH_PREFIX}${t}`); else setDemo((l) => [...l, t]);
      track("wish", { text: t.slice(0, 100) });
      setText("");
      setFlash((n) => n + 1);
      setCheer(true);
      setTimeout(() => setCheer(false), 3200);
      sound?.sfx.jingle?.();
      sound?.sfx.chime();
      const { W, H } = fx?.size() || { W: 400, H: 700 };
      fx?.confetti(W / 2, H * 0.55, { n: 50, power: 480 });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="xm-wish mem-reveal" onSubmit={send} noValidate>
      <Star className="xm-wish-star" fill="currentColor" aria-hidden />
      <div className="xm-santa-row">
        <SantaSvg className="xm-santa" cheer={cheer} />
        <p key={cheer ? "c" : "a"} className="xm-bubble">{cheer ? `Ho ho ho! Wish received. I'll tell ${sender}! 🎅` : "Ho ho ho! Tell Santa your wish…"}</p>
        {cheer && [0, 1, 2, 3, 4].map((k) => <i key={k} className="xm-wish-fly" style={{ "--x": `${(k - 2) * 26}px`, animationDelay: `${k * 0.12}s` }} aria-hidden>⭐</i>)}
      </div>
      <h3 className="xm-wish-q">{question}</h3>
      {sent.length > 0 && (
        <ul className="xm-wish-sent" aria-label="Wishes you sent">
          {sent.map((w, i) => <li key={i}><Check className="h-3.5 w-3.5" aria-hidden /> <span>{w}</span></li>)}
        </ul>
      )}
      {flash > 0 && <p key={flash} className="xm-wish-ok" role="status">Your wish is on its way to {sender} ⭐</p>}
      <div className="xm-chips" role="group" aria-label="Wish ideas">
        {chips.map((c) => <button key={c} type="button" className={`xm-chip ${chosen(c) ? "on" : ""}`} onClick={(e) => addChip(c, e)} aria-pressed={chosen(c)}>{c}</button>)}
      </div>
      <label className="xm-wish-label" htmlFor="xm-wish">{sent.length ? "Make another wish" : "Or write your own wish"}</label>
      <textarea id="xm-wish" className="xm-wish-box" rows={3} maxLength={400} value={text} onChange={(e) => { setText(e.target.value); setError(""); }} placeholder="I wish for…" />
      {error && <p className="xm-wish-err" role="alert">{error}</p>}
      <button type="submit" className="bd-btn xm-wish-send" disabled={!text.trim() || busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />} Send my wish to {sender}</button>
    </form>
  );
}
