import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ListChecks, Sparkle } from "@phosphor-icons/react";

import { errMsg } from "../arena/api";
import { myRequestsPage } from "./api";
import { useApp } from "./appData";
import { ListSkeleton, PageHead, Pager, ReviewItem, Seg, n0, startTarget } from "./parts";
import { Btn } from "./ui";

const LIMIT = 12;
const FILTERS = [["", "All"], ["active", "In progress"], ["done", "Ready"]];

/* Every review, newest first, a page at a time. One call per page; the list keeps itself fresh while any review is still running. */
export default function AppReviews() {
  const { data } = useApp();
  const [state, setState] = useState("");
  const [page, setPage] = useState(1);
  const [list, setList] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let live = true;
    const load = () => myRequestsPage(page, LIMIT, state).then((d) => { if (live) { setList(d); setError(""); } }).catch((e) => { if (live) setError(errMsg(e)); });
    load();
    return () => { live = false; };
  }, [page, state]);

  // something still running on this page: check again every 8 seconds
  const running = list?.items?.some((r) => r.status === "ai_reviewing");
  useEffect(() => {
    if (!running) return undefined;
    const t = setInterval(() => myRequestsPage(page, LIMIT, state).then(setList).catch(() => {}), 8000);
    return () => clearInterval(t);
  }, [running, page, state]);

  const go = (n) => { setPage(n); setList((l) => l && { ...l, items: null }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const pick = (v) => { setState(v); setPage(1); setList(null); };
  const totals = data?.totals;
  const from = list?.items?.length ? (list.page - 1) * list.limit + 1 : 0;
  const to = list?.items ? from + list.items.length - 1 : 0;

  return (
    <>
      <PageHead
        eyebrow={<><ListChecks size={14} weight="bold" aria-hidden />Reviews</>}
        title="All your reviews"
        sub={totals ? `${n0(totals.reviews)} in total${totals.inProgress ? `, ${n0(totals.inProgress)} still in progress` : ""}. Open one to see every score, fix and check.` : "Every review you've started, newest first."}
        actions={<Btn as={Link} to={startTarget(data)}><Sparkle size={16} weight="fill" aria-hidden />Start a review</Btn>}
      />
      <section className="rs-card rs-stack">
        <div className="rs-row between">
          <Seg label="Show" value={state} onChange={pick} options={FILTERS.map(([id, t]) => [id, t])} />
          {list?.items?.length > 0 && <span className="rs-xs rs-subtle">{n0(from)} to {n0(to)} of {n0(list.total)}</span>}
        </div>
        {error && <p role="alert" className="rv-err">{error}</p>}
        {(!list || !list.items) && !error && <ListSkeleton n={4} />}
        {list?.items?.length === 0 && (
          <div className="rs-empty">
            <span className="rs-ico lg" aria-hidden><ListChecks size={24} weight="duotone" /></span>
            <h3 className="rs-h3">{state === "active" ? "Nothing in progress" : state === "done" ? "No finished reviews yet" : "No reviews yet"}</h3>
            <p>{state ? "Try another filter." : "Start a review and it appears here within seconds."}</p>
            {!state && <Btn as={Link} to={startTarget(data)}>Start a review <ArrowRight size={16} weight="bold" aria-hidden /></Btn>}
          </div>
        )}
        {list?.items?.length > 0 && <ul className="rs-list">{list.items.map((r) => <ReviewItem key={r.id} r={r} />)}</ul>}
        {list && <Pager page={list.page} pages={list.pages} onGo={go} />}
      </section>
    </>
  );
}
