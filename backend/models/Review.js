import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.'],
    trim: true,
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required.'],
    trim: true,
  },
  position: {
    type: String,
    required: [true, 'Position is required.'],
    trim: true,
  },
  clientFeedback: {
    type: String,
    required: [true, 'Client feedback is required.'],
    trim: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required.'],
    min: [1, 'Rating must be at least 1.'],
    max: [5, 'Rating cannot be more than 5.'],
  },
  isPublished: { 
    type: Boolean,
    default: false, 
    index: true, 
  },
}, {
  timestamps: true,
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
