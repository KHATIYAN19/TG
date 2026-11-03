import { useState } from "react";
import toast from "react-hot-toast";
import { Bug, Trash2 } from "lucide-react";

import { Badge, Button, Card, EmptyState, Field, Modal, Spinner, cx, inputClass } from "../ui";
import { ConfirmModal, MUTED, Pager, StatusPills, api, errMsg, fmtDateTime, humanize, useList } from "./shared";

const OPTIONS = [["open", "Open"], ["in_progress", "In progress"], ["resolved", "Resolved"], ["wont_fix", "Won't fix"]];
const SEV = { low: "slate", medium: "amber", high: "rose" };

export default function BugsTab() {
  const [status, setStatus] = useState("open");
  const [page, setPage] = useState(1);
  const [{ loading, data, error: loadError }, reload] = useList("/bugs", { status, page });
  const [target, setTarget] = useState(null);
  const [form, setForm] = useState({ status: "in_progress", adminNote: "" });
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    try {
      await api.put(`/bugs/${target.id}`, form);
      toast.success("Bug updated");
      setTarget(null); reload();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/bugs/${del.id}`);
      toast.success("Bug report permanently deleted");
      setDel(null); reload();
    } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <StatusPills options={OPTIONS} value={status} onChange={(v) => { setStatus(v); setPage(1); }} />

      {loading && !data ? <Spinner /> : loadError ? <EmptyState title="Couldn't load bug reports">{loadError}</EmptyState> : !data?.items.length ? (
        <EmptyState icon={Bug} title={`No ${humanize(status)} bugs`} />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            {data.items.map((b) => (
              <Card key={b.id} className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={SEV[b.severity]}>{b.severity}</Badge>
                  <Badge>{humanize(b.category)}</Badge>
                  <span className={cx("ml-auto text-xs", MUTED)}>{fmtDateTime(b.createdAt)}</span>
                </div>
                <h3 className="mt-3 font-semibold text-[#29201b] dk:text-[#fff7ed]">{b.title}</h3>
                <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-stone-700 dk:text-[#ead9cc]">{b.description}</p>
                {b.stepsToReproduce && <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-stone-50 p-3 text-xs text-stone-600 ring-1 ring-orange-100 dk:bg-[#1c1612] dk:text-[#d6c4b8] dk:ring-[#35261e]">{b.stepsToReproduce}</pre>}
                <p className={cx("mt-3 text-xs", MUTED)}>{b.reporter?.name} · {b.reporter?.email}{b.pageUrl ? ` · ${b.pageUrl}` : ""}</p>
                {b.adminNote && <p className="mt-2 rounded-lg bg-orange-50 p-2.5 text-xs text-orange-900 dk:bg-orange-500/10 dk:text-orange-200">Note: {b.adminNote}</p>}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setTarget(b); setForm({ status: b.status === "open" ? "in_progress" : b.status, adminNote: b.adminNote || "" }); }}>Update status</Button>
                  <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50 dk:text-rose-300" onClick={() => setDel(b)}><Trash2 className="h-3.5 w-3.5" /> Delete permanently</Button>
                </div>
              </Card>
            ))}
          </div>
          <Pager page={page} setPage={setPage} total={data.total} pageSize={data.pageSize} />
        </>
      )}

      <Modal open={Boolean(target)} onClose={() => setTarget(null)} title="Update bug report"
        footer={<><Button variant="ghost" onClick={() => setTarget(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <p className="mb-4 font-medium text-[#29201b] dk:text-[#fff7ed]">{target?.title}</p>
        <Field label="Status" htmlFor="bs"><select id="bs" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className={inputClass(false)}>
          {OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select></Field>
        <div className="mt-4"><Field label="Note (shown to the reporter)" htmlFor="bn"><textarea id="bn" rows={3} maxLength={1000} value={form.adminNote} onChange={(e) => setForm((f) => ({ ...f, adminNote: e.target.value }))} className={inputClass(false)} /></Field></div>
      </Modal>

      <ConfirmModal open={Boolean(del)} onClose={() => setDel(null)} title="Delete this bug report permanently?" busy={busy} onConfirm={remove}>
        <p>The report disappears from the database, and from the reporter's own list, for good. It <strong>can't be undone</strong>.</p>
        {del && <p className="mt-3 rounded-lg bg-stone-50 p-3 text-xs dk:bg-[#1c1612]"><strong>{del.title}</strong> · {humanize(del.category)} · {del.status}</p>}
        <p className={cx("mt-3 text-xs", MUTED)}>The deletion is recorded in the activity log.</p>
      </ConfirmModal>
    </div>
  );
}

