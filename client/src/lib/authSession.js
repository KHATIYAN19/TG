import axios from "axios";

import BASE_URL from "../utils/Url";
import store from "../Redux/store";
import { login, logout } from "../Redux/authSlice";

const ROOT = String(BASE_URL).replace(/\/$/, "");

/* ---------------------------------------------------------------- JWT helpers */
export const tokenExpiresAt = (token) => {
  try {
    const part = String(token || "").split(".")[1];
    if (!part) return 0;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "=")));
    return typeof payload.exp === "number" ? payload.exp * 1000 : 0;
  } catch {
    return 0;
  }
};

export const tokenIsExpired = (token, skewMs = 0) => !token || Date.now() >= tokenExpiresAt(token) - skewMs;

/* ------------------------------------------------------------ silent refresh
   The access token lives ~15 minutes. The server keeps the device signed in with an
   httpOnly refresh cookie, so the app swaps the token quietly instead of kicking the
   user out. Concurrent callers share one request (the server rotates the cookie, so
   two parallel refreshes would invalidate each other).
   Rejects with `error.authRejected = true` only when the server says the session is
   really gone; network trouble is NOT treated as a logout. */
let inflight = null;

export const refreshAccessToken = () => {
  if (!inflight) {
    inflight = axios
      .post(`${ROOT}/api/auth/refresh`, null, { withCredentials: true, timeout: 15000 })
      .then(({ data }) => {
        if (!data?.token) throw Object.assign(new Error("No token returned"), { authRejected: true });
        store.dispatch(login({ token: data.token, user: store.getState().auth.user }));
        return data.token;
      })
      .catch((error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) error.authRejected = true;
        throw error;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
};

/* -------------------------------------------------------------- real logout
   Ends the session on the SERVER (so it disappears from the device list and the
   refresh cookie is cleared), then clears the app. Local state is always cleared,
   even if the server can't be reached. */
export const serverLogout = async () => {
  try {
    let token = store.getState().auth.token;
    if (token && tokenIsExpired(token)) {
      try {
        token = await refreshAccessToken();
      } catch {
        token = null; // session already gone server-side
      }
    }
    if (token) {
      await axios.post(`${ROOT}/api/auth/logout`, null, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
        timeout: 8000,
      });
    }
  } catch (error) {
    console.warn("Server logout failed:", error?.message);
  } finally {
    store.dispatch(logout());
  }
};

/* ------------------------------------------------------------- device hint
   Browsers hide the exact phone model from the server. Detect what we can and pass it
   in a small cookie; the server shows it as the device name (display only). */
const IPHONES = {
  "375x667": "iPhone SE / 8", "375x812": "iPhone X / XS / 11 Pro / 12 mini / 13 mini",
  "414x896": "iPhone XR / 11 / XS Max / 11 Pro Max", "390x844": "iPhone 12 / 13 / 14",
  "428x926": "iPhone 12 / 13 Pro Max / 14 Plus", "393x852": "iPhone 15 / 15 Pro / 14 Pro / 16",
  "430x932": "iPhone 15 Plus / 15 Pro Max / 14 Pro Max", "402x874": "iPhone 16 Pro / 17",
  "440x956": "iPhone 16 Pro Max",
};

const readHintCookie = () => {
  try {
    const m = document.cookie.match(/(?:^|; )tt_dhint=([^;]*)/);
    return m ? JSON.parse(decodeURIComponent(m[1])) : {};
  } catch {
    return {};
  }
};

const writeHintCookie = (hint) => {
  const value = encodeURIComponent(JSON.stringify(hint));
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `tt_dhint=${value}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
};

/* The name the owner gave this browser (e.g. "MacBook Air M5"). Remembered here so
   every future sign-in from this browser is stored under it. */
export const getDeviceLabel = () => {
  try {
    return localStorage.getItem("deviceLabel") || readHintCookie().label || "";
  } catch {
    return "";
  }
};

export const setDeviceLabel = (label) => {
  try {
    const clean = String(label || "").trim().slice(0, 50);
    localStorage.setItem("deviceLabel", clean);
    writeHintCookie({ ...readHintCookie(), label: clean });
  } catch {
    /* cosmetic only */
  }
};

export const initDeviceHint = async () => {
  try {
    let model = "";
    const ua = navigator.userAgent || "";

    if (/iPhone/i.test(ua)) {
      const w = Math.min(screen.width, screen.height);
      const h = Math.max(screen.width, screen.height);
      model = IPHONES[`${w}x${h}`] || "iPhone";
    } else if (/iPad/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) {
      model = "iPad";
    } else if (navigator.userAgentData?.getHighEntropyValues) {
      const v = await navigator.userAgentData.getHighEntropyValues(["model", "platform"]);
      if (v.model) model = v.model;
    }

    // Restore the owner's own name for this browser if the cookie was lost.
    const label = localStorage.getItem("deviceLabel") || "";
    const hint = { ...readHintCookie(), ...(model ? { model: model.slice(0, 50) } : {}), ...(label ? { label } : {}) };
    if (hint.model || hint.label) writeHintCookie(hint);
  } catch {
    /* purely cosmetic: never break the app */
  }
};
