import { Schema, model } from "mongoose";

const BatimentSchema = Schema({
    identifiant: {
        type: String,
        required: true
    },
    nb_salles: {
        type: Int16Array,
        required: false
    }
});


const Batiment = model('Batiment', BatimentSchema);
export default Batiment;