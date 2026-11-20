import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowsClockwise, Check, FilePdf, LockKey, PencilSimple, Plus, Star, Trash, UploadSimple, Vault, X } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { uploadToVault, vaultRemove, vaultUpdate } from "./api";
import { useApp } from "./appData";
import { PageHead, ago, mb, n0, plural } from "./parts";
import { Btn, Modal, Skeleton, cx } from "./ui";

/*
  THE RESUME VAULT
  The PDFs a member keeps on file. A new review starts with the default one already picked; it can be replaced, removed, or swapped
  for another file in the vault. The server answers every change with the new list, so the page never fetches it again.
*/

const MAX_MB = 10;
const pickable = (f) => {
  if (!/\.pdf$/i.test(f.name)) { toast.error("Please choose a PDF file."); return false; }
  if (f.size > MAX_MB * 1024 * 1024) { toast.error(`That file is over ${MAX_MB} MB.`); return false; }
  return true;
};

/* one upload at a time, with progress; the vault list in the app updates when it lands */
export function useVaultUpload() {
  const { setVault } = useApp();
  const [state, setState] = useState(null); // { name, progress }
  const upload = async (file, opts = {}) => {
    if (!pickable(file)) return null;
    setState({ name: file.name, progress: 0 });
    try {
      const out = await uploadToVault(file, opts, (p) => setState({ name: file.name, progress: p }));
      setVault(out);
      return out.file;
    } catch (e) { toast.error(errMsg(e)); return null; } finally { setState(null); }
  };
  return { upload, uploading: state };
}

/* a hidden file input, opened by a button */
function useFilePicker(onFile) {
  const ref = useRef(null);
  const input = <input ref={ref} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />;
  return { open: () => ref.current?.click(), input };
}

export function DropArea({ onFile, title = "Drop your resume PDF here", compact = false }) {
  const [over, setOver] = useState(false);
  const { open, input } = useFilePicker(onFile);
  return (
    <div className={cx("rs-drop", over && "over")} role="button" tabIndex={0} aria-label="Add a resume PDF"
      style={compact ? { padding: "18px 14px" } : undefined}
      onClick={open} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}>
      {input}
      <span className="rs-ico lg" aria-hidden><UploadSimple size={24} weight="bold" /></span>
      <b>{over ? "Let go to add it" : title}</b>
      <p>or <span className="rs-link" style={{ display: "inline" }}>browse your files</span></p>
      {!compact && <div className="rs-drop-tags"><span>PDF only</span><span>Up to {MAX_MB} MB</span><span>Text based, not a scan</span></div>}
    </div>
  );
}

export function UploadProgress({ state }) {
  if (!state) return null;
  const p = Math.round(state.progress * 100);
  return (
    <div className="rs-progress" role="status" aria-live="polite">
      <div className="rs-progress-top"><FilePdf size={22} weight="duotone" aria-hidden /><b className="rs-ellipsis">{state.name}</b><span className="rs-num rs-subtle">{p}%</span></div>
      <div className="rv-bar"><i style={{ width: `${p}%` }} /></div>
      <p className="rs-xs rs-subtle">{p >= 100 ? "Checking the file…" : "Adding to your vault…"}</p>
    </div>
  );
}

/* the builder's upload box (same look, its own upload flow) */
export function Dropzone({ file, progress, uploading, onPick, onClear }) {
  if (uploading && file) return <UploadProgress state={{ name: file.filename, progress }} />;
  if (file) {
    return (
      <div className="rs-file is-picked">
        <span className="rs-ico" aria-hidden><FilePdf size={22} weight="duotone" /></span>
        <div className="rs-file-main"><span className="rs-file-name"><b>{file.filename}</b></span><span className="rs-file-meta"><span style={{ color: "var(--rv-ok)", display: "inline-flex", gap: 4, alignItems: "center" }}><Check size={12} weight="bold" aria-hidden />Uploaded</span>{file.size ? <span>{mb(file.size)}</span> : null}</span></div>
        <div className="rs-file-actions"><Btn variant="ghost" size="sm" onClick={onClear}><Trash size={15} aria-hidden />Remove</Btn></div>
      </div>
    );
  }
  return <DropArea onFile={onPick} />;
}

/* ---------------------------------------------------------------- remove: just for this review, or from the vault */
function RemoveDialog({ file, forReview, onClose, onDone }) {
  const { setVault } = useApp();
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    setBusy(true);
    try { setVault(await vaultRemove(file.id)); toast.success("Removed from your vault."); onDone?.("deleted"); onClose(); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  return (
    <Modal title={`Remove “${file.label || file.filename}”?`} onClose={onClose}>
      <p className="rs-sm rs-muted">{forReview ? "You can stop using it for this review and keep it in your vault, or delete it from the vault altogether." : "It leaves your vault. Reviews you already sent with it keep their copy, so nothing you've received is lost."}</p>
      <div style={{ display: "grid", gap: 8, marginTop: 18 }}>
        {forReview && <Btn variant="ghost" block onClick={() => { onDone?.("unpicked"); onClose(); }}>Don't use it for this review</Btn>}
        <Btn variant="danger" block loading={busy} onClick={remove}><Trash size={16} aria-hidden />Delete from my vault</Btn>
        <Btn variant="ghost" block onClick={onClose}>Cancel</Btn>
      </div>
    </Modal>
  );
}

function RenameField({ file, onDone }) {
  const { setVault } = useApp();
  const [v, setV] = useState(file.label || "");
  const save = async () => {
    try { setVault(await vaultUpdate(file.id, { label: v })); onDone(); } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <form className="rs-row nowrap" onSubmit={(e) => { e.preventDefault(); save(); }}>
      <input className="rs-file-label" value={v} onChange={(e) => setV(e.target.value)} maxLength={60} placeholder="e.g. Backend version" aria-label="Name for this resume" autoFocus />
      <button type="submit" className="rv-btn rv-btn-ghost rv-btn-sm" aria-label="Save name"><Check size={15} weight="bold" aria-hidden /></button>
      <button type="button" className="rv-btn rv-btn-ghost rv-btn-sm" aria-label="Cancel" onClick={onDone}><X size={15} weight="bold" aria-hidden /></button>
    </form>
  );
}

/* ---------------------------------------------------------------- one file in the vault */
function FileRow({ f }) {
  const { setVault } = useApp();
  const { upload, uploading } = useVaultUpload();
  const [renaming, setRenaming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [busy, setBusy] = useState(false);
  const { open, input } = useFilePicker(async (file) => { if (await upload(file, { replaceId: f.id })) toast.success("Replaced. Your next review uses the new file."); });
  const makeDefault = async () => {
    setBusy(true);
    try { setVault(await vaultUpdate(f.id, { makeDefault: true })); toast.success("New reviews start with this one."); } catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
  };
  if (uploading) return <li><UploadProgress state={uploading} /></li>;
  return (
    <li className={cx("rs-file", f.isDefault && "is-default")}>
      {input}
      <span className={cx("rs-ico", !f.isDefault && "mute")} aria-hidden><FilePdf size={22} weight="duotone" /></span>
      <div className="rs-file-main">
        {renaming ? <RenameField file={f} onDone={() => setRenaming(false)} /> : (
          <span className="rs-file-name">
            <b title={f.filename}>{f.label || f.filename}</b>
            {f.isDefault && <span className="rs-chip brand"><Star size={12} weight="fill" aria-hidden /><span>Default</span></span>}
          </span>
        )}
        <span className="rs-file-meta">
          {f.label && <span className="rs-ellipsis" style={{ maxWidth: 220 }}>{f.filename}</span>}
          {f.size > 0 && <span>{mb(f.size)}</span>}
          <span>Added {ago(f.createdAt)}</span>
          <span>{f.uses ? `Used in ${plural(f.uses, "review")}` : "Not used yet"}</span>
        </span>
      </div>
      <div className="rs-file-actions">
        {!f.isDefault && <Btn variant="ghost" size="sm" loading={busy} onClick={makeDefault}><Star size={15} aria-hidden />Make default</Btn>}
        <Btn variant="ghost" size="sm" onClick={open}><ArrowsClockwise size={15} aria-hidden />Replace</Btn>
        <Btn variant="ghost" size="sm" className="rs-icon-btn" onClick={() => setRenaming(true)} aria-label="Rename"><PencilSimple size={15} aria-hidden /><span className="rs-sr">Rename</span></Btn>
        <Btn variant="danger" size="sm" className="rs-icon-btn" onClick={() => setRemoving(true)} aria-label="Remove"><Trash size={15} aria-hidden /><span className="rs-sr">Remove</span></Btn>
      </div>
      {removing && <RemoveDialog file={f} onClose={() => setRemoving(false)} />}
    </li>
  );
}

/* ---------------------------------------------------------------- the Vault page */
export function VaultPage() {
  const { data, refresh } = useApp();
  const { upload, uploading } = useVaultUpload();
  const files = data?.vault?.files;
  const max = data?.vault?.max || 12;
  const full = files && files.length >= max;
  const add = async (file) => { if (await upload(file)) { toast.success("Added to your vault."); refresh().catch(() => {}); } };
  return (
    <>
      <PageHead
        eyebrow={<><Vault size={14} weight="bold" aria-hidden />Resume Vault</>}
        title="Your resumes on file"
        sub="Keep every version here. A new review starts with your default resume already picked, and you can replace or swap it any time."
        actions={files?.length > 0 && <Btn as={Link} to="/resume-review/app/new"><Plus size={16} weight="bold" aria-hidden />Start a review</Btn>}
      />
      <section className="rs-card">
        <div className="rs-sec-head">
          <div><h2 className="rs-h2">Files</h2><p>{files ? `${n0(files.length)} of ${max} slots used` : "Loading…"}</p></div>
          <span className="rs-row rs-xs rs-subtle"><LockKey size={14} weight="bold" aria-hidden />Private: only you, the AI and your reviewer</span>
        </div>
        {!files && <div className="rs-stack sm"><Skeleton h={76} style={{ borderRadius: 16 }} /><Skeleton h={76} style={{ borderRadius: 16 }} /></div>}
        {files?.length > 0 && <ul className="rs-files">{files.map((f) => <FileRow key={f.id} f={f} />)}</ul>}
        {files && (
          <div style={{ marginTop: files.length ? 14 : 0 }}>
            {uploading ? <UploadProgress state={uploading} />
              : full ? <p className="rs-sm rs-muted">Your vault is full. Remove a file to add another.</p>
              : <DropArea onFile={add} title={files.length ? "Add another version" : "Add your first resume"} compact={files.length > 0} />}
          </div>
        )}
      </section>
    </>
  );
}

/* ---------------------------------------------------------------- picking the file for one review */
export function VaultPicker({ value, onChange, error }) {
  const { data } = useApp();
  const { upload, uploading } = useVaultUpload();
  const [removing, setRemoving] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const files = data?.vault?.files || [];
  const picked = files.find((f) => f.id === value) || null;
  const others = files.filter((f) => f.id !== value);
  const replace = useFilePicker(async (file) => { const f = await upload(file, { replaceId: picked.id }); if (f) { onChange(f.id); toast.success("Replaced. This review uses the new file."); } });
  const addNew = async (file) => { const f = await upload(file, { makeDefault: !files.length }); if (f) { onChange(f.id); toast.success("Added to your vault and picked for this review."); } };
  const shown = showAll ? others : others.slice(0, 3);

  if (!data) return <Skeleton h={120} style={{ borderRadius: 16 }} />;
  return (
    <div className="rs-stack sm" data-first-error={error ? true : undefined}>
      {uploading ? <UploadProgress state={uploading} /> : picked ? (
        <div className="rs-picked">
          {replace.input}
          <div className="rs-picked-top">
            <span className="rs-ico" aria-hidden><FilePdf size={22} weight="duotone" /></span>
            <div>
              <span className="rs-xs rs-subtle" style={{ fontWeight: 700 }}>Using for this review</span>
              <b title={picked.filename}>{picked.label || picked.filename}</b>
              <span className="rs-xs rs-subtle">{[picked.label ? picked.filename : "", mb(picked.size), `added ${ago(picked.createdAt)}`].filter(Boolean).join(" · ")}</span>
            </div>
          </div>
          <div className="rs-picked-acts">
            <Btn variant="ghost" size="sm" onClick={replace.open}><ArrowsClockwise size={15} aria-hidden />Replace</Btn>
            <Btn variant="ghost" size="sm" onClick={() => setRemoving(picked)}><Trash size={15} aria-hidden />Remove</Btn>
          </div>
        </div>
      ) : <DropArea onFile={addNew} title={files.length ? "Add a new resume" : "Add your resume to start"} />}

      {!uploading && others.length > 0 && (
        <div className="rs-stack sm" role="radiogroup" aria-label="Other resumes in your vault">
          <p className="rs-k" style={{ marginTop: 4 }}>{picked ? "Or use another from your vault" : "Or pick one from your vault"}</p>
          {shown.map((f) => (
            <div key={f.id} role="radio" tabIndex={0} aria-checked={false} className="rs-choice" onClick={() => onChange(f.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onChange(f.id); } }}>
              <span className="rs-radio" aria-hidden />
              <span><b title={f.filename}>{f.label || f.filename}</b><span className="rs-xs rs-subtle">{[mb(f.size), `added ${ago(f.createdAt)}`, f.isDefault ? "default" : ""].filter(Boolean).join(" · ")}</span></span>
              <FilePdf size={18} weight="duotone" className="rs-subtle" aria-hidden />
            </div>
          ))}
          {others.length > 3 && <button type="button" className="rs-link" onClick={() => setShowAll((v) => !v)}>{showAll ? "Show fewer" : `Show all ${others.length}`}</button>}
          {picked && <DropArea onFile={addNew} title="Or add a new version" compact />}
        </div>
      )}
      {!uploading && picked && others.length === 0 && <button type="button" className="rs-link" onClick={() => onChange("")}><Plus size={14} weight="bold" aria-hidden />Use a different file</button>}
      {error && <p role="alert" className="rv-err">{error}</p>}
      {removing && <RemoveDialog file={removing} forReview onClose={() => setRemoving(null)} onDone={() => onChange("")} />}
    </div>
  );
}
