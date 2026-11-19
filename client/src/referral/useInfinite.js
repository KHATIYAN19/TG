import { useCallback, useEffect, useRef, useState } from "react";

import { errMsg } from "../arena/api";

/*
  Scroll loading. `fetchPage(page)` answers { items, total, pages }. Page 1 loads when `deps` change; the next page loads when the
  `sentinel` element (placed under the list) scrolls near the screen. A "Load more" button does the same, so it works without scrolling.
*/
export function useInfinite(fetchPage, deps) {
  const [state, setState] = useState({ items: null, total: 0, page: 0, pages: 1, loading: false, error: "", extra: null });
  const run = useRef(0);
  const busy = useRef(false);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const load = useCallback((page, replace) => {
    const id = replace ? ++run.current : run.current;
    busy.current = true;
    setState((s) => ({ ...s, loading: true, error: "", ...(replace ? { items: null, page: 0 } : {}) }));
    fetchRef.current(page).then((d) => {
      if (id !== run.current) return;
      setState((s) => ({ items: replace ? d.items : [...(s.items || []), ...d.items.filter((x) => !(s.items || []).some((y) => y.id === x.id))], total: d.total ?? d.items.length, page: d.page ?? page, pages: d.pages ?? 1, loading: false, error: "", extra: page === 1 || !s.extra ? d : s.extra })); // `extra` is the first page's header data (counts, summary)
    }).catch((e) => { if (id === run.current) setState((s) => ({ ...s, loading: false, error: errMsg(e), items: s.items || [] })); })
      .finally(() => { if (id === run.current) busy.current = false; });
  }, []);

  useEffect(() => { const t = setTimeout(() => load(1, true), 0); return () => clearTimeout(t); }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  const hasMore = state.items !== null && state.page < state.pages;
  const loadMore = useCallback(() => { if (!busy.current && hasMore) load(state.page + 1, false); }, [hasMore, state.page, load]);

  const observer = useRef(null);
  const sentinel = useCallback((node) => {
    observer.current?.disconnect();
    if (!node || typeof IntersectionObserver === "undefined") return;
    observer.current = new IntersectionObserver((es) => { if (es[0].isIntersecting) loadMore(); }, { rootMargin: "500px 0px" });
    observer.current.observe(node);
  }, [loadMore]);

  // Re-read page 1 without clearing the list: changed rows are replaced in place, new ones go on top, loaded pages stay put.
  const refresh = useCallback(() => {
    const id = run.current;
    fetchRef.current(1).then((d) => {
      if (id !== run.current) return;
      setState((s) => {
        if (s.items === null) return s;
        const fresh = new Set(d.items.map((x) => x.id));
        return { ...s, items: [...d.items, ...s.items.filter((x) => !fresh.has(x.id))], total: d.total ?? s.total, pages: Math.max(s.pages, d.pages ?? 1), extra: d };
      });
    }).catch(() => {});
  }, []);

  const setItems = useCallback((fn) => setState((s) => ({ ...s, items: typeof fn === "function" ? fn(s.items || []) : fn })), []);
  return { ...state, hasMore, loadMore, sentinel, reload: () => load(1, true), refresh, setItems };
}
