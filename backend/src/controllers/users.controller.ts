import { Request, Response, NextFunction } from "express";

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
