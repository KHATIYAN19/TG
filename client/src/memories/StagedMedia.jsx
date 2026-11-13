import { useEffect, useRef, useState } from "react";
import { Film, UploadCloud, X } from "lucide-react";

import { ACCEPT, CAPTION_CHARS, CAPTION_IDEAS, checkFilesAsync, mbOf, tidyCaption } from "./mediaRules";
import { secLabel } from "./pricing";
import { mmss } from "./RoomMeter";
import { cx } from "./ui";

let uid = 0;

/*
  PHOTOS AND VIDEOS IN THE CREATE FORM. The page doesn't exist yet (making it uses a credit), so the files are kept in the browser,
  shown in the live preview, and uploaded automatically the moment the page is created.
*/
export default function StagedMedia({ staged, onChange, limits }) {
  const [problems, setProblems] = useState([]);
  const [over, setOver] = useState(false);
  const input = useRef(null);
  const live = useRef(staged);
  live.current = staged;
  useEffect(() => () => live.current.forEach((s) => s.preview && URL.revokeObjectURL(s.preview)), []); // when the form closes

  const photos = staged.filter((s) => s.kind === "photo").length;
  const videos = staged.filter((s) => s.kind === "video").length;

  const add = async (fileList) => {
    const have = live.current;
    const { accepted, problems: p, durations } = await checkFilesAsync(fileList, { photo: have.filter((s) => s.kind === "photo").length, video: have.filter((s) => s.kind === "video").length }, limits);
    setProblems(p);
    if (accepted.length) onChange([...live.current, ...accepted.map(({ file, kind }) => ({ id: ++uid, file, kind, caption: "", durationSec: durations.get(file), preview: URL.createObjectURL(file) }))]);
  };
  const setCaption = (id, text) => onChange(staged.map((x) => (x.id === id ? { ...x, caption: tidyCaption(text) } : x)));
  const remove = (s) => { if (s.preview) URL.revokeObjectURL(s.preview); onChange(staged.filter((x) => x.id !== s.id)); };

  return (
    <div>
      <p className="mb-3 text-xs text-slate-500">Optional. They upload on their own as soon as you create the page. Up to {limits.photos} photos ({limits.photoMb} MB each) and {limits.videos} video{limits.videos === 1 ? "" : "s"} ({limits.videoMb} MB, up to {secLabel(limits.videoSec || 60)} each). The first photo is the main one. Need more? After you create the page, tap <b>Get more room</b>.</p>
      <input ref={input} type="file" accept={ACCEPT} multiple className="sr-only" tabIndex={-1} aria-label="Choose photos or videos" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />
      <button
        type="button" onClick={() => input.current?.click()} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (e.dataTransfer.files?.length) add(e.dataTransfer.files); }}
        className={cx("flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition", over ? "border-pink-500 bg-pink-50" : "border-pink-300 hover:bg-pink-50/60")}
      >
        <UploadCloud className="h-7 w-7 text-pink-500" aria-hidden />
        <span className="text-sm font-semibold text-pink-700">Add photos and videos</span>
        <span className="text-xs text-slate-500">Tap to choose, or drop files here · {photos}/{limits.photos} photos · {videos}/{limits.videos} video{limits.videos === 1 ? "" : "s"}</span>
      </button>
      {problems.length > 0 && <p role="alert" className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-700 ring-1 ring-rose-200">{problems.join(" ")}</p>}
      {staged.length > 0 && (
        <>
          <p className="mt-4 text-xs font-semibold text-slate-700">Add a caption to each one <span className="font-normal text-slate-500">· 3 to 4 words, like &ldquo;Our first trip&rdquo;. It shows under the picture.</span></p>
          <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-label="Files ready to upload">
            {staged.map((s, i) => (
              <li key={s.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-rose-100">
                <div className="relative aspect-square bg-rose-50">
                  {s.kind === "photo" ? <img src={s.preview} alt={s.file.name} className="h-full w-full object-cover" /> : <video src={s.preview} muted playsInline preload="metadata" className="h-full w-full object-cover" />}
                  {s.kind === "video" && <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-white"><Film className="h-3.5 w-3.5" aria-hidden /></span>}
                  <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white">{s.kind === "video" && s.durationSec ? `${mmss(s.durationSec)} · ` : ""}{mbOf(s.file.size)} MB</span>
                  <button type="button" onClick={() => remove(s)} aria-label={`Remove ${s.file.name}`} className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-rose-600 shadow hover:bg-white"><X className="h-4 w-4" aria-hidden /></button>
                </div>
                <input
                  type="text" value={s.caption || ""} onChange={(e) => setCaption(s.id, e.target.value)} maxLength={CAPTION_CHARS}
                  placeholder={CAPTION_IDEAS[i % CAPTION_IDEAS.length]} aria-label={`Caption for ${s.file.name} (up to 4 words)`}
                  onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                  className="block w-full border-0 border-t border-rose-100 bg-white px-2.5 py-2 text-center text-sm text-[#3a1530] outline-none placeholder:text-[#c4a8b8] focus:bg-rose-50/60"
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
