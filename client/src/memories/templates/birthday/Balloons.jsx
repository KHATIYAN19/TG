import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { track } from "../../track";

/*
  BALLOONS
  Hero field: balloons float up forever and every one of them can be popped. State is a plain list that
  only ever gets items added or removed (never `null` placeholders), so popping many balloons quickly,
  or all of them, cannot break anything. A popped balloon is replaced after a moment.
  Special ones: gold (confetti shower), and a foil balloon with the age on it.
*/
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const isSmall = () => typeof window !== "undefined" && window.innerWidth < 640;

let uid = 0;
export const makeBalloon = ({ palette, shapes = ["round"], kind = "normal", fresh = false, label = "" } = {}) => {
  const small = isSmall();
  const dur = kind === "number" ? rnd(26, 34) : rnd(20, 32); // slow enough to tap easily
  const size = kind === "number" ? (small ? 78 : 104) : small ? rnd(58, 84) : rnd(76, 118);
  return {
    id: ++uid,
    kind,
    label,
    xf: rnd(0.02, 0.98), // 0..1 across the field, converted so the balloon always fits on screen
    size,
    color: kind === "gold" ? "#ffc233" : kind === "number" ? "#ffc233" : pick(palette),
    shape: kind === "normal" ? pick(shapes) : "round",
    dur,
    delay: fresh ? rnd(0.1, 2.5) : -rnd(0, dur), // initial balloons start spread across the screen
    sway: rnd(3, 5.5),
  };
};

const BalloonEl = ({ b, className = "", style, onPop, innerRef, onAnimationEnd }) => (
  <button
    ref={innerRef}
    type="button"
    className={`bd-balloon ${b.kind} ${className}`}
    style={{ "--xf": b.xf, "--s": `${b.size}px`, "--c": b.color, "--dur": `${b.dur}s`, "--delay": `${b.delay}s`, "--sway": `${b.sway}s`, ...style }}
    aria-label={b.kind === "gold" ? "Pop the golden balloon" : "Pop the balloon"}
    onPointerDown={onPop}
    onAnimationEnd={onAnimationEnd}
    tabIndex={onPop ? 0 : -1}
  >
    <span className={`bd-b-body ${b.shape} ${b.kind}`}>{b.kind === "number" ? b.label : null}</span>
    <span className="bd-b-string" data-shape={b.shape} />
  </button>
);

const centreOf = (el) => {
  const r = el.querySelector(".bd-b-body").getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/* =====================================================
   HERO FIELD
===================================================== */
export function BalloonField({ palette, shapes, wishes, age, fx, sound, onCount }) {
  const total = isSmall() ? 9 : 14;
  const build = useCallback(() => {
    const list = Array.from({ length: total }, (_, i) => makeBalloon({ palette, shapes, kind: i === 2 ? "gold" : "normal" }));
    if (age) list.push(makeBalloon({ palette, kind: "number", label: String(age) }));
    return list;
  }, [palette, shapes, total, age]);

  const [list, setList] = useState(build);
  const [floaters, setFloaters] = useState([]);
  const [streak, setStreak] = useState(0);
  const popped = useRef(0);
  const wishIdx = useRef(0);
  const streakTimer = useRef(null);
  const timers = useRef([]);

  useEffect(() => () => { timers.current.forEach(clearTimeout); clearTimeout(streakTimer.current); }, []);
  // a new theme or age re-deals the field
  useEffect(() => { setList(build()); }, [build]);

  const say = (x, y, text, cls = "") => {
    const fid = ++uid;
    setFloaters((f) => [...f, { id: fid, x, y, text, cls }]);
    timers.current.push(setTimeout(() => setFloaters((f) => f.filter((q) => q.id !== fid)), 1800));
  };

  const pop = useCallback((b) => (e) => {
    e.preventDefault();
    const { x, y } = centreOf(e.currentTarget);
    // remove first: this can never fail, whatever else is happening
    setList((l) => l.filter((q) => q.id !== b.id));
    fx?.pop(x, y, b.color);
    sound?.sfx.pop();
    try { navigator.vibrate?.(12); } catch { /* not supported */ }

    popped.current += 1;
    onCount?.(popped.current);
    track("balloon_pop");
    setStreak((s) => s + 1);
    clearTimeout(streakTimer.current);
    streakTimer.current = setTimeout(() => setStreak(0), 1500);

    if (b.kind === "gold") {
      fx?.rain(1800); fx?.sparkle(x, y, { n: 30 }); sound?.sfx.chime();
      say(x, y, "Golden! Confetti time ✨", "gold");
    } else if (b.kind === "number") {
      fx?.firework(x, y); sound?.sfx.tada();
      say(x, y, `${b.label}! Happy Birthday!`, "gold");
    } else {
      say(x, y, wishes[wishIdx.current++ % wishes.length]);
    }

    // a replacement floats up from the bottom a little later (a golden one now and then)
    const again = b.kind === "number" ? { kind: "number", label: b.label } : { kind: popped.current % 7 === 0 ? "gold" : "normal" };
    timers.current.push(setTimeout(() => setList((l) => [...l, makeBalloon({ palette, shapes, fresh: true, ...again })]), b.kind === "number" ? 9000 : 1100));
  }, [fx, sound, wishes, palette, shapes, onCount]);

  const more = () => {
    sound?.sfx.rustle();
    setList((l) => [...l, ...Array.from({ length: 8 }, (_, i) => makeBalloon({ palette, shapes, fresh: true, kind: i === 3 ? "gold" : "normal" }))]);
  };

  const combo = streak >= 3 ? `${streak}x combo! 🔥` : null;

  return (
    <>
      <div className="bd-field">
        {list.map((b) => <BalloonEl key={b.id} b={b} onPop={pop(b)} />)}
      </div>
      {floaters.map((f) => <span key={f.id} className={`bd-floater ${f.cls}`} style={{ left: f.x, top: f.y }}>{f.text}</span>)}
      <div className="bd-popbar">
        <span aria-live="polite">{popped.current === 0 ? "Tap the balloons to pop them 🎈" : `Popped ${popped.current} 🎈${combo ? `  ·  ${combo}` : ""}`}</span>
        <button type="button" onClick={more}>More balloons</button>
      </div>
    </>
  );
}

/* =====================================================
   STORM: balloons rise and burst when the cake is cut.
   You can pop them by hand on the way up; whatever is left bursts by itself at the top.
===================================================== */
export const BalloonStorm = forwardRef(function BalloonStorm({ palette, shapes, fx, sound }, ref) {
  const [list, setList] = useState([]);
  const nodes = useRef(new Map());
  const alive = useRef(new Set());
  const timers = useRef([]);
  const lastPop = useRef(0);
  const effects = useRef({});
  effects.current = { fx, sound };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const boom = (b, x, y) => {
    const { fx: f, sound: snd } = effects.current;
    f?.pop(x, y, b.color);
    const t = performance.now();
    if (t - lastPop.current > 50) { snd?.sfx.pop(); lastPop.current = t; }
    if (b.kind === "gold") { f?.confetti(x, y, { n: 60 }); snd?.sfx.chime(); }
  };

  /** Bursts a balloon (if it is still around) and removes it. Safe to call twice. */
  const finish = (b, byHand, el) => {
    if (!alive.current.has(b.id)) return;
    alive.current.delete(b.id);
    const node = el || nodes.current.get(b.id);
    if (node) { const { x, y } = centreOf(node); boom(b, x, y); }
    nodes.current.delete(b.id);
    setList((l) => l.filter((q) => q.id !== b.id));
    void byHand;
  };

  const burst = useCallback((n = 26) => {
    const batch = Array.from({ length: n }, (_, i) => ({
      ...makeBalloon({ palette, shapes, fresh: true, kind: i % 9 === 4 ? "gold" : "normal" }),
      dur: rnd(1.2, 2.8),
      delay: rnd(0, 1.4),
      ty: `${-rnd(34, 86)}svh`,
    }));
    batch.forEach((b) => {
      alive.current.add(b.id);
      // fallback: even if the animation event never arrives, every balloon still bursts
      timers.current.push(setTimeout(() => finish(b), (b.delay + b.dur) * 1000 + 500));
    });
    setList((l) => [...l, ...batch]);
  }, [palette, shapes]); // eslint-disable-line react-hooks/exhaustive-deps
  useImperativeHandle(ref, () => ({ burst }), [burst]);

  const byHand = (b) => (e) => { e.preventDefault(); finish(b, true, e.currentTarget); };

  return (
    <div className="bd-storm-layer">
      {list.map((b) => (
        <BalloonEl key={b.id} b={b} className="storm" style={{ "--ty": b.ty }} innerRef={(el) => el && nodes.current.set(b.id, el)} onPop={byHand(b)} onAnimationEnd={(e) => { if (e.target === e.currentTarget) finish(b); }} />
      ))}
    </div>
  );
});
