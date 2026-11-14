import { useEffect, useState } from "react";
import { Ornament, SPOTS, TREE_H, TREE_W, TreeSvg } from "./art";
import { track } from "../../track";

/*
  THE WISHING TREE: every wish / thing the sender wrote is an ornament. Tap one: it swings and its note is read out.
  Find them all and the tree lights up.
*/
export default function ChristmasTree({ reasons, fx, sound, onAll }) {
  const [found, setFound] = useState([]);
  const [note, setNote] = useState(null);
  useEffect(() => { setFound([]); setNote(null); }, [reasons.length]);

  const pick = (i, e) => {
    setNote(i);
    if (found.includes(i)) return;
    const next = [...found, i];
    setFound(next);
    track("ornament", { i, text: reasons[i] });
    sound?.sfx.jingle?.();
    const r = e.currentTarget.getBoundingClientRect();
    fx?.sparkle?.(r.left + r.width / 2, r.top + r.height / 2);
    if (next.length === reasons.length) setTimeout(() => { sound?.sfx.chime(); const { W, H } = fx?.size() || { W: 400, H: 700 }; fx?.confetti(W / 2, H * 0.5, { n: 70, power: 540 }); onAll?.(); }, 500);
  };

  const done = found.length === reasons.length;
  return (
    <div className="xm-tree-wrap">
      <div className={`xm-tree ${done ? "done" : ""}`} role="group" aria-label="Wishing tree">
        <TreeSvg className="xm-tree-svg" />
        {reasons.map((r, i) => {
          const [x, y] = SPOTS[i % SPOTS.length];
          const got = found.includes(i);
          return (
            <button key={i} type="button" className={`xm-orn ${got ? "got" : ""} ${note === i ? "cur" : ""}`} style={{ left: `${(x / TREE_W) * 100}%`, top: `${(y / TREE_H) * 100}%`, "--n": i }} onClick={(e) => pick(i, e)} aria-label={got ? `Ornament ${i + 1}: ${r}` : `Open ornament ${i + 1}`}>
              <Ornament n={(i % 4) + 1} className="xm-orn-svg" />
            </button>
          );
        })}
      </div>
      <div className="xm-note" aria-live="polite">
        {note == null ? <p className="xm-note-hint">{reasons.length} ornaments are hiding a wish each. Tap one.</p> : <p key={note} className="xm-note-text">&ldquo;{reasons[note]}&rdquo;</p>}
        <small>{done ? "You found every wish. The tree is glowing." : `${found.length} of ${reasons.length} found`}</small>
      </div>
    </div>
  );
}
