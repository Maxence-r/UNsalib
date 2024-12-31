import { Schema, model } from "mongoose";

const GroupSchema = Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});


const Group = model('Group', GroupSchema);
export default Group;