import { Schema, model } from "mongoose";

const CoursSchema = Schema({
    debute_a: {
        type: String,
        required: true
    },
    fini_a: {
        type: String,
        required: true
    },
    professeur: {
        type: String,
        required: true
    },
    classe: {
        type: String,
        required: true
    },
    module: {
        type: String,
        required: true
    },
    groupe: {
        type: String,
        required: true
    },
    identifiant: {
        type: String,
        required: true
    }
});


const Cours = model('Cours', CoursSchema);
export default Cours;