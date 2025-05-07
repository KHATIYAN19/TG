import mongoose from 'mongoose';
import crypto from 'crypto';

const reviewTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required to generate a review link.'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
  },
  status: {
    type: String,
    enum: ['pending', 'used', 'expired'],
    default: 'pending',
    index: true,
  },
}, {
  timestamps: true,
});

reviewTokenSchema.methods.generateToken = function() {
  this.token = crypto.randomBytes(32).toString('hex');
};

const ReviewToken = mongoose.model('ReviewToken', reviewTokenSchema);

export default ReviewToken;
