/* ==========================================================
   First-party analytics tracker.

   Everything goes to ONE endpoint: POST /api/analytics/track
   with { type, visitorId, sessionId, ... }.

   type: page_view | heartbeat | engagement | event |
         page_exit | session_end
========================================================== */

const BASE_URL = (
  import.meta.env.VITE_BASE_URL ||
  "https://target-trek.onrender.com"
).replace(/\/+$/, "");

const TRACK_URL = `${BASE_URL}/api/analytics/track`;

const VISITOR_KEY = "tt_vid";
const SESSION_KEY = "tt_sid";
const ACTIVITY_KEY = "tt_sat";

const SESSION_IDLE_MS = 30 * 60 * 1000;
const HEARTBEAT_MS = 20 * 1000;
const ENGAGEMENT_MS = 30 * 1000;
const IDLE_AFTER_MS = 30 * 1000;

/* ---------- storage (never throws) ---------- */

const store = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* private mode: fall back to in-memory ids */
    }
  },
};

const memory = {};

const uuid = () =>
  crypto?.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === "x" ? r : (r & 3) | 8).toString(16);
        }
      );

function getVisitorId() {
  let id = store.get(VISITOR_KEY) || memory.visitorId;

  if (!id) {
    id = uuid();
    store.set(VISITOR_KEY, id);
  }

  memory.visitorId = id;
  return id;
}

// A new session starts after 30 minutes without activity.
function getSessionId() {
  const now = Date.now();
  const lastActivity = Number(
    store.get(ACTIVITY_KEY) || memory.activity || 0
  );

  let id = store.get(SESSION_KEY) || memory.sessionId;

  if (!id || now - lastActivity > SESSION_IDLE_MS) {
    id = uuid();
    store.set(SESSION_KEY, id);
    memory.sessionId = id;
  }

  memory.activity = now;
  store.set(ACTIVITY_KEY, String(now));

  return id;
}

function resetSession() {
  const id = uuid();
  store.set(SESSION_KEY, id);
  memory.sessionId = id;
  return id;
}

/* ---------- transport ---------- */

async function send(payload, { beacon = false } = {}) {
  const body = JSON.stringify(payload);

  if (beacon && navigator.sendBeacon) {
    const blob = new Blob([body], {
      type: "application/json",
    });

    if (navigator.sendBeacon(TRACK_URL, blob)) {
      return { ok: true };
    }
  }

  try {
    const res = await fetch(TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "omit",
    });

    let json = null;
    try {
      json = await res.json();
    } catch {
      /* empty body */
    }

    return { ok: res.ok, status: res.status, json };
  } catch {
    return { ok: false };
  }
}

/* ---------- current page state ---------- */

let current = null; // { pageVisitId, page, ready, ... }
let sessionId = null;
let firstPage = true;
let started = false;

let activeSeconds = 0;
let maxScrollPercentage = 0;
let maxScrollPixels = 0;
let lastInteraction = Date.now();

const isTracked = (path) =>
  !path.startsWith("/admin");

function readScroll() {
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  const top = window.scrollY || doc.scrollTop || 0;

  if (scrollable <= 0) {
    maxScrollPercentage = 100;
  } else {
    maxScrollPercentage = Math.max(
      maxScrollPercentage,
      Math.min(100, Math.round((top / scrollable) * 100))
    );
  }

  maxScrollPixels = Math.max(
    maxScrollPixels,
    Math.round(top + window.innerHeight)
  );
}

function engagementPayload() {
  readScroll();

  return {
    maxScrollPercentage,
    maxScrollPixels,
    activeTimeSeconds: activeSeconds,
  };
}

function base(type) {
  return {
    type,
    visitorId: getVisitorId(),
    sessionId,
    pageVisitId: current?.pageVisitId,
  };
}

/* ---------- public API ---------- */

// Call on every route change with the full location.
export function trackPageView(location) {
  if (typeof window === "undefined") return;

  const page = location.pathname;

  // Close the previous page first.
  exitCurrentPage();

  if (!isTracked(page)) {
    current = null;
    return;
  }

  sessionId = getSessionId();

  const query = Object.fromEntries(
    new URLSearchParams(location.search)
  );

  const previousPage = current?.page || null;

  activeSeconds = 0;
  maxScrollPercentage = 0;
  maxScrollPixels = 0;

  const page_ = {
    pageVisitId: uuid(),
    page,
    ready: null,
  };

  current = page_;

  const payload = {
    ...base("page_view"),
    page,
    query,
    title: document.title,
    referrer: firstPage ? document.referrer : "",
    previousPage,
    device: {
      screenWidth: window.screen?.width,
      screenHeight: window.screen?.height,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions()
        .timeZone,
    },
  };

  firstPage = false;

  page_.ready = (async () => {
    let result = await send(payload);

    // Session was closed server-side: start a fresh one.
    if (
      result.status === 409 &&
      result.json?.code === "SESSION_ENDED"
    ) {
      sessionId = resetSession();
      result = await send({ ...payload, sessionId });
    }

    return result.ok;
  })();

  startLoops();
}

function exitCurrentPage() {
  if (!current) return;

  const page_ = current;

  // Snapshot now: the next route resets these counters
  // before the async callback below runs.
  const payload = {
    ...base("page_exit"),
    pageVisitId: page_.pageVisitId,
    ...engagementPayload(),
  };

  page_.ready.then((ok) => {
    if (ok) send(payload, { beacon: true });
  });
}

// Important interactions: BUY_NOW, PREVIEW_PDF, CTA_CLICK ...
export function trackEvent(eventType, metadata = {}) {
  if (!current) return;

  const page_ = current;

  page_.ready.then((ok) => {
    if (!ok) return;

    send({
      ...base("event"),
      pageVisitId: page_.pageVisitId,
      eventId: uuid(),
      eventType,
      metadata,
    });
  });
}

/* ---------- background loops (started once) ---------- */

function startLoops() {
  if (started) return;
  started = true;

  const touch = () => {
    lastInteraction = Date.now();
  };

  ["click", "keydown", "mousemove", "touchstart"].forEach(
    (name) =>
      window.addEventListener(name, touch, { passive: true })
  );

  window.addEventListener("scroll", () => {
    touch();
    readScroll();
  }, { passive: true });

  // Active time: tab visible AND recent interaction.
  setInterval(() => {
    if (
      current &&
      document.visibilityState === "visible" &&
      Date.now() - lastInteraction < IDLE_AFTER_MS
    ) {
      activeSeconds += 1;
    }
  }, 1000);

  // Real-time presence.
  setInterval(() => {
    if (!current || document.visibilityState !== "visible") {
      return;
    }

    const page_ = current;

    page_.ready.then((ok) => {
      if (ok) {
        send({ ...base("heartbeat"), pageVisitId: page_.pageVisitId });
      }
    });
  }, HEARTBEAT_MS);

  // Scroll depth and time on page.
  setInterval(() => {
    if (!current) return;

    const page_ = current;

    page_.ready.then((ok) => {
      if (ok) {
        send({
          ...base("engagement"),
          pageVisitId: page_.pageVisitId,
          ...engagementPayload(),
        });
      }
    });
  }, ENGAGEMENT_MS);

  // Save progress when the tab is hidden or closed.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden" && current) {
      send(
        {
          ...base("engagement"),
          ...engagementPayload(),
        },
        { beacon: true }
      );
    }
  });

  window.addEventListener("pagehide", () => {
    exitCurrentPage();
  });
}
