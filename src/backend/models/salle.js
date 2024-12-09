import { Schema, model } from "mongoose";

const SalleSchema = Schema({
    nom_salle: {
        type: String,
        required: true,
        default: ""
    },
    alias: {
        type: String,
        required: false,
        default: ""
    },
    places_assises: {
        type: Number,
        required: false,
        default: 0
    },
    batiment: {
        type: String,
        required: true,
        default: ""
    },
    banned: {
        type: Boolean,
        required: false,
        default: false
    },
    tableau: {
        type: Object,
        required: false,
        default: {}
    },
    caracteristiques: {
        type: Array,
        required: true,
        default: []
    },
    type: {
        type: String,
        required: false,
        default: ""
    },
});

const Salle = model("Salle", SalleSchema);
export default Salle;
