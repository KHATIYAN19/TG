import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity, Check, Copy, Eye, ExternalLink, Globe2, KeyRound, Link2, Lock, Mail, MessageCircleHeart, MoreHorizontal, Pencil, Plus, Power, PowerOff, Share2, ShieldAlert, Trash2, X,
} from "lucide-react";

import { errMsg } from "../arena/api";
import { changePin, closePage, deletePage, listPages, regenerateLink, reopenPage, resendEmail, setVisibility } from "./memApi";
import { META } from "./Showcase";
import { Loading } from "./AppShell";
import PinChip from "./PinChip";
import { useLifetimeDays } from "./legal/useLifetime";
import { Loader2 } from "lucide-react";
import { Button, cx } from "./ui";

/* how long a page has left (every page lives 30 days from creation, then it is deleted) */
const lifeChip = (p) => {
  if (p.daysLeft == null) return null;
  const n = p.daysLeft;
  return { text: n <= 0 ? "Expires today" : n === 1 ? "1 day left" : `${n} days left`, cls: n <= 3 ? "bg-rose-100 text-rose-700" : n <= 7 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600" };
};
const maskEmail = (e) => { const [u, d] = String(e || "").split("@"); return d ? `${u.slice(0, 1)}${"•".repeat(Math.max(2, Math.min(5, u.length - 1)))}@${d}` : e; };
const FILTERS = [["", "All pages"], ["3", "Ending in 3 days"], ["7", "Ending in 7 days"], ["14", "Ending in 14 days"], ["30", "Ending in 30 days"]];
const when = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/* a bottom sheet / dialog */
function Sheet({ title, onClose, children, label }) {
  useEffect(() => {
    const key = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("keydown", key); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#3a1530]/50 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={label || title} className="mem-pop-in relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white p-5 pb-7 shadow-2xl sm:rounded-[28px]">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-rose-50 text-[#6b3a5a] hover:bg-rose-100"><X className="h-5 w-5" /></button>
        {title && <h2 className="pr-10 text-lg font-bold text-[#3a1530]">{title}</h2>}
        {children}
      </div>
    </div>
  );
}

function PinReveal({ pin, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(pin); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  return (
    <Sheet title="Your new PIN" onClose={onClose}>
      <p className="mt-1 text-sm text-[#7a5370]">Share it only with the person it&apos;s for. It can&apos;t be shown again, but you can always make a new one.</p>
      <p className="mt-4 rounded-2xl bg-amber-50 py-4 text-center font-mono text-4xl font-bold tracking-[0.3em] text-amber-900 ring-1 ring-amber-200" aria-label={`PIN ${pin.split("").join(" ")}`}>{pin}</p>
      <div className="mt-4 flex gap-2"><Button variant="soft" className="flex-1" onClick={copy}><Copy className="h-4 w-4" aria-hidden /> {copied ? "Copied" : "Copy PIN"}</Button><Button className="flex-1" onClick={onClose}>Done</Button></div>
    </Sheet>
  );
}

function PinForm({ title, intro, cta, busy, onSubmit, onClose }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const go = (e) => { e.preventDefault(); if (pin && !/^\d{6}$/.test(pin)) return setErr("A PIN is exactly 6 digits, or leave it empty and we'll make one."); onSubmit(pin); };
  return (
    <Sheet title={title} onClose={onClose}>
      <p className="mt-1 text-sm text-[#7a5370]">{intro}</p>
      <form onSubmit={go} className="mt-4" noValidate>
        <label htmlFor="mp-pin" className="text-xs font-bold uppercase tracking-wider text-[#a07890]">Your own PIN <span className="font-medium normal-case tracking-normal text-[#c4a8b8]">(optional)</span></label>
        <input id="mp-pin" inputMode="numeric" maxLength={6} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setErr(""); }} placeholder="Leave empty to make one"
          className="mt-1.5 w-full rounded-xl border border-rose-100 px-3.5 py-3 font-mono tracking-[0.3em] text-[#3a1530] outline-none placeholder:font-sans placeholder:tracking-normal focus:border-rose-400 focus:ring-4 focus:ring-rose-100" />
        {err && <p role="alert" className="mt-2 text-sm text-rose-600">{err}</p>}
        <Button type="submit" size="lg" className="mt-4 w-full" loading={busy}><Lock className="h-4 w-4" aria-hidden /> {cta}</Button>
      </form>
    </Sheet>
  );
}

function Confirm({ title, text, cta, danger, busy, onYes, onClose }) {
  return (
    <Sheet title={title} onClose={onClose}>
      <p className="mt-2 text-sm leading-relaxed text-[#7a5370]">{text}</p>
      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button className={cx("flex-1", danger && "!bg-none !bg-rose-600 !shadow-rose-200")} onClick={onYes} loading={busy}>{cta}</Button>
      </div>
    </Sheet>
  );
}

const Row = ({ icon: Icon, label, hint, onClick, danger, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled} className={cx("flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-rose-50 disabled:opacity-50", danger && "hover:bg-rose-50")}>
    <span className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", danger ? "bg-rose-100 text-rose-600" : "bg-rose-50 text-rose-500")}><Icon className="h-5 w-5" aria-hidden /></span>
    <span className="min-w-0"><span className={cx("block text-sm font-semibold", danger ? "text-rose-600" : "text-[#3a1530]")}>{label}</span>{hint && <span className="block text-xs text-[#8a6a80]">{hint}</span>}</span>
  </button>
);

/* The pages this person made, and everything they can do with each: link, preview, edit, disable, public or private, PIN, new link, delete. */
export default function MyPages({ credits }) {
  const navigate = useNavigate();
  const lifetime = useLifetimeDays();
  const [pages, setPages] = useState(null);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState(null); // page id whose "manage" sheet is open
  const [dialog, setDialog] = useState(null); // { kind, page }
  const [pinShown, setPinShown] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState("");

  const [within, setWithin] = useState(""); // filter: only pages ending within N days
  const [sort, setSort] = useState(""); // "" = newest first, "expiry" = ending soonest first
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    let live = true;
    setRefreshing(true);
    listPages({ ...(within ? { expiresWithin: within } : {}), ...(sort ? { sort } : {}) }).then((p) => { if (live) { setPages(p); setError(""); } }).catch((e) => live && setError(errMsg(e))).finally(() => live && setRefreshing(false));
    return () => { live = false; };
  }, [within, sort]);
  const replace = useCallback((p) => setPages((list) => list.map((x) => (x.id === p.id ? { ...x, ...p } : x))), []);
  const flash = (m) => { setNote(m); setTimeout(() => setNote(""), 3200); };

  const run = async (fn, { done }) => {
    setBusy(true); setError("");
    try { await fn(); setDialog(null); setSheet(null); if (done) flash(done); } catch (e) { setError(errMsg(e)); setDialog(null); } finally { setBusy(false); }
  };

  const copy = async (p) => {
    try { await navigator.clipboard.writeText(p.url); setCopied(p.id); setTimeout(() => setCopied(""), 1800); } catch { flash("Couldn't copy. Select the link and copy it."); }
  };
  const share = async (p) => {
    if (navigator.share) { try { await navigator.share({ title: p.title, url: p.url }); return; } catch { /* cancelled */ } }
    copy(p);
  };

  if (!pages) return error ? <p role="alert" className="py-16 text-center text-rose-600">{error}</p> : <Loading label="Loading your pages…" />;
  const open = pages.find((p) => p.id === sheet);
  const d = dialog?.page;

  return (
    <div className="py-6 lg:py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#3a1530] lg:text-3xl">My pages</h1>
          <p className="mt-0.5 text-sm text-[#7a5370]">{pages.length} page{pages.length === 1 ? "" : "s"} · {credits} credit{credits === 1 ? "" : "s"} left</p>
          <p className="mt-1 text-xs text-[#a07890]">Each page stays online for {lifetime} days from the day you create it, then it is deleted.</p>
        </div>
        <Button as={Link} to="/memories/app" size="sm"><Plus className="h-4 w-4" aria-hidden /> New</Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select value={within} onChange={(e) => setWithin(e.target.value)} aria-label="Filter by when pages end" className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm font-medium text-[#3a1530] outline-none focus:border-rose-400">
          {FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort pages" className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-sm font-medium text-[#3a1530] outline-none focus:border-rose-400">
          <option value="">Newest first</option><option value="expiry">Ending soonest first</option>
        </select>
        {(within || sort) && <button type="button" onClick={() => { setWithin(""); setSort(""); }} className="text-sm font-semibold text-rose-600 hover:underline">Clear</button>}
        {refreshing && <Loader2 className="h-4 w-4 animate-spin text-rose-400" aria-label="Updating" />}
      </div>

      {note && <p role="status" className="mem-pop-in mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200"><Check className="h-4 w-4 shrink-0" aria-hidden /> {note}</p>}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}

      {pages.length === 0 ? (
        <div className="mt-8 rounded-[28px] border border-dashed border-rose-200 bg-white/70 p-10 text-center">
          <p className="font-semibold text-[#3a1530]">{within ? "No pages end that soon" : "No pages yet"}</p>
          <p className="mt-1 text-sm text-[#7a5370]">{within ? "Try a longer range, or clear the filter." : "Pick a template and create your first one."}</p>
          {within ? <Button type="button" onClick={() => setWithin("")} className="mt-5">Clear the filter</Button> : <Button as={Link} to="/memories/app" className="mt-5">Choose a template</Button>}
        </div>
      ) : (
        <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((p) => {
            const look = (META[p.theme]?.themes || []).find((x) => x.id === p.style);
            const closed = p.status === "closed";
            const blocked = p.status === "blocked";
            return (
              <li key={p.id} className={cx("flex flex-col rounded-3xl border bg-white p-4 shadow-sm transition hover:shadow-md hover:shadow-rose-100", closed || blocked ? "border-amber-200" : "border-rose-100")}>
                <div className="flex items-start gap-3">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-50 text-2xl" aria-hidden>{META[p.theme]?.emoji || "💌"}</span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-bold text-[#3a1530]">{p.title}</h2>
                    <p className="truncate text-xs text-[#8a6a80]">{p.occasion}{look ? ` · ${look.name}` : ""} · for {p.recipientName}</p>
                  </div>
                  <button type="button" onClick={() => setSheet(p.id)} aria-label={`Manage ${p.title}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[#6b3a5a] hover:bg-rose-50"><MoreHorizontal className="h-5 w-5" /></button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold">
                  <span className={cx("rounded-full px-2.5 py-1", blocked ? "bg-rose-100 text-rose-700" : closed ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700")}>{blocked ? "Blocked by admin" : closed ? "Disabled" : "Live"}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">{p.visibility === "private" ? <Lock className="h-3 w-3" aria-hidden /> : <Globe2 className="h-3 w-3" aria-hidden />}{p.visibility === "private" ? "Private · PIN" : "Public"}</span>
                  {lifeChip(p) && <span title={`Online until ${when(p.expiresAt)}. Then it is deleted.`} className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1", lifeChip(p).cls)}>⏳ {lifeChip(p).text}</span>}
                  {p.shareEmail && <span title={`Emailed to ${p.shareEmail}`} className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-1", p.emailStatus === "sent" ? "bg-sky-50 text-sky-700" : "bg-amber-100 text-amber-800")}><Mail className="h-3 w-3" aria-hidden /> {p.emailStatus === "sent" ? `Emailed to ${maskEmail(p.shareEmail)}` : `Email ${p.emailStatus || "pending"}`}</span>}
                  {p.answer && <span className={cx("rounded-full px-2.5 py-1", p.answer === "yes" ? "bg-rose-100 text-rose-700" : p.answer === "no" ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-800")}>{p.answer === "yes" ? "✔ Said YES" : p.answer === "no" ? "Said no" : "Needs time"}</span>}
                  {p.repliesCount > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700"><MessageCircleHeart className="h-3 w-3" aria-hidden /> {p.repliesCount} repl{p.repliesCount === 1 ? "y" : "ies"}</span>}
                  <span className="inline-flex items-center gap-1 text-[#8a6a80]"><Eye className="h-3 w-3" aria-hidden /> {p.opens ? `Opened ${p.opens}×` : "Not opened yet"}</span>
                  <span className="text-[#a07890]">{p.photoCount || 0} photos · {p.videoCount || 0} videos</span>
                  <span className="ml-auto text-[#a07890]">{when(p.createdAt)}</span>
                </div>

                <div className="mt-3 flex min-w-0 items-center gap-1.5 rounded-2xl bg-[#fff7f3] p-2 pl-3 sm:gap-2">
                  <Link2 className="h-4 w-4 shrink-0 text-rose-400" aria-hidden />
                  <input readOnly value={p.url} aria-label="Page link" onFocus={(e) => e.target.select()} className="min-w-0 flex-1 truncate bg-transparent text-xs text-[#6b3a5a] outline-none" />
                  <button type="button" onClick={() => copy(p)} className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 ring-1 ring-rose-100 hover:bg-rose-50 sm:px-3">{copied === p.id ? <><Check className="h-3.5 w-3.5" aria-hidden /> Copied</> : <><Copy className="h-3.5 w-3.5" aria-hidden /> Copy</>}</button>
                </div>

                {p.visibility === "private" && <PinChip pin={p.pin} onNew={() => { setSheet(null); setDialog({ kind: "pin", page: p }); }} className="mt-2" />}

                <div className="mt-auto grid grid-cols-3 gap-2 pt-3">
                  <Button as={Link} to={`/memories/app/pages/${p.id}/activity`} size="sm"><Activity className="h-4 w-4 shrink-0" aria-hidden /> Activity</Button>
                  <Button as={Link} to={`/memories/app/pages/${p.id}/preview`} variant="soft" size="sm"><Eye className="h-4 w-4 shrink-0" aria-hidden /> Preview</Button>
                  <Button as={Link} to={`/memories/app/pages/${p.id}/edit`} variant="soft" size="sm"><Pencil className="h-4 w-4 shrink-0" aria-hidden /> Edit</Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* manage sheet */}
      {open && !dialog && (
        <Sheet title={open.title} label={`Manage ${open.title}`} onClose={() => setSheet(null)}>
          <p className="text-xs text-[#8a6a80]">{open.occasion} · for {open.recipientName}</p>
          <div className="mt-3 space-y-0.5">
            <Row icon={Share2} label="Share the link" hint="Send it on WhatsApp or anywhere" onClick={() => share(open)} />
            <Row icon={ExternalLink} label="Open the link" hint="See it the way they will" onClick={() => window.open(open.url, "_blank", "noopener,noreferrer")} />
            <Row icon={Activity} label="Responses & activity" hint="Their answer, replies and everything they did" onClick={() => navigate(`/memories/app/pages/${open.id}/activity`)} />
            {open.shareEmail && open.emailStatus !== "blocked" && (
              <Row icon={Mail} label={`Send the email again (${open.emailSendsLeft} left)`} hint={`To ${open.shareEmail}. The address can't be changed`} disabled={open.emailSendsLeft < 1 || open.status === "closed"}
                onClick={() => run(async () => { const r = await resendEmail(open.id); replace({ id: open.id, emailStatus: r.status, emailSendsLeft: r.sendsLeft }); if (r.status !== "sent") throw new Error("The email couldn't be sent. Please try again in a moment."); }, { done: `Email sent to ${open.shareEmail}.` })} />
            )}
            <Row icon={Eye} label="Preview" hint="With your content, right here" onClick={() => navigate(`/memories/app/pages/${open.id}/preview`)} />
            <Row icon={Pencil} label="Edit content & add photos" hint="Names can't be changed" onClick={() => navigate(`/memories/app/pages/${open.id}/edit`)} />
            {open.status !== "blocked" && (
              open.status === "closed"
                ? <Row icon={Power} label="Enable the page" hint="Open the link again" onClick={() => run(async () => replace(await reopenPage(open.id)), { done: "The page is live again." })} />
                : <Row icon={PowerOff} label="Disable the page" hint="Visitors see that it's closed. Enable it any time" onClick={() => setDialog({ kind: "disable", page: open })} />
            )}
            {open.visibility === "public"
              ? <Row icon={Lock} label="Make private with a PIN" hint="They'll need a 6-digit PIN to open it" onClick={() => setDialog({ kind: "private", page: open })} />
              : <>
                  <Row icon={Globe2} label="Make public" hint="Anyone with the link can open it" onClick={() => setDialog({ kind: "public", page: open })} />
                  <Row icon={KeyRound} label="Change PIN / make a new PIN" hint="Locks out everyone who already unlocked it" onClick={() => setDialog({ kind: "pin", page: open })} />
                </>}
            <Row icon={Link2} label="Create a new link" hint="The old link stops working at once" onClick={() => setDialog({ kind: "link", page: open })} />
            <Row icon={Trash2} danger label="Delete the page" hint="Removes it and its photos for good" onClick={() => setDialog({ kind: "delete", page: open })} />
          </div>
        </Sheet>
      )}

      {dialog?.kind === "disable" && <Confirm title="Disable this page?" text={`Anyone who opens the link will see that "${d.title}" has been closed. Nothing is deleted, and you can enable it again whenever you like.`} cta="Disable" busy={busy} onClose={() => setDialog(null)} onYes={() => run(async () => replace(await closePage(d.id)), { done: "The page is disabled." })} />}
      {dialog?.kind === "link" && <Confirm title="Create a new link?" text="You'll get a brand-new link and the old one stops working immediately. Anyone you already sent it to will need the new link." cta="Create new link" busy={busy} onClose={() => setDialog(null)} onYes={() => run(async () => replace(await regenerateLink(d.id)), { done: "New link created. Copy and share it." })} />}
      {dialog?.kind === "public" && <Confirm title="Make this page public?" text="Anyone with the link will be able to open it without a PIN. The old PIN stops mattering." cta="Make public" busy={busy} onClose={() => setDialog(null)} onYes={() => run(async () => replace((await setVisibility(d.id, "public")).page), { done: "The page is public." })} />}
      {dialog?.kind === "delete" && <Confirm danger title="Delete this page for good?" text={`"${d.title}", its link and its photos and videos will be removed. This can't be undone, and the credit you used isn't returned.`} cta="Delete forever" busy={busy} onClose={() => setDialog(null)} onYes={() => run(async () => { await deletePage(d.id); setPages((l) => l.filter((x) => x.id !== d.id)); }, { done: "The page was deleted." })} />}
      {dialog?.kind === "private" && <PinForm title="Make it private" intro="Only people with the 6-digit PIN can open it. Choose your own PIN, or we'll make one." cta="Make private" busy={busy} onClose={() => setDialog(null)} onSubmit={(pin) => run(async () => { const r = await setVisibility(d.id, "private", pin); replace(r.page); setPinShown(r.pin); }, {})} />}
      {dialog?.kind === "pin" && <PinForm title="New PIN" intro="Anyone who unlocked the page before is locked out and needs the new PIN. Choose your own, or we'll make one." cta="Set new PIN" busy={busy} onClose={() => setDialog(null)} onSubmit={(pin) => run(async () => { const r = await changePin(d.id, pin); replace({ id: d.id, pin: r.pin }); setPinShown(r.pin); }, {})} />}
      {pinShown && <PinReveal pin={pinShown} onClose={() => setPinShown(null)} />}

      {pages.some((p) => p.status === "blocked") && <p className="mt-4 flex items-start gap-2 text-xs text-[#8a6a80]"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" aria-hidden /> A page blocked by an admin can&apos;t be changed. Contact support if you think that&apos;s a mistake.</p>}
    </div>
  );
}
