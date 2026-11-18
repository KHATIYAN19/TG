import { useMemo, useState } from "react";
import { ArrowCounterClockwise, Cpu, Memory, Plus, Trash } from "@phosphor-icons/react";

import { Section, cx } from "./bookKit";
import CsBookPage, { Seg } from "./csBook/CsBookPage";
import { OS_BOOK, SCHEDULERS } from "./csBook/osData";

/*
  /books/operating-systems: Operating Systems, The Placement Handbook.
  Shared CS-book frame (CsBookPage) + two hands-on labs that only this book has:
    1. CPU scheduler: edit processes, pick FCFS / SJF / SRTF / Priority / Round Robin, get the Gantt chart,
       CT / TAT / WT / RT per process and how every algorithm compares on the same input.
    2. Page replacement: a reference string and a frame count, stepped through FIFO / LRU / Optimal.
*/

/* =====================================================================
   CPU SCHEDULING
===================================================================== */
const ALGOS = [["fcfs", "FCFS"], ["sjf", "SJF"], ["srtf", "SRTF"], ["prio", "Priority"], ["rr", "Round Robin"]];
const ALGO_NAME = Object.fromEntries(ALGOS);
const SAMPLE = [
  { arrival: 0, burst: 5, priority: 3 },
  { arrival: 1, burst: 3, priority: 1 },
  { arrival: 2, burst: 1, priority: 4 },
  { arrival: 3, burst: 2, priority: 2 },
];
const MAX_P = 8;
const cmpKeys = (a, b) => { for (let i = 0; i < a.length; i += 1) if (a[i] !== b[i]) return a[i] - b[i]; return 0; };

/* returns the Gantt segments (id null = CPU idle) and per-process metrics */
function simulate(procs, algo, quantum) {
  const n = procs.length;
  const rem = procs.map((p) => p.burst);
  const done = Array(n).fill(false);
  const ct = Array(n).fill(0);
  const first = Array(n).fill(null);
  const segs = [];
  const run = (id, s, e) => {
    if (e <= s) return;
    const last = segs[segs.length - 1];
    if (last && last.id === id && last.end === s) last.end = e; else segs.push({ id, start: s, end: e });
    if (id !== null && first[id] === null) first[id] = s;
  };
  let t = 0;
  let finished = 0;
  const nextArrival = () => Math.min(...procs.filter((_, i) => !done[i]).map((p) => p.arrival));

  if (algo === "rr") {
    const order = procs.map((_, i) => i).sort((a, b) => procs[a].arrival - procs[b].arrival || a - b);
    const queue = [];
    let k = 0;
    const admit = () => { while (k < n && procs[order[k]].arrival <= t) { queue.push(order[k]); k += 1; } };
    admit();
    while (finished < n) {
      if (!queue.length) { const nt = procs[order[k]].arrival; run(null, t, nt); t = nt; admit(); continue; }
      const i = queue.shift();
      const slice = Math.min(quantum, rem[i]);
      run(i, t, t + slice); t += slice; rem[i] -= slice;
      admit(); // arrivals during the slice join before the preempted process
      if (rem[i] > 0) queue.push(i); else { done[i] = true; ct[i] = t; finished += 1; }
    }
  } else if (algo === "srtf") {
    while (finished < n) {
      const ready = procs.map((_, i) => i).filter((i) => !done[i] && procs[i].arrival <= t);
      if (!ready.length) { const nt = nextArrival(); run(null, t, nt); t = nt; continue; }
      ready.sort((a, b) => cmpKeys([rem[a], procs[a].arrival, a], [rem[b], procs[b].arrival, b]));
      const i = ready[0];
      run(i, t, t + 1); t += 1; rem[i] -= 1;
      if (rem[i] === 0) { done[i] = true; ct[i] = t; finished += 1; }
    }
  } else {
    const key = {
      fcfs: (i) => [procs[i].arrival, i],
      sjf: (i) => [procs[i].burst, procs[i].arrival, i],
      prio: (i) => [procs[i].priority, procs[i].arrival, i],
    }[algo];
    while (finished < n) {
      const ready = procs.map((_, i) => i).filter((i) => !done[i] && procs[i].arrival <= t);
      if (!ready.length) { const nt = nextArrival(); run(null, t, nt); t = nt; continue; }
      ready.sort((a, b) => cmpKeys(key(a), key(b)));
      const i = ready[0];
      run(i, t, t + procs[i].burst); t += procs[i].burst;
      done[i] = true; ct[i] = t; finished += 1;
    }
  }

  const rows = procs.map((p, i) => {
    const tat = ct[i] - p.arrival;
    return { i, ...p, ct: ct[i], tat, wt: tat - p.burst, rt: first[i] - p.arrival };
  });
  const avg = (k) => rows.reduce((s, r) => s + r[k], 0) / n;
  return { segs, rows, avgTat: avg("tat"), avgWt: avg("wt"), avgRt: avg("rt"), switches: segs.filter((s) => s.id !== null).length - 1 };
}

const fmt = (x) => (Number.isInteger(x) ? String(x) : x.toFixed(2));
const clampInt = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));

function SchedulerLab() {
  const [procs, setProcs] = useState(SAMPLE);
  const [algo, setAlgo] = useState("rr");
  const [quantum, setQuantum] = useState(2);

  const res = useMemo(() => simulate(procs, algo, quantum), [procs, algo, quantum]);
  const all = useMemo(() => ALGOS.map(([id]) => ({ id, wt: simulate(procs, id, quantum).avgWt })), [procs, quantum]);
  const best = Math.min(...all.map((a) => a.wt));
  const worst = Math.max(...all.map((a) => a.wt), 0.0001);
  const total = res.segs[res.segs.length - 1]?.end || 1;

  const edit = (i, field, v) => setProcs((ps) => ps.map((p, j) => (j === i ? { ...p, [field]: field === "burst" ? clampInt(v, 1, 30) : clampInt(v, 0, field === "priority" ? 9 : 50) } : p)));
  const add = () => setProcs((ps) => (ps.length >= MAX_P ? ps : [...ps, { arrival: Math.min(50, (ps[ps.length - 1]?.arrival ?? 0) + 1), burst: 3, priority: 2 }]));
  const remove = (i) => setProcs((ps) => (ps.length <= 1 ? ps : ps.filter((_, j) => j !== i)));

  return (
    <div className="cs-labs">
      <div className="cs-lab">
        <div className="cs-card">
          <p className="cs-card-k"><Cpu size={16} weight="bold" aria-hidden />Processes</p>
          <div className="os-ptable" role="table" aria-label="Processes">
            <div className="os-prow os-phead" role="row">
              <span role="columnheader">PID</span><span role="columnheader">Arrival</span><span role="columnheader">Burst</span>
              <span role="columnheader" className={algo === "prio" ? "" : "is-off"}>Priority</span><span role="columnheader"><span className="hb-sr">Remove</span></span>
            </div>
            {procs.map((p, i) => (
              <div key={i} className="os-prow" role="row">
                <span role="cell"><i className={`os-dot os-c${i}`} aria-hidden />P{i + 1}</span>
                <span role="cell"><input type="number" inputMode="numeric" min={0} max={50} value={p.arrival} onChange={(e) => edit(i, "arrival", e.target.value)} aria-label={`P${i + 1} arrival time`} /></span>
                <span role="cell"><input type="number" inputMode="numeric" min={1} max={30} value={p.burst} onChange={(e) => edit(i, "burst", e.target.value)} aria-label={`P${i + 1} burst time`} /></span>
                <span role="cell" className={algo === "prio" ? "" : "is-off"}><input type="number" inputMode="numeric" min={0} max={9} value={p.priority} onChange={(e) => edit(i, "priority", e.target.value)} aria-label={`P${i + 1} priority`} disabled={algo !== "prio"} /></span>
                <span role="cell"><button type="button" className="os-icon-btn" onClick={() => remove(i)} disabled={procs.length <= 1} aria-label={`Remove P${i + 1}`}><Trash size={15} weight="bold" /></button></span>
              </div>
            ))}
          </div>
          <div className="hb-row">
            <button type="button" className="hb-btn hb-btn-ghost" onClick={add} disabled={procs.length >= MAX_P}><Plus size={15} weight="bold" aria-hidden />Add process</button>
            <button type="button" className="hb-btn hb-btn-ghost" onClick={() => setProcs(SAMPLE)}><ArrowCounterClockwise size={15} weight="bold" aria-hidden />Reset</button>
          </div>
          <p className="cs-hint">Times in ms. For Priority, a lower number runs first. Ties go to the earlier arrival.</p>
        </div>

        <div className="cs-card" aria-live="polite">
          <Seg label="Scheduling algorithm" options={ALGOS} value={algo} onChange={setAlgo} />
          {algo === "rr" && (
            <label className="os-quantum">Time quantum
              <input type="range" min={1} max={8} value={quantum} onChange={(e) => setQuantum(Number(e.target.value))} />
              <b className="hb-mono">{quantum}</b>
            </label>
          )}

          <div>
            <p className="cs-card-k" style={{ marginBottom: 8 }}>Gantt chart · {ALGO_NAME[algo]}</p>
            <div className="os-gantt" role="img" aria-label={`Gantt chart: ${res.segs.map((s) => `${s.id === null ? "idle" : `P${s.id + 1}`} ${s.start} to ${s.end}`).join(", ")}`}>
              {res.segs.map((s) => (
                <span key={`${s.start}-${s.id}`} className={s.id === null ? "is-idle" : `os-c${s.id}`} style={{ flexGrow: s.end - s.start }} title={`${s.id === null ? "Idle" : `P${s.id + 1}`}: ${s.start}–${s.end}`}>
                  {(s.end - s.start) / total > 0.045 && (s.id === null ? "idle" : `P${s.id + 1}`)}
                </span>
              ))}
            </div>
            <div className="os-ticks" aria-hidden>
              {res.segs.map((s) => s.start).concat(total).filter((x, k, arr) => k === 0 || x === total || ((x - arr[k - 1]) / total > 0.04 && (total - x) / total > 0.04))
                .map((x) => <span key={`t${x}`} style={{ left: `${(x / total) * 100}%` }}>{x}</span>)}
            </div>
          </div>

          <div className="os-res" role="region" aria-label="Results per process" tabIndex={0}>
            <table>
              <thead><tr><th scope="col">PID</th><th scope="col">AT</th><th scope="col">BT</th><th scope="col">CT</th><th scope="col">TAT</th><th scope="col">WT</th><th scope="col">RT</th></tr></thead>
              <tbody>
                {res.rows.map((r) => <tr key={r.i}><th scope="row"><i className={`os-dot os-c${r.i}`} aria-hidden />P{r.i + 1}</th><td>{r.arrival}</td><td>{r.burst}</td><td>{r.ct}</td><td>{r.tat}</td><td>{r.wt}</td><td>{r.rt}</td></tr>)}
              </tbody>
              <tfoot><tr><th scope="row">Avg</th><td /><td /><td /><td>{fmt(res.avgTat)}</td><td>{fmt(res.avgWt)}</td><td>{fmt(res.avgRt)}</td></tr></tfoot>
            </table>
          </div>
          <p className="cs-hint">CT completion · TAT = CT − AT · WT = TAT − BT · RT = first run − AT · {Math.max(res.switches, 0)} context switches</p>
        </div>
      </div>

      <div className="cs-card">
        <p className="cs-card-k">Same processes, every algorithm · average waiting time</p>
        <ul className="os-bars">
          {all.map((a) => (
            <li key={a.id} className={cx(a.id === algo && "is-on", a.wt === best && "is-best")}>
              <button type="button" onClick={() => setAlgo(a.id)}>{ALGO_NAME[a.id]}{a.id === "rr" && <small> q={quantum}</small>}</button>
              <span className="os-bar"><em style={{ width: `${Math.max(4, (a.wt / worst) * 100)}%` }} /></span>
              <b className="hb-mono">{fmt(a.wt)}</b>
              {a.wt === best && <span className="os-best">lowest</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* =====================================================================
   PAGE REPLACEMENT
===================================================================== */
const PR_ALGOS = [["fifo", "FIFO"], ["lru", "LRU"], ["opt", "Optimal"]];

function pageReplace(refs, frames, algo) {
  const slots = Array(frames).fill(null);
  const loaded = Array(frames).fill(-1); // when the page in the slot was loaded (FIFO)
  const used = Array(frames).fill(-1);   // when it was last used (LRU)
  const steps = [];
  let faults = 0;
  refs.forEach((p, t) => {
    let slot = slots.indexOf(p);
    const hitNow = slot !== -1;
    if (hitNow) {
      used[slot] = t;
    } else {
      faults += 1;
      slot = slots.indexOf(null);
      if (slot === -1) {
        if (algo === "fifo") slot = loaded.indexOf(Math.min(...loaded));
        else if (algo === "lru") slot = used.indexOf(Math.min(...used));
        else {
          const next = slots.map((q) => { const k = refs.indexOf(q, t + 1); return k === -1 ? Infinity : k; });
          slot = next.indexOf(Math.max(...next));
        }
      }
      slots[slot] = p; loaded[slot] = t; used[slot] = t;
    }
    steps.push({ p, hit: hitNow, slot, frames: [...slots] });
  });
  return { steps, faults, hits: refs.length - faults };
}

function PagingLab() {
  const [text, setText] = useState("7 0 1 2 0 3 0 4 2 3 0 3 2");
  const [frames, setFrames] = useState(3);
  const [algo, setAlgo] = useState("lru");
  const refs = useMemo(() => text.split(/[\s,]+/).filter(Boolean).map(Number).filter((x) => Number.isInteger(x) && x >= 0 && x < 100).slice(0, 30), [text]);
  const res = useMemo(() => pageReplace(refs, frames, algo), [refs, frames, algo]);
  const counts = useMemo(() => PR_ALGOS.map(([id, name]) => ({ id, name, f: pageReplace(refs, frames, id).faults })), [refs, frames]);

  return (
    <div className="cs-card">
      <p className="cs-card-k"><Memory size={16} weight="bold" aria-hidden />Page replacement</p>
      <div className="os-pr-controls">
        <label className="os-pr-refs">
          <span>Reference string</span>
          <input className="cs-input" value={text} onChange={(e) => setText(e.target.value)} inputMode="numeric" spellCheck="false" autoComplete="off" />
        </label>
        <label className="os-quantum">Frames
          <input type="range" min={1} max={6} value={frames} onChange={(e) => setFrames(Number(e.target.value))} />
          <b className="hb-mono">{frames}</b>
        </label>
        <Seg label="Replacement algorithm" options={PR_ALGOS} value={algo} onChange={setAlgo} />
      </div>

      {refs.length === 0 ? <p className="cs-err">Type page numbers separated by spaces, e.g. 1 2 3 4 1 2 5.</p> : (
        <>
          <div className="os-pr" role="region" aria-label="Frames after each reference" tabIndex={0}>
            <table>
              <thead><tr><th scope="col"><span className="hb-sr">Frame</span></th>{res.steps.map((s, t) => <th key={t} scope="col">{s.p}</th>)}</tr></thead>
              <tbody>
                {Array.from({ length: frames }, (_, f) => (
                  <tr key={f}>
                    <th scope="row">F{f + 1}</th>
                    {res.steps.map((s, t) => <td key={t} className={cx(!s.hit && s.slot === f && "is-new", s.hit && s.slot === f && "is-hit")}>{s.frames[f] ?? ""}</td>)}
                  </tr>
                ))}
                <tr className="os-pr-flag"><th scope="row"><span className="hb-sr">Result</span></th>{res.steps.map((s, t) => <td key={t} className={s.hit ? "h" : "f"}>{s.hit ? "H" : "F"}</td>)}</tr>
              </tbody>
            </table>
          </div>
          <dl className="cs-kv os-pr-kv">
            <div className="is-brand"><dt>Page faults</dt><dd>{res.faults}</dd></div>
            <div><dt>Hits</dt><dd>{res.hits}</dd></div>
            <div><dt>Hit ratio</dt><dd>{((res.hits / refs.length) * 100).toFixed(1)}%</dd></div>
            <div><dt>Compare</dt><dd>{counts.map((c) => `${c.name} ${c.f}`).join(" · ")}</dd></div>
          </dl>
          <p className="cs-hint">Highlighted cells are pages loaded on a fault. Optimal is the lower bound no real system can reach, because it needs the future. Add a frame under FIFO with “1 2 3 4 1 2 5 1 2 3 4 5” to see Belady&rsquo;s anomaly.</p>
        </>
      )}
    </div>
  );
}

export default function OperatingSystemBook() {
  return (
    <CsBookPage book={OS_BOOK}>
      <Section id="try" eyebrow="Try it free" title="Run the numericals instead of drawing them" lead="Edit the processes and watch the Gantt chart, waiting and turnaround times update. Then step a reference string through FIFO, LRU and Optimal." tint>
        <div className="cs-labs">
          <SchedulerLab />
          <PagingLab />
          <div className="hb-cmp cs-stack" role="region" aria-label="Scheduling algorithms compared" tabIndex={0}>
            <table>
              <thead><tr><th scope="col">Algorithm</th><th scope="col">Type</th><th scope="col">Best for</th><th scope="col">Trade-off</th></tr></thead>
              <tbody>{SCHEDULERS.map(([name, type, ideal, desc]) => <tr key={name}><th scope="row">{name}</th><td data-label="Type">{type}</td><td data-label="Best for">{ideal}</td><td data-label="Trade-off">{desc}</td></tr>)}</tbody>
            </table>
          </div>
        </div>
      </Section>
    </CsBookPage>
  );
}
