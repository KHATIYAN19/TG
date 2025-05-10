import Review from '../models/Review.js';
import ReviewToken from '../models/ReviewToken.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { z } from 'zod'; 

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import  sendMail  from '../utils/MailSender.js'; 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';


const emailSchema = z.string().email({ message: 'Invalid email address provided.' });



export const generateReviewLink = async (req, res) => {
    const { email } = req.body;
    const validationResult = emailSchema.safeParse(email);
    if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input.';
        return res.status(400).json({ message: errorMessage });
    }

    const validatedEmail = validationResult.data;

    try {
        const reviewToken = new ReviewToken({ email: validatedEmail });
        reviewToken.generateToken();
        await reviewToken.save();

        const reviewLink = `${FRONTEND_BASE_URL}/submit-review/${reviewToken.token}`;
        console.log(`INFO: Sending review link ${reviewLink} to ${validatedEmail}`);

        // Read and inject HTML
        const htmlPath = path.join(__dirname, '../templates/reviewEmailTemplate.html');
        let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        htmlContent = htmlContent.replace(/{{REVIEW_LINK}}/g, reviewLink);

        await sendMail(
            validatedEmail,
            'We Value Your Feedback – Share Your Review!',
            `Please visit the following link to submit your feedback: ${reviewLink}`,
            htmlContent
        );

        res.status(201).json({
            message: `Review link generated successfully and sent to ${validatedEmail}.`,
            link: reviewLink,
        });
    } catch (error) {
        console.error('Error generating review link:', error);
        if (error.code === 11000) {
            return res.status(500).json({ message: 'Failed to generate a unique token. Please try again.' });
        }
        res.status(500).json({ message: 'Server error generating link.' });
    }
};
// --- Public (via Token): Create a review using a unique link ---
export const createReview = async (req, res) => {
    const { token } = req.params;
    const { name, companyName, position, clientFeedback, rating } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Review token is missing.' });
    }
    if (!name || !companyName || !position || !clientFeedback || rating === undefined) {
        return res.status(400).json({ message: 'Missing required review fields.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const reviewToken = await ReviewToken.findOne({ token: token }).session(session);

        if (!reviewToken) {
            await session.abortTransaction(); session.endSession();
            return res.status(404).json({ message: 'Invalid or expired review link.' });
        }
        if (reviewToken.status !== 'pending') {
            await session.abortTransaction(); session.endSession();
            let message = 'This review link has already been used.';
            if (reviewToken.status === 'expired') message = 'This review link has expired.';
            return res.status(400).json({ message: message });
        }

        const newReview = new Review({ name, companyName, position, clientFeedback, rating, isPublished: false });
        const validationError = newReview.validateSync();
        if (validationError) {
            await session.abortTransaction(); session.endSession();
            const errors = Object.values(validationError.errors).map(el => el.message);
            return res.status(400).json({ message: 'Validation failed.', errors });
        }
        await newReview.save({ session });

        reviewToken.status = 'used';
        await reviewToken.save({ session });

        await session.commitTransaction();
        session.endSession();
        res.status(201).json({ message: 'Review submitted successfully. Thank you!', review: newReview });

    } catch (error) {
        await session.abortTransaction(); session.endSession();
        console.error('Error creating review:', error);
        if (error.code === 11000) return res.status(409).json({ message: 'A database conflict occurred.' });
        res.status(500).json({ message: 'Server error submitting review.' });
    }
};


export const getAllPublishedReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
        res.status(200).json({reviews,success:true});
    } catch (error) {
        console.error('Error fetching published reviews:', error);
        res.status(500).json({ message: 'Server error fetching reviews.',success:false });
    }
};


export const getAllReviews = async (req, res) => {
    try {
        const reviews = await Review.find().sort({ createdAt: -1 }).lean();
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({ message: 'Server error fetching reviews.' });
    }
};


export const togglePublishStatus = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid review ID format.' });
    }
    try {
        const review = await Review.findById(id);
        if (!review) return res.status(404).json({ message: 'Review not found.' });
        review.isPublished = !review.isPublished;
        await review.save();
        res.status(200).json({
            message: `Review ${review.isPublished ? 'published' : 'unpublished'} successfully.`,
            review: review,
        });
    } catch (error) {
        console.error('Error toggling review publish status:', error);
        res.status(500).json({ message: 'Server error updating review status.' });
    }
};

export const deleteReview = async (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Review ID is missing.' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const review = await Review.findById(id).session(session);
        if (!review) {
            await session.abortTransaction(); session.endSession();
            return res.status(404).json({ message: 'Review not found.',success:false });
        }

        await Review.deleteOne({ _id: id }).session(session);

        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'Review deleted successfully.',success:true });
    } catch (error) {
        await session.abortTransaction(); session.endSession();
        console.error('Error deleting review:', error);
        res.status(500).json({ message: 'Server error deleting review.',success:false });
    }
};