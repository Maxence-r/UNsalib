import express from 'express';
const router = express.Router();
import Room from '../../models/room.js';
import Course from '../../models/course.js';
import Group from '../../models/group.js';
import mongoose from 'mongoose';
import {
    isValidDate,
    getWeekInfos,
    getWeeksNumber,
    getMinutesOverflow,
} from '../../utils/date.js';
import {
    updateStats
} from '../../utils/stats.js';

const VACATIONS = [52, 1, 8, 16];

router.get('/', async (req, res) => {
    try {
        // Getting all the rooms that are not banned
        let rooms = await Room.find({ banned: { $ne: true } });

        // Finding out which rooms are currently available
        const now = new Date();
        now.setHours(now.getHours() + 1); // fix server time bug
        const start = now.toISOString(), end = start;
        let courses = await Course.find({
            $and: [{ start: { $lt: end } }, { end: { $gt: start } }],
        });
        const busyRoomsIds = {};
        courses.forEach((course) => {
            course.rooms.forEach((room) => {
                busyRoomsIds[room] = undefined;
            });
        });
        let availableRooms = await Room.find({
            _id: { $nin: Object.keys(busyRoomsIds) },
        });

        // Creating an array with the ids of all available rooms
        availableRooms = availableRooms.map((room) => room._id.toString());

        // Adding an 'available' key to 'rooms' elements when a room id is present in 'availableRooms'
        for (let i = 0; i < rooms.length; i++) {
            if (availableRooms.includes(rooms[i].id)) {
                rooms[i].available = true;
            } else {
                rooms[i].available = false;
            }
        }

        // Formatting the response
        const formattedResponse = rooms.map((doc) => ({
            id: doc._id,
            name: doc.name,
            alias: doc.alias,
            building: doc.building,
            available: doc.available,
            features: doc.features,
        }));

        res.json(formattedResponse);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        updateStats('internal_errors', req.statsUUID, req.get('User-Agent'));
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/available', async (req, res) => {
    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;
    const seats = req.query.seats ? req.query.seats : 0;
    let whiteBoards = req.query.whiteboards ? req.query.whiteboards : 0;
    let blackBoards = req.query.blackboards ? req.query.blackboards : 0;
    let type = req.query.type;
    let features = req.query.features;
    const noBadge = req.query.nobadge == 'true' ? true : false;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }
    // Checking the validity of date parameters
    // Be careful to encode the '+' with '%2B' when querying
    if (!isValidDate(start) || !isValidDate(end)) {
        return res.status(400).json({ error: 'INVALID_DATE_FORMAT' });
    }
    // Checking the validity of quantity parameters
    if (isNaN(whiteBoards) || isNaN(blackBoards)) {
        return res.status(400).json({ error: 'INVALID_BOARDS_QUANTITY' });
    }
    if (isNaN(seats)) {
        return res.status(400).json({ error: 'INVALID_SEATS_QUANTITY' });
    }

    try {
        // Recherche de tous les cours qui débordent sur la période demandée selon 4 cas :
        //
        // CAS 1 : Le cours englobe complètement la période
        // Cours       |--------------------|
        // Demande         |-----------|
        //
        // CAS 2 : Le cours est englobé par la période
        // Cours           |-----------|
        // Demande     |--------------------|
        //
        // CAS 3 : Le cours chevauche le début de la période
        // Cours       |-----------|
        // Demande         |-----------|
        //
        // CAS 4 : Le cours chevauche la fin de la période
        // Cours           |-----------|
        // Demande     |-----------|
        //
        let courses = await Course.find({
            $and: [
                { start: { $lt: end } }, // le cours commence avant la fin de la période demandée
                { end: { $gt: start } } // le cours finit après le début de la période demandée
            ]
        });

        // Building the list of attributes requested for the db query
        const attributes = [];
        attributes.push({ seats: { $gte: seats } });
        attributes.push({ 'boards.white': { $gte: whiteBoards } });
        attributes.push({ 'boards.black': { $gte: blackBoards } });
        if (features) {
            features = features.split('-');
            features.forEach((feature) => attributes.push({ features: feature }));
        }
        if (noBadge) attributes.push({ features: { $ne: 'badge' } });
        if (type) {
            if (type === 'info') {
                attributes.push({ type: 'INFO' });
            } else if (type === 'td') {
                attributes.push({ type: 'TD' });
            } else if (type === 'tp') {
                attributes.push({ type: 'TP' });
            } else if (type === 'amphi') {
                attributes.push({ type: 'AMPHI' });
            }
        }

        // Getting all busy rooms ids from the courses array
        const busyRoomsIds = {};
        courses.forEach((course) => {
            course.rooms.forEach((room) => {
                busyRoomsIds[room] = undefined;
            });
        });

        // Getting available rooms according to the attributes requested by the user
        let availableRooms = await Room.find({
            _id: { $nin: Object.keys(busyRoomsIds) }, // free rooms are those not being used for classes
            banned: { $ne: true },
            $and: attributes
        });

        // Formatting the response
        const formattedResponse = availableRooms.map((doc) => ({
            id: doc._id,
            name: doc.name,
            alias: doc.alias,
            building: doc.building,
            available: true,
            features: doc.features,
        }));

        res.json(formattedResponse);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        updateStats('internal_errors', req.statsUUID, req.get('User-Agent'));
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/timetable', async (req, res) => {
    // Retrieving query parameters
    const id = req.query.id;
    const increment = req.query?.increment || 0; // increment = 0 if not specified

    // Checking that all the required parameters are present
    if (!id) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }
    // Validating ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'INVALID_ID' });
    }
    // Checking the validity of number parameters
    if (isNaN(increment)) {
        return res.status(400).json({ error: 'INVALID_INCREMENT' });
    }
    // Getting information about the requested week and checking its validity
    const requestedWeek = getWeekInfos(getWeeksNumber() + parseInt(increment));
    if (requestedWeek.number < 0 || requestedWeek.number > 52 || increment > 18) {
        return res.status(400).json({ error: 'INVALID_INCREMENT' });
    }

    try {
        // Vacations
        if (VACATIONS.includes(requestedWeek.number)) {
            const vacationCourses = [];
            const startDate = new Date(requestedWeek.start);

            for (let i = 0; i < 5; i++) {
                const start = new Date(startDate);
                start.setDate(start.getDate() + i);
                start.setHours(8, 0, 0, 0);
                const end = new Date(start);
                end.setHours(17, 0, 0, 0);

                vacationCourses.push({
                    courseId: `vacances-${i}`,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    notes: '',
                    category: '',
                    duration: 900,
                    overflow: 0,
                    roomId: id,
                    teachers: ['Monsieur Chill'],
                    modules: ['Détente - Vacances'],
                    groups: ['Tout le monde'],
                    color: '#FF7675',
                });
            }

            return res.send({ courses: vacationCourses, weekInfos: requestedWeek });
        }

        // Getting courses based on room id and given period
        let courses = await Course.find({
            rooms: id,
            $and: [
                { start: { $gte: requestedWeek.start } },
                { end: { $lte: requestedWeek.end } },
            ],
        });

        // Getting all busy rooms ids from the courses array
        const groups = await Group.find();
        const parsedGroups = {};
        groups.forEach((group) => {
            parsedGroups[group._id] = group.name;
        });

        // Formatting the response
        const formattedResponse = courses.map((doc) => {
            // Getting duration in ms, convert to h and then to percentage
            const duration = ((new Date(doc.end).valueOf() - new Date(doc.start).valueOf()) / 1000 / 60 / 60) * 100;
            // Getting the overflow as a percentage
            const overflow = getMinutesOverflow(new Date(doc.start));
            return {
                courseId: doc._id,
                start: doc.start,
                end: doc.end,
                notes: doc.notes,
                category: doc.category,
                duration: duration,
                overflow: overflow,
                roomId: doc.rooms,
                teachers: doc.teachers,
                modules: doc.modules,
                groups: doc.groups.map((group) => parsedGroups[group]),
                color: doc.color
            };
        });

        res.send({ courses: formattedResponse, weekInfos: requestedWeek });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        updateStats('internal_errors', req.statsUUID, req.get('User-Agent'));
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

export default router;
