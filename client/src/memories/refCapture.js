/*
  Refer & earn: a friend arrives on ?mref=CODE. We keep the code in the browser (it has to survive sign-up and the Google
  redirect) and hand it to the server once they are signed in. Importing this file is enough to capture it.
*/
const KEY = "mem_mref";

export const captureMref = () => {
  try {
    const code = new URLSearchParams(window.location.search).get("mref");
    if (code && /^[A-Za-z0-9]{4,12}$/.test(code)) localStorage.setItem(KEY, code.toUpperCase());
  } catch { /* private window: nothing to keep */ }
};
export const readMref = () => { try { return localStorage.getItem(KEY) || ""; } catch { return ""; } };
export const clearMref = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };

captureMref();
