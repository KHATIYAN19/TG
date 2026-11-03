import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, Lock, Linkedin, Mail, MessageCircle, MoreHorizontal, Pencil, Phone, Send, ShieldBan, SmilePlus, Flag, Trash2, UserRound, LogOut, X } from "lucide-react";

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

/* Keep in step with the server (services/arena/chat.js). */
const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🎉", "🔥"];

/* Re-renders on a timer so the "edit / delete for N more minutes" window closes by itself. */
function useNow(ms = 15000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

const minutesLeft = (until, now) => Math.max(0, Math.ceil((new Date(until).getTime() - now) / 60000));

/*
  One message's action menu: react with an emoji, and (own messages, first
  5 minutes only) edit or delete. Fixed-position so the scrolling chat never clips it.
*/
function MessageMenu({ message, canEdit, left, onReact, onEdit, onDelete, now }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const toggle = () => {
    if (open) return setOpen(false);
    const r = btnRef.current?.getBoundingClientRect();
    if (r) {
      const width = 240;
      const above = r.top > 150;
      setPos({
        top: above ? undefined : r.bottom + 6,
        bottom: above ? window.innerHeight - r.top + 6 : undefined,
        left: Math.min(Math.max(8, left ? r.left : r.right - width), window.innerWidth - width - 8),
        width,
      });
    }
    setConfirming(false);
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === "keydown" && e.key !== "Escape") return;
      if (e.type === "mousedown" && (menuRef.current?.contains(e.target) || btnRef.current?.contains(e.target))) return;
      setOpen(false);
      if (e.type === "keydown") btnRef.current?.focus();
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    window.addEventListener("resize", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
      window.removeEventListener("resize", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [open]);

  const mineReaction = message.reactions.find((r) => r.mine)?.emoji;

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label="Message options"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cx(
          "grid h-7 w-7 shrink-0 place-items-center self-center rounded-full text-stone-400 transition hover:bg-orange-100 hover:text-orange-700 focus-visible:opacity-100 dk:text-[#8f7c70] dk:hover:bg-orange-500/15 dk:hover:text-orange-300",
          open ? "opacity-100" : "opacity-60 sm:opacity-0 sm:group-hover:opacity-100"
        )}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </button>

      {open && pos && (
        <div
          ref={menuRef}
          role="menu"
          style={{ position: "fixed", top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width, zIndex: 80 }}
          className="rounded-2xl border border-[#f0ded0] bg-white p-2 shadow-xl dk:border-[#443127] dk:bg-[#241b15]"
        >
          <div className="grid grid-cols-8 gap-0.5" role="group" aria-label="React with an emoji">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                role="menuitem"
                aria-label={`React ${emoji}`}
                aria-pressed={mineReaction === emoji}
                onClick={() => { setOpen(false); onReact(emoji); }}
                className={cx("grid h-8 place-items-center rounded-lg text-lg transition hover:scale-125 hover:bg-orange-50 dk:hover:bg-orange-500/15", mineReaction === emoji && "bg-orange-100 dk:bg-orange-500/25")}
              >
                {emoji}
              </button>
            ))}
          </div>

          {canEdit && (
            <div className="mt-2 border-t border-[#f0ded0] pt-2 dk:border-[#443127]">
              <p className="px-2 pb-1 text-[11px] text-stone-500 dk:text-[#b9a79c]">You can edit or delete for {minutesLeft(message.editableUntil, now)} more min</p>
              <button type="button" role="menuitem" onClick={() => { setOpen(false); onEdit(); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-stone-700 hover:bg-orange-50 dk:text-[#ead9cc] dk:hover:bg-orange-500/10">
                <Pencil className="h-4 w-4" aria-hidden /> Edit message
              </button>
              {confirming ? (
                <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-2 py-1.5 dk:bg-rose-500/10">
                  <span className="flex-1 text-xs font-semibold text-rose-700 dk:text-rose-300">Delete for everyone?</span>
                  <button type="button" onClick={() => setConfirming(false)} className="rounded-md px-2 py-1 text-xs text-stone-600 hover:bg-white dk:text-[#d6c4b8]">No</button>
                  <button type="button" role="menuitem" onClick={() => { setOpen(false); onDelete(); }} className="rounded-md bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700">Delete</button>
                </div>
              ) : (
                <button type="button" role="menuitem" onClick={() => setConfirming(true)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dk:text-rose-300 dk:hover:bg-rose-500/10">
                  <Trash2 className="h-4 w-4" aria-hidden /> Delete message
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* Inline editor that replaces the bubble text while editing. */
function EditBox({ initial, onSave, onCancel, saving }) {
  const [value, setValue] = useState(initial);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); ref.current?.setSelectionRange(initial.length, initial.length); }, [initial]);
  const submit = () => { const v = value.trim(); if (v && v !== initial) onSave(v); else if (v === initial) onCancel(); };

  return (
    <div className="w-64 max-w-full sm:w-80">
      <textarea
        ref={ref}
        value={value}
        rows={Math.min(6, Math.max(2, value.split("\n").length))}
        maxLength={1000}
        aria-label="Edit message"
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
          if (e.key === "Escape") { e.preventDefault(); onCancel(); }
        }}
        className="w-full resize-none rounded-lg border border-orange-300 bg-white px-2.5 py-2 text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
      <div className="mt-1.5 flex justify-end gap-1.5">
        <button type="button" onClick={onCancel} disabled={saving} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-orange-100 hover:bg-white/15"><X className="h-3 w-3" aria-hidden /> Cancel</button>
        <button type="button" onClick={submit} disabled={saving || !value.trim()} className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-orange-700 hover:bg-orange-50 disabled:opacity-60"><Check className="h-3 w-3" aria-hidden /> Save</button>
      </div>
      <p className="mt-1 text-right text-[10px] text-orange-100">Enter to save · Esc to cancel</p>
    </div>
  );
}

function Chat({ matchId, buddyName, onMatchEnded }) {
  const { subscribe, sendFrame, socketState } = useArena();
  const [messages, setMessages] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const now = useNow();
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
        ? [...list, {
            id: frame.id, mine: frame.from === "me", text: frame.text, createdAt: frame.createdAt,
            deleted: Boolean(frame.deleted), edited: Boolean(frame.edited),
            editableUntil: frame.editableUntil ?? null, reactions: frame.reactions ?? [],
          }]
        : list));
      if (frame.from !== "me") setTyping(false);
    } else if (frame.type === "message_updated") {
      // edited / deleted / reacted: replace by id, keeping scroll position
      setMessages((list) => list && list.map((m) => (m.id === frame.message.id ? frame.message : m)));
      if (frame.message.deleted) setEditingId((id) => (id === frame.message.id ? null : id));
    } else if (frame.type === "message_removed") {
      setMessages((list) => list && list.filter((m) => m.id !== frame.id));
    } else if (frame.type === "chat_cleared") {
      setMessages([]);
      setHasMore(false);
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

  const replace = (updated) => setMessages((list) => list && list.map((m) => (m.id === updated.id ? updated : m)));

  const react = async (m, emoji) => {
    try { const { data } = await http.put(`/match/messages/${m.id}/reaction`, { emoji }); replace(data.data); }
    catch (e) { toast.error(errMsg(e), { id: "arena-chat-action" }); }
  };

  const saveEdit = async (m, value) => {
    setSavingId(m.id);
    try {
      const { data } = await http.patch(`/match/messages/${m.id}`, { text: value });
      replace(data.data);
      setEditingId(null);
    } catch (e) {
      toast.error(errMsg(e), { id: "arena-chat-action" });
      // the 5 minutes ran out while typing: leave edit mode
      if (["WINDOW_CLOSED", "ALREADY_DELETED"].includes(e?.response?.data?.code)) setEditingId(null);
    } finally { setSavingId(null); }
  };

  const remove = async (m) => {
    try { const { data } = await http.delete(`/match/messages/${m.id}`); replace(data.data); toast.success("Message deleted", { id: "arena-chat-action" }); }
    catch (e) { toast.error(errMsg(e), { id: "arena-chat-action" }); }
  };

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
          <div key={m.id} className={cx("group flex items-start gap-1", m.mine ? "flex-row-reverse" : "flex-row")}>
            <div className={cx("flex min-w-0 max-w-[80%] flex-col", m.mine ? "items-end" : "items-start")}>
              <div className={cx("whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm", m.mine ? "rounded-br-md bg-orange-600 text-white" : "rounded-bl-md bg-white dk:bg-[#241b15] text-stone-800 dk:text-[#ffedd5] ring-1 ring-[#f0ded0] dk:ring-[#443127]", m.deleted && "italic opacity-70")}>
                {editingId === m.id ? (
                  <EditBox initial={m.text} saving={savingId === m.id} onCancel={() => setEditingId(null)} onSave={(v) => saveEdit(m, v)} />
                ) : m.deleted ? (
                  <span>🚫 {m.mine ? "You deleted this message" : "This message was deleted"}</span>
                ) : m.text}
                <span className={cx("mt-1 flex items-center justify-end gap-1.5 text-[10px]", m.mine ? "text-orange-200" : "text-stone-400 dk:text-[#8f7c70]")}>
                  {m.edited && <span>edited</span>}
                  {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>

              {m.reactions?.length > 0 && (
                <div className="-mt-1.5 flex flex-wrap gap-1 px-1" aria-label="Reactions">
                  {m.reactions.map((r) => (
                    <button
                      key={r.emoji}
                      type="button"
                      aria-pressed={r.mine}
                      aria-label={`${r.emoji} ${r.count}${r.mine ? ", your reaction. Click to remove" : ""}`}
                      onClick={() => react(m, r.emoji)}
                      className={cx("inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-xs shadow-sm transition", r.mine ? "border-orange-400 bg-orange-50 text-orange-800 dk:border-orange-400/60 dk:bg-orange-500/20 dk:text-orange-100" : "border-[#f0ded0] bg-white text-stone-700 hover:border-orange-300 dk:border-[#443127] dk:bg-[#241b15] dk:text-[#ead9cc]")}
                    >
                      <span>{r.emoji}</span>{r.count > 1 && <span className="font-semibold tabular-nums">{r.count}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!m.deleted && editingId !== m.id && (
              <MessageMenu
                message={m}
                left={!m.mine}
                now={now}
                canEdit={m.mine && Boolean(m.editableUntil) && new Date(m.editableUntil).getTime() > now}
                onReact={(emoji) => react(m, emoji)}
                onEdit={() => setEditingId(m.id)}
                onDelete={() => remove(m)}
              />
            )}
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
