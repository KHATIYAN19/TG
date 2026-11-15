import Clarity from "@microsoft/clarity";

const PROJECT_ID = import.meta.env.VITE_CLARITY_ID;
let started = false;

export function initClarity() {
  if (started || !PROJECT_ID || typeof window === "undefined") return;
  try {
    Clarity.init(PROJECT_ID);
    started = true;
  } catch (e) {
    console.warn("Clarity init failed", e);
  }
}

export function clarityIdentify(user) {
  if (!started || !user) return;
  const id = user._id || user.id;
  if (!id) return;
  try {
    Clarity.identify(String(id), undefined, undefined, user.name || user.email);
    if (user.role) Clarity.setTag("role", String(user.role));
  } catch {
    /* ignore */
  }
}

// Custom activity, e.g. clarityEvent("placement_test_started")
export function clarityEvent(name) {
  if (!started) return;
  try {
    Clarity.event(name);
  } catch {
    /* ignore */
  }
}
