import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  GraduationCap,
  Mail,
  RefreshCw,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Video,
  Sparkles,
  UserRound,
  Check,
} from "lucide-react";
/* =====================================================
   CONFIGURATION
===================================================== */
const BASE_URL = (
  import.meta.env.VITE_BASE_URL || ""
).replace(/\/+$/, "");
const INTERVIEW_API = `${BASE_URL}/api/interviews`;
const HLD_API =
  `${BASE_URL}/book/product?redirectUrl=${encodeURIComponent("/book/system-design/hld")}`;
const HLD_PAGE =
  "/book/system-design/hld";
const INTERVIEW_PAGE =
  "/mock-interviews";
/*
  Set this to the same key used by the
  existing navbar if your app differs.
*/
const TOKEN_KEYS = [
  "token",
  "accessToken",
  "authToken",
  "tt_access_token",
];
/* =====================================================
   HELPERS
===================================================== */
function readToken(propToken) {
  if (propToken) return propToken;
  for (const key of TOKEN_KEYS) {
    const value =
      localStorage.getItem(key);
    if (value) {
      return value;
    }
  }
  return "";
}
function readTheme() {
  const saved =
    localStorage.getItem("theme");
  if (saved === "dark") return "dark";
  if (saved === "light") return "light";
  return document.documentElement.classList
    .contains("dark")
    ? "dark"
    : "light";
}
function useNavbarTheme() {
  const [theme, setTheme] =
    useState(readTheme);
  useEffect(() => {
    const update = () => {
      setTheme(readTheme());
    };
    window.addEventListener(
      "storage",
      update
    );
    window.addEventListener(
      "themechange",
      update
    );
    /*
      Detect same-tab navbar theme changes
      when the navbar changes its theme
      class or data-theme attribute.
    */
    const observer = new MutationObserver(
      update
    );
    observer.observe(
      document.documentElement,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "data-theme",
        ],
      }
    );
    observer.observe(
      document.body,
      {
        attributes: true,
        attributeFilter: [
          "class",
          "data-theme",
        ],
      }
    );
    /*
      Same-tab localStorage changes don't
      trigger the native storage event.
      Listen for a custom themechange event
      from your navbar as well.
    */
    return () => {
      window.removeEventListener(
        "storage",
        update
      );
      window.removeEventListener(
        "themechange",
        update
      );
      observer.disconnect();
    };
  }, []);
  return theme;
}
function money(value, currency = "INR") {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "—";
  }
  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `₹${amount}`;
  }
}
function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
      timeZone: "Asia/Kolkata",
    }
  );
}
function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }
  );
}
function getBookingId(params) {
  return String(
    params.get("bookingId") || ""
  ).trim();
}
function queryFor(bookingId) {
  return `?bookingId=${encodeURIComponent(
    bookingId
  )}`;
}
function getBookingStatus(booking) {
  return String(
    booking?.status || ""
  ).toUpperCase();
}
function isConfirmed(booking) {
  return (
    getBookingStatus(booking) ===
      "CONFIRMED" &&
    String(
      booking?.paymentStatus || ""
    ).toUpperCase() === "SUCCESS"
  );
}
const FAILED_STATUSES = new Set([
  "PAYMENT_FAILED",
  "EXPIRED",
  "CANCELLED_BY_USER",
  "CANCELLED_BY_ADMIN",
]);
async function apiFetch(
  path,
  {
    token,
    method = "GET",
  } = {}
) {
  const response = await fetch(
    `${INTERVIEW_API}${path}`,
    {
      method,
      credentials: "include",
      headers: {
        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      },
      cache: "no-store",
    }
  );
  let json;
  try {
    json = await response.json();
  } catch {
    throw new Error(
      "Invalid response from the server."
    );
  }
  if (
    !response.ok ||
    json.success === false
  ) {
    throw new Error(
      json.message ||
      `Request failed (${response.status})`
    );
  }
  return json.data ?? json;
}
async function fetchBooking(
  bookingId,
  token
) {
  return apiFetch(
    `/bookings/${encodeURIComponent(
      bookingId
    )}/status`,
    { token }
  );
}
async function reconcileBooking(
  bookingId,
  token
) {
  return apiFetch(
    `/bookings/${encodeURIComponent(
      bookingId
    )}/reconcile`,
    {
      token,
      method: "POST",
    }
  );
}
/* =====================================================
   HLD BOOK DATA
   The API's response can be wrapped
   inside data, book, or product.
===================================================== */
function normalizeHldBook(payload) {
  const root = payload?.data ?? payload;
  const book = root?.product ?? root?.book ?? root?.data ?? root;
  if (!book || typeof book !== "object" || Array.isArray(book)) return null;

  const image = book.coverPageUrl || book.coverUrl || book.imageUrl ||
    book.thumbnailUrl || book.thumbnail || book.image || book.cover ||
    book.images?.[0]?.url || book.images?.[0] || "";
  const cover = typeof image === "string" ? image : (image?.url || "");
  const price = book.price?.amount ?? book.sellingPrice ?? book.discountedPrice ?? book.price;
  const mrp = book.mrp?.amount ?? book.originalPrice ?? book.listPrice ?? book.mrp;
  const summary = book.shortDescription || book.subtitle || book.description || "";
  return {
    title: book.title || book.name || "Mastering System Design — HLD",
    description: typeof summary === "string" ? summary.replace(/<[^>]*>/g, " ").trim() : "",
    cover, price: Number.isFinite(Number(price)) ? Number(price) : null,
    mrp: Number.isFinite(Number(mrp)) ? Number(mrp) : null,
    currency: book.currency?.code || book.currency || "INR",
    edition: book.edition || null,
    format: book.format || "Digital eBook",
    category: book.category || book.categories?.[0] || "System Design",
  };
}
function useHldBook() {
  const [book, setBook] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(
          HLD_API,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          throw new Error(
            "Book unavailable"
          );
        }
        const json =
          await response.json();
        if (!controller.signal.aborted) setBook(normalizeHldBook(json));
      } catch (error) {
        /*
          Do not block payment result
          because a book recommendation
          failed to load.
        */
        if (!controller.signal.aborted) console.error("HLD book:", error.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => {
      controller.abort();
    };
  }, []);
  return {
    book,
    loading,
  };
}
/* =====================================================
   SCOPED STYLES
   No navbar or footer.
   No global theme toggle.
===================================================== */
const styles = `
.tt-payment-page {
  --tt-bg: #fffaf5;
  --tt-panel: #ffffff;
  --tt-panel-soft: #fff4e9;
  --tt-text: #251a14;
  --tt-muted: #796b63;
  --tt-border: #f0ded0;
  --tt-orange: #ea580c;
  --tt-orange-hover: #c2410c;
  --tt-orange-soft: #ffedd5;
  --tt-green: #15803d;
  --tt-green-soft: #dcfce7;
  --tt-red: #dc2626;
  --tt-red-soft: #fee2e2;
  --tt-shadow: 0 18px 55px rgba(77, 35, 8, .075);
  background: var(--tt-bg);
  color: var(--tt-text);
  min-height: calc(100vh - 4rem);
  padding: 38px 16px 72px;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
}
.tt-payment-page[data-theme="dark"] {
  --tt-bg: #100e0c;
  --tt-panel: #1c1917;
  --tt-panel-soft: #29211c;
  --tt-text: #faf2eb;
  --tt-muted: #b6a79b;
  --tt-border: #40352e;
  --tt-orange: #fb923c;
  --tt-orange-hover: #fdba74;
  --tt-orange-soft: #412513;
  --tt-green: #4ade80;
  --tt-green-soft: #143422;
  --tt-red: #f87171;
  --tt-red-soft: #3d1d1d;
  --tt-shadow: 0 18px 55px rgba(0, 0, 0, .26);
}
.tt-payment-page * {
  box-sizing: border-box;
}
.tt-payment-container {
  width: 100%;
  max-width: 1060px;
  margin: 0 auto;
}
.tt-payment-crumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--tt-muted);
  font-size: 13px;
  margin-bottom: 26px;
  flex-wrap: wrap;
}
.tt-payment-page a {
  color: inherit;
  text-decoration: none;
}
.tt-result-card {
  background: var(--tt-panel);
  border: 1px solid var(--tt-border);
  border-radius: 24px;
  padding: clamp(22px, 4vw, 46px);
  box-shadow: var(--tt-shadow);
}
.tt-result-top {
  text-align: center;
  max-width: 680px;
  margin: auto;
}
.tt-result-icon {
  height: 78px;
  width: 78px;
  border-radius: 23px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 22px;
}
.tt-result-icon.success {
  background: var(--tt-green-soft);
  color: var(--tt-green);
}
.tt-result-icon.failed {
  background: var(--tt-red-soft);
  color: var(--tt-red);
}
.tt-result-icon.pending {
  background: var(--tt-orange-soft);
  color: var(--tt-orange);
}
.tt-result-eyebrow {
  text-transform: uppercase;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.4px;
  color: var(--tt-orange);
  margin-bottom: 12px;
}
.tt-result-title {
  font-size: clamp(27px, 4.5vw, 42px);
  line-height: 1.17;
  letter-spacing: -1.4px;
  font-weight: 850;
  margin: 0 0 14px;
}
.tt-result-description {
  color: var(--tt-muted);
  font-size: 15px;
  line-height: 1.8;
}
.tt-payment-divider {
  height: 1px;
  width: 100%;
  background: var(--tt-border);
  margin: 28px 0;
}
.tt-section-title {
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -.5px;
  margin: 0 0 18px;
}
.tt-details-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.tt-detail {
  border: 1px solid var(--tt-border);
  border-radius: 14px;
  padding: 17px;
  background: var(--tt-panel);
  min-width: 0;
}
.tt-detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--tt-muted);
  margin-bottom: 9px;
}
.tt-detail-value {
  font-size: 14px;
  font-weight: 750;
  overflow-wrap: anywhere;
}
.tt-topic-wrap {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tt-topic-pill {
  background: var(--tt-orange-soft);
  color: var(--tt-orange);
  font-size: 12px;
  font-weight: 750;
  border-radius: 100px;
  padding: 8px 12px;
}
.tt-notice {
  background: var(--tt-panel-soft);
  border: 1px solid var(--tt-border);
  border-radius: 16px;
  padding: 19px;
  display: flex;
  gap: 13px;
  align-items: flex-start;
  margin-top: 24px;
}
.tt-notice h3 {
  font-size: 15px;
  font-weight: 800;
  margin: 0 0 7px;
}
.tt-notice p {
  color: var(--tt-muted);
  font-size: 13px;
  line-height: 1.75;
  margin: 0;
}
.tt-result-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 11px;
  justify-content: center;
  margin-top: 28px;
}
.tt-btn {
  display: inline-flex;
  gap: 9px;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  padding: 13px 20px;
  font-size: 13px;
  font-weight: 800;
  border: 1px solid transparent;
  cursor: pointer;
  transition: .18s ease;
}
.tt-btn.primary {
  color: #fff;
  background: #ea580c;
}
.tt-btn.primary:hover {
  background: #c2410c;
}
.tt-btn.secondary {
  color: var(--tt-text);
  background: var(--tt-panel);
  border-color: var(--tt-border);
}
.tt-btn.secondary:hover {
  background: var(--tt-panel-soft);
}
.tt-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}
.tt-upsell {
  margin-top: 25px;
  background: var(--tt-panel);
  border: 1px solid var(--tt-border);
  border-radius: 22px;
  padding: clamp(20px, 4vw, 34px);
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: 30px;
  align-items: center;
}
.tt-book-cover {
  width: 100%;
  height: 248px;
  border-radius: 12px;
  object-fit: cover;
  background: var(--tt-panel-soft);
  border: 1px solid var(--tt-border);
}
.tt-book-fallback {
  height: 248px;
  border-radius: 12px;
  color: #fff;
  background: linear-gradient(145deg, #7c2d12, #ea580c);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 14px;
  padding: 20px;
  font-weight: 800;
}
.tt-upsell-kicker {
  color: var(--tt-orange);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 9px;
}
.tt-upsell-title {
  font-size: clamp(21px, 3vw, 30px);
  line-height: 1.28;
  letter-spacing: -.8px;
  font-weight: 850;
  margin: 0 0 12px;
}
.tt-upsell-desc {
  color: var(--tt-muted);
  font-size: 13px;
  line-height: 1.85;
  margin-bottom: 17px;
}
.tt-price-row {
  display: flex;
  gap: 11px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 18px;
}
.tt-price {
  font-size: 25px;
  font-weight: 850;
}
.tt-mrp {
  text-decoration: line-through;
  color: var(--tt-muted);
  font-size: 14px;
}
.tt-next-steps {
  margin-top: 25px;
  padding: 25px;
  border-radius: 20px;
  border: 1px solid var(--tt-border);
  background: var(--tt-panel);
}
.tt-step {
  display: flex;
  gap: 13px;
  padding: 13px 0;
}
.tt-step + .tt-step {
  border-top: 1px solid var(--tt-border);
}
.tt-step-number {
  display: grid;
  place-items: center;
  width: 29px;
  height: 29px;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--tt-orange-soft);
  color: var(--tt-orange);
  font-size: 12px;
  font-weight: 850;
}
.tt-step strong {
  font-size: 13px;
}
.tt-step p {
  font-size: 12px;
  line-height: 1.7;
  color: var(--tt-muted);
  margin: 5px 0 0;
}
.tt-error-box {
  background: var(--tt-red-soft);
  border: 1px solid var(--tt-border);
  border-radius: 12px;
  padding: 13px 16px;
  margin: 20px auto 0;
  color: var(--tt-red);
  font-size: 13px;
  text-align: left;
}
.tt-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 360px;
  gap: 13px;
  flex-direction: column;
  color: var(--tt-muted);
}
.tt-spinner {
  animation: tt-spin .85s linear infinite;
}
@keyframes tt-spin {
  to {
    transform: rotate(360deg);
  }
}
/* Polished result page */
.tt-payment-page { background: radial-gradient(ellipse 65% 25% at 50% 2%, var(--tt-orange-soft), transparent 80%), var(--tt-bg); }
.tt-result-card { position:relative; overflow:hidden; }
.tt-result-card::before { content:""; position:absolute; inset:0 0 auto; height:4px; background:linear-gradient(90deg,#ea580c,#fb923c,#fbbf24); }
.tt-result-icon { box-shadow:0 9px 25px rgba(0,0,0,.06); }
.tt-detail { transition:transform .2s ease,border-color .2s ease; }
.tt-detail:hover { transform:translateY(-2px); border-color:var(--tt-orange); }
.tt-btn { min-height:45px; }
.tt-btn.primary { box-shadow:0 6px 16px rgba(234,88,12,.18); }
.tt-btn:focus-visible,.tt-payment-page a:focus-visible { outline:3px solid var(--tt-orange);outline-offset:3px; }
.tt-upsell { grid-template-columns:220px minmax(0,1fr); gap:32px; position:relative; overflow:hidden;
 background:linear-gradient(115deg,var(--tt-panel),var(--tt-panel-soft)); box-shadow:var(--tt-shadow); }
.tt-upsell::after { content:"";position:absolute;right:-130px;top:-190px;width:340px;height:340px;
 border-radius:50%;background:var(--tt-orange-soft);opacity:.45;pointer-events:none; }
.tt-book-art,.tt-book-copy {position:relative;z-index:1;min-width:0;}
.tt-book-art {display:flex;flex-direction:column;align-items:center;gap:14px;}
.tt-book-cover,.tt-book-fallback {width:190px;max-width:100%;height:260px;object-fit:contain;border-radius:13px;
 box-shadow:0 18px 30px rgba(65,32,14,.2);transition:transform .3s ease;background:transparent;}
.tt-book-art:hover .tt-book-cover {transform:translateY(-5px) rotate(-2deg);}
.tt-book-chip {display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:800;color:var(--tt-orange);
 background:var(--tt-orange-soft);padding:7px 12px;border-radius:99px;}
.tt-upsell-kicker {display:flex;align-items:center;gap:7px;}
.tt-upsell-title span {color:var(--tt-orange);}
.tt-book-name {font-size:15px;font-weight:800;margin:10px 0 8px;}
.tt-topic-pill {display:inline-flex;align-items:center;gap:5px;}
.tt-book-bottom {display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-top:24px;}
.tt-book-pricing {display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.tt-price-loading {color:var(--tt-muted);font-size:13px;}
.tt-discount {color:var(--tt-green);background:var(--tt-green-soft);padding:6px 9px;border-radius:7px;font-size:11px;font-weight:800;}
.tt-book-cta {white-space:nowrap;}
@media (prefers-reduced-motion:reduce){.tt-payment-page *, .tt-payment-page *::before {animation:none!important;transition:none!important;}}
@media (max-width: 700px) {
  .tt-payment-page {
    padding: 22px 12px 60px;
  }
  .tt-result-card {
    border-radius: 18px;
    padding: 25px 17px;
  }
  .tt-details-grid {
    grid-template-columns: 1fr;
  }
  .tt-upsell { grid-template-columns: 1fr; gap: 20px; text-align: center; }
  .tt-book-art {align-items:center;}
  .tt-book-bottom {justify-content:center;}
  .tt-book-cta {width:100%;}
  .tt-upsell-kicker {justify-content:center;}
  .tt-book-cover,.tt-book-fallback {max-width:180px;height:230px;margin:auto;}
  .tt-price-row,
  .tt-result-actions {
    justify-content: center;
  }
  .tt-result-actions .tt-btn {
    width: 100%;
  }
  .tt-next-steps {
    padding: 20px 16px;
  }
}
`;
/* =====================================================
   SHARED PAGE LAYOUT
===================================================== */
function PaymentLayout({
  children,
}) {
  const theme =
    useNavbarTheme();
  return (
    <main
      className="tt-payment-page mt-16"
      data-theme={theme}
    >
      <style>{styles}</style>
      <div className="tt-payment-container">
        <div className="tt-payment-crumbs">
          <Link to="/">
            Home
          </Link>
          <ArrowRight size={12} />
          <Link to={INTERVIEW_PAGE}>
            Mock Interviews
          </Link>
          <ArrowRight size={12} />
          <span>Booking Result</span>
        </div>
        {children}
      </div>
    </main>
  );
}
/* =====================================================
   SHARED HLD BOOK RECOMMENDATION
   API:
   GET BASE_URL/book/system-design/hld
===================================================== */
function HldBookRecommendation() {
  const { book, loading } = useHldBook();
  const [coverBroken, setCoverBroken] = useState(false);
  const title = book?.title || "Mastering System Design — HLD";
  const description = book?.description ||
    "Learn to break down system design interviews with practical architectures, API design, databases, caching and scalable system trade-offs.";
  const hasPrice = book?.price != null;
  const hasMrp = book?.mrp != null && book.mrp > book.price;
  const discount = hasPrice && hasMrp ? Math.round((1 - book.price / book.mrp) * 100) : 0;

  return (
    <section className="tt-upsell" aria-label="Recommended system design book">
      <div className="tt-book-art">
        {book?.cover && !coverBroken ? (
          <img src={book.cover} alt={`${title} cover`} className="tt-book-cover"
            loading="lazy" onError={() => setCoverBroken(true)} />
        ) : (
          <div className="tt-book-fallback"><BookOpen size={40}/>
            <span>MASTERING<br/>SYSTEM DESIGN<br/>HLD</span></div>
        )}
        <span className="tt-book-chip"><BookOpen size={13}/> Digital learning</span>
      </div>
      <div className="tt-book-copy">
        <div className="tt-upsell-kicker"><Sparkles size={15}/> Continue your preparation</div>
        <h2 className="tt-upsell-title">The interview is one step. <span>Master the design behind it.</span></h2>
        <p className="tt-book-name">{title}</p>
        <p className="tt-upsell-desc">{description}</p>
        <div className="tt-topic-wrap">
          {["Real-world architectures", "Caching & databases", "Scaling strategies", "Interview frameworks"].map(item =>
            <span key={item} className="tt-topic-pill"><Check size={13}/>{item}</span>)}
        </div>
        <div className="tt-book-bottom">
          <div className="tt-book-pricing" aria-live="polite">
            {loading ? <span className="tt-price-loading">Loading book details…</span>
              : hasPrice ? <>
                <span className="tt-price">{money(book.price, book.currency)}</span>
                {hasMrp && <span className="tt-mrp">{money(book.mrp, book.currency)}</span>}
                {discount > 0 && <span className="tt-discount">{discount}% off</span>}
              </> : <span className="tt-price-loading">See current price</span>}
          </div>
          <Link className="tt-btn primary tt-book-cta" to={HLD_PAGE}>
            Explore the book <ArrowRight size={17}/>
          </Link>
        </div>
      </div>
    </section>
  );
}
/* =====================================================
   SHARED DETAILS
===================================================== */
function Detail({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="tt-detail">
      <div className="tt-detail-label">
        <Icon size={15} />
        {label}
      </div>
      <div className="tt-detail-value">
        {value || "—"}
      </div>
    </div>
  );
}
function BookingDetails({
  booking,
}) {
  const snapshot =
    booking?.slotSnapshot || {};
  const candidate =
    booking?.candidate || {};
  const startTime =
    snapshot.startTime ||
    booking?.startTime;
  const endTime =
    snapshot.endTime ||
    booking?.endTime;
  const topics =
    booking?.selectedTopics ||
    [];
  const price =
    snapshot.price ??
    booking?.amount ??
    booking?.price;
  return (
    <>
      <div className="tt-payment-divider" />
      <h2 className="tt-section-title">
        Booking details
      </h2>
      <div className="tt-details-grid">
        <Detail
          icon={ShieldCheck}
          label="Booking ID"
          value={
            booking?.bookingId
          }
        />
        <Detail
          icon={UserRound}
          label="Candidate"
          value={
            candidate.name
          }
        />
        <Detail
          icon={CalendarDays}
          label="Interview date"
          value={formatDate(
            startTime
          )}
        />
        <Detail
          icon={Clock3}
          label="Interview time (IST)"
          value={
            startTime
              ? `${formatTime(startTime)}${
                  endTime
                    ? ` – ${formatTime(
                        endTime
                      )}`
                    : ""
                }`
              : "—"
          }
        />
        <Detail
          icon={GraduationCap}
          label="Interview"
          value={
            snapshot.title ||
            "Technical Mock Interview"
          }
        />
        <Detail
          icon={CreditCard}
          label="Amount"
          value={
            price != null
              ? money(
                  price,
                  snapshot.currency ||
                    "INR"
                )
              : "—"
          }
        />
      </div>
      {topics.length > 0 && (
        <div
          style={{
            marginTop: 22,
          }}
        >
          <div
            className="tt-detail-label"
            style={{
              marginBottom: 11,
            }}
          >
            Topics selected
          </div>
          <div className="tt-topic-wrap">
            {topics.map((topic) => (
              <span
                key={topic}
                className="tt-topic-pill"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
/* =====================================================
   HOOK: GET BOOKING STATUS
   Used by both success and failed pages.
   These pages do NOT blindly trust the URL.
===================================================== */
function useVerifiedBooking(
  bookingId,
  token
) {
  const [booking, setBooking] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const load = useCallback(async () => {
    if (!bookingId) {
      setError(
        "Booking reference is missing."
      );
      setLoading(false);
      return;
    }
    if (!token) {
      setError(
        "Please sign in to view this booking."
      );
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result =
        await fetchBooking(
          bookingId,
          token
        );
      setBooking(result);
    } catch (err) {
      setError(
        err.message ||
        "Unable to load booking."
      );
    } finally {
      setLoading(false);
    }
  }, [bookingId, token]);
  useEffect(() => {
    load();
  }, [load]);
  return {
    booking,
    loading,
    error,
    reload: load,
  };
}
/* =====================================================
   1. SUCCESS PAGE
   ROUTE:
   /mock-interviews/success?bookingId=...
   Display successful booking only if:
   booking.status === CONFIRMED
   paymentStatus === SUCCESS
===================================================== */
export function InterviewPaymentSuccessPage({
  authToken,
}) {
  const [params] =
    useSearchParams();
  const bookingId =
    getBookingId(params);
  const token = readToken(
    authToken
  );
  const {
    booking,
    loading,
    error,
    reload,
  } = useVerifiedBooking(
    bookingId,
    token
  );
  const confirmed =
    isConfirmed(booking);
  const meetingUrl =
    booking?.meetingUrl;
  return (
    <PaymentLayout>
      <section className="tt-result-card">
        {loading ? (
          <div className="tt-loading">
            <RefreshCw
              size={29}
              className="tt-spinner"
            />
            Verifying your booking…
          </div>
        ) : error ? (
          <div className="tt-result-top">
            <div className="tt-result-icon pending">
              <AlertCircle size={38} />
            </div>
            <h1 className="tt-result-title">
              Unable to verify booking
            </h1>
            <p className="tt-result-description">
              {error}
            </p>
            <div className="tt-result-actions">
              <button
                className="tt-btn primary"
                onClick={reload}
              >
                <RefreshCw size={16} />
                Try Again
              </button>
              <Link
                to={INTERVIEW_PAGE}
                className="tt-btn secondary"
              >
                Back to Interviews
              </Link>
            </div>
          </div>
        ) : !confirmed ? (
          <div className="tt-result-top">
            <div className="tt-result-icon pending">
              <Clock3 size={38} />
            </div>
            <h1 className="tt-result-title">
              Booking not yet confirmed
            </h1>
            <p className="tt-result-description">
              The backend has not verified
              this booking as confirmed.
              Please check the latest payment
              result before making another payment.
            </p>
            <div className="tt-result-actions">
              <Link
                to={
                  `/mock-interviews/payment-status` +
                  queryFor(bookingId)
                }
                className="tt-btn primary"
              >
                Check Payment Status
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="tt-result-top">
              <div className="tt-result-icon success">
                <CheckCircle2 size={44} />
              </div>
              <div className="tt-result-eyebrow">
                Payment verified successfully
              </div>
              <h1 className="tt-result-title">
                Your mock interview
                is confirmed!
              </h1>
              <p className="tt-result-description">
                Your payment has been
                verified and your selected
                interview slot is reserved.
                Get ready for a focused
                interview session with
                actionable technical feedback.
              </p>
            </div>
            <BookingDetails
              booking={booking}
            />
            <div className="tt-notice">
              <Mail
                size={23}
                color="var(--tt-orange)"
                style={{
                  flexShrink: 0,
                }}
              />
              <div>
                <h3>
                  Confirmation details
                  will be sent by email
                </h3>
                <p>
                  We'll send your booking
                  confirmation, interview
                  date and time, selected
                  topics and joining
                  instructions to{" "}
                  <strong>
                    {booking.candidate?.email ||
                      "your registered email address"}
                  </strong>
                  .
                </p>
                <p
                  style={{
                    marginTop: 8,
                  }}
                >
                  If your meeting link is
                  not available yet, our
                  team will share it once
                  assigned. Please also
                  check your spam folder.
                </p>
              </div>
            </div>
            {meetingUrl && (
              <div className="tt-notice">
                <Video
                  size={23}
                  color="var(--tt-orange)"
                  style={{
                    flexShrink: 0,
                  }}
                />
                <div>
                  <h3>
                    Your meeting link is ready
                  </h3>
                  <p>
                    Use this link at the
                    scheduled interview time.
                    Do not share it publicly.
                  </p>
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tt-btn primary"
                    style={{
                      marginTop: 12,
                    }}
                  >
                    Open Meeting Link
                    <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            )}
            <div className="tt-result-actions">
              <Link
                to={INTERVIEW_PAGE}
                className="tt-btn secondary"
              >
                Explore More Interviews
              </Link>
            </div>
          </>
        )}
      </section>
      {confirmed && (
        <section className="tt-next-steps">
          <h2 className="tt-section-title">
            What happens next?
          </h2>
          {[
            [
              "Review your confirmation",
              "Keep your booking reference and check your email for session details.",
            ],
            [
              "Prepare your interview topics",
              "Revise fundamentals, practice explaining trade-offs, and prepare examples from your projects.",
            ],
            [
              "Attend your mock interview",
              "Join on time using the provided meeting link and be ready to walk through your thinking.",
            ],
            [
              "Receive actionable feedback",
              "Get feedback focused on technical understanding, problem-solving approach, communication, and improvement areas.",
            ],
          ].map(
            ([title, description], index) => (
              <div
                key={title}
                className="tt-step"
              >
                <span className="tt-step-number">
                  {index + 1}
                </span>
                <div>
                  <strong>
                    {title}
                  </strong>
                  <p>
                    {description}
                  </p>
                </div>
              </div>
            )
          )}
        </section>
      )}
      <HldBookRecommendation />
    </PaymentLayout>
  );
}
/* =====================================================
   2. FAILED / EXPIRED PAGE
   ROUTE:
   /mock-interviews/failed?bookingId=...
   This page verifies the booking again.
   Never claim failure for a pending order.
===================================================== */
export function InterviewPaymentFailedPage({
  authToken,
}) {
  const [params] =
    useSearchParams();
  const bookingId =
    getBookingId(params);
  const token =
    readToken(authToken);
  const {
    booking,
    loading,
    error,
    reload,
  } = useVerifiedBooking(
    bookingId,
    token
  );
  const status =
    getBookingStatus(booking);
  const failed =
    FAILED_STATUSES.has(status);
  const confirmed =
    isConfirmed(booking);
  const navigate =
    useNavigate();
  useEffect(() => {
    if (
      !loading &&
      confirmed
    ) {
      navigate(
        `/mock-interviews/success${queryFor(
          bookingId
        )}`,
        { replace: true }
      );
    }
  }, [
    loading,
    confirmed,
    bookingId,
    navigate,
  ]);
  const title =
    status === "EXPIRED"
      ? "Your booking has expired"
      : status === "CANCELLED_BY_USER"
        ? "Booking cancelled"
        : status === "CANCELLED_BY_ADMIN"
          ? "Booking cancelled"
          : "Payment was unsuccessful";
  return (
    <PaymentLayout>
      <section className="tt-result-card">
        {loading ? (
          <div className="tt-loading">
            <RefreshCw
              size={29}
              className="tt-spinner"
            />
            Checking payment status…
          </div>
        ) : error ? (
          <div className="tt-result-top">
            <div className="tt-result-icon pending">
              <AlertCircle size={38} />
            </div>
            <h1 className="tt-result-title">
              Unable to verify payment
            </h1>
            <p className="tt-result-description">
              {error}
            </p>
            <div className="tt-result-actions">
              <button
                onClick={reload}
                className="tt-btn primary"
              >
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        ) : !failed ? (
          <div className="tt-result-top">
            <div className="tt-result-icon pending">
              <Clock3 size={38} />
            </div>
            <h1 className="tt-result-title">
              Your payment is being verified
            </h1>
            <p className="tt-result-description">
              We haven't received a final
              unsuccessful payment result.
              If money was debited, please
              don't pay again until its
              status is confirmed.
            </p>
            <div className="tt-result-actions">
              <Link
                to={
                  `/mock-interviews/payment-status` +
                  queryFor(bookingId)
                }
                className="tt-btn primary"
              >
                Check Again
                <RefreshCw size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="tt-result-top">
              <div className="tt-result-icon failed">
                <XCircle size={44} />
              </div>
              <div className="tt-result-eyebrow">
                Interview not confirmed
              </div>
              <h1 className="tt-result-title">
                {title}
              </h1>
              <p className="tt-result-description">
                {status === "PAYMENT_FAILED"
                  ? "Your payment could not be completed, so the interview booking was not confirmed."
                  : status === "EXPIRED"
                    ? "The time reserved for payment expired before we could confirm the booking."
                    : "This booking has been cancelled. You can explore other available interview slots."}
              </p>
              <p
                className="tt-result-description"
                style={{
                  marginTop: 12,
                }}
              >
                If your bank shows a debit,
                please contact support with
                your booking reference rather
                than starting a duplicate
                payment.
              </p>
            </div>
            <BookingDetails
              booking={booking}
            />
            {booking?.paymentStatus ===
              "SUCCESS" && (
              <div className="tt-notice">
                <AlertCircle
                  size={22}
                  color="var(--tt-orange)"
                />
                <div>
                  <h3>
                    Payment received — refund
                    may be required
                  </h3>
                  <p>
                    The gateway reports a
                    successful payment, but
                    this booking is not
                    confirmed. Please refer
                    to the refund status
                    in your booking details
                    or contact support.
                  </p>
                </div>
              </div>
            )}
            <div className="tt-result-actions">
              <Link
                to={INTERVIEW_PAGE}
                className="tt-btn primary"
              >
                Choose Another Slot
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}
      </section>
      <HldBookRecommendation />
    </PaymentLayout>
  );
}
/* =====================================================
   3. CASHFREE PAYMENT RETURN / STATUS PAGE
   ROUTE:
   /mock-interviews/payment-status?bookingId=...
   This page is the ONLY return URL Cashfree
   should use.
   It calls:
   POST /bookings/:id/reconcile
   GET  /bookings/:id/status
   Routing:
   CONFIRMED + SUCCESS -> success page
   Terminal failed     -> failed page
   Pending             -> remain here
===================================================== */
export function InterviewPaymentStatusPage({
  authToken,
}) {
  const [params] =
    useSearchParams();
  const navigate =
    useNavigate();
  const bookingId =
    getBookingId(params);
  const token =
    readToken(authToken);
  const [checking, setChecking] =
    useState(false);
  const [booking, setBooking] =
    useState(null);
  const [error, setError] =
    useState("");
  const checkPayment =
    useCallback(async () => {
      if (!bookingId) {
        setError(
          "Booking ID is missing."
        );
        return;
      }
      if (!token) {
        setError(
          "Please sign in to verify your payment."
        );
        return;
      }
      setChecking(true);
      setError("");
      try {
        /*
          Ask backend to verify directly
          with Cashfree.
        */
        await reconcileBooking(
          bookingId,
          token
        );
        /*
          Fetch latest MongoDB booking state.
        */
        const latest =
          await fetchBooking(
            bookingId,
            token
          );
        setBooking(latest);
        if (
          isConfirmed(latest)
        ) {
          navigate(
            `/mock-interviews/success` +
              queryFor(bookingId),
            { replace: true }
          );
          return;
        }
        if (
          FAILED_STATUSES.has(
            getBookingStatus(latest)
          ) &&
          latest.paymentStatus !==
            "SUCCESS"
        ) {
          navigate(
            `/mock-interviews/failed` +
              queryFor(bookingId),
            { replace: true }
          );
          return;
        }
        /*
          PENDING_PAYMENT:
          stay on this page.
          Payment successful but reservation
          unavailable:
          also stay here and show the
          refund-required state.
        */
      } catch (err) {
        setError(
          err.message ||
            "Could not verify payment."
        );
      } finally {
        setChecking(false);
      }
    }, [
      bookingId,
      token,
      navigate,
    ]);
  useEffect(() => {
    checkPayment();
  }, [checkPayment]);
  const receivedWithoutConfirmation =
    booking?.paymentStatus ===
      "SUCCESS" &&
    !isConfirmed(booking);
  return (
    <PaymentLayout>
      <section className="tt-result-card">
        <div className="tt-result-top">
          <div className="tt-result-icon pending">
            {checking ? (
              <RefreshCw
                size={38}
                className="tt-spinner"
              />
            ) : (
              <Clock3 size={38} />
            )}
          </div>
          <div className="tt-result-eyebrow">
            Secure payment verification
          </div>
          <h1 className="tt-result-title">
            {checking
              ? "Verifying your payment..."
              : receivedWithoutConfirmation
                ? "Payment received — booking needs attention"
                : "Payment verification pending"}
          </h1>
          <p className="tt-result-description">
            {checking
              ? "We're checking the payment status directly with Cashfree and confirming your interview reservation."
              : receivedWithoutConfirmation
                ? "Your payment has been received, but the original reservation could not be confirmed. Our team needs to resolve the booking or applicable refund."
                : "We haven't received a final confirmation yet. If money was debited, avoid another payment until verification is complete."}
          </p>
          {bookingId && (
            <div
              style={{
                fontSize: 12,
                color: "var(--tt-muted)",
                marginTop: 18,
              }}
            >
              Booking reference:{" "}
              <strong>{bookingId}</strong>
            </div>
          )}
          {error && (
            <div className="tt-error-box">
              {error}
            </div>
          )}
          <div className="tt-result-actions">
            <button
              type="button"
              className="tt-btn primary"
              onClick={checkPayment}
              disabled={checking}
            >
              <RefreshCw
                size={16}
                className={
                  checking
                    ? "tt-spinner"
                    : ""
                }
              />
              {checking
                ? "Checking..."
                : "Check Again"}
            </button>
            <Link
              to={INTERVIEW_PAGE}
              className="tt-btn secondary"
            >
              Back to Interviews
            </Link>
          </div>
        </div>
      </section>
      <HldBookRecommendation />
    </PaymentLayout>
  );
}