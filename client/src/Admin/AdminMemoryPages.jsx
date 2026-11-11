import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Activity,
  Ban,
  CalendarClock,
  CircleDollarSign,
  CreditCard,
  Eye,
  EyeOff,
  HardDrive,
  Radio,
  ShoppingBag,
  Copy,
  ExternalLink,
  Gift,
  Globe,
  Heart,
  Image as ImageIcon,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Ticket,
  Trash2,
  Unlock,
  Users,
} from "lucide-react";

import BASE_URL from "../utils/Url";
import { ActionMenu, Btn, Chip, Field, Kpi, Modal, Pager, Person, STATUS, Table, bytes, errText, inputCls, inr, when } from "./AdminMemoryUi";

// the two long lists are only downloaded when their tab is opened
const UsersTab = lazy(() => import("./AdminMemoryUsers.jsx"));
const Logins = lazy(() => import("./AdminMemoryLogins.jsx"));
const TabLoading = () => <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400"><Loader2 className="animate-spin" /></div>;

/* =====================================================
   ADMIN: MEMORY PAGES
     Overview     numbers at a glance
     Pages        every page with live link controls
     Users        who signed up, credits, last login
     Logins       sign-in history
     Codes        free-access codes
     Orders       payments
     Occasions    what users can pick
     Settings     price + upload limits
===================================================== */

const API = `${String(BASE_URL || "").replace(/\/+$/, "")}/api/admin/memories`;

const TABS = [
  ["overview", "Overview", Sparkles],
  ["pages", "Pages", Heart],
  ["users", "Users", Users],
  ["logins", "Logins", Activity],
  ["codes", "Codes", Ticket],
  ["gumroad", "Gumroad", Globe],
  ["orders", "Orders", Receipt],
  ["occasions", "Occasions", Gift],
  ["settings", "Settings", SettingsIcon],
];

/* ---------------------------------------------------- page */

export default function AdminMemoryPages() {
  const token = useSelector((s) => s.auth?.token);
  const [tab, setTab] = useState("overview");
  const [dialog, setDialog] = useState(null); // { kind, ... }

  const http = useMemo(
    () => axios.create({ baseURL: API, withCredentials: true, timeout: 30000, headers: token ? { Authorization: `Bearer ${token}` } : {} }),
    [token]
  );
  // run a request, toast the result, return data (or undefined on failure)
  const run = useCallback(async (fn, okMsg) => {
    try {
      const r = await fn();
      if (okMsg) toast.success(okMsg);
      return r?.data?.data ?? true;
    } catch (e) {
      toast.error(errText(e));
      return undefined;
    }
  }, []);

  const close = useCallback(() => setDialog(null), []);
  const ctx = { http, run, setDialog, close };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/70 via-slate-50 to-slate-50">
      <Helmet><title>Memory Pages · Admin</title><meta name="robots" content="noindex,nofollow" /></Helmet>
      <div className="mx-auto mt-16 max-w-7xl px-4 pb-12 pt-6 sm:px-6">
        <div className="relative mb-5 overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 p-6 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-white/10" aria-hidden="true" />
          <div className="relative flex flex-wrap items-center gap-4">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur"><Heart size={24} fill="currentColor" /></span>
            <div className="min-w-[220px] flex-1">
              <h1 className="text-2xl font-extrabold tracking-tight">Memory Pages</h1>
              <p className="text-sm text-white/85">Birthday, proposal and sorry pages: users, live links, payments and limits in one place.</p>
            </div>
            <Link to="/admin" className="rounded-xl bg-white/20 px-3 py-2 text-sm font-semibold backdrop-blur transition hover:bg-white/30">← Admin home</Link>
          </div>
        </div>

        <div className="sticky top-16 z-20 mb-5 -mx-1 px-1 py-1 backdrop-blur">
          <div className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-sm" role="tablist">
            {TABS.map(([key, label, Icon]) => (
              <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-semibold transition ${tab === key ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        {tab === "overview" && <Overview {...ctx} />}
        {tab === "pages" && <Pages {...ctx} />}
        <Suspense fallback={<TabLoading />}>
          {tab === "users" && <UsersTab {...ctx} />}
          {tab === "logins" && <Logins {...ctx} />}
        </Suspense>
        {tab === "codes" && <Codes {...ctx} />}
        {tab === "gumroad" && <Gumroad {...ctx} />}
        {tab === "orders" && <Orders {...ctx} />}
        {tab === "occasions" && <Occasions {...ctx} />}
        {tab === "settings" && <><Settings {...ctx} /><MailBlocks {...ctx} /></>}
      </div>
      {dialog && <Dialogs dialog={dialog} close={close} />}
    </div>
  );
}

/* ---------------------------------------------------- shared dialogs (confirm / prompt / PIN / text / media) */

function Dialogs({ dialog, close }) {
  const [vals, setVals] = useState(() => Object.fromEntries((dialog.fields || []).map((f) => [f.name, f.value ?? ""])));
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      const keep = await dialog.onSubmit?.(vals);
      if (keep !== false) close();
    } finally {
      setBusy(false);
    }
  };

  if (dialog.kind === "confirm") {
    return (
      <Modal title={dialog.title} onClose={close} footer={<>
        <Btn onClick={close}>Cancel</Btn>
        <Btn tone={dialog.tone || "danger"} disabled={busy} onClick={submit}>{busy && <Loader2 size={12} className="animate-spin" />} {dialog.label}</Btn>
      </>}>
        <p className="text-sm text-slate-600">{dialog.text}</p>
      </Modal>
    );
  }
  if (dialog.kind === "form") {
    return (
      <Modal title={dialog.title} onClose={close} footer={<>
        <Btn onClick={close}>Cancel</Btn>
        <Btn tone="primary" disabled={busy} onClick={submit}>{busy && <Loader2 size={12} className="animate-spin" />} {dialog.label}</Btn>
      </>}>
        {dialog.intro && <p className="mb-3 text-sm text-slate-500">{dialog.intro}</p>}
        {dialog.fields.map((f) => (
          <Field key={f.name} label={f.label} hint={f.hint}>
            <input className={inputCls} type={f.type || "text"} value={vals[f.name]} placeholder={f.placeholder} min={f.min} max={f.max} maxLength={f.maxLength} inputMode={f.inputMode}
              onChange={(e) => setVals((v) => ({ ...v, [f.name]: e.target.value }))} />
          </Field>
        ))}
      </Modal>
    );
  }
  if (dialog.kind === "pin") {
    return (
      <Modal title="New PIN" onClose={close} footer={<>
        <Btn onClick={() => { navigator.clipboard?.writeText(dialog.pin); toast.success("PIN copied"); }}><Copy size={12} /> Copy</Btn>
        <Btn tone="primary" onClick={close}>Done</Btn>
      </>}>
        <div className="my-2 rounded-xl bg-slate-100 py-4 text-center font-mono text-3xl font-extrabold tracking-[0.4em] text-slate-900">{dialog.pin}</div>
        <p className="text-sm text-slate-500">Share it with the page owner. Owners can also see their own PIN in My pages. {dialog.note}</p>
      </Modal>
    );
  }
  if (dialog.kind === "text") {
    return (
      <Modal title={dialog.title} onClose={close} footer={<>
        <Btn onClick={() => { navigator.clipboard?.writeText(dialog.text); toast.success("Copied"); }}><Copy size={12} /> Copy all</Btn>
        <Btn tone="primary" onClick={close}>Done</Btn>
      </>}>
        <textarea readOnly rows={8} value={dialog.text} className={`${inputCls} font-mono`} />
      </Modal>
    );
  }
  if (dialog.kind === "media") return <MediaDialog dialog={dialog} close={close} />;
  if (dialog.kind === "activity") return <ActivityDialog dialog={dialog} close={close} />;
  return null;
}

const TYPE_LABEL = {
  open: "Opened the page", gate_open: "Opened the surprise", letter_open: "Opened the letter", media_view: "Looked at photos/videos", balloon_pop: "Popped balloons",
  candles_blown: "Blew out the candles", cake_cut: "Cut the cake", gift_open: "Opened a gift", chocolate_bite: "Ate chocolate", comfort: "Comforted the mascot",
  heart_mended: "Mended the heart", promise_flip: "Opened a promise", gesture: "Sent a gesture", box_open: "Opened the ring box", time_spent: "Time on page",
};
const label = (t) => TYPE_LABEL[t] || t.replace(/_/g, " ");
const ANSWER = { yes: "Said YES", no: "Said no", later: "Needs more time" };

function ActivityDialog({ dialog, close }) {
  const { http, run, pageId } = dialog;
  const [d, setD] = useState(null);
  useEffect(() => { run(() => http.get(`/pages/${pageId}/activity`)).then((x) => x && setD(x)); }, [http, run, pageId]);
  const sm = d?.summary;
  const dur = (n) => (n >= 60 ? `${Math.floor(n / 60)}m ${n % 60}s` : `${n}s`);
  return (
    <Modal title={`Activity: ${d?.page?.title || ""}`} onClose={close} wide footer={<Btn tone="primary" onClick={close}>Close</Btn>}>
      {!d ? <div className="py-8 text-center text-slate-400"><Loader2 className="mx-auto animate-spin" /></div> : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[["Opens", sm.opens], ["Visitors", sm.uniqueVisitors], ["Time on page", sm.totalSeconds ? dur(sm.totalSeconds) : "–"], ["Messages", d.replies.length]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-slate-50 py-2 text-center"><div className="text-lg font-extrabold text-slate-800">{v}</div><div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{l}</div></div>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {sm.firstOpenedAt ? `First opened ${when(sm.firstOpenedAt)} · last opened ${when(sm.lastOpenedAt)}` : "Not opened yet."}
            {Object.keys(sm.devices || {}).length > 0 && ` · ${Object.entries(sm.devices).map(([k, v]) => `${k} ${v}`).join(", ")}`}
          </p>
          {d.answer?.value && <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">Answer: {ANSWER[d.answer.value] || d.answer.value}{d.answer.final ? " (final)" : ""}</p>}
          {d.replies.length > 0 && (
            <div><h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Replies</h4>
              <ul className="space-y-1.5">{d.replies.map((r, i) => <li key={r.id || i} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{r.text || r.message}<span className="ml-2 text-[11px] text-slate-400">{when(r.at || r.createdAt)}</span></li>)}</ul></div>
          )}
          <div><h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">What they did</h4>
            {Object.keys(d.byType).length === 0 ? <p className="text-sm text-slate-400">Nothing yet.</p> : (
              <ul className="grid gap-1.5 sm:grid-cols-2">{Object.entries(d.byType).map(([t, v]) => <li key={t} className="flex justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-sm"><span className="text-slate-700">{label(t)}</span><b className="text-slate-900">{v.total || v.count}×</b></li>)}</ul>
            )}</div>
          <div><h4 className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-400">Latest events</h4>
            <ul className="max-h-48 divide-y divide-slate-100 overflow-auto rounded-xl border border-slate-100">{d.timeline.slice(0, 40).map((e, i) => <li key={i} className="flex justify-between gap-2 px-3 py-1.5 text-xs"><span className="text-slate-700">{label(e.type)}</span><span className="shrink-0 text-slate-400">{when(e.at)}</span></li>)}</ul></div>
        </div>
      )}
    </Modal>
  );
}

function PinRow({ pin }) {
  const [show, setShow] = useState(false);
  return (
    <div className="mt-2 flex min-w-0 items-center gap-1.5 rounded-xl bg-amber-50/70 px-2.5 py-1.5">
      <KeyRound size={13} className="shrink-0 text-amber-500" />
      <span className="text-xs font-semibold text-amber-800">PIN</span>
      <span className="min-w-0 flex-1 truncate font-mono text-sm font-bold tracking-[0.2em] text-slate-800">{pin ? (show ? pin : "••••••") : "not viewable"}</span>
      {pin && <>
        <button type="button" aria-label={show ? "Hide PIN" : "Show PIN"} onClick={() => setShow((v) => !v)} className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-amber-600 hover:bg-white">{show ? <EyeOff size={13} /> : <Eye size={13} />}</button>
        <button type="button" aria-label="Copy PIN" onClick={() => { navigator.clipboard?.writeText(pin); toast.success("PIN copied"); }} className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-amber-600 hover:bg-white"><Copy size={12} /></button>
      </>}
    </div>
  );
}

function MediaDialog({ dialog, close }) {
  const { http, run, pageId, onChange } = dialog;
  const [page, setPage] = useState(null);
  const load = useCallback(async () => {
    const d = await run(() => http.get(`/pages/${pageId}`));
    if (d) setPage(d);
  }, [http, run, pageId]);
  useEffect(() => { load(); }, [load]);

  const remove = (m) => setTimeout(() => dialog.confirm({
    title: "Remove this file?", text: "It is deleted from storage permanently.", label: "Remove",
    onSubmit: async () => { const d = await run(() => http.delete(`/pages/${pageId}/media/${m.id}`), "File removed"); if (d && d !== true) { setPage(d); onChange?.(); } },
  }), 0);

  return (
    <Modal title={`Media: ${page?.title || ""}`} onClose={close} wide footer={<Btn tone="primary" onClick={close}>Close</Btn>}>
      {!page ? <div className="py-8 text-center text-slate-400"><Loader2 className="mx-auto animate-spin" /></div> : page.media.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No photos or videos uploaded.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {page.media.map((m) => (
            <div key={m.id} className="overflow-hidden rounded-xl border border-slate-200">
              {m.kind === "photo" ? <img src={m.url} alt="" loading="lazy" className="h-32 w-full object-cover" /> : <video src={m.url} controls preload="metadata" className="h-32 w-full bg-black object-cover" />}
              <div className="flex items-center justify-between gap-2 p-2 text-xs">
                {m.isMain ? <Chip className={STATUS.active}>main {m.kind}</Chip> : <span className="text-slate-500">{m.kind}</span>}
                <Btn tone="danger" onClick={() => remove(m)}><Trash2 size={12} /></Btn>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* ---------------------------------------------------- overview */

function Overview({ http, run }) {
  const [s, setS] = useState(null);
  useEffect(() => { run(() => http.get("/stats")).then((d) => d && setS(d)); }, [http, run]);
  if (!s) return <Loader2 className="animate-spin text-slate-400" />;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Kpi icon={Heart} tone="rose" label="Pages created" value={s.pages} />
      <Kpi icon={Radio} tone="emerald" label="Live pages" value={s.activePages} />
      <Kpi icon={Eye} tone="sky" label="Total page views" value={s.totalViews} />
      <Kpi icon={Gift} tone="amber" label="Unused credits" value={s.unusedCredits} />
      <Kpi icon={ShoppingBag} tone="indigo" label="Paid orders" value={s.paidOrders} />
      <Kpi icon={CircleDollarSign} tone="emerald" label="Revenue" value={inr(s.revenue)} />
      <Kpi icon={Ticket} tone="rose" label="Codes redeemed" value={s.codesRedeemed} />
      <Kpi icon={HardDrive} tone="sky" label="Media storage" value={bytes(s.storageBytes)} />
    </div>
  );
}

/* ---------------------------------------------------- pages */

function Pages({ http, run, setDialog }) {
  const [f, setF] = useState({ q: "", status: "", visibility: "", expiresWithin: "", expiresFrom: "", expiresTo: "", sort: "", page: 1 });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const d = await run(() => http.get("/pages", { params: { ...Object.fromEntries(Object.entries(f).filter(([, v]) => v !== "")), limit: 25 } }));
    if (d) setData(d);
    setLoading(false);
  }, [http, run, f]);
  useEffect(() => { const t = setTimeout(load, f.q ? 300 : 0); return () => clearTimeout(t); }, [load, f.q]);

  const patchRow = (p) => setData((d) => d && { ...d, items: d.items.map((x) => (x.id === p.id ? { ...x, ...p } : x)) });
  const post = async (p, path, body, msg) => { const d = await run(() => http.post(`/pages/${p.id}/${path}`, body), msg); if (d && d !== true) patchRow(d.page || d); return d; };
  const confirm = (cfg) => setDialog({ kind: "confirm", ...cfg });

  const setPin = (p) => setDialog({
    kind: "form", title: `Set PIN: ${p.title}`, label: "Set PIN",
    intro: "Leave empty to generate a random 6-digit PIN. A public page becomes private. Everyone who had unlocked it is signed out.",
    fields: [{ name: "pin", label: "PIN (optional)", placeholder: "e.g. 482913", inputMode: "numeric", maxLength: 6 }],
    onSubmit: async (v) => {
      const d = await post(p, "pin", v.pin ? { pin: v.pin } : {});
      if (!d || d === true) return false;
      setDialog({ kind: "pin", pin: d.pin });
      return false;
    },
  });

  const extend = (p) => setDialog({
    kind: "form", title: `Give more time: ${p.title}`, label: "Update",
    intro: `This page ends on ${when(p.expiresAt)}. Add days to that day, or set the last day. (The default lifetime for new pages is in Settings.)`,
    fields: [
      { name: "extendDays", label: "Add this many days", type: "number", min: 1, max: 3650, value: 30 },
      { name: "endsOn", label: "...or set the last day instead (overrides the days)", type: "date" },
    ],
    onSubmit: async (v) => {
      const body = v.endsOn ? { endsOn: v.endsOn } : { extendDays: Number(v.extendDays) };
      const d = await run(() => http.post(`/pages/${p.id}/expiry`, body), "Time updated");
      if (!d || d === true) return false;
      patchRow(d);
      return undefined;
    },
  });

  const EMOJI = { birthday: "🎂", sorry: "🧸", proposal: "💍", anniversary: "🥂", thanks: "🍂" };
  const menuFor = (p) => [
    { label: "Open the page", icon: <ExternalLink size={14} />, onClick: () => window.open(p.url, "_blank", "noopener,noreferrer") },
    { label: "Copy link", icon: <Copy size={14} />, onClick: () => { navigator.clipboard?.writeText(p.url); toast.success("Link copied"); } },
    { label: "Activity", icon: <Activity size={14} />, divider: true, onClick: () => setDialog({ kind: "activity", http, run, pageId: p.id }) },
    { label: "Photos and videos", icon: <ImageIcon size={14} />, onClick: () => setDialog({ kind: "media", http, run, pageId: p.id, confirm, onChange: load }) },
    { label: "Give more time", icon: <CalendarClock size={14} />, onClick: () => extend(p) },
    { label: "Set a PIN", icon: <KeyRound size={14} />, onClick: () => setPin(p) },
    { label: "Make public", icon: <Unlock size={14} />, hidden: p.visibility !== "private", onClick: () => post(p, "visibility", { visibility: "public" }, "Page is now public") },
    { label: "Deactivate link", icon: <Ban size={14} />, hidden: p.status !== "active", divider: true, onClick: () => post(p, "close", {}, "Link deactivated") },
    { label: "Reactivate link", icon: <Radio size={14} />, hidden: p.status !== "closed", divider: true, onClick: () => post(p, "reopen", {}, "Link reactivated") },
    { label: "Create a new link", icon: <Link2 size={14} />, hidden: p.status === "blocked", onClick: () => confirm({ title: "Create a new link?", text: "The current link stops working immediately. The page becomes active under a new link.", label: "New link", tone: "primary", onSubmit: () => post(p, "regenerate-link", {}, "New link created") }) },
    { label: p.status === "blocked" ? "Unblock page" : "Block page", icon: <Ban size={14} />, tone: p.status === "blocked" ? undefined : "danger", onClick: () => post(p, "block", { blocked: p.status !== "blocked" }, p.status === "blocked" ? "Unblocked (left closed)" : "Page blocked") },
    { label: "Delete page", icon: <Trash2 size={14} />, tone: "danger", divider: true, onClick: () => confirm({ title: "Delete page?", text: `"${p.title}" and all its photos and videos will be permanently deleted.`, label: "Delete", onSubmit: async () => { const d = await run(() => http.delete(`/pages/${p.id}`), "Page deleted"); if (d) load(); } }) },
  ];

  const PageCard = ({ p }) => {
    const life = p.expiresAt ? Math.min(100, Math.max(0, ((Date.now() - new Date(p.createdAt).getTime()) / (new Date(p.expiresAt).getTime() - new Date(p.createdAt).getTime())) * 100)) : 0;
    const urgent = p.daysLeft != null && p.daysLeft <= 3;
    return (
      <article className={`flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${p.status === "blocked" ? "border-rose-200" : p.status === "closed" ? "border-amber-200" : "border-slate-200"}`}>
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-pink-50 to-orange-50 text-2xl ring-1 ring-rose-100" aria-hidden>{EMOJI[p.theme] || "💌"}</span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[15px] font-bold text-slate-900">{p.title}</h3>
            <p className="truncate text-xs text-slate-500">{p.occasion} · for {p.recipientName}</p>
          </div>
          <ActionMenu items={menuFor(p)} label={`Actions for ${p.title}`} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Chip className={STATUS[p.status]}>{p.status}</Chip>
          {p.visibility === "private" ? <Chip><Lock size={11} /> private</Chip> : <Chip>public</Chip>}
          {p.shareEmail && <Chip className={p.emailStatus === "sent" ? "bg-sky-50 text-sky-700 ring-sky-200" : STATUS.failed}>✉ {p.emailStatus || "email"}</Chip>}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[["👁", p.viewCount, "views"], ["🖼️", p.photoCount, "photos"], ["🎬", p.videoCount, "videos"]].map(([e, n, l]) => (
            <div key={l} className="rounded-xl bg-slate-50 py-2"><div className="text-base font-extrabold text-slate-800">{n}</div><div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400"><span aria-hidden>{e}</span> {l}</div></div>
          ))}
        </div>

        <div className="mt-3"><Person name={p.owner?.name} email={p.owner?.email} phone={p.owner?.phone} /></div>
        {p.visibility === "private" && <PinRow pin={p.pin} />}

        <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-indigo-50/60 px-2.5 py-1.5">
          <Link2 size={13} className="shrink-0 text-indigo-400" />
          <a href={p.url} target="_blank" rel="noopener noreferrer" className="min-w-0 flex-1 truncate text-xs font-medium text-indigo-700 hover:underline">{p.url.replace(/^https?:\/\//, "")}</a>
          <button type="button" aria-label="Copy link" onClick={() => { navigator.clipboard?.writeText(p.url); toast.success("Link copied"); }} className="grid h-6 w-6 place-items-center rounded-md text-indigo-500 hover:bg-white"><Copy size={12} /></button>
        </div>

        <div className="mt-auto pt-3">
          {p.expiresAt && (
            <div>
              <div className="mb-1 flex items-center justify-between text-[11px] font-semibold"><span className={urgent ? "text-rose-600" : "text-slate-500"}>{p.daysLeft <= 0 ? "Ends today" : `${p.daysLeft} day${p.daysLeft === 1 ? "" : "s"} left`}</span><span className="text-slate-400">ends {when(p.expiresAt)}</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="Time used" aria-valuenow={Math.round(life)} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${urgent ? "bg-rose-500" : p.daysLeft <= 7 ? "bg-amber-400" : "bg-emerald-400"}`} style={{ width: `${life}%` }} /></div>
            </div>
          )}
          <p className="mt-2 text-[11px] text-slate-400">Created {when(p.createdAt)}{p.shareEmail ? ` · emailed to ${p.shareEmail}` : ""}</p>
        </div>
      </article>
    );
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input className={`${inputCls} pl-8`} placeholder="Search title, recipient, owner name/email, or link code…" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value, page: 1 })} />
        </div>
        <select className={`${inputCls} !w-auto`} value={f.status} onChange={(e) => setF({ ...f, status: e.target.value, page: 1 })}>
          <option value="">All statuses</option><option value="active">Active</option><option value="closed">Closed</option><option value="blocked">Blocked</option>
        </select>
        <select className={`${inputCls} !w-auto`} value={f.visibility} onChange={(e) => setF({ ...f, visibility: e.target.value, page: 1 })}>
          <option value="">Public + private</option><option value="public">Public</option><option value="private">Private</option>
        </select>
        <Btn onClick={load}><RefreshCw size={12} className={loading ? "animate-spin" : ""} /> Refresh</Btn>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white/70 p-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600"><CalendarClock size={14} /> Ends</span>
        <select className={`${inputCls} !w-auto`} value={f.expiresWithin} onChange={(e) => setF({ ...f, expiresWithin: e.target.value, expiresFrom: "", expiresTo: "", page: 1 })} aria-label="Ending soon">
          <option value="">Any time</option><option value="1">Within 1 day</option><option value="3">Within 3 days</option><option value="7">Within 7 days</option><option value="14">Within 14 days</option><option value="30">Within 30 days</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-slate-500">from <input type="date" className={`${inputCls} !w-auto`} value={f.expiresFrom} onChange={(e) => setF({ ...f, expiresFrom: e.target.value, expiresWithin: "", page: 1 })} /></label>
        <label className="flex items-center gap-1.5 text-xs text-slate-500">to <input type="date" className={`${inputCls} !w-auto`} value={f.expiresTo} onChange={(e) => setF({ ...f, expiresTo: e.target.value, expiresWithin: "", page: 1 })} /></label>
        <select className={`${inputCls} !w-auto`} value={f.sort} onChange={(e) => setF({ ...f, sort: e.target.value, page: 1 })} aria-label="Sort">
          <option value="">Newest first</option><option value="expiry">Ending soonest first</option>
        </select>
        {(f.expiresWithin || f.expiresFrom || f.expiresTo || f.sort) && <Btn onClick={() => setF({ ...f, expiresWithin: "", expiresFrom: "", expiresTo: "", sort: "", page: 1 })}>Clear</Btn>}
        {data?.total != null && <span className="ml-auto text-xs text-slate-500">{data.total} page{data.total === 1 ? "" : "s"}</span>}
      </div>
      {(data?.items || []).length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/70 py-16 text-center text-slate-400"><span className="text-3xl" aria-hidden>🗂️</span><p className="mt-2 text-sm">{loading ? "Loading…" : "No pages match"}</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{data.items.map((p) => <PageCard key={p.id} p={p} />)}</div>
      )}
      <Pager page={data?.page || 1} pages={data?.pages} onPage={(p) => setF({ ...f, page: p })} />
    </div>
  );
}

/* ---------------------------------------------------- codes */

function Codes({ http, run, setDialog }) {
  const [rows, setRows] = useState([]);
  const load = useCallback(async () => { const d = await run(() => http.get("/codes")); if (d) setRows(d); }, [http, run]);
  useEffect(() => { load(); }, [load]);

  const create = () => setDialog({
    kind: "form", title: "Generate access codes", label: "Generate",
    intro: "Anyone who enters a valid code can create one page without paying.",
    fields: [
      { name: "count", label: "How many codes", type: "number", value: 1, min: 1, max: 500 },
      { name: "maxUses", label: "Uses per code", type: "number", value: 1, min: 1 },
      { name: "code", label: "Custom code (optional, only when generating one)", placeholder: "e.g. LOVE2026" },
      { name: "expiresOn", label: "Expires on (optional)", type: "date" },
      { name: "note", label: "Note (optional)" },
    ],
    onSubmit: async (v) => {
      const body = { count: Number(v.count), maxUses: Number(v.maxUses) };
      if (v.code) body.code = v.code;
      if (v.note) body.note = v.note;
      if (v.expiresOn) body.expiresAt = new Date(`${v.expiresOn}T23:59:59`).toISOString();
      const d = await run(() => http.post("/codes", body));
      if (!d || d === true) return false;
      load();
      setDialog({ kind: "text", title: "Codes created", text: d.codes.join("\n") });
      return false;
    },
  });

  return (
    <div>
      <div className="mb-3 flex justify-end"><Btn tone="primary" onClick={create}><Plus size={12} /> Generate codes</Btn></div>
      <Table rows={rows} cols={[
        { h: "Code", v: (c) => (<span className="font-mono font-bold">{c.code} <button className="ml-1 text-slate-400 hover:text-slate-700" aria-label="Copy" onClick={() => { navigator.clipboard?.writeText(c.code); toast.success("Copied"); }}><Copy size={12} className="inline" /></button></span>) },
        { h: "Used", v: (c) => `${c.usedCount} / ${c.maxUses}` },
        { h: "Expires", v: (c) => (c.expiresAt ? when(c.expiresAt) : "never") },
        { h: "Note", v: (c) => c.note || "" },
        { h: "Status", v: (c) => (!c.isActive ? <Chip className={STATUS.failed}>disabled</Chip> : c.usedCount >= c.maxUses ? <Chip className={STATUS.closed}>used up</Chip> : <Chip className={STATUS.active}>active</Chip>) },
        { h: "", v: (c) => (
          <div className="flex gap-1.5">
            <Btn onClick={async () => { if (await run(() => http.patch(`/codes/${c.id}`, { isActive: !c.isActive }))) load(); }}>{c.isActive ? "Disable" : "Enable"}</Btn>
            <Btn tone="danger" onClick={() => setDialog({ kind: "confirm", title: "Delete code?", text: c.code, label: "Delete", onSubmit: async () => { if (await run(() => http.delete(`/codes/${c.id}`))) load(); } })}><Trash2 size={12} /></Btn>
          </div>) },
      ]} />
    </div>
  );
}

/* ---------------------------------------------------- gumroad (payments from outside India) */

function Gumroad({ http, run, setDialog }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [conn, setConn] = useState(null); // { ok, reason, account }
  const load = useCallback(async () => {
    const [p, l, c] = await Promise.all([run(() => http.get("/gumroad/products")), run(() => http.get("/gumroad/sales")), run(() => http.get("/gumroad/status"))]);
    if (c) setConn(c);
    if (p) setProducts(p);
    if (l) setSales(l);
  }, [http, run]);
  useEffect(() => { load(); }, [load]);

  const shownId = products.find((p) => p.isActive)?.id; // the payment page shows the first active product
  const fields = (p = {}) => [
    { name: "name", label: "Name buyers see", value: p.name || "", placeholder: "e.g. 1 page" },
    { name: "productId", label: "Gumroad product id", value: p.productId || "", placeholder: "the product's id from Gumroad" },
    { name: "credits", label: "Page credits one order gives", type: "number", value: p.credits ?? 1, min: 1, max: 1000 },
    { name: "priceLabel", label: "Price shown (display only)", value: p.priceLabel || "", placeholder: "e.g. $3" },
    { name: "url", label: "Gumroad product link (https://…)", value: p.url || "", placeholder: "https://yourname.gumroad.com/l/memories" },
  ];
  const body = (v) => ({ name: v.name.trim(), productId: v.productId.trim(), credits: Number(v.credits), priceLabel: (v.priceLabel || "").trim(), url: (v.url || "").trim() });
  const add = () => setDialog({ kind: "form", title: "Add a Gumroad product", label: "Add", intro: "An order paid for this product is worth the credits below, once.", fields: fields(),
    onSubmit: async (v) => { if (await run(() => http.post("/gumroad/products", body(v)), "Product added")) { load(); return true; } return false; } });
  const edit = (p) => setDialog({ kind: "form", title: "Edit product", label: "Save", fields: fields(p),
    onSubmit: async (v) => { if (await run(() => http.patch(`/gumroad/products/${p.id}`, body(v)), "Saved")) { load(); return true; } return false; } });

  return (
    <div className="space-y-6">
      {conn && (
        <div role="status" className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border p-3 text-sm ${conn.ok ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}>
          <span>
            {conn.ok && <>Connected to Gumroad{conn.account ? <> as <b>{conn.account}</b></> : null}. Buyers can redeem.</>}
            {!conn.ok && conn.reason === "missing" && <>No <b>GUMROAD_ACCESS_TOKEN</b> in the server .env. Buyers can&apos;t redeem until you add it and restart the backend.</>}
            {!conn.ok && conn.reason === "rejected" && <>Gumroad <b>rejected the access token</b>. Generate a new one (Gumroad Settings, Advanced, Applications), put it in the server .env as GUMROAD_ACCESS_TOKEN and restart the backend.</>}
            {!conn.ok && conn.reason === "unreachable" && <>Couldn&apos;t reach Gumroad just now. Try again in a minute.</>}
          </span>
          <Btn onClick={load}><RefreshCw size={12} /> Check again</Btn>
        </div>
      )}
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
        <b>International payments use Gumroad.</b> Buyers outside India pay on Gumroad in any currency, then redeem the Order ID on the payment page. The payment page shows only the product marked <b>Shown on payment page</b>. Use <b>Show on payment page</b> to change which one it is. Every product you add and keep on can be redeemed. Orders for any other product in your Gumroad account are refused.
      </div>
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">Products you sell on Gumroad. Buyers pay there, then enter the Order ID from their receipt and the email they paid with on the pay page (needs GUMROAD_ACCESS_TOKEN in the server .env). Each purchase works once. With no active product the option is hidden.</p>
          <Btn tone="primary" onClick={add}><Plus size={12} /> Add product</Btn>
        </div>
        <Table rows={products} cols={[
          { h: "Name", v: (p) => <b>{p.name}</b> },
          { h: "Gumroad product id", v: (p) => <span className="font-mono text-xs">{p.productId}</span> },
          { h: "Credits per order", v: (p) => p.credits },
          { h: "Price shown", v: (p) => p.priceLabel || "-" },
          { h: "Link", v: (p) => (p.url ? <a className="text-rose-600 hover:underline" href={p.url} target="_blank" rel="noreferrer">open <ExternalLink size={11} className="inline" /></a> : <span className="text-amber-600">none</span>) },
          { h: "Status", v: (p) => (
            <span className="flex flex-wrap gap-1">
              <Chip className={p.isActive ? STATUS.active : STATUS.closed}>{p.isActive ? "on" : "off"}</Chip>
              {p.id === shownId && <Chip className="bg-sky-100 text-sky-700">shown on payment page</Chip>}
            </span>) },
          { h: "", v: (p) => (
            <div className="flex flex-wrap gap-1.5">
              <Btn onClick={() => edit(p)}>Edit</Btn>
              {p.isActive && p.id !== shownId && <Btn onClick={async () => { if (await run(() => http.post(`/gumroad/products/${p.id}/primary`), "Now shown on the payment page")) load(); }}>Show on payment page</Btn>}
              <Btn onClick={async () => { if (await run(() => http.patch(`/gumroad/products/${p.id}`, { isActive: !p.isActive }))) load(); }}>{p.isActive ? "Turn off" : "Turn on"}</Btn>
              <Btn tone="danger" onClick={() => setDialog({ kind: "confirm", title: "Delete product?", text: `${p.name}. Orders already redeemed stay used. Orders not yet redeemed can't be redeemed any more.`, label: "Delete", onSubmit: async () => { if (await run(() => http.delete(`/gumroad/products/${p.id}`))) load(); } })}><Trash2 size={12} /></Btn>
            </div>) },
        ]} />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-bold text-slate-700">Redeemed orders</h3>
        <Table rows={sales} cols={[
          { h: "When", v: (r) => <span className="whitespace-nowrap text-xs">{when(r.when)}</span> },
          { h: "Account", v: (r) => (r.user ? <Person name={r.user.name} email={r.user.email} /> : <span className="text-slate-400">deleted user</span>) },
          { h: "Product", v: (r) => r.product },
          { h: "Credits", v: (r) => r.credits },
          { h: "Gumroad buyer email", v: (r) => <span className="text-xs">{r.buyerEmail || "-"}</span> },
          { h: "Sale id", v: (r) => <span className="font-mono text-xs">{r.saleId}</span> },
        ]} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------- orders */

function Orders({ http, run, setDialog }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const load = useCallback(async () => { const d = await run(() => http.get("/orders", { params: { page, limit: 25 } })); if (d) setData(d); }, [http, run, page]);
  useEffect(() => { load(); }, [load]);
  return (
    <div>
      <Table rows={data?.items || []} cols={[
        { h: "When", v: (o) => <span className="whitespace-nowrap text-xs">{when(o.createdAt)}</span> },
        { h: "User", v: (o) => (o.user ? <Person name={o.user.name} email={o.user.email} phone={o.user.phone} /> : "-") },
        { h: "Amount", v: (o) => inr(o.amount) },
        { h: "Status", v: (o) => <Chip className={STATUS[o.status]}>{o.status}</Chip> },
        { h: "Gateway", v: (o) => <Chip>{o.gateway}</Chip> },
        { h: "Gateway order", v: (o) => <span className="font-mono text-xs">{o.gatewayOrderId}</span> },
        { h: "Payment id", v: (o) => <span className="font-mono text-xs">{o.gatewayPaymentId || (o.failureReason ? <span className="text-rose-500">{o.failureReason}</span> : "-")}</span> },
        { h: "Paid at", v: (o) => <span className="text-xs">{when(o.paidAt)}</span> },
        { h: "", v: (o) => (
          <Btn tone="danger" title="Delete this order" onClick={() => setDialog({ kind: "confirm", title: "Delete this order?", text: o.status === "paid" ? `This paid ${o.gateway} order (${inr(o.amount)}, ${o.gatewayOrderId}) will be removed from the records. The user keeps the credit it gave.` : `${o.status} ${o.gateway} order ${o.gatewayOrderId} will be removed.`, label: "Delete order", onSubmit: async () => { if (await run(() => http.delete(`/orders/${o.id}`), "Order deleted")) load(); } })}><Trash2 size={12} /></Btn>) },
      ]} />
      <Pager page={data?.page || 1} pages={data?.pages} onPage={setPage} />
    </div>
  );
}

/* ---------------------------------------------------- occasions */

function Occasions({ http, run, setDialog }) {
  const [rows, setRows] = useState([]);
  const load = useCallback(async () => { const d = await run(() => http.get("/occasions")); if (d) setRows(d); }, [http, run]);
  useEffect(() => { load(); }, [load]);

  const edit = (o) => setDialog({
    kind: "form", title: o ? "Edit occasion" : "New occasion", label: "Save",
    intro: "The theme picks which page design is shown (for example birthday, proposal, sorry).",
    fields: [{ name: "name", label: "Name", value: o?.name || "" }, { name: "theme", label: "Theme", value: o?.theme || "", placeholder: "birthday" }],
    onSubmit: async (v) => {
      const body = { name: v.name, ...(v.theme ? { theme: v.theme } : {}) };
      const d = await run(() => (o ? http.patch(`/occasions/${o.id}`, body) : http.post("/occasions", body)), "Saved");
      if (d) load(); else return false;
    },
  });

  return (
    <div>
      <div className="mb-3 flex justify-end"><Btn tone="primary" onClick={() => edit(null)}><Plus size={12} /> Add occasion</Btn></div>
      <Table rows={rows} cols={[
        { h: "Occasion", v: (o) => <span className="font-semibold">{o.name}</span> },
        { h: "Theme", v: (o) => <span className="font-mono text-xs">{o.theme}</span> },
        { h: "Status", v: (o) => <Chip className={o.isActive ? STATUS.active : STATUS.closed}>{o.isActive ? "visible" : "hidden"}</Chip> },
        { h: "", v: (o) => (
          <div className="flex gap-1.5">
            <Btn onClick={() => edit(o)}>Edit</Btn>
            <Btn onClick={async () => { if (await run(() => http.patch(`/occasions/${o.id}`, { isActive: !o.isActive }))) load(); }}>{o.isActive ? "Hide" : "Show"}</Btn>
            <Btn tone="danger" onClick={() => setDialog({ kind: "confirm", title: "Delete occasion?", text: `"${o.name}" will be removed. If pages already use it, deletion is refused and you can hide it instead.`, label: "Delete", onSubmit: async () => { if (await run(() => http.delete(`/occasions/${o.id}`), "Occasion deleted")) load(); } })}><Trash2 size={12} /></Btn>
          </div>) },
      ]} />
    </div>
  );
}

/* ---------------------------------------------------- settings */

function Settings({ http, run }) {
  const [s, setS] = useState(null);
  const [gw, setGw] = useState(null); // { items:[{id,label,configured,enabled}], on:Set, def }
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    run(() => http.get("/settings")).then((d) => d && setS(d));
    run(() => http.get("/gateways")).then((d) => d && setGw({ items: d.items, on: new Set(d.items.filter((g) => g.enabled).map((g) => g.id)), def: d.defaultGateway }));
  }, [http, run]);
  if (!s || !gw) return <Loader2 className="animate-spin text-slate-400" />;

  const toggleGw = (id) => setGw((g) => {
    const on = new Set(g.on);
    on.has(id) ? on.delete(id) : on.add(id);
    return { ...g, on, def: on.has(g.def) ? g.def : [...on][0] || "" };
  });

  const num = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = {
      price: Number(s.price), maxPhotos: Number(s.maxPhotos), maxVideos: Number(s.maxVideos),
      maxPhotoMb: Number(s.maxPhotoMb), maxVideoMb: Number(s.maxVideoMb), maxAudioMb: Number(s.maxAudioMb ?? 10), maxMessageChars: Number(s.maxMessageChars), enabled: Boolean(s.enabled),
      pageLifetimeDays: Number(s.pageLifetimeDays), emailEnabled: s.emailEnabled !== false, maxEmailsPerUserPerDay: Number(s.maxEmailsPerUserPerDay),
      enabledGateways: [...gw.on], defaultGateway: gw.on.has(gw.def) ? gw.def : [...gw.on][0] || "",
    };
    if (body.price > 0 && body.enabledGateways.length === 0) {
      toast.error("Switch on at least one payment gateway, or set the price to 0.");
      setSaving(false);
      return;
    }
    const d = await run(() => http.put("/settings", body), "Settings saved");
    if (d && d !== true) setS(d);
    setSaving(false);
  };

  return (
    <form onSubmit={save} className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-slate-900">Pricing</h2>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Price per page (₹)" hint="0 makes pages free. Applies to new payments immediately."><input className={inputCls} type="number" min="0" step="1" value={s.price} onChange={num("price")} /></Field>
        <Field label="Page creation"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.enabled} onChange={(e) => setS({ ...s, enabled: e.target.checked })} /> Enabled (untick to pause purchases and new pages)</label></Field>
      </div>
      <h2 className="mb-3 mt-2 text-sm font-bold text-slate-900">Page lifetime and email</h2>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Days a page stays online" hint="Counted from the day it's created, then it is deleted. Saved in the database. Applies to NEW pages; existing pages keep their end date (change one in Pages → Time)."><input className={inputCls} type="number" min="1" max="3650" step="1" value={s.pageLifetimeDays} onChange={num("pageLifetimeDays")} /></Field>
        <Field label="Email a page when it's created"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.emailEnabled !== false} onChange={(e) => setS({ ...s, emailEnabled: e.target.checked })} /> On (untick to hide the option from users)</label></Field>
        <Field label="Emails per user per day" hint="Stops the email option being used to spam. Counts pages created with an email in the last 24 hours."><input className={inputCls} type="number" min="1" max="200" step="1" value={s.maxEmailsPerUserPerDay} onChange={num("maxEmailsPerUserPerDay")} /></Field>
      </div>
      <h2 className="mb-1 mt-2 text-sm font-bold text-slate-900">Payment gateways</h2>
      <p className="mb-3 text-xs text-slate-500">Users can pay with any gateway you switch on. A gateway can only be switched on once its API keys are set on the server. The default one is pre-selected at checkout.</p>
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        {gw.items.filter((g) => g.id !== "mock" || g.configured).map((g) => (
          <div key={g.id} className={`flex items-center gap-3 rounded-xl border p-3 transition ${gw.on.has(g.id) ? "border-pink-300 bg-pink-50/50" : "border-slate-200 bg-white"} ${g.configured ? "" : "opacity-60"}`}>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600"><CreditCard size={17} /></span>
            <label className="min-w-0 flex-1 cursor-pointer">
              <span className="block truncate text-sm font-semibold capitalize text-slate-900">{g.id}</span>
              <span className="block truncate text-[11px] text-slate-500">{g.configured ? g.label : "No API keys on the server"}</span>
            </label>
            {gw.on.has(g.id) && (
              <button type="button" onClick={() => setGw({ ...gw, def: g.id })} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${gw.def === g.id || (!gw.def && [...gw.on][0] === g.id) ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                {gw.def === g.id || (!gw.def && [...gw.on][0] === g.id) ? "Default" : "Make default"}
              </button>
            )}
            <input type="checkbox" aria-label={`Enable ${g.id}`} disabled={!g.configured} checked={gw.on.has(g.id)} onChange={() => toggleGw(g.id)} className="h-4 w-4 accent-pink-500" />
          </div>
        ))}
      </div>
      <h2 className="mb-3 mt-2 text-sm font-bold text-slate-900">Upload limits per page</h2>
      <div className="grid gap-x-4 sm:grid-cols-2">
        <Field label="Max photos"><input className={inputCls} type="number" min="0" max="500" value={s.maxPhotos} onChange={num("maxPhotos")} /></Field>
        <Field label="Max videos"><input className={inputCls} type="number" min="0" max="100" value={s.maxVideos} onChange={num("maxVideos")} /></Field>
        <Field label="Max size per photo (MB)" hint="Up to 25"><input className={inputCls} type="number" min="0.1" max="25" step="0.1" value={s.maxPhotoMb} onChange={num("maxPhotoMb")} /></Field>
        <Field label="Max size per video (MB)" hint="Up to 500"><input className={inputCls} type="number" min="0.1" max="500" step="0.1" value={s.maxVideoMb} onChange={num("maxVideoMb")} /></Field>
        <Field label="Max size of the voice message (MB)" hint="Up to 25. Recording is capped at 2 minutes"><input className={inputCls} type="number" min="0.1" max="25" step="0.1" value={s.maxAudioMb ?? 10} onChange={num("maxAudioMb")} /></Field>
        <Field label="Max message length (characters)"><input className={inputCls} type="number" min="10" max="10000" value={s.maxMessageChars} onChange={num("maxMessageChars")} /></Field>
      </div>
      <Btn type="submit" tone="primary" disabled={saving}>{saving && <Loader2 size={12} className="animate-spin" />} Save settings</Btn>
    </form>
  );
}

/* ---------------------------------------------------- blocked email addresses */

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
    <div className="mt-6 max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-slate-900">Blocked recipient emails</h2><Btn tone="primary" onClick={add}><Plus size={12} /> Add</Btn></div>
      <p className="mb-3 text-xs text-slate-500">Addresses that must never be emailed a page. Add one when a recipient asks to stop.</p>
      {rows.length === 0 ? <p className="text-sm text-slate-400">None yet.</p> : (
        <ul className="divide-y divide-slate-100">
          {rows.map((b) => (
            <li key={b.id} className="flex items-center gap-3 py-2 text-sm"><span className="min-w-0 flex-1"><span className="block truncate font-semibold text-slate-800">{b.email}</span>{b.note && <span className="block truncate text-xs text-slate-500">{b.note}</span>}</span><span className="text-xs text-slate-400">{when(b.createdAt)}</span><Btn tone="danger" onClick={() => setDialog({ kind: "confirm", title: "Allow emails again?", text: `${b.email} will be able to receive pages again.`, label: "Remove", onSubmit: async () => { if (await run(() => http.delete(`/mail-blocks/${b.id}`), "Removed")) load(); } })}><Trash2 size={12} /></Btn></li>
          ))}
        </ul>
      )}
    </div>
  );
}
