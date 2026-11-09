import { useEffect, useState } from "react";

/* "Together since" maths. Calendar-correct years / months / days, then the live hours : minutes : seconds. */
export const parseSince = (s) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || "")) return null;
  const [y, m, d] = s.split("-").map(Number);
  const t = new Date(y, m - 1, d, 0, 0, 0);
  return Number.isNaN(t.getTime()) || t.getDate() !== d ? null : t;
};

export function elapsed(start, now = new Date()) {
  if (now < start) return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0, totalHours: 0 };
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();
  if (days < 0) { months -= 1; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (months < 0) { years -= 1; months += 12; }
  const ms = now - start;
  return { years, months, days, hours: now.getHours(), minutes: now.getMinutes(), seconds: now.getSeconds(), totalDays: Math.floor(ms / 86400000), totalHours: Math.floor(ms / 3600000) };
}

export const ordinal = (n) => {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10 > 3 ? 0 : n % 10]}`;
};

export const prettyDate = (start) => start.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

/* the live counter: six little tiles, the seconds tick */
export default function TogetherCounter({ since }) {
  const start = parseSince(since);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!start) return undefined;
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [since]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!start) return null;

  const e = elapsed(start, now);
  const tiles = [["Years", e.years], ["Months", e.months], ["Days", e.days], ["Hours", e.hours], ["Minutes", e.minutes], ["Seconds", e.seconds]];
  return (
    <div className="an-counter" role="timer" aria-label={`Together for ${e.years} years, ${e.months} months and ${e.days} days`}>
      {tiles.map(([label, v], i) => (
        <div key={label} className={`an-tile ${i === 5 ? "live" : ""}`}>
          <span key={i === 5 ? v : label} className={i === 5 ? "an-tick" : ""}>{String(v).padStart(2, "0")}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}
