import { Gift, ShareNetwork, Sparkle, UserPlus, Wallet } from "@phosphor-icons/react";

import { formatPrice } from "./api";
import { Btn, SIGNUP, SectionHead } from "./landingUi";

/*
  Refer & earn on the landing page. Shown only when the admin has switched it on; the number of friends and the cash value
  are the admin's settings (public info), never typed in here.
*/
export default function ReferralSection({ info }) {
  const r = info?.referral;
  if (!r?.enabled) return null;
  const n = r.perCredit;
  const friends = `${n} friend${n === 1 ? "" : "s"}`;
  const steps = [
    [ShareNetwork, "Share your link", "Sign up, open Refer and earn, and send your personal link to friends."],
    [UserPlus, "They sign up and pay", "A friend counts once they join with your link and pay for a page."],
    [Gift, "You get a free page", `${n === 1 ? "For each friend who pays" : `For every ${n} friends who pay`}, you earn 1 page credit. Use it to create a page for free.`],
  ];
  return (
    <section className="bg-[#fffaf6] py-20 sm:py-28" aria-labelledby="refer-h">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHead id="refer" kicker="Refer and earn" title={<span id="refer-h">Bring {friends}. Get a page free.</span>} text="Love Memories? Share it. When friends sign up with your link and pay for a page, you earn page credits of your own." />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-14 sm:gap-6 lg:grid-cols-5">
          <ol className="grid grid-cols-1 gap-4 lg:col-span-3">
            {steps.map(([Icon, title, text], i) => (
              <li key={title} className="mem-reveal" style={{ "--rd": `${i * 0.12}s` }}>
                <div className="ml-card flex h-full items-start gap-3 rounded-3xl bg-white p-4 ring-1 ring-[#f5dfe4] sm:gap-4 sm:p-6">
                  <span className="ml-card-icon grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#e11d48] text-white"><Icon size={24} weight="duotone" aria-hidden /></span>
                  <div className="min-w-0 flex-1">
                    <h3 className="heading-6 text-[#2a1023]">{title}</h3>
                    <p className="body-6 mt-1 text-[#7a5370]">{text}</p>
                  </div>
                  <span className="text-3xl font-semibold leading-none tabular-nums text-[#fecdd3] sm:text-4xl" aria-hidden>{i + 1}</span>
                </div>
              </li>
            ))}
          </ol>

          <div className="mem-reveal lg:col-span-2" style={{ "--rd": ".2s" }}>
            <div className="ml-card relative flex h-full flex-col overflow-hidden rounded-3xl bg-[#e11d48] p-5 text-white sm:p-8">
              <Sparkle size={96} weight="fill" className="absolute -right-4 -top-4 text-[#fb7185]" aria-hidden />
              <p className="caption-3 relative text-rose-100" style={{ letterSpacing: "0.12em" }}>YOUR REWARD</p>
              <p className="relative mt-3 text-5xl font-semibold leading-none tabular-nums">{n}</p>
              <p className="body-3 relative mt-1 text-rose-100">paid friend{n === 1 ? "" : "s"} = 1 page credit</p>
              {r.cashEnabled && r.cashPerCredit > 0 && (
                <div className="relative mt-5 rounded-2xl bg-white/15 p-4">
                  <p className="body-5 flex items-center gap-2 font-medium"><Wallet size={18} weight="duotone" aria-hidden /> Prefer cash?</p>
                  <p className="body-6 mt-1 text-rose-50">Take <b>{formatPrice(r.cashPerCredit)}</b> per credit to your UPI instead. A credit already used for a page cannot be cashed.</p>
                </div>
              )}
              <div className="relative mt-auto pt-6"><Btn to={SIGNUP} variant="ghost" className="w-full">Start referring</Btn></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
