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
    qrcodeRequests: {
        type: Number,
        required: true,
        default: 0
    },
    searchBarUsed: {
        type: Boolean,
        required: true,
        default: false
    },
    homepageScrolled: {
        type: Boolean,
        required: true,
        default: false
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
});

const Stat = model('Stat', StatSchema);
export default Stat;
