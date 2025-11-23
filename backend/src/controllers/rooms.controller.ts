import { roomsService } from "services/rooms.service.js";
import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";

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
}

const roomsController = new RoomsController();

export { roomsController };
