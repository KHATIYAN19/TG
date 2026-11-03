import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertTriangle, Bug, Handshake, ShieldBan, UserRound } from "lucide-react";

import { useArena } from "../ArenaContext";
import { http, errMsg, inr } from "../api";
import { Button, Card, EmptyState, Modal, Spinner, Toggle } from "../ui";
import { BugReportButton } from "../BugReport";

const ROWS = [
  ["name", "My real name", "Your buddy sees your name instead of your anonymous ID."],
  ["email", "Email address", "The contact email on your profile."],
  ["phone", "Phone / WhatsApp number", "Share only if you're comfortable with calls or messages."],
  ["linkedin", "LinkedIn profile", "A link to your LinkedIn page."],
];

export default function SettingsPage() {
  const { me, refresh } = useArena();
  const profile = me.profile;

  const [share, setShare] = useState(profile?.shareSettings ?? {});
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState(null);
  const [preview, setPreview] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => setShare(profile?.shareSettings ?? {}), [profile?.shareSettings]);

  const loadBlocks = useCallback(() => http.get("/blocks").then(({ data }) => setBlocks(data.data)).catch(() => setBlocks([])), []);
  useEffect(() => { loadBlocks(); }, [loadBlocks]);

  const entry = me.entry;
  const matchUsed = (entry?.matchesUsed ?? 0) > 0;
  const canCancel = profile?.status === "active" && !matchUsed;
  useEffect(() => {
    if (!canCancel) return;
    http.get("/entry/cancel-preview").then(({ data }) => setPreview(data.data)).catch(() => setPreview(null));
  }, [canCancel]);

  if (!profile) {
    return <EmptyState icon={UserRound} title="Create your profile first">Settings become available once you have a profile.</EmptyState>;
  }

  const dirty = JSON.stringify(share) !== JSON.stringify(profile.shareSettings);

  const save = async () => {
    setSaving(true);
    try {
      await http.put("/share-settings", share);
      toast.success("Sharing preferences saved");
      await refresh();
    } catch (e) { toast.error(errMsg(e)); } finally { setSaving(false); }
  };

  const unblock = async (id) => {
    try { await http.delete(`/blocks/${id}`); toast.success("Unblocked"); loadBlocks(); } catch (e) { toast.error(errMsg(e)); }
  };

  const cancel = async () => {
    setCancelling(true);
    try {
      const { data } = await http.post("/entry/cancel");
      toast.success(`Entry cancelled. Refund of ${inr(data.data.refundPaise)} is on its way.`);
      setConfirmCancel(false);
      await refresh();
    } catch (e) { toast.error(errMsg(e)); } finally { setCancelling(false); }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {entry && ["paid", "in_match"].includes(entry.status) && (
        <Card className="flex items-center gap-4 p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-orange-100 dk:bg-orange-500/15 text-orange-700 dk:text-orange-300"><Handshake className="h-5 w-5" aria-hidden /></span>
          <div>
            <p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">Your entry: {entry.matchesUsed} of {entry.matchesAllowed} {entry.matchesAllowed === 1 ? "match" : "matches"} used</p>
            <p className="mt-0.5 text-sm text-stone-600 dk:text-[#d6c4b8]">
              {entry.matchesAllowed - entry.matchesUsed > 0
                ? `${entry.matchesAllowed - entry.matchesUsed} more ${entry.matchesAllowed - entry.matchesUsed === 1 ? "partnership" : "partnerships"} available. Partnerships run one at a time.`
                : "You've used every match in this entry. Buy a new entry to connect again."}
            </p>
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-[#29201b] dk:text-[#fff7ed]">What you share with your buddy</h2>
        <p className="mt-1 text-sm text-stone-600 dk:text-[#d6c4b8]">
          Nothing here is visible while you're browsing or sending requests. These choices apply only to the one buddy you match with, and you can change them any time.
        </p>
        <div className="mt-4 divide-y divide-orange-100 dk:divide-orange-500/20">
          {ROWS.map(([key, label, description]) => (
            <Toggle key={key} label={label} description={description} checked={Boolean(share[key])} onChange={(v) => setShare((s) => ({ ...s, [key]: v }))} />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-stone-500 dk:text-[#b9a79c]">Turning something off hides it again, but can't un-see what your buddy already saw.</p>
          <Button onClick={save} loading={saving} disabled={!dirty}>Save</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#29201b] dk:text-[#fff7ed]"><ShieldBan className="h-5 w-5 text-stone-400 dk:text-[#8f7c70]" aria-hidden /> Blocked members</h2>
        {blocks === null ? <Spinner /> : !blocks.length ? (
          <p className="mt-2 text-sm text-stone-600 dk:text-[#d6c4b8]">You haven't blocked anyone.</p>
        ) : (
          <ul className="mt-3 divide-y divide-orange-100 dk:divide-orange-500/20">
            {blocks.map((b) => (
              <li key={b.profileId} className="flex items-center justify-between py-3 text-sm">
                <span className="font-medium text-stone-800 dk:text-[#ffedd5]">{b.alias}</span>
                <Button size="sm" variant="outline" onClick={() => unblock(b.profileId)}>Unblock</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="border-rose-200 dk:border-rose-500/25 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#29201b] dk:text-[#fff7ed]"><AlertTriangle className="h-5 w-5 text-rose-500" aria-hidden /> Cancel my entry</h2>
        {profile.status === "matched" || matchUsed ? (
          <p className="mt-2 text-sm text-stone-600 dk:text-[#d6c4b8]">Entries can only be cancelled <strong>before your first match</strong>. {profile.status === "matched" ? "To stop, end your partnership from the “My buddy” tab." : "You've already used a match from this entry."}</p>
        ) : canCancel && preview ? (
          <>
            <p className="mt-2 text-sm text-stone-600 dk:text-[#d6c4b8]">
              Leave the arena before matching. A <strong>{preview.cancellationFeePercent}% cancellation fee</strong> applies.
            </p>
            <dl className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-[#fff8f2] dk:bg-[#15110e] p-4 text-center text-sm ring-1 ring-[#f0ded0] dk:ring-[#443127]">
              <div><dt className="text-xs text-stone-500 dk:text-[#b9a79c]">You paid</dt><dd className="mt-1 font-semibold text-[#29201b] dk:text-[#fff7ed]">{inr(preview.paidPaise)}</dd></div>
              <div><dt className="text-xs text-stone-500 dk:text-[#b9a79c]">Fee</dt><dd className="mt-1 font-semibold text-rose-600 dk:text-rose-400">−{inr(preview.feePaise)}</dd></div>
              <div><dt className="text-xs text-stone-500 dk:text-[#b9a79c]">Refund</dt><dd className="mt-1 font-semibold text-emerald-600 dk:text-emerald-400">{inr(preview.refundPaise)}</dd></div>
            </dl>
            <Button variant="danger" className="mt-4" onClick={() => setConfirmCancel(true)}>Cancel entry & refund</Button>
          </>
        ) : (
          <p className="mt-2 text-sm text-stone-600 dk:text-[#d6c4b8]">You don't have an active entry to cancel.</p>
        )}
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-100 dk:bg-[#2c211b] text-stone-600 dk:text-[#d6c4b8]"><Bug className="h-5 w-5" aria-hidden /></span>
          <div>
            <h2 className="font-semibold text-[#29201b] dk:text-[#fff7ed]">Something not working?</h2>
            <p className="text-sm text-stone-600 dk:text-[#d6c4b8]">Tell us about a bug and we'll look into it.</p>
          </div>
        </div>
        <BugReportButton className="inline-flex items-center gap-2 rounded-xl bg-stone-900 dk:bg-[#1c1612] px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800" />
      </Card>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel your entry?"
        footer={<><Button variant="ghost" onClick={() => setConfirmCancel(false)}>Keep my entry</Button><Button variant="danger" loading={cancelling} onClick={cancel}>Yes, cancel</Button></>}>
        <p>You'll leave the arena, your pending requests will be withdrawn, and <strong>{inr(preview?.refundPaise)}</strong> will be refunded to your original payment method in 5–7 working days. You'd need a new entry to rejoin.</p>
      </Modal>
    </div>
  );
}
