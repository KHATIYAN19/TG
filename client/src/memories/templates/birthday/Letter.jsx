import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./fx";
import { track } from "../../track";

/*
  LETTER: a sealed envelope. Tap it: the flap opens, the paper slides out and the sender's message
  types itself out in handwriting. Tap the paper to skip to the end.
*/
export default function Letter({ message, sender, fx, sound, onOpen }) {
  const [open, setOpen] = useState(false);
  const [paper, setPaper] = useState(false);
  const [shown, setShown] = useState(0);
  const timer = useRef(null);
  const still = prefersReducedMotion();

  const openIt = (e) => {
    if (open) return;
    setOpen(true);
    onOpen?.();
    track("letter_open");
    sound?.sfx.rustle();
    const r = e.currentTarget.getBoundingClientRect();
    setTimeout(() => { fx?.hearts(r.left + r.width / 2, r.top + r.height / 2, 16); sound?.sfx.chime(); }, 500);
    setTimeout(() => setPaper(true), 1000);
  };

  useEffect(() => {
    if (!paper) return undefined;
    if (still) { setShown(message.length); return undefined; }
    timer.current = setInterval(() => setShown((n) => { if (n >= message.length) { clearInterval(timer.current); return n; } return n + 1; }), 26);
    return () => clearInterval(timer.current);
  }, [paper, message, still]);

  const done = shown >= message.length;

  return (
    <div className="bd-env-wrap">
      {!paper && (
        <button type="button" className={`bd-env ${open ? "open" : ""}`} onClick={openIt} aria-label="Open the envelope">
          <span className="bd-env-back" />
          <span className="bd-env-paper" />
          <span className="bd-env-flap" />
          <span className="bd-env-front" />
          <span className="bd-env-seal" aria-hidden>♥</span>
        </button>
      )}
      {!paper && !open && <p className="bd-sub" style={{ marginTop: 14 }}>Tap the envelope to open it</p>}
      {paper && (
        <div className="bd-letter" onClick={() => setShown(message.length)} role="article" aria-label={`A message from ${sender}`}>
          <p aria-live="off"><span>{message.slice(0, shown)}</span><span style={{ opacity: 0 }}>{message.slice(shown)}</span></p>
          <div className="sig" style={{ opacity: done ? 1 : 0, transition: "opacity .8s" }}>
            With all my love,<br />{sender}
            <small>Made just for you</small>
          </div>
        </div>
      )}
    </div>
  );
}
