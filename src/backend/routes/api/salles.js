import express from "express";
const router = express.Router();
import Salle from "../../models/salle.js";
import Cours from "../../models/cours.js";
import Stats from "../../models/stats.js";
import mongoose from "mongoose";
import {
    formatDateValide,
    obtenirDatesSemaine,
    obtenirNbSemaines,
    obtenirOverflowMinutes,
} from "../../utils/date.js";

const vacations = [52, 1];

router.get("/", async (req, res) => {
    try {
        try {
            await Stats.findOneAndUpdate({ date: new Date().toISOString().split('T')[0] }, { $inc: { rooms_list_requests: 1 } }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            });
        } finally {
            // Obtention de toutes les salles
            let salles = await Salle.find({ banned: { $ne: true } }).select(
                "-__v -identifiant"
            );

            // Obtention des salles disponibles
            const now = new Date();
            now.setHours(now.getHours() + 1);
            const debut = now.toISOString();
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
                alias: doc.alias,
                places_assises: doc.places_assises,
                batiment: doc.batiment,
                disponible: doc.disponible,
                caracteristiques: doc.caracteristiques,
            }));

            res.json(resultatFormate);
        }
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
        try {
            await Stats.findOneAndUpdate({ date: new Date().toISOString().split('T')[0] }, { $inc: { available_rooms_requests: 1 } }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            });
        } finally {
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
                banned: { $ne: true },
            }).select("-__v");

            // Formatage de la réponse
            const resultatFormate = sallesDispos.map((doc) => ({
                id: doc._id,
                nom: doc.nom_salle,
                alias: doc.alias,
                places_assises: doc.places_assises,
                batiment: doc.batiment,
                disponible: true,
                caracteristiques: doc.caracteristiques,
            }));

            res.json(resultatFormate);
        }
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
    // Obtention des informations sur la semaine demandée
    const bornesDates = obtenirDatesSemaine(
        obtenirNbSemaines() + parseInt(increment)
    );

    if (bornesDates.numero < 0 || bornesDates.numero > 52 || increment > 18) {
        return res.status(400).send("INCORRECT_WEEK_NUMBER");
    }
    if (vacations.includes(bornesDates.numero)) {
        // VACANCES
        const vacanceCours = [];
        const startDate = new Date(bornesDates.debut);
        for (let i = 0; i < 5; i++) {
            const debut = new Date(startDate);
            debut.setDate(debut.getDate() + i);
            debut.setHours(8, 0, 0, 0);

            const fin = new Date(debut);
            fin.setHours(8, 0, 0, 0);

            vacanceCours.push({
                id_cours: `vacance-${i}`,
                debut: debut.toISOString(),
                fin: fin.toISOString(),
                duree: 900,
                overflow: 0,
                id_salle: id,
                professeur: "Monsieur Chill",
                module: "Détente - Vacances",
                groupe: "Tout le monde",
                couleur: "#FF7675",
            });
        }

        return res.send({ cours: vacanceCours, infos_semaine: bornesDates });
    }

    try {
        try {
            await Stats.findOneAndUpdate({ date: new Date().toISOString().split('T')[0] }, { $inc: { room_requests: 1 } }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            });
        } finally {
            // Obtention des cours selon l'id de salle et la période donnée
            let cours = await Cours.find({
                classe: id,
                $and: [
                    { debute_a: { $gte: bornesDates.debut } },
                    { fini_a: { $lte: bornesDates.fin } },
                ],
            }).select("-__v -identifiant");

            // Formatage de la réponse
            const resultatFormate = cours.map((doc) => {
                // Obtention de la durée en ms, conversion en h et ensuite en pourcentage
                const duree =
                    ((new Date(doc.fini_a).valueOf() -
                        new Date(doc.debute_a).valueOf()) /
                        1000 /
                        60 /
                        60) *
                    100;

                // Calcul du border avec ajout de 2 pour chaque 61 minutes avant le début et après la fin
                // Obtention de l'overflow et conversion en pourcentage
                const overflow = obtenirOverflowMinutes(new Date(doc.debute_a));
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
                    couleur: doc.couleur,
                };
            });

            res.send({ cours: resultatFormate, infos_semaine: bornesDates });
        }
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
