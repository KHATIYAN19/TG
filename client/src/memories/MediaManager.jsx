import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Film, ImagePlus, Loader2, RotateCw, Star, Trash2, UploadCloud, X } from "lucide-react";

import { errMsg } from "../arena/api";
import { removeMedia, setMainMedia, uploadMedia } from "./memApi";
import { ACCEPT, checkFiles, mbOf } from "./mediaRules";
import { cx } from "./ui";

let uid = 0;

/*
  PHOTOS AND VIDEOS for a page that exists. Drop files (or tap to pick): each one is checked against the limits, then uploaded
  straight to storage with a signed form (see uploadMedia) with a progress bar. A failed file can be retried. The star marks the main one.
*/
export default function MediaManager({ pageId, media, limits, onChange, initialFiles, onBusy }) {
  const [queue, setQueue] = useState([]); // { id, file, kind, preview, progress, status: "up" | "err", error }
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [over, setOver] = useState(false);
  const input = useRef(null);
  const mediaRef = useRef(media);
  mediaRef.current = media;
  const pending = useRef([]);
  const running = useRef(false);

  const photos = media.filter((m) => m.kind === "photo");
  const videos = media.filter((m) => m.kind === "video");
  const patch = (id, change) => setQueue((q) => q.map((x) => (x.id === id ? { ...x, ...change } : x)));

  const runOne = async (item) => {
    patch(item.id, { status: "up", progress: 0, error: "" });
    try {
      const page = await uploadMedia(pageId, item.kind, item.file, (p) => patch(item.id, { progress: p }));
      onChange(page.media);
      setQueue((q) => q.filter((x) => x.id !== item.id));
      if (item.preview) URL.revokeObjectURL(item.preview);
    } catch (e) {
      patch(item.id, { status: "err", error: errMsg(e) });
    }
  };

  // one at a time, in order. New files join the line even while another is uploading.
  const drain = async (items) => {
    pending.current.push(...items);
    if (running.current) return;
    running.current = true;
    while (pending.current.length) await runOne(pending.current.shift());
    running.current = false;
  };

  const addFiles = (fileList) => {
    setError("");
    const have = { photo: photos.length + queue.filter((x) => x.kind === "photo").length, video: videos.length + queue.filter((x) => x.kind === "video").length };
    const { accepted, problems } = checkFiles(fileList, have, limits);
    if (problems.length) setError(problems.join(" "));
    if (!accepted.length) return;
    const items = accepted.map(({ file, kind }) => ({ id: ++uid, file, kind, preview: kind === "photo" ? URL.createObjectURL(file) : "", progress: 0, status: "up", error: "" }));
    setQueue((q) => [...q, ...items]);
    drain(items);
  };

  // files chosen in the create form start uploading the moment this appears
  const started = useRef(false);
  useEffect(() => {
    if (started.current || !initialFiles?.length) return;
    started.current = true;
    addFiles(initialFiles);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // let the screen know while something is still uploading
  const uploading = queue.some((x) => x.status === "up");
  useEffect(() => { onBusy?.(uploading); }, [uploading, onBusy]);

  const act = async (fn, id) => { setError(""); setBusyId(id); try { onChange((await fn(pageId, id)).media); } catch (e) { setError(errMsg(e)); } finally { setBusyId(""); } };
  const drop = (e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files); };

  return (
    <div>
      <p className="mb-3 text-xs text-slate-500">Up to {limits.photos} photos ({limits.photoMb} MB each) and {limits.videos} video{limits.videos === 1 ? "" : "s"} ({limits.videoMb} MB). The star marks the main one that opens the gallery.</p>

      <input ref={input} type="file" accept={ACCEPT} multiple className="sr-only" tabIndex={-1} aria-label="Choose photos or videos" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
      <button
        type="button" onClick={() => input.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop}
        className={cx("flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition", over ? "border-pink-500 bg-pink-50" : "border-pink-300 hover:bg-pink-50/60")}
      >
        <UploadCloud className="h-7 w-7 text-pink-500" aria-hidden />
        <span className="text-sm font-semibold text-pink-700">Add photos and videos</span>
        <span className="text-xs text-slate-500">Tap to choose, or drop files here · {photos.length}/{limits.photos} photos · {videos.length}/{limits.videos} video{limits.videos === 1 ? "" : "s"}</span>
      </button>

      {error && <p role="alert" className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700 ring-1 ring-rose-200">{error}</p>}

      {queue.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Uploading">
          {queue.map((it) => (
            <li key={it.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-pink-50 text-pink-500">
                {it.preview ? <img src={it.preview} alt="" className="h-full w-full object-cover" /> : <Film className="h-5 w-5" aria-hidden />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-800">{it.file.name} <span className="font-normal text-slate-500">· {mbOf(it.file.size)} MB</span></p>
                {it.status === "up" ? (
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(it.progress * 100)} aria-label={`Uploading ${it.file.name}`}>
                    <div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all" style={{ width: `${Math.max(4, Math.round(it.progress * 100))}%` }} />
                  </div>
                ) : (
                  <p className="mt-0.5 flex items-start gap-1 text-xs text-rose-600"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {it.error}</p>
                )}
              </div>
              {it.status === "up"
                ? <span className="text-xs font-semibold tabular-nums text-slate-500">{it.progress >= 1 ? "Saving…" : `${Math.round(it.progress * 100)}%`}</span>
                : (
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => drain([it])} aria-label={`Retry ${it.file.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-pink-600 hover:bg-pink-50"><RotateCw className="h-4 w-4" aria-hidden /></button>
                    <button type="button" onClick={() => setQueue((q) => q.filter((x) => x.id !== it.id))} aria-label={`Dismiss ${it.file.name}`} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" aria-hidden /></button>
                  </div>
                )}
            </li>
          ))}
        </ul>
      )}

      {media.length > 0 && (
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Uploaded photos and videos">
          {media.map((m) => (
            <li key={m.id} className="relative aspect-square overflow-hidden rounded-2xl bg-rose-50 ring-1 ring-rose-100">
              {m.kind === "photo" ? <img src={m.url} alt={m.name || "Photo"} loading="lazy" className="h-full w-full object-cover" /> : <video src={m.url} muted playsInline preload="metadata" className="h-full w-full object-cover" />}
              {m.kind === "video" && <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-white"><Film className="h-3.5 w-3.5" aria-hidden /></span>}
              {m.isMain && <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-0.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-amber-950"><Check className="h-3 w-3" aria-hidden /> Main</span>}
              <div className="absolute right-1 top-1 flex flex-col gap-1">
                {!m.isMain && (m.kind === "photo" ? photos.length > 1 : videos.length > 1) && <button type="button" onClick={() => act(setMainMedia, m.id)} aria-label="Make this the main one" className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-amber-600 shadow hover:bg-white"><Star className="h-4 w-4" aria-hidden /></button>}
                <button type="button" onClick={() => act(removeMedia, m.id)} aria-label={`Remove ${m.name || "this file"}`} className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-rose-600 shadow hover:bg-white"><Trash2 className="h-4 w-4" aria-hidden /></button>
              </div>
              {busyId === m.id && <span className="absolute inset-0 grid place-items-center bg-white/70"><Loader2 className="h-5 w-5 animate-spin text-rose-500" aria-hidden /></span>}
            </li>
          ))}
        </ul>
      )}
      {!media.length && !queue.length && <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400"><ImagePlus className="h-3.5 w-3.5" aria-hidden /> No photos or videos yet. You can skip this and add them later by editing the page.</p>}
    </div>
  );
}
