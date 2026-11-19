import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowSquareOut, Buildings, CheckCircle, Clock, MagnifyingGlass, MapPin, PaperPlaneTilt, Plus, Trash, X } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { ago, createPost, deletePost, getPost, listPosts, myPosts, updatePost } from "./api";
import { Btn, Skeleton, cx } from "../resume/ui";
import { AskForm } from "./Directory";
import { Avatar, Badge, Empty, LoadMore, PageHead, Sheet, TextField, focusFirstError, useConfirm } from "./ui";
import { useInfinite } from "./useInfinite";
import { useRef_ } from "./RefContext";

const B = "/referral/app";
const KINDS = [["hiring", "🧑‍💼", "My team is hiring", "Share an opening at your company."], ["referral", "🤝", "I can refer for", "List roles you can refer people for."]];
const blank = { kind: "hiring", company: "", title: "", roles: "", location: "", experience: "", description: "", applyLink: "" };
const rules = (f) => {
  const e = {};
  if (f.company.trim().length < 2) e.company = "Enter the company";
  if (f.title.trim().length < 4) e.title = "Add a short title (at least 4 letters)";
  if (f.applyLink.trim() && !/^https?:\/\/\S+$/i.test(f.applyLink.trim())) e.applyLink = "Enter a full link starting with https://";
  if (f.kind === "hiring" && !f.applyLink.trim() && f.description.trim().length < 20) { e.applyLink = "Add an apply link, or explain how to apply below"; e.description = "Add an apply link above, or a couple of lines here"; }
  return e;
};
const Kind = ({ k }) => <span className={cx("rf-kind", k)}>{k === "hiring" ? "🧑‍💼 Hiring" : "🤝 Can refer"}</span>;
const memberOf = (p) => ({ id: p.author?.profileId, name: p.author?.name, anonymous: p.author?.anonymous, initials: p.author?.initials, role: p.author?.role, company: p.company, headline: p.author?.headline });

/* ------------------------------------------------------------ new post */
function PostForm({ onClose, onDone, profile }) {
  const [f, setF] = useState({ ...blank, company: profile?.company || "" });
  const [errors, setErrors] = useState({});
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const change = (next) => { setF(next); if (tried) setErrors(rules(next)); };
  const set = (k) => (e) => change({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setTried(true);
    const bad = rules(f); setErrors(bad);
    if (Object.keys(bad).length) { toast.error("Please fix the fields marked in red."); return focusFirstError(bad); }
    setErr(""); setBusy(true);
    try { await createPost(f); toast.success("Posted on the job board 📌"); onDone(); } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
  };
  const tf = (k, label, props = {}) => <TextField id={`f-${k}`} label={label} value={f[k]} onChange={set(k)} error={errors[k]} {...props} />;
  const roles = f.roles.split(",").map((r) => r.trim()).filter(Boolean);
  return (
    <Sheet title="New post" subtitle="Members at your company can ask you for a referral for it." onClose={onClose}>
      <form className="rf-form" onSubmit={submit} noValidate>
        <div className="rf-kindpick" role="group" aria-label="What are you posting?">
          {KINDS.map(([k, e, t, d]) => <button key={k} type="button" aria-pressed={f.kind === k} onClick={() => change({ ...f, kind: k })}><span className="e" aria-hidden>{e}</span><b>{t}</b><span>{d}</span></button>)}
        </div>
        <div className="rf-two">
          {tf("company", "Company", { required: true, maxLength: 100, placeholder: "Flipkart" })}
          {tf("title", "Title", { required: true, maxLength: 140, placeholder: f.kind === "hiring" ? "Backend team is hiring SDE-1" : "Referrals for backend roles" })}
        </div>
        {tf("roles", "Roles", { optional: true, placeholder: "SDE-1, SDE-2, QA", hint: "Separate with commas." })}
        {roles.length > 0 && <div className="rf-tags" aria-label="Roles preview">{roles.map((r) => <span key={r} className="rf-tag">{r}</span>)}</div>}
        <div className="rf-two">
          {tf("location", "Location", { optional: true, maxLength: 80, placeholder: "Bengaluru · Remote" })}
          {tf("experience", "Experience", { optional: true, maxLength: 60, placeholder: "0–2 years" })}
        </div>
        {tf("applyLink", "Apply link", { required: f.kind === "hiring", optional: f.kind === "referral", type: "url", inputMode: "url", maxLength: 500, placeholder: "https://careers…" })}
        {tf("description", "Details", { optional: true, textarea: true, rows: 5, count: 3000, placeholder: "What the team does. Who you look for. How to apply." })}
        {err && <p role="alert" className="rv-err">{err}</p>}
        <div className="rf-btns rf-sticky"><Btn type="submit" size="lg" loading={busy}><Plus size={17} weight="bold" aria-hidden />Publish post</Btn><Btn variant="ghost" size="lg" onClick={onClose}>Cancel</Btn></div>
      </form>
    </Sheet>
  );
}

/* ------------------------------------------------------------ a post in the list */
function PostCard({ p, onAsk, mine, onChange }) {
  const [busy, setBusy] = useState(false);
  const [ask, confirmDialog] = useConfirm();
  const run = async (fn, ok) => { setBusy(true); try { await fn(); toast.success(ok); onChange(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); } };
  return (
    <article className="rf-card lift rf-post">
      <div className="top"><Kind k={p.kind} /><span className="rf-xs">{ago(p.createdAt)}</span></div>
      <div style={{ display: "grid", gap: 4 }}>
        <span className="co"><Buildings size={15} aria-hidden />{p.company}</span>
        <h3><Link to={`${B}/board/${p.id}`}>{p.title}</Link></h3>
      </div>
      {(p.location || p.experience) && <div className="meta">{p.location && <span><MapPin size={14} aria-hidden />{p.location}</span>}{p.experience && <span><Clock size={14} aria-hidden />{p.experience}</span>}</div>}
      {p.roles.length > 0 && <div className="rf-tags">{p.roles.slice(0, 5).map((r) => <span key={r} className="rf-tag">{r}</span>)}{p.roles.length > 5 && <span className="rf-tag">+{p.roles.length - 5}</span>}</div>}
      {p.description && <p className="d rf-clamp c3">{p.description}</p>}
      {p.author && !mine && <div className="by"><Avatar person={p.author} size={34} /><div><b>{p.author.name}</b><small>{p.author.role}{p.author.yearsExp != null ? ` · ${p.author.yearsExp} yrs` : ""}</small></div></div>}
      <div className="rf-btns">
        {mine ? (<>
          <Badge tone={p.hidden ? "bad" : p.status === "open" ? "ok" : "muted"}>{p.hidden ? "⛔ Removed by admin" : p.status === "open" ? "🟢 Open" : "⚪ Closed"}</Badge>
          {!p.hidden && <Btn size="sm" variant="ghost" loading={busy} onClick={() => run(() => updatePost(p.id, { status: p.status === "open" ? "closed" : "open" }), p.status === "open" ? "Post closed." : "Post reopened.")}>{p.status === "open" ? "Close" : "Reopen"}</Btn>}
          <Btn size="sm" variant="danger" loading={busy} onClick={async () => { if (await ask({ title: "Delete this post?", message: "It's removed for everyone. This can't be undone.", confirmLabel: "Delete" })) run(() => deletePost(p.id), "Post deleted."); }}><Trash size={14} aria-hidden />Delete</Btn>
        </>) : (<>
          {p.requested
            ? <Btn as={Link} to={`${B}/inbox`} size="sm" variant="ghost"><CheckCircle size={14} weight="fill" aria-hidden />{p.requested === "accepted" ? "Chat open" : "Requested"}</Btn>
            : p.canAsk && <Btn size="sm" onClick={() => onAsk(p)}><PaperPlaneTilt size={14} weight="bold" aria-hidden />Ask for referral</Btn>}
          <Btn as={Link} to={`${B}/board/${p.id}`} size="sm" variant="ghost">Details</Btn>
          {p.applyLink && <Btn as="a" href={p.applyLink} target="_blank" rel="noopener noreferrer nofollow" size="sm" variant="ghost"><ArrowSquareOut size={14} weight="bold" aria-hidden />Apply</Btn>}
        </>)}
      </div>
      {confirmDialog}
    </article>
  );
}

/* ------------------------------------------------------------ one post */
function PostPage({ id }) {
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [error, setError] = useState("");
  const [ask, setAsk] = useState(false);
  useEffect(() => { setP(null); setError(""); getPost(id).then((d) => setP(d.post)).catch((e) => setError(errMsg(e))); }, [id]);
  const back = <Link to={`${B}/board`} className="rf-back">← Job board</Link>;
  if (error) return <div>{back}<p role="alert" className="rf-banner bad">{error}</p></div>;
  if (!p) return <div>{back}<Skeleton h={380} style={{ borderRadius: 16 }} /></div>;
  const first = p.author?.anonymous ? "the poster" : String(p.author?.name || "").split(" ")[0];
  return (
    <div>
      {back}
      <article className="rf-card rf-post" style={{ gap: 18 }}>
        <div className="top"><Kind k={p.kind} /><span className="rf-xs">Posted {ago(p.createdAt)}{p.status === "closed" ? " · Closed" : ""}</span></div>
        <div style={{ display: "grid", gap: 6 }}>
          <span className="co"><Buildings size={16} aria-hidden />{p.company}</span>
          <h1 className="rf-h1" style={{ fontSize: "clamp(24px, 3.4vw, 32px)" }}>{p.title}</h1>
        </div>
        <ul className="rf-facts">
          <li><span>🏢 Company</span><b>{p.company}</b></li>
          <li><span>📍 Location</span><b>{p.location || "–"}</b></li>
          <li><span>⏳ Experience</span><b>{p.experience || "–"}</b></li>
          <li><span>🧩 Roles</span><b>{p.roles.length ? p.roles.length : "–"}</b></li>
        </ul>
        {p.roles.length > 0 && <div className="rf-tags">{p.roles.map((r) => <span key={r} className="rf-tag">{r}</span>)}</div>}
        {p.description && <div style={{ display: "grid", gap: 6 }}><h2 className="rf-label">Details</h2><p className="rf-prose">{p.description}</p></div>}
        {p.author && <div className="rf-ask-head"><Avatar person={p.author} size={48} /><div><b>{p.author.name}</b><span>{[p.author.role, p.company].filter(Boolean).join(" at ")}{p.author.yearsExp != null ? ` · ${p.author.yearsExp} yrs` : ""}</span>{p.author.headline && <span>{p.author.headline}</span>}</div></div>}
        <div className="rf-stickycta">
          {p.requested ? <Btn as={Link} to={`${B}/inbox`} size="lg" variant="ghost"><CheckCircle size={17} weight="fill" aria-hidden />{p.requested === "accepted" ? "Open your chat" : "Request sent · see status"}</Btn>
            : p.canAsk ? <Btn size="lg" onClick={() => setAsk(true)}><PaperPlaneTilt size={18} weight="bold" aria-hidden />Ask {first} for a referral</Btn>
              : <span className="rf-muted">{p.mine ? "📌 This is your post." : "The poster isn't taking requests for this right now."}</span>}
          {p.applyLink && <Btn as="a" href={p.applyLink} target="_blank" rel="noopener noreferrer nofollow" size="lg" variant="ghost"><ArrowSquareOut size={17} weight="bold" aria-hidden />Apply</Btn>}
        </div>
      </article>
      {ask && <AskForm member={memberOf(p)} post={p} onClose={() => setAsk(false)} onSent={(rid) => nav(`${B}/inbox/${rid}`)} />}
    </div>
  );
}

/* ------------------------------------------------------------ the board */
function List() {
  const nav = useNavigate();
  const { summary } = useRef_();
  const [tab, setTab] = useState("all");
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [form, setForm] = useState(false);
  const [ask, setAsk] = useState(null);
  useEffect(() => { const t = setTimeout(() => setTerm(q.trim()), 250); return () => clearTimeout(t); }, [q]);
  const list = useInfinite((page) => (tab === "mine" ? myPosts().then((d) => ({ items: d.items, total: d.items.length, page: 1, pages: 1 })) : listPosts({ kind: tab === "all" ? "" : tab, q: term, page, limit: 10 })), [tab, term]);
  const canPost = summary?.postsEnabled !== false;
  return (
    <div>
      <PageHead eyebrow="💼 Job board" title="Openings and referral offers" sub="Members share openings at their company, or roles they can refer for. Ask the poster for that exact job."
        actions={canPost && <Btn size="lg" onClick={() => setForm(true)}><Plus size={18} weight="bold" aria-hidden />New post</Btn>} />
      <div className="rf-searchbar">
        <div className="rf-seg block" role="group" aria-label="Filter posts">{[["all", "✨ All"], ["hiring", "🧑‍💼 Hiring"], ["referral", "🤝 Can refer"], ["mine", "📌 Mine"]].map(([k, l]) => <button key={k} type="button" aria-pressed={tab === k} onClick={() => setTab(k)}>{l}</button>)}</div>
        {tab !== "mine" && <div className="rf-qwrap"><MagnifyingGlass size={19} aria-hidden /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search company, title or role" aria-label="Search posts" enterKeyHint="search" />{q && <button type="button" className="x" onClick={() => setQ("")} aria-label="Clear search"><X size={16} weight="bold" aria-hidden /></button>}</div>}
      </div>
      <div className="rf-count" aria-live="polite">{list.items ? <span><b>{list.total}</b> post{list.total === 1 ? "" : "s"}{term && tab !== "mine" ? <> for “{term}”</> : ""}</span> : <span>Loading…</span>}</div>
      {list.items === null && !list.error && <div className="rf-grid c2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={240} style={{ borderRadius: 16 }} />)}</div>}
      {list.items?.length === 0 && <Empty emoji={tab === "mine" ? "📝" : "📭"} title={tab === "mine" ? "You haven't posted yet" : "Nothing here yet"} action={canPost && <Btn onClick={() => setForm(true)}><Plus size={16} weight="bold" aria-hidden />Create a post</Btn>}>{tab === "mine" ? "Share an opening, or the roles you can refer for." : "Be the first to post."}</Empty>}
      {list.items?.length > 0 && <div className="rf-grid c2">{list.items.map((p) => <PostCard key={p.id} p={p} mine={tab === "mine"} onChange={list.reload} onAsk={setAsk} />)}</div>}
      <LoadMore list={list} noun="post" />
      {form && <PostForm profile={summary?.profile} onClose={() => setForm(false)} onDone={() => { setForm(false); setTab("mine"); list.reload(); }} />}
      {ask && <AskForm member={memberOf(ask)} post={ask} onClose={() => setAsk(null)} onSent={(rid) => nav(`${B}/inbox/${rid}`)} />}
    </div>
  );
}

export default function Board() {
  const { id } = useParams();
  return id ? <PostPage id={id} /> : <List />;
}
