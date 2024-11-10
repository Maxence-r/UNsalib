import express from "express";
const router = express.Router();
import Salle from "../models/salle.js";
import Cours from "../models/cours.js";
import mongoose from "mongoose";
import {
    formatDateValide,
    obtenirDatesSemaine,
    obtenirNbSemaines,
    obtenirOverflowMinutes,
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
            id: doc._id,
            nom: doc.nom_salle,
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
    // Récupération des paramètres de la requête
    const debut = req.query.debut;
    const fin = req.query.fin;
    // Vérification de la présence de tous les paramètres nécessaires
    if (!debut || !fin) {
        return res.status(400).send("PARAMETRES_MANQUANTS");
    }
    // Vérication de la validité des paramètres de dates
    // Attention à encoder le + avec %2B lors de la requête
    if (!formatDateValide(debut) || !formatDateValide(fin)) {
        return res.status(400).send("FORMAT_DATE_INVALIDE");
    }

    try {
        // Recherche de tous les cours qui débordent sur la période demandée selon 4 cas :
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
                { debute_a: { $lt: fin } }, // le cours commence avant la fin de la période demandée
                { fini_a: { $gt: debut } }, // le cours finit après le début de la période demandée
            ],
        });

        // Les salles libres sont celles dans lesquelles n'a pas lieu un cours
        let sallesDispos = await Salle.find({
            _id: { $nin: cours.map((c) => c.classe) },
        }).select("-__v");

        // Formatage de la réponse
        const resultatFormate = sallesDispos.map((doc) => ({
            id: doc._id,
            nom: doc.nom_salle,
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
    // Récupération des paramètres de la requête
    const id = req.query.id;
    const increment = req.query?.increment || 0; // incrément de 0 si non précisé
    // Vérification de la présence de tous les paramètres nécessaires
    if (!id) {
        return res.status(400).send("PARAMETRES_MANQUANTS");
    }
    // Validation de l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("FORMAT_ID_INVALIDE");
    }
    // Validation de l'incrément : 0 <= numero semaine actuelle + increment <= 52
    const numeroSemaine = obtenirNbSemaines() + parseInt(increment);
    if (numeroSemaine < 0 || numeroSemaine > 52) {
        return res.status(400).send("INCREMENT_TROP_ELEVE");
    }

    // Obtention des informations sur la semaine demandée
    const bornesDates = obtenirDatesSemaine(numeroSemaine);
    console.log(bornesDates);
    bornesDates.numero = numeroSemaine;

    try {
        // Obtention des cours selon l'id de salle et la période donnée
        let cours = await Cours.find({
            classe: id,
            $and: [
                { debute_a: { $gte: bornesDates.debut } },
                { fini_a: { $lte: bornesDates.fin } },
            ],
        }).select("-__v -identifiant");

        // La DB ne renvoie aucun enregistrement :
        // - soit l'id de la salles est erroné
        // - soit il n'y a pas d'edt dans la DB pour la période donnée (pas encore récupéré)
        if (cours.length == 0) {
            return res
                .status(404)
                .send("SALLE_INEXISTANTE_OU_EDT_INDISPONIBLE");
        }

        // Formatage de la réponse
        const resultatFormate = cours.map((doc) => {
            // Obtention de la durée en ms, conversion en h et ensuite en pourcentage
            const duree = Math.round(
                ((new Date(doc.fini_a).valueOf() -
                    new Date(doc.debute_a).valueOf()) /
                    1000 /
                    60 /
                    60) *
                    100
            );
            // Obtention de l'overflow et conversion en pourcentage
            const overflow =
                (obtenirOverflowMinutes(new Date(doc.debute_a)) * 100) / 60;
            return {
                id_cours: doc._id,
                debut: doc.debute_a,
                fin: doc.fini_a,
                duree: duree,
                overflow: overflow,
                id_salle: doc.classe,
                professeur: doc.professeur,
                module: doc.module,
                groupe: doc.groupe,
            };
        });

        res.send({ cours: resultatFormate, infos_semaine: bornesDates });
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
