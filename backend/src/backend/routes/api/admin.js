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
const MONTH_LABELS = ['Janv.', 'Fevr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Aout', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];

function padUnit(value) {
    return value.toString().padStart(2, '0');
}

function createEmptyTotals() {
    return {
        uniqueVisitors: 0,
        uniqueHumanVisitors: 0,
        views: 0,
        roomRequests: 0,
        availableRoomsRequests: 0,
        internalErrors: 0
    };
}

function mergeTotals(target, source) {
    target.uniqueVisitors += source.uniqueVisitors || 0;
    target.uniqueHumanVisitors += source.uniqueHumanVisitors || 0;
    target.views += source.views || 0;
    target.roomRequests += source.roomRequests || 0;
    target.availableRoomsRequests += source.availableRoomsRequests || 0;
    target.internalErrors += source.internalErrors || 0;
    return target;
}

function isHumanVisitorStat(stat) {
    return stat.availableRoomsRequests > 0 || stat.roomRequests > 0 || stat.searchBarUsed === true || stat.homepageScrolled === true;
}

function aggregateStatTotals(stats) {
    return stats.reduce((totals, stat) => {
        totals.uniqueVisitors += 1;
        if (isHumanVisitorStat(stat)) {
            totals.uniqueHumanVisitors += 1;
        }
        totals.views += stat.roomsListRequests || 0;
        totals.roomRequests += stat.roomRequests || 0;
        totals.availableRoomsRequests += stat.availableRoomsRequests || 0;
        totals.internalErrors += stat.internalErrors || 0;
        return totals;
    }, createEmptyTotals());
}

function aggregateEntryTotals(entries) {
    return entries.reduce((totals, entry) => mergeTotals(totals, entry), createEmptyTotals());
}

function hasTraffic(entry) {
    return entry.uniqueVisitors > 0 || entry.uniqueHumanVisitors > 0 || entry.views > 0 || entry.roomRequests > 0 || entry.availableRoomsRequests > 0 || entry.internalErrors > 0;
}

function getPeakEntry(entries) {
    const activeEntries = entries.filter(hasTraffic);
    if (activeEntries.length === 0) {
        return null;
    }

    return activeEntries.reduce((best, current) => {
        if (current.uniqueHumanVisitors !== best.uniqueHumanVisitors) {
            return current.uniqueHumanVisitors > best.uniqueHumanVisitors ? current : best;
        }
        if (current.uniqueVisitors !== best.uniqueVisitors) {
            return current.uniqueVisitors > best.uniqueVisitors ? current : best;
        }
        if (current.views !== best.views) {
            return current.views > best.views ? current : best;
        }
        return best;
    });
}

function buildTrafficBreakdown(stats) {
    const os = {};
    const browsers = {};

    stats.forEach((userStats) => {
        const parsedUserAgent = new UAParser({ Bots });
        parsedUserAgent.setUA(userStats.userAgent);

        let osName;
        let browserName;

        if (!isBot(parsedUserAgent.getResult())) {
            osName = !parsedUserAgent.getOS().name ? 'Inconnu' : parsedUserAgent.getOS().name;
            browserName = !parsedUserAgent.getBrowser().name ? 'Inconnu' : parsedUserAgent.getBrowser().name;
        } else {
            osName = 'Bot';
            browserName = 'Bot';
        }

        os[osName] = Object.keys(os).includes(osName) ? os[osName] + 1 : 1;
        browsers[browserName] = Object.keys(browsers).includes(browserName) ? browsers[browserName] + 1 : 1;
    });

    return { os, browsers };
}

function getAvailableYearsFromDates(dates) {
    const years = [...new Set(
        dates
            .map((date) => parseInt(date.split('-')[0], 10))
            .filter((year) => !isNaN(year))
    )];

    return years.sort((a, b) => b - a);
}

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
        let daysInMonth = new Date(parseInt(year, 10), parseInt(month, 10), 0).getDate();
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
        res.status(200).json({ dailyStats: processedStats, monthlyStats: buildTrafficBreakdown(stats) });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`);
    }
});

router.get('/stats/overview', async (req, res) => {
    // Redirect user if not logged in
    if (!req.connected) return res.redirect('/admin/auth');

    const year = parseInt(req.query.year, 10);
    const month = parseInt(req.query.month, 10);

    if (isNaN(year) || isNaN(month)) {
        return res.status(400).json({ error: 'MISSING_QUERIES' });
    }

    if (month < 1 || month > 12) {
        return res.status(400).json({ error: 'INVALID_MONTH' });
    }

    try {
        const [yearStats, allDates] = await Promise.all([
            Stat.find({ date: { $regex: `^${year}-` } }).lean(),
            Stat.distinct('date')
        ]);

        const availableYears = [...new Set([
            ...getAvailableYearsFromDates(allDates),
            year
        ])].sort((a, b) => b - a);
        const statsByDate = {};
        const statsByMonth = {};

        yearStats.forEach((stat) => {
            const monthKey = stat.date.slice(0, 7);

            if (!statsByDate[stat.date]) {
                statsByDate[stat.date] = [];
            }
            if (!statsByMonth[monthKey]) {
                statsByMonth[monthKey] = [];
            }

            statsByDate[stat.date].push(stat);
            statsByMonth[monthKey].push(stat);
        });

        const selectedMonthKey = `${year}-${padUnit(month)}`;
        const selectedMonthStats = statsByMonth[selectedMonthKey] || [];
        const daysInMonth = new Date(year, month, 0).getDate();
        const dailyStats = Array.from({ length: daysInMonth }, (_, index) => {
            const dayNumber = index + 1;
            const date = `${selectedMonthKey}-${padUnit(dayNumber)}`;
            return {
                date,
                label: padUnit(dayNumber),
                ...aggregateStatTotals(statsByDate[date] || [])
            };
        });

        const monthlyStats = Array.from({ length: 12 }, (_, index) => {
            const currentMonth = index + 1;
            const monthKey = `${year}-${padUnit(currentMonth)}`;
            const statsForMonth = statsByMonth[monthKey] || [];
            return {
                month: currentMonth,
                label: MONTH_LABELS[index],
                activeDays: new Set(statsForMonth.map((stat) => stat.date)).size,
                ...aggregateStatTotals(statsForMonth)
            };
        });

        res.status(200).json({
            selectedYear: year,
            selectedMonth: month,
            availableYears,
            month: {
                label: `${MONTH_LABELS[month - 1]} ${year}`,
                activeDays: dailyStats.filter(hasTraffic).length,
                peakDay: getPeakEntry(dailyStats),
                totals: aggregateEntryTotals(dailyStats),
                dailyStats,
                platforms: buildTrafficBreakdown(selectedMonthStats)
            },
            year: {
                totals: aggregateEntryTotals(monthlyStats),
                monthlyStats,
                peakMonth: getPeakEntry(monthlyStats)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'INTERNAL_ERROR' });
        console.error(`Erreur pendant le traitement de la requÃªte Ã  '${req.url}' (${error.message})`);
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

router.get('/stats/unique-human-visitors', async (req, res) => {
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
            },
            $or: [
                { availableRoomsRequests: { $gt: 0 } },
                { roomRequests: { $gt: 0 } },
                { searchBarUsed: true },
                { homepageScrolled: true }
            ]
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

export default router;
