import { Link } from "react-router-dom";
import { Heart, Loader2 } from "lucide-react";

/* Light-only building blocks for the Memories pages (no dark variants on purpose). */

export const cx = (...parts) => parts.filter(Boolean).join(" ");

const VARIANTS = {
  primary: "bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 text-white shadow-lg shadow-rose-300/50 hover:shadow-xl hover:shadow-rose-300/60 hover:brightness-105 focus-visible:outline-rose-500",
  soft: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-100 hover:bg-rose-100 focus-visible:outline-rose-500",
  outline: "bg-white text-[#3a1530] ring-1 ring-inset ring-rose-200 hover:bg-rose-50 focus-visible:outline-rose-400",
  ghost: "text-[#6b3a5a] hover:bg-rose-50 focus-visible:outline-rose-400",
};
const SIZES = {
  sm: "min-h-[2.25rem] px-3.5 py-1.5 text-sm",
  md: "min-h-[2.75rem] px-5 py-2.5 text-sm",
  lg: "min-h-[3.25rem] px-7 py-3 text-base",
};

export function Button({ variant = "primary", size = "md", loading, disabled, className, children, as: As = "button", ...rest }) {
  return (
    <As
      {...rest}
      disabled={As === "button" ? disabled || loading : undefined}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[.97]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55",
        VARIANTS[variant], SIZES[size], className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </As>
  );
}

export function Field({ label, hint, error, children, htmlFor }) {
  return (
    <div>
      {label && <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-[#4a2340]">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-[#8a6a80]">{hint}</p>}
      {error && <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>}
    </div>
  );
}

export const inputClass = (invalid) =>
  cx(
    "block min-h-[2.9rem] w-full rounded-2xl border bg-white px-4 py-2.5 text-sm text-[#3a1530] placeholder:text-[#b79bb0]",
    "transition focus:outline-none focus:ring-4",
    invalid ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-rose-100 focus:border-rose-400 focus:ring-rose-100"
  );

export function Logo({ className }) {
  return (
    <Link to="/memories" className={cx("inline-flex items-center gap-2 font-bold tracking-tight text-[#3a1530]", className)} aria-label="Memories home">
      <span className="mem-beat grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-400 text-white shadow-md shadow-rose-300/60">
        <Heart className="h-[18px] w-[18px]" fill="currentColor" aria-hidden />
      </span>
      <span className="text-xl"><span className="mem-script text-2xl">Memories</span></span>
    </Link>
  );
}

export const FONT_LINKS = [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Poppins:wght@300;400;500;600;700&display=swap" },
];
