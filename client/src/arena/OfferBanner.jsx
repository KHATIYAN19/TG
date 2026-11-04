import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

import { cx } from "./ui";

/*
  Limited-time offer shown under the pay / join button.
  `offer` comes from the server: { active, text, endsAt, serverNow }.

  The countdown uses the SERVER clock (offset measured once) so a wrong clock on the
  visitor's device cannot show the wrong time. When it reaches zero the banner hides itself.
*/
const pad = (n) => String(n).padStart(2, "0");

export default function OfferBanner({ offer, className = "" }) {
  const endsAt = offer?.endsAt ? new Date(offer.endsAt).getTime() : null;
  const [offset] = useState(() => {
    const server = offer?.serverNow ? new Date(offer.serverNow).getTime() : NaN;
    return Number.isFinite(server) ? server - Date.now() : 0;
  });
  const [now, setNow] = useState(() => Date.now() + offset);

  useEffect(() => {
    if (!endsAt) return undefined;
    const tick = () => setNow(Date.now() + offset);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt, offset]);

  if (!offer?.active) return null;

  const left = endsAt ? endsAt - now : null;
  if (left !== null && left <= 0) return null; // ended while the page was open
  if (!offer.text && left === null) return null;

  const total = left === null ? 0 : Math.floor(left / 1000);
  const d = Math.floor(total / 86400);
  const timer = `${d > 0 ? `${d}d ` : ""}${pad(Math.floor((total % 86400) / 3600))}h ${pad(Math.floor((total % 3600) / 60))}m ${pad(total % 60)}s`;

  return (
    <p
      role="status"
      className={cx(
        "inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-full bg-rose-50 px-3.5 py-1.5 text-center text-xs font-semibold text-rose-700 ring-1 ring-rose-200 dk:bg-rose-500/10 dk:text-rose-200 dk:ring-rose-500/30 sm:text-sm",
        className
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0" aria-hidden>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600" />
      </span>
      {offer.text && <span className="whitespace-pre-line">{offer.text}</span>}
      {left !== null && (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2 py-0.5 font-bold tabular-nums text-white" aria-label={`${timer} left`}>
          <Clock className="h-3 w-3" aria-hidden /> {timer}
        </span>
      )}
    </p>
  );
}
