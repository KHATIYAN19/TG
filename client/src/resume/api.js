import axios from "axios";

import { resumeHttp, resumeAdminHttp, uploadsHttp, API_ROOT } from "../arena/api";

const data = (r) => r.data?.data;

export const formatINR = (n) => (n == null ? "" : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: Number(n) % 1 ? 2 : 0 }).format(n));

/* ---- public ---- */
const PKG_KEY = "resume:packages:v1";
let pkgPromise = null;
export const cachedPackages = () => { try { const c = JSON.parse(localStorage.getItem(PKG_KEY) || "null"); return Array.isArray(c) ? c : null; } catch { return null; } };
/* one shared request, started as soon as this file loads; the answer is also kept so the next visit shows plans at once */
export const fetchPackages = () => {
  if (!pkgPromise) {
    pkgPromise = axios.get(`${API_ROOT}/api/resume/public`, { timeout: 15000 }).then((r) => {
      const list = r.data?.data?.packages || [];
      try { localStorage.setItem(PKG_KEY, JSON.stringify(list)); } catch { /* ignore */ }
      return list;
    }).catch((e) => { pkgPromise = null; throw e; });
  }
  return pkgPromise;
};
if (typeof window !== "undefined" && window.location.pathname === "/resume-review") fetchPackages().catch(() => {});

/* ---- buyer: 1) pay for a plan  2) send in a resume under it ---- */
export const buyPlan = (body) => resumeHttp.post("/plans/buy", body).then(data);
export const payPlan = (id, body) => resumeHttp.post(`/plans/${id}/pay`, body).then(data);
export const verifyPayment = (purchaseId, payload) => resumeHttp.post("/payments/verify", { purchaseId, payload }).then(data);
export const getPaymentStatus = (id) => resumeHttp.get(`/plans/${id}/payment-status`).then(data);
export const myPlans = () => resumeHttp.get("/plans").then(data); // { plans, summary }
export const requestHuman = (id) => resumeHttp.post(`/requests/${id}/human`).then(data);
export const getPlan = (id) => resumeHttp.get(`/plans/${id}`).then(data);
export const submitRequest = (body) => resumeHttp.post("/requests", body).then(data);
export const myRequests = () => resumeHttp.get("/requests").then(data);
export const myRequestsPage = (page = 1, limit = 20) => resumeHttp.get("/requests", { params: { page, limit } }).then(data); // { items, total, page, pages, limit }
export const getRequest = (id) => resumeHttp.get(`/requests/${id}`).then(data);
export const getDeliverableUrl = (id) => resumeHttp.get(`/requests/${id}/file`).then(data);

/* ---- reviewers / admin ---- */
export const adminStats = () => resumeAdminHttp.get("/stats").then(data);
export const adminList = (params) => resumeAdminHttp.get("/requests", { params }).then(data);
export const adminGet = (id) => resumeAdminHttp.get(`/requests/${id}`).then(data);
export const adminClaim = (id) => resumeAdminHttp.post(`/requests/${id}/claim`).then(data);
export const adminSaveReview = (id, body) => resumeAdminHttp.put(`/requests/${id}/review`, body).then(data);
export const adminRerunAi = (id) => resumeAdminHttp.post(`/requests/${id}/rerun-ai`, null, { timeout: 120000 }).then(data);
export const adminDeleteRequest = (id, giveBackUse) => resumeAdminHttp.delete(`/requests/${id}`, { params: { giveBackUse: giveBackUse ? "1" : "0" } }).then(data);
export const adminPurchases = (params) => resumeAdminHttp.get("/purchases", { params }).then(data);
export const adminUpdatePurchase = (id, body) => resumeAdminHttp.patch(`/purchases/${id}`, body).then(data);
export const adminDeletePurchase = (id, keepReviews) => resumeAdminHttp.delete(`/purchases/${id}`, { params: { keepReviews: keepReviews ? "1" : "0" } }).then(data);
export const adminGrant = (body) => resumeAdminHttp.post("/purchases/grant", body).then(data);
export const adminMembers = (params) => resumeAdminHttp.get("/members", { params }).then(data);
export const adminBlock = (userId, reason) => resumeAdminHttp.post(`/members/${userId}/block`, { reason }).then(data);
export const adminUnblock = (userId) => resumeAdminHttp.delete(`/members/${userId}/block`).then(data);
export const adminAiSettings = () => resumeAdminHttp.get("/ai-settings").then(data);
export const adminSaveAiSettings = (body) => resumeAdminHttp.put("/ai-settings", body).then(data);
export const adminTestAiModel = (body) => resumeAdminHttp.post("/ai-settings/test", body, { timeout: 75000 }).then(data);
export const adminPackages = () => resumeAdminHttp.get("/packages").then(data);
export const adminSavePackage = (id, body) => (id ? resumeAdminHttp.put(`/packages/${id}`, body) : resumeAdminHttp.post("/packages", body)).then(data);
export const adminDeletePackage = (id) => resumeAdminHttp.delete(`/packages/${id}`).then(data);

/* ---- upload: ask for a signed form, send the file straight to S3, hand back the key ---- */
const TYPES = { pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
export async function uploadDocument(file, onProgress) {
  const ext = String(file.name).split(".").pop().toLowerCase();
  const contentType = TYPES[ext] || file.type;
  const presign = await uploadsHttp.post("/presign", { purpose: "resume", contentType, size: file.size, filename: file.name }).then(data);
  const form = new FormData();
  Object.entries(presign.fields || {}).forEach(([k, v]) => form.append(k, v));
  form.append("file", file); // the file must be the last field
  await new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("POST", presign.url);
    x.upload.onprogress = (e) => { if (e.lengthComputable) onProgress?.(e.loaded / e.total); };
    x.onload = () => (x.status >= 200 && x.status < 300 ? resolve() : reject(new Error(x.status === 403 ? "The storage service refused the file (the link may have expired). Please try again." : "The upload didn't go through. Please try again.")));
    x.onerror = () => reject(new Error("The upload was blocked or lost. Check your connection and try again."));
    x.ontimeout = () => reject(new Error("The upload took too long. Try again on a better connection."));
    x.timeout = 5 * 60 * 1000;
    x.send(form);
  });
  onProgress?.(1);
  return { key: presign.key, filename: file.name, size: file.size };
}

export const STATUS = {
  ai_reviewing: { label: "AI is reading it", tone: "" },
  awaiting_review: { label: "Waiting for a reviewer", tone: "" },
  in_review: { label: "Being reviewed", tone: "" },
  completed: { label: "Review ready", tone: "ok" },
};

export const PLAN_STATE = {
  active: { label: "Active", tone: "ok" },
  expired: { label: "Expired", tone: "bad" },
  used_up: { label: "All used", tone: "warn" },
  revoked: { label: "Switched off", tone: "bad" },
  unpaid: { label: "Unpaid", tone: "warn" },
};

export const daysLeft = (d) => (d ? Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)) : null);
export const dateFmt = (d) => (d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "");
export const dayFmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "");
