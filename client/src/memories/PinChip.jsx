import { useState } from "react";
import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react";

/* The page's PIN, shown to its owner: hidden until they tap the eye, with a copy button. */
export default function PinChip({ pin, onNew, className = "" }) {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(pin); setCopied(true); setTimeout(() => setCopied(false), 1600); } catch { /* clipboard blocked */ } };

  if (!pin) {
    return (
      <div className={`flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200 ${className}`}>
        <KeyRound className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
        <span className="min-w-0 flex-1">This PIN was set before it could be shown. Make a new one to see it here.</span>
        {onNew && <button type="button" onClick={onNew} className="shrink-0 rounded-lg bg-white px-2.5 py-1 font-bold text-amber-800 ring-1 ring-amber-200 hover:bg-amber-100">New PIN</button>}
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-2 rounded-2xl bg-[#fff7f3] p-2 pl-3 ${className}`}>
      <KeyRound className="h-4 w-4 shrink-0 text-rose-400" aria-hidden />
      <span className="text-xs font-semibold text-[#8a6a80]">PIN</span>
      <span className="flex-1 font-mono text-base font-bold tracking-[0.25em] text-[#3a1530]" aria-label={show ? `PIN ${pin.split("").join(" ")}` : "PIN hidden"}>{show ? pin : "••••••"}</span>
      <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide PIN" : "Show PIN"} aria-pressed={show} className="grid h-8 w-8 place-items-center rounded-xl text-[#6b3a5a] hover:bg-white">{show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}</button>
      <button type="button" onClick={copy} className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-rose-600 ring-1 ring-rose-100 hover:bg-rose-50">{copied ? <><Check className="h-3.5 w-3.5" aria-hidden /> Copied</> : <><Copy className="h-3.5 w-3.5" aria-hidden /> Copy</>}</button>
    </div>
  );
}
