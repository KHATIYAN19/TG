import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  AlertTriangle, BadgeCheck, Briefcase, CalendarClock, EyeOff, Lock, Minus, Plus, Sparkles, Target, X,
} from "lucide-react";

import { useArena } from "../ArenaContext";
import {
  http, errMsg, TOPICS, LEVELS, LEVEL_HINTS, SLOTS, COMPANY_TYPES, LANGUAGES, SESSION_MODES, BUDDY_PREFS, TIMELINES,
  SKILL_SUGGESTIONS,
} from "../api";
import { Badge, Button, Card, ChipToggle, Field, OptionCard, Section, cx, inputClass } from "../ui";
import { looksLikeContact, CONTACT_WARNING } from "../piiHint";

/* ---------------------------------- schema ---------------------------------- */
const entityText = (max, label) =>
  z.string().trim().max(max, `${label} is too long`).refine((v) => !looksLikeContact(v, { entity: true }), CONTACT_WARNING);

const schema = z.object({
  topics: z.array(z.string()).min(1, "Pick at least one focus topic").max(5, "Pick up to 5 topics"),
  level: z.string().min(1, "Choose your level"),
  skills: z.array(z.string()).min(1, "Add at least one skill").max(12, "Up to 12 skills"),
  yearsExperience: z.coerce.number().int().min(0).max(40),
  companyType: z.string().min(1, "Choose where you work or study"),
  companyName: entityText(80, "Company name"),
  designation: entityText(60, "Job title"),
  targetCompanies: z.array(z.string()).max(8, "Up to 8 target companies"),
  languages: z.array(z.string()).min(1, "Pick at least one language").max(6),
  sessionsPerWeek: z.coerce.number().int().min(1).max(7),
  sessionModes: z.array(z.string()).min(1, "Pick at least one way to practise"),
  buddyPreference: z.string().min(1),
  timeline: z.string().min(1),
  availability: z.array(z.string()).min(1, "Pick at least one time slot"),
  bio: z.string().max(400).refine((v) => !looksLikeContact(v), CONTACT_WARNING),
  goal: z.string().max(200).refine((v) => !looksLikeContact(v), CONTACT_WARNING),
  contactEmail: z.string().trim().email("Enter a valid email").or(z.literal("")),
  contactPhone: z.string().trim().regex(/^[6-9]\d{9}$/, "Enter a 10-digit mobile number").or(z.literal("")),
  linkedin: z.string().trim().refine((v) => v === "" || /^https?:\/\/([a-z]{2,3}\.)?linkedin\.com\//i.test(v), "Enter a LinkedIn URL"),
});

const emptyForm = (user) => ({
  topics: [], level: "", skills: [], yearsExperience: 2, companyType: "", companyName: "", designation: "",
  targetCompanies: [], languages: ["english"], sessionsPerWeek: 2, sessionModes: ["chat"], buddyPreference: "any",
  timeline: "exploring", availability: [], bio: "", goal: "",
  contactEmail: user?.email ?? "", contactPhone: user?.mobile ?? "", linkedin: "",
});

const fromProfile = (p, user) => ({
  topics: p.topics ?? [], level: p.level, skills: p.skills, yearsExperience: p.yearsExperience, companyType: p.companyType,
  companyName: p.companyName || "", designation: p.designation || "", targetCompanies: p.targetCompanies ?? [],
  languages: p.languages?.length ? p.languages : ["english"], sessionsPerWeek: p.sessionsPerWeek ?? 2,
  sessionModes: p.sessionModes?.length ? p.sessionModes : ["chat"], buddyPreference: p.buddyPreference ?? "any",
  timeline: p.timeline ?? "exploring", availability: p.availability, bio: p.bio || "", goal: p.goal || "",
  contactEmail: p.contact?.email || user?.email || "", contactPhone: p.contact?.phone || user?.mobile || "", linkedin: p.contact?.linkedin || "",
});

const toggleIn = (list, value, max) =>
  list.includes(value) ? list.filter((x) => x !== value) : max && list.length >= max ? list : [...list, value];

/* ------------------------------ small components ------------------------------ */
function TagInput({ value, onChange, max, placeholder, lowercase, entity, label, suggestions = [] }) {
  const [draft, setDraft] = useState("");
  const [warn, setWarn] = useState("");

  const add = (raw) => {
    const clean = raw.trim().slice(0, 40);
    const item = lowercase ? clean.toLowerCase() : clean;
    if (!item) return;
    if (looksLikeContact(item, { entity })) return setWarn(CONTACT_WARNING);
    setWarn("");
    if (value.some((v) => v.toLowerCase() === item.toLowerCase()) || value.length >= max) return setDraft("");
    onChange([...value, item]);
    setDraft("");
  };

  const open = suggestions.filter((s) => !value.includes(s)).slice(0, 6);

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-xl border border-stone-300 dk:border-[#5a4336] bg-white dk:bg-[#241b15] p-2 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100 dk:focus-within:ring-orange-500/20">
        {value.map((s) => (
          <span key={s} className="inline-flex items-center gap-1 rounded-lg bg-orange-50 dk:bg-orange-500/10 px-2.5 py-1 text-sm font-medium text-orange-800 dk:text-orange-200">
            {s}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== s))} aria-label={`Remove ${s}`} className="rounded p-0.5 hover:bg-orange-100 dk:hover:bg-orange-500/15">
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        {value.length < max && (
          <input
            value={draft}
            aria-label={label}
            onChange={(e) => (e.target.value.endsWith(",") ? add(e.target.value.slice(0, -1)) : setDraft(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); add(draft); }
              if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
            }}
            onBlur={() => add(draft)}
            placeholder={value.length ? "Add another…" : placeholder}
            className="min-w-[6rem] flex-1 bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-stone-400 dk:placeholder:text-[#8f7c70]"
          />
        )}
      </div>
      {open.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-stone-500 dk:text-[#b9a79c]">Suggestions:</span>
          {open.map((s) => (
            <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-dashed border-stone-300 dk:border-[#5a4336] px-2.5 py-0.5 text-xs text-stone-600 dk:text-[#d6c4b8] hover:border-orange-400 hover:text-orange-700 dk:hover:text-orange-300">
              + {s}
            </button>
          ))}
        </div>
      )}
      {warn && <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs font-medium text-amber-700 dk:text-amber-300"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{warn}</p>}
    </div>
  );
}

function PiiTextArea({ id, value, onChange, rows, maxLength, placeholder, invalid, as: Tag = "textarea", entity }) {
  const flagged = looksLikeContact(value, { entity });
  return (
    <>
      <Tag id={id} rows={rows} maxLength={maxLength} value={value} onChange={onChange} placeholder={placeholder} className={inputClass(invalid || flagged)} />
      {flagged && (
        <p role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-amber-700 dk:text-amber-300">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {CONTACT_WARNING}
        </p>
      )}
    </>
  );
}

function YearsStepper({ value, onChange }) {
  const n = Number(value) || 0;
  const set = (v) => onChange(Math.min(40, Math.max(0, v)));
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={() => set(n - 1)} aria-label="Fewer years" className="grid h-10 w-10 place-items-center rounded-xl border border-stone-300 dk:border-[#5a4336] bg-white dk:bg-[#241b15] text-stone-700 dk:text-[#ead9cc] hover:bg-orange-50 dk:hover:bg-orange-500/10"><Minus className="h-4 w-4" /></button>
      <div className="min-w-[5.5rem] text-center">
        <span className="text-2xl font-bold text-[#29201b] dk:text-[#fff7ed]">{n}</span>
        <span className="ml-1 text-sm text-stone-500 dk:text-[#b9a79c]">{n === 1 ? "year" : "years"}</span>
      </div>
      <button type="button" onClick={() => set(n + 1)} aria-label="More years" className="grid h-10 w-10 place-items-center rounded-xl border border-stone-300 dk:border-[#5a4336] bg-white dk:bg-[#241b15] text-stone-700 dk:text-[#ead9cc] hover:bg-orange-50 dk:hover:bg-orange-500/10"><Plus className="h-4 w-4" /></button>
      <input type="range" min="0" max="20" value={Math.min(n, 20)} onChange={(e) => set(Number(e.target.value))} aria-label="Years of experience" className="ml-2 hidden h-2 flex-1 cursor-pointer accent-orange-600 sm:block" />
    </div>
  );
}

function Strength({ form }) {
  const checks = [
    form.topics.length > 0, !!form.level, form.skills.length >= 2, !!form.companyType, form.availability.length > 0,
    !!form.designation.trim(), !!form.companyName.trim(), form.bio.trim().length >= 40, form.goal.trim().length >= 10,
    form.targetCompanies.length > 0,
  ];
  const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  return (
    <div className="rounded-2xl border border-orange-200 dk:border-orange-500/25 bg-gradient-to-r from-orange-50 dk:from-orange-500/10 to-amber-50 dk:to-amber-500/10 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#29201b] dk:text-[#fff7ed]"><Sparkles className="h-4 w-4 text-orange-600 dk:text-orange-400" aria-hidden /> Profile strength</p>
        <span className="text-sm font-bold text-orange-700 dk:text-orange-300">{pct}%</span>
      </div>
      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-white dk:bg-[#241b15] ring-1 ring-orange-100 dk:ring-orange-500/20" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-stone-600 dk:text-[#d6c4b8]">Detailed profiles get accepted more often. Add a job title, your company and a short intro.</p>
    </div>
  );
}

/* ------------------------------- the form ------------------------------- */
export function ProfileForm({ me, refresh, onSaved, saveLabel }) {
  const profile = me.profile;
  const matchesPerEntry = me.entry?.matchesAllowed ?? me.settings.matchesPerEntry;

  const [form, setForm] = useState(() => (profile ? fromProfile(profile, me.user) : emptyForm(me.user)));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (key) => (value) => { setForm((f) => ({ ...f, [key]: value })); setErrors((e) => ({ ...e, [key]: undefined })); };
  const bind = (key) => ({ value: form[key], onChange: (e) => set(key)(e.target.value) });

  const suggestions = useMemo(
    () => [...new Set(form.topics.flatMap((t) => SKILL_SUGGESTIONS[t] ?? []))],
    [form.topics]
  );

  const save = async (event) => {
    event.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next = {};
      parsed.error.issues.forEach((i) => { next[i.path[0]] ||= i.message; });
      setErrors(next);
      toast.error("Please fix the highlighted fields", { id: "arena-form-invalid" });
      const first = Object.keys(next)[0];
      document.getElementById(`field-${first}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const v = parsed.data;
      await http.put("/profile", {
        topics: v.topics, level: v.level, skills: v.skills, yearsExperience: v.yearsExperience, companyType: v.companyType,
        companyName: v.companyName, designation: v.designation, targetCompanies: v.targetCompanies, languages: v.languages,
        sessionsPerWeek: v.sessionsPerWeek, sessionModes: v.sessionModes, buddyPreference: v.buddyPreference, timeline: v.timeline,
        availability: v.availability, bio: v.bio, goal: v.goal,
        contact: { email: v.contactEmail, phone: v.contactPhone, linkedin: v.linkedin },
      });
      toast.success(profile ? "Details saved" : "Details saved. Welcome to the arena!", { id: "arena-profile-saved" });
      await refresh();
      onSaved?.();
    } catch (e) {
      toast.error(errMsg(e), { id: "arena-profile-error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} noValidate className="space-y-5 pb-4">
      {profile?.status === "suspended" && (
        <div role="alert" className="rounded-2xl bg-rose-50 dk:bg-rose-500/10 p-4 text-sm text-rose-800 dk:text-rose-200 ring-1 ring-rose-100 dk:ring-rose-500/20">
          Your arena access is suspended{profile.suspendedReason ? `: ${profile.suspendedReason}` : ""}. Contact support if you think this is a mistake.
        </div>
      )}

      <Strength form={form} />

      <Section icon={Target} title="What are you preparing for?" subtitle="Pick every topic you want a buddy for."
        badge={profile && <Badge tone="brand"><EyeOff className="h-3 w-3" /> {profile.alias}</Badge>}>
        <div className="space-y-6">
          <div id="field-topics">
            <Field label="Focus topics" error={errors.topics} hint={`${form.topics.length} of 5 selected`}>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Focus topics">
                {TOPICS.map((t) => <ChipToggle key={t.value} selected={form.topics.includes(t.value)} onClick={() => set("topics")(toggleIn(form.topics, t.value, 5))}>{t.label}</ChipToggle>)}
              </div>
            </Field>
          </div>

          <div id="field-level">
            <Field label="Your level" error={errors.level}>
              <div className="flex flex-col gap-2.5 sm:flex-row" role="radiogroup" aria-label="Your level">
                {LEVELS.map((l) => <OptionCard key={l.value} selected={form.level === l.value} onClick={() => set("level")(l.value)} title={l.label} hint={LEVEL_HINTS[l.value]} />)}
              </div>
            </Field>
          </div>

          <div id="field-skills">
            <Field label="Skills" error={errors.skills} hint="Press Enter after each one. These help others find you.">
              <TagInput value={form.skills} onChange={set("skills")} max={12} lowercase label="Add a skill" placeholder="e.g. kafka, caching, spring boot" suggestions={suggestions} />
            </Field>
          </div>
        </div>
      </Section>

      <Section icon={Briefcase} title="Your background" subtitle="Shown on your card so people know who they're writing to.">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div id="field-designation">
              <Field label="Job title" htmlFor="designation" error={errors.designation}>
                <PiiTextArea as="input" entity id="designation" maxLength={60} value={form.designation} onChange={bind("designation").onChange} invalid={errors.designation} placeholder="e.g. Backend Engineer" />
              </Field>
            </div>
            <div id="field-companyName">
              <Field label="Company / college" htmlFor="companyName" error={errors.companyName} hint="Visible to other members">
                <PiiTextArea as="input" entity id="companyName" maxLength={80} value={form.companyName} onChange={bind("companyName").onChange} invalid={errors.companyName} placeholder="e.g. Zoho, IIT Madras" />
              </Field>
            </div>
          </div>

          <div id="field-companyType">
            <Field label="Where do you work or study?" error={errors.companyType}>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Company type">
                {COMPANY_TYPES.map((c) => <ChipToggle key={c.value} selected={form.companyType === c.value} onClick={() => set("companyType")(c.value)}>{c.label}</ChipToggle>)}
              </div>
            </Field>
          </div>

          <Field label="Years of experience">
            <YearsStepper value={form.yearsExperience} onChange={set("yearsExperience")} />
          </Field>

          <div id="field-targetCompanies">
            <Field label="Companies you're targeting" error={errors.targetCompanies} hint="Optional. Up to 8.">
              <TagInput value={form.targetCompanies} onChange={set("targetCompanies")} max={8} entity label="Add a target company" placeholder="e.g. Google, Amazon, Flipkart" />
            </Field>
          </div>
        </div>
      </Section>

      <Section icon={CalendarClock} title="How you like to practise" subtitle="Helps us show you buddies whose style fits yours.">
        <div className="space-y-6">
          <div id="field-availability">
            <Field label="When can you practise?" error={errors.availability}>
              <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Availability">
                {SLOTS.map((s) => (
                  <label key={s.value} className={cx("flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm font-medium transition-colors", form.availability.includes(s.value) ? "border-orange-500 bg-orange-50 dk:bg-orange-500/10 text-orange-900 dk:text-orange-100" : "border-stone-300 dk:border-[#5a4336] bg-white dk:bg-[#241b15] text-stone-700 dk:text-[#ead9cc] hover:bg-orange-50 dk:hover:bg-orange-500/10")}>
                    <input type="checkbox" className="h-4 w-4 accent-orange-600" checked={form.availability.includes(s.value)} onChange={() => set("availability")(toggleIn(form.availability, s.value))} />
                    {s.label}
                  </label>
                ))}
              </div>
            </Field>
          </div>

          <Field label="Sessions per week">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Sessions per week">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => <ChipToggle key={n} selected={form.sessionsPerWeek === n} onClick={() => set("sessionsPerWeek")(n)} className="min-w-[2.75rem] justify-center">{n}</ChipToggle>)}
            </div>
          </Field>

          <div id="field-sessionModes">
            <Field label="How do you want to practise?" error={errors.sessionModes}>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Practice mode">
                {SESSION_MODES.map((m) => <ChipToggle key={m.value} selected={form.sessionModes.includes(m.value)} onClick={() => set("sessionModes")(toggleIn(form.sessionModes, m.value))}>{m.label}</ChipToggle>)}
              </div>
            </Field>
          </div>

          <div id="field-languages">
            <Field label="Languages you're comfortable in" error={errors.languages}>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Languages">
                {LANGUAGES.map((l) => <ChipToggle key={l.value} selected={form.languages.includes(l.value)} onClick={() => set("languages")(toggleIn(form.languages, l.value, 6))}>{l.label}</ChipToggle>)}
              </div>
            </Field>
          </div>

          <Field label="When is your interview?">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Interview timeline">
              {TIMELINES.map((t) => <ChipToggle key={t.value} selected={form.timeline === t.value} onClick={() => set("timeline")(t.value)}>{t.label}</ChipToggle>)}
            </div>
          </Field>

          <Field label="Who would you like as a buddy?">
            <div className="flex flex-col gap-2.5 sm:flex-row" role="radiogroup" aria-label="Buddy preference">
              {BUDDY_PREFS.map((b) => <OptionCard key={b.value} selected={form.buddyPreference === b.value} onClick={() => set("buddyPreference")(b.value)} title={b.label} hint={b.hint} />)}
            </div>
          </Field>
        </div>
      </Section>

      <Section icon={Sparkles} title="About you" subtitle="No names, emails, phone numbers or links. Those stay private until you match.">
        <div className="space-y-5">
          <div id="field-bio">
            <Field label="Introduce yourself" htmlFor="bio" error={errors.bio} hint={`${form.bio.length}/400`}>
              <PiiTextArea id="bio" rows={4} maxLength={400} value={form.bio} onChange={bind("bio").onChange} invalid={errors.bio} placeholder="Backend dev preparing for product-company design rounds. Strong on APIs, weaker on distributed systems." />
            </Field>
          </div>
          <div id="field-goal">
            <Field label="What do you want from a buddy?" htmlFor="goal" error={errors.goal} hint={`${form.goal.length}/200`}>
              <PiiTextArea as="input" id="goal" maxLength={200} value={form.goal} onChange={bind("goal").onChange} invalid={errors.goal} placeholder="Weekly mock interviews and honest feedback" />
            </Field>
          </div>
        </div>
      </Section>

      <Section icon={Lock} title="Private contact details" subtitle="Never shown in the arena. After a match you choose which of these your buddy can see.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div id="field-contactEmail"><Field label="Contact email" htmlFor="cemail" error={errors.contactEmail}><input id="cemail" type="email" className={inputClass(errors.contactEmail)} {...bind("contactEmail")} /></Field></div>
          <div id="field-contactPhone"><Field label="Phone / WhatsApp" htmlFor="cphone" error={errors.contactPhone}><input id="cphone" inputMode="numeric" maxLength={10} className={inputClass(errors.contactPhone)} {...bind("contactPhone")} /></Field></div>
          <div id="field-linkedin" className="sm:col-span-2"><Field label="LinkedIn URL" htmlFor="linkedin" error={errors.linkedin}><input id="linkedin" className={inputClass(errors.linkedin)} placeholder="https://linkedin.com/in/…" {...bind("linkedin")} /></Field></div>
        </div>
      </Section>

      {/* Sticky action bar: always reachable on phones */}
      <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f0ded0] dk:border-[#443127] bg-white/95 dk:bg-[#241b15]/95 p-3 shadow-lg shadow-orange-900/40 dk:shadow-black/40 backdrop-blur sm:px-5">
        <p className="hidden text-sm text-stone-600 dk:text-[#d6c4b8] sm:block">
          Your entry includes <strong className="text-orange-700 dk:text-orange-300">{matchesPerEntry} {matchesPerEntry === 1 ? "match" : "matches"}</strong>, one after another.
        </p>
        <Button type="submit" size="lg" loading={saving} disabled={profile?.status === "suspended"} className="w-full sm:w-auto">
          {saveLabel || (profile ? "Save changes" : "Save details")}
        </Button>
      </div>
    </form>
  );
}

/* -------------------------- page (edit after joining) -------------------------- */
export default function ProfilePage() {
  const { me, refresh } = useArena();
  const profile = me.profile;
  const matched = profile?.status === "matched";
  const inArena = profile?.status === "active";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <ProfileForm me={me} refresh={refresh} />
      <aside className="space-y-4 lg:sticky lg:top-[calc(var(--arena-nav-h,5rem)+4rem)] lg:self-start">
        {inArena && (
          <Card className="p-6">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 dk:bg-emerald-500/15 text-emerald-700 dk:text-emerald-300"><BadgeCheck className="h-6 w-6" aria-hidden /></span>
            <h3 className="mt-4 text-lg font-semibold text-[#29201b] dk:text-[#fff7ed]">You're in the arena</h3>
            <p className="mt-1.5 text-sm text-stone-600 dk:text-[#d6c4b8]">Your profile is live. Changes you save here show up on your card straight away.</p>
            <Link to="../arena" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-500">Find a buddy</Link>
          </Card>
        )}
        {matched && (
          <Card className="p-6 text-sm text-stone-600 dk:text-[#d6c4b8]">
            <p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">You're matched 🎉</p>
            <Link to="../buddy" className="mt-3 inline-block font-semibold text-orange-700 dk:text-orange-300">Open my buddy →</Link>
          </Card>
        )}
      </aside>
    </div>
  );
}
