import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { errCode, errMsg, isSessionError } from "./api";
import { Button, cx } from "./ui";

/*
  LAZY LOADING (infinite scroll)
  ------------------------------
  useInfiniteList(fetchPage, deps)
    fetchPage(page) → Promise<{ items, hasMore, total? }>
  Loads page 1, then the next page whenever the sentinel element comes within
  600px of the viewport. Changing `deps` (filters, tab…) starts over.

  - stale responses are ignored, so quick filter changes can't mix results
  - items are de-duplicated by `id` (safe if the list shifts between pages)
  - one request at a time; a failed page shows a retry instead of looping
  - patch(id, fn) / remove(id) update the list in place, keeping scroll position
*/

const mergeById = (a, b) => {
  const seen = new Set(a.map((x) => x.id));
  return [...a, ...b.filter((x) => !seen.has(x.id))];
};

const FRESH = { items: [], page: 0, hasMore: true, total: null, loading: true, loadingMore: false, error: "", errorCode: "", sessionEnded: false };

export function useInfiniteList(fetchPage, deps = []) {
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const [s, setS] = useState(FRESH);
  const stateRef = useRef(s);
  stateRef.current = s;

  const gen = useRef(0);
  const busy = useRef(false);

  const run = useCallback(async (page, reset) => {
    if (reset) {
      gen.current += 1; // invalidates anything still in flight
      busy.current = false;
    }
    if (busy.current) return;
    busy.current = true;

    const mine = gen.current;
    setS((prev) => (reset ? FRESH : { ...prev, loadingMore: true, error: "", errorCode: "" }));

    try {
      const r = await fetchRef.current(page);
      if (mine !== gen.current) return;
      setS((prev) => ({
        ...FRESH,
        items: reset ? r.items : mergeById(prev.items, r.items),
        page,
        hasMore: Boolean(r.hasMore),
        total: r.total ?? prev.total,
        loading: false,
      }));
    } catch (e) {
      if (mine !== gen.current) return;
      setS((prev) => ({ ...prev, loading: false, loadingMore: false, error: errMsg(e), errorCode: errCode(e) || "", sessionEnded: isSessionError(e) }));
    } finally {
      if (mine === gen.current) busy.current = false;
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { run(1, true); }, deps);

  const loadMore = useCallback(() => {
    const c = stateRef.current;
    if (c.hasMore && !c.loading && !c.loadingMore && !c.error) run(c.page + 1, false);
  }, [run]);

  const retry = useCallback(() => {
    const c = stateRef.current;
    run(c.page + 1, c.page === 0);
  }, [run]);

  const reload = useCallback(() => run(1, true), [run]);

  // The sentinel: an element at the end of the list.
  const [node, setNode] = useState(null);
  useEffect(() => {
    if (!node || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && loadMore(), { rootMargin: "600px 0px" });
    io.observe(node);
    // re-created after each page so a still-visible sentinel keeps loading
    return () => io.disconnect();
  }, [node, loadMore, s.items.length, s.hasMore, s.loadingMore]);

  const patch = useCallback((id, change) => setS((prev) => ({ ...prev, items: prev.items.map((x) => (x.id === id ? { ...x, ...(typeof change === "function" ? change(x) : change) } : x)) })), []);
  const remove = useCallback((id) => setS((prev) => ({ ...prev, items: prev.items.filter((x) => x.id !== id), total: prev.total == null ? prev.total : Math.max(0, prev.total - 1) })), []);

  return { ...s, sentinelRef: setNode, loadMore, retry, reload, patch, remove };
}

/* Shown under a list: spinner while loading more, retry on error, a friendly end. */
export function InfiniteFooter({ list, endLabel = "You're all caught up" }) {
  const { sentinelRef, loadingMore, hasMore, error, items, retry, loading } = list;
  if (loading) return null;

  return (
    <div className="py-8 text-center">
      {hasMore && !error && <div ref={sentinelRef} aria-hidden className="h-px" />}

      {loadingMore && (
        <p role="status" className="inline-flex items-center gap-2 text-sm text-stone-500 dk:text-[#b9a79c]">
          <Loader2 className="h-4 w-4 animate-spin text-orange-600" aria-hidden /> Loading more…
        </p>
      )}

      {error && items.length > 0 && (
        <div role="alert" className="space-y-3">
          <p className="text-sm text-rose-600 dk:text-rose-300">Couldn't load more. {error}</p>
          <Button size="sm" variant="outline" onClick={retry}>Try again</Button>
        </div>
      )}

      {!hasMore && !error && items.length > 0 && <p className="text-sm text-stone-400 dk:text-[#8f7c70]">{endLabel}</p>}
    </div>
  );
}

/* Grey placeholder cards shown while the first page loads. */
export function CardSkeletons({ count = 6, className }) {
  return (
    <div className={cx("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse rounded-2xl border border-[#f0ded0] bg-white p-5 dk:border-[#443127] dk:bg-[#241b15]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-orange-100 dk:bg-[#35261e]" />
            <div className="flex-1 space-y-2"><div className="h-3.5 w-2/3 rounded bg-stone-200 dk:bg-[#35261e]" /><div className="h-3 w-1/3 rounded bg-stone-100 dk:bg-[#2c211b]" /></div>
          </div>
          <div className="mt-5 space-y-2"><div className="h-3 rounded bg-stone-100 dk:bg-[#2c211b]" /><div className="h-3 w-5/6 rounded bg-stone-100 dk:bg-[#2c211b]" /><div className="h-3 w-2/3 rounded bg-stone-100 dk:bg-[#2c211b]" /></div>
          <div className="mt-5 flex gap-2"><div className="h-6 w-14 rounded-md bg-stone-100 dk:bg-[#2c211b]" /><div className="h-6 w-16 rounded-md bg-stone-100 dk:bg-[#2c211b]" /></div>
          <div className="mt-6 h-10 rounded-xl bg-stone-200 dk:bg-[#35261e]" />
        </div>
      ))}
    </div>
  );
}
