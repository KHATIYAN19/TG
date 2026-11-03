import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import toast from "react-hot-toast";
import { CheckCircle2, Mail, Send, ShieldCheck, TriangleAlert } from "lucide-react";

import { mailHttp as api, errMsg } from "../arena/api";
import { Badge, Button, Card, Spinner, Toggle, cx, inputClass } from "../arena/ui";
import { useArenaChrome } from "../arena/chrome";

const PROVIDERS = [
  {
    key: "mailtrap",
    name: "Mailtrap",
    note: "Current provider. Needs MAILTRAP_TOKEN on the server.",
  },
  {
    key: "resend",
    name: "Resend",
    note: "Needs RESEND_API_KEY on the server and a verified sending domain in Resend.",
  },
];

const MUTED = "text-stone-500 dk:text-[#b9a79c]";
const when = (d) => (d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—");

function ProviderCard({ meta, selected, active, configured, stats, from, testing, onSelect, onTest, testTo, setTestTo }) {
  return (
    <Card className={cx("p-5 transition", selected && "ring-2 ring-orange-500")}>
      <div className="flex items-start justify-between gap-3">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="radio"
            name="mail-provider"
            className="mt-1 h-4 w-4 accent-orange-600"
            checked={selected}
            onChange={onSelect}
            disabled={!configured}
          />
          <span>
            <span className="block text-base font-bold text-[#29201b] dk:text-[#fff7ed]">{meta.name}</span>
            <span className={cx("mt-0.5 block text-xs", MUTED)}>{meta.note}</span>
          </span>
        </label>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {active && <Badge tone="emerald">In use now</Badge>}
          <Badge tone={configured ? "slate" : "rose"}>{configured ? "Key found" : "Key missing"}</Badge>
        </div>
      </div>

      {from && configured && <p className={cx("mt-3 text-xs", MUTED)}>Sends from: <span className="font-semibold">{from}</span></p>}

      <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
        {[["Sent", stats.sent], ["Failed", stats.failed], ["Last sent", stats.lastSentAt ? when(stats.lastSentAt) : "—"]].map(([k, v]) => (
          <div key={k} className="rounded-xl bg-stone-50 p-2.5 dk:bg-[#2c211b]">
            <dt className={cx("text-[11px] font-semibold uppercase tracking-wide", MUTED)}>{k}</dt>
            <dd className="mt-1 break-words text-sm font-bold text-[#29201b] dk:text-[#fff7ed]">{v}</dd>
          </div>
        ))}
      </dl>
      <p className={cx("mt-1.5 text-[11px]", MUTED)}>Counts are since this server last started.</p>

      {stats.lastError && (
        <p className="mt-3 flex gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700 ring-1 ring-rose-100 dk:bg-rose-500/10 dk:text-rose-300 dk:ring-rose-500/20">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span><span className="font-semibold">Last error ({when(stats.lastErrorAt)}):</span> {stats.lastError}</span>
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          aria-label={`Send a ${meta.name} test email to`}
          placeholder="Test recipient (blank = your email)"
          value={testTo}
          onChange={(e) => setTestTo(e.target.value)}
          className={cx(inputClass(false), "sm:flex-1")}
          disabled={!configured}
        />
        <Button variant="outline" size="md" loading={testing} disabled={!configured} onClick={onTest}>
          <Send className="h-4 w-4" aria-hidden /> Send test
        </Button>
      </div>
    </Card>
  );
}

export default function AdminMailSettings() {
  useArenaChrome();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [choice, setChoice] = useState("mailtrap");
  const [fallback, setFallback] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState("");
  const [testTo, setTestTo] = useState({ mailtrap: "", resend: "" });

  const apply = useCallback((d) => {
    setData(d);
    setChoice(d.provider);
    setFallback(d.fallbackEnabled);
  }, []);

  const load = useCallback(() => {
    setError("");
    api.get("/").then(({ data: r }) => apply(r.data)).catch((e) => setError(errMsg(e)));
  }, [apply]);

  useEffect(load, [load]);

  const dirty = data && (choice !== data.provider || fallback !== data.fallbackEnabled);

  const save = async () => {
    setSaving(true);
    try {
      const { data: r } = await api.put("/", { provider: choice, fallbackEnabled: fallback });
      apply(r.data);
      toast.success(`Emails now go through ${choice === "resend" ? "Resend" : "Mailtrap"}`, { id: "mail-saved" });
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  const test = async (provider) => {
    setTesting(provider);
    try {
      const { data: r } = await api.post("/test", { provider, ...(testTo[provider].trim() ? { to: testTo[provider].trim() } : {}) });
      toast.success(`Test email sent via ${provider} to ${r.data.to}`, { id: `mail-test-${provider}` });
      load();
    } catch (e) {
      toast.error(errMsg(e), { id: `mail-test-${provider}` });
      load();
    } finally {
      setTesting("");
    }
  };

  return (
    <main className="min-h-screen-safe bg-[#fff8f2] pt-[calc(var(--arena-nav-h,5rem)+0.5rem)] dk:bg-[#15110e]">
      <Helmet>
        <title>Email provider | Target Trek Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-orange-600 text-white"><Mail className="h-6 w-6" aria-hidden /></span>
          <div>
            <h1 className="text-2xl font-bold text-[#29201b] dk:text-[#fff7ed]">Email provider</h1>
            <p className={cx("text-sm", MUTED)}>Choose how the whole site sends email: signup codes, book delivery, interview bookings and everything else. Changes apply within seconds, no redeploy.</p>
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
              {PROVIDERS.map((meta) => (
                <ProviderCard
                  key={meta.key}
                  meta={meta}
                  selected={choice === meta.key}
                  active={data.provider === meta.key}
                  configured={data.providers[meta.key].configured}
                  from={data.providers[meta.key].from}
                  stats={data.stats[meta.key]}
                  testing={testing === meta.key}
                  onSelect={() => setChoice(meta.key)}
                  onTest={() => test(meta.key)}
                  testTo={testTo[meta.key]}
                  setTestTo={(v) => setTestTo((t) => ({ ...t, [meta.key]: v }))}
                />
              ))}
            </div>

            <Card className="p-5">
              <Toggle
                checked={fallback}
                onChange={setFallback}
                label="Automatic failover"
                description="If the chosen provider fails (daily limit reached, outage, bad key), the email is retried through the other provider so nothing is lost."
              />
              <p className={cx("mt-3 text-xs", MUTED)}>Failovers since this server started: <span className="font-semibold">{data.stats.fallbacks}</span></p>
            </Card>

            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className={cx("flex items-center gap-1.5 text-xs", MUTED)}>
                <ShieldCheck className="h-4 w-4" aria-hidden /> Last changed {when(data.updatedAt)}
              </p>
              <Button size="lg" loading={saving} disabled={!dirty} onClick={save}>
                <CheckCircle2 className="h-5 w-5" aria-hidden /> Save changes
              </Button>
            </div>

            {data.history.length > 0 && (
              <Card className="p-5">
                <h2 className="text-sm font-bold text-[#29201b] dk:text-[#fff7ed]">Change history</h2>
                <ul className="mt-3 divide-y divide-stone-100 text-sm dk:divide-[#3a2c23]">
                  {data.history.map((h, i) => (
                    <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span className="text-[#29201b] dk:text-[#fff7ed]">
                        {h.from === h.to ? <>Failover {h.fallbackEnabled ? "on" : "off"}</> : <>{h.from} → <b>{h.to}</b></>}
                        <span className={MUTED}> · by {h.byName || "admin"}</span>
                      </span>
                      <span className={cx("text-xs", MUTED)}>{when(h.at)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
