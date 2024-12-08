import express from "express";
import { Octokit } from "@octokit/rest";
import Groupe from "../../models/groupe.js";
import "dotenv/config";
const router = express.Router();

router.get("/version", async (req, res) => {
    try {
        // COMMENTE EN ATTENDANT DE POUVOIR UTILISER LES IDENTIFIANTS GITHUB
        // const octokit = new Octokit({
        //     auth: process.env.GITHUB_AUTH
        // })

        // const commits = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        //     owner: 'Maxence-r',
        //     repo: 'salle-univ-nantes',
        //     headers: {
        //         'X-GitHub-Api-Version': '2022-11-28'
        //     }
        // });

        const resultatFormate = { version: process.env.VERSION };
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
export default router;