import { Schema, model } from "mongoose";

const GroupSchema = new Schema({
    univId: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
});

const Group = model("Group", GroupSchema);
export default Group;
