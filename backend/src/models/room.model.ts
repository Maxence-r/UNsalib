import { Schema, model, type InferSchemaType } from "mongoose";

type RoomSchemaProperties = InferSchemaType<typeof RoomSchema>;

const RoomSchema = new Schema(
    {
        building: {
            type: Schema.Types.ObjectId,
            ref: "Building",
        },
        univName: {
            type: String,
            required: true,
        },
        univId: {
            type: String,
            required: true,
        },
        alias: {
            type: String,
        },
        seats: {
            type: Number,
        },
        type: {
            type: String,
        },
        whiteBoards: {
            type: Number,
        },
        blackBoards: {
            type: Number,
        },
        display: {
            type: Number,
        },
        locked: {
            type: Boolean,
            required: true,
            default: false,
        },
        features: {
            type: [String],
            default: [],
        },
        reviewed: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
    { versionKey: false },
);

const Room = model("Room", RoomSchema);

export { Room, type RoomSchemaProperties };
