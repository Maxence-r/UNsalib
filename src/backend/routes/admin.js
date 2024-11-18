import express from "express";
const router = express.Router();
import Salle from "../models/salle.js";

router.get("/update-alias", async (req, res) => {
    try {
        const salles = await Salle.find({
            alias: { $regex: /(lle)/i }
        });

        console.log(salles);

        const updatePromises = salles.map(async (salle) => {
            const alias = salle.nom_salle.replace(/lle/gi, "").trim();
            return Salle.updateOne({ _id: salle._id }, { alias: alias });
        });

        await Promise.all(updatePromises);

        res.status(200).send("ALIAS_UPDATED");
    } catch (error) {
        console.error("Error updating alias:", error);
        res.status(500).send("ERREUR_INTERNE");
    }
});

export default router;
