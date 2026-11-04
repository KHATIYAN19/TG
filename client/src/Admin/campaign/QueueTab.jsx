import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Ban, CheckCircle2, Cog, Inbox, Mail, RefreshCw, Skull, Trash2, TriangleAlert, Undo2, UserX } from "lucide-react";

import { Badge, Button, Modal, cx, inputClass } from "../../arena/ui";
import { Panel, StatCard } from "./ui";
import { MUTED, TITLE, api, errMsg, usePolling, when } from "./shared";

function Suppressions({ reloadMeta }) {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.get("/suppressions", { params: { page, search: search || undefined } }).then(({ data: r }) => setData(r)).catch((e) => toast.error(errMsg(e)));
  }, [page, search]);
  useEffect(() => {
    const id = setTimeout(load, 250);
    return () => clearTimeout(id);
  }, [load]);

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/suppressions", { email });
      setEmail("");
      toast.success("Added to the do-not-mail list");
      load();
      reloadMeta();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id) => {
    try {
      await api.delete(`/suppressions/${id}`);
      load();
      reloadMeta();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <Panel icon={UserX} title={`Do-not-mail list (${data.total})`} subtitle="People who click “Unsubscribe” land here. Campaigns never mail them.">
      <form onSubmit={add} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Add an address manually" className={inputClass(false)} />
        <Button type="submit" variant="outline" loading={busy}>Add</Button>
      </form>
      <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search" className={cx(inputClass(false), "mt-3")} aria-label="Search the do-not-mail list" />
      <ul className="mt-3 divide-y divide-stone-100 text-sm dk:divide-[#3a2c23]">
        {data.items.map((i) => (
          <li key={i._id} className="flex items-center justify-between gap-2 py-2">
            <span className="min-w-0">
              <span className={cx("block truncate", TITLE)}>{i.email}</span>
              <span className={cx("text-xs", MUTED)}>{i.reason.toLowerCase()} · {when(i.createdAt)}</span>
            </span>
            <Button size="sm" variant="ghost" onClick={() => remove(i._id)}>Allow again</Button>
          </li>
        ))}
        {!data.items.length && <li className={cx("py-4 text-center", MUTED)}>Nobody here.</li>}
      </ul>
      {data.totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className={MUTED}>Page {page} of {data.totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= data.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </Panel>
  );
}

export default function QueueTab({ meta, reloadMeta }) {
  const [status, setStatus] = useState({ queue: meta.queue, worker: meta.worker });
  const [dlq, setDlq] = useState(null);
  const [loadingDlq, setLoadingDlq] = useState(false);
  const [busy, setBusy] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const refresh = useCallback(() => {
    api.get("/queue/status").then(({ data }) => setStatus(data)).catch(() => {});
  }, []);
  usePolling(refresh, true, 6000);

  const peek = useCallback(() => {
    setLoadingDlq(true);
    api
      .get("/queue/dlq")
      .then(({ data }) => setDlq(data))
      .catch((e) => setDlq({ error: errMsg(e), messages: [] }))
      .finally(() => setLoadingDlq(false));
  }, []);

  const q = status.queue;
  const w = status.worker;
  const dlqCount = q?.dlq?.waiting;

  const run = async (name, path, body) => {
    setBusy(name);
    try {
      const { data } = await api.post(path, body);
      toast.success(data.message);
      refresh();
      peek();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy("");
      setConfirmDiscard(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* pipeline */}
      <Panel
        icon={Inbox}
        title="Email queue (Amazon SQS)"
        subtitle={`${q?.queueName || "no queue"}${q?.region ? ` · ${q.region}` : ""}`}
        action={
          <div className="flex items-center gap-2">
            {q?.reachable ? <Badge tone="emerald"><CheckCircle2 className="h-3 w-3" aria-hidden /> Connected</Badge> : q?.configured ? <Badge tone="rose">Cannot reach queue</Badge> : <Badge tone="amber">Not configured</Badge>}
            <Button size="sm" variant="outline" onClick={refresh}><RefreshCw className="h-4 w-4" aria-hidden /> Refresh</Button>
          </div>
        }
      >
        {!q?.configured && (
          <div className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dk:bg-amber-500/10 dk:text-amber-200">
            <p className="flex items-center gap-2 font-bold"><TriangleAlert className="h-4 w-4" aria-hidden /> Background email is off, so emails are sent directly.</p>
            <p className="mt-1">Add <code className="rounded bg-white/70 px-1 font-mono dk:bg-black/20">SQS_EMAIL_QUEUE_NAME=your-queue-name</code> to the server <code className="font-mono">.env</code> and restart. Still needed: <span className="font-mono font-semibold">{(q?.missing || []).join(", ")}</span></p>
          </div>
        )}
        {q?.error && <p className="mb-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dk:bg-rose-500/10 dk:text-rose-300">{q.error}</p>}
        {q?.configured && q?.reachable && !q.hasRedrivePolicy && (
          <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dk:bg-amber-500/10 dk:text-amber-200">
            This queue has no dead-letter queue attached. Failed emails are retried a few times and then dropped. Attach your DLQ in the SQS console (Queue → Dead-letter queue).
          </p>
        )}

        {/* flow: queue -> worker -> sent / dlq */}
        <div className="grid items-center gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
          <StatCard icon={Mail} label="Waiting in queue" value={q?.queue ? q.queue.waiting : "—"} tone="amber" hint={q?.queue ? `${q.queue.inFlight} being sent · ${q.queue.delayed} delayed` : undefined} />
          <ArrowRight className="mx-auto hidden h-5 w-5 text-stone-300 md:block" aria-hidden />
          <StatCard icon={Cog} label="Worker" value={w?.running ? "Running" : "Stopped"} tone={w?.running ? "emerald" : "default"} hint={w?.running ? `${w.sent} sent since restart` : q?.workerEnabled === false ? "MAIL_WORKER_ENABLED=false" : undefined} />
          <ArrowRight className="mx-auto hidden h-5 w-5 text-stone-300 md:block" aria-hidden />
          <StatCard icon={Skull} label="Dead-letter queue" value={q?.dlq?.waiting ?? "—"} tone={q?.dlq?.waiting ? "rose" : "default"} hint={q?.queue?.maxReceiveCount ? `After ${q.queue.maxReceiveCount} failed attempts` : undefined} />
        </div>

        {w?.running && (
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <StatCard label="Processed" value={w.processed} />
            <StatCard label="Sent" value={w.sent} tone="emerald" />
            <StatCard label="Retrying" value={w.retried} tone="amber" />
            <StatCard label="Failed" value={w.failed} tone={w.failed ? "rose" : "default"} />
            <StatCard label="To DLQ" value={w.dead} tone={w.dead ? "rose" : "default"} />
          </dl>
        )}
        {w?.lastError && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dk:bg-rose-500/10 dk:text-rose-300">Last error ({when(w.lastErrorAt)}): {w.lastError}</p>}
        <p className={cx("mt-3 text-xs", MUTED)}>Worker counters reset on restart. Speed: MAIL_WORKER_RATE_PER_SEC (default 10 emails/second).</p>
      </Panel>

      {/* DLQ */}
      <Panel
        icon={Skull}
        tone={dlqCount > 0 ? "danger" : undefined}
        title={`Dead-letter queue${q?.dlq?.name ? ` · ${q.dlq.name}` : ""}`}
        subtitle="Emails that kept failing land here instead of being lost. Fix the cause, then redrive."
        action={<Button size="sm" variant="outline" loading={loadingDlq} disabled={!q?.reachable} onClick={peek}><Inbox className="h-4 w-4" aria-hidden /> {dlq ? "Reload" : "Look inside"}</Button>}
      >
        {dlq?.error && <p className="text-sm text-rose-600 dk:text-rose-300">{dlq.error}</p>}
        {dlq?.message && <p className={cx("text-sm", MUTED)}>{dlq.message}</p>}
        {dlq && !dlq.error && dlq.dlq && (
          <>
            {dlq.messages.length ? (
              <div className="overflow-x-auto rounded-xl border border-stone-200 dk:border-[#443127]">
                <table className="w-full min-w-[32rem] text-left text-sm">
                  <thead className={cx("bg-stone-50 text-xs uppercase dk:bg-[#2c211b]", MUTED)}>
                    <tr><th className="px-3 py-2">To</th><th className="px-3 py-2">What</th><th className="px-3 py-2">Tries</th><th className="px-3 py-2">Queued</th><th className="px-3 py-2">Last error</th></tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dk:divide-[#3a2c23]">
                    {dlq.messages.map((m) => (
                      <tr key={m.messageId}>
                        <td className={cx("px-3 py-2", TITLE)}>{m.to || "—"}</td>
                        <td className="max-w-[14rem] truncate px-3 py-2" title={m.subject}>{m.subject}</td>
                        <td className="px-3 py-2 tabular-nums">{m.receiveCount}</td>
                        <td className={cx("px-3 py-2 text-xs", MUTED)}>{when(m.sentAt)}</td>
                        <td className="max-w-[14rem] truncate px-3 py-2 text-xs text-rose-600 dk:text-rose-300" title={m.error}>{m.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-xl bg-emerald-50 px-4 py-5 text-center text-sm font-semibold text-emerald-700 dk:bg-emerald-500/10 dk:text-emerald-300">The dead-letter queue is empty. Everything is flowing.</p>
            )}
            {dlqCount > 10 && <p className={cx("mt-2 text-xs", MUTED)}>Showing the first 10 of about {dlqCount}.</p>}
            {(dlqCount > 0 || dlq.messages.length > 0) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button loading={busy === "redrive"} onClick={() => run("redrive", "/queue/dlq/redrive", { max: 500 })}>
                  <Undo2 className="h-4 w-4" aria-hidden /> Redrive all to the main queue
                </Button>
                <Button variant="danger" onClick={() => setConfirmDiscard(true)}>
                  <Trash2 className="h-4 w-4" aria-hidden /> Discard all
                </Button>
              </div>
            )}
          </>
        )}
        {!dlq && <div className={cx("flex items-center gap-2 text-sm", MUTED)}><Ban className="h-4 w-4" aria-hidden /> Press “Look inside” to see failed emails. Looking removes nothing.</div>}
      </Panel>

      <Suppressions reloadMeta={reloadMeta} />

      <Modal
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="Discard dead-letter messages?"
        footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setConfirmDiscard(false)}>Keep them</Button><Button variant="danger" loading={busy === "discard"} onClick={() => run("discard", "/queue/dlq/discard", { max: 500 })}>Discard</Button></div>}
      >
        <p className={cx("text-sm", TITLE)}>These emails will never be sent. Campaign recipients stay marked “in DLQ” in their campaign.</p>
      </Modal>
    </div>
  );
}
