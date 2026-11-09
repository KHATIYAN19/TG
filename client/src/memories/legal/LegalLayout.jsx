import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, ListTree, Mail } from "lucide-react";

import { useMemoriesChrome } from "../chrome";
import { Button, FONT_LINKS, Logo, cx } from "../ui";
import "../memories.css";
import MemoriesFooter from "./MemoriesFooter";
import { LEGAL_LINKS, LEGAL_UPDATED, SITE_URL, SUPPORT_EMAIL } from "./constants";

/* body text helpers, so every page reads the same */
export const P = ({ children }) => <p className="mt-3 text-[15px] leading-7 text-[#4a2340]">{children}</p>;
export const UL = ({ items }) => <ul className="mt-3 space-y-2">{items.map((x, i) => <li key={i} className="flex gap-3 text-[15px] leading-7 text-[#4a2340]"><span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-400" aria-hidden /><span>{x}</span></li>)}</ul>;
export const Note = ({ children }) => <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900 ring-1 ring-amber-200">{children}</p>;
export const Mail_ = ({ subject = "", body = "", children }) => <a className="font-semibold text-rose-600 underline-offset-2 hover:underline" href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}${body ? `&body=${encodeURIComponent(body)}` : ""}`}>{children || SUPPORT_EMAIL}</a>;

/*
  LEGAL PAGE LAYOUT (terms, privacy, refunds).
    phones  : a short intro, an "On this page" menu you can open, then the text in one comfortable column
    desktop : the contents list sticks to the side and highlights the part you're reading
*/
export default function LegalLayout({ title, path, description, intro, sections }) {
  useMemoriesChrome();
  const token = useSelector((s) => s.auth?.token);
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver((entries) => { const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (hit) setActive(hit.target.id); }, { rootMargin: "-90px 0px -65% 0px" });
    sections.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [sections]);

  return (
    <div className="mem-root min-h-screen overflow-x-clip bg-gradient-to-b from-[#fff3ee] via-[#fffaf6] to-white">
      <Helmet>
        <title>{`${title} | Memories by Target Trek`}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={`${SITE_URL}${path}`} />
        <meta name="theme-color" content="#fffaf6" />
        {FONT_LINKS.map((l) => <link key={l.href} {...l} />)}
      </Helmet>

      <header className="sticky top-0 z-40 border-b border-rose-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Logo />
          <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Legal pages">
            {LEGAL_LINKS.map(([label, to]) => (
              <NavLink key={to} to={to} className={({ isActive }) => cx("rounded-full px-3.5 py-1.5 text-sm font-semibold transition", isActive ? "bg-rose-50 text-rose-600" : "text-[#6b3a5a] hover:bg-rose-50")}>{label}</NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Button as={Link} to={token ? "/memories/app" : "/memories/login"} size="sm" variant={token ? "primary" : "outline"}>{token ? "Open my app" : "Log in"}</Button>
          </div>
        </div>
        {/* phones: the same four pages as a swipeable row */}
        <nav className="flex gap-1 overflow-x-auto border-t border-rose-50 px-3 py-1.5 md:hidden" aria-label="Legal pages (mobile)">
          {LEGAL_LINKS.map(([label, to]) => (
            <NavLink key={to} to={to} className={({ isActive }) => cx("shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold", isActive ? "bg-rose-50 text-rose-600" : "text-[#6b3a5a]")}>{label}</NavLink>
          ))}
        </nav>
      </header>

      <main>
        <div className="mx-auto max-w-6xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14 lg:pt-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">Memories by Target Trek</p>
          <h1 className="mt-2 max-w-3xl text-balance text-3xl font-bold tracking-tight text-[#3a1530] sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#7a5370] sm:text-lg">{intro}</p>
          <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#8a6a80]">
            <span>Last updated {LEGAL_UPDATED}</span>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1.5 font-semibold text-rose-600 hover:underline"><Mail className="h-4 w-4" aria-hidden /> {SUPPORT_EMAIL}</a>
          </p>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
          {/* contents: a menu on phones, a sticky list on desktop */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <details className="group rounded-2xl border border-rose-100 bg-white p-4 shadow-sm lg:hidden">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-[#3a1530] [&::-webkit-details-marker]:hidden"><ListTree className="h-4 w-4 text-rose-500" aria-hidden /> On this page <span className="ml-auto text-xs font-medium text-[#8a6a80] group-open:hidden">Tap to open</span></summary>
              <ol className="mt-3 space-y-1">
                {sections.map((s, i) => <li key={s.id}><a href={`#${s.id}`} onClick={(e) => e.currentTarget.closest("details").removeAttribute("open")} className="block rounded-lg px-2 py-1.5 text-sm text-[#6b3a5a] hover:bg-rose-50">{i + 1}. {s.title}</a></li>)}
              </ol>
            </details>
            <nav className="hidden lg:block" aria-label="On this page">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a07890]">On this page</p>
              <ol className="mt-3 space-y-0.5 border-l border-rose-100">
                {sections.map((s, i) => (
                  <li key={s.id}><a href={`#${s.id}`} className={cx("-ml-px block border-l-2 py-1.5 pl-4 pr-2 text-sm transition", active === s.id ? "border-rose-500 font-semibold text-rose-600" : "border-transparent text-[#6b3a5a] hover:border-rose-200 hover:text-rose-600")}>{i + 1}. {s.title}</a></li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="mt-6 min-w-0 rounded-[28px] border border-rose-100 bg-white p-5 shadow-sm sm:p-8 lg:mt-0 lg:p-10">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className={cx("scroll-mt-28", i > 0 && "mt-10 border-t border-rose-50 pt-8")}>
                <h2 className="text-xl font-bold tracking-tight text-[#3a1530] sm:text-2xl"><span className="mr-2 text-rose-400">{i + 1}.</span>{s.title}</h2>
                {s.body}
              </section>
            ))}
            <div className="mt-12 flex flex-col items-start gap-3 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-[#6b3a5a]">Still have a question? We&apos;re happy to help.</p>
              <Button as={Link} to="/memories/contact" size="sm">Contact us <ArrowRight className="h-4 w-4" aria-hidden /></Button>
            </div>
          </article>
        </div>
      </main>

      <MemoriesFooter />
    </div>
  );
}
