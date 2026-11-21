import { createSlice } from "@reduxjs/toolkit";

/*
  AUTH STATE

  The access token (a 15-minute JWT) lives ONLY in memory (this Redux store). It is never written to
  localStorage / sessionStorage, so a script injected into the page (XSS, or a compromised third-party
  tag) cannot read a stored token and replay it from elsewhere.

  Staying signed in across reloads and new tabs is handled by the server's httpOnly refresh cookie
  (`__Host-tt_refresh`, Secure, SameSite=Strict), which JavaScript cannot read at all. On start-up the app
  swaps that cookie for a fresh access token (see refreshAccessToken in lib/authSession.js and App.jsx).

  The only thing kept in localStorage is the signed-in user's own profile object (name, role, ...), used to
  draw the UI instantly and to know that a session is worth restoring. It is not a credential: the server
  ignores it and every API call is authorised by the token / cookie alone.
*/

const USER_KEY = "user";
const LEGACY_TOKEN_KEYS = ["token", "tokenExpiry", "authToken", "accessToken"];

const safeStorage = () => {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null; // storage blocked (privacy mode, sandboxed iframe)
  }
};

// One-time clean-up: browsers that used the old version still hold a token in localStorage.
const purgeLegacyTokens = () => {
  const storage = safeStorage();
  if (!storage) return;
  for (const key of LEGACY_TOKEN_KEYS) {
    try {
      storage.removeItem(key);
    } catch {
      /* ignore */
    }
  }
};

export const getUserFromLocalStorage = () => {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const parsed = JSON.parse(storage.getItem(USER_KEY) || "null");
    return parsed && typeof parsed === "object" && typeof parsed.role === "string" ? parsed : null;
  } catch {
    // A corrupted or hand-edited value must not crash the whole app.
    try {
      storage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
    return null;
  }
};

const saveUserHint = (user) => {
  const storage = safeStorage();
  if (!storage) return;
  try {
    if (user && typeof user === "object") storage.setItem(USER_KEY, JSON.stringify(user));
    else storage.removeItem(USER_KEY);
  } catch {
    /* ignore */
  }
};

export const removeAuthDataFromLocalStorage = () => {
  const storage = safeStorage();
  if (storage) {
    try {
      storage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  }
  purgeLegacyTokens();
};

purgeLegacyTokens();

const storedUser = getUserFromLocalStorage();

const initialState = {
  token: "",
  user: storedUser,
  // True until we know whether the stored hint still has a live session behind it.
  restoring: Boolean(storedUser),
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      const { token, user } = action.payload || {};
      state.token = typeof token === "string" ? token : "";
      if (user) state.user = user;
      state.isAuthenticated = Boolean(state.token);
      state.restoring = false;
      saveUserHint(state.user);
    },
    // Start-up restore finished without a session (no cookie, or the server said it is gone).
    sessionRestoreFailed: (state) => {
      state.restoring = false;
    },
    logout: (state) => {
      state.token = "";
      state.user = null;
      state.isAuthenticated = false;
      state.restoring = false;
      removeAuthDataFromLocalStorage();
    },
  },
});

export const { login, logout, sessionRestoreFailed } = authSlice.actions;

export default authSlice.reducer;
