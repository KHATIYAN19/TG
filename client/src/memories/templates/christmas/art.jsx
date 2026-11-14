import { useId } from "react";

/* the tree is drawn in a 320 x 360 box; the ornament spots (x, y) are in the same box */
export const TREE_W = 320;
export const TREE_H = 360;
/* in the order they are used, so any number of ornaments stays spread out */
export const SPOTS = [[160, 186], [160, 92], [92, 268], [230, 270], [122, 208], [198, 214], [136, 142], [186, 150], [140, 252], [184, 256], [110, 300], [210, 302]];

const LIGHTS = [[140, 70, 1], [180, 74, 2], [112, 112, 3], [208, 116, 4], [130, 160, 2], [196, 168, 3], [92, 188, 1], [228, 192, 4], [66, 240, 2], [254, 244, 1], [120, 232, 3], [206, 236, 2], [48, 292, 4], [272, 296, 3], [150, 290, 1], [200, 288, 4]];

/** A Christmas tree with a star and twinkling lights. Colours come from the page theme (--xm-*). */
export function TreeSvg({ className, lights = true }) {
  const u = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox={`0 0 ${TREE_W} ${TREE_H}`} aria-hidden>
      <defs>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--xm-tree-2)" /><stop offset="1" stopColor="var(--xm-tree-1)" /></linearGradient>
      </defs>
      <ellipse cx="160" cy="346" rx="130" ry="11" fill="var(--xm-ground)" opacity=".7" />
      <rect x="144" y="312" width="32" height="36" rx="4" fill="var(--xm-trunk)" />
      {[["160,190 30,315 290,315"], ["160,140 55,265 265,265"], ["160,85 80,195 240,195"], ["160,40 105,125 215,125"]].map(([p]) => (
        <polygon key={p} points={p} fill={`url(#${u}g)`} stroke={`url(#${u}g)`} strokeWidth="12" strokeLinejoin="round" />
      ))}
      <path d="M62 262q24 10 48 0t48 0 48 0 48 0" fill="none" stroke="var(--xm-ground)" strokeWidth="5" strokeLinecap="round" opacity=".55" />
      {lights && LIGHTS.map(([x, y, c], i) => <circle key={i} className="xm-light" cx={x} cy={y} r="4.5" fill={`var(--xm-orn-${c})`} style={{ "--i": i }} />)}
      <polygon className="xm-star" points="160,8 167,26 186,26 171,37 177,55 160,44 143,55 149,37 134,26 153,26" fill="var(--xm-star)" stroke="var(--xm-star)" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/** A wrapped present (the welcome screen). */
export function GiftArt({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      <ellipse cx="60" cy="110" rx="42" ry="6" fill="#000" opacity=".16" />
      <rect x="16" y="50" width="88" height="58" rx="8" fill="var(--gift-1)" />
      <rect x="10" y="38" width="100" height="22" rx="7" fill="var(--gift-4)" />
      <rect x="52" y="38" width="16" height="70" fill="var(--gift-3)" />
      <path d="M60 38C44 14 20 14 26 30c4 8 24 8 34 8Zm0 0C76 14 100 14 94 30c-4 8-24 8-34 8Z" fill="var(--gift-3)" stroke="var(--gift-4)" strokeWidth="2" />
      <circle cx="60" cy="38" r="6" fill="var(--gift-3)" />
    </svg>
  );
}

/** One glass ornament ball. */
export const Ornament = ({ n = 1, className, style }) => (
  <svg className={className} style={style} viewBox="0 0 40 48" aria-hidden>
    <rect x="16" y="1" width="8" height="7" rx="2" fill="#d9b44a" />
    <circle cx="20" cy="28" r="17" fill={`var(--xm-orn-${n})`} />
    <path d="M9 24C10 16 17 11 25 12" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".55" />
    <path d="M6 30q14 8 28 0" fill="none" stroke="#fff" strokeWidth="1.6" opacity=".4" />
  </svg>
);
