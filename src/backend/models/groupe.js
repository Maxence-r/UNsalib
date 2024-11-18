import { Schema, model } from "mongoose";

const GroupeSchema = Schema({
    identifiant: {
        type: String,
        required: true
    },
    nom: {
        type: String,
        required: true
    },
    date_maj: {
        type: String,
        required: true,
        default: ""
    },
});


const Groupe = model('Groupe', GroupeSchema);
export default Groupe;