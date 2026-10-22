
import React, { useEffect, useState } from "react";
import {
  X,
  Copy,
  Check,
  ArrowRight,
  Gift,
  Clock3,
} from "lucide-react";

/* =============================================
   ENVIRONMENT CONFIGURATION
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

  id: env.VITE_SALE_ID || "dussehra-sale-2026",
  title: env.VITE_SALE_TITLE || "Dussehra Sale",
  discount: env.VITE_SALE_DISCOUNT || "10",
  coupon: env.VITE_SALE_COUPON || "DUSSEHRA10",

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

const storageKey = `targettrek_sale_dismissed_${SALE.id}`;

const getRemaining = () => {
  const deadline = Date.parse(SALE.endAt);

  if (!Number.isFinite(deadline)) return 0;

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
   MAIN CAMPAIGN COMPONENT
============================================= */

export default function SaleCampaign() {
  const countdown = useSaleCountdown();

  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const campaignActive = SALE.enabled && countdown.active;

  const isModalEnabled =
    campaignActive && SALE.showModal;

  const isBannerEnabled =
    campaignActive && SALE.showBanner;

  /* =============================================
     MODAL DISPLAY LOGIC
     - First visit: show after delay
     - Closed: hide for specified hours
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

  /* =============================================
     CLOSE MODAL
  ============================================= */

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
     PREVENT BACKGROUND SCROLL
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

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(SALE.coupon);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
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

  if (!isBannerEnabled && !isModalEnabled) {
    return null;
  }

  return (
    <>
      <style>{styles}</style>

      {/* ====================================
          TOP SALE BANNER
      ==================================== */}

      {isBannerEnabled && (
        <div className="ttsc-banner">
          <div className="ttsc-banner-content">

            <div className="ttsc-banner-title">
              <span className="ttsc-banner-emoji">
                🏹
              </span>

              <strong>{SALE.title}</strong>

              <span className="ttsc-banner-discount">
                Flat {SALE.discount}% OFF
              </span>
            </div>

            <button
              className="ttsc-banner-coupon"
              onClick={copyCoupon}
              title="Copy coupon"
              type="button"
            >
              {SALE.coupon}

              {copied ? (
                <Check size={13} />
              ) : (
                <Copy size={13} />
              )}
            </button>

            <div className="ttsc-banner-countdown">
              <Clock3 size={13} />
              <Countdown
                time={countdown}
                compact
              />
            </div>

            <button
              className="ttsc-banner-button"
              onClick={exploreBooks}
              type="button"
            >
              Shop Now
              <ArrowRight size={14} />
            </button>

          </div>
        </div>
      )}

      {/* ====================================
          SALE MODAL
      ==================================== */}

      {isModalEnabled && showModal && (
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
            aria-label={`${SALE.title} offer`}
          >

            <button
              className="ttsc-close"
              onClick={closeModal}
              aria-label="Close promotional offer"
              type="button"
            >
              <X size={19} />
            </button>

            <div className="ttsc-decoration">
              ✨ 🏹 ✨
            </div>

            <div className="ttsc-offer-label">
              <Gift size={14} />
              TARGET TREK FESTIVE OFFERS
            </div>

            <h2>
              Celebrate Victory,
              <br />
              Unlock Knowledge!
            </h2>

            <p className="ttsc-description">
              This Dussehra, take one step closer
              to your dream tech career.
              Upgrade your interview preparation
              with our exclusive festive offer!
            </p>

            <div className="ttsc-discount-box">
              <span>EXCLUSIVE DUSSEHRA OFFER</span>

              <strong>
                FLAT {SALE.discount}% OFF
              </strong>

              <small>
                ON ELIGIBLE TARGET TREK EBOOKS
              </small>
            </div>

            <button
              className="ttsc-coupon-box"
              onClick={copyCoupon}
              type="button"
            >
              <span>APPLY COUPON CODE</span>

              <strong>
                {SALE.coupon}

                {copied ? (
                  <Check size={19} />
                ) : (
                  <Copy size={19} />
                )}
              </strong>

              <small>
                {copied
                  ? "Coupon copied!"
                  : "Tap to copy coupon"}
              </small>
            </button>

            <div className="ttsc-countdown-section">
              <span>HURRY! OFFER ENDS IN</span>

              <Countdown time={countdown} />
            </div>

            <button
              className="ttsc-cta"
              onClick={exploreBooks}
              type="button"
            >
              Explore Books & Save
              <ArrowRight size={18} />
            </button>

            <button
              className="ttsc-later"
              onClick={closeModal}
              type="button"
            >
              Maybe Later
            </button>

            <p className="ttsc-terms">
              Limited-time festive offer.
              Coupon terms and eligibility apply.
            </p>

          </div>
        </div>
      )}
    </>
  );
}

/* =============================================
   STYLES
============================================= */

const styles = `

.ttsc-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  top: auto;

  width: 100%;
  z-index: 9990;

  background: linear-gradient(
    100deg,
    #422318,
    #75411f,
    #422318
  );

  color: #fff;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
}

.ttsc-banner-content {
  max-width: 1300px;
  min-height: 44px;
  margin: 0 auto;
  padding: 7px 16px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}


.ttsc-banner-content {
  min-height: 40px;
  max-width: 1300px;
  margin: 0 auto;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.ttsc-banner-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
}

.ttsc-banner-title strong {
  color: #ffe4ae;
  white-space: nowrap;
}

.ttsc-banner-emoji {
  font-size: 17px;
}

.ttsc-banner-discount {
  color: white;
  white-space: nowrap;
}

.ttsc-banner-coupon {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 10px;
  background: #ffffff18;
  border: 1px dashed #efc486;
  border-radius: 5px;
  color: #ffe4ae;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.ttsc-banner-countdown {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ffe4ae;
  font-size: 12px;
}

.ttsc-timer-compact {
  display: flex;
  align-items: center;
  gap: 4px;
  font-variant-numeric: tabular-nums;
}

.ttsc-banner-button {
  display: flex;
  align-items: center;
  gap: 5px;
  border: none;
  background: transparent;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.ttsc-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background: rgba(20, 13, 9, 0.72);
  backdrop-filter: blur(5px);
  animation: ttsc-fade 0.25s ease;
}

.ttsc-modal {
  position: relative;
  width: 100%;
  max-width: 430px;
  max-height: 92dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  background: #fff9f0;
  border: 1px solid #f2d7a9;
  border-radius: 20px;
  padding: 28px 25px 20px;
  color: #502d1b;
  text-align: center;
  box-shadow: 0 30px 90px #0006;
  animation: ttsc-pop 0.3s ease;
}

.ttsc-close {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f2e4d1;
  color: #654630;
  display: grid;
  place-items: center;
  cursor: pointer;
}

.ttsc-decoration {
  font-size: 26px;
  margin-bottom: 12px;
}

.ttsc-offer-label {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  color: #a56835;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.3px;
}

.ttsc-modal h2 {
  margin: 14px 0 12px;
  font-family: Georgia, serif;
  font-size: clamp(27px, 5vw, 35px);
  line-height: 1.2;
  color: #542b1a;
}

.ttsc-description {
  max-width: 340px;
  margin: 0 auto 20px;
  font-size: 13px;
  line-height: 1.7;
  color: #80634f;
}

.ttsc-discount-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  margin-bottom: 20px;
}

.ttsc-discount-box span {
  color: #ba6637;
  font-size: 10px;
  letter-spacing: 1.5px;
  font-weight: 700;
}

.ttsc-discount-box strong {
  color: #b34e22;
  font-size: clamp(28px, 8vw, 39px);
  letter-spacing: -1px;
}

.ttsc-discount-box small {
  color: #8a6d55;
  font-size: 10px;
  font-weight: 700;
}

.ttsc-coupon-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 15px;
  background: #f8ead5;
  border: 1px dashed #cc9b64;
  border-radius: 12px;
  color: #63351f;
  cursor: pointer;
}

.ttsc-coupon-box > span {
  font-size: 10px;
  letter-spacing: 1px;
}

.ttsc-coupon-box strong {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: clamp(19px, 6vw, 25px);
  letter-spacing: 2px;
  overflow-wrap: anywhere;
}

.ttsc-coupon-box small {
  color: #937359;
  font-size: 10px;
}

.ttsc-countdown-section {
  margin: 20px 0;
}

.ttsc-countdown-section > span {
  display: block;
  margin-bottom: 10px;
  color: #9b7556;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
}

.ttsc-timer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.ttsc-time-box {
  min-width: 54px;
  padding: 9px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f3e8d9;
  border-radius: 7px;
  color: #553423;
}

.ttsc-time-box strong {
  font-size: 19px;
  font-variant-numeric: tabular-nums;
}

.ttsc-time-box small {
  font-size: 9px;
  font-weight: 600;
}

.ttsc-cta {
  width: 100%;
  padding: 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 10px;
  background: #542e21;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease;
}

.ttsc-cta:hover {
  background: #783b25;
}

.ttsc-later {
  margin: 13px auto 0;
  display: block;
  border: none;
  background: transparent;
  color: #876c57;
  font-size: 12px;
  cursor: pointer;
}

.ttsc-terms {
  margin: 13px 0 0;
  color: #a18a75;
  font-size: 10px;
}

@keyframes ttsc-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ttsc-pop {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 600px) {
  .ttsc-banner-content {
    gap: 7px;
    padding: 7px 8px;
  }

  .ttsc-banner-title {
    font-size: 11px;
  }

  .ttsc-banner-coupon {
    font-size: 10px;
  }

  .ttsc-banner-button {
    display: none;
  }

  .ttsc-modal {
    padding: 26px 19px 18px;
    border-radius: 16px;
  }

  .ttsc-time-box {
    min-width: 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ttsc-overlay,
  .ttsc-modal {
    animation: none;
  }
}
`;
