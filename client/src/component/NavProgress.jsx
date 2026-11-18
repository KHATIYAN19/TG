import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { internalPath } from "../lib/routePrefetch";

/*
  A thin bar at the top of the screen so a click on a link always gives feedback while the next
  page's code loads (an SPA never shows the browser's own tab spinner).

  Starts on a click on an internal link, finishes when the location changes. It only becomes
  visible after SHOW_AFTER_MS, so instant navigations don't flicker.
*/

const SHOW_AFTER_MS = 120;
const FAILSAFE_MS = 10000;

export default function NavProgress() {
  const location = useLocation();
  const [bar, setBar] = useState({ show: false, width: 0 });
  const timers = useRef([]);
  const active = useRef(false);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (ms, fn) => timers.current.push(setTimeout(fn, ms));

  const finish = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    clearTimers();
    setBar((b) => (b.show ? { show: true, width: 100 } : b));
    later(250, () => setBar({ show: false, width: 0 }));
  }, []);

  const start = useCallback(() => {
    clearTimers();
    active.current = true;
    later(SHOW_AFTER_MS, () => setBar({ show: true, width: 25 }));
    later(600, () => setBar({ show: true, width: 55 }));
    later(1800, () => setBar({ show: true, width: 75 }));
    later(5000, () => setBar({ show: true, width: 88 }));
    later(FAILSAFE_MS, () => { active.current = true; finish(); });
  }, [finish]);

  useEffect(() => {
    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target?.closest?.("a[href]");
      const path = internalPath(anchor);
      if (!path) return;
      const url = new URL(anchor.href, window.location.href);
      const same = path === window.location.pathname.replace(/\/+$/, "") && url.search === window.location.search;
      if (same) return; // hash jumps and same-page clicks never change the location
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  useEffect(() => {
    finish();
  }, [location.pathname, location.search, finish]);

  useEffect(() => clearTimers, []);

  if (!bar.show) return null;
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed", top: 0, left: 0, zIndex: 100000, height: 3, pointerEvents: "none",
        width: `${bar.width}%`, background: "#ea580c", boxShadow: "0 0 8px rgba(234,88,12,.6)",
        transition: bar.width === 100 ? "width .2s ease-out" : "width .6s ease-out",
        borderRadius: "0 2px 2px 0",
      }}
    />
  );
}
