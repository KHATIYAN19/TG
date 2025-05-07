import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  altText: {
    type: String,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPublished: {
    type: Boolean,
    default: false,
    required: true,
  },
}, {
  timestamps: true,
});

const PortfolioItem = mongoose.model('PortfolioItem', portfolioItemSchema);

export default PortfolioItem;