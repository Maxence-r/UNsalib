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
        univFullName: {
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
            enum: ["amphi", "tp", "td", "info"],
        },
        whiteBoards: {
            type: Number,
        },
        blackBoards: {
            type: Number,
        },
        displays: {
            type: Number,
        },
        locked: {
            type: Boolean,
            default: false,
        },
        features: {
            type: [String],
            enum: ["visio", "ilot"],
            default: [],
        },
        reviewed: {
            type: Boolean,
            default: false,
        },
    },
    { versionKey: false },
);

const Room = model("Room", RoomSchema);

export { Room, type RoomSchemaProperties };
