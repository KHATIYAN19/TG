import { useId } from "react";

import { RoseDefs, RoseG } from "../birthday/decor";

/* =====================================================
   ANNIVERSARY ART: doves, butterflies, a champagne pair, candles, a couple, and real-looking flowers.
   Flower heads are drawn around (0,0) so the bouquet builder can place them anywhere.
===================================================== */

export function Dove({ className, flip }) {
  return (
    <svg className={className} viewBox="0 0 120 80" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <g className="an-wingback"><path d="M52 40C40 24 24 14 6 12c8 12 18 24 34 32Z" fill="#e9eefc" stroke="#c4cff0" strokeWidth="1" /></g>
      <path d="M30 46C38 30 62 28 80 36c10-8 22-6 28 2-6 2-8 6-14 8-6 16-30 26-48 14-6-2-12-8-16-14Z" fill="#fff" stroke="#d7def5" strokeWidth="1.2" />
      <path d="M30 46c-8 2-18 0-26-6 10-2 18-2 26 6Z" fill="#fff" stroke="#d7def5" strokeWidth="1" />
      <g className="an-wingfront"><path d="M64 38C58 18 40 4 16 2c6 16 18 32 40 44Z" fill="#fff" stroke="#cfd8f3" strokeWidth="1.2" /><path d="M54 30C46 18 34 10 20 6M60 36C50 22 40 14 28 10" stroke="#dfe5f8" strokeWidth="1.2" fill="none" /></g>
      <circle cx="98" cy="36" r="2" fill="#2b1b16" /><path d="M106 38l10 3-10 3Z" fill="#ffb347" />
      <path d="M72 18c4-6 10-6 14-2-4 0-8 2-10 6" fill="#ff6b9d" opacity="0" />
    </svg>
  );
}

export const ButterflyArt = ({ c = "#e0558a", c2 = "#ffb3cc", s = 46 }) => (
  <svg viewBox="0 0 60 48" width={s} height={(s * 48) / 60} aria-hidden>
    <g className="bd-flutter"><path d="M30 24C20 4 4 2 3 14c-1 12 14 14 27 10Z" fill={c} /><path d="M30 24C20 42 8 46 7 37c-1-8 10-11 23-13Z" fill={c2} /><circle cx="14" cy="14" r="4" fill="#fff" opacity=".55" /></g>
    <g className="bd-flutter r"><path d="M30 24C40 4 56 2 57 14c1 12-14 14-27 10Z" fill={c} /><path d="M30 24C40 42 52 46 53 37c1-8-10-11-23-13Z" fill={c2} /><circle cx="46" cy="14" r="4" fill="#fff" opacity=".55" /></g>
    <ellipse cx="30" cy="24" rx="2.6" ry="11" fill="#3b2a30" /><path d="M30 13q-4-9-9-10M30 13q4-9 9-10" stroke="#3b2a30" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </svg>
);

/* two champagne flutes that can tilt toward each other */
export function Flute({ className, style, fill = "#fff2b0" }) {
  return (
    <svg className={className} style={style} viewBox="0 0 60 150" aria-hidden>
      <defs><linearGradient id="an-glass" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity=".7" /><stop offset=".5" stopColor="#fff" stopOpacity=".15" /><stop offset="1" stopColor="#fff" stopOpacity=".55" /></linearGradient></defs>
      <path d="M12 6h36l-3 56c-1 12-7 18-15 18s-14-6-15-18Z" fill="url(#an-glass)" stroke="rgba(90,50,70,.42)" strokeWidth="2" />
      <path d="M15 28h30l-1.6 34c-.7 10-5.4 15-13.4 15s-12.7-5-13.4-15Z" fill={fill} opacity=".9" />
      {[[26, 56, 2.2], [34, 46, 1.8], [30, 64, 1.6], [38, 58, 2], [24, 40, 1.5]].map(([x, y, r], i) => <circle key={i} className="an-bubble" cx={x} cy={y} r={r} fill="#fff" opacity=".85" style={{ animationDelay: `${i * 0.45}s` }} />)}
      <rect x="28" y="80" width="4" height="48" rx="1" fill="rgba(255,255,255,.8)" stroke="rgba(90,50,70,.35)" /><ellipse cx="30" cy="136" rx="20" ry="5" fill="rgba(255,255,255,.8)" stroke="rgba(90,50,70,.38)" strokeWidth="2" />
    </svg>
  );
}

export function Candle({ h = 70, c = "#fff4e2", flame = true, className }) {
  return (
    <svg className={className} viewBox="0 0 40 140" aria-hidden>
      <defs><radialGradient id="an-cg"><stop offset="0" stopColor="#ffe9a0" stopOpacity=".95" /><stop offset="1" stopColor="#ffe9a0" stopOpacity="0" /></radialGradient></defs>
      {flame && <circle className="ck-glow" cx="20" cy={140 - h - 24} r="26" fill="url(#an-cg)" />}
      <rect x="9" y={140 - h} width="22" height={h} rx="4" fill={c} stroke="rgba(0,0,0,.1)" /><rect x="9" y={140 - h} width="7" height={h} rx="3.5" fill="#fff" opacity=".55" />
      <path d={`M20,${140 - h} v-7`} stroke="#3b2a22" strokeWidth="1.8" strokeLinecap="round" />
      {flame && <path className="ck-flame" d={`M20,${140 - h - 30} C28,${140 - h - 20} 26,${140 - h - 8} 20,${140 - h - 6} C14,${140 - h - 8} 12,${140 - h - 20} 20,${140 - h - 30}Z`} fill="#ffb300" />}
      {flame && <path className="ck-flame" d={`M20,${140 - h - 20} C24,${140 - h - 15} 23,${140 - h - 9} 20,${140 - h - 8} C17,${140 - h - 9} 16,${140 - h - 15} 20,${140 - h - 20}Z`} fill="#fff3b0" />}
    </svg>
  );
}

/** A couple holding hands. `silhouette` = a dark cut-out for sunsets. */
export function Couple({ className, silhouette, heart = true }) {
  const skin1 = silhouette ? "#2b1740" : "#f6c9a0";
  const skin2 = silhouette ? "#2b1740" : "#c98a5e";
  const hair1 = silhouette ? "#2b1740" : "#2c1a12";
  const hair2 = silhouette ? "#2b1740" : "#4a2b1c";
  const dress = silhouette ? "#2b1740" : "#e11d48";
  const suit = silhouette ? "#2b1740" : "#2d3a63";
  return (
    <svg className={className} viewBox="0 0 220 230" aria-hidden>
      {!silhouette && <ellipse cx="110" cy="222" rx="80" ry="7" fill="#000" opacity=".14" />}
      {/* him */}
      <rect x="50" y="108" width="60" height="104" rx="22" fill={suit} />
      <circle cx="80" cy="78" r="30" fill={skin2} /><path d="M50 74c-4-34 56-34 60 0-8-14-20-20-30-20s-22 6-30 20Z" fill={hair2} />
      {!silhouette && <><circle cx="70" cy="80" r="3" fill="#2b1b16" /><circle cx="90" cy="80" r="3" fill="#2b1b16" /><path d="M71 92q9 8 18 0" stroke="#2b1b16" strokeWidth="2.4" fill="none" strokeLinecap="round" /><circle cx="62" cy="90" r="5" fill="#ff7a9a" opacity=".4" /><circle cx="98" cy="90" r="5" fill="#ff7a9a" opacity=".4" /></>}
      {/* her */}
      <path d="M116 112c0-8 8-14 22-14s22 6 22 14l12 100H104Z" fill={dress} />
      <circle cx="138" cy="78" r="30" fill={skin1} /><path d="M106 80c-6-44 66-44 64 0 0 20 6 30 10 36-12 2-18-6-18-20-8-6-18-8-26-8s-18 2-26 8c0 14-6 22-18 20 4-6 14-16 14-36Z" fill={hair1} />
      {!silhouette && <><circle cx="128" cy="80" r="3" fill="#2b1b16" /><circle cx="148" cy="80" r="3" fill="#2b1b16" /><path d="M129 92q9 8 18 0" stroke="#2b1b16" strokeWidth="2.4" fill="none" strokeLinecap="round" /><circle cx="120" cy="90" r="5" fill="#ff7a9a" opacity=".45" /><circle cx="156" cy="90" r="5" fill="#ff7a9a" opacity=".45" /></>}
      {/* holding hands */}
      <path d="M108 150Q112 168 116 150" stroke={silhouette ? "#2b1740" : "#f6c9a0"} strokeWidth="10" strokeLinecap="round" fill="none" />
      {heart && <path className="an-beat" d="M110 42C98 32 94 24 100 18c5-4 10-2 10 4 0-6 5-8 10-4 6 6 2 14-10 24Z" fill={silhouette ? "#ff9fb2" : "#ff4d7e"} />}
    </svg>
  );
}

/* ---------------------------------------------------- flowers (heads centred on 0,0) */
const ROSE_TONES = { red: "red", pink: "pink", white: "white" };

export const FLOWERS = [
  { id: "rose-red", name: "Red rose", swatch: "#d81e48", filler: false },
  { id: "rose-pink", name: "Pink rose", swatch: "#ff7fa6", filler: false },
  { id: "tulip", name: "Tulip", swatch: "#ff8fb1", filler: false },
  { id: "peony", name: "Peony", swatch: "#ffb3cf", filler: false },
  { id: "lily", name: "Lily", swatch: "#fff0f5", filler: false },
  { id: "daisy", name: "Daisy", swatch: "#ffe27a", filler: false },
  { id: "lavender", name: "Lavender", swatch: "#a78bfa", filler: true },
];

export function FlowerHead({ type, uid, s = 1 }) {
  switch (type) {
    case "rose-red": return <RoseG s={0.9 * s} tone={ROSE_TONES.red} uid={uid} />;
    case "rose-pink": return <RoseG s={0.9 * s} rot={20} tone={ROSE_TONES.pink} uid={uid} />;
    case "tulip":
      return (
        <g transform={`scale(${s})`}>
          <path d="M0,-34 C-16,-32 -22,-8 0,12 C22,-8 16,-32 0,-34Z" fill="#ff7aa3" stroke="#c43b6d" strokeOpacity=".4" />
          <path d="M-4,-30 C-24,-28 -26,0 -2,12 C-12,-4 -14,-20 -4,-30Z" fill="#ff9bbb" stroke="#c43b6d" strokeOpacity=".35" />
          <path d="M4,-30 C24,-28 26,0 2,12 C12,-4 14,-20 4,-30Z" fill="#ff5f92" stroke="#c43b6d" strokeOpacity=".35" />
          <path d="M-8,-26 C-12,-14 -10,-4 -4,4" stroke="#fff" strokeOpacity=".5" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "peony":
      return (
        <g transform={`scale(${s})`}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => <circle key={`a${i}`} cx={Math.cos((i / 7) * 6.283) * 20} cy={Math.sin((i / 7) * 6.283) * 20} r="17" fill="#ffc2d8" stroke="#e58fb0" strokeOpacity=".5" />)}
          {[0, 1, 2, 3, 4, 5].map((i) => <circle key={`b${i}`} cx={Math.cos((i / 6) * 6.283 + 0.4) * 12} cy={Math.sin((i / 6) * 6.283 + 0.4) * 12} r="14" fill="#ffd3e3" stroke="#e58fb0" strokeOpacity=".5" />)}
          {[0, 1, 2, 3, 4].map((i) => <circle key={`c${i}`} cx={Math.cos((i / 5) * 6.283 + 1) * 6} cy={Math.sin((i / 5) * 6.283 + 1) * 6} r="9" fill="#ffe3ee" stroke="#e58fb0" strokeOpacity=".45" />)}
          <circle r="5" fill="#ffb3cf" /><circle cx="-12" cy="-14" r="6" fill="#fff" opacity=".35" />
        </g>
      );
    case "lily":
      return (
        <g transform={`scale(${s})`}>
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d="M0,0 C-9,-14 -7,-32 0,-42 C7,-32 9,-14 0,0Z" transform={`rotate(${i * 60 + (i % 2 ? 0 : 8)})`} fill={i % 2 ? "#fff6f9" : "#ffe3ec"} stroke="#e8a4bc" strokeOpacity=".55" />)}
          {[0, 1, 2, 3, 4, 5].map((i) => <path key={`v${i}`} d="M0,-4 L0,-26" transform={`rotate(${i * 60 + (i % 2 ? 0 : 8)})`} stroke="#f0a6c2" strokeWidth="1.6" strokeLinecap="round" />)}
          {[0, 1, 2, 3, 4].map((i) => <g key={`s${i}`} transform={`rotate(${i * 72})`}><path d="M0,0 L0,-17" stroke="#e8c36a" strokeWidth="1.4" /><ellipse cx="0" cy="-19" rx="2.2" ry="3.6" fill="#d9822b" /></g>)}
          <circle r="3.4" fill="#c8e08a" />
        </g>
      );
    case "daisy":
      return (
        <g transform={`scale(${s})`}>
          {Array.from({ length: 16 }, (_, i) => <ellipse key={i} cx="0" cy="-22" rx="6" ry="15" transform={`rotate(${i * 22.5})`} fill="#fff" stroke="#e0dccc" strokeWidth=".8" />)}
          <circle r="11" fill="#ffc93d" stroke="#e0a100" strokeWidth="1.4" /><circle cx="-3" cy="-3" r="4" fill="#ffe27a" />
        </g>
      );
    case "lavender":
      return (
        <g transform={`scale(${s})`}>
          {Array.from({ length: 11 }, (_, i) => <g key={i}><ellipse cx={-4 - (i % 2) * 2} cy={-6 - i * 5.4} rx="4.4" ry="3.2" fill={i % 3 ? "#a78bfa" : "#c4b5fd"} /><ellipse cx={4 + (i % 2) * 2} cy={-9 - i * 5.4} rx="4.4" ry="3.2" fill={i % 3 ? "#8b6bf0" : "#b9a3fb"} /></g>)}
        </g>
      );
    default:
      return null;
  }
}

/** A small flower for rows and borders: head + stem */
export function FlowerSprig({ type = "tulip", className, style }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg className={className} style={style} viewBox="-40 -50 80 160" aria-hidden>
      <defs><RoseDefs uid={uid} /></defs>
      <path d="M0,0 C-3,40 3,70 0,108" stroke="#2f8f46" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M0,0 C10,-14 30,-18 42,-8 C30,6 10,8 0,0Z" fill="#3a9a52" transform="translate(0 70) rotate(-35) scale(.7)" />
      <path d="M0,0 C10,-14 30,-18 42,-8 C30,6 10,8 0,0Z" fill="#46aa5f" transform="translate(0 84) rotate(-145) scale(.7)" />
      <FlowerHead type={type} uid={uid} s={0.85} />
    </svg>
  );
}
