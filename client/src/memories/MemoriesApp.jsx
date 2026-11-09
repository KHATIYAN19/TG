import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { listPages, useMemConfig } from "./memApi";
import AppShell, { Loading } from "./AppShell";
import MemoriesPay from "./MemoriesPay";
import MemoriesStudio from "./MemoriesStudio";
import MyPages from "./MyPages";
import PageBuilder from "./PageBuilder";
import OwnerPreview from "./OwnerPreview";
import PageActivity from "./PageActivity";

/*
  The signed-in Memories app.
    /memories/app        the templates, in detail (needs a page credit; if you have never had one you are sent to pay first)
    /memories/app/pay    pay once or enter a unique code: each gives exactly 1 credit
    /memories/app/pages  the pages you created. Creating one spends 1 credit
*/
export default function MemoriesApp() {
  const location = useLocation();
  const token = useSelector((s) => s.auth?.token);
  const { cfg, error, reload, setCredits } = useMemConfig();
  const [pageCount, setPageCount] = useState(null); // used to tell "brand new, send to pay" from "spent their credit"

  useEffect(() => { if (token) listPages().then((p) => setPageCount(p.length)).catch(() => setPageCount(0)); }, [token]);

  if (!token) return <Navigate to="/memories/login" replace state={{ from: location }} />;

  if (error) return <AppShell title="My Memories"><p role="alert" className="py-20 text-center text-rose-600">{error}</p></AppShell>;
  if (!cfg || pageCount === null) return <AppShell title="My Memories"><Loading /></AppShell>;
  if (cfg.enabled === false) return <AppShell title="My Memories"><p className="py-20 text-center text-[#7a5370]">Memory pages are paused for a short while. Please check back soon.</p></AppShell>;

  const needsPayment = cfg.credits < 1 && pageCount === 0;

  return (
    <AppShell title="My Memories" credits={cfg.credits}>
      <Routes>
        <Route index element={needsPayment ? <Navigate to="/memories/app/pay" replace /> : <MemoriesStudio cfg={cfg} />} />
        <Route path="pay" element={<MemoriesPay cfg={cfg} reload={reload} firstTime={needsPayment} />} />
        <Route path="pages" element={<MyPages credits={cfg.credits} />} />
        <Route path="pages/:id/preview" element={<OwnerPreview />} />
        <Route path="pages/:id/activity" element={<PageActivity />} />
        <Route path="pages/:id/edit" element={<PageBuilder mode="edit" cfg={cfg} setCredits={setCredits} reload={reload} />} />
        <Route path="create/:template" element={<PageBuilder mode="create" cfg={cfg} setCredits={setCredits} reload={reload} onPageCreated={() => setPageCount((n) => (n || 0) + 1)} />} />
        <Route path="*" element={<Navigate to="/memories/app" replace />} />
      </Routes>
    </AppShell>
  );
}
