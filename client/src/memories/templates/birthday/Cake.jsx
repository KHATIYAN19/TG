import { useCallback, useEffect, useId, useRef, useState } from "react";
import { RoseDefs, SlotArt } from "./decor";

/*
  THE CAKE
  A two-tier SVG cake. Flow: blow out the candles, then drag the knife straight down through the cake
  (twice, one slice-width apart). The wedge between the two cuts lifts out onto a serving plate and
  the page celebrates. "Cut it for me" does the same thing without dragging.
*/

/* geometry (SVG units) */
const VB = "0 -34 360 404";
const TOP = { cx: 180, rx: 88, cy: 118, bot: 172, ry: 10 };   // top tier, x 92..268
const BOT = { cx: 180, rx: 144, cy: 172, bot: 256, ry: 14 };  // bottom tier, x 36..324
const CAKE_L = BOT.cx - BOT.rx;
const CAKE_R = BOT.cx + BOT.rx;
const TOP_L = TOP.cx - TOP.rx;
const TOP_R = TOP.cx + TOP.rx;
const CUT_END = 266;
const SERVE = { cx: 180, cy: 338 };
const KNIFE_REST = { x: 290, y: 104, rot: 26 };
const CANDLES = [138, 159, 180, 201, 222];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const rimY = (t, x) => t.cy + t.ry * Math.sqrt(Math.max(0, 1 - ((x - t.cx) / t.rx) ** 2));
const bodyPath = (t) => `M${t.cx - t.rx},${t.cy} L${t.cx - t.rx},${t.bot} A${t.rx},${t.ry} 0 0 0 ${t.cx + t.rx},${t.bot} L${t.cx + t.rx},${t.cy} Z`;
const startYFor = (x) => (x >= TOP_L && x <= TOP_R ? TOP.cy : BOT.cy);
const knifeTransform = (x, y, rot) => `translate(${x}px, ${y}px) rotate(${rot}deg)`;
const REST_T = knifeTransform(KNIFE_REST.x, KNIFE_REST.y, KNIFE_REST.rot);

/* icing drips hanging from a tier's front rim */
function dripsPath(t, lens) {
  const n = lens.length;
  const x0 = t.cx - t.rx;
  const w = (2 * t.rx) / n;
  let d = `M${x0},${t.cy}`;
  for (let i = 0; i < n; i++) {
    const xa = x0 + i * w;
    const xb = xa + w;
    const ya = rimY(t, xa);
    const yb = rimY(t, xb);
    const L = lens[i];
    d += ` L${xa},${ya} C${xa},${ya + L + 5} ${xb},${yb + L + 5} ${xb},${yb}`;
  }
  return `${d} L${t.cx + t.rx},${t.cy} Z`;
}
const DRIPS_BOT = dripsPath(BOT, [12, 24, 15, 30, 12, 22, 17, 28, 13, 24, 15, 20]);
const DRIPS_TOP = dripsPath(TOP, [10, 20, 13, 24, 11, 19, 14, 22]);

function pipedDots(t, count) {
  const out = [];
  for (let i = 0; i <= count; i++) {
    const x = t.cx - t.rx + 8 + ((2 * t.rx - 16) * i) / count;
    const y = t.bot + t.ry * Math.sqrt(Math.max(0, 1 - ((x - t.cx) / t.rx) ** 2)) - 7;
    out.push([x, y]);
  }
  return out;
}
const DOTS_BOT = pipedDots(BOT, 17);
const DOTS_TOP = pipedDots(TOP, 10);

const CRUMBS = Array.from({ length: 46 }, (_, i) => [((i * 53) % 100) / 100, ((i * 37) % 100) / 100, 0.9 + ((i * 7) % 10) / 9]);

export default function Cake({ name, themeId = "candy", fx, sound, onBlow, onFirstCut, onCelebrate }) {
  const uid = useId().replace(/:/g, "");
  const id = (s) => `${s}-${uid}`;

  const [phase, setPhase] = useState("idle"); // idle -> blown -> cut1 -> serving -> done
  const [cuts, setCuts] = useState([]);
  const [served, setServed] = useState(false);
  const [wish, setWish] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const phaseRef = useRef("idle");
  const cutsRef = useRef([]);
  const svgRef = useRef(null);
  const knifeRef = useRef(null);
  const grooveRef = useRef(null);
  const drag = useRef({ active: false, locked: false, ox: 0, oy: 0, cutX: 0, startY: 0, depth: 0, tick: 0, tip: { x: KNIFE_REST.x, y: KNIFE_REST.y }, busy: false });
  const timers = useRef([]);

  const go = (p) => { phaseRef.current = p; setPhase(p); };
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.current.push(t); return t; };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* ------------- helpers ------------- */
  const toSvg = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };
  const toScreen = (x, y) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = x; pt.y = y;
    const r = pt.matrixTransform(svg.getScreenCTM());
    return { x: r.x, y: r.y };
  };
  const setKnife = (x, y, rot) => {
    drag.current.tip = { x, y };
    if (knifeRef.current) knifeRef.current.style.transform = knifeTransform(x, y, rot);
  };
  const setGroove = (x, y, h) => {
    const g = grooveRef.current;
    if (!g) return;
    g.setAttribute("x", x - 1.6); g.setAttribute("y", y - 2); g.setAttribute("height", Math.max(0, h));
  };
  const buzz = (ms = 18) => { try { navigator.vibrate?.(ms); } catch { /* not supported */ } };

  /* ------------- 1. blow the candles ------------- */
  const blow = useCallback(() => {
    if (phaseRef.current !== "idle") return;
    go("blown");
    sound?.sfx.whoosh();
    const p = toScreen(180, 66);
    fx?.sparkle(p.x, p.y, { n: 22, color: "#fff3b0" });
    setWish(true);
    later(() => setWish(false), 2600);
    later(() => sound?.sfx.chime(), 650);
    onBlow?.();
  }, [fx, sound, onBlow]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ------------- 2. cutting ------------- */
  const beginCut = (x) => {
    const d = drag.current;
    d.locked = true; d.cutX = x; d.startY = startYFor(x); d.depth = 0; d.tick = 0;
    setWiggle(true); later(() => setWiggle(false), 520);
    const p = toScreen(x, d.startY);
    fx?.crumbs(p.x, p.y, "#e9c9a6", 8);
  };

  const updateCut = (tipY) => {
    const d = drag.current;
    const y = clamp(tipY, d.startY - 4, CUT_END);
    d.depth = clamp((y - d.startY) / (CUT_END - d.startY), 0, 1);
    setKnife(d.cutX, y, 0);
    setGroove(d.cutX, d.startY, y - d.startY);
    const step = Math.floor(d.depth * 5);
    if (step > d.tick) {
      d.tick = step;
      sound?.sfx.tick();
      const p = toScreen(d.cutX, y);
      fx?.crumbs(p.x, p.y, "#d9a679", 4);
    }
  };

  const finishCut = () => {
    const d = drag.current;
    const x = d.cutX;
    d.active = false; d.locked = false; d.busy = false;
    knifeRef.current?.classList.remove("dragging");
    sound?.sfx.chop();
    buzz(30);
    const p = toScreen(x, CUT_END - 10);
    fx?.crumbs(p.x, p.y, "#c98c5b", 18);
    setGroove(0, 0, 0);

    const next = [...cutsRef.current, x];
    cutsRef.current = next;
    setCuts(next);
    // the knife lifts away
    later(() => setKnife(KNIFE_REST.x, KNIFE_REST.y, KNIFE_REST.rot), 120);

    if (next.length === 1) {
      go("cut1");
      onFirstCut?.();
    } else {
      go("serving");
      onCelebrate?.();
      later(() => setServed(true), 380);
      later(() => { sound?.sfx.cheer(); go("done"); }, 1500);
    }
  };

  const retract = () => {
    const d = drag.current;
    const from = d.depth;
    const y0 = d.startY + from * (CUT_END - d.startY);
    const t0 = performance.now();
    d.locked = false;
    const step = (t) => {
      const k = clamp((t - t0) / 220, 0, 1);
      const y = y0 - (y0 - d.startY) * k;
      setGroove(d.cutX, d.startY, y - d.startY);
      setKnife(d.cutX, y - 6, 0);
      if (k < 1) requestAnimationFrame(step);
      else { setGroove(0, 0, 0); knifeRef.current?.classList.remove("dragging"); setKnife(KNIFE_REST.x, KNIFE_REST.y, KNIFE_REST.rot); }
    };
    requestAnimationFrame(step);
  };

  /* the second cut must be a slice-width from the first, on whichever side has room */
  const sliceX = (x) => {
    const first = cutsRef.current[0];
    if (first == null) return clamp(x, CAKE_L + 18, CAKE_R - 18);
    let dir = x >= first ? 1 : -1;
    const w = clamp(Math.abs(x - first), 46, 84);
    if (first + dir * w > CAKE_R - 14 || first + dir * w < CAKE_L + 14) dir = -dir;
    return first + dir * w;
  };

  const onDown = (e) => {
    const d = drag.current;
    if (!["blown", "cut1"].includes(phaseRef.current) || d.busy) return;
    e.preventDefault();
    const p = toSvg(e);
    d.active = true;
    d.ox = d.tip.x - p.x; d.oy = d.tip.y - p.y;
    knifeRef.current.classList.add("dragging");
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    sound?.sfx.swish();
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const p = toSvg(e);
    const tx = p.x + d.ox;
    const ty = p.y + d.oy;
    if (!d.locked) {
      const inside = tx > CAKE_L + 6 && tx < CAKE_R - 6;
      if (inside && ty >= startYFor(tx) - 2) { beginCut(sliceX(tx)); updateCut(ty); return; }
      setKnife(tx, ty, clamp((tx - 180) * -0.07, -16, 16));
      return;
    }
    updateCut(ty);
    if (drag.current.depth >= 0.97) { try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ } finishCut(); }
  };
  const onUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (d.locked) retract();
    else { knifeRef.current?.classList.remove("dragging"); setKnife(KNIFE_REST.x, KNIFE_REST.y, KNIFE_REST.rot); }
  };

  // Touch: once the knife is grabbed, stop the page from scrolling under the finger.
  useEffect(() => {
    const svg = svgRef.current;
    const stop = (e) => { if (drag.current.active) e.preventDefault(); };
    svg?.addEventListener("touchmove", stop, { passive: false });
    return () => svg?.removeEventListener("touchmove", stop);
  }, []);

  /* "Cut it for me": the knife does both cuts by itself */
  const autoCut = useCallback(() => {
    const d = drag.current;
    if (!["blown", "cut1"].includes(phaseRef.current) || d.busy) return;
    d.busy = true;
    const x = cutsRef.current.length === 0 ? 150 : sliceX(214);
    const sy = startYFor(x);
    knifeRef.current.classList.remove("dragging");
    setKnife(x, sy - 46, 0);
    sound?.sfx.swish();
    later(() => {
      knifeRef.current.classList.add("dragging");
      beginCut(x);
      const t0 = performance.now();
      const run = (t) => {
        const k = clamp((t - t0) / 950, 0, 1);
        const ease = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        updateCut(sy - 4 + ease * (CUT_END - sy + 4));
        if (k < 1) requestAnimationFrame(run); else finishCut();
      };
      requestAnimationFrame(run);
    }, 480);
  }, [sound]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    timers.current.forEach(clearTimeout);
    cutsRef.current = []; setCuts([]); setServed(false); setWish(false);
    drag.current.busy = false; drag.current.active = false; drag.current.locked = false;
    setKnife(KNIFE_REST.x, KNIFE_REST.y, KNIFE_REST.rot);
    go("idle");
  };

  /* ------------- derived ------------- */
  const [g1, g2] = cuts.length === 2 ? [Math.min(...cuts), Math.max(...cuts)] : [0, 0];
  const mid = (g1 + g2) / 2;
  const out = phase !== "idle";
  const knifeOn = phase === "blown" || phase === "cut1";

  const step = {
    idle: ["1", "Make a wish, then blow out the candles"],
    blown: ["2", "Grab the knife and drag it straight down the cake"],
    cut1: ["2", "Nice! One more cut, about a slice-width away"],
    serving: ["✓", "Slicing…"],
    done: ["🎂", `Happy Birthday ${name}! Scroll down for your gifts`],
  }[phase];

  /* ------------- art ------------- */
  const grad = (stops) => stops.map(([o, c, op]) => <stop key={o} offset={o} style={{ stopColor: c, stopOpacity: op ?? 1 }} />);

  return (
    <div className="bd-cake-wrap">
      {wish && <div className="bd-wish" role="status">Make a wish… ✨</div>}
      <svg ref={svgRef} viewBox={VB} className={`bd-cake-svg ${out ? "ck-out" : ""}`} style={{ touchAction: knifeOn ? "none" : "pan-y" }} role="img" aria-label="A two tier birthday cake with candles and a knife">
        <defs>
          {themeId === "love" && <RoseDefs uid={uid} />}
          <clipPath id={id("sil")}>
            <path d={bodyPath(BOT)} /><ellipse cx={BOT.cx} cy={BOT.cy} rx={BOT.rx} ry={BOT.ry} />
            <path d={bodyPath(TOP)} /><ellipse cx={TOP.cx} cy={TOP.cy} rx={TOP.rx} ry={TOP.ry} />
          </clipPath>
          <clipPath id={id("gap")}><rect x={g1} y={90} width={Math.max(0, g2 - g1)} height={190} /></clipPath>
          <linearGradient id={id("sheen")} x1="0" x2="1" y1="0" y2="0">{grad([[0, "#fff", 0.34], [0.3, "#fff", 0], [0.72, "#000", 0], [1, "#000", 0.26]])}</linearGradient>
          <linearGradient id={id("frost")} x1="0" x2="0" y1="0" y2="1">{grad([[0, "var(--ck-frost)"], [1, "var(--ck-frost-2)"]])}</linearGradient>
          <linearGradient id={id("drip")} x1="0" x2="0" y1="0" y2="1">{grad([[0, "var(--ck-cream)"], [1, "var(--ck-cream)", 0.86]])}</linearGradient>
          <linearGradient id={id("plate")} x1="0" x2="0" y1="0" y2="1">{grad([[0, "var(--ck-plate)"], [1, "var(--ck-plate-2)"]])}</linearGradient>
          <linearGradient id={id("steel")} x1="0" x2="1" y1="0" y2="0">{grad([[0, "#9aa3b2"], [0.45, "#f4f6fb"], [1, "#b6bdca"]])}</linearGradient>
          <linearGradient id={id("wood")} x1="0" x2="1" y1="0" y2="0">{grad([[0, "#6f4126"], [0.5, "#9a6038"], [1, "#5b331d"]])}</linearGradient>
          <radialGradient id={id("flame")} cx="50%" cy="70%" r="60%">{grad([[0, "#fff7c2"], [0.5, "#ffd23f"], [1, "#ff7a1a"]])}</radialGradient>
          <radialGradient id={id("glow")}>{grad([[0, "#ffe9a0", 0.9], [1, "#ffe9a0", 0]])}</radialGradient>
          <linearGradient id={id("cavity")} x1="0" x2="1" y1="0" y2="0">{grad([[0, "#000", 0.42], [0.2, "#000", 0.04], [0.8, "#000", 0.04], [1, "#000", 0.42]])}</linearGradient>
        </defs>

        {/* shadows + plates */}
        <ellipse cx="180" cy="268" rx="176" ry="22" fill="#000" opacity=".14" />
        <ellipse cx="180" cy="262" rx="168" ry="20" fill={`url(#${id("plate")})`} />
        <ellipse cx="180" cy="259" rx="150" ry="15" fill="#fff" opacity=".35" />
        <g className={`ck-serve-plate ${cuts.length === 2 ? "on" : ""}`}>
          <ellipse cx={SERVE.cx} cy={SERVE.cy + 14} rx="92" ry="17" fill="#000" opacity=".14" />
          <ellipse cx={SERVE.cx} cy={SERVE.cy + 10} rx="86" ry="16" fill={`url(#${id("plate")})`} />
          <ellipse cx={SERVE.cx} cy={SERVE.cy + 8} rx="66" ry="11" fill="#fff" opacity=".4" />
        </g>

        {/* bottom tier */}
        <g className={wiggle ? "ck-wiggle" : ""}>
          <path d={bodyPath(BOT)} fill={`url(#${id("frost")})`} />
          <path d={bodyPath(BOT)} fill={`url(#${id("sheen")})`} />
          {[0.42, 0.72].map((k) => <path key={k} d={`M${BOT.cx - BOT.rx},${BOT.cy + (BOT.bot - BOT.cy) * k} A${BOT.rx},${BOT.ry} 0 0 0 ${BOT.cx + BOT.rx},${BOT.cy + (BOT.bot - BOT.cy) * k}`} fill="none" stroke="var(--ck-frost-2)" strokeWidth="2.2" opacity=".5" />)}
          <path d={DRIPS_BOT} fill={`url(#${id("drip")})`} />
          <ellipse cx={BOT.cx} cy={BOT.cy} rx={BOT.rx} ry={BOT.ry} fill="var(--ck-cream)" />
          <ellipse cx={BOT.cx} cy={BOT.cy + 1} rx={BOT.rx - 12} ry={BOT.ry - 4} fill="#fff" opacity=".45" />
          {DOTS_BOT.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="4.3" fill="var(--ck-cream)" stroke="rgba(0,0,0,.1)" strokeWidth=".8" />)}
          <text x="180" y="226" textAnchor="middle" fontFamily="'Dancing Script', cursive" fontWeight="700" fontSize="30" style={{ fill: "var(--ck-text)" }} stroke="rgba(0,0,0,.18)" strokeWidth=".6">Happy Birthday</text>

          {/* top tier */}
          <path d={bodyPath(TOP)} fill={`url(#${id("frost")})`} />
          <path d={bodyPath(TOP)} fill={`url(#${id("sheen")})`} />
          <path d={`M${TOP.cx - TOP.rx},${TOP.cy + 28} A${TOP.rx},${TOP.ry} 0 0 0 ${TOP.cx + TOP.rx},${TOP.cy + 28}`} fill="none" stroke="var(--ck-frost-2)" strokeWidth="2.2" opacity=".5" />
          <path d={DRIPS_TOP} fill={`url(#${id("drip")})`} />
          <ellipse cx={TOP.cx} cy={TOP.cy} rx={TOP.rx} ry={TOP.ry} fill="var(--ck-cream)" />
          <ellipse cx={TOP.cx} cy={TOP.cy + 1} rx={TOP.rx - 10} ry={TOP.ry - 3} fill="#fff" opacity=".5" />
          {DOTS_TOP.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="3.6" fill="var(--ck-cream)" stroke="rgba(0,0,0,.1)" strokeWidth=".8" />)}
        </g>

        {/* toppers (cherries, or roses / stars / hibiscus / planets depending on the theme) */}
        {[[60, 170], [300, 170], [108, 118], [252, 118]].map(([x, y], i) => {
          const hide = out && cuts.length === 2 && x > g1 - 12 && x < g2 + 12;
          return (
            <g key={i} className={`ck-candle ${hide ? "away" : ""}`}>
              <SlotArt theme={themeId} x={x} y={y} i={i} uid={uid} />
            </g>
          );
        })}

        {/* candles */}
        {CANDLES.map((x, i) => {
          const hide = cuts.length === 2 && x > g1 - 10 && x < g2 + 10;
          return (
            <g key={x} className={`ck-candle ${hide ? "away" : ""}`} onClick={blow} style={{ cursor: phase === "idle" ? "pointer" : "default" }}>
              <rect x={x - 3.6} y="80" width="7.2" height="38" rx="2.4" style={{ fill: `var(--gift-${(i % 4) + 1})` }} />
              {[88, 100, 112].map((y) => <rect key={y} x={x - 3.6} y={y} width="7.2" height="4" fill="#fff" opacity=".42" />)}
              <rect x={x - 3.6} y="80" width="2.4" height="38" rx="1" fill="#fff" opacity=".28" />
              <path d={`M${x},80 v-5`} stroke="#3b2a22" strokeWidth="1.4" strokeLinecap="round" />
              <circle className="ck-glow" cx={x} cy="66" r="17" fill={`url(#${id("glow")})`} />
              <path className="ck-flame" d={`M${x},51 C${x + 8},60 ${x + 6.5},72 ${x},74 C${x - 6.5},72 ${x - 8},60 ${x},51 Z`} fill={`url(#${id("flame")})`} />
              <circle cx={x} cy="68" r="7" fill="transparent" className="ck-hit" />
              <g className="ck-smoke"><path d={`M${x},60 q5,-9 0,-18 q-5,-9 0,-18`} style={{ animationDelay: `${i * 0.08}s` }} /></g>
            </g>
          );
        })}

        {/* cut grooves (live one while dragging, then the finished ones) */}
        <g clipPath={`url(#${id("sil")})`}>
          <rect ref={grooveRef} x="0" y="0" width="3.2" height="0" fill="rgba(52,18,28,.78)" />
          {cuts.map((x, i) => (
            <g key={i}>
              <rect x={x - 1.6} y={startYFor(x) - 2} width="3.2" height={CUT_END - startYFor(x) + 4} fill="rgba(52,18,28,.78)" />
              <rect x={x + 1.6} y={startYFor(x) - 2} width="1" height={CUT_END - startYFor(x) + 4} fill="#fff" opacity=".4" />
            </g>
          ))}
        </g>

        {/* the open gap: you can see the sponge layers inside */}
        {cuts.length === 2 && (
          <g clipPath={`url(#${id("sil")})`}>
            <g clipPath={`url(#${id("gap")})`}>
              <g className="ck-gap" style={{ transformOrigin: `${mid}px 190px`, transformBox: "view-box" }}>
                <rect x={g1} y="96" width={g2 - g1} height="190" style={{ fill: "var(--ck-sponge)" }} />
                {CRUMBS.map(([a, b, r], i) => <circle key={i} cx={g1 + a * (g2 - g1)} cy={112 + b * 156} r={r} style={{ fill: "var(--ck-sponge-2)" }} opacity=".55" />)}
                <rect x={g1} y="118" width={g2 - g1} height="6" fill="var(--ck-cream)" />
                <rect x={g1} y="142" width={g2 - g1} height="6" style={{ fill: "var(--ck-fill)" }} opacity=".9" />
                <rect x={g1} y="172" width={g2 - g1} height="7" fill="var(--ck-cream)" />
                <rect x={g1} y="206" width={g2 - g1} height="6" style={{ fill: "var(--ck-fill)" }} opacity=".9" />
                <rect x={g1} y="234" width={g2 - g1} height="7" fill="var(--ck-cream)" />
                <rect x={g1} y="96" width={g2 - g1} height="190" fill={`url(#${id("cavity")})`} />
              </g>
            </g>
          </g>
        )}

        {/* the slice, lifted onto the serving plate */}
        {cuts.length === 2 && (
          <g className="ck-slice" style={{ transform: served ? `translate(${SERVE.cx}px, ${SERVE.cy - 8}px) scale(1.18)` : `translate(${mid}px, 212px) scale(0.92)` }}>
            <polygon points="30,-26 46,-37 46,22 30,34" style={{ fill: "var(--ck-sponge-2)" }} />
            <g>
              <rect x="-30" y="-26" width="60" height="60" rx="2" style={{ fill: "var(--ck-sponge)" }} />
              <rect x="-30" y="-6" width="60" height="5" style={{ fill: "var(--ck-fill)" }} opacity=".9" />
              <rect x="-30" y="12" width="60" height="5" fill="var(--ck-cream)" />
              <rect x="-30" y="-26" width="60" height="9" fill="var(--ck-cream)" />
              <path d="M-30,-17 q5,9 10,0 q5,9 10,0 q5,9 10,0 q5,9 10,0 q5,9 10,0 q5,9 10,0" style={{ fill: "var(--ck-cream)" }} />
              <rect x="-30" y="-26" width="60" height="60" rx="2" fill="none" stroke="rgba(0,0,0,.12)" />
            </g>
            <polygon points="-30,-26 -15,-37 46,-37 30,-26" fill="var(--ck-cream)" />
            <circle cx="6" cy="-42" r="7.5" style={{ fill: "var(--ck-berry)" }} />
            <circle cx="3.6" cy="-44.4" r="2.2" fill="#fff" opacity=".7" />
          </g>
        )}

        {/* the knife */}
        {knifeOn && (
          <g
            ref={knifeRef}
            className={`ck-knife ${phase === "blown" ? "ck-knife-hint" : ""}`}
            style={{ transform: REST_T, touchAction: "none" }}
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          >
            <g transform="scale(1.2)">
            <ellipse cx="0" cy="6" rx="11" ry="3.5" fill="#000" opacity=".12" />
            <path d="M-8,-76 H8 V-22 Q8,-8 0,4 L-8,-8 Z" fill={`url(#${id("steel")})`} stroke="rgba(0,0,0,.18)" strokeWidth=".6" />
            <path d="M-4,-70 V-14" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
            <rect x="-10" y="-82" width="20" height="8" rx="3" fill={`url(#${id("steel")})`} stroke="rgba(0,0,0,.2)" strokeWidth=".6" />
            <rect x="-8" y="-128" width="16" height="48" rx="7" fill={`url(#${id("wood")})`} />
            {[-118, -104, -90].map((y) => <circle key={y} cx="0" cy={y} r="1.8" fill="#e8dcc6" />)}
            <rect x="-22" y="-134" width="44" height="146" fill="transparent" />
            </g>
          </g>
        )}
      </svg>

      <div className="bd-steps" aria-live="polite">
        <div className="bd-step" key={phase}><b>{step[0]}</b><span>{step[1]}</span></div>
        {phase === "idle" && <button className="bd-btn" onClick={blow}>Blow the candles</button>}
        {knifeOn && <button className="bd-btn bd-btn-ghost" onClick={autoCut}>Cut it for me</button>}
        {phase === "done" && <button className="bd-btn bd-btn-ghost" onClick={reset}>Cut another cake</button>}
      </div>
    </div>
  );
}
