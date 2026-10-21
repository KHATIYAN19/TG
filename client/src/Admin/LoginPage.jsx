import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import axios from "axios";
import { z } from "zod";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Smartphone,
  Sun,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { login as loginAction } from "../Redux/authSlice";
import BASE_URL from "../utils/Url";

/* =========================================================
   CONFIGURATION
========================================================= */

const API = `${String(BASE_URL).replace(/\/$/, "")}/api/auth`;

const LOGIN_REDIRECT = "/";

const OTP_LENGTH = 6;
const OTP_RESEND_SECONDS = 60;

// Match this to the key your navbar uses.
const THEME_STORAGE_KEY = "theme";

const api = axios.create({
  baseURL: API,
  withCredentials: true,
  timeout: 20000,
});

/* =========================================================
   VALIDATION
========================================================= */

const identifierSchema = z
  .string()
  .trim()
  .min(1, "Email or mobile number is required")
  .refine(
    (value) =>
      z.string().email().safeParse(value).success ||
      /^[6-9]\d{9}$/.test(value),
    "Enter a valid email or 10-digit mobile number"
  );

const loginSchema = z.object({
  identifier: identifierSchema,
  password: z
    .string()
    .min(1, "Password is required"),
});

/* =========================================================
   UTILITIES
========================================================= */

const getApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ECONNABORTED") {
    return "The request timed out. Please try again.";
  }

  if (!error.response) {
    return "Unable to connect to the server. Check your connection.";
  }

  return "Something went wrong. Please try again.";
};

const normalizeIdentifier = (value) => {
  const trimmed = value.trim();

  return trimmed.includes("@")
    ? trimmed.toLowerCase()
    : trimmed;
};

const maskIdentifier = (value) => {
  if (!value) return "";

  if (/^\d{10}$/.test(value)) {
    return `${value.slice(0, 2)}••••••${value.slice(-2)}`;
  }

  const [name, domain] = value.split("@");

  if (!domain) return value;

  const visible = name.slice(0, Math.min(2, name.length));

  return `${visible}${"•".repeat(
    Math.max(3, Math.min(6, name.length - visible.length))
  )}@${domain}`;
};

const getStoredTheme = () => {
  if (typeof window === "undefined") return "light";

  const stored = localStorage.getItem(THEME_STORAGE_KEY);

  if (stored === "dark" || stored === "light") {
    return stored;
  }

  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
};

/* =========================================================
   THEME HOOK
   - localStorage synchronization
   - navbar class changes
   - updates across browser tabs
========================================================= */

const useSyncedTheme = () => {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    const updateTheme = () => {
      setTheme(getStoredTheme());
    };

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    window.addEventListener("storage", updateTheme);

    const onVisibilityChange = () => {
      if (!document.hidden) updateTheme();
    };

    document.addEventListener(
      "visibilitychange",
      onVisibilityChange
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "storage",
        updateTheme
      );

      document.removeEventListener(
        "visibilitychange",
        onVisibilityChange
      );
    };
  }, []);

  const toggleTheme = useCallback(() => {
    const current = getStoredTheme();
    const next = current === "dark" ? "light" : "dark";

    localStorage.setItem(THEME_STORAGE_KEY, next);

    document.documentElement.classList.toggle(
      "dark",
      next === "dark"
    );

    document.documentElement.setAttribute(
      "data-theme",
      next
    );

    setTheme(next);

    window.dispatchEvent(
      new CustomEvent("theme-change", {
        detail: { theme: next },
      })
    );
  }, []);

  return {
    theme,
    isDark: theme === "dark",
    toggleTheme,
  };
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

const Spinner = ({ size = 18 }) => (
  <Loader2
    size={size}
    className="animate-spin"
    aria-hidden="true"
  />
);

const Brand = ({ isDark }) => (
  <div className="flex items-center gap-2.5 mt-10">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#F28C38] text-[#171717] shadow-sm">
      <span className="text-[18px] font-black tracking-tighter">
        T
      </span>
    </div>

    <div className="leading-none">
      <div
        className={`text-[17px] font-bold tracking-[-0.65px] ${
          isDark ? "text-white" : "text-[#191919]"
        }`}
      >
        target<span className="text-[#E9812B]">trek</span>
      </div>

      <div
        className={`mt-1 text-[9px] font-bold uppercase tracking-[2px] ${
          isDark ? "text-[#8D8D8D]" : "text-[#858585]"
        }`}
      >
        Workspace
      </div>
    </div>
  </div>
);

const FormLabel = ({ htmlFor, children, isDark }) => (
  <label
    htmlFor={htmlFor}
    className={`mb-2 block text-[12px] font-semibold tracking-[0.01em] ${
      isDark ? "text-[#D4D4D4]" : "text-[#353535]"
    }`}
  >
    {children}
  </label>
);

const ErrorText = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mt-2 flex items-start gap-1.5 text-[12px] font-medium text-[#D45545]"
    >
      <AlertCircle
        size={14}
        className="mt-[1px] shrink-0"
      />
      <span>{message}</span>
    </div>
  );
};

const PrimaryButton = ({
  children,
  disabled,
  loading,
  type = "button",
  onClick,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className="
      group flex h-[49px] w-full items-center justify-center gap-2
      rounded-[10px] bg-[#F28C38] px-5
      text-[13px] font-bold text-[#181818]
      shadow-[0_3px_0_rgba(137,69,14,0.16)]
      transition-all duration-200
      hover:bg-[#FFA04C]
      hover:shadow-[0_5px_15px_rgba(242,140,56,0.18)]
      active:translate-y-[1px]
      disabled:cursor-not-allowed
      disabled:opacity-60
      disabled:hover:bg-[#F28C38]
      focus-visible:outline-none
      focus-visible:ring-2
      focus-visible:ring-[#F28C38]
      focus-visible:ring-offset-2
    "
  >
    {loading ? (
      <Spinner />
    ) : (
      <>
        {children}
        <ArrowRight
          size={16}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </>
    )}
  </button>
);

/* =========================================================
   MAIN PAGE
========================================================= */

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { theme, isDark, toggleTheme } = useSyncedTheme();

  /* =====================================================
     STATE
  ===================================================== */

  const [stage, setStage] = useState("login");

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const [otp, setOtp] = useState(
    Array(OTP_LENGTH).fill("")
  );

  const [rememberDevice, setRememberDevice] = useState(true);

  const [challengeId, setChallengeId] = useState(null);

  const [userIdentifier, setUserIdentifier] = useState("");

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);

  const [isResending, setIsResending] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef([]);

  const isMountedRef = useRef(true);

  /* =====================================================
     THEME STYLES
  ===================================================== */

  const colors = {
    page: isDark ? "#111111" : "#F6F5F2",

    panel: isDark ? "#191919" : "#FFFFFF",

    border: isDark ? "#303030" : "#E7E5E0",

    text: isDark ? "#F5F5F5" : "#1B1B1B",

    muted: isDark ? "#999999" : "#777777",

    input: isDark ? "#212121" : "#FAFAF8",

    inputBorder: isDark ? "#393939" : "#E1DFDA",

    subtle: isDark ? "#252525" : "#F7F6F3",

    divider: isDark ? "#343434" : "#EAE8E4",
  };

  /* =====================================================
     LIFECYCLE
  ===================================================== */

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timeout = setTimeout(() => {
      setResendCooldown((previous) =>
        Math.max(0, previous - 1)
      );
    }, 1000);

    return () => clearTimeout(timeout);
  }, [resendCooldown]);

  useEffect(() => {
    if (stage === "otp") {
      const timer = setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [stage]);

  /* =====================================================
     LOGIN SUCCESS
  ===================================================== */

  const completeAuthentication = useCallback(
    (data) => {
      const { token, user } = data;

      if (!token || !user) {
        throw new Error(
          "Incomplete authentication response from server."
        );
      }

      dispatch(
        loginAction({
          user,
          token,
        })
      );

      toast.success("Welcome back. You're signed in.");

      // Your previous component navigated to "/".
      // Keep the same behavior for compatibility.
      navigate(LOGIN_REDIRECT, {
        replace: true,
      });
    },
    [dispatch, navigate]
  );

  /* =====================================================
     FORM HELPERS
  ===================================================== */

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: null,
      }));
    }
  };

  const resetOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
  };

  const returnToLogin = () => {
    if (isLoggingIn || isVerifying || isResending) return;

    setStage("login");
    setChallengeId(null);
    setUserIdentifier("");
    resetOtp();
    setErrors({});
    setResendCooldown(0);
  };

  /* =====================================================
     LOGIN API
  ===================================================== */

  const handleLogin = async (event) => {
    event.preventDefault();

    if (isLoggingIn) return;

    setErrors({});

    const submittedForm = {
      identifier: normalizeIdentifier(form.identifier),
      password: form.password,
    };

    const validation = loginSchema.safeParse(
      submittedForm
    );

    if (!validation.success) {
      const fieldErrors =
        validation.error.flatten().fieldErrors;

      setErrors({
        identifier: fieldErrors.identifier?.[0],
        password: fieldErrors.password?.[0],
      });

      return;
    }

    setIsLoggingIn(true);

    try {
      const { data } = await api.post("/login", {
        identifier: validation.data.identifier,
        password: validation.data.password,
      });

      if (!data.success) {
        throw new Error(
          data.message || "Unable to sign in."
        );
      }

      /* ===== DIRECT LOGIN =====
         Admin or previously trusted device.
      */

      if (data.requiresOtp === false) {
        completeAuthentication(data);
        return;
      }

      /* ===== OTP REQUIRED ===== */

      if (data.requiresOtp === true) {
        if (!data.challengeId) {
          throw new Error(
            "Verification session missing. Please try again."
          );
        }

        setChallengeId(data.challengeId);

        setUserIdentifier(
          validation.data.identifier
        );

        resetOtp();

        setForm((previous) => ({
          ...previous,
          password: "",
        }));

        setResendCooldown(OTP_RESEND_SECONDS);

        setStage("otp");

        toast.success(
          "Verification code sent to your email."
        );

        return;
      }

      throw new Error(
        "Unexpected login response from server."
      );
    } catch (error) {
      console.error("Login failed:", error);

      const message = getApiError(error);

      setErrors((previous) => ({
        ...previous,
        api: message,
      }));

      toast.error(message);
    } finally {
      if (isMountedRef.current) {
        setIsLoggingIn(false);
      }
    }
  };

  /* =====================================================
     OTP INPUT HANDLING
  ===================================================== */

  const focusOtp = (index) => {
    const safeIndex = Math.max(
      0,
      Math.min(OTP_LENGTH - 1, index)
    );

    otpInputRefs.current[safeIndex]?.focus();
  };

  const updateOtpAt = (index, value) => {
    const digit = value.replace(/\D/g, "");

    if (!digit) {
      setOtp((previous) => {
        const next = [...previous];
        next[index] = "";
        return next;
      });

      return;
    }

    // Supports paste and mobile autofill
    // even when entering multiple digits.
    if (digit.length > 1) {
      const next = Array(OTP_LENGTH).fill("");

      digit
        .slice(0, OTP_LENGTH)
        .split("")
        .forEach((character, i) => {
          next[i] = character;
        });

      setOtp(next);

      focusOtp(
        Math.min(digit.length, OTP_LENGTH - 1)
      );

      return;
    }

    setOtp((previous) => {
      const next = [...previous];
      next[index] = digit;
      return next;
    });

    if (index < OTP_LENGTH - 1) {
      focusOtp(index + 1);
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (event.key === "Backspace") {
      if (!otp[index] && index > 0) {
        focusOtp(index - 1);
      }

      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusOtp(index - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusOtp(index + 1);
    }
  };

  const handleOtpPaste = (event) => {
    const pastedText =
      event.clipboardData.getData("text").trim();

    const digits = pastedText.replace(/\D/g, "");

    if (!digits) return;

    event.preventDefault();

    const next = Array(OTP_LENGTH).fill("");

    digits
      .slice(0, OTP_LENGTH)
      .split("")
      .forEach((digit, index) => {
        next[index] = digit;
      });

    setOtp(next);

    focusOtp(
      Math.min(
        digits.length,
        OTP_LENGTH - 1
      )
    );
  };

  /* =====================================================
     VERIFY OTP API
  ===================================================== */

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (!challengeId || isVerifying) return;

    const code = otp.join("");

    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter the complete 6-digit code.");
      return;
    }

    setIsVerifying(true);

    try {
      const { data } = await api.post(
        "/verify-otp",
        {
          challengeId,
          otp: code,
          rememberDevice,
        }
      );

      if (!data.success) {
        throw new Error(
          data.message || "Verification failed."
        );
      }

      completeAuthentication(data);
    } catch (error) {
      console.error("OTP verification:", error);

      const message = getApiError(error);

      toast.error(message);

      resetOtp();

      focusOtp(0);

      if (
        error.response?.status === 429 ||
        error.response?.data?.code ===
          "SESSION_REVOKED"
      ) {
        // Allow the user to restart login
        // when the challenge has been exhausted.
        setStage("login");
        setChallengeId(null);
      }
    } finally {
      if (isMountedRef.current) {
        setIsVerifying(false);
      }
    }
  };

  /* =====================================================
     RESEND OTP API
  ===================================================== */

  const handleResendOtp = async () => {
    if (
      !challengeId ||
      resendCooldown > 0 ||
      isResending
    ) {
      return;
    }

    setIsResending(true);

    try {
      const { data } = await api.post(
        "/resend-otp",
        {
          challengeId,
        }
      );

      if (!data.success) {
        throw new Error(
          data.message || "Unable to resend OTP."
        );
      }

      resetOtp();

      setResendCooldown(OTP_RESEND_SECONDS);

      focusOtp(0);

      toast.success("A new verification code was sent.");
    } catch (error) {
      console.error("Resend OTP:", error);

      toast.error(getApiError(error));
    } finally {
      if (isMountedRef.current) {
        setIsResending(false);
      }
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div
      data-theme={theme}
      className="relative min-h-screen overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: colors.page,
        color: colors.text,
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* =========================================
          SUBTLE TOP ACCENT
      ========================================= */}

      <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-[#F28C38]" />

      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <header
        className="relative z-10 mx-auto flex h-[76px] w-full max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12"
      >
        {/* <Brand isDark={isDark} /> */}

        <div className="flex items-center gap-3">
          <div
            className={`hidden items-center gap-2 text-[12px] sm:flex ${
              isDark ? "text-[#A5A5A5]" : "text-[#777777]"
            }`}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#E9812B]" />
            Secure workspace access
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={
              isDark
                ? "Switch to light theme"
                : "Switch to dark theme"
            }
            title={
              isDark
                ? "Light appearance"
                : "Dark appearance"
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:border-[#F28C38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F28C38]"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.panel,
            }}
          >
            {isDark ? (
              <Sun size={16} strokeWidth={1.8} />
            ) : (
              <Moon size={16} strokeWidth={1.8} />
            )}
          </button>
        </div>
      </header>

      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="relative z-[1] mx-auto grid min-h-[calc(100vh-150px)] w-full max-w-[1320px] grid-cols-1 items-center gap-10 px-5 pb-12 pt-8 sm:px-8 lg:grid-cols-[1fr_490px] lg:gap-20 lg:px-12 lg:pb-16 lg:pt-2">

        {/* =======================================
            LEFT — EDITORIAL CONTENT
        ======================================= */}

        <section className="hidden max-w-[580px] flex-col justify-center lg:flex">
          <div
            className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em]"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.panel,
              color: colors.muted,
            }}
          >
            <ShieldCheck
              size={14}
              className="text-[#E9812B]"
            />
            TARGET TREK · INTERNAL ACCESS
          </div>

          <h1 className="max-w-[600px] text-[clamp(38px,4vw,60px)] font-semibold leading-[1.10] tracking-[-2.6px]">
            A better way to
            <br />
            manage what
            <br />
            <span className="text-[#E9812B]">
              matters.
            </span>
          </h1>

          <p
            className="mt-7 max-w-[430px] text-[14px] leading-[1.9]"
            style={{ color: colors.muted }}
          >
            One secure place for the Target Trek team
            to access operations, manage day-to-day
            work, and stay in control of the details.
          </p>

          <div
            className="mt-12 h-px w-full max-w-[440px]"
            style={{ backgroundColor: colors.divider }}
          />

          <div className="mt-7 flex max-w-[470px] flex-col gap-6">
            <div className="flex items-start gap-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.panel,
                }}
              >
                <LockKeyhole
                  size={18}
                  className="text-[#E9812B]"
                  strokeWidth={1.7}
                />
              </div>

              <div className="pt-0.5">
                <h3 className="text-[13px] font-semibold">
                  Protected account access
                </h3>

                <p
                  className="mt-1.5 text-[12px] leading-[1.8]"
                  style={{ color: colors.muted }}
                >
                  Password-protected accounts with
                  device verification and managed sessions.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border"
                style={{
                  borderColor: colors.border,
                  backgroundColor: colors.panel,
                }}
              >
                <Smartphone
                  size={18}
                  className="text-[#E9812B]"
                  strokeWidth={1.7}
                />
              </div>

              <div className="pt-0.5">
                <h3 className="text-[13px] font-semibold">
                  Your devices, your access
                </h3>

                <p
                  className="mt-1.5 text-[12px] leading-[1.8]"
                  style={{ color: colors.muted }}
                >
                  Verify a new device once and choose
                  whether to remember it for future logins.
                </p>
              </div>
            </div>
          </div>

          <div
            className="mt-14 flex items-center gap-2 text-[11px]"
            style={{ color: colors.muted }}
          >
            <span className="h-1 w-1 rounded-full bg-[#E9812B]" />
            Restricted to authorized team members.
          </div>
        </section>

        {/* =======================================
            RIGHT — AUTHENTICATION PANEL
        ======================================= */}

        <section className="mx-auto w-full max-w-[490px]">

          {/* MOBILE INTRO */}

          <div className="mb-7 lg:hidden">
            <p
              className="mb-2 text-[10px] font-bold uppercase tracking-[2px]"
              style={{ color: colors.muted }}
            >
              Target Trek Workspace
            </p>

            <h1 className="text-[30px] font-semibold tracking-[-1.2px]">
              {stage === "login"
                ? "Welcome back."
                : "Verify your identity."}
            </h1>

            <p
              className="mt-2 text-[13px]"
              style={{ color: colors.muted }}
            >
              Secure access for authorized team members.
            </p>
          </div>

          <div
            className="overflow-hidden rounded-[18px] border shadow-[0_12px_48px_rgba(0,0,0,0.04)]"
            style={{
              backgroundColor: colors.panel,
              borderColor: colors.border,
            }}
          >

            {/* TOP SECTION */}

            <div className="border-b px-6 pb-6 pt-7 sm:px-9 sm:pt-9"
              style={{ borderColor: colors.divider }}
            >
              <div className="mb-6 flex items-center justify-between">
                <span
                  className="text-[10px] font-bold uppercase tracking-[1.8px]"
                  style={{ color: colors.muted }}
                >
                  Account authentication
                </span>

                <span
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold"
                  style={{
                    color: isDark ? "#FFAE67" : "#A85E19",
                    backgroundColor: isDark
                      ? "#382719"
                      : "#FFF2E5",
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F28C38]" />
                  Secure login
                </span>
              </div>

              {stage === "login" ? (
                <>
                  <h2 className="text-[25px] font-semibold tracking-[-1px]">
                    Sign in to your account
                  </h2>

                  <p
                    className="mt-2 text-[12px] leading-relaxed"
                    style={{ color: colors.muted }}
                  >
                    Enter your registered email or mobile
                    number and password to continue.
                  </p>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={returnToLogin}
                    className="mb-5 inline-flex items-center gap-2 text-[12px] font-medium transition-colors hover:text-[#E9812B]"
                    style={{ color: colors.muted }}
                  >
                    <ArrowLeft size={15} />
                    Back to sign in
                  </button>

                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFF0E2] text-[#C67429]">
                    <Mail size={21} strokeWidth={1.8} />
                  </div>

                  <h2 className="text-[25px] font-semibold tracking-[-1px]">
                    Check your inbox
                  </h2>

                  <p
                    className="mt-2 text-[12px] leading-[1.8]"
                    style={{ color: colors.muted }}
                  >
                    Enter the six-digit verification code
                    sent to the registered email for
                    <span
                      className="ml-1 font-semibold"
                      style={{ color: colors.text }}
                    >
                      {maskIdentifier(userIdentifier)}
                    </span>
                    .
                  </p>
                </>
              )}
            </div>

            {/* FORM CONTENT */}

            <div className="px-6 py-7 sm:px-9 sm:py-8">

              {/* ===================================
                  LOGIN FORM
              =================================== */}

              {stage === "login" && (
                <form
                  onSubmit={handleLogin}
                  noValidate
                  className="space-y-5"
                >
                  {/* IDENTIFIER */}

                  <div>
                    <FormLabel
                      htmlFor="identifier"
                      isDark={isDark}
                    >
                      Email address or mobile number
                    </FormLabel>

                    <div className="relative">
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center"
                        style={{ color: colors.muted }}
                      >
                        {form.identifier.includes("@") ? (
                          <Mail size={17} strokeWidth={1.8} />
                        ) : (
                          <Smartphone size={17} strokeWidth={1.8} />
                        )}
                      </div>

                      <input
                        id="identifier"
                        name="identifier"
                        type="text"
                        value={form.identifier}
                        onChange={updateField}
                        disabled={isLoggingIn}
                        autoComplete="username"
                        autoCapitalize="none"
                        spellCheck={false}
                        placeholder="name@targettrek.in or mobile"
                        aria-invalid={Boolean(
                          errors.identifier
                        )}
                        className="
                          h-[48px] w-full rounded-[9px] border
                          pl-11 pr-4 text-[13px]
                          outline-none transition-all
                          placeholder:text-[#929292]
                          focus:border-[#F28C38]
                          focus:ring-[3px]
                          focus:ring-[#F28C38]/10
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                        style={{
                          backgroundColor: colors.input,
                          borderColor: errors.identifier
                            ? "#D45545"
                            : colors.inputBorder,
                          color: colors.text,
                        }}
                      />
                    </div>

                    <ErrorText
                      message={errors.identifier}
                    />
                  </div>

                  {/* PASSWORD */}

                  <div>
                    <FormLabel
                      htmlFor="password"
                      isDark={isDark}
                    >
                      Password
                    </FormLabel>

                    <div className="relative">
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 flex w-11 items-center justify-center"
                        style={{ color: colors.muted }}
                      >
                        <LockKeyhole
                          size={17}
                          strokeWidth={1.8}
                        />
                      </div>

                      <input
                        id="password"
                        name="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={form.password}
                        onChange={updateField}
                        disabled={isLoggingIn}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        aria-invalid={Boolean(
                          errors.password
                        )}
                        className="
                          h-[48px] w-full rounded-[9px]
                          border pl-11 pr-12 text-[13px]
                          outline-none transition-all
                          placeholder:text-[#929292]
                          focus:border-[#F28C38]
                          focus:ring-[3px]
                          focus:ring-[#F28C38]/10
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                        style={{
                          backgroundColor: colors.input,
                          borderColor: errors.password
                            ? "#D45545"
                            : colors.inputBorder,
                          color: colors.text,
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((prev) => !prev)
                        }
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center transition-colors hover:text-[#F28C38]"
                        style={{ color: colors.muted }}
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>

                    <ErrorText
                      message={errors.password}
                    />
                  </div>

                  {/* API ERROR */}

                  {errors.api && (
                    <div
                      role="alert"
                      className="flex items-start gap-2.5 rounded-lg border px-3.5 py-3"
                      style={{
                        backgroundColor: isDark
                          ? "#321D1D"
                          : "#FFF4F2",
                        borderColor: isDark
                          ? "#60302A"
                          : "#F5CEC7",
                      }}
                    >
                      <AlertCircle
                        size={16}
                        className="mt-0.5 shrink-0 text-[#D45545]"
                      />

                      <p className="text-[12px] leading-[1.7] text-[#D45545]">
                        {errors.api}
                      </p>
                    </div>
                  )}

                  <div className="pt-1">
                    <PrimaryButton
                      type="submit"
                      loading={isLoggingIn}
                    >
                      {isLoggingIn
                        ? "Signing in..."
                        : "Continue securely"}
                    </PrimaryButton>
                  </div>

                  <p
                    className="pt-2 text-center text-[11px] leading-[1.8]"
                    style={{ color: colors.muted }}
                  >
                    Having trouble accessing your account?
                    <br />
                    Contact your Target Trek administrator.
                  </p>
                </form>
              )}

              {/* ===================================
                  OTP VERIFICATION
              =================================== */}

              {stage === "otp" && (
                <form
                  onSubmit={handleVerifyOtp}
                  className="space-y-6"
                >
                  <div>
                    <FormLabel isDark={isDark}>
                      Verification code
                    </FormLabel>

                    <div
                      dir="ltr"
                      onPaste={handleOtpPaste}
                      className="flex w-full justify-between gap-2 sm:gap-3"
                    >
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(element) => {
                            otpInputRefs.current[index] =
                              element;
                          }}
                          type="text"
                          inputMode="numeric"
                          autoComplete={
                            index === 0
                              ? "one-time-code"
                              : "off"
                          }
                          pattern="[0-9]*"
                          maxLength={1}
                          value={digit}
                          disabled={isVerifying}
                          onChange={(event) =>
                            updateOtpAt(
                              index,
                              event.target.value
                            )
                          }
                          onKeyDown={(event) =>
                            handleOtpKeyDown(
                              event,
                              index
                            )
                          }
                          onFocus={(event) =>
                            event.target.select()
                          }
                          aria-label={`Verification digit ${
                            index + 1
                          }`}
                          className="
                            h-[52px] min-w-0 flex-1 rounded-[9px]
                            border text-center text-[20px]
                            font-semibold outline-none
                            transition-all
                            focus:border-[#F28C38]
                            focus:ring-[3px]
                            focus:ring-[#F28C38]/10
                            disabled:opacity-60
                          "
                          style={{
                            backgroundColor: colors.input,
                            borderColor: digit
                              ? "#ECA062"
                              : colors.inputBorder,
                            color: colors.text,
                          }}
                        />
                      ))}
                    </div>

                    <p
                      className="mt-3 text-[11px] leading-relaxed"
                      style={{ color: colors.muted }}
                    >
                      Each code is valid for a limited
                      time. Do not share it with anyone.
                    </p>
                  </div>

                  {/* REMEMBER DEVICE */}

                  <label
                    className="flex cursor-pointer items-start gap-3 rounded-[10px] border p-3.5 transition-colors"
                    style={{
                      borderColor: colors.border,
                      backgroundColor: colors.subtle,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(event) =>
                        setRememberDevice(
                          event.target.checked
                        )
                      }
                      disabled={isVerifying}
                      className="sr-only"
                    />

                    <div
                      className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
                        rememberDevice
                          ? "border-[#F28C38] bg-[#F28C38]"
                          : ""
                      }`}
                      style={
                        rememberDevice
                          ? {}
                          : {
                              borderColor:
                                colors.inputBorder,
                            }
                      }
                    >
                      {rememberDevice && (
                        <Check
                          size={13}
                          strokeWidth={3}
                          className="text-[#171717]"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="block text-[12px] font-semibold">
                        Remember this device
                      </span>

                      <span
                        className="mt-1 block text-[11px] leading-[1.7]"
                        style={{ color: colors.muted }}
                      >
                        Skip email verification on future
                        sign-ins from this browser for up
                        to 30 days. Use this only on a
                        personal, trusted device.
                      </span>
                    </div>
                  </label>

                  {/* VERIFY BUTTON */}

                  <PrimaryButton
                    type="submit"
                    loading={isVerifying}
                    disabled={
                      otp.join("").length !==
                      OTP_LENGTH
                    }
                  >
                    {isVerifying
                      ? "Verifying..."
                      : "Verify and sign in"}
                  </PrimaryButton>

                  {/* RESEND */}

                  <div className="text-center">
                    <p
                      className="text-[12px]"
                      style={{ color: colors.muted }}
                    >
                      Didn't receive the code?
                    </p>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={
                        isResending ||
                        resendCooldown > 0
                      }
                      className="
                        mt-2 inline-flex items-center
                        gap-2 text-[12px] font-semibold
                        text-[#E9812B]
                        transition-colors
                        hover:text-[#F7A35C]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {isResending ? (
                        <Spinner size={14} />
                      ) : (
                        <RefreshCw size={14} />
                      )}

                      {isResending
                        ? "Sending new code..."
                        : resendCooldown > 0
                          ? `Resend in ${resendCooldown}s`
                          : "Resend verification code"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* CARD FOOTER */}

            <div
              className="flex items-center justify-between gap-3 border-t px-6 py-4 sm:px-9"
              style={{
                borderColor: colors.divider,
                backgroundColor: colors.subtle,
              }}
            >
              <div
                className="flex items-center gap-2 text-[10px]"
                style={{ color: colors.muted }}
              >
                <ShieldCheck
                  size={14}
                  className="text-[#E9812B]"
                />
                Session-protected access
              </div>

              <span
                className="text-[10px] font-medium"
                style={{ color: colors.muted }}
              >
                Target Trek
              </span>
            </div>
          </div>

          {/* BOTTOM NOTE */}

          <p
            className="mx-auto mt-6 max-w-[390px] text-center text-[11px] leading-[1.9]"
            style={{ color: colors.muted }}
          >
            This workspace is intended for authorized
            Target Trek team members only.
          </p>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;
