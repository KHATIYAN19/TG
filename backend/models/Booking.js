import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    timeSlot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeSlot',
        required: [true, 'Time slot reference is required.'],
        index: true,
    },
    startTimeUTC: {
        type: Date,
        required: [true, 'Booking start time (UTC) is required.'],
        index: true,
    },
    name: {
        type: String,
        required: [true, 'Client name is required.'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Client email is required.'],
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    phone: {
        type: String,
        required: [true, 'Client phone number is required.'],
        trim: true,
    },
    location: {
        type: String,
        required: [true, 'Client location is required.'],
        trim: true,
    },
    service: {
        type: String,
        required: [true, 'Service requested is required.'],
        trim: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed',
    },
}, {
    timestamps: true
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
