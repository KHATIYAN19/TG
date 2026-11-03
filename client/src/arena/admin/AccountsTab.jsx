import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, Trash2, UserX, UserRoundPlus } from "lucide-react";

import { Badge, Button, EmptyState, Spinner, cx } from "../ui";
import { ConfirmModal, MUTED, Pager, SearchBox, Table, Td, fmtDateTime, useDebounced, useDeleter, useList } from "./shared";

/*
  Two lists the other tabs can't show:
    Deleted accounts            every account that was deleted (by the member or by an admin)
    Signed up, no profile       sign-ups that never created a Prep Buddy profile
*/

const KINDS = [
  ["deleted", "Deleted accounts", UserX],
  ["no_profile", "Signed up, no profile", UserRoundPlus],
];

const ago = (days) => (days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`);

function Who({ a }) {
  return (
    <div className="min-w-0">
      <p className="truncate font-semibold text-[#29201b] dk:text-[#fff7ed]">{a.name}</p>
      <p className={cx("break-all text-xs", MUTED)}>{a.anonymized ? "Details erased at deletion" : a.email}</p>
      {a.mobile && <p className={cx("text-xs", MUTED)}>{a.mobile}</p>}
      <p className={cx("mt-0.5 font-mono text-[10px]", MUTED)} title="Account id">{a.id}</p>
    </div>
  );
}

export default function AccountsTab() {
  const [kind, setKind] = useState("deleted");
  const [scope, setScope] = useState("arena");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const dq = useDebounced(q);

  const [{ loading, data, error }, reload] = useList("/accounts", { kind, scope, q: dq, page, pageSize: 20 });
  const { del, setDel, busy, run } = useDeleter(reload);
  const counts = data?.counts;

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); toast.success("Copied", { id: "acc-copy" }); } catch { toast.error("Couldn't copy"); }
  };

  const pick = (next) => { setKind(next); setPage(1); setQ(""); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Account lists">
        {KINDS.map(([key, label, Icon]) => {
          const n = key === "deleted" ? counts?.deleted : counts?.noProfile;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={kind === key}
              onClick={() => pick(key)}
              className={cx(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
                kind === key ? "bg-orange-600 text-white ring-orange-600" : "bg-white text-stone-700 ring-[#f0ded0] hover:bg-orange-50 dk:bg-[#241b15] dk:text-[#ead9cc] dk:ring-[#443127]"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden /> {label}
              <span className={cx("rounded-full px-2 py-0.5 text-xs", kind === key ? "bg-white/20" : "bg-orange-100 text-orange-800 dk:bg-orange-500/15 dk:text-orange-200")}>{n ?? "…"}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder={kind === "deleted" ? "Search name, email, mobile or account id" : "Search name, email or mobile"} className="min-w-[16rem] flex-1 sm:max-w-sm" />
        {kind === "no_profile" && (
          <select aria-label="Which accounts" value={scope} onChange={(e) => { setScope(e.target.value); setPage(1); }} className="rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-[#29201b] dk:border-[#5a4336] dk:bg-[#241b15] dk:text-[#fff7ed]">
            <option value="arena">Prep Buddy sign-ups only</option>
            <option value="all">All site accounts (incl. book buyers)</option>
          </select>
        )}
      </div>

      <p className={cx("text-xs", MUTED)}>
        {kind === "deleted"
          ? "Accounts a member deleted themselves are kept only as an empty record (their name, email and phone are erased on purpose). Accounts deleted by an admin keep their details. Members an admin removed permanently from the arena are gone from the database and can't be listed; the Activity log keeps a line for each."
          : scope === "arena"
            ? "People who verified their email in the Prep Buddy sign-up but never filled in a profile. Members who made a profile but haven't paid are in Members (status “draft”)."
            : "Every ordinary account that has no Prep Buddy profile, including customers who only bought a book and never used the arena."}
      </p>

      {loading && !data ? <Spinner /> : error ? <EmptyState title="Couldn't load accounts">{error}</EmptyState> : !data.items.length ? (
        <EmptyState icon={kind === "deleted" ? UserX : UserRoundPlus} title={kind === "deleted" ? "No deleted accounts" : "Nobody is stuck at sign-up"}>
          {q ? "Nothing matches your search." : kind === "deleted" ? "Accounts show up here once they are deleted." : "Everyone who signed up has created a profile."}
        </EmptyState>
      ) : kind === "deleted" ? (
        <>
          <Table head={["Account", "Signed up", "Deleted", "Deleted by", "", ""]}>
            {data.items.map((a) => (
              <tr key={a.id}>
                <Td className="min-w-[14rem]"><Who a={a} /></Td>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(a.signedUpAt)}</Td>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(a.deletedAt)}{a.keptFor !== null && <p className={cx("mt-0.5", MUTED)}>after {a.keptFor} day{a.keptFor === 1 ? "" : "s"}</p>}</Td>
                <Td className="text-xs">
                  <Badge tone={a.deletedBy === "member" ? "brand" : a.deletedBy === "admin" ? "amber" : "slate"}>{a.deletedBy === "member" ? "Member" : a.deletedBy === "admin" ? "Admin" : "Unknown"}</Badge>
                  {a.deletedByName && a.deletedBy === "admin" && <p className={cx("mt-1", MUTED)}>{a.deletedByName}</p>}
                </Td>
                <Td>{a.anonymized ? <Badge tone="slate">Details erased</Badge> : <Badge tone="amber">Details kept</Badge>}</Td>
                <Td className="whitespace-nowrap text-right">
                  <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 dk:text-rose-300 dk:hover:bg-rose-500/10" onClick={() => setDel(a)}><Trash2 className="h-3.5 w-3.5" /> Remove record</Button>
                </Td>
              </tr>
            ))}
          </Table>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      ) : (
        <>
          <Table head={["Account", "Source", "Signed up", "Last login", ""]}>
            {data.items.map((a) => (
              <tr key={a.id}>
                <Td className="min-w-[14rem]"><Who a={a} /></Td>
                <Td className="text-xs"><Badge tone={a.verified ? "brand" : "slate"}>{a.source}</Badge></Td>
                <Td className="whitespace-nowrap text-xs">{fmtDateTime(a.signedUpAt)}<p className={cx("mt-0.5", MUTED)}>{ago(a.daysSinceSignup)}</p></Td>
                <Td className="whitespace-nowrap text-xs">{a.lastLoginAt ? fmtDateTime(a.lastLoginAt) : <span className={MUTED}>Never</span>}</Td>
                <Td className="whitespace-nowrap text-right">
                  <div className="flex flex-col items-end gap-1.5">
                    <Button size="sm" variant="outline" onClick={() => copy(a.email)}><Copy className="h-3.5 w-3.5" /> Copy email</Button>
                    <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 dk:text-rose-300 dk:hover:bg-rose-500/10" onClick={() => setDel(a)}><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      )}

      <ConfirmModal
        open={Boolean(del)}
        onClose={() => setDel(null)}
        title={kind === "deleted" ? "Remove this deleted-account record?" : `Delete ${del?.name} permanently?`}
        confirmWord="DELETE"
        confirmLabel={kind === "deleted" ? "Remove record" : "Delete account forever"}
        busy={busy}
        onConfirm={() => run(`/members/${del.id}`)}
      >
        {kind === "deleted" ? (
          <p>This removes the empty record of an already-deleted account from the database, so it no longer appears here. Nothing else is affected. It can't be undone.</p>
        ) : (
          <>
            <p><strong>{del?.email}</strong> is permanently removed from the database with its login sessions. They never created a profile, so there is no arena data to lose. They can sign up again with the same email.</p>
            {del?.source !== "Prep Buddy sign-up" && <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dk:bg-amber-500/10 dk:text-amber-200">This is a site account (for example a book customer). Deleting it removes their login. Their orders are not touched.</p>}
          </>
        )}
      </ConfirmModal>
    </div>
  );
}
