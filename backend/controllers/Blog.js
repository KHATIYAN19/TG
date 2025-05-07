import BlogPost from '../models/Blog.js';
import uploadFile from '../utils/cloudinary.js';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';

export const createBlogPost = asyncHandler(async (req, res) => {
    const { title, slug, excerpt, author, tags, imageUrl, isPublished } = req.body;

    if (!title || title.trim().length < 5) return res.status(400).json({ success: false, error: { message: 'Title is required (min 5 chars).' } });
    if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim())) return res.status(400).json({ success: false, error: { message: 'Valid slug is required (lowercase, alphanumeric, hyphens).' } });
    if (!excerpt || excerpt.trim().length < 10) return res.status(400).json({ success: false, error: { message: 'Excerpt is required (min 10 chars).' } });
    if (!author || author.trim().length < 2) return res.status(400).json({ success: false, error: { message: 'Author is required (min 2 chars).' } });
    if (!tags || (Array.isArray(tags) ? tags.length === 0 : tags.trim() === '')) return res.status(400).json({ success: false, error: { message: 'At least one tag is required.' } });

    const existingSlug = await BlogPost.findOne({ slug: slug.trim().toLowerCase() });
    if (existingSlug) {
        return res.status(400).json({ success: false, error: { message: 'Slug already exists. Please choose a unique one.' } });
    }

    let finalImageUrl = imageUrl?.trim() || null;
    let cloudinaryId = null;

    if (req.file) {
        if (finalImageUrl) {
             return res.status(400).json({ success: false, error: { message: 'Provide either an image file or an image URL, not both.' } });
        }
        try {
            const result = await uploadFile(req.file.path);

            finalImageUrl = result.secure_url;
            cloudinaryId = result.public_id;
        } catch (uploadError) {
            console.error("Cloudinary Upload Error:", uploadError);
            return res.status(500).json({ success: false, error: { message: 'Failed to upload image.' } });
        }
    } else if (!finalImageUrl) {
        return res.status(400).json({ success: false, error: { message: 'An image URL or file upload is required.' } });
    }

    let processedTags = [];
    if (Array.isArray(tags)) {
        processedTags = tags.map(tag => tag.trim().toLowerCase()).filter(tag => tag);
    } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag);
    }
     if (processedTags.length === 0) {
         return res.status(400).json({ success: false, error: { message: 'At least one valid tag is required after processing.' } });
     }


    const newPost = new BlogPost({
        title: title.trim(),
        slug: slug.trim().toLowerCase(),
        excerpt: excerpt.trim(),
        author: author.trim(),
        tags: processedTags,
        imageUrl: finalImageUrl,
        cloudinaryPublicId: cloudinaryId,
        isPublished: isPublished === 'true' || isPublished === true,
    });

    const savedPost = await newPost.save();
    res.status(201).json({ success: true, data: savedPost,message:"Blog Uploaded" });
});


export const getAllPublishedBlogPosts = asyncHandler(async (req, res) => {
    const posts = await BlogPost.find({ isPublished: true })
                                .sort({ createdAt: -1 })
                                .select('-cloudinaryPublicId');
    res.status(200).json({ success: true, data: posts });
});


export const getAllBlogPostsAdmin = asyncHandler(async (req, res) => {
    const posts = await BlogPost.find({})
                                .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: posts });
});
export const getBlogPostBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const post = await BlogPost.findOne({ slug: slug.toLowerCase() })
                               .select('-cloudinaryPublicId');

    if (!post||!post.isPublished) {
        return res.status(404).json({ success: false, error: { message: 'Blog post not found.' } });
    }
    res.status(200).json({ success: true, data: post });
});


export const deleteBlogPost = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: { message: 'Invalid blog post ID format.' } });
    }

    const postToDelete = await BlogPost.findById(id);

    if (!postToDelete) {
         return res.status(404).json({ success: false, error: { message: 'Blog post not found.' } });
    }

    if (postToDelete.cloudinaryPublicId) {
        try {
            await upload.deleteFile(postToDelete.cloudinaryPublicId);
        } catch (deleteError) {
            console.error("Cloudinary Delete Error:", deleteError);
        }
    }

    await BlogPost.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Blog post deleted successfully.' });
});

export const togglePublishStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: { message: 'Invalid blog post ID format.' } });
    }

    const post = await BlogPost.findById(id);

    if (!post) {
        return res.status(404).json({ success: false, error: { message: 'Blog post not found.' } });
    }

    post.isPublished = !post.isPublished;
    const updatedPost = await post.save();

    res.status(200).json({
        success: true,
        message: `Blog post marked as ${updatedPost.isPublished ? 'published' : 'draft'}.`,
        data: updatedPost
    });
});