import { Schema, model, type InferSchemaType } from "mongoose";

type CourseSchemaProperties = InferSchemaType<typeof CourseSchema>;

const CourseSchema = new Schema(
    {
        univId: {
            type: Number,
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
    },
    { versionKey: false, timestamps: true },
);

const Course = model("Course", CourseSchema);

export { Course, type CourseSchemaProperties };
