import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeftRight, Ban, Download, Filter, ListChecks, Search, Upload, Users } from "lucide-react";

import { Badge, Button, ChipToggle, Field, Toggle, cx, inputClass } from "../../arena/ui";
import { Panel } from "./ui";
import { MUTED, TITLE, api, cleanAudience, downloadText, errMsg, extractEmails, money, useDebounced } from "./shared";

const SOURCES = [
  { key: "buyers", label: "Customers who bought", hint: "Paid orders" },
  { key: "users", label: "Registered users", hint: "Signed up on the site" },
  { key: "manual", label: "Pasted / uploaded list", hint: "Your own e-mail list" },
];

/* A searchable checklist of books with buyer counts. */
function BookPicker({ title, hint, books, selected, onChange, tone }) {
  const [q, setQ] = useState("");
  const shown = useMemo(
    () => books.filter((b) => b.title.toLowerCase().includes(q.trim().toLowerCase())),
    [books, q]
  );
  const toggle = (id) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  return (
    <div className="rounded-xl border border-stone-200 p-3 dk:border-[#443127]">
      <div className="flex items-center justify-between gap-2">
        <h4 className={cx("text-sm font-bold", tone === "rose" ? "text-rose-700 dk:text-rose-300" : TITLE)}>{title}</h4>
        {selected.length > 0 && (
          <button type="button" className="text-xs font-semibold text-orange-600" onClick={() => onChange([])}>
            Clear ({selected.length})
          </button>
        )}
      </div>
      <p className={cx("mt-0.5 text-xs", MUTED)}>{hint}</p>
      <div className="relative mt-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search books"
          className={cx(inputClass(false), "pl-9")}
          aria-label={`Search books for: ${title}`}
        />
      </div>
      <ul className="mt-2 max-h-56 space-y-0.5 overflow-y-auto pr-1">
        {shown.map((b) => (
          <li key={b._id}>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-orange-50 dk:hover:bg-orange-500/10">
              <input
                type="checkbox"
                className="h-4 w-4 accent-orange-600"
                checked={selected.includes(b._id)}
                onChange={() => toggle(b._id)}
              />
              <span className={cx("min-w-0 flex-1 truncate", TITLE)}>{b.title}</span>
              <span className={cx("shrink-0 text-xs tabular-nums", MUTED)}>{b.buyers} buyers</span>
            </label>
          </li>
        ))}
        {!shown.length && <li className={cx("px-2 py-3 text-sm", MUTED)}>No books match.</li>}
      </ul>
    </div>
  );
}

function EmailBox({ label, hint, value, onChange }) {
  const file = useRef(null);
  const count = useMemo(() => extractEmails(value).length, [value]);

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return toast.error("File is too large (5 MB max).");
    const found = extractEmails(await f.text());
    if (!found.length) return toast.error("No e-mail addresses found in that file.");
    onChange([...new Set([...extractEmails(value), ...found])].join("\n"));
    toast.success(`${found.length} address(es) added`);
  };

  return (
    <Field label={label} hint={hint}>
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="one@example.com, two@example.com …"
        className={cx(inputClass(false), "font-mono text-xs")}
      />
      <div className="mt-1.5 flex items-center justify-between">
        <span className={cx("text-xs", MUTED)}>{count} address(es)</span>
        <button type="button" className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600" onClick={() => file.current?.click()}>
          <Upload className="h-3.5 w-3.5" aria-hidden /> Upload CSV / TXT
        </button>
        <input ref={file} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={onFile} />
      </div>
    </Field>
  );
}

export default function AudienceBuilder({ value, onChange, meta, campaigns }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const has = (s) => value.sources.includes(s);
  const toggleSource = (s) => {
    const next = has(s) ? value.sources.filter((x) => x !== s) : [...value.sources, s];
    if (next.length) set({ sources: next });
  };

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);

  const payload = useDebounced(JSON.stringify(cleanAudience(value)), 700);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .post("/audience/preview", { audience: JSON.parse(payload) })
      .then(({ data }) => !cancelled && setPreview(data.preview))
      .catch((e) => !cancelled && setError(errMsg(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [payload]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { data } = await api.post("/audience/export", { audience: cleanAudience(value) });
      downloadText(`audience-${new Date().toISOString().slice(0, 10)}.csv`, data.csv);
      toast.success(`${data.count} recipients exported`);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setExporting(false);
    }
  };

  const swap = () => set({ includeBooks: value.excludeBooks, excludeBooks: value.includeBooks });
  const books = meta.books;
  const pastCampaigns = (campaigns || []).filter((c) => c.counts?.total > 0);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-5">
        <Panel icon={Users} title="Who can receive it?" subtitle="Pick one or more groups">
          <div className="grid gap-3 sm:grid-cols-3">
            {SOURCES.map((s) => (
              <button
                key={s.key}
                type="button"
                role="checkbox"
                aria-checked={has(s.key)}
                onClick={() => toggleSource(s.key)}
                className={cx(
                  "rounded-xl border p-3.5 text-left transition",
                  has(s.key) ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500 dk:bg-orange-500/10" : "border-stone-200 hover:border-orange-300 dk:border-[#443127]"
                )}
              >
                <span className={cx("block text-sm font-bold", has(s.key) ? "text-orange-800 dk:text-orange-200" : TITLE)}>{s.label}</span>
                <span className={cx("mt-0.5 block text-xs", MUTED)}>{s.hint}</span>
              </button>
            ))}
          </div>
          {has("users") && (
            <div className="mt-4">
              <Toggle
                checked={value.userScope === "all"}
                onChange={(on) => set({ userScope: on ? "all" : "nonBuyers" })}
                label="Include registered users who already bought"
                description="Off: only registered users who have never bought anything (good for first-purchase offers)."
              />
            </div>
          )}
        </Panel>

        {has("buyers") && (
          <Panel
            icon={Filter}
            title="Filter customers by what they bought"
            subtitle="“Bought HLD but not LLD”: HLD on the left, LLD on the right"
            action={
              <Button variant="soft" size="sm" onClick={swap} disabled={!value.includeBooks.length && !value.excludeBooks.length}>
                <ArrowLeftRight className="h-4 w-4" aria-hidden /> Reverse
              </Button>
            }
          >

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <BookPicker
                  title="Must have bought"
                  hint="Leave empty to include every customer."
                  books={books}
                  selected={value.includeBooks}
                  onChange={(v) => set({ includeBooks: v })}
                />
                {value.includeBooks.length > 1 && (
                  <div className="mt-2 flex gap-2" role="radiogroup" aria-label="Match mode">
                    <ChipToggle selected={value.includeMode === "any"} onClick={() => set({ includeMode: "any" })}>
                      Any one of them
                    </ChipToggle>
                    <ChipToggle selected={value.includeMode === "all"} onClick={() => set({ includeMode: "all" })}>
                      All of them
                    </ChipToggle>
                  </div>
                )}
              </div>
              <BookPicker
                tone="rose"
                title="Must NOT have bought (exclude)"
                hint="Anyone who ever bought any of these is left out."
                books={books}
                selected={value.excludeBooks}
                onChange={(v) => set({ excludeBooks: v })}
              />
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Purchased from" hint="Counts only purchases in this period">
                <input type="date" value={value.purchasedFrom} onChange={(e) => set({ purchasedFrom: e.target.value })} className={inputClass(false)} />
              </Field>
              <Field label="Purchased until">
                <input type="date" value={value.purchasedTo} onChange={(e) => set({ purchasedTo: e.target.value })} className={inputClass(false)} />
              </Field>
              <Field label="Minimum orders">
                <input type="number" min="0" value={value.minOrders} onChange={(e) => set({ minOrders: e.target.value })} className={inputClass(false)} placeholder="e.g. 2" />
              </Field>
              <Field label="Minimum total spent (₹)">
                <input type="number" min="0" value={value.minSpent} onChange={(e) => set({ minSpent: e.target.value })} className={inputClass(false)} />
              </Field>
              <Field label="Maximum total spent (₹)">
                <input type="number" min="0" value={value.maxSpent} onChange={(e) => set({ maxSpent: e.target.value })} className={inputClass(false)} />
              </Field>
            </div>
          </Panel>
        )}

        <Panel icon={Ban} title="Lists and exclusions" subtitle="Add your own list, or leave people out">
          <div className="grid gap-4 md:grid-cols-2">
            {has("manual") && (
              <EmailBox
                label="Send to these addresses"
                hint="Paste or upload; combined with the groups above."
                value={value.manualEmails}
                onChange={(v) => set({ manualEmails: v })}
              />
            )}
            <EmailBox
              label="Never send to these addresses"
              hint="Teammates, test accounts, anyone who asked not to be mailed."
              value={value.excludeEmails}
              onChange={(v) => set({ excludeEmails: v })}
            />
          </div>

          {pastCampaigns.length > 0 && (
            <div className="mt-4">
              <p className={cx("text-sm font-semibold", TITLE)}>Skip people already mailed by earlier campaigns</p>
              <div className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
                {pastCampaigns.map((c) => (
                  <ChipToggle
                    key={c._id}
                    selected={value.excludeCampaignIds.includes(c._id)}
                    onClick={() =>
                      set({
                        excludeCampaignIds: value.excludeCampaignIds.includes(c._id)
                          ? value.excludeCampaignIds.filter((x) => x !== c._id)
                          : [...value.excludeCampaignIds, c._id],
                      })
                    }
                  >
                    {c.name}
                  </ChipToggle>
                ))}
              </div>
            </div>
          )}
          <p className={cx("mt-4 rounded-lg bg-stone-50 px-3 py-2 text-xs dk:bg-[#2c211b]", MUTED)}>
            <ListChecks className="mr-1 inline h-3.5 w-3.5" aria-hidden /> People who unsubscribed ({meta.suppressed}) are always left out automatically.
          </p>
        </Panel>
      </div>

      {/* live preview */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="overflow-hidden rounded-2xl border border-[#f0ded0] bg-white shadow-md dk:border-[#443127] dk:bg-[#241b15]">
          <div className="bg-gradient-to-br from-orange-600 to-amber-500 p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-50">Matching recipients</span>
              {loading && <span className="h-2 w-2 animate-pulse rounded-full bg-white" aria-label="Updating" />}
            </div>
            <div className="mt-1 text-5xl font-extrabold tabular-nums">{loading && !preview ? "…" : (preview?.total ?? 0).toLocaleString("en-IN")}</div>
            <p className="mt-1 text-xs text-orange-50">One email per person, even if they bought several books</p>
          </div>

          <div className="p-5">
            {error && <p className="text-sm text-rose-600 dk:text-rose-300">{error}</p>}
            {preview && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {preview.stats.buyers > 0 && <Badge tone="brand">{preview.stats.buyers} customers</Badge>}
                  {preview.stats.users > 0 && <Badge tone="slate">{preview.stats.users} registered</Badge>}
                  {preview.stats.manual > 0 && <Badge tone="slate">{preview.stats.manual} listed</Badge>}
                  {preview.stats.duplicates > 0 && <Badge tone="emerald">{preview.stats.duplicates} duplicate{preview.stats.duplicates > 1 ? "s" : ""} merged</Badge>}
                  {preview.stats.suppressed > 0 && <Badge tone="amber">{preview.stats.suppressed} unsubscribed removed</Badge>}
                  {preview.stats.excluded > 0 && <Badge tone="amber">{preview.stats.excluded} excluded</Badge>}
                  {preview.stats.alreadyMailed > 0 && <Badge tone="amber">{preview.stats.alreadyMailed} already mailed</Badge>}
                  {preview.stats.invalid > 0 && <Badge tone="rose">{preview.stats.invalid} invalid</Badge>}
                </div>

                {preview.booksBreakdown.length > 0 && (
                  <div className="mt-5">
                    <h4 className={cx("text-xs font-bold uppercase tracking-wide", MUTED)}>Books they own</h4>
                    <ul className="mt-2 space-y-2">
                      {preview.booksBreakdown.slice(0, 6).map((b) => (
                        <li key={b.title}>
                          <div className="flex justify-between gap-2 text-sm">
                            <span className={cx("truncate", TITLE)}>{b.title}</span>
                            <span className={cx("shrink-0 tabular-nums", MUTED)}>{b.count}</span>
                          </div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100 dk:bg-[#3a2c23]">
                            <div className="h-full rounded-full bg-orange-400" style={{ width: `${Math.max(4, (b.count / (preview.total || 1)) * 100)}%` }} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {preview.sample.length > 0 && (
                  <div className="mt-5">
                    <h4 className={cx("text-xs font-bold uppercase tracking-wide", MUTED)}>Sample</h4>
                    <ul className="mt-2 space-y-2">
                      {preview.sample.slice(0, 6).map((r) => (
                        <li key={r.email} className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-700 dk:bg-orange-500/15 dk:text-orange-300">
                            {(r.name || r.email)[0].toUpperCase()}
                          </span>
                          <span className="min-w-0">
                            <span className={cx("block truncate text-sm font-medium", TITLE)}>{r.email}</span>
                            <span className={cx("block truncate text-xs", MUTED)}>
                              {r.name || "—"}
                              {r.spent > 0 ? ` · ${money(r.spent)}` : ""}
                              {r.books.length ? ` · ${r.books[0]}${r.books.length > 1 ? ` +${r.books.length - 1}` : ""}` : ""}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Button className="mt-5 w-full" variant="outline" loading={exporting} disabled={!preview.total} onClick={exportCsv}>
                  <Download className="h-4 w-4" aria-hidden /> Download list (CSV)
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
