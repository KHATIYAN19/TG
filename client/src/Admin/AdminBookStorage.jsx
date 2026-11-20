import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { ArrowRightLeft, CheckCircle2, Cloud, TriangleAlert } from "lucide-react";

import { bookStorageHttp as api, errMsg } from "../arena/api";
import { Badge, Button, Card, Spinner, cx } from "../arena/ui";
import { useArenaChrome } from "../arena/chrome";

const PROVIDERS = [
  { key: "s3", name: "AWS S3", note: "Private bucket. Buyers get short-lived signed links, nobody can guess a file URL." },
  { key: "cloudinary", name: "Cloudinary", note: "Public file URLs. This is where all existing books are stored today." },
];

const MUTED = "text-stone-500 dk:text-[#b9a79c]";
const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");
const nameOf = (key) => PROVIDERS.find((p) => p.key === key)?.name || key;

export default function AdminBookStorage() {
  useArenaChrome();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [choice, setChoice] = useState("cloudinary");
  const [saving, setSaving] = useState(false);
  const [moving, setMoving] = useState(false);

  const apply = useCallback((d) => {
    setData(d);
    setChoice(d.provider);
  }, []);

  const load = useCallback(() => {
    setError("");
    return api.get("/").then(({ data: r }) => apply(r.data)).catch((e) => setError(errMsg(e)));
  }, [apply]);

  useEffect(() => {
    load();
  }, [load]);

  // While a transfer runs, follow its progress.
  const running = data?.transfer?.status === "running";

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => api.get("/").then(({ data: r }) => setData((prev) => ({ ...(prev || {}), ...r.data }))).catch(() => {}), 3000);
    return () => clearInterval(timer);
  }, [running]);

  const save = async () => {
    setSaving(true);
    try {
      const { data: r } = await api.put("/", { provider: choice });
      apply(r.data);
      toast.success(`New book files now go to ${nameOf(choice)}`, { id: "book-storage-saved" });
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const transfer = async (to) => {
    const other = to === "s3" ? "cloudinary" : "s3";
    const count = data.counts[other];

    if (!window.confirm(`Copy ${count} book file(s) from ${nameOf(other)} to ${nameOf(to)} and point every book at the copy?\n\nEach original is deleted from ${nameOf(other)} once its copy is saved. This can take a while; you can leave this page.`)) return;

    setMoving(true);
    try {
      const { data: r } = await api.post("/transfer", { to });
      apply(r.data);
      toast.success("Transfer started");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setMoving(false);
    }
  };

  const dirty = data && choice !== data.provider;
  const t = data?.transfer;
  const percent = t?.total ? Math.round(((t.done + t.failed) / t.total) * 100) : 0;

  return (
    <main className="min-h-screen-safe bg-[#fff8f2] pt-[calc(var(--arena-nav-h,5rem)+0.5rem)] dk:bg-[#15110e]">
      <Helmet>
        <title>Book storage | Target Trek Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-600 text-white"><Cloud className="h-6 w-6" aria-hidden /></span>
          <div>
            <h1 className="text-2xl font-bold text-[#29201b] dk:text-[#fff7ed]">Book storage</h1>
            <p className={cx("text-sm", MUTED)}>Choose where newly uploaded book PDFs are stored, and move every existing book to the other storage whenever you want. The create and edit forms can still override this per upload.</p>
          </div>
        </div>

        {!data && !error && <div className="py-20"><Spinner label="Loading" /></div>}

        {error && (
          <Card className="mt-6 p-6 text-center">
            <p className="text-sm text-rose-600 dk:text-rose-300">{error}</p>
            <Button className="mt-4" onClick={load}>Try again</Button>
          </Card>
        )}

        {data && (
          <div className="mt-6 space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              {PROVIDERS.map((meta) => {
                const status = data.providers[meta.key];

                return (
                  <Card key={meta.key} className={cx("p-5", choice === meta.key && "ring-2 ring-orange-500")}>
                    <div className="flex items-start justify-between gap-3">
                      <label className="flex cursor-pointer items-start gap-3">
                        <input
                          type="radio"
                          name="book-storage"
                          className="mt-1 h-4 w-4 accent-orange-600"
                          checked={choice === meta.key}
                          onChange={() => setChoice(meta.key)}
                          disabled={!status.configured}
                        />
                        <span>
                          <span className="block text-base font-bold text-[#29201b] dk:text-[#fff7ed]">{meta.name}</span>
                          <span className={cx("mt-0.5 block text-xs", MUTED)}>{meta.note}</span>
                        </span>
                      </label>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {data.provider === meta.key && <Badge tone="emerald">Used for new uploads</Badge>}
                        <Badge tone={status.configured ? "slate" : "rose"}>{status.configured ? "Key found" : "Not set up"}</Badge>
                      </div>
                    </div>

                    {!status.configured && status.missing?.length > 0 && (
                      <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 dk:bg-amber-500/10 dk:text-amber-200">
                        Still needed on the server: <span className="font-mono font-semibold">{status.missing.join(", ")}</span>
                      </p>
                    )}
                    {status.bucket && <p className={cx("mt-3 text-xs", MUTED)}>Bucket <span className="font-semibold">{status.bucket}</span> · region <span className="font-semibold">{status.region}</span></p>}

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-stone-50 p-3 dk:bg-[#2c211b]">
                      <span className={cx("text-xs font-semibold uppercase tracking-wide", MUTED)}>Book files stored here</span>
                      <span className="text-lg font-bold text-[#29201b] dk:text-[#fff7ed]">{data.counts[meta.key]}</span>
                    </div>

                    <Button
                      className="mt-4 w-full"
                      variant="outline"
                      loading={moving}
                      disabled={!status.configured || running || data.counts[meta.key === "s3" ? "cloudinary" : "s3"] === 0}
                      onClick={() => transfer(meta.key)}
                    >
                      <ArrowRightLeft className="h-4 w-4" aria-hidden /> Move all files here ({data.counts[meta.key === "s3" ? "cloudinary" : "s3"]})
                    </Button>
                  </Card>
                );
              })}
            </div>

            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className={cx("text-xs", MUTED)}>Last changed {when(data.updatedAt)}</p>
              <Button size="lg" loading={saving} disabled={!dirty} onClick={save}>
                <CheckCircle2 className="h-5 w-5" aria-hidden /> Save default storage
              </Button>
            </div>

            {t && t.status !== "idle" && (
              <Card className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-[#29201b] dk:text-[#fff7ed]">
                    Transfer {nameOf(t.from)} → {nameOf(t.to)}
                  </h2>
                  <Badge tone={t.status === "done" ? "emerald" : t.status === "failed" ? "rose" : "slate"}>
                    {t.status === "running" ? "Running" : t.status === "done" ? "Finished" : "Failed"}
                  </Badge>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100 dk:bg-[#2c211b]">
                  <div className="h-full bg-orange-500 transition-all" style={{ width: `${percent}%` }} />
                </div>

                <p className={cx("mt-2 text-xs", MUTED)}>
                  {t.done} moved · {t.failed} failed · {t.total} total · started {when(t.startedAt)}
                  {t.finishedAt ? ` · finished ${when(t.finishedAt)}` : ""}
                </p>

                {t.errors?.length > 0 && (
                  <ul className="mt-3 space-y-1 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 ring-1 ring-rose-100 dk:bg-rose-500/10 dk:text-rose-300 dk:ring-rose-500/20">
                    {t.errors.map((message, i) => (
                      <li key={i} className="flex gap-2"><TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />{message}</li>
                    ))}
                  </ul>
                )}

                {t.failed > 0 && t.status !== "running" && <p className={cx("mt-3 text-xs", MUTED)}>Run the transfer again to retry the failed files; files already moved are skipped.</p>}
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
