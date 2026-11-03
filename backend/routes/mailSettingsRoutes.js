import express from "express";

import { auth, isAdmin } from "../Middleware/auth.js";
import { arenaWriteLimiter } from "../Middleware/rateLimiter.js";
import { getMail, updateMail, testMail } from "../controllers/mailSettingsController.js";

const router = express.Router();

router.use(auth, isAdmin);

router.get("/", getMail);
router.put("/", arenaWriteLimiter, updateMail);
router.post("/test", arenaWriteLimiter, testMail);

export default router;
