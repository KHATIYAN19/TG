import { useEffect, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

/*
  THE PARTY MAP: a small pill in the top corner that names the part of the party you are at and how many you have
  visited. Tap it for the whole list and jump anywhere. `stops` is [{ id, emoji, label }] in page order; each id is the
  id of a section on the page.
*/
export default function PartyNav({ stops, visible }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(null);
  const [seen, setSeen] = useState(() => new Set());
  const ids = stops.map((s) => s.id).join(",");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      setCurrent(e.target.id);
      setSeen((s) => (s.has(e.target.id) ? s : new Set(s).add(e.target.id)));
    }), { rootMargin: "-35% 0px -55% 0px" });
    ids.split(",").forEach((id) => { const n = document.getElementById(id); if (n) io.observe(n); });
    return () => io.disconnect();
  }, [ids]);

  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open]);

  const go = (id) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const here = stops.find((s) => s.id === current);
  const count = stops.filter((s) => seen.has(s.id)).length;
  const pct = stops.length ? Math.round((count / stops.length) * 100) : 0;

  return (
    <nav className={`pt-nav ${visible ? "" : "hidden"} ${open ? "open" : ""}`} aria-label="Party map">
      <button type="button" className="pt-nav-pill" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="pt-nav-list">
        <span className="pt-nav-ring" style={{ "--p": `${pct}%` }} aria-hidden><i>{here?.emoji || "🎉"}</i></span>
        <span className="pt-nav-text"><b>{here?.label || "The party"}</b><small>{count} of {stops.length} visited</small></span>
        <ChevronDown className="pt-nav-caret h-4 w-4" aria-hidden />
      </button>
      {open && <button type="button" className="pt-nav-scrim" aria-label="Close the party map" onClick={() => setOpen(false)} />}
      <ol id="pt-nav-list" className="pt-nav-list" hidden={!open}>
        {stops.map((s) => (
          <li key={s.id}>
            <button type="button" className={s.id === current ? "on" : ""} onClick={() => go(s.id)} aria-current={s.id === current ? "true" : undefined}>
              <i aria-hidden>{s.emoji}</i><span>{s.label}</span>
              {seen.has(s.id) && <Check className="h-3.5 w-3.5" aria-label="visited" />}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
