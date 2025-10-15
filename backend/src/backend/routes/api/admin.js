import express from 'express';
import Room from '../../models/room.js';
import Account from '../../models/account.js';
import Course from '../../models/course.js';
import Stat from '../../models/stat.js';
import mongoose from 'mongoose';
import pkg from 'jsonwebtoken';
import { compare } from 'bcrypt';
import { UAParser } from 'ua-parser-js';
import { Bots } from 'ua-parser-js/extensions';
import { isBot } from 'ua-parser-js/helpers';
import {
    isValidDate,
    isSameDay,
    getDatesRange
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
        res.cookie('token', token, { domain: `.${process.env.PUBLIC_DOMAIN}`, maxAge: 60 * 24 * 60 * 60 * 1000, sameSite: 'Lax' })
            .status(200)
            .json({ message: 'LOGIN_SUCCESSFUL' });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/auth/logout', async (req, res) => {
    // Clearing the cookie
    res.clearCookie('token', { domain: `.${process.env.PUBLIC_DOMAIN}` }).json({ message: 'LOGOUT_SUCCESSFUL' });
});

router.get('/auth/status', async (req, res) => {
    if (req.connected) {
        return res.json({ message: 'LOGGED_IN' });
    }
    return res.json({ message: 'NOT_LOGGED_IN' });
});

router.get('/rooms', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    try {
        // Getting all the rooms
        let rooms = await Room.find({});

        // Formatting the response
        const formattedResponse = rooms.map((doc) => ({
            id: doc._id,
            name: doc.name,
            building: doc.building,
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
        let room = await Room.findOne({ _id: id });

        // Formatting the response
        room = {
            id: room._id,
            name: room.name,
            alias: room.alias,
            seats: room.seats,
            building: room.building,
            boards: room.boards,
            type: room.type,
            features: room.features,
            banned: room.banned
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
        const success = await Room.findOneAndUpdate({ _id: roomId }, { $set: data }, { new: true });
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
            '-__v -_id -password'
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
        let room = await Room.findOne({ _id: roomId });

        // The room doesn't exist
        if (!room) {
            return res.status(400).json({ error: 'UNKNOWN_ROOM' });
        }

        // Creating the new course
        const newCourse = new Course({
            univId: 'unsalib-' + new Date().toISOString(),
            celcatId: 'unsalib-' + new Date().toISOString(),
            start: startAt,
            end: endAt,
            teachers: [],
            rooms: [roomId],
            modules: ['UNsalib - ' + courseName],
            groups: []
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
        const stats = await Stat.find({ date: { $regex: `^${year}-${month.length == 1 ? '0' + month : month}` } });

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
                if (userStats.date.endsWith(`${month.length == 1 ? '0' + month : month}-${day.toString().length == 1 ? '0' + day : day}`)) {
                    statsForDate++;
                    availableRoomsRequests += userStats.availableRoomsRequests;
                    roomRequests += userStats.roomRequests;
                    roomsListRequests += userStats.roomsListRequests;
                    internalErrors += userStats.internalErrors;
                    uniqueVisitors++;
                }
            });
            processedStats.push({
                date: `${year}-${month.length == 1 ? '0' + month : month}-${day < 10 ? '0' + day : day}`,
                availableRoomsRequests: statsForDate > 0 ? availableRoomsRequests : 0,
                roomRequests: statsForDate > 0 ? roomRequests : 0,
                roomsListRequests: statsForDate > 0 ? roomsListRequests : 0,
                internalErrors: statsForDate > 0 ? internalErrors : 0,
                uniqueVisitors: statsForDate > 0 ? uniqueVisitors : 0
            });
        });
        // Sorting query stats
        processedStats.sort(compareStatsObjs);

        // Processing user-agent stats to produce objects with the number of each device
        const OS = {};
        const browsers = {};
        stats.forEach((userStats) => {
            const parsedUserAgent = new UAParser({ Bots });
            parsedUserAgent.setUA(userStats.userAgent);
            let osName, browserName;
            if (!isBot(parsedUserAgent.getResult())) {
                osName = !parsedUserAgent.getOS().name ? 'Inconnu' : parsedUserAgent.getOS().name;
                browserName = !parsedUserAgent.getBrowser().name ? 'Inconnu' : parsedUserAgent.getBrowser().name;
            } else {
                osName = 'Bot';
                browserName = 'Bot';
            }
            OS[osName] = Object.keys(OS).includes(osName) ? OS[osName] + 1 : 1;
            browsers[browserName] = Object.keys(browsers).includes(browserName) ? browsers[browserName] + 1 : 1;
        });

        res.status(200).json({ dailyStats: processedStats, monthlyStats: { os: OS, browsers: browsers } });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/stats/unique-visitors', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    // Checking the date parameters validity
    try {
        let startDate = new Date(start).toISOString();
        let endDate = new Date(end).toISOString();
        if (startDate > endDate) {
            throw new Error();
        }
    } catch {
        return res.status(400).json({ error: 'INVALID_DATES' });
    }

    try {
        // Getting statistics for the requested days range
        const stats = await Stat.find({
            date: {
                $gte: start,
                $lte: end
            }
        });

        // Creating an array containing all the dates between start and end
        let days = getDatesRange(new Date(start), new Date(end));
        // Counting unique visitors per day
        const uniqueVisitorsPerDay = {};
        days.forEach((day) => uniqueVisitorsPerDay[day] = 0);
        stats.forEach((stat) => {
            uniqueVisitorsPerDay[stat.date] += 1;
        });

        res.status(200).json(uniqueVisitorsPerDay);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/stats/views', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    // Checking the date parameters validity
    try {
        let startDate = new Date(start).toISOString();
        let endDate = new Date(end).toISOString();
        if (startDate > endDate) {
            throw new Error();
        }
    } catch {
        return res.status(400).json({ error: 'INVALID_DATES' });
    }

    try {
        // Getting statistics for the requested days range
        const stats = await Stat.find({
            date: {
                $gte: start,
                $lte: end
            }
        });

        // Creating an array containing all the dates between start and end
        let days = getDatesRange(new Date(start), new Date(end));
        // Counting views per day
        const viewsPerDay = {};
        days.forEach((day) => viewsPerDay[day] = 0);
        stats.forEach((stat) => {
            viewsPerDay[stat.date] += stat.roomsListRequests;
        });

        res.status(200).json(viewsPerDay);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/stats/platforms', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    // Checking the date parameters validity
    try {
        let startDate = new Date(start).toISOString();
        let endDate = new Date(end).toISOString();
        if (startDate > endDate) {
            throw new Error();
        }
    } catch {
        return res.status(400).json({ error: 'INVALID_DATES' });
    }

    try {
        // Getting statistics for the requested days range
        const stats = await Stat.find({
            date: {
                $gte: start,
                $lte: end
            }
        });

        // Creating an array containing all the dates between start and end
        let days = getDatesRange(new Date(start), new Date(end));
        // Counting platforms per day
        const platformsPerDay = {};
        days.forEach((day) => platformsPerDay[day] = {});
        stats.forEach((stat) => {
            const parsedUserAgent = new UAParser({ Bots });
            parsedUserAgent.setUA(stat.userAgent);
            let osName = 'Bot';
            if (!isBot(parsedUserAgent.getResult())) {
                osName = !parsedUserAgent.getOS().name ? 'Inconnu' : parsedUserAgent.getOS().name;
            }
            if (platformsPerDay[stat.date][osName]) {
                platformsPerDay[stat.date][osName] += 1;
            } else {
                platformsPerDay[stat.date][osName] = 1;
            }
        });

        res.status(200).json(platformsPerDay);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/stats/browsers', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    // Checking the date parameters validity
    try {
        let startDate = new Date(start).toISOString();
        let endDate = new Date(end).toISOString();
        if (startDate > endDate) {
            throw new Error();
        }
    } catch {
        return res.status(400).json({ error: 'INVALID_DATES' });
    }

    try {
        // Getting statistics for the requested days range
        const stats = await Stat.find({
            date: {
                $gte: start,
                $lte: end
            }
        });

        // Creating an array containing all the dates between start and end
        let days = getDatesRange(new Date(start), new Date(end));
        // Counting browsers per day
        const browsersPerDay = {};
        days.forEach((day) => browsersPerDay[day] = {});
        stats.forEach((stat) => {
            const parsedUserAgent = new UAParser({ Bots });
            parsedUserAgent.setUA(stat.userAgent);
            let browserName = 'Bot';
            if (!isBot(parsedUserAgent.getResult())) {
                browserName = !parsedUserAgent.getBrowser().name ? 'Inconnu' : parsedUserAgent.getBrowser().name;
            }
            if (browsersPerDay[stat.date][browserName]) {
                browsersPerDay[stat.date][browserName] += 1;
            } else {
                browsersPerDay[stat.date][browserName] = 1;
            }
        });

        res.status(200).json(browsersPerDay);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/stats/devices', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    // Checking the date parameters validity
    try {
        let startDate = new Date(start).toISOString();
        let endDate = new Date(end).toISOString();
        if (startDate > endDate) {
            throw new Error();
        }
    } catch {
        return res.status(400).json({ error: 'INVALID_DATES' });
    }

    try {
        // Getting statistics for the requested days range
        const stats = await Stat.find({
            date: {
                $gte: start,
                $lte: end
            }
        });

        // Creating an array containing all the dates between start and end
        let days = getDatesRange(new Date(start), new Date(end));
        // Counting device types per day
        const devicesPerDay = {};
        days.forEach((day) => devicesPerDay[day] = { desktop: 0, mobile: 0, tablet: 0, bot: 0 });
        stats.forEach((stat) => {
            const parsedUserAgent = new UAParser({ Bots });
            parsedUserAgent.setUA(stat.userAgent);
            const result = parsedUserAgent.getResult();
            
            if (isBot(result)) {
                devicesPerDay[stat.date].bot += 1;
            } else {
                const deviceType = result.device?.type || 'desktop';
                if (deviceType === 'mobile') {
                    devicesPerDay[stat.date].mobile += 1;
                } else if (deviceType === 'tablet') {
                    devicesPerDay[stat.date].tablet += 1;
                } else {
                    devicesPerDay[stat.date].desktop += 1;
                }
            }
        });

        res.status(200).json(devicesPerDay);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/system-health', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    try {
        // Check database connection
        const dbStatus = mongoose.connection.readyState === 1;
        
        // Count documents
        const roomsCount = await Room.countDocuments();
        const coursesCount = await Course.countDocuments();
        const usersCount = await Account.countDocuments();
        
        // Get last stat update
        const lastStat = await Stat.findOne().sort({ date: -1 });
        
        const health = {
            status: dbStatus ? 'healthy' : 'down',
            database: dbStatus,
            lastUpdate: lastStat ? lastStat.date : 'N/A',
            roomsCount,
            coursesCount,
            usersCount
        };

        res.status(200).json(health);
    } catch (error) {
        res.status(500).json({ 
            status: 'down',
            database: false,
            error: 'INTERNAL_ERROR' 
        });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/rooms-usage', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    try {
        // Get all rooms
        const rooms = await Room.find({});
        
        // Get courses in date range
        const courses = await Course.find({
            start: { $gte: start },
            end: { $lte: end }
        });

        // Calculate usage per room
        const roomUsage = rooms.map(room => {
            const roomCourses = courses.filter(course => course.rooms.includes(room._id.toString()));
            const totalHours = roomCourses.reduce((sum, course) => {
                const duration = (new Date(course.end) - new Date(course.start)) / (1000 * 60 * 60);
                return sum + duration;
            }, 0);

            return {
                roomId: room._id,
                roomName: room.name,
                courseCount: roomCourses.length,
                totalHours: Math.round(totalHours * 10) / 10
            };
        });

        // Sort by usage
        roomUsage.sort((a, b) => b.totalHours - a.totalHours);

        res.status(200).json(roomUsage);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.post('/bulk-update-rooms', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving parameters
    const roomIds = req.body.roomIds;
    const updates = req.body.updates;

    // Checking that all the required parameters are present
    if (!roomIds || !updates || !Array.isArray(roomIds)) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    try {
        const result = await Room.updateMany(
            { _id: { $in: roomIds } },
            { $set: updates }
        );

        res.status(200).json({ 
            success: true,
            modified: result.modifiedCount,
            message: 'BULK_UPDATE_SUCCESSFUL' 
        });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.delete('/bulk-delete-courses', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving parameters
    const courseIds = req.body.courseIds;

    // Checking that all the required parameters are present
    if (!courseIds || !Array.isArray(courseIds)) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    try {
        const result = await Course.deleteMany({ _id: { $in: courseIds } });

        res.status(200).json({ 
            success: true,
            deleted: result.deletedCount,
            message: 'BULK_DELETE_SUCCESSFUL' 
        });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/courses', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;
    const limit = parseInt(req.query.limit) || 100;

    try {
        let query = {};
        if (start && end) {
            query = {
                start: { $gte: start },
                end: { $lte: end }
            };
        }

        const courses = await Course.find(query).limit(limit).sort({ start: -1 });

        const formattedResponse = courses.map((doc) => ({
            id: doc._id,
            univId: doc.univId,
            celcatId: doc.celcatId,
            start: doc.start,
            end: doc.end,
            category: doc.category,
            notes: doc.notes,
            color: doc.color,
            rooms: doc.rooms,
            teachers: doc.teachers,
            groups: doc.groups,
            modules: doc.modules
        }));

        res.json(formattedResponse);
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

export default router;