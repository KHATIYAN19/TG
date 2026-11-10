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

/* Happy Birthday in 3/4: [note, beats]. 24 beats = 8 bars. */
const TUNE = [
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["C5", 1], ["B4", 2],
  ["G4", 0.75], ["G4", 0.25], ["A4", 1], ["G4", 1], ["D5", 1], ["C5", 2],
  ["G4", 0.75], ["G4", 0.25], ["G5", 1], ["E5", 1], ["C5", 1], ["B4", 1], ["A4", 1],
  ["F5", 0.75], ["F5", 0.25], ["E5", 1], ["C5", 1], ["D5", 1], ["C5", 2],
];
/* one chord per bar: [bass, [chord tones]] */
const BARS = [
  ["C2", ["E3", "G3"]], ["G2", ["D3", "B3"]], ["G2", ["D3", "B3"]], ["C2", ["E3", "G3"]],
  ["C2", ["E3", "G3"]], ["F2", ["A3", "C4"]], ["F2", ["A3", "C4"]], ["C2", ["E3", "G3"]],
];

export function createSound() {
  let ctx = null;
  let master = null;
  let noiseBuf = null;
  let volume = 0.7;
  let muted = false;
  let song = null; // { gain, timer }

  const gainValue = () => (muted ? 0 : volume * volume * 1.15);

  function ensure() {
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
    if (ctx.state === "suspended") ctx.resume();
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
    rustle: run(() => noise(now(), 0.25, { type: "highpass", freq: 3000, gain: 0.12, attack: 0.05 })),
  };

  function playSong({ tempo = 112, onEnd } = {}) {
    if (!ensure()) return 0;
    stopSong(true);
    const beat = 60 / tempo;
    const bus = ctx.createGain();
    bus.gain.value = 1;
    bus.connect(master);
    const t0 = now() + 0.08;

    let t = t0;
    for (const [n, b] of TUNE) {
      const dur = b * beat;
      const f = NOTE[n];
      tone(f, t, dur * 0.92, { type: "triangle", gain: 0.2, attack: 0.012, release: 0.16, vib: dur > 1 ? 1 : 0, dest: bus });
      tone(f * 2, t, dur * 0.5, { type: "sine", gain: 0.05, attack: 0.005, release: 0.22, dest: bus }); // music-box sparkle
      t += dur;
    }
    BARS.forEach(([bass, chord], i) => {
      const bt = t0 + i * 3 * beat;
      tone(NOTE[bass], bt, beat * 0.9, { type: "triangle", gain: 0.2, attack: 0.01, release: 0.2, dest: bus });
      [1, 2].forEach((k) => chord.forEach((c) => tone(NOTE[c], bt + k * beat, beat * 0.55, { type: "sine", gain: 0.06, attack: 0.01, release: 0.15, dest: bus })));
    });
    const total = t - t0;
    const timer = setTimeout(() => { song = null; onEnd?.(); }, (total + 0.6) * 1000);
    song = { bus, timer };
    return total;
  }

  /* Lullaby: a music-box arpeggio over C - G - Am - F. `bright` = the happy, faster, major version. Loops until stopped. */
  function playLullaby({ bright = false, bars = 16, onEnd } = {}) {
    if (!ensure()) return 0;
    stopSong(true);
    const tempo = bright ? 104 : 66;
    const beat = 60 / tempo;
    const bus = ctx.createGain();
    bus.gain.value = bright ? 0.9 : 0.75;
    bus.connect(master);
    const t0 = now() + 0.1;
    const PROG = [["C3", ["C4", "E4", "G4", "C5"]], ["G2", ["B3", "D4", "G4", "B4"]], ["A2", ["C4", "E4", "A4", "C5"]], ["F2", ["C4", "F4", "A4", "C5"]]];
    for (let bar = 0; bar < bars; bar++) {
      const [bass, chord] = PROG[bar % 4];
      const bt = t0 + bar * 4 * beat;
      tone(NOTE[bass] || 130, bt, beat * 3.6, { type: "triangle", gain: 0.14, attack: 0.05, release: 0.5, dest: bus });
      for (let i = 0; i < 8; i++) { // eighth-note arpeggio
        const pattern = [0, 1, 2, 3, 2, 1, 2, 1][i];
        const f = NOTE[chord[pattern]] || 440;
        const when = bt + i * (beat / 2);
        tone(f, when, beat * 0.9, { type: "sine", gain: bright ? 0.13 : 0.1, attack: 0.004, release: 0.6, dest: bus });
        if (bright || i % 4 === 0) tone(f * 2, when, beat * 0.4, { type: "sine", gain: 0.035, attack: 0.003, release: 0.4, dest: bus });
      }
    }
    const total = bars * 4 * beat;
    const timer = setTimeout(() => { song = null; onEnd?.(); }, (total + 0.8) * 1000);
    song = { bus, timer };
    return total;
  }

  /* Romance: a slow waltz in 3/4 (a warm arpeggio, a singing top line and a gentle bass). Loops until stopped. */
  function playRomance({ bars = 24, onEnd } = {}) {
    if (!ensure()) return 0;
    stopSong(true);
    const beat = 60 / 86;
    const bus = ctx.createGain();
    bus.gain.value = 0.85;
    bus.connect(master);
    const t0 = now() + 0.1;
    // [bass, chord tones, two melody notes]
    const PROG = [
      ["C3", ["E4", "G4", "C5"], ["E5", "G5"]], ["E3", ["G4", "B4", "E5"], ["G5", "E5"]],
      ["A2", ["E4", "A4", "C5"], ["A5", "E5"]], ["F2", ["F4", "A4", "C5"], ["F5", "C5"]],
      ["D3", ["F4", "A4", "D5"], ["D5", "F5"]], ["G2", ["D4", "G4", "B4"], ["D5", "B4"]],
      ["C3", ["E4", "G4", "C5"], ["C5", "E5"]], ["G2", ["D4", "G4", "B4"], ["D5", "C5"]],
    ];
    for (let bar = 0; bar < bars; bar++) {
      const [bass, chord, mel] = PROG[bar % 8];
      const bt = t0 + bar * 3 * beat;
      tone(NOTE[bass], bt, beat * 2.6, { type: "triangle", gain: 0.17, attack: 0.04, release: 0.5, dest: bus });
      [1, 2].forEach((k) => chord.forEach((c, i) => tone(NOTE[c], bt + k * beat + i * 0.025, beat * 0.9, { type: "sine", gain: 0.055, attack: 0.01, release: 0.35, dest: bus })));
      tone(NOTE[mel[0]], bt, beat * 1.6, { type: "triangle", gain: 0.11, attack: 0.03, release: 0.5, vib: 1, dest: bus });
      tone(NOTE[mel[1]], bt + beat * 2, beat * 0.95, { type: "triangle", gain: 0.09, attack: 0.03, release: 0.5, vib: 1, dest: bus });
      tone(NOTE[mel[0]] * 2, bt, beat * 0.5, { type: "sine", gain: 0.03, attack: 0.004, release: 0.5, dest: bus });
    }
    const total = bars * 3 * beat;
    const timer = setTimeout(() => { song = null; onEnd?.(); }, (total + 0.8) * 1000);
    song = { bus, timer };
    return total;
  }

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
    clearTimeout(song.timer);
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
    playSong,
    playLullaby,
    playRomance,
    rain,
    stopSong,
    isSongPlaying: () => Boolean(song),
    setVolume(v) { volume = Math.max(0, Math.min(1, v)); if (master) master.gain.setTargetAtTime(gainValue(), now(), 0.03); },
    setMuted(m) { muted = Boolean(m); if (master) master.gain.setTargetAtTime(gainValue(), now(), 0.03); },
    get volume() { return volume; },
    get muted() { return muted; },
    destroy() { stopSong(); try { rainNode?.src.stop(); ctx?.close(); } catch { /* ignore */ } },
  };
}
