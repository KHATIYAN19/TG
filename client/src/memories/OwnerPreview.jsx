import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";

import { errMsg } from "../arena/api";
import { getPage } from "./memApi";
import { galleryFrom, toForm } from "./builderConfig";
import { TEMPLATES } from "./templates";
import { Loading } from "./AppShell";
import { Button } from "./ui";

/*
  PREVIEW OF YOUR OWN PAGE: the real template, full screen, filled with what you wrote and your photos and video.
  It is the same page (in an iframe) that the builder shows, so what you see here is what they will get.
*/
export default function OwnerPreview() {
  const { id } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");
  const frame = useRef(null);

  useEffect(() => { getPage(id).then(setPage).catch((e) => setError(errMsg(e))); }, [id]);

  const template = page && TEMPLATES.find((t) => t.theme === page.theme);
  const payload = page && { ...toForm(page), recipientName: page.recipientName, senderName: page.senderName, ...(galleryFrom(page.media) || {}) };

  const post = useCallback(() => {
    if (payload) frame.current?.contentWindow?.postMessage({ type: "memories:live", data: payload, themeId: page.style }, window.location.origin);
  }, [payload, page]);
  useEffect(() => {
    const on = (e) => { if (e.origin === window.location.origin && e.source === frame.current?.contentWindow && e.data?.type === "memories:live-ready") post(); };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [post]);

  if (error) return <p role="alert" className="py-20 text-center text-rose-600">{error} <Link to="/memories/app/pages" className="font-semibold underline">Back to my pages</Link></p>;
  if (!page || !template) return <Loading label="Opening your page…" />;

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex items-center gap-2 py-2">
        <Link to="/memories/app/pages" className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden /> My pages</Link>
        <p className="ml-2 min-w-0 flex-1 truncate text-sm font-bold text-[#3a1530]">Preview · {page.title}</p>
        <Button as={Link} to={`/memories/app/pages/${page.id}/edit`} variant="soft" size="sm"><Pencil className="h-3.5 w-3.5" aria-hidden /> Edit</Button>
      </div>
      <div className="mx-auto min-h-0 w-full max-w-md flex-1 lg:max-w-lg overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-xl shadow-rose-100/60">
        <iframe
          ref={frame} title={`Preview of ${page.title}`} onLoad={post}
          src={`${template.demo}?embed=1&auto=1&live=1&theme=${encodeURIComponent(page.style || "")}`}
          className="h-full w-full border-0"
        />
      </div>
      <p className="py-2 text-center text-xs text-[#8a6a80]">Only you see this preview. Photos and videos load from your account.</p>
    </div>
  );
}
