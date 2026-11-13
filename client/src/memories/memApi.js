import { useCallback, useEffect, useState } from "react";

import axios from "axios";
import { getAttribution } from "../lib/attribution";

import { API_ROOT, memoriesHttp, errMsg } from "../arena/api";

/* Everything the signed-in Memories app asks the server. All calls need a login. */
const data = (r) => r.data?.data;

export const getConfig = () => memoriesHttp.get("/config").then(data);
export const redeemCode = (code) => memoriesHttp.post("/codes/redeem", { code }).then(data);
export const redeemGumroadOrder = (orderId, email) => memoriesHttp.post("/gumroad/redeem-order", { orderId, email }).then(data);
export const claimFreeCredit = () => memoriesHttp.post("/credits/free").then(data);
/* the buyer's mobile number is read from their account on the server, so nothing about it is sent; `returnOrigin` brings the buyer back to this same site (and login) after paying */
export const createPayment = (gateway) =>
  memoriesHttp.post("/payments/create", { gateway, returnOrigin: window.location.origin, attribution: getAttribution() }).then(data);
export const verifyPayment = (orderId, payload) => memoriesHttp.post("/payments/verify", { orderId, payload }).then(data);
export const getPaymentStatus = (orderId) => memoriesHttp.get(`/payments/${encodeURIComponent(orderId)}/status`).then(data);
export const createPage = (body) => memoriesHttp.post("/pages", body).then(data);
/* the owner's pages. `expiresWithin` (days) keeps only pages ending that soon; `sort: "expiry"` puts the ones ending first at the top. */
export const listPages = (params = {}) => memoriesHttp.get("/pages", { params }).then(data);
export const getPage = (id) => memoriesHttp.get(`/pages/${encodeURIComponent(id)}`).then(data);
export const updatePage = (id, body) => memoriesHttp.patch(`/pages/${encodeURIComponent(id)}`, body).then(data);

/** The server's config (price, gateways, occasions) plus how many page credits this user has right now. */
export function useMemConfig() {
  const [cfg, setCfg] = useState(null);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try { setCfg(await getConfig()); setError(""); } catch (e) { setError(errMsg(e)); }
  }, []);
  useEffect(() => { load(); }, [load]);
  return { cfg, error, reload: load, setCredits: (credits) => setCfg((c) => (c ? { ...c, credits } : c)) };
}

/* managing a page you made */
const pid = (id) => encodeURIComponent(id);
export const setVisibility = (id, visibility, pin) => memoriesHttp.post(`/pages/${pid(id)}/visibility`, { visibility, ...(pin ? { pin } : {}) }).then(data);
export const changePin = (id, pin) => memoriesHttp.post(`/pages/${pid(id)}/pin`, pin ? { pin } : {}).then(data);
export const closePage = (id) => memoriesHttp.post(`/pages/${pid(id)}/close`).then(data);
export const reopenPage = (id) => memoriesHttp.post(`/pages/${pid(id)}/reopen`).then(data);
export const regenerateLink = (id) => memoriesHttp.post(`/pages/${pid(id)}/regenerate-link`).then(data);
export const deletePage = (id) => memoriesHttp.delete(`/pages/${pid(id)}`).then(data);

/* photos and videos: the browser uploads straight to storage with a short-lived signed form, then tells the server */
export const presignMedia = (id, body) => memoriesHttp.post(`/pages/${pid(id)}/media/presign`, body).then(data);
export const confirmMedia = (id, body) => memoriesHttp.post(`/pages/${pid(id)}/media/confirm`, body).then(data);
export const setMainMedia = (id, mediaId) => memoriesHttp.post(`/pages/${pid(id)}/media/${pid(mediaId)}/main`).then(data);
export const captionMedia = (id, mediaId, caption) => memoriesHttp.patch(`/pages/${pid(id)}/media/${pid(mediaId)}`, { caption }).then(data);
export const removeMedia = (id, mediaId) => memoriesHttp.delete(`/pages/${pid(id)}/media/${pid(mediaId)}`).then(data);

/**
 * The whole upload, in three steps:
 *   1. ask OUR server for a signed upload form (it checks the file type and size and picks a private storage key for this user);
 *   2. send the file straight to the storage bucket with that form (the server never handles the bytes);
 *   3. tell our server it's there. It looks at the real object before attaching it to the page.
 * `onProgress(0..1)` is called while step 2 runs.
 */
/** Width, height (and a video's length) read in the browser, so the page can lay a 16:9 and a 9:16 video out differently. Best effort: {} if it can't be read. */
export const measureMedia = (file, kind) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const finish = (v) => { clearTimeout(timer); URL.revokeObjectURL(url); resolve(v); };
    const timer = setTimeout(() => finish({}), 6000);
    if (kind === "photo") {
      const img = new Image();
      img.onload = () => finish({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => finish({});
      img.src = url;
    } else {
      const v = document.createElement("video");
      v.preload = "metadata"; v.muted = true;
      v.onloadedmetadata = () => finish({ width: v.videoWidth, height: v.videoHeight, durationSec: Number.isFinite(v.duration) ? Math.round(v.duration * 10) / 10 : undefined });
      v.onerror = () => finish({});
      v.src = url;
    }
  });

export async function uploadMedia(pageId, kind, file, onProgress, caption = "", knownDurationSec) {
  const dims = await measureMedia(file, kind);
  if (knownDurationSec > 0 && !dims.durationSec) dims.durationSec = Math.round(knownDurationSec * 10) / 10;
  const t = await presignMedia(pageId, { kind, contentType: file.type, size: file.size, filename: file.name });
  const form = new FormData();
  Object.entries(t.fields || {}).forEach(([k, v]) => form.append(k, v));
  form.append("file", file); // the file must be the last field
  await new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("POST", t.url);
    x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    x.onload = () => (x.status >= 200 && x.status < 300 ? resolve() : reject(new Error(x.status === 403 ? "The storage service refused the file (the link may have expired). Please try again." : "The upload didn't go through. Please try again.")));
    x.onerror = () => reject(new Error("The upload was blocked or lost. Check your connection. If it keeps happening, the storage bucket needs to allow uploads from this site."));
    x.ontimeout = () => reject(new Error("The upload took too long. Try a smaller file or a better connection."));
    x.timeout = 15 * 60 * 1000;
    x.send(form);
  });
  onProgress?.(1);
  return confirmMedia(pageId, { key: t.key, kind, originalName: file.name, ...(caption ? { caption } : {}), ...(dims.width > 0 && dims.height > 0 ? { width: dims.width, height: dims.height } : {}), ...(dims.durationSec > 0 ? { durationSec: dims.durationSec } : {}) });
}

/* the public page viewer: no login, so a plain request with no session or cookies */
const visitor = axios.create({ baseURL: `${API_ROOT}/api/memories/view`, timeout: 20000, withCredentials: false });
export const viewPage = (code, token) => visitor.get(`/${encodeURIComponent(code)}`, { headers: token ? { "x-memory-token": token } : {} }).then(data);
export const unlockPage = (code, pin) => visitor.post(`/${encodeURIComponent(code)}/unlock`, { pin }).then(data);

/* what the receiver sends back */
export const sendEvents = (code, visitor, events, token) =>
  visitor_post(code, "events", { visitor, events }, token);
export const sendAnswer = (code, answer, visitor, token) => visitor_post(code, "answer", { answer, visitor }, token);
export const sendReply = (code, text, visitor, token) => visitor_post(code, "reply", { text, visitor }, token);
function visitor_post(code, what, body, token) {
  return visitor.post(`/${encodeURIComponent(code)}/${what}`, body, { headers: token ? { "x-memory-token": token } : {} }).then(data);
}
/** The last report when the tab is closing: a normal request would be cancelled, a keepalive one is not. */
export const sendEventsOnExit = (code, visitorId, events, token) => {
  try {
    fetch(`${API_ROOT}/api/memories/view/${encodeURIComponent(code)}/events`, {
      method: "POST", keepalive: true, headers: { "Content-Type": "application/json", ...(token ? { "x-memory-token": token } : {}) }, body: JSON.stringify({ visitor: visitorId, events }),
    }).catch(() => {});
  } catch { /* nothing to do */ }
};

/* send the page's email again to the same address (it can't be changed) */
export const resendEmail = (id) => memoriesHttp.post(`/pages/${pid(id)}/email/resend`).then(data);

/* the owner's view of what happened on one of their pages */
export const getActivity = (id) => memoriesHttp.get(`/pages/${encodeURIComponent(id)}/activity`).then(data);
