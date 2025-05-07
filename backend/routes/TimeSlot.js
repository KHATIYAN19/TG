import express from 'express';
import {
  addTimeSlot,
  getTimeSlotsByDate,
  deleteTimeSlot,
  getWeeklySlots
} from '../controllers/TimeSlot.js';

const router = express.Router();

router.post('/add', addTimeSlot);
router.get('/date/:date', getTimeSlotsByDate);
router.delete('/:id', deleteTimeSlot);
router.get('/week/all', getWeeklySlots);

export default router;
