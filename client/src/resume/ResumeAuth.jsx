import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, Brain, Eye, EyeSlash, LinkedinLogo, Lock, ShieldCheck, UserCircle, Warning } from "@phosphor-icons/react";

import PhoneInput from "../utils/PhoneInput";
import { DEFAULT_DIAL, digitsOf, mobileProblem } from "../utils/countries";
import { login as loginAction } from "../Redux/authSlice";
import { API_ROOT, http, errMsg, errCode, retryAfterOf } from "../arena/api";
import GoogleButton, { googleEnabled } from "../arena/GoogleButton";
import { Btn, Field, Page, cx } from "./ui";

/*
  Resume Lab sign up / log in: the same flow and the same server endpoints as Prep Buddy Arena, so one Target Trek account works everywhere.
    sign up        Google, or name + email + mobile + password, then a 6-digit email code
    log in         Google, or email / mobile + password (a code only on a new device, when the server asks for it)
    forgot password  email, then a code and a new password
  Every code email is sent in the Resume Lab look (`source: "resume"`).
*/
const RETURN_KEY = "resume:returnTo";
const SOURCE = "resume";
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
const inputClass = (bad) => cx("rv-input", bad && "bad");

function OtpInput({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || "");
  return (
    <div className="rv-otp" role="group" aria-label="6 digit verification code">
      {digits.map((d, i) => (
        <input key={i} ref={(el) => (refs.current[i] = el)} value={d} disabled={disabled} type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
          autoComplete={i === 0 ? "one-time-code" : "off"} aria-label={`Digit ${i + 1}`} className="rv-input rv-mono"
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
    <div style={{ position: "relative" }}>
      <input ref={ref} id={id} type={show ? "text" : "password"} className={inputClass(invalid)} style={{ paddingRight: 46 }} {...rest} />
      <button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((x) => !x)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: 0, padding: 4, color: "var(--rv-muted)" }}>{show ? <EyeSlash size={20} aria-hidden /> : <Eye size={20} aria-hidden />}</button>
    </div>
  );
});

const Or = () => <div className="rv-or" aria-hidden><span />or<span /></div>;

export default function ResumeAuth() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [params] = useSearchParams();
  const token = useSelector((s) => s.auth?.token);

  const [step, setStep] = useState(params.get("mode") === "signup" || location.pathname.endsWith("/signup") ? "signup" : "login");
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

  const from = location.state?.from;
  const safe = (p) => (p && /^\/resume-review(\/|$|\?)/.test(p) && !p.startsWith("//") ? p : null);
  let saved = null;
  try { saved = sessionStorage.getItem(RETURN_KEY); } catch { /* ignore */ }
  const redirectTo = safe(from ? `${from.pathname}${from.search || ""}` : null) || safe(saved) || "/resume-review/app";

  useEffect(() => { if (token) navigate(redirectTo, { replace: true }); }, [token, navigate, redirectTo]);

  const finish = useCallback((data) => {
    if (!data?.token || !data?.user) throw new Error("Incomplete sign-in response");
    dispatch(loginAction({ token: data.token, user: data.user }));
    try { sessionStorage.removeItem(RETURN_KEY); } catch { /* ignore */ }
    toast.success("You're signed in", { id: "resume-signed-in" });
    navigate(redirectTo, { replace: true });
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
      const { data } = await http.post("/signup", { ...v, source: SOURCE });
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
      const { data } = await authApi.post("/login", { identifier, password: v.password, source: SOURCE });
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
      const { data } = await http.post("/password/forgot", { email: addr, source: SOURCE });
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
      toast.success("Password changed. Log in with your new password.", { id: "resume-pw-reset" });
      loginForm.reset({ identifier: email, password: "" }); setLockedUntil(0); setOtp(""); setStep("login");
    } catch (e) { fail(e); if (errCode(e) === "OTP_ATTEMPTS") setStep("forgot"); } finally { setBusy(false); }
  });

  const resend = async () => {
    if (step === "reset") { if (await sendResetCode(email)) toast.success("New code sent", { id: "resume-otp" }); return; }
    setBusy(true); setError("");
    try {
      if (step === "verify") { const { data } = await http.post("/signup/resend", { email, source: SOURCE }); setCooldown(data.resendInSeconds ?? 60); }
      else { await authApi.post("/resend-otp", { challengeId, source: SOURCE }); setCooldown(60); }
      setOtp(""); toast.success("New code sent", { id: "resume-otp" });
    } catch (e) { fail(e); } finally { setBusy(false); }
  };

  const se = signupForm.formState.errors, le = loginForm.formState.errors, fe = forgotForm.formState.errors, re = resetForm.formState.errors, me = mobileForm.formState.errors;
  const showTabs = step === "signup" || step === "login";
  const inOtp = step === "verify" || step === "login-otp";
  const waitLabel = cooldown > 60 ? `Try again in ${Math.ceil(cooldown / 60)} min` : `Resend in ${cooldown}s`;
  const locked = authLockLeft > 0;
  const accountLocked = lockLeft > 0;
  const resendLine = cooldown > 0 ? waitLabel : <button type="button" onClick={resend} className="rv-link" disabled={busy}>Send a new code</button>;

  return (
    <Page title={`${step === "signup" ? "Create account" : "Log in"} | Resume Lab`}>
      <main className="rv-auth">
        {/* brand side: large screens */}
        <aside className="rv-auth-aside" aria-hidden={false}>
          <div className="rv-auth-glow" aria-hidden />
          <div className="rv-auth-in">
          <span className="rv-kicker rl-auth-kicker">Resume Lab by Target Trek</span>
          <h2 className="rv-auth-h">Get the interview calls your resume deserves.</h2>
          <ul className="rv-auth-list">
            {[[Brain, "AI report in minutes", "Score, ATS check, missing keywords and rewritten bullets."], [UserCircle, "A working professional reviews it", "Plain-language notes on your story, level and fit."], [LinkedinLogo, "LinkedIn review too", "One consistent story across resume and profile."]].map(([Icon, t, d]) => (
              <li key={t}><span className="rv-ico"><Icon size={20} weight="duotone" aria-hidden /></span><div><b>{t}</b><p>{d}</p></div></li>
            ))}
          </ul>
          <div className="rv-auth-score" aria-hidden>
            <div className="rv-auth-ring"><b className="rv-mono">78</b></div>
            <div><b>Your resume score</b><span>ATS ready · 5 fixes found</span></div>
          </div>
          <p className="rv-auth-fine"><Lock size={14} weight="bold" aria-hidden />Private. Only your reviewer and the AI see your resume.</p>
          </div>
        </aside>

        {/* form side */}
        <section className="rv-auth-main">
          <div className="rv-auth-card">
            <Link to="/resume-review" className="rv-link rv-auth-back" style={{ textDecoration: "none" }}><ArrowLeft size={14} weight="bold" aria-hidden />Back to Resume Review</Link>

            {showTabs && (
              <div className="rv-seg" role="tablist" aria-label="Sign up or log in" style={{ marginBottom: 26 }}>
                <button type="button" role="tab" aria-selected={step === "signup"} aria-pressed={step === "signup"} onClick={() => go("signup")}>Create account</button>
                <button type="button" role="tab" aria-selected={step === "login"} aria-pressed={step === "login"} onClick={() => go("login")}>Log in</button>
              </div>
            )}

            {locked && (
              <div role="alert" className="rv-lock">
                <p><Warning size={16} weight="fill" aria-hidden /> <b>Temporarily locked for your security</b></p>
                <p>{authLock.message.replace(/\s*(It unlocks|Please try again)[^.]*\.?$/i, "").trim()}</p>
                <p>Unlocks automatically in <b className="rv-mono">{formatWait(authLockLeft)}</b>. If this is a mistake, write to supporttargettrek@gmail.com.</p>
              </div>
            )}
            {accountLocked && <div role="alert" className="rv-lock"><p><Warning size={16} weight="fill" aria-hidden /> <b>Account locked after too many wrong passwords</b></p><p>Try again in <b className="rv-mono">{formatWait(lockLeft)}</b>, or reset your password with an email code.</p></div>}
            {error && <p role="alert" className="rv-error-box">{error}</p>}

            {step === "signup" && (
              <form onSubmit={onSignup} noValidate className="rv-in rv-auth-form">
                <h1 className="rv-h2 rv-auth-title">Create your account</h1>
                {googleEnabled && <><GoogleButton text="signup_with" onCredential={onGoogleCredential} disabled={busy || locked} /><Or /></>}
                <div className="rv-pair">
                  <Field required label="Full name" htmlFor="rv-name" error={se.name?.message}><input id="rv-name" autoComplete="name" className={inputClass(se.name)} {...signupForm.register("name")} /></Field>
                  <Field required label="Email" htmlFor="rv-email" error={se.email?.message} hint="We'll send a code here."><input id="rv-email" type="email" autoComplete="email" className={inputClass(se.email)} {...signupForm.register("email")} /></Field>
                </div>
                <Field required label="Mobile" htmlFor="rv-mobile" error={se.mobile?.message} hint="Needed for secure payments. We never spam.">
                  <PhoneInput id="rv-mobile" dial={signupForm.watch("countryCode")} invalid={Boolean(se.mobile)} inputClass={inputClass} countryProps={signupForm.register("countryCode")} mobileProps={signupForm.register("mobile")} />
                </Field>
                <div className="rv-pair">
                  <Field required label="Password" htmlFor="rv-pw" error={se.password?.message} hint="8+ chars, upper, lower, number, symbol."><PasswordInput id="rv-pw" autoComplete="new-password" invalid={se.password} {...signupForm.register("password")} /></Field>
                  <Field required label="Confirm password" htmlFor="rv-pw2" error={se.confirmPassword?.message}><PasswordInput id="rv-pw2" autoComplete="new-password" invalid={se.confirmPassword} {...signupForm.register("confirmPassword")} /></Field>
                </div>
                <Btn type="submit" size="lg" block loading={busy} disabled={locked}>Send me a code</Btn>
                <p className="rv-sm rv-muted" style={{ textAlign: "center", marginTop: 0 }}>Already have an account or a plan? <button type="button" className="rv-link" onClick={() => go("login")}>Log in</button></p>
                <p className="rv-hint" style={{ textAlign: "center", marginTop: 0 }}>By continuing you agree to the <Link to="/terms-of-service" style={{ textDecoration: "underline" }}>Terms</Link> and <Link to="/privacy-policy" style={{ textDecoration: "underline" }}>Privacy Policy</Link>.</p>
              </form>
            )}

            {step === "login" && (
              <form onSubmit={onLogin} noValidate className="rv-in rv-auth-form">
                <div><h1 className="rv-h2 rv-auth-title">Welcome back</h1><p className="rv-muted rv-sm" style={{ marginTop: 8 }}>Log in to see your resumes, plans and reports.</p></div>
                {googleEnabled && <><GoogleButton text="signin_with" onCredential={onGoogleCredential} disabled={busy || locked} /><Or /></>}
                <Field label="Email or mobile" htmlFor="rv-id" error={le.identifier?.message}><input id="rv-id" autoComplete="username" className={inputClass(le.identifier)} {...loginForm.register("identifier")} /></Field>
                <Field label="Password" htmlFor="rv-lpw" error={le.password?.message}><PasswordInput id="rv-lpw" autoComplete="current-password" invalid={le.password} {...loginForm.register("password")} /></Field>
                <div style={{ textAlign: "right", marginTop: -6 }}>
                  <button type="button" className="rv-link" onClick={() => { const id = loginForm.getValues("identifier") || ""; forgotForm.setValue("email", id.includes("@") ? id : ""); go("forgot"); }}>Forgot password?</button>
                </div>
                <Btn type="submit" size="lg" block loading={busy} disabled={locked || accountLocked}>Log in</Btn>
              </form>
            )}

            {step === "google-mobile" && googleSignup && (
              <form onSubmit={onGoogleMobile} noValidate className="rv-in rv-auth-form">
                <div><h1 className="rv-h2 rv-auth-title">One last step</h1><p className="rv-muted rv-sm" style={{ marginTop: 8 }}>Welcome{googleSignup.name ? `, ${googleSignup.name.split(" ")[0]}` : ""}. Add your mobile number to finish creating your account for <b style={{ color: "var(--rv-text)" }}>{googleSignup.email}</b>.</p></div>
                <Field required label="Mobile" htmlFor="rv-gmobile" error={me.mobile?.message} hint="Needed for secure payments. We never spam.">
                  <PhoneInput id="rv-gmobile" dial={mobileForm.watch("countryCode")} invalid={Boolean(me.mobile)} inputClass={inputClass} countryProps={mobileForm.register("countryCode")} mobileProps={mobileForm.register("mobile")} />
                </Field>
                <Btn type="submit" size="lg" block loading={busy}>Create my account</Btn>
                <button type="button" className="rv-link" style={{ justifySelf: "center" }} onClick={() => { setGoogleSignup(null); go("signup"); }}>Use a different account</button>
              </form>
            )}

            {inOtp && (
              <div className="rv-in rv-auth-form">
                <button type="button" onClick={() => go(step === "verify" ? "signup" : "login")} className="rv-link" style={{ justifySelf: "start", textDecoration: "none" }}><ArrowLeft size={14} weight="bold" aria-hidden /> Back</button>
                <div><h1 className="rv-h2 rv-auth-title">Check your email</h1><p className="rv-muted rv-sm" style={{ marginTop: 8 }}>We sent a 6 digit code to <b style={{ color: "var(--rv-text)" }}>{email}</b>.</p></div>
                <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} disabled={busy} />
                <Btn size="lg" block loading={busy} onClick={step === "verify" ? onVerifySignup : onVerifyLogin}>Verify and continue</Btn>
                <p className="rv-hint" style={{ textAlign: "center", marginTop: 0 }}>{resendLine}</p>
              </div>
            )}

            {step === "forgot" && (
              <form onSubmit={onForgot} noValidate className="rv-in rv-auth-form">
                <button type="button" onClick={() => go("login")} className="rv-link" style={{ justifySelf: "start", textDecoration: "none" }}><ArrowLeft size={14} weight="bold" aria-hidden /> Back to log in</button>
                <div><h1 className="rv-h2 rv-auth-title">Reset your password</h1><p className="rv-muted rv-sm" style={{ marginTop: 8 }}>Enter your account email. We'll send a 6 digit code to choose a new password.</p></div>
                <Field label="Email" htmlFor="rv-femail" error={fe.email?.message}><input id="rv-femail" type="email" autoComplete="email" className={inputClass(fe.email)} {...forgotForm.register("email")} /></Field>
                <Btn type="submit" size="lg" block loading={busy} disabled={locked || cooldown > 0}>{cooldown > 0 ? waitLabel : "Send me a code"}</Btn>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={onReset} noValidate className="rv-in rv-auth-form">
                <button type="button" onClick={() => go("forgot")} className="rv-link" style={{ justifySelf: "start", textDecoration: "none" }}><ArrowLeft size={14} weight="bold" aria-hidden /> Back</button>
                <div><h1 className="rv-h2 rv-auth-title">Choose a new password</h1><p className="rv-muted rv-sm" style={{ marginTop: 8 }}>Enter the 6 digit code we sent to <b style={{ color: "var(--rv-text)" }}>{email}</b>, then your new password.</p></div>
                <OtpInput value={otp} onChange={(v) => { setOtp(v); setError(""); }} disabled={busy} />
                <Field required label="New password" htmlFor="rv-npw" error={re.password?.message} hint="8+ characters with upper, lower, number and symbol."><PasswordInput id="rv-npw" autoComplete="new-password" invalid={re.password} {...resetForm.register("password")} /></Field>
                <Field required label="Confirm new password" htmlFor="rv-npw2" error={re.confirmPassword?.message}><PasswordInput id="rv-npw2" autoComplete="new-password" invalid={re.confirmPassword} {...resetForm.register("confirmPassword")} /></Field>
                <Btn type="submit" size="lg" block loading={busy}>Change password</Btn>
                <p className="rv-hint" style={{ textAlign: "center", marginTop: 0 }}>{resendLine}</p>
              </form>
            )}

            <p className="rv-auth-trust"><ShieldCheck size={15} weight="bold" aria-hidden style={{ flexShrink: 0 }} /><span>Secured by Target Trek · one account for every product</span></p>
          </div>
        </section>
      </main>
    </Page>
  );
}
