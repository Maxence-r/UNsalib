import type { Types } from "mongoose";

import { Room, RoomSchemaProperties } from "../models/room.model.js";
import { coursesService } from "./courses.service.js";
import { Building } from "models/building.model.js";

const CIE_CLOSING_DATES = {
    dayNumber: 1,
    startTime: "00:00",
    endTime: "12:15",
};

class RoomsService {
    /**
     * Find all rooms
     */
    async findAll(): Promise<
        (RoomSchemaProperties & { _id: Types.ObjectId; __v: number })[]
    > {
        // Getting all the rooms that are not banned
        return await Room.find({ banned: { $ne: true } }).lean();
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
        const overlappingCourses = await coursesService.getOverlappingCourses(start, end);

        // Getting all busy rooms ids from the courses array
        const busyRoomsIds: string[] = [];
        overlappingCourses.forEach((course) => {
            course.rooms.forEach((room) => {
                if (!busyRoomsIds.includes(room)) busyRoomsIds.push(room);
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

    /**
     * Add a room if it does not exist
     */
    async addRoomIfNotExists(rawName: string, campusId: Types.ObjectId) {
        if (rawName.includes(";")) throw new Error("Invalid room name");
        if (/\(.*\)$/.test(rawName)){
            const building = /\(([^)]*)\)$/.exec(rawName)?.[1] || "";
            const room = /^[^(]*(?<! )/.exec(rawName)?.[0].trim() || rawName;
            // Test if the building exists in the campus
            const existingBuilding = await Building.findOne({ univName: building });
            if (existingBuilding) {
                const existingRoom = await Room.findOne({ name: room, building: existingBuilding._id });
                if (!existingRoom) {
                    const newRoom = new Room({
                        name: room,
                        building: existingBuilding._id,
                        univId: rawName,
                    });
                    await newRoom.save();
                    return newRoom;
                }
                return existingRoom;
            } else {
                const newBuilding = new Building({
                    univName: building,
                    campus: campusId,
                });
                await newBuilding.save();

                const newRoom = new Room({
                    name: room,
                    building: newBuilding._id,
                    univId: rawName,
                });
                await newRoom.save();
                return newRoom;
            }
        } else {
            const existingRoom = await Room.findOne({ univId: rawName });
            if (!existingRoom) {
                const newRoom = new Room({
                    name: rawName,
                    univId: rawName,
                });
                await newRoom.save();
                return newRoom;
            }
            return existingRoom;
        }
    }

    /**
     * Move room to another building
     */
    async moveRoom(roomId: Types.ObjectId, newBuildingId: Types.ObjectId) {
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
    async mergeRooms(sourceRoomId: Types.ObjectId, targetRoomId: Types.ObjectId) {
        const sourceRoom = await Room.findById(sourceRoomId);
        const targetRoom = await Room.findById(targetRoomId);
        if (!sourceRoom || !targetRoom) {
            throw new Error("Room not found");
        }
        // Update all courses referencing the source room to reference the target room
        const courses = await coursesService.getCoursesByRoom(sourceRoomId);
        for (const course of courses) {
            course.rooms = course.rooms.map((roomId) =>
                roomId.toString() === sourceRoomId.toString() ? targetRoomId : roomId,
            );
            await course.save();
        }

        // Delete the source room
        await Room.findByIdAndDelete(sourceRoomId);
    }
}

const roomsService = new RoomsService();

export { roomsService };
