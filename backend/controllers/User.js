import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import User from '../models/User.js';

export const signup = async (req, res) => {
  try {
    const { name, email, mobile, password, role } = req.body;

    if (!name || !email || !mobile || !password) {
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
      role: role || 'admin'
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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log(`OTP sent to user: ${otp}`);

    res.status(200).json({ success: true, message: 'OTP sent successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


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
      { expiresIn: '1d' }
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
  