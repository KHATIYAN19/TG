import { useState } from "react";
import toast from "react-hot-toast";
import { Gift, History, Minus, Plus } from "lucide-react";

import { Badge, Button, EmptyState, Field, Modal, Spinner, cx, inputClass } from "../ui";
import { MUTED, Pager, SearchBox, StatusBadge, Table, Td, api, errMsg, rupees2, useDebounced, useList } from "./shared";

const MAX = 20;

/* ---------------------------- give / take matches ---------------------------- */
function ManageMatches({ member, onClose, onDone }) {
  const e = member?.entry;
  const current = e?.matchesAllowed ?? 0;
  const used = e?.matchesUsed ?? 0;

  const [action, setAction] = useState("add");
  const [amount, setAmount] = useState(1);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const n = Math.max(0, Math.floor(Number(amount) || 0));
  const target = action === "add" ? current + n : action === "remove" ? current - n : n;
  const min = e ? used : 0;

  let problem = "";
  if (action !== "set" && n < 1) problem = "Enter at least 1";
  else if (target > MAX) problem = `A member can have at most ${MAX} matches`;
  else if (!e && target < 1) problem = "There's nothing to remove from a member with no matches";
  else if (e && target < min) problem = `They've already used ${used}, so the lowest you can set is ${used}`;
  else if (e && target === current && !(e.status === "consumed")) problem = "That's already their number of matches";

  const noEntry = !e || ["cancelled", "expired", "pending_payment"].includes(e.status);
  const reopening = e?.status === "consumed";

  const submit = async () => {
    setBusy(true);
    try {
      const { data } = await api.post(`/members/${member.id}/matches`, { action, amount: n, reason });
      toast.success(data.message, { duration: 6000 });
      onDone();
    } catch (err) { toast.error(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <Modal
      open={Boolean(member)}
      onClose={onClose}
      title={`Matches for ${member?.realName ?? ""}`}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={busy} disabled={Boolean(problem)}>{noEntry ? `Give ${n} free ${n === 1 ? "match" : "matches"}` : "Apply change"}</Button></>}
    >
      {member && (
        <div className="space-y-5">
          <div className="rounded-xl bg-orange-50/70 p-4 ring-1 ring-orange-100 dk:bg-orange-500/10 dk:ring-orange-500/20">
            {noEntry ? (
              <>
                <p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{member.realName} has no active entry</p>
                <p className="mt-1 text-xs text-stone-600 dk:text-[#d6c4b8]">Giving matches creates a <strong>free entry (₹0)</strong> and puts them straight into the arena. Because nothing was paid, it can never be refunded.</p>
              </>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xl font-bold tabular-nums text-[#29201b] dk:text-[#fff7ed]">{used} / {current}</span>
                  <span className={cx("text-sm", MUTED)}>matches used</span>
                  {e.complimentary ? <Badge tone="amber"><Gift className="h-3 w-3" /> free entry</Badge> : <Badge tone="brand">paid {rupees2(e.paidPaise)}</Badge>}
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-1 text-xs text-stone-600 dk:text-[#d6c4b8]">{e.matchesLeft} left. {reopening ? "All matches are used; raising the number re-opens the entry." : used > 0 ? `They've already used ${used}, so it can't go below that.` : ""}</p>
              </>
            )}
          </div>

          <Field label="What do you want to do?">
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Action">
              {[["add", "Add", Plus], ["remove", "Remove", Minus], ["set", "Set exactly", null]].map(([v, label, Icon]) => (
                <button key={v} type="button" role="radio" aria-checked={action === v} disabled={v === "remove" && !e}
                  onClick={() => setAction(v)}
                  className={cx("inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold disabled:opacity-40", action === v ? "border-orange-500 bg-orange-50 text-orange-800 ring-1 ring-orange-500 dk:bg-orange-500/10 dk:text-orange-200" : "border-stone-300 bg-white text-stone-700 hover:bg-orange-50 dk:border-[#5a4336] dk:bg-[#241b15] dk:text-[#ead9cc]")}>
                  {Icon && <Icon className="h-4 w-4" aria-hidden />}{label}
                </button>
              ))}
            </div>
          </Field>

          <Field label={action === "set" ? "Total matches" : "How many?"} htmlFor="am" error={problem}>
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Fewer" onClick={() => setAmount((a) => Math.max(0, (Number(a) || 0) - 1))} className="grid h-11 w-11 place-items-center rounded-xl border border-stone-300 bg-white text-stone-700 dk:border-[#5a4336] dk:bg-[#241b15] dk:text-[#ead9cc]"><Minus className="h-4 w-4" /></button>
              <input id="am" type="number" min={0} max={MAX} value={amount} onChange={(ev) => setAmount(ev.target.value)} className={cx(inputClass(Boolean(problem)), "w-24 text-center text-lg font-semibold")} />
              <button type="button" aria-label="More" onClick={() => setAmount((a) => Math.min(MAX, (Number(a) || 0) + 1))} className="grid h-11 w-11 place-items-center rounded-xl border border-stone-300 bg-white text-stone-700 dk:border-[#5a4336] dk:bg-[#241b15] dk:text-[#ead9cc]"><Plus className="h-4 w-4" /></button>
              <p className="text-sm text-stone-600 dk:text-[#d6c4b8]">→ <strong className="text-base tabular-nums text-[#29201b] dk:text-[#fff7ed]">{Math.max(0, target)}</strong> total</p>
            </div>
          </Field>

          <Field label="Reason (kept in the activity log)" htmlFor="rs"><input id="rs" maxLength={300} value={reason} onChange={(ev) => setReason(ev.target.value)} className={inputClass(false)} placeholder="e.g. goodwill after a payment issue" /></Field>

          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dk:bg-amber-500/10 dk:text-amber-200">This changes matches only. <strong>No money moves and no refund is issued</strong>, even when you reduce a paying member's matches.</p>
        </div>
      )}
    </Modal>
  );
}

/* ----------------------------------- tab ----------------------------------- */
export default function MembersTab({ openHistory }) {
  const [filters, setFilters] = useState({ q: "", status: "" });
  const [page, setPage] = useState(1);
  const dq = useDebounced(filters.q);
  const [{ loading, data, error }, reload] = useList("/profiles", { ...filters, q: dq, page });
  const [suspendTarget, setSuspendTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [manage, setManage] = useState(null);

  const suspend = async () => {
    try { await api.post(`/profiles/${suspendTarget.id}/suspend`, { reason }); toast.success("Suspended"); setSuspendTarget(null); setReason(""); reload(); }
    catch (e) { toast.error(errMsg(e)); }
  };
  const unsuspend = async (id) => {
    try { await api.post(`/profiles/${id}/unsuspend`); toast.success("Reinstated"); reload(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <SearchBox value={filters.q} onChange={(v) => { setPage(1); setFilters((f) => ({ ...f, q: v })); }} placeholder="Search name, email, phone, member ID, skill" className="min-w-[16rem] flex-1 sm:max-w-sm" />
        <select value={filters.status} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, status: e.target.value })); }} className={cx(inputClass(false), "max-w-[12rem]")} aria-label="Status">
          <option value="">All statuses</option>
          {["draft", "active", "matched", "suspended"].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading && !data ? <Spinner /> : error ? <EmptyState title="Couldn't load members">{error}</EmptyState> : !data.items.length ? <EmptyState title="No members found" /> : (
        <>
          <Table head={["Member", "Contact", "Focus", "Status", "Matches", ""]}>
            {data.items.map((m) => {
              const e = m.entry;
              return (
                <tr key={m.id}>
                  <Td><p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{m.realName}</p><p className={cx("text-xs", MUTED)}>{m.alias}</p></Td>
                  <Td><p className="break-all">{m.account?.email ?? m.contact?.email}</p><p className={cx("text-xs", MUTED)}>{m.account?.mobile ?? m.contact?.phone}</p></Td>
                  <Td>{m.topics?.join(", ")} · {m.level}<p className={cx("text-xs", MUTED)}>{[m.designation, m.companyName].filter(Boolean).join(" @ ") || m.skills.slice(0, 4).join(", ")}</p></Td>
                  <Td><StatusBadge status={m.status} />{m.suspendedReason && <p className="mt-1 max-w-[14rem] text-xs text-rose-600">{m.suspendedReason}</p>}</Td>
                  <Td className="min-w-[10rem]">
                    {e && ["paid", "in_match", "consumed"].includes(e.status) ? (
                      <>
                        <p className="font-semibold tabular-nums">{e.matchesUsed} / {e.matchesAllowed} <span className={cx("font-normal", MUTED)}>used</span></p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          <span className={cx("text-xs", MUTED)}>{e.matchesLeft} left</span>
                          {e.complimentary ? <Badge tone="amber"><Gift className="h-3 w-3" /> free</Badge> : <Badge tone="brand">{rupees2(e.paidPaise)}</Badge>}
                        </div>
                      </>
                    ) : <span className={MUTED}>No entry</span>}
                  </Td>
                  <Td className="whitespace-nowrap text-right">
                    <div className="flex flex-col items-end gap-2">
                      <Button size="sm" onClick={() => setManage(m)}><Gift className="h-3.5 w-3.5" /> {e && ["paid", "in_match", "consumed"].includes(e.status) ? "Manage matches" : "Give matches"}</Button>
                      <Button size="sm" variant="outline" onClick={() => openHistory({ userId: m.user, label: m.realName })}><History className="h-3.5 w-3.5" /> Match history</Button>
                      {m.status === "suspended"
                        ? <Button size="sm" variant="outline" onClick={() => unsuspend(m.id)}>Reinstate</Button>
                        : <Button size="sm" variant="danger" onClick={() => setSuspendTarget(m)}>Suspend</Button>}
                    </div>
                  </Td>
                </tr>
              );
            })}
          </Table>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      )}

      {manage && <ManageMatches key={manage.id} member={manage} onClose={() => setManage(null)} onDone={() => { setManage(null); reload(); }} />}

      <Modal open={Boolean(suspendTarget)} onClose={() => setSuspendTarget(null)} title={`Suspend ${suspendTarget?.realName}?`}
        footer={<><Button variant="ghost" onClick={() => setSuspendTarget(null)}>Cancel</Button><Button variant="danger" disabled={reason.trim().length < 3} onClick={suspend}>Suspend</Button></>}>
        <p>They're removed from the arena, pending requests are cancelled, chat is disconnected, and if matched their buddy isn't charged for the match.</p>
        <div className="mt-4"><Field label="Reason (shown to the member)" htmlFor="sr"><textarea id="sr" rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass(false)} /></Field></div>
      </Modal>
    </div>
  );
}
