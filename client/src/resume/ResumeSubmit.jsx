import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Brain, Briefcase, CalendarBlank, Check, FilePdf, GraduationCap, LinkedinLogo, Lock, MagicWand, Trash, UploadSimple, UserCircle } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { daysLeft, getPlan, myRequests, submitRequest, uploadDocument } from "./api";
import { Btn, Field, Skeleton, cx } from "./ui";
import { checkJobDescription } from "./jdCheck";

const LINKEDIN_RE = /^https?:\/\/([a-z0-9-]+\.)?linkedin\.com\/(in|pub|profile)\/\S+$/i;
const MAX_MB = 10;

export function Dropzone({ file, progress, uploading, onPick, onClear }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  if (file) {
    return (
      <div className="rv-drop has rl-file">
        <span className="rl-file-ico"><FilePdf size={26} weight="duotone" aria-hidden /></span>
        <div className="rl-file-main">
          <p className="rl-file-name">{file.filename}</p>
          {uploading
            ? <div style={{ marginTop: 8 }} role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}><div className="rv-bar"><i style={{ width: `${Math.round(progress * 100)}%` }} /></div><p className="rv-hint">Uploading… {Math.round(progress * 100)}%</p></div>
            : <p className="rv-hint" style={{ marginTop: 2, display: "flex", alignItems: "center", gap: 4, color: "var(--rv-ok)" }}><Check size={13} weight="bold" aria-hidden />Uploaded · {(file.size / 1024 / 1024).toFixed(2)} MB</p>}
        </div>
        {!uploading && <button type="button" className="rv-btn rv-btn-ghost rv-btn-sm" onClick={onClear} aria-label="Remove file"><Trash size={16} aria-hidden /></button>}
      </div>
    );
  }
  return (
    <div className={cx("rv-drop", over && "over")} role="button" tabIndex={0} aria-label="Upload your resume as a PDF"
      onClick={() => input.current?.click()} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.click(); } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onPick(f); }}>
      <input ref={input} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = ""; }} />
      <span className="rv-drop-ico"><UploadSimple size={28} weight="bold" aria-hidden /></span>
      <p className="rl-drop-t">{over ? "Drop it here" : "Drag your resume here"}</p>
      <p className="rl-drop-s">or <span>browse files</span></p>
      <p className="rv-chips"><span>PDF only</span><span>Up to {MAX_MB} MB</span><span>Text-based, not a scan</span></p>
    </div>
  );
}

/* Step two: the plan is paid, now the details and the resume. */
export default function ResumeSubmit() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [kind, setKind] = useState("professional");
  const [f, setF] = useState({ currentRole: "", experienceYears: "", organization: "", course: "", targetRole: "", linkedinUrl: "", jobDescription: "", notes: "" });
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [human, setHuman] = useState(false);
  const [linkedin, setLinkedin] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  // someone who has sent in a resume before: reuse the same details, still editable
  useEffect(() => {
    let live = true;
    myRequests().then((rows) => {
      const last = rows?.find((r) => r.profile?.organization);
      if (!live || !last) return;
      const pr = last.profile;
      setKind(pr.kind === "student" ? "student" : "professional");
      setF((s) => ({
        ...s,
        currentRole: pr.currentRole || "", experienceYears: pr.kind === "professional" && pr.experienceYears != null ? String(pr.experienceYears) : "",
        organization: pr.organization || "", course: pr.course || "", targetRole: pr.targetRole || "", linkedinUrl: last.linkedinUrl || "",
      }));
      setPrefilled(true);
    }).catch(() => {});
    return () => { live = false; };
  }, []);
  useEffect(() => { getPlan(purchaseId).then(setPlan).catch((e) => setLoadError(errMsg(e))); }, [purchaseId]);
  const set = (k) => (e) => { setF((s) => ({ ...s, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  if (loadError) return <div className="rls-state" role="alert"><h1 className="rls-h2">We couldn't open this plan</h1><p>{loadError}</p><Btn as={Link} to="/resume-review/app" variant="ghost">Back to my space</Btn></div>;
  if (!plan) return <div className="rls-loading"><Skeleton h={180} style={{ borderRadius: 22 }} /><Skeleton h={320} style={{ borderRadius: 20 }} /></div>;

  if (!plan.usable) {
    const why = { unpaid: "This plan hasn't been paid yet.", expired: "This plan has expired.", used_up: "You've used all the reviews in this plan.", active: "You've used all the AI reviews in this plan.", revoked: "This plan has been switched off. Please contact support." }[plan.state] || "This plan can't be used.";
    return (
      <div className="rls-state">
        <h1 className="rls-h2">{why}</h1>
        <p>Choose a plan to send in a new resume. Your earlier reports stay in your space.</p>
        <div className="rls-state-btns"><Btn as={Link} to="/resume-review/app/plans">Choose a plan</Btn><Btn as={Link} to="/resume-review/app" variant="ghost">My space</Btn></div>
      </div>
    );
  }

  const inc = plan.package.includes || {};
  const left = daysLeft(plan.expiresAt);
  const linkedinLeft = plan.pool?.linkedinLeft || 0; // LinkedIn reviews left across all plans: only then is it offered
  const humanLeft = plan.pool?.humanLeft || 0; // human reviews left across all plans: only then is a human review offered

  const pick = async (picked) => {
    if (!/\.pdf$/i.test(picked.name)) return toast.error("Please choose a PDF file.");
    if (picked.size > MAX_MB * 1024 * 1024) return toast.error(`That file is over ${MAX_MB} MB.`);
    setUploading(true); setProgress(0); setFile({ filename: picked.name, size: picked.size }); setErrors((x) => ({ ...x, resume: undefined }));
    try { setFile(await uploadDocument(picked, setProgress)); } catch (e) { setFile(null); toast.error(errMsg(e)); } finally { setUploading(false); }
  };

  const validate = () => {
    const e = {};
    if (kind === "professional") {
      if (f.currentRole.trim().length < 2) e.currentRole = "Enter your current role";
      if (f.experienceYears === "" || Number(f.experienceYears) < 0 || Number(f.experienceYears) > 60) e.experienceYears = "Enter your years of experience (0 if fresher)";
    }
    if (f.organization.trim().length < 2) e.organization = kind === "student" ? "Enter your college name" : "Enter your company name";
    if (kind === "student" && f.course.trim().length < 2) e.course = "Enter your course and graduation year";
    if (f.targetRole.trim().length < 2) e.targetRole = "Tell us the role you are aiming for";
    if (inc.resume && !file?.key) e.resume = uploading ? "Wait for the upload to finish." : "Upload your resume to continue.";
    if (linkedin && linkedinLeft > 0 && !LINKEDIN_RE.test(f.linkedinUrl.trim())) e.linkedinUrl = "Enter your profile link, like linkedin.com/in/your-name";
    if (inc.jobMatch && f.jobDescription.trim().length < 40) e.jobDescription = "Paste the job description (at least a few lines).";
    setErrors(e);
    if (Object.keys(e).length) document.querySelector("[data-first-error]")?.scrollIntoView({ block: "center", behavior: "smooth" });
    return Object.keys(e).length === 0;
  };

  const jdCheck = checkJobDescription(f.jobDescription);
  const send = async () => {
    if (!validate()) return;
    if (!jdCheck.ok && !window.confirm(`The job description you pasted may not be a real job posting. ${jdCheck.reason}\n\nIf you send it anyway, we will ignore it and give a general review of your resume, and your AI review will still be used.\n\nPress OK to send anyway, or Cancel to fix it.`)) return;
    setBusy(true);
    try {
      const r = await submitRequest({
        purchaseId,
        profile: { kind, currentRole: kind === "professional" ? f.currentRole : "", experienceYears: kind === "professional" ? Number(f.experienceYears) : 0, organization: f.organization, course: kind === "student" ? f.course : "", targetRole: f.targetRole },
        linkedinReview: linkedin && linkedinLeft > 0, linkedinUrl: linkedin && linkedinLeft > 0 ? f.linkedinUrl.trim() : "", jobDescription: f.jobDescription.trim(), notes: f.notes.trim(),
        resume: inc.resume ? { key: file.key, filename: file.filename } : undefined,
        humanReview: human && humanLeft > 0,
      });
      toast.success(human && humanLeft > 0 ? "Sent. Your AI report is on its way, and a reviewer will follow." : "Sent. Your AI report is on its way.");
      navigate(`/resume-review/app/requests/${r.id}?sent=1`, { replace: true });
    } catch (e) {
      toast.error(errMsg(e));
    } finally { setBusy(false); }
  };
  const bad = (k) => (errors[k] ? { "data-first-error": true } : {});

  const Opt = ({ on, onChange, icon: Icon, title, children }) => (
    <label className={cx("rls-opt", on && "is-on")}>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="rl-sr" />
      <span className="rls-opt-ico"><Icon size={22} weight="duotone" aria-hidden /></span>
      <span className="rls-opt-txt"><b>{title}</b><span>{children}</span></span>
      <span className="rls-opt-tick" aria-hidden><Check size={14} weight="bold" /></span>
    </label>
  );
  const Head = ({ n, title, sub, id }) => (
    <div className="rls-sec-head"><span className="rls-n rv-mono">{n}</span><div><h2 id={id} className="rls-h2">{title}</h2><p>{sub}</p></div></div>
  );

  const aboutDone = f.targetRole.trim().length >= 2 && f.organization.trim().length >= 2 && (kind === "student" ? f.course.trim().length >= 2 : f.currentRole.trim().length >= 2 && f.experienceYears !== "");
  const resumeDone = !inc.resume || Boolean(file?.key);
  const uses = `${plan.ai.unlimited ? "Uses one of your unlimited AI reviews" : "Uses 1 AI review"}${human && humanLeft > 0 ? ", plus 1 human review" : ""}${linkedin && linkedinLeft > 0 ? ", plus 1 LinkedIn review" : ""}.`;
  const checklist = [
    ["About you", aboutDone],
    ["Resume uploaded", resumeDone],
    ...(inc.jobMatch ? [["Job description", f.jobDescription.trim().length >= 40]] : []),
    ...(linkedin && linkedinLeft > 0 ? [["LinkedIn link", LINKEDIN_RE.test(f.linkedinUrl.trim())]] : []),
  ];
  const ready = checklist.every(([, ok]) => ok);

  return (
    <div className="rls">
      <Link to="/resume-review/app" className="rls-back"><ArrowLeft size={14} weight="bold" aria-hidden />My space</Link>
      <header className="rls-head">
        <span className="rls-paid"><Check size={14} weight="bold" aria-hidden />Payment done · step 2 of 2</span>
        <h1 className="rls-h1">Send in your resume</h1>
        <p>Three short parts: about you, your resume, and optional extras. Your AI report arrives in about two minutes.</p>
        <div className="rls-credits">
          <span className="is-plan"><b>{plan.package.name}</b></span>
          <span><Brain size={15} weight="duotone" aria-hidden />{plan.ai.unlimited ? "Unlimited AI" : `${plan.ai.left} of ${plan.ai.allowed} AI left`}</span>
          {plan.human.enabled && <span><UserCircle size={15} weight="duotone" aria-hidden />{plan.human.left} of {plan.human.allowed} human left</span>}
          {plan.linkedin.enabled && <span><LinkedinLogo size={15} weight="duotone" aria-hidden />{plan.linkedin.left} of {plan.linkedin.allowed} LinkedIn left</span>}
          {plan.expiresAt && <span><CalendarBlank size={15} weight="duotone" aria-hidden />{left} days left</span>}
        </div>
      </header>

      <div className="rls-grid">
        <div className="rls-form">
          {prefilled && <div className="rls-prefill rv-in"><MagicWand size={20} weight="duotone" aria-hidden /><span><b>Filled in from your last review.</b> Change anything that's different this time.</span></div>}
          <p className="rls-req"><span className="rv-star">*</span> Required. Fields marked “optional” can be skipped.</p>

          <section className="rls-sec" aria-labelledby="about-h">
            <Head n="1" id="about-h" title="About you" sub="So the review is judged for your level and goal." />
            <div>
              <span className="rv-label">I am a…</span>
              <div className="rv-seg" role="group" aria-label="Student or working professional">
                <button type="button" aria-pressed={kind === "student"} onClick={() => { setKind("student"); setErrors({}); }}><GraduationCap size={18} aria-hidden />Student</button>
                <button type="button" aria-pressed={kind === "professional"} onClick={() => { setKind("professional"); setErrors({}); }}><Briefcase size={18} aria-hidden />Working professional</button>
              </div>
            </div>
            {kind === "professional" && (
              <div className="rls-pair">
                <Field required label="Current role" htmlFor="rv-role" error={errors.currentRole}><input id="rv-role" {...bad("currentRole")} className={cx("rv-input", errors.currentRole && "bad")} value={f.currentRole} onChange={set("currentRole")} placeholder="e.g. Software Engineer" maxLength={100} /></Field>
                <Field required label="Years of experience" htmlFor="rv-exp" error={errors.experienceYears}><input id="rv-exp" {...bad("experienceYears")} type="number" inputMode="decimal" min="0" max="60" step="0.5" className={cx("rv-input", errors.experienceYears && "bad")} value={f.experienceYears} onChange={set("experienceYears")} placeholder="e.g. 3" /></Field>
              </div>
            )}
            <Field required label={kind === "student" ? "College / university" : "Company"} htmlFor="rv-org" error={errors.organization}><input id="rv-org" {...bad("organization")} className={cx("rv-input", errors.organization && "bad")} value={f.organization} onChange={set("organization")} placeholder={kind === "student" ? "e.g. NIT Trichy" : "e.g. Infosys"} maxLength={140} /></Field>
            {kind === "student" && <Field required label="Course and graduation year" htmlFor="rv-course" error={errors.course}><input id="rv-course" {...bad("course")} className={cx("rv-input", errors.course && "bad")} value={f.course} onChange={set("course")} placeholder="e.g. B.Tech CSE, 2026" maxLength={120} /></Field>}
            <Field required label="Role you are aiming for" htmlFor="rv-target" error={errors.targetRole} hint="We judge your resume against this role."><input id="rv-target" {...bad("targetRole")} className={cx("rv-input", errors.targetRole && "bad")} value={f.targetRole} onChange={set("targetRole")} placeholder="e.g. Backend Engineer, Data Analyst" maxLength={120} /></Field>
          </section>

          <section className="rls-sec" aria-labelledby="docs-h">
            <Head n="2" id="docs-h" title="Your resume" sub="Upload the PDF you send to recruiters today." />
            {inc.resume && <div {...bad("resume")}><Field required label="Resume PDF" error={errors.resume}><Dropzone file={file} progress={progress} uploading={uploading} onPick={pick} onClear={() => setFile(null)} /></Field></div>}
            <p className="rls-private"><Lock size={14} weight="bold" aria-hidden />Private. Only your reviewer and the AI see it, never recruiters.</p>
          </section>

          <section className="rls-sec" aria-labelledby="extra-h">
            <Head n="3" id="extra-h" title="Extras" sub="Optional, but they make the feedback sharper." />
            {humanLeft > 0 && <Opt on={human} onChange={setHuman} icon={UserCircle} title="Also get a human review">A working professional reviews this resume after the AI report. Uses 1 of your {humanLeft} human review{humanLeft === 1 ? "" : "s"}.{inc.rewrittenResume ? " Your plan includes a complete rewritten resume." : ""}</Opt>}
            {linkedinLeft > 0 && (
              <div className="rls-stack">
                <Opt on={linkedin} onChange={(v) => { setLinkedin(v); setErrors((x) => ({ ...x, linkedinUrl: undefined })); }} icon={LinkedinLogo} title="Also review my LinkedIn profile">Uses 1 of your {linkedinLeft} LinkedIn review{linkedinLeft === 1 ? "" : "s"}.</Opt>
                {linkedin && <Field required label="LinkedIn profile link" htmlFor="rv-li" error={errors.linkedinUrl} hint="Make sure your profile is public, so the reviewer can open it."><input id="rv-li" {...bad("linkedinUrl")} type="url" inputMode="url" autoCapitalize="none" className={cx("rv-input", errors.linkedinUrl && "bad")} value={f.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/your-name" maxLength={300} /></Field>}
              </div>
            )}
            <Field label="Job description" htmlFor="rv-jd" required={inc.jobMatch} optional={!inc.jobMatch} error={errors.jobDescription} hint={inc.jobMatch ? "Paste the full posting. We'll show how well you match and what to add." : "Aiming at a specific job? Paste it and the feedback will be tailored to it."}>
              <textarea id="rv-jd" {...bad("jobDescription")} rows={6} className={cx("rv-input", errors.jobDescription && "bad")} value={f.jobDescription} onChange={set("jobDescription")} maxLength={10000} placeholder="Paste the job description here…" />
              {!jdCheck.ok && f.jobDescription.trim().length >= 20 && <p role="alert" className="rls-warn"><b>This may not be a job description.</b> {jdCheck.reason} If you send it anyway we will ignore it and give a general review, and your AI review will still be used.</p>}
            </Field>
            <Field label="Anything specific you want help with?" htmlFor="rv-notes" optional><textarea id="rv-notes" rows={3} className="rv-input" value={f.notes} onChange={set("notes")} maxLength={1500} placeholder="e.g. I'm switching from support to development" /></Field>
          </section>
        </div>

        <aside className="rls-rail" aria-label="Ready to send">
          <p className="rls-rail-k">Ready to send</p>
          <ul className="rls-check">
            {checklist.map(([t, ok]) => <li key={t} className={ok ? "is-ok" : ""}><span aria-hidden>{ok ? <Check size={12} weight="bold" /> : null}</span>{t}<span className="rl-sr">{ok ? " (done)" : " (not yet)"}</span></li>)}
          </ul>
          <p className="rls-uses">{uses}</p>
          <Btn block size="lg" loading={busy} onClick={send} disabled={uploading}>Send for review <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
          <p className="rls-rail-note">{ready ? "Everything's in. Your AI report arrives in about two minutes." : "Fill in the missing parts, or press send and we'll show you what's left."}</p>
        </aside>
      </div>

      <div className="rls-bar">
        <p>{uses}</p>
        <Btn size="lg" loading={busy} onClick={send} disabled={uploading}>Send for review <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
      </div>
    </div>
  );
}
