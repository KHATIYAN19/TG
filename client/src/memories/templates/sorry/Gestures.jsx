import { useEffect, useState } from "react";

import { Bouquet } from "../birthday/decor";

/* =====================================================
   SEND LOVE: roses, a hug and a candle. The big moments are overlays that clean up after themselves.
===================================================== */
export function HugOverlay({ show, onDone, sender, name }) {
  useEffect(() => {
    if (!show) return undefined;
    const t = setTimeout(onDone, 4200);
    return () => clearTimeout(t);
  }, [show, onDone]);
  if (!show) return null;
  return (
    <div className="sr-overlay sr-hug" role="status" onClick={onDone}>
      <div className="sr-hug-glow" aria-hidden />
      <div className="sr-hug-hearts" aria-hidden>
        <svg viewBox="0 0 32 29" className="l"><path d="M16 28C16 28 2 19 2 9.5 2 5 5.5 2 9.5 2 12.3 2 14.8 3.6 16 6 17.2 3.6 19.7 2 22.5 2 26.5 2 30 5 30 9.5 30 19 16 28 16 28Z" fill="var(--bd-accent-2)" /></svg>
        <svg viewBox="0 0 32 29" className="r"><path d="M16 28C16 28 2 19 2 9.5 2 5 5.5 2 9.5 2 12.3 2 14.8 3.6 16 6 17.2 3.6 19.7 2 22.5 2 26.5 2 30 5 30 9.5 30 19 16 28 16 28Z" fill="var(--bd-accent)" /></svg>
      </div>
      <p className="sr-overlay-text"><span className="bd-script">A big, warm hug</span><small>from {sender} to {name}</small></p>
    </div>
  );
}

export function RosesOverlay({ show, onDone, sender }) {
  useEffect(() => {
    if (!show) return undefined;
    const t = setTimeout(onDone, 4600);
    return () => clearTimeout(t);
  }, [show, onDone]);
  if (!show) return null;
  return (
    <div className="sr-overlay sr-roses" role="status" onClick={onDone}>
      <Bouquet className="sr-roses-bouquet" />
      <p className="sr-overlay-text"><span className="bd-script">Roses for you</span><small>with all my love, {sender}</small></p>
    </div>
  );
}

export function Candle({ lit, onLight }) {
  return (
    <button type="button" className={`sr-candle ${lit ? "lit" : ""}`} onClick={onLight} aria-pressed={lit} aria-label={lit ? "The candle is lit" : "Light a candle"}>
      <svg viewBox="0 0 80 120" aria-hidden>
        <defs><radialGradient id="sr-cg"><stop offset="0" stopColor="#ffe9a0" stopOpacity=".95" /><stop offset="1" stopColor="#ffe9a0" stopOpacity="0" /></radialGradient></defs>
        <ellipse cx="40" cy="112" rx="26" ry="5" fill="#000" opacity=".14" />
        <circle className="sr-cglow" cx="40" cy="34" r="34" fill="url(#sr-cg)" />
        <rect x="28" y="50" width="24" height="60" rx="5" fill="#fff6e6" stroke="rgba(0,0,0,.1)" /><rect x="28" y="50" width="8" height="60" rx="4" fill="#fff" opacity=".6" />
        <path d="M40,50 v-8" stroke="#3b2a22" strokeWidth="2" strokeLinecap="round" />
        <path className="ck-flame sr-cflame" d="M40,18 C49,28 47,42 40,44 C33,42 31,28 40,18Z" fill="#ffb300" /><path className="ck-flame sr-cflame" d="M40,28 C44,33 43,40 40,41 C37,40 36,33 40,28Z" fill="#fff3b0" />
        <path className="sr-wisp" d="M40,40 q6,-10 0,-20 q-6,-10 0,-20" fill="none" stroke="rgba(120,110,130,.5)" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <span>{lit ? "Lit for us" : "Light a candle"}</span>
    </button>
  );
}

export function SendLove({ onRoses, onHug, onCandle, sentRoses, sentHug, lit }) {
  const [n, setN] = useState(0); // gentle nudge so a second tap does not feel dead
  return (
    <div className="sr-love" onClick={() => setN((x) => x + 1)} data-n={n}>
      <button type="button" className="sr-love-btn" onClick={onRoses}>
        <span aria-hidden>🌹</span><b>{sentRoses ? "Send roses again" : "Send roses"}</b><small>a bouquet, just for you</small>
      </button>
      <button type="button" className="sr-love-btn" onClick={onHug}>
        <span aria-hidden>🤗</span><b>{sentHug ? "Another hug" : "Send a hug"}</b><small>a big, warm one</small>
      </button>
      <Candle lit={lit} onLight={onCandle} />
    </div>
  );
}
