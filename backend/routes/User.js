import express from 'express';
import { signup, login, verifyOtp,resendOtp ,getAllUsers,
  deleteUser,
  toggleBlockStatus, } from '../controllers/User.js'; 

const router = express.Router();
router.post('/resend-otp', resendOtp);
import {auth,isAdmin,isEmployee,isUser} from  "../Middleware/auth.js"

router.post('/signup',auth,isAdmin, signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.get('/',auth,isAdmin, getAllUsers);
router.delete('/:userId', auth,isAdmin,deleteUser);
router.put('/:userId/toggle-block', auth,isAdmin,toggleBlockStatus);

export default router;
