import { useState } from "react";
import { ScrollText } from "lucide-react";

import { Badge, EmptyState, Spinner, cx, inputClass } from "../ui";
import { MUTED, Pager, Table, Td, fmtDateTime, humanize, useList } from "./shared";

const ACTIONS = ["chat_viewed", "matches_adjusted", "report_deleted", "bug_deleted", "payments_exported", "profile_suspended", "profile_unsuspended", "match_dissolved", "repair_run", "settings_updated"];
const TONE = { chat_viewed: "amber", report_deleted: "rose", bug_deleted: "rose", matches_adjusted: "brand", payments_exported: "slate", profile_suspended: "rose", match_dissolved: "rose" };

export default function AuditTab() {
  const [action, setAction] = useState("");
  const [page, setPage] = useState(1);
  const [{ loading, data, error }] = useList("/audit", { action, page });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select aria-label="Action" value={action} onChange={(e) => { setPage(1); setAction(e.target.value); }} className={cx(inputClass(false), "max-w-[15rem]")}>
          <option value="">All actions</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{humanize(a)}</option>)}
        </select>
        <p className={cx("text-xs", MUTED)}>Sensitive admin actions are recorded here: who did what, to whom, and when.</p>
      </div>

      {loading && !data ? <Spinner /> : error ? <EmptyState title="Couldn't load the activity log">{error}</EmptyState> : !data.items.length ? <EmptyState icon={ScrollText} title="Nothing recorded yet" /> : (
        <>
          <Table head={["When", "Admin", "Action", "Details"]}>
            {data.items.map((a) => (
              <tr key={a.id}>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(a.at)}</Td>
                <Td><p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{a.admin?.name ?? "—"}</p><p className={cx("text-xs", MUTED)}>{a.admin?.email}</p></Td>
                <Td><Badge tone={TONE[a.action] ?? "slate"}>{humanize(a.action)}</Badge></Td>
                <Td className="max-w-md break-words">{a.summary}</Td>
              </tr>
            ))}
          </Table>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      )}
    </div>
  );
}
