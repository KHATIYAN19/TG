import { useEffect, useMemo, useState } from "react";
import { ThankLeaf } from "./art";
import { track } from "../../track";

/*
  THE GRATITUDE TREE: every thing the sender is thankful for is a leaf. Tap a leaf: it reads out, then
  drifts down onto the pile. Find them all.
*/
const place = (i, n) => {
  const a = i * 2.399963 + 0.6; // golden angle
  const r = Math.sqrt((i + 0.6) / (n + 0.2));
  return { x: 50 + Math.cos(a) * r * 38, y: 33 + Math.sin(a) * r * 24, rot: ((i * 53) % 90) - 45, c: (i % 4) + 1 };
};

export default function GratitudeTree({ reasons, fx, sound, onAll }) {
  const spots = useMemo(() => reasons.map((_, i) => place(i, reasons.length)), [reasons]);
  const [found, setFound] = useState([]); // indexes in the order found
  const [note, setNote] = useState(null);
  useEffect(() => { setFound([]); setNote(null); }, [reasons.length]);

  const pick = (i, e) => {
    if (found.includes(i)) { setNote(i); return; }
    const next = [...found, i];
    setFound(next);
    setNote(i);
    track("leaf", { i, text: reasons[i] });
    sound?.sfx.rustle();
    const r = e.currentTarget.getBoundingClientRect();
    fx?.sparkle?.(r.left + r.width / 2, r.top + r.height / 2);
    if (next.length === reasons.length) setTimeout(() => { sound?.sfx.chime(); const { W, H } = fx?.size() || { W: 400, H: 700 }; fx?.confetti(W / 2, H * 0.5, { n: 70, power: 540 }); onAll?.(); }, 500);
  };

  const done = found.length === reasons.length;
  return (
    <div className="th-tree-wrap">
      <div className="th-tree" role="group" aria-label="Gratitude tree">
        <svg className="th-tree-svg" viewBox="0 0 320 300" aria-hidden>
          <ellipse cx="160" cy="288" rx="120" ry="9" fill="#000" opacity=".12" />
          <path d="M146 288 C150 240 148 200 142 170 C130 160 112 150 98 150 M174 288 C170 240 174 200 180 170 C192 160 210 150 224 150 M160 190 C160 170 160 150 160 130" fill="none" stroke="#6b3f22" strokeWidth="14" strokeLinecap="round" />
          <path d="M146 288 L174 288 C172 250 170 214 164 180 L156 180 C150 214 148 250 146 288Z" fill="#6b3f22" />
          <g opacity=".5"><circle cx="86" cy="110" r="52" fill="var(--bd-accent-2)" opacity=".5" /><circle cx="234" cy="110" r="52" fill="var(--bd-accent-2)" opacity=".5" /><circle cx="160" cy="62" r="62" fill="var(--bd-accent)" opacity=".4" /><circle cx="120" cy="84" r="50" fill="var(--bd-accent)" opacity=".34" /><circle cx="200" cy="84" r="50" fill="var(--bd-accent)" opacity=".34" /><circle cx="160" cy="112" r="56" fill="var(--bd-accent-2)" opacity=".45" /></g>
        </svg>
        {reasons.map((r, i) => {
          const s = spots[i]; const got = found.includes(i);
          return (
            <button key={i} type="button" className={`th-leaf-btn ${got ? "got" : ""}`} style={{ left: `${s.x}%`, top: `${s.y}%`, "--rot": `${s.rot}deg`, "--fall-x": `${((i * 37) % 60) - 30}px`, "--fall-r": `${(i % 2 ? 1 : -1) * 70}deg`, "--n": i }} onClick={(e) => pick(i, e)} aria-label={got ? `Leaf ${i + 1}: ${r}` : `Reveal leaf ${i + 1}`}>
              <ThankLeaf className="th-leaf" style={{ "--c": `var(--th-leaf-${s.c})` }} c={`var(--th-leaf-${s.c})`} />
            </button>
          );
        })}
        <div className="th-pile" aria-hidden>
          {found.map((i, k) => <ThankLeaf key={i} className="th-pile-leaf" c={`var(--th-leaf-${spots[i].c})`} style={{ left: `${14 + ((k * 29) % 72)}%`, transform: `rotate(${(k * 67) % 180}deg)`, bottom: `${(k * 5) % 14}px` }} />)}
        </div>
      </div>
      <div className="th-note" aria-live="polite">
        {note == null ? <p className="th-note-hint">{reasons.length} leaves are hiding a thank-you each. Tap one.</p> : <p key={note} className="th-note-text">&ldquo;{reasons[note]}&rdquo;</p>}
        <small>{done ? "You found them all. And there is so much more." : `${found.length} of ${reasons.length} found`}</small>
      </div>
    </div>
  );
}
