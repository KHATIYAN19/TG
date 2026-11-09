import { useEffect, useRef, useState } from "react";
import { Film, UploadCloud, X } from "lucide-react";

import { ACCEPT, checkFiles, mbOf } from "./mediaRules";
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

  const add = (fileList) => {
    const { accepted, problems: p } = checkFiles(fileList, { photo: photos, video: videos }, limits);
    setProblems(p);
    if (accepted.length) onChange([...staged, ...accepted.map(({ file, kind }) => ({ id: ++uid, file, kind, preview: URL.createObjectURL(file) }))]);
  };
  const remove = (s) => { if (s.preview) URL.revokeObjectURL(s.preview); onChange(staged.filter((x) => x.id !== s.id)); };

  return (
    <div>
      <p className="mb-3 text-xs text-slate-500">Optional. They upload on their own as soon as you create the page. Up to {limits.photos} photos ({limits.photoMb} MB each) and {limits.videos} video{limits.videos === 1 ? "" : "s"} ({limits.videoMb} MB). The first photo is the main one.</p>
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
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Files ready to upload">
          {staged.map((s) => (
            <li key={s.id} className="relative aspect-square overflow-hidden rounded-2xl bg-rose-50 ring-1 ring-rose-100">
              {s.kind === "photo" ? <img src={s.preview} alt={s.file.name} className="h-full w-full object-cover" /> : <video src={s.preview} muted playsInline preload="metadata" className="h-full w-full object-cover" />}
              {s.kind === "video" && <span className="absolute left-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-white"><Film className="h-3.5 w-3.5" aria-hidden /></span>}
              <span className="absolute bottom-1 left-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-white">{mbOf(s.file.size)} MB</span>
              <button type="button" onClick={() => remove(s)} aria-label={`Remove ${s.file.name}`} className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-rose-600 shadow hover:bg-white"><X className="h-4 w-4" aria-hidden /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
