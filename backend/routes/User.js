import express from 'express';
import { signup, login, verifyOtp,resendOtp } from '../controllers/User.js'; // ✅ use `.js` extension in ES modules

const router = express.Router();
router.post('/resend-otp', resendOtp);

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

export default router;
