import express from "express";
import Room from "../models/room.model.js";
import Account from "../models/account.js";
import Course from "../models/course.model.js";
import Stat from "../models/stat.model.js";
import mongoose from "mongoose";
import pkg from "jsonwebtoken";
import { compare } from "bcrypt";
import { UAParser } from "ua-parser-js";
import { Bots } from "ua-parser-js/extensions";
import { isBot } from "ua-parser-js/helpers";
import { isValidDate, isSameDay, getDatesRange } from "../utils/date.js";
import { compareStatsObjs } from "../utils/stats.js";
import { CONFIG } from "../configs/app.config.js";
const router = express.Router();
const { sign } = pkg;

const TOKEN_VALIDITY_DAYS = 30;

router.post("/auth/login", async (req, res) => {
    try {
        // Checking credentials
        const user = await Account.findOne({
            username: req.body.username.toLowerCase(),
        });
        if (!user) {
            return res.status(401).json({ error: "BAD_CREDENTIALS" });
        }
        const validPassword = await compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "BAD_CREDENTIALS" });
        }

        // If credentials are valid, a token is generated and a cookie sent
        const token = sign(
            {
                userId: user._id,
                username: user.username,
            },
            CONFIG.TOKEN,
            {
                expiresIn: `${TOKEN_VALIDITY_DAYS}d`,
            },
        );
        res.cookie("token", token, {
            domain: `.${CONFIG.PUBLIC_DOMAIN}`,
            maxAge: TOKEN_VALIDITY_DAYS * 24 * 60 * 60 * 1000,
            sameSite: "lax",
        })
            .status(200)
            .json({ message: "LOGIN_SUCCESSFUL" });
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

router.get("/auth/logout", (req, res) => {
    // Clearing the cookie
    res.clearCookie("token", { domain: `.${CONFIG.PUBLIC_DOMAIN}` }).json({
        message: "LOGOUT_SUCCESSFUL",
    });
});

router.get("/auth/status", (req, res) => {
    if (req.connected) {
        return res.json({ message: "LOGGED_IN" });
    }
    return res.json({ message: "NOT_LOGGED_IN" });
});

router.get("/rooms", async (req, res) => {
    try {
        // Getting all the rooms
        const rooms = await Room.find({});

        // Formatting the response
        const formattedResponse = rooms.map((doc) => ({
            id: doc._id,
            name: doc.name,
            building: doc.building,
            banned: doc.banned,
            type: doc.type,
        }));

        res.json(formattedResponse);
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

router.get("/room", async (req, res) => {
    // Retrieving query parameters
    const id = req.query.id;

    // Checking that all the required parameters are present
    if (!id) {
        return res.status(400).json({ error: "MISSING_QUERIES" });
    }
    // Validating ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "INVALID_ID" });
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
            banned: room.banned,
        };

        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

router.post("/update-room", async (req, res) => {
    // Retrieving query parameters
    const roomId = req.body.roomId;
    const data = req.body.data;

    // Checking that all the required parameters are present
    if (!roomId || !data) {
        return res.status(400).json({ error: "MISSING_QUERIES" });
    }

    try {
        // Updating the room
        const success = await Room.findOneAndUpdate(
            { _id: roomId },
            { $set: data },
            { new: true },
        );
        if (!success) {
            return res.status(400).json({ error: "UNKNOWN_ROOM" });
        }

        res.status(200).json({ message: "UPDATE_SUCCESSFUL" });
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

router.get("/account-infos", async (req, res) => {
    try {
        // Getting the user
        const user = await Account.findOne({ _id: req.userId }).select(
            "-__v -_id -password",
        );

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

router.post("/add-course", async (req, res) => {
    // Retrieving query parameters
    const roomId = req.body.roomId;
    const startAt = req.body.startAt;
    const endAt = req.body.endAt;
    const courseName = req.body.courseName;

    const MIN_COURSE_DURATION = 10; // in minutes

    // Checking that all the required parameters are present
    if (!roomId || !startAt || !endAt || !courseName) {
        return res.status(400).json({ error: "MISSING_QUERIES" });
    }
    // Checking the validity of date parameters
    if (
        !isValidDate(startAt) ||
        !isValidDate(endAt) ||
        !isSameDay(new Date(startAt), new Date(endAt)) ||
        (new Date(endAt) - new Date(startAt)) / 1000 / 60 <= MIN_COURSE_DURATION
    ) {
        return res.status(400).json({ error: "INVALID_DATES" });
    }

    try {
        // Getting the room
        const room = await Room.findOne({ _id: roomId });

        // The room doesn't exist
        if (!room) {
            return res.status(400).json({ error: "UNKNOWN_ROOM" });
        }

        // Creating the new course
        const newCourse = new Course({
            univId: "unsalib-" + new Date().toISOString(),
            celcatId: "unsalib-" + new Date().toISOString(),
            start: startAt,
            end: endAt,
            teachers: [],
            rooms: [roomId],
            modules: ["UNsalib - " + courseName],
            groups: [],
        });
        await newCourse.save();

        res.status(200).json({ message: "CREATION_SUCCESSFUL" });
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

router.get("/stats", async (req, res) => {
    // Retrieving query parameters
    const month = req.query.month;
    const year = req.query.year;

    // Checking that all the required parameters are present
    if (!month || !year) {
        return res.status(400).json({ error: "MISSING_QUERIES" });
    }

    try {
        // Getting statistics for the requested month
        const stats = await Stat.find({
            date: {
                $regex: `^${year}-${month.length == 1 ? "0" + month : month}`,
            },
        });

        // Processing query stats to produce an array with stats for each day in the month
        let daysInMonth = new Date(
            new Date().getFullYear(),
            new Date().getMonth() + 1,
            0,
        ).getDate();
        daysInMonth = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        const processedStats = [];
        let statsForDate,
            availableRoomsRequests,
            roomRequests,
            roomsListRequests,
            internalErrors,
            uniqueVisitors;
        daysInMonth.map((day) => {
            statsForDate = 0;
            availableRoomsRequests = 0;
            roomRequests = 0;
            roomsListRequests = 0;
            internalErrors = 0;
            uniqueVisitors = 0;
            stats.forEach((userStats) => {
                if (
                    userStats.date.endsWith(
                        `${month.length == 1 ? "0" + month : month}-${day.toString().length == 1 ? "0" + day : day}`,
                    )
                ) {
                    statsForDate++;
                    availableRoomsRequests += userStats.availableRoomsRequests;
                    roomRequests += userStats.roomRequests;
                    roomsListRequests += userStats.roomsListRequests;
                    internalErrors += userStats.internalErrors;
                    uniqueVisitors++;
                }
            });
            processedStats.push({
                date: `${year}-${month.length == 1 ? "0" + month : month}-${day < 10 ? "0" + day : day}`,
                availableRoomsRequests:
                    statsForDate > 0 ? availableRoomsRequests : 0,
                roomRequests: statsForDate > 0 ? roomRequests : 0,
                roomsListRequests: statsForDate > 0 ? roomsListRequests : 0,
                internalErrors: statsForDate > 0 ? internalErrors : 0,
                uniqueVisitors: statsForDate > 0 ? uniqueVisitors : 0,
            });
        });
        // Sorting query stats
        processedStats.sort(compareStatsObjs);

        // Processing user-agent stats to produce objects with the number of each device
        // Use fingerprints to count unique devices accurately
        const OS = {};
        const browsers = {};
        const uniqueFingerprints = new Set();
        
        stats.forEach((userStats) => {
            // Only count each fingerprint once for device stats
            const identifier = userStats.fingerprint || userStats.userId;
            if (!identifier || uniqueFingerprints.has(identifier)) {
                return;
            }
            uniqueFingerprints.add(identifier);
            
            const parsedUserAgent = new UAParser({ Bots });
            parsedUserAgent.setUA(userStats.userAgent);
            let osName, browserName;
            
            // Use the stored isBot field if available, otherwise detect
            const isBotUser = userStats.isBot !== undefined ? userStats.isBot : isBot(parsedUserAgent.getResult());
            
            if (!isBotUser) {
                osName = !parsedUserAgent.getOS().name ? 'Inconnu' : parsedUserAgent.getOS().name;
                browserName = !parsedUserAgent.getBrowser().name ? 'Inconnu' : parsedUserAgent.getBrowser().name;
            } else {
                osName = "Bot";
                browserName = "Bot";
            }
            OS[osName] = Object.keys(OS).includes(osName) ? OS[osName] + 1 : 1;
            browsers[browserName] = Object.keys(browsers).includes(browserName)
                ? browsers[browserName] + 1
                : 1;
        });

        res.status(200).json({
            dailyStats: processedStats,
            monthlyStats: { os: OS, browsers: browsers },
        });
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

router.get("/stats/unique-visitors", async (req, res) => {
    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: "MISSING_QUERIES" });
    }

    // Checking the date parameters validity
    try {
        const startDate = new Date(start).toISOString();
        const endDate = new Date(end).toISOString();
        if (startDate > endDate) {
            throw new Error();
        }
    } catch {
        return res.status(400).json({ error: "INVALID_DATES" });
    }

    try {
        // Getting statistics for the requested days range (includes bots)
        const stats = await Stat.find({
            date: {
                $gte: start,
                $lte: end,
            },
        });

        // Creating an array containing all the dates between start and end
        let days = getDatesRange(new Date(start), new Date(end));
        
        // Counting unique visitors per day using fingerprints
        // This counts ALL visitors including bots but eliminates duplicates better
        const uniqueVisitorsPerDay = {};
        days.forEach((day) => uniqueVisitorsPerDay[day] = 0);
        
        // Use a Set to track unique fingerprints per day
        const fingerprintsPerDay = {};
        days.forEach((day) => fingerprintsPerDay[day] = new Set());
        
        stats.forEach((stat) => {
            // Use fingerprint if available, fallback to userId for backward compatibility
            const identifier = stat.fingerprint || stat.userId;
            if (identifier && !fingerprintsPerDay[stat.date].has(identifier)) {
                fingerprintsPerDay[stat.date].add(identifier);
                uniqueVisitorsPerDay[stat.date] += 1;
            }
        });

        res.status(200).json(uniqueVisitorsPerDay);
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

router.get("/stats/views", async (req, res) => {
    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: "MISSING_QUERIES" });
    }

    // Checking the date parameters validity
    try {
        const startDate = new Date(start).toISOString();
        const endDate = new Date(end).toISOString();
        if (startDate > endDate) {
            throw new Error();
        }
    } catch {
        return res.status(400).json({ error: "INVALID_DATES" });
    }

    try {
        // Getting statistics for the requested days range
        const stats = await Stat.find({
            date: {
                $gte: start,
                $lte: end,
            },
        });

        // Creating an array containing all the dates between start and end
        const days = getDatesRange(new Date(start), new Date(end));
        // Counting views per day
        const viewsPerDay = {};
        days.forEach((day) => (viewsPerDay[day] = 0));
        stats.forEach((stat) => {
            viewsPerDay[stat.date] += stat.roomsListRequests;
        });

        res.status(200).json(viewsPerDay);
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

router.get("/stats/platforms", async (req, res) => {
    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: "MISSING_QUERIES" });
    }

    // Checking the date parameters validity
    try {
        const startDate = new Date(start).toISOString();
        const endDate = new Date(end).toISOString();
        if (startDate > endDate) {
            throw new Error();
        }
    } catch {
        return res.status(400).json({ error: "INVALID_DATES" });
    }

    try {
        // Getting statistics for the requested days range
        const stats = await Stat.find({
            date: {
                $gte: start,
                $lte: end,
            },
        });

        // Creating an array containing all the dates between start and end
        const days = getDatesRange(new Date(start), new Date(end));
        // Counting platforms per day
        const platformsPerDay = {};
        days.forEach((day) => (platformsPerDay[day] = {}));
        stats.forEach((stat) => {
            const parsedUserAgent = new UAParser({ Bots });
            parsedUserAgent.setUA(stat.userAgent);
            let osName = "Bot";
            if (!isBot(parsedUserAgent.getResult())) {
                osName = !parsedUserAgent.getOS().name
                    ? "Inconnu"
                    : parsedUserAgent.getOS().name;
            }
            if (platformsPerDay[stat.date][osName]) {
                platformsPerDay[stat.date][osName] += 1;
            } else {
                platformsPerDay[stat.date][osName] = 1;
            }
        });

        res.status(200).json(platformsPerDay);
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

router.get("/stats/unique-human-visitors", async (req, res) => {
    // Retrieving query parameters
    const start = req.query.start;
    const end = req.query.end;

    // Checking that all the required parameters are present
    if (!start || !end) {
        return res.status(400).json({ error: "MISSING_QUERIES" });
    }

    // Checking the date parameters validity
    try {
        const startDate = new Date(start).toISOString();
        const endDate = new Date(end).toISOString();
        if (startDate > endDate) {
            throw new Error();
        }
    } catch {
        return res.status(400).json({ error: "INVALID_DATES" });
    }

    try {
        // Getting statistics for the requested days range
        // Enhanced filtering: exclude bots AND require actual activity
        // This follows industry standards for unique human visitor counting
        const stats = await Stat.find({
            date: {
                $gte: start,
                $lte: end,
            },
            // Filter out bots using the new isBot field
            isBot: { $ne: true },
            // Require actual engagement (at least one meaningful action)
            $or: [
                { availableRoomsRequests: { $gt: 0 } },
                { roomRequests: { $gt: 0 } },
                { roomsListRequests: { $gt: 0 } }
            ]
        });

        // Creating an array containing all the dates between start and end
        let days = getDatesRange(new Date(start), new Date(end));
        
        // Counting unique human visitors per day using fingerprints
        // This prevents counting the same user multiple times even if they clear cookies
        const uniqueVisitorsPerDay = {};
        days.forEach((day) => uniqueVisitorsPerDay[day] = 0);
        
        // Use a Set to track unique fingerprints per day
        const fingerprintsPerDay = {};
        days.forEach((day) => fingerprintsPerDay[day] = new Set());
        
        stats.forEach((stat) => {
            // Use fingerprint if available, fallback to userId for backward compatibility
            const identifier = stat.fingerprint || stat.userId;
            if (identifier && !fingerprintsPerDay[stat.date].has(identifier)) {
                fingerprintsPerDay[stat.date].add(identifier);
                uniqueVisitorsPerDay[stat.date] += 1;
            }
        });

        res.status(200).json(uniqueVisitorsPerDay);
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error.message})`,
        );
    }
});

export default router;
