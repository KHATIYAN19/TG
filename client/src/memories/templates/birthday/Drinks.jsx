import { useId, useRef, useState } from "react";
import { track } from "../../track";

/*
  THE DRINKS BAR: pick a drink, pour it (three taps fill the glass), then clink glasses with the sender.
  The glass is one SVG; the drink is a rectangle that rises behind the glass outline, with bubbles and a straw on top.
*/
const DRINKS = [
  { id: "mocktail", name: "Sunset mocktail", a: "#ff8a3d", b: "#ff3d7f", garnish: "🍊" },
  { id: "cola", name: "Ice cold cola", a: "#6b3a22", b: "#2a1208", garnish: "🧊" },
  { id: "shake", name: "Strawberry shake", a: "#ffb3cf", b: "#ff6fa5", garnish: "🍓" },
  { id: "bubbly", name: "Sparkling bubbly", a: "#ffe9a8", b: "#f2c14e", garnish: "🍒" },
  { id: "mint", name: "Mint cooler", a: "#b8f2c9", b: "#3fbf8f", garnish: "🍃" },
];
const FULL = 3;
const TOP = 34;
const BOTTOM = 150;

function Glass({ drink, level, uid, bubbles = true }) {
  const h = ((BOTTOM - TOP) * level) / FULL;
  return (
    <svg viewBox="0 0 120 170" className="pt-glass" aria-hidden focusable="false">
      <defs>
        <clipPath id={`${uid}-in`}><path d="M24,22 L96,22 L86,150 Q85,158 77,158 L43,158 Q35,158 34,150 Z" /></clipPath>
        <linearGradient id={`${uid}-liq`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor={drink.a} /><stop offset="1" stopColor={drink.b} /></linearGradient>
      </defs>
      <ellipse cx="60" cy="162" rx="34" ry="5" fill="#000" opacity=".14" />
      <g clipPath={`url(#${uid}-in)`}>
        <rect className="pt-liq" x="14" y={BOTTOM + 8 - h} width="92" height={h + 8} fill={`url(#${uid}-liq)`} />
        {level > 0 && <rect className="pt-liq" x="14" y={BOTTOM + 8 - h} width="92" height="7" fill="#fff" opacity=".45" />}
        {bubbles && level > 0 && [34, 48, 62, 76, 56, 70].map((x, i) => <circle key={i} className="pt-bub" cx={x} cy="150" r={1.6 + (i % 3)} fill="#fff" opacity=".6" style={{ animationDelay: `${i * 0.37}s` }} />)}
      </g>
      <path d="M24,22 L96,22 L86,150 Q85,158 77,158 L43,158 Q35,158 34,150 Z" fill="rgba(255,255,255,.16)" stroke="rgba(255,255,255,.9)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M32,30 L38,140" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity=".55" />
      {level >= FULL && <path className="pt-straw" d="M70,150 L84,4 L100,0" fill="none" stroke="var(--bd-accent)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />}
      {level >= FULL && <text className="pt-garnish" x="26" y="26" fontSize="26" textAnchor="middle">{drink.garnish}</text>}
    </svg>
  );
}

export default function Drinks({ sender, toast, fx, sound }) {
  const uid = useId().replace(/:/g, "");
  const [drink, setDrink] = useState(DRINKS[0]);
  const [level, setLevel] = useState(0);
  const [clink, setClink] = useState(0); // counts the toasts, and restarts the clink animation
  const [cheered, setCheered] = useState(false);
  const stage = useRef(null);

  const choose = (d) => { setDrink(d); setLevel(0); setCheered(false); sound?.sfx.tick(); };
  const pour = () => {
    if (level >= FULL) return;
    sound?.sfx.pour();
    try { navigator.vibrate?.(12); } catch { /* not supported */ }
    setLevel((l) => { if (l + 1 === FULL) setTimeout(() => sound?.sfx.fizz(), 500); return l + 1; });
  };
  const cheers = () => {
    setCheered(true);
    setClink((n) => n + 1);
    track("cheers", { drink: drink.name });
    setTimeout(() => {
      sound?.sfx.clink();
      const r = stage.current?.getBoundingClientRect();
      if (r) { fx?.sparkle(r.left + r.width / 2, r.top + r.height * 0.3, { n: 26 }); fx?.confetti(r.left + r.width / 2, r.top + r.height * 0.3, { n: 46, power: 420 }); }
    }, 420);
  };
  const again = () => { setLevel(0); setCheered(false); sound?.sfx.rustle(); };

  const full = level >= FULL;
  return (
    <div className="pt-bar mem-reveal">
      <div className="pt-menu" role="radiogroup" aria-label="Pick a drink">
        {DRINKS.map((d) => (
          <button key={d.id} type="button" role="radio" aria-checked={drink.id === d.id} className={`pt-drink ${drink.id === d.id ? "on" : ""}`} onClick={() => choose(d)}>
            <i style={{ background: `linear-gradient(160deg, ${d.a}, ${d.b})` }} aria-hidden /> {d.name}
          </button>
        ))}
      </div>

      <div ref={stage} className={`pt-glasses ${cheered ? "clink" : ""}`} key={clink}>
        <div className="pt-glass-wrap mine"><Glass drink={drink} level={level} uid={`${uid}a`} /><span>You</span></div>
        {cheered && <div className="pt-glass-wrap theirs"><Glass drink={drink} level={FULL} uid={`${uid}b`} bubbles={false} /><span>{sender}</span></div>}
        {cheered && <b className="pt-cheers">Cheers!</b>}
      </div>

      <p className="pt-bar-line" aria-live="polite">
        {cheered ? toast : full ? "Full to the top. Raise your glass!" : level === 0 ? `One ${drink.name.toLowerCase()}, coming up. Tap to pour.` : "Keep pouring…"}
      </p>
      <div className="pt-row">
        {!full && <button type="button" className="bd-btn" onClick={pour}>Pour {level > 0 ? "more" : "my drink"}</button>}
        {full && !cheered && <button type="button" className="bd-btn" onClick={cheers}>Cheers with {sender} 🥂</button>}
        {cheered && <button type="button" className="bd-btn bd-btn-ghost" onClick={again}>Another round</button>}
      </div>
    </div>
  );
}
