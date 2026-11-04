import { useCallback, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Inbox, LayoutTemplate, Megaphone, Plus, ShoppingBag, Wifi, Send, TriangleAlert } from "lucide-react";

import { Button, Card, Spinner } from "../arena/ui";
import { useArenaChrome } from "../arena/chrome";
import CampaignBuilder from "./campaign/CampaignBuilder";
import CampaignList from "./campaign/CampaignList";
import QueueTab from "./campaign/QueueTab";
import TemplatesTab from "./campaign/TemplatesTab";
import { Hero, HeroStat, Tabs } from "./campaign/ui";
import { api, errMsg } from "./campaign/shared";

export default function CampaignStudio() {
  useArenaChrome();
  const [tab, setTab] = useState("campaigns");
  const [meta, setMeta] = useState(null);
  const [error, setError] = useState("");
  const [campaigns, setCampaigns] = useState([]);
  const [builder, setBuilder] = useState(null); // { initial } while building

  const loadMeta = useCallback(() => {
    api
      .get("/meta")
      .then(({ data }) => {
        setMeta(data);
        setError("");
      })
      .catch((e) => setError(errMsg(e)));
  }, []);
  useEffect(loadMeta, [loadMeta]);

  const duplicate = (c) =>
    setBuilder({ initial: { ...c, _id: null, name: `${c.name} (copy)`, status: "DRAFT", scheduledAt: null } });

  const q = meta?.queue;
  const dlq = q?.dlq?.waiting || 0;
  const running = campaigns.filter((c) => ["SENDING", "QUEUEING"].includes(c.status)).length;

  return (
    <main className="min-h-screen-safe bg-[#fff8f2] pt-[calc(var(--arena-nav-h,5rem)+0.5rem)] dk:bg-[#15110e]">
      <Helmet>
        <title>Campaign Studio | Target Trek Admin</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <Hero
          icon={Megaphone}
          title="Campaign Studio"
          subtitle={
            <>
              Reach the right customers: pick who, choose a template, add a coupon and send it in the background. To send one quick email to a pasted list, use{" "}
              <a href="/campaign" className="font-bold underline underline-offset-2">Quick Email Send</a>.
            </>
          }
          actions={
            meta && !builder ? (
              <button
                type="button"
                onClick={() => setBuilder({ initial: null })}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-orange-700 shadow-md transition hover:bg-orange-50"
              >
                <Plus className="h-4 w-4" aria-hidden /> New campaign
              </button>
            ) : null
          }
        >
          {meta && (
            <>
              <HeroStat icon={ShoppingBag} label="Customers" value={meta.totalBuyers.toLocaleString("en-IN")} />
              <HeroStat icon={Send} label="Sending now" value={running} />
              <HeroStat icon={Wifi} label="Email queue" value={q?.reachable ? "Connected" : q?.configured ? "Unreachable" : "Not set up"} />
              <HeroStat icon={TriangleAlert} label="In dead-letter" value={dlq} alert={dlq > 0} />
            </>
          )}
        </Hero>

        {!meta && !error && <Spinner />}
        {error && (
          <Card className="p-6 text-center">
            <p className="text-sm text-rose-600 dk:text-rose-300">{error}</p>
            <Button className="mt-4" onClick={loadMeta}>
              Try again
            </Button>
          </Card>
        )}

        {meta && builder && (
          <CampaignBuilder
            key={builder.initial?._id || "new"}
            meta={meta}
            campaigns={campaigns}
            initial={builder.initial}
            onClose={() => setBuilder(null)}
            onSaved={() => {
              setBuilder(null);
              setTab("campaigns");
              loadMeta();
            }}
          />
        )}

        {meta && !builder && (
          <>
            <Tabs
              value={tab}
              onChange={setTab}
              tabs={[
                { key: "campaigns", label: "Campaigns", icon: Megaphone },
                { key: "templates", label: "Templates", icon: LayoutTemplate },
                { key: "queue", label: "Queue & DLQ", icon: Inbox, badge: dlq || null },
              ]}
            />
            {tab === "campaigns" && (
              <CampaignList
                campaigns={campaigns}
                setCampaigns={setCampaigns}
                reloadMeta={loadMeta}
                onNew={() => setBuilder({ initial: null })}
                onEdit={(c) => setBuilder({ initial: c })}
                onDuplicate={duplicate}
              />
            )}
            {tab === "templates" && <TemplatesTab meta={meta} reloadMeta={loadMeta} />}
            {tab === "queue" && <QueueTab meta={meta} reloadMeta={loadMeta} />}
          </>
        )}
      </div>
    </main>
  );
}
