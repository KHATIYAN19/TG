import { useMemo, useState } from "react";
import { Funnel, Intersect, Rows } from "@phosphor-icons/react";

import { Section, cx } from "./bookKit";
import CsBookPage, { Seg } from "./csBook/CsBookPage";
import { DEPARTMENTS, EMPLOYEES, ISOLATION, SQL_BOOK } from "./csBook/sqlData";

/*
  /book/database/sql: SQL & Database Interview Handbook.
  Shared CS-book frame (CsBookPage) + three labs on one small employees / departments dataset:
    1. Execution order: step FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT and see the rows at each step.
    2. Joins: INNER, LEFT, RIGHT, FULL and anti-join, with the NULLs they produce.
    3. Ranking: ROW_NUMBER vs RANK vs DENSE_RANK (and LAG) on salaries with a tie, with or without PARTITION BY.
  (sqlStyles and CopyButton, used by the AWS and GCP pages, now live in sqlShared.jsx.)
*/

const money = (n) => (n == null ? "NULL" : n.toLocaleString("en-IN", { maximumFractionDigits: 2 }));
const deptName = (id) => DEPARTMENTS.find((d) => d.id === id)?.name;

/* a small result table; rows marked `out` are shown struck through (removed by this step) */
function ResultTable({ cols, rows, label }) {
  return (
    <div className="sq-table" role="region" aria-label={label} tabIndex={0}>
      <table>
        <thead><tr>{cols.map((c) => <th key={c.key} scope="col" className={c.num ? "is-num" : undefined}>{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r._k ?? i} className={cx(r._out && "is-out")}>
              {cols.map((c) => {
                const v = c.get ? c.get(r) : r[c.key];
                return <td key={c.key} className={cx(v == null && "is-null", c.num && "is-num")}>{v == null ? "NULL" : v}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =====================================================================
   1. LOGICAL EXECUTION ORDER
===================================================================== */
const QUERY_LINES = [
  ["select", "SELECT dept_id, COUNT(*) AS headcount,"],
  ["select", "       AVG(salary) AS avg_salary"],
  ["from", "FROM employees"],
  ["where", "WHERE salary >= 70000"],
  ["group", "GROUP BY dept_id"],
  ["having", "HAVING COUNT(*) >= 2"],
  ["order", "ORDER BY avg_salary DESC"],
  ["limit", "LIMIT 1;"],
];

const STEPS = [
  { id: "from", label: "FROM", note: "Start with every row of the table. Joins happen here too, before anything is filtered." },
  { id: "where", label: "WHERE", note: "Row filter, before grouping. Arjun (60,000) is removed. WHERE cannot use COUNT or AVG, because groups do not exist yet." },
  { id: "group", label: "GROUP BY", note: "Rows collapse into one row per dept_id. From here on you can only use grouped columns and aggregates." },
  { id: "having", label: "HAVING", note: "Group filter, after aggregation. Department 3 has one employee, so its group is removed." },
  { id: "select", label: "SELECT", note: "Now the output columns and aliases are computed. That is why WHERE cannot use the alias avg_salary, but ORDER BY can." },
  { id: "order", label: "ORDER BY", note: "Sort the result. ORDER BY runs after SELECT, so it can use aliases like avg_salary." },
  { id: "limit", label: "LIMIT", note: "Finally keep only the first row. LIMIT without ORDER BY would return an arbitrary row." },
];

function executionStep(id) {
  const empCols = [{ key: "id", label: "id", num: true }, { key: "name", label: "name" }, { key: "dept_id", label: "dept_id", num: true }, { key: "salary", label: "salary", num: true, get: (r) => money(r.salary) }];
  const kept = EMPLOYEES.filter((e) => e.salary >= 70000);
  if (id === "from") return { cols: empCols, rows: EMPLOYEES.map((e) => ({ ...e, _k: e.id })) };
  if (id === "where") return { cols: empCols, rows: EMPLOYEES.map((e) => ({ ...e, _k: e.id, _out: e.salary < 70000 })) };

  const groups = [...new Set(kept.map((e) => e.dept_id))].map((d) => {
    const members = kept.filter((e) => e.dept_id === d);
    return { _k: d, dept_id: d, members: members.map((m) => m.name).join(", "), headcount: members.length, avg: members.reduce((s, m) => s + m.salary, 0) / members.length };
  });
  const groupCols = [{ key: "dept_id", label: "dept_id", num: true }, { key: "members", label: "rows in the group" }];
  if (id === "group") return { cols: groupCols, rows: groups };
  if (id === "having") return { cols: [...groupCols, { key: "headcount", label: "COUNT(*)", num: true }], rows: groups.map((g) => ({ ...g, _out: g.headcount < 2 })) };

  const outCols = [{ key: "dept_id", label: "dept_id", num: true }, { key: "headcount", label: "headcount", num: true }, { key: "avg", label: "avg_salary", num: true, get: (r) => money(r.avg) }];
  const selected = groups.filter((g) => g.headcount >= 2);
  if (id === "select") return { cols: outCols, rows: selected };
  const sorted = [...selected].sort((a, b) => b.avg - a.avg);
  if (id === "order") return { cols: outCols, rows: sorted };
  return { cols: outCols, rows: sorted.map((r, i) => ({ ...r, _out: i >= 1 })) };
}

function ExecutionLab() {
  const [k, setK] = useState(0);
  const step = STEPS[k];
  const res = useMemo(() => executionStep(step.id), [step.id]);
  return (
    <div className="cs-lab">
      <div className="cs-card">
        <p className="cs-card-k"><Funnel size={16} weight="bold" aria-hidden />The query, as written</p>
        <pre className="sq-query" aria-label="SQL query">
          {QUERY_LINES.map(([id, text], i) => <code key={i} className={cx(id === step.id && "is-on")}>{text}</code>)}
        </pre>
        <p className="cs-hint">Written order starts with SELECT. The database runs it in a different order: step through it.</p>
      </div>
      <div className="cs-card" aria-live="polite">
        <ol className="sq-steps" aria-label="Logical execution order">
          {STEPS.map((s, i) => (
            <li key={s.id}><button type="button" aria-pressed={i === k} className={cx(i < k && "is-done")} onClick={() => setK(i)}><span className="hb-mono">{i + 1}</span>{s.label}</button></li>
          ))}
        </ol>
        <p className="sq-note"><b>{step.label}.</b> {step.note}</p>
        <ResultTable cols={res.cols} rows={res.rows} label={`Rows after ${step.label}`} />
        <div className="hb-row">
          <button type="button" className="hb-btn hb-btn-ghost" onClick={() => setK((x) => Math.max(0, x - 1))} disabled={k === 0}>Previous</button>
          <button type="button" className="hb-btn hb-btn-primary" onClick={() => setK((x) => (x + 1) % STEPS.length)}>{k === STEPS.length - 1 ? "Start again" : `Next: ${STEPS[k + 1].label}`}</button>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   2. JOINS
===================================================================== */
const JOINS = [
  ["inner", "INNER"], ["left", "LEFT"], ["right", "RIGHT"], ["full", "FULL OUTER"], ["anti", "Anti-join"],
];
const JOIN_SQL = {
  inner: "SELECT e.name, d.name AS dept\nFROM employees e\nINNER JOIN departments d ON d.id = e.dept_id;",
  left: "SELECT e.name, d.name AS dept\nFROM employees e\nLEFT JOIN departments d ON d.id = e.dept_id;",
  right: "SELECT e.name, d.name AS dept\nFROM employees e\nRIGHT JOIN departments d ON d.id = e.dept_id;",
  full: "SELECT e.name, d.name AS dept\nFROM employees e\nFULL OUTER JOIN departments d ON d.id = e.dept_id;",
  anti: "-- departments with no employees\nSELECT d.name AS dept\nFROM departments d\nWHERE NOT EXISTS (\n  SELECT 1 FROM employees e WHERE e.dept_id = d.id\n);",
};
const JOIN_NOTE = {
  inner: "Only matching pairs. Arjun (no department) and Research (no employees) both disappear.",
  left: "Every employee, matched or not. Arjun stays, with NULL for the department.",
  right: "Every department. Research appears with a NULL employee. Most teams rewrite this as a LEFT JOIN with the tables swapped.",
  full: "Everything from both sides: Arjun with a NULL department and Research with a NULL employee.",
  anti: "Rows with no match. Use NOT EXISTS or LEFT JOIN … WHERE e.id IS NULL. NOT IN breaks as soon as the subquery returns a NULL.",
};

function joinRows(type) {
  const match = (e) => DEPARTMENTS.find((d) => d.id === e.dept_id);
  const used = new Set(EMPLOYEES.map((e) => e.dept_id));
  const lonelyDepts = DEPARTMENTS.filter((d) => !used.has(d.id));
  if (type === "anti") return lonelyDepts.map((d) => ({ _k: `d${d.id}`, emp: undefined, dept: d.name }));
  const pairs = EMPLOYEES.map((e) => ({ _k: `e${e.id}`, emp: e.name, dept: match(e)?.name ?? null }));
  if (type === "inner") return pairs.filter((p) => p.dept !== null);
  if (type === "left") return pairs;
  const rightOnly = lonelyDepts.map((d) => ({ _k: `d${d.id}`, emp: null, dept: d.name }));
  if (type === "right") return [...pairs.filter((p) => p.dept !== null), ...rightOnly];
  return [...pairs, ...rightOnly];
}

function JoinLab() {
  const [type, setType] = useState("left");
  const rows = joinRows(type);
  const shownEmp = new Set(rows.map((r) => r.emp).filter(Boolean));
  const shownDept = new Set(rows.map((r) => r.dept).filter(Boolean));
  const cols = type === "anti" ? [{ key: "dept", label: "dept" }] : [{ key: "emp", label: "e.name" }, { key: "dept", label: "dept" }];
  return (
    <div className="cs-lab">
      <div className="cs-card">
        <p className="cs-card-k"><Intersect size={16} weight="bold" aria-hidden />Two tables</p>
        <div className="sq-src">
          <div>
            <p className="sq-src-h">employees</p>
            <ul>{EMPLOYEES.map((e) => <li key={e.id} className={cx(shownEmp.has(e.name) && "is-in")}><span>{e.name}</span><small className="hb-mono">{e.dept_id ?? "NULL"}</small></li>)}</ul>
          </div>
          <div>
            <p className="sq-src-h">departments</p>
            <ul>{DEPARTMENTS.map((d) => <li key={d.id} className={cx(shownDept.has(d.name) && "is-in")}><span>{d.name}</span><small className="hb-mono">{d.id}</small></li>)}</ul>
          </div>
        </div>
        <p className="cs-hint">Highlighted rows reach the result. Arjun has no department; Research has no employees.</p>
      </div>
      <div className="cs-card" aria-live="polite">
        <Seg label="Join type" options={JOINS} value={type} onChange={setType} />
        <pre className="sq-query is-small"><code>{JOIN_SQL[type]}</code></pre>
        <p className="sq-note"><b>{rows.length} rows.</b> {JOIN_NOTE[type]}</p>
        <ResultTable cols={cols} rows={rows} label={`${type} join result`} />
      </div>
    </div>
  );
}

/* =====================================================================
   3. RANKING WINDOW FUNCTIONS
===================================================================== */
function RankLab() {
  const [partition, setPartition] = useState(false);
  const rows = useMemo(() => {
    const sorted = [...EMPLOYEES].sort((a, b) => (partition ? (a.dept_id ?? 99) - (b.dept_id ?? 99) : 0) || b.salary - a.salary || a.id - b.id);
    const out = [];
    let prev = null; let rn = 0; let rk = 0; let drk = 0; let prevSal = null;
    sorted.forEach((e) => {
      const key = partition ? e.dept_id : "all";
      if (key !== prev) { rn = 0; rk = 0; drk = 0; prevSal = null; prev = key; }
      rn += 1;
      if (e.salary !== prevSal) { rk = rn; drk += 1; }
      out.push({ ...e, _k: e.id, dept: deptName(e.dept_id) ?? null, rn, rk, drk, lag: prevSal, tie: e.salary === prevSal });
      prevSal = e.salary;
    });
    return out;
  }, [partition]);

  const over = partition ? "PARTITION BY dept_id ORDER BY salary DESC" : "ORDER BY salary DESC";
  return (
    <div className="cs-card">
      <div className="sq-rank-head">
        <p className="cs-card-k"><Rows size={16} weight="bold" aria-hidden />ROW_NUMBER vs RANK vs DENSE_RANK</p>
        <Seg label="Window" options={[["all", "Whole table"], ["dept", "PARTITION BY dept"]]} value={partition ? "dept" : "all"} onChange={(v) => setPartition(v === "dept")} />
      </div>
      <pre className="sq-query is-small"><code>{`SELECT name, dept_id, salary,\n  ROW_NUMBER() OVER (${over}) AS rn,\n  RANK()       OVER (${over}) AS rnk,\n  DENSE_RANK() OVER (${over}) AS drnk,\n  LAG(salary)  OVER (${over}) AS prev_salary\nFROM employees;`}</code></pre>
      <div className="sq-table sq-rank" role="region" aria-label="Ranking results" tabIndex={0}>
        <table>
          <thead><tr><th scope="col">name</th><th scope="col">dept</th><th scope="col" className="is-num">salary</th><th scope="col" className="is-num">rn</th><th scope="col" className="is-num">rnk</th><th scope="col" className="is-num">drnk</th><th scope="col" className="is-num">prev_salary</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._k} className={cx(r.rn === 1 && partition && "is-first")}>
                <td>{r.name}</td><td className={cx(r.dept == null && "is-null")}>{r.dept ?? "NULL"}</td><td className="is-num">{money(r.salary)}</td>
                <td className="is-num">{r.rn}</td><td className={cx("is-num", r.tie && "is-tie")}>{r.rk}</td><td className={cx("is-num", r.tie && "is-tie")}>{r.drk}</td>
                <td className={cx("is-num", r.lag == null && "is-null")}>{money(r.lag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cs-hint">Ravi and Neha tie at 1,65,000: ROW_NUMBER still splits them, RANK gives both 2 and skips to 4, DENSE_RANK gives both 2 and continues with 3. That is why the Nth-highest salary uses DENSE_RANK.</p>
    </div>
  );
}

export default function SqlInterviewHandbook() {
  return (
    <CsBookPage book={SQL_BOOK}>
      <Section id="try" eyebrow="Try it free" title="Three SQL labs, running on real rows" lead="One tiny employees and departments dataset. Step through how a query really executes, flip between join types, and see exactly how ranking functions treat a tie." tint>
        <div className="cs-labs">
          <ExecutionLab />
          <JoinLab />
          <RankLab />
          <div className="hb-cmp cs-stack" role="region" aria-label="Isolation levels and the anomalies they prevent" tabIndex={0}>
            <table>
              <thead><tr><th scope="col">Isolation level</th><th scope="col">Dirty read</th><th scope="col">Non-repeatable read</th><th scope="col">Phantom read</th><th scope="col">Note</th></tr></thead>
              <tbody>
                {ISOLATION.map(([lvl, a, b, c, note]) => (
                  <tr key={lvl}>
                    <th scope="row" className="hb-mono">{lvl}</th>
                    {[["Dirty read", a], ["Non-repeatable", b], ["Phantom", c]].map(([k, v]) => <td key={k} data-label={k}><span className={cx("sq-yn", v === "Prevented" ? "ok" : "bad")}>{v}</span></td>)}
                    <td data-label="Note">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Section>
    </CsBookPage>
  );
}
