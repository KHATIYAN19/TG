import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock, Linkedin, Mail, MessageCircle, Phone, Send, ShieldBan, Flag, UserRound, LogOut } from "lucide-react";

import { useArena } from "../ArenaContext";
import { http, errMsg } from "../api";
import { BackgroundLine, PracticeFacts, TargetCompanies, TopicBadges } from "../MemberBits";
import { Avatar, Button, Card, EmptyState, Field, Modal, Spinner, inputClass, cx } from "../ui";

const REASONS = [
  ["harassment", "Harassment"], ["spam", "Spam"], ["fake_profile", "Fake profile"],
  ["inappropriate_content", "Inappropriate content"], ["asked_for_money", "Asked for money"], ["other", "Other"],
];

const SHARED_ROWS = [
  ["name", "Name", UserRound],
  ["email", "Email", Mail],
  ["phone", "Phone / WhatsApp", Phone],
  ["linkedin", "LinkedIn", Linkedin],
];

const dayLabel = (d) => {
  const date = new Date(d);
  const today = new Date();
  const diff = Math.floor((new Date(today.toDateString()) - new Date(date.toDateString())) / 864e5);
  return diff === 0 ? "Today" : diff === 1 ? "Yesterday" : date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

function Chat({ matchId, buddyName, onMatchEnded }) {
  const { subscribe, sendFrame, socketState } = useArena();
  const [messages, setMessages] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);
  const scrollRef = useRef(null);
  const topRef = useRef(null);
  const anchor = useRef(null);          // scroll position to restore after older messages are added
  const lastIdRef = useRef(null);       // newest message id, to know when to scroll to the bottom
  const typingTimer = useRef(null);
  const lastTypingSent = useRef(0);

  // Latest 30 first; older ones load as you scroll up.
  useEffect(() => {
    let alive = true;
    lastIdRef.current = null;
    http.get("/match/messages", { params: { limit: 30 } })
      .then(({ data }) => { if (alive) { setMessages(data.data.messages); setHasMore(data.data.hasMore); } })
      .catch((e) => alive && (setMessages([]), setError(errMsg(e))));
    return () => { alive = false; };
  }, [matchId]);

  const loadOlder = useCallback(async () => {
    const oldest = messages?.[0];
    if (!oldest || !hasMore || loadingOlder) return;
    setLoadingOlder(true);
    const el = scrollRef.current;
    anchor.current = el ? { height: el.scrollHeight, top: el.scrollTop } : null;
    try {
      const { data } = await http.get("/match/messages", { params: { limit: 30, beforeId: oldest.id } });
      setMessages((list) => {
        const have = new Set(list.map((m) => m.id));
        return [...data.data.messages.filter((m) => !have.has(m.id)), ...list];
      });
      setHasMore(data.data.hasMore);
    } catch (e) {
      anchor.current = null;
      toast.error(errMsg(e), { id: "arena-chat-older" });
    } finally {
      setLoadingOlder(false);
    }
  }, [messages, hasMore, loadingOlder]);

  // Reaching the top of the conversation loads the next older page.
  useEffect(() => {
    const el = topRef.current;
    if (!el || !hasMore || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && loadOlder(), { root: scrollRef.current, rootMargin: "120px 0px 0px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadOlder, messages?.length]);

  // After older messages are inserted above, keep the reader on the same message.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (anchor.current && el) {
      el.scrollTop = el.scrollHeight - anchor.current.height + anchor.current.top;
      anchor.current = null;
    }
  }, [messages]);

  useEffect(() => subscribe((frame) => {
    if (frame.type === "message") {
      setMessages((list) => (list && !list.some((m) => m.id === frame.id)
        ? [...list, { id: frame.id, mine: frame.from === "me", text: frame.text, createdAt: frame.createdAt }]
        : list));
      if (frame.from !== "me") setTyping(false);
    } else if (frame.type === "typing") {
      setTyping(true);
      clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTyping(false), 2500);
    } else if (frame.type === "error") {
      toast.error(frame.message);
    } else if (frame.type === "match_ended") {
      onMatchEnded();
    }
  }), [subscribe, onMatchEnded]);

  // Jump to the bottom only for NEW messages (or typing), never when older ones load above.
  useEffect(() => {
    const newest = messages?.[messages.length - 1]?.id ?? null;
    if (newest !== lastIdRef.current || typing) {
      const first = lastIdRef.current === null;
      lastIdRef.current = newest;
      endRef.current?.scrollIntoView({ behavior: first ? "auto" : "smooth", block: "end" });
    }
  }, [messages, typing]);

  const send = () => {
    const value = text.trim();
    if (!value) return;
    if (!sendFrame({ type: "message", text: value })) return toast.error("You're offline. Reconnecting…");
    setText("");
  };

  const onChange = (e) => {
    setText(e.target.value);
    const now = Date.now();
    if (now - lastTypingSent.current > 2000) { lastTypingSent.current = now; sendFrame({ type: "typing" }); }
  };

  const grouped = useMemo(() => {
    const out = [];
    let lastDay = "";
    (messages ?? []).forEach((m) => {
      const day = dayLabel(m.createdAt);
      if (day !== lastDay) { out.push({ divider: day, key: `d-${m.id}` }); lastDay = day; }
      out.push(m);
    });
    return out;
  }, [messages]);

  return (
    <Card className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#f0ded0] dk:border-[#443127] px-5 py-3.5">
        <div className="flex items-center gap-3">
          <Avatar seed={buddyName} className="h-9 w-9 text-xs" />
          <div>
            <p className="text-sm font-semibold text-[#29201b] dk:text-[#fff7ed]">{buddyName}</p>
            <p className="text-xs text-stone-500 dk:text-[#b9a79c]">{typing ? <span className="text-orange-600 dk:text-orange-400">typing…</span> : "Your prep buddy"}</p>
          </div>
        </div>
        <span className={cx("flex items-center gap-1.5 text-xs", socketState === "open" ? "text-emerald-600 dk:text-emerald-400" : "text-stone-400 dk:text-[#8f7c70]")}>
          <span className={cx("h-2 w-2 rounded-full", socketState === "open" ? "bg-emerald-500" : "bg-stone-300 dk:bg-[#443127]")} />
          {socketState === "open" ? "Connected" : "Connecting…"}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto bg-[#fff8f2]/70 dk:bg-[#15110e]/70 px-4 py-5" aria-live="polite">
        {hasMore && <div ref={topRef} className="py-1 text-center text-xs text-stone-400 dk:text-[#8f7c70]">{loadingOlder ? "Loading earlier messages…" : "Scroll up for earlier messages"}</div>}
        {messages === null ? <Spinner label="Loading messages" /> : !grouped.length ? (
          <div className="grid h-full place-items-center text-center text-sm text-stone-500 dk:text-[#b9a79c]">
            <div>
              <MessageCircle className="mx-auto mb-3 h-8 w-8 text-stone-300" aria-hidden />
              Say hello and agree on your first session 👋
            </div>
          </div>
        ) : grouped.map((m) => m.divider ? (
          <div key={m.key} className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-stone-400 dk:text-[#8f7c70]">{m.divider}</div>
        ) : (
          <div key={m.id} className={cx("flex", m.mine ? "justify-end" : "justify-start")}>
            <div className={cx("max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm", m.mine ? "rounded-br-md bg-orange-600 text-white" : "rounded-bl-md bg-white dk:bg-[#241b15] text-stone-800 dk:text-[#ffedd5] ring-1 ring-[#f0ded0] dk:ring-[#443127]")}>
              {m.text}
              <span className={cx("mt-1 block text-right text-[10px]", m.mine ? "text-orange-200" : "text-stone-400 dk:text-[#8f7c70]")}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-end gap-2 border-t border-[#f0ded0] dk:border-[#443127] bg-white dk:bg-[#241b15] p-3">
        <textarea
          value={text} onChange={onChange} rows={1} maxLength={1000} aria-label="Message"
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Write a message…"
          className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-stone-300 dk:border-[#5a4336] px-3.5 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100 dk:focus:ring-orange-500/20"
        />
        <Button type="submit" disabled={!text.trim() || socketState !== "open"} aria-label="Send message"><Send className="h-4 w-4" /></Button>
      </form>
      {error && <p className="px-4 pb-3 text-xs text-rose-600 dk:text-rose-400">{error}</p>}
    </Card>
  );
}

export default function BuddyPage() {
  const { me, refresh, subscribe } = useArena();
  const [match, setMatch] = useState(null);
  const [state, setState] = useState("loading"); // loading | none | ready
  const [modal, setModal] = useState(null); // end | block | report
  const [reason, setReason] = useState("harassment");
  const [details, setDetails] = useState("");
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await http.get("/match");
      setMatch(data.data);
      setState("ready");
    } catch {
      setMatch(null);
      setState("none");
    }
  }, []);

  useEffect(() => { load(); }, [load, me?.match?.id]);
  useEffect(() => subscribe((f) => { if (f.type === "share_updated" || f.type === "matched") load(); }), [subscribe, load]);

  const ended = useCallback(() => { setMatch(null); setState("none"); refresh(); }, [refresh]);

  const run = async (fn, success) => {
    setWorking(true);
    try { await fn(); toast.success(success); setModal(null); } catch (e) { toast.error(errMsg(e)); } finally { setWorking(false); }
  };

  if (state === "loading") return <Spinner label="Loading your buddy" />;

  if (state === "none") {
    return (
      <EmptyState icon={MessageCircle} title="No buddy yet"
        action={<Link to={me.profile?.status === "active" ? "../arena" : "../profile"} className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white">
          {me.profile?.status === "active" ? "Browse the arena" : "Join the arena"}
        </Link>}>
        Once you and another member accept each other, your private chat and their shared details appear here.
      </EmptyState>
    );
  }

  const b = match.buddy;
  const displayName = b.shared.name || b.alias;
  const hint = (key) => (b.shared[key] ? null : "Not shared");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Avatar seed={displayName} className="h-14 w-14 text-base" />
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-[#29201b] dk:text-[#fff7ed]">{displayName}</p>
              <p className="text-xs text-stone-500 dk:text-[#b9a79c]">{b.alias}</p>
            </div>
          </div>
          <div className="mt-4"><TopicBadges topics={b.topics} level={b.level} /></div>
          <BackgroundLine m={b} className="mt-4" />
          {b.bio && <p className="mt-4 text-sm text-stone-600 dk:text-[#d6c4b8]">{b.bio}</p>}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {b.skills.map((s) => <span key={s} className="rounded-md bg-stone-100 dk:bg-[#2c211b] px-2 py-0.5 text-xs font-medium text-stone-700 dk:text-[#ead9cc]">{s}</span>)}
          </div>
          <div className="mt-4"><PracticeFacts m={b} full /></div>
          <div className="mt-2"><TargetCompanies list={b.targetCompanies} /></div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold text-[#29201b] dk:text-[#fff7ed]">Shared with you</h3>
          <ul className="mt-3 divide-y divide-orange-100 dk:divide-orange-500/20">
            {SHARED_ROWS.map(([key, label, Icon]) => (
              <li key={key} className="flex items-center gap-3 py-2.5 text-sm">
                <Icon className="h-4 w-4 shrink-0 text-stone-400 dk:text-[#8f7c70]" aria-hidden />
                <span className="w-28 shrink-0 text-stone-500 dk:text-[#b9a79c]">{label}</span>
                {b.shared[key] ? (
                  key === "linkedin"
                    ? <a href={b.shared[key]} target="_blank" rel="noopener noreferrer nofollow" className="truncate font-medium text-orange-600 dk:text-orange-400 hover:underline">View profile</a>
                    : <span className="truncate font-medium text-[#29201b] dk:text-[#fff7ed]">{b.shared[key]}</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-stone-400 dk:text-[#8f7c70]"><Lock className="h-3 w-3" aria-hidden /> {hint(key)}</span>
                )}
              </li>
            ))}
          </ul>
          <Link to="../settings" className="mt-3 inline-block text-xs font-semibold text-orange-600 dk:text-orange-400">Choose what you share →</Link>
        </Card>

        <Card className="p-3">
          <div className="grid gap-1">
            <Button variant="ghost" className="justify-start" onClick={() => setModal("report")}><Flag className="h-4 w-4" /> Report</Button>
            <Button variant="ghost" className="justify-start text-rose-600 dk:text-rose-400 hover:bg-rose-50 dk:hover:bg-rose-500/10" onClick={() => setModal("block")}><ShieldBan className="h-4 w-4" /> Block & end</Button>
            <Button variant="ghost" className="justify-start" onClick={() => setModal("end")} disabled={!match.canEndNow}><LogOut className="h-4 w-4" /> End partnership</Button>
            {!match.canEndNow && <p className="px-3 pb-2 text-xs text-stone-500 dk:text-[#b9a79c]">You can end the partnership from {new Date(match.endableAt).toLocaleDateString()}.</p>}
          </div>
        </Card>
      </aside>

      <Chat matchId={match.id} buddyName={displayName} onMatchEnded={ended} />

      <Modal open={modal === "end"} onClose={() => setModal(null)} title="End this partnership?"
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Keep going</Button><Button variant="danger" loading={working} onClick={() => run(async () => { await http.post("/match/end"); ended(); }, "Partnership ended")}>End partnership</Button></>}>
        <p>The chat closes for both of you. To find a new buddy later you'll need a <strong>new arena entry</strong> ({`₹${me.settings.entryPricePaise / 100}`}). This can't be undone.</p>
      </Modal>

      <Modal open={modal === "block"} onClose={() => setModal(null)} title={`Block ${displayName}?`}
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button variant="danger" loading={working} onClick={() => run(async () => { await http.post("/blocks", { profileId: b.id }); ended(); }, "Blocked")}>Block & end</Button></>}>
        <p>This ends your partnership immediately and you'll never see each other in the arena again. You'll need a new entry to match with someone else.</p>
      </Modal>

      <Modal open={modal === "report"} onClose={() => setModal(null)} title={`Report ${displayName}`}
        footer={<><Button variant="ghost" onClick={() => setModal(null)}>Cancel</Button><Button loading={working} onClick={() => run(() => http.post("/reports", { profileId: b.id, reason, details }), "Report submitted")}>Submit report</Button></>}>
        <Field label="Reason" htmlFor="rr">
          <select id="rr" value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass(false)}>
            {REASONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>
        <div className="mt-4"><Field label="Details (optional)" htmlFor="rd"><textarea id="rd" rows={3} maxLength={1000} value={details} onChange={(e) => setDetails(e.target.value)} className={inputClass(false)} /></Field></div>
      </Modal>
    </div>
  );
}
