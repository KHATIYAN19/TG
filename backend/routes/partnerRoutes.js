import express from "express";

import { auth, isAdmin, authorizeRoles } from "../Middleware/auth.js";
import {
  partnerMe, partnerOverview, partnerTransactions, partnerExport,
  previewMe, previewOverview, previewTransactions,
  adminListPartners, adminUpdateSettings, adminGetPartner, adminUpdateAccess, adminHideTransactions,
} from "../controllers/partner/partnerController.js";

/* Partner dashboard: /api/partner (role "partner" only). The controller re-checks role and permissions on every call. */
export const partnerRouter = express.Router();
partnerRouter.use(auth, authorizeRoles("partner"));
partnerRouter.use((req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); });
partnerRouter.get("/me", partnerMe);
partnerRouter.get("/overview", partnerOverview);
partnerRouter.get("/transactions", partnerTransactions);
partnerRouter.get("/export", partnerExport);

/* Admin: /api/admin/partners */
export const partnerAdminRouter = express.Router();
partnerAdminRouter.use(auth, isAdmin);
partnerAdminRouter.use((req, res, next) => { res.setHeader("Cache-Control", "no-store"); next(); });
partnerAdminRouter.get("/", adminListPartners);
partnerAdminRouter.put("/settings", adminUpdateSettings);
partnerAdminRouter.get("/:userId", adminGetPartner);
partnerAdminRouter.put("/:userId/access", adminUpdateAccess);
partnerAdminRouter.patch("/:userId/hidden", adminHideTransactions); // :userId "all" = every partner
partnerAdminRouter.get("/:userId/preview/me", previewMe);
partnerAdminRouter.get("/:userId/preview/overview", previewOverview);
partnerAdminRouter.get("/:userId/preview/transactions", previewTransactions);
