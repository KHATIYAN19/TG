import { useId } from "react";

import { RoseDefs, RoseG } from "../birthday/decor";

/*
  MASCOTS
  One per theme. `mood` is 0 (sad, crying), 1 (calmer) or 2 (happy). They change with CSS transitions, so
  the teddy lifts its arms for a hug, the cloud brightens and shows the sun, the rose lifts its head, and so on.
*/
const INK = "#2b1b16";

function Face({ x, y, gap = 20, mood, mouthY = 22, scale = 1, ink = INK, tears = true }) {
  const e = gap;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {mood === 0 && (
        <>
          <ellipse cx={-e} cy="0" rx="4.6" ry="5.8" fill={ink} /><ellipse cx={e} cy="0" rx="4.6" ry="5.8" fill={ink} />
          <circle cx={-e + 1.5} cy="-2" r="1.6" fill="#fff" /><circle cx={e + 1.5} cy="-2" r="1.6" fill="#fff" />
          <path d={`M${-e - 8},-12 L${-e + 7},-17 M${e + 8},-12 L${e - 7},-17`} stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
          <path d={`M-9,${mouthY} q9,-9 18,0`} stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          {tears && (
            <g className="sr-tears">
              <path className="sr-tear" d={`M${-e},7 C${-e - 3},12 ${-e - 4.5},15 ${-e},17.5 C${-e + 4.5},15 ${-e + 3},12 ${-e},7Z`} fill="#7cc4ff" opacity=".9" />
              <path className="sr-tear t2" d={`M${e},7 C${e - 3},12 ${e - 4.5},15 ${e},17.5 C${e + 4.5},15 ${e + 3},12 ${e},7Z`} fill="#7cc4ff" opacity=".9" />
            </g>
          )}
        </>
      )}
      {mood === 1 && (
        <>
          <circle cx={-e} cy="0" r="4.4" fill={ink} /><circle cx={e} cy="0" r="4.4" fill={ink} />
          <circle cx={-e + 1.4} cy="-1.4" r="1.3" fill="#fff" /><circle cx={e + 1.4} cy="-1.4" r="1.3" fill="#fff" />
          <path d={`M-8,${mouthY} q8,5.5 16,0`} stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === 2 && (
        <>
          <path d={`M${-e - 6},2 q6,-10 12,0 M${e - 6},2 q6,-10 12,0`} stroke={ink} strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <circle cx={-e - 5} cy="12" r="6.5" fill="#ff7a9a" opacity=".45" /><circle cx={e + 5} cy="12" r="6.5" fill="#ff7a9a" opacity=".45" />
          <path d={`M-11,${mouthY - 2} q11,17 22,0 Z`} fill={ink} /><ellipse cx="0" cy={mouthY + 5} rx="5" ry="2.6" fill="#ff7a8a" />
        </>
      )}
    </g>
  );
}

const arm = (deg, ox, oy, children) => (
  <g style={{ transform: `rotate(${deg}deg)`, transformOrigin: `${ox}px ${oy}px`, transition: "transform .7s cubic-bezier(.3,1.4,.5,1)" }}>{children}</g>
);

function Teddy({ mood }) {
  const a = [34, 18, -64][mood];
  return (
    <g>
      <ellipse cx="100" cy="213" rx="66" ry="7" fill="#000" opacity=".12" />
      <circle cx="58" cy="50" r="19" fill="#b9794b" /><circle cx="58" cy="50" r="10" fill="#f1c9a5" />
      <circle cx="142" cy="50" r="19" fill="#b9794b" /><circle cx="142" cy="50" r="10" fill="#f1c9a5" />
      <ellipse cx="68" cy="205" rx="21" ry="12" fill="#b9794b" /><ellipse cx="132" cy="205" rx="21" ry="12" fill="#b9794b" />
      <ellipse cx="100" cy="168" rx="49" ry="44" fill="#c98a5a" /><ellipse cx="100" cy="176" rx="30" ry="29" fill="#f4d3b0" />
      {arm(a, 62, 140, <ellipse cx="46" cy="166" rx="12" ry="27" fill="#b9794b" />)}
      {arm(-a, 138, 140, <ellipse cx="154" cy="166" rx="12" ry="27" fill="#b9794b" />)}
      <circle cx="100" cy="88" r="51" fill="#c98a5a" /><ellipse cx="78" cy="62" rx="14" ry="8" fill="#fff" opacity=".12" transform="rotate(-30 78 62)" />
      <ellipse cx="100" cy="108" rx="25" ry="19" fill="#f4d3b0" /><ellipse cx="100" cy="99" rx="8.5" ry="6.2" fill="#3b2418" /><ellipse cx="97.5" cy="97" rx="2.6" ry="1.6" fill="#fff" opacity=".6" />
      <Face x={100} y={80} gap={23} mood={mood} mouthY={27} />
      {mood === 2 && <path d="M100,188 C86,178 80,170 86,164 C91,160 97,162 100,168 C103,162 109,160 114,164 C120,170 114,178 100,188Z" fill="#ff6b8e" className="sr-beat" />}
    </g>
  );
}

function RainCloud({ mood }) {
  const fill = ["#9fb0c6", "#cbd8e8", "#ffffff"][mood];
  return (
    <g>
      <g style={{ opacity: mood === 2 ? 1 : 0, transition: "opacity .9s" }} transform="translate(158 46)">
        <g className="bd-spin-slow">{Array.from({ length: 12 }, (_, i) => <path key={i} d="M-2.5,-24 L0,-38 L2.5,-24Z" transform={`rotate(${i * 30})`} fill="#ffc233" />)}</g>
        <circle r="19" fill="#ffd23f" />
      </g>
      <path d="M52,148 C24,148 18,112 46,106 C44,76 80,62 98,80 C110,56 150,62 152,94 C178,92 188,126 166,142 C164,148 156,150 148,148Z" style={{ fill, transition: "fill .9s" }} />
      <path d="M52,148 C24,148 18,112 46,106 C44,76 80,62 98,80 C110,56 150,62 152,94 C178,92 188,126 166,142 C164,148 156,150 148,148Z" fill="none" stroke="rgba(60,80,110,.18)" strokeWidth="2" />
      <ellipse cx="86" cy="86" rx="16" ry="7" fill="#fff" opacity=".28" transform="rotate(-25 86 86)" />
      <Face x={100} y={112} gap={23} mood={mood} mouthY={20} ink="#34445c" tears={false} />
      <g className="sr-drops" style={{ opacity: mood === 0 ? 1 : mood === 1 ? 0.4 : 0, transition: "opacity .8s" }}>
        {[58, 76, 94, 112, 130, 148].map((x, i) => <line key={x} className="sr-drop" x1={x} y1="158" x2={x - 3} y2="172" stroke="#5aa0ff" strokeWidth="3.2" strokeLinecap="round" style={{ animationDelay: `${i * 0.18}s` }} />)}
      </g>
      <ellipse cx="100" cy="212" rx="48" ry="6" fill="#000" opacity={mood === 0 ? 0.1 : 0.05} />
      {mood === 0 && <ellipse cx="100" cy="209" rx="40" ry="5" fill="#7cc4ff" opacity=".5" />}
    </g>
  );
}

function WiltedRose({ mood }) {
  const uid = useId().replace(/:/g, "");
  const droop = [46, 16, 0][mood];
  return (
    <g>
      <defs><RoseDefs uid={uid} /></defs>
      <ellipse cx="100" cy="214" rx="50" ry="6" fill="#000" opacity=".1" />
      <path d="M100,214 C98,182 105,152 100,128" stroke="#2a7a3e" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M0,0 C8,-15 28,-19 44,-8 C30,7 11,9 0,0Z" fill="#3a9a52" stroke="#14502b" strokeOpacity=".3" transform="translate(99 194) rotate(-150)" style={{ transition: "transform .8s" }} />
      <path d="M0,0 C8,-15 28,-19 44,-8 C30,7 11,9 0,0Z" fill="#46aa5f" stroke="#14502b" strokeOpacity=".3" transform={`translate(101 170) rotate(${mood === 0 ? 40 : -22})`} style={{ transition: "transform .8s" }} />
      <g style={{ transform: `rotate(${droop}deg)`, transformOrigin: "100px 132px", transition: "transform .9s cubic-bezier(.3,1.3,.5,1), filter .9s", filter: mood === 0 ? "saturate(.5) brightness(.9)" : "none" }}>
        <RoseG x={100} y={86} s={1.12} tone="red" uid={uid} />
        <Face x={100} y={85} gap={12} mood={mood} mouthY={17} scale={0.86} ink="#fff4f6" tears={false} />
      </g>
      {mood === 0 && [0, 1, 2].map((i) => <path key={i} className="sr-petal-fall" d="M0,0 C6,-5 9,4 0,10 C-9,4 -6,-5 0,0Z" fill="#be123c" style={{ animationDelay: `${i * 1.1}s`, transform: `translate(${84 + i * 16}px, 150px)` }} />)}
      {mood === 2 && [[58, 62], [150, 54], [162, 104], [46, 112]].map(([x, y], i) => <path key={i} className="bd-twinkle" d="M0,-7 C1,-2 2,-1 7,0 2,1 1,2 0,7 -1,2 -2,1 -7,0 -2,-1 -1,-2 0,-7Z" fill="#fff3b0" transform={`translate(${x} ${y})`} style={{ "--d": `${i * 0.4}s` }} />)}
    </g>
  );
}

const starPath = (cx, cy, R, r) => Array.from({ length: 10 }, (_, i) => {
  const a = (-90 + i * 36) * (Math.PI / 180);
  const rad = i % 2 ? r : R;
  return `${i ? "L" : "M"}${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`;
}).join(" ") + "Z";

function WishStar({ mood }) {
  const s = [0.84, 0.95, 1.06][mood];
  const fill = ["#cdbb7c", "#f6d768", "#ffd24a"][mood];
  const d = starPath(100, 108, 74, 34);
  return (
    <g>
      <g style={{ transform: `scale(${s})`, transformOrigin: "100px 108px", transition: "transform .8s cubic-bezier(.3,1.4,.5,1), filter .8s", filter: mood === 2 ? "drop-shadow(0 0 16px #ffd86b)" : "none" }}>
        <path d={d} fill={fill} stroke={fill} strokeWidth="16" strokeLinejoin="round" style={{ transition: "fill .8s, stroke .8s" }} />
        <path d={starPath(100, 108, 60, 28)} fill="#fff" opacity=".22" />
        <Face x={100} y={106} gap={19} mood={mood} mouthY={20} ink="#4a3512" />
      </g>
      {mood === 2 && [[34, 40], [170, 46], [176, 150], [26, 150]].map(([x, y], i) => <path key={i} className="bd-twinkle" d="M0,-8 C1,-2 2,-1 8,0 2,1 1,2 0,8 -1,2 -2,1 -8,0 -2,-1 -1,-2 0,-8Z" fill="#fff" transform={`translate(${x} ${y})`} style={{ "--d": `${i * 0.35}s` }} />)}
      <ellipse cx="100" cy="212" rx="40" ry="5" fill="#000" opacity=".12" />
    </g>
  );
}

const SEEDS = Array.from({ length: 38 }, (_, i) => { const a = i * 2.39996; const r = 4.2 * Math.sqrt(i + 1); return [100 + Math.cos(a) * r, 100 + Math.sin(a) * r]; });

function SadSunflower({ mood }) {
  const droop = [40, 14, 0][mood];
  return (
    <g>
      <ellipse cx="100" cy="214" rx="46" ry="6" fill="#000" opacity=".1" />
      <path d="M100,214 C96,186 104,162 100,140" stroke="#2f8f46" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M0,0 C8,-16 30,-20 46,-8 C32,8 12,10 0,0Z" fill="#3a9a52" transform="translate(98 200) rotate(-160)" />
      <path d="M0,0 C8,-16 30,-20 46,-8 C32,8 12,10 0,0Z" fill="#46aa5f" transform={`translate(102 178) rotate(${mood === 0 ? 50 : -18})`} style={{ transition: "transform .8s" }} />
      <g style={{ transform: `rotate(${droop}deg)`, transformOrigin: "100px 142px", transition: "transform .9s cubic-bezier(.3,1.3,.5,1), filter .9s", filter: mood === 0 ? "saturate(.6) brightness(.95)" : "none" }}>
        {Array.from({ length: 16 }, (_, i) => <ellipse key={`a${i}`} cx="100" cy="56" rx="11.5" ry="29" transform={`rotate(${i * 22.5} 100 100)`} fill="#ffd23f" stroke="#e0a100" strokeWidth="1.2" />)}
        {Array.from({ length: 16 }, (_, i) => <ellipse key={`b${i}`} cx="100" cy="64" rx="8.5" ry="22" transform={`rotate(${i * 22.5 + 11} 100 100)`} fill="#ffe27a" opacity=".9" />)}
        <circle cx="100" cy="100" r="38" fill="#7a4a1e" /><circle cx="100" cy="100" r="38" fill="none" stroke="#5a3412" strokeWidth="3" />
        {SEEDS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.5" fill="#4a2a0e" opacity=".6" />)}
        <Face x={100} y={98} gap={15} mood={mood} mouthY={18} scale={1.08} ink="#fff1c9" tears={mood === 0} />
      </g>
      {mood === 2 && (
        <g className="sr-bee-float" transform="translate(150 54)">
          <ellipse className="bd-wing" cx="-6" cy="-7" rx="8" ry="5" fill="#dff6ff" stroke="#9fd3ea" /><ellipse className="bd-wing w2" cx="4" cy="-7" rx="8" ry="5" fill="#dff6ff" stroke="#9fd3ea" />
          <ellipse cx="0" cy="2" rx="12" ry="8.5" fill="#ffd23f" /><path d="M-5,-4v13M1,-5v14M7,-3v12" stroke="#2b1b16" strokeWidth="3" /><circle cx="12" cy="1" r="4.4" fill="#ffd23f" />
        </g>
      )}
    </g>
  );
}

function FriendsPair({ mood }) {
  const dx = [52, 30, 15][mood];
  const fig = (side, skin, hair, shirt, hairStyle) => (
    <g style={{ transform: `translateX(${side * dx}px)`, transition: "transform .9s cubic-bezier(.3,1.3,.5,1)" }}>
      <rect x="73" y="128" width="54" height="72" rx="24" fill={shirt} />
      <ellipse cx="100" cy="208" rx="30" ry="6" fill="#000" opacity=".1" />
      <g style={{ transform: `rotate(${mood === 0 ? side * 7 : 0}deg)`, transformOrigin: "100px 130px", transition: "transform .8s" }}>
        <circle cx="100" cy="98" r="35" fill={skin} />
        {hairStyle === "bob"
          ? <path d="M64,100 C58,48 142,48 136,100 C130,76 112,66 100,66 C88,66 70,76 64,100Z M64,98 C60,122 70,128 76,124 L76,98Z M136,98 C140,122 130,128 124,124 L124,98Z" fill={hair} />
          : <path d="M65,96 C60,52 140,52 135,96 C128,76 112,64 100,64 C88,64 72,76 65,96Z M80,52 C88,40 112,40 120,52 C112,56 88,56 80,52Z" fill={hair} />}
        <Face x={100} y={98} gap={13} mood={mood} mouthY={19} scale={0.82} tears={mood === 0} />
      </g>
    </g>
  );
  return (
    <g>
      {fig(-1, "#f6c9a0", "#3a2418", "#00a896", "bob")}
      {fig(1, "#c98a5e", "#1f1410", "#ff7a45", "spiky")}
      {mood === 2 && (
        <>
          <path d="M88,150 L112,152" stroke="#00a896" strokeWidth="14" strokeLinecap="round" /><path d="M112,160 L88,160" stroke="#ff7a45" strokeWidth="14" strokeLinecap="round" />
          <path className="sr-beat" d="M100,44 C90,36 86,29 91,24 C95,21 99,22 100,27 C101,22 105,21 109,24 C114,29 110,36 100,44Z" fill="#ff5c8a" />
        </>
      )}
      {mood === 0 && <g fill="#8a9bb0" opacity=".85"><circle cx="100" cy="36" r="3.4" /><circle cx="112" cy="36" r="3.4" /><circle cx="124" cy="36" r="3.4" /></g>}
    </g>
  );
}

const KINDS = { teddy: Teddy, cloud: RainCloud, rose: WiltedRose, star: WishStar, sunflower: SadSunflower, friends: FriendsPair };
const LABEL = { teddy: "teddy bear", cloud: "rain cloud", rose: "rose", star: "little star", sunflower: "sunflower", friends: "two friends" };

export default function Mascot({ kind = "teddy", mood = 0, className = "" }) {
  const Art = KINDS[kind] || Teddy;
  return (
    <svg viewBox="0 0 200 220" className={`sr-mascot-svg ${className}`} data-mood={mood} role="img" aria-label={`A sad ${LABEL[kind] || "friend"} who feels ${["very sad", "a little better", "happy"][mood]}`}>
      <Art mood={mood} />
    </svg>
  );
}
