import express from "express";
const router = express.Router();
import Salle from "../models/salle.js";
import Cours from "../models/cours.js";
import mongoose from "mongoose";

function formatDateValide(date) {
    const regex =
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\+(\d{2}):(\d{2})$/;
    return regex.test(date);
}

router.get("/disponibles", async (req, res) => {
    const debut = req.query.debut;
    const fin = req.query.fin;

    if (!debut || !fin) {
        return res.status(400).send("PARAMETRES_MANQUANTS");
    }

    // Attention à encoder le + avec %2B lors de la requête
    if (!formatDateValide(debut) || !formatDateValide(fin)) {
        return res.status(400).send("FORMAT_DATE_INVALIDE");
    }
    console.log(req.query.debut)
    try {
        // Recherche tous les cours
        let cours = await Cours.find({
            $and: [
                { debute_a: { $lt: fin } }, // Le cours commence avant la fin de la période demandée
                { fini_a: { $gt: debut } }  // Le cours finit après le début de la période demandée
            ]
        });

        // En déduit les salles libres
        let sallesDispos = await Salle.find({
            _id: { $nin: cours.map(c => c.classe) },
        }).select("-__v");

        sallesDispos = sallesDispos.map((salle) => {
            const { _id, ...rest } = salle.toObject(); // Convertit en objet JS
            return { id: _id, ...rest }; // Remplace _id par id
        });

        res.json(sallesDispos);
    } catch (erreur) {
        res.status(500).send("ERREUR_INTERNE");
        console.error(
            "Erreur pendant le traitement de la requête à",
            req.url,
            `(${erreur.message})`
        );
    }
});

router.get("/edt", async (req, res) => {
    const id = req.query.id;

    if (!id) {
        return res.status(400).send("PARAMETRES_MANQUANTS");
    }

    // Valide l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("FORMAT_ID_INVALIDE");
    }

    try {
        let salle = await Salle.findById(id).sort({ id: 1 });
        if (!salle) {
            return res.status(404).send("SALLE_INEXISTANTE");
        }

        let cours = await Cours.find({ classe: id }).select(
            "-__v -identifiant"
        );

        cours = cours.map((salle) => {
            const { _id, ...rest } = salle.toObject(); // Convertit en objet JS
            return { id: _id, ...rest }; // Remplace _id par id
        });

        cours = cours.map((salle) => {
            const { classe, ...rest } = salle;
            return { id_salle: classe, ...rest };
        });

        res.send(cours);
    } catch (erreur) {
        res.status(500).send("ERREUR_INTERNE");
        console.error(
            "Erreur pendant le traitement de la requête à",
            req.url,
            `(${erreur.message})`
        );
    }
});

export default router;
