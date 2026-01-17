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
     * @route   GET /new-buildings
     * @desc    Find new buildings
     * @access  Private
     **/
    async findNewBuildings(req: Request, res: Response, next: NextFunction): Promise<void> {
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
     * @route   GET /rooms-to-complete
     * @desc    Find rooms to complete (rooms without building)
     * @access  Private
     **/
    async findRoomsToComplete(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            res.json({ success: true, data: await Room.find({ type: "" }) });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route  GET /building/:id
     * @desc   Return building by id
     * @access Private
     **/
    async getBuildingById(req: Request, res: Response, next: NextFunction): Promise<void> {
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
     * @route  GET /buildings/by-campus
     * @desc   Return buildings by campus id
     * @access Private
     **/
    async getBuildingsByCampusId(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
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
     * @route  GET /campus/:id
     * @desc   Return campus by id
     * @access Private
     **/
    async getCampusById(req: Request, res: Response, next: NextFunction): Promise<void> {
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
     * @route  GET /campus/all
     * @desc   Return all campuses
     * @access Private
     **/
    async getAllCampuses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const campuses = await Campus.find();
            res.json({ success: true, data: campuses });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route  GET /room/:id
     * @desc   Return room by id
     * @access Private
     **/
    async getRoomById(req: Request, res: Response, next: NextFunction): Promise<void> {
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
     * @route  GET /room/by-building
     * @desc   Return rooms by building id
     * @access Private
     **/
    async getRoomsByBuildingId(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const buildingId = matchedData(req).buildingId;
            const rooms = await Room.find({ building: buildingId });
            res.json({ success: true, data: rooms });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route  PATCH /building/move
     * @desc   Move building to another campus
     * @access Private
     **/
    async moveBuilding(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { buildingId, newCampusId } = matchedData(req);
            const building = await Building.findById(buildingId);
            if (!building) {
                throw new Error("Building not found");
            }
            await buildingsService.moveBuilding(
                buildingId as Types.ObjectId,
                newCampusId as Types.ObjectId,
            );
            res.json({ success: true, data: building });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route  PATCH /room/move
     * @desc   Move room to another building
     * @access Private
     **/
    async moveRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { roomId, newBuildingId } = matchedData(req);
            await roomsService.moveRoom(
                roomId as Types.ObjectId,
                newBuildingId as Types.ObjectId,
            );
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }

    /**
     * @route  PATCH /building/:id
     * @desc   Update building details
     * @access Private
     */
    async updateBuildingDetails(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            const { buildingId, details } = matchedData(req);
            const building = await Building.findById(buildingId);
            if (!building) {
                throw new Error("Building not found");
            }
            Object.assign(building, details);
            await building.save();
            res.json({ success: true, data: building });
        } catch (error) {
            next(error);
        }
    }
    
    /**
     * @route  PATCH /room/:id
     * @desc   Update room details
     * @access Private
     */
    async updateRoomDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
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

    /**
     * @route  POST /building/merge
     * @desc   Merge two buildings
     * @access Private
     **/
    async mergeBuildings(req: Request, res: Response, next: NextFunction): Promise<void> {
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
     * @route  POST /room/merge
     * @desc   Merge two rooms
     * @access Private
     **/
    async mergeRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { sourceRoomId, targetRoomId } = matchedData(req);
            await roomsService.mergeRooms(
                sourceRoomId as Types.ObjectId,
                targetRoomId as Types.ObjectId,
            );
            res.json({ success: true });
        } catch (error) {
            next(error);
        }
    }
}

const adminController = new AdminController();

export { adminController };
