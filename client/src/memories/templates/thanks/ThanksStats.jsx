import { CountUp } from "../anniversary/LoveStats";

const ICONS = ["⭐", "🏆", "☕", "🎯", "🤝", "💡"];

/* a handful of numbers that count up when scrolled into view */
export default function ThanksStats({ stats }) {
  return (
    <div className="an-stats mem-reveal">
      {stats.map((s, i) => (
        <div key={s.id || i} className="an-stat">
          <span className="an-stat-icon" aria-hidden>{ICONS[i % ICONS.length]}</span>
          <b><CountUp value={s.value} /></b>
          <small>{s.label}</small>
        </div>
      ))}
    </div>
  );
}
