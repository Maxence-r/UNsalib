import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";

import { roomsService } from "services/rooms.service.js";
import { groupsService } from "services/groups.service.js";
import {
    getWeekInfos,
    getWeeksNumber,
    getMinutesOverflow,
} from "utils/date.js";

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
                name: doc.name,
                alias: doc.alias,
                building: doc.building,
                available: doc.available,
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

            const result = await roomsService.getTimetable(
                data.id,
                increment.start,
                increment.end,
            );

            // Getting all groups found in courses as a dictionnary
            const parsedGroups = await groupsService.getFromCourses(result);

            // Formatting the response
            const formattedResponse = result.map((doc) => {
                // Getting duration in ms, convert to h and then to percentage
                const duration =
                    ((new Date(doc.end).valueOf() -
                        new Date(doc.start).valueOf()) /
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
