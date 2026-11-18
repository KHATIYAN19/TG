import { useState } from "react";
import { Check, Copy } from "lucide-react";

/*
  Shared by the AWS and GCP handbook pages (they were importing these from the old SQL page).
  Kept byte-for-byte as they were so those pages look exactly the same.
*/

export const sqlStyles = `
/* ---------- shared ---------- */
.sql-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
.tk-kw { color: #FDBA74; font-weight: 700; }
.tk-fn { color: #7DD3FC; }
.tk-str { color: #86EFAC; }
.tk-num { color: #FCA5A5; }
.tk-cm { color: #8F857B; font-style: italic; }
@keyframes sqlBob { 0%,100% { translate: 0 0; } 50% { translate: 0 -10px; } }
@keyframes sqlBlob { 0%,100% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(30px,-24px,0) scale(1.15); } }
@keyframes sqlBlink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
@keyframes sqlMarquee { to { transform: translateX(-50%); } }
@keyframes sqlPanelIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes sqlRowIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }

/* ---------- hero ---------- */
.sql-hero { padding: 56px 0 72px; overflow: hidden; }
.sql-hero-bg { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.sql-blob { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .55; animation: sqlBlob 11s ease-in-out infinite; }
.sql-blob-a { width: 380px; height: 380px; right: -60px; top: -80px; background: color-mix(in srgb, var(--accent) 45%, transparent); }
.sql-blob-b { width: 300px; height: 300px; left: -80px; bottom: -120px; background: color-mix(in srgb, #F59E0B 40%, transparent); animation-delay: -5s; }
.sql-gridlines { position: absolute; inset: 0; background-image: linear-gradient(color-mix(in srgb, var(--accent) 10%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--accent) 10%, transparent) 1px, transparent 1px); background-size: 44px 44px; mask-image: radial-gradient(ellipse at 70% 40%, #000 10%, transparent 70%); -webkit-mask-image: radial-gradient(ellipse at 70% 40%, #000 10%, transparent 70%); }
.sql-hero .lld-hero-grid { z-index: 1; align-items: center; }
.sql-hero h1 { font-size: clamp(34px, 5.2vw, 60px); }
.sql-rotator { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; margin: 0 0 14px; font-size: 14px; font-weight: 700; color: var(--hero-muted); }
.sql-rotator-word { display: inline-flex; min-width: 168px; padding: 5px 12px; border-radius: 999px; background: color-mix(in srgb, var(--accent) 14%, transparent); color: var(--accent); font-weight: 900; font-size: 13px; }
.sql-trust { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
.sql-trust span { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border: 1px solid var(--hero-eyebrow-border); border-radius: 999px; background: var(--hero-eyebrow-bg); color: var(--hero-text); font-size: 12px; font-weight: 800; }
.sql-trust svg { color: var(--accent); }

.sql-stage { --mx: 0; --my: 0; position: relative; display: grid; place-items: center; padding: 30px 0 40px; min-width: 0; }
.sql-term { position: relative; z-index: 2; width: 100%; max-width: 560px; border-radius: 18px; background: #1C1917; color: #F5E9DC; border: 1px solid rgba(253,186,116,.3); box-shadow: 0 34px 80px rgba(32,19,12,.38), 0 0 0 1px rgba(255,255,255,.03) inset; overflow: hidden; transform: perspective(1100px) rotateY(calc(var(--mx) * -5deg)) rotateX(calc(var(--my) * 4deg)); transition: transform .25s ease-out; animation: sqlBob 6.5s ease-in-out infinite; }
.sql-term-bar { display: flex; align-items: center; gap: 12px; padding: 11px 14px; background: #26211D; border-bottom: 1px solid rgba(253,186,116,.16); }
.sql-dots { display: flex; gap: 6px; }
.sql-dots i { width: 10px; height: 10px; border-radius: 50%; background: #F87171; }
.sql-dots i:nth-child(2) { background: #FBBF24; }
.sql-dots i:nth-child(3) { background: #4ADE80; }
.sql-term-title { color: #CDBFB1; font-size: 11px; font-weight: 700; }
.sql-term-badge { margin-left: auto; padding: 3px 9px; border-radius: 999px; background: rgba(249,115,22,.16); color: #FDBA74; font-size: 10px; font-weight: 800; white-space: nowrap; }
.sql-term-code { margin: 0; padding: 16px 18px; min-height: 176px; font: 12.5px/1.75 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; white-space: pre-wrap; word-break: break-word; color: #F5E9DC; }
.sql-caret { display: inline-block; width: 7px; height: 15px; margin-left: 2px; vertical-align: -2px; background: #FB923C; animation: sqlBlink 1s steps(1) infinite; }
.sql-result { border-top: 1px solid rgba(253,186,116,.16); background: #171411; min-height: 138px; }
.sql-result-head { display: flex; justify-content: space-between; gap: 8px; padding: 9px 16px; color: #A39689; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.sql-result-head b { color: #4ADE80; }
.sql-table { width: 100%; border-collapse: collapse; font: 11.5px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
.sql-table th { padding: 6px 16px; text-align: left; color: #FDBA74; font-weight: 800; border-bottom: 1px solid rgba(253,186,116,.14); }
.sql-table td { padding: 6px 16px; color: #E9DDD0; border-bottom: 1px solid rgba(255,255,255,.05); }
.sql-table tbody tr { animation: sqlRowIn .4s ease both; }
.sql-dotsbar { display: flex; gap: 6px; justify-content: center; margin-top: 12px; }
.sql-dotsbar i { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.2); transition: all .3s; }
.sql-dotsbar i.on { width: 20px; border-radius: 4px; background: #FB923C; }
.sql-chip { position: absolute; z-index: 3; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border: 1px solid var(--chip-border); border-radius: 14px; background: var(--chip-bg); color: var(--chip-text); box-shadow: var(--chip-shadow); font-size: 11px; font-weight: 800; backdrop-filter: blur(10px); animation: sqlBob 5s ease-in-out infinite; }
.sql-chip-a { top: 0; right: 0; }
.sql-chip-b { bottom: 8px; left: -8px; animation-delay: -2s; }
.sql-mini-book { position: absolute; z-index: 3; right: -14px; bottom: -4px; width: 96px; aspect-ratio: .72; border-radius: 4px 10px 10px 4px; overflow: hidden; background: linear-gradient(150deg,#221B17,#482919 65%,#9A3412); border: 1px solid rgba(253,186,116,.4); box-shadow: 12px 16px 30px rgba(32,19,12,.4); rotate: 6deg; animation: sqlBob 5.5s ease-in-out infinite; animation-delay: -1s; }
.sql-mini-book img { width: 100%; height: 100%; object-fit: cover; display: block; }
.sql-mini-book div { display: flex; height: 100%; flex-direction: column; justify-content: flex-end; padding: 9px; color: #fff; font-size: 14px; font-weight: 900; line-height: 1.05; }
.sql-mini-book small { display: block; margin-bottom: 4px; color: #FDBA74; font-size: 6px; letter-spacing: .12em; text-transform: uppercase; }

/* ---------- marquee ---------- */
.sql-marquee { overflow: hidden; border-block: 1px solid var(--border); background: var(--surface); padding: 14px 0; mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.sql-marquee-track { display: flex; gap: 12px; width: max-content; animation: sqlMarquee 38s linear infinite; }
.sql-marquee:hover .sql-marquee-track { animation-play-state: paused; }
.sql-marquee-track span { padding: 7px 16px; border: 1px solid var(--border); border-radius: 999px; background: var(--surface-2); color: var(--text); font-size: 12px; font-weight: 800; white-space: nowrap; }
.sql-marquee-track span:nth-child(3n) { color: var(--accent); background: var(--soft); }

/* ---------- quick answer + highlights ---------- */
.sql-marquee + .lld-shell .lld-stats { margin-top: 30px; }
.sql-lessons, .sql-lessons .lld-shell, .sql-lesson > * { min-width: 0; }
.sql-code pre { max-width: 100%; }
.sql-quick { max-width: 880px; margin: 0 auto; padding: 22px 24px; border: 1px solid var(--border); border-left: 4px solid var(--accent); border-radius: 16px; background: var(--surface); }
.sql-quick h2 { margin: 6px 0 10px; font-size: clamp(20px, 3vw, 26px); }
.sql-quick p { margin: 0; color: var(--muted); font-size: 14px; line-height: 1.8; }
.sql-highlights { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.sql-highlight { padding: 20px; }
.sql-highlight h3 { margin: 14px 0 6px; font-size: 15px; }
.sql-highlight p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.7; }

/* ---------- tab rails (lessons + parts) ---------- */
.sql-rail { display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px 12px; scroll-snap-type: x proximity; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.sql-rail::-webkit-scrollbar { display: none; }
.sql-rail-wrap { position: relative; }
.sql-pill { flex: none; scroll-snap-align: start; padding: 10px 16px; border: 1px solid var(--border); border-radius: 999px; background: var(--surface); color: var(--muted); font-size: 12.5px; font-weight: 800; cursor: pointer; transition: all .25s ease; white-space: nowrap; }
.sql-pill:hover { color: var(--accent); border-color: var(--accent); translate: 0 -2px; }
.sql-pill.is-active { background: linear-gradient(110deg, #EA580C, #F97316); color: #fff; border-color: transparent; box-shadow: 0 10px 22px rgba(234,88,12,.28); }

/* ---------- free lessons ---------- */
.sql-lessons { background: radial-gradient(ellipse at 15% 0%, color-mix(in srgb, var(--accent) 9%, transparent), transparent 55%); }
.sql-lesson { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); width: 100%; gap: 22px; align-items: start; margin-top: 8px; animation: sqlPanelIn .5s cubic-bezier(.22,1,.36,1) both; }
.sql-lesson[hidden] { display: none; }
.sql-lesson-info { padding: 24px; }
.sql-lesson-meta { display: flex; flex-wrap: wrap; gap: 8px; }
.sql-badge { padding: 4px 10px; border-radius: 999px; background: var(--soft); color: var(--accent); font-size: 10px; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
.sql-badge.easy { background: rgba(22,163,74,.14); color: #16a34a; }
.sql-badge.medium { background: rgba(245,158,11,.16); color: #d97706; }
.sql-badge.hard { background: rgba(239,68,68,.14); color: #dc2626; }
.sql-lesson-info h3 { margin: 14px 0 8px; font-size: clamp(19px, 2.4vw, 24px); line-height: 1.2; }
.sql-lesson-info p { margin: 0; color: var(--muted); font-size: 13.5px; line-height: 1.75; }
.sql-tip { display: flex; gap: 10px; margin-top: 18px; padding: 14px; border: 1px dashed color-mix(in srgb, var(--accent) 50%, var(--border)); border-radius: 14px; background: color-mix(in srgb, var(--accent) 7%, var(--surface)); color: var(--text); font-size: 12.5px; line-height: 1.65; }
.sql-tip svg { flex: none; margin-top: 2px; color: var(--accent); }
.sql-code { min-width: 0; border-radius: 18px; background: #1C1917; border: 1px solid rgba(253,186,116,.26); box-shadow: 0 24px 56px rgba(32,19,12,.28); overflow: hidden; }
.sql-code-bar { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #26211D; border-bottom: 1px solid rgba(253,186,116,.15); }
.sql-code-name { color: #CDBFB1; font-size: 11px; font-weight: 700; }
.sql-copy { display: inline-flex; align-items: center; gap: 6px; margin-left: auto; padding: 6px 11px; border: 1px solid rgba(253,186,116,.28); border-radius: 9px; background: transparent; color: #FDBA74; font-size: 11px; font-weight: 800; cursor: pointer; transition: background .2s; }
.sql-copy:hover { background: rgba(249,115,22,.16); }
.sql-code pre { margin: 0; padding: 16px 18px; overflow-x: auto; -webkit-overflow-scrolling: touch; font: 12.5px/1.8 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; color: #F5E9DC; tab-size: 2; }
.sql-out { border-top: 1px solid rgba(253,186,116,.16); background: #171411; }
.sql-out-label { padding: 9px 16px 0; color: #4ADE80; font-size: 10px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
.sql-out pre { padding-top: 6px; color: #D9CCBE; font-size: 11.5px; }

/* ---------- parts explorer ---------- */
.sql-ptabs { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px; }
.sql-ptab { position: relative; display: flex; flex-direction: column; gap: 6px; padding: 14px; text-align: left; border: 1px solid var(--border); border-radius: 16px; background: var(--surface); color: var(--text); cursor: pointer; transition: all .3s cubic-bezier(.22,1,.36,1); overflow: hidden; }
.sql-ptab:hover { translate: 0 -4px; border-color: var(--accent); }
.sql-ptab-num { font-size: 22px; font-weight: 900; letter-spacing: -.04em; color: var(--accent); line-height: 1; }
.sql-ptab-title { font-size: 12px; font-weight: 800; line-height: 1.3; }
.sql-ptab-meta { font-size: 10px; font-weight: 700; color: var(--muted); }
.sql-ptab.is-active { border-color: transparent; background: linear-gradient(145deg, #EA580C, #F97316 70%, #FB923C); color: #fff; box-shadow: 0 16px 34px rgba(234,88,12,.32); translate: 0 -4px; }
.sql-ptab.is-active .sql-ptab-num, .sql-ptab.is-active .sql-ptab-meta { color: rgba(255,255,255,.86); }
.sql-panel { position: relative; margin-top: 18px; padding: 26px; overflow: hidden; animation: sqlPanelIn .5s cubic-bezier(.22,1,.36,1) both; }
.sql-panel[hidden] { display: none; }
.sql-panel-mark { position: absolute; right: 18px; top: -18px; font-size: 150px; font-weight: 900; letter-spacing: -.06em; color: var(--soft); line-height: 1; pointer-events: none; user-select: none; }
.sql-panel-head { position: relative; display: flex; gap: 14px; align-items: flex-start; max-width: 720px; }
.sql-panel-head h3 { margin: 2px 0 6px; font-size: clamp(19px, 2.6vw, 25px); }
.sql-panel-head p { margin: 0; color: var(--muted); font-size: 13.5px; line-height: 1.7; }
.sql-panel-stats { position: relative; display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
.sql-ch-grid { position: relative; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 290px), 1fr)); gap: 14px; margin-top: 22px; }
.sql-ch { display: flex; flex-direction: column; padding: 18px; border: 1px solid var(--border); border-radius: 18px; background: var(--surface-2); animation: sqlPanelIn .55s cubic-bezier(.22,1,.36,1) both; animation-delay: calc(var(--i, 0) * 55ms); transition: translate .3s ease, border-color .3s ease, box-shadow .3s ease; }
.sql-ch:hover { translate: 0 -4px; border-color: color-mix(in srgb, var(--accent) 55%, var(--border)); box-shadow: 0 18px 38px rgba(234,88,12,.13); }
.sql-ch-top { display: flex; align-items: center; gap: 11px; }
.sql-ch-n { flex: none; display: grid; place-items: center; min-width: 36px; height: 36px; padding: 0 6px; border-radius: 11px; background: linear-gradient(135deg, #EA580C, #FB923C); color: #fff; font-size: 13px; font-weight: 900; box-shadow: 0 8px 16px rgba(234,88,12,.25); }
.sql-ch h4 { margin: 0; font-size: 14.5px; line-height: 1.3; color: var(--text); }
.sql-ch ul { margin: 14px 0 0; padding: 0; list-style: none; display: grid; gap: 7px; }
.sql-ch li { position: relative; padding-left: 20px; color: var(--muted); font-size: 12px; line-height: 1.5; }
.sql-ch li::before { content: ""; position: absolute; left: 3px; top: 6px; width: 8px; height: 8px; border-radius: 50%; border: 2px solid var(--accent); }
.sql-ch li.is-extra { display: none; }
.sql-ch.is-open li.is-extra { display: block; }
.sql-more { align-self: flex-start; margin-top: 14px; padding: 6px 12px; border: 1px solid var(--border); border-radius: 999px; background: var(--surface); color: var(--accent); font-size: 11px; font-weight: 800; cursor: pointer; transition: all .2s; }
.sql-more:hover { border-color: var(--accent); background: var(--soft); }

.sql-related { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 22px; }

/* ---------- responsive ---------- */
@media (max-width: 1100px) { .sql-ptabs { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
@media (max-width: 950px) {
  .sql-highlights { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sql-lesson { grid-template-columns: minmax(0, 1fr); }
  .sql-hero .lld-hero-grid { grid-template-columns: minmax(0, 1fr); }
  .sql-hero .lld-hero-grid > * { min-width: 0; }
  .sql-stage { padding-top: 10px; }
  .sql-term { max-width: 620px; }
}
@media (max-width: 720px) {
  .sql-hero { padding: 30px 0 44px; }
  .sql-hero h1 { font-size: clamp(32px, 9vw, 42px); }
  .sql-rotator-word { min-width: 0; }
  .sql-trust span { font-size: 11px; padding: 6px 10px; }
  .sql-mini-book { display: none; }
  .sql-chip-a { top: -6px; right: 4px; }
  .sql-chip-b { left: 0; bottom: 2px; }
  .sql-term-code { padding: 13px 14px; font-size: 11.5px; min-height: 160px; }
  .sql-table { font-size: 10.5px; }
  .sql-table th, .sql-table td { padding: 5px 10px; }
  .sql-result { min-height: 124px; }
  .sql-rail { margin-inline: -14px; padding-inline: 14px; }
  .sql-ptabs { display: flex; gap: 8px; overflow-x: auto; margin-inline: -14px; padding: 4px 14px 12px; scroll-snap-type: x proximity; scrollbar-width: none; }
  .sql-ptabs::-webkit-scrollbar { display: none; }
  .sql-ptab { flex: none; width: 148px; scroll-snap-align: start; }
  .sql-panel { padding: 18px 16px; border-radius: 20px; }
  .sql-panel-mark { font-size: 96px; top: -8px; right: 8px; }
  .sql-ch-grid { gap: 10px; margin-top: 18px; }
  .sql-lesson-info { padding: 18px; }
  .sql-code pre { padding: 13px 14px; font-size: 11.5px; line-height: 1.75; }
  .sql-quick { padding: 18px; }
  .sql-highlights { grid-template-columns: 1fr; gap: 10px; }
  .sql-highlight { padding: 16px; }
  .sql-marquee { padding: 10px 0; }
}
@media (max-width: 520px) {
  .sql-chip { display: none; }
  .sql-stage { padding: 4px 0 8px; }
  .sql-term-badge { display: none; }
  .sql-hero .lld-hero-actions .lld-cta { width: 100%; }
  .sql-related .lld-cta { width: 100%; }
  .sql-pill { padding: 9px 13px; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .sql-term, .sql-chip, .sql-mini-book, .sql-blob, .sql-marquee-track, .sql-caret, .sql-lesson, .sql-panel, .sql-ch, .sql-table tbody tr { animation: none !important; }
  .sql-marquee-track { flex-wrap: wrap; width: auto; justify-content: center; }
  .sql-term { transform: none; }
}
`;


export function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button type="button" className="sql-copy" onClick={onCopy} aria-label="Copy SQL code">
      {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? "Copied" : "Copy"}
    </button>
  );
}
