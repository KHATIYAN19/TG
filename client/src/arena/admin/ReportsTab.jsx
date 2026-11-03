import { useState } from "react";
import toast from "react-hot-toast";
import { Flag, Trash2 } from "lucide-react";

import { Badge, Button, EmptyState, Spinner, cx } from "../ui";
import { ConfirmModal, MUTED, Pager, StatusBadge, StatusPills, Table, Td, api, errMsg, fmtDateTime, humanize, useList } from "./shared";

const OPTIONS = [["open", "Open"], ["actioned", "Actioned"], ["dismissed", "Dismissed"], ["all", "All"]];

export default function ReportsTab() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [{ loading, data, error }, reload] = useList("/reports", { status, page });
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const resolve = async (id, body) => {
    try { await api.post(`/reports/${id}/resolve`, body); toast.success("Report resolved"); reload(); } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/reports/${del.id}`);
      toast.success("Report permanently deleted");
      setDel(null); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <StatusPills options={OPTIONS} value={status} counts={data?.counts} onChange={(v) => { setStatus(v); setPage(1); }} />

      {loading && !data ? <Spinner /> : error ? <EmptyState title="Couldn't load reports">{error}</EmptyState> : !data.items.length ? (
        <EmptyState icon={Flag} title={`No ${status === "all" ? "" : status} reports`} />
      ) : (
        <>
          <Table head={["Filed", "Reported by", "Reported member", "Reason", "Status", ""]}>
            {data.items.map((r) => (
              <tr key={r.id}>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(r.createdAt)}</Td>
                <Td>
                  {r.reporter ? <div className="min-w-[10rem]"><p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{r.reporter.name}</p><p className={cx("text-xs", MUTED)}>{r.reporter.alias}</p><p className="break-all text-xs">{r.reporter.email}</p></div> : <span className={MUTED}>(deleted)</span>}
                </Td>
                <Td>
                  {r.reported ? <div className="min-w-[10rem]"><p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{r.reported.realName}</p><p className={cx("text-xs", MUTED)}>{r.reported.alias} · {r.reported.status}</p><p className="break-all text-xs">{r.reported.email}</p></div> : <span className={MUTED}>(deleted)</span>}
                </Td>
                <Td className="max-w-xs">
                  <Badge tone="amber">{humanize(r.reason)}</Badge>
                  {r.details && <p className="mt-1.5 whitespace-pre-wrap break-words text-xs">{r.details}</p>}
                  {r.resolution && <p className={cx("mt-1.5 text-xs", MUTED)}>Note: {r.resolution}</p>}
                </Td>
                <Td><StatusBadge status={r.status} />{r.resolvedAt && <p className={cx("mt-1 text-xs", MUTED)}>{fmtDateTime(r.resolvedAt)}</p>}</Td>
                <Td className="whitespace-nowrap text-right">
                  <div className="flex flex-col items-end gap-2">
                    {r.status === "open" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => resolve(r.id, { status: "dismissed" })}>Dismiss</Button>
                        <Button size="sm" variant="danger" onClick={() => resolve(r.id, { status: "actioned", suspendReported: true, resolution: "Member suspended" })}>Suspend member</Button>
                      </>
                    )}
                    <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 dk:text-rose-300" onClick={() => setDel(r)}><Trash2 className="h-3.5 w-3.5" /> Delete permanently</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      )}

      <ConfirmModal open={Boolean(del)} onClose={() => setDel(null)} title="Delete this report permanently?" busy={busy} onConfirm={remove}>
        <p>This removes the report from the database for good. It <strong>can't be undone</strong> and there is no archive.</p>
        {del && <p className="mt-3 rounded-lg bg-stone-50 p-3 text-xs dk:bg-[#1c1612]">{humanize(del.reason)} · filed {fmtDateTime(del.createdAt)} · {del.status}{del.reported ? ` · about ${del.reported.realName}` : ""}</p>}
        <p className={cx("mt-3 text-xs", MUTED)}>The deletion is recorded in the activity log (what was deleted and by whom).</p>
      </ConfirmModal>
    </div>
  );
}
