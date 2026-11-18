import { useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  Clock,
  Cloud,
  Coffee,
  Cpu,
  Database,
  Gift,
  GraduationCap,
  Layers,
  Loader2,
  Mail,
  Percent,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  TrendingUp,
  TriangleAlert,
  Wallet,
  X,
  Zap,
} from "lucide-react";

import BASE_URL from "../utils/Url";
import { describeOffer, estimateSaving, pickHint, priceSelection } from "./bundleRules";
import PayUCheckoutModal from "../payment/PayUCheckoutModal";
import "./bundle.css";

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
const FONTS =
  "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,600;12..96,700;12..96,800&family=Geist+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap";

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

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
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
  o.type === "FREE_BOOKS" ? (
    <Gift size={size} aria-hidden />
  ) : o.type === "FIXED_PRICE" || o.type === "PER_BOOK_PRICE" ? (
    <Tag size={size} aria-hidden />
  ) : (
    <Percent size={size} aria-hidden />
  );

function daysLeft(endsAt) {
  if (!endsAt) return null;
  const ms = new Date(endsAt).getTime() - Date.now();
  if (ms <= 0) return null;
  const d = Math.ceil(ms / 86400000);
  return d <= 7 ? `${d} day${d === 1 ? "" : "s"} left` : null;
}

/* =====================================================
   STATIC CONTENT (rendered on the server too, for SEO / AEO / GEO)
===================================================== */

const STEPS = [
  { Icon: Tag, title: "Pick a running offer", text: "Each offer card shows the deal, the rule (how many books) and how many books you can choose from." },
  { Icon: BookOpen, title: "Choose your books", text: "Tap the ebooks you want. Search or filter by topic, or let us pick for you. The price updates live." },
  { Icon: Receipt, title: "See the exact saving", text: "Before paying you see the original total, the offer price and how much you save. Our server checks it again." },
  { Icon: Mail, title: "Pay once, read now", text: "Pay with UPI, card or net banking. Every book opens on the success page and all PDFs reach your email." },
];

const OFFER_TYPES = [
  {
    Icon: Tag,
    title: "Fixed bundle price",
    text: "Any set number of books for one flat price, whatever they cost on their own.",
    math: (
      <>
        3 books <s>₹897</s> → <b>₹499</b>
        <br />
        You save ₹398 (44%)
      </>
    ),
  },
  {
    Icon: Percent,
    title: "Percentage off",
    text: "A fixed percentage off the total when you pick at least the minimum number of books.",
    math: (
      <>
        4 books <s>₹1,196</s> − 30%
        <br />
        Pay <b>₹837</b>, save ₹359
      </>
    ),
  },
  {
    Icon: Wallet,
    title: "Flat amount off",
    text: "A fixed rupee amount taken off your bundle total once you reach the minimum.",
    math: (
      <>
        3 books <s>₹897</s> − ₹200
        <br />
        Pay <b>₹697</b>
      </>
    ),
  },
  {
    Icon: Layers,
    title: "Per-book price",
    text: "Every book in the bundle costs the same low price, so bigger bundles stay simple.",
    math: (
      <>
        5 books × <b>₹149</b> each
        <br />
        Pay <b>₹745</b> instead of <s>₹1,495</s>
      </>
    ),
  },
  {
    Icon: Gift,
    title: "Buy X, get Y free",
    text: "Pick the required number of books and the cheapest ones in your bundle are free.",
    math: (
      <>
        Buy 2, get 1 free
        <br />
        ₹299 + ₹299 + <s>₹249</s> → <b>₹598</b>
      </>
    ),
  },
  {
    Icon: TrendingUp,
    title: "More books, bigger discount",
    text: "Tiered offers: the discount grows as you add books to the same bundle.",
    math: (
      <>
        2+ books: <b>10% off</b>
        <br />
        4+ books: <b>25% off</b> · 6+ books: <b>40% off</b>
      </>
    ),
  },
];

const IDEAS = [
  {
    Icon: Layers,
    title: "System design interviews",
    who: "SDE 2, senior and backend engineers",
    text: "High-level and low-level design together, so you can answer both the architecture round and the machine-coding round.",
    books: [
      ["System Design HLD", "/book/system-design/hld"],
      ["Java LLD: patterns & case studies", "/book/system-design/lld"],
      ["SQL & Database Interview Handbook", "/book/database/sql"],
    ],
  },
  {
    Icon: Coffee,
    title: "Java backend developer",
    who: "Freshers to 5 years, product and service companies",
    text: "Core Java, Spring Boot and databases: the three topics that come up in almost every Java backend interview.",
    books: [
      ["Java Interview Handbook", "/book/java-interview-handbook"],
      ["Spring Boot Interview Handbook", "/book/springboot-interview-handbook"],
      ["SQL & Database Interview Handbook", "/book/database/sql"],
    ],
  },
  {
    Icon: GraduationCap,
    title: "College placements",
    who: "Final-year students and freshers",
    text: "The CS fundamentals that campus interviews test, plus one language book to practise with.",
    books: [
      ["Operating Systems", "/books/operating-systems"],
      ["Computer Networks", "/book/computer-network"],
      ["Java language book", "/book/language/java"],
    ],
  },
  {
    Icon: Cloud,
    title: "Cloud engineer",
    who: "DevOps, cloud and platform roles",
    text: "AWS and Google Cloud side by side, so you can compare services and prepare for either platform.",
    books: [
      ["AWS: The Complete Cloud Engineer's Handbook", "/book/cloud/aws"],
      ["Google Cloud (GCP) Engineer's Handbook", "/book/cloud/gcp"],
    ],
  },
  {
    Icon: Brain,
    title: "GenAI and AI agents",
    who: "Developers building with LLMs",
    text: "Retrieval, tool use and agent frameworks: the building blocks of modern AI applications.",
    books: [
      ["RAG ebook", "/book/genai/rag"],
      ["MCP ebook", "/book/genai/mcp"],
      ["Google ADK Handbook", "/book/genai/google-adk"],
    ],
  },
  {
    Icon: Database,
    title: "Data and databases",
    who: "Backend, data and analytics roles",
    text: "SQL depth plus how databases fit into large systems, for interviews that go beyond queries.",
    books: [
      ["SQL & Database Interview Handbook", "/book/database/sql"],
      ["System Design HLD", "/book/system-design/hld"],
    ],
  },
];

const FAQ = [
  {
    q: "What is a bundle offer on Target Trek?",
    a: "A bundle offer lets you buy several Target Trek ebooks together in one order at a lower price than buying them one by one. You choose an offer, pick the books you want from it, and the discount is applied automatically before you pay.",
  },
  {
    q: "How much can I save with an ebook bundle?",
    a: "It depends on the offer and the books you pick. Every offer card shows its deal, and the picker shows the original total, the bundle price and your exact saving in rupees and percent before you pay.",
  },
  {
    q: "Can I choose which books go in my bundle?",
    a: "Yes, for most offers. You pick any books from the offer's list until you reach the required number. Some offers include every listed book, and those say \"All books\" on the card.",
  },
  {
    q: "How do I get my books after paying?",
    a: "Right after payment you land on the success page with a download link for every book in the bundle. All the PDFs are also emailed to the address you used at checkout.",
  },
  {
    q: "Can I use a coupon code with a bundle offer?",
    a: "No. Bundle offers already include the discount, so coupon codes can't be combined with them.",
  },
  {
    q: "Which payment methods can I use?",
    a: "UPI, debit and credit cards, net banking and wallets, through our secure payment gateway. We never see or store your card or UPI details.",
  },
  {
    q: "Is a bundle cheaper than buying books one by one?",
    a: "Yes. A bundle is only allowed to go through when it costs less than the books' normal prices added together. If a set of books would not save you money, the picker tells you and you can choose different books.",
  },
  {
    q: "What is the difference between a bundle and All Access?",
    a: "A bundle is a set of books you choose, at a discount, in one payment. All Access gives you the full Target Trek library in one purchase. If you only need a few topics, a bundle is usually the better value.",
  },
  {
    q: "Can I get a refund on a bundle?",
    a: "Bundle purchases are final, like every Target Trek ebook. Refunds are made only for double payments or genuine payment or delivery issues. Email supporttargettrek@gmail.com with your payment details.",
  },
  {
    q: "I paid but didn't get the email. What do I do?",
    a: "Check your spam or promotions folder first. Your download link on the success page keeps working for 24 hours. If you still can't find your books, email supporttargettrek@gmail.com and we will resend them.",
  },
];

const QUICK_ANSWER =
  "Target Trek bundle offers let you buy two or more programming and interview-preparation ebooks in a single order at a discount. Pick a running offer, choose the books you want (system design, Java, Spring Boot, SQL, cloud, GenAI or CS fundamentals), and the bundle price is applied automatically. You pay once with UPI, card or net banking and get every PDF instantly on screen and by email.";

/* =====================================================
   PIECES
===================================================== */

function BookTile({ book, selected, locked, readOnly, free, onToggle }) {
  const off = book.mrp > book.price ? Math.round(((book.mrp - book.price) / book.mrp) * 100) : 0;
  return (
    <li className="bn-cell">
      <button
        type="button"
        className="bn-book"
        aria-pressed={selected}
        aria-label={`${book.title}, ${money(book.price)}${selected ? ", selected" : ""}`}
        disabled={(locked && !selected) || readOnly}
        data-readonly={readOnly || undefined}
        onClick={onToggle}
      >
        {free && <span className="bn-free">FREE</span>}
        <span className="bn-tick" aria-hidden>
          <Check size={14} strokeWidth={3.5} />
        </span>
        <span className="bn-cover">
          {book.coverPageUrl ? (
            <img src={book.coverPageUrl} alt="" loading="lazy" width="150" height="200" />
          ) : (
            <BookOpen size={30} aria-hidden />
          )}
        </span>
        <span className="bn-book-title">{book.title}</span>
        <span className="bn-book-price">
          <b>{money(book.price)}</b>
          {off > 0 && <s>{money(book.mrp)}</s>}
        </span>
      </button>
      {book.redirectUrl && (
        <Link className="bn-peek" to={book.redirectUrl} target="_blank" rel="noopener">
          View details
        </Link>
      )}
    </li>
  );
}

function OfferTicket({ o, onStart }) {
  const left = daysLeft(o.endsAt);
  const short = Math.max(0, o.minBooks - o.eligibleCount);
  const all = o.selectionMode === "ALL";
  const d = describeOffer(o, o.eligibleCount);
  const saving = estimateSaving(o, o.books);
  const spots = o.spotsLeft !== null && o.spotsLeft !== undefined;

  return (
    <li>
      <article className="bn-ticket" data-off={!o.available} aria-labelledby={`offer-${o._id}`}>
        <div className="bn-stub">
          <div className="bn-stub-top">
            <span className="bn-badge">
              {offerIcon(o)}
              {o.badge || (all ? "All books" : "Bundle deal")}
            </span>
            {left && (
              <span className="bn-badge time">
                <Clock size={12} aria-hidden /> {left}
              </span>
            )}
          </div>
          <p className="bn-big">{d.big}</p>
          <p className="bn-big-sub">{d.sub}</p>
          {o.books.length > 0 && (
            <div className="bn-stack" aria-hidden>
              {o.books
                .filter((b) => b.coverPageUrl)
                .slice(0, 4)
                .map((b) => (
                  <img key={b._id} src={b.coverPageUrl} alt="" loading="lazy" />
                ))}
              {o.books.length > 4 && <span>+{o.books.length - 4}</span>}
            </div>
          )}
        </div>

        <div className="bn-ticket-main">
          <h3 id={`offer-${o._id}`}>{o.name}</h3>
          {o.description && <p className="bn-ticket-desc">{o.description}</p>}
          <ul className="bn-facts">
            {d.rule && (
              <li>
                <Check size={15} aria-hidden /> {d.rule}
              </li>
            )}
            {d.tiers?.map((t) => (
              <li key={t.minBooks}>
                <Check size={15} aria-hidden /> {t.minBooks}+ books: {t.percent}% off
              </li>
            ))}
            <li>
              <Check size={15} aria-hidden /> {o.eligibleCount} book{o.eligibleCount === 1 ? "" : "s"} to choose from
            </li>
            <li>
              <Check size={15} aria-hidden /> Instant download + PDFs on email
            </li>
            {spots && (
              <li className="warn">
                <Clock size={15} aria-hidden /> Only {o.spotsLeft} spot{o.spotsLeft === 1 ? "" : "s"} left
              </li>
            )}
          </ul>

          <div className="bn-ticket-foot">
            {!o.available ? (
              <p className="bn-wait">
                Opening soon: {short} more book{short === 1 ? "" : "s"} to be added.
              </p>
            ) : (
              <>
                {saving > 0 && !d.tiers ? (
                  <span className="bn-save">
                    Save about <b>{saving}%</b>
                  </span>
                ) : (
                  <span />
                )}
                <button type="button" className="bn-btn bn-btn-primary bn-btn-block-xs" onClick={() => onStart(o)}>
                  {all ? "View books & buy" : "Choose your books"}
                  <ArrowRight size={17} aria-hidden />
                </button>
              </>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function BundleOffers() {
  const [theme, setTheme] = useState(readTheme);
  const [params, setParams] = useSearchParams();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [offerId, setOfferId] = useState(null);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState([]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");

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
      if (e.key === "Escape" && !product) closePicker();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  const offer = useMemo(() => offers.find((o) => o._id === offerId) || null, [offers, offerId]);
  const bookMap = useMemo(() => new Map((offer?.books || []).map((b) => [b._id, b])), [offer]);
  const pickedBooks = useMemo(() => picked.map((id) => bookMap.get(id)).filter(Boolean), [picked, bookMap]);
  const price = useMemo(() => priceFor(offer, pickedBooks), [offer, pickedBooks]);

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
      const okTag = !tag || (b.tags || []).some((t) => String(t).trim().toLowerCase() === tag);
      const okQuery = !q || [b.title, b.subtitle, b.category, ...(b.tags || [])].join(" ").toLowerCase().includes(q);
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

  /* ---- live numbers ---- */
  const liveOffers = useMemo(() => offers.filter((o) => o.available), [offers]);

  const allBooks = useMemo(() => {
    const seen = new Map();
    for (const o of offers) for (const b of o.books) if (!seen.has(b._id)) seen.set(b._id, b);
    return [...seen.values()];
  }, [offers]);

  const heroCovers = useMemo(() => allBooks.filter((b) => b.coverPageUrl).slice(0, 4), [allBooks]);

  const bestSaving = useMemo(() => {
    let best = 0;
    for (const o of offers) best = Math.max(best, estimateSaving(o, o.books));
    return best;
  }, [offers]);

  /* the hero receipt shows a real offer when one is running, otherwise a worked example */
  const receipt = useMemo(() => {
    for (const o of liveOffers) {
      if (o.selectionMode === "ALL" || o.type === "TIERED_PERCENT") continue;
      const books = [...o.books].sort((a, b) => b.price - a.price).slice(0, o.minBooks);
      if (books.length < o.minBooks) continue;
      const r = priceSelection(o, books);
      if (r?.ok) return { title: o.name, count: books.length, original: r.originalAmount, final: r.finalAmount, percent: r.savingsPercent, live: true };
    }
    return { title: "Example bundle", count: 3, original: 897, final: 499, percent: 44, live: false };
  }, [liveOffers]);

  /* ---- SEO / AEO / GEO ---- */
  const seoTitle = "Ebook Bundle Offers: Buy Multiple Books & Save | Target Trek";
  const seoDescription = liveOffers.length
    ? `Build your own ebook bundle on Target Trek. ${liveOffers
        .slice(0, 3)
        .map((o) => describeOffer(o, o.eligibleCount).line)
        .join(", ")}. System design, Java, Spring Boot, SQL, cloud and GenAI books. Instant PDF download.`
    : "Build your own ebook bundle on Target Trek and save. Pick system design, Java, Spring Boot, SQL, AWS, GCP and GenAI ebooks, pay once and download every PDF instantly.";
  const cover = heroCovers[0]?.coverPageUrl;

  const structuredData = useMemo(() => {
    const org = { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Target Trek", url: SITE_URL, email: "supporttargettrek@gmail.com" };
    const graph = [
      org,
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": `${PAGE_URL}#webpage`,
        url: PAGE_URL,
        name: "Ebook Bundle Offers",
        headline: seoTitle,
        description: seoDescription,
        inLanguage: "en-IN",
        isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: "Target Trek", url: SITE_URL },
        publisher: { "@id": `${SITE_URL}/#organization` },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
        about: ["Programming ebooks", "Interview preparation", "System design", "Java", "Cloud computing", "Generative AI"],
        speakable: { "@type": "SpeakableSpecification", cssSelector: ["#bn-answer-h", "#bn-answer-text"] },
        ...(cover ? { primaryImageOfPage: { "@type": "ImageObject", url: cover } } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Books", item: `${SITE_URL}/books` },
          { "@type": "ListItem", position: 3, name: "Bundle offers", item: PAGE_URL },
        ],
      },
      {
        "@type": "HowTo",
        "@id": `${PAGE_URL}#howto`,
        name: "How to buy an ebook bundle on Target Trek",
        description: "Pick an offer, choose your books, check the saving and pay once.",
        totalTime: "PT3M",
        step: STEPS.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.text, url: `${PAGE_URL}#how` })),
      },
      {
        "@type": "FAQPage",
        "@id": `${PAGE_URL}#faq`,
        mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ];

    if (liveOffers.length) {
      graph.push({
        "@type": "OfferCatalog",
        "@id": `${PAGE_URL}#offers`,
        name: "Target Trek ebook bundle offers",
        numberOfItems: liveOffers.length,
        itemListElement: liveOffers.map((o) => {
          const d = describeOffer(o, o.eligibleCount);
          return {
            "@type": "Offer",
            name: o.name,
            description: o.description || `${d.line}. ${d.rule}.`,
            priceCurrency: "INR",
            url: `${PAGE_URL}?offer=${o.slug}`,
            seller: { "@id": `${SITE_URL}/#organization` },
            category: "Ebook bundle",
            ...(o.type === "FIXED_PRICE" ? { price: String(o.fixedPrice) } : {}),
            ...(o.endsAt ? { priceValidUntil: String(o.endsAt).slice(0, 10) } : {}),
            availability:
              o.spotsLeft !== null && o.spotsLeft !== undefined
                ? o.spotsLeft > 0
                  ? "https://schema.org/LimitedAvailability"
                  : "https://schema.org/SoldOut"
                : "https://schema.org/InStock",
            itemOffered: o.books.slice(0, 30).map((b) => ({
              "@type": "Book",
              name: b.title,
              bookFormat: "https://schema.org/EBook",
              ...(b.coverPageUrl ? { image: b.coverPageUrl } : {}),
              ...(b.redirectUrl ? { url: `${SITE_URL}${b.redirectUrl}` } : {}),
              offers: { "@type": "Offer", price: String(b.price), priceCurrency: "INR" },
            })),
          };
        }),
      });
    }
    return { "@context": "https://schema.org", "@graph": graph };
  }, [liveOffers, seoDescription, cover]);

  /* ------------------------------ render ------------------------------ */

  const d = offer ? describeOffer(offer, offer.eligibleCount) : null;

  return (
    <div className="bn" data-theme={theme}>
      <Helmet>
        <html lang="en" />
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content="ebook bundle offers, buy multiple ebooks discount, interview preparation ebook bundle, system design ebook bundle, Java Spring Boot ebooks, SQL interview book, AWS GCP ebooks, GenAI ebooks, college placement books, Target Trek bundle"
        />
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:site_name" content="Target Trek" />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={PAGE_URL} />
        {cover && <meta property="og:image" content={cover} />}
        {cover && <meta property="og:image:alt" content="Target Trek ebook bundle" />}
        <meta name="twitter:card" content={cover ? "summary_large_image" : "summary"} />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        {cover && <meta name="twitter:image" content={cover} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="bn-wrap">
        <nav className="bn-crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <ChevronRight size={14} aria-hidden />
          <Link to="/books">Books</Link>
          <ChevronRight size={14} aria-hidden />
          <span aria-current="page">Bundle offers</span>
        </nav>

        {/* ================= HERO ================= */}
        <header className="bn-hero">
          <div>
            <span className="bn-pill">
              <i aria-hidden />
              {liveOffers.length ? `${liveOffers.length} offer${liveOffers.length === 1 ? "" : "s"} running now` : "Ebook bundle offers"}
            </span>
            <h1 className="bn-h1">
              Build your own ebook bundle. <span className="bn-mark">Pay less</span> for every book.
            </h1>
            <p className="bn-hero-lead">
              Pick the books you need for interviews, placements, system design, cloud or GenAI. The bundle price is applied
              automatically, you pay once, and every PDF is yours instantly.
            </p>
            <div className="bn-hero-cta">
              <a href="#offers" className="bn-btn bn-btn-glow bn-btn-lg bn-btn-block-xs">
                See running offers <ArrowRight size={18} aria-hidden />
              </a>
              <a href="#how" className="bn-btn bn-btn-line bn-btn-lg bn-btn-block-xs">
                How it works
              </a>
            </div>
            <div className="bn-trust">
              <span><Zap size={15} aria-hidden /> Instant download</span>
              <span><Mail size={15} aria-hidden /> PDFs on email</span>
              <span><ShieldCheck size={15} aria-hidden /> Secure UPI & card payment</span>
            </div>
          </div>

          <div className="bn-art" aria-hidden>
            <div className="bn-fan">
              {heroCovers.length >= 4
                ? heroCovers.map((b) => <img key={b._id} src={b.coverPageUrl} alt="" loading="eager" />)
                : ["System Design", "Java", "Cloud", "GenAI"].map((t) => (
                    <span key={t} className="bn-spine">{t}</span>
                  ))}
            </div>
            <div className="bn-receipt">
              <div className="bn-receipt-h">
                <span>{receipt.live ? "Live offer" : "Example"}</span>
                <span>#BUNDLE</span>
              </div>
              <div className="bn-receipt-row">
                <span>{receipt.count} ebooks</span>
                <span>×{receipt.count}</span>
              </div>
              <div className="bn-receipt-row strike">
                <span>Bought one by one</span>
                <span>{money(receipt.original)}</span>
              </div>
              <div className="bn-receipt-row">
                <span>Bundle saving</span>
                <span>−{money(receipt.original - receipt.final)}</span>
              </div>
              <div className="bn-receipt-row total">
                <span>You pay</span>
                <span>{money(receipt.final)}</span>
              </div>
            </div>
            <span className="bn-stamp">
              {bestSaving > 0 ? (
                <span>
                  Save up to
                  <b>{bestSaving}%</b>
                </span>
              ) : (
                <span>
                  Bundle
                  <b>& save</b>
                </span>
              )}
            </span>
          </div>
        </header>

        {!loading && offers.length > 0 && (
          <dl className="bn-stats" aria-label="Live offer numbers">
            <div>
              <dt>Running offers</dt>
              <dd>{liveOffers.length}</dd>
            </div>
            <div>
              <dt>Books you can bundle</dt>
              <dd>{allBooks.length}</dd>
            </div>
            <div>
              <dt>Biggest saving</dt>
              <dd>{bestSaving ? `${bestSaving}%` : "-"}</dd>
            </div>
          </dl>
        )}
      </div>

      {/* ================= OFFERS ================= */}
      <section id="offers" className="bn-sec" aria-labelledby="bn-offers-h">
        <div className="bn-wrap">
          <div className="bn-sec-head row">
            <div>
              <span className="bn-eyebrow">Step 1 · Pick a deal</span>
              <h2 id="bn-offers-h" className="bn-h2">
                Running <span className="bn-mark">bundle offers</span>
              </h2>
              <p className="bn-lead">Choose an offer, then pick your books. The final price is checked again by our server before you pay.</p>
            </div>
            <Link to="/books" className="bn-btn bn-btn-ghost">
              Browse single books <ArrowRight size={16} aria-hidden />
            </Link>
          </div>

          {loading && (
            <div className="bn-offers" aria-busy="true" aria-label="Loading offers">
              <div className="bn-skel" />
              <div className="bn-skel" />
            </div>
          )}

          {!loading && error && (
            <div className="bn-state" role="alert">
              <TriangleAlert size={30} aria-hidden />
              <h3>We couldn&apos;t load the offers</h3>
              <p>{error}</p>
              <div className="bn-row">
                <button type="button" className="bn-btn bn-btn-primary" onClick={() => load()}>
                  Try again
                </button>
                <Link to="/books" className="bn-btn bn-btn-ghost">
                  Browse all books
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && offers.length === 0 && (
            <div className="bn-state">
              <ShoppingBag size={30} aria-hidden />
              <h3>No bundle offers are running right now</h3>
              <p>New offers open regularly. Meanwhile, every ebook is available on its own, or get the whole library with All Access.</p>
              <div className="bn-row">
                <Link to="/books" className="bn-btn bn-btn-primary">
                  Browse all books
                </Link>
                <Link to="/book/all-books" className="bn-btn bn-btn-ghost">
                  See All Access
                </Link>
              </div>
            </div>
          )}

          {!loading && offers.length > 0 && (
            <ul className="bn-offers">
              {offers.map((o) => (
                <OfferTicket key={o._id} o={o} onStart={startOffer} />
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ================= QUICK ANSWER (AEO) ================= */}
      <section className="bn-wrap" aria-labelledby="bn-answer-h">
        <div className="bn-answer">
          <span className="bn-eyebrow">In short</span>
          <h2 id="bn-answer-h">What are Target Trek bundle offers?</h2>
          <p id="bn-answer-text">{QUICK_ANSWER}</p>
          <div className="bn-answer-points">
            <div><b>Who it&apos;s for</b>Students, freshers and engineers preparing for tech interviews.</div>
            <div><b>What you get</b>Several full ebooks (PDF) in one order.</div>
            <div><b>Delivery</b>Instant on screen, plus every PDF by email.</div>
            <div><b>Payment</b>UPI, cards, net banking and wallets, in INR.</div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="bn-sec" aria-labelledby="bn-how-h">
        <div className="bn-wrap">
          <div className="bn-sec-head">
            <span className="bn-eyebrow">How it works</span>
            <h2 id="bn-how-h" className="bn-h2">Four steps, about three minutes</h2>
            <p className="bn-lead">No account juggling, no separate payments. One order holds every book you pick.</p>
          </div>
          <ol className="bn-steps">
            {STEPS.map(({ Icon, title, text }) => (
              <li key={title} className="bn-step">
                <span className="bn-ico"><Icon size={21} aria-hidden /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= OFFER TYPES ================= */}
      <section className="bn-sec bn-sec-tint" aria-labelledby="bn-types-h">
        <div className="bn-wrap">
          <div className="bn-sec-head">
            <span className="bn-eyebrow">Types of offers</span>
            <h2 id="bn-types-h" className="bn-h2">How each kind of bundle saves you money</h2>
            <p className="bn-lead">Offers change from time to time. These are the kinds you&apos;ll see, with a worked example of the maths.</p>
          </div>
          <div className="bn-types">
            {OFFER_TYPES.map(({ Icon, title, text, math }) => (
              <article key={title} className="bn-type">
                <div className="bn-type-top">
                  <span className="bn-ico"><Icon size={20} aria-hidden /></span>
                  <h3>{title}</h3>
                </div>
                <p>{text}</p>
                <p className="bn-math">{math}</p>
              </article>
            ))}
          </div>
          <p className="bn-fine">Prices in the examples are illustrative. The live price of your bundle is always shown before you pay.</p>
        </div>
      </section>

      {/* ================= COMPARE ================= */}
      <section className="bn-sec" aria-labelledby="bn-compare-h">
        <div className="bn-wrap">
          <div className="bn-sec-head">
            <span className="bn-eyebrow">Compare</span>
            <h2 id="bn-compare-h" className="bn-h2">Single book, bundle or All Access?</h2>
            <p className="bn-lead">Pick the option that matches how many topics you need right now.</p>
          </div>
          <div className="bn-compare">
            <table>
              <thead>
                <tr>
                  <th scope="col"><span className="bn-sr">Feature</span></th>
                  <th scope="col">Single ebook</th>
                  <th scope="col" className="hl">Bundle offer</th>
                  <th scope="col">All Access</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Best for", "One topic, one interview", "2 or more topics you choose", "Every topic, the whole library"],
                  ["You choose the books", "Yes, one", "Yes, from the offer", "Everything is included"],
                  ["Price", "The book's price", "Lower than buying separately", "One price for all books"],
                  ["Payments", "One per book", "One for the whole bundle", "One"],
                  ["Delivery", "Instant + email", "Instant + every PDF on email", "Instant access"],
                ].map(([k, a, b, c]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td data-label="Single">{a}</td>
                    <td data-label="Bundle" className="hl">{b}</td>
                    <td data-label="All Access">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="bn-fine">
            Looking for everything? See <Link className="bn-link" to="/book/all-books">All Access</Link>. Need just one topic? Browse{" "}
            <Link className="bn-link" to="/books">all ebooks</Link>.
          </p>
        </div>
      </section>

      {/* ================= BUNDLE IDEAS ================= */}
      <section className="bn-sec bn-sec-tint" aria-labelledby="bn-ideas-h">
        <div className="bn-wrap">
          <div className="bn-sec-head">
            <span className="bn-eyebrow">Bundle ideas</span>
            <h2 id="bn-ideas-h" className="bn-h2">Not sure what to pick? Start with your goal</h2>
            <p className="bn-lead">
              Popular combinations by role. Open a book to read its contents, then add it to any running offer that includes it.
            </p>
          </div>
          <div className="bn-ideas">
            {IDEAS.map(({ Icon, title, who, text, books }) => (
              <article key={title} className="bn-idea">
                <div className="bn-idea-top">
                  <span className="bn-ico"><Icon size={20} aria-hidden /></span>
                  <div>
                    <h3>{title}</h3>
                    <p className="bn-idea-for">{who}</p>
                  </div>
                </div>
                <p>{text}</p>
                <ul>
                  {books.map(([name, to]) => (
                    <li key={to}>
                      <Link to={to}>
                        <BookOpen size={15} aria-hidden />
                        {name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= DELIVERY & POLICY ================= */}
      <section className="bn-sec" aria-labelledby="bn-deliver-h">
        <div className="bn-wrap">
          <div className="bn-sec-head">
            <span className="bn-eyebrow">After you pay</span>
            <h2 id="bn-deliver-h" className="bn-h2">What you get, and when</h2>
          </div>
          <div className="bn-deliver">
            <ul className="bn-checks">
              <li><Zap size={20} aria-hidden /><div><b>Instant access</b>The success page shows a download link for every book in your bundle.</div></li>
              <li><Mail size={20} aria-hidden /><div><b>Every PDF on email</b>All books are sent to the email address you enter at checkout.</div></li>
              <li><Cpu size={20} aria-hidden /><div><b>Read anywhere</b>PDFs work on phone, tablet, laptop and e-readers that open PDF files.</div></li>
              <li><Sparkles size={20} aria-hidden /><div><b>Price checked twice</b>The bundle price is calculated live and confirmed by our server before payment.</div></li>
            </ul>
            <div className="bn-policy">
              <h3><TriangleAlert size={20} aria-hidden /> Good to know before you pay</h3>
              <p>
                <b>Bundle purchases are final.</b> Like every Target Trek ebook, bundles can&apos;t be refunded once paid. We only
                refund a double payment or a genuine payment or delivery issue.
              </p>
              <p>Coupon codes can&apos;t be combined with bundle offers, because the bundle already includes the discount.</p>
              <p>
                Need help? Email <a className="bn-link" href="mailto:supporttargettrek@gmail.com">supporttargettrek@gmail.com</a>. Read the{" "}
                <Link className="bn-link" to="/refund-policy">Refund Policy</Link>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="bn-sec bn-sec-tint" aria-labelledby="bn-faq-h">
        <div className="bn-wrap bn-faq-grid">
          <div className="bn-sec-head" style={{ marginBottom: 0 }}>
            <span className="bn-eyebrow">FAQ</span>
            <h2 id="bn-faq-h" className="bn-h2">Questions about bundle offers</h2>
            <p className="bn-lead">
              Can&apos;t find your answer? Email <a className="bn-link" href="mailto:supporttargettrek@gmail.com">supporttargettrek@gmail.com</a>.
            </p>
          </div>
          <div className="bn-faq">
            {FAQ.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>
                  {f.q}
                  <Plus size={18} aria-hidden />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bn-sec" aria-labelledby="bn-final-h">
        <div className="bn-wrap">
          <div className="bn-final">
            <h2 id="bn-final-h">
              More books, <span className="bn-mark">one payment</span>.
            </h2>
            <p>Pick a running offer, choose your books and start reading in minutes.</p>
            <div className="bn-row">
              <a href="#offers" className="bn-btn bn-btn-glow bn-btn-lg">
                See running offers <ArrowRight size={18} aria-hidden />
              </a>
              <Link to="/books" className="bn-btn bn-btn-line bn-btn-lg">
                Browse all books
              </Link>
            </div>
          </div>
          <p className="bn-updated">Offers and prices on this page update live.</p>
        </div>
      </section>

      {/* ================= PICKER ================= */}
      {open && offer && (
        <div className="bn-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && !product && closePicker()}>
          <div className="bn-modal" role="dialog" aria-modal="true" aria-labelledby="bn-modal-h">
            <div className="bn-grab" aria-hidden />
            <div className="bn-modal-head">
              <div style={{ minWidth: 0 }}>
                <p className="bn-modal-kicker">{offer.badge || d.big}</p>
                <h2 id="bn-modal-h">{offer.name}</h2>
                <p className="bn-modal-sub">
                  {d.line}
                  {d.rule ? ` · ${d.rule}` : ""}
                </p>
              </div>
              <button type="button" className="bn-x" onClick={closePicker} aria-label="Close">
                <X size={20} aria-hidden />
              </button>
            </div>

            <div className="bn-modal-body">
              {offer.selectionMode !== "ALL" ? (
                <>
                  <div className="bn-toolbar">
                    <label className="bn-search">
                      <Search size={17} aria-hidden />
                      <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search books in this offer"
                        aria-label="Search books"
                      />
                      {query && (
                        <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                          <X size={16} aria-hidden />
                        </button>
                      )}
                    </label>
                    <button type="button" className="bn-btn bn-btn-ghost bn-btn-sm" onClick={autoPick}>
                      <Sparkles size={15} aria-hidden /> Pick {Math.min(offer.minBooks, offer.books.length)} for me
                    </button>
                    {picked.length > 0 && (
                      <button type="button" className="bn-btn bn-btn-ghost bn-btn-sm" onClick={() => setPicked([])}>
                        Clear
                      </button>
                    )}
                  </div>
                  {tagOptions.length > 1 && (
                    <div className="bn-chips" role="group" aria-label="Filter by topic">
                      <button type="button" className="bn-chip" aria-pressed={!tag} onClick={() => setTag("")}>
                        All
                      </button>
                      {tagOptions.map((t) => (
                        <button key={t.key} type="button" className="bn-chip" aria-pressed={tag === t.key} onClick={() => setTag(tag === t.key ? "" : t.key)}>
                          #{t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="bn-all">
                  <Check size={16} aria-hidden /> All {offer.books.length} books below are included in this offer.
                </p>
              )}

              {visibleBooks.length > 0 ? (
                <ul className="bn-grid">
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
                <p className="bn-empty">No books match your search.</p>
              )}
            </div>

            <div className="bn-modal-foot">
              <div className="bn-progress" aria-hidden>
                <i style={{ width: `${progress}%` }} />
              </div>
              <div className="bn-foot-row">
                <div className="bn-foot-info">
                  <p className="bn-hint" data-tone={hint?.tone} aria-live="polite">
                    {hint?.text}
                  </p>
                  <p className="bn-total">
                    <b>{money(price.final)}</b>
                    {price.ready && <s>{money(price.original)}</s>}
                    <span>
                      {price.count}
                      {offer.selectionMode === "ALL" ? "" : `/${offer.maxBooks === offer.minBooks ? offer.minBooks : `${offer.minBooks}+`}`} book
                      {price.count === 1 ? "" : "s"}
                    </span>
                  </p>
                </div>
                <button type="button" className="bn-btn bn-btn-primary bn-btn-lg bn-pay" onClick={pay} disabled={!price.ready || busy}>
                  {busy ? (
                    <Loader2 size={18} className="bn-spin" aria-label="Starting checkout" />
                  ) : (
                    <>
                      Pay {price.ready ? money(price.final) : ""} <ArrowRight size={17} aria-hidden />
                    </>
                  )}
                </button>
              </div>
              {payError && (
                <p className="bn-err" role="alert">
                  {payError}
                </p>
              )}
              <div className="bn-secure">
                <span><ShieldCheck size={14} aria-hidden /> Secure checkout</span>
                <span><Zap size={14} aria-hidden /> Instant access</span>
                <span><Check size={14} aria-hidden /> Price verified by our server</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <PayUCheckoutModal isOpen={Boolean(product)} onClose={() => setProduct(null)} product={product} />
    </div>
  );
}
