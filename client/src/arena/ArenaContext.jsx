import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { http, errMsg, WS_URL } from "./api";

const ArenaContext = createContext(null);
export const useArena = () => useContext(ArenaContext);

const NO_RECONNECT = new Set([1000, 4001, 4002, 4003]);

export function ArenaProvider({ children }) {
  const token = useSelector((s) => s.auth.token);

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socketState, setSocketState] = useState("connecting"); // connecting | open | closed

  const subscribers = useRef(new Set());
  const socketRef = useRef(null);

  // Concurrent refresh() calls share one in-flight request instead of stampeding the API.
  const inflight = useRef(null);
  const refresh = useCallback(() => {
    if (!inflight.current) {
      inflight.current = http
        .get("/me")
        .then(({ data }) => { setMe(data.data); setError(""); return data.data; })
        .catch((e) => { setError(errMsg(e)); return null; })
        .finally(() => { setLoading(false); inflight.current = null; });
    }
    return inflight.current;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /* ---------------- realtime connection ---------------- */
  useEffect(() => {
    if (!token) return undefined;

    let closedByUs = false;
    let retry = 0;
    let timer;

    const connect = () => {
      setSocketState("connecting");
      const ws = new WebSocket(WS_URL);
      socketRef.current = ws;

      ws.onopen = () => ws.send(JSON.stringify({ type: "auth", token }));

      ws.onmessage = (event) => {
        let frame;
        try {
          frame = JSON.parse(event.data);
        } catch {
          return;
        }

        if (frame.type === "ready") {
          retry = 0;
          setSocketState("open");
        }

        switch (frame.type) {
          // Stable toast ids: if the same event arrives twice (two tabs, a
          // reconnect, StrictMode's double effect) only one toast is shown.
          case "request_received":
            toast("You have a new buddy request", { icon: "👋", id: "arena-request" });
            refresh();
            break;
          case "request_updated":
            refresh();
            break;
          case "matched":
            toast.success("You're matched! Say hello to your buddy 🎉", { id: "arena-matched" });
            refresh();
            break;
          case "match_ended":
            toast("Your partnership has ended", { icon: "👋", id: "arena-ended" });
            refresh();
            break;
          case "suspended":
            toast.error("Your arena access was suspended", { id: "arena-suspended" });
            refresh();
            break;
          case "share_updated":
            break;
          default:
        }

        subscribers.current.forEach((fn) => fn(frame));
      };

      ws.onclose = (event) => {
        setSocketState("closed");
        if (closedByUs || NO_RECONNECT.has(event.code)) return;
        retry += 1;
        timer = setTimeout(connect, Math.min(30000, 1000 * 2 ** Math.min(retry, 5)));
      };

      ws.onerror = () => ws.close();
    };

    connect();

    return () => {
      closedByUs = true;
      clearTimeout(timer);
      socketRef.current?.close(1000, "unmount");
    };
  }, [token, refresh]);

  const subscribe = useCallback((fn) => {
    subscribers.current.add(fn);
    return () => subscribers.current.delete(fn);
  }, []);

  const sendFrame = useCallback((frame) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    ws.send(JSON.stringify(frame));
    return true;
  }, []);

  const value = useMemo(
    () => ({ me, loading, error, refresh, subscribe, sendFrame, socketState }),
    [me, loading, error, refresh, subscribe, sendFrame, socketState]
  );

  return <ArenaContext.Provider value={value}>{children}</ArenaContext.Provider>;
}
