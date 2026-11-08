import express from "express";

import { resendPurchaseMailForOrder } from "../services/membership/membershipService.js";
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
