import type { Request, Response } from "express";

import { roomsService } from "../services/rooms.service.js";
import { buildingsService } from "../services/buildings.service.js";
import { coursesService } from "../services/courses.service.js";
import { getWeekInfos } from "../utils/date.js";
import { getAccessibleForegroundColor, palette } from "../utils/color.js";
import { appConfig } from "../configs/app.config.js";
import { statsService } from "../services/stats.service.js";
import type { ValidatedFields } from "../middlewares/validation.middleware.js";
import type {
    allValidator,
    availableValidator,
    roomIdValidator,
    timetableValidator,
} from "../validators/rooms.validator.js";
import { ApiError } from "../utils/errors.js";
import { sendSuccessResponse } from "../utils/express/controller.js";

class RoomsController {
    constructor() {
        this.getAll = this.getAll.bind(this);
        this.getAvailable = this.getAvailable.bind(this);
        this.getTimetable = this.getTimetable.bind(this);
    }

    /**
     * Return all rooms
     */
    async getAll(
        req: Request & ValidatedFields<typeof allValidator>,
        res: Response,
    ): Promise<void> {
        const buildings = await buildingsService.getAllBuildings(
            req.validated.campusId,
        );

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
        void statsService.addNew(
            req.userId,
            "list",
            req.validated.campusId,
            new Date(),
        );

        sendSuccessResponse(res, 200, rooms);
    }

    /**
     * Return available rooms
     */
    async getAvailable(
        req: Request & ValidatedFields<typeof availableValidator>,
        res: Response,
    ): Promise<void> {
        const result = await roomsService.findAvailable(
            req.validated.campusId,
            req.validated.start,
            req.validated.end,
            req.validated.seats ?? 0,
            req.validated.whiteBoards ?? 0,
            req.validated.blackBoards ?? 0,
            req.validated.includeBadge ?? false,
            req.validated.type ?? null,
            req.validated.visio ?? null,
            req.validated.ilot ?? null,
        );

        // Add stat asynchronously to not slow down the request processing
        void statsService.addNew(
            req.userId,
            "search",
            req.validated.campusId,
            new Date(),
        );

        sendSuccessResponse(
            res,
            200,
            result.map((doc) => doc._id),
        );
    }

    /**
     * Return a room's timetable
     */
    async getTimetable(
        req: Request &
            ValidatedFields<typeof timetableValidator & typeof roomIdValidator>,
        res: Response,
    ): Promise<void> {
        const weekInfos = getWeekInfos(req.validated.weekNumber);

        if (
            !appConfig.isDevMode &&
            !(await roomsService.existsAndIsReviewed(req.validated.roomId))
        ) {
            throw new ApiError(400, "Unknown room");
        }

        const result = await coursesService.getTimetable(
            req.validated.roomId,
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
            (await roomsService.getCampusId(req.validated.roomId)) ?? "unknown",
            new Date(),
        );

        sendSuccessResponse(res, 200, {
            courses: formattedResponse,
            weekInfos: weekInfos,
        });
    }
}

const roomsController = new RoomsController();

export { roomsController };
