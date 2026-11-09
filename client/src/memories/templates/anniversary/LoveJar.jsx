import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "../../track";

/*
  LOVE JAR: the sender's reasons, folded into little hearts. Tap the jar (or the button): it shakes, a heart
  floats out and unfolds into a note. Every reason comes out once; none repeat until the jar is empty.
*/
const HEARTS = Array.from({ length: 30 }, (_, i) => {
  const r = (n) => { const x = Math.sin((i + 1) * n) * 10000; return x - Math.floor(x); };
  return { x: 62 + r(12.9) * 96, y: 112 + r(78.2) * 122, rot: (r(3.7) - 0.5) * 80, s: 0.4 + r(9.1) * 0.3, c: i % 5 };
});
const HEART_PATH = "M16 28C16 28 2 19 2 9.5 2 5 5.5 2 9.5 2 12.3 2 14.8 3.6 16 6 17.2 3.6 19.7 2 22.5 2 26.5 2 30 5 30 9.5 30 19 16 28 16 28Z";
const FILLS = ["var(--bd-accent)", "var(--bd-accent-2)", "#ffd1dc", "#ffffff", "#ffc94d"];

const shuffle = (n) => { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export default function LoveJar({ reasons, name, sender, fx, sound }) {
  const order = useMemo(() => shuffle(reasons.length), [reasons.length]);
  const [drawn, setDrawn] = useState(0);
  const [note, setNote] = useState(null); // { text, n }
  const [shake, setShake] = useState(false);
  const jarRef = useRef(null);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (!note) return undefined;
    const key = (e) => e.key === "Escape" && setNote(null);
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [note]);

  const empty = drawn >= reasons.length;

  const pull = () => {
    if (note) return;
    setShake(true);
    sound?.sfx.rustle();
    try { navigator.vibrate?.(14); } catch { /* not supported */ }
    timers.current.push(setTimeout(() => setShake(false), 600));
    if (empty) {
      const r = jarRef.current.getBoundingClientRect();
      fx?.hearts(r.left + r.width / 2, r.top + r.height * 0.3, 16);
      return;
    }
    timers.current.push(setTimeout(() => {
      const r = jarRef.current.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height * 0.3;
      sound?.sfx.chime();
      fx?.hearts(x, y, 12);
      fx?.sparkle(x, y, { n: 14 });
      track("jar_reason", { i: order[drawn], text: reasons[order[drawn]] });
      setNote({ text: reasons[order[drawn]], n: drawn + 1 });
      setDrawn((d) => d + 1);
    }, 520));
  };

  return (
    <div className="an-jar-wrap">
      <button ref={jarRef} type="button" className={`an-jar ${shake ? "shake" : ""}`} onClick={pull} aria-label="Pull a reason out of the jar">
        <svg viewBox="0 0 220 270" aria-hidden>
          <defs>
            <clipPath id="an-jarclip"><path d="M58,70 C58,56 66,50 66,50 L154,50 C154,50 162,56 162,70 L170,214 C171,240 150,252 110,252 C70,252 49,240 50,214Z" /></clipPath>
            <linearGradient id="an-jarglass" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".55" /><stop offset=".5" stopColor="#fff" stopOpacity=".16" /><stop offset="1" stopColor="#fff" stopOpacity=".45" /></linearGradient>
            <linearGradient id="an-cork" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#d9a066" /><stop offset="1" stopColor="#a8703a" /></linearGradient>
          </defs>
          <ellipse cx="110" cy="258" rx="74" ry="8" fill="#000" opacity=".16" />
          <g clipPath="url(#an-jarclip)">
            <rect x="40" y="130" width="140" height="130" fill="rgba(255,196,214,.18)" />
            {HEARTS.map((h, i) => (
              <g key={i} transform={`translate(${h.x} ${h.y}) rotate(${h.rot}) scale(${h.s * 1.5})`}><path d={HEART_PATH} transform="translate(-16 -14)" fill={FILLS[h.c]} stroke="rgba(0,0,0,.12)" strokeWidth="1.2" /></g>
            ))}
          </g>
          <path d="M58,70 C58,56 66,50 66,50 L154,50 C154,50 162,56 162,70 L170,214 C171,240 150,252 110,252 C70,252 49,240 50,214Z" fill="url(#an-jarglass)" stroke="rgba(255,255,255,.95)" strokeWidth="3" />
          <path d="M72,86 C68,130 70,190 76,226" stroke="#fff" strokeOpacity=".7" strokeWidth="6" fill="none" strokeLinecap="round" />
          <rect x="62" y="40" width="96" height="14" rx="6" fill="rgba(255,255,255,.55)" stroke="rgba(255,255,255,.95)" strokeWidth="2" />
          <rect x="56" y="14" width="108" height="30" rx="9" fill="url(#an-cork)" /><path d="M66,22v16M80,22v16M94,22v16M108,22v16M122,22v16M136,22v16M150,22v16" stroke="rgba(0,0,0,.12)" strokeWidth="2" />
          <rect x="72" y="140" width="76" height="40" rx="5" fill="#fffdf4" stroke="rgba(0,0,0,.14)" /><text x="110" y="158" textAnchor="middle" fontFamily="'Dancing Script',cursive" fontWeight="700" fontSize="16" fill="#c2185b">Reasons</text><text x="110" y="173" textAnchor="middle" fontFamily="'Dancing Script',cursive" fontWeight="700" fontSize="14" fill="#c2185b">I love you</text>
          <path d="M156,30 C186,44 186,70 170,80" stroke="#c2185b" strokeWidth="2" fill="none" /><path transform="translate(158 74) scale(.45)" d={HEART_PATH} fill="#e11d48" />
        </svg>
      </button>
      <p className="an-jar-count" aria-live="polite">{empty ? `That's all ${reasons.length}, and I find a new one every day.` : drawn === 0 ? `${reasons.length} reasons inside. Tap the jar.` : `${drawn} of ${reasons.length} opened`}</p>
      <button type="button" className="bd-btn" onClick={pull} disabled={Boolean(note)}>{empty ? "Shake it again" : "Pull out a reason"}</button>

      {note && (
        <div className="an-note-wrap" role="dialog" aria-modal="true" aria-label={`Reason number ${note.n}`} onClick={() => setNote(null)}>
          <div className="an-note" onClick={(e) => e.stopPropagation()}>
            <span className="an-note-heart" aria-hidden>♥</span>
            <small>Reason #{note.n}</small>
            <p>{note.text}</p>
            <em>— {sender}, for {name}</em>
            <button type="button" className="bd-btn" onClick={() => setNote(null)}>Keep it</button>
          </div>
        </div>
      )}
    </div>
  );
}
