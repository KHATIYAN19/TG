import { useState } from "react";
import { Check, Copy, KeyRound, Link2, Mail, MessageCircle, Send, Share2, Smartphone } from "lucide-react";

/* The message people send: the link, plus the PIN when the page has one. */
export const shareMessage = (title, url, pin) =>
  `💌 I made something special for you${title ? `: "${title}"` : ""}\n\nOpen it here: ${url}${pin ? `\nPIN: ${pin}` : ""}`;

/* Link (with copy), PIN (with copy) and one-tap share to the apps people use. */
export default function SharePanel({ title, url, pin }) {
  const [copied, setCopied] = useState("");
  const msg = shareMessage(title, url, pin);
  const e = encodeURIComponent;
  const flash = (k) => { setCopied(k); setTimeout(() => setCopied(""), 1800); };
  const copy = async (k, text) => { try { await navigator.clipboard.writeText(text); flash(k); } catch { /* blocked */ } };
  const native = async () => {
    if (navigator.share) { try { await navigator.share({ title, text: msg }); return; } catch { return; } }
    copy("msg", msg);
  };
  const apps = [
    ["WhatsApp", MessageCircle, `https://wa.me/?text=${e(msg)}`, "bg-emerald-50 text-emerald-700"],
    ["Telegram", Send, `https://t.me/share/url?url=${e(url)}&text=${e(msg.replace(url, "").replace("Open it here: ", ""))}`, "bg-sky-50 text-sky-700"],
    ["Messages", Smartphone, `sms:?&body=${e(msg)}`, "bg-violet-50 text-violet-700"],
    ["Email", Mail, `mailto:?subject=${e(title || "A page for you")}&body=${e(msg)}`, "bg-amber-50 text-amber-800"],
    ["X", Share2, `https://twitter.com/intent/tweet?text=${e(msg)}`, "bg-slate-100 text-slate-700"],
    ["Facebook", Share2, `https://www.facebook.com/sharer/sharer.php?u=${e(url)}&quote=${e(msg)}`, "bg-blue-50 text-blue-700"],
  ];
  const btn = "inline-flex shrink-0 items-center gap-1 rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-rose-600 ring-1 ring-rose-100 hover:bg-rose-50";
  return (
    <div className="mt-5 min-w-0 text-left">
      <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-[#fff7f3] p-2 pl-3">
        <Link2 className="h-4 w-4 shrink-0 text-rose-400" aria-hidden />
        <input readOnly value={url} aria-label="Page link" onFocus={(ev) => ev.target.select()} className="min-w-0 flex-1 truncate bg-transparent text-xs text-[#6b3a5a] outline-none" />
        <button type="button" onClick={() => copy("link", url)} className={btn}>{copied === "link" ? <><Check className="h-3.5 w-3.5" aria-hidden /> Copied</> : <><Copy className="h-3.5 w-3.5" aria-hidden /> Copy</>}</button>
      </div>
      {pin && (
        <div className="mt-2 flex min-w-0 items-center gap-2 rounded-2xl bg-amber-50 p-2 pl-3 ring-1 ring-amber-200">
          <KeyRound className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
          <span className="text-xs font-semibold text-amber-800">PIN</span>
          <span className="min-w-0 flex-1 truncate font-mono text-base font-bold tracking-[0.25em] text-amber-900">{pin}</span>
          <button type="button" onClick={() => copy("pin", pin)} className={btn}>{copied === "pin" ? <><Check className="h-3.5 w-3.5" aria-hidden /> Copied</> : <><Copy className="h-3.5 w-3.5" aria-hidden /> Copy</>}</button>
        </div>
      )}
      <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-[#a07890]">Share{pin ? " with the PIN" : ""}</p>
      <div className="grid grid-cols-3 gap-2">
        {apps.map(([name, Icon, href, cls]) => (
          <a key={name} href={href} target="_blank" rel="noopener noreferrer" className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-xs font-semibold ${cls}`}><Icon className="h-5 w-5" aria-hidden />{name}</a>
        ))}
      </div>
      <button type="button" onClick={native} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-600"><Share2 className="h-4 w-4" aria-hidden /> {copied === "msg" ? "Message copied" : "More apps…"}</button>
    </div>
  );
}
