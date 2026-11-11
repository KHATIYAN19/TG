import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Mic, Pause, Play } from "lucide-react";

/*
  THE VOICE MESSAGE, as the person who gets the page sees it. Not a plain audio bar: a velvet-and-gold card that rises into view
  when the page opens, with a glowing play button that asks for attention until it is played once, a waveform you can scrub,
  and it folds into a small golden disc if they want it out of the way. It sits above every template, so all of them get it.
*/

const BARS = 44;
const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
/* a steady, natural-looking waveform for this message (same every time) */
const shape = (seed) => {
  let h = 2166136261;
  for (const c of String(seed)) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rnd = () => ((h = Math.imul(h ^ (h >>> 15), 2246822507)), ((h ^ (h >>> 13)) >>> 0) / 4294967295);
  return Array.from({ length: BARS }, (_, i) => {
    const env = 0.45 + 0.55 * Math.sin((Math.PI * (i + 1)) / (BARS + 1)); // louder in the middle
    return Math.max(0.18, Math.min(1, env * (0.45 + rnd() * 0.75)));
  });
};

const CSS = `
@keyframes vn-rise{0%{opacity:0;transform:translateY(28px) scale(.96)}100%{opacity:1;transform:none}}
@keyframes vn-halo{0%{box-shadow:0 0 0 0 rgba(232,190,100,.55)}70%{box-shadow:0 0 0 18px rgba(232,190,100,0)}100%{box-shadow:0 0 0 0 rgba(232,190,100,0)}}
@keyframes vn-sheen{0%{transform:translateX(-120%)}100%{transform:translateX(220%)}}
@keyframes vn-bar{0%,100%{transform:scaleY(.55)}50%{transform:scaleY(1)}}
@keyframes vn-glow{0%,100%{box-shadow:0 18px 50px -12px rgba(0,0,0,.55),0 0 28px -6px rgba(232,190,100,.35)}50%{box-shadow:0 18px 50px -12px rgba(0,0,0,.55),0 0 44px -2px rgba(232,190,100,.6)}}
.vn-rise{animation:vn-rise .9s cubic-bezier(.2,.8,.2,1) both}
.vn-halo{animation:vn-halo 1.9s ease-out infinite}
.vn-sheen{animation:vn-sheen 4.2s ease-in-out infinite}
.vn-live{animation:vn-glow 3s ease-in-out infinite}
.vn-eq{transform-origin:bottom;animation:vn-bar .9s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.vn-rise,.vn-halo,.vn-sheen,.vn-live,.vn-eq{animation:none}}
`;
const GOLD = "linear-gradient(135deg,#f6e3a8 0%,#d9a441 45%,#a8741f 100%)";

export default function VoiceNote({ src, from, durationSec, contained = false, demo = false, inline = false }) {
  const el = useRef(null);
  const wave = useRef(null);
  const [shown, setShown] = useState(inline);
  const [min, setMin] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(demo ? 24 : durationSec || 0);
  const sim = useRef(0); // demo mode: a pretend recording that plays itself
  const [broken, setBroken] = useState(false);
  const bars = useMemo(() => shape(src || "demo"), [src]);

  useEffect(() => { if (inline) return undefined; const id = setTimeout(() => setShown(true), 1400); return () => clearTimeout(id); }, [inline]);
  useEffect(() => () => { el.current?.pause(); clearInterval(sim.current); }, []);

  const toggle = () => {
    if (demo) {
      if (playing) { clearInterval(sim.current); setPlaying(false); return; }
      setHeard(true); setPlaying(true);
      sim.current = setInterval(() => setT((x) => { if (x + 0.25 >= 24) { clearInterval(sim.current); setPlaying(false); return 0; } return x + 0.25; }), 250);
      return;
    }
    const a = el.current; if (!a) return;
    if (a.paused) a.play().then(() => setHeard(true)).catch(() => setBroken(true)); else a.pause();
  };
  const seek = (e) => {
    const a = el.current; const box = wave.current; if (!(a || demo) || !box || !dur) return;
    const r = box.getBoundingClientRect();
    const to = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * dur;
    if (a) a.currentTime = to;
    setT(to);
  };
  const drag = useRef(false);
  const progress = dur ? Math.min(1, t / dur) : 0;
  const who = (from || "").trim();

  if (broken || (!src && !demo)) return null;
  const pos = contained ? "absolute" : "fixed";

  return (
    <>
      <style>{CSS}</style>
      {!demo && <audio
        ref={el} src={src} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => { setPlaying(false); setT(0); }}
        onTimeUpdate={(e) => !drag.current && setT(e.currentTarget.currentTime)} onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && e.currentTarget.duration > 0 && setDur(e.currentTarget.duration)} onError={() => setBroken(true)}
      />}
      {shown && (min && !inline ? (
        <button
          type="button" onClick={() => setMin(false)} aria-label="Show the voice message"
          className={`${pos} z-[999] grid h-14 w-14 place-items-center rounded-full text-[#2a1530] shadow-xl ${playing ? "" : "vn-halo"}`}
          style={{ right: 16, bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)", background: GOLD }}
        >
          {playing ? <span className="flex h-5 items-end gap-[3px]" aria-hidden>{[0, 0.2, 0.4].map((d) => <span key={d} className="vn-eq w-[3px] rounded-full bg-[#2a1530]" style={{ height: "100%", animationDelay: `${d}s` }} />)}</span> : <Mic className="h-6 w-6" aria-hidden />}
        </button>
      ) : (
        <div
          role="region" aria-label="A voice message for you"
          className={inline ? "relative mx-auto w-full max-w-[400px] px-1" : `${pos} z-[999] vn-rise inset-x-0 flex justify-center px-3`}
          style={inline ? undefined : { bottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)", pointerEvents: "none" }}
        >
          <div className={`relative w-full max-w-[400px] rounded-[26px] p-px ${playing ? "vn-live" : ""}`} style={{ background: GOLD, pointerEvents: "auto", boxShadow: playing ? undefined : "0 18px 50px -12px rgba(0,0,0,.55)" }}>
            <div className="relative overflow-hidden rounded-[25px] px-4 pb-3.5 pt-3.5 text-[#f6ead0]" style={{ background: "linear-gradient(145deg,#1d1021 0%,#2b1631 55%,#190d1d 100%)" }}>
              <span aria-hidden className="vn-sheen pointer-events-none absolute inset-y-0 left-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="relative flex items-center gap-3.5">
                <button
                  type="button" onClick={toggle} aria-label={playing ? "Pause the voice message" : "Play the voice message"}
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-full text-[#2a1530] transition active:scale-95 ${!heard && !playing ? "vn-halo" : ""}`}
                  style={{ background: GOLD }}
                >
                  {playing ? <Pause className="h-6 w-6" fill="currentColor" aria-hidden /> : <Play className="ml-0.5 h-6 w-6" fill="currentColor" aria-hidden />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#e3bd6a]">{heard ? "Voice message" : "A voice message for you"}</p>
                  <p className="mt-0.5 truncate text-[17px] italic leading-tight text-white" style={{ fontFamily: "'Playfair Display', Georgia, 'Times New Roman', serif" }}>
                    {who ? <>From {who}</> : "Listen closely"}
                  </p>
                  <p className="mt-0.5 text-[11px] tabular-nums text-[#cdb88f]">
                    {!heard && !playing ? <>Tap to listen{dur ? ` · ${clock(dur)}` : ""}</> : <>{clock(t)}{dur ? ` / ${clock(dur)}` : ""}</>}
                  </p>
                </div>
                {!inline && <button type="button" onClick={() => setMin(true)} aria-label="Minimise the voice message" className="grid h-8 w-8 shrink-0 place-items-center self-start rounded-full text-[#cdb88f] hover:bg-white/10"><ChevronDown className="h-5 w-5" aria-hidden /></button>}
              </div>

              <div
                ref={wave} role="slider" tabIndex={0} aria-label="Position in the voice message" aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(t)} aria-valuetext={`${clock(t)} of ${clock(dur)}`}
                onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture?.(e.pointerId); seek(e); }}
                onPointerMove={(e) => drag.current && seek(e)}
                onPointerUp={() => { drag.current = false; }} onPointerCancel={() => { drag.current = false; }}
                onKeyDown={(e) => { const a = el.current; if (demo) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } return; } if (!a || !dur) return; if (e.key === "ArrowRight") a.currentTime = Math.min(dur, a.currentTime + 5); else if (e.key === "ArrowLeft") a.currentTime = Math.max(0, a.currentTime - 5); else if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); } }}
                className="relative mt-3.5 flex h-11 cursor-pointer touch-none items-center gap-[3px] rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#e3bd6a]/70"
              >
                {bars.map((h, i) => {
                  const done = (i + 0.5) / BARS <= progress;
                  return <span key={i} aria-hidden className={`flex-1 rounded-full ${playing && done ? "vn-eq" : ""}`} style={{ height: `${Math.round(h * 100)}%`, background: done ? GOLD : "rgba(246,234,208,.22)", animationDelay: `${(i % 7) * 0.12}s`, transition: "background .25s" }} />;
                })}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/* The block every template shows right under its photos and videos. A real page gets its own message; the template previews get a pretend one (but not the builder's live phone). */
export function VoiceSection({ data, sender }) {
  if (!data?.voiceUrl && !data?.voiceDemo) return null;
  return (
    <section className="bd-sec" aria-label="A voice message">
      <div className="bd-wrap">
        <VoiceNote inline src={data.voiceUrl} demo={!data.voiceUrl} from={sender || data.senderName} durationSec={data.voiceDur} />
      </div>
    </section>
  );
}

/** For the preview routes: add the pretend voice message unless a real one is there or the builder's live phone is showing. */
export function withDemoVoice(data) {
  let live = false;
  try { live = new URLSearchParams(window.location.search).get("live") === "1"; } catch { /* no window */ }
  return data?.voiceUrl || live ? data : { ...data, voiceDemo: true };
}
