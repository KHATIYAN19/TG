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
import { ArrowLeft, Eye, EyeOff, Gift, ImageIcon, KeyRound, Lock, MailCheck, ShieldAlert } from "lucide-react";

import { login as loginAction } from "../Redux/authSlice";
import { API_ROOT, http, errMsg, errCode, retryAfterOf } from "../arena/api";
import GoogleButton, { googleEnabled } from "../arena/GoogleButton";
import { useMemoriesChrome } from "./chrome";
import { Button, FONT_LINKS, Field, Logo, cx, inputClass } from "./ui";
import "./memories.css";

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

/* ---------------------------- 6-digit OTP boxes ---------------------------- */
function OtpInput({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");
  const setAt = (index, char) => {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(""));
  };
  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit verification code">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={digit}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${i + 1}`}
          className="h-14 w-full min-w-0 rounded-2xl border border-rose-100 bg-white text-center text-xl font-semibold text-[#3a1530] transition focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-100"
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
      <input ref={ref} id={id} type={show ? "text" : "password"} className={cx(inputClass(invalid), "pr-11")} {...rest} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-[#b79bb0] hover:text-rose-500" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

const Divider = () => (
  <div className="flex items-center gap-3 text-xs text-[#b79bb0]" aria-hidden>
    <span className="h-px flex-1 bg-rose-100" /> or <span className="h-px flex-1 bg-rose-100" />
  </div>
);

const IconBadge = ({ icon: Icon }) => (
  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-rose-100 to-orange-100 text-rose-600"><Icon className="h-7 w-7" aria-hidden /></span>
);

/* --------------------------------- page --------------------------------- */
export default function MemoriesAuth() {
  useMemoriesChrome();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const token = useSelector((s) => s.auth.token);

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
    if (otp.length !== 6) return setFormError("Enter the 6-digit code");
    setBusy(true);
    setFormError("");
    try {
      const { data } = await http.post("/signup/verify", { email: pendingEmail, otp });
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
    if (otp.length !== 6) return setFormError("Enter the 6-digit code");
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
    if (otp.length !== 6) return setFormError("Enter the 6-digit code from your email");
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
  const goForgot = () => {
    const id = loginForm.getValues("identifier") || "";
    forgotForm.setValue("email", id.includes("@") ? id : "");
    setFormError("");
    setStep("forgot");
  };
  const linkBtn = "text-sm font-semibold text-rose-600 hover:underline disabled:cursor-not-allowed disabled:text-[#b79bb0] disabled:no-underline";
  const backBtn = "text-sm text-[#8a6a80] hover:text-rose-600";

  return (
    <main className="mem-root relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fff3ee] via-[#fffaf6] to-[#ffeef5]">
      <Helmet>
        <title>{step === "signup" ? "Create your account" : "Log in"} | Memories by Target Trek</title>
        <meta name="robots" content="noindex" />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
      </Helmet>

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-24 top-20 h-96 w-96 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-orange-200/50 blur-3xl" />
      </div>

      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <Link to="/memories" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6b3a5a] hover:text-rose-600"><ArrowLeft className="h-4 w-4" aria-hidden /> Back to home</Link>
      </div>

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-10">
        {/* Brand panel */}
        <aside className="hidden lg:block">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Memories</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-[#3a1530]">
            Make someone&apos;s day,<br /><span className="mem-script mem-gradient-text text-[1.2em]">one page at a time.</span>
          </h1>
          <ul className="mt-9 space-y-5">
            {[
              [Gift, "Ready in minutes", "Pick an occasion, write your message and share the link."],
              [ImageIcon, "Your photos and videos", "Add the moments that mean the most, with a main photo and video."],
              [Lock, "Public or private", "Open to anyone with the link, or locked behind a PIN only they know."],
            ].map(([Icon, title, text]) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-rose-500 shadow-sm ring-1 ring-rose-100"><Icon className="h-5 w-5" aria-hidden /></span>
                <div><p className="font-semibold text-[#3a1530]">{title}</p><p className="mt-0.5 text-sm text-[#7a5370]">{text}</p></div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Form card */}
        <section className="mx-auto w-full max-w-md">
          <div className="rounded-[32px] border border-rose-100 bg-white p-6 shadow-2xl shadow-rose-200/50 sm:p-8">
            {showTabs && (
              <div className="mb-6 grid grid-cols-2 rounded-full bg-rose-50 p-1 text-sm font-semibold" role="tablist">
                {[["signup", "Create account"], ["login", "Log in"]].map(([key, label]) => (
                  <button key={key} role="tab" aria-selected={step === key} onClick={() => { setStep(key); setFormError(""); }}
                    className={cx("rounded-full py-2.5 transition", step === key ? "bg-white text-rose-600 shadow-sm" : "text-[#8a6a80] hover:text-rose-600")}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {authLocked && (
              <div role="alert" className="mb-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                <p className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4 shrink-0" aria-hidden /> Temporarily locked for your security</p>
                <p className="mt-1.5">{authLock.message.replace(/\s*(It unlocks|Please try again)[^.]*\.?$/i, "").trim()}</p>
                <p className="mt-1.5">Unlocks automatically in <span className="font-bold tabular-nums">{formatWait(authLockLeft)}</span>. If this is a mistake, contact support and we can unlock it.</p>
              </div>
            )}

            {formError && <div role="alert" className="mb-5 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-rose-100">{formError}</div>}

            {/* SIGN UP */}
            {step === "signup" && (
              <form onSubmit={onSignup} className="space-y-4" noValidate>
                {googleEnabled && (<><GoogleButton text="signup_with" onCredential={onGoogleCredential} disabled={busy || authLocked} /><Divider /></>)}
                <Field label="Full name" htmlFor="name" error={signupForm.formState.errors.name?.message}>
                  <input id="name" autoComplete="name" className={inputClass(signupForm.formState.errors.name)} {...signupForm.register("name")} />
                </Field>
                <Field label="Email" htmlFor="email" error={signupForm.formState.errors.email?.message} hint="We'll send a verification code here.">
                  <input id="email" type="email" autoComplete="email" className={inputClass(signupForm.formState.errors.email)} {...signupForm.register("email")} />
                </Field>
                <Field label="Mobile number" htmlFor="mobile" error={signupForm.formState.errors.mobile?.message}>
                  <PhoneInput id="mobile" countryProps={signupForm.register("countryCode")} mobileProps={signupForm.register("mobile")} dial={signupForm.watch("countryCode")} invalid={signupForm.formState.errors.mobile} inputClass={inputClass} />
                </Field>
                <Field label="Password" htmlFor="password" error={signupForm.formState.errors.password?.message} hint="8+ characters with upper, lower, number and symbol.">
                  <PasswordInput id="password" autoComplete="new-password" invalid={signupForm.formState.errors.password} {...signupForm.register("password")} />
                </Field>
                <Field label="Confirm password" htmlFor="confirmPassword" error={signupForm.formState.errors.confirmPassword?.message}>
                  <PasswordInput id="confirmPassword" autoComplete="new-password" invalid={signupForm.formState.errors.confirmPassword} {...signupForm.register("confirmPassword")} />
                </Field>
                <Button type="submit" size="lg" loading={busy} disabled={cooldown > 0 || authLocked} className="w-full">
                  {cooldown > 60 ? `Try again in ${Math.ceil(cooldown / 60)} min` : "Send verification code"}
                </Button>
                <p className="text-center text-xs text-[#8a6a80]">
                  By continuing you agree to our <Link className="underline" to="/memories/terms">Terms</Link> and <Link className="underline" to="/memories/privacy">Privacy Policy</Link>.
                </p>
              </form>
            )}

            {/* LOG IN */}
            {step === "login" && (
              <form onSubmit={onLogin} className="space-y-4" noValidate>
                {googleEnabled && (<><GoogleButton text="signin_with" onCredential={onGoogleCredential} disabled={busy || authLocked} /><Divider /></>)}
                {isLocked && (
                  <div role="alert" className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
                    <p className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4 shrink-0" aria-hidden /> Account locked for your safety</p>
                    <p className="mt-1.5">Too many wrong passwords. It unlocks automatically in <span className="font-bold tabular-nums">{formatWait(lockLeft)}</span>.</p>
                    <p className="mt-1.5">In a hurry? <button type="button" className="font-semibold underline" onClick={goForgot}>Reset your password</button> with an email code.</p>
                  </div>
                )}
                <Field label="Email or mobile" htmlFor="identifier" error={loginForm.formState.errors.identifier?.message}>
                  <input id="identifier" autoComplete="username" className={inputClass(loginForm.formState.errors.identifier)} {...loginForm.register("identifier")} />
                </Field>
                <Field label="Password" htmlFor="login-password" error={loginForm.formState.errors.password?.message}>
                  <PasswordInput id="login-password" autoComplete="current-password" invalid={loginForm.formState.errors.password} {...loginForm.register("password")} />
                </Field>
                <div className="-mt-1 text-right"><button type="button" className={linkBtn} onClick={goForgot}>Forgot password?</button></div>
                <Button type="submit" size="lg" loading={busy} disabled={isLocked || authLocked} className="w-full">{isLocked ? `Locked · ${formatWait(lockLeft)}` : "Log in"}</Button>
              </form>
            )}

            {/* GOOGLE: ONE MORE DETAIL */}
            {step === "google-mobile" && googleSignup && (
              <form onSubmit={onGoogleMobile} className="space-y-5" noValidate>
                <p className="text-sm text-[#6b3a5a]">Signing up as <span className="font-semibold">{googleSignup.email}</span>. Add your mobile number to finish.</p>
                <Field label="Mobile number" htmlFor="g-mobile" error={mobileForm.formState.errors.mobile?.message}>
                  <PhoneInput id="g-mobile" autoFocus countryProps={mobileForm.register("countryCode")} mobileProps={mobileForm.register("mobile")} dial={mobileForm.watch("countryCode")} invalid={mobileForm.formState.errors.mobile} inputClass={inputClass} />
                </Field>
                <Button type="submit" size="lg" loading={busy} className="w-full">Create account</Button>
                <button type="button" className={cx(backBtn, "block w-full text-center")} onClick={() => { setGoogleSignup(null); setFormError(""); setStep("signup"); }}>Cancel</button>
              </form>
            )}

            {/* FORGOT PASSWORD: step 1 */}
            {step === "forgot" && (
              <form onSubmit={onForgot} className="space-y-5" noValidate>
                <div className="text-center">
                  <IconBadge icon={KeyRound} />
                  <h2 className="mt-4 text-xl font-semibold text-[#3a1530]">Forgot your password?</h2>
                  <p className="mt-1.5 text-sm text-[#7a5370]">Enter your account email and we&apos;ll send a 6-digit code to set a new one.</p>
                </div>
                <Field label="Email" htmlFor="forgot-email" error={forgotForm.formState.errors.email?.message}>
                  <input id="forgot-email" type="email" autoComplete="email" className={inputClass(forgotForm.formState.errors.email)} {...forgotForm.register("email")} />
                </Field>
                <Button type="submit" size="lg" loading={busy} disabled={cooldown > 0 || authLocked} className="w-full">
                  {cooldown > 0 ? waitLabel.replace("Resend", "Send again") : "Send reset code"}
                </Button>
                <button type="button" className={cx(backBtn, "mx-auto block")} onClick={() => { setStep("login"); setFormError(""); }}>← Back to log in</button>
              </form>
            )}

            {/* FORGOT PASSWORD: step 2 */}
            {step === "reset" && (
              <form onSubmit={onReset} className="space-y-5" noValidate>
                <div className="text-center">
                  <IconBadge icon={MailCheck} />
                  <h2 className="mt-4 text-xl font-semibold text-[#3a1530]">Set a new password</h2>
                  <p className="mt-1.5 text-sm text-[#7a5370]">If an account exists for <span className="font-semibold text-[#3a1530]">{pendingEmail}</span>, we sent it a 6-digit code. It&apos;s valid for 10 minutes.</p>
                </div>
                <OtpInput value={otp} onChange={setOtp} disabled={busy} />
                <Field label="New password" htmlFor="reset-password" error={resetForm.formState.errors.password?.message} hint="8+ characters with upper, lower, number and symbol.">
                  <PasswordInput id="reset-password" autoComplete="new-password" invalid={resetForm.formState.errors.password} {...resetForm.register("password")} />
                </Field>
                <Field label="Confirm new password" htmlFor="reset-confirm" error={resetForm.formState.errors.confirmPassword?.message}>
                  <PasswordInput id="reset-confirm" autoComplete="new-password" invalid={resetForm.formState.errors.confirmPassword} {...resetForm.register("confirmPassword")} />
                </Field>
                <Button type="submit" size="lg" loading={busy} disabled={otp.length !== 6 || authLocked} className="w-full">Change password</Button>
                <div className="flex items-center justify-between">
                  <button type="button" className={backBtn} onClick={() => { setStep("forgot"); setFormError(""); forgotForm.setValue("email", pendingEmail); }}>← Change email</button>
                  <button type="button" disabled={cooldown > 0 || busy || authLocked} onClick={resendReset} className={linkBtn}>{cooldown > 0 ? waitLabel : "Resend code"}</button>
                </div>
                <p className="text-center text-xs text-[#8a6a80]">Changing your password signs you out of every device and lifts any lock on your account.</p>
              </form>
            )}

            {/* OTP (signup or login) */}
            {isOtpStep && (
              <div className="space-y-6">
                <div className="text-center">
                  <IconBadge icon={MailCheck} />
                  <h2 className="mt-4 text-xl font-semibold text-[#3a1530]">Check your email</h2>
                  <p className="mt-1.5 text-sm text-[#7a5370]">We sent a 6-digit code to <span className="font-semibold text-[#3a1530]">{pendingEmail}</span></p>
                </div>
                <OtpInput value={otp} onChange={setOtp} disabled={busy} />
                <Button size="lg" loading={busy} disabled={otp.length !== 6 || authLocked} onClick={step === "verify" ? onVerifySignup : onVerifyLogin} className="w-full">
                  {step === "verify" ? "Verify & create account" : "Verify & log in"}
                </Button>
                <div className="flex items-center justify-between">
                  <button className={backBtn} onClick={() => { setStep(step === "verify" ? "signup" : "login"); setFormError(""); }}>← Change details</button>
                  <button disabled={cooldown > 0 || busy || authLocked} onClick={step === "verify" ? resend : resendLogin} className={linkBtn}>
                    {cooldown > 60 ? `Try again in ${Math.ceil(cooldown / 60)} min` : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
