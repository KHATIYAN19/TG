import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { MailPlus, X } from "lucide-react";
import BASE_URL from "../utils/Url.js";

/*
  Small one-line notice (bottom-right, admin only) shown when there are
  unread contact queries. Shows who sent the newest unread query; clicking opens that query,
  the cross dismisses it.
*/
export default function NewQueriesNotice() {
  const token = useSelector((s) => s.auth?.token);
  const navigate = useNavigate();
  const [unread, setUnread] = useState([]);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    axios
      .get(`${BASE_URL}/messages/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        if (cancelled) return;
        const list = (data.messages || [])
          .filter((m) => !m.isRead)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setUnread(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (hidden || unread.length === 0) return null;

  const latest = unread[0];
  const extra = unread.length - 1;
  const open = () => navigate(`/contact-details/${latest._id}`);

  return (
    <div
      role="status"
      className="fixed bottom-20 right-4 z-40 flex max-w-[calc(100vw-2rem)] items-center gap-1 rounded-full bg-indigo-600 py-1.5 pl-4 pr-1.5 text-sm font-medium text-white shadow-lg shadow-indigo-900/30"
    >
      <button
        type="button"
        onClick={open}
        className="flex items-center gap-2 whitespace-nowrap hover:underline"
      >
        <MailPlus size={16} />
        <span className="max-w-[60vw] truncate sm:max-w-xs">
          {latest.name} sent a new query{extra > 0 ? ` (+${extra} more)` : ""}
        </span>
      </button>
      <button
        type="button"
        onClick={() => setHidden(true)}
        aria-label="Dismiss"
        className="ml-1 rounded-full p-1 hover:bg-white/20"
      >
        <X size={16} />
      </button>
    </div>
  );
}
