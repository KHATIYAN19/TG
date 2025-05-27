
import express from 'express';
import {
    createReview,
    getAllPublishedReviews,
    generateReviewLink,
    getAllReviews,
    togglePublishStatus,
    deleteReview
} from '../controllers/Review.js'; 

import {auth,isAdmin,isEmployee,isUser} from  "../Middleware/auth.js"
const router = express.Router();
router.post('/generate-link',auth,isUser, generateReviewLink);
router.get('/all',auth,isUser, getAllReviews);
router.patch('/:id/toggle-publish', auth,isUser,togglePublishStatus);
router.post('/:token', createReview);
router.get('/published', getAllPublishedReviews);
router.delete("/:id",auth,isAdmin,deleteReview);
export default router;
