import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  ArrowDown, ArrowRight, ArrowsClockwise, ChatCircleDots, Check, Confetti, Eye, Gift, HandHeart, Heart, Images,
  LockKey, Microphone, MusicNotes, PaperPlaneTilt, PencilSimpleLine, Plus, ShareNetwork, ShieldCheck, Sparkle, Timer, Users,
} from "@phosphor-icons/react";

import { logout } from "../Redux/authSlice";
import { fetchPublicInfo, formatPrice, signOutRequest } from "./api";
import { useMemoriesChrome, useReveal } from "./chrome";
import { TEMPLATES, TemplateScene } from "./templates";
import MemoriesFooter from "./legal/MemoriesFooter";
import { useLifetimeDays } from "./legal/useLifetime";
import VoiceNote from "./VoiceNote";
import { LivePhone, THEME_TOTAL, useScale } from "./Showcase";
import { FONT_LINKS, Logo, cx } from "./ui";
import { trackCtaClick, trackLandingView } from "./metaTracking";
import PricingSection, { TaglineReveal } from "./LandingPricing";
import { LookWall, TemplateStory } from "./LandingTemplates";
import { Btn, OCCASION, SIGNUP, SectionHead, useNear, useStickyFix } from "./landingUi";
import { secLabel } from "./pricing";
import "./memories.css";
import "./landing.css";

const NAV = [["templates", "Templates"], ["looks", "Looks"], ["how", "How it works"], ["features", "Features"], ["pricing", "Pricing"], ["faq", "FAQ"]];

/* which section is on screen, for the highlighted link in the navigation */
function useSpy(ids) {
  const [on, setOn] = useState(null);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) setOn(e.target.id); }), { rootMargin: "-20% 0px -70% 0px" });
    ids.forEach((id) => { const n = document.getElementById(id); if (n) io.observe(n); });
    return () => io.disconnect();
  }, [ids]);
  return on;
}
const SPY_IDS = NAV.map(([id]) => id);

/* a thin line across the top that fills as the page is read (one scroll listener, throttled to a frame) */
function Progress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current) ref.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(paint); };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="ml-progress" aria-hidden />;
}

/* ---------------------------------------------------- navigation: a floating pill, and a full height menu on phones */
function Header() {
  const [open, setOpen] = useState(false);
  const current = useSpy(SPY_IDS);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((s) => s.auth?.token);
  const user = useSelector((s) => s.auth?.user);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", esc);
    return () => { document.documentElement.style.overflow = ""; window.removeEventListener("keydown", esc); };
  }, [open]);

  const signOut = async () => {
    await signOutRequest(token);
    dispatch(logout());
    setOpen(false);
    navigate("/memories", { replace: true });
  };

  return (
    <>
      <header className="fixed inset-x-0 top-3 z-50 px-3">
        <div className="ml-nav mx-auto flex w-full max-w-md items-center gap-2 rounded-full p-2 pl-4 lg:w-fit lg:max-w-none">
          <Logo />
          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Sections">
            {NAV.map(([id, label]) => <a key={id} href={`#${id}`} aria-current={current === id ? "true" : undefined} className="ml-nav-link title-4">{label}</a>)}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-4">
            {token ? (
              <>
                <button type="button" onClick={signOut} className="ml-nav-link title-4 hidden lg:block">Log out</button>
                <Btn to="/memories/app" size="sm">My pages</Btn>
              </>
            ) : (
              <>
                <span className="hidden lg:block"><Btn to="/memories/login" variant="ghost" size="sm">Log in</Btn></span>
                <Btn to={SIGNUP} size="sm">Create a page</Btn>
              </>
            )}
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-[#2a1023] transition-colors duration-300 hover:bg-rose-50 lg:hidden" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="ml-menu" aria-label={open ? "Close menu" : "Open menu"}>
              <span className={cx("ml-burger", open && "open")} aria-hidden><i /><i /></span>
            </button>
          </div>
        </div>
      </header>

      <div id="ml-menu" className={cx("ml-menu fixed inset-0 z-40 flex flex-col overflow-y-auto px-6 pb-8 pt-24 lg:hidden", open && "open")} aria-hidden={!open}>
        <nav className="flex flex-col" aria-label="Sections">
          {NAV.map(([id, label], i) => (
            <a key={id} href={`#${id}`} tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} style={{ "--i": i }} className="ml-menu-item heading-5 flex items-center justify-between rounded-2xl px-3 py-3 text-[#2a1023] transition-colors duration-300 hover:bg-rose-50">
              {label} <ArrowRight size={20} className="text-[#e11d48]" aria-hidden />
            </a>
          ))}
        </nav>
        <div className="ml-menu-item mt-auto flex flex-col gap-3 pt-8" style={{ "--i": NAV.length }}>
          {token ? (
            <>
              <p className="body-6 text-center text-[#7a5370]">Signed in as {String(user?.name || "you").split(" ")[0]}</p>
              <Btn to="/memories/app" tabIndex={open ? 0 : -1}>My pages</Btn>
              <Btn variant="ghost" onClick={signOut} tabIndex={open ? 0 : -1}>Log out</Btn>
            </>
          ) : (
            <>
              <Btn to={SIGNUP} tabIndex={open ? 0 : -1}>Create your page <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
              <Btn to="/memories/login" variant="ghost" tabIndex={open ? 0 : -1}>Log in</Btn>
            </>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------- hero */
const DRIFT = [[4, 16, 14, 0], [13, 22, 20, 5], [24, 19, 12, 2], [37, 26, 16, 8], [63, 24, 14, 3], [76, 20, 20, 6], [87, 17, 12, 1], [95, 25, 16, 9]];

function Hero({ priceLabel }) {
  const days = useLifetimeDays();
  const [idx, setIdx] = useState(0);
  const [tried, setTried] = useState(false); // once they touch a phone, stop switching templates under their finger
  const scale = useScale(0.82, 1, 640);
  const stage = useRef(null);
  const near = useNear(stage, "300px");
  const w = 280 * scale;
  const h = 580 * scale;
  const n = TEMPLATES.length;

  useEffect(() => {
    if (tried || !near) return undefined;
    const id = setInterval(() => setIdx((i) => (i + 1) % n), 15000);
    return () => clearInterval(id);
  }, [tried, near, n]);

  const pick = (i) => { setIdx(i); setTried(true); };
  const proof = [`${n} occasions`, `${THEME_TOTAL} looks`, "Nothing to install", `Online for ${days} days`];

  return (
    <section className="relative overflow-hidden pt-28 sm:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px]" aria-hidden>
        {DRIFT.map(([left, dur, size, delay], i) => (
          <Heart key={i} weight="fill" className="ml-drift text-rose-200" size={size} style={{ left: `${left}%`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }} />
        ))}
      </div>

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
        <p className="mem-reveal in caption-3 mx-auto inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[#be123c] ring-1 ring-[#f5dfe4]">
          <Sparkle size={14} weight="fill" aria-hidden /> Birthdays · Proposals · Apologies · Anniversaries · Thank yous
        </p>
        <h1 className="ml-hero-title mem-reveal in heading-1 mx-auto mt-6 max-w-[680px] pb-1" style={{ "--rd": ".08s" }}>
          Say it with a page<br className="hidden sm:block" /> they will never forget
        </h1>
        <p className="mem-reveal in body-3 mx-auto mt-4 max-w-[680px] text-[#7a5370] sm:text-lg sm:leading-7" style={{ "--rd": ".16s" }}>
          Pick an occasion, add your words, photos and your own voice, then send one link. They pop the balloons, mend a heart or open the ring box, and feel every word.
        </p>
        <div id="ml-hero-cta" className="mem-reveal in mt-8 flex flex-col items-center gap-3" style={{ "--rd": ".24s" }}>
          <Btn to={SIGNUP} className="w-full max-w-xs sm:w-auto">Create your page <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
          {priceLabel && <p className="caption-4 text-[#7a5370]">{priceLabel === "Free" ? "Free right now." : `From ${priceLabel}, paid once.`} No subscription.</p>}
        </div>
        <ul className="mem-reveal in mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2" style={{ "--rd": ".32s" }}>
          {proof.map((p) => <li key={p} className="caption-4 inline-flex items-center gap-1 text-[#6b3a5a]"><Check size={12} weight="bold" className="text-[#e11d48]" aria-hidden /> {p}</li>)}
        </ul>
      </div>

      {/* five phones: the middle one is the REAL template, the others are tap targets that bring theirs to the middle */}
      <div ref={stage} className="ml-fan mem-reveal in mx-auto mt-12 max-w-6xl" style={{ height: h + 72, "--rd": ".4s" }}>
        {TEMPLATES.map((t, i) => {
          const o = ((i - idx + n + 2) % n) - 2; // -2 .. 2, how far this phone sits from the middle
          const a = Math.abs(o);
          return (
            <div key={t.id} className="ml-fan-slot" data-a={a} style={{ "--o": o, "--a": a, width: w, height: h, marginLeft: -w / 2, zIndex: 3 - a }}>
              {a === 0 ? (
                near ? <LivePhone template={t} scale={scale} eager onTry={() => setTried(true)} /> : <TemplateScene theme={t.theme} scale={scale} />
              ) : (
                <button type="button" onClick={() => pick(i)} className="ml-fan-side relative text-left" aria-label={`Show the ${t.name} template`}>
                  <span className="ml-bob block" style={{ "--d": `${i * 0.7}s` }}><TemplateScene theme={t.theme} scale={scale} /></span>
                  <span className="ml-fan-veil" aria-hidden />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="relative mx-auto mt-2 flex max-w-6xl gap-2 overflow-x-auto px-4 pb-12 sm:justify-center sm:px-6" role="tablist" aria-label="Preview a template">
        {TEMPLATES.map((t, i) => {
          const Ic = OCCASION[t.id].Icon;
          return (
            <button key={t.id} type="button" role="tab" aria-selected={i === idx} onClick={() => pick(i)}
              className={cx("ml-chip caption-3 inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2", i === idx ? "bg-[#2a1023] text-white" : "bg-white text-[#6b3a5a] ring-1 ring-inset ring-[#f5dfe4]")}>
              <Ic size={16} weight={i === idx ? "fill" : "regular"} aria-hidden /> {t.name}
            </button>
          );
        })}
      </div>
      <p className="caption-4 -mt-8 flex items-center justify-center gap-1 pb-12 text-[#8a6a80]"><ArrowDown size={12} weight="bold" aria-hidden /> The middle phone is live. Tap it.</p>
    </section>
  );
}

/* ---------------------------------------------------- a strip of the moments inside the pages */
const MOMENTS = ["Pop the balloons", "Cut the cake", "Mend a broken heart", "Open the ring box", "Pull a reason from the love jar", "Build a bouquet", "Climb the gratitude tree", "Clink a champagne toast", "Unwrap a gift", "Read a letter in handwriting"];

function Moments() {
  const group = (hidden) => (
    <div className="ml-marquee-group" aria-hidden={hidden || undefined}>
      {MOMENTS.map((m) => <span key={m} className="title-2 mr-8 inline-flex items-center gap-8 whitespace-nowrap text-white">{m} <Sparkle size={16} weight="fill" className="text-[#fb7185]" aria-hidden /></span>)}
    </div>
  );
  return (
    <div className="ml-marquee bg-[#2a1023] py-4" style={{ "--dur": "48s" }} aria-label="Things they get to do on your page">
      <div className="ml-marquee-track">{group(false)}{group(true)}</div>
    </div>
  );
}

/* ---------------------------------------------------- how it works */
const STEPS = [
  [Gift, "Pick an occasion and a look", "Sign up with Google or your email, choose a template and the look that fits them. The price is on screen before you pay, and a unique code makes your page free."],
  [PencilSimpleLine, "Make it yours", "Fill in the names, your letter, the gifts, your photos, videos and a voice message. The page changes live as you type."],
  [PaperPlaneTilt, "Send one link", "Share it on WhatsApp or anywhere. Keep it private with a PIN, then watch your Activity screen fill in when they open it."],
];

function HowItWorks() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead id="how" kicker="How it works" title="From idea to link in three steps" text="Most people finish their page in one sitting." />
        <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map(([Icon, title, text], i) => (
            <li key={title} className="mem-reveal" style={{ "--rd": `${i * 0.12}s` }}>
              <div className="ml-card h-full rounded-3xl bg-[#fffaf6] p-6 ring-1 ring-[#f5dfe4] sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="ml-card-icon grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e11d48] text-white"><Icon size={24} weight="duotone" aria-hidden /></span>
                  <span className="ml-rule block h-0.5 flex-1 rounded-full bg-[#fecdd3]" aria-hidden />
                  <span className="text-5xl font-semibold leading-none tabular-nums text-[#fecdd3]" aria-hidden>{i + 1}</span>
                </div>
                <h3 className="heading-6 mt-6 text-[#2a1023]">{title}</h3>
                <p className="body-6 mt-2 text-[#7a5370]">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------------------------------------------- features, as a bento grid */
const ACT_TILES = [[Eye, "5", "times opened"], [Users, "2", "visitors"], [Timer, "4m 12s", "on the page"], [ChatCircleDots, "1", "message"]];
const ACT_LINE = [["8:41 pm", "Opened your page on a phone"], ["8:42 pm", "Popped 12 balloons"], ["8:44 pm", "Cut the cake"], ["8:49 pm", "Replied: “Best surprise ever, thank you!”"]];
const PLAY = ["Pop balloons", "Cut the cake", "Mend a heart", "Open the ring box"];

function Cell({ className, children, delay = 0, dark = false }) {
  return (
    <div className={cx("mem-reveal", className)} style={{ "--rd": `${delay}s` }}>
      <div className={cx("ml-card flex h-full flex-col rounded-3xl p-6 sm:p-8", dark ? "ml-dark bg-[#1f1f1f]" : "bg-white ring-1 ring-[#f5dfe4]")}>{children}</div>
    </div>
  );
}
const CellHead = ({ Icon, kicker, title, text, dark }) => (
  <>
    <p className={cx("caption-3 inline-flex items-center gap-2", dark ? "text-[#fda4af]" : "text-[#be123c]")}><Icon size={16} weight="duotone" aria-hidden /> {kicker}</p>
    <h3 className={cx("heading-6 mt-3", dark ? "text-white" : "text-[#2a1023]")}>{title}</h3>
    <p className={cx("body-6 mt-2", dark ? "text-[#9b9b9b]" : "text-[#7a5370]")}>{text}</p>
  </>
);

function Features({ info }) {
  const l = info?.limits;
  const small = [
    [ShareNetwork, "Share anywhere", "Send the link, and the PIN if it is private, to WhatsApp, Telegram, Messages or email in one tap."],
    [HandHeart, "Kind to every answer", "A proposal celebrates a yes and has gentle, respectful screens for “I need time” and for no."],
    [ArrowsClockwise, "Change it any time", "Edit the letter, gifts and photos while the page is online. Close the link or make a fresh one in a tap."],
    [MusicNotes, "Music they control", "A song starts with one tap and comes with a volume slider, so it is never too loud."],
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
      <SectionHead id="features" kicker="Features" title="Simple for you to build. Hard for them to forget." text="Every field on the page is yours to fill in, and everything they do on it comes back to you." />

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-6">
        {/* your voice */}
        <Cell dark className="lg:col-span-3">
          <CellHead dark Icon={Microphone} kicker="Voice message" title="Let them hear it in your voice" text={`Record with your microphone${l?.audioSec ? ` for up to ${secLabel(l.audioSec)}` : ""}, or upload a file. It waits under your photos as a gold player they can replay.`} />
          <div className="mt-6 flex flex-1 flex-col justify-center">
            <VoiceNote inline demo from="James" />
            <p className="caption-5 mt-3 text-center text-[#9b9b9b]">A sample. Tap play to try it. Yours plays your own voice.</p>
          </div>
        </Cell>

        {/* activity */}
        <Cell className="lg:col-span-3" delay={0.08}>
          <CellHead Icon={Eye} kicker="Activity tracker" title="Know the moment they open it" text="When they opened it, how long they stayed, every balloon, gift and answer, and any message they send back. Only you can see it." />
          <div className="mt-6 rounded-2xl bg-[#fffaf6] p-4" aria-label="Sample activity screen">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {ACT_TILES.map(([Icon, v, label]) => (
                <div key={label} className="rounded-lg bg-white p-3 text-center ring-1 ring-[#f5dfe4]">
                  <Icon size={16} weight="duotone" className="mx-auto text-[#e11d48]" aria-hidden />
                  <p className="body-1 mt-1 tabular-nums text-[#2a1023]">{v}</p>
                  <p className="caption-5 text-[#8a6a80]">{label}</p>
                </div>
              ))}
            </div>
            <ol className="mt-4 space-y-2">
              {ACT_LINE.map(([time, what]) => (
                <li key={time} className="flex items-center gap-3 rounded-lg bg-white px-3 py-2 ring-1 ring-[#f5dfe4]">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#e11d48]" aria-hidden />
                  <span className="caption-4 min-w-0 flex-1 truncate text-[#2a1023]">{what}</span>
                  <span className="caption-5 shrink-0 tabular-nums text-[#a07890]">{time}</span>
                </li>
              ))}
            </ol>
            <p className="caption-5 mt-3 text-center text-[#a07890]">Sample with made up names and numbers</p>
          </div>
        </Cell>

        {/* private with a PIN */}
        <Cell className="lg:col-span-2">
          <div className="ml-pin mb-6 flex justify-center gap-2 rounded-2xl bg-[#ecfdf5] p-6" aria-hidden>
            {[0, 1, 2, 3, 4, 5].map((i) => <span key={i} className="grid h-10 w-8 place-items-center rounded-lg bg-white ring-1 ring-emerald-200"><i className="block h-2 w-2 rounded-full bg-emerald-600" style={{ "--i": i }} /></span>)}
          </div>
          <CellHead Icon={LockKey} kicker="Private or public" title="Only the right person gets in" text="Lock a page with a 6 digit PIN that only you share, or leave it open for anyone with the link. Wrong guesses are limited, and you can change the PIN whenever you like." />
        </Cell>

        {/* photos and videos */}
        <Cell className="lg:col-span-2" delay={0.08}>
          <div className="ml-photos mb-6 flex h-[88px] items-center justify-center rounded-2xl bg-[#fff1f3]" aria-hidden>
            <i className="-mr-4 block h-14 w-12 -rotate-6 rounded-lg bg-[#fda4af] ring-2 ring-white" />
            <i className="relative z-10 grid h-16 w-14 place-items-center rounded-lg bg-[#e11d48] text-white ring-2 ring-white"><Images size={24} weight="duotone" /></i>
            <i className="-ml-4 block h-14 w-12 rotate-6 rounded-lg bg-[#fdba74] ring-2 ring-white" />
          </div>
          <CellHead Icon={Images} kicker="Photos and videos" title="Your best moments, all in one place" text={l ? `Add up to ${l.photos} photos and ${l.videos} video${l.videos === 1 ? "" : "s"}, each up to ${secLabel(l.videoSec || 60)} long. Need more room? Buy a small add on only when you reach the limit.` : "Add your best photos and videos, and pick a main photo and video to set the mood."} />
        </Cell>

        {/* games and surprises */}
        <Cell className="lg:col-span-2" delay={0.16}>
          <div className="mb-6 flex h-[88px] flex-wrap content-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#fef3c7] p-3" aria-hidden>
            {PLAY.map((p) => <span key={p} className="ml-chip caption-4 rounded-full bg-white px-2 py-1 text-[#92400e]">{p}</span>)}
          </div>
          <CellHead Icon={Confetti} kicker="Games and surprises" title="A page they play with, not just read" text="Every occasion has its own moments to tap, drag and open, plus a live counter of your time together and a letter that writes itself out." />
        </Cell>
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {small.map(([Icon, title, text], i) => (
          <li key={title} className="mem-reveal" style={{ "--rd": `${i * 0.08}s` }}>
            <div className="ml-card h-full rounded-3xl bg-white p-6 ring-1 ring-[#f5dfe4]">
              <span className="ml-card-icon grid h-10 w-10 place-items-center rounded-xl bg-[#fff1f3] text-[#e11d48]"><Icon size={20} weight="duotone" aria-hidden /></span>
              <h3 className="body-1 mt-4 text-[#2a1023]">{title}</h3>
              <p className="body-6 mt-1 text-[#7a5370]">{text}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mem-reveal body-6 mx-auto mt-6 flex max-w-[680px] items-start justify-center gap-2 text-center text-[#7a5370]"><ShieldCheck size={20} weight="duotone" className="shrink-0 text-emerald-600" aria-hidden /> Photos, videos and voice messages are stored privately and only reachable through your page. Visitors are never asked for a name or contact details.</p>
    </section>
  );
}

/* ---------------------------------------------------- FAQ */
const FAQ_FIRST = 8;

function Faq({ info }) {
  const [all, setAll] = useState(false);
  const days = info?.pageLifetimeDays ?? 30;
  const l = info?.limits;
  const price = formatPrice(info?.price);
  // the add-ons on sale right now, with the admin's own prices
  const list = info?.addons || [];
  const addonText = list.length
    ? `Yes. You can buy extra room as add ons while you build, or later from your page: ${list.map((a) => `${a.name.toLowerCase()} (+${a.unit} ${a.unitLabel}, ${formatPrice(a.price)} a pack)`).join("; ")}. Pay only for what you need.`
    : "Every page comes with the photos, videos, voice message and letter length shown on this page. Extra room is not on sale at the moment.";
  const items = [
    ["How much does a page cost?", price ? `${info?.priceTo > info?.price ? `Pages start from ${price}` : price === "Free" ? "Pages are free right now" : `${price} per page`}, paid once. Each template and look has its own price, shown on this page and again before you pay. There is no subscription. If you have a unique code, your page is free.` : "You pay a small one time price per page. Each template and look has its own price, shown before you pay. If you have a unique code, your page is free."],
    ["Can I try a template before I pay?", "Yes. Every template on this page is the real thing: scroll it, tap it and switch its look. Open any of them full screen to see exactly what they will see."],
    ["Does the other person need an account?", "No. They just open your link. If the page is private they enter the PIN. Nothing to install and nothing to sign up for."],
    ["Can I make my page private?", "Yes. Choose private and set a 6 digit PIN. Whoever opens your link must enter the PIN first. Public pages open straight away for anyone with the link."],
    ["How long does a page stay online?", `Every page is available for ${days} days from the day you create it. After ${days} days it disappears for good: the link stops working, nobody can open it (including you), and its photos, videos, replies and activity are deleted. Share it while it's live, and make a new page if you want another round.`],
    ["Can I see if they opened my page?", "Yes. Your Activity screen shows when they opened it, how many times, how long they stayed, which parts they played with (balloons, gifts, the ring box and so on), their answer and any message they send back. It is only visible to you. Visitors are never asked for a name or contact details."],
    ["Can I get a refund?", "Every purchase is final and not refundable. The only exception is a double payment: if the same purchase is charged to you more than once, email supporttargettrek@gmail.com and we refund the extra payment. Deleting a page gives no refund and no new page, so please check the live preview and the names before you pay. Names and the email address can't be changed after a page is created. Paid but nothing arrived? We deliver what you paid for."],
    ["Which payment methods work?", "UPI, cards and netbanking through secure payment gateways. You are only charged when you confirm the payment."],
    ["I'm outside India. How do I pay?", "You can pay on Gumroad in almost any currency, with a card or PayPal. Gumroad emails you a receipt. Sign in to Memories, open Redeem, enter the Order ID from the receipt and the email you paid with, and your pages are added. Each purchase works once, for one account."],
    ["Can I get more photos, longer videos or a longer letter?", addonText],
    ["What is a unique code?", "A special code that gives you one page without paying. If someone gave you one, sign up, enter it, and you can create your page right away. Each code can only be used a limited number of times."],
    ["What if the link gets shared with the wrong person?", "You can close the link in one tap, change the PIN, or create a completely new link. The old link stops working immediately."],
    ["How many photos and videos can I add?", l ? `Up to ${l.photos} photos (${l.photoMb} MB each) and ${l.videos} video${l.videos === 1 ? "" : "s"} (${l.videoMb} MB and ${secLabel(l.videoSec || 60)} each). You pick one main photo and one main video to open the page. The exact numbers for each template are in the pricing section, and you can buy more room with an add on.` : "You can add several photos and videos, and choose a main photo and video. Exact limits are shown while you build your page."],
    ["Can I add my own voice?", l?.audioMb ? `Yes. Record up to ${secLabel(l.audioSec || 120)} with your microphone, or upload an audio file up to ${l.audioMb} MB. It shows on the page, under your photos, as a beautiful voice message they can play. A longer or bigger one is available as an add on.` : "Yes. Record with your microphone, or upload an audio file. It shows on the page, under your photos, as a beautiful voice message they can play."],
    ["Is this only for couples?", "Not at all. Birthday and Thank You pages work for friends, family, mentors and colleagues. Sorry, Proposal and Anniversary are for the people closest to you."],
    ["What if they say no to my proposal?", "The page is kind about it. A yes gets a big celebration. \"I need a little time\" and \"I'm sorry, I can't\" each get a gentle, respectful screen, and they can always go back and answer again."],
    ["Can I change the names after I create a page?", "No. The name of the person it's for and your name are fixed the moment you create the page, so please check the spelling first. If a name is wrong, create a new page with the right one."],
    ["What can I change after I create a page?", `While your page is online you can edit the message, gifts, reasons, promises, photos and videos, switch between public and private, change the PIN, close or reopen the link, or make a new link. You can switch to any look at the price you paid or less. The names can't be changed. A page stays online for ${days} days unless you buy the extra days add on.`],
    ["Is my media safe?", "Your photos, videos and voice message are stored privately. They can only be viewed through your page, and private pages stay locked behind the PIN. When a page is deleted, or reaches the end of its time, its photos and videos are removed from storage."],
  ];
  const shown = all ? items : items.slice(0, FAQ_FIRST);

  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div id="faq" className="mem-anchor mem-reveal lg:sticky lg:top-28 lg:self-start">
          <p className="ml-kicker caption-3">FAQ</p>
          <h2 className="heading-2 mt-3 text-[#2a1023]">Questions, answered</h2>
          <p className="body-3 mt-4 text-[#7a5370]">Everything people ask before they make their first page. Still unsure about something?</p>
          <Btn to="/memories/contact" variant="ghost" className="mt-6">Ask us directly <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
        </div>
        <div>
          <div className="space-y-3">
            {shown.map(([q, a], i) => (
              <details key={q} className="ml-faq mem-reveal rounded-2xl bg-[#fffaf6] px-4 ring-1 ring-[#f5dfe4] sm:px-6" style={{ "--rd": `${(i % 4) * 0.05}s` }}>
                <summary className="body-1 flex cursor-pointer items-center justify-between gap-4 rounded-lg py-4 text-[#2a1023]">
                  {q}
                  <span className="ml-faq-plus grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#e11d48] ring-1 ring-[#f5dfe4]"><Plus size={14} weight="bold" aria-hidden /></span>
                </summary>
                <p className="ml-faq-a body-6 pb-4 pr-8 text-[#7a5370]">{a}</p>
              </details>
            ))}
          </div>
          {!all && <div className="mt-6 text-center"><Btn variant="ghost" onClick={() => setAll(true)}>Show all {items.length} questions <Plus size={16} weight="bold" aria-hidden /></Btn></div>}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------- final call */
function FinalCta({ priceLabel }) {
  return (
    <section id="ml-final" className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mem-reveal relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[#e11d48] px-6 py-16 text-center text-white sm:px-12 sm:py-24">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {DRIFT.map(([left, dur, size, delay], i) => (
            <Heart key={i} weight="fill" className="ml-drift text-[#fb7185]" size={size + 8} style={{ left: `${left}%`, animationDuration: `${dur * 0.7}s`, animationDelay: `${delay * 0.6}s` }} />
          ))}
        </div>
        <div className="relative">
          <Heart size={40} weight="fill" className="mem-beat mx-auto" aria-hidden />
          <h2 className="heading-1 mx-auto mt-6 max-w-[680px]">Someone is waiting<br className="hidden sm:block" /> to smile</h2>
          <p className="body-3 mx-auto mt-4 max-w-[680px] text-rose-100">Make the page. Send the link. Watch what happens next.</p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Btn to={SIGNUP} variant="light" className="w-full max-w-xs sm:w-auto">Create your page <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
            <p className="caption-4 text-rose-100">{priceLabel && priceLabel !== "Free" ? `From ${priceLabel}, paid once. ` : ""}Try every template before you pay.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* on phones and tablets, a buy bar slides up once the hero button has scrolled away, and steps aside for the final call */
function StickyCta({ priceLabel }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => seen.set(e.target.id, e.isIntersecting));
      setOn(seen.get("ml-hero-cta") === false && !seen.get("ml-final"));
    });
    ["ml-hero-cta", "ml-final"].forEach((id) => { const n = document.getElementById(id); if (n) io.observe(n); });
    return () => io.disconnect();
  }, []);
  return (
    <div className={cx("ml-sticky fixed inset-x-3 bottom-3 z-40 lg:hidden", on && "on")} aria-hidden={!on}>
      <div className="ml-nav mx-auto flex max-w-md items-center gap-3 rounded-full p-2 pl-6">
        <p className="min-w-0 flex-1 truncate">
          <span className="body-4 block truncate text-[#2a1023]">{priceLabel ? (priceLabel === "Free" ? "Free right now" : `From ${priceLabel}`) : "Make their day"}</span>
          <span className="caption-5 block truncate text-[#7a5370]">No subscription</span>
        </p>
        <Btn to={SIGNUP} tabIndex={on ? 0 : -1} className="shrink-0">Create your page</Btn>
      </div>
    </div>
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

  const root = useRef(null);
  useStickyFix(root); // lets the pinned phone in the templates section stick

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
    <div ref={root} className="mem-root ml-root min-h-screen overflow-x-clip">
      <Helmet>
        <title>Memories: Birthday, proposal, sorry, anniversary and thank you pages | Target Trek</title>
        <meta name="description" content="Create a beautiful interactive page for a birthday, proposal, apology, anniversary or thank you. Pick a look, add your words, photos, videos and your own voice, then share a private or public link." />
        <link rel="canonical" href="https://www.targettrek.in/memories" />
        <meta property="og:title" content="Memories: pages they will never forget" />
        <meta property="og:description" content="Birthday, proposal, sorry, anniversary and thank you pages with your photos and videos. Share a link or lock it with a PIN." />
        <meta name="theme-color" content="#fffaf6" />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
      </Helmet>

      <a href="#main" className="button-sm sr-only left-3 top-3 z-[70] rounded-full bg-white px-3 py-2 text-[#2a1023] focus:not-sr-only focus:fixed">Skip to content</a>
      <Progress />
      <Header />
      <main id="main">
        <Hero priceLabel={priceLabel} />
        <Moments />
        <TemplateStory />
        <LookWall />
        <TaglineReveal />
        <HowItWorks />
        <Features info={info} />
        <PricingSection info={info} />
        <Faq info={info} />
        <FinalCta priceLabel={priceLabel} />
      </main>
      <MemoriesFooter className="pb-20 lg:pb-0" />
      <StickyCta priceLabel={priceLabel} />
    </div>
  );
}
