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
    campus: {
        type: Schema.Types.ObjectId,
        ref: "Campus",
        required: true,
    },
});

const Group = model("Group", GroupSchema);

export { Group, type GroupSchemaProperties };
