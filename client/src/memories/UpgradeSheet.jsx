import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { LockKey, ShieldCheck, Sparkle } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { useQuote } from "./AddonPicker";
import { getPage } from "./memApi";
import { PAY_MESSAGES, payFor } from "./payFlow";
import { chooseGateway } from "./paymentGateway";
import { rupees } from "./pricing";
import { Btn } from "./landingUi";
import { Banner, Sheet } from "./appUi";

/*
  SWITCH A PAGE TO A DEARER LOOK. The page was bought for one price; a look that costs more is unlocked by paying only the difference
  (paid 199, look is 209: pay 10). The server works out the amount; nothing is bought twice.
*/
export default function UpgradeSheet({ cfg, pageId, themeId, lookName, onClose, onDone }) {
  const user = useSelector((s) => s.auth?.user);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [again, setAgain] = useState(0); // bumped after a payment so the balance still missing is asked again
  const { quote, error: quoteError } = useQuote({ kind: "upgrade", pageId, theme: themeId }, true, again);
  const gateway = chooseGateway(cfg);

  const pay = async () => {
    if (!quote) return;
    setPaying(true); setError("");
    try {
      const r = await payFor({ cfg, buy: { kind: "upgrade", pageId, theme: themeId }, user, price: quote.total, description: `Upgrade to ${lookName}` });
      if (r.status === "redirect") return;
      if (r.status === "paid") {
        const fresh = await getPage(pageId);
        const short = fresh.paidPrice != null && quote.upgrade && fresh.paidPrice < quote.upgrade.full;
        onDone(fresh, !short);
        if (short) { // paid, but still short: stay open and show the balance left
          setAgain((n) => n + 1);
          return toast(`Payment received. ${rupees(quote.upgrade.full - fresh.paidPrice)} more is needed to unlock ${lookName}.`, { icon: "ℹ️", id: "memories-upgrade" });
        }
        toast.success(`${lookName} is unlocked for this page.`, { id: "memories-upgrade" });
        return onClose();
      }
      if (r.status === "dismissed") toast(PAY_MESSAGES.dismissed, { icon: "ℹ️", id: "memories-pay-cancel" });
      else setError(PAY_MESSAGES[r.status]);
    } catch (e) { setError(errMsg(e)); } finally { setPaying(false); }
  };

  return (
    <Sheet size="sm" title={`Unlock ${lookName}`} subtitle="Pay only the difference. Nothing is bought twice." icon={<Sparkle size={20} weight="duotone" aria-hidden />} onClose={onClose} locked={paying} label={`Upgrade to ${lookName}`}>
      <div className="space-y-4">
        {quote?.upgrade ? (
          <dl className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-inset ring-[#f8d7e0]">
            <div className="body-6 flex justify-between gap-3"><dt className="text-[#6b3a5a]">{lookName} costs</dt><dd className="font-semibold tabular-nums text-[#2a1023]">{rupees(quote.upgrade.full)}</dd></div>
            <div className="body-6 flex justify-between gap-3"><dt className="text-emerald-700">You already paid for this page</dt><dd className="font-semibold tabular-nums text-emerald-700">&minus;{rupees(quote.upgrade.from)}</dd></div>
            <div className="flex items-baseline justify-between gap-3 rounded-xl bg-[#fff0f4] p-3"><dt className="body-4 text-[#2a1023]">To pay</dt><dd className="text-3xl font-semibold leading-9 tabular-nums text-[#2a1023]">{rupees(quote.total)}</dd></div>
          </dl>
        ) : quoteError ? <Banner tone="error"><p>{quoteError}</p></Banner> : <div className="ma-skel h-32" role="status" aria-label="Working out the price" />}
        {(error || (quoteError && quote)) && <Banner tone="error"><p>{error || quoteError}</p></Banner>}
        <Btn className="w-full" onClick={pay} loading={paying} disabled={!quote || !gateway}><LockKey size={16} weight="fill" aria-hidden /> {quote ? `Pay ${rupees(quote.total)} and unlock` : "Pay"}</Btn>
        <p className="caption-5 flex items-center justify-center gap-1 text-center text-[#8a6a80]"><ShieldCheck size={14} weight="fill" className="shrink-0 text-emerald-600" aria-hidden /> Secure payment. You are charged only when you confirm.</p>
      </div>
    </Sheet>
  );
}
