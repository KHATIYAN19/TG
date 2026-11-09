/*
  CANVAS EFFECTS
  One full-screen canvas draws every particle: confetti, party-popper streamers, balloon-burst shards,
  fireworks, crumbs and hearts. It only runs while there is something to draw.
*/
const TAU = Math.PI * 2;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const MAX_PARTICLES = 1600;

export const prefersReducedMotion = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};

export function createFx(canvas, getStyle) {
  const ctx = canvas.getContext("2d");
  let parts = [];
  let raf = 0;
  let last = 0;
  let W = 0;
  let H = 0;
  let running = false;
  const scale = () => (prefersReducedMotion() ? 0.35 : 1);
  // getStyle() -> { colors: [...], shapes: ["heart", "rect", ...] } (the current theme)
  const colors = () => getStyle?.()?.colors || ["#ff4d94", "#ffb347", "#7dd3fc", "#a78bfa", "#fde047"];
  const shapes = () => getStyle?.()?.shapes || ["rect", "rect", "rect", "circle", "star", "heart"];

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener("resize", resize);

  const base = { vx: 0, vy: 0, g: 600, drag: 0.99, rot: 0, vr: 0, tilt: 0, vt: 0, life: 2, fade: 0.5, size: 8, color: "#fff", kind: "rect" };
  const add = (p) => {
    if (parts.length >= MAX_PARTICLES) return;
    parts.push({ ...base, ...p });
    if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(loop); }
  };

  function star(r) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const rr = i % 2 ? r * 0.45 : r;
      ctx[i ? "lineTo" : "moveTo"](Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
  function heart(s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.45);
    ctx.bezierCurveTo(s * 0.5, -s, s, -s * 0.3, 0, s * 0.35);
    ctx.fill();
  }

  function draw(p) {
    const a = Math.max(0, Math.min(1, p.life / p.fade));
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.strokeStyle = p.color;
    if (p.kind === "ring") {
      ctx.lineWidth = Math.max(1, 5 * a);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, TAU);
      ctx.stroke();
      return;
    }
    if (p.kind === "spark") {
      ctx.globalCompositeOperation = "lighter";
      ctx.lineWidth = p.w || 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.045, p.y - p.vy * 0.045);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      return;
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    if (p.kind === "rect") {
      ctx.scale(1, Math.cos(p.tilt));
      ctx.fillRect(-p.size / 2, -p.size * 0.3, p.size, p.size * 0.6);
    } else if (p.kind === "streamer") {
      ctx.scale(1, Math.cos(p.tilt));
      ctx.fillRect(-1.6, -p.size / 2, 3.2, p.size);
    } else if (p.kind === "circle") {
      ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, TAU); ctx.fill();
    } else if (p.kind === "star") {
      star(p.size / 2);
    } else if (p.kind === "heart") {
      heart(p.size / 2);
    } else if (p.kind === "petal") {
      ctx.scale(1, 0.55 + 0.45 * Math.cos(p.tilt));
      ctx.beginPath();
      ctx.moveTo(0, -p.size * 0.6);
      ctx.bezierCurveTo(p.size * 0.55, -p.size * 0.3, p.size * 0.45, p.size * 0.45, 0, p.size * 0.6);
      ctx.bezierCurveTo(-p.size * 0.45, p.size * 0.45, -p.size * 0.55, -p.size * 0.3, 0, -p.size * 0.6);
      ctx.fill();
    } else if (p.kind === "shard") {
      ctx.beginPath();
      ctx.moveTo(0, -p.size); ctx.lineTo(p.size * 0.6, p.size * 0.5); ctx.lineTo(-p.size * 0.5, p.size * 0.4);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function loop(t) {
    const dt = Math.min(0.033, (t - last) / 1000);
    last = t;
    ctx.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt;
      if (p.life <= 0 || p.y > H + 80 || p.x < -80 || p.x > W + 80) {
        parts[i] = parts[parts.length - 1];
        parts.pop();
        continue;
      }
      const d = Math.pow(p.drag, dt * 60);
      p.vx *= d;
      p.vy = p.vy * d + p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.tilt += p.vt * dt;
      if (p.grow) p.size += p.grow * dt;
      draw(p);
    }
    ctx.globalAlpha = 1;
    if (parts.length) raf = requestAnimationFrame(loop);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  }

  const api = {
    /** A burst of paper confetti from a point. */
    confetti(x, y, { n = 70, angle = -Math.PI / 2, spread = TAU, power = 520, gravity = 800, life = [1.6, 2.8], kinds, palette } = {}) {
      const count = Math.round(n * scale());
      const shapeList = kinds || shapes();
      const colorList = palette || colors();
      for (let i = 0; i < count; i++) {
        const a = angle + rnd(-spread / 2, spread / 2);
        const v = rnd(0.25, 1) * power;
        const kind = pick(shapeList);
        add({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: gravity, drag: 0.985,
          rot: rnd(0, TAU), vr: rnd(-8, 8), tilt: rnd(0, TAU), vt: rnd(4, 11),
          size: rnd(7, 13), color: pick(colorList), kind, life: rnd(...life), fade: 0.6,
        });
      }
    },
    /** Party popper: a cone of confetti and long streamers shot from a corner. */
    popper(x, y, dir = 1) {
      const angle = dir > 0 ? -Math.PI / 2.6 : (-Math.PI * 1.6) / 2.6;
      api.confetti(x, y, { n: 60, angle, spread: 0.9, power: 860, gravity: 900, life: [1.8, 3] });
      const count = Math.round(20 * scale());
      for (let i = 0; i < count; i++) {
        const a = angle + rnd(-0.45, 0.45);
        const v = rnd(0.45, 1) * 800;
        add({
          x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 520, drag: 0.972,
          rot: a + Math.PI / 2, vr: rnd(-3, 3), tilt: 0, vt: rnd(6, 12),
          size: rnd(22, 46), color: pick(colors()), kind: "streamer", life: rnd(1.8, 2.8), fade: 0.6,
        });
      }
    },
    /** Balloon burst: coloured shards, a shock ring and a few sparkles. */
    pop(x, y, color = "#ff4d94") {
      const count = Math.round(16 * scale());
      for (let i = 0; i < count; i++) {
        const a = rnd(0, TAU);
        const v = rnd(120, 420);
        add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 700, drag: 0.96, rot: a, vr: rnd(-10, 10), size: rnd(5, 11), color, kind: "shard", life: rnd(0.5, 0.95), fade: 0.4 });
      }
      add({ x, y, g: 0, drag: 1, size: 8, grow: 190, color, kind: "ring", life: 0.4, fade: 0.4 });
      api.sparkle(x, y, { n: 8 });
    },
    sparkle(x, y, { n = 14, color } = {}) {
      const count = Math.round(n * scale());
      for (let i = 0; i < count; i++) {
        const a = rnd(0, TAU);
        const v = rnd(80, 340);
        add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 120, drag: 0.94, size: rnd(5, 10), color: color || pick(["#ffffff", "#fff3b0", "#ffd166"]), kind: "star", rot: rnd(0, TAU), vr: rnd(-6, 6), life: rnd(0.5, 1), fade: 0.5 });
      }
    },
    firework(x, y) {
      const hue = pick(colors());
      const count = Math.round(70 * scale());
      for (let i = 0; i < count; i++) {
        const a = (i / count) * TAU + rnd(-0.05, 0.05);
        const v = rnd(160, 440);
        add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 260, drag: 0.955, color: i % 5 === 0 ? "#ffffff" : hue, kind: "spark", w: rnd(1.6, 3), life: rnd(0.9, 1.5), fade: 0.7 });
      }
      add({ x, y, g: 0, drag: 1, size: 6, grow: 260, color: hue, kind: "ring", life: 0.5, fade: 0.5 });
    },
    crumbs(x, y, color = "#b9794b", n = 14) {
      const count = Math.round(n * scale());
      for (let i = 0; i < count; i++) {
        const a = rnd(-Math.PI, 0);
        const v = rnd(60, 260);
        add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 900, drag: 0.97, size: rnd(2.5, 5.5), color, kind: "circle", life: rnd(0.6, 1.1), fade: 0.4 });
      }
    },
    hearts(x, y, n = 12, palette) {
      const count = Math.round(n * scale());
      for (let i = 0; i < count; i++) {
        add({ x: x + rnd(-14, 14), y, vx: rnd(-60, 60), vy: rnd(-260, -120), g: -20, drag: 0.985, size: rnd(12, 22), color: pick(palette || ["#ff4d94", "#ff7aa8", "#ff9ec4", "#ffffff"]), kind: "heart", life: rnd(1.1, 1.8), fade: 0.6, rot: rnd(-0.4, 0.4) });
      }
    },
    /** Confetti falling from the whole top edge. */
    rain(ms = 2200) {
      const start = performance.now();
      const tick = () => {
        const left = ms - (performance.now() - start);
        if (left <= 0) return;
        api.confetti(rnd(0, W), -10, { n: 7, angle: Math.PI / 2, spread: 0.9, power: 220, gravity: 380, life: [3, 4.5] });
        setTimeout(tick, 90);
      };
      tick();
    },
    clear() { parts = []; },
    destroy() { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); parts = []; running = false; },
    size: () => ({ W, H }),
  };
  return api;
}
