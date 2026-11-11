import express from "express";

import {
    availableValidator,
    timetableValidator,
    roomIdValidator,
    allValidator,
} from "../validators/rooms.validator.js";
import { statHandler } from "../middlewares/stats.middleware.js";
import { withValidated } from "../middlewares/validation.middleware.js";
import { roomsController } from "../controllers/rooms.controller.js";

const router = express.Router();

router.get(
    "/",
    statHandler,
    withValidated(roomsController.getAll, { query: allValidator }),
);

router.get(
    "/available",
    statHandler,
    withValidated(roomsController.getAvailable, { query: availableValidator }),
);

router.get(
    "/:roomId/timetable",
    statHandler,
    withValidated(roomsController.getTimetable, {
        params: roomIdValidator,
        query: timetableValidator,
    }),
);

export { router };
