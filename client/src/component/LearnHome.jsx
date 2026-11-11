import React, { useEffect, useMemo, useRef, useState } from "react";

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Briefcase,
  Broadcast,
  CaretDown,
  Check,
  Code,
  Database,
  FileCode,
  FileText,
  GraduationCap,
  Graph,
  HardDrives,
  Rocket,
  ShieldCheck,
  Sparkle,
  Stack,
  Target,
} from "@phosphor-icons/react";

// =====================================================
// CONFIGURATION
// =====================================================

const SITE_URL = "https://www.targettrek.in";
// "/" and "/learn" render this same page; "/" is the canonical home URL.
const PAGE_URL = `${SITE_URL}/`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE = "Learn System Design, Java LLD & GenAI | Target Trek";

const SEO_DESCRIPTION =
  "Learn System Design HLD, Java LLD, backend architecture and GenAI with Target Trek ebooks, free resources and real interview experiences.";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700&display=swap";

// Base motion curve: weighted, decelerates into place.
const EASE = [0.22, 1, 0.36, 1];

// =====================================================
// THEME
// =====================================================

const readTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

// =====================================================
// CONTENT (routes unchanged)
// =====================================================

const ROTATING_WORDS = [
  "System design",
  "Java LLD",
  "Backend engineering",
  "GenAI and agents",
  "Interview prep",
];

const LEARNING_AREAS = [
  {
    id: "books",
    number: "01",
    eyebrow: "Guided learning",
    title: "Technical books",
    description:
      "Complete engineering handbooks that take you from fundamentals to the architecture and implementation depth interviews expect.",
    path: "/books",
    action: "Explore books",
    icon: BookOpen,
    topics: ["System Design HLD", "Java LLD", "GenAI and agents"],
  },
  {
    id: "interviews",
    number: "02",
    eyebrow: "Career preparation",
    title: "Interview experiences",
    description:
      "Interview journeys and technical rounds across DSA, low level design, high level design and engineering discussions.",
    path: "/interviews",
    action: "Explore interviews",
    icon: Briefcase,
    topics: ["DSA and coding", "System design", "Backend and GenAI"],
  },
  {
    id: "resources",
    number: "03",
    eyebrow: "Learn for free",
    title: "Engineering resources",
    description:
      "Focused guides on system architecture, scalability, databases, distributed systems and backend fundamentals.",
    path: "/resources/hld/cache",
    action: "Start learning",
    icon: GraduationCap,
    topics: ["Architecture", "Databases", "Distributed systems"],
  },
  {
    id: "blogs",
    number: "04",
    eyebrow: "Articles and insights",
    title: "Engineering blogs",
    description:
      "Complex engineering ideas explained through practical examples, concepts and technical articles.",
    path: "/blogs",
    action: "Read articles",
    icon: FileText,
    topics: ["Development", "Engineering", "Interview prep"],
  },
];

const FEATURED_BOOKS = [
  {
    number: "01",
    type: "High level design",
    title: "Mastering System Design",
    highlight: "HLD",
    subtitle: "Think in systems. Design for scale.",
    description:
      "Approach system design interviews with clear requirements, APIs, data modeling, scalable architectures, caching, distributed systems, failure handling and tradeoffs.",
    path: "/book/system-design/hld",
    icon: Graph,
    artTag: "Architecture",
    artLine: "High level design",
    topics: [
      "Architecture",
      "Databases",
      "Redis",
      "Kafka",
      "Scalability",
      "Tradeoffs",
    ],
    benefits: [
      "Understand production style architectures",
      "Practice structured system design discussions",
      "Prepare for HLD interviews",
    ],
  },
  {
    number: "02",
    type: "Low level design",
    title: "Mastering System Design",
    highlight: "LLD",
    subtitle: "Write better Java. Design better software.",
    description:
      "Master object oriented design in Java through OOP, SOLID principles, UML, design patterns, concurrency, locking and detailed interview design problems.",
    path: "/book/system-design/lld",
    icon: Code,
    artTag: "Java and OOP",
    artLine: "Low level design · Java",
    topics: ["Java", "OOP", "SOLID", "UML", "Design patterns", "Concurrency"],
    benefits: [
      "Strengthen object oriented design skills",
      "Learn reusable design patterns",
      "Practice Java LLD interview questions",
    ],
  },
];

const FREE_RESOURCES = [
  {
    number: "01",
    title: "Caching",
    description:
      "Caching strategies, eviction policies, cache invalidation, Redis, TTLs and distributed cache design.",
    icon: Stack,
    path: "/resources/hld/cache",
    category: "Performance",
    tags: ["Redis", "Cache aside", "TTL"],
  },
  {
    number: "02",
    title: "Load balancing",
    description:
      "L4 vs L7 load balancing, request routing, health checks, high availability and traffic distribution.",
    icon: Graph,
    path: "/resources/hld/load-balancing",
    category: "Scalability",
    tags: ["L4 / L7", "Routing", "HA"],
  },
  {
    number: "03",
    title: "Database design",
    description:
      "SQL vs NoSQL, indexes, replication, sharding, consistency, database selection and scaling strategies.",
    icon: Database,
    path: "/resources/hld/database",
    category: "Data",
    tags: ["SQL", "NoSQL", "Sharding"],
  },
  {
    number: "04",
    title: "Message queues",
    description:
      "Asynchronous communication, event driven systems, queues, consumers, retries and delivery guarantees.",
    icon: Broadcast,
    path: "/resources/hld/message-queue",
    category: "Distributed systems",
    tags: ["Kafka", "Events", "Retries"],
  },
  {
    number: "05",
    title: "Rate limiting",
    description:
      "Token bucket, leaky bucket, fixed windows, sliding windows and distributed API rate limiting.",
    icon: ShieldCheck,
    path: "/resources/hld/rate-limiting",
    category: "Reliability",
    tags: ["Token bucket", "Redis", "API"],
  },
  {
    number: "06",
    title: "API gateway",
    description:
      "API routing, authentication, authorization, throttling, security and resilient gateway architecture.",
    icon: HardDrives,
    path: "/resources/hld/api-gateway",
    category: "Architecture",
    tags: ["Routing", "Security", "API"],
  },
];

const BENEFITS = [
  {
    icon: Target,
    title: "Built for interviews",
    description:
      "Connect technical knowledge to the questions and discussions that engineering interviews actually use.",
  },
  {
    icon: Stack,
    title: "Structured content",
    description:
      "Move from single concepts to complete systems without stitching together disconnected material.",
  },
  {
    icon: Code,
    title: "Practical engineering",
    description:
      "Understand implementation decisions, design patterns, scalability, concurrency and production tradeoffs.",
  },
  {
    icon: Rocket,
    title: "Learn at your pace",
    description:
      "Use the free guides for quick revision, or a full book when you are preparing a complete subject.",
  },
];

const INTERVIEW_TOPICS = [
  {
    icon: FileCode,
    title: "DSA and problem solving",
    description:
      "Coding questions, algorithmic thinking, optimization and problem solving discussions.",
  },
  {
    icon: Code,
    title: "Low level design",
    description:
      "Object oriented modeling, design patterns, classes, interfaces, concurrency and Java.",
  },
  {
    icon: Graph,
    title: "High level design",
    description:
      "Architecture, databases, scale, caching, queues, consistency and distributed systems.",
  },
  {
    icon: Sparkle,
    title: "AI and GenAI engineering",
    description:
      "RAG, agents, MCP, orchestration, backend integrations and discussions of real AI projects.",
  },
];

const INTERVIEW_TAGS = ["DSA", "LLD", "HLD", "Java", "Backend", "GenAI"];

const PATH_STEPS = [
  {
    n: "01",
    title: "Understand",
    description:
      "Build strong fundamentals with one free guide at a time, from caching to API gateways.",
    path: "/resources/hld/cache",
    action: "Open the free guides",
  },
  {
    n: "02",
    title: "Design",
    description:
      "Connect the components into complete systems with the HLD and LLD books.",
    path: "/books",
    action: "Browse the books",
  },
  {
    n: "03",
    title: "Apply",
    description:
      "See how real rounds go, then practice explaining your own design decisions.",
    path: "/interviews",
    action: "Read interview experiences",
  },
];

const COMPARE = [
  {
    icon: GraduationCap,
    title: "Focused free learning",
    text: "Explore one engineering concept at a time with explanations and practical examples. Ideal for quick revision.",
    items: [
      "Understand one topic",
      "Build conceptual clarity",
      "Revise engineering fundamentals",
      "Learn at your own pace",
    ],
    link: "/resources/hld/cache",
    linkText: "Start with free resources",
  },
  {
    icon: BookOpen,
    title: "Structured deep learning",
    text: "Study entire topics through connected chapters, case studies, implementation details, architecture choices and interview exercises.",
    items: [
      "Follow structured chapters",
      "Connect related concepts",
      "Explore design decisions",
      "Prepare complete interview topics",
    ],
    link: "/books",
    linkText: "Explore structured books",
    featured: true,
  },
];

const FAQS = [
  {
    question: "Where should I start learning system design?",
    answer:
      "Begin with the free caching, load balancing, database and API gateway resources. When you want complete system design interview preparation, explore the HLD book.",
  },
  {
    question: "What is the difference between HLD and LLD?",
    answer:
      "HLD focuses on scalable architecture, APIs, databases, caching, distributed systems and system level tradeoffs. LLD focuses on object oriented modeling, classes, interfaces, UML, design patterns and Java implementation.",
  },
  {
    question: "Should I read the HLD book or the LLD book first?",
    answer:
      "Choose by the round you are preparing for. Pick HLD for architecture and scalability discussions, and LLD for object oriented design and Java implementation rounds. They cover different skills, so the order is up to you.",
  },
  {
    question: "Are the learning resources free?",
    answer:
      "The resources listed in the free engineering resources section are available through their respective learning pages. The books are separate products; current prices and purchase details are shown on their individual pages.",
  },
  {
    question: "Does Target Trek cover GenAI and AI engineering?",
    answer:
      "Yes. The technical books include GenAI and agents, and the interview experiences cover AI engineering topics such as RAG, agents, MCP and orchestration.",
  },
  {
    question: "Can I find software engineering interview experiences?",
    answer:
      "Yes. The interview experiences section covers preparation and technical rounds across software engineering, backend, low level design, high level design and AI engineering.",
  },
];

const TAGLINE =
  "Anyone can memorize an architecture diagram. Interviews go to the engineer who can explain every box, every arrow and every tradeoff.";

const MARQUEE_ITEMS = [
  "System design",
  "Java LLD",
  "Caching",
  "Kafka",
  "Redis",
  "Sharding",
  "Rate limiting",
  "API gateway",
  "GenAI",
  "RAG",
  "MCP",
  "Design patterns",
  "Concurrency",
  "Load balancing",
];

// Live request path in the hero. Every linked node opens its free guide.
const FLOW_TRUNK = [
  { n: "00", label: "Client", note: "request", y: 36 },
  {
    n: "01",
    label: "Rate limiting",
    note: "token bucket",
    y: 108,
    path: "/resources/hld/rate-limiting",
  },
  {
    n: "02",
    label: "API gateway",
    note: "auth · routing",
    y: 180,
    path: "/resources/hld/api-gateway",
  },
  {
    n: "03",
    label: "Load balancing",
    note: "L4 / L7",
    y: 252,
    path: "/resources/hld/load-balancing",
  },
];

const FLOW_STORES = [
  { label: "Caching", x: 75, path: "/resources/hld/cache" },
  { label: "Database", x: 200, path: "/resources/hld/database" },
  { label: "Queues", x: 325, path: "/resources/hld/message-queue" },
];

const FLOW_EDGES = ["M200 36V416", "M200 296H75V416", "M200 296H325V416"];

const FLOW_PACKETS = [
  { d: "M200 36V296H75V416", begin: "0s" },
  { d: "M200 36V416", begin: "-1.2s" },
  { d: "M200 36V296H325V416", begin: "-2.4s" },
];

// =====================================================
// MOTION HELPERS
// =====================================================

const MotionLink = motion.create(Link);

const stagger = (gap = 0.08, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

const rise = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Rise and fade in once when scrolled into view
function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Staggered group that animates its children on scroll
function Stagger({ children, className, gap, delay }) {
  return (
    <motion.div
      className={className}
      variants={stagger(gap, delay)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-70px" }}
    >
      {children}
    </motion.div>
  );
}

// 3D tilt that follows the cursor
function Tilt({ children, className, max = 6 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), {
    stiffness: 200,
    damping: 22,
  });

  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), {
    stiffness: 200,
    damping: 22,
  });

  const onMove = (event) => {
    if (event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();

    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

// Number that counts up once visible
function Counter({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;

    const controls = animate(0, to, {
      duration: 1.4,
      ease: EASE,
      onUpdate: (latest) => setValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref}>{String(value).padStart(2, "0")}</span>
  );
}

// One headline line sliding up out of a mask
function LineReveal({ children, delay = 0 }) {
  return (
    <span className="lh-line-mask">
      <motion.span
        className="lh-line"
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

// Cycles through topics in the hero status line
function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % ROTATING_WORDS.length);
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="lh-rotator">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={ROTATING_WORDS[index]}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// Flat line grid drawn as SVG (no background gradients)
function GridPattern({ id, size = 32 }) {
  return (
    <svg className="lh-gridsvg" aria-hidden="true">
      <defs>
        <pattern
          id={id}
          width={size}
          height={size}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M${size} 0H0V${size}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// =====================================================
// HERO: LIVE REQUEST PATH
// =====================================================

function FlowNode({ x, y, w, label, path, delay }) {
  const body = (
    <>
      <rect
        className="lh-flow-box"
        x={x - w / 2}
        y={y - 20}
        width={w}
        height="40"
        rx="8"
      />
      <text className="lh-flow-label" x={x} y={y + 4} textAnchor="middle">
        {label}
      </text>
    </>
  );

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {path ? (
        <Link
          to={path}
          className="lh-flow-link"
          aria-label={`${label}: open the free guide`}
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </motion.g>
  );
}

function FlowDiagram() {
  return (
    <svg
      className="lh-flow"
      viewBox="0 0 400 452"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="group"
      aria-label="A request travelling through rate limiting, an API gateway and a load balancer to services backed by a cache, a database and queues"
    >
      {FLOW_EDGES.map((d, index) => (
        <motion.path
          key={d}
          className="lh-flow-edge"
          d={d}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 + index * 0.1, ease: EASE }}
        />
      ))}

      <g className="lh-flow-packets" aria-hidden="true">
        {FLOW_PACKETS.map((packet) => (
          <g key={packet.d}>
            <circle className="lh-flow-halo" r="9" />
            <circle className="lh-flow-packet" r="3.5" />
            <animateMotion
              path={packet.d}
              dur="3.6s"
              begin={packet.begin}
              repeatCount="indefinite"
              calcMode="spline"
              keyPoints="0;1"
              keyTimes="0;1"
              keySplines="0.45 0 0.2 1"
            />
          </g>
        ))}
      </g>

      {FLOW_TRUNK.map((node, index) => (
        <React.Fragment key={node.label}>
          <text
            className="lh-flow-note"
            x="112"
            y={node.y + 4}
            textAnchor="end"
            aria-hidden="true"
          >
            {node.n}
          </text>

          <FlowNode
            x={200}
            y={node.y}
            w={150}
            label={node.label}
            path={node.path}
            delay={0.6 + index * 0.1}
          />

          <text
            className="lh-flow-note"
            x="288"
            y={node.y + 4}
            aria-hidden="true"
          >
            {node.note}
          </text>
        </React.Fragment>
      ))}

      {FLOW_STORES.map((store, index) => (
        <React.Fragment key={store.label}>
          <motion.g
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 + index * 0.08, ease: EASE }}
          >
            <rect
              className="lh-flow-svc"
              x={store.x - 36}
              y="322"
              width="72"
              height="28"
              rx="6"
            />
            <text
              className="lh-flow-note"
              x={store.x}
              y="340"
              textAnchor="middle"
            >
              {`svc ${"abc"[index]}`}
            </text>
          </motion.g>

          <FlowNode
            x={store.x}
            y={416}
            w={110}
            label={store.label}
            path={store.path}
            delay={1.15 + index * 0.08}
          />
        </React.Fragment>
      ))}
    </svg>
  );
}

// =====================================================
// TAGLINE: words light up one at a time on scroll
// =====================================================

function TaglineReveal({ text }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const words = useMemo(() => text.split(" "), [text]);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 55%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    const next = Math.round(progress * words.length);

    // Reveal once: never dim a word again on scroll back up.
    setActive((current) => (next > current ? next : current));
  });

  return (
    <p className="heading-3 lh-tagline" ref={ref}>
      {words.map((word, index) => (
        <React.Fragment key={`${word}-${index}`}>
          <span
            className={cn(
              "lh-tagline-word",
              (reduced || index < active) && "is-on"
            )}
          >
            {word}
          </span>{" "}
        </React.Fragment>
      ))}
    </p>
  );
}

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

function SectionHeading({ index, eyebrow, title, description, action, actionPath }) {
  return (
    <div className="lh-heading">
      <div className="lh-heading-main">
        <Reveal>
          <p className="caption-3 lh-eyebrow">
            <span className="mono lh-eyebrow-index">{index}</span>
            <motion.span
              className="lh-eyebrow-line"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            />
            {eyebrow}
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="heading-3 lh-section-title">{title}</h2>
        </Reveal>

        {description && (
          <Reveal delay={0.16}>
            <p className="body-3 lh-section-description">{description}</p>
          </Reveal>
        )}
      </div>

      {action && actionPath && (
        <Reveal delay={0.2}>
          <Link to={actionPath} className="button-sm lh-text-link">
            {action}
            <ArrowUpRight size={16} weight="bold" />
          </Link>
        </Reveal>
      )}
    </div>
  );
}

function Chip({ children }) {
  return <span className="caption-4 lh-chip">{children}</span>;
}

function LearningAreaCard({ item }) {
  const Icon = item.icon;

  return (
    <motion.div variants={rise} className="lh-cell">
      <Link to={item.path} className="lh-card lh-card-link">
        <div className="lh-card-top">
          <span className="lh-icon-tile">
            <Icon size={24} weight="duotone" />
          </span>

          <span className="mono caption-3 lh-card-number">{item.number}</span>
        </div>

        <p className="caption-3 lh-kicker">{item.eyebrow}</p>

        <h3 className="title-1 lh-card-title">{item.title}</h3>

        <p className="body-6 lh-card-text">{item.description}</p>

        <div className="lh-chips">
          {item.topics.map((topic) => (
            <Chip key={topic}>{topic}</Chip>
          ))}
        </div>

        <div className="button-sm lh-card-action">
          <span>{item.action}</span>

          <span className="lh-arrow">
            <ArrowUpRight size={16} weight="bold" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// Strokes draw themselves when the card scrolls into view
const draw = (delay = 0) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true },
  transition: { duration: 1.1, delay, ease: EASE },
});

function BookDiagram({ index }) {
  if (index === 0) {
    return (
      <svg
        viewBox="0 0 260 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <motion.rect x="83" y="60" width="94" height="43" rx="7" stroke="currentColor" strokeWidth="2" {...draw(0)} />
        <rect x="96" y="71" width="68" height="20" rx="3" fill="currentColor" fillOpacity=".12" />
        <motion.path d="M130 60V35M130 103V126M83 81H52M177 81H208" stroke="currentColor" strokeWidth="2" {...draw(0.3)} />
        <motion.rect x="96" y="12" width="68" height="23" rx="5" stroke="currentColor" strokeWidth="2" {...draw(0.5)} />
        <motion.rect x="16" y="67" width="36" height="28" rx="5" stroke="currentColor" strokeWidth="2" {...draw(0.6)} />
        <motion.rect x="208" y="67" width="36" height="28" rx="5" stroke="currentColor" strokeWidth="2" {...draw(0.7)} />
        <motion.rect x="97" y="126" width="66" height="23" rx="5" stroke="currentColor" strokeWidth="2" {...draw(0.8)} />
        <circle className="lh-pulse-dot" cx="130" cy="81" r="4" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 260 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <motion.rect x="19" y="20" width="222" height="120" rx="9" stroke="currentColor" strokeWidth="2" {...draw(0)} />
      <motion.path d="M19 48H241" stroke="currentColor" strokeWidth="2" {...draw(0.3)} />
      <circle cx="36" cy="34" r="4" fill="currentColor" />
      <circle cx="50" cy="34" r="4" fill="currentColor" fillOpacity=".65" />
      <circle cx="64" cy="34" r="4" fill="currentColor" fillOpacity=".35" />
      <motion.path
        d="M86 69L62 91L86 113M175 69L199 91L175 113M143 64L118 118"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...draw(0.5)}
      />
    </svg>
  );
}

function FeaturedBookCard({ book, index }) {
  const Icon = book.icon;

  return (
    <motion.article variants={rise} className="lh-card lh-book">
      <div className="lh-book-content">
        <div className="lh-book-meta">
          <span className="mono caption-3 lh-book-number">{book.number}</span>
          <span className="caption-3 lh-kicker">{book.type}</span>
        </div>

        <h3 className="heading-5 lh-book-title">
          {book.title} <span>{book.highlight}</span>
        </h3>

        <p className="body-4 lh-book-subtitle">{book.subtitle}</p>

        <p className="body-6 lh-card-text">{book.description}</p>

        <div className="lh-chips">
          {book.topics.map((topic) => (
            <Chip key={topic}>{topic}</Chip>
          ))}
        </div>

        <ul className="lh-checks">
          {book.benefits.map((benefit, i) => (
            <motion.li
              key={benefit}
              className="body-6"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: EASE }}
            >
              <Check size={16} weight="bold" />
              <span>{benefit}</span>
            </motion.li>
          ))}
        </ul>

        <Link to={book.path} className="button-md lh-btn lh-btn-outline">
          Explore the {book.highlight} book
          <ArrowUpRight size={16} weight="bold" />
        </Link>
      </div>

      <div className="lh-book-art" aria-hidden="true">
        <GridPattern id={`lh-grid-book-${index}`} size={24} />

        <div className="lh-orbit lh-orbit-one" />
        <div className="lh-orbit lh-orbit-two" />

        <motion.div
          className="lh-book-float"
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: 5 + index,
            repeat: Infinity,
            ease: [0.45, 0, 0.55, 1],
          }}
        >
          <div className="lh-cover">
            <div className="mono lh-cover-top">
              <span>TARGET TREK</span>
              <Icon size={18} weight="duotone" />
            </div>

            <div className="lh-cover-visual">
              <BookDiagram index={index} />
            </div>

            <div className="lh-cover-bottom">
              <span className="lh-cover-heading">{book.highlight}</span>
              <span className="mono lh-cover-line">{book.artLine}</span>
            </div>
          </div>
        </motion.div>

        <div className="caption-3 lh-art-tag">
          <Icon size={16} weight="duotone" />
          <span>{book.artTag}</span>
        </div>
      </div>
    </motion.article>
  );
}

function ResourceCard({ resource }) {
  const Icon = resource.icon;

  return (
    <motion.div variants={rise} className="lh-cell">
      <Link to={resource.path} className="lh-card lh-card-link">
        <div className="lh-card-top">
          <span className="lh-icon-tile">
            <Icon size={24} weight="duotone" />
          </span>

          <span className="mono caption-3 lh-card-number">
            {resource.number}
          </span>
        </div>

        <p className="caption-3 lh-kicker">{resource.category}</p>

        <h3 className="title-1 lh-card-title">{resource.title}</h3>

        <p className="body-6 lh-card-text">{resource.description}</p>

        <div className="lh-chips">
          {resource.tags.map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>

        <div className="button-sm lh-card-action">
          <span>Read the guide</span>

          <span className="lh-arrow">
            <ArrowUpRight size={16} weight="bold" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function CompareCard({ item }) {
  const Icon = item.icon;

  return (
    <motion.div
      variants={rise}
      className={cn("lh-card lh-compare", item.featured && "lh-compare-featured")}
    >
      <span className="lh-icon-tile">
        <Icon size={24} weight="duotone" />
      </span>

      <h3 className="heading-6 lh-card-title">{item.title}</h3>

      <p className="body-6 lh-card-text">{item.text}</p>

      <ul className="lh-checks">
        {item.items.map((entry, i) => (
          <motion.li
            key={entry}
            className="body-6"
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 + i * 0.08, ease: EASE }}
          >
            <Check size={16} weight="bold" />
            <span>{entry}</span>
          </motion.li>
        ))}
      </ul>

      <Link to={item.link} className="button-sm lh-text-link">
        {item.linkText}
        <ArrowUpRight size={16} weight="bold" />
      </Link>
    </motion.div>
  );
}

function FaqItem({ faq, index, open, onToggle }) {
  const panelId = `lh-faq-panel-${index}`;

  return (
    <motion.div
      variants={rise}
      className={cn("lh-faq-item", open && "lh-faq-open")}
    >
      <button
        type="button"
        className="title-3"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span>{faq.question}</span>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="lh-faq-caret"
        >
          <CaretDown size={16} weight="bold" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <p className="body-6 lh-faq-answer">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Three steps with a rail that fills as you scroll past
function PathSteps() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });

  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });

  return (
    <div className="lh-steps-wrap" ref={ref}>
      <div className="lh-rail" aria-hidden="true">
        <motion.div className="lh-rail-fill" style={{ scaleX }} />
      </div>

      <Stagger className="lh-steps" gap={0.12}>
        {PATH_STEPS.map((step) => (
          <motion.div key={step.n} variants={rise} className="lh-card lh-step">
            <span className="mono heading-5 lh-step-number">{step.n}</span>

            <h3 className="heading-6 lh-card-title">{step.title}</h3>

            <p className="body-6 lh-card-text">{step.description}</p>

            <Link to={step.path} className="button-sm lh-text-link">
              {step.action}
              <ArrowRight size={16} weight="bold" />
            </Link>
          </motion.div>
        ))}
      </Stagger>
    </div>
  );
}

// Interview list with a line that fills as you scroll
function InterviewList() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 55%"],
  });

  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 26 });

  return (
    <div className="lh-interview-right" ref={ref}>
      <div className="lh-timeline" aria-hidden="true">
        <motion.div className="lh-timeline-fill" style={{ scaleY }} />
      </div>

      <Stagger gap={0.1} className="lh-interview-stack">
        {INTERVIEW_TOPICS.map((item) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              variants={rise}
              className="lh-interview-item"
            >
              <span className="lh-icon-tile lh-icon-tile-sm">
                <Icon size={20} weight="duotone" />
              </span>

              <div>
                <h4 className="title-3">{item.title}</h4>
                <p className="body-6 lh-card-text">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </Stagger>
    </div>
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function LearnHome() {
  const [theme, setTheme] = useState(readTheme);
  const [activeFaq, setActiveFaq] = useState(0);

  const isDark = theme === "dark";

  const heroRef = useRef(null);

  // Page scroll progress bar
  const { scrollYProgress: pageProgress } = useScroll();

  const progressScale = useSpring(pageProgress, {
    stiffness: 140,
    damping: 28,
  });

  // Hero parallax
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const panelY = useTransform(heroProgress, [0, 1], [0, 64]);
  const copyY = useTransform(heroProgress, [0, 1], [0, 32]);
  const heroFade = useTransform(heroProgress, [0, 0.9], [1, 0.3]);

  // Soft glow that trails the cursor across the hero
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const glowSX = useSpring(glowX, { stiffness: 50, damping: 20 });
  const glowSY = useSpring(glowY, { stiffness: 50, damping: 20 });

  const onHeroMove = (event) => {
    if (event.pointerType !== "mouse") return;

    const rect = event.currentTarget.getBoundingClientRect();

    glowX.set(event.clientX - rect.left - rect.width * 0.7);
    glowY.set(event.clientY - rect.top - rect.height * 0.35);
  };

  // Navbar controls theme. No local theme switch.
  useEffect(() => {
    const syncTheme = (event) => {
      const nextTheme = event?.detail?.theme;

      if (nextTheme === "dark" || nextTheme === "light") {
        setTheme(nextTheme);
        return;
      }

      setTheme(readTheme());
    };

    const onStorage = (event) => {
      if (!event.key || event.key === THEME_KEY) {
        setTheme(readTheme());
      }
    };

    window.addEventListener(THEME_EVENT, syncTheme);
    window.addEventListener("themechange", syncTheme);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", syncTheme);

    return () => {
      window.removeEventListener(THEME_EVENT, syncTheme);
      window.removeEventListener("themechange", syncTheme);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", syncTheme);
    };
  }, []);

  const structuredData = useMemo(() => {
    const resources = [
      ...LEARNING_AREAS.map((item) => ({
        name: item.title,
        url: `${SITE_URL}${item.path}`,
      })),
      ...FREE_RESOURCES.map((item) => ({
        name: item.title,
        url: `${SITE_URL}${item.path}`,
      })),
    ];

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${PAGE_URL}#page`,
          name: SEO_TITLE,
          description: SEO_DESCRIPTION,
          url: PAGE_URL,
          isPartOf: {
            "@type": "WebSite",
            name: "Target Trek",
            url: SITE_URL,
          },
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Target Trek",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Learn",
              item: PAGE_URL,
            },
          ],
        },
        {
          "@type": "ItemList",
          name: "Target Trek learning resources",
          itemListElement: resources.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: item.url,
          })),
        },
        {
          "@type": "FAQPage",
          mainEntity: FAQS.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: faq.answer },
          })),
        },
      ],
    };
  }, []);

  // Counts come straight from the content above, never invented.
  const stats = [
    { value: FREE_RESOURCES.length, label: "Free guides" },
    { value: FEATURED_BOOKS.length, label: "Flagship books" },
    { value: LEARNING_AREAS.length, label: "Learning paths" },
    { value: INTERVIEW_TAGS.length, label: "Interview tracks" },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <Helmet>
        <title>{SEO_TITLE}</title>

        <meta name="description" content={SEO_DESCRIPTION} />

        <meta
          name="keywords"
          content="system design, software engineering, Java LLD, HLD, GenAI, backend engineering, developer resources, software engineering interview experiences, Target Trek"
        />

        <meta name="robots" content="index,follow,max-image-preview:large" />

        <link rel="canonical" href={PAGE_URL} />
        <link rel="stylesheet" href={FONT_URL} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Target Trek" />
        <meta property="og:title" content={SEO_TITLE} />
        <meta property="og:description" content={SEO_DESCRIPTION} />
        <meta property="og:url" content={PAGE_URL} />

        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={SEO_TITLE} />
        <meta name="twitter:description" content={SEO_DESCRIPTION} />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <style>{`
        .ttLearn {
          --bg: #FAF9F6;
          --surface: #FFFFFF;
          --surface-2: #F3F0EB;
          --text: #131209;
          --muted: #5F5852;
          --subtle: #8A8179;
          --border: #E5DFD7;
          --accent: #EA580C;
          --accent-text: #C2410C;
          --accent-soft: #FFF0E4;
          --accent-line: #FDBA74;
          --btn-bg: #C2410C;
          --btn-bg-hover: #9A3412;
          --btn-text: #FFFFFF;
          --panel: #131209;
          --panel-2: #1F1F1F;
          --panel-3: #272727;
          --panel-border: #313131;
          --panel-text: #FAF8F5;
          --panel-muted: #A8A29E;
          --panel-accent: #FB923C;
          --h-from: #000000;
          --h-to: #666666;
          --shadow: 0 24px 48px rgba(19,18,9,.08);
          --ease: cubic-bezier(0.22,1,0.36,1);

          min-height: 100vh;
          width: 100%;
          overflow-x: clip;
          background: var(--bg);
          color: var(--text);
          font-family: "Manrope", ui-sans-serif, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background-color .3s var(--ease), color .3s var(--ease);
        }

        .ttLearn[data-theme="dark"] {
          --bg: #131209;
          --surface: #181818;
          --surface-2: #1F1F1F;
          --text: #FAF8F5;
          --muted: #B5ACA5;
          --subtle: #8D827A;
          --border: #313131;
          --accent: #FB923C;
          --accent-text: #FB923C;
          --accent-soft: #272727;
          --accent-line: #7C4A22;
          --btn-bg: #FB923C;
          --btn-bg-hover: #FDBA74;
          --btn-text: #131209;
          --panel: #000000;
          --panel-2: #181818;
          --panel-3: #272727;
          --h-from: #FFFFFF;
          --h-to: #9B9B9B;
          --shadow: 0 24px 48px rgba(0,0,0,.4);
          color-scheme: dark;
        }

        .ttLearn *, .ttLearn *::before, .ttLearn *::after { box-sizing: border-box; }
        .ttLearn a { color: inherit; text-decoration: none; }
        .ttLearn button { font: inherit; }
        .ttLearn :where(h1, h2, h3, h4, p, ul) { margin: 0; padding: 0; }
        .ttLearn ul { list-style: none; }
        .ttLearn h1, .ttLearn h2, .ttLearn h3, .ttLearn h4 { text-wrap: balance; letter-spacing: -.02em; }
        .ttLearn p { text-wrap: pretty; }
        .ttLearn a:focus-visible, .ttLearn button:focus-visible {
          outline: 2px solid var(--accent); outline-offset: 2px;
        }

        /* ---------- text styles ---------- */
        .ttLearn .mono { font-family: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, monospace; font-variant-numeric: tabular-nums; letter-spacing: 0; }
        .ttLearn .heading-1 { font-size: 30px; line-height: 36px; font-weight: 600; }
        .ttLearn .heading-3 { font-size: 30px; line-height: 36px; font-weight: 600; }
        .ttLearn .heading-5 { font-size: 24px; line-height: 32px; font-weight: 600; }
        .ttLearn .heading-6 { font-size: 20px; line-height: 28px; font-weight: 600; }
        .ttLearn .title-1 { font-size: 20px; line-height: 28px; font-weight: 500; }
        .ttLearn .title-3 { font-size: 16px; line-height: 24px; font-weight: 500; }
        .ttLearn .body-3 { font-size: 16px; line-height: 24px; font-weight: 400; }
        .ttLearn .body-4 { font-size: 14px; line-height: 20px; font-weight: 600; }
        .ttLearn .body-6 { font-size: 14px; line-height: 20px; font-weight: 400; }
        .ttLearn .button-lg { font-size: 18px; line-height: 28px; font-weight: 600; }
        .ttLearn .button-md { font-size: 16px; line-height: 24px; font-weight: 600; }
        .ttLearn .button-sm { font-size: 14px; line-height: 20px; font-weight: 600; }
        .ttLearn .caption-3 { font-size: 12px; line-height: 16px; font-weight: 600; }
        .ttLearn .caption-4 { font-size: 12px; line-height: 16px; font-weight: 500; }
        @media (min-width: 480px) { .ttLearn .heading-1 { font-size: 36px; line-height: 40px; } }
        @media (min-width: 768px) {
          .ttLearn .heading-1 { font-size: 48px; line-height: 48px; }
          .ttLearn .heading-3 { font-size: 36px; line-height: 40px; }
        }
        @media (min-width: 1280px) { .ttLearn .heading-1 { font-size: 60px; line-height: 60px; } }

        /* ---------- layout ---------- */
        .lh-shell { width: min(1200px, calc(100% - 32px)); margin: 0 auto; }
        .lh-section { padding: 64px 0; position: relative; }
        @media (min-width: 768px) {
          .lh-shell { width: min(1200px, calc(100% - 48px)); }
          .lh-section { padding: 96px 0; }
        }
        .lh-section-alt { background: var(--surface-2); }
        .lh-cell { height: 100%; }

        .lh-progress {
          position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 9999;
          transform-origin: 0 50%; background: #F97316;
        }

        .lh-gridsvg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }

        /* ---------- headings ---------- */
        .lh-heading { display: flex; flex-direction: column; gap: 16px; }
        @media (min-width: 768px) {
          .lh-heading { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 32px; }
        }
        .lh-heading-main { max-width: 680px; }
        .lh-eyebrow {
          display: flex; align-items: center; gap: 12px;
          color: var(--accent-text); text-transform: uppercase; letter-spacing: .12em;
        }
        .lh-eyebrow-index { color: var(--subtle); }
        .lh-eyebrow-line { display: block; width: 24px; height: 2px; background: var(--accent); transform-origin: 0 50%; }
        .lh-section-title { margin-top: 16px; color: var(--text); }
        .lh-section-description { margin-top: 16px; color: var(--muted); }

        .lh-text-link {
          display: inline-flex; align-items: center; gap: 8px; flex-shrink: 0;
          color: var(--accent-text) !important;
        }
        .lh-text-link svg { transition: transform .5s var(--ease); }
        .lh-text-link:hover svg { transform: translate(4px, 0); }

        /* ---------- buttons ---------- */
        .lh-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 8px 12px; border-radius: 8px; border: 1px solid transparent;
          transition: background-color .3s var(--ease), border-color .3s var(--ease), color .3s var(--ease), transform .5s var(--ease);
        }
        .lh-btn svg { transition: transform .5s var(--ease); }
        .lh-btn:hover svg { transform: translate(2px, -2px); }
        .lh-btn:active { transform: scale(.98); }
        .lh-btn-primary { background: var(--btn-bg); color: var(--btn-text) !important; }
        .lh-btn-primary:hover { background: var(--btn-bg-hover); }
        .lh-btn-outline { background: var(--surface); border-color: var(--border); color: var(--text) !important; }
        .lh-btn-outline:hover { border-color: var(--accent); color: var(--accent-text) !important; }

        /* ---------- chips ---------- */
        .lh-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .lh-chip {
          display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 6px;
          background: var(--surface-2); border: 1px solid var(--border); color: var(--muted);
          transition: border-color .3s var(--ease), color .3s var(--ease);
        }

        /* ---------- cards ---------- */
        .lh-card {
          position: relative; display: flex; flex-direction: column; height: 100%; min-width: 0;
          padding: 24px; border-radius: 16px;
          background: var(--surface); border: 1px solid var(--border);
          transition: transform .5s var(--ease), border-color .3s var(--ease), box-shadow .5s var(--ease);
        }
        /* corner brackets that lock on when hovered */
        .lh-card::before, .lh-card::after {
          content: ""; position: absolute; width: 12px; height: 12px; pointer-events: none;
          border: 0 solid var(--accent); opacity: 0;
          transition: opacity .3s var(--ease), transform .5s var(--ease);
        }
        .lh-card::before { top: 8px; left: 8px; border-top-width: 2px; border-left-width: 2px; border-top-left-radius: 8px; transform: translate(6px, 6px); }
        .lh-card::after { right: 8px; bottom: 8px; border-right-width: 2px; border-bottom-width: 2px; border-bottom-right-radius: 8px; transform: translate(-6px, -6px); }
        .lh-card:hover { border-color: var(--accent-line); box-shadow: var(--shadow); }
        .lh-card:hover::before, .lh-card:hover::after,
        .lh-card-link:focus-visible::before, .lh-card-link:focus-visible::after { opacity: 1; transform: translate(0, 0); }
        .lh-card-link:hover { transform: translateY(-4px); }
        .lh-card-link:active { transform: translateY(0) scale(.98); }
        .lh-card-link:hover .lh-chip { border-color: var(--accent-line); }

        .lh-card-top { display: flex; align-items: flex-start; justify-content: space-between; }
        .lh-icon-tile {
          display: grid; place-items: center; width: 48px; height: 48px; flex-shrink: 0;
          border-radius: 12px; background: var(--accent-soft); color: var(--accent-text);
          transition: transform .5s var(--ease), background-color .3s var(--ease), color .3s var(--ease);
        }
        .lh-icon-tile-sm { width: 40px; height: 40px; border-radius: 8px; }
        .lh-card:hover .lh-icon-tile, .lh-interview-item:hover .lh-icon-tile {
          transform: translateY(-2px) rotate(-6deg); background: var(--btn-bg); color: var(--btn-text);
        }
        .lh-card-number { color: var(--subtle); transition: color .3s var(--ease); }
        .lh-card:hover .lh-card-number { color: var(--accent-text); }
        .lh-kicker { margin-top: 24px; color: var(--accent-text); text-transform: uppercase; letter-spacing: .1em; }
        .lh-card-title { margin-top: 8px; color: var(--text); }
        .lh-card-text { margin-top: 8px; color: var(--muted); }
        .lh-card-link .lh-card-text { flex: 1; }
        .lh-card-action {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          margin-top: 24px; color: var(--accent-text);
        }
        .lh-arrow {
          display: grid; place-items: center; width: 32px; height: 32px; border-radius: 9999px;
          background: var(--accent-soft);
          transition: transform .5s var(--ease), background-color .3s var(--ease), color .3s var(--ease);
        }
        .lh-card:hover .lh-arrow { transform: rotate(45deg); background: var(--btn-bg); color: var(--btn-text); }

        .lh-grid-4, .lh-grid-3, .lh-grid-2 { display: grid; gap: 16px; margin-top: 48px; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 640px) {
          .lh-grid-4, .lh-grid-3 { grid-template-columns: repeat(2,minmax(0,1fr)); }
        }
        @media (min-width: 1080px) {
          .lh-grid-4 { grid-template-columns: repeat(4,minmax(0,1fr)); }
          .lh-grid-3 { grid-template-columns: repeat(3,minmax(0,1fr)); }
          .lh-grid-2 { grid-template-columns: repeat(2,minmax(0,1fr)); }
        }

        .lh-checks { display: grid; gap: 8px; margin-top: 24px; }
        .lh-checks li { display: flex; align-items: flex-start; gap: 8px; color: var(--muted); }
        .lh-checks svg { flex-shrink: 0; margin-top: 2px; color: var(--accent-text); }

        /* ---------- HERO ---------- */
        .lh-hero { position: relative; padding: 128px 0 64px; overflow: hidden; background: var(--bg); }
        @media (min-width: 768px) { .lh-hero { padding: 144px 0 96px; } }
        .lh-hero-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
        .lh-hero-bg .lh-gridsvg {
          color: var(--border);
          -webkit-mask-image: radial-gradient(ellipse at 70% 35%, #000 0%, transparent 70%);
          mask-image: radial-gradient(ellipse at 70% 35%, #000 0%, transparent 70%);
        }
        .lh-glow {
          position: absolute; left: 70%; top: 35%; width: 480px; height: 480px;
          margin: -240px 0 0 -240px; border-radius: 9999px;
          background: #F97316; opacity: .14; filter: blur(96px);
        }
        .lh-hero-grid { position: relative; display: grid; gap: 64px; align-items: center; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 1080px) { .lh-hero-grid { grid-template-columns: minmax(0,1.2fr) minmax(0,.8fr); gap: 48px; } }

        .lh-now {
          display: inline-flex; align-items: center; gap: 8px; flex-wrap: wrap;
          padding: 4px 12px; border-radius: 9999px;
          background: var(--surface); border: 1px solid var(--border); color: var(--muted);
        }
        .lh-ping { position: relative; width: 8px; height: 8px; border-radius: 9999px; background: #16A34A; }
        .lh-ping::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit; background: #16A34A;
          animation: lh-ping 2s var(--ease) infinite;
        }
        .lh-rotator { display: inline-block; overflow: hidden; color: var(--accent-text); }
        .lh-rotator span { display: inline-block; }

        .lh-hero-title { max-width: 680px; margin-top: 24px; letter-spacing: -.03em; }
        .lh-line-mask { display: block; overflow: hidden; padding-bottom: .14em; margin-bottom: -.14em; }
        .lh-line {
          display: block; width: fit-content;
          background-image: linear-gradient(90deg, var(--h-from), var(--h-to));
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
        }
        .lh-hero-sub { max-width: 680px; margin-top: 24px; color: var(--muted); }
        .lh-hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; margin-top: 32px; }

        .lh-stats { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 24px; margin-top: 48px; max-width: 680px; }
        @media (min-width: 640px) { .lh-stats { grid-template-columns: repeat(4,minmax(0,1fr)); } }
        .lh-stat strong { display: block; color: var(--text); }
        .lh-stat span { display: block; margin-top: 4px; color: var(--muted); }

        .lh-hero-visual { position: relative; width: 100%; max-width: 480px; margin: 0 auto; }
        .lh-panel {
          position: relative; padding: 16px; border-radius: 24px; overflow: hidden;
          background: var(--panel); border: 1px solid var(--panel-border); color: var(--panel-text);
          box-shadow: 0 32px 64px rgba(19,18,9,.24);
        }
        .lh-panel-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 0 8px 12px; color: var(--panel-muted); }
        .lh-panel-live { display: inline-flex; align-items: center; gap: 8px; color: var(--panel-accent); }
        .lh-panel-screen { position: relative; border-radius: 8px; overflow: hidden; background: var(--panel-2); padding: 16px 8px; }
        .lh-panel-screen .lh-gridsvg { color: var(--panel-border); opacity: .6; }
        .lh-panel-foot { padding: 12px 8px 0; color: var(--panel-muted); }
        .lh-scan {
          position: absolute; left: 0; right: 0; top: 0; height: 64px; pointer-events: none;
          background: var(--panel-accent); opacity: .05;
          animation: lh-scan 6s cubic-bezier(.45,0,.55,1) infinite;
        }

        .lh-flow { position: relative; display: block; width: 100%; height: auto; font-family: "Geist Mono", ui-monospace, monospace; }
        .lh-flow-edge { stroke: #4A4038; stroke-width: 1.5; stroke-dasharray: 4 6; animation: lh-dash 1.2s linear infinite; }
        .lh-flow-box { fill: #1F1F1F; stroke: #3D3D3D; stroke-width: 1; transition: fill .3s var(--ease), stroke .3s var(--ease); }
        .lh-flow-link .lh-flow-box { stroke: #9A5A2A; }
        .lh-flow-link { cursor: pointer; outline: none; }
        .lh-flow-link:hover .lh-flow-box, .lh-flow-link:focus-visible .lh-flow-box { fill: #313131; stroke: #FB923C; stroke-width: 2; }
        .lh-flow-label { fill: #FAF8F5; font-size: 12px; font-weight: 500; }
        .lh-flow-link .lh-flow-label { transition: fill .3s var(--ease); }
        .lh-flow-link:hover .lh-flow-label, .lh-flow-link:focus-visible .lh-flow-label { fill: #FDBA74; }
        .lh-flow-note { fill: #8D827A; font-size: 11px; }
        .lh-flow-svc { fill: #181818; stroke: #313131; stroke-width: 1; }
        .lh-flow-packet { fill: #FB923C; }
        .lh-flow-halo { fill: #FB923C; opacity: .22; }

        /* ---------- MARQUEE ---------- */
        .lh-marquee {
          overflow: hidden; padding: 16px 0; background: var(--surface-2);
          -webkit-mask-image: linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
          mask-image: linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
        }
        .lh-marquee-track { display: flex; width: max-content; animation: lh-marquee 40s linear infinite; }
        .lh-marquee:hover .lh-marquee-track { animation-play-state: paused; }
        .lh-marquee-item { display: inline-flex; align-items: center; gap: 24px; padding-right: 24px; white-space: nowrap; color: var(--muted); text-transform: uppercase; letter-spacing: .08em; }
        .lh-marquee-item i { width: 4px; height: 4px; border-radius: 9999px; background: var(--accent); }

        /* ---------- TAGLINE ---------- */
        .lh-tagline-section { padding: 96px 0; }
        @media (min-width: 768px) { .lh-tagline-section { padding: 160px 0; } }
        .lh-tagline { max-width: 680px; margin: 0 auto; text-align: center; color: var(--text); letter-spacing: -.02em; text-wrap: balance; }
        .lh-tagline-word { opacity: .3; transition: opacity .5s var(--ease); }
        .lh-tagline-word.is-on { opacity: 1; }

        /* ---------- BOOKS ---------- */
        .lh-book { padding: 8px; flex-direction: column; border-radius: 24px; }
        .lh-book-content { display: flex; flex-direction: column; min-width: 0; padding: 16px; flex: 1; }
        @media (min-width: 640px) { .lh-book { flex-direction: row; } .lh-book-content { padding: 24px; } }
        .lh-book-meta { display: flex; align-items: center; gap: 12px; }
        .lh-book-meta .lh-kicker { margin-top: 0; }
        .lh-book-number { display: grid; place-items: center; width: 32px; height: 32px; border-radius: 8px; background: var(--accent-soft); color: var(--accent-text); }
        .lh-book-title { margin-top: 16px; color: var(--text); }
        .lh-book-title span { color: var(--accent-text); }
        .lh-book-subtitle { margin-top: 8px; color: var(--text); }
        .lh-book-content .lh-btn { align-self: flex-start; margin-top: 24px; }
        .lh-book-content .lh-checks { margin-bottom: auto; }

        .lh-book-art {
          position: relative; display: grid; place-items: center; overflow: hidden;
          min-height: 320px; padding: 24px 16px; border-radius: 16px;
          background: var(--panel); perspective: 900px;
        }
        @media (min-width: 640px) { .lh-book-art { width: 40%; flex-shrink: 0; } }
        .lh-book-art .lh-gridsvg { color: var(--panel-border); opacity: .7; }
        .lh-orbit { position: absolute; width: 288px; height: 288px; border-radius: 9999px; border: 1px dashed rgba(251,146,60,.28); animation: lh-spin 30s linear infinite; }
        .lh-orbit::after { content: ""; position: absolute; top: -4px; left: 50%; width: 8px; height: 8px; border-radius: 9999px; background: #FB923C; }
        .lh-orbit-two { width: 208px; height: 208px; animation-direction: reverse; animation-duration: 22s; }
        .lh-book-float { position: relative; z-index: 2; width: min(168px, 100%); }
        .lh-cover {
          display: flex; flex-direction: column; width: 100%; aspect-ratio: 2 / 3; padding: 16px;
          border-radius: 4px 8px 8px 4px; color: #FAF8F5;
          background: #1F1F1F; border: 1px solid #3D3D3D;
          box-shadow: 16px 24px 40px rgba(0,0,0,.5), inset 4px 0 0 #FB923C;
          transform: rotateY(-14deg) rotateZ(-3deg);
          transition: transform .5s var(--ease);
        }
        .lh-book:hover .lh-cover { transform: rotateY(-24deg) rotateZ(-5deg) scale(1.06); }
        .lh-cover-top { display: flex; align-items: center; justify-content: space-between; font-size: 12px; line-height: 16px; transform: scale(.75); transform-origin: 0 50%; width: 133%; color: #FDBA74; letter-spacing: .12em; }
        .lh-cover-visual { flex: 1; display: grid; place-items: center; color: #FDBA74; }
        .lh-cover-visual svg { width: 100%; height: auto; }
        .lh-cover-bottom { display: flex; flex-direction: column; gap: 4px; }
        .lh-cover-heading { font-size: 30px; line-height: 36px; font-weight: 700; letter-spacing: -.03em; }
        .lh-cover-line { font-size: 12px; line-height: 16px; transform: scale(.75); transform-origin: 0 50%; width: 133%; color: #FDBA74; text-transform: uppercase; letter-spacing: .08em; }
        .lh-art-tag {
          position: absolute; z-index: 3; right: 12px; bottom: 12px;
          display: inline-flex; align-items: center; gap: 8px; padding: 8px 12px; border-radius: 8px;
          background: #1F1F1F; border: 1px solid #3D3D3D; color: #FDBA74;
          animation: lh-float 5s cubic-bezier(.45,0,.55,1) infinite;
        }
        .lh-pulse-dot { animation: lh-pulse 2s cubic-bezier(.45,0,.55,1) infinite; transform-origin: center; transform-box: fill-box; }

        /* ---------- STEPS ---------- */
        .lh-steps-wrap { margin-top: 48px; }
        .lh-rail { height: 2px; border-radius: 2px; background: var(--border); overflow: hidden; }
        .lh-rail-fill { width: 100%; height: 100%; background: var(--accent); transform-origin: 0 50%; }
        .lh-steps { display: grid; gap: 16px; margin-top: 24px; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 880px) { .lh-steps { grid-template-columns: repeat(3,minmax(0,1fr)); } }
        .lh-step-number { color: var(--accent-text); }
        .lh-step .lh-card-title { margin-top: 16px; }
        .lh-step .lh-card-text { flex: 1; }
        .lh-step .lh-text-link { margin-top: 24px; align-self: flex-start; }

        /* ---------- INTERVIEW ---------- */
        .lh-interview {
          display: grid; grid-template-columns: minmax(0,1fr); gap: 8px; margin-top: 48px; padding: 8px;
          border-radius: 24px; background: var(--surface); border: 1px solid var(--border);
        }
        @media (min-width: 880px) { .lh-interview { grid-template-columns: minmax(0,1.05fr) minmax(0,.95fr); } }
        .lh-interview-left { padding: 16px; }
        @media (min-width: 640px) { .lh-interview-left { padding: 32px; } }
        .lh-interview-left h3 { color: var(--text); }
        .lh-interview-left > p { margin-top: 16px; color: var(--muted); max-width: 520px; }
        .lh-tags { display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 32px; }
        .lh-tags span {
          padding: 4px 12px; border-radius: 9999px;
          border: 1px solid var(--accent-line); background: var(--accent-soft); color: var(--accent-text);
          transition: transform .5s var(--ease);
        }
        .lh-tags span:hover { transform: translateY(-4px); }
        .lh-interview-right { position: relative; padding: 24px 16px 24px 40px; border-radius: 16px; background: var(--surface-2); }
        @media (min-width: 640px) { .lh-interview-right { padding: 32px 32px 32px 56px; } }
        .lh-timeline { position: absolute; left: 19px; top: 40px; bottom: 40px; width: 2px; border-radius: 2px; background: var(--border); overflow: hidden; }
        @media (min-width: 640px) { .lh-timeline { left: 27px; } }
        .lh-timeline-fill { width: 100%; height: 100%; transform-origin: 50% 0; background: var(--accent); }
        .lh-interview-stack { display: grid; gap: 12px; }
        .lh-interview-item {
          display: flex; gap: 16px; align-items: flex-start; padding: 16px; border-radius: 12px;
          background: var(--surface); border: 1px solid var(--border);
          transition: transform .5s var(--ease), border-color .3s var(--ease);
        }
        .lh-interview-item:hover { transform: translateX(8px); border-color: var(--accent-line); }
        .lh-interview-item h4 { color: var(--text); }
        .lh-interview-item .lh-card-text { margin-top: 4px; }

        /* ---------- COMPARE ---------- */
        .lh-compare .lh-card-title { margin-top: 24px; }
        .lh-compare .lh-checks { margin-bottom: 24px; }
        .lh-compare .lh-text-link { margin-top: auto; align-self: flex-start; }
        .lh-compare-featured { border-color: var(--accent-line); }

        /* ---------- BENEFITS ---------- */
        .lh-benefit .lh-card-title { margin-top: 24px; }

        /* ---------- FAQ ---------- */
        .lh-faq { display: grid; gap: 32px; align-items: start; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 1080px) {
          .lh-faq { grid-template-columns: minmax(0,.8fr) minmax(0,1.2fr); gap: 64px; }
          .lh-faq > .lh-heading { position: sticky; top: 96px; }
        }
        .lh-faq-list { display: grid; gap: 12px; }
        .lh-faq-item {
          border-radius: 12px; overflow: hidden; background: var(--surface); border: 1px solid var(--border);
          transition: border-color .3s var(--ease);
        }
        .lh-faq-item:hover, .lh-faq-open { border-color: var(--accent-line); }
        .lh-faq-item button {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 16px 24px; border: 0; background: transparent; text-align: left; cursor: pointer; color: var(--text);
        }
        .lh-faq-item button:focus-visible { outline-offset: -2px; border-radius: 12px; }
        .lh-faq-caret { display: grid; place-items: center; flex-shrink: 0; color: var(--accent-text); }
        .lh-faq-answer { padding: 0 24px 24px; color: var(--muted); }

        /* ---------- FINAL CTA ---------- */
        .lh-cta {
          position: relative; overflow: hidden; isolation: isolate;
          display: flex; flex-direction: column; align-items: flex-start; gap: 32px;
          padding: 40px 24px; border-radius: 24px;
          background: var(--panel); border: 1px solid var(--panel-border); color: var(--panel-text);
        }
        @media (min-width: 880px) { .lh-cta { flex-direction: row; align-items: center; justify-content: space-between; padding: 64px; } }
        .lh-cta .lh-gridsvg { z-index: -1; color: var(--panel-border); opacity: .7; }
        .lh-cta-ring { position: absolute; z-index: -1; border-radius: 9999px; pointer-events: none; border: 1px dashed rgba(251,146,60,.35); }
        .lh-cta-ring-1 { width: 416px; height: 416px; right: -128px; top: -192px; animation: lh-spin 34s linear infinite; }
        .lh-cta-ring-2 { width: 256px; height: 256px; left: -96px; bottom: -128px; animation: lh-spin 26s linear infinite reverse; }
        .lh-cta h2 { max-width: 560px; color: var(--panel-text); }
        .lh-cta p { max-width: 520px; margin-top: 16px; color: var(--panel-muted); }
        .lh-cta-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 24px; flex-shrink: 0; }
        .lh-cta .lh-btn-primary { background: #FB923C; color: #131209 !important; }
        .lh-cta .lh-btn-primary:hover { background: #FDBA74; }
        .lh-cta .lh-text-link { color: #FDBA74 !important; }

        /* ---------- KEYFRAMES ---------- */
        @keyframes lh-spin { to { transform: rotate(360deg); } }
        @keyframes lh-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes lh-ping { 0% { transform: scale(1); opacity: .7; } 80%,100% { transform: scale(3); opacity: 0; } }
        @keyframes lh-marquee { to { transform: translateX(-50%); } }
        @keyframes lh-dash { to { stroke-dashoffset: -20; } }
        @keyframes lh-scan { 0% { transform: translateY(-64px); } 100% { transform: translateY(560px); } }
        @keyframes lh-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.8); opacity: .5; } }

        @media (prefers-reduced-motion: reduce) {
          .ttLearn *, .ttLearn *::before, .ttLearn *::after {
            animation: none !important;
            transition-property: opacity, color, background-color, border-color !important;
          }
          .lh-flow-packets, .lh-scan { display: none; }
        }
      `}</style>

      <motion.div
        className="lh-progress"
        style={{ scaleX: progressScale }}
        aria-hidden="true"
      />

      <main className="ttLearn" data-theme={isDark ? "dark" : "light"}>
        {/* ================================================= */}
        {/* HERO                                              */}
        {/* ================================================= */}

        <section className="lh-hero" ref={heroRef} onPointerMove={onHeroMove}>
          <div className="lh-hero-bg" aria-hidden="true">
            <GridPattern id="lh-grid-hero" />
            <motion.div className="lh-glow" style={{ x: glowSX, y: glowSY }} />
          </div>

          <div className="lh-shell lh-hero-grid">
            <motion.div style={{ y: copyY, opacity: heroFade }}>
              <motion.div
                className="caption-3 lh-now"
                aria-hidden="true"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: EASE }}
              >
                <span className="lh-ping" />
                Now exploring
                <RotatingWord />
              </motion.div>

              <h1 className="heading-1 lh-hero-title">
                <LineReveal delay={0.1}>Learn the concepts.</LineReveal>
                <LineReveal delay={0.22}>Build the intuition.</LineReveal>
              </h1>

              <motion.p
                className="body-3 lh-hero-sub"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
              >
                A focused learning space for software engineers. Study system
                design, Java LLD and GenAI through free guides, complete books
                and real interview experiences that show how systems actually
                work.
              </motion.p>

              <motion.div
                className="lh-hero-actions"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
              >
                <MotionLink
                  to="/books"
                  className="button-lg lh-btn lh-btn-primary"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  Browse the books
                  <ArrowUpRight size={18} weight="bold" />
                </MotionLink>

                <Link to="/resources/hld/cache" className="button-md lh-text-link">
                  Start with the free guides
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </motion.div>

              <motion.div
                className="lh-stats"
                variants={stagger(0.08, 0.75)}
                initial="hidden"
                animate="show"
              >
                {stats.map((stat) => (
                  <motion.div key={stat.label} variants={rise} className="lh-stat">
                    <strong className="mono heading-5">
                      <Counter to={stat.value} />
                    </strong>
                    <span className="caption-4">{stat.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="lh-hero-visual"
              style={{ y: panelY }}
              initial={{ opacity: 0, y: 48 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
            >
              <Tilt>
                <div className="lh-panel">
                  <div className="mono caption-4 lh-panel-bar">
                    <span>request path</span>
                    <span className="lh-panel-live">
                      <span className="lh-ping" />
                      live
                    </span>
                  </div>

                  <div className="lh-panel-screen">
                    <GridPattern id="lh-grid-panel" size={24} />
                    <div className="lh-scan" aria-hidden="true" />
                    <FlowDiagram />
                  </div>

                  <p className="caption-4 lh-panel-foot">
                    Every highlighted node opens a free guide.
                  </p>
                </div>
              </Tilt>
            </motion.div>
          </div>
        </section>

        {/* ================================================= */}
        {/* TOPIC MARQUEE                                     */}
        {/* ================================================= */}

        <div className="lh-marquee" aria-hidden="true">
          <div className="lh-marquee-track">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
              <span className="mono caption-4 lh-marquee-item" key={`${item}-${index}`}>
                {item}
                <i />
              </span>
            ))}
          </div>
        </div>

        {/* ================================================= */}
        {/* EXPLORE LEARNING AREAS                            */}
        {/* ================================================= */}

        <section className="lh-section">
          <div className="lh-shell">
            <SectionHeading
              index="01"
              eyebrow="Explore Target Trek"
              title="Everything you need to keep learning."
              description="Choose your path, whether you are revising a single concept, preparing for an interview or studying a complete software engineering topic."
            />

            <Stagger className="lh-grid-4">
              {LEARNING_AREAS.map((item) => (
                <LearningAreaCard key={item.id} item={item} />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* TAGLINE REVEAL                                    */}
        {/* ================================================= */}

        <section className="lh-tagline-section lh-section-alt">
          <div className="lh-shell">
            <TaglineReveal text={TAGLINE} />
          </div>
        </section>

        {/* ================================================= */}
        {/* FEATURED HLD / LLD BOOKS                          */}
        {/* ================================================= */}

        <section className="lh-section">
          <div className="lh-shell">
            <SectionHeading
              index="02"
              eyebrow="Deeper learning"
              title="Technical books that connect the dots."
              description="Go beyond memorizing concepts. Learn to explain design decisions, understand tradeoffs and prepare for real software engineering discussions."
              action="View all books"
              actionPath="/books"
            />

            <Stagger className="lh-grid-2" gap={0.16}>
              {FEATURED_BOOKS.map((book, index) => (
                <FeaturedBookCard key={book.path} book={book} index={index} />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* FREE SYSTEM DESIGN RESOURCES                      */}
        {/* ================================================= */}

        <section className="lh-section lh-section-alt">
          <div className="lh-shell">
            <SectionHeading
              index="03"
              eyebrow="Free engineering resources"
              title="Master the building blocks of scalable systems."
              description="Focused guides that explain the technologies, architecture decisions and tradeoffs behind modern backend systems."
            />

            <Stagger className="lh-grid-3">
              {FREE_RESOURCES.map((resource) => (
                <ResourceCard key={resource.path} resource={resource} />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* HOW IT WORKS                                      */}
        {/* ================================================= */}

        <section className="lh-section">
          <div className="lh-shell">
            <SectionHeading
              index="04"
              eyebrow="How it works"
              title="From concepts to confidence in three steps."
              description="Start small with a single guide, go deeper with a book, then test yourself against real interview rounds."
            />

            <PathSteps />
          </div>
        </section>

        {/* ================================================= */}
        {/* INTERVIEW EXPERIENCE                              */}
        {/* ================================================= */}

        <section className="lh-section lh-section-alt">
          <div className="lh-shell">
            <SectionHeading
              index="05"
              eyebrow="Interview preparation"
              title="Prepare beyond coding questions."
              description="Technical interviews test how you reason about algorithms, software design, engineering tradeoffs and real systems."
            />

            <Reveal className="lh-interview">
              <div className="lh-interview-left">
                <h3 className="heading-5">
                  Understand the rounds.
                  <br />
                  Prepare with direction.
                </h3>

                <p className="body-3">
                  Explore interview experiences covering DSA, backend
                  engineering, Java, system design, AI engineering and
                  managerial discussions. Use them to understand what each
                  round expects and to plan your preparation.
                </p>

                <Stagger className="lh-tags" gap={0.06}>
                  {INTERVIEW_TAGS.map((item) => (
                    <motion.span key={item} variants={rise} className="mono caption-3">
                      {item}
                    </motion.span>
                  ))}
                </Stagger>

                <Link to="/interviews" className="button-md lh-btn lh-btn-outline">
                  Explore interviews
                  <ArrowUpRight size={16} weight="bold" />
                </Link>
              </div>

              <InterviewList />
            </Reveal>
          </div>
        </section>

        {/* ================================================= */}
        {/* FREE VS STRUCTURED                                */}
        {/* ================================================= */}

        <section className="lh-section">
          <div className="lh-shell">
            <SectionHeading
              index="06"
              eyebrow="How to learn"
              title="Start small. Go deeper when you are ready."
              description="Free guides and structured books complement each other. Choose based on the depth of understanding you need."
            />

            <Stagger className="lh-grid-2" gap={0.16}>
              {COMPARE.map((item) => (
                <CompareCard key={item.title} item={item} />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* WHY TARGET TREK                                   */}
        {/* ================================================= */}

        <section className="lh-section lh-section-alt">
          <div className="lh-shell">
            <SectionHeading
              index="07"
              eyebrow="Why Target Trek"
              title="Learning with an engineering mindset."
              description="Technical preparation should help you reason about systems, understand implementation details and communicate engineering decisions."
            />

            <Stagger className="lh-grid-4" gap={0.1}>
              {BENEFITS.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.article
                    key={item.title}
                    variants={rise}
                    className="lh-card lh-benefit"
                  >
                    <span className="lh-icon-tile">
                      <Icon size={24} weight="duotone" />
                    </span>

                    <h3 className="title-1 lh-card-title">{item.title}</h3>

                    <p className="body-6 lh-card-text">{item.description}</p>
                  </motion.article>
                );
              })}
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* FAQ                                               */}
        {/* ================================================= */}

        <section className="lh-section">
          <div className="lh-shell lh-faq">
            <SectionHeading
              index="08"
              eyebrow="Help and guidance"
              title="Questions about learning?"
              description="A few answers to help you choose the right place to start."
            />

            <Stagger className="lh-faq-list" gap={0.08}>
              {FAQS.map((faq, index) => (
                <FaqItem
                  key={faq.question}
                  faq={faq}
                  index={index}
                  open={activeFaq === index}
                  onToggle={() =>
                    setActiveFaq(activeFaq === index ? null : index)
                  }
                />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* FINAL CTA                                         */}
        {/* ================================================= */}

        <section className="lh-section" style={{ paddingTop: 0 }}>
          <div className="lh-shell">
            <motion.div
              className="lh-cta"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <GridPattern id="lh-grid-cta" />
              <span className="lh-cta-ring lh-cta-ring-1" aria-hidden="true" />
              <span className="lh-cta-ring lh-cta-ring-2" aria-hidden="true" />

              <div>
                <h2 className="heading-3">
                  Your next engineering breakthrough starts with one concept.
                </h2>

                <p className="body-3">
                  Start with a free guide, go deep with a technical book and
                  learn from real interview experiences, all on Target Trek.
                </p>
              </div>

              <div className="lh-cta-actions">
                <MotionLink
                  to="/books"
                  className="button-lg lh-btn lh-btn-primary"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  Browse the books
                  <ArrowUpRight size={18} weight="bold" />
                </MotionLink>

                <Link to="/resources/hld/cache" className="button-md lh-text-link">
                  Start with the free guides
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}
