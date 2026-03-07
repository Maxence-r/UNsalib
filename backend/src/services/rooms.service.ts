import type { Types, HydratedDocument } from "mongoose";

import { Room, RoomSchemaProperties } from "../models/room.model.js";
import { coursesService } from "./courses.service.js";
import { Building } from "../models/building.model.js";

const CIE_CLOSING_DATES = {
    dayNumber: 1,
    startTime: "00:00",
    endTime: "12:15",
};

class RoomsService {
    // **********************************************************
    // TODO
    // **********************************************************

    /**
     * Find all rooms
     */
    async findAll(): Promise<
        (RoomSchemaProperties & { _id: Types.ObjectId })[]
    > {
        return await Room.find({ reviewed: true }).lean();
    }

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

    /**
     * Add a room if it does not exist and return the resulting document ID
     */
    async addRoomIfNotExists(
        rawName: string,
        campusId: Types.ObjectId,
    ): Promise<Types.ObjectId> {
        // Filter room blocks (e.g: Room A ; Room B)
        if (rawName.includes(";")) throw new Error("Invalid room name");

        if (/\(.*\)$/.test(rawName)) {
            // Raw name correctly formatted: 'roomName (roomBuilding)'
            const building = /\(([^)]*)\)$/.exec(rawName)?.[1] || "";
            const room = /^[^(]*(?<! )/.exec(rawName)?.[0].trim() || rawName;

            // Test if the building exists in the campus
            const existingBuilding = await Building.exists({
                univName: building,
                campus: campusId,
            });

            let buildingId = existingBuilding?._id;
            if (!buildingId) {
                // Add the building if not found
                const newBuilding = new Building({
                    univName: building,
                    campus: campusId,
                });
                await newBuilding.save();
                buildingId = newBuilding._id;
            }

            // Test if the room exists
            const existingRoom = await Room.findOne({
                univName: room,
                building: buildingId,
            });

            let roomId = existingRoom?._id;
            if (!roomId) {
                // Add the room if not found
                const newRoom = new Room({
                    univName: room,
                    building: buildingId,
                    univId: rawName,
                });
                await newRoom.save();
                roomId = newRoom._id;
            }

            return roomId;
        } else {
            // Bad raw name formatting
            const existingRoom = await Room.findOne({ univId: rawName });

            if (!existingRoom) {
                const newRoom = new Room({
                    univName: rawName,
                    univId: rawName,
                });
                await newRoom.save();
                return newRoom._id;
            }

            return existingRoom._id;
        }
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
        buildingId: Types.ObjectId,
    ): Promise<HydratedDocument<RoomSchemaProperties>[]> {
        return await Room.find({ building: buildingId });
    }

    /**
     * Return a room associated with the given ID
     */
    async getRoomById(roomId: Types.ObjectId): Promise<RoomSchemaProperties> {
        const room = await Room.findById(roomId).lean();
        if (!room) throw new Error("Room not found");

        return room;
    }
}

const roomsService = new RoomsService();

export { roomsService };
