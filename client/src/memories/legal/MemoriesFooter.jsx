import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

import { Logo } from "../ui";
import { BRAND, LEGAL_LINKS, SUPPORT_EMAIL } from "./constants";

/* The footer every public Memories page shares: the legal pages and the support address. */
export default function MemoriesFooter({ className = "" }) {
  return (
    <footer className={`border-t border-rose-100 bg-white ${className}`}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-[#8a6a80] sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Logo />
          <p>Made with love by {BRAND}.</p>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
            {LEGAL_LINKS.map(([label, to]) => <Link key={to} to={to} className="font-medium hover:text-rose-600">{label}</Link>)}
          </nav>
          <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1.5 font-semibold text-rose-600 hover:underline"><Mail className="h-4 w-4" aria-hidden /> {SUPPORT_EMAIL}</a>
        </div>
      </div>
    </footer>
  );
}
