import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/*
  RESUME LAB PROMO, shown on the books pages, the learn page and the book payment pages.
  Built from the same pieces as /resume-review: the marked-up resume (struck-out duty line, highlighted fix, red-pen notes,
  score strip), the highlighter headline and the pine-green buttons. Light first; dark only when the site is in dark mode.

    variant "strip"   one slim line (top of the payment pages)
    variant "banner"  a medium band (book pages)
    variant "card"    the full block (after downloads, learn page)

  Self-contained on purpose: scoped CSS (classes start with "rvp-"), no Tailwind, no other stylesheet.
  It sizes itself with container queries, so it fits a narrow payment column as well as a full-width page;
  browsers without container queries get the stacked phone layout, which works everywhere.
  `isDark` is optional: without it the component follows the site's theme.
*/
const TO = "/resume-review";
const PLANS = "/resume-review#pricing";
const SAMPLE = "/resume-review#sample";
const FONTS = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Geist+Mono:wght@500;600&display=swap";

/* ---------------------------------------------------------------- theme */
const readTheme = () => {
  try {
    const t = window.localStorage.getItem("theme");
    if (t === "dark" || t === "light") return t;
    const h = document.documentElement;
    if (h.getAttribute("data-theme") === "dark" || h.classList.contains("dark")) return "dark";
    return "light";
  } catch { return "light"; }
};
function useSiteTheme(forced) {
  const [theme, setTheme] = useState(() => (typeof window === "undefined" ? "light" : readTheme()));
  useEffect(() => {
    if (typeof forced === "boolean") return undefined;
    const sync = (e) => { const n = e?.detail?.theme; setTheme(n === "dark" || n === "light" ? n : readTheme()); };
    window.addEventListener("targettrek-theme-change", sync);
    window.addEventListener("themechange", sync);
    window.addEventListener("storage", sync);
    const mo = new MutationObserver(() => sync());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    sync();
    return () => {
      window.removeEventListener("targettrek-theme-change", sync); window.removeEventListener("themechange", sync);
      window.removeEventListener("storage", sync); mo.disconnect();
    };
  }, [forced]);
  return typeof forced === "boolean" ? (forced ? "dark" : "light") : theme;
}

/* ---------------------------------------------------------------- icons (inline, so nothing else is needed) */
const Arrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Check = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
const Pdf = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>;
const Brain = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 4a3 3 0 0 0-3 3v.5A3 3 0 0 0 4 10.4 3 3 0 0 0 5 15.5V16a3 3 0 0 0 4 2.8V4z" /><path d="M15 4a3 3 0 0 1 3 3v.5a3 3 0 0 1 2 2.9 3 3 0 0 1-1 5.1V16a3 3 0 0 1-4 2.8V4z" /></svg>;
const Person = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>;
const In = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 11v6M8 7.5v.01M12 17v-6M16 17v-3.5a2.5 2.5 0 0 0-4 0" /></svg>;

/* ---------------------------------------------------------------- the marked-up resume, same as the /resume-review hero */
function Paper({ compact = false }) {
  return (
    <figure className={`rvp-paper${compact ? " rvp-paper-sm" : ""}`} aria-hidden="true">
      <div className="rvp-paper-bar"><Pdf /><span>asha-rao-backend.pdf</span><em>p. 1 / 1</em></div>
      <div className="rvp-paper-body">
        <p className="rvp-paper-name">Asha Rao</p>
        <p className="rvp-paper-sub">Backend Engineer · Bengaluru · 3 yrs</p>
        <p className="rvp-paper-h">Experience</p>
        <p className="rvp-line"><s>Responsible for maintaining APIs and fixing bugs.</s></p>
        <p className="rvp-line"><mark>Maintained 40+ REST APIs and cut production bugs by 35%</mark> by adding tests.</p>
        <p className="rvp-pen">↳ Duty, not a result. Add a number.</p>
        {!compact && <>
          <p className="rvp-paper-h">Skills</p>
          <p className="rvp-line">Java, Spring Boot, PostgreSQL <span className="rvp-gap">+ Kafka?</span></p>
          <p className="rvp-pen">↳ The job asks for Kafka.</p>
        </>}
      </div>
      <div className="rvp-strip-scores">
        <div><span>Overall</span><b>62<small>/100</small></b></div>
        <div><span>ATS</span><b>71<small>/100</small></b></div>
        <div className="rvp-kw"><span>Missing keywords</span><p><i>Kafka</i><i>Docker</i><i>CI/CD</i></p></div>
      </div>
    </figure>
  );
}

const FACTS = [["~2 min", "AI report"], ["Real people", "review it"], ["Pay once", "no subscription"]];
const FEATURES = [
  [Brain, "AI report in about 2 minutes", "Overall and ATS score, section grades, missing keywords and rewritten bullets."],
  [Person, "A working professional reviews it", "Plain-language notes on your story, level and fit. Not a template."],
  [In, "LinkedIn review too", "Your profile checked against your resume, so both tell one story."],
];

export default function ResumePromo({ variant = "card", isDark, className = "", lead = "You studied the book.", accent = "Now get the interview call.", pain = false }) {
  const theme = useSiteTheme(isDark);
  const shared = <><link rel="stylesheet" href={FONTS} /><style>{CSS}</style></>;

  if (variant === "strip") {
    return (
      <div className={`rvp rvp-strip ${className}`} data-theme={theme}>
        {shared}
        <div className="rvp-strip-in">
          <span className="rvp-strip-ico"><Pdf /></span>
          <p className="rvp-strip-text"><b>Not getting interview calls?</b> <span>Get your resume checked by AI in minutes, then by a working professional.</span></p>
          <Link to={TO} className="rvp-btn rvp-btn-sm">Review my resume <Arrow /></Link>
        </div>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <section className={`rvp rvp-banner ${className}`} data-theme={theme} aria-label="Resume Lab by Target Trek">
        {shared}
        <div className="rvp-in">
          <div className="rvp-copy">
            <span className="rvp-kicker"><i />Resume Lab by Target Trek</span>
            <h2 className="rvp-h">Applying everywhere but getting <mark>no interview calls?</mark></h2>
            <p className="rvp-p">Your book gets you ready for the interview. A better resume gets you the call. See exactly which lines cost you shortlists, and how to fix each one.</p>
            <dl className="rvp-facts">{FACTS.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
            <div className="rvp-row">
              <Link to={PLANS} className="rvp-btn">See plans <Arrow /></Link>
              <Link to={SAMPLE} className="rvp-btn rvp-btn-ghost">See a sample report</Link>
            </div>
          </div>
          <div className="rvp-art"><Paper compact /></div>
        </div>
      </section>
    );
  }

  return (
    <section className={`rvp rvp-card ${className}`} data-theme={theme} aria-label="Resume Lab by Target Trek">
      {shared}
      <div className="rvp-in">
        <div className="rvp-copy">
          {pain && <span className="rvp-alert"><i />Applied to 50+ jobs and heard nothing?</span>}
          <span className="rvp-kicker"><i />Resume Lab by Target Trek</span>
          <h2 className="rvp-h rvp-h-xl">{lead} <mark>{accent}</mark></h2>
          <p className="rvp-p">Most resumes are rejected by software or skimmed in ten seconds. Find out exactly what is costing you shortlists, and how to fix it.</p>
          <ul className="rvp-list">
            {FEATURES.map(([Icon, t, d]) => <li key={t}><span><Icon /></span><div><b>{t}</b><small>{d}</small></div></li>)}
          </ul>
          <div className="rvp-row">
            <Link to={PLANS} className="rvp-btn rvp-btn-lg">See plans <Arrow /></Link>
            <Link to={SAMPLE} className="rvp-btn rvp-btn-lg rvp-btn-ghost">See a sample report</Link>
          </div>
          <p className="rvp-fine"><Check /> One-time payment · No subscription · Plans cannot be cancelled once bought</p>
        </div>
        <div className="rvp-art"><Paper /></div>
      </div>
    </section>
  );
}

/* light first; [data-theme="dark"] swaps the tokens */
const CSS = `
.rvp{--bg:#ffffff;--bg2:#f2f7f5;--card:#ffffff;--ink:#0c1a17;--muted:#4a5d58;--subtle:#74877f;--line:#dbe6e2;--line2:#c3d2cd;--brand:#0f766e;--brand2:#115e59;--on:#ffffff;--soft:#e3f3ef;--mark:#fde68a;--mark-ink:#1c1917;--pen:#dc2626;--bad-soft:#fdeee6;--bad:#c2410c;--warn:#a16207;--shadow:0 1px 2px rgba(12,26,23,.05),0 18px 44px -22px rgba(12,26,23,.28);
  --display:"Bricolage Grotesque",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;--mono:"Geist Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  box-sizing:border-box;width:100%;color:var(--ink);text-align:left;font-family:inherit;container-type:inline-size;-webkit-text-size-adjust:100%}
.rvp[data-theme="dark"]{--bg:#0f1c1a;--bg2:#132422;--card:#0b1715;--ink:#e8f2ef;--muted:#a3b8b2;--subtle:#73897f;--line:#21352f;--line2:#2e4641;--brand:#2dd4bf;--brand2:#5eead4;--on:#04201c;--soft:#0f2b27;--mark:#a16207;--mark-ink:#fffbeb;--pen:#f87171;--bad-soft:#2b1a10;--bad:#fb923c;--warn:#facc15;--shadow:0 1px 2px rgba(0,0,0,.4),0 18px 44px -22px rgba(0,0,0,.7)}
.rvp *,.rvp *::before,.rvp *::after{box-sizing:border-box}
.rvp a{text-decoration:none}
.rvp ul,.rvp dl{list-style:none;margin:0;padding:0}
.rvp h2,.rvp p,.rvp dd,.rvp figure{margin:0}
.rvp mark{background:linear-gradient(transparent 12%,var(--mark) 12%,var(--mark) 88%,transparent 88%);color:var(--mark-ink);padding:0 .12em;border-radius:3px;-webkit-box-decoration-break:clone;box-decoration-break:clone}

/* buttons */
.rvp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:46px;padding:11px 20px;border-radius:12px;border:1px solid var(--brand);background:var(--brand);color:var(--on)!important;font-size:15px;font-weight:700;line-height:1.2;white-space:nowrap;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background-color .2s,border-color .2s,color .2s,transform .2s}
.rvp-btn:hover{background:var(--brand2);border-color:var(--brand2)}
.rvp-btn:active{transform:scale(.98)}
.rvp-btn:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
.rvp-btn-sm{min-height:40px;padding:8px 14px;font-size:13.5px;border-radius:10px}
.rvp-btn-lg{min-height:50px;padding:13px 24px;font-size:16px}
.rvp-btn-ghost{background:var(--card);border-color:var(--line2);color:var(--ink)!important}
.rvp-btn-ghost:hover{background:var(--card);border-color:var(--brand);color:var(--brand)!important}
.rvp-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:22px}

/* type */
.rvp-kicker{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:var(--brand)}
.rvp-kicker i{width:8px;height:8px;border-radius:50%;background:var(--brand);box-shadow:0 0 0 4px var(--soft)}
.rvp-h{margin-top:12px!important;font-family:var(--display);font-size:25px;line-height:1.12;font-weight:800;letter-spacing:-.025em;color:var(--ink);overflow-wrap:break-word}
.rvp-h-xl{font-size:29px}
.rvp-p{margin-top:12px!important;font-size:15px;line-height:1.65;color:var(--muted);max-width:560px}
.rvp-alert{display:inline-flex;align-items:center;gap:8px;margin-bottom:12px;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:700;color:var(--bad);background:var(--bad-soft)}
.rvp-alert i{width:7px;height:7px;border-radius:50%;background:currentColor}
.rvp-copy>.rvp-kicker{display:flex}

/* facts + features */
.rvp-facts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin-top:18px!important;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--line);max-width:520px}
.rvp-facts>div{background:var(--card);padding:10px 12px;min-width:0}
.rvp-facts dt{font-family:var(--display);font-size:16px;font-weight:800;letter-spacing:-.02em;color:var(--ink)}
.rvp-facts dd{font-size:12px;color:var(--muted);margin-top:1px}
.rvp-list{display:grid;gap:12px;margin-top:20px!important}
.rvp-list li{display:flex;gap:12px;align-items:flex-start}
.rvp-list li>span{flex:0 0 auto;display:flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;background:var(--soft);color:var(--brand)}
.rvp-list b{display:block;font-size:15px;color:var(--ink)}
.rvp-list small{display:block;margin-top:2px;font-size:13.5px;line-height:1.5;color:var(--muted)}
.rvp-fine{display:flex;align-items:center;gap:6px;margin-top:14px!important;font-size:12.5px;color:var(--subtle)}
.rvp-fine svg{color:var(--brand);flex:0 0 auto}

/* the marked-up resume */
.rvp-paper{width:100%;max-width:400px;background:var(--card);border:1px solid var(--line2);border-radius:16px;box-shadow:var(--shadow);overflow:hidden;color:var(--ink)}
.rvp-paper-bar{display:flex;align-items:center;gap:8px;padding:9px 14px;font-size:12px;font-weight:600;color:var(--muted);background:var(--bg2);border-bottom:1px solid var(--line);min-width:0}
.rvp-paper-bar svg{color:var(--pen);flex:0 0 auto}
.rvp-paper-bar span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
.rvp-paper-bar em{margin-left:auto;font-style:normal;font-family:var(--mono);color:var(--subtle);flex:0 0 auto}
.rvp-paper-body{display:grid;gap:6px;padding:16px 18px 14px}
.rvp-paper-name{font-family:var(--display);font-size:19px;font-weight:800;letter-spacing:-.02em}
.rvp-paper-sub{font-size:12px;color:var(--muted);margin-top:-3px!important}
.rvp-paper-h{margin-top:8px!important;padding-bottom:3px;font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--subtle);border-bottom:1px solid var(--line)}
.rvp-line{position:relative;padding-left:12px;font-size:13px;line-height:1.5;overflow-wrap:break-word}
.rvp-line::before{content:"";position:absolute;left:1px;top:.62em;width:4px;height:4px;border-radius:50%;background:var(--subtle)}
.rvp-line s{color:var(--subtle);text-decoration-color:var(--pen);text-decoration-thickness:2px}
.rvp-pen{margin-left:12px!important;font-family:var(--display);font-style:italic;font-weight:700;font-size:13px;color:var(--pen);transform:rotate(-1.2deg);transform-origin:left}
.rvp-gap{display:inline-block;padding:0 5px;border:1.5px dashed var(--pen);border-radius:5px;color:var(--pen);font-weight:700;font-size:12px}
.rvp-strip-scores{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--line);border-top:1px solid var(--line)}
.rvp-strip-scores>div{background:var(--bg2);padding:9px 14px;display:grid;gap:3px;min-width:0}
.rvp-strip-scores span{font-size:9.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--subtle)}
.rvp-strip-scores b{font-family:var(--mono);font-size:21px;font-weight:600;letter-spacing:-.03em;line-height:1;color:var(--warn)}
.rvp-strip-scores small{font-size:11px;color:var(--subtle);margin-left:2px}
.rvp-kw{grid-column:1/-1}
.rvp-kw p{display:flex;flex-wrap:wrap;gap:4px}
.rvp-kw i{font-style:normal;font-size:11.5px;font-weight:700;padding:2px 7px;border-radius:6px;background:var(--bad-soft);color:var(--bad)}

/* strip */
.rvp-strip{margin-bottom:16px}
.rvp-strip-in{display:flex;align-items:center;gap:12px;padding:10px 10px 10px 12px;border:1px solid var(--line);border-radius:14px;background:var(--bg);box-shadow:0 1px 2px rgba(12,26,23,.04)}
.rvp-strip-ico{flex:0 0 auto;width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;background:var(--mark);color:var(--mark-ink)}
.rvp-strip-text{flex:1 1 auto;min-width:0;font-size:13.5px;line-height:1.45;color:var(--muted)}
.rvp-strip-text b{color:var(--ink)}
.rvp-strip .rvp-btn{flex:0 0 auto}
@container (max-width:560px){.rvp-strip-in{flex-wrap:wrap}.rvp-strip-text{flex:1 1 calc(100% - 50px)}.rvp-strip-text span{display:none}.rvp-strip .rvp-btn{width:100%}}

/* banner + card: light surface with a soft green glow, never a dark panel in light mode */
.rvp-banner .rvp-in,.rvp-card .rvp-in{display:flex;flex-direction:column;gap:26px;padding:24px 20px;border-radius:24px;border:1px solid var(--line);background-color:var(--bg);background-image:radial-gradient(circle 420px at 100% 0,rgba(15,118,110,.11),transparent),radial-gradient(circle 300px at 0 100%,rgba(253,230,138,.22),transparent)}
.rvp[data-theme="dark"] .rvp-in{background-image:radial-gradient(circle 420px at 100% 0,rgba(45,212,191,.12),transparent)}
.rvp-copy{min-width:0;flex:1 1 auto}
.rvp-art{display:flex;justify-content:center;min-width:0}
.rvp-card .rvp-in{box-shadow:var(--shadow)}
@container (min-width:520px){.rvp-banner .rvp-in,.rvp-card .rvp-in{padding:32px}.rvp-h{font-size:28px}.rvp-h-xl{font-size:34px}}
@container (min-width:860px){
  .rvp-banner .rvp-in,.rvp-card .rvp-in{flex-direction:row;align-items:center;gap:44px;padding:40px}
  .rvp-art{flex:0 0 360px}
  .rvp-h{font-size:31px}.rvp-h-xl{font-size:40px}
  .rvp-paper{transform:rotate(1.2deg)}
}
@container (max-width:460px){.rvp-banner .rvp-btn,.rvp-card .rvp-btn{width:100%}.rvp-facts dt{font-size:14px}}
@media (prefers-reduced-motion:reduce){.rvp-btn{transition:none}.rvp-paper{transform:none!important}}
`;
