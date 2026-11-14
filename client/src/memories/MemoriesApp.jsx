import { useEffect, useRef } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { claimMyCodes, useMemConfig } from "./memApi";
import AppShell, { Loading } from "./AppShell";
import MemoriesPay from "./MemoriesPay";
import MemoriesStudio from "./MemoriesStudio";
import MyPages from "./MyPages";
import PageBuilder from "./PageBuilder";
import OwnerPreview from "./OwnerPreview";
import PageActivity from "./PageActivity";
import { SupportList, SupportThread } from "./MemoriesSupport";

/*
  The signed-in Memories app.
    /memories/app          the templates, in detail: each look has its own price
    /memories/app/pay      checkout for the look you picked (plus extras), or redeem a code / Gumroad order
    /memories/app/pages    the pages you created: links, replies, PINs, and "get more room" add-ons
*/
export default function MemoriesApp() {
  const location = useLocation();
  const token = useSelector((s) => s.auth?.token);
  const navigate = useNavigate();
  const { cfg, error, reload } = useMemConfig();

  /*
    Right after sign-up / login: a Lifetime pack comes with one Memories page, emailed as a code. If this account's email bought one,
    the page is added here by itself (no typing). Runs once per visit; nothing happens for everyone else.
  */
  const claimed = useRef(false);
  useEffect(() => {
    if (!token || claimed.current) return;
    claimed.current = true;
    claimMyCodes()
      .then(async (r) => {
        if (!r?.added) return;
        await reload();
        toast.success(r.added > 1 ? `${r.added} free pages from your Lifetime pack were added.` : "Your free page from the Lifetime pack was added.", { id: "memories-pack-gift", duration: 6000 });
        // from the email's "Create a page" link or the sign-in screen: take them to the templates with a welcome
        if (/^\/memories\/app(\/pay)?\/?$/.test(location.pathname)) navigate("/memories/app", { replace: true, state: { welcome: "gift", added: r.added } });
      })
      .catch(() => { claimed.current = false; }); // offline / server busy: try again on the next visit to this screen
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <Route path="support" element={<SupportList />} />
        <Route path="support/:id" element={<SupportThread />} />
        <Route path="pages/:id/preview" element={<OwnerPreview />} />
        <Route path="pages/:id/activity" element={<PageActivity />} />
        <Route path="pages/:id/edit" element={<PageBuilder mode="edit" cfg={cfg} reload={reload} />} />
        <Route path="create/:template" element={<PageBuilder mode="create" cfg={cfg} reload={reload} />} />
        <Route path="*" element={<Navigate to="/memories/app" replace />} />
      </Routes>
    </AppShell>
  );
}
