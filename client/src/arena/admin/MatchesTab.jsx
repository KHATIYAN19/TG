import { useState } from "react";
import toast from "react-hot-toast";
import { Handshake, MessageSquare, X } from "lucide-react";

import { Badge, Button, EmptyState, Modal, Spinner, cx } from "../ui";
import ChatModal from "./ChatModal";
import { MUTED, Pager, Person, SearchBox, StatusBadge, StatusPills, Table, Td, api, errMsg, fmtDateTime, humanize, useDebounced, useList } from "./shared";

const OPTIONS = [["", "All"], ["active", "Active now"], ["ended", "Ended"], ["dissolved", "Dissolved by admin"]];

export default function MatchesTab({ userFilter, clearUserFilter }) {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const [{ loading, data, error }, reload] = useList("/matches", { status, q: dq, page, user: userFilter?.userId });
  const [chat, setChat] = useState(null);
  const [target, setTarget] = useState(null);
  const [restore, setRestore] = useState([]);
  const [busy, setBusy] = useState(false);

  const dissolve = async () => {
    setBusy(true);
    try {
      await api.post(`/matches/${target.id}/dissolve`, { restoreProfileIds: restore });
      toast.success("Match dissolved");
      setTarget(null); setRestore([]); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      {userFilter && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-orange-50 px-4 py-2.5 text-sm text-orange-900 ring-1 ring-orange-100 dk:bg-orange-500/10 dk:text-orange-200 dk:ring-orange-500/20">
          Match history for <strong>{userFilter.label}</strong>
          <button onClick={clearUserFilter} className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-orange-100 dk:hover:bg-orange-500/20"><X className="h-3.5 w-3.5" /> Show everyone</button>
        </div>
      )}
      <StatusPills options={OPTIONS} value={status} counts={data?.counts} onChange={(v) => { setStatus(v); setPage(1); }} />
      {!userFilter && <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search either member: name, email, member ID" className="max-w-md" />}

      {loading && !data ? <Spinner /> : error ? <EmptyState title="Couldn't load matches">{error}</EmptyState> : !data.items.length ? (
        <EmptyState icon={Handshake} title="No matches found" />
      ) : (
        <>
          <Table head={["Members", "Matched", "Ended", "Lasted", "Messages", ""]}>
            {data.items.map((m) => (
              <tr key={m.id}>
                <Td>
                  <div className="space-y-2">{m.members.map((p) => <Person key={p.profileId} p={p} />)}</div>
                </Td>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(m.matchedAt)}</Td>
                <Td className="min-w-[11rem]">
                  <StatusBadge status={m.status} />
                  {m.endedAt ? (
                    <>
                      <p className={cx("mt-1 text-xs", MUTED)}>{fmtDateTime(m.endedAt)}</p>
                      <p className={cx("text-xs", MUTED)}>{humanize(m.endReason)}{m.endedBy ? ` · by ${m.endedBy.isMember ? m.endedBy.name : "admin"}` : ""}</p>
                    </>
                  ) : <p className={cx("mt-1 text-xs", MUTED)}>Still running</p>}
                </Td>
                <Td className="whitespace-nowrap">{m.durationDays} day{m.durationDays === 1 ? "" : "s"}</Td>
                <Td>
                  <Badge tone={m.messageCount ? "brand" : "slate"}>{m.messageCount}</Badge>
                  {m.lastMessageAt && <p className={cx("mt-1 text-xs", MUTED)}>last {fmtDateTime(m.lastMessageAt)}</p>}
                </Td>
                <Td className="whitespace-nowrap text-right">
                  <div className="flex flex-col items-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setChat(m.id)}><MessageSquare className="h-3.5 w-3.5" /> View chat</Button>
                    {m.status === "active" && <Button size="sm" variant="danger" onClick={() => { setTarget(m); setRestore([]); }}>Dissolve</Button>}
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      )}

      <ChatModal matchId={chat} onClose={() => setChat(null)} />

      <Modal open={Boolean(target)} onClose={() => setTarget(null)} title="Dissolve this match?"
        footer={<><Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button><Button variant="danger" loading={busy} onClick={dissolve}>Dissolve</Button></>}>
        <p>The chat closes for both. A member whose entry has matches left returns to the arena; otherwise they'd need a new entry. Tick anyone who did nothing wrong so this match <strong>doesn't count against them</strong>.</p>
        <div className="mt-4 space-y-2">
          {target?.members.map((p) => (
            <label key={p.profileId} className="flex items-center gap-2.5 rounded-xl border border-[#f0ded0] p-3 dk:border-[#443127]">
              <input type="checkbox" className="h-4 w-4" checked={restore.includes(p.profileId)} onChange={() => setRestore((r) => r.includes(p.profileId) ? r.filter((x) => x !== p.profileId) : [...r, p.profileId])} />
              Don't count this match for <strong>{p.name}</strong>
            </label>
          ))}
        </div>
      </Modal>
    </div>
  );
}
