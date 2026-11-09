import { useMemo } from "react";

import { Bracelet, Cloud, Hanging, HeartSvg, Moon, PuzzleSvg, RoseSprig, StarSvg, BearFace } from "../birthday/decor";

/* =====================================================
   SORRY DECOR: rain, rainbow, sunflower field, patchwork quilt, drooping roses, night sky...
   `comfort` is 0..100: how much the receiver has cheered the mascot up. Several things react to it.
===================================================== */
const rnd = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

/* the whole page: grey sky + rain while sad, both fade away as the mood lifts */
export function Weather({ comfort }) {
  const drops = useMemo(() => { const r = rnd(7); return Array.from({ length: 56 }, () => ({ left: r() * 100, dur: 0.55 + r() * 0.6, delay: -r() * 2, h: 14 + r() * 22, o: 0.35 + r() * 0.5 })); }, []);
  const sad = Math.max(0, 1 - comfort / 70); // gone by ~70%
  return (
    <>
      <div className="sr-gloom" style={{ opacity: sad }} aria-hidden />
      <div className="sr-rain" style={{ opacity: sad }} aria-hidden>
        {drops.map((d, i) => <i key={i} style={{ left: `${d.left}%`, height: d.h, opacity: d.o, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />)}
      </div>
    </>
  );
}

function Rainbow({ level }) {
  const bands = ["#ef4444", "#f59e0b", "#facc15", "#22c55e", "#3b82f6", "#a855f7"];
  return (
    <svg className="sr-rainbow" viewBox="0 0 400 210" preserveAspectRatio="xMidYMax meet" aria-hidden style={{ opacity: Math.max(0, (level - 0.3) / 0.7) }}>
      {bands.map((c, i) => <path key={c} d={`M${14 + i * 12},210 A${186 - i * 12},${186 - i * 12} 0 0 1 ${386 - i * 12},210`} fill="none" stroke={c} strokeWidth="12" strokeLinecap="round" opacity=".85" />)}
    </svg>
  );
}

function SunflowerRow() {
  const items = useMemo(() => { const r = rnd(5); return Array.from({ length: 9 }, (_, i) => ({ left: (i / 8) * 96 + 1, size: 46 + r() * 36, delay: -r() * 4, flip: r() > 0.5 })); }, []);
  return (
    <div className="sr-field" aria-hidden>
      {items.map((it, i) => (
        <svg key={i} className="sr-sf" viewBox="0 0 60 130" style={{ left: `${it.left}%`, width: it.size, animationDelay: `${it.delay}s` }}>
          <path d="M30,130 C28,100 32,80 30,56" stroke="#2f8f46" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M0,0 C6,-10 20,-13 30,-5 C22,6 8,7 0,0Z" fill="#3a9a52" transform={`translate(29 100) rotate(${it.flip ? -150 : -30})`} />
          {Array.from({ length: 12 }, (_, k) => <ellipse key={k} cx="30" cy="22" rx="6.5" ry="16" transform={`rotate(${k * 30} 30 40)`} fill="#ffd23f" stroke="#e0a100" strokeWidth=".8" />)}
          <circle cx="30" cy="40" r="15" fill="#7a4a1e" /><circle cx="30" cy="40" r="15" fill="none" stroke="#5a3412" strokeWidth="1.5" />
          {[[26, 36], [34, 36], [30, 42], [25, 44], [35, 44], [30, 34]].map(([x, y], k) => <circle key={k} cx={x} cy={y} r=".9" fill="#4a2a0e" opacity=".6" />)}
        </svg>
      ))}
    </div>
  );
}

function Quilt() {
  const tones = ["--gift-1", "--gift-2", "--gift-3", "--gift-4"];
  return (
    <div className="sr-quilt" aria-hidden>
      {Array.from({ length: 14 }, (_, i) => <span key={i} style={{ background: `var(${tones[(i * 3 + (i >> 1)) % 4]})` }} />)}
    </div>
  );
}

const ROSE_COLORS = ["#be123c", "#f472b6", "#fda4af"];

export function HeroDecorSorry({ theme, comfort }) {
  const level = comfort / 100;
  switch (theme.id) {
    case "teddy":
      return (
        <div className="bd-decor" aria-hidden>
          <div className="bd-decor-top"><Hanging sag={22} items={Array.from({ length: 9 }, (_, i) => (i % 2 ? <BearFace key={i} s={30} /> : <HeartSvg key={i} c={["#ff8fa3", "#c2693a", "#f2b84b"][i % 3]} s={26} />))} /></div>
          <Quilt />
        </div>
      );
    case "rain":
      return (
        <div className="bd-decor" aria-hidden>
          <Rainbow level={level} />
          <Cloud className="bd-cloud c1" /><Cloud className="bd-cloud c2" />
        </div>
      );
    case "rose":
      return (
        <div className="bd-decor" aria-hidden>
          <div className="sr-rosecorner left" style={{ rotate: `${(1 - level) * -26}deg`, opacity: 0.55 + level * 0.45 }}><RoseSprig className="sr-rosesprig" tone="red" /></div>
          <div className="sr-rosecorner right" style={{ rotate: `${(1 - level) * 26}deg`, opacity: 0.55 + level * 0.45 }}><RoseSprig className="sr-rosesprig" tone="deep" flip /></div>
        </div>
      );
    case "starry":
      return (
        <div className="bd-decor" aria-hidden>
          <Moon className="bd-moon" />
          <span className="bd-shoot s1" /><span className="bd-shoot s2" /><span className="bd-shoot s3" />
        </div>
      );
    case "sunflower":
      return (
        <div className="bd-decor" aria-hidden>
          <SunflowerRow />
          <span className="sr-flybee b1" /><span className="sr-flybee b2" />
        </div>
      );
    case "friends":
      return (
        <div className="bd-decor" aria-hidden>
          <div className="bd-decor-top"><Hanging sag={20} items={Array.from({ length: 8 }, (_, i) => (i % 3 === 1 ? <StarSvg key={i} c="#ffc233" s={26} /> : <PuzzleSvg key={i} c={["#00a896", "#ff7a45", "#7c5cff", "#ff5c8a"][i % 4]} s={32} />))} /></div>
          <div className="sr-bracelet"><Bracelet /></div>
        </div>
      );
    default:
      return null;
  }
}

export const ROSE_TONES = ROSE_COLORS;
