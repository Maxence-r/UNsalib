import express from "express";
import Salle from "../../models/salle.js";
import Account from '../../models/account.js';
import mongoose from "mongoose";
import { compare } from 'bcrypt';
import pkg from 'jsonwebtoken';
const router = express.Router();
const { sign } = pkg;

router.get("/update-alias", async (req, res) => {
    if (!req.connected) return res.redirect('/admin/auth');
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

router.get("/rooms", async (req, res) => {
    if (!req.connected) return res.redirect('/admin/auth');
    try {
        // Obtention de toutes les salles
        let salles = await Salle.find({}).select(
            "-__v -identifiant"
        );

        // Formatage de la réponse
        const resultatFormate = salles.map((doc) => ({
            id: doc._id,
            name: doc.nom_salle
        }));

        res.json(resultatFormate);
    } catch (erreur) {
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

router.get("/room", async (req, res) => {
    if (!req.connected) return res.redirect('/admin/auth');
    // Récupération des paramètres de la requête
    const id = req.query.id;

    // Vérification de la présence de tous les paramètres nécessaires
    if (!id) {
        return res.status(400).json({
            error: 'MISSING_QUERIES',
        });
    }
    // Validation de l'ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: 'INVALID_ID',
        });
    }

    try {
        let salle = await Salle.findOne({ _id: id }).select(
            "-__v -identifiant"
        );

        // Formatage de la réponse
        salle = {
            id: salle._id,
            name: salle.nom_salle,
            alias: salle.alias,
            seats: salle.places_assises,
            building: salle.batiment,
            board: salle.tableau,
            type: salle.type,
            details: salle.caracteristiques,
            banned: salle.banned,
            type: salle.type
        };

        res.status(200).json(salle);
    } catch (erreur) {
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

router.post("/update-room", async (req, res) => {
    const roomId = req.body.roomId;
    const data = req.body.data;

    if (!roomId || !data) {
        return res.status(400).json({
            error: 'MISSING_QUERIES',
        });
    }

    try {
        const succes = await Salle.findOneAndUpdate({ _id: roomId }, { $set: data }, {
            new: true
        });
        if (!succes) {
            return res.status(400).json({
                error: 'UNKNOWN_ROOM',
            });
        }
        res.status(200).json({
            updated: true
        });
    } catch (erreur) {
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

export default router;
