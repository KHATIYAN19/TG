import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { useMemConfig } from "./memApi";
import AppShell, { Loading } from "./AppShell";
import MemoriesPay from "./MemoriesPay";
import MemoriesStudio from "./MemoriesStudio";
import MyPages from "./MyPages";
import PageBuilder from "./PageBuilder";
import OwnerPreview from "./OwnerPreview";
import PageActivity from "./PageActivity";

/*
  The signed-in Memories app.
    /memories/app          the templates, in detail: each look has its own price
    /memories/app/pay      checkout for the look you picked (plus extras), or redeem a code / Gumroad order
    /memories/app/pages    the pages you created: links, replies, PINs, and "get more room" add-ons
*/
export default function MemoriesApp() {
  const location = useLocation();
  const token = useSelector((s) => s.auth?.token);
  const { cfg, error, reload } = useMemConfig();

  if (!token) return <Navigate to="/memories/login" replace state={{ from: location }} />;

  if (error) return <AppShell title="My Memories"><p role="alert" className="py-20 text-center text-rose-600">{error}</p></AppShell>;
  if (!cfg) return <AppShell title="My Memories"><Loading /></AppShell>;
  if (cfg.enabled === false) return <AppShell title="My Memories"><p className="py-20 text-center text-[#7a5370]">Memory pages are paused for a short while. Please check back soon.</p></AppShell>;

  return (
    <AppShell title="My Memories" credits={cfg.credits}>
      <Routes>
        <Route index element={<MemoriesStudio cfg={cfg} />} />
        <Route path="pay" element={<MemoriesPay cfg={cfg} reload={reload} />} />
        <Route path="pages" element={<MyPages cfg={cfg} emailEnabled={cfg.emailEnabled !== false} />} />
        <Route path="pages/:id/preview" element={<OwnerPreview />} />
        <Route path="pages/:id/activity" element={<PageActivity />} />
        <Route path="pages/:id/edit" element={<PageBuilder mode="edit" cfg={cfg} reload={reload} />} />
        <Route path="create/:template" element={<PageBuilder mode="create" cfg={cfg} reload={reload} />} />
        <Route path="*" element={<Navigate to="/memories/app" replace />} />
      </Routes>
    </AppShell>
  );
}
