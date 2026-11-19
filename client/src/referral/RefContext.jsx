import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { REFERRAL_WS_URL } from "../arena/api";
import { getSummary } from "./api";

/*
  One live connection for the whole referral area: it keeps the home counters and the inbox fresh, and the chat page listens to
  the same socket. Frames are JSON (see backend/services/referral/socket.js). If the socket is down, every action also works over REST.
*/
const Ctx = createContext(null);
export const useRef_ = () => useContext(Ctx);

export function RefProvider({ children }) {
  const token = useSelector((s) => s.auth?.token);
  const [summary, setSummary] = useState(null);
  const [state, setState] = useState("connecting");
  const ws = useRef(null);
  const listeners = useRef(new Set());
  const timer = useRef(null);

  const refresh = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => getSummary().then(setSummary).catch(() => {}), 150);
  }, []);
  useEffect(() => { if (token) getSummary(true).then(setSummary).catch(() => {}); return () => clearTimeout(timer.current); }, [token]);

  // Small live changes are applied to the counters right here, with no request; only "something changed, we don't know what" asks the server.
  const bump = useCallback((patch) => setSummary((s) => (s ? { ...s, counts: { ...s.counts, ...Object.fromEntries(Object.entries(patch).map(([k, n]) => [k, Math.max(0, (s.counts[k] || 0) + n)])) } } : s)), []);
  const openChat = useRef("");

  useEffect(() => {
    if (!token) return undefined;
    let closedByUs = false, retry = 0, retryTimer;
    const connect = () => {
      setState("connecting");
      const sock = new WebSocket(REFERRAL_WS_URL);
      ws.current = sock;
      sock.onopen = () => sock.send(JSON.stringify({ type: "auth", token }));
      sock.onmessage = (e) => {
        let f; try { f = JSON.parse(e.data); } catch { return; }
        if (f.type === "ready") { retry = 0; setState("open"); }
        if (f.type === "request_new") { toast("You have a new referral request", { icon: "🤝", id: "ref-new" }); bump({ received: 1, unseen: 1 }); }
        if (f.type === "request_updated") refresh();
        // a message in the chat that is open right now is read at once, so it never counts as unread
        if (f.type === "message" && !f.message?.mine && !f.message?.system && !(openChat.current === f.requestId && !document.hidden)) bump({ unread: 1 });
        listeners.current.forEach((fn) => fn(f));
      };
      sock.onclose = () => {
        setState("closed");
        if (closedByUs) return;
        retryTimer = setTimeout(connect, Math.min(15000, 1000 * 2 ** retry++));
      };
      sock.onerror = () => sock.close();
    };
    connect();
    return () => { closedByUs = true; clearTimeout(retryTimer); ws.current?.close(); };
  }, [token, refresh, bump]);

  const send = useCallback((frame) => {
    if (ws.current?.readyState === 1) { ws.current.send(JSON.stringify(frame)); return true; }
    return false;
  }, []);
  const subscribe = useCallback((fn) => { listeners.current.add(fn); return () => listeners.current.delete(fn); }, []);
  const value = useMemo(() => ({ summary, refresh, state, send, subscribe, openChat }), [summary, refresh, state, send, subscribe]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
