import express from "express";

import {
    availableValidator,
    timetableValidator,
    roomIdValidator,
    allValidator,
} from "../validators/rooms.validator.js";
import { statHandler } from "../middlewares/stats.middleware.js";
import {
    validateQuery,
    validateParams,
} from "../middlewares/validation.middleware.js";
import { roomsController } from "../controllers/rooms.controller.js";
import { route } from "../utils/middlewares.js";

const router = express.Router();

router.get(
    "/",
    statHandler,
    route().use(validateQuery, allValidator).handle(roomsController.getAll),
);

router.get(
    "/available",
    statHandler,
    route()
        .use(validateQuery, availableValidator)
        .handle(roomsController.getAvailable),
);

router.get(
    "/:roomId/timetable",
    statHandler,
    route()
        .use(validateParams, roomIdValidator)
        .use(validateQuery, timetableValidator)
        .handle(roomsController.getTimetable),
);

export { router };
