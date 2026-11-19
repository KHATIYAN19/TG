import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowSquareOut, ArrowsClockwise, FilePdf, House, MagnifyingGlass, Plus, Trash, X } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { A, dateFmt, dayFmt, formatINR } from "../referral/api";
import { Btn, Page, Skeleton, cx } from "../resume/ui";
import { Badge, CopyText, Pager, Sheet, Switch, TextField, useConfirm, usePrompt } from "../referral/ui";
import "../referral/referral.css";
import "./adminReferrals.css";

/*
  REFERRALS · admin console
    Overview       the numbers and what needs attention
    Chats          every request and chat: read, unlock free, end, delete
    Members        profiles: hide, block, restore, delete, manage credits
    Posts          the job board: take down, restore, delete
    Payments       every order: details, credits on/off, delete for good
    Credits        one member's credits: add, remove, edit a bucket
    Subscriptions  monthly plans: status, charges and retries, cancel, delete
    Plans          credit packs, Unlimited and Priority plans
    Settings       what's on, what's on sale, the prices
  Every destructive action asks in a modal first and reports with a toast.
*/

/* ------------------------------------------------------------ small helpers */
const useList = (fn, deps) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(() => { setError(""); fn().then(setData).catch((e) => setError(errMsg(e))); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setData(null); const t = setTimeout(load, 180); return () => clearTimeout(t); }, [load]);
  return [data, error, load];
};
const Search = ({ q, setQ, placeholder }) => (
  <div className="rf-qwrap"><MagnifyingGlass size={18} aria-hidden /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} />{q && <button type="button" className="x" onClick={() => setQ("")} aria-label="Clear"><X size={15} weight="bold" aria-hidden /></button>}</div>
);
const Chips = ({ options, value, onChange }) => <div className="rf-chips" role="group" aria-label="Filter">{options.map(([k, l]) => <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)}>{l}</button>)}</div>;
const Toolbar = ({ children, search }) => <div className="arx-toolbar">{children}{search}</div>;
const Head = ({ title, sub, actions }) => <header className="arx-head"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{actions && <div className="rf-btns">{actions}</div>}</header>;
const Empty = ({ e = "🔍", children }) => <div className="arx-empty"><span className="e" aria-hidden>{e}</span>{children}</div>;
const Rows = ({ data, error, cols, empty, children }) => (
  <>
    {error && <p role="alert" className="rf-banner bad" style={{ marginBottom: 12 }}>{error}</p>}
    <div className="arx-table-wrap">
      <table className="arx-table">
        <thead><tr>{cols.map((c) => <th key={c} scope="col">{c}</th>)}</tr></thead>
        <tbody>
          {!data && !error && [0, 1, 2, 3].map((i) => <tr key={i}><td colSpan={cols.length}><Skeleton h={22} /></td></tr>)}
          {children}
          {data?.items?.length === 0 && <tr><td colSpan={cols.length}><Empty e={empty[0]}>{empty[1]}</Empty></td></tr>}
        </tbody>
      </table>
    </div>
    {data && <Pager page={data.page} pages={data.pages} onGo={data.onGo} />}
  </>
);
/* runs an action with a toast, and keeps a "busy" name so one button shows a spinner */
const useRun = () => {
  const [busy, setBusy] = useState("");
  const run = async (name, fn, okMsg, after) => { setBusy(name); try { const r = await fn(); if (okMsg) toast.success(okMsg); await after?.(r); return r; } catch (e) { toast.error(errMsg(e)); return null; } finally { setBusy(""); } };
  return [busy, run];
};
const REQ = { pending: ["⏳ Pending", "warn"], accepted: ["✅ Accepted", "ok"], rejected: ["✋ Declined", "bad"], cancelled: ["↩️ Withdrawn", "muted"], ended: ["🔒 Ended", "muted"] };
const PAY = { paid: ["Paid", "ok"], created: ["Not paid", "warn"], failed: ["Failed", "bad"] };
const KIND = { unlock: "💬 Chat unlock", plan: "🎟️ Credit pack", grant: "🎁 Free credits", priority: "⚡ Priority pass" };
const SUB = { active: ["🟢 Active", "ok"], past_due: ["⚠️ Failing", "warn"], cancelled: ["Cancelled", "muted"], expired: ["Ended", "muted"], failed: ["Never paid", "bad"], created: ["Checkout", "warn"] };

/* ------------------------------------------------------------ overview */
function Overview({ stats, go }) {
  const s = stats;
  const k = s ? [
    ["👥", "Members", s.profiles, `${s.referrers} can refer`, "members"],
    ["📌", "Open posts", s.posts, "on the job board", "posts"],
    ["⏳", "Pending requests", s.requests.pending, "waiting for a referrer", "chats"],
    ["🔒", "Waiting to unlock", s.requests.locked, "accepted, chat closed", "chats", s.requests.locked > 0],
    ["💬", "Live chats", s.requests.openChats, `${s.unlocks} unlocked in total`, "chats"],
    ["💸", "Revenue", formatINR(s.revenue), `${s.payments} paid orders`, "payments"],
    ["📅", "Last 7 days", formatINR(s.revenueWeek), "one-time payments", "payments"],
    ["🔁", "Subscriptions", s.subscriptions?.active ?? 0, `${formatINR(s.subscriptions?.monthly)} a month`, "subs"],
    ["⚠️", "Payments failing", s.subscriptions?.pastDue ?? 0, "renewals being retried", "subs", (s.subscriptions?.pastDue || 0) > 0],
    ["👑", "Priority subs", s.subscriptions?.priority ?? 0, "monthly priority", "subs"],
    ["✋", "Declined", s.requests.rejected, "can still be accepted", "chats"],
    ["🔚", "Ended chats", s.requests.ended, "closed by someone", "chats"],
  ] : [];
  const attn = s ? [
    s.requests.locked > 0 && ["🔒", `${s.requests.locked} accepted chat${s.requests.locked === 1 ? "" : "s"} waiting to unlock`, "Unlock one for free if a member asks.", "chats"],
    s.subscriptions?.pastDue > 0 && ["⚠️", `${s.subscriptions.pastDue} subscription${s.subscriptions.pastDue === 1 ? "" : "s"} failing to renew`, "Check with the gateway or reach out to the member.", "subs"],
    s.requests.pending > 0 && ["⏳", `${s.requests.pending} request${s.requests.pending === 1 ? "" : "s"} waiting for a referrer`, "Nothing to do. Referrers answer these.", "chats"],
  ].filter(Boolean) : [];
  return (
    <div>
      <Head title="Overview" sub="The referral program at a glance. Tap a number to open it." />
      <div className="arx-kpis">
        {!s && [0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} h={104} style={{ borderRadius: 16 }} />)}
        {k.map(([e, l, v, small, tab, warn]) => <button key={l} type="button" className={cx("arx-kpi", warn && "warn")} onClick={() => go(tab)}><span><span aria-hidden>{e}</span>{l}</span><b>{v ?? "–"}</b><small>{small}</small></button>)}
      </div>
      <section className="arx-sec"><h2>🔔 Needs attention</h2>
        {s && attn.length === 0 && <p className="rf-banner ok"><span className="e" aria-hidden>🎉</span><span>All clear. Nothing needs you right now.</span></p>}
        <div className="arx-attn">{attn.map(([e, t, d, tab]) => <button key={t} type="button" onClick={() => go(tab)}><span className="rf-ico sm" aria-hidden>{e}</span><div><b>{t}</b><span>{d}</span></div></button>)}</div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------ chats */
function ChatDesk({ id, onBack, onChanged }) {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [busy, run] = useRun();
  const [ask, confirmDialog] = useConfirm();
  const [prompt, promptDialog] = usePrompt();
  const load = useCallback(() => A.request(id).then(setD).catch((e) => setError(errMsg(e))), [id]);
  useEffect(() => { load(); }, [load]);
  const older = async () => { const r = await A.moreMessages(id, d.messages[0].id); setD((x) => ({ ...x, messages: [...r.items, ...x.messages], more: r.more })); };
  if (error) return <div><button type="button" className="arx-back" onClick={onBack}><ArrowLeft size={14} weight="bold" aria-hidden />All chats</button><p role="alert" className="rf-banner bad">{error}</p></div>;
  if (!d) return <Skeleton h={420} style={{ borderRadius: 16 }} />;
  const r = d.request;
  const [label, tone] = REQ[r.status] || [r.status, "muted"];
  const done = async () => { await load(); onChanged(); };
  const openResume = () => run("resume", async () => window.open((await A.resume(id)).url, "_blank", "noopener"));
  return (
    <div className="arx-desk">
      <div><button type="button" className="arx-back" onClick={onBack}><ArrowLeft size={14} weight="bold" aria-hidden />All chats</button>
        <Head title={`${r.seeker.name} → ${r.referrer.name}`} sub={<>{r.company} · {r.job.title || r.job.jobId || "Job"} · <Badge tone={tone}>{label}</Badge></>}
          actions={<>
            {r.status === "accepted" && !r.chat.unlocked && <Btn size="sm" loading={busy === "unlock"} onClick={async () => { if (await ask({ title: "Open this chat for free?", message: "The sender won't pay. Both can message at once.", confirmLabel: "Unlock free", danger: false })) run("unlock", () => A.unlock(id), "Chat unlocked 🔓", done); }}>🔓 Unlock free</Btn>}
            {r.status === "accepted" && <Btn size="sm" variant="ghost" loading={busy === "end"} onClick={async () => { const why = await prompt({ title: "End this chat?", message: "Neither person can send more messages. They will see your reason.", label: "Reason", confirmLabel: "End chat", danger: true }); if (why !== null) run("end", () => A.end(id, why), "Chat ended.", done); }}>🔚 End chat</Btn>}
            <Btn size="sm" variant="danger" loading={busy === "del"} onClick={async () => { if (await ask({ title: "Delete this request for good?", message: "The request and every message are removed permanently. This can't be undone.", confirmLabel: "Delete forever" })) run("del", () => A.remove(id), "Deleted permanently.", () => { onChanged(); onBack(); }); }}><Trash size={14} aria-hidden />Delete</Btn>
          </>} />
      </div>
      <div className="arx-two">
        <section className="arx-card"><h3>🙋 Sender</h3>
          <dl className="rf-kv">
            <div><dt>Name</dt><dd>{r.seeker.name}</dd></div><div><dt>Email</dt><dd><CopyText value={r.seeker.email} /></dd></div>
            <div><dt>Now</dt><dd>{r.seeker.role || "–"}{r.seeker.company ? ` at ${r.seeker.company}` : ""}</dd></div>
            <div><dt>Experience</dt><dd>{r.seeker.yearsExp || 0} yrs · notice {r.seeker.noticePeriod || "–"}</dd></div>
            {r.seeker.linkedin && <div><dt>LinkedIn</dt><dd><a href={r.seeker.linkedin} target="_blank" rel="noopener noreferrer nofollow" className="rl-textlink">Open <ArrowSquareOut size={12} aria-hidden /></a></dd></div>}
          </dl>
          {r.resume && <div className="rf-file"><FilePdf size={22} weight="duotone" aria-hidden /><span><b>{r.resume.filename}</b><small>{Math.max(1, Math.round((r.resume.size || 0) / 1024))} KB</small></span><Btn size="sm" variant="ghost" loading={busy === "resume"} onClick={openResume}>Open</Btn></div>}
          <div style={{ display: "grid", gap: 6 }}><span className="rf-label">Their note</span><blockquote className="rf-quote-block">{r.message}</blockquote></div>
        </section>
        <section className="arx-card"><h3>🧑‍💼 Referrer and job</h3>
          <dl className="rf-kv">
            <div><dt>Name</dt><dd>{r.referrer.name}{r.referrer.hidesName ? " · hides name" : ""}</dd></div><div><dt>Email</dt><dd><CopyText value={r.referrer.email} /></dd></div>
            <div><dt>Works as</dt><dd>{r.referrer.role} at {r.company}</dd></div>
            <div><dt>Job</dt><dd>{r.job.title || "–"}{r.job.jobId ? ` · ${r.job.jobId}` : ""}</dd></div>
            {r.job.link && <div><dt>Job link</dt><dd><a href={r.job.link} target="_blank" rel="noopener noreferrer nofollow" className="rl-textlink">Open <ArrowSquareOut size={12} aria-hidden /></a></dd></div>}
            <div><dt>Sent</dt><dd>{dateFmt(r.createdAt)}</dd></div>
            <div><dt>Chat</dt><dd>{r.chat.unlocked ? `Open since ${dayFmt(r.chat.unlockedAt)} (${r.chat.via})` : "Not open"}{r.chat.endedAt ? ` · ended ${dayFmt(r.chat.endedAt)}${r.chat.endedByAdmin ? " by admin" : ""}` : ""}</dd></div>
            {r.rejectReason && <div><dt>Decline reason</dt><dd>{r.rejectReason}</dd></div>}
          </dl>
        </section>
      </div>
      <section className="arx-card"><h3>💬 Messages ({d.messages.length}{d.more ? "+" : ""})</h3>
        <div className="arx-log">
          {d.more && <Btn size="sm" variant="ghost" onClick={older} style={{ alignSelf: "center" }}>Earlier messages</Btn>}
          {d.messages.length === 0 && <p className="rf-muted" style={{ textAlign: "center" }}>No messages yet.</p>}
          {d.messages.map((m) => (m.system ? <div key={m.id} className="rf-sys">ℹ️ {m.text}</div> : (
            <div key={m.id} className={cx("rf-msg", m.sender === "seeker" && "me")}>
              <div className={cx("rf-bubble", m.deleted && "gone")}>{m.replyTo && <div className="rf-quote">{m.replyTo.text}</div>}{m.deleted ? "Deleted" : m.text}</div>
              <span className="rf-time">{m.sender === "seeker" ? "Sender" : "Referrer"} · {dateFmt(m.createdAt)}{m.edited && " · edited"}{!m.deleted && <button type="button" onClick={async () => { if (await ask({ title: "Remove this message?", message: "It's removed for both people.", confirmLabel: "Remove" })) run("m", () => A.removeMessage(m.id), "Message removed.", load); }}>Remove</button>}</span>
            </div>)))}
        </div>
      </section>
      {confirmDialog}{promptDialog}
    </div>
  );
}
function Chats({ tick, onChanged }) {
  const [open, setOpen] = useState(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, error] = useList(() => A.requests({ page, q: q.trim(), ...(filter === "locked" ? { locked: 1 } : filter === "live" ? { live: 1 } : filter !== "all" ? { status: filter } : {}) }), [page, q, filter, tick]);
  if (open) return <ChatDesk id={open} onBack={() => setOpen(null)} onChanged={onChanged} />;
  return (
    <div>
      <Head title="Chats" sub="Every referral request and chat. Open one to read it, unlock it free, end it or delete it." />
      <Toolbar search={<Search q={q} setQ={(v) => { setQ(v); setPage(1); }} placeholder="Name, email, company, job ID" />}>
        <Chips value={filter} onChange={(v) => { setFilter(v); setPage(1); }} options={[["all", "All"], ["pending", "⏳ Pending"], ["locked", "🔒 To unlock"], ["live", "💬 Live"], ["rejected", "✋ Declined"], ["ended", "🔚 Ended"], ["cancelled", "↩️ Withdrawn"]]} />
      </Toolbar>
      <Rows data={data && { ...data, onGo: setPage }} error={error} cols={["Sender", "Referrer", "Company · job", "Status", "Chat", "Last activity"]} empty={["💬", "No chats here."]}>
        {data?.items.map((r) => { const [l, t] = REQ[r.status] || [r.status, "muted"]; return (
          <tr key={r.id} className="click" tabIndex={0} onClick={() => setOpen(r.id)} onKeyDown={(e) => e.key === "Enter" && setOpen(r.id)}>
            <td className="first" data-label="Sender"><b>{r.seeker.name}</b><span className="sub">{r.seeker.email}</span></td>
            <td data-label="Referrer"><b>{r.referrer.name}</b><span className="sub">{r.referrer.email}</span></td>
            <td data-label="Company">{r.company}<span className="sub">{r.job.title || r.job.jobId || "–"}</span></td>
            <td data-label="Status"><Badge tone={t}>{l}</Badge></td>
            <td data-label="Chat">{r.chat.unlocked ? <Badge tone="ok">Open · {r.chat.via}</Badge> : r.status === "accepted" ? <Badge tone="warn">🔒 Locked</Badge> : "–"}</td>
            <td data-label="Last">{dateFmt(r.last?.at || r.updatedAt)}</td>
          </tr>); })}
      </Rows>
    </div>
  );
}

/* ------------------------------------------------------------ members */
function Members({ openCredits }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, error, load] = useList(() => A.profiles({ page, q: q.trim(), ...(filter === "refer" ? { referrers: 1 } : ["hidden", "blocked"].includes(filter) ? { status: filter } : {}) }), [page, q, filter]);
  const [busy, run] = useRun();
  const [ask, confirmDialog] = useConfirm();
  const [prompt, promptDialog] = usePrompt();
  const setStatus = async (p, status) => {
    let reason = "";
    if (status !== "active") { reason = await prompt({ title: `${status === "blocked" ? "Block" : "Hide"} ${p.name || "this member"}?`, message: status === "blocked" ? "They can't send or receive requests. They see your reason." : "They disappear from search. They see your reason.", confirmLabel: status === "blocked" ? "Block" : "Hide", danger: status === "blocked" }); if (reason === null) return; }
    run(`${p.id}s`, () => A.profileStatus(p.id, status, reason), status === "active" ? "Restored ✅" : status === "blocked" ? "Blocked ⛔" : "Hidden 🙈", load);
  };
  const del = async (p) => { if (await ask({ title: `Delete ${p.name || "this profile"} for good?`, message: "The profile and all their posts are removed permanently. Their chats stay for the other person. This can't be undone.", confirmLabel: "Delete forever" })) run(`${p.id}d`, () => A.deleteProfile(p.id), "Profile deleted permanently.", load); };
  return (
    <div>
      <Head title="Members" sub="Referral profiles. Hide or block someone, manage their credits, or delete a profile." />
      <Toolbar search={<Search q={q} setQ={(v) => { setQ(v); setPage(1); }} placeholder="Name, company, role" />}>
        <Chips value={filter} onChange={(v) => { setFilter(v); setPage(1); }} options={[["all", "All"], ["refer", "🤝 Can refer"], ["hidden", "🙈 Hidden"], ["blocked", "⛔ Blocked"]]} />
      </Toolbar>
      <Rows data={data && { ...data, onGo: setPage }} error={error} cols={["Member", "Company", "Experience", "Refers", "Status", ""]} empty={["👥", "No members."]}>
        {data?.items.map((p) => (
          <tr key={p.id}>
            <td className="first" data-label="Member"><b>{p.name || "–"}</b>{p.hideName && <> <Badge>🕶️ hides name</Badge></>}<span className="sub">{p.email}</span></td>
            <td data-label="Company">{p.company}<span className="sub">{p.role}</span></td>
            <td data-label="Experience">{p.yearsExp} yrs</td>
            <td data-label="Refers">{p.canRefer ? <Badge tone="ok">Yes</Badge> : <Badge>No</Badge>}</td>
            <td data-label="Status"><Badge tone={p.status === "active" ? "ok" : "bad"}>{p.status}</Badge>{p.statusReason && <span className="sub">{p.statusReason}</span>}</td>
            <td className="act"><div className="arx-actions">
              <Btn size="sm" variant="ghost" onClick={() => openCredits(p.email)}>🎟️ Credits</Btn>
              {p.status === "active" ? <><Btn size="sm" variant="ghost" loading={busy === `${p.id}s`} onClick={() => setStatus(p, "hidden")}>Hide</Btn><Btn size="sm" variant="ghost" onClick={() => setStatus(p, "blocked")}>Block</Btn></> : <Btn size="sm" variant="ghost" loading={busy === `${p.id}s`} onClick={() => setStatus(p, "active")}>Restore</Btn>}
              <Btn size="sm" variant="danger" loading={busy === `${p.id}d`} onClick={() => del(p)} aria-label="Delete profile"><Trash size={14} aria-hidden /></Btn>
            </div></td>
          </tr>))}
      </Rows>
      {confirmDialog}{promptDialog}
    </div>
  );
}

/* ------------------------------------------------------------ posts */
function Posts() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, error, load] = useList(() => A.posts({ page, q: q.trim(), ...(filter === "removed" ? { hidden: 1 } : ["hiring", "referral"].includes(filter) ? { kind: filter } : {}) }), [page, q, filter]);
  const [busy, run] = useRun();
  const [ask, confirmDialog] = useConfirm();
  const [prompt, promptDialog] = usePrompt();
  const hide = async (p, hidden) => {
    let reason = "";
    if (hidden) { reason = await prompt({ title: "Take this post down?", message: "It disappears from the board. The author sees your reason.", confirmLabel: "Take down", danger: true }); if (reason === null) return; }
    run(p.id, () => A.hidePost(p.id, hidden, reason), hidden ? "Post taken down." : "Post restored ✅", load);
  };
  const del = async (p) => { if (await ask({ title: "Delete this post for good?", message: `“${p.title}” is removed permanently. This can't be undone.`, confirmLabel: "Delete forever" })) run(`${p.id}d`, () => A.deletePost(p.id), "Post deleted permanently.", load); };
  return (
    <div>
      <Head title="Job board" sub="Hiring and “I can refer” posts. Take one down or delete it." />
      <Toolbar search={<Search q={q} setQ={(v) => { setQ(v); setPage(1); }} placeholder="Company or title" />}>
        <Chips value={filter} onChange={(v) => { setFilter(v); setPage(1); }} options={[["all", "All"], ["hiring", "🧑‍💼 Hiring"], ["referral", "🤝 Can refer"], ["removed", "⛔ Taken down"]]} />
      </Toolbar>
      <Rows data={data && { ...data, onGo: setPage }} error={error} cols={["Post", "Type", "Author", "Status", "Posted", ""]} empty={["📌", "No posts."]}>
        {data?.items.map((p) => (
          <tr key={p.id}>
            <td className="first" data-label="Post"><b>{p.title}</b><span className="sub">{p.company}{p.roles.length ? ` · ${p.roles.join(", ")}` : ""}</span></td>
            <td data-label="Type">{p.kind === "hiring" ? "🧑‍💼 Hiring" : "🤝 Can refer"}</td>
            <td data-label="Author">{p.author}<span className="sub">{p.email}</span></td>
            <td data-label="Status"><Badge tone={p.hidden ? "bad" : p.status === "open" ? "ok" : "muted"}>{p.hidden ? "Taken down" : p.status}</Badge></td>
            <td data-label="Posted">{dayFmt(p.createdAt)}</td>
            <td className="act"><div className="arx-actions">
              <Btn size="sm" variant="ghost" loading={busy === p.id} onClick={() => hide(p, !p.hidden)}>{p.hidden ? "Restore" : "Take down"}</Btn>
              <Btn size="sm" variant="danger" loading={busy === `${p.id}d`} onClick={() => del(p)} aria-label="Delete post"><Trash size={14} aria-hidden /></Btn>
            </div></td>
          </tr>))}
      </Rows>
      {confirmDialog}{promptDialog}
    </div>
  );
}

/* ------------------------------------------------------------ payments */
function PaymentSheet({ o, onClose, onChanged, openCredits }) {
  const [busy, run] = useRun();
  const [ask, confirmDialog] = useConfirm();
  const [label, tone] = o.revoked ? ["Switched off", "muted"] : PAY[o.status] || [o.status, "muted"];
  const del = async () => { if (await ask({ title: "Delete this payment for good?", message: o.status === "paid" ? "This is a PAID record. It's removed permanently, and any credits it holds disappear. Money is not refunded by this. This can't be undone." : "It's removed permanently. This can't be undone.", confirmLabel: "Delete forever" })) run("del", () => A.deleteOrder(o.id), "Payment deleted permanently.", () => { onChanged(); onClose(); }); };
  return (
    <Sheet title="Payment" onClose={onClose}>
      <div className="rf-receipt">
        <div className="big"><b>{o.amount ? formatINR(o.amount) : "₹0"}</b><span className="rf-muted">{KIND[o.kind] || o.kind} · {o.title}</span><Badge tone={tone}>{label}</Badge></div>
        <dl className="rf-kv">
          <div><dt>Member</dt><dd>{o.user}<br /><span className="rf-xs">{o.email}</span></dd></div>
          <div><dt>Created</dt><dd>{dateFmt(o.createdAt)}</dd></div>
          {o.paidAt && <div><dt>Paid</dt><dd>{dateFmt(o.paidAt)}</dd></div>}
          {o.gateway && <div><dt>Gateway</dt><dd>{o.gateway}</dd></div>}
          {o.paymentId && <div><dt>Payment ID</dt><dd><CopyText value={o.paymentId} /></dd></div>}
          {o.orderRef && <div><dt>Order ref</dt><dd><CopyText value={o.orderRef} /></dd></div>}
          {o.kind !== "unlock" && o.kind !== "priority" && <div><dt>Credits</dt><dd>{o.allowed - o.used} left of {o.allowed}</dd></div>}
          {o.kind === "priority" && <div><dt>Pass</dt><dd>{o.validityDays} days</dd></div>}
          {o.expiresAt && <div><dt>Valid until</dt><dd>{dayFmt(o.expiresAt)}</dd></div>}
          {o.reason && <div><dt>Failure</dt><dd>{o.reason}</dd></div>}
          {o.note && <div><dt>Note</dt><dd>{o.note}</dd></div>}
        </dl>
        <div className="rf-btns">
          {["plan", "grant"].includes(o.kind) && o.status === "paid" && <Btn variant="ghost" loading={busy === "rev"} onClick={() => run("rev", () => A.updateOrder(o.id, { revoked: !o.revoked }), o.revoked ? "Credits switched back on ✅" : "Credits switched off.", () => { onChanged(); onClose(); })}>{o.revoked ? "Switch credits on" : "Switch credits off"}</Btn>}
          <Btn variant="ghost" onClick={() => { onClose(); openCredits(o.email); }}>🎟️ Member's credits</Btn>
          <Btn variant="danger" loading={busy === "del"} onClick={del}><Trash size={15} aria-hidden />Delete forever</Btn>
        </div>
      </div>
      {confirmDialog}
    </Sheet>
  );
}
function Payments({ openCredits }) {
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);
  const [data, error, load] = useList(() => A.orders({ page, q: q.trim(), ...(kind !== "all" ? { kind } : {}), ...(status !== "all" ? { status } : {}) }), [page, q, kind, status]);
  return (
    <div>
      <Head title="Payments" sub="Every one-time payment and free grant. Open one for details, switch its credits off, or delete it for good. Subscription charges are under Subscriptions." actions={<Btn onClick={() => openCredits("")}><Plus size={16} weight="bold" aria-hidden />Give credits</Btn>} />
      <Toolbar search={<Search q={q} setQ={(v) => { setQ(v); setPage(1); }} placeholder="Name, email or payment ID" />}>
        <div style={{ display: "grid", gap: 8 }}>
          <Chips value={kind} onChange={(v) => { setKind(v); setPage(1); }} options={[["all", "All types"], ["unlock", "💬 Unlocks"], ["plan", "🎟️ Packs"], ["priority", "⚡ Priority"], ["grant", "🎁 Grants"]]} />
          <Chips value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={[["all", "Any status"], ["paid", "✅ Paid"], ["created", "⏳ Not paid"], ["failed", "❌ Failed"]]} />
        </div>
      </Toolbar>
      <Rows data={data && { ...data, onGo: setPage }} error={error} cols={["Member", "What", "Amount", "Status", "Credits", "When"]} empty={["💳", "No payments."]}>
        {data?.items.map((o) => { const [l, t] = o.revoked ? ["Off", "muted"] : PAY[o.status] || [o.status, "muted"]; return (
          <tr key={o.id} className="click" tabIndex={0} onClick={() => setOpen(o)} onKeyDown={(e) => e.key === "Enter" && setOpen(o)}>
            <td className="first" data-label="Member"><b>{o.user || "–"}</b><span className="sub">{o.email}</span></td>
            <td data-label="What">{KIND[o.kind] || o.kind}<span className="sub">{o.title}</span></td>
            <td data-label="Amount" className="rf-mono">{o.amount ? formatINR(o.amount) : "Free"}</td>
            <td data-label="Status"><Badge tone={t}>{l}</Badge></td>
            <td data-label="Credits" className="rf-mono">{["plan", "grant"].includes(o.kind) ? `${o.allowed - o.used}/${o.allowed}` : "–"}</td>
            <td data-label="When">{dateFmt(o.paidAt || o.createdAt)}</td>
          </tr>); })}
      </Rows>
      {open && <PaymentSheet o={open} onClose={() => setOpen(null)} onChanged={load} openCredits={openCredits} />}
    </div>
  );
}

/* ------------------------------------------------------------ credits manager */
function Credits({ start }) {
  const [who, setWho] = useState(start || "");
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [n, setN] = useState(5);
  const [days, setDays] = useState(0);
  const [note, setNote] = useState("");
  const [edit, setEdit] = useState(null);
  const [busy, run] = useRun();
  const [ask, confirmDialog] = useConfirm();
  const look = async (e) => { e?.preventDefault(); if (!who.trim()) return; setError(""); setD(null); try { setD(await A.credits(who.trim())); } catch (x) { setError(errMsg(x)); } };
  useEffect(() => { if (start) look(); }, [start]); // eslint-disable-line react-hooks/exhaustive-deps
  const change = async (sign) => {
    const amount = Math.abs(Number(n) || 0);
    if (!amount) return toast.error("Enter how many credits.");
    const verb = sign > 0 ? "Add" : "Remove";
    if (!(await ask({ title: `${verb} ${amount} credit${amount === 1 ? "" : "s"}?`, message: sign > 0 ? `${d.user.name} gets ${amount} free chat credit${amount === 1 ? "" : "s"}${Number(days) ? `, valid ${days} days` : ", no expiry"}.` : `${amount} credit${amount === 1 ? "" : "s"} are taken from ${d.user.name}, from the ones that end soonest.`, confirmLabel: verb, danger: sign < 0 }))) return;
    run(verb, () => A.changeCredits({ user: d.user.id, change: sign * amount, validityDays: Number(days) || 0, note }), null, (r) => { toast.success(`${r.changed > 0 ? "Added" : "Removed"} ${Math.abs(r.changed)} credit${Math.abs(r.changed) === 1 ? "" : "s"} ✅ Balance: ${r.left}`); setD(r); setNote(""); });
  };
  const delBucket = async (b) => { if (await ask({ title: "Delete these credits for good?", message: `“${b.title}” (${b.left} left) is removed permanently.`, confirmLabel: "Delete forever" })) run(b.id, () => A.deleteOrder(b.id), "Deleted permanently.", look); };
  return (
    <div>
      <Head title="Credits" sub="Look up a member by email. Add free credits, take credits away, or fix a balance." />
      <form className="arx-card" onSubmit={look} style={{ marginBottom: 16 }}>
        <div className="arx-toolbar" style={{ margin: 0 }}><div className="rf-qwrap"><MagnifyingGlass size={18} aria-hidden /><input type="search" value={who} onChange={(e) => setWho(e.target.value)} placeholder="member@email.com" aria-label="Member email" autoComplete="off" /></div><Btn type="submit">Find member</Btn></div>
      </form>
      {error && <p role="alert" className="rf-banner bad">{error}</p>}
      {d && (
        <div className="arx-desk">
          <div className="arx-kpis">
            <div className="arx-kpi"><span>👤 Member</span><b style={{ fontSize: 18, fontFamily: "var(--rl-display)" }}>{d.user.name}</b><small>{d.user.email}</small></div>
            <div className="arx-kpi"><span>🎟️ Credits left</span><b>{d.left}</b><small>usable now</small></div>
            <div className="arx-kpi"><span>🏢 Profile</span><b style={{ fontSize: 16, fontFamily: "var(--rl-display)" }}>{d.profile ? `${d.profile.role || "–"} at ${d.profile.company || "–"}` : "No profile"}</b><small>{d.profile?.status || ""}</small></div>
            <div className="arx-kpi"><span>🔁 Subscriptions</span><b>{d.subscriptions.filter((x) => x.live).length}</b><small>{d.subscriptions.filter((x) => x.live).map((x) => x.planName).join(", ") || "none live"}</small></div>
          </div>
          <section className="arx-card"><h3>➕ Add or remove</h3>
            <div className="arx-two">
              <div style={{ display: "grid", gap: 8 }}><span className="rv-label">How many</span><div className="arx-stepper"><button type="button" onClick={() => setN((x) => Math.max(1, Number(x) - 1))} aria-label="One less">−</button><input className="rv-input" type="number" min={1} max={1000} value={n} onChange={(e) => setN(e.target.value)} aria-label="Credits" /><button type="button" onClick={() => setN((x) => Number(x) + 1)} aria-label="One more">+</button></div></div>
              <TextField id="f-days" label="Valid for (days, when adding)" hint="0 = never expires" type="number" min={0} value={days} onChange={(e) => setDays(e.target.value)} />
            </div>
            <TextField id="f-note" label="Note" optional count={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Why? e.g. Goodwill for a failed payment" />
            <div className="rf-btns"><Btn loading={busy === "Add"} onClick={() => change(1)}><Plus size={16} weight="bold" aria-hidden />Add credits</Btn><Btn variant="danger" loading={busy === "Remove"} onClick={() => change(-1)}>− Remove credits</Btn></div>
          </section>
          <section className="arx-card"><h3>🎟️ Credit buckets ({d.buckets.length})</h3>
            {d.buckets.length === 0 && <p className="rf-muted">No credits yet.</p>}
            {d.buckets.map((b) => (
              <div key={b.id} className={cx("arx-bucket", !b.live && "off")}>
                <span className="rf-ico sm" aria-hidden>{b.kind === "grant" ? "🎁" : "🎟️"}</span>
                <div className="t"><b>{b.title} · {b.left}/{b.allowed} left</b><span>{b.amount ? formatINR(b.amount) : "Free"} · {dayFmt(b.createdAt)}{b.expiresAt ? ` · until ${dayFmt(b.expiresAt)}` : " · no expiry"}{b.revoked ? " · switched off" : !b.live ? " · expired" : ""}{b.note ? ` · ${b.note}` : ""}</span></div>
                <div className="arx-actions"><Btn size="sm" variant="ghost" onClick={() => setEdit({ ...b, expiresAt: b.expiresAt ? String(b.expiresAt).slice(0, 10) : "" })}>Edit</Btn><Btn size="sm" variant="danger" loading={busy === b.id} onClick={() => delBucket(b)} aria-label="Delete bucket"><Trash size={14} aria-hidden /></Btn></div>
              </div>))}
          </section>
        </div>
      )}
      {edit && (
        <Sheet title="Edit credits" subtitle={edit.title} onClose={() => setEdit(null)} compact>
          <form className="rf-form" onSubmit={(e) => { e.preventDefault(); run("edit", () => A.editBucket(edit.id, { allowed: Number(edit.allowed), used: Number(edit.used), expiresAt: edit.expiresAt ? new Date(`${edit.expiresAt}T23:59:59`).toISOString() : null }), "Saved ✅", async () => { setEdit(null); await look(); }); }}>
            <div className="rf-two"><TextField id="f-al" label="Total credits" type="number" min={0} value={edit.allowed} onChange={(e) => setEdit({ ...edit, allowed: e.target.value })} /><TextField id="f-us" label="Used" type="number" min={0} value={edit.used} onChange={(e) => setEdit({ ...edit, used: e.target.value })} /></div>
            <TextField id="f-ex" label="Valid until" hint="Empty = never expires" type="date" value={edit.expiresAt} onChange={(e) => setEdit({ ...edit, expiresAt: e.target.value })} />
            <div className="rf-btns"><Btn type="submit" loading={busy === "edit"}>Save</Btn><Btn variant="ghost" onClick={() => setEdit(null)}>Cancel</Btn></div>
          </form>
        </Sheet>
      )}
      {confirmDialog}
    </div>
  );
}

/* ------------------------------------------------------------ subscriptions */
function SubDesk({ id, onBack, onChanged }) {
  const [d, error, load] = useList(() => A.subscription(id), [id]);
  const [busy, run] = useRun();
  const [ask, confirmDialog] = useConfirm();
  const s = d?.subscription;
  const after = async () => { await load(); onChanged(); };
  return (
    <div className="arx-desk">
      <div><button type="button" className="arx-back" onClick={onBack}><ArrowLeft size={14} weight="bold" aria-hidden />All subscriptions</button></div>
      {error && <p role="alert" className="rf-banner bad">{error}</p>}
      {!d && !error && <Skeleton h={320} style={{ borderRadius: 16 }} />}
      {s && (<>
        <Head title={`${s.planName} · ${s.user}`} sub={<>{s.email} · {formatINR(s.price)} / month · <Badge tone={(SUB[s.status] || [])[1] || "muted"}>{s.cancelling ? `⏳ Active till ${dayFmt(s.accessUntil)}` : (SUB[s.status] || [s.status])[0]}</Badge></>}
          actions={<>
            <Btn size="sm" variant="ghost" loading={busy === "sync"} onClick={() => run("sync", () => A.syncSubscription(id), "Checked with the gateway ✅", after)}><ArrowsClockwise size={14} aria-hidden />Check gateway</Btn>
            {s.canCancel && <Btn size="sm" variant="ghost" loading={busy === "c1"} onClick={async () => { if (await ask({ title: "Cancel this subscription?", message: `No more charges. ${s.user} keeps access until ${dayFmt(s.accessUntil)}.`, confirmLabel: "Cancel it", cancelLabel: "Keep it" })) run("c1", () => A.cancelSubscription(id, { reason: "Cancelled by admin" }), "Cancelled. Access stays till the end.", after); }}>Cancel · keep access</Btn>}
            {(s.canCancel || s.cancelling) && <Btn size="sm" variant="danger" loading={busy === "c2"} onClick={async () => { if (await ask({ title: "End access now?", message: `${s.user} loses access immediately. Nothing is refunded.`, confirmLabel: "End now" })) run("c2", () => A.cancelSubscription(id, { endNow: true, reason: "Ended by admin" }), "Ended now.", after); }}>End now</Btn>}
          </>} />
        <div className="arx-two">
          <section className="arx-card"><h3>📋 Details</h3>
            <dl className="rf-kv">
              <div><dt>Access until</dt><dd>{s.accessUntil ? `${dayFmt(s.accessUntil)}${s.live ? ` · ${s.daysLeft} days left` : " · ended"}` : "–"}</dd></div>
              <div><dt>Next charge</dt><dd>{s.nextChargeAt ? dateFmt(s.nextChargeAt) : "None"}</dd></div>
              <div><dt>Collected</dt><dd>{s.paidCount} · {formatINR(s.paidTotal)}</dd></div>
              <div><dt>Failed tries now</dt><dd>{s.failedCount}{s.lastFailureReason ? ` · ${s.lastFailureReason}` : ""}</dd></div>
              <div><dt>Gateway</dt><dd>{s.gateway} ({s.mode}) · {s.gatewayStatus || "–"}</dd></div>
              <div><dt>Gateway ID</dt><dd>{s.gatewaySubscriptionId ? <CopyText value={s.gatewaySubscriptionId} /> : "–"}</dd></div>
              {s.cancelledAt && <div><dt>Cancelled</dt><dd>{dayFmt(s.cancelledAt)} by {s.cancelledBy}{s.cancelReason ? ` · ${s.cancelReason}` : ""}</dd></div>}
            </dl>
          </section>
          <section className="arx-card"><h3>🕒 Timeline</h3>
            <ol className="arx-timeline">{[...(s.events || [])].reverse().slice(0, 30).map((e, i) => <li key={i}><b>{e.type}</b>{e.note && <span className="rf-muted">{e.note}</span>}<small>{dateFmt(e.at)}</small></li>)}</ol>
          </section>
        </div>
        <section className="arx-card"><h3>💳 Charges and retries ({d.charges.length})</h3>
          <div className="arx-table-wrap"><table className="arx-table"><thead><tr><th>When</th><th>Amount</th><th>Result</th><th>Type</th><th>Try</th><th>Reason · covers</th><th /></tr></thead>
            <tbody>
              {d.charges.map((c) => (
                <tr key={c.id}>
                  <td className="first" data-label="When"><b>{dateFmt(c.at)}</b>{c.paymentId && <span className="sub"><CopyText value={c.paymentId} /></span>}</td>
                  <td data-label="Amount" className="rf-mono">{formatINR(c.amount)}</td>
                  <td data-label="Result"><Badge tone={c.status === "paid" ? "ok" : c.status === "failed" ? "bad" : "info"}>{c.status}</Badge></td>
                  <td data-label="Type">{c.kind}</td>
                  <td data-label="Try">#{c.attempt}</td>
                  <td data-label="Reason">{c.reason || (c.periodEnd ? `to ${dayFmt(c.periodEnd)}` : "–")}</td>
                  <td className="act"><div className="arx-actions"><Btn size="sm" variant="danger" loading={busy === c.id} aria-label="Delete charge" onClick={async () => { if (await ask({ title: "Delete this charge record?", message: "Only our record is removed, permanently. Nothing changes at the gateway.", confirmLabel: "Delete forever" })) run(c.id, () => A.deleteCharge(c.id), "Charge deleted permanently.", after); }}><Trash size={14} aria-hidden /></Btn></div></td>
                </tr>))}
              {d.charges.length === 0 && <tr><td colSpan={7}><Empty e="💳">No charges yet.</Empty></td></tr>}
            </tbody></table></div>
        </section>
        <section className="arx-card danger"><h3>⚠️ Danger zone</h3>
          <p className="rf-muted">Deleting removes this subscription and all its charges for good. If it can still bill, it's cancelled at the gateway first, so the member is never charged again.</p>
          <div><Btn variant="danger" loading={busy === "del"} onClick={async () => { if (await ask({ title: "Delete this subscription for good?", message: "The subscription and every charge record are removed permanently. Billing stops. This can't be undone.", confirmLabel: "Delete forever" })) run("del", () => A.deleteSubscription(id), "Subscription deleted permanently.", () => { onChanged(); onBack(); }); }}><Trash size={15} aria-hidden />Delete subscription</Btn></div>
        </section>
      </>)}
      {confirmDialog}
    </div>
  );
}
function Subscriptions({ tick, onChanged }) {
  const [filter, setFilter] = useState("all");
  const [kind, setKind] = useState("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState("");
  const [data, error] = useList(() => A.subscriptions({ page, q, ...(filter !== "all" ? { status: filter } : {}), ...(kind !== "all" ? { kind } : {}) }), [page, q, filter, kind, tick]);
  if (open) return <SubDesk id={open} onBack={() => setOpen("")} onChanged={onChanged} />;
  return (
    <div>
      <Head title="Subscriptions" sub="Monthly Unlimited and Priority plans: status, next charge, every payment and retry." />
      <Toolbar search={<Search q={q} setQ={(v) => { setQ(v); setPage(1); }} placeholder="Name or email" />}>
        <div style={{ display: "grid", gap: 8 }}>
          <Chips value={filter} onChange={(v) => { setFilter(v); setPage(1); }} options={[["all", "All"], ["active", "🟢 Active"], ["past_due", "⚠️ Failing"], ["cancelled", "⏳ Cancelled, still on"], ["expired", "Ended"], ["failed", "Never paid"]]} />
          <Chips value={kind} onChange={(v) => { setKind(v); setPage(1); }} options={[["all", "Both plans"], ["unlimited", "♾️ Unlimited"], ["priority", "👑 Priority"]]} />
        </div>
      </Toolbar>
      <Rows data={data && { ...data, onGo: setPage }} error={error} cols={["Member", "Plan", "Status", "Paid", "Next / until", "Failed"]} empty={["🔁", "No subscriptions."]}>
        {data?.items.map((s) => { const [l, t] = SUB[s.status] || [s.status, "muted"]; return (
          <tr key={s.id} className="click" tabIndex={0} onClick={() => setOpen(s.id)} onKeyDown={(e) => e.key === "Enter" && setOpen(s.id)}>
            <td className="first" data-label="Member"><b>{s.user}</b><span className="sub">{s.email}</span></td>
            <td data-label="Plan">{s.kind === "unlimited" ? "♾️" : "👑"} {s.planName}<span className="sub">{formatINR(s.price)} / month</span></td>
            <td data-label="Status"><Badge tone={s.cancelling ? "warn" : t}>{s.cancelling ? "⏳ Cancelled" : l}</Badge></td>
            <td data-label="Paid" className="rf-mono">{s.paidCount} · {formatINR(s.paidTotal)}</td>
            <td data-label="Next">{s.nextChargeAt ? `Charge ${dayFmt(s.nextChargeAt)}` : s.accessUntil ? `Until ${dayFmt(s.accessUntil)}` : "–"}</td>
            <td data-label="Failed">{s.failedCount || "–"}</td>
          </tr>); })}
      </Rows>
    </div>
  );
}

/* ------------------------------------------------------------ plans */
const lines = (v) => String(v).split("\n").map((x) => x.trim()).filter(Boolean);
function PackForm({ plan, onClose, onDone }) {
  const [f, setF] = useState(plan ? { ...plan, features: plan.features.join("\n") } : { key: "", name: "", tagline: "", price: 100, compareAt: 0, unlocks: 5, validityDays: 90, badge: "", features: "", isActive: true, sortOrder: 0 });
  const [busy, run] = useRun();
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <Sheet title={plan ? "Edit credit pack" : "New credit pack"} subtitle="One credit opens one chat." onClose={onClose}>
      <form className="rf-form" onSubmit={(e) => { e.preventDefault(); run("save", () => A.savePlan(plan?.id, { ...f, features: lines(f.features) }), "Saved ✅", onDone); }}>
        <div className="rf-two"><TextField id="p-n" label="Name" required value={f.name} onChange={set("name")} maxLength={80} placeholder="5 chats" /><TextField id="p-k" label="Key" required value={f.key} onChange={set("key")} pattern="[a-z0-9-]{2,40}" hint="letters, numbers, dashes" placeholder="chat-5" /></div>
        <TextField id="p-t" label="Tagline" optional value={f.tagline} onChange={set("tagline")} count={160} />
        <div className="rf-two">
          <TextField id="p-p" label="Price (₹)" type="number" min={1} value={f.price} onChange={set("price")} /><TextField id="p-c" label="Crossed-out price (₹)" optional type="number" min={0} value={f.compareAt} onChange={set("compareAt")} />
          <TextField id="p-u" label="Chat credits" type="number" min={1} value={f.unlocks} onChange={set("unlocks")} /><TextField id="p-v" label="Valid for (days)" hint="0 = never expires" type="number" min={0} value={f.validityDays} onChange={set("validityDays")} />
          <TextField id="p-b" label="Badge" optional value={f.badge} onChange={set("badge")} maxLength={30} placeholder="Popular" /><TextField id="p-o" label="Order" optional type="number" value={f.sortOrder} onChange={set("sortOrder")} />
        </div>
        <TextField id="p-f" label="Feature lines" optional textarea rows={3} hint="One per line" value={f.features} onChange={set("features")} />
        <Switch checked={f.isActive} onChange={(v) => setF((x) => ({ ...x, isActive: v }))} title="On sale" />
        <div className="rf-btns rf-sticky"><Btn type="submit" loading={busy === "save"}>Save</Btn><Btn variant="ghost" onClick={onClose}>Cancel</Btn></div>
      </form>
    </Sheet>
  );
}
function SubPlanForm({ plan, onClose, onDone }) {
  const [f, setF] = useState(plan ? { ...plan, features: plan.features.join("\n") } : { key: "", kind: "priority", billing: "once", name: "", tagline: "", price: 99, days: 10, badge: "", features: "", isActive: true, sortOrder: 0 });
  const [busy, run] = useRun();
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  return (
    <Sheet title={plan ? "Edit plan" : "New plan"} subtitle="Unlimited is monthly. Priority can be monthly or a one-time pass." onClose={onClose}>
      <form className="rf-form" onSubmit={(e) => { e.preventDefault(); run("save", () => A.saveSubPlan(plan?.id, { ...f, features: lines(f.features) }), "Saved ✅", onDone); }}>
        <div className="rf-kindpick" role="group" aria-label="What it gives">
          {[["unlimited", "♾️", "Unlimited", "Unlimited requests, free chats"], ["priority", "👑", "Priority", "Badge and top of the list"]].map(([k, e, t, d]) => <button key={k} type="button" aria-pressed={f.kind === k} onClick={() => setF((x) => ({ ...x, kind: k, billing: k === "unlimited" ? "monthly" : x.billing }))}><span className="e" aria-hidden>{e}</span><b>{t}</b><span>{d}</span></button>)}
        </div>
        {f.kind === "priority" && <div className="rf-seg block" role="group" aria-label="Billing">{[["monthly", "🔁 Every month"], ["once", "⚡ One time"]].map(([k, l]) => <button key={k} type="button" aria-pressed={f.billing === k} onClick={() => setF((x) => ({ ...x, billing: k }))}>{l}</button>)}</div>}
        <div className="rf-two"><TextField id="s-n" label="Name" required value={f.name} onChange={set("name")} maxLength={80} /><TextField id="s-k" label="Key" required value={f.key} onChange={set("key")} pattern="[a-z0-9-]{2,40}" hint="letters, numbers, dashes" /></div>
        <TextField id="s-t" label="Tagline" optional value={f.tagline} onChange={set("tagline")} count={160} />
        <div className="rf-two">
          <TextField id="s-p" label={f.billing === "monthly" ? "Price per month (₹)" : "Price (₹)"} type="number" min={1} value={f.price} onChange={set("price")} />
          {f.billing === "once" && <TextField id="s-d" label="Lasts (days)" type="number" min={1} value={f.days} onChange={set("days")} />}
          <TextField id="s-b" label="Badge" optional value={f.badge} onChange={set("badge")} maxLength={30} /><TextField id="s-o" label="Order" optional type="number" value={f.sortOrder} onChange={set("sortOrder")} />
        </div>
        {plan && f.billing === "monthly" && <p className="rf-xs">💡 A new price applies to new subscribers only.</p>}
        <TextField id="s-f" label="Feature lines" optional textarea rows={3} hint="One per line" value={f.features} onChange={set("features")} />
        <Switch checked={f.isActive} onChange={(v) => setF((x) => ({ ...x, isActive: v }))} title="On sale" />
        <div className="rf-btns rf-sticky"><Btn type="submit" loading={busy === "save"}>Save</Btn><Btn variant="ghost" onClick={onClose}>Cancel</Btn></div>
      </form>
    </Sheet>
  );
}
function PlanCard({ e, name, price, unit, line, on, onEdit, onDelete }) {
  return (
    <article className="rf-card rf-plan">
      <div className="rf-row-between"><div className="name"><span className="rf-ico sm" aria-hidden>{e}</span><b>{name}</b></div><Badge tone={on ? "ok" : "muted"}>{on ? "On sale" : "Off"}</Badge></div>
      <div className="price">{formatINR(price)}<small>{unit}</small></div>
      <p className="rf-xs">{line}</p>
      <div className="rf-btns"><Btn size="sm" variant="ghost" onClick={onEdit}>Edit</Btn><Btn size="sm" variant="danger" onClick={onDelete}><Trash size={14} aria-hidden />Delete</Btn></div>
    </article>
  );
}
function Plans() {
  const [packs, e1, loadPacks] = useList(() => A.plans(), []);
  const [subs, e2, loadSubs] = useList(() => A.subPlans(), []);
  const [edit, setEdit] = useState(null);
  const [, run] = useRun();
  const [ask, confirmDialog] = useConfirm();
  const delPack = async (p) => { if (await ask({ title: `Delete “${p.name}”?`, message: "It's removed for good. People who bought it keep their credits.", confirmLabel: "Delete forever" })) run(p.id, () => A.deletePlan(p.id), "Pack deleted.", loadPacks); };
  const delSub = async (p) => { if (await ask({ title: `Delete “${p.name}”?`, message: "A plan people are subscribed to can't be deleted. Switch it off instead.", confirmLabel: "Delete forever" })) run(p.id, () => A.deleteSubPlan(p.id), "Plan deleted.", loadSubs); };
  return (
    <div>
      <Head title="Plans" sub="What members can buy. Switch whole groups on or off in Settings." actions={<><Btn variant="ghost" onClick={() => setEdit({ type: "pack" })}><Plus size={16} weight="bold" aria-hidden />Credit pack</Btn><Btn onClick={() => setEdit({ type: "sub" })}><Plus size={16} weight="bold" aria-hidden />Unlimited / Priority</Btn></>} />
      <section className="arx-sec"><h2>♾️ Unlimited and 👑 Priority</h2>
        {e2 && <p className="rf-banner bad">{e2}</p>}
        {!subs && !e2 && <Skeleton h={180} style={{ borderRadius: 16 }} />}
        {subs?.plans.length === 0 && <Empty e="🏷️">No plans yet.</Empty>}
        <div className="rf-grid c3">{subs?.plans.map((p) => <PlanCard key={p.id} e={p.kind === "unlimited" ? "♾️" : p.billing === "monthly" ? "👑" : "⚡"} name={p.name} price={p.price} unit={p.billing === "monthly" ? "/ month" : `for ${p.days} days`} line={`${p.kind === "unlimited" ? "Unlimited requests and chats" : "Priority"} · ${p.billing === "monthly" ? "auto-renews" : "one-time"}`} on={p.isActive} onEdit={() => setEdit({ type: "sub", plan: p })} onDelete={() => delSub(p)} />)}</div>
      </section>
      <section className="arx-sec"><h2>🎟️ Credit packs</h2>
        {e1 && <p className="rf-banner bad">{e1}</p>}
        {!packs && !e1 && <Skeleton h={180} style={{ borderRadius: 16 }} />}
        {packs?.plans.length === 0 && <Empty e="🎟️">No packs yet.</Empty>}
        <div className="rf-grid c3">{packs?.plans.map((p) => <PlanCard key={p.id} e="🎟️" name={p.name} price={p.price} unit="one-time" line={`${p.unlocks} chats · ${p.validityDays ? `${p.validityDays} days` : "no expiry"}`} on={p.isActive} onEdit={() => setEdit({ type: "pack", plan: p })} onDelete={() => delPack(p)} />)}</div>
      </section>
      {edit?.type === "pack" && <PackForm plan={edit.plan} onClose={() => setEdit(null)} onDone={() => { setEdit(null); loadPacks(); }} />}
      {edit?.type === "sub" && <SubPlanForm plan={edit.plan} onClose={() => setEdit(null)} onDone={() => { setEdit(null); loadSubs(); }} />}
      {confirmDialog}
    </div>
  );
}

/* ------------------------------------------------------------ settings */
function Settings() {
  const [s, setS] = useState(null);
  const [saved, setSaved] = useState("");
  const [busy, run] = useRun();
  const [ask, confirmDialog] = useConfirm();
  useEffect(() => { A.settings().then((x) => { setS(x); setSaved(JSON.stringify(x)); }).catch((e) => toast.error(errMsg(e))); }, []);
  if (!s) return <div><Head title="Settings" /><Skeleton h={420} style={{ borderRadius: 16 }} /></div>;
  const dirty = JSON.stringify(s) !== saved;
  const save = async () => {
    if (!s.enabled && JSON.parse(saved).enabled && !(await ask({ title: "Pause the referral program?", message: "Members can't search or send requests until you turn it back on. Chats stay readable.", confirmLabel: "Pause it" }))) return;
    run("save", () => A.saveSettings(s), "Settings saved ✅", (x) => { setS(x); setSaved(JSON.stringify(x)); });
  };
  const num = (k, label, props = {}) => <TextField id={`st-${k}`} label={label} type="number" value={s[k] ?? 0} onChange={(e) => setS({ ...s, [k]: e.target.value })} {...props} />;
  return (
    <div>
      <Head title="Settings" sub="What's switched on, what's on sale, and the prices." actions={<Btn loading={busy === "save"} disabled={!dirty} onClick={save}>{dirty ? "Save changes" : "Saved"}</Btn>} />
      <div className="arx-two">
        <section className="arx-card"><h3>⚙️ The program</h3>
          <Switch checked={s.enabled} onChange={(v) => setS({ ...s, enabled: v })} title="🤝 Referral program is on" hint="Off hides search and sending. Chats stay readable." />
          <Switch checked={s.postsEnabled} onChange={(v) => setS({ ...s, postsEnabled: v })} title="📌 Job board posting" hint="Members can post openings and referral offers." />
          <Switch checked={s.paywall} onChange={(v) => setS({ ...s, paywall: v })} title="💬 Sender pays to open a chat" hint="Off: every accepted chat opens free." />
          <div className="rf-two">{num("unlockFee", "Fee for one chat (₹)", { min: 1 })}{num("maxPendingRequests", "Max waiting requests per member", { min: 1, max: 100 })}</div>
          {num("signupCredits", "Free credits on first visit", { min: 0, max: 20, hint: "Each member gets these once. 0 = none." })}
        </section>
        <section className="arx-card"><h3>🛍️ What's on sale</h3>
          <Switch checked={s.plansEnabled} onChange={(v) => setS({ ...s, plansEnabled: v })} title="🎟️ Credit packs" hint="“5 chats for ₹100” style packs." />
          <Switch checked={s.subscriptionEnabled} onChange={(v) => setS({ ...s, subscriptionEnabled: v })} title="♾️ Unlimited subscription" hint="Monthly. Unlimited requests and free chats. Hidden on the public page when off." />
          <Switch checked={s.priorityEnabled} onChange={(v) => setS({ ...s, priorityEnabled: v })} title="👑 Priority" hint="Badge and requests listed first. Hidden on the public page when off." />
          <p className="rf-xs">People who already paid keep what they bought when you switch something off.</p>
        </section>
      </div>
      {confirmDialog}
    </div>
  );
}

/* ------------------------------------------------------------ the page */
const TABS = [
  ["Manage", [["overview", "📊", "Overview"], ["chats", "💬", "Chats"], ["members", "👥", "Members"], ["posts", "📌", "Job board"]]],
  ["Money", [["payments", "💳", "Payments"], ["credits", "🎟️", "Credits"], ["subs", "🔁", "Subscriptions"], ["plans", "🏷️", "Plans"]]],
  ["Setup", [["settings", "⚙️", "Settings"]]],
];
export default function AdminReferrals() {
  const [tab, setTab] = useState(() => { try { return sessionStorage.getItem("arx-tab") || "overview"; } catch { return "overview"; } });
  const [stats, setStats] = useState(null);
  const [tick, setTick] = useState(0);
  const [creditsFor, setCreditsFor] = useState({ who: "", n: 0 });
  const bump = useCallback(() => setTick((t) => t + 1), []);
  useEffect(() => { A.stats().then(setStats).catch((e) => toast.error(errMsg(e))); }, [tick]);
  const go = (t) => { setTab(t); try { sessionStorage.setItem("arx-tab", t); } catch { /* ignore */ } window.scrollTo({ top: 0 }); };
  const openCredits = (who) => { setCreditsFor((c) => ({ who, n: c.n + 1 })); go("credits"); };
  const badge = (k) => (k === "chats" ? stats?.requests.locked : k === "subs" ? stats?.subscriptions?.pastDue : 0) || 0;
  const all = TABS.flatMap(([, t]) => t);
  return (
    <Page title="Referrals | Admin" top={false} className="arx">
      <div className="arx-layout">
        <aside className="arx-side" aria-label="Referrals admin">
          <Link to="/dashboard" className="arx-brand"><span className="rf-logo" aria-hidden>🤝</span><div><b>Referrals</b><small>Admin console</small></div></Link>
          {TABS.map(([g, items]) => (
            <nav key={g} className="arx-nav" aria-label={g}><span>{g}</span>
              {items.map(([k, e, l]) => <button key={k} type="button" aria-current={tab === k ? "page" : undefined} onClick={() => go(k)}><span className="e" aria-hidden>{e}</span>{l}{badge(k) > 0 && <em>{badge(k)}</em>}</button>)}
            </nav>
          ))}
          <div className="arx-foot"><Link to="/dashboard"><House size={16} weight="fill" aria-hidden />Admin home</Link><a href="/referral/app" target="_blank" rel="noopener">🤝 Open the member app</a><a href="/referral" target="_blank" rel="noopener">🌐 Public page</a></div>
        </aside>
        <main className="arx-main">
          <div className="arx-top"><Link to="/dashboard" className="arx-brand"><span className="rf-logo" aria-hidden>🤝</span><div><b>Referrals</b><small>Admin</small></div></Link><Link to="/dashboard" className="rf-iconbtn" aria-label="Admin home"><House size={18} weight="fill" aria-hidden /></Link></div>
          <nav className="arx-tabs" aria-label="Sections">{all.map(([k, e, l]) => <button key={k} type="button" aria-current={tab === k ? "page" : undefined} onClick={() => go(k)}><span aria-hidden>{e}</span>{l}{badge(k) > 0 && <em>{badge(k)}</em>}</button>)}</nav>
          {tab === "overview" && <Overview stats={stats} go={go} />}
          {tab === "chats" && <Chats tick={tick} onChanged={bump} />}
          {tab === "members" && <Members openCredits={openCredits} />}
          {tab === "posts" && <Posts />}
          {tab === "payments" && <Payments openCredits={openCredits} />}
          {tab === "credits" && <Credits key={creditsFor.n} start={creditsFor.who} />}
          {tab === "subs" && <Subscriptions tick={tick} onChanged={bump} />}
          {tab === "plans" && <Plans />}
          {tab === "settings" && <Settings />}
        </main>
      </div>
    </Page>
  );
}
