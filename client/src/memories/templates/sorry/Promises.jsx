import { useState } from "react";
import { track } from "../../track";

/* PROMISES: the sender's promises as sealed cards. Tap one: it flips over and a "I promise" stamp lands. */
export default function Promises({ promises, sender, fx, sound, onFlip }) {
  const [open, setOpen] = useState({});
  const count = Object.values(open).filter(Boolean).length;

  const flip = (i, e) => {
    track("promise_flip", { i });
    if (open[i]) return;
    setOpen((o) => ({ ...o, [i]: true }));
    sound?.sfx.rustle();
    const r = e.currentTarget.getBoundingClientRect();
    setTimeout(() => {
      sound?.sfx.chime();
      fx?.hearts(r.left + r.width / 2, r.top + r.height / 2, 8);
      try { navigator.vibrate?.(14); } catch { /* not supported */ }
    }, 380);
    onFlip?.(i);
  };

  return (
    <>
      <div className="sr-promises">
        {promises.map((p, i) => (
          <button key={i} type="button" className="sr-pcard mem-reveal" data-open={Boolean(open[i])} style={{ "--rd": `${(i % 4) * 0.07}s`, "--c": `var(--gift-${(i % 4) + 1})` }}
            onClick={(e) => flip(i, e)} aria-pressed={Boolean(open[i])} aria-label={open[i] ? `Promise ${i + 1}: ${p}` : `Open promise ${i + 1} of ${promises.length}`}>
            <span className="sr-pcard-in">
              <span className="sr-pface front">
                <span className="sr-seal" aria-hidden>♥</span>
                <b>Promise {i + 1}</b>
                <small>Tap to open</small>
              </span>
              <span className="sr-pface back">
                <span className="sr-stamp" aria-hidden>I promise</span>
                <em>{p}</em>
                <small>— {sender}</small>
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="bd-counter" aria-live="polite"><span>{count === promises.length ? "That's every promise, and I mean each one" : `${count} of ${promises.length} opened`}</span></div>
    </>
  );
}
