import API_BASE_URL from "../utils/Url";
import { trackInitiateCheckout } from "../lib/metaPixel";
import { getAttribution } from "../lib/attribution";
import { runCheckout } from "./checkoutRunner";
import { preferredGateway, gatewayLabel } from "./gatewayConfig";
import { usePayFonts } from "./payShared";
import "./payment.css";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Headphones,
  Loader2,
  LockKeyhole,
  Mail,
  Percent,
  Phone,
  ShieldCheck,
  Swords,
  Tag,
  User,
  X,
  Zap,
} from "lucide-react";


const BASE_URL =
  API_BASE_URL;

// Gateway preference from the env (VITE_BOOKS_PAYMENT_GATEWAY / VITE_PAYMENT_GATEWAY). The backend decides what really charges;
// every gateway uses the same two requests below (create + verify), only the checkout window differs.
const ENV_GATEWAY = preferredGateway("books");
const PAYMENT_PROVIDER_NAME = gatewayLabel(ENV_GATEWAY);

const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  try {
    return localStorage.getItem("theme") ===
      "dark"
      ? "dark"
      : "light";
  } catch {
    return "light";
  }
};

const NAME_REGEX = /^[\p{L}][\p{L}\s.'’-]*$/u;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const EMAIL_DOMAIN_FIXES = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.in": "gmail.com",
  "gnail.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "yahoo.con": "yahoo.com",
  "outlok.com": "outlook.com",
  "outlook.con": "outlook.com",
};

const getEmailSuggestion = (email) => {
  const [user, domain] = String(email || "")
    .trim()
    .toLowerCase()
    .split("@");

  if (!user || !domain) {
    return "";
  }

  const fixed = EMAIL_DOMAIN_FIXES[domain];

  return fixed ? `${user}@${fixed}` : "";
};

const validateField = (name, rawValue) => {
  const value = String(rawValue ?? "").trim();

  if (name === "firstname") {
    if (!value) return "Please enter your name.";
    if (value.length < 2) return "Name must be at least 2 characters.";
    if (value.length > 60) return "Name is too long (max 60 characters).";
    if (!NAME_REGEX.test(value))
      return "Name can only contain letters, spaces and . ' -";
    return "";
  }

  if (name === "email") {
    if (!value) return "Please enter your email.";
    if (value.length > 254) return "Email is too long.";
    if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address.";
    return "";
  }

  if (name === "phone") {
    if (!value) return "Please enter your phone number.";
    if (!/^\d+$/.test(value)) return "Phone number can only contain digits.";
    if (value.length < 10)
      return `Enter all 10 digits (${value.length}/10).`;
    if (!PHONE_REGEX.test(value))
      return "Indian mobile numbers start with 6, 7, 8 or 9.";
    return "";
  }

  return "";
};

const FIELD_ORDER = ["firstname", "email", "phone"];

// Logged-in member's saved details, read synchronously from the same
// localStorage entry the auth slice uses (no network call, no latency).
const getSavedProfile = () => {
  try {
    if (!localStorage.getItem("token")) return null;

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) return null;

    const dial = String(user.countryCode || "+91").replace(/\D/g, "");
    let phone = "";

    // The checkout only takes Indian mobiles; skip other country codes.
    if (dial === "91") {
      phone = String(user.mobile || "").replace(/\D/g, "");
      if (phone.length > 10 && phone.startsWith("91")) phone = phone.slice(2);
      if (phone.length > 10 && phone.startsWith("0")) phone = phone.slice(1);
      phone = phone.slice(0, 10);
    }

    return {
      firstname: String(user.name || "").replace(/\s{2,}/g, " ").trim().slice(0, 60),
      email: String(user.email || "").trim().toLowerCase(),
      phone,
    };
  } catch {
    return null;
  }
};

/* =====================================================
   TEXT FIELD (module-level so it never remounts
   while the user is typing)
===================================================== */

function Field({
  id,
  label,
  Icon,
  error,
  prefix,
  counter,
  children,
  ...inputProps
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="tp-field-label">
        {label}
      </label>

      <div className={`tp-input-wrap${error ? " is-bad" : ""}`}>
        <Icon size={18} aria-hidden="true" className="tp-lead-icon" />

        {prefix && <span className="tp-prefix">{prefix}</span>}

        <input
          id={id}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className={`tp-input${prefix ? " has-prefix" : ""}${
            error ? " is-bad" : ""
          }`}
          {...inputProps}
        />

        {counter && <span className="tp-count">{counter}</span>}
      </div>

      {error && (
        <p id={`${id}-error`} role="alert" className="tp-field-error">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {children}
    </div>
  );
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function PayUCheckoutModal({
  isOpen,
  onClose,
  product,
}) {
  usePayFonts();

  const [theme, setTheme] = useState(getStoredTheme);

  const [formData, setFormData] = useState({
    firstname: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Coupons the admin chose to display on the payment page.
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAllOffers, setShowAllOffers] = useState(false);

  const panelRef = useRef(null);
  const isOpenRef = useRef(isOpen);

  const isDark = theme === "dark";

  const originalAmount = Number(product?.price || 0);
  const mrp = Number(product?.mrp || 0);

  const discountAmount = Number(appliedCoupon?.discountAmount || 0);

  const finalAmount = appliedCoupon
    ? Number(appliedCoupon.finalAmount)
    : originalAmount;

  const busy = paymentLoading;

  const emailSuggestion = useMemo(
    () => getEmailSuggestion(formData.email),
    [formData.email]
  );

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  /* ------------------------------------------------
     PREFILL FOR LOGGED-IN USERS
     Only fills fields that are still empty, so anything
     the user already typed is never overwritten, and
     every field stays editable.
  ------------------------------------------------ */

  useEffect(() => {
    if (!isOpen) return;

    const saved = getSavedProfile();
    if (!saved) return;

    setFormData((prev) => ({
      firstname: prev.firstname || saved.firstname,
      email: prev.email || saved.email,
      phone: prev.phone || saved.phone,
    }));
  }, [isOpen]);

  /* ------------------------------------------------
     RESET TRANSIENT STATE WHEN THE MODAL CLOSES
     (entered name / email / phone are kept so a
     returning visitor does not have to retype them)
  ------------------------------------------------ */

  useEffect(() => {
    if (!isOpen) {
      setShowCouponInput(false);
      setShowAllOffers(false);
      setCouponCode("");
      setCouponError("");
      setAppliedCoupon(null);
      setAvailableCoupons([]);
      setCouponLoading(false);
      setServerError("");
      setPaymentLoading(false);
      setErrors({});
      setTouched({});
    }
  }, [isOpen]);

  /* ------------------------------------------------
     COUPONS SHOWN ON THE PAYMENT PAGE
     Refetched (debounced) once a valid email is typed
     so coupons the customer already used are hidden.
  ------------------------------------------------ */

  useEffect(() => {
    if (!isOpen || !product?._id || product?.offer) {
      return undefined;
    }

    const controller = new AbortController();

    const email = formData.email.trim().toLowerCase();
    const emailLooksValid = EMAIL_REGEX.test(email);

    const timer = setTimeout(
      async () => {
        try {
          const params = new URLSearchParams({
            bookId: product._id,
            amount: String(originalAmount),
          });

          if (emailLooksValid) {
            params.set("email", email);
          }

          const response = await fetch(
            `${BASE_URL}/api/coupon/available?${params.toString()}`,
            { signal: controller.signal }
          );

          const result = await response.json().catch(() => null);

          if (response.ok && result?.success) {
            setAvailableCoupons(result.data?.coupons || []);
          }
        } catch {
          // Offers are optional; ignore failures.
        }
      },
      emailLooksValid ? 600 : 0
    );

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, product?._id, originalAmount, formData.email]);

  /* ------------------------------------------------
     THEME SYNC
  ------------------------------------------------ */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const syncTheme = () => setTheme(getStoredTheme());

    syncTheme();

    window.addEventListener("storage", syncTheme);

    return () => window.removeEventListener("storage", syncTheme);
  }, [isOpen]);

  /* ------------------------------------------------
     LOCK PAGE SCROLL WHILE OPEN
  ------------------------------------------------ */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const oldOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = oldOverflow;
    };
  }, [isOpen]);

  /* ------------------------------------------------
     CLOSING
     - blocked only while a payment is being started
     - Escape key, backdrop click and the X button
       all go through requestClose
  ------------------------------------------------ */

  const requestClose = useCallback(() => {
    if (paymentLoading) {
      return;
    }

    onClose?.();
  }, [paymentLoading, onClose]);

  /* ------------------------------------------------
     KEYBOARD: Escape closes, Tab stays inside the
     dialog (focus trap)
  ------------------------------------------------ */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        requestClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) {
        return;
      }

      const items = Array.from(
        panelRef.current.querySelectorAll(FOCUSABLE)
      ).filter((el) => el.offsetParent !== null);

      if (!items.length) {
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, requestClose]);

  /* ------------------------------------------------
     FOCUS MANAGEMENT
     Desktop: focus the first empty field.
     Touch devices: focus the dialog itself so the
     on-screen keyboard does not cover the form.
     On close, focus returns to what opened it.
  ------------------------------------------------ */

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previouslyFocused = document.activeElement;

    const timer = setTimeout(() => {
      const finePointer = window.matchMedia?.("(pointer: fine)")?.matches;

      if (finePointer) {
        const firstEmpty = FIELD_ORDER.find(
          (name) => !formData[name]
        );

        document
          .getElementById(
            `checkout-${firstEmpty === "firstname" || !firstEmpty ? "name" : firstEmpty}`
          )
          ?.focus();
      } else {
        panelRef.current?.focus();
      }
    }, 60);

    return () => {
      clearTimeout(timer);

      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    };
    // Only when opening/closing, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ------------------------------------------------
     Coming back from the payment page with the
     browser Back button restores this page from the
     cache with the loader still on. Reset it.
  ------------------------------------------------ */

  useEffect(() => {
    const onPageShow = (event) => {
      if (event.persisted) {
        setPaymentLoading(false);
      }
    };

    window.addEventListener("pageshow", onPageShow);

    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  /* ------------------------------------------------
     FORMATTING
  ------------------------------------------------ */

  const formatMoney = (amount) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: product?.currency || "INR",
        maximumFractionDigits: 2,
      }).format(Number(amount || 0));
    } catch {
      return `₹${Number(amount || 0)}`;
    }
  };

  /* ------------------------------------------------
     FORM HANDLERS
  ------------------------------------------------ */

  const handleChange = (event) => {
    const { name, value } = event.target;

    let finalValue = value;

    if (name === "phone") {
      // Accept pasted "+91 98765 43210" / "098765-43210"
      let digits = value.replace(/\D/g, "");

      if (digits.length > 10 && digits.startsWith("91")) {
        digits = digits.slice(2);
      }

      if (digits.length > 10 && digits.startsWith("0")) {
        digits = digits.slice(1);
      }

      finalValue = digits.slice(0, 10);
    }

    if (name === "firstname") {
      finalValue = value.replace(/\s{2,}/g, " ").slice(0, 60);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Once a field has been visited, validate it live.
    setErrors((prev) => ({
      ...prev,
      [name]: touched[name] ? validateField(name, finalValue) : "",
    }));

    setServerError("");

    if (name === "email" && appliedCoupon) {
      setAppliedCoupon(null);
      setCouponError("Email changed. Please apply the coupon again.");
    }
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;

    setTouched((prev) => ({ ...prev, [name]: true }));

    // Tidy whitespace without fighting the cursor while typing.
    const cleaned =
      name === "firstname" || name === "email" ? value.trim() : value;

    if (cleaned !== value) {
      setFormData((prev) => ({ ...prev, [name]: cleaned }));
    }

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, cleaned),
    }));
  };

  const applyEmailSuggestion = () => {
    setFormData((prev) => ({ ...prev, email: emailSuggestion }));
    setErrors((prev) => ({ ...prev, email: "" }));

    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponError("Email changed. Please apply the coupon again.");
    }
  };

  const handleCouponChange = (event) => {
    const value = event.target.value.toUpperCase().replace(/\s+/g, "");

    setCouponCode(value.slice(0, 30));
    setCouponError("");

    if (appliedCoupon) {
      setAppliedCoupon(null);
    }
  };

  const handleApplyCoupon = async (codeOverride) => {
    const normalizedCode = String(
      typeof codeOverride === "string" ? codeOverride : couponCode
    )
      .trim()
      .toUpperCase();

    if (!normalizedCode) {
      setCouponError("Enter a coupon code.");
      return;
    }

    if (!product?._id) {
      setCouponError("Book information is unavailable.");
      return;
    }

    // A malformed email would make the server ignore per-user limits.
    const emailForCoupon = EMAIL_REGEX.test(formData.email.trim())
      ? formData.email.trim().toLowerCase()
      : null;

    try {
      setCouponLoading(true);
      setCouponError("");
      setAppliedCoupon(null);
      setServerError("");

      const response = await fetch(`${BASE_URL}/api/coupon/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: normalizedCode,
          bookId: product._id,
          email: emailForCoupon,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Unable to apply coupon.");
      }

      // The modal may have been closed while we were waiting.
      if (!isOpenRef.current) {
        return;
      }

      setAppliedCoupon(result.data);
      setCouponCode(result.data?.couponCode || normalizedCode);
      setCouponError("");
    } catch (error) {
      console.error("Coupon validation error:", error);

      if (!isOpenRef.current) {
        return;
      }

      setAppliedCoupon(null);
      setCouponError(error?.message || "Unable to apply coupon.");
    } finally {
      if (isOpenRef.current) {
        setCouponLoading(false);
      }
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setShowCouponInput(false);
  };

  const validateForm = () => {
    const newErrors = {};

    FIELD_ORDER.forEach((name) => {
      const message = validateField(name, formData[name]);

      if (message) {
        newErrors[name] = message;
      }
    });

    setErrors(newErrors);
    setTouched({ firstname: true, email: true, phone: true });

    const firstInvalid = FIELD_ORDER.find((name) => newErrors[name]);

    if (firstInvalid) {
      const id = firstInvalid === "firstname" ? "name" : firstInvalid;

      document.getElementById(`checkout-${id}`)?.focus();
    }

    return !firstInvalid;
  };

  const getAffiliateCode =
    () => {
      try {
        const affiliateCode =
          localStorage.getItem(
            "referralCode"
          );

        if (!affiliateCode) {
          return "tt";
        }

        return affiliateCode
          .trim()
          .toLowerCase();
      } catch (error) {
        console.error(
          "Unable to read affiliate code:",
          error
        );

        return "tt";
      }
    };

  const getPaymentPayload =
    () => {
      const affiliateCode =
        getAffiliateCode();

      const params =
        new URLSearchParams(
          window.location
            .search
        );

      const validatedCouponCode =
        appliedCoupon
          ? couponCode
              .trim()
              .toUpperCase()
          : null;

      return {
        bookId:
          product._id,

        // Multi-book offer: the server re-validates and re-prices this
        ...(product.offer
          ? {
              offerId: product.offer.offerId,
              bookIds: product.offer.bookIds,
              expectedAmount: product.offer.expectedAmount,
            }
          : {}),

        firstname:
          formData.firstname
            .trim(),

        email:
          formData.email
            .trim()
            .toLowerCase(),

        phone:
          formData.phone
            .trim(),

        couponCode:
          validatedCouponCode,

        affiliateCode,

        utmSource:
          params.get(
            "utm_source"
          ) || null,

        utmMedium:
          params.get(
            "utm_medium"
          ) || null,

        utmCampaign:
          params.get(
            "utm_campaign"
          ) || null,

        // Last paid-ad touch (Meta / Google) saved on the order
        attribution:
          getAttribution(),

        // Preferred gateway from the env; the server only honours it if that gateway is configured.
        gateway: ENV_GATEWAY,
      };
    };

  /* The Razorpay popup's signed result goes to our server, which asks the gateway. */
  const verifyPopupPayment = async (orderId, razorpayResponse) => {
    const response = await fetch(`${BASE_URL}/payment/books/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, payload: razorpayResponse }),
    });

    const result = await response.json().catch(() => null);

    if (response.status === 202) {
      throw new Error("Your payment is still being confirmed. If money was deducted, you will receive access by email shortly.");
    }

    if (!response.ok || !result?.success || !result?.data?.redirectUrl) {
      throw new Error(result?.message || "Payment verification failed. Please contact support if money was deducted.");
    }

    return result.data;
  };

  /* ONE request for every gateway (PayU, Razorpay, Cashfree, ...): the server validates, prices, creates the order,
     and answers with the `checkout` for whichever gateway it used. */
  const startPayment = async (paymentPayload) => {
    const response = await fetch(`${BASE_URL}/payment/books/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentPayload),
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.success) {
      throw new Error(result?.message || "Unable to start payment.");
    }

    const { orderId, checkout } = result.data || {};

    if (!orderId || !checkout) {
      throw new Error("Invalid payment information received from server.");
    }

    const outcome = await runCheckout({
      checkout,
      name: checkout.name || "Target Trek",
      description: product?.title || "Target Trek Ebook",
      prefill: {
        name: formData.firstname.trim(),
        email: formData.email.trim().toLowerCase(),
        contact: formData.phone.trim(),
      },
      onPaid: async (razorpayResponse) => {
        setPaymentLoading(true);
        setServerError("");
        const verified = await verifyPopupPayment(orderId, razorpayResponse);
        window.location.href = verified.redirectUrl;
        return { status: "verified" };
      },
    });

    // Popup closed or failed: let the buyer try again. (Cashfree / PayU leave the page and return through the server.)
    if (outcome.status === "dismissed" || outcome.status === "failed") {
      if (outcome.message) setServerError(outcome.message);
      setPaymentLoading(false);
    }
  };

const handlePayment = async (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  if (!product?._id) {
    setServerError(
      "Book information is unavailable. Please refresh the page."
    );
    return;
  }

  if (paymentLoading) return;

  try {
    setPaymentLoading(true);
    setServerError("");

    const paymentPayload = getPaymentPayload();

    // META PIXEL - InitiateCheckout
    trackInitiateCheckout({
      id: String(product._id),
      title: product.title,
      price: finalAmount,
      currency: product.currency || "INR",
    });

    await startPayment(paymentPayload);

  } catch (error) {
    console.error(
      `${PAYMENT_PROVIDER_NAME} payment error:`,
      error
    );

    setServerError(
      error?.message ||
      "Unable to start payment. Please try again."
    );

    setPaymentLoading(false);
  }
};


  if (!isOpen) {
    return null;
  }

  const offersToShow = showAllOffers
    ? availableCoupons
    : availableCoupons.slice(0, 2);

  const savingOnMrp = mrp > originalAmount ? mrp - originalAmount : 0;

  const discountPercent =
    mrp > originalAmount
      ? Math.round(((mrp - originalAmount) / mrp) * 100)
      : 0;

  const priceSummary = (
    <div className="tp-summary">
      <h3>Order summary</h3>

      <div className="tp-sum-row">
        <span className="tp-muted">Item price</span>
        <strong>{formatMoney(originalAmount)}</strong>
      </div>

      {savingOnMrp > 0 && (
        <div className="tp-sum-row small">
          <span className="tp-muted">
            MRP <s>{formatMoney(mrp)}</s>
          </span>
          <span className="ok">You save {formatMoney(savingOnMrp)}</span>
        </div>
      )}

      {appliedCoupon && (
        <div className="tp-sum-row">
          <span className="ok" style={{ display: "flex", gap: 6, alignItems: "center", minWidth: 0 }}>
            <Percent size={14} style={{ flex: "none" }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              Coupon {appliedCoupon.couponCode}
            </span>
          </span>
          <span className="ok">&minus;{formatMoney(discountAmount)}</span>
        </div>
      )}

      <hr className="tp-sum-sep" />

      <div className="tp-sum-total">
        <b>Total payable</b>
        <strong>{formatMoney(finalAmount)}</strong>
      </div>
    </div>
  );

  return (
    <div className="tp tp-overlay" data-theme={isDark ? "dark" : "light"}>
      {/* BACKDROP */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close checkout"
        disabled={busy}
        onClick={requestClose}
        className="tp-backdrop"
      />

      {/* DIALOG */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        aria-busy={busy}
        tabIndex={-1}
        className="tp-dialog"
      >
        {/* HEADER */}
        <div className="tp-dialog-head" style={{ flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: "1 1 auto" }}>
            <span className="tp-grab" aria-hidden="true" />
            <span className="tp-eyebrow">
              <ShieldCheck size={14} />
              Secure checkout
            </span>
            <h2 id="checkout-title" className="tp-h tp-dialog-title" style={{ marginTop: 4 }}>
              Complete your <span className="tp-mark">purchase</span>
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close checkout"
            disabled={busy}
            onClick={requestClose}
            className="tp-close"
          >
            <X size={20} />
          </button>
        </div>

        {/* SCROLLING BODY */}
        <div className="tp-dialog-scroll">
          <div className="tp-dialog-grid">
            {/* ORDER (left on desktop, top on mobile) */}
            <aside className="tp-aside">
              <div className="tp-product">
                {product?.coverPageUrl ? (
                  <img
                    src={product.coverPageUrl}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    className="tp-cover"
                  />
                ) : null}

                <div style={{ minWidth: 0, flex: 1 }}>
                  <p className="tp-product-title" style={{ margin: 0 }}>
                    {product?.title || "Target Trek Ebook"}
                  </p>

                  {product?.offer?.titles?.length > 0 && (
                    <ul className="tp-product-list">
                      {product.offer.titles.slice(0, 6).map((title, i) => (
                        <li key={i}>• {title}</li>
                      ))}
                      {product.offer.titles.length > 6 && (
                        <li>+ {product.offer.titles.length - 6} more</li>
                      )}
                    </ul>
                  )}

                  <div className="tp-price-row">
                    <span className="tp-price">{formatMoney(finalAmount)}</span>

                    {(appliedCoupon || savingOnMrp > 0) && (
                      <span className="tp-strike">
                        {formatMoney(appliedCoupon ? originalAmount : mrp)}
                      </span>
                    )}

                    {!appliedCoupon && discountPercent > 0 && (
                      <span className="tp-off">{discountPercent}% OFF</span>
                    )}

                    {appliedCoupon && <span className="tp-off">Coupon applied</span>}
                  </div>
                </div>
              </div>

              {/* Prep Arena credits that come with this book (hidden when 0) */}
              {Number(product?.matches) > 0 && (
                <div className="tp-credit">
                  <span className="tp-ico" aria-hidden="true" style={{ width: 34, height: 34 }}>
                    <Swords size={16} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <b>
                      Includes {product.matches} Prep Arena{" "}
                      {Number(product.matches) === 1 ? "credit" : "credits"}
                    </b>
                    <span>
                      1 credit = 1 match = 1 buddy partnership. Added when you sign up on Prep Arena with this email.
                    </span>
                  </div>
                </div>
              )}

              {/* desktop-only: breakdown + reassurance */}
              <div className="tp-aside-extra">
                {priceSummary}

                <ul className="tp-trust">
                  {[
                    [Zap, "Instant access right after payment"],
                    [ShieldCheck, `Secure payment via ${PAYMENT_PROVIDER_NAME}`],
                    [Headphones, "Help at supporttargettrek@gmail.com"],
                  ].map(([Icon, text]) => (
                    <li key={text}>
                      <span className="tp-ico">
                        <Icon size={15} />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* FORM */}
            <form id="checkout-form" noValidate onSubmit={handlePayment} className="tp-form">
              <p className="tp-lead">
                Enter your details to continue to{" "}
                <strong>{PAYMENT_PROVIDER_NAME}</strong>
              </p>

              <Field
                id="checkout-name"
                label="Full name"
                Icon={User}
                type="text"
                name="firstname"
                autoComplete="name"
                autoCapitalize="words"
                enterKeyHint="next"
                value={formData.firstname}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={busy}
                placeholder="Enter your full name"
                error={errors.firstname}
              />

              <Field
                id="checkout-email"
                label="Email address"
                Icon={Mail}
                type="email"
                name="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                inputMode="email"
                enterKeyHint="next"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={busy}
                placeholder="you@example.com"
                error={errors.email}
              >
                {emailSuggestion && !errors.email && (
                  <button type="button" onClick={applyEmailSuggestion} className="tp-suggest">
                    Did you mean {emailSuggestion}?
                  </button>
                )}
              </Field>

              <Field
                id="checkout-phone"
                label="Mobile number"
                Icon={Phone}
                prefix="+91"
                counter={formData.phone ? `${formData.phone.length}/10` : undefined}
                type="tel"
                name="phone"
                autoComplete="tel-national"
                inputMode="numeric"
                enterKeyHint="done"
                maxLength={14}
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={busy}
                placeholder="98765 43210"
                error={errors.phone}
              />

              <p className="tp-lead" style={{ fontSize: 12.5, marginTop: -6 }}>
                Your books unlock on the next page right after payment, ready to download.
              </p>

              {/* COUPONS (not combinable with a multi-book offer) */}
              {product?.offer ? (
                <div className="tp-note">
                  Offer price applied for {product.offer.bookIds.length} books. Coupons can't be combined with this offer.
                </div>
              ) : (
                <div className="tp-coupon-zone">
                  {!appliedCoupon && availableCoupons.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <p className="tp-offers-head">
                        <Percent size={14} />
                        Available offers
                      </p>

                      <div>
                        {offersToShow.map((offer, index) => (
                          <div key={offer.code} className="tp-offer">
                            <div style={{ minWidth: 0 }}>
                              <div>
                                <span className="tp-offer-code">{offer.code}</span>
                                {index === 0 && availableCoupons.length > 1 && (
                                  <span className="tp-offer-best">Best saving</span>
                                )}
                              </div>

                              <p>
                                Save {formatMoney(offer.discountAmount)}{" "}
                                <small>&middot; pay {formatMoney(offer.finalAmount)}</small>
                              </p>

                              <p className="tp-offer-desc">{offer.description || offer.name}</p>
                            </div>

                            <button
                              type="button"
                              disabled={couponLoading || busy}
                              onClick={() => {
                                setShowCouponInput(true);
                                setCouponCode(offer.code);
                                handleApplyCoupon(offer.code);
                              }}
                              className="tp-btn tp-btn-primary tp-btn-sm"
                              style={{ flex: "none" }}
                            >
                              {couponLoading ? "..." : "Apply"}
                            </button>
                          </div>
                        ))}
                      </div>

                      {availableCoupons.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setShowAllOffers((value) => !value)}
                          className="tp-link-btn"
                          style={{ marginTop: 4, color: "var(--tp-warn)" }}
                        >
                          {showAllOffers
                            ? "Show fewer offers"
                            : `Show ${availableCoupons.length - 2} more`}
                          <ChevronDown
                            size={15}
                            style={{
                              transition: "transform .2s",
                              transform: showAllOffers ? "rotate(180deg)" : "none",
                            }}
                          />
                        </button>
                      )}
                    </div>
                  )}

                  {appliedCoupon ? (
                    <div className="tp-applied">
                      <div style={{ display: "flex", gap: 10, minWidth: 0 }}>
                        <CheckCircle2 size={21} style={{ flex: "none", marginTop: 1 }} />
                        <div style={{ minWidth: 0 }}>
                          <b>{appliedCoupon.couponCode} applied</b>
                          <span>You save {formatMoney(discountAmount)} on this order</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={handleRemoveCoupon}
                        className="tp-btn tp-btn-ghost tp-btn-sm"
                        style={{ flex: "none" }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : !showCouponInput && !couponError ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        setShowCouponInput(true);
                        setCouponError("");
                      }}
                      className="tp-link-btn"
                    >
                      <Tag size={16} />
                      Have a coupon code?
                    </button>
                  ) : (
                    <div>
                      <label htmlFor="coupon-code" className="tp-field-label">
                        Coupon code
                      </label>

                      <div className="tp-coupon-row">
                        <div className={`tp-input-wrap${couponError ? " is-bad" : ""}`}>
                          <Tag size={17} aria-hidden="true" className="tp-lead-icon" />

                          <input
                            id="coupon-code"
                            type="text"
                            autoCapitalize="characters"
                            autoCorrect="off"
                            spellCheck={false}
                            enterKeyHint="go"
                            value={couponCode}
                            onChange={handleCouponChange}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                // Never submit the payment form from here.
                                event.preventDefault();

                                if (couponCode.trim() && !couponLoading) {
                                  handleApplyCoupon();
                                }
                              }
                            }}
                            disabled={busy || couponLoading}
                            aria-invalid={couponError ? "true" : "false"}
                            aria-describedby={couponError ? "coupon-error" : undefined}
                            placeholder="Enter coupon code"
                            className={`tp-input coupon${couponError ? " is-bad" : ""}`}
                          />
                        </div>

                        <button
                          type="button"
                          disabled={!couponCode.trim() || couponLoading || busy}
                          onClick={() => handleApplyCoupon()}
                          className="tp-btn tp-btn-primary"
                          style={{ minWidth: 92, flex: "none", minHeight: 52 }}
                        >
                          {couponLoading ? <Loader2 size={18} className="tp-spin" /> : "Apply"}
                        </button>
                      </div>

                      {couponError && (
                        <p id="coupon-error" role="alert" className="tp-alert tp-alert-bad" style={{ marginTop: 10 }}>
                          <AlertCircle size={15} />
                          {couponError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* mobile / tablet: breakdown sits under the form */}
              <div className="tp-summary-mobile">{priceSummary}</div>
            </form>
          </div>
        </div>

        {/* FOOTER: always visible, safe-area aware */}
        <div className="tp-dialog-foot">
          {serverError && (
            <div role="alert" className="tp-alert tp-alert-bad">
              <AlertCircle size={17} />
              <span>{serverError}</span>
            </div>
          )}

          <button
            type="submit"
            form="checkout-form"
            disabled={busy || !product?._id}
            className="tp-btn tp-btn-primary tp-btn-block tp-pay-btn"
          >
            {busy ? (
              <>
                <Loader2 size={20} className="tp-spin" />
                Connecting to {PAYMENT_PROVIDER_NAME}...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                Pay {formatMoney(finalAmount)} securely
              </>
            )}
          </button>

          <p className="tp-safe">
            <LockKeyhole size={13} style={{ flex: "none" }} />
            <span>
              Encrypted and processed by <strong>{PAYMENT_PROVIDER_NAME}</strong>
            </span>
            <BadgeCheck size={13} style={{ flex: "none" }} />
          </p>
        </div>
      </div>
    </div>
  );
}
