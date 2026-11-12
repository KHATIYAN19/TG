import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronDown, Heart } from "lucide-react";

import { useMemoriesChrome, useReveal } from "../../chrome";
import { FONT_LINKS } from "../../ui";
import "../../memories.css";
import "./birthday.css";

import { createFx, prefersReducedMotion } from "./fx";
import { createSound } from "./audio";
import { DEFAULT_THEME, resolveTheme } from "./themes";
import { DUMMY_BIRTHDAY, DEFAULT_WISHES } from "./dummy";
import Cake from "./Cake";
import { BalloonField, BalloonStorm } from "./Balloons";
import Gifts from "./Gifts";
import Chocolate from "./Chocolate";
import { VoiceSection } from "../../VoiceNote";
import Gallery from "./Gallery";
import Letter from "./Letter";
import VolumeControl from "./VolumeControl";
import { BgFloat, HeroDecor } from "./decor";
import { track } from "../../track";
import ReplyBox from "../common/ReplyBox";
import PhotoCamera from "../common/PhotoCamera";
import ScratchCard from "../common/ScratchCard";
import StoryReel from "../common/StoryReel";

const FREDOKA = { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap" };

/* the typewriter line under the name */
function Typed({ lines }) {
  const [text, setText] = useState(prefersReducedMotion() ? lines[0] : "");
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;
    let i = 0; let n = 0; let t;
    const tick = () => {
      const line = lines[i % lines.length];
      if (n <= line.length) { setText(line.slice(0, n++)); t = setTimeout(tick, 55); }
      else { t = setTimeout(() => { n = 0; i++; tick(); }, 1700); }
    };
    tick();
    return () => clearTimeout(t);
  }, [lines]);
  return <p className="bd-typed" aria-live="off">{text}</p>;
}

function GateGift() {
  return (
    <svg className="bd-gate-box" viewBox="0 0 120 120" aria-hidden>
      <ellipse cx="60" cy="108" rx="40" ry="7" fill="#000" opacity=".15" />
      <rect x="20" y="52" width="80" height="54" rx="8" style={{ fill: "var(--gift-1)" }} />
      <rect x="20" y="52" width="80" height="12" rx="4" fill="#000" opacity=".1" />
      <rect x="54" y="52" width="12" height="54" fill="#fff" opacity=".92" />
      <rect x="14" y="38" width="92" height="22" rx="7" style={{ fill: "var(--gift-1)" }} />
      <rect x="14" y="38" width="92" height="22" rx="7" fill="#fff" opacity=".18" />
      <rect x="54" y="38" width="12" height="22" fill="#fff" opacity=".92" />
      <path d="M60 38 C40 10 18 24 40 38 Z" fill="none" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      <path d="M60 38 C80 10 102 24 80 38 Z" fill="none" stroke="#fff" strokeWidth="7" strokeLinejoin="round" />
      <circle cx="60" cy="38" r="6" fill="#fff" />
    </svg>
  );
}

/**
 * The birthday page. `data` has the same shape as DUMMY_BIRTHDAY. `theme` is the theme id the SENDER
 * chose for this page. No gifts in `data` means no gifts section.
 */
export default function BirthdayPage({ data = DUMMY_BIRTHDAY, theme: themeId = DEFAULT_THEME, response, onReply }) {
  useMemoriesChrome();
  useReveal([]);
  const hasGallery = Boolean(data.photos?.length); // the video has its own story reel // no photos or videos yet: no gallery section

  const theme = resolveTheme(themeId);
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const canvasRef = useRef(null);
  const stormRef = useRef(null);
  const [fx, setFx] = useState(null);
  const sound = useMemo(() => createSound(), []);

  const [opened, setOpened] = useState(false);
  const [popped, setPopped] = useState(0);
  const [boom, setBoom] = useState(false);

  useEffect(() => {
    const f = createFx(canvasRef.current, () => ({ colors: themeRef.current.confetti, shapes: themeRef.current.shapes }));
    setFx(f);
    return () => { f.destroy(); sound.destroy(); };
  }, [sound]);

  // keep the page still behind the welcome screen
  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [opened]);

  const open = () => {
    track("gate_open");
    sound.unlock();
    sound.sfx.tada();
    setOpened(true);
    window.scrollTo(0, 0);
    const { W, H } = fx?.size() || { W: window.innerWidth, H: window.innerHeight };
    fx?.popper(W * 0.08, H, 1);
    fx?.popper(W * 0.92, H, -1);
    setTimeout(() => sound.sfx.bang(), 60);
  };

  /* the big moment: the second cut goes all the way through */
  const celebrate = useCallback(() => {
    track("cake_cut");
    const { W, H } = fx?.size() || { W: window.innerWidth, H: window.innerHeight };
    sound.sfx.bang();
    fx?.popper(W * 0.06, H, 1);
    fx?.popper(W * 0.94, H, -1);
    setTimeout(() => { sound.sfx.bang(); fx?.popper(W * 0.2, H, 1); fx?.popper(W * 0.8, H, -1); }, 420);
    fx?.rain(2800);
    [[0.25, 0.28, 300], [0.75, 0.22, 700], [0.5, 0.18, 1150]].forEach(([x, y, d]) => setTimeout(() => { fx?.firework(W * x, H * y); sound.sfx.pop(); }, d));
    stormRef.current?.burst(isFinite(W) && W < 640 ? 24 : 34);
    setBoom(true);
    setTimeout(() => setBoom(false), 3500);
  }, [fx, sound]);

  const onFirstCut = useCallback(() => {
    const { W, H } = fx?.size() || { W: window.innerWidth, H: window.innerHeight };
    fx?.confetti(W / 2, H * 0.55, { n: 40, spread: 2.2, power: 520 });
    sound.sfx.chime();
  }, [fx, sound]);


  const wishes = data.wishes?.length ? data.wishes : DEFAULT_WISHES;
  const gifts = data.gifts || [];
  const { recipientName: name, senderName: sender } = data;
  const mainPhoto = (data.photos || []).find((p) => p.id === data.mainPhotoId) || data.photos?.[0];
  const scratchPhoto = (data.photos || []).find((p) => p !== mainPhoto) || mainPhoto;

  return (
    <div className={`bd-root ${opened ? "open" : ""}`} data-theme={theme.id} style={theme.vars}>
      <Helmet>
        <title>{`Happy Birthday ${name}! | Memories`}</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content={theme.vars["--bd-bg-a"]} />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
        <link {...FREDOKA} />
      </Helmet>

      {/* heart-shaped balloons are cut out with this shape */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
        <defs><clipPath id="bd-clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.97 C0.1,0.66 0,0.5 0,0.3 C0,0.12 0.14,0 0.28,0 C0.38,0 0.46,0.05 0.5,0.14 C0.54,0.05 0.62,0 0.72,0 C0.86,0 1,0.12 1,0.3 C1,0.5 0.9,0.66 0.5,0.97 Z" /></clipPath></defs>
      </svg>
      <div className="bd-bg" aria-hidden />
      <BgFloat theme={theme} />
      <canvas ref={canvasRef} className="bd-fx" aria-hidden />
      <BalloonStorm ref={stormRef} palette={theme.balloons} shapes={theme.balloonShapes} fx={fx} sound={sound} />
      <VolumeControl sound={sound} visible={opened} />
      {boom && <div className="bd-boom" aria-hidden><span>Happy Birthday {name}!</span></div>}

      {/* welcome screen: the first tap also unlocks sound */}
      <div className={`bd-gate ${opened ? "out" : ""}`} aria-hidden={opened}>
        <div>
          <GateGift />
          <h1>A surprise for {name}</h1>
          <p>{sender} made this just for you. Turn your sound on 🔊</p>
          <button type="button" className="bd-btn bd-gate-btn" onClick={open}>Open your surprise</button>
        </div>
      </div>

      <main className="bd-main">
        {/* ---- hero ---- */}
        <section className="bd-hero" aria-label="Welcome">
          <HeroDecor theme={theme} />
          <BalloonField palette={theme.balloons} shapes={theme.balloonShapes} wishes={wishes} age={data.age} fx={fx} sound={sound} onCount={setPopped} />
          <div className="bd-hero-text">
            <span className="bd-from"><Heart className="h-3.5 w-3.5" fill="currentColor" aria-hidden /> from {sender}</span>
            <p className="bd-hb">Happy Birthday</p>
            <h1 className="bd-name">{name}</h1>
            {data.age ? <span className="bd-age" aria-label={`${data.age} years old`}>{data.age}</span> : <span />}
            <Typed lines={wishes} />
          </div>
          <a href="#cake" className="bd-scroll" aria-label="Scroll to the cake" data-popped={popped}>Cake time<ChevronDown className="h-4 w-4" aria-hidden /></a>
        </section>

        {/* ---- cake ---- */}
        <section id="cake" className="bd-sec">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">Make a wish</p>
            <h2 className="bd-h2 mem-reveal">Time for the cake</h2>
            <p className="bd-sub mem-reveal">Blow out the candles, then cut a slice. Music, balloons and surprises are waiting.</p>
            <div className="mem-reveal" style={{ marginTop: 6 }}>
              <Cake name={name} themeId={theme.id} fx={fx} sound={sound} onFirstCut={onFirstCut} onCelebrate={celebrate} onBlow={() => track("candles_blown")} />
            </div>
          </div>
        </section>

        {/* ---- gifts: only when the sender added some ---- */}
        {gifts.length > 0 && (
          <section className="bd-sec" aria-label="Gifts">
            <div className="bd-wrap">
              <p className="bd-kicker mem-reveal">From {sender}</p>
              <h2 className="bd-h2 mem-reveal">{gifts.length === 1 ? "A little gift" : "A few little gifts"}</h2>
              <p className="bd-sub mem-reveal">{gifts.length === 1 ? "Tap the box to unwrap it." : "Tap a box to unwrap it. Each one has something inside."}</p>
              <Gifts gifts={gifts} sender={sender} recipient={name} pattern={theme.giftPattern} fx={fx} sound={sound}
                onAllOpen={() => { track("gifts_all_open"); const { W, H } = fx?.size() || { W: 400, H: 700 }; fx?.firework(W * 0.5, H * 0.35); fx?.rain(1800); sound.sfx.tada(); }} />
            </div>
          </section>
        )}

        {/* ---- chocolate ---- */}
        <section className="bd-sec">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">Something sweet</p>
            <h2 className="bd-h2 mem-reveal">Chocolate time</h2>
            <p className="bd-sub mem-reveal">Unwrap it and take a crunchy bite. Tap a square twice to finish it.</p>
            <div className="mem-reveal"><Chocolate fx={fx} sound={sound} /></div>
          </div>
        </section>

        {/* ---- camera: prints the main photo ---- */}
        {mainPhoto && (
          <section id="camera" className="bd-sec" aria-label="A photo for you">
            <div className="bd-wrap"><PhotoCamera photo={mainPhoto} name={name} sound={sound} fx={fx} nextId="scratch" /></div>
          </section>
        )}

        {/* ---- scratch card: hides another photo ---- */}
        {mainPhoto && (
          <section id="scratch" className="bd-sec" aria-label="Scratch card">
            <div className="bd-wrap"><ScratchCard photo={scratchPhoto} name={name} sound={sound} fx={fx} nextId={data.video ? "reel" : hasGallery ? "moments" : "note"} /></div>
          </section>
        )}

        {/* ---- the film: the video plays as a little movie ---- */}
        {data.video && (
          <section id="reel" className="bd-sec" aria-label="Your story">
            <div className="bd-wrap"><StoryReel video={data.video} photos={data.photos || []} name={name} sender={sender} sound={sound} /></div>
          </section>
        )}

        {/* ---- gallery ---- */}
        {hasGallery && (
        <section id="moments" className="bd-sec">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">Memories</p>
            <h2 className="bd-h2 mem-reveal">Moments we love</h2>
            <p className="bd-sub mem-reveal">Tap any picture to see it bigger.</p>
            <Gallery photos={data.photos} video={null} mainPhotoId={data.mainPhotoId} sound={sound} />
          </div>
        </section>
        )}

        <VoiceSection data={data} />

        {/* ---- letter ---- */}
        <section id="note" className="bd-sec">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">From {sender}</p>
            <h2 className="bd-h2 mem-reveal">A note just for you</h2>
            <div className="mem-reveal"><Letter message={data.message} sender={sender} fx={fx} sound={sound} /></div>
          </div>
        </section>

        <section className="bd-sec" aria-label="Reply">

          <div className="bd-wrap">

            <p className="bd-kicker mem-reveal">Your turn</p>

            <h2 className="bd-h2 mem-reveal">Say thank you to {sender}</h2>

            <p className="bd-sub mem-reveal">They&apos;ll read it. It stays here when you come back.</p>

            <ReplyBox sender={sender} onReply={onReply} previous={response?.replies || []} chips={["Thank you so much! 🥳", "Best birthday ever", "You made my day", "Love you 💛"]} />

          </div>

        </section>


        <footer className="bd-foot">
          <p>Made with <Heart className="inline h-3.5 w-3.5" fill="currentColor" aria-hidden /> by {sender}</p>
          <p style={{ marginTop: 4 }}>Want to make one? <Link to="/memories">Create your own page on Memories</Link></p>
        </footer>
      </main>

    </div>
  );
}
