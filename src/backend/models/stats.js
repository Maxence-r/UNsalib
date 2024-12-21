import { Schema, model } from "mongoose";

const StatsSchema = Schema({
    date: {
        type: String,
        required: true
    },
    room_requests: {
        type: Number,
        required: true,
        default: 0
    },
    rooms_list_requests: {
        type: Number,
        required: true,
        default: 0
    },
    available_rooms_requests: {
        type: Number,
        required: true,
        default: 0
    },
    internal_errors: {
        type: Number,
        required: true,
        default: 0
    },
    user_id: {
        type: String,
        required: true
    },
    user_agent: {
        type: String,
        required: true,
        default: ""
    },
});

const Stats = model("Stats", StatsSchema);
export default Stats;