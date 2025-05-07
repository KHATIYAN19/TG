import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // Not used in "Coming Soon" version
// import { z } from 'zod'; // Not used in "Coming Soon" version
// import { addDays, format, startOfDay, setHours, setMinutes, setSeconds, setMilliseconds } from 'date-fns'; // Not used in "Coming Soon" version
// import { format as formatTz } from 'date-fns-tz'; // Not used in "Coming Soon" version
import { Calendar, Clock, Loader2, User, Wrench, Hourglass } from 'lucide-react'; // Added Hourglass
import toast, { Toaster } from 'react-hot-toast'; // Kept for potential future use or general notifications

// Constants are kept for context but not directly used in "Coming Soon" UI
// const BUSINESS_TIMEZONE = 'Asia/Kolkata';
// const BASE_SLOTS_HOURS = [9, 10, 11, 14, 15, 16];
// const BASE_URL = 'YOUR_BACKEND_BASE_URL';

// const initialBookedSlotsData = {
//  [formatTz(setHours(new Date('2025-05-06T00:00:00'), 10), "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: BUSINESS_TIMEZONE })]: true,
// };

// const fieldServiceOptions = [
//     'SEO Consultation',
//     'PPC Campaign Audit',
// ];

// const bookingSchema = z.object({
//   name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
//   email: z.string().email({ message: 'Please enter a valid email address' }),
//   phone: z.string().min(10, { message: 'Please enter a valid 10-digit phone number' }).regex(/^\+?[0-9\s-()]{10,}$/, {message: "Invalid phone number format (min 10 digits)"}),
//   location: z.string().min(3, { message: 'Location must be at least 3 characters' }),
//   service: z.string().min(1, { message: 'Please select a service' }),
// });

const BookCallPage = () => {
  // State variables are kept for context but not directly used in "Coming Soon" UI
  // const [availableDates, setAvailableDates] = useState([]);
  // const [selectedDate, setSelectedDate] = useState(null);
  // const [availableSlots, setAvailableSlots] = useState([]);
  // const [selectedSlot, setSelectedSlot] = useState(null);
  // const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '', service: '' });
  // const [formErrors, setFormErrors] = useState({});
  // const [bookingStatus, setBookingStatus] = useState('idle');
  // const [bookedSlots, setBookedSlots] = useState({});


  // useEffect hooks related to booking logic are commented out
  /*
  useEffect(() => {
    const dates = generateUpcomingDates(7);
    setAvailableDates(dates);
    if (dates.length > 0) {
        const firstAvailableDate = dates.find(d => d >= startOfDay(new Date())) || dates[0];
        handleDateSelect(firstAvailableDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const slots = generateTimeSlots(selectedDate, bookedSlots);
      setAvailableSlots(slots);
    } else {
      setAvailableSlots([]);
    }
    setSelectedSlot(null);

    if (bookingStatus !== 'submitting') {
        if (selectedDate) {
            setBookingStatus('selectingTime');
        } else {
            setBookingStatus('idle');
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, bookedSlots]);
  */

  // Handler functions related to booking logic are commented out
  /*
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setFormData(prev => ({ ...prev, name: '', email: '', phone: '', location: '' }));
    setFormErrors({});
  };

  const handleTimeSelect = (slot) => {
    if (!slot.isBooked && !slot.isPast) {
      setSelectedSlot(slot);
      setBookingStatus('form');
      setFormErrors({});
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (original submit logic)
  };
  */

  // Render functions for booking UI are commented out
  // const renderTimeSlots = () => { /* ... */ };
  // const renderForm = () => { /* ... */ };

  return (
    <div className="pt-20 pb-16 bg-gradient-to-b from-white to-blue-100 min-h-screen flex flex-col items-center justify-center text-center px-4">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="bg-white p-8 md:p-12 rounded-xl shadow-2xl max-w-lg w-full transform transition-all duration-500 ease-out hover:scale-105">
        <Hourglass className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-bounce" />
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Coming Soon!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          We're working hard to bring you this feature. Please check back later.
        </p>
        
        <div className="flex items-center justify-center space-x-3 text-blue-600">
          <Wrench className="w-6 h-6 animate-pulse" />
          <span className="font-semibold">Under Construction</span>
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>

        <p className="mt-10 text-sm text-gray-500">
          Thank you for your patience!
        </p>
      </div>
      
      <style>{`
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-5%);
            animation-timing-function: cubic-bezier(0.8,0,1,1);
          }
          50% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0,0,0.2,1);
          }
        }
        .animate-bounce {
          animation: bounce 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default BookCallPage;
