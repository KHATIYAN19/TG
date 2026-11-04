import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AlertTriangle, BanknoteX, Check, Circle, Eye, EyeOff, MessageCircle, Trash2 } from "lucide-react";

import { logout } from "../Redux/authSlice";
import { useArena } from "./ArenaContext";
import { http, errMsg, errCode } from "./api";
import { Button, Card, Field, Modal, cx, inputClass } from "./ui";

/* Password box with a show / hide eye, so a typo can be spotted before it counts. */
function PasswordBox({ id, value, onChange, invalid, autoComplete, label }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        value={value}
        onChange={onChange}
        aria-invalid={invalid ? "true" : "false"}
        className={cx(inputClass(invalid), "pr-11")}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? `Hide ${label}` : `Show ${label}`}
        className="absolute inset-y-0 right-0 grid w-11 place-items-center text-stone-400 hover:text-stone-600 dk:text-[#8f7c70] dk:hover:text-[#d6c4b8]"
      >
        {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
      </button>
    </div>
  );
}

/*
  "Delete my account" (Settings).
  The server enforces everything; this screen explains it and collects:
    - the member's password (a left-open session can't wipe an account),
    - the word DELETE,
    - a tick that they understand there is NO refund.
  An active partnership must be ended first.
*/
export default function DeleteAccount({ refundsOn = false }) {
  const { me } = useArena();
  const dispatch = useDispatch();

  const matched = me?.profile?.status === "matched" || Boolean(me?.match);

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [typed, setTyped] = useState("");
  const [understood, setUnderstood] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState({ code: "", message: "" });

  const close = () => {
    if (busy) return;
    setOpen(false);
    setPassword("");
    setConfirmPassword("");
    setTyped("");
    setUnderstood(false);
    setError({ code: "", message: "" });
  };

  // Each requirement is checked on its own so the person can SEE what is still missing.
  const checks = [
    { ok: password.length > 0, label: "Enter your password" },
    { ok: password.length > 0 && confirmPassword === password, label: "Enter the same password again" },
    { ok: typed.trim().toUpperCase() === "DELETE", label: "Type DELETE" },
    { ok: understood, label: "Tick the box: no refund, permanent" },
  ];
  const ready = checks.every((c) => c.ok);
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;
  const wrongWord = typed.trim().length > 0 && typed.trim().toUpperCase() !== "DELETE";

  const submit = async () => {
    if (!ready || busy) return;
    setBusy(true);
    setError({ code: "", message: "" });
    try {
      await http.delete("/account", { data: { password, confirmPassword, confirm: "DELETE" } });
      // The signed-in area redirects to the login page the moment the session
      // disappears, so finish with a full page load of the landing page instead.
      // The landing page shows the confirmation once.
      try { sessionStorage.setItem("arena:accountDeleted", "1"); } catch { /* ignore */ }
      dispatch(logout());
      window.location.replace("/prep-buddy");
    } catch (e) {
      setError({ code: errCode(e) || "", message: errMsg(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="border-rose-200 p-6 dk:border-rose-500/25">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-[#29201b] dk:text-[#fff7ed]">
        <Trash2 className="h-5 w-5 text-rose-500" aria-hidden /> Delete my account
      </h2>
      <p className="mt-2 text-sm text-stone-600 dk:text-[#d6c4b8]">
        Permanently delete your account and everything in Prep Buddy: your profile, requests, matches and chats. You can create a new account later with the same email and mobile number, but nothing here comes back.
      </p>

      <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200 dk:bg-amber-500/10 dk:text-amber-200 dk:ring-amber-500/25">
        <BanknoteX className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span><strong>No refund.</strong> Deleting your account does not refund anything you paid.{refundsOn ? " If you only want your money back, cancel your entry instead (possible before your first match)." : ""}</span>
      </p>

      {matched ? (
        <div role="alert" className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800 ring-1 ring-rose-200 dk:bg-rose-500/10 dk:text-rose-200 dk:ring-rose-500/25">
          <p className="flex items-start gap-2"><MessageCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> You&apos;re matched right now. End your partnership first, then you can delete your account.</p>
          <Link to="../buddy" className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700">Go to My buddy</Link>
        </div>
      ) : (
        <Button variant="danger" className="mt-4" onClick={() => setOpen(true)}>Delete my account</Button>
      )}

      <Modal
        open={open}
        onClose={close}
        title="Delete your account?"
        footer={
          <>
            <Button variant="ghost" onClick={close} disabled={busy}>Keep my account</Button>
            <Button variant="danger" loading={busy} disabled={!ready} onClick={submit}>Delete forever</Button>
          </>
        }
      >
        <ul className="space-y-1.5 text-sm">
          {[
            "Your profile, requests, matches and chat history are deleted for good.",
            "You're signed out of every device right away.",
            "You can sign up again later with the same email and mobile number.",
          ].map((line) => (
            <li key={line} className="flex gap-2"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" aria-hidden />{line}</li>
          ))}
        </ul>

        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 dk:bg-amber-500/10 dk:text-amber-200">
          No refund: you will not get back any amount you paid.
        </p>

        {error.message && (
          <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-100 dk:bg-rose-500/10 dk:text-rose-300 dk:ring-rose-500/20">
            {error.message}
            {error.code === "ACTIVE_MATCH" && <> <Link to="../buddy" onClick={close} className="font-semibold underline">Go to My buddy</Link></>}
          </p>
        )}

        <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="mt-4 space-y-4" noValidate>
          <Field label="Your password" htmlFor="del-password" error={error.code === "WRONG_PASSWORD" ? "That password isn't correct." : undefined}>
            <PasswordBox id="del-password" label="password" autoComplete="current-password" value={password} onChange={(e) => { setPassword(e.target.value); if (error.code === "WRONG_PASSWORD") setError({ code: "", message: "" }); }} invalid={error.code === "WRONG_PASSWORD"} />
          </Field>
          <Field label="Confirm your password" htmlFor="del-password2" error={mismatch ? "Passwords don't match." : undefined} hint={!mismatch && confirmPassword && confirmPassword === password ? "Passwords match." : undefined}>
            <PasswordBox id="del-password2" label="confirmation password" autoComplete="current-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} invalid={mismatch} />
          </Field>
          <Field label="Type DELETE to confirm" htmlFor="del-confirm" error={wrongWord ? "Type the word DELETE." : undefined}>
            <input id="del-confirm" autoComplete="off" autoCapitalize="characters" spellCheck={false} value={typed} onChange={(e) => setTyped(e.target.value)} aria-invalid={wrongWord ? "true" : "false"} className={inputClass(wrongWord)} />
          </Field>
          <label className="flex cursor-pointer items-start gap-2.5 text-sm">
            <input type="checkbox" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} className="mt-0.5 h-4 w-4 accent-rose-600" />
            <span>I understand my account will be deleted permanently and I will <strong>not</strong> get any refund.</span>
          </label>

          <ul aria-label="What is still needed" className="space-y-1 rounded-xl bg-stone-50 px-3.5 py-3 text-xs dk:bg-[#1c1612]">
            {checks.map((c) => (
              <li key={c.label} className={cx("flex items-center gap-2", c.ok ? "text-emerald-700 dk:text-emerald-400" : "text-stone-500 dk:text-[#b9a79c]")}>
                {c.ok ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Circle className="h-3.5 w-3.5" aria-hidden />}
                <span className={c.ok ? "font-semibold" : ""}>{c.label}</span>
                <span className="sr-only">{c.ok ? " (done)" : " (still needed)"}</span>
              </li>
            ))}
          </ul>
        </form>
      </Modal>
    </Card>
  );
}
