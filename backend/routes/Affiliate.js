
import express from 'express';
import { getAllAffiliates, createAffiliate, deleteAffiliate } from '../controllers/Affiliate.js';
import {auth,isAdmin} from "../Middleware/auth.js"
const router = express.Router();
router.get('/', auth,isAdmin,getAllAffiliates);
router.post('/', createAffiliate);
router.delete('/:id',auth,isAdmin, deleteAffiliate);
export default router;