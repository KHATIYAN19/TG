import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ArrowRight, ArrowsClockwise, CalendarBlank, CaretLeft, CaretRight, ChartBar, Check, CheckCircle, Clock,
  ClockCounterClockwise, Copy, DeviceMobile, DeviceTablet, Devices, Envelope, Eye, EyeSlash, Globe, GoogleLogo,
  Handshake, IdentificationCard, Key, Laptop, Lock, MapPin, PencilSimple, Percent, Phone, Receipt, ShieldCheck,
  ShoppingBag, SignOut, SquaresFour, TrendUp, User, UserGear, Wallet, Warning, WarningCircle,
} from "@phosphor-icons/react";

import { accountHttp, errMsg } from "../arena/api";
import { setDeviceLabel } from "../lib/authSession";
import { Btn, Page, cx } from "../resume/ui";
import { Badge, Sheet } from "../referral/ui";
import "../referral/referral.css";
import "../Admin/adminReferrals.css";
import "../Admin/adminResume.css";
import "./profile.css";

/*
  ACCOUNT CENTRE  /profile  — every signed-in role (member, affiliate, employee, admin).
  Same look as the Resume Lab admin console. The site navbar stays on top.

  ONE request opens the page:  GET /api/users/account
    → profile + last 5 devices + last 5 activities (+ affiliates: the full sales dashboard)
  Everything after that is on demand only:
    chart range        GET  /api/users/account/sales?graphDays=…   (affiliates)
    all transactions   GET  /api/affiliate/orders                  (only when the sheet opens)
    password           POST /api/auth/change-password
    devices            PATCH/DELETE /api/users/sessions[/:id] · POST /api/auth/logout-all
  Device actions update the list in place, so nothing is re-fetched after them.
  The last answer is kept in memory, so coming back to /profile paints instantly and refreshes quietly.
*/

/* ------------------------------------------------------------ format */
const TZ = "Asia/Kolkata";
const money = (v) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: Number(v) % 1 ? 2 : 0 }).format(Number(v) || 0);
const count = (v) => new Intl.NumberFormat("en-IN").format(Number(v) || 0);
const valid = (v) => v && !Number.isNaN(new Date(v).getTime());
const day = (v) => (valid(v) ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: TZ }).format(new Date(v)) : "—");
const stamp = (v) => (valid(v) ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: TZ }).format(new Date(v)) : "—");
const ago = (v) => {
  if (!valid(v)) return "—";
  const s = Math.max(0, (Date.now() - new Date(v).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} d ago`;
  return day(v);
};
/* one unit only, by the calendar: "2 years", else "5 months", else "12 days" */
const sinceText = (v) => {
  if (!valid(v)) return "—";
  const from = new Date(v), now = new Date();
  let months = (now.getFullYear() - from.getFullYear()) * 12 + (now.getMonth() - from.getMonth());
  if (now.getDate() < from.getDate()) months -= 1;
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  if (months >= 12) return plural(Math.floor(months / 12), "year");
  if (months >= 1) return plural(months, "month");
  const days = Math.floor((now - from) / 86400000);
  return days < 1 ? "Today" : plural(days, "day");
};
const initials = (s = "") => s.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("") || "U";
const ROLE = { admin: "Administrator", Employee: "Employee", normal: "Member", affiliate: "Affiliate partner" };
const roleText = (r) => ROLE[r] || "Member";
// Members just see their account; the role is only worth showing for partners and the team.
const showRole = (r) => r === "affiliate" || r === "admin" || r === "Employee";
const phoneText = (u) => (u?.mobile ? `${u.countryCode ? `${u.countryCode} ` : ""}${u.mobile}` : null);
const titleCase = (s) => String(s || "").toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const copy = async (value, label = "Copied") => {
  try { await navigator.clipboard.writeText(String(value)); toast.success(label); } catch { toast.error("Couldn't copy. Select it instead."); }
};

/* every account event, in plain words */
const EVENTS = {
  ACCOUNT_CREATED: ["Account created", "Your Target Trek account was created."],
  SIGNUP_EMAIL_VERIFIED: ["Email verified", "You confirmed your email address and finished signing up."],
  SIGNUP_GOOGLE: ["Signed up with Google", "Your account was created with Google sign-in."],
  GOOGLE_LINKED: ["Google linked", "Google sign-in was connected to this account."],
  LOGIN_SUCCESS: ["Signed in", "A successful sign-in to your account."],
  LOGIN_FAILED: ["Sign-in failed", "Someone tried to sign in with a wrong password."],
  LOGIN_OTP_SENT: ["Sign-in code sent", "A one-time code was emailed to confirm a new device."],
  LOGIN_OTP_RESENT: ["Sign-in code re-sent", "Another one-time code was emailed."],
  LOGIN_OTP_FAILED: ["Wrong sign-in code", "A one-time code was entered incorrectly."],
  LOGOUT: ["Signed out", "You signed out of a device."],
  SESSION_REVOKED: ["Device signed out", "A device was removed from your account."],
  OTHER_SESSIONS_REVOKED: ["Other devices signed out", "Every device except the one in use was signed out."],
  ALL_SESSIONS_REVOKED: ["Signed out everywhere", "Every device was signed out."],
  DEVICE_TRUST_REMOVED: ["Device forgotten", "A remembered device will need a sign-in code again."],
  PASSWORD_CHANGED: ["Password changed", "Your password was changed and devices were signed out."],
  PASSWORD_SETUP_COMPLETED: ["Password set", "A password was set for this account."],
  PASSWORD_RESET_VIA_EMAIL_OTP: ["Password reset", "Your password was reset with an email code."],
  ACCOUNT_SELF_DELETED: ["Account deletion requested", "A request to delete this account."],
  ACCOUNT_UPDATED: ["Account details updated", "Name, email, mobile, role or affiliate settings were changed."],
  ACCOUNT_STATUS_CHANGED: ["Account status changed", "The account was activated or restricted."],
  AFFILIATE_STATUS_CHANGED: ["Affiliate status changed", "The affiliate partnership was switched on or off."],
  PASSWORD_LINK_SENT: ["Password link sent", "A password setup or reset link was emailed."],
  ACCOUNT_DELETED: ["Account deleted", "The account was permanently deleted."],
};
const eventInfo = (a) => EVENTS[a] || [titleCase(a || "Activity"), null];

const DETAIL_LABEL = { count: "Devices", trustedDevice: "Remembered device", reason: "Reason", provider: "Provider", method: "Method", source: "From" };

/* ------------------------------------------------------------ data: one call, kept in memory between visits */
let memo = null; // { key, data }

function useAccount(cacheKey) {
  const [data, setData] = useState(() => (memo?.key === cacheKey ? memo.data : null));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!data);
  const seq = useRef(0);

  const load = useCallback(async ({ fresh = false } = {}) => {
    const n = ++seq.current;
    setLoading(true); setError("");
    try {
      const { data: r } = await accountHttp.get("/users/account", { params: fresh ? { fresh: 1 } : undefined });
      if (!r?.success || !r.user) throw new Error(r?.message || "Your account could not be loaded.");
      if (n !== seq.current) return;
      memo = { key: cacheKey, data: r };
      setData(r);
    } catch (e) {
      if (n === seq.current) setError(errMsg(e));
    } finally {
      if (n === seq.current) setLoading(false);
    }
  }, [cacheKey]);

  const patch = useCallback((fn) => setData((d) => { const next = fn(d); memo = { key: cacheKey, data: next }; return next; }), [cacheKey]);

  useEffect(() => { load(); }, [load]);
  return { data, error, loading, load, patch };
}

const leave = () => {
  const theme = localStorage.getItem("theme");
  localStorage.clear(); sessionStorage.clear();
  if (theme) localStorage.setItem("theme", theme);
  memo = null;
  window.location.replace("/login");
};

/* ------------------------------------------------------------ small parts */
const Kpi = ({ icon: Icon, label, value, sub, text }) => (
  <div className="arx-kpi">
    <span><Icon size={16} weight="bold" aria-hidden />{label}</span>
    <b className={text ? "txt" : undefined}>{value}</b>
    {sub && <small>{sub}</small>}
  </div>
);

const Card = ({ icon: Icon, title, caption, action, children, className }) => (
  <section className={cx("arx-card", className)}>
    <div className="acx-cardhead">
      <h3>{Icon && <Icon size={15} weight="bold" aria-hidden />}{title}</h3>
      {action}
      {caption && <p>{caption}</p>}
    </div>
    {children}
  </section>
);

const Row = ({ label, children }) => <div><dt>{label}</dt><dd>{children ?? "—"}</dd></div>;

const StatusBadge = ({ status }) => {
  const s = String(status || "").toLowerCase();
  const tone = s === "active" ? "ok" : ["blocked", "suspended", "inactive", "disabled"].includes(s) ? "bad" : "muted";
  return <Badge tone={tone}>{s ? titleCase(s) : "Unknown"}</Badge>;
};

const deviceIcon = (t) => (t === "mobile" ? DeviceMobile : t === "tablet" ? DeviceTablet : Laptop);

function Skeleton() {
  return (
    <div className="acx-stack" aria-busy="true" aria-label="Loading your account">
      <div className="acx-skel" style={{ height: 120 }} />
      <div className="arx-kpis">{[0, 1, 2, 3].map((i) => <div key={i} className="acx-skel" style={{ height: 96 }} />)}</div>
      <div className="acx-grid2"><div className="acx-skel" style={{ height: 260 }} /><div className="acx-skel" style={{ height: 260 }} /></div>
    </div>
  );
}

/* ------------------------------------------------------------ overview */
function Overview({ data, go }) {
  const u = data.user;
  const verified = Boolean(u.emailVerifiedAt);
  const recentPw = u.passwordChangedAt && Date.now() - new Date(u.passwordChangedAt).getTime() < 180 * 86400000;
  const others = data.deviceCount - 1;
  const checks = [
    { ok: verified, title: verified ? "Email verified" : "Email not verified", text: verified ? `Confirmed ${day(u.emailVerifiedAt)}` : "Sign-in codes and receipts go to this address." },
    { ok: Boolean(recentPw), title: u.passwordChangedAt ? `Password changed ${ago(u.passwordChangedAt)}` : "Password never changed", text: recentPw ? "Changed in the last 6 months." : "Changing it every few months keeps the account safe.", to: "security" },
    { ok: others <= 2, title: `${count(data.deviceCount)} signed-in device${data.deviceCount === 1 ? "" : "s"}`, text: others > 0 ? "Sign out any device you don't recognise." : "Only this device is signed in.", to: "devices" },
    { ok: true, title: u.googleLinked ? "Google sign-in linked" : "Password sign-in", text: u.googleLinked ? `Linked ${day(u.googleLinkedAt)}` : "You sign in with email and password." },
  ];
  const last = data.activities[0];

  return (
    <div className="acx-stack">
      <div className="arx-kpis">
        <Kpi icon={CalendarBlank} label="Member for" value={sinceText(u.createdAt)} sub={`Since ${day(u.createdAt)}`} text />
        <Kpi icon={Clock} label="Last sign-in" value={ago(u.lastLoginAt)} sub={stamp(u.lastLoginAt)} text />
        <Kpi icon={Devices} label="Active devices" value={count(data.deviceCount)} sub={data.deviceCount > 5 ? "Showing the 5 most recent" : "Signed in right now"} />
        <Kpi icon={Key} label="Password age" value={u.passwordChangedAt ? sinceText(u.passwordChangedAt) : "Never changed"} sub={u.passwordChangedAt ? `Changed ${day(u.passwordChangedAt)}` : "Set at sign-up"} text />
      </div>

      <div className="acx-grid2">
        <Card icon={IdentificationCard} title="Personal information" caption="Registered details. To change your name, email or mobile, contact support.">
          <dl className="rf-kv">
            <Row label="Full name">{u.name}</Row>
            <Row label="Email">
              <span style={{ overflowWrap: "anywhere" }}>{u.email}</span>
              <button type="button" className="acx-iconlink" onClick={() => copy(u.email, "Email copied")} aria-label="Copy email"><Copy size={14} /></button>
            </Row>
            <Row label="Mobile">{phoneText(u) || <span className="muted">Not added</span>}</Row>
            {showRole(u.role) && <Row label="Account type">{roleText(u.role)}</Row>}
            <Row label="Status"><StatusBadge status={u.status} /></Row>
            <Row label="Joined">{stamp(u.createdAt)}</Row>
          </dl>
          {u.statusReason && u.status !== "active" && <p className="acx-note"><b>Note from the team:</b> {u.statusReason}</p>}
        </Card>

        <Card icon={ShieldCheck} title="Security check-up" caption="A quick look at how protected your account is.">
          <ul className="acx-checks">
            {checks.map((c) => (
              <li key={c.title} className={c.ok ? "ok" : "warn"}>
                {c.ok ? <CheckCircle className="ic" size={20} weight="fill" /> : <WarningCircle className="ic" size={20} weight="fill" />}
                <div><b>{c.title}</b><span>{c.text}</span></div>
              </li>
            ))}
          </ul>
          <div className="rf-btns">
            <Btn variant="ghost" size="sm" onClick={() => go("security")}><Lock size={15} />Change password</Btn>
            <Btn variant="ghost" size="sm" onClick={() => go("devices")}><Devices size={15} />Manage devices</Btn>
          </div>
        </Card>
      </div>

      {u.role === "affiliate" && <AffiliateTerms user={u} go={go} />}

      {(u.role === "admin" || u.role === "Employee") && (
        <Card icon={UserGear} title="Team tools" caption={u.role === "admin" ? "You have administrator access." : "You have reviewer access."}>
          <div className="rf-btns">
            {u.role === "admin" && <Btn as={Link} to="/dashboard" size="sm"><SquaresFour size={15} />Admin dashboard</Btn>}
            <Btn as={Link} to="/admin/resume-reviews" variant="ghost" size="sm">Resume Lab console<ArrowRight size={14} /></Btn>
            {u.role === "admin" && <Btn as={Link} to="/admin/referrals" variant="ghost" size="sm">Referrals console<ArrowRight size={14} /></Btn>}
          </div>
        </Card>
      )}

      {last && (
        <Card icon={ClockCounterClockwise} title="Latest activity" action={<Btn variant="ghost" size="sm" onClick={() => go("activity")}>See last 5<ArrowRight size={14} /></Btn>}>
          <ul className="acx-acts"><ActivityItem a={last} /></ul>
        </Card>
      )}
    </div>
  );
}

function AffiliateTerms({ user, go }) {
  const a = user.affiliate || {};
  const rate = a.commissionType === "percentage" ? `${a.commissionValue}%` : a.commissionType === "fixed" ? `${money(a.commissionValue)} per sale` : "—";
  const link = a.code && typeof window !== "undefined" ? `${window.location.origin}/?ref=${encodeURIComponent(a.code)}` : null;
  return (
    <Card icon={Handshake} title="Affiliate partnership" caption="Share your code or link. Sales made with it earn you commission." action={go && <Btn variant="ghost" size="sm" onClick={() => go("sales")}><ChartBar size={15} />Sales dashboard</Btn>}>
      <div className="acx-code">
        <div><span className="subtle">Your referral code</span><br /><b>{a.code || "Not assigned"}</b></div>
        <div className="rf-btns">
          <Btn size="sm" disabled={!a.code} onClick={() => copy(a.code, "Code copied")}><Copy size={15} />Copy code</Btn>
          {link && <Btn variant="ghost" size="sm" onClick={() => copy(link, "Link copied")}><Globe size={15} />Copy link</Btn>}
        </div>
      </div>
      <dl className="rf-kv">
        <Row label="Commission type">{a.commissionType ? titleCase(a.commissionType) : "—"}</Row>
        <Row label="Commission rate"><b className="mono">{rate}</b></Row>
        <Row label="Partner status"><StatusBadge status={a.status} /></Row>
      </dl>
    </Card>
  );
}

/* ------------------------------------------------------------ activity */
function ActivityItem({ a }) {
  const [title, desc] = eventInfo(a.action);
  const bad = a.result === "failure";
  const details = Object.entries(a.details || {});
  return (
    <li className={cx("acx-act", bad && "bad")}>
      <span className="dot">{bad ? <Warning size={18} weight="bold" /> : <ShieldCheck size={18} weight="bold" />}</span>
      <div style={{ minWidth: 0 }}>
        <div className="top">
          <b>{title}</b>
          <time dateTime={a.createdAt} title={stamp(a.createdAt)}>{stamp(a.createdAt)}</time>
        </div>
        {desc && <p className="desc">{desc}</p>}
        <div className="acx-meta">
          <Badge tone={bad ? "bad" : "ok"}>{bad ? "Failed" : "Success"}</Badge>
          {a.thisDevice && <Badge tone="brand">This device</Badge>}
          {a.actor && <span><UserGear size={13} />By <b>{a.actor.name}</b></span>}
          {a.device && <span>{(() => { const I = deviceIcon(a.device.type); return <I size={13} />; })()}<b>{a.device.name}</b>{a.device.os && a.device.os !== "Unknown OS" ? ` · ${a.device.os}` : ""}</span>}
          {a.location && <span><MapPin size={13} />{a.location.text}</span>}
          {a.ipAddress && <span><Globe size={13} />IP <b className="mono">{a.ipAddress}</b></span>}
          {details.map(([k, v]) => <span key={k}>{DETAIL_LABEL[k] || titleCase(k)}: <b>{typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}</b></span>)}
        </div>
      </div>
    </li>
  );
}

function ActivityTab({ data }) {
  return (
    <Card icon={ClockCounterClockwise} title="Recent activity" caption="Your 5 latest account and security events, newest first, with the device, place and IP address each came from. Times are in IST.">
      {data.activities.length === 0
        ? <div className="rf-empty"><span className="e">🕊️</span><h3>Nothing yet</h3><p>Sign-ins, password changes and device changes will show up here.</p></div>
        : <ul className="acx-acts">{data.activities.map((a) => <ActivityItem key={a.id} a={a} />)}</ul>}
      <p className="acx-note">See something you don't recognise? <b>Change your password</b> and <b>sign out all devices</b> right away.</p>
    </Card>
  );
}

/* ------------------------------------------------------------ devices */
function DevicesTab({ data, patch }) {
  const [busy, setBusy] = useState("");
  const [ask, setAsk] = useState(null); // { kind: one | others | all, d? }
  const [rename, setRename] = useState(null); // { id, name }
  const devices = data.devices;
  const others = Math.max(0, data.deviceCount - 1);

  const run = async () => {
    if (!ask) return;
    setBusy("ask");
    try {
      const r = ask.kind === "all" ? await accountHttp.post("/auth/logout-all")
        : ask.kind === "others" ? await accountHttp.delete("/users/sessions")
        : await accountHttp.delete(`/users/sessions/${encodeURIComponent(ask.d.sessionId)}`);
      toast.success(r.data?.message || "Done");
      if (ask.kind === "all" || (ask.kind === "one" && ask.d.isCurrent)) return leave();
      if (ask.kind === "others") patch((d) => ({ ...d, devices: d.devices.filter((x) => x.isCurrent), deviceCount: 1 }));
      else patch((d) => ({ ...d, devices: d.devices.filter((x) => x.sessionId !== ask.d.sessionId), deviceCount: Math.max(1, d.deviceCount - 1) }));
      setAsk(null);
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(""); }
  };

  const save = async () => {
    const name = rename.name.trim();
    if (name.length < 2) return toast.error("Use at least 2 characters.");
    setBusy("rename");
    try {
      const r = await accountHttp.patch(`/users/sessions/${encodeURIComponent(rename.id)}`, { name });
      const finalName = r.data?.name || name;
      patch((d) => ({ ...d, devices: d.devices.map((x) => (x.sessionId === rename.id ? { ...x, device: { ...x.device, name: finalName } } : x)) }));
      if (devices.find((x) => x.sessionId === rename.id)?.isCurrent) setDeviceLabel(finalName);
      setRename(null); toast.success("Device renamed");
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(""); }
  };

  const confirmText = !ask ? null
    : ask.kind === "all" ? ["Sign out of every device?", "Every device, including this one, is signed out now and remembered devices are forgotten. You'll need to sign in again."]
    : ask.kind === "others" ? [`Sign out ${others} other device${others === 1 ? "" : "s"}?`, "Every device except this one is signed out now."]
    : ask.d.isCurrent ? ["Sign out of this device?", "You'll be signed out here and taken to the login page."]
    : [`Sign out ${ask.d.device?.name || "this device"}?`, "It's signed out now and will need your password (and an email code) to get back in."];

  return (
    <div className="acx-stack">
      <Card icon={Devices} title="Signed-in devices"
        caption={`${count(data.deviceCount)} device${data.deviceCount === 1 ? " is" : "s are"} signed in. ${data.deviceCount > 5 ? "The 5 most recently used are shown, this one first." : "This device is shown first."} Expired and signed-out devices disappear on their own.`}
        action={<div className="rf-btns">
          <Btn variant="ghost" size="sm" disabled={others === 0 || Boolean(busy)} onClick={() => setAsk({ kind: "others" })}><SignOut size={15} />Sign out others</Btn>
          <Btn variant="danger" size="sm" disabled={Boolean(busy)} onClick={() => setAsk({ kind: "all" })}><SignOut size={15} />Sign out everywhere</Btn>
        </div>}>
        {ask && (
          <div className="acx-confirm" role="alertdialog" aria-label={confirmText[0]}>
            <b>{confirmText[0]}</b><p>{confirmText[1]}</p>
            <div className="rf-btns">
              <Btn variant="ghost" size="sm" disabled={busy === "ask"} onClick={() => setAsk(null)}>Cancel</Btn>
              <Btn variant="danger" size="sm" loading={busy === "ask"} onClick={run}><SignOut size={15} />Yes, sign out</Btn>
            </div>
          </div>
        )}
        {devices.length === 0
          ? <div className="rf-empty"><span className="e">💻</span><h3>No active devices</h3><p>Devices you sign in on will appear here.</p></div>
          : <div className="acx-devs">{devices.map((d) => {
            const I = deviceIcon(d.device?.type);
            const name = d.device?.name || "Unknown device";
            return (
              <article key={d.sessionId} className={cx("acx-dev", d.isCurrent && "cur")}>
                <div className="row">
                  <span className="ico"><I size={22} weight="duotone" /></span>
                  <div className="name">
                    <div>
                      <b>{name}</b>
                      {d.isCurrent && <Badge tone="brand">This device</Badge>}
                      {d.isTrusted && <Badge tone="info">Remembered</Badge>}
                      <button type="button" className="acx-iconlink" aria-label={`Rename ${name}`} title="Name this device, e.g. “Work laptop”" onClick={() => setRename({ id: d.sessionId, name })}><PencilSimple size={15} /></button>
                    </div>
                    <span className="subtle">{[d.device?.browser, d.device?.os].filter((x) => x && x !== "Browser" && x !== "Unknown OS").join(" · ") || "Browser details unavailable"}</span>
                  </div>
                </div>
                {rename?.id === d.sessionId && (
                  <div className="acx-rename">
                    <input className="rv-input" autoFocus maxLength={50} value={rename.name} aria-label="Device name"
                      onChange={(e) => setRename({ ...rename, name: e.target.value })}
                      onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setRename(null); }} />
                    <Btn size="sm" loading={busy === "rename"} onClick={save}><Check size={15} />Save</Btn>
                    <Btn variant="ghost" size="sm" disabled={busy === "rename"} onClick={() => setRename(null)}>Cancel</Btn>
                  </div>
                )}
                <dl className="facts">
                  <div><dt>Last active</dt><dd title={stamp(d.lastActiveAt)}>{d.isCurrent ? "Now" : ago(d.lastActiveAt)}</dd></div>
                  <div><dt>Signed in</dt><dd>{stamp(d.createdAt)}</dd></div>
                  <div><dt>Location</dt><dd>{d.location?.text || "Unknown"}</dd></div>
                  <div><dt>IP address</dt><dd className="mono">{d.ipAddress || "—"}</dd></div>
                </dl>
                <div className="acts">
                  <Btn variant={d.isCurrent ? "ghost" : "danger"} size="sm" disabled={Boolean(busy)} onClick={() => setAsk({ kind: "one", d })}><SignOut size={15} />{d.isCurrent ? "Sign out here" : "Sign out this device"}</Btn>
                  {d.isTrusted && d.trustedUntil && <span className="subtle" style={{ alignSelf: "center" }}>Skips the email code until {day(d.trustedUntil)}</span>}
                </div>
              </article>
            );
          })}</div>}
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------ password */
const RULES = [
  { label: "8–128 characters", test: (v) => v.length >= 8 && v.length <= 128 },
  { label: "An uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "A number", test: (v) => /\d/.test(v) },
  { label: "A special character", test: (v) => /[^A-Za-z0-9]/.test(v) },
];
const EMPTY_PW = { oldPassword: "", newPassword: "", confirmPassword: "" };

function SecurityTab({ data }) {
  const [form, setForm] = useState(EMPTY_PW);
  const [show, setShow] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const rules = RULES.map((r) => ({ ...r, on: r.test(form.newPassword) }));
  const strong = rules.every((r) => r.on);
  const match = Boolean(form.confirmPassword) && form.confirmPassword === form.newPassword;
  const same = Boolean(form.oldPassword) && form.oldPassword === form.newPassword;
  const ready = form.oldPassword && strong && match && !same;
  const set = (e) => { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); setErr(""); };

  const submit = async (e) => {
    e.preventDefault();
    if (!ready || busy) return;
    setBusy(true); setErr("");
    try {
      const { data: r } = await accountHttp.post("/auth/change-password", form);
      if (!r?.success) throw new Error(r?.message || "Couldn't change the password.");
      toast.success("Password changed. Please sign in again.");
      leave();
    } catch (x) { const m = errMsg(x); setErr(m); toast.error(m); } finally { setBusy(false); }
  };

  const field = (name, label, auto) => (
    <div>
      <label className="rv-label" htmlFor={`pw-${name}`}>{label}</label>
      <div className="acx-pwfield">
        <input id={`pw-${name}`} className="rv-input" name={name} type={show[name] ? "text" : "password"} value={form[name]} onChange={set} disabled={busy} autoComplete={auto} maxLength={128} />
        <button type="button" onClick={() => setShow((s) => ({ ...s, [name]: !s[name] }))} aria-label={show[name] ? "Hide password" : "Show password"}>{show[name] ? <EyeSlash size={18} /> : <Eye size={18} />}</button>
      </div>
    </div>
  );

  return (
    <div className="acx-pw">
      <Card icon={Lock} title="Change password" caption={`Last changed: ${data.user.passwordChangedAt ? stamp(data.user.passwordChangedAt) : "never"}. After a change, every device is signed out, this one included.`}>
        <form onSubmit={submit} noValidate className="acx-stack">
          {field("oldPassword", "Current password", "current-password")}
          {field("newPassword", "New password", "new-password")}
          <div>
            {field("confirmPassword", "Confirm new password", "new-password")}
            {form.confirmPassword && <p className={cx("acx-hint", match ? "ok" : "bad")}>{match ? "Passwords match" : "Passwords don't match yet"}</p>}
          </div>
          {same && <p className="acx-hint bad">The new password must be different from the current one.</p>}
          {err && <p className="acx-error" role="alert">{err}</p>}
          <div className="rf-btns"><Btn type="submit" loading={busy} disabled={!ready}><ShieldCheck size={16} />Change password</Btn></div>
        </form>
      </Card>
      <Card icon={ShieldCheck} title="Password rules">
        <div className="acx-meter" aria-hidden>{rules.map((r) => <i key={r.label} className={r.on ? "on" : ""} />)}</div>
        <ul className="acx-rules">{rules.map((r) => <li key={r.label} className={r.on ? "on" : ""}><i>{r.on && <Check size={11} weight="bold" />}</i>{r.label}</li>)}</ul>
        <p className="acx-note">Use a password you don't use anywhere else. A short sentence works well.</p>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------ affiliate sales */
const PERIODS = [["today", "Today"], ["last7Days", "7 days"], ["last30Days", "30 days"], ["last365Days", "1 year"], ["allTime", "All time"]];
const METRICS = [["salesAmount", "Sales"], ["commission", "Commission"], ["successfulOrders", "Orders"]];

function SalesChart({ graph, days, onDays, loading }) {
  const [metric, setMetric] = useState("salesAmount");
  const [hover, setHover] = useState(null);
  const points = graph?.points || [];
  const fmt = (v) => (metric === "successfulOrders" ? count(v) : money(v));
  const total = points.reduce((s, p) => s + (Number(p[metric]) || 0), 0);
  const top = Math.max(1, ...points.map((p) => Number(p[metric]) || 0));
  const every = Math.ceil(points.length / 8);
  const label = METRICS.find((m) => m[0] === metric)[1];
  const hp = hover === null ? null : points[hover];

  return (
    <Card icon={ChartBar} title={`Daily ${label.toLowerCase()}`} caption="Verified sales only, by day in IST. Hover or tap a bar to read it."
      action={<div className="rf-btns">
        <div className="acx-seg" role="group" aria-label="Measure">{METRICS.map(([k, l]) => <button key={k} type="button" aria-pressed={metric === k} onClick={() => { setMetric(k); setHover(null); }}>{l}</button>)}</div>
        <div className="acx-seg" role="group" aria-label="Range">{[7, 30, 365].map((d) => <button key={d} type="button" aria-pressed={days === d} disabled={loading} onClick={() => onDays(d)}>{d === 365 ? "1 year" : `${d} days`}</button>)}</div>
      </div>}>
      <div className={cx(loading && "rlx-dim")}>
        <div className="acx-readout" aria-live="polite">
          <span>{hp ? day(`${hp.date}T00:00:00+05:30`) : `Total, last ${days === 365 ? "year" : `${days} days`}`}</span>
          <b>{fmt(hp ? hp[metric] : total)}</b>
        </div>
        {points.length === 0 ? <p className="acx-note" style={{ marginTop: 12 }}>No data for this range yet.</p> : (
          <div className={cx("acx-chart", points.length > 60 && "many")} style={{ marginTop: 14 }} onMouseLeave={() => setHover(null)}>
            {points.map((p, i) => {
              const v = Number(p[metric]) || 0;
              return (
                <button key={p.date} type="button" className={hover === i ? "on" : ""} aria-label={`${p.date}: ${fmt(v)}`}
                  onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onClick={() => setHover(i)}>
                  <i style={{ height: `${v > 0 ? Math.max(3, (v / top) * 100) : 1}%` }} />
                  {(points.length <= 10 || i % every === 0) && <em>{p.date.slice(5).replace("-", "/")}</em>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

const STATE_TONE = { EARNED: "ok", FAILED: "bad", REFUNDED: "warn", PENDING: "info", UNVERIFIED: "muted" };
const rateText = (o) => (o.commissionType === "PERCENTAGE" ? `${o.commissionValue}%` : o.commissionType === "FIXED" ? `${money(o.commissionValue)} fixed` : "No commission");

function OrdersTable({ orders }) {
  if (!orders.length) return <div className="rf-empty"><span className="e">🧾</span><h3>No transactions</h3><p>Orders made with your code will appear here.</p></div>;
  return (
    <div className="arx-table-wrap acx-orders">
      <table className="arx-table">
        <thead><tr><th>Order</th><th>Date</th><th>Status</th><th className="num">Sale</th><th className="num">Commission</th></tr></thead>
        <tbody>
          {orders.map((o, i) => (
            <tr key={`${o.orderId}-${i}`} data-state={o.state || "UNVERIFIED"}>
              <td className="first"><b>{o.book?.title || "Order"}</b><span className="sub mono">{o.orderId || "—"} · {rateText(o)}</span></td>
              <td data-label="Date" className="date">{stamp(o.eventAt || o.createdAt)}</td>
              <td data-label="Status"><Badge tone={STATE_TONE[o.state] || "muted"}>{titleCase(o.state || o.paymentStatus)}</Badge></td>
              <td data-label="Sale" className="num">{money(o.amount)}{o.discountAmount > 0 && <span className="sub">−{money(o.discountAmount)} coupon</span>}</td>
              <td data-label="Commission" className={cx("num", o.commissionEarned && "earned")}>{o.commissionEarned ? money(o.commissionAmount) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const STATUSES = ["ALL", "EARNED", "PENDING", "FAILED", "REFUNDED", "UNVERIFIED"];
const NO_FILTER = { status: "ALL", startDate: "", endDate: "", sort: "desc" };

function TransactionsSheet({ onClose }) {
  const [draft, setDraft] = useState(NO_FILTER);
  const [applied, setApplied] = useState(NO_FILTER);
  const [page, setPage] = useState(1);
  const [res, setRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError("");
    const params = { page, limit: 15, status: applied.status, sort: applied.sort, ...(applied.startDate ? { startDate: applied.startDate, endDate: applied.endDate } : {}) };
    accountHttp.get("/affiliate/orders", { params })
      .then(({ data }) => { if (alive) setRes(data?.data || null); })
      .catch((e) => { if (alive) setError(errMsg(e)); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [applied, page, tick]);

  const apply = () => {
    if (Boolean(draft.startDate) !== Boolean(draft.endDate)) return toast.error("Pick both dates, or neither.");
    if (draft.startDate && draft.startDate > draft.endDate) return toast.error("The start date must come first.");
    setPage(1); setApplied({ ...draft });
  };
  const t = res?.totals || {};
  const p = res?.pagination || {};
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Sheet title="All transactions" subtitle="Every order made with your code · 15 per page · IST" onClose={onClose} wide>
      <div className="acx acx-stack">
        <div className="acx-filters">
          <label>Status<select className="rv-input" value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>{STATUSES.map((s) => <option key={s} value={s}>{titleCase(s)}</option>)}</select></label>
          <label>Order<select className="rv-input" value={draft.sort} onChange={(e) => setDraft((d) => ({ ...d, sort: e.target.value }))}><option value="desc">Newest first</option><option value="asc">Oldest first</option></select></label>
          <label>From<input className="rv-input" type="date" max={today} value={draft.startDate} onChange={(e) => setDraft((d) => ({ ...d, startDate: e.target.value }))} /></label>
          <label>To<input className="rv-input" type="date" max={today} value={draft.endDate} onChange={(e) => setDraft((d) => ({ ...d, endDate: e.target.value }))} /></label>
        </div>
        <div className="rf-btns">
          <Btn size="sm" onClick={apply}>Apply filters</Btn>
          <Btn variant="ghost" size="sm" onClick={() => { setDraft(NO_FILTER); setApplied(NO_FILTER); setPage(1); }}>Clear</Btn>
        </div>
        {error && <div className="acx-error" role="alert">{error}<Btn variant="ghost" size="sm" onClick={() => setTick((n) => n + 1)}>Retry</Btn></div>}
        <div className="arx-kpis">
          <Kpi icon={ShoppingBag} label="Matching orders" value={count(t.totalOrders)} />
          <Kpi icon={TrendUp} label="Verified sales" value={money(t.successfulAmount)} />
          <Kpi icon={Wallet} label="Commission" value={money(t.earnedCommission)} />
          <Kpi icon={WarningCircle} label="Failed" value={count(t.failedOrders)} />
        </div>
        <div className={cx(loading && "rlx-dim")}>{!res && loading ? <div className="acx-skel" style={{ height: 220 }} /> : <OrdersTable orders={res?.orders || []} />}</div>
        <div className="acx-pagerow">
          <span className="subtle">{count(p.total)} orders · page {p.page || page} of {p.pages || 1}</span>
          <div className="rf-btns">
            <Btn variant="ghost" size="sm" disabled={loading || !p.hasPrevious} onClick={() => setPage((n) => Math.max(1, n - 1))}><CaretLeft size={14} />Previous</Btn>
            <Btn variant="ghost" size="sm" disabled={loading || !p.hasNext} onClick={() => setPage((n) => n + 1)}>Next<CaretRight size={14} /></Btn>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

function SalesTab({ data, patch }) {
  const dash = data.affiliate?.data;
  const [period, setPeriod] = useState("last30Days");
  const [days, setDays] = useState(dash?.graph?.days || 7);
  const [loading, setLoading] = useState(false);
  const [sheet, setSheet] = useState(false);

  const fetchSales = async (d, fresh = false) => {
    setLoading(true);
    try {
      const { data: r } = await accountHttp.get("/users/account/sales", { params: { graphDays: d, ...(fresh ? { fresh: 1 } : {}) } });
      patch((x) => ({ ...x, affiliate: { data: r.data } }));
      setDays(d);
    } catch (e) { toast.error(errMsg(e)); } finally { setLoading(false); }
  };

  if (data.affiliate?.error) return <div className="acx-error" role="alert">{data.affiliate.error}</div>;
  if (!dash) return null;

  const all = dash.summary?.allTime || {};
  const cur = dash.summary?.[period] || {};

  return (
    <div className="acx-stack">
      <div className="arx-kpis">
        <Kpi icon={Wallet} label="Commission earned" value={money(all.earnedCommission)} sub="All time · verified, not refunded" />
        <Kpi icon={TrendUp} label="Verified sales" value={money(all.successfulAmount)} sub={`${count(all.successfulOrders)} successful orders`} />
        <Kpi icon={ShoppingBag} label="All orders" value={count(all.totalOrders)} sub="Every order with your code" />
        <Kpi icon={Percent} label="Success rate" value={`${Number(all.conversionRate || 0).toFixed(1)}%`} sub="Paid ÷ all attempts" />
      </div>

      <Card icon={CalendarBlank} title="By period" caption="Compare sales and earnings across time."
        action={<div className="acx-seg" role="group" aria-label="Period">{PERIODS.map(([k, l]) => <button key={k} type="button" aria-pressed={period === k} onClick={() => setPeriod(k)}>{l}</button>)}</div>}>
        <div className="arx-kpis">
          <Kpi icon={TrendUp} label="Sales" value={money(cur.successfulAmount)} />
          <Kpi icon={Wallet} label="Your commission" value={money(cur.earnedCommission)} />
          <Kpi icon={ShoppingBag} label="Successful orders" value={count(cur.successfulOrders)} />
          <Kpi icon={WarningCircle} label="Failed attempts" value={count(cur.failedOrders)} sub={`${money(cur.failedAttemptedAmount)} attempted`} />
        </div>
        <div className="acx-strip">
          <span>Pending <b>{count(cur.pendingOrders)}</b></span>
          <span>Refunded <b>{count(cur.refundedOrders)}</b></span>
          <span>Total attempts <b>{count(cur.totalOrders)}</b></span>
        </div>
      </Card>

      <SalesChart graph={dash.graph} days={days} loading={loading} onDays={(d) => d !== days && fetchSales(d)} />

      <Card icon={Receipt} title="Recent transactions" caption="Your latest 15 orders. Customer and payment details are never shown."
        action={<Btn variant="ghost" size="sm" onClick={() => setSheet(true)}>All transactions<ArrowRight size={14} /></Btn>}>
        <OrdersTable orders={dash.recentOrders || []} />
      </Card>

      <AffiliateTerms user={data.user} />

      <p className="acx-note">Commission is worked out on the final paid amount after coupons, and counts only verified, non-refunded sales. These are earnings, not payouts. Refunds can change past totals. Updated {ago(dash.generatedAt)}.</p>

      {sheet && <TransactionsSheet onClose={() => setSheet(false)} />}
    </div>
  );
}

/* ------------------------------------------------------------ page */
const TABS = [
  { key: "overview", label: "Overview", icon: User, group: "Account" },
  { key: "sales", label: "Sales", icon: ChartBar, group: "Account", affiliate: true },
  { key: "security", label: "Password", icon: Lock, group: "Security" },
  { key: "devices", label: "Devices", icon: Devices, group: "Security" },
  { key: "activity", label: "Activity", icon: ClockCounterClockwise, group: "Security" },
];
const HEAD = {
  overview: ["Your account", "Your details, account health and what's happened recently."],
  sales: ["Sales dashboard", "Your verified sales, commission and every order made with your code."],
  security: ["Password", "Change the password you use to sign in."],
  devices: ["Devices", "Where you're signed in right now. Sign out anything you don't recognise."],
  activity: ["Activity", "The latest events on your account, in detail."],
};
const readTab = () => { if (typeof window === "undefined") return "overview"; const h = window.location.hash.slice(1); return TABS.some((t) => t.key === h) ? h : "overview"; };

export default function UserProfile() {
  const authUser = useSelector((s) => s.auth?.user);
  const cacheKey = String(authUser?._id || authUser?.id || authUser?.email || "me");
  const { data, error, loading, load, patch } = useAccount(cacheKey);
  const [tab, setTab] = useState(readTab);

  const u = data?.user;
  const tabs = useMemo(() => TABS.filter((t) => !t.affiliate || u?.role === "affiliate"), [u?.role]);
  const active = tabs.some((t) => t.key === tab) ? tab : "overview";
  const go = useCallback((k) => {
    setTab(k);
    try { window.history.replaceState(null, "", `#${k}`); } catch { /* ignore */ }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  useEffect(() => { const on = () => setTab(readTab()); window.addEventListener("hashchange", on); return () => window.removeEventListener("hashchange", on); }, []);

  const [title, sub] = HEAD[active];
  const groups = [...new Set(tabs.map((t) => t.group))];

  return (
    <Page title="My account · Target Trek" description="Your Target Trek profile, security, devices and activity." top={false}>
      <div className="arx rlx acx">
        <div className="arx-layout">
          <aside className="arx-side" aria-label="Account sections">
            {u ? (
              <div className="acx-me"><span className="acx-av">{initials(u.name)}</span><div><b>{u.name}</b><small>{showRole(u.role) ? roleText(u.role) : u.email}</small></div></div>
            ) : <div className="acx-skel" style={{ height: 74 }} />}
            {groups.map((g) => (
              <nav key={g} className="arx-nav">
                <span>{g}</span>
                {tabs.filter((t) => t.group === g).map((t) => (
                  <button key={t.key} type="button" aria-current={active === t.key ? "page" : undefined} onClick={() => go(t.key)}><t.icon size={18} weight={active === t.key ? "fill" : "regular"} />{t.label}{t.key === "devices" && data?.deviceCount > 1 && <em>{data.deviceCount}</em>}</button>
                ))}
              </nav>
            ))}
            <div className="arx-foot">
              <a href="mailto:supporttargettrek@gmail.com"><Envelope size={14} />Contact support</a>
              {u?.role === "admin" && <Link to="/dashboard"><SquaresFour size={14} />Admin dashboard</Link>}
            </div>
          </aside>

          <main className="arx-main">
            <div className="acx-body">
              {!data && loading ? <Skeleton /> : !data ? (
                <div className="rf-empty"><span className="e">⚠️</span><h3>We couldn't load your account</h3><p>{error || "Please try again."}</p><Btn onClick={() => load()}><ArrowsClockwise size={16} />Try again</Btn></div>
              ) : (
                <div className="acx-stack">
                  {active === "overview" && <header className="acx-hero">
                    <div className="who">
                      <span className="acx-av lg">{initials(u.name)}</span>
                      <div>
                        <div className="acx-badges">{showRole(u.role) && <Badge tone="brand">{roleText(u.role)}</Badge>}<StatusBadge status={u.status} />{u.emailVerifiedAt && <Badge tone="ok"><CheckCircle size={12} weight="fill" />Verified</Badge>}{u.googleLinked && <Badge tone="info"><GoogleLogo size={12} weight="bold" />Google</Badge>}</div>
                        <h1>{u.name}</h1>
                        <ul className="acx-contact">
                          <li><Envelope size={16} weight="bold" aria-label="Email" /><span>{u.email}</span></li>
                          {phoneText(u) && <li><Phone size={16} weight="bold" aria-label="Phone" /><span>{phoneText(u)}</span></li>}
                        </ul>
                      </div>
                    </div>
                    <div className="acx-since" title={`Joined ${day(u.createdAt)}`}>
                      <CalendarBlank size={18} weight="fill" aria-hidden />
                      <div>
                        <small>{sinceText(u.createdAt) === "Today" ? "Welcome" : "Member for"}</small>
                        <b>{sinceText(u.createdAt) === "Today" ? "Joined today" : sinceText(u.createdAt)}</b>
                      </div>
                    </div>
                  </header>}

                  <div className="arx-head" style={{ margin: "6px 0 0" }}>
                    <div><h2 style={{ fontFamily: "var(--rl-display)", fontSize: "clamp(20px, 2.6vw, 26px)", letterSpacing: "-.02em" }}>{title}</h2><p>{sub}</p></div>
                  </div>

                  {error && <div className="acx-error" role="alert">{error}<Btn variant="ghost" size="sm" onClick={() => load()}>Retry</Btn></div>}

                  {active === "overview" && <Overview data={data} go={go} />}
                  {active === "sales" && <SalesTab data={data} patch={patch} />}
                  {active === "security" && <SecurityTab data={data} />}
                  {active === "devices" && <DevicesTab data={data} patch={patch} />}
                  {active === "activity" && <ActivityTab data={data} />}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* phones and tablets: icon-only tab bar fixed to the bottom, like the mobile app */}
        <nav className="acx-tabbar" aria-label="Account sections" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((t) => (
            <button key={t.key} type="button" aria-label={t.label} title={t.label} aria-current={active === t.key ? "page" : undefined} onClick={() => go(t.key)}>
              <t.icon size={24} weight={active === t.key ? "fill" : "regular"} aria-hidden />
              {t.key === "devices" && data?.deviceCount > 1 && <em>{data.deviceCount}</em>}
            </button>
          ))}
        </nav>
      </div>
    </Page>
  );
}

/* shared with the admin user console (Admin/UserManagement.jsx) so both screens look and read the same */
export {
  money, count, day, stamp, ago, sinceText, initials, phoneText, titleCase, copy, eventInfo,
  Kpi, Card, Row, StatusBadge, deviceIcon, ActivityItem, SalesChart, OrdersTable, STATE_TONE,
};
