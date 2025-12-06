import express from "express";
const router = express.Router();
import Room from "../models/room.model.js";
import Course from "../models/course.model.js";
import mongoose from "mongoose";
import {
    isValidDate,
    getWeekInfos,
    getWeeksNumber,
    getMinutesOverflow,
} from "../utils/date.js";
import { updateStats } from "../utils/stats.js";
import { getGroupsFromCoursesList } from "../utils/dbProcessing.js";

const VACATIONS = [52, 1, 8, 16];

router.get("/timetable", async (req, res) => {
    // Retrieving query parameters
    const id = req.query.id;
    const increment = req.query?.increment || 0; // increment = 0 if not specified

    // Checking that all the required parameters are present
    if (!id) {
        return res.status(400).json({ error: "MISSING_QUERIES" });
    }
    // Validating ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "INVALID_ID" });
    }
    // Checking the validity of number parameters
    if (isNaN(increment)) {
        return res.status(400).json({ error: "INVALID_INCREMENT" });
    }
    // Getting information about the requested week and checking its validity
    const requestedWeek = getWeekInfos(getWeeksNumber() + parseInt(increment));
    if (
        requestedWeek.number < 0 ||
        requestedWeek.number > 52 ||
        increment > 18
    ) {
        return res.status(400).json({ error: "INVALID_INCREMENT" });
    }

    try {
        requestedWeek.number = requestedWeek.number.toString();

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
                    notes: "",
                    category: "",
                    duration: 900,
                    overflow: 0,
                    roomId: id,
                    teachers: ["Monsieur Chill"],
                    modules: ["Détente - Vacances"],
                    groups: ["Tout le monde"],
                    color: "#FF7675",
                });
            }

            return res.send({
                courses: vacationCourses,
                weekInfos: requestedWeek,
            });
        }

        // Getting courses based on room id and given period
        const courses = await Course.find({
            rooms: id,
            $and: [
                { start: { $gte: requestedWeek.start } },
                { end: { $lte: requestedWeek.end } },
            ],
        });

        // Getting all groups found in courses as a dictionnary
        const parsedGroups = await getGroupsFromCoursesList(courses);

        // Formatting the response
        const formattedResponse = courses.map((doc) => {
            // Getting duration in ms, convert to h and then to percentage
            const duration =
                ((new Date(doc.end).valueOf() - new Date(doc.start).valueOf()) /
                    1000 /
                    60 /
                    60) *
                100;
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
                color: doc.color,
            };
        });

        res.send({ courses: formattedResponse, weekInfos: requestedWeek });
    } catch (error) {
        res.status(500).json({ error: "INTERNAL_ERROR" });
        void updateStats("internal_errors", req.statsUUID, req.get("User-Agent"));
        console.error(
            `Erreur pendant le traitement de la requête à '${req.url}' (${error as string})`,
        );
    }
});

export default router;
