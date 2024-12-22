import express from 'express';
import Salle from '../../models/salle.js';
import Account from '../../models/account.js';
import Cours from '../../models/cours.js';
import Stats from '../../models/stats.js';
import mongoose from 'mongoose';
import pkg from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { UAParser } from 'ua-parser-js';
import {
    formatDateValide,
    sameDay
} from "../../utils/date.js";
import {
    compareStatsObjs
} from "../../utils/stats.js";
const router = express.Router();
const { sign } = pkg;

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
            name: doc.nom_salle,
            building: doc.batiment,
            banned: doc.banned,
            type: doc.type
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
    if (!req.connected) return res.redirect('/admin/auth');
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

router.get("/account-infos", async (req, res) => {
    if (!req.connected) return res.redirect('/admin/auth');

    try {
        let user = await Account.findOne({ _id: req.userId }).select(
            "-__v -identifiant -_id -password"
        );

        res.status(200).json(user);
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

router.post("/add-course", async (req, res) => {
    if (!req.connected) return res.redirect('/admin/auth');

    const MIN_COURSE_DURATION = 10; // in minutes

    if (!req.body.roomId || !req.body.startAt || !req.body.endAt || !req.body.roomId || !req.body.courseName) {
        return res.status(400).json({
            error: 'MISSING_QUERIES',
        });
    }

    if (!formatDateValide(req.body.startAt) || !formatDateValide(req.body.endAt) || !sameDay(new Date(req.body.startAt), new Date(req.body.endAt)) || (new Date(req.body.endAt) - new Date(req.body.startAt)) / 1000 / 60 <= MIN_COURSE_DURATION) {
        return res.status(400).json({
            error: 'INVALID_DATE',
        });
    }

    let room = await Salle.findOne({ _id: req.body.roomId });

    if (!room) {
        return res.status(400).json({
            error: 'INVALID_ROOM_ID',
        });
    }

    try {
        const newCourse = new Cours({
            identifiant: "unsalib-" + new Date().toISOString(),
            debute_a: req.body.startAt,
            fini_a: req.body.endAt,
            professeur: "Non renseigné",
            classe: req.body.roomId,
            module: "Module - " + req.body.courseName,
            groupe: "Non renseigné",
            couleur: '#e74c3c',
        });

        await newCourse.save();

        res.status(200).json({
            saved: true
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

router.get("/stats", async (req, res) => {
    if (!req.connected) return res.redirect('/admin/auth');

    if (!req.query.month && !req.query.year) {
        return res.status(400).json({
            error: 'MISSING_QUERIES',
        });
    }

    try {
        let stats = await Stats.find({ date: { $regex: `^${req.query.year}-${req.query.month}` } }).select(
            "-__v -_id -user_id"
        );

        let daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
        daysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const processedStats = [];
        let statsForDate, availableRoomsRequests, roomRequests, roomsListRequests, internalErrors, uniqueVisitors;
        daysInMonth.map((day) => {
            statsForDate = 0;
            availableRoomsRequests = 0;
            roomRequests = 0;
            roomsListRequests = 0;
            internalErrors = 0;
            uniqueVisitors = 0;
            stats.forEach(userStats => {
                if (userStats.date.endsWith(`${req.query.month}-${day}`)) {
                    statsForDate++;
                    availableRoomsRequests += userStats.available_rooms_requests;
                    roomRequests += userStats.room_requests;
                    roomsListRequests += userStats.rooms_list_requests;
                    internalErrors += userStats.internal_errors;
                    uniqueVisitors++;
                }
            });
            if (statsForDate > 0) {
                processedStats.push({
                    date: `2024-12-${day < 10 ? '0' + day : day}`,
                    available_rooms_requests: availableRoomsRequests,
                    room_requests: roomRequests,
                    rooms_list_requests: roomsListRequests,
                    internal_errors: internalErrors,
                    unique_visitors: uniqueVisitors
                });
            } else {
                processedStats.push({
                    date: `2024-12-${day < 10 ? '0' + day : day}`,
                    available_rooms_requests: 0,
                    room_requests: 0,
                    rooms_list_requests: 0,
                    internal_errors: 0,
                    unique_visitors: 0
                });
            }
        });
        processedStats.sort(compareStatsObjs);

        const OS = {};
        const browsers = {};
        stats.forEach(userStats => {
            let OSName = new UAParser(userStats.user_agent).getOS().name;
            let browserName = new UAParser(userStats.user_agent).getBrowser().name;
            OSName = OSName === undefined ? "Inconnu" : OSName;
            browserName = browserName === undefined ? "Inconnu" : browserName;
            if (Object.keys(OS).includes(OSName)) {
                OS[OSName]++;
            } else {
                OS[OSName] = 1;
            }
            if (Object.keys(browsers).includes(browserName)) {
                browsers[browserName]++;
            } else {
                browsers[browserName] = 1;
            }
        });

        res.status(200).json({ daily_stats: processedStats, monthly_stats: { os: OS, browsers: browsers } });
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
