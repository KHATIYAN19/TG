import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowDown, Heart, Music, PartyPopper, Sparkles, Square } from "lucide-react";

import { useMemoriesChrome, useReveal } from "../../chrome";
import { FONT_LINKS } from "../../ui";
import "../../memories.css";
import "./birthday.css";
import "./party.css";

import { createFx, prefersReducedMotion } from "./fx";
import { createSound } from "./audio";
import { DEFAULT_THEME, resolveTheme } from "./themes";
import { DUMMY_BIRTHDAY } from "./dummy";
import { audienceFor, isWishReply } from "./audiences";
import Cake from "./Cake";
import { BalloonField, BalloonStorm } from "./Balloons";
import Gifts from "./Gifts";
import Chocolate from "./Chocolate";
import Drinks from "./Drinks";
import Pinata from "./Pinata";
import Wish from "./Wish";
import { AgeStats, Coupons, ReasonDeck, Years } from "./Cards";
import PartyNav from "./PartyNav";
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

const PAGE_FONTS = { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Titan+One&display=swap" };

const ordinal = (n) => { const s = ["th", "st", "nd", "rd"]; const v = n % 100; return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`; };

/* the typewriter line under the name */
function Typed({ lines }) {
  const [text, setText] = useState(prefersReducedMotion() ? lines[0] : "");
  useEffect(() => {
    if (prefersReducedMotion()) { setText(lines[0]); return undefined; }
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

/*
  The name, one bouncing letter at a time. Only plain Latin words are split into letters: in scripts where letters join
  (Hindi, Arabic and so on) a word is kept whole, so it is never broken apart.
*/
const LATIN = /^[ -ɏ]+$/;
function Name({ text }) {
  const words = String(text || "").trim().split(/\s+/).filter(Boolean);
  const longest = Math.max(4, ...words.map((w) => Array.from(w).length));
  let i = 0;
  return (
    <h1 className="bd-name pt-name" style={{ "--n": longest }} aria-label={text}>
      {words.map((w, wi) => (
        <span key={wi} className="pt-word" aria-hidden>
          {(LATIN.test(w) ? Array.from(w) : [w]).map((ch) => { const k = i++; return <span key={k} className="pt-l" style={{ "--i": k }}>{ch}</span>; })}
        </span>
      ))}
    </h1>
  );
}

/* the invitation on the welcome screen */
function Invite({ name, sender, line, onOpen }) {
  return (
    <div className="pt-invite">
      <span className="pt-invite-top"><i>Admit one</i><i>Birthday party</i></span>
      <span className="pt-invite-emoji" aria-hidden>🎂</span>
      <p className="pt-invite-kick">You are invited</p>
      <h1>A surprise for <em>{name}</em></h1>
      <p className="pt-invite-line">{sender} {line}. Turn your sound on 🔊</p>
      <button type="button" className="bd-btn bd-gate-btn" onClick={onOpen}><PartyPopper className="h-4 w-4" aria-hidden /> Open your surprise</button>
      <span className="pt-invite-cut" aria-hidden />
    </div>
  );
}

/* one part of the party: a badge, a heading and whatever happens there */
function Station({ id, emoji, kicker, title, sub, label, children }) {
  return (
    <section id={id} className="bd-sec pt-st" aria-label={label || title}>
      <div className="bd-wrap">
        <header className="pt-head mem-reveal">
          <span className="pt-badge" aria-hidden>{emoji}</span>
          <p className="bd-kicker">{kicker}</p>
          <h2 className="bd-h2">{title}</h2>
          {sub && <p className="bd-sub">{sub}</p>}
        </header>
        {children}
      </div>
    </section>
  );
}

/**
 * The birthday page. `data` has the same shape as DUMMY_BIRTHDAY. `theme` is the look the SENDER chose and
 * `data.audience` who it is for (partner, friend, parent, sibling...), which sets the wording of the whole page.
 * Every section that needs something from the sender (gifts, reasons, coupons, moments, photos) is hidden without it.
 */
export default function BirthdayPage({ data = DUMMY_BIRTHDAY, theme: themeId = DEFAULT_THEME, response, onReply }) {
  useMemoriesChrome();
  useReveal([]);

  const theme = resolveTheme(themeId);
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const aud = audienceFor(data.audience);

  const canvasRef = useRef(null);
  const stormRef = useRef(null);
  const [fx, setFx] = useState(null);
  const sound = useMemo(() => createSound(), []);

  const [opened, setOpened] = useState(false);
  const [popped, setPopped] = useState(0);
  const [boom, setBoom] = useState(false);
  const [party, setParty] = useState(false); // disco lights + the birthday song
  const [finale, setFinale] = useState(false);
  const timers = useRef([]);
  const later = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };

  useEffect(() => {
    const f = createFx(canvasRef.current, () => ({ colors: themeRef.current.confetti, shapes: themeRef.current.shapes }));
    setFx(f);
    const pending = timers.current;
    return () => { pending.forEach(clearTimeout); f.destroy(); sound.destroy(); };
  }, [sound]);

  // keep the page still behind the welcome screen
  useEffect(() => {
    document.documentElement.style.overflow = opened ? "" : "hidden";
    return () => { document.documentElement.style.overflow = ""; };
  }, [opened]);

  const view = () => fx?.size() || { W: window.innerWidth, H: window.innerHeight };
  const poppers = useCallback(() => {
    const { W, H } = fx?.size() || { W: window.innerWidth, H: window.innerHeight };
    fx?.popper(W * 0.08, H, 1);
    fx?.popper(W * 0.92, H, -1);
    sound.sfx.bang();
  }, [fx, sound]);

  const open = () => {
    track("gate_open");
    sound.unlock();
    sound.sfx.tada();
    setOpened(true);
    window.scrollTo(0, 0);
    later(poppers, 60);
  };

  const playSong = useCallback(() => {
    if (sound.playing) return;
    if (sound.playSong(() => setParty(false))) { setParty(true); track("song"); }
  }, [sound]);

  /* the party switch: lights down, mirror ball, music */
  const toggleParty = () => {
    if (party) { sound.stopSong(); setParty(false); return; }
    track("party_on");
    setParty(true);
    poppers();
    stormRef.current?.burst(view().W < 640 ? 12 : 18);
    if (!sound.playSong(() => setParty(false))) later(() => setParty(false), 12000); // no audio on this device: the lights still run for a while
  };

  /* the big moment: the second cut goes all the way through */
  const celebrate = useCallback(() => {
    track("cake_cut");
    const { W, H } = fx?.size() || { W: window.innerWidth, H: window.innerHeight };
    poppers();
    later(() => { sound.sfx.bang(); fx?.popper(W * 0.2, H, 1); fx?.popper(W * 0.8, H, -1); }, 420);
    fx?.rain(2800);
    [[0.25, 0.28, 300], [0.75, 0.22, 700], [0.5, 0.18, 1150]].forEach(([x, y, d]) => later(() => { fx?.firework(W * x, H * y); sound.sfx.pop(); }, d));
    stormRef.current?.burst(W < 640 ? 24 : 34);
    setBoom(true);
    later(() => setBoom(false), 3500);
    later(playSong, 1700);
  }, [fx, sound, poppers, playSong]); // eslint-disable-line react-hooks/exhaustive-deps

  const onFirstCut = useCallback(() => {
    const { W, H } = fx?.size() || { W: window.innerWidth, H: window.innerHeight };
    fx?.confetti(W / 2, H * 0.55, { n: 40, spread: 2.2, power: 520 });
    sound.sfx.chime();
  }, [fx, sound]);

  /* the last thing on the page: a fireworks show */
  const lightTheSky = () => {
    if (finale) return;
    setFinale(true);
    track("fireworks");
    track("finale");
    const { W, H } = view();
    const shots = W < 640 ? 12 : 18;
    for (let i = 0; i < shots; i++) later(() => { fx?.firework(W * (0.12 + Math.random() * 0.76), H * (0.12 + Math.random() * 0.4)); sound.sfx.pop(); }, i * 330);
    later(() => { fx?.rain(2600); sound.sfx.cheer(); }, shots * 330);
    later(() => setFinale(false), shots * 330 + 2600);
    playSong();
  };

  const { recipientName: name, senderName: sender } = data;
  const wishes = data.wishes?.length ? data.wishes : aud.lines;
  const gifts = data.gifts || [];
  const reasons = (data.reasons || []).filter(Boolean);
  const coupons = (data.promises || []).filter(Boolean);
  const years = (data.timeline || []).filter((m) => m.title);
  const photos = data.photos || [];
  const hasGallery = photos.length > 0; // the video has its own story reel
  const mainPhoto = photos.find((p) => p.id === data.mainPhotoId) || photos[0];
  const scratchPhoto = photos.find((p) => p !== mainPhoto) || mainPhoto;
  const question = (data.question || "").trim() || aud.question;
  const replies = (response?.replies || []).filter((r) => !isWishReply(r));

  /* the party map (and the ribbon under the name): only the parts this page really has */
  const stops = [
    { id: "cake", emoji: "🎂", label: "The cake" },
    { id: "wish", emoji: "🌠", label: "Make a wish" },
    gifts.length > 0 && { id: "gifts", emoji: "🎁", label: "Gifts" },
    { id: "treats", emoji: "🍫", label: "Chocolate & drinks" },
    { id: "games", emoji: "🪅", label: "The pinata" },
    reasons.length > 0 && { id: "reasons", emoji: "💌", label: aud.reasonsTitle },
    data.age && { id: "numbers", emoji: "🔢", label: `${data.age} in numbers` },
    mainPhoto && { id: "camera", emoji: "📸", label: "A photo for you" },
    mainPhoto && { id: "scratch", emoji: "🪙", label: "Scratch card" },
    data.video && { id: "reel", emoji: "🎬", label: "Your film" },
    hasGallery && { id: "moments", emoji: "🖼️", label: "Photo wall" },
    years.length > 0 && { id: "years", emoji: "🧭", label: aud.yearsTitle },
    coupons.length > 0 && { id: "coupons", emoji: "🎟️", label: aud.couponsTitle },
    { id: "note", emoji: "✉️", label: "Your letter" },
    { id: "reply", emoji: "💬", label: "Write back" },
    { id: "finale", emoji: "🎆", label: "Fireworks" },
  ].filter(Boolean);

  const after = (id) => { const i = stops.findIndex((s) => s.id === id); return stops[i + 1]?.id || "note"; };

  return (
    <div className={`bd-root pt ${opened ? "open" : ""} ${party ? "party-on" : ""} ${theme.dark ? "is-dark" : ""}`} data-theme={theme.id} data-audience={aud.id} style={theme.vars}>
      <Helmet>
        <title>{`Happy Birthday ${name}! | Memories`}</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content={theme.vars["--bd-bg-a"]} />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
        <link {...PAGE_FONTS} />
      </Helmet>

      {/* heart-shaped balloons are cut out with this shape */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
        <defs><clipPath id="bd-clip-heart" clipPathUnits="objectBoundingBox"><path d="M0.5,0.97 C0.1,0.66 0,0.5 0,0.3 C0,0.12 0.14,0 0.28,0 C0.38,0 0.46,0.05 0.5,0.14 C0.54,0.05 0.62,0 0.72,0 C0.86,0 1,0.12 1,0.3 C1,0.5 0.9,0.66 0.5,0.97 Z" /></clipPath></defs>
      </svg>
      <div className="bd-bg" aria-hidden />
      <BgFloat theme={theme} />
      {/* party mode: coloured beams sweep the room and a mirror ball drops in */}
      <div className="pt-lights" aria-hidden><i /><i /><i /><i /></div>
      <div className="pt-ball" aria-hidden><span /></div>
      <canvas ref={canvasRef} className="bd-fx" aria-hidden />
      <BalloonStorm ref={stormRef} palette={theme.balloons} shapes={theme.balloonShapes} fx={fx} sound={sound} />
      <VolumeControl sound={sound} visible={opened} />
      <PartyNav stops={stops} visible={opened} />
      {boom && <div className="bd-boom" aria-hidden><span>Happy Birthday {name}!</span></div>}

      {/* welcome screen: the first tap also unlocks sound */}
      <div className={`bd-gate pt-gate ${opened ? "out" : ""}`} aria-hidden={opened}>
        <div className="pt-gate-bits" aria-hidden>{Array.from({ length: 16 }, (_, i) => <i key={i} style={{ "--i": i }} />)}</div>
        <Invite name={name} sender={sender} line={aud.gateLine} onOpen={open} />
      </div>

      <main className="bd-main">
        {/* ---- hero ---- */}
        <section className="bd-hero pt-hero" aria-label="Welcome">
          <HeroDecor theme={theme} />
          <BalloonField palette={theme.balloons} shapes={theme.balloonShapes} wishes={wishes} age={data.age} fx={fx} sound={sound} onCount={setPopped} />
          <div className="bd-hero-text">
            <span className="bd-from pt-kick"><Sparkles className="h-3.5 w-3.5" aria-hidden /> {aud.kicker}</span>
            <p className="bd-hb">Happy {data.age ? `${ordinal(data.age)} ` : ""}Birthday</p>
            <Name text={name} />
            <p className="pt-sub">{aud.heroSub}</p>
            <Typed lines={wishes} />
            <div className="pt-cta">
              <button type="button" className="bd-btn pt-party-btn" onClick={toggleParty} aria-pressed={party}>
                {party ? <><Square className="h-4 w-4" fill="currentColor" aria-hidden /> Stop the music</> : <><Music className="h-4 w-4" aria-hidden /> Start the party</>}
              </button>
              <a href="#cake" className="bd-btn bd-btn-ghost" data-popped={popped}>Cake time <ArrowDown className="h-4 w-4" aria-hidden /></a>
            </div>
            <p className="pt-sign"><Heart className="h-3.5 w-3.5" fill="currentColor" aria-hidden /> with love, {sender}</p>
          </div>
          {/* a ribbon of everything waiting further down */}
          <div className="pt-ribbon" aria-hidden>
            <div>{[0, 1].map((k) => <span key={k}>{stops.map((s) => <b key={s.id}>{s.emoji} {s.label}</b>)}</span>)}</div>
          </div>
        </section>

        {/* ---- cake ---- */}
        <Station id="cake" emoji="🎂" kicker="First things first" title="Time for the cake" sub="Blow out the candles, then drag the knife down to cut a slice. The music starts when the slice comes out.">
          <div className="mem-reveal pt-stage">
            <Cake name={name} themeId={theme.id} fx={fx} sound={sound} onFirstCut={onFirstCut} onCelebrate={celebrate} onBlow={() => track("candles_blown")} />
          </div>
        </Station>

        {/* ---- the wish: their answer goes back to the sender ---- */}
        <Station id="wish" emoji="🌠" kicker={`${sender} wants to know`} title="Now make a wish" sub={`Say it out loud here and it goes straight to ${sender}. Wishes told to the right person tend to come true.`}>
          <Wish question={question} chips={aud.wishChips} sender={sender} fx={fx} sound={sound} onReply={onReply} previous={response?.replies || []} />
        </Station>

        {/* ---- gifts: only when the sender added some ---- */}
        {gifts.length > 0 && (
          <Station id="gifts" emoji="🎁" kicker={`From ${sender}`} title={gifts.length === 1 ? "A little gift" : aud.giftsTitle} sub={gifts.length === 1 ? "Tap the box to unwrap it." : "Tap a box to unwrap it. Each one hides a voucher with your name on it."}>
            <Gifts gifts={gifts} sender={sender} recipient={name} pattern={theme.giftPattern} fx={fx} sound={sound}
              onAllOpen={() => { track("gifts_all_open"); const { W, H } = view(); fx?.firework(W * 0.5, H * 0.35); fx?.rain(1800); sound.sfx.tada(); }} />
          </Station>
        )}

        {/* ---- the treat table: chocolate and a drink ---- */}
        <Station id="treats" emoji="🍫" kicker="The treat table" title="Chocolate and a drink" sub="Unwrap the bar and bite it square by square. Then pour yourself something and raise a glass.">
          <div className="pt-table">
            <div className="pt-treat mem-reveal">
              <h3 className="pt-h3">The chocolate bar</h3>
              <Chocolate fx={fx} sound={sound} />
            </div>
            <div className="pt-treat">
              <h3 className="pt-h3 mem-reveal">The drinks bar</h3>
              <Drinks sender={sender} toast={aud.toast} fx={fx} sound={sound} />
            </div>
          </div>
        </Station>

        {/* ---- party game ---- */}
        <Station id="games" emoji="🪅" kicker="Party game" title="Break the pinata" sub="Five good whacks and it bursts. There is a fortune for your year hiding inside.">
          <Pinata fortunes={aud.fortunes} fx={fx} sound={sound} />
        </Station>

        {/* ---- reasons: only when the sender wrote some ---- */}
        {reasons.length > 0 && (
          <Station id="reasons" emoji="💌" kicker={aud.reasonsKick} title={aud.reasonsTitle} sub={aud.reasonsSub}>
            <ReasonDeck reasons={reasons} sender={sender} fx={fx} sound={sound} />
          </Station>
        )}

        {/* ---- their age in numbers: only when the sender gave the age ---- */}
        {data.age ? (
          <Station id="numbers" emoji="🔢" kicker="Fun facts" title={`${data.age} years of ${name}`} sub="Roughly speaking. We did the maths so you don't have to.">
            <AgeStats age={data.age} name={name} />
          </Station>
        ) : null}

        {/* ---- camera: prints the main photo ---- */}
        {mainPhoto && (
          <section id="camera" className="bd-sec pt-st" aria-label="A photo for you">
            <div className="bd-wrap"><PhotoCamera photo={mainPhoto} name={name} sound={sound} fx={fx} nextId="scratch" /></div>
          </section>
        )}

        {/* ---- scratch card: hides another photo ---- */}
        {mainPhoto && (
          <section id="scratch" className="bd-sec pt-st" aria-label="Scratch card">
            <div className="bd-wrap"><ScratchCard photo={scratchPhoto} name={name} sound={sound} fx={fx} nextId={after("scratch")} /></div>
          </section>
        )}

        {/* ---- the film: the video plays as a little movie ---- */}
        {data.video && (
          <section id="reel" className="bd-sec pt-st" aria-label="Your story">
            <div className="bd-wrap"><StoryReel video={data.video} photos={photos} name={name} sender={sender} sound={sound} /></div>
          </section>
        )}

        {/* ---- gallery ---- */}
        {hasGallery && (
          <Station id="moments" emoji="🖼️" kicker="Memories" title="The photo wall" sub="Tap any picture to see it bigger.">
            <Gallery photos={photos} video={null} mainPhotoId={data.mainPhotoId} sound={sound} />
          </Station>
        )}

        {/* ---- through the years: only when the sender added moments ---- */}
        {years.length > 0 && (
          <Station id="years" emoji="🧭" kicker="Rewind" title={aud.yearsTitle} sub={aud.yearsSub}>
            <Years items={years} />
          </Station>
        )}

        {/* ---- coupons: only when the sender made promises ---- */}
        {coupons.length > 0 && (
          <Station id="coupons" emoji="🎟️" kicker={aud.couponsKick} title={aud.couponsTitle} sub={aud.couponsSub}>
            <Coupons coupons={coupons} sender={sender} recipient={name} fx={fx} sound={sound} />
          </Station>
        )}

        <VoiceSection data={data} />

        {/* ---- letter ---- */}
        <Station id="note" emoji="✉️" kicker={`From ${sender}`} title={aud.letterTitle} sub="Sealed until today.">
          <div className="mem-reveal"><Letter message={data.message || ""} sender={sender} fx={fx} sound={sound} /></div>
        </Station>

        {/* ---- reply ---- */}
        <Station id="reply" emoji="💬" kicker="Your turn" title={aud.replyTitle} sub={`${sender} will read it. It stays here when you come back.`} label="Reply">
          <ReplyBox sender={sender} onReply={onReply} previous={replies} chips={aud.replies} />
        </Station>

        {/* ---- finale ---- */}
        <section id="finale" className="bd-sec pt-finale" aria-label="Fireworks">
          <div className="bd-wrap mem-reveal">
            <span className="pt-badge" aria-hidden>🎆</span>
            <p className="bd-kicker">One last thing</p>
            <h2 className="bd-h2">Happy Birthday, {name}</h2>
            <p className="bd-sub">{aud.partyLine}. One tap fills the sky.</p>
            <button type="button" className="bd-btn pt-sky-btn" onClick={lightTheSky} disabled={finale}><Sparkles className="h-4 w-4" aria-hidden /> {finale ? "Look up…" : "Light up the sky"}</button>
            <p className="pt-signoff">{aud.signoff},<br /><b>{sender}</b></p>
          </div>
        </section>

        <footer className="bd-foot">
          <p>Made with <Heart className="inline h-3.5 w-3.5" fill="currentColor" aria-hidden /> by {sender}</p>
          <p style={{ marginTop: 4 }}>Want to make one for someone? <Link to="/memories/birthday">Create your own birthday page</Link></p>
        </footer>
      </main>
    </div>
  );
}
