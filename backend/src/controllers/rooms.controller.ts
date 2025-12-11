import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";

import { roomsService } from "../services/rooms.service.js";
import { groupsService } from "../services/groups.service.js";
import { coursesService } from "../services/courses.service.js";
import { getWeekInfos, getWeeksNumber } from "../utils/date.js";
import { hexToRgb, isLightColor, rgbToHex, blend } from "../utils/color.js";

class RoomsController {
    /**
     * @route   GET /
     * @desc    Return all rooms with their availability status
     * @access  Public
     */
    async getAll(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const result = await roomsService.findAll();

            // Formatting the response
            const formattedResponse = result.map((doc) => ({
                id: doc._id,
                name: doc.alias ? doc.alias : doc.name, // replace name with alias if present
                building: doc.building,
                features: doc.features,
            }));

            res.status(200).json({
                success: true,
                data: formattedResponse,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /available
     * @desc    Return available rooms
     * @access  Public
     */
    async getAvailable(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            // Getting validated queries
            const data: {
                start: string;
                end: string;
                seats?: number;
                whiteboards?: number;
                blackboards?: number;
                nobadge?: boolean;
                type?: "info" | "tp" | "td" | "amphi" | null;
                features?: ("visio" | "ilot")[];
            } = matchedData(req);

            const result = await roomsService.findAvailable(
                data.start,
                data.end,
                data.seats ?? 0,
                data.whiteboards ?? 0,
                data.blackboards ?? 0,
                data.nobadge ?? false,
                data.type ?? null,
                data.features ?? [],
            );

            // Formatting the response
            const formattedResponse = result.map((doc) => ({
                id: doc._id,
                name: doc.name,
                alias: doc.alias,
                building: doc.building,
                available: true,
                features: doc.features,
            }));

            res.status(200).json({
                success: true,
                data: formattedResponse,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   GET /timetable
     * @desc    Return a room's timetable
     * @access  Public
     */
    async getTimetable(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            // Getting validated queries
            const data: {
                id: string;
                increment?: {
                    start: string;
                    end: string;
                    number: number;
                };
            } = matchedData(req);

            let increment = getWeekInfos(getWeeksNumber());
            if (data.increment) increment = data.increment;

            const result = await coursesService.getTimetable(
                data.id,
                increment.start,
                increment.end,
            );

            // Getting all groups found in courses as a dictionnary
            const parsedGroups = await groupsService.getFromCourses(result);

            // Formatting the response
            const formattedResponse = result.map((doc) => {
                let onColor = "#ffffff";
                if (doc.color) {
                    const bgColor = hexToRgb(doc.color);
                    const blackMask = { r: 0, g: 0, b: 0 };
                    const whiteMask = { r: 255, g: 255, b: 255 };

                    if (isLightColor(bgColor)) {
                        onColor = rgbToHex(blend(bgColor, blackMask, 0.1));
                    } else {
                        onColor = rgbToHex(blend(bgColor, whiteMask, 0.1));
                    }
                }

                return {
                    courseId: doc._id,
                    start: doc.start,
                    end: doc.end,
                    notes: doc.notes,
                    category: doc.category,
                    roomId: doc.rooms,
                    teachers: doc.teachers,
                    modules: doc.modules,
                    groups: doc.groups.map((group) => parsedGroups[group]),
                    color: doc.color,
                    onColor: onColor,
                };
            });

            // TODO: Vacations
            // if (VACATIONS.includes(requestedWeek.number)) {
            //     const vacationCourses = [];
            //     const startDate = new Date(requestedWeek.start);

            //     for (let i = 0; i < 5; i++) {
            //         const start = new Date(startDate);
            //         start.setDate(start.getDate() + i);
            //         start.setHours(8, 0, 0, 0);
            //         const end = new Date(start);
            //         end.setHours(17, 0, 0, 0);

            //         vacationCourses.push({
            //             courseId: `vacances-${i}`,
            //             start: start.toISOString(),
            //             end: end.toISOString(),
            //             notes: "",
            //             category: "",
            //             duration: 900,
            //             overflow: 0,
            //             roomId: id,
            //             teachers: ["Monsieur Chill"],
            //             modules: ["Détente - Vacances"],
            //             groups: ["Tout le monde"],
            //             color: "#FF7675",
            //         });
            //     }

            //     return res.send({
            //         courses: vacationCourses,
            //         weekInfos: requestedWeek,
            //     });
            // }

            res.status(200).json({
                success: true,
                data: { courses: formattedResponse, weekInfos: increment },
            });
        } catch (error) {
            next(error);
        }
    }
}

const roomsController = new RoomsController();

export { roomsController };
