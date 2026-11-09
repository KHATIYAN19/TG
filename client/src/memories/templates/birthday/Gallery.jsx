import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { track } from "../../track";

/*
  GALLERY: polaroid cards that tilt and lift on hover. A photo or video with a `url` is shown for real;
  without one a pretty placeholder is drawn, so the layout can be judged with dummy data.
  Tap any card for a full-size viewer (swipe, arrow keys, Esc).
*/
const TILTS = [-2.4, 1.8, -1.2, 2.6, -2, 1.4, -2.8, 2.1];
const RATIOS = ["1 / 1", "4 / 5", "5 / 4", "3 / 4", "1 / 1", "4 / 5", "5 / 4"];

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

export default function Gallery({ photos, video, mainPhotoId, sound }) {
  const main = photos.find((p) => p.id === mainPhotoId) || photos[0];
  const rest = photos.filter((p) => p !== main);
  const items = [main, ...(video ? [{ ...video, isVideo: true }] : []), ...rest].filter(Boolean);
  const [open, setOpen] = useState(null);
  const [dims, setDims] = useState({}); // id -> width / height, learned from the loaded files
  const onDims = useCallback((id, w, h) => { if (w && h) setDims((d) => (d[id] ? d : { ...d, [id]: w / h })); }, []);

  const openAt = (i) => { sound?.sfx.rustle(); setOpen(i); track("media_view", { id: String(items[i]?.id), kind: items[i]?.isVideo ? "video" : "photo" }); };
  const go = useCallback((d) => setOpen((i) => (i === null ? i : (i + d + items.length) % items.length)), [items.length]);

  return (
    <>
      <div className="bd-gal">
        {items.map((it, i) => {
          const r = ratioOf(it, dims);
          // a card is shaped like its picture: tall for a 9:16 video, wide for a 16:9 one
          const ar = r ? String(clamp(r, 0.5625, 1.7778)) : i === 0 ? "4 / 5" : it.isVideo ? "16 / 9" : RATIOS[i % RATIOS.length];
          return (
          <button
            key={it.id}
            type="button"
            className={`bd-pol mem-reveal ${i === 0 ? "main" : ""}`}
            data-orient={orientOf(r) || undefined}
            style={{ "--r": `${i === 0 ? -1.5 : TILTS[i % TILTS.length]}deg`, "--rd": `${(i % 4) * 0.07}s`, "--ar": ar }}
            onClick={() => openAt(i)}
            aria-label={`Open ${it.isVideo ? "video" : "photo"}: ${it.caption || ""}`}
          >
            <span className="bd-pol-img" style={toneStyle(it.tone)}>
              <Art item={it} video={it.isVideo} onDims={onDims} />
              {it.isVideo && <span className="bd-play"><i><Play className="h-5 w-5" fill="currentColor" aria-hidden /></i></span>}
            </span>
            <span className="bd-pol-cap">{it.caption}</span>
          </button>
          );
        })}
      </div>
      {open !== null && <Lightbox items={items} index={open} dims={dims} onDims={onDims} onClose={() => setOpen(null)} onGo={go} />}
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
          {it.url && it.isVideo ? <video src={it.url} controls autoPlay playsInline onLoadedMetadata={(e) => onDims?.(it.id, e.currentTarget.videoWidth, e.currentTarget.videoHeight)} />
            : it.url ? <img src={it.url} alt={it.caption || ""} draggable={false} onLoad={(e) => onDims?.(it.id, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)} />
            : <span className="bd-pol-art" style={{ fontSize: "clamp(4rem, 22vw, 8rem)" }} aria-hidden>{it.isVideo ? "🎬" : it.emoji || "📷"}</span>}
          {!it.url && it.isVideo && <span style={{ position: "absolute", bottom: 10, left: 0, right: 0, textAlign: "center", color: "#fff", fontSize: ".8rem", textShadow: "0 1px 4px rgba(0,0,0,.5)" }}>Your video plays here</span>}
          <button className="bd-lb-btn" style={{ left: 8 }} onClick={() => onGo(-1)} aria-label="Previous"><ChevronLeft className="h-5 w-5" /></button>
          <button className="bd-lb-btn" style={{ right: 8 }} onClick={() => onGo(1)} aria-label="Next"><ChevronRight className="h-5 w-5" /></button>
        </div>
        <p className="bd-pol-cap" style={{ marginTop: 10, fontSize: "1.4rem" }}>{it.caption}</p>
        <p style={{ margin: "2px 0 0", textAlign: "center", fontSize: ".72rem", color: "#9a7b90" }}>{index + 1} / {items.length}</p>
      </div>
    </div>
  );
}
