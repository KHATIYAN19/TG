import { Briefcase, Clock, Globe2, Sparkles, Target, UserRound, Video } from "lucide-react";

import { labelOf, TOPICS, LEVELS, SLOTS, COMPANY_TYPES, LANGUAGES, SESSION_MODES, TIMELINES, BUDDY_PREFS } from "./api";
import { Badge } from "./ui";

/* Short label for a topic, e.g. "System Design (HLD)" → "HLD". */
export const topicShort = (value) => TOPICS.find((t) => t.value === value)?.value ?? value;

export function TopicBadges({ topics = [], level }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {topics.map((t) => <Badge key={t} tone="brand">{topicShort(t)}</Badge>)}
      {level && <Badge>{labelOf(LEVELS, level)}</Badge>}
    </div>
  );
}

/* "Backend Engineer at Zoho · 4 yrs" with sensible fallbacks. */
export function BackgroundLine({ m, className = "" }) {
  const years = `${m.yearsExperience} yr${m.yearsExperience === 1 ? "" : "s"} experience`;
  const role = [m.designation, m.companyName && (m.designation ? `at ${m.companyName}` : m.companyName)].filter(Boolean).join(" ");

  return (
    <div className={`flex items-start gap-2 text-sm ${className}`}>
      <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-stone-400 dk:text-[#8f7c70]" aria-hidden />
      <div className="min-w-0">
        {role ? <p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{role}</p> : <p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{labelOf(COMPANY_TYPES, m.companyType)}</p>}
        <p className="text-xs text-stone-500 dk:text-[#b9a79c]">{role ? `${labelOf(COMPANY_TYPES, m.companyType)} · ` : ""}{years}</p>
      </div>
    </div>
  );
}

export function PracticeFacts({ m, full = false }) {
  return (
    <dl className="space-y-1.5 text-xs text-stone-500 dk:text-[#b9a79c]">
      <div className="flex items-start gap-2"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /><dt className="sr-only">Availability</dt><dd>{m.availability.map((a) => labelOf(SLOTS, a)).join(", ")}{m.sessionsPerWeek ? ` · ${m.sessionsPerWeek}×/week` : ""}</dd></div>
      {m.languages?.length > 0 && (
        <div className="flex items-start gap-2"><Globe2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /><dt className="sr-only">Languages</dt><dd>{m.languages.map((l) => labelOf(LANGUAGES, l)).join(", ")}</dd></div>
      )}
      {full && m.sessionModes?.length > 0 && (
        <div className="flex items-start gap-2"><Video className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /><dt className="sr-only">Practice mode</dt><dd>{m.sessionModes.map((s) => labelOf(SESSION_MODES, s)).join(", ")}</dd></div>
      )}
      {full && m.timeline && (
        <div className="flex items-start gap-2"><Target className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /><dt className="sr-only">Interview timeline</dt><dd>Interview: {labelOf(TIMELINES, m.timeline).toLowerCase()}</dd></div>
      )}
    </dl>
  );
}

export function TargetCompanies({ list = [] }) {
  if (!list.length) return null;
  return (
    <p className="text-xs text-stone-500 dk:text-[#b9a79c]">
      <span className="font-medium text-stone-600 dk:text-[#d6c4b8]">Targeting:</span> {list.join(", ")}
    </p>
  );
}

/* A labelled row inside the full-details panel. */
function Fact({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-orange-50 text-orange-700 dk:bg-orange-500/10 dk:text-orange-300"><Icon className="h-4 w-4" aria-hidden /></span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500 dk:text-[#b9a79c]">{label}</p>
        <div className="mt-0.5 break-words text-sm text-[#29201b] dk:text-[#fff7ed]">{children}</div>
      </div>
    </div>
  );
}

/*
  EVERYTHING a member shows in the arena, in one place: used on invitations so
  the person deciding can see exactly who is asking. Real name and contact
  details are never part of this (they're hidden until a match).
*/
export function MemberDetails({ m }) {
  const years = `${m.yearsExperience} year${m.yearsExperience === 1 ? "" : "s"} of experience`;
  const role = [m.designation, m.companyName && (m.designation ? `at ${m.companyName}` : m.companyName)].filter(Boolean).join(" ");

  return (
    <div className="space-y-5">
      <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
        <Fact icon={Briefcase} label="Role & company">
          <p className="font-semibold">{role || labelOf(COMPANY_TYPES, m.companyType)}</p>
          <p className="text-xs text-stone-500 dk:text-[#b9a79c]">{role ? `${labelOf(COMPANY_TYPES, m.companyType)} · ` : ""}{years}</p>
        </Fact>

        <Fact icon={Target} label="Preparing for">
          <div className="flex flex-wrap gap-1.5">{(m.topics ?? []).map((t) => <Badge key={t} tone="brand">{topicShort(t)}</Badge>)}<Badge>{labelOf(LEVELS, m.level)}</Badge></div>
          {m.timeline && <p className="mt-1 text-xs text-stone-500 dk:text-[#b9a79c]">Interview: {labelOf(TIMELINES, m.timeline).toLowerCase()}</p>}
        </Fact>

        <Fact icon={Clock} label="Availability">
          <p>{(m.availability ?? []).map((a) => labelOf(SLOTS, a)).join(", ") || "—"}</p>
          {m.sessionsPerWeek ? <p className="text-xs text-stone-500 dk:text-[#b9a79c]">{m.sessionsPerWeek} session{m.sessionsPerWeek === 1 ? "" : "s"} a week</p> : null}
        </Fact>

        <Fact icon={Video} label="Practice style">
          <p>{(m.sessionModes ?? []).map((s) => labelOf(SESSION_MODES, s)).join(", ") || "—"}</p>
          {m.buddyPreference && <p className="text-xs text-stone-500 dk:text-[#b9a79c]">Looking for: {labelOf(BUDDY_PREFS, m.buddyPreference).toLowerCase()} buddy</p>}
        </Fact>

        <Fact icon={Globe2} label="Languages">{(m.languages ?? []).map((l) => labelOf(LANGUAGES, l)).join(", ") || "—"}</Fact>

        {m.targetCompanies?.length > 0 && <Fact icon={Sparkles} label="Targeting">{m.targetCompanies.join(", ")}</Fact>}
      </div>

      {m.skills?.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-stone-500 dk:text-[#b9a79c]">Skills</p>
          <div className="flex flex-wrap gap-1.5">{m.skills.map((s) => <span key={s} className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-700 dk:bg-[#2c211b] dk:text-[#ead9cc]">{s}</span>)}</div>
        </div>
      )}

      {(m.bio || m.goal) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {m.bio && <Fact icon={UserRound} label="About"><p className="whitespace-pre-wrap">{m.bio}</p></Fact>}
          {m.goal && <Fact icon={Target} label="Wants from a buddy"><p className="whitespace-pre-wrap">{m.goal}</p></Fact>}
        </div>
      )}
    </div>
  );
}
