/* OUR STORY: a vertical timeline. The line draws itself and each moment fades in as you scroll. */
export default function Timeline({ items }) {
  return (
    <ol className="an-tl mem-reveal">
      {items.map((m, i) => (
        <li key={m.id || i} className="an-tl-item mem-reveal" style={{ "--rd": `${Math.min(i, 3) * 0.06}s` }}>
          <span className="an-tl-dot" aria-hidden>♥</span>
          <div className="an-tl-card">
            {m.date && <time>{m.date}</time>}
            <h3>{m.title}</h3>
            {m.note && <p>{m.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
