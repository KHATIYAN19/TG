import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { BadgeIndianRupee, Bug, Flag, Handshake, Inbox, ScrollText, Settings2, Ticket, UserX, Users, Wallet } from "lucide-react";

import { adminHttp as api, errMsg, inr } from "./api";
import { Badge, Button, Card, EmptyState, Field, Modal, Spinner, Toggle, inputClass, cx } from "./ui";
import { useArenaChrome } from "./chrome";
import { Table, Td, useList } from "./admin/shared";
import MembersTab from "./admin/MembersTab";
import RequestsTab from "./admin/RequestsTab";
import MatchesTab from "./admin/MatchesTab";
import PaymentsTab from "./admin/PaymentsTab";
import ReportsTab from "./admin/ReportsTab";
import BugsTab from "./admin/BugsTab";
import AuditTab from "./admin/AuditTab";
import AccountsTab from "./admin/AccountsTab";

const TABS = [
  ["overview", "Overview & settings", Settings2],
  ["members", "Members", Users],
  ["accounts", "Accounts", UserX],
  ["requests", "Requests", Inbox],
  ["matches", "Matches", Handshake],
  ["payments", "Payments", Wallet],
  ["reports", "Reports", Flag],
  ["bugs", "Bug reports", Bug],
  ["coupons", "Coupons", Ticket],
  ["audit", "Activity log", ScrollText],
];

/* ------------------------------ overview ------------------------------ */
function Stat({ label, value, sub, tone }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500 dk:text-[#b9a79c]">{label}</p>
      <p className={cx("mt-2 text-2xl font-bold", tone || "text-[#29201b] dk:text-[#fff7ed]")}>{value}</p>
      {sub && <p className="mt-1 text-xs text-stone-500 dk:text-[#b9a79c]">{sub}</p>}
    </Card>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [repairing, setRepairing] = useState(false);

  const load = useCallback(() => {
    setLoadError("");
    api.get("/stats").then(({ data }) => setStats(data.data)).catch((e) => setLoadError(errMsg(e)));
    api.get("/settings").then(({ data }) => setForm(data.data)).catch((e) => setLoadError(errMsg(e)));
  }, []);

  useEffect(() => { load(); }, [load]);

  const repair = async () => {
    setRepairing(true);
    try {
      const { data } = await api.post("/repair");
      toast.success(data.message);
      load();
    } catch (e) { toast.error(errMsg(e)); } finally { setRepairing(false); }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put("/settings", {
        enabled: form.enabled,
        entryPriceRupees: Number(form.entryPriceRupees),
        cancellationFeePercent: Number(form.cancellationFeePercent),
        maxOutgoingRequests: Number(form.maxOutgoingRequests),
        requestExpiryDays: Number(form.requestExpiryDays),
        minMatchDaysBeforeEnd: Number(form.minMatchDaysBeforeEnd),
        matchesPerEntry: Number(form.matchesPerEntry),
      });
      setForm(data.data);
      toast.success("Settings saved");
    } catch (err) { toast.error(errMsg(err)); } finally { setSaving(false); }
  };

  if (loadError && (!stats || !form)) {
    return (
      <EmptyState title="Couldn't load the arena admin" action={<Button onClick={load}>Try again</Button>}>
        {loadError}
      </EmptyState>
    );
  }
  if (!stats || !form) return <Spinner />;
  const r = stats.revenue;
  const bind = (k) => ({ value: form[k], onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })) });

  return (
    <div className="space-y-6">
      {stats.needsAttention > 0 && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dk:border-amber-500/40 dk:bg-amber-500/10 dk:text-amber-200">
          <p>
            <strong>{stats.needsAttention} paid member{stats.needsAttention === 1 ? "" : "s"}</strong> {stats.needsAttention === 1 ? "isn't" : "aren't"} active in the arena yet, so they can't browse.
            This normally fixes itself the next time they open the page. You can fix it for everyone now.
          </p>
          <Button size="sm" onClick={repair} loading={repairing}>Repair now</Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Net revenue" value={inr(r.netPaise)} sub={`${inr(r.grossPaidPaise)} gross · ${inr(r.refundedPaise)} refunded`} tone="text-emerald-600 dk:text-emerald-400" />
        <Stat label="Cancellation fees kept" value={inr(r.cancellationFeesPaise)} sub={`${r.cancelledEntries} cancelled`} />
        <Stat label="Members in arena" value={stats.profiles.active ?? 0} sub={`${stats.profiles.matched ?? 0} matched · ${Math.max(0, (stats.profiles.draft ?? 0) - (stats.needsAttention ?? 0))} haven't paid yet`} />
        <Stat label="Open reports" value={stats.openReports} tone={stats.openReports ? "text-rose-600 dk:text-rose-400" : undefined} sub={`${stats.profiles.suspended ?? 0} suspended`} />
        <Stat label="Active matches" value={stats.matches.active ?? 0} sub={`${(stats.matches.ended ?? 0) + (stats.matches.dissolved ?? 0)} ended`} />
        <Stat label="Paid entries" value={r.paidEntries} />
        <Stat label="Requests (pending)" value={stats.requests.pending ?? 0} sub={`${stats.requests.accepted ?? 0} accepted`} />
        <Stat label="Coupon redemptions" value={stats.couponRedemptions} />
      </div>

      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#29201b] dk:text-[#fff7ed]"><BadgeIndianRupee className="h-5 w-5 text-orange-600 dk:text-orange-400" aria-hidden /> Pricing & rules</h2>
        {form.paymentGateway && (
          <p className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-900 dk:bg-orange-500/10 dk:text-orange-200">
            Members are charged via <strong className="capitalize">{form.paymentGateway}</strong>
            <span className={cx("rounded-full px-2 py-0.5 font-semibold", form.paymentMode === "sandbox" ? "bg-amber-100 text-amber-900" : "bg-emerald-100 text-emerald-800")}>{form.paymentMode}</span>
            {form.paymentMode === "sandbox" && <span>· test payments only, no real money</span>}
          </p>
        )}
        <p className="mt-1 text-sm text-stone-600 dk:text-[#d6c4b8]">Price, fee and matches-per-entry changes apply to <strong>new</strong> checkouts. Members who already paid keep the fee and the number of matches they bought.</p>
        <form onSubmit={save} className="mt-5 space-y-5">
          <Toggle label="Arena open" description="Turn off to pause new entries, requests and accepts. Existing chats keep working." checked={form.enabled} onChange={(v) => setForm((f) => ({ ...f, enabled: v }))} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Entry price (₹)" htmlFor="price" hint="0 makes entry free."><input id="price" type="number" min="0" max="50000" step="1" className={inputClass(false)} {...bind("entryPriceRupees")} /></Field>
            <Field label="Cancellation fee (%)" htmlFor="fee" hint="Kept when a member cancels before their first match."><input id="fee" type="number" min="0" max="100" step="1" className={inputClass(false)} {...bind("cancellationFeePercent")} /></Field>
            <Field label="Matches included per entry" htmlFor="mpe" hint="e.g. 2 = a member can have two partnerships, one after the other."><input id="mpe" type="number" min="1" max="5" step="1" className={inputClass(false)} {...bind("matchesPerEntry")} /></Field>
            <Field label="Max pending requests per member" htmlFor="maxreq"><input id="maxreq" type="number" min="1" max="100" className={inputClass(false)} {...bind("maxOutgoingRequests")} /></Field>
            <Field label="Request expiry (days)" htmlFor="exp"><input id="exp" type="number" min="1" max="90" className={inputClass(false)} {...bind("requestExpiryDays")} /></Field>
            <Field label="Min days before ending a match" htmlFor="mind" hint="0 = can end any time."><input id="mind" type="number" min="0" max="90" className={inputClass(false)} {...bind("minMatchDaysBeforeEnd")} /></Field>
          </div>
          <div className="flex justify-end"><Button type="submit" loading={saving}>Save settings</Button></div>
        </form>
        {form.history?.length > 0 && (
          <details className="mt-6 text-sm text-stone-600 dk:text-[#d6c4b8]">
            <summary className="cursor-pointer font-semibold text-stone-800 dk:text-[#ffedd5]">Change history</summary>
            <ul className="mt-3 space-y-2">
              {[...form.history].reverse().slice(0, 10).map((h, i) => (
                <li key={i} className="rounded-lg bg-[#fff8f2] dk:bg-[#15110e] p-3 text-xs">
                  <span className="font-semibold">{new Date(h.at).toLocaleString()}</span>
                  {Object.entries(h.changes || {}).map(([k, v]) => <div key={k}>{k}: {String(v.from)} → {String(v.to)}</div>)}
                </li>
              ))}
            </ul>
          </details>
        )}
      </Card>
    </div>
  );
}

/* ------------------------------- coupons ------------------------------- */
const blankCoupon = { code: "", description: "", discountType: "PERCENTAGE", discountValue: 10, maxDiscountRupees: "", validFrom: "", validUntil: "", usageLimit: "", perUserLimit: 1, active: true };
const toLocal = (d) => (d ? new Date(d).toISOString().slice(0, 16) : "");

function Coupons() {
  const [{ loading, data }, reload] = useList("/coupons", {});
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const open = (c) => setEditing(c ? { ...c, maxDiscountRupees: c.maxDiscountRupees ?? "", usageLimit: c.usageLimit ?? "", validFrom: toLocal(c.validFrom), validUntil: toLocal(c.validUntil), _id: c.id } : { ...blankCoupon });

  const save = async () => {
    setSaving(true);
    const body = {
      code: editing.code, description: editing.description, discountType: editing.discountType, discountValue: Number(editing.discountValue),
      maxDiscountRupees: editing.maxDiscountRupees === "" ? null : Number(editing.maxDiscountRupees),
      validFrom: editing.validFrom ? new Date(editing.validFrom).toISOString() : null,
      validUntil: editing.validUntil ? new Date(editing.validUntil).toISOString() : null,
      usageLimit: editing.usageLimit === "" ? null : Number(editing.usageLimit),
      perUserLimit: Number(editing.perUserLimit), active: editing.active,
    };
    try {
      if (editing._id) await api.put(`/coupons/${editing._id}`, body); else await api.post("/coupons", body);
      toast.success("Coupon saved"); setEditing(null); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete or deactivate ${c.code}?`)) return;
    try { const { data: r } = await api.delete(`/coupons/${c.id}`); toast.success(r.message); reload(); } catch (e) { toast.error(errMsg(e)); }
  };

  const bind = (k) => ({ value: editing?.[k] ?? "", onChange: (e) => setEditing((c) => ({ ...c, [k]: e.target.value })) });

  return (
    <div>
      <div className="mb-4 flex justify-end"><Button onClick={() => open(null)}>New coupon</Button></div>
      {loading && !data ? <Spinner /> : !data?.length ? <EmptyState icon={Ticket} title="No coupons yet">Create one to offer discounts at checkout.</EmptyState> : (
        <Table head={["Code", "Discount", "Usage", "Validity", "Status", ""]}>
          {data.map((c) => (
            <tr key={c.id}>
              <Td><p className="font-mono font-semibold text-[#29201b] dk:text-[#fff7ed]">{c.code}</p><p className="text-xs text-stone-500 dk:text-[#b9a79c]">{c.description}</p></Td>
              <Td>{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : inr(c.discountValue * 100)}{c.maxDiscountRupees != null && <p className="text-xs text-stone-500 dk:text-[#b9a79c]">max ₹{c.maxDiscountRupees}</p>}</Td>
              <Td>{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}<p className="text-xs text-stone-500 dk:text-[#b9a79c]">{c.perUserLimit}/user</p></Td>
              <Td className="text-xs">{c.validFrom ? new Date(c.validFrom).toLocaleDateString() : "any time"} → {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : "no end"}</Td>
              <Td><Badge tone={c.active ? "emerald" : "slate"}>{c.active ? "active" : "off"}</Badge></Td>
              <Td className="whitespace-nowrap text-right"><Button size="sm" variant="outline" onClick={() => open(c)}>Edit</Button> <Button size="sm" variant="ghost" onClick={() => remove(c)}>Delete</Button></Td>
            </tr>
          ))}
        </Table>
      )}
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?._id ? `Edit ${editing.code}` : "New coupon"}
        footer={<><Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button><Button loading={saving} onClick={save}>Save coupon</Button></>}>
        {editing && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Code" htmlFor="cc"><input id="cc" className={cx(inputClass(false), "uppercase")} disabled={Boolean(editing._id)} maxLength={30} {...bind("code")} onChange={(e) => setEditing((c) => ({ ...c, code: e.target.value.toUpperCase() }))} /></Field>
            <Field label="Type" htmlFor="ct"><select id="ct" className={inputClass(false)} {...bind("discountType")}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed (₹)</option></select></Field>
            <Field label={editing.discountType === "PERCENTAGE" ? "Percent off" : "Amount off (₹)"} htmlFor="cv"><input id="cv" type="number" min="1" className={inputClass(false)} {...bind("discountValue")} /></Field>
            <Field label="Max discount (₹)" htmlFor="cm" hint="Optional cap"><input id="cm" type="number" min="0" className={inputClass(false)} {...bind("maxDiscountRupees")} /></Field>
            <Field label="Valid from" htmlFor="cf"><input id="cf" type="datetime-local" className={inputClass(false)} {...bind("validFrom")} /></Field>
            <Field label="Valid until" htmlFor="cu"><input id="cu" type="datetime-local" className={inputClass(false)} {...bind("validUntil")} /></Field>
            <Field label="Total uses" htmlFor="cl" hint="Blank = unlimited"><input id="cl" type="number" min="1" className={inputClass(false)} {...bind("usageLimit")} /></Field>
            <Field label="Uses per member" htmlFor="cp"><input id="cp" type="number" min="1" max="10" className={inputClass(false)} {...bind("perUserLimit")} /></Field>
            <div className="sm:col-span-2"><Field label="Description" htmlFor="cd"><input id="cd" maxLength={200} className={inputClass(false)} {...bind("description")} /></Field></div>
            <div className="sm:col-span-2"><Toggle label="Active" checked={editing.active} onChange={(v) => setEditing((c) => ({ ...c, active: v }))} /></div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function AdminArena() {
  useArenaChrome();
  const [params] = useSearchParams();
  // /admin/arena?tab=accounts opens that tab directly (the admin dashboard links here).
  const [tab, setTab] = useState(() => (TABS.some(([key]) => key === params.get("tab")) ? params.get("tab") : "overview"));
  const [matchUser, setMatchUser] = useState(null); // { userId, label } → show one member's match history

  const openHistory = (u) => { setMatchUser(u); setTab("matches"); };
  const go = (key) => { if (key !== "matches") setMatchUser(null); setTab(key); };

  const panel = {
    overview: <Overview />,
    members: <MembersTab openHistory={openHistory} />,
    accounts: <AccountsTab />,
    requests: <RequestsTab />,
    matches: <MatchesTab key={matchUser?.userId ?? "all"} userFilter={matchUser} clearUserFilter={() => setMatchUser(null)} />,
    payments: <PaymentsTab />,
    reports: <ReportsTab />,
    bugs: <BugsTab />,
    coupons: <Coupons />,
    audit: <AuditTab />,
  }[tab];

  return (
    <div className="min-h-screen-safe bg-[#fff8f2] dk:bg-[#15110e] pt-[calc(var(--arena-nav-h,5rem)+0.5rem)]">
      <Helmet><title>Arena admin | Target Trek</title><meta name="robots" content="noindex" /></Helmet>
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#29201b] dk:text-[#fff7ed]">Prep Buddy Arena · Admin</h1>
        <nav className="mt-6 flex gap-1 overflow-x-auto border-b border-[#f0ded0] dk:border-[#443127]" aria-label="Admin sections">
          {TABS.map(([key, label, Icon]) => (
            <button key={key} onClick={() => go(key)} aria-current={tab === key}
              className={cx("flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold", tab === key ? "border-orange-600 text-orange-700 dk:text-orange-300" : "border-transparent text-stone-500 hover:text-stone-800 dk:text-[#b9a79c] dk:hover:text-[#fff7ed]")}>
              <Icon className="h-4 w-4" aria-hidden /> {label}
            </button>
          ))}
        </nav>
        <div className="mt-6">{panel}</div>
      </div>
    </div>
  );
}
