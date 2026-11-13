import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowSquareOut, ChartLineUp, ChatCircleDots, Check, CircleNotch, Copy, DotsThree, Envelope, Eye, GlobeHemisphereWest, Heart, HourglassMedium, Key, LinkSimple, LockKey,
  Package, PencilSimple, Plus, Power, ShareNetwork, ShieldWarning, Trash,
} from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { changePin, closePage, deletePage, listPages, regenerateLink, reopenPage, resendEmail, setVisibility, updatePage } from "./memApi";
import AddonShop from "./AddonShop";
import { META } from "./Showcase";
import { Loading } from "./AppShell";
import PinChip from "./PinChip";
import { shareMessage } from "./SharePanel";
import { useLifetimeDays } from "./legal/useLifetime";
import { Btn, LookArt, OCCASION } from "./landingUi";
import { Banner, PageHead, Sheet } from "./appUi";
import { cx } from "./ui";

/* how long a page has left (every page lives 30 days from creation, then it is deleted) */
const lifeChip = (p) => {
  if (p.daysLeft == null) return null;
  const n = p.daysLeft;
  return { text: n <= 0 ? "Expires today" : n === 1 ? "1 day left" : `${n} days left`, cls: n <= 3 ? "bg-[#ffe4ec] text-[#be123c]" : n <= 7 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600" };
};
const maskEmail = (e) => { const [u, d] = String(e || "").split("@"); return d ? `${u.slice(0, 1)}${"•".repeat(Math.max(2, Math.min(5, u.length - 1)))}@${d}` : e; };
const FILTERS = [["", "All pages"], ["3", "Ending in 3 days"], ["7", "Ending in 7 days"], ["14", "Ending in 14 days"], ["30", "Ending in 30 days"]];
const when = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function PinReveal({ pin, onClose }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(pin); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  return (
    <Sheet size="sm" title="Your new PIN" subtitle="Share it only with the person it is for." icon={<Key size={20} weight="duotone" aria-hidden />} onClose={onClose}
      footer={<div className="grid grid-cols-2 gap-3"><Btn variant="ghost" onClick={copy}><Copy size={16} aria-hidden /> {copied ? "Copied" : "Copy PIN"}</Btn><Btn onClick={onClose}>Done</Btn></div>}>
      <div className="flex justify-center gap-2" aria-label={`PIN ${pin.split("").join(" ")}`}>
        {pin.split("").map((c, i) => <span key={i} style={{ "--i": i }} className="ma-in grid h-14 w-10 place-items-center rounded-xl bg-white font-mono text-2xl font-semibold text-[#2a1023] ring-1 ring-inset ring-[#f8d7e0] sm:w-12">{c}</span>)}
      </div>
      <p className="caption-4 mt-4 text-center text-[#7a5370]">You can see it again on the page card, and you can always make a new one.</p>
    </Sheet>
  );
}

function PinForm({ title, intro, cta, busy, onSubmit, onClose }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const go = (e) => { e.preventDefault(); if (pin && !/^\d{6}$/.test(pin)) return setErr("A PIN is exactly 6 digits, or leave it empty and we will make one."); onSubmit(pin); };
  return (
    <Sheet size="sm" title={title} subtitle={intro} icon={<LockKey size={20} weight="duotone" aria-hidden />} onClose={onClose} locked={busy}>
      <form onSubmit={go} noValidate>
        <label htmlFor="mp-pin" className="title-4 mb-2 block text-[#4a2340]">Your own PIN <span className="caption-5 text-[#a07890]">Optional</span></label>
        <input id="mp-pin" inputMode="numeric" pattern="[0-9]*" autoComplete="off" maxLength={6} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, "")); setErr(""); }} placeholder="Leave empty to make one"
          className={cx("ml-input font-mono", pin && "tracking-[0.3em]", err && "ml-input-bad")} />
        {err && <p role="alert" className="caption-4 mt-2 text-[#be123c]">{err}</p>}
        <Btn type="submit" className="mt-4 w-full" loading={busy}><LockKey size={16} weight="fill" aria-hidden /> {cta}</Btn>
      </form>
    </Sheet>
  );
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Email a page that was made without an address. It is sent once, with or without the PIN, and the address is fixed after that. */
function EmailForm({ page, busy, onSubmit, onClose }) {
  const [to, setTo] = useState("");
  const [withPin, setWithPin] = useState(true);
  const [err, setErr] = useState("");
  const private_ = page.visibility === "private";
  const go = (e) => { e.preventDefault(); if (!EMAIL_RX.test(to.trim())) return setErr("Enter their email address, like name@example.com."); onSubmit(to.trim().toLowerCase(), withPin); };
  return (
    <Sheet size="sm" title="Send it by email" subtitle={<>We email &ldquo;{page.title}&rdquo; to them, in the colours of the look you chose{private_ ? "" : ", with the link"}.</>} icon={<Envelope size={20} weight="duotone" aria-hidden />} onClose={onClose} locked={busy}>
      <form onSubmit={go} noValidate>
        <label htmlFor="mp-email" className="title-4 mb-2 block text-[#4a2340]">Their email address</label>
        <input id="mp-email" type="email" inputMode="email" autoCapitalize="none" autoComplete="off" maxLength={254} value={to} onChange={(e) => { setTo(e.target.value); setErr(""); }} placeholder="name@example.com" className={cx("ml-input", err && "ml-input-bad")} />
        {private_ && (
          <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-3 ring-1 ring-inset ring-[#f8d7e0]">
            <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-rose-600" checked={withPin} onChange={(e) => setWithPin(e.target.checked)} />
            <span className="min-w-0"><span className="body-4 block text-[#2a1023]">Put the PIN in the email too</span><span className="caption-5 block text-[#8a6a80]">{withPin ? "They get the link and the PIN together." : "The email has only the link. Send them the PIN yourself."}</span></span>
          </label>
        )}
        <p className="caption-4 mt-3 flex items-start gap-2 text-amber-800"><LockKey size={14} weight="fill" className="mt-0.5 shrink-0" aria-hidden /> Check the address. It can&apos;t be changed after it is sent. Only use the email of someone who knows you.</p>
        {err && <p role="alert" className="caption-4 mt-2 text-[#be123c]">{err}</p>}
        <Btn type="submit" className="mt-4 w-full" loading={busy}><Envelope size={16} weight="fill" aria-hidden /> Send email</Btn>
      </form>
    </Sheet>
  );
}

function Confirm({ title, text, cta, danger, busy, onYes, onClose }) {
  return (
    <Sheet size="sm" title={title} icon={danger ? <Trash size={20} weight="duotone" aria-hidden /> : <ShieldWarning size={20} weight="duotone" aria-hidden />} onClose={onClose} locked={busy}
      footer={<div className="grid grid-cols-2 gap-3"><Btn variant="ghost" onClick={onClose} disabled={busy}>Cancel</Btn><Btn onClick={onYes} loading={busy}>{cta}</Btn></div>}>
      <p className="body-3 text-[#6b3a5a]">{text}</p>
    </Sheet>
  );
}

const Row = ({ icon: Icon, label, hint, onClick, danger, disabled }) => (
  <button type="button" onClick={onClick} disabled={disabled} className="ma-row">
    <span className={cx("ma-icon grid h-10 w-10 shrink-0 place-items-center rounded-xl", danger ? "bg-[#e11d48] text-white" : "bg-[#ffe4ec] text-[#e11d48]")}><Icon size={20} weight="duotone" aria-hidden /></span>
    <span className="min-w-0"><span className={cx("body-4 block", danger ? "text-[#be123c]" : "text-[#2a1023]")}>{label}</span>{hint && <span className="caption-5 block text-[#8a6a80]">{hint}</span>}</span>
  </button>
);

const Chip = ({ className, children, ...rest }) => <span className={cx("ma-chip caption-4", className)} {...rest}>{children}</span>;

/* The pages this person made, and everything they can do with each: link, preview, edit, disable, public or private, PIN, new link, delete. */
export default function MyPages({ cfg, emailEnabled = true }) {
  const credits = cfg?.credits || 0;
  const navigate = useNavigate();
  const lifetime = useLifetimeDays();
  const [pages, setPages] = useState(null);
  const [error, setError] = useState("");
  const [sheet, setSheet] = useState(null); // page id whose "manage" sheet is open
  const [dialog, setDialog] = useState(null); // { kind, page }
  const [pinShown, setPinShown] = useState(null);
  const [addonFor, setAddonFor] = useState(null); // page id whose "get more room" sheet is open
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
    if (navigator.share) { try { await navigator.share({ title: p.title, text: shareMessage(p.title, p.url, p.visibility === "private" ? p.pin : "") }); return; } catch { /* cancelled */ } }
    copy(p);
  };

  if (!pages) return error ? <div className="py-8"><Banner tone="error"><p>{error}</p></Banner></div> : <Loading label="Loading your pages…" />;
  const open = pages.find((p) => p.id === sheet);
  const d = dialog?.page;

  return (
    <div className="min-w-0 py-6 sm:py-8">
      <PageHead kicker="My pages" title={pages.length ? `${pages.length} page${pages.length === 1 ? "" : "s"} you made` : "Your pages live here"} text={`Each page stays online for ${lifetime} days from the day you create it, then it is deleted.${credits > 0 ? ` You have ${credits} paid page${credits === 1 ? "" : "s"} ready to create.` : ""}`}>
        <Btn to="/memories/app"><Plus size={16} weight="bold" aria-hidden /> New page</Btn>
      </PageHead>

      <div className="ma-in mt-6 flex flex-wrap items-center gap-2" style={{ "--i": 1 }}>
        <select value={within} onChange={(e) => setWithin(e.target.value)} aria-label="Filter by when pages end" className="ml-input !w-auto max-w-full !py-2">
          {FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort pages" className="ml-input !w-auto max-w-full !py-2">
          <option value="">Newest first</option><option value="expiry">Ending soonest first</option>
        </select>
        {(within || sort) && <button type="button" onClick={() => { setWithin(""); setSort(""); }} className="ml-link body-4 rounded-lg px-2 text-[#be123c]">Clear</button>}
        {refreshing && <CircleNotch size={18} weight="bold" className="animate-spin text-[#e11d48]" aria-label="Updating" />}
      </div>

      {note && <Banner tone="ok" className="mt-4"><p>{note}</p></Banner>}
      {error && <Banner tone="error" className="mt-4"><p>{error}</p></Banner>}

      {pages.length === 0 ? (
        <div className="ma-card ma-in mt-8 p-8 text-center sm:p-12">
          <span className="ma-float mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[#ffe4ec] text-[#e11d48]" style={{ "--r": "-8deg" }}><Heart size={32} weight="fill" aria-hidden /></span>
          <p className="heading-6 mt-6 text-[#2a1023]">{within ? "No pages end that soon" : "No pages yet"}</p>
          <p className="body-6 mt-2 text-[#7a5370]">{within ? "Try a longer range, or clear the filter." : "Pick a template and make your first one. It takes a few minutes."}</p>
          {within ? <Btn onClick={() => setWithin("")} className="mt-6">Clear the filter</Btn> : <Btn to="/memories/app" className="mt-6">Choose a template</Btn>}
        </div>
      ) : (
        <ul className="mt-6 grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {pages.map((p, i) => {
            const look = (META[p.theme]?.themes || []).find((x) => x.id === p.style);
            const closed = p.status === "closed";
            const blocked = p.status === "blocked";
            const o = OCCASION[p.theme];
            const life = lifeChip(p);
            return (
              <li key={p.id} style={{ "--i": Math.min(i, 8) }} className="ma-in ma-lift ma-card flex min-w-0 flex-col overflow-hidden">
                {/* the look, as a strip of its colours */}
                <div className="relative p-2">
                  <LookArt swatch={look?.swatch} className="h-20 rounded-2xl" />
                  <span className="ma-icon absolute -bottom-4 left-6 grid h-12 w-12 place-items-center rounded-2xl ring-4 ring-white" style={{ background: o?.tint || "#ffe4ec", color: o?.ink || "#be123c" }}>{o ? <o.Icon size={24} weight="duotone" aria-hidden /> : <Heart size={24} weight="duotone" aria-hidden />}</span>
                  <Chip className={cx("absolute left-4 top-4 font-semibold", blocked ? "bg-[#e11d48] text-white" : closed ? "bg-amber-100 text-amber-800" : "bg-white text-emerald-700")}>
                    {!blocked && !closed && <span className="mem-beat h-2 w-2 rounded-full bg-emerald-500" aria-hidden />}{blocked ? "Blocked by admin" : closed ? "Disabled" : "Live"}
                  </Chip>
                  <button type="button" onClick={() => setSheet(p.id)} aria-label={`Manage ${p.title}`} className="ma-round absolute right-4 top-4 bg-white"><DotsThree size={24} weight="bold" aria-hidden /></button>
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-4 pt-6">
                  <h2 className="heading-6 truncate text-[#2a1023]">{p.title}</h2>
                  <p className="caption-4 truncate text-[#8a6a80]">{p.occasion}{look ? ` · ${look.name}` : ""} · for {p.recipientName}</p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Chip className="bg-[#fff0f4] text-[#be123c]">{p.visibility === "private" ? <LockKey size={12} weight="fill" aria-hidden /> : <GlobeHemisphereWest size={12} weight="fill" aria-hidden />}{p.visibility === "private" ? "Private" : "Public"}</Chip>
                    {life && <Chip title={`Online until ${when(p.expiresAt)}. Then it is deleted.`} className={life.cls}><HourglassMedium size={12} weight="fill" aria-hidden /> {life.text}</Chip>}
                    <Chip className="bg-slate-100 text-slate-600"><Eye size={12} weight="fill" aria-hidden /> {p.opens ? `Opened ${p.opens} time${p.opens === 1 ? "" : "s"}` : "Not opened yet"}</Chip>
                    {p.answer && <Chip className={cx("font-semibold", p.answer === "yes" ? "bg-[#e11d48] text-white" : p.answer === "no" ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-800")}>{p.answer === "yes" ? <><Heart size={12} weight="fill" aria-hidden /> Said yes</> : p.answer === "no" ? "Said no" : "Needs time"}</Chip>}
                    {p.repliesCount > 0 && <Chip className="bg-sky-50 text-sky-700"><ChatCircleDots size={12} weight="fill" aria-hidden /> {p.repliesCount} repl{p.repliesCount === 1 ? "y" : "ies"}</Chip>}
                    {p.shareEmail && <Chip title={`Emailed to ${p.shareEmail}`} className={cx("max-w-full", p.emailStatus === "sent" ? "bg-sky-50 text-sky-700" : "bg-amber-100 text-amber-800")}><Envelope size={12} weight="fill" className="shrink-0" aria-hidden /> <span className="truncate">{p.emailStatus === "sent" ? `Emailed to ${maskEmail(p.shareEmail)}` : `Email ${p.emailStatus || "pending"}`}</span></Chip>}
                    {!p.shareEmail && !blocked && (
                      <button type="button" onClick={() => (emailEnabled && !closed ? setDialog({ kind: "email", page: p }) : flash(!emailEnabled ? "Emailing pages is switched off right now. You can still share the link yourself." : "This page is disabled. Enable it first, then send the email."))}
                        className={cx("ma-chip caption-4 font-semibold ring-1 ring-inset transition-colors duration-300", emailEnabled && !closed ? "bg-white text-[#be123c] ring-[#f8d7e0] hover:bg-[#fff0f4]" : "bg-slate-50 text-slate-400 ring-slate-200")}><Envelope size={12} weight="fill" aria-hidden /> Send by email</button>
                    )}
                  </div>
                  <p className="caption-5 mt-2 text-[#a07890]">{p.photoCount || 0} photo{p.photoCount === 1 ? "" : "s"} · {p.videoCount || 0} video{p.videoCount === 1 ? "" : "s"} · made {when(p.createdAt)}</p>

                  <div className="mt-3 flex min-w-0 items-center gap-2 rounded-2xl bg-[#fff0f4] p-2 pl-3">
                    <LinkSimple size={16} weight="bold" className="shrink-0 text-[#e11d48]" aria-hidden />
                    <input readOnly value={p.url} aria-label="Page link" onFocus={(e) => e.target.select()} className="caption-4 min-w-0 flex-1 truncate bg-transparent text-[#6b3a5a] outline-none" />
                    <button type="button" onClick={() => copy(p)} className="ma-mini caption-3 shrink-0">{copied === p.id ? <><Check size={14} weight="bold" aria-hidden /> Copied</> : <><Copy size={14} aria-hidden /> Copy</>}</button>
                    <button type="button" onClick={() => share(p)} aria-label="Share the link" className="ma-mini caption-3 shrink-0"><ShareNetwork size={14} weight="fill" aria-hidden /></button>
                  </div>

                  {p.visibility === "private" && <PinChip pin={p.pin} onNew={() => { setSheet(null); setDialog({ kind: "pin", page: p }); }} className="mt-2" />}

                  <div className="mt-auto grid grid-cols-3 gap-2 pt-4">
                    <Link to={`/memories/app/pages/${p.id}/activity`} className="ma-mini caption-3 !bg-[#e11d48] !text-white !shadow-none"><ChartLineUp size={14} weight="bold" className="shrink-0" aria-hidden /> Activity</Link>
                    <Link to={`/memories/app/pages/${p.id}/preview`} className="ma-mini caption-3"><Eye size={14} weight="bold" className="shrink-0" aria-hidden /> Preview</Link>
                    <Link to={`/memories/app/pages/${p.id}/edit`} className="ma-mini caption-3"><PencilSimple size={14} weight="bold" className="shrink-0" aria-hidden /> Edit</Link>
                  </div>
                  {!blocked && cfg?.addons?.length > 0 && (
                    <button type="button" onClick={() => setAddonFor(p.id)} className="ma-mini caption-3 mt-2 w-full !bg-amber-50 !text-amber-800 !shadow-none"><Package size={14} weight="fill" className="shrink-0" aria-hidden /> Get more room: photos, videos, days</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* manage sheet */}
      {open && !dialog && (
        <Sheet title={open.title} subtitle={`${open.occasion} · for ${open.recipientName}`} label={`Manage ${open.title}`} onClose={() => setSheet(null)} locked={busy}>
          <div className="space-y-1">
            <Row icon={ShareNetwork} label="Share the link" hint="Send it on WhatsApp or anywhere" onClick={() => share(open)} />
            <Row icon={ArrowSquareOut} label="Open the link" hint="See it the way they will" onClick={() => window.open(open.url, "_blank", "noopener,noreferrer")} />
            <Row icon={ChartLineUp} label="Responses and activity" hint="Their answer, replies and everything they did" onClick={() => navigate(`/memories/app/pages/${open.id}/activity`)} />
            {!open.shareEmail && open.status !== "blocked" && (
              <Row icon={Envelope} label="Send it by email" disabled={!emailEnabled || open.status === "closed"}
                hint={!emailEnabled ? "Emailing pages is switched off right now" : open.status === "closed" ? "Enable the page first" : "Add their email. We send the link, with or without the PIN"}
                onClick={() => setDialog({ kind: "email", page: open })} />
            )}
            {open.shareEmail && open.emailStatus !== "blocked" && (
              <Row icon={Envelope} label={`Send the email again (${open.emailSendsLeft} left)`} hint={`To ${open.shareEmail}. The address can't be changed`} disabled={open.emailSendsLeft < 1 || open.status === "closed"}
                onClick={() => run(async () => { const r = await resendEmail(open.id); replace({ id: open.id, emailStatus: r.status, emailSendsLeft: r.sendsLeft }); if (r.status !== "sent") throw new Error("The email couldn't be sent. Please try again in a moment."); }, { done: `Email sent to ${open.shareEmail}.` })} />
            )}
            <Row icon={Eye} label="Preview" hint="With your content, right here" onClick={() => navigate(`/memories/app/pages/${open.id}/preview`)} />
            <Row icon={PencilSimple} label="Edit content and add photos" hint="Names can't be changed" onClick={() => navigate(`/memories/app/pages/${open.id}/edit`)} />
            {open.status !== "blocked" && cfg?.addons?.length > 0 && <Row icon={Package} label="Get more room" hint="More photos, longer videos, a longer letter, more days" onClick={() => { setSheet(null); setAddonFor(open.id); }} />}
            {open.status !== "blocked" && (
              open.status === "closed"
                ? <Row icon={Power} label="Enable the page" hint="Open the link again" onClick={() => run(async () => replace(await reopenPage(open.id)), { done: "The page is live again." })} />
                : <Row icon={Power} label="Disable the page" hint="Visitors see that it's closed. Enable it any time" onClick={() => setDialog({ kind: "disable", page: open })} />
            )}
            {open.visibility === "public"
              ? <Row icon={LockKey} label="Make private with a PIN" hint="They will need a 6 digit PIN to open it" onClick={() => setDialog({ kind: "private", page: open })} />
              : <>
                  <Row icon={GlobeHemisphereWest} label="Make public" hint="Anyone with the link can open it" onClick={() => setDialog({ kind: "public", page: open })} />
                  <Row icon={Key} label="Make a new PIN" hint="Locks out everyone who already unlocked it" onClick={() => setDialog({ kind: "pin", page: open })} />
                </>}
            <Row icon={LinkSimple} label="Create a new link" hint="The old link stops working at once" onClick={() => setDialog({ kind: "link", page: open })} />
            <Row icon={Trash} danger label="Delete the page" hint="Removes it and its photos for good" onClick={() => setDialog({ kind: "delete", page: open })} />
          </div>
        </Sheet>
      )}

      {dialog?.kind === "disable" && <Confirm title="Disable this page?" text={`Anyone who opens the link will see that "${d.title}" has been closed. Nothing is deleted, and you can enable it again whenever you like.`} cta="Disable" busy={busy} onClose={() => setDialog(null)} onYes={() => run(async () => replace(await closePage(d.id)), { done: "The page is disabled." })} />}
      {dialog?.kind === "link" && <Confirm title="Create a new link?" text="You'll get a brand new link and the old one stops working immediately. Anyone you already sent it to will need the new link." cta="Create new link" busy={busy} onClose={() => setDialog(null)} onYes={() => run(async () => replace(await regenerateLink(d.id)), { done: "New link created. Copy and share it." })} />}
      {dialog?.kind === "public" && <Confirm title="Make this page public?" text="Anyone with the link will be able to open it without a PIN. The old PIN stops mattering." cta="Make public" busy={busy} onClose={() => setDialog(null)} onYes={() => run(async () => replace((await setVisibility(d.id, "public")).page), { done: "The page is public." })} />}
      {dialog?.kind === "delete" && <Confirm danger title="Delete this page for good?" text={`"${d.title}", its link and its photos and videos will be removed. This can't be undone, and what you paid isn't returned.`} cta="Delete forever" busy={busy} onClose={() => setDialog(null)} onYes={() => run(async () => { await deletePage(d.id); setPages((l) => l.filter((x) => x.id !== d.id)); }, { done: "The page was deleted." })} />}
      {dialog?.kind === "private" && <PinForm title="Make it private" intro="Only people with the 6 digit PIN can open it. Choose your own PIN, or we'll make one." cta="Make private" busy={busy} onClose={() => setDialog(null)} onSubmit={(pin) => run(async () => { const r = await setVisibility(d.id, "private", pin); replace(r.page); setPinShown(r.pin); }, {})} />}
      {dialog?.kind === "pin" && <PinForm title="New PIN" intro="Anyone who unlocked the page before is locked out and needs the new PIN. Choose your own, or we'll make one." cta="Set new PIN" busy={busy} onClose={() => setDialog(null)} onSubmit={(pin) => run(async () => { const r = await changePin(d.id, pin); replace({ id: d.id, pin: r.pin }); setPinShown(r.pin); }, {})} />}
      {dialog?.kind === "email" && <EmailForm page={d} busy={busy} onClose={() => setDialog(null)} onSubmit={(to, withPin) => run(async () => {
        const r = await updatePage(d.id, { shareEmail: to, includePin: withPin });
        replace({ id: d.id, shareEmail: r.shareEmail, emailStatus: r.emailStatus, emailSendsLeft: r.emailSendsLeft, emailIncludesPin: r.emailIncludesPin });
        if (r.email?.status !== "sent") throw new Error(r.email?.status === "blocked" ? "That address has asked not to get emails from Memories." : "The page is saved with that address, but the email couldn't be sent. Open Manage and use \"Send the email again\".");
      }, { done: "Email sent. Ask them to check spam if it doesn't arrive." })} />}
      {pinShown && <PinReveal pin={pinShown} onClose={() => setPinShown(null)} />}
      {addonFor && <AddonShop cfg={cfg} pageId={addonFor} onClose={() => setAddonFor(null)} onApplied={(fresh) => { replace({ id: fresh.id, expiresAt: fresh.expiresAt, daysLeft: fresh.daysLeft }); flash("Extra room added to your page."); }} />}

      {pages.some((p) => p.status === "blocked") && <p className="caption-4 mt-6 flex items-start gap-2 text-[#8a6a80]"><ShieldWarning size={16} weight="fill" className="shrink-0 text-[#e11d48]" aria-hidden /> A page blocked by an admin can&apos;t be changed. Contact support if you think that&apos;s a mistake.</p>}
    </div>
  );
}
