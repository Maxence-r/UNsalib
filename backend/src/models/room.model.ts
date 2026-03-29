import { Schema, model, type InferSchemaType } from "mongoose";

type RoomSchemaProperties = InferSchemaType<typeof RoomSchema>;

const RoomSchema = new Schema(
    {
        _id: {
            // We use the raw room name as an id (which contains 
            // room and building names)
            type: String,
            required: true,
        },
        buildingId: {
            type: String,
            ref: "Building",
            // Some room might not be part of any building if the 
            // name detection fails
        },
        univName: {
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
