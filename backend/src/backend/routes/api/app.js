import express from 'express';
import { Octokit } from '@octokit/rest';
import 'dotenv/config';
const router = express.Router();

router.get('/version', async (req, res) => {
    try {
        // COMMENTED UNTIL WE CAN USE THE GITHUB CREDENTIALS
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

        const formattedResult = { version: process.env.VERSION };
        res.json(formattedResult);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

export default router;