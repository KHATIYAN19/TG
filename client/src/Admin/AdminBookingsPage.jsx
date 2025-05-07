import React, { useState, useEffect } from 'react';
import { format, parseISO, isBefore, addMinutes, startOfDay, endOfDay, addDays, isEqual, isValid } from 'date-fns';
import { format as formatTz } from 'date-fns-tz';
import { z } from 'zod';
import { User, Mail, Phone, MapPin, Calendar, Clock, XCircle, Send, MessageSquare, Bell, Search, X, Loader2 } from 'lucide-react';

const initialDummyBookings = [
  { _id: 'book1', timeSlot: 'slot1', startTimeUTC: '2025-05-01T03:30:00.000Z', name: 'Alice Wonderland', email: 'alice@example.com', phone: '+91 98765 43210', location: 'Mumbai, India', status: 'confirmed', createdAt: '2025-04-28T10:00:00.000Z' },
  { _id: 'book2', timeSlot: 'slot4', startTimeUTC: '2025-05-01T08:30:00.000Z', name: 'Bob The Builder', email: 'bob@example.com', phone: '+91 87654 32109', location: 'Delhi, India', status: 'confirmed', createdAt: '2025-04-29T11:00:00.000Z' },
  { _id: 'book3', timeSlot: 'slot6', startTimeUTC: '2025-05-02T09:00:00.000Z', name: 'Charlie Chaplin', email: 'charlie@example.com', phone: '+91 76543 21098', location: 'Online', status: 'cancelled', createdAt: '2025-04-30T09:00:00.000Z' },
  { _id: 'book4', timeSlot: 'slot_past', startTimeUTC: '2025-04-29T05:30:00.000Z', name: 'Diana Prince', email: 'diana@example.com', phone: '+91 65432 10987', location: 'Themyscira', status: 'confirmed', createdAt: '2025-04-25T15:00:00.000Z' },
  { _id: 'book5', timeSlot: 'slot8', startTimeUTC: '2025-05-03T04:00:00.000Z', name: 'Ethan Hunt', email: 'ethan@example.com', phone: '+91 54321 09876', location: 'Remote', status: 'confirmed', createdAt: '2025-05-01T12:00:00.000Z' },
  { _id: 'book6', timeSlot: 'slot9', startTimeUTC: '2025-05-03T05:00:00.000Z', name: 'Fiona Shrek', email: 'fiona@example.com', phone: '+91 43210 98765', location: 'Far Far Away', status: 'confirmed', createdAt: '2025-05-01T14:00:00.000Z' },
  { _id: 'book7', timeSlot: 'slot10', startTimeUTC: '2025-05-15T06:00:00.000Z', name: 'Geralt Rivia', email: 'geralt@example.com', phone: '+91 11223 34455', location: 'Kaer Morhen', status: 'confirmed', createdAt: '2025-05-05T10:00:00.000Z' },
];

const SLOT_DURATION_MINUTES = 30;
const BUSINESS_TIMEZONE = 'Asia/Kolkata';

const messageSchema = z.object({
  subject: z.string().min(1, { message: 'Subject cannot be empty' }),
  body: z.string().min(1, { message: 'Message body cannot be empty' }),
});

const generateDates = (count = 7) => {
  const dates = [];
  const today = startOfDay(new Date());
  for (let i = 0; i < count; i++) dates.push(addDays(today, i));
  return dates;
};

const AdminBookingsPage = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ message: '', type: '' });
  const [weekDates, setWeekDates] = useState([]);
  const [viewingDate, setViewingDate] = useState(null);
  const [searchDateInput, setSearchDateInput] = useState('');
  const [remindersSent, setRemindersSent] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetBooking, setModalTargetBooking] = useState(null);
  const [modalFormData, setModalFormData] = useState({ subject: '', body: '' });
  const [modalFormErrors, setModalFormErrors] = useState({});
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);
    setActionStatus({ message: '', type: '' });
    await new Promise(resolve => setTimeout(resolve, 600));
    try {
      const bookingsWithEndTime = initialDummyBookings.map(booking => ({
        ...booking,
        endTimeUTC: addMinutes(parseISO(booking.startTimeUTC), SLOT_DURATION_MINUTES).toISOString()
      }));
      setAllBookings(bookingsWithEndTime);
    } catch (err) {
      setError("Failed to load bookings.");
      setAllBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const dates = generateDates(7);
    setWeekDates(dates);
    const today = startOfDay(new Date());
    setViewingDate(today);
    setSearchDateInput(format(today, 'yyyy-MM-dd'));
    fetchBookings();
  }, []);

  useEffect(() => {
    if (viewingDate && allBookings.length > 0) {
      const start = startOfDay(viewingDate);
      const end = endOfDay(viewingDate);
      const filtered = allBookings.filter(booking => {
        const bookingStart = parseISO(booking.startTimeUTC);
        return isValid(bookingStart) && bookingStart >= start && bookingStart <= end;
      });
      setFilteredBookings(filtered);
    } else setFilteredBookings([]);
  }, [viewingDate, allBookings]);

  const handleCancelBooking = async (bookingId, startTimeUTC) => {
    if (isBefore(parseISO(startTimeUTC), new Date())) {
      setActionStatus({ message: 'Cannot cancel past bookings.', type: 'error' });
      return;
    }
    if (!window.confirm(`Cancel this booking?`)) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setAllBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
    setActionStatus({ message: 'Booking cancelled.', type: 'success' });
    setIsLoading(false);
  };

  const handleSendReminder = (booking) => {
    setRemindersSent(prev => ({ ...prev, [booking._id]: true }));
    setActionStatus({ message: `Reminder sent to ${booking.email}`, type: 'success' });
  };

  const openMessageModal = (booking) => {
    setModalTargetBooking(booking);
    setModalFormData({ subject: `Regarding your booking on ${format(parseISO(booking.startTimeUTC), 'MMM d')}`, body: '' });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalSubmitting(true);
    const validationResult = messageSchema.safeParse(modalFormData);
    if (!validationResult.success) {
      setModalFormErrors(validationResult.error.flatten().fieldErrors);
      setModalSubmitting(false);
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    setActionStatus({ message: `Message sent to ${modalTargetBooking?.email}`, type: 'success' });
    setIsModalOpen(false);
    setModalSubmitting(false);
  };

  const handleDateSearchSubmit = () => {
    try {
      const parsedDate = parseISO(searchDateInput);
      if (isValid(parsedDate)) setViewingDate(startOfDay(parsedDate));
      else setError("Invalid date format.");
    } catch {
      setError("Invalid date entered.");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pt-20">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <Calendar className="text-blue-600" size={30} />
          Manage Bookings
        </h1>

        <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-2">
                {weekDates.map(date => {
                  const isSelected = viewingDate && isEqual(startOfDay(date), startOfDay(viewingDate));
                  return (
                    <button
                      key={date}
                      onClick={() => { setViewingDate(date); setSearchDateInput(format(date, 'yyyy-MM-dd')); }}
                      className={`px-5 py-3 rounded-lg flex flex-col items-center transition-all ${
                        isSelected 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg' 
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border hover:border-blue-200'
                      }`}
                    >
                      <span className="text-sm font-medium">{format(date, 'EEE')}</span>
                      <span className="text-xs mt-1">{format(date, 'd MMM')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-end border-t pt-4">
              <div className="flex-1 w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search by Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={searchDateInput}
                    onChange={(e) => setSearchDateInput(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Calendar className="absolute right-3 top-3 text-gray-400" size={20} />
                </div>
              </div>
              <button
                onClick={handleDateSearchSubmit}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2"
              >
                <Search size={18} />
                Search
              </button>
            </div>
          </div>
        </div>

        {actionStatus.message && (
          <div className={`mb-6 p-4 rounded-xl ${
            actionStatus.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {actionStatus.message}
          </div>
        )}

        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {viewingDate ? format(viewingDate, 'EEEE, MMMM d, yyyy') : 'Select a date'}
        </h2>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-gray-50/50">
              No bookings found for this date
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => {
                const isPast = isBefore(parseISO(booking.startTimeUTC), new Date());
                const isActive = booking.status === 'confirmed' && !isPast;
                const startTime = format(parseISO(booking.startTimeUTC), 'h:mm a');
                const endTime = format(addMinutes(parseISO(booking.startTimeUTC), 30), 'h:mm a');

                return (
                  <li key={booking._id} className={`p-6 ${booking.status === 'cancelled' ? 'bg-gray-50 opacity-80' : 'hover:bg-gray-50'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Clock className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{booking.name}</h3>
                          <p className="text-sm text-gray-600">{startTime} - {endTime} IST</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        isPast ? 'bg-gray-200 text-gray-700' : 'bg-green-100 text-green-800'
                      }`}>
                        {booking.status === 'cancelled' ? 'Cancelled' : isPast ? 'Completed' : 'Confirmed'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
                      <div className="flex items-center gap-2">
                        <Mail className="text-gray-500 flex-shrink-0" size={16} />
                        <span className="truncate">{booking.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="text-gray-500 flex-shrink-0" size={16} />
                        <span>{booking.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="text-gray-500 flex-shrink-0" size={16} />
                        <span>{booking.location}</span>
                      </div>
                    </div>

                    {isActive && (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleSendReminder(booking)}
                          disabled={remindersSent[booking._id]}
                          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                            remindersSent[booking._id]
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          <Bell size={16} />
                          {remindersSent[booking._id] ? 'Reminder Sent' : 'Send Reminder'}
                        </button>

                        <button
                          onClick={() => openMessageModal(booking)}
                          className="px-4 py-2 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-200 flex items-center gap-2"
                        >
                          <MessageSquare size={16} />
                          Send Message
                        </button>

                        <button
                          onClick={() => handleCancelBooking(booking._id, booking.startTimeUTC)}
                          className="px-4 py-2 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-2"
                        >
                          <XCircle size={16} />
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
              <div className="p-6 border-b flex justify-between items-center">
                <h3 className="text-xl font-semibold">Contact {modalTargetBooking?.name}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleModalSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    name="subject"
                    value={modalFormData.subject}
                    onChange={(e) => setModalFormData({ ...modalFormData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {modalFormErrors.subject && <p className="mt-2 text-sm text-red-600">{modalFormErrors.subject}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    name="body"
                    rows="4"
                    value={modalFormData.body}
                    onChange={(e) => setModalFormData({ ...modalFormData, body: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                  {modalFormErrors.body && <p className="mt-2 text-sm text-red-600">{modalFormErrors.body}</p>}
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSubmitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                  >
                    {modalSubmitting ? (
                      <Loader2 className="animate-spin h-5 w-5" />
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminBookingsPage;