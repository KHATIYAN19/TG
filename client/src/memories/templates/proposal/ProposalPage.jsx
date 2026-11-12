import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronDown, Heart } from "lucide-react";

import { useMemoriesChrome, useReveal } from "../../chrome";
import { FONT_LINKS } from "../../ui";
import "../../memories.css";
import "../birthday/birthday.css";
import "../sorry/sorry.css"; // the promise cards
import "../anniversary/anniversary.css"; // timeline + love jar
import "./proposal.css";

import { createFx, prefersReducedMotion } from "../birthday/fx";
import { createSound } from "../birthday/audio";
import { VoiceSection } from "../../VoiceNote";
import Gallery from "../birthday/Gallery";
import PhotoCamera from "../common/PhotoCamera";
import Letter from "../birthday/Letter";
import VolumeControl from "../birthday/VolumeControl";
import { BgFloat } from "../birthday/decor";
import Promises from "../sorry/Promises";
import Timeline from "../anniversary/Timeline";
import LoveJar from "../anniversary/LoveJar";
import { elapsed, parseSince } from "../anniversary/TogetherCounter";

import { DEFAULT_THEME, resolveTheme } from "./themes";
import { DUMMY_PROPOSAL, DEFAULT_LINES, DEFAULT_QUESTION, kindFor } from "./dummy";
import { Jewel } from "./art";
import AskStage from "./AskStage";
import { track } from "../../track";

const FREDOKA = { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap" };

function Typed({ lines }) {
  const [text, setText] = useState(prefersReducedMotion() ? lines[0] : "");
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let i = 0; let n = 0; let t;
    const tick = () => {
      const line = lines[i % lines.length];
      if (n <= line.length) { setText(line.slice(0, n++)); t = setTimeout(tick, 56); }
      else { t = setTimeout(() => { n = 0; i++; tick(); }, 1900); }
    };
    tick();
    return () => clearTimeout(t);
  }, [lines]);
  return <p className="bd-typed" aria-live="off">{text}</p>;
}

const Head = ({ kicker, title, sub }) => (
  <>
    <p className="bd-kicker mem-reveal">{kicker}</p>
    <h2 className="bd-h2 mem-reveal">{title}</h2>
    {sub && <p className="bd-sub mem-reveal">{sub}</p>}
  </>
);

const plural = (n, w) => `${n} ${w}${n > 1 ? "s" : ""}`;

/**
 * The Proposal page. `data` has the shape of DUMMY_PROPOSAL, `theme` is the theme the SENDER chose.
 * It tells the story first (timeline, reasons, photos, vows, a letter) and ends with the question.
 * Sections with nothing to show are simply left out.
 */
export default function ProposalPage({ data = DUMMY_PROPOSAL, theme: themeId = DEFAULT_THEME, response, onAnswer, onReply }) {
  useMemoriesChrome();
  useReveal([]);
  const hasGallery = Boolean(data.photos?.length || data.video); // no photos or videos yet: no gallery section

  const theme = resolveTheme(themeId);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const canvasRef = useRef(null);
  const [fx, setFx] = useState(null);
  const sound = useMemo(() => createSound(), []);

  const [opened, setOpened] = useState(false);
  const [boom, setBoom] = useState(false);

  const { recipientName: name, senderName: sender } = data;
  const question = (data.question || "").trim() || DEFAULT_QUESTION;
  const kind = kindFor(question);
  const lines = data.wishes?.length ? data.wishes : DEFAULT_LINES;
  const start = parseSince(data.since);
  const together = start ? elapsed(start) : null;
  const timeline = data.timeline || [];
  const reasons = (data.reasons || []).filter((r) => r && r.trim());
  const promises = (data.promises || []).filter((p) => p && p.trim());
  const togetherText = together && (together.years > 0 || together.months > 0)
    ? [together.years > 0 && plural(together.years, "year"), together.months > 0 && plural(together.months, "month")].filter(Boolean).join(" and ")
    : "";

  useEffect(() => {
    const f = createFx(canvasRef.current, () => ({ colors: themeRef.current.confetti, shapes: themeRef.current.shapes }));
    setFx(f);
    return () => { f.destroy(); sound.destroy(); };
  }, [sound]);

  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [opened]);

  const open = () => {
    track("gate_open");
    sound.unlock();
    sound.sfx.chime();
    setOpened(true);
    window.scrollTo(0, 0);
    const { W, H } = fx?.size() || { W: window.innerWidth, H: window.innerHeight };
    setTimeout(() => fx?.hearts(W / 2, H * 0.6, 16), 300);
  };


  /* the answer was YES: everything at once */
  const celebrate = useCallback(() => {
    const { W, H } = fx?.size() || { W: 400, H: 700 };
    sound.sfx.tada();
    setTimeout(() => sound.sfx.bang(), 80);
    setTimeout(() => sound.sfx.cheer(), 500);
    setTimeout(() => sound.sfx.kiss?.(), 1500);
    fx?.popper(W * 0.06, H, 1); fx?.popper(W * 0.94, H, -1);
    fx?.rain(5200);
    fx?.hearts(W / 2, H * 0.6, 40);
    [[0.2, 0.28, 200], [0.8, 0.24, 650], [0.5, 0.16, 1100], [0.32, 0.36, 1600], [0.68, 0.32, 2000], [0.5, 0.3, 2600], [0.15, 0.2, 3000], [0.85, 0.3, 3400]]
      .forEach(([x, y, d]) => setTimeout(() => { fx?.firework(W * x, H * y); sound.sfx.pop(); }, d));
    setBoom(true);
    setTimeout(() => setBoom(false), 3600);
  }, [fx, sound]);

  /* they already said yes (this is a reload): after the welcome screen, go straight to the happy ending */
  const wasYes = response?.answer?.value === "yes";
  const replayed = useRef(false);
  useEffect(() => {
    if (!opened || !wasYes || replayed.current || !fx) return;
    replayed.current = true;
    setTimeout(() => { document.getElementById("ask")?.scrollIntoView({ behavior: "smooth", block: "start" }); celebrate(); }, 600);
  }, [opened, wasYes, fx, celebrate]);

  const title = kind === "ring" ? "a question from the heart" : "something I want to ask you";

  return (
    <div className={`bd-root pr-root ${opened ? "open" : ""}`} data-theme={theme.id} style={theme.vars}>
      <Helmet>
        <title>{`${sender} has a question for ${name} | Memories`}</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content={theme.vars["--bd-bg-a"]} />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
        <link {...FREDOKA} />
      </Helmet>

      <div className="bd-bg" aria-hidden />
      <BgFloat theme={theme} spec={theme.float} />
      <canvas ref={canvasRef} className="bd-fx" aria-hidden />
      <VolumeControl sound={sound} visible={opened} />
      {boom && <div className="bd-boom" aria-hidden><span>{name} said YES!</span></div>}

      {/* welcome */}
      <div className={`bd-gate ${opened ? "out" : ""}`} aria-hidden={opened}>
        <div>
          <Jewel kind={kind} className="pr-gate-jewel" />
          <h1>{sender} has something to ask {name}</h1>
          <p>Find a quiet moment and turn your sound on 🔊</p>
          <button type="button" className="bd-btn bd-gate-btn" onClick={open}>Open</button>
        </div>
      </div>

      <main className="bd-main">
        {/* ---- hero ---- */}
        <section className="bd-hero pr-hero" aria-label="A question for you">
          <div className="bd-hero-text pr-hero-text">
            <span className="bd-from"><Heart className="h-3.5 w-3.5" fill="currentColor" aria-hidden /> from {sender}</span>
            <Jewel kind={kind} className="pr-hero-jewel" />
            <h1 className="pr-hero-title"><span className="n">{name}</span>, {title}</h1>
            {togetherText && <span className="an-since">Together for {togetherText}</span>}
            <Typed lines={lines} />
          </div>
          <a href={timeline.length || reasons.length ? "#story" : "#ask"} className="bd-scroll" aria-label="Scroll down">Keep scrolling<ChevronDown className="h-4 w-4" aria-hidden /></a>
        </section>

        {timeline.length > 0 && (
          <section id="story" className="bd-sec" aria-label="Our story">
            <div className="bd-wrap">
              <Head kicker="Our story" title="How we got here" sub="Every little moment led to this one." />
              <Timeline items={timeline} />
            </div>
          </section>
        )}

        {reasons.length > 0 && (
          <section id={timeline.length ? undefined : "story"} className="bd-sec" aria-label="Reasons I love you">
            <div className="bd-wrap">
              <Head kicker="Little reasons" title="Why it's you" sub="Pull a reason out of the jar." />
              <div className="mem-reveal"><LoveJar reasons={reasons} name={name} sender={sender} fx={fx} sound={sound} /></div>
            </div>
          </section>
        )}

        {/* ---- camera: clicks and prints the main photo ---- */}
        {data.photos?.length > 0 && (
          <section id="camera" className="bd-sec" aria-label="A photo for you">
            <div className="bd-wrap"><PhotoCamera photo={data.photos?.find((x) => x.id === data.mainPhotoId) || data.photos?.[0]} name={name} sound={sound} fx={fx} nextId="moments" /></div>
          </section>
        )}

        {hasGallery && (
        <section id="moments" className="bd-sec">
          <div className="bd-wrap">
            <Head kicker="Memories" title="Moments I treasure" sub="Tap any picture to see it bigger." />
            <Gallery photos={data.photos} video={data.video} mainPhotoId={data.mainPhotoId} sound={sound} />
          </div>
        </section>
        )}

        <VoiceSection data={data} />

        {promises.length > 0 && (
          <section className="bd-sec" aria-label="My promises">
            <div className="bd-wrap">
              <Head kicker="My promises" title={kind === "ring" ? "My vows to you" : "What I promise you"} sub="Tap each card to open it." />
              <Promises promises={promises} sender={sender} fx={fx} sound={sound} />
            </div>
          </section>
        )}

        <section className="bd-sec">
          <div className="bd-wrap">
            <Head kicker={`From ${sender}`} title="Before I ask…" />
            <div className="mem-reveal"><Letter message={data.message} sender={sender} fx={fx} sound={sound} /></div>
          </div>
        </section>

        {/* ---- the question ---- */}
        <section id="ask" className="pr-ask" aria-label="The question">
          <AskStage question={question} name={name} sender={sender} fx={fx} sound={sound} onYes={celebrate} response={response} onAnswer={onAnswer} onReply={onReply} />
        </section>

        <footer className="bd-foot">
          <p>Made with <Heart className="inline h-3.5 w-3.5" fill="currentColor" aria-hidden /> by {sender}</p>
          <p style={{ marginTop: 4 }}>Want to make one? <Link to="/memories">Create your own page on Memories</Link></p>
        </footer>
      </main>
    </div>
  );
}
