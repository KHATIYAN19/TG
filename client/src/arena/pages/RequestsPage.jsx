import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, Clock, Inbox, MessageSquareQuote, Send, X } from "lucide-react";

import { useArena } from "../ArenaContext";
import { http, errMsg, timeAgo } from "../api";
import { Avatar, Badge, Button, Card, EmptyState, Modal, cx } from "../ui";
import { CardSkeletons, InfiniteFooter, useInfiniteList } from "../infinite";
import { MemberDetails } from "../MemberBits";

const STATUS_TONE = { pending: "amber", accepted: "emerald", rejected: "rose", expired: "slate" };

const daysLeft = (expiresAt) => {
  const d = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86_400_000);
  return d <= 0 ? "expires today" : d === 1 ? "expires tomorrow" : `expires in ${d} days`;
};

/*
  One invitation. The person deciding sees the sender's COMPLETE arena card
  (role, company, experience, skills, languages, availability, practice style,
  timeline, bio, goal) plus the message they wrote. Name/contact stay hidden.
*/
function RequestCard({ r, box, busy, onAccept, onReject, onWithdraw }) {
  const p = r.profile;
  const incoming = box === "incoming";

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-start gap-3 border-b border-orange-100 bg-orange-50/50 px-5 py-4 dk:border-orange-500/20 dk:bg-orange-500/5 sm:px-6">
        <Avatar seed={p.alias} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[#29201b] dk:text-[#fff7ed]">{p.alias}</p>
            <Badge tone={STATUS_TONE[r.status] ?? "slate"}>{incoming ? "wants to be your buddy" : r.status}</Badge>
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 dk:text-[#b9a79c]">
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" aria-hidden /> {incoming ? "Sent" : "You sent it"} {timeAgo(r.createdAt)}</span>
            {r.status === "pending" && <span>{daysLeft(r.expiresAt)}</span>}
            {r.status !== "pending" && r.respondedAt && <span>{r.status} {timeAgo(r.respondedAt)}</span>}
          </p>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {r.message ? (
          <blockquote className="flex gap-3 rounded-xl bg-white p-4 text-sm ring-1 ring-orange-200 dk:bg-[#1c1612] dk:ring-orange-500/30">
            <MessageSquareQuote className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500 dk:text-[#b9a79c]">{incoming ? "Their message" : "Your message"}</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-[#29201b] dk:text-[#fff7ed]">{r.message}</p>
            </div>
          </blockquote>
        ) : (
          <p className="text-sm italic text-stone-400 dk:text-[#8f7c70]">{incoming ? "They didn't add a message." : "You didn't add a message."}</p>
        )}

        <MemberDetails m={p} />

        {r.status === "pending" && (
          <div className="flex flex-col gap-3 border-t border-orange-100 pt-5 dk:border-orange-500/20 sm:flex-row">
            {incoming ? (
              <>
                <Button className="flex-1" size="lg" onClick={() => onAccept(r)} loading={busy === r.id}><Check className="h-4 w-4" /> Accept</Button>
                <Button className="flex-1" size="lg" variant="outline" onClick={() => onReject(r)} disabled={busy === r.id}><X className="h-4 w-4" /> Decline</Button>
              </>
            ) : (
              <Button className="w-full sm:w-auto" variant="outline" onClick={() => onWithdraw(r)} loading={busy === r.id}>Withdraw request</Button>
            )}
          </div>
        )}

        {r.status === "accepted" && !incoming && <Link to="../buddy" className="inline-block text-sm font-semibold text-orange-700 dk:text-orange-300">Open chat →</Link>}
      </div>
    </Card>
  );
}

export default function RequestsPage() {
  const { me, refresh } = useArena();
  const [tab, setTab] = useState("incoming");
  const [busy, setBusy] = useState("");
  const [confirm, setConfirm] = useState(null);

  // 6 per page: each card is large (full details), so load a few at a time as you scroll.
  const list = useInfiniteList(
    async (page) => {
      const { data } = await http.get("/requests", { params: { box: tab, page, pageSize: 6 } });
      const d = data.data;
      return { items: d.items, total: d.total, hasMore: d.hasMore };
    },
    [tab]
  );
  const { items, total, loading, error } = list;

  // A NEW invitation arrived (live socket event): reload so it appears at the top.
  // Only when the count goes UP. Accepting or declining one lowers it, and that
  // must not throw away what you've scrolled through.
  const prevIncoming = useRef(me?.counts?.incoming ?? 0);
  useEffect(() => {
    const now = me?.counts?.incoming ?? 0;
    if (now > prevIncoming.current && tab === "incoming") list.reload();
    prevIncoming.current = now;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.counts?.incoming]);

  const act = async (r, action, success, afterLocal) => {
    setBusy(r.id);
    try {
      await http.post(`/requests/${r.id}/${action}`);
      toast.success(success);
      afterLocal?.();
      refresh();
    } catch (e) {
      toast.error(errMsg(e));
      list.reload(); // the request changed under us (withdrawn / expired): show the truth
    } finally {
      setBusy("");
      setConfirm(null);
    }
  };

  if (me.profile?.status !== "active") {
    return (
      <EmptyState icon={Inbox} title="Join the arena to use requests" action={<Link to="../profile" className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white">Go to profile</Link>}>
        Requests are available once your profile is live in the arena.
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-5 inline-flex rounded-xl bg-stone-100 p-1 text-sm font-semibold dk:bg-[#2c211b]" role="tablist">
        {[["incoming", "Received", Inbox, me.counts.incoming], ["outgoing", "Sent", Send, 0]].map(([key, label, Icon, count]) => (
          <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
            className={cx("flex items-center gap-2 rounded-lg px-4 py-2 transition", tab === key ? "bg-white text-[#29201b] shadow-sm dk:bg-[#241b15] dk:text-[#fff7ed]" : "text-stone-500 hover:text-stone-800 dk:text-[#b9a79c]")}>
            <Icon className="h-4 w-4" aria-hidden /> {label}
            {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">{count}</span>}
          </button>
        ))}
      </div>

      {loading ? <CardSkeletons count={2} className="!grid-cols-1 sm:!grid-cols-1 lg:!grid-cols-1" /> : error && !items.length ? (
        <EmptyState title="Couldn't load your invitations" action={<Button onClick={list.retry}>Try again</Button>}>{error}</EmptyState>
      ) : !items.length ? (
        <EmptyState icon={tab === "incoming" ? Inbox : Send} title={tab === "incoming" ? "No invitations yet" : "You haven't sent any requests"}
          action={tab === "outgoing" && <Link to="../arena" className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white">Browse the arena</Link>}>
          {tab === "incoming" ? "When someone wants to be your buddy, you'll see their full profile here and can accept or decline." : "Browse the arena and send a request to someone who fits."}
        </EmptyState>
      ) : (
        <>
          <p className="mb-4 text-sm text-stone-500 dk:text-[#b9a79c]">Showing {items.length} of {total} {tab === "incoming" ? "invitation" : "request"}{total === 1 ? "" : "s"}</p>
          <div className="space-y-5">
            {items.map((r) => (
              <RequestCard key={r.id} r={r} box={tab} busy={busy}
                onAccept={setConfirm}
                onReject={(x) => act(x, "reject", "Request declined", () => list.remove(x.id))}
                onWithdraw={(x) => act(x, "withdraw", "Request withdrawn", () => list.remove(x.id))} />
            ))}
          </div>
          <InfiniteFooter list={list} endLabel={tab === "incoming" ? "That's every invitation" : "That's every request you've sent"} />
        </>
      )}

      <Modal open={Boolean(confirm)} onClose={() => setConfirm(null)} title={`Match with ${confirm?.profile.alias}?`}
        footer={<><Button variant="ghost" onClick={() => setConfirm(null)}>Not yet</Button><Button onClick={() => act(confirm, "accept", "You're matched! 🎉")} loading={Boolean(busy)}>Accept & match</Button></>}>
        <ul className="list-disc space-y-2 pl-5">
          <li>You'll be locked to this one buddy.</li>
          <li>All your other pending requests are cancelled, and you can't send or accept new ones until this partnership ends.</li>
          <li>You can chat right away, and choose what personal details to share.</li>
        </ul>
      </Modal>
    </div>
  );
}
