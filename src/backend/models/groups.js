import { Schema, model } from 'mongoose';

const GroupsSchema = Schema({
    univId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});


const Groups = model('Groups', GroupsSchema);
export default Groups;