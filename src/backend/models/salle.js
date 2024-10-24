import { Schema, model } from "mongoose";

const SalleSchema = Schema({
    nom_salle: {
        type: String,
        required: true
    },
    places_assises: {
        type: Number,
        required: false
    },
    batiment: {
        type: String,
        required: true
    }
});


const Salle = model('Salle', SalleSchema);
export default Salle;

