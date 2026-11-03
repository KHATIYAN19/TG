import express from 'express';
import {
  deleteInterest,
  addInterest,
  getAllDeletedInterests,
  getAllInterests
} from '../controllers/Interest.js';

import {auth,isAdmin,isEmployee,isUser} from  "../Middleware/auth.js"
import { publicFormLimiter } from "../Middleware/rateLimiter.js";
import * as PB from "../Middleware/publicBudgets.js";
const router = express.Router();

router.post('/add', publicFormLimiter, PB.formDaily, addInterest);
router.delete('/delete/:id', auth,isUser,deleteInterest);
router.get('/all',auth,isUser, getAllInterests);
router.get('/deleted-all',auth,isUser, getAllDeletedInterests);

export default router;
