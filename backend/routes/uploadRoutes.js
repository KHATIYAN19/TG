import express from "express";

import { auth } from "../Middleware/auth.js";
import { arenaWriteLimiter } from "../Middleware/rateLimiter.js";
import { presignUpload, confirmUpload, getDownloadUrl, removeObject, listPurposes } from "../controllers/uploadController.js";

const router = express.Router();

router.use(auth);

router.get("/purposes", listPurposes);
router.post("/presign", arenaWriteLimiter, presignUpload);
router.post("/confirm", confirmUpload);
router.get("/download", getDownloadUrl);
router.delete("/", arenaWriteLimiter, removeObject);

export default router;
