import express from 'express';
import {
    createBlogPost,
    getAllPublishedBlogPosts,
    getAllBlogPostsAdmin,
    getBlogPostBySlug,
    deleteBlogPost,
    togglePublishStatus
} from '../controllers/Blog.js'; 

import {auth, isAdmin } from '../Middleware/auth.js';
import multer from 'multer';
const storage = multer.diskStorage({}); 
const uploadMiddleware = multer({ storage:multer.diskStorage({}),limits:{fileSize: 5 * 1024 * 1024 } }); 

const router = express.Router();

router.post('/create', uploadMiddleware.single('imageFile'), auth,isAdmin,createBlogPost);

router.get('/', getAllPublishedBlogPosts);

router.get('/all', auth,isAdmin,getAllBlogPostsAdmin);

router.get('/:slug', getBlogPostBySlug);

router.delete('/:id',auth,isAdmin, deleteBlogPost); 

router.patch('/:id/toggle-publish',auth,isAdmin, togglePublishStatus); 

export default router;
