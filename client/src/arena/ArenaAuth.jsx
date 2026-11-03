import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff, MailCheck, ShieldCheck, Users, Lock, KeyRound, ShieldAlert } from "lucide-react";

import { login as loginAction } from "../Redux/authSlice";
import { API_ROOT, http, errMsg, errCode, retryAfterOf } from "./api";
import { Button, Field, inputClass, cx } from "./ui";
import { useArenaChrome } from "./chrome";

const LOCK_CODES = ["SIGNUP_LOCKED", "RESET_LOCKED", "LOGIN_IP_LOCKED"];

const passwordRule = z
  .string()
  .min(8, "At least 8 characters")
  .regex(/[A-Z]/, "Add an uppercase letter")
  .regex(/[a-z]/, "Add a lowercase letter")
  .regex(/\d/, "Add a number")
  .regex(/[^A-Za-z0-9]/, "Add a special character");

const signupSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name"),
    email: z.string().trim().email("Enter a valid email"),
    mobile: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

const forgotSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

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
          className="h-14 w-full min-w-0 rounded-xl border border-stone-300 dk:border-[#5a4336] bg-white dk:bg-[#241b15] text-center text-xl font-semibold text-[#29201b] dk:text-[#fff7ed] focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dk:focus:ring-orange-500/20"
          onChange={(e) => {
            const char = e.target.value.replace(/\D/g, "").slice(-1);
            setAt(i, char);
            if (char && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digit && i > 0) refs.current[i - 1]?.focus();
          }}
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

// forwardRef: react-hook-form's register() hands us a ref to attach.
const PasswordInput = forwardRef(function PasswordInput({ id, invalid, ...rest }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} id={id} type={show ? "text" : "password"} className={cx(inputClass(invalid), "pr-11")} {...rest} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-stone-400 dk:text-[#8f7c70] hover:text-stone-600 dk:hover:text-[#d6c4b8]"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
});

/* --------------------------------- page --------------------------------- */
export default function ArenaAuth() {
  useArenaChrome();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const token = useSelector((s) => s.auth.token);

  const [step, setStep] = useState(params.get("mode") === "login" ? "login" : "signup");
  const [pendingEmail, setPendingEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [cooldown, setCooldown] = useCountdown(0);
  // Set when the server says the account is locked (5 wrong passwords). Lifts by itself.
  const [lockedUntil, setLockedUntil] = useState(0);
  const lockLeft = useRemaining(lockedUntil);
  const isLocked = lockLeft > 0;
  // 24-hour locks from too many wrong codes / resends (sign-up, password reset) or failed logins from this network.
  const [authLock, setAuthLock] = useState(null); // { until, message }
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

  const from = location.state?.from;
  const savedReturn = (() => {
    try { return sessionStorage.getItem("arena:returnTo"); } catch { return null; }
  })();
  const safeReturn = savedReturn && savedReturn.startsWith("/prep-buddy/") ? savedReturn : null;
  const redirectTo = from ? `${from.pathname}${from.search || ""}` : safeReturn || "/prep-buddy/app";

  useEffect(() => {
    if (token) navigate(redirectTo, { replace: true });
  }, [token, navigate, redirectTo]);

  const finish = useCallback(
    (data) => {
      if (!data?.token || !data?.user) throw new Error("Incomplete sign-in response");
      dispatch(loginAction({ token: data.token, user: data.user }));
      try { sessionStorage.removeItem("arena:returnTo"); } catch { /* ignore */ }
      toast.success("You're signed in", { id: "arena-signed-in" });
      navigate(redirectTo, { replace: true });
    },
    [dispatch, navigate, redirectTo]
  );

  const signupForm = useForm({ resolver: zodResolver(signupSchema), mode: "onBlur" });
  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const forgotForm = useForm({ resolver: zodResolver(forgotSchema) });
  const resetForm = useForm({ resolver: zodResolver(resetSchema) });

  /* ---- signup → send OTP ---- */
  const onSignup = signupForm.handleSubmit(async (values) => {
    setBusy(true);
    setFormError("");
    try {
      const { data } = await http.post("/signup", values);
      setPendingEmail(values.email.toLowerCase());
      setCooldown(data.resendInSeconds ?? 60);
      setOtp("");
      setStep("verify");
    } catch (error) {
      if (errCode(error) === "ACCOUNT_EXISTS") {
        loginForm.setValue("identifier", values.email);
        setStep("login");
      }
      // OTP limit hit (5 codes / 24 h) or 60 s cooldown: show the wait and lock the button.
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
      const { data } = await http.post("/signup/resend", { email: pendingEmail });
      setCooldown(data.resendInSeconds ?? 60);
      setOtp("");
      toast.success("New code sent", { id: "arena-otp-sent" });
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
        const until = error.response.data.lockedUntil
          ? new Date(error.response.data.lockedUntil).getTime()
          : Date.now() + retryAfterOf(error) * 1000;
        setLockedUntil(until);
        setFormError("");
      } else {
        if (!applyLock(error)) setFormError(errMsg(error));
      }
    } finally {
      setBusy(false);
    }
  });

  /* ---- forgot password: email → code → new password ---- */
  const sendResetCode = async (email) => {
    setBusy(true);
    setFormError("");
    try {
      const { data } = await http.post("/password/forgot", { email });
      setPendingEmail(email);
      setCooldown(data.resendInSeconds ?? 60);
      setOtp("");
      resetForm.reset();
      setStep("reset");
      return true;
    } catch (error) {
      const code = errCode(error);
      if (["OTP_RATE_LIMIT", "OTP_COOLDOWN"].includes(code)) setCooldown(retryAfterOf(error));
      // A code was sent a moment ago: let them carry on and type it in.
      if (code === "OTP_COOLDOWN") {
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

  const resendReset = async () => {
    if (await sendResetCode(pendingEmail)) toast.success("New code sent", { id: "arena-otp-sent" });
  };

  const onReset = resetForm.handleSubmit(async (values) => {
    if (otp.length !== 6) return setFormError("Enter the 6-digit code from your email");
    setBusy(true);
    setFormError("");
    try {
      await http.post("/password/reset", { email: pendingEmail, otp, ...values });
      toast.success("Password changed. Log in with your new password.", { id: "arena-pw-reset" });
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

  const isOtpStep = step === "verify" || step === "login-otp";
  const showTabs = step === "signup" || step === "login";
  const waitLabel = cooldown > 60 ? `Try again in ${Math.ceil(cooldown / 60)} min` : `Resend in ${cooldown}s`;

  return (
    <main className="min-h-screen-safe bg-[#fff8f2] dk:bg-[#15110e] pt-[calc(var(--arena-nav-h,5rem)+0.5rem)]">
      <Helmet>
        <title>Sign up – Prep Buddy Arena | Target Trek</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16">
        {/* Brand panel */}
        <aside className="hidden flex-col justify-center lg:flex">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600 dk:text-orange-400">Prep Buddy Arena</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-[#29201b] dk:text-[#fff7ed]">
            Prepare with someone
            <br />
            who's just as serious.
          </h1>
          <ul className="mt-8 space-y-5">
            {[
              [Users, "Real people, matched by you", "Browse anonymous profiles and pick the buddy who fits your goals."],
              [ShieldCheck, "Your identity stays private", "Your name is hidden until you both accept. You decide what else to share."],
              [Lock, "Verified emails only", "Every member confirms their email, so the arena stays genuine."],
            ].map(([Icon, title, text]) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-100 dk:bg-orange-500/15 text-orange-700 dk:text-orange-300">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{title}</p>
                  <p className="mt-0.5 text-sm text-stone-600 dk:text-[#d6c4b8]">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Form card */}
        <section className="mx-auto w-full max-w-md">
          <Link to="/prep-buddy" className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone-500 dk:text-[#b9a79c] hover:text-stone-800 dk:hover:text-[#ffedd5]">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Prep Buddy
          </Link>

          <div className="rounded-3xl border border-[#f0ded0] dk:border-[#443127] bg-white dk:bg-[#241b15] p-6 shadow-xl shadow-orange-900/60 dk:shadow-black/40 sm:p-8">
            {showTabs && (
              <div className="mb-6 grid grid-cols-2 rounded-xl bg-stone-100 dk:bg-[#2c211b] p-1 text-sm font-semibold" role="tablist">
                {[["signup", "Create account"], ["login", "Log in"]].map(([key, label]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={step === key}
                    onClick={() => { setStep(key); setFormError(""); }}
                    className={cx("rounded-lg py-2 transition", step === key ? "bg-white dk:bg-[#241b15] text-[#29201b] dk:text-[#fff7ed] shadow-sm" : "text-stone-500 dk:text-[#b9a79c] hover:text-stone-800 dk:hover:text-[#ffedd5]")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {authLocked && (
              <div role="alert" className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200 dk:bg-amber-500/10 dk:text-amber-200 dk:ring-amber-500/25">
                <p className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4 shrink-0" aria-hidden /> Temporarily locked for your security</p>
                <p className="mt-1.5">{authLock.message.replace(/\s*(It unlocks|Please try again)[^.]*\.?$/i, "").trim()}</p>
                <p className="mt-1.5">Unlocks automatically in <span className="font-bold tabular-nums">{formatWait(authLockLeft)}</span>. If this is a mistake, contact support and we can unlock it.</p>
              </div>
            )}

            {formError && (
              <div role="alert" className="mb-5 rounded-xl bg-rose-50 dk:bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dk:text-rose-300 ring-1 ring-rose-100 dk:ring-rose-500/20">
                {formError}
              </div>
            )}

            {/* SIGN UP */}
            {step === "signup" && (
              <form onSubmit={onSignup} className="space-y-4" noValidate>
                <Field label="Full name" htmlFor="name" error={signupForm.formState.errors.name?.message} hint="Kept private. Others see an anonymous ID.">
                  <input id="name" autoComplete="name" className={inputClass(signupForm.formState.errors.name)} {...signupForm.register("name")} />
                </Field>
                <Field label="Email" htmlFor="email" error={signupForm.formState.errors.email?.message} hint="We'll send a verification code here.">
                  <input id="email" type="email" autoComplete="email" className={inputClass(signupForm.formState.errors.email)} {...signupForm.register("email")} />
                </Field>
                <Field label="Mobile number" htmlFor="mobile" error={signupForm.formState.errors.mobile?.message}>
                  <input id="mobile" inputMode="numeric" maxLength={10} autoComplete="tel-national" className={inputClass(signupForm.formState.errors.mobile)} {...signupForm.register("mobile")} />
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
                <p className="text-center text-xs text-stone-500 dk:text-[#b9a79c]">
                  By continuing you agree to our <Link className="underline" to="/terms-of-service">Terms</Link> and <Link className="underline" to="/privacy-policy">Privacy Policy</Link>.
                </p>
              </form>
            )}

            {/* LOG IN */}
            {step === "login" && (
              <form onSubmit={onLogin} className="space-y-4" noValidate>
                {isLocked && (
                  <div role="alert" className="rounded-xl bg-amber-50 dk:bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dk:text-amber-200 ring-1 ring-amber-200 dk:ring-amber-500/20">
                    <p className="flex items-center gap-2 font-semibold"><ShieldAlert className="h-4 w-4 shrink-0" aria-hidden /> Account locked for your safety</p>
                    <p className="mt-1.5">Too many wrong passwords. It unlocks automatically in <span className="font-bold tabular-nums">{formatWait(lockLeft)}</span>.</p>
                    <p className="mt-1.5">In a hurry? <button type="button" className="font-semibold underline" onClick={() => { forgotForm.setValue("email", loginForm.getValues("identifier").includes("@") ? loginForm.getValues("identifier") : ""); setFormError(""); setStep("forgot"); }}>Reset your password</button> with an email code.</p>
                  </div>
                )}
                <Field label="Email or mobile" htmlFor="identifier" error={loginForm.formState.errors.identifier?.message}>
                  <input id="identifier" autoComplete="username" className={inputClass(loginForm.formState.errors.identifier)} {...loginForm.register("identifier")} />
                </Field>
                <Field label="Password" htmlFor="login-password" error={loginForm.formState.errors.password?.message}>
                  <PasswordInput id="login-password" autoComplete="current-password" invalid={loginForm.formState.errors.password} {...loginForm.register("password")} />
                </Field>
                <div className="-mt-1 text-right">
                  <button
                    type="button"
                    className="text-sm font-semibold text-orange-600 dk:text-orange-400 hover:underline"
                    onClick={() => {
                      const id = loginForm.getValues("identifier") || "";
                      forgotForm.setValue("email", id.includes("@") ? id : "");
                      setFormError("");
                      setStep("forgot");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" size="lg" loading={busy} disabled={isLocked || authLocked} className="w-full">{isLocked ? `Locked · ${formatWait(lockLeft)}` : "Log in"}</Button>
              </form>
            )}

            {/* FORGOT PASSWORD: step 1, ask for the email */}
            {step === "forgot" && (
              <form onSubmit={onForgot} className="space-y-5" noValidate>
                <div className="text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 dk:bg-orange-500/15 text-orange-700 dk:text-orange-300">
                    <KeyRound className="h-7 w-7" aria-hidden />
                  </span>
                  <h2 className="mt-4 text-xl font-semibold text-[#29201b] dk:text-[#fff7ed]">Forgot your password?</h2>
                  <p className="mt-1.5 text-sm text-stone-600 dk:text-[#d6c4b8]">Enter your account email and we&apos;ll send a 6-digit code to set a new one.</p>
                </div>
                <Field label="Email" htmlFor="forgot-email" error={forgotForm.formState.errors.email?.message}>
                  <input id="forgot-email" type="email" autoComplete="email" className={inputClass(forgotForm.formState.errors.email)} {...forgotForm.register("email")} />
                </Field>
                <Button type="submit" size="lg" loading={busy} disabled={cooldown > 0 || authLocked} className="w-full">
                  {cooldown > 0 ? waitLabel.replace("Resend", "Send again") : "Send reset code"}
                </Button>
                <button type="button" className="mx-auto block text-sm text-stone-500 dk:text-[#b9a79c] hover:text-stone-800 dk:hover:text-[#ffedd5]" onClick={() => { setStep("login"); setFormError(""); }}>
                  ← Back to log in
                </button>
              </form>
            )}

            {/* FORGOT PASSWORD: step 2, code + new password */}
            {step === "reset" && (
              <form onSubmit={onReset} className="space-y-5" noValidate>
                <div className="text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 dk:bg-orange-500/15 text-orange-700 dk:text-orange-300">
                    <MailCheck className="h-7 w-7" aria-hidden />
                  </span>
                  <h2 className="mt-4 text-xl font-semibold text-[#29201b] dk:text-[#fff7ed]">Set a new password</h2>
                  <p className="mt-1.5 text-sm text-stone-600 dk:text-[#d6c4b8]">
                    If an account exists for <span className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{pendingEmail}</span>, we sent it a 6-digit code. It&apos;s valid for 10 minutes.
                  </p>
                </div>

                <OtpInput value={otp} onChange={setOtp} disabled={busy} />

                <Field label="New password" htmlFor="reset-password" error={resetForm.formState.errors.password?.message} hint="8+ characters with upper, lower, number and symbol.">
                  <PasswordInput id="reset-password" autoComplete="new-password" invalid={resetForm.formState.errors.password} {...resetForm.register("password")} />
                </Field>
                <Field label="Confirm new password" htmlFor="reset-confirm" error={resetForm.formState.errors.confirmPassword?.message}>
                  <PasswordInput id="reset-confirm" autoComplete="new-password" invalid={resetForm.formState.errors.confirmPassword} {...resetForm.register("confirmPassword")} />
                </Field>

                <Button type="submit" size="lg" loading={busy} disabled={otp.length !== 6 || authLocked} className="w-full">Change password</Button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" className="text-stone-500 dk:text-[#b9a79c] hover:text-stone-800 dk:hover:text-[#ffedd5]" onClick={() => { setStep("forgot"); setFormError(""); forgotForm.setValue("email", pendingEmail); }}>
                    ← Change email
                  </button>
                  <button
                    type="button"
                    disabled={cooldown > 0 || busy || authLocked}
                    onClick={resendReset}
                    className="font-semibold text-orange-600 dk:text-orange-400 disabled:cursor-not-allowed disabled:text-stone-400 dk:disabled:text-[#8f7c70]"
                  >
                    {cooldown > 0 ? waitLabel : "Resend code"}
                  </button>
                </div>
                <p className="text-center text-xs text-stone-500 dk:text-[#b9a79c]">Changing your password signs you out of every device and lifts any lock on your account.</p>
              </form>
            )}

            {/* OTP (signup or login) */}
            {isOtpStep && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-orange-100 dk:bg-orange-500/15 text-orange-700 dk:text-orange-300">
                    <MailCheck className="h-7 w-7" aria-hidden />
                  </span>
                  <h2 className="mt-4 text-xl font-semibold text-[#29201b] dk:text-[#fff7ed]">Check your email</h2>
                  <p className="mt-1.5 text-sm text-stone-600 dk:text-[#d6c4b8]">
                    We sent a 6-digit code to <span className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{pendingEmail}</span>
                  </p>
                </div>

                <OtpInput value={otp} onChange={setOtp} disabled={busy} />

                <Button size="lg" loading={busy} disabled={otp.length !== 6 || authLocked} onClick={step === "verify" ? onVerifySignup : onVerifyLogin} className="w-full">
                  {step === "verify" ? "Verify & create account" : "Verify & log in"}
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button className="text-stone-500 dk:text-[#b9a79c] hover:text-stone-800 dk:hover:text-[#ffedd5]" onClick={() => { setStep(step === "verify" ? "signup" : "login"); setFormError(""); }}>
                    ← Change details
                  </button>
                  <button
                    disabled={cooldown > 0 || busy || authLocked}
                    onClick={step === "verify" ? resend : resendLogin}
                    className="font-semibold text-orange-600 dk:text-orange-400 disabled:cursor-not-allowed disabled:text-stone-400 dk:disabled:text-[#8f7c70]"
                  >
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
