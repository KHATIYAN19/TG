import express from "express";

import { resendPurchaseMailForOrder } from "../services/membership/membershipService.js";
import { deliverPackCodeForOrder } from "../services/memory/packCode.js";
import Membership from "../models/Membership.js";
import { auth, isAdmin } from "../Middleware/auth.js";
import { budget, byIp, byUser } from "../Middleware/budget.js";
import {
  adminListMembers,
  adminAnnouncements,
  adminBulkDeleteSuggestions,
  adminDeleteMember,
  adminDeleteSuggestion,
  adminOverview,
  adminSuspendMember,
  adminUnsuspendMember,
  adminListSuggestions,
  adminSendAnnouncement,
  adminUpdateSuggestion,
  createSuggestion,
  getBookMatches,
  getLibrary,
  getMyMembership,
  getMySuggestions,
  getPlans,
} from "../controllers/membershipController.js";

const plansTenMin = budget({ name: "membership-plans", limit: 120, windowSec: 600, key: byIp, message: "Too many requests." });
const suggestDaily = budget({ name: "membership-suggest", limit: 10, windowSec: 86400, key: byUser, message: "You've sent a lot of suggestions today." });

/* Public + member: mounted at /api/membership */
export const memberRouter = express.Router();
memberRouter.get("/plans", plansTenMin, getPlans);
memberRouter.get("/book-matches", plansTenMin, getBookMatches);
memberRouter.get("/me", auth, getMyMembership);
memberRouter.get("/library", auth, getLibrary);
memberRouter.get("/suggestions", auth, getMySuggestions);
memberRouter.post("/suggestions", auth, suggestDaily, createSuggestion);

/* Admin: mounted at /api/admin/membership */
export const adminRouter = express.Router();
adminRouter.use(auth, isAdmin);
adminRouter.post("/orders/:orderId/resend-purchase-mail", async (req, res) => {
  try {
    const { email } = await resendPurchaseMailForOrder(req.params.orderId);
    res.json({ success: true, message: `Prep Arena credit mail sent to ${email}.` });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || "Unable to send the mail." });
  }
});
/* Re-send the Memories page code email for one paid Lifetime-pack order (makes the code first if the order never got one). */
adminRouter.post("/orders/:orderId/resend-memories-mail", async (req, res) => {
  try {
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : undefined;
    const r = await deliverPackCodeForOrder(req.params.orderId, { force: true, to: email || undefined });
    res.json({ success: true, message: `Memories page code ${r.status === "queued" ? "queued for" : "sent to"} ${r.to}.` });
  } catch (error) {
    if (error?.name === "CastError") return res.status(400).json({ success: false, message: "Invalid order." });
    res.status(error.status || 500).json({ success: false, message: error.message || "Unable to send the mail." });
  }
});
/* Members page: retry / resend the Memories code mail for one Lifetime member. */
adminRouter.post("/members/:id/resend-memories-mail", async (req, res) => {
  try {
    const member = await Membership.findById(req.params.id).select("orderId plan").lean();
    if (!member) return res.status(404).json({ success: false, message: "Member not found." });
    if (member.plan !== "lifetime") return res.status(400).json({ success: false, message: "Only Lifetime pack members get a Memories code." });
    const r = await deliverPackCodeForOrder(member.orderId, { force: true });
    res.json({ success: true, message: `Memories page code ${r.status === "queued" ? "queued for" : "sent to"} ${r.to}.` });
  } catch (error) {
    if (error?.name === "CastError") return res.status(400).json({ success: false, message: "Invalid member." });
    res.status(error.status || 500).json({ success: false, message: error.message || "Unable to send the mail." });
  }
});
adminRouter.get("/overview", adminOverview);
adminRouter.get("/members", adminListMembers);
adminRouter.patch("/members/:id/suspend", adminSuspendMember);
adminRouter.patch("/members/:id/unsuspend", adminUnsuspendMember);
adminRouter.delete("/members/:id", adminDeleteMember);
adminRouter.get("/suggestions", adminListSuggestions);
adminRouter.patch("/suggestions/:id", adminUpdateSuggestion);
adminRouter.post("/suggestions/bulk-delete", adminBulkDeleteSuggestions);
adminRouter.delete("/suggestions/:id", adminDeleteSuggestion);
adminRouter.get("/announcements", adminAnnouncements);
adminRouter.post("/announcements/:bookId/send", adminSendAnnouncement);
