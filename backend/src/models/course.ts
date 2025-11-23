import { Schema, model } from "mongoose";

const CourseSchema = new Schema({
    univId: {
        type: String,
        required: true,
    },
    celcatId: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: false,
        default: "",
    },
    start: {
        type: String,
        required: true,
    },
    end: {
        type: String,
        required: true,
    },
    notes: {
        type: String,
        required: false,
        default: "",
    },
    color: {
        type: String,
        required: false,
        default: "#ff7675",
    },
    rooms: {
        type: [String],
        required: true,
        default: [],
    },
    teachers: {
        type: [String],
        required: true,
        default: [],
    },
    groups: {
        type: [String],
        required: true,
        default: [],
    },
    modules: {
        type: [String],
        required: true,
        default: [],
    },
});

const Course = model("Course", CourseSchema);
export { Course };
