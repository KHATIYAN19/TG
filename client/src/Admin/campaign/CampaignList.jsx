import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Copy, Eye, Pause, Pencil, Play, Plus, RefreshCw, RotateCcw, Search, Send, Trash2, XCircle } from "lucide-react";

import { Badge, Button, Card, EmptyState, Modal, Spinner, cx, inputClass } from "../../arena/ui";
import { MUTED, Progress, Stat, TITLE, api, errMsg, usePolling, when } from "./shared";
import { StatusPill } from "./ui";

const RUNNING = ["QUEUEING", "SENDING"];
const done = (c) => (c.counts?.sent || 0) + (c.counts?.failed || 0) + (c.counts?.dead || 0) + (c.counts?.skipped || 0);

/* ---------------- one campaign, in detail ---------------- */
function CampaignDetail({ id, onClose, onChanged, onEdit, onDuplicate }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState({ recipients: [], total: 0, totalPages: 1 });
  const [htmlOpen, setHtmlOpen] = useState(false);

  const load = useCallback(() => {
    api.get(`/${id}`).then(({ data: r }) => setData(r)).catch((e) => toast.error(errMsg(e)));
  }, [id]);

  const loadRows = useCallback(() => {
    api
      .get(`/${id}/recipients`, { params: { status: status || undefined, search: search || undefined, page, limit: 25 } })
      .then(({ data: r }) => setRows(r))
      .catch(() => {});
  }, [id, status, search, page]);

  useEffect(load, [load]);
  useEffect(loadRows, [loadRows]);

  const campaign = data?.campaign;
  const live = Boolean(campaign) && (RUNNING.includes(campaign.status) || campaign.status === "SCHEDULED");
  usePolling(
    () => {
      load();
      loadRows();
    },
    live,
    4000
  );

  const act = async (name, label) => {
    setBusy(name);
    try {
      const { data: r } = await api.post(`/${id}/${name}`);
      toast.success(name === "retry" ? `${r.requeued} email(s) queued again` : label);
      load();
      loadRows();
      onChanged();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy("");
    }
  };

  const b = data?.breakdown || {};
  const failed = (campaign?.counts?.failed || 0) + (campaign?.counts?.dead || 0);

  return (
    <Modal open onClose={onClose} wide title={campaign?.name || "Campaign"}>
      {!campaign ? (
        <Spinner />
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={campaign.status} />
            <span className={cx("text-sm", MUTED)}>“{campaign.subject}”</span>
            {campaign.scheduledAt && campaign.status === "SCHEDULED" && <Badge tone="amber">Sends {when(campaign.scheduledAt)}</Badge>}
          </div>

          {campaign.lastError && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dk:bg-amber-500/10 dk:text-amber-200">{campaign.lastError}</p>
          )}

          <Progress done={done(campaign)} total={campaign.counts.total} tone={campaign.status === "COMPLETED" ? "emerald" : "orange"} />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <Stat label="Total" value={campaign.counts.total} />
            <Stat label="Sent" value={campaign.counts.sent} tone="emerald" />
            <Stat label="Waiting" value={(b.PENDING || 0) + (b.QUEUED || 0) + (b.SENDING || 0)} />
            <Stat label="Failed" value={campaign.counts.failed} tone={campaign.counts.failed ? "rose" : undefined} />
            <Stat label="In DLQ" value={campaign.counts.dead} tone={campaign.counts.dead ? "rose" : undefined} />
          </div>
          {campaign.counts.dead > 0 && (
            <p className={cx("text-xs", MUTED)}>
              “In DLQ” emails failed repeatedly and were moved to the dead-letter queue. Fix the cause (see the Queue &amp; DLQ tab), then press “Retry failed”, or redrive them from the DLQ.
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {campaign.status === "DRAFT" && (
              <Button size="sm" onClick={() => onEdit(campaign)}>
                <Pencil className="h-4 w-4" aria-hidden /> Edit &amp; send
              </Button>
            )}
            {campaign.status === "SENDING" && (
              <Button size="sm" variant="outline" loading={busy === "pause"} onClick={() => act("pause", "Paused")}>
                <Pause className="h-4 w-4" aria-hidden /> Pause
              </Button>
            )}
            {campaign.status === "PAUSED" && (
              <Button size="sm" loading={busy === "resume"} onClick={() => act("resume", "Resumed")}>
                <Play className="h-4 w-4" aria-hidden /> Resume
              </Button>
            )}
            {["SCHEDULED", "SENDING", "PAUSED"].includes(campaign.status) && (
              <Button
                size="sm"
                variant="danger"
                loading={busy === "cancel"}
                onClick={() => window.confirm("Cancel this campaign? Emails not yet sent will be skipped.") && act("cancel", "Cancelled")}
              >
                <XCircle className="h-4 w-4" aria-hidden /> Cancel
              </Button>
            )}
            {failed > 0 && !["DRAFT", "CANCELLED"].includes(campaign.status) && (
              <Button size="sm" variant="soft" loading={busy === "retry"} onClick={() => act("retry")}>
                <RotateCcw className="h-4 w-4" aria-hidden /> Retry failed ({failed})
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => act("recount", "Counts refreshed")} loading={busy === "recount"}>
              <RefreshCw className="h-4 w-4" aria-hidden /> Recount
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDuplicate(campaign)}>
              <Copy className="h-4 w-4" aria-hidden /> Duplicate
            </Button>
          </div>

          {campaign.counts.total > 0 && (
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                  className={cx(inputClass(false), "sm:w-44")}
                  aria-label="Filter by status"
                >
                  <option value="">All statuses</option>
                  {["SENT", "QUEUED", "PENDING", "SENDING", "FAILED", "DEAD", "SKIPPED"].map((s) => (
                    <option key={s} value={s}>
                      {s}
                      {b[s] ? ` (${b[s]})` : ""}
                    </option>
                  ))}
                </select>
                <div className="relative min-w-[12rem] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search e-mail"
                    className={cx(inputClass(false), "pl-9")}
                  />
                </div>
              </div>

              <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 dk:border-[#443127]">
                <table className="w-full min-w-[34rem] text-left text-sm">
                  <thead className={cx("bg-stone-50 text-xs uppercase dk:bg-[#2c211b]", MUTED)}>
                    <tr>
                      <th className="px-3 py-2">E-mail</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Tries</th>
                      <th className="px-3 py-2">Sent</th>
                      <th className="px-3 py-2">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dk:divide-[#3a2c23]">
                    {rows.recipients.map((r) => (
                      <tr key={r._id}>
                        <td className={cx("px-3 py-2", TITLE)}>
                          {r.email}
                          <div className={cx("text-xs", MUTED)}>{r.name}</div>
                        </td>
                        <td className="px-3 py-2">
                          <StatusPill status={r.status} />
                        </td>
                        <td className="px-3 py-2 tabular-nums">{r.attempts}</td>
                        <td className={cx("px-3 py-2 text-xs", MUTED)}>{when(r.sentAt)}</td>
                        <td className="max-w-[16rem] truncate px-3 py-2 text-xs text-rose-600 dk:text-rose-300" title={r.error}>
                          {r.error}
                        </td>
                      </tr>
                    ))}
                    {!rows.recipients.length && (
                      <tr>
                        <td colSpan={5} className={cx("px-3 py-6 text-center", MUTED)}>
                          No recipients match.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {rows.totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between text-sm">
                  <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Previous
                  </Button>
                  <span className={MUTED}>
                    Page {page} of {rows.totalPages}
                  </span>
                  <Button size="sm" variant="outline" disabled={page >= rows.totalPages} onClick={() => setPage(page + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}

          <div>
            <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600" onClick={() => setHtmlOpen((v) => !v)}>
              <Eye className="h-3.5 w-3.5" aria-hidden /> {htmlOpen ? "Hide" : "Show"} email template
            </button>
            {htmlOpen && (
              <iframe title="Campaign template" sandbox="" srcDoc={campaign.html} className="mt-2 h-[480px] w-full rounded-xl border border-stone-200 bg-white dk:border-[#443127]" />
            )}
          </div>
          <p className={cx("text-xs", MUTED)}>
            Created {when(campaign.createdAt)} by {campaign.createdByName || "admin"}
            {campaign.startedAt ? ` · started ${when(campaign.startedAt)}` : ""}
            {campaign.completedAt ? ` · finished ${when(campaign.completedAt)}` : ""}
          </p>
        </div>
      )}
    </Modal>
  );
}

/* ---------------- list ---------------- */
export default function CampaignList({ campaigns, setCampaigns, onNew, onEdit, onDuplicate, reloadMeta }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [openId, setOpenId] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(
    (quiet = false) => {
      if (!quiet) setLoading(true);
      api
        .get("/", { params: { status: status || undefined, search: search || undefined, page, limit: 15 } })
        .then(({ data }) => {
          setCampaigns(data.campaigns);
          setPages(data.totalPages);
          setError("");
        })
        .catch((e) => setError(errMsg(e)))
        .finally(() => setLoading(false));
    },
    [status, search, page, setCampaigns]
  );

  useEffect(() => {
    const id = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(id);
  }, [load, search]);

  usePolling(() => load(true), campaigns.some((c) => RUNNING.includes(c.status)), 5000);

  const remove = async () => {
    try {
      await api.delete(`/${deleting._id}`);
      toast.success("Campaign deleted");
      setDeleting(null);
      load(true);
      reloadMeta();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[12rem] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search campaigns"
            className={cx(inputClass(false), "pl-9")}
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className={cx(inputClass(false), "sm:w-44")}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {["DRAFT", "SCHEDULED", "SENDING", "PAUSED", "COMPLETED", "CANCELLED"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading && !campaigns.length ? (
        <Spinner />
      ) : error ? (
        <Card className="p-6 text-center">
          <p className="text-sm text-rose-600 dk:text-rose-300">{error}</p>
          <Button className="mt-3" onClick={() => load()}>
            Try again
          </Button>
        </Card>
      ) : !campaigns.length ? (
        <div>
          <EmptyState
            icon={Send}
            title="No campaigns yet"
            action={
              <Button onClick={onNew}>
                <Plus className="h-4 w-4" aria-hidden /> Create your first campaign
              </Button>
            }
          >
            Pick an audience (for example everyone who bought HLD but not LLD), choose a template and send it through the email queue.
          </EmptyState>
        </div>
      ) : (
        <ul className="space-y-3">
          {campaigns.map((c) => (
            <li key={c._id}>
              <div className="group relative overflow-hidden rounded-2xl border border-[#f0ded0] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dk:border-[#443127] dk:bg-[#241b15]">
                <span
                  aria-hidden
                  className={cx(
                    "absolute inset-y-0 left-0 w-1.5",
                    c.status === "COMPLETED" ? "bg-emerald-500" : c.status === "SENDING" ? "bg-orange-500" : c.counts?.dead > 0 ? "bg-rose-500" : c.status === "DRAFT" ? "bg-stone-300" : "bg-amber-400"
                  )}
                />
                <div className="p-5 pl-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpenId(c._id)}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cx("truncate text-base font-bold", TITLE)}>{c.name}</span>
                        <StatusPill status={c.status} />
                        {c.counts?.dead > 0 && <Badge tone="rose">{c.counts.dead} in DLQ</Badge>}
                      </div>
                      <p className={cx("mt-1 truncate text-sm", MUTED)}>{c.subject}</p>
                    </button>
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" variant="soft" onClick={() => setOpenId(c._id)}>
                        <Eye className="h-4 w-4" aria-hidden /> Open
                      </Button>
                      {!RUNNING.includes(c.status) && (
                        <Button size="sm" variant="ghost" aria-label={`Delete ${c.name}`} onClick={() => setDeleting(c)}>
                          <Trash2 className="h-4 w-4 text-rose-600" aria-hidden />
                        </Button>
                      )}
                    </div>
                  </div>

                  {c.counts?.total > 0 ? (
                    <div className="mt-4 grid items-center gap-4 sm:grid-cols-[1fr_auto]">
                      <Progress done={done(c)} total={c.counts.total} tone={c.status === "COMPLETED" ? "emerald" : "orange"} />
                      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
                        <span className="font-semibold text-emerald-700 dk:text-emerald-300">{c.counts.sent.toLocaleString("en-IN")} sent</span>
                        <span className={MUTED}>{c.counts.total.toLocaleString("en-IN")} total</span>
                        {c.counts.failed > 0 && <span className="font-semibold text-rose-600">{c.counts.failed} failed</span>}
                      </div>
                    </div>
                  ) : (
                    <p className={cx("mt-3 text-xs", MUTED)}>Not sent yet</p>
                  )}
                  <p className={cx("mt-3 text-xs", MUTED)}>
                    {c.status === "SCHEDULED" ? `Scheduled for ${when(c.scheduledAt)}` : `Created ${when(c.createdAt)}`}
                    {c.createdByName ? ` · ${c.createdByName}` : ""}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className={MUTED}>
            Page {page} of {pages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      )}

      {openId && (
        <CampaignDetail
          id={openId}
          onClose={() => setOpenId(null)}
          onChanged={() => load(true)}
          onEdit={(c) => {
            setOpenId(null);
            onEdit(c);
          }}
          onDuplicate={(c) => {
            setOpenId(null);
            onDuplicate(c);
          }}
        />
      )}

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title="Delete campaign?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Keep
            </Button>
            <Button variant="danger" onClick={remove}>
              Delete
            </Button>
          </div>
        }
      >
        <p className={cx("text-sm", TITLE)}>“{deleting?.name}” and its recipient history will be removed permanently.</p>
      </Modal>
    </div>
  );
}
