import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, ArrowSquareOut, Briefcase, Buildings, CheckCircle, Clock, MagnifyingGlass, MapPin, PaperPlaneTilt, X } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { getMember, getProfile, searchCompanies, searchDirectory, sendRequest } from "./api";
import { Btn, Skeleton, cx } from "../resume/ui";
import { Avatar, Empty, LoadMore, PageHead, ResumeBoost, ResumeUpload, Sheet, TextField, Vip, focusFirstError } from "./ui";
import { useInfinite } from "./useInfinite";
import { useRef_ } from "./RefContext";

const B = "/referral/app";
const yrs = (n) => `${n} yr${Number(n) === 1 ? "" : "s"}`;
const LINKEDIN = /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\/\S+/i;
const HTTP = /^https?:\/\/\S+$/i;
const EXP = [["", "", "Any"], ["0", "2", "0–2 yrs"], ["3", "5", "3–5 yrs"], ["6", "10", "6–10 yrs"], ["10", "", "10+ yrs"]];

/* ------------------------------------------------------------ a referrer in the results */
function MemberCard({ m }) {
  const asked = m.requested;
  return (
    <article className="rf-card lift rf-member">
      <div className="top">
        <Avatar person={m} size={48} ring={m.priority} />
        <div>
          <div className="who">{m.name}<Vip show={m.priority} /></div>
          <div className="co"><Buildings size={14} aria-hidden /><b>{m.company}</b></div>
        </div>
      </div>
      <div className="rf-tags">
        {m.role && <span className="rf-tag"><Briefcase size={12} aria-hidden />{m.role}</span>}
        <span className="rf-tag"><Clock size={12} aria-hidden />{yrs(m.yearsExp)}</span>
        {m.location && <span className="rf-tag"><MapPin size={12} aria-hidden />{m.location}</span>}
      </div>
      {m.headline && <p className="headline rf-clamp">{m.headline}</p>}
      {m.bio && <p className="bio rf-clamp">{m.bio}</p>}
      <div className="foot">
        {asked
          ? <Btn as={Link} to={`${B}/inbox`} variant="ghost" size="sm"><CheckCircle size={15} weight="fill" aria-hidden />{asked === "accepted" ? "Chat open" : "Request sent"}</Btn>
          : <Btn as={Link} to={`${B}/find/${m.id}?ask=1`} size="sm"><PaperPlaneTilt size={15} weight="bold" aria-hidden />Ask</Btn>}
        <Btn as={Link} to={`${B}/find/${m.id}`} variant="ghost" size="sm">Profile</Btn>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------ search */
function Search() {
  const [q, setQ] = useState("");
  const [exp, setExp] = useState(0);
  const [chips, setChips] = useState([]);
  const [min, max] = EXP[exp];
  const [term, setTerm] = useState("");
  useEffect(() => { const t = setTimeout(() => setTerm(q.trim()), 250); return () => clearTimeout(t); }, [q]); // wait for a pause in typing: one request, not one per key
  const list = useInfinite((page) => searchDirectory({ q: term, minExp: min, maxExp: max, page, limit: 12 }), [term, min, max]);
  useEffect(() => { searchCompanies("").then((d) => setChips(d.items)).catch(() => {}); }, []);
  const pickCompany = (c) => setQ(q.toLowerCase() === c.company.toLowerCase() ? "" : c.company);
  return (
    <div>
      <PageHead eyebrow="🔎 Find referrers" title="Who works where you want to?" sub="Search a company, role or skill. Everyone here can refer you." />
      <form className="rf-searchbar" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="rf-qwrap">
          <MagnifyingGlass size={19} aria-hidden />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try Google, SDE-2 or React" aria-label="Search by company, role or skill" enterKeyHint="search" autoComplete="off" />
          {q && <button type="button" className="x" onClick={() => setQ("")} aria-label="Clear search"><X size={16} weight="bold" aria-hidden /></button>}
        </div>
        <div className="rf-filter"><span>Experience</span>
          <div className="rf-chips" role="group" aria-label="Years of experience">{EXP.map(([, , label], i) => <button key={label} type="button" aria-pressed={exp === i} onClick={() => setExp(i)}>{label}</button>)}</div>
        </div>
      </form>

      {chips.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <p className="rf-label" style={{ marginBottom: 8 }}>🏢 Popular companies</p>
          <div className="rf-chips" role="group" aria-label="Popular companies">{chips.map((c) => <button key={c.key} type="button" aria-pressed={q.toLowerCase() === c.company.toLowerCase()} onClick={() => pickCompany(c)}>{c.company}<em>{c.members}</em></button>)}</div>
        </div>
      )}

      <div className="rf-count" aria-live="polite">{list.items ? <span><b>{list.total}</b> referrer{list.total === 1 ? "" : "s"}{term ? <> for “{term}”</> : ""}</span> : <span>Searching…</span>}</div>
      {list.items === null && !list.error && <div className="rf-grid c3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} h={250} style={{ borderRadius: 16 }} />)}</div>}
      {list.items?.length === 0 && <Empty emoji="🧭" title="No referrers found" action={<Btn as={Link} to={`${B}/board`} variant="ghost">Browse the job board</Btn>}>Try another company or role. Or widen the experience range.</Empty>}
      {list.items?.length > 0 && <div className="rf-grid c3">{list.items.map((m) => <MemberCard key={m.id} m={m} />)}</div>}
      <LoadMore list={list} noun="referrer" />
      <div className="rf-block"><ResumeBoost /></div>
    </div>
  );
}

/* ------------------------------------------------------------ the request: five short steps */
const blank = { jobTitle: "", jobId: "", jobLink: "", message: "", currentRole: "", currentCompany: "", yearsExp: "", noticePeriod: "", linkedin: "", portfolio: "" };
const STEPS = [
  ["job", "💼", "The job", ["jobTitle", "jobId", "jobLink"]],
  ["you", "🙋", "About you", ["currentRole", "currentCompany", "yearsExp", "noticePeriod", "linkedin", "portfolio"]],
  ["note", "✍️", "Your note", ["message"]],
  ["resume", "📄", "Resume", ["resume"]],
  ["send", "🚀", "Review", []],
];
const rules = (f, file, useSaved) => {
  const e = {};
  if (!f.jobId.trim() && !f.jobLink.trim()) { e.jobId = "Add the job ID or the job link"; e.jobLink = "Add the job link or the job ID"; }
  else if (f.jobLink.trim() && !HTTP.test(f.jobLink.trim())) e.jobLink = "Enter a full link starting with https://";
  if (f.message.trim().length < 20) e.message = f.message.trim() ? "Write a little more (at least 20 characters)" : "Write a short note to the referrer";
  if (f.currentRole.trim().length < 2) e.currentRole = "Enter your current role (or Student / Fresher)";
  if (f.yearsExp === "" || Number.isNaN(Number(f.yearsExp)) || Number(f.yearsExp) < 0 || Number(f.yearsExp) > 60) e.yearsExp = "Enter your years of experience (0 if fresher)";
  if (!f.linkedin.trim()) e.linkedin = "Your LinkedIn link is required";
  else if (!LINKEDIN.test(f.linkedin.trim())) e.linkedin = "Use a link like https://linkedin.com/in/your-name";
  if (f.portfolio.trim() && !HTTP.test(f.portfolio.trim())) e.portfolio = "Enter a full link starting with https://";
  if (!useSaved && !file?.key) e.resume = "Attach your resume (PDF or Word)";
  return e;
};
const IDEAS = [
  ["👋 Intro", "Hi! I'm applying for this role and would love a referral. "],
  ["🛠️ Skills", "I have experience with … and recently built … "],
  ["🎯 Why this team", "I'm excited about this team because … "],
  ["🙏 Thanks", "Thank you for your time. Happy to share anything else you need."],
];

export function AskForm({ member, post, onClose, onSent }) {
  const [mine, setMine] = useState(null);
  const [f, setF] = useState({ ...blank, jobTitle: post?.title || "", jobLink: post?.applyLink || "" });
  const [file, setFile] = useState(null);
  const [useSaved, setUseSaved] = useState(false);
  const [saveResume, setSaveResume] = useState(true);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [seen, setSeen] = useState(0); // the furthest step reached: errors show only for steps already visited
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useEffect(() => {
    getProfile().then(({ profile: p }) => {
      setMine(p || false);
      if (p) { setUseSaved(Boolean(p.resume)); setF((x) => ({ ...x, currentRole: p.role || "", currentCompany: p.company || "", yearsExp: String(p.yearsExp ?? ""), linkedin: p.linkedin || "" })); }
    }).catch(() => setMine(false));
  }, []);
  const all = useMemo(() => rules(f, file, useSaved), [f, file, useSaved]);
  const shown = (k) => (STEPS.findIndex((s) => s[3].includes(k)) < seen ? all[k] : ""); // steps already passed check live
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); if (errors[k]) setErrors((x) => ({ ...x, [k]: "" })); };
  const stepErrors = (i) => Object.fromEntries(STEPS[i][3].filter((k) => all[k]).map((k) => [k, all[k]]));
  const next = () => {
    const bad = stepErrors(step);
    if (Object.keys(bad).length) { setErrors((x) => ({ ...x, ...bad })); toast.error("Please fix the fields marked in red."); return focusFirstError(bad); }
    const n = Math.min(STEPS.length - 1, step + 1);
    setStep(n); setSeen((s) => Math.max(s, n));
  };
  const jump = (i) => { if (i <= seen) setStep(i); };
  const submit = async (e) => {
    e?.preventDefault();
    if (step < STEPS.length - 1) return next();
    const firstBad = STEPS.findIndex((s, i) => Object.keys(stepErrors(i)).length);
    if (firstBad >= 0) { setStep(firstBad); setErrors(stepErrors(firstBad)); toast.error("One step still needs attention."); return; }
    setBusy(true); setErr("");
    try {
      const r = await sendRequest({
        ...(post ? { postId: post.id } : { profileId: member.id }),
        jobTitle: f.jobTitle, jobId: f.jobId, jobLink: f.jobLink, message: f.message,
        info: { currentRole: f.currentRole, currentCompany: f.currentCompany, yearsExp: Number(f.yearsExp), noticePeriod: f.noticePeriod, linkedin: f.linkedin, portfolio: f.portfolio },
        ...(useSaved ? { useSavedResume: true } : { resume: file, saveResume }),
      });
      toast.success("Request sent 🚀 You'll hear back here.");
      onSent(r.id);
    } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  const tf = (k, label, props = {}) => <TextField id={`f-${k}`} label={label} value={f[k]} onChange={set(k)} error={errors[k] || shown(k)} className={!all[k] && f[k] ? "good" : ""} {...props} />;
  const who = member.anonymous ? "this member" : member.name.split(" ")[0];
  const [, e, title] = STEPS[step];
  const pct = Math.round(((step + 1) / STEPS.length) * 100);
  return (
    <Sheet wide title={`Ask ${who} for a referral`} subtitle="Five short steps. They see everything before they accept." onClose={onClose}>
      <form className="rf-wiz" onSubmit={submit} noValidate>
        <div className="rf-ask-head"><Avatar person={member} size={44} /><div><b>{member.name}<Vip show={member.priority} /></b><span>{[member.role, member.company].filter(Boolean).join(" at ")}</span></div></div>
        <div className="rf-progress" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
          <ol style={{ "--n": STEPS.length }}>{STEPS.map(([k, , label], i) => <li key={k} className={cx(i < step && "done", i === step && "now")}><i role="button" tabIndex={i <= seen ? 0 : -1} aria-label={`Go to ${label}`} onClick={() => jump(i)} onKeyDown={(ev) => ev.key === "Enter" && jump(i)} style={{ cursor: i <= seen ? "pointer" : "default" }}>{i < step ? "✓" : i + 1}</i><span>{label}</span></li>)}</ol>
          <div className="rf-bar" aria-hidden><i style={{ width: `${pct}%` }} /></div>
        </div>
        {mine === false && step === 1 && <p className="rf-banner"><span className="e" aria-hidden>💡</span><span>Tip: <Link to={`${B}/profile`} className="rl-textlink" onClick={onClose}>fill in your profile</Link> and these fields fill themselves next time.</span></p>}

        <div className="rf-stepbody" key={step}>
          <h3><span aria-hidden>{e}</span>{title}</h3>
          {step === 0 && (<>
            <div className="rf-two">
              {tf("jobTitle", "Job title", { optional: true, placeholder: "SDE-1", maxLength: 140 })}
              {tf("jobId", "Job ID", { placeholder: "R-12345", maxLength: 80 })}
            </div>
            {tf("jobLink", "Job link", { type: "url", inputMode: "url", maxLength: 500, placeholder: "https://careers.company.com/job/…", hint: "Add the job ID, the link, or both." })}
          </>)}
          {step === 1 && (<>
            <div className="rf-two">
              {tf("currentRole", "Current role", { required: true, maxLength: 100, placeholder: "SDE-1, Student, Fresher…" })}
              {tf("currentCompany", "Current company", { optional: true, maxLength: 100 })}
              {tf("yearsExp", "Years of experience", { required: true, type: "number", inputMode: "decimal", min: 0, max: 60, step: "0.5", placeholder: "2" })}
              {tf("noticePeriod", "Notice period", { optional: true, maxLength: 40, placeholder: "30 days" })}
            </div>
            {tf("linkedin", "LinkedIn profile", { required: true, type: "url", inputMode: "url", maxLength: 200, placeholder: "https://linkedin.com/in/your-name", hint: "Referrers check this before they accept." })}
            {tf("portfolio", "Portfolio or GitHub", { optional: true, type: "url", inputMode: "url", maxLength: 500, placeholder: "https://github.com/you" })}
          </>)}
          {step === 2 && (<>
            <div><p className="rf-label" style={{ marginBottom: 8 }}>Tap to add a starter line</p><div className="rf-ideas">{IDEAS.map(([l, t]) => <button key={l} type="button" onClick={() => setF((x) => ({ ...x, message: (x.message ? `${x.message.trimEnd()} ` : "") + t }))}>{l}</button>)}</div></div>
            {tf("message", "Why are you a good fit?", { required: true, textarea: true, rows: 6, count: 1500, placeholder: "Two or three lines: what you do, what you built, why this role." })}
          </>)}
          {step === 3 && (<>
            {mine?.resume && <div className="rf-seg block" role="group" aria-label="Which resume"><button type="button" aria-pressed={useSaved} onClick={() => setUseSaved(true)}>📎 Saved resume</button><button type="button" aria-pressed={!useSaved} onClick={() => setUseSaved(false)}>⬆️ Upload new</button></div>}
            {useSaved && mine?.resume
              ? <div className="rf-file has"><CheckCircle size={26} weight="duotone" color="var(--rv-ok)" aria-hidden /><span><b>{mine.resume.filename}</b><small>From your profile</small></span></div>
              : <div id="f-resume" tabIndex={-1} className={errors.resume ? "rf-dropbad" : ""}>
                  <ResumeUpload value={file} onChange={(v) => { setFile(v); setErrors((x) => ({ ...x, resume: "" })); }} />
                  {errors.resume && <p role="alert" className="rv-err">{errors.resume}</p>}
                  {file?.key && <label className="rf-check" style={{ marginTop: 10 }}><input type="checkbox" checked={saveResume} onChange={(ev) => setSaveResume(ev.target.checked)} />Save it to my profile for next time</label>}
                </div>}
            <ResumeBoost />
          </>)}
          {step === 4 && (
            <div className="rf-review">
              <div><span className="rf-label">💼 Job</span><b>{f.jobTitle || "Role"}{f.jobId ? ` · ${f.jobId}` : ""}</b>{f.jobLink && <span className="rf-xs" style={{ overflowWrap: "anywhere" }}>{f.jobLink}</span>}<button type="button" onClick={() => setStep(0)}>Edit</button></div>
              <div><span className="rf-label">🙋 You</span><b>{f.currentRole}{f.currentCompany ? ` at ${f.currentCompany}` : ""} · {f.yearsExp} yrs</b><span className="rf-xs" style={{ overflowWrap: "anywhere" }}>{f.linkedin}</span><button type="button" onClick={() => setStep(1)}>Edit</button></div>
              <div><span className="rf-label">✍️ Note</span><p className="rf-muted rf-clamp c3" style={{ whiteSpace: "pre-line" }}>{f.message}</p><button type="button" onClick={() => setStep(2)}>Edit</button></div>
              <div><span className="rf-label">📄 Resume</span><b>{useSaved ? mine?.resume?.filename : file?.filename || "—"}</b><button type="button" onClick={() => setStep(3)}>Edit</button></div>
            </div>
          )}
        </div>

        {err && <p role="alert" className="rv-err">{err}</p>}
        <div className="rf-wizfoot rf-sticky">
          {step > 0 ? <Btn variant="ghost" onClick={() => setStep(step - 1)}>Back</Btn> : <Btn variant="ghost" onClick={onClose}>Cancel</Btn>}
          {step < STEPS.length - 1
            ? <Btn type="submit">Next <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
            : <Btn type="submit" loading={busy}><PaperPlaneTilt size={17} weight="bold" aria-hidden />Send request</Btn>}
        </div>
      </form>
    </Sheet>
  );
}

/* ------------------------------------------------------------ one referrer */
function Member({ id }) {
  const nav = useNavigate();
  const { summary } = useRef_();
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [ask, setAsk] = useState(null);
  useEffect(() => { setD(null); setError(""); getMember(id).then((x) => { setD(x); if (new URLSearchParams(window.location.search).get("ask") === "1" && !x.member.self && !x.member.requested) setAsk({}); }).catch((e) => setError(errMsg(e))); }, [id]);
  const back = { to: `${B}/find`, label: "All referrers" };
  if (error) return <div><PageHead back={back} title="Not available" /><p role="alert" className="rf-banner bad">{error}</p></div>;
  if (!d) return <div><Skeleton h={18} style={{ width: 120, marginBottom: 14 }} /><Skeleton h={360} style={{ borderRadius: 16 }} /></div>;
  const m = d.member;
  const cta = m.self
    ? <p className="rf-banner"><span className="e" aria-hidden>👀</span><span>This is how others see your profile.</span></p>
    : m.requested
      ? <Btn as={Link} to={`${B}/inbox`} size="lg" variant="ghost"><CheckCircle size={17} weight="fill" aria-hidden />{m.requested === "accepted" ? "Open your chat" : "Request sent · see status"}</Btn>
      : summary && !summary.enabled
        ? <p className="rf-banner warn"><span className="e" aria-hidden>⏸️</span><span>Referrals are paused right now.</span></p>
        : <Btn size="lg" onClick={() => setAsk({})}><PaperPlaneTilt size={18} weight="bold" aria-hidden />Ask for a referral</Btn>;
  return (
    <div>
      <Link to={back.to} className="rf-back">← {back.label}</Link>
      <article className="rf-card rf-profilecard">
        <div className="rf-cover" aria-hidden />
        <div className="rf-profilebody">
          <Avatar person={m} ring={m.priority} />
          <div style={{ display: "grid", gap: 6 }}>
            <h1 className="rf-h1" style={{ fontSize: "clamp(24px, 3.4vw, 32px)" }}>{m.name}<Vip show={m.priority} /></h1>
            <p className="rf-muted" style={{ fontSize: 15 }}>{m.role} at <b style={{ color: "var(--rv-text)" }}>{m.company}</b></p>
            {m.headline && <p style={{ fontWeight: 600, lineHeight: 1.5 }}>{m.headline}</p>}
          </div>
          <ul className="rf-facts">
            <li><span>🏢 Company</span><b>{m.company}</b></li>
            <li><span>💼 Role</span><b>{m.role || "–"}</b></li>
            <li><span>⏳ Experience</span><b>{yrs(m.yearsExp)}</b></li>
            <li><span>📍 Location</span><b>{m.location || "–"}</b></li>
          </ul>
          {m.bio && <div style={{ display: "grid", gap: 6 }}><h2 className="rf-label">About</h2><p className="rf-prose">{m.bio}</p></div>}
          {m.anonymous && <p className="rf-xs">🕶️ This member keeps their name private.</p>}
          <div className="rf-stickycta">{cta}</div>
        </div>
      </article>

      {d.posts.length > 0 && (
        <section className="rf-block">
          <div className="rf-bhead"><h2 className="rf-h2">📌 Their posts</h2></div>
          <div className="rf-grid c2">{d.posts.map((p) => (
            <article key={p.id} className="rf-card lift rf-post">
              <div className="top"><span className={cx("rf-kind", p.kind)}>{p.kind === "hiring" ? "🧑‍💼 Hiring" : "🤝 Can refer"}</span></div>
              <h3><Link to={`${B}/board/${p.id}`}>{p.title}</Link></h3>
              {p.roles.length > 0 && <div className="rf-tags">{p.roles.map((r) => <span key={r} className="rf-tag">{r}</span>)}</div>}
              <div className="rf-btns">
                {!m.self && !m.requested && <Btn size="sm" onClick={() => setAsk({ post: p })}>Ask for this role</Btn>}
                <Btn as={Link} to={`${B}/board/${p.id}`} size="sm" variant="ghost">Details</Btn>
                {p.applyLink && <Btn as="a" href={p.applyLink} target="_blank" rel="noopener noreferrer nofollow" size="sm" variant="ghost"><ArrowSquareOut size={14} aria-hidden />Apply</Btn>}
              </div>
            </article>))}</div>
        </section>
      )}
      <div className="rf-block"><ResumeBoost /></div>
      {ask && <AskForm member={m} post={ask.post} onClose={() => setAsk(null)} onSent={(rid) => nav(`${B}/inbox/${rid}`)} />}
    </div>
  );
}

export default function Directory() {
  const { id } = useParams();
  return id ? <Member id={id} /> : <Search />;
}

