import { useState } from "react";
import { ArrowRight, Inbox, MessageSquare, Trash2 } from "lucide-react";

import { Button, EmptyState, Spinner, cx } from "../ui";
import ChatModal from "./ChatModal";
import { ConfirmModal, MUTED, Pager, Person, SearchBox, StatusBadge, StatusPills, Table, Td, fmtDateTime, humanize, useDebounced, useDeleter, useList } from "./shared";

const OPTIONS = [["", "All"], ["pending", "Pending"], ["accepted", "Accepted"], ["rejected", "Rejected"], ["withdrawn", "Withdrawn"], ["cancelled", "Cancelled"], ["expired", "Expired"]];

/* What happened to the request, and when, in words. */
function Outcome({ r }) {
  if (r.status === "pending") return <p className={cx("mt-1 text-xs", MUTED)}>Waiting · expires {fmtDateTime(r.expiresAt)}</p>;
  const verb = { accepted: "Accepted", rejected: "Rejected", withdrawn: "Withdrawn by sender", cancelled: "Cancelled automatically", expired: "Expired" }[r.status];
  const when = r.status === "expired" ? r.expiresAt : r.respondedAt;
  return <p className={cx("mt-1 text-xs", MUTED)}>{verb} · {fmtDateTime(when)}</p>;
}

export default function RequestsTab() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);
  const [{ loading, data, error }, reload] = useList("/requests", { status, q: dq, page });
  const [chat, setChat] = useState(null);
  const { del, setDel, busy, run } = useDeleter(reload);

  return (
    <div className="space-y-4">
      <StatusPills options={OPTIONS} value={status} counts={data?.counts} onChange={(v) => { setStatus(v); setPage(1); }} />
      <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search sender or recipient: name, email, member ID" className="max-w-md" />

      {loading && !data ? <Spinner /> : error ? <EmptyState title="Couldn't load requests">{error}</EmptyState> : !data.items.length ? (
        <EmptyState icon={Inbox} title="No requests found">Try a different status or search.</EmptyState>
      ) : (
        <>
          <Table head={["Sent", "From", "", "To", "Message", "Status & timing", ""]}>
            {data.items.map((r) => (
              <tr key={r.id}>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(r.sentAt)}</Td>
                <Td><Person p={r.from} /></Td>
                <Td className="px-0 text-stone-400"><ArrowRight className="h-4 w-4" aria-label="sent to" /></Td>
                <Td><Person p={r.to} /></Td>
                <Td className="max-w-xs whitespace-pre-wrap break-words">{r.message || <span className={MUTED}>(no message)</span>}</Td>
                <Td className="min-w-[13rem]"><StatusBadge status={r.status} /><Outcome r={r} /></Td>
                <Td className="whitespace-nowrap text-right">
                  {r.matchId && <Button size="sm" variant="outline" onClick={() => setChat(r.matchId)}><MessageSquare className="h-3.5 w-3.5" /> View chat</Button>}
                  {r.matchId && <p className={cx("mt-1 text-[11px]", MUTED)}>partnership {humanize(r.matchStatus)}</p>}
                  <Button size="sm" variant="ghost" className="mt-2 text-rose-600 hover:bg-rose-50 dk:text-rose-300 dk:hover:bg-rose-500/10" onClick={() => setDel(r)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                </Td>
              </tr>
            ))}
          </Table>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      )}
      <ChatModal matchId={chat} onClose={() => setChat(null)} />

      <ConfirmModal open={Boolean(del)} onClose={() => setDel(null)} title="Delete this request permanently?" busy={busy} onConfirm={() => run(`/requests/${del.id}`)}>
        <p>This {del?.status} request{del?.message ? " and its intro message" : ""} is removed from the database for both members. It can't be undone.</p>
        {del?.status === "accepted" && <p className="mt-2 text-xs text-stone-500 dk:text-[#b9a79c]">The partnership it created is <strong>not</strong> affected. Use Matches to remove that.</p>}
      </ConfirmModal>
    </div>
  );
}
