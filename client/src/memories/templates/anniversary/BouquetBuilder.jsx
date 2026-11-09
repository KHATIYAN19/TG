import { useEffect, useId, useMemo, useRef, useState } from "react";

import { RoseDefs } from "../birthday/decor";
import { FLOWERS, FlowerHead } from "./art";
import { track } from "../../track";

/*
  BOUQUET BUILDER: pick flowers (roses, tulips, peonies, lilies, daisies, lavender) and watch the bouquet fill
  out, stem by stem. Up to twelve. "Give this bouquet" shows it big with a note from the sender.
*/
const SLOTS = [[160, 104, 0], [116, 124, -10], [204, 124, 10], [82, 158, -18], [238, 158, 18], [138, 154, -5], [182, 154, 5], [112, 192, -12], [208, 192, 12], [160, 184, 0], [70, 198, -22], [250, 198, 22]];
const FILLERS = [[96, 98, -24], [226, 98, 24], [58, 150, -34], [262, 150, 34]];

function BouquetSvg({ picked, hint, popAt = -1, className }) {
  const uid = useId().replace(/:/g, "");
  const heads = picked.map((type, i) => ({ type, i, x: SLOTS[i][0], y: SLOTS[i][1], rot: SLOTS[i][2] })).sort((a, b) => a.y - b.y);
  return (
    <svg className={className} viewBox="0 0 320 372" role="img" aria-label={`A bouquet of ${picked.length} flowers`}>
      <defs>
        <RoseDefs uid={uid} />
        <linearGradient id={`${uid}-paper`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f6dfbd" /><stop offset=".5" stopColor="#fff0d6" /><stop offset="1" stopColor="#e8c796" /></linearGradient>
        <linearGradient id={`${uid}-paper2`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd0dc" /><stop offset="1" stopColor="#ff9db9" /></linearGradient>
      </defs>
      <ellipse cx="160" cy="362" rx="64" ry="7" fill="#000" opacity=".16" />
      {/* greenery behind everything */}
      {[[-40, 0], [-24, 1], [0, 0], [24, 1], [40, 0]].map(([a, k], i) => (
        <g key={i} transform={`translate(160 300) rotate(${a})`}><path d={`M0,0 C-18,-60 -22,-${k ? 118 : 136} 0,-${k ? 150 : 170} C22,-${k ? 118 : 136} 18,-60 0,0Z`} fill={k ? "#4fae62" : "#2f9a4e"} opacity=".92" stroke="#14502b" strokeOpacity=".25" /><path d={`M0,-6 V-${k ? 140 : 160}`} stroke="#fff" strokeOpacity=".3" /></g>
      ))}
      {Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * 6.283; return <g key={i}><path d={`M${160 + Math.cos(a) * 20},230 L${160 + Math.cos(a) * 118},${120 + Math.sin(a) * 60 + 20}`} stroke="#7bbf8c" strokeWidth="1" opacity=".6" /><circle cx={160 + Math.cos(a) * 118} cy={140 + Math.sin(a) * 60} r="2.6" fill="#fff" /></g>; })}
      {FILLERS.slice(0, Math.min(4, Math.floor(picked.length / 2))).map(([x, y], i) => <path key={i} d={`M${x},${y} Q${(x + 160) / 2},${y + 80} 160,300`} stroke="#2f8f46" strokeWidth="3.5" fill="none" />)}
      {/* stems */}
      {heads.map((h) => <path key={`s${h.i}`} d={`M${h.x},${h.y + 14} Q${(h.x + 160) / 2},${h.y + 100} 160,300`} stroke="#2a7a3e" strokeWidth="5" fill="none" strokeLinecap="round" />)}
      {/* flower heads, back to front */}
      {heads.map((h) => (
        <g key={`h${h.i}`} transform={`translate(${h.x} ${h.type === "lavender" ? h.y + 22 : h.y}) rotate(${h.rot})`}>
          <g className={h.i === popAt ? "an-flower-pop" : ""}><FlowerHead type={h.type} uid={uid} s={h.type === "lavender" ? 1.05 : 1} /></g>
        </g>
      ))}
      {hint && picked.length < SLOTS.length && <circle cx={SLOTS[picked.length][0]} cy={SLOTS[picked.length][1]} r="30" fill="none" stroke="var(--bd-accent)" strokeWidth="2.5" strokeDasharray="5 6" className="an-slot-hint" />}
      {/* paper wrap + ribbon */}
      <path d="M62,236 C100,224 220,224 258,236 L186,366 L134,366 Z" fill={`url(#${uid}-paper)`} stroke="rgba(120,80,30,.25)" />
      <path d="M62,236 C98,230 160,244 160,244 L146,366 L134,366 Z" fill={`url(#${uid}-paper2)`} opacity=".92" />
      <path d="M258,236 C222,230 160,244 160,244 L174,366 L186,366 Z" fill={`url(#${uid}-paper2)`} opacity=".78" />
      <path d="M62,236 C100,224 220,224 258,236" stroke="#fff" strokeOpacity=".6" strokeWidth="2" fill="none" />
      <path d="M160,288 C128,262 108,288 126,308 C140,318 156,302 160,288Z" fill="#e11d48" stroke="#9f1239" strokeOpacity=".5" />
      <path d="M160,288 C192,262 212,288 194,308 C180,318 164,302 160,288Z" fill="#e11d48" stroke="#9f1239" strokeOpacity=".5" />
      <path d="M158,292 C148,322 138,340 124,352 M162,292 C172,322 182,340 196,352" stroke="#c4143c" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="160" cy="292" r="9" fill="#ff5c7a" stroke="#9f1239" strokeOpacity=".5" />
    </svg>
  );
}

export default function BouquetBuilder({ recipient, sender, fx, sound, onGive }) {
  const [picked, setPicked] = useState([]);
  const [sel, setSel] = useState("rose-red");
  const [popAt, setPopAt] = useState(-1);
  const [given, setGiven] = useState(false);
  const stage = useRef(null);
  const full = picked.length >= SLOTS.length;

  useEffect(() => {
    if (!given) return undefined;
    const t = setTimeout(() => setGiven(false), 9000);
    const key = (e) => e.key === "Escape" && setGiven(false);
    window.addEventListener("keydown", key);
    return () => { clearTimeout(t); window.removeEventListener("keydown", key); };
  }, [given]);

  const placeAt = (i) => {
    const r = stage.current?.getBoundingClientRect();
    if (!r) return null;
    return { x: r.left + (SLOTS[i][0] / 320) * r.width, y: r.top + (SLOTS[i][1] / 372) * r.height };
  };

  const add = (type = sel) => {
    if (full) return;
    const i = picked.length;
    setPicked((p) => [...p, type]);
    setPopAt(i);
    sound?.sfx.drip();
    const p = placeAt(i);
    if (p) fx?.sparkle(p.x, p.y, { n: 8, color: "#fff3b0" });
    try { navigator.vibrate?.(8); } catch { /* not supported */ }
  };
  const undo = () => { setPicked((p) => p.slice(0, -1)); setPopAt(-1); sound?.sfx.rustle(); };
  const surprise = () => {
    const pool = FLOWERS.filter((f) => !f.filler).map((f) => f.id);
    const extra = Array.from({ length: SLOTS.length - picked.length }, (_, k) => (k % 5 === 4 ? "lavender" : pool[Math.floor(Math.random() * pool.length)]));
    setPicked((p) => [...p, ...extra]);
    setPopAt(-1);
    sound?.sfx.chime();
    const p = placeAt(5);
    if (p) fx?.hearts(p.x, p.y, 10);
  };
  const give = () => {
    setGiven(true);
    track("bouquet", { text: picked.slice(0, 14).join(", "), n: picked.length });
    sound?.sfx.tada();
    const { W, H } = fx?.size() || { W: 400, H: 700 };
    fx?.confetti(W / 2, H * 0.7, { n: 60, power: 560, kinds: ["petal", "petal", "heart"], palette: ["#e11d48", "#ff9ec0", "#ffd1dc", "#ffffff"] });
    onGive?.(picked);
  };

  const counts = useMemo(() => picked.reduce((m, t) => ({ ...m, [t]: (m[t] || 0) + 1 }), {}), [picked]);

  return (
    <div className="an-builder">
      <div className="an-builder-stage" ref={stage}>
        <BouquetSvg picked={picked} hint popAt={popAt} className="an-builder-svg" />
        {picked.length === 0 && <span className="an-builder-empty">Pick a flower below to start your bouquet</span>}
      </div>

      <div className="an-palette" role="group" aria-label="Choose a flower">
        {FLOWERS.map((f) => (
          <button key={f.id} type="button" className="an-pal" aria-pressed={sel === f.id} onClick={() => { setSel(f.id); add(f.id); }} disabled={full} aria-label={`Add a ${f.name}`}>
            <i style={{ background: f.swatch }} aria-hidden />
            <span>{f.name}</span>
            {counts[f.id] > 0 && <b>{counts[f.id]}</b>}
          </button>
        ))}
      </div>

      <p className="an-builder-count" aria-live="polite">{full ? "A full bouquet! 💐" : `${picked.length} of ${SLOTS.length} flowers`}</p>
      <div className="an-builder-actions">
        <button type="button" className="bd-btn bd-btn-ghost" onClick={undo} disabled={picked.length === 0}>Undo</button>
        <button type="button" className="bd-btn bd-btn-ghost" onClick={surprise} disabled={full}>Surprise me</button>
        <button type="button" className="bd-btn" onClick={give} disabled={picked.length < 3}>{picked.length < 3 ? "Add 3 flowers" : `Give it to ${recipient}`}</button>
      </div>

      {given && (
        <div className="an-gift-overlay" role="dialog" aria-modal="true" aria-label="Your bouquet" onClick={() => setGiven(false)}>
          <BouquetSvg picked={picked} className="an-gift-bouquet" />
          <p className="an-gift-text"><span className="bd-script">For you, {recipient}</span><small>picked one by one by {sender}</small></p>
        </div>
      )}
    </div>
  );
}
