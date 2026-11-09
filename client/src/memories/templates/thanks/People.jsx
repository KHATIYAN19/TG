import { useState } from "react";
import { track } from "../../track";

const TONES = ["#d9611e", "#2f8f3f", "#2563eb", "#c0392b", "#8b6bd9", "#d99a00", "#0e9aa7", "#e8335f", "#6b3f22", "#7c4dff"];
const initials = (n) => n.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");

/* SHOUT-OUTS: one card per person, with a reaction button that pops a little celebration. */
export default function People({ people, react, fx, sound }) {
  const [counts, setCounts] = useState({});
  const send = (id, e) => {
    track("react", { id: String(id), name: (people.find((p, k) => (p.id || k) === id) || {}).title || "" });
    setCounts((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
    sound?.sfx.squeak?.();
    const r = e.currentTarget.getBoundingClientRect();
    fx?.hearts(r.left + r.width / 2, r.top, 7);
  };
  return (
    <ul className="th-people">
      {people.map((p, i) => (
        <li key={p.id || i} className="th-person mem-reveal" style={{ "--rd": `${Math.min(i, 4) * 0.06}s`, "--tone": TONES[i % TONES.length] }}>
          <span className="th-avatar" aria-hidden>{initials(p.title)}</span>
          <div className="th-person-body">
            <h3>{p.title}</h3>
            {p.date && <span className="th-role">{p.date}</span>}
            {p.note && <p>{p.note}</p>}
          </div>
          <button type="button" className={`th-react ${counts[p.id || i] ? "on" : ""}`} onClick={(e) => send(p.id || i, e)} aria-label={`${react.label} to ${p.title}`}>
            <span aria-hidden>{react.emoji}</span> {counts[p.id || i] ? `${react.done}${counts[p.id || i] > 1 ? ` x${counts[p.id || i]}` : ""}` : react.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
