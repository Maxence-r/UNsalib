import { Schema, model, type InferSchemaType } from "mongoose";

type StatSchemaProperties = InferSchemaType<typeof StatSchema>;

const StatSchema = new Schema({
    date: {
        type: Date,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
    },
});

const Stat = model("Stat", StatSchema);

export { Stat, type StatSchemaProperties };
