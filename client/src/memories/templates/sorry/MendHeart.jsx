import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Hand } from "lucide-react";

/*
  MEND THE BROKEN HEART
  A heart cracked along a zig-zag. Drag the loose half back (or tap "Mend it for me"): it snaps into place
  and a golden seam draws itself along the crack (like kintsugi: mended things are more beautiful).
*/
const HEART = "M160,262 C60,190 18,140 18,86 C18,44 52,16 90,16 C120,16 148,34 160,62 C172,34 200,16 230,16 C268,16 302,44 302,86 C302,140 260,190 160,262Z";
const ZIG = [[160, 28], [147, 72], [173, 112], [146, 152], [172, 192], [155, 232], [160, 270]];
const ZIG_PTS = ZIG.map((p) => p.join(",")).join(" ");
const LEFT_CLIP = `0,0 160,0 ${ZIG_PTS} 0,270`;
const RIGHT_CLIP = `320,0 160,0 ${ZIG_PTS} 320,270`;
const START = { x: 50, y: 26, rot: 12 };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export default function MendHeart({ fx, sound, onMend }) {
  const uid = useId().replace(/:/g, "");
  const svgRef = useRef(null);
  const rightRef = useRef(null);
  const drag = useRef({ on: false, sx: 0, sy: 0, ox: START.x, oy: START.y });
  const pos = useRef({ ...START });
  const [mended, setMended] = useState(false);
  const mendedRef = useRef(false);
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const apply = (x, y, rot, smooth = false) => {
    pos.current = { x, y, rot };
    const g = rightRef.current;
    if (!g) return;
    g.style.transition = smooth ? "transform .55s cubic-bezier(.3,1.35,.5,1)" : "none";
    g.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
  };
  const toSvg = (e) => { const s = svgRef.current; const pt = s.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(s.getScreenCTM().inverse()); };

  const finish = useCallback(() => {
    if (mendedRef.current) return;
    mendedRef.current = true;
    apply(0, 0, 0, true);
    setMended(true);
    const r = svgRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height * 0.48;
    timers.current.push(setTimeout(() => {
      sound?.sfx.mend();
      fx?.sparkle(cx, cy, { n: 34, color: "#ffe08a" });
      fx?.hearts(cx, cy, 16, ["#ffd86b", "#ff7aa8", "#ffffff"]);
      try { navigator.vibrate?.([20, 40, 20]); } catch { /* not supported */ }
    }, 380));
    onMend?.();
  }, [fx, sound, onMend]);

  const down = (e) => {
    if (mendedRef.current) return;
    e.preventDefault();
    const p = toSvg(e);
    drag.current = { on: true, sx: p.x, sy: p.y, ox: pos.current.x, oy: pos.current.y };
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  };
  const move = (e) => {
    const d = drag.current;
    if (!d.on) return;
    const p = toSvg(e);
    const x = d.ox + (p.x - d.sx);
    const y = d.oy + (p.y - d.sy);
    const dist = Math.hypot(x, y);
    apply(x, y, START.rot * clamp(dist / 90, 0, 1) * Math.sign(x || 1));
    if (dist < 14) { d.on = false; finish(); }
  };
  const up = () => {
    const d = drag.current;
    if (!d.on) return;
    d.on = false;
    const dist = Math.hypot(pos.current.x, pos.current.y);
    if (dist < 44) finish();
  };

  useEffect(() => { // while the half is held, the page must not scroll under a finger
    const svg = svgRef.current;
    const stop = (e) => { if (drag.current.on) e.preventDefault(); };
    svg?.addEventListener("touchmove", stop, { passive: false });
    return () => svg?.removeEventListener("touchmove", stop);
  }, []);

  const auto = () => {
    if (mendedRef.current) return;
    const { x, y, rot } = pos.current;
    const t0 = performance.now();
    const step = (t) => {
      const k = clamp((t - t0) / 650, 0, 1);
      const e = 1 - Math.pow(1 - k, 3);
      apply(x * (1 - e), y * (1 - e), rot * (1 - e));
      if (k < 1) requestAnimationFrame(step); else finish();
    };
    requestAnimationFrame(step);
  };

  return (
    <div className="sr-mend">
      <svg ref={svgRef} viewBox="0 0 320 280" className={`sr-mend-svg ${mended ? "mended" : ""}`} role="img" aria-label={mended ? "A heart mended with a golden seam" : "A broken heart. Drag the loose half to mend it."} style={{ touchAction: mended ? "pan-y" : "none" }}>
        <defs>
          <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--bd-accent-2)" /><stop offset="1" stopColor="var(--bd-accent)" /></linearGradient>
          <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff0a8" /><stop offset=".5" stopColor="#ffc233" /><stop offset="1" stopColor="#f59e0b" /></linearGradient>
          <clipPath id={`${uid}-l`}><polygon points={LEFT_CLIP} /></clipPath>
          <clipPath id={`${uid}-r`}><polygon points={RIGHT_CLIP} /></clipPath>
          <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        </defs>
        <ellipse cx="160" cy="272" rx="110" ry="8" fill="#000" opacity=".12" />

        <g clipPath={`url(#${uid}-l)`}>
          <path d={HEART} fill={`url(#${uid}-g)`} />
          <path d="M44,60 C54,42 76,34 92,38" stroke="#fff" strokeOpacity=".4" strokeWidth="9" fill="none" strokeLinecap="round" />
        </g>
        <polyline points={ZIG_PTS} fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="3" strokeLinejoin="round" style={{ opacity: mended ? 0 : 1, transition: "opacity .4s" }} />

        <g ref={rightRef} className="sr-mend-half" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
          style={{ transform: `translate(${START.x}px, ${START.y}px) rotate(${START.rot}deg)`, transformOrigin: "230px 130px", cursor: mended ? "default" : "grab" }}>
          <g clipPath={`url(#${uid}-r)`}>
            <path d={HEART} fill={`url(#${uid}-g)`} />
            <path d="M254,40 C276,42 292,58 296,82" stroke="#fff" strokeOpacity=".28" strokeWidth="8" fill="none" strokeLinecap="round" />
          </g>
          <polyline points={ZIG_PTS} fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="3" strokeLinejoin="round" style={{ opacity: mended ? 0 : 1 }} />
          <rect x="140" y="0" width="190" height="280" fill="transparent" />
        </g>

        <polyline className="sr-seam" points={ZIG_PTS} fill="none" stroke={`url(#${uid}-gold)`} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength="1" filter={`url(#${uid}-glow)`} />
      </svg>

      {!mended && <span className="sr-mend-hint" aria-hidden><Hand className="h-4 w-4" /> drag me</span>}
      <p className="sr-mend-text" aria-live="polite">{mended ? "Mended. A golden seam makes it stronger than before." : "Drag the loose half back to mend the heart."}</p>
      {!mended && <button type="button" className="bd-btn bd-btn-ghost" onClick={auto}>Mend it for me</button>}
    </div>
  );
}
