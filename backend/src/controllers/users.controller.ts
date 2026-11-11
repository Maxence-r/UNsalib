import type { Request, Response, NextFunction } from "express";

import { usersService } from "../services/users.service.js";

class UsersController {
    constructor() {
        this.notABot = this.notABot.bind(this);
        this.setFromQrCode = this.setFromQrCode.bind(this);
    }

    /**
     * Mark the user as human
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
     * Mark the user as coming from advertising poster QR codes
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
