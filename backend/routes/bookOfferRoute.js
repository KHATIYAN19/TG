import express from "express";

import {
  getPublicOffers,
  quoteOffer,
  adminListOffers,
  adminCreateOffer,
  adminUpdateOffer,
  adminDeleteOffer,
  adminToggleOffer,
  adminOfferCatalog,
  adminOfferPayments,
  adminGetMailSettings,
  adminSetMailSettings,
} from "../controllers/bookOfferController.js";

import { auth, isAdmin } from "../Middleware/auth.js";
import * as PB from "../Middleware/publicBudgets.js";

export const publicRouter = express.Router();

publicRouter.get("/", PB.couponList, getPublicOffers);
publicRouter.post("/quote", PB.couponValidate, quoteOffer);

export const adminRouter = express.Router();

adminRouter.use(auth, isAdmin);
adminRouter.get("/", adminListOffers);
adminRouter.get("/payments", adminOfferPayments);
adminRouter.get("/catalog", adminOfferCatalog);
adminRouter.get("/settings", adminGetMailSettings);
adminRouter.put("/settings", adminSetMailSettings);
adminRouter.post("/", adminCreateOffer);
adminRouter.patch("/:id/active", adminToggleOffer);
adminRouter.put("/:id", adminUpdateOffer);
adminRouter.delete("/:id", adminDeleteOffer);
