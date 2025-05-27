
import express from 'express';
import { getAllAffiliates, createAffiliate, deleteAffiliate } from '../controllers/Affiliate.js';
import {auth,isAdmin,isEmployee,isUser} from "../Middleware/auth.js"
const router = express.Router();
router.get('/', auth,isUser,getAllAffiliates);
router.post('/',auth,isUser, createAffiliate);
router.delete('/:id',auth,isUser,deleteAffiliate);
export default router;