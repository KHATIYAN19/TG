import axios from "axios";

import BASE_URL from "../utils/Url";
import store from "../Redux/store";
import { login, logout } from "../Redux/authSlice";

export const API_ROOT = String(BASE_URL).replace(/\/$/, "");
export const WS_URL = `${API_ROOT.replace(/^http/, "ws")}/ws/arena`;

export const http = axios.create({
  baseURL: `${API_ROOT}/api/arena`,
  withCredentials: true,
  timeout: 20000,
});

export const adminHttp = axios.create({
  baseURL: `${API_ROOT}/api/admin/arena`,
  withCredentials: true,
  timeout: 20000,
});

const getToken = () => store.getState().auth.token || localStorage.getItem("token") || "";

/*
  SESSION HANDLING
  A protected endpoint with no valid session answers 401 with a machine code.
  Members should never see raw server text like "Authentication token missing",
  so every one of those codes is turned into one clear, friendly message.
*/
export const SESSION_CODES = new Set([
  "TOKEN_MISSING", "INVALID_TOKEN", "INVALID_AUTH_HEADER", "INVALID_TOKEN_PAYLOAD",
  "TOKEN_EXPIRED", "TOKEN_REVOKED", "SESSION_NOT_FOUND", "SESSION_REVOKED", "SESSION_ENDED",
]);
const SESSION_MESSAGE = "Your session has ended. Please sign in again.";

export const isSessionError = (error) => SESSION_CODES.has(error?.response?.data?.code);

const sessionError = () => {
  const e = new Error(SESSION_MESSAGE);
  e.response = { status: 401, data: { success: false, code: "SESSION_ENDED", message: SESSION_MESSAGE } };
  return e;
};

// Endpoints a signed-out visitor may call (landing page, signup).
const isPublicCall = (config) => /^\/(public|signup|password)(\/|$|\?)/.test(String(config.url || ""));

let refreshing = null;
const refreshAccessToken = () => {
  if (!refreshing) {
    refreshing = axios
      .post(`${API_ROOT}/api/auth/refresh`, null, { withCredentials: true, timeout: 15000 })
      .then(({ data }) => {
        if (!data?.token) throw new Error("no token");
        store.dispatch(login({ token: data.token, user: store.getState().auth.user }));
        return data.token;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

for (const instance of [http, adminHttp]) {
  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
    // No session: don't even send a protected request that can only fail.
    if (instance === adminHttp || !isPublicCall(config)) return Promise.reject(sessionError());
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      const status = error.response?.status;
      const code = error.response?.data?.code;

      // One silent refresh attempt for an expired access token.
      if (status === 401 && code === "TOKEN_EXPIRED" && original && !original._retried) {
        original._retried = true;
        try {
          const token = await refreshAccessToken();
          original.headers.Authorization = `Bearer ${token}`;
          return instance(original);
        } catch {
          store.dispatch(logout());
        }
      } else if (status === 401 && getToken()) {
        store.dispatch(logout());
      }

      // 404 from the API itself (not a missing record) means the server is running an
      // older version without this feature. Say so, instead of a bare "not found".
      if (status === 404 && /not found/i.test(String(error.response?.data?.message || "")) && !error.response?.data?.code) {
        error.response.data.message =
          "This part of the arena isn't available on the server yet. The backend needs to be updated to the latest version.";
        error.response.data.code = "SERVER_OUTDATED";
      }

      // Replace raw server wording with the friendly message for every session failure.
      if (status === 401 && SESSION_CODES.has(code) && error.response?.data) {
        error.response.data.message = SESSION_MESSAGE;
      }
      return Promise.reject(error);
    }
  );
}

export const errMsg = (error) =>
  error?.response?.data?.message ||
  (error?.code === "ECONNABORTED"
    ? "The request timed out. Please try again."
    : !error?.response
      ? "Unable to reach the server. Check your connection."
      : "Something went wrong. Please try again.");

export const errCode = (error) => error?.response?.data?.code;

export const inr = (paise) => {
  const value = (Number(paise) || 0) / 100;
  return `₹${value.toLocaleString("en-IN", { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;
};

export const TOPICS = [
  { value: "HLD", label: "System Design (HLD)" },
  { value: "LLD", label: "Low-Level Design (LLD)" },
  { value: "DSA", label: "DSA" },
  { value: "GENAI", label: "GenAI / LLMs" },
  { value: "JAVA", label: "Java & Spring" },
];
export const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];
export const SLOTS = [
  { value: "weekday_morning", label: "Weekday mornings" },
  { value: "weekday_evening", label: "Weekday evenings" },
  { value: "weekend_morning", label: "Weekend mornings" },
  { value: "weekend_evening", label: "Weekend evenings" },
];
export const COMPANY_TYPES = [
  { value: "student", label: "Student" },
  { value: "startup", label: "Startup" },
  { value: "product", label: "Product company" },
  { value: "service", label: "Service company" },
  { value: "mnc", label: "MNC" },
  { value: "other", label: "Other" },
];

export const LANGUAGES = [
  { value: "english", label: "English" }, { value: "hindi", label: "Hindi" }, { value: "tamil", label: "Tamil" },
  { value: "telugu", label: "Telugu" }, { value: "kannada", label: "Kannada" }, { value: "malayalam", label: "Malayalam" },
  { value: "marathi", label: "Marathi" }, { value: "bengali", label: "Bengali" }, { value: "gujarati", label: "Gujarati" },
  { value: "punjabi", label: "Punjabi" }, { value: "other", label: "Other" },
];
export const SESSION_MODES = [
  { value: "chat", label: "Chat" }, { value: "voice", label: "Voice call" }, { value: "video", label: "Video call" },
];
export const BUDDY_PREFS = [
  { value: "similar_level", label: "Similar level", hint: "Learn at the same pace" },
  { value: "more_experienced", label: "More experienced", hint: "Someone a step ahead" },
  { value: "any", label: "Anyone", hint: "I'm flexible" },
];
export const TIMELINES = [
  { value: "within_1_month", label: "Within 1 month" }, { value: "within_3_months", label: "1–3 months" },
  { value: "within_6_months", label: "3–6 months" }, { value: "exploring", label: "Just exploring" },
];
export const LEVEL_HINTS = {
  beginner: "Learning the basics",
  intermediate: "Comfortable, want polish",
  advanced: "Interview-ready, want sparring",
};
export const SKILL_SUGGESTIONS = {
  HLD: ["caching", "load balancing", "sharding", "kafka", "rate limiting", "consistent hashing"],
  LLD: ["design patterns", "solid", "oop", "uml", "concurrency"],
  DSA: ["arrays", "graphs", "dp", "trees", "recursion", "heaps"],
  GENAI: ["llms", "rag", "prompting", "agents", "embeddings"],
  JAVA: ["spring boot", "jvm", "collections", "multithreading", "hibernate"],
};

export const labelOf = (list, value) => list.find((i) => i.value === value)?.label ?? value;

export const retryAfterOf = (error) => Number(error?.response?.data?.retryAfter) || 0;

export const timeAgo = (date) => {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  const steps = [[60, "s"], [60, "m"], [24, "h"], [30, "d"]];
  let value = seconds;
  for (const [size, unit] of steps) {
    if (value < size) return `${Math.floor(value)}${unit} ago`;
    value /= size;
  }
  return new Date(date).toLocaleDateString();
};
