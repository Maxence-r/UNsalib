import express from 'express';
const router = express.Router();
import Salle from '../../models/salle.js';
import Cours from '../../models/cours.js';
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

const vacations = [52, 1];

router.get('/', async (req, res) => {
    try {
        // Updating stats
        await updateStats('rooms_list_requests', req.statsUUID, req.get('User-Agent'));

        // Getting all the rooms that are not banned
        let rooms = await Salle.find({ banned: { $ne: true } }).select(
            '-__v -identifiant'
        );

        // Finding out which rooms are currently available
        const now = new Date();
        now.setHours(now.getHours() + 1); // fix server time bug
        const start = now.toISOString(), end = start;
        let courses = await Cours.find({
            $and: [{ debute_a: { $lt: end } }, { fini_a: { $gt: start } }],
        });
        let availableRooms = await Salle.find({
            _id: { $nin: courses.map((c) => c.classe) },
        }).select('-__v -batiment -places_assises -nom_salle');

        // Creating an array with the ids of all available rooms
        availableRooms = availableRooms.map((room) => room._id.toString());

        // Adding an 'available' key to 'rooms' elements when a room id is present in 'availableRooms'
        for (let i = 0; i < rooms.length; i++) {
            if (availableRooms.includes(rooms[i].id)) {
                rooms[i].disponible = true;
            } else {
                rooms[i].disponible = false;
            }
        }

        // Formatting the response
        const formattedResponse = rooms.map((doc) => ({
            id: doc._id,
            name: doc.nom_salle,
            alias: doc.alias,
            building: doc.batiment,
            available: doc.disponible,
            features: doc.caracteristiques,
        }));

        res.json(formattedResponse);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        await updateStats('internal_errors', req.statsUUID, req.get('User-Agent'));
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/available', async (req, res) => {
    // Retrieving query parameters
    const start = req.query.debut;
    const end = req.query.fin;
    const seats = req.query.places ? req.query.places : 0;
    let whiteBoards = req.query.blancs ? req.query.blancs : 0;
    let blackBoards = req.query.noirs ? req.query.noirs : 0;
    let type = req.query.type;
    let features = req.query.carac;

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
        // Updating stats
        await updateStats('available_rooms_requests', req.statsUUID, req.get('User-Agent'));

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
        let courses = await Cours.find({
            $and: [
                { debute_a: { $lt: end } }, // le cours commence avant la fin de la période demandée
                { fini_a: { $gt: start } } // le cours finit après le début de la période demandée
            ]
        });

        // Building the list of attributes requested for the db query
        const attributes = [];
        attributes.push({ places_assises: { $gte: seats } });
        attributes.push({ 'tableau.BLANC': { $gte: whiteBoards } });
        attributes.push({ 'tableau.NOIR': { $gte: blackBoards } });
        if (features) {
            features = features.split('-');
            features.forEach((feature) => attributes.push({ caracteristiques: feature }));
        }
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

        // Getting available rooms according to the attributes requested by the user
        let availableRooms = await Salle.find({
            _id: { $nin: courses.map((c) => c.classe) }, // free rooms are those not being used for classes
            banned: { $ne: true },
            $and: attributes
        }).select('-__v');

        // Formatting the response
        const formattedResponse = availableRooms.map((doc) => ({
            id: doc._id,
            name: doc.nom_salle,
            alias: doc.alias,
            building: doc.batiment,
            available: true,
            features: doc.caracteristiques,
        }));

        res.json(formattedResponse);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        await updateStats('internal_errors', req.statsUUID, req.get('User-Agent'));
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
        return res.status(400).json({ error: 'INVALID_ID_FORMAT' });
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
        // Updating stats
        await updateStats('room_requests', req.statsUUID, req.get('User-Agent'));

        // Vacations
        if (vacations.includes(requestedWeek.number)) {
            const vacationCourses = [];
            const startDate = new Date(requestedWeek.start);
            
            for (let i = 0; i < 5; i++) {
                const start = new Date(startDate);
                start.setDate(start.getDate() + i);
                start.setHours(8, 0, 0, 0);
                const end = new Date(start);
                end.setHours(8, 0, 0, 0);

                vacationCourses.push({
                    courseId: `vacances-${i}`,
                    start: start.toISOString(),
                    end: end.toISOString(),
                    duration: 900,
                    overflow: 0,
                    roomId: id,
                    teacher: 'Monsieur Chill',
                    module: 'Détente - Vacances',
                    group: 'Tout le monde',
                    color: '#FF7675',
                });
            }

            return res.send({ courses: vacationCourses, weekInfos: requestedWeek });
        }

        // Getting courses based on room id and given period
        let courses = await Cours.find({
            classe: id,
            $and: [
                { debute_a: { $gte: requestedWeek.start }},
                { fini_a: { $lte: requestedWeek.end }},
            ],
        }).select('-__v -identifiant');

        // Formatting the response
        const formattedResponse = courses.map((doc) => {
            // Getting duration in ms, convert to h and then to percentage
            const duration = ((new Date(doc.fini_a).valueOf() - new Date(doc.debute_a).valueOf()) / 1000 / 60 / 60) * 100;

            // Getting the overflow as a percentage
            const overflow = getMinutesOverflow(new Date(doc.debute_a));
            return {
                courseId: doc._id,
                start: doc.debute_a,
                end: doc.fini_a,
                duration: duration,
                overflow: overflow,
                roomId: doc.classe,
                teacher: doc.professeur,
                module: doc.module,
                group: doc.groupe,
                color: doc.couleur,
            };
        });

        res.send({ courses: formattedResponse, weekInfos: requestedWeek });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        await updateStats('internal_errors', req.statsUUID, req.get('User-Agent'));
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

export default router;
