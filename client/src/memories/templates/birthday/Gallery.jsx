import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { track } from "../../track";
import { useMedia } from "../../chrome";

/*
  GALLERY: polaroid cards that tilt and lift on hover. A photo or video with a `url` is shown for real;
  without one a pretty placeholder is drawn, so the layout can be judged with dummy data.
  Tap a photo for a full-size viewer (swipe, arrow keys, Esc). Videos play in their own card, no new screen.
*/
const TILTS = [-2.4, 1.8, -1.2, 2.6, -2, 1.4, -2.8, 2.1];
const GUESS = [0.8, 1, 1.25, 0.75, 1, 0.8, 1.25]; // placeholder shapes (width / height) for sample pictures with no file

const toneStyle = (tone) => ({ "--t1": tone?.[0] || "#ffd1dc", "--t2": tone?.[1] || "#ffa6c1" });

/* Real size of a photo or video. The server stores it when it knows it (w, h); otherwise the browser reports it once the file loads. */
const ratioOf = (it, dims) => (it.w && it.h ? it.w / it.h : dims[it.id] || null);
const orientOf = (r) => (!r ? null : r > 1.05 ? "landscape" : r < 0.95 ? "portrait" : "square");
const clamp = (r, lo, hi) => Math.min(hi, Math.max(lo, r));

function Art({ item, video, onDims }) {
  if (item.url && video) return <video src={item.url} muted playsInline preload="metadata" onLoadedMetadata={(e) => onDims?.(item.id, e.currentTarget.videoWidth, e.currentTarget.videoHeight)} />;
  if (item.url) return <img src={item.url} alt={item.caption || ""} loading="lazy" draggable={false} onLoad={(e) => onDims?.(item.id, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)} />;
  return video ? <span className="bd-pol-art" aria-hidden /> : <span className="bd-pol-art" aria-hidden>{item.emoji || "📷"}</span>;
}

/*
  THE LAYOUT. Pictures are dealt into rows, and every row is as wide as its pictures need, so a 9:16 photo stays tall and a
  16:9 one stays wide, and all pictures in a row end up the same height. A phone gets up to 2 in a row, a wide screen up to 4.
  With only a few pictures the row is kept narrower (so one photo is not stretched across the page), and a lonely last
  picture borrows a neighbour from the row above when it can.
*/
function layoutRows(ratios, wide) {
  const n = ratios.length;
  const maxPer = wide ? 4 : 2;
  const aim = wide ? 3.6 : 1.5; // the sum of width/height a row tries to reach
  const tooWide = wide ? 4.7 : 2.05; // past this the pictures in the row would get too short
  const fits = (row, sum, r) => row.length < maxPer && sum + r <= tooWide && Math.abs(sum + r - aim) <= Math.abs(sum - aim);
  const queue = ratios.map((_, i) => i);
  const rows = [];
  while (queue.length) {
    const row = [queue.shift()];
    let sum = ratios[row[0]];
    while (queue.length) {
      // the next picture if it fits; if not, one of the two after it may (so a tall photo finds a partner instead of sitting alone)
      const at = [0, 1, 2].find((k) => k < queue.length && fits(row, sum, ratios[queue[k]]) && (k === 0 || sum < aim * 0.8));
      if (at === undefined) break;
      const [i] = queue.splice(at, 1);
      row.push(i); sum += ratios[i];
    }
    rows.push(row);
  }
  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  if (prev && last.length === 1 && prev.length >= 3) last.unshift(prev.pop());
  // how much "width / height" fills the whole row: less when there is just one row, so a few photos are shown big
  const full = rows.length === 1 ? (wide ? 2.4 : n === 1 ? 0.9 : 1.25) : wide ? 3.4 : 1.25;
  return rows.map((idx) => ({ idx, width: Math.min(1, idx.reduce((t, i) => t + ratios[i], 0) / full) }));
}

export default function Gallery({ photos, video, mainPhotoId, sound }) {
  const main = photos.find((p) => p.id === mainPhotoId) || photos[0];
  const rest = photos.filter((p) => p !== main);
  const items = [main, ...(video ? [{ ...video, isVideo: true }] : []), ...rest].filter(Boolean);
  const [open, setOpen] = useState(null);
  const [dims, setDims] = useState({}); // id -> width / height, learned from the loaded files
  const onDims = useCallback((id, w, h) => { if (w && h) setDims((d) => (d[id] ? d : { ...d, [id]: w / h })); }, []);
  const wide = useMedia("(min-width: 768px)");

  // Videos play right here in their card; only photos open in the full-size viewer.
  const photoItems = items.filter((it) => !it.isVideo);
  const openAt = (it) => { const i = photoItems.indexOf(it); if (i < 0) return; sound?.sfx.rustle(); setOpen(i); track("media_view", { id: String(it.id), kind: "photo" }); };
  const go = useCallback((d) => setOpen((i) => (i === null ? i : (i + d + photoItems.length) % photoItems.length)), [photoItems.length]);

  // every card is shaped like its picture; until a file's size is known it gets a sensible guess
  const real = items.map((it) => ratioOf(it, dims));
  const shapes = items.map((it, i) => (real[i] ? clamp(real[i], 0.5625, 1.7778) : it.isVideo ? 16 / 9 : it.url ? 1 : GUESS[i % GUESS.length]));
  const rows = layoutRows(shapes, wide);

  const card = (i) => {
    const it = items[i];
    const style = { "--r": `${i === 0 ? -1.2 : TILTS[i % TILTS.length]}deg`, "--rd": `${(i % 4) * 0.07}s`, "--ar": String(shapes[i]), "--fr": shapes[i] };
    if (it.isVideo && it.url) {
      return (
        <div key={it.id} className="bd-pol bd-pol-vid" data-orient={orientOf(real[i]) || undefined} style={style}>
          <span className="bd-pol-img" style={toneStyle(it.tone)}>
            <InlineVideo item={it} onDims={onDims} onPlay={() => track("media_view", { id: String(it.id), kind: "video" })} />
          </span>
          <span className="bd-pol-cap">{it.caption}</span>
        </div>
      );
    }
    return (
      <button
        key={it.id} type="button" className={`bd-pol ${i === 0 && items.length > 2 ? "main" : ""}`}
        data-orient={orientOf(real[i]) || undefined} style={style}
        onClick={() => openAt(it)} aria-label={`Open photo${it.caption ? `: ${it.caption}` : ""}`}
      >
        <span className="bd-pol-img" style={toneStyle(it.tone)}>
          <Art item={it} video={it.isVideo} onDims={onDims} />
          {it.isVideo && <span className="bd-play"><i><Play className="h-5 w-5" fill="currentColor" aria-hidden /></i></span>}
        </span>
        <span className="bd-pol-cap">{it.caption}</span>
      </button>
    );
  };

  return (
    <>
      <div className="bd-gal" data-count={items.length}>
        {rows.map((row) => (
          <div key={row.idx.map((i) => items[i].id).join("-")} className="bd-gal-row" style={{ "--rw": `${(row.width * 100).toFixed(2)}%` }}>
            {row.idx.map(card)}
          </div>
        ))}
      </div>
      {open !== null && <Lightbox items={photoItems} index={open} dims={dims} onDims={onDims} onClose={() => setOpen(null)} onGo={go} />}
    </>
  );
}

/*
  A video that plays inside its own card. When it scrolls out of view it pauses exactly where it was; when it scrolls back
  into view it carries on from that spot (only if it was playing when it left). Only one video plays at a time.
*/
let playingNow = null;
function InlineVideo({ item, onDims, onPlay }) {
  const ref = useRef(null);
  const wasPlaying = useRef(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || e.intersectionRatio < 0.4) {
        if (!e.isIntersecting || e.intersectionRatio < 0.25) { if (!v.paused) { wasPlaying.current = true; v.pause(); } }
      } else if (wasPlaying.current) { wasPlaying.current = false; v.play().catch(() => {}); }
    }, { threshold: [0, 0.25, 0.4, 0.6] });
    io.observe(v);
    return () => { io.disconnect(); if (playingNow === v) playingNow = null; };
  }, []);

  const begin = () => { ref.current?.play().catch(() => {}); };
  return (
    <>
      <video
        ref={ref} src={item.url} controls playsInline preload="metadata" controlsList="nodownload"
        onLoadedMetadata={(e) => onDims?.(item.id, e.currentTarget.videoWidth, e.currentTarget.videoHeight)}
        onPlay={(e) => { if (playingNow && playingNow !== e.currentTarget) playingNow.pause(); playingNow = e.currentTarget; wasPlaying.current = false; if (!started) { setStarted(true); onPlay?.(); } }}
        onPause={(e) => { if (playingNow === e.currentTarget) playingNow = null; }}
      />
      {!started && <button type="button" className="bd-play bd-play-btn" onClick={begin} aria-label={`Play video: ${item.caption || ""}`}><i><Play className="h-5 w-5" fill="currentColor" aria-hidden /></i></button>}
    </>
  );
}

function Lightbox({ items, index, dims, onDims, onClose, onGo }) {
  const it = items[index];
  const r = ratioOf(it, dims);
  const start = useRef(null);

  useEffect(() => {
    const key = (e) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowRight") onGo(1); if (e.key === "ArrowLeft") onGo(-1); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = prev; };
  }, [onClose, onGo]);

  return (
    <div
      className="bd-lb" role="dialog" aria-modal="true" aria-label="Photo viewer"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onPointerDown={(e) => { start.current = e.clientX; }}
      onPointerUp={(e) => { if (start.current != null && Math.abs(e.clientX - start.current) > 60) onGo(e.clientX < start.current ? 1 : -1); start.current = null; }}
    >
      <button className="bd-lb-x" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
      <div className="bd-lb-card" key={it.id} data-orient={orientOf(r) || undefined} style={r ? { "--lb-r": clamp(r, 0.4, 2.4) } : undefined}>
        <div className="bd-lb-stage" style={toneStyle(it.tone)}>
          {it.url ? <img src={it.url} alt={it.caption || ""} draggable={false} onLoad={(e) => onDims?.(it.id, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)} />
            : <span className="bd-pol-art" style={{ fontSize: "clamp(4rem, 22vw, 8rem)" }} aria-hidden>{it.emoji || "📷"}</span>}
          <button className="bd-lb-btn" style={{ left: 8 }} onClick={() => onGo(-1)} aria-label="Previous"><ChevronLeft className="h-5 w-5" /></button>
          <button className="bd-lb-btn" style={{ right: 8 }} onClick={() => onGo(1)} aria-label="Next"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <p className="bd-pol-cap" style={{ marginTop: 10, fontSize: "1.4rem" }}>{it.caption}</p>
        <p style={{ margin: "2px 0 0", textAlign: "center", fontSize: ".72rem", color: "#9a7b90" }}>{index + 1} / {items.length}</p>
      </div>
    </div>
  );
}
