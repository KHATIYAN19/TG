import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import { track } from "../../track";
import "./reveal.css";

/*
  CAMERA REVEAL: the visitor taps a vintage camera. It clicks, flashes, and prints an instant photo
  that slowly develops from dark and blurry into the real picture. Uses the page's main photo.
  Props: photo { url?, caption?, tone?, emoji? }, name, sound, fx, nextId (section the Continue button scrolls to).
*/
function CameraArt({ flash }) {
  return (
    <svg className="mx-cam-svg" viewBox="0 0 320 224" aria-hidden>
      <defs>
        <linearGradient id="mxc-body" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e8cf" /><stop offset="1" stopColor="#e0c9a2" /></linearGradient>
        <linearGradient id="mxc-leather" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8a4a34" /><stop offset="1" stopColor="#5c2d1f" /></linearGradient>
        <radialGradient id="mxc-lens" cx=".4" cy=".35" r=".8"><stop offset="0" stopColor="#3b4a6b" /><stop offset=".45" stopColor="#0f1626" /><stop offset="1" stopColor="#05070d" /></radialGradient>
        <linearGradient id="mxc-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e9d2a0" /><stop offset="1" stopColor="#b08d57" /></linearGradient>
        <pattern id="mxc-grain" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".7" fill="#000" opacity=".22" /><circle cx="4.5" cy="4.5" r=".7" fill="#000" opacity=".16" /></pattern>
        <path id="mxc-arc-top" d="M 160 134 m -49 0 a 49 49 0 1 1 98 0" />
        <path id="mxc-arc-bot" d="M 160 134 m -57 0 a 57 57 0 0 0 114 0" />
      </defs>
      {/* strap rings */}
      <rect x="2" y="86" width="14" height="38" rx="7" fill="none" stroke="#b9b2a6" strokeWidth="4" />
      <rect x="304" y="86" width="14" height="38" rx="7" fill="none" stroke="#b9b2a6" strokeWidth="4" />
      {/* top bits */}
      <rect x="46" y="4" width="46" height="20" rx="5" fill="#7a3f2b" /><rect x="46" y="4" width="46" height="6" rx="3" fill="#fff" opacity=".18" />
      <rect x="116" y="12" width="14" height="10" rx="3" fill="url(#mxc-gold)" />
      <rect x="138" y="8" width="52" height="16" rx="4" fill="url(#mxc-gold)" />
      <rect x="232" y="6" width="38" height="18" rx="6" fill="#c9b79a" /><rect x="236" y="3" width="30" height="8" rx="4" fill="url(#mxc-gold)" />
      {/* body */}
      <rect x="12" y="20" width="296" height="196" rx="30" fill="url(#mxc-body)" />
      <rect x="12" y="20" width="296" height="196" rx="30" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
      <path d="M12 82 H308 V186 H12 Z" fill="url(#mxc-leather)" />
      <path d="M12 82 H308 V186 H12 Z" fill="url(#mxc-grain)" />
      <rect x="12" y="82" width="296" height="3" fill="#000" opacity=".25" /><rect x="12" y="183" width="296" height="3" fill="#000" opacity=".2" />
      {/* label + viewfinder + flash */}
      <rect x="34" y="42" width="74" height="20" rx="5" fill="#b8a07a" /><rect x="35.5" y="43.5" width="71" height="17" rx="4" fill="#d9c49d" />
      <text x="71" y="56" textAnchor="middle" fontSize="9.5" fontWeight="700" letterSpacing="1" fill="#6b4a2c" fontFamily="Poppins, system-ui, sans-serif">MEMORIES</text>
      <rect x="230" y="34" width="56" height="40" rx="9" fill="#cbb892" /><rect x="234" y="38" width="48" height="32" rx="6" fill={flash ? "#fffbe0" : "#141a28"} className="mx-cam-flashwin" />
      <path d="M240 42 L254 42 L240 56 Z" fill="#fff" opacity={flash ? 0 : 0.28} />
      {/* lens */}
      <circle cx="160" cy="134" r="68" fill="#00000026" transform="translate(0 4)" />
      <circle cx="160" cy="134" r="66" fill="url(#mxc-gold)" /><circle cx="160" cy="134" r="66" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
      <circle cx="160" cy="134" r="41" fill="#2a1d18" />
      <circle cx="160" cy="134" r="38" fill="url(#mxc-lens)" />
      <circle cx="160" cy="134" r="26" fill="none" stroke="#3a4a72" strokeWidth="2.5" opacity=".75" />
      <circle cx="160" cy="134" r="14" fill="#04060b" />
      <ellipse cx="148" cy="120" rx="10" ry="6" fill="#fff" opacity=".5" transform="rotate(-30 148 120)" />
      <circle cx="171" cy="147" r="3.5" fill="#9ab4ff" opacity=".6" />
      <text fontSize="7.6" fontWeight="700" letterSpacing="1.6" fill="#7a5a36" fontFamily="Poppins, system-ui, sans-serif"><textPath href="#mxc-arc-top" startOffset="50%" textAnchor="middle">FOCUS ON HAPPY</textPath></text>
      <text fontSize="7.6" fontWeight="700" letterSpacing="1.6" fill="#7a5a36" fontFamily="Poppins, system-ui, sans-serif"><textPath href="#mxc-arc-bot" startOffset="50%" textAnchor="middle">MEMORIES FOREVER</textPath></text>
      <path d="M104 134 l-5-4 a4 4 0 1 1 6-2" fill="none" /><text x="108" y="138" fontSize="8" fill="#6a2c25">♥</text><text x="205" y="138" fontSize="8" fill="#6a2c25">♥</text>
      {/* photo slot */}
      <rect x="64" y="205" width="192" height="9" rx="4.5" fill="#1c1411" /><rect x="64" y="205" width="192" height="3" rx="1.5" fill="#000" opacity=".5" />
    </svg>
  );
}

export default function PhotoCamera({ photo, name, sound, fx, nextId, caption }) {
  const [stage, setStage] = useState("idle"); // idle | flash | print | done
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  const shoot = () => {
    if (stage !== "idle") return;
    track("camera_click");
    sound?.unlock?.();
    sound?.sfx.shutter?.();
    setStage("flash");
    later(() => { setStage("print"); sound?.sfx.swish?.(); }, 520);
    later(() => sound?.sfx.swish?.(), 1500);
    later(() => {
      setStage("done");
      sound?.sfx.chime?.();
      const r = document.querySelector(".mx-cam-pol")?.getBoundingClientRect();
      if (r) fx?.hearts(r.left + r.width / 2, r.top + r.height * 0.4, 14);
    }, 4300);
  };
  const next = () => document.getElementById(nextId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const cap = caption ?? photo?.caption;

  return (
    <div className="mx mx-cam" data-stage={stage}>
      <p className="mx-kicker">A memory for you</p>
      <h2 className="mx-h">Capture a Moment <em>Just for {name}</em></h2>
      <p className="mx-sub">{stage === "idle" ? "Tap the camera to reveal a special memory" : stage === "done" ? "Here it is. Hold onto this one." : "Hold on, it's coming out…"}</p>

      <div className="mx-cam-stage">
        <button type="button" className="mx-cam-btn" onClick={shoot} disabled={stage !== "idle"} aria-label="Take the photo">
          <CameraArt flash={stage === "flash"} />
          {stage === "idle" && <span className="mx-cam-ring" aria-hidden><i>Tap</i></span>}
        </button>
        <figure className="mx-cam-pol">
          <span className="mx-cam-pic" style={{ "--t1": photo?.tone?.[0] || "#ffd1dc", "--t2": photo?.tone?.[1] || "#ffa6c1" }}>
            {photo?.url ? <img src={photo.url} alt={cap || "Your photo"} draggable={false} /> : <span className="mx-art" aria-hidden>{photo?.emoji || "📷"}</span>}
          </span>
          <figcaption>{cap || ""}</figcaption>
        </figure>
      </div>

      <p className={`mx-pill ${stage === "print" ? "on" : ""}`} aria-live="polite">{stage === "done" ? "💗 Developed with love" : stage === "idle" ? "📸 Tap the camera" : "✨ Developing your memory…"}</p>
      <button type="button" className="mx-btn" onClick={next} disabled={stage !== "done"}>Continue <ArrowDown className="h-4 w-4" aria-hidden /></button>
      {stage === "flash" && <div key="f" className="mx-flash" aria-hidden />}
    </div>
  );
}
