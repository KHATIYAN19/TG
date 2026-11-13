import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { Activity, Eye, ExternalLink, Gauge, Loader2, Save, X } from "lucide-react";

import { ActivityReport } from "../memories/PageActivity";
import { galleryFrom, toForm, voiceFrom } from "../memories/builderConfig";
import { TEMPLATES } from "../memories/templates";
import { Btn, Chip, STATUS, errText } from "./AdminMemoryUi";

/*
  THE PAGE INSPECTOR (admin). One full-screen panel per page with three tabs:
    Preview   the real page, exactly as its owner sees it. It runs in "live" mode, so opening it records NOTHING:
              no view is counted and no event is saved (the page's numbers stay true).
    Activity  the same report the owner gets: what the other person did, their answer and replies.
    Room      raise what this page may hold (photos, videos, sizes, lengths, message) for a paying user.
*/

const TABS = [["preview", "Preview", Eye], ["activity", "Activity", Activity], ["room", "Room", Gauge]];

export default function Inspector({ http, run, pageId, tab: first = "preview", onClose, onChanged }) {
  const [tab, setTab] = useState(first);
  const [page, setPage] = useState(null);

  useEffect(() => { run(() => http.get(`/pages/${pageId}`)).then((d) => d && setPage(d)); }, [http, run, pageId]);
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = prev; };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50" role="dialog" aria-modal="true" aria-label="Page inspector">
      <header className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-extrabold text-slate-900">{page?.title || "Loading…"}</p>
          <p className="flex flex-wrap items-center gap-1.5 truncate text-xs text-slate-500">
            {page && <>
              <Chip className={STATUS[page.status]}>{page.status}</Chip>
              <span>{page.occasion} · for {page.recipientName} · by {page.owner?.name || page.owner?.email || "-"}</span>
            </>}
          </p>
        </div>
        <nav className="flex gap-1 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Inspector">
          {TABS.map(([key, label, Icon]) => (
            <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${tab === key ? "bg-white text-rose-600 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </nav>
        {page?.url && <a href={page.url} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline sm:inline-flex"><ExternalLink size={12} /> Live link</a>}
        <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X size={19} /></button>
      </header>

      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "preview" && <Preview page={page} />}
        {tab === "activity" && <ActivityTab http={http} run={run} pageId={pageId} />}
        {tab === "room" && <Room http={http} run={run} pageId={pageId} onChanged={onChanged} />}
      </div>
    </div>,
    document.body
  );
}

/* ---------------------------------------------------- preview: the real page, nothing recorded */

function Preview({ page }) {
  const frame = useRef(null);
  const template = page && TEMPLATES.find((t) => t.theme === page.theme);
  const payload = useMemo(() => page && { ...toForm(page), recipientName: page.recipientName, senderName: page.senderName, ...(galleryFrom(page.media) || {}), ...voiceFrom(page.media) }, [page]);

  const post = useCallback(() => {
    if (payload) frame.current?.contentWindow?.postMessage({ type: "memories:live", data: payload, themeId: page.style }, window.location.origin);
  }, [payload, page]);
  useEffect(() => {
    const on = (e) => { if (e.origin === window.location.origin && e.source === frame.current?.contentWindow && e.data?.type === "memories:live-ready") post(); };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [post]);

  if (!page) return <Spinner />;
  if (!template) return <p className="py-20 text-center text-sm text-slate-500">This page&apos;s template is no longer available to preview.</p>;
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col items-center gap-3 p-4 sm:p-6">
      <div className="w-full rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-900">Preview mode: nothing you tap here is counted. No view, no opened gift, no reply is recorded on the page.</div>
      <div className="relative min-h-[520px] w-full max-w-md flex-1 overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-xl shadow-rose-100/60 lg:max-w-lg">
        <iframe ref={frame} title={`Preview of ${page.title}`} onLoad={post} src={`${template.demo}?embed=1&auto=1&live=1&theme=${encodeURIComponent(page.style || "")}`} className="absolute inset-0 h-full w-full border-0" />
      </div>
    </div>
  );
}

/* ---------------------------------------------------- activity: the owner's own report */

function ActivityTab({ http, run, pageId }) {
  const [d, setD] = useState(null);
  useEffect(() => {
    const load = () => run(() => http.get(`/pages/${pageId}/activity`)).then((x) => x && setD(x));
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [http, run, pageId]);
  if (!d) return <Spinner />;
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <ActivityReport d={d} footer={<p className="px-2 text-center text-xs text-slate-400">Admin view of the same report the owner sees. Updates every 30 seconds.</p>} />
    </div>
  );
}

/* ---------------------------------------------------- room: raise a page's limits */

const FIELDS = [
  { key: "photos", label: "Photos", unit: "photos", step: 1, group: "Photos" },
  { key: "photoMb", label: "Size of each photo", unit: "MB", step: 0.5, group: "Photos" },
  { key: "videos", label: "Videos", unit: "videos", step: 1, group: "Videos" },
  { key: "videoMb", label: "Size of each video", unit: "MB", step: 10, group: "Videos" },
  { key: "videoSec", label: "Length of each video", unit: "seconds", step: 15, group: "Videos" },
  { key: "audioMb", label: "Size of the voice message", unit: "MB", step: 1, group: "Voice message" },
  { key: "audioSec", label: "Length of the voice message", unit: "seconds", step: 30, group: "Voice message" },
  { key: "chars", label: "Message length", unit: "characters", step: 500, group: "Letter" },
];
const BASE = { chars: "messageChars" };

function Room({ http, run, pageId, onChanged }) {
  const [r, setR] = useState(null);
  const [vals, setVals] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    run(() => http.get(`/pages/${pageId}/room`)).then((d) => { if (d) { setR(d); setVals(Object.fromEntries(FIELDS.map((f) => [f.key, d.extra[f.key] ?? 0]))); } });
  }, [http, run, pageId]);

  if (!r) return <Spinner />;
  const baseOf = (f) => r.base[BASE[f.key] || f.key];
  const total = (f) => Math.round((baseOf(f) + (Number(vals[f.key]) || 0)) * 100) / 100;
  const dirty = FIELDS.some((f) => Number(vals[f.key] || 0) !== Number(r.extra[f.key] || 0));
  const tooBig = FIELDS.find((f) => total(f) > r.ceiling[f.key]);

  const save = async () => {
    if (tooBig) return toast.error(`${tooBig.label}: the most one page can hold is ${r.ceiling[tooBig.key]} ${tooBig.unit}.`);
    setSaving(true);
    try {
      const body = Object.fromEntries(FIELDS.map((f) => [f.key, Number(vals[f.key]) || 0]));
      const d = await http.post(`/pages/${pageId}/room`, body).then((x) => x.data.data);
      setR(d);
      setVals(Object.fromEntries(FIELDS.map((f) => [f.key, d.extra[f.key] ?? 0])));
      toast.success("Room updated. It applies to the page right away.");
      onChanged?.();
    } catch (e) { toast.error(errText(e)); } finally { setSaving(false); }
  };

  const groups = [...new Set(FIELDS.map((f) => f.group))];
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-900">Give this page more room</h2>
        <p className="mt-1 text-sm text-slate-500">Each box is the <b>extra</b> you give on top of what the template already allows. The total is what the owner can use. Room you give is free and does not touch their orders. It stays on the page.</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Chip className="bg-sky-50 text-sky-700 ring-sky-200">{r.used.photos} / {r.limits.photos} photos used</Chip>
          <Chip className="bg-violet-50 text-violet-700 ring-violet-200">{r.used.videos} / {r.limits.videos} videos used</Chip>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => (
          <section key={g} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">{g}</h3>
            <div className="space-y-3">
              {FIELDS.filter((f) => f.group === g).map((f) => {
                const over = total(f) > r.ceiling[f.key];
                const raised = Number(vals[f.key] || 0) > 0;
                return (
                  <div key={f.key}>
                    <div className="flex items-baseline justify-between gap-2">
                      <label htmlFor={`room-${f.key}`} className="text-sm font-semibold text-slate-800">{f.label}</label>
                      <span className={`text-xs font-bold tabular-nums ${over ? "text-rose-600" : raised ? "text-emerald-600" : "text-slate-500"}`}>{total(f)} {f.unit}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="shrink-0 text-xs text-slate-400">{baseOf(f)} base +</span>
                      <input id={`room-${f.key}`} type="number" min="0" max={r.ceiling[f.key]} step={f.step} value={vals[f.key]} onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}
                        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${over ? "border-rose-300 focus:ring-rose-100" : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"}`} />
                    </div>
                    {over && <p className="mt-1 text-[11px] text-rose-600">Most one page can hold: {r.ceiling[f.key]} {f.unit}.</p>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="sticky bottom-0 mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/95 py-3 backdrop-blur">
        <span className="mr-auto text-xs text-slate-500">{dirty ? "You have unsaved changes." : "Saved."}</span>
        <Btn disabled={!FIELDS.some((f) => Number(vals[f.key] || 0) > 0)} onClick={() => setVals(Object.fromEntries(FIELDS.map((f) => [f.key, 0])))}>Reset extras to 0</Btn>
        <Btn tone="primary" disabled={!dirty || saving || Boolean(tooBig)} onClick={save}>{saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save room</Btn>
      </div>
    </div>
  );
}

const Spinner = () => <div className="grid place-items-center py-24 text-slate-400"><Loader2 className="animate-spin" /></div>;
