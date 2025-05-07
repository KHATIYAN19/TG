import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required.'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens.'],
    },
    title: {
      type: String,
      required: [true, 'Title is required.'],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required.'],
      trim: true,
    },
    author: {
      type: String,
      ref: 'User',
      required: [true, 'Author is required.'],
      trim: true,
    },
    imageUrl: {
      type: String,
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
      default: 'Blog post image',
    },
    cloudinaryPublicId: { 
        type: String,
        trim: true,
    },
    tags: {
      type: [String],
      validate: [v => Array.isArray(v) && v.length > 0, 'At least one tag is required.'],
      set: (tags) => tags.map(tag => tag.trim().toLowerCase()),
    },
    isPublished: {
        type: Boolean,
        default: true,
    }
  },
  {
    timestamps: true,
  }
);
blogPostSchema.index({ slug: 1 });
const BlogPost = mongoose.model('BlogPost', blogPostSchema);
export default BlogPost;
