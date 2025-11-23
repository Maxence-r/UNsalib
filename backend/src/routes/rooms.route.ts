import express, { Request, Response, NextFunction } from "express";

import { availableValidation } from "validators/rooms.validator.js";
import { validationHandler } from "middlewares/validation.middleware.js";
import { roomsController } from "controllers/rooms.controller.js";

const router = express.Router();

// Public routes
router.get(
    "/available",
    availableValidation,
    validationHandler,
    (req: Request, res: Response, next: NextFunction) =>
        roomsController.getAvailable(req, res, next),
);

export { router };
