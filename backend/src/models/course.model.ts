import { Schema, model, type InferSchemaType } from "mongoose";

type CourseSchemaProperties = InferSchemaType<typeof CourseSchema>;

const CourseSchema = new Schema(
    {
        celcatId: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
        },
        start: {
            type: Date,
            required: true,
        },
        end: {
            type: Date,
            required: true,
        },
        colorRef: {
            type: String,
            required: true,
            default: "#ff7675",
        },
        roomIds: {
            type: [String],
            ref: "Room",
            required: true,
            default: [],
        },
        teachers: {
            type: [String],
            required: true,
            default: [],
        },
        groupIds: {
            type: [String],
            ref: "Group",
            required: true,
            default: [],
        },
        modules: {
            type: [String],
            required: true,
            default: [],
        },
    },
    { versionKey: false, timestamps: true },
);

const Course = model("Course", CourseSchema);

export { Course, type CourseSchemaProperties };
