import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";
import { Types } from "mongoose";

import { roomsService } from "../services/rooms.service.js";
import { buildingsService } from "../services/buildings.service.js";
import { groupsService } from "../services/groups.service.js";
import { coursesService } from "../services/courses.service.js";
import { getWeekInfos } from "../utils/date.js";
import { isLightColor, blendColors, palette } from "../utils/color.js";
import { RoomSchemaProperties } from "models/room.model.js";
import { ApiError } from "middlewares/error.middleware.js";
import { appConfig } from "configs/app.config.js";
import { statsService } from "../services/stats.service.js";
import { usersService } from "services/users.service.js";

class UsersController {
    /**
     * @route   POST /not-a-bot
     * @desc    Mark the user as human
     * @access  Public
     */
    async notABot(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            await usersService.setNotABot(req.userId);

            res.status(200).json({
                success: true,
                data: null,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route   POST /from-qrcode
     * @desc    Mark the user as coming from advertising poster QR codes
     * @access  Public
     */
    async setFromQrCode(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            await usersService.setFromQrCode(req.userId);

            res.status(200).json({
                success: true,
                data: null,
            });
        } catch (error) {
            next(error);
        }
    }
}

const usersController = new UsersController();

export { usersController };
