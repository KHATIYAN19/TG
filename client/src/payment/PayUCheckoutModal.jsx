import { trackInitiateCheckout } from "../lib/metaPixel";
import { getAttribution } from "../lib/attribution";
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
  import.meta.env.VITE_BASE_URL ||
  "https://target-trek.onrender.com";

const rawPaymentGateway = String(
  import.meta.env.VITE_PAYMENT_GATEWAY || "payu"
)
  .trim()
  .toLowerCase();

const Payment_gateway = [
  "payu",
  "razorpay",
  "cashfree",
].includes(rawPaymentGateway)
  ? rawPaymentGateway
  : "payu";

const PAYMENT_PROVIDER_NAME =
  Payment_gateway === "razorpay"
    ? "Razorpay"
    : Payment_gateway === "cashfree"
      ? "Cashfree"
      : "PayU";

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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript =
      document.getElementById(
        "razorpay-checkout-script"
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () =>
          resolve(
            Boolean(window.Razorpay)
          ),
        {
          once: true,
        }
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        {
          once: true,
        }
      );

      return;
    }

    const script =
      document.createElement("script");

    script.id =
      "razorpay-checkout-script";

    script.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => {
      resolve(
        Boolean(window.Razorpay)
      );
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(
      script
    );
  });
};

const loadCashfreeScript = () => {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Cashfree) {
      resolve(true);
      return;
    }

    const existingScript =
      document.getElementById(
        "cashfree-checkout-script"
      );

    if (existingScript) {
      existingScript.addEventListener(
        "load",
        () =>
          resolve(
            Boolean(window.Cashfree)
          ),
        {
          once: true,
        }
      );

      existingScript.addEventListener(
        "error",
        () => resolve(false),
        {
          once: true,
        }
      );

      return;
    }

    const script =
      document.createElement("script");

    script.id =
      "cashfree-checkout-script";

    script.src =
      "https://sdk.cashfree.com/js/v3/cashfree.js";

    script.async = true;

    script.onload = () => {
      resolve(
        Boolean(window.Cashfree)
      );
    };

    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(
      script
    );
  });
};


/* =====================================================
   VALIDATION
===================================================== */

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

/* =====================================================
   THEME TOKENS (light / dark share one structure)
===================================================== */

const getTokens = (isDark) =>
  isDark
    ? {
        panel: "border-slate-700/80 bg-slate-900 text-slate-100",
        header: "border-slate-800",
        aside: "border-slate-800 bg-slate-950/60",
        footer: "border-slate-800 bg-slate-900",
        title: "text-white",
        text: "text-slate-200",
        muted: "text-slate-400",
        faint: "text-slate-500",
        label: "text-slate-300",
        divider: "border-slate-800",
        dashed: "border-slate-700",
        accent: "text-orange-400",
        chip: "bg-orange-500/10 text-orange-300 ring-1 ring-inset ring-orange-400/25",
        close:
          "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white",
        input: "bg-slate-950 text-slate-100 placeholder:text-slate-600",
        inputOk:
          "border-slate-700 hover:border-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15",
        inputErr:
          "border-red-500 focus:border-red-400 focus:ring-4 focus:ring-red-500/15",
        icon: "text-slate-500",
        card: "border-slate-800 bg-slate-900/70",
        success: "text-emerald-400",
        successBox: "border-emerald-500/30 bg-emerald-500/10",
        successText: "text-emerald-300",
        errBox: "border-red-500/30 bg-red-500/10 text-red-300",
        errText: "text-red-400",
        offer: "border-amber-500/40 bg-amber-500/10",
        offerCode: "bg-amber-500/20 text-amber-200",
        offerHead: "text-amber-300",
        ghostBtn:
          "border-slate-700 text-slate-300 hover:bg-slate-800",
        applyBtn:
          "bg-orange-500 text-white hover:bg-orange-400 disabled:bg-slate-800 disabled:text-slate-600",
        backdrop: "bg-black/70",
      }
    : {
        panel: "border-orange-100 bg-white text-slate-900",
        header: "border-orange-100 bg-gradient-to-r from-orange-50 via-white to-white",
        aside: "border-orange-100 bg-orange-50/40",
        footer: "border-orange-100 bg-white",
        title: "text-slate-950",
        text: "text-slate-800",
        muted: "text-slate-500",
        faint: "text-slate-400",
        label: "text-slate-700",
        divider: "border-orange-100",
        dashed: "border-orange-200",
        accent: "text-orange-600",
        chip: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
        close:
          "bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-800",
        input: "bg-white text-slate-900 placeholder:text-slate-400",
        inputOk:
          "border-orange-100 hover:border-orange-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100",
        inputErr:
          "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100",
        icon: "text-slate-400",
        card: "border-orange-100 bg-white shadow-sm shadow-orange-100/60",
        success: "text-green-600",
        successBox: "border-green-200 bg-green-50",
        successText: "text-green-800",
        errBox: "border-red-200 bg-red-50 text-red-700",
        errText: "text-red-600",
        offer: "border-amber-300 bg-amber-50",
        offerCode: "bg-amber-500 text-white",
        offerHead: "text-amber-700",
        ghostBtn: "border-orange-200 text-orange-700 hover:bg-orange-50",
        applyBtn:
          "bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-200",
        backdrop: "bg-orange-950/35",
      };

/* =====================================================
   ANIMATIONS (respect reduced motion)
===================================================== */

const MODAL_CSS = `
@keyframes ttCheckoutFade { from { opacity: 0 } to { opacity: 1 } }
@keyframes ttCheckoutSheet { from { transform: translateY(40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
@keyframes ttCheckoutPop { from { transform: translateY(14px) scale(.97); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }
.tt-co-backdrop { animation: ttCheckoutFade .2s ease-out both }
.tt-co-panel { animation: ttCheckoutSheet .28s cubic-bezier(.2,.8,.2,1) both }
@media (min-width: 640px) { .tt-co-panel { animation-name: ttCheckoutPop } }
@media (prefers-reduced-motion: reduce) {
  .tt-co-backdrop, .tt-co-panel { animation: none }
}
`;

/* =====================================================
   TEXT FIELD (module-level so it never remounts
   while the user is typing)
===================================================== */

function Field({
  id,
  label,
  Icon,
  error,
  t,
  prefix,
  counter,
  children,
  ...inputProps
}) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1.5 block text-sm font-bold ${t.label}`}
      >
        {label}
      </label>

      <div className="relative">
        <Icon
          size={18}
          aria-hidden="true"
          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
            error ? "text-red-400" : t.icon
          }`}
        />

        {prefix && (
          <span
            className={`pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 text-base font-semibold sm:text-sm ${t.muted}`}
          >
            {prefix}
          </span>
        )}

        <input
          id={id}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border py-3 pr-4 text-base outline-none transition sm:text-sm ${
            prefix ? "pl-[4.5rem]" : "pl-11"
          } ${t.input} ${
            error ? t.inputErr : t.inputOk
          } disabled:cursor-not-allowed disabled:opacity-60`}
          {...inputProps}
        />

        {counter && (
          <span
            className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold ${t.faint}`}
          >
            {counter}
          </span>
        )}
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className={`mt-1.5 flex items-start gap-1 text-xs font-medium ${t.errText}`}
        >
          <AlertCircle size={13} className="mt-px shrink-0" />
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
  const t = useMemo(() => getTokens(isDark), [isDark]);

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
      };
    };

  const submitToPayU = (
    paymentUrl,
    paymentData
  ) => {
    if (
      !paymentUrl ||
      !paymentData
    ) {
      throw new Error(
        "Invalid PayU payment response."
      );
    }

    const form =
      document.createElement(
        "form"
      );

    form.method = "POST";

    form.action =
      paymentUrl;

    form.style.display =
      "none";

    Object.entries(
      paymentData
    ).forEach(
      ([key, value]) => {
        const input =
          document.createElement(
            "input"
          );

        input.type =
          "hidden";

        input.name =
          key;

        input.value =
          value ?? "";

        form.appendChild(
          input
        );
      }
    );

    document.body.appendChild(
      form
    );

    form.submit();
  };

  const startPayUPayment =
    async (
      paymentPayload
    ) => {
      const response =
        await fetch(
          `${BASE_URL}/payment/payu/create`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                paymentPayload
              ),
          }
        );

      const result =
        await response
          .json()
          .catch(
            () => null
          );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to start PayU payment."
        );
      }

      const paymentUrl =
        result?.data
          ?.paymentUrl;

      const paymentData =
        result?.data
          ?.paymentData;

      if (
        !paymentUrl ||
        !paymentData
      ) {
        throw new Error(
          "Invalid PayU payment information received from server."
        );
      }

      submitToPayU(
        paymentUrl,
        paymentData
      );
    };

  const verifyRazorpayPayment =
    async (
      razorpayResponse
    ) => {
      const response =
        await fetch(
          `${BASE_URL}/payment/razorpay/verify`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                razorpay_order_id:
                  razorpayResponse
                    .razorpay_order_id,

                razorpay_payment_id:
                  razorpayResponse
                    .razorpay_payment_id,

                razorpay_signature:
                  razorpayResponse
                    .razorpay_signature,
              }),
          }
        );

      const result =
        await response
          .json()
          .catch(
            () => null
          );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to verify Razorpay payment."
        );
      }

      return result;
    };

  const startRazorpayPayment =
    async (
      paymentPayload
    ) => {
      const loaded =
        await loadRazorpayScript();

      if (!loaded) {
        throw new Error(
          "Unable to load Razorpay checkout. Please check your internet connection and try again."
        );
      }

      const response =
        await fetch(
          `${BASE_URL}/payment/razorpay/create`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                paymentPayload
              ),
          }
        );

      const result =
        await response
          .json()
          .catch(
            () => null
          );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to start Razorpay payment."
        );
      }

      const data =
        result?.data;

      const checkout =
        data?.checkout;

      const internalOrderId =
        data?.orderId;

      if (
        !checkout?.key ||
        !checkout
          ?.razorpayOrderId ||
        !checkout?.amount ||
        !checkout?.currency
      ) {
        throw new Error(
          "Invalid Razorpay payment information received from server."
        );
      }

      const options = {
        key:
          checkout.key,

        amount:
          checkout.amount,

        currency:
          checkout.currency,

        name:
          checkout.name ||
          "Target Trek",

        description:
          checkout.description ||
          product?.title ||
          "Target Trek Ebook",

        order_id:
          checkout
            .razorpayOrderId,

        prefill: {
          name:
            checkout
              ?.prefill
              ?.name ||
            formData.firstname
              .trim(),

          email:
            checkout
              ?.prefill
              ?.email ||
            formData.email
              .trim()
              .toLowerCase(),

          contact:
            checkout
              ?.prefill
              ?.contact ||
            formData.phone
              .trim(),
        },

        notes: {
          targetTrekOrderId:
            internalOrderId ||
            "",
        },

        handler:
          async (
            razorpayResponse
          ) => {
            try {
              setPaymentLoading(
                true
              );

              setServerError("");

              const verification =
                await verifyRazorpayPayment(
                  razorpayResponse
                );

              const redirectUrl =
                verification
                  ?.data
                  ?.redirectUrl;

              if (!redirectUrl) {
                throw new Error(
                  "Payment was verified, but the access redirect URL was not received."
                );
              }

              window.location.href =
                redirectUrl;
            } catch (error) {
              console.error(
                "Razorpay verification error:",
                error
              );

              setServerError(
                error?.message ||
                  "Payment verification failed. Please contact support if money was deducted."
              );

              setPaymentLoading(
                false
              );
            }
          },

        retry: {
          enabled: true,
        },

        modal: {
          confirm_close:
            true,

          escape:
            false,

          ondismiss: () => {
            setPaymentLoading(
              false
            );
          },
        },

        theme: {
          color:
            "#f97316",
        },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "Razorpay payment failed:",
            response?.error
          );

          const description =
            response
              ?.error
              ?.description;

          setServerError(
            description ||
              "Payment failed. Please try again."
          );

          setPaymentLoading(
            false
          );
        }
      );

      razorpay.open();
    };

  const startCashfreePayment =
    async (
      paymentPayload
    ) => {
      const loaded =
        await loadCashfreeScript();

      if (!loaded) {
        throw new Error(
          "Unable to load Cashfree checkout. Please check your internet connection and try again."
        );
      }

      const response =
        await fetch(
          `${BASE_URL}/payment/cashfree/create`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                paymentPayload
              ),
          }
        );

      const result =
        await response
          .json()
          .catch(
            () => null
          );

      if (
        !response.ok ||
        !result?.success
      ) {
        throw new Error(
          result?.message ||
            "Unable to start Cashfree payment."
        );
      }

      const data =
        result?.data;

      const paymentSessionId =
        data?.paymentSessionId;

      if (!paymentSessionId) {
        throw new Error(
          "Invalid Cashfree payment session received from server."
        );
      }

      const backendEnvironment =
        String(
          data?.environment ||
            ""
        )
          .trim()
          .toLowerCase();

      const frontendEnvironment =
        String(
          import.meta.env
            .VITE_CASHFREE_MODE ||
            "sandbox"
        )
          .trim()
          .toLowerCase();

      const mode = [
        "sandbox",
        "production",
      ].includes(
        backendEnvironment
      )
        ? backendEnvironment
        : frontendEnvironment ===
            "production"
          ? "production"
          : "sandbox";

      const cashfree =
        window.Cashfree({
          mode,
        });

      const checkoutResult =
        await cashfree.checkout({
          paymentSessionId,

          redirectTarget:
            "_self",
        });

      if (
        checkoutResult?.error
      ) {
        throw new Error(
          checkoutResult.error
            ?.message ||
            "Unable to open Cashfree checkout."
        );
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

    // EXISTING PAYMENT GATEWAY LOGIC
    if (Payment_gateway === "razorpay") {
      await startRazorpayPayment(paymentPayload);
      return;
    }

    if (Payment_gateway === "cashfree") {
      await startCashfreePayment(paymentPayload);
      return;
    }

    await startPayUPayment(paymentPayload);

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
    <div className={`rounded-2xl border p-4 ${t.card}`}>
      <p
        className={`mb-3 text-[11px] font-black uppercase tracking-widest ${t.faint}`}
      >
        Order summary
      </p>

      <div className="flex items-center justify-between gap-3 text-sm">
        <span className={t.muted}>Item price</span>

        <span className={`font-bold ${t.text}`}>
          {formatMoney(originalAmount)}
        </span>
      </div>

      {savingOnMrp > 0 && (
        <div className="mt-2 flex items-center justify-between gap-3 text-xs">
          <span className={t.muted}>
            MRP <s>{formatMoney(mrp)}</s>
          </span>

          <span className={`font-bold ${t.success}`}>
            You save {formatMoney(savingOnMrp)}
          </span>
        </div>
      )}

      {appliedCoupon && (
        <div className="mt-2 flex items-center justify-between gap-3 text-sm">
          <span
            className={`flex min-w-0 items-center gap-1.5 font-semibold ${t.success}`}
          >
            <Percent size={14} className="shrink-0" />
            <span className="truncate">Coupon {appliedCoupon.couponCode}</span>
          </span>

          <span className={`shrink-0 font-bold ${t.success}`}>
            &minus;{formatMoney(discountAmount)}
          </span>
        </div>
      )}

      <div className={`my-3 border-t border-dashed ${t.dashed}`} />

      <div className="flex items-center justify-between gap-3">
        <span className={`text-sm font-black ${t.title}`}>Total payable</span>

        <span className={`text-2xl font-black ${t.accent}`}>
          {formatMoney(finalAmount)}
        </span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4 lg:p-6">
      <style>{MODAL_CSS}</style>

      {/* BACKDROP */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close checkout"
        disabled={busy}
        onClick={requestClose}
        className={`tt-co-backdrop absolute inset-0 cursor-default backdrop-blur-sm ${t.backdrop}`}
      />

      {/* DIALOG */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        aria-busy={busy}
        tabIndex={-1}
        className={`tt-co-panel relative z-10 flex max-h-[94dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border shadow-2xl outline-none sm:max-h-[92vh] sm:rounded-3xl lg:max-w-4xl ${t.panel}`}
      >
        {/* HEADER */}
        <div className={`shrink-0 border-b px-4 pb-3.5 pt-2.5 sm:px-6 sm:py-4 ${t.header}`}>
          <div
            aria-hidden="true"
            className={`mx-auto mb-2.5 h-1 w-10 rounded-full sm:hidden ${
              isDark ? "bg-slate-700" : "bg-slate-300"
            }`}
          />

          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span
                className={`mb-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${t.chip}`}
              >
                <ShieldCheck size={13} className="shrink-0" />
                Secure checkout
              </span>

              <h2
                id="checkout-title"
                className={`text-lg font-black leading-tight sm:text-2xl ${t.title}`}
              >
                Complete your purchase
              </h2>
            </div>

            <button
              type="button"
              aria-label="Close checkout"
              disabled={busy}
              onClick={requestClose}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-40 ${t.close}`}
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* SCROLLING BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="lg:grid lg:grid-cols-[5fr_7fr]">
            {/* ORDER (left on desktop, top on mobile) */}
            <aside
              className={`border-b px-4 py-4 sm:px-6 lg:border-b-0 lg:border-r lg:py-6 ${t.aside}`}
            >
              <div className="flex items-center gap-3.5">
                {product?.coverPageUrl ? (
                  <img
                    src={product.coverPageUrl}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                    className={`h-20 w-14 shrink-0 rounded-lg border object-cover shadow-sm sm:h-24 sm:w-[68px] ${
                      isDark ? "border-slate-700" : "border-slate-200"
                    }`}
                  />
                ) : null}

                <div className="min-w-0 flex-1">
                  <p
                    className={`line-clamp-3 text-sm font-bold leading-snug sm:text-base ${t.title}`}
                  >
                    {product?.title || "Target Trek Ebook"}
                  </p>

                  {product?.offer?.titles?.length > 0 && (
                    <ul className={`mt-1 space-y-0.5 text-[11px] leading-snug ${t.faint}`}>
                      {product.offer.titles.slice(0, 6).map((title, i) => (
                        <li key={i} className="line-clamp-1">• {title}</li>
                      ))}
                      {product.offer.titles.length > 6 && (
                        <li>+ {product.offer.titles.length - 6} more</li>
                      )}
                    </ul>
                  )}

                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className={`text-xl font-black ${t.accent}`}>
                      {formatMoney(finalAmount)}
                    </span>

                    {(appliedCoupon || savingOnMrp > 0) && (
                      <span className={`text-xs line-through ${t.faint}`}>
                        {formatMoney(appliedCoupon ? originalAmount : mrp)}
                      </span>
                    )}

                    {!appliedCoupon && discountPercent > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          isDark
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-400/20"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {discountPercent}% OFF
                      </span>
                    )}

                    {appliedCoupon && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          isDark
                            ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-400/20"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        Coupon applied
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* Prep Arena credits that come with this book (hidden when 0) */}
              {Number(product?.matches) > 0 && (
                <div
                  className={`mt-3 flex items-start gap-3 rounded-xl border p-3 ${
                    isDark
                      ? "border-orange-400/30 bg-orange-500/10"
                      : "border-orange-200 bg-orange-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      isDark ? "bg-orange-500/20 text-orange-300" : "bg-orange-100 text-orange-600"
                    }`}
                    aria-hidden="true"
                  >
                    <Swords size={16} />
                  </span>
                  <div className="min-w-0">
                    <p className={`text-[13px] font-extrabold leading-snug sm:text-sm ${isDark ? "text-orange-200" : "text-orange-800"}`}>
                      Includes {product.matches} Prep Arena {Number(product.matches) === 1 ? "credit" : "credits"}
                    </p>
                    <p className={`mt-0.5 text-[11px] leading-snug sm:text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      1 credit = 1 match = 1 buddy partnership. Added when you sign up on Prep Arena with this email.
                    </p>
                  </div>
                </div>
              )}

              {/* desktop-only: breakdown + reassurance */}
              <div className="mt-5 hidden space-y-4 lg:block">
                {priceSummary}

                <ul className={`space-y-3 text-sm ${t.muted}`}>
                  {[
                    [Zap, "Instant access right after payment"],
                    [
                      ShieldCheck,
                      `Secure payment via ${PAYMENT_PROVIDER_NAME}`,
                    ],
                    [Headphones, "Help at supporttargettrek@gmail.com"],
                  ].map(([Icon, text]) => (
                    <li key={text} className="flex items-center gap-2.5">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${t.chip}`}
                      >
                        <Icon size={14} />
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* FORM */}
            <form
              id="checkout-form"
              noValidate
              onSubmit={handlePayment}
              className="space-y-4 px-4 py-5 sm:px-6 lg:py-6"
            >
              <p className={`text-sm ${t.muted}`}>
                Enter your details to continue to{" "}
                <span className={`font-semibold ${t.text}`}>
                  {PAYMENT_PROVIDER_NAME}
                </span>
              </p>

              <Field
                id="checkout-name"
                label="Full name"
                Icon={User}
                t={t}
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
                t={t}
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
                  <button
                    type="button"
                    onClick={applyEmailSuggestion}
                    className={`mt-1.5 text-left text-xs font-semibold ${t.accent} underline-offset-2 hover:underline`}
                  >
                    Did you mean {emailSuggestion}?
                  </button>
                )}
              </Field>

              <Field
                id="checkout-phone"
                label="Mobile number"
                Icon={Phone}
                t={t}
                prefix="+91"
                counter={
                  formData.phone ? `${formData.phone.length}/10` : undefined
                }
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

              {/* COUPONS (not combinable with a multi-book offer) */}
              {product?.offer ? (
                <div className={`border-t pt-4 text-xs font-semibold ${t.divider} ${t.faint}`}>
                  Offer price applied for {product.offer.bookIds.length} books. Coupons can't be combined with this offer.
                </div>
              ) : (
              <div className={`border-t pt-4 ${t.divider}`}>
                {!appliedCoupon && availableCoupons.length > 0 && (
                  <div className="mb-4">
                    <p
                      className={`mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider ${t.offerHead}`}
                    >
                      <Percent size={13} />
                      Available offers
                    </p>

                    <div className="space-y-2">
                      {offersToShow.map((offer, index) => (
                        <div
                          key={offer.code}
                          className={`flex items-center justify-between gap-3 rounded-xl border border-dashed p-3 ${t.offer}`}
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-md px-2 py-0.5 font-mono text-xs font-black tracking-wide ${t.offerCode}`}
                              >
                                {offer.code}
                              </span>

                              {index === 0 && availableCoupons.length > 1 && (
                                <span
                                  className={`text-[10px] font-black uppercase tracking-wide ${t.success}`}
                                >
                                  Best saving
                                </span>
                              )}
                            </div>

                            <p className={`mt-1 text-sm font-bold ${t.title}`}>
                              Save {formatMoney(offer.discountAmount)}{" "}
                              <span className={`font-medium ${t.muted}`}>
                                &middot; pay {formatMoney(offer.finalAmount)}
                              </span>
                            </p>

                            <p className={`mt-0.5 truncate text-xs ${t.muted}`}>
                              {offer.description || offer.name}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={couponLoading || busy}
                            onClick={() => {
                              setShowCouponInput(true);
                              setCouponCode(offer.code);
                              handleApplyCoupon(offer.code);
                            }}
                            className="min-h-[40px] shrink-0 rounded-lg bg-orange-500 px-4 text-xs font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                        className={`mt-2 inline-flex items-center gap-1 text-xs font-bold ${t.offerHead}`}
                      >
                        {showAllOffers
                          ? "Show fewer offers"
                          : `Show ${availableCoupons.length - 2} more`}
                        <ChevronDown
                          size={14}
                          className={`transition ${
                            showAllOffers ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                )}

                {appliedCoupon ? (
                  <div className={`rounded-xl border p-3.5 ${t.successBox}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-2.5">
                        <CheckCircle2
                          size={20}
                          className={`mt-0.5 shrink-0 ${t.success}`}
                        />

                        <div className="min-w-0">
                          <p
                            className={`break-all text-sm font-black ${t.successText}`}
                          >
                            {appliedCoupon.couponCode}{" "}
                            <span className="font-semibold">applied</span>
                          </p>

                          <p className={`mt-0.5 text-xs ${t.successText}`}>
                            You save {formatMoney(discountAmount)} on this order
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={busy}
                        onClick={handleRemoveCoupon}
                        className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-bold transition disabled:opacity-50 ${t.ghostBtn}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : !showCouponInput && !couponError ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setShowCouponInput(true);
                      setCouponError("");
                    }}
                    className={`inline-flex min-h-[40px] items-center gap-1.5 text-sm font-bold transition disabled:opacity-60 ${t.accent}`}
                  >
                    <Tag size={15} />
                    Have a coupon code?
                  </button>
                ) : (
                  <div>
                    <label
                      htmlFor="coupon-code"
                      className={`mb-1.5 block text-sm font-bold ${t.label}`}
                    >
                      Coupon code
                    </label>

                    <div className="flex gap-2">
                      <div className="relative min-w-0 flex-1">
                        <Tag
                          size={17}
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
                            couponError ? "text-red-400" : t.icon
                          }`}
                        />

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
                          aria-describedby={
                            couponError ? "coupon-error" : undefined
                          }
                          placeholder="Enter coupon code"
                          className={`w-full min-w-0 rounded-xl border py-3 pl-10 pr-3 text-base font-bold uppercase tracking-wide outline-none transition placeholder:font-normal placeholder:normal-case placeholder:tracking-normal sm:text-sm ${
                            t.input
                          } ${
                            couponError ? t.inputErr : t.inputOk
                          } disabled:cursor-not-allowed disabled:opacity-60`}
                        />
                      </div>

                      <button
                        type="button"
                        disabled={!couponCode.trim() || couponLoading || busy}
                        onClick={() => handleApplyCoupon()}
                        className={`min-h-[46px] min-w-[84px] shrink-0 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed ${t.applyBtn}`}
                      >
                        {couponLoading ? (
                          <Loader2 size={17} className="mx-auto animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>

                    {couponError && (
                      <p
                        id="coupon-error"
                        role="alert"
                        className={`mt-2 flex items-start gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-semibold ${t.errBox}`}
                      >
                        <AlertCircle size={14} className="mt-px shrink-0" />
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>
              )}

              {/* mobile / tablet: breakdown sits under the form */}
              <div className="lg:hidden">{priceSummary}</div>
            </form>
          </div>
        </div>

        {/* FOOTER: always visible, safe-area aware */}
        <div
          className={`shrink-0 border-t px-4 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3.5 sm:px-6 sm:pb-5 ${t.footer}`}
        >
          {serverError && (
            <div
              role="alert"
              className={`mb-3 flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm font-medium ${t.errBox}`}
            >
              <AlertCircle size={17} className="mt-px shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <button
            type="submit"
            form="checkout-form"
            disabled={busy || !product?._id}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 text-base font-black text-white shadow-lg shadow-orange-400/30 transition hover:from-orange-600 hover:to-amber-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            {busy ? (
              <>
                <Loader2 size={19} className="animate-spin" />
                Connecting to {PAYMENT_PROVIDER_NAME}...
              </>
            ) : (
              <>
                <CreditCard size={19} />
                Pay {formatMoney(finalAmount)} securely
              </>
            )}
          </button>

          <p
            className={`mt-2.5 flex items-center justify-center gap-1.5 text-center text-[11px] sm:text-xs ${t.faint}`}
          >
            <LockKeyhole size={13} className="shrink-0" />
            <span>
              Payments are encrypted and processed by{" "}
              <strong>{PAYMENT_PROVIDER_NAME}</strong>
            </span>
            <BadgeCheck size={13} className="hidden shrink-0 sm:block" />
          </p>
        </div>
      </div>
    </div>
  );
}
