import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";

import { Campus } from "models/campus.model.js";
import { Building } from "../models/building.model.js";
import { Room } from "../models/room.model.js";
import { buildingsService } from "../services/buildings.service.js";
import { roomsService } from "../services/rooms.service.js";
import { Types } from "mongoose";

class AdminController {
    /**
     * Find new buildings
     **/
    async findNewBuildings(req: Request, res: Response, next: NextFunction) {
        try {
            res.json({
                success: true,
                data: await Building.find({ isNew: true }),
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Find rooms to complete (rooms without building)
     **/
    async findRoomsToComplete(req: Request, res: Response, next: NextFunction) {
        try {
            res.json({ success: true, data: await Room.find({ type: "" }) });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Return building by id
     **/
    async getBuildingById(req: Request, res: Response, next: NextFunction) {
        try {
            const buildingId = matchedData(req).buildingId;
            const building = await Building.findById(buildingId);
            if (!building) {
                throw new Error("Building not found");
            }
            res.json({ success: true, data: building });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Return buildings by campus id
     **/
    async getBuildingsByCampusId(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const campusId = matchedData(req).campusId;
            const buildings = await Building.find({ campus: campusId });
            if (!buildings) {
                throw new Error("Buildings not found");
            }
            res.json({ success: true, data: buildings });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Return campus by id
     **/
    async getCampusById(req: Request, res: Response, next: NextFunction) {
        try {
            const campusId = matchedData(req).campusId;
            const campus = await Campus.findById(campusId);
            if (!campus) {
                throw new Error("Campus not found");
            }
            res.json({ success: true, data: campus });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Return all campuses
     **/
    async getAllCampuses(req: Request, res: Response, next: NextFunction) {
        try {
            const campuses = await Campus.find();
            res.json({ success: true, data: campuses });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Return room by id
     **/
    async getRoomById(req: Request, res: Response, next: NextFunction) {
        try {
            const roomId = matchedData(req).roomId;
            const room = await Room.findById(roomId);
            if (!room) {
                throw new Error("Room not found");
            }
            res.json({ success: true, data: room });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Return rooms by building id
     **/
    async getRoomsByBuildingId(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const buildingId = matchedData(req).buildingId;
            const rooms = await Room.find({ building: buildingId });
            res.json({ success: true, data: rooms });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Move building to another campus
     **/
    async moveBuilding(req: Request, res: Response, next: NextFunction) {
        try {
            const { buildingId, newCampusId } = matchedData(req);
            const building = await Building.findById(buildingId);
            if (!building) {
                throw new Error("Building not found");
            }
            building.campus = newCampusId as Types.ObjectId;
            await building.save();
            res.json({ success: true, data: building });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Merge two buildings
     **/
    async mergeBuildings(req: Request, res: Response, next: NextFunction) {
        try {
            const { sourceBuildingId, targetBuildingId } = matchedData(req);
            await buildingsService.mergeBuildings(
                sourceBuildingId as Types.ObjectId,
                targetBuildingId as Types.ObjectId,
            );
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Move room to another building
     **/
    async moveRoom(req: Request, res: Response, next: NextFunction) {
        try {
            const { roomId, newBuildingId } = matchedData(req);
            await roomsService.moveRoom(roomId as Types.ObjectId, newBuildingId as Types.ObjectId);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Merge two rooms
     **/
    async mergeRooms(req: Request, res: Response, next: NextFunction) {
        try {
            const { sourceRoomId, targetRoomId } = matchedData(req);
            await roomsService.mergeRooms(sourceRoomId as Types.ObjectId, targetRoomId as Types.ObjectId);
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Update room details
     */
    async updateRoomDetails(req: Request, res: Response, next: NextFunction) {
        try {
            const { roomId, details } = matchedData(req);
            const room = await Room.findById(roomId);
            if (!room) {
                throw new Error("Room not found");
            }
            Object.assign(room, details);
            await room.save();
            res.json({ success: true, data: room });
        } catch (error) {
            next(error);
        }
    }
}

const adminController = new AdminController();

export { adminController };
