import { useEffect, useRef, useState } from "react";
import { track } from "../../track";

/*
  WISH LANTERNS: a night sky panel. Tap "Release a lantern" (or the sky): a glowing paper lantern drifts up with
  one of the sender's lines. Lanterns clean up after themselves.
*/
let lid = 0;
const MAX = 14;

export default function Lanterns({ wishes, fx, sound }) {
  const [list, setList] = useState([]);
  const next = useRef(0);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const release = (e) => {
    track("lantern");
    const id = ++lid;
    const text = wishes[next.current++ % wishes.length];
    const dur = 9 + Math.random() * 4;
    const left = 18 + Math.random() * 62;
    setList((l) => [...l.slice(-(MAX - 1)), { id, left, dur, text, hue: next.current % 4 }]);
    sound?.sfx.lantern();
    try { navigator.vibrate?.(12); } catch { /* not supported */ }
    if (e?.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); fx?.sparkle(r.left + r.width / 2, r.top + r.height * 0.85, { n: 10, color: "#ffe9a0" }); }
    timers.current.push(setTimeout(() => setList((l) => l.filter((q) => q.id !== id)), dur * 1000 + 400));
  };

  return (
    <div className="an-sky" onPointerDown={(e) => { if (e.target === e.currentTarget || e.target.classList.contains("an-sky-hint")) release(e); }}>
      <div className="an-sky-stars" aria-hidden />
      <div className="an-sky-hill" aria-hidden />
      {list.map((l) => (
        <div key={l.id} className="an-lantern" style={{ left: `${l.left}%`, "--dur": `${l.dur}s`, "--h": l.hue }}>
          <svg viewBox="0 0 60 84" aria-hidden>
            <defs><radialGradient id={`an-lg${l.id}`} cx=".5" cy=".6" r=".6"><stop offset="0" stopColor="#fff3b0" /><stop offset=".55" stopColor="#ffb04a" /><stop offset="1" stopColor="#ff7a3c" /></radialGradient></defs>
            <circle cx="30" cy="46" r="40" fill="#ffb04a" opacity=".22" />
            <path d="M14,18 C6,36 8,60 16,70 L44,70 C52,60 54,36 46,18 Z" fill={`url(#an-lg${l.id})`} stroke="#d9722b" strokeWidth="1.4" />
            <path d="M22,18 C18,36 20,60 24,70 M38,18 C42,36 40,60 36,70 M30,18 V70" stroke="#d9722b" strokeOpacity=".4" strokeWidth="1" fill="none" />
            <rect x="12" y="14" width="36" height="6" rx="3" fill="#d9722b" /><rect x="16" y="70" width="28" height="5" rx="2.5" fill="#d9722b" />
            <path className="ck-flame" d="M30,60 C34,64 33,69 30,70 C27,69 26,64 30,60Z" fill="#fff3b0" />
          </svg>
          <span className="an-lantern-wish">{l.text}</span>
        </div>
      ))}
      <button type="button" className="bd-btn an-sky-btn" onClick={release}>Release a lantern</button>
      {list.length === 0 && <p className="an-sky-hint">Tap the sky, or the button, to send a wish up</p>}
    </div>
  );
}
