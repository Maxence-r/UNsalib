import { Schema, model, type InferSchemaType } from "mongoose";

type RoomSchemaProperties = InferSchemaType<typeof RoomSchema>;

const RoomSchema = new Schema({
    name: {
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
    building: {
        type: String,
        required: true,
    },
    banned: {
        type: Boolean,
        required: false,
        default: false,
    },
    boards: {
        type: new Schema(
            {
                white: { type: Number, required: false, default: 0 },
                black: { type: Number, required: false, default: 0 },
                display: { type: Number, required: false, default: 0 },
            },
            { _id: false },
        ),
        required: false,
        default: {
            white: 0,
            black: 0,
            display: 0,
        },
    },
    features: {
        type: [String],
        required: false,
        default: [],
    },
    type: {
        type: String,
        required: false,
        default: "",
    },
});

const Room = model("Room", RoomSchema);

export { Room, type RoomSchemaProperties };
