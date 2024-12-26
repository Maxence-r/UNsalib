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
        type: new Schema({
            BLANC: { type: Number, required: false, min: 0, default: 0 },
            NOIR: { type: Number, required: false, min: 0, default: 0 },
            ECRAN: { type: Number, required: false, min: 0, default: 0 }
        }, { _id: false }),
        required: false,
        default: {
            BLANC: 0,
            NOIR: 0,
            ECRAN: 0
        }
    },
    caracteristiques: {
        type: [String],
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
