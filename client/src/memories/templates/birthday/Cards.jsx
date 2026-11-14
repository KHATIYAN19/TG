import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

import { track } from "../../track";
import { prefersReducedMotion } from "./fx";

/* =====================================================
   REASONS: a deck of cards. The top card flies off to show the next one.
===================================================== */
export function ReasonDeck({ reasons, sender, fx, sound }) {
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState(1);
  const ref = useRef(null);
  const n = reasons.length;
  const done = at >= n;

  const go = (d) => {
    const next = Math.min(n, Math.max(0, at + d));
    if (next === at) return;
    setDir(d);
    setAt(next);
    sound?.sfx.swish();
    if (d > 0 && next < n) track("reason", { n: next + 1 });
    if (next === n) {
      const r = ref.current?.getBoundingClientRect();
      if (r) fx?.hearts(r.left + r.width / 2, r.top + r.height / 2, 18);
      sound?.sfx.chime();
    }
  };
  useEffect(() => { if (at > n) setAt(n); }, [at, n]);

  return (
    <div className="pt-deck mem-reveal">
      <div ref={ref} className="pt-deck-stack">
        {/* the cards waiting underneath */}
        {[2, 1].map((k) => at + k < n + 1 && <span key={k} className="pt-card under" style={{ "--k": k }} aria-hidden />)}
        <button type="button" key={at} className={`pt-card top ${dir > 0 ? "from-right" : "from-left"} ${done ? "last" : ""}`} onClick={() => go(done ? -n : 1)} aria-label={done ? "Start the deck again" : "Next reason"}>
          {done ? (
            <>
              <span className="pt-card-no">∞</span>
              <span className="pt-card-text">And that is only {n} of them. I am still counting.</span>
              <span className="pt-card-by">{sender}</span>
            </>
          ) : (
            <>
              <span className="pt-card-no">No. {String(at + 1).padStart(2, "0")}</span>
              <span className="pt-card-text">{reasons[at]}</span>
              <span className="pt-card-by">tap for the next one</span>
            </>
          )}
        </button>
      </div>
      <div className="pt-deck-ctl">
        <button type="button" onClick={() => go(-1)} disabled={at === 0} aria-label="Previous reason"><ChevronLeft className="h-5 w-5" /></button>
        <span aria-live="polite">{done ? `All ${n} read` : `${at + 1} of ${n}`}</span>
        {done
          ? <button type="button" onClick={() => go(-n)} aria-label="Start again"><RotateCcw className="h-4 w-4" /></button>
          : <button type="button" onClick={() => go(1)} aria-label="Next reason"><ChevronRight className="h-5 w-5" /></button>}
      </div>
    </div>
  );
}

/* =====================================================
   COUPONS: the sender's promises as tear-off tickets. Tap one to redeem it: it gets stamped.
===================================================== */
export function Coupons({ coupons, sender, recipient, fx, sound }) {
  const [used, setUsed] = useState({});
  const redeem = (c, i, e) => {
    if (used[i]) return;
    setUsed((u) => ({ ...u, [i]: true }));
    sound?.sfx.chop();
    setTimeout(() => sound?.sfx.chime(), 180);
    try { navigator.vibrate?.(25); } catch { /* not supported */ }
    const r = e.currentTarget.getBoundingClientRect();
    fx?.confetti(r.left + r.width / 2, r.top + r.height / 2, { n: 40, power: 420 });
    track("coupon", { title: c.slice(0, 80) });
  };
  return (
    <ul className="pt-coupons">
      {coupons.map((c, i) => (
        <li key={i} className="mem-reveal" style={{ "--rd": `${(i % 3) * 0.07}s` }}>
          <button type="button" className={`pt-coupon ${used[i] ? "used" : ""}`} style={{ "--g": `var(--gift-${(i % 4) + 1})` }} onClick={(e) => redeem(c, i, e)} aria-pressed={Boolean(used[i])} aria-label={used[i] ? `${c}. Redeemed` : `Redeem: ${c}`}>
            <span className="pt-coupon-stub"><i>Coupon</i><b>{String(i + 1).padStart(2, "0")}</b></span>
            <span className="pt-coupon-body">
              <small>Good for one</small>
              <strong>{c}</strong>
              <em>{used[i] ? `Redeemed. Show this to ${sender}.` : `For ${recipient}, from ${sender}. Tap to redeem`}</em>
            </span>
            {used[i] && <span className="pt-stamp" aria-hidden>Redeemed</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

/* =====================================================
   THROUGH THE YEARS: the sender's moments on a ribbon that runs down the page.
===================================================== */
export function Years({ items }) {
  return (
    <ol className="pt-years">
      {items.map((m, i) => (
        <li key={m.id || i} className="pt-year mem-reveal" data-side={i % 2 ? "right" : "left"}>
          <span className="pt-year-dot" aria-hidden>{i + 1}</span>
          <div className="pt-year-card">
            {m.date && <span className="pt-year-date">{m.date}</span>}
            <h3>{m.title}</h3>
            {m.note && <p>{m.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/* =====================================================
   YOUR AGE IN NUMBERS: worked out from the age, counted up when it scrolls into view.
===================================================== */
function CountUp({ to, run }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!run) return undefined;
    if (prefersReducedMotion()) { setV(to); return undefined; }
    let raf = 0;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 1600);
      setV(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);
  return <>{v.toLocaleString("en-US")}</>;
}

export function AgeStats({ age, name }) {
  const ref = useRef(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === "undefined") { setRun(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setRun(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const days = Math.round(age * 365.25);
  const stats = [
    ["🌍", age, "trips around the sun"],
    ["📅", days, "days of being you"],
    ["🌙", Math.round(days / 29.53), "full moons seen"],
    ["💓", Math.round((days * 24 * 60 * 72) / 1e6), "million heartbeats"],
    ["🕯️", (age * (age + 1)) / 2, "candles blown out so far"],
    ["😴", Math.round(days * 8 / 24), "days spent fast asleep"],
  ];
  return (
    <ul ref={ref} className="pt-stats" aria-label={`${name} in numbers`}>
      {stats.map(([emoji, value, label], i) => (
        <li key={label} className="mem-reveal" style={{ "--rd": `${(i % 3) * 0.08}s` }}>
          <span aria-hidden>{emoji}</span>
          <b><CountUp to={value} run={run} /></b>
          <small>{label}</small>
        </li>
      ))}
    </ul>
  );
}
