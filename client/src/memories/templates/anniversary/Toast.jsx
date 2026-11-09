import { useRef, useState } from "react";

import { Flute } from "./art";
import { track } from "../../track";

/* CHEERS: two champagne flutes tilt together and clink, with a sparkle, bubbles and a little ting. */
export default function Toast({ fx, sound, sender, name }) {
  const [clink, setClink] = useState(false);
  const [count, setCount] = useState(0);
  const stage = useRef(null);
  const busy = useRef(false);

  const cheers = () => {
    if (busy.current) return;
    track("toast");
    busy.current = true;
    setClink(true);
    sound?.sfx.fizz();
    setTimeout(() => {
      sound?.sfx.clink();
      const r = stage.current.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height * 0.28;
      fx?.sparkle(x, y, { n: 26, color: "#fff3b0" });
      fx?.confetti(x, y, { n: 26, power: 380, kinds: ["star", "circle"], palette: ["#ffe27a", "#ffffff", "#ffd1dc"] });
      try { navigator.vibrate?.(16); } catch { /* not supported */ }
      setCount((c) => c + 1);
    }, 420);
    setTimeout(() => { setClink(false); busy.current = false; }, 1300);
  };

  return (
    <div className="an-toast">
      <button type="button" ref={stage} className={`an-toast-stage ${clink ? "clink" : ""}`} onClick={cheers} aria-label="Clink the glasses">
        <Flute className="an-flute l" />
        <Flute className="an-flute r" />
        <span className="an-toast-glow" aria-hidden />
      </button>
      <p className="an-toast-text bd-script">{count === 0 ? `Cheers to us, ${name}` : count < 3 ? "Cheers! 🥂" : `Here's to forever, from ${sender}`}</p>
      <button type="button" className="bd-btn bd-btn-ghost" onClick={cheers}>{count === 0 ? "Clink the glasses" : "Clink again"}</button>
    </div>
  );
}
