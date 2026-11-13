import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check, Plus } from "@phosphor-icons/react";

import { useMedia } from "./chrome";
import { TEMPLATES, rememberTemplate } from "./templates";
import { LivePhone, META, THEME_TOTAL } from "./Showcase";
import { AUDIENCES } from "./templates/thanks/audiences";
import { Btn, LookArt, OCCASION, SIGNUP, SectionHead, useNear } from "./landingUi";
import { cx } from "./ui";

/*
  THE TEMPLATES, as a scroll story.
    Desktop: one real, live phone stays pinned on the left while the five occasions scroll past on the right.
             The occasion in the middle of the screen is the one in the phone; picking a look repaints it.
    Phone and tablet: every occasion is a card with its own live phone, mounted only while it is near the screen.
  Below it, a wall of every look across all five occasions.
*/

const two = (n) => String(n).padStart(2, "0");

/* a phone that is only a real page while it is close to the screen */
function NearPhone({ t, theme, audience, scale }) {
  const ref = useRef(null);
  const near = useNear(ref);
  return (
    <div ref={ref} style={{ width: 280 * scale, height: 580 * scale }}>
      {near && <LivePhone key={t.id} template={t} theme={theme} audience={audience} scale={scale} eager />}
    </div>
  );
}

function Chapter({ t, i, on, desktop, theme, onTheme, audience, onAudience, innerRef }) {
  const o = OCCASION[t.id];
  const looks = META[t.id].themes;
  const picked = theme || looks[0].id;
  const [all, setAll] = useState(false);
  const inside = all ? t.inside : t.inside.slice(0, 4);

  return (
    <article ref={innerRef} data-i={i} data-on={on} className="ml-chapter flex flex-col justify-center rounded-3xl bg-white p-6 ring-1 ring-[#f5dfe4] sm:p-8 lg:min-h-[80vh] lg:bg-transparent lg:px-0 lg:py-16 lg:ring-0">
      <div className="mem-reveal">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl" style={{ background: o.tint, color: o.ink }}><o.Icon size={24} weight="duotone" aria-hidden /></span>
          <p className="caption-3 tabular-nums text-[#a07890]">{two(i + 1)} / {two(TEMPLATES.length)}</p>
        </div>
        <h3 className="heading-3 mt-4 text-[#2a1023]">{t.name}</h3>
        <p className="body-3 mt-2 max-w-xl text-[#7a5370]">{t.tagline}</p>
      </div>

      {!desktop && (
        <div className="mem-reveal mt-6 flex flex-col items-center rounded-3xl p-6" style={{ background: o.tint }}>
          <NearPhone t={t} theme={theme} audience={audience} scale={0.86} />
          <p className="caption-4 mt-4 text-center text-[#6b3a5a]">The real page, not a picture. Tap it and scroll.</p>
        </div>
      )}

      <div className="mem-reveal mt-8">
        <h4 className="ml-kicker caption-3">{looks.length} looks. Tap one to try it.</h4>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4" role="radiogroup" aria-label={`${t.name} looks`}>
          {looks.map((th) => (
            <button key={th.id} type="button" role="radio" aria-checked={picked === th.id} title={th.blurb} onClick={() => onTheme(th.id)} className="ml-swatch relative rounded-2xl bg-white p-2 text-left">
              <LookArt swatch={th.swatch} className="h-16 rounded-lg" />
              <span className="caption-3 mt-2 block truncate px-0.5 text-[#2a1023]">{th.name}</span>
              {picked === th.id && <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-[#e11d48] text-white"><Check size={12} weight="bold" aria-hidden /></span>}
            </button>
          ))}
        </div>
      </div>

      {t.id === "thanks" && (
        <div className="mem-reveal mt-6">
          <h4 className="ml-kicker caption-3">Who are you thanking?</h4>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Who are you thanking">
            {AUDIENCES.map((a) => {
              const sel = (audience || "friend") === a.id;
              return <button key={a.id} type="button" role="radio" aria-checked={sel} onClick={() => onAudience(a.id)} className={cx("ml-chip caption-3 rounded-full px-3 py-2", sel ? "bg-[#2a1023] text-white" : "bg-white text-[#6b3a5a] ring-1 ring-inset ring-[#f5dfe4]")}>{a.label}</button>;
            })}
          </div>
        </div>
      )}

      <div className="mem-reveal mt-8">
        <h4 className="ml-kicker caption-3">What they get to do</h4>
        <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {inside.map((x) => (
            <li key={x} className="body-6 flex gap-3 text-[#4a2340]">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full" style={{ background: o.tint, color: o.ink }}><Check size={12} weight="bold" aria-hidden /></span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
        {t.inside.length > 4 && !all && (
          <button type="button" onClick={() => setAll(true)} className="caption-3 mt-3 inline-flex items-center gap-1 rounded-full px-2 py-1 text-[#be123c] transition-colors duration-300 hover:bg-rose-50">
            <Plus size={12} weight="bold" aria-hidden /> {t.inside.length - 4} more inside
          </button>
        )}
      </div>

      <div className="mem-reveal mt-6 flex flex-wrap gap-2">
        {t.best.map((b) => <span key={b} className="caption-4 rounded-full px-3 py-1" style={{ background: o.tint, color: o.ink }}>{b}</span>)}
      </div>

      <div className="mem-reveal mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Btn to={`${SIGNUP}&template=${t.theme}`} onClick={() => rememberTemplate(t.theme)}>Create a {t.name.toLowerCase()} page <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
        <Btn to={`${t.demo}${theme ? `?theme=${theme}` : ""}`} target="_blank" rel="noopener noreferrer" variant="ghost">Open it full screen <ArrowUpRight size={16} weight="bold" aria-hidden /></Btn>
      </div>
    </article>
  );
}

export function TemplateStory() {
  const desktop = useMedia("(min-width: 1024px)");
  const tall = useMedia("(min-height: 820px)");
  const [active, setActive] = useState(0); // the chapter in the middle of the screen (lights up at once)
  const [shown, setShown] = useState(0); // the one in the phone (follows a moment later, so fast scrolling doesn't reload it five times)
  const [themes, setThemes] = useState({});
  const [audience, setAudience] = useState(null);
  const refs = useRef([]);

  useEffect(() => {
    if (!desktop || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) setActive(Number(e.target.dataset.i)); }), { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((n) => n && io.observe(n));
    return () => io.disconnect();
  }, [desktop]);
  useEffect(() => { const id = setTimeout(() => setShown(active), 260); return () => clearTimeout(id); }, [active]);

  const t = TEMPLATES[shown];
  const o = OCCASION[t.id];
  const jump = (i) => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24" aria-labelledby="templates-h">
      <SectionHead id="templates" kicker="Templates" title={<span id="templates-h">Five occasions. Every one is the real page.</span>} text="Nothing here is a screenshot. Scroll through the occasions, switch the look, and play with exactly what they will open on their phone." />

      <div className="mt-12 lg:mt-16 lg:grid lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-16">
        {desktop && (
          <div className="relative">
            <div className="sticky top-24">
              <div className="ml-stage flex flex-col items-center rounded-3xl p-6" style={{ background: o.tint }}>
                <LivePhone key={t.id} template={t} theme={themes[t.id]} audience={t.id === "thanks" ? audience : null} scale={tall ? 0.96 : 0.8} eager />
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="caption-4 text-[#7a5370]">The real {t.name.toLowerCase()} page. Tap it.</p>
                <div className="flex gap-1" role="tablist" aria-label="Jump to an occasion">
                  {TEMPLATES.map((x, i) => {
                    const Ic = OCCASION[x.id].Icon;
                    return (
                      <button key={x.id} type="button" role="tab" aria-selected={i === active} aria-label={x.name} title={x.name} onClick={() => jump(i)}
                        className={cx("ml-chip grid h-8 w-8 place-items-center rounded-full", i === active ? "bg-[#2a1023] text-white" : "bg-white text-[#6b3a5a] ring-1 ring-inset ring-[#f5dfe4]")}>
                        <Ic size={16} weight={i === active ? "fill" : "regular"} aria-hidden />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6 lg:space-y-0">
          {TEMPLATES.map((x, i) => (
            <Chapter
              key={x.id} t={x} i={i} on={!desktop || i === active} desktop={desktop} innerRef={(n) => { refs.current[i] = n; }}
              theme={themes[x.id]} onTheme={(id) => { setThemes((m) => ({ ...m, [x.id]: id })); if (desktop) setActive(i); }}
              audience={audience} onAudience={(id) => { setAudience(id); if (desktop) setActive(i); }}
            />
          ))}
        </div>
      </div>
      <p className="mem-reveal caption-4 mt-12 flex items-center justify-center gap-2 text-center text-[#8a6a80]"><Plus size={14} weight="bold" className="text-[#e11d48]" aria-hidden /> More occasions and looks are added all the time.</p>
    </section>
  );
}

/* ---------------------------------------------------- every look, on one wall */
const LOOKS = TEMPLATES.flatMap((t) => META[t.id].themes.map((th) => ({ t, th })));
const ROWS = [LOOKS.filter((_, i) => i % 2 === 0), LOOKS.filter((_, i) => i % 2 === 1)];

function LookCard({ t, th, hidden }) {
  const o = OCCASION[t.id];
  return (
    <a href={`${t.demo}?theme=${th.id}`} target="_blank" rel="noopener noreferrer" tabIndex={hidden ? -1 : undefined} className="ml-look mr-4 block w-56 shrink-0 rounded-3xl bg-[#272727] p-2 sm:w-64" aria-label={`${th.name}, a ${t.name} look. Opens the live page.`}>
      <span className="relative block">
        <LookArt swatch={th.swatch} className="h-32 rounded-2xl" />
        <span className="caption-3 absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1" style={{ color: o.ink }}><o.Icon size={12} weight="fill" aria-hidden /> {t.name}</span>
        <span className="absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white text-[#2a1023]"><ArrowUpRight size={14} weight="bold" aria-hidden /></span>
      </span>
      <span className="block p-2">
        <span className="title-3 block truncate text-white">{th.name}</span>
        <span className="caption-5 mt-1 block h-8 overflow-hidden text-[#9b9b9b]">{th.blurb}</span>
      </span>
    </a>
  );
}

export function LookWall() {
  return (
    <section className="ml-dark bg-[#181818] py-20 sm:py-24" aria-labelledby="looks-h">
      <div className="px-4 sm:px-6">
        <SectionHead dark id="looks" kicker="Looks" title={<span id="looks-h">{THEME_TOTAL} looks. One for every mood.</span>} text="Candy pink to midnight, autumn harvest to a starlit sky. Every look repaints the whole page: its colours, its art and its little surprises. Tap any card to open that page live." />
      </div>
      <div className="mem-reveal mt-12 space-y-4">
        {ROWS.map((row, r) => (
          <div key={r} className="ml-marquee py-2" style={{ "--dur": `${row.length * 5}s`, "--dir": r ? "reverse" : "normal" }}>
            <div className="ml-marquee-track">
              <div className="ml-marquee-group">{row.map((x) => <LookCard key={`${x.t.id}-${x.th.id}`} {...x} />)}</div>
              <div className="ml-marquee-group" aria-hidden>{row.map((x) => <LookCard key={`${x.t.id}-${x.th.id}`} {...x} hidden />)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mem-reveal mt-12 flex justify-center px-4"><Btn to={SIGNUP} variant="light">Pick your look <ArrowRight size={16} weight="bold" aria-hidden /></Btn></div>
    </section>
  );
}
