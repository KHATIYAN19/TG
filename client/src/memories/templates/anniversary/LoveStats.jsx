import { useEffect, useRef, useState } from "react";

import { elapsed, parseSince } from "./TogetherCounter";

/* A number that counts up the first time it scrolls into view (text values simply appear). */
export function CountUp({ value }) {
  const ref = useRef(null);
  const raw = String(value).replace(/[,\s]/g, "");
  const numeric = /^\d+$/.test(raw);
  const [shown, setShown] = useState(numeric ? "0" : String(value));

  useEffect(() => {
    if (!numeric) return undefined;
    const target = Number(raw);
    const run = () => {
      const t0 = performance.now();
      const dur = 1700;
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        setShown(Math.round(target * e).toLocaleString("en-US"));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (typeof IntersectionObserver === "undefined") { setShown(target.toLocaleString("en-US")); return undefined; }
    const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { run(); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [raw, numeric]);

  return <span ref={ref}>{shown}</span>;
}

/* OUR LOVE IN NUMBERS: some figures are worked out from the date, the rest are the sender's own. */
export default function LoveStats({ since, stats }) {
  const start = parseSince(since);
  const e = start ? elapsed(start) : null;
  const cards = [
    ...(e ? [
      { id: "d", label: "Days together", value: String(e.totalDays), icon: "📅" },
      { id: "h", label: "Hours together", value: String(e.totalHours), icon: "⏳" },
      { id: "b", label: "Heartbeats side by side (at least)", value: String(e.totalDays * 100800), icon: "💓" },
    ] : []),
    ...stats.map((s) => ({ ...s, icon: "💖" })),
  ];
  if (!cards.length) return null;
  return (
    <div className="an-stats">
      {cards.map((c, i) => (
        <div key={c.id} className="an-stat mem-reveal" style={{ "--rd": `${(i % 3) * 0.08}s` }}>
          <span className="an-stat-icon" aria-hidden>{c.icon}</span>
          <b><CountUp value={c.value} /></b>
          <small>{c.label}</small>
        </div>
      ))}
    </div>
  );
}
