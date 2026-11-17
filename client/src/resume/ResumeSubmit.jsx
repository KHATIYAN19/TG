import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Brain, Briefcase, Check, FilePdf, GraduationCap, LinkedinLogo, Lock, MagicWand, Target, Trash, UploadSimple, UserCircle } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { dayFmt, daysLeft, getPlan, myRequests, submitRequest, uploadDocument } from "./api";
import { Btn, Field, Kicker, Pill, Skeleton, cx } from "./ui";
import { checkJobDescription } from "./jdCheck";

const LINKEDIN_RE = /^https?:\/\/([a-z0-9-]+\.)?linkedin\.com\/(in|pub|profile)\/\S+$/i;
const MAX_MB = 10;

function Dropzone({ file, progress, uploading, onPick, onClear }) {
  const input = useRef(null);
  const [over, setOver] = useState(false);
  if (file) {
    return (
      <div className="rv-drop has" style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <FilePdf size={32} weight="duotone" aria-hidden style={{ flexShrink: 0 }} />
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.filename}</p>
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
      <p style={{ marginTop: 16, fontWeight: 700, fontSize: 17 }}>{over ? "Drop it here" : "Drag your resume here"}</p>
      <p className="rv-muted rv-sm" style={{ marginTop: 4 }}>or <span style={{ textDecoration: "underline", fontWeight: 600, color: "var(--rv-text)" }}>browse files</span></p>
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

  if (loadError) return <div style={{ padding: "64px 0", textAlign: "center" }}><p role="alert" className="rv-err" style={{ justifyContent: "center" }}>{loadError}</p><Btn as={Link} to="/resume-review/app" variant="ghost" style={{ marginTop: 24 }}>Back to my space</Btn></div>;
  if (!plan) return <div style={{ display: "grid", gap: 16 }}><Skeleton h={36} style={{ width: "40%" }} /><Skeleton h={300} /></div>;

  if (!plan.usable) {
    const why = { unpaid: "This plan hasn't been paid yet.", expired: "This plan has expired.", used_up: "You've used all the reviews in this plan.", active: "You've used all the AI reviews in this plan.", revoked: "This plan has been switched off. Please contact support." }[plan.state] || "This plan can't be used.";
    return (
      <div className="rv-tile" style={{ maxWidth: 520, margin: "40px auto", textAlign: "center", padding: 40 }}>
        <h1 className="rv-h3">{why}</h1>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}><Btn as={Link} to="/resume-review/app/plans">Buy a plan</Btn><Btn as={Link} to="/resume-review/app" variant="ghost">My space</Btn></div>
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
    <label className={cx("rv-opt", on && "on")}>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} />
      <span className="rv-ico"><Icon size={22} weight="duotone" aria-hidden /></span>
      <span style={{ minWidth: 0, flex: 1 }}><b>{title}</b><br /><span className="rv-muted rv-sm">{children}</span></span>
      <span className="rv-opt-tick" aria-hidden><Check size={14} weight="bold" /></span>
    </label>
  );
  const Head = ({ n, icon: Icon, title, sub, id }) => (
    <div className="rv-sec-head"><span className="rv-sec-n"><Icon size={20} weight="duotone" aria-hidden /></span><div><h2 id={id} className="rv-h3">{title}</h2><p className="rv-muted rv-sm" style={{ marginTop: 2 }}>{sub}</p></div></div>
  );
  const credit = (Icon, text) => <span className="rv-credit"><Icon size={15} weight="duotone" aria-hidden />{text}</span>;

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <div className="rv-panel rv-submit-hero">
        <span className="rv-kicker" style={{ color: "var(--rv-panel-muted)" }}>Step 2 of 2 · Payment done</span>
        <h1 className="rv-h2" style={{ marginTop: 14, color: "var(--rv-panel-text)" }}>Send in your resume</h1>
        <p style={{ marginTop: 10, color: "var(--rv-panel-muted)", maxWidth: 520, lineHeight: 1.6 }}>Three quick parts: about you, your resume, then send. Your AI report arrives in about two minutes.</p>
        <div className="rv-credits">
          <span className="rv-credit ok"><Check size={14} weight="bold" aria-hidden />{plan.package.name} · paid</span>
          {credit(Brain, plan.ai.unlimited ? "Unlimited AI" : `${plan.ai.left} of ${plan.ai.allowed} AI left`)}
          {plan.human.enabled && credit(UserCircle, `${plan.human.left} of ${plan.human.allowed} human left`)}
          {plan.linkedin.enabled && credit(LinkedinLogo, `${plan.linkedin.left} of ${plan.linkedin.allowed} LinkedIn left`)}
          {plan.expiresAt && credit(Target, `${left} days left`)}
        </div>
      </div>

      <div style={{ display: "grid", gap: 22, marginTop: 24, gridTemplateColumns: "minmax(0, 1fr)" }}>
        <p className="rv-hint" style={{ marginTop: 0 }}><span className="rv-star">*</span> marks a required field. Fields marked “optional” can be skipped.</p>
        {prefilled && <div className="rv-note rv-in" style={{ display: "flex", gap: 12, alignItems: "center" }}><MagicWand size={22} weight="duotone" aria-hidden style={{ flexShrink: 0 }} /><span><b>Filled in from your last review.</b> Change anything that's different this time.</span></div>}

        <section className="rv-card rv-card-pad rv-secn" style={{ display: "grid", gap: 22 }} aria-labelledby="about-h">
          <Head id="about-h" icon={UserCircle} title="About you" sub="So the review is judged for your level and goal." />
          <div>
            <span className="rv-label">I am a…</span>
            <div className="rv-seg" role="group" aria-label="Student or working professional">
              <button type="button" aria-pressed={kind === "student"} onClick={() => { setKind("student"); setErrors({}); }}><GraduationCap size={18} aria-hidden />Student</button>
              <button type="button" aria-pressed={kind === "professional"} onClick={() => { setKind("professional"); setErrors({}); }}><Briefcase size={18} aria-hidden />Working professional</button>
            </div>
          </div>
          {kind === "professional" && (
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
              <Field required label="Current role" htmlFor="rv-role" error={errors.currentRole}><input id="rv-role" {...bad("currentRole")} className={cx("rv-input", errors.currentRole && "bad")} value={f.currentRole} onChange={set("currentRole")} placeholder="e.g. Software Engineer" maxLength={100} /></Field>
              <Field required label="Years of experience" htmlFor="rv-exp" error={errors.experienceYears}><input id="rv-exp" {...bad("experienceYears")} type="number" inputMode="decimal" min="0" max="60" step="0.5" className={cx("rv-input", errors.experienceYears && "bad")} value={f.experienceYears} onChange={set("experienceYears")} placeholder="e.g. 3" /></Field>
            </div>
          )}
          <Field required label={kind === "student" ? "College / university" : "Company"} htmlFor="rv-org" error={errors.organization}><input id="rv-org" {...bad("organization")} className={cx("rv-input", errors.organization && "bad")} value={f.organization} onChange={set("organization")} placeholder={kind === "student" ? "e.g. NIT Trichy" : "e.g. Infosys"} maxLength={140} /></Field>
          {kind === "student" && <Field required label="Course and graduation year" htmlFor="rv-course" error={errors.course}><input id="rv-course" {...bad("course")} className={cx("rv-input", errors.course && "bad")} value={f.course} onChange={set("course")} placeholder="e.g. B.Tech CSE, 2026" maxLength={120} /></Field>}
          <Field required label="Role you are aiming for" htmlFor="rv-target" error={errors.targetRole} hint="We judge your resume against this role."><input id="rv-target" {...bad("targetRole")} className={cx("rv-input", errors.targetRole && "bad")} value={f.targetRole} onChange={set("targetRole")} placeholder="e.g. Backend Engineer, Data Analyst" maxLength={120} /></Field>
        </section>

        <section className="rv-card rv-card-pad rv-secn" style={{ display: "grid", gap: 22 }} aria-labelledby="docs-h">
          <Head id="docs-h" icon={FilePdf} title="Your resume" sub="Upload the PDF you send to recruiters today." />
          {inc.resume && <div {...bad("resume")}><Field required label="Resume PDF" error={errors.resume}><Dropzone file={file} progress={progress} uploading={uploading} onPick={pick} onClear={() => setFile(null)} /></Field></div>}
          <p className="rv-hint" style={{ display: "flex", gap: 8, alignItems: "center", marginTop: -8 }}><Lock size={14} weight="bold" aria-hidden />Private. Only your reviewer and the AI see it, never recruiters.</p>
        </section>

        <section className="rv-card rv-card-pad rv-secn" style={{ display: "grid", gap: 22 }} aria-labelledby="extra-h">
          <Head id="extra-h" icon={Target} title="Extras" sub="Optional, but they make the feedback sharper." />
          {humanLeft > 0 && <Opt on={human} onChange={setHuman} icon={UserCircle} title="Also get a human review">A working professional reviews this resume after the AI report. Uses 1 of your {humanLeft} human review{humanLeft === 1 ? "" : "s"}.{inc.rewrittenResume ? " Your plan includes a complete rewritten resume." : ""}</Opt>}
          {linkedinLeft > 0 && (
            <div style={{ display: "grid", gap: 14 }}>
              <Opt on={linkedin} onChange={(v) => { setLinkedin(v); setErrors((x) => ({ ...x, linkedinUrl: undefined })); }} icon={LinkedinLogo} title="Also review my LinkedIn profile">Uses 1 of your {linkedinLeft} LinkedIn review{linkedinLeft === 1 ? "" : "s"}.</Opt>
              {linkedin && <Field required label="LinkedIn profile link" htmlFor="rv-li" error={errors.linkedinUrl} hint="Make sure your profile is public, so the reviewer can open it."><input id="rv-li" {...bad("linkedinUrl")} type="url" inputMode="url" autoCapitalize="none" className={cx("rv-input", errors.linkedinUrl && "bad")} value={f.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/your-name" maxLength={300} /></Field>}
            </div>
          )}
          <Field label="Job description" htmlFor="rv-jd" required={inc.jobMatch} optional={!inc.jobMatch} error={errors.jobDescription} hint={inc.jobMatch ? "Paste the full posting. We'll show how well you match and what to add." : "Aiming at a specific job? Paste it and the reviewer will tailor the feedback."}>
            <textarea id="rv-jd" {...bad("jobDescription")} rows={6} className={cx("rv-input", errors.jobDescription && "bad")} value={f.jobDescription} onChange={set("jobDescription")} maxLength={10000} placeholder="Paste the job description here…" />
            {!jdCheck.ok && f.jobDescription.trim().length >= 20 && <p role="alert" className="rv-hint" style={{ marginTop: 8, color: "var(--rv-warn, #b45309)" }}><b>This may not be a job description.</b> {jdCheck.reason} If you send it anyway we will ignore it and give a general review, and your AI review will still be used. Please double-check.</p>}
          </Field>
          <Field label="Anything specific you want help with?" htmlFor="rv-notes" optional><textarea id="rv-notes" rows={3} className="rv-input" value={f.notes} onChange={set("notes")} maxLength={1500} placeholder="e.g. I'm switching from support to development" /></Field>
        </section>
      </div>

      <div className="rv-sendbar">
        <p className="rv-sm rv-muted">{plan.ai.unlimited ? "Uses one of your unlimited AI reviews." : "Uses 1 AI review from this plan."}{human && humanLeft > 0 ? " Plus 1 human review." : ""}</p>
        <Btn size="lg" loading={busy} onClick={send} disabled={uploading}>Send for review <ArrowRight size={17} weight="bold" aria-hidden /></Btn>
      </div>
    </div>
  );
}
