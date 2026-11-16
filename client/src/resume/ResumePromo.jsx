import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/*
  Resume Lab promotion shown on the books pages and on the book payment pages.
  Self-contained on purpose: its own scoped CSS (class names start with "rvp-"), no Tailwind and no other stylesheet,
  so it looks the same on every page and in every browser. Plain flexbox and grid, no newer CSS features.

    variant "strip"   one small line (top of the payment pages)
    variant "banner"  a medium horizontal band (books pages)
    variant "card"    the full, beautiful card (after the downloads)

  `isDark` is optional: without it the component follows the site's theme (localStorage "theme", the html.dark class and the theme event).
*/
const TO = "/resume-review";
const SAMPLE = "/resume-review#sample";

const readTheme = () => {
  try {
    const t = window.localStorage.getItem("theme");
    if (t === "dark" || t === "light") return t;
    return document.documentElement.classList.contains("dark") ? "dark" : "light";
  } catch { return "light"; }
};
function useSiteTheme(forced) {
  const [theme, setTheme] = useState(() => (typeof window === "undefined" ? "light" : readTheme()));
  useEffect(() => {
    if (typeof forced === "boolean") return undefined;
    const sync = (e) => { const n = e?.detail?.theme; setTheme(n === "dark" || n === "light" ? n : readTheme()); };
    window.addEventListener("targettrek-theme-change", sync);
    window.addEventListener("storage", sync);
    const mo = new MutationObserver(() => sync());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => { window.removeEventListener("targettrek-theme-change", sync); window.removeEventListener("storage", sync); mo.disconnect(); };
  }, [forced]);
  return typeof forced === "boolean" ? (forced ? "dark" : "light") : theme;
}

const Doc = ({ s = 20 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h4" /></svg>
);
const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const Check = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);

/* a small, static picture of the report, in CSS and SVG only */
function MiniReport() {
  const r = 38, c = 2 * Math.PI * r;
  return (
    <div className="rvp-mini" aria-hidden="true">
      <div className="rvp-mini-top">
        <div className="rvp-ring">
          <svg width="92" height="92" viewBox="0 0 92 92"><circle cx="46" cy="46" r={r} fill="none" stroke="currentColor" strokeOpacity=".14" strokeWidth="8" /><circle cx="46" cy="46" r={r} fill="none" stroke="#ea580c" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.22} transform="rotate(-90 46 46)" /></svg>
          <span>78</span>
        </div>
        <div><b>Your resume score</b><small>ATS ready · 5 fixes found</small></div>
      </div>
      {[["Experience", 84, "#16a34a"], ["Skills", 72, "#ea580c"], ["Projects", 58, "#dc2626"]].map(([n, v, col]) => (
        <div key={n} className="rvp-bar"><div><span>{n}</span><span>{v}</span></div><i><u style={{ width: `${v}%`, background: col }} /></i></div>
      ))}
      <div className="rvp-note"><b>Fix first:</b> add numbers to your bullets.</div>
    </div>
  );
}

export default function ResumePromo({ variant = "card", isDark, className = "", lead = "You studied the book.", accent = "Now get the interview call.", pain = false }) {
  const theme = useSiteTheme(isDark);

  if (variant === "strip") {
    return (
      <div className={`rvp rvp-strip ${className}`} data-theme={theme}>
        <style>{CSS}</style>
        <span className="rvp-badge"><Doc s={18} /></span>
        <p className="rvp-strip-text"><b>Not getting interview calls?</b> <span>Get your resume reviewed by AI and a working professional.</span></p>
        <Link to={TO} className="rvp-btn rvp-btn-sm">Review my resume <Arrow /></Link>
      </div>
    );
  }

  if (variant === "banner") {
    return (
      <section className={`rvp rvp-banner ${className}`} data-theme={theme} aria-label="Resume Lab by Target Trek">
        <style>{CSS}</style>
        <div className="rvp-banner-main">
          <span className="rvp-kicker">Resume Lab by Target Trek</span>
          <h2 className="rvp-h">Applying everywhere but getting no interview calls?</h2>
          <p className="rvp-p">Your book gets you ready for the interview. A better resume gets you the call. Get an AI report in minutes, then notes from a working professional.</p>
          <ul className="rvp-tags"><li>AI + ATS check</li><li>Human review</li><li>LinkedIn review</li></ul>
          <div className="rvp-row">
            <Link to={TO} className="rvp-btn">See plans <Arrow /></Link>
            <Link to={SAMPLE} className="rvp-btn rvp-btn-ghost">See a sample review</Link>
          </div>
        </div>
        <div className="rvp-banner-art"><MiniReport /></div>
      </section>
    );
  }

  return (
    <section className={`rvp rvp-card ${className}`} data-theme={theme} aria-label="Resume Lab by Target Trek">
      <style>{CSS}</style>
      <div className="rvp-card-main">
        {pain && <span className="rvp-alert"><i aria-hidden="true" />Applied to 50+ jobs and heard nothing?</span>}
        <span className="rvp-kicker rvp-kicker-on">Resume Lab by Target Trek</span>
        <h2 className="rvp-h rvp-h-xl">{lead} <span>{accent}</span></h2>
        <p className="rvp-p">Most resumes are rejected by software or skimmed in ten seconds. Find out exactly what is costing you shortlists, and how to fix it.</p>
        <ul className="rvp-list">
          <li><span><Check /></span><div><b>AI report in minutes</b><small>Overall and ATS score, section grades, missing keywords, rewritten bullets.</small></div></li>
          <li><span><Check /></span><div><b>A working professional reviews it</b><small>Plain-language notes on your story, level and fit, not a template.</small></div></li>
          <li><span><Check /></span><div><b>LinkedIn review too</b><small>One consistent story across your resume and your profile.</small></div></li>
        </ul>
        <div className="rvp-row">
          <Link to={TO} className="rvp-btn rvp-btn-lg">See plans <Arrow /></Link>
          <Link to={SAMPLE} className="rvp-btn rvp-btn-lg rvp-btn-ghost-dark">See a sample review</Link>
        </div>
        <p className="rvp-fine">One-time payment · No subscription · Plans cannot be cancelled once bought</p>
      </div>
      <div className="rvp-card-art"><MiniReport /></div>
    </section>
  );
}

const CSS = `
.rvp-alert{display:-webkit-inline-flex;display:inline-flex;-webkit-align-items:center;align-items:center;gap:8px;margin-bottom:14px;padding:6px 14px;border-radius:9999px;font-size:13px;font-weight:700;color:#fecaca;background:rgba(220,38,38,.18);border:1px solid rgba(248,113,113,.4)}
.rvp-alert i{width:8px;height:8px;border-radius:50%;background:#f87171;display:inline-block}
.rvp-card .rvp-kicker{display:block}
.rvp{--rvp-bg:#fff7ed;--rvp-card:#ffffff;--rvp-ink:#1c1410;--rvp-muted:#6b5a4e;--rvp-line:#f0e4d8;--rvp-brand:#ea580c;--rvp-brand2:#c2410c;--rvp-soft:#ffedd5;box-sizing:border-box;font-family:inherit;color:var(--rvp-ink);text-align:left}
.rvp[data-theme="dark"]{--rvp-bg:#1f1814;--rvp-card:#29201b;--rvp-ink:#fff7ed;--rvp-muted:#b9a79c;--rvp-line:#3b2a20;--rvp-brand:#f97316;--rvp-brand2:#fb923c;--rvp-soft:#3a2012}
.rvp *,.rvp *::before,.rvp *::after{box-sizing:border-box}
.rvp a{text-decoration:none}
.rvp ul{list-style:none;margin:0;padding:0}
.rvp h2,.rvp p{margin:0}
.rvp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:11px 20px;border-radius:12px;border:1px solid var(--rvp-brand);background:var(--rvp-brand);color:#fff!important;font-size:15px;font-weight:700;line-height:1.2;white-space:nowrap;cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-transition:background .25s,transform .25s;transition:background .25s,transform .25s}
.rvp-btn:hover{background:var(--rvp-brand2);border-color:var(--rvp-brand2)}
.rvp-btn:active{-webkit-transform:scale(.98);transform:scale(.98)}
.rvp-btn-sm{min-height:38px;padding:8px 14px;font-size:13px;border-radius:10px}
.rvp-btn-lg{min-height:50px;padding:14px 26px;font-size:16px}
.rvp-btn-ghost{background:transparent;color:var(--rvp-ink)!important;border-color:var(--rvp-line)}
.rvp-btn-ghost:hover{background:var(--rvp-soft);border-color:var(--rvp-brand)}
.rvp-btn-ghost-dark{background:transparent;color:#fff7ed!important;border-color:rgba(255,247,237,.3)}
.rvp-btn-ghost-dark:hover{background:rgba(255,247,237,.08);border-color:#fb923c}
.rvp-row{display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;gap:12px;margin-top:24px}
.rvp-kicker{display:inline-block;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:var(--rvp-brand)}
.rvp-kicker-on{color:#fdba74}
.rvp-h{font-size:24px;line-height:1.15;font-weight:800;letter-spacing:-.02em;margin-top:10px!important}
.rvp-p{margin-top:12px!important;font-size:15px;line-height:1.65;color:var(--rvp-muted)}

/* strip */
.rvp-strip{display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;gap:12px;padding:10px 12px;border:1px solid var(--rvp-line);border-radius:14px;background:var(--rvp-bg);margin-bottom:16px}
.rvp-badge{-webkit-flex:0 0 auto;flex:0 0 auto;width:34px;height:34px;border-radius:10px;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center;background:var(--rvp-brand);color:#fff}
.rvp-strip-text{-webkit-flex:1 1 auto;flex:1 1 auto;min-width:0;font-size:13px;line-height:1.4;color:var(--rvp-muted)}
.rvp-strip-text b{color:var(--rvp-ink)}
.rvp-strip .rvp-btn{-webkit-flex:0 0 auto;flex:0 0 auto}
@media (max-width:640px){.rvp-strip{-webkit-flex-wrap:wrap;flex-wrap:wrap}.rvp-strip-text{-webkit-flex:1 1 calc(100% - 50px);flex:1 1 calc(100% - 50px)}.rvp-strip .rvp-btn{width:100%}.rvp-strip-text span{display:none}}

/* mini report picture */
.rvp-mini{width:100%;max-width:340px;padding:20px;border-radius:20px;background:var(--rvp-card);color:var(--rvp-ink);border:1px solid var(--rvp-line);box-shadow:0 24px 60px -24px rgba(0,0,0,.45)}
.rvp-mini-top{display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;gap:14px;margin-bottom:16px}
.rvp-mini-top b{display:block;font-size:15px}
.rvp-mini-top small{display:block;margin-top:2px;font-size:12px;color:var(--rvp-muted)}
.rvp-ring{position:relative;width:92px;height:92px;-webkit-flex:0 0 auto;flex:0 0 auto;color:var(--rvp-ink)}
.rvp-ring span{position:absolute;top:0;right:0;bottom:0;left:0;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center;font-size:28px;font-weight:800;letter-spacing:-.04em}
.rvp-bar{margin-top:10px}
.rvp-bar div{display:-webkit-flex;display:flex;-webkit-justify-content:space-between;justify-content:space-between;font-size:12px;font-weight:700;margin-bottom:5px}
.rvp-bar i{display:block;height:6px;border-radius:9999px;background:var(--rvp-line);overflow:hidden}
.rvp-bar u{display:block;height:100%;border-radius:9999px}
.rvp-note{margin-top:16px;padding:10px 12px;border-radius:10px;background:var(--rvp-soft);font-size:12.5px;line-height:1.5}

/* banner */
.rvp-banner{display:-webkit-flex;display:flex;-webkit-flex-direction:column;flex-direction:column;gap:24px;padding:24px;border-radius:22px;border:1px solid var(--rvp-line);background:var(--rvp-bg);background-image:-webkit-radial-gradient(100% 0,circle 340px,rgba(234,88,12,.16),transparent);background-image:radial-gradient(circle 340px at 100% 0,rgba(234,88,12,.16),transparent)}
.rvp-banner-main{min-width:0;-webkit-flex:1 1 auto;flex:1 1 auto}
.rvp-banner-art{display:none}
.rvp .rvp-tags{display:-webkit-flex;display:flex;-webkit-flex-wrap:wrap;flex-wrap:wrap;gap:8px;margin-top:18px}
.rvp-tags li{padding:5px 12px;border-radius:9999px;font-size:12px;font-weight:700;background:var(--rvp-card);border:1px solid var(--rvp-line)}
@media (min-width:640px){.rvp-banner{padding:32px}.rvp-h{font-size:28px}}
@media (min-width:900px){.rvp-banner{-webkit-flex-direction:row;flex-direction:row;-webkit-align-items:center;align-items:center;gap:40px;padding:40px}.rvp-banner-art{display:-webkit-flex;display:flex;-webkit-flex:0 0 340px;flex:0 0 340px;-webkit-justify-content:center;justify-content:center}.rvp-h{font-size:32px}}

/* card */
.rvp-card{display:-webkit-flex;display:flex;-webkit-flex-direction:column;flex-direction:column;gap:28px;padding:26px 22px;border-radius:26px;color:#fff7ed;background:#1c1410;background-image:-webkit-radial-gradient(100% 0,circle 520px,rgba(234,88,12,.42),transparent),-webkit-linear-gradient(135deg,#1c1410,#2a1a10);background-image:radial-gradient(circle 520px at 100% 0,rgba(234,88,12,.42),transparent),linear-gradient(135deg,#1c1410,#2a1a10);overflow:hidden;position:relative}
.rvp-card-main{min-width:0;position:relative}
.rvp-card .rvp-p{color:#c9b5a5}
.rvp-h-xl{font-size:30px;color:#fff7ed}
.rvp-h-xl span{color:#fb923c}
.rvp-card-art{display:-webkit-flex;display:flex;-webkit-justify-content:center;justify-content:center;position:relative}
.rvp-card .rvp-mini{-webkit-transform:rotate(1.5deg);transform:rotate(1.5deg)}
.rvp .rvp-list{display:-webkit-flex;display:flex;-webkit-flex-direction:column;flex-direction:column;gap:14px;margin-top:22px}
.rvp-list li{display:-webkit-flex;display:flex;gap:12px;-webkit-align-items:flex-start;align-items:flex-start}
.rvp-list li>span{-webkit-flex:0 0 auto;flex:0 0 auto;width:22px;height:22px;margin-top:1px;border-radius:50%;display:-webkit-flex;display:flex;-webkit-align-items:center;align-items:center;-webkit-justify-content:center;justify-content:center;background:#ea580c;color:#fff}
.rvp-list b{display:block;font-size:15px}
.rvp-list small{display:block;margin-top:2px;font-size:13.5px;line-height:1.55;color:#c9b5a5}
.rvp-fine{margin-top:16px!important;font-size:12px;color:#9a8778}
@media (max-width:480px){.rvp-card .rvp-btn,.rvp-banner .rvp-btn{width:100%}}
@media (min-width:640px){.rvp-card{padding:36px}.rvp-h-xl{font-size:36px}}
@media (min-width:960px){.rvp-card{-webkit-flex-direction:row;flex-direction:row;-webkit-align-items:center;align-items:center;gap:48px;padding:52px}.rvp-card-main{-webkit-flex:1 1 auto;flex:1 1 auto}.rvp-card-art{-webkit-flex:0 0 340px;flex:0 0 340px}.rvp-h-xl{font-size:42px}}
@media (prefers-reduced-motion:reduce){.rvp-btn{-webkit-transition:none;transition:none}}
`;
