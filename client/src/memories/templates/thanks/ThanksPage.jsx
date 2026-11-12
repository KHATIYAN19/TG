import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronDown, Heart } from "lucide-react";

import { useMemoriesChrome, useReveal } from "../../chrome";
import { FONT_LINKS } from "../../ui";
import "../../memories.css";
import "../birthday/birthday.css";
import "../sorry/sorry.css"; // the promise cards
import "../anniversary/anniversary.css"; // timeline + number tiles
import "./thanks.css";

import { createFx, prefersReducedMotion } from "../birthday/fx";
import { createSound } from "../birthday/audio";
import Gifts from "../birthday/Gifts";
import { VoiceSection } from "../../VoiceNote";
import Gallery from "../birthday/Gallery";
import PhotoCamera from "../common/PhotoCamera";
import Letter from "../birthday/Letter";
import VolumeControl from "../birthday/VolumeControl";
import { BgFloat } from "../birthday/decor";
import Promises from "../sorry/Promises";
import Timeline from "../anniversary/Timeline";

import { DEFAULT_THEME, resolveTheme } from "./themes";
import { audienceFor } from "./audiences";
import { DUMMY_THANKS, DEFAULT_GREETING } from "./dummy";
import { GateArt } from "./art";
import GratitudeTree from "./GratitudeTree";
import People from "./People";
import ThanksStats from "./ThanksStats";
import SayThanksBack from "./SayThanksBack";
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

/**
 * The Thank You page. `data` has the shape of DUMMY_THANKS; `theme` is the theme the SENDER chose.
 * `data.audience` (friend, family, colleague, team, mentor, community) changes the wording of the whole page.
 * Sections with nothing to show are simply left out.
 */
export default function ThanksPage({ data = DUMMY_THANKS, theme: themeId = DEFAULT_THEME, response, onReply }) {
  useMemoriesChrome();
  useReveal([]);
  const hasGallery = Boolean(data.photos?.length || data.video); // no photos or videos yet: no gallery section

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

  const { recipientName: name, senderName: sender } = data;
  const greeting = (data.question || "").trim() || DEFAULT_GREETING;
  const lines = data.wishes?.length ? data.wishes : aud.lines;
  const reasons = (data.reasons || []).filter((r) => r && r.trim());
  const people = (data.people || []).filter((p) => p.title && p.title.trim());
  const timeline = data.timeline || [];
  const stats = (data.stats || []).filter((s) => s.label && s.value);
  const promises = (data.promises || []).filter((p) => p && p.trim());
  const gifts = data.gifts || [];

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
    setTimeout(() => fx?.confetti(W / 2, H * 0.55, { n: 46, power: 520 }), 300);
  };


  const spread = useCallback(() => {
    track("finale");
    const { W, H } = fx?.size() || { W: 400, H: 700 };
    setFinale(true);
    sound.sfx.tada();
    setTimeout(() => sound.sfx.cheer(), 300);
    fx?.popper(W * 0.06, H, 1); fx?.popper(W * 0.94, H, -1);
    fx?.rain(3600);
    fx?.hearts(W / 2, H * 0.6, 26);
    [[0.25, 0.3, 300], [0.75, 0.26, 800], [0.5, 0.2, 1300]].forEach(([x, y, d]) => setTimeout(() => { fx?.firework(W * x, H * y); sound.sfx.pop(); }, d));
    setBoom(true);
    setTimeout(() => setBoom(false), 3600);
  }, [fx, sound]);

  const firstSection = reasons.length ? "#gratitude" : people.length ? "#people" : "#reply";

  return (
    <div className={`bd-root th-root ${opened ? "open" : ""}`} data-theme={theme.id} data-audience={aud.id} style={theme.vars}>
      <Helmet>
        <title>{`A thank-you for ${name} | Memories`}</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content={theme.vars["--bd-bg-a"]} />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
        <link {...FREDOKA} />
      </Helmet>

      <div className="bd-bg" aria-hidden />
      <BgFloat theme={theme} spec={theme.float} />
      <canvas ref={canvasRef} className="bd-fx" aria-hidden />
      <VolumeControl sound={sound} visible={opened} />
      {boom && <div className="bd-boom" aria-hidden><span>Thank you, {name}!</span></div>}

      {/* welcome */}
      <div className={`bd-gate ${opened ? "out" : ""}`} aria-hidden={opened}>
        <div>
          <GateArt kind={theme.art} className="th-gate-art" />
          <h1>A thank-you for {name}</h1>
          <p>{sender} has something to say. Turn your sound on 🔊</p>
          <button type="button" className="bd-btn bd-gate-btn" onClick={open}>Open</button>
        </div>
      </div>

      <main className="bd-main">
        {/* ---- hero ---- */}
        <section className="bd-hero th-hero" aria-label="Thank you">
          <div className="bd-hero-text th-hero-text">
            <span className="bd-from"><Heart className="h-3.5 w-3.5" fill="currentColor" aria-hidden /> from {sender}</span>
            <p className="th-greeting">{greeting}</p>
            <GateArt kind={theme.art} className="th-hero-art" />
            <h1 className="th-thank">{aud.heroTitle}</h1>
            <p className="th-name">{name}</p>
            <p className="th-sub">{aud.heroSub}</p>
            <Typed lines={lines} />
          </div>
          <a href={firstSection} className="bd-scroll" aria-label="Scroll down">Keep scrolling<ChevronDown className="h-4 w-4" aria-hidden /></a>
        </section>

        {reasons.length > 0 && (
          <section id="gratitude" className="bd-sec" aria-label="Gratitude tree">
            <div className="bd-wrap">
              <Head kicker={aud.treeKick} title={aud.treeTitle} sub={aud.treeSub} />
              <div className="mem-reveal"><GratitudeTree reasons={reasons} fx={fx} sound={sound} /></div>
            </div>
          </section>
        )}

        {people.length > 0 && (
          <section id="people" className="bd-sec" aria-label="People">
            <div className="bd-wrap">
              <Head kicker={aud.peopleKick} title={aud.peopleTitle} sub={aud.peopleSub} />
              <People people={people} react={aud.react} fx={fx} sound={sound} />
            </div>
          </section>
        )}

        {timeline.length > 0 && (
          <section className="bd-sec" aria-label="Moments">
            <div className="bd-wrap">
              <Head kicker={aud.storyKick} title={aud.storyTitle} sub={aud.storySub} />
              <Timeline items={timeline} />
            </div>
          </section>
        )}

        {stats.length > 0 && (
          <section className="bd-sec" aria-label="In numbers">
            <div className="bd-wrap">
              <Head kicker="By the numbers" title={aud.statsTitle} />
              <ThanksStats stats={stats} />
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
            <Head kicker="Memories" title="Moments to remember" sub="Tap any picture to see it bigger." />
            <Gallery photos={data.photos} video={data.video} mainPhotoId={data.mainPhotoId} sound={sound} />
          </div>
        </section>
        )}

        <VoiceSection data={data} />

        {gifts.length > 0 && (
          <section className="bd-sec" aria-label="Gifts">
            <div className="bd-wrap">
              <Head kicker="A small thank-you" title={aud.giftTitle} sub={gifts.length === 1 ? "Tap the box to open it." : "Tap a box to open it."} />
              <Gifts gifts={gifts} sender={sender} recipient={name} pattern={theme.giftPattern} boxes={theme.boxes} tagText="With thanks" fx={fx} sound={sound}
                onAllOpen={() => { const { W, H } = fx?.size() || { W: 400, H: 700 }; fx?.confetti(W / 2, H * 0.5, { n: 60, power: 520 }); sound.sfx.chime(); }} />
            </div>
          </section>
        )}

        {promises.length > 0 && (
          <section className="bd-sec" aria-label="Promises">
            <div className="bd-wrap">
              <Head kicker="Going forward" title={aud.promiseTitle} sub={aud.promiseSub} />
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

        <section id="reply" className="bd-sec" aria-label="Say thanks back">
          <div className="bd-wrap">
            <Head kicker="Your turn" title="Say something back" sub={`${sender} would love to hear from you.`} />
            <SayThanksBack replies={aud.replies} sender={sender} fx={fx} sound={sound} onReply={onReply} previous={response?.replies || []} />
          </div>
        </section>

        {/* ---- finale ---- */}
        <section className="bd-sec th-finale" aria-label="Thank you">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">{greeting}</p>
            <h2 className="bd-h2 th-finale-title mem-reveal">Thank you, {name}</h2>
            <GateArt kind={theme.art} className="th-finale-art mem-reveal" />
            <div className="mem-reveal">
              <button type="button" className="bd-btn th-spread" onClick={spread}>{finale ? "Again! 🍂" : aud.finaleBtn}</button>
              {finale && <p className="th-finale-note">{greeting}, {name}. {aud.signoff}, {sender}.</p>}
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
