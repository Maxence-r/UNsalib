import { Schema, model, type InferSchemaType } from "mongoose";

type RoomSchemaProperties = InferSchemaType<typeof RoomSchema>;

const RoomSchema = new Schema({
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
        required: false,
        default: "",
    },
    seats: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        required: false,
        default: "",
    },
    whiteBoards: {
        type: Number,
        required: false,
        default: 0,
    },
    blackBoards: {
        type: Number,
        required: false,
        default: 0,
    },
    display: {
        type: Number,
        required: false,
        default: 0,
    },
    locked: {
        type: Boolean,
        required: false,
        default: false,
    },
    features: {
        type: [String],
        required: false,
        default: [],
    },
});

const Room = model("Room", RoomSchema);

export { Room, type RoomSchemaProperties };
