import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from "framer-motion";
import { trackViewContent } from "../lib/metaPixel.js";

import {
  ArrowRight, Check, ChevronDown, ChevronRight,
  Download, Lightbulb, Megaphone, Moon, PenLine, Pause, Play, Rocket, ShieldCheck, Star,
  Sparkles, Sun, Tag, TrendingUp, Users, Volume2, VolumeX, Wallet, X, Zap, Mail, XCircle
} from "lucide-react";
import BASE_URL from "../utils/Url.js";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";

const API_BASE = String(BASE_URL || "").replace(/\/+$/, "");

// The hero video lives at src/assest/ebook_video.mp4. It is resolved with a glob so the
// page keeps working (cover-card fallback) until the file is added.
const heroVideoModules = import.meta.glob("../assest/ebook_video.mp4", {
  eager: true,
  query: "?url",
  import: "default"
});
const VIDEO_SEEN_KEY = "tt_ebook_video_started";
const HERO_VIDEO_SRC = Object.values(heroVideoModules)[0] || null;

const chapters = [
  {
    title: "Ebook Business Fundamentals",
    description: "Ebook business kya hai, kaise kaam karta hai aur digital products se earning kaise hoti hai.",
    topics: ["Ebook business model", "Digital product opportunities", "How ebook selling works"]
  },
  {
    title: "Finding a Profitable Ebook Idea",
    description: "Aisa topic identify karna jiske liye log genuinely pay karna chahte hain.",
    topics: ["Niche selection", "Audience research", "Problem identification", "Competitor research"]
  },
  {
    title: "Creating Your First Ebook",
    description: "Apni knowledge ko structured, useful aur sellable ebook mein convert karna.",
    topics: ["Content planning", "Writing workflow", "Chapter structure", "Formatting and design"]
  },
  {
    title: "Pricing Your Ebook",
    description: "Ebook ki pricing decide karna aur different pricing strategies samajhna.",
    topics: ["Pricing strategies", "Value-based pricing", "Discounts and bundles"]
  },
  {
    title: "Building a Sales Page",
    description: "Ek landing page banana jo visitors ko product samajhne aur purchase karne mein help kare.",
    topics: ["Product positioning", "Sales page structure", "Benefits and features", "Call to action"]
  },
  {
    title: "Marketing and Getting Customers",
    description: "Apne ebook ko right audience tak pahunchane ke practical methods.",
    topics: ["Instagram marketing", "Content marketing", "SEO basics", "Paid advertising"]
  },
  {
    title: "Payments and Delivery",
    description: "Payment receive karna aur customers ko ebook automatically deliver karna.",
    topics: ["Payment gateways", "Automated delivery", "Customer support"]
  },
  {
    title: "Growing Your Ebook Business",
    description: "First ebook ke baad product range aur business ko scale karne ke ideas.",
    topics: ["Multiple ebooks", "Upselling", "Bundles", "Improving conversions"]
  }
];

const faqs = [
  {
    q: "Kya beginners bhi ebook business start kar sakte hain?",
    a: "Haan. Aapko starting mein kisi complicated setup ki zaroorat nahi. Aap ek useful topic choose karke, us par structured ebook create karke sell karna start kar sakte hain."
  },
  {
    q: "Kya mujhe coding aani chahiye?",
    a: "Nahi. Ebook create karne, design karne aur sell karne ke liye multiple no-code tools available hain. Is guide mein business process par focus hai."
  },
  {
    q: "Kya ebook sell karne se guaranteed income hogi?",
    a: "Nahi. Income guaranteed nahi hoti. Results aapke topic, product quality, pricing, marketing aur audience par depend karte hain."
  },
  {
    q: "Ebook purchase karne ke baad kaise milegi?",
    a: "Successful payment ke baad download/access instructions payment flow par available honge. Registered email par bhi relevant details share ki ja sakti hain."
  },
  {
    q: "Kya ebook business ke liye website zaroori hai?",
    a: "Start karne ke liye apni website mandatory nahi hai. Lekin dedicated sales page, payment aur automated delivery process business ko manage karna easier bana sakte hain."
  }
];

const sampleReviews = [
  { name: "Aarav Sharma", role: "Software Engineer", rating: 5, text: "Ebook business start karne ke liye mujhe ek proper roadmap chahiye tha. Is guide mein idea selection, content creation aur selling ka process step-by-step explain kiya gaya hai." },
  { name: "Priya Verma", role: "Working Professional", rating: 5, text: "Mujhe samajhna tha ki apni knowledge ko digital product mein kaise convert kar sakte hain. Guide ka structure beginner-friendly hai aur kaafi practical topics cover karta hai." },
  { name: "Rohit Gupta", role: "College Student", rating: 5, text: "Ebook ka idea tha but start kahan se karna hai samajh nahi aa raha tha. Niche selection, ebook writing aur marketing ke topics ek jagah mil jaate hain." },
  { name: "Sneha Singh", role: "Content Creator", rating: 5, text: "Digital products ke business model ko samajhne ke liye useful guide hai. Especially pricing, landing page aur promotion wale sections helpful hain." },
  { name: "Kunal Mehta", role: "IT Professional", rating: 5, text: "Apni professional knowledge ko ebook mein package karne ka process samajhne mein help milti hai. Beginners ke liye concepts simple language mein explain kiye gaye hain." }
];

const MARQUEE_ITEMS = [
  "Niche selection", "Audience research", "Writing workflow", "Pricing strategies",
  "Sales page structure", "Instagram marketing", "SEO basics", "Payment gateways",
  "Automated delivery", "Bundles & upsells"
];

const PAIN_POINTS = [
  "Idea hai, par start kahan se karein pata nahi",
  "Kaunsa topic bikega — confusion",
  "Price kitna rakhein — guesswork",
  "Sales page aur marketing ka koi plan nahi"
];

const GAIN_POINTS = [
  "Step-by-step roadmap idea se launch tak",
  "Niche & audience research ka clear process",
  "Pricing strategies, discounts aur bundles",
  "Sales page, marketing aur delivery ka framework"
];

const VALUE_STACK = [
  { icon: Lightbulb, title: "Idea & niche finding", text: "Profitable topic identify karne ka process." },
  { icon: PenLine, title: "Ebook creation workflow", text: "Planning, writing, chapter structure aur design." },
  { icon: Tag, title: "Pricing playbook", text: "Value-based pricing, discounts aur bundles." },
  { icon: Megaphone, title: "Marketing basics", text: "Instagram, content, SEO aur paid ads ka intro." },
  { icon: Wallet, title: "Payments & delivery", text: "Payment gateways aur automated delivery." },
  { icon: Rocket, title: "Growth ideas", text: "Multiple ebooks, upsells aur conversion improvement." }
];

const ROADMAP = [
  ["01", "Choose Your Niche", "Find a topic and identify the audience you want to help."],
  ["02", "Create Your Ebook", "Organize your knowledge into a useful digital guide."],
  ["03", "Launch Your Product", "Set pricing, prepare a sales page and configure delivery."],
  ["04", "Market & Improve", "Reach your audience, learn from feedback and improve."]
];

const PRICE_PLAYGROUND_NOTE = "Illustrative calculator only — not an income guarantee. Real results depend on your topic, quality, marketing and audience.";

function formatPrice(value, currency = "INR") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount);
}

/* ---------- motion helpers ---------- */

function Reveal({ children, delay = 0, y = 28, x = 0, scale = 1, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const Comp = motion[as] || motion.div;
  if (reduce) return <Comp className={className}>{children}</Comp>;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y, x, scale: scale === 1 ? 1 : 0.94 }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}

function CountUp({ to, suffix = "", prefix = "", duration = 1.6 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return undefined;
    const controls = animate(0, to, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setValue(Math.round(v))
    });
    return () => controls.stop();
  }, [inView, to, duration, reduce]);

  return <span ref={ref}>{prefix}{value}{suffix}</span>;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-1 origin-left bg-gradient-to-r from-orange-400 via-[#f97316] to-amber-400"
    />
  );
}

/** Scroll-linked scale: grows into view, eases out when leaving. */
function ScrollScale({ children, className = "" }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.92, 1, 1, 0.95]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.85, 1], [0.4, 1, 1, 0.7]);
  return (
    <motion.div ref={ref} style={reduce ? undefined : { scale, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

function SectionHead({ eyebrow, title, text, muted, center = true }) {
  return (
    <Reveal className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
      <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[.2em] text-orange-500">
        <span className="h-px w-8 bg-orange-500/50" />{eyebrow}<span className="h-px w-8 bg-orange-500/50" />
      </p>
      <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{title}</h2>
      {text && <p className={`mt-4 leading-8 ${muted}`}>{text}</p>}
    </Reveal>
  );
}

/* ---------- hero video ---------- */

function HeroVideo({ src, heroRef, border, surface, muted, reduce }) {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [ratio, setRatio] = useState(16 / 10);
  const [progress, setProgress] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const userPausedRef = useRef(false);
  const userMutedRef = useRef(false);
  // The "watch with sound" prompt is shown once; after that choice is remembered across reloads.
  const [armed, setArmed] = useState(() => {
    try {
      return localStorage.getItem(VIDEO_SEEN_KEY) !== "1";
    } catch {
      return true;
    }
  });
  const startedRef = useRef(!armed);

  // Try to play WITH sound. Browsers block unmuted autoplay until the visitor interacts,
  // so if that fails we start muted and switch the sound on at the first tap/click/key.
  const safePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!userMutedRef.current) video.muted = false;
    const promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(() => {
        video.muted = true;
        const retry = video.play();
        if (retry && typeof retry.catch === "function") retry.catch(() => setPlaying(false));
      });
    }
  }, []);

  useEffect(() => {
    const unlock = () => {
      const video = videoRef.current;
      if (!video || userMutedRef.current) return;
      if (video.muted) video.muted = false;
      if (video.paused && !userPausedRef.current) {
        const p = video.play();
        if (p && typeof p.catch === "function") {
          p.catch(() => {
            video.muted = true;
            video.play().catch(() => {});
          });
        }
      }
    };
    const events = ["pointerdown", "touchend", "keydown", "click"];
    events.forEach((name) => window.addEventListener(name, unlock, { once: true, passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, unlock));
  }, []);

  const begin = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setArmed(false);
    try {
      localStorage.setItem(VIDEO_SEEN_KEY, "1");
    } catch {
      /* storage unavailable: the prompt may show again next visit */
    }
    safePlay();
  }, [safePlay]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    userMutedRef.current = video.muted;
  };

  // Play automatically on arrival; pause when scrolled away; resume from the same spot when back in view.
  useEffect(() => {
    const target = frameRef.current || heroRef?.current;
    const video = videoRef.current;
    if (!target || !video || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          if (startedRef.current && !userPausedRef.current && !reduce) safePlay();
        } else if (!entry.isIntersecting || entry.intersectionRatio < 0.2) {
          video.pause();
        }
      },
      { threshold: [0, 0.2, 0.35, 0.6] }
    );
    observer.observe(target);

    const onVisibility = () => {
      if (document.hidden) video.pause();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [heroRef, reduce, safePlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      safePlay();
    } else {
      userPausedRef.current = true;
      video.pause();
    }
  };

  return (
    <div ref={frameRef} className="relative">
      <div className="pointer-events-none absolute -inset-3 rounded-[38px] bg-gradient-to-br from-orange-500/40 via-amber-400/20 to-rose-500/30 blur-2xl" />
      <div className="relative rounded-[30px] bg-gradient-to-br from-orange-400 via-[#f97316] to-rose-500 p-[2px] shadow-2xl shadow-orange-500/25">
        <div className={`relative overflow-hidden rounded-[28px] ${surface}`}>
          <div className="relative bg-black" style={{ aspectRatio: ratio }}>
            <video
              ref={videoRef}
              src={src}
              className="absolute inset-0 h-full w-full object-cover"
              loop
              playsInline
              preload="auto"
              onLoadedMetadata={(e) => {
                const { videoWidth, videoHeight } = e.currentTarget;
                if (videoWidth && videoHeight) setRatio(Math.min(Math.max(videoWidth / videoHeight, 0.6), 1.9));
              }}
              onVolumeChange={(e) => setSoundOn(!e.currentTarget.muted && e.currentTarget.volume > 0)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onTimeUpdate={(e) => {
                const { currentTime, duration } = e.currentTarget;
                if (duration) setProgress(currentTime / duration);
              }}
              aria-label="Preview video of the How to Earn Money by Selling Ebooks guide"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

            {armed && (
              <button
                type="button"
                onClick={begin}
                aria-label="Play video with sound"
                className="group absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-[2px] transition hover:bg-black/30"
              >
                <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#f97316] text-white shadow-2xl shadow-orange-500/50 transition duration-300 group-hover:scale-110">
                  <span className="absolute inset-0 animate-ping rounded-full bg-orange-400/60" />
                  <Play size={34} className="relative ml-1" fill="currentColor" />
                </span>
                <span className="relative inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-1.5 text-xs font-bold text-white">
                  <Volume2 size={14} /> Watch with sound
                </span>
              </button>
            )}

            <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
              </span>
              Preview
            </span>

            <div className="absolute bottom-3 right-3 flex gap-2">
              <button type="button" onClick={toggleSound} aria-label={soundOn ? "Mute video" : "Unmute video"} className="rounded-full bg-black/55 p-2.5 text-white backdrop-blur transition hover:scale-110 hover:bg-orange-500">
                {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button type="button" onClick={togglePlay} aria-label={playing ? "Pause video" : "Play video"} className="rounded-full bg-black/55 p-2.5 text-white backdrop-blur transition hover:scale-110 hover:bg-orange-500">
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15">
              <div className="h-full bg-[#f97316]" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>

          <div className="px-5 py-4">
            <p className={`text-xs ${muted}`}>Instant digital access</p>
            <p className="font-bold">Start learning today</p>
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        <div className={`flex items-center gap-3 rounded-2xl border ${border} ${surface} p-3.5 shadow-lg`}>
          <div className="rounded-xl bg-orange-500/10 p-2.5 text-orange-500"><Wallet size={20} /></div>
          <div>
            <p className="text-xs text-gray-500">Digital product</p>
            <p className="text-sm font-bold">Your own ebook</p>
          </div>
        </div>
        <div className={`rounded-2xl border ${border} ${surface} px-4 py-3.5 shadow-lg`}>
          <p className="flex items-center gap-2 text-sm font-bold"><Zap size={15} className="text-orange-500" /> Instant download</p>
        </div>
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function HowToEarnMoneyEbook() {
  const reduce = useReducedMotion();
  const [price, setPrice] = useState(null);
  const [mrp, setMrp] = useState(null);
  const [currency, setCurrency] = useState("INR");
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [dark, setDark] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [activeChapter, setActiveChapter] = useState(0);
  const [product, setProduct] = useState(null);
  const trackedProductRef = useRef(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [buyerNotification, setBuyerNotification] = useState(null);
  const [heroOut, setHeroOut] = useState(false);
  const heroRef = useRef(null);

  // Calculator (illustrative)
  const [calcPrice, setCalcPrice] = useState(299);
  const [calcSales, setCalcSales] = useState(50);

  useEffect(() => {
    const readTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      const isDark = theme === "dark" ||
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem("theme") === "dark";
      setDark(isDark);
    };

    readTheme();
    window.addEventListener("storage", readTheme);
    window.addEventListener("focus", readTheme);
    window.addEventListener("themechange", readTheme);
    window.addEventListener("targettrek-theme-change", readTheme);
    const observer = new MutationObserver(readTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"]
    });

    return () => {
      window.removeEventListener("storage", readTheme);
      window.removeEventListener("focus", readTheme);
      window.removeEventListener("themechange", readTheme);
      window.removeEventListener("targettrek-theme-change", readTheme);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProduct() {
      setPriceLoading(true);
      setPriceError(false);

      try {
        const redirectUrl = window.location.pathname;
        const response = await fetch(
          `${API_BASE}/book/product?redirectUrl=${encodeURIComponent(redirectUrl)}`,
          {
            method: "GET",
            cache: "no-store",
            headers: { Accept: "application/json" },
            signal: controller.signal
          }
        );

        const result = await response.json().catch(() => null);
        const book = result?.data;

        if (!response.ok || result?.success !== true || !book?._id) {
          throw new Error(result?.error?.message || "Book details are unavailable.");
        }

        const actualPrice = Number(book.price);
        const actualMrp = Number(book.mrp ?? book.originalPrice);
        const actualCurrency = book.currency || "INR";

        if (!Number.isFinite(actualPrice) || actualPrice < 0) {
          throw new Error("The book price is currently unavailable.");
        }

        setProduct(book);
        setPrice(actualPrice);
        setMrp(Number.isFinite(actualMrp) && actualMrp > actualPrice ? actualMrp : null);
        setCurrency(actualCurrency);
      } catch (error) {
        if (error?.name === "AbortError") return;
        console.error("Failed to fetch ebook product:", error);
        setProduct(null);
        setPrice(null);
        setMrp(null);
        setPriceError(true);
      } finally {
        if (!controller.signal.aborted) setPriceLoading(false);
      }
    }

    fetchProduct();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!product?._id || product.price == null) return;

    const amount = Number(product.price);
    if (!Number.isFinite(amount) || amount < 0) return;

    const trackingKey = `${product._id}:${amount}:${product.currency || "INR"}`;
    if (trackedProductRef.current === trackingKey) return;

    const sent = trackViewContent({
      id: String(product._id),
      title: product.title || "How to Earn Money by Selling Ebooks",
      price: amount,
      currency: product.currency || "INR"
    });

    if (sent !== false) trackedProductRef.current = trackingKey;
  }, [product?._id, product?.title, product?.price, product?.currency]);

  useEffect(() => {
    const demoBuyers = ["Aarav Sharma", "Priya Verma", "Rohit Gupta", "Sneha Singh", "Kunal Mehta", "Ananya Das", "Rahul Mehta"];
    let buyerIndex = 0;
    let hideTimer;
    const buyerTimer = window.setInterval(() => {
      const name = demoBuyers[buyerIndex % demoBuyers.length];
      setBuyerNotification({ name, id: `${Date.now()}-${buyerIndex}` });
      buyerIndex += 1;
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setBuyerNotification(null), 5000);
    }, 10000);
    return () => {
      window.clearInterval(buyerTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setReviewIndex(current => (current + 1) % sampleReviews.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  // Sticky buy card appears (md+) once the hero has left the viewport.
  useEffect(() => {
    const node = heroRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setHeroOut(!entry.isIntersecting), { threshold: 0 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const formattedPrice = useMemo(
    () => price === null ? null : formatPrice(price, currency),
    [price, currency]
  );

  const formattedMrp = useMemo(
    () => mrp === null ? null : formatPrice(mrp, currency),
    [mrp, currency]
  );

  const discount = mrp && price !== null && mrp > price
    ? Math.round(((mrp - price) / mrp) * 100)
    : null;

  const openCheckout = () => {
    if (!product?._id || price === null || priceLoading || priceError) return;
    setCheckoutProduct(product);
    setCheckoutOpen(true);
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
    window.dispatchEvent(new CustomEvent("targettrek-theme-change", {
      detail: { theme: next ? "dark" : "light" }
    }));
  };

  const bg = dark ? "bg-[#111111]" : "bg-[#fffaf5]";
  const surface = dark ? "bg-[#1b1b1b]" : "bg-white";
  const text = dark ? "text-white" : "text-[#171717]";
  const muted = dark ? "text-gray-400" : "text-gray-600";
  const border = dark ? "border-white/10" : "border-black/10";
  const orange = "text-[#f97316]";
  const orangeBg = "bg-[#f97316]";

  const buyDisabled = priceLoading || priceError || price === null || !product?._id;
  const calcRevenue = calcPrice * calcSales;

  const ctaClass = `${orangeBg} cta-shimmer relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl px-7 py-4 font-bold text-white shadow-xl shadow-orange-500/25 transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60`;

  return (
    <div className={`${bg} ${text} min-h-screen overflow-x-hidden transition-colors duration-300`}>
      <style>{`
        @keyframes pulseGlow {
          0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,.35); }
          50% { box-shadow: 0 0 0 14px rgba(249,115,22,0); }
        }
        @keyframes drift {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes sweep {
          0% { transform: translateX(-120%) skewX(-18deg); }
          60%, 100% { transform: translateX(260%) skewX(-18deg); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        @keyframes orb {
          0%,100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(30px,-24px,0) scale(1.12); }
        }
        .pulse-glow { animation: pulseGlow 2.4s infinite; }
        .cta-shimmer::after {
          content: ""; position: absolute; inset: 0; width: 40%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.4), transparent);
          animation: sweep 3.2s ease-in-out infinite; pointer-events: none;
        }
        .grad-text {
          background: linear-gradient(90deg,#f97316,#fbbf24,#fb7185,#f97316);
          background-size: 200% 100%; -webkit-background-clip: text; background-clip: text;
          color: transparent; animation: gradientShift 6s linear infinite;
        }
        .marquee-track { animation: marquee 32s linear infinite; }
        .marquee:hover .marquee-track { animation-play-state: paused; }
        .orb { animation: orb 12s ease-in-out infinite; }
        .purchase-toast { animation: toastIn .35s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes toastIn { from { opacity: 0; transform: translate3d(24px,12px,0) scale(.96); } to { opacity: 1; transform: translate3d(0,0,0) scale(1); } }
        .sticky-buy { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .faq-collapse { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .35s ease; }
        .faq-collapse[data-open="true"] { grid-template-rows: 1fr; }
        .faq-collapse > div { overflow: hidden; }
        @media (prefers-reduced-motion: reduce) {
          .purchase-toast, .cta-shimmer::after, .marquee-track, .orb, .grad-text, .pulse-glow { animation: none !important; }
          * { scroll-behavior: auto !important; transition-duration: .01ms !important; }
        }
        html { scroll-behavior: smooth; }
      `}</style>

      <ScrollProgress />

      <div className="fixed right-5 top-5 z-50">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`rounded-full border ${border} ${surface} p-3 shadow-lg transition hover:scale-110 hover:rotate-12`}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Hero */}
      <section ref={heroRef} className="relative px-5 pb-16 pt-20 sm:px-8 lg:pb-24 lg:pt-28">
        <div className="orb pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="orb pointer-events-none absolute -left-32 top-64 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl [animation-delay:-5s]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr] xl:gap-14">
          <div>
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-500">
                <Sparkles size={15} className="animate-pulse" />
                Build Your Own Digital Product Business
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h1 className="max-w-3xl text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
                Apni Knowledge Ko
                <span className="grad-text block">Ebook Business Mein</span>
                Convert Karna Seekho.
              </h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className={`mt-6 max-w-xl text-base leading-8 sm:text-lg ${muted}`}>
                Learn how to find a profitable ebook idea, create your first digital product,
                set its price, build a sales page and market it online — all in one practical guide.
              </p>
            </Reveal>

            <Reveal delay={0.24}>
              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={openCheckout}
                  disabled={priceLoading || priceError || !product?._id}
                  className={`${ctaClass} pulse-glow`}
                >
                  {priceLoading ? "Loading price..." : priceError || !formattedPrice ? "Price unavailable" : `Get the Ebook · ${formattedPrice}`}
                  {!priceLoading && !priceError && product?._id && <ArrowRight size={18} />}
                </button>

                <a
                  href="#inside"
                  className={`inline-flex items-center gap-2 rounded-xl border ${border} px-7 py-4 font-semibold transition hover:-translate-y-1 hover:border-orange-500 hover:text-orange-500`}
                >
                  Explore Contents <ChevronRight size={18} />
                </a>
              </div>
              {(formattedMrp || discount) && (
                <p className="mt-3 flex items-center gap-2 text-sm">
                  {formattedMrp && <span className={`line-through ${muted}`}>{formattedMrp}</span>}
                  {discount && <span className="rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-500">{discount}% OFF today</span>}
                </p>
              )}
            </Reveal>

            <Reveal delay={0.28}>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex -space-x-3" aria-hidden="true">
                  {[
                    ["SE", "from-orange-500 to-amber-500"],
                    ["CR", "from-rose-500 to-orange-500"],
                    ["ST", "from-amber-500 to-yellow-500"],
                    ["PR", "from-red-500 to-orange-500"],
                    ["EX", "from-orange-600 to-rose-500"]
                  ].map(([initials, color], i) => (
                    <motion.div
                      key={initials}
                      initial={reduce ? false : { opacity: 0, scale: 0.5, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 260, damping: 18 }}
                      style={{ zIndex: i + 1 }}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-[3px] ${dark ? "border-[#111111]" : "border-[#fffaf5]"} bg-gradient-to-br ${color} text-xs font-black text-white shadow-md transition hover:-translate-y-1 hover:scale-110`}
                    >
                      {initials}
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm font-semibold">
                  <span className="text-orange-500">1000+</span> <span className={muted}>and many more purchased this book</span>
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.32}>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                {["Beginner friendly", "Practical roadmap", "Digital download"].map((t) => (
                  <span key={t} className={`flex items-center gap-2 ${muted}`}>
                    <Check size={16} className={orange} /> {t}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.15} x={40} y={0} className="relative mx-auto w-full max-w-2xl xl:max-w-3xl">
            {HERO_VIDEO_SRC ? (
              <HeroVideo src={HERO_VIDEO_SRC} heroRef={heroRef} border={border} surface={surface} muted={muted} reduce={reduce} />
            ) : (
              <CoverFallback border={border} surface={surface} muted={muted} />
            )}
          </Reveal>
        </div>
      </section>

      {/* Audience avatars and social-proof preview */}
      <section className="px-5 pb-16 pt-2 sm:px-8">
        <Reveal>
          <div className={`mx-auto flex max-w-5xl flex-col items-center justify-center gap-5 rounded-3xl border ${border} ${surface} p-6 text-center shadow-lg shadow-orange-500/5 sm:flex-row sm:gap-7 sm:p-8 sm:text-left`}>
            <div className="flex shrink-0 -space-x-3" aria-label="Illustrative audience avatars">
              {[
                { initials: "SE", label: "Software Engineer", color: "from-orange-500 to-amber-500" },
                { initials: "CR", label: "Creator", color: "from-rose-500 to-orange-500" },
                { initials: "ST", label: "Student", color: "from-amber-500 to-yellow-500" },
                { initials: "EX", label: "Experienced Professional", color: "from-red-500 to-orange-500" }
              ].map((person) => (
                <div key={person.initials} title={person.label} className={`flex h-14 w-14 items-center justify-center rounded-full border-4 ${dark ? "border-[#1b1b1b]" : "border-white"} bg-gradient-to-br ${person.color} text-sm font-black text-white shadow-lg transition duration-300 hover:z-10 hover:-translate-y-2 hover:scale-110 sm:h-16 sm:w-16`}>
                  {person.initials}
                </div>
              ))}
            </div>
            <div>
              <p className="text-xl font-black sm:text-2xl"><CountUp to={1000} suffix="+" /> users purchased this book</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Marquee */}
      <div className={`marquee overflow-hidden border-y ${border} ${surface} py-4`} aria-hidden="true">
        <div className="marquee-track flex w-max gap-3">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-500">
              <Sparkles size={13} /> {item}
            </span>
          ))}
        </div>
      </div>

      {/* Value strip + stats */}
      <section className="px-5 py-14 sm:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 sm:grid-cols-4">
          {[
            [BookIcon, "Create", "Your first ebook"],
            [Users, "Understand", "Your audience"],
            [Wallet, "Learn", "Pricing & selling"],
            [TrendingUp, "Explore", "Growth strategies"]
          ].map(([Icon, heading, sub], i) => (
            <Reveal key={heading} delay={i * 0.08}>
              <div className="group flex items-center gap-3">
                <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500 transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white">
                  <Icon size={22} />
                </div>
                <div>
                  <p className="font-bold">{heading}</p>
                  <p className={`text-xs ${muted}`}>{sub}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <ScrollScale className="mx-auto mt-12 max-w-5xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              [8, "", "Chapters"],
              [27, "+", "Topics covered"],
              [4, "", "Step roadmap"],
              [100, "%", "Digital delivery"]
            ].map(([n, suffix, label]) => (
              <div key={label} className="rounded-2xl bg-gradient-to-br from-[#1c1917] via-[#29211c] to-[#7c2d12] p-6 text-center text-white shadow-xl shadow-orange-950/10">
                <p className="text-4xl font-black text-orange-400"><CountUp to={n} suffix={suffix} /></p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-orange-100/80">{label}</p>
              </div>
            ))}
          </div>
        </ScrollScale>
      </section>

      {/* Problem / opportunity */}
      <section className="px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            eyebrow="The opportunity"
            title="Aapke Paas Knowledge Hai. Kya Aap Use Digital Product Bana Sakte Ho?"
            text="Aapne jo seekha hai, jo experience gain kiya hai, ya jis problem ka solution aap jaante hain — use ek structured digital product mein package kiya ja sakta hai."
            muted={muted}
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: Sparkles, title: "You Know Something Valuable", desc: "Programming, design, career guidance, fitness, cooking ya kisi bhi useful skill par aapke paas knowledge ho sakti hai." },
              { icon: Wallet, title: "Package It as an Ebook", desc: "Scattered knowledge ko organize karke ek clear, useful aur easy-to-follow digital guide create kar sakte ho." },
              { icon: TrendingUp, title: "Reach the Right Audience", desc: "Sales page, content marketing aur online promotion ke through interested audience tak pahunchna seekho." }
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 0.1}>
                <div className={`group h-full rounded-2xl border ${border} ${surface} p-7 transition duration-300 hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10`}>
                  <div className="mb-5 inline-flex rounded-2xl bg-orange-500/10 p-4 text-orange-500 transition duration-300 group-hover:rotate-6 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white">
                    <item.icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className={`mt-3 text-sm leading-7 ${muted}`}>{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Before / after */}
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            <Reveal x={-30} y={0}>
              <div className={`h-full rounded-2xl border ${border} ${surface} p-7`}>
                <p className="text-sm font-bold uppercase tracking-wider text-red-500">Bina roadmap ke</p>
                <ul className="mt-5 space-y-3">
                  {PAIN_POINTS.map((p, i) => (
                    <motion.li
                      key={p}
                      initial={reduce ? false : { opacity: 0, x: -14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex items-start gap-3 text-sm"
                    >
                      <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" /> <span className={muted}>{p}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal x={30} y={0}>
              <div className="h-full rounded-2xl border border-orange-500/40 bg-orange-500/5 p-7 shadow-lg shadow-orange-500/10">
                <p className="text-sm font-bold uppercase tracking-wider text-orange-500">Is guide ke saath</p>
                <ul className="mt-5 space-y-3">
                  {GAIN_POINTS.map((p, i) => (
                    <motion.li
                      key={p}
                      initial={reduce ? false : { opacity: 0, x: 14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex items-start gap-3 text-sm"
                    >
                      <Check size={18} className="mt-0.5 shrink-0 text-orange-500" /> <span>{p}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section id="inside" className={`px-5 py-20 sm:px-8 ${surface}`}>
        <div className="mx-auto max-w-6xl">
          <SectionHead
            eyebrow="Inside the ebook"
            title="Everything You Need to Understand the Ebook Business"
            text="Idea selection se lekar ebook creation, pricing, marketing aur delivery tak — explore the topics covered in this guide."
            muted={muted}
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-[.9fr_1.1fr]">
            <Reveal x={-24} y={0}>
              <div className="space-y-2">
                {chapters.map((chapter, index) => {
                  const active = activeChapter === index;
                  return (
                    <button
                      key={chapter.title}
                      type="button"
                      onClick={() => setActiveChapter(index)}
                      aria-pressed={active}
                      className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition duration-300 ${active ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/10" : `${border} hover:-translate-y-0.5 hover:border-orange-500/40`}`}
                    >
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition ${active ? "bg-[#f97316] text-white" : "bg-orange-500/10 text-orange-500"}`}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 font-bold">{chapter.title}</span>
                      <ChevronRight size={18} className={`text-orange-500 transition-transform ${active ? "translate-x-1" : ""}`} />
                    </button>
                  );
                })}
              </div>
            </Reveal>

            <Reveal x={24} y={0}>
              <motion.div
                key={activeChapter}
                initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                className={`sticky top-6 rounded-3xl border ${border} ${dark ? "bg-[#111111]" : "bg-[#fffaf5]"} p-7 sm:p-9`}
              >
                <p className="text-sm font-bold uppercase tracking-[.2em] text-orange-500">
                  Chapter {String(activeChapter + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-2xl font-black sm:text-3xl">{chapters[activeChapter].title}</h3>
                <p className={`mt-4 leading-8 ${muted}`}>{chapters[activeChapter].description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {chapters[activeChapter].topics.map((topic, i) => (
                    <motion.span
                      key={topic}
                      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.07 }}
                      className="rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-500"
                    >
                      {topic}
                    </motion.span>
                  ))}
                </div>
                <p className={`mt-6 text-xs leading-6 ${muted}`}>
                  The exact material and depth are presented in the ebook itself.
                </p>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Value stack */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow="What you get" title="One Guide. The Full Ebook Business Journey." muted={muted} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {VALUE_STACK.map((item, i) => (
              <Reveal key={item.title} delay={(i % 3) * 0.08} scale={0.94}>
                <div className={`group h-full rounded-2xl border ${border} ${surface} p-6 transition duration-300 hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10`}>
                  <div className="mb-4 inline-flex rounded-xl bg-orange-500/10 p-3 text-orange-500 transition duration-300 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-orange-500 group-hover:text-white">
                    <item.icon size={22} />
                  </div>
                  <h3 className="font-bold">{item.title}</h3>
                  <p className={`mt-2 text-sm leading-7 ${muted}`}>{item.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Who is this for */}
      <section className={`${surface} px-5 py-20 sm:px-8`}>
        <div className="mx-auto max-w-6xl">
          <SectionHead eyebrow="Who is this for?" title="Is This Guide Right for You?" muted={muted} />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Working Professionals", "Apne work experience aur professional knowledge ko digital product mein convert karna chahte hain."],
              ["Students", "Skills aur knowledge share karke digital products ka business samajhna chahte hain."],
              ["Creators", "Apni existing audience ke liye ebooks aur digital products launch karna chahte hain."],
              ["Beginners", "Online business aur ebook selling ka process zero se samajhna chahte hain."]
            ].map(([title, desc], i) => (
              <Reveal key={title} delay={i * 0.08}>
                <div className={`group h-full rounded-2xl border ${border} ${dark ? "bg-[#111111]" : "bg-[#fffaf5]"} p-6 transition duration-300 hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-xl`}>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 transition duration-300 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white">
                    <Users size={23} />
                  </div>
                  <h3 className="font-bold">{title}</h3>
                  <p className={`mt-3 text-sm leading-7 ${muted}`}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <SectionHead
            eyebrow="The roadmap"
            title="From Idea to Your First Ebook"
            text="Understand the overall journey of building and selling a digital product."
            muted={muted}
          />
          <div className="relative mt-14 grid gap-8 md:grid-cols-4">
            <motion.div
              aria-hidden="true"
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.4, ease: "easeOut" }}
              className="absolute left-10 right-10 top-7 hidden h-0.5 origin-left bg-gradient-to-r from-orange-500 to-amber-400 md:block"
            />
            {ROADMAP.map(([number, title, desc], index) => (
              <Reveal key={number} delay={index * 0.15}>
                <div className="relative">
                  <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f97316] text-xl font-black text-white shadow-lg shadow-orange-500/30 transition hover:scale-110 hover:rotate-6">
                    {number}
                  </div>
                  <h3 className="text-lg font-bold">{title}</h3>
                  <p className={`mt-3 text-sm leading-7 ${muted}`}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Illustrative calculator */}
      <section className={`${surface} px-5 py-20 sm:px-8`}>
        <div className="mx-auto max-w-4xl">
          <SectionHead
            eyebrow="Play with the numbers"
            title="See How an Ebook Business Adds Up"
            text="Move the sliders to understand how price and number of sales shape revenue."
            muted={muted}
          />
          <Reveal scale={0.94}>
            <div className={`mt-10 rounded-3xl border ${border} ${dark ? "bg-[#111111]" : "bg-[#fffaf5]"} p-6 sm:p-9`}>
              <div className="grid gap-8 sm:grid-cols-2">
                <label className="block">
                  <span className="flex items-center justify-between text-sm font-semibold">Ebook price <span className="text-orange-500">₹{calcPrice}</span></span>
                  <input type="range" min={99} max={999} step={10} value={calcPrice} onChange={(e) => setCalcPrice(Number(e.target.value))} className="mt-3 w-full accent-[#f97316]" />
                </label>
                <label className="block">
                  <span className="flex items-center justify-between text-sm font-semibold">Number of sales <span className="text-orange-500">{calcSales}</span></span>
                  <input type="range" min={5} max={500} step={5} value={calcSales} onChange={(e) => setCalcSales(Number(e.target.value))} className="mt-3 w-full accent-[#f97316]" />
                </label>
              </div>
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-[#1c1917] via-[#29211c] to-[#7c2d12] p-6 text-center text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-orange-200/80">Revenue = price × sales</p>
                <motion.p
                  key={calcRevenue}
                  initial={reduce ? false : { scale: 0.92, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mt-2 text-4xl font-black text-orange-400 sm:text-5xl"
                >
                  ₹{calcRevenue.toLocaleString("en-IN")}
                </motion.p>
              </div>
              <p className={`mt-4 text-center text-xs leading-6 ${muted}`}>{PRICE_PLAYGROUND_NOTE}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Purchase section */}
      <section id="purchase" className="px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <ScrollScale>
            <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1c1917] via-[#29211c] to-[#7c2d12] p-7 text-white shadow-2xl shadow-orange-950/20 sm:p-12">
              <div className="orb pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[35px] border-orange-400/10" />
              <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-orange-500/10 blur-2xl" />
              <div className="relative grid items-center gap-10 md:grid-cols-[1fr_auto]">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/30 bg-orange-500/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-orange-300">
                    <Zap size={14} /> Get started
                  </span>
                  <h2 className="mt-6 max-w-xl text-3xl font-black leading-tight sm:text-4xl">
                    Ready to Turn Your Knowledge Into a Digital Product?
                  </h2>
                  <p className="mt-4 max-w-xl leading-7 text-orange-100/75">
                    Get the guide and learn the fundamentals of creating, launching and selling ebooks online.
                  </p>
                  <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm text-orange-100/90">
                    <span className="flex items-center gap-2"><Check size={16} /> Digital ebook</span>
                    <span className="flex items-center gap-2"><Check size={16} /> Beginner friendly</span>
                    <span className="flex items-center gap-2"><Check size={16} /> Secure checkout</span>
                  </div>
                </div>
                <div className="w-full rounded-2xl bg-white p-6 text-[#171717] shadow-xl md:w-72">
                  <p className="text-sm font-bold text-gray-500">
                    {product?.title || "How to Earn Money by Selling Ebooks"}
                  </p>
                  <div className="mt-5 flex items-baseline gap-3">
                    {priceLoading ? (
                      <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200" />
                    ) : priceError || formattedPrice === null ? (
                      <span className="text-lg font-bold text-red-600">Price unavailable</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black">{formattedPrice}</span>
                        {formattedMrp && (
                          <span className="text-sm text-gray-400 line-through">{formattedMrp}</span>
                        )}
                      </>
                    )}
                  </div>
                  {discount && (
                    <p className="mt-2 inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                      {discount}% off
                    </p>
                  )}
                  <button
                    onClick={openCheckout}
                    disabled={buyDisabled}
                    className="cta-shimmer relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#f97316] px-5 py-4 font-bold text-white transition duration-300 hover:scale-[1.03] hover:bg-orange-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-400"
                  >
                    {priceLoading ? "Loading price..." : priceError || price === null ? "Currently unavailable" : "Get the Ebook"}
                    {!priceLoading && !priceError && price !== null && <ArrowRight size={18} />}
                  </button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                    <ShieldCheck size={15} /> Secure payment
                  </div>
                </div>
              </div>
            </div>
          </ScrollScale>

          {/* Purchase support and refund policy */}
          <Reveal>
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Need help with your purchase?</h3>
                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      Contact our support team at{" "}
                      <a
                        href="mailto:supporttargettrek@gmail.com"
                        className="font-semibold text-orange-600 underline decoration-orange-300 underline-offset-4 transition hover:text-orange-700"
                      >
                        supporttargettrek@gmail.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="h-px w-full bg-gray-100 sm:h-12 sm:w-px" />
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Refund Policy</h3>
                    <p className="mt-1 max-w-md text-sm leading-6 text-gray-600">
                      All ebook purchases are non-refundable. Refunds will only be issued in case of duplicate payments for the same purchase.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FAQ */}
      <section className={`${surface} px-5 py-20 sm:px-8`}>
        <div className="mx-auto max-w-4xl">
          <SectionHead eyebrow="FAQs" title="Frequently Asked Questions" muted={muted} />
          <div className="mt-10 space-y-3">
            {faqs.map((faq, index) => {
              const open = activeFaq === index;
              return (
                <Reveal key={faq.q} delay={index * 0.05}>
                  <div className={`overflow-hidden rounded-2xl border transition duration-300 ${open ? "border-orange-500/50 shadow-lg shadow-orange-500/5" : border}`}>
                    <button
                      onClick={() => setActiveFaq(open ? -1 : index)}
                      aria-expanded={open}
                      className="flex w-full items-center justify-between gap-5 p-5 text-left"
                    >
                      <span className="font-semibold">{faq.q}</span>
                      <ChevronDown
                        size={19}
                        className={`shrink-0 text-orange-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div className="faq-collapse" data-open={open}>
                      <div>
                        <div className={`border-t ${border} px-5 pb-5 pt-4 text-sm leading-7 ${muted}`}>{faq.a}</div>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Review carousel: sample content for client preview */}
      <section className="overflow-hidden px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.2em] text-orange-500">Reader feedback preview</p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">What Readers Say</h2>
          </div>
          <div className="mt-12 grid items-center gap-5 md:grid-cols-[.82fr_1.25fr_.82fr]">
            {[-1, 0, 1].map((offset) => {
              const index = (reviewIndex + offset + sampleReviews.length) % sampleReviews.length;
              const review = sampleReviews[index];
              const featured = offset === 0;
              return (
                <article key={`${offset}-${review.name}`} className={`relative rounded-3xl border ${border} ${surface} p-6 shadow-xl transition-all duration-700 ${featured ? "z-10 scale-100 opacity-100 md:min-h-[330px] md:p-9" : "hidden scale-95 opacity-65 md:block md:min-h-[270px] md:scale-95"}`}>
                  <div className="flex items-center gap-1 text-orange-500">{[1, 2, 3, 4, 5].map(n => <Star key={n} size={featured ? 18 : 14} fill="currentColor" />)}</div>
                  <p className={`mt-5 leading-7 ${featured ? "text-base sm:text-lg" : "text-sm"}`}>“{review.text}”</p>
                  <div className="mt-7 flex items-center gap-3 border-t border-current/10 pt-5">
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-500 font-bold text-white ${featured ? "h-12 w-12" : ""}`}>{review.name.split(" ").map(word => word[0]).join("")}</div>
                    <span className="ml-auto rounded-full bg-orange-500/10 px-2.5 py-1 text-[10px] font-bold text-orange-500">Verified User</span>
                  </div>
                </article>
              );
            })}
          </div>
          <div className="mt-7 flex justify-center gap-2">
            {sampleReviews.map((review, index) => (
              <button key={review.name} type="button" onClick={() => setReviewIndex(index)} aria-label={`Show sample review ${index + 1}`} className={`h-2.5 rounded-full transition-all duration-300 ${reviewIndex === index ? "w-8 bg-orange-500" : "w-2.5 bg-orange-500/25 hover:bg-orange-500/60"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="px-5 py-16 text-center sm:px-8">
        <ScrollScale className="mx-auto max-w-3xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">
            <BookIcon size={28} />
          </div>
          <h2 className="mt-6 text-3xl font-black sm:text-4xl">Start Building Your Digital Product Knowledge</h2>
          <p className={`mx-auto mt-4 max-w-xl leading-7 ${muted}`}>
            Learn the process, explore the opportunities and take your first step towards creating an ebook.
          </p>
          <button
            onClick={openCheckout}
            disabled={buyDisabled}
            className={`${ctaClass} mt-8 px-8`}
          >
            Get the Ebook <ArrowRight size={18} />
          </button>
        </ScrollScale>
      </section>

      {buyerNotification && (
        <div
          key={buyerNotification.id}
          role="status"
          aria-live="polite"
          className={`purchase-toast fixed bottom-[6.75rem] left-3 z-40 flex w-max max-w-[calc(100vw-1.5rem)] items-center gap-2.5 rounded-full border ${border} ${surface} py-1.5 pl-1.5 pr-2 shadow-xl shadow-black/10 sm:bottom-28 sm:left-6`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-[11px] font-black text-white">
            {buyerNotification.name.split(" ").map((w) => w[0]).join("")}
          </span>
          <div className="min-w-0 leading-tight">
            <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-orange-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" /> Just now
            </p>
            <p className="truncate text-xs font-semibold">{buyerNotification.name} purchased this book</p>
          </div>
          <button type="button" onClick={() => setBuyerNotification(null)} aria-label="Dismiss purchase notification" className={`ml-0.5 shrink-0 rounded-full p-1 ${muted} transition hover:bg-orange-500/10 hover:text-orange-500`}><X size={13} /></button>
        </div>
      )}

      {/* Sticky purchase bar: always docked on mobile, appears after the hero on md+ */}
      <div
        className={`sticky-buy fixed inset-x-3 bottom-3 z-40 rounded-2xl border ${border} ${surface} p-3 shadow-[0_12px_45px_rgba(0,0,0,.22)] transition-all duration-500 sm:inset-x-5 sm:bottom-4 sm:mx-auto sm:max-w-xl sm:p-4 lg:max-w-2xl xl:max-w-3xl ${checkoutOpen ? "pointer-events-none translate-y-32 opacity-0" : heroOut ? "translate-y-0 opacity-100" : "translate-y-0 opacity-100 md:pointer-events-none md:translate-y-32 md:opacity-0"}`}
      >
        <div className="mx-auto flex items-center justify-between gap-3 sm:gap-5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold uppercase tracking-wide text-orange-500 sm:text-xs">Limited digital guide</p>
            <p className="mt-0.5 truncate text-xs font-semibold sm:text-sm">{product?.title || "How to Earn Money by Selling Ebooks"}</p>
            <div className="mt-0.5 flex items-center gap-2">
              <p className="text-base font-black sm:text-xl">{priceLoading ? "..." : formattedPrice || "Price unavailable"}</p>
              {formattedMrp && <p className={`text-xs line-through ${muted}`}>{formattedMrp}</p>}
              {discount && <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-bold text-orange-500">{discount}% OFF</span>}
            </div>
          </div>
          <button type="button" onClick={openCheckout} disabled={buyDisabled} className="sticky-buy-button cta-shimmer pulse-glow group relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#f97316] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none sm:px-7 sm:py-3.5 sm:text-base">
            Buy Now <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
      <div className="h-24 sm:h-28" />

      <PayUCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        product={checkoutProduct || product}
      />
    </div>
  );
}

/** Original cover card, shown until src/assest/ebook_video.mp4 exists. */
function CoverFallback({ border, surface, muted }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute inset-5 rounded-[40px] bg-orange-500/20 blur-3xl" />
      <div className={`relative animate-[drift_5s_ease-in-out_infinite] rounded-[30px] border ${border} ${surface} p-5 shadow-2xl`}>
        <div className="relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1917] via-[#29211c] to-[#7c2d12] p-7 text-white">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full border-[30px] border-orange-500/20" />
          <div className="absolute -bottom-16 -left-12 h-64 w-64 rounded-full border-[24px] border-orange-400/20" />
          <div className="relative">
            <span className="inline-flex rounded-full border border-orange-300/40 bg-orange-500/20 px-3 py-1 text-xs font-bold uppercase tracking-[.2em] text-orange-300">
              Target Trek Guide
            </span>
            <h2 className="mt-10 text-4xl font-black leading-[1.05] sm:text-5xl">
              HOW TO
              <span className="block text-orange-400">EARN MONEY</span>
              <span className="block">BY SELLING</span>
              <span className="block text-orange-400">EBOOKS</span>
            </h2>
            <p className="mt-5 max-w-[230px] text-sm leading-6 text-orange-100/80">
              A practical guide to creating, launching and selling digital products.
            </p>
          </div>
          <div className="relative flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.25em] text-orange-200/70">Your digital business starts here</p>
              <p className="mt-2 text-sm font-bold">TARGET TREK</p>
            </div>
            <div className="rounded-xl bg-orange-500 p-3"><TrendingUp size={28} /></div>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between px-2">
          <div>
            <p className={`text-xs ${muted}`}>Instant digital access</p>
            <p className="font-bold">Start learning today</p>
          </div>
          <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500"><Download size={22} /></div>
        </div>
      </div>
    </div>
  );
}

function BookIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}
