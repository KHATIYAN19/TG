import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Cloud, FileText, Plus, Trash2, Undo2 } from "lucide-react";

import { bookStorageHttp } from "../arena/api";

/*
  Shared by the "create book" and "edit book" forms:
    - choose where the PDFs are stored (AWS S3 or Cloudinary)
    - add any number of PDFs
    - (edit only) see the PDFs the book already has and remove some
*/

export const MAX_BOOK_FILES = 20;
const MAX_BYTES = 100 * 1024 * 1024;

const STORAGE_LABEL = { s3: "AWS S3", cloudinary: "Cloudinary" };
export const storageLabel = (value) => STORAGE_LABEL[value] || value || "Cloudinary";

const isPdf = (file) =>
  file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

const sizeLabel = (bytes) =>
  bytes ? `${(bytes / (1024 * 1024)).toFixed(bytes > 10 * 1024 * 1024 ? 0 : 1)} MB` : "";

/** Default storage + which storages the server can use. */
export function useBookStorage() {
  const [state, setState] = useState({ provider: "cloudinary", providers: null, loading: true });

  useEffect(() => {
    let cancelled = false;

    bookStorageHttp
      .get("/")
      .then(({ data }) => {
        if (!cancelled) setState({ provider: data.data.provider, providers: data.data.providers, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState((prev) => ({ ...prev, loading: false }));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export default function BookFilesField({
  label = "Product PDFs",
  required = false,
  files,
  onFilesChange,
  provider,
  onProviderChange,
  providers,
  existing = [],
  removedIds = [],
  onToggleRemove,
  error = "",
  labelClass = "mb-2 block text-sm font-bold text-slate-800",
}) {
  const inputRef = useRef(null);

  const addFiles = (event) => {
    const picked = Array.from(event.target.files || []);

    event.target.value = "";

    if (!picked.length) return;

    const next = [...files];

    for (const file of picked) {
      if (!isPdf(file)) {
        toast.error(`${file.name}: only PDF files are allowed.`);
        continue;
      }

      if (file.size > MAX_BYTES) {
        toast.error(`${file.name}: must be below 100 MB.`);
        continue;
      }

      if (next.some((f) => f.name === file.name && f.size === file.size)) continue;

      if (existing.length - removedIds.length + next.length >= MAX_BOOK_FILES) {
        toast.error(`A book can have at most ${MAX_BOOK_FILES} PDFs.`);
        break;
      }

      next.push(file);
    }

    onFilesChange(next);
  };

  const providerOptions = ["s3", "cloudinary"];

  return (
    <div>
      <label className={labelClass}>
        {label}
        {required ? " *" : ""}
      </label>

      {/* WHERE TO STORE */}
      <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3">
        <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Cloud size={14} /> Upload new PDFs to
        </p>

        <div className="flex flex-wrap gap-2">
          {providerOptions.map((key) => {
            const configured = providers ? providers[key]?.configured : true;

            return (
              <label
                key={key}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${
                  provider === key
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 text-slate-700"
                } ${configured ? "" : "cursor-not-allowed opacity-50"}`}
              >
                <input
                  type="radio"
                  name="book-storage-provider"
                  className="h-3.5 w-3.5"
                  checked={provider === key}
                  disabled={!configured}
                  onChange={() => onProviderChange(key)}
                />
                {storageLabel(key)}
                {!configured && <span className="font-normal">(not set up)</span>}
              </label>
            );
          })}
        </div>

        <p className="mt-2 text-[11px] text-slate-500">
          The default can be changed (and every file moved) in Admin &rarr; Book storage.
        </p>
      </div>

      {/* EXISTING FILES (edit form) */}
      {existing.length > 0 && (
        <ul className="mb-3 space-y-2">
          {existing.map((file) => {
            const removed = removedIds.includes(file.id);

            return (
              <li
                key={file.id}
                className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-xs ${
                  removed ? "border-red-200 bg-red-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <FileText size={16} className="shrink-0 text-red-600" />
                  <span className={`truncate font-bold ${removed ? "text-red-700 line-through" : "text-slate-800"}`}>
                    {file.fileName || "PDF"}
                  </span>
                  <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                    {storageLabel(file.storage)}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => onToggleRemove(file.id)}
                  className={`flex shrink-0 items-center gap-1 font-bold ${removed ? "text-slate-600" : "text-red-600"}`}
                >
                  {removed ? <Undo2 size={13} /> : <Trash2 size={13} />}
                  {removed ? "Keep" : "Remove"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* NEW FILES */}
      {files.length > 0 && (
        <ul className="mb-3 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs"
            >
              <span className="flex min-w-0 items-center gap-2">
                <FileText size={16} className="shrink-0 text-red-600" />
                <span className="truncate font-bold text-slate-800">{file.name}</span>
                <span className="shrink-0 text-slate-500">{sizeLabel(file.size)}</span>
                <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-blue-200">New</span>
              </span>

              <button
                type="button"
                onClick={() => onFilesChange(files.filter((_, i) => i !== index))}
                className="flex shrink-0 items-center gap-1 font-bold text-red-600"
              >
                <Trash2 size={13} /> Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center hover:border-blue-400">
        <Plus size={26} className="text-blue-600" />

        <p className="mt-2 text-sm font-bold text-slate-800">
          {files.length + existing.length > 0 ? "Add more PDFs" : "Choose one or more PDFs"}
        </p>

        <p className="mt-1 text-[11px] text-slate-500">Up to {MAX_BOOK_FILES} files, 100 MB each. Buyers can download all of them.</p>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="application/pdf,.pdf"
          onChange={addFiles}
          className="hidden"
        />
      </label>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
