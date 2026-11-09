import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronDown, Heart } from "lucide-react";

import { useMemoriesChrome, useReveal } from "../../chrome";
import { FONT_LINKS } from "../../ui";
import "../../memories.css";
import "../birthday/birthday.css";
import "./sorry.css";

import { createFx, prefersReducedMotion } from "../birthday/fx";
import { createSound } from "../birthday/audio";
import Gifts from "../birthday/Gifts";
import Chocolate from "../birthday/Chocolate";
import Gallery from "../birthday/Gallery";
import Letter from "../birthday/Letter";
import VolumeControl from "../birthday/VolumeControl";
import { BgFloat } from "../birthday/decor";

import { DEFAULT_THEME, resolveTheme } from "./themes";
import { DUMMY_SORRY, DEFAULT_LINES } from "./dummy";
import Mascot from "./Mascots";
import MendHeart from "./MendHeart";
import Promises from "./Promises";
import Forgive from "./Forgive";
import { HeroDecorSorry, Weather } from "./decor";
import { HugOverlay, RosesOverlay, SendLove } from "./Gestures";
import { track } from "../../track";

const FREDOKA = { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap" };
const MOOD_LINE = [
  (n) => `${n}'s heart feels heavy right now`,
  () => "A little lighter… keep going",
  () => "Warm again. Thank you for listening",
];

function Typed({ lines }) {
  const [text, setText] = useState(prefersReducedMotion() ? lines[0] : "");
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let i = 0; let n = 0; let t;
    const tick = () => {
      const line = lines[i % lines.length];
      if (n <= line.length) { setText(line.slice(0, n++)); t = setTimeout(tick, 58); }
      else { t = setTimeout(() => { n = 0; i++; tick(); }, 1900); }
    };
    tick();
    return () => clearTimeout(t);
  }, [lines]);
  return <p className="bd-typed" aria-live="off">{text}</p>;
}

/**
 * The Sorry page. `data` has the shape of DUMMY_SORRY, `theme` is the theme id the SENDER chose.
 * No gifts = no peace-offerings section; no promises = no promises section.
 */
export default function SorryPage({ data = DUMMY_SORRY, theme: themeId = DEFAULT_THEME, response, onAnswer, onReply }) {
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
  const [comfort, setComfort] = useState(0);
  const [forgiven, setForgiven] = useState(false);
  const [hug, setHug] = useState(false);
  const [roses, setRoses] = useState(false);
  const [lit, setLit] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const [floaters, setFloaters] = useState([]);
  const [boom, setBoom] = useState(false);
  const [songReady, setSongReady] = useState(false);
  const [songPlaying, setSongPlaying] = useState(false);
  const totals = useRef({});
  const noteIdx = useRef(0);
  const mascotRef = useRef(null);
  const sentRoses = useRef(false);
  const sentHug = useRef(false);

  const mood = forgiven || comfort >= 70 ? 2 : comfort >= 34 ? 1 : 0;
  const lines = data.wishes?.length ? data.wishes : DEFAULT_LINES;
  const promises = (data.promises || []).filter((p) => p && p.trim());
  const gifts = data.gifts || [];
  const { recipientName: name, senderName: sender } = data;

  useEffect(() => {
    const f = createFx(canvasRef.current, () => ({ colors: themeRef.current.confetti, shapes: themeRef.current.shapes }));
    setFx(f);
    return () => { f.destroy(); sound.destroy(); };
  }, [sound]);

  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [opened]);

  /* every kind of comfort adds a little, with a cap per kind so nothing can be farmed */
  const gain = useCallback((key, amount, cap) => {
    const room = cap - (totals.current[key] || 0);
    if (room <= 0) return;
    const add = Math.min(amount, room);
    totals.current[key] = (totals.current[key] || 0) + add;
    setComfort((c) => Math.min(100, c + add));
  }, []);

  /* rain you can hear: loud while the heart is heavy, silent when it is warm again */
  useEffect(() => { sound.rain(theme.id === "rain" && opened ? Math.max(0, 1 - comfort / 70) : 0); }, [sound, theme.id, opened, comfort]);

  // tell the sender how far the comfort meter got
  useEffect(() => { if (opened) track("comfort", { level: Math.round(comfort) }); }, [comfort, opened]);

  const lastMood = useRef(0);
  useEffect(() => {
    if (!opened || mood === lastMood.current) return;
    const up = mood > lastMood.current;
    lastMood.current = mood;
    if (!up) return;
    if (mood === 1) sound.sfx.chime();
    if (mood === 2) {
      sound.sfx.yes();
      if (songPlaying) sound.playLullaby({ bright: true, bars: 32, onEnd: () => setSongPlaying(false) });
      const { W, H } = fx?.size() || { W: 400, H: 700 };
      fx?.hearts(W / 2, H * 0.55, 18);
    }
  }, [mood, opened, sound, fx, songPlaying]);

  const open = () => {
    track("gate_open");
    sound.unlock();
    sound.sfx.chime();
    setOpened(true);
    window.scrollTo(0, 0);
    setSongReady(true);
    setSongPlaying(true);
    sound.playLullaby({ bright: false, bars: 32, onEnd: () => setSongPlaying(false) });
    setTimeout(() => sound.sfx.sniff(), 900);
  };

  const toggleSong = () => {
    if (sound.isSongPlaying()) { sound.stopSong(); setSongPlaying(false); }
    else { sound.playLullaby({ bright: mood === 2, bars: 32, onEnd: () => setSongPlaying(false) }); setSongPlaying(true); }
  };

  /* comfort the mascot */
  const pat = () => {
    const el = mascotRef.current;
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height * 0.3;
    sound.sfx.squeak();
    if (mood === 0 && Math.random() < 0.4) setTimeout(() => sound.sfx.sniff(), 220);
    fx?.hearts(x, y, 6);
    try { navigator.vibrate?.(10); } catch { /* not supported */ }
    gain("pat", 4, 44);
    setWiggle(true);
    setTimeout(() => setWiggle(false), 600);
    const text = lines[noteIdx.current++ % lines.length];
    const id = Math.random();
    setFloaters((f) => [...f.slice(-2), { id, x, y: r.top, text }]);
    setTimeout(() => setFloaters((f) => f.filter((q) => q.id !== id)), 1800);
  };

  const sendRoses = () => {
    track("gesture", { kind: "roses" });
    setRoses(true);
    sound.sfx.chime();
    const { W, H } = fx?.size() || { W: 400, H: 700 };
    fx?.confetti(W / 2, H, { n: 70, angle: -Math.PI / 2, spread: 1.5, power: 760, kinds: ["petal", "petal", "heart"], palette: ["#be123c", "#f472b6", "#fda4af", "#ffe4e6", "#ffffff"] });
    sentRoses.current = true;
    gain("roses", 12, 12);
  };
  const sendHug = () => {
    track("gesture", { kind: "hug" });
    setHug(true);
    sound.sfx.heartbeat();
    try { navigator.vibrate?.([30, 70, 30, 200, 30, 70, 30]); } catch { /* not supported */ }
    const { W, H } = fx?.size() || { W: 400, H: 700 };
    setTimeout(() => fx?.hearts(W / 2, H * 0.55, 22), 700);
    sentHug.current = true;
    gain("hug", 12, 12);
  };
  const lightCandle = () => {
    track("gesture", { kind: "candle" });
    setLit((v) => !v);
    sound.sfx.chime();
    gain("candle", 4, 4);
  };

  /* the big moment: she said yes */
  const forgive = useCallback(() => {
    const { W, H } = fx?.size() || { W: 400, H: 700 };
    setForgiven(true);
    setComfort(100);
    sound.stopSong();
    sound.sfx.yes();
    setTimeout(() => { sound.playLullaby({ bright: true, bars: 32, onEnd: () => setSongPlaying(false) }); setSongPlaying(true); }, 600);
    fx?.rain(3200);
    fx?.hearts(W / 2, H * 0.6, 30);
    [[0.25, 0.3, 200], [0.75, 0.25, 600], [0.5, 0.2, 1000]].forEach(([x, y, d]) => setTimeout(() => { fx?.firework(W * x, H * y); sound.sfx.pop(); }, d));
    fx?.popper(W * 0.06, H, 1); fx?.popper(W * 0.94, H, -1);
    setTimeout(() => sound.sfx.bang(), 40);
    setBoom(true);
    setTimeout(() => setBoom(false), 3500);
    setTimeout(() => { setHug(true); sound.sfx.heartbeat(); }, 1500);
  }, [fx, sound]);

  /* they already said yes (this is a reload): show the happy ending again straight away */
  const wasForgiven = response?.answer?.value === "yes";
  const replayed = useRef(false);
  useEffect(() => {
    if (!opened || !wasForgiven || replayed.current || !fx) return;
    replayed.current = true;
    setTimeout(() => { document.getElementById("forgive")?.scrollIntoView({ behavior: "smooth", block: "center" }); forgive(); }, 500);
  }, [opened, wasForgiven, fx, forgive]);

  const gentle = useCallback(() => { sound.sfx.sniff(); sound.rain(0); }, [sound]);

  return (
    <div className={`bd-root sr-root ${opened ? "open" : ""}`} data-theme={theme.id} data-mood={mood} style={theme.vars}>
      <Helmet>
        <title>{`${sender} has something to tell ${name} | Memories`}</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content={theme.vars["--bd-bg-a"]} />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
        <link {...FREDOKA} />
      </Helmet>

      <div className="bd-bg" aria-hidden />
      {theme.id === "rain" && <Weather comfort={comfort} />}
      <BgFloat theme={theme} spec={theme.float} />
      <canvas ref={canvasRef} className="bd-fx" aria-hidden />
      <VolumeControl sound={sound} visible={opened} songReady={songReady} songPlaying={songPlaying} onToggleSong={toggleSong} />
      {boom && <div className="bd-boom" aria-hidden><span>Thank you, {name}!</span></div>}
      <HugOverlay show={hug} onDone={() => setHug(false)} sender={sender} name={name} />
      <RosesOverlay show={roses} onDone={() => setRoses(false)} sender={sender} />
      {floaters.map((f) => <span key={f.id} className="bd-floater" style={{ left: f.x, top: f.y }}>{f.text}</span>)}

      {/* welcome */}
      <div className={`bd-gate ${opened ? "out" : ""}`} aria-hidden={opened}>
        <div>
          <Mascot kind={theme.mascot} mood={0} className="sr-gate-mascot" />
          <h1>{sender} has something to tell you, {name}</h1>
          <p>It won&apos;t take long. Turn your sound on 🔊</p>
          <button type="button" className="bd-btn bd-gate-btn" onClick={open}>Open</button>
        </div>
      </div>

      <main className="bd-main">
        {/* ---- hero ---- */}
        <section className="bd-hero sr-hero" aria-label="I'm sorry">
          <HeroDecorSorry theme={theme} comfort={comfort} />
          <div className="bd-hero-text sr-hero-text">
            <span className="bd-from"><Heart className="h-3.5 w-3.5" fill="currentColor" aria-hidden /> from {sender}</span>
            <p className="sr-sorry">I&apos;m sorry,</p>
            <h1 className="bd-name">{name}</h1>
            <button ref={mascotRef} type="button" className={`sr-mascot ${wiggle ? "sr-wiggle" : ""}`} onClick={pat} aria-label={`Comfort the ${theme.mascot === "cloud" ? "cloud" : theme.mascot}`}>
              <Mascot kind={theme.mascot} mood={mood} />
              <span className="sr-pat-hint" aria-hidden>{comfort === 0 ? "tap to comfort" : ""}</span>
            </button>
            <Typed lines={lines} />
            <div className="sr-meter" role="progressbar" aria-label="Heart meter" aria-valuenow={Math.round(comfort)} aria-valuemin={0} aria-valuemax={100}>
              <svg viewBox="0 0 32 29" aria-hidden><path d="M16 28C16 28 2 19 2 9.5 2 5 5.5 2 9.5 2 12.3 2 14.8 3.6 16 6 17.2 3.6 19.7 2 22.5 2 26.5 2 30 5 30 9.5 30 19 16 28 16 28Z" fill="var(--bd-line)" /><clipPath id="sr-mclip"><rect x="0" y={29 - (29 * comfort) / 100} width="32" height="29" /></clipPath><path d="M16 28C16 28 2 19 2 9.5 2 5 5.5 2 9.5 2 12.3 2 14.8 3.6 16 6 17.2 3.6 19.7 2 22.5 2 26.5 2 30 5 30 9.5 30 19 16 28 16 28Z" fill="var(--bd-accent)" clipPath="url(#sr-mclip)" /></svg>
              <span className="sr-meter-bar"><i style={{ width: `${comfort}%` }} /></span>
              <span className="sr-meter-label">{MOOD_LINE[mood](name)}</span>
            </div>
          </div>
          <a href="#note" className="bd-scroll" aria-label="Scroll down">Please read on<ChevronDown className="h-4 w-4" aria-hidden /></a>
        </section>

        {/* ---- the note ---- */}
        <section id="note" className="bd-sec">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">From {sender}</p>
            <h2 className="bd-h2 mem-reveal">What I need to say</h2>
            <div className="mem-reveal"><Letter message={data.message} sender={sender} fx={fx} sound={sound} onOpen={() => gain("letter", 10, 10)} /></div>
          </div>
        </section>

        {/* ---- mend the heart ---- */}
        <section className="bd-sec">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">Mend it</p>
            <h2 className="bd-h2 mem-reveal">A broken heart can be mended</h2>
            <p className="bd-sub mem-reveal">Hold the loose half and bring it back to where it belongs.</p>
            <div className="mem-reveal"><MendHeart fx={fx} sound={sound} onMend={() => { track("heart_mended"); gain("mend", 20, 20); }} /></div>
          </div>
        </section>

        {/* ---- promises ---- */}
        {promises.length > 0 && (
          <section className="bd-sec" aria-label="Promises">
            <div className="bd-wrap">
              <p className="bd-kicker mem-reveal">My promises</p>
              <h2 className="bd-h2 mem-reveal">What I&apos;ll do differently</h2>
              <p className="bd-sub mem-reveal">Tap each card to open it.</p>
              <Promises promises={promises} sender={sender} fx={fx} sound={sound} onFlip={() => gain("promise", 3, 12)} />
            </div>
          </section>
        )}

        {/* ---- peace offerings ---- */}
        {gifts.length > 0 && (
          <section className="bd-sec" aria-label="Peace offerings">
            <div className="bd-wrap">
              <p className="bd-kicker mem-reveal">Peace offerings</p>
              <h2 className="bd-h2 mem-reveal">{gifts.length === 1 ? "A little something for you" : "A few little things for you"}</h2>
              <p className="bd-sub mem-reveal">{gifts.length === 1 ? "Tap the box to unwrap it." : "Tap a box to unwrap it."}</p>
              <Gifts gifts={gifts} sender={sender} recipient={name} pattern={theme.giftPattern} fx={fx} sound={sound} onOpen={() => gain("gift", 4, 12)}
                onAllOpen={() => { const { W, H } = fx?.size() || { W: 400, H: 700 }; fx?.hearts(W / 2, H * 0.5, 20); sound.sfx.chime(); }} />
            </div>
          </section>
        )}

        {/* ---- chocolate ---- */}
        <section className="bd-sec">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">Something sweet</p>
            <h2 className="bd-h2 mem-reveal">Chocolate helps, right?</h2>
            <p className="bd-sub mem-reveal">Unwrap it and take a crunchy bite.</p>
            <div className="mem-reveal"><Chocolate fx={fx} sound={sound} onBite={() => gain("choco", 1, 10)} /></div>
          </div>
        </section>

        {/* ---- send love ---- */}
        <section className="bd-sec">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">Send a little love</p>
            <h2 className="bd-h2 mem-reveal">Because words aren&apos;t enough</h2>
            <div className="mem-reveal"><SendLove onRoses={sendRoses} onHug={sendHug} onCandle={lightCandle} sentRoses={sentRoses.current} sentHug={sentHug.current} lit={lit} /></div>
          </div>
        </section>

        {/* ---- gallery ---- */}
        {hasGallery && (
        <section className="bd-sec">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">Memories</p>
            <h2 className="bd-h2 mem-reveal">Moments I treasure</h2>
            <p className="bd-sub mem-reveal">Tap any picture to see it bigger.</p>
            <Gallery photos={data.photos} video={data.video} mainPhotoId={data.mainPhotoId} sound={sound} />
          </div>
        </section>
        )}

        {/* ---- the question ---- */}
        <section id="forgive" className="bd-sec sr-final">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">One more thing</p>
            <h2 className="bd-h2 bd-script mem-reveal sr-ask-title">Will you forgive me?</h2>
            <div className="sr-final-mascot mem-reveal"><Mascot kind={theme.mascot} mood={mood} /></div>
            <div className="mem-reveal"><Forgive name={name} sender={sender} onYes={forgive} onGentle={gentle} sound={sound} initial={response?.answer?.value || null} onAnswer={onAnswer} onReply={onReply} replies={response?.replies || []} /></div>
          </div>
        </section>

        <footer className="bd-foot">
          <p>Written with <Heart className="inline h-3.5 w-3.5" fill="currentColor" aria-hidden /> by {sender}</p>
          <p style={{ marginTop: 4 }}>Want to say it too? <Link to="/memories">Create your own page on Memories</Link></p>
        </footer>
      </main>
    </div>
  );
}
