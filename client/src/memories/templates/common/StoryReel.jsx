import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { track } from "../../track";
import "./reveal.css";

/*
  STORY REEL: a dark, candle-lit "now showing" card with a film strip made from the page's own photos.
  Tap play: the reel starts ("Starting the reel…"), the film runs, then the video plays right here in the card.
  The video pauses where it was when scrolled out of view and carries on when it comes back.
  Props: video { url?, caption? }, photos, name, sender, sound.
*/
const clamp = (r, lo, hi) => Math.min(hi, Math.max(lo, r));

export default function StoryReel({ video, photos = [], name, sender, sound, line = "A little film, made just for you." }) {
  const [stage, setStage] = useState("idle"); // idle | starting | playing
  const [ratio, setRatio] = useState(9 / 16);
  const vid = useRef(null);
  const left = useRef(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  // pause when scrolled away, resume when back (only if it was playing)
  useEffect(() => {
    const v = vid.current;
    if (!v || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || e.intersectionRatio < 0.25) { if (!v.paused) { left.current = true; v.pause(); } }
      else if (left.current && e.intersectionRatio > 0.4) { left.current = false; v.play().catch(() => {}); }
    }, { threshold: [0, 0.25, 0.4, 0.6] });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const start = () => {
    if (stage !== "idle") return;
    track("reel_start");
    sound?.unlock?.();
    sound?.sfx.swish?.();
    setStage("starting");
    timer.current = setTimeout(() => {
      setStage("playing");
      vid.current?.play().catch(() => {});
    }, 2000);
  };

  const frames = (photos.length ? photos : [{ id: "a", tone: ["#7a4a3a", "#3a2018"], emoji: "🎞️" }, { id: "b", tone: ["#8a5a4a", "#4a2a20"], emoji: "💞" }, { id: "c", tone: ["#6a4030", "#2a1610"], emoji: "🌅" }]).slice(0, 6);
  const strip = [...frames, ...frames, ...frames]; // repeated so the loop never shows a gap
  const playing = stage === "playing";

  return (
    <div className="mx mx-reel-wrap">
      <div className="mx-reel" data-stage={stage} style={playing ? { aspectRatio: String(clamp(ratio, 0.56, 1.78)) } : undefined}>
        <div className="mx-reel-bg" aria-hidden><i className="c1" /><i className="c2" />{Array.from({ length: 14 }, (_, i) => <b key={i} style={{ "--x": `${(i * 37) % 100}%`, "--d": `${6 + (i % 5) * 2}s`, "--dl": `${-(i * 1.3)}s`, "--s": `${2 + (i % 3)}px` }} />)}</div>

        <p className="mx-reel-top">Made with love,<em>just for {name}</em><span aria-hidden> ♡</span></p>

        <div className="mx-reel-paper">
          <p className="mx-reel-now"><span aria-hidden>✦</span> NOW SHOWING <span aria-hidden>✦</span></p>
          <h2 className="mx-reel-title"><span>Your</span><em>Story</em></h2>
          <p className="mx-reel-line">{video?.caption ? video.caption : line}</p>
          <button type="button" className="mx-reel-play" onClick={start} aria-label="Play the film" disabled={stage !== "idle"}>
            <span className="r1" aria-hidden /><span className="r2" aria-hidden />
            <i><Play className="h-7 w-7" fill="currentColor" aria-hidden /></i>
          </button>
        </div>

        <div className="mx-reel-strip" aria-hidden>
          <div className="mx-reel-film">
            {strip.map((p, i) => (
              <span key={`${p.id}-${i}`} className="mx-frame" style={{ "--t1": p.tone?.[0] || "#7a4a3a", "--t2": p.tone?.[1] || "#3a2018" }}>
                {p.url ? <img src={p.url} alt="" draggable={false} loading="lazy" /> : <span className="mx-art">{p.emoji || "🎞️"}</span>}
              </span>
            ))}
          </div>
        </div>
        <p className="mx-reel-heart" aria-hidden>Memories that live in my heart ♡</p>
        <p className="mx-reel-note" aria-hidden>Every moment with you is my favourite part of life.</p>

        <p className="mx-reel-pill" aria-live="polite">{stage === "idle" ? "Tap play to begin" : "Starting the reel…"}</p>

        <div className="mx-reel-screen">
          {video?.url
            ? <video ref={vid} src={video.url} controls playsInline preload="metadata" controlsList="nodownload"
                onLoadedMetadata={(e) => { const { videoWidth: w, videoHeight: h } = e.currentTarget; if (w && h) setRatio(w / h); }} />
            : <p className="mx-reel-empty">Your film will play here.</p>}
        </div>
      </div>
      {sender && <p className="mx-reel-by">A film by {sender}</p>}
    </div>
  );
}
