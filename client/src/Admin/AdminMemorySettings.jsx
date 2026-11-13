import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CalendarClock, CreditCard, Gauge, Loader2, Mail, Plus, Power, Save, ShieldOff, Trash2, Wallet } from "lucide-react";

import { Btn, Field, inputCls, when } from "./AdminMemoryUi";

/*
  SETTINGS. Grouped by what you are deciding: whether people can buy, how long pages live, who can be emailed, how people pay,
  and the default limits. One Save bar stays in reach and tells you when something has changed.
*/

function Section({ icon: Icon, title, hint, tone = "from-pink-500 to-rose-500", children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-white shadow`}><Icon size={18} /></span>
        <div><h2 className="text-sm font-extrabold text-slate-900">{title}</h2>{hint && <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{hint}</p>}</div>
      </div>
      {children}
    </section>
  );
}

function Switch({ checked, onChange, label, hint }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-emerald-500" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
      </button>
      <span className="min-w-0"><span className="block text-sm font-semibold text-slate-800">{label}</span>{hint && <span className="block text-xs text-slate-500">{hint}</span>}</span>
    </label>
  );
}

export default function Settings({ http, run, setDialog }) {
  const [s, setS] = useState(null);
  const [saved, setSaved] = useState(null); // what the server has, to tell when something changed
  const [gw, setGw] = useState(null);
  const [savedGw, setSavedGw] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    run(() => http.get("/settings")).then((d) => { if (d) { setS(d); setSaved(JSON.stringify(d)); } });
    run(() => http.get("/gateways")).then((d) => { if (d) { setGw({ items: d.items, on: new Set(d.items.filter((g) => g.enabled).map((g) => g.id)), def: d.defaultGateway }); setSavedGw(JSON.stringify([d.items.filter((g) => g.enabled).map((g) => g.id), d.defaultGateway])); } });
  }, [http, run]);

  const dirty = useMemo(() => Boolean(s && gw) && (JSON.stringify(s) !== saved || JSON.stringify([[...gw.on], gw.def]) !== savedGw), [s, gw, saved, savedGw]);
  if (!s || !gw) return <div className="grid place-items-center py-24 text-slate-400"><Loader2 className="animate-spin" /></div>;

  const toggleGw = (id) => setGw((g) => {
    const on = new Set(g.on);
    on.has(id) ? on.delete(id) : on.add(id);
    return { ...g, on, def: on.has(g.def) ? g.def : [...on][0] || "" };
  });
  const num = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const isDefault = (id) => gw.def === id || (!gw.def && [...gw.on][0] === id);

  const save = async () => {
    setSaving(true);
    const body = {
      price: Number(s.price), maxPhotos: Number(s.maxPhotos), maxVideos: Number(s.maxVideos),
      maxPhotoMb: Number(s.maxPhotoMb), maxVideoMb: Number(s.maxVideoMb), maxAudioMb: Number(s.maxAudioMb ?? 10), maxMessageChars: Number(s.maxMessageChars), enabled: Boolean(s.enabled),
      maxVideoSec: Number(s.maxVideoSec ?? 60), maxAudioSec: Number(s.maxAudioSec ?? 120),
      pageLifetimeDays: Number(s.pageLifetimeDays), emailEnabled: s.emailEnabled !== false, maxEmailsPerUserPerDay: Number(s.maxEmailsPerUserPerDay),
      enabledGateways: [...gw.on], defaultGateway: gw.on.has(gw.def) ? gw.def : [...gw.on][0] || "",
    };
    if (body.price > 0 && body.enabledGateways.length === 0) { toast.error("Switch on at least one payment gateway, or set the price to 0."); setSaving(false); return; }
    const d = await run(() => http.put("/settings", body), "Settings saved");
    if (d && d !== true) { setS(d); setSaved(JSON.stringify(d)); setSavedGw(JSON.stringify([body.enabledGateways, body.defaultGateway])); setGw((g) => ({ ...g, def: body.defaultGateway })); }
    setSaving(false);
  };

  return (
    <div className="space-y-4 pb-24">
      <div className="grid gap-4 xl:grid-cols-2">
        <Section icon={Power} title="Selling" hint="Turn buying and page creation on or off, and set the price used when a template or look has none of its own.">
          <Switch checked={s.enabled} onChange={(v) => setS({ ...s, enabled: v })} label={s.enabled ? "Memories is open" : "Memories is paused"} hint="Off: nobody can buy or create a page. Existing pages keep working." />
          <div className="mt-3"><Field label="Default price per page (₹)" hint="0 means free. A template or look with its own price ignores this. Applies to new payments straight away."><input className={inputCls} type="number" min="0" step="1" value={s.price} onChange={num("price")} /></Field></div>
        </Section>

        <Section icon={CalendarClock} title="Page lifetime" tone="from-indigo-500 to-violet-500" hint="How long a page stays online before it is deleted.">
          <Field label="Days a page stays online" hint="Counted from the day it is created. New pages only: a page that already exists keeps its end date (change one from the Pages tab)."><input className={inputCls} type="number" min="1" max="3650" step="1" value={s.pageLifetimeDays} onChange={num("pageLifetimeDays")} /></Field>
        </Section>

        <Section icon={Mail} title="Emailing a page" tone="from-sky-500 to-blue-500" hint="Owners can email their page link to the person it is for.">
          <Switch checked={s.emailEnabled !== false} onChange={(v) => setS({ ...s, emailEnabled: v })} label={s.emailEnabled !== false ? "Emailing is on" : "Emailing is off"} hint="Off hides the option from owners." />
          <div className="mt-3"><Field label="Emails per user per day" hint="Stops the option being used to spam. Counts pages made with an email in the last 24 hours."><input className={inputCls} type="number" min="1" max="200" step="1" value={s.maxEmailsPerUserPerDay} onChange={num("maxEmailsPerUserPerDay")} /></Field></div>
        </Section>

        <Section icon={Wallet} title="Payment methods" tone="from-emerald-500 to-teal-500" hint="People can pay with any gateway you switch on. A gateway needs its API keys on the server first. The default is pre-selected at checkout.">
          <div className="space-y-2">
            {gw.items.filter((g) => g.id !== "mock" || g.configured).map((g) => {
              const on = gw.on.has(g.id);
              return (
                <div key={g.id} className={`flex items-center gap-3 rounded-xl border p-3 transition ${on ? "border-pink-300 bg-pink-50/50" : "border-slate-200 bg-white"} ${g.configured ? "" : "opacity-60"}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600"><CreditCard size={17} /></span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold capitalize text-slate-900">{g.id}</p><p className="truncate text-[11px] text-slate-500">{g.configured ? g.label : "No API keys on the server"}</p></div>
                  {on && <button type="button" onClick={() => setGw({ ...gw, def: g.id })} className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isDefault(g.id) ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{isDefault(g.id) ? "Default" : "Make default"}</button>}
                  <button type="button" role="switch" aria-checked={on} aria-label={`Enable ${g.id}`} disabled={!g.configured} onClick={() => toggleGw(g.id)} className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:cursor-not-allowed ${on ? "bg-emerald-500" : "bg-slate-300"}`}>
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </Section>
      </div>

      <Section icon={Gauge} title="Default limits per page" tone="from-amber-500 to-orange-500" hint="What every page can hold, unless its template has its own limits (Templates & pricing). Buyers can add room with add-ons, and you can give a single page more room from the Pages tab.">
        <div className="grid gap-x-6 gap-y-1 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Photos</h3>
            <Field label="Max photos"><input className={inputCls} type="number" min="0" max="500" value={s.maxPhotos} onChange={num("maxPhotos")} /></Field>
            <Field label="Size of each photo (MB)" hint="Up to 25"><input className={inputCls} type="number" min="0.1" max="25" step="0.1" value={s.maxPhotoMb} onChange={num("maxPhotoMb")} /></Field>
          </div>
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Videos</h3>
            <Field label="Max videos"><input className={inputCls} type="number" min="0" max="100" value={s.maxVideos} onChange={num("maxVideos")} /></Field>
            <Field label="Size of each video (MB)" hint="Up to 500"><input className={inputCls} type="number" min="0.1" max="500" step="0.1" value={s.maxVideoMb} onChange={num("maxVideoMb")} /></Field>
            <Field label="Length of each video (seconds)"><input className={inputCls} type="number" min="1" max="3600" step="1" value={s.maxVideoSec ?? 60} onChange={num("maxVideoSec")} /></Field>
          </div>
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Voice message</h3>
            <Field label="Size (MB)" hint="Up to 25"><input className={inputCls} type="number" min="0.1" max="25" step="0.1" value={s.maxAudioMb ?? 10} onChange={num("maxAudioMb")} /></Field>
            <Field label="Length (seconds)" hint="Recording stops here"><input className={inputCls} type="number" min="1" max="1800" step="1" value={s.maxAudioSec ?? 120} onChange={num("maxAudioSec")} /></Field>
          </div>
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Letter</h3>
            <Field label="Message length (characters)"><input className={inputCls} type="number" min="10" max="10000" value={s.maxMessageChars} onChange={num("maxMessageChars")} /></Field>
          </div>
        </div>
      </Section>

      <MailBlocks http={http} run={run} setDialog={setDialog} />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3 sm:px-6">
          <span className={`mr-auto inline-flex items-center gap-1.5 text-xs font-semibold ${dirty ? "text-amber-600" : "text-slate-400"}`}><span className={`h-2 w-2 rounded-full ${dirty ? "bg-amber-500" : "bg-emerald-400"}`} />{dirty ? "You have unsaved changes" : "All changes saved"}</span>
          <Btn type="button" disabled={!dirty || saving} onClick={() => { setS(JSON.parse(saved)); const [on, def] = JSON.parse(savedGw); setGw((g) => ({ ...g, on: new Set(on), def })); }}>Discard</Btn>
          <Btn type="button" tone="primary" disabled={!dirty || saving} onClick={save}>{saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save settings</Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------- blocked recipient emails */

function MailBlocks({ http, run, setDialog }) {
  const [rows, setRows] = useState([]);
  const load = useCallback(async () => { const d = await run(() => http.get("/mail-blocks")); if (d) setRows(d); }, [http, run]);
  useEffect(() => { load(); }, [load]);
  const add = () => setDialog({
    kind: "form", title: "Never email this address", label: "Block address",
    intro: "Someone wrote to support asking not to get these emails? Add their address. Memories will refuse to send them any page.",
    fields: [{ name: "email", label: "Email address", type: "email" }, { name: "note", label: "Note (optional)", maxLength: 300 }],
    onSubmit: async (v) => { const d = await run(() => http.post("/mail-blocks", { email: v.email, note: v.note || undefined }), "Address blocked"); if (!d) return false; load(); return undefined; },
  });
  return (
    <Section icon={ShieldOff} title="Blocked recipient emails" tone="from-slate-600 to-slate-800" hint="Addresses that must never be emailed a page. Add one when a recipient asks to stop.">
      <div className="mb-3 flex justify-end"><Btn tone="primary" onClick={add}><Plus size={12} /> Add address</Btn></div>
      {rows.length === 0 ? <p className="rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-400">No blocked addresses.</p> : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-100">
          {rows.map((b) => (
            <li key={b.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
              <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-slate-800">{b.email}</span>{b.note && <span className="block truncate text-xs text-slate-500">{b.note}</span>}</span>
              <span className="hidden text-xs text-slate-400 sm:block">{when(b.createdAt)}</span>
              <Btn tone="danger" onClick={() => setDialog({ kind: "confirm", title: "Allow emails again?", text: `${b.email} will be able to receive pages again.`, label: "Remove", onSubmit: async () => { if (await run(() => http.delete(`/mail-blocks/${b.id}`), "Removed")) load(); } })}><Trash2 size={12} /></Btn>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

