import { Clock, Film, Images, Mic, PackagePlus, Type } from "lucide-react";

import { secLabel } from "./pricing";
import { cx } from "./ui";

/*
  HOW MUCH ROOM A PAGE HAS, AND HOW MUCH IS USED. Rings and bars that turn amber when nearly full and rose when full.
  The limits are the page's real ones (the template's limits plus any add-ons); the usage is counted live from the form.
*/
const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]";
export const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
const mb = (bytes) => (bytes < 1048576 ? `${Math.max(0.1, bytes / 1048576).toFixed(1)} MB` : `${(bytes / 1048576).toFixed(bytes > 10485760 ? 0 : 1)} MB`);

export const toneFor = (pct) =>
  pct >= 100 ? { stroke: "stroke-rose-500", fill: "bg-rose-500", text: "text-rose-600", chip: "bg-rose-50 text-rose-700 ring-rose-200", word: "Full" }
    : pct >= 80 ? { stroke: "stroke-amber-500", fill: "bg-amber-500", text: "text-amber-600", chip: "bg-amber-50 text-amber-800 ring-amber-200", word: "Almost full" }
      : { stroke: "stroke-emerald-500", fill: "bg-emerald-500", text: "text-emerald-600", chip: "bg-emerald-50 text-emerald-700 ring-emerald-200", word: "" };
const pctOf = (used, max) => (max > 0 ? Math.min(100, Math.round((used / max) * 100)) : 0);

/* a ring with an icon in the middle */
function Ring({ pct, Icon, tone }) {
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid h-16 w-16 shrink-0 place-items-center" role="img" aria-label={`${pct} percent used`}>
      <svg viewBox="0 0 60 60" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="30" cy="30" r={r} fill="none" strokeWidth="6" className="stroke-rose-100" />
        <circle cx="30" cy="30" r={r} fill="none" strokeWidth="6" strokeLinecap="round" className={cx(tone.stroke, "transition-[stroke-dashoffset] duration-700", EASE)} strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      <Icon className={cx("h-5 w-5", tone.text)} aria-hidden />
    </span>
  );
}

function Tile({ Icon, label, value, of, note, pct, onMore, reverse }) {
  const tone = toneFor(reverse ? 0 : pct);
  const full = !reverse && pct >= 100;
  return (
    <li className="flex items-center gap-3 rounded-2xl bg-[#fffaf6] p-3 ring-1 ring-rose-100">
      <Ring pct={reverse ? 100 - pct : pct} Icon={Icon} tone={reverse ? toneFor(pct >= 90 ? 100 : pct >= 70 ? 80 : 0) : tone} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#a07890]">{label}</p>
        <p className="text-lg font-semibold leading-6 tabular-nums text-[#3a1530]">{value}{of && <span className="text-sm font-medium text-[#a07890]"> {of}</span>}</p>
        <p className="truncate text-xs text-[#8a6a80]">{note}</p>
      </div>
      {(full || (!reverse && pct >= 80)) && (
        <span className={cx("shrink-0 self-start rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset", tone.chip)}>
          {onMore && full ? <button type="button" onClick={onMore} className="underline-offset-2 hover:underline">{tone.word}. Add more</button> : tone.word}
        </span>
      )}
    </li>
  );
}

/**
 * usage: { photos, videos, audioSec, audioBytes, chars, bytes, daysLeft }  (counts and sizes used right now)
 * limits: the page's limits (photos, videos, photoMb, videoMb, videoSec, audioMb, audioSec, messageChars)
 * days: { total, left } how long the page stays online (left is null before the page exists)
 */
export function RoomMeter({ limits, usage, days, onMore, hide = [], note }) {
  const L = limits;
  const audioPct = usage.audioSec != null && usage.audioSec > 0 ? pctOf(usage.audioSec, L.audioSec) : usage.audioBytes > 0 ? pctOf(usage.audioBytes, L.audioMb * 1048576) : 0;
  const hasAudio = usage.audioSec > 0 || usage.audioBytes > 0;
  const used = days && days.left != null ? Math.max(0, days.total - days.left) : 0;
  const items = [
    ["photos", <Tile key="photos" Icon={Images} label="Photos" value={usage.photos} of={`of ${L.photos}`} note={`${L.photoMb} MB each`} pct={pctOf(usage.photos, L.photos)} onMore={onMore} />],
    ["videos", <Tile key="videos" Icon={Film} label="Videos" value={usage.videos} of={`of ${L.videos}`} note={`Up to ${secLabel(L.videoSec)} and ${L.videoMb} MB each`} pct={pctOf(usage.videos, L.videos)} onMore={onMore} />],
    ["voice", <Tile key="voice" Icon={Mic} label="Voice message" value={hasAudio ? (usage.audioSec ? mmss(usage.audioSec) : "Added") : "None"} of={`of ${secLabel(L.audioSec)}`} note={`${L.audioMb} MB file`} pct={audioPct} onMore={onMore} />],
    ["letter", <Tile key="letter" Icon={Type} label="Letter" value={(usage.chars || 0).toLocaleString("en-IN")} of={`of ${L.messageChars.toLocaleString("en-IN")}`} note="characters" pct={pctOf(usage.chars || 0, L.messageChars)} onMore={onMore} />],
    ["days", days && <Tile key="days" Icon={Clock} label="Online" value={days.left != null ? `${days.left} day${days.left === 1 ? "" : "s"}` : `${days.total} days`} of={days.left != null ? "left" : "from today"} note={days.left != null ? `of ${days.total} days in all` : "Then the page is deleted"} pct={pctOf(used, days.total)} reverse />],
  ].filter(([k, el]) => el && !hide.includes(k));

  return (
    <section className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[28px]" aria-labelledby="room-h">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="room-h" className="text-base font-semibold text-[#3a1530]">Your page&apos;s room</h3>
          <p className="text-sm text-[#8a6a80]">What this page can hold, and how much you&apos;ve used.</p>
        </div>
        {onMore
          ? <button type="button" onClick={onMore} className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-2 text-sm font-semibold text-rose-600 ring-1 ring-rose-100 transition duration-300 hover:bg-rose-100 active:scale-[0.98]"><PackagePlus className="h-4 w-4" aria-hidden /> Get more room</button>
          : note && <p className="max-w-[16rem] text-xs text-[#8a6a80]">{note}</p>}
      </div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{items.map(([, el]) => el)}</ul>
      {usage.bytes > 0 && <p className="mt-3 text-xs text-[#a07890]">Files on this page: {mb(usage.bytes)}</p>}
    </section>
  );
}

/* a slim bar for one limit, used inside the photos / videos / voice sections */
export function UsageBar({ Icon, label, used, max, text, className }) {
  const pct = pctOf(used, max);
  const tone = toneFor(pct);
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium text-[#6b3a5a]">{Icon && <Icon className="h-4 w-4 text-rose-400" aria-hidden />} {label}</span>
        <span className={cx("tabular-nums font-semibold", pct >= 80 ? tone.text : "text-[#3a1530]")}>{text}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-rose-100" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.min(used, max)} aria-label={label}>
        <div className={cx("h-full w-full origin-left rounded-full transition-transform duration-500", EASE, tone.fill)} style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
    </div>
  );
}

/* a section of the form: a numbered icon, a title, a hint and room for meters on the right */
export function SectionCard({ id, step, Icon, title, hint, aside, children }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[24px] border border-rose-100 bg-white p-4 text-slate-900 shadow-sm sm:p-6 lg:rounded-[28px]">
      <header className="flex flex-wrap items-start gap-3">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500">
          <Icon className="h-5 w-5" aria-hidden />
          {step && <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{step}</span>}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold leading-6 text-[#3a1530]">{title}</h3>
          {hint && <p className="text-sm text-[#8a6a80]">{hint}</p>}
        </div>
        {aside}
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}
