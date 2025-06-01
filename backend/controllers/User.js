import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/User.js';
import fs from "fs";
import  path from 'path';
import sendMail from '../utils/MailSender.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const signup = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;
    if (!name || !email || !mobile || !password||!role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    if (!/^\d{10}$/.test(mobile)) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number' });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists with email or mobile' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      mobile,
      password: hashedPassword,
      role: role 
    });
    await user.save();
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: 'Server error',error });
  }
};
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required' });
    }
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if(user.block){
      return res.status(400).json({
         success:false,
         message:"You are block by admin"
      })
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();
   console.log("otp is", otp);
    const htmlPath = path.join(__dirname, '../templates/otp-email-template.html');
    let htmlTemplate = fs.readFileSync(htmlPath, 'utf-8');
    htmlTemplate = htmlTemplate.replace('{{OTP_CODE}}', otp);

    const subject = 'Your TargetTrek OTP';
    const plainText = `Your OTP is ${otp}. It will expire in 10 minutes.`;

    await sendMail(user.email, subject, plainText, htmlTemplate);

    res.status(200).json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    console.error("error",error);
    res.status(500).json({ success: false, message: 'Server error' ,error});
  }
}

export const verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;
    if (!identifier || !otp) {
      return res.status(400).json({ success: false, message: 'Identifier and OTP are required' });
    }
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobile: identifier }]
    });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.otp !== otp || Date.now() > new Date(user.otpExpiry).getTime()) {
      return res.status(401).json({ success: false, message: 'Invalid or expired OTP' });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'JWT secret is not set in environment' });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


export const resendOtp = async (req, res) => {
    try {
      const { identifier } = req.body;
  
      if (!identifier) {
        return res.status(400).json({ success: false, message: 'Identifier is required' });
      }
  
      const user = await User.findOne({
        $or: [{ email: identifier }, { mobile: identifier }]
      });
  
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = otp;
      user.otpExpiry = Date.now() + 10 * 60 * 1000;
      await user.save();
  
      console.log(`Resent OTP to user: ${otp}`);
  
      res.status(200).json({ success: true, message: 'OTP resent successfully' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  };
  




  export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'name email mobile role block _id');
    res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};

export const toggleBlockStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    user.block = !user.block;
    await user.save();
    res.status(200).json({
      success: true,
      message: `User block status updated to ${user.block ? 'blocked' : 'unblocked'}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        block: user.block,
      },
    });
  } catch (error) {
    console.error('Error toggling block status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update block status',
      error: error.message,
    });
  }
};

export const resetPasswordbyadmin=async(req,res)=>{
    try{
        const {email}=req.body;
        const user=await User.find({email});
        if (!user) {
           return res.status(404).json({ success: false, message: 'User not found' });
        }
         if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
        }
       const hashedPassword = await bcrypt.hash(user.email, 10);
       user.password=hashedPassword;
       await user.save();
       res.status(201).json({ success: true, message: 'Password reset successfully' });
    }catch(err){
      return res.status(400).json({
        success:false,
        message:"Something went wrong"
      })
    }
}


export const changepassword=async(req,res)=>{
   try{
      const {email,password}=req.body;
   }catch(e){
      return res.status(400).json({
        success:false,
        message:"Something went wrong"
      })
   }
}