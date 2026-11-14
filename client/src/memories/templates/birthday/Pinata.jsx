import { useRef, useState } from "react";
import { track } from "../../track";

/*
  THE PINATA: a striped star on a rope. Every tap is a whack: it swings harder and loses a little confetti.
  After five whacks it bursts into sweets and a fortune for the year ahead drops out. "Hang another" starts again
  with the next fortune.
*/
const HITS = 5;
const SWEETS = ["🍬", "🍭", "🍫", "🍡", "🧁", "🍩", "🍪", "⭐"];
const STRIPES = ["var(--gift-1)", "var(--gift-2)", "var(--gift-3)", "var(--gift-4)"];

export default function Pinata({ fortunes, fx, sound }) {
  const [hits, setHits] = useState(0);
  const [swing, setSwing] = useState(0);
  const [round, setRound] = useState(0);
  const ref = useRef(null);
  const burst = hits >= HITS;
  const fortune = fortunes[round % fortunes.length];

  const whack = () => {
    if (burst) return;
    const r = ref.current.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height * 0.6;
    const next = hits + 1;
    sound?.sfx.whack();
    try { navigator.vibrate?.(next === HITS ? [30, 40, 60] : 18); } catch { /* not supported */ }
    setSwing((n) => n + 1);
    setHits(next);
    fx?.confetti(x, y, { n: 14 + next * 6, power: 380, spread: Math.PI * 1.6 });
    if (next === HITS) {
      track("pinata");
      track("fortune", { text: fortune });
      sound?.sfx.bang();
      setTimeout(() => sound?.sfx.tada(), 250);
      fx?.confetti(x, y, { n: 160, power: 720 });
      fx?.sparkle(x, y, { n: 30 });
      fx?.rain(1600);
    }
  };

  const again = () => { setHits(0); setRound((n) => n + 1); sound?.sfx.rustle(); };

  return (
    <div className="pt-pin mem-reveal">
      <div className="pt-pin-stage">
        {!burst && (
          <button ref={ref} type="button" className="pt-pin-btn" onClick={whack} aria-label={`Hit the pinata. ${HITS - hits} more to break it`} style={{ "--amp": `${8 + hits * 7}deg` }}>
            <span className="pt-pin-swing" key={swing} data-hit={swing > 0 || undefined}>
              <i className="pt-pin-rope" aria-hidden />
              <svg viewBox="0 0 200 200" aria-hidden focusable="false">
                <defs><clipPath id="pt-pin-star"><path d="M100,8 L124,70 L190,74 L138,116 L156,182 L100,146 L44,182 L62,116 L10,74 L76,70 Z" /></clipPath></defs>
                <g clipPath="url(#pt-pin-star)">
                  {Array.from({ length: 10 }, (_, i) => <rect key={i} x="0" y={i * 20} width="200" height="20" style={{ fill: STRIPES[i % STRIPES.length] }} />)}
                  {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M0,${i * 20 + 20} ${Array.from({ length: 20 }, (__, k) => `l5,${k % 2 ? -5 : 5}`).join(" ")}`} fill="none" stroke="#fff" strokeWidth="2" opacity=".5" />)}
                </g>
                <path d="M100,8 L124,70 L190,74 L138,116 L156,182 L100,146 L44,182 L62,116 L10,74 L76,70 Z" fill="none" stroke="rgba(0,0,0,.14)" strokeWidth="3" strokeLinejoin="round" />
                <circle cx="84" cy="96" r="7" fill="#fff" /><circle cx="116" cy="96" r="7" fill="#fff" />
                <circle cx="85" cy="97" r="3.4" fill="#2b1631" /><circle cx="117" cy="97" r="3.4" fill="#2b1631" />
                <path d={hits >= 3 ? "M88,120 q12,-8 24,0" : "M88,116 q12,10 24,0"} fill="none" stroke="#2b1631" strokeWidth="3.4" strokeLinecap="round" />
                {Array.from({ length: hits }, (_, i) => <path key={i} d={[["M60,60 l14,10 l-8,8 l12,12"], ["M140,58 l-10,14 l10,6 l-8,14"], ["M100,150 l-6,-16 l10,-4 l-6,-14"], ["M52,128 l16,-6 l2,10 l14,-4"]][i % 4][0]} fill="none" stroke="#2b1631" strokeWidth="2.4" strokeLinecap="round" opacity=".55" />)}
              </svg>
            </span>
          </button>
        )}
        {burst && (
          <div className="pt-fortune" role="status">
            {SWEETS.map((s, i) => <i key={i} className="pt-sweet" style={{ "--a": `${(i / SWEETS.length) * 360}deg`, "--d": `${i * 0.05}s` }} aria-hidden>{s}</i>)}
            <span className="pt-fortune-kick">Your birthday fortune</span>
            <b>{fortune}</b>
          </div>
        )}
      </div>
      <div className="pt-pin-meter" aria-hidden>{Array.from({ length: HITS }, (_, i) => <i key={i} className={i < hits ? "on" : ""} />)}</div>
      <p className="pt-bar-line" aria-live="polite">{burst ? "Sweets everywhere! That fortune is yours to keep." : hits === 0 ? "Tap the pinata to whack it" : `${HITS - hits} more ${HITS - hits === 1 ? "whack" : "whacks"} to go!`}</p>
      {burst && <div className="pt-row"><button type="button" className="bd-btn bd-btn-ghost" onClick={again}>Hang another pinata</button></div>}
    </div>
  );
}
