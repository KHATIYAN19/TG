import { useState } from "react";
import { ScrollText, Trash2 } from "lucide-react";

import { Badge, Button, EmptyState, Spinner, cx, inputClass } from "../ui";
import { ConfirmModal, MUTED, Pager, Table, Td, fmtDateTime, humanize, useDeleter, useList } from "./shared";

const ACTIONS = ["chat_viewed", "matches_adjusted", "report_deleted", "bug_deleted", "payments_exported", "profile_suspended", "profile_unsuspended", "match_dissolved", "repair_run", "settings_updated", "payment_refunded", "payment_deleted", "member_deleted", "reminder_sent", "audit_cleared"];
const TONE = { chat_viewed: "amber", report_deleted: "rose", bug_deleted: "rose", matches_adjusted: "brand", payments_exported: "slate", payment_refunded: "amber", payment_deleted: "rose", member_deleted: "rose", audit_cleared: "rose", profile_suspended: "rose", match_dissolved: "rose" };

export default function AuditTab() {
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [{ loading, data, error }, reload] = useList("/audit", { action, page });
  const { del, setDel, busy, run } = useDeleter(reload);
  const [clearing, setClearing] = useState(false);
  // Last row of a page removed: step back so the admin doesn't land on an empty page.
  const afterDelete = async (url) => {
    const ok = await run(url);
    if (ok && data?.items.length === 1 && page > 1) setPage(page - 1);
    if (ok) setClearing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Action" value={action} onChange={(e) => { setPage(1); setAction(e.target.value); }} className={cx(inputClass(false), "max-w-[15rem]")}>
          <option value="">All actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{humanize(a)}</option>)}
        </select>
        <p className={cx("text-xs", MUTED)}>Sensitive admin actions are recorded here: who did what, to whom, and when.</p>
        {data?.total > 0 && (
          <Button size="sm" variant="ghost" className="ml-auto text-rose-600 hover:bg-rose-50 dk:text-rose-300 dk:hover:bg-rose-500/10" onClick={() => setClearing(true)}><Trash2 className="h-3.5 w-3.5" /> Delete all</Button>
        )}
      </div>

      {loading && !data ? <Spinner /> : error ? <EmptyState title="Couldn't load the activity log">{error}</EmptyState> : !data.items.length ? <EmptyState icon={ScrollText} title="Nothing recorded yet" /> : (
        <>
          <Table head={["When", "Admin", "Action", "Details", ""]}>
            {data.items.map((a) => (
              <tr key={a.id}>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(a.at)}</Td>
                <Td><p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{a.admin?.name ?? "—"}</p><p className={cx("text-xs", MUTED)}>{a.admin?.email}</p></Td>
                <Td><Badge tone={TONE[a.action] ?? "slate"}>{humanize(a.action)}</Badge></Td>
                <Td className="max-w-md break-words">{a.summary}</Td>
                <Td className="text-right">
                  <button type="button" aria-label="Delete this log entry permanently" title="Delete" onClick={() => setDel(a)} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dk:text-rose-300 dk:hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                </Td>
              </tr>
            ))}
          </Table>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      )}

      <ConfirmModal open={Boolean(del)} onClose={() => setDel(null)} title="Delete this log entry permanently?" busy={busy} onConfirm={() => afterDelete(`/audit/${del.id}`)}>
        <p>“{del?.summary || humanize(del?.action)}” is removed from the activity log. This can't be undone.</p>
      </ConfirmModal>
      <ConfirmModal open={clearing} onClose={() => setClearing(false)} title="Delete the entire activity log?" confirmWord="DELETE" confirmLabel="Delete all permanently" busy={busy} onConfirm={() => afterDelete("/audit")}>
        <p>All <strong>{data?.total}</strong> entries are permanently removed, regardless of the filter or page. This can't be undone. One new entry recording the clearing is kept.</p>
      </ConfirmModal>
    </div>
  );
}
