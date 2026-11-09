import { useId } from "react";
import { Moon } from "../birthday/decor";

export const LEAF_PATH = "M16 2 C26 8 30 18 24 28 C20 33 12 33 8 28 C2 18 6 8 16 2Z";

/* one autumn / spring leaf; colour comes from the caller */
export const ThankLeaf = ({ c = "#d9611e", className, style }) => (
  <svg className={className} style={style} viewBox="0 0 32 36" aria-hidden>
    <path d={LEAF_PATH} fill={c} />
    <path d="M16 6 L16 34 M16 14 L9 20 M16 20 L23 14 M16 26 L10 30" stroke="rgba(255,255,255,.55)" strokeWidth="1.3" fill="none" strokeLinecap="round" />
  </svg>
);

export function Pumpkin({ className }) {
  const u = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 120 110" aria-hidden>
      <defs><radialGradient id={`${u}p`} cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#ffa24c" /><stop offset="1" stopColor="#d9611e" /></radialGradient></defs>
      <ellipse cx="60" cy="102" rx="40" ry="6" fill="#000" opacity=".16" />
      <ellipse cx="34" cy="62" rx="24" ry="38" fill={`url(#${u}p)`} /><ellipse cx="86" cy="62" rx="24" ry="38" fill={`url(#${u}p)`} />
      <ellipse cx="48" cy="62" rx="22" ry="40" fill={`url(#${u}p)`} stroke="#b84a12" strokeWidth="1.4" /><ellipse cx="72" cy="62" rx="22" ry="40" fill={`url(#${u}p)`} stroke="#b84a12" strokeWidth="1.4" />
      <ellipse cx="60" cy="62" rx="14" ry="42" fill="#ff9a3c" stroke="#b84a12" strokeWidth="1.4" />
      <path d="M56 24 C54 12 58 8 62 6 C64 12 64 18 64 24Z" fill="#5a7a2e" />
      <path d="M64 14 C76 6 86 12 82 22 C78 16 72 16 66 20" fill="none" stroke="#6b9a34" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 40 C26 52 26 70 32 84" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".28" />
    </svg>
  );
}

export function Sunflower({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden>
      {Array.from({ length: 14 }, (_, i) => <ellipse key={i} cx="60" cy="22" rx="8" ry="19" fill={i % 2 ? "#ffcf2e" : "#ffb800"} transform={`rotate(${i * (360 / 14)} 60 60)`} />)}
      <circle cx="60" cy="60" r="21" fill="#6b3a1a" /><circle cx="60" cy="60" r="21" fill="none" stroke="#4a2410" strokeWidth="2" />
      {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={60 + Math.cos(i * 0.52) * (6 + (i % 4) * 4)} cy={60 + Math.sin(i * 0.52) * (6 + (i % 4) * 4)} r="1.6" fill="#c98a4b" />)}
    </svg>
  );
}

export function Badge({ className }) {
  const u = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 120 130" aria-hidden>
      <defs><linearGradient id={`${u}b`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#60a5fa" /><stop offset="1" stopColor="#2563eb" /></linearGradient></defs>
      <path d="M38 78 L26 124 L48 112 L60 126 L66 84Z" fill="#14b8a6" /><path d="M82 78 L94 124 L72 112 L60 126 L54 84Z" fill="#0d9488" />
      <circle cx="60" cy="52" r="42" fill={`url(#${u}b)`} stroke="#fbbf24" strokeWidth="5" /><circle cx="60" cy="52" r="32" fill="none" stroke="#fff" strokeWidth="1.6" opacity=".5" strokeDasharray="3 4" />
      <path d="M60 28 l7.4 15 16.6 2.4 -12 11.7 2.8 16.5 -14.8 -7.8 -14.8 7.8 2.8 -16.5 -12 -11.7 16.6 -2.4z" fill="#fbbf24" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

/* the welcome-screen picture for each theme */
export function GateArt({ kind, className }) {
  if (kind === "sunflower") return <Sunflower className={className} />;
  if (kind === "badge") return <Badge className={className} />;
  if (kind === "moon") return <Moon className={className} />;
  return <Pumpkin className={className} />;
}
