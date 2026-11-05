import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Swords, X } from "lucide-react";

import { PLANS_API } from "./PackSections";

/*
  Shown on every /book/... page whose book gives Prep Arena matches (Book.matches > 0),
  pack or not. Reads the live value from the database; nothing to edit per page.
  The pack pages already explain matches in full, so they skip this.
*/
const SKIP = new Set(["/book/all-books", "/book/life-type-combo"]);

export default function BookMatchesNotice() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  const [info, setInfo] = useState(null);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    setInfo(null);
    setClosed(false);
    if (!path.startsWith("/book/") || SKIP.has(path)) return undefined;

    const controller = new AbortController();
    axios
      .get(`${PLANS_API}/book-matches`, { params: { redirectUrl: path }, signal: controller.signal, timeout: 15000 })
      .then((res) => setInfo(res.data?.data || null))
      .catch(() => {}); // purely informational
    return () => controller.abort();
  }, [path]);

  const matches = Number(info?.matches) || 0;
  if (!matches || closed) return null;

  return (
    <aside
      role="note"
      style={{
        position: "fixed", left: 16, bottom: 16, zIndex: 45, maxWidth: 330,
        display: "flex", gap: 10, alignItems: "flex-start",
        background: "#fff", color: "#1C1917", border: "1px solid #FDBA74", borderLeft: "4px solid #EA580C",
        borderRadius: 12, padding: "10px 12px", boxShadow: "0 14px 34px rgba(120,53,15,.22)", fontSize: 13, lineHeight: 1.45,
      }}
    >
      <Swords size={18} color="#EA580C" style={{ flex: "none", marginTop: 2 }} aria-hidden="true" />
      <div>
        <b style={{ color: "#C2410C" }}>Includes {matches} Prep Arena {matches === 1 ? "credit" : "credits"}</b>
        <div style={{ color: "#57534E" }}>
          1 credit = 1 match = 1 buddy partnership for mock interviews. Added when you sign up on Prep Arena with the email you buy with.
        </div>
      </div>
      <button type="button" onClick={() => setClosed(true)} aria-label="Dismiss" style={{ border: 0, background: "none", cursor: "pointer", color: "#78716C", padding: 0, flex: "none" }}>
        <X size={16} />
      </button>
    </aside>
  );
}
