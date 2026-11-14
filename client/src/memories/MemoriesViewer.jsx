import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Heart, Loader2, Lock, SearchX, TimerOff } from "lucide-react";

import { errCode, errMsg } from "../arena/api";
import { viewPage, unlockPage, sendAnswer, sendEvents, sendEventsOnExit, sendReply } from "./memApi";
import { setTracker } from "./track";
import { galleryFrom, voiceFrom } from "./builderConfig";
import { useMemoriesChrome } from "./chrome";
import { FONT_LINKS, Logo, cx } from "./ui";
import "./memories.css";

/*
  /memories/<code>: what the person you sent the link to opens.
    - a public page opens straight away
    - a private page asks for the 6-digit PIN FIRST. Until it is right the server sends nothing about the page (no names, no content)
    - a closed, blocked or unknown link gets a plain explanation
  The page itself is the real template, filled with what the sender wrote and their photos and videos.
*/
const TEMPLATE_PAGES = {
  birthday: lazy(() => import("./templates/birthday/BirthdayPage")),
  sorry: lazy(() => import("./templates/sorry/SorryPage")),
  anniversary: lazy(() => import("./templates/anniversary/AnniversaryPage")),
  proposal: lazy(() => import("./templates/proposal/ProposalPage")),
  thanks: lazy(() => import("./templates/thanks/ThanksPage")),
  christmas: lazy(() => import("./templates/christmas/ChristmasPage")),
};

const tokenKey = (code) => `memories:unlock:${code}`;
const readToken = (code) => { try { return sessionStorage.getItem(tokenKey(code)) || ""; } catch { return ""; } };
const saveToken = (code, t) => { try { if (t) sessionStorage.setItem(tokenKey(code), t); else sessionStorage.removeItem(tokenKey(code)); } catch { /* storage blocked */ } };

/** What the server sends -> what a template page expects. */
const toPageData = (v) => ({
  recipientName: v.recipientName, senderName: v.senderName, message: v.message || "", age: v.age,
  gifts: v.gifts || [], wishes: v.wishes || [], promises: v.promises || [], since: v.since || "", question: v.question || "", audience: v.audience || "",
  people: v.people || [], timeline: v.timeline || [], reasons: v.reasons || [], stats: v.stats || [],
  photos: [], video: null, mainPhotoId: null,
  ...(galleryFrom(v.media || []) || {}),
  ...voiceFrom(v.media),
});

const Shell = ({ children, title = "Memories" }) => (
  <div className="mem-root grid min-h-screen place-items-center bg-gradient-to-br from-[#fff3ee] via-[#fffaf6] to-[#ffeef5] px-4 py-10">
    <Helmet>
      <title>{`${title} | Memories`}</title>
      <meta name="robots" content="noindex" />
      <meta name="theme-color" content="#fffaf6" />
      {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
    </Helmet>
    <div className="w-full max-w-sm">
      {children}
      <p className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-[#a07890]">
        <Link to="/memories/terms" className="hover:underline">Terms</Link><Link to="/memories/privacy" className="hover:underline">Privacy</Link><Link to="/memories/contact" className="hover:underline">Help</Link>
      </p>
    </div>
  </div>
);

function Notice({ icon: Icon, tone, title, text }) {
  return (
    <Shell title={title}>
      <div className="rounded-[28px] border border-rose-100 bg-white p-8 text-center shadow-xl shadow-rose-100/60" role="status">
        <span className={cx("mx-auto grid h-14 w-14 place-items-center rounded-2xl", tone)}><Icon className="h-7 w-7" aria-hidden /></span>
        <h1 className="mt-4 text-xl font-bold text-[#3a1530]">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-[#7a5370]">{text}</p>
        <Link to="/memories" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:underline">Make your own page on Memories <ArrowRight className="h-4 w-4" aria-hidden /></Link>
      </div>
    </Shell>
  );
}

/* six boxes, one PIN. Pasting a whole PIN works. */
function PinGate({ onSubmit, busy, error }) {
  const [pin, setPin] = useState("");
  const input = useRef(null);
  useEffect(() => { input.current?.focus(); }, []);
  const go = (e) => { e.preventDefault(); if (pin.length === 6) onSubmit(pin); };
  const digits = Array.from({ length: 6 }, (_, i) => pin[i] || "");

  return (
    <Shell title="A private page">
      <form onSubmit={go} className="rounded-[28px] border border-rose-100 bg-white p-7 text-center shadow-xl shadow-rose-100/60" noValidate>
        <div className="flex justify-center"><Logo /></div>
        <span className="mx-auto mt-6 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600"><Lock className="h-7 w-7" aria-hidden /></span>
        <h1 className="mt-4 text-xl font-bold text-[#3a1530]">Someone made this for you</h1>
        <p className="mt-1.5 text-sm text-[#7a5370]">It&apos;s private. Enter the 6-digit PIN they gave you.</p>

        <label htmlFor="mem-pin" className="sr-only">6-digit PIN</label>
        <div className="relative mx-auto mt-6 w-fit" onClick={() => input.current?.focus()}>
          <div className="flex gap-2" aria-hidden>
            {digits.map((d, i) => (
              <span key={i} className={cx("grid h-12 w-10 place-items-center rounded-xl border-2 bg-white text-xl font-bold text-[#3a1530] transition sm:w-11", error ? "border-rose-300" : i === pin.length ? "border-rose-400 ring-4 ring-rose-100" : d ? "border-rose-200" : "border-rose-100")}>{d ? "•" : ""}</span>
            ))}
          </div>
          <input
            ref={input} id="mem-pin" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6}
            className="absolute inset-0 h-full w-full cursor-text opacity-0" aria-invalid={Boolean(error)} aria-describedby={error ? "pin-err" : undefined}
          />
        </div>

        {error && <p id="pin-err" role="alert" className="mt-4 text-sm font-medium text-rose-600">{error}</p>}
        <button type="submit" disabled={pin.length !== 6 || busy} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-rose-200 transition hover:brightness-105 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-55">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Heart className="h-5 w-5" fill="currentColor" aria-hidden />} Open
        </button>
      </form>
    </Shell>
  );
}

/* a random id for this browser, so the sender can tell "2 visitors" from "1 visitor who came twice". It is not an identity. */
const visitorId = () => {
  try {
    let v = localStorage.getItem("memories:visitor");
    if (!v) { v = Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => b.toString(16).padStart(2, "0")).join(""); localStorage.setItem("memories:visitor", v); }
    return v;
  } catch { return "anon"; }
};
const deviceKind = () => (window.innerWidth < 640 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop");
const COUNTED = new Set(["balloon_pop", "chocolate_bite"]); // many taps -> one event with a total
const LATEST = new Set(["comfort"]); // a meter -> only where it ended up

/* Collects what the receiver does and sends it in small batches. Time on the page is added when they leave. */
function createTracker(code) {
  const vid = visitorId();
  let queue = [];
  const counts = {};
  const latest = {};
  let sent = 0;
  let timer = null;
  let visibleMs = 0;
  let since = document.visibilityState === "visible" ? Date.now() : 0;
  const token = () => readToken(code);

  const collect = () => {
    const out = queue;
    queue = [];
    Object.entries(counts).forEach(([type, n]) => { if (n) out.push({ type, data: { n } }); delete counts[type]; });
    Object.entries(latest).forEach(([type, data]) => { out.push({ type, data }); delete latest[type]; });
    queue = out.slice(40); // the server takes 40 at a time: the rest goes with the next batch instead of being dropped
    return out.slice(0, 40);
  };
  const flush = () => { clearTimeout(timer); timer = null; const events = collect(); if (events.length) sendEvents(code, vid, events, token()).catch(() => {}); if (queue.length) schedule(); };
  const schedule = () => { if (!timer) timer = setTimeout(flush, 2500); };

  const track = (type, data) => {
    if (sent > 400) return; // enough is enough
    sent += 1;
    if (COUNTED.has(type)) counts[type] = (counts[type] || 0) + 1;
    else if (LATEST.has(type)) latest[type] = data || {};
    else queue.push({ type, data: data || {} });
    schedule();
  };

  const onVis = () => {
    if (document.visibilityState === "hidden") {
      if (since) { visibleMs += Date.now() - since; since = 0; }
      const events = collect();
      if (visibleMs > 1000) events.push({ type: "time_spent", data: { secs: Math.round(visibleMs / 1000) } });
      visibleMs = 0;
      if (events.length) sendEventsOnExit(code, vid, events, token());
    } else since = Date.now();
  };
  document.addEventListener("visibilitychange", onVis);
  window.addEventListener("pagehide", onVis);
  return { vid, track, stop: () => { document.removeEventListener("visibilitychange", onVis); window.removeEventListener("pagehide", onVis); flush(); } };
}

export default function MemoriesViewer() {
  useMemoriesChrome();
  const { code } = useParams();
  const [state, setState] = useState({ kind: "loading" }); // loading | pin | ready | missing | closed | error
  const [busy, setBusy] = useState(false);
  const [pinError, setPinError] = useState("");
  const [response, setResponse] = useState({ answer: null, replies: [] });
  const tracker = useRef(null);

  const load = useCallback(async () => {
    try {
      const v = await viewPage(code, readToken(code));
      setResponse(v.response || { answer: null, replies: [] });
      setState({ kind: "ready", view: v });
    } catch (e) {
      const status = e?.response?.status;
      const c = errCode(e);
      if (status === 401 && c === "PIN_REQUIRED") { saveToken(code, ""); setState({ kind: "pin" }); }
      else if (status === 404) setState({ kind: "missing" });
      else if (status === 410) setState({ kind: "closed", blocked: c === "PAGE_BLOCKED", expired: c === "PAGE_EXPIRED" });
      else setState({ kind: "error", message: errMsg(e) });
    }
  }, [code]);

  useEffect(() => { setState({ kind: "loading" }); load(); }, [load]);

  // once the page is showing, start reporting what the receiver does (and say they opened it)
  const ready = state.kind === "ready";
  useEffect(() => {
    if (!ready) return undefined;
    const t = createTracker(code);
    tracker.current = t;
    setTracker(t.track);
    t.track("open", { device: deviceKind() });
    return () => { setTracker(null); t.stop(); tracker.current = null; };
  }, [ready, code]);

  /* the receiver's answer and replies go to the server; the server decides (a yes or no, once given, is final) */
  const onAnswer = useCallback(async (value) => {
    const r = await sendAnswer(code, value, tracker.current?.vid || visitorId(), readToken(code));
    setResponse((prev) => ({ ...prev, answer: r.answer }));
    return r;
  }, [code]);
  const onReply = useCallback(async (text) => {
    const r = await sendReply(code, text, tracker.current?.vid || visitorId(), readToken(code));
    setResponse((prev) => ({ ...prev, replies: r.replies }));
    return r;
  }, [code]);

  const unlock = async (pin) => {
    setBusy(true); setPinError("");
    try {
      const { token } = await unlockPage(code, pin);
      saveToken(code, token);
      await load();
    } catch (e) {
      setPinError(e?.response?.status === 401 ? "That PIN isn't right. Check it and try again." : e?.response?.status === 429 ? "Too many tries. Please wait a few minutes and try again." : errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (state.kind === "loading") return <Shell><div className="grid place-items-center py-24 text-[#7a5370]" role="status"><Loader2 className="h-7 w-7 animate-spin text-rose-400" aria-label="Opening" /></div></Shell>;
  if (state.kind === "pin") return <PinGate onSubmit={unlock} busy={busy} error={pinError} />;
  if (state.kind === "missing") return <Notice icon={SearchX} tone="bg-slate-100 text-slate-500" title="We couldn't find this page" text="The link may be mistyped, or the person who made it created a new one. Ask them to send it again." />;
  if (state.kind === "closed" && state.expired) return <Notice icon={TimerOff} tone="bg-amber-50 text-amber-600" title="This page has expired" text="Memories pages stay online for a limited time, and this one has reached the end. It has been removed. You can ask the person who sent it to make you a new one." />;
  if (state.kind === "closed") return <Notice icon={TimerOff} tone="bg-amber-50 text-amber-600" title={state.blocked ? "This page isn't available" : "This page is closed"} text={state.blocked ? "It has been taken down." : "The person who made it has turned it off for now. They can open it again whenever they like."} />;
  if (state.kind === "error") return <Notice icon={SearchX} tone="bg-rose-50 text-rose-500" title="Something went wrong" text={`${state.message} Please refresh to try again.`} />;

  const v = state.view;
  const Page = TEMPLATE_PAGES[v.theme];
  if (!Page) return <Notice icon={SearchX} tone="bg-slate-100 text-slate-500" title="This page can't be shown" text="Its design isn't available right now." />;
  return (
    <Suspense fallback={<Shell><div className="grid place-items-center py-24" role="status"><Loader2 className="h-7 w-7 animate-spin text-rose-400" aria-label="Opening" /></div></Shell>}>
      <Page data={toPageData(v)} theme={v.style || undefined} response={response} onAnswer={onAnswer} onReply={onReply} />
    </Suspense>
  );
}
