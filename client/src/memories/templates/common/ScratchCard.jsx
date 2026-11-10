import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, Gift } from "lucide-react";
import { track } from "../../track";
import "./reveal.css";

/*
  SCRATCH CARD: a shiny cover sits over a photo. The visitor scratches it away with a finger or mouse.
  Once about half of it is gone the rest fades away on its own and the Continue button unlocks.
  "Reveal it for me" is there for people who can't scratch. Props: photo, name, sound, fx, nextId.
*/
const GRID = 22; // coverage is tracked on a coarse grid, which is cheap and good enough

function paintCover(canvas, c1, c2) {
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, c1); g.addColorStop(0.55, c2); g.addColorStop(1, c1);
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  // foil sheen
  const s = ctx.createLinearGradient(0, h * 0.2, w, h * 0.8);
  s.addColorStop(0, "rgba(255,255,255,0)"); s.addColorStop(0.5, "rgba(255,255,255,.22)"); s.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = s; ctx.fillRect(0, 0, w, h);
  // sparkles (seeded so they never jump around)
  let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  ctx.fillStyle = "rgba(255,255,255,.85)";
  for (let i = 0; i < 26; i++) {
    const x = rnd() * w, y = rnd() * h, r = (1.5 + rnd() * 3.5) * (w / 340);
    ctx.beginPath();
    for (let k = 0; k < 4; k++) { const a = (k * Math.PI) / 2; ctx.lineTo(x + Math.cos(a) * r * 2.2, y + Math.sin(a) * r * 2.2); ctx.lineTo(x + Math.cos(a + Math.PI / 4) * r * 0.5, y + Math.sin(a + Math.PI / 4) * r * 0.5); }
    ctx.closePath(); ctx.globalAlpha = 0.35 + rnd() * 0.55; ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = Math.max(2, w / 150);
  const m = w * 0.04; ctx.strokeRect(m, m, w - m * 2, h - m * 2);
  ctx.fillStyle = "#fff"; ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 6;
  ctx.font = `600 ${Math.round(w / 15)}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillText("Scratch to reveal", w / 2, h / 2 - w * 0.01);
  ctx.font = `italic 500 ${Math.round(w / 17)}px "Cormorant Garamond", Georgia, serif`;
  ctx.fillText("a surprise ✦", w / 2, h / 2 + w * 0.06);
}

export default function ScratchCard({ photo, name, sound, fx, nextId, text }) {
  const wrap = useRef(null);
  const canvas = useRef(null);
  const hit = useRef(new Set());
  const state = useRef({ down: false, last: null, drawnFor: 0, lastSound: 0 });
  const [done, setDone] = useState(false);
  const [touched, setTouched] = useState(false);

  // draw the cover once we know the card's size
  useEffect(() => {
    const el = canvas.current; const box = wrap.current;
    if (!el || !box) return undefined;
    const fit = () => {
      if (state.current.drawnFor || done) return;
      const r = box.getBoundingClientRect(); if (!r.width) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(r.width * dpr); el.height = Math.round(r.height * dpr);
      const cs = getComputedStyle(box);
      paintCover(el, cs.getPropertyValue("--mx-accent").trim() || "#c4506a", cs.getPropertyValue("--mx-accent2").trim() || "#e8806a");
      state.current.drawnFor = r.width;
    };
    fit();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(fit) : null;
    ro?.observe(box);
    return () => ro?.disconnect();
  }, [done]);

  const finish = useCallback(() => {
    setDone((d) => {
      if (d) return d;
      track("scratch_done");
      sound?.sfx.tada?.();
      const r = wrap.current?.getBoundingClientRect();
      if (r) { fx?.confetti(r.left + r.width / 2, r.top + r.height / 2, { n: 60, spread: 2.4, power: 520 }); fx?.sparkle(r.left + r.width / 2, r.top + r.height / 2, { n: 24 }); }
      return true;
    });
  }, [sound, fx]);

  const point = (e) => {
    const el = canvas.current; const r = el.getBoundingClientRect();
    return [((e.clientX - r.left) / r.width) * el.width, ((e.clientY - r.top) / r.height) * el.height];
  };
  const scratch = (a, b) => {
    const el = canvas.current; const ctx = el.getContext("2d");
    const brush = Math.max(18, el.width / 11);
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.lineWidth = brush;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    const steps = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (brush / 3)));
    for (let i = 0; i <= steps; i++) {
      const x = a[0] + ((b[0] - a[0]) * i) / steps, y = a[1] + ((b[1] - a[1]) * i) / steps;
      const gx = Math.floor((x / el.width) * GRID), gy = Math.floor((y / el.height) * GRID);
      const reach = Math.max(0, Math.floor((brush / el.width) * GRID * 0.5));
      for (let dx = -reach; dx <= reach; dx++) for (let dy = -reach; dy <= reach; dy++) {
        const cx = gx + dx, cy = gy + dy;
        if (cx >= 0 && cy >= 0 && cx < GRID && cy < GRID) hit.current.add(cy * GRID + cx);
      }
    }
    if (hit.current.size / (GRID * GRID) > 0.58) finish();
  };
  const down = (e) => {
    if (done) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    state.current.down = true; state.current.last = point(e);
    if (!touched) { setTouched(true); track("scratch_start"); sound?.unlock?.(); }
    scratch(state.current.last, state.current.last);
  };
  const move = (e) => {
    if (!state.current.down || done) return;
    const p = point(e); scratch(state.current.last, p); state.current.last = p;
    const now = performance.now();
    if (now - state.current.lastSound > 140) { state.current.lastSound = now; sound?.sfx.rustle?.(); }
  };
  const up = () => { state.current.down = false; };
  const next = () => document.getElementById(nextId)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="mx mx-scr">
      <p className="mx-kicker">A little surprise</p>
      <h2 className="mx-h">It&apos;s Your <em>Birthday!</em></h2>
      <p className="mx-sub">Scratch the card and see what special surprise is waiting for you 🎁</p>

      <div ref={wrap} className={`mx-scr-card ${done ? "done" : ""}`} style={{ "--t1": photo?.tone?.[0] || "#ffd1dc", "--t2": photo?.tone?.[1] || "#ffa6c1" }}>
        <div className="mx-scr-under">
          {photo?.url ? <img src={photo.url} alt={photo.caption || "Your surprise"} draggable={false} /> : <span className="mx-art" aria-hidden>{photo?.emoji || "🎁"}</span>}
          <p className="mx-scr-cap">{photo?.caption || `Happy Birthday ${name}!`} ❤</p>
        </div>
        <canvas ref={canvas} className="mx-scr-cover" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} aria-label="Scratch card. Drag over it to scratch." />
      </div>

      <div className="mx-note"><span className="mx-note-ico"><Gift className="h-5 w-5" aria-hidden /></span><p>{text || `You have 1 scratch card. Scratch it and make your day even more special!`}</p></div>
      <button type="button" className="mx-btn" onClick={next} disabled={!done}>{done ? <>Continue <ArrowDown className="h-4 w-4" aria-hidden /></> : <>Scratch to Continue <span aria-hidden>👆</span></>}</button>
      {!done && <button type="button" className="mx-link" onClick={finish}>Reveal it for me</button>}
    </div>
  );
}
