import express from "express";
import "dotenv/config";
const router = express.Router();

router.get("/version", async (req, res) => {
    try {
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
