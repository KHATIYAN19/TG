import express from "express";

import { auth, isAdmin } from "../Middleware/auth.js";
import { arenaWriteLimiter } from "../Middleware/rateLimiter.js";
import * as c from "../controllers/marketingCampaignController.js";

const router = express.Router();

router.use(auth, isAdmin);

router.get("/meta", c.getMeta);

router.post("/audience/preview", c.audiencePreview);
router.post("/audience/export", c.audienceExport);

router.get("/templates", c.listTemplates);
router.post("/templates", arenaWriteLimiter, c.createTemplate);
router.put("/templates/:id", arenaWriteLimiter, c.updateTemplate);
router.delete("/templates/:id", arenaWriteLimiter, c.deleteTemplate);
router.post("/render", c.previewRender);

router.get("/queue/status", c.queueStatus);
router.get("/queue/dlq", c.dlqPeek);
router.post("/queue/dlq/redrive", arenaWriteLimiter, c.dlqRedrive);
router.post("/queue/dlq/discard", arenaWriteLimiter, c.dlqDiscard);

router.get("/suppressions", c.listSuppressions);
router.post("/suppressions", arenaWriteLimiter, c.addSuppression);
router.delete("/suppressions/:id", arenaWriteLimiter, c.removeSuppression);

router.get("/", c.listCampaigns);
router.post("/", arenaWriteLimiter, c.createCampaign);
router.get("/:id", c.getCampaign);
router.put("/:id", arenaWriteLimiter, c.updateCampaign);
router.delete("/:id", arenaWriteLimiter, c.deleteCampaign);
router.get("/:id/recipients", c.listRecipients);
router.post("/:id/send", arenaWriteLimiter, c.sendCampaign);
router.post("/:id/test", arenaWriteLimiter, c.sendTest);
router.post("/:id/pause", arenaWriteLimiter, c.pause);
router.post("/:id/resume", arenaWriteLimiter, c.resume);
router.post("/:id/cancel", arenaWriteLimiter, c.cancel);
router.post("/:id/retry", arenaWriteLimiter, c.retry);
router.post("/:id/recount", arenaWriteLimiter, c.recountCampaign);

export default router;
