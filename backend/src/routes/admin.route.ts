import express, { Request, Response, NextFunction } from "express";

import { adminController } from "../controllers/admin.controller.js";
import {
    getBuildingByIdValidation,
    getBuildingsByCampusIdValidation,
    getRoomByIdValidation,
    getRoomsByBuildingIdValidation,
    getCampusByIdValidation,
    moveBuildingValidation,
    moveRoomValidation,
    updateBuildingValidation,
    updateRoomValidation,
    mergeBuildingsValidation,
    mergeRoomsValidation,
} from "../validators/admin.validator.js";

const router = express.Router();

// Private routes

// GET /new-buildings
router.get(
    "/new-buildings",
    (req: Request, res: Response, next: NextFunction) =>
        adminController.findNewBuildings(req, res, next),
);
// GET /rooms-to-complete
router.get(
    "/rooms-to-complete",
    (req: Request, res: Response, next: NextFunction) =>
        adminController.findRoomsToComplete(req, res, next),
);

// GET /building/:id
router.get(
    "/building/:buildingId",
    getBuildingByIdValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.getBuildingById(req, res, next),
);
// GET /building/by-campus
router.get(
    "/building/by-campus",
    getBuildingsByCampusIdValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.getBuildingsByCampusId(req, res, next),
);
// GET /campus/:id
router.get(
    "/campus/:campusId",
    getCampusByIdValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.getCampusById(req, res, next),
);
// GET /campus/all
router.get(
    "/campus/all",
    (req: Request, res: Response, next: NextFunction) =>
        adminController.getAllCampuses(req, res, next),
);
// GET /room/:id
router.get(
    "/room/:roomId",
    getRoomByIdValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.getRoomById(req, res, next),
);
// GET /room/by-building
router.get(
    "/room/by-building",
    getRoomsByBuildingIdValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.getRoomsByBuildingId(req, res, next),
);

// PATCH /building/move
router.patch(
    "/building/move",
    moveBuildingValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.moveBuilding(req, res, next),
);
// PATCH /room/move
router.patch(
    "/room/move",
    moveRoomValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.moveRoom(req, res, next),
);

// PATCH /room/:id
router.patch(
    "/room/:roomId",
    updateRoomValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.updateRoomDetails(req, res, next),
);
// PATCH /building/:id
router.patch(
    "/building/:buildingId",
    updateBuildingValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.updateBuildingDetails(req, res, next),
);

// POST /building/merge
router.post(
    "/building/merge",
    mergeBuildingsValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.mergeBuildings(req, res, next),
);
// POST /room/merge
router.post(
    "/room/merge",
    mergeRoomsValidation,
    (req: Request, res: Response, next: NextFunction) =>
        adminController.mergeRooms(req, res, next),
);

export { router };
