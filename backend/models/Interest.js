import mongoose from 'mongoose';
const interestSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long.'],
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
          'Other Inquiry',
          'Google/Meta Ads',
          'Gen AI'
        ],
        message: 'Invalid service selected.'
      }
    },
    is_deleted:{
        type:Boolean,
        default:false
    }
  },
  {
    timestamps: true,
  }
);
const Interest = mongoose.model('Interest', interestSchema);
export default Interest;