import mongoose from 'mongoose';
const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long.'],
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address.'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Contact number is required.'],
      trim: true,
    },
    service: {
      type: String,
      required: [true, 'Service selection is required.'],
      trim: true,
      enum: {
        values: [
          'PPC Advertising',
          'Social Media Marketing',
          'Email Marketing',
          'Web Development',
          'Affiliate Marketing',
          'Other Inquiry'
        ],
        message: 'Invalid service selected.'
      }
    },
    subject: {
      type: String,
      required: [true, 'Subject is required.'],
      trim: true,
      minlength: [5, 'Subject must be at least 5 characters long.'],
    },
    message: {
      type: String,
      required: [true, 'Message is required.'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters long.'],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    replies: {
      type: [ 
        {
          replyText: { 
            type: String,
            required: true,
            trim: true,
          },
          replyDate: {
            type: Date,
            required: true,
            default: Date.now, 
          },
        }
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);
const Contact = mongoose.model('Contact', contactSchema);
export default Contact;