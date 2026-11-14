import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronDown, Heart } from "lucide-react";

import { useMemoriesChrome, useReveal } from "../../chrome";
import { FONT_LINKS } from "../../ui";
import "../../memories.css";
import "../birthday/birthday.css";
import "../sorry/sorry.css"; // the promise cards
import "../anniversary/anniversary.css"; // timeline
import "../common/reply.css";
import "./christmas.css";

import { createFx, prefersReducedMotion } from "../birthday/fx";
import { createSound } from "../birthday/audio";
import Gifts from "../birthday/Gifts";
import { VoiceSection } from "../../VoiceNote";
import Gallery from "../birthday/Gallery";
import PhotoCamera from "../common/PhotoCamera";
import ReplyBox from "../common/ReplyBox";
import Letter from "../birthday/Letter";
import VolumeControl from "../birthday/VolumeControl";
import { BgFloat } from "../birthday/decor";
import Promises from "../sorry/Promises";
import Timeline from "../anniversary/Timeline";

import { DEFAULT_THEME, resolveTheme } from "./themes";
import { audienceFor, DEFAULT_QUESTION, isWishReply } from "./audiences";
import { DUMMY_CHRISTMAS } from "./dummy";
import { GiftArt, TreeSvg } from "./art";
import ChristmasTree from "./ChristmasTree";
import WishAsk from "./WishAsk";
import { FlyingSleigh } from "./Santa";
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

/** Days until the 25th of December, in the viewer's own calendar. 0 = today, negative = it has passed this year. */
export const daysToChristmas = (now = new Date()) => {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((new Date(now.getFullYear(), 11, 25) - today) / 86400000);
};
const countdownText = (d) =>
  d > 1 ? `${d} sleeps until Christmas` : d === 1 ? "Christmas is tomorrow!" : d === 0 ? "It's Christmas Day! 🎄" : "Wishing you a magical holiday season";

/**
 * The Christmas page. `data` has the shape of DUMMY_CHRISTMAS; `theme` is the look the SENDER chose.
 * `data.audience` (partner, friend, family, colleague) changes the wording; `data.question` is the wish they ask.
 * Sections with nothing to show are simply left out.
 */
export default function ChristmasPage({ data = DUMMY_CHRISTMAS, theme: themeId = DEFAULT_THEME, response, onReply }) {
  useMemoriesChrome();
  useReveal([]);
  const hasGallery = Boolean(data.photos?.length || data.video);

  const theme = resolveTheme(themeId);
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const aud = audienceFor(data.audience);

  const canvasRef = useRef(null);
  const [fx, setFx] = useState(null);
  const sound = useMemo(() => createSound(), []);

  const [opened, setOpened] = useState(false);
  const [boom, setBoom] = useState(false);
  const [finale, setFinale] = useState(false);
  const [lit, setLit] = useState(false);
  const [flights, setFlights] = useState(0); // finale: one more sleigh each time the bells ring

  const { recipientName: name, senderName: sender } = data;
  const question = (data.question || "").trim() || DEFAULT_QUESTION;
  const lines = data.wishes?.length ? data.wishes : aud.lines;
  const reasons = (data.reasons || []).filter((r) => r && r.trim());
  const timeline = data.timeline || [];
  const promises = (data.promises || []).filter((p) => p && p.trim());
  const gifts = data.gifts || [];
  const days = useMemo(() => daysToChristmas(), []);
  const messages = (response?.replies || []).filter((r) => !isWishReply(r));

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
    sound.sfx.jingle?.();
    sound.sfx.chime();
    setOpened(true);
    window.scrollTo(0, 0);
    const { W, H } = fx?.size() || { W: window.innerWidth, H: window.innerHeight };
    setTimeout(() => fx?.confetti(W / 2, H * 0.55, { n: 50, power: 520 }), 300);
  };

  const lightUp = () => {
    track("snow_shake");
    sound.sfx.jingle?.();
    setLit(true);
    setTimeout(() => setLit(false), 1800);
    const { W, H } = fx?.size() || { W: 400, H: 700 };
    fx?.confetti(W / 2, H * 0.3, { n: 60, power: 380 });
  };

  const spread = useCallback(() => {
    track("finale");
    const { W, H } = fx?.size() || { W: 400, H: 700 };
    setFinale(true);
    sound.sfx.tada();
    setTimeout(() => sound.sfx.jingle?.(), 250);
    setTimeout(() => sound.sfx.cheer(), 500);
    fx?.popper(W * 0.06, H, 1); fx?.popper(W * 0.94, H, -1);
    fx?.rain(4200);
    [[0.25, 0.3, 300], [0.75, 0.26, 800], [0.5, 0.2, 1300]].forEach(([x, y, d]) => setTimeout(() => { fx?.firework(W * x, H * y); sound.sfx.pop(); }, d));
    setFlights((n) => n + 1);
    setBoom(true);
    setTimeout(() => setBoom(false), 3600);
  }, [fx, sound]);

  const firstSection = reasons.length ? "#tree" : timeline.length ? "#year" : "#wish";

  return (
    <div className={`bd-root xm-root ${opened ? "open" : ""}`} data-theme={theme.id} data-audience={aud.id} style={theme.vars}>
      <Helmet>
        <title>{`A Christmas page for ${name} | Memories`}</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content={theme.vars["--bd-bg-a"]} />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
        <link {...FREDOKA} />
      </Helmet>

      <div className="bd-bg" aria-hidden />
      <BgFloat theme={theme} spec={theme.float} />
      <canvas ref={canvasRef} className="bd-fx" aria-hidden />
      <VolumeControl sound={sound} visible={opened} />
      {boom && <div className="bd-boom" aria-hidden><span>Merry Christmas, {name}!</span></div>}

      {/* welcome */}
      <div className={`bd-gate ${opened ? "out" : ""}`} aria-hidden={opened}>
        <FlyingSleigh top="12%" size={230} dur={14} delay={0.6} className="gate" />
        <div>
          <GiftArt className="xm-gate-art" />
          <h1>A Christmas gift for {name}</h1>
          <p>{sender} wrapped something for you. Turn your sound on 🔊</p>
          <button type="button" className="bd-btn bd-gate-btn" onClick={open}>Open</button>
        </div>
      </div>

      <main className="bd-main">
        {/* ---- hero ---- */}
        <section className="bd-hero xm-hero" aria-label="Merry Christmas">
          <FlyingSleigh key={String(opened)} top={opened ? 56 : -400} size={300} dur={20} delay={2.5} onTap={() => { track("santa_tap"); sound.sfx.jingle?.(); }} />
          <div className="bd-hero-text xm-hero-text">
            <span className="bd-from"><Heart className="h-3.5 w-3.5" fill="currentColor" aria-hidden /> from {sender}</span>
            <button type="button" className={`xm-hero-tree ${lit ? "lit" : ""}`} onClick={lightUp} aria-label="Light up the tree">
              <TreeSvg className="xm-hero-svg" />
            </button>
            <h1 className="xm-merry">{aud.greeting}</h1>
            <p className="xm-name">{name}</p>
            <p className="xm-sub">{aud.heroSub}</p>
            <span className="xm-count">{countdownText(days)}</span>
            <Typed lines={lines} />
          </div>
          <a href={firstSection} className="bd-scroll" aria-label="Scroll down">Keep scrolling<ChevronDown className="h-4 w-4" aria-hidden /></a>
        </section>

        {reasons.length > 0 && (
          <section id="tree" className="bd-sec" aria-label="Wishing tree">
            <div className="bd-wrap">
              <Head kicker={aud.treeKick} title={aud.treeTitle} sub={aud.treeSub} />
              <div className="mem-reveal"><ChristmasTree reasons={reasons} fx={fx} sound={sound} /></div>
            </div>
          </section>
        )}

        {timeline.length > 0 && (
          <section id="year" className="bd-sec" aria-label="This year">
            <div className="bd-wrap">
              <Head kicker={aud.storyKick} title={aud.storyTitle} sub={aud.storySub} />
              <Timeline items={timeline} />
            </div>
          </section>
        )}

        {data.photos?.length > 0 && (
          <section id="camera" className="bd-sec" aria-label="A photo for you">
            <div className="bd-wrap"><PhotoCamera photo={data.photos?.find((x) => x.id === data.mainPhotoId) || data.photos?.[0]} name={name} sound={sound} fx={fx} nextId="moments" /></div>
          </section>
        )}

        {hasGallery && (
          <section id="moments" className="bd-sec">
            <div className="bd-wrap">
              <Head kicker="Memories" title="Moments to remember" sub="Tap any picture to see it bigger." />
              <Gallery photos={data.photos} video={data.video} mainPhotoId={data.mainPhotoId} sound={sound} />
            </div>
          </section>
        )}

        <VoiceSection data={data} />

        {gifts.length > 0 && (
          <section className="bd-sec" aria-label="Gifts">
            <div className="bd-wrap">
              <Head kicker="Under the tree" title={aud.giftTitle} sub={gifts.length === 1 ? "Tap the box to open it." : "Tap a box to open it."} />
              <Gifts gifts={gifts} sender={sender} recipient={name} pattern={theme.giftPattern} boxes={theme.boxes} tagText="Merry Christmas" fx={fx} sound={sound}
                onAllOpen={() => { const { W, H } = fx?.size() || { W: 400, H: 700 }; fx?.confetti(W / 2, H * 0.5, { n: 60, power: 520 }); sound.sfx.chime(); }} />
            </div>
          </section>
        )}

        {promises.length > 0 && (
          <section className="bd-sec" aria-label="Promises">
            <div className="bd-wrap">
              <Head kicker="Looking ahead" title={aud.promiseTitle} sub={aud.promiseSub} />
              <Promises promises={promises} sender={sender} fx={fx} sound={sound} />
            </div>
          </section>
        )}

        <section className="bd-sec">
          <div className="bd-wrap">
            <Head kicker={`From ${sender}`} title={aud.letterTitle} />
            <div className="mem-reveal"><Letter message={data.message} sender={sender} fx={fx} sound={sound} /></div>
          </div>
        </section>

        {/* ---- the wish ---- */}
        <section id="wish" className="bd-sec" aria-label="Make a wish">
          <div className="bd-wrap">
            <Head kicker={aud.wishKick} title="A wish for you" sub={aud.wishSub} />
            <WishAsk question={question} chips={aud.wishChips} sender={sender} fx={fx} sound={sound} onReply={onReply} previous={response?.replies || []} />
            <Head kicker="Your turn" title="Say Merry Christmas back" />
            <div className="mem-reveal">
              <ReplyBox sender={sender} onReply={onReply} previous={messages} chips={aud.replies} placeholder="Write a Christmas message…" />
            </div>
          </div>
        </section>

        {/* ---- finale ---- */}
        <section className="bd-sec xm-finale" aria-label="Merry Christmas">
          {flights > 0 && <FlyingSleigh key={flights} top={30} size={300} dur={7} delay={0} once />}
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">{aud.greeting}</p>
            <h2 className="bd-h2 xm-finale-title mem-reveal">Merry Christmas, {name}</h2>
            <TreeSvg className="xm-finale-art mem-reveal" />
            <div className="mem-reveal">
              <button type="button" className="bd-btn xm-spread" onClick={spread}>{finale ? "Again! 🔔" : `${aud.finaleBtn} 🔔`}</button>
              {finale && <p className="xm-finale-note">{aud.greeting}, {name}. {aud.signoff}, {sender}.</p>}
            </div>
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
