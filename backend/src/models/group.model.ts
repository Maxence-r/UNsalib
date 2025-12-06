import { Schema, model, type InferSchemaType } from "mongoose";

type GroupSchemaProperties = InferSchemaType<typeof GroupSchema>;

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

export { Group, type GroupSchemaProperties };
