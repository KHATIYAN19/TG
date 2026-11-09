import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Hand, Quote } from "lucide-react";

import { PhoneFrame, TEMPLATES, rememberTemplate } from "./templates";
import { Button, cx } from "./ui";
import { THEME_LIST as BIRTHDAY_THEMES } from "./templates/birthday/themes";
import { THEME_LIST as SORRY_THEMES } from "./templates/sorry/themes";
import { THEME_LIST as ANNIVERSARY_THEMES } from "./templates/anniversary/themes";
import { THEME_LIST as PROPOSAL_THEMES } from "./templates/proposal/themes";
import { THEME_LIST as THANKS_THEMES } from "./templates/thanks/themes";
import { AUDIENCES } from "./templates/thanks/audiences";

/* what each template adds on top of the catalog entry: an icon for its tab and the looks the sender can pick */
export const META = {
  birthday: { emoji: "🎂", themes: BIRTHDAY_THEMES, short: "Pop, cut, unwrap" },
  sorry: { emoji: "🧸", themes: SORRY_THEMES, short: "Say it softly" },
  proposal: { emoji: "💍", themes: PROPOSAL_THEMES, short: "The big question" },
  anniversary: { emoji: "🥂", themes: ANNIVERSARY_THEMES, short: "Your love story" },
  thanks: { emoji: "🍂", themes: THANKS_THEMES, short: "Say thank you" },
};
/** a scale for small screens and one for big ones, kept in step with the window */
export function useScale(small, big, breakpoint = 640) {
  const calc = () => (typeof window !== "undefined" && window.innerWidth < breakpoint ? small : big);
  const [v, setV] = useState(calc);
  useEffect(() => { const on = () => setV(calc()); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}

export const THEME_TOTAL = Object.values(META).reduce((n, m) => n + m.themes.length, 0);

const srcFor = (t, theme, audience, live) =>
  `${t.demo}?embed=1&auto=1${live ? "&live=1" : ""}${theme ? `&theme=${theme}` : ""}${audience ? `&audience=${audience}` : ""}`;

/**
 * The REAL template page, running live inside a phone. It is the actual /memories/preview/... route in an iframe
 * (embed mode), scaled down to fit the screen. A "Tap to try" cover stops it from stealing page scrolling until the visitor wants it.
 */
export function LivePhone({ template, theme, audience, scale = 1, eager = false, onTry, className, live }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(eager);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState(false);
  const iframeRef = useRef(null);
  // In live mode the page is loaded ONCE and then fed the form's data; changing the look must not reload it.
  const firstTheme = useRef(theme);
  const src = live ? srcFor(template, firstTheme.current, audience, true) : srcFor(template, theme, audience);

  const post = useCallback(() => {
    if (live) iframeRef.current?.contentWindow?.postMessage({ type: "memories:live", data: live, themeId: theme }, window.location.origin);
  }, [live, theme]);
  useEffect(() => {
    if (!live) return undefined;
    const on = (e) => { if (e.origin === window.location.origin && e.source === iframeRef.current?.contentWindow && e.data?.type === "memories:live-ready") post(); };
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [live, post]);
  useEffect(() => { if (!live || !loaded) return undefined; const t = setTimeout(post, 120); return () => clearTimeout(t); }, [live, loaded, post]);

  useEffect(() => { setLoaded(false); setActive(false); }, [src]);
  useEffect(() => {
    if (seen) return undefined;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: "200px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [seen]);

  return (
    <div ref={ref} className={className} style={{ width: 280 * scale, height: 580 * scale }}>
      <PhoneFrame scale={scale}>
        <div className="relative h-full w-full bg-[#fff4f0]">
          {!loaded && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-rose-200 border-t-rose-500" role="status" aria-label="Loading the template" />
            </div>
          )}
          {seen && (
            <iframe
              ref={iframeRef} key={src} src={src} title={`${template.name} template, live preview`} onLoad={() => setLoaded(true)}
              className={cx("absolute left-0 top-0 border-0 bg-white transition-opacity duration-500", loaded ? "opacity-100" : "opacity-0")}
              style={{ width: 390, height: 833, transform: `scale(${264 / 390})`, transformOrigin: "0 0" }}
            />
          )}
          {loaded && !active && (
            <button
              type="button" onClick={() => { setActive(true); onTry?.(); }}
              className="group absolute inset-0 z-10 flex items-end justify-center bg-gradient-to-t from-black/25 via-transparent to-transparent pb-6"
              aria-label={`Try the ${template.name} template`}
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-rose-600 shadow-lg ring-1 ring-rose-100 transition group-hover:scale-105">
                <Hand className="h-3.5 w-3.5" aria-hidden /> Tap to try it
              </span>
            </button>
          )}
        </div>
      </PhoneFrame>
    </div>
  );
}

/** Name, looks, what's inside, who it's for and a sample line. `children` are the buttons under it. Shared by the home page and the signed-in studio. */
export function TemplatePanel({ t, theme, onTheme, audience, onAudience, children, compact = false }) {
  const meta = META[t.id];
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className={cx("font-bold text-[#3a1530]", compact ? "text-2xl" : "text-2xl sm:text-3xl")}>{t.name}</h3>
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">Ready to use</span>
      </div>
      <p className="mt-2 text-[#7a5370]">{t.tagline}</p>

      <h4 className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-rose-500">{meta.themes.length} looks to choose from</h4>
      <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label={`${t.name} looks`}>
        {meta.themes.map((th) => {
          const on = (theme || meta.themes[0].id) === th.id;
          return (
            <button key={th.id} type="button" role="radio" aria-checked={on} onClick={() => onTheme(th.id)} title={th.blurb}
              className={cx("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition", on ? "border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-100" : "border-rose-100 bg-white text-[#6b3a5a] hover:bg-rose-50")}>
              <span className="flex -space-x-1" aria-hidden>{(th.swatch || []).slice(0, 3).map((c, i) => <i key={i} className="h-3.5 w-3.5 rounded-full ring-1 ring-white" style={{ background: c }} />)}</span>
              {th.name}
            </button>
          );
        })}
      </div>

      {t.id === "thanks" && (
        <>
          <h4 className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-rose-500">Who are you thanking?</h4>
          <div className="mt-3 flex flex-wrap gap-2" role="radiogroup" aria-label="Who are you thanking">
            {AUDIENCES.map((a) => {
              const on = (audience || "friend") === a.id;
              return (
                <button key={a.id} type="button" role="radio" aria-checked={on} onClick={() => onAudience(a.id)}
                  className={cx("rounded-full border px-3 py-1.5 text-xs font-semibold transition", on ? "border-rose-400 bg-rose-50 text-rose-700 ring-2 ring-rose-100" : "border-rose-100 bg-white text-[#6b3a5a] hover:bg-rose-50")}>
                  {a.emoji} {a.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <h4 className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-rose-500">What&apos;s inside</h4>
      <ul className={cx("mt-3 grid gap-x-6 gap-y-2.5", !compact && "sm:grid-cols-2")}>
        {t.inside.map((x) => (
          <li key={x} className="flex gap-2.5 text-sm text-[#4a2340]">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600"><Check className="h-3 w-3" strokeWidth={3} aria-hidden /></span>
            <span>{x}</span>
          </li>
        ))}
      </ul>

      <h4 className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-rose-500">Perfect for</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {t.best.map((b) => <span key={b} className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-100">{b}</span>)}
      </div>

      <figure className="mt-6 rounded-2xl bg-[#fff4f0] p-4">
        <Quote className="h-5 w-5 text-rose-300" aria-hidden />
        <blockquote className="mem-script mt-1 text-xl leading-snug text-[#7a2a4f]">{t.sample}</blockquote>
        <figcaption className="mt-1 text-xs text-[#a07890]">Sample message. You write your own.</figcaption>
      </figure>

      {children}
    </div>
  );
}

/* ---------------------------------------------------- the template showcase */
export default function Showcase() {
  const [idx, setIdx] = useState(0);
  const [theme, setTheme] = useState(null);
  const [audience, setAudience] = useState(null);
  const t = TEMPLATES[idx];
  const scale = useScale(0.9, 1.02);
  const pick = (i) => { setIdx(i); setTheme(null); setAudience(null); };

  return (
    <div className="mt-10">
      {/* tabs */}
      <div role="tablist" aria-label="Templates" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0">
        {TEMPLATES.map((x, i) => (
          <button
            key={x.id} type="button" role="tab" aria-selected={i === idx} id={`tab-${x.id}`} onClick={() => pick(i)}
            className={cx("flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
              i === idx ? "border-transparent bg-gradient-to-r from-rose-500 to-orange-400 text-white shadow-lg shadow-rose-200" : "border-rose-100 bg-white text-[#6b3a5a] hover:border-rose-300 hover:bg-rose-50")}
          >
            <span aria-hidden className="text-base">{META[x.id].emoji}</span> {x.name}
          </button>
        ))}
      </div>

      <div role="tabpanel" aria-labelledby={`tab-${t.id}`} className="mt-8 grid items-start gap-8 lg:grid-cols-[auto_1fr] lg:gap-14">
        {/* the real page */}
        <div className="mx-auto">
          <div className={cx("relative rounded-[44px] bg-gradient-to-br p-5 sm:p-7", t.tint)}>
            <LivePhone key={t.id} template={t} theme={theme} audience={audience} scale={scale} />
          </div>
          <p className="mt-3 text-center text-xs text-[#8a6a80]">This is the real page, not a picture. Scroll it and tap things.</p>
        </div>

        <TemplatePanel t={t} theme={theme} onTheme={setTheme} audience={audience} onAudience={setAudience}>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button as={Link} to={`/memories/login?mode=signup&template=${t.theme}`} onClick={() => rememberTemplate(t.theme)} size="lg">Create this page</Button>
            <Button as={Link} to={`${t.demo}${theme ? `?theme=${theme}` : ""}`} target="_blank" rel="noopener noreferrer" variant="outline" size="lg">Open full screen <ArrowUpRight className="h-4 w-4" aria-hidden /></Button>
          </div>
        </TemplatePanel>
      </div>
    </div>
  );
}
