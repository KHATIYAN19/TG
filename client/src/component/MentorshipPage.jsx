import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  CalendarCheck,
  Check,
  ChevronDown,
  Code2,
  FileText,
  GraduationCap,
  HeartHandshake,
  Layers,
  LineChart,
  Mail,
  MessagesSquare,
  Mic,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Swords,
  Target,
  UserCheck,
  Video,
} from "lucide-react";

/* =====================================================
   MENTORSHIP PAGE  ->  /mentorship
   Uses the site-wide Learn navbar (rendered by App.jsx).
   Light first, dark through the navbar toggle (dk: variant).
===================================================== */

const SITE = "https://www.targettrek.in";
const PAGE_URL = `${SITE}/mentorship`;
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";
const EASE = [0.22, 1, 0.36, 1];

const PRICE_MONTHLY = 10000;
const PRICE_QUARTER = 25000;
const SAVINGS = PRICE_MONTHLY * 3 - PRICE_QUARTER;

const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const enrolLink = (plan) =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    `Mentorship enrolment - ${plan}`
  )}&body=${encodeURIComponent(
    "Hi Target Trek team,\n\nI want to join the mentorship programme.\n\nName:\nCollege / Company:\nYear / Experience:\nTarget role:\nPlan: " +
      plan +
      "\n"
  )}`;

/* ------------------------- shared look ------------------------- */
const PAGE_BG = "bg-[#fffdfb] dk:bg-[#15110e]";
const ALT_BG = "bg-[#fff8f2] dk:bg-[#1c1612]";
const CARD =
  "rounded-2xl border border-[#f0ded0] bg-white shadow-sm dk:border-[#443127] dk:bg-[#241b15]";
const LIFT =
  "transition-all duration-300 hover:-translate-y-1.5 hover:border-orange-300 hover:shadow-xl hover:shadow-orange-900/10 dk:hover:border-orange-500/40";
const H = "text-[#29201b] dk:text-[#fff7ed]";
const P = "text-stone-600 dk:text-[#d6c4b8]";
const MUTED = "text-stone-500 dk:text-[#b9a79c]";
const EYEBROW =
  "text-xs font-bold uppercase tracking-[0.18em] text-orange-700 dk:text-orange-300";
const TILE =
  "grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-100 text-orange-700 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 dk:bg-orange-500/15 dk:text-orange-300";
const BTN =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-orange-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-600/25 transition-all hover:-translate-y-0.5 hover:bg-orange-700 hover:shadow-xl hover:shadow-orange-600/30 active:translate-y-0";
const BTN_GHOST =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-[#e8cdb8] bg-white px-6 py-3.5 text-base font-semibold text-[#29201b] transition-all hover:-translate-y-0.5 hover:border-orange-400 dk:border-[#5a4132] dk:bg-[#241b15] dk:text-[#fff7ed]";
const WRAP = "mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8";

/* ------------------------- motion helpers ------------------------- */
const OFFSETS = {
  up: { y: 26 },
  left: { x: -34 },
  right: { x: 34 },
  scale: { scale: 0.92 },
};

function Reveal({ children, delay = 0, from = "up", className }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, ...OFFSETS[from] }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* Card that leans towards the pointer (skipped for reduced motion / touch). */
function Tilt({ children, className, max = 6 }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), {
    stiffness: 200,
    damping: 18,
  });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), {
    stiffness: 200,
    damping: 18,
  });
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

function Counter({ value, suffix = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    const c = animate(0, value, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => c.stop();
  }, [inView, value]);
  return (
    <span ref={ref}>
      {shown.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

function Heading({ eyebrow, title, lead, center = true }) {
  return (
    <Reveal className={`mb-12 max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <span className={EYEBROW}>{eyebrow}</span>
      <h2 className={`mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl ${H}`}>
        {title}
      </h2>
      {lead && <p className={`mt-4 text-base leading-relaxed sm:text-lg ${P}`}>{lead}</p>}
    </Reveal>
  );
}

function Section({ id, alt, children }) {
  return (
    <section id={id} className={`scroll-mt-24 py-16 sm:py-24 ${alt ? ALT_BG : PAGE_BG}`}>
      <div className={WRAP}>{children}</div>
    </section>
  );
}

/* ------------------------- content ------------------------- */

const STATS = [
  { value: 10, suffix: "+", label: "Students mentored" },
  { value: 6, suffix: "", label: "Areas of placement guidance" },
  { value: 1, suffix: ":1", label: "Personal mentor calls" },
  { value: 3, suffix: " mo", label: "Full programme length" },
];

const STAGES = [
  {
    key: "resume",
    icon: FileText,
    step: "01",
    title: "Resume guidance",
    tag: "Get shortlisted",
    text: "Your resume is the first interview. We review it with you line by line so it gives you the best chance of being shortlisted.",
    points: [
      "Detailed resume review with honest, specific feedback",
      "Projects and experience rewritten into clear, impact-focused bullets",
      "ATS-friendly format with keywords matched to the roles you target",
      "Right structure for freshers: education, skills, projects, internships",
      "Multiple revisions until the resume is ready to send",
      "LinkedIn and GitHub profile suggestions",
    ],
  },
  {
    key: "projects",
    icon: Code2,
    step: "02",
    title: "Project guidance",
    tag: "Build what interviewers ask about",
    text: "Interviewers spend most of the time on your projects. We help you pick, build and explain them well.",
    points: [
      "Which projects are worth building for your target roles",
      "Feedback on architecture, tech choices and code quality",
      "How to add depth: auth, caching, scaling, testing",
      "How to explain a project in 2 minutes and in 20 minutes",
      "Likely cross-questions on your project, and how to answer them",
      "Making your GitHub repos look professional",
    ],
  },
  {
    key: "prep",
    icon: Target,
    step: "03",
    title: "Preparation and resources",
    tag: "Study the right things",
    text: "There is too much content out there. We help you find the right resources and a plan you can actually follow.",
    points: [
      "Gap analysis on day one to see where you stand",
      "A personal week-by-week plan: DSA, core CS, Java / backend, LLD, HLD",
      "Help finding the best resources: courses, sheets, videos, docs, practice lists",
      "What to skip, so you do not waste time on low-value topics",
      "Weekly 1:1 call to review progress and clear blockers",
      "All Target Trek books included",
    ],
  },
  {
    key: "mocks",
    icon: Mic,
    step: "04",
    title: "Mock interviews",
    tag: "Practise before it counts",
    text: "Real interview conditions, with feedback you can act on, before the actual round.",
    points: [
      "Mock rounds for DSA, core CS, projects, system design and HR",
      "Detailed written feedback after every mock",
      "Behavioural answer coaching using your own experiences",
      "Fixing communication, thinking-aloud and time management",
      "Debrief of your real interviews: what went wrong, what to fix",
      "Peer mock sessions through Prep Arena",
    ],
  },
  {
    key: "apply",
    icon: Search,
    step: "05",
    title: "Applications and shortlisting",
    tag: "Get noticed",
    text: "Good preparation still needs to reach the right people. We guide you on where and how to apply.",
    points: [
      "Which companies and roles suit your level",
      "On-campus drives, off-campus openings and fresher hiring windows",
      "How to approach referrals and write cold messages",
      "Preparing for online assessments and screening rounds",
      "Tracking applications and following up properly",
      "Honest feedback on where you are getting filtered out",
    ],
  },
  {
    key: "placement",
    icon: Briefcase,
    step: "06",
    title: "Placement suggestions and guidance",
    tag: "Make better decisions",
    text: "Ongoing advice for the decisions that come up during placement season.",
    points: [
      "Career direction: backend, full-stack, GenAI and others",
      "Choosing between offers, or between an internship and a full-time job",
      "HR round, salary and negotiation basics for freshers",
      "Company-wise interview patterns and recent experiences",
      "Handling rejections and staying consistent",
      "A mentor to ask when you are not sure what to do next",
    ],
  },
];

const ACCESS = [
  {
    icon: BookOpen,
    title: "Access to ALL our books",
    text: "Every Target Trek ebook is unlocked for the length of your mentorship: Java, Spring Boot, System Design HLD and LLD, Operating Systems, GenAI and more, plus new ones released while you are enrolled.",
    chips: ["Java", "Spring Boot", "HLD + LLD", "OS", "GenAI"],
    to: "/books",
    cta: "Browse the library",
  },
  {
    icon: Swords,
    title: "Prep Arena access",
    text: "Get matched with prep buddies, run mock sessions together and stay accountable. Practising with peers is one of the fastest ways to find your gaps.",
    chips: ["Prep buddies", "Peer mocks", "Chat", "Accountability"],
    to: "/prep-buddy",
    cta: "See Prep Arena",
  },
];

const WHO = [
  {
    icon: GraduationCap,
    title: "College students, any year",
    text: "First year or final year, you get a plan for your stage: early students build the right foundation, final-year students get placement-focused prep.",
  },
  {
    icon: Rocket,
    title: "Pre-final and final-year students",
    text: "Campus placements are close. Get your resume, projects and interview skills in shape before the drives begin.",
  },
  {
    icon: Briefcase,
    title: "Fresh graduates",
    text: "Graduated and still looking? Get a structured plan, better applications and regular mock interviews.",
  },
  {
    icon: UserCheck,
    title: "Up to 1 year of experience",
    text: "Early in your career and looking to move to a better company or role? We help you turn your first year into a stronger profile.",
  },
  {
    icon: Layers,
    title: "Tier-2 / Tier-3 college students",
    text: "Limited placement support at your college? We give you the guidance and the resources bigger campuses take for granted.",
  },
  {
    icon: LineChart,
    title: "Students who keep getting rejected",
    text: "Failing at the same round again and again? A mentor looks at the pattern and helps you find what to fix.",
  },
];

const EXTRAS = [
  { icon: FileText, title: "Resume reviews", text: "As many revisions as you need until it is ready to send." },
  { icon: Code2, title: "Project feedback", text: "Honest review of what you built and how you explain it." },
  { icon: Mic, title: "Mock interviews", text: "Realistic rounds with written feedback after each one." },
  { icon: Video, title: "Weekly 1:1 mentor calls", text: "Dedicated time with a mentor who tracks your progress." },
  { icon: Search, title: "Help finding resources", text: "The right courses, sheets and books for your level, without the noise." },
  { icon: CalendarCheck, title: "Structured weekly plan", text: "Clear goals every week so you always know what to do next." },
  { icon: MessagesSquare, title: "Doubt support", text: "Ask your mentor when you are stuck. Replies come during working hours." },
  { icon: HeartHandshake, title: "Small, personal group", text: "We keep the group small so every student gets real attention." },
];

const ROADMAP = [
  {
    month: "Month 1",
    title: "Foundation: resume, projects and plan",
    items: [
      "Skill assessment and goal setting",
      "Resume rebuild and profile cleanup",
      "Project selection and first project review",
      "Personal roadmap and resource list",
    ],
  },
  {
    month: "Month 2",
    title: "Skill building and first mocks",
    items: [
      "DSA, core CS and backend depth",
      "LLD and HLD modules where relevant",
      "Project improvements and explanation practice",
      "First round of mock interviews with feedback",
    ],
  },
  {
    month: "Month 3",
    title: "Applications, mocks and placement guidance",
    items: [
      "Company-focused mock interview loops",
      "Applications, referrals and follow-ups",
      "Online assessment and HR round preparation",
      "Offer and decision guidance",
    ],
  },
];

const COMPARE = [
  ["Resume guidance", true, true],
  ["Project guidance", true, true],
  ["Mock interviews with feedback", true, true],
  ["Resource suggestions and weekly plan", true, true],
  ["Placement suggestions and guidance", true, true],
  ["All books + Prep Arena", true, true],
  ["Full journey: resume → projects → mocks → applications", false, true],
  ["Time to improve and repeat mocks", false, true],
];

const FAQS = [
  {
    q: "Will I definitely get placed?",
    a: "No, and nobody honestly can promise that. Your mentor will help you with your resume, projects, preparation and interviews so you have the best possible chance of getting shortlisted and cracking the rounds. The effort and the final result depend on you and the market. We do not guarantee a job or a shortlist.",
  },
  {
    q: "Who is this for?",
    a: "College students (any year) and people with up to one year of work experience. If you have more experience than that, this programme is probably not the right fit.",
  },
  {
    q: "Is it suitable if I'm still in my first or second year?",
    a: "Yes. Early students get a long-term roadmap: what to learn, which projects to build and how to build a profile that stands out by the time placements begin.",
  },
  {
    q: "What kind of help will I get finding resources?",
    a: "Your mentor will suggest the right resources for your level and goal: DSA sheets, Java and backend material, system design content, project ideas and interview experiences, and tell you what to skip. You also get all Target Trek books.",
  },
  {
    q: "Which plan should I choose?",
    a: `Take 1 month if you need a focused push such as a resume and a few mocks. Take 3 months for the complete journey. It is ${inr(SAVINGS)} cheaper and gives you time to improve, not just receive feedback.`,
  },
  {
    q: "Who are the mentors?",
    a: "Working software engineers who have been through these interviews. You are told who your mentor is before you pay.",
  },
  {
    q: "How do I pay and join?",
    a: "Tap Enrol and send us a short email with your details and plan. We confirm your mentor match and share the payment details. Your plan starts with your first session.",
  },
  {
    q: "What is the refund policy?",
    a: "Please read our Refund Policy for the exact terms. If you are unsure about fit, write to us before paying and we will tell you honestly whether the programme suits you.",
  },
];

const HERO_WORDS = ["Resume", "Projects", "Mock Interviews", "Placement"];

/* ------------------------- sections ------------------------- */

function RotatingWord() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return undefined;
    const t = setInterval(() => setI((n) => (n + 1) % HERO_WORDS.length), 2200);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <span className="relative inline-block min-w-[3ch] align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={HERO_WORDS[i]}
          className="inline-block bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 24, rotateX: -50 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -24, rotateX: 50 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {HERO_WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Hero() {
  return (
    <section className={`relative overflow-hidden ${PAGE_BG}`}>
      {/* animated background blobs */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-orange-300/30 blur-3xl dk:bg-orange-500/15"
        animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-40 h-[360px] w-[360px] rounded-full bg-amber-200/40 blur-3xl dk:bg-amber-500/10"
        animate={{ x: [0, -30, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className={`${WRAP} relative grid items-center gap-12 pb-16 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-24`}>
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-sm font-semibold text-orange-700 dk:border-orange-500/30 dk:bg-orange-500/10 dk:text-orange-300">
              <Sparkles className="h-4 w-4" /> Target Trek Mentorship
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className={`mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl ${H}`}>
              Placement mentorship: <RotatingWord />
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className={`mt-6 max-w-xl text-lg leading-relaxed ${P}`}>
              Complete placement mentorship for college students and people with
              up to one year of experience: resume guidance, project guidance,
              mock interviews, and placement suggestions, with every Target Trek
              book and Prep Arena included.
            </p>
          </Reveal>
          <Reveal delay={0.24} className="mt-8 flex flex-wrap gap-3">
            <a href="#pricing" className={BTN}>
              See pricing
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </a>
            <a href="#stages" className={BTN_GHOST}>
              How it works
            </a>
          </Reveal>
          <Reveal delay={0.32} className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {["10+ students mentored", "College students + up to 1 yr experience", "Starts at " + inr(PRICE_MONTHLY) + "/month", "Books + Prep Arena included"].map((t) => (
              <span key={t} className={`inline-flex items-center gap-2 text-sm font-medium ${P}`}>
                <BadgeCheck className="h-4 w-4 text-orange-600 dk:text-orange-300" />
                {t}
              </span>
            ))}
          </Reveal>
        </div>

        {/* floating journey card */}
        <Reveal from="right" delay={0.2}>
          <Tilt max={5} className={`${CARD} relative p-6 sm:p-8`}>
            <p className={`text-sm font-bold uppercase tracking-widest ${MUTED}`}>
              Your journey
            </p>
            <ol className="mt-5 space-y-4">
              {STAGES.map((s, i) => (
                <motion.li
                  key={s.key}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.18, duration: 0.5, ease: EASE }}
                >
                  <span className={TILE}>
                    <s.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-bold ${H}`}>{s.title}</p>
                    <p className={`text-sm ${MUTED}`}>{s.tag}</p>
                  </div>
                  <Check className="h-5 w-5 text-emerald-500" />
                </motion.li>
              ))}
              <motion.li
                className="flex items-center gap-4 border-t border-dashed border-[#e8cdb8] pt-4 dk:border-[#5a4132]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                <span className={TILE}>
                  <BookOpen className="h-5 w-5" />
                </span>
                <p className={`font-semibold ${H}`}>All books + Prep Arena</p>
              </motion.li>
            </ol>
            <div className="mt-6 rounded-xl bg-orange-50 p-4 dk:bg-orange-500/10">
              <p className={`text-sm ${P}`}>Plans from</p>
              <p className={`text-3xl font-extrabold ${H}`}>
                {inr(PRICE_MONTHLY)}
                <span className={`text-base font-medium ${MUTED}`}> /month</span>
              </p>
            </div>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}

function StatsBand() {
  return (
    <div className={`border-y border-[#f0ded0] ${ALT_BG} dk:border-[#443127]`}>
      <div className={`${WRAP} grid grid-cols-2 gap-6 py-10 lg:grid-cols-4`}>
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.07} className="text-center">
            <p className="text-4xl font-extrabold text-orange-600 dk:text-orange-300 sm:text-5xl">
              <Counter value={s.value} suffix={s.suffix} />
            </p>
            <p className={`mt-1 text-sm font-medium ${P}`}>{s.label}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function Stages() {
  return (
    <Section id="stages">
      <Heading
        eyebrow="Complete placement mentorship"
        title="One mentor for your entire placement journey"
        lead="Most people get help with only one piece. Here your mentor guides you through resume, projects, preparation, mock interviews and applications, so you give yourself the best chance of getting shortlisted."
      />
      <div className="relative grid gap-6 lg:grid-cols-3">
        <div
          aria-hidden
          className="absolute left-0 right-0 top-14 hidden h-px bg-gradient-to-r from-transparent via-orange-300 to-transparent lg:block"
        />
        {STAGES.map((s, i) => (
          <Reveal key={s.key} delay={i * 0.12}>
            <Tilt className={`${CARD} ${LIFT} group relative h-full p-6 sm:p-7`}>
              <div className="flex items-center justify-between">
                <span className={TILE}>
                  <s.icon className="h-5 w-5" />
                </span>
                <span className={`text-xs font-bold uppercase tracking-widest ${MUTED}`}>
                  Stage {s.step}
                </span>
              </div>
              <h3 className={`mt-5 text-2xl font-extrabold ${H}`}>{s.title}</h3>
              <p className="mt-1 text-sm font-semibold text-orange-700 dk:text-orange-300">
                {s.tag}
              </p>
              <p className={`mt-3 text-[15px] leading-relaxed ${P}`}>{s.text}</p>
              <ul className="mt-5 space-y-3">
                {s.points.map((p) => (
                  <li key={p} className={`flex gap-3 text-sm leading-relaxed ${P}`}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dk:text-orange-300" />
                    {p}
                  </li>
                ))}
              </ul>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Access() {
  return (
    <Section id="access" alt>
      <Heading
        eyebrow="Included with every plan"
        title="More than mentoring: the whole toolkit"
        lead="Your mentor guides you. The library and Prep Arena give you everything to practise with."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {ACCESS.map((a, i) => (
          <Reveal key={a.title} from={i ? "right" : "left"}>
            <div className={`${CARD} ${LIFT} group h-full p-7`}>
              <span className={TILE}>
                <a.icon className="h-5 w-5" />
              </span>
              <h3 className={`mt-5 text-xl font-extrabold ${H}`}>{a.title}</h3>
              <p className={`mt-3 leading-relaxed ${P}`}>{a.text}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {a.chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-md bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 dk:bg-[#2c211b] dk:text-[#ead9cc]"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <Link
                to={a.to}
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-orange-700 hover:gap-3 dk:text-orange-300"
                style={{ transition: "gap .2s" }}
              >
                {a.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Who() {
  return (
    <Section id="who">
      <Heading
        eyebrow="Who is it for"
        title="Suitable for college students and up to 1 year of experience"
        lead="Built for students and early-career developers who are preparing for their first job or their next one in the first year of work."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {WHO.map((w, i) => (
          <Reveal key={w.title} delay={(i % 3) * 0.08}>
            <div className={`${CARD} ${LIFT} group h-full p-6`}>
              <span className={TILE}>
                <w.icon className="h-5 w-5" />
              </span>
              <h3 className={`mt-4 text-lg font-bold ${H}`}>{w.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${P}`}>{w.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Extras() {
  return (
    <Section id="included" alt>
      <Heading
        eyebrow="What you get"
        title="Everything in the programme"
        lead="One price covers all of it. There are no add-ons and no hidden fees."
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {EXTRAS.map((e, i) => (
          <Reveal key={e.title} delay={(i % 4) * 0.07}>
            <div className={`${CARD} ${LIFT} group h-full p-5`}>
              <span className={TILE}>
                <e.icon className="h-5 w-5" />
              </span>
              <h3 className={`mt-4 font-bold ${H}`}>{e.title}</h3>
              <p className={`mt-1.5 text-sm leading-relaxed ${P}`}>{e.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Roadmap() {
  return (
    <Section id="roadmap">
      <Heading
        eyebrow="The 3-month plan"
        title="What your three months look like"
        lead="A realistic timeline from rough resume to confident interviews."
      />
      <div className="relative mx-auto max-w-3xl">
        <div
          aria-hidden
          className="absolute bottom-2 left-5 top-2 w-px bg-gradient-to-b from-orange-400 via-orange-300 to-transparent"
        />
        {ROADMAP.map((r, i) => (
          <Reveal key={r.month} from="left" delay={i * 0.1} className="relative pb-10 pl-14 last:pb-0">
            <span className="absolute left-0 top-0 grid h-10 w-10 place-items-center rounded-full bg-orange-600 text-sm font-extrabold text-white shadow-lg shadow-orange-600/30">
              {i + 1}
            </span>
            <div className={`${CARD} p-6`}>
              <p className={EYEBROW}>{r.month}</p>
              <h3 className={`mt-1 text-xl font-extrabold ${H}`}>{r.title}</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {r.items.map((it) => (
                  <li key={it} className={`flex gap-2 text-sm ${P}`}>
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dk:text-orange-300" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function PlanCard({ name, price, per, note, badge, featured, features, plan }) {
  return (
    <Tilt
      max={4}
      className={`relative flex h-full flex-col rounded-3xl p-7 sm:p-8 ${
        featured
          ? "border-2 border-orange-500 bg-white shadow-2xl shadow-orange-600/15 dk:bg-[#2a1f18]"
          : `${CARD}`
      }`}
    >
      {badge && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
          {badge}
        </span>
      )}
      <h3 className={`text-lg font-bold ${H}`}>{name}</h3>
      <p className={`mt-1 text-sm ${MUTED}`}>{note}</p>
      <p className={`mt-6 text-5xl font-extrabold tracking-tight ${H}`}>
        {inr(price)}
        <span className={`ml-1 text-base font-medium ${MUTED}`}>{per}</span>
      </p>
      <ul className="mt-6 flex-1 space-y-3">
        {features.map((f) => (
          <li key={f} className={`flex gap-3 text-sm leading-relaxed ${P}`}>
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-orange-600 dk:text-orange-300" />
            {f}
          </li>
        ))}
      </ul>
      <a
        href={enrolLink(plan)}
        className={`${featured ? BTN : BTN_GHOST} mt-8 w-full`}
      >
        Enrol in {plan}
        <ArrowRight className="h-5 w-5" />
      </a>
    </Tilt>
  );
}

function Pricing() {
  const base = [
    "Resume guidance",
    "Project guidance",
    "Personal roadmap and weekly plan",
    "Weekly 1:1 mentor call",
    "Mock interviews with written feedback",
    "Access to ALL Target Trek books",
    "Prep Arena access",
    "Help finding the right resources",
    "Doubt support from your mentor",
  ];
  return (
    <Section id="pricing" alt>
      <Heading
        eyebrow="Pricing"
        title="Simple, transparent pricing"
        lead="Same mentorship either way. Pick the length that fits your timeline."
      />
      <div className="mx-auto grid max-w-4xl gap-8 pt-3 md:grid-cols-2">
        <Reveal from="left">
          <PlanCard
            name="Monthly"
            price={PRICE_MONTHLY}
            per="/ month"
            note="Flexible. Good for a focused push."
            features={base}
            plan="Monthly plan"
          />
        </Reveal>
        <Reveal from="right">
          <PlanCard
            featured
            badge={`Best value · Save ${inr(SAVINGS)}`}
            name="3 Months"
            price={PRICE_QUARTER}
            per="/ 3 months"
            note={`Works out to about ${inr(Math.round(PRICE_QUARTER / 3))} per month.`}
            features={[
              ...base,
              "Complete journey: resume → projects → mocks → applications",
              "Month-by-month roadmap",
              "Time to improve and repeat mock interviews",
            ]}
            plan="3-month plan"
          />
        </Reveal>
      </div>

      <Reveal className="mx-auto mt-12 max-w-4xl">
        <div className={`${CARD} overflow-hidden`}>
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-[#f0ded0] px-5 py-3 text-xs font-bold uppercase tracking-wider dk:border-[#443127] sm:gap-x-10 sm:px-6">
            <span className={MUTED}>Compare</span>
            <span className={`w-14 text-center ${MUTED}`}>1 mo</span>
            <span className="w-14 text-center text-orange-700 dk:text-orange-300">3 mo</span>
          </div>
          {COMPARE.map(([label, a, b]) => (
            <div
              key={label}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-[#f6e9de] px-5 py-3 last:border-0 dk:border-[#33261d] sm:gap-x-10 sm:px-6"
            >
              <span className={`text-sm ${P}`}>{label}</span>
              {[a, b].map((v, i) => (
                <span key={i} className="grid w-14 place-items-center">
                  {v ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <span className={MUTED}>-</span>
                  )}
                </span>
              ))}
            </div>
          ))}
        </div>
        <p className={`mt-4 text-center text-sm ${MUTED}`}>
          Prices in Indian rupees. Read our{" "}
          <Link to="/refund-policy" className="font-semibold text-orange-700 underline dk:text-orange-300">
            Refund Policy
          </Link>{" "}
          before enrolling.
        </p>
      </Reveal>
    </Section>
  );
}

function Expectations() {
  const yes = [
    "Honest feedback on your resume, projects and interviews",
    "A clear plan and the right resources for your level",
    "Realistic mock interviews so the real ones feel familiar",
    "Guidance on where and how to apply to improve your chance of being shortlisted",
  ];
  const no = [
    "A guaranteed job, shortlist or placement",
    "A mentor who does the work for you",
    "Referrals or offers sold for money",
  ];
  return (
    <Section id="expect">
      <Heading
        eyebrow="Honest expectations"
        title="Your mentor helps you. The result is earned."
        lead="Your mentor will guide you at every step to help you get shortlisted and prepared. We do not and cannot guarantee that you will be placed."
      />
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
        <Reveal from="left">
          <div className={`${CARD} h-full p-6`}>
            <p className="flex items-center gap-2 font-bold text-emerald-600 dk:text-emerald-400">
              <Check className="h-5 w-5" /> What you can expect
            </p>
            <ul className="mt-4 space-y-3">
              {yes.map((t) => (
                <li key={t} className={`flex gap-3 text-sm ${P}`}>
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal from="right">
          <div className={`${CARD} h-full p-6`}>
            <p className="flex items-center gap-2 font-bold text-rose-600 dk:text-rose-400">
              <ShieldCheck className="h-5 w-5" /> What we do not promise
            </p>
            <ul className="mt-4 space-y-3">
              {no.map((t) => (
                <li key={t} className={`flex gap-3 text-sm ${P}`}>
                  <span className="mt-0.5 w-4 shrink-0 text-center font-bold text-rose-500">×</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

function Steps() {
  const steps = [
    { icon: Mail, title: "Apply", text: "Email us your year or experience, goals and target roles. It takes two minutes." },
    { icon: UserCheck, title: "Get matched", text: "We match you with a mentor suited to your background and goal." },
    { icon: Search, title: "Gap analysis", text: "First session: assess your level and build your roadmap." },
    { icon: Rocket, title: "Start the journey", text: "Weekly calls, resume and project work, mocks. Books and Prep Arena open on day one." },
  ];
  return (
    <Section id="how" alt>
      <Heading eyebrow="Getting started" title="From 'hi' to first session in a few days" />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.09}>
            <div className={`${CARD} ${LIFT} group relative h-full p-6`}>
              <span className="absolute right-5 top-4 text-5xl font-black text-orange-100 dk:text-orange-500/10">
                {i + 1}
              </span>
              <span className={TILE}>
                <s.icon className="h-5 w-5" />
              </span>
              <h3 className={`mt-4 text-lg font-bold ${H}`}>{s.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${P}`}>{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <Section id="faq">
      <Heading eyebrow="FAQ" title="Questions students ask us" />
      <div className="mx-auto max-w-3xl space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={Math.min(i, 5) * 0.04}>
              <div className={`${CARD} overflow-hidden`}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className={`font-semibold ${H}`}>{f.q}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                    <ChevronDown className="h-5 w-5 text-orange-600 dk:text-orange-300" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                    >
                      <p className={`px-5 pb-5 text-sm leading-relaxed ${P}`}>{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}

function FinalCta() {
  return (
    <section className={`${PAGE_BG} py-16 sm:py-24`}>
      <div className={WRAP}>
        <Reveal from="scale">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 to-amber-500 px-6 py-14 text-center text-white shadow-2xl shadow-orange-600/25 sm:px-12">
            <motion.div
              aria-hidden
              className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/15 blur-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 7, repeat: Infinity }}
            />
            <h2 className="relative text-3xl font-extrabold sm:text-4xl">
              Get the guidance to prepare properly for placements.
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-orange-50">
              Get a mentor, a plan and every book. No guaranteed placement, just the best guidance we can give you. {inr(PRICE_MONTHLY)}
              /month or {inr(PRICE_QUARTER)} for 3 months.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <a
                href={enrolLink("3-month plan")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-orange-700 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Enrol now <ArrowRight className="h-5 w-5" />
              </a>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                Ask a question
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------- page ------------------------- */

export default function MentorshipPage() {
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        name: "Target Trek Mentorship Programme",
        description:
          "Placement mentorship for college students and up to 1 year of experience: resume guidance, project guidance, mock interviews and placement suggestions, with all Target Trek books and Prep Arena. Not a placement guarantee.",
        provider: { "@type": "Organization", name: "Target Trek", sameAs: SITE },
        offers: [
          { "@type": "Offer", name: "Monthly", price: PRICE_MONTHLY, priceCurrency: "INR" },
          { "@type": "Offer", name: "3 months", price: PRICE_QUARTER, priceCurrency: "INR" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  const title = "Placement Mentorship for College Students | Resume, Projects, Mocks | Target Trek";
  const desc = `Complete placement mentorship for college students and up to 1 year experience: resume, projects, mock interviews and guidance, plus all books and Prep Arena. ${inr(PRICE_MONTHLY)}/month or ${inr(PRICE_QUARTER)} for 3 months.`;

  return (
    <MotionConfig reducedMotion="user">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={desc} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={desc} />
        <meta property="og:url" content={PAGE_URL} />
        <meta name="twitter:card" content="summary" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <motion.div
        aria-hidden
        className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left bg-orange-600"
        style={{ scaleX: bar }}
      />

      <main className={`${PAGE_BG} font-inter`}>
        <Hero />
        <StatsBand />
        <Stages />
        <Access />
        <Who />
        <Extras />
        <Roadmap />
        <Pricing />
        <Expectations />
        <Steps />
        <Faq />
        <FinalCta />
      </main>
    </MotionConfig>
  );
}
