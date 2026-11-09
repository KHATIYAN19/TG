import { useMemo } from "react";

import { Bouquet, HeartGarland, Hanging, RoseSprig, Sun, Wave } from "../birthday/decor";
import { ButterflyArt, Candle, Couple, Dove, Flute, FlowerSprig } from "./art";

/* =====================================================
   ANNIVERSARY HERO SCENERY: each theme has its own scene behind the title.
===================================================== */
const rnd = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

/* a string of glowing bulbs */
function FairyLights({ colors }) {
  return <Hanging sag={18} height={64} items={Array.from({ length: 16 }, (_, i) => <span key={i} className="an-bulb" style={{ "--c": colors[i % colors.length], animationDelay: `${(i % 7) * 0.35}s` }} />)} />;
}

function GoldCorner({ className }) {
  return (
    <svg className={`an-corner ${className}`} viewBox="0 0 110 110" aria-hidden>
      <g fill="none" stroke="#c9a227" strokeWidth="2.6" strokeLinecap="round">
        <path d="M6,6 C52,6 82,28 82,76 M6,6 C6,52 28,82 76,82" /><path d="M16,16 C44,16 62,30 62,56 M16,16 C16,44 30,62 56,62" strokeWidth="1.8" opacity=".8" />
        <path d="M6,6 C18,30 30,40 56,50 M6,6 C30,18 40,30 50,56" strokeWidth="1.4" opacity=".6" />
      </g>
      <path d="M6,6 l9,-5 l5,9 l-9,5Z" fill="#e8b923" /><circle cx="82" cy="76" r="3.4" fill="#e8b923" /><circle cx="76" cy="82" r="3.4" fill="#e8b923" />
    </svg>
  );
}

function Bokeh() {
  const dots = useMemo(() => { const r = rnd(21); return Array.from({ length: 16 }, () => ({ l: r() * 100, t: r() * 100, s: 30 + r() * 70, d: 6 + r() * 8, dl: -r() * 8, o: 0.12 + r() * 0.22 })); }, []);
  return <div className="an-bokeh" aria-hidden>{dots.map((d, i) => <i key={i} style={{ left: `${d.l}%`, top: `${d.t}%`, width: d.s, height: d.s, opacity: d.o, animationDuration: `${d.d}s`, animationDelay: `${d.dl}s` }} />)}</div>;
}

function Vine({ className }) {
  const leaves = useMemo(() => Array.from({ length: 11 }, (_, i) => { const t = (i + 1) / 12; return { x: 10 + t * 190, y: 6 + Math.sin(t * 3.4) * 26 + t * 30, a: (i % 2 ? 1 : -1) * 55 + (t - 0.5) * 30, s: 0.7 + (1 - t) * 0.5 }; }), []);
  return (
    <svg className={`an-vine ${className}`} viewBox="0 0 220 120" aria-hidden>
      <path d="M0,10 C50,0 110,40 214,64" stroke="#2f8f46" strokeWidth="4" fill="none" strokeLinecap="round" />
      {leaves.map((l, i) => <path key={i} d="M0,0 C6,-10 20,-12 30,-4 C20,6 6,8 0,0Z" transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(${l.s})`} fill={i % 2 ? "#4aa85f" : "#2f9a4e"} stroke="#14502b" strokeOpacity=".25" />)}
      {[[60, 24, "#ff8fb1"], [112, 46, "#ffd35c"], [170, 62, "#ffffff"]].map(([x, y, c], i) => <g key={i} transform={`translate(${x} ${y})`}>{[0, 1, 2, 3, 4].map((k) => <circle key={k} cx={Math.cos(k * 1.2566) * 6} cy={Math.sin(k * 1.2566) * 6} r="5" fill={c} stroke="rgba(0,0,0,.12)" />)}<circle r="3.2" fill="#ffb300" /></g>)}
    </svg>
  );
}

function Birds() {
  return (
    <>
      {[["b1", 8], ["b2", 15], ["b3", 11]].map(([c, w]) => (
        <svg key={c} className={`an-bird ${c}`} viewBox="0 0 30 14" width={w + 14} aria-hidden><path d="M1,8 C6,0 11,2 15,8 C19,2 24,0 29,8" stroke="#4a2a5a" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
      ))}
    </>
  );
}

export function HeroDecorAnn({ theme }) {
  switch (theme.id) {
    case "lovey":
      return (
        <div className="bd-decor" aria-hidden>
          <div className="bd-decor-top"><HeartGarland /></div>
          <Dove className="an-dove d1" />
          <Dove className="an-dove d2" flip />
          <Bouquet className="an-hero-bouquet" />
          <RoseSprig className="bd-sprig left" tone="pink" />
          <RoseSprig className="bd-sprig right" tone="deep" flip />
        </div>
      );
    case "golden":
      return (
        <div className="bd-decor" aria-hidden>
          <GoldCorner className="tl" /><GoldCorner className="tr" /><GoldCorner className="bl" /><GoldCorner className="br" />
          <div className="bd-decor-top"><FairyLights colors={["#ffd966", "#fff1b8", "#ffe08a"]} /></div>
          <div className="an-flutes"><Flute className="an-hero-flute l" /><Flute className="an-hero-flute r" /></div>
        </div>
      );
    case "candlelight":
      return (
        <div className="bd-decor" aria-hidden>
          <Bokeh />
          <div className="bd-decor-top"><FairyLights colors={["#ffc46b", "#ff9a6b", "#ffe0a8", "#ff6b8b"]} /></div>
          <div className="an-candles"><Candle h={58} className="c1" /><Candle h={92} className="c2" /><Candle h={70} className="c3" /></div>
        </div>
      );
    case "garden":
      return (
        <div className="bd-decor" aria-hidden>
          <Vine className="tl" /><Vine className="tr" />
          <span className="an-fly f1 sp"><ButterflyArt c="#e0558a" c2="#ffb3cc" s={44} /></span>
          <span className="an-fly f2 sp"><ButterflyArt c="#8b6bd9" c2="#cdbdfb" s={36} /></span>
          <div className="an-row">{["tulip", "peony", "daisy", "lily", "rose-red", "tulip", "daisy", "peony", "rose-pink"].map((t, i) => <FlowerSprig key={i} type={t} className="an-rowflower" style={{ animationDelay: `${-(i % 4) * 0.9}s` }} />)}</div>
        </div>
      );
    case "sunset":
      return (
        <div className="bd-decor" aria-hidden>
          <Sun className="an-bigsun" />
          <Birds />
          <Couple className="an-silhouette" silhouette heart={false} />
          <Wave color="#ff9a8a" opacity={0.55} speed={12} bottom={-8} />
          <Wave color="#b79cff" opacity={0.6} speed={8} bottom={-16} delay={-3} />
        </div>
      );
    default:
      return null;
  }
}
