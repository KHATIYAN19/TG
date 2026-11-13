import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Package, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";

import { Btn, Chip, Field, Modal, STATUS, inputCls, inr } from "./AdminMemoryUi";

/*
  ADMIN: TEMPLATES & PRICING, and ADD-ONS.
  Templates: show or hide a template, set its price, and for each of its looks (themes) switch it on or off and give it the same price or its own.
             A page bought at one price can use any look at that price or less. Each template can also have its own photo / video / voice / letter limits.
  Add-ons:   the extras a user can buy for a page (more photos, longer videos, a bigger voice message, a longer letter, more days online).
*/

const num = (v) => (v === "" || v == null ? null : Number(v));
const LIMIT_FIELDS = [
  ["photos", "Photos", "1", "0", "500"],
  ["videos", "Videos", "1", "0", "100"],
  ["photoMb", "Photo size (MB)", "0.1", "0.1", "25"],
  ["videoMb", "Video size (MB)", "1", "0.1", "500"],
  ["videoSec", "Video length (sec)", "1", "1", "3600"],
  ["audioMb", "Voice size (MB)", "0.1", "0.1", "25"],
  ["audioSec", "Voice length (sec)", "1", "1", "1800"],
  ["messageChars", "Letter length (chars)", "1", "10", "10000"],
];
const cap = (s) => String(s).replace(/(^|[-_ ])(\w)/g, (_, a, b) => (a ? " " : "") + b.toUpperCase());

/* ---------------------------------------------------- one template: the full editor */
function TemplateEditor({ o, onClose, onSave }) {
  const [name, setName] = useState(o.name);
  const [description, setDescription] = useState(o.description || "");
  const [price, setPrice] = useState(o.price ?? "");
  const [themes, setThemes] = useState(o.themes.map((t) => ({ ...t, price: t.price ?? "" })));
  const [limits, setLimits] = useState(Object.fromEntries(LIMIT_FIELDS.map(([k]) => [k, o.limits[k] ?? ""])));
  const [saving, setSaving] = useState(false);
  const setLook = (id, patch) => setThemes((l) => l.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const setAll = (price_) => setThemes((l) => l.map((t) => ({ ...t, price: price_ })));
  const free = o.effectivePrice; // what a look without its own price costs now

  const save = async () => {
    setSaving(true);
    const ok = await onSave({
      name: name.trim(), description: description.trim(), price: num(price),
      themes: themes.map((t) => ({ key: t.id, enabled: t.enabled, price: num(t.price) })),
      limits: Object.fromEntries(LIMIT_FIELDS.map(([k]) => [k, num(limits[k])])),
    });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <Modal wide title={`Edit ${o.name}`} onClose={onClose} footer={<><Btn onClick={onClose}>Cancel</Btn><Btn tone="primary" disabled={saving} onClick={save}>{saving && <Loader2 size={12} className="animate-spin" />} Save template</Btn></>}>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Name"><input className={inputCls} value={name} maxLength={60} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Template price (₹)" hint={`Leave empty to use the default price from Settings. 0 = free. Looks without their own price cost this (now ${inr(free)}).`}>
          <input className={inputCls} type="number" min="0" step="1" value={price} placeholder="Default" onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <div className="sm:col-span-2"><Field label="Short note (optional, only for you)"><input className={inputCls} value={description} maxLength={200} onChange={(e) => setDescription(e.target.value)} /></Field></div>
      </div>

      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Looks (themes)</h4>
          <p className="text-xs text-slate-500">Switch a look off to hide it from new pages. Give a look its own price, or leave it empty to use the template price. A user can pick any look at the price they paid or less.</p>
        </div>
        {themes.length > 0 && <div className="flex gap-1.5"><Btn onClick={() => setAll("")}>Same price for all</Btn><Btn onClick={() => setThemes((l) => l.map((t) => ({ ...t, enabled: true })))}>All on</Btn></div>}
      </div>
      {themes.length === 0 ? <p className="my-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">This template has no looks to choose from.</p> : (
        <div className="my-3 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500"><tr><th className="px-3 py-2">Look</th><th className="px-3 py-2">On</th><th className="px-3 py-2">Own price (₹)</th><th className="hidden px-3 py-2 sm:table-cell">Users pay</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {themes.map((t) => {
                const shown = t.price !== "" ? Number(t.price) : price !== "" ? Number(price) : free;
                return (
                  <tr key={t.id} className={t.enabled ? "" : "bg-slate-50/70 text-slate-400"}>
                    <td className="px-3 py-2 font-semibold">{cap(t.id)}</td>
                    <td className="px-3 py-2"><input type="checkbox" className="h-4 w-4 accent-pink-500" checked={t.enabled} aria-label={`${t.id} on`} onChange={(e) => setLook(t.id, { enabled: e.target.checked })} /></td>
                    <td className="px-3 py-2"><input className={`${inputCls} max-w-[120px]`} type="number" min="0" step="1" value={t.price} placeholder="= template" onChange={(e) => setLook(t.id, { price: e.target.value })} /></td>
                    <td className="hidden px-3 py-2 text-xs sm:table-cell">{t.enabled ? inr(shown) : "hidden"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h4 className="mt-2 text-sm font-bold text-slate-900">Limits for this template</h4>
      <p className="mb-2 text-xs text-slate-500">Leave a box empty to use the global limit from Settings (shown inside the box). Users can buy add-ons on top of these.</p>
      <div className="grid gap-x-3 sm:grid-cols-2 lg:grid-cols-4">
        {LIMIT_FIELDS.map(([k, label, step, min, max]) => (
          <Field key={k} label={label}><input className={inputCls} type="number" step={step} min={min} max={max} value={limits[k]} placeholder={String(o.effectiveLimits[k])} onChange={(e) => setLimits((l) => ({ ...l, [k]: e.target.value }))} /></Field>
        ))}
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------- templates tab */
export function Templates({ http, run, setDialog }) {
  const [rows, setRows] = useState(null);
  const [editing, setEditing] = useState(null);
  const load = useCallback(async () => { const d = await run(() => http.get("/occasions")); if (d) setRows(d); }, [http, run]);
  useEffect(() => { load(); }, [load]);

  const patch = async (o, body, msg) => { const d = await run(() => http.patch(`/occasions/${o.id}`, body), msg); if (d && d !== true) { setRows((l) => l.map((x) => (x.id === o.id ? d : x))); return true; } return false; };
  const toggleLook = (o, id) => patch(o, { themes: o.themes.map((t) => ({ key: t.id, enabled: t.id === id ? !t.enabled : t.enabled, price: t.price })) });
  const add = () => setDialog({
    kind: "form", title: "New template", label: "Add", intro: "The theme key picks which page design is shown (birthday, proposal, sorry, anniversary, thanks).",
    fields: [{ name: "name", label: "Name" }, { name: "theme", label: "Theme key", placeholder: "birthday" }],
    onSubmit: async (v) => { const d = await run(() => http.post("/occasions", { name: v.name, ...(v.theme ? { theme: v.theme } : {}) }), "Template added"); if (d) load(); else return false; },
  });

  if (!rows) return <Loader2 className="animate-spin text-slate-400" />;
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-2xl text-xs text-slate-500">Show or hide templates, set each template&apos;s price, and switch individual looks on or off. Tap a look to switch it. Open <b>Edit</b> to give looks their own prices or set limits per template.</p>
        <Btn tone="primary" onClick={add}><Plus size={12} /> Add template</Btn>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((o) => {
          const on = o.themes.filter((t) => t.enabled).length;
          return (
            <section key={o.id} className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm ${o.isActive ? "border-slate-200" : "border-slate-200 opacity-75"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-extrabold text-slate-900">{o.name}</h3>
                  <p className="font-mono text-[11px] text-slate-400">{o.theme}</p>
                </div>
                <Chip className={o.isActive ? STATUS.active : STATUS.closed}>{o.isActive ? "visible" : "hidden"}</Chip>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900">{inr(o.effectivePrice)}</span>
                <span className="text-xs text-slate-500">{o.price == null ? "default price" : o.price === 0 ? "free" : "template price"}</span>
              </div>
              {o.themes.length > 0 && (
                <>
                  <p className="mb-1.5 mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Looks · {on} of {o.themes.length} on</p>
                  <div className="flex flex-wrap gap-1.5">
                    {o.themes.map((t) => (
                      <button key={t.id} type="button" onClick={() => toggleLook(o, t.id)} aria-pressed={t.enabled} title={t.enabled ? "On: tap to hide this look" : "Hidden: tap to show this look"}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${t.enabled ? "border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100" : "border-slate-200 bg-slate-50 text-slate-400 line-through hover:bg-slate-100"}`}>
                        {t.enabled ? <Eye size={11} /> : <EyeOff size={11} />} {cap(t.id)} <span className="font-normal no-underline">{inr(t.effectivePrice)}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="mt-3 text-[11px] text-slate-500">{o.effectiveLimits.photos} photos · {o.effectiveLimits.videos} videos ({o.effectiveLimits.videoSec}s) · voice {o.effectiveLimits.audioSec}s · {o.effectiveLimits.messageChars} chars</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                <Btn onClick={() => setEditing(o)}><Pencil size={12} /> Edit price & limits</Btn>
                <Btn onClick={() => patch(o, { isActive: !o.isActive }, o.isActive ? "Template hidden" : "Template visible")}>{o.isActive ? <><EyeOff size={12} /> Hide</> : <><Eye size={12} /> Show</>}</Btn>
                <Btn tone="danger" onClick={() => setDialog({ kind: "confirm", title: "Delete template?", text: `"${o.name}" will be removed. If pages already use it, deletion is refused and you can hide it instead.`, label: "Delete", onSubmit: async () => { if (await run(() => http.delete(`/occasions/${o.id}`), "Template deleted")) load(); } })}><Trash2 size={12} /></Btn>
              </div>
            </section>
          );
        })}
      </div>
      {editing && <TemplateEditor key={editing.id} o={editing} onClose={() => setEditing(null)} onSave={(body) => patch(editing, body, "Template saved")} />}
    </div>
  );
}

/* ---------------------------------------------------- add-ons tab */
function AddonRow({ a, http, run, onChange }) {
  const [v, setV] = useState({ name: a.name, description: a.description, unit: a.unit, price: a.price, maxPacks: a.maxPacks, enabled: a.enabled });
  const [busy, setBusy] = useState(false);
  useEffect(() => { setV({ name: a.name, description: a.description, unit: a.unit, price: a.price, maxPacks: a.maxPacks, enabled: a.enabled }); }, [a]);
  const dirty = v.name !== a.name || v.description !== a.description || Number(v.unit) !== a.unit || Number(v.price) !== a.price || Number(v.maxPacks) !== a.maxPacks || v.enabled !== a.enabled;
  const save = async () => {
    setBusy(true);
    const d = await run(() => http.patch(`/addons/${a.key}`, { name: v.name.trim(), description: v.description.trim(), unit: Number(v.unit), price: Number(v.price), maxPacks: Number(v.maxPacks), enabled: v.enabled }), "Add-on saved");
    setBusy(false);
    if (d && d !== true) onChange(d);
  };
  const reset = async () => { const d = await run(() => http.post(`/addons/${a.key}/reset`), "Back to the default"); if (d && d !== true) onChange(d); };
  return (
    <section className={`rounded-2xl border bg-white p-4 shadow-sm ${v.enabled ? "border-slate-200" : "border-slate-200 bg-slate-50/60"}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-pink-50 text-pink-600"><Package size={17} /></span>
          <div className="min-w-0"><p className="truncate text-sm font-extrabold text-slate-900">{a.name}</p><p className="font-mono text-[11px] text-slate-400">{a.key} · adds {a.unitLabel}</p></div>
        </div>
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-600"><input type="checkbox" className="h-4 w-4 accent-pink-500" checked={v.enabled} onChange={(e) => setV({ ...v, enabled: e.target.checked })} /> On</label>
      </div>
      <div className="mt-3 grid gap-x-3 sm:grid-cols-2">
        <Field label="Name shown to users"><input className={inputCls} value={v.name} maxLength={60} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
        <Field label="Description"><input className={inputCls} value={v.description} maxLength={200} onChange={(e) => setV({ ...v, description: e.target.value })} /></Field>
        <Field label={`One pack adds (${a.unitLabel})`}><input className={inputCls} type="number" min="0.1" step="any" value={v.unit} onChange={(e) => setV({ ...v, unit: e.target.value })} /></Field>
        <Field label="Price of one pack (₹)"><input className={inputCls} type="number" min="0" step="1" value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} /></Field>
        <Field label="Most packs per page" hint={`At most +${Number(v.unit) * Number(v.maxPacks) || 0} ${a.unitLabel} on one page`}><input className={inputCls} type="number" min="1" max="100" step="1" value={v.maxPacks} onChange={(e) => setV({ ...v, maxPacks: e.target.value })} /></Field>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Btn tone="primary" disabled={!dirty || busy} onClick={save}>{busy && <Loader2 size={12} className="animate-spin" />} Save</Btn>
        <Btn onClick={reset} title="Put the built-in values back"><RotateCcw size={12} /> Reset</Btn>
      </div>
    </section>
  );
}

export function Addons({ http, run }) {
  const [rows, setRows] = useState(null);
  useEffect(() => { run(() => http.get("/addons")).then((d) => d && setRows(d)); }, [http, run]);
  if (!rows) return <Loader2 className="animate-spin text-slate-400" />;
  return (
    <div>
      <p className="mb-3 max-w-3xl text-xs text-slate-500">Add-ons are extras a user can buy for a page: while creating it (at checkout) or any time later from My pages and the editor. Each one raises one limit by the pack size. The price is per pack. Switch one off to stop selling it (pages that already bought it keep it).</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((a) => <AddonRow key={a.key} a={a} http={http} run={run} onChange={(n) => setRows((l) => l.map((x) => (x.key === n.key ? n : x)))} />)}
      </div>
    </div>
  );
}
