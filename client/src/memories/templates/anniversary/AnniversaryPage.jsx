import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ChevronDown, Heart } from "lucide-react";

import { useMemoriesChrome, useReveal } from "../../chrome";
import { FONT_LINKS } from "../../ui";
import "../../memories.css";
import "../birthday/birthday.css";
import "../sorry/sorry.css"; // the promise cards
import "./anniversary.css";

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

import { DEFAULT_THEME, resolveTheme } from "./themes";
import { DUMMY_ANNIVERSARY, DEFAULT_LINES } from "./dummy";
import { HeroDecorAnn } from "./decor";
import { Couple } from "./art";
import TogetherCounter, { elapsed, ordinal, parseSince, prettyDate } from "./TogetherCounter";
import Timeline from "./Timeline";
import LoveStats from "./LoveStats";
import LoveJar from "./LoveJar";
import Lanterns from "./Lanterns";
import Toast from "./Toast";
import BouquetBuilder from "./BouquetBuilder";
import { track } from "../../track";
import ReplyBox from "../common/ReplyBox";

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
 * The Anniversary page. `data` has the shape of DUMMY_ANNIVERSARY, `theme` is the theme the SENDER chose.
 * Sections with nothing to show (timeline, reasons, gifts, promises) are simply left out.
 */
export default function AnniversaryPage({ data = DUMMY_ANNIVERSARY, theme: themeId = DEFAULT_THEME, response, onReply }) {
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
  const [forever, setForever] = useState(false);

  const { recipientName: name, senderName: sender } = data;
  const lines = data.wishes?.length ? data.wishes : DEFAULT_LINES;
  const start = parseSince(data.since);
  const years = start ? elapsed(start).years : 0;
  const timeline = data.timeline || [];
  const reasons = (data.reasons || []).filter((r) => r && r.trim());
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
    sound.sfx.tada();
    setOpened(true);
    window.scrollTo(0, 0);
    const { W, H } = fx?.size() || { W: window.innerWidth, H: window.innerHeight };
    setTimeout(() => fx?.hearts(W / 2, H * 0.6, 24), 300);
  };


  /* the finale */
  const foreverNow = useCallback(() => {
    track("finale");
    const { W, H } = fx?.size() || { W: 400, H: 700 };
    setForever(true);
    sound.sfx.tada();
    setTimeout(() => sound.sfx.bang(), 60);
    fx?.popper(W * 0.06, H, 1); fx?.popper(W * 0.94, H, -1);
    fx?.rain(3400);
    fx?.hearts(W / 2, H * 0.6, 34);
    [[0.22, 0.3, 200], [0.78, 0.24, 650], [0.5, 0.18, 1100], [0.35, 0.36, 1500], [0.65, 0.32, 1900]].forEach(([x, y, d]) => setTimeout(() => { fx?.firework(W * x, H * y); sound.sfx.pop(); }, d));
    setBoom(true);
    setTimeout(() => setBoom(false), 3600);
  }, [fx, sound]);

  const happy = years > 0 ? `Happy ${ordinal(years)} Anniversary` : "Happy Anniversary";

  return (
    <div className={`bd-root an-root ${opened ? "open" : ""}`} data-theme={theme.id} style={theme.vars}>
      <Helmet>
        <title>{`Happy Anniversary ${name}! | Memories`}</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content={theme.vars["--bd-bg-a"]} />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
        <link {...FREDOKA} />
      </Helmet>

      <div className="bd-bg" aria-hidden />
      <BgFloat theme={theme} spec={theme.float} />
      <canvas ref={canvasRef} className="bd-fx" aria-hidden />
      <VolumeControl sound={sound} visible={opened} />
      {boom && <div className="bd-boom" aria-hidden><span>{happy}!</span></div>}

      {/* welcome */}
      <div className={`bd-gate ${opened ? "out" : ""}`} aria-hidden={opened}>
        <div>
          <Couple className="an-gate-couple" />
          <h1>A love story for {name}</h1>
          <p>{sender} made this for your anniversary. Turn your sound on 🔊</p>
          <button type="button" className="bd-btn bd-gate-btn" onClick={open}>Open our story</button>
        </div>
      </div>

      <main className="bd-main">
        {/* ---- hero ---- */}
        <section className="bd-hero an-hero" aria-label="Happy Anniversary">
          <HeroDecorAnn theme={theme} />
          <div className="bd-hero-text an-hero-text">
            <span className="bd-from"><Heart className="h-3.5 w-3.5" fill="currentColor" aria-hidden /> from {sender}</span>
            <p className="an-happy">{happy}</p>
            <h1 className="an-names"><span className="n">{sender}</span><span className="amp" aria-hidden>♥</span><span className="n">{name}</span></h1>
            {start && <span className="an-since">Together since {prettyDate(start)}</span>}
            <TogetherCounter since={data.since} />
            <Typed lines={lines} />
          </div>
          <a href="#story" className="bd-scroll" aria-label="Scroll down">Our story<ChevronDown className="h-4 w-4" aria-hidden /></a>
        </section>

        {/* ---- our story ---- */}
        {timeline.length > 0 && (
          <section id="story" className="bd-sec" aria-label="Our story">
            <div className="bd-wrap">
              <Head kicker="A love story" title="How it all began" sub="Every moment that brought us here." />
              <Timeline items={timeline} />
            </div>
          </section>
        )}

        {/* ---- by the numbers ---- */}
        {(start || stats.length > 0) && (
          <section className="bd-sec" aria-label="Our love in numbers">
            <div className="bd-wrap">
              <Head kicker="By the numbers" title="Our love, counted" sub="Some things are worth keeping count of." />
              <LoveStats since={data.since} stats={stats} />
            </div>
          </section>
        )}

        {/* ---- love jar ---- */}
        {reasons.length > 0 && (
          <section className="bd-sec" aria-label="Reasons I love you">
            <div className="bd-wrap">
              <Head kicker="Little reasons" title="Why I love you" sub="Pull a reason out of the jar. There's one for every day." />
              <div className="mem-reveal"><LoveJar reasons={reasons} name={name} sender={sender} fx={fx} sound={sound} /></div>
            </div>
          </section>
        )}

        {/* ---- gallery ---- */}
        {/* ---- camera: clicks and prints the main photo ---- */}
        {data.photos?.length > 0 && (
          <section id="camera" className="bd-sec" aria-label="A photo for you">
            <div className="bd-wrap"><PhotoCamera photo={data.photos?.find((x) => x.id === data.mainPhotoId) || data.photos?.[0]} name={name} sound={sound} fx={fx} nextId="moments" /></div>
          </section>
        )}

        {hasGallery && (
        <section id="moments" className="bd-sec">
          <div className="bd-wrap">
            <Head kicker="Memories" title="Moments we keep" sub="Tap any picture to see it bigger." />
            <Gallery photos={data.photos} video={data.video} mainPhotoId={data.mainPhotoId} sound={sound} />
          </div>
        </section>
        )}

        <VoiceSection data={data} />

        {/* ---- cheers ---- */}
        <section className="bd-sec">
          <div className="bd-wrap">
            <Head kicker="Cheers" title="To us" sub="Clink the glasses." />
            <div className="mem-reveal"><Toast fx={fx} sound={sound} sender={sender} name={name} /></div>
          </div>
        </section>

        {/* ---- bouquet ---- */}
        <section className="bd-sec" aria-label="Build a bouquet">
          <div className="bd-wrap">
            <Head kicker="Flowers for you" title="Build a bouquet" sub="Pick the flowers one by one. I'd give you the whole garden if I could." />
            <div className="mem-reveal"><BouquetBuilder recipient={name} sender={sender} fx={fx} sound={sound} /></div>
          </div>
        </section>

        {/* ---- gifts ---- */}
        {gifts.length > 0 && (
          <section className="bd-sec" aria-label="Gifts">
            <div className="bd-wrap">
              <Head kicker="For my love" title={gifts.length === 1 ? "A gift, with all my heart" : "Gifts, with all my heart"} sub={gifts.length === 1 ? "Tap the box to unwrap it." : "Tap a box to unwrap it."} />
              <Gifts gifts={gifts} sender={sender} recipient={name} pattern={theme.giftPattern} boxes={theme.boxes} tagText="For my love" fx={fx} sound={sound}
                onAllOpen={() => { const { W, H } = fx?.size() || { W: 400, H: 700 }; fx?.hearts(W / 2, H * 0.5, 22); fx?.firework(W * 0.5, H * 0.3); sound.sfx.chime(); }} />
            </div>
          </section>
        )}

        {/* ---- promises ---- */}
        {promises.length > 0 && (
          <section className="bd-sec" aria-label="Promises">
            <div className="bd-wrap">
              <Head kicker="My promises" title="For every year ahead" sub="Tap each card to open it." />
              <Promises promises={promises} sender={sender} fx={fx} sound={sound} />
            </div>
          </section>
        )}

        {/* ---- lanterns ---- */}
        <section className="bd-sec" aria-label="Wish lanterns">
          <div className="bd-wrap">
            <Head kicker="Make a wish" title="Send our wishes up" sub="Release a lantern for every wish." />
            <div className="mem-reveal"><Lanterns wishes={lines} fx={fx} sound={sound} /></div>
          </div>
        </section>

        {/* ---- letter ---- */}
        <section className="bd-sec">
          <div className="bd-wrap">
            <Head kicker={`From ${sender}`} title="A letter for you" />
            <div className="mem-reveal"><Letter message={data.message} sender={sender} fx={fx} sound={sound} /></div>
          </div>
        </section>

        {/* ---- a reply ---- */}
        <section className="bd-sec" aria-label="Reply">
          <div className="bd-wrap">
            <Head kicker="Your turn" title={`Say something to ${sender}`} sub="They'll read it. It stays here when you come back." />
            <ReplyBox sender={sender} onReply={onReply} previous={response?.replies || []} chips={["Happy anniversary, my love 💞", "I love you more", "Thank you for everything", "Forever with you"]} />
          </div>
        </section>

        {/* ---- finale ---- */}
        <section className="bd-sec an-finale" aria-label="Forever">
          <div className="bd-wrap">
            <p className="bd-kicker mem-reveal">Always</p>
            <h2 className="bd-h2 an-finale-title mem-reveal">Here&apos;s to us</h2>
            <Couple className="an-couple mem-reveal" />
            <div className="mem-reveal">
              <button type="button" className="bd-btn an-forever" onClick={foreverNow}>{forever ? "Again! 💞" : "Here's to forever"}</button>
              {forever && <p className="an-forever-note">Happy {years > 0 ? ordinal(years) : ""} Anniversary, {name}. I love you more every day.</p>}
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
