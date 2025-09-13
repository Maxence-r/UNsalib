import { Schema, model } from "mongoose";

const StatSchema = new Schema({
    date: {
        type: String,
        required: true,
    },
    roomRequests: {
        type: Number,
        required: true,
        default: 0,
    },
    roomsListRequests: {
        type: Number,
        required: true,
        default: 0,
    },
    availableRoomsRequests: {
        type: Number,
        required: true,
        default: 0,
    },
    internalErrors: {
        type: Number,
        required: true,
        default: 0,
    },
    userId: {
        type: String,
        required: true,
    },
    userAgent: {
        type: String,
        required: true,
        default: "",
    },
});

const Stat = model("Stat", StatSchema);
export default Stat;
