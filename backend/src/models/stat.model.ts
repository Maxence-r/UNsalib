import { Schema, model, type InferSchemaType } from "mongoose";

type StatSchemaProperties = InferSchemaType<typeof StatSchema>;

const StatSchema = new Schema(
    {
        date: {
            type: Date,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["search", "timetable", "list"],
            required: true,
        },
        campusId: {
            type: String,
            ref: "Campus",
            required: true,
        },
    },
    { versionKey: false },
);

const Stat = model("Stat", StatSchema);

export { Stat, type StatSchemaProperties };
