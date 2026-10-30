import React, { useEffect, useMemo, useRef, useState } from "react";
import { trackViewContent } from "../lib/metaPixel.js";

import {
  ArrowRight, Check, ChevronDown, ChevronRight,
  Download, Moon, ShieldCheck, Star,
  Sparkles, Sun, TrendingUp, Users, Wallet, X, Zap, Mail
} from "lucide-react";
import  BASE_URL  from "../utils/Url.js";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
const API_BASE = String(BASE_URL || "").replace(/\/+$/, "");
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

function formatPrice(value, currency = "INR") {

  const amount = Number(value);

  if (!Number.isFinite(amount)) return null;

  return new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency,

    maximumFractionDigits: 0

  }).format(amount);

}

export default function HowToEarnMoneyEbook() {

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

  return (

    <div className={`${bg} ${text} min-h-screen overflow-hidden transition-colors duration-300`}>

      <style>{`

        @keyframes floatUp {

          0% { opacity: 0; transform: translateY(14px); }

          12%, 85% { opacity: 1; transform: translateY(0); }

          100% { opacity: 0; transform: translateY(-8px); }

        }

        @keyframes pulseGlow {

          0%,100% { box-shadow: 0 0 0 0 rgba(249,115,22,.18); }

          50% { box-shadow: 0 0 0 12px rgba(249,115,22,0); }

        }

        @keyframes drift {

          0%,100% { transform: translateY(0); }

          50% { transform: translateY(-10px); }

        }

        @keyframes shine {

          0% { background-position: -200% 0; }

          100% { background-position: 200% 0; }

        }

        .float-up { animation: floatUp 4.5s ease-in-out infinite; }

        .float-book { animation: drift 5s ease-in-out infinite; }

        .pulse-glow { animation: pulseGlow 2.4s infinite; }

        .shine { background-size: 200% 100%; animation: shine 4s linear infinite; }

        .reveal { animation: reveal .7s ease both; }

        @keyframes reveal {

          from { opacity: 0; transform: translateY(18px); }

          to { opacity: 1; transform: translateY(0); }

        }

        .purchase-toast { animation: toastIn .35s cubic-bezier(.2,.8,.2,1) both; }
        @keyframes toastIn { from { opacity: 0; transform: translate3d(24px,12px,0) scale(.96); } to { opacity: 1; transform: translate3d(0,0,0) scale(1); } }
        .sticky-buy { animation: stickyRise .55s cubic-bezier(.2,.8,.2,1) both; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        @keyframes stickyRise { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .purchase-toast, .sticky-buy { animation: none !important; } * { scroll-behavior: auto !important; transition-duration: .01ms !important; } }
        html { scroll-behavior: smooth; }

      `}</style>

      <div className="fixed right-5 top-5 z-50">

        <button

          onClick={toggleTheme}

          aria-label="Toggle theme"

          className={`rounded-full border ${border} ${surface} p-3 shadow-lg transition hover:scale-105`}

        >

          {dark ? <Sun size={18} /> : <Moon size={18} />}

        </button>

      </div>

      {/* Hero */}

      <section className="relative px-5 pb-16 pt-20 sm:px-8 lg:pb-24 lg:pt-28">

        <div className="pointer-events-none absolute -right-32 -top-24 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -left-32 top-64 h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.1fr_.9fr]">

          <div className="reveal">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-500">

              <Sparkles size={15} />

              Build Your Own Digital Product Business

            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">

              Apni Knowledge Ko

              <span className="block text-[#f97316]">Ebook Business Mein</span>

              Convert Karna Seekho.

            </h1>

            <p className={`mt-6 max-w-xl text-base leading-8 sm:text-lg ${muted}`}>

              Learn how to find a profitable ebook idea, create your first digital product,

              set its price, build a sales page and market it online — all in one practical guide.

            </p>

            <div className="mt-8 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={openCheckout}
                disabled={priceLoading || priceError || !product?._id}
                className={`${orangeBg} pulse-glow inline-flex items-center gap-2 rounded-xl px-7 py-4 font-bold text-white shadow-xl shadow-orange-500/20 transition hover:-translate-y-1 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {priceLoading ? "Loading price..." : priceError || !formattedPrice ? "Price unavailable" : `Get the Ebook · ${formattedPrice}`}
                {!priceLoading && !priceError && product?._id && <ArrowRight size={18} />}
              </button>

              <a

                href="#inside"

                className={`inline-flex items-center gap-2 rounded-xl border ${border} px-7 py-4 font-semibold transition hover:border-orange-500 hover:text-orange-500`}

              >

                Explore Contents <ChevronRight size={18} />

              </a>

            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">

              <span className={`flex items-center gap-2 ${muted}`}>

                <Check size={16} className={orange} /> Beginner friendly

              </span>

              <span className={`flex items-center gap-2 ${muted}`}>

                <Check size={16} className={orange} /> Practical roadmap

              </span>

              <span className={`flex items-center gap-2 ${muted}`}>

                <Check size={16} className={orange} /> Digital download

              </span>

            </div>

          </div>

          <div className="relative mx-auto w-full max-w-md reveal">

            <div className="absolute inset-5 rounded-[40px] bg-orange-500/20 blur-3xl" />

            <div className={`float-book relative rounded-[30px] border ${border} ${surface} p-5 shadow-2xl`}>

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

                  <div className="rounded-xl bg-orange-500 p-3">

                    <TrendingUp size={28} />

                  </div>

                </div>

              </div>

              <div className="mt-4 flex items-center justify-between px-2">

                <div>

                  <p className={`text-xs ${muted}`}>Instant digital access</p>

                  <p className="font-bold">Start learning today</p>

                </div>

                <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">

                  <Download size={22} />

                </div>

              </div>

            </div>

            <div className={`absolute -left-7 top-1/3 hidden rounded-2xl border ${border} ${surface} p-4 shadow-xl sm:block`}>

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">

                  <Wallet size={22} />

                </div>

                <div>

                  <p className="text-xs text-gray-500">Digital product</p>

                  <p className="font-bold">Your own ebook</p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Audience avatars and social-proof preview */}
      <section className="px-5 pb-16 pt-2 sm:px-8">
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
            <p className="text-xl font-black sm:text-2xl">1000+ users purchased this book</p>
          </div>
        </div>
      </section>

      {/* Value strip */}

      <section className={`border-y ${border} ${surface} px-5 py-8`}>

        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-7 sm:grid-cols-4">

          {[

            [BookIcon, "Create", "Your first ebook"],

            [Users, "Understand", "Your audience"],

            [Wallet, "Learn", "Pricing & selling"],

            [TrendingUp, "Explore", "Growth strategies"]

          ].map(([Icon, heading, sub]) => (

            <div key={heading} className="flex items-center gap-3">

              <div className="rounded-xl bg-orange-500/10 p-3 text-orange-500">

                <Icon size={22} />

              </div>

              <div>

                <p className="font-bold">{heading}</p>

                <p className={`text-xs ${muted}`}>{sub}</p>

              </div>

            </div>

          ))}

        </div>

      </section>

      {/* Problem / opportunity */}

      <section className="px-5 py-20 sm:px-8">

        <div className="mx-auto max-w-6xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-bold uppercase tracking-[.2em] text-orange-500">The opportunity</p>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">

              Aapke Paas Knowledge Hai. Kya Aap Use Digital Product Bana Sakte Ho?

            </h2>

            <p className={`mt-5 leading-8 ${muted}`}>

              Aapne jo seekha hai, jo experience gain kiya hai, ya jis problem ka solution aap jaante hain —

              use ek structured digital product mein package kiya ja sakta hai.

            </p>

          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">

            {[

              {

                icon: Sparkles,

                title: "You Know Something Valuable",

                desc: "Programming, design, career guidance, fitness, cooking ya kisi bhi useful skill par aapke paas knowledge ho sakti hai."

              },

              {

                icon: Wallet,

                title: "Package It as an Ebook",

                desc: "Scattered knowledge ko organize karke ek clear, useful aur easy-to-follow digital guide create kar sakte ho."

              },

              {

                icon: TrendingUp,

                title: "Reach the Right Audience",

                desc: "Sales page, content marketing aur online promotion ke through interested audience tak pahunchna seekho."

              }

            ].map(item => (

              <div key={item.title} className={`group rounded-2xl border ${border} ${surface} p-7 transition duration-300 hover:-translate-y-2 hover:border-orange-500/50 hover:shadow-xl`}>

                <div className="mb-5 inline-flex rounded-2xl bg-orange-500/10 p-4 text-orange-500 transition group-hover:bg-orange-500 group-hover:text-white">

                  <item.icon size={26} />

                </div>

                <h3 className="text-xl font-bold">{item.title}</h3>

                <p className={`mt-3 text-sm leading-7 ${muted}`}>{item.desc}</p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* What you'll learn */}

      <section id="inside" className={`px-5 py-20 sm:px-8 ${surface}`}>

        <div className="mx-auto max-w-6xl">

          <div className="max-w-3xl">

            <p className="text-sm font-bold uppercase tracking-[.2em] text-orange-500">Inside the ebook</p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">

              Everything You Need to Understand the Ebook Business

            </h2>

            <p className={`mt-5 leading-8 ${muted}`}>

              Idea selection se lekar ebook creation, pricing, marketing aur delivery tak —

              explore the topics covered in this guide.

            </p>

          </div>

          <div className={`mt-10 rounded-3xl border ${border} ${dark ? "bg-[#111111]" : "bg-[#fffaf5]"} p-6 sm:p-9`}>
            <div className="flex flex-wrap gap-3">
              {["Idea selection", "Ebook creation", "Pricing", "Marketing", "Sales and delivery"].map((topic) => (
                <span key={topic} className="rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-500">{topic}</span>
              ))}
            </div>
            <p className={`mt-5 max-w-3xl text-sm leading-7 ${muted}`}>
              This guide introduces the broader ebook business journey, from exploring an idea to preparing a digital product for customers. The exact material and depth are presented in the ebook itself.
            </p>
          </div>

        </div>

      </section>

      {/* Who is this for */}

      <section className="px-5 py-20 sm:px-8">

        <div className="mx-auto max-w-6xl">

          <div className="text-center">

            <p className="text-sm font-bold uppercase tracking-[.2em] text-orange-500">Who is this for?</p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Is This Guide Right for You?</h2>

          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {[

              ["Working Professionals", "Apne work experience aur professional knowledge ko digital product mein convert karna chahte hain."],

              ["Students", "Skills aur knowledge share karke digital products ka business samajhna chahte hain."],

              ["Creators", "Apni existing audience ke liye ebooks aur digital products launch karna chahte hain."],

              ["Beginners", "Online business aur ebook selling ka process zero se samajhna chahte hain."]

            ].map(([title, desc]) => (

              <div key={title} className={`rounded-2xl border ${border} ${surface} p-6`}>

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">

                  <Users size={23} />

                </div>

                <h3 className="font-bold">{title}</h3>

                <p className={`mt-3 text-sm leading-7 ${muted}`}>{desc}</p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* Process */}

      <section className={`${surface} px-5 py-20 sm:px-8`}>

        <div className="mx-auto max-w-6xl">

          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-bold uppercase tracking-[.2em] text-orange-500">The roadmap</p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">From Idea to Your First Ebook</h2>

            <p className={`mt-4 leading-7 ${muted}`}>

              Understand the overall journey of building and selling a digital product.

            </p>

          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-4">

            {[

              ["01", "Choose Your Niche", "Find a topic and identify the audience you want to help."],

              ["02", "Create Your Ebook", "Organize your knowledge into a useful digital guide."],

              ["03", "Launch Your Product", "Set pricing, prepare a sales page and configure delivery."],

              ["04", "Market & Improve", "Reach your audience, learn from feedback and improve."]

            ].map(([number, title, desc], index) => (

              <div key={number} className="relative">

                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-xl font-black text-white shadow-lg shadow-orange-500/20">

                  {number}

                </div>

                {index !== 3 && <div className="absolute left-16 top-7 hidden h-px w-[calc(100%-3rem)] bg-orange-500/30 md:block" />}

                <h3 className="text-lg font-bold">{title}</h3>

                <p className={`mt-3 text-sm leading-7 ${muted}`}>{desc}</p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* Purchase section */}

<section id="purchase" className="px-5 py-20 sm:px-8">
  <div className="mx-auto max-w-5xl">
    <div className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-[#1c1917] via-[#29211c] to-[#7c2d12] p-7 text-white shadow-2xl shadow-orange-950/20 sm:p-12">
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[35px] border-orange-400/10" />
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
            disabled={priceLoading || priceError || price === null || !product?._id}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f97316] px-5 py-4 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
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

    {/* Purchase support and refund policy */}
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
  </div>
</section>
      {/* FAQ */}

      <section className={`${surface} px-5 py-20 sm:px-8`}>

        <div className="mx-auto max-w-4xl">

          <div className="text-center">

            <p className="text-sm font-bold uppercase tracking-[.2em] text-orange-500">FAQs</p>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">Frequently Asked Questions</h2>

          </div>

          <div className="mt-10 space-y-3">

            {faqs.map((faq, index) => (

              <div key={faq.q} className={`overflow-hidden rounded-2xl border ${border}`}>

                <button

                  onClick={() => setActiveFaq(activeFaq === index ? -1 : index)}

                  className="flex w-full items-center justify-between gap-5 p-5 text-left"

                >

                  <span className="font-semibold">{faq.q}</span>

                  <ChevronDown

                    size={19}

                    className={`shrink-0 text-orange-500 transition-transform ${activeFaq === index ? "rotate-180" : ""}`}

                  />

                </button>

                {activeFaq === index && (

                  <div className={`border-t ${border} px-5 pb-5 pt-4 text-sm leading-7 ${muted}`}>

                    {faq.a}

                  </div>

                )}

              </div>

            ))}

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

        <div className="mx-auto max-w-3xl">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500">

            <BookIcon size={28} />

          </div>

          <h2 className="mt-6 text-3xl font-black sm:text-4xl">Start Building Your Digital Product Knowledge</h2>

          <p className={`mx-auto mt-4 max-w-xl leading-7 ${muted}`}>

            Learn the process, explore the opportunities and take your first step towards creating an ebook.

          </p>

          <button

            onClick={openCheckout}

            className={`${orangeBg} mt-8 inline-flex items-center gap-2 rounded-xl px-8 py-4 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-1 hover:bg-orange-600`}

          >

            Get the Ebook <ArrowRight size={18} />

          </button>

        </div>

      </section>

      {buyerNotification && (
        <div role="status" aria-live="polite" className={`purchase-toast fixed bottom-24 right-4 z-40 max-w-[min(360px,calc(100vw-2rem))] rounded-2xl border ${border} ${surface} p-4 shadow-2xl sm:bottom-6 sm:right-6`}>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-orange-500/10 p-2 text-orange-500"><Users size={18} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Recent activity </p>
              <p className="mt-1 text-sm font-semibold">{buyerNotification.name} purchased this book</p>
            </div>
            <button type="button" onClick={() => setBuyerNotification(null)} aria-label="Dismiss purchase notification" className={`${muted} hover:text-orange-500`}><X size={16} /></button>
          </div>
        </div>
      )}



      {/* Mobile sticky purchase bar */}

      <div className={`sticky-buy fixed inset-x-3 bottom-3 z-40 rounded-2xl border ${border} ${surface} p-3 shadow-[0_12px_45px_rgba(0,0,0,.22)] sm:inset-x-5 sm:bottom-4 sm:mx-auto sm:max-w-2xl sm:p-4 lg:hidden`}>
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
          <button type="button" onClick={openCheckout} disabled={priceLoading || priceError || price === null || !product?._id} className="sticky-buy-button group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#f97316] px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-500/25 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:shadow-none sm:px-7 sm:py-3.5 sm:text-base">
            Buy Now <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
      <div className="h-24 sm:h-28 lg:hidden" />

      <PayUCheckoutModal

        isOpen={checkoutOpen}

        onClose={() => setCheckoutOpen(false)}

        product={checkoutProduct || product}

      />

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
