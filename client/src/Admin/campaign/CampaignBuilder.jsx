import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, BadgePercent, Code2, FlaskConical, LayoutTemplate, PenLine, Save, Send, ShieldCheck, Sparkles, Ticket } from "lucide-react";

import { Badge, Button, ChipToggle, Field, Modal, Toggle, cx, inputClass } from "../../arena/ui";
import {
  EMPTY_AUDIENCE,
  EMPTY_CONTENT,
  MUTED,
  TITLE,
  api,
  cleanAudience,
  errMsg,
  money,
  useDebounced,
} from "./shared";
import AudienceBuilder from "./AudienceBuilder";
import { MailFrame, Panel, Stepper, Thumb } from "./ui";

const STEPS = ["Audience", "Email", "Review & send"];

const PLACEHOLDERS = [
  ["{{name}}", "customer name"],
  ["{{firstName}}", "first name"],
  ["{{purchasedBooks}}", "books they own"],
  ["{{{message}}}", "your message"],
  ["{{{coupon}}}", "coupon box"],
  ["{{{button}}}", "button"],
  ["{{{products}}}", "featured books"],
  ["{{couponCode}}", "code only"],
  ["{{unsubscribeUrl}}", "unsubscribe link"],
];

const toLocalInput = (d) => {
  if (!d) return "";
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const fromCampaign = (c) => ({
  id: c._id,
  name: c.name,
  subject: c.subject,
  preheader: c.preheader || "",
  html: c.html,
  templateKey: c.templateKey || "",
  replyTo: c.replyTo || "",
  content: { ...EMPTY_CONTENT, ...c.content, featuredBookIds: (c.content?.featuredBookIds || []).map(String) },
  audience: { ...EMPTY_AUDIENCE, ...c.audience, manualEmails: [].concat(c.audience?.manualEmails || []).join("\n"), excludeEmails: [].concat(c.audience?.excludeEmails || []).join("\n") },
  scheduledAt: toLocalInput(c.scheduledAt),
});

const blank = () => ({
  id: null,
  name: "",
  subject: "",
  preheader: "",
  html: "",
  templateKey: "",
  replyTo: "",
  content: { ...EMPTY_CONTENT },
  audience: { ...EMPTY_AUDIENCE },
  scheduledAt: "",
});

export default function CampaignBuilder({ meta, campaigns, initial, onClose, onSaved }) {
  const [form, setForm] = useState(() => (initial ? fromCampaign(initial) : blank()));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testing, setTesting] = useState(false);
  const [rendered, setRendered] = useState({ subject: "", html: "" });
  const [audienceTotal, setAudienceTotal] = useState(null);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const setContent = (patch) => setForm((f) => ({ ...f, content: { ...f.content, ...patch } }));

  const allTemplates = useMemo(
    () => [
      ...meta.builtinTemplates.map((t) => ({ ...t, id: `builtin:${t.key}`, builtin: true })),
      ...meta.templates.map((t) => ({ ...t, id: `saved:${t._id}`, builtin: false })),
    ],
    [meta]
  );

  const pickTemplate = (t) => {
    set({
      html: t.html,
      subject: form.subject || t.subject || "",
      templateKey: t.id,
      name: form.name || t.name,
    });
    if (t.defaults) {
      setContent({
        headline: form.content.headline || t.defaults.headline || "",
        body: form.content.body || t.defaults.body || "",
        ctaText: form.content.ctaText || t.defaults.ctaText || "",
        ctaUrl: form.content.ctaUrl || t.defaults.ctaUrl || "",
        couponCode: form.content.couponCode || t.defaults.couponCode || "",
      });
      if (!form.preheader && t.defaults.preheader) set({ preheader: t.defaults.preheader });
    }
  };

  // live preview of the real rendering (coupon + products + placeholders)
  const previewKey = useDebounced(
    JSON.stringify({ s: form.subject, p: form.preheader, h: form.html, c: form.content }),
    600
  );
  useEffect(() => {
    if (step !== 1 && step !== 2) return;
    const { s, p, h, c } = JSON.parse(previewKey);
    if (!h) {
      setRendered({ subject: s, html: "" });
      return;
    }
    let cancelled = false;
    api
      .post("/render", { subject: s, preheader: p, html: h, content: c })
      .then(({ data }) => !cancelled && setRendered({ subject: data.subject, html: data.html }))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [previewKey, step]);

  // audience size for the review step
  useEffect(() => {
    if (step !== 2) return;
    api
      .post("/audience/preview", { audience: cleanAudience(form.audience) })
      .then(({ data }) => setAudienceTotal(data.preview.total))
      .catch(() => setAudienceTotal(null));
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const body = () => ({
    name: form.name.trim(),
    subject: form.subject.trim(),
    preheader: form.preheader,
    html: form.html,
    templateKey: form.templateKey,
    replyTo: form.replyTo.trim(),
    content: form.content,
    audience: cleanAudience(form.audience),
    scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
  });

  const problems = useMemo(() => {
    const list = [];
    if (!form.name.trim()) list.push("Give the campaign a name.");
    if (!form.subject.trim()) list.push("Write an email subject.");
    if (!form.html.trim()) list.push("Choose a template or write the email.");
    if (form.content.couponCode && !form.html.includes("{{{coupon}}}") && !form.html.includes("{{couponCode}}"))
      list.push("A coupon is set but the template has no {{{coupon}}} block, so it will not appear.");
    return list;
  }, [form]);

  const hard = problems.filter((p) => !p.startsWith("A coupon"));

  const save = async () => {
    if (hard.length) return toast.error(hard[0]);
    setSaving(true);
    try {
      const { data } = form.id ? await api.put(`/${form.id}`, body()) : await api.post("/", body());
      set({ id: data.campaign._id });
      toast.success("Draft saved");
      return data.campaign;
    } catch (e) {
      toast.error(errMsg(e));
      return null;
    } finally {
      setSaving(false);
    }
  };

  const sendTest = async () => {
    const saved = await save();
    if (!saved) return;
    setTesting(true);
    try {
      const { data } = await api.post(`/${saved._id}/test`, { to: testTo });
      toast.success(`${data.message} (${data.to})`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setTesting(false);
    }
  };

  const launch = async () => {
    const saved = await save();
    if (!saved) return;
    setSending(true);
    try {
      const { data } = await api.post(`/${saved._id}/send`, {
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      });
      toast.success(data.message);
      setConfirm(false);
      onSaved(data.campaign);
    } catch (e) {
      toast.error(errMsg(e));
      setConfirm(false);
    } finally {
      setSending(false);
    }
  };

  const next = () => {
    if (step === 1 && hard.length) return toast.error(hard[0]);
    setStep((s) => Math.min(2, s + 1));
  };

  const queueReady = meta.queue?.configured && meta.queue?.reachable;
  const scheduled = form.scheduledAt && new Date(form.scheduledAt).getTime() > Date.now() + 60000;

  return (
    <div>
      {/* header */}
      <div className="rounded-2xl border border-[#f0ded0] bg-white p-4 shadow-sm dk:border-[#443127] dk:bg-[#241b15] sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back
            </Button>
            <div className="min-w-0">
              <h2 className={cx("truncate text-lg font-extrabold", TITLE)}>{form.name || (form.id ? "Edit campaign" : "New campaign")}</h2>
              <p className={cx("text-xs", MUTED)}>{form.id ? "Draft saved" : "Not saved yet"}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" loading={saving} onClick={save}>
            <Save className="h-4 w-4" aria-hidden /> Save draft
          </Button>
        </div>
        <div className="mt-5">
          <Stepper
            steps={STEPS}
            current={step}
            onGo={(i) => (i <= step || !hard.length ? setStep(i) : toast.error(hard[0]))}
          />
        </div>
      </div>

      <div className="mt-6">
        {/* STEP 1 */}
        {step === 0 && <AudienceBuilder value={form.audience} onChange={(audience) => set({ audience })} meta={meta} campaigns={campaigns} />}

        {/* STEP 2 */}
        {step === 1 && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-5">
              <Panel icon={LayoutTemplate} title="Choose a template" subtitle="You can change every word afterwards">
                <div className="grid gap-3 sm:grid-cols-2">
                  {allTemplates.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => pickTemplate(t)}
                      className={cx(
                        "group rounded-2xl border p-2.5 text-left transition",
                        form.templateKey === t.id
                          ? "border-orange-500 bg-orange-50 ring-2 ring-orange-500 dk:bg-orange-500/10"
                          : "border-stone-200 hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md dk:border-[#443127]"
                      )}
                    >
                      <Thumb template={t} height={150} />
                      <div className="mt-2 flex items-center justify-between gap-2 px-1">
                        <span className={cx("truncate text-sm font-bold", TITLE)}>{t.name}</span>
                        {form.templateKey === t.id ? <Badge tone="brand">Selected</Badge> : !t.builtin ? <Badge tone="slate">saved</Badge> : null}
                      </div>
                      <p className={cx("line-clamp-2 px-1 pb-1 text-xs", MUTED)}>{t.description || t.category}</p>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel icon={PenLine} title="Write your email" subtitle="Subject, headline and message">
               <div className="space-y-4">
                <Field label="Campaign name" hint="Only you see this">
                  <input value={form.name} onChange={(e) => set({ name: e.target.value })} className={inputClass(false)} maxLength={140} />
                </Field>
                <Field label="Subject line" hint="Placeholders like {{firstName}} work here">
                  <input value={form.subject} onChange={(e) => set({ subject: e.target.value })} className={inputClass(false)} maxLength={300} />
                </Field>
                <Field label="Preview text" hint="Shown after the subject in most inboxes">
                  <input value={form.preheader} onChange={(e) => set({ preheader: e.target.value })} className={inputClass(false)} maxLength={200} />
                </Field>
                <Field label="Headline">
                  <input value={form.content.headline} onChange={(e) => setContent({ headline: e.target.value })} className={inputClass(false)} maxLength={200} />
                </Field>
                <Field label="Message" hint="Blank line = new paragraph">
                  <textarea rows={6} value={form.content.body} onChange={(e) => setContent({ body: e.target.value })} className={inputClass(false)} maxLength={10000} />
                </Field>
               </div>
              </Panel>

              <Panel icon={Ticket} title="Coupon, button and books" subtitle="Turn the email into an offer">
               <div className="space-y-4">
                <Field label="Coupon" hint="Pick one of your active coupons, or type a code">
                  <div className="flex gap-2">
                    <select
                      value={meta.coupons.some((c) => c.code === form.content.couponCode) ? form.content.couponCode : ""}
                      onChange={(e) => setContent({ couponCode: e.target.value })}
                      className={cx(inputClass(false), "sm:max-w-xs")}
                    >
                      <option value="">No coupon</option>
                      {meta.coupons.map((c) => (
                        <option key={c._id} value={c.code}>
                          {c.code} — {c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `${money(c.discountValue)} off`}
                        </option>
                      ))}
                    </select>
                    <input
                      value={form.content.couponCode}
                      onChange={(e) => setContent({ couponCode: e.target.value.toUpperCase() })}
                      placeholder="or type a code"
                      className={cx(inputClass(false), "font-mono")}
                      maxLength={40}
                    />
                  </div>
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Button text">
                    <input value={form.content.ctaText} onChange={(e) => setContent({ ctaText: e.target.value })} className={inputClass(false)} maxLength={60} />
                  </Field>
                  <Field label="Button link" hint="Blank = the books page">
                    <input value={form.content.ctaUrl} onChange={(e) => setContent({ ctaUrl: e.target.value })} placeholder="https://www.targettrek.in/books" className={inputClass(false)} />
                  </Field>
                </div>
                <Field label="Featured books (max 8)" hint="Shown as product cards with price and discount">
                  <div className="flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                    {meta.books.filter((b) => b.isActive).map((b) => (
                      <ChipToggle
                        key={b._id}
                        selected={form.content.featuredBookIds.includes(b._id)}
                        onClick={() => {
                          const ids = form.content.featuredBookIds;
                          if (ids.includes(b._id)) setContent({ featuredBookIds: ids.filter((x) => x !== b._id) });
                          else if (ids.length >= 8) toast.error("Up to 8 featured books.");
                          else setContent({ featuredBookIds: [...ids, b._id] });
                        }}
                      >
                        {b.title}
                      </ChipToggle>
                    ))}
                  </div>
                </Field>
                <Field label="Reply-to address" hint="Optional: where replies go">
                  <input type="email" value={form.replyTo} onChange={(e) => set({ replyTo: e.target.value })} className={inputClass(false)} />
                </Field>
               </div>
              </Panel>

              <Panel icon={Code2} title="Advanced" subtitle="For designers">
                <Toggle checked={showCode} onChange={setShowCode} label="Edit the HTML directly" description="For designers. Placeholders are listed below." />
                {showCode && (
                  <div className="mt-3">
                    <textarea
                      rows={14}
                      value={form.html}
                      onChange={(e) => set({ html: e.target.value, templateKey: "" })}
                      className={cx(inputClass(false), "font-mono text-xs")}
                      spellCheck={false}
                    />
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {PLACEHOLDERS.map(([code, hint]) => (
                        <button
                          key={code}
                          type="button"
                          title={hint}
                          onClick={() => navigator.clipboard?.writeText(code).then(() => toast.success(`${code} copied`))}
                          className="rounded-md bg-stone-100 px-2 py-1 font-mono text-[11px] text-stone-700 dk:bg-[#2c211b] dk:text-[#ead9cc]"
                        >
                          {code}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Panel>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className={cx("mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide", MUTED)}>
                <Sparkles className="h-4 w-4 text-orange-500" aria-hidden /> Live preview · sample customer
              </p>
              <MailFrame subject={rendered.subject || form.subject} preheader={form.preheader} html={rendered.html} height={600} />
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 2 && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-5">
              <Panel icon={ShieldCheck} title="Review" subtitle="Check everything before it goes out">
                <dl className="mt-3 space-y-2 text-sm">
                  {[
                    ["Name", form.name],
                    ["Subject", rendered.subject || form.subject],
                    ["Recipients", audienceTotal == null ? "…" : audienceTotal.toLocaleString("en-IN")],
                    ["Coupon", form.content.couponCode || "—"],
                    ["Featured books", form.content.featuredBookIds.length || "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className={MUTED}>{k}</dt>
                      <dd className={cx("truncate text-right font-semibold", TITLE)}>{v}</dd>
                    </div>
                  ))}
                </dl>
                {problems.map((p) => (
                  <p key={p} className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dk:bg-amber-500/10 dk:text-amber-200">
                    {p}
                  </p>
                ))}
              </Panel>

              <Panel icon={FlaskConical} title="Send a test first">
                <p className={cx("mt-1 text-xs", MUTED)}>Sends one copy through the same queue to this address.</p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="you@example.com" className={inputClass(false)} />
                  <Button variant="outline" loading={testing} disabled={!testTo || !queueReady} onClick={sendTest}>
                    <Send className="h-4 w-4" aria-hidden /> Send test
                  </Button>
                </div>
              </Panel>

              <Panel icon={BadgePercent} title="When should it go?">
                <Field label="Schedule (optional)" hint="Leave empty to send right away">
                  <input type="datetime-local" value={form.scheduledAt} onChange={(e) => set({ scheduledAt: e.target.value })} className={cx(inputClass(false), "sm:max-w-xs")} />
                </Field>
                {!queueReady && (
                  <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700 dk:bg-rose-500/10 dk:text-rose-300">
                    The email queue is not ready ({meta.queue?.error || (meta.queue?.missing || []).join(", ") || "not configured"}). Check the “Queue & DLQ” tab. You can still save the draft.
                  </p>
                )}
                <Button size="lg" className="mt-4 w-full" disabled={Boolean(hard.length) || !queueReady || !audienceTotal} onClick={() => setConfirm(true)}>
                  <Send className="h-5 w-5" aria-hidden /> {scheduled ? "Schedule campaign" : "Send campaign"}
                </Button>
              </Panel>
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <MailFrame subject={rendered.subject || form.subject} preheader={form.preheader} html={rendered.html} height={640} />
            </div>
          </div>
        )}
      </div>

      {/* footer nav */}
      <div className="sticky bottom-3 z-10 mt-6 flex justify-between rounded-2xl border border-[#f0ded0] bg-white/90 p-3 shadow-lg backdrop-blur dk:border-[#443127] dk:bg-[#241b15]/90">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back
        </Button>
        {step < 2 && (
          <Button onClick={next}>
            Next <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>

      <Modal
        open={confirm}
        onClose={() => !sending && setConfirm(false)}
        title={scheduled ? "Schedule this campaign?" : "Send this campaign?"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" disabled={sending} onClick={() => setConfirm(false)}>
              Cancel
            </Button>
            <Button loading={sending} onClick={launch}>
              <Send className="h-4 w-4" aria-hidden /> {scheduled ? "Schedule" : "Send now"}
            </Button>
          </div>
        }
      >
        <p className={cx("text-sm", TITLE)}>
          <b>{audienceTotal?.toLocaleString("en-IN")}</b> people will receive “{rendered.subject || form.subject}”
          {scheduled ? ` on ${new Date(form.scheduledAt).toLocaleString("en-IN")}` : " as soon as the queue picks it up"}.
        </p>
        <p className={cx("mt-2 text-xs", MUTED)}>The recipient list is fixed at the moment of sending. You can pause or cancel afterwards.</p>
      </Modal>
    </div>
  );
}
