import express from 'express';
import {
  createBooking,
  getBookingsByDate,
  cancelBooking,
  getAllBookings
} from '../controllers/Booking.js';

import { auth, isAdmin } from '../Middleware/auth.js';

const router = express.Router();

// Legacy booking API: admin only (not used by the public site).
router.use(auth, isAdmin);

router.post('/create', createBooking);
router.get('/date/:date', getBookingsByDate);
router.delete('/:id', cancelBooking);
router.get('/all', getAllBookings);

export default router;
