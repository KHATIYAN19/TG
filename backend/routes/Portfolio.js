import express from 'express';
import {
  createPortfolioItem,
  deletePortfolioItem,
  toggleIsPublished,
  getAllPortfolioItems,
  getPublishedPortfolioItems,
  getPortfolioItemBySlug
} from '../controllers/Portfolio.js';
import {auth,isAdmin,isEmployee,isUser} from  "../Middleware/auth.js"

import multer from 'multer';
const storage = multer.diskStorage({}); 
const uploadMiddleware = multer({ storage:multer.diskStorage({}),limits:{fileSize: 5 * 1024 * 1024 } }); 

const router = express.Router();

router.post('/',  uploadMiddleware.single('image'),auth,isUser, createPortfolioItem); 
router.get('/',auth,isUser, getAllPortfolioItems);
router.get('/published', getPublishedPortfolioItems);
router.delete('/:id', auth,isAdmin,deletePortfolioItem);
router.patch('/:id/toggle', auth,isUser,toggleIsPublished);
router.get('/:slug', getPortfolioItemBySlug);
export default router;