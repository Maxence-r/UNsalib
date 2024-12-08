import express from "express";
import Salle from "../../models/salle.js";
import Account from '../../models/account.js';
import { compare } from 'bcrypt';
import pkg from 'jsonwebtoken';
const router = express.Router();
const { sign } = pkg;

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

router.post('/auth/login', async (req, res) => {
    try {
        const user = await Account.findOne({ username: req.body.username.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                error: 'BAD_CREDENTIALS',
            });
        }
        const validPassword = await compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                error: 'BAD_CREDENTIALS',
            });
        }

        const token = sign(
            {
                userId: user._id,
                username: user.username,
            },
            process.env.TOKEN.toString(),
            {
                expiresIn: '60d',
            }
        );
        res.cookie('token', token, { maxAge: 60 * 24 * 60 * 60 * 1000, sameSite: 'Lax' })
            .status(200)
            .json({
                message: 'Connexion réussie !',
            });
    } catch (error) {
        res.status(500).json({
            error: 'INTERNAL_ERROR',
        });
        console.error(
            "Erreur pendant le traitement de la requête à",
            req.url,
            `(${erreur.message})`
        );
    }
});

router.get('/auth/logout', async (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/auth');
});

export default router;
