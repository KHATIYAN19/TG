import { useEffect } from "react";
import { Loader2, X } from "lucide-react";

export const cx = (...parts) => parts.filter(Boolean).join(" ");

const VARIANTS = {
  primary:
    "bg-orange-600 text-white hover:bg-orange-700 focus-visible:outline-orange-600 shadow-sm shadow-orange-600/20",
  dark: "bg-stone-900 text-white hover:bg-stone-800 focus-visible:outline-stone-900 dk:bg-[#fff7ed] dk:text-[#29201b] dk:hover:bg-white",
  soft: "bg-orange-50 dk:bg-orange-500/10 text-orange-700 dk:text-orange-300 hover:bg-orange-100 dk:hover:bg-orange-500/15 focus-visible:outline-orange-600",
  outline:
    "bg-white dk:bg-[#241b15] text-stone-700 dk:text-[#ead9cc] ring-1 ring-inset ring-stone-300 dk:ring-[#5a4336] hover:bg-orange-50 dk:hover:bg-orange-500/10 focus-visible:outline-stone-400",
  danger: "bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600",
  ghost: "text-stone-600 dk:text-[#d6c4b8] hover:bg-orange-100/60 dk:hover:bg-orange-500/15 focus-visible:outline-stone-400",
};

const SIZES = {
  sm: "min-h-[2.25rem] px-3 py-1.5 text-sm",
  md: "min-h-[2.75rem] px-4 py-2.5 text-sm",
  lg: "min-h-[3rem] px-6 py-3 text-base",
};

export function Button({ variant = "primary", size = "md", loading, disabled, className, children, ...rest }) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function Card({ className, children, ...rest }) {
  return (
    <div {...rest} className={cx("rounded-2xl border border-[#f0ded0] dk:border-[#443127] bg-white dk:bg-[#241b15] shadow-sm", className)}>
      {children}
    </div>
  );
}

const TONES = {
  slate: "bg-stone-100 dk:bg-[#2c211b] text-stone-700 dk:text-[#ead9cc]",
  brand: "bg-orange-50 dk:bg-orange-500/10 text-orange-700 dk:text-orange-300 ring-1 ring-inset ring-orange-100 dk:ring-orange-500/20",
  emerald: "bg-emerald-50 dk:bg-emerald-500/10 text-emerald-700 dk:text-emerald-300 ring-1 ring-inset ring-emerald-100 dk:ring-emerald-500/20",
  amber: "bg-amber-50 dk:bg-amber-500/10 text-amber-800 dk:text-amber-200 ring-1 ring-inset ring-amber-100 dk:ring-amber-500/20",
  rose: "bg-rose-50 dk:bg-rose-500/10 text-rose-700 dk:text-rose-300 ring-1 ring-inset ring-rose-100 dk:ring-rose-500/20",
};

export function Badge({ tone = "slate", className, children }) {
  return (
    <span className={cx("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[tone], className)}>
      {children}
    </span>
  );
}

export function Field({ label, hint, error, children, htmlFor }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-stone-800 dk:text-[#ffedd5]">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-stone-500 dk:text-[#b9a79c]">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dk:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass = (invalid) =>
  cx(
    "block min-h-[2.75rem] w-full rounded-xl border bg-white dk:bg-[#241b15] px-3.5 py-2.5 text-sm text-[#29201b] dk:text-[#fff7ed] placeholder:text-stone-400 dk:placeholder:text-[#8f7c70]",
    "focus:outline-none focus:ring-2",
    invalid
      ? "border-rose-300 dk:border-rose-500/30 focus:ring-rose-200 dk:focus:ring-rose-500/25"
      : "border-stone-300 dk:border-[#5a4336] focus:border-orange-500 focus:ring-orange-100 dk:focus:ring-orange-500/20"
  );

export function Spinner({ label = "Loading" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-stone-500 dk:text-[#b9a79c]" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-orange-600 dk:text-orange-400" aria-hidden />
      {label}…
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 dk:border-[#5a4336] bg-[#fff8f2]/60 dk:bg-[#15110e]/60 px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-white dk:bg-[#241b15] text-orange-600 dk:text-orange-400 shadow-sm ring-1 ring-[#f0ded0] dk:ring-[#443127]">
          <Icon className="h-6 w-6" aria-hidden />
        </span>
      )}
      <h3 className="text-base font-semibold text-[#29201b] dk:text-[#fff7ed]">{title}</h3>
      {children && <p className="mt-1.5 max-w-sm text-sm text-stone-600 dk:text-[#d6c4b8]">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  // z-[9995]: above the site's floating sale tab (9990) so it can't cover a pop-up's buttons, below toasts (9999).
  return (
    <div className="fixed inset-0 z-[9995] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-stone-900/50 dk:bg-[#1c1612]/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative max-h-sheet w-full overflow-y-auto rounded-t-3xl bg-white dk:bg-[#241b15] p-5 pb-safe shadow-2xl ${wide ? "sm:max-w-4xl" : "sm:max-w-lg"} sm:rounded-3xl sm:p-6`}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-[#29201b] dk:text-[#fff7ed]">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-500 dk:text-[#b9a79c] hover:bg-orange-100/60 dk:hover:bg-orange-500/15" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="text-sm text-stone-600 dk:text-[#d6c4b8]">{children}</div>
        {footer && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:flex-wrap sm:justify-end [&>button]:w-full sm:[&>button]:w-auto">{footer}</div>}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-[#29201b] dk:text-[#fff7ed]">{label}</p>
        {description && <p className="mt-0.5 text-xs text-stone-500 dk:text-[#b9a79c]">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:opacity-50",
          checked ? "bg-orange-600" : "bg-stone-300 dk:bg-[#443127]"
        )}
      >
        <span
          className={cx(
            "pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white dk:bg-[#241b15] shadow transition-transform",
            checked && "translate-x-5"
          )}
        />
      </button>
    </div>
  );
}

export function Avatar({ seed = "?", className }) {
  // Warm hues only (red-orange → amber) so avatars sit inside the brand palette.
  const n = [...seed].reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) % 997, 7);
  const hue = 6 + (n % 44);
  return (
    <span
      aria-hidden
      className={cx("grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white", className)}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 88% 56%), hsl(${(hue + 14) % 360} 86% 42%))` }}
    >
      {seed.replace(/^Member-/, "").slice(0, 2).toUpperCase()}
    </span>
  );
}

/* Multi-select / single-select pill used in the profile form. */
export function ChipToggle({ selected, onClick, children, disabled, className }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600",
        selected
          ? "border-orange-500 bg-orange-50 dk:bg-orange-500/10 text-orange-800 dk:text-orange-200"
          : "border-stone-300 dk:border-[#5a4336] bg-white dk:bg-[#241b15] text-stone-700 dk:text-[#ead9cc] hover:border-stone-400 hover:bg-orange-50 dk:hover:bg-[#35261e]",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {selected && <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-orange-600" />}
      {children}
    </button>
  );
}

/* Big selectable card (radio behaviour) for level / preference choices. */
export function OptionCard({ selected, onClick, title, hint }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cx(
        "flex-1 rounded-xl border p-3.5 text-left transition-colors",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600",
        selected ? "border-orange-500 bg-orange-50 dk:bg-orange-500/10 ring-1 ring-orange-500" : "border-stone-300 dk:border-[#5a4336] bg-white dk:bg-[#241b15] hover:bg-orange-50 dk:hover:bg-[#35261e]"
      )}
    >
      <span className={cx("block text-sm font-semibold", selected ? "text-orange-800 dk:text-orange-200" : "text-[#29201b] dk:text-[#fff7ed]")}>{title}</span>
      {hint && <span className="mt-0.5 block text-xs text-stone-500 dk:text-[#b9a79c]">{hint}</span>}
    </button>
  );
}

/* A titled form section with an icon, used to chunk long forms. */
export function Section({ icon: Icon, title, subtitle, badge, children }) {
  return (
    <section className="rounded-2xl border border-[#f0ded0] dk:border-[#443127] bg-white dk:bg-[#241b15] p-5 shadow-sm sm:p-6">
      <header className="mb-5 flex flex-wrap items-start gap-x-3.5 gap-y-2.5">
        {Icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-100 dk:bg-orange-500/15 text-orange-700 dk:text-orange-300">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        )}
        <div className="min-w-0 flex-1 basis-[11rem]">
          <h2 className="text-base font-semibold text-[#29201b] dk:text-[#fff7ed] sm:text-lg">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-stone-600 dk:text-[#d6c4b8]">{subtitle}</p>}
        </div>
        {badge}
      </header>
      {children}
    </section>
  );
}
