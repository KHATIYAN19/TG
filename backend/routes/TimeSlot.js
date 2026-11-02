import express from 'express';
import {
  addTimeSlot,
  getTimeSlotsByDate,
  deleteTimeSlot,
  getWeeklySlots
} from '../controllers/TimeSlot.js';

import { auth, isAdmin } from '../Middleware/auth.js';

const router = express.Router();

// Legacy time-slot API: admin only (not used by the public site).
router.use(auth, isAdmin);

router.post('/add', addTimeSlot);
router.get('/date/:date', getTimeSlotsByDate);
router.delete('/:id', deleteTimeSlot);
router.get('/week/all', getWeeklySlots);

export default router;
