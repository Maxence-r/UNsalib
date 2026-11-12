import type { Request, Response } from "express";

import { usersService } from "../services/users.service.js";
import { sendSuccessResponse } from "../utils/express/controller.js";

class UsersController {
    constructor() {
        this.notABot = this.notABot.bind(this);
        this.setFromQrCode = this.setFromQrCode.bind(this);
    }

    /**
     * Mark the user as human
     */
    async notABot(req: Request, res: Response): Promise<void> {
        await usersService.setNotABot(req.userId);

        sendSuccessResponse(res, 200);
    }

    /**
     * Mark the user as coming from advertising poster QR codes
     */
    async setFromQrCode(req: Request, res: Response): Promise<void> {
        await usersService.setFromQrCode(req.userId);

        sendSuccessResponse(res, 200);
    }
}

const usersController = new UsersController();

export { usersController };
