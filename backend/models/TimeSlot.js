import mongoose from 'mongoose';

    const timeSlotSchema = new mongoose.Schema({
        startTimeUTC: {
            type: Date,
            required: [true, 'Start time (UTC) is required.'],
            unique: true,
            index: true,
        },
        isBooked: {
            type: Boolean,
            default: false,
            required: true,
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking',
            default: null,
        }
    }, {
        timestamps: true
    });

    const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
    export default TimeSlot;