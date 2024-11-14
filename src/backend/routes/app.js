import express from "express";
import { Octokit } from "@octokit/rest";
import "dotenv/config";
const router = express.Router();

router.get("/version", async (req, res) => {
    try {
        // const octokit = new Octokit({
        //     auth: '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'
        // })

        // await octokit.request('GET /repos/{owner}/{repo}/commits/{ref}', {
        //     owner: 'devmlb',
        //     repo: 'betterun',
        //     ref: 'master',
        //     headers: {
        //         'X-GitHub-Api-Version': '2022-11-28'
        //     }
        // });

        // const test = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        //     owner: 'Maxence-r',
        //     repo: 'salle-univ-nantes',
        //     headers: {
        //       'X-GitHub-Api-Version': '2022-11-28'
        //     }
        //   })

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
