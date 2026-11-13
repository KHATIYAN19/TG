import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Clock, Copy, Eye, MessageCircleHeart, Pencil, Share2, Smartphone, Sparkles, Users } from "lucide-react";

import { errMsg } from "../arena/api";
import { getActivity } from "./memApi";
import { META } from "./Showcase";
import { TEMPLATES } from "./templates";
import { Loading } from "./AppShell";
import { Button, cx } from "./ui";

/* ---------- time helpers ---------- */
const time = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
const fmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "");
const ago = (d) => {
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
};
const dur = (secs) => (secs >= 3600 ? `${Math.floor(secs / 3600)}h ${Math.round((secs % 3600) / 60)}m` : secs >= 60 ? `${Math.floor(secs / 60)}m ${secs % 60}s` : `${secs}s`);
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const dayLabel = (d) => {
  const day = new Date(d); const t = new Date(); const y = new Date(); y.setDate(t.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  return same(day, t) ? "Today" : same(day, y) ? "Yesterday" : day.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
};

/* ---------- what each template reports (see the page builder: one row per kind of event) ---------- */
const common = (t) => [
  { type: "gate_open", label: "Opened the page", emoji: "🔓" },
  { type: "letter_open", label: "Opened your letter", emoji: "💌" },
  { type: "media_view", label: "Looked at your photos and videos", emoji: "🖼️", of: t.photos + t.videos },
];
const ROWS = {
  birthday: (t) => [
    { type: "gate_open", label: "Opened the surprise", emoji: "🎁" },
    { type: "balloon_pop", label: "Balloons popped", emoji: "🎈", total: true },
    { type: "candles_blown", label: "Blew out the candles", emoji: "🕯️" },
    { type: "cake_cut", label: "Cut the cake", emoji: "🍰" },
    { type: "gift_open", label: "Gifts opened", emoji: "🎀", of: t.gifts, list: true },
    { type: "chocolate_bite", label: "Bites of chocolate", emoji: "🍫", total: true },
    ...common(t).slice(1),
  ],
  sorry: (t) => [
    ...common(t).slice(0, 1),
    { type: "comfort", label: "Comforted the mascot", emoji: "🧸", level: true },
    { type: "heart_mended", label: "Mended the broken heart", emoji: "💖" },
    { type: "promise_flip", label: "Promises opened", emoji: "🤞", of: t.promises },
    { type: "gesture", label: "Sent you", emoji: "🌹", list: true, names: { roses: "Roses 🌹", hug: "A hug 🤗", candle: "A candle 🕯️" } },
    { type: "gift_open", label: "Peace offerings opened", emoji: "🎀", of: t.gifts, list: true },
    ...common(t).slice(1),
  ],
  proposal: (t) => [
    ...common(t).slice(0, 1),
    { type: "box_open", label: "Opened the ring box", emoji: "💍" },
    { type: "promise_flip", label: "Vows opened", emoji: "🤞", of: t.promises },
    ...common(t).slice(1),
  ],
  anniversary: (t) => [
    ...common(t).slice(0, 1),
    { type: "jar_reason", label: "Reasons pulled from the love jar", emoji: "🫙", of: t.reasons, list: true },
    { type: "toast", label: "Clinked the glasses", emoji: "🥂", count: true },
    { type: "bouquet", label: "Built a bouquet", emoji: "💐", last: true },
    { type: "lantern", label: "Wish lanterns released", emoji: "🏮", count: true },
    { type: "promise_flip", label: "Promises opened", emoji: "🤞", of: t.promises },
    { type: "gift_open", label: "Gifts opened", emoji: "🎀", of: t.gifts, list: true },
    { type: "finale", label: "Reached the finale", emoji: "🎉" },
    ...common(t).slice(1),
  ],
  thanks: (t) => [
    ...common(t).slice(0, 1),
    { type: "leaf", label: "Gratitude leaves found", emoji: "🍂", of: t.reasons, list: true },
    { type: "react", label: "Reacted to", emoji: "🙌", list: true },
    { type: "promise_flip", label: "Promises opened", emoji: "🤞", of: t.promises },
    { type: "gift_open", label: "Gifts opened", emoji: "🎀", of: t.gifts, list: true },
    { type: "finale", label: "Reached the finale", emoji: "🎉" },
    ...common(t).slice(1),
  ],
};

/* timeline: icon + colour + words for every kind of event */
const EVT = {
  open: ["👀", "sky", () => "Opened your link"], gate_open: ["🔓", "sky", () => "Tapped to open the page"], letter_open: ["💌", "rose", () => "Opened your letter"], finale: ["🎉", "violet", () => "Reached the finale"],
  balloon_pop: ["🎈", "rose", (d) => `Popped ${plural(d.n || 1, "balloon")}`], candles_blown: ["🕯️", "amber", () => "Blew out the candles"], cake_cut: ["🍰", "rose", () => "Cut the cake"],
  gift_open: ["🎁", "amber", (d) => `Opened a gift${d.title ? `: ${d.title}` : ""}`], gifts_all_open: ["🎀", "amber", () => "Opened every gift"], chocolate_bite: ["🍫", "amber", (d) => `Ate ${plural(d.n || 1, "bite")} of chocolate`],
  comfort: ["🧸", "amber", (d) => `Comforted the mascot (${d.level ?? 0}%)`], heart_mended: ["💖", "rose", () => "Mended the broken heart"], promise_flip: ["🤞", "violet", (d) => `Opened promise ${Number(d.i) + 1}`],
  gesture: ["🌹", "rose", (d) => `Sent ${d.kind === "roses" ? "roses" : d.kind === "hug" ? "a hug" : "a candle"}`], jar_reason: ["🫙", "violet", (d) => `Pulled a reason: "${d.text || ""}"`],
  toast: ["🥂", "amber", () => "Clinked the glasses"], bouquet: ["💐", "rose", (d) => `Gave you a bouquet: ${d.text || ""}`], lantern: ["🏮", "amber", () => "Released a wish lantern"], box_open: ["💍", "violet", () => "Opened the ring box"],
  leaf: ["🍂", "amber", (d) => `Found a leaf: "${d.text || ""}"`], react: ["🙌", "violet", (d) => `Reacted to ${d.name || "someone"}`], media_view: ["🖼️", "sky", (d) => `Looked at a ${d.kind || "photo"}`],
  answer: ["💬", "emerald", (d) => (d.value === "yes" ? "Said YES 💍" : d.value === "no" ? "Said no" : "Said they need a little time")], reply: ["✉️", "emerald", (d) => `Sent you a message: "${d.text || ""}"`],
  time_spent: ["⏱️", "slate", (d) => `Spent ${dur(d.secs || 0)} on the page`], song: ["🎵", "slate", () => "Played the music"],
};
const TONE = { sky: "bg-sky-100 text-sky-700", rose: "bg-rose-100 text-rose-700", amber: "bg-amber-100 text-amber-800", violet: "bg-violet-100 text-violet-700", emerald: "bg-emerald-100 text-emerald-700", slate: "bg-slate-100 text-slate-600" };

/* ---------- little building blocks ---------- */
const Card = ({ title, icon, children, className = "" }) => (
  <section className={cx("rounded-[26px] border border-rose-100 bg-white p-4 shadow-sm sm:p-5", className)}>
    {title && <h2 className="mb-3.5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-[#a07890]">{icon && <span aria-hidden className="text-base normal-case">{icon}</span>}{title}</h2>}
    {children}
  </section>
);

function Tile({ emoji, value, label, tone }) {
  return (
    <div className={cx("rounded-2xl p-3 text-center sm:p-4", tone)}>
      <p className="text-xl sm:text-2xl" aria-hidden>{emoji}</p>
      <p className="mt-0.5 text-xl font-extrabold leading-tight sm:text-2xl">{value}</p>
      <p className="text-[11px] font-semibold opacity-75">{label}</p>
    </div>
  );
}

function Ring({ done, total }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const r = 30; const c = 2 * Math.PI * r;
  return (
    <div className="relative grid h-[76px] w-[76px] shrink-0 place-items-center" role="img" aria-label={`${done} of ${total} things explored`}>
      <svg viewBox="0 0 72 72" className="absolute inset-0 -rotate-90"><circle cx="36" cy="36" r={r} fill="none" stroke="#ffe4e9" strokeWidth="8" /><circle cx="36" cy="36" r={r} fill="none" stroke="url(#ring)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ transition: "stroke-dashoffset .8s ease" }} /><defs><linearGradient id="ring" x1="0" x2="1"><stop offset="0" stopColor="#f43f5e" /><stop offset="1" stopColor="#fb923c" /></linearGradient></defs></svg>
      <span className="text-lg font-extrabold text-[#3a1530]">{pct}%</span>
    </div>
  );
}

function AnswerCard({ a, template, recipient, sender }) {
  const proposal = template === "proposal";
  if (!a) {
    return (
      <Card title="Their answer" icon="💬">
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200"><span className="text-3xl" aria-hidden>⏳</span><p>No answer yet. When {recipient} answers, you&apos;ll see it here straight away.</p></div>
      </Card>
    );
  }
  const v = {
    yes: { emoji: proposal ? "💍" : "💖", title: proposal ? `${recipient} said YES!` : `${recipient} forgave you!`, box: "bg-gradient-to-br from-rose-50 via-white to-amber-50 ring-rose-200", text: "text-rose-700", sub: proposal ? "Congratulations! 🎉" : "A fresh start. 💞" },
    no: { emoji: "🕊️", title: proposal ? `${recipient} said no` : `${recipient} can't right now`, box: "bg-slate-50 ring-slate-200", text: "text-slate-700", sub: `${recipient} told you honestly, and that takes courage. Be gentle with yourself, ${sender}.` },
    later: { emoji: "⏳", title: `${recipient} needs a little time`, box: "bg-amber-50 ring-amber-200", text: "text-amber-800", sub: "No pressure. They can still change this to a yes or a no." },
  }[a.value];
  return (
    <Card title="Their answer" icon="💬">
      <div className={cx("relative overflow-hidden rounded-3xl p-5 ring-1", v.box)}>
        {a.value === "yes" && <><span className="absolute -right-2 top-1 text-3xl opacity-60" aria-hidden>✨</span><span className="absolute bottom-2 left-2 text-2xl opacity-50" aria-hidden>🎊</span></>}
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white text-4xl shadow-sm" aria-hidden>{v.emoji}</span>
          <div className="min-w-0">
            <p className={cx("text-xl font-extrabold leading-tight sm:text-2xl", v.text)}>{v.title}</p>
            <p className="mt-0.5 text-sm text-[#6b3a5a]">{v.sub}</p>
            <p className="mt-1 text-xs text-[#8a6a80]">{fmt(a.at)} · {ago(a.at)}</p>
          </div>
        </div>
        <p className={cx("mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold", a.final ? "bg-white/80 text-[#3a1530]" : "bg-white/70 text-amber-800")}>{a.final ? "🔒 Final: this answer can't be changed" : "🔓 Not final: they can still change it"}</p>
      </div>
      {a.history?.length > 1 && (
        <ol className="mt-4 space-y-3 border-l-2 border-dashed border-rose-200 pl-4">
          {a.history.map((h, i) => (
            <li key={i} className="relative text-sm">
              <span className="absolute -left-[22px] top-1 grid h-3 w-3 place-items-center rounded-full bg-rose-400 ring-4 ring-white" aria-hidden />
              <b className="text-[#3a1530]">{h.value === "later" ? "Asked for a little time" : h.value === "yes" ? "Said yes" : "Said no"}</b> <span className="text-xs text-[#8a6a80]">· {fmt(h.at)}</span>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}

/*
  The activity report itself. The owner's screen (below) and the admin's page inspector both show THIS, fed by the same report,
  so what an admin sees is exactly what the owner sees. `top` is the link back, `actions` are the buttons under the headline.
*/
export function ActivityReport({ d, top, actions, footer }) {
  const [copied, setCopied] = useState(false);
  const view = useMemo(() => {
    if (!d) return null;
    const rows = (ROWS[d.page.theme] || common)(d.totals).filter((r) => r.of !== 0);
    const done = rows.filter((r) => d.byType[r.type]).length;
    const days = [];
    d.timeline.forEach((e) => { const label = dayLabel(e.at); const last = days[days.length - 1]; if (last && last.label === label) last.items.push(e); else days.push({ label, items: [e] }); });
    return { rows, done, days };
  }, [d]);

  const { page, summary, answer, replies, byType } = d;
  const t = TEMPLATES.find((x) => x.theme === page.theme);
  const opened = summary.opens > 0;
  const name = page.recipientName;
  const copyLink = async () => { try { await navigator.clipboard.writeText(d.page.url); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* blocked */ } };

  const headline = answer?.value === "yes" ? (page.theme === "proposal" ? `${name} said YES! 💍` : `${name} forgave you 💖`)
    : answer?.value === "no" ? `${name} gave you an honest answer 🕊️`
    : answer?.value === "later" ? `${name} needs a little time ⏳`
    : opened ? `${name} opened it ${plural(summary.opens, "time")} 👀`
    : `Waiting for ${name} to open it…`;
  const sub = opened ? `Last opened ${ago(summary.lastOpenedAt)}${summary.firstOpenedAt ? `, first on ${fmt(summary.firstOpenedAt)}` : ""}` : "Share your link from My pages. This fills in the moment they open it.";

  return (
    <div className="py-5 lg:py-8">
      {top}

      {/* the headline */}
      <div className={cx("relative mt-3 overflow-hidden rounded-[30px] bg-gradient-to-br p-5 sm:p-7", t?.tint || "from-pink-100 to-orange-100")}>
        <span className="pointer-events-none absolute -right-6 -top-6 h-36 w-36 rounded-full bg-white/40" aria-hidden />
        <span className="pointer-events-none absolute bottom-3 right-10 text-4xl opacity-40" aria-hidden>{answer?.value === "yes" ? "🎊" : "✨"}</span>
        <div className="relative flex items-start gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/85 text-3xl shadow-sm sm:h-16 sm:w-16 sm:text-4xl" aria-hidden>{META[page.theme]?.emoji || "💌"}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold uppercase tracking-[0.16em] text-rose-600/90">{page.title}</p>
            <h1 className="mt-0.5 text-balance text-2xl font-extrabold leading-tight tracking-tight text-[#3a1530] sm:text-3xl">{headline}</h1>
            <p className="mt-1 text-sm text-[#6b3a5a]">{sub}</p>
            {page.expiresAt && <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-[#6b3a5a]">⏳ {page.daysLeft <= 0 ? "Expires today" : `${page.daysLeft} day${page.daysLeft === 1 ? "" : "s"} left`} · deleted on {new Date(page.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>}
          </div>
        </div>
        <div className="relative mt-4 flex flex-wrap gap-2">
          {actions}
          {d.page.url && <Button type="button" variant="outline" size="sm" onClick={copyLink} className="!bg-white/80">{copied ? <><Check className="h-3.5 w-3.5" aria-hidden /> Copied</> : <><Copy className="h-3.5 w-3.5" aria-hidden /> Copy link</>}</Button>}
        </div>
      </div>

      {/* the numbers */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile emoji="👀" value={summary.opens} label={summary.opens === 1 ? "time opened" : "times opened"} tone="bg-sky-50 text-sky-800" />
        <Tile emoji="🧑" value={summary.uniqueVisitors || (opened ? 1 : 0)} label={summary.uniqueVisitors === 1 ? "visitor" : "visitors"} tone="bg-violet-50 text-violet-800" />
        <Tile emoji="⏱️" value={summary.totalSeconds ? dur(summary.totalSeconds) : "–"} label="on the page" tone="bg-amber-50 text-amber-800" />
        <Tile emoji="💌" value={replies.length} label={replies.length === 1 ? "message" : "messages"} tone="bg-rose-50 text-rose-800" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-4">
          {(page.theme === "proposal" || page.theme === "sorry") && <AnswerCard a={answer} template={page.theme} sender={page.senderName} recipient={name} />}

          <Card title={`Messages${replies.length ? ` (${replies.length})` : ""}`} icon="💌">
            {replies.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl bg-rose-50/70 p-4 text-sm text-[#7a5370]"><MessageCircleHeart className="h-6 w-6 shrink-0 text-rose-300" aria-hidden /> No messages yet. If {name} writes back, it appears here.</div>
            ) : (
              <ul className="space-y-3">
                {[...replies].reverse().map((r, i) => (
                  <li key={i} className="flex items-end gap-2.5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-rose-400 to-orange-400 text-sm font-bold text-white" aria-hidden>{(name[0] || "?").toUpperCase()}</span>
                    <div className="min-w-0 max-w-[92%]">
                      <p className="whitespace-pre-wrap break-words rounded-3xl rounded-bl-md bg-rose-50 px-4 py-2.5 text-[15px] leading-relaxed text-[#3a1530]">{r.text}</p>
                      <p className="mt-1 pl-2 text-[11px] text-[#a07890]">{name} · {fmt(r.at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {opened && (
            <Card title="Where they've been" icon="🧭">
              <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 p-3.5">
                <Ring done={view.done} total={view.rows.length} />
                <div className="min-w-0">
                  <p className="text-base font-bold text-[#3a1530]">{view.done} of {view.rows.length} things explored</p>
                  <p className="text-xs text-[#8a6a80]">{view.done === view.rows.length ? "They found everything you made. 🥹" : "The ones left are still waiting for them."}</p>
                </div>
              </div>
              <ul className="mt-3 divide-y divide-rose-50">
                {view.rows.map((r) => {
                  const e = byType[r.type];
                  const done = Boolean(e);
                  const n = e ? (r.total ? e.total : r.of != null ? e.items.length : e.count) : 0;
                  const detail = !e ? "Not yet" : r.level ? `reached ${e.lastData?.level ?? 0}%` : r.total ? `${n} total` : r.of != null ? `${Math.min(n, r.of)} of ${r.of}` : r.count ? `${e.count}×` : r.last ? "" : "Done";
                  const frac = r.of ? Math.min(1, n / r.of) : done ? 1 : 0;
                  return (
                    <li key={r.type + r.label} className="py-3">
                      <div className="flex items-center gap-3">
                        <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl", done ? "bg-rose-100" : "bg-slate-100 grayscale")} aria-hidden>{r.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className={cx("text-sm font-semibold", done ? "text-[#3a1530]" : "text-[#a07890]")}>{r.label}</p>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-rose-100" aria-hidden><div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400 transition-all" style={{ width: `${Math.round(frac * 100)}%` }} /></div>
                          {r.last && e?.lastData?.text && <p className="mt-1 text-xs text-[#6b3a5a]">{e.lastData.text}</p>}
                        </div>
                        <span className={cx("shrink-0 text-xs font-bold", done ? "text-emerald-600" : "text-[#c4a8b8]")}>{done && <Check className="mr-0.5 inline h-3.5 w-3.5" strokeWidth={3} aria-hidden />}{detail}</span>
                      </div>
                      {r.list && e?.items.length > 0 && (
                        <ul className="mt-2 flex flex-wrap gap-1.5 pl-[52px]">
                          {e.items.map((it) => <li key={it.key} className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">{r.names?.[it.key] || it.label || `#${Number(it.key) + 1 || it.key}`}</li>)}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          {opened && (
            <Card title="How they came" icon="📱">
              <div className="space-y-2.5 text-sm text-[#4a2340]">
                {Object.entries(summary.devices).length > 0 && (
                  <div className="flex flex-wrap gap-2">{Object.entries(summary.devices).map(([k, v]) => <span key={k} className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-800"><Smartphone className="h-3.5 w-3.5" aria-hidden /> {v}× on {k}</span>)}</div>
                )}
                <p className="flex items-center gap-2"><Users className="h-4 w-4 text-violet-400" aria-hidden /> {plural(summary.uniqueVisitors || 1, "visitor")} so far</p>
                <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" aria-hidden /> {summary.totalSeconds ? `${dur(summary.totalSeconds)} spent in total` : "Time on the page shows after they leave"}</p>
                <p className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-rose-400" aria-hidden /> First opened {fmt(summary.firstOpenedAt)}</p>
              </div>
            </Card>
          )}

          <Card title="Everything, in order" icon="🕒">
            {view.days.length === 0 ? (
              <div className="rounded-2xl bg-rose-50/70 p-5 text-center text-sm text-[#7a5370]"><p className="text-3xl" aria-hidden>🌱</p><p className="mt-1">Nothing yet. Every tap {name} makes will show up here, newest first.</p></div>
            ) : (
              <div className="space-y-5">
                {view.days.map((day) => (
                  <div key={day.label}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#a07890]">{day.label}</p>
                    <ol className="relative space-y-3 border-l-2 border-rose-100 pl-5">
                      {day.items.map((e, i) => {
                        const [emoji, tone, text] = EVT[e.type] || ["•", "slate", () => e.type];
                        return (
                          <li key={i} className="relative">
                            <span className={cx("absolute -left-[33px] top-0 grid h-7 w-7 place-items-center rounded-full text-sm ring-4 ring-white", TONE[tone])} aria-hidden>{emoji}</span>
                            <p className="text-sm leading-snug text-[#3a1530]">{text(e.data || {})}</p>
                            <time dateTime={e.at} className="text-[11px] text-[#a07890]">{time(e.at)} · {ago(e.at)}</time>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {footer ?? <p className="flex items-center justify-center gap-1.5 px-2 text-center text-xs text-[#a07890]"><Share2 className="h-3.5 w-3.5" aria-hidden /> Updates itself every 30 seconds while this page is open.</p>}
        </div>
      </div>
    </div>
  );
}

export default function PageActivity() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const load = () => getActivity(id).then(setD).catch((e) => setError(errMsg(e)));
    load();
    const t = setInterval(load, 30000); // it fills in while they're on the page
    return () => clearInterval(t);
  }, [id]);

  if (error) return <p role="alert" className="py-20 text-center text-rose-600">{error} <Link to="/memories/app/pages" className="font-semibold underline">Back to my pages</Link></p>;
  if (!d) return <Loading label="Loading activity…" />;
  return (
    <ActivityReport d={d}
      top={<Link to="/memories/app/pages" className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden /> My pages</Link>}
      actions={<>
        <Button as={Link} to={`/memories/app/pages/${d.page.id}/preview`} variant="outline" size="sm" className="!bg-white/80"><Eye className="h-3.5 w-3.5" aria-hidden /> Preview</Button>
        <Button as={Link} to={`/memories/app/pages/${d.page.id}/edit`} variant="outline" size="sm" className="!bg-white/80"><Pencil className="h-3.5 w-3.5" aria-hidden /> Edit</Button>
      </>} />
  );
}
