import { useId } from "react";

/* The jewel: a diamond ring (marriage) or a heart locket (boyfriend / girlfriend). Drawn at 0..100. */
export function Jewel({ kind = "ring", className }) {
  const u = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff3b0" /><stop offset=".5" stopColor="#e8b923" /><stop offset="1" stopColor="#b8860b" /></linearGradient>
        <linearGradient id={`${u}d`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".5" stopColor="#bfe9ff" /><stop offset="1" stopColor="#7cc6ff" /></linearGradient>
        <linearGradient id={`${u}h`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff8fa3" /><stop offset="1" stopColor="#c8102e" /></linearGradient>
      </defs>
      {kind === "ring" ? (
        <g>
          <ellipse cx="50" cy="68" rx="25" ry="25" fill="none" stroke={`url(#${u}g)`} strokeWidth="7" />
          <ellipse cx="50" cy="68" rx="25" ry="25" fill="none" stroke="#fff8d6" strokeWidth="1.6" opacity=".7" strokeDasharray="22 90" strokeDashoffset="-6" />
          <path d="M38 38 L62 38 L70 24 L30 24 Z" fill="#9fdcff" />
          <path d="M30 24 L50 10 L70 24 Z" fill="#e6f7ff" />
          <path d="M30 24 L38 38 L50 24 Z" fill="#7cc6ff" /><path d="M70 24 L62 38 L50 24 Z" fill="#b7e6ff" /><path d="M38 38 L62 38 L50 24 Z" fill="#5db4f5" />
          <path d="M30 24 L50 10 L70 24 L62 38 L38 38 Z" fill="none" stroke="#ffffff" strokeWidth="1.2" opacity=".9" />
          <rect x="42" y="38" width="16" height="6" rx="2" fill={`url(#${u}g)`} />
        </g>
      ) : (
        <g>
          <path d="M14 8 C26 40 38 54 50 54 C62 54 74 40 86 8" fill="none" stroke={`url(#${u}g)`} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M50 92 C50 92 20 72 20 52 C20 41 28 34 36 34 C42 34 47 37 50 43 C53 37 58 34 64 34 C72 34 80 41 80 52 C80 72 50 92 50 92Z" fill={`url(#${u}h)`} stroke={`url(#${u}g)`} strokeWidth="3" />
          <path d="M30 50 C30 44 34 41 38 42" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".7" />
          <circle cx="50" cy="64" r="5.5" fill={`url(#${u}d)`} stroke="#fff" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
}

/* the little velvet box. `open` swings the lid up and lets the light out */
export function RingBox({ open, kind = "ring", className = "", onClick, label }) {
  return (
    <button type="button" className={`pr-box ${open ? "open" : ""} ${className}`} onClick={onClick} aria-label={label} aria-expanded={open}>
      <span className="pr-glow" aria-hidden />
      <svg viewBox="0 0 160 140" className="pr-box-svg" aria-hidden>
        <defs>
          <linearGradient id="prv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a1233" /><stop offset="1" stopColor="#3d0618" /></linearGradient>
          <linearGradient id="prv2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a31845" /><stop offset="1" stopColor="#5a0a26" /></linearGradient>
        </defs>
        <ellipse cx="80" cy="130" rx="62" ry="7" fill="#000" opacity=".28" />
        {/* back of the lid (visible when open) */}
        <g className="pr-lid-back"><path d="M26 74 L38 14 L122 14 L134 74 Z" fill="url(#prv2)" stroke="#e8b923" strokeWidth="2" /><path d="M44 22 L116 22 L124 66 L36 66Z" fill="#fff4f6" opacity=".08" /></g>
        {/* base */}
        <path d="M22 70 L138 70 L132 120 Q80 128 28 120 Z" fill="url(#prv)" stroke="#e8b923" strokeWidth="2" />
        <path d="M22 70 L138 70 L132 80 L28 80 Z" fill="#e8b923" opacity=".9" />
        <path d="M30 80 L130 80 L128 100 L32 100Z" fill="#240310" opacity=".5" />
      </svg>
      <Jewel kind={kind} className="pr-jewel" />
      <svg viewBox="0 0 160 140" className="pr-box-svg pr-lid-front" aria-hidden>
        <g className="pr-lid"><path d="M22 70 L138 70 L132 38 Q80 28 28 38 Z" fill="url(#prv2)" stroke="#e8b923" strokeWidth="2" /><path d="M36 48 Q80 40 124 48" stroke="#fff" strokeWidth="2" fill="none" opacity=".25" strokeLinecap="round" /><circle cx="80" cy="56" r="5" fill="#e8b923" /></g>
      </svg>
    </button>
  );
}

/* celebration: the ring slides onto a finger (or the locket drops onto its chain) */
export function OnFinger({ kind = "ring", className = "" }) {
  const u = useId().replace(/:/g, "");
  return (
    <div className={`pr-onfinger ${className}`} aria-hidden>
      {kind === "ring" ? (
        <svg viewBox="0 0 160 220" className="pr-finger-svg">
          <defs><linearGradient id={`${u}s`} x1="0" x2="1"><stop offset="0" stopColor="#f3c19a" /><stop offset=".5" stopColor="#ffd9bd" /><stop offset="1" stopColor="#e9b08a" /></linearGradient></defs>
          <path d="M62 220 L62 70 Q62 32 80 32 Q98 32 98 70 L98 220 Z" fill={`url(#${u}s)`} />
          <path d="M72 40 Q80 34 88 40" fill="none" stroke="#fff" strokeWidth="2" opacity=".5" strokeLinecap="round" />
          <ellipse cx="80" cy="42" rx="12" ry="9" fill="#f7cdb0" opacity=".6" />
          <g className="pr-ring-drop"><ellipse cx="80" cy="132" rx="20" ry="9.5" fill="none" stroke="#e8b923" strokeWidth="7" /><ellipse cx="80" cy="128" rx="20" ry="8" fill="none" stroke="#fff3b0" strokeWidth="2" opacity=".7" /><path d="M70 120 L90 120 L96 108 L64 108Z" fill="#9fdcff" /><path d="M64 108 L80 96 L96 108Z" fill="#e6f7ff" stroke="#fff" strokeWidth="1" /></g>
          <g className="pr-spark"><path d="M80 66 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#fff" /><path d="M118 100 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff3b0" /><path d="M44 112 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff3b0" /></g>
        </svg>
      ) : (
        <Jewel kind="heart" className="pr-heart-drop" />
      )}
    </div>
  );
}

/* sad: a heart that has cracked in two, with a tear */
export function BrokenHeart({ className = "" }) {
  return (
    <svg className={className} viewBox="0 0 120 110" aria-hidden>
      <g className="pr-half-l"><path d="M60 100 C60 100 12 70 12 38 C12 22 24 12 38 12 C48 12 56 18 60 26 L52 44 L66 58 L54 74 Z" fill="#c8102e" /><path d="M24 34 C24 28 28 24 33 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" opacity=".5" /></g>
      <g className="pr-half-r"><path d="M60 100 C60 100 108 70 108 38 C108 22 96 12 82 12 C72 12 64 18 60 26 L52 44 L66 58 L54 74 Z" fill="#e0405a" /></g>
      <path className="pr-tear" d="M86 66 C86 66 80 74 80 79 C80 83 83 85 86 85 C89 85 92 83 92 79 C92 74 86 66 86 66Z" fill="#9fdcff" />
    </svg>
  );
}
