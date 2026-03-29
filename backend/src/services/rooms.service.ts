import type { Types, HydratedDocument } from "mongoose";

import { Room, RoomSchemaProperties } from "../models/room.model.js";
import { coursesService } from "./courses.service.js";
import { Building } from "../models/building.model.js";
import { buildingsService } from "./buildings.service.js";

const CIE_CLOSING_DATES = {
    dayNumber: 1,
    startTime: "00:00",
    endTime: "12:15",
};

class RoomsService {
    /**
     * Find all reviewed rooms
     */
    async findAll(): Promise<RoomSchemaProperties[]> {
        return await Room.find({ reviewed: true }).lean();
    }

    // **********************************************************
    // TODO
    // **********************************************************

    /**
     * Find available rooms
     */
    async findAvailable(
        start: string,
        end: string,
        seats: number,
        whiteBoards: number,
        blackBoards: number,
        noBadge: boolean,
        type: "info" | "tp" | "td" | "amphi" | null,
        features: ("visio" | "ilot")[],
    ): Promise<
        (RoomSchemaProperties & { _id: Types.ObjectId; __v: number })[]
    > {
        const overlappingCourses = await coursesService.getOverlappingCourses(
            start,
            end,
        );

        // Getting all busy rooms ids from the courses array
        const busyRoomsIds: string[] = [];
        overlappingCourses.forEach((course) => {
            course.rooms.forEach((room) => {
                if (!busyRoomsIds.includes(room.toString()))
                    busyRoomsIds.push(room.toString());
            });
        });

        // Getting available rooms according to the attributes requested by the user
        const availableRooms = await Room.find({
            _id: { $nin: busyRoomsIds }, // free rooms are those not being used for classes
            banned: { $ne: true },
            seats: { $gte: seats },
            "boards.white": { $gte: whiteBoards },
            "boards.black": { $gte: blackBoards },
            ...(type && { type: type.toUpperCase() }),
            ...(noBadge && { features: { $ne: "badge" } }),
            ...features.map((feature) => {
                return { features: feature };
            }),
        }).lean();

        // Exclude IT rooms during closing hours of CIE buildings
        const startTs = new Date(start).getTime();
        const endTs = new Date(end).getTime();

        const availableRoomsFiltered = availableRooms.filter((room) => {
            if (
                room.building.includes("C I E") &&
                new Date(start).getDay() === CIE_CLOSING_DATES.dayNumber
            ) {
                // Build closing interval for the requested day
                const closingStart = new Date(start);
                const [sh, sm] = CIE_CLOSING_DATES.startTime.split(":");
                closingStart.setHours(Number(sh), Number(sm), 0, 0);

                const closingEnd = new Date(start);
                const [eh, em] = CIE_CLOSING_DATES.endTime.split(":");
                closingEnd.setHours(Number(eh), Number(em), 0, 0);

                const closingStartTs = closingStart.getTime();
                const closingEndTs = closingEnd.getTime();

                // Exclude if requested interval overlaps closing hours
                if (startTs < closingEndTs && endTs > closingStartTs)
                    return false;
            }

            return true;
        });

        return availableRoomsFiltered;
    }

    // **********************************************************
    // END TODO
    // **********************************************************

    async addRoomIfNotExists(
        id: string,
        univName: string,
        buildingId?: string,
    ): Promise<void> {
        const existingRoom = await Room.exists({
            _id: id,
            buildingId: buildingId,
        });
        if (!existingRoom) {
            // Add the room if not found
            const newRoom = new Room({
                _id: id,
                univName: univName,
                buildingId: buildingId,
            });
            await newRoom.save();
        }
    }

    async processRawRoom(rawName: string, campusId: string): Promise<string> {
        // Filter room blocks (e.g: Room A ; Room B)
        if (rawName.includes(" ; ")) throw new Error("Invalid room name");

        if (/\(.*\)$/.test(rawName)) {
            // Raw name correctly formatted: 'roomName (roomBuilding)'
            // Correctly handle dulicates building names like 'roomName (roomBuilding) (roomBuilding)'
            const building = /\(([^)]*)\)$/.exec(rawName)?.[1];
            const room = /^[^(]*(?<! )/.exec(rawName)?.[0].trim() ?? rawName;

            // Test if the building exists in the campus and add it if needed
            if (building) {
                await buildingsService.addBuildigIfNotExists(
                    campusId,
                    building,
                );
            }
            // If the building name detection failed, skip the creation step
            // The room will be an orphan but this is allowed by our model

            // Test if the room exists in the building and add it if needed
            await this.addRoomIfNotExists(rawName, room, building);
        } else {
            // Bad raw name formatting
            // We add the room with its raw name and no building associated
            await this.addRoomIfNotExists(rawName, rawName);
        }

        return rawName;
    }

    /**
     * Move a room to another building
     */
    async moveRoom(
        roomId: Types.ObjectId,
        newBuildingId: Types.ObjectId,
    ): Promise<void> {
        const room = await Room.findById(roomId);
        if (!room) {
            throw new Error("Room not found");
        }

        room.building = newBuildingId;
        await room.save();
    }

    /**
     * Merge two rooms
     */
    async mergeRooms(
        sourceRoomId: Types.ObjectId,
        targetRoomId: Types.ObjectId,
    ): Promise<void> {
        const sourceRoom = await Room.findById(sourceRoomId);
        const targetRoom = await Room.findById(targetRoomId);
        if (!sourceRoom || !targetRoom) {
            throw new Error("Room not found");
        }

        // Update all courses referencing the source room to reference the target room
        const courses = await coursesService.getCourseDocsByRoom(sourceRoomId);
        for (const course of courses) {
            course.rooms = course.rooms.map((roomId) =>
                roomId === sourceRoomId ? targetRoomId : roomId,
            );
            await course.save();
        }

        // Delete the source room
        await sourceRoom.deleteOne();
    }

    /**
     * Get room documents by building
     */
    async getRoomDocsByBuilding(
        buildingId: string,
    ): Promise<HydratedDocument<RoomSchemaProperties>[]> {
        return await Room.find({ buildingId });
    }

    /**
     * Get rooms by building
     */
    async getRoomsByBuilding(
        buildingId: string,
    ): Promise<RoomSchemaProperties[]> {
        return await Room.find({ buildingId }).lean();
    }

    /**
     * Return a room associated with the given ID
     */
    async getRoomById(roomId: string): Promise<RoomSchemaProperties> {
        const room = await Room.findById(roomId).lean();
        if (!room) throw new Error("Room not found");
        return room;
    }
}

const roomsService = new RoomsService();

export { roomsService };
