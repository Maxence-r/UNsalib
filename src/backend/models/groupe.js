import { Schema, model } from "mongoose";

const GroupeSchema = Schema({
    identifiant: {
        type: String,
        required: true
    }
});


const Groupe = model('Groupe', GroupeSchema);
export default Groupe;