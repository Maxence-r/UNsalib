import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";
import { Types } from "mongoose";

import { roomsService } from "../services/rooms.service.js";
import { buildingsService } from "../services/buildings.service.js";
import { groupsService } from "../services/groups.service.js";
import { coursesService } from "../services/courses.service.js";
import { getWeekInfos } from "../utils/date.js";
import { getAccessibleForegroundColor, palette } from "../utils/color.js";
import { RoomSchemaProperties } from "../models/room.model.js";
import { ApiError } from "../middlewares/error.middleware.js";
import { appConfig } from "../configs/app.config.js";
import { statsService } from "../services/stats.service.js";

class RoomsController {
    /**
     * @route   GET /
     * @desc    Return all rooms
     * @access  Public
     */
    async getAll(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            // Getting validated queries
            const { campusId } = matchedData<{ campusId: string }>(req);
            const buildings =
                await buildingsService.getBuildingsByCampus(campusId);

            const rooms: {
                id: string;
                name: string;
                buildingName: string;
                features: string[];
                locked: boolean;
            }[] = [];
            for (const building of buildings) {
                const buildingRooms = await roomsService.getRoomsByBuilding(
                    building._id,
                    !appConfig.isDevMode,
                );

                for (const room of buildingRooms) {
                    rooms.push({
                        id: room._id,
                        // replace name with alias if present
                        name: room.alias ?? room.name,
                        buildingName: building.alias ?? building._id,
                        features: room.features,
                        locked: room.locked,
                    });
                }
            }

            // Add stat asynchronously to not slow down the request processing
            void statsService.addNew(req.userId, "list", campusId, new Date());

            res.status(200).json({
                success: true,
                data: rooms,
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
            const data = matchedData<{
                campusid: string;
                start: Date;
                end: Date;
                seats?: number;
                whiteboards?: number;
                blackboards?: number;
                includebadge?: boolean;
                type?: "info" | "tp" | "td" | "amphi";
                visio?: boolean;
                ilot?: boolean;
            }>(req);

            const result = await roomsService.findAvailable(
                data.campusid,
                data.start,
                data.end,
                data.seats ?? 0,
                data.whiteboards ?? 0,
                data.blackboards ?? 0,
                data.includebadge ?? false,
                data.type ?? null,
                data.visio ?? null,
                data.ilot ?? null,
            );

            // Add stat asynchronously to not slow down the request processing
            void statsService.addNew(
                req.userId,
                "search",
                data.campusid,
                new Date(),
            );

            res.status(200).json({
                success: true,
                data: result.map((doc) => doc._id),
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
            const data = matchedData<{
                roomId: string;
                weekNumber: number;
            }>(req);

            const weekInfos = getWeekInfos(data.weekNumber);

            if (
                !appConfig.isDevMode &&
                !(await roomsService.existsAndIsReviewed(data.roomId))
            ) {
                throw new ApiError(400, "Unknown room");
            }

            const result = await coursesService.getTimetable(
                data.roomId,
                weekInfos.start,
                weekInfos.end,
            );

            // Formatting the response
            const formattedResponse = result.map((c) => {
                const color = palette[c.colorId as keyof typeof palette];
                const accessibleOnColor = getAccessibleForegroundColor(color);

                return {
                    courseId: c._id,
                    start: c.start,
                    end: c.end,
                    category: c.category,
                    teachers: c.teachers,
                    modules: c.modules,
                    groups: c.groupIds,
                    color,
                    onColor: "#ffffff",
                    accessibleOnColor,
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

            // Add stat asynchronously to not slow down the request processing
            void statsService.addNew(
                req.userId,
                "timetable",
                (await roomsService.getCampusId(data.roomId)) ?? "unknown",
                new Date(),
            );

            res.status(200).json({
                success: true,
                data: { courses: formattedResponse, weekInfos: weekInfos },
            });
        } catch (error) {
            next(error);
        }
    }
}

const roomsController = new RoomsController();

export { roomsController };
