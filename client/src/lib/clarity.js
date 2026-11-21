import Clarity from "@microsoft/clarity";
import { hasConsent, isSensitiveUrl } from "./consent";

const PROJECT_ID = import.meta.env.VITE_CLARITY_ID;
let started = false;

/*
  Clarity records session replays, so it only starts when:
    - the visitor opted in to "analytics" (lib/consent.js), and
    - the page URL carries no private credential (purchase / password links). Those pages are always
      reached by a full page load, so checking at start-up is enough.
*/
export function initClarity() {
  if (started || !PROJECT_ID || typeof window === "undefined") return;
  if (!hasConsent("analytics") || isSensitiveUrl()) return;
  try {
    Clarity.init(PROJECT_ID);
    Clarity.consent(true);
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
    // Only the opaque account id (Clarity hashes it). Never the name or email: those would be sent to Microsoft.
    Clarity.identify(String(id));
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
