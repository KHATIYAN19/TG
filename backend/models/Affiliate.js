import mongoose from 'mongoose';

const affiliateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  companyName: { type: String, required: true },
  service: { type: String, required: true },
}, { timestamps: true });

const Affiliate = mongoose.model('Affiliate', affiliateSchema);

export default Affiliate;
