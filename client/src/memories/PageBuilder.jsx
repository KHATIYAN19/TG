import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Check, Copy, Eye, Film, Images, Globe2, ImagePlus, Link2, Loader2, Lock, Mail, Mic, PackagePlus, PartyPopper, RotateCcw, Save, Ticket } from "lucide-react";

import { errMsg } from "../arena/api";
import { createPage, getPage, removeMedia, resendEmail, updatePage, uploadMedia } from "./memApi";
import { BUILDERS, emptyData, galleryFrom, toForm, toPayload } from "./builderConfig";
import AddonShop from "./AddonShop";
import MediaManager from "./MediaManager";
import { RoomMeter, SectionCard, UsageBar, mmss } from "./RoomMeter";
import UpgradeSheet from "./UpgradeSheet";
import { firstLook, limitsWithExtra, lookPrice, occasionOf, passFor, priceLabel, rupees, upgradeFrom } from "./pricing";
import StagedMedia from "./StagedMedia";
import VoiceRecorder from "./VoiceRecorder";
import PinChip from "./PinChip";
import SharePanel from "./SharePanel";
import { useMedia } from "./chrome";
import "./builder.css";
import { EditorFields } from "./templates/birthday/SenderEditor";
import { LivePhone, META } from "./Showcase";
import { TEMPLATES } from "./templates";
import { Loading } from "./AppShell";
import { Button, cx } from "./ui";
import { Btn } from "./landingUi";
import { Sheet } from "./appUi";

const TITLE = {
  birthday: (n) => `Happy Birthday, ${n}`, sorry: (n) => `I'm sorry, ${n}`, proposal: (n) => `A question for ${n}`,
  anniversary: (n) => `Happy Anniversary, ${n}`, thanks: (n) => `Thank you, ${n}`, christmas: (n) => `Merry Christmas, ${n}`,
};
const field = "block w-full rounded-xl border border-rose-100 bg-white px-3.5 py-2.5 text-sm text-[#3a1530] outline-none transition placeholder:text-[#c4a8b8] focus:border-rose-400 focus:ring-4 focus:ring-rose-100";
const label = "mb-1 block text-xs font-bold uppercase tracking-wider text-[#a07890]";
const draftKey = (t) => `memories:draft:${t}`;
const readDraft = (t) => { try { return JSON.parse(localStorage.getItem(draftKey(t)) || "null"); } catch { return null; } };

/* the phone: real template page, fed live from the form */
function Preview({ template, data, themeId, scale }) {
  return <LivePhone template={template} theme={themeId} live={data} scale={scale} eager />;
}

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* the result of "email this page", with a resend for when it didn't arrive (the address itself can never be changed) */
function EmailResult({ pageId, email, sendsLeft: startLeft, hasPin, pinPrivate }) {
  const [status, setStatus] = useState(email.status);
  const [left, setLeft] = useState(startLeft);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const again = async () => {
    setBusy(true); setMsg("");
    try { const r = await resendEmail(pageId); setStatus(r.status); setLeft(r.sendsLeft); } catch (e) { setMsg(errMsg(e)); } finally { setBusy(false); }
  };
  const ok = status === "sent";
  return (
    <div className={cx("mx-auto mt-5 max-w-sm rounded-2xl p-4 text-left text-sm ring-1", ok ? "bg-emerald-50 text-emerald-900 ring-emerald-200" : "bg-amber-50 text-amber-900 ring-amber-200")} role="status">
      <p className="flex items-start gap-2 font-semibold"><Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {ok ? <>Emailed to {email.to}</> : status === "blocked" ? <>{email.to} has asked not to get emails from Memories</> : <>We couldn&apos;t send the email to {email.to}</>}</p>
      {ok && <p className="mt-1 text-xs opacity-80">It has the link{hasPin ? " and the PIN" : ""}. {pinPrivate && !hasPin ? "The PIN is not in the email, so send it to them yourself. " : ""}If it doesn&apos;t arrive, ask them to check spam, or resend it.</p>}
      {status !== "blocked" && left > 0 && <button type="button" onClick={again} disabled={busy} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-black/10 hover:bg-white/80 disabled:opacity-60">{busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />} {ok ? "Send it again" : "Try again"} <span className="font-medium opacity-70">({left} left)</span></button>}
      {msg && <p role="alert" className="mt-2 text-xs text-rose-700">{msg}</p>}
      <p className="mt-2 text-[11px] opacity-70">The address can&apos;t be changed once it is set.</p>
    </div>
  );
}

/*
  EDIT PAGE: send the page to someone's email when it wasn't done at creation. It has its own Send button, so it works
  without touching the rest of the form. The address is fixed once sent. (A page that already has one shows it, locked, in the card.)
*/
function SendEmailBox({ pageId, isPrivate, closed, onSent }) {
  const [to, setTo] = useState("");
  const [withPin, setWithPin] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);
  const send = async () => {
    setErr("");
    if (!EMAIL_RX.test(to.trim())) return setErr("Enter their email address, like name@example.com.");
    setBusy(true);
    try {
      const r = await updatePage(pageId, { shareEmail: to.trim().toLowerCase(), includePin: withPin });
      setResult({ email: r.email, left: r.emailSendsLeft });
      onSent?.({ shareEmail: r.shareEmail, emailStatus: r.emailStatus });
    } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
  };
  if (result?.email) return <EmailResult pageId={pageId} email={result.email} sendsLeft={result.left} hasPin={Boolean(result.email.includesPin)} pinPrivate={isPrivate} />;
  return (
    <div className="mt-3 rounded-2xl border border-rose-100 bg-[#fffaf6] p-3.5">
      <label htmlFor="pb-email" className="flex items-center gap-1.5 text-sm font-semibold text-[#3a1530]"><Mail className="h-4 w-4 text-rose-500" aria-hidden /> Send this page to their email</label>
      <p className="mt-0.5 text-xs text-[#8a6a80]">You didn&apos;t add an email when you created it. Add one now and we&apos;ll send them the link{isPrivate ? " (and the PIN, if you want)" : ""}.</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input id="pb-email" type="email" inputMode="email" autoComplete="off" className={`${field} min-w-0 flex-1`} value={to} onChange={(e) => { setTo(e.target.value); setErr(""); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }} placeholder="name@example.com" maxLength={254} />
        <Button type="button" onClick={send} loading={busy} disabled={closed} className="shrink-0"><Mail className="h-4 w-4" aria-hidden /> Send email</Button>
      </div>
      {isPrivate && (
        <label className="mt-2.5 flex cursor-pointer items-start gap-2.5 rounded-xl bg-white p-3 text-sm ring-1 ring-rose-100">
          <input type="checkbox" className="mt-0.5 h-4 w-4 accent-rose-500" checked={withPin} onChange={(e) => setWithPin(e.target.checked)} />
          <span><span className="font-semibold text-[#3a1530]">Put the PIN in the email too</span><span className="block text-xs text-[#8a6a80]">{withPin ? "They get the link and the PIN together." : "The email has only the link. Send them the PIN yourself."}</span></span>
        </label>
      )}
      <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-800"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Check the address. It can&apos;t be changed after it is sent. Only use the email of someone who knows you.</p>
      {closed && <p className="mt-2 text-xs font-medium text-amber-800">This page is disabled. Enable it in My pages first, then send the email.</p>}
      {err && <p role="alert" className="mt-2 text-xs font-medium text-rose-700">{err}</p>}
    </div>
  );
}

/* the voice message box: on the create form it is kept in the browser until the page exists; on the edit screen it saves at once */
function VoiceBox({ pageId, media, onMedia, staged, onStaged, limits }) {
  const saved = media?.find((m) => m.kind === "audio");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState("");
  const preview = useMemo(() => (staged ? URL.createObjectURL(staged.file) : ""), [staged]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const onFile = async (file, dur) => {
    setErr("");
    if (!pageId) return onStaged({ file, dur });
    setBusy(true); setProgress(0);
    try {
      if (saved) await removeMedia(pageId, saved.id);
      const page = await uploadMedia(pageId, "audio", file, setProgress, "", dur);
      onMedia(page.media);
    } catch (e) { setErr(errMsg(e)); try { const p = await getPage(pageId); onMedia(p.media || []); } catch { /* keep what we have */ } }
    finally { setBusy(false); }
  };
  const onRemove = async () => {
    if (!pageId) return onStaged(null);
    setBusy(true); setErr("");
    try { onMedia((await removeMedia(pageId, saved.id)).media); } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
  };
  return <VoiceRecorder src={pageId ? saved?.url : preview} durationSec={pageId ? saved?.durationSec : staged?.dur} sizeBytes={pageId ? saved?.size : staged?.file.size} limits={limits} onFile={onFile} onRemove={onRemove} busy={busy} progress={progress} error={err} />;
}

function Created({ template, page, pin, credits, edited, limits, files, email, onAnother, onMore }) {
  const [copied, setCopied] = useState(false);
  const [media, setMedia] = useState([]);
  const [busy, setBusy] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(pin); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  return (
    <div className="mx-auto max-w-lg py-8 text-center sm:py-12">
      <div className="rounded-[28px] border border-rose-100 bg-white p-6 shadow-xl shadow-rose-100/60 sm:p-8">
        <PartyPopper className="mx-auto h-12 w-12 text-rose-500" aria-hidden />
        <h1 className="mt-3 text-2xl font-bold text-[#3a1530]">{edited ? "Changes saved" : "Your page is created!"}</h1>
        <p className="mt-1 text-sm text-[#7a5370]">&ldquo;{page.title}&rdquo; is in My pages.{edited ? " Your changes are live." : " Share the link below."}</p>
        {!edited && page.expiresAt && <p className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">⏳ Online for {page.daysLeft} days, until {new Date(page.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
        {!edited && page.url && <SharePanel title={page.title} url={page.url} pin={pin} />}
        {email && <EmailResult pageId={page.id} email={email} sendsLeft={page.emailSendsLeft} hasPin={email.includesPin ?? Boolean(pin)} pinPrivate={page.visibility === "private"} />}
        {pin && (
          <div className="mx-auto mt-5 max-w-xs rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-800">Your PIN. Save it now</p>
            <p className="mt-1 font-mono text-3xl font-bold tracking-[0.3em] text-amber-900" aria-label={`PIN ${pin.split("").join(" ")}`}>{pin}</p>
            <button type="button" onClick={copy} className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:underline"><Copy className="h-4 w-4" aria-hidden /> {copied ? "Copied" : "Copy PIN"}</button>
            <p className="mt-2 text-xs text-amber-800/80">We only keep it hashed, so it can&apos;t be shown again. You can change it any time.</p>
          </div>
        )}

        {!edited && (
          <section className="mt-6 rounded-2xl border border-rose-100 bg-[#fffaf6] p-4 text-left text-slate-900" aria-label="Add photos and videos">
            <h2 className="flex items-center gap-2 text-base font-bold text-[#3a1530]"><ImagePlus className="h-5 w-5 text-rose-500" aria-hidden /> {files?.length ? "Uploading your photos and videos" : "Add your photos and videos"}</h2>
            <p className="mb-3 mt-0.5 text-xs text-[#8a6a80]">{files?.length ? "Stay on this screen until they finish. You can add more any time by editing the page." : "They show up in the gallery on the page. This step is optional, and you can add more later by editing the page."}</p>
            <RoomMeter limits={limits} hide={["letter", "days"]} onMore={onMore}
              usage={{ photos: media.filter((m) => m.kind === "photo").length, videos: media.filter((m) => m.kind === "video").length, audioSec: media.find((m) => m.kind === "audio")?.durationSec ?? null, audioBytes: media.find((m) => m.kind === "audio")?.size || 0, chars: 0, bytes: media.reduce((n, m) => n + (m.size || 0), 0) }} />
            <div className="mt-4"><MediaManager pageId={page.id} media={media} limits={limits} onChange={setMedia} initialFiles={files} onBusy={setBusy} onMore={onMore} /></div>
          </section>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button as={Link} to="/memories/app/pages" size="lg" aria-disabled={busy} onClick={(e) => { if (busy) e.preventDefault(); }} className={busy ? "pointer-events-none opacity-60" : ""}>{busy ? "Uploading…" : !edited && media.length === 0 ? "Skip and go to my pages" : "Go to my pages"}</Button>
          {!edited && <Button variant="outline" size="lg" onClick={onAnother} disabled={busy}>{credits > 0 ? "Create another" : "Back to templates"}</Button>}
          {!edited && onMore && <Button variant="soft" size="lg" onClick={onMore} disabled={busy}><PackagePlus className="h-4 w-4" aria-hidden /> Get more room</Button>}
        </div>
        <p className="mt-4 text-xs text-[#8a6a80]">{template.name}</p>
      </div>
    </div>
  );
}

/**
 * THE PAGE BUILDER. One form per template (the fields come from each template's editor config) with the real page
 * updating live in a phone beside it. Creating needs a paid page that covers the look. The same screen edits a page you already made.
 */
export default function PageBuilder({ mode, cfg, onPageCreated, reload }) {
  const navigate = useNavigate();
  const params = useParams();
  const [search] = useSearchParams();
  const user = useSelector((s) => s.auth?.user);
  const xl = useMedia("(min-width: 1280px)");
  const scale = xl ? 1.12 : 0.95;
  const edit = mode === "edit";

  const [templateId, setTemplateId] = useState(edit ? null : params.template);
  const [data, setData] = useState(null);
  const [themeId, setThemeId] = useState(null);
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [pin, setPin] = useState("");
  const [includePin, setIncludePin] = useState(true); // private page: write the PIN in the email, or give it to them yourself
  const [shareEmail, setShareEmail] = useState("");
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [media, setMedia] = useState([]);
  const [info, setInfo] = useState(null); // link, visibility and PIN of the page being edited
  const [copiedLink, setCopiedLink] = useState(false);
  const [staged, setStaged] = useState([]); // photos and videos chosen before the page exists
  const [voice, setVoice] = useState(null); // { file, dur } voice message chosen before the page exists
  const [done, setDone] = useState(null);
  const [shop, setShop] = useState(false); // the "get more room" sheet
  const [upgradeTo, setUpgradeTo] = useState(null); // a look id: the "pay the difference" sheet
  const [sheet, setSheet] = useState(false);
  // the preview phone is sized to the visible screen, so the whole phone and the close button fit without scrolling
  const sheetScale = Math.max(0.55, Math.min(0.9, ((typeof window !== "undefined" ? window.innerHeight : 800) - 190) / 580));
  const errRef = useRef(null);
  const isPrivate = edit ? info?.visibility === "private" : visibility === "private";
  // The "send to their email" box on the create form. On the edit page it lives in the "Link and access" card at the top (SendEmailBox).
  const canAddEmail = cfg.emailEnabled !== false && !edit;

  const template = TEMPLATES.find((t) => t.id === templateId);
  const meta = META[templateId];
  const builder = BUILDERS[templateId];
  const first = String(user?.name || "").split(" ")[0];
  const occ = occasionOf(cfg, template?.theme);

  // load: a fresh form (with the saved draft and the look chosen on the templates page) or the page being edited
  useEffect(() => {
    if (edit) {
      getPage(params.id).then((p) => {
        const t = TEMPLATES.find((x) => x.theme === p.theme);
        if (!t) return setLoadError("This page's template isn't available.");
        setTemplateId(t.id); setData(toForm(p)); setMedia(p.media || []); setInfo({ url: p.url, visibility: p.visibility, pin: p.pin, status: p.status, expiresAt: p.expiresAt, daysLeft: p.daysLeft, shareEmail: p.shareEmail, emailStatus: p.emailStatus, limits: p.limits, extra: p.extra, paidPrice: p.paidPrice }); setThemeId(p.style || META[t.id].themes[0].id); setTitle(p.title);
      }).catch((e) => setLoadError(errMsg(e)));
      return;
    }
    if (!BUILDERS[params.template]) return;
    const o = occasionOf(cfg, params.template);
    const on = (id) => (o ? o.themes.some((x) => x.id === id && Boolean(passFor(cfg.passes, x.price))) : true); // switched on by the admin AND covered by a page the user holds
    const draft = readDraft(params.template);
    const ask = search.get("theme");
    setData(draft?.data ? { ...emptyData(params.template, first), ...draft.data } : { ...emptyData(params.template, first) });
    setThemeId(on(ask) ? ask : on(draft?.themeId) ? draft.themeId : o?.themes.find((x) => on(x.id))?.id || firstLook(o) || META[params.template].themes[0].id);
    setTitle(draft?.title || "");
    if ((params.template === "thanks" || params.template === "christmas") && search.get("audience")) setData((d) => ({ ...d, audience: search.get("audience") }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit, params.id, params.template]);

  // keep what they've typed so a refresh doesn't lose it
  useEffect(() => {
    if (edit || !data || done) return;
    try { localStorage.setItem(draftKey(templateId), JSON.stringify({ data, themeId, title })); } catch { /* storage blocked */ }
  }, [edit, data, themeId, title, templateId, done]);

  // what the phone shows: the form, plus the page's real photos and video once it has them
  const [voiceBlob, setVoiceBlob] = useState("");
  useEffect(() => {
    if (!voice) { setVoiceBlob(""); return undefined; }
    const u = URL.createObjectURL(voice.file); setVoiceBlob(u);
    return () => URL.revokeObjectURL(u);
  }, [voice]);
  const savedVoice = media.find((m) => m.kind === "audio" && m.url);
  const previewData = useMemo(() => {
    if (!data) return data;
    const withVoice = (d) => (savedVoice || voiceBlob ? { ...d, voiceUrl: savedVoice?.url || voiceBlob, voiceDur: savedVoice?.durationSec || voice?.dur } : d);
    const real = galleryFrom(media);
    if (real) return withVoice({ ...data, ...real });
    if (!staged.length) return withVoice(data);
    const photos = staged.filter((x) => x.kind === "photo").map((x) => ({ id: `s${x.id}`, url: x.preview, caption: (x.caption || "").trim() }));
    const v = staged.find((x) => x.kind === "video");
    return withVoice({ ...data, photos, video: v ? { id: `s${v.id}`, url: v.preview, caption: (v.caption || "").trim() } : null, mainPhotoId: photos[0]?.id });
  }, [data, media, staged, savedVoice, voiceBlob, voice]);
  const autoTitle = useMemo(() => (data?.recipientName?.trim() && TITLE[templateId] ? TITLE[templateId](data.recipientName.trim()) : ""), [data?.recipientName, templateId]);

  if (!edit && !BUILDERS[params.template]) return <Navigate to="/memories/app" replace />;
  // building a page needs a paid page that covers this look: otherwise this is the checkout's job
  const price = occ ? lookPrice(occ, themeId) : 0;
  const pass = !edit && occ ? passFor(cfg.passes, price) : null;
  if (!edit && !done && !occ) return <Navigate to="/memories/app" replace />;
  if (!edit && !done && themeId && !pass) return <Navigate to={`/memories/app/pay?template=${templateId}${themeId ? `&theme=${themeId}` : ""}`} replace />;
  if (loadError) return <p role="alert" className="py-20 text-center text-rose-600">{loadError} <Link to="/memories/app/pages" className="font-semibold underline">Back to my pages</Link></p>;
  if (!data || !template) return <Loading label="Opening the builder…" />;

  const limitsOf = edit ? limitsWithExtra(info?.limits, null) : limitsWithExtra(occ?.limits, pass?.extra);
  /* which looks this page can use: the ones the admin switched on, at the same price as the page was bought for or less */
  const themeInfo = (() => {
    const out = {};
    if (edit) {
      const cap = info?.paidPrice; // null = a code / admin page: any look
      const enabled = occ ? new Map(occ.themes.map((t) => [t.id, t.price])) : null;
      for (const th of META[templateId].themes) {
        const p = enabled ? enabled.get(th.id) : 0;
        const mine = th.id === themeId;
        if (p == null && !mine) continue; // switched off (a page keeps the look it already has)
        const price = p ?? 0;
        const locked = cap != null && Math.round(price * 100) > Math.round(cap * 100);
        out[th.id] = { price, locked, diff: locked ? Math.round((price - cap) * 100) / 100 : 0, note: locked ? `Pay ${rupees(Math.round((price - cap) * 100) / 100)} more to use it. You paid ${rupees(cap)} for this page.` : "" };
      }
      return out;
    }
    for (const t of occ?.themes || []) {
      const locked = !passFor(cfg.passes, t.price);
      const up = locked ? upgradeFrom(cfg.passes, t.price) : null; // a cheaper page already paid for: pay only the difference
      out[t.id] = { price: t.price, locked, diff: up ? up.diff : 0, note: up ? `Pay ${rupees(up.diff)} more to use it. You already paid ${rupees(up.from)}.` : "Costs more than the page you paid for." };
    }
    return out;
  })();
  const messageMax = limitsOf.messageChars;
  // a dearer look: on a new page this goes to checkout (only the difference is charged); on a saved page it opens the upgrade sheet
  const onUpgrade = (id) => (edit ? setUpgradeTo(id) : navigate(`/memories/app/pay?template=${templateId}&theme=${id}`));
  /* how much of the room is used right now, counted live from the form (a page being made) or from the saved page (an edit) */
  const items = edit ? media : staged;
  const sizeOf = (x) => (edit ? x.size : x.file?.size) || 0;
  const savedAudio = edit ? media.find((m) => m.kind === "audio") : null;
  const usage = {
    photos: items.filter((x) => x.kind === "photo").length,
    videos: items.filter((x) => x.kind === "video").length,
    audioSec: edit ? savedAudio?.durationSec ?? null : voice?.dur ?? null,
    audioBytes: edit ? savedAudio?.size || 0 : voice?.file?.size || 0,
    chars: (data?.message || "").length,
    bytes: items.reduce((n, x) => n + sizeOf(x), 0) + (edit ? savedAudio?.size || 0 : voice?.file?.size || 0),
  };
  const dayTotal = (cfg.pageLifetimeDays || 30) + (edit ? info?.extra?.days || 0 : pass?.extra?.days || 0);
  const days = edit && info?.daysLeft != null ? { total: Math.max(dayTotal, info.daysLeft), left: info.daysLeft } : { total: dayTotal, left: null };
  // extra room can be bought while building too: for a page that exists it is added to the page, for a paid page not built yet it is added to that paid page
  const openShop = cfg.addons?.length && (edit ? info?.status !== "blocked" : Boolean(pass && occ)) ? () => setShop(true) : undefined;
  const lifeDays = (cfg.pageLifetimeDays || 30) + (pass?.extra?.days || 0);

  const fail = (m) => { setError(m); setTimeout(() => errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); return false; };

  const validate = () => {
    if (!edit && !data.recipientName.trim()) return fail("Who is this page for? Add their name.");
    if (!edit && !data.senderName.trim()) return fail("Add your name. It shows on the page, like “from James”.");
    if (builder.fields.includes("question") && !(data.question || "").trim()) return fail(templateId === "proposal" ? "Write the question you want to ask." : templateId === "christmas" ? "Write the wish you want to ask them, like “What do you wish for this Christmas?”." : "Add a greeting, like “Happy Thanksgiving”.");
    if (data.since && new Date(`${data.since}T00:00:00`) > new Date()) return fail("The date can't be in the future.");
    if (visibility === "private" && pin && !/^\d{6}$/.test(pin)) return fail("A PIN is exactly 6 digits, or leave it empty and we'll make one.");
    if (shareEmail.trim() && !EMAIL_RX.test(shareEmail.trim())) return fail("That email address doesn't look right. Use something like name@example.com, or leave it empty.");
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const body = { ...toPayload(templateId, data, themeId, { withNames: !edit }), title: (title.trim() || autoTitle).slice(0, 120) };
      if (edit) {
        const page = await updatePage(params.id, body);
        setDone({ page, edited: true });
      } else {
        const occasion = occ;
        if (!occasion) return fail("This template isn't available right now. Please try another.");
        const r = await createPage({ ...body, occasionId: occasion.id, visibility, ...(visibility === "private" && pin ? { pin } : {}), ...(shareEmail.trim() ? { shareEmail: shareEmail.trim().toLowerCase(), includePin } : {}) });
        try { localStorage.removeItem(draftKey(templateId)); } catch { /* ignore */ }
        const left = Math.max(0, cfg.credits - 1);
        onPageCreated?.(); reload?.();
        setDone({ page: r.page, pin: r.pin, credits: left, limits: r.page.limits, files: [...staged.map((x) => ({ file: x.file, caption: (x.caption || "").trim() })), ...(voice ? [{ file: voice.file, caption: "", durationSec: voice.dur }] : [])], email: r.email });
      }
    } catch (err) {
      fail(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <>
        <Created template={template} page={done.page} pin={done.pin} credits={done.credits} edited={done.edited} files={done.files} email={done.email} limits={done.limits || limitsOf}
          onMore={!done.edited && cfg.addons?.length ? () => setShop(true) : undefined}
          onAnother={() => { reload(); navigate("/memories/app"); }} />
        {shop && <AddonShop cfg={cfg} pageId={done.page.id} onClose={() => setShop(false)} onApplied={(fresh) => setDone((d) => ({ ...d, limits: fresh.limits, page: { ...d.page, expiresAt: fresh.expiresAt, daysLeft: fresh.daysLeft } }))} />}
      </>
    );
  }

  const startOver = () => {
    if (!window.confirm("Clear everything you've typed and start again?")) return;
    try { localStorage.removeItem(draftKey(templateId)); } catch { /* ignore */ }
    setData(emptyData(templateId, first)); setTitle(""); setError(""); setStaged([]);
  };

  return (
    <div className="py-5 sm:py-8">
      <Link to={edit ? "/memories/app/pages" : "/memories/app"} className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:underline"><ArrowLeft className="h-4 w-4" aria-hidden /> {edit ? "My pages" : "All templates"}</Link>
      <div className={cx("mt-3 overflow-hidden rounded-[28px] bg-gradient-to-br p-5 sm:p-7 lg:p-9", template.tint)}>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/80 text-3xl shadow-sm sm:h-16 sm:w-16 sm:text-4xl" aria-hidden>{meta.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600/90">{template.name}</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#3a1530] sm:text-3xl lg:text-4xl">{edit ? "Edit your page" : "Build your page"}</h1>
            <p className="mt-1 max-w-xl text-sm text-[#6b3a5a] sm:text-base">{builder.blurb} <span className="hidden md:inline">The page beside the form updates as you type.</span></p>
          </div>
          {!edit && <div className="flex flex-col items-start gap-1.5 sm:items-end"><span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-1.5 text-sm font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-200"><Ticket className="h-4 w-4" aria-hidden /> {price > 0 ? `${priceLabel(price)} look, paid` : "Free look"}</span><span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#6b3a5a]">⏳ Online for {lifeDays} days after you create it</span></div>}
        </div>
        <nav className="mt-5 flex flex-wrap gap-2" aria-label="Jump to a part of the form">
          {[["pb-top", "Look and words"], ["pb-media", "Photos and videos"], ["pb-voice", "Voice"], ["pb-share", edit ? "Page name" : "Sharing"]].map(([id, t], i) => (
            <a key={id} href={`#${id}`} className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#6b3a5a] ring-1 ring-white transition duration-300 hover:bg-white"><span className="grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">{i + 1}</span> {t}</a>
          ))}
        </nav>
      </div>

      <form onSubmit={submit} noValidate className="mt-6 grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_300px] md:gap-8 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-10">
        <div id="pb-top" className="min-w-0 scroll-mt-24 space-y-5">
          <RoomMeter limits={limitsOf} usage={usage} days={days} onMore={openShop} note={edit || openShop ? undefined : "Need more? After you create the page, tap Get more room."} />
          {openShop && (
            <button type="button" onClick={openShop} className="ma-lift flex w-full flex-wrap items-center gap-3 rounded-3xl bg-amber-50 p-4 text-left ring-1 ring-inset ring-amber-200">
              <span className="ma-icon grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-amber-600"><PackagePlus className="h-6 w-6" aria-hidden /></span>
              <span className="min-w-0 flex-1 basis-40"><span className="body-1 block text-[#2a1023]">Need more room?</span><span className="body-6 block text-amber-900">More photos, longer videos, a longer letter or more days online. {edit ? "Added to this page right away." : "Buy it now and it is ready when you create the page."}</span></span>
              <span className="ml-btn ml-btn-sm button-sm w-full shrink-0 sm:w-auto">Get more room</span>
            </button>
          )}
          {edit && info && (
            <div className="rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[28px]">
              <h3 className="mb-3 text-base font-bold text-slate-900">Link and access</h3>
              <div className="flex items-center gap-2 rounded-2xl bg-[#fff7f3] p-2 pl-3">
                <Link2 className="h-4 w-4 shrink-0 text-rose-400" aria-hidden />
                <input readOnly value={info.url} aria-label="Page link" onFocus={(e) => e.target.select()} className="min-w-0 flex-1 truncate bg-transparent text-xs text-[#6b3a5a] outline-none sm:text-sm" />
                <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(info.url); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 1600); } catch { /* blocked */ } }} className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-rose-600 ring-1 ring-rose-100 hover:bg-rose-50">{copiedLink ? <><Check className="h-3.5 w-3.5" aria-hidden /> Copied</> : <><Copy className="h-3.5 w-3.5" aria-hidden /> Copy</>}</button>
              </div>
              {info.visibility === "private"
                ? <PinChip pin={info.pin} className="mt-2" />
                : <p className="mt-2 flex items-center gap-1.5 text-xs text-[#8a6a80]"><Globe2 className="h-3.5 w-3.5 text-rose-400" aria-hidden /> Public: anyone with the link can open it.</p>}
              {info.shareEmail && <p className="mt-2 flex items-center gap-2 rounded-xl bg-sky-50 px-3 py-2 text-xs font-medium text-sky-900 ring-1 ring-sky-200"><Mail className="h-3.5 w-3.5 shrink-0" aria-hidden /> Emailed to {info.shareEmail} ({info.emailStatus || "pending"}). <span className="inline-flex items-center gap-1 text-sky-700"><Lock className="h-3 w-3" aria-hidden /> Can&apos;t be changed</span></p>}
              {!info.shareEmail && (cfg.emailEnabled !== false
                ? <SendEmailBox pageId={params.id} isPrivate={info.visibility === "private"} closed={info.status === "closed"} onSent={(x) => setInfo((i) => ({ ...i, ...x }))} />
                : <p className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200"><Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Emailing pages is switched off right now, so this page can&apos;t be sent by email. You can still share the link yourself.</p>)}
              {info.expiresAt && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 ring-1 ring-amber-200">⏳ Online until {new Date(info.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} ({info.daysLeft === 1 ? "1 day" : `${info.daysLeft} days`} left). After that the page and its files are deleted.</p>}
              <p className="mt-2 text-xs text-[#8a6a80]">Change the PIN, switch public or private, or make a new link from <Link to="/memories/app/pages" className="font-semibold text-rose-600 hover:underline">My pages</Link>.</p>
            </div>
          )}

          <EditorFields cards data={data} onData={(d) => { setData(d); setError(""); }} themeId={themeId} onTheme={setThemeId} config={{ ...builder.editor, lockNames: edit, nameWarning: !edit, themeInfo, messageMax, onUpgrade }} />

          <SectionCard id="pb-media" step={2} Icon={Images} title="Photos and videos" hint={edit ? "Add, caption, reorder and remove. Changes save as you go." : "Optional. They upload on their own the moment you create the page."}
            aside={openShop ? <button type="button" onClick={openShop} className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 ring-1 ring-rose-100 transition duration-300 hover:bg-rose-100"><PackagePlus className="h-3.5 w-3.5" aria-hidden /> Get more room</button> : null}>
            <div className="mb-4 grid gap-3 rounded-2xl bg-[#fffaf6] p-3.5 ring-1 ring-rose-100 sm:grid-cols-2">
              <UsageBar Icon={Images} label="Photos" used={usage.photos} max={limitsOf.photos} text={`${usage.photos} of ${limitsOf.photos}`} />
              <UsageBar Icon={Film} label="Videos" used={usage.videos} max={limitsOf.videos} text={`${usage.videos} of ${limitsOf.videos}`} />
            </div>
            {edit
              ? <MediaManager pageId={params.id} media={media} limits={limitsOf} onChange={setMedia} onMore={cfg.addons?.length ? () => setShop(true) : undefined} />
              : <StagedMedia staged={staged} onChange={setStaged} limits={limitsOf} />}
          </SectionCard>

          <SectionCard id="pb-voice" step={3} Icon={Mic} title="Voice message" hint="Say it in your own voice. It appears on the page like a little gift to play."
            aside={<span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-[#a07890]">Optional</span>}>
            {(usage.audioSec > 0 || usage.audioBytes > 0) && (
              <div className="mb-4 grid gap-3 rounded-2xl bg-[#fffaf6] p-3.5 ring-1 ring-rose-100 sm:grid-cols-2">
                <UsageBar Icon={Mic} label="Length" used={usage.audioSec || 0} max={limitsOf.audioSec} text={usage.audioSec ? `${mmss(usage.audioSec)} of ${mmss(limitsOf.audioSec)}` : "Added"} />
                <UsageBar label="File size" used={usage.audioBytes / 1048576} max={limitsOf.audioMb} text={`${(usage.audioBytes / 1048576).toFixed(1)} of ${limitsOf.audioMb} MB`} />
              </div>
            )}
            <VoiceBox pageId={edit ? params.id : null} media={media} onMedia={setMedia} staged={voice} onStaged={setVoice} limits={limitsOf} />
          </SectionCard>

          <div id="pb-share" className="scroll-mt-24 space-y-5 rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[28px]">
            <div>
              <label className={label} htmlFor="pb-title">Page name <span className="font-medium normal-case tracking-normal text-[#c4a8b8]">(only you see this)</span></label>
              <input id="pb-title" className={field} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={autoTitle || "Happy Birthday, Emma"} />
            </div>
            {!edit && (
              <fieldset>
                <legend className={label}>Who can open it?</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[["public", Globe2, "Anyone with the link", "Opens straight away"], ["private", Lock, "Only with a PIN", "A 6-digit PIN you share with them"]].map(([v, Icon, t, d]) => (
                    <label key={v} className={cx("flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm transition", visibility === v ? "border-rose-400 bg-rose-50 ring-2 ring-rose-100" : "border-rose-100 hover:bg-rose-50/60")}>
                      <input type="radio" name="vis" className="mt-1 accent-rose-500" checked={visibility === v} onChange={() => setVisibility(v)} />
                      <span><span className="flex items-center gap-1.5 font-semibold text-[#3a1530]"><Icon className="h-4 w-4 text-rose-500" aria-hidden /> {t}</span><span className="text-xs text-[#8a6a80]">{d}</span></span>
                    </label>
                  ))}
                </div>
                {visibility === "private" && (
                  <div className="mt-3 max-w-xs">
                    <label className={label} htmlFor="pb-pin">Your own PIN <span className="font-medium normal-case tracking-normal text-[#c4a8b8]">(optional)</span></label>
                    <input id="pb-pin" className={`${field} font-mono tracking-[0.3em]`} inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} placeholder="Leave empty to make one" />
                  </div>
                )}
              </fieldset>
            )}
            {canAddEmail && (
              <div className="rounded-2xl border border-rose-100 bg-[#fffaf6] p-3.5">
                <label className={label} htmlFor="pb-email"><span className="inline-flex items-center gap-1.5"><Mail className="h-4 w-4 text-rose-500" aria-hidden /> Send it to their email <span className="font-medium normal-case tracking-normal text-[#c4a8b8]">(optional)</span></span></label>
                <input id="pb-email" type="email" inputMode="email" autoComplete="off" className={field} value={shareEmail} onChange={(e) => { setShareEmail(e.target.value); setError(""); }} placeholder="name@example.com" maxLength={254} />
                <p className="mt-1.5 text-xs text-[#8a6a80]">We&apos;ll email them the link {edit ? "when you save" : "the moment you create the page"}, in the colours of the look you chose. Leave it empty to share the link yourself.</p>
                {shareEmail.trim() && isPrivate && (
                  <label className="mt-3 flex cursor-pointer items-start gap-2.5 rounded-xl bg-white p-3 text-sm ring-1 ring-rose-100">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 accent-rose-500" checked={includePin} onChange={(e) => setIncludePin(e.target.checked)} />
                    <span><span className="font-semibold text-[#3a1530]">Put the PIN in the email too</span><span className="block text-xs text-[#8a6a80]">{includePin ? "They get the link and the PIN together." : "The email has only the link and says you'll give them the PIN. Send it to them yourself, for example by message."}</span></span>
                  </label>
                )}
                {shareEmail.trim() && <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-800"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Check the address. It can&apos;t be changed after {edit ? "you save" : "you create the page"}. Only use the email of someone who knows you.</p>}
              </div>
            )}
          </div>

          {error && <p ref={errRef} role="alert" className="rounded-xl bg-rose-50 p-3.5 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}

          {!edit && <p className="text-center md:hidden"><button type="button" onClick={startOver} className="ma-mini caption-3 !rounded-full"><RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start over with an empty form</button></p>}
          {/* phones: two equal buttons side by side that stay at the bottom. Larger screens: one row. */}
          <div className="sticky bottom-3 z-20">
            <div className="ma-buybar ma-two grid grid-cols-2 gap-2 rounded-full p-2 md:flex md:items-center md:rounded-3xl md:p-3">
              <span className="contents md:hidden"><Btn type="button" variant="ghost" onClick={() => setSheet(true)}><Eye className="h-4 w-4 shrink-0" aria-hidden /> Preview</Btn></span>
              <Btn type="submit" loading={busy}>{edit ? <><Save className="h-4 w-4 shrink-0" aria-hidden /> Save changes</> : <><Check className="h-4 w-4 shrink-0" aria-hidden /> Create page</>}</Btn>
              {!edit && <span className="ml-auto hidden md:block"><button type="button" onClick={startOver} className="ma-mini caption-3 !rounded-full"><RotateCcw className="h-3.5 w-3.5" aria-hidden /> Start over</button></span>}
            </div>
          </div>
        </div>

        <aside className="hidden md:sticky md:top-20 md:block" aria-label="Live preview">
          <div className={cx("rounded-[40px] bg-gradient-to-br p-5 shadow-xl shadow-rose-100/60 xl:p-6", template.tint)}>
            <Preview template={template} data={previewData} themeId={themeId} scale={scale} />
          </div>
          <p className="mt-2 text-center text-xs text-[#8a6a80]">{edit ? "Live preview with your photos." : "Live preview, with the photos you add."}</p>
        </aside>
      </form>

      {sheet && (
        <Sheet size="sm" title="Preview" subtitle="This is what they will open. Scroll it and tap things." onClose={() => setSheet(false)}>
          <div className={cx("mx-auto w-fit rounded-3xl bg-gradient-to-br p-4", template.tint)}><Preview template={template} data={previewData} themeId={themeId} scale={sheetScale} /></div>
        </Sheet>
      )}
      {upgradeTo && edit && (
        <UpgradeSheet cfg={cfg} pageId={params.id} themeId={upgradeTo} lookName={META[templateId].themes.find((x) => x.id === upgradeTo)?.name || upgradeTo} onClose={() => setUpgradeTo(null)}
          onDone={(fresh, unlocked = true) => { setInfo((i) => ({ ...i, paidPrice: fresh.paidPrice, limits: fresh.limits, extra: fresh.extra, expiresAt: fresh.expiresAt, daysLeft: fresh.daysLeft })); if (unlocked) setThemeId(upgradeTo); }} />
      )}
      {shop && !edit && pass && occ && (
        <AddonShop cfg={cfg} reload={reload} unsaved={staged.length > 0 || Boolean(voice)} onClose={() => setShop(false)}
          pending={{ occasionId: occ.id, theme: themeId, limits: limitsOf, owned: pass.extra, days: lifeDays }} />
      )}
      {shop && edit && <AddonShop cfg={cfg} pageId={params.id} onClose={() => setShop(false)} onApplied={(fresh) => setInfo((i) => ({ ...i, limits: fresh.limits, extra: fresh.extra, expiresAt: fresh.expiresAt, daysLeft: fresh.daysLeft }))} />}
    </div>
  );
}
