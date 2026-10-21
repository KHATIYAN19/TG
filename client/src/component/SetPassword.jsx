
import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";
import { z } from "zod";
import toast from "react-hot-toast";

import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  X,
} from "lucide-react";

import BASE_URL from "../utils/Url";

/* =====================================================
   CONFIGURATION
===================================================== */

const API_URL = `${String(BASE_URL).replace(
  /\/$/,
  ""
)}/api/auth/password/setup`;

const LOGIN_ROUTE = "/admin/login";
const THEME_KEY = "theme";

/* =====================================================
   PASSWORD VALIDATION — MINIMUM 8 CHARACTERS
===================================================== */

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(128, "Maximum 128 characters")
      .regex(
        /[A-Z]/,
        "Include an uppercase letter"
      )
      .regex(
        /[a-z]/,
        "Include a lowercase letter"
      )
      .regex(
        /[0-9]/,
        "Include a number"
      )
      .regex(
        /[^A-Za-z0-9]/,
        "Include a special character"
      ),

    confirmPassword: z
      .string()
      .min(1, "Confirm your password"),
  })
  .refine(
    (data) =>
      data.password ===
      data.confirmPassword,
    {
      message:
        "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

const PASSWORD_RULES = [
  {
    label: "At least 8 characters",
    test: (value) =>
      value.length >= 8,
  },
  {
    label: "Uppercase letter",
    test: (value) =>
      /[A-Z]/.test(value),
  },
  {
    label: "Lowercase letter",
    test: (value) =>
      /[a-z]/.test(value),
  },
  {
    label: "A number",
    test: (value) =>
      /[0-9]/.test(value),
  },
  {
    label: "Special character",
    test: (value) =>
      /[^A-Za-z0-9]/.test(value),
  },
];

/* =====================================================
   THEME SYNC
===================================================== */

const readTheme = () => {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved =
    localStorage.getItem(
      THEME_KEY
    );

  if (
    saved === "dark" ||
    saved === "light"
  ) {
    return saved;
  }

  return document.documentElement.classList.contains(
    "dark"
  )
    ? "dark"
    : "light";
};

const useSyncedTheme = () => {
  const [theme, setTheme] =
    useState(readTheme);

  useEffect(() => {
    const sync = () =>
      setTheme(readTheme());

    const observer =
      new MutationObserver(sync);

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

    window.addEventListener(
      "storage",
      sync
    );

    window.addEventListener(
      "theme-change",
      sync
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "storage",
        sync
      );

      window.removeEventListener(
        "theme-change",
        sync
      );
    };
  }, []);

  return theme;
};

/* =====================================================
   API ERROR HANDLER

   Don't treat every HTTP 400 as an expired link.
===================================================== */

const getApiError = (error) => {
  const status =
    error.response?.status;

  const data =
    error.response?.data || {};

  const invalidCodes = [
    "TOKEN_INVALID",
    "TOKEN_EXPIRED",
    "TOKEN_USED",
    "CHALLENGE_INVALID",
    "CHALLENGE_EXPIRED",
  ];

  const message =
    data.message ||
    (error.code === "ECONNABORTED"
      ? "Request timed out. Please try again."
      : error.response
        ? "Unable to save password."
        : "Cannot connect to the server.");

  const invalidLink =
    invalidCodes.includes(
      data.code
    ) ||
    status === 410 ||
    (
      status === 401 &&
      /link|token|expired|already used/i.test(
        message
      )
    );

  return {
    message,
    invalidLink,
  };
};

/* =====================================================
   PASSWORD INPUT
===================================================== */

const PasswordInput = ({
  label,
  name,
  value,
  onChange,
  visible,
  onToggle,
  error,
  disabled,
  isDark,
}) => (
  <div>
    <label
      htmlFor={name}
      className="mb-2 block text-[13px] font-semibold"
    >
      {label}
      <span className="ml-1 text-[#F97316]">*</span>
    </label>

    <div className="relative">
      <LockKeyhole
        size={17}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]"
      />

      <input
        id={name}
        name={name}
        type={
          visible
            ? "text"
            : "password"
        }
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoComplete="new-password"
        maxLength={128}
        aria-invalid={Boolean(error)}
        placeholder={
          name === "password"
            ? "Enter new password"
            : "Confirm new password"
        }
        className={`h-12 w-full rounded-lg border pl-11 pr-12 text-[13px] outline-none transition-all focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/10 ${
          error
            ? "border-red-500"
            : isDark
              ? "border-[#383838] bg-[#1D1D1D] text-white"
              : "border-[#DDDDDD] bg-white text-black"
        }`}
      />

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={
          visible
            ? "Hide password"
            : "Show password"
        }
        className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-[#888888] hover:text-[#F97316]"
      >
        {visible ? (
          <EyeOff size={17} />
        ) : (
          <Eye size={17} />
        )}
      </button>
    </div>

    {error && (
      <p
        role="alert"
        className="mt-2 flex items-center gap-1.5 text-[11px] text-red-500"
      >
        <CircleAlert size={13} />
        {error}
      </p>
    )}
  </div>
);

/* =====================================================
   MAIN COMPONENT
===================================================== */

function SetPassword() {
  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [searchParams] =
    useSearchParams();

  const theme =
    useSyncedTheme();

  const isDark =
    theme === "dark";

  const isReset =
    location.pathname.startsWith(
      "/reset-password"
    );

  // Accept any non-empty token.
  // The backend verifies its actual validity.
  const token =
    searchParams.get("token") || "";

  const hasToken =
    token.trim().length > 0;

  /* =================================================
     STATE
  ================================================= */

  const [form, setForm] =
    useState({
      password: "",
      confirmPassword: "",
    });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [linkInvalid, setLinkInvalid] =
    useState(false);

  const [apiError, setApiError] =
    useState("");

  /* =================================================
     PASSWORD RULES
  ================================================= */

  const ruleResults =
    useMemo(
      () =>
        PASSWORD_RULES.map(
          (rule) => ({
            ...rule,
            passed: rule.test(
              form.password
            ),
          })
        ),
      [form.password]
    );

  const passedCount =
    ruleResults.filter(
      (rule) => rule.passed
    ).length;

  const passwordValid =
    form.password.length >= 8 &&
    form.password.length <= 128 &&
    passedCount ===
      PASSWORD_RULES.length;

  const passwordsMatch =
    form.confirmPassword.length > 0 &&
    form.password ===
      form.confirmPassword;

  const canSubmit =
    passwordValid &&
    passwordsMatch &&
    hasToken &&
    !linkInvalid &&
    !loading &&
    !success;

  /* =================================================
     STYLES
  ================================================= */

  const pageClass = isDark
    ? "bg-black text-white"
    : "bg-white text-black";

  const cardClass = isDark
    ? "border-[#303030] bg-[#111111]"
    : "border-[#E5E5E5] bg-white";

  const mutedClass = isDark
    ? "text-[#999999]"
    : "text-[#737373]";

  const subtleClass = isDark
    ? "border-[#343434] bg-[#1B1B1B]"
    : "border-[#E5E5E5] bg-[#F8F8F8]";

  /* =================================================
     HANDLE CHANGE
  ================================================= */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setApiError("");
  };

  /* =================================================
     SUBMIT PASSWORD
  ================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      loading ||
      success
    ) {
      return;
    }

    if (
      !hasToken ||
      linkInvalid
    ) {
      toast.error(
        "Password setup link is unavailable"
      );
      return;
    }

    setErrors({});
    setApiError("");

    const validation =
      passwordSchema.safeParse(
        form
      );

    if (!validation.success) {
      const fieldErrors = {};

      validation.error.issues.forEach(
        (issue) => {
          const key =
            issue.path[0];

          if (
            key &&
            !fieldErrors[key]
          ) {
            fieldErrors[key] =
              issue.message;
          }
        }
      );

      setErrors(fieldErrors);

      toast.error(
        "Please check the password requirements"
      );

      return;
    }

    setLoading(true);

    try {
      /* =====================================
         EXACT BACKEND REQUEST CONTRACT

         Your controller expects:
         token
         password
         confirmPassword
      ===================================== */

      const response =
        await axios.post(
          API_URL,
          {
            token: token.trim(),

            password:
              validation.data.password,

            confirmPassword:
              validation.data.confirmPassword,
          },
          {
            headers: {
              "Content-Type":
                "application/json",
            },

            withCredentials: true,
            timeout: 20000,
          }
        );

      const data =
        response.data;

      if (!data.success) {
        throw new Error(
          data.message ||
            "Unable to save password"
        );
      }

      setSuccess(true);

      setForm({
        password: "",
        confirmPassword: "",
      });

      setErrors({});
      setApiError("");

      /* Remove sensitive token from URL */
      window.history.replaceState(
        window.history.state,
        "",
        location.pathname
      );

      toast.success(
        isReset
          ? "Password reset successfully"
          : "Password created successfully"
      );
    } catch (error) {
      const result =
        getApiError(error);

      setApiError(
        result.message
      );

      if (
        result.invalidLink
      ) {
        setLinkInvalid(true);
      }

      toast.error(
        result.message
      );
    } finally {
      setLoading(false);
    }
  };

  /* =================================================
     PAGE STATE
  ================================================= */

  const invalidTokenState =
    !success &&
    (
      !hasToken ||
      linkInvalid
    );

  /* =================================================
     RENDER
  ================================================= */

  return (
    <div
      data-theme={theme}
      className={`min-h-screen mt-16 px-4 py-8 sm:px-6 lg:py-14 ${pageClass}`}
    >
      <div className="mx-auto w-full max-w-[520px]">

        {/* PAGE HEADER */}

        <div className="mb-7">
          <div className="mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#F97316]" />

            <span
              className={`text-[11px] font-semibold uppercase tracking-[1.5px] ${mutedClass}`}
            >
              Target Trek / Account security
            </span>
          </div>

          <h1 className="text-[30px] font-semibold tracking-[-1px]">
            {success
              ? "Password updated."
              : invalidTokenState
                ? "Link unavailable."
                : isReset
                  ? "Reset your password."
                  : "Set your password."}
          </h1>

          <p
            className={`mt-3 text-[13px] leading-6 ${mutedClass}`}
          >
            {success
              ? "Your password has been saved successfully."
              : invalidTokenState
                ? "Your password link is missing, expired, invalid or already used."
                : isReset
                  ? "Create a new password to regain access to your account."
                  : "Create a secure password to activate your Target Trek account."}
          </p>
        </div>

        {/* MAIN CARD */}

        <div
          className={`overflow-hidden rounded-xl border ${cardClass}`}
        >
          <div className="p-6 sm:p-8">

            {/* =====================================
               SUCCESS STATE
            ===================================== */}

            {success ? (
              <div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#F97316] text-white">
                  <CheckCircle2 size={28} />
                </div>

                <h2 className="mt-6 text-[21px] font-semibold">
                  You're all set.
                </h2>

                <p
                  className={`mt-3 text-[13px] leading-7 ${mutedClass}`}
                >
                  Your password is now configured.
                  You can sign in using your email
                  or mobile number and the password
                  you just created.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      LOGIN_ROUTE,
                      { replace: true }
                    )
                  }
                  className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#F97316] text-[13px] font-bold text-white hover:bg-[#EA650A]"
                >
                  Continue to login
                  <ArrowRight size={17} />
                </button>
              </div>
            ) : invalidTokenState ? (
              /* =================================
                 INVALID LINK STATE
              ================================= */

              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F97316] text-white">
                  <CircleAlert size={24} />
                </div>

                <h2 className="mt-6 text-[19px] font-semibold">
                  Password link unavailable
                </h2>

                <p
                  className={`mt-3 text-[13px] leading-7 ${mutedClass}`}
                >
                  The link may be missing,
                  expired, already used, or revoked.
                  Contact your administrator to
                  generate another password setup link.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      LOGIN_ROUTE
                    )
                  }
                  className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#F97316] text-[13px] font-semibold text-white hover:bg-[#EA650A]"
                >
                  Return to login
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              /* =================================
                 PASSWORD FORM
              ================================= */

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F97316] text-white">
                    <KeyRound size={20} />
                  </div>

                  <div>
                    <h2 className="text-[16px] font-semibold">
                      Create a secure password
                    </h2>

                    <p
                      className={`mt-1 text-[12px] leading-6 ${mutedClass}`}
                    >
                      Choose a strong password you
                      haven't used on other websites.
                    </p>
                  </div>
                </div>

                {/* PASSWORD */}

                <PasswordInput
                  label="New password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  visible={showPassword}
                  onToggle={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  error={errors.password}
                  disabled={loading}
                  isDark={isDark}
                />

                {/* PASSWORD REQUIREMENTS */}

                <div
                  className={`rounded-lg border p-4 ${subtleClass}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-[12px] font-semibold">
                      Password requirements
                    </h3>

                    <span
                      className={`text-[11px] font-semibold ${
                        passwordValid
                          ? "text-[#F97316]"
                          : mutedClass
                      }`}
                    >
                      {passwordValid
                        ? "Requirements met"
                        : `${passedCount}/5`}
                    </span>
                  </div>

                  {/* PROGRESS */}

                  <div className="mt-4 grid grid-cols-5 gap-1.5">
                    {ruleResults.map(
                      (rule, index) => (
                        <div
                          key={index}
                          className={`h-1 rounded-full ${
                            rule.passed
                              ? "bg-[#F97316]"
                              : isDark
                                ? "bg-[#414141]"
                                : "bg-[#DDDDDD]"
                          }`}
                        />
                      )
                    )}
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {ruleResults.map(
                      (rule) => (
                        <div
                          key={rule.label}
                          className="flex items-center gap-2"
                        >
                          <span
                            className={`flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-full border ${
                              rule.passed
                                ? "border-[#F97316] bg-[#F97316]"
                                : isDark
                                  ? "border-[#555555]"
                                  : "border-[#CCCCCC]"
                            }`}
                          >
                            {rule.passed && (
                              <Check
                                size={11}
                                strokeWidth={3}
                                className="text-white"
                              />
                            )}
                          </span>

                          <span
                            className={`text-[11px] ${
                              rule.passed
                                ? ""
                                : mutedClass
                            }`}
                          >
                            {rule.label}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <p
                    className={`mt-4 text-[11px] ${mutedClass}`}
                  >
                    Maximum password length: 128 characters.
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}

                <PasswordInput
                  label="Confirm password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  visible={showConfirmPassword}
                  onToggle={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  error={errors.confirmPassword}
                  disabled={loading}
                  isDark={isDark}
                />

                {/* PASSWORD MATCH */}

                {form.confirmPassword && (
                  <div
                    className={`flex items-center gap-2 text-[11px] ${
                      passwordsMatch
                        ? "text-[#F97316]"
                        : "text-red-500"
                    }`}
                  >
                    {passwordsMatch ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <X size={15} />
                    )}

                    {passwordsMatch
                      ? "Passwords match"
                      : "Passwords do not match"}
                  </div>
                )}

                {/* API ERROR */}

                {apiError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-500/40 p-3.5 text-[12px] text-red-500"
                  >
                    <CircleAlert
                      size={16}
                      className="mt-0.5 shrink-0"
                    />

                    <span>{apiError}</span>
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#F97316] text-[13px] font-bold text-white transition-colors hover:bg-[#EA650A] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving password...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={17} />

                      {isReset
                        ? "Reset password"
                        : "Set password"}

                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* CARD BOTTOM */}

          <div
            className={`flex items-center gap-2 border-t px-6 py-4 text-[11px] ${mutedClass} ${
              isDark
                ? "border-[#303030] bg-[#191919]"
                : "border-[#E8E8E8] bg-[#FAFAFA]"
            }`}
          >
            <ShieldCheck
              size={15}
              className="text-[#F97316]"
            />
            Secure account password setup
          </div>
        </div>

        {!success && (
          <p
            className={`mt-6 text-center text-[12px] leading-6 ${mutedClass}`}
          >
            Need a new setup link?
            Contact your Target Trek administrator.
          </p>
        )}
      </div>
    </div>
  );
}

export default SetPassword;
