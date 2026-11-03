import { useState } from "react";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { Bug } from "lucide-react";

import { http, errMsg } from "./api";
import { Button, Field, Modal, inputClass } from "./ui";

const CATEGORIES = [
  ["payment", "Payment / checkout"],
  ["signup_login", "Sign up / login / OTP"],
  ["profile", "Profile form"],
  ["arena_browse", "Browsing the arena"],
  ["requests", "Requests / matching"],
  ["chat", "Chat"],
  ["ui_layout", "Layout / display problem"],
  ["other", "Something else"],
];

const SEVERITIES = [
  ["low", "Minor", "Annoying, but I can carry on"],
  ["medium", "Normal", "Something doesn't work right"],
  ["high", "Blocking", "I can't continue"],
];

const blank = { category: "other", severity: "medium", title: "", description: "", stepsToReproduce: "" };

export function BugReportButton({ className = "", children }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children ?? <><Bug className="h-4 w-4" aria-hidden /> Report a bug</>}
      </button>
      <BugReportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function BugReportModal({ open, onClose }) {
  const location = useLocation();
  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((x) => ({ ...x, [key]: undefined })); };

  const submit = async () => {
    const next = {};
    if (form.title.trim().length < 5) next.title = "Give the bug a short title";
    if (form.description.trim().length < 15) next.description = "Please describe what happened (at least a sentence)";
    setErrors(next);
    if (Object.keys(next).length) return;

    setSending(true);
    try {
      await http.post("/bugs", { ...form, pageUrl: `${location.pathname}${location.search}`.slice(0, 300) });
      toast.success("Thanks! We'll look into it.", { id: "arena-bug-sent" });
      setForm(blank);
      onClose();
    } catch (e) {
      toast.error(errMsg(e), { id: "arena-bug-error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report a bug"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={sending}>Send report</Button></>}
    >
      <p>Found something broken? Tell us what happened and we'll fix it. We automatically include the page you're on.</p>

      <div className="mt-4 space-y-4">
        <Field label="What area is it in?" htmlFor="bug-cat">
          <select id="bug-cat" value={form.category} onChange={set("category")} className={inputClass(false)}>
            {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </Field>

        <Field label="How bad is it?">
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Severity">
            {SEVERITIES.map(([v, l, hint]) => (
              <button
                key={v}
                type="button"
                role="radio"
                aria-checked={form.severity === v}
                onClick={() => setForm((f) => ({ ...f, severity: v }))}
                className={`rounded-xl border p-2.5 text-left transition-colors ${form.severity === v ? "border-orange-500 bg-orange-50 dk:bg-orange-500/10 ring-1 ring-orange-500" : "border-stone-300 dk:border-[#5a4336] bg-white dk:bg-[#241b15] hover:bg-orange-50 dk:hover:bg-[#35261e]"}`}
              >
                <span className={`block text-sm font-semibold ${form.severity === v ? "text-orange-800 dk:text-orange-200" : "text-[#29201b] dk:text-[#fff7ed]"}`}>{l}</span>
                <span className="mt-0.5 hidden text-[11px] leading-tight text-stone-500 dk:text-[#b9a79c] sm:block">{hint}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Short title" htmlFor="bug-title" error={errors.title}>
          <input id="bug-title" maxLength={120} value={form.title} onChange={set("title")} className={inputClass(errors.title)} placeholder="e.g. Payment page keeps loading" />
        </Field>

        <Field label="What happened?" htmlFor="bug-desc" error={errors.description} hint={`${form.description.length}/2000`}>
          <textarea id="bug-desc" rows={4} maxLength={2000} value={form.description} onChange={set("description")} className={inputClass(errors.description)} placeholder="What did you expect, and what happened instead?" />
        </Field>

        <Field label="Steps to reproduce (optional)" htmlFor="bug-steps">
          <textarea id="bug-steps" rows={3} maxLength={1500} value={form.stepsToReproduce} onChange={set("stepsToReproduce")} className={inputClass(false)} placeholder={"1. Go to…\n2. Click…"} />
        </Field>
      </div>
    </Modal>
  );
}
