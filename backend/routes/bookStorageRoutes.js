import express from "express";

import { auth, isAdmin } from "../Middleware/auth.js";
import { arenaWriteLimiter } from "../Middleware/rateLimiter.js";
import {
  getBookStorage,
  transferBookStorage,
  updateBookStorage,
} from "../controllers/bookStorageController.js";

const router = express.Router();

router.use(auth, isAdmin);

router.get("/", getBookStorage);
router.put("/", arenaWriteLimiter, express.json(), updateBookStorage);
router.post("/transfer", arenaWriteLimiter, express.json(), transferBookStorage);

export default router;
