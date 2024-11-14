import express from "express";
const router = express.Router();
import Salle from "../models/salle.js";
import Cours from "../models/cours.js";
import mongoose from "mongoose";

router.get("/badge", async (req, res) => {
    const nomSalle = req.query.salle;
    const estBadge = req.query.badge;

    if (!nomSalle || !estBadge) {
        return res.status(400).send("PARAMETRES_MANQUANTS");
    }

    try {
        let salle = await Salle.findOne({ nom_salle: nomSalle });

        console.log(salle);
        let badge = estBadge == "oui" ? true : false;
        if (badge) {
            await Salle.updateOne({ caracteristiques: ["badge"] });
            res.status(200).send("MIS_A_JOUR");
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
            const duree =
                ((new Date(doc.fini_a).valueOf() -
                    new Date(doc.debute_a).valueOf()) /
                    1000 /
                    60 /
                    60) *
                100;
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
