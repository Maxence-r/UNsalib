import { Schema, model, type InferSchemaType } from "mongoose";

type CourseSchemaProperties = InferSchemaType<typeof CourseSchema>;

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
    color: {
        type: String,
        required: false,
        default: "#ff7675",
    },
    rooms: {
        type: [Schema.Types.ObjectId],
        ref: "Room",
        required: true,
        default: [],
    },
    teachers: {
        type: [String],
        required: true,
        default: [],
    },
    groups: {
        type: [Schema.Types.ObjectId],
        ref: "Group",
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

export { Course, type CourseSchemaProperties };
