import React, { useEffect, useState } from "react";
import {
  X,
  Copy,
  Check,
  ArrowRight,
  Clock3,
  ShieldCheck,
  Tag,
  Zap,
} from "lucide-react";

/* =============================================
   ENVIRONMENT CONFIGURATION

   VITE_SALE_ENABLED       true | false
   VITE_SALE_SHOW_MODAL    true | false   (popup)
   VITE_SALE_SHOW_BANNER   true | false   (side tab that reopens the popup)
   VITE_SALE_ID            unique id (resets "dismissed" memory)
   VITE_SALE_TITLE         e.g. "Diwali Sale"
   VITE_SALE_DISCOUNT      discount percent, shown as "Flat N% OFF"
   VITE_SALE_COUPON        coupon highlighted in the banner
   VITE_SALE_EMOJI         icon shown in the banner / popup
   VITE_SALE_START_AT      optional ISO date, sale hidden before it
   VITE_SALE_END_AT        ISO date, sale hidden after it
   VITE_SALE_POPUP_DELAY   ms before the popup appears
   VITE_SALE_DISMISS_HOURS hours the popup stays hidden once closed
============================================= */

const env = import.meta.env;

const toBoolean = (value, defaultValue = false) => {
  if (value === undefined || value === "") return defaultValue;
  return String(value).toLowerCase() === "true";
};

const toPositiveNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0
    ? number
    : fallback;
};

const SALE = {
  enabled: toBoolean(env.VITE_SALE_ENABLED, false),
  showModal: toBoolean(env.VITE_SALE_SHOW_MODAL, false),
  showBanner: toBoolean(env.VITE_SALE_SHOW_BANNER, false),

  id: env.VITE_SALE_ID || "diwali-sale-2026",
  title: env.VITE_SALE_TITLE || "Diwali Sale",
  discount: env.VITE_SALE_DISCOUNT || "10",
  coupon: env.VITE_SALE_COUPON || "DIWALI10",
  emoji: env.VITE_SALE_EMOJI || "🪔",

  startAt: env.VITE_SALE_START_AT || "",
  endAt: env.VITE_SALE_END_AT || "",

  popupDelay: toPositiveNumber(
    env.VITE_SALE_POPUP_DELAY,
    1800
  ),

  dismissalHours: toPositiveNumber(
    env.VITE_SALE_DISMISS_HOURS,
    24
  ),

  booksUrl: "/books",
};

/*
 * Coupon shown in the popup. Create the same code yourself in
 * Admin > Coupons (10% off, all books, minimum order 99, "Show on
 * payment page" ON, valid for the sale dates). The text here is
 * display only: the real rules always come from the coupon in the
 * database, and the payment page lists it automatically.
 */
const OFFERS = [
  {
    code: "DIWALI10",
    pct: "10",
    note: "On every book, orders of ₹99 and above",
  },
];

const storageKey = `targettrek_sale_dismissed_${SALE.id}`;

const getRemaining = () => {
  const deadline = Date.parse(SALE.endAt);

  if (!Number.isFinite(deadline)) return 0;

  const start = Date.parse(SALE.startAt);

  // Not started yet
  if (Number.isFinite(start) && Date.now() < start) return 0;

  return Math.max(0, deadline - Date.now());
};

const pad = (value) => String(value).padStart(2, "0");

/* =============================================
   COUNTDOWN HOOK
============================================= */

function useSaleCountdown() {
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    if (!SALE.enabled) return;

    const update = () => setRemaining(getRemaining());

    update();

    const interval = setInterval(update, 1000);

    document.addEventListener("visibilitychange", update);
    window.addEventListener("focus", update);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("focus", update);
    };
  }, []);

  const total = Math.floor(remaining / 1000);

  return {
    active: remaining > 0,
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

/* =============================================
   COUNTDOWN COMPONENT
============================================= */

function Countdown({ time, compact = false }) {
  const values = [
    { value: time.days, label: "DAYS" },
    { value: time.hours, label: "HRS" },
    { value: time.minutes, label: "MIN" },
    { value: time.seconds, label: "SEC" },
  ];

  if (compact) {
    return (
      <span className="ttsc-timer-compact">
        {values.map((item, index) => (
          <React.Fragment key={item.label}>
            {index > 0 && <span>:</span>}
            <strong>{pad(item.value)}</strong>
          </React.Fragment>
        ))}
      </span>
    );
  }

  return (
    <div className="ttsc-timer">
      {values.map((item) => (
        <div className="ttsc-time-box" key={item.label}>
          <strong>{pad(item.value)}</strong>
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  );
}


/* =============================================
   DIYA (inline SVG so it looks the same everywhere)
============================================= */

function Diya({ size = 30 }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ttscFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fef08a" />
          <stop offset="0.55" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="ttscBowl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>

      <path
        className="ttsc-flame"
        d="M32 3C41 14 43 22 38.5 28.5C36.5 31.5 27.5 31.5 25.5 28.5C21 22 23 14 32 3Z"
        fill="url(#ttscFlame)"
      />
      <path
        d="M6 34H58C58 49 47 58 32 58C17 58 6 49 6 34Z"
        fill="url(#ttscBowl)"
      />
      <ellipse cx="32" cy="34" rx="26" ry="4.5" fill="#b45309" opacity="0.55" />
      <path
        d="M14 42C20 49 26 51 32 51"
        stroke="#fff7d6"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

// Fixed positions so the sparkles do not jump around on re-render.
const SPARKLES = [
  { left: "7%", top: "22%", delay: "0s", size: 12 },
  { left: "20%", top: "58%", delay: "0.8s", size: 9 },
  { left: "34%", top: "14%", delay: "1.6s", size: 10 },
  { left: "66%", top: "18%", delay: "0.4s", size: 11 },
  { left: "82%", top: "52%", delay: "1.2s", size: 9 },
  { left: "92%", top: "24%", delay: "2s", size: 13 },
];

/* =============================================
   MAIN CAMPAIGN COMPONENT
============================================= */

export default function SaleCampaign() {
  const countdown = useSaleCountdown();

  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  const campaignActive = SALE.enabled && countdown.active;

  const isModalEnabled =
    campaignActive && SALE.showModal;

  const isDockEnabled =
    campaignActive && SALE.showBanner;

  /* =============================================
     POPUP DISPLAY LOGIC
     - First visit: show after delay
     - Closed: hide for specified hours
       (the side tab reopens it any time)
  ============================================= */

  useEffect(() => {
    if (!isModalEnabled) {
      setShowModal(false);
      return;
    }

    let shouldDisplay = true;

    try {
      const dismissedAt = Number(
        localStorage.getItem(storageKey)
      );

      const dismissalDuration =
        SALE.dismissalHours * 60 * 60 * 1000;

      if (
        dismissedAt > 0 &&
        Date.now() - dismissedAt < dismissalDuration
      ) {
        shouldDisplay = false;
      }
    } catch {
      // localStorage unavailable
    }

    if (!shouldDisplay) return;

    const timeout = setTimeout(() => {
      setShowModal(true);
    }, SALE.popupDelay);

    return () => clearTimeout(timeout);
  }, [isModalEnabled]);

  const closeModal = () => {
    setShowModal(false);

    try {
      localStorage.setItem(
        storageKey,
        String(Date.now())
      );
    } catch {
      // Browser may block storage
    }
  };

  /* =============================================
     PREVENT BACKGROUND SCROLL + ESCAPE TO CLOSE
  ============================================= */

  useEffect(() => {
    if (!showModal) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showModal]);

  /* =============================================
     COPY COUPON CODE
  ============================================= */

  const copyCoupon = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode((current) =>
          current === code ? "" : current
        );
      }, 2000);
    } catch (error) {
      console.error("Coupon copy failed", error);
    }
  };

  const exploreBooks = () => {
    closeModal();
    window.location.assign(SALE.booksUrl);
  };

  /* =============================================
     NO ACTIVE CAMPAIGN
  ============================================= */

  if (!campaignActive) return null;

  if (!isDockEnabled && !isModalEnabled) {
    return null;
  }

  const daysLeft =
    countdown.days > 0
      ? `${countdown.days}d ${countdown.hours}h left`
      : `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)} left`;

  return (
    <>
      <style>{styles}</style>

      {/* ====================================
          SIDE TAB (docked on the right edge,
          clear of the navbar and page footers)
      ==================================== */}

      {isDockEnabled && !showModal && (
        <button
          className="ttsc-dock"
          onClick={() => setShowModal(true)}
          type="button"
          aria-label={`${SALE.title}: flat ${SALE.discount}% off. Open offer`}
        >
          <span className="ttsc-dock-glow" aria-hidden="true" />

          <span className="ttsc-dock-diya">
            <Diya size={26} />
          </span>

          <span className="ttsc-dock-text">
            <strong>{SALE.title.toUpperCase()}</strong>
            <small>FLAT {SALE.discount}% OFF</small>
          </span>

          <span className="ttsc-dock-time">{daysLeft}</span>
        </button>
      )}

      {/* ====================================
          OFFER POPUP
      ==================================== */}

      {showModal && (
        <div
          className="ttsc-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="ttsc-modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${SALE.title} offers`}
          >
            <button
              className="ttsc-close"
              onClick={closeModal}
              aria-label="Close offers"
              type="button"
            >
              <X size={18} />
            </button>

            {/* ---------- HERO ---------- */}
            <div className="ttsc-hero">
              <div className="ttsc-toran" aria-hidden="true" />

              {SPARKLES.map((sparkle, index) => (
                <span
                  key={index}
                  className="ttsc-spark"
                  aria-hidden="true"
                  style={{
                    left: sparkle.left,
                    top: sparkle.top,
                    width: sparkle.size,
                    height: sparkle.size,
                    animationDelay: sparkle.delay,
                  }}
                />
              ))}

              <div className="ttsc-diyas" aria-hidden="true">
                <Diya size={30} />
                <Diya size={46} />
                <Diya size={30} />
              </div>

              <p className="ttsc-eyebrow">
                TARGET TREK &middot; FESTIVE OFFERS
              </p>

              <h2>
                Diwali <span>Dhamaka</span>
              </h2>

              <p className="ttsc-sub">
                Light up your career with 10% off on every
                Target Trek book. One code, all books.
              </p>

              <div className="ttsc-seal" aria-label={`Flat ${SALE.discount} percent off`}>
                <small>FLAT</small>
                <strong>
                  {SALE.discount}
                  <sup>%</sup>
                </strong>
                <small>OFF</small>
              </div>
            </div>

            {/* ---------- BODY ---------- */}
            <div className="ttsc-body">
              <p className="ttsc-section-title">
                <Tag size={13} />
                Your Diwali coupon &middot; tap to copy
              </p>

              <div className="ttsc-tickets">
                {OFFERS.map((offer) => {
                  const copied = copiedCode === offer.code;

                  return (
                    <button
                      key={offer.code}
                      className={`ttsc-ticket ${offer.badge || OFFERS.length === 1 ? "is-best" : ""}`}
                      onClick={() => copyCoupon(offer.code)}
                      type="button"
                    >
                      {offer.badge && (
                        <span className="ttsc-ribbon">
                          {offer.badge}
                        </span>
                      )}

                      <span className="ttsc-stub">
                        <b>{offer.pct}%</b>
                        <i>OFF</i>
                      </span>

                      <span className="ttsc-ticket-main">
                        <strong>{offer.code}</strong>
                        <small>{offer.note}</small>
                      </span>

                      <span
                        className={`ttsc-copy ${copied ? "is-copied" : ""}`}
                      >
                        {copied ? (
                          <>
                            <Check size={14} /> Copied
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copy
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="ttsc-countdown-section">
                <span>
                  <Clock3 size={12} />
                  Offer ends in
                </span>

                <Countdown time={countdown} />
              </div>

              <button
                className="ttsc-cta"
                onClick={exploreBooks}
                type="button"
              >
                Shop the Diwali Sale
                <ArrowRight size={18} />
              </button>

              <button
                className="ttsc-later"
                onClick={closeModal}
                type="button"
              >
                Maybe later
              </button>

              <ul className="ttsc-trust">
                <li>
                  <Zap size={14} />
                  Instant PDF access
                </li>
                <li>
                  <ShieldCheck size={14} />
                  Secure payment
                </li>
                <li>
                  <Tag size={14} />
                  One code per order
                </li>
              </ul>

              <p className="ttsc-terms">
                Limited-time festive offer. Eligibility and
                limits apply.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* =============================================
   STYLES  (orange + gold Diwali palette)
============================================= */

const styles = `

/* ---------- SIDE TAB ---------- */

.ttsc-dock {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9990;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  padding: 12px 9px 10px;
  border: none;
  border-radius: 16px 0 0 16px;
  background: linear-gradient(180deg, #f97316 0%, #ea580c 55%, #c2410c 100%);
  color: #fff;
  cursor: pointer;
  box-shadow: -6px 8px 26px rgba(194, 65, 12, 0.38);
  transition: transform 0.2s ease, padding 0.2s ease;
}

.ttsc-dock::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 3px;
  border-radius: 16px 0 0 0;
  background: linear-gradient(90deg, #fde68a, #fff7d6, #fde68a);
}

.ttsc-dock:hover {
  transform: translateY(-50%) translateX(-3px);
}

.ttsc-dock:focus-visible {
  outline: 3px solid #fde68a;
  outline-offset: 2px;
}

.ttsc-dock-glow {
  position: absolute;
  inset: -2px 0 -2px -4px;
  border-radius: 18px 0 0 18px;
  box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.6);
  animation: ttsc-pulse 2.2s ease-out infinite;
  pointer-events: none;
}

.ttsc-dock-diya {
  display: grid;
  place-items: center;
  filter: drop-shadow(0 0 8px rgba(253, 224, 71, 0.8));
}

.ttsc-dock-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.ttsc-dock-text strong {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 2px;
  color: #fff7d6;
}

.ttsc-dock-text small {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #fff;
  opacity: 0.92;
}

.ttsc-dock-time {
  padding: 3px 5px;
  border-radius: 6px;
  background: #ffffff26;
  font-size: 9px;
  font-weight: 800;
  line-height: 1.25;
  text-align: center;
  font-variant-numeric: tabular-nums;
  max-width: 46px;
}

/* ---------- OVERLAY / MODAL ---------- */

.ttsc-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: rgba(67, 20, 7, 0.6);
  backdrop-filter: blur(6px);
  animation: ttsc-fade 0.25s ease;
}

.ttsc-modal {
  position: relative;
  width: 100%;
  max-width: 460px;
  max-height: 94dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: #fffdf9;
  border-radius: 26px;
  color: #7c2d12;
  text-align: center;
  box-shadow: 0 34px 90px rgba(124, 45, 18, 0.45), 0 0 0 1px rgba(253, 186, 116, 0.5);
  animation: ttsc-pop 0.34s cubic-bezier(0.2, 0.8, 0.2, 1);
  scrollbar-width: thin;
}

.ttsc-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 5;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: background 0.15s ease;
}

.ttsc-close:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* ---------- HERO ---------- */

.ttsc-hero {
  position: relative;
  overflow: hidden;
  padding: 30px 24px 62px;
  color: #fff;
  background:
    radial-gradient(circle at 15% 0%, rgba(253, 224, 71, 0.38), transparent 45%),
    radial-gradient(circle at 90% 90%, rgba(255, 237, 213, 0.22), transparent 50%),
    linear-gradient(160deg, #f97316 0%, #ea580c 55%, #c2410c 100%);
  border-radius: 26px 26px 0 0;
}

.ttsc-hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.14) 1.5px, transparent 2px);
  background-size: 22px 22px;
  opacity: 0.55;
  pointer-events: none;
}

/* garland of marigold dots along the top edge */
.ttsc-toran {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 14px;
  background-image:
    radial-gradient(circle at 10px 7px, #fde047 0 4px, transparent 4.5px),
    radial-gradient(circle at 30px 7px, #fb923c 0 4px, transparent 4.5px);
  background-size: 40px 14px;
  opacity: 0.95;
  z-index: 1;
}

.ttsc-spark {
  position: absolute;
  z-index: 1;
  background: #fff7d6;
  clip-path: polygon(50% 0%, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0% 50%, 38% 38%);
  animation: ttsc-twinkle 2.4s ease-in-out infinite;
  pointer-events: none;
}

.ttsc-diyas {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 14px;
  margin-bottom: 10px;
  filter: drop-shadow(0 0 14px rgba(253, 224, 71, 0.65));
}

.ttsc-flame {
  transform-origin: 50% 90%;
  animation: ttsc-flicker 1.8s ease-in-out infinite;
}

.ttsc-eyebrow {
  position: relative;
  z-index: 2;
  margin: 0;
  color: #ffedd5;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 2px;
}

.ttsc-hero h2 {
  position: relative;
  z-index: 2;
  margin: 8px 0 8px;
  font-family: Georgia, "Times New Roman", serif;
  font-size: clamp(34px, 9vw, 44px);
  font-weight: 800;
  line-height: 1.05;
  color: #fff;
  text-shadow: 0 3px 14px rgba(124, 45, 18, 0.35);
}

.ttsc-hero h2 span {
  color: #fde68a;
}

.ttsc-sub {
  position: relative;
  z-index: 2;
  max-width: 300px;
  margin: 0 auto;
  font-size: 13px;
  line-height: 1.55;
  color: #ffedd5;
}

/* round discount seal overlapping hero and body */
.ttsc-seal {
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: -38px;
  transform: translateX(-50%);
  width: 92px;
  height: 92px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at 30% 25%, #fff7d6, #fde68a 55%, #fbbf24);
  color: #9a3412;
  border: 4px solid #fffdf9;
  box-shadow: 0 10px 26px rgba(124, 45, 18, 0.35), inset 0 -4px 10px rgba(217, 119, 6, 0.25);
  animation: ttsc-seal 3s ease-in-out infinite;
}

.ttsc-seal small {
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 1.5px;
  line-height: 1;
}

.ttsc-seal strong {
  font-size: 33px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -1px;
}

.ttsc-seal sup {
  font-size: 15px;
  vertical-align: top;
  margin-left: 1px;
}

/* ---------- BODY ---------- */

.ttsc-body {
  padding: 52px 22px 20px;
}

.ttsc-section-title {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;
  color: #c2410c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
}

.ttsc-tickets {
  display: grid;
  gap: 10px;
  text-align: left;
}

.ttsc-ticket {
  position: relative;
  display: flex;
  align-items: stretch;
  width: 100%;
  padding: 0;
  overflow: hidden;
  background: #fff;
  border: 1.5px solid #fed7aa;
  border-radius: 16px;
  color: #7c2d12;
  cursor: pointer;
  text-align: left;
  box-shadow: 0 4px 14px rgba(249, 115, 22, 0.1);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.ttsc-ticket:hover {
  transform: translateY(-2px);
  border-color: #f97316;
  box-shadow: 0 12px 26px rgba(249, 115, 22, 0.22);
}

.ttsc-ticket:focus-visible {
  outline: 3px solid #fdba74;
  outline-offset: 2px;
}

.ttsc-ticket.is-best {
  border-color: #f97316;
  background: linear-gradient(135deg, #fff 55%, #fff4e5);
  box-shadow: 0 10px 26px rgba(249, 115, 22, 0.22);
}

.ttsc-ribbon {
  position: absolute;
  top: 0;
  right: 0;
  padding: 3px 10px 3px 12px;
  border-radius: 0 14px 0 12px;
  background: linear-gradient(90deg, #16a34a, #22c55e);
  color: #fff;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.7px;
  text-transform: uppercase;
}

.ttsc-stub {
  position: relative;
  flex-shrink: 0;
  width: 84px;
  padding: 14px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #f97316, #f59e0b);
  color: #fff;
}

.ttsc-stub b {
  font-size: 25px;
  font-weight: 900;
  line-height: 1;
}

.ttsc-stub i {
  margin-top: 2px;
  font-size: 10px;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 1.5px;
  opacity: 0.95;
}

/* perforation + notches between stub and main */
.ttsc-stub::after {
  content: "";
  position: absolute;
  right: -1px;
  top: 6px;
  bottom: 6px;
  border-right: 2px dashed rgba(255, 255, 255, 0.7);
}

.ttsc-stub::before,
.ttsc-ticket-main::before {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fffdf9;
  border: 1.5px solid #fed7aa;
  z-index: 1;
}

.ttsc-stub::before {
  right: -8px;
  top: -8px;
}

.ttsc-ticket-main {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 12px 8px 12px 16px;
}

.ttsc-ticket-main::before {
  left: -8px;
  bottom: -8px;
}

.ttsc-ticket-main strong {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 1.6px;
  color: #9a3412;
}

.ttsc-ticket-main small {
  font-size: 11.5px;
  line-height: 1.35;
  color: #9a5a3a;
}

.ttsc-copy {
  align-self: center;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 12px;
  padding: 7px 11px;
  border-radius: 9px;
  background: #ffedd5;
  color: #c2410c;
  font-size: 11px;
  font-weight: 800;
  transition: background 0.15s ease, color 0.15s ease;
}

.ttsc-ticket:hover .ttsc-copy {
  background: #f97316;
  color: #fff;
}

.ttsc-copy.is-copied {
  background: #dcfce7 !important;
  color: #15803d !important;
}

/* ---------- COUNTDOWN ---------- */

.ttsc-countdown-section {
  margin: 20px 0 18px;
  padding: 14px 10px 12px;
  border-radius: 16px;
  background: linear-gradient(180deg, #fff4e5, #fff9f1);
  border: 1px solid #fed7aa;
}

.ttsc-countdown-section > span {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  margin-bottom: 10px;
  color: #c2410c;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.2px;
  text-transform: uppercase;
}

.ttsc-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.ttsc-time-box {
  min-width: 58px;
  padding: 9px 6px 7px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  box-shadow: 0 3px 10px rgba(249, 115, 22, 0.12);
}

.ttsc-time-box strong {
  font-size: 22px;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(180deg, #ea580c, #c2410c);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.ttsc-time-box small {
  margin-top: 2px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.8px;
  color: #b45309;
}

/* ---------- CTA ---------- */

.ttsc-cta {
  position: relative;
  width: 100%;
  min-height: 54px;
  padding: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  overflow: hidden;
  border: none;
  border-radius: 14px;
  background: linear-gradient(90deg, #f97316, #f59e0b);
  color: #fff;
  font-size: 15px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(249, 115, 22, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.ttsc-cta::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  left: -80px;
  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  transform: skewX(-20deg);
  animation: ttsc-shine 3.4s ease-in-out infinite;
}

.ttsc-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(249, 115, 22, 0.5);
}

.ttsc-later {
  margin: 12px auto 0;
  display: block;
  padding: 6px 12px;
  border: none;
  background: transparent;
  color: #9a5a3a;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.ttsc-trust {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 14px;
  margin: 14px 0 0;
  padding: 12px 0 0;
  list-style: none;
  border-top: 1px dashed #fed7aa;
}

.ttsc-trust li {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #9a5a3a;
  font-size: 11px;
  font-weight: 700;
}

.ttsc-trust svg {
  color: #f97316;
}

.ttsc-terms {
  margin: 10px 0 0;
  color: #b8896a;
  font-size: 10px;
}

/* ---------- ANIMATIONS ---------- */

@keyframes ttsc-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ttsc-pop {
  from { opacity: 0; transform: translateY(22px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes ttsc-sheet {
  from { opacity: 0.6; transform: translateY(60px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes ttsc-twinkle {
  0%, 100% { opacity: 0.25; transform: scale(0.6) rotate(0deg); }
  50% { opacity: 1; transform: scale(1.1) rotate(25deg); }
}

@keyframes ttsc-flicker {
  0%, 100% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.08, 1.14) rotate(-3deg); }
  55% { transform: scale(0.96, 0.94) rotate(2deg); }
  80% { transform: scale(1.04, 1.08) rotate(-1deg); }
}

@keyframes ttsc-pulse {
  0% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0.65); }
  70% { box-shadow: 0 0 0 14px rgba(251, 146, 60, 0); }
  100% { box-shadow: 0 0 0 0 rgba(251, 146, 60, 0); }
}

@keyframes ttsc-seal {
  0%, 100% { transform: translateX(-50%) scale(1) rotate(-3deg); }
  50% { transform: translateX(-50%) scale(1.05) rotate(3deg); }
}

@keyframes ttsc-shine {
  0%, 55% { left: -80px; }
  100% { left: 120%; }
}

/* ---------- RESPONSIVE ---------- */

@media (max-width: 600px) {
  /* popup becomes a bottom sheet */
  .ttsc-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .ttsc-modal {
    max-width: none;
    max-height: 92dvh;
    border-radius: 24px 24px 0 0;
    animation-name: ttsc-sheet;
    padding-bottom: env(safe-area-inset-bottom);
  }

  .ttsc-hero {
    padding: 26px 18px 58px;
    border-radius: 24px 24px 0 0;
  }

  .ttsc-seal {
    width: 84px;
    height: 84px;
    bottom: -34px;
  }

  .ttsc-seal strong {
    font-size: 29px;
  }

  .ttsc-body {
    padding: 48px 16px 18px;
  }

  .ttsc-stub {
    width: 72px;
  }

  .ttsc-stub b {
    font-size: 22px;
  }

  .ttsc-copy {
    margin-right: 9px;
    padding: 6px 9px;
  }

  .ttsc-time-box {
    min-width: 52px;
  }

  .ttsc-dock {
    padding: 10px 7px 8px;
    gap: 6px;
  }

  .ttsc-dock-text strong {
    font-size: 11px;
    letter-spacing: 1.5px;
  }

  .ttsc-dock-text small {
    font-size: 9px;
  }
}

/* very short screens (landscape phones) */
@media (max-height: 520px) {
  .ttsc-dock-time {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ttsc-overlay,
  .ttsc-modal,
  .ttsc-spark,
  .ttsc-flame,
  .ttsc-seal,
  .ttsc-cta::after,
  .ttsc-dock-glow {
    animation: none;
  }
}
`;
