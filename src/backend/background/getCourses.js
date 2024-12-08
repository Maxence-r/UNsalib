import Groupe from "../models/groupe.js";
import Cours from "../models/cours.js";
import Salle from "../models/salle.js";
import "dotenv/config";
import { couleurPaletteProche } from "../utils/couleur.js";
import io from "../../../server.js";

// Constantes pour la configuration
const INTERVALLE_CYCLE = 12 * 60 * 60 * 1000; // 12 heures en millisecondes

// Fonction pour obtenir les dates de début et fin (3 semaines)
const obtenirDatesRequete = () => {
    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + 60);
    dateDebut.setDate(dateDebut.getDate() - 1);

    return {
        debut: dateDebut.toISOString().split("T")[0],
        fin: dateFin.toISOString().split("T")[0],
    };
};

// Fonction pour traiter une salle
const traiterSalle = async (nomSalle) => {
    if (!nomSalle) return null;

    const nomFormate = nomSalle.includes("(")
        ? nomSalle.split("(")[0].trim()
        : nomSalle.trim();
    const batiment = nomSalle.includes("(")
        ? nomSalle.split("(")[1].split(")")[0]
        : nomSalle;

    let salle = await Salle.findOne({ nom_salle: nomFormate });

    if (!salle) {
        salle = new Salle({
            nom_salle: nomFormate,
            batiment: batiment,
            places_assises: 0,
        });
        await salle.save();
        console.log(
            `\r\x1b[KNouvelle salle ajoutée : ${nomFormate} (${batiment})`
        );
    }

    return salle;
};

// Fonction pour traiter un cours individuel
const traiterCours = async (donneesCours) => {
    if (
        !donneesCours.start_at ||
        !donneesCours.end_at ||
        !donneesCours.rooms_for_blocks
    ) {
        return;
    }

    const coursExiste = await Cours.exists({
        identifiant: donneesCours.id,
        debute_a: donneesCours.start_at,
        fini_a: donneesCours.end_at,
    });
    if (coursExiste) return;

    const salles = donneesCours.rooms_for_blocks.split(";");
    const sallePrincipale = await traiterSalle(salles[0]);

    const nouveauCours = new Cours({
        identifiant: donneesCours.id,
        debute_a: donneesCours.start_at,
        fini_a: donneesCours.end_at,
        professeur: donneesCours.teachers_for_blocks || "Non renseigné",
        classe: sallePrincipale?._id || "Non renseigné",
        module: donneesCours.modules_for_blocks || "Non renseigné",
        groupe:
            donneesCours.educational_groups_for_blocks
                .split(";")
                .map((item) => item.trim()) || "Non renseigné",
        couleur: couleurPaletteProche(donneesCours.color) || "#FF7675",
    });

    await nouveauCours.save();
};

// Fonction pour récupérer les cours d'un groupe
const recupererCours = async (groupe) => {
    const dates = obtenirDatesRequete();
    process.stdout.write(
        `Récupération des cours pour le groupe ${groupe.nom} du ${dates.debut} au ${dates.fin}\r`
    );
    const urlRequete = `https://edt-v2.univ-nantes.fr/events?start=${dates.debut}&end=${dates.fin}&timetables%5B%5D=${groupe.identifiant}`;

    try {
        const reponse = await fetch(urlRequete);
        const donnees = await reponse.json();

        for (const cours of donnees) {
            await traiterCours(cours);
        }

        io.emit("groupUpdated", { message: `Groupe ${groupe.nom} mis à jour` });
    } catch (erreur) {
        console.error(
            `Erreur pour le groupe ${groupe.identifiant}, ${groupe.nom}:`,
            erreur
        );
    }
};

// Fonction pour traiter un lot de groupes
const traiterLotGroupes = async (groupes) => {
    for (const groupe of groupes) {
        await recupererCours(groupe);
    }
};

// Fonction principale d'exécution
export const getCourses = async () => {
    const groupes = await Groupe.find();

    // Si FORCE est activé, traiter tous les groupes immédiatement
    if (process.env.FORCER_TRAITEMENT_GPES === "true") {
        console.log(
            "Traitement de tous les groupes ACTIVÉ - Démarrage du processus..."
        );
        await traiterLotGroupes(groupes);
    } else {
        console.log("Traitement de tous les groupes DÉSACTIVÉ");
    }

    // Calculer l'intervalle entre chaque groupe pour une répartition sur 12h
    const nombreGroupes = groupes.length;
    const intervalleEntreGroupes = Math.floor(INTERVALLE_CYCLE / nombreGroupes);

    // Fonction pour démarrer le cycle de mise à jour
    const demarrerCycleMiseAJour = () => {
        let indexGroupe = 0;

        const programmerProchainGroupe = () => {
            if (indexGroupe < nombreGroupes) {
                setTimeout(async () => {
                    const groupe = groupes[indexGroupe];

                    await recupererCours(groupe);
                    indexGroupe++;
                    programmerProchainGroupe();
                }, intervalleEntreGroupes);
            } else {
                // Réinitialiser pour le prochain cycle
                indexGroupe = 0;
                setTimeout(() => {
                    console.log("Démarrage d'un nouveau cycle de 12h");
                    programmerProchainGroupe();
                }, intervalleEntreGroupes);
            }
        };

        // Démarrer le premier cycle
        programmerProchainGroupe();
    };

    // Démarrer le cycle de mise à jour
    console.log(
        `Démarrage du cycle - ${nombreGroupes} groupes seront traités toutes les ${
            INTERVALLE_CYCLE / 1000 / 60 / 60
        }h`
    );
    console.log(
        `Intervalle entre chaque groupe: ${
            intervalleEntreGroupes / 1000
        } secondes`
    );
    demarrerCycleMiseAJour();
};
