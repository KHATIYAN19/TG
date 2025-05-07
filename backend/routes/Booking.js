import express from 'express';
import {
  createBooking,
  getBookingsByDate,
  cancelBooking,
  getAllBookings
} from '../controllers/Booking.js';

const router = express.Router();

router.post('/create', createBooking);
router.get('/date/:date', getBookingsByDate);
router.delete('/:id', cancelBooking);
router.get('/all', getAllBookings);

export default router;
