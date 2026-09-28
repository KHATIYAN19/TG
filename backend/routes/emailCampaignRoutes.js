import express from "express";

import {
  sendEmailCampaign,
  getAllEmailCampaigns,
  hardDeleteEmailCampaign,
} from "../controllers/emailCampaignController.js";

import {
  auth,
  isAdmin,
} from "../Middleware/auth.js";

const router = express.Router();

router.post(
  "/send",
  auth,
  isAdmin,
  sendEmailCampaign
);

router.get(
  "/",
  auth,
  isAdmin,
  getAllEmailCampaigns
);

router.delete(
  "/:campaignId",
  auth,
  isAdmin,
  hardDeleteEmailCampaign
);

export default router;