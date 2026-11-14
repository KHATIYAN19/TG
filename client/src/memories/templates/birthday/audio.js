/*
  SOUND (no audio files)
  Everything is synthesised with the Web Audio API: the Happy Birthday tune, balloon pops, party
  poppers, the knife, candles, gifts and chocolate crunches. The browser only allows audio after a
  tap, so `unlock()` is called from the first "Open" button.
*/
const NOTE = {
  C2: 65.41, F2: 87.31, G2: 98, A2: 110, C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196, A3: 220, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568, C7: 2093,
};

export function createSound() {
  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let volume = 0.7;
  let muted = false;
  let song = null; // { bus, timer }
  let dead = false; // the page was closed: nothing may make a sound any more
  let held = false; // the page is hidden (other tab, phone locked, preview scrolled away): everything waits

  const gainValue = () => (muted ? 0 : volume * volume * 1.15);

  function ensure() {
    if (dead || held) return null;
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 6;
      master.connect(comp);
      comp.connect(ctx.destination);
      master.gain.value = gainValue();
      const len = ctx.sampleRate * 2;
      noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, t, dur, { type = "sine", gain = 0.2, attack = 0.01, release = 0.12, vib = 0, glideTo, dest } = {}) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
    if (vib) {
      const l = ctx.createOscillator();
      const lg = ctx.createGain();
      l.frequency.value = 5.2;
      lg.gain.value = freq * 0.007 * vib;
      l.connect(lg); lg.connect(o.frequency);
      l.start(t); l.stop(t + dur + release + 0.05);
    }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.setValueAtTime(gain, t + Math.max(attack, dur - release * 0.4));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + release);
    o.connect(g); g.connect(dest || master);
    o.start(t); o.stop(t + dur + release + 0.06);
  }

  function noise(t, dur, { type = "bandpass", freq = 1500, q = 0.8, gain = 0.3, attack = 0.003, sweepTo, dest } = {}) {
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf;
    s.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.setValueAtTime(freq, t);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || master);
    s.start(t, Math.random()); s.stop(t + dur + 0.05);
  }

  const now = () => ctx.currentTime;
  /* the song is over when the AUDIO clock says so (that clock stops while the page is hidden) */
  function watch(bus, secs, onEnd) {
    const endAt = now() + secs;
    const s = { bus, timer: setInterval(() => {
      if (!ctx || ctx.currentTime < endAt) return;
      clearInterval(s.timer);
      if (song === s) song = null;
      onEnd?.();
    }, 250) };
    return s;
  }
  const applyGain = () => {
    if (!master) return;
    const t = now();
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(gainValue(), t, 0.015);
  };
  const run = (fn) => (...a) => { if (!ensure()) return; fn(...a); };

  const sfx = {
    pop: run(() => {
      const t = now();
      noise(t, 0.09, { freq: 1900, q: 0.7, gain: 0.55 });
      tone(240, t, 0.08, { type: "sine", gain: 0.45, glideTo: 55, attack: 0.002, release: 0.04 });
    }),
    bang: run(() => { // party popper
      const t = now();
      noise(t, 0.2, { type: "highpass", freq: 400, q: 0.4, gain: 0.85 });
      tone(120, t, 0.28, { type: "sine", gain: 0.6, glideTo: 38, attack: 0.002, release: 0.1 });
      for (let i = 0; i < 9; i++) noise(t + 0.05 + Math.random() * 0.5, 0.04, { type: "highpass", freq: 2500, gain: 0.18 });
    }),
    swish: run(() => noise(now(), 0.28, { freq: 1400, sweepTo: 380, q: 1.2, gain: 0.22, attack: 0.05 })),
    tick: run(() => noise(now(), 0.035, { type: "lowpass", freq: 2200, gain: 0.12 })),
    chop: run(() => {
      const t = now();
      tone(170, t, 0.12, { type: "sine", gain: 0.5, glideTo: 60, attack: 0.002, release: 0.06 });
      noise(t, 0.12, { type: "lowpass", freq: 900, gain: 0.4 });
      noise(t + 0.02, 0.05, { type: "highpass", freq: 3500, gain: 0.15 });
    }),
    whoosh: run(() => { // blowing out candles
      const t = now();
      noise(t, 0.8, { type: "lowpass", freq: 350, sweepTo: 1300, q: 0.7, gain: 0.5, attack: 0.18 });
    }),
    shutter: run(() => { // camera click: two quick snaps
      const t = now();
      noise(t, 0.04, { type: "highpass", freq: 2500, gain: 0.5 });
      tone(900, t, 0.03, { type: "square", gain: 0.12, glideTo: 300, attack: 0.001, release: 0.02 });
      noise(t + 0.09, 0.05, { type: "highpass", freq: 1800, gain: 0.4 });
      tone(600, t + 0.09, 0.04, { type: "square", gain: 0.1, glideTo: 200, attack: 0.001, release: 0.03 });
    }),
    chime: run(() => {
      const t = now();
      ["C6", "E6", "G6", "C7"].forEach((n, i) => tone(NOTE[n], t + i * 0.075, 0.5, { gain: 0.14, release: 0.5 }));
    }),
    tada: run(() => {
      const t = now();
      [["C5", 0], ["E5", 0.09], ["G5", 0.18], ["C6", 0.3]].forEach(([n, d]) => tone(NOTE[n], t + d, 0.25, { type: "triangle", gain: 0.2, release: 0.3 }));
      tone(NOTE.C6 * 1.5, t + 0.3, 0.5, { type: "sine", gain: 0.1, release: 0.5 });
    }),
    crunch: run(() => {
      const t = now();
      for (let i = 0; i < 3; i++) noise(t + i * 0.035, 0.03, { type: "highpass", freq: 1600 + Math.random() * 800, gain: 0.35 });
      tone(110, t, 0.06, { gain: 0.25, glideTo: 70, release: 0.04 });
    }),
    cheer: run(() => { // applause
      const t = now();
      for (let i = 0; i < 48; i++) noise(t + Math.random() * 1.6, 0.03 + Math.random() * 0.03, { type: "bandpass", freq: 1200 + Math.random() * 2400, q: 0.6, gain: 0.07 + Math.random() * 0.1 });
    }),
    boing: run(() => tone(220, now(), 0.22, { type: "triangle", gain: 0.25, glideTo: 520, release: 0.1 })),
    squeak: run(() => { const t = now(); tone(620, t, 0.09, { type: "sine", gain: 0.22, glideTo: 940, attack: 0.004, release: 0.05 }); tone(780, t + 0.1, 0.07, { type: "sine", gain: 0.16, glideTo: 1100, attack: 0.004, release: 0.05 }); }),
    sniff: run(() => { const t = now(); noise(t, 0.09, { type: "bandpass", freq: 2600, q: 1.4, gain: 0.1 }); noise(t + 0.13, 0.12, { type: "bandpass", freq: 2200, q: 1.4, gain: 0.08 }); }),
    heartbeat: run(() => { const t = now(); [0, 0.19, 0.95, 1.14].forEach((d) => tone(70, t + d, 0.12, { type: "sine", gain: 0.5, glideTo: 42, attack: 0.004, release: 0.07 })); }),
    drip: run(() => tone(980, now(), 0.12, { type: "sine", gain: 0.16, glideTo: 520, attack: 0.002, release: 0.06 })),
    nope: run(() => { const t = now(); tone(420, t, 0.12, { type: "triangle", gain: 0.2, glideTo: 300, release: 0.05 }); tone(300, t + 0.12, 0.14, { type: "triangle", gain: 0.18, glideTo: 220, release: 0.06 }); }),
    mend: run(() => { // a golden shimmer when the heart is whole again
      const t = now();
      noise(t, 0.7, { type: "highpass", freq: 3500, gain: 0.07, attack: 0.2 });
      ["E5", "G5", "C6", "E6", "G6", "C7"].forEach((n, i) => tone(NOTE[n], t + i * 0.09, 0.8, { gain: 0.12, release: 0.8 }));
    }),
    clink: run(() => { // two glasses touching
      const t = now();
      [[2640, 0], [3380, 0.012], [1980, 0.02]].forEach(([f, d]) => tone(f, t + d, 0.55, { type: "sine", gain: 0.12, attack: 0.001, release: 0.9 }));
      noise(t, 0.04, { type: "highpass", freq: 5000, gain: 0.18 });
    }),
    fizz: run(() => { const t = now(); noise(t, 0.7, { type: "highpass", freq: 5200, gain: 0.07, attack: 0.1 }); for (let i = 0; i < 12; i++) noise(t + Math.random() * 0.6, 0.02, { type: "highpass", freq: 6500, gain: 0.05 }); }),
    lantern: run(() => { const t = now(); noise(t, 1.0, { type: "lowpass", freq: 300, sweepTo: 1100, q: 0.6, gain: 0.16, attack: 0.3 }); ["G5", "C6", "E6"].forEach((n, i) => tone(NOTE[n], t + 0.15 + i * 0.12, 0.7, { gain: 0.07, release: 0.8 })); }),
    kiss: run(() => { const t = now(); tone(900, t, 0.07, { type: "sine", gain: 0.22, glideTo: 420, attack: 0.003, release: 0.04 }); noise(t, 0.05, { type: "bandpass", freq: 1800, q: 1.2, gain: 0.09 }); }),
    yes: run(() => { const t = now(); [["C5", 0], ["E5", 0.1], ["G5", 0.2], ["C6", 0.32], ["E6", 0.46], ["G6", 0.6]].forEach(([n, d]) => tone(NOTE[n], t + d, 0.3, { type: "triangle", gain: 0.2, release: 0.5 })); }),
    jingle: run(() => { // sleigh bells
      const t = now();
      for (let i = 0; i < 8; i++) {
        const d = i * 0.08;
        tone(2600 + (i % 3) * 430, t + d, 0.16, { type: "sine", gain: 0.09, release: 0.2 });
        noise(t + d, 0.05, { type: "highpass", freq: 6000, gain: 0.07 });
      }
    }),
    rustle: run(() => noise(now(), 0.25, { type: "highpass", freq: 3000, gain: 0.12, attack: 0.05 })),
  };

  /* Rain ambience: a soft filtered-noise bed. level 0..1 (0 = silent). */
  let rainNode = null;
  function rain(level) {
    if (!ensure()) return;
    if (!rainNode) {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf; src.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 900;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6500;
      const g = ctx.createGain(); g.gain.value = 0;
      src.connect(hp); hp.connect(lp); lp.connect(g); g.connect(master);
      src.start();
      rainNode = { src, g };
    }
    rainNode.g.gain.setTargetAtTime(Math.max(0, Math.min(1, level)) * 0.11, now(), 0.4);
  }

  function stopSong(silent) {
    if (!song) return;
    clearInterval(song.timer);
    try {
      song.bus.gain.cancelScheduledValues(now());
      song.bus.gain.setTargetAtTime(0, now(), 0.04);
      const old = song.bus;
      setTimeout(() => { try { old.disconnect(); } catch { /* already gone */ } }, 600);
    } catch { /* ignore */ }
    song = null;
    if (!silent) return;
  }

  return {
    unlock: ensure,
    sfx,
    rain,
    stopSong,
    setVolume(v) { volume = Math.max(0, Math.min(1, Number(v) || 0)); applyGain(); },
    setMuted(m) { muted = Boolean(m); applyGain(); },
    get volume() { return volume; },
    get muted() { return muted; },
    /** Page hidden: freeze every sound exactly where it is. Page back: carry on. */
    hold() {
      if (held || dead) return;
      held = true;
      if (ctx && ctx.state === "running") ctx.suspend().catch(() => {});
    },
    release() {
      if (!held || dead) return;
      held = false;
      if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
    },
    /** Used when the page mounts again with the same sound object (React re-runs effects in development). */
    wake() { dead = false; },
    destroy() {
      dead = true;
      stopSong();
      try { rainNode?.src.stop(); } catch { /* ignore */ }
      rainNode = null;
      try { master?.disconnect(); ctx?.close(); } catch { /* ignore */ }
      ctx = null; master = null;
    },
  };
}
