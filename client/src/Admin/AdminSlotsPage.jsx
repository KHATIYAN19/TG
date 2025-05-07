import React, { useState, useEffect } from 'react';
import { format, addMinutes, startOfDay, endOfDay, parseISO, addDays, isEqual, isValid, isBefore } from 'date-fns';
import { Calendar, Trash2, PlusCircle, AlertTriangle, CheckCircle, Clock, Search, X, User, Loader2 } from 'lucide-react';
import { format as formatTz } from 'date-fns-tz';
let dummySlotsData = [
  { _id: 'slot1', startTimeUTC: '2025-05-01T03:30:00.000Z', isBooked: true, booking: { _id: 'book1', name: 'Alice W.', email: 'a@e.com', status: 'confirmed' } },
  { _id: 'slot2', startTimeUTC: '2025-05-01T04:00:00.000Z', isBooked: false, booking: null },
  { _id: 'slot3', startTimeUTC: '2025-05-01T04:30:00.000Z', isBooked: false, booking: null },
  { _id: 'slot4', startTimeUTC: '2025-05-01T08:30:00.000Z', isBooked: true, booking: { _id: 'book2', name: 'Bob B.', email: 'b@e.com', status: 'confirmed' } },
  { _id: 'slot5', startTimeUTC: '2025-05-02T03:30:00.000Z', isBooked: false, booking: null },
  { _id: 'slot6', startTimeUTC: '2025-05-02T09:00:00.000Z', isBooked: true, booking: { _id: 'book3', name: 'Charlie C.', email: 'c@e.com', status: 'cancelled' } },
  { _id: 'slot7', startTimeUTC: '2025-05-03T04:00:00.000Z', isBooked: false, booking: null },
  { _id: 'slot_past', startTimeUTC: '2025-04-29T05:00:00.000Z', isBooked: false, booking: null },
];

const SLOT_DURATION_MINUTES = 30;
const BUSINESS_TIMEZONE = 'Asia/Kolkata';

const generateDates = (count = 7) => {
  const dates = [];
  const today = startOfDay(new Date());
  for (let i = 0; i < count; i++) {
    dates.push(addDays(today, i));
  }
  return dates;
};

const AdminSlotsPage = () => {
  const [slotsForDay, setSlotsForDay] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState({ message: '', type: '' });
  const [weekDates, setWeekDates] = useState([]);
  const [viewingDate, setViewingDate] = useState(null);
  const [searchDateInput, setSearchDateInput] = useState('');
  const [showAddSlotForm, setShowAddSlotForm] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('');
  const [isAddingSlot, setIsAddingSlot] = useState(false);

  const fetchSlotsForDate = async (date) => {
    if (!date || !isValid(date)) {
        setSlotsForDay([]);
        setError("Invalid date selected.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setActionStatus({ message: '', type: '' });
    const dateStr = format(date, 'yyyy-MM-dd');

    await new Promise(resolve => setTimeout(resolve, 400));

    try {
        const startUTC = startOfDay(date);
        const endUTC = endOfDay(date);

        const filteredSlots = dummySlotsData.filter(slot => {
            try {
                const slotTime = parseISO(slot.startTimeUTC);
                return isValid(slotTime) && slotTime >= startUTC && slotTime <= endUTC;
            } catch { return false; }
        });

        const processedSlots = filteredSlots
            .map(slot => {
                try {
                    const startTime = parseISO(slot.startTimeUTC);
                    return {
                        ...slot,
                        startTimeLocal: format(startTime, "h:mm a"),
                        endTimeLocal: format(addMinutes(startTime, SLOT_DURATION_MINUTES), "h:mm a")
                    };
                } catch { return null; }
            })
            .filter(Boolean)
            .sort((a, b) => parseISO(a.startTimeUTC) - parseISO(b.startTimeUTC));

        setSlotsForDay(processedSlots);
        setShowAddSlotForm(false);

    } catch (err) {
        console.error(`Error fetching slots for ${dateStr}:`, err);
        setError(`Failed to load time slots for ${dateStr}.`);
        setSlotsForDay([]);
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
  }, []);

  useEffect(() => {
    if (viewingDate) {
      fetchSlotsForDate(viewingDate);
    }
  }, [viewingDate]);

  const handleDeleteSlot = async (slotId, isBooked) => {
    if (isBooked) {
        setActionStatus({ message: 'Cannot delete a booked slot.', type: 'error' });
        setTimeout(() => setActionStatus({ message: '', type: '' }), 3000);
        return;
    }
    if (!window.confirm(`Delete this time slot?`)) return;

    setIsLoading(true); setError(null); setActionStatus({ message: '', type: '' });
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
        dummySlotsData = dummySlotsData.filter(slot => slot._id !== slotId);
        setActionStatus({ message: 'Time slot deleted successfully.', type: 'success' });
        if (viewingDate) fetchSlotsForDate(viewingDate);
    } catch (err) {
        setError(`Failed to delete slot ${slotId}.`); setActionStatus({ message: `Failed to delete slot ${slotId}.`, type: 'error' });
    } finally { setIsLoading(false); }
  };

  const handleAddSlot = async () => {
      if (!viewingDate || !isValid(viewingDate)) {
           setActionStatus({ message: 'Please select a valid date first.', type: 'error' }); return;
      }
       if (isBefore(startOfDay(viewingDate), startOfDay(new Date()))) {
           setActionStatus({ message: 'Cannot add slots to past dates.', type: 'error' }); return;
       }
      if (!newSlotTime) {
          setActionStatus({ message: 'Please enter a time (HH:mm).', type: 'error' }); return;
      }
      if (!/^\d{1,2}:\d{2}$/.test(newSlotTime)) {
           setActionStatus({ message: 'Invalid time format. Use HH:mm (24-hour).', type: 'error' }); return;
      }

      const [hour, minute] = newSlotTime.split(':');
      const datePart = format(viewingDate, 'yyyy-MM-dd');
      const startTimeLocal = `${datePart}T${hour.padStart(2, '0')}:${minute}:00`;

      setIsAddingSlot(true); setError(null); setActionStatus({ message: '', type: '' });
      await new Promise(resolve => setTimeout(resolve, 700));

      try {
          const localStartDate = parseISO(startTimeLocal);
          const startTimeUTCString = formatTz(localStartDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", { timeZone: BUSINESS_TIMEZONE });
          const newStartTimeUTC = new Date(startTimeUTCString);
          const newEndTimeUTC = addMinutes(newStartTimeUTC, SLOT_DURATION_MINUTES);

          const clashes = dummySlotsData.filter(slot => {
              try {
                  const existingStart = parseISO(slot.startTimeUTC);
                  const existingEnd = addMinutes(existingStart, SLOT_DURATION_MINUTES);
                  return isBefore(existingStart, newEndTimeUTC) && isBefore(newStartTimeUTC, existingEnd);
              } catch { return false; }
          });

          if (clashes.length > 0) {
              throw new Error(`Slot clashes with existing slot at ${format(parseISO(clashes[0].startTimeUTC), 'h:mm a')}`);
          }

          const newSlotData = {
              _id: `new_${Date.now()}`,
              startTimeUTC: newStartTimeUTC.toISOString(),
              isBooked: false,
              booking: null
          };
          dummySlotsData.push(newSlotData);
          setActionStatus({ message: 'Slot added successfully.', type: 'success' });
          setShowAddSlotForm(false);
          setNewSlotTime('');
          fetchSlotsForDate(viewingDate);

      } catch (err) {
          console.error("Error adding slot:", err);
          setError(`Failed to add slot: ${err.message}`);
          setActionStatus({ message: `Failed to add slot: ${err.message}`, type: 'error' });
      } finally { setIsAddingSlot(false); }
  };

  const handleDateSearchChange = (e) => {
     setSearchDateInput(e.target.value);
  };

  const handleDateSearchSubmit = () => {
       try {
           const parsedDate = parseISO(searchDateInput);
           if (isValid(parsedDate)) {
               setViewingDate(startOfDay(parsedDate));
               setError(null);
           } else {
               setError("Invalid date format. Use yyyy-MM-dd.");
               setViewingDate(null); setSlotsForDay([]);
           }
       } catch (e) { setError("Invalid date entered."); setViewingDate(null); setSlotsForDay([]); }
   };

   const isViewingPastDate = viewingDate && isBefore(startOfDay(viewingDate), startOfDay(new Date()));

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen pt-20">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Calendar className="text-blue-600" size={28} />
        Manage Time Slots
      </h1>

      <div className="mb-6 p-4 bg-white rounded-xl shadow-lg space-y-4 border border-gray-200">
          <div className="overflow-x-auto pb-2">
              <div className="flex space-x-2">
                  {weekDates.map(date => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      const isSelected = viewingDate && isEqual(startOfDay(date), startOfDay(viewingDate));
                      return (
                          <button
                              key={dateStr}
                              onClick={() => { setViewingDate(date); setSearchDateInput(dateStr); setError(null); }}
                              className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ease-in-out 
                                ${isSelected 
                                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg ring-2 ring-blue-200 ring-inset' 
                                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 hover:shadow-md'}`}
                          >
                              <span className="block font-medium">{format(date, 'EEE')}</span>
                              <span className="block text-xs mt-0.5 font-normal">{format(date, 'd MMM')}</span>
                          </button>
                      );
                  })}
              </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
              <div className="max-w-md">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Search Specific Date</label>
                  <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                          <input 
                              type="date" 
                              value={searchDateInput} 
                              onChange={handleDateSearchChange}
                              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow duration-200"
                          />
                          <Calendar className="absolute right-3 top-2.5 text-gray-400" size={20} />
                      </div>
                      <button 
                          onClick={handleDateSearchSubmit}
                          className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-all duration-200 hover:shadow-lg"
                      >
                          <Search size={20} />
                      </button>
                  </div>
              </div>
          </div>
      </div>

      {actionStatus.message && (
          <div className={`mb-4 p-3 rounded-xl ${actionStatus.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'}`}>
              {actionStatus.message}
          </div>
      )}

      {viewingDate ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                 <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Clock className="text-blue-600" size={20} />
                    {format(viewingDate, 'EEEE, MMMM d, yyyy')}
                 </h2>
                 {!isViewingPastDate && (
                     <button
                        onClick={() => setShowAddSlotForm(!showAddSlotForm)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg"
                     >
                        <PlusCircle size={18} />
                        {showAddSlotForm ? 'Cancel' : 'Add Slot'}
                     </button>
                 )}
              </div>

              {showAddSlotForm && !isViewingPastDate && (
                 <div className="p-4 border-b border-gray-200 bg-blue-50">
                    <div className="flex flex-wrap items-end gap-3">
                       <div className='flex-grow'>
                          <label className="block text-sm font-medium text-gray-700 mb-1">New Slot Time</label>
                          <div className="relative">
                              <input
                                  type="time"
                                  value={newSlotTime}
                                  onChange={(e) => setNewSlotTime(e.target.value)}
                                  className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                  step="1800"
                              />
                              <Clock className="absolute right-3 top-2.5 text-gray-400" size={20} />
                          </div>
                       </div>
                       <button
                          onClick={handleAddSlot}
                          disabled={isAddingSlot}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center gap-2 transition-all duration-200 disabled:opacity-50"
                       >
                          {isAddingSlot ? (
                              <Loader2 className="animate-spin h-5 w-5" />
                          ) : (
                              <>
                                <CheckCircle size={18} />
                                Confirm
                              </>
                          )}
                       </button>
                    </div>
                 </div>
              )}

              {isLoading ? (
                <div className="p-6 text-center text-gray-500">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-blue-600" />
                </div>
              ) : slotsForDay.length === 0 && !error ? (
                <div className="p-6 text-center text-gray-500 bg-gray-50 m-4 rounded-xl">
                  No time slots available for this date
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {slotsForDay.map((slot) => (
                    <li key={slot._id} className={`p-4 group transition duration-150 ease-in-out flex flex-col sm:flex-row justify-between items-start sm:items-center ${slot.isBooked ? 'bg-gray-50' : 'hover:bg-blue-50'}`}>
                      <div className="flex-1 mb-2 sm:mb-0">
                        <p className="font-medium text-gray-800 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Clock className="text-blue-600" size={16} />
                          </span>
                          {slot.startTimeLocal} - {slot.endTimeLocal} IST
                        </p>
                        {slot.isBooked && slot.booking ? (
                          <div className={`mt-2 text-sm p-2 rounded-lg inline-flex items-center gap-2 ${slot.booking.status === 'cancelled' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                             <User className="flex-shrink-0" size={16} />
                             <span>
                               {slot.booking.name}
                               {slot.booking.status === 'cancelled' && (
                                 <span className="ml-2 px-2 py-1 bg-amber-200 rounded-full text-xs">Cancelled</span>
                               )}
                             </span>
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-green-700 flex items-center gap-2">
                            <CheckCircle className="text-green-600" size={16} />
                            Available for booking
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleDeleteSlot(slot._id, slot.isBooked && slot.booking?.status !== 'cancelled')}
                          disabled={isLoading || (slot.isBooked && slot.booking?.status === 'confirmed')}
                          className={`p-2 rounded-lg hover:bg-red-50 transition-colors duration-200 ${
                            !(slot.isBooked && slot.booking?.status === 'confirmed') 
                              ? 'text-red-600 hover:text-red-800' 
                              : 'text-gray-400 cursor-not-allowed'
                          }`}
                          title={slot.isBooked && slot.booking?.status === 'confirmed' ? "Cannot delete booked slot" : "Delete slot"}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </div>
      ) : (
          <div className="p-6 text-center text-gray-500 bg-white rounded-xl shadow">
              {isLoading ? 'Loading...' : 'Select a date to view available slots'}
          </div>
      )}
    </div>
  );
};

export default AdminSlotsPage;