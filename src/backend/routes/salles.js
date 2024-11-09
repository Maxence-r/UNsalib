import express from "express";
const router = express.Router();
import Salle from "../models/salle.js";
import Cours from "../models/cours.js";
import mongoose from "mongoose";
import {
    formatDateValide,
    obtenirDatesSemaine,
    getWeeksInYear,
} from "../utils/date.js";

router.get("/", async (req, res) => {
    try {
        // Obtention de toutes les salles
        let salles = await Salle.find({}).select("-__v -identifiant");

        // Obtention des salles disponibles
        const debut = new Date().toISOString();
        const fin = debut;

        let cours = await Cours.find({
            $and: [{ debute_a: { $lt: fin } }, { fini_a: { $gt: debut } }],
        });

        let sallesDispos = await Salle.find({
            _id: { $nin: cours.map((c) => c.classe) },
        }).select("-__v -batiment -places_assises -nom_salle");

        // Création d'un array avec les ids de toutes les salles disponibles
        for (let i = 0; i < sallesDispos.length; i++) {
            sallesDispos[i] = sallesDispos[i]._id.toString();
        }

        // Ajout d'une clé disponible dans salles en fonction de la présence
        // de l'id d'une salle dans sallesDispos
        for (let i = 0; i < salles.length; i++) {
            if (sallesDispos.includes(salles[i].id)) {
                salles[i].disponible = true;
            } else {
                salles[i].disponible = false;
            }
        }

        // Formatage de la réponse
        const resultatFormate = salles.map((doc) => ({
            id: doc._id, // Renomme le champ `_id` en `id`
            nom_salle: doc.nom_salle,
            places_assises: doc.places_assises,
            batiment: doc.batiment,
            disponible: doc.disponible,
        }));

        res.json(resultatFormate);
    } catch (erreur) {
        res.status(500).send("ERREUR_INTERNE");
        console.error(
            "Erreur pendant le traitement de la requête à",
            req.url,
            `(${erreur.message})`
        );
    }
});

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

    try {
        // Recherche tous les cours qui débordent sur la période demandée selon 4 cas :
        //
        // CAS 1 : Le cours englobe complètement la période
        // Cours       |--------------------|
        // Demande         |-----------|
        //
        // CAS 2 : Le cours est englobé par la période
        // Cours           |-----------|
        // Demande     |--------------------|
        //
        // CAS 3 : Le cours chevauche le début de la période
        // Cours       |-----------|
        // Demande         |-----------|
        //
        // CAS 4 : Le cours chevauche la fin de la période
        // Cours           |-----------|
        // Demande     |-----------|
        //
        let cours = await Cours.find({
            $and: [
                { debute_a: { $lt: fin } }, // Le cours commence avant la fin de la période demandée
                { fini_a: { $gt: debut } }, // Le cours finit après le début de la période demandée
            ],
        });

        // Les salles libres sont celles dans lesquelles n'a pas lieu un cours
        let sallesDispos = await Salle.find({
            _id: { $nin: cours.map((c) => c.classe) },
        }).select("-__v");

        // Formatage de la réponse
        const resultatFormate = sallesDispos.map((doc) => ({
            id: doc._id, // Renomme le champ `_id` en `id`
            nom_salle: doc.nom_salle,
            places_assises: doc.places_assises,
            batiment: doc.batiment,
        }));

        res.json(resultatFormate);
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
    const increment = req.query?.increment || 0;

    if (!id || !increment) {
        return res.status(400).send("PARAMETRES_MANQUANTS");
    }

    // Valide l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("FORMAT_ID_INVALIDE");
    }

    // Vérifie que 0 < semaine <= 52
    if (increment > 53 || increment < 0) {
        return res.status(400).send("NUMERO_SEMAINE_INVALIDE");
    }

    let weeksDepuisDebut = getWeeksInYear() + parseInt(increment);

    const bornesDates = obtenirDatesSemaine(weeksDepuisDebut);

    try {
        let salle = await Salle.findById(id).sort({ id: 1 });
        if (!salle) {
            return res.status(404).send("SALLE_INEXISTANTE");
        }

        let cours = await Cours.find({
            classe: id,
            $and: [
                { debute_a: { $gte: bornesDates.debut } },
                { fini_a: { $lte: bornesDates.fin } },
            ],
        }).select("-__v -identifiant");

        // Formatage de la réponse
        const resultatFormate = cours.map((doc) => ({
            id_cours: doc._id,
            id_salle: doc.classe,
            debute_a: doc.debute_a,
            fini_a: doc.fini_a,
            professeur: doc.professeur,
            module: doc.module,
            groupe: doc.groupe,
        }));

        bornesDates.weeks = weeksDepuisDebut;
        res.send({ cours: resultatFormate, dates: bornesDates });
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
