import axios from "axios";

import { API_ROOT, referralAdminHttp as admin, referralHttp as http } from "../arena/api";
import { formatINR, uploadDocument, dateFmt, dayFmt } from "../resume/api";
import { runCheckout, registerRunner } from "../payment/checkoutRunner.js";

export { formatINR, uploadDocument, dateFmt, dayFmt };
const d = (r) => r.data?.data;

/* ---- public ---- */
export const publicInfo = () => axios.get(`${API_ROOT}/api/referral/public`, { timeout: 15000 }).then(d);

/* ---- member ---- */
export const getSummary = (init) => http.get("/summary", { params: init ? { init: 1 } : {} }).then(d); // init: first call after opening the app (also does the one-time housekeeping)
export const closeWelcome = () => http.post("/welcome/close").then(d);
export const getProfile = () => http.get("/profile").then(d);
export const saveProfile = (body) => http.put("/profile", body).then(d);
export const searchCompanies = (q) => http.get("/companies", { params: { q } }).then(d);
export const searchDirectory = (params) => http.get("/directory", { params }).then(d);
export const getMember = (id) => http.get(`/directory/${id}`).then(d);
export const listPosts = (params) => http.get("/posts", { params }).then(d);
export const myPosts = () => http.get("/posts/mine").then(d);
export const createPost = (body) => http.post("/posts", body).then(d);
export const updatePost = (id, body) => http.put(`/posts/${id}`, body).then(d);
export const deletePost = (id) => http.delete(`/posts/${id}`).then(d);
export const sendRequest = (body) => http.post("/requests", body).then(d);
export const listRequests = (params) => http.get("/requests", { params }).then(d);
export const getRequest = (id) => http.get(`/requests/${id}`).then(d);
export const act = (id, action, body) => http.post(`/requests/${id}/${action}`, body || {}).then(d); // accept | reject | cancel | end | unlock
export const resumeUrl = (id, download) => http.get(`/requests/${id}/resume`, { params: download ? { download: 1 } : {} }).then(d);
export const getMessages = (id, before) => http.get(`/requests/${id}/messages`, { params: before ? { before } : {} }).then(d);
export const restSend = (id, body) => http.post(`/requests/${id}/messages`, body).then(d);
export const markRead = (id) => http.post(`/requests/${id}/read`).then(d);
export const getPlans = () => http.get("/plans").then(d);
export const getWallet = () => http.get("/wallet").then(d);
export const startSubscription = async (planId, user, retryOf) => {
  // retryOf: pay again for a subscription whose renewal failed (a fresh checkout at the same price)
  const r = await (retryOf ? http.post(`/subscriptions/${retryOf}/retry`, { returnOrigin: window.location.origin }) : http.post("/subscriptions", { planId, returnOrigin: window.location.origin })).then(d);
  const res = await runCheckout({
    checkout: r.checkout, name: "Referrals by Target Trek", description: r.planName, theme: "#0f766e", prefill: { name: user?.name || "", email: user?.email || "" },
    // Razorpay answers in the popup; Cashfree redirects away and comes back to the Credits page (handled there)
    onPaid: async (response) => ({ status: (await http.post(`/subscriptions/${r.subscriptionId}/verify`, { payload: response }).then(d)).subscription.live ? "paid" : "pending" }),
  });
  return { subscriptionId: r.subscriptionId, ...res };
};
export const retrySubscription = (id, user) => startSubscription(null, user, id);
export const closeFailNotice = (id) => http.post(`/subscriptions/${id}/notice/close`).then(d);
export const getSubscription = (id) => http.get(`/subscriptions/${id}`).then(d);
export const cancelSubscription = (id, reason) => http.post(`/subscriptions/${id}/cancel`, { reason }).then(d);
export const buyPriority = async (planId, user) => open(await http.post("/priority/buy", { planId, returnOrigin: window.location.origin }).then(d), "Priority pass", user);
export const listPayments = (params) => http.get("/payments", { params }).then(d); // every order + subscription charge, newest first
export const orderStatus = (id) => http.get(`/orders/${id}/status`).then(d);

/* ---- payments (the shared checkout runner; the server decides what is paid) ---- */
const verify = (orderId, payload) => http.post("/payments/verify", { orderId, payload }).then(d);
registerRunner("mock", async ({ orderId }) => ({ status: (await verify(orderId, { paymentId: "mock_payment" }))?.status }));
const open = async (pay, description, user) => ({
  orderId: pay.orderId,
  ...(await runCheckout({
    checkout: pay.checkout, orderId: pay.orderId, name: "Referrals by Target Trek", description, theme: "#0f766e",
    prefill: { name: user?.name || "", email: user?.email || "" },
    onPaid: async (response) => ({ status: (await verify(pay.orderId, response))?.status }),
  })),
});
/* unlock a chat: resolves { unlocked } or the payment outcome ({ status: paid | pending | failed | redirect | dismissed }) */
export const unlockChat = async (id, { useCredit, user } = {}) => {
  const r = await http.post(`/requests/${id}/unlock`, { useCredit, returnOrigin: window.location.origin }).then(d);
  if (r.unlocked) return { unlocked: true, via: r.via };
  return open(r.payment, "Open a referral chat", user);
};
export const buyPlan = async (planId, user) => open(await http.post("/plans/buy", { planId, returnOrigin: window.location.origin }).then(d), "Chat credits", user);
export const payAgain = async (orderId, user) => open(await http.post(`/orders/${orderId}/pay`, { returnOrigin: window.location.origin }).then(d), "Referral payment", user);

/* ---- admin ---- */
export const A = {
  stats: () => admin.get("/stats").then(d),
  requests: (params) => admin.get("/requests", { params }).then(d),
  request: (id) => admin.get(`/requests/${id}`).then(d),
  moreMessages: (id, before) => admin.get(`/requests/${id}/messages`, { params: { before } }).then(d),
  resume: (id) => admin.get(`/requests/${id}/resume`).then(d),
  end: (id, reason) => admin.post(`/requests/${id}/end`, { reason }).then(d),
  unlock: (id) => admin.post(`/requests/${id}/unlock`).then(d),
  remove: (id) => admin.delete(`/requests/${id}`).then(d),
  removeMessage: (id) => admin.delete(`/messages/${id}`).then(d),
  profiles: (params) => admin.get("/profiles", { params }).then(d),
  profileStatus: (id, status, reason) => admin.patch(`/profiles/${id}`, { status, reason }).then(d),
  posts: (params) => admin.get("/posts", { params }).then(d),
  hidePost: (id, hidden, reason) => admin.patch(`/posts/${id}`, { hidden, reason }).then(d),
  deletePost: (id) => admin.delete(`/posts/${id}`).then(d),
  orders: (params) => admin.get("/orders", { params }).then(d),
  grant: (body) => admin.post("/grants", body).then(d),
  updateOrder: (id, body) => admin.patch(`/orders/${id}`, body).then(d),
  deleteOrder: (id) => admin.delete(`/orders/${id}`).then(d),
  plans: () => admin.get("/plans").then(d),
  savePlan: (id, body) => (id ? admin.put(`/plans/${id}`, body) : admin.post("/plans", body)).then(d),
  deletePlan: (id) => admin.delete(`/plans/${id}`).then(d),
  subPlans: () => admin.get("/sub-plans").then(d),
  saveSubPlan: (id, body) => (id ? admin.put(`/sub-plans/${id}`, body) : admin.post("/sub-plans", body)).then(d),
  deleteSubPlan: (id) => admin.delete(`/sub-plans/${id}`).then(d),
  subscriptions: (params) => admin.get("/subscriptions", { params }).then(d),
  subscription: (id) => admin.get(`/subscriptions/${id}`).then(d),
  syncSubscription: (id) => admin.post(`/subscriptions/${id}/sync`).then(d),
  cancelSubscription: (id, body) => admin.post(`/subscriptions/${id}/cancel`, body).then(d),
  credits: (user) => admin.get("/credits", { params: { user } }).then(d),
  changeCredits: (body) => admin.post("/credits", body).then(d),
  editBucket: (id, body) => admin.patch(`/credits/${id}`, body).then(d),
  deleteProfile: (id) => admin.delete(`/profiles/${id}`).then(d),
  deleteSubscription: (id) => admin.delete(`/subscriptions/${id}`).then(d),
  deleteCharge: (id) => admin.delete(`/charges/${id}`).then(d),
  settings: () => admin.get("/settings").then(d),
  saveSettings: (body) => admin.put("/settings", body).then(d),
};

export const ago = (v) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(v).getTime()) / 60000));
  if (m < 1) return "Just now";
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const days = Math.round(h / 24);
  return days < 30 ? `${days} day${days === 1 ? "" : "s"} ago` : dayFmt(v);
};
export const clock = (v) => new Date(v).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
export const STATUS = {
  pending: { label: "Waiting for a reply", tone: "warn" },
  accepted: { label: "Accepted", tone: "ok" },
  rejected: { label: "Declined", tone: "bad" },
  cancelled: { label: "Withdrawn", tone: "" },
  ended: { label: "Chat ended", tone: "" },
};

/* REST twins of the socket actions, used when the live connection is down */
export const editMsg = (id, mid, text) => http.patch(`/requests/${id}/messages/${mid}`, { text }).then(d);
export const delMsg = (id, mid) => http.delete(`/requests/${id}/messages/${mid}`).then(d);
export const reactMsg = (id, mid, emoji) => http.post(`/requests/${id}/messages/${mid}/react`, { emoji }).then(d);
export const EMOJI = ["👍", "❤️", "😂", "🙏", "🎉", "👀"];
export const getPost = (id) => http.get(`/posts/${id}`).then(d);
