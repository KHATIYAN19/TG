import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LockKey, Package, ShieldCheck } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import AddonPicker, { useQuote } from "./AddonPicker";
import { getPage } from "./memApi";
import { PAY_MESSAGES, payFor } from "./payFlow";
import { gatewayLabel, chooseGateway } from "./paymentGateway";
import { limitsWithExtra, rupees } from "./pricing";
import { Btn } from "./landingUi";
import { Banner, Sheet } from "./appUi";

/*
  GET MORE ROOM. Two cases, one screen and one way to pay (payFor, the same call the checkout uses):
    - a page that exists: pass `pageId`. The packs are bought for that page (buy kind "addon").
    - a page that is paid for but not built yet: pass `pending` = { occasionId, theme, limits, owned, days }. The packs are bought with the
      paid page itself (buy kind "page", exactly what the checkout sends when the look is already covered), so the room is there when the
      page is created. `reload` re-reads the account afterwards so the builder sees the new limits at once.

  GET MORE ROOM FOR A PAGE YOU ALREADY MADE. A sheet on phones, a dialog on large screens. The user picks add-on packs, sees the exact price
  from the server as a small bill, pays, and the room is added to that page. Used from the editor, My pages and the "page created" screen.
*/
export default function AddonShop({ cfg, pageId, pending, reload, unsaved = false, onClose, onApplied }) {
  const user = useSelector((s) => s.auth?.user);
  const [page, setPage] = useState(null);
  const [packs, setPacks] = useState({});
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const total = Object.values(packs).reduce((a, b) => a + b, 0);
  const buy = pending ? { kind: "page", occasionId: pending.occasionId, theme: pending.theme, packs } : { kind: "addon", pageId, packs };
  const { quote, loading, error: quoteError } = useQuote(total > 0 ? buy : null);
  const gateway = chooseGateway(cfg);

  useEffect(() => { if (pageId) getPage(pageId).then(setPage).catch((e) => setError(errMsg(e))); }, [pageId]);

  const pay = async () => {
    if (!quote) return;
    setPaying(true); setError("");
    try {
      const r = await payFor({ cfg, buy, user, price: quote.total, description: "Extra room for your page" });
      if (r.status === "redirect") return;
      if (r.status === "paid") {
        toast.success("Added to your page.", { id: "memories-addon" });
        if (pending) { await reload?.(); onApplied?.(null); } // the room now sits on the paid page; the fresh account data carries it
        else onApplied?.(await getPage(pageId));
        return onClose();
      }
      if (r.status === "dismissed") toast(PAY_MESSAGES.dismissed, { icon: "ℹ️", id: "memories-pay-cancel" });
      else setError(PAY_MESSAGES[r.status]);
    } catch (e) { setError(errMsg(e)); } finally { setPaying(false); }
  };

  const ready = pending || page;
  const current = pending ? { ...pending.limits, days: pending.days } : page ? { ...limitsWithExtra(page.limits, null), days: page.daysLeft } : {};
  const owned = pending ? pending.owned || {} : page?.extra;
  const lines = total > 0 ? quote?.addons || [] : [];

  const footer = (
    <>
      {(error || quoteError) && <Banner tone="error" className="mb-3"><p>{error || quoteError}</p></Banner>}
      {!gateway && <Banner tone="warn" className="mb-3"><p>Online payment is not available right now. Please try again later.</p></Banner>}
      {lines.length > 0 && (
        <dl className="mb-3 max-h-24 space-y-1 overflow-y-auto rounded-2xl bg-[#fff0f4] p-3" aria-label="Your bill">
          {lines.map((a) => (
            <div key={a.key} className="caption-4 flex justify-between gap-3 text-[#6b3a5a]"><dt className="min-w-0 truncate">{a.name} <span className="text-[#a07890]">x{a.packs}</span></dt><dd className="shrink-0 font-semibold tabular-nums text-[#2a1023]">{rupees(a.price)}</dd></div>
          ))}
        </dl>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1">
          {total === 0
            ? <p className="body-6 text-[#7a5370]">Tap + on anything you need.</p>
            : <p className="caption-4 text-[#7a5370]">Total <span key={quote?.total} className="ma-bump ml-1 inline-block text-2xl font-semibold leading-8 tabular-nums text-[#2a1023]">{quote ? rupees(quote.total) : loading ? "…" : ""}</span></p>}
          <p className="caption-5 flex items-center gap-1 text-[#8a6a80]"><ShieldCheck size={14} weight="fill" className="shrink-0 text-emerald-600" aria-hidden /> Paid once on {gatewayLabel(gateway) || "a secure page"}. Added right away.</p>
        </div>
        <Btn onClick={pay} loading={paying} disabled={!quote || total === 0 || !gateway} className="w-full sm:w-auto"><LockKey size={16} weight="fill" aria-hidden /> {quote && total > 0 ? `Pay ${rupees(quote.total)}` : "Pay"}</Btn>
      </div>
    </>
  );

  return (
    <Sheet size="lg" title="Get more room" subtitle={pending ? "For the page you are building. Pick packs, pay once." : page ? <>For &ldquo;{page.title}&rdquo;. Pick packs, pay once.</> : "Loading your page…"} icon={<Package size={20} weight="duotone" aria-hidden />} onClose={onClose} locked={paying} footer={footer}>
      {pending && unsaved && <Banner tone="info" className="mb-3"><p>Your words are saved on this device. If the payment opens on another screen, add your photos and voice message again when you come back.</p></Banner>}
      {!ready && !error && <div className="grid grid-cols-1 gap-3 md:grid-cols-2" role="status" aria-label="Loading">{[0, 1, 2, 3].map((i) => <div key={i} className="ma-skel h-40" />)}</div>}
      {ready && <AddonPicker catalog={cfg.addons} packs={packs} onChange={(p) => { setPacks(p); setError(""); }} current={current} owned={owned} disabled={paying} />}
    </Sheet>
  );
}
