import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Briefcase, Buildings, Clock, FloppyDisk, MapPin } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { getProfile, saveProfile } from "./api";
import { Btn, Skeleton } from "../resume/ui";
import { Avatar, Ico, PageHead, Switch, TextField, Vip, focusFirstError } from "./ui";
import { useRef_ } from "./RefContext";

const B = "/referral/app";
const blank = { displayName: "", headline: "", company: "", role: "", yearsExp: "", location: "", bio: "", canRefer: false, hideName: false };

/* one rule per required field; the message shows under the field and the field turns red */
const RULES = {
  displayName: (v) => (v.trim().length < 2 ? "Enter your name" : ""),
  company: (v) => (v.trim().length < 2 ? "Enter your company" : ""),
  role: (v) => (v.trim().length < 2 ? "Enter your role" : ""),
  yearsExp: (v) => (v === "" || Number.isNaN(Number(v)) ? "Enter your years of experience" : Number(v) < 0 || Number(v) > 60 ? "Enter a number from 0 to 60" : ""),
  location: (v) => (v.trim().length < 2 ? "Enter your location" : ""),
};
const check = (f) => Object.fromEntries(Object.entries(RULES).map(([k, fn]) => [k, fn(String(f[k] ?? ""))]).filter(([, m]) => m));
const initialsOf = (n) => String(n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

/* what others see in search, updated as you type */
function Preview({ f, priority }) {
  const name = f.hideName ? "Anonymous" : f.displayName || "Your name";
  return (
    <aside className="rf-preview" aria-label="Preview of your card">
      <p className="rf-label" style={{ marginBottom: 8 }}>👀 How others see you</p>
      <article className="rf-card rf-member">
        <div className="top"><Avatar person={{ name, initials: initialsOf(name), anonymous: f.hideName }} size={48} ring={priority} /><div><div className="who">{name}<Vip show={priority} /></div><div className="co"><Buildings size={14} aria-hidden /><b>{f.company || "Your company"}</b></div></div></div>
        <div className="rf-tags">
          <span className="rf-tag"><Briefcase size={12} aria-hidden />{f.role || "Your role"}</span>
          <span className="rf-tag"><Clock size={12} aria-hidden />{f.yearsExp || 0} yrs</span>
          {f.location && <span className="rf-tag"><MapPin size={12} aria-hidden />{f.location}</span>}
        </div>
        {f.headline && <p className="headline rf-clamp">{f.headline}</p>}
        {f.bio && <p className="bio rf-clamp">{f.bio}</p>}
        <div className="foot"><span className={`rf-badge ${f.canRefer ? "ok" : "muted"}`}>{f.canRefer ? "✅ Shows in search" : "🙈 Hidden from search"}</span></div>
      </article>
      {!f.canRefer && <p className="rf-xs" style={{ marginTop: 10 }}>Turn on “I can refer” to appear in search. You can still ask for referrals either way.</p>}
    </aside>
  );
}

export default function Profile() {
  const { refresh, summary } = useRef_();
  const [f, setF] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    getProfile().then(({ profile: p, suggestedName }) => {
      const v = p ? { ...blank, ...p, yearsExp: String(p.yearsExp ?? "") } : { ...blank, displayName: suggestedName || "" };
      setF(v); setSaved(JSON.stringify(v));
      setStatus(p && p.status !== "active" ? p : null);
    }).catch((e) => setError(errMsg(e)));
  }, []);
  const set = (k) => (e) => { const v = e?.target ? e.target.value : e; setF((x) => ({ ...x, [k]: v })); if (errors[k]) setErrors((x) => ({ ...x, [k]: RULES[k]?.(String(v)) || "" })); };
  const blur = (k) => () => RULES[k] && setErrors((x) => ({ ...x, [k]: RULES[k](String(f[k] ?? "")) }));

  const submit = async (e) => {
    e.preventDefault();
    const bad = check(f);
    setErrors(bad);
    if (Object.keys(bad).length) { toast.error("Please fix the fields marked in red."); return focusFirstError(bad); }
    setBusy(true); setError("");
    try {
      const { profile: p } = await saveProfile({ ...f, yearsExp: Number(f.yearsExp) });
      const v = { ...blank, ...p, yearsExp: String(p.yearsExp ?? "") };
      setF(v); setSaved(JSON.stringify(v));
      toast.success(p.canRefer ? "Saved ✅ You now show up in search." : "Profile saved ✅");
      refresh();
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  if (!f) return error ? <p role="alert" className="rf-banner bad">{error}</p> : <Skeleton h={480} style={{ borderRadius: 16 }} />;
  const tf = (k, label, props = {}) => <TextField id={`f-${k}`} label={label} value={f[k]} onChange={set(k)} onBlur={blur(k)} error={errors[k]} required={Boolean(RULES[k])} {...props} />;
  const done = ["displayName", "company", "role", "yearsExp", "location", "headline", "bio"].filter((k) => String(f[k] ?? "").trim()).length;
  const pct = Math.round((done / 7) * 100);
  const dirty = JSON.stringify(f) !== saved;
  return (
    <form onSubmit={submit} noValidate>
      <PageHead eyebrow="🪪 Your profile" title="Where do you work?" sub="Members see this when they search your company. Fields with * are needed." />
      {status && <p className="rf-banner bad" role="alert" style={{ marginBottom: 16 }}><span className="e" aria-hidden>⛔</span><span>Your profile is {status.status}{status.statusReason ? `: ${status.statusReason}` : ""}. It doesn't show in search.</span></p>}
      {error && <p role="alert" className="rv-err">{error}</p>}

      <div className="rf-profile-grid">
        <div className="rf-form">
          <div className="rf-card rf-meter">
            <div className="rf-row-between"><b>Profile strength</b><span className="rf-mono rf-muted">{pct}%</span></div>
            <div className="rf-bar" aria-hidden><i style={{ width: `${pct}%` }} /></div>
            <span className="rf-xs">{pct < 100 ? "A headline and a short “about” help people trust you." : "🌟 Looking great."}</span>
          </div>

          <section className="rf-card rf-formcard" aria-labelledby="p1">
            <header><Ico e="💼" tone="sky" /><div><h2 id="p1" className="rf-h2">Your job</h2><p>Where you work today.</p></div></header>
            <div className="rf-two">
              {tf("displayName", "Your name", { autoComplete: "name", maxLength: 80, placeholder: "Aarav Kumar" })}
              {tf("company", "Company", { placeholder: "Google, Flipkart, TCS…", maxLength: 100, autoComplete: "organization" })}
              {tf("role", "Role", { placeholder: "SDE-2, Product Manager…", maxLength: 100, autoComplete: "organization-title" })}
              {tf("yearsExp", "Years of experience", { type: "number", inputMode: "decimal", min: 0, max: 60, step: "0.5", placeholder: "4" })}
              {tf("location", "City", { placeholder: "Bengaluru", maxLength: 80, autoComplete: "address-level2" })}
            </div>
          </section>

          <section className="rf-card rf-formcard" aria-labelledby="p2">
            <header><Ico e="✍️" tone="amber" /><div><h2 id="p2" className="rf-h2">About you</h2><p>Optional, but it builds trust.</p></div></header>
            {tf("headline", "Headline", { optional: true, required: false, placeholder: "Backend engineer · Java, Spring, system design", count: 120, hint: "Shown under your name." })}
            {tf("bio", "About you", { optional: true, required: false, textarea: true, rows: 4, count: 600, placeholder: "Who do you like to refer? What do you look for in a resume?" })}
          </section>

          <section className="rf-card rf-formcard" aria-labelledby="p3">
            <header><Ico e="🔒" tone="violet" /><div><h2 id="p3" className="rf-h2">Referrals and privacy</h2><p>You decide on every request.</p></div></header>
            <Switch checked={f.canRefer} onChange={set("canRefer")} title="🤝 I can refer people at my company" hint="You appear when people search your company. Giving referrals is always free." />
            <Switch checked={f.hideName} onChange={set("hideName")} title="🕶️ Hide my name" hint="Others see “Anonymous” with your company, role and experience." />
            <p className="rf-xs">You never need to share a resume or LinkedIn to give referrals. Only people who ask share those.</p>
          </section>

          <div className="rf-btns rf-sticky rf-savebar">
            <Btn type="submit" size="lg" loading={busy} disabled={!dirty && !busy}><FloppyDisk size={18} weight="bold" aria-hidden />{dirty ? "Save profile" : "Saved"}</Btn>
            {f.canRefer && f.id && <Btn as={Link} to={`${B}/find/${f.id}`} variant="ghost" size="lg">View my public card</Btn>}
          </div>
        </div>
        <Preview f={f} priority={summary?.access?.priority} />
      </div>
    </form>
  );
}
