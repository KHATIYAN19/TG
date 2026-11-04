import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Eye, EyeOff, Flag, Filter, Search, Send, ShieldBan, ShieldCheck, Sparkles, Target, Users } from "lucide-react";

import { useArena } from "../ArenaContext";
import { http, errMsg, errCode, TOPICS, LEVELS, SLOTS, COMPANY_TYPES, LANGUAGES } from "../api";
import { CardSkeletons, InfiniteFooter, useInfiniteList } from "../infinite";
import { BackgroundLine, PracticeFacts, TargetCompanies, TopicBadges } from "../MemberBits";
import { Avatar, Badge, Button, Card, EmptyState, Field, Modal, inputClass, cx } from "../ui";

const REASONS = [
  ["harassment", "Harassment"], ["spam", "Spam"], ["fake_profile", "Fake profile"],
  ["inappropriate_content", "Inappropriate content"], ["asked_for_money", "Asked for money"], ["other", "Other"],
];

function MemberCard({ m, canRequest, onRequest, onMenu }) {
  return (
    <Card className="flex flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar seed={m.alias} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[#29201b] dk:text-[#fff7ed]">{m.alias}</p>
          <div className="mt-1.5"><TopicBadges topics={m.topics} level={m.level} /></div>
          {m.compatible && <Badge tone="emerald" className="mt-1.5"><Sparkles className="h-3 w-3" /> Shares your topic</Badge>}
        </div>
        <button onClick={() => onMenu(m)} className="rounded-lg p-1.5 text-stone-400 dk:text-[#8f7c70] hover:bg-orange-100/60 dk:hover:bg-orange-500/15 hover:text-stone-700 dk:hover:text-[#ead9cc]" aria-label={`Report or block ${m.alias}`}>
          <Flag className="h-4 w-4" />
        </button>
      </div>

      {m.bio && <p className="mt-4 line-clamp-3 text-sm text-stone-700 dk:text-[#ead9cc]">{m.bio}</p>}
      {m.goal && (
        <p className="mt-3 flex gap-2 text-sm text-stone-600 dk:text-[#d6c4b8]"><Target className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" aria-hidden /><span className="line-clamp-2">{m.goal}</span></p>
      )}

      <div className="mt-4 flex flex-wrap gap-1.5">
        {m.skills.slice(0, 6).map((s) => <span key={s} className="rounded-md bg-stone-100 dk:bg-[#2c211b] px-2 py-0.5 text-xs font-medium text-stone-700 dk:text-[#ead9cc]">{s}</span>)}
        {m.skills.length > 6 && <span className="text-xs text-stone-500 dk:text-[#b9a79c]">+{m.skills.length - 6}</span>}
      </div>

      <BackgroundLine m={m} className="mt-4" />
      <div className="mt-3"><PracticeFacts m={m} /></div>
      <div className="mt-2"><TargetCompanies list={m.targetCompanies} /></div>

      <div className="mt-5 flex-1" />
      {m.requestState === "sent" && <Button variant="soft" disabled className="w-full">Request sent</Button>}
      {m.requestState === "received" && (
        <Link to="../requests" className="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">They want to match · View</Link>
      )}
      {m.requestState === "none" &&
        (canRequest ? (
          <Button onClick={() => onRequest(m)} className="w-full"><Send className="h-4 w-4" /> Send request</Button>
        ) : (
          <Link to="../profile" className="inline-flex w-full items-center justify-center rounded-xl bg-stone-900 dk:bg-[#1c1612] px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">Join the arena to send requests</Link>
        ))}
    </Card>
  );
}

export default function BrowsePage() {
  const { me, refresh } = useArena();
  const [filters, setFilters] = useState({ topic: "", level: "", slot: "", companyType: "", language: "", skill: "" });
  const [skill, setSkill] = useState("");
  const [debouncedSkill, setDebouncedSkill] = useState("");

  // Wait for typing to pause before searching by skill.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSkill(skill.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [skill]);

  const [target, setTarget] = useState(null);
  const [message, setMessage] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sending, setSending] = useState(false);
  const [menu, setMenu] = useState(null);
  const [reason, setReason] = useState("harassment");
  const [details, setDetails] = useState("");

  const params = useMemo(
    () => Object.fromEntries(Object.entries({ topic: filters.topic, level: filters.level, slot: filters.slot, companyType: filters.companyType, language: filters.language, skill: debouncedSkill }).filter(([, v]) => v)),
    [filters, debouncedSkill]
  );

  // Page 1 loads immediately; the next pages load as you scroll.
  const list = useInfiniteList(
    async (page) => {
      const { data } = await http.get("/browse", { params: { ...params, page } });
      const d = data.data;
      return { items: d.items, total: d.total, hasMore: d.page * d.pageSize < d.total };
    },
    [params]
  );
  const { items, total, loading, error, sessionEnded } = list;

  // New filters = a new list: start the reader at the top of the results.
  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [params]);
  const needsEntry = list.errorCode === "ENTRY_REQUIRED";

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const send = async () => {
    setSending(true);
    try {
      await http.post("/requests", { toProfileId: target.id, message: message.trim() });
      toast.success("Request sent. They'll see you anonymously.");
      setTarget(null);
      setMessage("");
      setMessageError("");
      list.patch(target.id, { requestState: "sent" }); // update the card in place; scroll position stays
      refresh();
    } catch (e) {
      // Contact details in the intro are rejected server-side; show it next to the box.
      if (errCode(e) === "VALIDATION_ERROR") setMessageError(errMsg(e)); else toast.error(errMsg(e));
    } finally {
      setSending(false);
    }
  };

  const block = async () => {
    try {
      await http.post("/blocks", { profileId: menu.id });
      toast.success(`${menu.alias} blocked`);
      setMenu(null);
      list.remove(menu.id);
    } catch (e) { toast.error(errMsg(e)); }
  };

  const report = async () => {
    try {
      await http.post("/reports", { profileId: menu.id, reason, details });
      toast.success("Report submitted. Thank you.");
      setMenu(null);
      setDetails("");
    } catch (e) { toast.error(errMsg(e)); }
  };

  if (needsEntry || !me.profile) return <Navigate to="/prep-buddy/app/join" replace />;

  return (
    <div>

      <div className="relative mb-6 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-5 dk:border-[#5a4336] dk:from-[#2a1d14] dk:via-[#241b15] dk:to-[#2a2016] sm:p-6">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="relative flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white shadow-sm shadow-orange-600/30 dk:bg-orange-500">
            <ShieldCheck className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <h2 className="text-base font-extrabold text-stone-900 dk:text-[#fff7ed] sm:text-lg">Thanks for purchasing! You&apos;re one of our first members. 🧡</h2>
            <p className="mt-1.5 text-sm leading-6 text-stone-600 dk:text-[#d9c7ba]">
              We&apos;re new here and still onboarding members, so you may not see many profiles yet. New people join every day, and we&apos;re working on
              {" "}<strong className="font-bold text-orange-700 dk:text-orange-300">bringing in more members, improving matching and adding more features.</strong>
              {" "}Keep your profile complete and check back often, so you&apos;re ready when your buddy arrives.
            </p>
            <p className="mt-2 text-xs font-semibold text-stone-500 dk:text-[#b9a79c]">Thank you for being one of the first to join and for helping us build this.</p>
          </div>
        </div>
      </div>

      {me.profile?.hidden && (
        <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dk:border-amber-500/40 dk:bg-amber-500/10 dk:text-amber-200">
          <p className="flex items-start gap-2"><EyeOff className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{me.profile.hiddenBy === "admin"
              ? "The Target Trek team has hidden your profile. Nobody can find you right now."
              : "Your profile is hidden. Nobody can find you in the arena, and you can't send requests until you show it again."}</span>
          </p>
          {me.profile.hiddenBy !== "admin" && (
            <Button size="sm" onClick={async () => {
              try { await http.put("/visibility", { hidden: false }); toast.success("Your profile is visible again", { id: "arena-visibility" }); await refresh(); }
              catch (e) { toast.error(errMsg(e), { id: "arena-visibility" }); }
            }}><Eye className="h-3.5 w-3.5" aria-hidden /> Show my profile</Button>
          )}
        </div>
      )}

      <Card className="mb-6 p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700 dk:text-[#ead9cc]"><Filter className="h-4 w-4" aria-hidden /> Filters</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["topic", "All topics", TOPICS], ["level", "Any level", LEVELS], ["slot", "Any time", SLOTS], ["companyType", "Any background", COMPANY_TYPES], ["language", "Any language", LANGUAGES],
          ].map(([key, placeholder, list]) => (
            <select key={key} aria-label={placeholder} value={filters[key]} onChange={setFilter(key)} className={inputClass(false)}>
              <option value="">{placeholder}</option>
              {list.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dk:text-[#8f7c70]" aria-hidden />
            <input aria-label="Filter by skill" placeholder="Skill, e.g. kafka" value={skill} onChange={(e) => setSkill(e.target.value)} className={cx(inputClass(false), "pl-9")} />
          </div>
        </div>
      </Card>

      {loading ? <CardSkeletons /> : error && !items.length ? (
        <EmptyState
          title={sessionEnded ? "Please sign in again" : "Couldn't load the arena"}
          action={sessionEnded
            ? <Link to="/prep-buddy/signup?mode=login" state={{ from: { pathname: "/prep-buddy/app/arena" } }} className="inline-flex items-center rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700">Sign in</Link>
            : <Button onClick={list.retry}>Try again</Button>}
        >
          {error}
        </EmptyState>
      ) : !items.length ? (
        <EmptyState icon={Users} title="No members match these filters">Try widening your filters. New members join all the time.</EmptyState>
      ) : (
        <>
          <p className="mb-4 flex items-center gap-1.5 text-sm text-stone-500 dk:text-[#b9a79c]"><EyeOff className="h-4 w-4" aria-hidden /> Names are hidden until you both accept. Showing {items.length} of {total} member{total === 1 ? "" : "s"}.</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((m) => <MemberCard key={m.id} m={m} canRequest onRequest={setTarget} onMenu={setMenu} />)}
          </div>
          <InfiniteFooter list={list} endLabel="That's everyone for now" />
        </>
      )}

      <Modal open={Boolean(target)} onClose={() => { setTarget(null); setMessageError(""); }} title={`Send a request to ${target?.alias}`}
        footer={<><Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button><Button onClick={send} loading={sending}>Send request</Button></>}>
        <p>A short intro makes it much more likely they'll accept. Your name stays hidden. <strong>Emails, phone numbers, links and social handles aren't allowed</strong> until you match.</p>
        <div className="mt-4">
          <Field label="Your message" htmlFor="intro" hint={`${message.length}/300`} error={messageError}>
            <textarea id="intro" rows={4} maxLength={300} value={message} onChange={(e) => { setMessage(e.target.value); setMessageError(""); }} className={inputClass(Boolean(messageError))} placeholder="Hi! I'm also prepping for HLD rounds and can do weekday evenings. Want to try a mock this week?" />
          </Field>
        </div>
        <p className="mt-3 text-xs text-stone-500 dk:text-[#b9a79c]">You can have up to {me.settings.maxOutgoingRequests} pending requests. Once you match with someone, you can't send or accept others.</p>
      </Modal>

      <Modal open={Boolean(menu)} onClose={() => setMenu(null)} title={`${menu?.alias ?? ""}`}
        footer={<><Button variant="danger" onClick={block}><ShieldBan className="h-4 w-4" /> Block</Button><Button onClick={report}>Submit report</Button></>}>
        <p className="mb-4">Block hides you from each other. Report tells our team about a problem.</p>
        <Field label="Reason for report" htmlFor="reason">
          <select id="reason" value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass(false)}>
            {REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <div className="mt-4">
          <Field label="Details (optional)" htmlFor="rdetails">
            <textarea id="rdetails" rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} className={inputClass(false)} />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
