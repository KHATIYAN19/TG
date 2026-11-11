import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  Gift,
  Loader2,
  Mail,
  Percent,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
  Zap,
} from "lucide-react";

import BASE_URL from "../utils/Url";
import { describeOffer, estimateSaving, pickHint, priceSelection } from "./bundleRules";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";

/* =====================================================
   BUNDLE OFFERS  (/books/bundle-offers)

   1. choose an offer   2. choose the books   3. review & pay
   Payment, access link, success page and PDF mail are the
   normal book flow; the order just holds several books.
   The server re-validates and re-prices every pick.
===================================================== */

const SITE_URL = "https://www.targettrek.in";
const PAGE_URL = `${SITE_URL}/books/bundle-offers`;
const API = `${String(BASE_URL || "").replace(/\/+$/, "")}/api/book-offers`;

// same keys the navbar / Books page use
const THEME_KEY = "theme";
const THEME_EVENT = "targettrek-theme-change";

const readTheme = () => {
  if (typeof window === "undefined") return "light";
  try {
    return localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
};

const money = (n) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const errText = (e, fallback) => e?.response?.data?.message || e?.message || fallback;

/* shared rules (same file as the server uses): the server still re-checks every price */
function priceFor(offer, books) {
  const count = books.length;
  const original = round2(books.reduce((s, b) => s + Number(b.price || 0), 0));
  const result = offer && count > 0 ? priceSelection(offer, books) : null;
  const ready = Boolean(result?.ok);

  return {
    count,
    original,
    final: ready ? result.finalAmount : original,
    saving: ready ? result.discountAmount : 0,
    percent: ready ? result.savingsPercent : 0,
    freeBookIds: ready ? result.freeBookIds : [],
    result,
    ready,
  };
}

const offerIcon = (o, size = 13) =>
  o.type === "FREE_BOOKS" ? <Gift size={size} /> : o.type === "FIXED_PRICE" || o.type === "PER_BOOK_PRICE" ? <Tag size={size} /> : <Percent size={size} />;

function daysLeft(endsAt) {
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const d = Math.ceil(ms / 86400000);
  return d <= 7 ? `${d} day${d === 1 ? "" : "s"} left` : null;
}

const FAQ = [
  {
    q: "How do bundle offers work?",
    a: "Pick an offer, choose the books you want from it and the offer price is applied automatically. You pay once and get every book in a single order.",
  },
  {
    q: "How do I get my books after paying?",
    a: "You land on the payment success page with a download link for every book, and all the PDFs are also emailed to the address you used at checkout.",
  },
  {
    q: "Can I use a coupon with a bundle offer?",
    a: "No. Bundle offers already include the discount, so coupon codes can't be combined with them.",
  },
  {
    q: "Which payment methods are supported?",
    a: "UPI, debit and credit cards, net banking and wallets through our secure payment partner. We never see or store your card details.",
  },
  {
    q: "What if I don't receive the email?",
    a: "Check your spam folder first. Your download link on the success page keeps working for 24 hours, and you can write to us from the contact page and we will resend the books.",
  },
];

/* ------------------------------------------------------------------ */

function BookTile({ book, selected, locked, readOnly, free, onToggle }) {
  const off =
    book.mrp > book.price ? Math.round(((book.mrp - book.price) / book.mrp) * 100) : 0;

  return (
    <li className="bo-cell">
      <button
        type="button"
        className="bo-book"
        aria-pressed={selected}
        disabled={(locked && !selected) || readOnly}
        data-readonly={readOnly || undefined}
        onClick={onToggle}
      >
        {free && <span className="bo-free">FREE</span>}
        <span className="bo-check" aria-hidden="true">
          <Check size={14} strokeWidth={3.5} />
        </span>

        <span className="bo-cover">
          {book.coverPageUrl ? (
            <img src={book.coverPageUrl} alt={`${book.title} cover`} loading="lazy" width="104" height="140" />
          ) : (
            <BookOpen size={30} />
          )}
        </span>

        <span className="bo-book-body">
          <span className="bo-book-title">{book.title}</span>
          <span className="bo-book-price">
            <b>{money(book.price)}</b>
            {off > 0 && <s>{money(book.mrp)}</s>}
          </span>
        </span>
      </button>

      {book.redirectUrl && (
        <Link className="bo-peek" to={book.redirectUrl} target="_blank" rel="noopener">
          View details
        </Link>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */

export default function BundleOffers() {
  const [theme, setTheme] = useState(readTheme);
  const [params, setParams] = useSearchParams();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [offerId, setOfferId] = useState(null);
  const [open, setOpen] = useState(false); // book picker modal
  const [picked, setPicked] = useState([]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [openFaq, setOpenFaq] = useState(0);

  const [busy, setBusy] = useState(false);
  const [payError, setPayError] = useState("");
  const [product, setProduct] = useState(null);

  /* ---- theme follows the navbar toggle ---- */
  useEffect(() => {
    const onEvent = (e) => {
      const next = e?.detail?.theme;
      setTheme(next === "dark" || next === "light" ? next : readTheme());
    };
    const onStorage = (e) => {
      if (!e.key || e.key === THEME_KEY) setTheme(readTheme());
    };
    const onFocus = () => setTheme(readTheme());

    window.addEventListener(THEME_EVENT, onEvent);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener(THEME_EVENT, onEvent);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  /* ---- load offers ---- */
  const load = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(API, { signal, timeout: 20000 });
      setOffers(res.data?.data || []);
    } catch (e) {
      if (axios.isCancel(e)) return;
      setError(errText(e, "Unable to load the offers."));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // ?offer=slug opens that offer straight away
  useEffect(() => {
    if (!offers.length || offerId) return;
    const wanted = offers.find((o) => o.slug === params.get("offer") && o.available);
    if (wanted) startOffer(wanted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers]);

  // a reload (after a price / offer change) must not leave a stale offer open
  useEffect(() => {
    if (offerId && offers.length && !offers.some((o) => o._id === offerId && o.available)) {
      setOpen(false);
      setOfferId(null);
      setPicked([]);
    }
  }, [offers, offerId]);

  // Esc closes the picker; page behind it does not scroll
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !product) setOpen(false);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, product]);

  const offer = useMemo(() => offers.find((o) => o._id === offerId) || null, [offers, offerId]);
  const bookMap = useMemo(() => new Map((offer?.books || []).map((b) => [b._id, b])), [offer]);
  const pickedBooks = useMemo(
    () => picked.map((id) => bookMap.get(id)).filter(Boolean),
    [picked, bookMap]
  );
  const price = useMemo(() => priceFor(offer, pickedBooks), [offer, pickedBooks]);

  /* tag chips from the books of the chosen offer */
  const tagOptions = useMemo(() => {
    const counts = new Map();
    for (const b of offer?.books || []) {
      const seen = new Set();
      for (const raw of b.tags || []) {
        const key = String(raw || "").trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        const prev = counts.get(key);
        counts.set(key, { key, label: prev?.label || String(raw).trim(), count: (prev?.count || 0) + 1 });
      }
    }
    return [...counts.values()].sort((a, b) => b.count - a.count).slice(0, 12);
  }, [offer]);

  const visibleBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (offer?.books || []).filter((b) => {
      const okTag =
        !tag || (b.tags || []).some((t) => String(t).trim().toLowerCase() === tag);
      const okQuery =
        !q || [b.title, b.subtitle, b.category, ...(b.tags || [])].join(" ").toLowerCase().includes(q);
      return okTag && okQuery;
    });
  }, [offer, query, tag]);

  const atMax = offer ? picked.length >= offer.maxBooks : false;
  const progress = offer ? Math.min(100, Math.round((picked.length / offer.minBooks) * 100)) : 0;
  const hint = offer ? pickHint(offer, picked.length, price.result) : null;
  const freeSet = useMemo(() => new Set(price.freeBookIds), [price.freeBookIds]);

  const startOffer = (o) => {
    if (!o?.available) return;
    setOfferId(o._id);
    setPicked(o.selectionMode === "ALL" ? o.books.map((b) => b._id) : []);
    setQuery("");
    setTag("");
    setPayError("");
    setOpen(true);
    setParams({ offer: o.slug }, { replace: true });
  };

  const closePicker = () => {
    setOpen(false);
    setPayError("");
    setParams({}, { replace: true });
  };

  const toggle = (id) => {
    setPayError("");
    if (offer?.selectionMode === "ALL") return;
    setPicked((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (offer && cur.length >= offer.maxBooks) return cur;
      return [...cur, id];
    });
  };

  const autoPick = () => {
    if (!offer) return;
    setPicked(offer.books.slice(0, Math.min(offer.minBooks, offer.books.length)).map((b) => b._id));
  };

  const pay = async () => {
    if (!offer || !price.ready || busy) return;

    try {
      setBusy(true);
      setPayError("");

      // the server re-checks the offer, the books and that this price is the right one
      const res = await axios.post(
        `${API}/quote`,
        { offerId: offer._id, bookIds: picked, expectedAmount: price.final },
        { timeout: 20000 }
      );
      const quote = res.data?.data;
      const first = bookMap.get(quote.bookIds[0]);

      setProduct({
        _id: quote.bookIds[0],
        title: quote.title,
        price: quote.finalAmount,
        mrp: quote.originalAmount,
        currency: "INR",
        coverPageUrl: first?.coverPageUrl || "",
        offer: {
          offerId: quote.offerId,
          bookIds: quote.bookIds,
          expectedAmount: quote.finalAmount,
          titles: quote.bookIds.map((id) => bookMap.get(id)?.title).filter(Boolean),
        },
      });
    } catch (e) {
      const code = e?.response?.data?.code;
      setPayError(errText(e, "Unable to start checkout. Please try again."));

      // offer changed or the price differs: reload the live offers so the page is correct again
      if (code === "OFFER_PRICE_MISMATCH" || code === "OFFER_NOT_FOUND" || code === "OFFER_BOOK_NOT_ELIGIBLE") {
        load();
        if (code !== "OFFER_PRICE_MISMATCH") setPicked([]);
      }
    } finally {
      setBusy(false);
    }
  };

  /* ---- SEO ---- */
  const seoTitle = "Bundle Offers: Buy Multiple Ebooks & Save Up to 60% | Target Trek";
  const seoDescription = offers.length
    ? `Build your own ebook bundle. ${offers
        .slice(0, 3)
        .map((o) => describeOffer(o, o.eligibleCount).line)
        .join(", ")}. Instant access and PDFs on email. College placement, system design, cloud and more.`
    : "Build your own ebook bundle from Target Trek. Pick multiple books and save. Instant access and PDFs on email.";

  const structuredData = useMemo(() => {
    const graph = [
      {
        "@type": "CollectionPage",
        "@id": PAGE_URL,
        url: PAGE_URL,
        name: "Ebook Bundle Offers",
        description: seoDescription,
        isPartOf: { "@type": "WebSite", name: "Target Trek", url: SITE_URL },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
          { "@type": "ListItem", position: 3, name: "Bundle offers", item: PAGE_URL },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ];

    if (offers.length) {
      graph.push({
        "@type": "OfferCatalog",
        name: "Target Trek ebook bundle offers",
        itemListElement: offers.map((o) => ({
          "@type": "Offer",
          name: o.name,
          description: o.description || describeOffer(o, o.eligibleCount).line,
          priceCurrency: "INR",
          url: `${PAGE_URL}?offer=${o.slug}`,
          seller: { "@type": "Organization", name: "Target Trek" },
          ...(o.type === "FIXED_PRICE" ? { price: String(o.fixedPrice) } : {}),
          ...(o.spotsLeft !== null && o.spotsLeft !== undefined
            ? { availability: o.spotsLeft > 0 ? "https://schema.org/LimitedAvailability" : "https://schema.org/SoldOut" }
            : {}),
        })),
      });
    }

    return { "@context": "https://schema.org", "@graph": graph };
  }, [offers, seoDescription]);

  const cover = offers[0]?.books?.[0]?.coverPageUrl;

  // hero: a fan of covers + headline numbers
  const heroCovers = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const o of offers) {
      for (const b of o.books) {
        if (b.coverPageUrl && !seen.has(b._id)) {
          seen.add(b._id);
          list.push(b);
        }
      }
    }
    return list.slice(0, 4);
  }, [offers]);

  const totalBooks = useMemo(() => new Set(offers.flatMap((o) => o.books.map((b) => b._id))).size, [offers]);

  const bestSaving = useMemo(() => {
    let best = 0;
    for (const o of offers) best = Math.max(best, estimateSaving(o, o.books));
    return best;
  }, [offers]);

  /* ------------------------------ render ------------------------------ */

  return (
    <div className="bo-root" data-theme={theme}>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="ebook bundle, buy multiple books discount, college placement books, system design ebooks, cloud ebooks, interview preparation bundle, Target Trek"
        />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1" />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:site_name" content="Target Trek" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={PAGE_URL} />
        {cover && <meta property="og:image" content={cover} />}
        <meta name="twitter:card" content={cover ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {cover && <meta name="twitter:image" content={cover} />}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap');

        .bo-root {
          --bg: #FFF8F0; --surface: #FFFFFF; --alt: #FFEFDC; --soft: #FFE4C7;
          --text: #231A12; --muted: #6B5846; --subtle: #A08C79; --border: #F3DCC2;
          --accent: #EA580C; --accent-2: #F97316; --accent-ink: #FFFFFF;
          --ok: #15803D; --ok-bg: #DCFCE7; --err: #B91C1C; --err-bg: #FEE2E2;
          --shadow: 0 14px 40px rgba(194,86,12,.13);
          min-height: 100vh; width: 100%; overflow-x: clip;
          background:
            radial-gradient(900px 420px at 10% -5%, rgba(251,146,60,.20), transparent 60%),
            radial-gradient(700px 380px at 100% 20%, rgba(253,186,116,.25), transparent 60%),
            var(--bg);
          color: var(--text); font-family: "DM Sans", system-ui, sans-serif;
          -webkit-font-smoothing: antialiased; transition: background .25s, color .25s;
          padding: 84px 0 110px;
        }
        .bo-root[data-theme="dark"] {
          --bg: #15110E; --surface: #211B16; --alt: #2A221B; --soft: #3A2A1D;
          --text: #FBF5EE; --muted: #C2B3A4; --subtle: #8E7F70; --border: #3A2F26;
          --accent: #FB923C; --accent-2: #F97316; --accent-ink: #1C1006;
          --ok: #4ADE80; --ok-bg: rgba(34,197,94,.14); --err: #FCA5A5; --err-bg: rgba(127,29,29,.3);
          --shadow: 0 14px 40px rgba(0,0,0,.4); color-scheme: dark;
          background:
            radial-gradient(900px 420px at 10% -5%, rgba(251,146,60,.10), transparent 60%),
            var(--bg);
        }
        .bo-root *, .bo-root *::before, .bo-root *::after { box-sizing: border-box; }
        .bo-root button { font: inherit; cursor: pointer; color: inherit; }
        .bo-root h1, .bo-root h2, .bo-root h3 { font-family: "Manrope", sans-serif; margin: 0; letter-spacing: -.02em; }
        .bo-root ul { list-style: none; margin: 0; padding: 0; }
        .bo-root a { color: inherit; }
        .bo-shell { width: min(1180px, calc(100% - 32px)); margin: 0 auto; }

        .bo-crumbs { display: flex; flex-wrap: wrap; gap: 6px; font-size: 12px; font-weight: 600; color: var(--subtle); margin-bottom: 14px; }
        .bo-crumbs a { text-decoration: none; color: var(--muted); }
        .bo-crumbs a:hover { color: var(--accent); }

        /* hero */
        .bo-hero {
          position: relative; overflow: hidden; display: grid; gap: 28px; align-items: center; border-radius: 32px; padding: 34px 26px;
          background: linear-gradient(135deg, #FFEDD5 0%, #FED7AA 55%, #FDBA74 100%); color: #3B1D08;
          box-shadow: var(--shadow); grid-template-columns: minmax(0,1fr);
        }
        @media (min-width: 900px) { .bo-hero { grid-template-columns: minmax(0,1.15fr) minmax(0,.85fr); padding: 48px 48px; } }
        .bo-root[data-theme="dark"] .bo-hero { background: linear-gradient(135deg, #3A2414, #4A2C16 60%, #5E3515); color: #FFEBD6; }
        .bo-hero::after {
          content: ""; position: absolute; right: -90px; top: -90px; width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,.55), transparent 70%); pointer-events: none;
        }
        .bo-hero-copy { position: relative; z-index: 1; }
        .bo-hero h1 em { font-style: normal; color: #C2410C; }
        .bo-root[data-theme="dark"] .bo-hero h1 em { color: #FDBA74; }
        .bo-hero-cta { display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 22px; }
        .bo-hero-btn {
          display: inline-flex; align-items: center; gap: 8px; height: 50px; padding: 0 26px; border-radius: 15px; text-decoration: none;
          font: 800 14px "Manrope", sans-serif; color: #fff; background: linear-gradient(135deg,#F97316,#EA580C); box-shadow: 0 10px 24px rgba(234,88,12,.35);
        }
        .bo-root[data-theme="dark"] .bo-hero-btn { color: #1C1006; background: linear-gradient(135deg,#FDBA74,#F97316); }
        .bo-hero-link { font-size: 13.5px; font-weight: 700; text-decoration: underline; text-underline-offset: 4px; }
        .bo-hero-art { position: relative; z-index: 1; display: none; height: 300px; }
        @media (min-width: 900px) { .bo-hero-art { display: block; } }
        .bo-fan { position: absolute; bottom: 8px; width: 150px; height: 204px; object-fit: cover; border-radius: 10px; border: 3px solid rgba(255,255,255,.9); box-shadow: 0 24px 40px rgba(120,53,15,.35); transform-origin: bottom center; }
        .bo-fan-0 { left: 4%; transform: rotate(-14deg); z-index: 1; }
        .bo-fan-1 { left: 24%; transform: rotate(-4deg) translateY(-14px); z-index: 2; }
        .bo-fan-2 { left: 44%; transform: rotate(7deg) translateY(-6px); z-index: 3; }
        .bo-fan-3 { left: 62%; transform: rotate(17deg) translateY(10px); z-index: 4; }
        .bo-hero-badge {
          position: absolute; right: 4%; top: 0; z-index: 6; display: grid; place-items: center; width: 108px; height: 108px; border-radius: 50%; text-align: center;
          background: #fff; color: #9A3412; font-size: 11px; font-weight: 800; line-height: 1.2; box-shadow: 0 14px 30px rgba(194,86,12,.35); transform: rotate(8deg);
        }
        .bo-hero-badge b { display: block; font: 800 28px "Manrope", sans-serif; color: #EA580C; }
        .bo-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 16px 0 0; }
        .bo-stats div { padding: 14px 12px; border-radius: 18px; border: 1.5px solid var(--border); background: var(--surface); text-align: center; }
        .bo-stats dt { font-size: 11px; font-weight: 700; color: var(--muted); }
        .bo-stats dd { margin: 4px 0 0; font: 800 clamp(20px, 4vw, 28px) "Manrope", sans-serif; color: var(--accent); }
        .bo-kicker {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 999px; font-size: 11px;
          font-weight: 800; letter-spacing: .08em; text-transform: uppercase; background: rgba(255,255,255,.6); color: #9A3412;
        }
        .bo-root[data-theme="dark"] .bo-kicker { background: rgba(251,146,60,.18); color: #FDBA74; }
        .bo-hero h1 { margin-top: 14px; font-size: clamp(28px, 5vw, 46px); line-height: 1.08; font-weight: 800; max-width: 760px; }
        .bo-hero p { margin: 12px 0 0; max-width: 640px; font-size: 15px; line-height: 1.7; opacity: .85; }
        .bo-trust { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 18px; font-size: 12.5px; font-weight: 700; }
        .bo-trust span { display: inline-flex; align-items: center; gap: 6px; }
        .bo-trust svg { color: #C2410C; }
        .bo-root[data-theme="dark"] .bo-trust svg { color: #FDBA74; }

        /* layout */
        .bo-step { margin-bottom: 34px; }
        .bo-step-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .bo-step-head h2 { font-size: 22px; font-weight: 800; }
        .bo-step-head p { margin: 4px 0 0; font-size: 13px; color: var(--muted); }

        /* offer cards */
        .bo-offers { display: grid; gap: 14px; grid-template-columns: 1fr; }
        @media (min-width: 640px) { .bo-offers { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (min-width: 1024px) { .bo-offers { grid-template-columns: repeat(3, minmax(0,1fr)); } }
        .bo-offers > li { display: flex; }
        .bo-offer {
          position: relative; display: flex; flex-direction: column; width: 100%; overflow: hidden; border-radius: 24px;
          border: 1.5px solid var(--border); background: var(--surface); transition: border-color .2s, box-shadow .25s, transform .25s;
        }
        .bo-offer:hover:not([data-off="true"]) { border-color: var(--accent-2); box-shadow: var(--shadow); transform: translateY(-4px); }
        .bo-offer[data-off="true"] { opacity: .65; }
        .bo-offer-hero {
          position: relative; overflow: hidden; padding: 18px 20px 20px; color: #3B1D08;
          background: linear-gradient(135deg,#FFEDD5 0%,#FED7AA 60%,#FDBA74 100%);
        }
        .bo-root[data-theme="dark"] .bo-offer-hero { color: #FFEBD6; background: linear-gradient(135deg,#3A2414,#4A2C16 60%,#5E3515); }
        .bo-offer-hero::after { content: ""; position: absolute; right: -40px; top: -50px; width: 170px; height: 170px; border-radius: 50%; background: radial-gradient(circle, rgba(255,255,255,.55), transparent 70%); pointer-events: none; }
        .bo-offer-big { margin: 14px 0 0; font: 800 clamp(34px, 5vw, 44px)/1 "Manrope", sans-serif; letter-spacing: -.04em; }
        .bo-offer-bigsub { margin: 4px 0 0; font-size: 13.5px; font-weight: 700; opacity: .8; }
        .bo-stack { display: flex; align-items: center; margin-top: 16px; }
        .bo-stack img { width: 38px; height: 52px; object-fit: cover; border-radius: 6px; border: 2px solid rgba(255,255,255,.9); box-shadow: 0 6px 14px rgba(120,53,15,.3); margin-left: -12px; position: relative; }
        .bo-stack img:first-child { margin-left: 0; }
        .bo-stack span { margin-left: 8px; font-size: 12px; font-weight: 800; }
        .bo-offer-main { display: flex; flex-direction: column; flex: 1; padding: 18px 20px 20px; }
        .bo-offer-main h3 { font-size: 18px; font-weight: 800; }
        .bo-offer-facts { display: grid; gap: 6px; margin: 12px 0 16px; font-size: 12.5px; font-weight: 600; color: var(--muted); }
        .bo-offer-facts li { display: flex; align-items: center; gap: 7px; }
        .bo-offer-facts svg { flex-shrink: 0; color: var(--ok); }
        .bo-offer-cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: auto; width: 100%; height: 48px;
          border: 0; border-radius: 14px; font: 800 14px "Manrope", sans-serif; color: #fff;
          background: linear-gradient(135deg,#F97316,#EA580C); box-shadow: 0 8px 20px rgba(234,88,12,.3); transition: transform .15s, filter .2s;
        }
        .bo-offer-cta:hover { filter: brightness(1.07); transform: translateY(-1px); }
        .bo-root[data-theme="dark"] .bo-offer-cta { color: #1C1006; background: linear-gradient(135deg,#FDBA74,#F97316); }
        .bo-offer-wait { margin: auto 0 0; padding: 8px 12px; border-radius: 10px; background: var(--soft); color: var(--accent); font-size: 12px; font-weight: 700; }
        .bo-offer-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .bo-offer-badge {
          display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; letter-spacing: .06em;
          text-transform: uppercase; color: #9A3412;
        }
        .bo-offer-left { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; background: rgba(255,255,255,.7); font-size: 11px; font-weight: 800; color: #B91C1C; }
        .bo-offer-desc { margin-top: 6px; font-size: 12.5px; line-height: 1.6; color: var(--muted); }
        .bo-offer-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .bo-offer-badge {
          display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 800; letter-spacing: .06em;
          text-transform: uppercase; color: var(--accent);
        }
        .bo-offer-left { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: var(--err); }
        .bo-offer h3 { margin-top: 6px; font-size: 17px; font-weight: 800; }
        .bo-offer-deal { margin-top: 3px; font-size: 14px; font-weight: 700; color: var(--accent); }
        .bo-offer-desc { margin-top: 6px; font-size: 12.5px; line-height: 1.6; color: var(--muted); }
        .bo-offer:disabled { opacity: .62; cursor: not-allowed; }
        .bo-offer:disabled:hover { border-color: var(--border); }
        /* toolbar */
        .bo-toolbar { display: flex; flex-wrap: wrap; gap: 10px; }
        .bo-search { position: relative; flex: 1 1 240px; }
        .bo-search svg { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--subtle); pointer-events: none; }
        .bo-search input {
          width: 100%; height: 46px; padding: 0 38px 0 40px; border-radius: 14px; border: 1.5px solid var(--border);
          background: var(--surface); color: var(--text); font: 500 14px "DM Sans", sans-serif; outline: none;
        }
        .bo-search input:focus { border-color: var(--accent-2); }
        .bo-search button { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: 0; background: transparent; color: var(--subtle); display: grid; }
        .bo-btn-soft {
          height: 46px; padding: 0 16px; border-radius: 14px; border: 1.5px solid var(--soft); background: var(--alt);
          color: var(--accent); font-size: 13px; font-weight: 800;
        }
        .bo-btn-soft:hover { border-color: var(--accent-2); }
        .bo-btn-ghost { background: transparent; border-color: var(--border); color: var(--muted); }

        .bo-chips { display: flex; gap: 8px; margin-top: 12px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; }
        .bo-chips::-webkit-scrollbar { display: none; }
        .bo-chip {
          flex-shrink: 0; padding: 7px 14px; border-radius: 999px; border: 1px solid var(--soft); background: var(--alt);
          color: var(--accent); font-size: 12px; font-weight: 800; transition: background .2s, color .2s;
        }
        .bo-chip:hover:not([aria-pressed="true"]) { background: var(--soft); }
        .bo-chip[aria-pressed="true"] { background: linear-gradient(135deg,#F97316,#EA580C); color: #fff; border-color: transparent; box-shadow: 0 6px 16px rgba(249,115,22,.35); }
        .bo-root[data-theme="dark"] .bo-chip[aria-pressed="true"] { color: #1C1006; background: linear-gradient(135deg,#FDBA74,#F97316); }

        /* books: two per row on phones */
        .bo-grid { display: grid; gap: 12px; margin-top: 16px; grid-template-columns: repeat(2, minmax(0,1fr)); }
        @media (min-width: 640px) { .bo-grid { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px; } }
        @media (min-width: 1280px) { .bo-grid { grid-template-columns: repeat(4, minmax(0,1fr)); } }
        .bo-cell { display: flex; flex-direction: column; min-width: 0; }
        .bo-book {
          position: relative; display: flex; flex-direction: column; flex: 1; width: 100%; padding: 0; text-align: left; overflow: hidden;
          border-radius: 18px; border: 2px solid var(--border); background: var(--surface); transition: border-color .2s, box-shadow .2s, transform .15s;
        }
        .bo-book:hover:not(:disabled) { border-color: var(--accent-2); transform: translateY(-2px); }
        .bo-book:active:not(:disabled) { transform: scale(.98); }
        .bo-book[aria-pressed="true"] { border-color: var(--accent-2); box-shadow: 0 0 0 4px rgba(249,115,22,.18); background: var(--alt); }
        .bo-book:disabled { opacity: .45; cursor: not-allowed; }
        .bo-check {
          position: absolute; z-index: 2; top: 8px; right: 8px; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center;
          border: 2px solid rgba(255,255,255,.9); background: rgba(0,0,0,.25); color: transparent; backdrop-filter: blur(4px);
        }
        .bo-book[aria-pressed="true"] .bo-check { background: var(--accent-2); border-color: var(--accent-2); color: #fff; }
        .bo-free { position: absolute; z-index: 2; top: 8px; left: 8px; padding: 3px 9px; border-radius: 999px; background: #16A34A; color: #fff; font: 800 10px "Manrope", sans-serif; letter-spacing: .06em; }
        .bo-offer-spots { color: var(--err) !important; font-weight: 800 !important; }
        .bo-offer-spots svg { color: var(--err) !important; }
        .bo-hint[data-tone="warn"] { color: var(--err); }
        .bo-hint[data-tone="ok"] { color: var(--ok); }
        .bo-cover {
          display: grid; place-items: center; padding: 16px 10px; color: var(--subtle);
          background: linear-gradient(180deg, var(--alt), var(--surface));
        }
        .bo-cover img { width: 78px; height: 106px; object-fit: cover; border-radius: 6px; box-shadow: 8px 12px 20px rgba(120,53,15,.28); }
        @media (min-width: 640px) { .bo-cover img { width: 98px; height: 132px; } }
        .bo-book-body { display: flex; flex-direction: column; gap: 6px; padding: 10px 12px 12px; flex: 1; }
        .bo-book-title {
          font-size: 13px; font-weight: 700; line-height: 1.35; color: var(--text);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }
        .bo-book-price { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px; margin-top: auto; }
        .bo-book-price b { font: 800 14px "Manrope", sans-serif; }
        .bo-book-price s { font-size: 11px; color: var(--subtle); }
        .bo-peek { margin-top: 6px; text-align: center; font-size: 11.5px; font-weight: 700; color: var(--muted); text-decoration: underline; text-underline-offset: 3px; }
        .bo-peek:hover { color: var(--accent); }
        .bo-empty { padding: 34px 0; text-align: center; font-size: 14px; font-weight: 600; color: var(--muted); }

        /* progress, pay, errors (used in the picker modal) */
        .bo-progress { height: 8px; border-radius: 999px; background: var(--soft); overflow: hidden; }
        .bo-progress i { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg,#FB923C,#EA580C); transition: width .3s; }
        .bo-pay {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 15px;
          font: 800 15px "Manrope", sans-serif; color: #fff; background: linear-gradient(135deg,#F97316,#EA580C);
          box-shadow: 0 10px 24px rgba(234,88,12,.35); transition: transform .15s, opacity .2s;
        }
        .bo-root[data-theme="dark"] .bo-pay, .bo-modal[data-theme="dark"] .bo-pay { color: #1C1006; background: linear-gradient(135deg,#FDBA74,#F97316); }
        .bo-pay:active:not(:disabled) { transform: scale(.98); }
        .bo-pay:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
        .bo-err { margin: 10px 0 0; padding: 9px 12px; border-radius: 10px; background: var(--err-bg); color: var(--err); font-size: 12.5px; font-weight: 600; }
        .bo-secure { display: flex; flex-wrap: wrap; gap: 6px 14px; justify-content: center; margin-top: 12px; font-size: 11.5px; font-weight: 600; color: var(--muted); }
        .bo-secure span { display: inline-flex; align-items: center; gap: 5px; }
        .bo-secure svg { color: var(--ok); }

        /* picker modal */
        .bo-overlay {
          position: fixed; inset: 0; z-index: 1000; display: flex; align-items: flex-end; justify-content: center;
          background: rgba(35,26,18,.55); backdrop-filter: blur(3px);
        }
        @media (min-width: 720px) { .bo-overlay { align-items: center; padding: 24px; } }
        .bo-modal {
          --bg: #FFF8F0; --surface: #FFFFFF; --alt: #FFEFDC; --soft: #FFE4C7; --text: #231A12; --muted: #6B5846; --subtle: #A08C79;
          --border: #F3DCC2; --accent: #EA580C; --accent-2: #F97316; --ok: #15803D; --err: #B91C1C; --err-bg: #FEE2E2;
          display: flex; flex-direction: column; width: 100%; max-width: 980px; max-height: 94vh; overflow: hidden;
          border-radius: 26px 26px 0 0; background: var(--bg); color: var(--text); font-family: "DM Sans", sans-serif; box-shadow: 0 30px 80px rgba(0,0,0,.4);
        }
        .bo-modal[data-theme="dark"] {
          --bg: #1A1511; --surface: #241D17; --alt: #2C231B; --soft: #3A2A1D; --text: #FBF5EE; --muted: #C2B3A4; --subtle: #8E7F70;
          --border: #3A2F26; --accent: #FB923C; --ok: #4ADE80; --err: #FCA5A5; --err-bg: rgba(127,29,29,.3); color-scheme: dark;
        }
        .bo-modal *, .bo-modal *::before, .bo-modal *::after { box-sizing: border-box; }
        .bo-modal button { font: inherit; cursor: pointer; color: inherit; }
        .bo-modal h2 { margin: 0; font: 800 20px "Manrope", sans-serif; letter-spacing: -.02em; }
        .bo-modal ul { list-style: none; margin: 0; padding: 0; }
        @media (min-width: 720px) { .bo-modal { border-radius: 26px; max-height: 90vh; } }
        .bo-modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 18px 20px 14px; border-bottom: 1px solid var(--border); background: linear-gradient(135deg, var(--alt), var(--bg)); }
        .bo-modal-kicker { margin: 0 0 4px; font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }
        .bo-modal-sub { margin: 4px 0 0; font-size: 12.5px; font-weight: 600; color: var(--muted); }
        .bo-modal-x { flex-shrink: 0; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid var(--border); background: var(--surface); }
        .bo-modal-body { flex: 1; overflow-y: auto; padding: 16px 20px 8px; -webkit-overflow-scrolling: touch; }
        .bo-modal .bo-grid { margin-top: 14px; padding-bottom: 8px; }
        .bo-all-note { display: flex; align-items: center; gap: 8px; margin: 0; padding: 10px 14px; border-radius: 12px; background: var(--soft); color: var(--accent); font-size: 13px; font-weight: 700; }
        .bo-modal-foot { padding: 12px 20px max(16px, env(safe-area-inset-bottom)); border-top: 1px solid var(--border); background: var(--surface); }
        .bo-foot-row { display: flex; align-items: center; gap: 14px; margin-top: 10px; }
        .bo-foot-info { flex: 1; min-width: 0; }
        .bo-foot-info .bo-hint { margin: 0; font-size: 12.5px; font-weight: 700; color: var(--accent); }
        .bo-foot-price { display: flex; align-items: baseline; flex-wrap: wrap; gap: 4px 8px; margin: 4px 0 0; }
        .bo-foot-price b { font: 800 22px "Manrope", sans-serif; }
        .bo-foot-price s { font-size: 12px; color: var(--subtle); }
        .bo-foot-price span { font-size: 12px; font-weight: 600; color: var(--muted); }
        .bo-modal .bo-pay { width: auto; margin: 0; height: 50px; padding: 0 26px; flex-shrink: 0; }
        @media (max-width: 520px) { .bo-modal .bo-pay { padding: 0 18px; } .bo-modal-head h2 { font-size: 18px; } }
        .bo-book[data-readonly] { cursor: default; }
        .bo-book[data-readonly]:disabled { opacity: 1; }
        .bo-book[data-readonly]:hover { transform: none; }

        /* how + faq */
        .bo-section { margin-top: 46px; }
        .bo-section > h2 { font-size: clamp(22px, 3.5vw, 30px); font-weight: 800; }
        .bo-how { display: grid; gap: 12px; margin-top: 16px; grid-template-columns: 1fr; }
        @media (min-width: 720px) { .bo-how { grid-template-columns: repeat(3, 1fr); } }
        .bo-how li { padding: 18px; border-radius: 18px; border: 1.5px solid var(--border); background: var(--surface); }
        .bo-how li > span { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 12px; background: var(--soft); color: var(--accent); }
        .bo-how h3 { margin-top: 12px; font-size: 16px; font-weight: 800; }
        .bo-how p { margin: 6px 0 0; font-size: 13.5px; line-height: 1.65; color: var(--muted); }
        .bo-faq { display: grid; gap: 10px; margin-top: 16px; max-width: 860px; }
        .bo-faq-item { border-radius: 16px; border: 1.5px solid var(--border); background: var(--surface); overflow: hidden; }
        .bo-faq-item[data-open="true"] { border-color: var(--accent-2); }
        .bo-faq-item button {
          display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; padding: 16px 18px; border: 0;
          background: transparent; text-align: left; font: 700 14.5px "Manrope", sans-serif;
        }
        .bo-faq-item button svg { flex-shrink: 0; color: var(--accent); transition: transform .25s; }
        .bo-faq-item[data-open="true"] button svg { transform: rotate(180deg); }
        .bo-faq-item p { margin: 0; padding: 0 18px 16px; font-size: 13.5px; line-height: 1.75; color: var(--muted); }

        .bo-state { display: grid; place-items: center; gap: 10px; padding: 70px 0; text-align: center; color: var(--muted); }
        .bo-skel { height: 130px; border-radius: 18px; background: linear-gradient(90deg, var(--alt), var(--soft), var(--alt)); background-size: 200% 100%; animation: bo-sh 1.4s infinite; }
        @keyframes bo-sh { to { background-position: -200% 0; } }
        @media (prefers-reduced-motion: reduce) { .bo-root * { animation: none !important; transition: none !important; } }
      `}</style>

      <div className="bo-shell">
        <nav className="bo-crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link> / <Link to="/books">Books</Link> / <span>Bundle offers</span>
        </nav>

        <header className="bo-hero">
          <div className="bo-hero-copy">
            <span className="bo-kicker">
              <Sparkles size={13} /> Bundle offers
            </span>
            <h1>
              Build your own ebook bundle and <em>save more</em>
            </h1>
            <p>
              Pick the books you need for college placement, system design, cloud or interviews. Your
              offer price is applied automatically. Pay once and download everything instantly.
            </p>

            <div className="bo-hero-cta">
              <a href="#bo-offers-h" className="bo-hero-btn">
                See running offers <ArrowRight size={16} />
              </a>
              <Link to="/books" className="bo-hero-link">Browse single books</Link>
            </div>

            <div className="bo-trust">
              <span><Zap size={15} /> Instant access</span>
              <span><ShieldCheck size={15} /> Secure payment</span>
              <span><BadgeCheck size={15} /> One order, many books</span>
            </div>
          </div>

          {heroCovers.length > 0 && (
            <div className="bo-hero-art" aria-hidden="true">
              {heroCovers.map((b, i) => (
                <img key={b._id} src={b.coverPageUrl} alt="" className={`bo-fan bo-fan-${i}`} loading="eager" />
              ))}
              {bestSaving > 0 && (
                <span className="bo-hero-badge">
                  Save up to <b>{bestSaving}%</b>
                </span>
              )}
            </div>
          )}
        </header>

        {!loading && offers.length > 0 && (
          <dl className="bo-stats">
            <div><dt>Running offers</dt><dd>{offers.filter((o) => o.available).length}</dd></div>
            <div><dt>Books you can bundle</dt><dd>{totalBooks}</dd></div>
            <div><dt>Biggest saving</dt><dd>{bestSaving ? `${bestSaving}%` : "-"}</dd></div>
          </dl>
        )}

        {loading && (
          <div className="bo-layout" aria-busy="true">
            <div style={{ display: "grid", gap: 12 }}>
              <div className="bo-skel" />
              <div className="bo-skel" />
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="bo-state" role="alert">
            <p>{error}</p>
            <button className="bo-btn-soft" onClick={() => load()}>Try again</button>
          </div>
        )}

        {!loading && !error && offers.length === 0 && (
          <div className="bo-state">
            <p><b>No bundle offers are running right now.</b></p>
            <Link className="bo-btn-soft" style={{ display: "inline-grid", placeItems: "center" }} to="/books">
              Browse all books
            </Link>
          </div>
        )}

        {!loading && offers.length > 0 && (
          <section className="bo-step" aria-labelledby="bo-offers-h" style={{ marginTop: 30 }}>
            <div className="bo-step-head">
              <div>
                <h2 id="bo-offers-h">Running offers</h2>
                <p>Choose an offer, then pick your books. The price is checked again before you pay.</p>
              </div>
            </div>

            <ul className="bo-offers">
              {offers.map((o) => {
                const left = daysLeft(o.endsAt);
                const short = Math.max(0, o.minBooks - o.eligibleCount);
                const all = o.selectionMode === "ALL";
                const d = describeOffer(o, o.eligibleCount);
                const saving = estimateSaving(o, o.books);
                return (
                  <li key={o._id}>
                    <article className="bo-offer" data-off={!o.available}>
                      <div className="bo-offer-hero">
                        <div className="bo-offer-top">
                          <span className="bo-offer-badge">
                            {offerIcon(o)}
                            {o.badge || (all ? "All books" : "Bundle deal")}
                          </span>
                          {left && <span className="bo-offer-left"><Clock size={12} /> {left}</span>}
                        </div>

                        <p className="bo-offer-big">{d.big}</p>
                        <p className="bo-offer-bigsub">{d.sub}</p>

                        {o.books.length > 0 && (
                          <div className="bo-stack" aria-hidden="true">
                            {o.books.slice(0, 4).map((b, i) =>
                              b.coverPageUrl ? (
                                <img key={b._id} src={b.coverPageUrl} alt="" loading="lazy" style={{ zIndex: 5 - i }} />
                              ) : null
                            )}
                            {o.books.length > 4 && <span>+{o.books.length - 4}</span>}
                          </div>
                        )}
                      </div>

                      <div className="bo-offer-main">
                        <h3>{o.name}</h3>
                        {o.description && <p className="bo-offer-desc">{o.description}</p>}

                        <ul className="bo-offer-facts">
                          <li><Check size={14} /> {d.rule}</li>
                          {d.tiers && d.tiers.map((t) => (
                            <li key={t.minBooks}><Check size={14} /> {t.minBooks}+ books: {t.percent}% off</li>
                          ))}
                          <li><Check size={14} /> {o.eligibleCount} book{o.eligibleCount === 1 ? "" : "s"} available</li>
                          {saving > 0 && !d.tiers && <li><Check size={14} /> Save about {saving}%</li>}
                          {o.spotsLeft !== null && o.spotsLeft !== undefined && (
                            <li className="bo-offer-spots"><Clock size={14} /> Only {o.spotsLeft} spot{o.spotsLeft === 1 ? "" : "s"} left</li>
                          )}
                        </ul>

                        {!o.available ? (
                          <p className="bo-offer-wait">
                            Coming soon: needs {short} more book{short === 1 ? "" : "s"} to be added.
                          </p>
                        ) : (
                          <button type="button" className="bo-offer-cta" onClick={() => startOffer(o)}>
                            {all ? "View books & buy" : "Choose books"} <ArrowRight size={16} />
                          </button>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* SEO content */}
        <section className="bo-section" aria-labelledby="bo-how">
          <h2 id="bo-how">How bundle offers work</h2>
          <ol className="bo-how" style={{ listStyle: "none", padding: 0 }}>
            <li><span><Tag size={20} /></span><h3>1. Pick an offer</h3><p>Choose a deal such as a flat price for a set number of books, or a percentage off when you buy more.</p></li>
            <li><span><BookOpen size={20} /></span><h3>2. Choose your books</h3><p>Select the ebooks you want from the offer. The price updates live and you see exactly what you save.</p></li>
            <li><span><Mail size={20} /></span><h3>3. Pay once, read now</h3><p>Pay securely, download every book instantly and receive all the PDFs on your email.</p></li>
          </ol>
        </section>

        <section className="bo-section" aria-labelledby="bo-faq">
          <h2 id="bo-faq">Frequently asked questions</h2>
          <div className="bo-faq">
            {FAQ.map((f, i) => (
              <div className="bo-faq-item" key={f.q} data-open={openFaq === i}>
                <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {f.q}
                  <ChevronDown size={18} />
                </button>
                {openFaq === i && <p>{f.a}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>

      {open && offer && (
        <div className="bo-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && !product && closePicker()}>
          <div className="bo-modal" role="dialog" aria-modal="true" aria-labelledby="bo-modal-h" data-theme={theme}>
            <div className="bo-modal-head">
              <div style={{ minWidth: 0 }}>
                <p className="bo-modal-kicker">{offer.badge || describeOffer(offer, offer.eligibleCount).big}</p>
                <h2 id="bo-modal-h">{offer.name}</h2>
                <p className="bo-modal-sub">{describeOffer(offer, offer.eligibleCount).line} · {describeOffer(offer, offer.eligibleCount).rule}</p>
              </div>
              <button type="button" className="bo-modal-x" onClick={closePicker} aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="bo-modal-body">
              {offer.selectionMode !== "ALL" && (
                <>
                  <div className="bo-toolbar">
                    <div className="bo-search">
                      <Search size={17} />
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search books in this offer"
                        aria-label="Search books"
                      />
                      {query && (
                        <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                    <button type="button" className="bo-btn-soft" onClick={autoPick}>
                      Pick {Math.min(offer.minBooks, offer.books.length)} for me
                    </button>
                    {picked.length > 0 && (
                      <button type="button" className="bo-btn-soft bo-btn-ghost" onClick={() => setPicked([])}>
                        Clear
                      </button>
                    )}
                  </div>

                  {tagOptions.length > 1 && (
                    <div className="bo-chips" role="group" aria-label="Filter by tag">
                      <button type="button" className="bo-chip" aria-pressed={!tag} onClick={() => setTag("")}>All</button>
                      {tagOptions.map((t) => (
                        <button
                          key={t.key}
                          type="button"
                          className="bo-chip"
                          aria-pressed={tag === t.key}
                          onClick={() => setTag(tag === t.key ? "" : t.key)}
                        >
                          #{t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}

              {offer.selectionMode === "ALL" && (
                <p className="bo-all-note">
                  <Check size={15} /> All {offer.books.length} books below are included in this offer.
                </p>
              )}

              {visibleBooks.length > 0 ? (
                <ul className="bo-grid">
                  {visibleBooks.map((b) => (
                    <BookTile
                      key={b._id}
                      book={b}
                      selected={picked.includes(b._id)}
                      locked={atMax || offer.selectionMode === "ALL"}
                      readOnly={offer.selectionMode === "ALL"}
                      free={freeSet.has(b._id)}
                      onToggle={() => toggle(b._id)}
                    />
                  ))}
                </ul>
              ) : (
                <p className="bo-empty">No books match your search.</p>
              )}
            </div>

            <div className="bo-modal-foot">
              <div className="bo-progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>

              <div className="bo-foot-row">
                <div className="bo-foot-info">
                  <p className="bo-hint" data-tone={hint?.tone} aria-live="polite">
                    {hint?.text}
                  </p>
                  <p className="bo-foot-price">
                    <b>{money(price.final)}</b>
                    {price.ready && <s>{money(price.original)}</s>}
                    <span>
                      {price.count}
                      {offer.selectionMode === "ALL" ? "" : `/${offer.maxBooks === offer.minBooks ? offer.minBooks : `${offer.minBooks}+`}`} book
                      {price.count === 1 ? "" : "s"}
                    </span>
                  </p>
                </div>

                <button type="button" className="bo-pay" onClick={pay} disabled={!price.ready || busy}>
                  {busy ? <Loader2 size={18} className="animate-spin" /> : <>Pay {price.ready ? money(price.final) : ""} <ArrowRight size={17} /></>}
                </button>
              </div>

              {payError && <p className="bo-err" role="alert">{payError}</p>}

              <div className="bo-secure">
                <span><ShieldCheck size={14} /> Secure checkout</span>
                <span><Zap size={14} /> Instant access</span>
                <span><Check size={14} /> Price verified by our server</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <PayUCheckoutModal isOpen={Boolean(product)} onClose={() => setProduct(null)} product={product} />
    </div>
  );
}
