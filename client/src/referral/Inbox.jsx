import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowSquareOut, Briefcase, CaretDown, ChatsCircle, Check, Coins, FilePdf, LinkedinLogo, SignOut, UserCircle, X } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { STATUS, act, ago, dateFmt, getRequest, listRequests, resumeUrl, unlockChat } from "./api";
import { Btn, Skeleton, cx } from "../resume/ui";
import { Avatar, Badge, Empty, LoadMore, PageHead, Sheet, TextField, Vip, useConfirm } from "./ui";
import { useInfinite } from "./useInfinite";
import Chat from "./Chat";
import { useRef_ } from "./RefContext";

const B = "/referral/app";
const initialsOf = (n) => String(n || "?").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const other = (r) => (r.role === "seeker"
  ? { ...r.referrer, sub: [r.referrer.role, r.company].filter(Boolean).join(" at ") }
  : { ...r.seeker, initials: initialsOf(r.seeker.name), sub: [r.seeker.currentRole || "Applicant", r.seeker.currentCompany].filter(Boolean).join(" at ") });
const FILTERS = [["all", "All"], ["pending", "⏳ Waiting"], ["accepted", "✅ Accepted"], ["rejected", "✋ Declined"], ["ended", "🔒 Ended"], ["cancelled", "↩️ Withdrawn"]];
const EMOJI = { pending: "⏳", accepted: "✅", rejected: "✋", cancelled: "↩️", ended: "🔒" };
const Status = ({ r, short }) => {
  const st = STATUS[r.status] || {};
  if (r.needsUnlock && r.role === "seeker") return <Badge tone="info">🔓 Open chat</Badge>;
  return <Badge tone={st.tone || "muted"}>{EMOJI[r.status]} {short ? st.label?.replace("Waiting for a reply", "Waiting") : st.label}</Badge>;
};

/* ------------------------------------------------------------ the list */
function Row({ r, on }) {
  const o = other(r);
  return (
    <li>
      <Link to={`${B}/inbox/${r.id}?box=${r.role === "seeker" ? "sent" : "received"}`} className={cx("rf-row", on && "on", r.isNew && "new")} aria-current={on ? "page" : undefined}>
        <Avatar person={o} ring={r.peerPriority} />
        <span className="t">
          <b><span>{o.name}</span><Vip show={r.peerPriority} /></b>
          <span className={cx("p", (r.unread > 0 || r.waiting > 0) && "strong")}>{r.waiting > 0 ? `🔒 ${r.waiting} message${r.waiting === 1 ? "" : "s"} waiting` : r.last?.text ? `${r.last.mine ? "You: " : ""}${r.last.text}` : [r.job?.title, r.job?.jobId].filter(Boolean).join(" · ") || o.sub}</span>
          <span className="c">🏢 {r.company}</span>
        </span>
        <span className="r"><span>{ago(r.last?.at || r.updatedAt)}</span>{r.unread > 0 ? <span className="rf-dot" aria-label={`${r.unread} unread`}>{r.unread}</span> : r.isNew ? <span className="rf-dot new">New</span> : <Status r={r} short />}</span>
      </Link>
    </li>
  );
}

function List({ box, setBox, activeId }) {
  const { summary, subscribe } = useRef_();
  const [status, setStatus] = useState("all");
  const list = useInfinite((page) => listRequests({ box, page, limit: 15, ...(status !== "all" ? { status } : {}) }), [box, status]);
  const { refresh, setItems } = list;
  const timer = useRef(null);
  const activeRef = useRef(activeId);
  activeRef.current = activeId;
  const itemsRef = useRef(null);
  itemsRef.current = list.items;
  // A new message just updates its row (preview, unread dot, moves to the top): no request at all. Only changes we can't see the shape of
  // (a request answered, a new request, a message in a chat that isn't in this list yet) re-read the first page, batched into one call.
  useEffect(() => {
    const later = () => { clearTimeout(timer.current); timer.current = setTimeout(refresh, 600); };
    const off = subscribe((f) => {
      if (f.type === "request_updated" || f.type === "request_new") return later();
      if (f.type !== "message" || !f.message) return;
      if (!itemsRef.current?.some((r) => r.id === f.requestId)) return later(); // not on screen (a brand-new chat): read the first page
      setItems((rows) => {
        const at = rows.findIndex((r) => r.id === f.requestId);
        if (at < 0) return rows;
        const r = rows[at];
        const m = f.message;
        const open = activeRef.current === f.requestId;
        const next = { ...r, last: m.deleted ? r.last : { text: m.text, at: m.createdAt, mine: m.mine }, updatedAt: m.createdAt, unread: !m.mine && !m.system && !open ? (r.unread || 0) + 1 : r.unread };
        return [next, ...rows.slice(0, at), ...rows.slice(at + 1)];
      });
    });
    return () => { off(); clearTimeout(timer.current); };
  }, [subscribe, refresh, setItems]);
  const c = summary?.counts || {};
  const counts = list.extra?.counts || {};
  return (
    <section className="rf-list" aria-label="Requests">
      <div className="rf-seg block" role="group" aria-label="Folder">
        <button type="button" aria-pressed={box === "received"} onClick={() => { setBox("received"); setStatus("all"); }}>📥 Received{c.unseen > 0 ? <em>{c.unseen} new</em> : c.received > 0 ? <em className="soft">{c.received}</em> : null}</button>
        <button type="button" aria-pressed={box === "sent"} onClick={() => { setBox("sent"); setStatus("all"); }}>📤 Sent{c.needUnlock > 0 && <em>{c.needUnlock}</em>}</button>
      </div>
      {box === "received" && c.unseen > 0 && <p className="rf-banner ok" style={{ marginTop: 12 }}><span className="e" aria-hidden>👀</span><span><b>{c.unseen}</b> request{c.unseen === 1 ? " hasn't" : "s haven't"} been opened yet.</span></p>}
      <div className="rf-chips" role="group" aria-label="Status" style={{ marginTop: 12 }}>{FILTERS.map(([k, l]) => (counts[k] > 0 || k === "all" || k === status) && <button key={k} type="button" aria-pressed={status === k} onClick={() => setStatus(k)}>{l}{counts[k] != null && <em>{counts[k]}</em>}</button>)}</div>
      <div style={{ marginTop: 12 }}>
        {list.items === null && !list.error && <ul className="rf-rows">{[0, 1, 2].map((i) => <li key={i}><Skeleton h={84} style={{ borderRadius: 16 }} /></li>)}</ul>}
        {list.items?.length === 0 && (box === "received"
          ? <Empty emoji="📭" title="No requests here" action={<Btn as={Link} to={`${B}/profile`} size="sm">Turn on “I can refer”</Btn>}>When someone asks you for a referral, it shows up here.</Empty>
          : <Empty emoji="📤" title="Nothing sent yet" action={<Btn as={Link} to={`${B}/find`} size="sm">Find a referrer</Btn>}>Search a company and send your resume.</Empty>)}
        {list.items?.length > 0 && <ul className="rf-rows">{list.items.map((r) => <Row key={r.id} r={r} on={r.id === activeId} />)}</ul>}
        <LoadMore list={list} noun="request" />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ everything the sender shared, laid out */
function Detail({ icon: Icon, title, children, tone }) {
  return <section className={cx("rf-sec", tone)}><h3><Icon size={16} weight="duotone" aria-hidden />{title}</h3>{children}</section>;
}
const link = (href, label, Icon) => href ? <a className="rf-linkbtn" href={href} target="_blank" rel="noopener noreferrer nofollow"><Icon size={15} weight="bold" aria-hidden />{label}<ArrowSquareOut size={12} aria-hidden /></a> : null;

function RequestDetails({ r }) {
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState("");
  const s = r.seeker;
  const viewer = r.role === "referrer";
  const open = async (download) => {
    setBusy(true);
    try { const d = await resumeUrl(r.id, download); if (download) window.open(d.url, "_blank", "noopener"); else setPreview((p) => (p ? "" : d.url)); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <div className="rf-detail">
      {viewer && (
        <Detail icon={UserCircle} title="Applicant">
          <div className="rf-person big"><Avatar person={{ name: s.name, initials: initialsOf(s.name) }} size={56} ring={s.priority} /><div><b>{s.name}<Vip show={s.priority} /></b><span className="s">{[s.currentRole, s.currentCompany].filter(Boolean).join(" at ") || "Applicant"}</span>{s.headline && <span className="s">{s.headline}</span>}</div></div>
          <dl className="rf-dl cols">
            <div><dt>Experience</dt><dd>{s.yearsExp != null ? `${s.yearsExp} year${Number(s.yearsExp) === 1 ? "" : "s"}` : "–"}</dd></div>
            <div><dt>Notice period</dt><dd>{s.noticePeriod || "Not given"}</dd></div>
            <div><dt>Current role</dt><dd>{s.currentRole || "–"}</dd></div>
            <div><dt>Current company</dt><dd>{s.currentCompany || "–"}</dd></div>
          </dl>
          {s.bio && <p className="rf-bio full">{s.bio}</p>}
          <div className="rf-linkrow">{link(s.linkedin, "LinkedIn", LinkedinLogo)}{link(s.portfolio, "Portfolio / GitHub", ArrowSquareOut)}</div>
        </Detail>
      )}
      <Detail icon={Briefcase} title="Job">
        <dl className="rf-dl cols">
          <div><dt>Company</dt><dd><b>{r.company}</b></dd></div>
          <div><dt>Title</dt><dd>{r.job.title || "Not given"}</dd></div>
          <div><dt>Job ID</dt><dd className="rv-mono">{r.job.jobId || "Not given"}</dd></div>
          <div><dt>Sent</dt><dd>{dateFmt(r.createdAt)}</dd></div>
        </dl>
        <div className="rf-linkrow">{link(r.job.link, "Open the job", ArrowSquareOut)}</div>
      </Detail>
      <Detail icon={ChatsCircle} title={viewer ? "Their message" : "Your message"}><blockquote className="rf-quote-block">{r.message}</blockquote></Detail>
      {r.resume && (
        <Detail icon={FilePdf} title="Resume">
          <div className="rf-file"><FilePdf size={26} weight="duotone" aria-hidden /><span><b>{r.resume.filename}</b><br /><small>{r.resume.size ? `${Math.max(1, Math.round(r.resume.size / 1024))} KB` : ""}</small></span><Btn size="sm" loading={busy} onClick={() => open(false)}>{preview ? "Hide preview" : "Preview"}</Btn><Btn size="sm" variant="ghost" onClick={() => open(true)}>Open / download</Btn></div>
          {preview && <iframe title="Resume preview" src={preview} className="rf-pdf" />}
        </Detail>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ one request */
function Conversation({ id }) {
  const user = useSelector((s) => s.auth?.user);
  const { refresh, subscribe } = useRef_();
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [ask, confirmDialog] = useConfirm();

  // the sidebar counters only need re-counting when opening this changed them (a request seen for the first time; unread messages are cleared by the chat itself)
  const load = useCallback(() => getRequest(id).then((x) => { setD(x); if (x.counted) refresh(); }).catch((e) => setError(errMsg(e))), [id, refresh]);
  useEffect(() => { setD(null); setError(""); load(); }, [load]);
  useEffect(() => subscribe((f) => { if (f.requestId === id && f.type === "request_updated") load(); }), [subscribe, id, load]);
  const r = d?.request;

  const run = async (name, fn, ok) => { setBusy(name); try { await fn(); if (ok) toast.success(ok); await load(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(""); } };
  const unlock = (useCredit) => run("unlock", async () => {
    const res = await unlockChat(id, { useCredit, user });
    if (res.unlocked || res.status === "paid") toast.success("Chat open 🎉 Say hello!");
    else if (res.status === "pending") toast("Your payment is being confirmed. The chat opens as soon as it is.", { icon: "⏳" });
    else if (res.status === "failed") toast.error(res.message || "The payment didn't go through. Nothing was charged.");
  });

  if (error) return <div className="rf-chatwrap"><Link to={`${B}/inbox`} className="rf-back">← Inbox</Link><p role="alert" className="rf-banner bad">{error}</p></div>;
  if (!r) return <Skeleton h={480} style={{ borderRadius: 18 }} />;
  const o = other(r);
  const isSeeker = r.role === "seeker";
  // The referrer who accepted writes straight away, free. Only the sender has to unlock to read and reply.
  const live = r.status === "accepted" && (r.chat.unlocked || !isSeeker);
  const showChat = live || (r.status === "ended" && r.chat.unlocked);
  const decide = !isSeeker && (r.status === "pending" || r.status === "rejected");
  const endedBy = r.chat.endedBy === "admin" ? "the Target Trek team" : r.chat.endedBy === "me" ? "you" : "the other person";
  const back = <Link to={`${B}/inbox?box=${isSeeker ? "sent" : "received"}`} className="rf-iconbtn rf-backbtn" aria-label="Back to the list"><ArrowLeft size={18} aria-hidden /></Link>;

  return (
    <div className="rf-chatwrap">
      {decide ? (
        <div className="rf-decide">
          <div className="rf-chat-head">{back}<div className="rf-person"><Avatar person={o} ring={r.peerPriority} /><div><b>{o.name}<Vip show={r.peerPriority} /></b><span className="s">{o.sub}</span></div></div><Status r={r} /></div>
          <div className="rf-decide-body">
            {r.status === "pending" && <p className="rf-banner ok"><span className="e" aria-hidden>📨</span><span>{o.name} wants a referral at <b>{r.company}</b>. Read below, then accept or decline.</span></p>}
            {r.status === "rejected" && <p className="rf-banner warn"><span className="e" aria-hidden>✋</span><span>You declined this{r.rejectReason ? `: “${r.rejectReason}”` : ""}. You can still accept it.</span></p>}
            <RequestDetails r={r} />
          </div>
          <div className="rf-actionbar">
            <Btn size="lg" loading={busy === "accept"} onClick={() => run("accept", () => act(id, "accept"), "Accepted ✅ They'll be told.")}><Check size={17} weight="bold" aria-hidden />{r.status === "rejected" ? "Accept anyway" : "Accept"}</Btn>
            {r.status === "pending" && <Btn size="lg" variant="danger" onClick={() => setDeclining(true)}><X size={17} weight="bold" aria-hidden />Decline</Btn>}
          </div>
        </div>
      ) : (
        <div className="rf-chat">
          <div className="rf-chat-head">{back}
            <div className="rf-person"><Avatar person={o} ring={r.peerPriority} /><div><b>{o.name}<Vip show={r.peerPriority} /></b><span className="s">{o.sub}</span></div></div>
            <Status r={r} />
            {live && <button type="button" className="rf-iconbtn danger" aria-label="End this chat" title="End chat" onClick={async () => { if (await ask({ title: "End this chat?", message: "Neither of you can send more messages.", confirmLabel: "End chat" })) run("end", () => act(id, "end"), "Chat ended."); }}><SignOut size={18} aria-hidden /></button>}
          </div>
          {showChat ? <Chat key={id} requestId={id} open={live} /> : (
            <div className="rf-locked">
              {r.status === "pending" && isSeeker && (<><span className="e" aria-hidden>⏳</span><h3>Waiting for {o.name}</h3><p>Your request and resume are with them. You'll see their answer here.</p>
                <Btn variant="danger" loading={busy === "cancel"} onClick={async () => { if (await ask({ title: "Withdraw this request?", message: "They will no longer see it.", confirmLabel: "Withdraw" })) run("cancel", () => act(id, "cancel"), "Request withdrawn."); }}>Withdraw request</Btn></>)}
              {r.status === "accepted" && !r.chat.unlocked && isSeeker && (<>
                <span className="e" aria-hidden>🎉</span><h3>{o.name} said yes!</h3>
                {r.waiting > 0 && <Badge tone="ok">💬 {r.waiting} message{r.waiting === 1 ? "" : "s"} waiting</Badge>}
                <p>Open the chat to {r.waiting > 0 ? "read and reply" : "message them"}. They already have your resume and the job.</p>
                {d.credits?.left > 0
                  ? <div className="rf-btns" style={{ justifyContent: "center" }}><Btn size="lg" loading={busy === "unlock"} onClick={() => unlock(true)}><Coins size={17} weight="bold" aria-hidden />Use 1 credit ({d.credits.left} left)</Btn><Btn size="lg" variant="ghost" onClick={() => unlock(false)}>Pay ₹{d.unlockFee}</Btn></div>
                  : <div className="rf-btns" style={{ justifyContent: "center" }}><Btn size="lg" loading={busy === "unlock"} onClick={() => unlock(false)}>Unlock chat for ₹{d.unlockFee}</Btn><Btn as={Link} to={`${B}/plans`} size="lg" variant="ghost">👑 Go Unlimited</Btn></div>}</>)}
              {r.status === "rejected" && isSeeker && <><span className="e" aria-hidden>🙏</span><h3>They declined this one</h3>{r.rejectReason && <p>“{r.rejectReason}”</p>}<p>They may still change their mind. Meanwhile, try someone else.</p><Btn as={Link} to={`${B}/find`}>Find another referrer</Btn></>}
              {r.status === "cancelled" && <><span className="e" aria-hidden>↩️</span><h3>You withdrew this request</h3></>}
              {r.status === "ended" && !r.chat.unlocked && <><span className="e" aria-hidden>🔒</span><h3>This chat was closed</h3></>}
            </div>
          )}
          {r.status === "ended" && r.chat.unlocked && <p className="rf-closed">🔒 Ended by {endedBy}{r.chat.endReason ? `: ${r.chat.endReason}` : ""}.</p>}
        </div>
      )}
      {!decide && r.status !== "cancelled" && <details className="rf-details"><summary><span>{isSeeker ? "📎 What you sent" : "📎 Applicant, job and resume"}</span><CaretDown size={16} className="caret" aria-hidden /></summary><div className="rf-card"><RequestDetails r={r} /></div></details>}
      {confirmDialog}
      {declining && (
        <Sheet title="Decline this request" subtitle="They will see your reason. You can still accept later." onClose={() => setDeclining(false)}>
          <div className="rf-form"><TextField id="f-reason" label="Reason" optional textarea rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. We don't have an opening in your area right now." />
            <div className="rf-btns"><Btn variant="danger" loading={busy === "reject"} onClick={() => run("reject", async () => { await act(id, "reject", { reason }); setDeclining(false); setReason(""); }, "Declined.")}>Decline</Btn><Btn variant="ghost" onClick={() => setDeclining(false)}>Cancel</Btn></div></div>
        </Sheet>
      )}
    </div>
  );
}

export default function Inbox() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const { summary } = useRef_();
  const [box, setBoxState] = useState(params.get("box") === "sent" ? "sent" : params.get("box") === "received" ? "received" : null);
  useEffect(() => { if (box === null && summary) setBoxState(summary.counts.received > 0 || summary.counts.sent === 0 ? "received" : "sent"); }, [summary, box]);
  const setBox = (b) => { setBoxState(b); setParams({ box: b }, { replace: true }); };
  return (
    <div>
      <PageHead eyebrow="💬 Inbox" title="Requests and chats" sub={id ? null : "Everything you sent and received. Declined requests stay, so a referrer can still accept."} />
      <div className={cx("rf-inbox", id && "has-chat")}>
        {box && <List box={box} setBox={setBox} activeId={id} />}
        {id && <div><Conversation id={id} /></div>}
      </div>
    </div>
  );
}
