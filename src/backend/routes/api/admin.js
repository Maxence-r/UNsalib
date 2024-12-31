import express from 'express';
import Salle from '../../models/room.js';
import Account from '../../models/account.js';
import Course from '../../models/course.js';
import Stats from '../../models/stats.js';
import mongoose from 'mongoose';
import pkg from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { UAParser } from 'ua-parser-js';
import {
    isValidDate,
    isSameDay
} from '../../utils/date.js';
import {
    compareStatsObjs
} from '../../utils/stats.js';
const router = express.Router();
const { sign } = pkg;

router.post('/auth/login', async (req, res) => {
    try {
        // Checking credentials
        const user = await Account.findOne({ username: req.body.username.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'BAD_CREDENTIALS' });
        }
        const validPassword = await compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'BAD_CREDENTIALS' });
        }

        // If credentials are valid, a token is generated and a cookie sent
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
            .json({ message: 'LOGIN_SUCCESSFUL' });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/auth/logout', async (req, res) => {
    // Clearing the cookie
    res.clearCookie('token');
    res.redirect('/admin/auth');
});

router.get('/rooms', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    try {
        // Getting all the rooms
        let rooms = await Salle.find({}).select(
            '-__v -identifiant'
        );

        // Formatting the response
        const formattedResponse = rooms.map((doc) => ({
            id: doc._id,
            name: doc.nom_salle,
            building: doc.batiment,
            banned: doc.banned,
            type: doc.type
        }));

        res.json(formattedResponse);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/room', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const id = req.query.id;

    // Checking that all the required parameters are present
    if (!id) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }
    // Validating ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'INVALID_ID' });
    }

    try {
        // Getting the room
        let room = await Salle.findOne({ _id: id }).select(
            '-__v -identifiant'
        );

        // Formatting the response
        room = {
            id: room._id,
            name: room.nom_salle,
            alias: room.alias,
            seats: room.places_assises,
            building: room.batiment,
            board: room.tableau,
            type: room.type,
            features: room.caracteristiques,
            banned: room.banned,
            type: room.type
        };

        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.post('/update-room', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const roomId = req.body.roomId;
    const data = req.body.data;

    // Checking that all the required parameters are present
    if (!roomId || !data) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    try {
        // Updating the room
        const success = await Salle.findOneAndUpdate({ _id: roomId }, { $set: data }, { new: true });
        if (!success) {
            return res.status(400).json({ error: 'UNKNOWN_ROOM' });
        }

        res.status(200).json({ message: 'UPDATE_SUCCESSFUL' });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/account-infos', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    try {
        // Getting the user
        const user = await Account.findOne({ _id: req.userId }).select(
            '-__v -identifiant -_id -password'
        );

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.post('/add-course', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const roomId = req.body.roomId;
    const startAt = req.body.startAt;
    const endAt = req.body.endAt;
    const courseName = req.body.courseName;

    const MIN_COURSE_DURATION = 10; // in minutes

    // Checking that all the required parameters are present
    if (!roomId || !startAt || !endAt || !courseName) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }
    // Checking the validity of date parameters
    if (!isValidDate(startAt) || !isValidDate(endAt) || !isSameDay(new Date(startAt), new Date(endAt)) || (new Date(endAt) - new Date(startAt)) / 1000 / 60 <= MIN_COURSE_DURATION) {
        return res.status(400).json({ error: 'INVALID_DATES' });
    }

    try {
        // Getting the room
        let room = await Salle.findOne({ _id: roomId });

        // The room doesn't exist
        if (!room) {
            return res.status(400).json({ error: 'UNKNOWN_ROOM' });
        }

        // Creating the new course
        const newCourse = new Course({
            identifiant: 'unsalib-' + new Date().toISOString(),
            debute_a: startAt,
            fini_a: endAt,
            professeur: 'Non renseigné',
            classe: roomId,
            module: 'Module - ' + courseName,
            groupe: 'Non renseigné',
            couleur: '#e74c3c',
        });
        await newCourse.save();

        res.status(200).json({ message: 'CREATION_SUCCESSFUL' });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/stats', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const month = req.query.month;
    const year = req.query.year;

    // Checking that all the required parameters are present
    if (!month || !year) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    try {
        // Getting statistics for the requested month
        const stats = await Stats.find({ date: { $regex: `^${year}-${month}` } }).select(
            '-__v -_id -user_id'
        );

        // Processing query stats to produce an array with stats for each day in the month
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
            stats.forEach((userStats) => {
                if (userStats.date.endsWith(`${month}-${day}`)) {
                    statsForDate++;
                    availableRoomsRequests += userStats.available_rooms_requests;
                    roomRequests += userStats.room_requests;
                    roomsListRequests += userStats.rooms_list_requests;
                    internalErrors += userStats.internal_errors;
                    uniqueVisitors++;
                }
            });
            processedStats.push({
                date: `2024-12-${day < 10 ? '0' + day : day}`,
                available_rooms_requests: statsForDate > 0 ? availableRoomsRequests : 0,
                room_requests: statsForDate > 0 ? roomRequests : 0,
                rooms_list_requests: statsForDate > 0 ? roomsListRequests : 0,
                internal_errors: statsForDate > 0 ? internalErrors : 0,
                unique_visitors: statsForDate > 0 ? uniqueVisitors : 0
            });
        });
        // Sorting query stats
        processedStats.sort(compareStatsObjs);

        // Processing user-agent stats to produce objects with the number of each device
        const OS = {};
        const browsers = {};
        stats.forEach(userStats => {
            let OSName = new UAParser(userStats.user_agent).getOS().name;
            let browserName = new UAParser(userStats.user_agent).getBrowser().name;
            OSName = !OSName ? 'Inconnu' : OSName;
            browserName = !browserName ? 'Inconnu' : browserName;
            OS[OSName] = Object.keys(OS).includes(OSName) ? OS[OSName] + 1 : 1;
            browsers[browserName] = Object.keys(browsers).includes(browserName) ? browsers[browserName] + 1 : 1;
        });

        res.status(200).json({ daily_stats: processedStats, monthly_stats: { os: OS, browsers: browsers } });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

export default router;