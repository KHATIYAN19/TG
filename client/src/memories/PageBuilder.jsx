import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Check, Copy, Eye, Globe2, ImagePlus, Link2, Loader2, Lock, Mail, PartyPopper, RotateCcw, Save, Ticket, X } from "lucide-react";

import { errMsg } from "../arena/api";
import { createPage, getPage, resendEmail, updatePage } from "./memApi";
import { BUILDERS, emptyData, galleryFrom, toForm, toPayload } from "./builderConfig";
import MediaManager from "./MediaManager";
import StagedMedia from "./StagedMedia";
import PinChip from "./PinChip";
import { useMedia } from "./chrome";
import "./builder.css";
import { EditorFields } from "./templates/birthday/SenderEditor";
import { LivePhone, META } from "./Showcase";
import { TEMPLATES } from "./templates";
import { Loading } from "./AppShell";
import { Button, cx } from "./ui";

const TITLE = {
  birthday: (n) => `Happy Birthday, ${n}`, sorry: (n) => `I'm sorry, ${n}`, proposal: (n) => `A question for ${n}`,
  anniversary: (n) => `Happy Anniversary, ${n}`, thanks: (n) => `Thank you, ${n}`,
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
function EmailResult({ pageId, email, sendsLeft: startLeft, hasPin }) {
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
      {ok && <p className="mt-1 text-xs opacity-80">It has the link{hasPin ? " and the PIN" : ""}. If it doesn&apos;t arrive, ask them to check spam, or resend it.</p>}
      {status !== "blocked" && left > 0 && <button type="button" onClick={again} disabled={busy} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-black/10 hover:bg-white/80 disabled:opacity-60">{busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />} {ok ? "Send it again" : "Try again"} <span className="font-medium opacity-70">({left} left)</span></button>}
      {msg && <p role="alert" className="mt-2 text-xs text-rose-700">{msg}</p>}
      <p className="mt-2 text-[11px] opacity-70">The address can&apos;t be changed after the page is created.</p>
    </div>
  );
}

function Created({ template, page, pin, credits, edited, limits, files, email, onAnother }) {
  const [copied, setCopied] = useState(false);
  const [media, setMedia] = useState([]);
  const [busy, setBusy] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(pin); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* blocked */ } };
  return (
    <div className="mx-auto max-w-lg py-8 text-center sm:py-12">
      <div className="rounded-[28px] border border-rose-100 bg-white p-6 shadow-xl shadow-rose-100/60 sm:p-8">
        <PartyPopper className="mx-auto h-12 w-12 text-rose-500" aria-hidden />
        <h1 className="mt-3 text-2xl font-bold text-[#3a1530]">{edited ? "Changes saved" : "Your page is created!"}</h1>
        <p className="mt-1 text-sm text-[#7a5370]">&ldquo;{page.title}&rdquo; is in My pages.{edited ? " Your changes are live." : <> <b>1 credit used</b>, {credits} left.</>}</p>
        {!edited && page.expiresAt && <p className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">⏳ Online for {page.daysLeft} days, until {new Date(page.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>}
        {email && <EmailResult pageId={page.id} email={email} sendsLeft={page.emailSendsLeft} hasPin={Boolean(pin)} />}
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
            <MediaManager pageId={page.id} media={media} limits={limits} onChange={setMedia} initialFiles={files} onBusy={setBusy} />
          </section>
        )}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button as={Link} to="/memories/app/pages" size="lg" aria-disabled={busy} onClick={(e) => { if (busy) e.preventDefault(); }} className={busy ? "pointer-events-none opacity-60" : ""}>{busy ? "Uploading…" : !edited && media.length === 0 ? "Skip and go to my pages" : "Go to my pages"}</Button>
          {!edited && <Button variant="outline" size="lg" onClick={onAnother} disabled={busy}>{credits > 0 ? "Create another" : "Back to templates"}</Button>}
        </div>
        <p className="mt-4 text-xs text-[#8a6a80]">{template.name}</p>
      </div>
    </div>
  );
}

/**
 * THE PAGE BUILDER. One form per template (the fields come from each template's editor config) with the real page
 * updating live in a phone beside it. Creating spends 1 credit. The same screen edits a page you already made.
 */
export default function PageBuilder({ mode, cfg, setCredits, onPageCreated, reload }) {
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
  const [emailOn, setEmailOn] = useState(false); // "email this page to someone"
  const [shareEmail, setShareEmail] = useState("");
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [media, setMedia] = useState([]);
  const [info, setInfo] = useState(null); // link, visibility and PIN of the page being edited
  const [copiedLink, setCopiedLink] = useState(false);
  const [staged, setStaged] = useState([]); // photos and videos chosen before the page exists
  const [done, setDone] = useState(null);
  const [sheet, setSheet] = useState(false);
  const errRef = useRef(null);

  const template = TEMPLATES.find((t) => t.id === templateId);
  const meta = META[templateId];
  const builder = BUILDERS[templateId];
  const first = String(user?.name || "").split(" ")[0];

  // load: a fresh form (with the saved draft and the look chosen on the templates page) or the page being edited
  useEffect(() => {
    if (edit) {
      getPage(params.id).then((p) => {
        const t = TEMPLATES.find((x) => x.theme === p.theme);
        if (!t) return setLoadError("This page's template isn't available.");
        setTemplateId(t.id); setData(toForm(p)); setMedia(p.media || []); setInfo({ url: p.url, visibility: p.visibility, pin: p.pin, status: p.status, expiresAt: p.expiresAt, daysLeft: p.daysLeft, shareEmail: p.shareEmail, emailStatus: p.emailStatus }); setThemeId(p.style || META[t.id].themes[0].id); setTitle(p.title);
      }).catch((e) => setLoadError(errMsg(e)));
      return;
    }
    if (!BUILDERS[params.template]) return;
    const m = META[params.template];
    const draft = readDraft(params.template);
    const ask = search.get("theme");
    setData(draft?.data ? { ...emptyData(params.template, first), ...draft.data } : { ...emptyData(params.template, first) });
    setThemeId(m.themes.some((x) => x.id === ask) ? ask : draft?.themeId || m.themes[0].id);
    setTitle(draft?.title || "");
    if (params.template === "thanks" && search.get("audience")) setData((d) => ({ ...d, audience: search.get("audience") }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edit, params.id, params.template]);

  // keep what they've typed so a refresh doesn't lose it
  useEffect(() => {
    if (edit || !data || done) return;
    try { localStorage.setItem(draftKey(templateId), JSON.stringify({ data, themeId, title })); } catch { /* storage blocked */ }
  }, [edit, data, themeId, title, templateId, done]);

  // what the phone shows: the form, plus the page's real photos and video once it has them
  const previewData = useMemo(() => {
    if (!data) return data;
    const real = galleryFrom(media);
    if (real) return { ...data, ...real };
    if (!staged.length) return data;
    const photos = staged.filter((x) => x.kind === "photo").map((x) => ({ id: `s${x.id}`, url: x.preview, caption: "" }));
    const v = staged.find((x) => x.kind === "video");
    return { ...data, photos, video: v ? { id: `s${v.id}`, url: v.preview, caption: "" } : null, mainPhotoId: photos[0]?.id };
  }, [data, media, staged]);
  const autoTitle = useMemo(() => (data?.recipientName?.trim() && TITLE[templateId] ? TITLE[templateId](data.recipientName.trim()) : ""), [data?.recipientName, templateId]);

  if (!edit && !BUILDERS[params.template]) return <Navigate to="/memories/app" replace />;
  if (!edit && cfg.credits < 1 && !done) return <Navigate to="/memories/app/pay" replace />;
  if (loadError) return <p role="alert" className="py-20 text-center text-rose-600">{loadError} <Link to="/memories/app/pages" className="font-semibold underline">Back to my pages</Link></p>;
  if (!data || !template) return <Loading label="Opening the builder…" />;

  const fail = (m) => { setError(m); setTimeout(() => errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50); return false; };

  const validate = () => {
    if (!edit && !data.recipientName.trim()) return fail("Who is this page for? Add their name.");
    if (!edit && !data.senderName.trim()) return fail("Add your name. It shows on the page, like “from Ravi”.");
    if (builder.fields.includes("question") && !(data.question || "").trim()) return fail(templateId === "proposal" ? "Write the question you want to ask." : "Add a greeting, like “Happy Thanksgiving”.");
    if (data.since && new Date(`${data.since}T00:00:00`) > new Date()) return fail("The date can't be in the future.");
    if (visibility === "private" && pin && !/^\d{6}$/.test(pin)) return fail("A PIN is exactly 6 digits, or leave it empty and we'll make one.");
    if (!edit && emailOn && !EMAIL_RX.test(shareEmail.trim())) return fail("Enter the email address to send the page to, like name@example.com.");
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
        const occasion = cfg.occasions?.find((o) => o.theme === template.theme);
        if (!occasion) return fail("This template isn't available right now. Please try another.");
        const r = await createPage({ ...body, occasionId: occasion.id, visibility, ...(visibility === "private" && pin ? { pin } : {}), ...(emailOn && shareEmail.trim() ? { shareEmail: shareEmail.trim().toLowerCase() } : {}) });
        try { localStorage.removeItem(draftKey(templateId)); } catch { /* ignore */ }
        const left = Math.max(0, cfg.credits - 1);
        setCredits(left); onPageCreated?.();
        setDone({ page: r.page, pin: r.pin, credits: left, files: staged.map((x) => x.file), email: r.email });
      }
    } catch (err) {
      fail(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return <Created template={template} page={done.page} pin={done.pin} credits={done.credits} edited={done.edited} files={done.files} email={done.email} limits={cfg.limits || { photos: 10, videos: 1, photoMb: 5, videoMb: 50 }}
      onAnother={() => { reload(); navigate(done.credits > 0 ? "/memories/app" : "/memories/app/pay"); }} />;
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
          {!edit && <div className="flex flex-col items-start gap-1.5 sm:items-end"><span className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3.5 py-1.5 text-sm font-bold text-emerald-700 shadow-sm ring-1 ring-emerald-200"><Ticket className="h-4 w-4" aria-hidden /> Uses 1 of your {cfg.credits} credit{cfg.credits === 1 ? "" : "s"}</span><span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#6b3a5a]">⏳ Online for {cfg.pageLifetimeDays || 30} days after you create it</span></div>}
        </div>
      </div>

      <form onSubmit={submit} noValidate className="mt-6 grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_300px] md:gap-8 lg:grid-cols-[minmax(0,1fr)_330px] xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-10">
        <div className="min-w-0 space-y-5">
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
              {info.expiresAt && <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 ring-1 ring-amber-200">⏳ Online until {new Date(info.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} ({info.daysLeft === 1 ? "1 day" : `${info.daysLeft} days`} left). After that the page and its files are deleted.</p>}
              <p className="mt-2 text-xs text-[#8a6a80]">Change the PIN, switch public or private, or make a new link from <Link to="/memories/app/pages" className="font-semibold text-rose-600 hover:underline">My pages</Link>.</p>
            </div>
          )}

          <EditorFields cards data={data} onData={(d) => { setData(d); setError(""); }} themeId={themeId} onTheme={setThemeId} config={{ ...builder.editor, lockNames: edit, nameWarning: !edit }} />

          {!edit && (
            <div className="rounded-[24px] border border-rose-100 bg-white p-4 text-slate-900 shadow-sm sm:p-6 lg:rounded-[28px]">
              <h3 className="mb-1 text-base font-bold">Photos and videos</h3>
              <StagedMedia staged={staged} onChange={setStaged} limits={cfg.limits || { photos: 10, videos: 1, photoMb: 5, videoMb: 50 }} />
            </div>
          )}

          {edit && (
            <div className="rounded-[24px] border border-rose-100 bg-white p-4 text-slate-900 shadow-sm sm:p-6 lg:rounded-[28px]">
              <h3 className="mb-1 text-base font-bold">Photos and videos</h3>
              <MediaManager pageId={params.id} media={media} limits={cfg.limits || { photos: 10, videos: 1, photoMb: 5, videoMb: 50 }} onChange={setMedia} />
            </div>
          )}

          <div className="space-y-5 rounded-[24px] border border-rose-100 bg-white p-4 shadow-sm sm:p-6 lg:rounded-[28px]">
            <div>
              <label className={label} htmlFor="pb-title">Page name <span className="font-medium normal-case tracking-normal text-[#c4a8b8]">(only you see this)</span></label>
              <input id="pb-title" className={field} maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={autoTitle || "Happy Birthday, Anu"} />
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
            {!edit && cfg.emailEnabled !== false && (
              <div className="rounded-2xl border border-rose-100 bg-[#fffaf6] p-3.5">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" className="mt-1 h-4 w-4 accent-rose-500" checked={emailOn} onChange={(e) => { setEmailOn(e.target.checked); setError(""); }} />
                  <span><span className="flex items-center gap-1.5 text-sm font-semibold text-[#3a1530]"><Mail className="h-4 w-4 text-rose-500" aria-hidden /> Email this page to them</span><span className="text-xs text-[#8a6a80]">We&apos;ll send the link{visibility === "private" ? " and the PIN" : ""} to their email the moment you create it, in the colours of the look you chose.</span></span>
                </label>
                {emailOn && (
                  <div className="mt-3">
                    <label className={label} htmlFor="pb-email">Their email address</label>
                    <input id="pb-email" type="email" inputMode="email" autoComplete="off" className={field} value={shareEmail} onChange={(e) => { setShareEmail(e.target.value); setError(""); }} placeholder="name@example.com" maxLength={254} />
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs text-amber-800"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Check the address. It can&apos;t be changed after you create the page. Only use the email of someone who knows you.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p ref={errRef} role="alert" className="rounded-xl bg-rose-50 p-3.5 text-sm text-rose-700 ring-1 ring-rose-200">{error}</p>}

          <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-2 rounded-2xl border border-rose-100 bg-white/95 p-3 shadow-xl shadow-rose-100/70 backdrop-blur lg:p-4">
            <Button type="submit" size="lg" loading={busy} className="flex-1 sm:flex-none">{edit ? <><Save className="h-4 w-4" aria-hidden /> Save changes</> : <><Check className="h-4 w-4" aria-hidden /> Create page (1 credit)</>}</Button>
            <Button type="button" variant="outline" size="lg" className="md:hidden" onClick={() => setSheet(true)}><Eye className="h-4 w-4" aria-hidden /> Preview</Button>
            {!edit && <button type="button" onClick={startOver} className="ml-auto inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[#8a6a80] hover:bg-rose-50"><RotateCcw className="h-4 w-4" aria-hidden /> Start over</button>}
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
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#3a1530]/50 backdrop-blur-sm md:hidden" onMouseDown={(e) => e.target === e.currentTarget && setSheet(false)}>
          <div role="dialog" aria-modal="true" aria-label="Preview" className="mem-pop-in relative w-full max-w-md rounded-t-[28px] bg-white p-4 pb-6">
            <button type="button" onClick={() => setSheet(false)} aria-label="Close preview" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-rose-50 text-[#6b3a5a]"><X className="h-5 w-5" /></button>
            <div className={cx("mx-auto w-fit rounded-[40px] bg-gradient-to-br p-4", template.tint)}><Preview template={template} data={previewData} themeId={themeId} scale={0.9} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
