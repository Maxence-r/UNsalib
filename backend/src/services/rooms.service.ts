import type { Types } from "mongoose";

import { Course } from "../models/course.js";
import { Room, RoomSchemaProperties } from "../models/room.js";

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
        // Recherche de tous les cours qui débordent sur la période demandée selon 4 cas :
        //
        // CAS 1 : Le cours englobe complètement la période
        // Cours       |--------------------|
        // Demande         |-----------|
        //
        // CAS 2 : Le cours est englobé par la période
        // Cours           |-----------|
        // Demande     |--------------------|
        //
        // CAS 3 : Le cours chevauche le début de la période
        // Cours       |-----------|
        // Demande         |-----------|
        //
        // CAS 4 : Le cours chevauche la fin de la période
        // Cours           |-----------|
        // Demande     |-----------|
        //
        const courses = await Course.find({
            $and: [
                { start: { $lt: end } }, // le cours commence avant la fin de la période demandée
                { end: { $gt: start } }, // le cours finit après le début de la période demandée
            ],
        });

        // Getting all busy rooms ids from the courses array
        const busyRoomsIds: string[] = [];
        courses.forEach((course) => {
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
}

const roomsService = new RoomsService();

export { roomsService };
