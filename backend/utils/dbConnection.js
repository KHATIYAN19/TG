import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the .env file.');
    }
    await mongoose.connect(process.env.MONGO_URI, {
      tls: true
      })
      
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};
export default connectDB;
