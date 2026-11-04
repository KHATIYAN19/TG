import { useState } from "react";
import toast from "react-hot-toast";
import { Copy, Eye, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge, Button, EmptyState, Field, Modal, cx, inputClass } from "../../arena/ui";
import { MailFrame, Thumb } from "./ui";
import { EmailFrame, MUTED, TITLE, api, errMsg, useDebounced } from "./shared";
import { useEffect } from "react";

const BLANK = { _id: null, name: "", description: "", category: "custom", subject: "", html: "" };

function Editor({ initial, onClose, onSaved }) {
  const [t, setT] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [html, setHtml] = useState("");
  const key = useDebounced(t.html, 500);

  useEffect(() => {
    if (!key) return setHtml("");
    let off = false;
    api.post("/render", { subject: t.subject, html: key, content: { headline: "Your headline", body: "Your message goes here.\n\nSecond paragraph.", couponCode: "SAVE20", ctaText: "Shop now" } })
      .then(({ data }) => !off && setHtml(data.html))
      .catch(() => {});
    return () => { off = true; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!t.name.trim() || !t.html.trim()) return toast.error("A name and the HTML are required.");
    setSaving(true);
    try {
      const body = { name: t.name, description: t.description, category: t.category, subject: t.subject, html: t.html };
      if (t._id) await api.put(`/templates/${t._id}`, body);
      else await api.post("/templates", body);
      toast.success("Template saved");
      onSaved();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onClose} wide title={t._id ? "Edit template" : "New template"}
      footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button loading={saving} onClick={save}>Save template</Button></div>}>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <Field label="Name"><input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} className={inputClass(false)} maxLength={120} /></Field>
          <Field label="Description"><input value={t.description} onChange={(e) => setT({ ...t, description: e.target.value })} className={inputClass(false)} maxLength={300} /></Field>
          <Field label="Default subject"><input value={t.subject} onChange={(e) => setT({ ...t, subject: e.target.value })} className={inputClass(false)} maxLength={300} /></Field>
          <Field label="HTML" hint="Use {{firstName}}, {{{message}}}, {{{coupon}}}, {{{button}}}, {{{products}}}, {{unsubscribeUrl}}">
            <textarea rows={16} value={t.html} onChange={(e) => setT({ ...t, html: e.target.value })} className={cx(inputClass(false), "font-mono text-xs")} spellCheck={false} />
          </Field>
        </div>
        <EmailFrame html={html} height={560} />
      </div>
    </Modal>
  );
}

export default function TemplatesTab({ meta, reloadMeta }) {
  const [editing, setEditing] = useState(null);
  const [previewing, setPreviewing] = useState(null);
  const [html, setHtml] = useState("");

  const openPreview = (t) => {
    setPreviewing(t);
    setHtml("");
    api.post("/render", { subject: t.subject || "", html: t.html, content: { ...(t.defaults || {}), couponCode: "SAVE20" } })
      .then(({ data }) => setHtml(data.html))
      .catch((e) => toast.error(errMsg(e)));
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete template “${t.name}”?`)) return;
    try {
      await api.delete(`/templates/${t._id}`);
      toast.success("Template deleted");
      reloadMeta();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  const TemplateCard = ({ t, builtin }) => (
    <div className="flex flex-col rounded-2xl border border-[#f0ded0] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dk:border-[#443127] dk:bg-[#241b15]">
      <button type="button" onClick={() => openPreview(t)} aria-label={`Preview ${t.name}`} className="text-left">
        <Thumb template={t} height={190} />
      </button>
      <div className="mt-3 flex items-start justify-between gap-2 px-1">
        <h4 className={cx("text-sm font-bold", TITLE)}>{t.name}</h4>
        <Badge tone={builtin ? "brand" : "slate"}>{builtin ? "built-in" : "saved"}</Badge>
      </div>
      <p className={cx("mt-1 flex-1 px-1 text-xs", MUTED)}>{t.description || t.category}</p>
      <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
        <Button size="sm" variant="outline" onClick={() => openPreview(t)}><Eye className="h-4 w-4" aria-hidden /> Preview</Button>
        {builtin ? (
          <Button size="sm" variant="soft" onClick={() => setEditing({ ...BLANK, name: `${t.name} (copy)`, description: t.description, category: t.category, subject: t.subject, html: t.html })}>
            <Copy className="h-4 w-4" aria-hidden /> Save a copy
          </Button>
        ) : (
          <>
            <Button size="sm" variant="soft" onClick={() => setEditing(t)}><Pencil className="h-4 w-4" aria-hidden /> Edit</Button>
            <Button size="sm" variant="ghost" aria-label="Delete template" onClick={() => remove(t)}><Trash2 className="h-4 w-4 text-rose-600" aria-hidden /></Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className={cx("text-sm", MUTED)}>Templates are the layout of your email. Pick one in the campaign builder, or keep your own versions here.</p>
        <Button onClick={() => setEditing({ ...BLANK })}><Plus className="h-4 w-4" aria-hidden /> New template</Button>
      </div>

      <h3 className={cx("mt-6 text-base font-extrabold", TITLE)}>Your templates</h3>
      {meta.templates.length ? (
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{meta.templates.map((t) => <TemplateCard key={t._id} t={t} />)}</div>
      ) : (
        <div className="mt-2"><EmptyState title="No saved templates">Use “Save a copy” on a built-in template to start customising.</EmptyState></div>
      )}

      <h3 className={cx("mt-8 text-base font-extrabold", TITLE)}>Built-in templates</h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{meta.builtinTemplates.map((t) => <TemplateCard key={t.key} t={t} builtin />)}</div>

      {editing && <Editor initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reloadMeta(); }} />}
      <Modal open={Boolean(previewing)} onClose={() => setPreviewing(null)} wide title={previewing?.name || "Preview"}>
        <MailFrame subject={previewing?.subject} html={html} height={600} />
      </Modal>
    </div>
  );
}
