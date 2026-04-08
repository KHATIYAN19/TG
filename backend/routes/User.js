import express from 'express';
import { signup, login, verifyOtp,resendOtp ,getAllUsers,
  deleteUser,
  toggleBlockStatus, resetPassword,changePassword,getUserByEmail} from '../controllers/User.js'; 
const router = express.Router();
router.post('/resend-otp', resendOtp);
import {auth,isAdmin,isEmployee,isUser} from  "../Middleware/auth.js"
router.post('/signup',auth,isAdmin, signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.get('/',auth,isAdmin, getAllUsers);
router.delete('/:userId', auth,isAdmin,deleteUser);
router.put('/:userId/toggle-block', auth,isAdmin,toggleBlockStatus);
router.put('/reset-password/:id',auth,isAdmin, resetPassword);
router.put('/change-password',auth, changePassword); 
router.get("/employee/:email", auth,isAdmin,getUserByEmail)
export default router;
