import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, BookOpenText, Eye, EyeSlash, FileText, Handshake, Lock, ShieldCheck, UsersThree, Warning } from "@phosphor-icons/react";

import PhoneInput from "../utils/PhoneInput";
import { DEFAULT_DIAL, digitsOf, mobileProblem } from "../utils/countries";
import { login as loginAction } from "../Redux/authSlice";
import { tokenIsExpired } from "../lib/authSession";
import { API_ROOT, http, errMsg, errCode, retryAfterOf } from "../arena/api";
import GoogleButton, { googleEnabled } from "../arena/GoogleButton";
import { ALLOWED_ROLES, DEFAULT_AFTER_LOGIN, LOGIN_PATH, SIGNUP_PATH, redirectFromState, safeRedirect } from "./authRedirect";
import "./auth.css";

/*
  THE ONE LOGIN / SIGN-UP PAGE for Target Trek (/login and /signup). Admins, members, Prep Buddy, Resume Lab and Referrals all use it.
  (Memories keeps its own, separate sign-in.)

    sign up          Google, or name + email + mobile + password, then a 6-digit email code
    log in           Google, or email / mobile + password (a code only on a new device, when the server asks for it)
    forgot password  email, then a code and a new password

  `?redirect=/some/page` (or `state.from`, from older links) says where to go afterwards; it is checked by safeRedirect(),
  so only a page on this site is ever used. Without one, people land on the home page.
*/
const LOCK_CODES = ["SIGNUP_LOCKED", "RESET_LOCKED", "LOGIN_IP_LOCKED"];

const passwordRule = z.string().min(8, "At least 8 characters").regex(/[A-Z]/, "Add an uppercase letter").regex(/[a-z]/, "Add a lowercase letter").regex(/\d/, "Add a number").regex(/[^A-Za-z0-9]/, "Add a special character");
const mobileFields = (v, ctx) => {
  const p = mobileProblem(v.countryCode, v.mobile);
  if (p) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["mobile"], message: p });
};
const countryRule = z.string().default(DEFAULT_DIAL);
const mobileRule = z.string().trim().transform(digitsOf);
const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email"),
  countryCode: countryRule,
  mobile: mobileRule,
  password: passwordRule,
  confirmPassword: z.string(),
}).superRefine(mobileFields).refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
const mobileSchema = z.object({ countryCode: countryRule, mobile: mobileRule }).superRefine(mobileFields);
const loginSchema = z.object({ identifier: z.string().trim().min(1, "Enter your email or mobile"), password: z.string().min(1, "Enter your password") });
const forgotSchema = z.object({ email: z.string().trim().email("Enter a valid email") });
const resetSchema = z.object({ password: passwordRule, confirmPassword: z.string() }).refine((v) => v.password === v.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

const authApi = axios.create({ baseURL: `${API_ROOT}/api/auth`, withCredentials: true, timeout: 20000 });
const cx = (...a) => a.filter(Boolean).join(" ");
const inputClass = (bad) => cx("ta-input", bad && "bad");

function Field({ label, htmlFor, error, hint, required, children }) {
  return (
    <div className="ta-field">
      <label htmlFor={htmlFor} className="ta-label">{label}{required && <span className="ta-star" aria-hidden> *</span>}</label>
      {children}
      {error ? <p role="alert" className="ta-err"><Warning size={14} weight="fill" aria-hidden />{error}</p> : hint ? <p className="ta-hint">{hint}</p> : null}
    </div>
  );
}

function Button({ loading, children, className, disabled, type = "button", ...rest }) {
  return (
    <button type={type} className={cx("ta-btn", className)} disabled={disabled || loading} {...rest}>
      {loading && <span className="ta-spin" aria-hidden />}
      {children}
    </button>
  );
}

function OtpInput({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");
  return (
    <div className="ta-otp" role="group" aria-label="6 digit verification code">
      {digits.map((d, i) => (
        <input key={i} ref={(el) => (refs.current[i] = el)} value={d} disabled={disabled} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
          autoComplete={i === 0 ? "one-time-code" : "off"} aria-label={`Digit ${i + 1}`} className="ta-input ta-mono"
          onChange={(e) => { const c = e.target.value.replace(/\D/g, "").slice(-1); const n = digits.slice(); n[i] = c; onChange(n.join("")); if (c && i < 5) refs.current[i + 1]?.focus(); }}
          onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus(); }}
          onPaste={(e) => { const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6); if (!p) return; e.preventDefault(); onChange(p); refs.current[Math.min(p.length, 5)]?.focus(); }} />
      ))}
    </div>
  );
}

function useCountdown() {
  const [s, setS] = useState(0);
  useEffect(() => { if (s <= 0) return undefined; const t = setTimeout(() => setS((x) => x - 1), 1000); return () => clearTimeout(t); }, [s]);
  return [s, setS];
}
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
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
};

const PasswordInput = forwardRef(function PasswordInput({ id, invalid, ...rest }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="ta-pw">
      <input ref={ref} id={id} type={show ? "text" : "password"} className={inputClass(invalid)} style={{ paddingRight: 46 }} {...rest} />
      <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((x) => !x)}>{show ? <EyeSlash size={20} aria-hidden /> : <Eye size={20} aria-hidden />}</button>
    </div>
  );
});

const Or = () => <div className="ta-or" aria-hidden><span />or<span /></div>;

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const token = useSelector((s) => s.auth?.token);
  const user = useSelector((s) => s.auth?.user);

  const [step, setStep] = useState(params.get("mode") === "signup" || location.pathname === SIGNUP_PATH ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useCountdown();
  const [lockedUntil, setLockedUntil] = useState(0);
  const lockLeft = useRemaining(lockedUntil);
  const [authLock, setAuthLock] = useState(null);
  const authLockLeft = useRemaining(authLock?.until ?? 0);
  const [googleSignup, setGoogleSignup] = useState(null);

  // Where to go afterwards. Read once: the URL changes when the tab switches between /login and /signup, the target must not.
  const [redirectTo] = useState(() => safeRedirect(params.get("redirect")) || redirectFromState(location.state) || DEFAULT_AFTER_LOGIN);
  const keepRedirect = redirectTo !== DEFAULT_AFTER_LOGIN ? `?redirect=${encodeURIComponent(redirectTo)}` : "";

  // Already signed in (a live token and a user whose role the app accepts): nothing to do here.
  const signedIn = Boolean(token && !tokenIsExpired(token) && user && ALLOWED_ROLES.includes(user.role));
  useEffect(() => { if (signedIn) navigate(redirectTo, { replace: true }); }, [signedIn, navigate, redirectTo]);

  // The page is one screen with two tabs; keep the address in step so a refresh or a shared link opens the same tab.
  const switchTab = (next) => {
    setStep(next);
    setError("");
    navigate(`${next === "signup" ? SIGNUP_PATH : LOGIN_PATH}${keepRedirect}`, { replace: true, state: location.state });
  };

  // A session that ended (expired, revoked, blocked) explains itself here.
  useEffect(() => {
    let reason = null;
    try { reason = sessionStorage.getItem("authLogoutReason"); sessionStorage.removeItem("authLogoutReason"); } catch { /* ignore */ }
    if (!reason) return;
    toast.error(reason === "SESSION_REVOKED" ? "Your session has been revoked. Please sign in again." : reason === "ACCOUNT_BLOCKED" ? "Your account has been blocked." : "Your session has expired. Please sign in again.", { id: "auth-ended" });
  }, []);

  const finish = useCallback((data) => {
    if (!data?.token || !data?.user) throw new Error("Incomplete sign-in response");
    dispatch(loginAction({ token: data.token, user: data.user }));
    toast.success("You're signed in", { id: "signed-in" });
    // Partners land on their dashboard unless they were sent here from a specific page.
    navigate(data.user.role === "partner" && redirectTo === DEFAULT_AFTER_LOGIN ? "/partners/dashboard" : redirectTo, { replace: true });
  }, [dispatch, navigate, redirectTo]);

  const applyLock = (e) => {
    if (!LOCK_CODES.includes(errCode(e))) return false;
    const d = e.response?.data ?? {};
    setAuthLock({ until: d.lockedUntil ? new Date(d.lockedUntil).getTime() : Date.now() + (retryAfterOf(e) || 86400) * 1000, message: errMsg(e) });
    setError("");
    return true;
  };
  const fail = (e) => {
    if (["OTP_RATE_LIMIT", "OTP_COOLDOWN"].includes(errCode(e))) setCooldown(retryAfterOf(e));
    if (!applyLock(e)) setError(errMsg(e));
  };
  const go = (next) => { setStep(next); setError(""); };

  const signupForm = useForm({ resolver: zodResolver(signupSchema), mode: "onBlur", defaultValues: { countryCode: DEFAULT_DIAL } });
  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const forgotForm = useForm({ resolver: zodResolver(forgotSchema) });
  const resetForm = useForm({ resolver: zodResolver(resetSchema) });
  const mobileForm = useForm({ resolver: zodResolver(mobileSchema), defaultValues: { countryCode: DEFAULT_DIAL } });

  /* ---- Google (same account as email + password) ---- */
  const onGoogleCredential = async (credential) => {
    setBusy(true); setError("");
    try {
      const { data } = await http.post("/google", { credential });
      if (data.needsMobile) { setGoogleSignup({ signupToken: data.signupToken, email: data.email, name: data.name }); setStep("google-mobile"); return; }
      finish(data);
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const onGoogleMobile = mobileForm.handleSubmit(async (v) => {
    setBusy(true); setError("");
    try {
      const { data } = await http.post("/google/complete", { signupToken: googleSignup.signupToken, countryCode: v.countryCode, mobile: v.mobile });
      finish(data);
    } catch (e) {
      if (["SIGNUP_EXPIRED", "ACCOUNT_EXISTS", "SIGNUP_ALREADY_USED"].includes(errCode(e))) { setGoogleSignup(null); setStep("login"); }
      fail(e);
    } finally { setBusy(false); }
  });

  /* ---- sign up: details, then the email code ---- */
  const onSignup = signupForm.handleSubmit(async (v) => {
    setBusy(true); setError("");
    try {
      const { data } = await http.post("/signup", v);
      setEmail(v.email.toLowerCase()); setCooldown(data.resendInSeconds ?? 60); setOtp(""); setStep("verify");
    } catch (e) {
      if (errCode(e) === "ACCOUNT_EXISTS") { loginForm.setValue("identifier", v.email); setStep("login"); }
      fail(e);
    } finally { setBusy(false); }
  });
  const onVerifySignup = async () => {
    if (otp.length !== 6) return setError("Enter the 6 digit code");
    setBusy(true); setError("");
    try { const { data } = await http.post("/signup/verify", { email, otp }); finish(data); }
    catch (e) { fail(e); if (["SIGNUP_EXPIRED", "OTP_ATTEMPTS"].includes(errCode(e))) setStep("signup"); }
    finally { setBusy(false); }
  };

  /* ---- log in ---- */
  const onLogin = loginForm.handleSubmit(async (v) => {
    setBusy(true); setError("");
    try {
      const identifier = v.identifier.includes("@") ? v.identifier.toLowerCase() : v.identifier;
      const { data } = await authApi.post("/login", { identifier, password: v.password });
      if (data.requiresOtp === false) return finish(data);
      setChallengeId(data.challengeId); setEmail(identifier); setOtp(""); setCooldown(60); setStep("login-otp");
    } catch (e) {
      if (errCode(e) === "ACCOUNT_LOCKED") {
        setLockedUntil(e.response?.data?.lockedUntil ? new Date(e.response.data.lockedUntil).getTime() : Date.now() + retryAfterOf(e) * 1000);
        setError("");
      } else fail(e);
    } finally { setBusy(false); }
  });
  const onVerifyLogin = async () => {
    if (otp.length !== 6) return setError("Enter the 6 digit code");
    setBusy(true); setError("");
    try { const { data } = await authApi.post("/verify-otp", { challengeId, otp, rememberDevice: true }); finish(data); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };

  /* ---- forgot password: email, then code + new password ---- */
  const sendResetCode = async (addr) => {
    setBusy(true); setError("");
    try {
      const { data } = await http.post("/password/forgot", { email: addr });
      setEmail(addr); setCooldown(data.resendInSeconds ?? 60); setOtp(""); resetForm.reset(); setStep("reset");
      return true;
    } catch (e) {
      // a code was sent a moment ago: carry on and type it in
      if (errCode(e) === "OTP_COOLDOWN") { setEmail(addr); setOtp(""); setStep("reset"); }
      fail(e);
      return false;
    } finally { setBusy(false); }
  };
  const onForgot = forgotForm.handleSubmit((v) => sendResetCode(v.email.toLowerCase()));
  const onReset = resetForm.handleSubmit(async (v) => {
    if (otp.length !== 6) return setError("Enter the 6 digit code from your email");
    setBusy(true); setError("");
    try {
      await http.post("/password/reset", { email, otp, ...v });
      toast.success("Password changed. Log in with your new password.", { id: "pw-reset" });
      loginForm.reset({ identifier: email, password: "" }); setLockedUntil(0); setOtp(""); setStep("login");
    } catch (e) { fail(e); if (errCode(e) === "OTP_ATTEMPTS") setStep("forgot"); } finally { setBusy(false); }
  });

  const resend = async () => {
    if (step === "reset") { if (await sendResetCode(email)) toast.success("New code sent", { id: "otp-sent" }); return; }
    setBusy(true); setError("");
    try {
      if (step === "verify") { const { data } = await http.post("/signup/resend", { email }); setCooldown(data.resendInSeconds ?? 60); }
      else { await authApi.post("/resend-otp", { challengeId }); setCooldown(60); }
      setOtp(""); toast.success("New code sent", { id: "otp-sent" });
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const se = signupForm.formState.errors, le = loginForm.formState.errors, fe = forgotForm.formState.errors, re = resetForm.formState.errors, me = mobileForm.formState.errors;
  const showTabs = step === "signup" || step === "login";
  const inOtp = step === "verify" || step === "login-otp";
  const waitLabel = cooldown > 60 ? `Try again in ${Math.ceil(cooldown / 60)} min` : `Resend in ${cooldown}s`;
  const locked = authLockLeft > 0;
  const accountLocked = lockLeft > 0;
  const resendLine = cooldown > 0 ? waitLabel : <button type="button" onClick={resend} className="ta-link" disabled={busy}>Send a new code</button>;

  return (
    <div className="ta">
      <Helmet>
        <title>{step === "signup" ? "Create your account" : "Log in"} | Target Trek</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <main className="ta-wrap">
        {/* brand side: large screens */}
        <aside className="ta-aside">
          <div className="ta-aside-in">
            <Link to="/" className="ta-brand">Target Trek</Link>
            <h2 className="ta-aside-h">From the first page to the first offer.</h2>
            <ul className="ta-list">
              {[
                [BookOpenText, "Engineering Books", "Interview handbooks on system design, cloud, SQL and GenAI."],
                [FileText, "Resume Lab", "An AI report plus a working professional's notes on your resume and LinkedIn."],
                [Handshake, "Referrals", "Ask people inside top companies to refer you."],
                [UsersThree, "Prep Buddy", "Get matched with a partner and practise interviews together."],
              ].map(([Icon, t, d]) => (
                <li key={t}><span className="ta-ico"><Icon size={20} weight="duotone" aria-hidden /></span><div><b>{t}</b><p>{d}</p></div></li>
              ))}
            </ul>
            <p className="ta-fine"><Lock size={14} weight="bold" aria-hidden />Your details stay private and are never sold.</p>
          </div>
        </aside>

        {/* form side */}
        <section className="ta-main">
          <div className="ta-card">
            <Link to="/" className="ta-back"><ArrowLeft size={14} weight="bold" aria-hidden />Back to Target Trek</Link>

            {showTabs && (
              <div className="ta-seg" role="tablist" aria-label="Sign up or log in">
                <button type="button" role="tab" aria-selected={step === "signup"} onClick={() => switchTab("signup")}>Create account</button>
                <button type="button" role="tab" aria-selected={step === "login"} onClick={() => switchTab("login")}>Log in</button>
              </div>
            )}

            {locked && (
              <div role="alert" className="ta-lock">
                <p><Warning size={16} weight="fill" aria-hidden /> <b>Temporarily locked for your security</b></p>
                <p>{authLock.message.replace(/\s*(It unlocks|Please try again)[^.]*\.?$/i, "").trim()}</p>
                <p>Unlocks automatically in <b className="ta-mono">{formatWait(authLockLeft)}</b>. If this is a mistake, write to supporttargettrek@gmail.com.</p>
              </div>
            )}
            {accountLocked && <div role="alert" className="ta-lock"><p><Warning size={16} weight="fill" aria-hidden /> <b>Account locked after too many wrong passwords</b></p><p>Try again in <b className="ta-mono">{formatWait(lockLeft)}</b>, or reset your password with an email code.</p></div>}
            {error && <p role="alert" className="ta-errbox">{error}</p>}

            {step === "signup" && (
              <form onSubmit={onSignup} noValidate className="ta-form">
                <h1 className="ta-title">Create your account</h1>
                {googleEnabled && <><GoogleButton text="signup_with" onCredential={onGoogleCredential} disabled={busy || locked} /><Or /></>}
                <div className="ta-pair">
                  <Field required label="Full name" htmlFor="ta-name" error={se.name?.message}><input id="ta-name" autoComplete="name" className={inputClass(se.name)} {...signupForm.register("name")} /></Field>
                  <Field required label="Email" htmlFor="ta-email" error={se.email?.message} hint="We'll send a code here."><input id="ta-email" type="email" autoComplete="email" className={inputClass(se.email)} {...signupForm.register("email")} /></Field>
                </div>
                <Field required label="Mobile" htmlFor="ta-mobile" error={se.mobile?.message} hint="Needed for secure payments. We never spam.">
                  <PhoneInput id="ta-mobile" dial={signupForm.watch("countryCode")} invalid={Boolean(se.mobile)} inputClass={inputClass} countryProps={signupForm.register("countryCode")} mobileProps={signupForm.register("mobile")} />
                </Field>
                <div className="ta-pair">
                  <Field required label="Password" htmlFor="ta-pw" error={se.password?.message} hint="8+ chars, upper, lower, number, symbol."><PasswordInput id="ta-pw" autoComplete="new-password" invalid={se.password} {...signupForm.register("password")} /></Field>
                  <Field required label="Confirm password" htmlFor="ta-pw2" error={se.confirmPassword?.message}><PasswordInput id="ta-pw2" autoComplete="new-password" invalid={se.confirmPassword} {...signupForm.register("confirmPassword")} /></Field>
                </div>
                <Button type="submit" loading={busy} disabled={locked}>Send me a code</Button>
                <p className="ta-sm">Already have an account? <button type="button" className="ta-link" onClick={() => switchTab("login")}>Log in</button></p>
                <p className="ta-hint ta-center">By continuing you confirm you are 18 or older and agree to the <Link to="/terms-of-service">Terms</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.</p>
              </form>
            )}

            {step === "login" && (
              <form onSubmit={onLogin} noValidate className="ta-form">
                <div><h1 className="ta-title">Welcome back</h1><p className="ta-sub">Log in to continue where you left off.</p></div>
                {googleEnabled && <><GoogleButton text="signin_with" onCredential={onGoogleCredential} disabled={busy || locked} /><Or /></>}
                <Field label="Email or mobile" htmlFor="ta-id" error={le.identifier?.message}><input id="ta-id" autoComplete="username" className={inputClass(le.identifier)} {...loginForm.register("identifier")} /></Field>
                <Field label="Password" htmlFor="ta-lpw" error={le.password?.message}><PasswordInput id="ta-lpw" autoComplete="current-password" invalid={le.password} {...loginForm.register("password")} /></Field>
                <div className="ta-right">
                  <button type="button" className="ta-link" onClick={() => { const id = loginForm.getValues("identifier") || ""; forgotForm.setValue("email", id.includes("@") ? id : ""); go("forgot"); }}>Forgot password?</button>
                </div>
                <Button type="submit" loading={busy} disabled={locked || accountLocked}>Log in</Button>
                <p className="ta-sm">New here? <button type="button" className="ta-link" onClick={() => switchTab("signup")}>Create an account</button></p>
              </form>
            )}

            {step === "google-mobile" && googleSignup && (
              <form onSubmit={onGoogleMobile} noValidate className="ta-form">
                <div><h1 className="ta-title">One last step</h1><p className="ta-sub">Welcome{googleSignup.name ? `, ${googleSignup.name.split(" ")[0]}` : ""}. Add your mobile number to finish creating your account for <b>{googleSignup.email}</b>.</p></div>
                <Field required label="Mobile" htmlFor="ta-gmobile" error={me.mobile?.message} hint="Needed for secure payments. We never spam.">
                  <PhoneInput id="ta-gmobile" dial={mobileForm.watch("countryCode")} invalid={Boolean(me.mobile)} inputClass={inputClass} countryProps={mobileForm.register("countryCode")} mobileProps={mobileForm.register("mobile")} />
                </Field>
                <Button type="submit" loading={busy}>Create my account</Button>
                <button type="button" className="ta-link ta-center" onClick={() => { setGoogleSignup(null); go("signup"); }}>Use a different account</button>
              </form>
            )}

            {inOtp && (
              <div className="ta-form">
                <button type="button" onClick={() => go(step === "verify" ? "signup" : "login")} className="ta-link ta-start"><ArrowLeft size={14} weight="bold" aria-hidden /> Back</button>
                <div><h1 className="ta-title">Check your email</h1><p className="ta-sub">We sent a 6 digit code to <b>{email}</b>.</p></div>
                <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} disabled={busy} />
                <Button loading={busy} onClick={step === "verify" ? onVerifySignup : onVerifyLogin}>Verify and continue</Button>
                <p className="ta-hint ta-center">{resendLine}</p>
              </div>
            )}

            {step === "forgot" && (
              <form onSubmit={onForgot} noValidate className="ta-form">
                <button type="button" onClick={() => go("login")} className="ta-link ta-start"><ArrowLeft size={14} weight="bold" aria-hidden /> Back to log in</button>
                <div><h1 className="ta-title">Reset your password</h1><p className="ta-sub">Enter your account email. We'll send a 6 digit code to choose a new password.</p></div>
                <Field label="Email" htmlFor="ta-femail" error={fe.email?.message}><input id="ta-femail" type="email" autoComplete="email" className={inputClass(fe.email)} {...forgotForm.register("email")} /></Field>
                <Button type="submit" loading={busy} disabled={locked || cooldown > 0}>{cooldown > 0 ? waitLabel : "Send me a code"}</Button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={onReset} noValidate className="ta-form">
                <button type="button" onClick={() => go("forgot")} className="ta-link ta-start"><ArrowLeft size={14} weight="bold" aria-hidden /> Back</button>
                <div><h1 className="ta-title">Choose a new password</h1><p className="ta-sub">Enter the 6 digit code we sent to <b>{email}</b>, then your new password.</p></div>
                <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} disabled={busy} />
                <Field required label="New password" htmlFor="ta-npw" error={re.password?.message} hint="8+ characters with upper, lower, number and symbol."><PasswordInput id="ta-npw" autoComplete="new-password" invalid={re.password} {...resetForm.register("password")} /></Field>
                <Field required label="Confirm new password" htmlFor="ta-npw2" error={re.confirmPassword?.message}><PasswordInput id="ta-npw2" autoComplete="new-password" invalid={re.confirmPassword} {...resetForm.register("confirmPassword")} /></Field>
                <Button type="submit" loading={busy}>Change password</Button>
                <p className="ta-hint ta-center">{resendLine}</p>
              </form>
            )}

            <p className="ta-trust"><ShieldCheck size={15} weight="bold" aria-hidden /><span>Secured by Target Trek</span></p>
          </div>
        </section>
      </main>
    </div>
  );
}
