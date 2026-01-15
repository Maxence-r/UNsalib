import express, { Request, Response, NextFunction } from "express";

import {
    availableValidation,
    timetableValidation,
} from "../validators/rooms.validator.js";
import { statHandler } from "../middlewares/stats.middleware.js";
import { validationHandler } from "../middlewares/validation.middleware.js";
import { roomsController } from "../controllers/rooms.controller.js";

const router = express.Router();

// Private routes

// GET /new-buildings
// GET /rooms-to-complete

// GET /building/:id
// GET /building/by-campus
// GET /campus/:id
// GET /campus/all
// GET /room/:id
// GET /room/by-building

// PATCH /building/move
// PATCH /room/move

// PATCH /room/:id
// PATCH /building/:id



export { router };
