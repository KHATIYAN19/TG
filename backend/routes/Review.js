
import express from 'express';
import {
    createReview,
    getAllPublishedReviews,
    generateReviewLink,
    getAllReviews,
    togglePublishStatus
} from '../controllers/Review.js'; 

import {auth,isAdmin} from  "../Middleware/auth.js"
const router = express.Router();
router.post('/generate-link',auth,isAdmin, generateReviewLink);
router.get('/all',auth,isAdmin, getAllReviews);
router.patch('/:id/toggle-publish', auth,isAdmin,togglePublishStatus);
router.post('/:token', createReview);
router.get('/published', getAllPublishedReviews);
export default router;
