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

function obtenirDatesSemaine(numero) {
    // Crée un objet Date pour le début de l'année
    const startDate = new Date(new Date().getFullYear(), 0, 1);

    // Calcule le jour (0: dimanche, 1: lundi, etc.) du 1er janvier de l'année
    const startDay = startDate.getDay() || 7;

    // Calcule le décalage pour arriver au lundi de la première semaine de l'année
    const daysOffset = (numero - 1) * 7 - (startDay - 1);

    // Calcule la date de début de la semaine
    const monday = new Date(startDate);
    monday.setDate(startDate.getDate() + daysOffset);

    // Calcule la date de fin de la semaine (dimanche)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Formate les dates au format ISO (YYYY-MM-DD)
    const mondayISO = monday.toISOString().split('T')[0];
    const sundayISO = sunday.toISOString().split('T')[0];

    // Retourne les dates de début et de fin de la semaine
    return { debut: mondayISO, fin: sundayISO };
}

router.get("/", async (req, res) => {
    try {
        let salles = await Salle.find({}).select(
            "-__v -identifiant"
        );

        salles = salles.map((salle) => {
            const { _id, ...rest } = salle.toObject(); // Convertit en objet JS
            return { id: _id, ...rest }; // Remplace _id par id
        });

        res.json(salles);
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
                { fini_a: { $gt: debut } }  // Le cours finit après le début de la période demandée
            ]
        });

        // Les salles libres sont celles dans lesquelles n'a pas lieu un cours
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
    const semaine = req.query.semaine;

    if (!id || !semaine) {
        return res.status(400).send("PARAMETRES_MANQUANTS");
    }

    // Valide l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("FORMAT_ID_INVALIDE");
    }

    // Vérifie que 0 < semaine <= 52
    if (semaine > 52 || semaine <= 0) {
        return res.status(400).send("NUMERO_SEMAINE_INVALIDE");
    }

    const bornesDates = obtenirDatesSemaine(semaine);

    try {
        let salle = await Salle.findById(id).sort({ id: 1 });
        if (!salle) {
            return res.status(404).send("SALLE_INEXISTANTE");
        }

        let cours = await Cours.find({ 
            classe: id,
            $and: [
                { debute_a: { $gte: bornesDates.debut } },
                { fini_a: { $lte: bornesDates.fin } }
            ]
        }).select(
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
