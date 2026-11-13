import { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2, Mic, Pause, Play, Square, Trash2, UploadCloud } from "lucide-react";

import { AUDIO_ACCEPT, AUDIO_TYPES, baseType, mbOf } from "./mediaRules";
import { secLabel } from "./pricing";
import { cx } from "./ui";

const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const RECORD_TYPES = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
const pickType = () => (typeof MediaRecorder === "undefined" ? "" : RECORD_TYPES.find((t) => MediaRecorder.isTypeSupported?.(t)) || "");
const EXT = { "audio/webm": "webm", "audio/mp4": "m4a", "audio/ogg": "ogg" };

const readDuration = (file) => new Promise((resolve) => {
  const url = URL.createObjectURL(file);
  const a = new Audio();
  const done = (v) => { URL.revokeObjectURL(url); resolve(v); };
  const t = setTimeout(() => done(null), 5000);
  a.preload = "metadata";
  a.onloadedmetadata = () => { clearTimeout(t); done(Number.isFinite(a.duration) ? a.duration : null); };
  a.onerror = () => { clearTimeout(t); done(null); };
  a.src = url;
});

/* a small player for what is already saved / chosen */
function Preview({ src, durationSec }) {
  const el = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(durationSec || 0);
  const toggle = () => { const a = el.current; if (!a) return; if (a.paused) a.play().catch(() => {}); else a.pause(); };
  return (
    <div className="flex items-center gap-3">
      <audio
        ref={el} src={src} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setT(0); }}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDur(e.currentTarget.duration)}
      />
      <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play your voice message"} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-md shadow-rose-200">
        {playing ? <Pause className="h-5 w-5" fill="currentColor" aria-hidden /> : <Play className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden />}
      </button>
      <div className="min-w-0 flex-1">
        <div className="h-1.5 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400" style={{ width: dur ? `${Math.min(100, (t / dur) * 100)}%` : "0%" }} /></div>
        <p className="mt-1 text-xs tabular-nums text-[#8a6a80]">{clock(t)}{dur ? ` / ${clock(dur)}` : ""}</p>
      </div>
    </div>
  );
}

/**
 * A VOICE MESSAGE for the page: record it with the microphone (up to 2 minutes) or upload an audio file. The browser asks for the
 * microphone when "Record" is tapped. `src` is the saved/chosen audio (if any); `onFile(file)` gets a new one; `onRemove` clears it.
 */
export default function VoiceRecorder({ src, durationSec, sizeBytes, limits, onFile, onRemove, busy, progress, error: outerError }) {
  const maxMb = limits?.audioMb ?? 10;
  const AUDIO_MAX_SEC = limits?.audioSec ?? 120; // the page's limit (the admin sets it; add-ons raise it)
  const [state, setState] = useState("idle"); // idle | asking | recording | processing
  const [secs, setSecs] = useState(0);
  const [error, setError] = useState("");
  const [levels, setLevels] = useState(() => Array(24).fill(0.15));
  const rec = useRef(null);
  const ctx = useRef(null);
  const stream = useRef(null);
  const raf = useRef(0);
  const timer = useRef(0);
  const input = useRef(null);
  const chunks = useRef([]);
  const cancelled = useRef(false);

  const cleanup = () => {
    cancelAnimationFrame(raf.current); clearInterval(timer.current);
    stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null;
    ctx.current?.close?.().catch(() => {}); ctx.current = null;
  };
  useEffect(() => { cancelled.current = false; return () => { cancelled.current = true; try { rec.current?.state === "recording" && rec.current.stop(); } catch { /* gone */ } cleanup(); }; }, []);

  const accept = async (file) => {
    setError("");
    if (!AUDIO_TYPES.includes(baseType(file.type))) return setError("That isn't an audio file. Use MP3, M4A, WAV, WebM or OGG.");
    if (file.size > maxMb * 1048576) return setError(`That file is ${mbOf(file.size)} MB. The limit is ${maxMb} MB.`);
    const d = await readDuration(file);
    if (d && d > AUDIO_MAX_SEC + 1) return setError(`That's ${clock(d)} long. A voice message can be up to ${secLabel(AUDIO_MAX_SEC)}.`);
    onFile(file.type === baseType(file.type) ? file : new File([file], file.name, { type: baseType(file.type) }), d);
  };

  const start = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return setError("This browser can't record here. Upload an audio file instead.");
    if (!window.isSecureContext) return setError("Recording needs a secure (https) connection. Upload an audio file instead.");
    setState("asking");
    let s;
    try { s = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); }
    catch (e) {
      setState("idle");
      return setError(e?.name === "NotFoundError" ? "No microphone was found on this device." : "Microphone access is blocked. Allow it for this site in your browser settings, then tap Record again.");
    }
    if (cancelled.current) { s.getTracks().forEach((t) => t.stop()); return; }
    stream.current = s;
    const type = pickType();
    let r;
    try { r = new MediaRecorder(s, type ? { mimeType: type } : undefined); } catch { cleanup(); setState("idle"); return setError("Recording isn't supported on this device. Upload an audio file instead."); }
    chunks.current = [];
    r.ondataavailable = (e) => e.data?.size && chunks.current.push(e.data);
    r.onstop = () => {
      const len = secsRef.current;
      cleanup();
      if (cancelled.current) return;
      const finish = () => setState("idle");
      const fail = (m) => { setError(m); finish(); };
      const mime = baseType(r.mimeType || type) || "audio/webm";
      const blob = new Blob(chunks.current, { type: mime });
      if (blob.size < 800) return fail("We didn't catch any sound. Check your microphone and try again.");
      if (blob.size > maxMb * 1048576) return fail(`That recording is ${mbOf(blob.size)} MB, over the ${maxMb} MB limit. Record a shorter one.`);
      Promise.resolve(onFile(new File([blob], `voice-message.${EXT[mime] || "webm"}`, { type: mime }), len)).finally(() => setTimeout(finish, 0));
    };
    rec.current = r;
    // live level bars
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx.current = new AC();
      const an = ctx.current.createAnalyser(); an.fftSize = 64;
      ctx.current.createMediaStreamSource(s).connect(an);
      const buf = new Uint8Array(an.frequencyBinCount);
      const tick = () => { an.getByteFrequencyData(buf); setLevels(Array.from({ length: 24 }, (_, i) => Math.max(0.12, (buf[Math.floor((i / 24) * buf.length * 0.7)] || 0) / 255))); raf.current = requestAnimationFrame(tick); };
      tick();
    } catch { /* bars are just decoration */ }
    r.start(500);
    secsRef.current = 0; setSecs(0); setState("recording");
    timer.current = setInterval(() => {
      secsRef.current += 1; setSecs(secsRef.current);
      if (secsRef.current >= AUDIO_MAX_SEC) stop();
    }, 1000);
  };
  const secsRef = useRef(0);
  const stop = () => { clearInterval(timer.current); setState("processing"); try { rec.current?.state === "recording" && rec.current.stop(); } catch { /* already stopped */ } };

  const shownError = error || outerError;

  return (
    <div>
      <input ref={input} type="file" accept={AUDIO_ACCEPT} className="sr-only" tabIndex={-1} aria-label="Choose an audio file" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) accept(f); }} />

      {state === "processing" || (busy && !src) ? (
        <div className="flex items-center gap-3 rounded-2xl bg-[#fffaf6] p-4 ring-1 ring-rose-100" role="status" aria-live="polite">
          <Loader2 className="h-6 w-6 shrink-0 animate-spin text-rose-500" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#3a1530]">{busy ? "Saving your voice message…" : "Finishing your recording…"}</p>
            {busy && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-rose-100"><div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all" style={{ width: `${Math.max(6, Math.round((progress || 0) * 100))}%` }} /></div>}
          </div>
        </div>
      ) : state === "recording" ? (
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-4 ring-1 ring-rose-200" role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="relative grid h-11 w-11 shrink-0 place-items-center"><span className="absolute inset-0 animate-ping rounded-full bg-rose-400/40" /><span className="relative h-4 w-4 rounded-full bg-rose-500" /></span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-[#3a1530]">Recording…</p>
              <p className="text-xs tabular-nums text-[#8a6a80]">{clock(secs)} / {clock(AUDIO_MAX_SEC)}</p>
            </div>
            <button type="button" onClick={stop} className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow hover:bg-rose-700"><Square className="h-4 w-4" fill="currentColor" aria-hidden /> Stop</button>
          </div>
          <div className="mt-3 flex h-10 items-center justify-center gap-[3px]" aria-hidden>
            {levels.map((l, i) => <span key={i} className="w-1 rounded-full bg-gradient-to-t from-rose-500 to-orange-400" style={{ height: `${Math.round(l * 100)}%` }} />)}
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-rose-100"><div className="h-full bg-rose-500 transition-all" style={{ width: `${(secs / AUDIO_MAX_SEC) * 100}%` }} /></div>
        </div>
      ) : src ? (
        <div className="rounded-2xl bg-[#fffaf6] p-3.5 ring-1 ring-rose-100">
          <Preview src={src} durationSec={durationSec} />
          {busy && (
            <div className="mt-3" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((progress || 0) * 100)} aria-label="Saving your voice message">
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all" style={{ width: `${Math.max(6, Math.round((progress || 0) * 100))}%` }} /></div>
              <p className="mt-1 flex items-center gap-1 text-xs text-[#8a6a80]"><Loader2 className="h-3 w-3 animate-spin" aria-hidden /> Saving…</p>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={start} disabled={busy || state === "asking"} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 disabled:opacity-50"><Mic className="h-3.5 w-3.5" aria-hidden /> Record again</button>
            <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-bold text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50 disabled:opacity-50"><UploadCloud className="h-3.5 w-3.5" aria-hidden /> Upload another</button>
            <button type="button" onClick={onRemove} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove</button>
            {sizeBytes ? <span className="ml-auto self-center text-[11px] text-[#a07890]">{mbOf(sizeBytes)} MB</span> : null}
          </div>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={start} disabled={state === "asking"} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-orange-400 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-rose-200 transition hover:brightness-105 active:scale-[.98] disabled:opacity-60">
            {state === "asking" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Mic className="h-4 w-4" aria-hidden />} {state === "asking" ? "Allow the microphone…" : "Record with microphone"}
          </button>
          <button type="button" onClick={() => input.current?.click()} className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-pink-300 px-4 py-3.5 text-sm font-bold text-pink-700 transition hover:bg-pink-50/60">
            <UploadCloud className="h-4 w-4" aria-hidden /> Upload an audio file
          </button>
        </div>
      )}

      {shownError && <p role="alert" className="mt-2 flex items-start gap-1.5 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700 ring-1 ring-rose-200"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {shownError}</p>}
      <p className={cx("mt-2 text-xs text-slate-500", state === "recording" && "hidden")}>Up to {secLabel(AUDIO_MAX_SEC)} and {maxMb} MB. They&apos;ll see it as a beautiful voice message on the page.</p>
    </div>
  );
}
