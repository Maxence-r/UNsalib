import { Schema, model } from "mongoose";

const GroupSchema = new Schema({
    univId: {
        type: [String],
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    current: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const Group = model("Group", GroupSchema);
export { Group };
