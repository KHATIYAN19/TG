import { useRef, useState } from "react";
import "./santa.css";

/* ---------- one reindeer, facing right (drawn in 100 x 90) ---------- */
const Reindeer = ({ x, lead, i }) => (
  <g transform={`translate(${x} 22)`}>
    <g className="xm-leg" style={{ transformOrigin: "26px 52px", animationDelay: `${-0.12 * i}s` }}><rect x="22" y="50" width="6" height="26" rx="3" fill="#6f4420" /></g>
    <g className="xm-leg b" style={{ transformOrigin: "36px 52px", animationDelay: `${-0.12 * i - 0.25}s` }}><rect x="33" y="50" width="6" height="26" rx="3" fill="#6f4420" /></g>
    <ellipse cx="46" cy="46" rx="34" ry="17" fill="#8b5a2b" />
    <ellipse cx="46" cy="52" rx="24" ry="8" fill="#c9985c" opacity=".55" />
    <path d="M72 38 Q84 26 88 16" stroke="#8b5a2b" strokeWidth="13" strokeLinecap="round" fill="none" />
    <ellipse cx="92" cy="15" rx="12" ry="9" fill="#8b5a2b" />
    <circle cx="95" cy="12" r="1.8" fill="#222" />
    <circle className={lead ? "xm-nose" : ""} cx="103" cy="17" r="4.2" fill={lead ? "#ff2d2d" : "#3b2412"} />
    <path d="M88 7 Q86 -6 92 -12 M91 -2 Q98 -4 100 -12 M84 8 Q78 -2 80 -10" stroke="#5a3818" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    <path d="M13 40 q-9 -2 -8 8 q4 -2 10 -2z" fill="#8b5a2b" />
    <g className="xm-leg" style={{ transformOrigin: "70px 52px", animationDelay: `${-0.12 * i - 0.12}s` }}><rect x="66" y="50" width="6" height="26" rx="3" fill="#8b5a2b" /></g>
    <g className="xm-leg b" style={{ transformOrigin: "58px 52px", animationDelay: `${-0.12 * i - 0.37}s` }}><rect x="55" y="50" width="6" height="26" rx="3" fill="#8b5a2b" /></g>
    <path d="M60 33 q6 -4 14 0" stroke="#d4a017" strokeWidth="3" fill="none" />
    <circle cx="74" cy="34" r="2.6" fill="#ffd23f" />
  </g>
);

/** Santa's sleigh pulled by two reindeer. Drawn in 440 x 130, flying to the right. */
export function SleighSvg({ className }) {
  return (
    <svg className={className} viewBox="0 0 440 130" aria-hidden>
      <path d="M95 52 Q200 40 262 70 M95 60 Q200 52 262 76" stroke="#d4a017" strokeWidth="1.8" fill="none" />
      <Reindeer x={110} i={1} />
      <Reindeer x={4} lead i={0} />
      {/* sleigh */}
      <g transform="translate(236 0)">
        <path d="M-6 118 H150 Q178 118 178 92" stroke="#d4a017" strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M20 118 V96 M120 118 V96" stroke="#d4a017" strokeWidth="4" />
        <path d="M6 62 Q8 98 38 102 H138 Q166 100 176 56 L160 56 Q154 82 132 84 H52 Q36 84 30 62Z" fill="#c1121f" stroke="#8f0d18" strokeWidth="2" />
        <path d="M14 66 H174" stroke="#ffd23f" strokeWidth="3" />
        {/* sack of gifts */}
        <path d="M118 58 Q108 20 134 18 Q160 20 150 58Z" fill="#8b5a2b" stroke="#6f4420" strokeWidth="2" />
        <path d="M122 24 q12 -10 24 0" stroke="#d4a017" strokeWidth="3" fill="none" />
        <rect x="124" y="6" width="14" height="14" rx="2" fill="#2f9e57" /><path d="M131 6v14M124 13h14" stroke="#ffd23f" strokeWidth="2" />
        <rect x="140" y="10" width="12" height="12" rx="2" fill="#3b82f6" /><path d="M146 10v12M140 16h12" stroke="#fff" strokeWidth="2" />
        {/* Santa */}
        <g className="xm-santa-bob">
          <path d="M50 60 q2 -26 24 -26 t24 26z" fill="#c1121f" />
          <circle cx="74" cy="22" r="13" fill="#ffd9b8" />
          <path d="M62 26 q0 22 12 22 t12 -22 q-6 7 -12 7 t-12 -7z" fill="#fff" />
          <circle cx="69" cy="20" r="1.8" fill="#222" /><circle cx="79" cy="20" r="1.8" fill="#222" />
          <circle cx="74" cy="25" r="2.6" fill="#f2a58c" />
          <path d="M61 18 Q64 -4 84 0 Q80 8 87 18Z" fill="#c1121f" />
          <rect x="60" y="14" width="28" height="7" rx="3.5" fill="#fff" />
          <circle cx="86" cy="2" r="5" fill="#fff" />
          <path d="M92 46 q14 -8 22 -26" stroke="#c1121f" strokeWidth="9" strokeLinecap="round" fill="none" className="xm-wave" style={{ transformOrigin: "92px 46px" }} />
          <circle cx="115" cy="19" r="5" fill="#fff" />
        </g>
      </g>
      <g className="xm-trail">{[0, 1, 2, 3, 4, 5].map((k) => <circle key={k} cx={-6 - k * 16} cy={50 + ((k * 13) % 30)} r={3 - k * 0.3} fill="#ffe27a" style={{ "--k": k }} />)}</g>
    </svg>
  );
}

/** A flying sleigh across the screen. Tap it: Santa says Ho ho ho and drops presents. `once` flies a single time (the finale). */
export function FlyingSleigh({ top = 54, size = 280, dur = 18, delay = 2, once = false, scene = false, onTap, className = "" }) {
  const [say, setSay] = useState(0);
  const [drops, setDrops] = useState([]);
  const id = useRef(0);
  const tap = () => {
    onTap?.();
    setSay((n) => n + 1);
    const added = [0, 1, 2].map((k) => ({ id: ++id.current, k }));
    setDrops((d) => [...d, ...added]);
    setTimeout(() => setDrops((d) => d.filter((x) => !added.includes(x))), 1700);
    setTimeout(() => setSay(0), 1800);
  };
  return (
    <div className={`xm-fly ${once ? "once" : ""} ${scene ? "scene" : ""} ${className}`} style={{ top, width: size, "--dur": `${dur}s`, "--delay": `${delay}s` }}>
      <button type="button" className="xm-fly-in" onClick={tap} aria-label="Santa's sleigh. Tap for a surprise">
        <SleighSvg className="xm-sleigh" />
      </button>
      {say > 0 && <span key={say} className="xm-hoho" aria-hidden>Ho ho ho!</span>}
      {drops.map((d) => <i key={d.id} className="xm-drop" style={{ left: `${52 + d.k * 12}%`, animationDelay: `${d.k * 0.18}s` }} aria-hidden>{["🎁", "⭐", "🍬"][d.k % 3]}</i>)}
    </div>
  );
}

/** Santa himself, waving. `cheer` makes him nod and laugh (when a wish arrives). */
export function SantaSvg({ className, cheer = false }) {
  return (
    <svg className={`${className || ""} ${cheer ? "cheer" : ""}`} viewBox="0 0 130 160" aria-hidden>
      <ellipse cx="62" cy="156" rx="40" ry="5" fill="#000" opacity=".14" />
      <path d="M16 156 q0 -52 46 -52 t46 52z" fill="#c1121f" />
      <rect x="16" y="150" width="92" height="8" rx="4" fill="#fff" />
      <rect x="14" y="128" width="96" height="10" fill="#222" /><rect x="52" y="125" width="20" height="16" rx="3" fill="#ffd23f" /><rect x="57" y="130" width="10" height="6" fill="#c9a000" />
      <path d="M30 112 q-10 14 -6 34" stroke="#c1121f" strokeWidth="14" strokeLinecap="round" fill="none" /><circle cx="24" cy="148" r="8" fill="#fff" />
      <g className="xm-wave big" style={{ transformOrigin: "96px 112px" }}>
        <path d="M96 112 q16 -8 22 -36" stroke="#c1121f" strokeWidth="14" strokeLinecap="round" fill="none" />
        <circle cx="118" cy="70" r="9" fill="#fff" />
      </g>
      <g className="xm-head">
        <circle cx="62" cy="66" r="26" fill="#ffd9b8" />
        <circle cx="46" cy="72" r="5" fill="#ff9aa5" opacity=".55" /><circle cx="78" cy="72" r="5" fill="#ff9aa5" opacity=".55" />
        <path d="M34 70 q0 46 28 46 t28 -46 q-13 15 -28 15 t-28 -15z" fill="#fff" />
        <path d="M44 78 q9 -8 18 0 q9 -8 18 0 q-9 9 -18 3 q-9 6 -18 -3z" fill="#fff" stroke="#e6e6ef" strokeWidth="1" />
        <circle cx="62" cy="68" r="4.5" fill="#f2a58c" />
        <g className="xm-eyes"><circle cx="52" cy="58" r="2.8" fill="#222" /><circle cx="72" cy="58" r="2.8" fill="#222" /></g>
        <path d="M45 50 q7 -5 12 -1 M67 49 q6 -4 12 1" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M35 54 Q40 6 84 12 Q76 26 92 54Z" fill="#c1121f" />
        <rect x="33" y="48" width="62" height="13" rx="6.5" fill="#fff" />
        <circle className="xm-pom" cx="86" cy="12" r="8" fill="#fff" style={{ transformOrigin: "80px 20px" }} />
      </g>
    </svg>
  );
}

/** A Santa cap: red, with a white band and a swinging pom-pom. Sits on top of whatever it is placed over. */
export function SantaHat({ className = "xm-hat" }) {
  return (
    <svg className={className} viewBox="0 0 60 50" aria-hidden>
      <path d="M6 36 Q8 6 38 6 Q34 18 52 34 Z" fill="#d6162b" />
      <path d="M12 30 Q16 12 32 10" stroke="#ff6b78" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".6" />
      <rect x="3" y="31" width="52" height="13" rx="6.5" fill="#fff" />
      <circle className="xm-pom" cx="40" cy="7" r="7" fill="#fff" style={{ transformOrigin: "36px 12px" }} />
    </svg>
  );
}

/** Falling snow for a section (it fills its parent, which must be positioned). */
export function SnowFall({ count = 22 }) {
  return (
    <div className="xm-snowfall" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, "--s": `${3 + ((i * 7) % 5)}px`, "--d": `${7 + ((i * 5) % 8)}s`, "--w": `${-((i * 13) % 11)}s` }} />
      ))}
    </div>
  );
}
