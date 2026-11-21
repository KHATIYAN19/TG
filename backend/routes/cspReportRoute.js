import express from "express";

/*
  CSP VIOLATION REPORTS   POST /api/csp-report

  The site ships a strict Content-Security-Policy in REPORT-ONLY mode (client/vercel.json). Browsers POST a
  small JSON report here whenever a page loads something the policy would block. Read these logs (search
  "[csp]") for a week or two, add any legitimate origin to the policy, then switch the header from
  Content-Security-Policy-Report-Only to Content-Security-Policy to enforce it.

  - Always answers 204: a report endpoint must never fail loudly or slow the page down.
  - Logs at most MAX_PER_MINUTE distinct reports per minute (one buggy page can fire hundreds).
  - Logs only the fields needed to fix the policy; no cookies or request bodies.
*/

const router = express.Router();

const MAX_PER_MINUTE = 30;
let windowStart = Date.now();
let loggedThisWindow = 0;
const seen = new Set();

const clip = (value, max = 300) => String(value ?? "").slice(0, max);

// Strip the query string: it can carry tokens or personal data.
const noQuery = (value) => clip(value).split(/[?#]/)[0];

const normalise = (raw) => {
  // Legacy "report-uri" format: { "csp-report": { ... } }
  const r = raw?.["csp-report"] || raw?.body || raw || {};
  return {
    directive: clip(r["effective-directive"] || r.effectiveDirective || r["violated-directive"], 80),
    blocked: noQuery(r["blocked-uri"] || r.blockedURL),
    page: noQuery(r["document-uri"] || r.documentURL),
    source: noQuery(r["source-file"] || r.sourceFile),
    line: Number(r["line-number"] || r.lineNumber) || undefined,
    disposition: clip(r.disposition, 20),
  };
};

router.post(
  "/",
  express.json({
    limit: "16kb",
    type: ["application/csp-report", "application/reports+json", "application/json"],
  }),
  (req, res) => {
    try {
      const now = Date.now();
      if (now - windowStart > 60_000) {
        windowStart = now;
        loggedThisWindow = 0;
        seen.clear();
      }

      const reports = Array.isArray(req.body) ? req.body.slice(0, 20) : [req.body];

      for (const raw of reports) {
        if (loggedThisWindow >= MAX_PER_MINUTE) break;
        const report = normalise(raw);
        if (!report.directive && !report.blocked) continue;
        const key = `${report.directive}|${report.blocked}|${report.page}`;
        if (seen.has(key)) continue;
        seen.add(key);
        loggedThisWindow += 1;
        console.warn("[csp]", JSON.stringify(report));
      }
    } catch {
      /* never fail a report */
    }
    return res.status(204).end();
  }
);

export default router;
