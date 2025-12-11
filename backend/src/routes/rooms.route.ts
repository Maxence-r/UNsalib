import express, { Request, Response, NextFunction } from "express";

import {
    availableValidation,
    timetableValidation,
} from "../validators/rooms.validator.js";
import { statHandler } from "../middlewares/stats.middleware.js";
import { errorHandler } from "../middlewares/error.middleware.js";
import { validationHandler } from "../middlewares/validation.middleware.js";
import { roomsController } from "../controllers/rooms.controller.js";

const router = express.Router();

// Public routes
router.get(
    "/",
    statHandler,
    errorHandler,
    (req: Request, res: Response, next: NextFunction) =>
        roomsController.getAll(req, res, next),
);
router.get(
    "/available",
    availableValidation,
    validationHandler,
    statHandler,
    errorHandler,
    (req: Request, res: Response, next: NextFunction) =>
        roomsController.getAvailable(req, res, next),
);
router.get(
    "/timetable",
    timetableValidation,
    validationHandler,
    statHandler,
    errorHandler,
    (req: Request, res: Response, next: NextFunction) =>
        roomsController.getTimetable(req, res, next),
);

export { router };
