import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowRight, Brain, Briefcase, CalendarBlank, Check, GraduationCap, LinkedinLogo, LockKey, MagicWand, Sparkle, Target, UserCircle } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { daysLeft, getRequest, submitRequest } from "./api";
import { useApp } from "./appData";
import { VaultPicker } from "./AppVault";
import { PageHead, n0 } from "./parts";
import { Btn, Field, Skeleton, cx } from "./ui";

/*
  START A REVIEW  /resume-review/app/new?plan=<purchaseId>&from=<reviewId>
  Everything it needs is already in the app data (plans, credits, vault, the details used last time), so it opens at once.
  ?from= re-checks an earlier review: the same role, job description and notes, with the resume of your choice.
*/

const LINKEDIN_RE = /^https?:\/\/([a-z0-9-]+\.)?linkedin\.com\/(in|pub|profile)\/\S+$/i;
const EMPTY = { currentRole: "", experienceYears: "", organization: "", course: "", targetRole: "", linkedinUrl: "", jobDescription: "", notes: "" };

function Step({ n, done, id, title, sub, children }) {
  return (
    <section className="rs-card rs-step" aria-labelledby={id}>
      <div className="rs-step-head">
        <span className={cx("rs-step-n", done && "done")} aria-hidden>{done ? <Check size={15} weight="bold" /> : n}</span>
        <div><h2 id={id} className="rs-h2">{title}</h2>{sub && <p>{sub}</p>}</div>
      </div>
      {children}
    </section>
  );
}

function Option({ on, onChange, icon: Icon, title, children }) {
  return (
    <label className={cx("rs-opt", on && "is-on")}>
      <input type="checkbox" checked={on} onChange={(e) => onChange(e.target.checked)} className="rs-sr" />
      <span className="rs-ico" aria-hidden><Icon size={20} weight="duotone" /></span>
      <span><b>{title}</b><span className="rs-opt-d">{children}</span></span>
      <span className="rs-check" aria-hidden><Check size={13} weight="bold" /></span>
    </label>
  );
}

export default function NewReview() {
  const { data, refresh } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const fromId = params.get("from") || "";
  const usable = useMemo(() => (data?.plans || []).filter((p) => p.usable), [data?.plans]);
  const [planId, setPlanId] = useState(params.get("plan") || "");
  const plan = usable.find((p) => p.id === planId) || usable[0] || null;

  const [kind, setKind] = useState("professional");
  const [f, setF] = useState(EMPTY);
  const [fileId, setFileId] = useState(null); // null = not chosen yet (the default is picked once the vault is known)
  const [human, setHuman] = useState(false);
  const [linkedin, setLinkedin] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [filledFrom, setFilledFrom] = useState("");
  const filled = useRef(false);

  // fill in once: from the review being re-checked, else from the last details used
  useEffect(() => {
    if (filled.current || !data) return;
    filled.current = true;
    const apply = (pr, extra = {}) => {
      if (!pr) return;
      setKind(pr.kind === "student" ? "student" : "professional");
      setF((s) => ({ ...s, currentRole: pr.currentRole || "", experienceYears: pr.kind === "professional" && pr.experienceYears != null ? String(pr.experienceYears) : "", organization: pr.organization || "", course: pr.course || "", targetRole: pr.targetRole || "", ...extra }));
    };
    if (fromId) {
      getRequest(fromId).then((r) => { apply(r.profile, { linkedinUrl: r.linkedinUrl || data.lastProfile?.linkedinUrl || "", jobDescription: r.jobDescription || "", notes: r.notes || "" }); setFilledFrom("review"); })
        .catch(() => { apply(data.lastProfile?.profile, { linkedinUrl: data.lastProfile?.linkedinUrl || "" }); if (data.lastProfile) setFilledFrom("last"); });
    } else if (data.lastProfile) { apply(data.lastProfile.profile, { linkedinUrl: data.lastProfile.linkedinUrl || "" }); setFilledFrom("last"); }
  }, [data, fromId]);
  // a plan just paid for that the app data doesn't know yet: fetch once more
  const asked = useRef(false);
  useEffect(() => {
    const want = params.get("plan");
    if (data && want && !asked.current && !(data.plans || []).some((p) => p.id === want)) { asked.current = true; refresh().catch(() => {}); }
  }, [data, params, refresh]);
  // the default vault file is picked as soon as the vault is known
  useEffect(() => { if (fileId === null && data?.vault) setFileId((data.vault.files.find((x) => x.isDefault) || data.vault.files[0])?.id || ""); }, [data?.vault, fileId]);
  // a picked file that was deleted is unpicked
  useEffect(() => { if (fileId && data?.vault && !data.vault.files.some((x) => x.id === fileId)) setFileId(""); }, [data?.vault, fileId]);

  const set = (k) => (e) => { setF((s) => ({ ...s, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };
  const bad = (k) => (errors[k] ? { "data-first-error": true } : {});

  if (!data) return <div className="rs-loading"><Skeleton h={90} style={{ borderRadius: 16 }} /><Skeleton h={260} style={{ borderRadius: 16 }} /><Skeleton h={320} style={{ borderRadius: 16 }} /></div>;
  if (!plan) {
    return (
      <>
        <PageHead back={{ to: "/resume-review/app", label: "Home" }} title="Start a review" />
        <div className="rs-empty">
          <span className="rs-ico lg warn" aria-hidden><Sparkle size={24} weight="fill" /></span>
          <h3 className="rs-h3">No AI reviews left right now</h3>
          <p>Your plans have no AI reviews left, or have expired. Pick a plan to start a new review. Your earlier reports and your vault stay as they are.</p>
          <Btn as={Link} to="/resume-review/app/plans">See plans <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
        </div>
      </>
    );
  }

  const inc = plan.package.includes || {};
  const pool = data.summary || {};
  const humanLeft = pool.humanLeft || 0;
  const linkedinLeft = pool.linkedinLeft || 0;
  const needsFile = inc.resume !== false;

  const aboutDone = f.targetRole.trim().length >= 2 && f.organization.trim().length >= 2 && (kind === "student" ? f.course.trim().length >= 2 : f.currentRole.trim().length >= 2 && f.experienceYears !== "");
  const fileDone = !needsFile || Boolean(fileId);
  const jobDone = !inc.jobMatch || f.jobDescription.trim().length >= 40;
  const liDone = !(linkedin && linkedinLeft > 0) || LINKEDIN_RE.test(f.linkedinUrl.trim());
  const checklist = [["Resume picked", fileDone], ["About you", aboutDone], ...(inc.jobMatch ? [["Job description", jobDone]] : [["Target role", f.targetRole.trim().length >= 2]]), ...(linkedin && linkedinLeft > 0 ? [["LinkedIn link", liDone]] : [])];
  const ready = checklist.every(([, ok]) => ok);
  const uses = `${plan.ai.unlimited ? "Uses one of your unlimited AI reviews" : "Uses 1 AI review"}${human && humanLeft > 0 ? " + 1 human review" : ""}${linkedin && linkedinLeft > 0 ? " + 1 LinkedIn review" : ""}`;

  const validate = () => {
    const e = {};
    if (needsFile && !fileId) e.resume = "Pick a resume from your vault, or add one.";
    if (kind === "professional") {
      if (f.currentRole.trim().length < 2) e.currentRole = "Enter your current role";
      if (f.experienceYears === "" || Number(f.experienceYears) < 0 || Number(f.experienceYears) > 60) e.experienceYears = "Enter your years of experience (0 if fresher)";
    }
    if (f.organization.trim().length < 2) e.organization = kind === "student" ? "Enter your college name" : "Enter your company name";
    if (kind === "student" && f.course.trim().length < 2) e.course = "Enter your course and graduation year";
    if (f.targetRole.trim().length < 2) e.targetRole = "Tell us the role you are aiming for";
    if (!liDone) e.linkedinUrl = "Enter your profile link, like linkedin.com/in/your-name";
    if (!jobDone) e.jobDescription = "Paste the job description (at least a few lines).";
    setErrors(e);
    if (Object.keys(e).length) setTimeout(() => document.querySelector("[data-first-error]")?.scrollIntoView({ block: "center", behavior: "smooth" }), 0);
    return Object.keys(e).length === 0;
  };

  const send = async () => {
    if (!validate()) return;
    setBusy(true);
    try {
      const r = await submitRequest({
        purchaseId: plan.id,
        profile: { kind, currentRole: kind === "professional" ? f.currentRole : "", experienceYears: kind === "professional" ? Number(f.experienceYears) : 0, organization: f.organization, course: kind === "student" ? f.course : "", targetRole: f.targetRole },
        linkedinReview: linkedin && linkedinLeft > 0, linkedinUrl: linkedin && linkedinLeft > 0 ? f.linkedinUrl.trim() : "",
        jobDescription: f.jobDescription.trim(), notes: f.notes.trim(),
        resumeFileId: needsFile ? fileId : undefined,
        humanReview: human && humanLeft > 0,
      });
      toast.success(human && humanLeft > 0 ? "Started. The AI agents are on it, and a reviewer will follow." : "Started. The AI agents are on it.");
      refresh().catch(() => {});
      navigate(`/resume-review/app/requests/${r.id}?sent=1`, { replace: true });
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  const left = daysLeft(plan.expiresAt);
  return (
    <>
      <PageHead
        back={{ to: fromId ? `/resume-review/app/requests/${fromId}` : "/resume-review/app", label: fromId ? "Back to the review" : "Home" }}
        eyebrow={<><Sparkle size={13} weight="fill" aria-hidden />{fromId ? "Re-check" : "New review"}</>}
        title={fromId ? "Re-check with a new version" : "Start a review"}
        sub="Pick the resume, tell us your goal, and our AI agents plan, score and double-check the review in a few minutes."
      />
      {filledFrom && <div className="rs-notice info rv-in"><MagicWand size={20} weight="duotone" aria-hidden /><div><b>{filledFrom === "review" ? "Filled in from that review." : "Filled in from your last review."}</b><p>Change anything that's different this time.</p></div></div>}

      <div className="rs-form-grid">
        <div className="rs-stack">
          {needsFile && (
            <Step n="1" done={fileDone} id="nr-file" title="Your resume" sub="From your Resume Vault. Replace it, remove it, or pick another version.">
              <VaultPicker value={fileId || ""} onChange={(id) => { setFileId(id); setErrors((x) => ({ ...x, resume: undefined })); }} error={errors.resume} />
              <p className="rs-row rs-xs rs-subtle"><LockKey size={14} weight="bold" aria-hidden />Private. Only you, the AI and your reviewer see it, never recruiters.</p>
            </Step>
          )}

          <Step n={needsFile ? "2" : "1"} done={aboutDone} id="nr-about" title="About you" sub="So the review is judged for your level.">
            <div>
              <span className="rv-label">I am a…</span>
              <div className="rv-seg" role="group" aria-label="Student or working professional">
                <button type="button" aria-pressed={kind === "student"} onClick={() => { setKind("student"); setErrors({}); }}><GraduationCap size={18} aria-hidden />Student</button>
                <button type="button" aria-pressed={kind === "professional"} onClick={() => { setKind("professional"); setErrors({}); }}><Briefcase size={18} aria-hidden />Professional</button>
              </div>
            </div>
            {kind === "professional" && (
              <div className="rs-pair">
                <Field required label="Current role" htmlFor="nr-role" error={errors.currentRole}><input id="nr-role" {...bad("currentRole")} className={cx("rv-input", errors.currentRole && "bad")} value={f.currentRole} onChange={set("currentRole")} placeholder="e.g. Software Engineer" maxLength={100} /></Field>
                <Field required label="Years of experience" htmlFor="nr-exp" error={errors.experienceYears}><input id="nr-exp" {...bad("experienceYears")} type="number" inputMode="decimal" min="0" max="60" step="0.5" className={cx("rv-input", errors.experienceYears && "bad")} value={f.experienceYears} onChange={set("experienceYears")} placeholder="e.g. 3" /></Field>
              </div>
            )}
            <div className="rs-pair">
              <Field required label={kind === "student" ? "College / university" : "Company"} htmlFor="nr-org" error={errors.organization}><input id="nr-org" {...bad("organization")} className={cx("rv-input", errors.organization && "bad")} value={f.organization} onChange={set("organization")} placeholder={kind === "student" ? "e.g. NIT Trichy" : "e.g. Infosys"} maxLength={140} /></Field>
              {kind === "student" && <Field required label="Course and graduation year" htmlFor="nr-course" error={errors.course}><input id="nr-course" {...bad("course")} className={cx("rv-input", errors.course && "bad")} value={f.course} onChange={set("course")} placeholder="e.g. B.Tech CSE, 2026" maxLength={120} /></Field>}
            </div>
          </Step>

          <Step n={needsFile ? "3" : "2"} done={f.targetRole.trim().length >= 2 && jobDone} id="nr-job" title="The job you want" sub="We judge every line against this role.">
            <Field required label="Role you are aiming for" htmlFor="nr-target" error={errors.targetRole}><input id="nr-target" {...bad("targetRole")} className={cx("rv-input", errors.targetRole && "bad")} value={f.targetRole} onChange={set("targetRole")} placeholder="e.g. Backend Engineer, Data Analyst" maxLength={120} /></Field>
            <Field label="Job description" htmlFor="nr-jd" required={inc.jobMatch} optional={!inc.jobMatch} error={errors.jobDescription} hint={inc.jobMatch ? "Paste the full posting. Our AI checks that it's a real job posting for your role, then shows how well you match." : "Aiming at one job? Paste it. Our AI checks it's a real posting for your role and tailors the feedback to it."}>
              <textarea id="nr-jd" {...bad("jobDescription")} rows={6} className={cx("rv-input", errors.jobDescription && "bad")} value={f.jobDescription} onChange={set("jobDescription")} maxLength={10000} placeholder="Paste the job description here…" />
            </Field>
          </Step>

          <Step n={needsFile ? "4" : "3"} id="nr-extra" title="Extras" sub="Optional, but they make the feedback sharper.">
            {humanLeft > 0 && <Option on={human} onChange={setHuman} icon={UserCircle} title="Add a human review">A working professional reviews it after the AI report. Uses 1 of your {n0(humanLeft)} human review{humanLeft === 1 ? "" : "s"}.</Option>}
            {linkedinLeft > 0 && <Option on={linkedin} onChange={(v) => { setLinkedin(v); setErrors((x) => ({ ...x, linkedinUrl: undefined })); }} icon={LinkedinLogo} title="Review my LinkedIn too">Uses 1 of your {n0(linkedinLeft)} LinkedIn review{linkedinLeft === 1 ? "" : "s"}.</Option>}
            {linkedin && linkedinLeft > 0 && <Field required label="LinkedIn profile link" htmlFor="nr-li" error={errors.linkedinUrl} hint="Make sure the profile is public."><input id="nr-li" {...bad("linkedinUrl")} type="url" inputMode="url" autoCapitalize="none" className={cx("rv-input", errors.linkedinUrl && "bad")} value={f.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/your-name" maxLength={300} /></Field>}
            <Field label="Anything specific you want help with?" htmlFor="nr-notes" optional><textarea id="nr-notes" rows={3} className="rv-input" value={f.notes} onChange={set("notes")} maxLength={1500} placeholder="e.g. I'm switching from support to development" /></Field>
          </Step>
        </div>

        <aside className="rs-summary" aria-label="Ready to start">
          <div className="rs-card rs-stack">
            <p className="rs-k">This review</p>
            {usable.length > 1 ? (
              <div className="rs-planpick">
                <label htmlFor="nr-plan" className="rv-label" style={{ marginBottom: 0 }}>Plan to use</label>
                <select id="nr-plan" className="rv-input" value={plan.id} onChange={(e) => setPlanId(e.target.value)}>
                  {usable.map((p) => <option key={p.id} value={p.id}>{p.package.name} · {p.ai.unlimited ? "unlimited AI" : `${p.ai.left} AI left`}</option>)}
                </select>
              </div>
            ) : <p className="rs-row nowrap rs-sm"><span className="rs-ico sm" aria-hidden><Target size={16} weight="duotone" /></span><b className="rs-ellipsis">{plan.package.name}</b></p>}
            <div className="rs-row rs-xs rs-muted">
              <span className="rs-row nowrap" style={{ gap: 6 }}><Brain size={14} weight="duotone" aria-hidden />{plan.ai.unlimited ? "Unlimited AI" : `${plan.ai.left} of ${plan.ai.allowed} AI left`}</span>
              {plan.expiresAt && <span className="rs-row nowrap" style={{ gap: 6 }}><CalendarBlank size={14} weight="duotone" aria-hidden />{left} days left</span>}
            </div>
            <div className="rs-divider" />
            <ul className="rs-ticks">{checklist.map(([t, ok]) => <li key={t} className={ok ? "ok" : ""}><span aria-hidden>{ok && <Check size={12} weight="bold" />}</span>{t}<span className="rs-sr">{ok ? " (done)" : " (not yet)"}</span></li>)}</ul>
            <p className="rs-xs rs-subtle">{uses}.</p>
            <div className="rs-desk-only"><Btn block size="lg" loading={busy} onClick={send}><Sparkle size={17} weight="fill" aria-hidden />Start the review</Btn></div>
            <p className="rs-xs rs-subtle">{ready ? "All set. Your report is usually ready in 3 to 6 minutes." : "Fill in what's missing, or press start and we'll point to it."}</p>
          </div>
        </aside>
      </div>

      <div className="rs-actionbar">
        <div><span>{uses}</span><b>{ready ? "Ready to start" : `${checklist.filter(([, ok]) => ok).length} of ${checklist.length} done`}</b></div>
        <Btn loading={busy} onClick={send}>Start <ArrowRight size={16} weight="bold" aria-hidden /></Btn>
      </div>
    </>
  );
}
