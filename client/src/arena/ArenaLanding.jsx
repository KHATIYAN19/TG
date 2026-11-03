import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform,
} from "framer-motion";
import {
  ArrowRight, BadgeCheck, Ban, Briefcase, Check, ChevronDown, Clock, CreditCard, Eye, EyeOff, Flag, Handshake, IdCard,
  Landmark, Lock, MailCheck, MessageCircle, RefreshCw, Send, ShieldCheck, Smartphone, Sparkles, Timer, UserPlus, Users, Wallet,
} from "lucide-react";

import { http, inr } from "./api";
import { resolveGateway } from "./gateway";
import { useArenaChrome } from "./chrome";
import { Avatar, Badge, cx } from "./ui";
import "./landing.css";

const SITE = "https://www.targettrek.in";
const URL = `${SITE}/prep-buddy`;

/* ------------------------- shared look (light first, dark via dk:) ------------------------- */
const PAGE_BG = "bg-[#fffdfb] dk:bg-[#15110e]";
const ALT_BG = "bg-[#fff8f2] dk:bg-[#1c1612]";
const CARD = "rounded-2xl border border-[#f0ded0] bg-white shadow-sm dk:border-[#443127] dk:bg-[#241b15]";
const LIFT = "transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-900/10 dk:hover:border-orange-500/40";
const H = "text-[#29201b] dk:text-[#fff7ed]";
const P = "text-stone-600 dk:text-[#d6c4b8]";
const MUTED = "text-stone-500 dk:text-[#b9a79c]";
const CHIP = "rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700 dk:bg-[#2c211b] dk:text-[#ead9cc]";
const EYEBROW = "text-xs font-bold uppercase tracking-[0.18em] text-orange-700 dk:text-orange-300";
const TILE = "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 dk:bg-orange-500/15 dk:text-orange-300";
const BTN = "arena-shine group inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-600/25 transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:translate-y-0";

/* --------------------------------- motion helpers --------------------------------- */
const OFFSETS = { up: { y: 22 }, down: { y: -22 }, left: { x: -34 }, right: { x: 34 }, scale: { scale: 0.92 }, none: {} };

function Reveal({ children, delay = 0, from = "up", className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, ...OFFSETS[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* Cards that lean toward the pointer. Touch and reduced-motion users get a plain card. */
function Tilt({ children, className, max = 9 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 220, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 220, damping: 20 });

  const move = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const leave = () => { x.set(0); y.set(0); };

  return (
    <div className="arena-3d h-full">
      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        style={reduce ? undefined : { rotateX, rotateY }}
        whileHover={reduce ? undefined : { scale: 1.03 }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

function CountUp({ to, format, duration = 1.3 }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || typeof to !== "number") return undefined;
    if (reduce) { setValue(to); return undefined; }
    const controls = animate(0, to, { duration, ease: "easeOut", onUpdate: setValue });
    return () => controls.stop();
  }, [inView, to, reduce, duration]);

  return <span ref={ref}>{format ? format(typeof to === "number" ? value : 0) : Math.round(value)}</span>;
}

function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX, top: "var(--arena-nav-h,4rem)" }}
      className="fixed inset-x-0 z-40 h-[3px] origin-left bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600"
    />
  );
}

const Blob = ({ className }) => (
  <div aria-hidden className={cx("pointer-events-none absolute rounded-full blur-3xl", className)} />
);

const Section = ({ id, alt, children, className }) => (
  <section id={id} className={cx("relative scroll-mt-28 overflow-hidden py-16 sm:py-24", alt ? ALT_BG : PAGE_BG, className)}>
    <div className="relative mx-auto max-w-6xl px-4 sm:px-6">{children}</div>
  </section>
);

const Heading = ({ eyebrow, title, children }) => (
  <Reveal className="mx-auto max-w-2xl text-center">
    {eyebrow && <p className={EYEBROW}>{eyebrow}</p>}
    <h2 className={cx("mt-2 text-3xl font-bold tracking-tight sm:text-4xl", H)}>{title}</h2>
    <motion.span
      aria-hidden
      className="mx-auto mt-4 block h-1 w-16 origin-center rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, delay: 0.2 }}
    />
    {children && <p className={cx("mt-4 text-base sm:text-lg", P)}>{children}</p>}
  </Reveal>
);

/* --------------------------------- hero visuals --------------------------------- */
function SampleCard({ alias, topics, level, skills, bio, company, tone = "brand" }) {
  return (
    <div className="w-[16.75rem] rounded-2xl border border-[#f0ded0] bg-white p-5 shadow-xl shadow-orange-900/10 dk:border-[#443127] dk:bg-[#241b15] sm:w-72">
      <div className="flex items-center gap-3">
        <Avatar seed={alias} />
        <div className="min-w-0">
          <p className={cx("truncate font-semibold", H)}>{alias}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {topics.map((t) => <Badge key={t} tone={tone}>{t}</Badge>)}
            <Badge>{level}</Badge>
          </div>
        </div>
      </div>
      <p className={cx("mt-3 flex items-start gap-1.5 text-sm font-semibold", H)}>
        <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden />{company}
      </p>
      <p className={cx("mt-2 text-sm", P)}>{bio}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">{skills.map((s) => <span key={s} className={CHIP}>{s}</span>)}</div>
      <div className={cx("mt-4 flex items-center gap-1.5 rounded-lg bg-orange-50 px-3 py-2 text-xs dk:bg-orange-500/10", MUTED)}>
        <EyeOff className="h-3.5 w-3.5" aria-hidden /> Name hidden until you both accept
      </div>
    </div>
  );
}

/* A tiny looping story: request → accepted → chat unlocked. */
const STORY = [
  { icon: Send, text: "Request sent", cls: "bg-amber-100 text-amber-900 ring-amber-200 dk:bg-amber-500/15 dk:text-amber-200 dk:ring-amber-500/30" },
  { icon: Check, text: "Accepted. You're matched!", cls: "bg-emerald-100 text-emerald-900 ring-emerald-200 dk:bg-emerald-500/15 dk:text-emerald-200 dk:ring-emerald-500/30" },
  { icon: MessageCircle, text: "Private chat unlocked", cls: "bg-orange-100 text-orange-900 ring-orange-200 dk:bg-orange-500/15 dk:text-orange-200 dk:ring-orange-500/30" },
];

function MatchStory() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (reduce) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % STORY.length), 2300);
    return () => clearInterval(t);
  }, [reduce]);

  const step = STORY[i];
  const Icon = step.icon;
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2" aria-live="polite">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -10 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          className={cx("flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold shadow-lg ring-1", step.cls)}
        >
          <Icon className="h-4 w-4" aria-hidden /> {step.text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function HeroVisual() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const yA = useTransform(scrollY, [0, 600], [0, -50]);
  const yB = useTransform(scrollY, [0, 600], [0, 60]);
  const rotA = useTransform(scrollY, [0, 600], [-3, 4]);
  const rotB = useTransform(scrollY, [0, 600], [2, -4]);

  return (
    <div className="relative mx-auto h-[30rem] w-full max-w-md sm:h-[32rem]">
      {/* rotating dashed orbit behind the cards */}
      <div aria-hidden className="arena-spin-slow absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-orange-300/70 dk:border-orange-500/30 sm:h-[28rem] sm:w-[28rem]" />
      <div aria-hidden className="arena-spin-rev absolute left-1/2 top-1/2 h-[17rem] w-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-200 dk:border-orange-500/20" />

      {/* connecting line that "marches" between the two members */}
      <svg aria-hidden viewBox="0 0 400 480" className="pointer-events-none absolute inset-0 h-full w-full">
        <path d="M110 150 C 330 190, 80 330, 290 360" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray="8 10" className="arena-dash stroke-orange-400 dk:stroke-orange-500/70" />
      </svg>

      <motion.div style={reduce ? { rotate: -3 } : { y: yA, rotate: rotA }} className="absolute left-0 top-0 z-10">
        <div className="arena-float">
          <Tilt>
            <SampleCard alias="Member-K7QX2" topics={["HLD", "LLD"]} level="Intermediate" company="Backend Engineer at a product company · 4 yrs" bio="Backend dev prepping for product-company design rounds. Evenings work best." skills={["kafka", "caching", "sharding"]} />
          </Tilt>
        </div>
      </motion.div>

      <motion.div style={reduce ? { rotate: 2 } : { y: yB, rotate: rotB }} className="absolute bottom-0 right-0 z-10">
        <div className="arena-float-delay">
          <Tilt>
            <SampleCard alias="Member-9TWPM" topics={["DSA", "LLD"]} level="Beginner" tone="emerald" company="Final-year student · 0 yrs" bio="Want weekly mock interviews and honest feedback." skills={["java", "design patterns", "oop"]} />
          </Tilt>
        </div>
      </motion.div>

      <MatchStory />

      {/* floating sparkles */}
      <Sparkles aria-hidden className="arena-float-slow absolute -right-1 top-6 h-8 w-8 text-amber-400" />
      <Handshake aria-hidden className="arena-float-delay absolute -left-2 bottom-14 h-9 w-9 text-orange-400" />
    </div>
  );
}

const WORDS_1 = ["Don't", "prepare", "alone."];
const WORDS_2 = ["Find", "your", "prep", "buddy."];

function Headline() {
  const reduce = useReducedMotion();
  const word = (w, i, extra = "") => (
    <motion.span
      key={`${w}${i}`}
      className={cx("mr-[0.28em] inline-block", extra)}
      initial={reduce ? false : { opacity: 0, y: 28, rotate: 3 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.6, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
    >
      {w}
    </motion.span>
  );
  return (
    <h1 className={cx("text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl", H)}>
      <span className="block">{WORDS_1.map((w, i) => word(w, i))}</span>
      <span className="block">
        {WORDS_2.map((w, i) => word(w, i + 3, "arena-gradient-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 bg-clip-text text-transparent"))}
      </span>
    </h1>
  );
}

/* ------------------------------------ tickers ------------------------------------ */
const ROW_A = ["System Design", "Low-Level Design", "Data Structures", "GenAI & LLMs", "Java & Spring", "Mock interviews", "Behavioural rounds", "Resume review"];
const ROW_B = ["Kafka", "Caching", "Sharding", "Rate limiting", "Design patterns", "Concurrency", "REST APIs", "Consistent hashing", "RAG", "Dynamic programming"];

function Marquee({ items, reverse, tone }) {
  const list = [...items, ...items];
  return (
    <div className="arena-marquee arena-fade-x overflow-hidden py-1.5">
      <div className={cx("flex w-max gap-3", reverse ? "arena-marquee-right" : "arena-marquee-left")}>
        {list.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className={cx(
              "select-none whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold ring-1 transition-transform hover:scale-110",
              tone === "solid"
                ? "bg-orange-600 text-white ring-orange-600"
                : "bg-white text-stone-700 ring-[#f0ded0] dk:bg-[#241b15] dk:text-[#ead9cc] dk:ring-[#443127]"
            )}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------- content blocks --------------------------------- */
const STEPS = [
  { icon: UserPlus, title: "Sign up & verify email", text: "Create an account and confirm your email with a one-time code." },
  { icon: IdCard, title: "Add your details", text: "Topics, level, skills, job title, company, availability and what you want from a buddy. Saved to your account." },
  { icon: CreditCard, title: "Pay once to enter", text: "One payment puts your profile live. Reopen the page any time and you'll land straight on the payment step." },
  { icon: Handshake, title: "Request or accept", text: "Browse profiles, send a request with a short message, or accept one. It only works if both agree." },
  { icon: MessageCircle, title: "Chat & practise", text: "Once matched, chat privately and choose which personal details to share. Your name stays hidden until you allow it." },
  { icon: RefreshCw, title: "Move on when you're ready", text: "End the partnership any time. If your entry still has matches left, you go straight back to the arena." },
];

const VIS = {
  after_match_optional: { title: "Private until you match", sub: "You choose each one, and can change it any time.", icon: Lock },
  never: { title: "Never shared with anyone", sub: "Not visible to other members under any setting.", icon: Ban },
};

function Visibility({ fields }) {
  const groups = useMemo(() => {
    const pub = new Map();
    for (const f of fields.filter((x) => x.visibility === "public")) {
      if (!pub.has(f.group)) pub.set(f.group, []);
      pub.get(f.group).push(f);
    }
    return {
      pub: [...pub.entries()],
      optional: fields.filter((x) => x.visibility === "after_match_optional"),
      never: fields.filter((x) => x.visibility === "never"),
    };
  }, [fields]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Reveal from="up" className="md:col-span-2">
        <div className={cx(CARD, LIFT, "group p-5 sm:p-7")}>
          <div className="flex items-start gap-3">
            <span className={TILE}><Eye className="h-5 w-5" aria-hidden /></span>
            <div>
              <h3 className={cx("text-lg font-semibold", H)}>Public on your card</h3>
              <p className={cx("mt-0.5 text-sm", P)}>Seen by every signed-in member who has paid to enter. Never shown to search engines or visitors.</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {groups.pub.map(([group, list], gi) => (
              <div key={group}>
                <p className={cx("text-xs font-bold uppercase tracking-wide", MUTED)}>{group}</p>
                <ul className="mt-2.5 space-y-2">
                  {list.map((f, i) => (
                    <motion.li
                      key={f.key}
                      className="flex items-start gap-2 text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-40px" }}
                      transition={{ duration: 0.4, delay: gi * 0.08 + i * 0.04 }}
                    >
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dk:text-emerald-400" aria-hidden />
                      <span className={H}>{f.label}{f.note && <span className={cx("block text-xs", MUTED)}>{f.note}</span>}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal from="left">
        <div className={cx(CARD, LIFT, "group h-full p-5 sm:p-7")}>
          <div className="flex items-start gap-3">
            <span className={TILE}><Lock className="h-5 w-5" aria-hidden /></span>
            <div>
              <h3 className={cx("text-lg font-semibold", H)}>{VIS.after_match_optional.title}</h3>
              <p className={cx("mt-0.5 text-sm", P)}>{VIS.after_match_optional.sub}</p>
            </div>
          </div>
          <ul className="mt-6 space-y-3">
            {groups.optional.map((f, i) => (
              <motion.li
                key={f.key}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between gap-3 rounded-xl bg-orange-50/70 px-4 py-3 ring-1 ring-orange-100 dk:bg-orange-500/10 dk:ring-orange-500/20"
              >
                <span className={cx("text-sm font-medium", H)}>{f.label}</span>
                <span className={cx("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold", f.defaultShared ? "bg-emerald-100 text-emerald-800 dk:bg-emerald-500/15 dk:text-emerald-300" : "bg-stone-200 text-stone-700 dk:bg-[#35261e] dk:text-[#d6c4b8]")}>
                  {f.defaultShared ? "On by default" : "Off by default"}
                </span>
              </motion.li>
            ))}
          </ul>
          <p className={cx("mt-4 text-xs", MUTED)}>Switching one off later hides it again, but can't un-see what a buddy has already seen.</p>
        </div>
      </Reveal>

      <Reveal from="right">
        <div className={cx(CARD, LIFT, "group h-full p-5 sm:p-7")}>
          <div className="flex items-start gap-3">
            <span className={TILE}><Ban className="h-5 w-5" aria-hidden /></span>
            <div>
              <h3 className={cx("text-lg font-semibold", H)}>{VIS.never.title}</h3>
              <p className={cx("mt-0.5 text-sm", P)}>{VIS.never.sub}</p>
            </div>
          </div>
          <ul className="mt-6 space-y-3">
            {groups.never.map((f) => (
              <li key={f.key} className="flex items-start gap-2 text-sm">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-stone-400" aria-hidden />
                <span className={H}>{f.label}{f.note && <span className={cx("block text-xs", MUTED)}>{f.note}</span>}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 rounded-xl bg-stone-50 p-4 text-sm ring-1 ring-[#f0ded0] dk:bg-[#1c1612] dk:ring-[#443127]">
            <p className={cx("flex items-center gap-2 font-semibold", H)}><ShieldCheck className="h-4 w-4 text-orange-700 dk:text-orange-300" aria-hidden /> We scan what you type</p>
            <p className={cx("mt-1.5", P)}>Bio, goal, skills, company fields and request messages are checked. Emails, phone numbers, links and social handles are blocked, so nobody can take the conversation off-platform before both sides agree.</p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ----------------------------------- page ----------------------------------- */
export default function ArenaLanding() {
  useArenaChrome();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const blobY1 = useTransform(scrollY, [0, 900], [0, -140]);
  const blobY2 = useTransform(scrollY, [0, 900], [0, 120]);

  const signedIn = useSelector((s) => Boolean(s.auth.token));
  const [info, setInfo] = useState(null);
  const [stage, setStage] = useState(null); // none | draft | active | matched | suspended
  const [open, setOpen] = useState(0);

  useEffect(() => {
    let alive = true;
    http.get("/public").then(({ data }) => alive && setInfo(data.data)).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    http.get("/me").then(({ data }) => setStage(data.data.profile?.status ?? "none")).catch(() => setStage(null));
  }, [signedIn]);

  const gw = resolveGateway(info?.paymentGateway);
  const priceRupees = info ? info.entryPricePaise / 100 : null;
  const price = info ? inr(info.entryPricePaise) : "…";
  const fee = info?.cancellationFeePercent;
  const matches = info?.matchesPerEntry;
  const matchWord = matches === 1 ? "match" : "matches";
  const feePaise = info ? Math.round((info.entryPricePaise * info.cancellationFeePercent) / 100) : 0;
  const refundPaise = info ? info.entryPricePaise - feePaise : 0;
  const waiting = info?.activeMembers ?? 0;

  const cta = signedIn ? "/prep-buddy/app" : "/prep-buddy/signup";
  const ctaLabel = !signedIn
    ? "Join the arena"
    : { none: "Add your details", draft: "Continue to payment", active: "Open my arena", matched: "Open my buddy chat", suspended: "View my account" }[stage] ?? "Open my arena";

  const faq = [
    ["How does matching work?", "There's no algorithm choosing for you. You browse profiles, filter by topic, level, language and availability, and send a request with a short message. If they accept, you're matched. You can also accept requests sent to you."],
    ["What can other members see about me?", "Your anonymous ID plus everything in the “Public on your card” list above, including your company name, job title and experience. Your real name, email, phone and LinkedIn stay hidden until you match, and then only the ones you switch on."],
    ["What does the entry fee include?", info ? `${price} is a one-time payment. It puts your profile in the arena and includes ${matches} ${matchWord}${matches > 1 ? ", one after another" : ""}. This number comes from our admin settings, so what you see here is what you get.` : "A one-time payment that puts your profile in the arena and includes a set number of matches, shown in the pricing section."],
    ["Can I get a refund?", info ? `Yes, until you use your first match. Cancel before that and you get back ${100 - fee}% of what you paid. For ${price} that's ${inr(refundPaise)}. We keep ${fee}% (${inr(feePaise)}). Once a match is used the entry isn't refundable.` : "Yes, before your first match, minus a small cancellation fee shown in the pricing section."],
    ["Can I be matched with more than one person?", info ? `${matches > 1 ? `Yes, up to ${matches} per entry, but never at the same time.` : "One match per entry."} While you're matched you can't send or accept other requests. You also can't be re-paired with someone you've already matched with.` : "Not at the same time. Extra matches in an entry happen one after another."],
    ["What happens to my requests?", info ? `A request expires after ${info.requestExpiryDays} days if nobody answers. You can have up to ${info.maxOutgoingRequests} pending requests at once. When you match, all your other pending requests are cancelled automatically.` : "Requests expire after a set number of days and are cancelled automatically when you match."],
    ["Is my payment safe?", gw ? `Payments are processed by ${gw.name} (${gw.methods.join(", ")}). We never see or store your card details.` : "Payments are processed by our payment gateway. We never see or store your card details."],
    ["What if someone behaves badly?", "Block them and your partnership ends instantly. You can also report them. Every member verifies their email, and admins can suspend accounts."],
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "FAQPage", mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
      {
        "@type": "Service",
        name: "Prep Buddy Arena",
        provider: { "@type": "Organization", name: "Target Trek", url: SITE },
        description: "Find an interview-preparation buddy for system design, DSA and more. Anonymous profiles, mutual acceptance and private chat.",
        areaServed: "IN",
        ...(info ? { offers: { "@type": "Offer", priceCurrency: "INR", price: String(info.entryPricePaise / 100), url: URL } } : {}),
      },
    ],
  };

  return (
    <main className={cx(PAGE_BG, H, "pt-[var(--arena-nav-h,4rem)]")}>
      <Helmet>
        <title>Prep Buddy Arena – Find an Interview Preparation Partner | Target Trek</title>
        <meta name="description" content={`Find a serious interview-prep buddy for system design, LLD, DSA and GenAI. Anonymous profiles, mutual acceptance and private chat.${info ? ` One-time ${price}, ${matches} ${matchWord} included.` : ""}`} />
        <link rel="canonical" href={URL} />
        <meta property="og:title" content="Prep Buddy Arena – Find your interview preparation partner" />
        <meta property="og:description" content="Browse profiles, match by mutual consent, and practise together." />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <ScrollBar />

      {/* ================================ HERO ================================ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-[#fffaf5] to-[#fffdfb] dk:from-[#2a1a10] dk:via-[#15110e] dk:to-[#15110e]">
        <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,#fed7aa_1px,transparent_0)] [background-size:28px_28px] opacity-50 dk:opacity-[0.12]" aria-hidden />
        <motion.div style={reduce ? undefined : { y: blobY1 }} className="pointer-events-none absolute -left-24 top-10" aria-hidden>
          <div className="arena-blob h-72 w-72 rounded-full bg-orange-300/50 blur-3xl dk:bg-orange-500/15" />
        </motion.div>
        <motion.div style={reduce ? undefined : { y: blobY2 }} className="pointer-events-none absolute -right-20 bottom-0" aria-hidden>
          <div className="arena-blob-delay h-80 w-80 rounded-full bg-amber-300/50 blur-3xl dk:bg-amber-500/10" />
        </motion.div>

        <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-6">
          <div>
            <Reveal from="down"><Badge tone="brand" className="mb-5"><Sparkles className="h-3.5 w-3.5" /> Prep Buddy Arena</Badge></Reveal>
            <Headline />
            <Reveal delay={0.55}>
              <p className={cx("mt-6 max-w-xl text-lg", P)}>
                Match with someone as serious as you are for system design, LLD, DSA or GenAI. See each member's role, company and experience, connect only when both agree, and practise together in a private chat.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link to={cta} className={BTN}>{ctaLabel} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></Link>
                <a href="#visibility" className="text-sm font-semibold text-orange-700 transition-colors hover:text-orange-900 dk:text-orange-300">See exactly what's shown ↓</a>
              </div>

              <ul className={cx("mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm", P)}>
                <li className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden /> One-time {price}</li>
                <li className="flex items-center gap-2"><Handshake className="h-4 w-4 text-emerald-600" aria-hidden /> {matches ? `${matches} ${matchWord} included` : "Matches included"}</li>
                <li className="flex items-center gap-2"><MailCheck className="h-4 w-4 text-emerald-600" aria-hidden /> Verified emails</li>
                {gw && <li className="flex items-center gap-2"><Lock className="h-4 w-4 text-emerald-600" aria-hidden /> Secure payment via {gw.name}</li>}
              </ul>

              {waiting > 0 && (
                <p className={cx("mt-6 inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-[#f0ded0] dk:bg-[#241b15] dk:ring-[#443127]", P)}>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="arena-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span><strong className={H}>{waiting}</strong> {waiting === 1 ? "member is" : "members are"} looking for a prep buddy right now</span>
                </p>
              )}
              {info && !info.enabled && (
                <p role="status" className="mt-4 inline-block rounded-xl bg-amber-50 px-4 py-2 text-sm font-medium text-amber-900 ring-1 ring-amber-200 dk:bg-amber-500/10 dk:text-amber-200 dk:ring-amber-500/30">
                  New entries are paused for the moment. Check back soon.
                </p>
              )}
            </Reveal>
          </div>

          <Reveal from="scale" delay={0.2}><HeroVisual /></Reveal>
        </div>
      </section>

      {/* =============================== TICKERS =============================== */}
      <div className={cx("space-y-1 border-y border-[#f0ded0] py-5 dk:border-[#443127]", ALT_BG)} aria-hidden>
        <Marquee items={ROW_A} />
        <Marquee items={ROW_B} reverse tone="solid" />
      </div>

      {/* ============================ HOW IT WORKS ============================ */}
      <Section id="how">
        <Blob className="-right-24 top-20 h-72 w-72 bg-orange-200/40 dk:bg-orange-500/10" />
        <Heading eyebrow="How it works" title="From sign-up to your first session">Six steps. Each one is explained before you commit to it.</Heading>

        <div className="relative mt-14">
          {/* a line that draws itself across the grid as it scrolls into view */}
          <motion.div
            aria-hidden
            className="absolute left-6 right-6 top-[3.35rem] hidden h-0.5 origin-left rounded-full bg-gradient-to-r from-orange-300 via-amber-300 to-orange-300 lg:block"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: "-120px" }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
          <ol className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} from={i % 2 ? "right" : "left"} delay={(i % 3) * 0.08}>
                <li className={cx(CARD, LIFT, "group relative h-full p-6")}>
                  <span className="absolute -top-3 left-6 rounded-full bg-orange-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-md shadow-orange-600/30">Step {i + 1}</span>
                  <span className={cx(TILE, "mt-2")}><Icon className="h-5 w-5" aria-hidden /></span>
                  <h3 className={cx("mt-4 font-semibold", H)}>{title}</h3>
                  <p className={cx("mt-1.5 text-sm", P)}>{text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* ======================= PUBLIC vs PRIVATE ======================= */}
      <Section alt id="visibility">
        <Blob className="-left-24 top-10 h-80 w-80 bg-amber-200/40 dk:bg-amber-500/10" />
        <Heading eyebrow="Transparency" title="Exactly what other members can see">
          Your company name, job title and experience are public so requests feel informed. Your name and contact details stay private until you both accept.
        </Heading>
        <div className="mt-12">
          {info?.fields ? <Visibility fields={info.fields} /> : (
            <p role="status" className={cx(CARD, "p-6 text-center text-sm", MUTED)}>Loading the full list…</p>
          )}
        </div>
      </Section>

      {/* ============================== BENEFITS ============================== */}
      <Section>
        <Heading eyebrow="Why a buddy" title="Why a buddy beats going solo" />
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            [Users, "Mock interviews, for free", "Take turns as interviewer and candidate. You learn as much from asking as answering."],
            [Handshake, "Real accountability", "A partner expecting you on Thursday evening is a better deadline than any calendar reminder."],
            [Briefcase, "Know who you're talking to", "See each member's role, company and experience before you send a request, so you pick someone who fits."],
          ].map(([Icon, t, d], i) => (
            <Reveal key={t} delay={i * 0.1} from="up">
              <Tilt className="h-full">
                <div className={cx(CARD, "group h-full p-6")}>
                  <span className={TILE}><Icon className="h-5 w-5" aria-hidden /></span>
                  <h3 className={cx("mt-4 font-semibold", H)}>{t}</h3>
                  <p className={cx("mt-1.5 text-sm", P)}>{d}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ============================ PRICING & RULES ============================ */}
      <Section alt id="pricing">
        <Blob className="-right-20 bottom-10 h-80 w-80 bg-orange-200/50 dk:bg-orange-500/10" />
        <Heading eyebrow="Pricing & rules" title="Simple, one-time pricing">No subscription. Pay once to enter, match, and chat.</Heading>

        <div className="mt-14 grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
          <Reveal from="left">
            {/* spinning gradient border */}
            <div className="relative overflow-hidden rounded-3xl p-[2.5px] shadow-xl shadow-orange-900/10">
              <div aria-hidden className="absolute inset-0 grid place-items-center">
                <div className="arena-spin-border h-[220%] w-[220%] flex-none bg-[conic-gradient(from_0deg,#fb923c,#fde68a,#fff7ed,#ea580c,#fdba74,#fb923c)]" />
              </div>
              <div className="relative overflow-hidden rounded-[22px] bg-white dk:bg-[#241b15]">
                <div className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-8 text-center text-white">
                  <div aria-hidden className="arena-spin-slow absolute -right-10 -top-10 h-40 w-40 rounded-full border-2 border-dashed border-white/30" />
                  <p className="text-sm font-semibold uppercase tracking-widest text-orange-50">Arena entry</p>
                  <p className="mt-2 text-6xl font-bold tabular-nums">
                    {priceRupees == null ? "…" : <CountUp to={priceRupees} format={(v) => `₹${Math.round(v).toLocaleString("en-IN")}`} />}
                  </p>
                  <p className="mt-2 text-base font-medium text-orange-50">one-time · {matches ?? "…"} {matchWord} included</p>
                  {matches > 1 && (
                    <span className="arena-float-slow absolute right-4 top-4 rotate-6 rounded-full bg-white px-3 py-1 text-xs font-bold text-orange-700 shadow-lg">{matches}× matches</span>
                  )}
                </div>
                <ul className="space-y-3 p-6 text-sm">
                  {[
                    "Your profile live in the arena",
                    "Browse members with role, company and experience",
                    "Send and accept buddy requests",
                    matches ? `${matches} ${matches === 1 ? "partnership" : "partnerships"} with private real-time chat${matches > 1 ? " (one at a time)" : ""}` : "Private real-time chat",
                    "You control what you share after matching",
                    ...(info?.couponsAvailable ? ["Coupon codes accepted at checkout"] : []),
                  ].map((t, i) => (
                    <motion.li
                      key={t}
                      className={cx("flex gap-2.5", H)}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.15 + i * 0.07 }}
                    >
                      <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dk:text-emerald-400" aria-hidden />{t}
                    </motion.li>
                  ))}
                </ul>
                <div className="border-t border-[#f0ded0] p-6 text-center dk:border-[#443127]">
                  <Link to={cta} className={cx(BTN, "w-full sm:w-auto")}>{ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                  <p className={cx("mt-3 text-xs", MUTED)}>Email verification required · {gw ? `payment via ${gw.name}` : "secure payment"}</p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal from="right">
              <div className={cx(CARD, LIFT, "group p-5 sm:p-6")}>
                <h3 className={cx("flex items-center gap-2 font-semibold", H)}><Wallet className="h-5 w-5 text-orange-700 transition-transform group-hover:-rotate-12 dk:text-orange-300" aria-hidden /> Cancellation & refund</h3>
                {info ? (
                  <>
                    <p className={cx("mt-2 text-sm", P)}>
                      Cancel any time <strong>before you use your first match</strong>. We keep a <strong>{fee}%</strong> cancellation fee and refund the rest to your original payment method.
                    </p>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-rose-100 dk:bg-rose-500/20" role="img" aria-label={`${100 - fee}% refunded, ${fee}% fee`}>
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${100 - fee}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                      />
                    </div>
                    <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
                      {[["You pay", price, ""], [`Fee (${fee}%)`, `−${inr(feePaise)}`, "text-rose-600 dk:text-rose-300"], ["Refund", inr(refundPaise), "text-emerald-700 dk:text-emerald-300"]].map(([k, v, c]) => (
                        <div key={k} className="rounded-xl bg-orange-50/70 p-3 ring-1 ring-orange-100 dk:bg-orange-500/10 dk:ring-orange-500/20">
                          <dt className={cx("text-xs", MUTED)}>{k}</dt>
                          <dd className={cx("mt-1 text-lg font-bold tabular-nums", c || H)}>{v}</dd>
                        </div>
                      ))}
                    </dl>
                    <p className={cx("mt-3 text-xs", MUTED)}>Once a match is used, the entry is not refundable. The fee that applies is the one shown when you paid, even if we change it later.</p>
                  </>
                ) : <p className={cx("mt-2 text-sm", MUTED)}>Loading…</p>}
              </div>
            </Reveal>

            <Reveal from="right" delay={0.08}>
              <div className={cx(CARD, LIFT, "group p-5 sm:p-6")}>
                <h3 className={cx("flex items-center gap-2 font-semibold", H)}><Timer className="h-5 w-5 text-orange-700 transition-transform group-hover:rotate-12 dk:text-orange-300" aria-hidden /> Arena rules</h3>
                {info ? (
                  <ul className="mt-3 space-y-2.5 text-sm">
                    {[
                      [Handshake, `${matches} ${matchWord} per entry${matches > 1 ? ", one after another, never at the same time" : ""}.`],
                      [Clock, `Requests expire after ${info.requestExpiryDays} ${info.requestExpiryDays === 1 ? "day" : "days"} if unanswered.`],
                      [Users, `Up to ${info.maxOutgoingRequests} pending requests at once.`],
                      [RefreshCw, info.minMatchDaysBeforeEnd > 0 ? `A partnership can be ended after ${info.minMatchDaysBeforeEnd} ${info.minMatchDaysBeforeEnd === 1 ? "day" : "days"}.` : "Either buddy can end a partnership at any time."],
                      [ShieldCheck, "You can't be re-matched with someone you've already partnered with."],
                      [Flag, "Block or report anyone. Blocking ends the partnership immediately."],
                    ].map(([Icon, text], i) => (
                      <motion.li
                        key={text}
                        className={cx("flex items-start gap-2.5", H)}
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.06 }}
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dk:text-orange-300" aria-hidden />{text}
                      </motion.li>
                    ))}
                  </ul>
                ) : <p className={cx("mt-2 text-sm", MUTED)}>Loading…</p>}
              </div>
            </Reveal>

            <Reveal from="right" delay={0.16}>
              <div className={cx(CARD, LIFT, "group p-5 sm:p-6")}>
                <h3 className={cx("flex items-center gap-2 font-semibold", H)}><CreditCard className="h-5 w-5 text-orange-700 transition-transform group-hover:-rotate-6 dk:text-orange-300" aria-hidden /> Payment</h3>
                {gw ? (
                  <>
                    <p className={cx("mt-2 text-sm", P)}>Payments are processed securely by <strong>{gw.name}</strong>. We never see or store your card details.</p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {gw.methods.map((m) => (
                        <li key={m} className={cx(CHIP, "inline-flex items-center gap-1.5 py-1 transition-transform hover:-translate-y-0.5 hover:scale-105")}>
                          {m === "UPI" ? <Smartphone className="h-3.5 w-3.5" aria-hidden /> : m === "Net banking" ? <Landmark className="h-3.5 w-3.5" aria-hidden /> : <CreditCard className="h-3.5 w-3.5" aria-hidden />} {m}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : <p className={cx("mt-2 text-sm", MUTED)}>Secure online payment.</p>}
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ================================ TRUST ================================ */}
      <Section>
        <Heading eyebrow="Safety" title="Built so conversations stay safe">A few quiet rules that keep the arena useful.</Heading>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            [MailCheck, "Verified members", "Every account confirms its email with a one-time code. Code requests are limited per IP, email and mobile number."],
            [EyeOff, "No off-platform shortcuts", "Contact details can't be typed into public fields or request messages, so nobody can skip the accept step."],
            [Flag, "You're in control", "Block, report, or end a partnership whenever you like. Our team reviews reports and can suspend accounts."],
          ].map(([Icon, t, d], i) => (
            <Reveal key={t} delay={i * 0.1} from={i === 0 ? "left" : i === 2 ? "right" : "up"}>
              <div className={cx(CARD, LIFT, "group h-full p-6")}>
                <span className={TILE}><Icon className="h-5 w-5" aria-hidden /></span>
                <h3 className={cx("mt-4 font-semibold", H)}>{t}</h3>
                <p className={cx("mt-1.5 text-sm", P)}>{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ================================= FAQ ================================= */}
      <Section alt>
        <div className="mx-auto max-w-3xl">
          <Reveal><h2 className={cx("text-center text-3xl font-bold tracking-tight sm:text-4xl", H)}>Questions, answered</h2></Reveal>
          <div className="mt-10 space-y-3">
            {faq.map(([q, a], i) => {
              const isOpen = open === i;
              return (
                <Reveal key={q} delay={i * 0.04}>
                  <div className={cx(CARD, "overflow-hidden transition-shadow", isOpen && "shadow-lg shadow-orange-900/10")}>
                    <h3>
                      <button
                        type="button"
                        onClick={() => setOpen(isOpen ? -1 : i)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-${i}`}
                        className={cx("flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-base font-semibold transition-colors hover:bg-orange-50 dk:hover:bg-[#2c211b] sm:px-6 sm:py-5", H)}
                      >
                        {q}
                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} className="shrink-0">
                          <ChevronDown className="h-5 w-5 text-orange-600" aria-hidden />
                        </motion.span>
                      </button>
                    </h3>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          id={`faq-${i}`}
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <p className={cx("px-5 pb-5 text-sm leading-relaxed sm:px-6", P)}>{a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ================================= CTA ================================= */}
      <section className={cx(PAGE_BG, "px-4 py-16 sm:px-6 sm:py-20")}>
        <Reveal from="scale" className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-[#fff7ed] to-amber-50 px-6 py-14 text-center dk:border-orange-500/25 dk:from-orange-500/10 dk:via-orange-500/5 dk:to-amber-500/10 sm:py-16">
          <div aria-hidden className="arena-float absolute -left-6 top-8 h-20 w-20 rounded-full bg-orange-300/50 dk:bg-orange-500/20" />
          <div aria-hidden className="arena-float-delay absolute -right-4 bottom-10 h-24 w-24 rounded-full bg-amber-300/60 dk:bg-amber-500/20" />
          <div aria-hidden className="arena-spin-slow absolute right-10 top-6 h-16 w-16 rounded-full border-2 border-dashed border-orange-300 dk:border-orange-500/40" />
          <Handshake aria-hidden className="arena-float-slow absolute left-10 bottom-8 hidden h-10 w-10 text-orange-400 sm:block" />
          <h2 className={cx("relative text-3xl font-bold tracking-tight sm:text-4xl", H)}>Your next mock interview is one match away.</h2>
          <p className={cx("relative mx-auto mt-3 max-w-xl", P)}>Join the arena, pick a buddy, and start practising this week.</p>
          <Link to={cta} className={cx(BTN, "relative mt-8")}>{ctaLabel} <ArrowRight className="h-4 w-4" aria-hidden /></Link>
        </Reveal>
      </section>
    </main>
  );
}
