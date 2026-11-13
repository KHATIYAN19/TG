import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import PhoneInput from "../utils/PhoneInput";
import { DEFAULT_DIAL, digitsOf, mobileProblem } from "../utils/countries";
import { ArrowLeft, ArrowRight, Check, EnvelopeSimpleOpen, Eye, EyeSlash, Gift, Images, Key, LockKey, ShieldWarning, WarningCircle } from "@phosphor-icons/react";

import { login as loginAction } from "../Redux/authSlice";
import { API_ROOT, http, errMsg, errCode, retryAfterOf } from "../arena/api";
import GoogleButton, { googleEnabled } from "../arena/GoogleButton";
import { useMedia, useMemoriesChrome } from "./chrome";
import { FONT_LINKS, Logo, cx } from "./ui";
import { TEMPLATES, TemplateScene } from "./templates";
import { THEME_TOTAL } from "./Showcase";
import { Btn, OCCASION, useStickyFix } from "./landingUi";
import { trackSignup } from "./metaTracking";
import "./memories.css";
import "./landing.css";

/*
  MEMORIES: SIGN UP / LOG IN
  Same accounts and same server endpoints as Prep Buddy Arena (email + OTP, password login with OTP,
  forgot password, Google). One Target Trek account works everywhere. This page is light-only.
*/

const LOCK_CODES = ["SIGNUP_LOCKED", "RESET_LOCKED", "LOGIN_IP_LOCKED"];
const RETURN_KEY = "memories:returnTo";

const passwordRule = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/\d/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a special character");

const mobileFields = (v, ctx) => {
  const problem = mobileProblem(v.countryCode, v.mobile);
  if (problem) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["mobile"], message: problem });
};
const countryRule = z.string().default(DEFAULT_DIAL);
const mobileRule = z.string().trim().transform(digitsOf);

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name"),
    email: z.string().trim().email("Enter a valid email"),
    countryCode: countryRule,
    mobile: mobileRule,
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .superRefine(mobileFields)
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
const mobileSchema = z.object({ countryCode: countryRule, mobile: mobileRule }).superRefine(mobileFields);
const forgotSchema = z.object({ email: z.string().trim().email("Enter a valid email") });
const resetSchema = z
  .object({ password: passwordRule, confirmPassword: z.string() })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or mobile"),
  password: z.string().min(1, "Enter your password"),
});

/* ---------------------------- small form pieces ---------------------------- */
// 16px text in every field: anything smaller makes iPhone Safari zoom the page when the field is tapped
const inputClass = (invalid) => cx("ml-input", invalid && "ml-input-bad");

function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div>
      {label && <label htmlFor={htmlFor} className="title-4 mb-2 block text-[#4a2340]">{label}</label>}
      {children}
      {error ? <p role="alert" className="caption-4 mt-2 flex items-center gap-1 text-[#be123c]"><WarningCircle size={14} weight="fill" className="shrink-0" aria-hidden /> {error}</p> : hint ? <p className="caption-5 mt-2 text-[#8a6a80]">{hint}</p> : null}
    </div>
  );
}

/* the submit button of each step, with its busy state */
function Submit({ children, ...rest }) {
  return <Btn type="submit" className="w-full" {...rest}>{children}</Btn>;
}

/* ---------------------------- 6 digit code boxes ---------------------------- */
function OtpInput({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");
  const setAt = (index, char) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(""));
  };
  return (
    <div className="grid grid-cols-6 gap-2" role="group" aria-label="6 digit verification code">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={digit}
          disabled={disabled}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          className={cx("ml-input ml-otp", digit && "ml-otp-on")}
          onChange={(e) => {
            const char = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(i, char);
            if (char && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => { if (e.key === "Backspace" && !digit && i > 0) refs.current[i - 1]?.focus(); }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (!pasted) return;
            e.preventDefault();
            onChange(pasted);
            refs.current[Math.min(pasted.length, 5)]?.focus();
          }}
        />
      ))}
    </div>
  );
}

function useCountdown(initial = 0) {
  const [seconds, setSeconds] = useState(initial);
  useEffect(() => {
    if (seconds <= 0) return undefined;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  return [seconds, setSeconds];
}

// Re-renders every second while `until` (a ms timestamp) is in the future.
function useRemaining(until) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until || until <= Date.now()) return undefined;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [until]);
  return Math.max(0, Math.ceil(((until || 0) - now) / 1000));
}

const formatWait = (s) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
};
const PasswordInput = forwardRef(function PasswordInput({ id, invalid, ...rest }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} id={id} type={show ? "text" : "password"} className={cx(inputClass(invalid), "!pr-12")} {...rest} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-xl text-[#a07890] transition-colors duration-300 hover:text-[#be123c]" aria-label={show ? "Hide password" : "Show password"} aria-pressed={show}>
        {show ? <EyeSlash size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
      </button>
    </div>
  );
});

/* the password rules, ticked off live as they type (the same five rules the form checks) */
const PW_RULES = [[/.{8,}/, "8 characters"], [/[A-Z]/, "Uppercase"], [/[a-z]/, "Lowercase"], [/\d/, "Number"], [/[^A-Za-z0-9]/, "Symbol"]];
function PasswordRules({ value = "" }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-2" aria-label="Password rules">
      {PW_RULES.map(([re, label]) => {
        const ok = re.test(value);
        return (
          <li key={label} className={cx("ml-rule-chip caption-4 inline-flex items-center gap-1 rounded-full px-2 py-1", ok ? "bg-[#ecfdf5] text-emerald-700" : "bg-[#fff1f3] text-[#8a6a80]")}>
            <Check size={12} weight="bold" className={ok ? "opacity-100" : "opacity-30"} aria-hidden /> {label}<span className="sr-only">{ok ? ": done" : ": still needed"}</span>
          </li>
        );
      })}
    </ul>
  );
}

const Divider = () => (
  <div className="caption-4 flex items-center gap-3 text-[#a07890]" aria-hidden>
    <span className="h-px flex-1 bg-[#f5dfe4]" /> or with email <span className="h-px flex-1 bg-[#f5dfe4]" />
  </div>
);

/* icon, title and one line of text at the top of a step */
function StepHead({ Icon, title, children, center = false }) {
  return (
    <div className={center ? "text-center" : undefined}>
      {Icon && <span className={cx("grid h-12 w-12 place-items-center rounded-2xl bg-[#fff1f3] text-[#e11d48]", center && "mx-auto")}><Icon size={24} weight="duotone" aria-hidden /></span>}
      <h1 className={cx("heading-5 text-[#2a1023]", Icon && "mt-4")}>{title}</h1>
      <p className="body-6 mt-2 text-[#7a5370]">{children}</p>
    </div>
  );
}

function Notice({ tone = "error", title, children }) {
  const warn = tone === "warn";
  const Icon = warn ? ShieldWarning : WarningCircle;
  return (
    <div role="alert" className={cx("ml-step body-6 flex gap-3 rounded-2xl p-4", warn ? "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200" : "bg-[#fff1f3] text-[#9f1239] ring-1 ring-inset ring-[#fecdd3]")}>
      <Icon size={20} weight="fill" className="mt-0.5 shrink-0" aria-hidden />
      <div className="min-w-0 space-y-1">{title && <p className="font-semibold">{title}</p>}{children}</div>
    </div>
  );
}

const PERKS = [
  [Gift, "Ready in minutes", "Pick an occasion, write your message and share the link."],
  [Images, "Your photos, videos and voice", "Add the moments that mean the most to the two of you."],
  [LockKey, "Public or private", "Open to anyone with the link, or locked behind a PIN only they know."],
];

/* the template they picked on the home page (it travels here as ?template=, or was remembered for this tab) */
const pickedTemplate = (params) => {
  let id = params.get("template");
  if (!id) { try { id = sessionStorage.getItem("memories:template"); } catch { /* ignore */ } }
  return TEMPLATES.find((t) => t.theme === id) || null;
};

/* --------------------------------- page --------------------------------- */
export default function MemoriesAuth() {
  useMemoriesChrome();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const token = useSelector((s) => s.auth.token);
  const tall = useMedia("(min-height: 860px)");
  const rootRef = useRef(null);
  useStickyFix(rootRef); // keeps the side panel pinned on desktop

  const [step, setStep] = useState(params.get("mode") === "signup" || location.pathname.endsWith("/signup") ? "signup" : "login");
  const [pendingEmail, setPendingEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [cooldown, setCooldown] = useCountdown(0);
  const [lockedUntil, setLockedUntil] = useState(0); // 5 wrong passwords
  const lockLeft = useRemaining(lockedUntil);
  const isLocked = lockLeft > 0;
  const [authLock, setAuthLock] = useState(null); // 24h locks: too many wrong codes / failed logins from this network
  const authLockLeft = useRemaining(authLock?.until ?? 0);
  const authLocked = authLockLeft > 0;
  const applyLock = (error) => {
    if (!LOCK_CODES.includes(errCode(error))) return false;
    const data = error.response?.data ?? {};
    setAuthLock({
      until: data.lockedUntil ? new Date(data.lockedUntil).getTime() : Date.now() + (retryAfterOf(error) || 86400) * 1000,
      message: errMsg(error),
    });
    setFormError("");
    return true;
  };

  // Where to go after signing in: the page they came from, else the Memories app. Never off-site.
  const from = location.state?.from;
  const savedReturn = (() => { try { return sessionStorage.getItem(RETURN_KEY); } catch { return null; } })();
  const safe = (p) => (p && /^\/memories(\/|$|\?)/.test(p) && !p.startsWith("//") ? p : null);
  const redirectTo = safe(from ? `${from.pathname}${from.search || ""}` : null) || safe(savedReturn) || "/memories/app";

  useEffect(() => {
    if (token) navigate(redirectTo, { replace: true });
  }, [token, navigate, redirectTo]);

  const finish = useCallback(
    (data) => {
      if (!data?.token || !data?.user) throw new Error("Incomplete sign-in response");
      dispatch(loginAction({ token: data.token, user: data.user }));
      try { sessionStorage.removeItem(RETURN_KEY); } catch { /* ignore */ }
      toast.success("You're signed in", { id: "memories-signed-in" });
      navigate(redirectTo, { replace: true });
    },
    [dispatch, navigate, redirectTo]
  );

  const signupForm = useForm({ resolver: zodResolver(signupSchema), mode: "onBlur", defaultValues: { countryCode: DEFAULT_DIAL } });
  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const forgotForm = useForm({ resolver: zodResolver(forgotSchema) });
  const resetForm = useForm({ resolver: zodResolver(resetSchema) });
  const mobileForm = useForm({ resolver: zodResolver(mobileSchema), defaultValues: { countryCode: DEFAULT_DIAL } });

  /* ---- Google (same account as email + password) ---- */
  const [googleSignup, setGoogleSignup] = useState(null); // { signupToken, email, name }

  const onGoogleCredential = async (credential) => {
    setBusy(true);
    setFormError("");
    try {
      const { data } = await http.post("/google", { credential });
      if (data.needsMobile) {
        setGoogleSignup({ signupToken: data.signupToken, email: data.email, name: data.name });
        setStep("google-mobile");
        return;
      }
      finish(data);
    } catch (error) {
      if (!applyLock(error)) setFormError(errMsg(error));
    } finally {
      setBusy(false);
    }
  };

  const onGoogleMobile = mobileForm.handleSubmit(async (values) => {
    setBusy(true);
    setFormError("");
    try {
      const { data } = await http.post("/google/complete", { signupToken: googleSignup.signupToken, countryCode: values.countryCode, mobile: values.mobile });
      trackSignup("google");
      finish(data);
    } catch (error) {
      if (["SIGNUP_EXPIRED", "ACCOUNT_EXISTS", "SIGNUP_ALREADY_USED"].includes(errCode(error))) {
        setGoogleSignup(null);
        setStep("login");
      }
      if (!applyLock(error)) setFormError(errMsg(error));
    } finally {
      setBusy(false);
    }
  });

  /* ---- signup → send OTP ---- */
  const onSignup = signupForm.handleSubmit(async (values) => {
    setBusy(true);
    setFormError("");
    try {
      const { data } = await http.post("/signup", { ...values, source: "memories" });
      setPendingEmail(values.email.toLowerCase());
      setCooldown(data.resendInSeconds ?? 60);
      setOtp("");
      setStep("verify");
    } catch (error) {
      if (errCode(error) === "ACCOUNT_EXISTS") {
        loginForm.setValue("identifier", values.email);
        setStep("login");
      }
      if (["OTP_RATE_LIMIT", "OTP_COOLDOWN"].includes(errCode(error))) setCooldown(retryAfterOf(error));
      if (!applyLock(error)) setFormError(errMsg(error));
    } finally {
      setBusy(false);
    }
  });

  /* ---- verify signup OTP → signed in ---- */
  const onVerifySignup = async () => {
    if (otp.length !== 6) return setFormError("Enter the 6 digit code");
    setBusy(true);
    setFormError("");
    try {
      const { data } = await http.post("/signup/verify", { email: pendingEmail, otp });
      trackSignup("email");
      finish(data);
    } catch (error) {
      if (!applyLock(error)) setFormError(errMsg(error));
      if (["SIGNUP_EXPIRED", "OTP_ATTEMPTS"].includes(errCode(error))) setStep("signup");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setFormError("");
    try {
      const { data } = await http.post("/signup/resend", { email: pendingEmail, source: "memories" });
      setCooldown(data.resendInSeconds ?? 60);
      setOtp("");
      toast.success("New code sent", { id: "memories-otp-sent" });
    } catch (error) {
      if (["OTP_RATE_LIMIT", "OTP_COOLDOWN"].includes(errCode(error))) setCooldown(retryAfterOf(error));
      if (!applyLock(error)) setFormError(errMsg(error));
    } finally {
      setBusy(false);
    }
  };

  /* ---- login (existing auth API) ---- */
  const authApi = axios.create({ baseURL: `${API_ROOT}/api/auth`, withCredentials: true, timeout: 20000 });

  const onLogin = loginForm.handleSubmit(async (values) => {
    setBusy(true);
    setFormError("");
    try {
      const identifier = values.identifier.includes("@") ? values.identifier.toLowerCase() : values.identifier;
      const { data } = await authApi.post("/login", { identifier, password: values.password });
      if (data.requiresOtp === false) return finish(data);
      setChallengeId(data.challengeId);
      setPendingEmail(identifier);
      setOtp("");
      setCooldown(60);
      setStep("login-otp");
    } catch (error) {
      if (errCode(error) === "ACCOUNT_LOCKED") {
        const until = error.response.data.lockedUntil ? new Date(error.response.data.lockedUntil).getTime() : Date.now() + retryAfterOf(error) * 1000;
        setLockedUntil(until);
        setFormError("");
      } else if (!applyLock(error)) {
        setFormError(errMsg(error));
      }
    } finally {
      setBusy(false);
    }
  });

  const onVerifyLogin = async () => {
    if (otp.length !== 6) return setFormError("Enter the 6 digit code");
    setBusy(true);
    setFormError("");
    try {
      const { data } = await authApi.post("/verify-otp", { challengeId, otp, rememberDevice: true });
      finish(data);
    } catch (error) {
      if (!applyLock(error)) setFormError(errMsg(error));
    } finally {
      setBusy(false);
    }
  };

  const resendLogin = async () => {
    setBusy(true);
    try {
      await authApi.post("/resend-otp", { challengeId });
      setCooldown(60);
      toast.success("New code sent");
    } catch (error) {
      if (!applyLock(error)) setFormError(errMsg(error));
    } finally {
      setBusy(false);
    }
  };

  /* ---- forgot password: email → code → new password ---- */
  const sendResetCode = async (email) => {
    setBusy(true);
    setFormError("");
    try {
      const { data } = await http.post("/password/forgot", { email, source: "memories" });
      setPendingEmail(email);
      setCooldown(data.resendInSeconds ?? 60);
      setOtp("");
      resetForm.reset();
      setStep("reset");
      return true;
    } catch (error) {
      const code = errCode(error);
      if (["OTP_RATE_LIMIT", "OTP_COOLDOWN"].includes(code)) setCooldown(retryAfterOf(error));
      if (code === "OTP_COOLDOWN") { // a code was sent a moment ago: let them carry on and type it in
        setPendingEmail(email);
        setOtp("");
        setStep("reset");
      }
      if (!applyLock(error)) setFormError(errMsg(error));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const onForgot = forgotForm.handleSubmit((values) => sendResetCode(values.email.toLowerCase()));
  const resendReset = async () => { if (await sendResetCode(pendingEmail)) toast.success("New code sent", { id: "memories-otp-sent" }); };

  const onReset = resetForm.handleSubmit(async (values) => {
    if (otp.length !== 6) return setFormError("Enter the 6 digit code from your email");
    setBusy(true);
    setFormError("");
    try {
      await http.post("/password/reset", { email: pendingEmail, otp, ...values });
      toast.success("Password changed. Log in with your new password.", { id: "memories-pw-reset" });
      loginForm.reset({ identifier: pendingEmail, password: "" });
      setLockedUntil(0);
      setOtp("");
      setStep("login");
    } catch (error) {
      if (!applyLock(error)) setFormError(errMsg(error));
      if (errCode(error) === "OTP_ATTEMPTS") setStep("forgot");
    } finally {
      setBusy(false);
    }
  });
  const isOtpStep = step === "verify" || step === "login-otp";
  const showTabs = step === "signup" || step === "login";
  const waitLabel = cooldown > 60 ? `Try again in ${Math.ceil(cooldown / 60)} min` : `Resend in ${cooldown}s`;
  const goTo = (next) => { setStep(next); setFormError(""); };
  const goForgot = () => {
    const id = loginForm.getValues("identifier") || "";
    forgotForm.setValue("email", id.includes("@") ? id : "");
    goTo("forgot");
  };
  const linkBtn = "ml-link body-4 rounded-lg text-[#be123c]";
  const backBtn = "ml-link body-6 inline-flex items-center gap-1 rounded-lg text-[#7a5370]";

  const picked = pickedTemplate(params);
  const signupPw = signupForm.watch("password");
  const resetPw = resetForm.watch("password");
  // the phones in the side panel: the picked template in the middle, two others beside it
  const centre = picked || TEMPLATES[0];
  const sides = TEMPLATES.filter((t) => t.id !== centre.id).slice(0, 2);
  const phone = tall ? 0.74 : 0.56;
  const title = { signup: "Create your account", login: "Log in", verify: "Check your email", "login-otp": "Check your email", forgot: "Forgot password", reset: "Set a new password", "google-mobile": "One last detail" }[step] || "Log in";

  return (
    <main ref={rootRef} className="mem-root ml-root ml-auth lg:grid lg:grid-cols-2">
      <Helmet>
        <title>{title} | Memories by Target Trek</title>
        <meta name="robots" content="noindex" />
        <meta name="theme-color" content="#fffaf6" />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
      </Helmet>

      {/* ------------------------------ the form side ------------------------------ */}
      <div className="flex min-w-0 flex-col px-4 pb-12 sm:px-6">
        <header className="mx-auto flex w-full max-w-md items-center justify-between gap-3 py-4 lg:max-w-none">
          <Logo />
          <Link to="/memories" className="ml-link title-4 inline-flex items-center gap-1 rounded-full px-3 py-2 text-[#6b3a5a]"><ArrowLeft size={16} aria-hidden /> Back to home</Link>
        </header>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-6">
          {picked && showTabs && (
            <p className="ml-step caption-3 mb-4 inline-flex items-center gap-2 self-start rounded-full px-3 py-2" style={{ background: OCCASION[picked.id].tint, color: OCCASION[picked.id].ink }}>
              {(() => { const Ic = OCCASION[picked.id].Icon; return <Ic size={16} weight="fill" aria-hidden />; })()}
              Your {picked.name.toLowerCase()} page is one step away
            </p>
          )}

          <section className="rounded-3xl bg-white p-6 ring-1 ring-[#f5dfe4] sm:p-8" aria-label={title}>
            {showTabs && (
              <>
                <StepHead title={step === "signup" ? "Create your account" : "Welcome back"}>
                  {step === "signup" ? "Joining is free. You see every price before you pay." : "Log in to build, edit and track your pages."}
                </StepHead>
                <div className="ml-seg relative mb-6 mt-6 grid grid-cols-2 rounded-full bg-[#fff1f3] p-1" role="tablist" aria-label="Create an account or log in">
                  <span className={cx("ml-seg-thumb", step === "login" && "right")} aria-hidden />
                  {[["signup", "Create account"], ["login", "Log in"]].map(([key, label]) => (
                    <button key={key} type="button" role="tab" aria-selected={step === key} onClick={() => goTo(key)} className={cx("button-sm relative z-10 rounded-full px-3 py-2 transition-colors duration-300", step === key ? "text-[#be123c]" : "text-[#8a6a80] hover:text-[#be123c]")}>{label}</button>
                  ))}
                </div>
              </>
            )}

            <div className="space-y-4 empty:hidden [&:not(:empty)]:mb-6">
              {authLocked && (
                <Notice tone="warn" title="Temporarily locked for your security">
                  <p>{authLock.message.replace(/\s*(It unlocks|Please try again)[^.]*\.?$/i, "").trim()}</p>
                  <p>Unlocks automatically in <span className="font-semibold tabular-nums">{formatWait(authLockLeft)}</span>. If this is a mistake, <Link to="/memories/contact" className="font-semibold underline">contact support</Link> and we can unlock it.</p>
                </Notice>
              )}
              {formError && <Notice><p>{formError}</p></Notice>}
            </div>

            {/* each step fades up as it arrives */}
            <div key={step} className="ml-step">
              {/* SIGN UP */}
              {step === "signup" && (
                <form onSubmit={onSignup} className="space-y-4" noValidate>
                  {googleEnabled && (<><GoogleButton text="signup_with" onCredential={onGoogleCredential} disabled={busy || authLocked} /><Divider /></>)}
                  <Field label="Full name" htmlFor="name" error={signupForm.formState.errors.name?.message}>
                    <input id="name" autoComplete="name" autoCapitalize="words" enterKeyHint="next" aria-invalid={Boolean(signupForm.formState.errors.name) || undefined} className={inputClass(signupForm.formState.errors.name)} {...signupForm.register("name")} />
                  </Field>
                  <Field label="Email" htmlFor="email" error={signupForm.formState.errors.email?.message} hint="We send a 6 digit code here to confirm it is you.">
                    <input id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} enterKeyHint="next" aria-invalid={Boolean(signupForm.formState.errors.email) || undefined} className={inputClass(signupForm.formState.errors.email)} {...signupForm.register("email")} />
                  </Field>
                  <Field label="Mobile number" htmlFor="mobile" error={signupForm.formState.errors.mobile?.message}>
                    <PhoneInput id="mobile" countryProps={signupForm.register("countryCode")} mobileProps={signupForm.register("mobile")} dial={signupForm.watch("countryCode")} invalid={signupForm.formState.errors.mobile} inputClass={inputClass} />
                  </Field>
                  <Field label="Password" htmlFor="password" error={signupForm.formState.errors.password?.message}>
                    <PasswordInput id="password" autoComplete="new-password" invalid={signupForm.formState.errors.password} {...signupForm.register("password")} />
                    <PasswordRules value={signupPw} />
                  </Field>
                  <Field label="Confirm password" htmlFor="confirmPassword" error={signupForm.formState.errors.confirmPassword?.message}>
                    <PasswordInput id="confirmPassword" autoComplete="new-password" invalid={signupForm.formState.errors.confirmPassword} {...signupForm.register("confirmPassword")} />
                  </Field>
                  <Submit loading={busy} disabled={cooldown > 0 || authLocked}>
                    {cooldown > 60 ? `Try again in ${Math.ceil(cooldown / 60)} min` : <>Send my code <ArrowRight size={16} weight="bold" aria-hidden /></>}
                  </Submit>
                  <p className="caption-5 text-center text-[#8a6a80]">
                    By continuing you agree to our <Link className="ml-link font-semibold underline" to="/memories/terms">Terms</Link> and <Link className="ml-link font-semibold underline" to="/memories/privacy">Privacy Policy</Link>.
                  </p>
                </form>
              )}

              {/* LOG IN */}
              {step === "login" && (
                <form onSubmit={onLogin} className="space-y-4" noValidate>
                  {googleEnabled && (<><GoogleButton text="signin_with" onCredential={onGoogleCredential} disabled={busy || authLocked} /><Divider /></>)}
                  {isLocked && (
                    <Notice tone="warn" title="Account locked for your safety">
                      <p>Too many wrong passwords. It unlocks automatically in <span className="font-semibold tabular-nums">{formatWait(lockLeft)}</span>.</p>
                      <p>In a hurry? <button type="button" className="font-semibold underline" onClick={goForgot}>Reset your password</button> with an email code.</p>
                    </Notice>
                  )}
                  <Field label="Email or mobile" htmlFor="identifier" error={loginForm.formState.errors.identifier?.message}>
                    <input id="identifier" autoComplete="username" autoCapitalize="none" spellCheck={false} enterKeyHint="next" aria-invalid={Boolean(loginForm.formState.errors.identifier) || undefined} className={inputClass(loginForm.formState.errors.identifier)} {...loginForm.register("identifier")} />
                  </Field>
                  <Field label="Password" htmlFor="login-password" error={loginForm.formState.errors.password?.message}>
                    <PasswordInput id="login-password" autoComplete="current-password" invalid={loginForm.formState.errors.password} {...loginForm.register("password")} />
                  </Field>
                  <div className="text-right"><button type="button" className={linkBtn} onClick={goForgot}>Forgot password?</button></div>
                  <Submit loading={busy} disabled={isLocked || authLocked}>{isLocked ? `Locked · ${formatWait(lockLeft)}` : <>Log in <ArrowRight size={16} weight="bold" aria-hidden /></>}</Submit>
                  <p className="body-6 text-center text-[#7a5370]">New here? <button type="button" className={linkBtn} onClick={() => goTo("signup")}>Create an account</button></p>
                </form>
              )}

              {/* GOOGLE: ONE MORE DETAIL */}
              {step === "google-mobile" && googleSignup && (
                <form onSubmit={onGoogleMobile} className="space-y-6" noValidate>
                  <StepHead Icon={LockKey} title="One last detail">Signing up as <span className="break-all font-semibold text-[#2a1023]">{googleSignup.email}</span>. Add your mobile number to finish.</StepHead>
                  <Field label="Mobile number" htmlFor="g-mobile" error={mobileForm.formState.errors.mobile?.message}>
                    <PhoneInput id="g-mobile" autoFocus countryProps={mobileForm.register("countryCode")} mobileProps={mobileForm.register("mobile")} dial={mobileForm.watch("countryCode")} invalid={mobileForm.formState.errors.mobile} inputClass={inputClass} />
                  </Field>
                  <Submit loading={busy}>Create account <ArrowRight size={16} weight="bold" aria-hidden /></Submit>
                  <div className="text-center"><button type="button" className={backBtn} onClick={() => { setGoogleSignup(null); goTo("signup"); }}>Cancel</button></div>
                </form>
              )}

              {/* FORGOT PASSWORD: step 1 */}
              {step === "forgot" && (
                <form onSubmit={onForgot} className="space-y-6" noValidate>
                  <StepHead Icon={Key} title="Forgot your password?">Enter your account email and we will send a 6 digit code to set a new one.</StepHead>
                  <Field label="Email" htmlFor="forgot-email" error={forgotForm.formState.errors.email?.message}>
                    <input id="forgot-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false} aria-invalid={Boolean(forgotForm.formState.errors.email) || undefined} className={inputClass(forgotForm.formState.errors.email)} {...forgotForm.register("email")} />
                  </Field>
                  <Submit loading={busy} disabled={cooldown > 0 || authLocked}>{cooldown > 0 ? waitLabel.replace("Resend", "Send again") : "Send reset code"}</Submit>
                  <div className="text-center"><button type="button" className={backBtn} onClick={() => goTo("login")}><ArrowLeft size={14} aria-hidden /> Back to log in</button></div>
                </form>
              )}

              {/* FORGOT PASSWORD: step 2 */}
              {step === "reset" && (
                <form onSubmit={onReset} className="space-y-6" noValidate>
                  <StepHead Icon={EnvelopeSimpleOpen} title="Set a new password">If an account exists for <span className="break-all font-semibold text-[#2a1023]">{pendingEmail}</span>, we sent it a 6 digit code. It is valid for 10 minutes.</StepHead>
                  <OtpInput value={otp} onChange={setOtp} disabled={busy} />
                  <Field label="New password" htmlFor="reset-password" error={resetForm.formState.errors.password?.message}>
                    <PasswordInput id="reset-password" autoComplete="new-password" invalid={resetForm.formState.errors.password} {...resetForm.register("password")} />
                    <PasswordRules value={resetPw} />
                  </Field>
                  <Field label="Confirm new password" htmlFor="reset-confirm" error={resetForm.formState.errors.confirmPassword?.message}>
                    <PasswordInput id="reset-confirm" autoComplete="new-password" invalid={resetForm.formState.errors.confirmPassword} {...resetForm.register("confirmPassword")} />
                  </Field>
                  <Submit loading={busy} disabled={otp.length !== 6 || authLocked}>Change password</Submit>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button type="button" className={backBtn} onClick={() => { goTo("forgot"); forgotForm.setValue("email", pendingEmail); }}><ArrowLeft size={14} aria-hidden /> Change email</button>
                    <button type="button" disabled={cooldown > 0 || busy || authLocked} onClick={resendReset} className={linkBtn}>{cooldown > 0 ? waitLabel : "Resend code"}</button>
                  </div>
                  <p className="caption-5 text-center text-[#8a6a80]">Changing your password signs you out of every device and lifts any lock on your account.</p>
                </form>
              )}

              {/* CODE (sign up or log in) */}
              {isOtpStep && (
                <form className="space-y-6" noValidate onSubmit={(e) => { e.preventDefault(); (step === "verify" ? onVerifySignup : onVerifyLogin)(); }}>
                  <StepHead Icon={EnvelopeSimpleOpen} title="Check your email">We sent a 6 digit code to <span className="break-all font-semibold text-[#2a1023]">{pendingEmail}</span>. It can take a minute, and it may land in spam.</StepHead>
                  <OtpInput value={otp} onChange={setOtp} disabled={busy} />
                  <Submit loading={busy} disabled={otp.length !== 6 || authLocked}>{step === "verify" ? "Verify and create account" : "Verify and log in"}</Submit>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button type="button" className={backBtn} onClick={() => goTo(step === "verify" ? "signup" : "login")}><ArrowLeft size={14} aria-hidden /> Change details</button>
                    <button type="button" disabled={cooldown > 0 || busy || authLocked} onClick={step === "verify" ? resend : resendLogin} className={linkBtn}>
                      {cooldown > 60 ? `Try again in ${Math.ceil(cooldown / 60)} min` : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* what the side panel says, for phones and tablets where there is no side panel */}
          <ul className="mt-6 grid grid-cols-3 gap-2 lg:hidden">
            {PERKS.map(([Icon, t]) => (
              <li key={t} className="caption-4 flex flex-col items-center gap-2 rounded-2xl bg-white p-3 text-center text-[#6b3a5a] ring-1 ring-[#f5dfe4]">
                <Icon size={20} weight="duotone" className="text-[#e11d48]" aria-hidden /> {t}
              </li>
            ))}
          </ul>
          <p className="caption-5 mt-6 text-center text-[#8a6a80]">One Target Trek account works across Memories and the rest of the site.</p>
        </div>
      </div>

      {/* ------------------------------ the picture side (desktop) ------------------------------ */}
      <aside className="ml-dark ml-auth-side hidden bg-[#2a1023] p-12 text-white lg:flex lg:flex-col lg:justify-between" aria-label="What you can make">
        <p className="caption-3 text-[#fda4af]" style={{ letterSpacing: "0.16em" }}>{TEMPLATES.length} OCCASIONS · {THEME_TOTAL} LOOKS</p>

        <div className="relative mx-auto" style={{ width: 280 * phone, height: 580 * phone + 24 }} aria-hidden>
          {sides.map((t, i) => (
            <div key={t.id} className="absolute left-0 top-0" style={{ transform: `translate(${i ? 58 : -58}%, 6%) rotate(${i ? 9 : -9}deg) scale(0.86)`, opacity: 0.85 }}>
              <div className="ml-bob" style={{ "--d": `${i * 1.4}s` }}><TemplateScene theme={t.theme} scale={phone} /></div>
            </div>
          ))}
          <div className="ml-bob relative" style={{ "--d": "0.7s" }}><TemplateScene theme={centre.theme} scale={phone} /></div>
        </div>

        <div>
          <h2 className="heading-3 max-w-md text-white">Make someone&apos;s day, one page at a time.</h2>
          <ul className="ml-auth-perks mt-6 space-y-4">
            {PERKS.map(([Icon, t, d]) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#3d1a33] text-[#fda4af]"><Icon size={20} weight="duotone" aria-hidden /></span>
                <div className="min-w-0"><p className="body-4 text-white">{t}</p><p className="body-6 text-[#c9a9bd]">{d}</p></div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
