import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Eye, Quote, X } from "lucide-react";

import { Button, cx } from "./ui";

/* =====================================================
   TEMPLATE CATALOG
   `status: "live"` = the page design exists and works today.
   `status: "soon"` = shown on the home page with a "Coming soon" tag until its design ships.
   `theme` matches the Theme field of an occasion in /admin/memories > Occasions.
===================================================== */
export const TEMPLATES = [
  {
    id: "birthday", theme: "birthday", name: "Birthday", status: "live", demo: "/memories/preview/birthday",
    tagline: "Balloons to pop, a cake to cut and a gift to unwrap.",
    tint: "from-pink-100 via-rose-50 to-orange-100", accent: "text-rose-600",
    best: ["Birthday surprise", "Belated wishes", "Long distance birthdays"],
    inside: [
      "Pop-the-balloon game, every balloon pops with a sweet note",
      "Blow out the candles, then drag the knife to cut a real slice",
      "Confetti poppers, fireworks and a storm of balloons when the cake is cut",
      "A chocolate bar to eat piece by piece",
      "Gift boxes you name yourself, like \"Movie date\", that burst open with a note from you",
      "Eight looks to choose from, including Love with a rose bouquet and Friendship with bracelets and bunting",
      "A sealed letter from you, written out in handwriting",
      "A birthday song when the cake is cut, with a volume slider they control",
      "A photo and video gallery of your best memories",
    ],
    sample: "Happy Birthday, Emma! Every year with you is my favourite one yet. Open your gift, there is a letter inside just for you.",
  },
  {
    id: "sorry", theme: "sorry", name: "Sorry", status: "live", demo: "/memories/preview/sorry",
    tagline: "A soft, honest way to say what words alone can't.",
    tint: "from-violet-100 via-fuchsia-50 to-rose-100", accent: "text-violet-600",
    best: ["Apologising to a partner", "Making up with a friend", "After an argument"],
    inside: [
      "Six looks: Teddy Hugs, Rain & Rainbow, Rose Garden, Starry Night, Sunflowers and Friends Again",
      "A sad little mascot that cheers up as they comfort it, and the whole page brightens with it",
      "Mend a broken heart by dragging it together, sealed with a golden seam",
      "Your apology as a sealed letter that writes itself out",
      "Your promises as cards that flip open with an \"I promise\" stamp",
      "Little peace offerings you name yourself, like \"A cup of chai\"",
      "Send roses, a warm hug or a lit candle, plus a chocolate bar and your photos",
      "\"Will you forgive me?\" where the playful No dodges, and \"I need a little time\" is always answered kindly",
    ],
    sample: "I know I made a mistake, Emma, and I never want to hurt you. You mean the world to me. Please forgive me?",
  },
  {
    id: "proposal", theme: "proposal", name: "Marriage Proposal", status: "live", demo: "/memories/preview/proposal",
    tagline: "Make the biggest question feel as big as it is.",
    tint: "from-amber-100 via-yellow-50 to-rose-100", accent: "text-amber-600",
    best: ["Proposing from afar", "A surprise before the real moment", "Saving the story forever"],
    inside: [
      "A sparkling ring reveal with a slow, dreamy opening",
      "Your own question: marriage, boyfriend or girlfriend, in your words",
      "Your story told through photos, one memory at a time",
      "A private PIN so only they can open it",
      "A big celebration when they say yes, and kind, gentle screens if they need time or say no",
    ],
    sample: "From the first hello to every tomorrow, you are my home. Emma, will you marry me?",
  },
  {
    id: "anniversary", theme: "anniversary", name: "Anniversary", status: "live", demo: "/memories/preview/anniversary",
    tagline: "Your love story, told beautifully, with flowers and wishes.",
    tint: "from-orange-100 via-rose-50 to-pink-100", accent: "text-orange-600",
    best: ["Wedding anniversaries", "Relationship milestones", "Monthsaries"],
    inside: [
      "A live counter of years, months, days and seconds together",
      "Your story as a timeline that draws itself as they scroll",
      "A love jar of reasons they pull out one at a time",
      "Build a bouquet from roses, tulips, peonies, lilies, daisies and lavender",
      "Gifts you name yourself, in velvet ring boxes and wrapped boxes",
      "A champagne toast to clink, plus glowing wish lanterns that carry your lines",
      "Five looks: Lovey Dovey, Golden Years, Candlelight Dinner, Garden of Love and Sunset Beach",
      "A letter, your promises for the years ahead, and a gallery of your photos and video",
    ],
    sample: "Three years, a thousand little moments. Thank you for choosing me, every single day.",
  },
  {
    id: "thanks", theme: "thanks", name: "Thank You", status: "live", demo: "/memories/preview/thanks",
    tagline: "Because gratitude is the best gift to give.",
    tint: "from-emerald-100 via-lime-50 to-amber-100", accent: "text-emerald-600",
    best: ["A friend or someone special", "Family, parents and mentors", "Thanksgiving, festivals or just because"],
    inside: [
      "Made for one person first: a friend, family member or mentor (colleagues and teams work too)",
      "A gratitude tree where every leaf is something you are thankful for",
      "Optional shout-out cards if you are thanking more than one person",
      "Your moments, numbers, photos, a small gift and a heartfelt letter",
      "Six themes, from autumn harvest to professional",
      "Share it with a link or keep it private with a PIN",
    ],
    sample: "Thank you for always being there, Emma. I'm lucky to have someone like you in my life.",
  },
];

/* =====================================================
   PHONE FRAME + SCENES
   Each scene is designed at 264 x 564 and scaled with CSS transform, so one design serves
   the tiny card preview and the large modal preview.
===================================================== */
const W = 280;
const H = 580;

export function PhoneFrame({ scale = 1, className, children }) {
  return (
    <div className={className} style={{ width: W * scale, height: H * scale }}>
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <div className="relative h-full w-full rounded-[40px] bg-[#2b1631] p-2 shadow-2xl shadow-rose-900/25 ring-1 ring-black/10">
          <div className="absolute left-1/2 top-3 z-20 h-[18px] w-20 -translate-x-1/2 rounded-full bg-[#2b1631]" aria-hidden />
          <div className="relative h-full w-full overflow-hidden rounded-[32px] bg-white">{children}</div>
        </div>
      </div>
    </div>
  );
}

const Stars = ({ items }) =>
  items.map(([x, y, s, d], i) => (
    <svg key={i} className="mem-twinkle absolute text-amber-400" style={{ left: x, top: y, width: s, height: s, "--d": `${d}s` }} viewBox="0 0 24 24" aria-hidden>
      <path fill="currentColor" d="M12 0l2.6 8.4L23 12l-8.4 3.6L12 24l-2.6-8.4L1 12l8.4-3.6z" />
    </svg>
  ));

const Balloon = ({ c, x, y, d, size = 40 }) => (
  <div className="mem-balloon absolute" style={{ left: x, top: y, "--d": `${d}s` }} aria-hidden>
    <div className="relative rounded-[50%_50%_48%_48%]" style={{ width: size, height: size * 1.22, background: `radial-gradient(circle at 32% 28%, #ffffffaa, ${c} 55%)` }}>
      <span className="absolute -bottom-[3px] left-1/2 h-0 w-0 -translate-x-1/2 border-x-[4px] border-b-[6px] border-x-transparent" style={{ borderBottomColor: c }} />
    </div>
    <span className="mx-auto block h-12 w-px bg-rose-300/70" />
  </div>
);

function BirthdayScene() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "linear-gradient(165deg,#ffe4ef,#ffc9dc 45%,#ffe3d1)" }}>
      <Balloon c="#ff5c9d" x={22} y={64} d={0} />
      <Balloon c="#ffb347" x={78} y={40} d={0.8} size={34} />
      <Balloon c="#7dd3fc" x={150} y={70} d={1.5} size={38} />
      <Balloon c="#a78bfa" x={206} y={44} d={0.4} size={32} />
      <div className="absolute inset-x-0 top-[158px] text-center">
        <p className="mem-script text-[34px] leading-none text-[#c2185b]">Happy Birthday</p>
        <p className="mem-script mem-gradient-text mt-1 text-[58px] leading-none">Emma</p>
        <p className="mt-2 text-[11px] font-medium text-[#8e3a62]">Pop the balloons for a surprise</p>
      </div>
      <svg className="absolute bottom-[78px] left-1/2 w-[190px] -translate-x-1/2" viewBox="0 0 300 250" aria-hidden>
        <ellipse cx="150" cy="226" rx="140" ry="16" fill="#ffd0e2" />
        <rect x="30" y="140" width="240" height="84" rx="10" fill="#ff85b3" />
        <path d="M30 150q15 22 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0V140H30z" fill="#fff" />
        <rect x="60" y="82" width="180" height="62" rx="9" fill="#ffb3d1" />
        <path d="M60 92q15 20 30 0t30 0 30 0 30 0 30 0 30 0V82H60z" fill="#fff" />
        <circle cx="60" cy="190" r="6" fill="#c2185b" /><circle cx="150" cy="190" r="6" fill="#c2185b" /><circle cx="240" cy="190" r="6" fill="#c2185b" />
        {[[73, "#fff3b0"], [136, "#b3e5fc"], [196, "#fff3b0"]].map(([x, c]) => (
          <g key={x}>
            <rect x={x} y="30" width="9" height="46" rx="3" fill={c} />
            <path className="mem-flame" d={`M${x + 4.5} 6c7 8 7 18 0 20-7-2-7-12 0-20z`} fill="#ffb300" />
          </g>
        ))}
      </svg>
      <div className="absolute inset-x-4 bottom-4 flex justify-center gap-1.5">
        {["Cut the cake", "Open your gift"].map((t) => (
          <span key={t} className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold text-[#c2185b] shadow-sm">{t}</span>
        ))}
      </div>
    </div>
  );
}

function SorryScene() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "linear-gradient(170deg,#f3e8ff,#fbe2ff 45%,#ffe0ec)" }}>
      <Stars items={[[30, 70, 12, 0], [218, 96, 10, 1], [60, 300, 8, 0.5], [214, 270, 12, 1.4]]} />
      <div className="absolute inset-x-0 top-[78px] text-center">
        <div className="mem-float mx-auto w-fit text-[96px] leading-none drop-shadow-lg" role="img" aria-label="teddy bear">🧸</div>
        <p className="mem-script mt-3 text-[40px] leading-none text-[#7e22ce]">I&apos;m sorry, Emma</p>
        <p className="mx-auto mt-3 max-w-[200px] text-[11px] leading-relaxed text-[#6b3a82]">I know I made a mistake, and I never want to hurt you.</p>
        <div className="mt-3 flex justify-center gap-3 text-[22px]" aria-hidden><span>🌹</span><span>🥹</span><span>🌹</span></div>
      </div>
      <div className="absolute inset-x-0 bottom-[70px] text-center">
        <p className="mem-script text-[26px] text-[#a21caf]">Will you forgive me?</p>
        <div className="relative mx-auto mt-2 h-10 w-[190px]">
          <span className="absolute left-0 top-0 rounded-full bg-gradient-to-r from-fuchsia-500 to-rose-500 px-6 py-2 text-xs font-bold text-white shadow-md">Yes</span>
          <span className="absolute right-0 top-1 rotate-6 rounded-full bg-stone-300 px-5 py-1.5 text-xs font-semibold text-stone-600">No</span>
        </div>
      </div>
    </div>
  );
}

function ProposalScene() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "linear-gradient(170deg,#fffaf0,#ffeccc 48%,#ffdede)" }}>
      <Stars items={[[40, 60, 14, 0], [212, 80, 18, 0.8], [96, 150, 10, 1.6], [24, 250, 12, 0.4], [226, 238, 14, 1.2], [150, 40, 9, 2]]} />
      <svg className="mem-float absolute left-1/2 top-[96px] w-[132px] -translate-x-1/2 drop-shadow-xl" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="74" r="32" fill="none" stroke="#e8b04a" strokeWidth="9" />
        <circle cx="60" cy="74" r="32" fill="none" stroke="#fff6d6" strokeWidth="2.5" opacity=".7" />
        <path d="M60 4l22 18-10 20H48L38 22z" fill="#9be7ff" />
        <path d="M60 4l22 18H38z" fill="#dff8ff" /><path d="M48 42l12 14 12-14z" fill="#6ccbea" /><path d="M38 22l10 20 12-14z" fill="#b6efff" />
      </svg>
      <div className="absolute inset-x-0 top-[262px] text-center">
        <p className="mem-script text-[30px] leading-none text-[#b7791f]">Emma,</p>
        <p className="mem-script mem-gradient-text mt-1 text-[44px] leading-[1.05]">will you marry me?</p>
      </div>
      <div className="absolute inset-x-0 bottom-[74px] flex justify-center gap-3">
        <span className="rounded-full bg-gradient-to-r from-amber-400 to-rose-400 px-5 py-2 text-xs font-bold text-white shadow-lg">Yes!</span>
        <span className="rounded-full bg-gradient-to-r from-rose-400 to-pink-500 px-5 py-2 text-xs font-bold text-white shadow-lg">Of course!</span>
      </div>
      <p className="absolute inset-x-0 bottom-6 text-center text-[10px] font-medium text-[#a16a2a]">Opened with a private PIN</p>
    </div>
  );
}

function AnniversaryScene() {
  const card = (rot, from, to, x, y, label) => (
    <div className="absolute rounded-md bg-white p-1.5 pb-5 shadow-lg" style={{ left: x, top: y, width: 96, transform: `rotate(${rot}deg)` }}>
      <div className="h-[84px] rounded-sm" style={{ background: `linear-gradient(135deg,${from},${to})` }} />
      <span className="mem-script absolute inset-x-0 bottom-0.5 text-center text-[13px] text-[#9a4a3a]">{label}</span>
    </div>
  );
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "linear-gradient(170deg,#ffe3d8,#ffc9c4 48%,#ffe9d2)" }}>
      <div className="absolute inset-x-0 top-[70px] text-center">
        <p className="mem-script text-[36px] leading-none text-[#b94a3c]">Happy Anniversary</p>
        <div className="mx-auto mt-3 w-fit rounded-2xl bg-white/80 px-4 py-2 shadow-sm">
          <p className="text-[22px] font-bold leading-none text-[#e11d48]">3 years</p>
          <p className="mt-0.5 text-[10px] font-medium text-[#9a4a3a]">1,095 days together</p>
        </div>
      </div>
      <div className="absolute inset-x-0 top-[200px] h-[200px]">
        {card(-9, "#ffd1dc", "#ff9aa2", 26, 18, "Our first trip")}
        {card(7, "#ffe5b4", "#ffb88c", 132, 6, "Your smile")}
        {card(-2, "#e0c3fc", "#ff9ec4", 78, 78, "Forever")}
      </div>
      <div className="mem-beat absolute inset-x-0 bottom-[60px] text-center text-[28px]" aria-hidden>💞</div>
    </div>
  );
}

function ThanksScene() {
  return (
    <div className="relative h-full w-full overflow-hidden" style={{ background: "linear-gradient(170deg,#e0f6e8,#fbfbe4 50%,#ffefd9)" }}>
      <Stars items={[[36, 66, 10, 0], [222, 120, 12, 1], [70, 250, 8, 0.6]]} />
      <div className="absolute inset-x-0 top-[78px] text-center">
        <div className="mem-float mx-auto flex w-fit items-end gap-0.5 text-[44px] leading-none" aria-hidden>
          <span style={{ "--r": "-12deg" }} className="mem-float">🌷</span><span className="-mb-2 text-[58px]">🌸</span><span style={{ "--r": "12deg" }} className="mem-float">🌼</span>
        </div>
        <p className="mem-script mt-5 text-[52px] leading-none text-[#15803d]">Thank you</p>
        <p className="mem-script text-[26px] text-[#4d7c0f]">Emma</p>
      </div>
      <div className="absolute inset-x-5 top-[300px] rounded-2xl bg-white/85 p-4 shadow-md">
        <p className="text-center text-[11px] leading-relaxed text-[#3f6212]">Thank you for always being there. I am so lucky to have you in my life.</p>
        <p className="mem-script mt-2 text-right text-[18px] text-[#15803d]">with love</p>
      </div>
      <div className="mem-beat absolute inset-x-0 bottom-[58px] text-center text-[26px]" aria-hidden>💚</div>
    </div>
  );
}

const SCENES = { birthday: BirthdayScene, sorry: SorryScene, proposal: ProposalScene, anniversary: AnniversaryScene, thanks: ThanksScene };

export function TemplateScene({ theme, scale = 1, className }) {
  const Scene = SCENES[theme] || BirthdayScene;
  return (
    <PhoneFrame scale={scale} className={className}>
      <Scene />
    </PhoneFrame>
  );
}

/* =====================================================
   CARD + MODAL
===================================================== */
export const rememberTemplate = (theme) => {
  try { sessionStorage.setItem("memories:template", theme); } catch { /* ignore */ }
};

export function StatusTag({ status }) {
  return status === "live" ? (
    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">Available</span>
  ) : (
    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-inset ring-amber-200">Coming soon</span>
  );
}

export function TemplateCard({ t, onOpen, delay = 0 }) {
  return (
    <article className="mem-reveal group flex flex-col overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-rose-200/60" style={{ "--rd": `${delay}s` }}>
      <button type="button" onClick={onOpen} aria-label={`Preview the ${t.name} template`} className={cx("relative flex h-[300px] items-start justify-center overflow-hidden bg-gradient-to-br pt-7", t.tint)}>
        <TemplateScene theme={t.theme} scale={0.78} className="transition duration-500 group-hover:-translate-y-2" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/90 to-transparent" aria-hidden />
        <span className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-rose-600 opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">
          <Eye className="h-3.5 w-3.5" aria-hidden /> Preview
        </span>
      </button>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-[#3a1530]">{t.name}</h3>
          <StatusTag status={t.status} />
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-[#7a5370]">{t.tagline}</p>
        <ul className="mt-3 space-y-1.5">
          {t.inside.slice(0, 3).map((x) => (
            <li key={x} className="flex gap-2 text-[13px] text-[#5b3650]">
              <Check className={cx("mt-0.5 h-4 w-4 shrink-0", t.accent)} aria-hidden /> <span>{x}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex gap-2 pt-5">
          <Button variant="soft" size="sm" onClick={onOpen} className="flex-1">See details</Button>
          {t.status === "live" ? (
            <Button as={Link} to={`/memories/login?mode=signup&template=${t.theme}`} onClick={() => rememberTemplate(t.theme)} size="sm" className="flex-1">Use this</Button>
          ) : (
            <Button variant="outline" size="sm" disabled className="flex-1">Coming soon</Button>
          )}
        </div>
      </div>
    </article>
  );
}

export function TemplateModal({ index, onClose, onIndex }) {
  const t = TEMPLATES[index];
  const closeRef = useRef(null);
  const go = useCallback((d) => onIndex((index + d + TEMPLATES.length) % TEMPLATES.length), [index, onIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose, go]);

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#3a1530]/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={`${t.name} template`} className="mem-pop-in relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[32px] bg-white shadow-2xl sm:rounded-[32px] md:flex-row">
        <button ref={closeRef} onClick={onClose} aria-label="Close preview" className="absolute right-3 top-3 z-30 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#6b3a5a] shadow hover:bg-rose-50">
          <X className="h-5 w-5" />
        </button>

        <div className={cx("relative flex shrink-0 items-center justify-center bg-gradient-to-br p-6 md:w-[44%]", t.tint)}>
          <button onClick={() => go(-1)} aria-label="Previous template" className="absolute left-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#6b3a5a] shadow hover:bg-white"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => go(1)} aria-label="Next template" className="absolute right-3 top-1/2 z-10 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#6b3a5a] shadow hover:bg-white md:right-3"><ChevronRight className="h-5 w-5" /></button>
          <div key={t.id} className="mem-pop-in">
            <TemplateScene theme={t.theme} scale={0.72} className="md:hidden" />
            <TemplateScene theme={t.theme} scale={0.92} className="hidden md:block" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <div key={t.id} className="mem-pop-in">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-bold text-[#3a1530]">{t.name}</h3>
              <StatusTag status={t.status} />
            </div>
            <p className="mt-1.5 text-[#7a5370]">{t.tagline}</p>

            <h4 className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-rose-500">What&apos;s inside</h4>
            <ul className="mt-3 space-y-2.5">
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

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {t.status === "live" ? (
                <>
                  <Button as={Link} to={`/memories/login?mode=signup&template=${t.theme}`} onClick={() => rememberTemplate(t.theme)} size="lg">Create this page</Button>
                  {t.demo && <Button as={Link} to={t.demo} variant="outline" size="lg">Try the live demo</Button>}
                </>
              ) : (
                <>
                  <Button variant="soft" size="lg" onClick={() => onIndex(TEMPLATES.findIndex((x) => x.status === "live"))}>See what you can use today</Button>
                  <span className="basis-full text-xs text-[#8a6a80]">This design is still being finished, so it can&apos;t be used yet.</span>
                </>
              )}
              <span className="text-xs text-[#8a6a80]">{index + 1} of {TEMPLATES.length} · use ← → to browse</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
