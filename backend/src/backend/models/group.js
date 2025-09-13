import { Schema, model } from 'mongoose';

const GroupSchema = Schema({
    univId: {
        type: [String],
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    current: {
        type: Boolean,
        required: true,
        default: false
    }
});


const Group = model('Group', GroupSchema);
export default Group;