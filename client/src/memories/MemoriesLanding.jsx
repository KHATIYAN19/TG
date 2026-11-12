import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowRight, Camera, Check, ChevronDown, Gift, Heart, KeyRound, Link2, Lock, Menu, Mic, Music2, Plus,
  Eye, MessageCircleHeart, Palette, PenLine, ShieldCheck, Share2, Smartphone, Sparkles, Ticket, Timer, Video, X,
} from "lucide-react";

import { logout } from "../Redux/authSlice";
import { fetchPublicInfo, formatPrice, signOutRequest } from "./api";
import { useMemoriesChrome, useReveal } from "./chrome";
import { TEMPLATES } from "./templates";
import MemoriesFooter from "./legal/MemoriesFooter";
import { useLifetimeDays } from "./legal/useLifetime";
import VoiceNote from "./VoiceNote";
import Showcase, { LivePhone, META, THEME_TOTAL, useScale } from "./Showcase";
import { Button, FONT_LINKS, Logo, cx } from "./ui";
import { trackCtaClick, trackLandingView } from "./metaTracking";
import "./memories.css";

const NAV = [["templates", "Templates"], ["how", "How it works"], ["features", "Features"], ["activity", "Activity"], ["pricing", "Pricing"], ["faq", "FAQ"]];

/* ---------------------------------------------------- header */
function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth?.token);
  const user = useSelector((s) => s.auth?.user);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const signOut = async () => {
    await signOutRequest(token);
    dispatch(logout());
    setOpen(false);
    navigate("/memories", { replace: true });
  };

  return (
    <header className={cx("fixed inset-x-0 top-0 z-50 transition-all duration-300", scrolled || open ? "bg-white/90 shadow-sm shadow-rose-100 backdrop-blur-md" : "bg-transparent")}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Sections">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="rounded-full px-3.5 py-2 text-sm font-medium text-[#6b3a5a] transition hover:bg-rose-50 hover:text-rose-600">{label}</a>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {token ? (
            <>
              <span className="mr-1 max-w-[140px] truncate text-sm text-[#6b3a5a]">Hi, {String(user?.name || "there").split(" ")[0]}</span>
              <Button variant="ghost" size="sm" onClick={signOut}>Log out</Button>
              <Button as={Link} to="/memories/app" size="sm">My pages</Button>
            </>
          ) : (
            <>
              <Button as={Link} to="/memories/login" variant="ghost" size="sm">Log in</Button>
              <Button as={Link} to="/memories/login?mode=signup" size="sm">Create a page</Button>
            </>
          )}
        </div>
        <button className="ml-auto grid h-10 w-10 place-items-center rounded-full text-[#6b3a5a] hover:bg-rose-50 lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="mem-pop-in border-t border-rose-100 bg-white px-4 pb-5 pt-2 lg:hidden">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-[15px] font-medium text-[#4a2340] hover:bg-rose-50">{label}</a>
          ))}
          <div className="mt-3 flex gap-2">
            {token ? (
              <>
                <Button variant="outline" className="flex-1" onClick={signOut}>Log out</Button>
                <Button as={Link} to="/memories/app" className="flex-1">My pages</Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/memories/login" variant="outline" className="flex-1">Log in</Button>
                <Button as={Link} to="/memories/login?mode=signup" className="flex-1">Create a page</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------------------------------------------- hero */
const HEARTS = [
  [6, 18, 14, 0], [14, 26, 20, 5], [24, 22, 12, 2], [34, 30, 18, 8], [46, 24, 14, 3], [58, 28, 22, 6],
  [68, 20, 12, 1], [78, 27, 17, 9], [88, 23, 14, 4], [95, 30, 20, 7],
];

function Hero({ priceLabel }) {
  const days = useLifetimeDays();
  const [idx, setIdx] = useState(0);
  const [tried, setTried] = useState(false); // once they tap the phone, stop switching templates under their finger
  const scale = useScale(0.86, 1.14, 1024);
  const t = TEMPLATES[idx];

  useEffect(() => {
    if (tried) return undefined;
    const id = setInterval(() => setIdx((i) => (i + 1) % TEMPLATES.length), 15000);
    return () => clearInterval(id);
  }, [tried]);

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 -z-0" aria-hidden>
        <div className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute -right-24 top-40 h-[380px] w-[380px] rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-fuchsia-200/40 blur-3xl" />
        {HEARTS.map(([left, dur, size, delay], i) => (
          <svg key={i} className="mem-rise text-rose-300/70" style={{ left: `${left}%`, width: size, height: size, animationDuration: `${dur}s`, animationDelay: `${delay}s`, "--sway": `${i % 2 ? 28 : -28}px` }} viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 5 6.3 5c2 0 3.6 1 5.7 3.3C14.1 6 15.7 5 17.7 5 21 5 23.1 8.4 21.6 11.8 19.5 16.4 12 21 12 21z" />
          </svg>
        ))}
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
        <div className="text-center lg:text-left">
          <p className="mem-reveal in mx-auto inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-rose-600 shadow-sm ring-1 ring-rose-100 lg:mx-0">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Birthdays · Proposals · Sorry · Anniversaries · Thank-yous
          </p>
          <h1 className="mem-reveal in mt-5 text-balance text-[2.5rem] font-bold leading-[1.08] tracking-tight text-[#3a1530] sm:text-5xl lg:text-[3.6rem]" style={{ "--rd": ".08s" }}>
            Say it with a page they will <span className="mem-script mem-gradient-text text-[1.12em]">never forget</span>
          </h1>
          <p className="mem-reveal in mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#7a5370] sm:text-lg lg:mx-0" style={{ "--rd": ".16s" }}>
            Pick an occasion, add your words, photos, videos and even your own voice, and send one beautiful link that stays online for {days} days. They pop balloons, mend a heart, open the ring box, climb a gratitude tree, and feel every word. The phone you see here is the real thing.
          </p>
          <div className="mem-reveal in mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start" style={{ "--rd": ".24s" }}>
            <Button as={Link} to="/memories/login?mode=signup" size="lg" className="w-full sm:w-auto">Create your page <ArrowRight className="h-4 w-4" aria-hidden /></Button>
            <Button as="a" href="#templates" variant="outline" size="lg" className="w-full sm:w-auto">Explore the templates</Button>
          </div>
          <dl className="mem-reveal in mx-auto mt-8 grid max-w-md grid-cols-3 gap-3 lg:mx-0" style={{ "--rd": ".32s" }}>
            {[[String(TEMPLATES.length), "occasions"], [String(THEME_TOTAL), "looks to pick"], ["0", "apps to install"]].map(([n, l]) => (
              <div key={l} className="rounded-2xl bg-white/80 px-3 py-3 text-center shadow-sm ring-1 ring-rose-100">
                <dt className="sr-only">{l}</dt>
                <dd className="text-2xl font-bold text-rose-600">{n}</dd>
                <dd className="text-[11px] font-medium text-[#8a6a80]">{l}</dd>
              </div>
            ))}
          </dl>
          <ul className="mem-reveal in mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[#6b3a5a] lg:justify-start" style={{ "--rd": ".4s" }}>
            {[[Lock, "Private with a PIN"], [Link2, "Your own link"], [Camera, "Photos & videos"], [Mic, "Your voice"]].map(([Icon, tx]) => (
              <li key={tx} className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-rose-500" aria-hidden /> {tx}</li>
            ))}
            {priceLabel && <li className="inline-flex items-center gap-2 font-semibold text-rose-600"><Ticket className="h-4 w-4" aria-hidden /> {priceLabel === "Free" ? "Free right now" : `From ${priceLabel}`}</li>}
          </ul>
        </div>

        {/* the REAL template, live in a phone */}
        <div className="relative mx-auto flex w-full max-w-[440px] flex-col items-center">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[60px] bg-gradient-to-br from-rose-200/70 via-orange-100/60 to-fuchsia-200/60 blur-2xl" aria-hidden />
            <div className="mem-float relative" style={{ "--d": "0s" }}>
              <LivePhone key={t.id} template={t} scale={scale} eager onTry={() => setTried(true)} />
            </div>
            <span className="absolute -left-3 top-24 hidden rotate-[-6deg] rounded-2xl bg-white px-3 py-2 text-xs font-bold text-rose-600 shadow-xl ring-1 ring-rose-100 sm:block lg:-left-10">{META[t.id].emoji} {t.name}</span>
            <span className="absolute -right-3 bottom-32 hidden rotate-[5deg] items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-xs font-bold text-emerald-600 shadow-xl ring-1 ring-emerald-100 sm:flex lg:-right-10"><Lock className="h-3.5 w-3.5" aria-hidden /> PIN protected</span>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Preview a template">
            {TEMPLATES.map((x, i) => (
              <button key={x.id} type="button" role="tab" aria-selected={i === idx} onClick={() => { setIdx(i); setTried(true); }}
                className={cx("rounded-full px-3 py-1.5 text-xs font-semibold transition", i === idx ? "bg-rose-500 text-white shadow-md shadow-rose-200" : "bg-white text-[#6b3a5a] ring-1 ring-rose-100 hover:bg-rose-50")}>
                <span aria-hidden>{META[x.id].emoji}</span> {x.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------- small shared bits */
function SectionHead({ id, kicker, title, text }) {
  return (
    <div id={id} className="mem-anchor mem-reveal mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">{kicker}</p>
      <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-[#3a1530] sm:text-4xl">{title}</h2>
      {text && <p className="mt-3 text-[#7a5370]">{text}</p>}
    </div>
  );
}

function Strip({ info }) {
  const l = info?.limits;
  const items = [
    [Camera, l ? `Up to ${l.photos} photos` : "Photos", "on every page"],
    [Video, l ? `Up to ${l.videos} videos` : "Videos", "of your favourite moments"],
    [Mic, "Your own voice", "record up to 2 minutes"],
    [KeyRound, "6-digit PIN", "to keep it private"],
    [Smartphone, "Any phone", "nothing to install"],
  ];
  return (
    <div className="relative mx-auto -mt-2 max-w-5xl px-4 sm:px-6">
      <div className="mem-reveal grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-rose-100 shadow-lg shadow-rose-100/70 md:grid-cols-5">
        {items.map(([Icon, a, b]) => (
          <div key={a} className="flex items-center gap-3 bg-white p-4 last:col-span-2 sm:p-5 md:last:col-span-1">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-500"><Icon className="h-5 w-5" aria-hidden /></span>
            <div className="min-w-0"><p className="text-sm font-bold text-[#3a1530]">{a}</p><p className="text-xs text-[#8a6a80]">{b}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------- sections */
function Templates() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <SectionHead id="templates" kicker="Templates" title="Five occasions. Every page is the real thing." text="Pick one, change its look, and try it right here. This is exactly what they will open on their phone." />
      <Showcase />
      <p className="mem-reveal mt-12 flex items-center justify-center gap-2 text-center text-sm text-[#8a6a80]"><Plus className="h-4 w-4 text-rose-400" aria-hidden /> More occasions and designs are added all the time.</p>
    </section>
  );
}

const STEPS = [
  [Heart, "Create your account", "Sign up with Google or your email in under a minute."],
  [Ticket, "Pay once, or use a code", "Pay a small one-time price per page. Got a unique code? Enter it and your page is free."],
  [Gift, "Make it yours", "Choose the occasion and a look, then fill in the names, your message, gifts, photos and videos. You see it change live."],
  [Link2, "Share the link", "Send the link on WhatsApp or anywhere. Make it private and share the PIN only with them."],
];

function HowItWorks() {
  return (
    <section className="relative bg-gradient-to-b from-white via-rose-50/60 to-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead id="how" kicker="How it works" title="From idea to link in four steps" />
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([Icon, title, text], i) => (
            <li key={title} className="mem-reveal relative rounded-3xl border border-rose-100 bg-white p-6 shadow-sm" style={{ "--rd": `${i * 0.08}s` }}>
              <span className="absolute -top-4 left-6 grid h-8 min-w-8 place-items-center rounded-full bg-gradient-to-r from-rose-500 to-orange-400 px-2 text-sm font-bold text-white shadow-md">{i + 1}</span>
              <span className="mt-2 grid h-12 w-12 place-items-center rounded-2xl bg-rose-50 text-rose-500"><Icon className="h-6 w-6" aria-hidden /></span>
              <h3 className="mt-4 text-base font-bold text-[#3a1530]">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#7a5370]">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features({ info }) {
  const l = info?.limits;
  const list = [
    [Palette, "A look for every mood", `${THEME_TOTAL} designed themes across the five occasions: candy pink to midnight, autumn harvest to starlit night. You choose, not us.`],
    [PenLine, "Written by you", "Your letter writes itself out in handwriting. Name your own gifts, reasons, promises, even the question you are asking."],
    [Gift, "Games and surprises", "Pop balloons, cut the cake, mend a heart, pull reasons from a jar, build a bouquet, climb a gratitude tree, open the ring box."],
    [Timer, "Your story, counted", "A live counter of years, days and seconds together, a timeline that draws itself and numbers that count up."],
    [Camera, "Photos and videos", l ? `Add up to ${l.photos} photos and ${l.videos} videos, up to ${l.photoMb} MB and ${l.videoMb} MB each. Pick a main photo and video to set the mood.` : "Add your best photos and videos. Pick a main photo and video to set the mood."],
    [Mic, "Your voice, as a gift", `Record a message with your microphone (up to 2 minutes) or upload one${l?.audioMb ? `, up to ${l.audioMb} MB` : ""}. It appears on the page in a velvet-and-gold player they can replay.`],
    [Share2, "Share anywhere", "Once it is made, send the link (and the PIN, if private) to WhatsApp, Telegram, Messages, email and more in one tap."],
    [Heart, "Kind to every answer", "A proposal has a celebration for yes and gentle, respectful screens for \"I need time\" and no. Thank-you pages let them reply on WhatsApp."],
    [Eye, "See what they did", "An activity screen shows when they opened it, how long they stayed, every balloon, gift and answer, and any message they send back."],
    [Music2, "Music they control", "Play a song with one tap, with a volume slider so it is never too loud."],
    [ShieldCheck, "Your files stay protected", "Photos, videos and voice messages are stored privately and only reachable through your page."],
    [Smartphone, "Perfect on every phone", "Designed phone-first, lovely on tablets and desktops. They open the link and it just works, nothing to install."],
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <SectionHead id="features" kicker="Features" title="Everything you need to make them smile" text="Simple for you to build. Unforgettable for them to open. Every field on the page is yours to fill in." />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map(([Icon, title, text], i) => (
          <div key={title} className="mem-reveal group rounded-3xl border border-rose-100 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-100" style={{ "--rd": `${(i % 3) * 0.08}s` }}>
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600 transition group-hover:scale-110"><Icon className="h-6 w-6" aria-hidden /></span>
            <h3 className="mt-4 text-base font-bold text-[#3a1530]">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-[#7a5370]">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/*
  ACTIVITY TRACKER: what the sender sees after they share the link. The screen below is a sample drawn with made-up data
  (Ravi and Emma), laid out like the real Activity screen in the app.
*/
const ACT_TILES = [["👀", "5", "times opened", "bg-sky-50 text-sky-800"], ["🧑", "2", "visitors", "bg-violet-50 text-violet-800"], ["⏱️", "4m 12s", "on the page", "bg-amber-50 text-amber-800"], ["💌", "1", "message", "bg-rose-50 text-rose-800"]];
const ACT_ROWS = [["🎁", "Opened the surprise", "Done"], ["🎈", "Balloons popped", "12"], ["🕯️", "Blew out the candles", "Done"], ["🍰", "Cut the cake", "Done"], ["🎀", "Gifts opened", "2 of 3"], ["🖼️", "Looked at your photos and videos", "5 of 6"]];
const ACT_LINE = [["Today, 8:41 pm", "Opened your page on a phone"], ["Today, 8:42 pm", "Popped 12 balloons"], ["Today, 8:44 pm", "Cut the cake"], ["Today, 8:49 pm", "Replied: “Best surprise ever, thank you!”"]];

/* a real (pretend-recording) voice card, so visitors see exactly what their person will get */
function VoiceShowcase({ info }) {
  const l = info?.limits;
  const points = [
    ["Record or upload", `Tap the microphone and speak for up to 2 minutes, or upload a file${l?.audioMb ? ` of up to ${l.audioMb} MB` : ""}.`],
    ["Sits under your photos", "On every template it appears right below the pictures and videos, like a gift waiting to be opened."],
    ["Feels special", "A glowing gold play button, a waveform they can scrub, and your name on it. Not a plain audio bar."],
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-amber-50/50 to-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
        <div>
          <p className="mem-reveal text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Voice messages</p>
          <h2 className="mem-reveal mt-3 text-balance text-3xl font-bold tracking-tight text-[#3a1530] sm:text-4xl" style={{ "--rd": ".06s" }}>Let them hear <span className="mem-script mem-gradient-text">your voice</span></h2>
          <p className="mem-reveal mt-3 max-w-md text-[#7a5370]" style={{ "--rd": ".12s" }}>Words are lovely. Your voice saying them is unforgettable. Add a voice message to any page and it shows up as a little luxury moment for them.</p>
          <ul className="mt-7 space-y-4">
            {points.map(([t, d], i) => (
              <li key={t} className="mem-reveal flex gap-3" style={{ "--rd": `${0.16 + i * 0.07}s` }}>
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600"><Check className="h-4 w-4" aria-hidden /></span>
                <p className="text-sm leading-relaxed text-[#7a5370]"><b className="text-[#3a1530]">{t}.</b> {d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="mem-reveal relative mx-auto w-full max-w-md rounded-[32px] bg-gradient-to-br from-[#2b1631] via-[#3a1c3f] to-[#1d1021] p-6 shadow-2xl shadow-rose-200/60 sm:p-8" style={{ "--rd": ".12s" }}>
          <p className="mb-5 text-center text-xs uppercase tracking-[0.3em] text-[#e3bd6a]/80">Tap play to try it</p>
          <VoiceNote inline demo from="Ravi" />
          <p className="mt-5 text-center text-xs text-white/50">A sample. Yours plays your own voice.</p>
        </div>
      </div>
    </section>
  );
}

function Activity() {
  const points = [
    ["When they opened it", "The first and latest time, how many times, and on what kind of device."],
    ["What they tried", "Balloons, candles, gifts, the ring box, the gratitude tree: each template reports its own moments."],
    ["How long they stayed", "Total time on your page, so you know they really took it in."],
    ["Their answer and replies", "A yes, a gentle \"I need time\", or the message they send back. It all lands here."],
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-sky-50/40 to-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead id="activity" kicker="Activity tracker" title="Know the moment they open it" text="After you share the link, your Activity screen fills in by itself. See what they did, step by step." />
        <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <ul className="space-y-4">
              {points.map(([t, x]) => (
                <li key={t} className="mem-reveal flex gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-sky-100 text-sky-700"><Check className="h-4 w-4" strokeWidth={3} aria-hidden /></span>
                  <div><p className="text-sm font-bold text-[#3a1530]">{t}</p><p className="mt-0.5 text-sm leading-relaxed text-[#7a5370]">{x}</p></div>
                </li>
              ))}
            </ul>
            <p className="mem-reveal mt-6 flex items-start gap-2 rounded-2xl bg-white p-4 text-xs leading-relaxed text-[#7a5370] ring-1 ring-rose-100"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden /> Only you can see it. Visitors are never asked for a name or contact details, and we don&apos;t store their IP address on your page.</p>
          </div>

          <div className="mem-reveal rounded-[28px] border border-rose-100 bg-white p-4 shadow-xl shadow-rose-100/60 sm:p-6" aria-label="Sample activity screen">
            <div className="rounded-2xl bg-gradient-to-br from-pink-100 to-orange-100 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-rose-600">Happy Birthday, Emma</p>
              <p className="mt-1 text-xl font-extrabold leading-tight text-[#3a1530] sm:text-2xl">Emma opened it 5 times 👀</p>
              <p className="mt-0.5 text-xs text-[#6b3a5a]">Last opened 12 min ago, first on 14 Nov</p>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ACT_TILES.map(([e, v, l, tone]) => <div key={l} className={cx("rounded-2xl px-2 py-3 text-center", tone)}><div className="text-base" aria-hidden>{e}</div><div className="text-lg font-extrabold leading-tight">{v}</div><div className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{l}</div></div>)}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#a07890]">What they did</p>
                <ul className="space-y-1.5">
                  {ACT_ROWS.map(([e, l, v]) => <li key={l} className="flex items-center gap-2 rounded-xl bg-[#fff7f3] px-2.5 py-2 text-xs text-[#3a1530]"><span aria-hidden>{e}</span><span className="min-w-0 flex-1 truncate">{l}</span><b className="shrink-0 text-emerald-700">{v}</b></li>)}
                </ul>
              </div>
              <div>
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#a07890]">Timeline</p>
                <ol className="space-y-2 border-l-2 border-rose-100 pl-3">
                  {ACT_LINE.map(([t, x]) => <li key={t} className="relative text-xs"><span className="absolute -left-[17px] top-1 h-2 w-2 rounded-full bg-rose-400" aria-hidden /><p className="text-[10px] font-semibold text-[#a07890]">{t}</p><p className="text-[#3a1530]">{x}</p></li>)}
                </ol>
                <p className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800"><MessageCircleHeart className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> “Best surprise ever, thank you!”</p>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] text-[#a07890]">Sample with made-up names and numbers</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  const cards = [
    {
      icon: Link2, title: "Public link", tag: "Anyone with the link",
      text: "Perfect for birthdays and shout-outs. They tap the link and your page opens straight away.",
      points: ["One unique, hard-to-guess link", "Share it on WhatsApp, Instagram or anywhere", "Switch to private at any time"],
      tone: "from-sky-50 to-white",
    },
    {
      icon: Lock, title: "Private with a PIN", tag: "Only the right person",
      text: "For the things meant for one person. They need a 6-digit PIN that only you share.",
      points: ["A PIN screen before anything is shown", "Change the PIN and everyone is locked out again", "Wrong guesses are limited to stop guessing"],
      tone: "from-rose-50 to-white",
    },
  ];
  return (
    <section className="bg-gradient-to-b from-white to-rose-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead kicker="Privacy & control" title="You decide who sees it, and for how long" text="Your link, your rules. Change your mind whenever you like." />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {cards.map((c, i) => (
            <div key={c.title} className={cx("mem-reveal rounded-[28px] border border-rose-100 bg-gradient-to-br p-7 shadow-sm", c.tone)} style={{ "--rd": `${i * 0.1}s` }}>
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-rose-500 shadow-sm"><c.icon className="h-6 w-6" aria-hidden /></span>
                <div><h3 className="text-lg font-bold text-[#3a1530]">{c.title}</h3><p className="text-xs font-semibold text-rose-500">{c.tag}</p></div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[#6b3a5a]">{c.text}</p>
              <ul className="mt-4 space-y-2">
                {c.points.map((p) => <li key={p} className="flex gap-2 text-sm text-[#4a2340]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden /> {p}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mem-reveal mt-6 grid gap-4 rounded-[28px] border border-rose-100 bg-white p-6 shadow-sm sm:grid-cols-3">
          {[["Close the link", "Turn a page off in one tap. Visitors see that it has been closed."], ["Create a new link", "Think the link got out? Make a fresh one. The old link stops working at once."], ["Edit your content", "Change the message, gifts, photos or videos while your page is online. Names are fixed once the page is created."]].map(([t, x]) => (
            <div key={t}><p className="text-sm font-bold text-[#3a1530]">{t}</p><p className="mt-1 text-sm text-[#7a5370]">{x}</p></div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ info, priceLabel }) {
  const days = info?.pageLifetimeDays ?? 30;
  const l = info?.limits;
  const included = [
    l ? `Up to ${l.photos} photos and ${l.videos} videos` : "Photos and videos",
    "A voice message of up to 2 minutes",
    "Your choice of any available template",
    "A unique link, public or PIN-protected",
    `Online for ${days} days from the day you create it`,
    "Close, reopen or replace the link anytime",
    "Edit your message and media while it is online",
    "Music, games and animations",
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <SectionHead id="pricing" kicker="Pricing" title="One simple price per page" text="No subscription. Pay once for each page you create." />
      <div className="mem-reveal mx-auto mt-12 max-w-3xl overflow-hidden rounded-[32px] border border-rose-100 bg-white shadow-xl shadow-rose-100/70">
        <div className="grid md:grid-cols-[1fr_1.2fr]">
          <div className="relative flex flex-col justify-center overflow-hidden bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 p-8 text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15" aria-hidden />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Per page</p>
            <p className="mt-2 text-5xl font-bold tracking-tight">{priceLabel || "Pay once"}</p>
            <p className="mt-1 text-sm text-white/85">{priceLabel === "Free" ? "Free right now" : priceLabel ? "one-time payment" : "the price is shown before you pay"}</p>
            <Button as={Link} to="/memories/login?mode=signup" variant="outline" size="lg" className="mt-7 w-full !text-rose-600">Create your page</Button>
          </div>
          <div className="p-8">
            <p className="text-sm font-bold text-[#3a1530]">Every page includes</p>
            <ul className="mt-4 space-y-2.5">
              {included.map((x) => <li key={x} className="flex gap-2.5 text-sm text-[#4a2340]"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" strokeWidth={3} aria-hidden /> {x}</li>)}
            </ul>
            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
              <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden />
              <p><span className="font-bold">Have a unique code?</span> Enter it after you sign up and your page is free. Pay online with UPI, cards or netbanking.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq({ info }) {
  const days = info?.pageLifetimeDays ?? 30;
  const l = info?.limits;
  const price = formatPrice(info?.price);
  const items = [
    ["How much does a page cost?", price ? `${price === "Free" ? "Pages are free right now" : `${price} per page, paid once`}. There is no subscription. If you have a unique code, your page is free.` : "You pay a small one-time price per page. If you have a unique code, your page is free. The exact price is shown before you pay."],
    ["What is a unique code?", "A special code that gives you one page without paying. If someone gave you one, sign up, enter it, and you can create your page right away. Each code can only be used a limited number of times."],
    ["Can I make my page private?", "Yes. Choose private and set a 6-digit PIN. Whoever opens your link must enter the PIN first. Public pages open straight away for anyone with the link."],
    ["What if the link gets shared with the wrong person?", "You can close the link in one tap, change the PIN, or create a completely new link. The old link stops working immediately."],
    ["How many photos and videos can I add?", l ? `Up to ${l.photos} photos (${l.photoMb} MB each) and ${l.videos} videos (${l.videoMb} MB each). You pick one main photo and one main video to open the page.` : "You can add several photos and videos, and choose a main photo and video. Exact limits are shown while you build your page."],
    ["Can I add my own voice?", l?.audioMb ? `Yes. Record up to 2 minutes with your microphone, or upload an audio file up to ${l.audioMb} MB. It shows on the page, under your photos, as a beautiful voice message they can play.` : "Yes. Record up to 2 minutes with your microphone, or upload an audio file. It shows on the page, under your photos, as a beautiful voice message they can play."],
    ["Can I try a template before I pay?", "Yes. Every template on this page is the real thing: scroll it, tap it and switch its look. Open any of them full screen to see exactly what they will see."],
    ["Is this only for couples?", "Not at all. Birthday and Thank You pages work for friends, family, mentors and colleagues. Sorry, Proposal and Anniversary are for the people closest to you."],
    ["What if they say no to my proposal?", "The page is kind about it. A yes gets a big celebration. \"I need a little time\" and \"I'm sorry, I can't\" each get a gentle, respectful screen, and they can always go back and answer again."],
    ["Can I see if they opened my page?", "Yes. Your Activity screen shows when they opened it, how many times, how long they stayed, which parts they played with (balloons, gifts, the ring box and so on), their answer and any message they send back. It is only visible to you. Visitors are never asked for a name or contact details."],
    ["I'm outside India. How do I pay?", "You can pay on Gumroad in almost any currency, with a card or PayPal. Gumroad emails you a receipt. Sign in to Memories, open Credits, enter the Order ID from the receipt and the email you paid with, and your page credits are added. Each purchase works once, for one account."],
    ["Does the other person need an account?", "No. They just open your link. If the page is private they enter the PIN. Nothing to install and nothing to sign up for."],
    ["How long does a page stay online?", `Every page is available for ${days} days from the day you create it. After ${days} days it disappears for good: the link stops working, nobody can open it (including you), and its photos, videos, replies and activity are deleted. Share it while it's live, and make a new page if you want another round.`],
    ["Can I change the names after I create a page?", "No. The name of the person it's for and your name are fixed the moment you create the page, so please check the spelling first. If a name is wrong, create a new page with the right one."],
    ["What can I change after I create a page?", `While your page is online you can edit the message, gifts, reasons, promises, photos and videos, switch between public and private, change the PIN, close or reopen the link, or make a new link. The names can't be changed, and a page can't be extended past its ${days} days.`],
    ["Is my media safe?", "Your photos, videos and voice message are stored privately. They can only be viewed through your page, and private pages stay locked behind the PIN. When a page is deleted, or reaches the end of its time, its photos and videos are removed from storage."],
    ["Can I get a refund?", "Purchases are final, so please check the live preview before you pay. The one exception is a double payment: if you are charged more than once for the same purchase, we refund the extra payment in full. Paid but no credit? We add the credit you paid for."],
    ["Which payment methods work?", "UPI, cards and netbanking through secure payment gateways. You are only charged when you confirm the payment."],
  ];
  return (
    <section className="bg-gradient-to-b from-white to-rose-50/50 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHead id="faq" kicker="FAQ" title="Questions, answered" />
        <div className="mt-10 space-y-3">
          {items.map(([q, a], i) => (
            <details key={q} className="mem-reveal group rounded-2xl border border-rose-100 bg-white px-5 py-1 shadow-sm open:shadow-md open:shadow-rose-100" style={{ "--rd": `${(i % 4) * 0.05}s` }}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-semibold text-[#3a1530] [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="h-5 w-5 shrink-0 text-rose-400 transition-transform duration-300 group-open:rotate-180" aria-hidden />
              </summary>
              <p className="pb-4 pr-8 text-sm leading-relaxed text-[#7a5370]">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="mem-reveal relative mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 px-6 py-14 text-center text-white shadow-2xl shadow-rose-300/50 sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10" aria-hidden />
        <div className="pointer-events-none absolute -bottom-14 right-10 h-56 w-56 rounded-full bg-white/10" aria-hidden />
        <Heart className="mem-beat mx-auto h-10 w-10" fill="currentColor" aria-hidden />
        <h2 className="mem-script mt-4 text-5xl leading-tight sm:text-6xl">Someone is waiting to smile</h2>
        <p className="mx-auto mt-3 max-w-xl text-white/90">Make the page. Send the link. Watch what happens next.</p>
        <Button as={Link} to="/memories/login?mode=signup" variant="outline" size="lg" className="mt-8 !text-rose-600">Create your page <ArrowRight className="h-4 w-4" aria-hidden /></Button>
      </div>
    </section>
  );
}

/* ---------------------------------------------------- page */
export default function MemoriesLanding() {
  useMemoriesChrome();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    let live = true;
    fetchPublicInfo().then((d) => live && setInfo(d)).catch(() => {}); // the page is fully usable without it
    return () => { live = false; };
  }, []);
  useReveal([info]);

  // Meta Pixel: landing view, plus a click event for every "Create a page" style button
  useEffect(() => {
    trackLandingView();
    const onClick = (e) => {
      const a = e.target instanceof Element ? e.target.closest('a[href*="mode=signup"]') : null;
      if (a) trackCtaClick(a.textContent.trim());
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const priceLabel = info ? formatPrice(info.price) : null;

  return (
    <div className="mem-root min-h-screen overflow-x-clip">
      <Helmet>
        <title>Memories: Birthday, proposal, sorry, anniversary and thank-you pages | Target Trek</title>
        <meta name="description" content="Create a beautiful interactive page for a birthday, proposal, apology, anniversary or thank-you. Pick a look, add your words, photos, videos and your own voice, then share a private or public link." />
        <link rel="canonical" href="https://www.targettrek.in/memories" />
        <meta property="og:title" content="Memories: pages they will never forget" />
        <meta property="og:description" content="Birthday, proposal, sorry, anniversary and thank-you pages with your photos and videos. Share a link or lock it with a PIN." />
        <meta name="theme-color" content="#fffaf6" />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
      </Helmet>

      <Header />
      <main>
        <Hero priceLabel={priceLabel} />
        <Strip info={info} />
        <Templates />
        <HowItWorks />
        <Features info={info} />
        <VoiceShowcase info={info} />
        <Activity />
        <Privacy />
        <Pricing info={info} priceLabel={priceLabel} />
        <Faq info={info} />
        <FinalCta />
      </main>
      <MemoriesFooter />

    </div>
  );
}
