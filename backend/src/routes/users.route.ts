import express, { Request, Response, NextFunction } from "express";

import { usersController } from "controllers/users.controller.js";
import { statHandler } from "../middlewares/stats.middleware.js";

const router = express.Router();

// Public routes
router.post(
    "/not-a-bot",
    statHandler,
    (req: Request, res: Response, next: NextFunction) =>
        usersController.notABot(req, res, next),
);

export { router };
