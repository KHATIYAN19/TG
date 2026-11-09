import { useEffect, useRef } from "react";
import { Gift, Lock, Plus, RotateCcw, Sparkles, Trash2, X } from "lucide-react";

import { THEME_LIST } from "./themes";
import { emojiFor } from "./Gifts";

/*
  SENDER EDITOR
  Everything the person who is MAKING the page can choose: the look (theme), names, age, the message,
  the gifts (by name) and the wishes that pop out of the balloons. It edits a plain `data` object and
  a `themeId`; the page re-renders live. The live page builder will use this same panel.
*/
export const MAX_GIFTS = 8;
export const MAX_WISHES = 10;
export const MAX_PROMISES = 8;
export const MAX_TIMELINE = 8;
export const MAX_REASONS = 12;
export const MAX_STATS = 6;
export const MAX_PEOPLE = 10;
const SUGGESTIONS = ["Movie date", "Coffee on me", "Dinner together", "A giant hug", "Weekend getaway", "Shopping spree", "Concert tickets", "Spa day"];

/* what the panel shows for each template; Birthday is the default */
export const BIRTHDAY_EDITOR = {
  themes: THEME_LIST, age: true, promises: false,
  giftsTitle: "Gifts for them",
  giftsHint: <>Name each gift, like &ldquo;Movie date&rdquo;. They tap a box to unwrap it. <b>No gifts? The gifts section is hidden.</b></>,
  giftSuggestions: SUGGESTIONS,
  wishesTitle: "Balloon wishes",
  wishesHint: "One short wish per line. They pop out when a balloon is burst. Leave empty for the default wishes.",
  messageTitle: "Your message",
};

let gid = 1000;
const newGift = (title = "") => ({ id: `g${++gid}`, title, note: "", emoji: "" });

const field = "block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-pink-400 focus:ring-4 focus:ring-pink-100";
const label = "mb-1 block text-xs font-semibold text-slate-600";

export function EditorFields({ data, onData, themeId, onTheme, config = BIRTHDAY_EDITOR, cards = false }) {
  const gifts = data.gifts || [];
  const promises = data.promises || [];
  const timeline = data.timeline || [];
  const reasons = data.reasons || [];
  const stats = data.stats || [];
  const people = data.people || [];
  let step = 0;
  const n = () => ++step;
  const set = (patch) => onData({ ...data, ...patch });
  const setGift = (id, patch) => set({ gifts: gifts.map((g) => (g.id === id ? { ...g, ...patch } : g)) });

  return (
    <div className={cards ? "pb-cards space-y-4 text-slate-900" : "space-y-6"}>
          {/* LOOK */}
          <section>
            <h3 className="mb-2 text-sm font-bold">{n()}. Pick a look</h3>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Theme">
              {config.themes.map((t) => {
                const on = t.id === themeId;
                return (
                  <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => onTheme(t.id)}
                    className={`rounded-2xl border p-2.5 text-left transition ${on ? "border-pink-400 bg-pink-50 ring-2 ring-pink-200" : "border-slate-200 hover:border-slate-300"}`}>
                    <span className="flex -space-x-1.5">{t.swatch.map((c) => <span key={c} className="h-6 w-6 rounded-full border-2 border-white shadow-sm" style={{ background: c }} />)}</span>
                    <span className="mt-1.5 block text-sm font-semibold leading-tight">{t.name}</span>
                    <span className="block text-[11px] leading-snug text-slate-500">{t.blurb}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* WHO */}
          <section>
            <h3 className="mb-2 text-sm font-bold">{n()}. Who is it for?</h3>
            <div className="grid grid-cols-2 gap-2">
              <div><label className={label} htmlFor="se-to">Their name</label><input id="se-to" className={`${field} ${config.lockNames ? "cursor-not-allowed bg-slate-50 text-slate-500" : ""}`} maxLength={40} value={data.recipientName} disabled={config.lockNames} onChange={(e) => set({ recipientName: e.target.value })} /></div>
              <div><label className={label} htmlFor="se-from">Your name</label><input id="se-from" className={`${field} ${config.lockNames ? "cursor-not-allowed bg-slate-50 text-slate-500" : ""}`} maxLength={40} value={data.senderName} disabled={config.lockNames} onChange={(e) => set({ senderName: e.target.value })} /></div>
              {config.lockNames && <p className="col-span-2 flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-600"><Lock className="h-3.5 w-3.5 shrink-0" aria-hidden /> Names can&apos;t be changed after the page is created. Everything else below can.</p>}
              {config.nameWarning && <p className="col-span-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200"><Lock className="h-3.5 w-3.5 shrink-0" aria-hidden /> Check the spelling. Both names are locked once you create the page.</p>}
              {config.since && <div className="col-span-2"><label className={label} htmlFor="se-since">Together since</label><input id="se-since" type="date" className={field} max={new Date().toISOString().slice(0, 10)} value={data.since || ""} onChange={(e) => set({ since: e.target.value })} /></div>}
              {config.audiences && (
                <div className="col-span-2">
                  <span className={label}>Who are you thanking?</span>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Who are you thanking">
                    {config.audiences.map((a) => (
                      <button key={a.id} type="button" role="radio" aria-checked={data.audience === a.id} onClick={() => set({ audience: a.id })} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${data.audience === a.id ? "border-pink-400 bg-pink-50 text-pink-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{a.emoji} {a.label}</button>
                    ))}
                  </div>
                </div>
              )}
              {config.question && (
                <div className="col-span-2">
                  <label className={label} htmlFor="se-q">{config.questionLabel || "The question you will ask"}</label>
                  <input id="se-q" className={field} maxLength={100} value={data.question || ""} placeholder={config.questionPlaceholder || "Will you marry me?"} onChange={(e) => set({ question: e.target.value })} />
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(config.questionPresets || []).map((q) => (
                      <button key={q} type="button" onClick={() => set({ question: q })} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${data.question === q ? "border-pink-400 bg-pink-50 text-pink-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{q}</button>
                    ))}
                  </div>
                </div>
              )}
              {config.age && <div><label className={label} htmlFor="se-age">Their age (optional)</label><input id="se-age" className={field} type="number" min="1" max="120" value={data.age ?? ""} onChange={(e) => set({ age: e.target.value ? Math.min(120, Math.max(1, Number(e.target.value))) : null })} /></div>}
            </div>
          </section>

          {/* MESSAGE */}
          <section>
            <h3 className="mb-2 text-sm font-bold">{n()}. {config.messageTitle}</h3>
            <textarea className={`${field} min-h-[110px] resize-y`} maxLength={1200} value={data.message} onChange={(e) => set({ message: e.target.value })} aria-label="Your message" />
            <p className="mt-1 text-right text-[11px] text-slate-400">{data.message.length} / 1200</p>
          </section>

          {/* GIFTS */}
          {config.gifts !== false && (

          <section>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="text-sm font-bold">{n()}. {config.giftsTitle}</h3>
              <span className="text-[11px] text-slate-400">{gifts.length} / {MAX_GIFTS}</span>
            </div>
            <p className="mb-2 text-xs text-slate-500">{config.giftsHint}</p>

            <ul className="space-y-2">
              {gifts.map((g, i) => (
                <li key={g.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-2.5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-lg shadow-sm" aria-hidden>{emojiFor(g)}</span>
                    <input className={field} placeholder={`Gift ${i + 1} name`} maxLength={60} value={g.title} onChange={(e) => setGift(g.id, { title: e.target.value })} aria-label={`Gift ${i + 1} name`} />
                    <button type="button" onClick={() => set({ gifts: gifts.filter((x) => x.id !== g.id) })} aria-label={`Remove gift ${i + 1}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input className={field} placeholder="A little note (optional)" maxLength={140} value={g.note} onChange={(e) => setGift(g.id, { note: e.target.value })} aria-label={`Gift ${i + 1} note`} />
                    <input className={`${field} !w-16 text-center`} placeholder="🎁" maxLength={4} value={g.emoji} onChange={(e) => setGift(g.id, { emoji: e.target.value })} aria-label={`Gift ${i + 1} emoji (optional)`} />
                  </div>
                </li>
              ))}
            </ul>

            <button type="button" disabled={gifts.length >= MAX_GIFTS} onClick={() => set({ gifts: [...gifts, newGift()] })}
              className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-pink-300 px-3 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40">
              <Plus className="h-4 w-4" /> Add a gift
            </button>
            {gifts.length < MAX_GIFTS && (
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Gift ideas">
                {config.giftSuggestions.filter((x) => !gifts.some((g) => g.title === x)).slice(0, 6).map((x) => (
                  <button key={x} type="button" onClick={() => set({ gifts: [...gifts, newGift(x)] })} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-pink-100 hover:text-pink-700">+ {x}</button>
                ))}
              </div>
            )}
          </section>
          )}

          {/* TIMELINE (Anniversary) */}
          {config.people && (
            <section>
              <div className="mb-1 flex items-center justify-between"><h3 className="text-sm font-bold">{n()}. {config.peopleTitle || "People to thank"}</h3><span className="text-[11px] text-slate-400">{people.length} / {MAX_PEOPLE}</span></div>
              <p className="mb-2 text-xs text-slate-500">{config.peopleHint}</p>
              <ul className="space-y-2">
                {people.map((m, i) => (
                  <li key={m.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-2.5">
                    <div className="flex gap-2">
                      <input className={field} placeholder="Name" maxLength={60} value={m.title} onChange={(e) => set({ people: people.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x)) })} aria-label={`Person ${i + 1} name`} />
                      <input className={`${field} !w-32`} placeholder="Role (optional)" maxLength={30} value={m.date} onChange={(e) => set({ people: people.map((x) => (x.id === m.id ? { ...x, date: e.target.value } : x)) })} aria-label={`Person ${i + 1} role`} />
                      <button type="button" onClick={() => set({ people: people.filter((x) => x.id !== m.id) })} aria-label={`Remove person ${i + 1}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <input className={`${field} mt-2`} placeholder="Why you are thankful for them" maxLength={200} value={m.note} onChange={(e) => set({ people: people.map((x) => (x.id === m.id ? { ...x, note: e.target.value } : x)) })} aria-label={`Person ${i + 1} note`} />
                  </li>
                ))}
              </ul>
              <button type="button" disabled={people.length >= MAX_PEOPLE} onClick={() => set({ people: [...people, { id: `pp${++gid}`, date: "", title: "", note: "" }] })}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-pink-300 px-3 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" /> Add a person</button>
            </section>
          )}

          {config.timeline && (
            <section>
              <div className="mb-1 flex items-center justify-between"><h3 className="text-sm font-bold">{n()}. {config.timelineTitle || "Our story"}</h3><span className="text-[11px] text-slate-400">{timeline.length} / {MAX_TIMELINE}</span></div>
              <p className="mb-2 text-xs text-slate-500">{config.timelineHint || <>The moments that made you, in order, like &ldquo;We met&rdquo; or &ldquo;Our first trip&rdquo;. <b>None? The timeline is hidden.</b></>}</p>
              <ul className="space-y-2">
                {timeline.map((m, i) => (
                  <li key={m.id} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-2.5">
                    <div className="flex gap-2">
                      <input className={`${field} !w-28`} placeholder="Feb 2021" maxLength={30} value={m.date} onChange={(e) => set({ timeline: timeline.map((x) => (x.id === m.id ? { ...x, date: e.target.value } : x)) })} aria-label={`Moment ${i + 1} date`} />
                      <input className={field} placeholder="What happened?" maxLength={60} value={m.title} onChange={(e) => set({ timeline: timeline.map((x) => (x.id === m.id ? { ...x, title: e.target.value } : x)) })} aria-label={`Moment ${i + 1} title`} />
                      <button type="button" onClick={() => set({ timeline: timeline.filter((x) => x.id !== m.id) })} aria-label={`Remove moment ${i + 1}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                    <input className={`${field} mt-2`} placeholder="A line about it (optional)" maxLength={200} value={m.note} onChange={(e) => set({ timeline: timeline.map((x) => (x.id === m.id ? { ...x, note: e.target.value } : x)) })} aria-label={`Moment ${i + 1} note`} />
                  </li>
                ))}
              </ul>
              <button type="button" disabled={timeline.length >= MAX_TIMELINE} onClick={() => set({ timeline: [...timeline, { id: `t${++gid}`, date: "", title: "", note: "" }] })}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-pink-300 px-3 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" /> Add a moment</button>
            </section>
          )}

          {/* REASONS (Anniversary) */}
          {config.reasons && (
            <section>
              <div className="mb-1 flex items-center justify-between"><h3 className="text-sm font-bold">{n()}. {config.reasonsTitle || "Reasons I love you"}</h3><span className="text-[11px] text-slate-400">{reasons.length} / {MAX_REASONS}</span></div>
              <p className="mb-2 text-xs text-slate-500">{config.reasonsHint || <>They pull these out of a jar, one at a time. <b>None? The jar is hidden.</b></>}</p>
              <ul className="space-y-2">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input className={field} maxLength={120} placeholder={`Reason ${i + 1}`} value={r} onChange={(e) => set({ reasons: reasons.map((x, k) => (k === i ? e.target.value : x)) })} aria-label={`Reason ${i + 1}`} />
                    <button type="button" onClick={() => set({ reasons: reasons.filter((_, k) => k !== i) })} aria-label={`Remove reason ${i + 1}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
              <button type="button" disabled={reasons.length >= MAX_REASONS} onClick={() => set({ reasons: [...reasons, ""] })}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-pink-300 px-3 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" /> Add a reason</button>
            </section>
          )}

          {/* LOVE IN NUMBERS (Anniversary) */}
          {config.stats && (
            <section>
              <div className="mb-1 flex items-center justify-between"><h3 className="text-sm font-bold">{n()}. {config.statsTitle || "Our love in numbers"}</h3><span className="text-[11px] text-slate-400">{stats.length} / {MAX_STATS}</span></div>
              <p className="mb-2 text-xs text-slate-500">{config.statsHint || <>Fun facts, like &ldquo;Movies watched&rdquo; and &ldquo;120&rdquo;. Days together is added automatically.</>}</p>
              <ul className="space-y-2">
                {stats.map((x, i) => (
                  <li key={x.id} className="flex items-center gap-2">
                    <input className={field} maxLength={28} placeholder="Label" value={x.label} onChange={(e) => set({ stats: stats.map((q) => (q.id === x.id ? { ...q, label: e.target.value } : q)) })} aria-label={`Fact ${i + 1} label`} />
                    <input className={`${field} !w-24 text-center`} maxLength={16} placeholder="120" value={x.value} onChange={(e) => set({ stats: stats.map((q) => (q.id === x.id ? { ...q, value: e.target.value } : q)) })} aria-label={`Fact ${i + 1} value`} />
                    <button type="button" onClick={() => set({ stats: stats.filter((q) => q.id !== x.id) })} aria-label={`Remove fact ${i + 1}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
              <button type="button" disabled={stats.length >= MAX_STATS} onClick={() => set({ stats: [...stats, { id: `s${++gid}`, label: "", value: "" }] })}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-pink-300 px-3 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" /> Add a fact</button>
            </section>
          )}

          {/* PROMISES (Sorry, Anniversary) */}
          {config.promises && (
            <section>
              <div className="mb-1 flex items-center justify-between"><h3 className="text-sm font-bold">{n()}. {config.promisesTitle || "Your promises"}</h3><span className="text-[11px] text-slate-400">{promises.length} / {MAX_PROMISES}</span></div>
              <p className="mb-2 text-xs text-slate-500">{config.promisesHint || <>Things you promise to do better. They appear as cards to flip open. <b>None? That section is hidden.</b></>}</p>
              <ul className="space-y-2">
                {promises.map((p, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input className={field} maxLength={120} placeholder={`Promise ${i + 1}`} value={p} onChange={(e) => set({ promises: promises.map((x, k) => (k === i ? e.target.value : x)) })} aria-label={`Promise ${i + 1}`} />
                    <button type="button" onClick={() => set({ promises: promises.filter((_, k) => k !== i) })} aria-label={`Remove promise ${i + 1}`} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
              </ul>
              <button type="button" disabled={promises.length >= MAX_PROMISES} onClick={() => set({ promises: [...promises, ""] })}
                className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-dashed border-pink-300 px-3 py-2 text-sm font-semibold text-pink-600 hover:bg-pink-50 disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-4 w-4" /> Add a promise</button>
            </section>
          )}

          {/* WISHES */}
          <section>
            <h3 className="mb-1 text-sm font-bold">{n()}. {config.wishesTitle}</h3>
            <p className="mb-2 text-xs text-slate-500">{config.wishesHint}</p>
            <textarea className={`${field} min-h-[96px] resize-y`} value={(data.wishes || []).join("\n")} aria-label="Balloon wishes, one per line"
              onChange={(e) => set({ wishes: e.target.value.split("\n").slice(0, MAX_WISHES).map((l) => l.slice(0, 60)) })}
              onBlur={() => set({ wishes: (data.wishes || []).map((l) => l.trim()).filter(Boolean) })} />
          </section>
    </div>
  );
}

export default function SenderEditor({ open, onClose, data, onData, themeId, onTheme, onReset, config = BIRTHDAY_EDITOR }) {
  const closeRef = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const key = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    closeRef.current?.focus();
    return () => window.removeEventListener("keydown", key);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-end bg-slate-900/40 backdrop-blur-[2px] md:items-stretch" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside role="dialog" aria-modal="true" aria-label="Customize your page" className="flex max-h-[90svh] w-full flex-col overflow-hidden rounded-t-3xl bg-white text-slate-900 shadow-2xl md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl" style={{ userSelect: "text" }}>
        <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pink-500 to-orange-400 text-white"><Sparkles className="h-4 w-4" /></span>
          <div className="min-w-0 flex-1"><h2 className="text-base font-bold">Customize your page</h2><p className="text-xs text-slate-500">Changes show up instantly behind this panel</p></div>
          <button ref={closeRef} onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <EditorFields data={data} onData={onData} themeId={themeId} onTheme={onTheme} config={config} />
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
          <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"><RotateCcw className="h-4 w-4" /> Reset</button>
          <button type="button" onClick={onClose} className="rounded-xl bg-gradient-to-r from-pink-500 to-orange-400 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-105">Done</button>
        </footer>
      </aside>
    </div>
  );
}

export function CustomizeButton({ onClick, giftCount }) {
  return (
    <button type="button" onClick={onClick} className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] right-3 z-[100] inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-4 py-2.5 text-sm font-semibold text-white shadow-xl backdrop-blur transition hover:scale-105 hover:bg-slate-900 active:scale-95">
      <Sparkles className="h-4 w-4 text-pink-300" aria-hidden /> Customize
      {giftCount != null && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-pink-500 px-1 text-[11px]"><Gift className="mr-0.5 h-3 w-3" aria-hidden />{giftCount}</span>}
    </button>
  );
}
