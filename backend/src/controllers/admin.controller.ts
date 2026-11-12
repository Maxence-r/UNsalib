import type { Request, Response } from "express";
// import { matchedData } from "express-validator";
import { Types } from "mongoose";

import { Campus } from "../models/campus.model.js";
import { Building } from "../models/building.model.js";
import { Room } from "../models/room.model.js";
import { buildingsService } from "../services/buildings.service.js";
import { roomsService } from "../services/rooms.service.js";
import type { AuthenticatedFields } from "../middlewares/auth.middleware.js";
import { sendSuccessResponse } from "../utils/express/controller.js";

class AdminController {
    constructor() {
        this.findRoomsToComplete = this.findRoomsToComplete.bind(this);
    }

    /**
     * Find rooms that need to be completed
     **/
    async findRoomsToComplete(
        _req: Request & AuthenticatedFields,
        res: Response,
    ): Promise<void> {
        const roomsNotReviewed = await roomsService.findNotReviewed();

        sendSuccessResponse(
            res,
            200,
            roomsNotReviewed.map((r) => ({
                id: r._id,
                buildingId: r.buildingId,
                name: r.name,
                alias: r.alias,
                seats: r.seats,
                type: r.type,
                whiteBoards: r.whiteBoards,
                blackBoards: r.blackBoards,
                displays: r.displays,
                locked: r.locked,
                features: r.features,
            })),
        );
    }

    // /**
    //  * @route  GET /campus/:id
    //  * @desc   Return campus by id
    //  * @access Private
    //  **/
    // async getCampusById(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction,
    // ): Promise<void> {
    //     try {
    //         const campusId = matchedData(req).campusId;
    //         const campus = await Campus.findById(campusId);
    //         if (!campus) {
    //             throw new Error("Campus not found");
    //         }
    //         res.json({ success: true, data: campus });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // /**
    //  * @route  GET /campus/all
    //  * @desc   Return all campuses
    //  * @access Private
    //  **/
    // async getAllCampuses(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction,
    // ): Promise<void> {
    //     try {
    //         const campuses = await Campus.find();
    //         res.json({ success: true, data: campuses });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // /**
    //  * @route  GET /room/:id
    //  * @desc   Return room by id
    //  * @access Private
    //  **/
    // async getRoomById(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction,
    // ): Promise<void> {
    //     try {
    //         const roomId = matchedData(req).roomId;
    //         const room = await Room.findById(roomId);
    //         if (!room) {
    //             throw new Error("Room not found");
    //         }
    //         res.json({ success: true, data: room });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // /**
    //  * @route  GET /room/by-building
    //  * @desc   Return rooms by building id
    //  * @access Private
    //  **/
    // async getRoomsByBuildingId(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction,
    // ): Promise<void> {
    //     try {
    //         const buildingId = matchedData(req).buildingId;
    //         const rooms = await Room.find({ building: buildingId });
    //         res.json({ success: true, data: rooms });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // /**
    //  * @route  PATCH /room/move
    //  * @desc   Move room to another building
    //  * @access Private
    //  **/
    // async moveRoom(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction,
    // ): Promise<void> {
    //     try {
    //         const { roomId, newBuildingId } = matchedData(req);
    //         await roomsService.moveRoom(
    //             roomId as Types.ObjectId,
    //             newBuildingId as Types.ObjectId,
    //         );
    //         res.json({ success: true });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    // /**
    //  * @route  PATCH /room/:id
    //  * @desc   Update room details
    //  * @access Private
    //  */
    // async updateRoomDetails(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction,
    // ): Promise<void> {
    //     try {
    //         const { roomId, details } = matchedData(req);
    //         const room = await Room.findById(roomId);
    //         if (!room) {
    //             throw new Error("Room not found");
    //         }
    //         Object.assign(room, details);
    //         await room.save();
    //         res.json({ success: true, data: room });
    //     } catch (error) {
    //         next(error);
    //     }
    // }

    

    // /**
    //  * @route  POST /room/merge
    //  * @desc   Merge two rooms
    //  * @access Private
    //  **/
    // async mergeRooms(
    //     req: Request,
    //     res: Response,
    //     next: NextFunction,
    // ): Promise<void> {
    //     try {
    //         const { sourceRoomId, targetRoomId } = matchedData(req);
    //         await roomsService.mergeRooms(
    //             sourceRoomId as Types.ObjectId,
    //             targetRoomId as Types.ObjectId,
    //         );
    //         res.json({ success: true });
    //     } catch (error) {
    //         next(error);
    //     }
    // }
}

const adminController = new AdminController();

export { adminController };
