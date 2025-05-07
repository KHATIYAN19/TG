import express from 'express';
import {
  createPortfolioItem,
  deletePortfolioItem,
  toggleIsPublished,
  getAllPortfolioItems,
  getPublishedPortfolioItems,
  getPortfolioItemBySlug
} from '../controllers/Portfolio.js';

import multer from 'multer';
const storage = multer.diskStorage({}); 
const uploadMiddleware = multer({ storage:multer.diskStorage({}),limits:{fileSize: 5 * 1024 * 1024 } }); 

const router = express.Router();

router.post('/',  uploadMiddleware.single('image'), createPortfolioItem); 
router.get('/', getAllPortfolioItems);
router.get('/published', getPublishedPortfolioItems);
router.delete('/:id', deletePortfolioItem);
router.patch('/:id/toggle', toggleIsPublished);
router.get('/:slug', getPortfolioItemBySlug);
export default router;