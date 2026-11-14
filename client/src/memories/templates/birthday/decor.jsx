import { useId, useMemo } from "react";

/* =====================================================
   DECOR: all the illustrations that give each theme its character.
   Everything is inline SVG/CSS (no image files), coloured from the theme.
===================================================== */

const rng = (seed) => { // tiny seeded random so layouts do not jump between renders
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
};
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const TAU = Math.PI * 2;

/* ---------------------------------------------------- tiny shapes */
export const HeartSvg = ({ c = "#ff4d94", s = 24 }) => (
  <svg viewBox="0 0 32 29" width={s} height={(s * 29) / 32} aria-hidden>
    <path d="M16 28C16 28 2 19 2 9.5 2 5 5.5 2 9.5 2 12.3 2 14.8 3.6 16 6 17.2 3.6 19.7 2 22.5 2 26.5 2 30 5 30 9.5 30 19 16 28 16 28Z" fill={c} />
    <path d="M7.5 8.5c1.2-2.4 4.2-3 6-1" stroke="#fff" strokeOpacity=".6" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);
export const StarSvg = ({ c = "#ffc233", s = 24 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden>
    <path d="M12 1.5l3 6.9 7.5.7-5.7 5 1.8 7.4L12 17.7l-6.6 3.8 1.8-7.4-5.7-5 7.5-.7z" fill={c} stroke="rgba(0,0,0,.12)" strokeWidth=".8" strokeLinejoin="round" />
    <path d="M9.5 8.2l2.5-3.8" stroke="#fff" strokeOpacity=".55" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
export const PetalSvg = ({ c = "#ff7a9a", s = 22 }) => (
  <svg viewBox="0 0 20 28" width={s * 0.72} height={s} aria-hidden>
    <path d="M10 1C17 7 19 17 10 27 1 17 3 7 10 1Z" fill={c} />
    <path d="M10 4c2 5 2 12 0 19" stroke="#fff" strokeOpacity=".35" strokeWidth="1.4" fill="none" strokeLinecap="round" />
  </svg>
);
export const NoteSvg = ({ c = "#7c5cff", s = 22 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden><path d="M9 18V5l11-2v13" stroke={c} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6.5" cy="18" r="3.2" fill={c} /><circle cx="17.5" cy="16" r="3.2" fill={c} /></svg>
);
export const SnowSvg = ({ c = "#ffffff", s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden><g stroke={c} strokeWidth="2" strokeLinecap="round" fill="none"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7" /></g><circle cx="12" cy="12" r="2.2" fill={c} /></svg>
);
export const SparkleSvg = ({ c = "#ffffff", s = 18 }) => (
  <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden><path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12C7 11 11 7 12 0z" fill={c} /></svg>
);
export const BubbleSvg = ({ c = "#00a896", text = "BFF", s = 56 }) => (
  <svg viewBox="0 0 70 50" width={s} height={(s * 50) / 70} aria-hidden>
    <path d="M10 4h50a8 8 0 0 1 8 8v18a8 8 0 0 1-8 8H34l-12 10 2-10H10a8 8 0 0 1-8-8V12a8 8 0 0 1 8-8Z" fill={c} />
    <text x="35" y="26" textAnchor="middle" fontFamily="'Fredoka', sans-serif" fontWeight="700" fontSize="15" fill="#fff">{text}</text>
  </svg>
);
export const LeafSvg = ({ c = "#2f9e57", s = 30 }) => (
  <svg viewBox="0 0 30 40" width={s * 0.75} height={s} aria-hidden><path d="M15 1C28 12 28 30 15 39 2 30 2 12 15 1Z" fill={c} /><path d="M15 6v31" stroke="#fff" strokeOpacity=".4" strokeWidth="1.4" /></svg>
);
export function HibiscusSvg({ c = "#ff4d7f", s = 40 }) {
  return (
    <svg viewBox="-30 -30 60 60" width={s} height={s} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => <path key={i} transform={`rotate(${i * 72})`} d="M0,0 C-14,-4 -20,-20 -9,-28 C-3,-32 3,-32 9,-28 C20,-20 14,-4 0,0Z" fill={c} stroke="rgba(0,0,0,.14)" strokeWidth=".7" />)}
      <circle r="6" fill="#7a0a2c" opacity=".55" />
      <path d="M0,0 L3,-22" stroke="#ffd23f" strokeWidth="2.2" strokeLinecap="round" /><circle cx="3" cy="-23" r="3" fill="#ffb300" />
    </svg>
  );
}

/* ---------------------------------------------------- ROSE (the real-looking one) */
const PETAL = "M0,0 C-17,-3 -26,-20 -16,-34 C-9,-43 9,-43 16,-34 C26,-20 17,-3 0,0 Z";
export const ROSE_SETS = {
  red: ["#7a0f27", "#d81e48", "#ff8fa8"],
  deep: ["#560a1d", "#a3173f", "#e65b82"],
  pink: ["#b53a63", "#ff7fa6", "#ffd4e2"],
  white: ["#c9b3ba", "#f4e4e8", "#ffffff"],
};

/** Gradients the roses use. Render once inside an <svg><defs>. */
export const RoseDefs = ({ uid }) => (
  <>
    {Object.entries(ROSE_SETS).map(([k, [d, m, l]]) => (
      <linearGradient key={k} id={`${uid}-rose-${k}`} x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor={d} /><stop offset=".55" stopColor={m} /><stop offset="1" stopColor={l} />
      </linearGradient>
    ))}
    <linearGradient id={`${uid}-leaf`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1f6b3a" /><stop offset="1" stopColor="#6fcf86" /></linearGradient>
  </>
);

/** One rose, centred on (0,0), about 90 units across. Layers of petals spiral inwards. */
export function RoseG({ x = 0, y = 0, s = 1, rot = 0, tone = "red", uid }) {
  const fill = uid ? `url(#${uid}-rose-${tone})` : ROSE_SETS[tone][1];
  const dark = ROSE_SETS[tone][0];
  const layer = (n, scale, offset, key) => Array.from({ length: n }, (_, i) => (
    <path key={`${key}${i}`} d={PETAL} transform={`rotate(${offset + (360 / n) * i}) scale(${scale})`} fill={fill} stroke={dark} strokeOpacity=".38" strokeWidth={0.9 / scale} strokeLinejoin="round" />
  ));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx="0" cy="3" rx="40" ry="38" fill="#000" opacity=".12" />
      {layer(7, 1.02, 8, "a")}
      {layer(6, 0.8, 26, "b")}
      {layer(5, 0.6, 4, "c")}
      {layer(4, 0.42, 38, "d")}
      {layer(3, 0.26, 12, "e")}
      <path d="M0,-2 C-5,-3 -6,3 -1,4 C4,5 6,-3 -1,-7 C-8,-10 -11,1 -4,8" stroke={dark} strokeOpacity=".7" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <ellipse cx="-12" cy="-16" rx="9" ry="4.5" transform="rotate(-35 -12 -16)" fill="#fff" opacity=".2" />
    </g>
  );
}

const Leaf = ({ x, y, rot, s = 1, uid }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0,0 C8,-16 30,-22 48,-9 C33,7 12,11 0,0Z" fill={`url(#${uid}-leaf)`} stroke="#14502b" strokeOpacity=".3" strokeWidth=".8" />
    <path d="M2,0 C18,-4 32,-6 46,-9" stroke="#fff" strokeOpacity=".4" strokeWidth="1.1" fill="none" />
  </g>
);

/** A hand-tied bouquet: roses, leaves, baby's breath, paper wrap and a ribbon bow. */
export function Bouquet({ className }) {
  const uid = useId().replace(/:/g, "");
  const r = useMemo(() => rng(11), []);
  const breath = useMemo(() => Array.from({ length: 22 }, () => { const a = r() * TAU; const d = 66 + r() * 58; return [150 + Math.cos(a) * d * 1.05, 118 + Math.sin(a) * d * 0.86 - 8]; }), [r]);
  return (
    <svg className={className} viewBox="0 0 300 350" role="img" aria-label="A bouquet of red and pink roses">
      <defs>
        <RoseDefs uid={uid} />
        <linearGradient id={`${uid}-paper`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#f6dfbd" /><stop offset=".5" stopColor="#fff0d6" /><stop offset="1" stopColor="#e8c796" /></linearGradient>
        <linearGradient id={`${uid}-paper2`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffd0dc" /><stop offset="1" stopColor="#ff9db9" /></linearGradient>
      </defs>
      <ellipse cx="150" cy="342" rx="62" ry="7" fill="#000" opacity=".16" />
      {/* stems */}
      {[[96, 150], [124, 170], [150, 175], [176, 170], [204, 150]].map(([x, y], i) => <path key={i} d={`M${x},${y} Q${(x + 150) / 2},${y + 70} 150,300`} stroke="#2a7a3e" strokeWidth="5.5" fill="none" strokeLinecap="round" />)}
      {/* leaves */}
      <Leaf x={92} y={178} rot={-158} s={0.95} uid={uid} /><Leaf x={208} y={178} rot={-22} s={0.95} uid={uid} />
      <Leaf x={110} y={214} rot={-140} s={0.85} uid={uid} /><Leaf x={192} y={214} rot={-40} s={0.85} uid={uid} />
      <Leaf x={70} y={120} rot={-170} s={0.8} uid={uid} /><Leaf x={230} y={120} rot={-10} s={0.8} uid={uid} />
      {/* baby's breath */}
      {breath.map(([x, y], i) => (
        <g key={i}><path d={`M${x},${y} L${150 + (x - 150) * 0.25},${190}`} stroke="#7bbf8c" strokeWidth="1" opacity=".7" /><circle cx={x} cy={y} r={2 + (i % 3) * 0.5} fill="#fff" /><circle cx={x + 3} cy={y - 2} r="1.4" fill="#fff" opacity=".85" /></g>
      ))}
      {/* roses: back to front */}
      <RoseG x={92} y={92} s={0.78} rot={-14} tone="pink" uid={uid} />
      <RoseG x={208} y={90} s={0.8} rot={16} tone="red" uid={uid} />
      <RoseG x={150} y={64} s={0.82} rot={4} tone="deep" uid={uid} />
      <RoseG x={104} y={142} s={0.98} rot={-10} tone="red" uid={uid} />
      <RoseG x={198} y={142} s={0.98} rot={12} tone="pink" uid={uid} />
      <RoseG x={150} y={128} s={1.18} rot={0} tone="red" uid={uid} />
      <RoseG x={150} y={190} s={0.82} rot={6} tone="deep" uid={uid} />
      {/* paper wrap */}
      <path d="M60,206 C98,196 202,196 240,206 L170,338 L130,338 Z" fill={`url(#${uid}-paper)`} stroke="rgba(120,80,30,.25)" strokeWidth="1" />
      <path d="M60,206 C96,200 150,214 150,214 L142,338 L130,338 Z" fill={`url(#${uid}-paper2)`} opacity=".9" />
      <path d="M240,206 C204,200 150,214 150,214 L158,338 L170,338 Z" fill={`url(#${uid}-paper2)`} opacity=".75" />
      <path d="M60,206 C98,196 202,196 240,206" stroke="#fff" strokeOpacity=".55" strokeWidth="2" fill="none" />
      {/* ribbon bow */}
      <path d="M150,262 C118,238 100,262 118,282 C132,292 146,276 150,262Z" fill="#e11d48" stroke="#9f1239" strokeOpacity=".5" />
      <path d="M150,262 C182,238 200,262 182,282 C168,292 154,276 150,262Z" fill="#e11d48" stroke="#9f1239" strokeOpacity=".5" />
      <path d="M148,266 C138,296 128,314 116,326 M152,266 C162,296 172,314 184,326" stroke="#c4143c" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="150" cy="266" r="9" fill="#ff5c7a" stroke="#9f1239" strokeOpacity=".5" />
    </svg>
  );
}

/** A small rose-and-leaves sprig for corners. */
export function RoseSprig({ className, tone = "red", flip }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 130 150" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <defs><RoseDefs uid={uid} /></defs>
      <path d="M30,140 Q50,90 66,56" stroke="#2a7a3e" strokeWidth="5" fill="none" strokeLinecap="round" />
      <Leaf x={44} y={104} rot={-20} s={0.8} uid={uid} /><Leaf x={46} y={122} rot={-150} s={0.7} uid={uid} />
      <RoseG x={70} y={52} s={0.9} tone={tone} uid={uid} />
    </svg>
  );
}

/* ---------------------------------------------------- hanging garlands */
export function Hanging({ items, sag = 22, height = 78, thread = true }) {
  const cy = (40 * sag) / height;
  return (
    <div className="bd-hang" style={{ height }} aria-hidden>
      <svg viewBox="0 0 100 20" preserveAspectRatio="none" className="bd-hang-string"><path d={`M-2,0 Q50,${cy} 102,0`} fill="none" stroke="rgba(90,50,70,.45)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" /></svg>
      {items.map((node, i) => {
        const t = (i + 0.5) / items.length;
        return <span key={i} className="bd-hang-item" data-thread={thread} style={{ left: `${t * 100}%`, top: 4 * sag * t * (1 - t), "--tilt": `${(t - 0.5) * 16}deg`, "--d": `${(i % 5) * 0.3}s` }}>{node}</span>;
      })}
    </div>
  );
}

const HEART_COLORS = ["#e11d48", "#ff5c8a", "#ff9ec4", "#b4233f", "#ffd1dc", "#d8a7ff", "#fb7185", "#ff7a45"];
export const HeartGarland = () => <Hanging sag={26} items={Array.from({ length: 11 }, (_, i) => <HeartSvg key={i} c={HEART_COLORS[i % HEART_COLORS.length]} s={26 + (i % 3) * 5} />)} />;

export function Bunting({ colors }) {
  return <Hanging sag={20} thread={false} items={Array.from({ length: 12 }, (_, i) => <span key={i} className="bd-flag" style={{ background: colors[i % colors.length] }} />)} />;
}

/* ---------------------------------------------------- friendship */
export function Friend({ skin = "#f6c9a0", hair = "#3a2418", shirt = "#00a896", side = "left", style = "bob" }) {
  const flip = side === "right";
  return (
    <svg viewBox="0 0 130 140" className="bd-friend" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M22,140 C22,108 40,96 62,96 C84,96 102,108 102,140Z" fill={shirt} />
      <path d="M92,104 C104,92 110,72 108,52" stroke={shirt} strokeWidth="13" strokeLinecap="round" fill="none" />
      <circle cx="108" cy="44" r="11" fill={skin} />
      <path d="M102,40c-2-6 0-10 2-12M108,38c0-6 1-11 3-13M114,40c1-5 3-8 5-9" stroke={skin} strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="62" cy="64" r="35" fill={skin} />
      {style === "bob"
        ? <path d="M24,66 C20,22 104,22 100,66 C96,46 80,40 62,40 C44,40 28,46 24,66Z M24,64 C20,86 28,92 34,90 L34,64Z M100,64 C104,86 96,92 90,90 L90,64Z" fill={hair} />
        : <path d="M25,62 C22,26 102,26 99,62 C92,44 74,36 62,36 C46,36 32,44 25,62Z M42,20 C50,10 74,10 82,20 C74,24 50,24 42,20Z" fill={hair} />}
      <circle cx="49" cy="66" r="3.6" fill="#2b1b16" /><circle cx="75" cy="66" r="3.6" fill="#2b1b16" />
      <circle cx="50" cy="65" r="1.2" fill="#fff" /><circle cx="76" cy="65" r="1.2" fill="#fff" />
      <circle cx="40" cy="78" r="6" fill="#ff7a9a" opacity=".4" /><circle cx="84" cy="78" r="6" fill="#ff7a9a" opacity=".4" />
      <path d="M50,79 Q62,92 74,79" stroke="#2b1b16" strokeWidth="2.6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Bracelet() {
  const beads = useMemo(() => Array.from({ length: 13 }, (_, i) => {
    const t = (i + 0.5) / 13;
    return [(1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 130 + t * t * 252, (1 - t) * (1 - t) * 14 + 2 * (1 - t) * t * 84 + t * t * 14, i];
  }), []);
  const cols = ["#ff7a45", "#ffc233", "#00a896", "#7c5cff", "#ff5c8a", "#4cc9f0"];
  const letters = { 5: "B", 6: "F", 7: "F" };
  return (
    <svg viewBox="0 0 260 74" className="bd-bracelet" aria-hidden>
      <path d="M8,14 Q130,84 252,14" fill="none" stroke="#8a5a44" strokeWidth="3" strokeLinecap="round" />
      {beads.map(([x, y, i]) => letters[i]
        ? <g key={i}><circle cx={x} cy={y} r="11" fill="#fff" stroke={cols[i % cols.length]} strokeWidth="2.6" /><text x={x} y={y + 5} textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight="700" fontSize="14" fill={cols[i % cols.length]}>{letters[i]}</text></g>
        : <g key={i}><circle cx={x} cy={y} r="8" fill={cols[i % cols.length]} /><circle cx={x - 2.5} cy={y - 2.5} r="2.6" fill="#fff" opacity=".6" /></g>)}
    </svg>
  );
}

export function SplitHeart() {
  const uid = useId().replace(/:/g, "");
  const HEART = "M100,118 C46,84 22,64 22,42 C22,24 36,12 54,12 C72,12 90,22 100,40 C110,22 128,12 146,12 C164,12 178,24 178,42 C178,64 154,84 100,118Z";
  return (
    <svg viewBox="0 0 200 132" className="bd-splitheart" aria-hidden>
      <defs>
        <clipPath id={`${uid}-l`}><polygon points="0,0 100,0 90,30 106,52 92,74 108,96 100,132 0,132" /></clipPath>
        <clipPath id={`${uid}-r`}><polygon points="200,0 100,0 90,30 106,52 92,74 108,96 100,132 200,132" /></clipPath>
      </defs>
      <path d="M44,0 L78,40 M156,0 L122,40" stroke="#b9a37a" strokeWidth="2.2" strokeDasharray="1 4" strokeLinecap="round" />
      <g transform="rotate(-6 60 70)"><path d={HEART} fill="#ff7a45" clipPath={`url(#${uid}-l)`} /><text x="58" y="64" textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight="700" fontSize="17" fill="#fff" transform="rotate(-8 58 64)">BEST</text></g>
      <g transform="rotate(6 140 70) translate(4 0)"><path d={HEART} fill="#00a896" clipPath={`url(#${uid}-r)`} /><text x="136" y="64" textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight="700" fontSize="15" fill="#fff" transform="rotate(8 136 64)">FRIEND</text></g>
    </svg>
  );
}

/* ---------------------------------------------------- tropical */
export function PalmLeaf({ className, flip }) {
  const uid = useId().replace(/:/g, "");
  const leaflets = useMemo(() => {
    const P0 = [0, 0]; const C = [90, -60]; const P2 = [210, 10];
    const out = [];
    for (let i = 1; i <= 16; i++) {
      const t = i / 17;
      const x = (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * C[0] + t * t * P2[0];
      const y = (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * C[1] + t * t * P2[1];
      const dx = 2 * (1 - t) * (C[0] - P0[0]) + 2 * t * (P2[0] - C[0]);
      const dy = 2 * (1 - t) * (C[1] - P0[1]) + 2 * t * (P2[1] - C[1]);
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      const len = 52 * Math.sin(Math.PI * (0.18 + 0.78 * (1 - t))) + 14;
      [1, -1].forEach((sgn) => out.push({ x, y, a: ang + sgn * 64, len, k: `${i}${sgn}` }));
    }
    return out;
  }, []);
  return (
    <svg className={className} viewBox="-10 -90 260 190" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <defs><linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1f8a4c" /><stop offset="1" stopColor="#7bd389" /></linearGradient></defs>
      {leaflets.map((l) => <path key={l.k} d={`M0,0 Q${l.len * 0.5},-9 ${l.len},0 Q${l.len * 0.5},9 0,0Z`} transform={`translate(${l.x} ${l.y}) rotate(${l.a})`} fill={`url(#${uid}-g)`} stroke="#14502b" strokeOpacity=".25" strokeWidth=".6" />)}
      <path d="M0,0 Q90,-60 210,10" stroke="#176b3a" strokeWidth="4.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}
export const Sun = ({ className }) => (
  <svg className={className} viewBox="-60 -60 120 120" aria-hidden>
    <g className="bd-spin-slow">{Array.from({ length: 14 }, (_, i) => <path key={i} d="M-3,-34 L0,-52 L3,-34Z" transform={`rotate(${(360 / 14) * i})`} fill="#ffc233" />)}</g>
    <circle r="27" fill="#ffd23f" /><circle r="27" fill="url(#none)" /><circle cx="-8" cy="-9" r="9" fill="#fff" opacity=".35" />
  </svg>
);
export const Wave = ({ color = "#00b4b6", opacity = 0.5, speed = 9, bottom = 0, delay = 0 }) => (
  <div className="bd-wave" style={{ bottom, opacity, "--sp": `${speed}s`, "--dl": `${delay}s` }} aria-hidden>
    <svg viewBox="0 0 800 60" preserveAspectRatio="none"><path d="M0,30 C50,6 100,6 150,30 S250,54 300,30 S400,6 450,30 S550,54 600,30 S700,6 750,30 S800,40 800,40 L800,60 L0,60Z" fill={color} /></svg>
  </div>
);

/* ---------------------------------------------------- galaxy / night */
export function Planet({ className }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 140 110" aria-hidden>
      <defs>
        <radialGradient id={`${uid}-p`} cx=".32" cy=".3"><stop offset="0" stopColor="#ffd6fb" /><stop offset=".55" stopColor="#c084fc" /><stop offset="1" stopColor="#5b3fd0" /></radialGradient>
        <clipPath id={`${uid}-front`}><rect x="0" y="55" width="140" height="60" /></clipPath>
      </defs>
      <ellipse cx="70" cy="56" rx="64" ry="16" fill="none" stroke="#7cf0ff" strokeWidth="6" opacity=".55" transform="rotate(-16 70 56)" />
      <circle cx="70" cy="56" r="34" fill={`url(#${uid}-p)`} />
      <path d="M40,50 Q70,60 100,48 M38,62 Q70,72 102,60" stroke="#fff" strokeOpacity=".22" strokeWidth="3" fill="none" />
      <ellipse cx="70" cy="56" rx="64" ry="16" fill="none" stroke="#7cf0ff" strokeWidth="6" opacity=".85" transform="rotate(-16 70 56)" clipPath={`url(#${uid}-front)`} />
    </svg>
  );
}
export const Rocket = ({ className }) => (
  <svg className={className} viewBox="0 0 60 130" aria-hidden>
    <path d="M30,2 C48,24 50,62 44,92 L16,92 C10,62 12,24 30,2Z" fill="#f4f7ff" stroke="#9fb0d8" strokeWidth="1.5" />
    <path d="M30,2 C40,14 44,26 45,38 L15,38 C16,26 20,14 30,2Z" fill="#ff5c8a" />
    <circle cx="30" cy="58" r="9" fill="#7cf0ff" stroke="#5b6fa8" strokeWidth="2.4" /><circle cx="27" cy="55" r="2.6" fill="#fff" opacity=".8" />
    <path d="M16,70 L2,98 L16,92Z M44,70 L58,98 L44,92Z" fill="#ff5c8a" />
    <path className="bd-flame-jet" d="M20,94 L30,128 L40,94Z" fill="#ffb300" /><path className="bd-flame-jet" d="M25,94 L30,116 L35,94Z" fill="#fff3b0" />
  </svg>
);
export function Moon({ className }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <defs><mask id={`${uid}-m`}><rect width="100" height="100" fill="#fff" /><circle cx="64" cy="40" r="36" fill="#000" /></mask></defs>
      <circle cx="46" cy="52" r="38" fill="#ffe9a8" mask={`url(#${uid}-m)`} />
      <circle cx="30" cy="62" r="5" fill="#f0d27c" opacity=".7" mask={`url(#${uid}-m)`} /><circle cx="24" cy="44" r="3.4" fill="#f0d27c" opacity=".7" mask={`url(#${uid}-m)`} />
    </svg>
  );
}
export const Cloud = ({ className }) => (
  <svg className={className} viewBox="0 0 140 60" aria-hidden><path d="M26,50 C6,50 4,26 24,24 C26,8 52,2 62,18 C74,4 104,10 104,30 C128,28 134,52 112,52Z" fill="#fff" opacity=".85" /></svg>
);

/* ---------------------------------------------------- floating background */
const FLOAT_ITEMS = {
  love: [["heart", 20, "up"], ["petal", 12, "down"]],
  friendship: [["star", 12, "up"], ["note", 6, "up"], ["bubble", 4, "up"], ["heart", 3, "up"]],
  tropical: [["leaf", 8, "down"], ["hibiscus", 6, "down"], ["petal", 7, "down"]],
  galaxy: [["star", 14, "twinkle"], ["sparkle", 10, "twinkle"], ["planet", 2, "up"]],
  candy: [["sprinkle", 18, "down"]],
  citrus: [["dot", 14, "up"], ["sparkle", 6, "up"]],
  dreamy: [["sparkle", 14, "up"], ["dot", 8, "up"]],
  midnight: [["sparkle", 14, "twinkle"], ["star", 8, "twinkle"]],
};
const BUBBLES = ["BFF", "Yay!", "LOL", "Squad", "<3", "Best!"];

function FloatArt({ kind, color, text, size }) {
  switch (kind) {
    case "heart": return <HeartSvg c={color} s={size} />;
    case "star": return <StarSvg c={color} s={size} />;
    case "petal": return <PetalSvg c={color} s={size} />;
    case "note": return <NoteSvg c={color} s={size} />;
    case "bubble": return <BubbleSvg c={color} text={text} s={size * 2.2} />;
    case "leaf": return <LeafSvg c={color} s={size * 1.2} />;
    case "hibiscus": return <HibiscusSvg c={color} s={size * 1.6} />;
    case "sparkle": return <SparkleSvg c={color} s={size} />;
    case "snow": return <SnowSvg c={color} s={size * 0.8} />;
    case "planet": return <Planet className="bd-fl-planet" />;
    case "bear": return <BearFace s={size * 1.3} />;
    case "butterfly": return <ButterflyFloat c={color} s={size * 1.5} />;
    case "bee": return <Bee s={size * 1.5} />;
    case "puzzle": return <PuzzleSvg c={color} s={size * 1.3} />;
    case "firefly": return <span className="bd-firefly" style={{ width: size * 0.35, height: size * 0.35 }} />;
    case "sprinkle": return <span style={{ display: "block", width: size * 0.34, height: size * 1.1, borderRadius: 99, background: color }} />;
    default: return <span style={{ display: "block", width: size * 0.9, height: size * 0.9, borderRadius: "50%", background: color, opacity: 0.45 }} />;
  }
}

export function BgFloat({ theme, spec: specProp }) {
  const small = typeof window !== "undefined" && window.innerWidth < 640;
  const items = useMemo(() => {
    const r = rng(hash(theme.id));
    const spec = specProp || FLOAT_ITEMS[theme.id] || [];
    const out = [];
    spec.forEach(([kind, n, dir]) => {
      const count = small ? Math.ceil(n * 0.65) : n;
      for (let i = 0; i < count; i++) {
        const dur = dir === "twinkle" ? 2.5 + r() * 3.5 : 16 + r() * 22;
        out.push({
          id: `${kind}${i}`, kind, dir,
          left: r() * 96, top: r() * 100,
          size: kind === "bubble" ? 17 + r() * 8 : 14 + r() * 22,
          dur, delay: dir === "twinkle" ? -r() * dur : -r() * dur,
          rot: (r() - 0.5) * 360, color: kind === "snow" && theme.snow ? theme.snow : theme.balloons[Math.floor(r() * theme.balloons.length)],
          text: BUBBLES[Math.floor(r() * BUBBLES.length)], sway: 8 + r() * 26,
        });
      }
    });
    return out;
  }, [theme, small]);
  return (
    <div className="bd-float-layer" aria-hidden>
      {items.map((it) => (
        <span key={it.id} className={`bd-fl ${it.dir}`} style={{ left: `${it.left}%`, top: it.dir === "twinkle" ? `${it.top}%` : 0, "--dur": `${it.dur}s`, "--delay": `${it.delay}s`, "--rot": `${it.rot}deg`, "--sway": `${it.sway}px` }}>
          <span className="bd-fl-in"><FloatArt kind={it.kind} color={it.color} text={it.text} size={it.size} /></span>
        </span>
      ))}
    </div>
  );
}

/* ---------------------------------------------------- hero ornaments per theme */
export function HeroDecor({ theme }) {
  switch (theme.id) {
    case "love":
      return (
        <div className="bd-decor" aria-hidden>
          <div className="bd-decor-top"><HeartGarland /></div>
          <Bouquet className="bd-bouquet" />
          <RoseSprig className="bd-sprig left" tone="pink" />
          <RoseSprig className="bd-sprig right" tone="deep" flip />
        </div>
      );
    case "friendship":
      return (
        <div className="bd-decor" aria-hidden>
          <div className="bd-decor-top"><Bunting colors={["#00a896", "#ff7a45", "#ffc233", "#7c5cff", "#ff5c8a", "#4cc9f0"]} /></div>
          <div className="bd-friend-wrap left"><Friend side="left" skin="#f6c9a0" hair="#3a2418" shirt="#00a896" /></div>
          <div className="bd-friend-wrap right"><Friend side="right" skin="#c98a5e" hair="#1f1410" shirt="#ff7a45" style="spiky" /></div>
          <div className="bd-necklace"><SplitHeart /></div>
          <div className="bd-bracelet-wrap"><Bracelet /></div>
        </div>
      );
    case "tropical":
      return (
        <div className="bd-decor" aria-hidden>
          <PalmLeaf className="bd-palm tl" />
          <PalmLeaf className="bd-palm tr" flip />
          <Sun className="bd-sun" />
          <div className="bd-hib left"><HibiscusSvg c="#ff4d7f" s={74} /></div>
          <div className="bd-hib right"><HibiscusSvg c="#ff9a3c" s={62} /></div>
          <Wave color="#00b4b6" opacity={0.45} speed={11} bottom={-6} />
          <Wave color="#4dd8da" opacity={0.55} speed={7} bottom={-14} delay={-3} />
        </div>
      );
    case "galaxy":
      return (
        <div className="bd-decor" aria-hidden>
          <Planet className="bd-planet" />
          <Moon className="bd-moon" />
          <Rocket className="bd-rocket" />
          <span className="bd-shoot s1" /><span className="bd-shoot s2" /><span className="bd-shoot s3" />
        </div>
      );
    case "candy":
      return <div className="bd-decor" aria-hidden><div className="bd-decor-top"><Bunting colors={["#ff4d94", "#ffb347", "#7dd3fc", "#a78bfa", "#34d399", "#fde047"]} /></div></div>;
    case "citrus":
      return <div className="bd-decor" aria-hidden><div className="bd-decor-top"><Bunting colors={["#ff8a00", "#ffd23f", "#22c3a6", "#ff5c5c", "#4cc9f0"]} /></div></div>;
    case "dreamy":
      return <div className="bd-decor" aria-hidden><Cloud className="bd-cloud c1" /><Cloud className="bd-cloud c2" /><Cloud className="bd-cloud c3" /></div>;
    case "midnight":
      return <div className="bd-decor" aria-hidden><Moon className="bd-moon" /><span className="bd-shoot s1" /><span className="bd-shoot s2" /></div>;
    default:
      return null;
  }
}

/* ---------------------------------------------------- cake toppers (<g> pieces, drawn inside the cake's SVG) */
export const HibiscusG = ({ x = 0, y = 0, s = 1, c = "#ff4d7f" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2, 3, 4].map((i) => <path key={i} transform={`rotate(${i * 72})`} d="M0,0 C-14,-4 -20,-20 -9,-28 C-3,-32 3,-32 9,-28 C20,-20 14,-4 0,0Z" fill={c} stroke="rgba(0,0,0,.16)" strokeWidth=".8" />)}
    <circle r="6" fill="#7a0a2c" opacity=".55" /><path d="M0,0 L3,-22" stroke="#ffd23f" strokeWidth="2.4" strokeLinecap="round" /><circle cx="3" cy="-23" r="3.2" fill="#ffb300" />
  </g>
);
export const StarG = ({ x = 0, y = 0, s = 1, c = "#ffc233" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path transform="translate(-12 -12)" d="M12 1.5l3 6.9 7.5.7-5.7 5 1.8 7.4L12 17.7l-6.6 3.8 1.8-7.4-5.7-5 7.5-.7z" fill={c} stroke="rgba(0,0,0,.18)" strokeWidth=".8" strokeLinejoin="round" />
  </g>
);
export const UmbrellaG = ({ x = 0, y = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0,0 L0,-34" stroke="#c98a4a" strokeWidth="2" strokeLinecap="round" />
    <path d="M-26,-30 Q0,-58 26,-30 Q13,-36 0,-30 Q-13,-36 -26,-30Z" fill="#ff6f59" stroke="rgba(0,0,0,.18)" strokeWidth=".8" />
    <path d="M-9,-45 Q-3,-34 -13,-33 M9,-45 Q3,-34 13,-33" stroke="#fff" strokeWidth="2" fill="none" opacity=".85" />
  </g>
);
export const MiniPlanetG = ({ x = 0, y = 0, s = 1, c = "#c084fc" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse rx="19" ry="5.5" fill="none" stroke="#7cf0ff" strokeWidth="2.4" opacity=".6" transform="rotate(-16)" />
    <circle r="10.5" fill={c} stroke="rgba(0,0,0,.2)" strokeWidth=".8" /><circle cx="-3.5" cy="-3.5" r="3" fill="#fff" opacity=".45" />
    <path d="M-17,3 Q0,8 17,-3" fill="none" stroke="#7cf0ff" strokeWidth="2.4" transform="rotate(-16)" />
  </g>
);
export const FlagG = ({ x = 0, y = 0, s = 1, text = "BFF", c = "#00a896" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0,0 L0,-46" stroke="#b9854d" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M1,-46 L40,-46 L33,-35 L40,-24 L1,-24Z" fill={c} stroke="rgba(0,0,0,.15)" strokeWidth=".8" />
    <text x="19" y="-30" textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight="700" fontSize="11" fill="#fff">{text}</text>
  </g>
);
export const RocketG = ({ x = 0, y = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0,-40 C10,-28 11,-10 8,2 L-8,2 C-11,-10 -10,-28 0,-40Z" fill="#f4f7ff" stroke="#9fb0d8" strokeWidth="1.2" />
    <path d="M0,-40 C5,-34 7,-28 8,-22 L-8,-22 C-7,-28 -5,-34 0,-40Z" fill="#ff5c8a" />
    <circle cx="0" cy="-12" r="4.4" fill="#7cf0ff" stroke="#5b6fa8" strokeWidth="1.4" />
    <path d="M-8,-4 L-15,8 L-8,5Z M8,-4 L15,8 L8,5Z" fill="#ff5c8a" /><path d="M-4,3 L0,13 L4,3Z" fill="#ffb300" />
  </g>
);

/** What sits on the cake in each slot, per theme. (x, y) is the base of the decoration. */
export function SlotArt({ theme, x, y, i, uid }) {
  if (theme === "love") {
    return (
      <g>
        <path d={`M${x - 3},${y - 8} q-12,-2 -16,6 q10,4 16,-6Z M${x + 3},${y - 8} q12,-2 16,6 q-10,4 -16,-6Z`} fill="#2f8f46" opacity=".95" />
        <RoseG x={x} y={y - 14} s={0.3} rot={i * 24} tone={i % 2 ? "pink" : "red"} uid={uid} />
      </g>
    );
  }
  if (theme === "friendship") return i === 2 ? <FlagG x={x} y={y} s={0.95} /> : <StarG x={x} y={y - 12} s={0.78} c={i % 2 ? "#ffc233" : "#ff7a45"} />;
  if (theme === "tropical") return i === 2 ? <UmbrellaG x={x} y={y} s={0.95} /> : <HibiscusG x={x} y={y - 12} s={0.52} c={i % 2 ? "#ff9a3c" : "#ff4d7f"} />;
  if (theme === "galaxy") return i === 2 ? <RocketG x={x} y={y} s={0.9} /> : i === 1 ? <StarG x={x} y={y - 12} s={0.8} c="#ffd166" /> : <MiniPlanetG x={x} y={y - 12} s={0.95} c={i === 0 ? "#c084fc" : "#ff7ad9"} />;
  // default: a cherry
  return (
    <g>
      <circle cx={x} cy={y - 7} r="9" style={{ fill: "var(--ck-berry)" }} />
      <circle cx={x - 3} cy={y - 10} r="2.6" fill="#fff" opacity=".7" />
      <path d={`M${x},${y - 15} q3,-8 9,-8`} stroke="#3d9a54" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </g>
  );
}

/* ---------------------------------------------------- extra little things (used by Sorry too) */
export const BearFace = ({ s = 30 }) => (
  <svg viewBox="0 0 40 40" width={s} height={s} aria-hidden>
    <circle cx="9" cy="9" r="6.5" fill="#b9794b" /><circle cx="31" cy="9" r="6.5" fill="#b9794b" /><circle cx="9" cy="9" r="3.4" fill="#f4c8a3" /><circle cx="31" cy="9" r="3.4" fill="#f4c8a3" />
    <circle cx="20" cy="21" r="15" fill="#c98a5a" /><ellipse cx="20" cy="26" rx="7" ry="5.4" fill="#f4d3b0" />
    <circle cx="14.5" cy="18" r="1.8" fill="#3b2418" /><circle cx="25.5" cy="18" r="1.8" fill="#3b2418" /><ellipse cx="20" cy="23.6" rx="2.4" ry="1.7" fill="#3b2418" />
    <path d="M16.5 27.3q3.5 2.6 7 0" stroke="#3b2418" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);
export const Bee = ({ s = 36 }) => (
  <svg viewBox="0 0 48 40" width={s} height={(s * 40) / 48} aria-hidden>
    <ellipse className="bd-wing" cx="19" cy="9" rx="9" ry="6" fill="#dff6ff" stroke="#9fd3ea" strokeWidth="1" opacity=".9" />
    <ellipse className="bd-wing w2" cx="29" cy="9" rx="9" ry="6" fill="#dff6ff" stroke="#9fd3ea" strokeWidth="1" opacity=".9" />
    <ellipse cx="24" cy="23" rx="15" ry="11" fill="#ffd23f" /><path d="M16 13v20M24 12v22M32 13v20" stroke="#2b1b16" strokeWidth="4" />
    <circle cx="38" cy="22" r="6" fill="#ffd23f" /><circle cx="40" cy="21" r="1.3" fill="#2b1b16" /><path d="M36 15q2-5 5-5M40 16q3-4 6-3" stroke="#2b1b16" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);
export const PuzzleSvg = ({ c = "#00a896", s = 34 }) => (
  <svg viewBox="0 0 40 40" width={s} height={s} aria-hidden>
    <path d="M6 8h10a4 4 0 1 1 8 0h10v10a4 4 0 1 0 0 8v10H24a4 4 0 1 0-8 0H6V26a4 4 0 1 1 0-8Z" fill={c} stroke="rgba(0,0,0,.16)" strokeWidth="1" strokeLinejoin="round" />
    <path d="M10 12h6" stroke="#fff" strokeOpacity=".5" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const ButterflyFloat = ({ c = "#e0558a", s = 40 }) => (
  <svg viewBox="0 0 60 44" width={s} height={(s * 44) / 60} aria-hidden>
    <g className="bd-flutter"><path d="M30 22C22 6 6 4 4 14c-2 10 12 14 26 8Z" fill={c} opacity=".92" /><path d="M30 22C22 38 10 42 8 34c-1-7 10-10 22-12Z" fill={c} opacity=".75" /></g>
    <g className="bd-flutter r"><path d="M30 22C38 6 54 4 56 14c2 10-12 14-26 8Z" fill={c} opacity=".92" /><path d="M30 22C38 38 50 42 52 34c1-7-10-10-22-12Z" fill={c} opacity=".75" /></g>
    <ellipse cx="30" cy="22" rx="2.4" ry="10" fill="#3b2a30" /><path d="M30 13q-4-8-8-9M30 13q4-8 8-9" stroke="#3b2a30" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);
