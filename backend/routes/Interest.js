import express from 'express';
import {
  deleteInterest,
  addInterest,
  getAllDeletedInterests,
  getAllInterests
} from '../controllers/Interest.js';

import {auth,isAdmin,isEmployee,isUser} from  "../Middleware/auth.js"
const router = express.Router();

router.post('/add', addInterest);
router.delete('/delete/:id', auth,deleteInterest);
router.get('/all',auth, getAllInterests);
router.get('/deleted-all',auth, getAllDeletedInterests);

export default router;
