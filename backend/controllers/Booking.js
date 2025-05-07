import Booking from '../models/Booking.js';
import TimeSlot from '../models/TimeSlot.js';

export const createBooking = async (req, res) => {
  const { date, timeStart, timeEnd, name, email, phone, service, location } = req.body;
  try {
    const slot = await TimeSlot.findOne({ date, timeStart, timeEnd });
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (slot.isBooked) return res.status(400).json({ success: false, message: 'Slot already booked' });

    await Booking.create({ date, timeStart, timeEnd, name, email, phone, service, location });
    slot.isBooked = true;
    await slot.save();

    res.json({ success: true, message: 'Booking created' });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const getBookingsByDate = async (req, res) => {
  const { date } = req.params;
  try {
    const bookings = await Booking.find({ date }).sort({ timeStart: 1 });
    res.json({ success: true, bookings });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const cancelBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ success: false });

    const slot = await TimeSlot.findOne({ date: booking.date, timeStart: booking.timeStart, timeEnd: booking.timeEnd });
    if (slot) {
      slot.isBooked = false;
      await slot.save();
    }

    await Booking.findByIdAndDelete(id);
    res.json({ success: true, message: 'Booking cancelled' });
  } catch {
    res.status(500).json({ success: false });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ date: 1, timeStart: 1 });
    res.json({ success: true, bookings });
  } catch {
    res.status(500).json({ success: false });
  }
};
