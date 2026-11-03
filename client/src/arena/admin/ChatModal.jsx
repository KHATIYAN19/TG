import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Eye, Trash2 } from "lucide-react";

import { Button, Modal, Spinner, cx } from "../ui";
import { ConfirmModal, StatusBadge, api, errMsg, fmtDateTime, fmtDate, fmtTime, MUTED } from "./shared";

/*
  Admin view of a private chat. Opening it is written to the activity log
  (who looked, at which match, when), so this power is accountable.
*/
export default function ChatModal({ matchId, onClose, onChanged }) {
  const [state, setState] = useState({ loading: true, error: "", data: null });
  const [older, setOlder] = useState(false);
  const endRef = useRef(null);
  const [removing, setRemoving] = useState(null); // { type: "message" | "chat", id? }
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setState({ loading: true, error: "", data: null });
    try {
      const { data } = await api.get(`/matches/${matchId}/messages`, { params: { limit: 100 } });
      setState({ loading: false, error: "", data: data.data });
    } catch (e) {
      setState({ loading: false, error: errMsg(e), data: null });
    }
  }, [matchId]);

  useEffect(() => { if (matchId) load(); }, [matchId, load]);
  useEffect(() => { if (!older) endRef.current?.scrollIntoView({ block: "end" }); }, [state.data, older]);

  const loadOlder = async () => {
    const first = state.data?.messages?.[0];
    if (!first) return;
    setOlder(true);
    try {
      const { data } = await api.get(`/matches/${matchId}/messages`, { params: { limit: 100, before: first.createdAt } });
      setState((s) => ({ ...s, data: { ...s.data, hasMore: data.data.hasMore, messages: [...data.data.messages, ...s.data.messages] } }));
    } catch (e) {
      setState((s) => ({ ...s, error: errMsg(e) }));
    }
  };

  const confirmRemove = async () => {
    setBusy(true);
    try {
      if (removing.type === "chat") {
        const { data } = await api.delete(`/matches/${matchId}/messages`);
        toast.success(data.message);
        setState((s) => ({ ...s, data: { ...s.data, messages: [], total: 0, hasMore: false } }));
      } else {
        const { data } = await api.delete(`/messages/${removing.id}`);
        toast.success(data.message);
        setState((s) => ({ ...s, data: { ...s.data, total: Math.max(0, s.data.total - 1), messages: s.data.messages.filter((m) => m.id !== removing.id) } }));
      }
      setRemoving(null);
      if (onChanged) onChanged();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const d = state.data;
  const first = d?.members?.[0]?.userId;

  // Group by day for readability.
  let lastDay = "";

  return (
    <Modal open={Boolean(matchId)} onClose={onClose} wide title={d ? `Chat: ${d.members.map((m) => m.name).join(" & ")}` : "Chat"}>
      <p className="mb-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 dk:bg-amber-500/10 dk:text-amber-200">
        <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Members consider this chat private. Your name and the time you opened it are recorded in the activity log.
      </p>

      {state.loading && <Spinner label="Opening chat" />}
      {state.error && <p role="alert" className="py-8 text-center text-rose-600">{state.error}</p>}

      {d && (
        <>
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
            <StatusBadge status={d.match.status} />
            <span className={MUTED}>Matched {fmtDateTime(d.match.matchedAt)}</span>
            {d.match.endedAt && <span className={MUTED}>Ended {fmtDateTime(d.match.endedAt)}{d.match.endReason ? ` · ${d.match.endReason.replace(/_/g, " ")}` : ""}</span>}
            <span className={MUTED}>{d.total} message{d.total === 1 ? "" : "s"}</span>
            {d.total > 0 && (
              <Button size="sm" variant="ghost" className="ml-auto text-rose-600 hover:bg-rose-50 dk:text-rose-300 dk:hover:bg-rose-500/10" onClick={() => setRemoving({ type: "chat" })}>
                <Trash2 className="h-3.5 w-3.5" /> Delete whole chat
              </Button>
            )}
          </div>
          <div className="mb-3 grid gap-2 sm:grid-cols-2">
            {d.members.map((m) => (
              <div key={m.userId} className="rounded-xl bg-orange-50/60 px-3 py-2 text-xs ring-1 ring-orange-100 dk:bg-orange-500/10 dk:ring-orange-500/20">
                <p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{m.name} <span className={cx("font-normal", MUTED)}>· {m.alias}</span></p>
                <p className="break-all text-stone-600 dk:text-[#d6c4b8]">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
              </div>
            ))}
          </div>

          <div className="max-h-[50vh] space-y-2 overflow-y-auto rounded-2xl bg-[#fff8f2] p-3 ring-1 ring-[#f0ded0] dk:bg-[#15110e] dk:ring-[#443127] sm:p-4">
            {d.hasMore && <div className="text-center"><Button size="sm" variant="outline" onClick={loadOlder}>Load older messages</Button></div>}
            {!d.messages.length && <p className={cx("py-10 text-center text-sm", MUTED)}>No messages were sent in this match.</p>}
            {d.messages.map((m) => {
              const day = fmtDate(m.createdAt);
              const showDay = day !== lastDay;
              lastDay = day;
              const left = m.senderUserId === first;
              return (
                <div key={m.id}>
                  {showDay && <p className={cx("py-2 text-center text-[11px] font-semibold uppercase tracking-wide", MUTED)}>{day}</p>}
                  <div className={cx("flex", left ? "justify-start" : "justify-end")}>
                    <div className={cx("max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm", left ? "rounded-bl-md bg-white text-[#29201b] ring-1 ring-[#f0ded0] dk:bg-[#241b15] dk:text-[#fff7ed] dk:ring-[#443127]" : "rounded-br-md bg-orange-600 text-white")}>
                      <p className={cx("mb-0.5 text-[11px] font-semibold", left ? "text-orange-700 dk:text-orange-300" : "text-orange-100")}>{m.senderName}</p>
                      {m.deleted
                        ? <p className="italic opacity-80">🚫 Deleted by the sender</p>
                        : <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                      {m.reactions?.length > 0 && <p className="mt-1 text-sm" aria-label="Reactions">{m.reactions.join(" ")}</p>}
                      <p className={cx("mt-1 flex items-center justify-end gap-2 text-[10px]", left ? MUTED : "text-orange-100")}>
                        {m.edited && <span>edited</span>}
                        <span>{fmtTime(m.createdAt)}</span>
                        <button type="button" onClick={() => setRemoving({ type: "message", id: m.id })} aria-label="Delete this message permanently" title="Delete permanently" className="rounded p-0.5 opacity-70 hover:opacity-100 focus-visible:opacity-100"><Trash2 className="h-3 w-3" /></button>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
        </>
      )}

      <ConfirmModal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        busy={busy}
        onConfirm={confirmRemove}
        title={removing?.type === "chat" ? "Delete this whole chat?" : "Delete this message permanently?"}
        confirmWord={removing?.type === "chat" ? "DELETE" : undefined}
        confirmLabel={removing?.type === "chat" ? "Delete whole chat" : "Delete message"}
      >
        <p>{removing?.type === "chat" ? `All ${d?.total ?? 0} messages are removed from the database for both members. The match itself stays.` : "This message is removed from the database for both members."} It can't be undone, and any open chat window updates right away.</p>
      </ConfirmModal>
    </Modal>
  );
}
