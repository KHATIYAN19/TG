import express from 'express';
import {
    createBlogPost,
    getAllPublishedBlogPosts,
    getAllBlogPostsAdmin,
    getBlogPostBySlug,
    deleteBlogPost,
    togglePublishStatus
} from '../controllers/Blog.js'; 
import multer from 'multer';
import {auth, isAdmin ,isUser,isEmployee} from '../Middleware/auth.js';
const storage = multer.diskStorage({}); 
const uploadMiddleware = multer({ storage:multer.diskStorage({}),limits:{fileSize: 5 * 1024 * 1024 } }); 

const router = express.Router();

router.post('/create', uploadMiddleware.single('imageFile'), auth,isUser,createBlogPost);

router.get('/', getAllPublishedBlogPosts);

router.get('/all', auth,isUser,getAllBlogPostsAdmin);

router.get('/:slug', getBlogPostBySlug);

router.delete('/:id',auth,isAdmin, deleteBlogPost); 

router.patch('/:id/toggle-publish',auth,isUser, togglePublishStatus); 

export default router;
