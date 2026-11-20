import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, CaretDown, Check, DownloadSimple, FilePdf, Lock, MagicWand, Plus, Stack, Trash } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { builderAnswers, builderDelete, builderGenerate, builderGet, builderList, builderPdf, builderRetry, builderSave, builderTailor, dayFmt, uploadDocument } from "./api";
import { Btn, Field, Kicker, Pill, Skeleton, cx } from "./ui";
import { Dropzone } from "./AppVault";
import { checkJobDescription } from "./jdCheck";
import { scoreResume } from "./resumeScore";
import { useBuilderStatus } from "./useBuilder";

const BASE = "/resume-review/app/builder";

/* ---------- the sections of the edit form (every one is pre-filled from the generated resume) ---------- */
const SECTIONS = [
  { key: "about", title: "Contact details", ask: "How can employers reach you?" },
  { key: "links", title: "Links", ask: "Where can they see your work?" },
  { key: "summary", title: "Summary", ask: "Who are you in two or three lines?" },
  { key: "experience", title: "Experience", ask: "Where have you worked or interned?" },
  { key: "projects", title: "Projects", ask: "What have you built?" },
  { key: "education", title: "Education", ask: "Where did you study?" },
  { key: "skills", title: "Skills", ask: "What are you good at?" },
  { key: "extras", title: "Certifications and extras", ask: "Certifications, awards, anything else?" },
  { key: "look", title: "Look and layout", ask: "Pick how the PDF looks." },
];

const LINK_PRESETS = ["LinkedIn", "GitHub", "Portfolio", "LeetCode", "Behance", "Other"];
const TEMPLATES = [
  { key: "classic", name: "Classic", hint: "Serif, centred name, ruled sections. The safe choice for any company.", best: "Any role", head: "center", sec: "rule", serif: true },
  { key: "modern", name: "Modern", hint: "Clean sans-serif, accent colour and section bars. Friendly and sharp.", best: "Startups and product teams", head: "left", sec: "bar" },
  { key: "executive", name: "Executive", hint: "Formal serif with double-ruled headings. Calm and senior.", best: "Banks, consulting, large companies", head: "center", sec: "double", serif: true },
  { key: "minimal", name: "Minimal", hint: "Airy and quiet, thin dividers and lots of white space.", best: "Design-minded teams, short resumes", head: "left", sec: "light" },
  { key: "tech", name: "Tech", hint: "Coloured header band, tag-style headings and monospaced dates.", best: "Engineering roles, the most eye-catching", head: "band", sec: "tag" },
  { key: "compact", name: "Compact", hint: "Tighter type that fits more on one page.", best: "Lots of experience to show", head: "left", sec: "rule" },
];
const ACCENTS = [["", "Template colour"], ["#0f766e", "Teal"], ["#1d4ed8", "Blue"], ["#4338ca", "Indigo"], ["#7c3aed", "Purple"], ["#be123c", "Rose"], ["#c2410c", "Orange"], ["#15803d", "Green"], ["#1f2a44", "Navy"], ["#111111", "Black"]];
const SPACINGS = [["comfortable", "Roomy"], ["standard", "Standard"], ["tight", "Tight"]];
const TPL_COLOR = { classic: "#111111", modern: "#0f766e", executive: "#1f2a44", minimal: "#111827", tech: "#1e3a5f", compact: "#111111" };

/* a small drawing of each template (decoration only) */
function Mini({ t, accent }) {
  const c = accent || TPL_COLOR[t.key];
  const band = t.head === "band";
  const nameX = t.head === "center" ? 22 : 8;
  const heading = (y) => {
    if (t.sec === "rule") return <g key={y}><rect x="8" y={y} width="16" height="2.2" fill={c} /><rect x="8" y={y + 3.4} width="64" height="0.7" fill="#555" /></g>;
    if (t.sec === "double") return <g key={y}><rect x="8" y={y - 1} width="64" height="0.6" fill={c} /><rect x="28" y={y + 0.6} width="24" height="2.2" fill={c} /><rect x="8" y={y + 3.8} width="64" height="0.6" fill={c} /></g>;
    if (t.sec === "bar") return <g key={y}><rect x="8" y={y - 0.4} width="1.6" height="4" fill={c} /><rect x="11.5" y={y} width="16" height="2.2" fill={c} /></g>;
    if (t.sec === "light") return <g key={y}><rect x="8" y={y} width="14" height="1.8" fill="#9ca3af" /><rect x="25" y={y + 0.8} width="47" height="0.5" fill="#d1d5db" /></g>;
    return <g key={y}><rect x="8" y={y - 0.6} width="15" height="4.2" rx="0.8" fill={c} /></g>;
  };
  const lines = (y, n) => Array.from({ length: n }, (_, i) => <rect key={`${y}-${i}`} x="8" y={y + i * 3.1} width={[64, 58, 61, 46][i % 4]} height="1.2" rx="0.5" fill="#cbd5e1" />);
  return (
    <svg viewBox="0 0 80 106" className="rvb-mini" aria-hidden>
      <rect width="80" height="106" rx="2" fill="#fff" />
      {band && <rect width="80" height="19" fill={c} />}
      <rect x={nameX} y={band ? 6 : 8} width="36" height="4.2" rx="0.8" fill={band ? "#fff" : c} />
      <rect x={nameX + (t.head === "center" ? 4 : 0)} y={band ? 12.4 : 14} width="28" height="1.4" rx="0.5" fill={band ? "#bfd0e6" : "#9ca3af"} />
      {heading(band ? 25 : 22)}{lines(band ? 31 : 28, 3)}
      {heading(band ? 47 : 44)}{lines(band ? 53 : 50, 4)}
      {heading(band ? 70 : 67)}{lines(band ? 76 : 73, 4)}
    </svg>
  );
}

function LookPanel({ d, up }) {
  const accent = d.design?.accent || "";
  const spacing = d.design?.spacing || "standard";
  const setDesign = (patch) => up({ design: { accent, spacing, ...patch } });
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="rvb-tpls" role="radiogroup" aria-label="Template">
        {TEMPLATES.map((t) => (
          <button key={t.key} type="button" role="radio" aria-checked={d.template === t.key} className={cx("rvb-tpl", d.template === t.key && "on")} onClick={() => up({ template: t.key })}>
            <Mini t={t} accent={accent} />
            <b>{t.name}{d.template === t.key && <Check size={14} weight="bold" aria-hidden style={{ marginLeft: 6 }} />}</b>
            <span className="rv-xs rv-muted">{t.hint}</span>
            <span className="rvb-tpl-best">{t.best}</span>
          </button>
        ))}
      </div>
      <Field label="Accent colour" hint="Used for the name, headings and bullets (not for the Classic and Compact black-and-white look unless you pick one).">
        <div className="rvb-swatches" role="radiogroup" aria-label="Accent colour">
          {ACCENTS.map(([hex, name]) => (
            <button key={hex || "auto"} type="button" role="radio" aria-checked={accent === hex} aria-label={name} title={name} className={cx("rvb-sw", accent === hex && "on")} style={{ "--c": hex || TPL_COLOR[d.template] }} onClick={() => setDesign({ accent: hex })}>
              {accent === hex && <Check size={13} weight="bold" aria-hidden />}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Spacing">
        <div className="rvb-seg" role="radiogroup" aria-label="Spacing">
          {SPACINGS.map(([k, name]) => <button key={k} type="button" role="radio" aria-checked={spacing === k} className={cx(spacing === k && "on")} onClick={() => setDesign({ spacing: k })}>{name}</button>)}
        </div>
      </Field>
      <p className="rv-muted rv-sm">Every template is a single column with real, selectable text and clickable links, so applicant tracking systems read it correctly. The resume is always fitted to one A4 page.</p>
    </div>
  );
}

/* the score: how strong the resume is, and exactly what to fix (live as you edit) */
function StrengthCard({ d }) {
  const r = useMemo(() => scoreResume(d), [d]);
  const [all, setAll] = useState(false);
  const C = 2 * Math.PI * 26;
  return (
    <section className="rv-card rv-card-pad rvb-str" aria-label="Resume strength">
      <div className="rvb-str-top">
        <div className={cx("rvb-ring", r.grade.id)} role="img" aria-label={`Resume strength ${r.score} out of 100`}>
          <svg viewBox="0 0 60 60" aria-hidden><circle cx="30" cy="30" r="26" className="bg" /><circle cx="30" cy="30" r="26" className="fg" strokeDasharray={`${(r.score / 100) * C} ${C}`} /></svg>
          <b className="rv-mono">{r.score}</b>
        </div>
        <div style={{ minWidth: 0 }}>
          <b>Resume strength: {r.grade.label}</b>
          <p className="rv-xs rv-muted" style={{ marginTop: 2 }}>{r.fixes.length ? `${r.fixes.length} thing${r.fixes.length === 1 ? "" : "s"} to improve. Updates as you edit.` : "Nothing left to fix. Nice work."}</p>
        </div>
      </div>
      {r.keywords.matched.length + r.keywords.missing.length > 0 && (
        <div className="rvb-kw">
          <p className="rv-xs rv-subtle">{r.keywords.source === "jd" ? "Keywords from the job description" : "Skills usually asked for in this role"}</p>
          <div className="rvb-kw-chips">
            {r.keywords.matched.map((k) => <span key={k} className="ok"><Check size={11} weight="bold" aria-hidden />{k}</span>)}
            {r.keywords.missing.map((k) => <span key={k} className="miss" title="Add it only if it is true for you">{k}</span>)}
          </div>
          {r.keywords.missing.length > 0 && <p className="rv-xs rv-subtle" style={{ marginTop: 6 }}>Grey keywords are missing. Add one only if you truly have that skill: put it in Skills and in a project or job point.</p>}
        </div>
      )}
      {r.fixes.length > 0 && (
        <ul className="rvb-fixes">
          {r.fixes.slice(0, all ? 12 : 3).map((c) => <li key={c.id}><span aria-hidden>→</span><div><b>{c.label}</b><p>{c.tip}</p></div></li>)}
        </ul>
      )}
      <button type="button" className="rvb-add" onClick={() => setAll((x) => !x)}>{all ? "Show fewer" : "See every check"}</button>
      {all && <ul className="rvb-checks">{r.checks.map((c) => <li key={c.id} className={c.v >= 0.95 ? "ok" : c.v >= 0.5 ? "mid" : "bad"}><span>{c.v >= 0.95 ? "✓" : c.v >= 0.5 ? "•" : "✕"}</span>{c.label}</li>)}</ul>}
    </section>
  );
}

const EMPTY = {
  title: "My resume", template: "classic", design: { accent: "", spacing: "standard" }, jdKeywords: [], keywordSource: "role", kind: "student", step: 0,
  basics: { name: "", headline: "", email: "", phone: "", location: "" },
  links: [{ label: "LinkedIn", url: "" }, { label: "GitHub", url: "" }],
  summary: "",
  education: [{ school: "", degree: "", start: "", end: "", score: "", notes: "" }],
  experience: [],
  projects: [],
  skills: [{ group: "Languages", items: [] }, { group: "Tools", items: [] }],
  extras: [{ heading: "Certifications", items: [] }],
};

const blank = {
  education: () => ({ school: "", degree: "", start: "", end: "", score: "", notes: "" }),
  experience: () => ({ company: "", role: "", location: "", start: "", end: "", current: false, bullets: [""] }),
  projects: () => ({ name: "", tech: "", link: "", repo: "", bullets: [""] }),
  skills: () => ({ group: "", items: [] }),
  extras: () => ({ heading: "", items: [""] }),
  links: () => ({ label: "Other", url: "" }),
};

const merge = (x) => ({ ...EMPTY, ...x, basics: { ...EMPTY.basics, ...x.basics }, design: { ...EMPTY.design, ...(x.design || {}) } });

const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(\/\S*)?$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* what the server keeps: only the fields it knows, with empty rows dropped */
const payloadOf = (d) => ({
  title: d.title, template: d.template, design: d.design, kind: d.kind, step: d.step,
  basics: d.basics,
  links: d.links.filter((l) => l.url.trim()),
  summary: d.summary,
  education: d.education.filter((e) => e.school.trim() || e.degree.trim()),
  experience: d.experience.filter((e) => e.company.trim() || e.role.trim()).map((e) => ({ ...e, bullets: e.bullets.map((b) => b.trim()).filter(Boolean) })),
  projects: d.projects.filter((p) => p.name.trim()).map((p) => ({ ...p, bullets: p.bullets.map((b) => b.trim()).filter(Boolean) })),
  skills: d.skills.filter((g) => g.items.length).map((g) => ({ group: g.group, items: g.items })),
  extras: d.extras.filter((g) => g.items.some((i) => i.trim())).map((g) => ({ heading: g.heading, items: g.items.map((i) => i.trim()).filter(Boolean) })),
});

/* ---------- small building blocks ---------- */
const Input = ({ value, onChange, ...p }) => <input className="rv-input" value={value} onChange={(e) => onChange(e.target.value)} {...p} />;
const Area = ({ value, onChange, rows = 3, ...p }) => <textarea className="rv-input" rows={rows} value={value} onChange={(e) => onChange(e.target.value)} {...p} />;
const Row = ({ children, cols = 2 }) => <div className="rvb-row" style={{ "--cols": cols }}>{children}</div>;

/* skills: type a word, press Enter or comma */
function Chips({ items, onChange, placeholder }) {
  const [text, setText] = useState("");
  const add = (raw) => {
    const parts = String(raw).split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    onChange([...items, ...parts.filter((p) => !items.some((i) => i.toLowerCase() === p.toLowerCase()))].slice(0, 40));
    setText("");
  };
  return (
    <div className="rvb-chips">
      {items.map((s, i) => <span key={s + i} className="rvb-chip">{s}<button type="button" aria-label={`Remove ${s}`} onClick={() => onChange(items.filter((_, j) => j !== i))}>×</button></span>)}
      <input className="rvb-chip-in" value={text} placeholder={items.length ? "" : placeholder} onChange={(e) => setText(e.target.value)} onBlur={() => add(text)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(text); } else if (e.key === "Backspace" && !text && items.length) onChange(items.slice(0, -1)); }} />
    </div>
  );
}

/* bullet points: one line each */
function Bullets({ items, onChange, placeholder }) {
  const set = (i, v) => onChange(items.map((b, j) => (j === i ? v : b)));
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {items.map((b, i) => (
        <div key={i} style={{ display: "flex", gap: 8 }}>
          <Area rows={2} value={b} maxLength={400} placeholder={placeholder} onChange={(v) => set(i, v)} />
          <button type="button" className="rv-btn rv-btn-ghost rv-btn-sm" aria-label="Remove point" onClick={() => onChange(items.length > 1 ? items.filter((_, j) => j !== i) : [""])}><Trash size={16} aria-hidden /></button>
        </div>
      ))}
      {items.length < 8 && <button type="button" className="rvb-add" onClick={() => onChange([...items, ""])}><Plus size={14} weight="bold" aria-hidden /> Add a point</button>}
    </div>
  );
}

/* a list of cards (education, jobs, projects ...) */
function Cards({ items, onChange, make, noun, render, max = 8 }) {
  const set = (i, patch) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {items.map((it, i) => (
        <div key={i} className="rv-card rv-card-pad rvb-card">
          <div className="rvb-card-top"><b className="rv-sm">{noun} {i + 1}</b><button type="button" className="rv-btn rv-btn-ghost rv-btn-sm" onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash size={15} aria-hidden /> Remove</button></div>
          <div style={{ display: "grid", gap: 14 }}>{render(it, (patch) => set(i, patch), i)}</div>
        </div>
      ))}
      {items.length < max && <Btn variant="ghost" onClick={() => onChange([...items, make()])}><Plus size={16} weight="bold" aria-hidden /> Add {items.length ? "another" : "a"} {noun.toLowerCase()}</Btn>}
    </div>
  );
}

/* ---------- each step ---------- */
function StepBody({ k, d, up, errors }) {
  const bs = d.basics;
  const setB = (patch) => up({ basics: { ...bs, ...patch } });

  if (k === "about") return (
    <div style={{ display: "grid", gap: 16 }}>
      <Field label="Are you a student or already working?">
        <div className="rvb-seg">{["student", "professional"].map((x) => <button key={x} type="button" className={cx(d.kind === x && "on")} onClick={() => up({ kind: x })}>{x === "student" ? "Student / Fresher" : "Working professional"}</button>)}</div>
      </Field>
      <Field label="Full name" required error={errors.name}><Input value={bs.name} maxLength={80} autoComplete="name" placeholder="Asha Verma" onChange={(v) => setB({ name: v })} /></Field>
      <Field label="The role you are applying for" hint="Shown under your name, e.g. Full Stack Developer" optional><Input value={bs.headline} maxLength={120} placeholder="Full Stack Developer" onChange={(v) => setB({ headline: v })} /></Field>
      <Row>
        <Field label="Email" required error={errors.email}><Input type="email" value={bs.email} maxLength={120} autoComplete="email" placeholder="you@example.com" onChange={(v) => setB({ email: v })} /></Field>
        <Field label="Phone" optional><Input type="tel" value={bs.phone} maxLength={30} autoComplete="tel" placeholder="+91 98765 43210" onChange={(v) => setB({ phone: v })} /></Field>
      </Row>
      <Field label="City, country" optional><Input value={bs.location} maxLength={80} placeholder="Pune, India" onChange={(v) => setB({ location: v })} /></Field>
    </div>
  );

  if (k === "links") return (
    <div style={{ display: "grid", gap: 12 }}>
      <p className="rv-muted rv-sm">Each link becomes clickable in the PDF. Add only what you are proud of.</p>
      {d.links.map((l, i) => (
        <div key={i} className="rvb-link">
          <select className="rv-input" value={LINK_PRESETS.includes(l.label) ? l.label : "Other"} aria-label="Link type" onChange={(e) => up({ links: d.links.map((x, j) => (j === i ? { ...x, label: e.target.value === "Other" ? "" : e.target.value } : x)) })}>
            {LINK_PRESETS.map((p) => <option key={p}>{p}</option>)}
          </select>
          {!LINK_PRESETS.slice(0, -1).includes(l.label) && <Input value={l.label} maxLength={30} placeholder="Name" aria-label="Link name" onChange={(v) => up({ links: d.links.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />}
          <Input value={l.url} maxLength={300} placeholder="linkedin.com/in/yourname" aria-label="Link address" className={cx("rv-input", errors[`link${i}`] && "bad")} onChange={(v) => up({ links: d.links.map((x, j) => (j === i ? { ...x, url: v } : x)) })} />
          <button type="button" className="rv-btn rv-btn-ghost rv-btn-sm" aria-label="Remove link" onClick={() => up({ links: d.links.filter((_, j) => j !== i) })}><Trash size={16} aria-hidden /></button>
          {errors[`link${i}`] && <p role="alert" className="rv-err" style={{ gridColumn: "1 / -1" }}>{errors[`link${i}`]}</p>}
        </div>
      ))}
      {d.links.length < 8 && <button type="button" className="rvb-add" onClick={() => up({ links: [...d.links, blank.links()] })}><Plus size={14} weight="bold" aria-hidden /> Add a link</button>}
    </div>
  );

  if (k === "summary") return (
    <Field label="Professional summary" hint={`${d.summary.length}/900. Say what you do, your strongest skill and what you want next. Skip "hard-working team player".`} optional>
      <Area rows={6} value={d.summary} maxLength={900} placeholder={d.kind === "student" ? "Final-year CS student who builds and ships web apps. Strong in React and Node.js, looking for a software engineering role." : "Backend engineer with 4 years of experience building payment systems that handle 2M+ transactions a month."} onChange={(v) => up({ summary: v })} />
    </Field>
  );

  if (k === "education") return (
    <Cards items={d.education} onChange={(education) => up({ education })} make={blank.education} noun="School" max={6}
      render={(e, set) => (<>
        <Field label="College / school" required><Input value={e.school} maxLength={140} placeholder="VIT Pune" onChange={(v) => set({ school: v })} /></Field>
        <Field label="Degree and branch"><Input value={e.degree} maxLength={140} placeholder="B.Tech in Computer Science" onChange={(v) => set({ degree: v })} /></Field>
        <Row cols={3}>
          <Field label="Start"><Input value={e.start} maxLength={20} placeholder="2022" onChange={(v) => set({ start: v })} /></Field>
          <Field label="End"><Input value={e.end} maxLength={20} placeholder="2026" onChange={(v) => set({ end: v })} /></Field>
          <Field label="CGPA / %" optional><Input value={e.score} maxLength={40} placeholder="8.7 CGPA" onChange={(v) => set({ score: v })} /></Field>
        </Row>
      </>)} />
  );

  if (k === "experience") return (
    <div style={{ display: "grid", gap: 14 }}>
      {d.kind === "student" && !d.experience.length && <p className="rv-muted rv-sm">No internship yet? Skip this and put your best work under Projects.</p>}
      <Cards items={d.experience} onChange={(experience) => up({ experience })} make={blank.experience} noun="Job" max={10}
        render={(e, set) => (<>
          <Row><Field label="Job title" required><Input value={e.role} maxLength={120} placeholder="Software Engineer Intern" onChange={(v) => set({ role: v })} /></Field>
            <Field label="Company" required><Input value={e.company} maxLength={140} placeholder="Acme Technologies" onChange={(v) => set({ company: v })} /></Field></Row>
          <Row cols={3}>
            <Field label="Start"><Input value={e.start} maxLength={20} placeholder="Jun 2025" onChange={(v) => set({ start: v })} /></Field>
            <Field label="End"><Input value={e.current ? "" : e.end} disabled={e.current} maxLength={20} placeholder={e.current ? "Present" : "Aug 2025"} onChange={(v) => set({ end: v })} /></Field>
            <Field label="Location" optional><Input value={e.location} maxLength={80} placeholder="Remote" onChange={(v) => set({ location: v })} /></Field>
          </Row>
          <label className="rv-sm" style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={e.current} onChange={(ev) => set({ current: ev.target.checked })} /> I currently work here</label>
          <Field label="What did you do?" hint="Start with a verb and add a number if you can: “Cut page load time by 40%”.">
            <Bullets items={e.bullets} onChange={(bullets) => set({ bullets })} placeholder="Built a dashboard that 200 staff use daily…" />
          </Field>
        </>)} />
    </div>
  );

  if (k === "projects") return (
    <Cards items={d.projects} onChange={(projects) => up({ projects })} make={blank.projects} noun="Project" max={8}
      render={(p, set, i) => (<>
        <Row><Field label="Project name" required><Input value={p.name} maxLength={120} placeholder="TrackIt" onChange={(v) => set({ name: v })} /></Field>
          <Field label="Tech used" optional><Input value={p.tech} maxLength={200} placeholder="React, Node.js, MongoDB" onChange={(v) => set({ tech: v })} /></Field></Row>
        <Row>
          <Field label="Live link" optional error={errors[`plive${i}`]}><Input value={p.link} maxLength={300} placeholder="trackit.app" onChange={(v) => set({ link: v })} /></Field>
          <Field label="Code link" optional error={errors[`prepo${i}`]}><Input value={p.repo} maxLength={300} placeholder="github.com/you/trackit" onChange={(v) => set({ repo: v })} /></Field>
        </Row>
        <Field label="What does it do, and what did you achieve?"><Bullets items={p.bullets} onChange={(bullets) => set({ bullets })} placeholder="Expense tracker with 1.2k users; cut entry time by half…" /></Field>
      </>)} />
  );

  if (k === "skills") return (
    <div style={{ display: "grid", gap: 16 }}>
      <p className="rv-muted rv-sm">Type a skill and press Enter (or paste a comma-separated list).</p>
      <Cards items={d.skills} onChange={(skills) => up({ skills })} make={blank.skills} noun="Group" max={8}
        render={(g, set) => (<>
          <Field label="Group name"><Input value={g.group} maxLength={40} placeholder="Languages" onChange={(v) => set({ group: v })} /></Field>
          <Field label="Skills"><Chips items={g.items} onChange={(items) => set({ items })} placeholder="JavaScript, Python, SQL…" /></Field>
        </>)} />
    </div>
  );

  if (k === "extras") return (
    <Cards items={d.extras} onChange={(extras) => up({ extras })} make={blank.extras} noun="Section" max={5}
      render={(g, set) => (<>
        <Field label="Heading" hint="Certifications, Achievements, Open source, Languages…"><Input value={g.heading} maxLength={40} placeholder="Certifications" onChange={(v) => set({ heading: v })} /></Field>
        <Field label="Points"><Bullets items={g.items.length ? g.items : [""]} onChange={(items) => set({ items })} placeholder="AWS Certified Cloud Practitioner (2025)" /></Field>
      </>)} />
  );

  return null;
}

/* ---------- live PDF preview ---------- */
function Preview({ id, version, state }) {
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);
  const [pages, setPages] = useState(0);
  const last = useRef("");

  useEffect(() => {
    if (!version) return undefined;
    let dead = false;
    setBusy(true);
    builderPdf(id).then((blob) => {
      if (dead) return;
      const next = URL.createObjectURL(blob);
      setUrl((old) => { if (old) URL.revokeObjectURL(old); return next; });
      last.current = next;
      setPages(blob.pages || 0);
      setErr("");
    }).catch((e) => { if (!dead) setErr(errMsg(e)); }).finally(() => { if (!dead) setBusy(false); });
    return () => { dead = true; };
  }, [id, version]);
  useEffect(() => () => { if (last.current) URL.revokeObjectURL(last.current); }, []);

  return (
    <div className="rvb-prev" aria-label="Resume preview">
      <div className="rvb-prev-top"><Kicker>Live preview</Kicker><span className="rv-xs rv-subtle">{state === "saving" ? "Saving…" : state === "error" ? "Not saved" : busy ? "Updating…" : pages > 1 ? `${pages} pages: shorten some points to fit one` : pages === 1 ? "Fits one page" : "Up to date"}</span></div>
      {url ? <iframe title="Resume preview" src={`${url}#toolbar=0&navpanes=0&view=FitH`} className={cx(busy && "dim")} /> : err ? <p className="rv-err" role="alert">{err}</p> : <Skeleton h={520} />}
    </div>
  );
}


/* ---------- AI: start from your resume + a job (or a target role) ---------- */
const LEVELS = ["Student / Fresher", "0 to 2 years", "2 to 5 years", "5 to 8 years", "8+ years"];

function TailorSetup({ status }) {
  const nav = useNavigate();
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState("jd"); // "jd": I have a job description | "role": I don't, I'll describe the target
  const [f, setF] = useState({ jobDescription: "", targetRole: "", level: "", skills: "", company: "", location: "", notes: "", kind: "student" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const jd = checkJobDescription(f.jobDescription);
  const none = !status.canBuild;

  const pick = async (picked) => {
    if (!/\.pdf$/i.test(picked.name)) return toast.error("Please choose a PDF file.");
    if (picked.size > 10 * 1024 * 1024) return toast.error("That file is over 10 MB.");
    setUploading(true); setProgress(0); setFile({ filename: picked.name, size: picked.size }); setErrors((x) => ({ ...x, resume: undefined }));
    try { setFile(await uploadDocument(picked, setProgress)); } catch (e) { setFile(null); toast.error(errMsg(e)); } finally { setUploading(false); }
  };

  /* with no job description the AI has nothing to match, so everything the person tells us goes in as "additional details" */
  const details = () => (mode === "jd"
    ? f.notes.trim()
    : [f.level && `Experience level: ${f.level}`, f.skills.trim() && `Skills and strengths to highlight: ${f.skills.trim()}`, f.company.trim() && `Kind of company or industry: ${f.company.trim()}`, f.location.trim() && `Preferred location: ${f.location.trim()}`, f.notes.trim() && `Other: ${f.notes.trim()}`].filter(Boolean).join("\n")).slice(0, 1500);

  const submit = async (e) => {
    e.preventDefault();
    if (none) return;
    const er = {};
    if (!file || uploading) er.resume = uploading ? "Wait for the upload to finish." : "Upload your current resume (PDF).";
    if (mode === "jd") {
      if (f.jobDescription.trim().length < 80) er.jobDescription = "Paste the full job description (at least a few lines).";
      else if (!jd.ok) er.jobDescription = `${jd.reason} Paste the real job posting.`;
    } else {
      if (f.targetRole.trim().length < 2) er.targetRole = "Name the position you are aiming for.";
      if (!f.level) er.level = "Pick your experience level.";
      if (f.skills.trim().length < 8) er.skills = "List a few skills or strengths you want shown.";
    }
    setErrors(er);
    if (Object.keys(er).length) { toast.error("Please fill the highlighted fields."); return; }
    setBusy(true);
    try {
      const d = await builderTailor({ resume: { key: file.key, filename: file.filename }, jobDescription: mode === "jd" ? f.jobDescription : "", details: details(), targetRole: f.targetRole, kind: f.kind || (f.level === "Student / Fresher" ? "student" : "professional") });
      nav(`${BASE}/${d.id}`, { replace: true });
    } catch (err) { toast.error(errMsg(err)); setBusy(false); }
  };

  if (busy) return <Working title="Starting…" lines={["Sending your resume to our reader"]} />;

  return (
    <form onSubmit={submit} className="rvb-form" style={{ maxWidth: 720 }} noValidate>
      <div>
        <Btn as={Link} to={BASE} variant="ghost" size="sm"><ArrowLeft size={15} weight="bold" aria-hidden /> My resumes</Btn>
        <h1 className="rv-h2" style={{ marginTop: 14 }}>Build a one-page resume with AI</h1>
        <p className="rv-muted" style={{ marginTop: 8 }}>Upload your resume and tell us the job you want. We keep your real jobs, projects and links, ask only about what is missing, and never invent anything. You can edit every line afterwards.</p>
      </div>

      {none ? (
        <section className="rv-card rv-card-pad rvb-credit is-out" role="status">
          <Lock size={22} weight="duotone" aria-hidden />
          <div><b>You have no resume builder credits left</b><p className="rv-sm rv-muted">Each build uses one credit. Get a plan with resume builds to continue.</p></div>
          <Btn as={Link} to="/resume-review/app/plans?type=builder" size="sm"><Stack size={15} weight="bold" aria-hidden /> Get credits</Btn>
        </section>
      ) : (
        <p className="rvb-credit" role="status"><MagicWand size={18} weight="duotone" aria-hidden /><span>This build uses <b>1</b> of your <b className="rv-mono">{status.left}</b> resume build credit{status.left === 1 ? "" : "s"}. Starting over on a failed run is free.</span></p>
      )}

      <section className="rv-card rv-card-pad" style={{ display: "grid", gap: 18 }}>
        <Field required label="Your current resume (PDF)" error={errors.resume}><Dropzone file={file} progress={progress} uploading={uploading} onPick={pick} onClear={() => setFile(null)} /></Field>

        <Field label="Do you have a job description?">
          <div className="rvb-seg" role="radiogroup" aria-label="Job description">
            <button type="button" role="radio" aria-checked={mode === "jd"} className={cx(mode === "jd" && "on")} onClick={() => { setMode("jd"); setErrors({}); }}>Yes, I'll paste it</button>
            <button type="button" role="radio" aria-checked={mode === "role"} className={cx(mode === "role" && "on")} onClick={() => { setMode("role"); setErrors({}); }}>No, I'll describe the role</button>
          </div>
        </Field>

        {mode === "jd" ? (
          <>
            <Field required label="Job description" error={errors.jobDescription} hint={`${f.jobDescription.length}/10000. We match your resume to it and ask only about skills it needs that your resume doesn't show.`}>
              <textarea className={cx("rv-input", errors.jobDescription && "bad")} rows={9} maxLength={10000} value={f.jobDescription} onChange={(e) => set({ jobDescription: e.target.value })} placeholder="Paste the job posting here…" />
            </Field>
            <Field optional label="Position (optional)" hint="Only if the posting doesn't make the title clear.">
              <input className="rv-input" maxLength={120} value={f.targetRole} onChange={(e) => set({ targetRole: e.target.value })} placeholder="Backend Developer" />
            </Field>
            <Field optional label="Anything we should know?" hint="Things missing from your resume: a project, internship, certificate, new skill. Only what is true.">
              <textarea className="rv-input" rows={3} maxLength={1500} value={f.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="e.g. I also built a chat app with Socket.io in my 3rd year…" />
            </Field>
          </>
        ) : (
          <>
            <p className="rv-sm rv-muted" style={{ marginTop: -6 }}>Without a job description, the AI needs a clear target. The more you tell us here, the better it writes.</p>
            <Field required label="Position you are aiming for" error={errors.targetRole}>
              <input className={cx("rv-input", errors.targetRole && "bad")} maxLength={120} value={f.targetRole} onChange={(e) => set({ targetRole: e.target.value })} placeholder="Full Stack Developer" />
            </Field>
            <Field required label="Your experience level" error={errors.level}>
              <div className="rvb-seg rvb-seg-wrap" role="radiogroup" aria-label="Experience level">
                {LEVELS.map((x) => <button key={x} type="button" role="radio" aria-checked={f.level === x} className={cx(f.level === x && "on")} onClick={() => set({ level: x, kind: x === "Student / Fresher" ? "student" : "professional" })}>{x}</button>)}
              </div>
            </Field>
            <Field required label="Skills and strengths to highlight" error={errors.skills} hint="The skills, tools or achievements you want a recruiter to notice. Only what is true.">
              <textarea className={cx("rv-input", errors.skills && "bad")} rows={3} maxLength={600} value={f.skills} onChange={(e) => set({ skills: e.target.value })} placeholder="e.g. React, Node.js, REST APIs, built and deployed 3 full-stack projects" />
            </Field>
            <div className="rvb-row">
              <Field optional label="Kind of company or industry"><input className="rv-input" maxLength={120} value={f.company} onChange={(e) => set({ company: e.target.value })} placeholder="Product startups, fintech" /></Field>
              <Field optional label="Preferred location"><input className="rv-input" maxLength={80} value={f.location} onChange={(e) => set({ location: e.target.value })} placeholder="Bengaluru or remote" /></Field>
            </div>
            <Field optional label="Anything else we should know?" hint="Missing projects, internships, certificates. Only what is true.">
              <textarea className="rv-input" rows={3} maxLength={500} value={f.notes} onChange={(e) => set({ notes: e.target.value })} placeholder="e.g. I also built a chat app with Socket.io in my 3rd year…" />
            </Field>
          </>
        )}
      </section>
      <Btn type="submit" block disabled={none}><MagicWand size={18} weight="bold" aria-hidden /> Build my resume{!none && " (uses 1 credit)"}</Btn>
    </form>
  );
}

/* a calm waiting screen: the work runs on the server, so leaving is fine */
function Working({ title, lines, leave = false }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => Math.min(x + 1, lines.length - 1)), 9000); return () => clearInterval(t); }, [lines.length]);
  return (
    <div className="rv-card rv-card-pad" style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" }} role="status" aria-live="polite">
      <span className="rv-spin" aria-hidden style={{ display: "inline-block", width: 28, height: 28 }} />
      <h2 className="rv-h3" style={{ marginTop: 16 }}>{title}</h2>
      <p className="rv-muted" style={{ marginTop: 8 }}>{lines[i]}…</p>
      {leave && <><p className="rv-xs rv-subtle" style={{ marginTop: 14 }}>This takes up to a minute. You don't have to wait here: it keeps going on our side, and your resume will be in “My resumes” when you come back.</p><Btn as={Link} to={BASE} variant="ghost" size="sm" style={{ marginTop: 12 }}>Go to my resumes</Btn></>}
    </div>
  );
}

/* the questions: only what the resume did not already say. Answers are saved as you type, so you can leave and finish later. */
const INFO_HINT = { email: ["you@example.com", "email"], phone: ["+91 98765 43210", "tel"], linkedin: ["linkedin.com/in/yourname", "url"], github: ["github.com/yourname", "url"] };

function Questions({ draft, onDone }) {
  const [gaps, setGaps] = useState(draft.gaps);
  const [busy, setBusy] = useState(false);
  const [tried, setTried] = useState(false);
  const [saved, setSaved] = useState("");
  const latest = useRef(draft.gaps);
  const dirty = useRef(false);
  const timer = useRef(null);
  const set = (id, patch) => setGaps((l) => { const n = l.map((g) => (g.id === id ? { ...g, ...patch } : g)); latest.current = n; dirty.current = true; clearTimeout(timer.current); timer.current = setTimeout(save, 800); return n; });
  const open = gaps.filter((g) => g.status === "open").length;
  const weak = (g) => g.status === "have" && g.detail.trim().length < 5;
  const toPayload = (l) => l.map((g) => ({ id: g.id, status: g.status, detail: g.detail, target: g.target || "" }));

  async function save() {
    if (!dirty.current) return true;
    dirty.current = false; setSaved("saving");
    try { await builderAnswers(draft.id, toPayload(latest.current)); setSaved("saved"); return true; }
    catch (e) { dirty.current = true; setSaved("error"); toast.error(errMsg(e)); return false; }
  }
  useEffect(() => () => { clearTimeout(timer.current); if (dirty.current) builderAnswers(draft.id, toPayload(latest.current)).catch(() => {}); }, [draft.id]);

  const go = async () => {
    setTried(true);
    if (open || gaps.some(weak)) { toast.error(open ? "Please answer every question, even if the answer is no." : "Add the missing detail first."); return; }
    setBusy(true);
    clearTimeout(timer.current);
    try {
      if (!(await save())) { setBusy(false); return; }
      onDone(await builderGenerate(draft.id));
    } catch (e) { toast.error(errMsg(e)); setBusy(false); }
  };

  if (busy) return <Working title="Starting…" lines={["Sending your answers"]} />;

  const info = gaps.filter((g) => g.kind === "info");
  const skills = gaps.filter((g) => g.kind !== "info");
  const card = (g) => {
    const isInfo = g.kind === "info";
    const [ph, type] = INFO_HINT[g.field] || ["", "text"];
    return (
      <section key={g.id} className="rv-card rv-card-pad" style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}><b style={{ fontSize: 17 }}>{g.keyword}</b><Pill tone={g.importance === "must" ? "warn" : ""}>{isInfo ? "Not on your resume" : g.importance === "must" ? "Required" : "Nice to have"}</Pill></div>
        <p className="rv-sm">{g.question}</p>
        <div className="rvb-seg" role="radiogroup" aria-label={g.keyword}>
          <button type="button" role="radio" aria-checked={g.status === "have"} className={cx(g.status === "have" && "on")} onClick={() => set(g.id, { status: "have" })}>{isInfo ? "I'll add it" : "Yes, I have it"}</button>
          <button type="button" role="radio" aria-checked={g.status === "none"} className={cx(g.status === "none" && "on")} onClick={() => set(g.id, { status: "none", detail: "" })}>{isInfo ? "Skip" : "No / not yet"}</button>
        </div>
        {tried && g.status === "open" && <p role="alert" className="rv-err">Pick one.</p>}
        {g.status === "have" && (isInfo ? (
          <Field label={g.keyword} error={tried && weak(g) ? "Add it here." : ""}><input type={type} className={cx("rv-input", tried && weak(g) && "bad")} maxLength={200} value={g.detail} onChange={(e) => set(g.id, { detail: e.target.value })} placeholder={ph} /></Field>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            <Field label="Which project or job did you use it in?" hint="We add it inside that one, in the same style as its other points. Leave on automatic and we'll match it from what you write.">
              <select className="rv-input" value={g.target || ""} onChange={(e) => set(g.id, { target: e.target.value })}>
                <option value="">Automatic: match it to the right project or job</option>
                {(draft.targets || []).map((t) => <option key={t.id} value={t.id}>{t.kind === "project" ? "Project" : "Job"}: {t.label}</option>)}
                <option value="none">None of these: add to my skills list only</option>
              </select>
            </Field>
            <Field label="What did you do with it, and what was the result?" error={tried && weak(g) ? "Add a line about what you did with it." : ""} hint="Say what you built or did, with which tools, and any real result (speed, users, time saved). We use only your words and never invent numbers.">
              <textarea className={cx("rv-input", tried && weak(g) && "bad")} rows={4} maxLength={700} value={g.detail} onChange={(e) => set(g.id, { detail: e.target.value })} placeholder="e.g. Used Claude Code to scaffold the three agents and refactor their tools, which cut setup time from 2 days to 3 hours." />
            </Field>
          </div>
        ))}
      </section>
    );
  };

  return (
    <div className="rvb-form" style={{ maxWidth: 720 }}>
      <div>
        <Btn as={Link} to={BASE} variant="ghost" size="sm"><ArrowLeft size={15} weight="bold" aria-hidden /> My resumes</Btn>
        <Kicker>{draft.source?.jobTitle ? `For ${draft.source.jobTitle}` : draft.source?.targetRole ? `For ${draft.source.targetRole}` : "Your resume"}</Kicker>
        <h1 className="rv-h2" style={{ marginTop: 8 }}>{gaps.length ? `${gaps.length} quick question${gaps.length > 1 ? "s" : ""}` : "Nothing missing"}</h1>
        <p className="rv-muted" style={{ marginTop: 8 }}>
          We read your resume first, so we only ask about what it doesn't say. We add something only if you say yes, using your own words. Your answers are saved as you go: you can leave and come back.
          {saved && <span className="rv-xs rv-subtle"> {saved === "saving" ? "Saving…" : saved === "error" ? "Not saved." : "Saved."}</span>}
        </p>
      </div>
      {info.length > 0 && <h2 className="rv-h3">Missing basics</h2>}
      {info.map(card)}
      {skills.length > 0 && <h2 className="rv-h3">Skills the job asks for</h2>}
      {skills.map(card)}
      <Btn onClick={go} block><MagicWand size={18} weight="bold" aria-hidden /> Write my resume</Btn>
    </div>
  );
}

/* ---------- the wizard ---------- */
function Editor({ id }) {
  const [d, setD] = useState(null);
  const [loadErr, setLoadErr] = useState("");
  const [state, setState] = useState("saved"); // saved | saving | error
  const [version, setVersion] = useState(0); // bumps after each successful save → preview refreshes
  const [tried, setTried] = useState(false);
  const [dl, setDl] = useState(false);
  const dirty = useRef(false);
  const timer = useRef(null);
  const latest = useRef(null);

  useEffect(() => {
    let dead = false;
    builderGet(id).then((x) => { if (dead) return; const m = merge(x); latest.current = m; setD(m); setVersion(1); }).catch((e) => !dead && setLoadErr(errMsg(e)));
    return () => { dead = true; };
  }, [id]);

  /* while the server is reading or writing, ask it every few seconds. This also picks the work back up when the person returns later. */
  const working = d?.phase === "reading" || d?.phase === "writing";
  useEffect(() => {
    if (!working) return undefined;
    const t = setInterval(() => { builderGet(id).then((x) => { if (x.phase !== "reading" && x.phase !== "writing") { const m = merge(x); latest.current = m; setD(m); setVersion((v) => v + 1); } }).catch(() => {}); }, 3000);
    return () => clearInterval(t);
  }, [id, working]);
  const [retrying, setRetrying] = useState(false);

  const flush = useCallback(async () => {
    if (!dirty.current || !latest.current) return true;
    dirty.current = false;
    setState("saving");
    try { await builderSave(id, payloadOf(latest.current)); setState("saved"); setVersion((v) => v + 1); return true; }
    catch (e) { dirty.current = true; setState("error"); toast.error(errMsg(e)); return false; }
  }, [id]);

  const up = (patch) => {
    const next = { ...latest.current, ...patch };
    latest.current = next; setD(next); dirty.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, 1100);
  };
  useEffect(() => () => { clearTimeout(timer.current); if (dirty.current) builderSave(id, payloadOf(latest.current)).catch(() => {}); }, [id]);

  const errors = useMemo(() => {
    const e = {};
    if (!d) return e;
    if (!d.basics.name.trim()) e.name = "Your name is needed.";
    if (!EMAIL_RE.test(d.basics.email.trim())) e.email = "Enter a valid email.";
    d.links.forEach((l, i) => { if (l.url.trim() && !URL_RE.test(l.url.trim())) e[`link${i}`] = "That doesn't look like a web address."; });
    d.projects.forEach((p, i) => {
      if (p.link.trim() && !URL_RE.test(p.link.trim())) e[`plive${i}`] = "Not a valid link.";
      if (p.repo.trim() && !URL_RE.test(p.repo.trim())) e[`prepo${i}`] = "Not a valid link.";
    });
    return e;
  }, [d]);

  const [redo, setRedo] = useState(false); // reopen the questions of a finished tailored resume
  const [view, setView] = useState("edit"); // phones: edit | preview
  const [open, setOpen] = useState({ about: true, summary: true, experience: true }); // which sections are expanded
  if (loadErr) return <div className="rv-card rv-card-pad"><p className="rv-err" role="alert">{loadErr}</p><Btn as={Link} to={BASE} variant="ghost" style={{ marginTop: 12 }}>Back to my resumes</Btn></div>;
  if (!d) return <Skeleton h={480} />;

  if (d.phase === "reading") return <Working leave title="Reading your resume…" lines={["Reading your resume", "Keeping your real jobs, projects and links", "Checking what is missing"]} />;
  if (d.phase === "writing") return <Working leave title="Writing your resume…" lines={["Using only what is true", "Fitting it on one page", "Matching the role's wording"]} />;
  if (d.phase === "failed") return (
    <div className="rv-card rv-card-pad" style={{ maxWidth: 560, margin: "40px auto", display: "grid", gap: 12 }}>
      <h2 className="rv-h3">That didn't finish</h2>
      <p className="rv-err" role="alert">{d.error || "Something went wrong."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Btn loading={retrying} onClick={async () => { setRetrying(true); try { const x = await builderRetry(id); const m = merge(x); latest.current = m; setD(m); } catch (e) { toast.error(errMsg(e)); } finally { setRetrying(false); } }}>Try again</Btn>
        <Btn as={Link} to={BASE} variant="ghost">My resumes</Btn>
      </div>
    </div>
  );
  if (d.phase === "questions" || (redo && d.gaps?.length)) {
    return <Questions key={redo ? "redo" : "first"} draft={d} onDone={(x) => { const m = merge(x); latest.current = m; setD(m); setRedo(false); setVersion((v) => v + 1); }} />;
  }

  const blocking = errors.name || errors.email;
  const toggle = (k) => setOpen((o) => ({ ...o, [k]: !o[k] }));
  const filled = {
    about: [d.basics.name, d.basics.email, d.basics.phone, d.basics.location].filter((x) => x?.trim()).length ? [d.basics.name, d.basics.headline].filter((x) => x?.trim()).join(" · ") : "",
    links: d.links.filter((l) => l.url?.trim()).length ? `${d.links.filter((l) => l.url?.trim()).length} link${d.links.filter((l) => l.url?.trim()).length === 1 ? "" : "s"}` : "None yet",
    summary: d.summary.trim() ? `${d.summary.trim().split(/\s+/).length} words` : "Empty",
    experience: d.experience.length ? `${d.experience.length} job${d.experience.length === 1 ? "" : "s"}` : "None",
    projects: d.projects.length ? `${d.projects.length} project${d.projects.length === 1 ? "" : "s"}` : "None",
    education: d.education.filter((e) => e.school?.trim()).length ? `${d.education.filter((e) => e.school?.trim()).length} entr${d.education.filter((e) => e.school?.trim()).length === 1 ? "y" : "ies"}` : "None",
    skills: `${d.skills.reduce((n, g) => n + g.items.length, 0)} skills`,
    extras: d.extras.some((g) => g.items.some((i) => i.trim())) ? `${d.extras.reduce((n, g) => n + g.items.filter((i) => i.trim()).length, 0)} items` : "None",
    look: `${TEMPLATES.find((t) => t.key === d.template)?.name || ""} template`,
  };

  const download = async () => {
    if (blocking) { setOpen((o) => ({ ...o, about: true })); setTried(true); setView("edit"); toast.error("Add your name and a valid email first."); return; }
    setDl(true);
    try {
      clearTimeout(timer.current);
      if (!(await flush())) return;
      const blob = await builderPdf(id, true);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${(d.basics.name || "resume").replace(/[^\w.-]+/g, "_")}_resume.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    } catch (e) { toast.error(errMsg(e)); } finally { setDl(false); }
  };

  return (
    <div className="rvb" data-view={view}>
      <div className="rvb-form rvb-form-body">
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
          <Btn as={Link} to={BASE} variant="ghost" size="sm"><ArrowLeft size={15} weight="bold" aria-hidden /> My resumes</Btn>
          <input className="rvb-title" aria-label="Resume name" value={d.title} maxLength={80} onChange={(e) => up({ title: e.target.value })} onBlur={() => { if (!d.title.trim()) up({ title: "My resume" }); }} />
        </div>

        <div className="rv-card rv-card-pad rvb-done">
          <div style={{ minWidth: 0 }}>
            <b className="rv-sm"><MagicWand size={15} weight="fill" aria-hidden /> {d.phase === "ready" ? `Your resume is ready${d.source?.jobTitle ? ` for ${d.source.jobTitle}` : d.source?.targetRole ? ` for ${d.source.targetRole}` : ""}` : "Edit your resume"}</b>
            <p className="rv-xs rv-muted" style={{ marginTop: 2 }}>Everything below is filled in from your resume. Change any line or link, and the preview updates. Only facts you confirmed were added.</p>
          </div>
          <div className="rvb-done-btns">
            {d.gaps?.length > 0 && d.phase === "ready" && <Btn variant="ghost" size="sm" onClick={() => setRedo(true)}>Change my answers</Btn>}
            <Btn onClick={download} loading={dl}><DownloadSimple size={17} weight="bold" aria-hidden /> Download PDF</Btn>
          </div>
        </div>

        <StrengthCard d={d} />

        <div className="rvb-tabs" role="tablist" aria-label="Edit or preview">
          <button type="button" role="tab" aria-selected={view === "edit"} className={cx(view === "edit" && "on")} onClick={() => setView("edit")}>Edit</button>
          <button type="button" role="tab" aria-selected={view === "preview"} className={cx(view === "preview" && "on")} onClick={() => setView("preview")}>Preview</button>
        </div>

        <div className="rvb-acc">
          {SECTIONS.map((sec) => (
            <section key={sec.key} className={cx("rv-card rvb-sec", open[sec.key] && "is-open")}>
              <button type="button" className="rvb-sec-head" aria-expanded={Boolean(open[sec.key])} aria-controls={`rvb-${sec.key}`} onClick={() => toggle(sec.key)}>
                <span><b>{sec.title}</b><small>{filled[sec.key]}</small></span>
                <CaretDown size={18} weight="bold" aria-hidden />
              </button>
              {open[sec.key] && (
                <div id={`rvb-${sec.key}`} className="rvb-sec-body">
                  {sec.key === "look" ? <LookPanel d={d} up={up} /> : <StepBody k={sec.key} d={d} up={up} errors={tried || sec.key !== "about" ? errors : {}} />}
                </div>
              )}
            </section>
          ))}
        </div>

        <Btn onClick={download} loading={dl} block><DownloadSimple size={18} weight="bold" aria-hidden /> Download PDF</Btn>
      </div>
      <Preview id={id} version={version} state={state} />
    </div>
  );
}

/* ---------- my resumes ---------- */
function Drafts({ status }) {
  const [items, setItems] = useState(null);
  useEffect(() => { builderList().then((x) => setItems(x.items || [])).catch((e) => { toast.error(errMsg(e)); setItems([]); }); }, []);

  const remove = async (it) => {
    const refund = it.phase !== "ready" ? " Its builder credit will be given back, because it was never finished." : "";
    if (!window.confirm(`Delete “${it.title}”? This can't be undone.${refund}`)) return;
    try { await builderDelete(it.id); setItems((l) => l.filter((x) => x.id !== it.id)); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <Kicker>Resume builder</Kicker>
        <h1 className="rv-h2" style={{ marginTop: 8 }}>Let AI write a resume for the job you want</h1>
        <p className="rv-muted" style={{ marginTop: 8, maxWidth: 580 }}>Upload your resume and paste a job description, or tell us the role you are aiming for. We turn it into a clean one-page, ATS-friendly PDF, keep your real jobs, projects and links, ask only about what is missing, and never add anything untrue. Then edit every line and link.</p>
      </div>

      <section className={cx("rv-card rv-card-pad rvb-credit", !status.canBuild && "is-out")} aria-label="Builder credits">
        <MagicWand size={22} weight="duotone" aria-hidden />
        <div><b>{status.canBuild ? `${status.left} resume build${status.left === 1 ? "" : "s"} left` : "No resume builder credits left"}</b><p className="rv-sm rv-muted">{status.canBuild ? "Each build uses one credit, taken when you press Build." : "Get a plan with resume builds to write another resume."}</p></div>
        {status.canBuild
          ? <Btn as={Link} to={`${BASE}/new`}><MagicWand size={16} weight="bold" aria-hidden /> Build a resume</Btn>
          : <Btn as={Link} to="/resume-review/app/plans?type=builder"><Stack size={16} weight="bold" aria-hidden /> Get credits</Btn>}
      </section>

      {items === null ? <Skeleton h={90} /> : items.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((it) => (
            <article key={it.id} className="rv-card rv-card-pad" style={{ display: "flex", gap: 14, alignItems: "center", justifyContent: "space-between" }}>
              <Link to={`${BASE}/${it.id}`} style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0, flex: 1, textDecoration: "none", color: "inherit" }}>
                <FilePdf size={30} weight="duotone" aria-hidden style={{ flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}><b>{it.title}</b>{it.phase === "questions" && <> <Pill tone="warn">{it.openQuestions ? `${it.openQuestions} question${it.openQuestions > 1 ? "s" : ""} waiting` : "Ready to write"}</Pill></>}{(it.phase === "reading" || it.phase === "writing") && <> <Pill>Working…</Pill></>}{it.phase === "failed" && <> <Pill tone="warn">Needs a retry</Pill></>}
                  <p className="rv-xs rv-subtle" style={{ marginTop: 2 }}>{[it.name, it.headline].filter(Boolean).join(" · ")}{it.updatedAt ? `${it.name || it.headline ? " · " : ""}edited ${dayFmt(it.updatedAt)}` : ""}</p></div>
              </Link>
              <button type="button" className="rv-btn rv-btn-ghost rv-btn-sm" aria-label={`Delete ${it.title}`} onClick={() => remove(it)}><Trash size={16} aria-hidden /></button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* the admin switched the builder off (for everyone, or for new members) */
function BuilderOff({ status }) {
  return (
    <div className="rv-card rv-card-pad" style={{ maxWidth: 560, margin: "40px auto", textAlign: "center", display: "grid", gap: 12 }} role="status">
      <Lock size={30} weight="duotone" aria-hidden style={{ margin: "0 auto" }} />
      <h1 className="rv-h3">The resume builder isn't available right now</h1>
      <p className="rv-muted">{status.mode === "existing" ? "It's no longer offered to new members." : "It's switched off for now. Your reviews and plans are not affected."}</p>
      <Btn as={Link} to="/resume-review/app" variant="ghost">Back to Resume Lab</Btn>
    </div>
  );
}

export default function ResumeBuilder() {
  const { id } = useParams();
  const status = useBuilderStatus(); // the admin's switch + this person's credits
  if (status.loading) return <Skeleton h={320} />;
  if (!status.visible) return <BuilderOff status={status} />;
  if (id === "new") return <TailorSetup status={status} />;
  return id ? <Editor key={id} id={id} /> : <Drafts status={status} />;
}
