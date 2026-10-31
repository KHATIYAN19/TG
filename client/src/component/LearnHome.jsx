import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Code2,
  Database,
  FileCode2,
  FileText,
  GraduationCap,
  Layers3,
  Network,
  RadioTower,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

// =====================================================
// CONFIGURATION
// =====================================================

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/learn`;

const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const SEO_TITLE =
  "Learn Software Engineering, System Design & GenAI | Target Trek";

const SEO_DESCRIPTION =
  "Explore software engineering resources at Target Trek. Learn System Design HLD, Java LLD, backend architecture, GenAI, and technical interview preparation through books, free resources, and interview experiences.";

const EASE = [0.22, 1, 0.36, 1];

// =====================================================
// THEME
// =====================================================

const readTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return window.localStorage.getItem(THEME_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

// =====================================================
// CONTENT (routes unchanged)
// =====================================================

const ROTATING_WORDS = [
  "System Design",
  "Java LLD",
  "Backend Engineering",
  "GenAI & Agents",
  "Interview Prep",
];

const LEARNING_AREAS = [
  {
    id: "books",
    number: "01",
    eyebrow: "GUIDED LEARNING",
    title: "Technical Books",
    description:
      "Comprehensive engineering handbooks that take you from fundamentals to interview-level architecture and implementation.",
    path: "/books",
    action: "Explore books",
    icon: BookOpen,
    topics: ["System Design HLD", "Java LLD", "GenAI & Agents"],
  },
  {
    id: "interviews",
    number: "02",
    eyebrow: "CAREER PREPARATION",
    title: "Interview Experiences",
    description:
      "Explore interview journeys, technical rounds, DSA, low-level design, high-level design, and engineering discussions.",
    path: "/interviews",
    action: "Explore interviews",
    icon: BriefcaseBusiness,
    topics: ["DSA & Coding", "System Design", "Backend & GenAI"],
  },
  {
    id: "resources",
    number: "03",
    eyebrow: "LEARN FOR FREE",
    title: "Engineering Resources",
    description:
      "Focused learning resources on system architecture, scalability, databases, distributed systems, and backend fundamentals.",
    path: "/resources/hld/cache",
    action: "Start learning",
    icon: GraduationCap,
    topics: ["Architecture", "Databases", "Distributed Systems"],
  },
  {
    id: "blogs",
    number: "04",
    eyebrow: "ARTICLES & INSIGHTS",
    title: "Engineering Blogs",
    description:
      "Understand complex engineering ideas through practical explanations, examples, concepts, and technical articles.",
    path: "/blogs",
    action: "Read articles",
    icon: FileText,
    topics: ["Development", "Engineering", "Interview Prep"],
  },
];

const FEATURED_BOOKS = [
  {
    number: "01",
    type: "HIGH-LEVEL DESIGN",
    title: "Mastering System Design",
    highlight: "HLD",
    subtitle: "Think in systems. Design for scale.",
    description:
      "Learn to approach system design interviews with clear requirements, APIs, data modeling, scalable architectures, caching, distributed systems, failure handling, and trade-offs.",
    path: "/book/system-design/hld",
    icon: Network,
    topics: [
      "Architecture",
      "Databases",
      "Redis",
      "Kafka",
      "Scalability",
      "Trade-offs",
    ],
    benefits: [
      "Understand production-style architectures",
      "Practice structured system design discussions",
      "Prepare for HLD interviews",
    ],
  },
  {
    number: "02",
    type: "LOW-LEVEL DESIGN",
    title: "Mastering System Design",
    highlight: "LLD",
    subtitle: "Write better Java. Design better software.",
    description:
      "Master object-oriented design in Java through OOP, SOLID principles, UML, design patterns, concurrency, locking, and detailed interview-oriented design problems.",
    path: "/book/system-design/lld",
    icon: Code2,
    topics: [
      "Java",
      "OOP",
      "SOLID",
      "UML",
      "Design Patterns",
      "Concurrency",
    ],
    benefits: [
      "Strengthen object-oriented design skills",
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
      "Learn caching strategies, eviction policies, cache invalidation, Redis, TTLs, and distributed cache design.",
    icon: Layers3,
    path: "/resources/hld/cache",
    category: "Performance",
    tags: ["Redis", "Cache Aside", "TTL"],
  },
  {
    number: "02",
    title: "Load Balancing",
    description:
      "Understand L4 vs L7 load balancing, request routing, health checks, high availability, and traffic distribution.",
    icon: Network,
    path: "/resources/hld/load-balancing",
    category: "Scalability",
    tags: ["L4 / L7", "Routing", "HA"],
  },
  {
    number: "03",
    title: "Database Design",
    description:
      "Explore SQL vs NoSQL, indexes, replication, sharding, consistency, database selection, and scaling strategies.",
    icon: Database,
    path: "/resources/hld/database",
    category: "Data",
    tags: ["SQL", "NoSQL", "Sharding"],
  },
  {
    number: "04",
    title: "Message Queues",
    description:
      "Understand asynchronous communication, event-driven systems, queues, consumers, retries, and delivery guarantees.",
    icon: RadioTower,
    path: "/resources/hld/message-queue",
    category: "Distributed Systems",
    tags: ["Kafka", "Events", "Retries"],
  },
  {
    number: "05",
    title: "Rate Limiting",
    description:
      "Learn token bucket, leaky bucket, fixed windows, sliding windows, and distributed API rate limiting.",
    icon: ShieldCheck,
    path: "/resources/hld/rate-limiting",
    category: "Reliability",
    tags: ["Token Bucket", "Redis", "API"],
  },
  {
    number: "06",
    title: "API Gateway",
    description:
      "Explore API routing, authentication, authorization, throttling, security, and resilient gateway architecture.",
    icon: Server,
    path: "/resources/hld/api-gateway",
    category: "Architecture",
    tags: ["Routing", "Security", "API"],
  },
];

const BENEFITS = [
  {
    icon: Target,
    title: "Interview-oriented",
    description:
      "Connect technical knowledge with the kinds of questions and discussions used in engineering interviews.",
  },
  {
    icon: Layers3,
    title: "Structured content",
    description:
      "Move from individual concepts to complete systems without relying on disconnected learning materials.",
  },
  {
    icon: Code2,
    title: "Practical engineering",
    description:
      "Understand implementation decisions, design patterns, scalability, concurrency, and production trade-offs.",
  },
  {
    icon: Rocket,
    title: "Learn at your pace",
    description:
      "Use free resources for quick revision or deeper books when preparing a complete subject.",
  },
];

const INTERVIEW_TOPICS = [
  {
    icon: FileCode2,
    title: "DSA & Problem Solving",
    description:
      "Coding questions, algorithmic thinking, optimization, and problem-solving discussions.",
  },
  {
    icon: Code2,
    title: "Low-Level Design",
    description:
      "Object-oriented modeling, design patterns, classes, interfaces, concurrency, and Java.",
  },
  {
    icon: Network,
    title: "High-Level Design",
    description:
      "Architecture, databases, scale, caching, queues, consistency, and distributed systems.",
  },
  {
    icon: Sparkles,
    title: "AI & GenAI Engineering",
    description:
      "RAG, agents, MCP, orchestration, backend integrations, and real-world AI project discussions.",
  },
];

const INTERVIEW_TAGS = ["DSA", "LLD", "HLD", "Java", "Backend", "GenAI"];

const PATH_STEPS = [
  {
    n: "01",
    title: "Understand",
    description: "Build strong engineering fundamentals",
  },
  {
    n: "02",
    title: "Design",
    description: "Connect components into real systems",
  },
  {
    n: "03",
    title: "Apply",
    description: "Practice interviews and implementation",
  },
];

const FAQS = [
  {
    question: "Where should I start learning system design?",
    answer:
      "Begin with the free caching, load balancing, database, and API gateway resources. When you want complete system-design interview preparation, explore the HLD book.",
  },
  {
    question: "What's the difference between HLD and LLD?",
    answer:
      "HLD focuses on scalable architecture, APIs, databases, caching, distributed systems, and system-level trade-offs. LLD focuses on object-oriented modeling, classes, interfaces, UML, design patterns, and Java implementation.",
  },
  {
    question: "Are the learning resources free?",
    answer:
      "The resources listed in the Free Engineering Resources section are available through their respective learning pages. The books are separate products; current prices and purchase details are shown on their individual pages.",
  },
  {
    question: "Can I find software engineering interview experiences?",
    answer:
      "Yes. The interview experiences section covers preparation and technical rounds across software engineering, backend, low-level design, high-level design, and AI engineering.",
  },
];

// =====================================================
// MOTION HELPERS
// =====================================================

const MotionLink = motion.create(Link);

const stagger = (gap = 0.09, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

const rise = {
  hidden: { opacity: 0, y: 36, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: EASE },
  },
};

const fromLeft = {
  hidden: { opacity: 0, x: -60, rotate: -1.5 },
  show: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

const fromRight = {
  hidden: { opacity: 0, x: 60, rotate: 1.5 },
  show: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

// Cursor spotlight: updates CSS variables used by .learn-spot
const spot = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();

  event.currentTarget.style.setProperty(
    "--mx",
    `${event.clientX - rect.left}px`
  );
  event.currentTarget.style.setProperty(
    "--my",
    `${event.clientY - rect.top}px`
  );
};

// Fade / slide in when scrolled into view
function Reveal({
  children,
  delay = 0,
  y = 30,
  x = 0,
  className,
  style,
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

// Staggered group that animates its children on scroll
function Stagger({ children, className, gap, delay, style }) {
  return (
    <motion.div
      className={className}
      style={style}
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
function Tilt({ children, className, max = 7, scale = 1.02 }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), {
    stiffness: 220,
    damping: 20,
  });

  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), {
    stiffness: 220,
    damping: 20,
  });

  const onMove = (event) => {
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
      className={cn("learn-tilt", className)}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      whileHover={{ scale }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
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
      ease: "easeOut",
      onUpdate: (latest) => setValue(Math.round(latest)),
    });

    return () => controls.stop();
  }, [inView, to]);

  return <span ref={ref}>{value}</span>;
}

// Headline words slide up from a mask
function SplitWords({ text, className }) {
  return (
    <span className={className} aria-label={text}>
      {text.split(" ").map((word, index) => (
        <span className="learn-word-mask" key={`${word}-${index}`}>
          <motion.span
            className="learn-word"
            aria-hidden="true"
            initial={{ y: "110%", rotate: 6 }}
            animate={{ y: "0%", rotate: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.15 + index * 0.08,
              ease: EASE,
            }}
          >
            {word}
          </motion.span>
          {" "}
        </span>
      ))}
    </span>
  );
}

// Cycles through topics in the hero
function RotatingWord() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % ROTATING_WORDS.length);
    }, 2400);

    return () => clearInterval(timer);
  }, []);

  return (
    <span className="learn-rotator" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={ROTATING_WORDS[index]}
          initial={{ y: 22, opacity: 0, rotateX: -70 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: -22, opacity: 0, rotateX: 70 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  actionPath,
}) {
  return (
    <div className="learn-heading">
      <div className="learn-heading-main">
        <Reveal y={16}>
          <div className="learn-eyebrow">
            <motion.span
              className="learn-eyebrow-line"
              initial={{ width: 0 }}
              whileInView={{ width: 21 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            />
            {eyebrow}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="learn-section-title">{title}</h2>
        </Reveal>

        {description && (
          <Reveal delay={0.16}>
            <p className="learn-section-description">{description}</p>
          </Reveal>
        )}
      </div>

      {action && actionPath && (
        <Reveal delay={0.2}>
          <Link to={actionPath} className="learn-text-link shrink-0">
            {action}
            <ArrowUpRight size={16} />
          </Link>
        </Reveal>
      )}
    </div>
  );
}

function TopicChip({ children }) {
  return <span className="learn-topic-chip">{children}</span>;
}

function LearningAreaCard({ item }) {
  const Icon = item.icon;

  return (
    <motion.div variants={rise} className="learn-cell">
      <Tilt max={6} scale={1.025}>
        <Link
          to={item.path}
          className="learn-area-card learn-spot group"
          onMouseMove={spot}
        >
          <div className="learn-area-top">
            <div className="learn-area-icon">
              <Icon size={23} strokeWidth={1.8} />
            </div>

            <span className="learn-area-number">{item.number}</span>
          </div>

          <p className="learn-card-kicker">{item.eyebrow}</p>

          <h3 className="learn-area-title">{item.title}</h3>

          <p className="learn-area-description">{item.description}</p>

          <div className="learn-area-topics">
            {item.topics.map((topic) => (
              <TopicChip key={topic}>{topic}</TopicChip>
            ))}
          </div>

          <div className="learn-area-footer">
            <span>{item.action}</span>

            <span className="learn-arrow-circle">
              <ArrowUpRight size={17} />
            </span>
          </div>
        </Link>
      </Tilt>
    </motion.div>
  );
}

// Strokes draw themselves when the card scrolls into view
const draw = (delay = 0) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true },
  transition: { duration: 1.1, delay, ease: "easeInOut" },
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
        <circle className="learn-pulse-dot" cx="130" cy="81" r="4" fill="currentColor" />
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
    <motion.article
      className={cn(
        "learn-featured-card learn-spot",
        index === 0 && "learn-featured-primary"
      )}
      variants={index === 0 ? fromLeft : fromRight}
      whileHover={{ y: -8, scale: 1.012 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      onMouseMove={spot}
    >
      <div className="learn-featured-inner">
        <div className="learn-featured-content">
          <div className="learn-featured-meta">
            <span className="learn-featured-number">{book.number}</span>
            <span className="learn-featured-type">{book.type}</span>
          </div>

          <h3 className="learn-featured-title">
            {book.title}
            <span>{book.highlight}</span>
          </h3>

          <p className="learn-featured-subtitle">{book.subtitle}</p>

          <p className="learn-featured-description">{book.description}</p>

          <div className="learn-featured-topics">
            {book.topics.map((topic) => (
              <span key={topic} className="learn-featured-topic">
                {topic}
              </span>
            ))}
          </div>

          <div className="learn-featured-benefits">
            {book.benefits.map((benefit, i) => (
              <motion.div
                key={benefit}
                className="learn-featured-benefit"
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              >
                <Check size={15} />
                <span>{benefit}</span>
              </motion.div>
            ))}
          </div>

          <MotionLink
            to={book.path}
            className="learn-btn learn-btn-orange"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            Explore {book.highlight} Book
            <ArrowUpRight size={17} />
          </MotionLink>
        </div>

        <div className="learn-featured-art">
          <div className="learn-art-grid" />

          <div className="learn-art-orbit learn-art-orbit-one" />
          <div className="learn-art-orbit learn-art-orbit-two" />

          <motion.div
            className="learn-art-float"
            animate={{ y: [0, -12, 0] }}
            transition={{
              duration: 5 + index,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="learn-art-book">
              <div className="learn-art-book-top">
                <span>TARGET TREK</span>
                <Icon size={20} />
              </div>

              <div className="learn-art-book-visual">
                <BookDiagram index={index} />
              </div>

              <div className="learn-art-book-bottom">
                <span className="learn-art-book-label">
                  MASTERING SYSTEM DESIGN
                </span>

                <span className="learn-art-book-heading">
                  {book.highlight}
                </span>

                <span className="learn-art-book-description">
                  {index === 0
                    ? "HIGH-LEVEL DESIGN"
                    : "LOW-LEVEL DESIGN · JAVA"}
                </span>

                <div className="learn-art-book-rule" />

                <span className="learn-art-book-footer">
                  ENGINEERING HANDBOOK
                </span>
              </div>
            </div>
          </motion.div>

          <div className="learn-art-floating-tag">
            <Icon size={16} />
            <span>{index === 0 ? "Architecture" : "Java + OOP"}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ResourceCard({ resource }) {
  const Icon = resource.icon;

  return (
    <motion.div variants={rise} className="learn-cell">
      <Tilt max={5} scale={1.03}>
        <Link
          to={resource.path}
          className="learn-resource-card learn-spot group"
          onMouseMove={spot}
        >
          <div className="learn-resource-header">
            <div className="learn-resource-icon">
              <Icon size={21} strokeWidth={1.8} />
            </div>

            <span className="learn-resource-number">{resource.number}</span>
          </div>

          <span className="learn-resource-category">
            {resource.category}
          </span>

          <h3 className="learn-resource-title">{resource.title}</h3>

          <p className="learn-resource-description">
            {resource.description}
          </p>

          <div className="learn-resource-tags">
            {resource.tags.map((tag) => (
              <TopicChip key={tag}>{tag}</TopicChip>
            ))}
          </div>

          <div className="learn-resource-link">
            Read resource
            <ArrowUpRight size={16} />
          </div>
        </Link>
      </Tilt>
    </motion.div>
  );
}

function CompareCard({ variant, icon: Icon, title, text, items, link, linkText }) {
  return (
    <motion.div
      variants={variant === "free" ? fromLeft : fromRight}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={cn(
        "learn-compare-card learn-spot",
        variant === "paid" && "learn-compare-paid"
      )}
      onMouseMove={spot}
    >
      <motion.div
        className="learn-compare-icon"
        whileHover={{ rotate: 360, scale: 1.12 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <Icon size={26} />
      </motion.div>

      <h3>{title}</h3>

      <p>{text}</p>

      <div className="learn-compare-list">
        {items.map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.25 + i * 0.09 }}
          >
            <Check size={15} />
            {item}
          </motion.div>
        ))}
      </div>

      <Link to={link} className="learn-text-link">
        {linkText}
        <ArrowUpRight size={16} />
      </Link>
    </motion.div>
  );
}

function FaqItem({ faq, open, onToggle }) {
  return (
    <motion.div
      variants={rise}
      className={cn("learn-faq-item", open && "learn-faq-open")}
    >
      <button type="button" aria-expanded={open} onClick={onToggle}>
        <span>{faq.question}</span>

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="learn-faq-chevron"
        >
          <ChevronDown size={17} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div className="learn-faq-answer">{faq.answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Interview list with a line that fills as you scroll
function InterviewList() {
  const ref = useRef(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 55%"],
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
  });

  return (
    <div className="learn-interview-right" ref={ref}>
      <div className="learn-timeline-track">
        <motion.div className="learn-timeline-fill" style={{ scaleY }} />
      </div>

      <Stagger gap={0.12} className="learn-interview-stack">
        {INTERVIEW_TOPICS.map((item) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={item.title}
              variants={fromRight}
              whileHover={{ x: 8, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="learn-interview-item"
            >
              <span className="learn-interview-item-icon">
                <Icon size={18} />
              </span>

              <div>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
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
  const [activeFaq, setActiveFaq] = useState(null);

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

  const blobY = useTransform(heroProgress, [0, 1], [0, 160]);
  const blobY2 = useTransform(heroProgress, [0, 1], [0, -90]);
  const panelY = useTransform(heroProgress, [0, 1], [0, 70]);
  const copyY = useTransform(heroProgress, [0, 1], [0, 40]);
  const heroFade = useTransform(heroProgress, [0, 0.9], [1, 0.25]);

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
      ],
    };
  }, []);

  const stats = [
    { value: FREE_RESOURCES.length, label: "Free resources" },
    { value: FEATURED_BOOKS.length, label: "Flagship books" },
    { value: LEARNING_AREAS.length, label: "Learning paths" },
    { value: INTERVIEW_TAGS.length, label: "Interview tracks" },
  ];

  const marqueeItems = [
    "System Design",
    "Java LLD",
    "Caching",
    "Kafka",
    "Redis",
    "Sharding",
    "Rate Limiting",
    "API Gateway",
    "GenAI",
    "RAG",
    "MCP",
    "Design Patterns",
    "Concurrency",
    "Load Balancing",
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

        <meta
          name="robots"
          content="index,follow,max-image-preview:large"
        />

        <link rel="canonical" href={PAGE_URL} />

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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap');

        .ttLearn {
          --learn-bg: #FAF9F6;
          --learn-surface: #FFFFFF;
          --learn-surface-alt: #F5F2EE;
          --learn-text: #1C1917;
          --learn-muted: #6B625B;
          --learn-subtle: #A8A29E;
          --learn-border: #E8E2DA;
          --learn-orange: #EA580C;
          --learn-orange-bright: #F97316;
          --learn-orange-soft: #FFF0E4;
          --learn-orange-border: #FED7AA;
          --learn-shadow: 0 16px 48px rgba(39,29,22,.07);
          --learn-glow: rgba(249,115,22,.16);

          min-height: 100vh;
          width: 100%;
          overflow-x: clip;
          background: var(--learn-bg);
          color: var(--learn-text);
          font-family: "DM Sans", sans-serif;
          -webkit-font-smoothing: antialiased;
          transition: background .25s, color .25s;
        }

        .ttLearn[data-theme="dark"] {
          --learn-bg: #151311;
          --learn-surface: #211E1B;
          --learn-surface-alt: #2B2622;
          --learn-text: #FAF8F5;
          --learn-muted: #B5ACA5;
          --learn-subtle: #8D827A;
          --learn-border: #39332E;
          --learn-orange: #FB923C;
          --learn-orange-bright: #F97316;
          --learn-orange-soft: #37251B;
          --learn-orange-border: #693B23;
          --learn-shadow: 0 16px 48px rgba(0,0,0,.28);
          --learn-glow: rgba(251,146,60,.14);
          color-scheme: dark;
        }

        .ttLearn *,
        .ttLearn *::before,
        .ttLearn *::after { box-sizing: border-box; }

        .ttLearn a { color: inherit; text-decoration: none; }
        .ttLearn button { font: inherit; }

        .ttLearn h1,
        .ttLearn h2,
        .ttLearn h3,
        .ttLearn h4 { font-family: "Manrope", sans-serif; }

        .learn-shell { width: min(1220px, calc(100% - 40px)); margin: 0 auto; }
        .learn-section { padding: 78px 0; position: relative; }

        /* ---------- scroll progress ---------- */
        .learn-progress {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 3px;
          z-index: 9999;
          transform-origin: 0 50%;
          background: linear-gradient(90deg,#F97316,#FDBA74,#EA580C);
        }

        /* ---------- shared bits ---------- */
        .learn-heading {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (min-width: 640px) {
          .learn-heading { flex-direction: row; align-items: flex-end; justify-content: space-between; }
        }
        .learn-heading-main { max-width: 760px; }

        .learn-eyebrow {
          display: flex; align-items: center; gap: 10px;
          color: var(--learn-orange);
          font-size: 10px; font-weight: 900;
          text-transform: uppercase; letter-spacing: .17em;
        }
        .learn-eyebrow-line {
          display: block; height: 2px; width: 21px; flex-shrink: 0;
          border-radius: 4px; background: var(--learn-orange-bright);
        }
        .learn-section-title {
          margin: 12px 0 0;
          font-size: clamp(27px, 3.2vw, 42px);
          line-height: 1.15; letter-spacing: -.045em; font-weight: 850;
          color: var(--learn-text);
        }
        .learn-section-description {
          max-width: 680px; margin: 13px 0 0;
          font-size: 14px; line-height: 1.85; color: var(--learn-muted);
        }
        .learn-text-link {
          display: inline-flex; align-items: center; gap: 8px;
          color: var(--learn-orange) !important;
          font-size: 13px; font-weight: 800; transition: gap .2s;
        }
        .learn-text-link:hover { gap: 14px; }

        .learn-btn {
          position: relative; overflow: hidden;
          display: inline-flex; justify-content: center; align-items: center; gap: 9px;
          min-height: 46px; padding: 11px 21px; border-radius: 12px;
          font-size: 12px; font-weight: 850;
          border: 1px solid transparent;
          transition: background .2s, border-color .2s, box-shadow .2s;
        }
        .learn-btn-orange {
          background: linear-gradient(135deg,#F97316,#EA580C);
          color: #fff !important;
          box-shadow: 0 10px 24px rgba(249,115,22,.28);
        }
        .learn-btn-orange::after {
          content: ""; position: absolute; top: 0; left: -120%;
          width: 60%; height: 100%;
          background: linear-gradient(100deg,transparent,rgba(255,255,255,.35),transparent);
          transform: skewX(-20deg);
        }
        .learn-btn-orange:hover::after { left: 140%; transition: left .7s ease; }
        .learn-btn-orange:hover { box-shadow: 0 14px 30px rgba(249,115,22,.38); }
        .learn-btn-outline {
          border-color: var(--learn-border);
          background: var(--learn-surface);
          color: var(--learn-text) !important;
        }
        .learn-btn-outline:hover { border-color: var(--learn-orange); }

        .learn-topic-chip {
          display: inline-flex; align-items: center; padding: 6px 9px;
          background: var(--learn-surface-alt); border: 1px solid var(--learn-border);
          border-radius: 7px; color: var(--learn-muted);
          font-size: 10px; font-weight: 700;
          transition: background .2s, color .2s, border-color .2s, transform .2s;
        }
        a:hover > * > .learn-topic-chip,
        a:hover .learn-topic-chip {
          border-color: var(--learn-orange-border);
          color: var(--learn-orange);
          background: var(--learn-orange-soft);
        }

        /* cursor spotlight */
        .learn-spot { position: relative; overflow: hidden; }
        .learn-spot::before {
          content: ""; position: absolute; inset: 0; border-radius: inherit;
          background: radial-gradient(260px circle at var(--mx,50%) var(--my,50%), var(--learn-glow), transparent 70%);
          opacity: 0; transition: opacity .3s; pointer-events: none; z-index: 0;
        }
        .learn-spot:hover::before { opacity: 1; }
        .learn-spot > * { position: relative; z-index: 1; }

        .learn-tilt { height: 100%; transform-style: preserve-3d; }
        .learn-cell { height: 100%; }

        /* ---------- HERO ---------- */
        .learn-hero {
          padding: 112px 0 64px;
          position: relative; overflow: hidden;
          border-bottom: 1px solid var(--learn-border);
          background: var(--learn-surface);
        }
        .learn-hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .learn-blob { position: absolute; border-radius: 50%; filter: blur(70px); }
        .learn-blob-a {
          width: 520px; height: 520px; right: -160px; top: -240px;
          background: radial-gradient(circle,rgba(249,115,22,.26),transparent 68%);
          animation: learn-drift 14s ease-in-out infinite;
        }
        .learn-blob-b {
          width: 420px; height: 420px; left: -150px; bottom: -190px;
          background: radial-gradient(circle,rgba(251,191,36,.20),transparent 68%);
          animation: learn-drift 18s ease-in-out infinite reverse;
        }
        .learn-hero-dots {
          position: absolute; inset: 0; opacity: .5;
          background-image: radial-gradient(var(--learn-border) 1px, transparent 1px);
          background-size: 26px 26px;
          mask-image: radial-gradient(ellipse at 70% 30%, #000 0%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at 70% 30%, #000 0%, transparent 70%);
        }

        .learn-hero-grid {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0,1.1fr) minmax(300px,.9fr);
          gap: 54px; align-items: center;
        }

        .learn-hero-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 12px;
          background: var(--learn-orange-soft);
          border: 1px solid var(--learn-orange-border);
          border-radius: 8px; color: var(--learn-orange);
          font-size: 10px; font-weight: 850; letter-spacing: .12em; text-transform: uppercase;
        }
        .learn-hero-badge svg { animation: learn-spin 6s linear infinite; }

        .learn-hero h1 {
          max-width: 700px;
          font-size: clamp(38px, 5.4vw, 68px);
          line-height: 1.07; letter-spacing: -.06em; font-weight: 850;
          margin: 22px 0 14px;
        }
        .learn-word-mask { display: inline-block; overflow: hidden; vertical-align: top; padding-bottom: .08em; }
        .learn-word { display: inline-block; transform-origin: 0 100%; }
        .learn-hero-accent {
          background: linear-gradient(100deg,#F97316,#FBBF24,#EA580C,#F97316);
          background-size: 250% auto;
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent; color: transparent;
          animation: learn-shine 5s linear infinite;
        }

        .learn-now {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
          font-size: 14px; font-weight: 700; color: var(--learn-muted);
          perspective: 600px;
        }
        .learn-now-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #22C55E;
          box-shadow: 0 0 0 0 rgba(34,197,94,.6); animation: learn-ping 1.8s infinite;
        }
        .learn-rotator {
          display: inline-block; min-width: 190px; padding: 4px 12px;
          border-radius: 8px; background: var(--learn-orange-soft);
          border: 1px solid var(--learn-orange-border);
          color: var(--learn-orange); font-weight: 850; font-family: "Manrope",sans-serif;
        }
        .learn-rotator span { display: inline-block; }

        .learn-hero-copy {
          max-width: 575px; margin-top: 18px;
          font-size: 15px; line-height: 1.85; color: var(--learn-muted);
        }
        .learn-hero-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
        .learn-hero-points { display: flex; gap: 18px; flex-wrap: wrap; margin-top: 26px; }
        .learn-hero-points span {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--learn-muted); font-size: 11px; font-weight: 750;
        }
        .learn-hero-points svg { color: var(--learn-orange); }

        /* hero visual */
        .learn-hero-visual { position: relative; padding: 26px 0; }
        .learn-ring {
          position: absolute; left: 50%; top: 50%;
          width: 118%; aspect-ratio: 1; margin: 0;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          border: 1px dashed rgba(249,115,22,.35);
          animation: learn-spin 40s linear infinite;
          pointer-events: none;
        }
        .learn-ring-2 {
          width: 92%; border-style: solid; border-color: rgba(249,115,22,.16);
          animation-duration: 28s; animation-direction: reverse;
        }
        .learn-chip-float {
          position: absolute; z-index: 3;
          display: grid; place-items: center;
          width: 46px; height: 46px; border-radius: 14px;
          background: var(--learn-surface); color: var(--learn-orange);
          border: 1px solid var(--learn-orange-border);
          box-shadow: var(--learn-shadow);
          animation: learn-float 6s ease-in-out infinite;
        }
        .learn-chip-1 { top: -2px; left: 2%; }
        .learn-chip-2 { top: 16%; right: -14px; animation-delay: -1.5s; }
        .learn-chip-3 { bottom: 14%; left: -16px; animation-delay: -3s; }
        .learn-chip-4 { bottom: -4px; right: 8%; animation-delay: -4.5s; }

        .learn-path-panel {
          position: relative; z-index: 2;
          background: #1C1917; border: 1px solid #39312C;
          border-radius: 22px; padding: 26px; color: #fff; overflow: hidden;
          box-shadow: 0 30px 70px rgba(28,25,23,.28);
        }
        .learn-path-panel::after {
          content: ""; position: absolute; height: 260px; width: 260px;
          border-radius: 50%; right: -110px; top: -110px;
          background: rgba(249,115,22,.14); filter: blur(22px); pointer-events: none;
        }
        .learn-path-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .learn-path-top strong { font-size: 13px; font-weight: 850; letter-spacing: -.02em; }
        .learn-path-top span { color: #FB923C; font-size: 10px; font-weight: 800; }
        .learn-path-steps { position: relative; z-index: 1; display: grid; gap: 13px; margin-top: 25px; }
        .learn-path-steps::before {
          content: ""; position: absolute; left: 33px; top: 20px; bottom: 20px; width: 2px;
          background: linear-gradient(#F97316,rgba(249,115,22,.05)); opacity: .5;
        }
        .learn-path-step {
          position: relative; display: flex; align-items: center; gap: 14px;
          border: 1px solid #403831; background: #292420;
          border-radius: 12px; padding: 15px;
          transition: border-color .25s, background .25s;
        }
        .learn-path-step:hover { border-color: #F97316; background: #33291F; }
        .learn-path-step-number {
          display: grid; place-items: center; width: 37px; height: 37px;
          border-radius: 10px; flex-shrink: 0; color: #FDBA74;
          background: rgba(249,115,22,.14); font-size: 12px; font-weight: 900;
          transition: transform .5s, background .25s;
        }
        .learn-path-step:hover .learn-path-step-number { transform: rotate(360deg); background: rgba(249,115,22,.3); }
        .learn-path-step h3 { margin: 0; font-size: 13px; font-weight: 800; color: #fff; }
        .learn-path-step p { margin: 4px 0 0; font-size: 11px; color: #B9AEA5; line-height: 1.5; }
        .learn-path-step > svg { margin-left: auto; color: #A89990; transition: transform .25s, color .25s; }
        .learn-path-step:hover > svg { transform: translate(3px,-3px); color: #F97316; }
        .learn-path-bottom {
          display: flex; flex-wrap: wrap; align-items: center; gap: 8px;
          margin-top: 20px; padding-top: 17px; border-top: 1px solid #403831;
        }
        .learn-path-bottom span { color: #D6CBC3; font-size: 10px; font-weight: 750; }
        .learn-path-bottom i { height: 3px; width: 3px; border-radius: 50%; background: #FB923C; }

        /* ---------- STATS ---------- */
        .learn-stats {
          display: grid; grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 14px; margin-top: -34px; position: relative; z-index: 5;
        }
        .learn-stat {
          padding: 20px 22px; border-radius: 18px;
          background: var(--learn-surface); border: 1px solid var(--learn-border);
          box-shadow: var(--learn-shadow);
          transition: transform .3s, border-color .3s;
        }
        .learn-stat:hover { transform: translateY(-6px) scale(1.03); border-color: var(--learn-orange); }
        .learn-stat strong {
          display: block; font-family: "Manrope",sans-serif;
          font-size: clamp(28px,3vw,38px); font-weight: 850; letter-spacing: -.05em;
          color: var(--learn-orange);
        }
        .learn-stat span { font-size: 11px; font-weight: 750; color: var(--learn-muted); }

        /* ---------- MARQUEE ---------- */
        .learn-marquee {
          margin-top: 54px; overflow: hidden; padding: 14px 0;
          border-block: 1px solid var(--learn-border);
          background: var(--learn-surface);
          mask-image: linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
          -webkit-mask-image: linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent);
        }
        .learn-marquee-track {
          display: flex; width: max-content; gap: 14px;
          animation: learn-marquee 38s linear infinite;
        }
        .learn-marquee:hover .learn-marquee-track { animation-play-state: paused; }
        .learn-marquee-item {
          display: inline-flex; align-items: center; gap: 10px; white-space: nowrap;
          padding: 8px 16px; border-radius: 999px;
          border: 1px solid var(--learn-border); background: var(--learn-surface-alt);
          font-size: 12px; font-weight: 750; color: var(--learn-muted);
          transition: color .2s, border-color .2s, transform .2s;
        }
        .learn-marquee-item:hover { color: var(--learn-orange); border-color: var(--learn-orange); transform: scale(1.08) rotate(-2deg); }
        .learn-marquee-item i { width: 6px; height: 6px; border-radius: 50%; background: var(--learn-orange-bright); }

        /* ---------- AREA CARDS ---------- */
        .learn-area-grid {
          display: grid; grid-template-columns: repeat(4,minmax(0,1fr));
          gap: 16px; margin-top: 34px;
        }
        .learn-area-card {
          display: flex; flex-direction: column; height: 100%; min-width: 0;
          padding: 24px; border-radius: 18px;
          border: 1px solid var(--learn-border); background: var(--learn-surface);
          transition: border-color .25s, box-shadow .25s;
        }
        .learn-area-card:hover { border-color: var(--learn-orange); box-shadow: var(--learn-shadow); }
        .learn-area-top { display: flex; align-items: start; justify-content: space-between; }
        .learn-area-icon, .learn-resource-icon {
          display: grid; place-items: center; width: 48px; height: 48px;
          border-radius: 13px; background: var(--learn-orange-soft); color: var(--learn-orange);
          transition: transform .5s cubic-bezier(.22,1,.36,1), background .25s, color .25s;
        }
        .learn-area-card:hover .learn-area-icon,
        .learn-resource-card:hover .learn-resource-icon {
          transform: rotate(360deg) scale(1.12);
          background: var(--learn-orange-bright); color: #fff;
        }
        .learn-area-number {
          font-family: "Manrope",sans-serif; font-size: 26px; font-weight: 850;
          color: var(--learn-border); transition: color .25s, transform .25s;
        }
        .learn-area-card:hover .learn-area-number { color: var(--learn-orange); transform: scale(1.2); }
        .learn-card-kicker { margin: 21px 0 0; font-size: 9px; font-weight: 900; letter-spacing: .12em; color: var(--learn-orange); }
        .learn-area-title { margin: 8px 0 0; color: var(--learn-text); font-size: 19px; font-weight: 850; letter-spacing: -.035em; }
        .learn-area-description { flex: 1; margin: 11px 0 0; color: var(--learn-muted); font-size: 12px; line-height: 1.75; }
        .learn-area-topics, .learn-resource-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 17px; }
        .learn-area-footer {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          margin-top: 22px; padding-top: 15px; border-top: 1px solid var(--learn-border);
          color: var(--learn-orange); font-size: 12px; font-weight: 850;
        }
        .learn-arrow-circle {
          display: grid; place-items: center; width: 32px; height: 32px; border-radius: 50%;
          background: var(--learn-orange-soft);
          transition: transform .3s, background .3s, color .3s;
        }
        .learn-area-card:hover .learn-arrow-circle,
        .learn-resource-card:hover .learn-arrow-circle {
          transform: rotate(45deg) scale(1.1); background: var(--learn-orange-bright); color: #fff;
        }

        /* ---------- FEATURED BOOKS ---------- */
        .learn-featured-grid {
          display: grid; grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 18px; margin-top: 34px;
        }
        .learn-featured-card {
          min-width: 0; border-radius: 24px;
          border: 1px solid var(--learn-border); background: var(--learn-surface);
          box-shadow: var(--learn-shadow);
        }
        .learn-featured-primary { border-color: var(--learn-orange-border); }
        .learn-featured-inner { height: 100%; display: grid; grid-template-columns: minmax(0,1fr) minmax(135px,.7fr); }
        .learn-featured-content { display: flex; flex-direction: column; min-width: 0; padding: 26px; }
        .learn-featured-meta { display: flex; align-items: center; gap: 9px; }
        .learn-featured-number {
          display: inline-grid; place-items: center; width: 28px; height: 28px; border-radius: 8px;
          background: var(--learn-orange-soft); color: var(--learn-orange); font-size: 10px; font-weight: 900;
        }
        .learn-featured-type { font-size: 9px; letter-spacing: .09em; color: var(--learn-muted); font-weight: 900; }
        .learn-featured-title {
          margin: 17px 0 0; color: var(--learn-text);
          font-size: clamp(21px,2.2vw,29px); letter-spacing: -.045em; font-weight: 900; line-height: 1.2;
        }
        .learn-featured-title span { display: block; margin-top: 5px; color: var(--learn-orange); }
        .learn-featured-subtitle { margin: 12px 0 0; color: var(--learn-text); font-size: 12px; font-weight: 800; }
        .learn-featured-description { margin: 11px 0 0; font-size: 11px; line-height: 1.8; color: var(--learn-muted); }
        .learn-featured-topics { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 16px; }
        .learn-featured-topic {
          font-size: 9px; font-weight: 800; padding: 6px 8px;
          border: 1px solid var(--learn-border); color: var(--learn-muted);
          background: var(--learn-surface-alt); border-radius: 6px;
          transition: transform .2s, color .2s, border-color .2s;
        }
        .learn-featured-topic:hover { transform: translateY(-3px) rotate(-3deg); color: var(--learn-orange); border-color: var(--learn-orange); }
        .learn-featured-benefits { display: grid; gap: 8px; margin: 19px 0 21px; }
        .learn-featured-benefit { display: flex; align-items: start; gap: 8px; color: var(--learn-muted); font-size: 10px; line-height: 1.5; }
        .learn-featured-benefit svg { flex-shrink: 0; color: var(--learn-orange); }
        .learn-featured-content .learn-btn { align-self: flex-start; margin-top: auto; }

        .learn-featured-art {
          min-width: 0; position: relative; display: grid; place-items: center; overflow: hidden;
          background: radial-gradient(circle at 70% 20%, rgba(249,115,22,.22), transparent 55%), #231D19;
          perspective: 900px; padding: 24px 14px;
        }
        .learn-art-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(251,146,60,.07) 1px,transparent 1px),
            linear-gradient(90deg,rgba(251,146,60,.07) 1px,transparent 1px);
          background-size: 25px 25px;
          animation: learn-grid 8s linear infinite;
        }
        .learn-art-orbit {
          position: absolute; width: 290px; height: 290px; border-radius: 50%;
          border: 1px dashed rgba(251,146,60,.22); animation: learn-spin 30s linear infinite;
        }
        .learn-art-orbit::after {
          content: ""; position: absolute; top: -4px; left: 50%; width: 8px; height: 8px;
          border-radius: 50%; background: #FB923C; box-shadow: 0 0 12px #FB923C;
        }
        .learn-art-orbit-two { width: 215px; height: 215px; animation-direction: reverse; animation-duration: 22s; }
        .learn-art-float { position: relative; z-index: 2; width: min(170px,100%); }
        .learn-art-book {
          position: relative; display: flex; flex-direction: column; width: 100%;
          aspect-ratio: 2 / 3; padding: 17px;
          border: 1px solid rgba(255,255,255,.18); border-radius: 4px 10px 10px 4px; color: #fff;
          background: linear-gradient(140deg,#151310,#34251B 65%,#9A3412);
          box-shadow: 16px 23px 36px rgba(0,0,0,.4), inset 5px 0 rgba(255,255,255,.08);
          transform: rotateY(-12deg) rotateZ(-3deg);
          transition: transform .6s cubic-bezier(.22,1,.36,1);
        }
        .learn-featured-card:hover .learn-art-book { transform: rotateY(-22deg) rotateZ(-6deg) scale(1.08); }
        .learn-art-book-top { display: flex; align-items: center; justify-content: space-between; font-size: 7px; letter-spacing: .15em; font-weight: 900; color: #FDBA74; }
        .learn-art-book-visual { flex: 1; display: grid; place-items: center; color: #FDBA74; padding: 10px 0; }
        .learn-art-book-visual svg { width: 100%; height: auto; }
        .learn-art-book-bottom { display: flex; flex-direction: column; gap: 3px; }
        .learn-art-book-label { font-size: 6px; letter-spacing: .15em; color: #D6CBC3; font-weight: 800; }
        .learn-art-book-heading { font-family: "Manrope",sans-serif; font-size: 30px; font-weight: 900; letter-spacing: -.05em; line-height: 1; }
        .learn-art-book-description { font-size: 7px; letter-spacing: .1em; color: #FDBA74; font-weight: 800; }
        .learn-art-book-rule { height: 1px; margin: 7px 0 5px; background: rgba(253,186,116,.4); }
        .learn-art-book-footer { font-size: 6px; letter-spacing: .15em; color: #A89990; font-weight: 800; }
        .learn-art-floating-tag {
          position: absolute; z-index: 3; right: 10px; bottom: 14px;
          display: inline-flex; align-items: center; gap: 6px; padding: 7px 10px;
          border-radius: 9px; background: rgba(28,25,23,.85); color: #FDBA74;
          border: 1px solid rgba(251,146,60,.3); font-size: 10px; font-weight: 800;
          backdrop-filter: blur(6px); animation: learn-float 5s ease-in-out infinite;
        }
        .learn-pulse-dot { animation: learn-pulse-dot 2s ease-in-out infinite; transform-origin: center; transform-box: fill-box; }

        /* ---------- RESOURCES ---------- */
        .learn-resources-section { background: var(--learn-surface-alt); border-block: 1px solid var(--learn-border); }
        .learn-resources-grid {
          display: grid; grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 16px; margin-top: 34px;
        }
        .learn-resource-card {
          display: flex; flex-direction: column; height: 100%; min-width: 0; padding: 24px;
          border-radius: 18px; border: 1px solid var(--learn-border); background: var(--learn-surface);
          transition: border-color .25s, box-shadow .25s;
        }
        .learn-resource-card:hover { border-color: var(--learn-orange); box-shadow: var(--learn-shadow); }
        .learn-resource-header { display: flex; align-items: flex-start; justify-content: space-between; }
        .learn-resource-number { font-family: "Manrope",sans-serif; font-size: 26px; font-weight: 850; color: var(--learn-border); transition: color .25s, transform .25s; }
        .learn-resource-card:hover .learn-resource-number { color: var(--learn-orange); transform: scale(1.2); }
        .learn-resource-category {
          display: inline-block; align-self: flex-start; margin-top: 18px; padding: 4px 9px; border-radius: 6px;
          background: var(--learn-orange-soft); color: var(--learn-orange);
          font-size: 9px; font-weight: 900; letter-spacing: .1em; text-transform: uppercase;
        }
        .learn-resource-title { margin: 11px 0 0; font-size: 19px; font-weight: 850; letter-spacing: -.035em; color: var(--learn-text); }
        .learn-resource-description { flex: 1; margin: 10px 0 0; font-size: 12px; line-height: 1.75; color: var(--learn-muted); }
        .learn-resource-link {
          display: inline-flex; align-items: center; gap: 7px; margin-top: 20px;
          color: var(--learn-orange); font-size: 12px; font-weight: 850; transition: gap .2s;
        }
        .learn-resource-card:hover .learn-resource-link { gap: 13px; }

        /* ---------- INTERVIEW ---------- */
        .learn-interview-panel {
          display: grid; grid-template-columns: 1.05fr .95fr; margin-top: 32px;
          border-radius: 26px; overflow: hidden;
          border: 1px solid var(--learn-border); background: var(--learn-surface);
          box-shadow: var(--learn-shadow);
        }
        .learn-interview-left { padding: 38px; position: relative; }
        .learn-interview-left h3 { margin: 20px 0 0; font-size: clamp(24px,2.6vw,32px); line-height: 1.2; letter-spacing: -.045em; font-weight: 850; }
        .learn-interview-left p { margin: 15px 0 0; font-size: 13px; line-height: 1.85; color: var(--learn-muted); max-width: 520px; }
        .learn-interview-categories { display: flex; flex-wrap: wrap; gap: 8px; margin: 22px 0 26px; }
        .learn-interview-categories span {
          padding: 7px 13px; border-radius: 999px; font-size: 11px; font-weight: 800;
          border: 1px solid var(--learn-orange-border); background: var(--learn-orange-soft); color: var(--learn-orange);
          transition: transform .25s, background .25s, color .25s;
        }
        .learn-interview-categories span:hover { transform: translateY(-4px) rotate(-4deg) scale(1.08); background: var(--learn-orange-bright); color: #fff; }
        .learn-interview-right {
          position: relative; padding: 38px 38px 38px 58px;
          background: var(--learn-surface-alt); border-left: 1px solid var(--learn-border);
        }
        .learn-timeline-track { position: absolute; left: 34px; top: 54px; bottom: 54px; width: 2px; background: var(--learn-border); border-radius: 2px; }
        .learn-timeline-fill { width: 100%; height: 100%; transform-origin: top; background: linear-gradient(#F97316,#FBBF24); border-radius: 2px; }
        .learn-interview-stack { display: grid; gap: 14px; }
        .learn-interview-item {
          display: flex; gap: 14px; align-items: flex-start; padding: 17px;
          border-radius: 15px; border: 1px solid var(--learn-border); background: var(--learn-surface);
          transition: border-color .25s, box-shadow .25s;
        }
        .learn-interview-item:hover { border-color: var(--learn-orange); box-shadow: var(--learn-shadow); }
        .learn-interview-item-icon {
          display: grid; place-items: center; width: 38px; height: 38px; flex-shrink: 0; border-radius: 11px;
          background: var(--learn-orange-soft); color: var(--learn-orange);
          transition: transform .5s cubic-bezier(.22,1,.36,1), background .25s, color .25s;
        }
        .learn-interview-item:hover .learn-interview-item-icon { transform: rotate(360deg) scale(1.1); background: var(--learn-orange-bright); color: #fff; }
        .learn-interview-item h4 { margin: 0; font-size: 14px; font-weight: 850; letter-spacing: -.02em; }
        .learn-interview-item p { margin: 5px 0 0; font-size: 11px; line-height: 1.7; color: var(--learn-muted); }

        /* ---------- COMPARE ---------- */
        .learn-compare-grid {
          display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 16px; margin-top: 30px;
        }
        .learn-compare-card {
          border: 1px solid var(--learn-border); background: var(--learn-surface);
          border-radius: 20px; padding: 28px;
          transition: border-color .25s, box-shadow .25s;
        }
        .learn-compare-card:hover { border-color: var(--learn-orange); box-shadow: var(--learn-shadow); }
        .learn-compare-paid { border-color: var(--learn-orange-border); background: var(--learn-orange-soft); }
        .learn-compare-icon {
          display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px;
          background: var(--learn-orange-soft); color: var(--learn-orange);
        }
        .learn-compare-paid .learn-compare-icon { background: var(--learn-surface); }
        .learn-compare-card h3 { margin: 18px 0 10px; font-size: 22px; font-weight: 850; letter-spacing: -.035em; }
        .learn-compare-card > p { color: var(--learn-muted); font-size: 13px; line-height: 1.8; margin: 0; }
        .learn-compare-list { display: grid; gap: 11px; margin: 20px 0 26px; }
        .learn-compare-list div { display: flex; gap: 9px; align-items: center; color: var(--learn-muted); font-size: 12px; }
        .learn-compare-list svg { color: var(--learn-orange); flex-shrink: 0; }

        /* ---------- BENEFITS ---------- */
        .learn-benefits { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 16px; margin-top: 34px; }
        .learn-benefit {
          position: relative; padding: 26px; border-radius: 18px; height: 100%;
          border: 1px solid var(--learn-border); background: var(--learn-surface);
          transition: border-color .25s, box-shadow .25s;
        }
        .learn-benefit:hover { border-color: var(--learn-orange); box-shadow: var(--learn-shadow); }
        .learn-benefit-icon {
          display: grid; place-items: center; width: 52px; height: 52px; border-radius: 15px;
          background: var(--learn-orange-soft); color: var(--learn-orange);
          transition: transform .6s cubic-bezier(.22,1,.36,1), background .25s, color .25s;
        }
        .learn-benefit:hover .learn-benefit-icon { transform: rotate(360deg) scale(1.15); background: var(--learn-orange-bright); color: #fff; }
        .learn-benefit h3 { margin: 18px 0 9px; font-size: 17px; font-weight: 850; letter-spacing: -.03em; }
        .learn-benefit p { margin: 0; font-size: 12px; line-height: 1.8; color: var(--learn-muted); }

        /* ---------- FAQ ---------- */
        .learn-faq { display: grid; grid-template-columns: .85fr 1.15fr; gap: 54px; align-items: start; }
        .learn-faq-list { display: grid; gap: 12px; }
        .learn-faq-item {
          border: 1px solid var(--learn-border); background: var(--learn-surface);
          border-radius: 15px; overflow: hidden; transition: border-color .25s, box-shadow .25s;
        }
        .learn-faq-item:hover, .learn-faq-open { border-color: var(--learn-orange); }
        .learn-faq-open { box-shadow: var(--learn-shadow); }
        .learn-faq-item button {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 14px;
          padding: 18px 20px; border: 0; background: transparent; text-align: left; cursor: pointer;
          color: var(--learn-text); font-size: 14px; font-weight: 800;
        }
        .learn-faq-chevron { display: grid; place-items: center; flex-shrink: 0; color: var(--learn-orange); }
        .learn-faq-answer { padding: 0 20px 20px; font-size: 13px; line-height: 1.85; color: var(--learn-muted); }

        /* ---------- CTA ---------- */
        .learn-last-cta {
          position: relative; overflow: hidden; isolation: isolate;
          display: flex; align-items: center; justify-content: space-between; gap: 34px;
          padding: 54px; border-radius: 28px; color: #fff;
          background: linear-gradient(120deg,#1C1917,#3B2214,#7C2D12,#1C1917);
          background-size: 300% 300%; animation: learn-gradient 12s ease infinite;
          box-shadow: 0 30px 70px rgba(124,45,18,.28);
        }
        .learn-cta-ring {
          position: absolute; z-index: -1; border-radius: 50%; pointer-events: none;
          border: 1px dashed rgba(251,146,60,.35);
        }
        .learn-cta-ring-1 { width: 420px; height: 420px; right: -120px; top: -180px; animation: learn-spin 34s linear infinite; }
        .learn-cta-ring-2 { width: 260px; height: 260px; left: -90px; bottom: -130px; animation: learn-spin 26s linear infinite reverse; }
        .learn-last-cta h2 { max-width: 560px; margin: 0; font-size: clamp(26px,3.2vw,40px); line-height: 1.15; letter-spacing: -.05em; font-weight: 850; }
        .learn-last-cta p { max-width: 520px; margin: 14px 0 0; font-size: 14px; line-height: 1.8; color: #D6CBC3; }
        .learn-last-actions { display: flex; flex-wrap: wrap; gap: 12px; flex-shrink: 0; }
        .learn-btn-ghost { border-color: #50453D; color: #fff !important; background: rgba(48,41,35,.7); }
        .learn-btn-ghost:hover { border-color: #FB923C; }

        /* ---------- KEYFRAMES ---------- */
        @keyframes learn-spin { to { transform: rotate(360deg); } }
        .learn-ring { animation-name: learn-spin-center; }
        @keyframes learn-spin-center { to { transform: translate(-50%,-50%) rotate(360deg); } }
        @keyframes learn-float { 0%,100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-14px) rotate(6deg); } }
        @keyframes learn-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-40px,30px) scale(1.12); } }
        @keyframes learn-shine { to { background-position: 250% center; } }
        @keyframes learn-ping { 70% { box-shadow: 0 0 0 9px rgba(34,197,94,0); } 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); } }
        @keyframes learn-marquee { to { transform: translateX(-50%); } }
        @keyframes learn-grid { to { background-position: 25px 25px; } }
        @keyframes learn-gradient { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes learn-pulse-dot { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.8); opacity: .5; } }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 1080px) {
          .learn-area-grid, .learn-benefits { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .learn-resources-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .learn-featured-grid { grid-template-columns: 1fr; }
          .learn-hero-grid { grid-template-columns: 1fr; gap: 46px; }
          .learn-faq { grid-template-columns: 1fr; gap: 26px; }
          .learn-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .learn-chip-2 { right: 0; } .learn-chip-3 { left: 0; }
        }
        @media (max-width: 800px) {
          .learn-interview-panel, .learn-compare-grid { grid-template-columns: 1fr; }
          .learn-interview-right { border-left: 0; border-top: 1px solid var(--learn-border); padding: 30px 24px 30px 50px; }
          .learn-timeline-track { left: 28px; }
          .learn-interview-left { padding: 30px 24px; }
          .learn-last-cta { flex-direction: column; align-items: flex-start; padding: 36px 26px; }
        }
        @media (max-width: 560px) {
          .learn-shell { width: min(1220px, calc(100% - 28px)); }
          .learn-section { padding: 56px 0; }
          .learn-hero { padding: 96px 0 56px; }
          .learn-area-grid, .learn-resources-grid, .learn-benefits { grid-template-columns: 1fr; }
          .learn-featured-inner { grid-template-columns: 1fr; }
          .learn-featured-art { min-height: 300px; }
          .learn-stats { margin-top: -26px; gap: 10px; }
          .learn-stat { padding: 16px; }
          .learn-hero-actions .learn-btn, .learn-last-actions .learn-btn { width: 100%; }
          .learn-chip-float { width: 40px; height: 40px; }
          .learn-rotator { min-width: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ttLearn *, .ttLearn *::before, .ttLearn *::after {
            animation-duration: .001ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .001ms !important;
          }
          .learn-marquee-track { animation: none; }
        }
      `}</style>

      <motion.div
        className="learn-progress"
        style={{ scaleX: progressScale }}
        aria-hidden="true"
      />

      <main className="ttLearn" data-theme={isDark ? "dark" : "light"}>
        {/* ================================================= */}
        {/* HERO                                              */}
        {/* ================================================= */}

        <section className="learn-hero" ref={heroRef}>
          <div className="learn-hero-bg" aria-hidden="true">
            <motion.div className="learn-blob learn-blob-a" style={{ y: blobY }} />
            <motion.div className="learn-blob learn-blob-b" style={{ y: blobY2 }} />
            <div className="learn-hero-dots" />
          </div>

          <div className="learn-shell learn-hero-grid">
            <motion.div style={{ y: copyY, opacity: heroFade }}>
              <motion.span
                className="learn-hero-badge"
                initial={{ opacity: 0, y: -14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <Sparkles size={13} />
                TARGET TREK · LEARN
              </motion.span>

              <h1>
                <SplitWords text="Learn the concepts." />
                <br />
                <SplitWords
                  text="Build the intuition."
                  className="learn-hero-accent"
                />
              </h1>

              <motion.div
                className="learn-now"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: EASE }}
              >
                <span className="learn-now-dot" />
                Now exploring
                <RotatingWord />
              </motion.div>

              <motion.p
                className="learn-hero-copy"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
              >
                A focused learning space for software engineers. Explore
                System Design, Java LLD, practical engineering resources,
                real interview experiences, and technical guides designed to
                help you understand how systems actually work.
              </motion.p>

              <motion.div
                className="learn-hero-actions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1, ease: EASE }}
              >
                <MotionLink
                  to="/books"
                  className="learn-btn learn-btn-orange"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Books
                  <ArrowUpRight size={16} />
                </MotionLink>

                <MotionLink
                  to="/resources/hld/cache"
                  className="learn-btn learn-btn-outline"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Free Resources
                  <ArrowRight size={16} />
                </MotionLink>
              </motion.div>

              <motion.div
                className="learn-hero-points"
                variants={stagger(0.08, 1.15)}
                initial="hidden"
                animate="show"
              >
                {[
                  "System Design",
                  "Java & Backend",
                  "GenAI",
                  "Interview Preparation",
                ].map((item) => (
                  <motion.span key={item} variants={rise}>
                    <Check size={13} />
                    {item}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="learn-hero-visual"
              style={{ y: panelY }}
              initial={{ opacity: 0, x: 70, rotate: 4 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: EASE }}
            >
              <div className="learn-ring" aria-hidden="true" />
              <div className="learn-ring learn-ring-2" aria-hidden="true" />

              <span className="learn-chip-float learn-chip-1"><Network size={20} /></span>
              <span className="learn-chip-float learn-chip-2"><Database size={20} /></span>
              <span className="learn-chip-float learn-chip-3"><Code2 size={20} /></span>
              <span className="learn-chip-float learn-chip-4"><Zap size={20} /></span>

              <Tilt max={9} scale={1.02}>
                <div className="learn-path-panel">
                  <div className="learn-path-top">
                    <strong>From concepts to confidence</strong>
                    <span>YOUR LEARNING PATH</span>
                  </div>

                  <motion.div
                    className="learn-path-steps"
                    variants={stagger(0.18, 0.7)}
                    initial="hidden"
                    animate="show"
                  >
                    {PATH_STEPS.map((item) => (
                      <motion.div
                        className="learn-path-step"
                        key={item.n}
                        variants={fromRight}
                        whileHover={{ x: 6 }}
                      >
                        <span className="learn-path-step-number">{item.n}</span>

                        <div>
                          <h3>{item.title}</h3>
                          <p>{item.description}</p>
                        </div>

                        <ArrowUpRight size={15} />
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="learn-path-bottom">
                    <span>Free resources</span>
                    <i />
                    <span>Books</span>
                    <i />
                    <span>Interviews</span>
                    <i />
                    <span>Blogs</span>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          </div>
        </section>

        {/* ================================================= */}
        {/* STATS + MARQUEE                                   */}
        {/* ================================================= */}

        <div className="learn-shell">
          <Stagger className="learn-stats" gap={0.1}>
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={rise} className="learn-stat">
                <strong>
                  <Counter to={stat.value} />
                </strong>
                <span>{stat.label}</span>
              </motion.div>
            ))}
          </Stagger>
        </div>

        <div className="learn-marquee" aria-hidden="true">
          <div className="learn-marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <span className="learn-marquee-item" key={`${item}-${index}`}>
                <i />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ================================================= */}
        {/* EXPLORE LEARNING AREAS                            */}
        {/* ================================================= */}

        <section className="learn-section">
          <div className="learn-shell">
            <SectionHeading
              eyebrow="EXPLORE TARGET TREK"
              title="Everything you need to keep learning."
              description="Choose your path — whether you're revising a single concept, preparing for an interview, or studying complete software engineering topics."
            />

            <Stagger className="learn-area-grid">
              {LEARNING_AREAS.map((item) => (
                <LearningAreaCard key={item.id} item={item} />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* FEATURED HLD / LLD BOOKS                          */}
        {/* ================================================= */}

        <section className="learn-section" style={{ paddingTop: 18 }}>
          <div className="learn-shell">
            <SectionHeading
              eyebrow="DEEPER LEARNING"
              title="Technical books that connect the dots."
              description="Go beyond memorizing concepts. Learn to explain design decisions, understand trade-offs, and prepare for real software engineering discussions."
              action="View all books"
              actionPath="/books"
            />

            <Stagger className="learn-featured-grid" gap={0.2}>
              {FEATURED_BOOKS.map((book, index) => (
                <FeaturedBookCard key={book.path} book={book} index={index} />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* FREE SYSTEM DESIGN RESOURCES                      */}
        {/* ================================================= */}

        <section className="learn-resources-section learn-section">
          <div className="learn-shell">
            <SectionHeading
              eyebrow="FREE ENGINEERING RESOURCES"
              title="Master the building blocks of scalable systems."
              description="Focused resources that explain the technologies, architecture decisions, and trade-offs behind modern backend systems."
            />

            <Stagger className="learn-resources-grid" gap={0.08}>
              {FREE_RESOURCES.map((resource) => (
                <ResourceCard key={resource.path} resource={resource} />
              ))}
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* INTERVIEW EXPERIENCE                              */}
        {/* ================================================= */}

        <section className="learn-section">
          <div className="learn-shell">
            <SectionHeading
              eyebrow="INTERVIEW PREPARATION"
              title="Prepare beyond coding questions."
              description="Technical interviews test how you reason about algorithms, software design, engineering trade-offs, and real systems."
            />

            <Reveal y={50} className="learn-interview-panel">
              <div className="learn-interview-left">
                <span className="learn-hero-badge">
                  <BriefcaseBusiness size={13} />
                  INTERVIEW EXPERIENCES
                </span>

                <h3>
                  Understand the rounds.
                  <br />
                  Prepare with direction.
                </h3>

                <p>
                  Explore interview experiences covering DSA, backend
                  engineering, Java, system design, AI engineering, and
                  managerial discussions. Use these experiences to
                  understand interview expectations and plan your
                  preparation.
                </p>

                <Stagger className="learn-interview-categories" gap={0.07}>
                  {INTERVIEW_TAGS.map((item) => (
                    <motion.span key={item} variants={rise}>
                      {item}
                    </motion.span>
                  ))}
                </Stagger>

                <MotionLink
                  to="/interviews"
                  className="learn-btn learn-btn-orange"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Interviews
                  <ArrowUpRight size={16} />
                </MotionLink>
              </div>

              <InterviewList />
            </Reveal>
          </div>
        </section>

        {/* ================================================= */}
        {/* FREE VS STRUCTURED                                */}
        {/* ================================================= */}

        <section className="learn-section" style={{ paddingTop: 0 }}>
          <div className="learn-shell">
            <SectionHeading
              eyebrow="HOW TO LEARN"
              title="Start small. Go deeper when you're ready."
              description="Free learning resources and structured books are complementary. Choose based on the depth of understanding you need."
            />

            <Stagger className="learn-compare-grid" gap={0.18}>
              <CompareCard
                variant="free"
                icon={GraduationCap}
                title="Focused free learning"
                text="Explore individual engineering concepts with explanations and practical examples. Ideal for quick revision and learning one topic at a time."
                items={[
                  "Understand one topic",
                  "Build conceptual clarity",
                  "Revise engineering fundamentals",
                  "Learn at your own pace",
                ]}
                link="/resources/hld/cache"
                linkText="Start with free resources"
              />

              <CompareCard
                variant="paid"
                icon={BookOpen}
                title="Structured deep learning"
                text="Study entire topics through connected chapters, case studies, implementation details, architecture choices, and interview-focused exercises."
                items={[
                  "Follow structured chapters",
                  "Connect related concepts",
                  "Explore design decisions",
                  "Prepare complete interview topics",
                ]}
                link="/books"
                linkText="Explore structured books"
              />
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* WHY TARGET TREK                                   */}
        {/* ================================================= */}

        <section className="learn-section" style={{ paddingTop: 0 }}>
          <div className="learn-shell">
            <SectionHeading
              eyebrow="WHY TARGET TREK"
              title="Learning with an engineering mindset."
              description="Technical preparation should help you reason about systems, understand implementation details, and communicate engineering decisions."
            />

            <Stagger className="learn-benefits" gap={0.1}>
              {BENEFITS.map((item) => {
                const Icon = item.icon;

                return (
                  <motion.article
                    key={item.title}
                    variants={rise}
                    whileHover={{ y: -8, scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="learn-benefit"
                  >
                    <span className="learn-benefit-icon">
                      <Icon size={25} strokeWidth={1.7} />
                    </span>

                    <h3>{item.title}</h3>

                    <p>{item.description}</p>
                  </motion.article>
                );
              })}
            </Stagger>
          </div>
        </section>

        {/* ================================================= */}
        {/* FAQ                                               */}
        {/* ================================================= */}

        <section className="learn-section" style={{ paddingTop: 15 }}>
          <div className="learn-shell learn-faq">
            <SectionHeading
              eyebrow="HELP & GUIDANCE"
              title="Questions about learning?"
              description="A few answers to help you choose the right place to start."
            />

            <Stagger className="learn-faq-list" gap={0.1}>
              {FAQS.map((faq, index) => (
                <FaqItem
                  key={faq.question}
                  faq={faq}
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

        <section className="learn-section" style={{ paddingTop: 10 }}>
          <div className="learn-shell">
            <motion.div
              className="learn-last-cta"
              initial={{ opacity: 0, y: 60, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <span className="learn-cta-ring learn-cta-ring-1" aria-hidden="true" />
              <span className="learn-cta-ring learn-cta-ring-2" aria-hidden="true" />

              <div>
                <h2>
                  Your next engineering breakthrough starts with one concept.
                </h2>

                <p>
                  Explore free resources, dive into technical books, and
                  learn from interview experiences — all from Target Trek.
                </p>
              </div>

              <div className="learn-last-actions">
                <MotionLink
                  to="/books"
                  className="learn-btn learn-btn-orange"
                  whileHover={{ scale: 1.08, rotate: -1.5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Explore Books
                  <ArrowUpRight size={16} />
                </MotionLink>

                <MotionLink
                  to="/blogs"
                  className="learn-btn learn-btn-ghost"
                  whileHover={{ scale: 1.08, rotate: 1.5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Read Blogs
                  <ArrowRight size={16} />
                </MotionLink>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </MotionConfig>
  );
}
