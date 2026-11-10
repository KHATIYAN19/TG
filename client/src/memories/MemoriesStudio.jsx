import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, PartyPopper, Plus, Ticket } from "lucide-react";

import { TEMPLATES, rememberTemplate } from "./templates";
import { LivePhone, META, TemplatePanel } from "./Showcase";
import { useMedia, useReveal } from "./chrome";
import { Button, cx } from "./ui";

const WELCOME = {
  payment: "Payment received. 1 page credit added.",
  code: "Code accepted. 1 page credit added.",
  free: "Your free page credit is ready.",
};

/* one template, in full: the real page in a phone, its looks, what's inside, and the button that spends a credit */
function TemplateBlock({ t, credits, highlight, onCreate }) {
  const [theme, setTheme] = useState(null);
  const [audience, setAudience] = useState(null);
  const desk = useMedia("(min-width: 1024px)");
  const scale = desk ? 1.04 : 0.9;
  const ref = useRef(null);

  useEffect(() => {
    if (highlight) setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
  }, [highlight]);

  return (
    <section ref={ref} id={`t-${t.id}`} aria-label={`${t.name} template`} className={cx("mem-anchor mem-reveal scroll-mt-28 rounded-[28px] border bg-white p-4 shadow-sm transition lg:rounded-[32px] lg:p-8", highlight ? "border-rose-300 ring-4 ring-rose-100" : "border-rose-100")} style={{ "--rd": ".04s" }}>
      <div className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-10">
        <div className="mx-auto">
          <div className={cx("rounded-[40px] bg-gradient-to-br p-5 sm:p-6", t.tint)}>
            <LivePhone template={t} theme={theme} audience={audience} scale={scale} />
          </div>
          <p className="mt-2 text-center text-xs text-[#8a6a80]">Live preview. Scroll it and tap things.</p>
        </div>
        <TemplatePanel compact={!desk} t={t} theme={theme} onTheme={setTheme} audience={audience} onAudience={setAudience}>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => { rememberTemplate(t.theme); onCreate({ t, theme, audience }); }}>
              <Plus className="h-4 w-4" aria-hidden /> {credits > 0 ? "Create this page" : "Get a credit to create"}
            </Button>
            <Button as="a" href={`${t.demo}${theme ? `?theme=${theme}` : ""}`} target="_blank" rel="noopener noreferrer" variant="outline" size="lg">Full-screen demo <ArrowUpRight className="h-4 w-4" aria-hidden /></Button>
            {credits > 0 && <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a6a80]"><Ticket className="h-3.5 w-3.5" aria-hidden /> uses 1 credit</span>}
          </div>
        </TemplatePanel>
      </div>
    </section>
  );
}

/* Where you land once you can create pages: every template in detail, with a credit counter. */
export default function MemoriesStudio({ cfg }) {
  useReveal([]);
  const location = useLocation();
  const navigate = useNavigate();
  const added = Number(location.state?.added) || 0;
  const welcome = added > 1 ? `Code accepted. ${added} page credits added.` : WELCOME[location.state?.welcome];
  const wanted = (() => { try { return sessionStorage.getItem("memories:template"); } catch { return null; } })();

  const create = ({ t, theme, audience }) => {
    if (cfg.credits < 1) return navigate("/memories/app/pay");
    const q = new URLSearchParams({ ...(theme ? { theme } : {}), ...(audience ? { audience } : {}) }).toString();
    navigate(`/memories/app/create/${t.id}${q ? `?${q}` : ""}`);
  };

  return (
    <div className="py-6 sm:py-8 lg:py-8">
      {/* your credits, always at the top */}
      <section aria-label="Your page credits" className="mb-6 mt-5 flex flex-col items-center gap-4 overflow-hidden rounded-[28px] bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 p-5 text-white shadow-xl shadow-rose-200/70 lg:mt-2 lg:flex-row lg:p-6">
        <div className="flex w-full items-center gap-4 lg:w-auto">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-white/20 text-4xl font-bold tabular-nums" aria-hidden>{cfg.credits}</span>
          <div>
            <p className="text-lg font-bold leading-tight">{cfg.credits} page credit{cfg.credits === 1 ? "" : "s"}</p>
            <p className="text-sm text-white/90">Each page you create uses 1 credit. Make as many as you like.</p>
          </div>
        </div>
        <Button as={Link} to="/memories/app/pay" variant="outline" className="w-full !text-rose-600 lg:ml-auto lg:w-auto lg:shrink-0"><Plus className="h-4 w-4" aria-hidden /> Add credits</Button>
        <Link to="/memories/app/pay?gumroad=1" className="text-center text-xs font-semibold text-white underline underline-offset-2 lg:basis-full lg:text-right">Paid on Gumroad? Redeem your code</Link>
      </section>

      {welcome && (
        <div className="mem-pop-in mx-auto mb-8 flex max-w-2xl items-center gap-3 rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200" role="status">
          <PartyPopper className="h-7 w-7 shrink-0 text-emerald-600" aria-hidden />
          <div className="text-sm text-emerald-900"><p className="font-bold">{welcome}</p><p>Pick a template below and create your page.</p></div>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Choose a template</p>
        <h1 className="mt-2 text-balance text-3xl font-bold tracking-tight text-[#3a1530] sm:text-4xl">What are you celebrating?</h1>
        <p className="mx-auto mt-2 max-w-xl text-[#7a5370]">Every template is shown exactly as they will see it. Try a few looks, then create your page.</p>
      </div>

      <nav className="sticky top-14 z-30 -mx-4 mt-6 overflow-x-auto border-y border-rose-100/70 bg-white/90 px-4 py-2 backdrop-blur-md lg:mx-auto lg:w-fit lg:rounded-full lg:border lg:px-3" aria-label="Jump to a template">
        <ul className="flex gap-2">
          {TEMPLATES.map((t) => (
            <li key={t.id} className="shrink-0"><a href={`#t-${t.id}`} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-semibold text-[#6b3a5a] transition hover:bg-rose-50 hover:text-rose-600"><span aria-hidden>{META[t.id].emoji}</span> {t.name}</a></li>
          ))}
        </ul>
      </nav>

      <div className="mt-8 space-y-8">
        {TEMPLATES.map((t) => <TemplateBlock key={t.id} t={t} credits={cfg.credits} highlight={wanted === t.theme && Boolean(welcome)} onCreate={create} />)}
      </div>

    </div>
  );
}
