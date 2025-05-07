import TimeSlot from '../models/TimeSlot.js';
import dayjs from 'dayjs';

export const addTimeSlot = async (req, res) => {
  const { date, timeStart, timeEnd } = req.body;
   console.log(date,timeEnd,timeStart)
  try {
    const start = dayjs(`${date} ${timeStart}`, 'YYYY-MM-DD HH:mm').utc();
    const end = dayjs(`${date} ${timeEnd}`, 'YYYY-MM-DD HH:mm').utc();
  console.log(start,end);
    if (!start.isValid() || !end.isValid() || end.isBefore(start)) {
      return res.status(400).json({ success: false, message: 'Invalid time range' });
    }
  console.log(start,end);


    
    const clashingSlots = await TimeSlot.find({
      startTimeUTC: { $lt: end.toDate() },
      endTimeUTC: { $gt: start.toDate() }
    });
    console.log(start,end,clashingSlots);

    if (clashingSlots.length > 0) {
      return res.status(400).json({ success: false, message: 'Time slot overlaps with existing slot' });
    }
  console.log(start,end);
   
    
    const timeslot=await TimeSlot.create({
      startTimeUTC: start.toDate(),
      endTimeUTC: end.toDate(),
    });

  console.log(start,end,timeslot);


    res.json({ success: true, message: 'Time slot created',timeslot });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', err });
  }
};

export const getTimeSlotsByDate = async (req, res) => {
    console.log("enter")
  const { date } = req.params; 
  console.log(date);
  try {
    const slots = await TimeSlot.find({ date }).sort({ timeStart: 1 });
    res.json({ success: true, slots });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const deleteTimeSlot = async (req, res) => {
    
  const { id } = req.params;
  try {
    const slot = await TimeSlot.findById(id);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ success: false, message: 'Slot is booked' });

    await TimeSlot.findByIdAndDelete(id);
    res.json({ success: true, message: 'Slot deleted' });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const getWeeklySlots = async (req, res) => {
    console.log("enter")
  try {
    const today = dayjs().startOf('day');
    const results = [];

    for (let i = 0; i < 8; i++) {
      const date = today.add(i, 'day').toDate();
      const slots = await TimeSlot.find({ date }).sort({ timeStart: 1 });
      results.push({ date, slots });
    }

    res.json({ success: true, data: results });
  } catch {
    res.status(500).json({ success: false });
  }
};
