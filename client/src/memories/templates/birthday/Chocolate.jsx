import { useRef, useState } from "react";
import { track } from "../../track";

/*
  CHOCOLATE: peel the foil, then bite. The first tap takes a crunchy bite out of a square (it cracks
  and crumbs fly), the second tap finishes it.
*/
const TOTAL = 12;
const WORDS = ["Yum!", "Crunch!", "So good!", "Mmm!", "Sweet!"];

export default function Chocolate({ fx, sound, onBite }) {
  const [sq, setSq] = useState(() => Array(TOTAL).fill(0)); // 0 whole, 1 bitten, 2 gone
  const [peeled, setPeeled] = useState(false);
  const [yums, setYums] = useState([]);
  const n = useRef(0);
  const eaten = sq.filter((v) => v === 2).length;

  const bite = (i, e) => {
    if (!peeled) { setPeeled(true); sound?.sfx.rustle(); return; }
    if (sq[i] === 2) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    sound?.sfx.crunch();
    onBite?.();
    track("chocolate_bite");
    fx?.crumbs(x, y, "#6b3a22", 12);
    fx?.crumbs(x, y, "#a8683f", 6);
    try { navigator.vibrate?.(10); } catch { /* not supported */ }
    const id = ++n.current;
    setYums((y0) => [...y0, { id, x, y: r.top, t: WORDS[id % WORDS.length] }]);
    setTimeout(() => setYums((y0) => y0.filter((q) => q.id !== id)), 1250);
    setSq((s) => s.map((v, k) => (k === i ? v + 1 : v)));
    if (sq.filter((v) => v === 2).length + (sq[i] === 1 ? 1 : 0) === TOTAL) {
      setTimeout(() => { fx?.hearts(window.innerWidth / 2, window.innerHeight * 0.6, 22); sound?.sfx.tada(); }, 250);
    }
  };

  const reset = () => { setSq(Array(TOTAL).fill(0)); setPeeled(false); sound?.sfx.rustle(); };

  return (
    <>
      <div className={`bd-choco ${peeled ? "peeled" : ""}`}>
        <div className="bd-foil" aria-hidden>Tap to unwrap</div>
        <div className="bd-choco-grid" role="group" aria-label="Chocolate bar">
          {sq.map((v, i) => (
            <button key={i} type="button" className={`bd-sq ${v === 1 ? "bitten" : ""} ${v === 2 ? "gone" : ""}`} onClick={(e) => bite(i, e)} aria-label={peeled ? (v === 1 ? "Finish this square" : "Bite this square") : "Unwrap the chocolate"} />
          ))}
        </div>
      </div>
      {yums.map((y) => <span key={y.id} className="bd-yum" style={{ left: y.x, top: y.y }}>{y.t}</span>)}
      <div className="bd-counter" aria-live="polite">
        <span>
          {eaten === TOTAL ? "All gone! Sweet tooth 🍫" : peeled ? `${eaten} of ${TOTAL} squares eaten` : "Tap the bar to unwrap it"}
          {eaten === TOTAL && <button type="button" onClick={reset} style={{ marginLeft: 10, color: "var(--bd-accent)", fontWeight: 700 }}>New bar</button>}
        </span>
      </div>
    </>
  );
}
