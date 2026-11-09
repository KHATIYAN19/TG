import { useState } from "react";
import { Link } from "react-router-dom";
import { Ban, Gift, Loader2, MinusCircle, Search, ShieldCheck, Trash2 } from "lucide-react";

import { Btn, Chip, MoreSentinel, Person, STATUS, Table, inputCls, useCursorList, when } from "./AdminMemoryUi";

/*
  USERS TAB (loaded only when you open it). The list loads a page at a time as you scroll, so it stays fast with thousands of users.
  Each row can: give credits, take unused credits back, suspend or reinstate, and delete the account for good.
*/
const FILTERS = [["", "All users"], ["active", "Active"], ["suspended", "Suspended"], ["blocked", "Blocked"]];

export default function UsersTab({ http, run, setDialog }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const list = useCursorList({ http, path: "/users", params: { q, status } });

  const grant = (u) => setDialog({
    kind: "form", title: `Give page credits to ${u.email}`, label: "Give credits",
    fields: [{ name: "count", label: "How many credits?", type: "number", value: 1, min: 1, max: 50 }],
    onSubmit: async (v) => {
      const n = Number(v.count);
      const d = await run(() => http.post(`/users/${u.id}/credits`, { count: n }), `${n} credit${n === 1 ? "" : "s"} given`);
      if (!d) return false;
      list.patch(u.id, { credits: u.credits + n });
      return undefined;
    },
  });

  const take = (u) => setDialog({
    kind: "form", title: `Take back credits from ${u.email}`, label: "Remove credits",
    intro: `They have ${u.credits} unused credit${u.credits === 1 ? "" : "s"}. Credits already spent on a page can't be taken back.`,
    fields: [{ name: "count", label: "How many to remove?", type: "number", value: 1, min: 1, max: Math.max(1, u.credits) }],
    onSubmit: async (v) => {
      const d = await run(() => http.post(`/users/${u.id}/credits/remove`, { count: Number(v.count) }));
      if (!d || d === true) return false;
      list.patch(u.id, { credits: d.remaining });
      return undefined;
    },
  });

  const suspend = (u) => setDialog({
    kind: "form", title: `Suspend ${u.email}?`, label: "Suspend",
    intro: "They are signed out everywhere and can't log in, and their pages stop opening, until you reinstate the account. Nothing is deleted.",
    fields: [{ name: "reason", label: "Reason (optional, kept on the account)", maxLength: 300, placeholder: "e.g. Reported for harassment" }],
    onSubmit: async (v) => {
      const d = await run(() => http.post(`/users/${u.id}/suspend`, { reason: v.reason || undefined }), "Account suspended");
      if (!d) return false;
      list.patch(u.id, { status: "suspended", statusReason: v.reason || "" });
      return undefined;
    },
  });

  const reinstate = (u) => setDialog({
    kind: "confirm", tone: "primary", title: `Reinstate ${u.email}?`, text: "They can log in again and their pages open again.", label: "Reinstate",
    onSubmit: async () => { if (await run(() => http.post(`/users/${u.id}/unsuspend`), "Account reinstated")) list.patch(u.id, { status: "active", statusReason: "" }); },
  });

  const removeUser = (u) => setDialog({
    kind: "confirm", title: `Delete ${u.email}?`,
    text: `This permanently deletes the account${u.pages ? `, its ${u.pages} memory page${u.pages === 1 ? "" : "s"} with every photo, video and activity record,` : ""} and any unused credits. Payment orders are kept. This can't be undone.`,
    label: "Delete user",
    onSubmit: async () => { if (await run(() => http.delete(`/users/${u.id}`), "User deleted")) list.remove(u.id); },
  });

  const deletePages = (u) => setDialog({
    kind: "confirm", title: "Delete all memory pages?", label: "Delete pages",
    text: `All ${u.pages} memory page${u.pages === 1 ? "" : "s"} of ${u.email} and their photos and videos will be permanently deleted. The account stays.`,
    onSubmit: async () => { if (await run(() => http.delete(`/users/${u.id}/pages`), "Pages deleted")) list.patch(u.id, { pages: 0 }); },
  });

  const rows = list.items;
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search size={14} className="absolute left-3 top-3 text-slate-400" />
          <input className={`${inputCls} pl-8`} placeholder="Search name or email…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
        </div>
        <select className={`${inputCls} !w-auto`} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          {FILTERS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        {list.total != null && <span className="text-xs text-slate-500">{list.total} user{list.total === 1 ? "" : "s"}</span>}
        <Link to="/admin/users" className="text-xs font-semibold text-indigo-600 hover:underline">More account tools →</Link>
      </div>

      {list.initial ? (
        <div className="grid place-items-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-400"><Loader2 className="animate-spin" /></div>
      ) : (
        <Table rows={rows} empty="No users match" cols={[
          { h: "User", v: (u) => <Person name={u.name} email={u.email} /> },
          { h: "Role", v: (u) => <Chip>{u.role}</Chip> },
          { h: "Status", v: (u) => (
            <span title={u.statusReason || ""}><Chip className={u.status === "active" ? STATUS.active : u.status === "suspended" ? STATUS.closed : STATUS.blocked}>{u.status || "active"}</Chip></span>
          ) },
          { h: "Pages", v: (u) => u.pages },
          { h: "Credits", v: (u) => <span className={u.credits ? "font-semibold text-emerald-700" : "text-slate-400"}>{u.credits}</span> },
          { h: "Last login", v: (u) => <span className="whitespace-nowrap text-xs text-slate-500">{when(u.lastLoginAt)}</span> },
          { h: "Joined", v: (u) => <span className="whitespace-nowrap text-xs text-slate-500">{when(u.createdAt)}</span> },
          { h: "Actions", v: (u) => {
            const admin = u.role === "admin";
            return (
              <div className="flex flex-wrap gap-1.5">
                <Btn onClick={() => grant(u)}><Gift size={12} /> Give</Btn>
                <Btn disabled={!u.credits} title={u.credits ? "Take unused credits back" : "No unused credits"} onClick={() => take(u)}><MinusCircle size={12} /> Take</Btn>
                {u.status === "suspended"
                  ? <Btn tone="primary" onClick={() => reinstate(u)}><ShieldCheck size={12} /> Reinstate</Btn>
                  : <Btn disabled={admin} title={admin ? "Admin accounts can't be suspended" : "Suspend this account"} onClick={() => suspend(u)}><Ban size={12} /> Suspend</Btn>}
                {u.pages > 0 && <Btn tone="danger" title="Delete all this user's memory pages" onClick={() => deletePages(u)}>Pages</Btn>}
                <Btn tone="danger" disabled={admin} title={admin ? "Admin accounts can't be deleted" : "Delete this user permanently"} onClick={() => removeUser(u)}><Trash2 size={12} /></Btn>
              </div>
            );
          } },
        ]} />
      )}
      <MoreSentinel hasMore={list.hasMore} loading={list.loading && !list.initial} onMore={list.loadMore} shown={rows.length} total={list.total} />
    </div>
  );
}
