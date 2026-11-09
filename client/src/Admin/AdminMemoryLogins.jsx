import { useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Trash2 } from "lucide-react";

import { Btn, Chip, MoreSentinel, Person, STATUS, Table, inputCls, useCursorList, when } from "./AdminMemoryUi";

/* LOGINS TAB (loaded only when you open it): the site-wide sign-in log, a page at a time as you scroll. */
export default function Logins({ http, run, setDialog }) {
  const [type, setType] = useState("all");
  const list = useCursorList({ http, path: "/logins", params: { type }, limit: 50 });

  const clear = (olderThanDays) => setDialog({
    kind: "confirm", title: "Clear login history?", label: "Clear",
    text: `${olderThanDays ? `Entries older than ${olderThanDays} days` : "All entries"} of the selected type (${type === "all" ? "logins, failures and logouts" : type === "success" ? "successful logins" : "failed attempts"}) will be permanently deleted.`,
    onSubmit: async () => { const d = await run(() => http.delete("/logins", { params: { type, ...(olderThanDays ? { olderThanDays } : {}) } })); if (d && d !== true) { toast.success(`${d.deleted} entries deleted`); list.reload(); } },
  });

  const rows = list.items;
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select className={`${inputCls} !w-auto`} value={type} onChange={(e) => setType(e.target.value)} aria-label="Type of entries">
          <option value="all">Logins, failures and logouts</option><option value="success">Successful logins</option><option value="failed">Failed attempts</option>
        </select>
        <span className="flex-1 text-xs text-slate-400">From the site-wide sign-in log{list.total != null ? ` · ${list.total} entries` : ""}</span>
        <Btn tone="danger" onClick={() => clear(30)}><Trash2 size={12} /> Clear older than 30 days</Btn>
        <Btn tone="danger" onClick={() => clear(0)}><Trash2 size={12} /> Clear all shown type</Btn>
      </div>
      {list.initial ? (
        <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400"><Loader2 className="animate-spin" /></div>
      ) : (
        <Table rows={rows} cols={[
          { h: "When", v: (e) => <span className="whitespace-nowrap text-xs">{when(e.at)}</span> },
          { h: "User", v: (e) => (e.user ? <Person name={e.user.name} email={e.user.email} /> : "-") },
          { h: "Event", v: (e) => <Chip className={e.action === "LOGIN_OTP_FAILED" || e.result === "failure" ? STATUS.failed : e.action === "LOGIN_SUCCESS" ? STATUS.success : undefined}>{e.action.replaceAll("_", " ").toLowerCase()}</Chip> },
          { h: "IP", v: (e) => e.ip || "-" },
          { h: "Device", v: (e) => <span className="block max-w-[260px] truncate text-xs text-slate-500" title={e.userAgent || ""}>{e.userAgent || "-"}</span> },
          { h: "", v: (e) => <Btn tone="danger" title="Delete this entry" onClick={() => setDialog({ kind: "confirm", title: "Delete this entry?", text: `${e.action.replaceAll("_", " ").toLowerCase()} · ${e.user?.email || "unknown user"} · ${when(e.at)}`, label: "Delete", onSubmit: async () => { if (await run(() => http.delete(`/logins/${e.id}`), "Entry deleted")) list.remove(e.id); } })}><Trash2 size={12} /></Btn> },
        ]} />
      )}
      <MoreSentinel hasMore={list.hasMore} loading={list.loading && !list.initial} onMore={list.loadMore} shown={rows.length} total={list.total} />
    </div>
  );
}
