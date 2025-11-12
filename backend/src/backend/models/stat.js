import { Schema, model } from 'mongoose';

const StatSchema = Schema({
    date: {
        type: String,
        required: true
    },
    roomRequests: {
        type: Number,
        required: true,
        default: 0
    },
    roomsListRequests: {
        type: Number,
        required: true,
        default: 0
    },
    availableRoomsRequests: {
        type: Number,
        required: true,
        default: 0
    },
    internalErrors: {
        type: Number,
        required: true,
        default: 0
    },
    userId: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true,
        default: ''
    },
    // Enhanced tracking fields for better human detection
    ipHash: {
        type: String,
        required: false,
        default: ''
    },
    fingerprint: {
        type: String,
        required: false,
        default: ''
    },
    isBot: {
        type: Boolean,
        required: false,
        default: false
    },
    lastActivity: {
        type: Date,
        required: false,
        default: Date.now
    }
});

// Compound index for better query performance
StatSchema.index({ date: 1, fingerprint: 1 });
StatSchema.index({ date: 1, isBot: 1 });

const Stat = model('Stat', StatSchema);
export default Stat;